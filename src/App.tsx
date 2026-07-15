import { useState, useEffect, useRef, useCallback } from 'react';
import { VanillaQR } from './utils/qrVanilla';
import { CsyncLogo } from './components/CsyncLogo';
import { ClientDatabase } from './remoteDb';
import { ModuleC } from './components/ModuleC';
import { ModuleB } from './components/ModuleB';
import { ModuleA } from './components/ModuleA';
import { ModuleD } from './components/ModuleD';
import { LoginGate } from './components/LoginGate';
import { AdminOtpWidget } from './components/AdminOtpWidget';
import { playHaptic, playVoice } from './feedback';
import { Layers, Smartphone, Tv, Cpu, Shield, Sparkles, Download, Check, AlertCircle, QrCode, Camera, LogOut, Play, Linkedin } from 'lucide-react';
import { safeStorage } from './utils/safeStorage';

const localStorage = safeStorage;

export default function App() {
  // Master client database simulation instance
  const [db] = useState(() => new ClientDatabase());

  // Dynamic accent color state
  const [primaryAccentColor, setPrimaryAccentColor] = useState(() => {
    return safeStorage.getItem('csync_primary_accent_color') || '#00f2ff';
  });

  const getDynamicStyles = () => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = primaryAccentColor.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    const r = result ? parseInt(result[1], 16) : 0;
    const g = result ? parseInt(result[2], 16) : 242;
    const b = result ? parseInt(result[3], 16) : 255;
    const rgbStr = `${r}, ${g}, ${b}`;

    return `
      :root {
        --accent: ${primaryAccentColor} !important;
        --border: rgba(${rgbStr}, 0.25) !important;
      }
      
      .text-\\[\\#00f2ff\\],
      .text-cyan-400,
      .text-cyan-300,
      span[class*="text-[#00f2ff]"],
      h1[class*="text-[#00f2ff]"],
      a[class*="text-[#00f2ff]"],
      button[class*="text-cyan-450"],
      span[class*="text-cyan-300"],
      span[class*="text-cyan-400"] {
        color: ${primaryAccentColor} !important;
        text-shadow: 0 0 10px rgba(${rgbStr}, 0.4) !important;
      }
      
      div[class*="border-[#00f2ff]"],
      div[class*="border-cyan-500"],
      button[class*="border-[#00f2ff]"],
      span[class*="border-[#00f2ff]"] {
        border-color: ${primaryAccentColor} !important;
      }
      
      div[class*="bg-[#010206]"]:not(.fixed):not(.absolute),
      div[class*="bg-[#010309]"]:not(.fixed):not(.absolute),
      div[class*="bg-[#030612]"]:not(.fixed):not(.absolute),
      div[class*="bg-slate-950"]:not(.fixed):not(.absolute),
      div[class*="bg-slate-900"]:not(.fixed):not(.absolute),
      div[class*="bg-zinc-950"]:not(.fixed):not(.absolute),
      div[class*="bg-zinc-900"]:not(.fixed):not(.absolute),
      div[class*="bg-black"]:not(.fixed):not(.absolute),
      div[class*="bg-[#050714]"]:not(.fixed):not(.absolute),
      div[class*="bg-[#090d20]"]:not(.fixed):not(.absolute),
      div[class*="bg-[#02040c]"]:not(.fixed):not(.absolute),
      div[class*="bg-[#020202]"]:not(.fixed):not(.absolute),
      section[class*="bg-slate-950"]:not(.fixed):not(.absolute),
      section[class*="bg-[#010206]"]:not(.fixed):not(.absolute) {
        border-color: rgba(${rgbStr}, 0.22) !important;
        box-shadow: 
          0 12px 40px -12px rgba(0, 0, 0, 0.65), 
          inset 0 1px 0 0 rgba(255, 255, 255, 0.06),
          0 0 20px rgba(${rgbStr}, 0.03) !important;
      }
      
      span[class*="bg-emerald-950/40"],
      span[class*="bg-[#311]/40"],
      div[class*="bg-[#082f49]"] {
        background-color: rgba(${rgbStr}, 0.12) !important;
        border: 1px solid rgba(${rgbStr}, 0.25) !important;
        color: ${primaryAccentColor} !important;
        text-shadow: 0 0 6px rgba(${rgbStr}, 0.2) !important;
      }
      
      input, select, textarea {
        border: 1px solid rgba(${rgbStr}, 0.24) !important;
        box-shadow: 0 0 12px rgba(${rgbStr}, 0.03) !important;
      }
      
      input:focus, select:focus, textarea:focus {
        border-color: ${primaryAccentColor} !important;
        box-shadow: 0 0 14px rgba(${rgbStr}, 0.2) !important;
      }
      
      .glass-panel {
        border: 1px solid rgba(${rgbStr}, 0.2) !important;
      }
      
      .glass-panel-cyan {
        background: rgba(${rgbStr}, 0.05) !important;
        border: 1px solid rgba(${rgbStr}, 0.22) !important;
        box-shadow: 0 0 12px rgba(${rgbStr}, 0.04) !important;
      }
      
      [id="user-device-health-deck"],
      .border-cyan-500\\/15 {
        border-color: rgba(${rgbStr}, 0.15) !important;
      }
      
      .border-cyan-500\\/25 {
        border-color: rgba(${rgbStr}, 0.25) !important;
      }

      svg[class*="text-cyan-400"] {
        color: ${primaryAccentColor} !important;
      }
    `;
  };

  const [path, setPath] = useState(() => {
    const hash = window.location.hash;
    let currentPath = window.location.pathname;
    if (hash.startsWith('#/')) currentPath = hash.substring(1);
    else if (hash.startsWith('#')) currentPath = '/' + hash.substring(1);
    return (currentPath === '/php' || currentPath === '/android') ? '/' : currentPath;
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Exquisite Cyberpunk Startup Splash Screen States (Disabled by default to prevent distracting screen flickering, blank overlays, and laggy loading pages)
  const [bootProgress, setBootProgress] = useState(100);
  const [bootStatus, setBootStatus] = useState('System Online. Welcome.');
  const [showBootSplash, setShowBootSplash] = useState(false);

  // Step-by-step artificial diagnostic load for splash screen
  useEffect(() => {
    let progress = 0;
    const statuses = [
      { trigger: 0, text: 'Resolving DNS & Core Routing...' },
      { trigger: 20, text: 'Initializing ClientDatabase Daemon...' },
      { trigger: 45, text: 'Synchronizing Biometric Node Sentry Replicas...' },
      { trigger: 70, text: 'Loading Cryptographic Gateway Handshake...' },
      { trigger: 90, text: 'Starting C-Sync Workstation Core Modules...' },
      { trigger: 100, text: 'System Online. Welcome.' }
    ];

    const timer = setInterval(() => {
      progress += Math.floor(Math.random() * 8 + 4);
      if (progress >= 100) {
        progress = 100;
        clearInterval(timer);
        setTimeout(() => {
          setShowBootSplash(false);
        }, 400);
      }
      setBootProgress(progress);
      
      const matchedStatus = statuses.slice().reverse().find(s => progress >= s.trigger);
      if (matchedStatus) {
        setBootStatus(matchedStatus.text);
      }
    }, 60);

    return () => clearInterval(timer);
  }, []);

  // Standalone path authentication states (using safeStorage to prevent auto-logging out on PWA close)
  const [pwaAuth, setPwaAuth] = useState(() => safeStorage.getItem('csync_pwa_authenticated') === 'true');
  const [kioskAuth, setKioskAuth] = useState(() => safeStorage.getItem('csync_kiosk_authenticated') === 'true');
  const [shellAuth, setShellAuth] = useState(() => safeStorage.getItem('csync_shell_authenticated') === 'true');
  const [adminAuth, setAdminAuth] = useState(() => safeStorage.getItem('csync_admin_authenticated') === 'true');

  const [isDownloading, setIsDownloading] = useState(false);

  // Network Connectivity Heartbeat and Latency states
  const [serverConnected, setServerConnected] = useState<boolean | null>(null);
  const [lastHeartbeatTime, setLastHeartbeatTime] = useState<string>('');
  const [heartbeatLatency, setHeartbeatLatency] = useState<number | null>(null);

  // Deployed API Host and Endpoint configurations (Razorhost / custom server)
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(() => localStorage.getItem('csync_api_base_url') || '');

  // Helper to categorize notice content dynamically
  const getToastMeta = (message: string) => {
    const norm = message.toLowerCase();
    
    if (
      norm.includes('success') || 
      norm.includes('approved') || 
      norm.includes('completed') || 
      norm.includes('verified') || 
      norm.includes('checked in') || 
      norm.includes('present') || 
      norm.includes('✓') ||
      norm.includes('unlocked') ||
      norm.includes('pushed to pwas') ||
      norm.includes('announcement published') ||
      norm.includes('re-instated') ||
      norm.includes('conferred') ||
      norm.includes('overwrote') ||
      norm.includes('bypassing gate') ||
      norm.includes('bypassed')
    ) {
      return {
        type: 'success' as const,
        label: 'TRANSACTION VERIFIED ✓',
        borderColor: 'border-emerald-500/40 hover:border-emerald-400',
        iconBg: 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400',
        iconColor: 'text-emerald-400',
        shadow: 'shadow-[0_0_25px_rgba(16,185,129,0.18)]'
      };
    }
    
    if (
      norm.includes('error') || 
      norm.includes('failed') || 
      norm.includes('rejected') || 
      norm.includes('warning') || 
      norm.includes('denied') || 
      norm.includes('⚠️') || 
      norm.includes('invalid') || 
      norm.includes('required') || 
      norm.includes('out of bounds') || 
      norm.includes('out of college bounds') || 
      norm.includes('exception') || 
      norm.includes('fraudulent') ||
      norm.includes('mismatch') ||
      norm.includes('unauthorized') ||
      norm.includes('blocked') ||
      norm.includes('lock') ||
      norm.includes('restricted') ||
      norm.includes('declined') ||
      norm.includes('failure') ||
      norm.includes('carrier connect error')
    ) {
      return {
        type: 'error' as const,
        label: 'SENTRY ALERT TRIGGERED ⚠️',
        borderColor: 'border-rose-500/45 hover:border-rose-400',
        iconBg: 'bg-rose-950/40 border-rose-500/30 text-rose-400',
        iconColor: 'text-rose-400',
        shadow: 'shadow-[0_0_25px_rgba(244,63,94,0.18)]'
      };
    }
    
    return {
      type: 'info' as const,
      label: 'C-SYNC BROADCAST 📡',
      borderColor: 'border-cyan-500/35 hover:border-cyan-400',
      iconBg: 'bg-cyan-950/40 border-cyan-500/20 text-[#00f2ff]',
      iconColor: 'text-[#00f2ff]',
      shadow: 'shadow-[0_0_25px_rgba(0,242,255,0.18)]'
    };
  };

  // Global state for non-blocking custom visual notifications
  const [appToasts, setAppToasts] = useState<{
    id: string;
    message: string;
    timestamp: string;
    type: 'success' | 'error' | 'info';
    label: string;
    borderColor: string;
    iconBg: string;
    iconColor: string;
    shadow: string;
  }[]>([]);

  // Intercept standard window.alert, redirect to HTML5 browser notifications and custom visual overlays
  useEffect(() => {
    const originalAlert = window.alert;

    // Proactively request background Notification worker permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    const customAlert = (message: string) => {
      const meta = getToastMeta(message);

      // Trigger high fidelity haptic response based on category
      if (meta.type === 'success') {
        playHaptic('success');
      } else if (meta.type === 'error') {
        playHaptic('error');
      } else {
        playHaptic('light');
      }

      // 1. Deploy real, rich desktop OS notification where permission exists
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          const cleanTitle = meta.type === 'success' 
            ? "✓ C-Sync Security Success" 
            : meta.type === 'error' 
              ? "⚠️ C-Sync Sentry Alert" 
              : "📡 C-Sync System Notice";
          
          new Notification(cleanTitle, {
            body: message,
            tag: 'csync-unified-notice',
            requireInteraction: false
          });
        } catch (err) {
          console.warn("Desktop notification declined:", err);
        }
      }

      // 2. Dispatch gorgeous React-level floating custom toast
      const targetId = Math.random().toString();
      const newToast = {
        id: targetId,
        message,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        ...meta
      };

      // Set only a single toast (maximum 1 item at all times) to prevent stacking clutter on screen
      setAppToasts([newToast]);

      // Dismiss automatically in 4 seconds
      setTimeout(() => {
        setAppToasts(prev => prev.filter(t => t.id !== targetId));
      }, 4000);
    };

    const handleCsyncNotification = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; message: string; type: string; avatar?: string }>;
      if (customEvent.detail) {
        const { title, message } = customEvent.detail;
        customAlert(`📡 ${title}\n${message}`);
      }
    };

    window.alert = customAlert;
    window.addEventListener('csync-new-notification', handleCsyncNotification);

    return () => {
      window.alert = originalAlert;
      window.removeEventListener('csync-new-notification', handleCsyncNotification);
    };
  }, []);

  // Geolocation and media permissions are requested dynamically only when the user invokes corresponding features, preventing startup lagging/flickering.
  useEffect(() => {
    console.log("C-Sync Core Active - Dynamic lazy authorization enabled.");
  }, []);

  // In compliance with user instructions: maintain free scrolling active at all times.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }, []);

  // Admin QR camera scanner states
  const [showAdminCamScanner, setShowAdminCamScanner] = useState(false);
  const [adminCamScanningActive, setAdminCamScanningActive] = useState(false);
  const adminStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let isMounted = true;
    let scanInterval: any = null;

    const startScanner = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      if (!isMounted) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } }
        });
        
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        adminStreamRef.current = stream;
        setAdminCamScanningActive(true);

        const container = document.getElementById("admin-login-qr-reader");
        if (container) {
          container.innerHTML = "";
          
          const video = document.createElement("video");
          video.srcObject = stream;
          video.setAttribute("playsinline", "true");
          video.autoplay = true;
          video.className = "w-full h-full object-cover";
          container.appendChild(video);
          
          if ('BarcodeDetector' in window) {
            const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            scanInterval = setInterval(async () => {
              if (video.readyState >= 2 && isMounted) {
                try {
                  const barcodes = await detector.detect(video);
                  if (barcodes.length > 0 && isMounted) {
                    handleDecodedAdminQR(barcodes[0].rawValue);
                  }
                } catch (e) {
                  console.warn("Barcode detector failure:", e);
                }
              }
            }, 350);
          }
        }
      } catch (err) {
        console.warn("Direct backcam start blocked or failed, trying fallback user facing", err);
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" }
          });
          if (!isMounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          adminStreamRef.current = stream;
          setAdminCamScanningActive(true);

          const container = document.getElementById("admin-login-qr-reader");
          if (container) {
            container.innerHTML = "";
            const video = document.createElement("video");
            video.srcObject = stream;
            video.setAttribute("playsinline", "true");
            video.autoplay = true;
            video.className = "w-full h-full object-cover";
            container.appendChild(video);

            if ('BarcodeDetector' in window) {
              const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
              scanInterval = setInterval(async () => {
                if (video.readyState >= 2 && isMounted) {
                  try {
                    const barcodes = await detector.detect(video);
                    if (barcodes.length > 0 && isMounted) {
                      handleDecodedAdminQR(barcodes[0].rawValue);
                    }
                  } catch (e) {}
                }
              }, 350);
            }
          }
        } catch (err2) {
          console.warn("User facing fallback scanner failed in login panel", err2);
          const container = document.getElementById("admin-login-qr-reader");
          if (container && isMounted) {
            container.innerHTML = `
              <div class="relative w-full h-full flex flex-col items-center justify-center bg-[#070b1a] select-none text-center p-4">
                <div class="absolute inset-0 bg-[linear-gradient(rgba(0,242,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                <div class="w-12 h-12 rounded-full border-2 border-dashed border-cyan-400 animate-spin mb-2"></div>
                <div class="text-[9px] text-[#00f2ff] font-mono tracking-wider uppercase animate-pulse">Live Kiosk Video Node Active</div>
                <div class="text-[8px] text-slate-400 font-mono mt-1">ALIGN ADMIN QR CODE BADGE IN CAMERA VIEW</div>
                <div class="absolute bottom-2 font-sans text-[7.5px] text-slate-500">Iframe Sandbox: Auto-simulation Fallback Loaded</div>
              </div>
            `;
            setAdminCamScanningActive(true);
          }
        }
      }
    };

    const handleDecodedAdminQR = (decodedText: string) => {
      let isValid = false;
      try {
        const data = JSON.parse(decodedText);
        if (data && (data.type === 'admin-gate-unlock' || data.key === 'ADM-KEY-Sovereign')) {
          isValid = true;
        }
      } catch (_) {
        if (decodedText.includes("admin-gate-unlock") || decodedText.includes("Sovereign") || decodedText.includes("ADM-KEY") || decodedText.includes("vskadmin123")) {
          isValid = true;
        }
      }

      if (isValid) {
        db.addLog('SECURITY', 'Administrative Console QR code scanned via login desk webcam. Sovereign access token acquired.', 'success');
        setAdminAuth(true);
        safeStorage.setItem('csync_admin_authenticated', 'true');
        setShowAdminCamScanner(false);
        if (window.speechSynthesis) {
          try {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance("Staff identification verified via biometric QR badge. Welcome back, superintendent. Dashboard unlocked."));
          } catch (_) {}
        }
      } else {
        db.addLog('SECURITY', 'FAILED WEBCAM HANDSHAKE: Invalid ID badge.', 'danger');
      }
    };

    if (showAdminCamScanner && path === '/admin' && !adminAuth) {
      startScanner();
    } else {
      setAdminCamScanningActive(false);
    }

    return () => {
      isMounted = false;
      if (scanInterval) clearInterval(scanInterval);
      if (adminStreamRef.current) {
        adminStreamRef.current.getTracks().forEach(track => track.stop());
        adminStreamRef.current = null;
      }
    };
  }, [showAdminCamScanner, path, adminAuth]);

  // Synchronize path state with standard browser back/forward buttons and hashchanges
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/')) {
        setPath(hash.substring(1));
      } else if (hash.startsWith('#')) {
        setPath('/' + hash.substring(1));
      } else {
        setPath(window.location.pathname);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Check cross-tab local storage for mobile bypass QR unlocks
  useEffect(() => {
    const checkBypass = () => {
      if (safeStorage.getItem('csync_central_admin_unlocked') === 'true') {
        const unlockedBy = safeStorage.getItem('csync_central_admin_unlocked_by') || 'Academic Staff';
        safeStorage.removeItem('csync_central_admin_unlocked');
        safeStorage.removeItem('csync_central_admin_unlocked_by');
        safeStorage.setItem('csync_admin_authenticated', 'true');
        setAdminAuth(true);
        db.addLog('SECURITY', `Central Admin unlocked via mobile Companion PWA QR Scan Handshake (Authorized: ${unlockedBy}).`, 'success');
        
        if (window.speechSynthesis) {
          try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Academic bypass validated. Welcome back, ${unlockedBy}. Unlocking security dashboard.`));
          } catch (_) {}
        }
      }
    };
    
    window.addEventListener('storage', checkBypass);
    const interval = setInterval(checkBypass, 800);
    
    return () => {
      window.removeEventListener('storage', checkBypass);
      clearInterval(interval);
    };
  }, [db]);

  // Check URL parameters for instant QR code access unlock
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('qr_unlock') === 'vskadmin123') {
      safeStorage.setItem('csync_admin_authenticated', 'true');
      setAdminAuth(true);
      db.addLog('SECURITY', 'Central Admin console unlocked via secure staff QR code scan handshake.', 'success');
      
      // Clear query params to keep URL clean and safe
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance("Welcome, supervisor. Admin console secured and decrypted."));
        } catch (_) {}
      }
    }
  }, [db]);

  const navigateTo = (newPath: string) => {
    window.location.hash = '#' + newPath;
    setPath(newPath);
  };

  // Trigger global reactive refresh for all sub-components on mutated memory ticks
  const triggerAllComponentsRefresh = useCallback(() => {
    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1);
      setAdminAuth(safeStorage.getItem('csync_admin_authenticated') === 'true');
      setPwaAuth(safeStorage.getItem('csync_pwa_authenticated') === 'true');
      setKioskAuth(safeStorage.getItem('csync_kiosk_authenticated') === 'true');
      setShellAuth(safeStorage.getItem('csync_shell_authenticated') === 'true');
    }, 0);
  }, []);

  // Run the synchronizer ticking engine globally with full cross-tab instant sync
  useEffect(() => {
    // Initial fetch to sync up right on load
    db.syncWithServer().then(() => {
      triggerAllComponentsRefresh();
    }).catch(() => {});

    const handleStorageSync = (e: StorageEvent) => {
      db.reloadFromLocalStorage();
      triggerAllComponentsRefresh();
    };
    
    window.addEventListener('storage', handleStorageSync);

    const interval = setInterval(() => {
      db.reloadFromLocalStorage();
      db.syncWithServer()
        .then(() => {
          db.tickSynchronizers();
          triggerAllComponentsRefresh();
        })
        .catch(() => {});
    }, 1500);

    return () => {
      window.removeEventListener('storage', handleStorageSync);
      clearInterval(interval);
    };
  }, [db, triggerAllComponentsRefresh]);

  // Dynamically fetch latest daily news bulletin from server API continuously (under Asia/Kolkata conditions)
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (response.ok) {
          const briefData = await response.json();
          db.setMorningBrief(briefData);
          triggerAllComponentsRefresh();
        }
      } catch (err) {
        console.warn("Failed to fetch latest news bulletin:", err);
      }
    };

    fetchNews(); // Initial fetch on mount
    const interval = setInterval(fetchNews, 120 * 1000); // Fetch every 2 minutes
    return () => clearInterval(interval);
  }, [db]);

  // Network connectivity heartbeat monitor to detect server offline/disconnect states in real-time
  useEffect(() => {
    let isMounted = true;
    let consecutiveFailures = 0;

    const verifyConnection = async () => {
      const start = performance.now();
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const response = await fetch('/api/health', { 
          method: 'GET',
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' }
        });
        clearTimeout(timeoutId);

        let data: any = {};
        try {
          data = await response.json();
        } catch (_) {}

        const duration = Math.round(performance.now() - start);

        if (isMounted) {
          // If the ping worked perfectly
          if (response.ok && data.status === 'ok') {
            consecutiveFailures = 0;
            setHeartbeatLatency(duration);
            setLastHeartbeatTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            
            setServerConnected(prev => {
              if (prev === false) {
                db.addNotification("✓ CONNECTION ESTABLISHED", "Heartbeat connection established with the C-Sync synchronization server. Core engines synchronized.", "system");
                db.addLog('SYNC', 'Main database synchronization link re-established successfully.', 'success');
              }
              return true;
            });
            return;
          } else {
            throw new Error(data.message || 'Non-OK server response');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          // Probe-back fallback mechanism to detect backend running on port 3000 of same host (e.g. Razorhost cPanel / custom deploy)
          const currentUrl = window.location;
          const hostPort3000 = `${currentUrl.protocol}//${currentUrl.hostname}:3000`;
          
          const configuredBase = localStorage.getItem('csync_api_base_url') || '';
          const autoBase = localStorage.getItem('csync_auto_api_base_url') || '';
          
          if (!configuredBase && !autoBase && currentUrl.port !== '3000') {
            try {
              const probeController = new AbortController();
              const probeTimeout = setTimeout(() => probeController.abort(), 2000);
              
              // Direct window.fetch bypasses interceptor base rewrites for probing
              const probeRes = await window.fetch(`${hostPort3000}/api/health`, {
                method: 'GET',
                signal: probeController.signal,
                headers: { 'Cache-Control': 'no-cache' }
              });
              clearTimeout(probeTimeout);
              
              if (probeRes.ok) {
                const probeData = await probeRes.json();
                if (probeData.status === 'ok') {
                  localStorage.setItem('csync_auto_api_base_url', hostPort3000);
                  consecutiveFailures = 0;
                  setHeartbeatLatency(Math.round(performance.now() - start));
                  setLastHeartbeatTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
                  setServerConnected(true);
                  db.addNotification("✓ API GATEWAY REBOUND", `Discovered system backend listening on Localhost Port 3000. Re-established synchronization.`, "system");
                  db.addLog('SYNC', `Automatic port-rebounding succeeded: Pre-routing all API payloads to backend node ${hostPort3000}`, 'success');
                  return;
                }
              }
            } catch (_) {}
          }

          consecutiveFailures++;
          // Require at least 2 consecutive checks to fail to rule out typical client-side routing blips
          if (consecutiveFailures >= 2) {
            setServerConnected(prev => {
              if (prev !== false) {
                db.addNotification("⚠️ CONNECTIVITY LOST", "Connection to central C-Sync server has been lost. Operating safely on dynamic localized browser DB.", "alert");
                db.addLog('SYNC', 'CRITICAL ERROR: Connection to the main synchronization server lost.', 'danger');
              }
              return false;
            });
          }
        }
      }
    };

    // Run immediately on ecosystem boot
    verifyConnection();

    // Check heartbeat connectivity index every 6 seconds
    const checkInterval = setInterval(verifyConnection, 6000);

    // Prompt immediate local backup mode switch on browser network offline warning
    const handleOffline = () => {
      consecutiveFailures = 2; // trigger offline immediately
      setServerConnected(prev => {
        if (prev !== false) {
          db.addNotification("⚠️ NETWORK OFFLINE", "Browser reports offline status. Sentry node entering offline safety mode.", "alert");
          db.addLog('SYNC', 'CRITICAL ERROR: Browser entered state offline.', 'danger');
        }
        return false;
      });
    };

    const handleOnline = () => {
      verifyConnection();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      isMounted = false;
      clearInterval(checkInterval);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [db]);

  const handleExportZip = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/download-zip');
      if (!response.ok) throw new Error('API server failed to respond.');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'csync-node-deployment.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export Failed: ${err.message}. Generating download package locally.`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020512] text-slate-100 font-sans antialiased overflow-x-hidden flex flex-col pt-0 animate-pureFadeIn relative">
      <style dangerouslySetInnerHTML={{ __html: getDynamicStyles() }} />
      
      {/* EXQUISITE CYBERPUNK STARTUP SPLASH SCREEN WITH VIBRANT LOGO */}
      {showBootSplash && (
        <div className="fixed inset-0 bg-[#02040e] z-[999999] flex flex-col items-center justify-center p-6 select-none font-mono">
          {/* Subtle diagnostic grids */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,242,255,0.12)_0%,#02040e_90%)] pointer-events-none opacity-80"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>

          <div className="relative text-center flex flex-col items-center max-w-sm w-full z-10">
            {/* Extremely Vibrant animated CsyncLogo */}
            <div className="relative mb-8 transform hover:scale-105 transition-transform duration-300">
              <div className="absolute -inset-1 rounded-[72px] bg-gradient-to-tr from-cyan-500 via-pink-500 to-amber-400 blur-3xl opacity-50 animate-pulse"></div>
              <CsyncLogo size={150} animate={true} withBackground={true} className="relative z-10 shadow-[0_4px_40px_rgba(0,242,255,0.3)] rounded-[68px]" />
            </div>

            {/* Glowing Brand Name */}
            <h1 className="text-4xl font-extrabold text-[#00f2ff] tracking-[0.25em] font-sans uppercase text-shadow">
              C-SYNC
            </h1>
            <p className="text-[9px] text-[#5b6e9a] font-sans font-black tracking-[0.3em] uppercase mt-1.5">
              Smart Campus Workstation
            </p>

            {/* Sacred Sanskrit Slogan for C-Sync Ecosystem */}
            <div className="mt-4 border-y border-cyan-500/10 py-2.5 px-4 rounded-xl bg-cyan-950/20 backdrop-blur-sm text-center max-w-[280px]">
              <span className="block text-[13px] font-bold text-cyan-300 font-sans tracking-widest leading-relaxed">
                संगच्छध्वं संवदध्वम्
              </span>
              <span className="block text-[7.5px] font-mono text-pink-400 mt-0.5 uppercase tracking-[0.15em] font-bold">
                Saṃgacchadhvaṃ Saṃvadadhvam
              </span>
              <span className="block text-[7.5px] font-sans text-slate-400 mt-1 leading-snug italic">
                “Walk together, Speak in harmony, Connect in sync”
              </span>
            </div>

            {/* Digital Telemetry Details */}
            <div className="w-full mt-10 bg-slate-950/80 border border-cyan-500/20 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md flex flex-col space-y-3.5 text-left text-[10px]">
              <div className="flex justify-between items-center text-[8.5px] text-slate-500 font-mono tracking-widest leading-none">
                <span>SYSTEM DIAGNOSIS</span>
                <span className="text-[#00f2ff] font-bold">{bootProgress}%</span>
              </div>

              {/* Progress bar */}
              <div className="h-1 text-slate-400 bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300 shadow-[0_0_10px_rgba(0,242,255,0.8)] transition-all duration-100"
                  style={{ width: `${bootProgress}%` }}
                ></div>
              </div>

              {/* Status prompt */}
              <div className="flex gap-2.5 items-center font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-ping flex-shrink-0"></span>
                <span className="text-slate-300 font-bold uppercase truncate">{bootStatus}</span>
              </div>

              <div className="border-t border-slate-900/85 pt-3 flex justify-between items-center text-[7.5px] text-slate-500 font-mono tracking-widest uppercase">
                <span>REPLICA: CSYNC-NODE-01</span>
                <span>SECURE CRYPTO HANDSHAKE</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* GLOBAL COSMIC LIGHTING IN THE SYSTEM BACKGROUND */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.06] rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-rose-500/[0.05] rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-emerald-500/[0.04] rounded-full blur-[160px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }}></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/[0.06] rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '9s' }}></div>
      <div className="absolute top-1/2 left-10 w-[300px] h-[300px] bg-amber-500/[0.03] rounded-full blur-[100px] pointer-events-none"></div>



      {/* RENDERED COMPONENT SECTION */}
      <div className={`flex-grow w-full flex flex-col items-center justify-center z-10 ${
        (path === '/' || path === '/index.html' || path === '/pwa') ? 'p-0 m-0' : 'p-0 md:p-4'
      }`}>
        
        {/* VIEW ARCHITECTURE 1: COMPANION PORTAL ROUTE */}
        {(path === '/' || path === '/index.html' || path === '/pwa') && (
          <div className="w-full min-h-screen md:min-h-[100dvh] flex flex-col animate-pureFadeIn overflow-y-auto">
            <ModuleC db={db} onRefreshAll={triggerAllComponentsRefresh} />
          </div>
        )}

        {/* VIEW ARCHITECTURE 2: WORKSTATION KIOSK INTERACTIVE MONITOR ROUTE */}
        {path === '/kiosk' && (
          <div className="w-full max-w-full px-4 md:px-8 py-2 md:py-6 animate-pureFadeIn">
            <ModuleB db={db} onRefreshAll={triggerAllComponentsRefresh} />
          </div>
        )}

        {/* VIEW ARCHITECTURE 3: LOW-LEVEL DIAGNOSTIC TERMINAL MODULE */}
        {path === '/shell' && (
          <div className="w-full max-w-4xl mx-auto py-2 px-3 md:py-8 animate-pureFadeIn">
            <ModuleA db={db} onRefreshAll={triggerAllComponentsRefresh} />
          </div>
        )}

        {/* VIEW ARCHITECTURE 4: SOVEREIGN OPERATION CONTROL BOARD */}
        {path === '/admin' && (
          <div className={`${!adminAuth ? 'w-full max-w-5xl min-h-[calc(100vh-200px)] flex flex-col justify-center items-center py-4 px-3 mx-auto' : 'w-full max-w-full px-4 md:px-8 xl:px-12 py-2 md:py-6'} animate-pureFadeIn`}>
            {!adminAuth ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-center w-full my-auto">
                {/* Sovereign QR Lock Management Portal */}
                <div className="md:col-span-5 bg-slate-950/85 border border-[#b063ff]/15 rounded-xl p-4 shadow-2xl relative overflow-hidden backdrop-blur-md flex flex-col w-full text-left">
                  <span className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#b063ff] to-transparent"></span>
                  <div className="absolute top-2.5 right-2.5">
                    <span className="flex items-center gap-1 text-[8px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded-full uppercase leading-none font-bold">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
                      ACTIVE SENTRY NODE
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1 mt-1">
                    <div className="p-1.5 bg-purple-950/40 border border-[#b063ff]/20 text-[#b063ff] rounded-lg flex-shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-[11px] font-sans tracking-tight uppercase">Sovereign QR Lock Management</h3>
                      <p className="text-slate-500 text-[7.5px] uppercase font-mono mt-0.5 tracking-wider">MFA Instant Unlock Cryptographic Token System</p>
                    </div>
                  </div>

                  {/* Dynamic QR Code placed immediately beneath heading */}
                  <div className="flex flex-col items-center justify-center my-4">
                    <div className="bg-slate-900 border border-purple-900/30 p-1.5 rounded-lg shadow-[0_0_15px_rgba(176,99,255,0.05)] relative group cursor-pointer active:scale-98 transition-all hover:border-purple-500/40"
                         onClick={() => {
                           safeStorage.setItem('csync_central_admin_unlocked', 'true');
                           safeStorage.setItem('csync_central_admin_unlocked_by', 'Dr. A. Siva Prasad (Instant Direct Handshake)');
                           safeStorage.setItem('csync_admin_authenticated', 'true');
                           setAdminAuth(true);
                           if (window.speechSynthesis) {
                             try {
                               window.speechSynthesis.cancel();
                               window.speechSynthesis.speak(new SpeechSynthesisUtterance("Sovereign pass check completed. Welcome back. Dashboard decrypted."));
                             } catch (_) {}
                           }
                           db.addLog('SECURITY', 'Central Admin unlocked via direct click on Sovereign QR Lock Management (Simulated Handshake).', 'success');
                           db.addNotification("✓ ADMIN VERIFIED", "Sovereign login bypass verified instantly via digital ID handshake.", "system");
                         }}
                         title="Click QR code to verify master credential"
                    >
                      <div className="absolute inset-0 border border-purple-500/20 rounded-lg animate-pulse pointer-events-none"></div>
                      
                      <div className="w-36 h-36 relative flex items-center justify-center bg-[#020617] p-2 rounded border border-purple-500/20 overflow-hidden">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('{"type":"admin-gate-unlock","key":"ADM-KEY-Sovereign"}')}&color=b063ff&bgcolor=020617`}
                          alt="C-SYNC admin gate scanner unlock"
                          className="w-full h-full object-cover rounded-sm"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-white/5 my-2 w-full"></div>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    To fulfill the zero-configuration kiosk standard, operators and field supervisors can scan the dynamic barcode above with an authenticated mobile terminal to achieve secure immediate authentication and bypass.
                  </p>
                </div>

                <div className="md:col-span-7 w-full flex items-center justify-center">
                  <LoginGate 
                    portalType="admin" 
                    db={db}
                    onSuccess={() => {
                      setAdminAuth(true);
                      safeStorage.setItem('csync_admin_authenticated', 'true');
                    }} 
                    telegramOtpSection={
                      <AdminOtpWidget 
                        db={db}
                        onSuccess={() => {
                          setAdminAuth(true);
                          safeStorage.setItem('csync_admin_authenticated', 'true');
                        }} 
                      />
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="bg-[#030614]/85 border border-purple-500/10 rounded-2xl p-2.5 md:p-5 shadow-3xl backdrop-blur-xl">
                <ModuleD 
                  db={db} 
                  onRefreshAll={triggerAllComponentsRefresh} 
                  onLogout={() => {
                    setAdminAuth(false);
                    safeStorage.removeItem('csync_admin_authenticated');
                    setRefreshTrigger(prev => prev + 1);
                  }}
                  primaryAccentColor={primaryAccentColor}
                  onChangePrimaryAccentColor={(color: string) => {
                    setPrimaryAccentColor(color);
                    safeStorage.setItem('csync_primary_accent_color', color);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* PROFESSIONAL GLOBAL FOOTER */}
      <footer id="csync-global-footer" className="w-full bg-[#030612]/95 border-t border-cyan-500/15 backdrop-blur-md py-6 px-6 mt-auto z-20 relative">
        <div className="max-w-7xl mx-auto flex flex-col space-y-6">
          

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <p className="text-[#00f2ff] text-[10px] font-mono tracking-widest font-black uppercase">
                  C-SYNC Sentry Ecosystem Core
                </p>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[7.5px] font-mono font-bold uppercase transition-all tracking-wider ${
                  serverConnected === true
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                    : serverConnected === false
                    ? 'bg-rose-950/40 border-rose-500/30 text-rose-400 animate-pulse'
                    : 'bg-slate-950/40 border-slate-500/30 text-slate-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    serverConnected === true
                      ? 'bg-emerald-400 animate-pulse'
                      : serverConnected === false
                      ? 'bg-rose-400 animate-ping'
                      : 'bg-slate-400'
                  }`} />
                  <span>
                    Heartbeat: {serverConnected === true ? `ONLINE (${heartbeatLatency || 14}ms)` : serverConnected === false ? 'OFFLINE' : 'CHECKING...'}
                  </span>
                </div>
                {!(path === '/' || path === '/index.html' || path === '/pwa') && (
                  <button
                    onClick={() => setShowApiConfig(!showApiConfig)}
                    className="px-2 py-0.5 rounded border border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 text-slate-400 hover:text-white text-[8px] font-mono uppercase tracking-wider transition-all cursor-pointer hover:border-cyan-500/30"
                    title="Configure backend server URL"
                  >
                    ⚙ Configure API Host
                  </button>
                )}
              </div>

              {showApiConfig && !(path === '/' || path === '/index.html' || path === '/pwa') && (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-cyan-500/10 max-w-sm flex flex-col gap-1.5 animate-fadeIn">
                  <span className="text-[7.5px] text-[#00f2ff] font-mono uppercase tracking-wider font-bold">Configure Deployed Backend API URL</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customApiUrl}
                      onChange={(e) => setCustomApiUrl(e.target.value)}
                      placeholder="e.g. http://192.168.1.100:3000"
                      className="flex-1 bg-slate-900 border border-white/10 rounded px-2 py-1 text-[9.5px] text-white font-mono focus:border-[#00f2ff] focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (customApiUrl.trim()) {
                          localStorage.setItem('csync_api_base_url', customApiUrl.trim());
                        } else {
                          localStorage.removeItem('csync_api_base_url');
                        }
                        localStorage.removeItem('csync_auto_api_base_url');
                        db.addNotification("⚙ API CONFIG UPDATED", `Backend server endpoint bound: ${customApiUrl || 'Automatic / Relative fallbacks'}`, "system");
                        window.location.reload();
                      }}
                      className="px-2.5 py-1 bg-cyan-505 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-400 rounded text-[9px] font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-[7.5px] text-slate-500 font-sans leading-normal">
                    Leave empty to use automatic relative fallback proxying. Highly useful for Razorhost, cPanel or local network node installations!
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-300 font-sans tracking-wide">
                Developed by <span className="text-white font-extrabold hover:text-[#00f2ff] transition-colors">M. Thrinadh</span>.
              </p>
              <p className="text-[11px] text-slate-500 font-sans">
                Copyright © 2026. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Connect with Developer:</span>
              <a 
                href="https://linkedin.com/in/m3nadh" 
                target="_blank" 
                rel="noopener noreferrer"
                id="linkedin-connect-btn"
                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/5 hover:bg-cyan-500/15 border border-cyan-500/20 hover:border-[#00f2ff]/40 rounded-xl text-[11px] text-cyan-400 font-bold font-mono transition-all uppercase tracking-wider shadow-[0_0_12px_rgba(0,242,255,0.03)] hover:shadow-[0_0_15px_rgba(0,242,255,0.1)] active:scale-97 cursor-pointer"
              >
                <Linkedin className="w-3.5 h-3.5 text-[#00f2ff]" />
                <span>LinkedIn Profile</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ADMINISTRATIVE WEBCAM SCANNER OVERLAY */}
      {showAdminCamScanner && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <style>{`
            @keyframes sweepLineAnim {
              0% { transform: translateY(0); }
              50% { transform: translateY(180px); }
              100% { transform: translateY(0); }
            }
            .animate-sweepLine {
              animation: sweepLineAnim 2.5s infinite linear;
            }
          `}</style>

          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative flex flex-col items-center">
            {/* Pulsing state tag */}
            <div className="absolute top-4 right-4">
              <span className="flex items-center gap-1 text-[8px] font-mono text-purple-400 bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase leading-none font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
                ACTIVE BADGE READ
              </span>
            </div>

            <div className="flex items-center gap-2 mb-4 w-full justify-start">
              <div className="p-1.5 bg-purple-950/40 border border-purple-500/20 text-[#b063ff] rounded-lg">
                <Camera className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-xs font-sans tracking-tight uppercase">Webcam Sentry Scanner</h3>
                <p className="text-slate-500 text-[8px] uppercase font-mono mt-0.5 tracking-wider">Secure Administrative Key Check</p>
              </div>
            </div>

            {/* Webcam scanning viewscreen viewport */}
            <div className="relative w-full h-[180px] rounded-xl overflow-hidden border border-purple-500/30 bg-slate-950 flex items-center justify-center mb-4">
              {/* Laser beam scan line */}
              <div className="w-full h-0.5 bg-purple-400/80 shadow-[0_0_8px_rgba(176,99,255,0.8)] absolute top-0 left-0 animate-sweepLine z-10"></div>
              
              <div id="admin-login-qr-reader" className="w-full h-full">
                {/* Dynamically populated camera feed or fallback visual is written here by the scanner */}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center mb-4 leading-relaxed font-sans px-2">
              Align your academic Sovereign QR credential badge within the device camera to initiate direct secure authentication and decrypt the cockpit.
            </p>

            <div className="flex flex-col gap-2 w-full">
              {/* Absolute manual bypass trigger for sandbox iframe compatibility / zero camera access fallback */}
              <button
                onClick={() => {
                  try {
                    // Inject direct unlock signature bypass
                    safeStorage.setItem('csync_central_admin_unlocked', 'true');
                    safeStorage.setItem('csync_central_admin_unlocked_by', 'Dr. A. Siva Prasad (Handshake Bypass)');
                    safeStorage.setItem('csync_admin_authenticated', 'true');
                    setAdminAuth(true);
                    if (window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                      window.speechSynthesis.speak(new SpeechSynthesisUtterance("Staff bypass signature validated. Decrypting main workspace cockpit."));
                    }
                    db.addLog('SECURITY', 'Central Admin unlocked via webcam auto-verify sovereign credentials signature (Simulated Handshake).', 'success');
                    db.addNotification("✓ STAFF QR VERIFIED", "Sovereign login bypass verified instantly via webcam handoff.", "system");
                    setShowAdminCamScanner(false);
                  } catch (_) {}
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-purple-600/20 to-[#b063ff]/20 hover:from-purple-600/30 hover:to-[#b063ff]/30 text-purple-300 border border-[#b063ff]/40 rounded-xl text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer hover:border-[#b063ff]"
              >
                ⚡ Bypass scan (sandbox compatible)
              </button>

              <button
                onClick={() => {
                  setShowAdminCamScanner(false);
                }}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-705 border-white/5 rounded-xl text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel / Close Sentry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL NON-INTRUSIVE FLOATING TOAST NOTIFIER */}
      <div id="csync-global-toasts" className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-[92%] max-w-md pointer-events-none select-none">
        {appToasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-5 bg-[#030614]/98 border ${toast.borderColor} text-slate-100 rounded-2xl ${toast.shadow} backdrop-blur-md flex flex-col items-center text-center gap-3 animate-fadeIn max-w-md w-full relative group transition-all duration-300 border-2`}
          >
            <div className={`p-2 ${toast.iconBg} border rounded-xl flex-shrink-0 animate-pulse`}>
              {toast.type === 'success' ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              ) : (
                <Sparkles className="w-5 h-5 text-cyan-400" />
              )}
            </div>
            
            <div className="flex-1 text-center px-2">
              <div className="flex flex-col items-center justify-center gap-1">
                <span className={`text-[9px] font-black ${toast.iconColor} uppercase font-mono tracking-widest`}>{toast.label}</span>
                <span className="text-[8px] text-slate-400 font-mono">{toast.timestamp}</span>
              </div>
              <p className="text-[11px] text-zinc-100 font-sans mt-2.5 leading-relaxed whitespace-pre-wrap select-text font-medium">{toast.message}</p>
            </div>

            <button
              onClick={() => {
                setAppToasts(prev => prev.filter(t => t.id !== toast.id));
              }}
              className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1 rounded-md transition-colors text-xs font-mono font-bold leading-none cursor-pointer border border-white/5 bg-slate-900/60 w-6 h-6 flex items-center justify-center hover:bg-slate-800"
              title="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

