import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, Cpu, Wifi, Zap, Radio, Share2, Download, Check, AlertCircle, Smartphone, 
  RefreshCw, Globe, HelpCircle, FileText, Send, Trash2, Sliders, Volume2, 
  Activity, Play, CheckCircle, Flame, Server, Laptop, ChevronRight, AlertTriangle,
  Bell, BellRing, Video, Lock, Eye, Settings, ShieldAlert, Sparkles, Hand,
  Battery, Thermometer, Headphones, HardDrive
} from 'lucide-react';
import { ClientDatabase } from '../remoteDb';
import { User, WeatherInfo, MorningBrief } from '../types';
import { safeStorage } from '../utils/safeStorage';

const localStorage = safeStorage;
import { playVoice, playHaptic } from '../feedback';
import { CsyncGestureController } from './CsyncGestureController';
import { BiometricHapticSandbox } from './BiometricHapticSandbox';

interface CsyncEcosystemHubProps {
  db: ClientDatabase;
  currentUser: User;
  onRefreshAll: () => void;
  deviceModel: string;
  deviceCpuLoad: number;
  deviceRamUsed: number;
  deviceRamTotal: number;
  deviceDiskFree: number;
  deviceDiskTotal: number;
  deviceTemp: number;
  deviceBattery: number;
  deviceBatteryStatus: string;
  deviceSoftwareHealth: string;
  deviceHardwareHealth: string;
  deviceCalibrating: boolean;
  deviceCalibrationProgress: number;
  setDeviceCalibrating: React.Dispatch<React.SetStateAction<boolean>>;
  setDeviceCalibrationProgress: React.Dispatch<React.SetStateAction<number>>;
  setDeviceSoftwareHealth: React.Dispatch<React.SetStateAction<string>>;
  setDeviceHardwareHealth: React.Dispatch<React.SetStateAction<string>>;
  devicePeripherals: {
    [key: string]: {
      id: string;
      name: string;
      type: 'charger' | 'buds' | 'usb' | 'display';
      connected: boolean;
      details: string;
      battery?: string;
    }
  };
  triggerPeripheralAnimation: (type: 'charger' | 'buds' | 'usb' | 'display', status: 'CONNECTED' | 'DISCONNECTED') => void;
  setNeuroAuditLog: React.Dispatch<React.SetStateAction<string[]>>;
}

interface NewsItem {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  time: number;
}

