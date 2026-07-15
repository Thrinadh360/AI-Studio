import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  CalendarCheck, 
  GraduationCap, 
  CalendarDays, 
  ShieldAlert, 
  Settings,
  LayoutGrid,
  RefreshCw,
  User as UserIcon,
  Radio,
  FileText,
  Database,
  Check,
  Play,
  Plus,
  Trash2,
  Search,
  Filter,
  X,
  UserPlus,
  AlertTriangle,
  MapPin,
  Cpu,
  Mail,
  Phone,
  AlertOctagon,
  ChevronRight,
  Linkedin,
  PhoneCall,
  MessageSquare,
  Award,
  BookOpen,
  Briefcase,
  ShieldCheck,
  ExternalLink,
  Flame,
  Sparkles,
  Zap,
  IdCard,
  Camera,
  Volume2,
  Smartphone,
  Video,
  QrCode,
  LogOut,
  HardDrive,
  Thermometer,
  Wifi,
  Battery,
  Activity,
  Palette,
  Landmark,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  Lock,
  Unlock,
  Shield
} from 'lucide-react';
import { ClientDatabase } from '../remoteDb';
import { User, CampusHoliday, PanicAlert } from '../types';
import { DevDeckCtrl } from './DevDeckCtrl';
import { GamificationEngine } from './GamificationEngine';
import { VirtualIdHub } from './VirtualIdHub';
import { CampusArTwin } from './CampusArTwin';
import { BroadcastBoard } from './BroadcastBoard';
import { CyberSentryWarRoom } from './CyberSentryWarRoom';
import { LiveClassesHub } from './LiveClassesHub';
import { CsyncTelegramNet } from './CsyncTelegramNet';
import { CsyncWebRTCCommunicator } from './CsyncWebRTCCommunicator';
import { playVoice, playHaptic } from '../feedback';

interface ModuleDProps {
  db: ClientDatabase;
  onRefreshAll: () => void;
  onLogout?: () => void;
  primaryAccentColor?: string;
  onChangePrimaryAccentColor?: (color: string) => void;
}

