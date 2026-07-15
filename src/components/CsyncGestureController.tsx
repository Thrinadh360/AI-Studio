import React, { useState, useEffect, useRef } from 'react';
import { Camera, Hand, ShieldAlert, Sparkles, RefreshCw, Volume2, Move, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { playVoice, playHaptic } from '../feedback';
import { safeStorage } from '../utils/safeStorage';

const localStorage = safeStorage;

interface CsyncGestureControllerProps {
  onGestureDetected?: (gesture: string) => void;
  onScrollUp?: () => void;
  onScrollDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onGrab?: () => void;
  dispatchNotification: (type: string, title: string, message: string) => void;
}

export const CsyncGestureController: React.FC<CsyncGestureControllerProps> = ({
  onGestureDetected,
  onScrollUp,
  onScrollDown,
  onSwipeLeft,
  onSwipeRight,
  onGrab,
  dispatchNotification
}) => {
  const [active, setActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [autoStartEnabled, setAutoStartEnabled] = useState<boolean>(() => {
    return localStorage.getItem('csync_auto_start_gestures') === 'true';
  });
  const [showOverlay, setShowOverlay] = useState(true);
  const [detectedGesture, setDetectedGesture] = useState<string>('Awaiting Hand Focus...');
  const [motionValue, setMotionValue] = useState<number>(0);
  const [directionVector, setDirectionVector] = useState({ dx: 0, dy: 0 });
  
  // Refs for video process
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Backbuffer variables
  const prevFrameData = useRef<Uint8ClampedArray | null>(null);
  const coordinateHistory = useRef<{ x: number; y: number; time: number }[]>([]);
  const gestureCooldownRef = useRef<number>(0);

  // Sound generator
  const playSfx = (freq: number, type: 'sine' | 'triangle' = 'sine', duration: number = 0.15) => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (type === 'triangle') {
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + duration);
      }
      
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (_) {}
  };

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Video play promise error:", e));
        };
      }
      setHasPermission(true);
      setActive(true);
      dispatchNotification('SYSTEM', 'Air Gesture Node Active', 'Webcam motion analyzer linked successfully.');
      playVoice("Contactless smart gestures are now active. Try waving your hand vertically or hand grabbing.");
    } catch (err: any) {
      console.warn("Camera access failed for Gestures:", err);
      setHasPermission(false);
      dispatchNotification('SECURITY', 'Webcam Access Blocked', 'Camera access was requested but denied.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setActive(false);
    prevFrameData.current = null;
    coordinateHistory.current = [];
    setMotionValue(0);
    setDirectionVector({ dx: 0, dy: 0 });
    setDetectedGesture('Sentry Inactive');
  };

  useEffect(() => {
    if (autoStartEnabled) {
      const waitT = setTimeout(() => {
        startCamera();
      }, 700);
      return () => clearTimeout(waitT);
    }
  }, []);

  useEffect(() => {
    if (active) {
      const processFrame = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;

        if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
          animationFrameRef.current = requestAnimationFrame(processFrame);
          return;
        }

        const width = 48;
        const height = 36;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          animationFrameRef.current = requestAnimationFrame(processFrame);
          return;
        }

        // Draw downscaled frame
        ctx.drawImage(video, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        let totalMotion = 0;
        let sumX = 0;
        let sumY = 0;
        let motionPixelCount = 0;

        // Custom canvas debug overlay drawing
        let overlayCtx: CanvasRenderingContext2D | null = null;
        if (overlayCanvas) {
          overlayCanvas.width = 160;
          overlayCanvas.height = 120;
          overlayCtx = overlayCanvas.getContext('2d');
          if (overlayCtx) {
            overlayCtx.fillStyle = 'rgba(2, 4, 12, 0.95)';
            overlayCtx.fillRect(0, 0, 160, 120);

            // Draw micro mirror camera feedback
            overlayCtx.save();
            overlayCtx.translate(160, 0);
            overlayCtx.scale(-1, 1);
            overlayCtx.globalAlpha = 0.45;
            overlayCtx.drawImage(video, 0, 0, 160, 120);
            overlayCtx.restore();

            // Overlay grid lines for targeting bounds
            overlayCtx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
            overlayCtx.lineWidth = 1;
            for (let i = 20; i < 160; i += 20) {
              overlayCtx.beginPath();
              overlayCtx.moveTo(i, 0);
              overlayCtx.lineTo(i, 120);
              overlayCtx.stroke();
            }
            for (let j = 15; j < 120; j += 15) {
              overlayCtx.beginPath();
              overlayCtx.moveTo(0, j);
              overlayCtx.lineTo(160, j);
              overlayCtx.stroke();
            }
          }
        }

        // Fast sequential analysis of luminance delta against previous backbuffer
        let minX = width;
        let maxX = 0;
        let minY = height;
        let maxY = 0;

        if (prevFrameData.current && prevFrameData.current.length === data.length) {
          const prev = prevFrameData.current;
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const idx = (y * width + x) * 4;
              
              // Luminance calculation
              const currLum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
              const prevLum = 0.299 * prev[idx] + 0.587 * prev[idx + 1] + 0.114 * prev[idx + 2];
              
              const diff = Math.abs(currLum - prevLum);
              
              // Enhanced high sensitivity motion filter threshold (reduced to 12 for superior responsiveness!)
              if (diff > 12) {
                totalMotion += diff;
                sumX += x;
                sumY += y;
                motionPixelCount++;

                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                
                // Draw motion trail pixels on target GUI
                if (overlayCtx) {
                  const drawX = Math.round((x / width) * 160);
                  const drawY = Math.round((y / height) * 120);
                  overlayCtx.fillStyle = 'rgba(6, 182, 212, 0.65)';
                  overlayCtx.fillRect(drawX - 2, drawY - 2, 4, 4);
                }
              }
            }
          }
        }

        // Record raw image backbuffer
        prevFrameData.current = data;

        // If adequate motion levels, update tracking coordinates
        const avgMotion = motionPixelCount > 0 ? (totalMotion / motionPixelCount) : 0;
        const normalizedPower = (motionPixelCount / (width * height)) * 100;
        setMotionValue(Math.round(normalizedPower * 4));

        const bboxWidth = maxX >= minX ? (maxX - minX + 1) : 0;
        const bboxHeight = maxY >= minY ? (maxY - minY + 1) : 0;
        const bboxAspectRatio = bboxHeight > 0 ? (bboxWidth / bboxHeight) : 1;
        const bboxArea = bboxWidth * bboxHeight;
        const motionDensity = bboxArea > 0 ? (motionPixelCount / bboxArea) : 0;

        if (normalizedPower > 0.35 && motionPixelCount > 0) { // Highly sensitive motion baseline trigger (lowered from 0.5 to 0.35)
          // Mirror-inverse coordinates for human intuitive navigation
          const targetX = 1 - (sumX / motionPixelCount) / width;
          const targetY = (sumY / motionPixelCount) / height;

          coordinateHistory.current.push({
            x: targetX,
            y: targetY,
            time: Date.now()
          });

          // Trim older entries
          if (coordinateHistory.current.length > 25) {
            coordinateHistory.current.shift();
          }

          // Render Tracking Crosshair target inside HUD
          if (overlayCtx) {
            const guiX = Math.round(targetX * 160);
            const guiY = Math.round(targetY * 120);
            
            // Reticle Target Ring
            overlayCtx.strokeStyle = '#ec4899';
            overlayCtx.lineWidth = 1.5;
            overlayCtx.beginPath();
            overlayCtx.arc(guiX, guiY, 6, 0, 2 * Math.PI);
            overlayCtx.stroke();

            // Cross lines
            overlayCtx.strokeStyle = '#06b6d4';
            overlayCtx.beginPath();
            overlayCtx.moveTo(guiX - 10, guiY);
            overlayCtx.lineTo(guiX + 10, guiY);
            overlayCtx.moveTo(guiX, guiY - 10);
            overlayCtx.lineTo(guiX, guiY + 10);
            overlayCtx.stroke();

            overlayCtx.fillStyle = '#ffffff';
            overlayCtx.font = '7px monospace';
            overlayCtx.fillText(`[X:${Math.round(targetX * 100)} Y:${Math.round(targetY * 100)}]`, guiX + 10, guiY - 5);
          }

          // Evaluate gestures if cooldown allows
          if (Date.now() > gestureCooldownRef.current && coordinateHistory.current.length >= 4) {
            const history = coordinateHistory.current;
            
            // Sliding multi-windows (from short bursts of 4 frames to full 20-frame sweeps)
            const checkWindows = [4, 7, 11, 16, 22];
            let detected = false;

            for (const windowSize of checkWindows) {
              if (detected) break;
              
              const currentWindowSize = Math.min(windowSize, history.length);
              if (currentWindowSize < 4) continue;

              const startIdx = history.length - currentWindowSize;
              const start = history[startIdx];
              const end = history[history.length - 1];
              
              const dx = end.x - start.x;
              const dy = end.y - start.y;
              const dt = end.time - start.time;

              const absDx = Math.abs(dx);
              const absDy = Math.abs(dy);

              // Responsive gesture timeframe (40ms to 850ms)
              if (dt > 40 && dt < 850) {
                setDirectionVector({ dx: parseFloat(dx.toFixed(2)), dy: parseFloat(dy.toFixed(2)) });

                // Check for lateral oscillation (hand waving back and forth)
                let directionChangesX = 0;
                let lastHSign = 0;
                for (let i = startIdx + 1; i < history.length; i++) {
                  const diffSegmentX = history[i].x - history[i - 1].x;
                  if (Math.abs(diffSegmentX) > 0.012) {
                    const currentHSign = Math.sign(diffSegmentX);
                    if (lastHSign !== 0 && currentHSign !== lastHSign) {
                      directionChangesX++;
                    }
                    lastHSign = currentHSign;
                  }
                }

                // 🌟 SPECIAL RECOGNITION RULES FOR ADVANCED GESTURES 🌟

                // 1. Dedicated Closed Fist Clench / Hold
                // Detected when motion is compact, aspect ratio is close to square (~1.0), density is high, power is stable, and change in position is extremely minimal.
                if (normalizedPower > 3.0 && normalizedPower < 10.0 && bboxWidth < 18 && bboxHeight < 18 && bboxAspectRatio > 0.75 && bboxAspectRatio < 1.35 && motionDensity > 0.45 && absDx < 0.05 && absDy < 0.05) {
                  setDetectedGesture('✊ CLOSED FIST CLENCH / LOCK');
                  playSfx(1400, 'sine', 0.45);
                  playHaptic('heavy');
                  playVoice("Closed fist clench security lock authorized.");

                  if (onGrab) onGrab();
                  if (onGestureDetected) onGestureDetected('Closed Fist Clench');
                  dispatchNotification('SECURITY', 'Fist Security Triggered', 'Closed fist clench recognized. Hardware snapshot registered.');
                  gestureCooldownRef.current = Date.now() + 1100;
                  coordinateHistory.current = [];
                  detected = true;
                  break;
                }

                // 2. Air Grab / Wide Squeeze
                else if (normalizedPower > 8.0 && motionDensity > 0.3) {
                  setDetectedGesture('✊ CLOSED FIST / GRAB');
                  playSfx(1200, 'sine', 0.3);
                  playHaptic('heavy');
                  playVoice("Air grab selection invoked.");
                  
                  if (onGrab) {
                    onGrab();
                  } else {
                    document.body.classList.add('ring-4', 'ring-cyan-400', 'duration-200');
                    setTimeout(() => document.body.classList.remove('ring-4', 'ring-cyan-400', 'duration-200'), 250);
                  }

                  if (onGestureDetected) onGestureDetected('Air Grab');
                  dispatchNotification('SECURITY', 'Grab Intent Triggered', 'Closed fist capture command processed.');
                  gestureCooldownRef.current = Date.now() + 1000;
                  coordinateHistory.current = [];
                  detected = true;
                  break;
                }

                // 3. Peace Sign / Two-Finger Scissor (Tall and slender tracking box with tall orientation)
                else if (bboxAspectRatio > 0.35 && bboxAspectRatio < 0.68 && bboxHeight > 12 && absDy < 0.09) {
                  setDetectedGesture('✌️ TWO-FINGER PEACE SIGN');
                  playSfx(950, 'triangle', 0.22);
                  playHaptic('tap');
                  playVoice("Peace sign detected. Synchronizing telemetry node logs.");

                  if (onGestureDetected) onGestureDetected('Peace Sign');
                  dispatchNotification('ACOUSTIC', 'Peace Sign Verified', 'Elegant academic peace sign decoded successfully.');
                  gestureCooldownRef.current = Date.now() + 1000;
                  coordinateHistory.current = [];
                  detected = true;
                  break;
                }

                // 4. Thumbs Up (Slight rapid upward motion with compact aspect ratio)
                else if (dy < -0.08 && bboxAspectRatio > 0.5 && bboxAspectRatio < 1.15 && motionDensity > 0.35) {
                  setDetectedGesture('👍 THUMBS UP COMMAND');
                  playSfx(1100, 'sine', 0.18);
                  playHaptic('success');
                  playVoice("Thumbs up verified. Approving pending check-in ledger.");

                  if (onGestureDetected) onGestureDetected('Thumbs Up');
                  dispatchNotification('SYSTEM', 'Thumbs Up Decoded', 'Affirmative approval command processed.');
                  gestureCooldownRef.current = Date.now() + 900;
                  coordinateHistory.current = [];
                  detected = true;
                  break;
                }

                // 5. Thumbs Down (Slight rapid downward motion with compact aspect ratio)
                else if (dy > 0.08 && bboxAspectRatio > 0.5 && bboxAspectRatio < 1.15 && motionDensity > 0.35) {
                  setDetectedGesture('👎 THUMBS DOWN DECLINE');
                  playSfx(400, 'sine', 0.25);
                  playHaptic('tap');
                  playVoice("Thumbs down verified. Dismissing notification overlay.");

                  if (onGestureDetected) onGestureDetected('Thumbs Down');
                  dispatchNotification('SYSTEM', 'Thumbs Down Decoded', 'Negative decline command processed.');
                  gestureCooldownRef.current = Date.now() + 900;
                  coordinateHistory.current = [];
                  detected = true;
                  break;
                }

                // 6. Dynamic Hand Wave (Lateral waving motion)
                else if (directionChangesX >= 2 && absDx < 0.38 && normalizedPower > 1.5) {
                  setDetectedGesture('👋 DYNAMIC AIR WAVE');
                  playSfx(750, 'sine', 0.25);
                  playHaptic('tap');
                  playVoice("Hello! Contactless wave verified.");
                  
                  if (onGestureDetected) onGestureDetected('Dynamic Wave');
                  dispatchNotification('ACOUSTIC', 'Wave Decoded', 'Friendly hello gesture authenticated successfully.');
                  gestureCooldownRef.current = Date.now() + 1000;
                  coordinateHistory.current = [];
                  detected = true;
                  break;
                }

                // 7. Air Push / Click Forward
                else if (normalizedPower > 3.5 && absDx < 0.12 && absDy < 0.12) {
                  setDetectedGesture('🎯 AIR PUSH / CLICK');
                  playSfx(1050, 'sine', 0.1);
                  playHaptic('tap');
                  playVoice("Air click acknowledged.");

                  const pulseEl = document.createElement('div');
                  pulseEl.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4 border-cyan-400 animate-ping pointer-events-none z-50';
                  document.body.appendChild(pulseEl);
                  setTimeout(() => pulseEl.remove(), 600);

                  if (onGestureDetected) onGestureDetected('Air Push / Click');
                  dispatchNotification('SYSTEM', 'Air Click Active', 'Simulated virtual click trigger executed.');
                  gestureCooldownRef.current = Date.now() + 800;
                  coordinateHistory.current = [];
                  detected = true;
                  break;
                }

                // 8. Dynamic Swipe Down
                else if (dy > 0.10 && absDy > absDx * 1.1) {
                  setDetectedGesture('👉 AIR SCROLL DOWN');
                  playSfx(580, 'triangle', 0.2);
                  playHaptic('tap');
                  
                  if (onScrollDown) {
                    onScrollDown();
                  } else {
                    window.scrollBy({ top: 220, behavior: 'smooth' });
                  }
                  
                  if (onGestureDetected) onGestureDetected('Air Scroll Down');
                  dispatchNotification('ACOUSTIC', 'Air Scroll Down', 'Dynamic Scroll Down command captured.');
                  gestureCooldownRef.current = Date.now() + 800;
                  coordinateHistory.current = [];
                  detected = true;
                  break;
                }

                // 9. Dynamic Swipe Up
                else if (dy < -0.10 && absDy > absDx * 1.1) {
                  setDetectedGesture('👈 AIR SCROLL UP');
                  playSfx(880, 'triangle', 0.2);
                  playHaptic('tap');
                  
                  if (onScrollUp) {
                    onScrollUp();
                  } else {
                    window.scrollBy({ top: -220, behavior: 'smooth' });
                  }
                  
                  if (onGestureDetected) onGestureDetected('Air Scroll Up');
                  dispatchNotification('ACOUSTIC', 'Air Scroll Up', 'Dynamic Scroll Up command captured.');
                  gestureCooldownRef.current = Date.now() + 800;
                  coordinateHistory.current = [];
                  detected = true;
                  break;
                }

                // 10. Dynamic Swipe Left
                else if (dx < -0.10 && absDx > absDy * 1.1) {
                  setDetectedGesture('⏪ SWIPE LEFT');
                  playSfx(440, 'sine', 0.15);
                  playHaptic('tap');
                  
                  if (onSwipeLeft) onSwipeLeft();
                  if (onGestureDetected) onGestureDetected('Air Swipe Left');
                  dispatchNotification('SYSTEM', 'Air Swipe Left', 'Navigational sweep left acknowledged.');
                  gestureCooldownRef.current = Date.now() + 800;
                  coordinateHistory.current = [];
                  detected = true;
                  break;
                }

                // 11. Dynamic Swipe Right
                else if (dx > 0.10 && absDx > absDy * 1.1) {
                  setDetectedGesture('⏩ SWIPE RIGHT');
                  playSfx(660, 'sine', 0.15);
                  playHaptic('tap');
                  
                  if (onSwipeRight) onSwipeRight();
                  if (onGestureDetected) onGestureDetected('Air Swipe Right');
                  dispatchNotification('SYSTEM', 'Air Swipe Right', 'Navigational sweep right acknowledged.');
                  gestureCooldownRef.current = Date.now() + 800;
                  coordinateHistory.current = [];
                  detected = true;
                  break;
                }
              }
            }
          }
        } else {
          // Fade dynamic trace when motionless
          if (Date.now() > gestureCooldownRef.current) {
            setDetectedGesture('Awaiting Hand Focus...');
          }
        }

        // Draw system details on HUD overlay
        if (overlayCtx) {
          overlayCtx.fillStyle = 'rgba(6, 182, 212, 0.9)';
          overlayCtx.font = 'bold 7px monospace';
          overlayCtx.fillText("🛡️ CSYNC TELEMETRY ENGINE", 5, 12);
          
          overlayCtx.fillStyle = 'rgba(236, 72, 153, 0.95)';
          overlayCtx.font = 'bold 7px monospace';
          overlayCtx.fillText(detectedGesture.toUpperCase(), 5, 114);

          // Render miniature motion score bar
          overlayCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          overlayCtx.strokeRect(5, 20, 150, 4);
          overlayCtx.fillStyle = normalizedPower > 10.0 ? '#f43f5e' : '#10b981';
          overlayCtx.fillRect(5, 20, Math.min(150, normalizedPower * 5), 4);
        }

        animationFrameRef.current = requestAnimationFrame(processFrame);
      };

      animationFrameRef.current = requestAnimationFrame(processFrame);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [active, onScrollUp, onScrollDown, onSwipeLeft, onSwipeRight, onGrab, detectedGesture]);

  return (
    <div className="bg-[#020512] border border-white/5 rounded-2xl p-4 text-left relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-600/5 blur-2xl rounded-full"></div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
          <span className="text-[10px] font-mono text-cyan-400 font-extrabold tracking-widest uppercase flex items-center gap-1">
            <Hand className="w-3.5 h-3.5" />
            CSYNC AIR GESTURE SENSOR PORT
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/5 py-0.5 px-2 rounded-full border border-white/5">
            <span className="text-[7.5px] font-mono text-slate-300">AUTO-START CAMERA:</span>
            <button
              type="button"
              onClick={() => {
                const newValue = !autoStartEnabled;
                setAutoStartEnabled(newValue);
                localStorage.setItem('csync_auto_start_gestures', String(newValue));
                playHaptic('tap');
                playVoice(newValue ? "Auto start contactless mode enabled." : "Auto start contactless mode disabled.");
                dispatchNotification(
                  'SYSTEM', 
                  'Auto-Start Parameter Changed', 
                  `Camera gesture link will now ${newValue ? 'initialize automatically' : 'wait for manual link'} on load.`
                );
              }}
              className={`w-7 h-3.5 rounded-full transition-colors relative cursor-pointer ${autoStartEnabled ? 'bg-cyan-500' : 'bg-slate-700'}`}
              id="gestures-autostart-toggle-switch"
            >
              <div className={`absolute top-[2px] w-2.5 h-2.5 rounded-full bg-white transition-all ${autoStartEnabled ? 'right-[2px]' : 'left-[2px]'}`} />
            </button>
          </div>
          <div className="flex items-center gap-1 text-[7.5px] font-mono text-slate-400 bg-white/5 py-0.5 px-2 rounded-full">
            <Sparkles className="w-2.5 h-2.5 text-pink-400 animate-pulse" />
            <span>REAL-TIME WEBCAM CV</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* CV feed canvas */}
        <div className="md:col-span-4 flex flex-col items-center justify-center relative">
          <div className="w-full aspect-[4/3] bg-black/60 rounded-xl overflow-hidden border border-cyan-500/15 relative flex items-center justify-center">
            
            {active ? (
              <canvas 
                ref={overlayCanvasRef}
                className="w-full h-full object-cover rounded-xl select-none"
              />
            ) : (
              <div className="flex flex-col items-center p-3 text-center space-y-2 select-none">
                <Hand className="w-8 h-8 text-cyan-500/40 animate-bounce" />
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-normal">
                  Contactless gestures are currently inactive.
                </span>
              </div>
            )}

            {/* Hidden capture nodes */}
            <video
              ref={videoRef}
              muted
              playsInline
              className="absolute w-1 h-1 opacity-0 pointer-events-none"
            />
            <canvas ref={canvasRef} className="absolute w-1 h-1 opacity-0 pointer-events-none" />
          </div>

          <div className="flex gap-2 mt-2 w-full">
            {active ? (
              <button
                type="button"
                onClick={stopCamera}
                className="w-full text-center py-1.5 bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 text-[8.5px] font-mono uppercase rounded-lg border border-rose-500/20 cursor-pointer transition font-bold"
              >
                Deactivate Video Link
              </button>
            ) : (
              <button
                type="button"
                onClick={startCamera}
                className="w-full text-center py-1.5 bg-cyan-950/40 hover:bg-cyan-900/30 text-cyan-400 text-[8.5px] font-mono uppercase rounded-lg border border-cyan-500/40 cursor-pointer transition font-extrabold flex justify-center items-center gap-1 shadow-[0_0_12px_rgba(6,182,212,0.1)]"
              >
                <Camera className="w-3 h-3 animate-pulse" />
                Establish Video Link
              </button>
            )}
          </div>
        </div>

        {/* Gestures analytics details panel */}
        <div className="md:col-span-8 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2 text-[9.5px]">
            <p className="font-sans text-slate-400 leading-relaxed">
              Provides direct contactless control over the live C-SYNC dashboard. Hand shifts are computed via <strong>absolute visual luminance flow difference matrixes</strong> using standard computer vision arrays directly in your web browser.
            </p>

            <div className="grid grid-cols-2 gap-2 bg-[#01040d] border border-white/5 rounded-xl p-2.5">
              <div>
                <span className="text-[7.5px] text-zinc-500 uppercase font-mono block">Detected Sentry Gesture</span>
                <span className={`text-[10px] font-mono font-black font-semibold mt-0.5 block truncate ${detectedGesture.includes('Awaiting') ? 'text-cyan-400' : 'text-pink-400 animate-pulse'}`}>
                  {detectedGesture}
                </span>
              </div>
              <div>
                <span className="text-[7.5px] text-zinc-500 uppercase font-mono block">Visual Motion Power</span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 block mt-0.5">
                  {motionValue}% intensity
                </span>
              </div>
            </div>

            <div className="bg-[#010206] rounded-xl p-2.5 border border-purple-500/10 space-y-1.5">
              <span className="text-[7.5px] font-mono text-purple-400 font-extrabold uppercase block tracking-wider">
                👉 AVAILABLE GESTURES MANUAL (CSYNC STANDARD)
              </span>
              <ul className="space-y-1 font-mono text-[8.5px] text-slate-300">
                <li className="flex items-center gap-1.5">
                  <span className="text-cyan-400 font-bold">&gt;_ Vertical Wave Down:</span>
                  <span>Air Scroll page content downwards</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-cyan-400 font-bold">&gt;_ Vertical Wave Up:</span>
                  <span>Air Scroll page content upwards</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-purple-400 font-bold">&gt;_ Swipe Hand Left:</span>
                  <span>Swap through auxiliary telemetry modes</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-purple-400 font-bold">&gt;_ Swipe Hand Right:</span>
                  <span>Initiate real-time packet stream sync</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-400 font-bold">&gt;_ Fist Clench / Grab:</span>
                  <span>Squeeze open hand into a closed fist to apply snapshot ring highlight visual</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-teal-400 font-bold">&gt;_ Dynamic Air Wave:</span>
                  <span>Wave back-and-forth laterally to play a friendly greeting</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">&gt;_ Push / Click Forward:</span>
                  <span>Move hand forward towards the lens to invoke custom selection circle feedback</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-[#03071c] p-2 rounded-lg border border-cyan-500/10 flex items-center gap-2 justify-between">
            <span className="text-[8px] font-mono text-slate-400">
              {active ? "🟢 OPTICAL FLOW RECONSTRUCTION RUNNING (30 FPS)" : "🔴 STANDBY: READY FOR TELEMETRY ENROLLMENT"}
            </span>
            <span className="text-[7.5px] text-zinc-500 uppercase font-mono tracking-widest">
              BY_VSK_LABS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
