import React, { useState } from 'react';
import { Send, ShieldAlert, Sparkles, AlertCircle, CheckCircle, Radio, Calendar, Flame, Clock, Bell, Trash2 } from 'lucide-react';
import { CsyncTelegramNet } from './CsyncTelegramNet';
import { User, AppNotification } from '../types';
import { playVoice, playHaptic } from '../feedback';

interface ParentHubProps {
  db: any;
  activeStudent: User;
  handleMobileLogout: () => void;
  onRefreshAll: () => void;
}

export const ParentHub: React.FC<ParentHubProps> = ({ db, activeStudent, handleMobileLogout, onRefreshAll }) => {
  const [notificationTab, setNotificationTab] = useState<'all' | 'unread'>('all');

  const child = db.getUsers().find((u: User) => 
    (u.idNumber && activeStudent.linkedStudentId && u.idNumber.toLowerCase() === activeStudent.linkedStudentId.toLowerCase()) ||
    (u.fullName && activeStudent.linkedStudentId && u.fullName.toLowerCase().includes(activeStudent.linkedStudentId.toLowerCase()))
  );

  const holidays = [
    { date: '2026-06-15', title: 'Monsoon Break / Precautionary Holiday', status: 'Active Alert' },
    { date: '2026-06-29', title: 'Eid-al-Adha Break', status: 'Declared' },
    { date: '2026-08-15', title: 'Independence Day Institutional General Holiday', status: 'Declared' }
  ];

  // Fetch live system / parent PWA notifications from the shared store
  const allNotifications: AppNotification[] = db.getNotifications() || [];
  const parentNotifications = allNotifications.filter(n => 
    n.title.toLowerCase().includes('absent') || 
    n.title.toLowerCase().includes('holiday') || 
    n.title.toLowerCase().includes('parent') ||
    n.title.toLowerCase().includes('ward') ||
    n.message.toLowerCase().includes(child?.fullName?.toLowerCase() || 'never_match')
  );

  const displayedNotifs = notificationTab === 'unread' 
    ? parentNotifications.filter(n => !n.read) 
    : parentNotifications;

  // Simulate Forenoon 11:15 AM Automated Check
  const triggerFNCheck = () => {
    if (!child) {
      alert("Error: No linked student ward has been identified to audit.");
      return;
    }
    
    playHaptic('heavy');
    const todayStr = new Date().toISOString().split('T')[0];
    const history = child.attendanceHistory || [];
    const todayRecord = history.find((h: any) => h.date === todayStr);
    
    const isPresent = todayRecord && (todayRecord.fnStatus === 'PRESENT' || todayRecord.fnStatus === 'PRESENT_FN_ONLY');
    const isHolidayOrLeave = todayRecord && (todayRecord.fnStatus === 'APPROVED_LEAVE' || todayRecord.fnStatus === 'HOLIDAY');

    if (isPresent) {
      const msg = `Verified Ward Presence: ${child.fullName} checked-in at workstation CS-01 at ${todayRecord.fnArrival || '09:42 AM'}. No absent alert sent.`;
      
      db.addNotification(
        "✅ Forenoon Biometric Verified", 
        `Ward ${child.fullName} is confirmed PRESENT inside digital campus grids at 11:15 AM. Timestamp: ${todayRecord.fnArrival || '09:42 AM'}.`, 
        "system",
        child.photoBlob
      );
      playVoice(`Attendance verified. Ward ${child.fullName} is safe and present at their assigned workstation.`);
      alert("Forenoon check-in verified. Parent system notification dispatched.");
    } else if (isHolidayOrLeave) {
      db.addNotification(
        "📅 Ward Leave Registered", 
        `Official leave index is active for ${child.fullName} today. No check needed. Status: ${todayRecord.fnStatus}.`, 
        "system",
        child.photoBlob
      );
      playVoice(`Institutional leave approved today for ${child.fullName}. Biometric requirement waived.`);
      alert("Leave exception checked. Notification placed into PWA register.");
    } else {
      // Marked ABSENT
      const description = `🚨 ABSENT WARNING at 11:15 AM: Ward ${child.fullName} has failed to scan their digital ID or biometric QR at their assigned station for the Forenoon session. Immediate action advised.`;
      
      // Dispatch PWA notification
      db.addNotification(
        "🚨 FORENOON ABSENT WARNING", 
        description, 
        "alert", 
        child.photoBlob
      );
      
      // Dispatch Telegram Sentry
      db.sendTelegramParentAlert(
        child.idNumber, 
        'ABSENT', 
        `AUTOMATED AUDIT GATE [11:15 AM]: Ward ${child.fullName} is currently ABSENT from Forenoon academic classes (Date: 2026-06-03). Device geofence fingerprint logs are empty. Please check with your ward.`
      );
      
      playVoice(`Forenoon compliance alert! Ward ${child.fullName} is absent from workstation monitors at eleven fifteen. Dispatched Telegram notification to your phone.`);
      alert("11:15 AM check trigger absolute success: PWA push notification created & parental Telegram emergency dispatch broadcasted!");
    }
    
    onRefreshAll();
  };

  // Simulate Afternoon 3:00 PM Automated Check
  const triggerANCheck = () => {
    if (!child) {
      alert("Error: No linked student ward has been identified to audit.");
      return;
    }

    playHaptic('heavy');
    const todayStr = new Date().toISOString().split('T')[0];
    const history = child.attendanceHistory || [];
    const todayRecord = history.find((h: any) => h.date === todayStr);
    
    const isPresent = todayRecord && (todayRecord.anStatus === 'PRESENT' || todayRecord.anStatus === 'PRESENT_AN_ONLY');
    const isHolidayOrLeave = todayRecord && (todayRecord.anStatus === 'APPROVED_LEAVE' || todayRecord.anStatus === 'HOLIDAY');

    if (isPresent) {
      db.addNotification(
        "✅ Afternoon Biometric Verified", 
        `Ward ${child.fullName} is confirmed PRESENT for training at 3:00 PM. Lab session checked at ${todayRecord.anArrival || '02:15 PM'}.`, 
        "system",
        child.photoBlob
      );
      playVoice(`Attendance verified. Ward ${child.fullName} is present at university labs for afternoon session.`);
      alert("Afternoon check-in verified. Parent system notification dispatched.");
    } else if (isHolidayOrLeave) {
      db.addNotification(
        "📅 Ward Leave Registered", 
        `Official leave index is active for ${child.fullName} today. Status: ${todayRecord.anStatus}.`, 
        "system",
        child.photoBlob
      );
      playVoice(`Preserved leave exception verified today for ${child.fullName}.`);
      alert("Leave exception checked. Notification placed into PWA register.");
    } else {
      // Marked ABSENT
      const description = `🚨 AFTERNOON ABSENT WARNING at 3:00 PM: Student ward ${child.fullName} is declared ABSENT from active afternoon laboratories. Standard compliance audit failed.`;
      
      // Dispatch PWA notification
      db.addNotification(
        "🚨 AFTERNOON ABSENT WARNING", 
        description, 
        "alert", 
        child.photoBlob
      );
      
      // Dispatch Telegram Sentry
      db.sendTelegramParentAlert(
        child.idNumber, 
        'ABSENT', 
        `AUTOMATED AUDIT GATE [3:00 PM]: Ward ${child.fullName} is declared ABSENT for Afternoon session instruction. No biometrics recorded at institutional geofence nodes by three PM deadline.`
      );
      
      playVoice(`Afternoon compliance alert! Ward ${child.fullName} is absent from afternoon lecture sessions at three PM. Dispatched Parent Telegram alert.`);
      alert("3:00 PM check trigger absolute success: PWA push notification created & parental Telegram emergency dispatch broadcasted!");
    }
    
    onRefreshAll();
  };

  const clearAllLocalNotifications = () => {
    db.clearNotifications();
    playHaptic('light');
    alert("Parent PWA notification inbox cleared.");
    onRefreshAll();
  };

  const markAllAsRead = () => {
    db.markNotificationsAsRead();
    playHaptic('light');
    onRefreshAll();
  };

  return (
    <div className="flex-1 space-y-3 flex flex-col h-full overflow-y-auto pr-1">
      {/* Parent Header */}
      <div className="flex items-center justify-between border-b border-pink-500/20 pb-2 mb-1">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full border border-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.3)] overflow-hidden">
            <img
              src={activeStudent.photoBlob || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=100"}
              alt={activeStudent.fullName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="text-[11px] text-white font-bold flex items-center gap-1 font-sans">
              {activeStudent.fullName}
              <span className="text-[7.5px] border border-pink-500/30 bg-pink-950 text-pink-300 px-1 py-0.2 rounded uppercase font-mono font-bold">
                GUARDIAN CUSTODIAN
              </span>
            </div>
            <div className="text-[8.5px] text-slate-400 font-mono mt-0.5">
              C-SYNC Ecosystem Link ID: <span className="text-cyan-400 font-extrabold">{activeStudent.linkedStudentId || 'None'}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleMobileLogout}
          className="text-[8.5px] bg-[#270c17] hover:bg-[#3d0f22] text-rose-300 border border-rose-500/35 rounded px-2.5 py-1 uppercase font-mono font-bold transition-all cursor-pointer"
        >
          Logout
        </button>
      </div>

      {child ? (
        <div className="space-y-3">
          {/* Section A: Verified Ward Index Card */}
          <div className="bg-gradient-to-br from-[#021820] to-[#01050e] border border-cyan-500/30 p-3 rounded-xl space-y-2.5 relative overflow-hidden shadow-2xl">
            <span className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 font-mono text-[7px] uppercase px-1.5 py-0.5 rounded-bl font-black tracking-widest border-l border-b border-emerald-500/30">
              ⚡ COMPLIANCE NODE CONNECTED
            </span>
            
            <div className="flex items-start gap-2.5">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-cyan-500/30 bg-slate-900 flex-shrink-0">
                <img src={child.photoBlob || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
              </div>
              <div className="leading-tight">
                <h4 className="text-white text-xs font-bold font-sans uppercase">{child.fullName}</h4>
                <p className="text-[8.5px] font-mono text-slate-400 mt-0.5">Study Track: {child.subject || 'Computer Science'} | Batch: {child.batch || '2023'}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/25 px-1 py-0.2 rounded font-black uppercase">
                    Fingerprint OK
                  </span>
                  <span className="text-[8px] font-mono text-purple-400 bg-purple-900/10 border border-purple-500/20 px-1 py-0.2 rounded">
                    Level {child.level || 3}
                  </span>
                </div>
              </div>
            </div>

            {/* Grid metrics for parent updates */}
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5">
              <div className="bg-black/45 border border-white/5 p-2 rounded text-center">
                <span className="block text-[8px] text-slate-400 font-mono uppercase">Ward Status</span>
                <span className="block text-xs font-black text-cyan-300 mt-0.5 font-sans">
                  {child.attendanceHistory && child.attendanceHistory.find((h: any) => h.date === new Date().toISOString().split('T')[0])?.fnStatus === 'PRESENT' ? 'ACTIVE' : 'AUDIT PENDING'}
                </span>
              </div>
              <div className="bg-black/45 border border-white/5 p-2 rounded text-center">
                <span className="block text-[8px] text-slate-455 font-mono uppercase">Streak Loop</span>
                <span className="block text-xs font-black text-orange-400 mt-0.5 font-mono">{(child.streak ?? 0)} Days</span>
              </div>
              <div className="bg-black/45 border border-white/5 p-2 rounded text-center">
                <span className="block text-[8px] text-slate-400 font-mono uppercase">Device Trust</span>
                <span className="block text-xs font-black text-emerald-400 mt-0.5 font-mono">{(child.trust_score ?? 85)}%</span>
              </div>
            </div>
          </div>

          {/* Section B: Automated Sentry Scheduler Simulator (11:15 & 3:00 PM checks) */}
          <div className="bg-[#120824]/40 border border-pink-500/20 p-3 rounded-xl space-y-2.5 shadow-lg relative">
            <div className="absolute top-2.5 right-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
              <span className="text-[7.5px] font-mono text-pink-400 uppercase font-bold">Dynamic Watchdog</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-pink-400">
              <Clock className="w-3.5 h-3.5" />
              <h4 className="text-[9.5px] font-bold uppercase font-orbitron tracking-wider">Attendance Cron Sentry Simulation</h4>
            </div>
            <p className="text-[9.5px] text-slate-300 leading-relaxed font-sans">
              To guarantee bulletproof college attendance feedback, C-SYNC schedules strict autonomous evaluation checkpoints daily at specified intervals:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* Forenoon 11:15 AM Check */}
              <div className="bg-black/50 p-2.5 rounded-lg border border-pink-500/10 space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-white font-mono uppercase">Forenoon Check</span>
                    <span className="text-[8px] text-cyan-400 font-mono bg-cyan-950/40 px-1 py-0.2 rounded">11:15 AM</span>
                  </div>
                  <p className="text-[8.5px] text-slate-400 mt-1 font-sans">
                    Checks today's Forenoon attendance. Dispatches emergency alerts if biometric entry is missing by 11:15 AM.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={triggerFNCheck}
                  className="w-full mt-2 py-1 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-mono font-bold text-[8px] uppercase tracking-widest rounded transition-all active:scale-[0.97] cursor-pointer"
                >
                  🚀 Run 11:15 AM Audit Checklist
                </button>
              </div>

              {/* Afternoon 3:00 PM Check */}
              <div className="bg-black/50 p-2.5 rounded-lg border border-pink-500/10 space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-white font-mono uppercase">Afternoon Check</span>
                    <span className="text-[8px] text-pink-400 font-mono bg-pink-950/45 px-1 py-0.2 rounded">03:00 PM</span>
                  </div>
                  <p className="text-[8.5px] text-slate-400 mt-1 font-sans">
                    Checks today's Afternoon lab sessions. Dispatches alerts if inactive by the 3:00 PM deadline.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={triggerANCheck}
                  className="w-full mt-2 py-1 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-mono font-bold text-[8px] uppercase tracking-widest rounded transition-all active:scale-[0.97] cursor-pointer"
                >
                  🚀 Run 3:00 PM Audit Checklist
                </button>
              </div>
            </div>
          </div>

          {/* Section C: PWA IN-APP GUARDIAN NOTIFICATION DRAWER / PANEL */}
          <div className="bg-[#0b1021]/60 border border-cyan-500/20 p-3 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Bell className="w-3.5 h-3.5" />
                <h4 className="text-[9.5px] font-bold uppercase font-orbitron tracking-wider">PWA Guardian Alerts Inbox</h4>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[7.5px] text-slate-400 hover:text-white uppercase font-mono transition-colors"
                >
                  Mark read
                </button>
                <button
                  type="button"
                  onClick={clearAllLocalNotifications}
                  className="text-[7.5px] text-rose-400 hover:text-rose-300 uppercase font-mono flex items-center gap-0.5 transition-colors"
                >
                  <Trash2 className="w-2.5 h-2.5" /> Clear
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNotificationTab('all')}
                className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded ${notificationTab === 'all' ? 'bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/20' : 'text-slate-400 hover:text-white'}`}
              >
                All ({parentNotifications.length})
              </button>
              <button
                type="button"
                onClick={() => setNotificationTab('unread')}
                className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded ${notificationTab === 'unread' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                Unread ({parentNotifications.filter(n => !n.read).length})
              </button>
            </div>

            {/* Notification List Container */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {displayedNotifs.length === 0 ? (
                <div className="text-center py-5 text-slate-500 text-[8.5px] font-mono">
                  No notifications recorded in your parent PWA security logs.
                </div>
              ) : (
                displayedNotifs.map((n, i) => (
                  <div 
                    key={n.id || i} 
                    className={`p-2 rounded border transition-all text-left flex gap-2 items-start relative ${
                      n.read ? 'bg-black/25 border-white/5 opacity-70' : 'bg-[#1a0e28]/60 border-pink-500/25 shadow-[inset_0_0_8px_rgba(236,72,153,0.05)]'
                    }`}
                  >
                    {!n.read && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                    )}
                    <img 
                      src={n.avatar || child.photoBlob} 
                      className="w-6 h-6 rounded-full object-cover border border-[#00f2ff]/20 mt-0.5 flex-shrink-0" 
                      referrerPolicy="no-referrer" 
                      alt="" 
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8.5px] font-bold text-white uppercase font-sans">{n.title}</span>
                        <span className="text-[7px] text-slate-500 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="text-[8.5px] text-slate-350 leading-relaxed font-sans">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section D: Static Holidays Registry Carousel */}
          <div className="bg-[#040816] border border-[#102d41] p-3 rounded-xl space-y-2">
            <h4 className="text-[9px] font-bold text-white uppercase font-sans tracking-wide">Institutional Holidays Registry</h4>
            <div className="space-y-1">
              {holidays.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-[8.5px] bg-[#02050f] p-1.5 rounded border border-white/5 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-slate-300 font-bold">{h.date}</span>
                    <span className="text-slate-500">-</span>
                    <span className="text-white truncate max-w-44">{h.title}</span>
                  </div>
                  <span className="text-[7.5px] text-cyan-400 uppercase font-black">{h.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Unlinked account message and override instructions */
        <div className="bg-rose-950/30 border border-rose-500/25 p-4 rounded-xl space-y-3.5 text-center my-4 animate-fadeIn">
          <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto animate-bounce" />
          <h4 className="text-white text-xs font-bold uppercase font-space">WARD RECONCILIATION ABSENT</h4>
          <p className="text-[10px] text-slate-300 leading-relaxed font-sans max-w-xs mx-auto">
            No institutional record matching child roll number/name <span className="text-rose-300 font-mono font-bold">"{activeStudent.linkedStudentId || 'None'}"</span> was discovered in C-Sync database archives.
          </p>
          <div className="pt-2 border-t border-rose-500/10 text-left space-y-1.5">
            <span className="block text-[8px] text-amber-300 font-mono uppercase tracking-wider font-extrabold">💡 Self-Care Action Guides:</span>
            <div className="text-[8px] text-slate-450 font-sans leading-relaxed bg-black/40 p-2 rounded border border-white/5">
              To bind your ward's biometric feed, register using any valid student Roll Number in C-Sync database records (e.g. use <code className="text-cyan-300 select-all">8500394696</code>, <code className="text-cyan-300 select-all">student_thr</code>, or standard student accounts).
            </div>
          </div>
        </div>
      )}

      {/* Embedded Live Telegram Simulator Feed Panel */}
      <div className="bg-[#030611] border border-cyan-500/15 rounded-xl p-2.5 mt-2 flex-1 flex flex-col justify-between">
        <div className="text-[9.5px] text-white font-extrabold uppercase font-orbitron tracking-widest px-1 pb-1.5 flex items-center justify-between border-b border-white/5 mb-1.5">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            Guardian Telegram Channel Sentry Feed
          </span>
          <span className="text-[7.5px] text-emerald-400 animate-pulse font-mono flex items-center gap-0.5">● handshaking live</span>
        </div>
        
        <div className="h-44 rounded-lg overflow-hidden border border-white/5 bg-slate-950 relative">
          <CsyncTelegramNet db={db} onRefreshAll={onRefreshAll} overrideCurrentUser={activeStudent} />
        </div>
      </div>
    </div>
  );
};
