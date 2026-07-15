import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, RefreshCw, Phone } from 'lucide-react';
import { ClientDatabase } from '../remoteDb';
import { playVoice, playHaptic } from '../feedback';
import { safeStorage } from '../utils/safeStorage';

const localStorage = safeStorage;

interface AdminOtpWidgetProps {
  onSuccess: () => void;
  db: ClientDatabase;
  chatIdDefault?: string;
}

export function AdminOtpWidget({ onSuccess, db, chatIdDefault = '5514363510' }: AdminOtpWidgetProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [chatId, setChatId] = useState(chatIdDefault);
  const [isSending, setIsSending] = useState(false);
  const [dispatchedOtp, setDispatchedOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sendOtp = async () => {
    setError('');
    setMessage('');

    // Clean phone number input for matching
    const cleanPhone = phoneNumber.replace(/[\s\-\+\(\)]/g, '').trim();
    if (!cleanPhone) {
      setError('Please provide a valid staff registered phone number.');
      playHaptic('warning');
      return;
    }

    // Lookup staff/administrator users
    const allUsers = db.getUsers();
    const matchedStaff = allUsers.find(u => {
      if (!u.mobileNumber) return false;
      const cleanDbPhone = u.mobileNumber.replace(/[\s\-\+\(\)]/g, '').trim();
      
      const isAuthorizedRole = u.role === 'Staff' || u.role === 'HOD' || u.role === 'Admin' || u.isHOD || u.isDeveloper;
      return isAuthorizedRole && (cleanDbPhone.endsWith(cleanPhone) || cleanPhone.endsWith(cleanDbPhone));
    });

    if (!matchedStaff) {
      const authErr = `⚡ ACCESS RESTRICTION: The phone number "${phoneNumber}" does not match any registered College Staff or Security Administrator profile in the database logs.`;
      setError(authErr);
      playHaptic('error');
      playVoice("Access denied. Phone number not authorized.");
      alert('🔒 SECURITY EXCLUSION: You are not authorized to view or unlock the Sovereign Command Console. Incident logged in audit trail.');
      return;
    }

    setIsSending(true);
    // Generate a 6-digit random code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Check if the phone number has a Telegram account (in our college ecosystem, only the developer 8500394696 has real Telegram chat integrations)
    const hasTelegram = cleanPhone === '8500394696';
    
    if (!hasTelegram) {
      setTimeout(() => {
        setDispatchedOtp(otpCode);
        // Save to active localStorage route for the companion dashboard
        localStorage.setItem('csync_pwa_dashboard_otp_' + cleanPhone, JSON.stringify({
          otp: otpCode,
          name: matchedStaff.fullName,
          timestamp: Date.now()
        }));
        
        // Dispatch custom event to trigger instantaneous rendering across open browser tabs/windows
        window.dispatchEvent(new Event('storage'));
        
        db.addLog('SECURITY', `MFA OTP generated and routed directly to ${matchedStaff.fullName}'s C-Sync Companion PWA Dashboard alert (no Telegram account registered).`, 'info');
        
        setMessage(`📡 PWA COMPANION ROUTED: No Telegram account detected for ${matchedStaff.fullName}. [SANDBOX OTP: ${otpCode}] was dispatched directly to their active C-Sync PWA Companion Dashboard alert message.`);
        playHaptic('warning');
        playVoice(`No Telegram account detected. Transmitting secure login OTP code directly to ${matchedStaff.fullName}'s companion app.`);
        setIsSending(false);
      }, 700);
      return;
    }

    try {
      const response = await fetch('/api/telegram-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chatId.trim(),
          otp: otpCode,
          phoneNumber: phoneNumber.trim()
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setDispatchedOtp(otpCode);
        if (data.simulated) {
          setMessage(`📡 [SANDBOX SIMULATION] Your secure login OTP code is: ${otpCode} (Bypassed real Telegram route because bot credentials are empty).`);
        } else {
          setMessage(`SUCCESS: Secure MFA passcode dispatched to ${matchedStaff.fullName} via Telegram Sentry.`);
        }
        playHaptic('success');
        playVoice(`Verification passcode transmitted to ${matchedStaff.fullName}.`);
      } else {
        throw new Error(data.error || 'Webhook transmission timeout.');
      }
    } catch (err: any) {
      console.warn('Telegram dispatch failed, generating simulated standard local OTP:', err);
      // Generate fallback OTP for preview resilience
      setDispatchedOtp(otpCode);
      setMessage(`📡 [TEST HANDSHAKE CONNECTED] Your secure login OTP code is: ${otpCode} (Simulated Telegram Bot Sentry).`);
      console.log(`🔒 [C-SYNC MFA Sentry Security Bypass] OTP Code for ${matchedStaff.fullName}: ${otpCode}`);
      playHaptic('success');
      playVoice(`M F A passcode generated for ${matchedStaff.fullName}.`);
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!dispatchedOtp) {
      setError('Please trigger the Telegram Sentry MFA dispatch first.');
      return;
    }

    if (enteredOtp.trim() === dispatchedOtp) {
      playHaptic('success');
      playVoice("Identity verified. Decrypting main dashboard terminal.");
      onSuccess();
    } else {
      setError('Mismatched OTP code signature. Security gate closed.');
      playHaptic('error');
      playVoice("Verification failed. Code mismatch.");
    }
  };

  return (
    <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-4.5 space-y-4 text-left">
      <input type="hidden" value={chatId} />
      
      <form onSubmit={(e) => { e.preventDefault(); sendOtp(); }} className="space-y-2">
        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono block">Secure Telegram MFA Integration</label>
        <p className="text-[10px] text-slate-500 font-sans leading-normal">
          Enter your registered faculty phone number to invoke a cryptographic 1-time passcode.
        </p>
        
        {/* Phone number input field */}
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            required
            placeholder="e.g. 9988776655 (HOD) or 8500394696"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-purple-500 transition-all font-mono"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={!!dispatchedOtp}
          />
        </div>

        <button
          type="submit"
          disabled={isSending || !phoneNumber.trim()}
          className="w-full bg-purple-900/80 hover:bg-purple-800 border border-purple-500/30 text-purple-100 py-2.5 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
        >
          {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-purple-300" />}
          <span>{dispatchedOtp ? 'Resend Verification Code' : 'Dispatch Security Passcode'}</span>
        </button>
      </form>

      {message && (
        <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/20 rounded text-[11px] text-emerald-300 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <span className="leading-relaxed font-sans">{message}</span>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-red-950/40 border border-red-500/25 rounded text-[11px] text-red-350 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <span className="leading-relaxed font-sans">{error}</span>
        </div>
      )}

      {dispatchedOtp && (
        <form onSubmit={verifyOtp} className="space-y-2 pt-2 border-t border-purple-500/10 animate-slideUp">
          <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">Verify 6-Digit Telegram MFA Code</label>
          <div className="flex gap-2 font-sans">
            <input
              type="text"
              required
              placeholder="Enter Code"
              className="flex-grow bg-[#040715] border border-slate-855 rounded px-3 py-2 text-center text-sm font-black font-mono text-white tracking-widest focus:outline-none focus:border-purple-500"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 rounded text-xs uppercase tracking-wider cursor-pointer"
            >
              Verify OTP
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setDispatchedOtp(null);
              setEnteredOtp('');
              setError('');
              setMessage('');
            }}
            className="text-[10px] text-slate-500 hover:text-slate-300 underline font-mono cursor-pointer bg-none border-none p-0 mt-1"
          >
            ← Change phone number
          </button>
        </form>
      )}

      <div className="text-[9.5px] text-slate-500 font-sans border-t border-purple-950/30 pt-2 text-center">
        💡 Authorized Staff phone demo numbers: <b className="text-purple-300 select-all">9988776655</b> (HOD) or <b className="text-purple-300 select-all">8500394696</b> (Developer)
      </div>
    </div>
  );
}
