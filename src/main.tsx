import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { safeStorage } from './utils/safeStorage';

// Override global localStorage to ensure 100% in-memory operation (no persistent local storage)
if (typeof window !== 'undefined') {
  try {
    Object.defineProperty(window, 'localStorage', {
      value: safeStorage,
      writable: true,
      configurable: true
    });
  } catch (e) {
    (window as any).localStorage = safeStorage;
  }
}

const localStorage = safeStorage;

// Silence expected, benign WebSocket and Vite HMR connection errors during development
const shouldMute = (msg: string) => {
  const lowMsg = String(msg || '').toLowerCase();
  return (
    lowMsg.includes('websocket') ||
    lowMsg.includes('closed without opened') ||
    lowMsg.includes('failed to connect') ||
    lowMsg.includes('connection reset') ||
    lowMsg.includes('hmr')
  );
};

const originalError = console.error;
console.error = function(...args: any[]) {
  const hasSilenced = args.some(arg => {
    const msg = typeof arg === 'string' ? arg : (arg?.message || String(arg));
    return shouldMute(msg);
  });
  if (hasSilenced) return;
  originalError.apply(console, args);
};

const originalWarn = console.warn;
console.warn = function(...args: any[]) {
  const hasSilenced = args.some(arg => {
    const msg = typeof arg === 'string' ? arg : (arg?.message || String(arg));
    return shouldMute(msg);
  });
  if (hasSilenced) return;
  originalWarn.apply(console, args);
};

const originalLog = console.log;
console.log = function(...args: any[]) {
  const hasSilenced = args.some(arg => {
    const msg = typeof arg === 'string' ? arg : (arg?.message || String(arg));
    return shouldMute(msg);
  });
  if (hasSilenced) return;
  originalLog.apply(console, args);
};

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (!reason) return;
  const msg = typeof reason === 'string' ? reason : (reason.message || String(reason));
  if (shouldMute(msg)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});

window.addEventListener('error', (event) => {
  const errorObj = event.error;
  const msg = event.message || (errorObj ? (typeof errorObj === 'string' ? errorObj : (errorObj.message || String(errorObj))) : '');
  if (shouldMute(msg)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('Service Worker registered successfully!', reg.scope))
      .catch((err) => console.warn('Service Worker registration failed:', err));
  });
}

// Intercept beforeinstallprompt
let deferredPrompt: any = null;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar or direct prompt from appearing automatically
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  (window as any).deferredPrompt = e;
  
  // Notify the app that the install option can be displayed
  const event = new CustomEvent('csync-pwa-installable');
  window.dispatchEvent(event);
});

// Configure robust full-stack global window.fetch interceptor for cPanel/Razorhost environments
const originalFetch = window.fetch;
const csyncFetchInterceptor = async function (input: RequestInfo | URL, init?: RequestInit) {
  let url = '';
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.href;
  } else if (input && (input as any).url) {
    url = (input as any).url;
  }

  // Intercept relative /api/ requests
  if (url && (url.startsWith('/api/') || url.includes('/api/'))) {
    init = init || {};
    const headers = new Headers(init.headers || {});

    const relativeUrl = url.startsWith('/') ? url : '/' + url;
    
    // Check if there is a manually-configured or auto-discovered Custom Backend Base URL
    const customBase = localStorage.getItem('csync_api_base_url') || '';
    const autoBase = localStorage.getItem('csync_auto_api_base_url') || '';
    const activeBase = customBase || autoBase || '';
    
    if (activeBase) {
      const cleanBase = activeBase.replace(/\/$/, '');
      const finalUrl = cleanBase + relativeUrl;
      
      if (typeof input === 'string') {
        input = finalUrl;
      } else if (input instanceof URL) {
        input = new URL(finalUrl);
      } else if (input) {
        // Request object
        input = new Request(finalUrl, input);
      }
    }

    // Capture dynamic user credentials from local storage
    const host = localStorage.getItem('csync_php_db_host');
    const port = localStorage.getItem('csync_php_db_port');
    const database = localStorage.getItem('csync_php_db_name');
    const user = localStorage.getItem('csync_php_db_user');
    const password = localStorage.getItem('csync_php_db_pass');

    if (host || port || database || user || password) {
      if (host) headers.set('x-mysql-host', host);
      if (port) headers.set('x-mysql-port', port);
      if (database) headers.set('x-mysql-database', database);
      if (user) headers.set('x-mysql-user', user);
      if (password) headers.set('x-mysql-password', password);
    }
    init.headers = headers;
  }

  try {
    const response = await originalFetch(input, init);
    
    // Wrap response.json safely to prevent "Unexpected token '<' is not valid JSON" crash on HTML error responses
    const originalJson = response.json;
    response.json = async function () {
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('text/html')) {
        const text = await response.text();
        return {
          error: true,
          message: `The server returned an HTML page (HTTP ${response.status}) instead of JSON.`,
          details: text.slice(0, 250) + (text.length > 250 ? '...' : '')
        };
      }
      
      try {
        const data = await originalJson.call(response);
        return data;
      } catch (err: any) {
        try {
          const text = await response.text();
          if (text.trim().startsWith('<')) {
            return {
              error: true,
              message: `Server returned HTML markup (HTTP ${response.status}) instead of valid JSON.`,
              details: text.slice(0, 250) + (text.length > 250 ? '...' : '')
            };
          }
          return {
            error: true,
            message: `JSON Parse Failed: ${err.message}`,
            details: text
          };
        } catch (_) {
          return {
            error: true,
            message: `JSON Parse Failed: ${err.message}`
          };
        }
      }
    };
    
    return response;
  } catch (error: any) {
    // If '/api/health' probe failed because of standard offline state
    if (url && url.includes('/api/health')) {
      const mockResult = JSON.stringify({ status: 'offline', error: error.message });
      return new Response(mockResult, {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw error;
  }
};

// Implement super resilient registration wrapper to prevent iframe sandboxing read-only fetch crash
try {
  // 1. Try simple, direct assignment
  (window as any).fetch = csyncFetchInterceptor;
} catch (assignmentError) {
  try {
    // 2. Try Object.defineProperty redefining the property descriptor
    Object.defineProperty(window, 'fetch', {
      value: csyncFetchInterceptor,
      writable: true,
      configurable: true,
      enumerable: true
    });
  } catch (defineError) {
    // 3. Fail-safe logging. If even this is blocked, components will fall back to using default relative fetch
    // without proxy configuration, which is perfectly safe for standard relative calls.
    console.warn(
      "CSync Gateway warning: 'window.fetch' is read-only in this sandbox environment. " +
      "Active base-URL rewrite rules bypassed for manual configurations. Standard relative fetching is active."
    );
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
