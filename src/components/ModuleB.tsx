import React, { useState, useEffect } from 'react';
import { 
  QrCode, Monitor, ShieldAlert, BadgeCheck, RotateCw, Play, CircleDot, 
  Activity, UserCheck, Settings, Tv, CheckCircle2, Copy, Trash2, Key, Info, HelpCircle,
  Search, Shield, Zap, AlertOctagon, RefreshCw, X, Radio, Eye
} from 'lucide-react';
import { ClientDatabase, getOrGenerateRealHardwareMac } from '../remoteDb';
import { playVoice, playHaptic } from '../feedback';

interface ModuleBProps {
  db: ClientDatabase;
  onRefreshAll: () => void;
}

export const ModuleB: React.FC<ModuleBProps> = ({ db, onRefreshAll }) => {
  // Read hardware binding from localStorage if assigned, otherwise default to first station
  const [activeStationId, setActiveStationId] = useState<string>(() => {
    return localStorage.getItem('csync_physical_station_id') || 'CS-01';
  });
  
  const [stationData, setStationData] = useState(db.getStation(activeStationId));
  const [isPolling, setIsPolling] = useState(true);
  const [simulateDBError, setSimulateDBError] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  // Selector for temporary station setup if localStorage hasn't been locked
  const [selectedBindingId, setSelectedBindingId] = useState('CS-01');
  const [customStationAssigned, setCustomStationAssigned] = useState<boolean>(() => {
    return !!localStorage.getItem('csync_physical_station_id');
  });

  // Clock state for authentic Windows lock screen display
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  
  // Selection for QR Simulation
  const [simulationStudentId, setSimulationStudentId] = useState<string>('');

  // active helper tabs inside the configuration helper card
  const [helperTab, setHelperTab] = useState<'kiosk_reg' | 'shell_bat' | 'csharp_wpf'>('kiosk_reg');
  const [copySuccessMsg, setCopySuccessMsg] = useState<string | null>(null);
  const [kioskRunnerMinimized, setKioskRunnerMinimized] = useState<boolean>(false);

  // Forgot Phone & Guest Temporary override state variables
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [manualUserType, setManualUserType] = useState<'Student' | 'Guest Visitor'>('Student');
  const [manualSearchQuery, setManualSearchQuery] = useState('');
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualGuestName, setManualGuestName] = useState('');
  const [manualGuestPurpose, setManualGuestPurpose] = useState('');
  const [manualGuestMobile, setManualGuestMobile] = useState('');
  const [manualStaffId, setManualStaffId] = useState('');
  const [manualStaffPin, setManualStaffPin] = useState('');
  const [manualSuccessMsg, setManualSuccessMsg] = useState('');
  const [manualErrorMsg, setManualErrorMsg] = useState('');

  // Physical Host PC manual MAC binding states (PowerShell-based Zero-Config flow)
  const [bindMacInput, setBindMacInput] = useState('');
  const [bindStationId, setBindStationId] = useState('CS-01');
  const [bindError, setBindError] = useState<string | null>(null);
  const [bindSuccess, setBindSuccess] = useState<boolean>(false);

  // Sentry Safety & Panic State Variables
  const [panicSirenOn, setPanicSirenOn] = useState(false);
  const [activeKioskPanicId, setActiveKioskPanicId] = useState<number | null>(null);
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [panicSelectedCategory, setPanicSelectedCategory] = useState<'GENERAL' | 'FEMALE_EXTREME'>('GENERAL');
  const [panicMessageText, setPanicMessageText] = useState('');
  const [panicReporterName, setPanicReporterName] = useState('');
  
  // Simulated Guard Map coordinates
  const [guardDistance, setGuardDistance] = useState(120); // meters
  const [facialStep, setFacialStep] = useState<'idle' | 'scanning' | 'matched' | 'failed'>('idle');
  const [facialMatchScore, setFacialMatchScore] = useState(0);
  const [facialSelectedUser, setFacialSelectedUser] = useState('');

  // Audio Context Siren Pitch Modulator
  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let osc: OscillatorNode | null = null;
    let gainNode: GainNode | null = null;
    let warble: any = null;

    if (panicSirenOn) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioContextClass();
        osc = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime); // low safe volume

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();

        let sweep = true;
        warble = setInterval(() => {
          if (audioCtx && osc) {
            osc.frequency.exponentialRampToValueAtTime(sweep ? 880 : 440, audioCtx.currentTime + 0.4);
            sweep = !sweep;
          }
        }, 500);
      } catch (err) {
        console.warn('Audio Context warble failed:', err);
      }
    }

    return () => {
      if (warble) clearInterval(warble);
      if (osc) {
        try { osc.stop(); } catch (e) {}
      }
      if (audioCtx) {
        if (audioCtx.state !== 'closed') {
          try {
            audioCtx.close().catch(() => {});
          } catch (e) {}
        }
      }
    };
  }, [panicSirenOn]);

  // Rescue Squad Approaches
  useEffect(() => {
    let walkInterval: any = null;
    if (activeKioskPanicId) {
      setGuardDistance(120);
      walkInterval = setInterval(() => {
        setGuardDistance(prev => {
          if (prev <= 12) {
            clearInterval(walkInterval);
            return 8;
          }
          return prev - Math.floor(Math.random() * 8) - 10;
        });
      }, 3000);
    } else {
      setGuardDistance(120);
    }
    return () => clearInterval(walkInterval);
  }, [activeKioskPanicId]);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync station configuration whenever selection changes
  useEffect(() => {
    const checkState = () => {
      // Ensure MAC address is mapped (at least once) on 1st run of the PC
      db.ensureStationMac(activeStationId);
      const liveData = db.getStation(activeStationId);
      setStationData(liveData ? { ...liveData } : undefined);
    };

    checkState();
    const interval = setInterval(() => {
      checkState();
      if (isPolling) {
        setPollCount(prev => prev + 1);
        db.updateStationHeartbeat(activeStationId);

        // Fetch inputs from local server in-memory watchdog mapper to auto-lock or auto-logout and lock
        fetch(`/api/kiosk-watchdog?stationId=${encodeURIComponent(activeStationId)}`)
          .then(res => {
            if (!res.ok) throw new Error("HTTP error " + res.status);
            return res.json();
          })
          .then(data => {
            const currentObj = db.getStation(activeStationId);
            if (currentObj) {
              if (currentObj.status === 'UNLOCKED' && data.status === 'LOCKED') {
                console.warn("[Watchdog Notification] Direct lock requested from server!");
                db.lockStationByWatchdog(activeStationId, currentObj.activeUser?.idNumber || '', 'Server Force Logout Command');
                checkState();
                db.addLog('SECURITY', `Sentry Watchdog Succeeded: Prevented candidate move-out. Workstation ${activeStationId} forced logged-out and locked.`, 'error');
                playHaptic('error');
                playVoice(`Security override. Station ${activeStationId} has been locked and logged out remotely.`);
                onRefreshAll();
              } else if (currentObj.status === 'LOCKED' && data.status === 'UNLOCKED' && data.activeUser) {
                console.info("[Watchdog Notification] Direct unlock requested from server!");
                db.processHandshake(activeStationId, data.activeUser.idNumber, currentObj.pcMacAddress, 0);
                checkState();
                db.addLog('SECURITY', `Sentry Watchdog Succeeded: Station ${activeStationId} unlocked remotely.`, 'success');
                playHaptic('success');
                playVoice(`Station ${activeStationId} unlocked remotely by administrator.`);
                onRefreshAll();
              }
            }
          })
          .catch(e => {
            // Keep going quietly in the background
          });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeStationId, isPolling]);

  // Synchronously auto-detect physical device MAC and automatically bind registered Workstation ID on boot
  useEffect(() => {
    const realMac = getOrGenerateRealHardwareMac();
    if (!realMac) {
      // Hardware MAC is empty, meaning this browser/PWA kiosk is unbound!
      setCustomStationAssigned(false);
      return;
    }

    const allStations = db.getStations();
    
    // Find station in the DB that matches this physical MAC address
    const matchedStation = allStations.find(
      s => s.pcMacAddress && s.pcMacAddress.toUpperCase() === realMac.toUpperCase()
    );
    
    if (matchedStation) {
      const boundId = matchedStation.stationId;
      const currentBoundId = localStorage.getItem('csync_physical_station_id');
      if (currentBoundId !== boundId) {
        localStorage.setItem('csync_physical_station_id', boundId);
        setActiveStationId(boundId);
        setCustomStationAssigned(true);
        const liveData = db.getStation(boundId);
        setStationData(liveData ? { ...liveData } : undefined);
        db.addLog('SYSTEM', `AUTO-DETECTED PHYSICAL DEVICE: Linked physical MAC address [${realMac}] dynamically to Workstation ${boundId}.`, 'success');
        onRefreshAll();
      }
    } else {
      // MAC is defined locally but is not mapped to any station in the database!
      // This happens if admin released the station hardware association from the DB, so we invalidate local cache
      setCustomStationAssigned(false);
    }
  }, [db, onRefreshAll]);

  // Set first user from db to suggest in scan simulator dropdown
  useEffect(() => {
    const users = db.getUsers();
    if (users.length && !simulationStudentId) {
      setSimulationStudentId(users[0].idNumber);
    }
  }, [db, simulationStudentId]);

  // Automatically minimize Windows welcome screen to the transparent watchdog runner after 3.5 seconds
  useEffect(() => {
    if (stationData?.status === 'UNLOCKED' && !kioskRunnerMinimized) {
      const timer = setTimeout(() => {
        setKioskRunnerMinimized(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [stationData?.status, kioskRunnerMinimized]);

  // Reset minimization when station is locked so next login shows welcome screen
  useEffect(() => {
    if (stationData?.status === 'LOCKED') {
      setKioskRunnerMinimized(false);
    }
  }, [stationData?.status]);

  // Save binding to local storage using verified PC MAC address
  const handleLockInHardwareBinding = (sid: string, enteredMac: string) => {
    if (!enteredMac || !enteredMac.trim()) {
      setBindError('Please enter your physical MAC address obtained from PowerShell.');
      return;
    }
    
    const success = db.bindPhysicalStationHardware(sid, enteredMac);
    if (success) {
      setActiveStationId(sid);
      setCustomStationAssigned(true);
      setBindError(null);
      setBindSuccess(true);
      playHaptic('success');
      playVoice(`Workstation ${sid} successfully bound to physical MAC address`);
      
      const liveData = db.getStation(sid);
      setStationData(liveData ? { ...liveData } : undefined);
      
      setTimeout(() => {
        setBindSuccess(false);
      }, 3000);
      onRefreshAll();
    } else {
      setBindError('Invalid MAC format. Please check the PowerShell output and input it or use standard hex digits.');
      playHaptic('error');
    }
  };

  // Terminate station binding (Resets station state in local storage and the database)
  const handleReleaseHardwareBinding = () => {
    db.adminReleaseStationHardware(activeStationId);
    setCustomStationAssigned(false);
    playHaptic('warning');
    playVoice(`Hardware un-bound: Terminated local parameters on terminal.`);
    onRefreshAll();
  };

  // Perform virtual scan from simulator dashboard
  const handleSimulateStudentScan = () => {
    if (!simulationStudentId) return;
    const targetUser = db.getUsers().find(u => u.idNumber === simulationStudentId);
    if (!targetUser || !stationData) return;

    // Trigger biometric check handshake - GPS distance 0m represents local scanning
    const res = db.processHandshake(activeStationId, targetUser.idNumber, stationData.pcMacAddress, 0);
    
    if (res.success) {
      const liveData = db.getStation(activeStationId);
      setStationData(liveData ? { ...liveData } : undefined);
      db.addLog('SECURITY', `QR Handshake Simulated: User ${targetUser.fullName} scanned into ${activeStationId}. Windows welcome screen initialized.`, 'success');
      
      // Notify Express server watchdog of dynamic unlock in sandbox
      fetch('/api/kiosk-watchdog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: activeStationId,
          status: 'UNLOCKED',
          activeUser: targetUser
        })
      }).catch(e => console.error("Error posting to watchdog:", e));

      // Voice & Haptic feedback:
      playHaptic('success');
      const isThrinadh = targetUser?.fullName?.toLowerCase().includes('thrinadh') || targetUser?.phoneFingerprint === '8500394696';
      const displayName = isThrinadh ? 'Admin Thrinadh' : targetUser.fullName;
      playVoice(`Workstation ${activeStationId} unlocked. Welcome back, ${displayName}. Your lab session and attendance have been logged.`);

      onRefreshAll();
    } else {
      db.addLog('SECURITY', `Failed simulated QR Scan for ${activeStationId}: ${res.error}`, 'error');

      // Voice & Haptic feedback:
      playHaptic('error');
      playVoice(`Verification failed. ${res.error || 'Access denied.'}`);
    }
  };

  // Handle manual trigger soft lock reset
  const handleLockStation = () => {
    if (stationData) {
      db.lockStationByWatchdog(activeStationId, stationData.activeUser?.idNumber || '', 'Manual Admin Overrides');
      const liveData = db.getStation(activeStationId);
      setStationData(liveData ? { ...liveData } : undefined);
      db.addLog('SECURITY', `Manual physical lock triggered on workstation ${activeStationId}.`, 'info');

      // Sync lock trigger to Express server watchdog
      fetch('/api/kiosk-watchdog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: activeStationId,
          status: 'LOCKED',
          activeUser: null
        })
      }).catch(e => console.error("Error posting lock to watchdog:", e));

      // Voice & Haptic feedback:
      playHaptic('warning');
      playVoice(`Workstation ${activeStationId} has been locked by administrative override.`);

      onRefreshAll();
    }
  };

  // Submit manual override or guest visitor form directly from kiosk PC
  const handleManualOverrideKioskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualErrorMsg('');
    setManualSuccessMsg('');

    if (manualUserType === 'Student' && !manualStudentId) {
      setManualErrorMsg('Please search and select a student profile.');
      return;
    }
    if (manualUserType === 'Guest Visitor') {
      if (!manualGuestName) {
        setManualErrorMsg('Please specify guest full name.');
        return;
      }
      if (!manualGuestMobile) {
        setManualErrorMsg('Please enter guest contact mobile.');
        return;
      }
    }
    if (!manualStaffId) {
      setManualErrorMsg('Please select an approving supervisor staff.');
      return;
    }
    if (!manualStaffPin) {
      setManualErrorMsg('Please specify supervisor access PIN (default: password123).');
      return;
    }

    const res = db.manualStaffApprovedSignOn({
      userType: manualUserType,
      studentIdNumber: manualUserType === 'Student' ? manualStudentId : undefined,
      guestName: manualUserType === 'Guest Visitor' ? manualGuestName : undefined,
      guestPurpose: manualUserType === 'Guest Visitor' ? manualGuestPurpose : undefined,
      guestMobile: manualUserType === 'Guest Visitor' ? manualGuestMobile : undefined,
      stationId: activeStationId,
      staffIdNumber: manualStaffId,
      staffPin: manualStaffPin,
    });

    if (res.success) {
      const msg = `SUCCESS: Secure bypass approved by Supervisor ${manualStaffId}. PC Unit ${activeStationId} is now UNLOCKED. Initiating workspace launch...`;
      setManualSuccessMsg(msg);
      
      // Clear fields
      setManualGuestName('');
      setManualGuestPurpose('');
      setManualGuestMobile('');
      setManualStaffPin('');
      setManualSearchQuery('');
      setManualStudentId('');

      // Voice synthesis
      if (window.speechSynthesis) {
        try {
          const u = new SpeechSynthesisUtterance(`Manual bypass approved by staff. Unlocking station ${activeStationId}.`);
          window.speechSynthesis.speak(u);
        } catch (_) {}
      }

      setTimeout(() => {
        const liveData = db.getStation(activeStationId);
        setStationData(liveData ? { ...liveData } : undefined);
        
        // Notify Express server watchdog of manual supervisor unlock in sandbox
        if (liveData) {
          fetch('/api/kiosk-watchdog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stationId: activeStationId,
              status: 'UNLOCKED',
              activeUser: liveData.activeUser || null
            })
          }).catch(e => console.error("Error posting manual unlock to watchdog:", e));
        }

        setShowOverrideModal(false);
        setManualSuccessMsg('');
        onRefreshAll();
      }, 1500);
    } else {
      setManualErrorMsg(res.error || 'Access validation failed.');
    }
  };

  // Trigger campus emergency panic distress signal
  const handleRaiseKioskPanic = (category: 'GENERAL' | 'FEMALE_EXTREME') => {
    const defaultUser = stationData?.activeUser?.fullName || 'Anonymous Occupant';
    const reporter = panicReporterName.trim() || defaultUser;
    const isFemale = category === 'FEMALE_EXTREME';
    const msg = panicMessageText.trim() || (isFemale 
      ? "CRITICAL STALKING / PHYSICAL DISTRESS ALERT raised from Female safety console."
      : "Emergency physical hazard / medical crisis reported at laboratory workstation.");

    // Generate random campus coordinates near lab
    const lat = 17.7215 + (Math.random() - 0.5) * 0.003;
    const lng = 83.3142 + (Math.random() - 0.5) * 0.003;

    const alertObj = db.addPanicAlert(activeStationId, reporter, msg, isFemale, lat, lng);
    
    setActiveKioskPanicId(alertObj.id);
    setPanicSirenOn(true);
    setPanicMessageText('');
    setPanicReporterName('');
    setShowPanicModal(false);

    // Speak audio warning repeat
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(
          isFemale 
            ? "Extreme safety alert triggered. Sending immediate female safety response squad and legal telemetry feed to police servers."
            : "Emergency raised. Campus watch-guards dispatched."
        );
        window.speechSynthesis.speak(speech);
      } catch (_) {}
    }

    onRefreshAll();
  };

  // Close active panic via Facial Recognition scan animation
  const handleKioskPanicResolveWithFace = () => {
    if (!activeKioskPanicId) return;
    setFacialStep('scanning');
    setFacialMatchScore(32);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setFacialMatchScore(prev => Math.min(99, prev + Math.floor(Math.random() * 15) + 10));
      if (count >= 4) {
        clearInterval(interval);
        
        // Find user to verify
        const distressObj = db.getPanicAlerts().find(p => p.id === activeKioskPanicId);
        const matchName = distressObj?.userName || 'Authorized Student';
        
        db.resolvePanicAlertWithFace(activeKioskPanicId, matchName, 98.4);
        setFacialStep('matched');
        
        setTimeout(() => {
          setPanicSirenOn(false);
          setActiveKioskPanicId(null);
          setFacialStep('idle');
          setFacialMatchScore(0);
          onRefreshAll();
        }, 2200);
      }
    }, 450);
  };

  // Close active panic via teacher password credentials
  const handleKioskPanicResolveAdmin = (staffId: string, pin: string) => {
    if (!activeKioskPanicId) return;
    if (!staffId) {
      alert('Select an approving supervisor.');
      return;
    }
    const users = db.getUsers();
    const sf = users.find(u => u.idNumber === staffId && u.role === 'Staff');
    if (sf && (pin === 'password123' || pin === sf.password)) {
      db.resolvePanicAlert(activeKioskPanicId, `${sf.fullName} (Academic Staff Override)`);
      setPanicSirenOn(false);
      setActiveKioskPanicId(null);
      onRefreshAll();
    } else {
      alert('Supervisor authentication failed. Please check password PIN.');
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccessMsg('Copied to clipboard');
    setTimeout(() => setCopySuccessMsg(null), 3050);
  };

  // Kiosk mode registry and shell scripts
  const registryScript = `Windows Registry Editor Version 5.00

; CSYNC Automated Lab Kiosk Mode Installer - Auto Logon & Shell override
; WARNING: This runs C-SYNC immediately before the Windows Welcome/Explorer desktop shell.

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon]
"AutoAdminLogon"="1"
"DefaultUserName"="CSYNC_LAB_USER"
"DefaultPassword"="password123"
"DefaultDomainName"="CSYNC-CAMPUS"
"Shell"="C:\\\\Program Files\\\\C-SYNC\\\\CSYNC-WPF-Client.exe --kiosk --station-id=${activeStationId}"
"ShellIsAllowed"=dword:00000001`;

  const shellCommandScript = `@echo off
echo ========================================================
echo C-SYNC ADVANCED WORKSTATION KIOSK CONVERTER
echo This will swap the Windows shell for Kiosk load on boot.
echo ========================================================
mkdir "C:\\Program Files\\C-SYNC"
echo [SYS_ID] Running bindings set to: ${activeStationId}

:: Step 1: Force system autologin configuration
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon" /v AutoAdminLogon /t REG_SZ /d 1 /f
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon" /v DefaultUserName /t REG_SZ /d CSYNC_LAB_USER /f
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon" /v Shell /t REG_SZ /d "C:\\Program Files\\C-SYNC\\CSYNC-WPF-Client.exe" /f

echo SUCCESS: Terminal system ${activeStationId} is set to kiosk boot.
pause`;

  const csharpCodeSnippet = `// WPF MainWindow.xaml.cs Shell Hook and Webview Lock Control
using Microsoft.Web.WebView2.Core;
using System.Windows;
using System.Windows.Input;

namespace CSYNC.Kiosk
{
    public partial class MainWindow : Window
    {
        private const string TargetStation = "${activeStationId}";
        
        public MainWindow()
        {
            InitializeComponent();
            
            // Fullscreen boundaries
            this.WindowStyle = WindowStyle.None;
            this.WindowState = WindowState.Maximized;
            this.Topmost = true;
            
            // Auto initialize WebView directed to C-SYNC Top workstation endpoint
            MyWebView.Source = new System.Uri($"https://csync.top/kiosk?id={TargetStation}");
        }

        protected override void OnPreviewKeyDown(KeyEventArgs e)
        {
            // Bypasses system keys except Ctrl+Alt+Del. If developer password entered, allow exit.
            if (e.Key == Key.Escape) {
                // Secret Admin credential check: 'Thrinadh'
                var prompt = Microsoft.VisualBasic.Interaction.InputBox("Enter Operator Override Code:", "C-SYNC Lockout Override");
                if (prompt == "Thrinadh") {
                    this.Close();
                }
            }
            e.Handled = true; // Block keyboard inputs
        }
    }
}`;

  // QR Code Payload representation matching spec
  const qrBlobPayload = JSON.stringify({
    sid: stationData?.stationId || activeStationId,
    hw: stationData?.pcMacAddress || ''
  }, null, 2);

  // Custom QR Encoder representation using visually perfect styled vectors
  const encodedPayloadURI = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrBlobPayload)}&color=00f2ff&bgcolor=020617`;

  return (
    <div className="glass-panel rounded-xl p-5 relative overflow-hidden shadow-xl backdrop-blur-md border border-cyan-500/20 text-left">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 border-b border-cyan-500/20 pb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-[#00f2ff]">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-[#00f2ff] uppercase font-orbitron">Active Workstation Sentry Monitor</h2>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">Sovereign active workstation monitoring node</p>
          </div>
        </div>

        {/* Persistent Hardware Binding Status Badge */}
        <div className="flex items-center gap-2">
          {customStationAssigned ? (
            <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 rounded-lg px-2.5 py-1 text-[10px] font-mono flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>BOUND AS dedicated terminal: <strong className="text-white font-bold">{activeStationId}</strong></span>
            </div>
          ) : (
            <div className="bg-amber-950/80 border border-amber-500/40 text-amber-300 rounded-lg px-2.5 py-1 text-[10px] font-mono flex items-center gap-1.5 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
              <span>UNASSIGNED PHYSICAL TERMINAL: SCANNING FOR HOST NETWORK MAC CARD...</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid Layout containing Simulated Display Shell on LHS and Configuration Controls on RHS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LHS: COMPREHENSIVE SIMULATED MACHINE MONITOR */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-[#020617] rounded-xl border border-cyan-500/25 overflow-hidden relative shadow-2xl flex flex-col flex-1 min-h-[450px]">
            
            {/* Real-time status band at the top of the terminal */}
            <div className="bg-[#050a18] border-b border-cyan-500/15 px-4 py-2 flex items-center justify-between text-[11px] font-mono text-cyan-400">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${stationData?.status === 'UNLOCKED' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-[#00f2ff] shadow-[0_0_8px_rgba(0,242,255,0.5)]'}`}></span>
                <span>C-SYNC INTEGRATION TERMINAL V8.2</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-[9.5px]">
                  <RotateCw className={`w-3 h-3 text-cyan-400 ${isPolling && !simulateDBError && stationData?.status !== 'UNLOCKED' ? 'animate-spin' : ''}`} />
                  {simulateDBError ? 'STATION_BYPASS_ONLY' : stationData?.status === 'UNLOCKED' ? 'SESSION_ACTIVE' : 'READY_LOCK'}
                </span>
                <span className="text-slate-400 font-bold">NODE: {activeStationId}</span>
              </div>
            </div>

            {/* Simulated UI Screen output */}
            <div className="flex-1 flex flex-col relative min-h-[290px]">

              {/* EMERGENCY ACTIVE PANIC BROADCAST LAYER */}
              {activeKioskPanicId ? (
                <div className="flex-1 bg-gradient-to-b from-[#180202] to-[#040000] p-5 flex flex-col text-left animate-fadeIn border-2 border-red-500 overflow-y-auto relative" id="kiosk-active-panic-overlay">
                  {/* Flashing warning accent */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[9px] font-bold animate-pulse">
                    <Radio className="w-3 h-3 text-white" /> COPS COMM_FEED ONLINE
                  </div>

                  <div className="flex justify-between items-start border-b border-red-500/30 pb-2.5">
                    <div>
                      <h2 className="text-xl font-bold font-orbitron text-red-500 tracking-wider flex items-center gap-1.5 animate-pulse uppercase">
                        <AlertOctagon className="w-5 h-5 text-red-500" /> SOS ALARM ACTIVE
                      </h2>
                      <p className="text-[10px] text-zinc-400 font-sans mt-0.5">Sentry unit coordinates locked with local law enforcement</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-3">
                    {/* Map & Live approaching squad */}
                    <div className="md:col-span-7 space-y-3">
                      <div className="p-3 bg-red-950/30 border border-red-500/35 rounded-xl text-xs space-y-1">
                        <div className="text-[#ff4e4e] font-bold uppercase font-mono tracking-wider">
                          🚨 {db.getPanicAlerts().find(a => a.id === activeKioskPanicId)?.isExtremeFemalePanic ? 'CRITICAL FEMALE PROTECTION SOS PROTOCOL' : 'STANDARD WORKSTATION PANIC SIGNAL'}
                        </div>
                        <p className="text-[#ffe0e0] italic font-sans animate-pulse">
                          "{(db.getPanicAlerts().find(a => a.id === activeKioskPanicId))?.message}"
                        </p>
                        <div className="flex justify-between items-center text-[9px] text-[#ffccc3] pt-1">
                          <span>Occupant: <b>{(db.getPanicAlerts().find(a => a.id === activeKioskPanicId))?.userName}</b></span>
                          <span>Timestamp: {new Date((db.getPanicAlerts().find(a => a.id === activeKioskPanicId))?.timestamp || Date.now()).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                        </div>
                      </div>

                      {/* Live Walking Map */}
                      <div className="bg-slate-950 border border-red-500/20 p-3 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-zinc-400 font-mono uppercase font-bold tracking-wider">Topological Sentry Map</span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold animate-pulse flex items-center gap-1">
                            <Radio className="w-3 h-3 animate-ping" /> Rescue approaching: {guardDistance}m
                          </span>
                        </div>

                        {/* Interactive dynamic walking corridor chart */}
                        <div className="h-24 bg-[#02050f] rounded-lg border border-white/5 relative overflow-hidden">
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
                          
                          {/* Station red dot */}
                          <div className="absolute left-1/4 top-1/2 -translate-y-1/2 flex flex-col items-center">
                            <span className="absolute h-5 w-5 bg-red-500 rounded-full opacity-40 animate-ping"></span>
                            <span className="h-2.5 w-2.5 bg-red-500 rounded-full border border-white relative z-10"></span>
                            <span className="text-[8px] text-red-400 font-mono mt-1 font-bold">Kiosk PC</span>
                          </div>

                          {/* Approaching Guards */}
                          <div 
                            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-1000"
                            style={{ left: `${Math.max(30, 30 + (guardDistance / 120) * 55)}%` }}
                          >
                            <span className="absolute h-4 w-4 bg-emerald-400 rounded-full opacity-50 animate-ping"></span>
                            <span className="h-2.5 w-2.5 bg-emerald-400 rounded-full border border-white relative z-10"></span>
                            <span className="text-[8px] text-emerald-400 font-mono mt-1 font-bold">Rescuers</span>
                          </div>

                          <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <line 
                              x1="25%" y1="50%" 
                              x2={`${Math.max(30, 30 + (guardDistance / 120) * 55)}%`} y2="50%" 
                              stroke="#ef4444" 
                              strokeWidth="1.2" 
                              strokeDasharray="3,3"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-2 bg-black/60 border border-white/5 rounded-lg">
                        <span className="text-[9.5px] font-mono text-zinc-400">TELEGRAM_DISPATCH: FEED TRANSMITTED ON @GDCSentryEmergencyBot</span>
                        <button
                          type="button"
                          onClick={() => setPanicSirenOn(!panicSirenOn)}
                          className={`text-[8.5px] font-mono hover:brightness-110 px-2 py-0.5 rounded font-black border transition ${
                            panicSirenOn 
                              ? 'bg-red-500 border-red-400 text-slate-950 animate-pulse' 
                              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                          }`}
                        >
                          {panicSirenOn ? '🚨 Siren On' : '🔊 Play Siren'}
                        </button>
                      </div>
                    </div>

                    {/* Verification blocks */}
                    <div className="md:col-span-5 space-y-3">
                      {/* Face recognition camera */}
                      <div className="p-3 bg-slate-950 border border-cyan-500/20 rounded-xl space-y-2 relative">
                        <h4 className="text-[11px] font-black font-orbitron text-white uppercase flex items-center gap-1 text-cyan-400">
                          <Eye className="w-3.5 h-3.5" /> Biometric Identity Safe Clear
                        </h4>
                        <p className="text-[9.5px] text-zinc-400 leading-normal">
                          Perform instant 3D face scan landmarks verification to instantly resolve safety code.
                        </p>

                        {facialStep === 'idle' && (
                          <button
                            type="button"
                            onClick={handleKioskPanicResolveWithFace}
                            className="w-full bg-[#00f2ff] hover:bg-cyan-400 text-slate-950 font-mono text-[10px] uppercase font-bold py-1.5 rounded transition cursor-pointer"
                          >
                            Activate Face Scan Camera
                          </button>
                        )}

                        {facialStep === 'scanning' && (
                          <div className="space-y-1.5 py-1 text-center font-mono">
                            <p className="text-[9px] text-[#00f2ff] animate-pulse">Scanning mesh... {facialMatchScore}% match</p>
                            <div className="h-16 bg-slate-900 border border-cyan-500/20 rounded overflow-hidden relative flex items-center justify-center">
                              <div className="absolute left-0 right-0 h-0.5 bg-cyan-400 animate-scan"></div>
                              <span className="text-[8px] text-zinc-500">Retrieving academic photo...</span>
                            </div>
                          </div>
                        )}

                        {facialStep === 'matched' && (
                          <div className="py-2 text-center text-green-400 font-bold border border-green-500/20 bg-green-950/20 rounded font-mono text-[10px] space-y-1">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />
                            <div>Verified Identity (98.4%)</div>
                            <span className="text-[8.5px] text-zinc-400 font-normal">Resolving Sentry Dispatch...</span>
                          </div>
                        )}
                      </div>

                      {/* Instructor lock bypass code override */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const staffRef = document.getElementById('kiosk-panic-staff-sh') as HTMLSelectElement;
                          const pinRef = document.getElementById('kiosk-panic-pin-sh') as HTMLInputElement;
                          handleKioskPanicResolveAdmin(staffRef?.value, pinRef?.value);
                          if (pinRef) pinRef.value = '';
                        }}
                        className="p-3 bg-zinc-950 border border-purple-500/20 rounded-xl space-y-2"
                      >
                        <h4 className="text-[11px] font-black font-orbitron text-purple-300 uppercase flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" /> Supervisor Passcode Clear
                        </h4>
                        <div className="space-y-1.5 text-[9.5px]">
                          <select
                            id="kiosk-panic-staff-sh"
                            className="w-full bg-slate-900 border border-purple-500/20 rounded text-amber-200 p-1 font-mono focus:outline-none"
                          >
                            <option value="">-- Choose Supervisor --</option>
                            {db.getUsers().filter(u => u.role === 'Staff').map(u => (
                              <option key={u.idNumber} value={u.idNumber}>{u.fullName}</option>
                            ))}
                          </select>
                          <input
                            id="kiosk-panic-pin-sh"
                            type="password"
                            placeholder="Staff Password PIN"
                            className="w-full bg-slate-900 border border-purple-500/20 rounded text-green-300 p-1 font-mono focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800 font-mono text-[9px] uppercase font-bold py-1.5 rounded transition cursor-pointer"
                        >
                          Ease Alarms Dispatch
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ) : simulateDBError ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#070000] relative animate-fadeIn" id="dberr-block">
                  <div className="absolute top-4 left-4 border border-rose-500/30 rounded px-2 py-0.5 text-[9px] font-mono text-rose-500 tracking-wider font-bold">
                    CRITICAL_SYS_LINK_FAIL
                  </div>
                  
                  <ShieldAlert className="w-12 h-12 text-rose-500 mb-3 animate-pulse" />
                  <h3 className="text-sm font-bold font-orbitron text-rose-400 tracking-widest uppercase">System Offline</h3>
                  <p className="text-xs text-slate-300 max-w-sm mt-2 font-sans">
                    Active MySQL table links on csync.top crashed or timeout occurred. WPF shell auto-recovery locks engaged. Please execute the native <code className="text-rose-400 font-mono font-bold bg-rose-950/40 px-1 py-0.5 rounded">Developer's First Name</code> bypass key to reset shell.
                  </p>
                  <div className="mt-4 px-3 py-1 bg-rose-950/40 border border-rose-500/35 rounded text-[10px] font-mono text-rose-300">
                    C-SYNC OFFLINE_PASSBACK_ENABLED
                  </div>
                </div>
              ) : !customStationAssigned ? (
                <div className="flex-1 flex flex-col justify-between p-5 bg-slate-950 font-sans text-left relative animate-fadeIn border border-amber-500/20 shadow-[inset_0_0_30px_rgba(245,158,11,0.03)]" id="hardware-unbound-block">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-amber-500/10">
                      <div className="p-1 px-2.5 rounded bg-amber-950/60 border border-amber-500/40 text-[10px] font-mono text-amber-500 font-bold tracking-widest uppercase flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                        EXCEPTION_UNBOUND_HARDWARE
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold ml-auto">ZERO-CONFIG HANDSHAKE</span>
                    </div>

                    {/* Description Message */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-black font-orbitron text-amber-300 tracking-wider uppercase flex items-center gap-1.5">
                        <AlertOctagon className="w-4 h-4 text-amber-500" /> Physical Workstation Fingerprint Required
                      </h3>
                      <p className="text-[11px] text-slate-300 leading-normal font-sans">
                        C-SYNC secured kiosks do not permit default laptop profiling to prevent physical spoofing. Please run the following native <strong>PowerShell</strong> cmdlet in Administrator mode on your PC to retrieve its physical MAC card token, then register it below to bind this virtual interface.
                      </p>
                    </div>

                    {/* PowerShell Code Box */}
                    <div className="bg-black/85 p-3 rounded-xl border border-white/5 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-teal-400 uppercase tracking-widest font-bold">1. Native PowerShell Identifier Cmdlet</span>
                        <button
                          onClick={() => handleCopyToClipboard(`$mac = (Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | Select-Object -First 1).MacAddress; Set-Clipboard -Value $mac; Write-Host "REAL PC MAC RETRIEVED & COPIED: $mac" -ForegroundColor Green`)}
                          className="text-[9px] font-mono bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 border border-cyan-500/20 text-[#00f2ff] px-2 py-0.5 rounded transition flex items-center gap-1 cursor-pointer font-bold uppercase"
                          type="button"
                        >
                          <Copy className="w-3 h-3" /> Click to Copy Script
                        </button>
                      </div>
                      
                      <code className="block select-all font-mono text-[9px] text-[#00f2ff] leading-relaxed bg-[#020617] p-2 rounded border border-cyan-500/10 max-h-24 overflow-x-auto">
                        $mac = (Get-NetAdapter | Where-Object &#123; $_.Status -eq 'Up' &#125;| Select-Object -First 1).MacAddress; Set-Clipboard -Value $mac; Write-Host "REAL PC MAC RETRIEVED & COPIED: $mac" -ForegroundColor Green
                      </code>
                      
                      <div className="text-[9.5px] text-slate-400 font-sans leading-normal">
                        <strong>Command note:</strong> This command fetches the MAC address of your active network adapter, displays it, and <strong>automatically copies it to your clipboard</strong> for easy pasting below!
                      </div>
                    </div>

                    {/* Form Binder */}
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 space-y-3">
                      <span className="text-[9.5px] font-mono text-[#00f2ff] uppercase tracking-widest font-bold block">2. Register and Secure-Bind Client Terminal</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="block text-[9px] text-slate-400 font-mono uppercase font-bold">Target Station Code:</label>
                          <select
                            value={bindStationId}
                            onChange={(e) => setBindStationId(e.target.value)}
                            className="w-full text-white bg-slate-950 border border-cyan-500/30 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 font-mono text-xs cursor-pointer"
                          >
                            {Array.from({ length: 50 }, (_, i) => {
                              const sid = `CS-${String(i + 1).padStart(2, '0')}`;
                              return <option key={sid} value={sid}>{sid} ({db.getStation(sid)?.pcMacAddress?.includes('Pending') ? 'AVAILABLE' : 'TAKEN'})</option>;
                            })}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] text-slate-400 font-mono uppercase font-bold">Pasted physical MAC Address:</label>
                          <input
                            type="text"
                            value={bindMacInput}
                            onChange={(e) => setBindMacInput(e.target.value)}
                            placeholder="e.g. 3C-F8-62-0B-4E-9D (or Paste copied MAC)"
                            className="w-full text-[#00f2ff] bg-slate-950 border border-cyan-500/30 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 font-mono text-xs placeholder:text-slate-600 uppercase"
                          />
                        </div>
                      </div>

                      {bindError && (
                        <div className="text-[10px] font-mono text-rose-400 font-bold border border-rose-500/20 bg-rose-950/20 p-2 rounded">
                          ✗ {bindError}
                        </div>
                      )}

                      {bindSuccess && (
                        <div className="text-[10px] font-mono text-emerald-400 font-bold border border-emerald-500/20 bg-emerald-950/20 p-2 rounded animate-pulse">
                          ✓ Successfully registered MAC address! Workstation activated.
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleLockInHardwareBinding(bindStationId, bindMacInput)}
                        className="w-full bg-[#00f2ff] hover:bg-[#52edff] text-slate-950 font-mono font-bold text-xs py-2 rounded transition uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                        type="button"
                      >
                        <BadgeCheck className="w-4 h-4" /> Secure-Bind Hardware Node & Boot Kiosk
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 text-[9.5px] font-mono text-slate-500 flex items-center gap-1.5 justify-center border-t border-white/5 pt-2">
                    <span>SECURITY MONITOR STATUS:</span>
                    <span className="text-amber-500 animate-pulse font-bold">AWAITING_PHYSICAL_MAC_AUTHORIZATION</span>
                  </div>
                </div>
              ) : stationData?.status === 'UNLOCKED' ? (
                
                kioskRunnerMinimized ? (
                  /* MINIMIZED VIEW: HIGHLY TRANSPARENT BACKGROUND RUNNER FLOATING IN THE BACKGROUND */
                  <div className="flex-1 flex flex-col items-center justify-between bg-black/10 backdrop-blur-[1px] p-4 text-center animate-fadeIn relative overflow-hidden" id="win-welcome-screen-minimized">
                    {/* Small floating transparent runner styled beautifully with emerald indicators */}
                    <div className="w-full flex flex-col md:flex-row justify-between items-center gap-3 bg-slate-950/90 backdrop-blur-md border border-emerald-500/30 rounded-xl p-3 shadow-xl z-20">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <img 
                            src={stationData.activeUser?.photoBlob} 
                            alt={stationData.activeUser?.fullName} 
                            className="w-10 h-10 rounded-full border border-[#00f2ff] shadow-sm object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-slate-950"></span>
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-white leading-tight capitalize">
                            {stationData.activeUser?.fullName}
                          </div>
                          <div className="text-[9.5px] text-[#00f2ff] font-mono uppercase tracking-widest mt-0.5">
                            {stationData.activeUser?.role} • SESSION ACTIVE
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/40 border border-emerald-500/25 rounded-md">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="text-[10px] text-emerald-300 font-mono tracking-wider font-bold">
                            SENTRY WATCHDOG ACTIVE RUNNER
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setKioskRunnerMinimized(false)}
                            className="text-[9.5px] text-cyan-400 hover:text-white bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-500/20 px-2.5 py-1.5 rounded uppercase font-bold transition-all cursor-pointer font-mono"
                            type="button"
                          >
                            Maximize HUD
                          </button>
                          
                          <button
                            onClick={handleLockStation}
                            className="text-[9.5px] text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900 border border-rose-500/25 px-2.5 py-1.5 rounded uppercase font-bold transition-all cursor-pointer font-mono"
                            type="button"
                          >
                            Forced Logout
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center py-6 text-slate-400/85 font-mono text-center select-none text-[10px] max-w-md my-auto space-y-2">
                      <Shield className="w-8 h-8 text-emerald-400 animate-pulse mx-auto" />
                      <div>
                        <p className="font-extrabold text-slate-200 tracking-widest uppercase">Candidates Active Monitor</p>
                        <p className="text-[9px] text-slate-500 leading-relaxed mt-1">
                          Sovereign workstation environment is fully operational behind this translucent shield. Sentry runner continuously fetches heartbeat inputs from the main backend to securely audit your session.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* SECTION B: GORGEOUS GLASSMORPHIC WELCOME SCREEN WITH ANIMATED BG RADARS */
                  <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/65 backdrop-blur-[10px] p-6 text-center animate-fadeIn relative overflow-hidden border border-emerald-500/25 shadow-[inset_0_0_50px_rgba(16,185,129,0.05)]" id="win-welcome-screen">
                    
                    {/* Subtle blurry accent circles */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

                    {/* Windows Clock Panel centered at top */}
                    <div className="absolute top-4 left-4 text-left font-sans select-none z-10">
                      <div className="text-2xl font-light text-slate-100 tracking-tight">
                        {currentDateTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-0.5">
                        {currentDateTime.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] bg-emerald-950/70 border border-emerald-500/35 text-emerald-400 px-2.5 py-0.5 rounded font-mono font-bold animate-pulse">
                      <Radio className="w-3 h-3 text-emerald-400" />
                      WATCHDOG_RUNNER_ACTIVE
                    </div>

                    {/* Windows Welcome Circular Card Container */}
                    <div className="flex flex-col items-center max-w-sm z-10 space-y-4">
                      {/* User Profile avatar with Windows style round crop and cyan border glow */}
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)] relative z-10">
                          <img
                            src={stationData.activeUser?.photoBlob}
                            alt={stationData.activeUser?.fullName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="absolute bottom-0 right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-slate-950 shadow z-25">
                          <UserCheck className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-[#00f2ff] font-mono tracking-widest uppercase">Welcome back</p>
                        <h3 className="text-2xl font-light text-white font-sans tracking-wide">
                          <span className="font-semibold text-slate-100">{stationData.activeUser?.fullName}</span>
                        </h3>
                        <span className="inline-block px-2.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/20 text-cyan-300 font-mono text-[9px] uppercase font-bold tracking-wider">
                          {stationData.activeUser?.role}
                        </span>
                      </div>

                      <div className="bg-slate-950/80 py-2.5 px-4 rounded-xl border border-white/5 text-[10.5px] font-mono text-slate-350 space-y-1 text-center max-w-xs backdrop-blur-md">
                        <div>Hardware Target Token: <strong className="text-[#00f2ff]">{stationData.stationId}</strong></div>
                        <div className="text-slate-500 text-[9.5px]">MAC Checked: {stationData.pcMacAddress}</div>
                        <div className="text-[9px] text-emerald-400 flex items-center justify-center gap-1 mt-1 font-bold">
                          <BadgeCheck className="w-3.5 h-3.5" /> SECURED ACADEMIC ACTIVE SESSION
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 leading-normal max-w-xs font-sans">
                        Your identity is securely bound. To let you review live workspace indices behind this panel, minimize to the active glassy runner below.
                      </p>

                      <div className="flex flex-col md:flex-row gap-2.5 w-full">
                        <button
                          onClick={() => setKioskRunnerMinimized(true)}
                          className="flex-1 text-[9.5px] text-emerald-400 hover:text-white bg-emerald-950/30 hover:bg-emerald-900 border border-emerald-500/30 font-mono tracking-widest uppercase rounded px-3 py-2 transition-all cursor-pointer font-bold"
                          type="button"
                        >
                          Minimize to Runner
                        </button>

                        <button
                          onClick={handleLockStation}
                          className="text-[9.5px] text-rose-400 hover:text-white bg-rose-950/30 hover:bg-rose-900 border border-rose-500/20 hover:border-rose-400 font-mono tracking-widest uppercase rounded px-3 py-2 transition-all cursor-pointer font-bold"
                          type="button"
                        >
                          Forced Logout
                        </button>
                      </div>

                      <div className="flex flex-col items-center pt-1">
                        {/* Windows dots spin loader */}
                        <div className="flex gap-2 items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-mono mt-1.5 tracking-widest uppercase hover:text-white">watchdog checking command inputs...</p>
                      </div>

                    </div>
                  </div>
                )
              ) : (
                
                /* SECTION C: LOCK SCREEN WAITING STATE WITH ROTATING BIOMETRIC QR CODES */
                <div className="flex-1 p-5 flex flex-col justify-between bg-[#03091b] animate-fadeIn" id="qr-lock-screen">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 flex-1 py-2">
                    {/* Left Block info details */}
                    <div className="text-left space-y-2.5 max-w-xs md:max-w-[230px]">
                      <div className="inline-flex items-center gap-1.5 text-[9px] font-mono text-[#00f2ff] tracking-widest uppercase border border-cyan-500/35 px-2 py-0.5 rounded bg-cyan-950/30">
                        <Key className="w-3 h-3 text-[#00f2ff]" /> Active QR Lock Screen
                      </div>
                      <h2 className="text-xl font-bold font-orbitron text-white mt-1 tracking-wide uppercase">
                        STATION <span className="text-[#00f2ff]">{activeStationId}</span>
                      </h2>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed">
                        This PC is securely locked at system startup. Scan the visual QR using your C-SYNC Mobile client app to log in and boot the secure workstation session interface.
                      </p>
                      
                      <div className="bg-[#020617] border border-cyan-500/20 rounded p-2 text-[10px] font-mono">
                        <div className="text-slate-500 uppercase font-bold text-[8.5px]">Authorized HW Bind Signature:</div>
                        <div className="text-[#00f2ff] truncate mt-0.5">{stationData?.pcMacAddress}</div>
                      </div>
                    </div>

                    {/* Right Block styled QR vectors */}
                    <div className="flex flex-col items-center">
                      <div className="bg-[#020617] border-2 border-[#00f2ff] p-3 rounded-xl shadow-xl shadow-cyan-500/10 relative group">
                        
                        {/* Interactive Visual Green laser scan indicator */}
                        <div className="absolute top-3 left-3 right-3 h-[2px] bg-cyan-400 shadow-md shadow-cyan-400/80 animate-scan"></div>
                        
                        <img
                          src={encodedPayloadURI}
                          alt="C-SYNC rotating biometric QR authorization gateway"
                          className="w-[130px] h-[130px]"
                          onError={() => {}}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[9px] text-[#00f2ff] font-mono mt-2 tracking-widest uppercase text-center animate-pulse">
                        SECURE BIOMETRIC GATEWAY
                      </span>
                    </div>
                  </div>

                  {/* Watchdog live security logs ledger widget to fill empty space beautifully */}
                  <div className="mt-2.5 mb-1 p-3 bg-slate-950/80 border border-cyan-500/15 rounded-xl text-left space-y-2 font-mono">
                    <div className="flex justify-between items-center border-b border-cyan-500/15 pb-1.5">
                      <div className="flex items-center gap-1.5 text-[#00f2ff] text-[9.5px] font-bold tracking-widest uppercase">
                        <span className="relative flex h-2 w-[8px]">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-450 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                        </span>
                        <span>Watchdog Terminal Live Security Ledger</span>
                      </div>
                      <span className="text-[8px] text-cyan-400 animate-pulse uppercase font-bold tracking-widest">Active Guard Stream</span>
                    </div>

                    <div className="space-y-1 max-h-[190px] overflow-y-auto pr-1">
                      {db.getLogs()
                        .filter(log => log.category === 'SECURITY' || log.category === 'SYSTEM')
                        .slice(-4)
                        .reverse()
                        .map((log) => {
                          const levelColors = {
                            success: 'text-green-400',
                            warning: 'text-amber-400',
                            error: 'text-rose-400',
                            info: 'text-cyan-400'
                          };
                          const categoryColor = log.category === 'SECURITY' ? 'text-purple-400' : 'text-slate-400';
                          return (
                            <div key={log.id} className="text-[9.5px] leading-relaxed flex items-start gap-1 p-1 rounded bg-black/20 border border-white/[0.01]">
                              <span className="text-zinc-500 text-[8.5px] flex-shrink-0 select-none">
                                {new Date(log.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                              </span>
                              <span className={`font-bold font-sans text-[8px] uppercase ${categoryColor} flex-shrink-0 px-1 bg-white/5 rounded-[2px] select-none text-center min-w-[55px]`}>
                                {log.category}
                              </span>
                              <span className={`font-bold text-[9px] ${levelColors[log.level || 'info']} flex-shrink-0 select-none`}>
                                [{log.level?.toUpperCase()}]
                              </span>
                              <span className="text-slate-300 truncate flex-1 hover:text-white transition-colors" title={log.message}>
                                {log.message}
                              </span>
                            </div>
                          );
                        })}
                      {db.getLogs().filter(log => log.category === 'SECURITY' || log.category === 'SYSTEM').length === 0 && (
                        <div className="text-[9.5px] text-zinc-500 text-center py-2 italic font-mono select-none">
                          No active monitoring signatures logged. Watching workstation inputs...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SENTRY BYPASS ACCESS & SOS TRIGGERS */}
                  <div className="border-t border-cyan-900/40 mt-3 pt-3 flex flex-wrap items-center justify-between gap-2.5 text-left bg-black/20 p-2 rounded">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setManualErrorMsg('');
                          setManualSuccessMsg('');
                          setShowOverrideModal(true);
                        }}
                        className="py-1 px-3 bg-purple-950/70 hover:bg-purple-900 border border-purple-500/35 text-purple-300 text-[10.5px] font-mono rounded cursor-pointer transition flex items-center gap-1.5 uppercase font-bold shadow-md shadow-purple-950/50"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> Kiosk Manual Override
                      </button>

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/30 border border-cyan-500/30 text-[8.5px] font-mono text-[#00f2ff] select-none uppercase tracking-widest rounded-md hidden sm:inline-flex shadow-[0_0_12px_rgba(0,242,255,0.08)] align-middle">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        <span>No smartphone? Guest? use witness bypass</span>
                      </span>
                    </div>

                    {/* EMERGENCY TRIGGERS */}
                    <button
                      type="button"
                      onClick={() => {
                        setPanicMessageText('');
                        setPanicReporterName('');
                        setShowPanicModal(true);
                      }}
                      className="py-1 px-3 bg-red-950/80 hover:bg-red-900/90 border border-red-500/40 text-red-300 text-[10.5px] font-mono rounded cursor-pointer transition flex items-center gap-1.5 uppercase font-bold shadow-md shadow-red-950/20 animate-pulse"
                    >
                      <AlertOctagon className="w-3.5 h-3.5 text-red-500" /> Raise SOS Panic
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom active telemetry stats display */}
            <div className="bg-[#020617] border-t border-cyan-500/15 p-2.5 text-[9.5px] font-mono text-slate-400 text-left overflow-x-auto flex items-center justify-between">
              <div className="truncate pr-4">
                <span className="text-cyan-400 font-bold">LIVE TELEMETRY:</span>
                <span className="text-slate-300 ml-1 tracking-tighter">{qrBlobPayload.replace(/\s+/g, ' ')}</span>
              </div>
              <div className="text-slate-500 select-none flex-shrink-0 font-sans text-[10px]">
                {currentDateTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </div>
            </div>
          </div>


        </div>

        {/* RHS: PHYSICAL BINDING & AUTO-BOOT KIOSK SETUP SYSTEM CONFIGURATOR */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* WINDOW A: PHYSICAL HARDWARE ASSIGNMENT & BINDING CARD */}
          <div className="bg-[#020617] rounded-xl border border-cyan-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4.5 h-4.5 text-[#00f2ff]" />
              <h3 className="text-xs font-bold font-orbitron text-white uppercase">Physical Terminal Assignment</h3>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              Bind this browser host to a unique Workstation ID in <code>localStorage</code>. It acts as a dedicated kiosk terminal that automatically retrieves its system configuration and identity index on startup.
            </p>

            {customStationAssigned ? (
              <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 text-[11px]">Current Assigned ID:</span>
                  <span className="text-green-400 font-bold font-sans text-sm">{activeStationId}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 text-[11px]">MAC Address Binding:</span>
                  <span className="text-white text-[11px]">{stationData?.pcMacAddress || 'Pending'}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono border-t border-cyan-500/10 pt-2 select-all">
                  <span className="text-slate-500 text-[10px]">Local Cache Marker:</span>
                  <span className="text-[10px] text-cyan-400 font-bold">csync_physical_station_id</span>
                </div>

                <div className="bg-emerald-950/45 border border-emerald-500/20 text-emerald-400 text-[10px] p-2.5 rounded-lg space-y-1 leading-normal">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>✓ Hardware Binding Active & Secured</span>
                  </div>
                  <p className="text-slate-400 text-[9.5px]">
                    Accidental releases are prevented. Terminal binding profile controls and rebindings are configured exclusively under the central <strong>Admin Panel settings</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="bg-slate-950 p-3 rounded-lg border border-amber-500/20 flex gap-2.5 items-start text-xs text-slate-300">
                  <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>Unassigned Hardware Node. Please use the <strong>Interactive PowerShell Fingerprint Guide</strong> on the main central monitor screen to register your client terminal.</span>
                </div>
              </div>
            )}
          </div>

          {/* WINDOW B: ADVANCED AUTO-LOAD KIOSK MODE CONTEXT SCRIPTS */}
          <div className="bg-[#020617] rounded-xl border border-cyan-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Tv className="w-4.5 h-4.5 text-purple-400" />
              <h3 className="text-xs font-bold font-orbitron text-white uppercase">Automated Kiosk Setup Tool</h3>
              <span className="text-[8px] bg-purple-950/50 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-mono font-bold uppercase ml-auto">On OS Bootup</span>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              To trigger C-SYNC automatically upon workstation restart <em>before</em> the OS logins appear, use one of these customized kiosk replacement scripts:
            </p>

            {/* Config center internal tabs */}
            <div className="flex bg-slate-950 border border-white/5 rounded-lg overflow-hidden p-1 font-mono text-[9px] mb-3.5">
              <button
                onClick={() => setHelperTab('kiosk_reg')}
                className={`flex-1 py-1.5 text-center transition-colors uppercase font-bold rounded ${helperTab === 'kiosk_reg' ? 'bg-[#00f2ff]/10 text-[#00f2ff]' : 'text-slate-400 hover:text-slate-200'}`}
                type="button"
              >
                1. Registry (.reg)
              </button>
              <button
                onClick={() => setHelperTab('shell_bat')}
                className={`flex-1 py-1.5 text-center transition-colors uppercase font-bold rounded ${helperTab === 'shell_bat' ? 'bg-[#00f2ff]/10 text-[#00f2ff]' : 'text-slate-400 hover:text-slate-200'}`}
                type="button"
              >
                2. Shell Cmd (.bat)
              </button>
              <button
                onClick={() => setHelperTab('csharp_wpf')}
                className={`flex-1 py-1.5 text-center transition-colors uppercase font-bold rounded ${helperTab === 'csharp_wpf' ? 'bg-[#00f2ff]/10 text-[#00f2ff]' : 'text-slate-400 hover:text-slate-200'}`}
                type="button"
              >
                3. WPF Code (.cs)
              </button>
            </div>

            {/* Interactive copyable script code container */}
            <div className="bg-black/60 p-3 rounded-lg border border-white/5 relative">
              
              <button
                onClick={() => handleCopyToClipboard(
                  helperTab === 'kiosk_reg' ? registryScript : helperTab === 'shell_bat' ? shellCommandScript : csharpCodeSnippet
                )}
                className="absolute top-2.5 right-2.5 bg-slate-900 hover:bg-[#00f2ff]/10 text-[#00f2ff] border border-cyan-500/20 p-1.5 rounded transition duration-150 flex items-center justify-center"
                title="Copy Script Content"
                type="button"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <pre className="font-mono text-[9px] text-[#00f2ff]/90 max-h-[140px] overflow-y-auto whitespace-pre pr-6 select-all scrollbar-thin">
                {helperTab === 'kiosk_reg' && registryScript}
                {helperTab === 'shell_bat' && shellCommandScript}
                {helperTab === 'csharp_wpf' && csharpCodeSnippet}
              </pre>
            </div>

            {copySuccessMsg && (
              <div className="mt-2 text-right text-[10px] font-mono text-emerald-400 tracking-wide font-bold animate-pulse">
                ✓ {copySuccessMsg}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1. OVERRIDE OVERLAY DIALOG MODAL */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-neutral-950/85 z-50 flex items-center justify-center p-4 animate-fadeIn backdrop-blur-sm">
          <div className="bg-[#040819] border-2 border-purple-500/35 rounded-2xl p-5 max-w-md w-full shadow-[0_0_50px_rgba(168,85,247,0.15)] text-left space-y-4">
            
            <div className="flex justify-between items-center border-b border-purple-500/20 pb-3">
              <div className="flex items-center gap-1.5 font-orbitron font-bold">
                <HelpCircle className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-purple-200">SUPERVISOR BYPASS & GUEST SIGN-ON</span>
              </div>
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="text-zinc-500 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualOverrideKioskSubmit} className="space-y-3 font-mono text-xs">
              
              {/* Manual mode switcher */}
              <div className="grid grid-cols-2 bg-slate-950 border border-[#ffffff0a] rounded p-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setManualUserType('Student');
                    setManualStudentId('');
                  }}
                  className={`py-1 rounded font-bold uppercase transition ${manualUserType === 'Student' ? 'bg-purple-900/60 text-[#e9d5ff]' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Student (Forgot Phone)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualUserType('Guest Visitor');
                    setManualStudentId('');
                  }}
                  className={`py-1 rounded font-bold uppercase transition ${manualUserType === 'Guest Visitor' ? 'bg-purple-900/60 text-[#e9d5ff]' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Guest Visitor
                </button>
              </div>

              {/* If student type, render search bar & profile selectors */}
              {manualUserType === 'Student' ? (
                <div className="space-y-2 text-left">
                  <div className="space-y-1">
                    <label className="block text-[9.5px] uppercase text-zinc-400 font-bold">1. Search Student (Name or ID #):</label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search e.g. 15020 or Thrinadh"
                        value={manualSearchQuery}
                        onChange={(e) => setManualSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-purple-500/25 rounded px-2 py-1.5 pl-7 text-white focus:outline-none focus:border-purple-400 font-sans"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9.5px] uppercase text-zinc-400 font-bold">2. Select Matching Student Profile:</label>
                    <select
                      value={manualStudentId}
                      onChange={(e) => setManualStudentId(e.target.value)}
                      className="w-full bg-slate-950 border border-purple-500/25 rounded p-1.5 text-white focus:outline-none focus:border-purple-400 font-sans text-xs"
                    >
                      <option value="">-- Choose Student Profile --</option>
                      {db.getUsers()
                        .filter(u => u.role === 'Student')
                        .filter(u => {
                          const q = manualSearchQuery.toLowerCase();
                          return u.fullName.toLowerCase().includes(q) || u.idNumber.toLowerCase().includes(q);
                        })
                        .map(u => (
                          <option key={u.idNumber} value={u.idNumber}>
                            {u.idNumber} - {u.fullName}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-left">
                  <div>
                    <label className="block text-[9.5px] font-mono uppercase text-zinc-400 mb-0.5">Guest Full Name:</label>
                    <input
                      type="text"
                      placeholder="e.g. Inspector Satyanarayana"
                      required
                      value={manualGuestName}
                      onChange={(e) => setManualGuestName(e.target.value)}
                      className="w-full bg-slate-950 border border-purple-500/25 rounded px-2.5 py-1 text-xs text-white uppercase focus:outline-none focus:border-purple-400 font-sans"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9.5px] font-mono uppercase text-zinc-400 mb-0.5">Contact mobile:</label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 94943"
                        required
                        value={manualGuestMobile}
                        onChange={(e) => setManualGuestMobile(e.target.value)}
                        className="w-full bg-slate-950 border border-purple-500/25 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-400 font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[9.5px] font-mono uppercase text-zinc-400 mb-0.5">Visit purpose:</label>
                      <input
                        type="text"
                        placeholder="e.g. Audit check"
                        value={manualGuestPurpose}
                        onChange={(e) => setManualGuestPurpose(e.target.value)}
                        className="w-full bg-slate-950 border border-purple-500/25 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-400 font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* supervisor validation */}
              <div className="bg-purple-950/25 border border-purple-500/25 rounded-xl p-3 space-y-2 text-left">
                <div className="text-[9.5px] text-purple-300 font-mono font-black uppercase tracking-wide flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-purple-400" /> Supervisor Witness Authority
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8.5px] text-zinc-400">Staff selection:</label>
                    <select
                      value={manualStaffId}
                      onChange={(e) => setManualStaffId(e.target.value)}
                      className="w-full bg-slate-950 border border-purple-500/20 rounded p-1 text-white text-[11px] focus:outline-none"
                    >
                      <option value="">-- Choose Instructor --</option>
                      {db.getUsers().filter(u => u.role === 'Staff').map(u => (
                        <option key={u.idNumber} value={u.idNumber}>{u.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8.5px] text-zinc-400">Staff PIN Passcode:</label>
                    <input
                      type="password"
                      placeholder="e.g. password123"
                      value={manualStaffPin}
                      onChange={(e) => setManualStaffPin(e.target.value)}
                      className="w-full bg-slate-950 border border-purple-500/20 rounded p-1 text-white text-[11px] tracking-widest focus:outline-none animate-pulse"
                    />
                  </div>
                </div>
              </div>

              {manualErrorMsg && (
                <div className="text-red-400 font-bold bg-red-950/40 border border-red-500/30 p-2 rounded text-[10.5px] text-left">
                  🚨 {manualErrorMsg}
                </div>
              )}

              {manualSuccessMsg && (
                <div className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/35 p-2 rounded text-[10.5px] animate-pulse text-left">
                  ✓ {manualSuccessMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
              >
                Sign Bypass Autograph & Unlock PC
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. SOS EMERGENCY TRIGGER CONSOLE DIALOG */}
      {showPanicModal && (
        <div className="fixed inset-0 bg-[#110101]/90 z-50 flex items-center justify-center p-4 animate-fadeIn backdrop-blur-sm">
          <div className="bg-[#050000] border-2 border-red-500/40 rounded-2xl p-5 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.2)] text-left space-y-4">
            
            <div className="flex justify-between items-center border-b border-red-500/25 pb-3">
              <div className="flex items-center gap-1.5 font-orbitron font-extrabold text-red-500 animate-pulse">
                <AlertOctagon className="w-5 h-5 text-red-500" />
                <span className="text-sm tracking-wide">CAMPUS SECURITY SENTRY DISPATCH</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPanicModal(false)}
                className="text-zinc-500 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 font-mono text-xs text-zinc-355 text-left">
              <p className="text-[10.5px] text-zinc-400 font-sans leading-normal">
                Trigger immediate medical, hazardous, or distress response. Live telemetry feeds will be broadcast immediately onto the Telegram security desk with GPS coordinates.
              </p>

              {/* Sentry Category Dialers */}
              <div className="grid grid-cols-2 bg-zinc-950 border border-zinc-900 rounded p-1 gap-1 text-center">
                <button
                  type="button"
                  onClick={() => setPanicSelectedCategory('GENERAL')}
                  className={`py-2 rounded font-bold uppercase transition flex items-center justify-center gap-1 text-[10px] ${
                    panicSelectedCategory === 'GENERAL' 
                      ? 'bg-zinc-850 text-white border border-zinc-750' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" /> General Hazard
                </button>
                <button
                  type="button"
                  onClick={() => setPanicSelectedCategory('FEMALE_EXTREME')}
                  className={`py-2 rounded font-black uppercase transition flex items-center justify-center gap-1 text-[10px] ${
                    panicSelectedCategory === 'FEMALE_EXTREME' 
                      ? 'bg-red-950/80 text-[#ff7171] border-2 border-red-500 animate-pulse' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <X className="w-4 h-4 text-rose-500 animate-spin" /> Extreme Female SOS
                </button>
              </div>

              {/* Emergency custom description text */}
              <div className="space-y-1 font-sans">
                <label className="block text-[9px] uppercase font-bold text-zinc-500 font-mono">Reporter Occupant Name (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Divasree M. (Guest) / Default: Workstation logged user"
                  value={panicReporterName}
                  onChange={(e) => setPanicReporterName(e.target.value)}
                  className="w-full bg-zinc-950 border border-red-500/20 text-white placeholder-zinc-700 rounded p-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1 font-sans">
                <label className="block text-[9px] uppercase font-bold text-zinc-500 font-mono">Describe situation of distress (Optional):</label>
                <textarea
                  placeholder={
                    panicSelectedCategory === 'FEMALE_EXTREME' 
                      ? "Describe any stalking, unsafe physical corridor conditions, or emergency..." 
                      : "Describe physical injury, cable sparking, power failure emergency..."
                  }
                  value={panicMessageText}
                  onChange={(e) => setPanicMessageText(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-950 border border-red-500/20 text-white placeholder-zinc-700 rounded p-1.5 text-xs focus:outline-none"
                />
              </div>

              {panicSelectedCategory === 'FEMALE_EXTREME' && (
                <div className="text-[10px] text-rose-400 font-semibold p-2.5 bg-rose-950/20 border border-rose-500/30 rounded-xl font-sans leading-normal">
                  ⚠️ <b>FEMALE EXTREME HIGH-PRIORITY ACTION ENGAGED:</b> This invokes strict legal action protocols under UGC Sentry, triggers localized physical alarms, activates audible sirens, and dispatches police/safety personnel.
                </div>
              )}

              <div className="flex gap-2 font-sans mt-2">
                <button
                  type="button"
                  onClick={() => setShowPanicModal(false)}
                  className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold uppercase rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRaiseKioskPanic(panicSelectedCategory)}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase rounded-xl transition shadow-md shadow-red-600/20 cursor-pointer animate-pulse"
                >
                  CONFIRM DISPATCH SOS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
