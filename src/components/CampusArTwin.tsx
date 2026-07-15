import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Cpu, 
  AlertTriangle, 
  Eye, 
  Check, 
  Thermometer, 
  Compass, 
  Activity, 
  Info, 
  CornerDownRight, 
  HelpCircle,
  Home,
  User as UserIcon,
  ShieldCheck,
  Video,
  VideoOff,
  Maximize2,
  RefreshCw,
  QrCode,
  Layers,
  Search,
  Lock,
  Wifi,
  Sliders,
  Smartphone,
  Zap,
  BookOpen
} from 'lucide-react';
import { ClientDatabase } from '../remoteDb';
import { User } from '../types';

interface CampusArTwinProps {
  db: ClientDatabase;
}

// 3D Absolute coordinate mapping for Lab-B space (relative to central cameras)
const wsCoordinates: Record<string, { x: number; y: number; z: number }> = (() => {
  const coords: Record<string, { x: number; y: number; z: number }> = {};
  for (let i = 1; i <= 50; i++) {
    const wsId = `CS-${i.toString().padStart(2, '0')}`;
    const r = Math.floor((i - 1) / 6); // row Index
    const c = (i - 1) % 6;            // col Index
    coords[wsId] = {
      x: -3.5 + c * 1.4,
      y: r % 2 === 0 ? -0.2 : -0.5,
      z: 4.0 + r * 1.5
    };
  }
  return coords;
})();

