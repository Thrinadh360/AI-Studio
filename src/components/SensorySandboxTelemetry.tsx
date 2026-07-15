import React, { useState } from 'react';
import { 
  Compass, Sun, Zap, Activity, Wifi, CheckCircle 
} from 'lucide-react';
import { ClientDatabase } from '../remoteDb';
import { User } from '../types';
import { playVoice, playHaptic } from '../feedback';

interface SensorySandboxTelemetryProps {
  db: ClientDatabase;
  activeStudent: User;
  onRefreshAll: () => void;
}

export const SensorySandboxTelemetry: React.FC<SensorySandboxTelemetryProps> = ({ 
  db, 
  activeStudent, 
  onRefreshAll 
}) => {
  // Proximity link / handshake states
  const [pairingStatus, setPairingStatus] = useState<'idle' | 'scanning' | 'linking' | 'connected'>('idle');
  const [pairingProgress, setPairingProgress] = useState(0);
  const [lastPairedTerminal, setLastPairedTerminal] = useState<string>('');
  const [showNfcScanner, setShowNfcScanner] = useState(false);
  const [nfcOutput, setNfcOutput] = useState<string>('');
  
  // Real-time simulated hardware sliders
  const [luxSensor, setLuxSensor] = useState<number>(315); // Light intensity in Lux
  const [pitchSensor, setPitchSensor] = useState<number>(12); // Phone tilt parameters
  const [rollSensor, setRollSensor] = useState<number>(-5); // Roll parameters
  const [inductionField, setInductionField] = useState<number>(44); // Magnetic Field (uT)
  const [ultrasonicChirpState, setUltrasonicChirpState] = useState<boolean>(false);

  // Simulate local high-frequency ultrasonic wireless handshake
  const invokeD2DHandshake = () => {
    if (pairingStatus !== 'idle') return;

    playHaptic('heavy');
    setPairingStatus('scanning');
    setPairingProgress(0);
    playVoice("Initiating local quantum ultrasonic pairing beacon. Tuning device frequencies.");

    let pct = 0;
    const interval = setInterval(() => {
      pct += 10;
      setPairingProgress(pct);

      if (pct === 40) {
        setPairingStatus('linking');
        playVoice("Workstation detected within proximity limit. Negotiating credentials.");
      }

      if (pct >= 100) {
        clearInterval(interval);
        setPairingStatus('connected');
        setLastPairedTerminal('CS-34 Desktop Node');
        
        // Reward 15 energy / XP points to student for testing local mesh parameters
        if (activeStudent.xp !== undefined) {
          activeStudent.xp += 15;
          if (activeStudent.streak !== undefined) {
            activeStudent.streak = (activeStudent.streak || 0) + 1;
          }
        }
        
        playHaptic('success');
        playVoice("Handshake complete. Workstation CS thirty four unlocked and synchronized.");
        db.addLog('SYNC', `Device-to-Device (D2D): Authenticated wireless handshake with workstation terminal CS-34`, 'success');
        onRefreshAll();
      }
    }, 300);
  };

  // Simulate Virtual phone NFC / ID tag reader
  const scanVirtualNfcTag = () => {
    playHaptic('heavy');
    setShowNfcScanner(true);
    setNfcOutput('Listening for contactless student cards or lab door sensors...');
    playVoice("Contactless system sensor enabled. Position card near phone antenna.");

    setTimeout(() => {
      const results = [
        "NAND GATE UID: 0x98AF32 (Verified Ward: Kiran Kumar)",
        "WORKSTATION SECTOR ID: DEV-LAB-B-SEC",
        "TEACHING DESK BEACON PIN: 8529",
        "SECURE RECONCILIATION NODE ID: VIZAG-SENTRY-01"
      ];
      const selected = results[Math.floor(Math.random() * results.length)];
      setNfcOutput(`⚡ TAG DETECTED: ${selected}`);
      playHaptic('success');
      playVoice("RFID Tag parsed successfully.");
      db.addLog('SECURITY', `NFC Scan Triggered: Parsed local hardware token payload: ${selected}`, 'info');
      onRefreshAll();
    }, 2000);
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="border-t border-white/5 pt-4">
        <h3 className="text-[10px] font-black tracking-widest text-[#00f2ff] uppercase font-mono mb-3">
          ⚡ SENTRY PHYSICAL TELEMETRY INTERFACES
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* A. Left Side: Futuristic Sensory Sandbox */}
        <div className="lg:col-span-7 bg-[#050c18]/90 border border-white/5 p-4 rounded-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-[10px] font-bold text-emerald-400 font-sans uppercase tracking-widest flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              Real-Time Simulated Phone Sensors
            </span>
            <span className="text-[7.5px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/25 uppercase font-bold">
              Autonomous Mesh Active
            </span>
          </div>

          <p className="text-[9.5px] text-slate-300 leading-relaxed font-sans">
            Next-gen smart devices leverage passive physical ambient sensors to guarantee local security boundaries and spoof-free biometric verification:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Sensor unit 1: Ambient Light (Lux) */}
            <div className="bg-black/40 border border-white/5 p-3 rounded-lg space-y-1.5">
              <div className="flex justify-between items-center text-[9px] font-mono">
                <span className="text-slate-400 uppercase font-black flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Photodetector
                </span>
                <span className={`font-bold ${luxSensor < 100 ? 'text-rose-400' : 'text-emerald-400'}`}>{luxSensor} LUX</span>
              </div>
              
              <input 
                type="range" 
                min="10" 
                max="1000" 
                value={luxSensor} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLuxSensor(val);
                  if (val < 100 && Math.random() < 0.2) {
                    playVoice("Eco ambient light dropping. Activate workspace study LED lamps.");
                  }
                }}
                className="w-full accent-emerald-500 cursor-pointer h-1 rounded" 
              />
              
              <p className="text-[8px] text-slate-450 font-sans leading-tight">
                {luxSensor < 100 
                  ? "🔴 Low classroom illumination detected. Studies show a soft LED reading lamp boosts memory retention!" 
                  : "🟢 Optimal desk luminosity. Eye strain mitigation system active."}
              </p>
            </div>

            {/* Sensor unit 2: Gyroscope 3D Rotation with interactive bubble visualizer */}
            <div className="bg-black/40 border border-white/5 p-3 rounded-lg space-y-1.5">
              <span className="text-[9px] font-mono text-slate-400 uppercase font-black block text-left">
                Gyroscope Tilt Balanced
              </span>
              
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center text-[7.5px] font-mono">
                    <span className="text-slate-500 text-[6.5px]">PITCH:</span>
                    <span className="text-cyan-400 font-bold">{pitchSensor}°</span>
                  </div>
                  <input 
                    type="range" 
                    min="-45" 
                    max="45" 
                    value={pitchSensor} 
                    onChange={(e) => setPitchSensor(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer h-1 rounded" 
                  />
                  <div className="flex justify-between items-center text-[7.5px] font-mono">
                    <span className="text-slate-500 text-[6.5px]">ROLL:</span>
                    <span className="text-pink-400 font-bold">{rollSensor}°</span>
                  </div>
                  <input 
                    type="range" 
                    min="-45" 
                    max="45" 
                    value={rollSensor} 
                    onChange={(e) => setRollSensor(Number(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer h-1 rounded" 
                  />
                </div>

                {/* 3D bubble-level visualizer */}
                <div className="w-11 h-11 rounded-full border border-white/10 bg-[#070b13] relative flex items-center justify-center shrink-0 self-center">
                  <span className="absolute w-full h-[1px] bg-slate-800/60" />
                  <span className="absolute h-full w-[1px] bg-slate-800/60" />
                  <div 
                    className="w-2.5 h-2.5 rounded-full bg-[#00f2ff] shadow-[0_0_8px_#00f2ff] transition-all duration-100 absolute" 
                    style={{ 
                      transform: `translate(${rollSensor * 0.4}px, ${pitchSensor * 0.4}px)` 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sensor unit 3: NFC Proximity Card induction tester */}
            <div className="bg-black/40 border border-[#2d1b46] p-3 rounded-lg space-y-2 text-left flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-[#a855f7] font-black uppercase flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-purple-400" /> Electromagnetic Induction
                  </span>
                  <span className="text-purple-400 font-bold">{inductionField} μT</span>
                </div>
                <p className="text-[8px] text-slate-400 mt-1 font-sans">
                  Tap to trigger local contactless induction coil sweep. Simulate scanning smart campus cards or lock gateways instantly!
                </p>
              </div>

              {showNfcScanner ? (
                <div className="bg-[#120822] border border-purple-500/20 p-2 rounded text-[8.5px] font-mono text-purple-300 mt-1 break-words">
                  {nfcOutput}
                </div>
              ) : null}

              <button
                type="button"
                onClick={scanVirtualNfcTag}
                className="w-full mt-1 rounded bg-gradient-to-r from-purple-900 to-indigo-900 text-purple-200 border border-purple-500/30 text-[8px] font-mono font-bold uppercase py-1 hover:from-purple-800 hover:to-indigo-800 cursor-pointer transition-all"
              >
                📡 Invoke Contactless Tag Sweep
              </button>
            </div>

            {/* Sensor unit 4: High-frequency Acoustic range beacon */}
            <div className="bg-black/40 border border-[#112d41] p-3 rounded-lg space-y-2 text-left flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-[#00f2ff] font-black uppercase flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-[#00f2ff]" /> Active Sound Ranging
                  </span>
                  <span className="text-cyan-400 font-bold">19.2 kHz</span>
                </div>
                <p className="text-[8px] text-slate-450 mt-1 font-sans">
                  Emits simulated acoustic inaudible chirps through device speakers. Workstations in a 3-meter radius match and verify attendance!
                </p>
              </div>

              <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 mt-1">
                <span>Mic/Speaker Pairing:</span>
                <button
                  type="button"
                  onClick={() => {
                    setUltrasonicChirpState(!ultrasonicChirpState);
                    playHaptic('light');
                    if (!ultrasonicChirpState) {
                      playVoice("Acoustic ranges active. Emitting secure chimes.");
                    }
                  }}
                  className={`px-2 py-0.5 rounded border uppercase font-bold font-mono transition-colors ${
                    ultrasonicChirpState
                      ? 'bg-[#00f2ff]/20 text-[#00f2ff] border-[#00f2ff]/30'
                      : 'bg-black/50 text-slate-400 border-white/5'
                  }`}
                >
                  {ultrasonicChirpState ? '🔴 Chirping ON' : '⚫ Muted'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* B. Right Side: Device-to-Device (D2D) Peer Handshaker */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          {/* Peer-to-Peer Ultrasonic Connector Card */}
          <div className="bg-[#100322]/85 border border-purple-500/20 p-4 rounded-xl text-left space-y-3 shadow-xl relative overflow-hidden flex-1 flex flex-col justify-between">
            <span className="absolute top-2.5 right-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
              <span className="text-[7.5px] font-mono text-purple-400 uppercase font-black">Mesh Peer</span>
            </span>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold font-sans text-[10.5px]">
                <Wifi className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="uppercase">Device-to-Device (D2D) Handshake</span>
              </div>
              <p className="text-[9px] text-slate-350 leading-relaxed font-sans">
                Exchange immediate credentials with nearby devices. Uses high precision radio & secure acoustic ranging coordinates to sync state offline:
              </p>
            </div>

            {/* Handshake Progress Box */}
            <div className="bg-black/60 p-3 rounded-lg border border-white/5 text-center leading-relaxed">
              {pairingStatus === 'idle' ? (
                <div className="py-4 space-y-2">
                  <span className="block text-[8.5px] text-slate-500 font-mono uppercase">System is ready for proximity handshake</span>
                  <p className="text-[8px] text-slate-400 font-sans px-2">
                    Click the trigger below to link, unlock workstation desk records, and secure your session streak credits!
                  </p>
                </div>
              ) : pairingStatus === 'scanning' || pairingStatus === 'linking' ? (
                <div className="py-2.5 space-y-2">
                  <div className="flex justify-between items-center text-[8.5px] font-mono text-purple-400">
                    <span className="animate-pulse uppercase font-black">{pairingStatus === 'scanning' ? '🔍 Beacon Sweep...' : '🔐 Exchanging Credentials'}</span>
                    <span>{pairingProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-[#00f2ff] to-purple-500 h-full transition-all duration-300" style={{ width: `${pairingProgress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="py-2 space-y-2">
                  <div className="flex items-center gap-1.5 justify-center text-emerald-400 text-[10.5px] font-black font-sans uppercase">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Action Successful
                  </div>
                  <div className="text-[8.5px] text-slate-300 leading-tight font-mono text-left space-y-1 bg-black/40 p-2 rounded">
                    <div>Synced Station: <span className="text-[#00f2ff]">{lastPairedTerminal}</span></div>
                    <div>Identity Token: <span className="text-emerald-400">APPROVED_MESH_SEC_V3</span></div>
                    <div>Reward Awarded: <span className="text-amber-400 font-bold">+15 Energy/XP Granted</span></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setPairingStatus('idle'); playHaptic('light'); }}
                    className="text-[7.5px] text-cyan-400 underline uppercase block font-mono hover:text-cyan-300 mx-auto cursor-pointer"
                  >
                    Scan Another workstation
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={pairingStatus !== 'idle'}
              onClick={invokeD2DHandshake}
              className={`w-full py-2 font-mono font-bold text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition-all ${
                pairingStatus !== 'idle'
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-950'
              }`}
            >
              🔄 Trigger Ultrasonic Mesh Handshake
            </button>
          </div>

          {/* Quick statement checklist cards summary */}
          <div className="bg-[#03060f]/90 border border-white/5 p-3 rounded-xl text-left space-y-2">
            <h4 className="text-[9px] font-sans font-bold text-cyan-400 uppercase tracking-wider">C-SYNC Mesh Telemetry Stats</h4>
            <div className="grid grid-cols-2 gap-2 text-center font-mono text-[8px]">
              <div className="bg-black/40 p-2 rounded border border-white/5">
                <span className="text-slate-500 block uppercase font-black text-[6.5px]">Mesh Nodes Online</span>
                <span className="text-xs font-black text-rose-400 block mt-0.5">14 active station PCs</span>
              </div>
              <div className="bg-black/40 p-2 rounded border border-white/5">
                <span className="text-slate-500 block uppercase font-black text-[6.5px]">System Reliability</span>
                <span className="text-xs font-black text-emerald-400 block mt-0.5">99.84% Sentry</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
