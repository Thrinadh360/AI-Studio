import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Search, User, Shield, Users, HelpCircle, ChevronRight, 
  ChevronDown, Volume2, Play, CheckCircle2, Terminal, Cpu, Award, 
  MapPin, Radio, Key, FileText, AlertTriangle, MessageSquare, Briefcase, 
  Calendar, RotateCw, Activity, Heart, AlertCircle, Sparkles
} from 'lucide-react';
import { ClientDatabase } from '../clientDb';
import { playVoice, playHaptic } from '../feedback';
import { safeStorage } from '../utils/safeStorage';

const localStorage = safeStorage;

interface UserManualHubProps {
  db: ClientDatabase;
  onRefreshAll?: () => void;
  overrideCurrentUser?: any;
}

interface ManualTopic {
  id: string;
  role: 'All' | 'Student' | 'Faculty' | 'Parent' | 'Admin';
  title: string;
  category: string;
  shortDesc: string;
  icon: any;
  steps: string[];
  tips: string[];
  visualMock?: {
    type: 'terminal' | 'badge' | 'geofence' | 'flow';
    title: string;
    lines: string[];
  };
}

export const UserManualHub: React.FC<UserManualHubProps> = ({ db, overrideCurrentUser }) => {
  const userRole = overrideCurrentUser?.role || 'Student';
  const isDeveloper = !!overrideCurrentUser?.isDeveloper;
  const isUserAdmin = userRole === 'Admin' || isDeveloper;
  const isUserStaff = userRole === 'Staff' || userRole === 'HOD';

  const isTopicAllowed = (topicRole: 'All' | 'Student' | 'Faculty' | 'Parent' | 'Admin') => {
    if (isUserAdmin) return true;
    if (isUserStaff) {
      return topicRole === 'Student' || topicRole === 'Faculty';
    }
    // Students can see student manual only
    return topicRole === 'Student';
  };

  const initialRoleFilter = isUserAdmin ? 'All' : (isUserStaff ? 'Faculty' : 'Student');
  const initialActiveTopicId = isUserAdmin 
    ? 'admin-sovereign' 
    : (isUserStaff ? 'leaves-approval' : 'student-attendance');

  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'All' | 'Student' | 'Faculty' | 'Parent' | 'Admin'>(initialRoleFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopicId, setActiveTopicId] = useState<string | null>(initialActiveTopicId);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // Synchronize on login session switches
  React.useEffect(() => {
    setSelectedRoleFilter(isUserAdmin ? 'All' : (isUserStaff ? 'Faculty' : 'Student'));
    setActiveTopicId(isUserAdmin ? 'admin-sovereign' : (isUserStaff ? 'leaves-approval' : 'student-attendance'));
  }, [userRole, isDeveloper]);

  // Diagnostic Sandbox States
  const [selectedDiagnoseIssue, setSelectedDiagnoseIssue] = useState<string>('gps-boundary');
  const [diagnoseProgress, setDiagnoseProgress] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [diagnoseLogs, setDiagnoseLogs] = useState<string[]>([]);

  const handleDiagnose = () => {
    playHaptic('light');
    setDiagnoseProgress('running');
    setDiagnoseLogs(['Initializing C-SYNC Diagnostic Watchdog...', 'Querying local IndexedDB cluster state...']);
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 1) {
        if (selectedDiagnoseIssue === 'gps-boundary') {
          setDiagnoseLogs(prev => [...prev, 'Probing physical GPS / browser geolocation bounds...', 'Detected Client Latency: 12ms. Geofence radius limit: 150m.', '⚠️ SENTRY WARN: Current simulated coordinate feels outside main college borders.']);
        } else if (selectedDiagnoseIssue === 'mismatch-fp') {
          setDiagnoseLogs(prev => [...prev, 'Reading local hardware signature (csync_device_fingerprint)...', 'FP Signature: ' + (localStorage.getItem('csync_device_fingerprint') || 'FP-NOT-BOUND'), '⚠️ SENTRY ALERT: Registered DB device token does not match client hardware browser hash.']);
        } else if (selectedDiagnoseIssue === 'mfa-otp') {
          setDiagnoseLogs(prev => [...prev, 'Inspecting Telegram Core Router state...', 'Last OTP Dispatch UTC: ' + new Date().toISOString(), 'Status: Pipeline active. Waiting for inbound verify handshake.']);
        } else {
          setDiagnoseLogs(prev => [...prev, 'Inspecting nearby P2P acoustic mesh...', 'Frequency channel: 18.5kHz sub-audible.', 'Workstation heartbeats checked: 4 units online.']);
        }
      } else if (step === 2) {
        if (selectedDiagnoseIssue === 'gps-boundary') {
          setDiagnoseLogs(prev => [...prev, '💡 RECOMMENDATION: Click the GP-Coordinates geofence bypass multiplier inside the Companion Access panel. It will force a simulated location inside the Maddilapalem quadrangle!']);
          setDiagnoseProgress('success');
        } else if (selectedDiagnoseIssue === 'mismatch-fp') {
          setDiagnoseLogs(prev => [...prev, '💡 RECOMMENDATION: File an automated secure hardware reset (Device Change Request) inside the panel root, or scan the Admin Master QR code to register your phone interface instantly.']);
          setDiagnoseProgress('success');
        } else if (selectedDiagnoseIssue === 'mfa-otp') {
          setDiagnoseLogs(prev => [...prev, '💡 RECOMMENDATION: Open the C-Sync Telegram Net bot channel, type /newbot or type any phrase. Your dispatch system is running perfectly but requires active telegram routing.']);
          setDiagnoseProgress('success');
        } else {
          setDiagnoseLogs(prev => [...prev, '💡 RECOMMENDATION: Open your workstation terminal, log in via your biometric login card, and keep both tabs open to allow seamless, local file beaming.']);
          setDiagnoseProgress('success');
        }
        clearInterval(interval);
      }
    }, 1000);
  };

  const manualTopics: ManualTopic[] = [
    {
      id: 'student-attendance',
      role: 'Student',
      title: 'Biometric Face & GPS Attendance',
      category: 'Core Access',
      shortDesc: 'Understand how C-SYNC verifies your campus boundaries and registers daily morning (FN) and afternoon (AN) presence.',
      icon: Radio,
      steps: [
        '1. Log into your companion portal using your student credentials (e.g. CS-25603). Check that you are within the 150-meter geofenced radius.',
        '2. Navigate to the access control tab. The system analyzes your simulated GPS distance or real mobile sensors to bind campus territory.',
        '3. Position your face in front of your front or rear camera. The local neural vision filter scans your face profile and matches your stored biometric template.',
        '4. Maintain a clear frame until the system says "Verified." Your current FN or AN register changes immediately to PRESENT, backed by an immutable ledger entry.'
      ],
      tips: [
        'If you are off-campus, the system locks attendance in adherence with UGC anti-proxy rules.',
        'For remote simulation purposes and browser testing, use the manual "Simulated Proximity Distance" slider to pull your location inside bounds.'
      ],
      visualMock: {
        type: 'geofence',
        title: 'Geofence Sentry Telemetry Map',
        lines: [
          'GPS COORDINATES: 17.7406° N, 83.3212° E (Maddilapalem)',
          'SATELLITE ACCURACY: ±3.0 Meters (High Accuracy)',
          'GEOFENCE RADIUS LIMIT: 150.0 Meters',
          'CURRENT MEASURED DISTANCE: 1.5 Meters [OK - INSIDE BOUNDS]',
          'STATUS: Biometric Check-In Pipeline unlocked.'
        ]
      }
    },
    {
      id: 'device-security',
      role: 'Student',
      title: 'Hardware Biometric Signature Reset',
      category: 'Security Protocols',
      shortDesc: 'Approved mobile devices prevent login theft. Learn what to do if you switch phones or change browsers.',
      icon: Key,
      steps: [
        '1. When you access C-SYNC from a fresh phone, the sentry flags a device fingerprint mismatch to prevent attendance hijacking.',
        '2. Click "Apply for Device Reset" on the warning console.',
        '3. Enter your account credentials, describe the reason (e.g. "Replaced damaged mobile device"), and submit the secure request.',
        '4. Faculty staff or Dr. A. Siva Prasad receives a security notification inside their controller. Once approved, your new device binds instantly.'
      ],
      tips: [
        'You can check approved status in real-time. The portal will automatically log you in from your new device the moment they approve it.',
        'For urgent needs, ask any computer science lab HOD to override hardware locks using their master staff card.'
      ],
      visualMock: {
        type: 'flow',
        title: 'Hardware Signature Binding Lifecycle',
        lines: [
          '[NEW DEV: Browser Fingerprint Hash CSY-8820A3] -> BLOCKED',
          '[REQUEST DISPATCHED] -> Reason: Mobile Replaced',
          '[HOD APPROVAL FLOW] -> Dr. Siva Prasad approved',
          '[DB RE-KEY] -> Bound current device fingerprint as default',
          'STATUS: Active secure terminal keys updated successfully.'
        ]
      }
    },
    {
      id: 'leaves-approval',
      role: 'Faculty',
      title: 'Facilitator Leave Tracker Management',
      category: 'Academic Control',
      shortDesc: 'As a Lecturer or HOD, review, escalate, or resolve leave requests submitted by students under NAAC parameters.',
      icon: Calendar,
      steps: [
        '1. Log into your account (e.g. HOD-CS-01 / Assistant Professor Sravani). Navigate to the "Leaves" tab.',
        '2. You will see a glowing yellow counter showing any outstanding "PENDING" leave requests from undergraduate students.',
        '3. Click on a request to view details: start/end dates, rationale, and student profile statistics.',
        '4. Click "Approve" (granting automatic daily attendance excusals) or "Reject" (requiring reasons). For senior issues, staff can click "Escalate to HOD".'
      ],
      tips: [
        'Each approved leave creates a cryptographic pass on the student PWA. They can download it as some JSON signature proof.',
        'HOD decisions are final and override baseline attendance exceptions instantly.'
      ],
      visualMock: {
        type: 'terminal',
        title: 'Academic Leave Ledger Control',
        lines: [
          'LEDGER QUERY: SELECT COUNT(*) FROM academic_leaves WHERE current_status = "PENDING"',
          'FOUND: 2 active request files awaiting verification.',
          '>> [ACTION] Approve student leave CS-25603 (M. Thrinadh)',
          '>> [DATABASE WRITE] Mutated status "PENDING" to "APPROVED"',
          '>> LOGGED: Cryptographic Slip CSY-L-952 verified successfully.'
        ]
      }
    },
    {
      id: 'parent-sentry',
      role: 'Parent',
      title: 'Parental Sentry Monitor Panel',
      category: 'Safety & Tracking',
      shortDesc: 'Enable parents to monitor student progress, location bounds, daily streaks, or safety distress logs.',
      icon: Users,
      steps: [
        '1. In the login screen, select the "Parent" role. Sign in using your registered mobile number associated with the student profile.',
        '2. The Guardian Dashboard provides real-time access to student attendance history, current campus coordinates status, and direct reports.',
        '3. Track active Daily Streaks (e.g. 12 Days) indicating commitment, and review performance stars (Dedication, Resilience, Honesty).',
        '4. If an evacuation siren or physical distress trigger is activated, alert warnings are immediately pushed onto the screen.'
      ],
      tips: [
        'Ensure the student keeps their GPS tracking active to enable live territory audits.',
        'Any approved academic leave appears directly in your parent panel log, complete with faculty remarks and signature dates.'
      ],
      visualMock: {
        type: 'badge',
        title: 'Guardian Sentry Dashboard Overview',
        lines: [
          'LINKED STUDENT ID: CS-25603 (M. Thrinadh) • Batch: 2025-29',
          'CAMPUS LOCATION: [ONLINE - Safe quadrangle area]',
          'DAILY ATTENDANCE RATE: 96.8% (Rating: Exceeding Expectations)',
          'REPUTATION INDEX: 94/100 (Level 4 System Overlord)',
          'CONTACT FACULTY: Mrs. Kalyani (Lecturer) -> Connected via whatsapp proxy'
        ]
      }
    },
    {
      id: 'admin-sovereign',
      role: 'Admin',
      title: 'Sovereign QR Lock and MFA OTP System',
      category: 'Sovereign Control',
      shortDesc: 'Master guide for administrator control: scan bypass, roster database control, and virtual schoolroom setups.',
      icon: Shield,
      steps: [
        '1. Navigate to /admin. Real terminal security requires sovereign authorization.',
        '2. Two-Factor Handshake: Use the interactive "Admin OTP Widget" to simulate an instant OTP request securely generated by the physical lab network.',
        '3. QR Scanner: Open your companion web camera via "Desk Webcam" or click "Simulate QR Match" to acquire sovereign credentials.',
        '4. Explore the administration panel: edit student roles, schedule technicians, resolve workstation hardware complaints, or view live central audits.'
      ],
      tips: [
        'To flush experimental data and testing rosters, scroll down in the Admin overview panel. Click "Corrupt Database Reset" to restore a clean, vacant system.',
        'Always check the MAC list. Inactive or offline heartbeats can trigger sentry hardware alarms.'
      ],
      visualMock: {
        type: 'terminal',
        title: 'Central War Room Sentry Console',
        lines: [
          'ACTIVE SESSION: Administrator Sovereign (M. Thrinadh)',
          'SOVEREIGN TOKEN: [CSYNC-OK-V4]',
          'SYSTEM UPTIME: 99.98% over Maddilapalem nodes',
          'CONNECTED FIELD KIOSKS: 3 units active [CS-01, CS-02, CS-03]',
          'GEOFENCE THREATS: 0 alerts | SECURE ENVIRONMENT ESTABLISHED'
        ]
      }
    }
  ];

  const faqs = [
    {
      question: 'Why does the app say "SENTRY ALERT: GPS Out of College Bounds"?',
      answer: 'C-SYNC uses high-fidelity geofence loops. If you are study-from-home, or testing in a sandbox, you might be outside college territory. To resolve, drag the Simulated Proximity Distance slider inside the main Access tab back to "Inside College Bounds (<150m)".'
    },
    {
      question: 'How do virtual micro-bots work in the Messenger?',
      answer: 'Students can create personal AI bots (like "Syllabus Bot" or "Security Advisor") inside the Telegram messenger tab. Simply click "/newbot", type your custom triggers (e.g., "syllabus"), write a helpful default response, and compile it instantly to the campus bot directory.'
    },
    {
      question: 'What is the P2P Direct File Beam, and how do I transmit documents?',
      answer: 'Inside the C-Sync Ecosystem Hub tab, select "P2P Beam". You can drag and drop PDF lecture notes or homework assignments. The system splits them into secure 16KB blocks and beams them directly to other local workstations using high-performance subnets.'
    },
    {
      question: 'As a Parent, how do I link to multiple student accounts?',
      answer: 'Parents are automatically linked to their children using the student ID Number (e.g. CS-25603). Under NAAC guidelines, the student mobile and parent mobile registers are linked in the central roster table, mapping history views smoothly.'
    }
  ];

  const handleSpeech = (text: string) => {
    playHaptic('light');
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[^a-zA-Z0-9\s.,?!:]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-Speech is not supported in this environment segment.");
    }
  };

  const filteredTopics = manualTopics.filter(topic => {
    // Role level isolation check
    if (!isTopicAllowed(topic.role)) return false;

    const matchesRole = selectedRoleFilter === 'All' || topic.role === selectedRoleFilter;
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          topic.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          topic.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const activeTopic = manualTopics.find(t => t.id === activeTopicId && isTopicAllowed(t.role)) || manualTopics.find(t => isTopicAllowed(t.role));

  return (
    <div id="user-manual-knowledge-base" className="w-full text-slate-100 flex flex-col space-y-5 animate-fadeIn">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-950/80 border border-cyan-500/15 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md text-left">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-950/40 border border-cyan-500/20 text-[#00f2ff] rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-orbitron font-extrabold text-white tracking-tight uppercase flex items-center gap-2">
                Unified Portal User Manual
                <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">KNOWLEDGE BASE V4</span>
              </h1>
              <p className="text-slate-400 text-[10px] uppercase font-mono mt-1 tracking-wider leading-relaxed">
                Step-by-step operator guidelines, biometric check-ins, security bypasses, and physical workstation manual
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playVoice("Welcome to the C-SYNC Interactive System manual. Tap any section or click speech to hear guidelines.");
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-400 text-[9px] font-mono font-black uppercase rounded-lg transition-all active:scale-95 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Listen Welcome Voice
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTER BOX */}
      <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search operational topics, system guidelines, error codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#030614] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs font-sans text-white focus:outline-none focus:border-cyan-500/55 transition-colors placeholder:text-slate-500 text-left"
          />
        </div>

        {/* ROLE SELECTION TAB PILLS */}
        <div className="flex flex-wrap gap-1.5 justify-center w-full md:w-auto">
          {(['All', 'Student', 'Faculty', 'Parent', 'Admin'] as const)
            .filter(role => {
              if (role === 'All') return isUserAdmin;
              return isTopicAllowed(role);
            })
            .map(role => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  playHaptic('light');
                  setSelectedRoleFilter(role);
                }}
                className={`px-3 py-1.5 rounded-lg text-[9px] uppercase font-bold font-mono transition-all duration-150 cursor-pointer ${
                  selectedRoleFilter === role 
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30' 
                    : 'bg-black/20 hover:bg-white/5 text-slate-400'
                }`}
              >
                {role === 'All' ? '🌐 ALL ROLES' : role === 'Admin' ? '🛡️ Admin' : role === 'Faculty' ? '👥 Staff' : `👤 ${role}`}
              </button>
            ))
          }
        </div>
      </div>

      {/* CORE DOUBLE BLOCK GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: GUIDES LIST */}
        <div className="lg:col-span-4 flex flex-col gap-2.5 w-full">
          <h2 className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest text-left mb-1 px-1">
            📂 Operational Walkthroughs ({filteredTopics.length})
          </h2>
          {filteredTopics.map(topic => {
            const isSelected = activeTopicId === topic.id;
            const TopicIcon = topic.icon;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => {
                  playHaptic('light');
                  setActiveTopicId(topic.id);
                }}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer group active:scale-99 ${
                  isSelected 
                    ? 'bg-cyan-950/25 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                    : 'bg-slate-950/50 hover:bg-slate-900 border-white/5'
                }`}
              >
                <div className={`p-2.5 rounded-lg border flex-shrink-0 transition-colors ${
                  isSelected 
                    ? 'bg-cyan-950/40 border-cyan-500/20 text-[#00f2ff]' 
                    : 'bg-slate-900 border-white/5 text-slate-500'
                }`}>
                  <TopicIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[7.5px] font-mono font-extrabold px-1.5 py-0.5 rounded-full bg-slate-900 border border-white/5 text-slate-400 capitalize">
                      {topic.role} • {topic.category}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-[2px] text-[#00f2ff]' : 'text-slate-600'}`} />
                  </div>
                  <h3 className={`font-bold font-sans text-[11px] mt-1.5 leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {topic.title}
                  </h3>
                  <p className="text-[9.5px] text-slate-400 font-sans leading-relaxed truncate mt-1">
                    {topic.shortDesc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN: DETAIL VIEW & WORKSTATION DIAGNOSTICS */}
        <div className="lg:col-span-8 space-y-5 w-full">
          
          {/* DETAILED WALKTHROUGH BOX */}
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-md relative text-left">
            <span className="absolute top-2 right-3 text-[7.5px] font-mono font-bold text-slate-500 uppercase tracking-widest leading-none">
              WALKTHROUGH PREVIEW
            </span>

            {activeTopic ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="space-y-1">
                    <span className="text-[8px] bg-[#00f2ff]/10 text-[#00f2ff] border border-cyan-500/20 px-2 py-0.5 rounded-full uppercase font-mono font-extrabold tracking-wider">
                      {activeTopic.category} • {activeTopic.role} ROLE
                    </span>
                    <h2 className="text-sm md:text-base font-orbitron font-extrabold text-white mt-1 uppercase tracking-tight">
                      {activeTopic.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSpeech(activeTopic.title + ". " + activeTopic.shortDesc + ". Steps defined below. " + activeTopic.steps.join(". "))}
                    className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 hover:bg-[#00f2ff]/20 border border-cyan-500/30 rounded-lg text-[9px] text-[#00f2ff] font-bold font-mono uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-cyan-400" />
                    <span>Speak Walkthrough</span>
                  </button>
                </div>

                <p className="text-[11.5px] text-slate-350 font-sans leading-relaxed">
                  {activeTopic.shortDesc}
                </p>

                {/* VISUAL LAYOUT SIMULATED TERMINAL DISPLAY (IF EXISTS) */}
                {activeTopic.visualMock && (
                  <div className="bg-black/95 border border-cyan-500/20 rounded-xl p-4 font-mono text-[9px] text-zinc-300 relative select-text shadow-inner">
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-slate-600 text-[7px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>SECURE MONITOR</span>
                    </div>
                    <div className="text-cyan-500 font-extrabold uppercase border-b border-white/5 pb-11.5 mb-2 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      {activeTopic.visualMock.title}
                    </div>
                    <div className="space-y-1 select-text">
                      {activeTopic.visualMock.lines.map((line, idx) => (
                        <div key={idx} className="truncate select-text">
                          <span className="text-slate-600 mr-1.5">&gt;</span>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FLOW STEPS */}
                <div className="space-y-3.5">
                  <h3 className="text-[9.5px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    🏁 Step-by-Step Operator Flow
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {activeTopic.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start p-3 bg-slate-900/40 border border-white/5 rounded-xl">
                        <div className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-500/35 text-[9px] font-mono font-bold text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-[11px] text-slate-350 leading-relaxed font-sans">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PRACTICAL TIPS */}
                <div className="p-4 bg-emerald-950/25 border border-emerald-500/20 rounded-xl text-left space-y-2">
                  <h4 className="text-[9px] font-mono font-get font-black uppercase text-emerald-400 tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Facilitator Pro-Tips & Bypasses
                  </h4>
                  <ul className="space-y-1">
                    {activeTopic.tips.map((tip, idx) => (
                      <li key={idx} className="text-[10px] text-slate-350 font-sans leading-relaxed flex items-start gap-1.5">
                        <span className="text-emerald-500 font-mono text-[10px] mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            ) : (
              <p className="text-xs text-slate-500 py-10 text-center font-mono">Select an operational manual topic on the left to review documentation walk.</p>
            )}

          </div>

          {/* INTERACTIVE COMPANION DIAGNOSTIC SANDBOX */}
          <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-md relative text-left">
            <div className="absolute top-2 right-3">
              <span className="flex items-center gap-1 text-[8.5px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase leading-none font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                LIVE SHELL SOLVER
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-[#00f2ff]/10 text-[#00f2ff] rounded-lg">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-orbitron font-extrabold text-white text-xs uppercase">Interactive Companion Diagnostic Console</h3>
                <p className="text-slate-500 text-[8.5px] uppercase font-mono mt-0.5 tracking-wider">Troubleshoot geofences, physical heartbeats, or login MFA pipeline blocks in realtime</p>
              </div>
            </div>

            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans mb-4">
              Select any clinical issue below, then trigger the diagnosis engine to inspect mock-database state keys and find actionable recovery guidance inside this preview instance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start font-mono">
              <div className="md:col-span-4 flex flex-col gap-2 w-full">
                <span className="text-[8px] text-cyan-400 uppercase tracking-widest font-bold">Select Active Issue:</span>
                <select 
                  value={selectedDiagnoseIssue}
                  onChange={(e) => setSelectedDiagnoseIssue(e.target.value)}
                  className="w-full bg-[#030614] border border-white/10 rounded-lg p-2 text-[10.5px] text-white focus:outline-none focus:border-cyan-500/40 uppercase font-bold"
                >
                  <option value="gps-boundary">1. GPS GEOFENCE EXPIRED / OUT OF college BOUNDS</option>
                  <option value="mismatch-fp">2. DEVICE FINGERPRINT MISMATCH / RED SEC ALERT</option>
                  <option value="mfa-otp">3. TELEGRAM CHAT OTP DIRECT ROUTE BLOCKED</option>
                  <option value="p2p-beam">4. P2P ACOUSTIC BEAM STUCK IN TRANSMISSION</option>
                </select>

                <button
                  type="button"
                  onClick={handleDiagnose}
                  disabled={diagnoseProgress === 'running'}
                  className="w-full bg-cyan-900/30 border border-cyan-500/45 text-cyan-300 hover:bg-[#00f2ff]/20 hover:text-white px-2.5 py-2 text-[9.5px] uppercase font-bold rounded-lg cursor-pointer transition-all active:scale-97 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${diagnoseProgress === 'running' ? 'animate-spin text-cyan-300' : ''}`} />
                  <span>Execute Diagnostic</span>
                </button>
              </div>

              <div className="md:col-span-8 bg-black/95 border border-white/10 rounded-xl p-3.5 h-28 font-mono text-[8.5px] text-emerald-400 overflow-y-auto select-text shadow-inner">
                {diagnoseProgress === 'idle' ? (
                  <div className="flex flex-col items-center justify-center py-7 text-slate-600">
                    <span>SENTRY DIAGNOSTICS IDLE. SELECT CRITERIA AND RUN AUDIT.</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {diagnoseLogs.map((log, idx) => {
                      let color = 'text-slate-400';
                      if (log.includes('OK') || log.includes('SUCCESS') || log.includes('RECOMMENDATION')) color = 'text-[#00ffd2] font-semibold';
                      if (log.includes('⚠️') || log.includes('WARN') || log.includes('ALERT')) color = 'text-amber-500';
                      return (
                        <div key={idx} className={`${color} leading-relaxed select-text truncate`}>
                          <span className="text-zinc-600 mr-1.5">&gt;&gt;</span>
                          {log}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* EXPANDED FAQ ACCORDION SECTION */}
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-md relative text-left">
            <h3 className="font-orbitron font-extrabold text-white text-xs uppercase mb-1.5 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400 animate-pulse" />
              Frequently Asked Troubleshooting Inquiries
            </h3>
            <p className="text-slate-500 text-[8.5px] uppercase font-mono mt-0.5 tracking-wider mb-4">
              Academic regulations, proxy restrictions, offline indexes, and backup connectivity
            </p>

            <div className="space-y-2.5">
              {faqs.map((faq, idx) => {
                const isExpanded = activeFaqIndex === idx;
                return (
                  <div key={idx} className="border border-white/5 rounded-xl overflow-hidden transition-all duration-200">
                    <button
                      type="button"
                      onClick={() => {
                        playHaptic('light');
                        setActiveFaqIndex(isExpanded ? null : idx);
                      }}
                      className="w-full bg-slate-900/35 hover:bg-slate-900 p-3 flex items-center justify-between gap-4 text-left cursor-pointer transition-colors"
                    >
                      <span className="font-bold font-sans text-[11px] text-slate-350 group-hover:text-white">
                        {faq.question}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180 text-cyan-400' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="bg-[#020614] border-t border-white/5 p-4 text-[10.5px] text-slate-400 leading-relaxed font-sans select-text"
                        >
                          <div className="flex gap-2.5 items-start">
                            <span className="font-mono text-cyan-500 font-extrabold flex-shrink-0">A:</span>
                            <p className="select-text">{faq.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
