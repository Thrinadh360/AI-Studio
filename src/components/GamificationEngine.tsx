import React, { useState } from 'react';
import { 
  Flame, 
  Award, 
  TrendingUp, 
  UserCheck, 
  Zap, 
  ShieldAlert, 
  Calendar, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Lock,
  User as UserIcon,
  Search
} from 'lucide-react';
import { ClientDatabase } from '../remoteDb';
import { User } from '../types';

interface GamificationEngineProps {
  db: ClientDatabase;
  onRefreshAll: () => void;
}

export const GamificationEngine: React.FC<GamificationEngineProps> = ({ db, onRefreshAll }) => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [selectedSimUser, setSelectedSimUser] = useState<number>(users[0]?.id || 1);
  const [simSession, setSimSession] = useState<'FN' | 'AN'>('FN');
  const [simHour, setSimHour] = useState<number>(10);
  const [simMinute, setSimMinute] = useState<number>(15);
  
  // Anti-Abuse spoof switches
  const [vpnSpoof, setVpnSpoof] = useState(false);
  const [deviceSpoof, setDeviceSpoof] = useState(false);
  const [gpsSpoof, setGpsSpoof] = useState(false);
  
  // Audit manual form fields
  const [auditUser, setAuditUser] = useState<number>(users[0]?.id || 1);
  const [auditDate, setAuditDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [auditFN, setAuditFN] = useState<string>('PRESENT');
  const [auditAN, setAuditAN] = useState<string>('PRESENT');
  const [auditStreakRestore, setAuditStreakRestore] = useState<number>(10);
  const [auditRepScore, setAuditRepScore] = useState<number>(95);
  const [badgeToRemove, setBadgeToRemove] = useState<string>('');
  
  // Live simulation report feedback
  const [simFeedback, setSimFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const refreshLocalState = () => {
    setUsers([...db.getUsers()]);
    onRefreshAll();
  };

  const handleSimClockIn = (e: React.FormEvent) => {
    e.preventDefault();
    const timeStr = `${simHour.toString().padStart(2, '0')}:${simMinute.toString().padStart(2, '0')}`;
    const result = db.recordAttendanceSession(
      selectedSimUser,
      simSession,
      timeStr,
      "17.72, 83.31", 
      "CS-02",
      { vpnDetected: vpnSpoof, deviceSpoofed: deviceSpoof, fakeGps: gpsSpoof }
    );
    
    setSimFeedback({ success: result.success, message: result.message });
    refreshLocalState();

    // Voice Feedback
    const student = db.getUsers().find(u => u.id === selectedSimUser);
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        if (result.success) {
          const speakText = `Attendance session recorded successfully for ${student?.fullName || 'student'}. Gain ${result.xpGained || 10} XP. ${result.levelUp ? 'User leveled up!' : ''}`;
          const utterance = new SpeechSynthesisUtterance(speakText);
          window.speechSynthesis.speak(utterance);
        } else {
          const speakText = `Attendance recording denied. ${result.message}`;
          const utterance = new SpeechSynthesisUtterance(speakText);
          window.speechSynthesis.speak(utterance);
        }
      } catch (_) {}
    }

    // Clear feedback block after 5s
    setTimeout(() => {
      setSimFeedback(null);
    }, 6000);
  };

  const handleHODRepair = () => {
    db.manualRepairAttendance("HOD_OVERRIDE_AGENT", auditUser, auditDate, auditFN, auditAN);
    alert(`Success: Overwrote attendance matrix for candidate ${auditUser} on ${auditDate}. Logs synchronized to Secure Vault register.`);
    
    // Voice Feedback
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const targetStudent = db.getUsers().find(u => u.id === auditUser);
        const utterance = new SpeechSynthesisUtterance(`Manual attendance repair approved for student ${targetStudent?.fullName || 'user'}. Records updated.`);
        window.speechSynthesis.speak(utterance);
      } catch (_) {}
    }

    refreshLocalState();
  };

  const handleHODRestoreStreak = () => {
    db.manualRestoreStreak("HOD_OVERRIDE_AGENT", auditUser, auditStreakRestore);
    alert(`Success: Re-instated custom continuous streak cycle of ${auditStreakRestore} days.`);

    // Voice Feedback
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const targetStudent = db.getUsers().find(u => u.id === auditUser);
        const utterance = new SpeechSynthesisUtterance(`Continuous streak restored for ${targetStudent?.fullName || 'user'} to ${auditStreakRestore} days.`);
        window.speechSynthesis.speak(utterance);
      } catch (_) {}
    }

    refreshLocalState();
  };

  const handleHODGrantHonor = () => {
    db.manualGrantHonorStar("HOD_OVERRIDE_AGENT", auditUser, 'honor');
    alert(`Success: Conferred academic Honor Certificate star item to candidate. Star index updated.`);
    refreshLocalState();
  };

  const handleHODPurgeBadge = () => {
    if (!badgeToRemove) return;
    db.manualRemoveBadge("HOD_OVERRIDE_AGENT", auditUser, badgeToRemove);
    alert(`Success: Purged fraudulent badge item "${badgeToRemove}" from candidate portfolio register.`);
    refreshLocalState();
  };

  const handleHODOverrideRep = () => {
    db.manualOverrideReputationScore("HOD_OVERRIDE_AGENT", auditUser, auditRepScore);
    alert(`Success: Override reputation health value indexes to ${auditRepScore}%.`);
    refreshLocalState();
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.idNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedLeaderboard = [...users].sort((a, b) => {
    const xpA = a.xp || 0;
    const xpB = b.xp || 0;
    return xpB - xpA;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-fadeIn">
      {/* LEFT COLUMN: LIVE USER GAMIFIED STATS CARD INDEX */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* LEADERBOARD VIEW */}
        <div className="bg-[#0b1226]/80 border border-cyan-500/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f2ff]/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-black text-cyan-400 font-orbitron uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00f2ff]" />
                CAMPUS REPUTATION LEADERBOARD [GENAI XP ENGINE]
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-1">Autonomous discipline indexes verified over SECURE local servers</p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950/80 border border-cyan-500/15 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2ff]/60 font-mono"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300 font-sans">
              <thead>
                <tr className="border-b border-cyan-500/10 text-slate-500 uppercase tracking-wider text-[10px] font-mono">
                  <th className="pb-3 pl-2">Rank</th>
                  <th className="pb-3">Candidate ID</th>
                  <th className="pb-3">Streak Presence</th>
                  <th className="pb-3 font-mono">Discipline Rating</th>
                  <th className="pb-3">XP Rank</th>
                  <th className="pb-3 text-right pr-2">XP Score & Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/5">
                {sortedLeaderboard.slice(0, 5).map((u, idx) => {
                  const xp = u.xp || 10;
                  const lvl = u.level || 1;
                  const str = u.streak || 0;
                  const rep = u.reputationScore || 90;
                  const tier = u.streakTier || 'Newcomer';
                  
                  return (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-3.5 pl-2">
                        {idx === 0 && <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded font-black font-mono">#1 CHAMP</span>}
                        {idx === 1 && <span className="bg-slate-400/20 text-slate-200 border border-slate-400/30 px-2 py-0.5 rounded font-black font-mono">#2 HIGH</span>}
                        {idx === 2 && <span className="bg-yellow-700/20 text-yellow-600 border border-yellow-700/25 px-2 py-0.5 rounded font-black font-mono">#3 ELITE</span>}
                        {idx > 2 && <span className="text-slate-500 font-mono pl-2">#{idx + 1}</span>}
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <img src={u.photoBlob} className="w-7 h-7 rounded-full object-cover border border-cyan-500/20 shadow" alt={u.fullName} />
                          <div>
                            <div className="font-bold text-white group-hover:text-cyan-400 transition-colors uppercase">{u.fullName}</div>
                            <div className="text-[10px] text-slate-500 font-mono uppercase">{u.idNumber} • {u.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5 text-amber-500 font-bold font-mono">
                          <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse fill-amber-500" />
                          {str} <span className="text-[10px] text-slate-500 font-normal">days ({tier})</span>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className={`h-full ${rep >= 85 ? 'bg-emerald-500' : rep >= 60 ? 'bg-yellow-500' : 'bg-rose-500'}`}
                              style={{ width: `${rep}%` }}
                            ></div>
                          </div>
                          <span className={rep >= 85 ? 'text-emerald-400' : rep >= 60 ? 'text-yellow-400' : 'text-rose-400'}>{rep}%</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="bg-indigo-950 border border-indigo-700/35 text-indigo-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-tight">LEVEL {lvl}</span>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <div className="font-mono text-[#00f2ff] font-bold">{xp} XP</div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest">{u.department?.replace('Computer Science & ', '')}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOTIVATIONAL SECTIONS AND STAR DECORATOR MATRIX */}
        <div className="bg-[#0b1226]/80 border border-cyan-500/10 rounded-2xl p-6 shadow-xl text-left relative">
          <div className="flex items-center justify-between mb-4 border-b border-cyan-500/10 pb-3">
            <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider font-orbitron flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              IN-GAME ATTENDANCE DECORATOR AND ACHIVEMENT CERTIFICATES
            </h4>
            <span className="text-[9px] text-slate-500 font-mono uppercase">Decentralized Badge Register</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/60 p-4 border border-cyan-500/5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-slate-500 font-mono uppercase">Streak Booster</span>
                <h5 className="text-white font-bold font-orbitron mt-1">7-Day Streak</h5>
                <p className="text-[10px] text-slate-400 mt-1 lines-clamp-2">Sustained present status on lab stations for 7 days. Granted +20 XP.</p>
              </div>
              <span className="text-[9.5px] text-[#00f2ff] font-sans mt-3 inline-block">• Active Milestone</span>
            </div>

            <div className="bg-slate-950/60 p-4 border border-cyan-500/5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-slate-500 font-mono uppercase">Legendary Pres.</span>
                <h5 className="text-amber-500 font-bold font-orbitron mt-1">100 Sessions</h5>
                <p className="text-[10px] text-slate-400 mt-1 lines-clamp-2">Exceeded triple-digit login sessions. Granted +250 XP.</p>
              </div>
              <span className="text-[9.5px] text-amber-500 font-sans mt-3 inline-block">• Legendary Standard</span>
            </div>

            <div className="bg-slate-950/60 p-4 border border-cyan-500/5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-slate-500 font-mono uppercase">Sentry Elite</span>
                <h5 className="text-purple-400 font-bold font-orbitron mt-1">Elite Attendance</h5>
                <p className="text-[10px] text-slate-400 mt-1 lines-clamp-2">Conferred to students with maximum 100% attendance consistency ratings.</p>
              </div>
              <span className="text-[9.5px] text-purple-400 font-sans mt-3 inline-block">• HOD Conferred</span>
            </div>

            <div className="bg-slate-950/60 p-4 border border-cyan-500/5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-slate-500 font-mono uppercase">First Welcome</span>
                <h5 className="text-emerald-400 font-bold font-orbitron mt-1">First Attendance</h5>
                <p className="text-[10px] text-slate-400 mt-1 lines-clamp-2">Enrolled on the secure C-Sync network. Granted +10 XP.</p>
              </div>
              <span className="text-[9.5px] text-emerald-400 font-sans mt-3 inline-block">• AutoUnlocked</span>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: SIMULATORS AND ADMINISTRATIVE AUDIT OVERRIDES */}
      <div className="lg:col-span-4 space-y-8">
        
        {/* INTERACTIVE CLOCK-IN SIMULATION HUD */}
        <div className="bg-[#0b1226]/80 border border-cyan-500/10 rounded-2xl p-6 shadow-xl text-left relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-[#00f2ff] to-cyan-500"></div>

          <h3 className="text-sm font-black text-cyan-400 font-orbitron uppercase tracking-wider mb-2 flex items-center gap-2">
            <Zap className="text-amber-500 w-4 h-4" />
            LIVE ATTENDANCE SIMULATION HUBS
          </h3>
          <p className="text-[10px] text-slate-500 font-mono mb-4">Validate streak calculations, XP points, and anti-abuse intercept structures in real-time.</p>

          {simFeedback && (
            <div className={`p-3 rounded-xl mb-4 text-xs font-mono border ${
              simFeedback.success 
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-950/40 text-rose-400 border-rose-500/30'
            }`}>
              <div className="font-bold uppercase tracking-wider mb-1">{simFeedback.success ? 'CLOCK-IN APPROVED' : 'SECURITY ABORTED'}</div>
              <p className="text-[10.5px] leading-relaxed">{simFeedback.message}</p>
            </div>
          )}

          <form onSubmit={handleSimClockIn} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-black font-mono text-[9px] block uppercase">Select Candidate:</label>
              <select
                value={selectedSimUser}
                onChange={(e) => setSelectedSimUser(Number(e.target.value))}
                className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white font-mono"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName.split(' ')[0]} ({u.idNumber} - {u.role === 'Staff' ? 'Staff' : `Yr ${u.academicYear}`})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400 font-black font-mono text-[9px] block">SESSION TYPE:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSimSession('FN')}
                    className={`flex-1 p-2 rounded-xl border text-[10px] font-bold tracking-tight uppercase ${
                      simSession === 'FN' 
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                        : 'bg-slate-950 text-slate-400 border-white/5'
                    }`}
                  >
                    FN (10:00AM)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimSession('AN')}
                    className={`flex-1 p-2 rounded-xl border text-[10px] font-bold tracking-tight uppercase ${
                      simSession === 'AN' 
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                        : 'bg-slate-950 text-slate-400 border-white/5'
                    }`}
                  >
                    AN (2:20PM)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-black font-mono text-[9px] block">CLOCK-IN TIME:</label>
                <div className="flex items-center gap-1.5 bg-slate-950 border border-cyan-500/15 rounded-xl px-2.5 py-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <input
                    type="number"
                    min={simSession === 'FN' ? '9' : '14'}
                    max={simSession === 'FN' ? '13' : '17'}
                    value={simHour}
                    onChange={(e) => setSimHour(Number(e.target.value))}
                    className="w-10 bg-transparent text-white font-bold font-mono focus:outline-none"
                  />
                  <span className="text-slate-500 font-bold">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={simMinute}
                    onChange={(e) => setSimMinute(Number(e.target.value))}
                    className="w-10 bg-transparent text-white font-bold font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SPOOF TELEMETRY INTERCEPT SWITCHES */}
            <div className="border border-cyan-500/10 bg-slate-950/80 p-3.5 rounded-xl space-y-2.5">
              <span className="text-[9px] font-black font-mono text-slate-500 block uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#00f2ff]" />
                ANTI-SPOOF FRAUD SIMULATORS
              </span>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10.5px]">VPN Routing Spoof</span>
                <button
                  type="button"
                  onClick={() => setVpnSpoof(!vpnSpoof)}
                  className={`px-2.5 py-1 text-[9px] font-bold rounded font-mono ${
                    vpnSpoof ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  {vpnSpoof ? 'ACTIVE' : 'DEACTIVE'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10.5px]">Device OS Signature Spoof</span>
                <button
                  type="button"
                  onClick={() => setDeviceSpoof(!deviceSpoof)}
                  className={`px-2.5 py-1 text-[9px] font-bold rounded font-mono ${
                    deviceSpoof ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  {deviceSpoof ? 'ACTIVE' : 'DEACTIVE'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10.5px]">Fake GPS coordinates</span>
                <button
                  type="button"
                  onClick={() => setGpsSpoof(!gpsSpoof)}
                  className={`px-2.5 py-1 text-[9px] font-bold rounded font-mono ${
                    gpsSpoof ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  {gpsSpoof ? 'ACTIVE' : 'DEACTIVE'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#00f2ff] hover:bg-[#5eecff] text-slate-950 font-black font-mono py-2.5 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              Clock-In Simulated Session
            </button>
          </form>
        </div>

        {/* HOD / ADMINISTRATION EXTREME OVERRIDES BLOCK */}
        <div className="bg-[#0b1226]/80 border border-cyan-500/10 rounded-2xl p-6 shadow-xl text-left relative">
          <h3 className="text-sm font-black text-rose-500 font-orbitron uppercase tracking-wider mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            HOD / ACADEMIC OVERRIDE DECK
          </h3>
          <p className="text-[10px] text-slate-500 font-mono mb-4">Manual repairs, audit interventions, and streak preservation controls.</p>

          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold block uppercase text-[9px]">CRITICAL OPERATOR SELECTION:</label>
              <select
                value={auditUser}
                onChange={(e) => setAuditUser(Number(e.target.value))}
                className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-1.5 text-white"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} (UID: {u.idNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* TAB-STYLE ACTIONS FOR ADMINISTRATIVE INTERVENE */}
            <div className="border border-cyan-500/10 rounded-xl p-3 bg-slate-950/40 space-y-3.5">
              
              {/* ACTION 1: REPAIR ATTENDANCE NODES */}
              <div className="space-y-1 text-left">
                <span className="text-[9.5px] font-bold text-slate-400 block uppercase">Manual Grid Reconstruction:</span>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={auditDate}
                    onChange={(e) => setAuditDate(e.target.value)}
                    className="bg-slate-950 text-white px-2 py-1 rounded text-[11px] border border-cyan-500/10 w-28"
                  />
                  <select
                    value={auditFN}
                    onChange={(e) => setAuditFN(e.target.value)}
                    className="bg-slate-950 text-white px-1.5 py-1 rounded text-[10px] border border-cyan-500/10"
                  >
                    <option value="PRESENT">FN PRESENT</option>
                    <option value="ABSENT">FN ABSENT</option>
                    <option value="APPROVED_LEAVE">FN LEAVE</option>
                  </select>
                  <select
                    value={auditAN}
                    onChange={(e) => setAuditAN(e.target.value)}
                    className="bg-slate-950 text-white px-1.5 py-1 rounded text-[10px] border border-cyan-500/10"
                  >
                    <option value="PRESENT">AN PRESENT</option>
                    <option value="ABSENT">AN ABSENT</option>
                    <option value="APPROVED_LEAVE">AN LEAVE</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleHODRepair}
                  className="mt-1 pb-0.5 bg-cyan-900/30 hover:bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold px-2.5 py-1 rounded text-[10px] uppercase w-full text-center"
                >
                  Overwrite Records Ledger
                </button>
              </div>

              {/* ACTION 2: STREAK RESTORATIVE */}
              <div className="space-y-1 text-left border-t border-cyan-500/5 pt-2.5">
                <span className="text-[9.5px] font-bold text-slate-400 block uppercase">Continuous Streak Reconstruction:</span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={auditStreakRestore}
                    onChange={(e) => setAuditStreakRestore(Math.max(0, Number(e.target.value)))}
                    className="bg-slate-950 text-white px-2 py-1 rounded text-[11px] border border-cyan-500/10 w-20 font-bold font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleHODRestoreStreak}
                    className="flex-1 bg-cyan-900/30 hover:bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold px-2 rounded text-[10px] uppercase text-center"
                  >
                    Force Reset Streak
                  </button>
                </div>
              </div>

              {/* ACTION 3: CONFER HONOR STARS & DECORATION PURGING */}
              <div className="space-y-1.5 text-left border-t border-cyan-500/5 pt-2.5">
                <span className="text-[9.5px] font-bold text-slate-400 block uppercase">Manual Awards Allocation:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleHODGrantHonor}
                    className="bg-amber-950/40 hover:bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold px-2.5 py-1 rounded text-[10px] uppercase text-center flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> CONF. HON. STAR
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBadgeToRemove('Elite Attendance');
                      handleHODPurgeBadge();
                    }}
                    className="bg-rose-950/30 hover:bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold px-2.5 py-1 rounded text-[10px] uppercase text-center flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> PURGE BADGE
                  </button>
                </div>
              </div>

              {/* ACTION 4: REPUTATION ADJUSTER */}
              <div className="space-y-1 text-left border-t border-cyan-500/5 pt-2.5">
                <span className="text-[9.5px] font-bold text-slate-400 block uppercase">Reputation Overrule Index (%):</span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={auditRepScore}
                    onChange={(e) => setAuditRepScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="bg-slate-950 text-white px-2 py-1 rounded text-[11px] border border-cyan-500/10 w-20 font-bold font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleHODOverrideRep}
                    className="flex-1 bg-[#120404] hover:bg-rose-500/15 border border-rose-500/20 text-rose-400 font-bold px-2 rounded text-[10px] uppercase text-center"
                  >
                    Mutate Reputation Score
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