export const CampusArTwin: React.FC<CampusArTwinProps> = ({ db }) => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [selectedWS, setSelectedWS] = useState<string>('CS-14');
  const [escapeRouteFrom, setEscapeRouteFrom] = useState<string>('CS-14');
  
  // AR View Core variables
  const [arMode, setArMode] = useState<'hud' | 'scanner' | 'arjs' | 'hod'>('hud');
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // 3D Panning simulation values (for compass and perspective skewing)
  const [yaw, setYaw] = useState<number>(0); 
  const [pitch, setPitch] = useState<number>(0);
  const [roll, setRoll] = useState<number>(0);
  const [isGyroActive, setIsGyroActive] = useState<boolean>(false);
  const [focalLength, setFocalLength] = useState<number>(450); // virtual camera focal length zoom

  const viewContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0, yaw: 0, pitch: 0 });

  // Mode 2: ID Scanner states
  const [scanningTargetId, setScanningTargetId] = useState<number>(0);
  const [isAiScanning, setIsAiScanning] = useState<boolean>(false);
  const [aiScanProgress, setAiScanProgress] = useState<number>(0);
  const [scannedResultUser, setScannedResultUser] = useState<User | null>(null);
  const [scanStateText, setScanStateText] = useState<string>('READY FOR ID MARKER DETECTION');

  // Mode 3: AR.js A-Frame dynamic sandbox playground variables
  const [arjsMesh, setArjsMesh] = useState<string>('cube');
  const [arjsColor, setArjsColor] = useState<string>('#00f2ff');
  const [arjsSpeed, setArjsSpeed] = useState<number>(2);
  const [arjsShowLabel, setArjsShowLabel] = useState<boolean>(true);
  const [arjsIframeSrc, setArjsIframeSrc] = useState<string>('');
  const [arjsMarkerRotated, setArjsMarkerRotated] = useState<number>(0);

  // HOD cabin status state (coorindated with global settings)
  const [hodCabinStatus, setHodCabinStatus] = useState<'available' | 'rounds' | 'off-campus'>('available');

  const workstations = Array.from({ length: 50 }, (_, idx) => {
    const idNum = idx + 1;
    const idStr = `CS-${idNum.toString().padStart(2, '0')}`;
    const row = Math.floor(idx / 6) + 1;
    const col = (idx % 6) + 1;
    
    // Distribute active/offline/intercepted status elegantly
    let status = 'active';
    if ([4, 12, 21, 35, 48].includes(idNum)) {
      status = 'offline';
    } else if ([9, 27, 42].includes(idNum)) {
      status = 'intercepted';
    }

    // Assign users from the db
    const user = users[idx % users.length] || null;

    // Distribute temperature
    let temp = 37 + (idNum % 6);
    if (status === 'intercepted') temp = 65 + (idNum % 10);
    if (status === 'offline') temp = 20 + (idNum % 3);

    // Read workstation MAC address directly from database (mapped on first run)
    const dbStation = db.getStation(idStr);
    const mac = dbStation?.pcMacAddress || 'Pending First Run';

    return { id: idStr, row, col, status, user, temp, mac };
  });

  const currentWS = workstations.find(w => w.id === selectedWS) || workstations[0];

  // Gyroscope connection hook
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null && e.beta !== null && e.gamma !== null) {
        setYaw(Math.round(e.alpha));
        setPitch(Math.round(e.beta - 95)); // Horizontal calibration offset
        setRoll(Math.round(e.gamma));
        setIsGyroActive(true);
      }
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // Web camera activation controller
  useEffect(() => {
    if (cameraActive) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(mdStream => {
          setStream(mdStream);
          setCameraError(null);
          if (videoRef.current) {
            videoRef.current.srcObject = mdStream;
          }
        })
        .catch(err => {
          console.warn("Camera hardware is missing or blocked.", err);
          setCameraError("Webcam feed was blocked or is unavailable. Switched to virtual telemetry mode.");
          setCameraActive(false);
        });
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive]);

  // Handle Drag-to-Look in virtual 3D canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if (arMode === 'arjs') return; // Let frame handle it
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      yaw: yaw,
      pitch: pitch
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      setYaw((dragStart.current.yaw - dx * 0.45 + 360) % 360);
      setPitch(Math.max(-55, Math.min(55, dragStart.current.pitch + dy * 0.35)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Mathematical 3D-to-2D Perspective coordinate projection calculation
  const projectCoordinates = (x: number, y: number, z: number) => {
    const widthVal = 640;
    const heightVal = 360;
    const cx = widthVal / 2;
    const cy = heightVal / 2;

    const yawRad = (yaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;
    const rollRad = (roll * Math.PI) / 180;

    // Apply Yaw (Translation around Y vertical axis)
    const x1 = x * Math.cos(yawRad) - z * Math.sin(yawRad);
    const z1 = x * Math.sin(yawRad) + z * Math.cos(yawRad);

    // Apply Pitch (Translation around X pitch axis)
    const y1 = y * Math.cos(pitchRad) - z1 * Math.sin(pitchRad);
    const z2 = y * Math.sin(pitchRad) + z1 * Math.cos(pitchRad);

    // Apply Roll (Translation around Z roll axis)
    const x2 = x1 * Math.cos(rollRad) - y1 * Math.sin(rollRad);
    const y2 = x1 * Math.sin(rollRad) + y1 * Math.cos(rollRad);

    const projectedX = cx + (x2 / z2) * focalLength;
    const projectedY = cy - (y2 / z2) * focalLength;

    return {
      xPercent: (projectedX / widthVal) * 100,
      yPercent: (projectedY / heightVal) * 100,
      scale: Math.max(0.2, Math.min(2.0, 4.0 / z2)),
      visible: z2 > 0.45 && projectedX >= -100 && projectedX <= widthVal + 100 && projectedY >= -100 && projectedY <= heightVal + 100,
      depth: z2
    };
  };

  // Compile Dynamic AR.js srcDoc to feed into the sandboxed <iframe>
  useEffect(() => {
    if (arMode === 'arjs') {
      const srcDocContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>C-Sync Live AR.js Sandbox</title>
            <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
            <script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
            <style>
              body { margin: 0; overflow: hidden; background-color: #020617; }
              #telemetry-bar {
                position: absolute; top: 8px; left: 8px; right: 8px;
                background: rgba(4, 9, 29, 0.9); border: 1px solid rgba(0, 242, 255, 0.25);
                border-radius: 6px; padding: 6px 12px; font-family: monospace; color: #00f2ff;
                font-size: 9px; display: flex; justify-content: space-between; z-index: 100;
                box-shadow: 0 4px 15px rgba(0,0,0,0.5);
              }
              #marker-msg {
                position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
                background: rgba(220, 38, 38, 0.85); color: white; padding: 4px 12px;
                font-size: 8px; font-weight: bold; font-family: monospace; border-radius: 4px;
                white-space: nowrap; z-index: 100; text-transform: uppercase; letter-spacing: 0.5px;
                animation: pulse 1.5s infinite;
              }
              @keyframes pulse {
                0% { opacity: 0.6; }
                50% { opacity: 1.0; }
                100% { opacity: 0.6; }
              }
            </style>
          </head>
          <body>
            <div id="telemetry-bar">
              <span>🛰️ AR.JS ENGINE 1.2.0 LIVE</span>
              <span>MESH: ${arjsMesh.toUpperCase()}</span>
            </div>
            <div id="marker-msg">🎯 Point camera at Hiro Marker card on console side!</div>

            <a-scene embedded arjs="sourceType: webcam; debugUIEnabled: false;" vr-mode-ui="enabled: false">
              <a-marker preset="hiro">
                <!-- Geometry selected by user -->
                ${
                  arjsMesh === 'cube' ? `<a-box position="0 0.5 0" scale="0.8 0.8 0.8" material="color: ${arjsColor}; roughness: 0.2; metalness: 0.5; opacity: 0.9;" animation="property: rotation; to: 360 360 0; loop: true; dur: ${8000 / arjsSpeed}"></a-box>` :
                  arjsMesh === 'torus' ? `<a-torus radius="0.4" radius-tubular="0.09" position="0 0.5 0" material="color: ${arjsColor}; opacity: 0.9;" animation="property: rotation; to: 0 360 360; loop: true; dur: ${8000 / arjsSpeed}"></a-torus>` :
                  arjsMesh === 'cylinder' ? `<a-cylinder position="0 0.5 0" radius="0.32" height="0.8" material="color: ${arjsColor}; opacity: 0.9;" animation="property: rotation; to: 360 0 360; loop: true; dur: ${8000 / arjsSpeed}"></a-cylinder>` :
                  `<a-cone position="0 0.5 0" radius-bottom="0.45" height="0.9" material="color: ${arjsColor}; opacity: 0.9;" animation="property: rotation; to: 0 360 0; loop: true; dur: ${8000 / arjsSpeed}"></a-cone>`
                }

                <!-- High tech light ring underneath -->
                <a-ring color="#00f2ff" radius-inner="0.6" radius-outer="0.65" rotation="-90 0 0" position="0 0.05 0"></a-ring>

                <!-- Floating text tag label in space -->
                ${arjsShowLabel ? `<a-text value="C-SYNC PROXIMITY" color="#ffffff" align="center" position="0 1.2 0" scale="0.7 0.7 0.7" width="4.5" font="monoid"></a-text>` : ''}
              </a-marker>
              
              <a-entity camera></a-camera>
            </a-scene>
          </body>
        </html>
      `;
      setArjsIframeSrc(srcDocContent);
    }
  }, [arMode, arjsMesh, arjsColor, arjsSpeed, arjsShowLabel]);

  // Mode 2: Simulated computer vision neural-layer tag scan
  const triggerSimulatedIdScan = () => {
    if (scanningTargetId === 0) return;
    setIsAiScanning(true);
    setAiScanProgress(0);
    setScannedResultUser(null);
    setScanStateText('SEARCHING FOR HIGH-CONTRAST QR BOUNDING BOX...');
    
    const matchedUser = users.find(u => u.id === Number(scanningTargetId)) || null;

    const interval = setInterval(() => {
      setAiScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAiScanning(false);
          setScannedResultUser(matchedUser);
          setScanStateText('SCAN COMPLETE • BIOMETRICS RECORD RECOVERED');
          db.addLog('SECURITY', `AR Camera Tag Scanner verified credential ID of student "${matchedUser?.fullName}" successfully.`, 'success');
          return 100;
        }
        
        // Progress stage text updates
        if (prev === 25) setScanStateText('NEURAL PATTERN ALIGNMENT LOCK ON TARGET...');
        if (prev === 55) setScanStateText('DECRYPTING GDC CERTIFICATE ENVELOPE...');
        if (prev === 75) setScanStateText('COMPILING BIOMETRICAL LANDMARKS AND STREAK INDEX...');
        
        return prev + 5;
      });
    }, 120);
  };

  const currentScannedUser = scannedResultUser;

  // Escape route calculator
  const getSimEscapeRoute = (wsId: string) => {
    if (!wsId) return [];
    const idNum = parseInt(wsId.replace('CS-', '').replace('WS-', ''));
    if (isNaN(idNum)) return [];

    const steps = [
      `Lock terminal hardware safety bolt on workstation workstation node ${wsId}.`,
      `Walk along yellow floor induction vectors to row ${idNum > 24 ? 'B corridor alignment' : 'A corridor alignment'}.`,
    ];

    if (idNum % 6 <= 3) {
      steps.push("Step WESTWARD past Lab-B centralized mainframe grid switcher.");
      steps.push("Exit immediately through high-durability Emergency Exit Door #01 (West Wing exit terminal).");
    } else {
      steps.push("Step EASTWARD past HOD executive administrative suite cabin division.");
      steps.push("Exit immediately through high-durability Emergency Exit Door #02 (East Wing exit terminal).");
    }

    return steps;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left text-xs font-mono">
      
      {/* LEFT ASPECT COLS-8: INTERACTIVE MULTI-MODE DECK CAMERA PORT */}
      <div className="lg:col-span-8 flex flex-col space-y-4">
        
        {/* TOP STATUS HUB AND SELECTOR TABS */}
        <div className="bg-[#0b1329]/80 border border-cyan-500/15 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-rose-400 block uppercase tracking-widest flex items-center gap-1.5 font-orbitron">
              <Zap className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              Sovereign Space WebAR Controller (AR.js Core Engine)
            </span>
            <div className="flex flex-wrap gap-2 text-[9px] text-zinc-400">
              <span className="bg-slate-950 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                Pitch: <strong className="text-white">{pitch}°</strong>
              </span>
              <span className="bg-slate-950 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                Yaw: <strong className="text-white">{yaw}°</strong>
              </span>
              <span className="bg-slate-950 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                Focal: <strong className="text-emerald-400">{focalLength}x</strong>
              </span>
              <span className="bg-slate-950 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                Gyroscope: <strong className={isGyroActive ? "text-emerald-400" : "text-amber-500"}>
                  {isGyroActive ? "NATIVE SENSOR" : "COMPASS MOUSE SWIPE"}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex gap-1.5 shrink-0 self-stretch md:self-auto overflow-x-auto">
            <button
              onClick={() => { setArMode('hud'); }}
              className={`px-3 py-1.5 rounded-lg border text-[9.5px] font-black uppercase transition-all cursor-pointer ${
                arMode === 'hud'
                  ? 'bg-cyan-955/40 text-cyan-400 border-cyan-500/40 shadow'
                  : 'bg-slate-950 text-slate-500 border-zinc-900 hover:text-slate-300'
              }`}
            >
              🛰️ Space HUD
            </button>
            <button
              onClick={() => { setArMode('scanner'); }}
              className={`px-3 py-1.5 rounded-lg border text-[9.5px] font-black uppercase transition-all cursor-pointer ${
                arMode === 'scanner'
                  ? 'bg-pink-955/40 text-pink-400 border-pink-500/40 shadow'
                  : 'bg-slate-950 text-slate-500 border-zinc-900 hover:text-slate-300'
              }`}
            >
              💳 ID Scanner
            </button>
            <button
              onClick={() => { setArMode('arjs'); }}
              className={`px-3 py-1.5 rounded-lg border text-[9.5px] font-black uppercase transition-all cursor-pointer ${
                arMode === 'arjs'
                  ? 'bg-purple-955/40 text-purple-400 border-purple-500/40 shadow'
                  : 'bg-slate-950 text-slate-500 border-zinc-900 hover:text-slate-300'
              }`}
            >
              🍩 AR.js Compiler
            </button>
            <button
              onClick={() => { setArMode('hod'); }}
              className={`px-3 py-1.5 rounded-lg border text-[9.5px] font-black uppercase transition-all cursor-pointer ${
                arMode === 'hod'
                  ? 'bg-amber-955/40 text-amber-400 border-amber-500/40 shadow'
                  : 'bg-slate-950 text-slate-500 border-zinc-900 hover:text-slate-300'
              }`}
            >
              👩‍🏫 HOD Beacon
            </button>
          </div>
        </div>

        {/* VIEW LENS RETICLE CONTAINER SCREEN */}
        <div 
          ref={viewContainerRef}
          onMouseDown={handleMouseDown}
          className="relative aspect-video w-full bg-[#020613] border border-cyan-500/20 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none shadow-2xl"
        >
          {cameraActive && !cameraError ? (
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover opacity-60 z-0 pointer-events-none"
            />
          ) : (
            // Holographic Blueprint Spatial background wireframe on camera fallback
            <div className="absolute inset-0 bg-[#020818]/90 z-0 flex items-center justify-center pointer-events-none">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f2ff0d_1px,transparent_1px),linear-gradient(to_bottom,#00f2ff0d_1px,transparent_1px)] bg-[size:30px_30px]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#01030d_95%)]" />
              <div className="w-[85vw] h-[85vw] max-w-[400px] max-h-[400px] rounded-full border border-dashed border-[#00f2ff]/10 animate-spin" style={{ animationDuration: '60s' }} />
              <div className="absolute w-[60vw] h-[60vw] max-w-[280px] max-h-[280px] rounded-full border border-cyan-500/5 animate-reverseSpin" style={{ animationDuration: '30s' }} />
            </div>
          )}

          {/* DYNAMIC HUD INSTRUMENT VIRTUAL RETICLE GRID SYSTEM */}
          {arMode !== 'arjs' && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              {/* Compass Ring */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 text-zinc-400 bg-slate-950/80 px-2.5 py-1 rounded-md border border-white/5 shadow-md">
                <Compass className="w-3.5 h-3.5 text-[#00f2ff] animate-spin" style={{ animationDuration: '10s' }} />
                <span>HEADING: <strong>{yaw}° N</strong></span>
              </div>

              {/* Central crosshair aim */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400/30 flex items-center justify-center">
                <div className="w-16 h-16 border border-[#00f2ff]/25 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
                <div className="absolute w-8 h-8 border-t border-b border-[#00f2ff]/50" />
                <div className="absolute w-8 h-8 border-l border-r border-[#00f2ff]/50" />
                <div className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              </div>

              {/* Left Pitch/Angle ladder indicators */}
              <div className="absolute left-6 top-1/4 bottom-1/4 w-8 border-l border-white/10 flex flex-col justify-between text-[7.5px] text-zinc-500 py-2">
                <span className="flex items-center gap-1">— +45° <span className={pitch > 30 ? "text-rose-400 animate-pulse font-bold" : ""}>▲</span></span>
                <span className="flex items-center gap-1">— +00°</span>
                <span className="flex items-center gap-1">— -45° <span className={pitch < -30 ? "text-rose-400 animate-pulse font-bold" : ""}>▼</span></span>
              </div>

              {/* Bottom Telemetry HUD Feed bar */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#030a1c]/90 border border-white/5 rounded-xl p-2 px-3 flex justify-between items-center text-[7.5px]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-400 uppercase font-black">CAMERA TELEMETRY ACTIVE</span>
                  </div>
                  <span className="text-zinc-500">FORMAT: <strong className="text-slate-300">YUV420 VECTOR BUFFER</strong></span>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCameraActive(!cameraActive);
                    }}
                    className="px-2 py-0.5 bg-slate-900 border border-white/10 text-slate-300 rounded hover:text-white pointer-events-auto cursor-pointer flex items-center gap-1"
                  >
                    {cameraActive ? <VideoOff className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                    {cameraActive ? "Kill Camera" : "Feed Webcam"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 1 OVERLAYS: REAL-TIME SPATIAL CYBER SENTRY HUD ANCHORS */}
          {arMode === 'hud' && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              {Object.entries(wsCoordinates).map(([wsId, coord]) => {
                const projection = projectCoordinates(coord.x, coord.y, coord.z);
                if (!projection.visible) return null;

                const wsData = workstations.find(w => w.id === wsId);
                const isSelected = selectedWS === wsId;
                const progressBorder = wsData?.status === 'intercepted' ? 'border-rose-500 shadow-[0_0_12px_#ef4444]' :
                                        wsData?.status === 'offline' ? 'border-slate-800' :
                                        'border-cyan-500/70 shadow-[0_0_10px_rgba(0,186,180,0.15)]';

                return (
                  <div
                    key={wsId}
                    style={{
                      position: 'absolute',
                      left: `${projection.xPercent}%`,
                      top: `${projection.yPercent}%`,
                      transform: `translate(-50%, -50%) scale(${projection.scale})`,
                      transition: isDragging ? 'none' : 'all 0.1s ease-out',
                      zIndex: Math.round(100 - projection.depth)
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWS(wsId);
                      setEscapeRouteFrom(wsId);
                    }}
                    className="pointer-events-auto cursor-pointer"
                  >
                    <div className={`p-2.5 rounded-xl border-2 bg-slate-950/90 text-left min-w-[110px] space-y-1.5 transition-all relative ${
                      isSelected ? 'ring-2 ring-emerald-400 bg-slate-900 scale-102 border-emerald-400' : progressBorder
                    }`}>
                      <div className="flex justify-between items-center text-[8.5px] font-black border-b border-white/5 pb-1 gap-1">
                        <span className={isSelected ? 'text-emerald-400' : wsData?.status === 'intercepted' ? 'text-rose-400 font-bold' : 'text-cyan-400'}>
                          {wsId}
                        </span>
                        <span className="text-[7px] text-zinc-500 font-normal">{(projection.depth).toFixed(1)}m</span>
                      </div>

                      <div className="text-[7.5px] leading-tight space-y-0.5">
                        <div className="text-zinc-500 truncate uppercase">
                          User: <strong className="text-white">{wsData?.user ? wsData.user.fullName.split(' ')[0] : 'VACANT'}</strong>
                        </div>
                        <div className="text-zinc-500 uppercase flex items-center justify-between">
                          <span>Temp:</span> 
                          <span className={`${wsData && wsData.temp > 50 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                            {wsData?.temp}°C
                          </span>
                        </div>
                      </div>

                      {/* Direction arrow indication */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 border-r border-b border-white/10 rotate-45" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 2 OVERLAYS: AI BIOMETRICS DIGITAL ID CODE SCANNER OVERLAY */}
          {arMode === 'scanner' && (
            <div className="absolute inset-0 z-20 bg-cover">
              
              {/* Scan Finder border box overlay */}
              <div className="absolute inset-x-1/4 top-1/6 bottom-1/5 border-2 border-dashed border-pink-500 bg-pink-500/5 rounded-2xl flex flex-col justify-between p-4 relative z-10">
                <div className="absolute -inset-1 border border-pink-500 rounded-3xl animate-pulse pointer-events-none" />
                
                {/* Visual Scanning Line laser effect */}
                <div className={`absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-[0_0_8px_#ec4899] pointer-events-none ${
                  isAiScanning ? 'animate-scannerLaser duration-1000' : 'top-1/2'
                }`} />

                <div className="flex justify-between">
                  <div className="w-5 h-5 border-l-4 border-t-4 border-pink-400 -mt-2 -ml-2 rounded-tl-md" />
                  <div className="w-5 h-5 border-r-4 border-t-4 border-pink-400 -mt-2 -mr-2 rounded-tr-md" />
                </div>

                {/* Tracking Code Overlay */}
                <div className="text-center space-y-2 select-none">
                  <span className="text-[10px] font-bold text-pink-400 block tracking-wider font-orbitron">{scanStateText}</span>
                  {isAiScanning && (
                    <div className="space-y-1 w-full max-w-[200px] mx-auto font-mono">
                      <div className="h-1 bg-slate-950 border border-white/5 rounded-full overflow-hidden w-full">
                        <div className="h-full bg-pink-500 duration-150 transition-all" style={{ width: `${aiScanProgress}%` }} />
                      </div>
                      <span className="text-[7.5px] text-pink-300 font-bold block">CIPHER COILS BUFFER: {aiScanProgress}%</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <div className="w-5 h-5 border-l-4 border-b-4 border-pink-400 -mb-2 -ml-2 rounded-bl-md" />
                  <div className="w-5 h-5 border-r-4 border-b-4 border-pink-400 -mb-2 -mr-2 rounded-br-md" />
                </div>
              </div>

              {/* FLOATING AR PROFILE LOCK ON CARD WINDOW OVERLAP */}
              {currentScannedUser && (
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#04081ae0] border-2 border-emerald-400 rounded-2xl p-4 flex gap-4 max-w-[340px] z-30 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-fadeIn select-none">
                  
                  <div className="relative shrink-0">
                    <img src={currentScannedUser.photoBlob} alt="" className="w-16 h-16 rounded-xl object-cover border border-emerald-500/30" />
                    <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-slate-950 text-[6.5px] font-black rounded-full p-1 leading-none">
                      ✓ CLEAR
                    </span>
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1 text-left">
                    <div className="border-b border-white/5 pb-1">
                      <span className="bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 text-[6.5px] font-mono px-1.5 py-0.5 rounded uppercase font-black tracking-widest block w-max">
                        {currentScannedUser.role.toUpperCase()} VERIFIED
                      </span>
                      <h4 className="text-white text-[11.5px] font-black uppercase mt-1 truncate">{currentScannedUser.fullName}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[7.5px] text-zinc-400">
                      <div>ID: <strong className="text-white font-mono">{currentScannedUser.idNumber}</strong></div>
                      <div>STREAK: <strong className="text-[#00f2ff]">🔥 {currentScannedUser.localStreak} d</strong></div>
                      <div className="col-span-2 truncate">MAC: <span className="text-slate-300 font-mono">{currentScannedUser.deviceFingerprint || 'FP-NOT-ANCHORED'}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 3: REAL AR.JS EMBEDDED ENGINE SYSTEM */}
          {arMode === 'arjs' && (
            <div className="absolute inset-0 z-0">
              {arjsIframeSrc ? (
                <iframe 
                  srcDoc={arjsIframeSrc}
                  className="w-full h-full border-none z-0"
                  allow="camera; microphone; geolocation"
                  title="AR.js Sandbox Compiler"
                />
              ) : (
                <div className="absolute inset-0 bg-[#0c142c] flex items-center justify-center">
                  <span className="text-xs text-zinc-500 animate-pulse font-mono">LOADING AR.JS SCRIPTS IN FRAME...</span>
                </div>
              )}
            </div>
          )}

          {/* MODE 4: HOD DOORWAY OUTLINE AND CABIN AVAILABILITY STATUS Overlay */}
          {arMode === 'hod' && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              
              {/* Floating HOD Virtual Hologram beacon overlay */}
              {(() => {
                const projectionHOD = projectCoordinates(4.1, 0.2, 5.0); // mapped right by classroom door
                if (!projectionHOD.visible) return null;

                const colorTheme = hodCabinStatus === 'available' ? 'border-emerald-500 text-emerald-400 hover:shadow-[0_0_20px_#10b981]' :
                                   hodCabinStatus === 'rounds' ? 'border-amber-500 text-amber-400 hover:shadow-[0_0_20px_#f59e0b]' :
                                   'border-slate-600 text-slate-500';

                return (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${projectionHOD.xPercent}%`,
                      top: `${projectionHOD.yPercent}%`,
                      transform: `translate(-50%, -50%) scale(${projectionHOD.scale * 1.15})`,
                      transition: isDragging ? 'none' : 'all 0.1s ease-out'
                    }}
                    className="pointer-events-auto"
                  >
                    <div className={`p-3 rounded-2xl bg-slate-950/95 border-2 text-left min-w-[150px] space-y-2 shadow-2xl relative ${colorTheme}`}>
                      
                      <div className="border-b border-white/5 pb-1">
                        <span className="text-[7px] text-zinc-500 block uppercase font-mono">HOLOGRAPHIC CABIN BEACON</span>
                        <h4 className="text-white text-[10px] font-black uppercase flex items-center gap-1.5 mt-0.5">
                          <Home className="w-3.5 h-3.5 shrink-0" /> Cabin #21B (AU)
                        </h4>
                      </div>

                      <div className="space-y-1 text-[8px] font-mono leading-relaxed">
                        <div className="text-zinc-500 uppercase">HOD: <strong className="text-zinc-200">Dr. A. Siva Prasad</strong></div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`w-2 h-2 rounded-full ${
                            hodCabinStatus === 'available' ? 'bg-emerald-500 animate-ping' :
                            hodCabinStatus === 'rounds' ? 'bg-amber-500 animate-pulse' :
                            'bg-slate-600'
                          }`} />
                          <strong className="uppercase font-black">
                            {hodCabinStatus === 'available' && "IN CABIN - WORKING"}
                            {hodCabinStatus === 'rounds' && "ON ROUNDS (CLASS)"}
                            {hodCabinStatus === 'off-campus' && "OFF CAMPUS - SHUT"}
                          </strong>
                        </div>
                      </div>

                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 border-r border-b border-white/10 rotate-45" />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>

        {/* BOTTOM CONFIG DECK PANEL: DIFFERENT FOR EACH CHOSEN MODE */}
        <div className="bg-[#0b1226]/80 border border-cyan-500/10 rounded-2xl p-4 space-y-3.5 select-none text-left">
          
          {arMode === 'hud' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#00f2ff] uppercase block">Spatial Coordinates Pitch Controls</span>
                <p className="text-[8.5px] text-zinc-400 font-sans leading-relaxed">
                  Hold left mouse button inside the viewer reticle above and swipe around to rotate and scan the classroom. Use mobile accelerometer to tilt orientation natively.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                    <span>YAW AXIS SKEW:</span>
                    <span className="text-[#00f2ff] font-bold">{yaw}°</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="359" 
                    value={yaw} 
                    onChange={(e) => setYaw(Number(e.target.value))}
                    className="w-full accent-[#00f2ff]" 
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                    <span>PITCH VERTICAL:</span>
                    <span className="text-[#00f2ff] font-bold">{pitch}°</span>
                  </div>
                  <input 
                    type="range" 
                    min="-50" 
                    max="50" 
                    value={pitch} 
                    onChange={(e) => setPitch(Number(e.target.value))}
                    className="w-full accent-[#00f2ff]" 
                  />
                </div>
              </div>
            </div>
          )}

          {arMode === 'scanner' && (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
              <div className="space-y-1 max-w-sm">
                <span className="text-[10px] font-bold text-pink-400 uppercase block">Simulate Tag Visual Scanning Target</span>
                <p className="text-[8.5px] text-zinc-400 font-sans mt-0.5">
                  Select any virtual student profile in AU College directory checklist to simulate computer-vision marker anchoring and telemetry overlay in live camera focus.
                </p>
              </div>

              <div className="flex gap-2 self-stretch md:self-auto">
                <select
                  value={scanningTargetId}
                  onChange={(e) => setScanningTargetId(Number(e.target.value))}
                  className="bg-slate-950 border border-white/10 rounded-lg p-2 text-slate-100 text-[10px] font-mono focus:outline-none focus:border-pink-500/50 cursor-pointer min-w-[160px]"
                >
                  <option value="0">-- SELECT TARGET --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id} className="bg-[#0c1630]">
                      {u.fullName} ({u.role})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={triggerSimulatedIdScan}
                  disabled={scanningTargetId === 0 || isAiScanning}
                  className={`px-4 py-2 border rounded-xl font-mono text-[9px] uppercase font-black transition-all cursor-pointer ${
                    scanningTargetId === 0 || isAiScanning
                      ? 'bg-slate-900 border-white/5 text-zinc-600'
                      : 'bg-pink-955/50 hover:bg-pink-900 text-pink-400 border-pink-500/30'
                  }`}
                >
                  {isAiScanning ? ("⚡ Scanning Code...") : "🔍 Lock & Scan Tag"}
                </button>
              </div>
            </div>
          )}

          {arMode === 'arjs' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-left items-center">
              
              {/* Play parameters sliders */}
              <div className="space-y-1.5">
                <span className="text-[9.5px] font-bold text-purple-400 uppercase block tracking-wider">A-Frame Shape Geometry</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['cube', 'torus', 'cylinder', 'cone'] as const).map(shape => (
                    <button
                      key={shape}
                      onClick={() => setArjsMesh(shape)}
                      className={`py-1 text-[8px] font-bold uppercase rounded border cursor-pointer transition-all ${
                        arjsMesh === shape
                          ? 'bg-purple-950 border-purple-500/50 text-purple-300'
                          : 'bg-slate-950 border-transparent text-slate-400'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic rotation velocity */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] text-zinc-500">
                  <span>3D VECTOR SPIN SPEED:</span>
                  <span className="text-purple-400 font-bold">{arjsSpeed}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="6.0" 
                  step="0.5"
                  value={arjsSpeed} 
                  onChange={(e) => setArjsSpeed(Number(e.target.value))}
                  className="w-full accent-purple-400" 
                />
              </div>

              {/* Color spectrum values */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] text-zinc-500">
                  <span>NEON LASER GLOW EMISSION:</span>
                  <span className="font-bold uppercase" style={{ color: arjsColor }}>{arjsColor}</span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {['#00f2ff', '#ec4899', '#f59e0b', '#10b981', '#a855f7'].map(col => (
                    <button
                      key={col}
                      onClick={() => setArjsColor(col)}
                      className="h-3.5 rounded border border-white/5 transition-all cursor-pointer hover:scale-105"
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

            </div>
          )}

          {arMode === 'hod' && (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
              <div className="space-y-1 max-w-sm">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">HOD Cabin Attendance Status Hub</span>
                <p className="text-[8.5px] text-zinc-400 font-sans mt-0.5">
                  Update HOD presence biometrics on-the-fly. Floating WebGL spatial tags on classroom entryway coordinate with your select.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 self-stretch md:self-auto min-w-[280px]">
                <button
                  type="button"
                  onClick={() => setHodCabinStatus('available')}
                  className={`p-2 rounded-xl text-[9px] font-bold border transition-all text-center uppercase cursor-pointer ${
                    hodCabinStatus === 'available' 
                      ? 'bg-emerald-955/50 text-emerald-450 border-emerald-500/40' 
                      : 'bg-slate-950 text-slate-500 border-white/5 hover:text-slate-350'
                  }`}
                >
                  In Office
                </button>
                <button
                  type="button"
                  onClick={() => setHodCabinStatus('rounds')}
                  className={`p-2 rounded-xl text-[9px] font-bold border transition-all text-center uppercase cursor-pointer ${
                    hodCabinStatus === 'rounds' 
                      ? 'bg-amber-955/50 text-amber-450 border-amber-500/40' 
                      : 'bg-slate-950 text-slate-500 border-white/5 hover:text-slate-350'
                  }`}
                >
                  On Rounds
                </button>
                <button
                  type="button"
                  onClick={() => setHodCabinStatus('off-campus')}
                  className={`p-2 rounded-xl text-[9px] font-bold border transition-all text-center uppercase cursor-pointer ${
                    hodCabinStatus === 'off-campus' 
                      ? 'bg-slate-900 text-zinc-300 border-transparent' 
                      : 'bg-slate-950 text-slate-500 border-white/5 hover:text-slate-350'
                  }`}
                >
                  Closed
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* RIGHT SIDEBAR PANEL COLS-4: METRICS TWIN BOARD & SAFETY ESCAPE DESK */}
      <div className="lg:col-span-4 flex flex-col space-y-6">
        
        {arMode === 'arjs' ? (
          /* MODE 3 SPECIFIC RIGHT DECK: SCAN REFERENCE HIRO MARKER CARD GENERATOR */
          <div className="bg-[#0b1226]/80 border border-purple-500/15 rounded-2xl p-6 space-y-4 text-left animate-fadeIn">
            <div>
              <span className="text-[10px] font-bold text-purple-400 block uppercase tracking-wider font-orbitron">
                🎴 HIRO REFERENCE TARGET CARD
              </span>
              <p className="text-[9px] text-zinc-400 font-sans mt-0.5 leading-relaxed">
                Show this Hiro grid marker to your physical webcam! The embedded A-Frame sandbox will lock coordinates instantly and projection the dynamic rotating custom 3D mesh.
              </p>
            </div>

            <div className="relative flex flex-col items-center justify-center bg-white p-6 rounded-2xl border-4 border-purple-500/20 shadow-inner">
              <div 
                className="w-40 h-40 bg-white border-[14px] border-black p-4 flex items-center justify-center transition-all duration-300"
                style={{ transform: `rotate(${arjsMarkerRotated}deg)` }}
                title="Sovereign AR Hiro Marker Pattern"
              >
                {/* Visual Representation of standard Hiro marker glyph */}
                <div className="relative w-full h-full bg-black flex items-center justify-center font-sans">
                  {/* Hiro center signature geometry */}
                  <div className="w-1/2 h-1/2 bg-white flex items-center justify-center font-bold text-black text-[22px]">
                    H
                  </div>
                </div>
              </div>

              {/* Marker Helper indicators */}
              <div className="absolute top-2 right-2 text-[7px] font-mono text-zinc-500 bg-zinc-100 p-1 rounded leading-none">
                ANG: {arjsMarkerRotated}°
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[8px] font-mono font-bold pt-1">
              <button
                type="button"
                onClick={() => setArjsMarkerRotated(prev => (prev + 90) % 360)}
                className="py-1.5 bg-slate-950 border border-white/5 rounded-lg hover:bg-slate-900 text-purple-300 cursor-pointer text-center"
              >
                🔄 Flip Marker 90°
              </button>
              <a
                href="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/HIRO.jpg"
                target="_blank"
                rel="noreferrer"
                className="py-1.5 bg-slate-950 border border-white/5 rounded-lg hover:bg-slate-900 text-zinc-400 cursor-pointer text-center flex items-center justify-center gap-1"
              >
                📥 Printable JPG
              </a>
            </div>

            <div className="p-3 bg-purple-955/20 border border-purple-500/10 rounded-xl space-y-1.5 text-[10px] text-purple-300 leading-relaxed font-sans">
              <strong>💡 Compiler Testing Instructions:</strong> Use another smartphone or printout to open the Hiro Marker JPG above, then hold it inside your webcam lens view!
            </div>
          </div>
        ) : (
          /* WORKSTATION COORINDATION & PROFILE SPECS PANEL */
          <div className="bg-[#0b1226]/80 border border-cyan-500/10 rounded-2xl p-6 space-y-4 text-left animate-fadeIn">
            <h3 className="text-sm font-black text-[#00f2ff] font-orbitron uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-[#00f2ff]" />
              Physical Terminal Spec Inspector
            </h3>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center border-b border-cyan-500/5 pb-2">
                <span className="text-slate-500 uppercase text-[9px]">Local Workstation ID:</span>
                <span className="font-bold text-white text-[11px] font-mono">{currentWS.id}</span>
              </div>

              <div className="flex justify-between items-center border-b border-cyan-500/5 pb-2">
                <span className="text-slate-500 uppercase text-[9px]">System MAC Identifier:</span>
                <span className="text-slate-300 font-mono text-[9px]">{currentWS.mac}</span>
              </div>

              <div className="flex justify-between items-center border-b border-cyan-500/5 pb-2">
                <span className="text-slate-500 uppercase text-[9px]">Ambient Thermometer:</span>
                <span className={`font-bold flex items-center gap-1 font-mono text-[11px] ${currentWS.temp > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  <Thermometer className="w-3.5 h-3.5" />
                  {currentWS.temp}°C
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-cyan-500/10 pb-2.5">
                <span className="text-slate-500 uppercase text-[9px]">Active Sentry User:</span>
                {currentWS.user ? (
                  <span className="font-black text-[#00f2ff] uppercase text-[11px]">{currentWS.user.fullName}</span>
                ) : (
                  <span className="text-slate-500 uppercase font-black text-[9px]">VACANT (NONE)</span>
                )}
              </div>

              {currentWS.user && (
                <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/10 flex items-center gap-3 animate-fadeIn">
                  <img src={currentWS.user.photoBlob} className="w-10 h-10 rounded-lg object-cover border border-[#00f2ff]/20" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white uppercase text-[10.5px] truncate">{currentWS.user.fullName}</div>
                    <div className="text-[8.5px] text-[#00f2ff] uppercase tracking-wide mt-0.5">{currentWS.user.idNumber}</div>
                  </div>
                </div>
              )}

              <div className="border border-cyan-500/15 bg-[#070e1e] p-3 rounded-xl space-y-1.5 leading-relaxed text-slate-400 text-[10px]">
                <span className="text-[8px] font-black text-cyan-400 block uppercase font-orbitron">Hardware Diagnostic Log</span>
                {currentWS.status === 'intercepted' ? (
                  <p className="text-rose-400 font-bold flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    THERMAL EXCESS FLOW LEVEL IN HARDWARE PORT CORE V-8 SWITCH!
                  </p>
                ) : (
                  <p>
                    Workstation is in active calibration sync with AU-Sentry network servers. Standard check-in biometric indicators verify all green.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* METRICS TWIN BOARD OR EVACUATION GEN UNDERNEATH (PERSISTED DESIGN VALUE) */}
        <div className="bg-[#0b1226]/80 border border-cyan-500/10 rounded-2xl p-6 text-left space-y-3.5">
          <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wide flex items-center gap-2">
            <Compass className="w-4.5 h-4.5 animate-spin" style={{ animationDuration: '40s' }} />
            Autonomous Incident Evacuation Rescue routing
          </h4>
          <p className="text-[9.5px] text-zinc-400 font-sans leading-relaxed">
            Click on any workstation coordinate marker inside the Spatial HUD viewer, or lock focus to populate security exit pathways.
          </p>

          {escapeRouteFrom ? (
            <div className="bg-slate-950 p-4 border border-emerald-500/10 rounded-xl space-y-2.5 animate-fadeIn">
              <span className="text-[9.5px] font-bold font-mono text-emerald-400 uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 shrink-0" />
                ROUTE SEQUENCE FOR terminal node {escapeRouteFrom}
              </span>

              <div className="space-y-2 text-[10px] text-slate-300 leading-relaxed font-sans">
                {getSimEscapeRoute(escapeRouteFrom).map((step, sIdx) => (
                  <div key={sIdx} className="flex gap-2">
                    <CornerDownRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-white/5 bg-black/20 rounded-xl text-slate-500 text-xs flex flex-col items-center gap-2">
              <Info className="w-5 h-5 opacity-40" />
              Empty rescue route slot.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
