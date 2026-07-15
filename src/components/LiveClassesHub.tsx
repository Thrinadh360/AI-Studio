import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Sparkles, Video, VideoOff, Mic, MicOff, MessageSquare, Send, 
  Hand, ShieldCheck, Plus, Trash2, Wifi, Monitor, Info, Check, Play, X,
  ExternalLink, HelpCircle, RotateCw, Eye, Heart, Activity, AlertCircle, 
  Settings, Key, Database, ChevronRight, ArrowLeft
} from 'lucide-react';
import { ClientDatabase } from '../remoteDb';
import { LiveClassSession, WhiteboardStroke } from '../types';

interface LiveClassesHubProps {
  db: ClientDatabase;
  onRefreshAll: () => void;
  overrideCurrentUser?: any;
}

export const LiveClassesHub: React.FC<LiveClassesHubProps> = ({ 
  db, 
  onRefreshAll,
  overrideCurrentUser 
}) => {
  const [classesList, setClassesList] = useState<LiveClassSession[]>(() => db.getLiveClasses());
  const [activeSession, setActiveSession] = useState<LiveClassSession | null>(null);
  const [isJoined, setIsJoined] = useState(false);

  // Form states
  const [subject, setSubject] = useState('Computer Science');
  const [topic, setTopic] = useState('Introduction to Blockchains & Zero-Knowledge Proofs');
  const [customHostName, setCustomHostName] = useState('');

  // Classroom active room controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Whiteboard drawing tools
  const [drawTool, setDrawTool] = useState<'pencil' | 'eraser' | 'line' | 'rectangle'>('pencil');
  const [drawColor, setDrawColor] = useState('#00f2ff');
  const [drawWidth, setDrawWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);

  // Simulation controls
  const [autoSimulateInteractions, setAutoSimulateInteractions] = useState(true);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Sync internal classes lists
  const handleRefreshClasses = () => {
    const list = db.getLiveClasses();
    setClassesList(list);
    if (activeSession) {
      const refreshedActive = list.find(c => c.id === activeSession.id);
      if (refreshedActive) {
        setActiveSession(refreshedActive);
      }
    }
  };

  // Get current active user
  const currentUser = overrideCurrentUser || db.getCurrentStudent() || db.getUsers().find(u => u.isDeveloper) || { id: 99, fullName: 'Guest Visitor', role: 'Guest' };
  const canHost = currentUser.role === 'Staff' || currentUser.role === 'Admin' || currentUser.isDeveloper || currentUser.fullName?.toLowerCase().includes('thrinadh');

  // Trigger media cameras
  useEffect(() => {
    if (isJoined && isCamOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          setCameraStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.warn("Camera hardware access denied/unavailable:", err);
          setFeedbackToast("No webcam detected. Reverting to virtual cryptographic avatar simulation!");
          setIsCamOn(false);
        });
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    }
  }, [isJoined, isCamOn]);

  // Clean up streams on leave
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Redraw whiteboard strokes when activeSession or canvas state changes
  useEffect(() => {
    if (isJoined && activeSession && canvasRef.current) {
      redrawWhiteboard();
    }
  }, [isJoined, activeSession]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.chatMessages, isJoined]);

  // Random interaction simulator (simulates multiple students joining, writing messages, or raising hand)
  useEffect(() => {
    if (!isJoined || !activeSession || !autoSimulateInteractions || activeSession.status !== 'LIVE') return;

    const interval = setInterval(() => {
      const randomAction = Math.random();

      const mockStudents = [
        { name: 'Srinivas Rao K.', role: 'Student' },
        { name: 'Dr. V.S. Krishna', role: 'Staff' },
        { name: 'Suresh Kumar AP', role: 'Student' },
        { name: 'Kalyani G.', role: 'Student' },
        { name: 'Naveen Reddy G.', role: 'Student' }
      ];

      const mockMessages = [
        "Namaste, is this lecture being recorded for future UGC NAAC accreditation audits?",
        "Beautiful whiteboard representation. The drawing core looks perfectly in-sync.",
        "Yes! Using client-side local database indexers is incredibly fast.",
        "Sir, can we compile OTA update files directly from the terminal deck?",
        "What is the maximum geofencing tolerance level for mobile attendance?",
        "This stream quality is exceptionally high and responsive!",
        "Excellent whiteboard concept, very useful for mathematical drafts.",
        "The integrated Jitsi Meet video stream handles high resolutions beautifully."
      ];

      if (randomAction < 0.4) {
        // Class chat simulated message
        const student = mockStudents[Math.floor(Math.random() * mockStudents.length)];
        const msg = mockMessages[Math.floor(Math.random() * mockMessages.length)];
        db.addLiveClassChatMessage(activeSession.id, student.name, student.role, msg);
        handleRefreshClasses();
      } else if (randomAction < 0.6) {
        // Teacher drawing simulation
        simulateTeacherDraw();
        setFeedbackToast("Simulating shared drawings on the interactive blackboard...");
      }
    }, 9000); // Trigger every 9 seconds for high fidelity feel

    return () => clearInterval(interval);
  }, [isJoined, activeSession, autoSimulateInteractions]);

  // Handle Host class submission
  const handleHostClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !topic.trim()) return;

    const nameToUse = customHostName.trim() || currentUser.fullName || 'Mrs. Kalyani T.';
    const created = db.createLiveClass(subject, topic, nameToUse, currentUser.id);
    
    setSubject('Computer Science');
    setTopic('');
    handleRefreshClasses();
    
    // Auto-join the hosted class!
    setActiveSession(created);
    setIsJoined(true);
    onRefreshAll();
  };

  // Join existing class room
  const handleJoinClass = (session: LiveClassSession) => {
    setActiveSession(session);
    setIsJoined(true);
    
    // Write system log
    db.addLog('SYSTEM', `${currentUser.fullName} connected to Live Online Class for "${session.subject}".`, 'info');
    onRefreshAll();
    handleRefreshClasses();
  };

  // Chat send trigger
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeSession) return;

    db.addLiveClassChatMessage(activeSession.id, currentUser.fullName, currentUser.role, chatInput);
    setChatInput('');
    handleRefreshClasses();
    onRefreshAll();
  };

  const handleEndClass = () => {
    if (!activeSession) return;
    db.endLiveClass(activeSession.id);
    setIsJoined(false);
    setActiveSession(null);
    handleRefreshClasses();
    onRefreshAll();
  };

  const handleLeaveClass = () => {
    setIsJoined(false);
    setActiveSession(null);
    handleRefreshClasses();
    onRefreshAll();
  };

  // --- WHITEBOARD WEB CANVAS FUNCTIONAL DRAWINGS ---
  const redrawWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activeSession) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear board and draw background
    ctx.fillStyle = '#090d1f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines for high-quality engineering feel
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Redraw all stored strokes
    activeSession.whiteboardStrokes.forEach(stroke => {
      if (stroke.points.length === 0) return;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'pencil' || stroke.tool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      } else if (stroke.tool === 'line') {
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      } else if (stroke.tool === 'rectangle') {
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];
        ctx.beginPath();
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      }
    });
  };

  const currentStrokeRef = useRef<WhiteboardStroke | null>(null);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Scale back coordinates because client bounds can differ from internal drawing dimensions
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top) * scaleY)
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Avoid drawing if drawing isn't initialized
    if (!activeSession) return;
    setIsDrawing(true);
    const coords = getCoordinates(e);

    currentStrokeRef.current = {
      tool: drawTool,
      color: drawTool === 'eraser' ? '#090d1f' : drawColor,
      width: drawTool === 'eraser' ? drawWidth * 4 : drawWidth,
      points: [coords]
    };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current || !activeSession || !canvasRef.current) return;
    e.preventDefault(); // Stop mobile scrolling elastic bounce
    
    const coords = getCoordinates(e);
    
    if (drawTool === 'pencil' || drawTool === 'eraser') {
      currentStrokeRef.current.points.push(coords);
      // Fast temporary line drawer to keep feedback instantaneous
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const pts = currentStrokeRef.current.points;
        ctx.strokeStyle = currentStrokeRef.current.color;
        ctx.lineWidth = currentStrokeRef.current.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    } else {
      // For shapes (line and rectangle), show live dragging guidelines
      redrawWhiteboard();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = currentStrokeRef.current.color;
        ctx.lineWidth = currentStrokeRef.current.width;
        const start = currentStrokeRef.current.points[0];
        ctx.beginPath();
        if (drawTool === 'line') {
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(coords.x, coords.y);
          ctx.stroke();
        } else if (drawTool === 'rectangle') {
          ctx.strokeRect(start.x, start.y, coords.x - start.x, coords.y - start.y);
        }
      }
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current || !activeSession) return;
    setIsDrawing(false);

    const coords = getCoordinates(e);
    if (drawTool === 'line' || drawTool === 'rectangle') {
      currentStrokeRef.current.points.push(coords);
    }

    // Save final stroke to database
    db.saveWhiteboardStroke(activeSession.id, currentStrokeRef.current);
    currentStrokeRef.current = null;
    
    handleRefreshClasses();
    onRefreshAll();
  };

  const handleClearWhiteboard = () => {
    if (!activeSession) return;
    db.clearWhiteboard(activeSession.id);
    handleRefreshClasses();
    onRefreshAll();
  };

  // Undo button deletes last stroke
  const handleUndoStroke = () => {
    if (!activeSession) return;
    activeSession.whiteboardStrokes.pop();
    handleRefreshClasses();
    onRefreshAll();
  };

  // AI/Auto Drawing Simulator: Teacher diagrams blockchain structure on the canvas
  const simulateTeacherDraw = () => {
    if (!activeSession) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Draw a network node circle representation
    const cx = Math.floor(100 + Math.random() * 400);
    const cy = Math.floor(80 + Math.random() * 140);
    const rad = 25;

    // Build points for circle approximation
    const points: { x: number; y: number }[] = [];
    for (let r = 0; r <= Math.PI * 2; r += 0.4) {
      points.push({
        x: Math.round(cx + Math.cos(r) * rad),
        y: Math.round(cy + Math.sin(r) * rad)
      });
    }

    db.saveWhiteboardStroke(activeSession.id, {
      tool: 'pencil',
      color: '#a855f7', // purple node
      width: 2,
      points
    });

    // Add caption labeling the formula
    db.saveWhiteboardStroke(activeSession.id, {
      tool: 'line',
      color: '#eab308', // gold vector arrow
      width: 2,
      points: [{ x: cx, y: cy }, { x: cx + 40, y: cy + 40 }]
    });

    handleRefreshClasses();
    onRefreshAll();
  };

  // Toast fading
  useEffect(() => {
    if (feedbackToast) {
      const timer = setTimeout(() => setFeedbackToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackToast]);

  return (
    <div className="space-y-4">
      {feedbackToast && (
        <div className="fixed top-20 right-4 z-50 rounded-xl bg-purple-950 border border-purple-500/40 px-4 py-3 text-xs text-purple-300 font-mono shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-fadeIn">
          ⚡ {feedbackToast}
        </div>
      )}

      {/* VIEW A: SCHEDULED CLASSROOMS & HOST BOARD */}
      {!isJoined && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
          
          {/* Main active list (col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-[#03081e] border border-cyan-500/20 p-4 rounded-xl flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/15">
                  <Video className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-orbitron text-pink-400 uppercase tracking-wider">C-SYNC Academic Class Network</h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">Shared virtual classrooms equipped with dual whiteboard drawing canvases</p>
                </div>
              </div>
              <span className="text-[9.5px] font-mono font-bold bg-[#09152b] border border-cyan-500/40 text-[#00f2ff] px-2.5 py-1 rounded-full uppercase">
                WEB RTC TUNNEL: ONLINE
              </span>
            </div>

            {/* List */}
            <div className="space-y-3">
              {classesList.length === 0 ? (
                <div className="p-10 bg-slate-950/60 border border-white/5 rounded-xl text-center">
                  <p className="text-slate-400 font-sans text-xs">No active lectures or study groups scheduled currently.</p>
                  {canHost && <p className="text-purple-400 font-mono text-[10px] uppercase mt-2">Deploy your lecture schema below to start!</p>}
                </div>
              ) : (
                classesList.map((c) => {
                  const isLive = c.status === 'LIVE';
                  return (
                    <div 
                      key={c.id}
                      className={`bg-slate-950/90 border rounded-xl p-4 transition-all hover:bg-slate-900/90 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                        isLive 
                          ? 'border-indigo-500/35 border-l-4 border-l-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.1)]' 
                          : 'border-white/5 opacity-80'
                      }`}
                    >
                      <div className="space-y-1.5 max-w-lg">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[8.5px] px-2 py-0.5 rounded font-black font-mono tracking-wide ${
                            isLive 
                              ? 'bg-red-950 text-red-400 border border-red-500/40 animate-pulse' 
                              : c.status === 'ENDED' 
                              ? 'bg-slate-900 text-slate-500 border border-white/5'
                              : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                          }`}>
                            • {c.status}
                          </span>
                          <span className="text-slate-400 text-[10.5px] font-mono font-semibold">{c.subject}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-100 font-sans leading-normal">{c.topic}</h4>
                        
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-400 pt-1">
                          <span className="flex items-center gap-1">Host: <strong className="text-purple-300">{c.hostName}</strong></span>
                          <span>Start: <strong className="text-slate-300">{c.startTime}</strong></span>
                          {isLive && (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 inline text-emerald-500" />
                              {c.participantsCount} Students Active
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-auto shrink-0 justify-end">
                        {isLive ? (
                          <button
                            onClick={() => handleJoinClass(c)}
                            className="flex-1 sm:flex-none py-2 px-4.5 bg-indigo-600 hover:bg-indigo-500 font-bold text-[10px] uppercase font-mono tracking-wider text-white rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md"
                          >
                            <Play className="w-3 h-3 text-white" /> Join Classroom
                          </button>
                        ) : c.status === 'UPCOMING' ? (
                          <button
                            onClick={() => {
                              c.status = 'LIVE';
                              handleJoinClass(c);
                            }}
                            className="flex-1 sm:flex-none py-2 px-4.5 bg-amber-600 hover:bg-amber-500 font-bold text-[10px] uppercase font-mono text-white rounded-lg transition-all"
                          >
                            Force Start
                          </button>
                        ) : (
                          <span className="text-slate-500 font-mono text-[9.5px] uppercase italic">Session Concluded</span>
                        )}
                        <a 
                          href={c.jitsiLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-2 border border-white/10 bg-black/40 hover:bg-black text-slate-400 hover:text-[#00f2ff] rounded-lg transition-colors"
                          title="Open physical stream on Jitsi Meet"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Schedular Sidebar (col-span-4) */}
          <div className="lg:col-span-4">
            <div className="p-4 bg-slate-950/90 border border-cyan-500/15 rounded-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-cyan-500/10 pb-2.5">
                <Plus className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase font-orbitron">Host New Session</h3>
              </div>

              {canHost ? (
                <form onSubmit={handleHostClass} className="space-y-3 font-sans text-xs">
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-mono font-bold mb-1">Lecture Category / Subject:</label>
                    <input 
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-[#02050f] border border-white/10 rounded-lg p-2.5 text-slate-100 font-medium focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-mono font-bold mb-1">Lecture Topic / Goal Description:</label>
                    <textarea 
                      rows={3}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Describe the lesson plan..."
                      className="w-full bg-[#02050f] border border-white/10 rounded-lg p-2.5 text-slate-100 font-medium focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-mono font-bold mb-1">Host Name Alias:</label>
                    <input 
                      type="text"
                      value={customHostName}
                      onChange={(e) => setCustomHostName(e.target.value)}
                      placeholder={currentUser.fullName || "Mrs. Kalyani T."}
                      className="w-full bg-[#02050f] border border-white/10 rounded-lg p-2.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
                    />
                    <span className="text-[9px] text-zinc-500 italic font-mono uppercase mt-1 block">Role elevation verified: {currentUser.role}</span>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-black text-[10px] uppercase text-white rounded-lg tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" /> Deploy Live Class Room
                  </button>
                </form>
              ) : (
                <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4.5 space-y-2">
                  <p className="text-amber-300 font-bold uppercase font-mono text-[9.5px]">Access Restricted</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Student profiles cannot schedule or initiate academic lectures. Start your emulator under a Faculty account (e.g., Dr. A. Siva Prasad, Mrs. Kalyani T.) or triple-click the CSYNC logo to log on through the Dev Deck.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* VIEW B: INTEGRATED ACTIVE LECTURE ROOM (WHITEBOARD + WEBCAM WEBRTC) */}
      {isJoined && activeSession && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-left animate-fadeIn">
          
          {/* Active room toolbar (col-span-12) */}
          <div className="col-span-12 bg-[#03081e] border border-indigo-500/30 p-3 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLeaveClass}
                className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 hover:text-white rounded-lg text-[10px] font-mono uppercase tracking-wide transition-all"
              >
                ← Leave Lecture
              </button>
              <div>
                <h3 className="text-xs font-black font-sans text-[#00f2ff] flex items-center gap-1.5 uppercase">
                  Class Room & Workspace
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 font-mono italic max-w-xl truncate mt-0.5">
                  [{activeSession.subject}] - Topic: "{activeSession.topic}"
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono shrink-0">
              <span className="text-[10px] text-purple-300 bg-purple-950/60 border border-purple-500/20 px-2 py-1 rounded-lg">
                Host: <strong className="text-white">{activeSession.hostName}</strong>
              </span>

              <a 
                href={activeSession.jitsiLink} 
                target="_blank" 
                rel="noreferrer" 
                className="text-[10px] text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 font-bold"
              >
                <Monitor className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Launch Jitsi External Meeting
              </a>

              {canHost && (
                <button
                  type="button"
                  onClick={handleEndClass}
                  className="px-2.5 py-1 bg-red-950 border border-red-500/30 text-red-400 hover:bg-red-900 text-[10px] rounded-lg cursor-pointer"
                >
                  Conclude Session
                </button>
              )}
            </div>
          </div>

          {/* LEFT COLUMN: CAMERA CHANNELS & TEXT COMPREHENSION CHAT (col-span-4) */}
          <div className="lg:col-span-4 space-y-3 flex flex-col justify-between">
            
            {/* Visual feed box */}
            <div className="bg-[#020512] border border-white/5 rounded-xl p-3 text-center space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[9px] font-mono uppercase text-slate-400">Webcam Feed Connection:</span>
                <span className="text-[8.5px] bg-slate-900 text-slate-500 border border-white/5 px-1.5 py-0.2 rounded font-sans uppercase">Simulated</span>
              </div>

              {/* simulated viewport window */}
              <div className="w-full aspect-video bg-black rounded-lg border border-white/5 relative flex items-center justify-center overflow-hidden">
                {isCamOn ? (
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="space-y-2 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-indigo-950/50 border border-indigo-500/25 flex items-center justify-center select-none">
                      <VideoOff className="w-6 h-6 text-indigo-400" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider">Webcam deactivated</span>
                  </div>
                )}
                
                {/* Floating name badge */}
                <div className="absolute bottom-2 left-2 bg-black/70 border border-white/10 px-2 py-0.5 rounded text-[8.5px] text-slate-300 font-mono select-none">
                  User: {currentUser.fullName}
                </div>

                {isHandRaised && (
                  <div className="absolute top-2 right-2 bg-amber-500/95 border border-amber-400 px-2.5 py-0.5 rounded-full text-[8px] text-slate-950 font-mono font-black animate-bounce flex items-center gap-0.5">
                    <Hand className="w-3 h-3 text-slate-950" /> Hand Raised
                  </div>
                )}
              </div>

              {/* Hardware trigger controls */}
              <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                <button
                  type="button"
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`py-1.5 rounded-lg border text-[9px] uppercase font-bold flex justify-center items-center gap-1.5 ${
                    isMicOn 
                      ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' 
                      : 'bg-red-950/60 border-red-500/30 text-red-400'
                  }`}
                >
                  {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  {isMicOn ? 'Mic: On' : 'Mic: Muted'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsCamOn(!isCamOn)}
                  className={`py-1.5 rounded-lg border text-[9px] uppercase font-bold flex justify-center items-center gap-1.5 ${
                    isCamOn 
                      ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' 
                      : 'bg-slate-900 border-white/10 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {isCamOn ? <Video className="w-3.5 h-3.5 text-emerald-400" /> : <VideoOff className="w-3.5 h-3.5" />}
                  {isCamOn ? 'Cam: On' : 'Cam: Off'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsHandRaised(!isHandRaised)}
                  className={`py-1.5 rounded-lg border text-[9px] uppercase font-bold flex justify-center items-center gap-1.5 ${
                    isHandRaised 
                      ? 'bg-amber-950/70 border-amber-500/40 text-amber-300' 
                      : 'bg-slate-900 border-white/10 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Hand className="w-3.5 h-3.5 text-amber-400" />
                  {isHandRaised ? 'Hand: Up' : 'Raise Hand'}
                </button>
              </div>
            </div>

            {/* Structured Academic chat container */}
            <div className="bg-[#020512] border border-white/5 rounded-xl p-3 flex flex-col h-[280px] justify-between relative">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider pb-1.5 border-b border-white/5 flex items-center justify-between">
                <span>💬 Classroom Live Chat Panel:</span>
                <span className="text-[8px] bg-slate-900 border border-white/5 text-slate-500 font-bold px-1 rounded">{activeSession.chatMessages.length} Messages</span>
              </div>

              {/* Msg feed */}
              <div className="flex-1 overflow-y-auto space-y-2 my-2.5 pr-0.5 text-left">
                {activeSession.chatMessages.map((m) => {
                  const isUserHost = m.senderName === activeSession.hostName;
                  return (
                    <div 
                      key={m.id} 
                      className={`p-2 rounded-lg text-[11px] leading-relaxed max-w-[95%] ${
                        isUserHost 
                          ? 'bg-indigo-950/40 border border-indigo-500/20 text-indigo-100' 
                          : m.senderName === 'System Broadcast'
                          ? 'bg-slate-900/45 border border-white/5 text-slate-400 italic font-mono'
                          : 'bg-slate-900 border border-white/5 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 border-b border-white/5 pb-0.5 mb-1">
                        <strong className={isUserHost ? 'text-purple-400' : 'text-cyan-400'}>{m.senderName} ({m.senderRole})</strong>
                        <span>{m.timestamp}</span>
                      </div>
                      <p>{m.message}</p>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Send Form */}
              <form onSubmit={handleSendChatMessage} className="flex gap-1.5">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Enter dynamic question..."
                  className="flex-1 text-[11px] bg-[#030612] border border-white/15 rounded-lg px-2.5 py-1.5 text-slate-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
                />
                <button 
                  type="submit"
                  className="p-1 px-3 bg-pink-600 hover:bg-pink-500 rounded-lg text-white font-mono text-[10px] uppercase transition-colors"
                >
                  Send
                </button>
              </form>
            </div>

            {/* Interaction simulation quick actions */}
            <div className="bg-[#020512] border border-indigo-500/10 rounded-xl p-3 flex items-center justify-between text-left">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-400 block uppercase">Student Interaction Simulator:</span>
                <p className="text-[9px] text-slate-500">Enable smart autogenerated class feedback and lecturer drafts</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAutoSimulateInteractions(!autoSimulateInteractions)}
                  className={`text-[9px] font-mono px-3 py-1.5 rounded-lg border uppercase font-extrabold ${
                    autoSimulateInteractions 
                      ? 'bg-purple-950 text-purple-300 border-purple-500/35' 
                      : 'bg-slate-930 text-slate-500 border-white/5'
                  }`}
                >
                  {autoSimulateInteractions ? 'Active: ON' : 'Inactive: OFF'}
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: INTERACTIVE WHITEBOARD CANVAS WORKSPACE (col-span-8) */}
          <div className="lg:col-span-8 bg-[#090d1f] border border-indigo-500/20 rounded-xl p-3 relative flex flex-col justify-between h-[515px]">
            
            {/* Whiteboard Controls Panel */}
            <div className="flex justify-between items-center bg-black/60 p-2.5 rounded-lg border border-white/5 mb-2.5">
              
              {/* Tool Picker */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[8.5px] font-mono text-slate-500 uppercase mr-1 hidden sm:inline">Tools:</span>
                
                <button
                  type="button"
                  onClick={() => setDrawTool('pencil')}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-all ${
                    drawTool === 'pencil' 
                      ? 'bg-cyan-950 text-[#00f2ff] border-[#00f2ff]/40' 
                      : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  ✏️ Pencil
                </button>

                <button
                  type="button"
                  onClick={() => setDrawTool('line')}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-all ${
                    drawTool === 'line' 
                      ? 'bg-cyan-950 text-[#00f2ff] border-[#00f2ff]/40' 
                      : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  📏 Line
                </button>

                <button
                  type="button"
                  onClick={() => setDrawTool('rectangle')}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-all ${
                    drawTool === 'rectangle' 
                      ? 'bg-cyan-950 text-[#00f2ff] border-[#00f2ff]/40' 
                      : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  ⬜ Rect
                </button>

                <button
                  type="button"
                  onClick={() => setDrawTool('eraser')}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-all ${
                    drawTool === 'eraser' 
                      ? 'bg-pink-950 text-pink-400 border-pink-500/40' 
                      : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  🧼 Eraser
                </button>
              </div>

              {/* Stroke thickness */}
              <div className="flex items-center gap-2 font-mono text-[9.5px]">
                <span className="text-slate-500 hidden sm:inline">Size:</span>
                <input 
                  type="range" 
                  min="1" 
                  max="12" 
                  value={drawWidth} 
                  onChange={(e) => setDrawWidth(Number(e.target.value))}
                  className="w-12 sm:w-16 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[#00f2ff] font-bold">{drawWidth}px</span>
              </div>

            </div>

            {/* WHITEBOARD HTML5 CANVAS SURFACE */}
            <div className="flex-1 bg-black rounded-lg border border-[#00f2ff]/5 relative overflow-hidden flex items-stretch">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair block select-none bg-[#090d1f]"
              />
              
              {/* Floating Instructions Layer */}
              <div className="absolute top-2 left-2 pointer-events-none select-none bg-black/50 border border-white/10 p-1.5 px-3 rounded-lg text-[8px] font-mono text-zinc-500 tracking-wide uppercase">
                Drag to Draw on Interactive Board • Sync Enabled
              </div>
            </div>

            {/* Whiteboard Footer actions: Color picker and actions */}
            <div className="flex justify-between items-center bg-black/60 p-2 rounded-lg border border-white/5 mt-2.5 gap-2.5">
              
              {/* Color picker */}
              <div className="flex items-center gap-1.5">
                <span className="text-[8.5px] font-mono text-slate-500 uppercase hidden sm:inline">Color:</span>
                {[
                  { hex: '#00f2ff', label: 'Cyan' },
                  { hex: '#a855f7', label: 'Purple' },
                  { hex: '#eab308', label: 'Gold' },
                  { hex: '#ef4444', label: 'Red' },
                  { hex: '#10b981', label: 'Green' },
                  { hex: '#ffffff', label: 'White' }
                ].map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => {
                      setDrawColor(color.hex);
                      if (drawTool === 'eraser') setDrawTool('pencil');
                    }}
                    className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                      drawColor === color.hex && drawTool !== 'eraser' ? 'scale-125 border-white' : 'border-black/50'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.label}
                  />
                ))}
              </div>

              {/* Flush and undo triggers */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={simulateTeacherDraw}
                  className="px-2 py-1 bg-purple-950/70 border border-purple-500/30 text-purple-300 hover:text-white rounded text-[9px] font-mono uppercase font-bold transition-all"
                  title="Generate a geometric layout or cryptocurrency formula diagrammatically"
                >
                  🤖 Teacher Diagram Draft
                </button>

                <button
                  type="button"
                  onClick={handleUndoStroke}
                  className="px-2 py-1 bg-slate-900 border border-white/10 text-slate-400 hover:text-zinc-200 rounded text-[9.5px] font-mono uppercase transition-all"
                >
                  ↩ Undo Draw
                </button>

                <button
                  type="button"
                  onClick={handleClearWhiteboard}
                  className="px-2 py-1 bg-red-950/50 border border-red-500/20 text-red-400 hover:text-white rounded text-[9.5px] font-mono uppercase transition-all"
                >
                  🧹 Clear Board
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
