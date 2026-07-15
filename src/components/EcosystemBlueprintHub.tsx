import React, { useState } from 'react';
import { 
  Shield, Smartphone, QrCode, MapPin, Compass, AlertCircle, CheckCircle2, 
  Sparkles, Cpu, Layers, Bot, Send, Wrench, GitPullRequest, Database, Users, 
  Activity, Calendar, Flame, Zap, Award, Info, Lock, ArrowRight, Server, PhoneCall,
  Check, Play, Plus, Trash2, Sliders, ShieldCheck, ChevronRight, CheckCircle, RefreshCw, AlertTriangle, FileText, Download, ArrowLeft, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClientDatabase } from '../remoteDb';

interface EcosystemBlueprintHubProps {
  db: ClientDatabase;
  onClose: () => void;
}

export const EcosystemBlueprintHub: React.FC<EcosystemBlueprintHubProps> = ({ db, onClose }) => {
  const [activeSegment, setActiveSegment] = useState<'attendance' | 'lifecycle' | 'safety' | 'infrastructure' | 'roles' | 'stlc'>('attendance');
  const [activePillar, setActivePillar] = useState<number>(0);
  const [demoStep, setDemoStep] = useState<string>('Idle');
  const [isSimulating, setIsSimulating] = useState(false);
  const [demoLogs, setDemoLogs] = useState<string[]>(['Ecosystem emulator ready.']);

  // STLC (Software Testing Life Cycle) Workspace Interactive States
  const [stlcPhase, setStlcPhase] = useState<number>(1);
  const [reviewedReqs, setReviewedReqs] = useState<{ id: string; desc: string; verified: boolean }[]>([
    { id: 'REQ-001', desc: 'Verify GPS coordinate calculations within GDC Maddilapalem campus bounds (300 meters maximum accuracy range).', verified: false },
    { id: 'REQ-002', desc: 'Secure biometric face pattern image matching inside local in-memory camera buffers.', verified: false },
    { id: 'REQ-003', desc: 'Enforce hardware-binding constraint (link single user session to verified MAC fingerprint).', verified: false },
    { id: 'REQ-004', desc: 'Enforce dual-session timing gates (Forenoon 10:00AM - 1:20PM, Afternoon 2:20PM - 5:00PM) automatically avoiding holidays.', verified: false },
    { id: 'REQ-005', desc: 'Allow modular bot generation and dispatch confirmations wirelessly.', verified: false },
    { id: 'REQ-006', desc: 'Capture high-speed media logs and locational telemetry instantly during emergency panic alerts.', verified: false },
  ]);

  const [automationTool, setAutomationTool] = useState<string>('Jest + React Testing Library Agent');
  const [testScope, setTestScope] = useState<string>('Full Regression & Cybersecurity Scan');
  const [testLead, setTestLead] = useState<string>('Mrs. Kalyani T. (CSE Instructor)');

  const [testCases, setTestCases] = useState<any[]>([
    { id: 'TC-001', title: 'Geofence Bound Violation Validation', priority: 'HIGH', desc: 'Simulate geolocation fetch > 300m away from coordinates [17.740697, 83.321251]', expected: 'Assert system raises LocationOutOfBounds block.', status: 'Untested', actual: '' },
    { id: 'TC-002', title: 'Biometric Face Landmark Hash Alignment Check', priority: 'HIGH', desc: 'Simulate face tracking coordinate mismatch in WebGL canvas stream.', expected: 'Assert system flags FaceTelemetryMismatch exception.', status: 'Untested', actual: '' },
    { id: 'TC-003', title: 'Timing Gate Isolation Outside Hours', priority: 'MEDIUM', desc: 'Trigger verify request at 1:40 PM (gap between sessions).', expected: 'Assert HTTP 403 Forbidden: Verification period closed.', status: 'Untested', actual: '' },
    { id: 'TC-004', title: 'Hardware Binding Integrity Check', priority: 'HIGH', desc: 'Submit session mark request from unregistered MAC address fingerprint.', expected: 'Assert DeviceUnrecognized security isolation triggered.', status: 'Untested', actual: '' },
    { id: 'TC-005', title: 'Emergency Panic Alert Dispatch', priority: 'HIGH', desc: 'Press SOS trigger. Dispatch canvas, location, and micro audio to Telegram Bot.', expected: 'Send message payload with status 200.', status: 'Untested', actual: '' },
    { id: 'TC-006', title: 'Academic Progression Cron', priority: 'LOW', desc: 'Fire mock cron trigger on June 1 to promote students.', expected: '1st & 2nd year students are promoted. 3rd year become Alumni.', status: 'Untested', actual: '' },
    { id: 'TC-007', title: 'Workstation Lockdown Override', priority: 'MEDIUM', desc: 'Sentry diagnostics check on CS-08 workstation flagged PENDING maintenance.', expected: 'Assert workstation dashboard block screen is active.', status: 'Untested', actual: '' },
  ]);

  const [showAddTc, setShowAddTc] = useState(false);
  const [newTcTitle, setNewTcTitle] = useState('');
  const [newTcPriority, setNewTcPriority] = useState('HIGH');
  const [newTcDesc, setNewTcDesc] = useState('');
  const [newTcExpected, setNewTcExpected] = useState('');

  // Environmental simulation parameters
  const [simStudentId, setSimStudentId] = useState<string>(() => {
    const students = db.getUsers().filter(u => u.role === 'Student');
    return students[0]?.id || '1';
  });
  const [simGpsDeviation, setSimGpsDeviation] = useState<number>(12); // meters. If > 300, TC-01 fails
  const [simFaceLandmarksVerified, setSimFaceLandmarksVerified] = useState<boolean>(true); // Checks TC-02
  const [simHwFingerprintVerified, setSimHwFingerprintVerified] = useState<boolean>(true); // Checks TC-04
  const [simWorkstationStatus, setSimWorkstationStatus] = useState<'PENDING' | 'UNDER_REPAIR' | 'RESOLVED'>('RESOLVED'); // Checks TC-07

  // Active testing run states
  const [isTestSuiteRunning, setIsTestSuiteRunning] = useState(false);
  const [testExecutionLogs, setTestExecutionLogs] = useState<string[]>([]);
  const [testRunPercent, setTestRunPercent] = useState(0);
  const [activeDefects, setActiveDefects] = useState<any[]>([]);

  const handleAddCustomTestCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTcTitle || !newTcDesc || !newTcExpected) return;
    const newId = `TC-${Date.now().toString().slice(-4)}`;
    const newCase = {
      id: newId,
      title: newTcTitle,
      priority: newTcPriority,
      desc: newTcDesc,
      expected: newTcExpected,
      status: 'Untested',
      actual: ''
    };
    setTestCases(prev => [...prev, newCase]);
    setNewTcTitle('');
    setNewTcDesc('');
    setNewTcExpected('');
    setShowAddTc(false);
  };

  const handleDeleteTestCase = (id: string) => {
    setTestCases(prev => prev.filter(tc => tc.id !== id));
  };

  const handleLogDefectToDb = (tc: any) => {
    const details = `Defect in ${tc.title}. Expected: ${tc.expected}. Env: Deviation=${simGpsDeviation}m, Face_Landmark=${simFaceLandmarksVerified ? 'Verified' : 'Failed'}.`;
    db.addStationIssue(
      'CS-01', 
      `STLC Defect: ${tc.id}`, 
      `${details} (Assigned to HOD Dr. A. Siva Prasad)`
    );
    setActiveDefects(prev => [...prev, {
      id: `DEF-${Math.floor(1000 + Math.random() * 9000)}`,
      testCaseId: tc.id,
      title: `STLC Test Case Defect: ${tc.title}`,
      severity: tc.priority,
      reportedBy: testLead,
      status: 'OPEN',
      details,
      timestamp: new Date().toLocaleDateString()
    }]);
    alert(`Defect logged successfully! This defect ticket has been injected into the global workstation issues database (CS-01) for technician review.`);
  };

  const runSTLCExecution = () => {
    if (isTestSuiteRunning) return;
    setIsTestSuiteRunning(true);
    setTestRunPercent(0);
    setTestExecutionLogs(['[QA_INIT] Instantiating Sandboxed QA Test Harness...', '[QA_INIT] Current Node target: csync.top / Razorhost node 4']);
    
    // Clear previous results
    setTestCases(prev => prev.map(tc => ({ ...tc, status: 'Running', actual: '' })));

    let logs: string[] = [];
    const addLog = (msg: string) => {
      const time = new Date().toLocaleTimeString();
      logs.push(`[${time}] ${msg}`);
      setTestExecutionLogs([...logs]);
    };

    // Step-by-step simulator
    setTimeout(() => {
      addLog('--- RUNNING TEST CASE TC-001: Geofence Limit Validation ---');
      addLog(`Selected Student ID: ${simStudentId}`);
      addLog(`Simulated GPS deviation distance: ${simGpsDeviation} meters (Threshold limit: 300m)`);
      const tc1Passed = simGpsDeviation <= 300;
      setTestCases(prev => prev.map(tc => tc.id === 'TC-001' ? {
        ...tc,
        status: tc1Passed ? 'Pass' : 'Fail',
        actual: tc1Passed 
          ? `SUCCESS: Student logged inside OK zone (${simGpsDeviation}m deviation).`
          : `BLOCKED ERROR: GPS radius exceeded bounds (${simGpsDeviation}m deviation). Block action met expectation.`
      } : tc));
      addLog(`TC-001 RESULT: ${tc1Passed ? 'PASS' : 'FAIL'} (${simGpsDeviation} meters)`);
      setTestRunPercent(15);
    }, 1000);

    setTimeout(() => {
      addLog('--- RUNNING TEST CASE TC-002: Biometric Landmark Alignment ---');
      addLog(`Analyzing landmarks array checked? ${simFaceLandmarksVerified ? 'YES' : 'NO'}`);
      const tc2Passed = simFaceLandmarksVerified;
      setTestCases(prev => prev.map(tc => tc.id === 'TC-002' ? {
        ...tc,
        status: tc2Passed ? 'Pass' : 'Fail',
        actual: tc2Passed
          ? 'SUCCESS: Local device camera captured aligned landmarks (Confidence: 98.2%).'
          : 'FAIL: Image capture misaligned. Landmarks hash could not be validated (0% match).'
      } : tc));
      addLog(`TC-002 RESULT: ${tc2Passed ? 'PASS' : 'FAIL'}`);
      setTestRunPercent(30);
    }, 2200);

    setTimeout(() => {
      addLog('--- RUNNING TEST CASE TC-003: Timing Gate Gating ---');
      addLog('Validating session timing bounds: Forenoon (10:00AM - 1:20PM) / Afternoon (2:20PM - 5:00PM)');
      setTestCases(prev => prev.map(tc => tc.id === 'TC-003' ? {
        ...tc,
        status: 'Pass',
        actual: 'SUCCESS: Timestamp successfully recognized inside Forenoon bounds.'
      } : tc));
      addLog('TC-003 RESULT: PASS');
      setTestRunPercent(50);
    }, 3405);

    setTimeout(() => {
      addLog('--- RUNNING TEST CASE TC-004: Hardware-Binding Check ---');
      addLog(`Hardware Fingerprint matches bound token? ${simHwFingerprintVerified ? 'YES' : 'NO'}`);
      const tc4Passed = simHwFingerprintVerified;
      setTestCases(prev => prev.map(tc => tc.id === 'TC-004' ? {
        ...tc,
        status: tc4Passed ? 'Pass' : 'Fail',
        actual: tc4Passed
          ? 'SUCCESS: Fingerprint string matches SQLite registered workstation fingerprint.'
          : 'FAIL: Hardware fingerprint token mismatch identified! Forced security isolation engaged.'
      } : tc));
      addLog(`TC-004 RESULT: ${tc4Passed ? 'PASS' : 'FAIL'}`);
      setTestRunPercent(65);
    }, 4500);

    setTimeout(() => {
      const studentObj = db.getUsers().find(u => u.id === simStudentId);
      const isGuest = studentObj?.role === 'Guest' || !studentObj;
      addLog('--- RUNNING TEST CASE TC-005: Telegram API Bot Notification Relay ---');
      addLog(`Connected to Bot Token: @DrVSKbot`);
      addLog(`Dispatched test event payload for User ID: ${simStudentId}`);
      const tc5Passed = !isGuest;
      setTestCases(prev => prev.map(tc => tc.id === 'TC-005' ? {
        ...tc,
        status: tc5Passed ? 'Pass' : 'Fail',
        actual: tc5Passed
          ? 'SUCCESS: Server status 200 payload relayed. Alert triggered on Channel -1003776562086.'
          : 'FAIL: Guest student account not linked with core verification hooks. Bot API payload rejected.'
      } : tc));
      addLog(`TC-005 RESULT: ${tc5Passed ? 'PASS' : 'FAIL'}`);
      setTestRunPercent(78);
    }, 5500);

    setTimeout(() => {
      addLog('--- RUNNING TEST CASE TC-006: Academic Career Progression Scheduler ---');
      addLog('Triggering automatic system progression chron-job...');
      setTestCases(prev => prev.map(tc => tc.id === 'TC-006' ? {
        ...tc,
        status: 'Pass',
        actual: 'SUCCESS: Academic year incremented from 2 to 3. Unlinked records archived successfully.'
      } : tc));
      addLog('TC-006 RESULT: PASS');
      setTestRunPercent(91);
    }, 6600);

    setTimeout(() => {
      addLog('--- RUNNING TEST CASE TC-007: Workstation Block Sentry Check ---');
      addLog(`Simulated workstation status: ${simWorkstationStatus}`);
      const tc7Passed = simWorkstationStatus === 'RESOLVED';
      setTestCases(prev => prev.map(tc => tc.id === 'TC-007' ? {
        ...tc,
        status: tc7Passed ? 'Pass' : 'Fail',
        actual: tc7Passed
          ? 'SUCCESS: Workstation diagnostics OK. Kiosk locked override released.'
          : `FAIL: Workstation remains flagged as "${simWorkstationStatus}". Locking kiosk screen instantly.`
      } : tc));
      addLog(`TC-007 RESULT: ${tc7Passed ? 'PASS' : 'FAIL'}`);
      
      // Update custom cases
      setTestCases(prev => prev.map(tc => {
        if (!tc.id.startsWith('TC-00')) {
          return { ...tc, status: 'Pass', actual: 'SUCCESS: Custom test case processed.' };
        }
        return tc;
      }));

      addLog('--- TEST SUITE COMPLETE ---');
      addLog('All test scopes successfully audited. Proceed to STLC Phase 6 Quality Closure Report.');
      setTestRunPercent(100);
      setIsTestSuiteRunning(false);
    }, 7800);
  };

  // Pillars data loaded exactly from C-SYNC spec
  const pillars = [
    {
      id: 0,
      phase: "PHASE 5/9",
      segment: "attendance",
      title: "1. Face + Geo Fused Attendance",
      icon: Compass,
      intro: "A spoofy-proof hybrid verification gate binding visual identity, geographical fencing, and physical device signatures.",
      details: [
        "Face verification matched inside local secure camera capture buffers",
        "Haversine coordinate calculations validate user's presence inside accepted campus radii",
        "No stationary lab camera dependencies: relies on student's verified device",
        "Hardware-bound: Users are tied to a unique device MAC / token signature after initial registration"
      ],
      zones: [
        { name: "College", lat: "17.740697", lng: "83.321251", r: "0.3 km" },
        { name: "Satellite Hub", lat: "17.898094", lng: "83.387790", r: "0.5 km" },
        { name: "Trusted Node", lat: "18.106691", lng: "83.387986", r: "0.5 km" }
      ],
      schema: "attendance_logs (id, user_id, station_id, gps_coords, verified_face_hash, timestamp)"
    },
    {
      id: 1,
      phase: "PHASE 5",
      segment: "attendance",
      title: "2. Dual Session Strict Tracking",
      icon: Calendar,
      intro: "Automated session dispatch that evaluates attendance marks for FN and AN periods independently.",
      details: [
        "Forenoon Session Window: 10:00 AM → 1:20 PM",
        "Afternoon Session Window: 2:20 PM → 5:00 PM",
        "Independent calculations: Separate validation and separate streak increments per session",
        "Skip triggers: Automated skipping of Sundays, second Saturdays, and state holidays"
      ],
      timings: "FN: 10AM - 1:20PM / AN: 2:20PM - 5PM",
      schema: "holidays (id, date, name, type)"
    },
    {
      id: 2,
      phase: "PHASE 6",
      segment: "lifecycle",
      title: "3. Auto Academic Progression Engine",
      icon: GitPullRequest,
      intro: "An automated annual progression manager governing courses, semester promotions, and alumni conversions.",
      details: [
        "June 1 Trigger: Automated progression schedules promote 1st year → 2nd year → 3rd year",
        "October 1 Trigger: 3rd year students may formally request promotion to 4th year",
        "Progression validation: Promotion requests undergo comprehensive staff reviews",
        "Conversion trigger: If a request is neglected on June 1, the student undergoes alumni status transformation",
        "Grace Period: Staff retain temporary 90-day administrative windows to restore converted alumni back to 4th year status"
      ],
      schema: "academic_progression (id, user_id, current_year, target_year, request_status, remarks)"
    },
    {
      id: 3,
      phase: "PHASE 1",
      segment: "roles",
      title: "4. Role + Privilege Matrix",
      icon: Shield,
      intro: "Enterprise classification system ensuring robust access controls across 5 separate campus roles.",
      details: [
        "Classifies administrative status securely: Admin is a system privilege separate from academic roles",
        "Major Student / Minor Student: Governing access boundaries based on labs security permissions",
        "Staff & HODs: Oversee academic progression approvals and station override logs",
        "Alumni & Guests: Temporary dashboards customized with limited read permissions",
        "Developer Phone Override: Registering with the designated developer mobile number grants instant sys-admin access"
      ],
      schema: "users (id, full_name, email, role, phone_fingerprint, is_approved)"
    },
    {
      id: 4,
      phase: "PHASE 5",
      segment: "infrastructure",
      title: "5. Mobile-First PWA Portal",
      icon: Smartphone,
      intro: "A streamlined Single Page Application optimized for direct installation and touch interactions on hardware.",
      details: [
        "Responsive PWA container support bypasses Apple / Android app store bottlenecks",
        "Ultra-smooth touch interfaces replace slow multi-page PHP designs",
        "Features local caching mechanisms to capture attendance metrics in network-sparse labs",
        "Direct camera module hardware hooks to capture biometric signatures"
      ],
      schema: "pwa_caches (id, offline_key, cached_payload, timestamp)"
    },
    {
      id: 5,
      phase: "PHASE 7",
      segment: "safety",
      title: "6. Panic & Emergency Core",
      icon: AlertCircle,
      intro: "A dedicated institutional crisis protocol publishing multi-channel alerts during safety incidents.",
      details: [
        "Simultaneous media capture: Records audio packet dumps and high-res video arrays",
        "Instant location lock: Queries accurate GPS satellites and binds current zone metrics",
        "Telegram dispatch: Commits logs straight to emergency channel -1003776562086",
        "Responder tracking: Highlights live map trajectories for dispatch and personnel tracking"
      ],
      schema: "panic_logs (id, user_id, audio_blob_url, image_blob, gps_coords, timestamp)"
    },
    {
      id: 6,
      phase: "PHASE 8",
      segment: "safety",
      title: "7. Telegram Integration Layer",
      icon: Bot,
      intro: "Leverages the Telegram Bot API to transform channels into dynamic notification and security backbones.",
      details: [
        "Emergency evidence relay utilizes custom bots to dispatch high-priority data packets",
        "Active Bot Target: @DrVSKbot with full token mapping integrations",
        "Minimizes structural operating costs compared to paid custom SMS or cloud carrier APIs",
        "Dual communication bridge: Connects off-campus administrators and active safety dispatchers"
      ],
      bot: "@DrVSKbot / Channel: -1003776562086"
    },
    {
      id: 7,
      phase: "PHASE 10",
      segment: "infrastructure",
      title: "8. Live JSON Update Engine",
      icon: Zap,
      intro: "Innovative over-the-air (OTA) patching system deploying modular patches instantly.",
      details: [
        "Enables dynamic framework updates without requiring full app store updates or service interruptions",
        "Saves incremental changes securely without risking database content or cache purges",
        "System administrators formulate patch files and publish them to clean WebSocket targets",
        "Ensures rapid distribution of bug solutions, emergency notifications, or security overrides"
      ],
      schema: "system_patches (id, patch_version, json_payload, deployed_by, created_at)"
    },
    {
      id: 8,
      phase: "PHASE 9",
      segment: "roles",
      title: "9. Role-Sensitive Dashboards",
      icon: Layers,
      intro: "A single lightweight rendering engine that dynamically molds menus based on authenticated sessions.",
      details: [
        "Reduces duplication: One React dashboard adapts to Student, HOD, Staff, Guest, and Alumni access",
        "Students access leave trackers, study guides, and dynamic attendance registers",
        "Staff manage local promotions, station unlock requests, and academic feedback logs",
        "Guests are greeted with visitor codes and temporary campus access policies"
      ],
      schema: "ui_privileges (role_type, menu_items_json, dashboard_theme)"
    },
    {
      id: 9,
      phase: "PHASE 10",
      segment: "infrastructure",
      title: "10. Lightweight Shared Hosting Design",
      icon: Server,
      intro: "Pragmatic server engineering optimized for shared cPanel hosting bounds (Razorhost).",
      details: [
        "Designed to bypass Docker or expensive microservice subscriptions",
        "Employs highly optimized native PHP scripts paired with index-locked InnoDB MySQL tables",
        "Bypasses Node background loop overheads by relying on efficient front-end polling",
        "Operates successfully under shared CPU limits while providing rapid real-time calculations"
      ],
      db: "vfnzeaml_CSync on Razorhost PHP 8.2"
    },
    {
      id: 10,
      phase: "PHASE 13",
      segment: "lifecycle",
      title: "11. Institutional Digital Campus",
      icon: Award,
      intro: "Fosters study hubs and local utility networks directly over student portals.",
      details: [
        "Study Center dispatch: Centralized database of lecture summaries and PDF folders",
        "Career Hub dispatch: Coordinates localized internships and placement opportunities",
        "Student Marketplace: Secure space for campus trade and gear swaps",
        "Digital ID cards replace physical cards with secure, real-time cryptographic QR stamps"
      ],
      schema: "campus_assets (id, asset_type, source_url_pdf, uploaded_by)"
    },
    {
      id: 11,
      phase: "PHASE 12",
      segment: "infrastructure",
      title: "12. Hybrid Offline Attendance",
      icon: Database,
      intro: "Secures attendance data during critical laboratory connectivity or network drops.",
      details: [
        "Locally queues geo-fenced attendance marks when cPanel connections timeout",
        "Applies client-side cryptography structures to prevent data alteration during off-line periods",
        "Synchronizes local log sets back to csync.top cPanel as soon as networks return",
        "Secures operational continuity across areas of institutional dead-zones"
      ]
    },
    {
      id: 12,
      phase: "PHASE 8",
      segment: "infrastructure",
      title: "13. Workstation Maintenance Core",
      icon: Wrench,
      intro: "Binds physical laboratory inventory states and automatically isolates failing machines.",
      details: [
        "Relational tracking links CS-01 through CS-50 dynamically",
        "Monitors diagnostics and logs issues submitted by users or detected automatically",
        "Locks workstation screens immediately when critical issues are identified to avoid student frustration",
        "Administers technician logs securely to document physical components repair tasks"
      ],
      schema: "maintenance_schedule & station_issues tables"
    }
  ];

  const segments = [
    { id: 'attendance', name: 'Attendance Core', count: pillars.filter(p => p.segment === 'attendance').length },
    { id: 'lifecycle', name: 'Academic Lifecycle', count: pillars.filter(p => p.segment === 'lifecycle').length },
    { id: 'safety', name: 'Safety & Bot Integrations', count: pillars.filter(p => p.segment === 'safety').length },
    { id: 'roles', name: 'Role Engine & Matrix', count: pillars.filter(p => p.segment === 'roles').length },
    { id: 'infrastructure', name: 'Shared Infra & cPanel', count: pillars.filter(p => p.segment === 'infrastructure').length },
    { id: 'stlc', name: 'Software Testing Life Cycle (STLC)', count: 6 }
  ];

  const filteredPillars = pillars.filter(p => p.segment === activeSegment);

  // Simulated Attendance / Fencing Verification Pipeline
  const runVerificationSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setDemoStep('Biometric Face Verification');
    setDemoLogs(['[INIT] Student opened verification loop. Checking state...']);

    setTimeout(() => {
      setDemoLogs(prev => [...prev, '[FACE_OK] Neural match hash verified (Match accuracy: 98.4%).']);
      setDemoStep('Fencing & Geofence Verification');
    }, 1000);

    setTimeout(() => {
      setDemoLogs(prev => [...prev, '[GEO_OK] Haversine calculation: Latitude 17.740697, Longitude 83.321251 is exactly 12m inside approved radius of 0.3km.']);
      setDemoStep('Device Hardware Signature Match');
    }, 2200);

    setTimeout(() => {
      const targetMac = db.getStation('CS-01')?.pcMacAddress || 'Pending First Run';
      setDemoLogs(prev => [...prev, `[DEVICE_OK] HW_ID matched linked database signature ${targetMac}.`]);
      setDemoStep('Time Windows Check');
    }, 3400);

    setTimeout(() => {
      setDemoLogs(prev => [...prev, '[TIME_OK] Verified current timestamp is within AN session constraints (2:20 PM - 5:00 PM).']);
      setDemoStep('Database Injection Dispatch');
    }, 4500);

    setTimeout(() => {
      setDemoLogs(prev => [
        ...prev, 
        '[COMPLETE_OK] Database transaction committed to vfnzeaml_CSync safely.',
        '[TELEGRAM_OK] Dispatched confirmation webhook to channel @DrVSKbot.'
      ]);
      setDemoStep('Completed Success');
      setIsSimulating(false);
    }, 5500);
  };

  const currentPillar = pillars[activePillar] || pillars[0];

  return (
    <div className="bg-[#0b1329] border-2 border-cyan-500/40 rounded-xl p-5 text-left animate-fadeIn shadow-2xl relative">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-cyan-500/20 pb-4 mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#00f2ff]/10 text-[#00f2ff] border border-cyan-500/20">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold font-orbitron text-white uppercase tracking-wider flex items-center gap-2">
              C-SYNC Smart Campus System Blueprint Hub <Sparkles className="w-4.5 h-4.5 text-cyan-400" />
            </h3>
            <p className="text-[11px] text-slate-400 font-mono uppercase tracking-widest mt-0.5">13 Core pillars of the campus operating system</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-mono bg-rose-950/40 hover:bg-rose-950 border border-rose-500/30 text-rose-300 px-3 py-1.5 rounded-lg transition-all"
        >
          Hide Blueprint Hub
        </button>
      </div>

      {/* Grid segments mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: PILLARS TRAJECTORY SELECTOR */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-4">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold mb-1 col-span-2">Select Architecture Sector:</div>
          
          {/* Segments list bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1.5">
            {segments.map(seg => (
              <button
                key={seg.id}
                onClick={() => {
                  setActiveSegment(seg.id as any);
                  const firstInSector = pillars.find(p => p.segment === seg.id);
                  if (firstInSector) setActivePillar(firstInSector.id);
                }}
                className={`px-3 py-2.5 text-xs rounded-lg transition-all text-left flex items-center justify-between border ${activeSegment === seg.id ? 'bg-[#00f2ff]/10 border-[#00f2ff] text-white shadow-[0_0_15px_rgba(0,242,255,0.1)]' : 'bg-[#04091a]/60 border-white/5 text-slate-400 hover:text-slate-200'}`}
              >
                <div className="font-sans font-bold text-[11px]">{seg.name}</div>
                <span className="text-[9px] font-mono bg-[#020617] px-1.5 py-0.2 rounded text-cyan-400 border border-cyan-500/20">{seg.count}</span>
              </button>
            ))}
          </div>

          {activeSegment === 'stlc' ? (
            // STLC OPERATIONS PANEL
            <div className="space-y-3 pt-3 border-t border-cyan-500/10">
              <span className="text-[10px] font-mono text-[#00f2ff] block mb-2 uppercase font-extrabold tracking-widest col-span-2">STLC Operations:</span>
              
              <div className="space-y-1.5 col-span-2">
                {[
                  { ph: 1, title: '1. Requirements Analysis', icon: FileText, desc: 'Analyze testability of core campus constraints.' },
                  { ph: 2, title: '2. Test Planning', icon: Sliders, desc: 'Formulate strategy bounds and tool assignments.' },
                  { ph: 3, title: '3. Test Case Specification', icon: Database, desc: 'Maintain and add core validation scripts.' },
                  { ph: 4, title: '4. Environment Setup', icon: Wrench, desc: 'Simulate virtual campus coordinates & face maps.' },
                  { ph: 5, title: '5. Test Execution', icon: Play, desc: 'Fire actual assertions and log dynamic defects.' },
                  { ph: 6, title: '6. Cycle Closure Report', icon: ShieldCheck, desc: 'Assess radial quality indices and exit certification.' },
                ].map(p => {
                  const PhIcon = p.icon;
                  return (
                    <button
                      key={p.ph}
                      onClick={() => setStlcPhase(p.ph)}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-mono transition-all text-left flex items-start gap-3 border select-none cursor-pointer ${stlcPhase === p.ph ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300' : 'bg-[#030612]/40 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                    >
                      <PhIcon className={`w-4 h-4 mt-0.5 ${stlcPhase === p.ph ? 'text-[#00f2ff]' : 'text-slate-405'}`} />
                      <div>
                        <div className="font-bold text-[11px]">{p.title}</div>
                        <div className="text-[9.5px] text-slate-500 font-sans mt-0.5">{p.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-[#030614]/85 border border-cyan-500/10 mt-2 space-y-1.5 text-[10px]">
                <div className="font-extrabold uppercase text-[#00f2ff] text-[9.5px]">QA STATUS CONTEXT</div>
                <div className="space-y-1 font-sans text-slate-405">
                  <div>QA Lead: <strong className="text-slate-200">{testLead}</strong></div>
                  <div>Audit Level: <strong className="text-slate-200">{testScope}</strong></div>
                  <div>Harness Platform: <strong className="text-slate-200">{automationTool}</strong></div>
                  <div className="pt-1 flex justify-between items-center border-t border-white/5 text-[9.5px] mt-1.5">
                    <span>Unresolved Defects:</span>
                    <span className="text-rose-400 font-extrabold bg-[#1d0b10] px-1.5 py-0.2 rounded border border-rose-550/15">{activeDefects.length} active</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // ORIGINAL RELATED PILLARS & RUNNER
            <>
              {/* Pillars within sector */}
              <div className="space-y-1.5 border-t border-cyan-500/10 pt-4">
                <span className="text-[9.5px] font-mono text-slate-400 block mb-2 uppercase font-bold text-slate-500 col-span-2">Related Pillars:</span>
                {filteredPillars.map(p => {
                  const PillarIcon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActivePillar(p.id)}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-mono transition-all text-left flex items-center gap-3 border ${activePillar === p.id ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300' : 'bg-transparent border-transparent text-slate-405 hover:bg-white/5'}`}
                    >
                      <PillarIcon className={`w-4 h-4 ${activePillar === p.id ? 'text-[#00f2ff]' : 'text-slate-500'}`} />
                      <span className="truncate">{p.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic real-time sandbox test validation gate */}
              <div className="bg-[#020617]/90 border border-cyan-500/20 rounded-xl p-4 text-left">
                <div className="flex items-center justify-between mb-3 border-b border-cyan-500/10 pb-2">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold col-span-2">Verification Engine Sandbox</span>
                  <span className={`text-[8.5px] font-mono px-2 py-0.5 rounded ${isSimulating ? 'bg-amber-950 text-amber-300 border border-amber-500/20' : 'bg-green-950 text-green-300 border border-green-500/20'}`}>
                    {isSimulating ? 'SIMULATING' : 'READY_TEST'}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="text-[10px] text-slate-400 mb-1 font-mono uppercase">Current Execution Pipeline:</div>
                  <div className="bg-slate-950 p-2.5 rounded border border-white/5 font-mono text-[11px] text-[#00f2ff] flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full bg-[#00f2ff] ${isSimulating ? 'animate-ping' : ''}`}></div>
                    <span>Status: <strong className="text-white font-bold">{demoStep}</strong></span>
                  </div>
                </div>

                <button
                  onClick={runVerificationSimulation}
                  disabled={isSimulating}
                  className="w-full bg-[#00f2ff] hover:bg-[#43ebff] disabled:bg-cyan-950/50 disabled:text-cyan-600 text-slate-950 text-xs font-mono font-bold py-2 rounded uppercase transition flex items-center justify-center gap-2 pointer-events-auto"
                >
                  <Users className="w-4 h-4" /> Run 4-Layer Verification Simulation
                </button>

                <div className="mt-3 bg-black/40 p-2 rounded h-24 overflow-y-auto space-y-1 scrollbar-none font-mono text-[9px] text-slate-400 text-left border border-white/5">
                  {demoLogs.map((log, li) => (
                    <div key={li} className={log.includes('[COMPLETE_OK]') ? 'text-green-400' : log.includes('OK') ? 'text-cyan-300' : 'text-slate-400'}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-12 xl:col-span-7">
          {activeSegment === 'stlc' ? (
            // INTERACTIVE STLC ACTIVE WORKSPACE DETAILS
            <div className="bg-[#020617] rounded-xl border border-cyan-500/20 p-5 h-full flex flex-col justify-between">
              
              {/* PHASE 1: REQUIREMENTS ANALYSIS */}
              {stlcPhase === 1 && (
                <div className="space-y-4 text-slate-300 text-xs w-full">
                  <div className="flex justify-between items-center border-b border-cyan-500/10 pb-3">
                    <span className="text-[10px] font-mono text-[#00f2ff] bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                      STLC Phase 5.1/6
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-sans font-bold">Requirements Traceability Matrix (RTM)</span>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white font-orbitron">Requirements Traceability Analysis</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
                      Review the functional requirements of the CSYNC campus deployment. Toggle each to "Traceable" to ensure 100% test scenario coverage before specifications design.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    {reviewedReqs.map(req => (
                      <button
                        key={req.id}
                        type="button"
                        onClick={() => {
                          setReviewedReqs(prev => prev.map(r => r.id === req.id ? { ...r, verified: !r.verified } : r));
                        }}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all font-sans relative flex items-start gap-3 select-none cursor-pointer ${
                          req.verified 
                            ? 'bg-emerald-950/20 border-emerald-500/35 text-slate-200' 
                            : 'bg-[#030613]/50 border-white/5 hover:border-cyan-500/25 text-slate-400'
                        }`}
                      >
                        <div className="mt-0.5">
                          {req.verified ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 animate-scaleIn" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center shrink-0"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-[11px] font-mono text-[#00f2ff]">{req.id}</div>
                          <div className="text-[11px] font-sans leading-relaxed mt-0.5">{req.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t border-cyan-500/10 pt-3 mt-4">
                    <div className="text-xs font-mono text-slate-400 font-bold">
                      Coverage: <span className="text-emerald-405 font-black">{Math.round((reviewedReqs.filter(r => r.verified).length / reviewedReqs.length) * 100)}%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (reviewedReqs.some(r => !r.verified)) {
                          alert('Traceability coverage is incomplete. Please confirm testability of all requirements to prevent missing STLC compliance.');
                          return;
                        }
                        setStlcPhase(2);
                      }}
                      className="px-3.5 py-1.5 bg-[#00f2ff] hover:bg-cyan-400 text-slate-950 font-bold font-sans rounded-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer uppercase shadow-md font-bold"
                    >
                      Approve Requirements Matrix & Advance <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PHASE 2: TEST PLANNING */}
              {stlcPhase === 2 && (
                <div className="space-y-4 text-slate-300 text-xs w-full">
                  <div className="flex justify-between items-center border-b border-cyan-500/10 pb-3">
                    <span className="text-[10px] font-mono text-[#00f2ff] bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                      STLC Phase 5.2/6
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-sans font-bold">QA Strategic Plan Configurator</span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white font-orbitron">Formulate Test Plan and Tooling Allocations</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
                      Configure planned testing timelines, administrative delegation channels, and verification execution mechanisms.
                    </p>
                  </div>

                  <div className="bg-[#030613]/50 border border-white/5 rounded-xl p-4 space-y-3.5 font-sans">
                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-mono text-[#00f2ff] uppercase block font-bold col-span-2">QA Director In Charge:</label>
                      <select
                        value={testLead}
                        onChange={(e) => setTestLead(e.target.value)}
                        className="bg-[#02050e] border border-cyan-500/25 p-2 rounded-lg w-full text-slate-200 font-sans text-xs outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        <option value="Mrs. Kalyani T. (CSE Instructor)">Mrs. Kalyani T. (CSE Instructor / Coordinator)</option>
                        <option value="Dr. A. Siva Prasad (Computer Science HOD)">Dr. A. Siva Prasad (Computer Science HOD)</option>
                        <option value="Syska AI Automation Bot (Sentinel Engine)">Syska AI Automation Bot (Sentinel Engine)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-mono text-[#00f2ff] uppercase block font-bold col-span-2">Test Audit Scope Level:</label>
                      <select
                        value={testScope}
                        onChange={(e) => setTestScope(e.target.value)}
                        className="bg-[#02050e] border border-cyan-500/25 p-2 rounded-lg w-full text-slate-200 font-sans text-xs outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        <option value="Full Regression & Cybersecurity Scan">Full Regression + Geolocation Cybersecurity Audit</option>
                        <option value="Biometric Face Enrollment Isolation">Biometric Core Integrity & Face Buffer Validation</option>
                        <option value="Workstation Lockdown Stress Engine">Workstation Lockdown Sentry Latency Stress-Test</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-mono text-[#00f2ff] uppercase block font-bold col-span-2">Harness Automation Tooling:</label>
                      <select
                        value={automationTool}
                        onChange={(e) => setAutomationTool(e.target.value)}
                        className="bg-[#02050e] border border-cyan-500/25 p-2 rounded-lg w-full text-slate-200 font-sans text-xs outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        <option value="Manual Lab Testing Deck">Manual Testing Console (Operator Simulation Only)</option>
                        <option value="Jest + React Testing Library Agent">Jest + React Testing Library (Headless Chromium Agent)</option>
                        <option value="Selenium Webdriver CLI Script">Selenium WebDriver Automation (cPanel PHP hooks)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-cyan-500/10 pt-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setStlcPhase(1)}
                      className="px-3 py-1.5 border border-white/10 hover:bg-white/5 text-slate-300 font-bold font-sans rounded-lg transition-all text-xs flex items-center gap-1 cursor-pointer uppercase font-mono font-bold"
                    >
                      <ChevronLeft className="w-4 h-4" /> Go Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStlcPhase(3)}
                      className="px-3.5 py-1.5 bg-[#00f2ff] hover:bg-cyan-400 text-slate-950 font-bold font-sans rounded-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer uppercase shadow-md font-bold"
                    >
                      Approve Strategy & Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PHASE 3: TEST CASE SPECIFICATIONS */}
              {stlcPhase === 3 && (
                <div className="space-y-4 text-slate-300 text-xs w-full">
                  <div className="flex justify-between items-center border-b border-cyan-500/10 pb-3">
                    <span className="text-[10px] font-mono text-[#00f2ff] bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                      STLC Phase 5.3/6
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-sans font-bold">TestCase Specifications Matrix</span>
                  </div>

                  <div className="flex justify-between items-start gap-2 text-left">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-white font-orbitron">Manage and Edit C-SYNC Test Cases</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
                        Each functional requirement is mapped to active test scenarios below. You can prepend, edit, or delete test records.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddTc(!showAddTc)}
                      className="px-3 py-1.5 bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-[#00f2ff] border border-cyan-500/20 rounded-lg text-xs font-mono flex items-center gap-1 flex-shrink-0 cursor-pointer transition-all font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" /> ADD CUSTOM
                    </button>
                  </div>

                  {/* Form block to add custom test case */}
                  {showAddTc && (
                    <form onSubmit={handleAddCustomTestCase} className="p-3 bg-[#030614] border border-cyan-500/30 rounded-xl space-y-2.5 animate-fadeIn text-left">
                      <div className="text-[9.5px] font-mono text-cyan-400 uppercase tracking-wider font-extrabold pb-1 border-b border-white/5">Configure Custom Test Specification</div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 uppercase">Test Title:</label>
                          <input
                            type="text"
                            required
                            value={newTcTitle}
                            onChange={(e) => setNewTcTitle(e.target.value)}
                            placeholder="e.g., Attendance Wifi Boundary"
                            className="bg-[#02050e] border border-white/10 p-1.5 rounded text-white text-xs w-full focus:border-cyan-500 outline-none font-sans"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 uppercase col-span-2">Priority:</label>
                          <select
                            value={newTcPriority}
                            onChange={(e) => setNewTcPriority(e.target.value)}
                            className="bg-[#02050e] border border-white/10 p-1.5 rounded text-white text-xs w-full focus:border-cyan-500 outline-none font-sans cursor-pointer"
                          >
                            <option value="HIGH">HIGH SEVERITY</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="LOW">LOW</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1 font-sans">
                        <label className="text-[9px] text-slate-500 uppercase col-span-2">Test Scenario / Actions:</label>
                        <input
                          type="text"
                          required
                          value={newTcDesc}
                          onChange={(e) => setNewTcDesc(e.target.value)}
                          placeholder="e.g., Connect to campus Wi-Fi from subnet block..."
                          className="bg-[#02050e] border border-white/10 p-1.5 rounded text-white text-xs w-full focus:border-cyan-500 outline-none font-sans"
                        />
                      </div>

                      <div className="space-y-1 font-sans">
                        <label className="text-[9px] text-slate-500 uppercase col-span-2">Expected Outcome Assertions:</label>
                        <input
                          type="text"
                          required
                          value={newTcExpected}
                          onChange={(e) => setNewTcExpected(e.target.value)}
                          placeholder="e.g., Assert HTTP 200 connection status received."
                          className="bg-[#02050e] border border-white/10 p-1.5 rounded text-white text-xs w-full focus:border-cyan-500 outline-none font-sans"
                        />
                      </div>

                      <div className="flex justify-end gap-1.5 pt-1 font-sans">
                        <button
                          type="button"
                          onClick={() => setShowAddTc(false)}
                          className="px-2.5 py-1 text-slate-400 bg-transparent hover:bg-white/5 rounded text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-[#00f2ff] hover:bg-cyan-400 text-slate-950 font-bold rounded text-xs cursor-pointer uppercase"
                        >
                          Append Scenario
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Test Cases List layout */}
                  <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1 scrollbar-thin text-[11px] text-left">
                    {testCases.map(tc => (
                      <div key={tc.id} className="p-3 bg-[#030613]/80 border border-white/5 rounded-xl space-y-1 relative hover:border-cyan-500/25 transition-all font-sans text-xs">
                        <div className="flex justify-between items-center pb-1 border-b border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-cyan-400 font-extrabold">{tc.id}</span>
                            <span className="text-[8px] bg-cyan-950 text-[#00f2ff] px-1.5 py-0.2 rounded font-mono font-bold tracking-wider">{tc.priority}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteTestCase(tc.id)}
                            className="text-slate-500 hover:text-rose-405 transition-all cursor-pointer p-0.5"
                            title="Remove Test Case"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div className="text-slate-200 font-bold text-xs">{tc.title}</div>
                        <div className="text-slate-400 leading-normal"><span className="text-slate-500 font-medium uppercase text-[9px] block">Scenario description:</span>{tc.desc}</div>
                        <div className="text-cyan-200/90 leading-normal pt-1 italic"><span className="text-slate-500 font-medium uppercase text-[9px] block not-italic font-sans">Expected outcome check:</span>"{tc.expected}"</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t border-cyan-500/10 pt-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setStlcPhase(2)}
                      className="px-3 py-1.5 border border-white/10 hover:bg-white/5 text-slate-300 font-bold font-sans rounded-lg transition-all text-xs flex items-center gap-1 cursor-pointer uppercase font-mono font-bold"
                    >
                      <ChevronLeft className="w-4 h-4" /> Go Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStlcPhase(4)}
                      className="px-3.5 py-1.5 bg-[#00f2ff] hover:bg-cyan-400 text-slate-950 font-bold font-sans rounded-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer uppercase shadow-md font-bold"
                    >
                      Approve Suite & Configure Env <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PHASE 4: REALTIVE ENVIRONMENTAL SETUP */}
              {stlcPhase === 4 && (
                <div className="space-y-4 text-slate-300 text-xs w-full text-left">
                  <div className="flex justify-between items-center border-b border-cyan-500/10 pb-3">
                    <span className="text-[10px] font-mono text-[#00f2ff] bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                      STLC Phase 5.4/6
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-sans font-bold">Virtual Testing Environment Setup</span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white font-orbitron font-medium">Simulate Hardware, Location & Student Identity</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      Configure simulated context parameters. These variables will directly dictate pass/fail outcomes when the physical QA automation runner executes diagnostic assertions.
                    </p>
                  </div>

                  <div className="bg-[#030613]/50 border border-white/5 rounded-xl p-4 space-y-4 font-sans text-xs">
                    
                    {/* Student selection field */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9.5px] font-mono text-[#00f2ff] uppercase block font-bold">Select target Student simulation session :</label>
                      <select
                        value={simStudentId}
                        onChange={(e) => setSimStudentId(e.target.value)}
                        className="bg-[#02050e] border border-cyan-500/25 p-2 rounded-lg w-full text-slate-200 outline-none focus:border-cyan-500 cursor-pointer text-xs"
                      >
                        {db.getUsers().filter(u => u.role === 'Student' || u.role === 'Guest' || u.role === 'Alumni').map(user => (
                          <option key={user.id} value={user.id}>
                            {user.fullName} (Registered Role: {user.role.toUpperCase()} • HW: {user.phoneFingerprint || 'Not-Bound'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* GPS geographic slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-slate-400 text-xs">
                        <span className="text-[9.5px] font-mono text-[#00f2ff] uppercase font-bold">GPS Distance Deviation From GGG GDC Campus:</span>
                        <span className={`font-mono text-xs font-bold ${simGpsDeviation > 300 ? 'text-rose-450 animate-pulse' : 'text-emerald-400'}`}>
                          {simGpsDeviation}m {simGpsDeviation > 300 ? '(OUT OF BOUNDS)' : '(OK ZONE)'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="500"
                        value={simGpsDeviation}
                        onChange={(e) => setSimGpsDeviation(Number(e.target.value))}
                        className="w-full accent-[#00f2ff] bg-slate-900 rounded-lg h-1 outline-none cursor-pointer"
                      />
                      <div className="text-[9.5px] text-slate-500 font-mono flex justify-between leading-none mt-1">
                        <span>0m (Exact Node)</span>
                        <span>300m (Sentry limit)</span>
                        <span>500m (Out of Campus)</span>
                      </div>
                    </div>

                    {/* Checkboxes parameters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-white/5 bg-[#01030a] cursor-pointer hover:border-[#00f2ff]/10">
                        <input
                          type="checkbox"
                          checked={simFaceLandmarksVerified}
                          onChange={(e) => setSimFaceLandmarksVerified(e.target.checked)}
                          className="w-4 h-4 accent-emerald-500 rounded border-white/10 bg-slate-900 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-[11px] text-slate-100">Face Landmark Verified</div>
                          <div className="text-[9.5px] text-slate-500 mt-0.5">Simulate accurate biometric match</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-white/5 bg-[#01030a] cursor-pointer hover:border-[#00f2ff]/10">
                        <input
                          type="checkbox"
                          checked={simHwFingerprintVerified}
                          onChange={(e) => setSimHwFingerprintVerified(e.target.checked)}
                          className="w-4 h-4 accent-emerald-500 rounded border-white/10 bg-slate-900 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-[11px] text-slate-100">Fingerprint Matched</div>
                          <div className="text-[9.5px] text-slate-500 mt-0.5">Device MAC binds bound registration</div>
                        </div>
                      </label>
                    </div>

                    {/* Physical Workstation simulation parameter for CS-08 */}
                    <div className="space-y-1.5 pt-1 text-left">
                      <label className="text-[9.5px] font-mono text-[#00f2ff] uppercase block font-bold mb-1">Simulated CS-08 Workstation Physical Health:</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['RESOLVED', 'PENDING', 'UNDER_REPAIR'].map(status => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setSimWorkstationStatus(status as any)}
                            className={`py-1.5 rounded-lg text-[10.5px] font-bold border transition-all text-center uppercase tracking-wide cursor-pointer ${
                              simWorkstationStatus === status 
                                ? 'bg-cyan-950/80 border-[#00f2ff] text-[#00f2ff]'
                                : 'bg-[#02050e] border-white/5 text-slate-500 hover:text-slate-350'
                            }`}
                          >
                            {status === 'RESOLVED' ? '✅ NORMAL' : status === 'PENDING' ? '⏳ PENDING' : '🔧 REPAIR'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-cyan-500/10 pt-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setStlcPhase(3)}
                      className="px-3 py-1.5 border border-white/10 hover:bg-white/5 text-slate-300 font-bold font-sans rounded-lg transition-all text-xs flex items-center gap-1 cursor-pointer uppercase font-mono font-bold"
                    >
                      <ChevronLeft className="w-4 h-4" /> Go Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStlcPhase(5)}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-sans rounded-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer uppercase shadow-md pointer-events-auto font-bold"
                    >
                      Lock Environment & Run Suite <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PHASE 5: TEST EXECUTION */}
              {stlcPhase === 5 && (
                <div className="space-y-4 text-slate-300 text-xs w-full">
                  <div className="flex justify-between items-center border-b border-cyan-500/10 pb-3">
                    <span className="text-[10px] font-mono text-[#00f2ff] bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                      STLC Phase 5.5/6
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-sans font-bold">Automation Test Execution Engine</span>
                  </div>

                  <div className="space-y-1 text-left">
                    <h4 className="text-sm font-bold text-white font-orbitron">Run Automated Test Suites & Analyze Assertions</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      Start automated execution checks. If simulated factors configured in Phase 4 are invalid (such as distance deviation of 302m or facial match unchecked), failures are caught and flagged.
                    </p>
                  </div>

                  {/* Buttons to execute test run */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={runSTLCExecution}
                      disabled={isTestSuiteRunning}
                      className="sm:col-span-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-teal-300 transition-all cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.2)] disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-600"
                    >
                      <Play className={`w-4 h-4 fill-current ${isTestSuiteRunning ? 'animate-ping' : ''}`} />
                      {isTestSuiteRunning ? 'Execution Runner auditing...' : 'EXECUTE AUTOMATED RUN'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTestCases(prev => prev.map(tc => ({ ...tc, status: 'Pass', actual: 'SUCCESS: Passed manually by QA administrator.' })));
                        setTestExecutionLogs(prev => ['[QA_MANUAL] Test suite marked PASS manually by Mrs. Kalyani T.', ...prev]);
                      }}
                      disabled={isTestSuiteRunning}
                      className="py-2.5 bg-cyan-950 font-bold text-cyan-300 border border-cyan-500/30 rounded-xl uppercase tracking-wider text-[10px] flex items-center justify-center hover:bg-cyan-900 hover:text-white transition-all cursor-pointer disabled:opacity-40"
                    >
                      Force Manual Pass
                    </button>
                  </div>

                  {/* Progress tracking indicator */}
                  {isTestSuiteRunning && (
                    <div className="space-y-1 font-mono">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-cyan-400">Harness progress status:</span>
                        <span>{testRunPercent}% completing</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full border border-white/5 overflow-hidden">
                        <div className="bg-[#00f2ff] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_#00f2ff]" style={{ width: `${testRunPercent}%` }}></div>
                      </div>
                    </div>
                  )}

                  {/* Results Dashboard List */}
                  <div className="space-y-2 pt-1 font-sans text-left">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-extrabold pb-1 border-b border-white/5">TestCase Status Deck:</div>
                    <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1 scrollbar-thin text-[11px]">
                      {testCases.map(tc => (
                        <div key={tc.id} className="p-2 bg-[#030613]/80 border border-white/10 rounded-lg flex items-center justify-between gap-3 font-sans text-xs hover:border-white/20 transition-all">
                          <div className="space-y-0.5 truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-slate-500 font-extrabold">{tc.id}</span>
                              <span className="font-bold text-slate-200">{tc.title}</span>
                            </div>
                            <div className="text-[10.5px] text-slate-400 font-sans italic truncate">"{tc.actual || tc.desc}"</div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 font-sans">
                            <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase text-center w-18 inline-block ${
                              tc.status === 'Pass' 
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/20' 
                                : tc.status === 'Fail' 
                                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/20 animate-bounce' 
                                  : tc.status === 'Running' 
                                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/20 animate-pulse'
                                    : 'bg-slate-950 text-slate-500 border border-white/5'
                            }`}>
                              {tc.status}
                            </span>

                            {tc.status === 'Fail' && (
                              <button
                                type="button"
                                onClick={() => handleLogDefectToDb(tc)}
                                className="px-2 py-0.5 bg-rose-900 border border-rose-500/30 hover:bg-rose-800 text-rose-100 rounded font-sans font-extrabold text-[9px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-0.5"
                              >
                                <AlertTriangle className="w-3 h-3 text-rose-450 shrink-0" /> Raise Bug
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terminal emulator feedback */}
                  <div className="space-y-1.5 font-mono text-left">
                    <div className="text-[9.5px] text-slate-405 uppercase tracking-wide font-extrabold">Selenium/Jest console logs:</div>
                    <div className="bg-black/60 p-2.5 rounded-lg border border-white/5 font-mono text-[9px] text-slate-400 text-left h-20 overflow-y-auto space-y-1 scrollbar-thin">
                      {testExecutionLogs.length === 0 ? (
                        <div className="text-slate-500 italic font-mono uppercase">Harness inactive. Please trigger execution above.</div>
                      ) : (
                        testExecutionLogs.map((log, idx) => (
                          <div key={idx} className={log.includes('FAIL') ? 'text-rose-400 animate-pulse' : log.includes('PASS') ? 'text-emerald-400 font-bold' : log.includes('TC-') ? 'text-[#00f2ff]' : 'text-slate-400'}>
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-cyan-500/10 pt-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setStlcPhase(4)}
                      className="px-3 py-1.5 border border-white/10 hover:bg-white/5 text-slate-300 font-bold font-sans rounded-lg transition-all text-xs flex items-center gap-1 cursor-pointer uppercase font-mono font-bold"
                    >
                      <ChevronLeft className="w-4 h-4" /> Go Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStlcPhase(6)}
                      className="px-3.5 py-1.5 bg-[#00f2ff] hover:bg-cyan-400 text-slate-950 font-bold font-sans rounded-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer uppercase shadow-md font-bold"
                    >
                      Transition to Closure Report <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PHASE 6: QUALITY SIGN-OFF CLOSURE */}
              {stlcPhase === 6 && (
                <div className="space-y-4 text-slate-300 text-xs w-full">
                  <div className="flex justify-between items-center border-b border-cyan-500/10 pb-3">
                    <span className="text-[10px] font-mono text-[#00f2ff] bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                      STLC Phase 5.6/6
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-sans font-bold">QA Cycle Sign-Off Report</span>
                  </div>

                  <div className="space-y-1 text-left">
                    <h4 className="text-sm font-bold text-white font-orbitron">Institutional Quality Assessment Summary</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      Verify visual quality rates and geofence coverage vectors before publishing formal deployment signoff logs.
                    </p>
                  </div>

                  {(() => {
                    const totalCount = testCases.length;
                    const passCount = testCases.filter(t => t.status === 'Pass').length;
                    const failCount = testCases.filter(t => t.status === 'Fail').length;
                    const passPercent = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;
                    
                    const isReleaseBlocked = failCount > 0;
                    
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                          
                          {/* Circular SVG radial progress */}
                          <div className="sm:col-span-4 flex flex-col items-center justify-center bg-black/30 p-3 rounded-xl border border-white/5 shrink-0 select-none">
                            <div className="relative w-16 h-16">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="26"
                                  className="stroke-slate-800"
                                  strokeWidth="5"
                                  fill="transparent"
                                />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="26"
                                  className={`transition-all duration-500 ${passPercent >= 90 ? 'stroke-emerald-500' : passPercent >= 70 ? 'stroke-amber-400' : 'stroke-rose-500'}`}
                                  strokeWidth="5"
                                  strokeDasharray={`${2 * Math.PI * 26}`}
                                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - passPercent / 100)}`}
                                  fill="transparent"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                                <span className="text-[#00f2ff] text-sm font-black leading-none">{passPercent}%</span>
                                <span className="text-[6.5px] text-slate-500 uppercase font-black leading-none mt-1">Pass rate</span>
                              </div>
                            </div>
                            <div className="text-[8px] text-slate-500 mt-1.5 font-mono uppercase tracking-wider text-center font-bold">Suite sign-off</div>
                          </div>

                          <div className="sm:col-span-8 space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                              <div className="p-1.5 bg-[#02050f] rounded border border-white/5">
                                <div className="text-slate-500 text-[8px] uppercase">TOTAL</div>
                                <div className="text-slate-200 mt-0.5 font-bold text-xs">{totalCount}</div>
                              </div>
                              <div className="p-1.5 bg-emerald-950/25 rounded border border-emerald-500/10 text-emerald-400">
                                <div className="text-slate-500 text-[8px] uppercase">PASSED</div>
                                <div className="text-emerald-300 mt-0.5 font-bold text-xs">{passCount}</div>
                              </div>
                              <div className="p-1.5 bg-rose-950/25 rounded border border-rose-500/10 text-rose-450">
                                <div className="text-slate-500 text-[8px] uppercase">FAILED</div>
                                <div className="text-rose-350 mt-0.5 font-bold text-xs">{failCount}</div>
                              </div>
                            </div>

                            <div className="p-3 bg-[#030613]/85 rounded-xl border border-white/5 space-y-1 text-left">
                              <div className="font-mono text-[9px] text-[#00f2ff] uppercase font-bold tracking-wider">RELEASE ADVISORY:</div>
                              <div className="flex items-center gap-2 font-sans font-semibold text-xs">
                                {isReleaseBlocked ? (
                                  <>
                                    <AlertTriangle className="w-4 h-4 text-rose-450 animate-pulse flex-shrink-0" />
                                    <span className="text-rose-405 leading-relaxed text-[11px]">RELEASE BLOCK: {failCount} unresolved critical defects active. Rectify before syncing.</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
                                    <span className="text-emerald-300 leading-relaxed text-[11px]">APPROVED FOR LABS: System fully compliant to deployment criteria.</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Logged defects list tracker */}
                  <div className="pt-2 border-t border-cyan-500/10 space-y-2 text-left">
                    <div className="text-[9.5px] font-mono text-slate-500 uppercase tracking-widest font-extrabold pb-0.5">Reported Defects during this STLC Cycle :</div>
                    <div className="space-y-1.5 max-h-[105px] overflow-y-auto scrollbar-thin text-[11px] font-sans">
                      {activeDefects.length === 0 ? (
                        <div className="p-2.5 bg-[#02050f]/60 rounded border border-white/5 font-sans italic text-slate-500 font-semibold">No active defect reports filed. High compliance achieved.</div>
                      ) : (
                        activeDefects.map(def => (
                          <div key={def.id} className="p-2 bg-[#120509]/80 border border-rose-500/20 rounded-lg flex justify-between items-start font-sans leading-normal">
                            <div className="text-left">
                              <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                                <span className="font-mono text-[#00f2ff] text-[9.5px] font-extrabold">{def.id}</span>
                                <span>{def.title}</span>
                              </div>
                              <div className="text-slate-400 text-[10px] mt-0.5">{def.details}</div>
                            </div>
                            <span className="text-[8px] bg-rose-950 text-rose-300 font-mono font-bold uppercase rounded px-1.5 py-0.2 shrink-0 select-none border border-rose-500/10">{def.severity}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Actions to reset or export results */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 font-sans text-xs mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const reportText = `======================================\n` +
                          `    CSYNC QUALITY SIGN-OFF ASSESSMENT  \n` +
                          `======================================\n` +
                          `Quality Lead: ${testLead}\n` +
                          `Test Scope: ${testScope}\n` +
                          `Tool Harness: ${automationTool}\n` +
                          `Timestamp: ${new Date().toLocaleString()}\n` +
                          `--------------------------------------\n` +
                          `Total Scenarios: ${testCases.length}\n` +
                          `Passed Counts  : ${testCases.filter(t => t.status === 'Pass').length}\n` +
                          `Failed Counts  : ${testCases.filter(t => t.status === 'Fail').length}\n` +
                          `Defects Filed  : ${activeDefects.length}\n` +
                          `--------------------------------------\n` +
                          `Release Status: ${testCases.filter(t => t.status === 'Fail').length > 0 ? 'HOLD' : 'APPROVED'}\n` +
                          `======================================`;
                        const blob = new Blob([reportText], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `C-SYNC_STLC_QA_Report_${Date.now().toString().slice(-4)}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                        alert('QA Certification Sign-Off downloaded successfully!');
                      }}
                      className="py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/35 rounded-xl uppercase tracking-wider font-extrabold font-mono text-[9px] text-[#00f2ff] transition-all flex items-center justify-center gap-1 cursor-pointer focus:text-white"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#00f2ff]" /> Download QA Report
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStlcPhase(1);
                        setTestCases(prev => prev.map(tc => ({ ...tc, status: 'Untested', actual: '' })));
                        setActiveDefects([]);
                        setReviewedReqs(prev => prev.map(r => ({ ...r, verified: false })));
                      }}
                      className="py-2.5 bg-[#40121a]/50 hover:bg-rose-900 border border-rose-500/20 rounded-xl uppercase tracking-wider font-extrabold font-mono text-[9.5px] text-rose-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-rose-450" /> Reset STLC Lifecycle
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // ORIGINAL SPECIFICATIONS SCREEN CARDS
            <AnimatePresence mode="wait">
              <motion.div
                key={activePillar}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-[#020617] rounded-xl border border-cyan-500/20 p-5 h-full flex flex-col justify-between text-left"
              >
                <div>
                  {/* Specific Title Indicator */}
                  <div className="flex justify-between items-center border-b border-cyan-500/10 pb-3 mb-4">
                    <span className="text-[10px] font-mono text-[#00f2ff] bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest font-bold">
                      {currentPillar.phase}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      MODULE COMPLIANCE SPEC
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5 mb-4 text-left">
                    <div className="p-3 bg-cyan-950 text-[#00f2ff] rounded-xl border border-cyan-500/10 shadow-[0_0_15px_rgba(0,242,255,0.1)]">
                      {React.createElement(currentPillar.icon, { className: "w-6 h-6" })}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-orbitron">{currentPillar.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide font-medium">Category: {currentPillar.segment.toUpperCase()}</p>
                    </div>
                  </div>

                  <p className="text-xs text-cyan-200/90 leading-relaxed bg-[#0a1124] p-3.5 rounded-lg border border-cyan-500/10 mb-4 italic font-sans font-semibold text-left">
                    "{currentPillar.intro}"
                  </p>

                  {/* Sub-details list */}
                  <div className="space-y-2.5 my-4 text-left">
                    <span className="text-[9.5px] font-mono text-[#00f2ff] uppercase tracking-wider block font-bold mb-1">Architecture Rules & Implementation Rules:</span>
                    {currentPillar.details.map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span className="font-sans leading-relaxed">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Relational MySQL / Bot Mapping specifics */}
                <div className="border-t border-cyan-500/15 pt-4 mt-5 bg-[#04091a]/50 p-4 rounded-xl border border-white/5 text-xs text-left">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2">
                    <Database className="w-3.5 h-3.5 text-[#00f2ff]" /> Real Infrastructure Schemas & Bindings
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                    <div>
                      <span className="text-slate-500 block text-[9.5px] uppercase">Registered Hosts / Integrations:</span>
                      <span className="text-slate-200 font-bold block mt-0.5">https://csync.top / razorhost</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9.5px] uppercase">Relational Scheme Target / Bot Parameters:</span>
                      <span className="text-green-400 font-sans block mt-0.5 font-bold truncate" title={currentPillar.schema || currentPillar.bot || "Integrated"}>
                        {currentPillar.schema || currentPillar.bot || "General System Logic"}
                      </span>
                    </div>
                  </div>

                  {currentPillar.zones && (
                    <div className="mt-3 pt-3 border-t border-white/5 select-none">
                      <span className="text-[10px] font-mono text-[#00f2ff] uppercase block tracking-wide mb-1.5 font-bold">Approved Geo-Fenced GPS Zones:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {currentPillar.zones.map((z, zi) => (
                          <div key={zi} className="bg-black/40 p-2 rounded text-[10px] font-mono border border-cyan-500/5 hover:border-cyan-500/20 transition-all">
                            <div className="text-slate-200 font-bold flex items-center gap-1">
                              <MapPin className="w-3" /> {z.name}
                            </div>
                            <div className="text-slate-500 mt-0.5">Coords: {z.lat}, {z.lng}</div>
                            <div className="text-[#00f2ff] mt-0.5 font-mono">Radius bounds: {z.r}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};
