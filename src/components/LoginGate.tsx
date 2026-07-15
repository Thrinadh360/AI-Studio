import React, { useState } from 'react';
import { Shield, Key, User, Lock, AlertCircle, Sparkles, Mail } from 'lucide-react';
import { ClientDatabase } from '../remoteDb';
import { User as DatabaseUser } from '../types';

interface LoginGateProps {
  portalType: 'pwa' | 'kiosk' | 'shell' | 'admin';
  onSuccess: (user?: DatabaseUser) => void;
  telegramOtpSection?: React.ReactNode; // Optional real-time Telegram OTP widget for Admin
  db: ClientDatabase;
}

export function LoginGate({ portalType, onSuccess, telegramOtpSection, db }: LoginGateProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = username.trim().toLowerCase();

    if (portalType === 'pwa') {
      // Student PWA Email & Password Authentication
      const foundUser = db.getUsers().find(usr => 
        (usr.email?.toLowerCase() === cleanEmail || usr.mobileNumber === cleanEmail || usr.idNumber?.toLowerCase() === cleanEmail) && 
        usr.password === password
      );

      if (foundUser) {
        onSuccess(foundUser);
      } else {
        // Fallback to mock student credentials if user db doesn't match
        if ((cleanEmail === 'student@gdc.edu' || cleanEmail === '230105@gdc.edu') && password === 'csync23') {
          onSuccess();
        } else if (cleanEmail === '' || password === '') {
          setError('Please complete all student fields');
        } else {
          setError('Invalid Email or Student password. Try (Email: student@gdc.edu, Pass: csync23)');
        }
      }
    } else if (portalType === 'kiosk') {
      // Workstation Kiosk Lockscreen PIN
      const foundUser = db.getUsers().find(usr => usr.password === password);
      if (password === '5786' || foundUser) {
        onSuccess(foundUser);
      } else {
        setError('Access Denied: Invalid Workstation Station PIN.');
      }
    } else if (portalType === 'shell') {
      // WPF Windows Shell Wrapper Key
      if (password === 'shelladmin') {
        onSuccess();
      } else {
        setError('Shell Intercepted: Invalid low-level root access key.');
      }
    } else if (portalType === 'admin') {
      // Admin dashboard direct password/username verification
      // Match against users in the remote database having 'Admin' role or isDeveloper flag
      const foundAdmin = db.getUsers().find(usr => 
        (usr.email?.toLowerCase() === cleanEmail || usr.mobileNumber === cleanEmail || usr.idNumber?.toLowerCase() === cleanEmail) && 
        usr.password === password &&
        (usr.role === 'Admin' || usr.isDeveloper)
      );

      if (foundAdmin) {
        onSuccess(foundAdmin);
      } else {
        // Direct backup/emergency passcodes
        if (password === 'vskadmin123' || password === 'm3nadh' || password === 'gdc-csync-admin') {
          onSuccess();
        } else {
          setError('Access Denied: Invalid Admin email/ID or master security passcode.');
        }
      }
    }
  };

  const titles = {
    pwa: {
      name: 'Student Check-In Portal',
      desc: 'Dr. V.S. Krishna GDC (A) Web Attendance Client',
      badge: 'Academic Network Check-In',
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400'
    },
    kiosk: {
      name: 'Workstation Terminal Lockscreen',
      desc: 'C# Native Shell & Computer Usage Timesheet Sentry',
      badge: 'Hardware Locked Console',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400'
    },
    shell: {
      name: 'WPF Desktop Wrapper Emulator',
      desc: 'System Registry Hook Interceptor & CPU Telemetry Engine',
      badge: 'Low-Level Core Hook Active',
      color: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400'
    },
    admin: {
      name: 'Central Security Supervisor Cockpit',
      desc: 'Sovereign Database Terminal & Geofence Commander',
      badge: 'Sovereign Level-1 Node',
      color: 'from-purple-500/20 to-fuchsia-500/10 border-purple-500/30 text-purple-400'
    }
  };

  const portal = titles[portalType];

  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-950/80 border border-slate-900 rounded-2xl relative overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.8)] backdrop-blur-md">
        {/* Top styling accent background line */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${
          portalType === 'pwa' ? 'from-cyan-500 to-blue-600' :
          portalType === 'kiosk' ? 'from-amber-400 to-orange-500' :
          portalType === 'shell' ? 'from-pink-500 to-rose-600' :
          'from-purple-500 to-[#00f2ff]'
        }`} />

        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border bg-slate-900/80 ${portal.color}`}>
              <Shield className="w-2.5 h-2.5" />
              <span>{portal.badge}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron uppercase tracking-normal mt-1.5 leading-snug">
              {portal.name}
            </h2>
            <p className="text-xs text-slate-400 leading-normal max-w-sm mx-auto">
              {portal.desc}
            </p>
          </div>

          {/* Render real Telegram code verification widget if it's Admin AND we want to offer live OTP */}
          {portalType === 'admin' && telegramOtpSection && (
            <div className="space-y-4 pt-1">
              <div className="bg-purple-950/20 border border-purple-500/25 rounded-xl p-3 text-left">
                <span className="text-[10px] font-bold text-purple-300 font-orbitron block mb-1 uppercase">Option A: Telegram Sentry MFA Verification</span>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  Obtain a dynamic 1-time session passcode sent directly to your registered Telegram device.
                </p>
              </div>
              {telegramOtpSection}
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-900"></div>
                </div>
                <span className="relative bg-[#02040d] px-3 text-[10px] font-bold text-slate-500 uppercase font-mono">OR USE ACCESS KEY</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/25 rounded-xl text-red-300 text-xs flex items-start gap-2 animate-shake text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {(portalType === 'pwa' || portalType === 'admin') && (
              <div className="space-y-1 text-left">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  {portalType === 'admin' ? 'Admin Email / ID / Mobile' : 'Registered Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder={portalType === 'admin' ? 'e.g. marukondathrinadh@gmail.com' : 'e.g. student@gdc.edu'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-mono"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1 text-left">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                {portalType === 'pwa' ? 'Student Password' :
                 portalType === 'kiosk' ? 'Station Lock PIN (4-digit)' :
                 portalType === 'shell' ? 'System Key Hook Root Access Key' :
                 'Admin Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder={portalType === 'pwa' ? 'e.g. csync23' :
                               portalType === 'kiosk' ? 'PIN Code' :
                               portalType === 'shell' ? 'Root Security Token' :
                               'Enter password'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-mono"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                portalType === 'pwa' ? 'bg-cyan-600 hover:bg-cyan-500 text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]' :
                portalType === 'kiosk' ? 'bg-amber-600 hover:bg-amber-500 text-white hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]' :
                portalType === 'shell' ? 'bg-pink-600 hover:bg-pink-500 text-white hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]' :
                'bg-purple-600 hover:bg-purple-500 text-white hover:shadow-[0_0_15px_rgba(147,51,234,0.3)]'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Authorize Subsystem Connection</span>
            </button>
          </form>

          <div className="pt-2 text-center text-[10px] text-slate-500 font-sans border-t border-slate-900">
            {portalType === 'pwa' && <span>Suggested Access: <b>student@gdc.edu</b> / <b>csync23</b> (or use your remote DB registered credentials)</span>}
            {portalType === 'kiosk' && <span>Official multi-user terminal lock. Admin validation token required.</span>}
            {portalType === 'shell' && <span>Direct hardware abstraction interface. Root credential required.</span>}
            {portalType === 'admin' && <span>Admin login: Use your registered Admin credentials (e.g., <b>marukondathrinadh@gmail.com</b>)</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
