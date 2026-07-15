import React, { useState, useEffect } from 'react';
import { Play, Pause, AlertTriangle, Cpu, Command, Shield, Wifi, RefreshCw, Key, Mic } from 'lucide-react';
import { ClientDatabase } from '../remoteDb';

interface ModuleAProps {
  db: ClientDatabase;
  onRefreshAll: () => void;
}

export const ModuleA: React.FC<ModuleAProps> = ({ db, onRefreshAll }) => {
  const [device, setDevice] = useState(db.getStationDevice());
  const [isShellBypassed, setIsShellBypassed] = useState(false);
  const [showNativeInput, setShowNativeInput] = useState(false);
  const [bypassInput, setBypassInput] = useState('');
  const [bypassStatus, setBypassStatus] = useState<string | null>(null);

  const stations = db.getStations();
  const currentStationInfo = db.getStation(device?.stationId || 'CS-01');

  const [hookLogs, setHookLogs] = useState<string[]>([]);

  // Push initial logs on load once currentStationInfo is available
  useEffect(() => {
    setHookLogs([
      'WPF Hook: SetWindowsHookEx registered WH_KEYBOARD_LL successfully.',
      `WebView2: Injected window.HW_ID = "${currentStationInfo?.pcMacAddress || 'Pending First Run'}"`,
      'Security: Blocked OS Meta Key (0x5B/0x5C) interaction.',
      'Security: Blocked Task Manager Registry key check.',
    ]);
  }, [currentStationInfo?.pcMacAddress]);

  const addHookLog = (msg: string) => {
    setHookLogs(prev => [msg, ...prev.slice(0, 10)]);
  };

  const handleStationSelectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    db.setStationDevice(sId);
    setDevice(db.getStationDevice());
    addHookLog(`Pivot: Switched Native Emulator hardware target to ${sId}.`);
    onRefreshAll();
  };

  const handleKeyPressBypass = (key: string) => {
    if (key === 'Ctrl+T') {
      setShowNativeInput(true);
      setBypassStatus(null);
      addHookLog('KeyboardHook: Caught Ctrl+T native bypass combination.');
    }
  };

  const processBypassCheck = () => {
    if (bypassInput === 'Thrinadh') {
      setIsShellBypassed(true);
      setBypassStatus('Authorized!');
      addHookLog('Security: "Thrinadh" credential matched. Restoring explorer.exe. Shutting down wrapper.');
      db.addLog('SECURITY', 'Global C# Bypass trigger match! Restoring native shell explorer.exe desktop.', 'success');
      setShowNativeInput(false);
      onRefreshAll();
    } else {
      setBypassStatus('Access Denied: Invalid Key');
      addHookLog(`Security Fault: Bypass attempt with invalid sequence "${bypassInput}".`);
      db.addLog('SECURITY', `Intruder Alert: Failed WPF global bypass attempt with keyword: "${bypassInput}"`, 'error');
    }
    setBypassInput('');
  };

  const resetShell = () => {
    setIsShellBypassed(false);
    setShowNativeInput(false);
    setBypassStatus(null);
    addHookLog('Shell: Hook re-attached. Native taskbar hidden.');
  };

  return (
    <div className="glass-panel rounded-xl p-5 relative overflow-hidden shadow-xl backdrop-blur-md">
      {/* Glow highlight */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Grid header */}
      <div className="flex items-center justify-between mb-4 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-[#00f2ff]">
            <Command className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-[#00f2ff] uppercase font-orbitron">Native Workstation WPF Shell Integration</h2>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">Simulates C# WebView2 background service (CSyncStation.exe)</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isShellBypassed ? 'bg-amber-400' : 'bg-green-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isShellBypassed ? 'bg-amber-500' : 'bg-green-500'}`}></span>
          </span>
          <span className="text-[10px] text-slate-300 font-mono ml-1 uppercase font-semibold">
            {isShellBypassed ? 'Shell Bypassed' : 'Shell Mode Locked'}
          </span>
        </div>
      </div>

      {/* Hardware selection binding simulated selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
          <label className="block text-[10px] text-cyan-400 font-mono uppercase font-semibold mb-1 tracking-wider">
            1. Select Hardcoded Workstation Target
          </label>
          <div className="flex items-center gap-2">
            <select
              value={device?.stationId}
              onChange={handleStationSelectorChange}
              className="bg-[#020617] border border-cyan-500/35 text-white text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 font-sans flex-1"
            >
              {stations.map(s => (
                <option key={s.stationId} value={s.stationId}>
                  {s.stationId} ({s.pcMacAddress})
                </option>
              ))}
            </select>
          </div>
          <p className="text-[9px] text-slate-400 font-sans mt-1">
            Simulates opening CSyncStation on a specific physical PC.
          </p>
        </div>

        <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-cyan-400 font-mono uppercase font-semibold tracking-wider">Injected Web Environment Bind:</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                Active
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-300">
              <span>window.HW_ID</span>
              <span className="text-cyan-300 font-medium">{device?.pcMacAddress}</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] font-mono text-cyan-400 bg-cyan-950/25 px-2 py-0.5 rounded flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 flex-shrink-0" />
            <span>explorer.exe suspended via low level lock</span>
          </div>
        </div>
      </div>

      {/* Main interactive panel */}
      <div className="bg-[#020617]/95 rounded-lg border border-cyan-500/25 p-4 min-h-[160px] flex flex-col justify-between">
        
        {/* If bypassed */}
        {isShellBypassed ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500 mb-2 animate-bounce" />
            <h3 className="text-sm font-semibold text-white font-orbitron">EXPLORER.EXE RESTORED SUCCESSFULLY</h3>
            <p className="text-[11px] text-slate-400 max-w-sm mt-1">
              OS system shell loaded. Host desktop environment is now unlocked. C# overlay window closed. Click below to lock again.
            </p>
            <button
              onClick={resetShell}
              className="mt-4 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-mono font-bold tracking-wider transition-colors uppercase border border-cyan-400 shadow-[0_0_15px_rgba(0,242,255,0.3)]"
            >
              Recheck & Engage WPF Shell
            </button>
          </div>
        ) : (
          /* Normal Locked State */
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-mono mb-2">
              <span className="flex items-center gap-1 text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Key Hook Interceptors:
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-950/50 px-1.5 py-0.5 rounded tracking-wider">
                LOW_LEVEL_HOOK
              </span>
            </div>

            {/* Simulated Keyboard triggers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <button
                onClick={() => addHookLog('KeyboardHook: Consumed OS Meta Key event.')}
                className="bg-white/5 hover:bg-white/10 border border-white/5 text-left px-2 py-1.5 rounded transition text-[11px] text-slate-300 font-mono"
              >
                Press OS Meta Key
              </button>
              <button
                onClick={() => addHookLog('KeyboardHook: Blocked ALT+F4 window destruction request.')}
                className="bg-white/5 hover:bg-white/10 border border-white/5 text-left px-2 py-1.5 rounded transition text-[11px] text-slate-300 font-mono"
              >
                Press Alt+F4
              </button>
              <button
                onClick={() => addHookLog('KeyboardHook: Suppressed ALT+TAB system app traversal.')}
                className="bg-white/5 hover:bg-white/10 border border-white/5 text-left px-2 py-1.5 rounded transition text-[11px] text-slate-300 font-mono"
              >
                Press Alt+Tab
              </button>
              <button
                onClick={() => handleKeyPressBypass('Ctrl+T')}
                className="bg-cyan-950/80 border border-cyan-500/40 hover:bg-cyan-900/60 text-left px-2 py-1.5 rounded transition text-[11px] text-cyan-300 font-mono font-semibold relative animate-pulse"
              >
                Press Ctrl+T ⭐
              </button>
            </div>

            {/* Hidden Input field trigger (Ctrl+T bypass sequence) */}
            {showNativeInput && (
              <div className="bg-[#020617] border border-amber-500/40 p-3 rounded-lg mb-3 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-amber-500 text-xs font-mono font-bold mb-1 uppercase tracking-wide">
                  <Shield className="w-3.5 h-3.5" /> WPF LowLevel Bypass Active
                </div>
                <p className="text-[10px] text-slate-300 mb-2">
                  Enter master override credential to terminate lock and restore native shell:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bypassInput}
                    onChange={(e) => setBypassInput(e.target.value)}
                    placeholder="Hint: Developer first name (see footer)"
                    onKeyDown={(e) => e.key === 'Enter' && processBypassCheck()}
                    className="bg-[#030712] text-white border border-cyan-500/40 rounded text-xs px-2 py-1 focus:outline-none focus:border-cyan-400 flex-1 font-mono"
                  />
                  <button
                    onClick={processBypassCheck}
                    className="bg-amber-600 hover:bg-amber-500 text-white rounded text-xs px-3 font-mono font-bold transition-all"
                  >
                    Authenticate
                  </button>
                </div>
                {bypassStatus && (
                  <p className="text-[10px] text-rose-400 font-mono mt-1.5 italic font-bold">
                    {bypassStatus}
                  </p>
                )}
              </div>
            )}

            {/* WPF Logs */}
            <div className="bg-[#020617] border border-cyan-500/20 p-2.5 rounded font-mono text-[10px] text-slate-400 h-28 overflow-y-auto mt-2">
              <span className="text-cyan-500 font-bold block mb-1">=== NATIVE EXECUTABLE OVERLAY SHELL LOGS ===</span>
              {hookLogs.map((log, index) => (
                <div key={index} className="truncate select-none py-0.5 border-b border-cyan-950/10 last:border-b-0">
                  <span className="text-slate-600 font-medium mr-1.5">{new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                  <span className={log.includes('mismatch') || log.includes('mismatch') || log.includes('Fault') ? 'text-rose-400 font-medium' : log.includes('matched') ? 'text-green-400 font-bold' : 'text-slate-300'}>
                    {log}
                  </span>
                </div>
              ))}
            </div>

            {/* Syska Voice Coprocessor Node */}
            <div className="mt-3 bg-purple-950/20 border border-purple-500/25 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-950 border border-purple-500/30 text-purple-400 animate-pulse">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-[9px] font-mono uppercase tracking-wider text-purple-300 font-bold">Admin Transceiver: hey syska</span>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">Linked directly to centralized Syska voice listeners.</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    const ev = new CustomEvent('syska-remote-command', { detail: { text: 'Hey Syska, status report' } });
                    window.dispatchEvent(ev);
                  }}
                  className="px-2 py-1 bg-purple-900/30 hover:bg-purple-800/40 border border-purple-500/30 text-[#b063ff] hover:text-white rounded font-mono text-[9px] uppercase cursor-pointer"
                >
                  🗣️ Status Report
                </button>
                <button
                  onClick={() => {
                    const ev = new CustomEvent('syska-remote-command', { detail: { text: 'Hey Syska, run audit' } });
                    window.dispatchEvent(ev);
                  }}
                  className="px-2 py-1 bg-purple-900/30 hover:bg-purple-800/40 border border-purple-500/30 text-[#b063ff] hover:text-white rounded font-mono text-[9px] uppercase cursor-pointer"
                >
                  🔍 Run Audit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
