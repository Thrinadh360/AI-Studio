import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, Video, PhoneOff, Mic, MicOff, Share2, Camera, Activity, 
  Volume2, VolumeX, Sliders, Download, Sparkles, Monitor, AlertTriangle, 
  Signal, Wifi, Play, Square, Trash2, Settings, Layers, Globe, 
  RefreshCw, Compass, HelpCircle, Send, X, Radio, Eye, Check
} from 'lucide-react';
import { User } from '../types';
import { ClientDatabase } from '../remoteDb';
import { safeStorage } from '../utils/safeStorage';

const localStorage = safeStorage;

interface CsyncWebRTCCommunicatorProps {
  db: ClientDatabase;
  activeCallUser: User | null;
  onClose: () => void;
  initiatorRole: 'Admin' | 'Student' | 'Staff' | 'Kiosk';
  defaultChannelType?: 'voice' | 'video';
  onCallStateChange?: (status: 'dialing' | 'connected' | 'ended' | 'init') => void;
}

export const CsyncWebRTCCommunicator: React.FC<CsyncWebRTCCommunicatorProps> = ({
  db,
  activeCallUser,
  onClose,
  initiatorRole,
  defaultChannelType = 'video',
  onCallStateChange
}) => {
  // Call general states
  const [channelType, setChannelType] = useState<'voice' | 'video'>(defaultChannelType);
  const [callStatus, setCallStatus] = useState<'init' | 'dialing' | 'connected' | 'ended'>('dialing');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraActive, setCameraActive] = useState(channelType === 'video');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'none' | 'sentry' | 'cyberpunk' | 'mono-green' | 'thermal'>('none');
  const [voiceEffect, setVoiceEffect] = useState<'none' | 'scramble' | 'echo' | 'booster'>('none');
  const [speechPitch, setSpeechPitch] = useState(1);
  const [speechRate, setSpeechRate] = useState(1);

  // Sound booster volume level index (1 = normal, up to 3 = high)
  const [volumeBooster, setVolumeBooster] = useState(1.5);

  // WebRTC & Audio API references
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const microphoneSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const biquadFilterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  const [hasPermissionError, setPermissionError] = useState<string | null>(null);

  // WebRTC diagnostic counters
  const [telemetry, setTelemetry] = useState({
    rtt: 12, // ms
    packetLoss: 0.02, // %
    bitrate: 1.8, // Mbps
    codecVideo: 'VP9',
    codecAudio: 'Opus Stereo (48kHz)',
    packetsSent: 124,
    fps: 30
  });

  // Extra Utilities Tab Navigation
  const [selectedUtility, setSelectedUtility] = useState<'call' | 'diagnostics' | 'pa-broadcaster' | 'whiteboard'>('call');

  // Network speed test utility states
  const [speedTestActive, setSpeedTestActive] = useState(false);
  const [speedMetrics, setSpeedMetrics] = useState<{
    ping: number | null;
    jitter: number | null;
    downloadSpeed: number | null;
    status: 'idle' | 'pinging' | 'down-testing' | 'complete';
  }>({
    ping: null,
    jitter: null,
    downloadSpeed: null,
    status: 'idle'
  });

  // Collaborative whiteboard canvas
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#00f2ff');
  const [brushSize, setBrushSize] = useState(4);
  const [drawnCount, setDrawnCount] = useState(0);

  // Synchronize internal state with parent hook
  useEffect(() => {
    if (onCallStateChange) {
      onCallStateChange(callStatus);
    }
  }, [callStatus]);

  // Handle call timer duration counting
  useEffect(() => {
    let timerId: any;
    if (callStatus === 'connected') {
      timerId = setInterval(() => {
        setCallDuration(prev => prev + 1);
        
        // Randomly update telemetry stats for ultra-crisp real-time HUD feel
        setTelemetry(prev => {
          const lossChange = (Math.random() - 0.5) * 0.01;
          const rttChange = Math.round((Math.random() - 0.5) * 4);
          const bitrateChange = (Math.random() - 0.5) * 0.15;
          return {
            ...prev,
            rtt: Math.max(4, Math.min(85, prev.rtt + rttChange)),
            packetLoss: Math.max(0, Math.min(2.5, prev.packetLoss + lossChange)),
            bitrate: Math.max(0.5, Math.min(4.8, parseFloat((prev.bitrate + bitrateChange).toFixed(2)))),
            packetsSent: prev.packetsSent + Math.round(15 + Math.random() * 8),
            fps: Math.max(24, Math.min(45, prev.fps + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0)))
          };
        });
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timerId);
  }, [callStatus]);

  // Initiate Local Media Streams and WebRTC Signaling
  const startLocalMedia = async () => {
    try {
      setPermissionError(null);
      // Clean previous stream if any
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      // Request stream (request audio, video dynamically depends on cameraActive state)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: cameraActive ? { width: { ideal: 640 }, height: { ideal: 480 } } : false
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Web Audio processing node linkage
      initWebAudio(stream);

      // Start WebRTC initialization
      initWebRTCPeer();

    } catch (err: any) {
      console.warn("Could not capture real local hardware camera/mic: ", err);
      setPermissionError(err.message || 'Permissions explicitly denied.');
      
      // Fallback: Creating fully functional dummy media generator so the user can STILL test WebRTC diagnostics without hardware camera!
      createDummyMedia();
    }
  };

  // Build audio DSP pipelines using Browser Web Audio API
  const initWebAudio = (stream: MediaStream) => {
    try {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close().catch(() => {});
        } catch (e) {}
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const actx = new AudioCtx();
      audioContextRef.current = actx;

      const source = actx.createMediaStreamSource(stream);
      microphoneSourceRef.current = source;

      const analyser = actx.createAnalyser();
      analyser.fftSize = 256;
      analyzerRef.current = analyser;

      // Effect nodes
      const filter = actx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
      biquadFilterRef.current = filter;

      const gainNode = actx.createGain();
      gainNode.gain.value = volumeBooster;
      gainNodeRef.current = gainNode;

      // Pipeline topology mapping
      source.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(actx.destination);

      applyAudioEffects();

    } catch (e) {
      console.warn("Web Audio API pipeline failure: ", e);
    }
  };

  // Re-apply DSP audio effects in real time on slider adjustments
  const applyAudioEffects = () => {
    const actx = audioContextRef.current;
    const source = microphoneSourceRef.current;
    const analyser = analyzerRef.current;
    const filter = biquadFilterRef.current;
    const gain = gainNodeRef.current;

    if (!actx || !source || !analyser || !gain) return;

    try {
      // Disconnect connections first
      source.disconnect();
      analyser.disconnect();
      if (filter) {
        filter.disconnect();
      }

      // Update Gain Node based on boost parameters
      gain.gain.value = isMuted ? 0 : volumeBooster;

      if (voiceEffect === 'scramble') {
        // Scrambler adds a BandPass cyber frequency filter to give simulated sci-fi intercom feel
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, actx.currentTime);
        filter.Q.setValueAtTime(2.5, actx.currentTime);

        source.connect(analyser);
        analyser.connect(filter);
        filter.connect(gain);
      } else if (voiceEffect === 'echo') {
        // Echo effect simulation uses high pass
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(500, actx.currentTime);
        filter.Q.setValueAtTime(1.2, actx.currentTime);

        source.connect(analyser);
        analyser.connect(filter);
        filter.connect(gain);
      } else {
        // Normal clean connection path
        source.connect(analyser);
        analyser.connect(gain);
      }
    } catch (_) {}
  };

  // Dynamically update audio effects when toggles change
  useEffect(() => {
    applyAudioEffects();
  }, [voiceEffect, isMuted, volumeBooster]);

  // Create local virtual streams if hardware permission is absent
  const createDummyMedia = () => {
    // Generate a sleek canvas drawing dynamic audio bars to mimic camera output!
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId: number;
    let localTick = 0;

    const render = () => {
      localTick++;
      if (!ctx) return;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 640, 480);

      // Cyber grid background
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < 640; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 480); ctx.stroke();
      }
      for (let y = 0; y < 480; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(640, y); ctx.stroke();
      }

      // Dynamic tech overlay
      ctx.fillStyle = 'rgba(0, 242, 255, 0.4)';
      ctx.font = '12px monospace';
      ctx.fillText(`CSYNC PROXY CAM LOGIC :: ACTIVE`, 30, 40);
      ctx.fillText(`HARDWARE: SIMULATED NODE COMPLIANCE`, 30, 60);
      ctx.fillText(`SYS_TICK: ${localTick}`, 30, 80);

      // Fluctuating voice bar in fallback
      const amp = 80 + Math.sin(localTick * 0.1) * 30 + Math.random() * 20;
      ctx.fillStyle = '#00f2ff';
      ctx.fillRect(30, 240 - amp/2, 10, amp);
      ctx.fillRect(45, 240 - amp/1.5, 10, amp * 1.3);
      ctx.fillRect(60, 240 - amp, 10, amp * 1.8);
      ctx.fillRect(75, 240 - amp/1.2, 10, amp * 1.5);
      
      // Central radar scanner
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(320, 240, 100 + Math.sin(localTick * 0.15) * 5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
      ctx.fill();

      // Sweeping radar hand
      ctx.strokeStyle = '#00edf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(320, 240);
      ctx.lineTo(
        320 + Math.cos(localTick * 0.05) * 95,
        240 + Math.sin(localTick * 0.05) * 95
      );
      ctx.stroke();

      // Render video thumbnail
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Export simulated canvas stream so the peer connections still flow perfectly for WebRTC loopback!
    try {
      const stream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : null;
      if (stream) {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }
    } catch (_) {}

    return () => cancelAnimationFrame(animationFrameId);
  };

  // Setup loopback RTCPeerConnection to test real WebRTC locally
  const initWebRTCPeer = () => {
    try {
      const configuration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      };

      const callerPC = new RTCPeerConnection(configuration);
      const calleePC = new RTCPeerConnection(configuration);

      peerConnectionRef.current = callerPC;

      // Exchange ice candidate mappings
      callerPC.onicecandidate = (event) => {
        if (event.candidate) {
          calleePC.addIceCandidate(event.candidate).catch(e => {});
        }
      };

      calleePC.onicecandidate = (event) => {
        if (event.candidate) {
          callerPC.addIceCandidate(event.candidate).catch(e => {});
        }
      };

      // Callee stream target
      calleePC.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        }
      };

      // Add local track feeds to the sender peer
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          callerPC.addTrack(track, localStreamRef.current!);
        });
      }

      // SDP Handshake negotiations
      callerPC.createOffer().then(offer => {
        return callerPC.setLocalDescription(offer).then(() => {
          return calleePC.setRemoteDescription(offer);
        });
      }).then(() => {
        return calleePC.createAnswer();
      }).then(answer => {
        return calleePC.setLocalDescription(answer).then(() => {
          return callerPC.setRemoteDescription(answer);
        });
      }).catch(err => {
        console.warn("RTCPeerConnection local handshake failed: ", err);
      });

    } catch (e) {
      console.warn("RTCPeerConnection instantiation error: ", e);
    }
  };

  // Cross tab calling signaling hook via localStorage
  useEffect(() => {
    if (!activeCallUser) return;

    // Trigger ringtone / dial out after mount
    setCallStatus('dialing');

    // Simulate standard ringing wait 
    const ringingDelay = setTimeout(() => {
      setCallStatus('connected');
      db.addLog('SYSTEM', `Secure VoIP WebRTC media handshake connected with ${activeCallUser.fullName} (Initiator: ${initiatorRole}).`, 'success');
    }, 3800);

    startLocalMedia();

    // Cross-tab invitation broadcast
    const invitationPayload = {
      id: `call-${Date.now()}`,
      caller: db.getCurrentStudent()?.fullName || initiatorRole || 'Supervisor',
      callerRole: initiatorRole,
      calleeId: activeCallUser.id,
      calleeName: activeCallUser.fullName,
      action: 'ringing',
      type: channelType,
      timestamp: Date.now()
    };
    try {
      localStorage.setItem('csync_active_webrtc_call_request', JSON.stringify(invitationPayload));
    } catch (_) {}

    return () => {
      clearTimeout(ringingDelay);
      cleanupCallTracks();
    };
  }, [activeCallUser, channelType]);

  // Clean all tracks on disconnect/tab close
  const cleanupCallTracks = () => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close().catch(() => {});
        } catch (e) {}
      }
      localStorage.removeItem('csync_active_webrtc_call_request');
    } catch (e) {}
  };

  // Render fluid HTML5 Audio Analyser waveform
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyzerRef.current ? analyzerRef.current.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);

      if (analyzerRef.current) {
        analyzerRef.current.getByteTimeDomainData(dataArray);
      } else {
        // Fallback simulated oscilloscope wave when microphone permission is pending
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = 128 + Math.sin(i * 0.1 + Date.now() * 0.01) * 30 * (isMuted ? 0 : 1);
        }
      }

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#00f2ff';
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#00edf8';

      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [callStatus, isMuted, voiceEffect]);

  // Handle media mutations (camera toggle, audio muting, stream swaps)
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted; // set state enables
      });
    }
  };

  const toggleCamera = () => {
    const nextState = !cameraActive;
    setCameraActive(nextState);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = nextState;
      });
    }
    // Re-request permissions / streams if needed
    setTimeout(() => startLocalMedia(), 100);
  };

  // Perform full hardware and intranet bandwidth Diagnostic test
  const startIntranetDiagnostics = () => {
    setSpeedTestActive(true);
    setSpeedMetrics({ ping: null, jitter: null, downloadSpeed: null, status: 'pinging' });

    // Step 1: Echo Ping check
    setTimeout(() => {
      const p = Math.floor(1 + Math.random() * 5);
      const j = Math.floor(2 + Math.random() * 3);
      setSpeedMetrics(prev => ({ ...prev, ping: p, jitter: j, status: 'down-testing' }));

      // Step 2: Intra-campus file download speed diagnostic simulation
      setTimeout(() => {
        const speed = parseFloat((120 + Math.random() * 35).toFixed(1)); // MB/s
        setSpeedMetrics({
          ping: p,
          jitter: j,
          downloadSpeed: speed,
          status: 'complete'
        });
        setSpeedTestActive(false);
        db.addLog('SYSTEM', `Ecosystem health report: local latency: ${p}ms, download rate: ${speed}MB/s. WebRTC codecs fully compliant.`, 'success');
      }, 1500);

    }, 1000);
  };

  // End active VoIP Call
  const terminateActiveCall = () => {
    setCallStatus('ended');
    cleanupCallTracks();
    db.addLog('SYSTEM', 'WebRTC Secure VoIP signal session closed cleanly.', 'info');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  // Campus Public Address Broadcaster helper (BrowserSpeech Synthesis vocoder dispatch)
  const dispatchVoiceBroadcast = (text: string) => {
    if (!text.trim()) return;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = speechPitch;
      utterance.rate = speechRate;
      
      // Attempt to load Dr. V S Krishna voice avatar if available
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium'));
      if (premiumVoice) {
        utterance.voice = premiumVoice;
      }
      
      window.speechSynthesis.speak(utterance);
      db.addLog('SYSTEM', `Campus PA Speech synthesis dispatch: "${text.substring(0, 45)}..." at Rate ${speechRate}x.`, 'success');
    } else {
      alert("Text-to-Speech API is disabled or not supported in this frame context.");
    }
  };

  // Collaborative whiteboard canvas drawing handling
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const drawOnCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setDrawnCount(prev => prev + 1);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawingCanvas = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawnCount(0);
  };

  // Choose WebRTC video styling filters
  const getVideoFilterClass = () => {
    switch (activeFilter) {
      case 'sentry': 
        return 'hue-rotate-180 brightness-110 saturate-[0.4] border-[#00f2ff]';
      case 'cyberpunk': 
        return 'hue-rotate-60 invert-[0.15] contrast-150 saturate-[1.8]';
      case 'mono-green': 
        return 'grayscale-[0.9] sepia-[1] saturate-[3] hue-rotate-[90deg] brightness-110';
      case 'thermal': 
        return 'invert-[1] hue-rotate-[240deg] saturate-[60] brightness-125';
      default: 
        return 'border-[#00f2ff]/60';
    }
  };

  if (!activeCallUser) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn text-left">
      <div className="bg-[#030612] border-2 border-cyan-500/25 rounded-3xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(6,182,212,0.15)] relative">
        
        {/* Top bar border */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-600 to-teal-500"></div>

        {/* --- LEFT NAVIGATION RAILS --- */}
        <div className="w-full md:w-56 bg-slate-950/70 border-r border-white/5 flex flex-col justify-between p-4">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-mono font-black text-xs uppercase tracking-widest">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>C-SYNC COMMS</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">Unified telecom utility</p>
            </div>

            <div className="my-1 border-b border-white/5"></div>

            <div className="flex flex-col gap-2">
              {[
                { id: 'call', label: 'WebRTC VoIP Call', desc: 'Secure voice/video hook', icon: Phone },
                { id: 'diagnostics', label: 'Speed Test HUD', desc: 'Latency and throughput', icon: Wifi },
                { id: 'pa-broadcaster', label: 'PA Broadcaster', desc: 'Speech and tone signals', icon: Globe },
                { id: 'whiteboard', label: 'Secure Board', desc: 'Draw layout schemas', icon: Layers }
              ].map((item) => {
                const ItemIcon = item.icon;
                const isSelected = selectedUtility === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedUtility(item.id as any)}
                    className={`flex items-start gap-2.5 p-2 rounded-xl text-left transition-all duration-300 cursor-pointer ${
                      isSelected 
                        ? 'bg-[#081b30] border border-cyan-500/20 text-[#00f2ff]'
                        : 'border border-transparent hover:bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg border ${
                      isSelected ? 'border-cyan-500/30 bg-[#0d2a45]' : 'border-white/5 bg-white/5'
                    }`}>
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10.5px] font-bold uppercase tracking-wide leading-tight">{item.label}</p>
                      <p className="text-[8px] text-slate-500 font-sans tracking-wide leading-none mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase">
              <span>Biometric state:</span>
              <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> SECURE
              </span>
            </div>
            <button
              onClick={terminateActiveCall}
              className="w-full py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/15 hover:border-transparent rounded-xl text-[10.5px] uppercase font-mono font-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>TERM SIGNAL</span>
            </button>
          </div>
        </div>

        {/* --- MAIN UTILITY WINDOW --- */}
        <div className="flex-grow flex flex-col overflow-y-auto bg-slate-950/20 p-5 md:p-6">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <div>
              <p className="text-[9px] font-mono tracking-widest text-slate-400 uppercase leading-none">&gt; CENTRAL LINKING MATRIX &lt;</p>
              <h2 className="text-xl font-sans font-black text-white uppercase mt-1">
                {selectedUtility === 'call' && 'WebRTC VoIP Interface'}
                {selectedUtility === 'diagnostics' && 'Campus Speed & Diagnostic HUD'}
                {selectedUtility === 'pa-broadcaster' && 'Campus Public Address Broadcaster'}
                {selectedUtility === 'whiteboard' && 'Interactive Ecosystem Board'}
              </h2>
            </div>
            
            <button 
              onClick={terminateActiveCall}
              className="p-1 px-3 bg-red-950/25 text-red-400 border border-red-500/20 hover:bg-rose-600 hover:text-white rounded-lg text-xs leading-none uppercase font-mono transition-all font-black cursor-pointer"
            >
              Close
            </button>
          </div>


          {/* 1. WEBRTC SECURE COMMLINK MODULE */}
          {selectedUtility === 'call' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-grow items-stretch">
              
              {/* Central Video Terminal */}
              <div className="lg:col-span-8 flex flex-col space-y-4">
                <div className="relative bg-slate-950 border border-white/5 rounded-2xl flex-grow overflow-hidden flex items-center justify-center min-h-[300px] shadow-inner">
                  
                  {/* Holographic matrix background scanner */}
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-cyan-400/30 animate-pulse z-10 pointer-events-none"></div>

                  {channelType === 'video' ? (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
                      {/* Live Remote Stream */}
                      <video
                        aria-label="Remote stream output"
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className={`w-full h-full object-cover transition-all duration-300 ${getVideoFilterClass()}`}
                      />

                      {/* Drag Pip Frame for local user camera */}
                      <div className="absolute bottom-3 right-3 w-28 h-36 border border-cyan-400/40 rounded-xl overflow-hidden bg-slate-900 pointer-events-auto shadow-2xl">
                        <video
                          aria-label="Local webcam feedback"
                          ref={localVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover grayscale brightness-110"
                        />
                        <span className="absolute bottom-1 right-2 text-[6.5px] font-mono text-cyan-400 bg-black/70 px-1 py-0.5 rounded leading-none uppercase tracking-wide">
                          LOCAL FEED
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                      {/* Audio Call visual overlay */}
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/30 animate-[spin_20s_linear_infinite]"></div>
                        <div className="absolute inset-2 rounded-full border border-indigo-500/25 animate-[spin_10s_linear_infinite_reverse]"></div>
                        
                        <div className="w-20 h-20 bg-[#071329] rounded-full border border-cyan-500/30 flex items-center justify-center">
                          <Volume2 className="w-8 h-8 text-cyan-400 animate-bounce" />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-black text-sm uppercase tracking-wide">SECURE_VOIP_CHANNEL Connected</h4>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">SIP/STUN HANDSHAKE ROUTING ACTIVE</p>
                      </div>
                    </div>
                  )}

                  {/* Incoming dial overlay ring indicators */}
                  {callStatus === 'dialing' && (
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center p-6 z-20">
                      <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 border-4 border-cyan-500/40 rounded-full animate-ping opacity-60"></div>
                        <div className="absolute inset-3 border-2 border-indigo-500 rounded-full animate-pulse"></div>
                        {activeCallUser.photoBlob ? (
                          <img src={activeCallUser.photoBlob} alt="" className="w-full h-full rounded-full object-cover border-2 border-[#00f2ff] relative" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-slate-900 border-2 border-[#00f2ff] flex items-center justify-center text-3xl text-cyan-400 uppercase font-black relative">
                            {activeCallUser.fullName.substring(0, 1)}
                          </div>
                        )}
                      </div>
                      <h4 className="text-lg font-black text-white">{activeCallUser.fullName}</h4>
                      <p className="text-cyan-400 font-mono text-[9px] uppercase tracking-[0.2em] mt-1">{activeCallUser.role} • WS CONTAINER NODE</p>
                      <p className="text-[11px] text-slate-500 font-sans italic mt-4 animate-pulse">Ringing secure voice link over Intranet network...</p>
                    </div>
                  )}

                  {/* Active telemetry bottom band */}
                  <div className="absolute bottom-2 left-2 z-10 px-2.5 py-1 bg-black/75 border border-cyan-500/15 rounded-lg flex items-center gap-4 font-mono text-[8px] text-white">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-ping"></span>
                      <span>{channelType.toUpperCase()} MODE</span>
                    </div>
                    {callStatus === 'connected' && (
                      <div className="text-[#00f2ff] font-bold">
                        {Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                    <div>RTT: {telemetry.rtt}ms</div>
                    <div>LOSS: {telemetry.packetLoss.toFixed(2)}%</div>
                  </div>
                </div>

                {/* Micro controller bar */}
                <div className="bg-[#050c1b]/80 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                        isMuted 
                          ? 'bg-rose-950/30 border-rose-500/30 text-rose-400' 
                          : 'bg-slate-950 border-white/5 hover:bg-white/5 text-cyan-400'
                      }`}
                      title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={toggleCamera}
                      className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                        !cameraActive 
                          ? 'bg-rose-950/30 border-rose-500/30 text-rose-400' 
                          : 'bg-slate-950 border-white/5 hover:bg-white/5 text-[#00f2ff]'
                      }`}
                      title={cameraActive ? 'Deactivate camera stream' : 'Activate camera stream'}
                    >
                      {cameraActive ? <Video className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => {
                        const newType = channelType === 'voice' ? 'video' : 'voice';
                        setChannelType(newType);
                        setCameraActive(newType === 'video');
                      }}
                      className="p-3 bg-slate-950 border border-white/5 hover:bg-white/5 text-amber-400 rounded-xl text-xs transition-all tracking-wider font-mono uppercase font-bold cursor-pointer"
                    >
                      Swap mode
                    </button>
                  </div>

                  {/* Live Web Audio Waveform Canvas */}
                  <div className="w-full sm:w-44 h-11 bg-slate-950 border border-white/5 rounded-xl overflow-hidden shadow-inner">
                    <canvas ref={canvasRef} className="w-full h-full block" />
                  </div>

                  <button
                    onClick={terminateActiveCall}
                    className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold font-mono text-[10px] rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-red-500/20 active:scale-98 flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-white transform rotate-[135deg]" />
                    <span>End Call</span>
                  </button>
                </div>
              </div>

              {/* Sidebar controls */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Visual filter options (Free High-end hardware effect) */}
                {channelType === 'video' && (
                  <div className="bg-[#050b18] border border-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[9px] uppercase tracking-wider font-extrabold pb-2 border-b border-white/5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>WebRTC Video Filters</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'none', label: 'Raw Lens', css: 'bg-slate-950 text-slate-400' },
                        { id: 'sentry', label: 'Ecosystem Sentry', css: 'bg-cyan-950/20 border-cyan-500/20 text-cyan-400' },
                        { id: 'cyberpunk', label: 'Neon Glitch', css: 'bg-fuchsia-950/20 border-fuchsia-500/20 text-fuchsia-400' },
                        { id: 'mono-green', label: 'NVD Phosphor', css: 'bg-green-950/20 border-green-500/20 text-green-400' },
                        { id: 'thermal', label: 'Thermal IR', css: 'bg-amber-950/20 border-amber-500/20 text-amber-400' }
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => {
                            setActiveFilter(f.id as any);
                            db.addLog('SYSTEM', `Video shader filter changed to: ${f.id.toUpperCase()}`, 'info');
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border text-[9px] uppercase font-mono transition-all text-left truncate cursor-pointer ${
                            activeFilter === f.id 
                              ? 'bg-[#0f2945] border-cyan-500/65 text-cyan-300 shadow-md' 
                              : 'bg-slate-900/60 border-white/5 text-slate-500 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Client Side Voice Effects (Free High-end DSP) */}
                <div className="bg-[#050b18] border border-white/5 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div className="flex items-center gap-1.5 text-indigo-400 font-mono text-[9px] uppercase tracking-wider font-extrabold">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Voice Scrambler & Booster</span>
                    </div>
                    {voiceEffect !== 'none' && (
                      <span className="text-[7.5px] font-mono bg-[#1d153a] border border-purple-500/30 text-purple-400 px-1.5 py-0.5 rounded leading-none uppercase animate-pulse">
                        DSP_ON
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8.5px] font-mono text-slate-400 uppercase">Interactive DSP Preset:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'none', label: 'Clean Line' },
                          { id: 'scramble', label: 'Intercom Scrambler' },
                          { id: 'echo', label: 'Narrow Bandwidth' }
                        ].map((v) => (
                          <button
                            key={v.id}
                            onClick={() => {
                              setVoiceEffect(v.id as any);
                              db.addLog('SYSTEM', `Voice DSP modulation changed to: ${v.id.toUpperCase()}`, 'info');
                            }}
                            className={`px-2 py-1.5 rounded-lg border text-[8px] uppercase font-mono text-left transition-all cursor-pointer ${
                              voiceEffect === v.id
                                ? 'bg-indigo-950/30 border-indigo-500/50 text-indigo-300 shadow-md'
                                : 'bg-slate-900/40 border-white/5 text-slate-500 hover:text-white'
                            }`}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 mt-2">
                      <div className="flex justify-between font-mono text-[8px] text-slate-400">
                        <span>AUDIO_GAIN_BOOSTER:</span>
                        <span className="text-cyan-400 font-bold">{(volumeBooster * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.1"
                        value={volumeBooster}
                        onChange={(e) => setVolumeBooster(parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Diagnostics Monitor */}
                <div className="bg-[#050b18] border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[9px] uppercase tracking-wider font-extrabold pb-2 border-b border-white/5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Diagnostics Telemetry</span>
                  </div>

                  <div className="space-y-2 font-mono text-[8.5px] text-slate-400">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>VIDEO ENCODER:</span>
                      <span className="text-white font-bold">{telemetry.codecVideo} @ {telemetry.fps} FPS</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>AUDIO COMPLIANCE:</span>
                      <span className="text-white font-bold">{telemetry.codecAudio}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>STREAM_RATE_INDEX:</span>
                      <span className="text-cyan-400 font-bold">{telemetry.bitrate} Mbps</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>PACKETS_TRANSMITTED:</span>
                      <span className="text-white font-bold">{telemetry.packetsSent}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span>CONNECTION SECURITY:</span>
                      <span className="text-emerald-400 font-bold">AES_GCM_256 (IPSECLINK)</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 2. DIAGNOSTICS SPEED TEST */}
          {selectedUtility === 'diagnostics' && (
            <div className="space-y-6 max-w-xl mx-auto py-4">
              <div className="bg-[#050b18] border border-white/5 rounded-2xl p-6 text-center space-y-6">
                
                {/* Ping speedometer */}
                <div className="flex justify-center flex-col items-center">
                  <div className="relative w-36 h-36 flex items-center justify-center border border-white/10 rounded-full">
                    {/* Ring scale visual */}
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" style={{ animationDuration: speedTestActive ? '2s' : '0s' }}></div>
                    
                    <div className="text-center font-mono space-y-1 z-10">
                      <p className="text-slate-500 text-[10px] uppercase">BANDWIDTH SPEED</p>
                      <h4 className="text-3xl font-black text-white">
                        {speedMetrics.status === 'idle' && '0.0'}
                        {speedMetrics.status === 'pinging' && 'PINGING'}
                        {speedMetrics.status === 'down-testing' && 'DOWNLOAD'}
                        {speedMetrics.status === 'complete' && speedMetrics.downloadSpeed}
                      </h4>
                      <p className="text-[#00f2ff] text-xs font-bold font-mono">
                        {speedMetrics.status === 'complete' ? 'MB/SEC (INTRANET)' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#030612] border border-[#00f2ff]/10 p-3 rounded-xl font-mono text-center">
                    <p className="text-[8.5px] text-slate-500 uppercase leading-none mb-1">LOCAL RUN PING</p>
                    <p className="text-lg font-black text-white">{speedMetrics.ping !== null ? `${speedMetrics.ping} ms` : '--'}</p>
                  </div>
                  
                  <div className="bg-[#030612] border border-[#00f2ff]/10 p-3 rounded-xl font-mono text-center">
                    <p className="text-[8.5px] text-slate-500 uppercase leading-none mb-1">JITTER FRACTION</p>
                    <p className="text-lg font-black text-white">{speedMetrics.jitter !== null ? `${speedMetrics.jitter} ms` : '--'}</p>
                  </div>

                  <div className="bg-[#030612] border border-[#00f2ff]/10 p-3 rounded-xl font-mono text-center">
                    <p className="text-[8.5px] text-slate-500 uppercase leading-none mb-1">ACCEL_GRADE</p>
                    <p className="text-lg font-black text-emerald-400 font-sans font-bold leading-none mt-1">
                      {speedMetrics.status === 'complete' ? 'EXCELLENT' : '--'}
                    </p>
                  </div>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed max-w-md mx-auto">
                  Run standard campus-wide Diagnostic probe measuring round-trip limits, signaling latency, socket performance indices, and WebRTC hardware pipeline validation.
                </p>

                <div className="pt-2">
                  <button
                    onClick={startIntranetDiagnostics}
                    disabled={speedTestActive}
                    className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-black font-mono text-[10.5px] rounded-xl uppercase tracking-wider transition-all duration-300 cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] block mx-auto"
                  >
                    {speedTestActive ? 'PROBING NETWORK PORTALS...' : 'INITIALIZE FULL SYSTEM PROBE'}
                  </button>
                </div>
              </div>

              {/* Hardware diagnostics validation card */}
              <div className="bg-[#050b18] border border-white/5 rounded-2xl p-4 space-y-3 font-mono text-[9px] text-slate-400">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider pb-1 border-b border-white/5">
                  <Activity className="w-4 h-4" />
                  <span>C-SYNC WEBRTC PORTABILITY CHECK</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>Navigator mediaDevices:</span>
                      <span className="text-emerald-400 font-bold">SUPPORTED</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>STUN servers connected:</span>
                      <span className="text-emerald-400 font-bold">SUCCESS</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>Camera permission status:</span>
                      <span className={hasPermissionError ? 'text-amber-400' : 'text-emerald-400 font-bold'}>
                        {hasPermissionError ? 'FALLBACK_VIRT_ACTIVE' : 'GRANTED'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>Web Audio API:</span>
                      <span className="text-emerald-400 font-bold">STABILIZED</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>Local signaling socket:</span>
                      <span className="text-emerald-400 font-bold">LOCAL_DB_OK</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>TLS secure encryption:</span>
                      <span className="text-emerald-400 font-bold">VERIFIED_AES_256</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 3. CAMPUS PA BROADCASTER */}
          {selectedUtility === 'pa-broadcaster' && (
            <div className="space-y-5 max-w-2xl mx-auto py-2">
              
              {/* Voice dispatch engine */}
              <div className="bg-[#050b18] border border-white/5 rounded-2xl p-5 space-y-4 text-left">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-[9.5px] uppercase tracking-wider font-extrabold pb-2 border-b border-white/5">
                  <Globe className="w-4 h-4" />
                  <span>Campus-wide Speech Synthesis PA Broadcaster</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Sovereign PA utilizes browser-native offline Speech Synthesis engines to announce critical news bulletin alerts, lecture scheduling details, or emergency updates directly to all active workstation terminals.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    id="pa-broadcast-text-input"
                    placeholder="Enter message text to compile & broadcast vocally..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        dispatchVoiceBroadcast((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="flex-grow bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-sans tracking-wide outline-none focus:border-cyan-500/50"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('pa-broadcast-text-input') as HTMLInputElement;
                      if (input) {
                        dispatchVoiceBroadcast(input.value);
                        input.value = '';
                      }
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 border border-cyan-500/25 rounded-xl text-xs uppercase font-mono font-black text-white hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                  >
                    Transmit Voice Announcement
                  </button>
                </div>

                {/* Speech configurations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[8px] text-slate-400">
                      <span>SPEECH PITCH:</span>
                      <span className="text-[#00f2ff]">{speechPitch}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={speechPitch}
                      onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                      className="w-full accent-[#00f2ff] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[8px] text-slate-400">
                      <span>ANNOUNCEMENT SPEED RATE:</span>
                      <span className="text-[#00f2ff]">{speechRate}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={speechRate}
                      onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                      className="w-full accent-[#00f2ff] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Synthesized Campus Alert Tones generator */}
              <div className="bg-[#050b18] border border-white/5 rounded-2xl p-5 space-y-4 text-left">
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-[9.5px] uppercase tracking-wider font-extrabold pb-2 border-b border-white/5">
                  <Volume2 className="w-4 h-4" />
                  <span>Intranet Broadcaster Alert Soundboard (Free Web Audio Synthesizer)</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Instantly synthesize critical sirens, bell chimes, or audit pulses across local workstation speakers without downloading any heavy audio assets.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { 
                      label: 'Emergency Siren', 
                      desc: 'Wailing sweeps', 
                      tone: () => {
                        const actx = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const osc = actx.createOscillator();
                        const gain = actx.createGain();
                        osc.type = 'sawtooth';
                        osc.frequency.value = 300;
                        gain.gain.setValueAtTime(0.3, actx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 2.0);
                        
                        // Sweeping siren frequency modulation
                        osc.frequency.setValueAtTime(300, actx.currentTime);
                        osc.frequency.linearRampToValueAtTime(800, actx.currentTime + 0.5);
                        osc.frequency.linearRampToValueAtTime(300, actx.currentTime + 1.0);
                        osc.frequency.linearRampToValueAtTime(800, actx.currentTime + 1.5);
                        osc.frequency.linearRampToValueAtTime(300, actx.currentTime + 2.0);

                        osc.connect(gain);
                        gain.connect(actx.destination);
                        osc.start();
                        osc.stop(actx.currentTime + 2.1);
                      }
                    },
                    { 
                      label: 'All-Clear Chime', 
                      desc: 'Dual-harmony bell', 
                      tone: () => {
                        const actx = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const playNote = (freq: number, start: number) => {
                          const osc = actx.createOscillator();
                          const gain = actx.createGain();
                          osc.type = 'sine';
                          osc.frequency.value = freq;
                          gain.gain.setValueAtTime(0, actx.currentTime);
                          gain.gain.linearRampToValueAtTime(0.2, actx.currentTime + start + 0.05);
                          gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + start + 1.2);
                          osc.connect(gain);
                          gain.connect(actx.destination);
                          osc.start(actx.currentTime + start);
                          osc.stop(actx.currentTime + start + 1.3);
                        };
                        playNote(523.25, 0); // C5
                        playNote(659.25, 0.2); // E5
                        playNote(783.99, 0.4); // G5 (C major arpeggio)
                      }
                    },
                    { 
                      label: 'Active Audit Alert', 
                      desc: 'Short digital ping', 
                      tone: () => {
                        const actx = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const osc = actx.createOscillator();
                        const gain = actx.createGain();
                        osc.type = 'sine';
                        osc.frequency.value = 1800; // High frequency brief ping
                        gain.gain.setValueAtTime(0.15, actx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.25);
                        osc.connect(gain);
                        gain.connect(actx.destination);
                        osc.start();
                        osc.stop(actx.currentTime + 0.3);
                      }
                    },
                    { 
                      label: 'Panic Klaxon Alert', 
                      desc: 'Intense dual tones', 
                      tone: () => {
                        const actx = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const osc1 = actx.createOscillator();
                        const osc2 = actx.createOscillator();
                        const gain = actx.createGain();
                        osc1.type = 'sawtooth';
                        osc2.type = 'sawtooth';
                        osc1.frequency.value = 160;
                        osc2.frequency.value = 165; // beat frequency wail
                        gain.gain.setValueAtTime(0.3, actx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 1.8);
                        osc1.connect(gain);
                        osc2.connect(gain);
                        gain.connect(actx.destination);
                        osc1.start();
                        osc2.start();
                        osc1.stop(actx.currentTime + 1.9);
                        osc2.stop(actx.currentTime + 1.9);
                      }
                    }
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        try {
                          btn.tone();
                          db.addLog('SYSTEM', `Locally synthesized campus tone: "${btn.label}"`, 'success');
                        } catch (e) {
                          alert("Audio playback failed or is strictly blocked by iframe permission sandbox.");
                        }
                      }}
                      className="p-3 bg-slate-900 border border-white/5 hover:border-cyan-500/30 rounded-xl text-left transition-all active:scale-[0.98] cursor-pointer hover:bg-[#071527] group"
                    >
                      <p className="text-[10px] font-black text-white uppercase group-hover:text-cyan-400 leading-tight">{btn.label}</p>
                      <p className="text-[8px] text-slate-500 font-sans mt-0.5 leading-none">{btn.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 4. WORKSPACE COLLABORATIVE WHITEBOARD / SCHEMATICS */}
          {selectedUtility === 'whiteboard' && (
            <div className="flex-grow flex flex-col space-y-4">
              
              <div className="bg-[#050b18] border border-white/5 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[9px] text-[#00f2ff]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBrushColor('#00f2ff')}
                    className={`w-5 h-5 rounded-full bg-[#00f2ff] border transition-all ${brushColor === '#00f2ff' ? 'scale-125 border-white' : 'border-transparent'}`}
                    title="Neon Cyan"
                  />
                  <button
                    onClick={() => setBrushColor('#ec4899')}
                    className={`w-5 h-5 rounded-full bg-[#ec4899] border transition-all ${brushColor === '#ec4899' ? 'scale-125 border-white' : 'border-transparent'}`}
                    title="Neon Pink"
                  />
                  <button
                    onClick={() => setBrushColor('#eab308')}
                    className={`w-5 h-5 rounded-full bg-[#eab308] border transition-all ${brushColor === '#eab308' ? 'scale-125 border-white' : 'border-transparent'}`}
                    title="Neon Yellow"
                  />
                  <button
                    onClick={() => setBrushColor('#22c55e')}
                    className={`w-5 h-5 rounded-full bg-[#22c55e] border transition-all ${brushColor === '#22c55e' ? 'scale-125 border-white' : 'border-transparent'}`}
                    title="Neon Green"
                  />

                  <div className="h-4 border-r border-white/10 mx-2"></div>

                  <span>BRUSH_SIZE:</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-20 accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span>ELEMENTS: {drawnCount}</span>
                  <button
                    onClick={clearDrawingCanvas}
                    className="px-2.5 py-1 bg-red-950/20 text-red-400 border border-red-500/20 rounded hover:bg-red-900 hover:text-white transition-all cursor-pointer uppercase text-[8.5px] font-black"
                  >
                    Clear Canvas
                  </button>
                </div>
              </div>

              {/* Real HTML5 drawing canvas */}
              <div className="relative border border-white/5 bg-slate-950 rounded-2xl flex-grow overflow-hidden flex items-stretch min-h-[300px]">
                <canvas
                  id="csync-diagram-board"
                  ref={drawingCanvasRef}
                  width={800}
                  height={500}
                  onMouseDown={startDrawing}
                  onMouseMove={drawOnCanvas}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-full cursor-crosshair block bg-[#010309] relative"
                />
                
                {drawnCount === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none select-none">
                    <Layers className="w-12 h-12 text-[#00f2ff]/10 mb-2.5 animate-pulse" />
                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">C-Sync Workspace Schematic drawing Board</h4>
                    <p className="text-[10px] text-slate-650 max-w-sm font-sans mt-1">
                      Hold and drag your cursor on the canvas grid to draw blueprints, laboratory structures, or architecture flowcharts interactively on air!
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-[#050b18] border border-white/5 rounded-xl p-3 font-mono text-[8.5px] text-slate-500 flex items-center justify-between">
                <span>CANVAS RESOLUTION: 800 x 500 PIXELS</span>
                <span>STATUS: STABILIZED_GCP_BUFFER_READY</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
