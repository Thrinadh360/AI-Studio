import React, { useState, useEffect } from 'react';
import { 
  IdCard, 
  Search, 
  Sparkles, 
  PhoneCall, 
  Send, 
  Linkedin, 
  Camera, 
  Heart, 
  ShieldCheck, 
  RefreshCw, 
  Cpu, 
  Phone, 
  MessageSquare, 
  X,
  Volume2,
  AlertCircle
} from 'lucide-react';
import { ClientDatabase } from '../remoteDb';
import { User } from '../types';
import { CsyncWebRTCCommunicator } from './CsyncWebRTCCommunicator';

interface VirtualIdHubProps {
  db: ClientDatabase;
  onRefreshAll: () => void;
}

export const VirtualIdHub: React.FC<VirtualIdHubProps> = ({ db, onRefreshAll }) => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [selectedUser, setSelectedUser] = useState<User>(() => users[0] || db.getCurrentStudent() || db.getUsers()[0] || { id: 1, fullName: 'Unknown Member', idNumber: 'GDC-000', role: 'Student' } as User);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom theme settings
  const [activeTheme, setActiveTheme] = useState<'glow-blue' | 'neon-purple' | 'cyber-green' | 'crimson-gold'>('glow-blue');
  const [arOverlay, setArOverlay] = useState(false);
  const [qrSeed, setQrSeed] = useState(Math.random().toString(36).substring(2, 8).toUpperCase());
  
  // Rotating seed timer states & AR Peer scan states
  const [seedSecondsLeft, setSeedSecondsLeft] = useState<number>(5.0);
  const [showArScanModal, setShowArScanModal] = useState(false);
  const [scanningPeerId, setScanningPeerId] = useState<number>(2);
  const [verificationStep, setVerificationStep] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [capturedSeed, setCapturedSeed] = useState<string>('');
  const [scanConsoleLines, setScanConsoleLines] = useState<string[]>([]);
  
  // Simulated Native calls / interaction state
  const [connectionModal, setConnectionModal] = useState<'none' | 'call' | 'telegram' | 'linkedin'>('none');
  const [callState, setCallState] = useState<'dialing' | 'connected' | 'ended'>('dialing');
  const [callSeconds, setCallSeconds] = useState(0);

  useEffect(() => {
    setUsers(db.getUsers());
    // Auto-update default card
    const fresh = db.getUsers().find(u => u.id === selectedUser.id);
    if (fresh) {
      setSelectedUser(fresh);
    }
  }, [users, selectedUser.id, db]);

  // Rotate QR cryptographic access seeds with precise 100ms slider countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSeedSecondsLeft((prev) => {
        if (prev <= 0.15) {
          setQrSeed(Math.random().toString(36).substring(2, 8).toUpperCase());
          return 5.0;
        }
        return Number((prev - 0.1).toFixed(1));
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Call timer simulation
  useEffect(() => {
    let callTimer: any;
    if (connectionModal === 'call' && callState === 'dialing') {
      callTimer = setTimeout(() => {
        setCallState('connected');
      }, 2000);
    } else if (connectionModal === 'call' && callState === 'connected') {
      callTimer = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      clearTimeout(callTimer);
      clearInterval(callTimer);
    };
  }, [connectionModal, callState]);

  const handleOpenCall = () => {
    setCallState('dialing');
    setCallSeconds(0);
    setConnectionModal('call');
  };

  const handleEndCall = () => {
    setCallState('ended');
    setTimeout(() => {
      setConnectionModal('none');
    }, 1000);
  };

  const triggerSimulationArScan = (peerId: number) => {
    const peer = users.find(u => u.id === peerId);
    if (!peer) return;

    setVerificationStep('scanning');
    setScanConsoleLines([]);
    
    // Snap-shot current seed
    const targetSeed = qrSeed;
    setCapturedSeed(targetSeed);

    const logs = [
      `[Camera]: Opening your mobile phone camera for scanning...`,
      `[Camera]: Searching for your friend's digital card on the screen...`,
      `[Camera]: Found the digital card. Adjusting focus now...`,
      `[Scanner]: Reading active changing PIN code: "${targetSeed}"`,
      `[Scanner]: Checking time limit on the PIN code...`,
      `[Scanner]: Sending PIN code to college computer database...`,
      `[College System]: PIN code matched and successfully verified! Access allowed!`,
    ];

    let currentLogIndex = 0;
    const logInterval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setScanConsoleLines(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(logInterval);
        
        // Decrypted and active successfully!
        setTimeout(() => {
          // Increase profile reputation and log to C-Sync server
          const currentRep = selectedUser.reputationScore || 90;
          const nextRep = Math.min(100, currentRep + 4);
          db.manualOverrideReputationScore(peer.fullName, selectedUser.id, nextRep);
          
          db.addLog(
            'SECURITY', 
            `[AR VERIFY] Peer ${peer.fullName} completed AR terminal scan check on ${selectedUser.fullName}'s station with rotating seed: [${targetSeed}]. Station match score: 100% verified.`, 
            'success'
          );
          
          setVerificationStep('success');
          onRefreshAll();
        }, 500);
      }
    }, 400);
  };

  // Theme styling selector
  const getThemeClasses = () => {
    switch (activeTheme) {
      case 'neon-purple':
        return {
          cardBg: 'bg-gradient-to-br from-[#100c24] via-[#140b2a] to-[#040209]',
          border: 'border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.15)]',
          textAccent: 'text-purple-400',
          gradientText: 'from-purple-400 to-fuchsia-300',
          glowRing: 'ring-2 ring-purple-500 shadow-[0_0_15px_#a855f7]',
          qrBg: 'bg-purple-950/40 border-purple-500/20'
        };
      case 'cyber-green':
        return {
          cardBg: 'bg-gradient-to-br from-[#021812] via-[#052219] to-[#000402]',
          border: 'border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.15)]',
          textAccent: 'text-emerald-400',
          gradientText: 'from-emerald-400 to-teal-300',
          glowRing: 'ring-2 ring-emerald-500 shadow-[0_0_15px_#10b981]',
          qrBg: 'bg-emerald-950/40 border-emerald-500/20'
        };
      case 'crimson-gold':
        return {
          cardBg: 'bg-gradient-to-br from-[#24050a] via-[#1c0805] to-[#070101]',
          border: 'border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.15)]',
          textAccent: 'text-amber-500',
          gradientText: 'from-amber-400 to-rose-400',
          glowRing: 'ring-2 ring-amber-500 shadow-[0_0_15px_#f59e0b]',
          qrBg: 'bg-amber-950/40 border-amber-500/20'
        };
      case 'glow-blue':
      default:
        return {
          cardBg: 'bg-gradient-to-br from-[#040d21] via-[#08152e] to-[#02050a]',
          border: 'border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.25)]',
          textAccent: 'text-cyan-400',
          gradientText: 'from-cyan-400 to-[#50f2ff]',
          glowRing: 'ring-2 ring-cyan-400 shadow-[0_0_15px_#00f2ff]',
          qrBg: 'bg-[#031d2c] border-cyan-500/25'
        };
    }
  };

  const theme = getThemeClasses();
  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.idNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-fadeIn font-sans">
      
      {/* LEFT AREA: SELECTOR PANEL & DIRECTORY */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#0b1226]/80 border border-cyan-500/10 rounded-2xl p-6 shadow-xl relative text-left">
          <h3 className="text-sm font-black text-cyan-400 font-orbitron uppercase tracking-wider mb-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#00f2ff]" />
            Search Classmates & Teachers
          </h3>
          <p className="text-[10px] text-slate-500 font-mono mb-4">Click on any person to see their college digital ID on the right side.</p>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, roll no, division..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/90 border border-cyan-500/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2ff]/60 font-mono"
            />
          </div>

          <div className="space-y-2 pr-1">
            {filteredUsers.map((u) => {
              const isSel = selectedUser.id === u.id;
              const rep = u.reputationScore || 90;
              const str = u.streak || 0;
              const isStud = u.role.toLowerCase().includes('student') && u.role !== 'Alumni';
              
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                    isSel 
                      ? 'bg-cyan-950/20 border-cyan-500/40 shadow-inner' 
                      : 'bg-slate-950/50 border-white/5 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={u.photoBlob} 
                      className={`w-9 h-9 rounded-full object-cover border ${isSel ? 'border-cyan-400' : 'border-slate-800'}`} 
                      alt="" 
                    />
                    <div>
                      <div className={`text-xs font-bold ${isSel ? 'text-cyan-400' : 'text-white'}`}>{u.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {u.idNumber} • {
                          u.role === 'Staff' ? 'College Teacher' : 
                          u.role === 'HOD' ? 'Head of Dept' : 
                          u.role === 'Alumni' ? 'Alumni Graduate' : 
                          u.role === 'Guest' ? 'Guest Visitor' : 
                          `Year ${u.academicYear || 1} Class`
                        }
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[10px]">
                    {isStud ? (
                      <div className="text-amber-500 font-bold">★ {str} Streak</div>
                    ) : (
                      <div className="text-cyan-400 font-bold">Verified</div>
                    )}
                    <div className="text-slate-400">{rep}% Behavior</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* IDENTITY HOVER CONTROL & THEME SELECTORS */}
        <div className="bg-[#0b1226]/80 border border-cyan-500/10 rounded-2xl p-5 shadow-xl text-left">
          <span className="text-[10px] font-black font-mono text-slate-500 block uppercase tracking-wider mb-3">Identity Card Theme Deck</span>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'glow-blue', name: 'GLOW BLUE', color: 'bg-cyan-500' },
              { id: 'neon-purple', name: 'NEON PURPLE', color: 'bg-purple-500' },
              { id: 'cyber-green', name: 'CYBER GREEN', color: 'bg-emerald-500' },
              { id: 'crimson-gold', name: 'CRIMSON GOLD', color: 'bg-amber-500' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTheme(t.id as any)}
                className={`p-2 rounded-xl text-[9px] font-bold font-mono border transition-all flex flex-col items-center gap-1.5 ${
                  activeTheme === t.id 
                    ? 'bg-white/10 text-white border-white/20' 
                    : 'bg-slate-950/50 text-slate-500 border-white/5'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full ${t.color}`}></div>
                {t.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="mt-4 border-t border-cyan-500/10 pt-3 flex justify-between items-center">
            <span className="text-[10px] font-bold font-mono text-slate-400">AUGMENTED REALITY HUD OVERLAY</span>
            <button
              onClick={() => setArOverlay(!arOverlay)}
              className={`px-3 py-1 rounded-lg text-[9px] font-bold font-mono transition-all border ${
                arOverlay 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-slate-950 text-slate-500 border-white/5'
              }`}
            >
              {arOverlay ? 'ACTIVE' : 'DEACTIVE'}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT AREA: THE SMART VIRTUAL HOLOGRAPHIC ID DISPLAY */}
      <div className="lg:col-span-7 flex justify-center items-start">
        
        <div className={`w-full max-w-[440px] rounded-3xl border p-6 ${theme.cardBg} ${theme.border} transition-all relative overflow-hidden flex flex-col justify-between min-h-[580px]`}>
          {/* Back grid line element */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
          
          {/* Interactive AR Live Scanner Grid lines */}
          {arOverlay && (
            <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden rounded-3xl">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-400 opacity-60 animate-[scan_3s_infinite] shadow-[0_0_10px_#10b981]"></div>
              <div className="absolute inset-0 border-[2px] border-emerald-500/30 animate-pulse m-2"></div>
              {/* Telemetry coordinate indicators list simplified */}
              <div className="absolute top-4 right-4 font-mono text-[8px] text-emerald-400 leading-tight text-right select-none">
                <div>College Area: Maddilapalem</div>
                <div>Campus Camera No: 2</div>
                <div>System Status: Safe & Sound</div>
              </div>
              <div className="absolute bottom-4 left-4 font-mono text-[8.5px] text-emerald-400/80 uppercase">
                [ CAMERA SCANNING IS ACTIVE... KEEP COMPUTER STEADY ]
              </div>
            </div>
          )}

          {/* CARD TOP BAR */}
          <div>
            <div className="flex justify-between items-center mb-6 select-none">
              <div className="flex items-center gap-2">
                <IdCard className={`w-5 h-5 ${theme.textAccent}`} />
                <span className="font-sans font-black text-white text-[11px] tracking-wider uppercase">GDC CAMPUS DIGITAL ID CARD</span>
              </div>
              <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono text-[8px] text-[#00f2ff] uppercase font-bold tracking-wider">Verified Campus Member</span>
            </div>

            {/* CARD PROFILE HEADER */}
            {(() => {
              const isSelectedStudent = selectedUser.role.toLowerCase().includes('student') && selectedUser.role !== 'Alumni';
              
              return (
                <>
                  <div className="flex gap-4 items-start border-b border-cyan-500/10 pb-5">
                    <div className="relative shrink-0">
                      <img 
                        src={selectedUser.photoBlob} 
                        className={`w-20 h-20 rounded-2xl object-cover ${theme.glowRing}`} 
                        alt="" 
                      />
                      <span className="bg-slate-950 border border-cyan-500/20 text-[#00f2ff] px-1.5 py-0.2 rounded font-mono font-bold text-[8.5px] absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                        {isSelectedStudent ? `LEVEL ${selectedUser.level || 1} STUDENT` : 'CAMPUS MEMBER'}
                      </span>
                      
                      {arOverlay && (
                        <div className="absolute -inset-1 border border-emerald-500 rounded-2xl animate-ping opacity-40 pointer-events-none"></div>
                      )}
                    </div>

                    <div className="text-left flex-1 min-w-0">
                      <h4 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-1.5 leading-none">
                        {selectedUser.fullName}
                        <ShieldCheck className="w-4 h-4 text-[#00f2ff] shrink-0" />
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-tight">{selectedUser.idNumber} • {selectedUser.role}</p>
                      
                      <div className="mt-3 flex items-center gap-2">
                        <span className="bg-white/5 px-2 py-0.5 rounded font-bold text-[9px] text-slate-300">
                          {selectedUser.role === 'Staff' ? 'COLLEGE TEACHER' : 
                           selectedUser.role === 'HOD' ? 'HEAD OF DEPT' :
                           selectedUser.role === 'Alumni' ? 'HONORED ALUMNUS' :
                           selectedUser.role === 'Guest' ? 'GUEST VISITOR' :
                           `YEAR ${selectedUser.academicYear || 1} DEPT`}
                        </span>
                        {isSelectedStudent && (
                          <span className={`text-[9px] font-mono font-bold ${theme.textAccent}`}>
                            {selectedUser.streakTier || 'Newbie Starter'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CARD BODY DETAILS & KEY MATRIX */}
                  <div className="grid grid-cols-2 gap-4 my-5 text-left text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-500 font-mono text-[8.5px] uppercase block">Assigned Seat / Room:</span>
                      <span className="font-bold text-white font-mono flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-slate-400" />
                        {selectedUser.role === 'Staff' || selectedUser.role === 'HOD' ? 'Staff Office Cabin' :
                         selectedUser.role === 'Alumni' ? 'Graduated (Alum Seat)' :
                         selectedUser.role === 'Guest' ? 'Temporary Area Desk' :
                         'CS-14 (Computer Room Lab-B)'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-mono text-[8.5px] uppercase block">Academic Batch years:</span>
                      <span className="font-bold text-white font-mono">
                        {selectedUser.role === 'Alumni' ? 'Batch: 2019 - 2023' : 
                         selectedUser.role === 'Guest' ? 'One-Day Guest Entry' :
                         selectedUser.role === 'Staff' || selectedUser.role === 'HOD' ? 'Permanent Duty member' :
                         'Batch: 2023 - 2027'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-mono text-[8.5px] uppercase block">Attendance Streak details:</span>
                      <span className="font-bold text-amber-500 font-mono flex items-center gap-1 leading-none text-xs">
                        {isSelectedStudent ? (
                          <>★ {selectedUser.streak || 0} continuous class days!</>
                        ) : (
                          <span className="text-slate-400 font-normal">Exempted (No Attendance Tracker needed)</span>
                        )}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-mono text-[8.5px] uppercase block">Behavior standing score:</span>
                      <span className="font-bold text-white font-mono flex items-center gap-1.5">
                        <div className="w-12 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-cyan-400" style={{ width: `${selectedUser.reputationScore || 95}%` }}></div>
                        </div>
                        {selectedUser.reputationScore || 95}% Good Behaviour
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* DYNAMIC SECURE ROTATING SEED QR CODE & TOTP OVERLAY */}
          <div className="space-y-3 mb-5">
            <div className={`p-4 rounded-2xl flex items-center gap-4 ${theme.qrBg} border`}>
              {/* Holographic QR box */}
              <div className="w-20 h-20 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center p-2 shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00f2ff_1.5px,transparent_1.5px)] [background-size:8px_8px]"></div>
                
                {/* Complex Matrix grid to simulate QR Code */}
                <div className="grid grid-cols-4 gap-1 w-full h-full opacity-85">
                  {[...Array(16)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-sm ${(i * 7 + qrSeed.charCodeAt(i % qrSeed.length)) % 2 === 0 ? theme.textAccent.replace('text-', 'bg-') : 'bg-slate-900'}`}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="text-left flex-1 min-w-0 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] text-slate-500 uppercase tracking-wider block">Automatic attendance PIN number</span>
                  <span className="text-[8.5px] text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    Changes in: {seedSecondsLeft}s
                  </span>
                </div>
                
                <div className="text-white font-black text-xs mt-1.5 font-mono tracking-wider flex items-center gap-1.5">
                  <span className="bg-slate-900 font-bold text-[#00f2ff] px-2 py-0.5 rounded border border-cyan-500/15">
                    {qrSeed}
                  </span>
                  <span className="text-[8.5px] text-slate-500 font-normal">Active Code PIN</span>
                </div>

                {/* Micro numerical progress bar */}
                <div className="w-full bg-slate-950/80 h-1.5 rounded-full overflow-hidden mt-2 relative">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-100 ease-linear shadow-[0_0_8px_#10b981]" 
                    style={{ width: `${(seedSecondsLeft / 5.0) * 100}%` }}
                  ></div>
                </div>

                <p className="text-[9.5px] text-slate-400 leading-snug mt-1.5 font-sans">
                  This card shows a secure changing PIN for your attendance. Tap below to scan your classmate's card using your mobile camera.
                </p>
              </div>
            </div>

            {/* INTERACTIVE P2P AR SCAN TRIGGER BUTTON */}
            <button
              onClick={() => {
                const scanningPeers = users.filter(u => u.id !== selectedUser.id);
                if (scanningPeers.length > 0) {
                  setScanningPeerId(scanningPeers[0].id);
                }
                setVerificationStep('idle');
                setScanConsoleLines([]);
                setShowArScanModal(true);
              }}
              className="w-full bg-gradient-to-r from-emerald-500/15 to-teal-500/5 hover:from-emerald-500/25 hover:to-teal-500/15 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 font-bold font-mono py-2.5 px-4 rounded-xl text-[10.5px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.05)] cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-400 animate-pulse" />
              SCAN FRIEND'S ID CARD USING CUSTOM CAMERA (AR FEATURE)
            </button>
          </div>

          {/* CARD FOOTER NATIVE ACTION CONTACT BUTTONS */}
          <div className="border-t border-cyan-500/10 pt-5 mt-auto">
            <span className="text-slate-500 font-mono text-[8.5px] uppercase block mb-3">TALK TO CLASSMATE VIA DIRECT BUTTONS</span>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleOpenCall}
                className="bg-cyan-500/15 hover:bg-cyan-400/25 border border-cyan-500/20 text-cyan-400 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" /> VOICE CALL
              </button>

              <button
                onClick={() => setConnectionModal('telegram')}
                className="bg-sky-500/10 hover:bg-sky-400/20 border border-sky-500/20 text-sky-400 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> TELEGRAM
              </button>

              <button
                onClick={() => setConnectionModal('linkedin')}
                className="bg-indigo-500/10 hover:bg-indigo-400/20 border border-indigo-500/20 text-indigo-400 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <Linkedin className="w-3.5 h-3.5" /> LINKEDIN
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* POPUP MODALS: VOIP NATIVE DIALING CALL SIMULATOR */}
      {connectionModal === 'call' && (
        <CsyncWebRTCCommunicator
          db={db}
          activeCallUser={selectedUser}
          initiatorRole="Student"
          defaultChannelType="video"
          onClose={() => {
            setConnectionModal('none');
          }}
          onCallStateChange={(state) => {
            setCallState(state === 'dialing' ? 'dialing' : state === 'connected' ? 'connected' : 'ended');
          }}
        />
      )}

      {/* POPUP MODAL: TELEGRAM MOCKS */}
      {connectionModal === 'telegram' && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#050b18] border border-cyan-500/30 rounded-2xl p-6 w-full max-w-md text-left relative shadow-2xl">
            <button 
              onClick={() => setConnectionModal('none')}
              className="absolute right-4 top-4 hover:text-white text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-black text-white font-orbitron uppercase tracking-wider mb-4 flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-400" />
              NATIVE CHAT ROUTER TO {(selectedUser?.fullName || 'User').toUpperCase()}
            </h3>

            <div className="space-y-3 font-mono text-xs bg-slate-950 p-4 border border-cyan-500/10 rounded-xl">
              <div>
                <span className="text-sky-400 font-bold block">SERVER LINK: t.me/csync_nexus_{(selectedUser?.idNumber || 'na').toLowerCase().replace(/[^a-z0-9]/g, '_')}</span>
              </div>
              <p className="text-slate-400 leading-relaxed font-sans">
                You are redirecting securely to the Telegram endpoint profile mapped for {selectedUser?.fullName || 'this user'}. Active MAC Address and local terminal credentials passed for peer-to-peer verification checks.
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setConnectionModal('none')}
                className="bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-400 px-4 py-2.5 rounded-xl font-mono uppercase text-xs"
              >
                Go Back
              </button>
              <button
                onClick={() => setConnectionModal('none')}
                className="bg-sky-500 hover:bg-sky-600 text-white font-black font-mono px-5 py-2.5 rounded-xl text-xs uppercase tracking-wide"
              >
                Launch Messenger Telegram
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: LINKEDIN MOCK */}
      {connectionModal === 'linkedin' && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#050b18] border border-cyan-500/30 rounded-2xl p-6 w-full max-w-md text-left relative shadow-2xl">
            <button 
              onClick={() => setConnectionModal('none')}
              className="absolute right-4 top-4 hover:text-white text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-black text-white font-orbitron uppercase tracking-wider mb-4 flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-indigo-400" />
              PROFESSIONAL SYNC TO {(selectedUser?.fullName || 'User').toUpperCase()}
            </h3>

            <div className="space-y-3 font-mono text-xs bg-slate-950 p-4 border border-cyan-500/10 rounded-xl">
              <div>
                <span className="text-indigo-400 font-bold block">DIRECTORY LINK: linkedin.com/in/csync-alumni_{(selectedUser?.idNumber || 'na').toLowerCase().replace(/[^a-z0-9]/g, '_')}</span>
              </div>
              <p className="text-slate-400 leading-relaxed font-sans">
                Matching academic nodes in local system registries... Profile located! Verified professional status matches {selectedUser?.role === 'Staff' ? 'Instructing Faculty Academic' : 'Student Scholar Candidate'}.
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setConnectionModal('none')}
                className="bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-400 px-4 py-2.5 rounded-xl font-mono uppercase text-xs"
              >
                Go Back
              </button>
              <button
                onClick={() => setConnectionModal('none')}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-black font-mono px-5 py-2.5 rounded-xl text-xs uppercase tracking-wide"
              >
                Launch LinkedIn Direct Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: INTERACTIVE PEER AR CODE SCANNER */}
      {showArScanModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#050b18] border-2 border-emerald-500/30 rounded-3xl p-6 w-full max-w-lg text-left relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col max-h-[90vh]">
            {/* Corner styling accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-emerald-400"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-emerald-400"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-emerald-400"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-emerald-400"></div>

            <button 
              onClick={() => setShowArScanModal(false)}
              className="absolute right-6 top-6 hover:text-white text-slate-500 transition-colors z-20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-black text-white font-orbitron uppercase tracking-wider mb-2 flex items-center gap-2.5">
              <Camera className="w-5 h-5 text-emerald-400 animate-pulse" />
              Camera Scanner (AR Feature)
            </h3>
            <p className="text-[10px] text-slate-400 font-sans mb-4">
              Simulate scanning your friend's digital card. Select a friend below to capture and verify their changing security PIN.
            </p>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {/* OPERATOR DROPDOWN */}
              <div className="bg-slate-950 p-4 border border-emerald-500/10 rounded-xl">
                <label className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block mb-2 font-mono">
                  Who is scanning? (Select a Friend):
                </label>
                <select
                  value={scanningPeerId}
                  onChange={(e) => {
                    setScanningPeerId(Number(e.target.value));
                    setVerificationStep('idle');
                    setScanConsoleLines([]);
                  }}
                  disabled={verificationStep === 'scanning'}
                  className="w-full bg-[#0a0f1d] border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono disabled:opacity-50"
                >
                  {users.filter(u => u.id !== selectedUser.id).map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.role} • {u.idNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* CAMERA VIEWFINDER HUD */}
              <div className="relative h-44 bg-slate-950 rounded-2xl border border-dashed border-emerald-500/25 overflow-hidden flex flex-col justify-center items-center">
                
                {/* Horizontal scanner light bar */}
                {verificationStep === 'scanning' && (
                  <div className="absolute left-0 w-full h-[3px] bg-emerald-400 shadow-[0_0_12px_#10b981] opacity-75 animate-[scan_2s_infinite] z-20"></div>
                )}

                {/* Viewfinder corner lines */}
                <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-emerald-500/40"></div>
                <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-emerald-500/40"></div>
                <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-emerald-500/40"></div>
                <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-emerald-500/40"></div>

                {verificationStep === 'idle' && (
                  <div className="text-center p-4">
                    <Camera className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-bounce" />
                    <p className="font-mono text-[10px] text-slate-500 uppercase">READY TO SCAN</p>
                    <p className="text-[9px] text-slate-600 mt-1">Ready to scan PIN code: {qrSeed}</p>
                  </div>
                )}

                {verificationStep === 'scanning' && (
                  <div className="text-center p-4">
                    <div className="relative mb-3 flex justify-center">
                      <img 
                        src={selectedUser.photoBlob} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 animate-pulse opacity-85" 
                        alt="" 
                      />
                      <div className="absolute -inset-1 border border-emerald-400 rounded-full animate-ping opacity-30"></div>
                    </div>
                    <span className="font-mono text-[9px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded tracking-widest uppercase">
                      [ READING CARD DETECTED ]
                    </span>
                  </div>
                )}

                {verificationStep === 'success' && (
                  <div className="text-center p-4 bg-emerald-950/20 inset-0 absolute flex flex-col justify-center items-center animate-fadeIn">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/25 border border-emerald-500 text-emerald-400 flex items-center justify-center mb-1.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse">
                      <ShieldCheck className="w-7 h-7 text-emerald-400" />
                    </div>
                    <p className="font-orbitron font-black text-xs text-emerald-400 uppercase tracking-widest leading-none">VERIFIED SUCCESSFULLY</p>
                    <p className="text-[10px] text-slate-300 mt-1.5 font-mono font-bold">Matched PIN: "{capturedSeed}"</p>
                  </div>
                )}
              </div>

              {/* LIVE LOGGER RX CONSOLE */}
              <div className="bg-slate-950 font-mono text-[9px] p-3 border border-emerald-500/10 rounded-xl leading-relaxed text-slate-400 min-h-[110px] flex flex-col justify-end">
                <span className="text-[8px] text-slate-600 uppercase border-b border-white/5 pb-1 block mb-2">Live Scanner Messages:</span>
                {scanConsoleLines.length === 0 ? (
                  <div className="text-slate-600 text-center py-4">No active scanning yet. Click "Start Camera Scan" below to test.</div>
                ) : (
                  <div className="space-y-1 overflow-y-auto max-h-[85px] leading-tight text-left">
                    {scanConsoleLines.map((line, lIdx) => (
                      <div key={lIdx} className="flex gap-1.5 items-start">
                        <span className="text-emerald-500 select-none">&gt;&gt;</span>
                        <p className={line.includes('matched') || line.includes('verified') || line.includes('allowed') ? 'text-emerald-400 font-bold' : ''}>{line}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="mt-5 border-t border-emerald-500/10 pt-4 flex gap-2 justify-end">
              <button
                onClick={() => setShowArScanModal(false)}
                className="bg-[#0a0f1d] border border-white/5 hover:bg-slate-800 text-slate-400 px-4 py-2.5 rounded-xl font-mono uppercase text-xs cursor-pointer"
              >
                Close Camera
              </button>

              {verificationStep !== 'success' ? (
                <button
                  onClick={() => triggerSimulationArScan(scanningPeerId)}
                  disabled={verificationStep === 'scanning'}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black font-mono px-5 py-2.5 rounded-xl text-xs uppercase tracking-wide disabled:opacity-50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
                >
                  {verificationStep === 'scanning' ? 'Adjusting focus...' : 'Start Camera Scan'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setVerificationStep('idle');
                    setScanConsoleLines([]);
                  }}
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black font-mono px-5 py-2.5 rounded-xl text-xs uppercase tracking-wide cursor-pointer"
                >
                  Scan Another Card
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