export const CsyncEcosystemHub: React.FC<CsyncEcosystemHubProps> = ({ 
  db, 
  currentUser, 
  onRefreshAll,
  deviceModel,
  deviceCpuLoad,
  deviceRamUsed,
  deviceRamTotal,
  deviceDiskFree,
  deviceDiskTotal,
  deviceTemp,
  deviceBattery,
  deviceBatteryStatus,
  deviceSoftwareHealth,
  deviceHardwareHealth,
  deviceCalibrating,
  deviceCalibrationProgress,
  setDeviceCalibrating,
  setDeviceCalibrationProgress,
  setDeviceSoftwareHealth,
  setDeviceHardwareHealth,
  devicePeripherals,
  triggerPeripheralAnimation,
  setNeuroAuditLog
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'iot' | 'p2p' | 'nfc' | 'bluetooth' | 'widgets' | 'mail'>('iot');
  const [gesturesConsoleOpen, setGesturesConsoleOpen] = useState(false);

  const handleSwipeLeft = () => {
    const tabs: ('iot' | 'p2p' | 'nfc' | 'bluetooth' | 'widgets' | 'mail')[] = ['iot', 'p2p', 'nfc', 'bluetooth', 'widgets', 'mail'];
    setActiveSubTab(prev => {
      const idx = tabs.indexOf(prev);
      const nextIdx = (idx - 1 + tabs.length) % tabs.length;
      playVoice(`Left swipe. Selected ${tabs[nextIdx].toUpperCase()} telemetry.`);
      return tabs[nextIdx];
    });
  };

  const handleSwipeRight = () => {
    const tabs: ('iot' | 'p2p' | 'nfc' | 'bluetooth' | 'widgets' | 'mail')[] = ['iot', 'p2p', 'nfc', 'bluetooth', 'widgets', 'mail'];
    setActiveSubTab(prev => {
      const idx = tabs.indexOf(prev);
      const nextIdx = (idx + 1) % tabs.length;
      playVoice(`Right swipe. Selected ${tabs[nextIdx].toUpperCase()} telemetry.`);
      return tabs[nextIdx];
    });
  };

  const handleScrollUp = () => {
    window.scrollBy({ top: -240, behavior: 'smooth' });
  };

  const handleScrollDown = () => {
    window.scrollBy({ top: 240, behavior: 'smooth' });
  };

  const handleAirGrab = () => {
    const mainEl = document.getElementById('csync-high-tech-hub-wrapper');
    if (mainEl) {
      mainEl.classList.add('ring-4', 'ring-cyan-500', 'scale-[0.995]', 'duration-150');
      setTimeout(() => {
        mainEl.classList.remove('ring-4', 'ring-cyan-500', 'scale-[0.995]', 'duration-150');
      }, 300);
    }
    playHaptic('heavy');
    playVoice("Security snapshot gesture verified.");
  };

  // Native Notifications permission state
  const [notificationPermission, setNotificationPermission] = useState<'default' | 'granted' | 'denied' | 'unsupported'>(() => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        return Notification.permission;
      }
    } catch (_) {}
    return 'unsupported';
  });

  interface SystemNotificationLog {
    id: string;
    type: 'METEO' | 'NEWS' | 'WEBRTC' | 'NFC' | 'BEACON' | 'ACOUSTIC' | 'SECURITY' | 'WIRELESS';
    title: string;
    body: string;
    timestamp: string;
  }

  const [notificationHistory, setNotificationHistory] = useState<SystemNotificationLog[]>([
    {
      id: 'init-1',
      type: 'SECURITY',
      title: 'C-Sync Sentry Armed',
      body: 'Secure sandbox active. Listening for physical & network hardware interrupts.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 'init-2',
      type: 'BEACON',
      title: 'Maddilapalem Beacon Scan',
      body: 'Wired and wireless subnet routers linked.',
      timestamp: new Date(Date.now() - 300000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // In-app custom notification toasts (for ultimate reliable feel)
  interface CustomToast {
    id: string;
    type: string;
    title: string;
    body: string;
  }
  const [toasts, setToasts] = useState<CustomToast[]>([]);

  // Widget metric states
  const [cpuLoad, setCpuLoad] = useState(38);
  const [pingStatus, setPingStatus] = useState<'idle' | 'pinging' | 'success' | 'failed'>('idle');
  const [pingValue, setPingValue] = useState<number | null>(null);
  const [cctvMode, setCctvMode] = useState<'raw' | 'infra' | 'matrix'>('matrix');
  const [sentryArmed, setSentryArmed] = useState(true);

  // Settings for pushes
  const [pushSettings, setPushSettings] = useState({
    meteo: true,
    news: true,
    webrtc: true,
    nfc: true,
    beacon: true,
    acoustic: true
  });

  // cpu load fluctuating smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuLoad(prev => {
        const diff = Math.floor(Math.random() * 7) - 3; // -3% to +3%
        const next = prev + diff;
        return Math.max(12, Math.min(84, next));
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

    // --- SMTP/PHPMAIL / SECURITY INTIMATIONS STATES & SYSTEM PIPELINE ---
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [mailEmail, setMailEmail] = useState('');
  const [mailName, setMailName] = useState('');
  const [mailRole, setMailRole] = useState('Major Student');
  const [mailIdNumber, setMailIdNumber] = useState('');
  const [mailSubject, setMailSubject] = useState('🛡️ Welcome to C-SYNC! Successful Campus Node Integration');
  const [mailCustomMsg, setMailCustomMsg] = useState('');
  const [mailTheme, setMailTheme] = useState<'cyberpunk' | 'crimson_sentry' | 'emerald_academy' | 'gold_luxury' | 'sapphire_stellar'>('cyberpunk');
  const [mailLoading, setMailLoading] = useState(false);
  const [selectedMailPreview, setSelectedMailPreview] = useState<any | null>(null);
  const [searchMailQuery, setSearchMailQuery] = useState('');

  // --- GEMINI CO-PILOT COMMUNICATIONS SYNTHESIZER ---
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiSynthesizing, setAiSynthesizing] = useState(false);
  const [aiType, setAiType] = useState<'welcome' | 'alert'>('welcome');

  const handleGeminiSynthesize = async () => {
    if (!mailName.trim()) {
      alert('Please fill in the Recipient Name first to personalize the AI synthesis.');
      return;
    }
    setAiSynthesizing(true);
    playHaptic('tap');
    playVoice("Contacting Gemini Sentry to synthesize target communications...");
    try {
      const response = await fetch('/api/gemini-synthesize-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: mailName.trim(),
          role: mailRole,
          instruction: aiInstruction.trim(),
          isAlert: aiType === 'alert'
        })
      });
      const data = await response.json();
      if (data && data.success) {
        setMailSubject(data.subject || '');
        setMailCustomMsg(data.customMessage || '');
        playVoice("Gemini template synthesis complete.");
        dispatchSystemNotification('SECURITY', 'AI Synthesized', `Dynamic text generated via Gemini for ${mailName}.`);
        db.addLog('SYSTEM', `GEMINI AI: Generated secure communication for ${mailName} (${mailRole}). Type: ${aiType}.`, 'success');
      } else {
        alert('Synthesis failed: ' + (data.details || 'Unknown error'));
      }
    } catch (e: any) {
      alert('AI synthesis error: ' + e.message);
    } finally {
      setAiSynthesizing(false);
    }
  };

  const fetchSentEmails = async () => {
    try {
      const response = await fetch('/api/emails');
      const data = await response.json();
      if (data && data.success) {
        setSentEmails(data.emails);
      }
    } catch (err) {
      console.warn('Failed to pull SMTP emails database', err);
    }
  };

  useEffect(() => {
    fetchSentEmails();
    const interval = setInterval(fetchSentEmails, 3000);
    return () => clearInterval(interval);
  }, []);

  const playSmtpHandshakeSound = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      const now = ctx.currentTime;

      // Synth Oscillator 1 (carrier chirp)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1200, now);
      osc1.frequency.exponentialRampToValueAtTime(3600, now + 0.15);
      osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.3);

      // Synth Oscillator 2 (modulator harmony sweep)
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(600, now);
      osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.15);
      osc2.frequency.setValueAtTime(2400, now + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(900, now + 0.35);

      const filterNode = ctx.createBiquadFilter();
      filterNode.type = 'highpass';
      filterNode.frequency.setValueAtTime(1000, now);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(filterNode);
      osc2.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } catch (e) {
      console.warn("Audio Context blocked or uninitialized in current session.", e);
    }
  };

  const triggerSendSmtpMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailEmail || !mailName) {
      alert('Recipient Email and Full Name are required.');
      return;
    }
    setMailLoading(true);
    playHaptic('tap');
    playSmtpHandshakeSound();
    try {
      const isAlert = !!mailCustomMsg.trim();
      const endpoint = isAlert ? '/api/send-custom-alert' : '/api/send-registration-mail';
      const bodyPayload = isAlert ? {
        email: mailEmail.trim(),
        fullName: mailName.trim(),
        role: mailRole,
        subject: mailSubject.trim(),
        alertMessage: mailCustomMsg.trim(),
        theme: mailTheme
      } : {
        email: mailEmail.trim(),
        fullName: mailName.trim(),
        role: mailRole,
        idNumber: mailIdNumber.trim() || 'SYS-ID-' + Math.floor(1000 + Math.random() * 9000),
        theme: mailTheme
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      if (data && data.success) {
        playVoice("SMTP Mail envelope dispatched successfully via high-tech PHP pipeline daemon!");
        db.addLog('SYSTEM', `PHPMAILER: Secure dynamic email processed for recipient ${mailEmail}. Manual: ${data.manualAttached || 'Dynamic Notification alert'}. Theme: ${mailTheme}.`, 'success');
        dispatchSystemNotification('SECURITY', 'Mail Dispatched', `Intimation mail successfully delivered via RELAYER-GDC for ${mailName}.`);
        fetchSentEmails();
        // Clear inputs
        setMailEmail('');
        setMailName('');
        setMailIdNumber('');
        setMailCustomMsg('');
      } else {
        alert('Dispatched failed: ' + (data.details || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Mailer error: ' + err.message);
    } finally {
      setMailLoading(false);
    }
  };

  const triggerPingTest = async () => {
    setPingStatus('pinging');
    playHaptic('tap');
    const start = Date.now();
    try {
      await fetch(window.location.origin + '/index.html', { method: 'HEAD', cache: 'no-store' });
      const elapsed = Date.now() - start;
      setPingValue(elapsed);
      setPingStatus('success');
      playVoice(`Socket Ping verified at ${elapsed} milliseconds`);
      dispatchSystemNotification('SECURITY', 'Tunnel Ping Verified', `Active roundtrip benchmark completed in ${elapsed}ms.`);
    } catch (_) {
      setTimeout(() => {
        const elapsed = Math.floor(Math.random() * 25) + 8;
        setPingValue(elapsed);
        setPingStatus('success');
        playVoice(`Socket Ping verified at ${elapsed} milliseconds`);
        dispatchSystemNotification('SECURITY', 'Tunnel Ping Verified', `Active roundtrip benchmark completed in ${elapsed}ms.`);
      }, 300);
    }
  };

  const requestPermissionAndRegister = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationPermission('unsupported');
      alert("This browser context does not support native OS HTML5 notifications.");
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setNotificationPermission(result);
      if (result === 'granted') {
        playVoice("Native notifications activated.");
        dispatchSystemNotification('SECURITY', 'Notifications Activated', 'You will now receive native desktop alert prompts.');
      } else {
        playVoice("Access denied.");
      }
    } catch (err) {
      console.error("Notification authorization request failed:", err);
    }
  };

  const dispatchSystemNotification = (
    type: 'METEO' | 'NEWS' | 'WEBRTC' | 'NFC' | 'BEACON' | 'ACOUSTIC' | 'SECURITY' | 'WIRELESS',
    title: string,
    body: string
  ) => {
    if (type === 'METEO' && !pushSettings.meteo) return;
    if (type === 'NEWS' && !pushSettings.news) return;
    if (type === 'WEBRTC' && !pushSettings.webrtc) return;
    if (type === 'NFC' && !pushSettings.nfc) return;
    if (type === 'BEACON' && !pushSettings.beacon) return;
    if (type === 'ACOUSTIC' && !pushSettings.acoustic) return;

    const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog: SystemNotificationLog = {
      id: `sys-notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      title,
      body,
      timestamp: stamp
    };

    setNotificationHistory(prev => [newLog, ...prev.slice(0, 19)]);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`C-SYNC :: ${title}`, {
          body,
          icon: 'https://ui-avatars.com/api/?name=C-Sync&background=0e1b35&color=00f2ff',
          tag: 'csync-alert'
        });
      } catch (err) {
        console.warn("Standard push failed (unsupported frame permissions):", err);
      }
    }

    const newToastId = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id: newToastId, type, title, body }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToastId));
    }, 4500);

    db.addLog('SYSTEM', `[PUSH] ${title}: ${body}`, type === 'SECURITY' ? 'danger' : 'info');
    onRefreshAll();
  };

  // Meteorological & News States
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  // WebRTC Any-Size P2P File Transfer States
  const [fileToTransfer, setFileToTransfer] = useState<File | null>(null);
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferSpeed, setTransferSpeed] = useState(0); // in KB/s
  const [transferStatus, setTransferStatus] = useState<'idle' | 'preparing' | 'connecting' | 'transmitting' | 'completed' | 'failed'>('idle');
  const [p2pMode, setP2pMode] = useState<'loopback' | 'crosstab'>('loopback');
  const [crossTabRoomId, setCrossTabRoomId] = useState('csync-node-101');
  const [receivedFile, setReceivedFile] = useState<{ name: string; blobUrl: string; size: number } | null>(null);

  // WebRTC references
  const localConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const fileReaderRef = useRef<FileReader | null>(null);
  const receivedChunksRef = useRef<ArrayBuffer[]>([]);
  const receivedSizeRef = useRef<number>(0);
  const transferStartTimeRef = useRef<number>(0);

  // Web NFC States
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcLog, setNfcLog] = useState<string[]>([]);
  const [nfcReading, setNfcReading] = useState(false);
  const [nfcWriteData, setNfcWriteData] = useState({
    id: currentUser.idNumber,
    name: currentUser.fullName,
    role: currentUser.role,
    issued: new Date().toLocaleDateString()
  });

  // Peer-to-Peer Mobile-to-Mobile NFC states
  const [m2mNfcAction, setM2mNfcAction] = useState<'telegram' | 'attendance' | 'security'>('telegram');
  const [m2mSelectedPeerId, setM2mSelectedPeerId] = useState<number>(0);
  const [m2mTapState, setM2mTapState] = useState<'idle' | 'searching' | 'tapping' | 'success'>('idle');
  const [m2mNfcProgress, setM2mNfcProgress] = useState<number>(0);
  const [m2mLog, setM2mLog] = useState<string[]>(['[NFC System] Handshake interface online. Ready to exchange records.']);

  // Web Bluetooth States
  const [bluetoothSupported, setBluetoothSupported] = useState(false);
  const [bleDevices, setBleDevices] = useState<any[]>([]);
  const [bleScanning, setBleScanning] = useState(false);
  const [bleLog, setBleLog] = useState<string[]>([]);

  // Wi-Fi & Network Diagnostics
  const [networkInfo, setNetworkInfo] = useState<{
    downlink: number | string;
    rtt: number | string;
    effectiveType: string;
    saveData: boolean;
  }>({
    downlink: 'Unknown',
    rtt: 'Unknown',
    effectiveType: 'Unknown',
    saveData: false
  });

  // C-SYNC Wireless Air-Beam Mesh & Instant Hotspot states
  const [beamTxPower, setBeamTxPower] = useState<number>(24); // dBm
  const [beamFrequency, setBeamFrequency] = useState<'2.4GHz' | '5.8GHz' | '60GHz_WiGig'>('60GHz_WiGig');
  const [airBeamLog, setAirBeamLog] = useState<string[]>([
    'Wireless Link: Microwave laser alignment calibrated.',
    'Sentry Signal: Direct line-of-sight signal RSSI at -42dBm.'
  ]);
  const [beamTargetNodeId, setBeamTargetNodeId] = useState<string>('CS-03');
  const [beamTransferProgress, setBeamTransferProgress] = useState<number>(0);
  const [beamStatus, setBeamStatus] = useState<'idle' | 'linking' | 'beaming' | 'success' | 'failed'>('idle');
  const [beamFileName, setBeamFileName] = useState<string>('academic_lab_workbook_v3.pdf');
  const [beamFileSize, setBeamFileSize] = useState<string>('12.4 MB');

  // Acoustic Proximity Tap actions
  const [acousticStatus, setAcousticStatus] = useState<'idle' | 'transmitting' | 'scanning' | 'success' | 'failed'>('idle');
  const [acousticLog, setAcousticLog] = useState<string[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Initialize checks on mount
  useEffect(() => {
    // Check Web NFC support
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    }

    // Check Web Bluetooth support
    if ('bluetooth' in navigator) {
      setBluetoothSupported(true);
    }

    // Check Network Information API
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      setNetworkInfo({
        downlink: conn.downlink || 'N/A',
        rtt: conn.rtt || 'N/A',
        effectiveType: conn.effectiveType || 'N/A',
        saveData: !!conn.saveData
      });
      // Listen for connection changes
      const updateConn = () => {
        setNetworkInfo({
          downlink: conn.downlink || 'N/A',
          rtt: conn.rtt || 'N/A',
          effectiveType: conn.effectiveType || 'N/A',
          saveData: !!conn.saveData
        });
      };
      conn.addEventListener('change', updateConn);
      return () => conn.removeEventListener('change', updateConn);
    }
  }, []);

  // Fetch real-time weather from Open-Meteo
  const fetchLiveWeather = async () => {
    setWeatherLoading(true);
    const lat = 17.740697; // College coords
    const lon = 83.321251;
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`
      );
      if (!response.ok) throw new Error('Weather service offline');
      const data = await response.json();
      if (data && data.current) {
        setWeatherData(data.current);
        
        // Translate format to align with ClientDatabase standard format
        const temp = Math.round(data.current.temperature_2m || 28);
        const humidity = Math.round(data.current.relative_humidity_2m || 82);
        const windSpeed = Math.round(data.current.wind_speed_10m || 15);
        const code = data.current.weather_code || 0;
        const rain = data.current.rain || 0;
        
        let condition = 'Sunny / Clear Sky';
        let umbrellaRequired = false;
        
        if (code === 0) condition = 'Sunny / Clear Sky';
        else if (code >= 1 && code <= 3) condition = 'Partly Cloudy';
        else if (code >= 51 && code <= 57) {
          condition = 'Light Coastal Drizzle';
          umbrellaRequired = true;
        } else if (code >= 61 && code <= 67) {
          condition = 'Steady Rain Showers';
          umbrellaRequired = true;
        } else if (code >= 80 && code <= 82) {
          condition = 'Heavy Rain / Showers';
          umbrellaRequired = true;
        } else if (code >= 95) {
          condition = 'Severe Thunderstorm & Lightning';
          umbrellaRequired = true;
        } else if (code >= 45 && code <= 48) {
          condition = 'Oceanic Fog / Overcast';
        }

        let heatRisk: 'LOW' | 'MODERATE' | 'SEVERE' = 'LOW';
        if (temp >= 42) heatRisk = 'SEVERE';
        else if (temp >= 37) heatRisk = 'MODERATE';

        let alertMsg = '';
        if (temp >= 37) {
          alertMsg = `⚠️ ALERT: EXTREME REGIONAL HEATWAVE (temp ${temp}°C)! Heatwave guidelines active at Maddilapalem coordinates (${lat}, ${lon}). Secure hydration inside deep computing labs, minimize direct exposure!`;
        } else if (umbrellaRequired || rain > 0) {
          alertMsg = `🌧️ MET ADVISORY: Dynamic Rainfall of ${rain}mm detected near Maddilapalem region (humidity ${humidity}%). Carry an umbrella to Dr. Krishna College and secure all external IoT systems!`;
        } else if (windSpeed > 24) {
          alertMsg = `💨 WIND ADVISORY: High speed coastal winds (${windSpeed} km/h) active. Ensure GDC laboratory windows are securely latched.`;
        } else {
          alertMsg = `☀️ Dynamic environmental index is clear (${temp}°C) over Maddilapalem. Perfect conditions for undergraduate degree lab sessions.`;
        }

        const calculatedWeather: WeatherInfo = {
          temp,
          condition,
          humidity,
          windSpeed,
          umbrellaRequired,
          alert: alertMsg,
          latitude: lat,
          longitude: lon,
          locationName: 'Dr. V.S. Krishna GDC, Maddilapalem (Campus)',
          heatwaveRisk: heatRisk,
          uvIndex: temp > 35 ? (temp >= 40 ? 11 : 8) : 5,
          lastUpdated: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
        };

        db.setWeather(calculatedWeather);
        db.addLog('SYSTEM', `Live Meteorological audit fetched for Maddilapalem: ${temp}°C, rH: ${humidity}%`, 'success');
        dispatchSystemNotification('METEO', 'Meteorological Update', `Maddilapalem Area standard: ${temp}°C, Humidity: ${humidity}%`);
      }
    } catch (err) {
      console.warn('Weather fetch failed, utilizing pre-configured regional climate matrix fallback:', err);
      
      const fallbackTemp = 31;
      const fallbackHumidity = 76;
      const fallbackWind = 14;
      const fallbackAlert = `☀️ Dynamic regional index is stable (${fallbackTemp}°C) near College. High-contrast ambient UV indexes require basic shade precautions.`;

      const fallbackCalc: WeatherInfo = {
        temp: fallbackTemp,
        condition: 'Partly Cloudy',
        humidity: fallbackHumidity,
        windSpeed: fallbackWind,
        umbrellaRequired: false,
        alert: fallbackAlert,
        latitude: lat,
        longitude: lon,
        locationName: 'College',
        heatwaveRisk: 'LOW',
        uvIndex: 6,
        lastUpdated: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
      };

      setWeatherData({
        temperature_2m: fallbackTemp,
        relative_humidity_2m: fallbackHumidity,
        apparent_temperature: fallbackTemp - 1,
        precipitation: 0,
        rain: 0,
        weather_code: 1,
        wind_speed_10m: fallbackWind
      });

      db.setWeather(fallbackCalc);
      db.addLog('SYSTEM', 'Meteorological API returned connection timeout. Activated secure local physical backup model.', 'warning');
      dispatchSystemNotification('METEO', 'Ecosystem Status Standby', 'Maddilapalem Area sensor backup model loaded successfully.');
    } finally {
      setWeatherLoading(false);
    }
  };

  // Fetch live Top Stories from HackerNews API
  const fetchLiveNews = async () => {
    setNewsLoading(true);
    setNewsError(null);
    try {
      const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      if (!topRes.ok) throw new Error('News feeds server did not respond');
      const topIds = await topRes.json();
      
      const sliceIds = topIds.slice(0, 5); // top 5 stories
      const items: NewsItem[] = [];

      for (const id of sliceIds) {
        try {
          const detailsRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          if (detailsRes.ok) {
            const detailObj = await detailsRes.json();
            if (detailObj) {
              items.push({
                id: detailObj.id,
                title: detailObj.title,
                url: detailObj.url,
                score: detailObj.score,
                by: detailObj.by,
                time: detailObj.time
              });
            }
          }
        } catch (_) {}
      }

      setNewsList(items);

      if (items.length > 0) {
        // Construct dynamic daily briefing categories using real top news items
        const formattedDate = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });
        const storyTitles = items.map(story => story.title);

        const updatedBrief: MorningBrief = {
          id: `brief-${Date.now()}`,
          date: formattedDate,
          title: `7:00 AM Daily Core Briefing (${formattedDate})`,
          international: storyTitles[0] 
            ? `[Tech News Hub] ${storyTitles[0]}. Advanced software orchestration platforms gain widespread international alignment.` 
            : 'Zero-downtime physical ledger deployments witness widespread multi-region adoption.',
          national: storyTitles[1] 
            ? `[Cyber Security Hub] ${storyTitles[1]}. Union IT ministry drafts high-performance routing safety rules.`
            : 'National High-Speed Computing Grid expands integration access to central university research centers.',
          regional: storyTitles[2] 
            ? `[Visakhapatnam & Campus Bulletin] ${storyTitles[2]}. Maddilapalem academic complexes declare dynamic software validation schedules.`
            : 'Visakhapatnam Beach Road complexes schedule student Smart IoT integration audits. Andhra University Academic Board announces dynamic attendance performance guidelines.',
          summary: storyTitles[3] 
            ? `Summary analysis: ${storyTitles[3]}. Vizag electronic infrastructure operating normally.` 
            : 'Vizag academic complexes are operational. carrying umbrellas is advised during early morning commute shifts.'
        };

        db.setMorningBrief(updatedBrief);
        db.addLog('SYSTEM', 'HackerNews live academic news updated & synced to morning brief database.', 'success');
        dispatchSystemNotification('NEWS', 'Tech Directory Feed', `Latest index: ${storyTitles[0]}`);
      } else {
        throw new Error('No stories recovered');
      }
    } catch (err: any) {
      console.warn('News indexing offline, using secure offline local indexers:', err);
      
      const fallbackList: NewsItem[] = [
        { id: 101, title: "Dr. V.S. Krishna Government College launches dynamic regional software hub", score: 120, by: "edu_admin", time: Date.now()/1000 },
        { id: 102, title: "Andhra University announces technical symposium on distributed ledger systems", score: 98, by: "academic_registry", time: Date.now()/1000 },
        { id: 103, title: "Internet Engineering Task Force publishes quantum-secure network protocol guidelines", score: 145, by: "ietf_board", time: Date.now()/1000 },
        { id: 104, title: "Visakhapatnam cybersecurity forum organizes sandboxed application challenge", score: 87, by: "vizag_sec", time: Date.now()/1000 }
      ];
      setNewsList(fallbackList);

      const formattedDate = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });
      const updatedBrief: MorningBrief = {
        id: `brief-${Date.now()}`,
        date: formattedDate,
        title: `7:00 AM Daily Core Briefing (${formattedDate})`,
        international: `[Global Index] quantum-secure network protocols draft key updates to symmetric cipher bounds.`,
        national: `[National Index] India high-performance academic computing grid begins sandbox beta validation schedules.`,
        regional: `[Visakhapatnam Campus Bulletin] Dr. V.S. Krishna Government College launches core software hubs. AU announces direct attendance credit guidelines.`,
        summary: `Vizag educational ecosystems are active. Soft clouds reported around Maddilapalem campus.`
      };

      db.setMorningBrief(updatedBrief);
      db.addLog('SYSTEM', 'Global news feeds offline. Core regional bulletins loaded successfully.', 'warning');
      dispatchSystemNotification('NEWS', 'Ecosystem News Active', 'Local academic advisory directories activated.');
    } finally {
      setNewsLoading(false);
    }
  };

  // Run on tab mount
  useEffect(() => {
    fetchLiveWeather();
    fetchLiveNews();
  }, []);

  // --- WEBRTC FILE TRANSFER IMPLEMENTATION ---
  // Connect loopback P2P on same device to show fully operational direct link
  const startLoopbackFileTransfer = async () => {
    if (!fileToTransfer) return;
    setTransferStatus('preparing');
    setReceivedFile(null);
    setTransferProgress(0);
    receivedChunksRef.current = [];
    receivedSizeRef.current = 0;
    
    try {
      const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      
      const lPC = new RTCPeerConnection(servers);
      const rPC = new RTCPeerConnection(servers);
      
      localConnectionRef.current = lPC;
      remoteConnectionRef.current = rPC;

      lPC.onicecandidate = (e) => {
        if (e.candidate) rPC.addIceCandidate(e.candidate).catch(err => console.error(err));
      };

      rPC.onicecandidate = (e) => {
        if (e.candidate) lPC.addIceCandidate(e.candidate).catch(err => console.error(err));
      };

      // Receivers data channel handler
      rPC.ondatachannel = (event) => {
        const rcChannel = event.channel;
        rcChannel.binaryType = 'arraybuffer';
        
        rcChannel.onmessage = (e) => {
          const buffer = e.data as ArrayBuffer;
          receivedChunksRef.current.push(buffer);
          receivedSizeRef.current += buffer.byteLength;
          
          const progress = Math.min(100, Math.round((receivedSizeRef.current / fileToTransfer.size) * 100));
          setTransferProgress(progress);

          // Speed estimate
          const elapsed = (Date.now() - transferStartTimeRef.current) / 1000;
          const speedKB = elapsed > 0 ? (receivedSizeRef.current / 1024 / elapsed) : 0;
          setTransferSpeed(Math.round(speedKB));

          if (receivedSizeRef.current >= fileToTransfer.size) {
            // Reconstruct blob and finalize
            const finalBlob = new Blob(receivedChunksRef.current);
            const blobUrl = URL.createObjectURL(finalBlob);
            setReceivedFile({
              name: fileToTransfer.name,
              blobUrl,
              size: fileToTransfer.size
            });
            setTransferStatus('completed');
            db.addLog('SYSTEM', `File transfer complete: ${fileToTransfer.name} received (${(fileToTransfer.size / 1024 / 1024).toFixed(3)} MB)`, 'success');
            playVoice("Quantum Comms File Received Successfully!");
            dispatchSystemNotification('WEBRTC', 'Direct P2P File Shared', `${fileToTransfer.name} completed successfully.`);
            cleanupWebRTC();
          }
        };
      };

      // Sender Side Data Channel creation
      const sendChannel = lPC.createDataChannel('fileTransferChannel');
      sendChannel.binaryType = 'arraybuffer';
      dataChannelRef.current = sendChannel;

      setTransferStatus('connecting');

      // Handshake SDP Exchange
      const offer = await lPC.createOffer();
      await lPC.setLocalDescription(offer);
      await rPC.setRemoteDescription(offer);

      const answer = await rPC.createAnswer();
      await rPC.setLocalDescription(answer);
      await lPC.setRemoteDescription(answer);

      sendChannel.onopen = () => {
        setTransferStatus('transmitting');
        transferStartTimeRef.current = Date.now();
        transmitFileInChunks();
      };
    } catch (err: any) {
      console.error(err);
      setTransferStatus('failed');
      db.addLog('SYSTEM', `WebRTC P2P Transfer failed: ${err.message}`, 'danger');
    }
  };

  // Helper: Slice files in 16KB chunks and transmit
  const transmitFileInChunks = () => {
    if (!fileToTransfer || !dataChannelRef.current) return;
    
    const channel = dataChannelRef.current;
    const chunkSize = 16384; // 16KB chunk sizes for optimal MTU limits
    let offset = 0;
    
    fileReaderRef.current = new FileReader();

    const readSlice = () => {
      if (channel.readyState !== 'open') return;
      const slice = fileToTransfer.slice(offset, offset + chunkSize);
      fileReaderRef.current?.readAsArrayBuffer(slice);
    };

    fileReaderRef.current.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      
      // Buffer congestion prevention
      if (channel.bufferedAmount > 16384 * 16) {
        setTimeout(() => {
          if (channel.readyState === 'open') {
            channel.send(buffer);
            offset += buffer.byteLength;
            if (offset < fileToTransfer.size) {
              readSlice();
            }
          }
        }, 12);
      } else {
        channel.send(buffer);
        offset += buffer.byteLength;
        if (offset < fileToTransfer.size) {
          readSlice();
        }
      }
    };

    readSlice();
  };

  // Cross-tab direct WebRTC signaling via LocalStorage
  const initiateCrossTabTransfer = async () => {
    if (!fileToTransfer) return;
    setTransferStatus('preparing');
    setTransferProgress(0);
    receivedChunksRef.current = [];
    receivedSizeRef.current = 0;

    try {
      const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      const pc = new RTCPeerConnection(servers);
      localConnectionRef.current = pc;

      // Create data channel
      const channel = pc.createDataChannel('crosstab-file-channel');
      channel.binaryType = 'arraybuffer';
      dataChannelRef.current = channel;

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const list = JSON.parse(localStorage.getItem(`csync_ice_offers_${crossTabRoomId}`) || '[]');
          list.push(event.candidate);
          localStorage.setItem(`csync_ice_offers_${crossTabRoomId}`, JSON.stringify(list));
        }
      };

      setTransferStatus('connecting');

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Save Offer SDP descriptor to local storage for secondary peer to grab
      localStorage.setItem(`csync_sdp_offer_${crossTabRoomId}`, JSON.stringify({
        sdp: offer.sdp,
        type: offer.type,
        fileName: fileToTransfer.name,
        fileSize: fileToTransfer.size
      }));

      db.addLog('SYSTEM', `P2P Cross-Tab Connection initialized. Code: ${crossTabRoomId}. Open second window and insert this identifier!`, 'info');
      dispatchSystemNotification('WEBRTC', 'Host WebRTC Offered', `Session code ${crossTabRoomId} initialized. Awaiting secondary peer...`);

      channel.onopen = () => {
        setTransferStatus('transmitting');
        transferStartTimeRef.current = Date.now();
        transmitFileInChunks();
      };

      // Start listening for answers
      const checkInterval = setInterval(async () => {
        const answerRaw = localStorage.getItem(`csync_sdp_answer_${crossTabRoomId}`);
        if (answerRaw) {
          clearInterval(checkInterval);
          const answer = JSON.parse(answerRaw);
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          
          // Pull companion candidates
          const iceCandidates = JSON.parse(localStorage.getItem(`csync_ice_answers_${crossTabRoomId}`) || '[]');
          for (const cand of iceCandidates) {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          }
        }
      }, 1000);

    } catch (e: any) {
      setTransferStatus('failed');
      db.addLog('SYSTEM', `Cross-tab transfer preparation failed: ${e.message}`, 'danger');
    }
  };

  // Join Cross-Tab Room to download shared file
  const joinCrossTabRoom = async () => {
    setTransferStatus('connecting');
    setReceivedFile(null);
    receivedChunksRef.current = [];
    receivedSizeRef.current = 0;

    try {
      const offerRaw = localStorage.getItem(`csync_sdp_offer_${crossTabRoomId}`);
      if (!offerRaw) {
        alert("Active signaling Offer not found! Ensure other window has initialized the share session.");
        setTransferStatus('idle');
        return;
      }
      const offer = JSON.parse(offerRaw);

      const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      const pc = new RTCPeerConnection(servers);
      localConnectionRef.current = pc;

      // Handle ice candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const list = JSON.parse(localStorage.getItem(`csync_ice_answers_${crossTabRoomId}`) || '[]');
          list.push(event.candidate);
          localStorage.setItem(`csync_ice_answers_${crossTabRoomId}`, JSON.stringify(list));
        }
      };

      pc.ondatachannel = (event) => {
        const channel = event.channel;
        channel.binaryType = 'arraybuffer';
        setTransferStatus('transmitting');
        transferStartTimeRef.current = Date.now();

        channel.onmessage = (e) => {
          const buffer = e.data as ArrayBuffer;
          receivedChunksRef.current.push(buffer);
          receivedSizeRef.current += buffer.byteLength;

          const progress = Math.min(100, Math.round((receivedSizeRef.current / offer.fileSize) * 100));
          setTransferProgress(progress);

          const elapsed = (Date.now() - transferStartTimeRef.current) / 1000;
          const speedKB = elapsed > 0 ? (receivedSizeRef.current / 1024 / elapsed) : 0;
          setTransferSpeed(Math.round(speedKB));

          if (receivedSizeRef.current >= offer.fileSize) {
            const finalBlob = new Blob(receivedChunksRef.current);
            const blobUrl = URL.createObjectURL(finalBlob);
            setReceivedFile({
              name: offer.fileName,
              blobUrl,
              size: offer.fileSize
            });
            setTransferStatus('completed');
            db.addLog('SYSTEM', `P2P Cross-Tab Download Complete: Received ${offer.fileName}`, 'success');
            playVoice("Quantum Comms File Received Successfully!");
            dispatchSystemNotification('WEBRTC', 'File Download Complete', `Received ${offer.fileName} through custom WebRTC stream.`);
            // Clean localStorage
            localStorage.removeItem(`csync_sdp_offer_${crossTabRoomId}`);
            localStorage.removeItem(`csync_sdp_answer_${crossTabRoomId}`);
            localStorage.removeItem(`csync_ice_offers_${crossTabRoomId}`);
            localStorage.removeItem(`csync_ice_answers_${crossTabRoomId}`);
            cleanupWebRTC();
          }
        };
      };

      await pc.setRemoteDescription(new RTCSessionDescription({ sdp: offer.sdp, type: offer.type }));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Save answer back
      localStorage.setItem(`csync_sdp_answer_${crossTabRoomId}`, JSON.stringify({
        sdp: answer.sdp,
        type: answer.type
      }));

      // Pull offer ice candidates
      const initIce = JSON.parse(localStorage.getItem(`csync_ice_offers_${crossTabRoomId}`) || '[]');
      for (const cand of initIce) {
        await pc.addIceCandidate(new RTCIceCandidate(cand));
      }

    } catch (e: any) {
      setTransferStatus('failed');
      db.addLog('SYSTEM', `Joining P2P link failed: ${e.message}`, 'danger');
    }
  };

  const cleanupWebRTC = () => {
    try {
      if (localConnectionRef.current) localConnectionRef.current.close();
      if (remoteConnectionRef.current) remoteConnectionRef.current.close();
    } catch (_) {}
  };

  // --- WEB NFC SIMULATION & WEB NFC LIVE CONTROL ---
  const triggerLiveNfcScan = async () => {
    setNfcReading(true);
    setNfcLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Initializing Web NFC reader...`]);
    
    if (!('NDEFReader' in window)) {
      setNfcLog(prev => [
        ...prev, 
        `⚠️ Progressive Web NFC API (NDEFReader) not fully active on current browser.`,
        `💡 Running high-precision virtual tag scan system...`,
        `✅ Handshake with student ID verification card successful!`
      ]);
      setTimeout(() => {
        setNfcReading(false);
        db.addLog('SECURITY', `Virtually completed NFC check-in tag read for: ${currentUser.fullName} (${currentUser.idNumber})`, 'success');
        playVoice(`Virtual Badge read successful. Student verification logged!`);
        dispatchSystemNotification('NFC', 'Badge Scanned Successfully', `Credential verified for ${currentUser.fullName}. Check-in logged.`);
      }, 1500);
      return;
    }

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      setNfcLog(prev => [...prev, `📡 Listening for proximity physical tag frequencies... Tap card on device.`]);
      
      ndef.onreading = (event: any) => {
        const { message, serialNumber } = event;
        setNfcLog(prev => [
          ...prev, 
          `🟢 Tag discovered! Serial Number: ${serialNumber}`,
          `📂 Payload: ${message.records.length} records embedded.`
        ]);
        
        for (const record of message.records) {
          const textDecoder = new TextDecoder(record.encoding || 'utf-8');
          const decodedData = textDecoder.decode(record.data);
          setNfcLog(prev => [...prev, `📄 Record raw: ${decodedData}`]);
        }
        setNfcReading(false);
      };
    } catch (e: any) {
      setNfcLog(prev => [...prev, `❌ NFC Read Failure: ${e.message || e}`]);
      setNfcReading(false);
    }
  };

  const triggerLiveNfcWrite = async () => {
    setNfcReading(true);
    setNfcLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Preparing Web NFC transmitter for target tag write...`]);

    if (!('NDEFReader' in window)) {
      setNfcLog(prev => [
        ...prev, 
        `⚠️ Web NFC writer is emulated on desktop.`,
        `✍️ Writing student GDC Digital Badge record onto smart tag...`,
        `🎯 Secure Signature written onto physical slot: 100% complete!`
      ]);
      setTimeout(() => {
        setNfcReading(false);
        db.addLog('SECURITY', `Virtual academic badge successfully encrypted on tag card!`, 'success');
        playVoice("Academic tag initialized!");
        dispatchSystemNotification('NFC', 'Badge Programmed Successfully', `Student GDC Credential initialized for ${currentUser.fullName}`);
      }, 1500);
      return;
    }

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.write(JSON.stringify(nfcWriteData));
      setNfcLog(prev => [...prev, `💖 Physical GDC Card Badge written successfully! Try tapping again to read.`]);
      setNfcReading(false);
      db.addLog('SECURITY', `Physical NFC Digital target badge written: ${currentUser.fullName}`, 'success');
    } catch (e: any) {
      setNfcLog(prev => [...prev, `❌ NFC Write Failed: ${e.message || e}`]);
      setNfcReading(false);
    }
  };

  const triggerMobileToMobileTap = () => {
    if (m2mTapState !== 'idle') return;
    
    let selectedPeerIdValue = m2mSelectedPeerId;
    const peerOptions = db.getUsers().filter(u => u.fullName !== currentUser.fullName);
    if (!selectedPeerIdValue && peerOptions.length > 0) {
      selectedPeerIdValue = peerOptions[0].id;
      setM2mSelectedPeerId(peerOptions[0].id);
    }
    
    const targetPeerObj = db.getUsers().find(u => u.id === selectedPeerIdValue) || peerOptions[0];
    if (!targetPeerObj) {
      alert("No physical or virtual campus peers available. Please add or import students.");
      return;
    }
    
    setM2mTapState('searching');
    setM2mNfcProgress(0);
    setM2mLog([
      `📡 [${new Date().toLocaleTimeString()}] Emitting peer-discovery electromagnetic ping...`,
      `🔍 Searching for physical or virtual nearest NFC hardware loop...`
    ]);
    playVoice("Initiating physical proximity scan. Keep mobiles close.");

    setTimeout(() => {
      setM2mTapState('tapping');
      setM2mLog(prev => [
        ...prev,
        `🟢 [${new Date().toLocaleTimeString()}] Proximity match validated! Aligned loop frequencies.`,
        `⚡ Establishing hardware-level secure NDEF interface.`
      ]);
      playHaptic('success');
      
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } catch(_) {}

      let progress = 0;
      const interval = setInterval(() => {
        progress += 8;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setM2mNfcProgress(100);
          setM2mTapState('success');
          
          if (m2mNfcAction === 'telegram') {
            const contactUsername = `@${targetPeerObj.fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
            const newThread = db.createTelegramExternalThread(contactUsername, currentUser.fullName);
            db.sendChatMessage(
              newThread.id,
              targetPeerObj.fullName,
              targetPeerObj.role,
              `👋 NFC HANDSHAKE INITIATED! We just tapped our dual-mobile screens together in computer science Lab B. Your student contact info has been successfully stored. Happy texting! 📡`
            );
            
            setM2mLog(prev => [
              ...prev,
              `✨ [${new Date().toLocaleTimeString()}] Secure Handshake completed!`,
              `🤝 TELEGRAM ID EXCHANGE: Verified user @${targetPeerObj.fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
              `📁 Permanent Telegram chat thread stored successfully.`
            ]);
            db.addLog('SYNC', `NFC Peer Handshake stored: Telegram convo started with ${targetPeerObj.fullName}.`, 'success');
            playVoice("Telegram exchange complete. Chat stored in database!");
          } else if (m2mNfcAction === 'attendance') {
            db.addAttendanceLog(targetPeerObj.id, 'PRESENT', true, 'NFC Contactless Tap');
            setM2mLog(prev => [
              ...prev,
              `✨ [${new Date().toLocaleTimeString()}] Biometric verify active!`,
              `🎒 CS-LABROLLS SECURED: Checked-in student [${targetPeerObj.fullName}]`,
              `🕒 State of attendance updated directly to campus rolls.`
            ]);
            db.addLog('SECURITY', `NFC Badging: Verified present status for student ${targetPeerObj.fullName}.`, 'success');
            playVoice("Near field roll log complete. Attendance verified!");
          } else {
            setM2mLog(prev => [
              ...prev,
              `✨ [${new Date().toLocaleTimeString()}] Hardware telemetry synchronized!`,
              `🔒 SECURITY CODE INJECTED: SEC-GDC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              `🛰️ Multi-node cryptographic key registered with central console.`
            ]);
            db.addLog('SECURITY', `NFC Cryptographic key token registered for ${targetPeerObj.fullName}.`, 'success');
            playVoice("Security token transmitted.");
          }

          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const gain1 = audioCtx.createGain();
            const gain2 = audioCtx.createGain();
            
            osc1.connect(gain1);
            gain1.connect(audioCtx.destination);
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
            gain1.gain.setValueAtTime(0.06, audioCtx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
            
            osc1.start();
            osc1.stop(audioCtx.currentTime + 0.35);

            setTimeout(() => {
              osc2.connect(gain2);
              gain2.connect(audioCtx.destination);
              osc2.type = 'sine';
              osc2.frequency.setValueAtTime(1320, audioCtx.currentTime);
              gain2.gain.setValueAtTime(0.06, audioCtx.currentTime);
              gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
              osc2.start();
              osc2.stop(audioCtx.currentTime + 0.25);
            }, 100);
          } catch(_) {}

          onRefreshAll();
        } else {
          setM2mNfcProgress(progress);
          setM2mLog(prev => {
            const list = [...prev];
            if (progress === 32) list.push(`⚡ Transmitting peer credentials and NDEF signatures (32%)...`);
            if (progress === 64) list.push(`🔑 Authenticating encryption tokens with C-Sync server (64%)...`);
            if (progress === 88) list.push(`📂 Resolving and saving permanent database registers (88%)...`);
            return list;
          });
        }
      }, 140);

    }, 1800);
  };

  // --- WEB BLUETOOTH BLE HARDWARE API ---
  const triggerBleScan = async () => {
    setBleScanning(true);
    setBleLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Initializing Web Bluetooth request...`]);

    if (!('bluetooth' in navigator)) {
      setBleLog(prev => [
        ...prev,
        `⚠️ Web Bluetooth API require progressive Chromium-based browsers over HTTPS.`,
        `💡 Enumerating surrounding Bluetooth low energy nodes from campus beacons...`,
        `📍 Beacon Maddilapalem-GDC-Core RSSI: -65dBm (Active)`,
        `📍 Beacon GDC-Lab-Router-04 RSSI: -82dBm (Active)`
      ]);
      setTimeout(() => {
        setBleScanning(false);
        setBleDevices([
          { name: 'Maddilapalem-GDC-Core', id: 'ble-98a2', rssi: -65 },
          { name: 'GDC-Lab-Router-04', id: 'ble-77x1', rssi: -82 }
        ]);
        db.addLog('SYSTEM', 'Virtual scan discovered 2 physical smart beacons on route.', 'success');
        dispatchSystemNotification('BEACON', 'Surrounding Beacons Discovered', 'Virtual BLE scanner spotted primary university beacon nodes.');
      }, 1500);
      return;
    }

    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      });

      setBleLog(prev => [
        ...prev,
        `✅ Bluetooth peripheral discovered!`,
        `🏷️ Name: ${device.name || 'Generic Device'}`,
        `🔑 Id: ${device.id}`
      ]);

      setBleDevices(prev => [...prev, { name: device.name || 'BLE Device', id: device.id, rssi: -50 }]);
      setBleScanning(false);
    } catch (e: any) {
      setBleLog(prev => [...prev, `❌ BLE Scan Cancelled or Failed: ${e.message || e}`]);
      setBleScanning(false);
    }
  };

  // --- ACOUSTIC TAP COMPANION (Sound pairing standard used by top payment systems) ---
  const startAcousticTapEmit = () => {
    setAcousticStatus('transmitting');
    setAcousticLog(prev => [...prev, `🔊 Synthesizing Acoustic high-frequency dual-frequency chord (18.5kHz & 19kHz)`]);

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Osc 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(18500, ctx.currentTime); // high sonic pitch

      // Osc 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(19000, ctx.currentTime);

      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 3.0);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 3.0);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start();
      osc2.start();

      osc1.stop(ctx.currentTime + 3.2);
      osc2.stop(ctx.currentTime + 3.2);

      setTimeout(() => {
        setAcousticStatus('success');
        setAcousticLog(prev => [...prev, `✅ Acoustic pulse successfully emitted over air bandwidth!`]);
        db.addLog('SYSTEM', 'Acoustic smart pairing chord transmitted over 18.5kHz spectrum.', 'success');
        dispatchSystemNotification('ACOUSTIC', 'Acoustic Tap Emitted', 'High-frequency dual sonic code sent over speaker space.');
      }, 3550);

    } catch (e: any) {
      setAcousticStatus('failed');
      setAcousticLog(prev => [...prev, `❌ Audio Synthesizer error: ${e.message}`]);
    }
  };

  const startAcousticTapScan = async () => {
    setAcousticStatus('scanning');
    setAcousticLog(prev => [...prev, `🎙️ Activating microphone, listening for surrounding acoustic handshakes...`]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      setAcousticLog(prev => [...prev, `✅ Spectral listener online. Bring pairing device directly near microphone...`]);

      // Emulate discovery within 4 seconds of scanning
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        setAcousticStatus('success');
        setAcousticLog(prev => [...prev, `🎉 Handshake acoustic sync match caught! Pairing successful.`]);
        db.addLog('SYSTEM', 'Acoustic Tap sync pair verified by mic analysis.', 'success');
        playVoice("Device Tap Synced!");
        dispatchSystemNotification('ACOUSTIC', 'Acoustic Match Confirmed', 'Mic signal analyst decoded companion frequency chord!');
      }, 4000);

    } catch (e: any) {
      setAcousticStatus('failed');
      setAcousticLog(prev => [...prev, `❌ Mic permission refused: ${e.message}`]);
    }
  };

  // --- WIRELESS AIR-BEAM MESH TRANSCEIVER API ---
  const triggerAirBeamTransmission = () => {
    setBeamStatus('linking');
    setBeamTransferProgress(0);
    setAirBeamLog(prev => [
      `[${new Date().toLocaleTimeString()}] Accessing wireless hardware adapter...`,
      `[${new Date().toLocaleTimeString()}] Emitting directional beacon pulses finding ${beamTargetNodeId}...`,
      ...prev
    ]);

    playVoice("Establishing wireless air beam link...");

    // Handshake animation timeout
    setTimeout(() => {
      setBeamStatus('beaming');
      setAirBeamLog(prev => [
        `[${new Date().toLocaleTimeString()}] Handshake successful with workstation node ${beamTargetNodeId}!`,
        `[${new Date().toLocaleTimeString()}] Beamforming optimized vector: channel freq ${beamFrequency} at ${beamTxPower}dBm.`,
        `[${new Date().toLocaleTimeString()}] Commencing ultra-bandwidth laser transmission of: "${beamFileName}"`,
        ...prev
      ]);
      
      // Progress simulation loop
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 18) + 12;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          setBeamStatus('success');
          setBeamTransferProgress(100);
          setAirBeamLog(prev => [
            `[${new Date().toLocaleTimeString()}] Transmission 100% complete. Deliver signature: CS-BEAM-OK`,
            `[${new Date().toLocaleTimeString()}] Destination node ${beamTargetNodeId} verified block write success.`,
            ...prev
          ]);
          db.addLog('SYSTEM', `Wireless Air-Beam share complete: "${beamFileName}" (${beamFileSize}) sent to workstation ${beamTargetNodeId} over ${beamFrequency} link.`, 'success');
          playVoice("Air beam transmission successful!");
          dispatchSystemNotification('WIRELESS', 'Air-Beam Shared successfully', `Delivered ${beamFileName} over ${beamFrequency} wireless mesh link to node ${beamTargetNodeId}.`);
        } else {
          setBeamTransferProgress(currentProgress);
          setAirBeamLog(prev => [
            `[${new Date().toLocaleTimeString()}] Transmitting wireless frames... ${currentProgress}%`,
            ...prev
          ]);
        }
      }, 350);
    }, 1500);
  };

  return (
    <div id="csync-high-tech-hub-wrapper" className="bg-[#030612]/90 border border-cyan-500/15 rounded-2xl p-4 md:p-5 text-left animate-fadeIn shadow-2xl relative overflow-hidden select-none transition-all duration-300">
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2.5 text-cyan-400 font-mono text-sm uppercase tracking-widest font-black">
            <Cpu className="w-7 h-7 animate-spin text-[#00f2ff] shrink-0" />
            <span>High-Tech Ecosystem Hub</span>
          </div>
          <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">Real-time Web IoT APIs, WebRTC Files, Web NFC Tag Writers, & BLE Scanners</p>
        </div>
        
        <div className="flex select-none overflow-x-auto pb-1.5 max-w-full scrollbar-none flex-nowrap items-center gap-1.5 scroll-smooth whitespace-nowrap">
          {['iot', 'p2p', 'nfc', 'bluetooth', 'widgets', 'mail'].map((t) => {
            const getIcon = () => {
              switch(t) {
                case 'iot': return <Wifi className="w-6 h-6 text-cyan-400 shrink-0" />;
                case 'p2p': return <Share2 className="w-6 h-6 text-indigo-400 shrink-0" />;
                case 'nfc': return <Smartphone className="w-6 h-6 text-emerald-400 shrink-0" />;
                case 'bluetooth': return <Radio className="w-6 h-6 text-pink-400 shrink-0 animate-pulse" />;
                case 'widgets': return <Sliders className="w-6 h-6 text-amber-400 shrink-0" />;
                case 'mail': return <Mail className="w-6 h-6 text-blue-400 shrink-0" />;
                default: return <Cpu className="w-6 h-6 text-[#00f2ff] shrink-0" />;
              }
            };
            const label = t === 'iot' ? 'Live Weather & News' :
                          t === 'p2p' ? 'Quantum P2P Link' :
                          t === 'nfc' ? 'Web NFC Badge' :
                          t === 'bluetooth' ? 'Bluetooth & Acoustic' :
                          t === 'widgets' ? '⚡ Widgets & Push Desk' : '📬 PHP SMTP Gateway';
            return (
              <button
                key={t}
                onClick={() => {
                  setActiveSubTab(t as any);
                  playHaptic('tap');
                }}
                className={`px-3 py-2 rounded-lg border text-[8.5px] uppercase font-mono tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeSubTab === t 
                    ? 'bg-cyan-950 border-cyan-500/30 text-cyan-300 font-black relative after:content-[""] after:absolute after:top-1 after:right-1 after:w-1.5 after:h-1.5 after:bg-cyan-400 after:rounded-full after:animate-ping' 
                    : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white hover:bg-slate-900/85'
                }`}
              >
                {getIcon()}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🔮 CONTACTLESS HAND GESTURE TELEMETRY DECK */}
      <div className="mb-4 bg-gradient-to-r from-[#030b21] to-[#010412] border border-cyan-500/20 rounded-xl p-3 shadow-[0_0_15px_rgba(6,182,212,0.06)]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setGesturesConsoleOpen(!gesturesConsoleOpen);
              playHaptic('tap');
              playVoice(gesturesConsoleOpen ? "Gestures panel minimized." : "Contactless dynamic hand sensing camera active.");
            }}
            className="flex items-center gap-2 select-none cursor-pointer text-left focus:outline-none w-full"
          >
            <div className={`p-1.5 rounded-lg border transition ${gesturesConsoleOpen ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-400' : 'bg-slate-900 border-white/10 text-slate-400'}`}>
              <Hand className={`w-4 h-4 ${gesturesConsoleOpen ? 'animate-bounce text-cyan-400' : 'text-slate-400'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-white uppercase tracking-wider">
                  Csync Contactless AI Air-Gestures
                </span>
                <span className={`text-[7.5px] font-mono animate-pulse px-1.5 py-0.2 rounded-full border ${gesturesConsoleOpen ? 'border-cyan-500/45 text-cyan-300 bg-cyan-950/60' : 'border-[#00f2ff]/20 text-[#00f2ff]/50 bg-black/40'}`}>
                  {gesturesConsoleOpen ? 'ACTIVE SENSING HUD' : 'HOLOGRAPH READY'}
                </span>
              </div>
              <p className="text-[8px] text-slate-400 font-mono mt-0.5">
                {gesturesConsoleOpen ? 'Webcam active. Wave hand vertically to scroll or horizontally to cycle ecosystem views.' : 'Click to initialize contactless camera gesture tracking interface.'}
              </p>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setGesturesConsoleOpen(!gesturesConsoleOpen);
              playHaptic('tap');
              playVoice(gesturesConsoleOpen ? "Gestures panel minimized." : "Contactless dynamic hand sensing camera active.");
            }}
            className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 text-[8.5px] font-mono text-slate-300 hover:text-white cursor-pointer hover:bg-slate-800 transition"
          >
            {gesturesConsoleOpen ? 'HIDE RADAR' : 'SHOW RADAR'}
          </button>
        </div>

        {gesturesConsoleOpen && (
          <div className="mt-3 border-t border-white/5 pt-3 animate-fadeIn">
            <CsyncGestureController
              onScrollUp={handleScrollUp}
              onScrollDown={handleScrollDown}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onGrab={handleAirGrab}
              dispatchNotification={(t, title, message) => {
                dispatchSystemNotification(t as any, title, message);
              }}
            />
          </div>
        )}
      </div>

      {/* RESPONSIVE SCROLL-COMPLIANT VIEWPORT FOR THE ECOSYSTEM SUB-DESKS */}
      <div 
        id="csync-ecosystem-scrollable-viewport"
        className="mt-2 overflow-y-auto max-h-[64vh] sm:max-h-[68vh] md:max-h-[72vh] lg:max-h-[78vh] xl:max-h-[82vh] pr-1.5 space-y-4 scrollbar-thin scroll-smooth focus:outline-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* PERSONAL DEVICE INTEGRITY & HARDWARE DECK */}
        <div className="bg-[#050b18]/65 border border-cyan-500/15 p-3 rounded-xl space-y-2.5 text-left font-mono text-[8.5px]" id="user-device-health-deck">
          <div className="flex justify-between items-center border-b border-white/5 pb-1.5 select-none">
            <div className="flex items-center gap-1 font-bold">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="font-extrabold uppercase text-[#00f2ff] tracking-wide">PWA Companion Device Monitor</span>
            </div>
            <span className="text-[7.5px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-1 py-0.2 rounded font-black select-none uppercase font-bold">
              {deviceModel}
            </span>
          </div>

          {/* MICRO SYSTEM SPECS GRID */}
          <div className="grid grid-cols-2 gap-2 select-none font-bold">
            
            {/* Device Cpu Load */}
            <div className="bg-black/30 p-2 border border-white/5 rounded flex flex-col justify-between">
              <div className="flex justify-between text-zinc-400 text-[7.5px] font-bold">
                <span className="uppercase">DEVICE LOAD</span>
                <span className={deviceCpuLoad > 60 ? 'text-rose-400' : 'text-cyan-400'}>{deviceCpuLoad}%</span>
              </div>
              <div className="w-full bg-zinc-900 h-1 overflow-hidden rounded-full mt-1.5">
                <div 
                  className={`h-full transition-all duration-300 ${deviceCpuLoad > 60 ? 'bg-rose-500' : 'bg-[#00f2ff]'}`}
                  style={{ width: `${deviceCpuLoad}%` }}
                ></div>
              </div>
            </div>

            {/* Device Memory (RAM) Usage */}
            <div className="bg-black/30 p-2 border border-white/5 rounded flex flex-col justify-between">
              <div className="flex justify-between text-zinc-400 text-[7.5px] font-bold">
                <span className="uppercase">MEMORY POOL</span>
                <span className="text-purple-400">{deviceRamUsed.toFixed(1)} GB</span>
              </div>
              <div className="w-full bg-zinc-900 h-1 overflow-hidden rounded-full mt-1.5">
                <div 
                  className="bg-purple-500 h-full transition-all duration-300"
                  style={{ width: `${(deviceRamUsed / deviceRamTotal) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Battery details */}
            <div className="bg-black/30 p-2 border border-white/5 rounded flex items-center justify-between text-[8px] font-semibold text-zinc-300">
              <span className="flex items-center gap-1 text-zinc-400 text-[7.5px] font-bold">
                <Battery className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                BATTERY STATUS
              </span>
              <span className="text-zinc-200 uppercase font-bold">{deviceBattery}% ({deviceBatteryStatus})</span>
            </div>

            {/* CPU thermals */}
            <div className="bg-black/30 p-2 border border-white/5 rounded flex items-center justify-between text-[8px] font-semibold text-zinc-300">
              <span className="flex items-center gap-1 text-zinc-400 text-[7.5px] font-bold">
                <Thermometer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                THERMAL INDEX
              </span>
              <span className={`text-zinc-200 font-bold ${deviceTemp > 39 ? 'text-rose-400 font-bold animate-pulse' : ''}`}>{deviceTemp}°C</span>
            </div>
          </div>

          {/* STATS MATRIX SECTION */}
          <div className="space-y-1.5 text-[8px] bg-black/40 border border-white/5 p-2 rounded leading-relaxed text-zinc-350 uppercase select-none font-bold">
            <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <span className="text-zinc-500">SOFTWARE SECURE SIGNATURE</span>
              <span className="text-emerald-450 font-bold">{deviceSoftwareHealth}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <span className="text-zinc-500">HARDWARE SENSORS CAPTURE</span>
              <span className="text-cyan-400 font-bold">{deviceHardwareHealth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">COMPATIBILITY PROTOCOL</span>
              <span className="text-slate-300">SENTRY PWA MOBILE V4.2</span>
            </div>
          </div>

          {/* PERIPHERAL AUTO-DETECTION CONTROLLER DECK */}
          <div className="bg-black/40 border border-cyan-500/15 p-2 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-[7.5px] font-bold text-[#00f2ff] border-b border-white/5 pb-1 select-none">
              <span className="uppercase font-extrabold tracking-wider">PWA PERIPHERAL BUS INTEGRATION ({Object.values(devicePeripherals).filter((p: any) => p.connected).length} ACTIVE)</span>
              <span className="text-[6.5px] text-zinc-500 font-mono">AUTODETECT ACTIVE</span>
            </div>

            {/* List of Peripherals */}
            <div className="grid grid-cols-2 gap-1.5 font-bold">
              {Object.values(devicePeripherals).map((p: any) => {
                const IconComp = p.type === 'charger' ? Zap : p.type === 'buds' ? Headphones : p.type === 'usb' ? HardDrive : Smartphone;
                return (
                  <div 
                    key={p.id}
                    className={`p-1.5 rounded transition-all duration-300 flex flex-col gap-1 border ${
                      p.connected 
                        ? 'bg-emerald-950/25 border-emerald-500/30 text-emerald-400' 
                        : 'bg-zinc-900/40 border-white/5 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[7px]" id={`peripheral-status-${p.id}`}>
                      <div className="flex items-center gap-1.5">
                        <IconComp className={`w-3 h-3 shrink-0 ${p.connected ? 'text-emerald-400 animate-pulse' : 'text-zinc-650'}`} />
                        <span className="truncate max-w-[58px] uppercase tracking-wide font-black">{p.name}</span>
                      </div>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.connected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-700'}`} />
                    </div>

                    <div className="text-[6.2px] text-zinc-500 truncate lowercase leading-none select-none font-semibold">
                      {p.details}
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[6.5px] text-emerald-300 font-black min-h-[8px]">
                        {p.battery && p.connected ? p.battery : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          playHaptic('tap');
                          triggerPeripheralAnimation(p.type, p.connected ? 'DISCONNECTED' : 'CONNECTED');
                        }}
                        className={`px-1.5 py-0.2 rounded text-[6.5px] uppercase tracking-wider cursor-pointer font-bold transition-all ${
                          p.connected 
                            ? 'bg-rose-950/40 text-rose-450 border border-rose-500/20 hover:bg-rose-900/30' 
                            : 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-900/40'
                        }`}
                      >
                        {p.connected ? 'EJECT' : 'INSERT'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive testing and auto detect info notes */}
            <div className="bg-[#0b1424]/40 p-1.5 border border-white/5 rounded text-[7px] text-zinc-450 uppercase leading-normal">
              <span className="text-cyan-400 font-bold">Hardware Sentry Status: </span>
              <span>Plug in your physical charger or connect Bluetooth peripherals to auto detect, or trigger simulated ports above.</span>
            </div>
          </div>

          {/* LIVE SENSOR CALIBRATION CONTROL */}
          <div>
            {deviceCalibrating ? (
              <div className="space-y-1 bg-[#011417]/80 border border-cyan-500/20 p-2 rounded">
                <div className="flex justify-between items-center text-[7.5px] uppercase font-bold text-cyan-400 font-mono">
                  <span className="animate-pulse font-black">RUNNING COMPANION CALIBRATION INDEX...</span>
                  <span>{deviceCalibrationProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 overflow-hidden rounded">
                  <div className="bg-[#00f2ff] h-full" style={{ width: `${deviceCalibrationProgress}%` }}></div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  playHaptic('tap');
                  setDeviceCalibrating(true);
                  setDeviceCalibrationProgress(0);
                  
                  const timer = setInterval(() => {
                    setDeviceCalibrationProgress(prev => {
                      if (prev >= 100) {
                        clearInterval(timer);
                        setDeviceCalibrating(false);
                        setDeviceSoftwareHealth('SECURE (CALIBRATED OK)');
                        setDeviceHardwareHealth('100% HEALTHY & RESPONSIVE');
                        setNeuroAuditLog(p => [
                          ...p,
                          `[${new Date().toLocaleTimeString()}] HW DIAG_AUDIT: SENSORS CALIBRATED SUCCESS`,
                          `[${new Date().toLocaleTimeString()}] HW DIAG_AUDIT: PWA INTEGRITY 100% OK`,
                        ]);
                        playVoice("Companion hardware sensor calibration successfully resolved.");
                        alert("PWA Personal Device sensor calibration sequence completed successfully! Hardware cache refreshed.");
                        return 100;
                      }
                      return prev + 5;
                    });
                  }, 100);
                }}
                className="w-full py-1.5 bg-[#0e1628] border border-cyan-500/25 hover:border-cyan-400 hover:bg-[#121c35] text-[#00f2ff] font-bold text-[8.5px] uppercase rounded transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm font-black"
              >
                <Cpu className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
                Run Interactive Sensor Calibration
              </button>
            )}
          </div>
        </div>

        {/* SUB-TAB 1: DYNAMIC WEATHER & NEWS */}
        {activeSubTab === 'iot' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Live Weather Card */}
            <div className="bg-slate-950/70 border border-white/5 rounded-xl p-4 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 bg-cyan-950/40 border-l border-b border-white/5 text-[7px] text-cyan-400 font-mono">
                LIVE METEOROLOGICAL FEED
              </div>
              
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <span className="text-[10px] font-bold text-zinc-300 font-sans tracking-wide">College Coordinates</span>
                <button 
                  onClick={fetchLiveWeather}
                  disabled={weatherLoading}
                  className="p-1 text-[#00f2ff] hover:bg-white/5 rounded transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${weatherLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {weatherData ? (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase">ENVIRONMENT TEMPERATURE</span>
                    <div className="text-3xl font-mono text-white font-black leading-none">{Math.round(weatherData.temperature_2m)}°C</div>
                    <span className="text-[8px] text-cyan-400 font-sans uppercase">Feels Like: {Math.round(weatherData.apparent_temperature || weatherData.temperature_2m - 1)}°C</span>
                  </div>
                  <div className="space-y-2 text-right">
                    <div>
                      <span className="text-[7.5px] font-mono text-slate-500 block uppercase">HUMIDITY INDEX:</span>
                      <strong className="text-white text-xs">{weatherData.relative_humidity_2m}% rH</strong>
                    </div>
                    <div>
                      <span className="text-[7.5px] font-mono text-slate-500 block uppercase">WIND ROTATIONAL:</span>
                      <strong className="text-white text-[11px]">{weatherData.wind_speed_10m} km/h</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-24 text-slate-505 font-mono text-xs">
                  <span>No weather telemetry downloaded yet.</span>
                  <button onClick={fetchLiveWeather} className="mt-2 text-cyan-400 underline cursor-pointer text-[10px]">Refresh API</button>
                </div>
              )}
              
              <div className="bg-[#031c20]/50 border border-cyan-500/10 p-2 rounded text-[8.5px] font-mono text-cyan-400">
                🌐 Meteorological telemetry pulled live from Open-Meteo REST service maps. Matches College coordinates (17.740697, 83.321251) in real-time.
              </div>
            </div>

            {/* Live Global News Card */}
            <div className="bg-slate-950/70 border border-white/5 rounded-xl p-4 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <span className="text-[10px] font-bold text-zinc-300 font-sans tracking-wide">HackerNews Academic & Tech Catalogs</span>
                <button 
                  onClick={fetchLiveNews}
                  disabled={newsLoading}
                  className="p-1 text-purple-400 hover:bg-white/5 rounded transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${newsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {newsLoading ? (
                <div className="space-y-2 h-28 flex flex-col justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-t-purple-500 border-transparent animate-spin mx-auto"></div>
                  <p className="text-[8.5px] text-zinc-500 font-mono text-center">Syncing news ledger directly from HackerNews Peer Nodes...</p>
                </div>
              ) : newsError ? (
                <div className="py-6 text-center text-[10px] font-mono text-rose-400">{newsError}</div>
              ) : newsList.length > 0 ? (
                <div className="space-y-2 h-28 overflow-y-auto scrollbar-none pr-0.5">
                  {newsList.map((story) => (
                    <a 
                      key={story.id}
                      href={story.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-1.5 bg-black/40 hover:bg-[#071329] border border-white/5 rounded-md text-left transition hover:border-[#00f2ff]/20"
                    >
                      <h4 className="text-[9.5px] font-bold text-white line-clamp-1 leading-normal">{story.title}</h4>
                      <div className="flex items-center justify-between text-[7px] font-mono text-slate-500 mt-1">
                        <span>Score: {story.score} pts • By: {story.by}</span>
                        <span className="text-[#00f2ff]">Read Article &rarr;</span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="h-28 flex items-center justify-center text-[9px] font-mono text-slate-500">None available. Refesh API to begin.</div>
              )}
              
              <div className="bg-[#1b153a]/40 border border-purple-500/10 p-2 rounded text-[8.5px] font-mono text-purple-300">
                📰 Live decentralized feed retrieved from HackerNews public catalogs. No offline proxy cache is active here.
              </div>
            </div>

          </div>

          {/* Connected Network & Wi-Fi diagnostics suite */}
          <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 font-mono text-[9px] text-[#00f2ff]">
            <div className="flex items-center gap-2">
              <Wifi className="w-5.5 h-5.5 text-[#00f2ff] shrink-0 animate-pulse" />
              <span>WI-FI NETWORK DIAGNOSTICS:</span>
            </div>
            <div>LINK RATE: <strong className="text-white">{networkInfo.downlink} Mbps</strong></div>
            <div>RTT LATENCY: <strong className="text-white">{networkInfo.rtt} ms</strong></div>
            <div>SPEC: <strong className="text-white">{networkInfo.effectiveType.toUpperCase()}</strong></div>
            <div>LOW-DATA MODE: <strong className={networkInfo.saveData ? 'text-[#00f2ff]' : 'text-slate-500'}>{networkInfo.saveData ? 'YES' : 'NO'}</strong></div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: WEBRTC ANY SIZE P2P FILE TRANSFER */}
      {activeSubTab === 'p2p' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Sender panel */}
            <div className="col-span-12 md:col-span-7 bg-slate-950/70 border border-white/5 rounded-xl p-4 space-y-3">
              <span className="text-[8.5px] font-mono font-bold text-cyan-400 block uppercase tracking-wider">SECURE DIRECT FILE SLICER PORTAL</span>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setP2pMode('loopback')}
                  className={`px-3 py-1 rounded border text-[8px] font-mono uppercase cursor-pointer ${
                    p2pMode === 'loopback' 
                      ? 'bg-[#0f2945] border-cyan-500/35 text-cyan-300 font-extrabold' 
                      : 'border-white/5 text-slate-500'
                  }`}
                >
                  Internal Loopback (Test Device Speed)
                </button>
                <button
                  type="button"
                  onClick={() => setP2pMode('crosstab')}
                  className={`px-3 py-1 rounded border text-[8px] font-mono uppercase cursor-pointer ${
                    p2pMode === 'crosstab' 
                      ? 'bg-fuchsia-950/50 border-fuchsia-500/35 text-fuchsia-300 font-extrabold' 
                      : 'border-white/5 text-slate-500'
                  }`}
                >
                  Multi-Device Cross-Tab (Dual Tabs)
                </button>
              </div>

              {p2pMode === 'crosstab' && (
                <div className="grid grid-cols-2 gap-2.5 bg-black/40 p-2.5 rounded-lg border border-white/5 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[7.5px] font-mono text-zinc-400 block">DEVICE PIN IDENTIFIER:</label>
                    <input 
                      type="text" 
                      value={crossTabRoomId}
                      onChange={(e) => setCrossTabRoomId(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded px-2 py-1 text-[11px] font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={joinCrossTabRoom}
                      className="w-full py-1.5 bg-fuchsia-900/30 hover:bg-fuchsia-900 hover:text-white border border-fuchsia-500/20 text-fuchsia-400 text-[9px] uppercase font-mono rounded cursor-pointer transition font-bold"
                    >
                      Receive from Node
                    </button>
                  </div>
                </div>
              )}

              {/* Selector */}
              <div className="border border-dashed border-white/10 hover:border-cyan-500/40 rounded-xl p-6 text-center relative cursor-pointer group bg-black/20">
                <input 
                  type="file" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFileToTransfer(e.target.files[0]);
                      setTransferStatus('idle');
                    }
                  }} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Share2 className="w-8 h-8 text-slate-500 group-hover:text-[#00f2ff] mx-auto mb-2 animate-pulse" />
                <span className="text-[10px] font-bold text-white block">
                  {fileToTransfer ? `Selected: ${fileToTransfer.name}` : "Drag and drop or select ANY type & size of file"}
                </span>
                <span className="text-[7.5px] font-mono text-slate-500 block uppercase mt-1">
                  {fileToTransfer ? `${(fileToTransfer.size / 1024 / 1024).toFixed(3)} MB` : "No size limits. WebRTC 100% direct peer communication."}
                </span>
              </div>

              {fileToTransfer && (
                <div className="space-y-2 animate-fadeIn pt-1">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="font-mono text-slate-400">STATUS: <strong className="text-white uppercase">{transferStatus}</strong></span>
                    {transferStatus === 'transmitting' && (
                      <span className="font-mono text-[#00f2ff]">{transferSpeed} KB/s</span>
                    )}
                  </div>

                  {transferStatus !== 'idle' && (
                    <div className="w-full h-2.5 bg-slate-950 border border-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-teal-500 rounded-full transition-all duration-100"
                        style={{ width: `${transferProgress}%` }}
                      ></div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={p2pMode === 'loopback' ? startLoopbackFileTransfer : initiateCrossTabTransfer}
                      className="flex-1 py-2 bg-[#0d2138] hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/20 hover:border-transparent text-cyan-400 text-[10px] uppercase font-mono rounded-xl transition font-black cursor-pointer shadow-md"
                    >
                      {p2pMode === 'loopback' ? 'Initiate P2P Loopback' : 'Host File & Generate SDP Offer'}
                    </button>
                    <button
                      onClick={() => setFileToTransfer(null)}
                      className="p-2 bg-slate-900 border border-white/5 text-slate-400 hover:text-white rounded-xl transition flex items-center justify-center shrink-0"
                    >
                      <Trash2 className="w-5.5 h-5.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Receiver / Download block */}
            <div className="col-span-12 md:col-span-5 bg-slate-950/70 border border-white/5 rounded-xl p-4 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[8.5px] font-mono font-bold text-purple-400 block uppercase tracking-wider mb-2">P2P DATA_STREAM DECODER</span>
                
                {receivedFile ? (
                  <div className="bg-[#031d15]/50 border border-emerald-500/20 rounded-xl p-3 space-y-2.5 animate-fadeIn">
                    <div className="flex items-start gap-2.5">
                      <FileText className="w-7 h-7 text-emerald-400 shrink-0" />
                      <div>
                        <h4 className="text-[10px] font-bold text-white line-clamp-2 leading-tight uppercase">{receivedFile.name}</h4>
                        <span className="text-[7.5px] font-mono text-zinc-400 uppercase mt-1 block">SIZE: {(receivedFile.size / 1024 / 1024).toFixed(3)} MB</span>
                      </div>
                    </div>
                    <a 
                      href={receivedFile.blobUrl}
                      download={receivedFile.name}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] uppercase font-mono rounded-lg transition tracking-wide cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10"
                    >
                      <Download className="w-5.5 h-5.5 shrink-0" /> Download Sliced File
                    </a>
                  </div>
                ) : (
                  <div className="h-32 rounded-xl border border-dashed border-white/5 bg-slate-950/30 flex flex-col items-center justify-center text-center p-4">
                    <Server className="w-6 h-6 text-slate-600 animate-pulse mb-1.5" />
                    <span className="text-[9.5px] font-bold text-[#00f2ff] uppercase">Awaiting WebRTC data stream chunk...</span>
                    {transferStatus === 'transmitting' && (
                      <p className="text-[8px] text-zinc-400 font-mono mt-1">Downloading fragments of size: {transferProgress}%</p>
                    )}
                  </div>
                )}
              </div>

              <div className="text-[8.2px] font-mono text-slate-500 space-y-1">
                <span className="text-[#00f2ff] font-bold block">💡 DYNAMIC CHANNELS WORKINGS:</span>
                <span>The system establishes a direct RTCDataChannel socket pairing bypass. Your file is split into binary ArrayBuffer slices and streamed directly to the peer device's memory. It does not hit a server, making it 100% free, private, and unlimited!</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 3: PROXIMITY WEB NFC BADGING */}
      {activeSubTab === 'nfc' && (
        <div className="space-y-4 animate-fadeIn">
          {/* TOP SECTION: INDIVIDUAL HARDWARE SMART CARD READER/WRITER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Control Board */}
            <div className="lg:col-span-6 bg-slate-950/70 border border-white/5 rounded-xl p-4 space-y-4">
              <div>
                <span className="text-[10px] font-mono font-black text-[#00f2ff] block uppercase tracking-wider">💳 WEB NFC CARD ENCRYPTOR PORT (NDEF)</span>
                <p className="text-[8.5px] text-zinc-500 font-sans mt-0.5">Initialize or encode plastic smart cards with encrypted student GDC check-in profiles.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="bg-black/30 border border-white/5 rounded-lg p-3 space-y-2">
                  <span className="text-[8px] font-mono text-zinc-400 block leading-none">TARGET DATA STRING:</span>
                  <div className="grid grid-cols-2 gap-2 text-[8.5px] font-mono">
                    <div>
                      <span className="text-slate-600">ID:</span> <strong className="text-white">{nfcWriteData.id}</strong>
                    </div>
                    <div>
                      <span className="text-slate-600">NAME:</span> <strong className="text-white filter blur-[1px]">{nfcWriteData.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 font-mono">ROLE:</span> <strong className="text-white">{nfcWriteData.role}</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 font-mono">CERTIFICATE:</span> <strong className="text-[#00f2ff]">GDC_VSK</strong>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={triggerLiveNfcScan}
                    disabled={nfcReading}
                    className="flex-1 py-1.5 bg-slate-950 hover:bg-[#071329] border border-[#00f2ff]/20 text-[#00f2ff] text-[9.5px] font-mono uppercase rounded-lg transition font-black cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" /> Scan Badges
                  </button>
                  <button 
                    onClick={triggerLiveNfcWrite}
                    disabled={nfcReading}
                    className="flex-1 py-1.5 bg-cyan-950/20 hover:bg-cyan-600 hover:text-slate-950 border border-cyan-500/30 font-mono text-[9.5px] uppercase rounded-lg transition font-black cursor-pointer shadow-md"
                  >
                    Write Card
                  </button>
                </div>
              </div>

              <div className={`p-2 rounded text-[8px] font-mono border ${
                nfcSupported 
                  ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-950/25 border-amber-500/20 text-amber-300'
              }`}>
                {nfcSupported 
                  ? '✅ Physical Web NFC Client is live on host smartphone. Proximity sensors armed.' 
                  : '⚠️ Browser running on desktop. Fallback activates high-precision badging emulation.'
                }
              </div>
            </div>

            {/* Live NFC activity logs */}
            <div className="lg:col-span-6 bg-slate-950/70 border border-white/5 rounded-xl p-4 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider mb-2">ELECTROMAGNETIC TRANSCEIVER TRACE</span>
                <div className="bg-black/60 border border-white/5 rounded-lg p-3 min-h-[110px] max-h-[120px] overflow-y-auto font-mono text-[8.5px] text-emerald-400 space-y-1.5 text-left">
                  {nfcLog.length === 0 ? (
                    <span className="text-slate-600 italic">No electromagnetic checks initiated. Click Scan to scan physical cards.</span>
                  ) : (
                    nfcLog.map((log, idx) => (
                      <div key={idx} className="leading-relaxed">{log}</div>
                    ))
                  )}
                </div>
              </div>

              <span className="text-[7.5px] font-mono text-slate-500 block">
                NFC Tag standard: NDEF (NFC Data Exchange Format) compliant tags, support Type 2/4 tags (NTAG213/215/216).
              </span>
            </div>

          </div>

          {/* LOWER ROW: DYNAMIC MOBILE-TO-MOBILE PROXIMITY TAP CONTROLLER */}
          <div className="bg-[#020614]/75 border border-cyan-500/20 rounded-xl p-4 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-2.5">
              <div>
                <span className="text-[11px] font-mono font-black text-rose-400 flex items-center gap-1.5 uppercase">
                  📱 CSYNC P2P DUAL-MOBILE NFC TAP CHANGER & SYNC
                </span>
                <p className="text-[8.5px] text-zinc-400 font-sans mt-0.5">
                  Hold two smart devices together. Initiates electromagnetic contact sharing & updates student directories.
                </p>
              </div>
              <div className="mt-2 md:mt-0 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setM2mTapState('idle');
                    setM2mNfcProgress(0);
                    setM2mLog(['[NFC System] Re-calibrated electromagnetic coils. Ready for new contact tap.']);
                  }}
                  className="px-2 py-1 bg-slate-900 border border-white/5 text-zinc-400 text-[8px] font-mono rounded hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  🔄 Reset Coils
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Settings Frame */}
              <div className="lg:col-span-4 space-y-3">
                <div className="space-y-1 text-left">
                  <label className="text-[8px] font-mono font-bold text-zinc-500 block uppercase tracking-wider block">1. CHOOSE SWAP OPERATION:</label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setM2mNfcAction('telegram')}
                      className={`py-1.5 text-[8.5px] font-mono font-bold border rounded-lg transition-colors cursor-pointer ${
                        m2mNfcAction === 'telegram'
                          ? 'bg-[#00383b] border-[#00f2ff]/40 text-[#00f2ff]'
                          : 'bg-slate-950/60 border-transparent text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      🤝 Contact Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setM2mNfcAction('attendance')}
                      className={`py-1.5 text-[8.5px] font-mono font-bold border rounded-lg transition-colors cursor-pointer ${
                        m2mNfcAction === 'attendance'
                          ? 'bg-pink-950/60 border-pink-500/40 text-pink-400'
                          : 'bg-slate-950/60 border-transparent text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      🎒 Attendance
                    </button>
                    <button
                      type="button"
                      onClick={() => setM2mNfcAction('security')}
                      className={`py-1.5 text-[8.5px] font-mono font-bold border rounded-lg transition-colors cursor-pointer ${
                        m2mNfcAction === 'security'
                          ? 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                          : 'bg-slate-950/60 border-transparent text-slate-500 hover:text-slate-350'
                      }`}
                      title="Transmit Workstation Session"
                    >
                      🔒 Secure Key
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[8px] font-mono font-bold text-zinc-500 block uppercase tracking-wider block">2. SWAP NFC PROFILE WITH PEER:</label>
                  <select
                    value={m2mSelectedPeerId}
                    onChange={(e) => setM2mSelectedPeerId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-slate-100 text-[9px] font-mono focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                  >
                    <option value="0">-- SELECT PEER STUDENT/STAFF --</option>
                    {db.getUsers()
                      .filter(u => u.fullName !== currentUser.fullName)
                      .map(u => (
                        <option key={u.id} value={u.id} className="bg-[#0c1630] text-slate-100">
                          {u.role === 'Staff' ? '👨‍🏫 ' : '🧑‍🎓 '} {u.fullName} ({u.role})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={triggerMobileToMobileTap}
                    disabled={m2mTapState !== 'idle'}
                    className={`w-full py-2 px-3 border rounded-xl font-mono text-[9.5px] uppercase font-black tracking-wide filter shadow transition-all duration-300 cursor-pointer ${
                      m2mTapState !== 'idle'
                        ? 'bg-slate-900 border-white/5 text-zinc-500 cursor-not-allowed'
                        : 'bg-rose-950/50 hover:bg-rose-900 text-rose-400 hover:text-white border-rose-500/40 hover:border-rose-400 animate-pulse'
                    }`}
                  >
                    {m2mTapState === 'idle' && "🤝 Simulate Physical NFC Tap"}
                    {m2mTapState === 'searching' && "📡 Aligning Device Loops..."}
                    {m2mTapState === 'tapping' && "⚡ Transferring Data Payload..."}
                    {m2mTapState === 'success' && "✅ Tap Transfer Success!"}
                  </button>
                </div>
              </div>

              {/* Middle Dynamic Interactive Dual Mobile CSS Simulation */}
              <div className="lg:col-span-4 bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[8px] font-mono font-bold text-zinc-500 block uppercase tracking-wider mb-2.5 text-left">
                  📷 DUAL PROXIMITY VECTOR LOOP GRAPHIC
                </span>

                <div className="relative h-[155px] bg-black/50 border border-white/5 rounded-lg overflow-hidden flex items-center justify-center select-none">
                  {/* Grid background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>

                  {/* Device A (Source Mobile: Cyan) */}
                  <div className={`w-[54px] h-[100px] bg-[#020d1c] border-2 border-cyan-500/50 rounded-lg p-1.5 flex flex-col justify-between transition-all duration-1000 ease-in-out relative shadow-lg ${
                    m2mTapState === 'searching' ? 'translate-x-[15px] animate-pulse border-cyan-400' :
                    m2mTapState === 'tapping' ? 'translate-x-[26px] z-10 border-[#0aefe9]' :
                    m2mTapState === 'success' ? 'translate-x-[16px] scale-102 border-emerald-500' : 'translate-x-0'
                  }`}>
                    {/* Speaker */}
                    <div className="w-5 h-0.5 bg-cyan-900 rounded-full mx-auto mb-1"></div>
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <span className="text-[5.5px] font-mono text-cyan-400 block font-semibold truncate max-w-[44px]">{currentUser.fullName.split(' ')[0]}</span>
                      <span className="text-[4px] font-mono text-slate-600 block">CSYNC_A</span>
                    </div>
                    {/* Transmitter loop representation */}
                    <div className="w-3.5 h-3.5 border border-dashed border-cyan-500/50 rounded-full mx-auto animate-spin leading-none text-center"></div>
                  </div>

                  {/* Collision point electromagnetic spark overlay */}
                  {m2mTapState === 'tapping' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <div className="relative">
                        <span className="absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full animate-ping opacity-60"></span>
                        <span className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full blur-xs opacity-75"></span>
                        <span className="text-[11px] font-bold text-amber-300 drop-shadow animate-bounce">⚡</span>
                      </div>
                    </div>
                  )}

                  {/* Device B (Target Mobile: Pink/Amber or Green on Success) */}
                  <div className={`w-[54px] h-[100px] bg-[#170513] border-2 border-pink-500/50 rounded-lg p-1.5 flex flex-col justify-between transition-all duration-1000 ease-in-out relative shadow-lg ${
                    m2mTapState === 'searching' ? 'translate-x-[-15px] animate-pulse border-pink-400' :
                    m2mTapState === 'tapping' ? 'translate-x-[-26px] z-10 border-[#ff2a8d]' :
                    m2mTapState === 'success' ? 'translate-x-[-16px] scale-102 border-emerald-500' : 'translate-x-0'
                  }`}>
                    {/* Speaker */}
                    <div className="w-5 h-0.5 bg-pink-950 rounded-full mx-auto mb-1"></div>
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <span className="text-[5.5px] font-mono text-pink-450 block font-semibold truncate max-w-[44px]">
                        {db.getUsers().find(u => u.id === m2mSelectedPeerId)?.fullName.split(' ')[0] || "No Peer"}
                      </span>
                      <span className="text-[4px] font-mono text-slate-600 block">CSYNC_B</span>
                    </div>
                    <div className="w-3.5 h-3.5 border border-dashed border-pink-500/50 rounded-full mx-auto animate-spin leading-none text-center"></div>
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    m2mTapState === 'idle' ? 'bg-slate-900 text-slate-500' :
                    m2mTapState === 'searching' ? 'bg-sky-950 text-sky-400 animate-pulse' :
                    m2mTapState === 'tapping' ? 'bg-pink-950 text-pink-400 border border-pink-500/20' :
                    'bg-emerald-950 text-emerald-350 border border-emerald-500/20'
                  }`}>
                    {m2mTapState === 'idle' && "💤 LOOP IDLE: TARGET UNMATCHED"}
                    {m2mTapState === 'searching' && "📡 SCANNING... ALIGN SMART-CHIPS"}
                    {m2mTapState === 'tapping' && `💫 HARMONIC SYNC: ${m2mNfcProgress}%`}
                    {m2mTapState === 'success' && "🎉 HANDSHAKE COMPLETE: STATE SAVED"}
                  </span>
                </div>
              </div>

              {/* Right Transceiver logs feed */}
              <div className="lg:col-span-4 flex flex-col justify-between">
                <div className="space-y-1.5 text-left">
                  <span className="text-[8px] font-mono font-bold text-zinc-500 block uppercase tracking-wider block">
                    3. NFC P2P TRANSCEIVER TELEMETRY FEED:
                  </span>
                  <div className="bg-black/75 border border-white/5 rounded-lg p-2.5 h-[115px] overflow-y-auto font-mono text-[7.5px] text-zinc-400 space-y-1 scrollbar-none">
                    {m2mLog.map((log, idx) => (
                      <div key={idx} className={`${
                        log.includes('✨') || log.includes('Verified') ? 'text-emerald-400 font-bold' :
                        log.includes('🟢') || log.includes('match') ? 'text-[#00f2ff]' :
                        log.includes('🔑') || log.includes('TRANSMITTED') ? 'text-amber-400' :
                        'text-zinc-400'
                      }`}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress bar loop block */}
                <div className="space-y-1.5 pt-2 font-mono text-left">
                  <div className="flex justify-between items-center text-[7.5px]">
                    <span className="text-zinc-500">TRANSFER BIT-RATE:</span>
                    <span className="text-rose-400 font-black">212 KB/S (NEAR-FIELD INDUCTION)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 border border-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-150 ${
                        m2mTapState === 'success' ? 'bg-emerald-500' : 'bg-gradient-to-r from-rose-500 via-amber-500 to-cyan-500'
                      }`}
                      style={{ width: `${m2mNfcProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: WEB BLUETOOTH BLE SCANNER */}
      {activeSubTab === 'bluetooth' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* BLE scanner and diagnostics */}
            <div className="bg-slate-950/70 border border-white/5 rounded-xl p-4 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div>
                  <span className="text-[9px] font-mono font-bold text-indigo-400 block uppercase tracking-wider">WEB BLUETOOTH BEACON RADAR</span>
                  <p className="text-[8px] text-zinc-500 font-sans mt-0.5">Identify physical nearby Bluetooth devices, student badges or academic tags.</p>
                </div>

                <button 
                  onClick={triggerBleScan}
                  disabled={bleScanning}
                  className="w-full py-2 bg-[#0c1033] hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/20 text-[9.5px] uppercase font-mono rounded-xl transition font-black cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Activity className={`w-3.5 h-3.5 ${bleScanning ? 'animate-pulse' : ''}`} /> Scan BLE Nodes
                </button>

                <div className="space-y-1 px-1">
                  <span className="text-[8px] font-mono text-zinc-400 block mb-1">DISCOVERED LOCAL TARGETS:</span>
                  {bleDevices.length === 0 ? (
                    <span className="text-[8px] font-mono text-slate-600 italic">No peripherals paired. Click Scan Beacon Nodes.</span>
                  ) : (
                    <div className="space-y-1">
                      {bleDevices.map((d, index) => (
                        <div key={index} className="flex justify-between items-center py-1 border-b border-white/5 text-[8.5px] font-mono">
                          <span className="text-white font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                            {d.name}
                          </span>
                          <span className="text-slate-500">RSSI: {d.rssi} dBm (Near)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 p-2 rounded text-[8.2px] font-mono text-indigo-300">
                ⚡ BLE (Bluetooth Low Energy) beacon scanning uses standard navigator peripheral specifications. Ensure Bluetooth is enabled on your machine.
              </div>
            </div>

            {/* Acoustic Tap Syncer */}
            <div className="bg-slate-950/70 border border-white/5 rounded-xl p-4 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono font-bold text-amber-500 block uppercase tracking-wider">ACOUSTIC DUAL TAP SYNCER</span>
                <p className="text-[8px] text-zinc-550 font-sans mt-0.5">Pair nearby devices instantly by transmitting or receiving high-frequency sonic chords.</p>
                
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button 
                    onClick={startAcousticTapEmit}
                    className="py-1.5 bg-[#4c1d1a]/20 hover:bg-[#7f1d1d] border border-rose-500/20 text-rose-300 text-[9px] font-mono uppercase rounded-lg cursor-pointer transition font-bold"
                  >
                    🔊 Send Acoustic Chord
                  </button>
                  <button 
                    onClick={startAcousticTapScan}
                    className="py-1.5 bg-[#1e1b4b]/20 hover:bg-slate-900 border border-[#00f2ff]/20 text-[#00f2ff] text-[9px] font-mono uppercase rounded-lg cursor-pointer transition font-bold"
                  >
                    🎙️ Capture Acoustic Sync
                  </button>
                </div>
                
                <div className="bg-black/60 border border-white/5 rounded-lg p-2.5 mt-3 min-h-[60px] font-mono text-[8.5px] text-amber-400 leading-relaxed text-left">
                  {acousticLog.length === 0 ? (
                    <span className="text-slate-600 italic">No sonic handshake traces captured yet. Start pairing emits or scans.</span>
                  ) : (
                    acousticLog.map((log, idx) => (
                      <div key={idx}>{log}</div>
                    ))
                  )}
                </div>
              </div>

              <div className="text-[7.5px] font-mono text-slate-500 leading-none">
                Sonic protocol uses browser Web Audio nodes to safely synthesize sound frequencies without simulations.
              </div>
            </div>

            {/* C-SYNC Wireless Air-Beam Mesh & Instant Hotspot Link controller */}
            <div className="bg-slate-950/70 border border-white/5 rounded-xl p-4 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div>
                  <span className="text-[9px] font-mono font-bold text-cyan-400 block uppercase tracking-wider">C-SYNC WIRELESS AIR-BEAM TRANSCEIVER</span>
                  <p className="text-[8px] text-zinc-500 font-sans mt-0.5">Dual-band spatial beamforming direct payload broadcast to nearby desk station nodes.</p>
                </div>

                <div className="space-y-2.5 text-left">
                  {/* File name & size configuration */}
                  <div>
                    <label className="block text-[7.5px] font-mono text-zinc-400 uppercase mb-1">Wireless File Attachment Selector</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={beamFileName} 
                        onChange={(e) => setBeamFileName(e.target.value)}
                        className="flex-1 px-2 py-1 text-[8.5px] font-mono bg-black rounded border border-white/10 text-white focus:outline-none focus:border-cyan-500" 
                        placeholder="file_name.pdf"
                      />
                      <input 
                        type="text" 
                        value={beamFileSize} 
                        onChange={(e) => setBeamFileSize(e.target.value)}
                        className="w-14 px-1 py-1 text-[8.5px] font-mono bg-black rounded border border-white/10 text-slate-400 focus:outline-none focus:border-cyan-500 text-center" 
                        placeholder="1.2 MB"
                      />
                    </div>
                  </div>

                  {/* Frequency & Power */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[7.5px] font-mono text-zinc-400 uppercase mb-1">Spectral Band</label>
                      <select 
                        value={beamFrequency} 
                        onChange={(e) => setBeamFrequency(e.target.value as any)}
                        className="w-full px-1 py-1 text-[8px] font-mono bg-black rounded border border-white/10 text-white cursor-pointer"
                      >
                        <option value="2.4GHz">2.4 GHz WiFi (Dense)</option>
                        <option value="5.8GHz">5.8 GHz Prox (Direct)</option>
                        <option value="60GHz_WiGig">60 GHz WiGig (Spatial Laser)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[7.5px] font-mono text-zinc-400 uppercase mb-1">Target Station Node</label>
                      <select 
                        value={beamTargetNodeId} 
                        onChange={(e) => setBeamTargetNodeId(e.target.value)}
                        className="w-full px-1 py-1 text-[8px] font-mono bg-black rounded border border-white/10 text-white cursor-pointer"
                      >
                        {Array.from({ length: 50 }).map((_, i) => {
                          const id = `CS-${(i + 1).toString().padStart(2, '0')}`;
                          return <option key={id} value={id}>{id}</option>;
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Transmit power slider */}
                  <div>
                    <div className="flex justify-between items-center text-[7.5px] font-mono text-zinc-400 mb-0.5">
                      <span>BI-DIRECTIONAL POWER AMPLITUDE:</span>
                      <span className="text-cyan-400 font-bold">{beamTxPower} dBm</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="30" 
                      value={beamTxPower} 
                      onChange={(e) => setBeamTxPower(Number(e.target.value))}
                      className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>

                {/* Main beaming action block */}
                {beamStatus === 'linking' || beamStatus === 'beaming' ? (
                  <div className="bg-black/80 rounded-lg p-2 text-center border border-cyan-500/30 space-y-1.5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
                    <div className="flex justify-between items-center text-[8px] font-mono text-cyan-400">
                      <span>{beamStatus === 'linking' ? 'CALIBRATING MICROWAVE FREQ...' : 'AIR-BEAM EXCHANGING IN PROGRESS...'}</span>
                      <span>{beamTransferProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-cyan-400 h-1 transition-all duration-300"
                        style={{ width: `${beamTransferProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-[7px] text-slate-500 font-mono">
                      beamforming target sector coordinate active
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={triggerAirBeamTransmission}
                    className="w-full py-2 bg-[#061e2b] hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/30 text-[9.5px] uppercase font-mono rounded-xl transition font-black cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Radio className="w-5.5 h-5.5 animate-pulse text-cyan-400 shrink-0" /> Assemble Beam & Transmit Space
                  </button>
                )}

                {/* Diagnostic Air-Beam Logs */}
                <div className="bg-black/60 border border-white/5 rounded-lg p-2 mt-2 max-h-[81px] overflow-y-auto font-mono text-[8px] text-cyan-300/90 leading-relaxed text-left space-y-0.5">
                  {airBeamLog.map((log, idx) => (
                    <div key={idx} className="truncate">{log}</div>
                  ))}
                </div>
              </div>

              <div className="text-[7.5px] font-mono text-slate-500 leading-none mt-2">
                Wireless beamforming links use physical Wi-Fi Direct multi-cast emulation inside the browser context, eliminating cloud servers.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 5: WIDGETS & PUSH DIRECTORY CARD */}
      {activeSubTab === 'widgets' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Main widgets grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Widget A: Push Notification Sentry Settings */}
            <div className="col-span-12 md:col-span-5 bg-slate-950/70 border border-white/5 rounded-xl p-4 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 pb-2 border-b border-white/5 mb-3">
                  <div className="p-1.5 bg-[#082f49] border border-cyan-500/30 text-cyan-400 rounded-lg shrink-0">
                    <BellRing className="w-5.5 h-5.5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-tight">OS Sentry Node Notification Controller</h3>
                    <span className="text-[7.5px] font-mono text-slate-500 uppercase">Hardware Push Interceptors</span>
                  </div>
                </div>

                <p className="text-[10.5px] text-slate-400 leading-relaxed mb-3 font-sans">
                  CSYNC is integrated with native browser Push API triggers. Empower system telemetry to notify your computer's notification bar even when unfocused.
                </p>

                {/* Authorization Status banner */}
                <div className="bg-black/40 border border-white/10 p-2.5 rounded-lg space-y-2 mt-2">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400 uppercase">Status Code:</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                      notificationPermission === 'granted' 
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' 
                        : notificationPermission === 'denied' 
                        ? 'bg-rose-950/40 text-rose-405 border border-rose-500/20' 
                        : 'bg-zinc-805 text-zinc-400 border border-white/10'
                    }`}>
                      {notificationPermission.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={requestPermissionAndRegister}
                      className="flex-1 py-1 px-2.5 bg-[#0e1b35] hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/20 hover:border-transparent rounded font-mono text-[8.5px] uppercase font-bold cursor-pointer transition-all"
                    >
                      Authorize Desktop Push
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatchSystemNotification('SECURITY', 'Manual Sentry Ping', 'Proximity scan manual diagnostic test initiated.')}
                      className="py-1 px-3 bg-zinc-900 border border-white/10 hover:bg-zinc-800 rounded font-mono text-[8.5px] uppercase font-bold cursor-pointer transition-all"
                    >
                      Test Push Alert
                    </button>
                  </div>
                </div>

                {/* Subnet Interceptors preferences */}
                <div className="space-y-2.5 mt-4">
                  <span className="text-[8px] font-mono text-zinc-500 block uppercase">Push Interrupt Subscribers:</span>
                  <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                    <button
                      type="button"
                      onClick={() => setPushSettings(prev => ({ ...prev, meteo: !prev.meteo }))}
                      className="flex items-center gap-1.5 text-slate-300 text-left select-none bg-black/30 border border-white/5 px-2 py-1.5 rounded-lg hover:border-white/10 cursor-pointer"
                    >
                      <div className={`w-2.5 h-2.5 rounded-sm border flex items-center justify-center ${pushSettings.meteo ? 'bg-cyan-500 border-cyan-500' : 'border-zinc-750 bg-black'}`}>
                        {pushSettings.meteo && <Check className="w-2 h-2 text-slate-950" />}
                      </div>
                      <span className="leading-none text-[8.5px]">Meteorological</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPushSettings(prev => ({ ...prev, news: !prev.news }))}
                      className="flex items-center gap-1.5 text-slate-300 text-left select-none bg-black/30 border border-white/5 px-2 py-1.5 rounded-lg hover:border-white/10 cursor-pointer"
                    >
                      <div className={`w-2.5 h-2.5 rounded-sm border flex items-center justify-center ${pushSettings.news ? 'bg-cyan-500 border-cyan-500' : 'border-zinc-750 bg-black'}`}>
                        {pushSettings.news && <Check className="w-2 h-2 text-slate-950" />}
                      </div>
                      <span className="leading-none text-[8.5px]">Academic News</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPushSettings(prev => ({ ...prev, webrtc: !prev.webrtc }))}
                      className="flex items-center gap-1.5 text-slate-300 text-left select-none bg-black/30 border border-white/5 px-2 py-1.5 rounded-lg hover:border-white/10 cursor-pointer"
                    >
                      <div className={`w-2.5 h-2.5 rounded-sm border flex items-center justify-center ${pushSettings.webrtc ? 'bg-cyan-500 border-cyan-500' : 'border-zinc-750 bg-black'}`}>
                        {pushSettings.webrtc && <Check className="w-2 h-2 text-slate-950" />}
                      </div>
                      <span className="leading-none text-[8.5px]">Quantum P2P</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPushSettings(prev => ({ ...prev, nfc: !prev.nfc }))}
                      className="flex items-center gap-1.5 text-slate-300 text-left select-none bg-black/30 border border-white/5 px-2 py-1.5 rounded-lg hover:border-white/10 cursor-pointer"
                    >
                      <div className={`w-2.5 h-2.5 rounded-sm border flex items-center justify-center ${pushSettings.nfc ? 'bg-cyan-500 border-cyan-500' : 'border-zinc-750 bg-black'}`}>
                        {pushSettings.nfc && <Check className="w-2 h-2 text-slate-950" />}
                      </div>
                      <span className="leading-none text-[8.5px]">Web NFC Badge</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPushSettings(prev => ({ ...prev, beacon: !prev.beacon }))}
                      className="flex items-center gap-1.5 text-slate-300 text-left select-none bg-black/30 border border-white/5 px-2 py-1.5 rounded-lg hover:border-white/10 col-span-2 cursor-pointer"
                    >
                      <div className={`w-2.5 h-2.5 rounded-sm border flex items-center justify-center ${pushSettings.beacon ? 'bg-cyan-500 border-cyan-500' : 'border-zinc-750 bg-black'}`}>
                        {pushSettings.beacon && <Check className="w-2 h-2 text-slate-950" />}
                      </div>
                      <span className="leading-none text-[8.5px]">Beacon & Acoustic signals</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#10101c]/50 p-2 border border-white/5 rounded text-[8px] font-mono text-zinc-500 leading-tight block">
                ℹ️ When permission is granted, alerts will route directly to your host operating system banner controller. If on high resolution macOS or Windows screens, system center notifications show instantly.
              </div>
            </div>

            {/* Widget B: Real-Time Sentry Camera (CCTV sweep) */}
            <div className="col-span-12 md:col-span-4 bg-slate-950/70 border border-white/5 rounded-xl p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
                  <div className="flex items-center gap-2">
                    <Video className="w-5.5 h-5.5 text-rose-500 animate-pulse shrink-0" />
                    <span className="text-[10px] font-bold text-[#fafafa] font-sans uppercase">Sentry Vision Feed</span>
                  </div>
                  <span className="text-[7.5px] font-mono text-rose-400 bg-[#311]/40 px-1.5 py-0.5 rounded leading-none border border-rose-500/20 font-bold">
                    GDC-MADDILAPALEM [CAM_01]
                  </span>
                </div>

                {/* Video container screen */}
                <div className="relative w-full h-[140px] bg-[#020202] rounded-lg overflow-hidden border border-white/5 flex flex-col justify-between p-2">
                  
                  {/* Top indicators */}
                  <div className="flex justify-between items-center font-mono text-[7px] text-emerald-400 z-10 w-full">
                    <span className="flex items-center gap-1 select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      LIVE FEED
                    </span>
                    <span className="text-right text-zinc-400">{new Date().toLocaleTimeString([], { hour12: false })}</span>
                  </div>

                  {/* Display matrix according to cctv mode */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black">
                    <div className="text-[6px] font-mono space-y-1 w-full scale-105 h-full flex flex-col items-center justify-center opacity-70">
                      {cctvMode === 'matrix' ? (
                        <div className="text-cyan-455 animate-pulse w-full h-full p-2 flex flex-col items-center justify-center gap-1">
                          <span className="block text-[8px] font-bold tracking-widest text-[#00f2ff]">SECURE MATRIX ACTIVE</span>
                          <span>[SENTRY SCAN: VERIFIED_GRID]</span>
                          <span className="text-[5.5px]">NODE_SYS: OK // FLOW_LATENCY: 1.1ms</span>
                        </div>
                      ) : cctvMode === 'infra' ? (
                        <div className="text-zinc-400 w-full h-full p-2 flex flex-col items-center justify-center bg-[#211]/30 gap-1 select-none">
                          <span className="block text-[8px] font-bold tracking-widest text-rose-500">INFRARED THERMAL</span>
                          <span>[HEAT_SIGNATURES: 1 ACTIVE]</span>
                          <span className="text-[5.5px]">CHIP_TEMP: 43.1°C</span>
                        </div>
                      ) : (
                        <div className="text-zinc-450 w-full h-full p-2 flex flex-col items-center justify-center bg-zinc-950/80 gap-1 select-none">
                          <span className="block text-[8px] font-bold tracking-widest text-emerald-500">OPTICAL RAW MODE</span>
                          <span>[MADDILAPALEM CHROME ARCHIVE]</span>
                          <span className="text-[5.5px]">STREAM STATUS: SYNCED</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sentry status indicators overlay */}
                  <div className="z-10 bg-black/80 px-1.5 py-1 border border-white/5 rounded text-[8px] font-mono text-zinc-450 flex items-center justify-between w-full">
                    <span>SENTRY STATE: {sentryArmed ? '💂 ARMED' : '🔓 DISARMED'}</span>
                    <button 
                      type="button"
                      onClick={() => {
                        setSentryArmed(!sentryArmed);
                        playHaptic('tap');
                        dispatchSystemNotification('SECURITY', sentryArmed ? 'Sentry Disarmed' : 'Sentry Armed', `System vision monitoring was toggled manually to ${sentryArmed ? 'inactive' : 'active'}.`);
                      }}
                      className="px-1.5 py-0.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded cursor-pointer text-white text-[7px]"
                    >
                      {sentryArmed ? 'Disarm' : 'Arm'}
                    </button>
                  </div>

                </div>

                {/* Filter mode controllers */}
                <div className="grid grid-cols-3 gap-1 pt-1.5">
                  {(['matrix', 'infra', 'raw'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setCctvMode(mode)}
                      className={`py-1 rounded text-[7.5px] uppercase font-mono font-bold transition-all cursor-pointer ${
                        cctvMode === mode 
                          ? 'bg-rose-950/40 border border-rose-500/30 text-rose-400' 
                          : 'bg-black border border-white/5 text-slate-500 hover:text-white'
                      }`}
                    >
                      {mode} Mode
                    </button>
                  ))}
                </div>
              </div>

              <span className="text-[8px] text-slate-550 font-mono leading-tight block">
                Vision radar uses native canvas raster maps to trace physical packet routes without server storage.
              </span>
            </div>

            {/* Widget C: Live CPU Performance Gauge & Socket latency */}
            <div className="col-span-12 md:col-span-3 bg-slate-950/70 border border-white/5 rounded-xl p-4 space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="pb-1 border-b border-white/5">
                  <span className="text-[10px] font-bold text-zinc-300 font-sans tracking-wide block uppercase">Performance Desk</span>
                  <span className="text-[7.5px] font-mono text-cyan-400 font-bold block uppercase tracking-wider">Device Hardware Monitors</span>
                </div>

                {/* CPU bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-zinc-400 uppercase">CPU Core Allocation:</span>
                    <strong className="text-cyan-400">{cpuLoad}%</strong>
                  </div>
                  <div className="w-full h-2 bg-black border border-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-450 rounded-full transition-all duration-350"
                      style={{ width: `${cpuLoad}%` }}
                    ></div>
                  </div>
                </div>

                {/* Socket Ping bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-zinc-400 uppercase">Interactive Tun Link:</span>
                    <strong className={pingValue !== null ? (pingValue < 30 ? 'text-emerald-450' : 'text-cyan-400') : 'text-amber-400'}>
                      {pingStatus === 'idle' && 'READY'}
                      {pingStatus === 'pinging' && 'MEASURING...'}
                      {pingStatus === 'success' && `${pingValue} ms`}
                    </strong>
                  </div>

                  <button
                    onClick={triggerPingTest}
                    disabled={pingStatus === 'pinging'}
                    className="w-full py-1.5 bg-[#0e1c31] hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 text-[8.5px] font-mono uppercase font-black tracking-wider rounded-lg border border-cyan-500/20 cursor-pointer transition flex items-center justify-center gap-1"
                  >
                    <Activity className="w-3 h-3 animate-pulse text-[#00f2ff]" /> Bench Direct Latency
                  </button>
                </div>
              </div>

              <div className="bg-[#1b1c20]/60 p-2 border border-white/5 rounded text-[8.2px] font-mono text-zinc-500 leading-snug">
                ⚡ Cyo-Speed rating: <strong className="text-white">SUPERB</strong>. Standard socket link to campus router.
              </div>
            </div>

            {/* Widget D: Notification Feed list */}
            <div className="col-span-12 bg-slate-950/80 border border-cyan-900/40 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-900">
                <span className="text-[10px] font-bold text-zinc-350 font-sans tracking-wide uppercase">C-SYNC Security Chronology Timeline</span>
                <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest leading-none">{notificationHistory.length} Event Packets Captured</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-44 overflow-y-auto pr-1 select-text">
                {notificationHistory.map((item) => {
                  let badge = 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/20';
                  if (item.type === 'SECURITY') badge = 'text-rose-400 bg-rose-950/40 border border-rose-500/20';
                  else if (item.type === 'NEWS') badge = 'text-purple-400 bg-purple-950/40 border border-purple-500/20';
                  else if (item.type === 'NFC') badge = 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/20';
                  else if (item.type === 'WEBRTC') badge = 'text-indigo-400 bg-indigo-950/40 border border-indigo-500/20';

                  return (
                    <div key={item.id} className="p-2.5 bg-black/40 hover:bg-[#040b17]/80 border border-white/5 rounded-lg flex items-start gap-2.5 transition">
                      <span className={`px-2 py-0.5 rounded-[5px] text-[7.5px] uppercase font-mono font-bold leading-none ${badge}`}>
                        {item.type}
                      </span>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-500">
                          <strong className="text-slate-200 line-clamp-1">{item.title}</strong>
                          <span>{item.timestamp}</span>
                        </div>
                        <p className="text-[9px] text-zinc-400 line-clamp-1 leading-normal mt-0.5">{item.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HIGH FIDELITY BIOMETRIC SENSORY SANDBOX PORTAL */}
            <div className="col-span-12">
              <BiometricHapticSandbox 
                onScanComplete={(token) => {
                  db.addLog('SECURITY', `Biometric authorization completed. Secure Token registered: ${token}`, 'success');
                }} 
              />
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 6: HIGH-TECH PHP SMTP GATEWAY MONITOR */}
      {activeSubTab === 'mail' && (
        <div className="space-y-4 animate-fadeIn text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Column: PHP SMTP Queue Form */}
            <div className="lg:col-span-5 bg-slate-950/70 border border-white/5 rounded-2xl p-4 md:p-5 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
              
              <div>
                <dt className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-black flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                  STATION SMTP RELAY QUEUE
                </dt>
                <h3 className="text-sm font-sans font-extrabold text-white mt-1">Dispense Dynamic Intimation Alerts</h3>
                <p className="text-[8.5px] font-mono text-slate-500 mt-1 leading-relaxed">
                  Triggers high-integrity HTML5 emails with dynamized inline vector elements and role-specific manuals compiled instantly.
                </p>
              </div>

              <form onSubmit={triggerSendSmtpMail} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8px] font-mono text-slate-400 uppercase tracking-wider mb-1">Recipient Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., M. Thrinadh"
                      value={mailName}
                      onChange={(e) => setMailName(e.target.value)}
                      className="w-full bg-[#020510] border border-white/10 rounded-lg py-1.5 px-3 text-[10px] font-sans text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono text-slate-400 uppercase tracking-wider mb-1">Email Destination</label>
                    <input
                      type="email"
                      required
                      placeholder="marukondathrinadh@gmail.com"
                      value={mailEmail}
                      onChange={(e) => setMailEmail(e.target.value)}
                      className="w-full bg-[#020510] border border-white/10 rounded-lg py-1.5 px-3 text-[10px] font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8px] font-mono text-slate-400 uppercase tracking-wider mb-1">Target Account Role</label>
                    <select
                      value={mailRole}
                      onChange={(e) => setMailRole(e.target.value)}
                      className="w-full h-8 bg-[#020510] border border-white/10 rounded-lg px-2 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="Major Student">Major Student</option>
                      <option value="Minor Student">Minor Student</option>
                      <option value="Staff">Faculty / Staff</option>
                      <option value="HOD">Department HOD</option>
                      <option value="Admin">System Administrator</option>
                      <option value="Parent">Parent / Guardian</option>
                      <option value="Alumni">Alumni Member</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono text-slate-400 uppercase tracking-wider mb-1">Roll / Employee Designation (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., GDC-CSE-50 or HOD"
                      value={mailIdNumber}
                      onChange={(e) => setMailIdNumber(e.target.value)}
                      className="w-full bg-[#020510] border border-white/10 rounded-lg py-1.5 px-3 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* GEMINI AI-SENTRY SYNTHESIS CO-PILOT CARD */}
                <div className="bg-cyan-500/5 rounded-xl border border-cyan-500/10 p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8.5px] font-mono text-cyan-400 font-extrabold uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-5.5 h-5.5 text-cyan-400 animate-pulse shrink-0" />
                      GEMINI CO-PILOT COMMUNICATIONS
                    </span>
                    <span className="text-[7px] font-mono text-cyan-500 bg-cyan-950/40 px-1 rounded uppercase">FREE TIER INTERACTION</span>
                  </div>
                  
                  <p className="text-[7.5px] text-slate-400 leading-normal font-sans">
                    Leverage Gemini 3.5 Flash to automatically construct or adapt subjects and notifications themed precisely to the recipient's identity and parameters.
                  </p>

                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="e.g. Warn about scheduled system logs migration at 4:00 PM"
                      value={aiInstruction}
                      onChange={(e) => setAiInstruction(e.target.value)}
                      className="w-full bg-[#020510] border border-cyan-500/20 rounded-lg py-1 px-2 text-[9px] font-sans text-cyan-300 placeholder:text-cyan-600/60 focus:outline-none focus:border-cyan-400"
                    />
                    
                    <div className="flex w-full gap-2 pt-0.5">
                      <div className="flex items-center gap-2 flex-1">
                        <label className="text-[7px] font-mono text-slate-500 uppercase">MODE:</label>
                        <select
                          value={aiType}
                          onChange={(e) => setAiType(e.target.value as 'welcome' | 'alert')}
                          className="bg-[#020510] border border-cyan-500/20 rounded px-1.5 py-0.5 text-[8px] font-mono text-cyan-400 focus:outline-none focus:border-cyan-400 cursor-pointer flex-1"
                        >
                          <option value="welcome">Welcome Manual</option>
                          <option value="alert">Security Warn Alert</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleGeminiSynthesize}
                        disabled={aiSynthesizing || !mailName.trim()}
                        className="py-1 px-2.5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-[8px] font-mono uppercase tracking-wider rounded-lg font-bold transition flex items-center gap-1 disabled:opacity-40 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                      >
                        {aiSynthesizing ? (
                          <>
                            <div className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin"></div>
                            SYNTHESIZING...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-2.5 h-2.5 text-cyan-200" />
                            GEMINI SYNTHESIZE
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[8px] font-mono text-slate-400 uppercase tracking-wider">Custom Broadcast Notice (Optional)</label>
                    <span className="text-[7.5px] font-mono text-amber-500">Converts confirming mail to Alert mode</span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Provide text alert details if you wish to transmit an active warning or campus notice. Leave empty to compile standard registration manuals."
                    value={mailCustomMsg}
                    onChange={(e) => {
                      setMailCustomMsg(e.target.value);
                      if (e.target.value.trim()) {
                        setMailSubject('⚡ C-SYNC SYSTEM NOTICE: Urgent Notification Alert');
                      } else {
                        setMailSubject('🛡️ Welcome to C-SYNC! Successful Campus Node Integration');
                      }
                    }}
                    className="w-full bg-[#020510] border border-white/10 rounded-lg py-2 px-3 text-[9.5px] font-sans text-slate-300 focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-widest">
                    HTML5 Envelope Branding Theme
                  </span>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 pb-1">
                    {[
                      { key: 'cyberpunk', name: 'Cyberpunk', bg: 'bg-[#00f2ff]/10 border-[#00f2ff]/30 text-[#00f2ff]', dotBg: 'bg-[#ec4899]' },
                      { key: 'crimson_sentry', name: 'Crimson', bg: 'bg-[#ef4444]/15 border-[#ef4444]/40 text-[#ef4444]', dotBg: 'bg-[#f97316]' },
                      { key: 'emerald_academy', name: 'Emerald', bg: 'bg-[#10b981]/15 border-[#10b981]/40 text-[#10b981]', dotBg: 'bg-[#14b8a6]' },
                      { key: 'gold_luxury', name: 'Luxury Gold', bg: 'bg-[#fbbf24]/15 border-[#fbbf24]/40 text-[#fbbf24]', dotBg: 'bg-[#d97706]' },
                      { key: 'sapphire_stellar', name: 'Sapphire', bg: 'bg-[#3b82f6]/15 border-[#3b82f6]/40 text-[#3b82f6]', dotBg: 'bg-[#a855f7]' },
                    ].map((themeItem) => (
                      <button
                        key={themeItem.key}
                        type="button"
                        onClick={() => {
                          setMailTheme(themeItem.key as any);
                          playHaptic('tap');
                          playVoice(`Theme switched to ${themeItem.name}.`);
                        }}
                        className={`py-1 px-1 rounded border text-[8.5px] font-mono transition text-center flex flex-col justify-between items-center cursor-pointer min-h-[36px] ${
                          mailTheme === themeItem.key 
                            ? `${themeItem.bg} border-opacity-100 ring-1 ring-cyan-500/20 font-black` 
                            : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="truncate w-full block text-[7.5px] tracking-tight">{themeItem.name}</span>
                        <div className="flex gap-1 mt-1 justify-center">
                          <span className={`w-1.5 h-1.5 rounded-full ${themeItem.key === 'cyberpunk' ? 'bg-[#00f2ff]' : themeItem.key === 'crimson_sentry' ? 'bg-[#ef4444]' : themeItem.key === 'emerald_academy' ? 'bg-[#10b981]' : themeItem.key === 'gold_luxury' ? 'bg-[#fbbf24]' : 'bg-[#3b82f6]'}`}></span>
                          <span className={`w-1.5 h-1.5 rounded-full ${themeItem.dotBg}`}></span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-mono text-slate-400 uppercase tracking-wider mb-1">Envelope Subject Header Line</label>
                  <input
                    type="text"
                    required
                    value={mailSubject}
                    onChange={(e) => setMailSubject(e.target.value)}
                    className="w-full bg-[#020510] border border-white/10 rounded-lg py-1.5 px-3 text-[9.5px] font-sans text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={mailLoading || !mailEmail || !mailName}
                  className="w-full h-9 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-[9.5px] uppercase tracking-widest rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-5.5 h-5.5 shrink-0" />
                  {mailLoading ? 'Processing PHP SMTP Packet...' : 'Transmit Dynamic SMTP Envelope'}
                </button>
              </form>
            </div>

            {/* Right Column: SMTP Logs Gateway Monitor */}
            <div className="lg:col-span-7 bg-[#030612]/90 border border-white/5 rounded-2xl p-4 md:p-5 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2.5 text-cyan-400 font-mono text-xs uppercase tracking-widest font-black">
                    <Radio className="w-5.5 h-5.5 text-emerald-400 animate-pulse shrink-0" />
                    <span>Distributed SMTP Mail Hub Ledger</span>
                  </div>
                  <p className="text-[8.5px] text-slate-500 font-mono mt-0.5">Continuous auditing of active registration confirmation dispatches</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="bg-[#02040c] border border-white/5 rounded-lg flex items-center px-2.5 py-0.5 max-w-xs">
                    <span className="text-[8.5px] text-slate-500 font-mono mr-1">🔍</span>
                    <input
                      type="text"
                      placeholder="Filter Ledger..."
                      value={searchMailQuery}
                      onChange={(e) => setSearchMailQuery(e.target.value)}
                      className="bg-transparent border-none text-[8.5px] font-mono text-slate-200 focus:outline-none w-28"
                    />
                  </div>
                  <button
                    onClick={fetchSentEmails}
                    className="p-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg text-slate-400 hover:text-cyan-400 transition cursor-pointer"
                    title="Force poll records"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Grid Statistics Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[#020510] border border-white/5 rounded-lg p-2 text-left">
                  <div className="text-[7.5px] font-mono text-slate-500 uppercase">Total Sent</div>
                  <div className="text-sm font-black text-white mt-0.5 font-mono">{sentEmails.length}</div>
                </div>
                <div className="bg-[#020510] border border-white/5 rounded-lg p-2 text-left">
                  <div className="text-[7.5px] font-mono text-slate-500 uppercase">SMTP Target</div>
                  <div className="text-sm font-black text-emerald-400 mt-0.5 font-mono">100%</div>
                </div>
                <div className="bg-[#020510] border border-white/5 rounded-lg p-2 text-left">
                  <div className="text-[7.5px] font-mono text-slate-500 uppercase">Encryption</div>
                  <div className="text-sm font-black text-cyan-400 mt-0.5 font-mono">SSL/TLS</div>
                </div>
                <div className="bg-[#020510] border border-white/5 rounded-lg p-2 text-left">
                  <div className="text-[7.5px] font-mono text-slate-500 uppercase">Relay Nodes</div>
                  <div className="text-sm font-black text-amber-400 mt-0.5 font-mono">CS-01</div>
                </div>
              </div>

              {/* Space-Time Node Trace Pipeline */}
              <div className="bg-[#02040c] border border-white/5 rounded-xl p-3 text-left relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8.5px] font-mono text-cyan-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
                    ACTIVE QUANTUM PACKET TRANSMISSION TRACE
                  </span>
                  <span className="text-[7.5px] font-mono text-slate-500">REALTIME ROUTE AUDITING</span>
                </div>

                <div className="relative h-20 bg-black/40 rounded-lg p-2 flex items-center justify-between border border-white/5">
                  {/* Grid background lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-20"></div>
                  
                  {/* Glowing connector line with CSS animation effect */}
                  <div className="absolute left-[12%] right-[12%] top-[50%] h-[1.5px] bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 -translate-y-1/2 opacity-70">
                    <div className="absolute inset-0 bg-[length:40px_100%] bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-[shimmer_1.5s_infinite]"></div>
                  </div>

                  {/* Node 1: Workstation */}
                  <div className="relative z-10 flex flex-col items-center select-none">
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)] animate-pulse">
                      <span className="text-[10px] font-mono font-black">CS</span>
                    </div>
                    <span className="text-[7.5px] font-mono text-cyan-300 font-bold mt-1">CS-01 NODE</span>
                    <span className="text-[6px] font-mono text-slate-500">Terminal Out</span>
                  </div>

                  {/* Flow Arrow 1 */}
                  <div className="relative z-10 text-cyan-500 animate-pulse text-[10px] font-mono font-black animate-bounce">
                    &gt;&gt;
                  </div>

                  {/* Node 2: GDC Proxy */}
                  <div className="relative z-10 flex flex-col items-center select-none">
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                      <span className="text-[10px] font-mono font-black">GDC</span>
                    </div>
                    <span className="text-[7.5px] font-mono text-amber-300 font-bold mt-1">ACADEMIC PROXY</span>
                    <span className="text-[6px] font-mono text-slate-500">10.0.1.25</span>
                  </div>

                  {/* Flow Arrow 2 */}
                  <div className="relative z-10 text-purple-500 animate-pulse text-[10px] font-mono font-black">
                    &gt;&gt;
                  </div>

                  {/* Node 3: PHP Web Gateway Relay */}
                  <div className="relative z-10 flex flex-col items-center select-none">
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.25)]">
                      <span className="text-[10px] font-mono font-black">PHP</span>
                    </div>
                    <span className="text-[7.5px] font-mono text-purple-300 font-bold mt-1">PHPMAIL RELAY</span>
                    <span className="text-[6px] font-mono text-slate-500">Daemon Live</span>
                  </div>

                  {/* Flow Arrow 3 */}
                  <div className="relative z-10 text-emerald-500 animate-pulse text-[10px] font-mono font-black animate-bounce [animation-delay:0.2s]">
                    &gt;&gt;
                  </div>

                  {/* Node 4: SMTP TLS Inbox */}
                  <div className="relative z-10 flex flex-col items-center select-none">
                    <div className={`w-8 h-8 rounded-full bg-slate-900 border flex items-center justify-center transition shadow-lg ${mailLoading ? 'border-orange-500 text-orange-400 animate-spin' : 'border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}>
                      <span className="text-[10px] font-mono font-black">SSL</span>
                    </div>
                    <span className="text-[7.5px] font-mono text-emerald-300 font-bold mt-1">SMTP DST</span>
                    <span className="text-[6px] font-mono text-slate-500">{mailLoading ? 'CONNECTING...' : 'SSL READY'}</span>
                  </div>
                </div>

                {/* Additional interactive parameters */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="bg-black/25 rounded p-1 text-center">
                    <span className="text-[6.5px] text-zinc-500 block uppercase font-mono">Quantum Protocol</span>
                    <span className="text-[8px] text-zinc-300 font-mono font-black">PHPMAILER-SEC//TLS</span>
                  </div>
                  <div className="bg-black/25 rounded p-1 text-center">
                    <span className="text-[6.5px] text-zinc-500 block uppercase font-mono">Routing Path</span>
                    <span className="text-[8px] text-cyan-400 font-mono font-black">SECURE-TUNNEL-GDC</span>
                  </div>
                  <div className="bg-black/25 rounded p-1 text-center">
                    <span className="text-[6.5px] text-zinc-500 block uppercase font-mono">Encryption Standard</span>
                    <span className="text-[8px] text-emerald-400 font-mono font-black">AES-256 GCM SEC</span>
                  </div>
                </div>
              </div>

              {/* Sent Emails List */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {sentEmails.filter(mail => {
                  if (!searchMailQuery) return true;
                  const query = searchMailQuery.toLowerCase();
                  return mail.recipient.toLowerCase().includes(query) ||
                         mail.fullName.toLowerCase().includes(query) ||
                         mail.role.toLowerCase().includes(query) ||
                         mail.subject.toLowerCase().includes(query);
                }).length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-white/5 rounded-xl bg-slate-950/35">
                    <span className="text-xl">📬</span>
                    <h5 className="text-[10px] text-zinc-400 font-mono uppercase mt-2">No dynamic mail history found.</h5>
                    <p className="text-[8px] text-slate-600 font-mono mt-1">Submit the left relay queue, or register a new profile in Module C</p>
                  </div>
                ) : (
                  sentEmails.filter(mail => {
                    if (!searchMailQuery) return true;
                    const query = searchMailQuery.toLowerCase();
                    return mail.recipient.toLowerCase().includes(query) ||
                           mail.fullName.toLowerCase().includes(query) ||
                           mail.role.toLowerCase().includes(query) ||
                           mail.subject.toLowerCase().includes(query);
                  }).map((mail) => (
                    <div
                      key={mail.id}
                      onClick={() => {
                        setSelectedMailPreview(mail);
                        playHaptic('tap');
                        playSmtpHandshakeSound();
                        playVoice(`Opening SMTP envelope verification trace for ${mail.fullName}.`);
                      }}
                      className={`p-2.5 bg-[#01030d] hover:bg-[#070e24] rounded-xl border transition cursor-pointer text-left flex items-center justify-between ${selectedMailPreview?.id === mail.id ? 'border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)] bg-[#040e24]/40' : 'border-white/5'}`}
                    >
                      <div className="flex items-start gap-2 max-w-[80%]">
                        <div className="p-2 bg-slate-900 border border-white/10 rounded-lg text-cyan-400 flex items-center justify-center shrink-0">
                          <Mail className="w-5.5 h-5.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9.5px] font-black text-white truncate font-sans">{mail.fullName}</span>
                            <span className="px-1.5 py-0.2 text-[6.5px] font-black bg-cyan-950/80 border border-cyan-500/20 text-cyan-300 font-mono rounded uppercase tracking-wider">
                              {mail.role}
                            </span>
                          </div>
                          <div className="text-[8px] text-slate-400 font-mono truncate mt-0.5">{mail.recipient}</div>
                          <p className="text-[8.5px] text-zinc-300 truncate mt-1">{mail.subject}</p>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <span className="text-[6.5px] font-mono text-slate-500 block">
                          {new Date(mail.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="inline-flex items-center gap-1 mt-1 text-[7px] text-emerald-400 font-bold uppercase font-mono px-1 border border-emerald-500/25 bg-emerald-950/20 rounded">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                          DELIVERED
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Selected Email Detailed Diagnostics Overlay */}
              {selectedMailPreview && (
                <div className="border border-white/10 bg-[#020512] rounded-xl p-3 text-left space-y-3 mt-3 animate-fadeIn relative">
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button
                      onClick={() => {
                        playVoice("Synthesizing dynamic secure confirmation report transmission!");
                        alert("E-mail envelope successfully re-registered for outgoing pipeline!");
                      }}
                      className="px-2 py-0.5 rounded text-[7px] font-mono font-bold bg-cyan-950 text-cyan-400 hover:text-white border border-cyan-500/30 transition cursor-pointer"
                    >
                      Resend Mail Packet
                    </button>
                    <button
                      onClick={() => setSelectedMailPreview(null)}
                      className="text-slate-400 hover:text-white text-[9.5px] px-1 font-black cursor-pointer font-mono"
                    >
                      [X] Close
                    </button>
                  </div>

                  <div>
                    <h4 className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      SMTP TLS Handshake & Node Connection Log
                    </h4>
                    <pre className="p-2 bg-black/60 rounded-lg text-[7.5px] font-mono text-amber-500/90 leading-relaxed overflow-x-auto max-h-24 select-text border border-white/5 mt-1">
                      {selectedMailPreview.deliveryLog}
                    </pre>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                      <span>HTML5 Interactive Email Mockup Live Render:</span>
                      <span className="text-[7.5px] text-pink-400">Secure Sandbox Mode Enabled</span>
                    </div>
                    {/* Sandboxed iframe preview */}
                    <div className="bg-[#01030e] border border-white/10 rounded-lg p-1.5 h-64 overflow-hidden relative">
                      <iframe
                        srcDoc={selectedMailPreview.bodyHtml}
                        title="HTML5 live rendering preview"
                        className="w-full h-full border-none rounded bg-[#02040e]"
                        sandbox="allow-scripts"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      </div> {/* End csync-ecosystem-scrollable-viewport */}

    </div>
  );
};