export const ModuleD: React.FC<ModuleDProps> = ({ 
  db, 
  onRefreshAll, 
  onLogout,
  primaryAccentColor = '#00f2ff',
  onChangePrimaryAccentColor
}) => {
  // Navigation tabs state matching the PHP file
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'members' | 'approvals' | 'attendance' | '4thyear' | 'holidays' | 'panic' | 'settings' | 'devdeck' | 'rolesim' | 'succession' | 'gaming' | 'virtualid' | 'campusar' | 'broadcast' | 'device-requests' | 'leaves' | 'cyberwar' | 'live-classes' | 'messenger'>('dashboard');
  const [nightOps, setNightOps] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');

  // Role Simulation Sandbox States
  const [selectedSimUser, setSelectedSimUser] = useState<User | null>(() => {
    const users = db.getUsers();
    return users.find(u => u.isDeveloper) || users[0] || null;
  });
  const [simLocationInside, setSimLocationInside] = useState<boolean>(true);
  const [simCardTapped, setSimCardTapped] = useState<boolean>(false);
  const [simSosTriggered, setSimSosTriggered] = useState<boolean>(false);
  const [simSelectedTab, setSimSelectedTab] = useState<'pwa' | 'radar' | 'class' | 'parents'>('pwa');
  
  // Dynamic Nexus directory inspection and simulation states
  const [selectedNexusUser, setSelectedNexusUser] = useState<User | null>(null);
  const [activeCallingUser, setActiveCallingUser] = useState<User | null>(null);
  const [callStatus, setCallStatus] = useState<'init' | 'dialing' | 'connected' | 'ended'>('init');
  const [callDuration, setCallDuration] = useState(0);

  // Call duration counter simulation
  useEffect(() => {
    let timer: any;
    if (activeCallingUser && callStatus === 'connected') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeCallingUser, callStatus]);

  // Simulate dialing transition
  useEffect(() => {
    if (activeCallingUser && callStatus === 'dialing') {
      const dialTimer = setTimeout(() => {
        setCallStatus('connected');
      }, 1800);
      return () => clearTimeout(dialTimer);
    }
  }, [activeCallingUser, callStatus]);
  
  // Real-time state hooks for DB persistence polling
  const [stations, setStations] = useState(db.getStations());
  const [logs, setLogs] = useState(db.getLogs());
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [syncHistory, setSyncHistory] = useState(db.getFiles());
  const [attendanceList, setAttendanceList] = useState(db.getAttendanceLogs());
  const [allUsers, setAllUsers] = useState(db.getUsers());
  const [holidays, setHolidays] = useState(db.getHolidays());
  const [panicAlerts, setPanicAlerts] = useState(db.getPanicAlerts());

  // Listen for secret triple tap gesture redirect request from ClientDatabase
  useEffect(() => {
    if ((db as any).checkAndResetDevDeckRequest && (db as any).checkAndResetDevDeckRequest()) {
      setActiveAdminTab('devdeck');
      const el = document.getElementById('csync-admin-main-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [stations, logs, db]);

  // Input fields state
  const [memberSearch, setMemberSearch] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState('ALL');

  // Leave system administration state variables
  const [leaveSearch, setLeaveSearch] = useState('');
  const [leaveFilter, setLeaveFilter] = useState<'ALL' | 'PENDING' | 'ESCALATED' | 'APPROVED' | 'REJECTED'>('ALL');
  const [adminFeedbackMap, setAdminFeedbackMap] = useState<{[key: number]: string}>({});

  // Delegated Staff Impersonation State
  const [delegatedStaffId, setDelegatedStaffId] = useState<number>(101); // Defaults to Dr. A. Siva Prasad (HOD)

  // Meteorology and daily brief editing states
  const [editTemp, setEditTemp] = useState<string>('31');
  const [editCondition, setEditCondition] = useState<string>('Partly Cloudy');
  const [editHumidity, setEditHumidity] = useState<string>('68');
  const [editWind, setEditWind] = useState<string>('14');
  const [editHeatwave, setEditHeatwave] = useState<'LOW' | 'MODERATE' | 'SEVERE'>('LOW');
  const [editUv, setEditUv] = useState<string>('4');
  const [editAlert, setEditAlert] = useState<string>('Sensors tracking standard coastal humidity. Safe for physical campus labs.');
  const [editUmbrella, setEditUmbrella] = useState<boolean>(false);
  
  const [editBriefInt, setEditBriefInt] = useState<string>('');
  const [editBriefNat, setEditBriefNat] = useState<string>('');
  const [editBriefReg, setEditBriefReg] = useState<string>('');
  const [editBriefSum, setEditBriefSum] = useState<string>('');
  
  // New holiday inputs
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('');
  
  // New member modal inputs
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileUser, setEditProfileUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editIdNumber, setEditIdNumber] = useState('');
  const [editRole, setEditRole] = useState<string>('Student');
  const [editDesignation, setEditDesignation] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editParentMobile, setEditParentMobile] = useState('');
  const [editTrust, setEditTrust] = useState<number>(100);
  const [editStreak, setEditStreak] = useState<number>(0);
  const [editXp, setEditXp] = useState<number>(120);
  const [editLevel, setEditLevel] = useState<number>(3);
  const [editPhoto, setEditPhoto] = useState('');
  const [editIsApproved, setEditIsApproved] = useState(true);
  
  const [addFormName, setAddFormName] = useState('');
  const [addFormId, setAddFormId] = useState('');
  const [addFormRole, setAddFormRole] = useState<'Major Student' | 'Minor Student' | 'Staff' | 'Alumni' | 'Guest'>('Major Student');
  const [addFormPhone, setAddFormPhone] = useState('');
  const [addFormYear, setAddFormYear] = useState('3');
  const [addFormBatch, setAddFormBatch] = useState('2023-2027');
  const [addFormGender, setAddFormGender] = useState('Male');
  const [addFormEmail, setAddFormEmail] = useState('');
  const [addFormDept, setAddFormDept] = useState('Computer Science & Engineering');

  // Master Cyber Banking & Ledger Staff Panel States
  const [selectedAdjUserId, setSelectedAdjUserId] = useState<number | ''>('');
  const [adjustType, setAdjustType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustPurpose, setAdjustPurpose] = useState<string>('Sovereign Work Stipend');
  const [txSearch, setTxSearch] = useState<string>('');
  const [txTypeFilter, setTxTypeFilter] = useState<string>('ALL');
  const [selectedTraceTxId, setSelectedTraceTxId] = useState<string | null>(null);
  const [frozenUserIds, setFrozenUserIds] = useState<number[]>([]);
  const [editUpiUserId, setEditUpiUserId] = useState<number | null>(null);
  const [editUpiValue, setEditUpiValue] = useState<string>('');

  // Real UPI Transaction modal state
  const [activeUpiDispatch, setActiveUpiDispatch] = useState<{
    type: 'DEPOSIT' | 'DEBIT';
    amount: number;
    purpose: string;
    targetUser: any;
    targetUpiUrl: string;
    targetUpiId: string;
  } | null>(null);

  // Trigger simulated panic inputs
  const [panicTriggerStation, setPanicTriggerStation] = useState('CS-03');
  const [panicTriggerMsg, setPanicTriggerMsg] = useState('Physical thermal override alarm detected in workstation motherboard.');
  const [panicIsFemaleExtremeSim, setPanicIsFemaleExtremeSim] = useState(false);

  // Admin Cockpit Face landmarks clearance simulator states
  const [adminScanningPanicId, setAdminScanningPanicId] = useState<number | null>(null);
  const [adminFaceStep, setAdminFaceStep] = useState<'idle' | 'scanning' | 'matched'>('idle');
  const [adminFaceScore, setAdminFaceScore] = useState(0);

  // HOD Succession States
  // HOD Succession States
  const [succDeptId, setSuccDeptId] = useState('CSE');
  const [succCandidateId, setSuccCandidateId] = useState<number>(0);
  const [succMode, setSuccMode] = useState<'PERMANENT' | 'TEMPORARY' | 'EMERGENCY'>('PERMANENT');
  const [succReason, setSuccReason] = useState('');
  const [succDuration, setSuccDuration] = useState(30);

  // Real-time Workstation Diagnostics Metrics State
  const [workstationMetrics, setWorkstationMetrics] = useState<{
    [stationId: string]: {
      cpu: number;
      ram: number; // GB
      ramMax: number; // GB
      disk: number; // %
      diskTemp: number; // °C
      networkLatency: number; // ms
      networkTraffic: number; // KB/s
      hasWarning: boolean;
      warningType?: string;
    }
  }>(() => {
    const initial: { [key: string]: any } = {};
    for (let i = 1; i <= 50; i++) {
      const id = `CS-${String(i).padStart(2, '0')}`;
      const hasWarning = i === 12 || i === 31 || i === 42;
      const warningType = i === 12 ? 'DISK_OVERHEAT_WARNING' : i === 31 ? 'RAM_LEAK_WARNING' : i === 42 ? 'I/O_THROTTLING_NOTICE' : '';
      initial[id] = {
        cpu: hasWarning ? 78 : Math.floor(Math.random() * 20) + 12,
        ram: hasWarning ? 14.2 : parseFloat((Math.random() * 5.2 + 3.1).toFixed(1)),
        ramMax: 16.0,
        disk: Math.floor(Math.random() * 20) + 38,
        diskTemp: hasWarning ? 54 : Math.floor(Math.random() * 11) + 35,
        networkLatency: Math.floor(Math.random() * 12) + 5,
        networkTraffic: Math.floor(Math.random() * 300) + 40,
        hasWarning,
        warningType
      };
    }
    return initial;
  });

  const [diagSearch, setDiagSearch] = useState('');
  const [diagFilter, setDiagFilter] = useState<'ALL' | 'ONLINE' | 'WARNINGS'>('ALL');
  const [selectedInspectStationId, setSelectedInspectStationId] = useState<string>('CS-01');
  const [isSimulatingStress, setIsSimulatingStress] = useState(false);

  // Real-time workstation metric fluctuation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkstationMetrics(prev => {
        const copy = { ...prev };
        Object.keys(copy).forEach(stationId => {
          const stats = stations.find(s => s.stationId === stationId);
          const isOccupied = stats?.status === 'UNLOCKED';
          
          let cpuBase = isOccupied ? 48 : 8;
          if (isSimulatingStress && stationId === selectedInspectStationId) {
            cpuBase = 94;
          }
          const cpuDelta = Math.floor(Math.random() * 19) - 9;
          const newCpu = Math.max(2, Math.min(99, cpuBase + cpuDelta));

          let ramBase = isOccupied ? 10.4 : 3.6;
          if (isSimulatingStress && stationId === selectedInspectStationId) {
            ramBase = 15.3;
          }
          const ramDelta = parseFloat((Math.random() * 1.4 - 0.7).toFixed(1));
          const newRam = Math.max(1.2, Math.min(15.9, ramBase + ramDelta));

          const tempBase = isOccupied ? 46 : 33;
          const tempDelta = Math.floor(Math.random() * 3) - 1;
          const newTemp = Math.max(25, Math.min(88, tempBase + tempDelta));

          const latDelta = Math.floor(Math.random() * 4) - 2;
          const newLat = Math.max(2, Math.min(160, copy[stationId].networkLatency + latDelta));

          const trafDelta = Math.floor(Math.random() * 100) - 50;
          const newTraf = Math.max(8, Math.min(8000, copy[stationId].networkTraffic + (isOccupied ? 350 : 0) + trafDelta));

          copy[stationId] = {
            ...copy[stationId],
            cpu: newCpu,
            ram: parseFloat(newRam.toFixed(1)),
            diskTemp: newTemp,
            networkLatency: newLat,
            networkTraffic: newTraf,
          };
        });
        return copy;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [stations, isSimulatingStress, selectedInspectStationId]);

  // Refreshes view state smoothly on simulated memory scheduler ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setStations([...db.getStations()]);
      setLogs([...db.getLogs()]);
      setSyncHistory([...db.getFiles()]);
      setAttendanceList([...db.getAttendanceLogs()]);
      setAllUsers([...db.getUsers()]);
      setHolidays([...db.getHolidays()]);
      setPanicAlerts([...db.getPanicAlerts()]);
    }, 1000);

    return () => clearInterval(interval);
  }, [db]);

  // Pre-load current weather and briefing details for settings manager
  useEffect(() => {
    try {
      const weather = db.getWeather();
      if (weather) {
        setEditTemp(weather.temp ? weather.temp.toString() : '31');
        setEditCondition(weather.condition || 'Partly Cloudy');
        setEditHumidity(weather.humidity ? weather.humidity.toString() : '68');
        setEditWind(weather.windSpeed ? weather.windSpeed.toString() : '14');
        setEditHeatwave(weather.heatwaveRisk || 'LOW');
        setEditUv(weather.uvIndex ? weather.uvIndex.toString() : '4');
        setEditAlert(weather.alert || 'Sensors tracking standard coastal humidity. Safe for physical campus labs.');
        setEditUmbrella(!!weather.umbrellaRequired);
      }
      const brief = db.getMorningBrief();
      if (brief) {
        setEditBriefInt(brief.international || '');
        setEditBriefNat(brief.national || '');
        setEditBriefReg(brief.regional || '');
        setEditBriefSum(brief.summary || '');
      }
    } catch (_) {}
  }, [db]);

  const handleGridCellClick = (stationId: string) => {
    const selected = db.getStation(stationId);
    if (selected) {
      setSelectedStation(selected);
    }
  };

  const handleAdminToggleMode = (stationId: string) => {
    db.adminToggleStation(stationId);
    setStations([...db.getStations()]);
    setLogs([...db.getLogs()]);
    const updated = db.getStation(stationId);
    if (updated) {
      setSelectedStation(updated);
      // Sync state change to server sandbox in-memory watchdog mapper
      fetch('/api/kiosk-watchdog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: updated.stationId,
          status: updated.status,
          activeUser: updated.activeUser
        })
      }).catch(e => console.error("Kiosk-watchdog update failure:", e));
    }
    onRefreshAll();
  };

  const handleGenerateAttendanceSync = () => {
    const fileOptions = [
      'routes/users.php', 'config/security.json', 'assets/thumbnails/avatar.jpg',
      'scripts/system_hook_override.cs', 'db/migration_090.sql', 'app/views/dashboard.js'
    ];
    const option = fileOptions[Math.floor(Math.random() * fileOptions.length)];
    const randSize = Math.floor(1024 * 5 + Math.random() * 1024 * 2000);
    const stationOptions = stations.filter(s => s.status === 'UNLOCKED');
    
    if (stationOptions.length === 0) {
      db.addLog('SYSTEM', 'Cannot trigger file sync: No active workstations are currently unlocked.', 'warning');
      return;
    }

    const station = stationOptions[Math.floor(Math.random() * stationOptions.length)];
    db.addNewSyncFile(option, randSize, station.stationId);
    setSyncHistory([...db.getFiles()]);
    db.addLog('SYNC', `New active download initialized for system on Workstation ${station.stationId}.`, 'info');
    onRefreshAll();
  };

  // Add holiday trigger
  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayName || !newHolidayDate) return;
    db.addHoliday(newHolidayName, newHolidayDate);
    setHolidays([...db.getHolidays()]);
    setNewHolidayName('');
    setNewHolidayDate('');
    onRefreshAll();
  };

  // Delete holiday trigger
  const handleDeleteHoliday = (id: number) => {
    db.removeHoliday(id);
    setHolidays([...db.getHolidays()]);
    onRefreshAll();
  };

  // Resolve emergency alert
  const [leaveRequestsState, setLeaveRequestsState] = useState(db.getLeaveRequests());
  
  useEffect(() => {
    setLeaveRequestsState(db.getLeaveRequests());
  }, [db, activeAdminTab]);

  const handleResolvePanic = (id: number) => {
    db.resolvePanicAlert(id);
    setPanicAlerts([...db.getPanicAlerts()]);
    onRefreshAll();
  };

  const handleUpdateLeave = (id: number, status: 'APPROVED' | 'REJECTED' | 'ESCALATED') => {
    const feedback = adminFeedbackMap[id] || '';
    db.updateLeaveRequestStatus(id, status, feedback);
    setLeaveRequestsState(db.getLeaveRequests());
    setAdminFeedbackMap(prev => ({ ...prev, [id]: '' }));
    onRefreshAll();
  };

  // Fire simulated emergency alert
  const handleFireSimulatedPanic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!panicTriggerMsg) return;
    
    // Generate near campus coordinates
    const lat = 17.722 + (Math.random() - 0.5) * 0.002;
    const lng = 83.315 + (Math.random() - 0.5) * 0.002;

    db.addPanicAlert(
      panicTriggerStation, 
      'SIM-Occupant', 
      panicTriggerMsg, 
      panicIsFemaleExtremeSim, 
      lat, 
      lng
    );

    setPanicAlerts([...db.getPanicAlerts()]);
    setPanicTriggerMsg('');
    setPanicIsFemaleExtremeSim(false);
    setActiveAdminTab('panic');
    onRefreshAll();
  };

  // Simulate Admin cockpit biometric closure
  const handleResolvePanicWithFaceSim = (id: number) => {
    setAdminScanningPanicId(id);
    setAdminFaceStep('scanning');
    setAdminFaceScore(25);

    let tick = 0;
    const tracker = setInterval(() => {
      tick++;
      setAdminFaceScore(prev => Math.min(99, prev + Math.floor(Math.random() * 15) + 12));
      if (tick >= 4) {
        clearInterval(tracker);
        
        // Match user details
        const activeOne = db.getPanicAlerts().find(a => a.id === id);
        const nameToClear = activeOne?.userName || 'Authorized Occupant';
        
        db.resolvePanicAlertWithFace(id, nameToClear, 98.6);
        setAdminFaceStep('matched');

        setTimeout(() => {
          setAdminScanningPanicId(null);
          setAdminFaceStep('idle');
          setAdminFaceScore(0);
          setPanicAlerts([...db.getPanicAlerts()]);
          onRefreshAll();
        }, 1800);
      }
    }, 400);
  };

  // Add member trigger
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormName || !addFormId) return;

    db.registerUserDetailed({
      fullName: addFormName,
      idNumber: addFormId,
      role: addFormRole,
      mobileNumber: addFormPhone,
      year: addFormYear,
      batch: addFormBatch,
      gender: addFormGender,
      email: addFormEmail,
      subject: addFormDept
    });

    setAllUsers([...db.getUsers()]);
    db.addLog('SECURITY', `Operator registered new member details: ${addFormName} (${addFormRole})`, 'success');
    
    // Clear form and modal
    setAddFormName('');
    setAddFormId('');
    setAddFormPhone('');
    setAddFormEmail('');
    setShowAddMemberModal(false);
    onRefreshAll();
  };

  const handleEditProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProfileUser) return;
    
    const all = db.getUsers();
    const target = all.find(u => u.id === editProfileUser.id);
    if (target) {
      target.fullName = editName;
      target.idNumber = editIdNumber;
      target.role = editRole as any;
      target.designation = editDesignation;
      target.subject = editSubject;
      target.email = editEmail;
      target.mobileNumber = editMobile;
      target.parentMobile = editParentMobile;
      target.trust_score = Number(editTrust);
      target.streak = Number(editStreak);
      target.xp = Number(editXp);
      target.level = Number(editLevel);
      target.photoBlob = editPhoto;
      target.isApproved = editIsApproved;
      target.approvalStatus = editIsApproved ? 'APPROVED' : 'PENDING';
      
      db.persistState();
      
      db.addLog('SECURITY', `Operator updated credentials/profile for node index: ${editName} (${editIdNumber})`, 'success');
      
      onRefreshAll();
      setAllUsers(db.getUsers());
      setSelectedNexusUser(target);
      setShowEditProfileModal(false);
      setEditProfileUser(null);
    }
  };

  // Statistics calculation as specified by the PHP template requirements
  const totalStudents = allUsers.filter(u => 
    u.role === 'Student' || u.role === 'Major Student' || u.role === 'Minor Student'
  ).length;

  const totalStaff = allUsers.filter(u => u.role === 'Staff').length;

  const pendingApprovals = allUsers.filter(u => u.isApproved === false).length;

  // Count Today's Unique Attendance Logs
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayAttendance = new Set(
    attendanceList
      .filter(a => a.timestamp.startsWith(todayDateStr))
      .map(a => a.userId)
  ).size;

  // Mapped Last 10 Members Dynamic Table Ordering
  const recentMembers = [...allUsers]
    .sort((a,b) => b.id - a.id)
    .slice(0, 10);

  // Filter members tab
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(memberSearch.toLowerCase()) || 
                          u.idNumber.toLowerCase().includes(memberSearch.toLowerCase()) ||
                          (u.mobileNumber && u.mobileNumber.includes(memberSearch));
    const matchesRole = memberRoleFilter === 'ALL' || u.role === memberRoleFilter;
    return matchesSearch && matchesRole;
  });

  const activeDelegatedStaff = allUsers.find(u => u.id === delegatedStaffId) || allUsers.find(u => u.role === 'Staff' || u.role === 'HOD') || { id: 101, fullName: 'Dr. A. Siva Prasad', role: 'Staff' };

  // Definition of trendy, professional sidebar items list
  const sidebarItems = [
    {
      tab: 'dashboard',
      label: 'Control Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      category: 'CORE OPERATIONS',
      badge: null,
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-500/10 border-cyan-500/20 shadow-sm shadow-cyan-500/5'
    },
    {
      tab: 'members',
      label: 'C-SYNC Directory',
      icon: <Users className="w-4 h-4" />,
      category: 'CORE OPERATIONS',
      badge: (
        <span className="text-[9px] bg-slate-950/80 border border-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded-full font-mono font-bold">
          {allUsers.length}
        </span>
      ),
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      tab: 'approvals',
      label: 'Enrollment Queue',
      icon: <UserCheck className="w-4 h-4" />,
      category: 'CORE OPERATIONS',
      badge: pendingApprovals > 0 ? (
        <span className="bg-yellow-500 text-slate-950 px-1.5 py-0.2 text-[9px] font-black rounded-full animate-pulse">
          {pendingApprovals}
        </span>
      ) : null,
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      tab: 'device-requests',
      label: 'Device Reset Desks',
      icon: <Smartphone className="w-4 h-4 text-amber-400" />,
      category: 'CORE OPERATIONS',
      badge: db.getDeviceChangeRequests().filter(r => r.status === 'PENDING').length > 0 ? (
        <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 text-[9px] font-black rounded-full animate-pulse">
          {db.getDeviceChangeRequests().filter(r => r.status === 'PENDING').length}
        </span>
      ) : null,
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-500/10 border-amber-500/20 shadow-md shadow-amber-500/5'
    },
    {
      tab: 'leaves',
      label: 'College Leave Desk',
      icon: <CalendarDays className="w-4 h-4 text-emerald-400" />,
      category: 'CORE OPERATIONS',
      badge: db.getLeaveRequests().filter(r => r.status === 'PENDING' || r.status === 'ESCALATED').length > 0 ? (
        <span className="bg-emerald-500 text-slate-950 px-1.5 py-0.2 text-[9px] font-black rounded-full animate-bounce">
          {db.getLeaveRequests().filter(r => r.status === 'PENDING' || r.status === 'ESCALATED').length}
        </span>
      ) : null,
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10 border-emerald-500/20 shadow-md shadow-emerald-500/5'
    },
    {
      tab: 'attendance',
      label: 'Attendance File Sync',
      icon: <CalendarCheck className="w-4 h-4" />,
      category: 'CORE OPERATIONS',
      badge: null,
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      tab: '4thyear',
      label: '4th Year Exemptions',
      icon: <GraduationCap className="w-4 h-4" />,
      category: 'CORE OPERATIONS',
      badge: allUsers.filter(u => u.reasonFor4thYear && u.isApproved === false).length > 0 ? (
        <span className="bg-rose-500 text-white font-sans text-[8px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
          {allUsers.filter(u => u.reasonFor4thYear && u.isApproved === false).length}
        </span>
      ) : null,
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      tab: 'holidays',
      label: 'Holidays & Lab Pauses',
      icon: <CalendarDays className="w-4 h-4" />,
      category: 'CORE OPERATIONS',
      badge: (
        <span className="text-[9px] bg-slate-900 border border-white/5 text-slate-400 px-1.5 py-0.2 rounded-full font-mono">
          {holidays.length}
        </span>
      ),
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      tab: 'panic',
      label: 'Panic Alerts Desk',
      icon: <ShieldAlert className="w-4 h-4" />,
      category: 'CORE OPERATIONS',
      badge: panicAlerts.filter(a => a.status === 'ACTIVE').length > 0 ? (
        <span className="inline-flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
      ) : null,
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      tab: 'settings',
      label: 'Settings / Audit Logs',
      icon: <Settings className="w-4 h-4" />,
      category: 'CORE OPERATIONS',
      badge: null,
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      tab: 'succession',
      label: 'HOD Succession Node',
      icon: <GraduationCap className="w-4 h-4 text-emerald-400" />,
      category: 'GOVERNANCE SYSTEMS',
      badge: null,
      colorClass: 'text-emerald-400',
      bgClass: 'bg-[#042f2a]/60 text-emerald-400 border border-emerald-500/20 shadow-md shadow-emerald-500/5'
    },
    {
      tab: 'devdeck',
      label: 'C-SYNC DEV DECK (OTP)',
      icon: <Cpu className="w-4 h-4 text-purple-400 animate-pulse" />,
      category: 'DEVELOPER PORTAL',
      badge: (
        <span className="text-[7.5px] bg-purple-950 border border-purple-500/30 text-purple-300 px-1 py-0.2 rounded font-mono font-bold uppercase">
          Architect
        </span>
      ),
      colorClass: 'text-purple-400',
      bgClass: 'bg-purple-950/40 border-purple-500/30'
    },
    {
      tab: 'rolesim',
      label: 'Role Live Sandbox',
      icon: <Smartphone className="w-4 h-4 text-pink-400 animate-pulse" />,
      category: 'DEVELOPER PORTAL',
      badge: (
        <span className="text-[7.5px] bg-pink-950 border border-pink-500/30 text-pink-300 px-1 py-0.2 rounded font-mono font-bold uppercase">
          Live Portal
        </span>
      ),
      colorClass: 'text-pink-400',
      bgClass: 'bg-pink-950/40 border-pink-500/30'
    },
    {
      tab: 'gaming',
      label: 'Ecosystem Gamification',
      icon: <Flame className="w-4 h-4 text-amber-500 animate-bounce" />,
      category: 'ECOSYSTEM SUITE',
      badge: (
        <span className="text-[7.5px] bg-amber-950 border border-amber-500/20 text-amber-400 px-1 py-0.2 rounded font-mono uppercase">
          STREAKS
        </span>
      ),
      colorClass: 'text-amber-500',
      bgClass: 'bg-amber-950/40 border-amber-500/30'
    },
    {
      tab: 'virtualid',
      label: 'Smart Virtual ID Hub',
      icon: <IdCard className="w-4 h-4 text-[#00f2ff]" />,
      category: 'ECOSYSTEM SUITE',
      badge: (
        <span className="text-[7.5px] bg-[#022637] border border-cyan-500/20 text-[#00f2ff] px-1 py-0.2 rounded font-mono uppercase">
          LIVE ID
        </span>
      ),
      colorClass: 'text-cyan-300',
      bgClass: 'bg-cyan-950/40 border-cyan-500/30'
    },
    {
      tab: 'campusar',
      label: 'Spatial AR Simulator',
      icon: <Camera className="w-4 h-4 text-emerald-400 animate-pulse" />,
      category: 'ECOSYSTEM SUITE',
      badge: (
        <span className="text-[7.5px] bg-emerald-950 border border-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded font-mono uppercase">
          AR
        </span>
      ),
      colorClass: 'text-emerald-400',
      bgClass: 'bg-[#042f2a]/60 border-emerald-500/25 shadow-md shadow-emerald-500/5'
    },
    {
      tab: 'broadcast',
      label: 'Broadcast & Forums',
      icon: <Volume2 className="w-4 h-4 text-blue-400 animate-pulse" />,
      category: 'ECOSYSTEM SUITE',
      badge: (
        <span className="text-[7.5px] bg-[#022637] border border-blue-500/20 text-[#00f2ff] px-1 py-0.2 rounded font-mono uppercase">
          BOARDS
        </span>
      ),
      colorClass: 'text-blue-400',
      bgClass: 'bg-blue-950/40 border-blue-500/30'
    },
    {
      tab: 'cyberwar',
      label: 'Cyber-Sentry Threat War',
      icon: <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />,
      category: 'ECOSYSTEM SUITE',
      badge: (
        <span className="text-[7.5px] bg-red-950 border border-red-500/20 text-rose-400 px-1 py-0.2 rounded font-mono uppercase">
          IDS
        </span>
      ),
      colorClass: 'text-rose-400',
      bgClass: 'bg-rose-950/40 border-red-500/30 shadow-md shadow-red-500/5'
    },
    {
      tab: 'live-classes',
      label: 'Live Online Lecture',
      icon: <Video className="w-4 h-4 text-pink-400 animate-pulse" />,
      category: 'ECOSYSTEM SUITE',
      badge: (
        <span className="text-[7.5px] bg-pink-950 border border-pink-500/20 text-pink-400 px-1 py-0.2 rounded font-mono uppercase">
          LIVE
        </span>
      ),
      colorClass: 'text-pink-400',
      bgClass: 'bg-pink-950/40 border-pink-500/30'
    },
    {
      tab: 'messenger',
      label: 'NetMessenger & Bot API',
      icon: <MessageSquare className="w-4 h-4 text-rose-350 animate-pulse" />,
      category: 'ECOSYSTEM SUITE',
      badge: (
        <span className="text-[7.5px] bg-rose-950 border border-rose-500/20 text-rose-400 px-1 py-0.2 rounded font-mono uppercase">
          CHAT
        </span>
      ),
      colorClass: 'text-rose-400',
      bgClass: 'bg-rose-950/40 border-rose-500/30 shadow-md shadow-rose-500/5'
    }
  ];

  // Search filtering logic
  const filteredSidebarItems = sidebarItems.filter(item => {
    const query = sidebarSearch.toLowerCase().trim();
    if (!query) return true;
    return item.label.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
  });

  const sidebarCategories = Array.from(new Set(filteredSidebarItems.map(item => item.category)));

  return (
    <div className="glass shadow-2xl rounded-2xl border border-cyan-500/20 overflow-hidden font-sans relative antialiased" id="csync-admin-main-container">
      {/* Decorative glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
 
      {/* Main Admin Section Split Layout mirroring the PHP file */}
      <div className="flex flex-col lg:flex-row min-h-[640px]">
        
        {/* SIDEBAR NAVIGATION - Styled like a premium industry-standard App hub */}
        <div className="w-full lg:w-72 bg-[#050b18]/70 border-r border-cyan-500/15 p-5 flex flex-col justify-between shrink-0 relative overflow-hidden">
          <span className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-cyan-500/30 via-transparent to-purple-500/20 pointer-events-none"></span>
          
          <div>
            {/* Header branding logo section */}
            <div className="mb-6 text-left relative z-10 flex items-center justify-between">
              <div>
                <h1 className="text-2.5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] via-cyan-400 to-indigo-400 font-orbitron tracking-widest flex items-center gap-2 select-none">
                  C-SYNC
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping duration-1000"></span>
                </h1>
                <p className="text-slate-400 text-[10px] font-mono uppercase tracking-[0.2em] mt-0.5">Control Center Core</p>
              </div>
              
              {/* LED operational status widget */}
              <div className="flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono text-[7px] font-bold text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-pulse"></span>
                ACTIVE
              </div>
            </div>

            {/* HIGH-FIDELITY SEARCH FILTER BAR */}
            <div className="mb-5 relative z-10">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter admin tools..."
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-2 bg-slate-950/90 border border-cyan-500/20 rounded-lg text-slate-350 text-xs focus:outline-none focus:border-cyan-400 placeholder-slate-600 transition-all font-sans font-medium text-left"
                />
                {sidebarSearch && (
                  <button 
                    onClick={() => setSidebarSearch('')}
                    className="absolute right-2 top-2.5 hover:text-white text-slate-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Navigation Sidebar with filter lists */}
            <div className="space-y-4 text-left max-h-[460px] overflow-y-auto pr-1 select-none">
              {sidebarCategories.map(cat => {
                const catItems = filteredSidebarItems.filter(item => item.category === cat);
                if (catItems.length === 0) return null;

                return (
                  <div key={cat} className="space-y-1">
                    <div className="pb-1 px-2 flex items-center justify-between">
                      <span className="text-[8px] font-mono tracking-widest text-slate-500 font-bold uppercase">
                        &gt; {cat}
                      </span>
                      <span className="text-[7.5px] font-mono text-slate-600 font-black">
                        {catItems.length}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {catItems.map(item => {
                        const isSelected = activeAdminTab === item.tab;
                        return (
                          <button
                            key={item.tab}
                            onClick={() => {
                              setActiveAdminTab(item.tab as any);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-lg text-xs font-semibold transition-all group relative overflow-hidden border ${
                              isSelected
                                ? `${item.bgClass} text-slate-100 font-bold shadow-[0_0_15px_rgba(0,242,255,0.04)]`
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 hover:border-white/5'
                            }`}
                          >
                            {/* Accent indicator bar on the left */}
                            <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-4 rounded-r-md transition-all ${
                              isSelected ? 'bg-cyan-400 scale-y-100' : 'bg-transparent scale-y-0 group-hover:bg-slate-700'
                            }`} />

                            <span className="flex items-center gap-2.5 relative z-10 truncate text-left">
                              <span className={`transition-transform duration-300 group-hover:scale-110 ${isSelected ? item.colorClass : 'text-slate-500'}`}>
                                {item.icon}
                              </span>
                              <span className="truncate">{item.label}</span>
                            </span>

                            <div className="flex items-center gap-1.5 relative z-10 flex-shrink-0 ml-1">
                              {item.badge}
                              <ChevronRight className={`w-3 h-3 transition-transform duration-200 opacity-20 group-hover:opacity-80 ${
                                isSelected ? 'translate-x-0.5 opacity-60 text-cyan-400' : ''
                              }`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin User HUD Profile Area info */}
          <div className="mt-6 border-t border-cyan-500/15 pt-4 relative z-10 text-left">
            <div className="flex items-center gap-2.5 bg-slate-950/40 border border-white/5 p-2 rounded-xl">
              {/* Profile high-tech visual circle */}
              <div className="relative flex-shrink-0">
                <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 p-[1.5px] shadow-[0_0_12px_rgba(0,242,255,0.2)]">
                  <div className="w-full h-full bg-[#020617] rounded-full flex items-center justify-center font-bold text-cyan-400 font-mono text-center text-[11px] leading-tight font-sans">
                    TS
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#020617] animate-pulse"></span>
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-slate-200 truncate leading-none">
                  Thrinadh System Operator
                </div>
                <div className="text-[8.5px] text-slate-500 font-mono uppercase mt-1 tracking-wider leading-none">
                  Sovereign Administrator
                </div>
              </div>
            </div>

            {onLogout && (
              <button 
                onClick={onLogout}
                className="mt-3 w-full py-2 bg-rose-950/20 hover:bg-rose-950/50 border border-rose-500/30 text-rose-300 font-mono text-[9px] uppercase font-bold tracking-widest rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 h-8 hover:shadow-[0_0_12px_rgba(244,63,94,0.15)] active:scale-[0.98]"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400 group-hover:animate-pulse" />
                Sovereign Logout
              </button>
            )}
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
          
          <div>
            {/* WORKSPACE TOP - MATCHING PHP DESIGN */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-cyan-500/10 pb-5">
              <div className="text-left">
                <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                  {activeAdminTab === 'dashboard' && 'Control Dashboard'}
                  {activeAdminTab === 'members' && 'C-SYNC Directory'}
                  {activeAdminTab === 'approvals' && 'Enrollments Checking Queue'}
                  {activeAdminTab === 'attendance' && 'Attendance Logs & Local PWA Sinks'}
                  {activeAdminTab === '4thyear' && '4th Year Academic Exemptions'}
                  {activeAdminTab === 'holidays' && 'Campus Academic Holidays'}
                  {activeAdminTab === 'panic' && 'Panic Emergency Desk'}
                  {activeAdminTab === 'settings' && 'System Config & Diagnostic Trace'}
                  {activeAdminTab === 'devdeck' && 'C-SYNC DEV DECK [MASTER CONTROL]'}
                  {activeAdminTab === 'succession' && 'HOD Succession & Governance Node Control'}
                  {activeAdminTab === 'gaming' && 'Campus Gamification, Streaks & Achievements Node'}
                  {activeAdminTab === 'virtualid' && 'Campus Digital Passport & Augmented Sentry ID'}
                  {activeAdminTab === 'campusar' && 'Ecosystem Digital Twin & Interactive AR Spaces'}
                  {activeAdminTab === 'broadcast' && 'Internal Broadcast & Classroom Discussion Board'}
                  {activeAdminTab === 'device-requests' && 'Hardware Protection & Device Change Sentry'}
                   {activeAdminTab === 'leaves' && 'Official Campus Leave & Pass Sentry Desk'}
                   {activeAdminTab === 'cyberwar' && 'Cyber-Sentry Threat War Room'}
                  {activeAdminTab === 'live-classes' && 'Academic Interactive Classrooms'}
                  {activeAdminTab === 'messenger' && 'NetMessenger & Botfather Desk'}
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  {activeAdminTab === 'dashboard' && 'Welcome to C-SYNC Local Control Center overview'}
                  {activeAdminTab === 'members' && 'Manage registered students, faculty, and temporary visitors'}
                  {activeAdminTab === 'approvals' && 'Check biometrics information, uploaded images, and student cards'}
                  {activeAdminTab === 'attendance' && 'Monitor student logins, workstation mac connections, and live file progress'}
                  {activeAdminTab === '4thyear' && 'Verify and process academic year exceptions for students in year 4'}
                  {activeAdminTab === 'holidays' && 'Configure and audit academic holidays and scheduled lab pauses'}
                  {activeAdminTab === 'panic' && 'Immediate distress signals mapped directly from workstation terminals'}
                  {activeAdminTab === 'settings' && 'Modify lab lockouts, clean system states, and inspect active logs'}
                  {activeAdminTab === 'succession' && 'Multi-department administrative delegation, acting nominee succession, and security overrides'}
                  {activeAdminTab === 'devdeck' && 'Architect control system for live project upgrades, hot patches, role simulations, and self-healing.'}
                  {activeAdminTab === 'gaming' && 'Ecosystem motivation engine tracking personal attendance streaks, XP levels, rewards, badges, and reputation indexes'}
                  {activeAdminTab === 'virtualid' && 'Interactive high-integrity virtual identity passport displaying real-time achievements, trust levels, and rotating access QR keys with holographic AR simulator overlays'}
                  {activeAdminTab === 'campusar' && 'Cyberpunk spatial simulation layer for computer lab workstations, classroom geofences, library catalog scans, HOD cabins, and accessible civil safety escape routing'}
                  {activeAdminTab === 'broadcast' && 'Official broadcasts initiated by academic staff and interactive deep nested discussion panels for peer students'}
                  {activeAdminTab === 'device-requests' && 'Approve or refuse cross-device fingerprint resets to authorize new physical student terminals'}
                  {activeAdminTab === 'leaves' && 'Audit student leave requests, escalate to Head of Department (HOD) SV, and generate RFID Gate Passes'}
                  {activeAdminTab === 'cyberwar' && 'Live visual radar subnet sweep, socket packet logging, host remote quarantines, and credential cipher bruteforcing'}
                  {activeAdminTab === 'live-classes' && 'Host live lectures, share direct drawing whiteboard notes, and simulate student interactions.'}
                  {activeAdminTab === 'messenger' && 'Audit real-time campus messages, publish global status stories, compile automated chatbots, and provision secure developer key endpoints.'}
                </p>
              </div>

              {/* Operator key design card */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a1226]/80 border border-cyan-500/25 rounded-xl">
                  {/* Miniature Avatar of Delegated Staff */}
                  <img
                    src={activeDelegatedStaff.photoBlob || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"}
                    alt={activeDelegatedStaff.fullName}
                    className="w-5 h-5 rounded-full object-cover border border-[#00f2ff]/30"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left font-sans">
                    <span className="block text-[7px] text-zinc-500 leading-none uppercase font-mono tracking-wider font-bold">ACTIVE MASTER DELEGATE</span>
                    <select
                      value={delegatedStaffId}
                      onChange={(e) => {
                        const newId = Number(e.target.value);
                        setDelegatedStaffId(newId);
                      }}
                      className="bg-transparent text-[10px] font-sans font-black text-cyan-400 focus:outline-none border-none py-0.5 px-0 m-0 h-4 leading-none select-none cursor-pointer outline-none"
                    >
                      {allUsers.filter(u => u.role === 'Staff' || u.role === 'HOD').map(u => (
                        <option key={u.id} value={u.id} className="bg-[#040914] text-slate-350">{u.fullName} ({u.designation || u.role})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="px-4 py-2 bg-[#0d152a] hover:bg-[#121d37] border border-cyan-500/15 rounded-xl text-xs font-mono font-bold text-cyan-400">
                  SYSTEM OPERATOR: thrinadh_sys
                </div>
              </div>
            </div>

            {/* STATISTICS ROW - INCORPORATED PRECISELY FROM PHP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#0b1226]/60 border border-cyan-500/10 rounded-2xl p-4 text-left shadow-lg hover:border-cyan-500/35 transition-all">
                <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Students</p>
                <h2 className="text-3xl md:text-4xl font-black mt-2 text-cyan-400 font-orbitron">{totalStudents}</h2>
              </div>

              <div className="bg-[#0b1226]/60 border border-cyan-500/10 rounded-2xl p-4 text-left shadow-lg hover:border-cyan-500/35 transition-all">
                <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Staff</p>
                <h2 className="text-3xl md:text-4xl font-black mt-2 text-indigo-400 font-orbitron">{totalStaff}</h2>
              </div>

              <div className="bg-[#0b1226]/60 border border-cyan-500/10 rounded-2xl p-4 text-left shadow-lg hover:border-cyan-500/35 transition-all">
                <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Pending Approvals</p>
                <h2 className="text-3xl md:text-4xl font-black mt-2 text-yellow-400 font-orbitron">{pendingApprovals}</h2>
              </div>

              <div className="bg-[#0b1226]/60 border border-cyan-500/10 rounded-2xl p-4 text-left shadow-lg hover:border-cyan-500/35 transition-all">
                <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Today Attendance</p>
                <h2 className="text-3xl md:text-4xl font-black mt-2 text-emerald-400 font-orbitron">{todayAttendance}</h2>
              </div>
            </div>

            {/* TAB CONTENT: 1. DASHBOARD OVERVIEW */}
            {activeAdminTab === 'dashboard' && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* QUICK ACTIONS ROW FROM PHP TEMPLATE */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => setActiveAdminTab('approvals')}
                    className="bg-[#0f172a]/75 hover:bg-cyan-500/10 border border-cyan-500/15 p-5 rounded-2xl text-left transition-all group group-hover:scale-[1.02]"
                  >
                    <div className="p-2.5 bg-cyan-950/50 text-cyan-400 rounded-xl inline-block mb-3.5 border border-cyan-500/10 group-hover:bg-[#00f2ff] group-hover:text-black transition-all">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-xs">Approve Members</h3>
                    <p className="text-slate-500 text-[10px] mt-1.5 leading-normal">Manage registrations</p>
                  </button>

                  <button 
                    onClick={() => setActiveAdminTab('holidays')}
                    className="bg-[#0f172a]/75 hover:bg-indigo-500/10 border border-cyan-500/15 p-5 rounded-2xl text-left transition-all group hover:scale-[1.02]"
                  >
                    <div className="p-2.5 bg-indigo-950/50 text-indigo-400 rounded-xl inline-block mb-3.5 border border-indigo-500/10 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-xs">Manage Holidays</h3>
                    <p className="text-slate-500 text-[10px] mt-1.5 leading-normal">Add/edit holidays</p>
                  </button>

                  <button 
                    onClick={() => setActiveAdminTab('4thyear')}
                    className="bg-[#0f172a]/75 hover:bg-yellow-500/10 border border-cyan-500/15 p-5 rounded-2xl text-left transition-all group hover:scale-[1.02]"
                  >
                    <div className="p-2.5 bg-yellow-950/50 text-yellow-400 rounded-xl inline-block mb-3.5 border border-yellow-500/10 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-xs">4th Year Requests</h3>
                    <p className="text-slate-500 text-[10px] mt-1.5 leading-normal">Exemption clearance</p>
                  </button>

                  <button 
                    onClick={() => setActiveAdminTab('panic')}
                    className="bg-[#0f172a]/75 hover:bg-rose-500/10 border border-cyan-500/15 p-5 rounded-2xl text-left transition-all group hover:scale-[1.02]"
                  >
                    <div className="p-2.5 bg-rose-950/50 text-rose-400 rounded-xl inline-block mb-3.5 border border-rose-500/10 group-hover:bg-rose-500 group-hover:text-white transition-all">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-xs">Emergency Alerts</h3>
                    <p className="text-slate-500 text-[10px] mt-1.5 leading-normal">Monitor distress desk</p>
                  </button>
                </div>

                {/* DOUBLE PANEL SECTION (Lab terminal grid on left, Recent registrations table on right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                  
                  {/* LAB GRID - Standard vital component to Live Tracking Grid */}
                  <div className="lg:col-span-6 bg-[#060c1c] border border-cyan-500/15 p-5 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-bold text-[#00f2ff] uppercase tracking-wider font-mono">&gt; 10 x 5 Workstation State Grid</h3>
                      <span className="text-[10px] text-slate-500">Live Heatmap</span>
                    </div>

                    {/* Heatmap items list */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-1.5">
                      {stations.map(s => {
                        const isOccupied = s.status === 'UNLOCKED';
                        const isSelected = selectedStation?.stationId === s.stationId;
                        return (
                          <div
                            key={s.stationId}
                            onClick={() => handleGridCellClick(s.stationId)}
                            title={`${s.stationId}: ${isOccupied ? `Occupier (${s.activeUser?.fullName}, ID: ${s.activeUser?.idNumber})` : 'Locked (Available)'}`}
                            className={`min-h-[72px] rounded p-1.5 flex flex-col justify-between items-center cursor-pointer transition-all border relative text-center ${
                              isOccupied 
                                ? 'bg-rose-950/30 border-rose-500/40 text-rose-300 shadow shadow-rose-500/10 hover:border-rose-400 animate-pulse'
                                : 'bg-[#041022] border-cyan-500/15 hover:border-[#00f2ff]/40 text-cyan-400'
                            } ${isSelected ? 'ring-1 ring-[#00f2ff] border-[#00f2ff]' : ''}`}
                          >
                            <span className="text-[11px] font-mono font-bold leading-none">{(s.stationId || '').replace('CS-', '')}</span>
                            {isOccupied && s.activeUser ? (
                              <div className="w-full flex flex-col items-center mt-1 pt-1 border-t border-rose-500/15 leading-none select-none">
                                <span className="text-[7.5px] font-sans text-rose-200 font-semibold truncate max-w-full" title={s.activeUser.fullName}>
                                  {s.activeUser.fullName}
                                </span>
                                <span className="text-[6.5px] font-mono text-slate-400 mt-0.5 truncate max-w-full">
                                  {s.activeUser.idNumber}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[7.5px] font-mono text-slate-500 uppercase mt-auto tracking-widest text-[6px]">FREE</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-4 mt-3 justify-start text-[9px] font-mono text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded bg-[#041022] border border-[#00f2ff]/30"></span>
                        <span>Locked / Free</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded bg-rose-950/20 border border-rose-500/45"></span>
                        <span>Unlocked / Active</span>
                      </div>
                    </div>

                    {/* OVERRIDE CONSOLE FOR GRID MAPPING */}
                    <div className="mt-4 pt-3 border-t border-white/5">
                      {selectedStation ? (
                        <div className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                          <div className="text-left font-mono">
                            <p className="text-[9px] uppercase font-bold text-slate-400">STATION_ID: {selectedStation.stationId}</p>
                            <p className="text-[8.5px] text-slate-500 mt-1 uppercase break-all">MAC: {selectedStation.pcMacAddress}</p>
                            {selectedStation.status === 'UNLOCKED' && selectedStation.activeUser ? (
                              <p className="text-[10px] text-emerald-400 mt-1 font-sans">Student Occupant: <b>{selectedStation.activeUser.fullName}</b></p>
                            ) : (
                              <p className="text-[9px] text-slate-500 italic mt-1 font-sans">No student logged</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleAdminToggleMode(selectedStation.stationId)}
                            className="bg-[#00f2ff] hover:bg-[#5eecff] text-[#020617] text-[10px] font-black rounded px-2.5 py-1.5 uppercase font-mono transition-all"
                          >
                            Bypass Lock
                          </button>
                        </div>
                      ) : (
                        <p className="text-[9px] text-slate-500 italic text-left">Select any node cell in the heatmap grid to bypass lock/unlock states</p>
                      )}
                    </div>
                  </div>

                  {/* RECENT REGISTRATIONS TABLE - INCORPORATED PRECISELY FROM PHP */}
                  <div className="lg:col-span-6 bg-[#060c1c] border border-cyan-500/15 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">&gt; Recent registrations (Last 10)</h3>
                        <button onClick={() => setActiveAdminTab('members')} className="text-[#00f2ff] text-[10px] font-bold hover:underline">
                          View All
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-xs">
                          <thead>
                            <tr className="text-slate-500 border-b border-white/5 text-[10px]">
                              <th className="pb-2">Name & Mobile</th>
                              <th className="pb-2">Role</th>
                              <th className="pb-2">Year</th>
                              <th className="pb-2">Status</th>
                              <th className="pb-2 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentMembers.map((m) => {
                              const isApproved = m.isApproved === true;
                              const isPending = m.isApproved === false && m.approvalStatus !== 'REJECTED';
                              const isRejected = m.approvalStatus === 'REJECTED';
                              
                              let statusLabel = 'APPROVED';
                              let colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                              
                              if (isPending) {
                                statusLabel = 'PENDING';
                                colorClass = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
                              } else if (isRejected) {
                                statusLabel = 'REJECTED';
                                colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                              }

                              return (
                                <tr key={m.id} className="border-b border-cyan-500/5 hover:bg-white/[0.02]">
                                  <td className="py-2.5">
                                    <div className="flex items-center gap-2">
                                      {m.photoBlob ? (
                                        <img src={m.photoBlob} alt="" className="w-6 h-6 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-[9px] text-slate-500 uppercase">
                                          {m.fullName.substring(0, 1)}
                                        </div>
                                      )}
                                      <div>
                                        <p className="font-bold text-white truncate max-w-[110px]">{m.fullName}</p>
                                        <p className="text-[9px] text-slate-400">{m.mobileNumber || 'No mobile'}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2.5 text-[10px] text-slate-300 font-mono">
                                    <span className="bg-slate-950 px-1 py-0.5 rounded border border-white/5 tracking-wider font-bold">
                                      {m.role}
                                    </span>
                                  </td>
                                  <td className="py-2.5 text-[10px] font-mono text-slate-300">{m.year ? `Year ${m.year}` : 'Staff'}</td>
                                  <td className="py-2.5 text-[9px]">
                                    <span className={`px-1.5 py-0.5 rounded border ${colorClass} font-bold text-[8.5px] uppercase font-mono`}>
                                      {statusLabel}
                                    </span>
                                  </td>
                                  <td className="py-2.5 text-right">
                                    <div className="flex gap-1 justify-end">
                                      {isPending ? (
                                        <>
                                          <button 
                                            onClick={() => {
                                              db.approveUser(m.id, true);
                                              onRefreshAll();
                                            }}
                                            className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 text-[9px] font-bold transition-all"
                                          >
                                            Approve
                                          </button>
                                          <button 
                                            onClick={() => {
                                              db.rejectUser(m.id);
                                              onRefreshAll();
                                            }}
                                            className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 text-[9px] font-bold transition-all"
                                          >
                                            Decline
                                          </button>
                                        </>
                                      ) : (
                                        <button 
                                          onClick={() => {
                                            db.approveUser(m.id, !isApproved);
                                            onRefreshAll();
                                          }}
                                          className={`px-2 py-1 rounded text-[9px] font-mono transition-all ${
                                            isApproved 
                                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500' 
                                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500'
                                          }`}
                                        >
                                          {isApproved ? 'Suspend' : 'Clear'}
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* 3. C-SYNC WORKSTATIONS REAL-TIME HARDWARE DIAGNOSTICS DECK */}
                  <div className="lg:col-span-12 bg-[#060c1c] border border-cyan-500/15 p-5 rounded-2xl space-y-4" id="workstation-diagnostics-deck">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-white/5 pb-4 select-none">
                      <div>
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-[#00f2ff] animate-pulse" />
                          <h3 className="text-xs font-bold text-[#00f2ff] uppercase tracking-wider font-mono">C-Sync Workstation Diagnostics Desk</h3>
                        </div>
                        <p className="text-slate-400 text-[10px] mt-0.5 leading-normal">
                          Inspect real-time CPU speed, active Memory registers, and Solid State Disk health metrics for CS-01 through CS-50.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-bold">
                          50 Nodes Sync Online
                        </span>
                      </div>
                    </div>

                    {/* AGGREGATED METRICS SUMMARY CARDS */}
                    {(() => {
                      const keys = Object.keys(workstationMetrics);
                      const totalCpu = keys.reduce((acc, k) => acc + workstationMetrics[k].cpu, 0);
                      const avgCpu = Math.round(totalCpu / keys.length);

                      const totalRam = keys.reduce((acc, k) => acc + workstationMetrics[k].ram, 0);
                      const avgRam = parseFloat((totalRam / keys.length).toFixed(1));

                      const totalDiskTemp = keys.reduce((acc, k) => acc + workstationMetrics[k].diskTemp, 0);
                      const avgTemp = Math.round(totalDiskTemp / keys.length);

                      const warningCount = keys.filter(k => workstationMetrics[k].hasWarning).length;

                      return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
                          <div className="bg-slate-950/60 border border-white/5 p-3 rounded-lg flex flex-col justify-between">
                            <span className="text-[7.5px] text-slate-500 font-mono uppercase tracking-wider">Avg CPU Utilization</span>
                            <div className="flex items-baseline gap-1 mt-1 font-mono">
                              <span className="text-lg font-black text-white">{avgCpu}%</span>
                              <span className="text-[7px] text-emerald-400 font-bold font-mono">NORMAL</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-2">
                              <div className="bg-[#00f2ff] h-full animate-pulse" style={{ width: `${avgCpu}%` }}></div>
                            </div>
                          </div>

                          <div className="bg-slate-950/60 border border-white/5 p-3 rounded-lg flex flex-col justify-between">
                            <span className="text-[7.5px] text-slate-500 font-mono uppercase tracking-wider">Avg RAM Buffer Loaded</span>
                            <div className="flex items-baseline gap-1 mt-1 font-mono">
                              <span className="text-lg font-black text-white">{avgRam} GB</span>
                              <span className="text-[7px] text-slate-400 font-bold font-mono">/ 16.0 GB</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-2">
                              <div className="bg-purple-500 h-full" style={{ width: `${(avgRam / 16) * 100}%` }}></div>
                            </div>
                          </div>

                          <div className="bg-slate-950/60 border border-white/5 p-3 rounded-lg flex flex-col justify-between">
                            <span className="text-[7.5px] text-slate-500 font-mono uppercase tracking-wider font-bold">Avg Motherboard Temp</span>
                            <div className="flex items-baseline gap-1 mt-1 font-mono">
                              <span className="text-lg font-black text-white">{avgTemp}°C</span>
                              <span className="text-[7px] text-amber-500 font-bold font-mono">OPTIMAL</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-2">
                              <div className="bg-amber-400 h-full" style={{ width: `${(avgTemp / 90) * 100}%` }}></div>
                            </div>
                          </div>

                          <div className="bg-slate-950/60 border border-white/5 p-3 rounded-lg flex flex-col justify-between">
                            <span className="text-[7.5px] text-slate-500 font-mono uppercase tracking-wider">Device Alert Flags</span>
                            <div className="flex items-baseline gap-1 mt-1 font-mono">
                              <span className="text-lg font-black text-rose-400">{warningCount} Nodes</span>
                              <span className="text-[7px] text-rose-400 font-bold animate-pulse">ATTN REQUIRED</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-2">
                              <div className="bg-rose-500 h-full animate-bounce" style={{ width: `${(warningCount / 50) * 100}%` }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
                      
                      {/* WIDGET GRID OF WORKSTATIONS */}
                      <div className="lg:col-span-12 xl:col-span-7 bg-[#030612]/80 border border-white/5 rounded-xl p-3 flex flex-col">
                        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                          <div className="flex items-center gap-1.5 select-none font-bold">
                            <Filter className="w-3 h-3 text-slate-400" />
                            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">Grid Filters:</span>
                          </div>
                          <div className="flex gap-1 select-none font-bold">
                            {(['ALL', 'ONLINE', 'WARNINGS'] as const).map(f => (
                              <button
                                key={f}
                                onClick={() => {
                                  setDiagFilter(f);
                                  playHaptic('light');
                                }}
                                className={`px-2 py-0.5 text-[8.5px] font-mono rounded tracking-tight font-black transition-all uppercase cursor-pointer border ${
                                  diagFilter === f 
                                    ? 'bg-[#00f2ff]/10 text-[#00f2ff] border-[#00f2ff]/35 shadow-[0_0_8px_rgba(0,242,255,0.15)]' 
                                    : 'bg-black/30 transition-all text-slate-400 border-white/5 hover:border-slate-500/20'
                                }`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                          <div className="w-full sm:w-auto relative">
                            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Find Station (e.g. CS-12)..."
                              value={diagSearch}
                              onChange={(e) => setDiagSearch(e.target.value)}
                              className="w-full sm:w-44 bg-black/50 border border-white/10 rounded pl-7 pr-2 py-0.5 text-[9px] font-mono text-white focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-8 2xl:grid-cols-10 gap-2 overflow-y-auto max-h-[380px] p-0.5 pr-1 scrollbar-sm">
                          {Array.from({ length: 50 }, (_, i) => {
                            const stationId = `CS-${String(i + 1).padStart(2, '0')}`;
                            const stateVal = workstationMetrics[stationId] || { cpu: 10, ram: 3.5, diskTemp: 35, hasWarning: false };
                            const stats = stations.find(s => s.stationId === stationId);
                            const isOccupied = stats?.status === 'UNLOCKED';
                            
                            // Search & Filters
                            if (diagSearch && !stationId.toLowerCase().includes(diagSearch.toLowerCase())) return null;
                            if (diagFilter === 'ONLINE' && !isOccupied) return null;
                            if (diagFilter === 'WARNINGS' && !stateVal.hasWarning) return null;

                            const isSelected = selectedInspectStationId === stationId;

                            return (
                              <button
                                key={stationId}
                                onClick={() => {
                                  setSelectedInspectStationId(stationId);
                                  playHaptic('tap');
                                  playVoice(`Probing node ${stationId}`);
                                }}
                                className={`p-1.5 rounded flex flex-col justify-between text-center transition-all border relative cursor-pointer ${
                                  stateVal.hasWarning
                                    ? 'bg-rose-950/20 border-rose-500/35 text-rose-350 hover:border-rose-450 hover:bg-rose-955/30'
                                    : isOccupied
                                    ? 'bg-emerald-950/20 border-emerald-500/35 text-emerald-400 hover:border-emerald-450'
                                    : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-cyan-500/30'
                                } ${isSelected ? 'ring-1 ring-[#00f2ff] border-[#00f2ff]/65 bg-cyan-950/15' : ''}`}
                              >
                                {stateVal.hasWarning && (
                                  <span className="absolute top-0.5 right-0.5 flex h-1 w-1">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1 w-1 bg-rose-500"></span>
                                  </span>
                                )}
                                <span className="text-[10px] font-mono font-black font-bold">{(stationId).replace('CS-', '')}</span>
                                <div className="text-[6.5px] text-slate-500 font-mono mt-0.5 font-bold truncate">
                                  CPU: {stateVal.cpu}%
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* DETAILS INSPECTOR & INJECT LAB COMMANDS */}
                      {(() => {
                        const stationId = selectedInspectStationId;
                        const metrics = workstationMetrics[stationId] || {
                          cpu: 15, ram: 4.1, ramMax: 16.0, disk: 45, diskTemp: 38, networkLatency: 8, networkTraffic: 110, hasWarning: false
                        };
                        const sRecord = stations.find(s => s.stationId === stationId);
                        const isOccupied = sRecord?.status === 'UNLOCKED';
                        
                        const handleTriggerNodeReset = () => {
                          playHaptic('heavy');
                          playVoice(`Workstation node ${stationId} is receiving administrative hard-reset signal.`);
                          setWorkstationMetrics(prev => ({
                            ...prev,
                            [stationId]: {
                              ...prev[stationId],
                              cpu: 0,
                              ram: 1.1,
                              diskTemp: 22,
                              hasWarning: false,
                              warningType: undefined
                            }
                          }));
                          db.addLog('SYSTEM', `Remote hardware power-recycle issued for PC Workstation ${stationId}. State initialized.`, 'success');
                          onRefreshAll();
                          alert(`Signal DISPATCHED: Workstation node ${stationId} successfully power-recycled.`);
                        };

                        return (
                          <div className="lg:col-span-12 xl:col-span-5 bg-slate-950/90 border border-white/5 rounded-xl p-4 flex flex-col justify-between font-mono relative overflow-hidden text-slate-250">
                            <div className="absolute top-0.5 right-1 p-1 select-none font-bold">
                              <span className="text-[6.5px] text-slate-600 font-mono uppercase tracking-widest font-black">SENTRY_DIAGNOSTICS</span>
                            </div>

                            <div className="space-y-3.5 select-none text-left">
                              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                <span className={`w-2 h-2 rounded-full ${isOccupied ? 'bg-emerald-500 animate-pulse' : 'bg-[#00f2ff]'}`}></span>
                                <div>
                                  <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">{stationId} LIVE METRICS INSPECT</h4>
                                  <p className="text-[7.5px] text-slate-500 uppercase mt-0.5 font-bold">MAC ADDRESS: {sRecord?.pcMacAddress || 'Pending Binding'}</p>
                                </div>
                              </div>

                              {/* OCCUPANT INFO */}
                              {isOccupied && sRecord?.activeUser ? (
                                <div className="p-2 bg-emerald-950/15 border border-emerald-500/20 rounded text-[8.5px] space-y-1">
                                  <p className="text-emerald-400 font-bold uppercase tracking-wider leading-none text-[8px]">ACTIVE USER LEASE SEEDED</p>
                                  <p className="text-white leading-tight font-sans">
                                    {sRecord.activeUser.fullName} ({sRecord.activeUser.idNumber})
                                  </p>
                                  <p className="text-slate-400 leading-none">
                                    ROLE: {sRecord.activeUser.role} | DEPT: {sRecord.activeUser.department}
                                  </p>
                                </div>
                              ) : (
                                <div className="p-2 bg-slate-900/40 border border-white/5 rounded text-[8.5px]">
                                  <p className="text-slate-400 uppercase font-bold tracking-tight text-[8px] leading-none">LEASE STATE: VACANT / IDLE STANDBY</p>
                                  <p className="text-slate-500 text-[8px] leading-relaxed mt-1">This node is protected. Secure WebAuthn scanner must be triggered by active student profile to launch desktop environment.</p>
                                </div>
                              )}

                              {/* WARNINGS */}
                              {metrics.hasWarning && (
                                <div className="p-2 bg-rose-950/30 border border-rose-500/35 rounded text-[8px] text-rose-300 flex items-center gap-1.5 animate-pulse">
                                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                                  <div>
                                    <p className="font-bold uppercase text-[8px] leading-none">🚨 {metrics.warningType || 'HARDWARE_ANOMALY'}</p>
                                    <p className="text-slate-400 leading-normal text-[7.5px] mt-0.5 font-bold">Node exceeds threshold warning limits. Administrative tech intervention suggested.</p>
                                  </div>
                                </div>
                              )}

                              {/* PROGRESS METERS */}
                              <div className="space-y-2">
                                {/* CPU Meter */}
                                <div>
                                  <div className="flex justify-between items-center text-[8px] pb-1 uppercase font-bold select-none">
                                    <span className="text-slate-400 flex items-center gap-1 font-bold"><Cpu className="w-2.5 h-2.5" /> Processor Load</span>
                                    <span className={metrics.cpu > 80 ? 'text-rose-450 font-black' : 'text-slate-350 font-bold'}>{metrics.cpu}%</span>
                                  </div>
                                  <div className="w-full bg-slate-900 h-1.5 rounded-sm overflow-hidden select-none">
                                    <div 
                                      className={`h-full transition-all duration-500 ${
                                        metrics.cpu > 85 ? 'bg-rose-550' : metrics.cpu > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                                      }`} 
                                      style={{ width: `${metrics.cpu}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* RAM Meter */}
                                <div>
                                  <div className="flex justify-between items-center text-[8px] pb-1 uppercase font-bold select-none">
                                    <span className="text-slate-400 flex items-center gap-1 font-bold"><Database className="w-2.5 h-2.5" /> Memory Registers</span>
                                    <span className="text-slate-350 font-bold">{metrics.ram} GB / {metrics.ramMax} GB</span>
                                  </div>
                                  <div className="w-full bg-slate-900 h-1.5 rounded-sm overflow-hidden select-none">
                                    <div 
                                      className="bg-purple-500 h-full transition-all duration-500" 
                                      style={{ width: `${(metrics.ram / metrics.ramMax) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* DISK Meter */}
                                <div>
                                  <div className="flex justify-between items-center text-[8px] pb-1 uppercase font-bold select-none">
                                    <span className="text-slate-400 flex items-center gap-1 font-bold"><HardDrive className="w-2.5 h-2.5" /> Solid State Disk</span>
                                    <span className="text-slate-350 font-bold">{metrics.disk}% COMPARTMENT FILLED</span>
                                  </div>
                                  <div className="w-full bg-slate-900 h-1.5 rounded-sm overflow-hidden select-none">
                                    <div 
                                      className="bg-cyan-500 h-full" 
                                      style={{ width: `${metrics.disk}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>

                              {/* CORE TELEMETRIES LIST */}
                              <div className="grid grid-cols-2 gap-2 text-[8px] border-t border-white/5 pt-3 uppercase select-none font-bold">
                                <div className="bg-black/35 p-1.5 rounded flex items-center justify-between">
                                  <span className="text-slate-500 flex items-center gap-1 font-bold"><Thermometer className="w-3 h-3 text-amber-500" /> Temperature</span>
                                  <span className={`font-black ${metrics.diskTemp > 50 ? 'text-rose-450 animate-pulse' : 'text-slate-350'}`}>{metrics.diskTemp}°C</span>
                                </div>
                                <div className="bg-black/35 p-1.5 rounded flex items-center justify-between">
                                  <span className="text-slate-500 flex items-center gap-1 font-bold"><Wifi className="w-3 h-3 text-cyan-500" /> Ping Delay</span>
                                  <span className="font-black text-slate-350">{metrics.networkLatency} ms</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-4">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsSimulatingStress(prev => !prev);
                                  playHaptic('warning');
                                  playVoice(isSimulatingStress ? "Aborting laboratory load test." : "Broadcasting intensive neural simulation stress load test to workstation node.");
                                  if (!isSimulatingStress) {
                                    db.addLog('WARNING', `Heavy deep-learning diagnostic compilation testing is activated on workstation ${stationId}. CPU usage locked at 95%.`, 'warning');
                                    onRefreshAll();
                                  }
                                }}
                                className={`w-full py-1.5 text-[8.5px] uppercase font-mono font-black tracking-wider rounded transition-all cursor-pointer border ${
                                  isSimulatingStress 
                                    ? 'bg-rose-950 text-rose-400 border-rose-500/50 hover:bg-rose-900 shadow-[0_0_12px_rgba(239,68,68,0.2)]' 
                                    : 'bg-[#0c1328] hover:bg-[#111c3c] text-cyan-400 border-cyan-500/25 hover:border-cyan-400/50'
                                }`}
                              >
                                {isSimulatingStress ? '⚡ Abort Processor Stress Test' : '🔥 Run Processor Stress Load'}
                              </button>
                              <button
                                type="button"
                                onClick={handleTriggerNodeReset}
                                className="w-full py-1.5 bg-rose-950/25 hover:bg-rose-950/60 border border-rose-500/30 text-rose-350 font-bold uppercase text-[8px] rounded transition-all cursor-pointer"
                              >
                                ⚠️ Power-Cycle Station Node Hard Reset
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB CONTENT: 2. MEMBERS DIRECTORY */}
            {activeAdminTab === 'members' && (() => {
              const currentSelected = selectedNexusUser || filteredUsers[0] || null;

              // Check if current user is logged onto any station
              const loggedStation = currentSelected ? stations.find(s => s.status === 'UNLOCKED' && s.activeUserId === currentSelected.id) : null;

              return (
                <div className="space-y-4 animate-fadeIn text-left">
                  {/* Master calling alert popup if activeCallingUser is set */}
                  {activeCallingUser && (
                    <CsyncWebRTCCommunicator
                      db={db}
                      activeCallUser={activeCallingUser}
                      initiatorRole="Admin"
                      defaultChannelType="video"
                      onClose={() => {
                        setActiveCallingUser(null);
                        setCallStatus('init');
                      }}
                      onCallStateChange={(state) => {
                        setCallStatus(state);
                      }}
                    />
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT PANEL: SEARCH & MEMBERS SCROLL DIRECTORY */}
                    <div className="lg:col-span-5 space-y-4">
                      
                      <div className="bg-[#060c1c]/90 border border-cyan-500/15 p-4 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-cyan-400" />
                            CSYNC NEXUS LEDGER
                          </h3>
                          <span className="text-[10px] bg-cyan-950 text-cyan-400 font-mono px-2 py-0.5 rounded border border-cyan-500/20">
                            {filteredUsers.length} MEMBERS
                          </span>
                        </div>

                        {/* Search field and role selection */}
                        <div className="space-y-2.5">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Search directory name, ID/Roll, or Mobile..."
                              value={memberSearch}
                              onChange={(e) => setMemberSearch(e.target.value)}
                              className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#00f2ff]/60 font-mono"
                            />
                            {memberSearch && (
                              <button onClick={() => setMemberSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-white text-slate-500">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <select
                              value={memberRoleFilter}
                              onChange={(e) => setMemberRoleFilter(e.target.value)}
                              className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#00f2ff]/60 font-mono"
                            >
                              <option value="ALL">ALL ROLES</option>
                              <option value="Major Student">MAJOR STUDENTS</option>
                              <option value="Minor Student">MINOR STUDENTS</option>
                              <option value="Staff">STAFF/PERSONNEL</option>
                              <option value="Alumni">ALUMNI</option>
                              <option value="Guest">VISITING GUESTS</option>
                              <option value="Admin">ADMINS</option>
                            </select>

                            <button
                              onClick={() => setShowAddMemberModal(true)}
                              className="bg-[#00f2ff] hover:bg-[#5eecff] text-[#020617] text-xs font-bold rounded-xl px-3 py-2 font-mono uppercase tracking-wide flex items-center gap-1.5 shrink-0 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                              title="Register a new student, visitor or faculty node record"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              + NEW
                            </button>
                          </div>
                        </div>

                        {/* List items representation (User Cards scroll list) */}
                        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                          {filteredUsers.map((m) => {
                            const isSelected = currentSelected?.id === m.id;
                            const isApproved = m.isApproved === true;
                            const isLogged = stations.some(s => s.status === 'UNLOCKED' && s.activeUserId === m.id);

                            return (
                              <div
                                key={m.id}
                                onClick={() => setSelectedNexusUser(m)}
                                className={`p-3 rounded-xl border transition-all text-left cursor-pointer flex items-center justify-between gap-3 ${
                                  isSelected 
                                    ? 'bg-gradient-to-r from-cyan-950/40 to-indigo-950/20 border-[#00f2ff]/50 shadow shadow-cyan-500/10' 
                                    : 'bg-[#030814] border-white/5 hover:border-cyan-500/20 hover:bg-slate-950/65'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {m.photoBlob ? (
                                    <div className="relative shrink-0">
                                      <img src={m.photoBlob} alt="" className="w-9 h-9 rounded-full object-cover border border-cyan-500/25 shrink-0" referrerPolicy="no-referrer" />
                                      {isLogged && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#030814] animate-pulse"></span>}
                                    </div>
                                  ) : (
                                    <div className="relative shrink-0 w-9 h-9 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-xs text-slate-400 uppercase font-black">
                                      {m.fullName.substring(0, 1)}
                                      {isLogged && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#030814] animate-pulse"></span>}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-bold text-white text-xs truncate leading-normal text-left">{m.fullName}</p>
                                    <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                      <span>{m.idNumber}</span>
                                      <span className="text-slate-600">•</span>
                                      <span className="text-cyan-400/80">{m.role}</span>
                                    </p>
                                    {/* High-tech Gamified Motivation stats */}
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[8.5px] font-mono leading-none">
                                      {(m.streak ?? 0) >= 0 && (
                                        <span className="flex items-center gap-0.5 text-orange-400 bg-orange-950/40 px-1 py-0.5 rounded border border-orange-500/15" title="Daily streak level">
                                          <Flame className="w-2.5 h-2.5 text-orange-500" />
                                          {m.streak ?? 0}d
                                        </span>
                                      )}
                                      {(() => {
                                        const sumStars = m.stars ? Object.values(m.stars).reduce<number>((a, b) => a + Number(b || 0), 0) : 0;
                                        return sumStars >= 0 ? (
                                          <span className="flex items-center gap-0.5 text-amber-300 bg-amber-950/40 px-1 py-0.5 rounded border border-amber-500/15" title="Ecosystem stars">
                                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                            {sumStars}★
                                          </span>
                                        ) : null;
                                      })()}
                                      {(m.badges?.length ?? 0) > 0 && (
                                        <span className="flex items-center gap-0.5 text-cyan-300 bg-cyan-950/40 px-1 py-0.5 rounded border border-cyan-500/15" title="Achievements">
                                          <Award className="w-2.5 h-2.5 text-[#00f2ff]" />
                                          {m.badges?.length}🏆
                                        </span>
                                      )}
                                      {(m.level ?? 1) > 0 && (
                                        <span className="flex items-center gap-0.5 text-indigo-300 bg-indigo-950/40 px-1 py-0.5 rounded border border-indigo-500/15" title="Auth Level">
                                          <Zap className="w-2.5 h-2.5 text-indigo-400" />
                                          L{(m.level ?? 1)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-1 shrink-0 font-mono text-[8.5px]">
                                  <span className={`px-1.5 py-0.2 rounded-sm uppercase tracking-wide leading-none ${
                                    isApproved ? 'bg-emerald-950/65 text-emerald-400' : 'bg-rose-950/80 text-rose-300'
                                  }`}>
                                    {isApproved ? 'passed' : 'locked'}
                                  </span>
                                  {isLogged && (
                                    <span className="text-emerald-400 leading-none text-[8px] animate-pulse flex items-center gap-0.5">
                                      ● ACTIVE
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {filteredUsers.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                              <Search className="w-8 h-8 mx-auto opacity-30 mb-2" />
                              <p className="text-xs">No active directory users found matching the query.</p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* RIGHT PANEL: CORE NEXUS PROFILE INSPECTOR & DYNAMIC COMMUNICATIONS CARD */}
                    <div className="lg:col-span-7">
                      {currentSelected ? (
                        <div className="bg-gradient-to-br from-[#050c1e] via-[#02050f] to-[#040817] border border-cyan-500/20 rounded-2xl shadow-xl overflow-hidden relative">
                          {/* Top Decorative Scanning laser and frame grids */}
                          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500"></div>
                          <div className="absolute right-3 top-3 text-[7.5px] font-mono text-cyan-400/40 tracking-widest uppercase select-none">
                            C-SYNC CERTIFIED PASS v4.0
                          </div>

                          {/* Profile Header Grid */}
                          <div className="p-6 pb-4 border-b border-white/5 relative">
                            {/* Neon visual details */}
                            <div className="absolute top-12 right-6 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                              {/* Glowing Squircle User Avatar */}
                              <div className="relative shrink-0">
                                <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#00f2ff] via-indigo-500 to-purple-500 rounded-2xl blur opacity-35 animate-spin-slow"></div>
                                <div className="relative rounded-xl overflow-hidden p-1 bg-slate-950 border border-white/10 shrink-0">
                                  {currentSelected.photoBlob ? (
                                    <img src={currentSelected.photoBlob} alt="" className="w-24 h-24 object-cover rounded-lg" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-24 h-24 bg-slate-900 rounded-lg flex items-center justify-center text-3xl text-slate-500 uppercase font-black font-sans">
                                      {currentSelected.fullName.substring(0,1)}
                                    </div>
                                  )}
                                </div>
                                <span className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[8.5px] font-mono leading-none font-bold uppercase ${
                                  currentSelected.isApproved ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                                }`}>
                                  {currentSelected.isApproved ? 'ACTIVE' : 'LOCKED'}
                                </span>
                              </div>

                              {/* Identity Titles */}
                              <div className="space-y-1.5 flex-1 select-none text-left">
                                <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-mono leading-none tracking-widest uppercase font-bold text-white border ${
                                  currentSelected.role === 'Staff' || currentSelected.role === 'HOD' 
                                    ? 'bg-violet-950 border-violet-500/35 text-violet-300' 
                                    : currentSelected.role === 'Alumni' 
                                      ? 'bg-amber-950 border-amber-500/35 text-amber-300' 
                                      : currentSelected.role === 'Guest' 
                                        ? 'bg-teal-950 border-teal-500/35 text-teal-300' 
                                        : 'bg-indigo-950 border-indigo-500/35 text-indigo-300'
                                }`}>
                                  {currentSelected.role === 'Staff' && currentSelected.isHOD ? 'HOD / FACULTY EXECUTIVE' : `${currentSelected.role} CLEARANCE`}
                                </span>

                                <h2 className="text-xl font-black text-white tracking-tight leading-snug">{currentSelected.fullName}</h2>
                                <p className="text-[10px] text-slate-400 font-mono flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1">
                                  <span>UID: <strong className="text-[#00f2ff]">{currentSelected.idNumber}</strong></span>
                                  <span>•</span>
                                  <span>SIG: <span className="text-slate-500">{currentSelected.identity_hash || 'SHA256:07B4F93'}</span></span>
                                </p>

                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                                  <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                    Trust: {currentSelected.trust_score}%
                                  </span>
                                  {loggedStation ? (
                                    <span className="text-[9px] font-semibold text-emerald-300 flex items-center gap-1 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-500/30 animate-pulse">
                                      <LayoutGrid className="w-3 h-3" />
                                      Workstation {loggedStation.stationId}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1 bg-white/[0.02] px-2 py-0.5 rounded-md border border-white/5">
                                      ● Terminal Offline
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Academic or Professional Details Body */}
                          <div className="p-6 space-y-5 text-xs text-slate-300 leading-relaxed max-h-[295px] overflow-y-auto">
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* OCCUPATION & DEPT PANEL */}
                              <div className="bg-black/35 border border-white/5 p-3 rounded-xl space-y-1 text-left">
                                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                  <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                                  Current Standing / Occupation
                                </div>
                                <p className="font-bold text-white text-xs mt-0.5">
                                  {currentSelected.role === 'Alumni' ? (
                                    <span>{currentSelected.designation || 'Alumni Contributor'}</span>
                                  ) : currentSelected.role === 'Staff' ? (
                                    <span>{currentSelected.designation || 'Faculty Member'}</span>
                                  ) : currentSelected.role === 'Guest' ? (
                                    <span>{currentSelected.designation || 'Visiting Researcher / Facilitator'}</span>
                                  ) : (
                                    <span>Active Enrolled Student</span>
                                  )}
                                </p>
                              </div>

                              {/* BATCH & STREAM PANEL */}
                              <div className="bg-black/35 border border-white/5 p-3 rounded-xl space-y-1 text-left">
                                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                                  Academic Stream & Section
                                </div>
                                <p className="font-bold text-white text-xs mt-0.5">
                                  {currentSelected.subject || 'UG Computer Science Division'}
                                </p>
                              </div>
                            </div>

                            {/* CONDITIONAL DETAILS GRID */}
                            <div className="bg-slate-950/60 border border-cyan-500/10 p-4 rounded-xl space-y-3 font-sans text-left">
                              <p className="text-[9.5px] font-mono font-bold uppercase text-cyan-400 tracking-wider flex items-center gap-1.5 pb-1 border-b border-white/5">
                                <Award className="w-3.5 h-3.5 text-[#00f2ff]" />
                                REGISTERED ECOSYSTEM LOGISTICS
                              </p>

                              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[11px] font-mono select-text text-left">
                                {/* Conditional student data */}
                                {(currentSelected.role.includes('Student') || currentSelected.role === 'Alumni') && (
                                  <>
                                    <div className="text-left">
                                      <span className="text-slate-500 block uppercase text-[8.5px] text-left">Academic Batch Duration:</span>
                                      <strong className="text-slate-200 text-left">{currentSelected.batch || 'Batch 2023-2026'}</strong>
                                    </div>
                                    <div className="text-left">
                                      <span className="text-slate-500 block uppercase text-[8.5px] text-left">Biometric Year Indicator:</span>
                                      <strong className="text-slate-200 text-left">Year {currentSelected.year || '3'} Enrollment</strong>
                                    </div>
                                    {currentSelected.parentMobile && (
                                      <div className="text-left">
                                        <span className="text-slate-500 block uppercase text-[8.5px] text-left">Parent Emergency Line:</span>
                                        <strong className="text-emerald-400 text-left">+{currentSelected.parentMobile}</strong>
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Conditional staff data */}
                                {currentSelected.role === 'Staff' && (
                                  <>
                                    <div className="text-left">
                                      <span className="text-slate-500 block uppercase text-[8.5px] text-left">Faculty Role Designation:</span>
                                      <strong className="text-slate-200 font-bold text-left">{currentSelected.designation || 'Lecturer'}</strong>
                                    </div>
                                    <div className="text-left">
                                      <span className="text-slate-500 block uppercase text-[8.5px] text-left">Department Station:</span>
                                      <strong className="text-violet-300 text-left">Govt CSE Department</strong>
                                    </div>
                                  </>
                                )}

                                {/* Conditional guest data */}
                                {currentSelected.role === 'Guest' && (
                                  <>
                                    <div className="text-left">
                                      <span className="text-slate-500 block uppercase text-[8.5px] text-left">Visitation Purpose:</span>
                                      <strong className="text-slate-200 text-left">{currentSelected.purpose || 'Technical Seminar'}</strong>
                                    </div>
                                    <div className="text-left">
                                      <span className="text-slate-500 block uppercase text-[8.5px] text-left">Associated Institution:</span>
                                      <strong className="text-teal-400 text-left">{currentSelected.designation || 'External Faculty'}</strong>
                                    </div>
                                  </>
                                )}

                                <div className="text-left">
                                  <span className="text-slate-500 block uppercase text-[8.5px] text-left">Digital Signature ID:</span>
                                  <span className="text-slate-400 text-[10px] break-all text-left">{currentSelected.device_id || 'REGISTERED_PWA_KEY_F42'}</span>
                                </div>
                                <div className="text-left">
                                  <span className="text-slate-500 block uppercase text-[8.5px] text-left">Primary Email Endpoint:</span>
                                  <a href={`mailto:${currentSelected.email}`} className="text-cyan-400 underline hover:text-[#00f2ff] text-left block">{currentSelected.email || 'no-email@campus.edu'}</a>
                                </div>
                              </div>
                            </div>

                            {/* GAMIFICATION, STREAKS & MOTIVATIONAL ECOSYSTEM SUMMARY */}
                            <div className="bg-[#0b1329]/65 border border-amber-500/15 p-4 rounded-xl space-y-3.5 font-sans text-left relative overflow-hidden group">
                              {/* Glowing tech grid line */}
                              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
                              
                              <p className="text-[9.5px] font-mono font-bold uppercase text-amber-400 tracking-wider flex items-center justify-between pb-1.5 border-b border-white/5 relative z-10">
                                <span className="flex items-center gap-1.5">
                                  <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                                  Ecosystem Engagement & Gamification
                                </span>
                                <span className="text-[8px] bg-amber-950 border border-amber-500/30 text-amber-300 px-1.5 py-0.2 rounded font-mono font-black uppercase">
                                  LEVEL {currentSelected.level ?? 3}
                                </span>
                              </p>

                              {/* Progress bar / XP */}
                              <div className="space-y-1 font-mono text-[9px] relative z-10">
                                <div className="flex justify-between text-slate-400">
                                  <span>MOTIVATIONAL COMPLIANCE PROGRESS:</span>
                                  <span className="text-[#00f2ff] font-bold">{(currentSelected.xp ?? 140)} / 300 XP</span>
                                </div>
                                <div className="w-full bg-[#020617] h-2 rounded-full overflow-hidden border border-white/5 p-0.5">
                                  <div 
                                    className="bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.min(100, Math.max(10, (((currentSelected.xp ?? 140) / 300) * 100)))}%` }}
                                  ></div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                                {/* Streak card */}
                                <div className="bg-orange-950/15 border border-orange-500/10 p-2.5 rounded-lg flex items-center gap-2.5">
                                  <div className="p-2 bg-orange-950/40 rounded-lg border border-orange-500/20">
                                    <Flame className="w-4 h-4 text-orange-400" />
                                  </div>
                                  <div className="text-left leading-none">
                                    <span className="text-[7.5px] font-mono text-orange-400 block uppercase font-bold tracking-wider mb-1">ACTIVE STREAK WEEK</span>
                                    <span className="text-xs font-black text-white leading-none block mb-0.5">{currentSelected.streak ?? 0} Days Running</span>
                                    <span className="text-[7px] font-mono text-orange-300/60 block">{currentSelected.streakTier || 'Bronze Sentry'} Elite</span>
                                  </div>
                                </div>

                                {/* Total Stars & Rep Score */}
                                <div className="bg-amber-950/15 border border-amber-500/10 p-2.5 rounded-lg flex items-center gap-2.5">
                                  <div className="p-2 bg-amber-950/40 rounded-lg border border-amber-500/20">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                  </div>
                                  <div className="text-left leading-none">
                                    <span className="text-[7.5px] font-mono text-amber-400 block uppercase font-bold tracking-wider mb-1">REPUTATION SCORE</span>
                                    <span className="text-xs font-black text-white leading-none block mb-0.5">{currentSelected.reputationScore ?? 85}% Rate</span>
                                    <span className="text-[7px] font-mono text-amber-300/60 block">
                                      {(() => {
                                        const sumStars = currentSelected.stars ? Object.values(currentSelected.stars).reduce<number>((a, b) => a + Number(b || 0), 0) : 0;
                                        return `${sumStars} ★ Collected`;
                                      })()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Star Radar Breakdown */}
                              {currentSelected.stars && (
                                <div className="space-y-1.5 pt-1 relative z-10">
                                  <span className="text-[8px] font-mono font-bold text-slate-500 block uppercase tracking-wider leading-none">CREDIT STARS BY COMPLIANCE VECTOR:</span>
                                  <div className="grid grid-cols-2 gap-2 font-mono text-[9px]">
                                    {Object.entries(currentSelected.stars).map(([key, val]) => (
                                      <div key={key} className="bg-black/30 border border-white/5 p-1.5 rounded flex items-center justify-between text-left">
                                        <span className="text-slate-400 capitalize text-[8px] truncate mr-1">{key}</span>
                                        <span className="text-amber-300 font-bold shrink-0 flex items-center gap-0.5" title={`${val ?? 0} / 5 Stars`}>
                                          {Array.from({ length: 5 }).map((_, i) => (
                                            <span 
                                              key={i} 
                                              className={i < Number(val || 0) ? "text-amber-400 font-sans" : "text-slate-800 font-sans"}
                                            >
                                              ★
                                            </span>
                                          ))}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Earned Achievements (Badges) */}
                              <div className="space-y-2 pt-2 border-t border-white/5 relative z-10">
                                <span className="text-[8px] font-mono font-bold text-slate-500 block uppercase tracking-wider leading-none font-sans">EARNED ACHIEVEMENT BADGES:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {currentSelected.badges && currentSelected.badges.length > 0 ? (
                                    currentSelected.badges.map((badge, idx) => {
                                      const colors = [
                                        'bg-cyan-950/40 text-cyan-300 border-cyan-500/20',
                                        'bg-emerald-950/40 text-emerald-300 border-emerald-500/20',
                                        'bg-amber-950/40 text-amber-300 border-amber-500/20',
                                        'bg-indigo-950/40 text-indigo-300 border-indigo-500/20',
                                      ];
                                      const colorClass = colors[idx % colors.length];
                                      return (
                                        <span
                                          key={idx}
                                          className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wide border font-bold flex items-center gap-1 ${colorClass}`}
                                        >
                                          <Award className="w-2.5 h-2.5 text-current animate-pulse" />
                                          {badge}
                                        </span>
                                      );
                                    })
                                  ) : (
                                    <>
                                      <span className="px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wide bg-slate-950 border border-white/5 font-semibold text-slate-500 flex items-center gap-1">
                                        <Award className="w-2.5 h-2.5 opacity-50" />
                                        Foundational Sentinel
                                      </span>
                                      <span className="px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wide bg-slate-950 border border-white/5 font-semibold text-slate-500 flex items-center gap-1">
                                        <Award className="w-2.5 h-2.5 opacity-50" />
                                        Ecosystem Pioneer
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* IMMUTABLE ACTION CONTACT FOOTER */}
                          <div className="p-5 bg-slate-950/80 border-t border-white/5 space-y-3 relative select-none">
                            <p className="text-[#00f2ff] font-bold text-[9.5px] uppercase tracking-wider font-mono text-center">&gt; ESTABLISH COMMUNICATIONS ENCRYPTED GATEWAY</p>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              {/* Action 1: Dial secure voice VoIP */}
                              <button
                                onClick={() => {
                                  setActiveCallingUser(currentSelected);
                                  setCallStatus('dialing');
                                }}
                                className="p-3 bg-gradient-to-b from-[#031d2b] to-[#011119] hover:from-[#00f2ff]/20 hover:to-[#00f2ff]/5 border border-cyan-500/20 hover:border-cyan-400 text-cyan-300 font-bold rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer text-center"
                              >
                                <PhoneCall className="w-4 h-4 text-cyan-400 animate-pulse" />
                                <span className="text-[9.5px] tracking-wide font-sans">Voice Call</span>
                              </button>

                              {/* Action 2: WhatsApp Connection */}
                              <a
                                href={`https://wa.me/${(() => {
                                  const rawNum = (currentSelected.mobileNumber || '9848022338').replace(/[^0-9]/g, '');
                                  if (rawNum.length === 10) {
                                    return '91' + rawNum;
                                  }
                                  if (rawNum.length === 11 && rawNum.startsWith('0')) {
                                    return '91' + rawNum.substring(1);
                                  }
                                  return rawNum;
                                })()}?text=Hello%20${encodeURIComponent(currentSelected.fullName)},%20this%20is%20C-SYNC%20Govt%20Degree%20College%20Sentry%20Support.`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-3 bg-gradient-to-b from-[#032314] to-[#01140b] hover:from-emerald-500/20 hover:to-emerald-500/5 border border-emerald-500/20 hover:border-emerald-400 text-emerald-400 font-bold rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer text-center"
                              >
                                <MessageSquare className="w-4 h-4 text-emerald-400" />
                                <span className="text-[9.5px] tracking-wide font-sans">WhatsApp Secure</span>
                              </a>

                              {/* Action 3: Telegram bot secure relay */}
                              <a
                                href="https://t.me/csync_bot"
                                target="_blank"
                                rel="noreferrer"
                                className="p-3 bg-gradient-to-b from-[#03142e] to-[#010b1a] hover:from-sky-500/20 hover:to-sky-500/5 border border-sky-500/20 hover:border-sky-400 text-sky-400 font-bold rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer text-center"
                              >
                                <svg className="w-4 h-4 text-sky-400 shrink-0 fill-current mx-auto" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-.97.53-1.33.52-.4-.01-1.17-.23-1.74-.41-.7-.23-1.26-.35-1.21-.73.03-.2.28-.41.77-.62 3.02-1.31 10.06-4.32 12.11-5.17.92-.38 1.81-.46 2.45-.45.15 0 .49.03.71.12.18.07.31.22.36.38.04.14.05.3.03.46z"/>
                                </svg>
                                <span className="text-[9.5px] tracking-wide font-sans block mt-1">Telegram Bot</span>
                              </a>

                              {/* Action 4: professional LinkedIn sync */}
                              <a
                                href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(currentSelected.fullName)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-3 bg-gradient-to-b from-[#0a1e35] to-[#040f1a] hover:from-blue-500/20 hover:to-blue-500/5 border border-blue-500/20 hover:border-blue-400 text-blue-400 font-bold rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer text-center"
                              >
                                <Linkedin className="w-4 h-4 text-blue-400" />
                                <span className="text-[9.5px] tracking-wide font-sans">LinkedIn Connect</span>
                              </a>
                            </div>

                            {/* Verification tools & access controls */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 font-mono text-[9px] text-slate-400 select-text">
                              <span className="flex items-center gap-1">
                                Secure Line: IP-SEC AES256
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    db.approveUser(currentSelected.id, !currentSelected.isApproved);
                                    onRefreshAll();
                                    // Trigger instant local state updates
                                    setSelectedNexusUser(db.getUsers().find(u => u.id === currentSelected.id) || null);
                                    db.addLog('SECURITY', `Operator changed access status for node: ${currentSelected.fullName}`, 'info');
                                  }}
                                  className={`px-3 py-1 rounded font-bold cursor-pointer transition-all ${
                                    currentSelected.isApproved
                                      ? 'bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 animate-fadeIn'
                                      : 'bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 animate-fadeIn'
                                  }`}
                                >
                                  {currentSelected.isApproved ? '🔒 Revoke Access' : '🔓 Grant Access'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditProfileUser(currentSelected);
                                    setEditName(currentSelected.fullName || '');
                                    setEditIdNumber(currentSelected.idNumber || '');
                                    setEditRole(currentSelected.role || 'Student');
                                    setEditDesignation(currentSelected.designation || '');
                                    setEditSubject(currentSelected.subject || '');
                                    setEditEmail(currentSelected.email || '');
                                    setEditMobile(currentSelected.mobileNumber || '');
                                    setEditParentMobile(currentSelected.parentMobile || '');
                                    setEditTrust(currentSelected.trust_score !== undefined ? currentSelected.trust_score : 100);
                                    setEditStreak(currentSelected.streak !== undefined ? currentSelected.streak : 0);
                                    setEditXp(currentSelected.xp !== undefined ? currentSelected.xp : 120);
                                    setEditLevel(currentSelected.level !== undefined ? currentSelected.level : 3);
                                    setEditPhoto(currentSelected.photoBlob || '');
                                    setEditIsApproved(currentSelected.isApproved !== false);
                                    setShowEditProfileModal(true);
                                  }}
                                  className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 rounded text-cyan-300 font-bold hover:text-white transition-all cursor-pointer flex items-center gap-1"
                                  title="Update credentials, achievements and facial scan data"
                                >
                                  ✏️ Edit Profile
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you absolutely sure you want to completely erase the registration pass for: ${currentSelected.fullName}?`)) {
                                      const idx = db.getUsers().findIndex(u => u.id === currentSelected.id);
                                      if (idx !== -1) {
                                        db.getUsers().splice(idx, 1);
                                        db.addLog('SECURITY', `Operator purged directory record: ${currentSelected.fullName}`, 'error');
                                        setSelectedNexusUser(null);
                                        onRefreshAll();
                                      }
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-red-950 hover:bg-red-900 border border-red-500/30 rounded text-red-300 font-bold hover:text-white transition-all cursor-pointer"
                                  title="Erase directory record completely"
                                >
                                  Purge Record
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#050c1e]/60 border border-dashed border-cyan-500/20 rounded-2xl p-12 text-center text-slate-500 flex flex-col justify-center items-center h-full min-h-[460px]">
                          <Users className="w-12 h-12 text-cyan-500 opacity-20 mb-3 animate-pulse" />
                          <h4 className="text-white font-bold text-sm">Nexus Member Profile Inspector</h4>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-normal">
                            Select any student, visiting expert, faculty, or alumni index record in the left ledger directory to pull encrypted credential keys, trust signatures, and active workstation maps.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })()}

            {/* TAB CONTENT: 3. ENROLLMENTS & APPROVALS QUEUE */}
            {activeAdminTab === 'approvals' && (
              <div className="space-y-4 animate-fadeIn text-left">
                <div className="bg-[#060c1c] border border-cyan-500/15 p-5 rounded-2xl">
                  <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-3">
                    <h3 className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-yellow-400" />
                      &gt; Biometric facial scanner validation queue
                    </h3>
                    <span className="text-xs text-slate-400 uppercase font-mono font-bold">
                      {allUsers.filter(u => u.isApproved === false).length} waiting for approval
                    </span>
                  </div>

                  {allUsers.filter(u => u.isApproved === false).length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                      <div className="p-4 rounded-full bg-cyan-950/20 border border-cyan-500/10 w-16 h-16 flex items-center justify-center mx-auto mb-3">
                        <Check className="w-8 h-8 text-[#00f2ff]" />
                      </div>
                      <h4 className="text-white font-bold font-sans text-sm">Clearance queues resolved</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-normal">
                        All student biometric registrations are authorized. Mobile PWAs can successfully log onto workstation nodes.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allUsers.filter(u => u.isApproved === false).map((pendingUser) => (
                        <div key={pendingUser.id} className="p-4 bg-slate-950/80 border border-cyan-500/10 rounded-2xl flex flex-col justify-between gap-4">
                          <div className="space-y-3">
                            {/* Profile thumb and verification capture */}
                            <div className="flex gap-3">
                              <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden bg-black/40 relative group flex-shrink-0" title="User uploaded profile">
                                <img src={pendingUser.photoBlob || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <div className="absolute inset-x-0 bottom-0 bg-black/80 text-[7px] text-center uppercase tracking-tighter py-0.2 select-none">PHOTO</div>
                              </div>

                              <div className="w-12 h-12 rounded-xl border border-[#00f2ff]/30 overflow-hidden bg-black/40 relative group flex-shrink-0" title="Biometric face verify capture">
                                <img src={pendingUser.photoBlob || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <div className="absolute inset-x-0 bottom-0 bg-[#001f2d]/90 text-[7px] text-[#00f2ff] text-center uppercase tracking-tighter font-mono py-0.2 select-none">SCAN_FACE</div>
                              </div>

                              <div className="text-left">
                                <h4 className="text-white text-xs font-black tracking-wide leading-tight">{pendingUser.fullName}</h4>
                                <span className="bg-cyan-950/80 text-[#00f2ff] text-[8.5px] px-1.5 py-0.2 border border-[#00f2ff]/20 inline-block rounded font-mono font-bold uppercase mt-1">
                                  {pendingUser.role}
                                </span>
                              </div>
                            </div>

                            {/* Verification criteria info fields */}
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 bg-black/40 p-3 rounded-xl text-[9px] font-mono text-slate-400">
                              <div>
                                <span className="text-slate-600 block text-[8px] uppercase">Email ID:</span>
                                <span className="text-slate-300 break-all">{pendingUser.email || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-slate-600 block text-[8px] uppercase">Mobile No:</span>
                                <span className="text-slate-300">{pendingUser.mobileNumber || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-slate-600 block text-[8px] uppercase">ID/Roll No:</span>
                                <span className="text-slate-300 text-[9.5px] font-bold text-[#00f2ff]">{pendingUser.idNumber}</span>
                              </div>
                              <div>
                                <span className="text-slate-600 block text-[8px] uppercase">Gender:</span>
                                <span className="text-slate-300">{pendingUser.gender || 'N/A'}</span>
                              </div>

                              {pendingUser.subject && (
                                <div className="col-span-2 border-t border-white/5 pt-1.5 mt-1">
                                  <span className="text-slate-600 block text-[8px] uppercase">Department / Course Study:</span>
                                  <span className="text-slate-300 font-sans text-[10px]">{pendingUser.subject} (Batch: {pendingUser.batch}, Yr {pendingUser.year})</span>
                                </div>
                              )}

                              {pendingUser.purpose && (
                                <div className="col-span-2 border-t border-white/5 pt-1.5 mt-1 font-sans">
                                  <span className="text-slate-600 font-mono text-[8.5px] block uppercase">Reason / Purpose:</span>
                                  <span className="text-yellow-300 italic">"{pendingUser.purpose}"</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action approvals buttons */}
                          <div className="flex gap-2 justify-end border-t border-cyan-500/5 pt-3">
                            <button
                              onClick={() => {
                                db.approveUser(pendingUser.id, true);
                                onRefreshAll();
                              }}
                              className="bg-emerald-500 hover:bg-emerald-450 text-slate-950 px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider font-mono transition-colors"
                              type="button"
                            >
                              Approve Registration
                            </button>
                            <button
                              onClick={() => {
                                db.rejectUser(pendingUser.id);
                                onRefreshAll();
                              }}
                              className="bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900 text-rose-300 px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider font-mono transition-colors"
                              type="button"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. ATTENDANCE & PWA FILES SYNC */}
            {activeAdminTab === 'attendance' && (
              <div className="space-y-6 animate-fadeIn text-left">
                
                {/* File Synchronizer telemetry tracker */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Sync progress monitor */}
                  <div className="md:col-span-7 bg-[#060c1c] border border-cyan-500/15 p-5 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">&gt; Local Sync File transfers list</h3>
                      <button
                        onClick={handleGenerateAttendanceSync}
                        className="text-[10px] bg-cyan-950/60 text-[#00f2ff] border border-cyan-500/20 rounded-xl px-3 py-1.5 hover:bg-[#00f2ff] hover:text-slate-950 hover:border-[#00f2ff] transition-all font-mono font-bold"
                      >
                        Fire Sync Event Trigger
                      </button>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      {syncHistory.map((file) => (
                        <div key={file.id} className="p-3 bg-slate-950 border border-white/5 rounded-xl">
                          <div className="flex justify-between text-slate-300 mb-1">
                            <span className="truncate max-w-[200px] font-sans font-bold text-white tracking-wide" title={file.name}>
                              {file.name.split('/').pop()}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Node: {file.stationId}</span>
                          </div>

                          {/* Progress Line */}
                          <div className="w-full bg-[#030712] rounded-full h-1.5 overflow-hidden my-1 border border-cyan-500/5">
                            <div 
                              className={`h-full transition-all duration-300 ${file.progress === 100 ? 'bg-emerald-400' : 'bg-[#00f2ff] animate-pulse'}`}
                              style={{ width: `${file.progress}%` }}
                            ></div>
                          </div>

                          <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                            <span>{(file.size / 1024).toFixed(1)} KB (SYNCING {file.progress}%)</span>
                            {file.status === 'SYNCING' ? (
                              <span className="text-cyan-400 font-bold">{file.speed} KB/s</span>
                            ) : (
                              <span className={`${file.progress === 100 ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>{file.status}</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {syncHistory.length === 0 && (
                        <p className="text-xs text-slate-500 italic py-6">No workstation file sync logs recorded in database memory yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Attendance log metrics */}
                  <div className="md:col-span-5 bg-[#060c1c] border border-cyan-500/15 p-5 rounded-2xl">
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4">&gt; Interactive Attendance Log Entries</h3>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                      {attendanceList.map((att) => {
                        const matchedUser = db.getUsers().find(u => u.fullName === att.userName || u.id === att.userId);
                        return (
                          <div key={att.id} className="p-2.5 bg-slate-950/90 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5">
                              {matchedUser?.photoBlob ? (
                                <img src={matchedUser.photoBlob} alt="" className="w-7 h-7 rounded-full object-cover border border-[#00f2ff]/30 shrink-0" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="p-1 rounded bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 shrink-0">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <div>
                                <div className="text-white font-bold">{att.userName}</div>
                                <div className="text-[9px] text-slate-400 mt-0.5">
                                  Unlocked terminal <span className="text-[#00f2ff] font-bold font-mono">{att.stationId}</span>
                                </div>
                                <div className="text-[8px] text-slate-500 mt-1 font-mono uppercase tracking-tighter">GPS: {att.gpsCoords}</div>
                              </div>
                            </div>
                            <div className="text-right text-[9px] text-[#00f2ff]/70 font-mono flex-shrink-0">
                              {new Date(att.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                            </div>
                          </div>
                        );
                      })}
                      {attendanceList.length === 0 && (
                        <p className="text-xs text-slate-500 italic py-6 text-center">No attendance punches captured today yet.</p>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB CONTENT: 5. 4TH YEAR EXEMPTIONS */}
            {activeAdminTab === '4thyear' && (
              <div className="space-y-4 animate-fadeIn text-left">
                <div className="bg-[#060c1c] border border-cyan-500/15 p-5 rounded-2xl">
                  <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-3">
                    <h3 className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-yellow-400" />
                      &gt; 4th Year Student Device enrollment request list
                    </h3>
                  </div>

                  {allUsers.filter(u => u.reasonFor4thYear).length === 0 ? (
                    <p className="text-slate-500 text-xs italic py-12 text-center">No fourth-year students matching database exclusion reasons found.</p>
                  ) : (
                    <div className="space-y-3.5">
                      {allUsers.filter(u => u.reasonFor4thYear).map((u) => {
                        const isApproved = u.isApproved === true;
                        return (
                          <div key={u.id} className="p-4 bg-slate-950 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-sans">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[9px] px-1.5 py-0.5 rounded uppercase font-mono font-bold">
                                  4th Year Exception Case
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold font-mono ${isApproved ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-rose-950 text-rose-400 border border-rose-500/20'}`}>
                                  {isApproved ? 'APPROVED' : 'PENDING'}
                                </span>
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white">{u.fullName} <span className="text-[10px] text-slate-500 font-mono font-normal">({u.idNumber})</span></h4>
                                <p className="text-[10px] text-slate-400 font-mono mt-1">Course study: {u.subject} | Batch: {u.batch} | Parent Phone: {u.parentMobile || 'Not declared'}</p>
                              </div>
                              <div className="p-2.5 bg-yellow-950/10 border border-yellow-500/15 rounded-xl text-yellow-100 italic leading-relaxed text-[11px] max-w-2xl font-mono">
                                <b>Reason entered:</b> "{u.reasonFor4thYear}"
                              </div>
                            </div>

                            <div className="flex md:flex-col gap-2 shrink-0 self-stretch md:self-auto justify-end">
                              <button
                                onClick={() => {
                                  db.approveUser(u.id, !isApproved);
                                  onRefreshAll();
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                                  isApproved 
                                    ? 'bg-rose-950/40 text-[10px] text-rose-400 border border-rose-500/20 hover:bg-rose-900/60' 
                                    : 'bg-emerald-500 hover:bg-emerald-450 text-[#020617] text-[10px]'
                                }`}
                              >
                                {isApproved ? 'Revoke request' : 'Approve exemption'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* TAB CONTENT: 6. HOLIDAY LIST */}
            {activeAdminTab === 'holidays' && (
              <div className="space-y-6 animate-fadeIn text-left">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Holiday listing */}
                  <div className="md:col-span-7 bg-[#060c1c] border border-cyan-500/15 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4">&gt; Mapped Academic Holidays</h3>
                      <div className="space-y-2.5">
                        {holidays.map((h) => (
                          <div key={h.id} className="p-3 bg-slate-950 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                            <div className="text-left">
                              <h4 className="text-sm font-bold text-white">{h.name}</h4>
                              <p className="text-slate-500 text-[10px] font-mono mt-1 uppercase flex items-center gap-1">
                                <CalendarDays className="w-3 h-3 text-[#00f2ff]" />
                                DATE: {h.date}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteHoliday(h.id)}
                              className="p-1.5 bg-slate-900/40 hover:bg-rose-950 border border-white/5 hover:border-rose-500/30 rounded text-rose-400 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {holidays.length === 0 && (
                          <p className="text-xs text-slate-500 italic py-6 text-center">No campus holidays configured in memory.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Holiday add form */}
                  <div className="md:col-span-5 bg-[#060c1c] border border-cyan-500/15 p-5 rounded-2xl">
                    <h3 className="text-xs font-mono font-bold text-[#00f2ff] uppercase tracking-wider mb-4">&gt; Configure New Holiday</h3>
                    <form onSubmit={handleAddHoliday} className="space-y-4 font-mono text-xs">
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-bold block uppercase text-[10px]">Holiday description / Name:</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramzan Recess Break"
                          value={newHolidayName}
                          onChange={(e) => setNewHolidayName(e.target.value)}
                          className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-bold block uppercase text-[10px]">Scheduled Date:</label>
                        <input
                          type="date"
                          required
                          value={newHolidayDate}
                          onChange={(e) => setNewHolidayDate(e.target.value)}
                          className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#00f2ff] hover:bg-[#5eecff] text-[#020617] text-xs font-black rounded-xl py-3 uppercase tracking-wide transition-all"
                      >
                        Publish Academic Holiday
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            )}

            {/* TAB CONTENT: 7. PANIC EMERGENCY Signals */}
            {activeAdminTab === 'panic' && (
              <div className="space-y-6 animate-fadeIn text-left">
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Live distress desk */}
                  <div className="md:col-span-8 bg-[#060c1c] border border-cyan-500/15 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping"></span>
                          &gt; Sentry Real-Time Distress Grid
                        </h3>
                        <span className="text-[10px] text-zinc-400 font-mono uppercase bg-rose-950/40 border border-rose-500/30 px-2 py-0.5 rounded">
                          {panicAlerts.filter(a => a.status === 'ACTIVE').length} active alarms triggered
                        </span>
                      </div>

                      {panicAlerts.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 font-mono text-xs border border-white/5 bg-slate-950/30 rounded-xl">
                          No safety alarm history recorded. Host system operates securely.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {panicAlerts.map((p) => {
                            const isActive = p.status === 'ACTIVE';
                            const isFemExtreme = p.isExtremeFemalePanic;
                            const isScanningThis = adminScanningPanicId === p.id;

                            return (
                              <div 
                                key={p.id} 
                                className={`p-4 rounded-xl border relative overflow-hidden transition-all duration-300 ${
                                  isActive 
                                    ? isFemExtreme 
                                      ? 'bg-gradient-to-r from-[#200507] to-[#0d0102] border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                                      : 'bg-rose-950/20 border-rose-400/40' 
                                    : 'bg-[#040915] border-white/5'
                                }`}
                              >
                                {isFemExtreme && isActive && (
                                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-400 to-red-500 animate-pulse"></div>
                                )}

                                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase font-mono tracking-widest ${
                                      isActive 
                                        ? isFemExtreme 
                                          ? 'bg-red-600 text-white animate-pulse' 
                                          : 'bg-rose-900 text-rose-200' 
                                        : 'bg-slate-900 text-slate-500'
                                    }`}>
                                      {isActive ? (isFemExtreme ? '🚨 FEMALE EMERGENCY' : '🛑 ACTIVE') : '✓ RESOLVED'}
                                    </span>
                                    <span className="text-white font-black font-orbitron text-xs">STATION: {p.stationId}</span>
                                  </div>
                                  <div className="text-[10px] text-zinc-400 font-mono">
                                    {new Date(p.timestamp).toLocaleString()}
                                  </div>
                                </div>

                                <div className="space-y-2 mt-2">
                                  <div className="text-zinc-200 text-xs bg-black/40 border border-white/[0.04] p-2.5 rounded-lg italic font-sans">
                                    " {p.message} "
                                  </div>

                                  {/* Geographic satellite metadata for legal use */}
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2 text-[9.5px] font-mono border-t border-b border-white/5 bg-slate-950/40 px-2 rounded-lg">
                                    <div>
                                      <span className="text-zinc-500">Sentry Coordinates:</span>
                                      <div className="text-[#00f2ff] font-bold">Lat: {p.latitude?.toFixed(5) || '17.72264'}, Lng: {p.longitude?.toFixed(5) || '83.31518'}</div>
                                    </div>
                                    <div>
                                      <span className="text-zinc-500">Telegram Feed Telegram Log:</span>
                                      <div className="text-emerald-400 font-bold">{p.telegramDispatched ? '✓ DISPATCHED LIVE' : '⌛ PENDING OUT'}</div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                      <span className="text-zinc-500">Legal Block Stamp:</span>
                                      <div className="text-slate-400 truncate max-w-[120px]" title="SHA-256 system audit security integrity hash key">
                                        SHA256_{Math.abs(p.id * 84931).toString(16)}BFE
                                      </div>
                                    </div>
                                  </div>

                                  {/* Real-time map & approaching rescue inside card if active */}
                                  {isActive && (
                                    <div className="bg-slate-950 p-2.5 rounded-lg border border-red-500/10 space-y-2">
                                      <div className="flex justify-between items-center text-[9px] font-mono">
                                        <span className="text-zinc-400 uppercase tracking-widest font-black flex items-center gap-1">
                                          <Radio className="w-3 h-3 text-red-500 animate-ping" /> Sentry Physical Location Corridor
                                        </span>
                                        <span className="text-[#00f2ff] font-bold">Unit Lock activated</span>
                                      </div>
                                      <div className="h-4 bg-red-950/20 rounded relative overflow-hidden flex items-center px-2">
                                        <div className="absolute left-[15%] h-2.5 w-2.5 bg-red-500 rounded-full animate-ping"></div>
                                        <div className="absolute left-[15%] h-1.5 w-1.5 bg-red-500 rounded-full"></div>
                                        <span className="text-[8px] font-mono text-zinc-400 ml-6 uppercase">Target workstation Node is locked in distress state</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Resolution badges or interactive scanner */}
                                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2.5 border-t border-white/5 font-sans">
                                    <span className="text-[10.5px] text-zinc-400">
                                      Distress Reporter: <strong className="text-zinc-300 font-mono text-[9.5px]">{p.userName}</strong>
                                    </span>

                                    {isActive ? (
                                      <div className="flex gap-2">
                                        {/* Biometric verification trigger */}
                                        <button
                                          type="button"
                                          disabled={isScanningThis}
                                          onClick={() => handleResolvePanicWithFaceSim(p.id)}
                                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10.5px] font-black rounded px-3 py-1 uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                                        >
                                          <Camera className="w-3.5 h-3.5" /> 3D Face Match
                                        </button>

                                        {/* Standard resolve bypass */}
                                        <button
                                          type="button"
                                          disabled={isScanningThis}
                                          onClick={() => handleResolvePanic(p.id)}
                                          className="bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-[10.5px] font-black rounded px-3 py-1 uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                                        >
                                          Witness Release
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/20">
                                        <Check className="w-3.5 h-3.5" />
                                        {p.resolvedByFace ? (
                                          <span>Verified via 3D biometric landmarks (Match: {p.resolvedFaceScore}%) for reporter</span>
                                        ) : (
                                          <span>Closed via administrative bypass authority: {p.resolvedUserName}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* If scanning, render interactive mock landmarks feed overlay */}
                                  {isScanningThis && (
                                    <div className="mt-3 p-3 bg-slate-950 border border-cyan-500/20 rounded-lg text-left font-mono space-y-2">
                                      <div className="flex justify-between text-[10px] text-cyan-400">
                                        <span className="animate-pulse">LANDMARK MATCH PROGRESS...</span>
                                        <span>{adminFaceScore}% MATCH</span>
                                      </div>
                                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-gradient-to-r from-cyan-500 to-[#00f2ff] transition-all duration-300"
                                          style={{ width: `${adminFaceScore}%` }}
                                        ></div>
                                      </div>
                                      <div className="text-[8.5px] text-zinc-500 font-sans leading-relaxed">
                                        Retrieving official face coordinates mesh from student enrollment records database system. Matching nodal geometry with camera stream landmarks...
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fire automated system alerts simulator component */}
                  <div className="md:col-span-4 bg-[#060c1c] border border-cyan-500/15 p-5 rounded-2xl h-fit">
                    <h3 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                      &gt; Trigger Sentry Mock Simulation
                    </h3>
                    
                    <form onSubmit={handleFireSimulatedPanic} className="space-y-4 font-mono text-xs">
                      <div className="space-y-1.5 text-left">
                        <label className="text-slate-400 font-bold block uppercase text-[10px]">Select Distress Workstation node:</label>
                        <select
                          value={panicTriggerStation}
                          onChange={(e) => setPanicTriggerStation(e.target.value)}
                          className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60"
                        >
                          {stations.map(s => (
                            <option key={s.stationId} value={s.stationId}>{s.stationId} ({s.status})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-slate-400 font-bold block uppercase text-[10px]">Distress scenario message:</label>
                        <textarea
                          placeholder="Motherboard spark / thermal smoke hazard..."
                          required
                          value={panicTriggerMsg}
                          rows={2}
                          onChange={(e) => setPanicTriggerMsg(e.target.value)}
                          className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60 font-sans"
                        />
                      </div>

                      {/* Female specific emergency switch */}
                      <div className="p-3 bg-red-950/15 border border-red-500/20 rounded-xl space-y-1.5 text-left">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="panicIsFemaleExtremeSim"
                            checked={panicIsFemaleExtremeSim}
                            onChange={(e) => setPanicIsFemaleExtremeSim(e.target.checked)}
                            className="accent-red-500 h-3.5 w-3.5 rounded"
                          />
                          <label htmlFor="panicIsFemaleExtremeSim" className="text-[10px] text-red-400 font-black tracking-wider uppercase cursor-pointer">
                            Extreme Female Specific SOS
                          </label>
                        </div>
                        <p className="text-[8.5px] text-zinc-400 font-sans leading-tight">
                          If checked, overrides general workstation safety level policies and triggers priority escort routing, siren sounds, and flash protocols in law repositories.
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-rose-500 hover:bg-rose-450 text-slate-950 text-xs font-black py-3 rounded-xl uppercase tracking-wider transition-all shadow-md shadow-rose-500/15 cursor-pointer animate-pulse"
                      >
                        Launch Mock Sentry Incident
                      </button>
                    </form>
                  </div>

                </div>

              </div>
            )}

            {/* TAB CONTENT: LEAVES CAMPUS PASS SENTRY DESK */}
            {activeAdminTab === 'leaves' && (
              <div className="space-y-6 animate-fadeIn text-left font-sans">
                
                {/* Stats Overview Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#050b1c] rounded-xl border border-cyan-500/15 p-4 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-zinc-500 uppercase font-mono font-bold">Standard Pending Queue</span>
                      <span className="text-2xl font-black text-[#00f2ff] font-mono">
                        {leaveRequestsState.filter(r => r.status === 'PENDING').length}
                      </span>
                    </div>
                    <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-lg">
                      <FileText className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>

                  <div className="bg-[#0a051d] rounded-xl border border-purple-500/15 p-4 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-zinc-500 uppercase font-mono font-bold">HOD Escalation Alerts</span>
                      <span className="text-2xl font-black text-purple-400 font-mono">
                        {leaveRequestsState.filter(r => r.status === 'ESCALATED').length}
                      </span>
                    </div>
                    <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-lg">
                      <span className="absolute -mt-1 -ml-1 w-2 h-2 rounded-full bg-purple-400 inline-block animate-ping"></span>
                      <ShieldCheck className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>

                  <div className="bg-[#030d0d] rounded-xl border border-emerald-500/15 p-4 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-zinc-500 uppercase font-mono font-bold">Processed Passes</span>
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        {leaveRequestsState.filter(r => r.status === 'APPROVED' || r.status === 'REJECTED').length}
                      </span>
                    </div>
                    <div className="p-3 bg-emerald-950/20 border border-emerald-500/25 rounded-lg">
                      <Award className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* Filter and Search Bar Row */}
                <div className="bg-[#050b1c] rounded-xl border border-cyan-500/15 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search name, id, category..."
                      value={leaveSearch}
                      onChange={(e) => setLeaveSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#00f2ff]/50 transition"
                    />
                    {leaveSearch && (
                      <button
                        onClick={() => setLeaveSearch('')}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                        type="button"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                    {(['ALL', 'PENDING', 'ESCALATED', 'APPROVED', 'REJECTED'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setLeaveFilter(filter)}
                        type="button"
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition uppercase border cursor-pointer ${
                          leaveFilter === filter
                            ? 'bg-[#00f2ff] text-slate-950 border-[#00f2ff] shadow-md shadow-cyan-400/10'
                            : 'bg-slate-950 text-slate-400 border-white/5 hover:bg-slate-900'
                        }`}
                      >
                        {filter === 'ALL' ? 'Show All' : filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leaves Lists */}
                <div className="space-y-4 font-sans">
                  {(() => {
                    const filtered = leaveRequestsState.filter(r => {
                      const searchMatch = !leaveSearch || 
                        r.userName.toLowerCase().includes(leaveSearch.toLowerCase()) ||
                        r.userId.toString().includes(leaveSearch) ||
                        r.reason.toLowerCase().includes(leaveSearch.toLowerCase()) ||
                        r.submittedToName.toLowerCase().includes(leaveSearch.toLowerCase());

                      if (!searchMatch) return false;
                      if (leaveFilter === 'ALL') return true;
                      return r.status === leaveFilter;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="p-10 text-center bg-[#050b1c] border border-cyan-500/10 rounded-xl space-y-2">
                          <CalendarDays className="w-8 h-8 text-cyan-500/35 mx-auto animate-pulse" />
                          <p className="text-slate-400 text-xs">No active leave requests match the diagnostic filter criteria.</p>
                        </div>
                      );
                    }

                    return filtered.map((req) => {
                      const isPending = req.status === 'PENDING';
                      const isEscalated = req.status === 'ESCALATED';
                      const isApproved = req.status === 'APPROVED';
                      const isRejected = req.status === 'REJECTED';
                      const isHodAnnouncement = req.userId === req.submittedToId || req.submittedToName === req.userName;

                      return (
                        <div
                          key={req.id}
                          className={`p-5 rounded-xl border transition-all ${
                            isHodAnnouncement
                              ? 'bg-[#041126]/40 border-[#00f2ff]/35 shadow-[0_0_15px_rgba(0,242,255,0.05)]'
                              : isEscalated
                              ? 'bg-purple-950/10 border-purple-500/30'
                              : isPending
                              ? 'bg-[#0a0f1d] border-cyan-500/20'
                              : isApproved
                              ? 'bg-[#031310] border-emerald-500/20'
                              : 'bg-rose-950/10 border-rose-500/20 opacity-75'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-3">
                            <div className="space-y-1 text-left">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-white text-sm">{req.userName}</span>
                                <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  isHodAnnouncement ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-black' :
                                  req.userRole === 'Staff' ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/25' : 'bg-slate-900 border border-white/5 text-slate-350'
                                }`}>
                                  {isHodAnnouncement ? 'HOD DEPT NOTICE' : req.userRole}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono font-bold">ID: {req.userIdNumber}</span>
                              </div>
                              <p className="text-[10px] text-slate-400">
                                {isHodAnnouncement ? (
                                  <span className="text-cyan-400 font-bold">📢 PUBLIC LOBBY INTUI-BROADCAST ACTIVE</span>
                                ) : (
                                  <>Linkage review assigned to: <span className="text-white font-bold">{req.submittedToName}</span> (College HOD)</>
                                )}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 text-[10px] font-mono">{req.timestamp}</span>
                              <span className={`text-[9.5px] uppercase font-mono font-bold tracking-wider px-2 py-0.8 rounded border ${
                                isHodAnnouncement ? 'bg-cyan-950 text-cyan-300 border-cyan-500/45 animate-pulse' :
                                isApproved ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' :
                                isRejected ? 'bg-rose-950 text-rose-400 border-rose-500/30' :
                                isEscalated ? 'bg-purple-950 text-purple-400 border-purple-500/30 animate-pulse font-black' :
                                'bg-amber-950 text-amber-400 border-amber-500/30'
                              }`}>
                                {isHodAnnouncement ? 'UNRESTRICTED' : req.status}
                              </span>
                            </div>
                          </div>

                          {/* Request details body */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-3.5 text-xs text-left">
                            <div className="md:col-span-8 space-y-2">
                              <div>
                                <span className="text-slate-500 text-[9px] block uppercase font-mono tracking-wider font-bold">
                                  {isHodAnnouncement ? 'Broadcast Announcement Bulletin' : 'Academic Reason Description'}
                                </span>
                                <p className="text-slate-200 mt-0.5 whitespace-pre-wrap italic">"{req.reason}"</p>
                              </div>

                              <div className="flex gap-4 text-[10px] bg-slate-950/50 p-2.5 rounded-lg border border-white/5 w-fit">
                                <div>
                                  <span className="text-slate-500 block text-[8px] uppercase font-mono font-bold">Start date index</span>
                                  <span className="text-emerald-400 font-bold font-mono">{req.startDate}</span>
                                </div>
                                <div className="border-l border-white/10 pl-4">
                                  <div>
                                    <span className="text-slate-500 block text-[8px] uppercase font-mono font-bold">End decay index</span>
                                    <span className="text-amber-400 font-bold font-mono">{req.endDate}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Actions block with custom reviewer feedback comments input */}
                            <div className="md:col-span-4 bg-slate-950/60 p-3 rounded-lg border border-white/5 space-y-2.5 h-full flex flex-col justify-between">
                              {isHodAnnouncement ? (
                                <div className="flex flex-col justify-center items-center h-full text-center p-2 space-y-2">
                                  <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                                  <div>
                                    <span className="block text-[8px] font-mono uppercase text-cyan-400 tracking-widest font-black">BROADCAST ACTIVE</span>
                                    <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">This announcement is propagated to student PWA mobile interfaces & ledger.</p>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="space-y-1.5 text-left font-sans">
                                    <label className="text-slate-400 text-[8px] block uppercase font-mono font-bold">Sentry feedback / comment</label>
                                    <input
                                      type="text"
                                      placeholder={req.feedback ? `Current comment: "${req.feedback}"` : "Specify review feedback comments..."}
                                      value={adminFeedbackMap[req.id] || ''}
                                      onChange={(e) => setAdminFeedbackMap(prev => ({...prev, [req.id]: e.target.value}))}
                                      className="w-full bg-slate-950 border border-white/10 rounded px-2 py-1.5 text-[9.5px] text-white focus:outline-none focus:border-cyan-400 transition"
                                    />
                                  </div>

                                  <div className="flex gap-1.5 flex-wrap">
                                    {(isPending || isEscalated) ? (
                                      <>
                                        <button
                                          onClick={() => handleUpdateLeave(req.id, 'APPROVED')}
                                          type="button"
                                          className="flex-1 py-1 px-2.5 rounded bg-emerald-700 hover:bg-emerald-600 font-mono text-[9px] text-white uppercase font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                          <Check className="w-3.5 h-3.5" /> Approve
                                        </button>
                                        <button
                                          onClick={() => handleUpdateLeave(req.id, 'REJECTED')}
                                          type="button"
                                          className="flex-1 py-1 px-2.5 rounded bg-rose-700 hover:bg-rose-600 font-mono text-[9px] text-white uppercase font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                          <X className="w-3.5 h-3.5" /> Refuse
                                        </button>
                                        
                                        {isPending && (
                                          <button
                                            onClick={() => handleUpdateLeave(req.id, 'ESCALATED')}
                                            type="button"
                                            className="w-full py-1 rounded bg-purple-900 border border-purple-500/30 hover:bg-purple-800 font-mono text-[8.5px] text-slate-200 uppercase tracking-wide transition flex items-center justify-center gap-1 mt-1 cursor-pointer"
                                          >
                                            <ShieldCheck className="w-3 h-3 text-purple-400" /> Escalate to Head
                                          </button>
                                        )}
                                      </>
                                    ) : (
                                      <div className="text-[10px] text-slate-500 italic py-1 font-mono text-center w-full">
                                        Processed {req.feedback ? `with feedback "${req.feedback}"` : '(No review feedback)'}
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 8. SETTINGS & LOGS */}
            {activeAdminTab === 'settings' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left animate-fadeIn">
                
                {/* Security system logs list */}
                <div className="md:col-span-7 bg-[#060c1c] border border-cyan-500/15 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4">&gt; Global security and operations trace logs</h3>
                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                      {logs.map((log) => {
                        const isErr = log.level === 'error';
                        const isWarn = log.level === 'warning';
                        const isSucc = log.level === 'success';
                        return (
                          <div key={log.id} className="p-2 bg-slate-950 border border-white/5 rounded-xl">
                            <div className="flex justify-between items-center mb-1 text-[8px] text-slate-500 select-none">
                              <span className={`px-1.5 py-0.2 rounded font-mono font-bold ${
                                isErr ? 'bg-red-950 text-red-400 border border-red-500/20' 
                                      : isWarn ? 'bg-amber-950 text-amber-500 border border-amber-500/20' 
                                               : isSucc ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' 
                                                        : 'bg-cyan-950 text-cyan-400 border border-cyan-500/20'
                              }`}>
                                {log.category}
                              </span>
                              <span className="font-mono">{log.timestamp}</span>
                            </div>
                            <p className="text-slate-300 font-mono text-[10.5px] leading-relaxed text-left">{log.message}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* DB administrative actions */}
                <div className="md:col-span-5 bg-[#060c1c] border border-cyan-500/15 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4">&gt; Lab lockout & DB admin tools</h3>
                    
                    <div className="space-y-4 font-mono text-xs">
                      <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/10">
                        <h4 className="font-bold text-white mb-1.5 flex items-center gap-1">
                          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                          Master security override
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-normal mb-3">
                          Instantly send terminal bypass sequences to unlocked workstation nodes.
                        </p>
                        <button
                          onClick={() => {
                            stations.forEach(s => {
                              if (s.status === 'LOCKED') {
                                db.adminToggleStation(s.stationId);
                              }
                            });
                            db.addLog('SECURITY', 'Master operator command: Unlocked all campus workstation nodes.', 'success');
                            
                            // Broadcast to server sandbox in-memory watchdog mapper
                            fetch('/api/kiosk-watchdog/global-lock', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'UNLOCKED' })
                            }).catch(e => console.error("Global watchdog unlock failure:", e));

                            setStations([...db.getStations()]);
                            onRefreshAll();
                          }}
                          className="w-full bg-cyan-950/60 hover:bg-cyan-500/15 border border-cyan-500/25 hover:text-white text-cyan-400 rounded-lg py-2 uppercase text-[10px] tracking-wider transition-all"
                        >
                          Unlock all workstations
                        </button>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/10">
                        <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                          <Cpu className="w-4 h-4 text-cyan-400" />
                          Workstation physical bindings (MAC ID registry)
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-normal mb-3">
                          Sovereign security overlay. Revoke or reset physical workstation MAC-to-Client bindings to authorize new hardware.
                        </p>
                        
                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                          {stations.filter(s => s.pcMacAddress && !s.pcMacAddress.includes('Pending')).map((s) => (
                            <div key={s.stationId} className="flex items-center justify-between p-1.5 rounded bg-white/5 border border-white/5 text-[9.5px]">
                              <div className="flex flex-col">
                                <span className="font-bold text-white">{s.stationId}</span>
                                <span className="text-[8.5px] text-[#00f2ff] select-all">{s.pcMacAddress}</span>
                              </div>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to release the security MAC address binding for Workstation ${s.stationId}?\n\nThis will force the workstation into 'Pending First Run' state, requiring the next operator to securely bind on startup.`)) {
                                    db.adminReleaseStationHardware(s.stationId);
                                    setStations([...db.getStations()]);
                                    onRefreshAll();
                                  }
                                }}
                                className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 rounded transition-all text-[8px] uppercase tracking-wider font-bold cursor-pointer"
                                type="button"
                              >
                                Revoke MAC
                              </button>
                            </div>
                          ))}
                          {stations.filter(s => s.pcMacAddress && !s.pcMacAddress.includes('Pending')).length === 0 && (
                            <p className="text-[9px] text-slate-500 text-center py-2 italic">
                              No workstations currently bound to physical MAC addresses.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/10">
                        <h4 className="font-bold text-white mb-1.5 flex items-center gap-1">
                          <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />
                          Emergency emergency lock
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-normal mb-3">
                          Instantly disconnect all active student sessions and power down node ports.
                        </p>
                        <button
                          onClick={() => {
                            stations.forEach(s => {
                              if (s.status === 'UNLOCKED') {
                                db.adminToggleStation(s.stationId);
                              }
                            });
                            db.addLog('SECURITY', 'CRITICAL COMMAND SHUTDOWN: Forced locked all workstations.', 'error');
                            
                            // Broadcast lock commands to server watchdog
                            fetch('/api/kiosk-watchdog/global-lock', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'LOCKED' })
                            }).catch(e => console.error("Global watchdog lock failure:", e));

                            setStations([...db.getStations()]);
                            onRefreshAll();
                          }}
                          className="w-full bg-rose-950/60 hover:bg-rose-500/20 border border-rose-500/25 hover:text-white text-rose-400 rounded-lg py-2 uppercase text-[10px] tracking-wider transition-all"
                        >
                          Lock all workstations
                        </button>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/15">
                        <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                          <Palette className="w-4 h-4 text-cyan-400" />
                          Dashboard accent color customizer
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-normal mb-3">
                          Select a primary accent color to style the C-Sync dashboard.
                        </p>
                        <div className="flex items-center gap-3">
                          <input 
                            type="color" 
                            id="csync-primary-color-picker"
                            value={primaryAccentColor}
                            onChange={(e) => {
                              if (onChangePrimaryAccentColor) {
                                onChangePrimaryAccentColor(e.target.value);
                              }
                            }}
                            className="w-10 h-10 border border-white/10 rounded-lg cursor-pointer bg-transparent p-0 flex-shrink-0"
                          />
                          <div className="flex-grow">
                            <input 
                              type="text" 
                              id="csync-primary-color-text-input"
                              value={primaryAccentColor}
                              onChange={(e) => {
                                if (onChangePrimaryAccentColor && e.target.value.match(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$/)) {
                                  onChangePrimaryAccentColor(e.target.value);
                                }
                              }}
                              className="w-full bg-[#040814] border border-cyan-500/20 rounded px-2.5 py-1.5 text-xs text-white uppercase font-mono tracking-wider text-center"
                              placeholder="#00F2FF"
                            />
                          </div>
                        </div>
                        <div className="flex gap-1.5 mt-2.5">
                          {[
                            { name: 'Cyan', color: '#00f2ff' },
                            { name: 'Amber', color: '#fbbf24' },
                            { name: 'Emerald', color: '#10b981' },
                            { name: 'Rose', color: '#f43f5e' },
                            { name: 'Purple', color: '#a855f7' }
                          ].map((preset) => (
                            <button
                              key={preset.color}
                              type="button"
                              id={`preset-color-btn-${preset.name.toLowerCase()}`}
                              onClick={() => {
                                if (onChangePrimaryAccentColor) {
                                  onChangePrimaryAccentColor(preset.color);
                                }
                              }}
                              className="w-full text-[8.5px] font-mono py-1 rounded border border-white/5 bg-slate-900/60 hover:bg-slate-800 transition-all text-slate-300 font-bold hover:text-white cursor-pointer"
                              style={{ borderBottom: `2.5px solid ${preset.color}` }}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-rose-500/20">
                        <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                          <Trash2 className="w-4 h-4 text-rose-500 animate-pulse" />
                          Purge Mock Database (Factory Reset)
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-normal mb-3">
                          Completely delete fake student data, attendance, and log histories to start with a fresh blank environment. This clears preloaded sample students so you can register and bind hardware from scratch.
                        </p>
                        <button
                          onClick={() => {
                            if (window.confirm("CRITICAL WARNING:\n\nAre you sure you want to PURGE all simulation mockup lists, check-ins, registrations, and logs?\n\nThis will factory-reset the C-SYNC database back to fresh blank matrices, keeping only secure system developer credentials.")) {
                              db.flushDatabaseToFreshEmptyState();
                              db.addLog('SECURITY', 'Operator triggered factory reset. System environment reset.', 'success');
                              alert('Database successfully flushed to a pristine slate! Custom registrant records cleared.');
                              setStations([...db.getStations()]);
                              onRefreshAll();
                            }
                          }}
                          className="w-full bg-red-950/60 hover:bg-red-500/20 border border-red-500/25 hover:text-white text-red-400 rounded-lg py-2 uppercase text-[10px] tracking-wider transition-all font-bold cursor-pointer"
                        >
                          Flush & Delete Dummy Data
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-600 font-mono text-center leading-normal mt-4">
                    Authorized use only. Actions audited in compliance with security guidelines index log.
                  </p>
                </div>

                {/* METEOROLOGY & ACADEMIC NEWS BULLETINS SENTRY CONTROL DECK */}
                <div className="md:col-span-12 bg-[#060c1c] border border-cyan-500/15 p-6 rounded-2xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-white/5">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide font-sans">
                        <Radio className="w-5 h-5 text-[#00f2ff] animate-pulse" />
                        Meteorology & Morning bulletins telemetry overrides
                      </h3>
                      <p className="text-[11px] text-slate-500 font-sans mt-0.5">Configure live weather projections and official news broadcasts received by student PWAs.</p>
                    </div>
                    <span className="text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-mono uppercase font-black">BULLETIN BROADCASTER ENGINE</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                    {/* WEATHER TELEMETRY BOX */}
                    <div className="space-y-4 font-sans text-xs bg-slate-950/40 p-4 rounded-xl border border-white/5">
                      <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-cyan-400 flex items-center gap-1 text-left">
                        &gt; Weather station telemetry config
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4 text-left">
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase font-mono font-bold mb-1">Temperature (°C)</label>
                          <input 
                            type="number"
                            value={editTemp}
                            onChange={(e) => setEditTemp(e.target.value)}
                            className="w-full bg-[#040814] border border-cyan-500/20 rounded px-2.5 py-1.5 text-xs text-white uppercase font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase font-mono font-bold mb-1">Condition</label>
                          <input 
                            type="text"
                            value={editCondition}
                            onChange={(e) => setEditCondition(e.target.value)}
                            className="w-full bg-[#040814] border border-cyan-500/20 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase font-mono font-bold mb-1">Humidity (%)</label>
                          <input 
                            type="number"
                            value={editHumidity}
                            onChange={(e) => setEditHumidity(e.target.value)}
                            className="w-full bg-[#040814] border border-cyan-500/20 rounded px-2.5 py-1.5 text-xs text-white uppercase font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase font-mono font-bold mb-1">Wind Speed (km/h)</label>
                          <input 
                            type="number"
                            value={editWind}
                            onChange={(e) => setEditWind(e.target.value)}
                            className="w-full bg-[#040814] border border-cyan-500/20 rounded px-2.5 py-1.5 text-xs text-white uppercase font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase font-mono font-bold mb-1">UV Index</label>
                          <input 
                            type="number"
                            value={editUv}
                            onChange={(e) => setEditUv(e.target.value)}
                            className="w-full bg-[#040814] border border-cyan-500/20 rounded px-2.5 py-1.5 text-xs text-white uppercase font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase font-mono font-bold mb-1">Heatwave Risk Level</label>
                          <select
                            value={editHeatwave}
                            onChange={(e) => setEditHeatwave(e.target.value as any)}
                            className="w-full bg-[#040814] border border-cyan-500/20 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                          >
                            <option value="LOW" className="bg-[#040814]">LOW</option>
                            <option value="MODERATE" className="bg-[#040814]">MODERATE</option>
                            <option value="SEVERE" className="bg-[#040814]">SEVERE</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-[#0d1e2e]/40 border border-cyan-500/10 rounded-lg text-left">
                        <input
                          type="checkbox"
                          id="editUmbrella"
                          checked={editUmbrella}
                          onChange={(e) => setEditUmbrella(e.target.checked)}
                          className="rounded border-zinc-700 text-cyan-500 bg-slate-900 focus:ring-0"
                        />
                        <label htmlFor="editUmbrella" className="text-[10.5px] font-sans text-slate-350 cursor-pointer">
                          🌦️ Advise students to carry umbrellas (Show umbrella alert badge in PWA)
                        </label>
                      </div>

                      <div className="text-left">
                        <label className="block text-[10px] text-zinc-500 uppercase font-mono font-bold mb-1">Meteorology Alert/Advisory Text</label>
                        <textarea
                          rows={2}
                          value={editAlert}
                          onChange={(e) => setEditAlert(e.target.value)}
                          className="w-full bg-[#040814] border border-cyan-500/20 rounded px-2.5 py-1.5 text-xs text-white font-sans"
                          placeholder="E.g. Clear skies over beach. Workstations fully clear."
                        />
                      </div>

                      <button
                        onClick={() => {
                          db.setWeather({
                            temp: Number(editTemp),
                            condition: editCondition,
                            humidity: Number(editHumidity),
                            windSpeed: Number(editWind),
                            umbrellaRequired: editUmbrella,
                            alert: editAlert,
                            heatwaveRisk: editHeatwave,
                            uvIndex: Number(editUv),
                            lastUpdated: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) + ' (Operator Override)'
                          });
                          db.addLog('SYSTEM', `Meteorological telemetry revised: Temp ${editTemp}°C, ${editCondition}.`, 'success');
                          onRefreshAll();
                          alert('Sensors override successfully published to PWA meteorology deck!');
                        }}
                        className="w-full bg-cyan-950/60 hover:bg-cyan-500/20 transition-all cursor-pointer border border-cyan-500/25 hover:text-white text-cyan-300 rounded-lg py-2 uppercase text-[10.5px] tracking-wider font-bold"
                      >
                        Publish telemetry revision
                      </button>
                    </div>

                    {/* DAILY BULLETIN MORNING BRIEF BOX */}
                    <div className="space-y-4 font-sans text-xs bg-slate-950/40 p-4 rounded-xl border border-white/5">
                      <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-indigo-400 flex items-center gap-1 text-left">
                        &gt; Morning Bulletin news config
                      </h4>

                      <div className="text-left">
                        <label className="block text-[10px] text-zinc-500 uppercase font-mono font-bold mb-1">International Headlines Bulletin</label>
                        <textarea
                          rows={2}
                          value={editBriefInt}
                          onChange={(e) => setEditBriefInt(e.target.value)}
                          className="w-full bg-[#040814] border border-indigo-500/25 rounded px-2.5 py-1.5 text-xs text-white"
                          placeholder="Global technology or academic briefs..."
                        />
                      </div>

                      <div className="text-left">
                        <label className="block text-[10px] text-zinc-500 uppercase font-mono font-bold mb-1">National Headlines Bulletin</label>
                        <textarea
                          rows={2}
                          value={editBriefNat}
                          onChange={(e) => setEditBriefNat(e.target.value)}
                          className="w-full bg-[#040814] border border-indigo-500/25 rounded px-2.5 py-1.5 text-xs text-white"
                          placeholder="National academic context or technical regulations..."
                        />
                      </div>

                      <div className="text-left">
                        <label className="block text-[10px] text-zinc-500 uppercase font-mono font-bold mb-1">Regional Visakhapatnam & Varsity Bulletin</label>
                        <textarea
                          rows={2}
                          value={editBriefReg}
                          onChange={(e) => setEditBriefReg(e.target.value)}
                          className="w-full bg-[#040814] border border-indigo-500/25 rounded px-2.5 py-1.5 text-xs text-white"
                          placeholder="Andhra University exam schedules, coastal rains or warnings..."
                        />
                      </div>

                      <div className="text-left">
                        <label className="block text-[10px] text-zinc-500 uppercase font-mono font-bold mb-1">AI voice briefing summary prompt</label>
                        <input
                          type="text"
                          value={editBriefSum}
                          onChange={(e) => setEditBriefSum(e.target.value)}
                          className="w-full bg-[#040814] border border-indigo-500/25 rounded px-2.5 py-1.5 text-xs text-white"
                          placeholder="Brief spoken preview..."
                        />
                      </div>

                      <button
                        onClick={() => {
                          const oldBrief = db.getMorningBrief();
                          db.setMorningBrief({
                            id: oldBrief.id || 'brief_999',
                            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                            title: oldBrief.title || 'Vizag Weather & Sentry Daily Alert',
                            international: editBriefInt,
                            national: editBriefNat,
                            regional: editBriefReg,
                            summary: editBriefSum
                          });
                          db.addLog('SYSTEM', 'Morning broadcast telemetry revised inside Admin dispatch panel.', 'success');
                          onRefreshAll();
                          alert('Morning briefing broadcast is successfully revised & pushed to PWAs!');
                        }}
                        className="w-full bg-indigo-950/60 hover:bg-indigo-500/20 transition-all cursor-pointer border border-indigo-500/25 hover:text-white text-indigo-300 rounded-lg py-2 uppercase text-[10.5px] tracking-wider font-bold"
                      >
                        Publish bulletin revision
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: HOD SUCCESSION & MULTI-DEPARTMENT GOVERNANCE */}
            {activeAdminTab === 'succession' && (
              <div className="space-y-6 text-left animate-fadeIn">
                
                {/* 1. Multi-Department Node Status Directory Grid */}
                <div className="bg-[#060c1c] border border-cyan-500/15 p-5 rounded-2xl">
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4">&gt; GDC INSTITUTIONAL DEPARTMENT NODE DIRECTORY</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {db.getDepartments().map((dept) => {
                      const inactivity = dept.inactivityDays || 0;
                      const hasActing = !!dept.actingHODId;
                      const isInactiveWarning = inactivity >= 14;
                      return (
                        <div key={dept.id} className="p-4 bg-slate-950/80 border border-white/5 rounded-xl flex flex-col justify-between relative overflow-hidden group">
                          {isInactiveWarning && (
                            <div className="absolute top-0 right-0 bg-red-500/15 border-l border-b border-red-500/30 text-red-500 text-[8.5px] px-2 py-0.5 font-mono uppercase font-bold animate-pulse">
                              Inactivity Trigger
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-black text-white font-orbitron tracking-wide mb-1 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,242,255,0.8)]"></span>
                              {dept.name} ({dept.id})
                            </div>
                            <p className="text-[10px] text-slate-500 font-sans mb-3 border-b border-white/5 pb-1.5">Primary authority delegation node</p>
                            
                            <div className="space-y-2 text-[11px] font-sans">
                              {/* Primary Head info */}
                              <div className="flex justify-between items-center text-slate-300">
                                <span className="text-slate-500 font-mono text-[9px]">PRIMARY HOD:</span>
                                <span className="font-bold text-slate-200">{dept.activeHODName}</span>
                              </div>

                              {/* Nominated Acting Head info if present */}
                              <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded px-2 py-1 text-slate-300">
                                <span className="text-slate-500 font-mono text-[9.5px]">ACTING NOMINEE:</span>
                                <span className={hasActing ? 'text-amber-400 font-bold' : 'text-slate-500 italic'}>
                                  {hasActing ? dept.actingHODName : 'None Active'}
                                </span>
                              </div>

                              {/* Heartbeat/Inactivity tracking clock */}
                              <div className="flex justify-between items-center text-slate-300 font-sans">
                                <span className="text-slate-500 font-mono text-[9px]">INACTIVITY DETECT:</span>
                                <span className={`font-mono font-bold ${isInactiveWarning ? 'text-red-400 animate-pulse' : 'text-slate-450'}`}>
                                  {inactivity} Days ({inactivity > 0 ? 'Silent' : 'Active Heartbeat'})
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                            <button
                              onClick={() => {
                                const days = parseInt(prompt("Set simulation inactivity days for " + dept.name + ":", String(inactivity)) || "0");
                                db.updateDepartmentInactivity(dept.id, days);
                                onRefreshAll();
                              }}
                              className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded border border-white/5 py-1 text-[9.5px] uppercase tracking-wider transition-colors font-mono"
                            >
                              Sim Inactivity
                            </button>
                            {hasActing && (
                              <button
                                onClick={() => {
                                  db.revertActingHOD(dept.id);
                                  onRefreshAll();
                                }}
                                className="bg-rose-950/40 hover:bg-rose-900/40 text-rose-450 border border-rose-500/20 rounded px-2 py-1 text-[9.5px] uppercase tracking-wider transition-colors font-mono"
                              >
                                Revoke Acting
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Form & Action Module wrapper */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Forms Panel */}
                  <div className="bg-[#060c1c] border border-cyan-500/15 p-5 rounded-2xl flex flex-col justify-between text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">&gt; DELEGATION & SUCCESSION SYSTEM FORM</h3>
                        <span className="text-[8.5px] bg-[#0c2317] text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">CRYPTO SECURITY KEY</span>
                      </div>

                      {/* Succession Mode Selector buttons */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                          { mode: 'PERMANENT', color: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/15', text: 'Permanent Transition' },
                          { mode: 'TEMPORARY', color: 'border-amber-500/30 text-amber-400 bg-amber-950/15', text: 'Acting Nominee' },
                          { mode: 'EMERGENCY', color: 'border-red-500/30 text-red-500 bg-red-950/15', text: 'Emergency Force Lock' }
                        ].map(it => (
                          <button
                            key={it.mode}
                            onClick={() => {
                              setSuccMode(it.mode as any);
                              // Auto set first candidate lecturer as dummy selection if none set
                              const staff = db.getUsers().filter(u => u.role === 'Staff' && !u.isHOD);
                              if (staff.length > 0 && succCandidateId === 0) {
                                setSuccCandidateId(staff[0].id);
                              }
                            }}
                            className={`p-2 border rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                              succMode === it.mode 
                                ? 'bg-[#00f2ff]/10 border-cyan-400 text-[#00f2ff] font-bold'
                                : 'border-white/5 text-slate-400 hover:bg-white/[0.02]'
                            }`}
                          >
                            <span className="text-[10px] font-mono tracking-tight">{it.mode}</span>
                            <span className="text-[8px] text-slate-500 leading-normal mt-0.5">{it.text}</span>
                          </button>
                        ))}
                      </div>

                      <div className="space-y-3.5">
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-mono text-slate-400 font-bold block uppercase">&gt; TARGET DELEGATION DEPARTMENT:</label>
                          <select
                            value={succDeptId}
                            onChange={(e) => setSuccDeptId(e.target.value)}
                            className="w-full bg-[#030712] border border-cyan-500/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                          >
                            {db.getDepartments().map(d => (
                              <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9.5px] font-mono text-[#00f2ff] font-bold block uppercase">
                            {succMode === 'EMERGENCY' ? '🔴 LOCKED TARGET SUCCESSOR (STAFF):' : '👤 EXECUTIVE SUCCESSOR / NOMINATED LECTURER:'}
                          </label>
                          <select
                            value={succCandidateId}
                            onChange={(e) => setSuccCandidateId(parseInt(e.target.value))}
                            className="w-full bg-[#030712] border border-cyan-500/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                          >
                            <option value={0}>-- SELECT FROM REGISTERED STAFF CANDIDATES --</option>
                            {db.getUsers().filter(u => u.role === 'Staff' && !u.isHOD).map(u => (
                              <option key={u.id} value={u.id}>{u.fullName} ({u.designation || 'Lecturer'})</option>
                            ))}
                          </select>
                        </div>

                        {succMode === 'TEMPORARY' && (
                          <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                            <div className="space-y-1">
                              <label className="text-[9.5px] font-mono text-slate-400 font-bold block uppercase">&gt; ACTING NOMINEE TERM LIMIT (DAYS):</label>
                              <input
                                type="number"
                                min={1}
                                max={365}
                                value={succDuration}
                                onChange={(e) => setSuccDuration(parseInt(e.target.value) || 30)}
                                className="w-full bg-[#030712] border border-cyan-500/20 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div className="text-[9.5px] text-slate-500 font-sans flex items-center leading-relaxed">
                              Nominee assumes active HOD authority until term expiration or primary reversion.
                            </div>
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-[9.5px] font-mono text-slate-400 font-bold block uppercase">&gt; OFFICIAL DELEGATION CITATION REASON:</label>
                          <textarea
                            placeholder="Official medical leave signature, administrative succession, or HOD node key replacement"
                            required
                            value={succReason}
                            onChange={(e) => setSuccReason(e.target.value)}
                            rows={3}
                            className="w-full bg-[#030712] border border-cyan-500/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-sans leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (succCandidateId === 0) {
                          alert('Please select a valid Staff nominee to receive delegation signature authority.');
                          return;
                        }
                        if (!succReason.trim()) {
                          alert('Official citation/reason is required for this action.');
                          return;
                        }

                        // Generate cryptographic client fingerprint meta simulation data
                        const dummyDeviceSign = 'HW-LOCK-' + Math.floor(1000 + Math.random() * 9000);
                        const dummyBrowserSig = 'Platform: Win32 | Host: Chrome v125';
                        const dummyIdentityHash = 'CS-HASH-AES-' + btoa(dummyDeviceSign + '|' + succDeptId).substring(0, 10);

                        let ok = false;
                        if (succMode === 'PERMANENT') {
                          const res = db.triggerPermanentSuccession(succDeptId, succCandidateId, succReason, { 
                            deviceId: dummyDeviceSign, browserSig: dummyBrowserSig, idHash: dummyIdentityHash 
                          });
                          ok = res.success;
                        } else if (succMode === 'TEMPORARY') {
                          const res = db.triggerTemporarySuccession(succDeptId, succCandidateId, succDuration, succReason, {
                            deviceId: dummyDeviceSign, browserSig: dummyBrowserSig, idHash: dummyIdentityHash
                          });
                          ok = res.success;
                        } else if (succMode === 'EMERGENCY') {
                          const res = db.triggerEmergencySuccession(succDeptId, succCandidateId, succReason, {
                            deviceId: dummyDeviceSign, browserSig: dummyBrowserSig, idHash: dummyIdentityHash
                          });
                          ok = res.success;
                        }

                        if (ok) {
                          alert(`Succession Sequence Completed. Authority HOD node for ${succDeptId} updated in GDC ledger!`);
                          setSuccReason('');
                        } else {
                          alert('Succession transaction failed.');
                        }
                        onRefreshAll();
                      }}
                      className={`w-full text-xs font-black py-3 rounded-xl uppercase tracking-wider transition-all mt-4 font-mono shadow-md ${
                        succMode === 'EMERGENCY'
                          ? 'bg-rose-600 hover:bg-rose-500 text-slate-950 ring-2 ring-rose-500/25'
                          : succMode === 'TEMPORARY'
                            ? 'bg-amber-400 hover:bg-amber-350 text-slate-950'
                            : 'bg-cyan-400 hover:bg-cyan-350 text-[#020617]'
                      }`}
                    >
                      {succMode === 'EMERGENCY' ? '🔴 INITIATE EMERGENCY OVERRIDE & LOCKDOWN' : '🚀 LOCK SUCCESSION SIGNATURE'}
                    </button>
                  </div>

                  {/* High Quality Informational Panel */}
                  <div className="bg-[#060c1c] border border-cyan-500/15 p-5 rounded-2xl flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[#00f2ff]">
                        <Users className="w-5 h-5" />
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider">Lecturer Registry (Eligible Candidates)</h3>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        To maintain administrative continuity at **Dr. V.S. Krishna GDC (A)**, any lecturer listed below can assume delegated primary HOD authority or acting nominee states through cryptographic signoff sequences.
                      </p>

                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                        {db.getUsers().filter(u => u.role === 'Staff').map((u) => {
                          return (
                            <div key={u.id} className="p-2.5 bg-slate-950/80 border border-white/5 rounded-lg flex justify-between items-center text-[10px]">
                              <div>
                                <span className="text-white font-sans font-bold text-xs">{u.fullName}</span>
                                <span className="text-[8px] bg-slate-900 border border-cyan-500/30 px-1.5 py-0.5 rounded text-cyan-400 ml-1.5 uppercase font-mono">{u.designation || 'Lecturer'}</span>
                                <div className="text-slate-500 mt-1 font-mono uppercase text-[8px]">{u.email || u.mobileNumber}</div>
                              </div>
                              <span className={`text-[8.5px] font-mono font-bold ${u.isHOD ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {u.isHOD ? '● ACTIVE HOD' : '● NOMINATABLE'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-cyan-950/20 border border-cyan-500/10 text-cyan-400 text-[10px] leading-relaxed rounded-xl font-sans mt-3">
                      <strong>Developer Privilege Rule:</strong> Developer accounts retain temporary administrative oversight to audit GDC mainframe components and dispatch Emergency Succession overrides, but must never permanently overwrite GDC lecturer identities.
                    </div>
                  </div>

                </div>

                {/* 3. Immutable Succession Change Logs */}
                <div className="bg-[#060c1c] border border-cyan-500/15 p-5 rounded-2xl">
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4">&gt; IMMUTABLE GOVERNANCE SUCCESSION AUDIT LOGS (LEDGER REPLICA)</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-[9.5px] text-slate-400">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-500 text-[9px] uppercase">
                          <th className="pb-2">TXID</th>
                          <th className="pb-2">MODE</th>
                          <th className="pb-2">PREVIOUS HOD</th>
                          <th className="pb-2">SUCCESSOR / NOMINEE</th>
                          <th className="pb-2">CITATION REASON</th>
                          <th className="pb-2">DEVICE ANCHORS</th>
                          <th className="pb-2 text-right">TIMESTAMP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {db.getSuccessionRecords().map((rec) => {
                          const isEmerg = rec.mode === 'EMERGENCY';
                          const isTemp = rec.mode === 'TEMPORARY';
                          return (
                            <tr key={rec.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                              <td className="py-2.5 font-bold text-white">#0x0{rec.id}</td>
                              <td className="py-2.5">
                                <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[8px] ${
                                  isEmerg ? 'bg-red-950 text-red-400 border border-red-500/20' 
                                          : isTemp ? 'bg-amber-950 text-amber-500 border border-amber-500/20' 
                                                   : 'bg-cyan-950 text-cyan-400 border border-cyan-500/20'
                                }`}>
                                  {rec.mode}
                                </span>
                              </td>
                              <td className="py-2.5 font-sans font-bold text-slate-300">{rec.prevHODName}</td>
                              <td className="py-2.5 font-sans font-bold text-emerald-400">{rec.successorName}</td>
                              <td className="py-2.5 max-w-xs truncate text-slate-300" title={rec.reason}>{rec.reason}</td>
                              <td className="py-2.5">
                                <span className="text-[8.5px] text-slate-500 block truncate max-w-[130px]">{rec.browser_signature}</span>
                                <span className="text-[7.5px] text-cyan-400 block mt-0.5">{rec.identity_hash}</span>
                              </td>
                              <td className="py-2.5 text-right text-slate-500">{(rec.timestamp || '').replace('T', ' ').slice(0, 19)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {activeAdminTab === 'devdeck' && (
              <div className="animate-fadeIn">
                <DevDeckCtrl 
                  db={db} 
                  onRefreshAll={onRefreshAll} 
                  nightOps={nightOps} 
                  setNightOps={setNightOps} 
                  onDeveloperSimulated={() => {
                    // Update all parent state indicators automatically
                    setStations(db.getStations());
                    setLogs(db.getLogs());
                    setAllUsers(db.getUsers());
                    setHolidays(db.getHolidays());
                    setPanicAlerts(db.getPanicAlerts());
                  }}
                />
              </div>
            )}

            {activeAdminTab === 'gaming' && (
              <div className="animate-fadeIn">
                <GamificationEngine 
                  db={db} 
                  onRefreshAll={() => {
                    setAllUsers([...db.getUsers()]);
                    onRefreshAll();
                  }} 
                />
              </div>
            )}

            {activeAdminTab === 'virtualid' && (
              <div className="animate-fadeIn">
                <VirtualIdHub 
                  db={db} 
                  onRefreshAll={() => {
                    setAllUsers([...db.getUsers()]);
                    onRefreshAll();
                  }} 
                />
              </div>
            )}

            {activeAdminTab === 'campusar' && (
              <div className="animate-fadeIn">
                <CampusArTwin 
                  db={db}
                />
              </div>
            )}

            {activeAdminTab === 'cyberwar' && (
              <div className="animate-fadeIn">
                <CyberSentryWarRoom 
                  db={db}
                  onRefreshAll={() => {
                    setAllUsers([...db.getUsers()]);
                    onRefreshAll();
                  }}
                />
              </div>
            )}

            {activeAdminTab === 'live-classes' && (
              <div className="animate-fadeIn">
                <div className="bg-[#0b1329] border border-cyan-500/20 p-3.5 rounded-xl flex items-center justify-between mb-4 text-left">
                  <div className="flex items-center gap-2.5">
                    <Video className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-cyan-400">CLASSROOM HOST CREDENTIALS BOUND</span>
                      <p className="text-xs font-bold text-white">{activeDelegatedStaff.fullName} ({activeDelegatedStaff.designation || 'Lecturer'})</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-cyan-950 text-cyan-400 font-mono px-2 py-0.5 border border-cyan-500/30 rounded uppercase">LOBBY HOST STATUS: ACTIVE</span>
                </div>
                <LiveClassesHub 
                  db={db}
                  onRefreshAll={onRefreshAll}
                  overrideCurrentUser={activeDelegatedStaff}
                />
              </div>
            )}

            {activeAdminTab === 'broadcast' && (
              <div className="animate-fadeIn">
                <div className="bg-[#0b1329] border border-indigo-500/20 p-3.5 rounded-xl flex items-center justify-between mb-4 text-left">
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-indigo-400">OFFICIAL ANNOUNCEMENT AUTHORIZED SIGNATORY</span>
                      <p className="text-xs font-bold text-white">{activeDelegatedStaff.fullName} ({activeDelegatedStaff.designation || 'Lecturer'})</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-indigo-950 text-indigo-400 font-mono px-2 py-0.5 border border-indigo-500/30 rounded uppercase">BROADCAST NODE: GATEWAY 3</span>
                </div>
                <BroadcastBoard 
                  db={db}
                  onRefreshAll={onRefreshAll}
                  overrideCurrentUser={activeDelegatedStaff}
                />
              </div>
            )}

            {activeAdminTab === 'device-requests' && (
              <div className="animate-fadeIn space-y-6 text-left">
                <div className="bg-[#050b1c] rounded-xl border border-amber-500/15 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase font-orbitron">
                      <Smartphone className="w-4 h-4 text-amber-400" />
                      Biometric Device Reset Authorization Desk
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans leading-normal">
                      Students Switching Phones or Browsers trigger an automated security restriction under standard UGC guidelines. Approved requests update the hardware signature registration immediately, restoring full virtual access.
                    </p>
                  </div>
                  <div className="bg-amber-950/20 px-3.5 py-1.5 rounded-lg border border-amber-500/20 text-center shrink-0">
                    <span className="block text-[10px] text-zinc-500 uppercase font-mono font-bold font-sans">Pending Queue</span>
                    <span className="text-xl font-black text-amber-400 font-mono">
                      {db.getDeviceChangeRequests().filter(r => r.status === 'PENDING').length}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 font-sans">
                  {db.getDeviceChangeRequests().length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
                      <Smartphone className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-slate-400 text-xs font-sans">No device change requests found in the C-Sync database.</p>
                    </div>
                  ) : (
                    db.getDeviceChangeRequests().map((req) => {
                      const isPending = req.status === 'PENDING';
                      return (
                        <div 
                          key={req.id} 
                          className={`p-5 rounded-xl border transition-all ${
                            isPending 
                              ? 'bg-[#0a0f1d] border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.02)]' 
                              : req.status === 'APPROVED'
                              ? 'bg-[#030d0d] border-emerald-500/15'
                              : 'bg-rose-950/5 border-rose-500/10 opacity-70'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-3 mb-3.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">{req.userName}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-mono font-bold ${
                                  req.userRole === 'Student' || req.userRole.includes('Student')
                                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/20'
                                    : 'bg-purple-950 text-purple-300 border border-purple-500/20'
                                }`}>
                                  {req.userRole}
                                </span>
                                {req.userEmail && <span className="text-slate-400 text-xs font-sans">&lt;{req.userEmail}&gt;</span>}
                              </div>
                              <p className="text-[10px] text-slate-500 font-mono mt-1">
                                REQUEST ID: <strong className="text-slate-300">{req.id}</strong> • SUBMITTED: {new Date(req.timestamp).toLocaleString()}
                              </p>
                            </div>

                            <div>
                              <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${
                                isPending 
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' 
                                  : req.status === 'APPROVED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {req.status}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                            <div className="space-y-2.5 font-mono bg-black/40 p-3 rounded-lg border border-white/5">
                              <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Fingerprint Exchange Ledger</div>
                              <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                                <div className="text-zinc-500 font-sans">CURRENT BOUND FP:</div>
                                <div className="text-rose-400 truncate" title={req.currentDeviceId}>{req.currentDeviceId}</div>
                                
                                <div className="text-zinc-500 font-sans">REQUESTED FP:</div>
                                <div className="text-cyan-400 font-bold truncate" title={req.requestedDeviceId}>{req.requestedDeviceId}</div>

                                <div className="text-zinc-500 font-sans">BROWSER SIGNATURE:</div>
                                <div className="text-slate-300 truncate text-[9.5px]" title={req.requestedBrowserSignature}>{req.requestedBrowserSignature}</div>
                              </div>
                            </div>

                            <div className="space-y-2 flex flex-col justify-between">
                              <div className="bg-[#0f1424]/40 p-3 rounded-lg border border-white/5 flex-1">
                                <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1 font-mono">Stated Reason</div>
                                <p className="italic text-slate-300 leading-relaxed text-[11px] font-sans">"{req.reason}"</p>
                              </div>

                              {isPending && (
                                <div className="flex gap-2.5 mt-2.5">
                                  <button
                                    onClick={() => {
                                      db.rejectDeviceChangeRequest(req.id, 'thrinadh_sys');
                                      onRefreshAll();
                                    }}
                                    className="flex-1 py-1.5 bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-300 hover:text-white font-bold text-[10.5px] uppercase tracking-wider font-mono rounded-lg transition-all cursor-pointer"
                                  >
                                    Deny Reset
                                  </button>
                                  <button
                                    onClick={() => {
                                      db.approveDeviceChangeRequest(req.id, 'thrinadh_sys');
                                      onRefreshAll();
                                    }}
                                    className="flex-1 py-1.5 bg-[#0a5c4e]/70 hover:bg-[#074b3f] border border-emerald-500/40 text-emerald-300 hover:text-white font-bold text-[10.5px] uppercase tracking-wider font-mono rounded-lg transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] cursor-pointer"
                                  >
                                    Approve Reset
                                  </button>
                                </div>
                              )}

                              {!isPending && (
                                <div className="text-[10.5px] font-mono text-zinc-500 mt-2 text-right">
                                  Reviewed by <strong className="text-white font-sans">{req.reviewedBy}</strong> {req.reviewedAt && `at ${new Date(req.reviewedAt).toLocaleString()}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeAdminTab === 'messenger' && (
              <div className="animate-fadeIn w-full">
                <div className="bg-[#0b1329] border border-rose-500/20 p-3.5 rounded-xl flex items-center justify-between mb-4 text-left">
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-5 h-5 text-rose-400 animate-pulse" />
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-rose-400">NETMESSENGER KEY SIGNATURE BOUND</span>
                      <p className="text-xs font-bold text-white">{activeDelegatedStaff.fullName} ({activeDelegatedStaff.designation || 'Lecturer'})</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-rose-950 text-rose-400 font-mono px-2 py-0.5 border border-rose-500/30 rounded uppercase">NET KEY: VERIFIED</span>
                </div>
                <CsyncTelegramNet 
                  db={db}
                  onRefreshAll={onRefreshAll}
                  overrideCurrentUser={activeDelegatedStaff}
                />
              </div>
            )}

            {false && (() => {
              // Calculate system-wide liquidity & reserves
              const allSystemUsers = db.getUsers();
              const systemReserves = allSystemUsers.reduce((sum, u) => sum + (u.walletBalance || 0), 0);
              const txList = db.getBankTransactions() || [];
              const totalTxCount = txList.length;
              const originalUpiUsersCount = allSystemUsers.filter(u => u.upiId && !u.upiId.endsWith('@paycsync') && u.upiId !== `${u.mobileNumber}@yes`).length;

              // Find selected user for ledger adjustment
              const selectedUser = allSystemUsers.find(u => u.id === Number(selectedAdjUserId)) || null;

              // Filter transactions history
              const filteredTx = txList.filter(tx => {
                const query = txSearch.toLowerCase().trim();
                const matchesSearch = !query || 
                  tx.id.toLowerCase().includes(query) ||
                  tx.senderName.toLowerCase().includes(query) ||
                  (tx.receiverName && tx.receiverName.toLowerCase().includes(query)) ||
                  (tx.referenceId && tx.referenceId.toLowerCase().includes(query)) ||
                  (tx.description && tx.description.toLowerCase().includes(query));

                const matchesType = txTypeFilter === 'ALL' || 
                  (txTypeFilter === 'DEPOSIT' && tx.type === 'DEPOSIT') ||
                  (txTypeFilter === 'WITHDRAW' && tx.type === 'WITHDRAW') ||
                  (txTypeFilter === 'TRANSFER' && tx.type.startsWith('TRANSFER')) ||
                  (txTypeFilter === 'UPI' && (tx.type.startsWith('UPI') || tx.upiPayload));

                return matchesSearch && matchesType;
              });

              // Apply ledger manipulation with secure real UPI QR/Link generation
              const handleExecuteAdjustment = () => {
                if (!selectedAdjUserId) {
                  alert('Please select a target User Profile node.');
                  return;
                }
                const amt = parseFloat(adjustAmount);
                if (isNaN(amt) || amt <= 0) {
                  alert('Please enter a valid non-zero transaction amount.');
                  return;
                }

                const targetUserObj = allSystemUsers.find(u => u.id === Number(selectedAdjUserId));
                if (!targetUserObj) {
                  alert('Target User profile could not be verified on C-SYNC.');
                  return;
                }

                if (adjustType === 'CREDIT') {
                  // Deposit: Money goes TO real upi address db.getMotherUpi() (C-SYNC Reserves)
                  const targetUpiId = db.getMotherUpi();
                  const upiUrl = `upi://pay?pa=${targetUpiId}&pn=${encodeURIComponent('C-SYNC Master Reserves')}&am=${amt}&cu=INR&tn=${encodeURIComponent(adjustPurpose)}`;
                  
                  setActiveUpiDispatch({
                    type: 'DEPOSIT',
                    amount: amt,
                    purpose: adjustPurpose,
                    targetUser: targetUserObj,
                    targetUpiUrl: upiUrl,
                    targetUpiId
                  });
                  playVoice(`Preparing secure deposit QR to master reserves.`);
                  playHaptic('tap');
                } else {
                  // Debit: Taken from db.getMotherUpi() to the student's personal real UPI address
                  const studentUpiId = targetUserObj.upiId || (targetUserObj.mobileNumber ? `${targetUserObj.mobileNumber.replace(/[^0-9]/g, '')}@yes` : db.getMotherUpi());
                  const upiUrl = `upi://pay?pa=${studentUpiId}&pn=${encodeURIComponent(targetUserObj.fullName)}&am=${amt}&cu=INR&tn=${encodeURIComponent(adjustPurpose)}`;
                  
                  // Check if they have enough balance locally for visual warning, but allow them to proceed to step
                  const currentBalance = targetUserObj.walletBalance || 0;
                  if (currentBalance < amt) {
                    if (!confirm(`Warning: Target user balance (₹${currentBalance}) is less than debit request. This will result in an overdraft. Proceed to UPI dispatch?`)) {
                      return;
                    }
                  }

                  setActiveUpiDispatch({
                    type: 'DEBIT',
                    amount: amt,
                    purpose: adjustPurpose,
                    targetUser: targetUserObj,
                    targetUpiUrl: upiUrl,
                    targetUpiId: studentUpiId
                  });
                  playVoice(`Preparing secure debit payout dispatch to target user ${targetUserObj.fullName}.`);
                  playHaptic('tap');
                }
              };

              const handleToggleFreeze = (uid: number) => {
                if (frozenUserIds.includes(uid)) {
                  setFrozenUserIds(prev => prev.filter(id => id !== uid));
                  playVoice("Account restriction removed successfully.");
                } else {
                  setFrozenUserIds(prev => [...prev, uid]);
                  playVoice("Warning. Account status restricted. Transaction dispatch window locked.");
                }
                playHaptic('warning');
              };

              const handleOverwriteUpi = (uid: number) => {
                if (editUpiUserId === uid) {
                  // Save
                  const ok = db.updateUserProfile(uid, { upiId: editUpiValue });
                  if (ok) {
                    playVoice("Original UPI handle mapped successfully.");
                    setEditUpiUserId(null);
                    onRefreshAll();
                    setAllUsers(db.getUsers());
                  } else {
                    alert("Error updating UPI.");
                  }
                } else {
                  const targetU = allSystemUsers.find(u => u.id === uid);
                  setEditUpiUserId(uid);
                  setEditUpiValue(targetU?.upiId || '');
                }
              };

              return (
                <div className="animate-fadeIn text-left w-full space-y-6">
                  {/* METRICS ROW (CYBERPUNK GLOW) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#050b1c]/80 border border-cyan-500/25 rounded-2xl p-4.5 relative overflow-hidden group hover:border-[#00f2ff]/50 transition-all shadow-[0_0_15px_rgba(0,242,255,0.02)]">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl"></div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono font-black text-cyan-400 tracking-wider uppercase">SYSTEM CURRENCY RESERVES</span>
                        <Coins className="w-5 h-5 text-cyan-400 animate-pulse" />
                      </div>
                      <div className="text-2xl font-black text-white font-mono tracking-tight">
                        ₹{systemReserves.toLocaleString('en-IN')}
                      </div>
                      <p className="text-[8.5px] text-slate-400 font-sans mt-1.5 uppercase leading-none">
                        Backed by Sovereign Institution
                      </p>
                      <div className="mt-3.5 h-[3px] bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
                      </div>
                    </div>

                    <div className="bg-[#050b1c]/80 border border-pink-500/25 rounded-2xl p-4.5 relative overflow-hidden group hover:border-pink-400/50 transition-all shadow-[0_0_15px_rgba(236,72,153,0.02)]">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl"></div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono font-black text-pink-400 tracking-wider uppercase">HISTORIC LEDGER TRANSACTIONS</span>
                        <TrendingUp className="w-5 h-5 text-pink-400" />
                      </div>
                      <div className="text-2xl font-black text-white font-mono tracking-tight">
                        {totalTxCount} <span className="text-xs text-slate-500 font-bold uppercase font-sans">Blocks</span>
                      </div>
                      <p className="text-[8.5px] text-slate-400 font-sans mt-1.5 uppercase leading-none">
                        All transaction journals audited
                      </p>
                      <div className="mt-3.5 h-[3px] bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-1000" style={{ width: '68%' }}></div>
                      </div>
                    </div>

                    <div className="bg-[#050b1c]/80 border border-indigo-500/25 rounded-2xl p-4.5 relative overflow-hidden group hover:border-indigo-400/50 transition-all shadow-[0_0_15px_rgba(99,102,241,0.02)]">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono font-black text-indigo-400 tracking-wider uppercase">ORIGINAL UPI GATEWAYS</span>
                        <Landmark className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="text-2xl font-black text-white font-mono tracking-tight">
                        {originalUpiUsersCount} <span className="text-xs text-slate-500 font-bold uppercase font-sans">Nodes</span>
                      </div>
                      <p className="text-[8.5px] text-slate-400 font-sans mt-1.5 uppercase leading-none">
                        Active bank handles linked
                      </p>
                      <div className="mt-3.5 h-[3px] bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (originalUpiUsersCount/Math.max(1, allSystemUsers.length))*100)}%` }}></div>
                      </div>
                    </div>

                    <div className="bg-[#050b1c]/80 border border-emerald-500/25 rounded-2xl p-4.5 relative overflow-hidden group hover:border-emerald-400/50 transition-all shadow-[0_0_15px_rgba(16,185,129,0.02)]">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl"></div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono font-black text-emerald-400 tracking-wider uppercase">ROUTER SETTLEMENT NODE</span>
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      </div>
                      <div className="text-1.5xl font-extrabold text-white font-orbitron tracking-widest uppercase">
                        ONLINE
                      </div>
                      <p className="text-[8.5px] text-slate-400 font-sans mt-1.5 uppercase leading-none">
                        Clearing latency: <b className="text-emerald-400 font-mono">1.2ms</b>
                      </p>
                      <div className="mt-4 h-[3px] bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* MASTER LEDGER ADJUSTMENT DECK */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT PANEL: ADJUSTMENT CONTROLLER */}
                    <div className="lg:col-span-7 bg-[#030712]/90 border border-white/5 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <h3 className="font-orbitron font-extrabold text-[#00f2ff] text-xs uppercase tracking-wider flex items-center gap-2">
                          <Coins className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                          Master Ledger Adjustment Desk (Staff Tool)
                        </h3>
                        <span className="text-[8px] bg-cyan-950 font-mono text-cyan-400 px-2 py-0.5 border border-cyan-500/30 rounded font-bold uppercase">
                          DUAL SECURE
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Target Node Selector */}
                        <div className="space-y-1 text-left">
                          <label className="block text-[8.5px] text-slate-400 font-mono uppercase font-bold">Target User Node *</label>
                          <select
                            value={selectedAdjUserId}
                            onChange={(e) => {
                              setSelectedAdjUserId(e.target.value ? Number(e.target.value) : '');
                              const userObj = allSystemUsers.find(u => u.id === Number(e.target.value));
                              if (userObj) {
                                playVoice(`Node matched: ${userObj.fullName}. Current balance Rupees ${userObj.walletBalance || 0}.`);
                              }
                            }}
                            className="w-full bg-[#050b18] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                          >
                            <option value="">-- SELECT TARGET NODE --</option>
                            {allSystemUsers.map(u => (
                              <option key={u.id} value={u.id}>
                                {u.fullName} [{u.role}] (₹{u.walletBalance || 0}) {u.upiId ? ` - ${u.upiId}` : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Transaction Direction Type */}
                        <div className="space-y-1 text-left">
                          <label className="block text-[8.5px] text-slate-400 font-mono uppercase font-bold">Operation Delta *</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => { setAdjustType('CREDIT'); playHaptic('light'); }}
                              className={`py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                                adjustType === 'CREDIT'
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                                  : 'bg-transparent border-white/5 text-slate-400 hover:text-slate-350'
                              }`}
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              CREDIT (INJECT)
                            </button>
                            <button
                              type="button"
                              onClick={() => { setAdjustType('DEBIT'); playHaptic('light'); }}
                              className={`py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                                adjustType === 'DEBIT'
                                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.1)]'
                                  : 'bg-transparent border-white/5 text-slate-400 hover:text-slate-350'
                              }`}
                            >
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                              DEBIT (EXTRACT)
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Override Limit Amount */}
                        <div className="space-y-1 text-left">
                          <label className="block text-[8.5px] text-slate-400 font-mono uppercase font-bold">Delta Amount (INR) *</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-black">₹</span>
                            <input
                              type="number"
                              value={adjustAmount}
                              onChange={(e) => setAdjustAmount(e.target.value)}
                              placeholder="e.g. 1500"
                              className="w-full bg-[#050b18] border border-white/10 rounded-lg pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono font-bold"
                            />
                          </div>
                          {/* Presets */}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {['100', '500', '1000', '5000', '10000'].map(val => (
                              <button
                                type="button"
                                key={val}
                                onClick={() => { setAdjustAmount(val); playHaptic('tap'); }}
                                className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded text-[8.5px] text-slate-400 font-mono transition-all active:scale-95"
                              >
                                +₹{parseInt(val).toLocaleString()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Purpose Log override */}
                        <div className="space-y-1 text-left">
                          <label className="block text-[8.5px] text-slate-400 font-mono uppercase font-bold">Audit Purpose Log Override *</label>
                          <input
                            type="text"
                            value={adjustPurpose}
                            onChange={(e) => setAdjustPurpose(e.target.value)}
                            placeholder="e.g. Sovereign Work Stipend"
                            className="w-full bg-[#050b18] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {[
                              'Sovereign Work Stipend', 
                              'Canteen Work Stipend', 
                              'Lab Equipment Penalty', 
                              'Excellence Grant', 
                              'Compliance Adjustment'
                            ].map(lbl => (
                              <button
                                type="button"
                                key={lbl}
                                onClick={() => { setAdjustPurpose(lbl); playHaptic('light'); }}
                                className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded text-[7.5px] max-w-[124px] truncate text-slate-400 transition-all active:scale-95 animate-none"
                                title={lbl}
                              >
                                {lbl}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Warnings and compliance confirmation */}
                      <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15 flex gap-2.5 text-left">
                        <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="block text-[8.5px] font-mono tracking-wider font-bold text-amber-300 uppercase">LEDGER INTEGRITY PROTOCOL LOCKED</span>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                            Staff adjustments trigger automatic state broadcasts. These will directly update the target user wallet, reflecting immediately in both client app and system logs. All operations are logged permanently.
                          </p>
                        </div>
                      </div>

                      {/* Dispatch Action */}
                      <button
                        type="button"
                        onClick={handleExecuteAdjustment}
                        className={`w-full py-3 rounded-xl font-mono text-xs font-bold tracking-widest transition-all uppercase flex items-center justify-center gap-2 border ${
                          adjustType === 'CREDIT'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 border-emerald-400/30'
                            : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-slate-950 border-rose-455/30'
                        } cursor-pointer active:scale-[0.98] shadow-md`}
                      >
                        <Coins className="w-4 h-4 animate-spin" />
                        EMBRACE MASTER ADJUSTMENT ({adjustType === 'CREDIT' ? 'CREDIT' : 'DEBIT'})
                      </button>
                    </div>

                    {/* RIGHT PANEL: SELECTED TARGET SPECS & CONTROL */}
                    <div className="lg:col-span-5 bg-[#030712]/90 border border-white/5 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <h3 className="font-orbitron font-extrabold text-[#00f2ff] text-xs uppercase tracking-wider flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-purple-400" />
                          Master Node Specs & Core Override
                        </h3>
                        {selectedUser && (
                          <span className="text-[8px] bg-red-950 font-mono text-red-400 px-1.5 py-0.2 border border-red-500/30 rounded font-black">
                            NODE #{selectedUser.id}
                          </span>
                        )}
                      </div>

                      {selectedUser ? (
                        <div className="space-y-4 text-left">
                          {/* User Brief Card */}
                          <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-white/5">
                            <img
                              src={selectedUser.photoBlob || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120"}
                              alt={selectedUser.fullName}
                              className="w-11 h-11 rounded-xl object-cover border border-[#00f2ff]/30 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-white truncate">{selectedUser.fullName}</h4>
                              <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide">
                                {selectedUser.role} // ID: {selectedUser.idNumber}
                              </p>
                              <div className="mt-1 flex items-center gap-1 font-mono text-[8px]">
                                <span className="text-slate-500">TRUST SCORE:</span>
                                <span className="font-black text-emerald-400">{selectedUser.trust_score || 95}/100</span>
                              </div>
                            </div>
                          </div>

                          {/* Technical Network Specs */}
                          <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5 space-y-1.5 text-[10px] font-mono leading-none">
                            <div className="flex justify-between items-center py-1 border-b border-white/5">
                              <span className="text-slate-400">MOBILE NUMBER</span>
                              <span className="font-bold text-slate-200">{selectedUser.mobileNumber || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-white/5">
                              <span className="text-slate-400">FINGERPRINT DEVICE ID</span>
                              <span className="font-mono text-slate-400 text-[8px] truncate max-w-[120px]" title={selectedUser.device_id || 'Not verified'}>
                                {selectedUser.device_id || 'PENDING ANCHOR'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span className="text-slate-400">ACCESS LEVEL Privilege</span>
                              <span className="font-bold px-1 rounded text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                                APPROVED SYSTEM ACCESS
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-[210px] flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl text-center p-6 text-slate-500">
                          <Landmark className="w-10 h-10 text-slate-600 mb-2.5 animate-pulse" />
                          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Node Specification Stream Stopped</span>
                          <p className="text-[9.5px] leading-relaxed max-w-xs mt-1 font-sans">
                            Select an active User Node from the dropdown list to pull up their real-time device signature, trust index, and access privileges.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* REAL-TIME CRYPTOGRAPHIC TRANSACTION AUDIT LEDGER */}
                  <div className="bg-[#030712]/90 border border-white/5 rounded-2xl p-5 space-y-4 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-3 gap-3">
                      <div className="space-y-0.5">
                        <h3 className="font-orbitron font-extrabold text-[#00f2ff] text-xs uppercase tracking-wider flex items-center gap-2">
                          <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />
                          Sovereign Audit Ledger Interceptor
                        </h3>
                        <p className="text-[9px] text-slate-500 font-sans uppercase">Permanently tracing dual-tier UPI payloads across physical student terminals</p>
                      </div>

                      {/* Filter Stream Tools */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 w-3 h-3 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Filter Ledger records..."
                            value={txSearch}
                            onChange={(e) => setTxSearch(e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-[10.5px] text-white focus:outline-none focus:border-cyan-400 font-sans w-44"
                          />
                        </div>

                        <select
                          value={txTypeFilter}
                          onChange={(e) => setTxTypeFilter(e.target.value)}
                          className="bg-slate-950 border border-white/10 rounded-lg px-2 py-1.5 text-[10.5px] text-slate-300 focus:outline-none focus:border-cyan-400 font-mono"
                        >
                          <option value="ALL">ALL TYPES</option>
                          <option value="DEPOSIT">DEPOSITS</option>
                          <option value="WITHDRAW">WITHDRAWALS</option>
                          <option value="TRANSFER">TRANSFERS</option>
                          <option value="UPI">UPI LINKS</option>
                        </select>
                      </div>
                    </div>

                    {filteredTx.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 border border-dashed border-white/5 rounded-xl">
                        <Coins className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                        <p className="text-[10px] uppercase font-mono font-bold text-slate-300">Zero Ledger Audit Sequences Met</p>
                        <p className="text-[9.5px] text-slate-500 leading-normal max-w-sm mx-auto mt-1 font-sans">
                          No transactions match the typed criteria. Use the adjustment controller above to inject currency blocks and update live states.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                            <tr className="border-b border-white/5 text-[8.5px] text-slate-400 uppercase font-mono tracking-wider">
                              <th className="py-2.5 px-3">Transaction ID / Rf</th>
                              <th className="py-2.5 px-3">Sender / Recipient</th>
                              <th className="py-2.5 px-3 text-right">Amount</th>
                              <th className="py-2.5 px-3">Type</th>
                              <th className="py-2.5 px-3">Timestamp</th>
                              <th className="py-2.5 px-3">Status</th>
                              <th className="py-2.5 px-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-[11px] font-mono">
                            {filteredTx.map(tx => {
                              const isExpanded = selectedTraceTxId === tx.id;
                              const isUpiType = tx.type.startsWith('UPI') || !!tx.upiPayload;
                              const typeColor = tx.type === 'DEPOSIT' 
                                ? 'text-emerald-400 bg-emerald-950/35 border border-emerald-500/20' 
                                : tx.type === 'WITHDRAW'
                                ? 'text-rose-400 bg-rose-950/35 border border-rose-500/20'
                                : isUpiType
                                ? 'text-[#ff2a85] bg-pink-950/35 border border-pink-500/20'
                                : 'text-amber-400 bg-amber-950/35 border border-amber-500/20';

                              // Find associated user object for device metadata lookup
                              const senderObj = allSystemUsers.find(u => u.id === tx.senderId);

                              return (
                                <React.Fragment key={tx.id}>
                                  <tr className="hover:bg-white/2 transition-colors">
                                    <td className="py-3 px-3 font-bold text-slate-300">
                                      {tx.id}
                                      <span className="block text-[7.5px] text-slate-500 font-normal mt-0.5 tracking-tight">Ref: {tx.referenceId}</span>
                                    </td>
                                    <td className="py-3 px-3">
                                      <div className="font-sans text-xs font-semibold text-white">{tx.senderName}</div>
                                      {tx.receiverName && (
                                        <div className="text-[9.5px] text-slate-400 font-sans mt-0.5 flex items-center gap-1">
                                          <span>→</span> <span>{tx.receiverName}</span>
                                          {tx.upiPayload?.vpa && <span className="text-pink-400 font-mono text-[8px]">[{tx.upiPayload.vpa}]</span>}
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-3 px-3 text-right font-black text-white">
                                      ₹{tx.amount.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-3">
                                      <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase font-sans ${typeColor}`}>
                                        {tx.type}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 text-[10px] text-slate-400">
                                      {tx.timestamp}
                                    </td>
                                    <td className="py-3 px-3 text-[10px]">
                                      <span className={`font-extrabold px-1 text-[8.2px] hover:scale-105 transition-all ${
                                        tx.status === 'SUCCESS' ? 'text-emerald-400' 
                                        : tx.status === 'RECONCILED' ? 'text-cyan-400' 
                                        : 'text-amber-300'
                                      }`}>
                                        ● {tx.status}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 text-right space-x-1.5">
                                      {tx.status !== 'RECONCILED' && (
                                        <button
                                          onClick={() => {
                                            const res = db.forceReconcileTransaction(tx.id);
                                            if (res.success) {
                                              playVoice("Reconciliation code synchronized.");
                                              onRefreshAll();
                                              setAllUsers(db.getUsers());
                                            }
                                          }}
                                          className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 rounded font-mono text-[8.5px] font-bold tracking-wide transition-all active:scale-95 cursor-pointer"
                                        >
                                          RECONCILE
                                        </button>
                                      )}
                                      <button
                                        onClick={() => {
                                          setSelectedTraceTxId(isExpanded ? null : tx.id);
                                          playHaptic('light');
                                        }}
                                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 rounded font-mono text-[8.5px] font-bold uppercase transition-all active:scale-95 cursor-pointer"
                                      >
                                        {isExpanded ? 'COLD CLOSE' : 'IP TRACE'}
                                      </button>
                                    </td>
                                  </tr>

                                  {/* EXPANDED DEVICE METADATA IP TRACE VIEW */}
                                  {isExpanded && (
                                    <tr>
                                      <td colSpan={7} className="bg-slate-950/95 p-4 border border-[#ff2a85]/20 rounded-xl relative">
                                        <div className="absolute top-0 right-0 w-32 h-20 bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                          {/* Sender terminal details */}
                                          <div className="space-y-1.5 text-left border-r border-white/5 pr-4">
                                            <span className="block text-[8px] font-mono font-black text-pink-400 tracking-wider uppercase">SENDER ENVIRONMENT METRICS</span>
                                            <div className="space-y-0.5 text-[10px] font-sans">
                                              <p className="text-slate-200 truncate"><b className="text-slate-500 font-mono text-[9px] uppercase">USER AGENT:</b> {senderObj?.user_agent || tx.description || 'Mozilla/5.0'}</p>
                                              <p className="text-slate-200"><b className="text-slate-500 font-mono text-[9px] uppercase">PLATFORM:</b> {senderObj?.platform || 'Win32 (x64_86)'}</p>
                                              <p className="text-slate-200"><b className="text-slate-500 font-mono text-[9px] uppercase">TIMEZONE:</b> {senderObj?.timezone || 'Asia/Kolkata (UTC+5:30)'}</p>
                                              <p className="text-slate-200"><b className="text-slate-500 font-mono text-[9px] uppercase">SCREEN RES:</b> {senderObj?.screen_resolution || '1920x1080px'}</p>
                                            </div>
                                          </div>

                                          {/* Cryptographic Hash checks */}
                                          <div className="space-y-1.5 text-left border-r border-white/5 pr-4">
                                            <span className="block text-[8px] font-mono font-black text-[#ff2a85] tracking-wider uppercase">LEDGER CIPHER COMPLIANCE</span>
                                            <div className="space-y-1 text-[10px] font-mono leading-tight">
                                              <p className="text-slate-350 truncate"><b className="text-slate-500 uppercase">IDENT HASH:</b> {senderObj?.identity_hash || 'SHA256::' + Math.random().toString(36).substring(4, 12).toUpperCase()}</p>
                                              <p className="text-slate-350 truncate"><b className="text-slate-500 uppercase">MAC TOKEN:</b> {senderObj?.device_id || 'F4:8E:38:AA:BC:0F'}</p>
                                              <p className="text-slate-350"><b className="text-slate-500 uppercase">AUTHENTICITY:</b> <span className="text-emerald-400 tracking-wider uppercase">LEDGER SEAL VERIFIED</span></p>
                                            </div>
                                          </div>

                                          {/* Geo location specs and note log */}
                                          <div className="space-y-1.5 text-left">
                                            <span className="block text-[8px] font-mono font-black text-indigo-400 tracking-wider uppercase">NETWORK OPERATION LOG</span>
                                            <div className="text-[10px] font-sans text-slate-300 bg-black/40 p-2.5 rounded border border-white/5">
                                              <p className="italic text-slate-400">"{tx.description || 'Scan & Pay network dispatch trace completed'}"</p>
                                              <div className="mt-2 text-[8px] font-mono text-slate-500 uppercase flex justify-between">
                                                <span>REF ID: {tx.referenceId}</span>
                                                <span className="text-indigo-400">IP LOCATED: CSYNC CORE SUBNET</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {activeAdminTab === 'rolesim' && (
              <div className="animate-fadeIn text-left w-full space-y-6">
                <div className="bg-[#050b1c] rounded-xl border border-pink-500/20 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase font-orbitron">
                      <Smartphone className="w-5 h-5 text-pink-400 animate-pulse" />
                      C-SYNC Sentry Role Emulation & Sandbox Deck
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans leading-normal">
                      The Role Live Sandbox enables real-time emulation of all C-SYNC security roles. Admins can simulate card swipes, set mock geofence coordinates, trigger active panic distress beacons, and preview specific student / lecturer viewport displays inside an interactive mockup frame.
                    </p>
                  </div>
                  <div className="shrink-0 flex gap-2">
                    <button
                      onClick={() => {
                        const count = db.getUsers().length;
                        onRefreshAll();
                        if (window.speechSynthesis) {
                          window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Sandbox telemetry synchronized. Audited ${count} virtual systems.`));
                        }
                      }}
                      className="px-3.5 py-1.5 bg-pink-950/20 border border-pink-500/30 rounded-xl hover:bg-pink-500/10 text-pink-400 text-xs font-bold font-mono transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                      Sync Telemetry
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT PANEL: IDENTITY SELECTOR LIST */}
                  <div className="lg:col-span-5 bg-slate-950/90 border border-white/5 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                      <h4 className="font-orbitron font-extrabold text-[#00f2ff] text-[11px] uppercase tracking-wider">
                        Virtual Identities Directory
                      </h4>
                      <span className="text-[9px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">
                        {allUsers.length} Nodes Loaded
                      </span>
                    </div>

                    <div className="space-y-2.5 overflow-y-auto max-h-[600px] pr-1.5">
                      {allUsers.map((user) => {
                        const isSelected = selectedSimUser?.id === user.id;
                        const roleColor = user.role.includes('HOD') || user.role.includes('Admin')
                          ? 'border-purple-500/40 text-purple-400 bg-purple-950/30'
                          : user.role.includes('Staff')
                          ? 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30'
                          : user.role.includes('Parent')
                          ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'
                          : 'border-pink-500/40 text-pink-400 bg-pink-950/30';

                        return (
                          <div
                            key={user.id}
                            onClick={() => {
                              setSelectedSimUser(user);
                              if (window.speechSynthesis) {
                                window.speechSynthesis.cancel();
                                window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Selected profile ${user.fullName}. Role identified ${user.role}.`));
                              }
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer relative group flex items-start gap-3 text-left ${
                              isSelected
                                ? 'bg-[#150a1e]/80 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.1)]'
                                : 'bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-900/80'
                            }`}
                          >
                            <div className="shrink-0 relative">
                              <img
                                src={user.photoBlob || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=101827&color=fff&size=100`}
                                alt={user.fullName}
                                className="w-10 h-10 rounded-full object-cover border border-white/10"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-slate-950 rounded-full border border-white/10 flex items-center justify-center text-[10px]">
                                {user.gender === 'Female' ? '👩‍🎓' : '👨‍🎓'}
                              </span>
                            </div>

                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h5 className="font-bold text-white text-xs truncate group-hover:text-pink-400 transition-colors">
                                  {user.fullName}
                                </h5>
                                <span className={`text-[7.5px] font-mono px-1.5 py-0.2 rounded font-extrabold uppercase shrink-0 border ${roleColor}`}>
                                  {user.role}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-mono">
                                ID: <span className="text-slate-300 font-sans font-bold">{user.idNumber}</span>
                              </p>
                              
                              {/* METADATA ACCORDING TO ROLE */}
                              {user.role.includes('Student') && (
                                <div className="flex items-center gap-3 text-[9px] text-slate-400 pt-1 font-mono">
                                  <span className="flex items-center gap-0.5 text-amber-400">
                                    🔥 {user.streak || 0}d Streak
                                  </span>
                                  <span className="text-zinc-500">•</span>
                                  <span className="text-cyan-400">
                                    XP {user.xp || 0}
                                  </span>
                                  <span className="text-zinc-500">•</span>
                                  <span className="flex items-center gap-0.5 text-emerald-400">
                                    ⚡ {user.attendanceEnergy || 0}% Energy
                                  </span>
                                </div>
                              )}

                              {user.role.includes('Parent') && (
                                <p className="text-[9.5px] italic text-emerald-400 pt-0.5 font-sans">
                                  Linked student ward ID: {user.linkedStudentId || 'CS-25603'}
                                </p>
                              )}

                              {user.designation && (
                                <p className="text-[9.5px] text-cyan-300 pt-0.5 font-sans">
                                  {user.designation}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT PANEL: INTERACTIVE PHONE PREVIEW AND STATE CONTROLLERS */}
                  <div className="lg:col-span-7 space-y-6">
                    {selectedSimUser ? (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        
                        {/* CONTROLLERS - 5 cols */}
                        <div className="md:col-span-5 space-y-4">
                          <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-4 space-y-4.5 text-left">
                            <h4 className="font-orbitron font-extrabold text-white text-[11px] uppercase tracking-wider border-b border-white/5 pb-2">
                              Sentry Sensor Inputs
                            </h4>

                            {/* GEOFENCE TRIGGER */}
                            <div className="space-y-1.5">
                              <label className="text-[9px] uppercase font-bold text-zinc-500 font-mono block">
                                Proximity Geolocation
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => {
                                    setSimLocationInside(true);
                                    if (window.speechSynthesis) {
                                      window.speechSynthesis.speak(new SpeechSynthesisUtterance("Telemetry coordinates locked inside campus geofence range. Safe check-ins enabled."));
                                    }
                                  }}
                                  className={`py-1.5 rounded-lg font-mono text-[9.5px] font-bold border transition-all cursor-pointer ${
                                    simLocationInside
                                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/5'
                                      : 'bg-slate-900/30 text-slate-500 border-white/5 hover:text-slate-300'
                                  }`}
                                >
                                  📍 Inside Campus
                                </button>
                                <button
                                  onClick={() => {
                                    setSimLocationInside(false);
                                    if (window.speechSynthesis) {
                                      window.speechSynthesis.speak(new SpeechSynthesisUtterance("Geofence breach detected. Mock coordinates set to Beach Road, Vizag. Attendance restricted."));
                                    }
                                  }}
                                  className={`py-1.5 rounded-lg font-mono text-[9.5px] font-bold border transition-all cursor-pointer ${
                                    !simLocationInside
                                      ? 'bg-orange-950/40 text-orange-400 border-orange-500/40 shadow-sm'
                                      : 'bg-slate-900/30 text-slate-500 border-white/5 hover:text-slate-300'
                                  }`}
                                >
                                  🚨 Beach Road
                                </button>
                              </div>
                            </div>

                            {/* TAP NFC BADGE SIMULATOR */}
                            {selectedSimUser.role.includes('Student') && (
                              <div className="space-y-1.5 pt-1">
                                <label className="text-[9px] uppercase font-bold text-zinc-500 font-mono block">
                                  Biometric NFC Badge
                                </label>
                                <button
                                  onClick={() => {
                                    if (!simLocationInside) {
                                      if (window.speechSynthesis) {
                                        window.speechSynthesis.speak(new SpeechSynthesisUtterance("NFC transaction rejected. Student geofence telemetry must align with campus coordinates prior to tap-in."));
                                      }
                                      return;
                                    }
                                    setSimCardTapped(true);
                                    setTimeout(() => setSimCardTapped(false), 2000);
                                    
                                    const result = db.recordAttendanceSession(selectedSimUser.id, 'FN');
                                    db.addLog('SYNC', `NFC Badge sensor read completed on workstation CS-01 for Student: ${selectedSimUser.fullName}. Transaction code matched.`, 'success');
                                    onRefreshAll();

                                    if (window.speechSynthesis) {
                                      window.speechSynthesis.cancel();
                                      window.speechSynthesis.speak(new SpeechSynthesisUtterance(result.success ? "Check-in accepted. Attendance marked successfully." : result.message));
                                    }
                                  }}
                                  className={`w-full py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-mono text-[10.5px] uppercase font-black rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-md ${
                                    simCardTapped ? 'animate-pulse ring-2 ring-pink-400' : ''
                                  }`}
                                >
                                  💥 Tap virtual ID card
                                </button>
                              </div>
                            )}

                            {/* PANIC ALERT TRIGGER */}
                            <div className="space-y-1.5 pt-1">
                              <label className="text-[9px] uppercase font-bold text-zinc-500 font-mono block">
                                Distress Signals
                              </label>
                              <button
                                onClick={() => {
                                  const isFemale = selectedSimUser.gender === 'Female';
                                  db.addPanicAlert(
                                    'CS-SIM-NODE',
                                    selectedSimUser.fullName,
                                    `SANDBOX LIVE ALARM - Emergency dispatch request for local operator. Role: ${selectedSimUser.role}.`,
                                    isFemale
                                  );
                                  setSimSosTriggered(true);
                                  setTimeout(() => setSimSosTriggered(false), 3000);
                                  db.addLog('SECURITY', `Distress trigger activated by simulated session user ${selectedSimUser.fullName}. Siren active.`, 'error');
                                  onRefreshAll();

                                  if (window.speechSynthesis) {
                                    window.speechSynthesis.cancel();
                                    const helpVoice = isFemale 
                                      ? "Extreme Female Distress. Automatic telemetry dispatch sent to police. Local warning siren active." 
                                      : "Emergency panic beacon transmitted. Dispatching security team coordinates.";
                                    window.speechSynthesis.speak(new SpeechSynthesisUtterance(helpVoice));
                                  }
                                }}
                                className={`w-full py-2 rounded-lg text-white font-mono text-[10.5px] uppercase font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                                  simSosTriggered
                                    ? 'bg-red-600 animate-ping'
                                    : 'bg-red-950/40 text-red-100 border border-red-500/40 hover:bg-red-900/60 hover:text-white'
                                }`}
                              >
                                🔔 Simulated Panic Alert (SOS)
                              </button>
                            </div>

                            <div className="border-t border-white/5 my-2"></div>

                            {/* MAKE CURRENT USER IN ACTIVE CONTAINER */}
                            <div className="space-y-1.5 pt-1.5">
                              <button
                                onClick={() => {
                                  db.setCurrentStudent(selectedSimUser);
                                  localStorage.setItem('csync_pwa_authenticated', 'true');
                                  localStorage.setItem('csync_saved_active_user_v3', JSON.stringify(selectedSimUser));
                                  
                                  // Auto elevate admin privileges if HOD or Admin is selected
                                  if (selectedSimUser.role.includes('HOD') || selectedSimUser.role.includes('Admin') || selectedSimUser.role.includes('Staff')) {
                                    localStorage.setItem('csync_admin_authenticated', 'true');
                                  } else {
                                    localStorage.removeItem('csync_admin_authenticated');
                                  }
                                  
                                  onRefreshAll();
                                  if (window.speechSynthesis) {
                                    window.speechSynthesis.cancel();
                                    window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Security context updated. Logged in as ${selectedSimUser.fullName}.`));
                                  }
                                  
                                  // Open a prompt advising of mock login context change
                                  alert(`Context changed successfully! The central simulation user has been set to ${selectedSimUser.fullName} (${selectedSimUser.role}). Navigate back to home/PWA to audit their view!`);
                                }}
                                className="w-full py-2 bg-pink-500 hover:bg-pink-400 text-slate-950 font-sans text-[10.5px] font-black rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Promote as Live User
                              </button>
                              <span className="block text-[8px] text-zinc-500 text-center font-mono uppercase">
                                Overrides active session auth states
                              </span>
                            </div>

                          </div>
                        </div>

                        {/* SMARTPHONE WEB PREVIEW - 7 cols */}
                        <div className="md:col-span-7 flex justify-center">
                          <div className="relative w-64 h-[490px] rounded-[36px] bg-[#02040a] border-[8px] border-slate-800 shadow-[0_25px_50px_-12px_rgba(30,10,50,0.4)] flex flex-col overflow-hidden select-none">
                            
                            {/* CAMERA NOTCH notch */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-800 rounded-full z-30 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-cyan-950 border border-slate-700"></div>
                            </div>

                            {/* SCREEN STATUS BAR */}
                            <div className="h-7 bg-slate-950 pt-2 px-6 flex items-center justify-between text-[8px] font-mono text-slate-400 shrink-0 z-20">
                              <span>C-SYNC Net</span>
                              <div className="flex items-center gap-1">
                                <span>98% ⚡</span>
                                <span className="w-2.5 h-1.5 bg-emerald-400 rounded-xs"></span>
                              </div>
                            </div>

                            {/* SCREEN SCREEN BODY */}
                            <div className="flex-grow p-3 flex flex-col justify-between bg-gradient-to-b from-[#090b14] to-[#04050d] text-slate-200 overflow-y-auto overflow-x-hidden relative text-left">
                              
                              {/* GEOLOCATION FLASHER ALERT WARNINGS */}
                              {!simLocationInside && (
                                <div className="absolute top-0 inset-x-0 bg-orange-600/90 text-white text-[8px] font-mono font-bold py-1 px-2.5 text-center flex items-center justify-center gap-1 animate-pulse z-10">
                                  <span>🚨 TELEMETRY OUTSIDE CAMPUS BOUNDS</span>
                                </div>
                              )}

                              {selectedSimUser.role.includes('Student') && (
                                <div className="flex-grow flex flex-col justify-start space-y-3.5 pt-2">
                                  {/* HEADER APP BAR */}
                                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <span className="text-[10px] font-orbitron font-extrabold text-[#00f2ff]">STUDENT ID</span>
                                    <span className={`text-[7px] px-1.5 py-0.2 rounded font-mono font-extrabold uppercase border border-pink-500/30 text-pink-400 bg-pink-950/20`}>
                                      ACTIVE
                                    </span>
                                  </div>

                                  {/* HOLO CARD SHIELD WRAPPER */}
                                  <div className="bg-gradient-to-br from-[#120524] to-[#04081c] border border-pink-500/20 rounded-xl p-3 relative overflow-hidden shadow-inner flex flex-col space-y-2 text-center items-center">
                                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-pink-500/10 rounded-full blur-xl pointer-events-none"></div>
                                    
                                    <img
                                      src={selectedSimUser.photoBlob || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedSimUser.fullName)}&background=1f1235&color=d946ef&size=100`}
                                      alt="Student identity thumbnail"
                                      className="w-12 h-12 rounded-full border border-pink-500/30 shadow-[0_0_12px_rgba(236,72,153,0.1)] object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                    
                                    <div>
                                      <h5 className="font-orbitron font-extrabold text-white text-[11px] leading-tight truncate max-w-[180px]">
                                        {selectedSimUser.fullName}
                                      </h5>
                                      <p className="text-[8px] text-pink-400 font-mono tracking-widest leading-none mt-0.5">
                                        {selectedSimUser.idNumber}
                                      </p>
                                    </div>

                                    {/* ROTATING SECURITY BARCODE MATRIX */}
                                    <div className="bg-white p-1 rounded w-28 h-8 flex items-center justify-center border border-pink-500/10">
                                      <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('csync-badge-' + selectedSimUser.idNumber)}&color=0a0c10&bgcolor=ffffff`}
                                        alt="student barcode identity"
                                        className="h-full w-auto object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                    
                                    <span className="text-[7.5px] text-zinc-500 uppercase font-mono tracking-wide leading-none">
                                      Secure Handshake token 
                                    </span>
                                  </div>

                                  {/* GEOLOCATION AND DAILY WEATHER PANEL */}
                                  <div className="bg-[#0b1223]/60 border border-white/5 rounded-xl p-2.5 space-y-1.5 font-sans">
                                    <div className="flex items-center justify-between text-[8px] text-zinc-400">
                                      <span>REGIONAL INFRASTRUCTURE</span>
                                      <span className="text-emerald-400 font-bold">12ms Latency</span>
                                    </div>
                                    <p className="text-[9.5px] font-bold text-white flex items-center gap-1">
                                      📍 {simLocationInside ? 'Dr. V.S. Krishna Degree (A) Grounds' : 'Visakhapatnam Beach Road'}
                                    </p>
                                    <p className="text-[8.5px] text-zinc-400 leading-normal">
                                      {simLocationInside 
                                        ? 'Sentry sensors logged GPS proximity validation loop. Tap check-in is fully authorized.' 
                                        : 'Biometric authorization disabled. Please report to Computer Science section if telemetry fails.'}
                                    </p>
                                  </div>

                                  {/* REPUTATION AND XP MARKS MOCK GRID */}
                                  <div className="grid grid-cols-2 gap-1.5 text-center">
                                    <div className="bg-[#05111c] border border-cyan-500/10 rounded-lg p-1.5">
                                      <span className="block text-[7.5px] text-zinc-500 uppercase font-mono">Streak Mark</span>
                                      <span className="text-[12px] font-orbitron font-extrabold text-cyan-400">🔥 {selectedSimUser.streak || 0} Days</span>
                                    </div>
                                    <div className="bg-[#1a110a] border border-amber-500/10 rounded-lg p-1.5">
                                      <span className="block text-[7.5px] text-zinc-500 uppercase font-mono">XP Rating</span>
                                      <span className="text-[12px] font-orbitron font-extrabold text-amber-500">🛡️ Lvl {selectedSimUser.level || 1}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {selectedSimUser.role.includes('Parent') && (
                                <div className="flex-grow flex flex-col justify-start space-y-3.5 pt-2 font-sans">
                                  {/* HEADER APP BAR */}
                                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <span className="text-[10px] font-orbitron font-extrabold text-emerald-400">GUARDIAN PORTAL</span>
                                    <span className="text-[7.5px] bg-emerald-950/40 border border-emerald-500/25 text-emerald-400 px-1 py-0.2 rounded font-mono font-bold leading-none">
                                      LINKED
                                    </span>
                                  </div>

                                  {/* ACTIVE WARD TELEMETRY MAP TRACKERS */}
                                  <div className="bg-[#031d17]/40 border border-emerald-500/20 rounded-xl p-3 space-y-2">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs">🎯</span>
                                      <div>
                                        <span className="text-[7.5px] text-emerald-500 font-mono font-bold block uppercase leading-none">Warding Student Ward Verified</span>
                                        <h6 className="font-bold text-white text-[11px] leading-tight mt-0.5">Arjun Sharma</h6>
                                      </div>
                                    </div>

                                    {/* GPS POSITION COORD TRACKER RADAR */}
                                    <div className="bg-[#030611] rounded-lg border border-white/5 h-20 relative overflow-hidden flex items-center justify-center">
                                      <span className="absolute inset-0 border border-emerald-500/15 rounded-full scale-[1.5] animate-ping" style={{ animationDuration: '3s' }}></span>
                                      <span className="absolute inset-0 border border-emerald-500/10 rounded-full scale-[0.9] animate-pulse"></span>
                                      <div className="text-center font-mono text-[8px] text-emerald-400 z-10">
                                        <div className="font-bold">RADAR HEARTBEAT</div>
                                        <div>LAT: 17.7303 / LNG: 83.3195</div>
                                        <div className="text-zinc-500 mt-0.5">GDC Maddilapalem</div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* ATTENDANCE RECORD MATRIX SHIELD */}
                                  <div className="bg-slate-900/50 border border-white/5 rounded-xl p-2.5 space-y-1.5 font-mono text-[8.5px]">
                                    <div className="text-slate-400 uppercase font-bold text-[8px]">WARD COMPLIANCE MATRIX</div>
                                    <div className="flex justify-between items-center bg-black/40 p-1.5 rounded">
                                      <span>FN Attendance:</span>
                                      <span className="text-emerald-400 font-bold uppercase">PRESENT</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-black/40 p-1.5 rounded">
                                      <span>AN Attendance:</span>
                                      <span className="text-emerald-400 font-bold uppercase">PRESENT</span>
                                    </div>
                                    <span className="text-[7.5px] text-zinc-500 block text-right font-sans italic">Updated via centralized C-SYNC ledger.</span>
                                  </div>
                                </div>
                              )}

                              {(selectedSimUser.role.includes('HOD') || selectedSimUser.role.includes('Staff') || selectedSimUser.role.includes('Admin')) && (
                                <div className="flex-grow flex flex-col justify-start space-y-3.5 pt-2 font-sans">
                                  {/* HEADER APP BAR */}
                                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <span className="text-[10px] font-orbitron font-extrabold text-purple-400">OFFICER TERMINAL</span>
                                    <span className="text-[7.5px] bg-purple-950/40 border border-purple-500/25 text-purple-400 px-1 py-0.2 rounded font-mono font-bold leading-none">
                                      ACADEMIC
                                    </span>
                                  </div>

                                  <div className="bg-[#0b0c16] border border-purple-500/20 rounded-xl p-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <img 
                                        src={selectedSimUser.photoBlob || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedSimUser.fullName)}&background=101827&color=fff&size=100`}
                                        alt="staff icon thumbnail"
                                        className="w-8 h-8 rounded-full object-cover border border-purple-500/20"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div>
                                        <span className="text-[7.5px] text-purple-400 font-mono font-bold block uppercase leading-none">Department Office</span>
                                        <h6 className="font-bold text-white text-[11px] leading-tight mt-0.5">{selectedSimUser.fullName}</h6>
                                      </div>
                                    </div>
                                    <span className="block text-[8px] text-zinc-400 leading-normal border-t border-white/5 pt-1.5 font-mono">
                                      ROLE: {selectedSimUser.role} • AUTH TOKEN: CSYNC-OK-V4
                                    </span>
                                  </div>

                                  {/* QUICK STAFF SIMULATION PANEL ACTIONS */}
                                  <div className="space-y-1.5">
                                    <span className="text-[8px] text-zinc-500 font-mono uppercase block">Simulator Triggers</span>
                                    
                                    <button 
                                      onClick={() => {
                                        db.createLiveClass('B.Sc Computer Science', 'Network Hardware & Routing Encryption', selectedSimUser.fullName, selectedSimUser.id);
                                        db.addLog('SYSTEM', `${selectedSimUser.fullName} created a virtual live classroom lobby via simulator proxy.`, 'info');
                                        onRefreshAll();
                                        if (window.speechSynthesis) {
                                          window.speechSynthesis.cancel();
                                          window.speechSynthesis.speak(new SpeechSynthesisUtterance("Virtual classroom lobby created and broadcasted on student check-in feeds."));
                                        }
                                        alert("Live Classroom session successfully created and populated on the active network stream! Students will see this live class in their dashboards.");
                                      }}
                                      className="w-full py-1.5 bg-purple-950/50 hover:bg-purple-900 border border-purple-500/30 text-purple-300 hover:text-white rounded text-[9px] font-mono font-bold uppercase transition-all duration-150 cursor-pointer text-center"
                                    >
                                      ⚡ Host Live Class Lobby
                                    </button>

                                    <button 
                                      onClick={() => {
                                        db.addLog('SYSTEM', `[ADMIN BULLETIN BROADCAST] Published by ${selectedSimUser.fullName}: Computer science laboratories will host unified security audit parameters today.`, 'info');
                                        onRefreshAll();
                                        if (window.speechSynthesis) {
                                          window.speechSynthesis.cancel();
                                          window.speechSynthesis.speak(new SpeechSynthesisUtterance("System-wide bulletin update dispatched to student feeds."));
                                        }
                                        alert("Announcement published and appended to live global system log ticks!");
                                      }}
                                      className="w-full py-1.5 bg-cyan-950/50 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 hover:text-white rounded text-[9px] font-mono font-bold uppercase transition-all duration-150 cursor-pointer text-center"
                                    >
                                      📌 Publish Announcement
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* ALUMNI OR OTHER GUEST VIEW */}
                              {(!selectedSimUser.role.includes('Student') && !selectedSimUser.role.includes('Staff') && !selectedSimUser.role.includes('HOD') && !selectedSimUser.role.includes('Parent')) && (
                                <div className="flex-grow flex flex-col justify-start space-y-3.5 pt-2">
                                  {/* HEADER APP BAR */}
                                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <span className="text-[10px] font-orbitron font-extrabold text-pink-400">PORTAL COMPASS</span>
                                    <span className="text-[7.5px] bg-pink-950/40 border border-pink-500/25 text-pink-400 px-1 py-0.2 rounded font-mono font-bold leading-none">
                                      VISITOR
                                    </span>
                                  </div>

                                  <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-2 text-center h-44 flex flex-col items-center justify-center">
                                    <span className="text-xl">🎓</span>
                                    <h6 className="font-bold text-white text-[11px] leading-tight">Alumni / Guest Verification</h6>
                                    <p className="text-[8.5px] text-slate-400 max-w-[160px] leading-relaxed mx-auto">
                                      Alumni and verified visitors can browse academic job opportunities, manage career portfolios, or link network cards with local labs.
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* GLOBAL COMPLIANCE INDICATOR */}
                              <div className="border-t border-white/5 pt-1 text-center font-mono uppercase text-[6px] text-zinc-500 shrink-0">
                                C-SYNC INTEGRITY CHECK LEVEL B • SECURED SESSION
                              </div>

                            </div>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-16 text-center space-y-3">
                        <Smartphone className="w-10 h-10 text-slate-600 mx-auto" />
                        <h4 className="font-bold text-white text-sm font-sans uppercase">No selected simulated identity</h4>
                        <p className="text-slate-500 text-xs font-sans max-w-sm mx-auto leading-relaxed">
                          Navigate through the virtual identities directory on the left and select an active profile to initialize the telemetry simulator.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>
        
      </div>

      {/* MODAL WINDOW: simulated add new member form */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#040914] border border-cyan-500/30 rounded-2xl p-6 w-full max-w-lg relative text-left">
            <button 
              onClick={() => setShowAddMemberModal(false)}
              className="absolute right-4 top-4 hover:text-white text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-[#00f2ff] font-orbitron tracking-wide mb-1 uppercase flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Register new member to C-SYNC
            </h3>
            <p className="text-slate-400 text-xs mb-5 font-mono">Fill out student details. Will register directly with active enrollment credentials state.</p>

            <form onSubmit={handleAddMemberSubmit} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Full Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={addFormName}
                    onChange={(e) => setAddFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">ID / Roll Call No:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE-2023-014"
                    value={addFormId}
                    onChange={(e) => setAddFormId(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Role Type:</label>
                  <select
                    value={addFormRole}
                    onChange={(e: any) => setAddFormRole(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-[#00f2ff]/60 font-mono"
                  >
                    <option value="Major Student">Major Student</option>
                    <option value="Minor Student">Minor Student</option>
                    <option value="Staff">Staff / Instructor</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Guest">Guest</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Mobile Number:</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={addFormPhone}
                    onChange={(e) => setAddFormPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Academic Year:</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={addFormYear}
                    onChange={(e) => setAddFormYear(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Batch Period:</label>
                  <input
                    type="text"
                    value={addFormBatch}
                    onChange={(e) => setAddFormBatch(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Gender:</label>
                  <select
                    value={addFormGender}
                    onChange={(e) => setAddFormGender(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-slate-300 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other / Non-binary</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Email Address:</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@csync.edu"
                    value={addFormEmail}
                    onChange={(e) => setAddFormEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Department / Course field:</label>
                <input
                  type="text"
                  value={addFormDept}
                  onChange={(e) => setAddFormDept(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-cyan-500/10">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00f2ff] hover:bg-[#5eecff] text-[#020617] px-5 py-2.5 rounded-xl font-mono font-bold uppercase tracking-wide transition-all shadow-md"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW: edit user profile information */}
      {showEditProfileModal && editProfileUser && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#040914] border border-[#00f2ff]/30 rounded-2xl p-6 w-full max-w-2xl relative text-left shadow-[0_0_50px_rgba(0,242,255,0.15)] flex flex-col max-h-[90vh]">
            <button 
              onClick={() => {
                setShowEditProfileModal(false);
                setEditProfileUser(null);
              }}
              className="absolute right-4 top-4 hover:text-white text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-[#00f2ff] font-orbitron tracking-wide mb-1 uppercase flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#00f2ff]" />
              Update User Profile: {editProfileUser.fullName}
            </h3>
            <p className="text-slate-400 text-xs mb-3 font-mono">
              Editing registration node ID #{editProfileUser.id}. Changes apply immediately with live broadcast triggers.
            </p>

            <form onSubmit={handleEditProfileSubmit} className="space-y-4 font-sans text-xs overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Full Name:</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">ID / Roll Call No:</label>
                  <input
                    type="text"
                    required
                    value={editIdNumber}
                    onChange={(e) => setEditIdNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Role Type:</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-[#00f2ff]/60 font-mono"
                  >
                    <option value="Student">Student</option>
                    <option value="Major Student">Major Student</option>
                    <option value="Minor Student">Minor Student</option>
                    <option value="Staff">Staff</option>
                    <option value="HOD">HOD</option>
                    <option value="Admin">Admin</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Guest">Guest</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Designation Label:</label>
                  <input
                    type="text"
                    placeholder="e.g. Faculty Instructor, Active Student"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Subject / Course / CSE Dept:</label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Email Endpoint:</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Physical Phone Line:</label>
                  <input
                    type="tel"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Emergency Phone Line:</label>
                  <input
                    type="tel"
                    value={editParentMobile}
                    onChange={(e) => setEditParentMobile(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Trust / Integrity Score (0-100):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editTrust}
                    onChange={(e) => setEditTrust(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Clearance Level (1-15):</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={editLevel}
                    onChange={(e) => setEditLevel(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Continuous Streak Days:</label>
                  <input
                    type="number"
                    min="0"
                    value={editStreak}
                    onChange={(e) => setEditStreak(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">System Experience Points (XP):</label>
                  <input
                    type="number"
                    min="0"
                    value={editXp}
                    onChange={(e) => setEditXp(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00f2ff]/60 font-mono"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Registration Status:</label>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="editIsApprovedCheckbox"
                      checked={editIsApproved}
                      onChange={(e) => setEditIsApproved(e.target.checked)}
                      className="w-4 h-4 accent-[#00f2ff] cursor-pointer"
                    />
                    <label htmlFor="editIsApprovedCheckbox" className="text-white select-none text-[10px] cursor-pointer font-sans leading-none">
                      Grant System Access (Is Approved Node)
                    </label>
                  </div>
                </div>

                <div className="space-y-1 col-span-2 bg-[#02050f] p-3 rounded-xl border border-[#00f2ff]/10">
                  <label className="text-slate-400 font-bold font-mono text-[9px] block uppercase">Biometric Face Image Override:</label>
                  <div className="flex items-center gap-4 mt-2">
                    {editPhoto ? (
                      <div className="relative w-16 h-16 rounded-xl border border-[#00f2ff]/30 overflow-hidden bg-black shrink-0">
                        <img src={editPhoto} alt="Override Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => setEditPhoto('')}
                          className="absolute top-0 right-0 bg-red-600 text-white rounded-bl p-0.5 text-[8px] font-black cursor-pointer hover:bg-red-500"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl border border-dashed border-white/10 flex items-center justify-center shrink-0 text-slate-500 font-bold text-[10px] bg-black">
                        No Photo
                      </div>
                    )}
                    <div className="space-y-2 flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') {
                                setEditPhoto(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-bold file:bg-cyan-950 file:text-cyan-300 hover:file:bg-[#00f2ff] hover:file:text-slate-950 file:cursor-pointer transition-all"
                      />
                      <p className="text-[8px] text-slate-500 leading-normal font-mono">Upload a face photo for custom bypass. Converts immediately into local browser data format.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-cyan-500/10 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProfileModal(false);
                    setEditProfileUser(null);
                  }}
                  className="bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl font-mono uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00f2ff] hover:bg-[#5eecff] text-[#020617] px-5 py-2.5 rounded-xl font-mono font-bold uppercase tracking-wide transition-all shadow-md cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
