import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldCheck, Heart, Volume2, Fingerprint, Activity, Zap, RefreshCw, Layers } from 'lucide-react';
import { playHaptic, playVoice } from '../feedback';
import { performNativeBiometricAuth } from '../utils/biometricVanilla';

interface BiometricHapticSandboxProps {
  onScanComplete?: (uid: string, entropy: number) => void;
}

export const BiometricHapticSandbox: React.FC<BiometricHapticSandboxProps> = ({ onScanComplete }) => {
  const [isPressing, setIsPressing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'authorized' | 'declined'>('idle');
  const [pulseCount, setPulseCount] = useState(72);
  const [synthFrequency, setSynthFrequency] = useState(440);
  const [synthesizerOctave, setSynthesizerOctave] = useState<number>(3);
  const [secEntropyCode, setSecEntropyCode] = useState('UNINITIALIZED');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synthesize custom synth chip blips
  const playPulseSynthesizerTone = (frequency: number, duration: number, type: 'sine' | 'square' | 'triangle' | 'sawtooth' = 'sine') => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now);
      // Soft wave frequency modulation
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + duration * 0.4);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.8, now + duration);

      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (_) {}
  };

  // Pulse rate fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPressing) {
        setPulseCount(prev => {
          const shift = Math.floor(Math.random() * 5) - 2;
          return Math.max(68, Math.min(115, prev + shift));
        });
      } else {
        setPulseCount(prev => {
          const shift = Math.floor(Math.random() * 3) - 1;
          return Math.max(60, Math.min(76, prev + shift));
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPressing]);

  // Handle live canvas particle rendering and sine waves
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // Draw high-tech background grids
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 12;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw custom biosensors wave traces
      const waveCount = isPressing ? 4 : 2;
      for (let index = 0; index < waveCount; index++) {
        ctx.beginPath();
        ctx.lineWidth = index === 0 ? 2 : 1;
        ctx.strokeStyle = isPressing 
          ? `rgba(6, 230, 255, ${0.8 - index * 0.2})` 
          : `rgba(16, 185, 129, ${0.4 - index * 0.15})`;
        
        const amplitude = isPressing ? (30 + index * 10) : (10 + index * 5);
        const frequency = isPressing ? (0.015 + index * 0.005) : 0.008;
        const speed = isPressing ? 0.22 : 0.06;

        for (let x = 0; x < w; x++) {
          const y = h / 2 + Math.sin(x * frequency + phase * speed - index * 0.5) * amplitude;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw biometric scanning beam overlay
      if (isPressing) {
        const beamY = (Math.sin(phase * 0.1) + 1) * 0.5 * h;
        ctx.strokeStyle = 'rgba(0, 242, 255, 0.25)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, beamY);
        ctx.lineTo(w, beamY);
        ctx.stroke();

        // Beam glowing bar
        const areaGradient = ctx.createLinearGradient(0, beamY - 4, 0, beamY + 4);
        areaGradient.addColorStop(0, 'rgba(0, 242, 255, 0)');
        areaGradient.addColorStop(0.5, 'rgba(0, 242, 255, 0.15)');
        areaGradient.addColorStop(1, 'rgba(0, 242, 255, 0)');
        ctx.fillStyle = areaGradient;
        ctx.fillRect(0, beamY - 4, w, 8);
      }

      phase += 1;
      requestRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPressing]);

  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsPressing(true);
    setScanState('scanning');
    setScanProgress(0);
    playHaptic('light');
    playVoice("Biometric contact achieved. Beginning cryptographic sweep.");
    playPulseSynthesizerTone(440, 0.35, 'sawtooth');

    // Smooth progress counter loop
    if (pressTimerRef.current) clearInterval(pressTimerRef.current);
    pressTimerRef.current = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(pressTimerRef.current!);
          setScanState('authorized');
          playHaptic('heavy');
          playVoice("Authentication verified.");

          // Instantiate beautiful native platform biometric handshake
          performNativeBiometricAuth("csync_haptic_participant")
            .then(res => {
              if (res.success) {
                console.log("[WebAuthn] Successfully authenticated via hardware node:", res.details);
                playVoice("Biometric signature locked to workstation ledger.");
              }
            })
            .catch(err => console.log("Native biometrics skipped or sandboxed, running standard secure fallback.", err));

          // Create random smart verification block
          const newCode = 'CSYNC-HAP-' + Math.random().toString(36).substring(3, 9).toUpperCase();
          setSecEntropyCode(newCode);

          playPulseSynthesizerTone(880, 0.5, 'triangle');
          if (onScanComplete) {
            onScanComplete(newCode, 99.87);
          }
          return 100;
        }
        // Emit continuous synthetic auditory heartbeats
        if (Math.floor(prev) % 15 === 0) {
          playPulseSynthesizerTone(440 + prev * 2, 0.08, 'sine');
        }
        return prev + 2.5;
      });
    }, 70);
  };

  const handlePressEnd = () => {
    setIsPressing(false);
    if (pressTimerRef.current) {
      clearInterval(pressTimerRef.current);
    }
    if (scanProgress < 100) {
      setScanState('idle');
      setScanProgress(0);
      playVoice("Biometric pipeline detached.");
    }
  };

  return (
    <div className="bg-[#05081a]/95 border border-[#00f2ff]/15 rounded-2xl p-4.5 shadow-[0_0_30px_rgba(0,242,255,0.03)] text-left space-y-4">
      
      {/* Element Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 rounded-xl">
            <Fingerprint className="w-5 h-5 animate-pulse text-[#00f2ff]" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#fafafa] uppercase tracking-wide">Crypto-Biometric Haptic Hub</h4>
            <p className="text-[8px] font-mono text-cyan-400/80 uppercase">Continuous entropy verification sandbox</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-black/50 px-2.5 py-1 rounded-full border border-white/5 font-mono text-[8.5px] uppercase">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>HB: {pulseCount} BPM</span>
        </div>
      </div>

      <p className="text-[10.5px] text-zinc-400 leading-relaxed font-sans">
        Inspired by biometric verification loops, press and hold the futuristic digital pad below. Dynamic sine oscillations monitor your local haptic pressure rate to compile custom security authorization tokens.
      </p>

      {/* Primary Interaction Sandbox grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Visual Oscillator Screen */}
        <div className="col-span-12 md:col-span-7 bg-[#02030d] border border-cyan-500/20 rounded-xl overflow-hidden relative h-[155px] flex flex-col items-center justify-center p-3">
          <canvas 
            ref={canvasRef} 
            width={340} 
            height={135} 
            className="w-full h-full absolute inset-0 opacity-85"
          />

          {/* Interactive readout */}
          <div className="absolute top-2 left-2 flex flex-col gap-0.5 pointer-events-none font-mono text-[7px] text-cyan-400/80 bg-slate-950/80 p-1.5 rounded border border-white/5 uppercase select-none">
            <span>Spectrum: Active SINE</span>
            <span>Freq: {isPressing ? synthFrequency + 250 : synthFrequency} Hz</span>
          </div>

          <div className="absolute bottom-2 right-2 pointer-events-none font-mono text-[7px] text-emerald-400 bg-slate-950/80 p-1.5 rounded border border-white/5 uppercase select-none">
            <span>Haptic Engine: active</span>
          </div>

          <AnimatePresence>
            {scanState === 'scanning' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="z-10 bg-[#020512]/95 border border-cyan-500/35 px-4 py-2.5 rounded-xl text-center font-mono space-y-1"
              >
                <div className="text-[10px] font-black text-cyan-400 animate-pulse">SWEEPING BIOMETRICS...</div>
                <div className="text-[12px] font-black font-orbitron text-white">{Math.floor(scanProgress)}%</div>
                <div className="w-32 h-1 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-cyan-400" style={{ width: `${scanProgress}%` }}></div>
                </div>
              </motion.div>
            )}

            {scanState === 'authorized' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="z-10 bg-emerald-950/80 border border-emerald-500/40 px-4 py-3 rounded-xl text-center font-mono"
              >
                <div className="flex items-center justify-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">VERIFICATION SUCCESS</span>
                </div>
                <div className="text-[10px] text-white font-extrabold mt-1 tracking-tight select-all">{secEntropyCode}</div>
                <button
                  onClick={() => setScanState('idle')}
                  className="mt-1.5 py-0.5 px-2 bg-white/5 hover:bg-white/10 text-slate-300 text-[8px] uppercase font-bold rounded cursor-pointer leading-dense border border-white/10"
                >
                  Reset Monitor
                </button>
              </motion.div>
            )}

            {scanState === 'idle' && (
              <div className="z-10 text-center pointer-events-none select-none font-mono text-[8.5px] text-slate-500 max-w-[200px] leading-relaxed uppercase tracking-wider backdrop-blur-xs px-2.5 py-1 rounded bg-black/40">
                Place and hold index finger on current haptic scanner trackpad
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Haptic Pressure Trigger Pad */}
        <div className="col-span-12 md:col-span-5 flex flex-col justify-between">
          
          {/* Active touchpad node */}
          <div 
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            className={`w-full h-[110px] rounded-xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer select-none relative overflow-hidden ${
              isPressing 
                ? 'border-[#00f2ff] bg-cyan-950/20 shadow-[0_0_20px_rgba(0,242,255,0.15)] scale-[0.985]' 
                : 'border-cyan-500/20 bg-slate-950/60 hover:border-cyan-500/35 hover:bg-slate-950/90 hover:scale-[1.005]'
            }`}
          >
            {/* Ambient ripple ring when pressing */}
            {isPressing && (
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 animate-pulse pointer-events-none"></div>
            )}

            <Fingerprint className={`w-12 h-12 transition-all ${isPressing ? 'text-cyan-400 scale-110 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-[9.5px] font-mono font-bold mt-2 uppercase tracking-wide">
              {isPressing ? 'CONTACT VERIFIED' : 'PRESS AND HOLD TARGET'}
            </span>
            <span className="text-[7px] text-slate-500 uppercase font-mono mt-0.5">
              Haptic Simulator pad
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-black/30 border border-white/5 p-1.5 rounded-lg text-center">
              <span className="text-[7px] text-slate-500 font-mono block uppercase">SYNTH OCTAVE</span>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <button 
                  onClick={() => setSynthesizerOctave(prev => Math.max(1, prev - 1))}
                  className="px-1 bg-white/5 hover:bg-white/10 active:scale-90 rounded border border-white/10 text-[8.5px] cursor-pointer"
                >
                  -
                </button>
                <span className="text-[9px] font-bold font-mono text-cyan-400">OCT_{synthesizerOctave}</span>
                <button 
                  onClick={() => setSynthesizerOctave(prev => Math.min(6, prev + 1))}
                  className="px-1 bg-white/5 hover:bg-white/10 active:scale-90 rounded border border-white/10 text-[8.5px] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                playPulseSynthesizerTone(554, 0.45, 'sawtooth');
                playHaptic('tap');
                playVoice("Recalibrating haptic biosensors array...");
                setSynthFrequency(prev => prev === 440 ? 554 : 440);
                setScanState('idle');
                setScanProgress(0);
              }}
              className="bg-black/30 hover:bg-[#071329]/40 border border-white/5 hover:border-cyan-500/20 p-2 rounded-lg text-center cursor-pointer transition flex flex-col items-center justify-center"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#00f2ff] animate-spin" style={{ animationDuration: '4s' }} />
              <span className="text-[7.5px] text-slate-300 font-mono uppercase font-bold mt-1">Recalibrate Sensors</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
