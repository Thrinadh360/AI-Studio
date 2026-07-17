import { User, Station, AttendanceLog, SyncFile, SystemLog, StationStatus, MaintenanceActivity, StationIssue, CampusHoliday, PanicAlert, SuccessionRecord, Department, LicenseConfig, DeviceChangeRequest, LeaveRequest, AppNotification, MorningBrief, WeatherInfo, LiveClassSession, WhiteboardStroke, ChatThread, ChatMessage, UserStory, CsyncApiProject, JobOpportunity, JobApplication, BankTransaction, AccountClosureRequest, FundraiserCampaign, FundraiserContribution, Role, DiscussionTopic, DiscussionComment } from './types';
import { censorText } from './profanityFilter';

let sessionHardwareMac = '';
export function getOrGenerateRealHardwareMac(): string {
  if (!sessionHardwareMac) {
    const chars = '0123456789ABCDEF';
    const macArr = [];
    for (let i = 0; i < 6; i++) {
      macArr.push(chars[Math.floor(Math.random() * 16)] + chars[Math.floor(Math.random() * 16)]);
    }
    sessionHardwareMac = macArr.join(':');
  }
  return sessionHardwareMac;
}

export class ClientDatabase {
  private users: User[] = [];
  private stations: Station[] = [];
  private files: SyncFile[] = [];
  private systemLogs: SystemLog[] = [];
  private attendanceLogs: AttendanceLog[] = [];
  private currentStudentUser: User | null = null;
  private issues: StationIssue[] = [];
  private maintenance: MaintenanceActivity[] = [];
  private holidays: CampusHoliday[] = [];
  private panicAlerts: PanicAlert[] = [];
  private devDeckRequested = false;
  private successionRecords: SuccessionRecord[] = [];
  private activeLicenseId = 'CSYNC-GDC-CS-998';
  private trackingLicenses: LicenseConfig[] = [];
  private deviceChangeRequests: DeviceChangeRequest[] = [];
  private leaveRequests: LeaveRequest[] = [];
  private chatThreads: ChatThread[] = [];
  private chatMessages: ChatMessage[] = [];
  private userStories: UserStory[] = [];
  private apiProjects: CsyncApiProject[] = [];
  private apiRequests: any[] = [];
  private jobOpportunities: JobOpportunity[] = [];
  private jobApplications: JobApplication[] = [];
  private bankTransactions: BankTransaction[] = [];
  private accountClosureRequests: AccountClosureRequest[] = [];
  private fundraiserCampaigns: FundraiserCampaign[] = [];
  private fundraiserContributions: FundraiserContribution[] = [];
  private motherUpi = '8500394696@yes';
  private gatewayAutoApprove = false;
  private deployedModules: any[] = [];
  private writeInProgress = false;
  private lastKnownState: any = {};
  private stationDevice: any = null;
  private liveClasses: LiveClassSession[] = [];
  private notifications: AppNotification[] = [];
  private discussionTopics: DiscussionTopic[] = [
    {
      id: 'dt-001',
      title: 'Lab B Workstation Allocation & Sentry Integration Protocols',
      description: 'Reviewing MAC registration and geofence multipliers for secure attendance links in CSE Lab-B workstations.',
      category: 'ANNOUNCEMENT',
      initiatedById: 101,
      initiatedByName: 'Dr. A. Siva Prasad',
      initiatedByRole: 'HOD',
      createdAt: '2026-07-15 09:30 AM',
      comments: [
        {
          id: 'cmt-001',
          authorId: 102,
          authorName: 'Mrs. Kalyani T.',
          authorRole: 'Staff',
          text: 'We should ensure all students verify their physical proximity via the companion NFC app before logging in.',
          timestamp: '2026-07-15 10:15 AM',
          likes: 4
        }
      ]
    },
    {
      id: 'dt-002',
      title: 'Major Research Project: Autonomous Drone Geofencing on Coastline Nodes',
      description: 'Collaborative development of sovereign telemetry loops and adaptive drone geofencing for coastline security checks.',
      category: 'RESEARCH',
      initiatedById: 102,
      initiatedByName: 'Mrs. Kalyani T.',
      initiatedByRole: 'Staff',
      createdAt: '2026-07-14 11:20 AM',
      comments: []
    }
  ];

  private morningBrief: MorningBrief = {
    id: 'brief-today',
    date: new Date().toISOString().split('T')[0],
    title: 'Daily Campus News Briefing (Visakhapatnam Focus)',
    international: 'Global climate summit pledges standards for dynamic clean computing telemetry.',
    national: 'India Academic ID platform exceeds 12 million active undergraduate student nodes.',
    regional: 'Andhra University drafts dynamic campus geofencing safety directives.',
    summary: 'Central node monitoring active. Keep workstation links open.'
  };

  private weather: WeatherInfo = {
    temp: 29,
    condition: 'Steady Coastline Breeze',
    humidity: 78,
    windSpeed: 14,
    umbrellaRequired: false,
    alert: 'Perfect climate over College. Secure workstation environment.',
    latitude: 17.740697,
    longitude: 83.321251,
    locationName: 'college',
    heatwaveRisk: 'LOW',
    uvIndex: 4,
    lastUpdated: '09:00 AM'
  };

  constructor(
    users?: any,
    stations?: any,
    files?: any,
    logs?: any,
    attendance?: any,
    issues?: any,
    maintenance?: any
  ) {
    // Initialize default stations
    const defaultStations: Station[] = [];
    for (let i = 1; i <= 50; i++) {
      defaultStations.push({
        stationId: `CS-${String(i).padStart(2, '0')}`,
        pcMacAddress: 'Pending First Run',
        status: 'LOCKED',
        activeUserId: null,
        activeUser: undefined,
        lastHeartbeat: new Date().toISOString()
      });
    }
    this.stations = defaultStations;

    if (users) this.users = users;
    if (stations) this.stations = stations;
    if (files) this.files = files;
    if (logs) this.systemLogs = logs;
    if (attendance) this.attendanceLogs = attendance;
    if (issues) this.issues = issues;
    if (maintenance) this.maintenance = maintenance;
    this.syncWithServer().catch(() => {});
  }

  getGoogleAppsScriptUrl(): string {
    return localStorage.getItem('csync_gas_url') || '';
  }

  setGoogleAppsScriptUrl(url: string) {
    localStorage.setItem('csync_gas_url', url.trim());
    this.addLog('SYSTEM', `Google Apps Script backend URL bound: ${url.trim()}`, 'success');
  }

  async fetchGas(action: string, payload: any = {}): Promise<any> {
    const gasUrl = this.getGoogleAppsScriptUrl();
    if (!gasUrl) {
      throw new Error("Google Apps Script backend is not configured yet. Set it in the Developer Deck console.");
    }
    // We send standard post bodies to avoid pre-flight OPTIONS request issues on custom headers.
    // Standard Apps Script allows parsing direct text-body JSONs elegantly.
    const url = `${gasUrl}${gasUrl.includes('?') ? '&' : '?'}action=${encodeURIComponent(action)}`;
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({ ...payload, action })
    });
    if (!response.ok) {
      throw new Error(`Google Apps Script API responded with status code ${response.status}`);
    }
    const data = await response.json();
    if (data && data.success === false) {
      throw new Error(data.error || "Action execution failed on Apps Script Web App.");
    }
    return data;
  }

  async syncWithServer() {
    if (this.writeInProgress) return;
    try {
      const gasUrl = this.getGoogleAppsScriptUrl();
      if (gasUrl) {
        const data = await this.fetchGas('getEcosystemState');
        if (data && data.state) {
          const state = data.state;
          if (state.users) this.users = state.users;
          if (state.stations) this.stations = state.stations;
          if (state.files) this.files = state.files;
          if (state.systemLogs) this.systemLogs = state.systemLogs;
          if (state.attendanceLogs) this.attendanceLogs = state.attendanceLogs;
          if (state.issues) this.issues = state.issues;
          if (state.maintenance) this.maintenance = state.maintenance;
          if (state.leaveRequests) this.leaveRequests = state.leaveRequests;
          if (state.jobOpportunities) this.jobOpportunities = state.jobOpportunities;
          if (state.jobApplications) this.jobApplications = state.jobApplications;
          if (state.bankTransactions) this.bankTransactions = state.bankTransactions;
          if (state.fundraiserCampaigns) this.fundraiserCampaigns = state.fundraiserCampaigns;
          if (state.fundraiserContributions) this.fundraiserContributions = state.fundraiserContributions;
          if (state.holidays) this.holidays = state.holidays;
          if (state.discussionTopics) this.discussionTopics = state.discussionTopics;
          this.updateLastKnownState();
        }
      } else {
        // Safe offline simulated sync placeholder (already in memory state)
      }
    } catch (err: any) {
      console.warn("CSync Apps Script synchronization deferred:", err.message);
    }
  }

  updateLastKnownState() {
    this.lastKnownState = JSON.parse(JSON.stringify({
      users: this.users, stations: this.stations, files: this.files, systemLogs: this.systemLogs,
      attendanceLogs: this.attendanceLogs, issues: this.issues, maintenance: this.maintenance,
      deviceChangeRequests: this.deviceChangeRequests, leaveRequests: this.leaveRequests,
      jobOpportunities: this.jobOpportunities, jobApplications: this.jobApplications,
      chatThreads: this.chatThreads, chatMessages: this.chatMessages, bankTransactions: this.bankTransactions,
      accountClosureRequests: this.accountClosureRequests, fundraiserCampaigns: this.fundraiserCampaigns,
      fundraiserContributions: this.fundraiserContributions, motherUpi: this.motherUpi,
      gatewayAutoApprove: this.gatewayAutoApprove, deployedModules: this.deployedModules,
      holidays: this.holidays, discussionTopics: this.discussionTopics
    }));
  }

  async persistState() {
    if (this.writeInProgress) return;
    this.writeInProgress = true;
    try {
      const payloadState = {
        users: this.users, stations: this.stations, files: this.files, systemLogs: this.systemLogs,
        attendanceLogs: this.attendanceLogs, issues: this.issues, maintenance: this.maintenance,
        deviceChangeRequests: this.deviceChangeRequests, leaveRequests: this.leaveRequests,
        jobOpportunities: this.jobOpportunities, jobApplications: this.jobApplications,
        chatThreads: this.chatThreads, chatMessages: this.chatMessages, bankTransactions: this.bankTransactions,
        accountClosureRequests: this.accountClosureRequests, fundraiserCampaigns: this.fundraiserCampaigns,
        fundraiserContributions: this.fundraiserContributions, motherUpi: this.motherUpi,
        gatewayAutoApprove: this.gatewayAutoApprove, deployedModules: this.deployedModules,
        holidays: this.holidays, discussionTopics: this.discussionTopics
      };
      
      const gasUrl = this.getGoogleAppsScriptUrl();
      if (gasUrl) {
        await this.fetchGas('postEcosystemState', { state: payloadState });
      }
      this.updateLastKnownState();
    } catch (err: any) {
      console.warn("CSync Google Apps Script state sync deferred:", err.message);
    } finally {
      this.writeInProgress = false;
    }
  }

  reloadFromLocalStorage() {}
  persistStateOnlyLocal() {}

  getDiscussionTopics(): DiscussionTopic[] {
    return this.discussionTopics || [];
  }

  addDiscussionTopic(
    title: string,
    description: string,
    category: 'SYLLABUS' | 'ASSIGNMENT' | 'ANNOUNCEMENT' | 'GENERAL' | 'RESEARCH',
    initiatedById: number
  ): DiscussionTopic | null {
    const creator = this.users.find(u => u.id === initiatedById);
    if (!creator) return null;

    const newTopic: DiscussionTopic = {
      id: `dt-${Date.now()}`,
      title: censorText(title).filteredText,
      description: censorText(description).filteredText,
      category,
      initiatedById,
      initiatedByName: creator.fullName,
      initiatedByRole: creator.role,
      initiatedByPhoto: creator.photoBlob,
      createdAt: new Date().toLocaleString(),
      comments: []
    };

    if (!this.discussionTopics) {
      this.discussionTopics = [];
    }
    this.discussionTopics.unshift(newTopic);
    this.persistState();
    return newTopic;
  }

  addDiscussionComment(
    topicId: string,
    text: string,
    authorId: number,
    replyToCommentId?: string
  ): DiscussionComment | null {
    const author = this.users.find(u => u.id === authorId);
    if (!author) return null;

    if (!this.discussionTopics) {
      this.discussionTopics = [];
    }
    const topic = this.discussionTopics.find(t => t.id === topicId);
    if (!topic) return null;

    const newComment: DiscussionComment = {
      id: `cmt-${Date.now()}`,
      authorId,
      authorName: author.fullName,
      authorRole: author.role,
      authorPhoto: author.photoBlob,
      text: censorText(text).filteredText,
      timestamp: new Date().toLocaleString(),
      replyToCommentId,
      likes: 0
    };

    topic.comments.push(newComment);
    this.persistState();
    return newComment;
  }

  likeDiscussionComment(topicId: string, commentId: string): boolean {
    if (!this.discussionTopics) return false;
    const topic = this.discussionTopics.find(t => t.id === topicId);
    if (!topic) return false;

    const comment = topic.comments.find(c => c.id === commentId);
    if (!comment) return false;

    comment.likes = (comment.likes || 0) + 1;
    this.persistState();
    return true;
  }

  getUsers() { return this.users; }
  getCurrentStudent() { return this.currentStudentUser; }
  setCurrentStudent(user: User | null) { this.currentStudentUser = user; }
  getStations() { return this.stations; }
  getStation(id: string) { return this.stations.find(s => s.stationId === id); }
  getFiles() { return this.files; }
  getLogs() { return this.systemLogs; }
  getAttendanceLogs() { return this.attendanceLogs; }
  getStationIssues() { return this.issues; }
  getMaintenanceActivities() { return this.maintenance; }
  getDeviceChangeRequests() { return this.deviceChangeRequests; }
  getLeaveRequests() { return this.leaveRequests; }
  getJobOpportunities() { return this.jobOpportunities; }
  getJobApplications(studentId?: number) {
    return studentId ? this.jobApplications.filter(a => a.studentId === studentId) : this.jobApplications;
  }
  getChatThreads() { return this.chatThreads; }
  getChatMessages(threadId: string) { return this.chatMessages.filter(m => m.threadId === threadId); }
  getBankTransactions() { return this.bankTransactions; }
  getAccountClosureRequests() { return this.accountClosureRequests; }
  getFundraiserCampaigns() { return this.fundraiserCampaigns; }
  getFundraiserContributions(campaignId?: string) {
    return campaignId ? this.fundraiserContributions.filter(c => c.campaignId === campaignId) : this.fundraiserContributions;
  }
  getMorningBrief() { return this.morningBrief; }
  setMorningBrief(b: MorningBrief) { this.morningBrief = b; }
  getWeather() { return this.weather; }
  setWeather(w: WeatherInfo) { this.weather = w; }
  getDeployedModules() { return this.deployedModules; }
  setDeployedModules(modules: any[]) {
    this.deployedModules = modules;
    this.persistState();
  }

  getNotifications(): AppNotification[] {
    if (!this.notifications || this.notifications.length === 0) {
      const stored = localStorage.getItem('csync_notifications');
      if (stored) {
        try {
          this.notifications = JSON.parse(stored);
        } catch (_) {
          this.notifications = [];
        }
      }
    }
    return this.notifications;
  }

  addNotification(title: string, message: string, type: 'news' | 'weather' | 'system' | 'alert', avatar?: string) {
    const notifications = this.getNotifications();
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
      type,
      read: false,
      avatar
    };
    notifications.unshift(newNotif);
    localStorage.setItem('csync_notifications', JSON.stringify(notifications));
    this.addLog('SYSTEM', `Notification published: [${title}] ${message}`, type === 'alert' ? 'warning' : 'info');
    this.persistState();
  }

  clearNotifications() {
    this.notifications = [];
    localStorage.setItem('csync_notifications', JSON.stringify([]));
    this.persistState();
  }

  markNotificationsAsRead() {
    const notifications = this.getNotifications();
    notifications.forEach(n => n.read = true);
    localStorage.setItem('csync_notifications', JSON.stringify(notifications));
    this.persistState();
  }

  getHolidays() {
    return this.holidays || [];
  }

  addHoliday(name: string, date: string) {
    if (!this.holidays) this.holidays = [];
    const newId = Math.max(0, ...this.holidays.map(h => h.id)) + 1;
    this.holidays.push({
      id: newId,
      name,
      date
    });
    this.persistState();
  }

  removeHoliday(id: number) {
    if (!this.holidays) return;
    this.holidays = this.holidays.filter(h => h.id !== id);
    this.persistState();
  }

  simulateHeatwaveAlert() {}
  simulateHeavyRainAlert() {}
  simulateSevenAMBrief() {}
  simulateSeasonalFallback() {}

  loginWithEmailAndPass(identifier: string, pass: string, currentDeviceFingerprint?: string): { status: 'SUCCESS' | 'WAITING' | 'FAILED' | 'MISMATCH'; user?: User } {
    const cleanId = identifier.trim().toLowerCase();
    const u = this.users.find(usr => 
      (usr.email?.toLowerCase() === cleanId || usr.mobileNumber === cleanId || usr.idNumber?.toLowerCase() === cleanId) && 
      usr.password === pass
    );
    if (!u) return { status: 'FAILED' };
    if (!u.isApproved) return { status: 'WAITING', user: u };
    this.currentStudentUser = u;
    this.addLog('SECURITY', `User ${u.fullName} logged in successfully.`, 'success');
    this.persistState();
    return { status: 'SUCCESS', user: u };
  }

  loginStudent(idNumber: string, fingerprint: string): { success: boolean; user?: User; error?: string } {
    const cleanId = idNumber.trim().toUpperCase();
    const u = this.users.find(usr => usr.idNumber === cleanId);
    if (!u) return { success: false, error: 'Student ID not registered.' };
    if (!u.isApproved) return { success: false, error: 'Registration is pending HOD approval.' };
    this.currentStudentUser = u;
    this.addLog('SECURITY', `Student ${u.fullName} authenticated via fingerprint.`, 'success');
    this.persistState();
    return { success: true, user: u };
  }

  logoutStudent() {
    this.currentStudentUser = null;
    this.persistState();
  }

  approveUser(userId: number, select: boolean) {
    const u = this.users.find(usr => usr.id === userId);
    if (u) {
      u.isApproved = true;
      u.approvalStatus = 'APPROVED';
      this.addLog('SECURITY', `Approved student profile registration: ${u.fullName}`, 'success');
      this.persistState();
    }
  }

  rejectUser(userId: number) {
    const u = this.users.find(usr => usr.id === userId);
    if (u) {
      u.isApproved = false;
      u.approvalStatus = 'REJECTED';
      this.addLog('SECURITY', `Rejected student registration: ${u.fullName}`, 'warning');
      this.persistState();
    }
  }

  registerUser(fullName: string, idNumber: string, role: string, fingerprint: string, photoBlob?: string): User {
    const nextId = this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    const newUser: User = {
      id: nextId, fullName, idNumber: idNumber.toUpperCase(), role: role as Role, gender: 'Male',
      email: `${idNumber.toLowerCase()}@gdc.edu.in`, mobileNumber: '9999999999', password: 'password123',
      year: '3', batch: 'Graduate Batch 2023-2026', subject: 'Computer Science', parentMobile: '9000000000',
      streak: 0, streakTier: 'NOVICE', xp: 0, level: 1, attendanceEnergy: 100, reputationScore: 100,
      campusPresenceScore: 100, isApproved: false, approvalStatus: 'PENDING', isDeveloper: false,
      photoBlob: photoBlob || '', badges: [],
      stars: { attendance: 0, punctuality: 0, consistency: 0, dedication: 0, resilience: 0, honor: 0 },
      walletBalance: 0, upiId: `${idNumber.toLowerCase()}@csync`, csyncUpi: `${idNumber.toLowerCase()}@csync`,
      bankAccountNumber: `ACT-${Date.now()}`
    };
    this.users.push(newUser);
    this.addLog('SECURITY', `New user registration request submitted for ${fullName} (${idNumber}).`, 'info');
    this.persistState();
    return newUser;
  }

  registerUserDetailed(payload: any) {
    const nextId = this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    const newUser: User = {
      id: nextId, fullName: payload.fullName, idNumber: payload.idNumber.toUpperCase(),
      role: (payload.role || 'Student') as Role, gender: payload.gender || 'Male', email: payload.email,
      mobileNumber: payload.mobileNumber, password: payload.password, year: payload.year || '1',
      batch: payload.batch || 'Batch 2024-2027', subject: payload.subject || 'B.Sc Computer Science',
      parentMobile: payload.parentMobile, streak: 0, streakTier: 'NOVICE', xp: 0, level: 1,
      attendanceEnergy: 100, reputationScore: 100, campusPresenceScore: 100, isApproved: false,
      approvalStatus: 'PENDING', isDeveloper: false, photoBlob: payload.photoBlob || '', badges: [],
      stars: { attendance: 0, punctuality: 0, consistency: 0, dedication: 0, resilience: 0, honor: 0 },
      walletBalance: payload.walletBalance || 0, upiId: payload.upiId || `${payload.idNumber.toLowerCase()}@csync`,
      csyncUpi: `${payload.idNumber.toLowerCase()}@csync`, bankAccountNumber: payload.bankAccountNumber || `ACT-${Date.now()}`
    };
    this.users.push(newUser);
    this.addLog('SECURITY', `Detailed user profile registered: ${newUser.fullName} (${newUser.idNumber}). Approval pending HOD.`, 'info');
    this.persistState();
    return { success: true, user: newUser };
  }

  updateStudentPhoto(userId: number, photoBlob: string): boolean {
    const u = this.users.find(usr => usr.id === userId);
    if (u) {
      u.photoBlob = photoBlob;
      this.addLog('SECURITY', `Biometric photo registration updated for student ID ${userId}.`, 'success');
      this.persistState();
      return true;
    }
    return false;
  }

  updateUserProfile(userId: number, updatedFields: Partial<User>): boolean {
    const u = this.users.find(usr => usr.id === userId);
    if (u) {
      Object.assign(u, updatedFields);
      if (this.currentStudentUser && this.currentStudentUser.id === userId) {
        Object.assign(this.currentStudentUser, updatedFields);
      }
      this.addLog('SYSTEM', `User profile updated for student ID ${userId}.`, 'info');
      this.persistState();
      return true;
    }
    return false;
  }

  recordAttendanceSession(
    userId: number, stationId?: string, macAddress?: string, gpsSimMeters?: any,
    targetCampusId?: string, fingerprintStatus?: any
  ): { success: boolean; message: string; data?: AttendanceLog; xpGained?: number; levelUp?: boolean } {
    const u = this.users.find(usr => usr.id === userId);
    if (!u) return { success: false, message: 'User profile not found.' };
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const activeStationId = stationId || 'CS-01';
    const st = this.stations.find(s => s.stationId === activeStationId);
    if (st) {
      st.status = 'UNLOCKED';
      st.activeUserId = u.id;
      st.lastHeartbeat = new Date().toISOString();
    }

    let finalGpsMeters = 1.5;
    if (typeof gpsSimMeters === 'number') {
      finalGpsMeters = gpsSimMeters;
    } else if (typeof gpsSimMeters === 'string') {
      const parsed = parseFloat(gpsSimMeters);
      if (!isNaN(parsed)) {
        finalGpsMeters = parsed;
      }
    }

    const campusId = targetCampusId || 'Maddilapalem Campus';

    const newLog: AttendanceLog = {
      id: Date.now(),
      userId,
      userName: u.fullName,
      eventType: 'ATTENDANCE',
      stationId: activeStationId,
      gpsCoords: `${finalGpsMeters.toFixed(1)}m from ${campusId}`,
      timestamp: `${dateStr} ${timeStr}`
    };
    this.attendanceLogs.unshift(newLog);
    
    const oldLevel = Math.floor((u.xp || 0) / 200) + 1;
    u.streak = (u.streak || 0) + 1;
    u.xp = (u.xp || 0) + 50;
    const newLevel = Math.floor(u.xp / 200) + 1;
    const levelUp = newLevel > oldLevel;
    u.level = newLevel;
    
    u.attendanceEnergy = Math.min(100, (u.attendanceEnergy || 100) + 8);
    u.campusPresenceScore = Math.min(100, (u.campusPresenceScore || 100) + 4);
    if (u.streak >= 15) u.streakTier = 'CAMPUS ELITE';
    else if (u.streak >= 10) u.streakTier = 'SENIOR SENTRY';
    else if (u.streak >= 5) u.streakTier = 'REGULAR';
    this.addLog('SYSTEM', `${u.fullName} recorded attendance successfully at ${activeStationId}.`, 'success');
    this.persistState();
    return { 
      success: true, 
      message: `Attendance verified successfully. Welcome, ${u.fullName}!`, 
      data: newLog,
      xpGained: 50,
      levelUp
    };
  }

  approveLeavePreserveStreak(userId: number, dateStr: string) {
    const u = this.users.find(usr => usr.id === userId);
    if (u) {
      this.addLog('SYSTEM', `Approved leave for ${u.fullName} on ${dateStr}. Streak preserved.`, 'success');
      this.persistState();
    }
  }

  manualRepairAttendance(operatorName: string, userId: number, dateStr: string, fnStatus: any, anStatus: any) {
    const u = this.users.find(usr => usr.id === userId);
    if (u) {
      this.addLog('SYSTEM', `Manual attendance repair by ${operatorName} for ${u.fullName} on ${dateStr}.`, 'info');
      this.persistState();
    }
  }

  manualRestoreStreak(operatorName: string, userId: number, customStreak: number) {
    const u = this.users.find(usr => usr.id === userId);
    if (u) {
      u.streak = customStreak;
      this.addLog('SYSTEM', `Streak manual override by ${operatorName} for ${u.fullName} to ${customStreak} days.`, 'warning');
      this.persistState();
    }
  }

  manualGrantHonorStar(operatorName: string, userId: number, starType: 'attendance' | 'punctuality' | 'consistency' | 'dedication' | 'resilience' | 'honor' = 'honor') {
    const u = this.users.find(usr => usr.id === userId);
    if (u) {
      if (!u.stars) u.stars = { attendance: 0, punctuality: 0, consistency: 0, dedication: 0, resilience: 0, honor: 0 };
      u.stars[starType] = Math.min(5, (u.stars[starType] || 0) + 1);
      this.addLog('SYSTEM', `Granted honor star "${starType}" by ${operatorName} to ${u.fullName}.`, 'success');
      this.persistState();
    }
  }

  manualRemoveBadge(operatorName: string, userId: number, badgeName: string) {
    const u = this.users.find(usr => usr.id === userId);
    if (u) {
      u.badges = (u.badges || []).filter(b => b !== badgeName);
      this.addLog('SYSTEM', `Removed badge "${badgeName}" by ${operatorName} from ${u.fullName}.`, 'warning');
      this.persistState();
    }
  }

  manualOverrideReputationScore(operatorName: string, userId: number, newScore: number) {
    const u = this.users.find(usr => usr.id === userId);
    if (u) {
      u.reputationScore = newScore;
      this.addLog('SYSTEM', `Reputation score overridden to ${newScore}% by ${operatorName} for ${u.fullName}.`, 'warning');
      this.persistState();
    }
  }

  sendTelegramParentAlert(studentIdNumber: string, alertType: 'ABSENT' | 'HOLIDAY' | 'LEAVE', description: string) {
    const u = this.users.find(usr => usr.idNumber === studentIdNumber);
    if (u) {
      this.addLog('SECURITY', `Telegram parent alert dispatched for ${u.fullName} (${alertType}): ${description}`, 'info');
    }
  }

  ensureStationMac(id: string): string {
    const st = this.stations.find(s => s.stationId === id);
    if (st) {
      if (st.pcMacAddress && st.pcMacAddress !== 'Pending First Run') return st.pcMacAddress;
      const chars = '0123456789ABCDEF';
      const macArr = [];
      for (let i = 0; i < 6; i++) macArr.push(chars[Math.floor(Math.random() * 16)] + chars[Math.floor(Math.random() * 16)]);
      st.pcMacAddress = macArr.join(':');
      this.persistState();
      return st.pcMacAddress;
    }
    return '00:1A:2B:3C:4D:5E';
  }

  updateStationHeartbeat(id: string) {
    const st = this.stations.find(s => s.stationId === id);
    if (st) {
      st.lastHeartbeat = new Date().toISOString();
      this.persistState();
    }
  }

  processHandshake(stationId: string, macAddress: string, bypassCode?: string): { success: boolean; message: string } {
    const st = this.stations.find(s => s.stationId === stationId);
    if (st) {
      st.pcMacAddress = macAddress;
      st.status = 'UNLOCKED';
      st.lastHeartbeat = new Date().toISOString();
      this.addLog('SYNC', `Secure device handshake verified for ${stationId}.`, 'success');
      this.persistState();
      return { success: true, message: `Handshake successful for workstation ${stationId}.` };
    }
    return { success: false, message: `Workstation ${stationId} not found in central node registry.` };
  }

  manualStaffApprovedSignOn(payload: { stationId: string; studentId: string; macAddress: string; bypassCode?: string }) {
    const st = this.stations.find(s => s.stationId === payload.stationId);
    const u = this.users.find(usr => usr.idNumber === payload.studentId);
    if (st && u) {
      st.status = 'UNLOCKED';
      st.pcMacAddress = payload.macAddress;
      st.activeUserId = u.id;
      st.lastHeartbeat = new Date().toISOString();
      this.addLog('SECURITY', `Staff authorized remote sign-on bypass: ${u.fullName} on ${payload.stationId}`, 'success');
      this.persistState();
      return { success: true, message: `Workstation ${payload.stationId} unlocked remotely for ${u.fullName}.` };
    }
    return { success: false, message: 'Invalid station or student selection.' };
  }

  lockStationByWatchdog(stationId: string, idNumber: string, reason: string): boolean {
    const st = this.stations.find(s => s.stationId === stationId);
    if (st) {
      st.status = 'LOCKED';
      st.activeUserId = null;
      this.addLog('SECURITY', `Watchdog Lock: Locked ${stationId} for user ${idNumber}. Reason: ${reason}`, 'warning');
      this.persistState();
      return true;
    }
    return false;
  }

  adminToggleStation(stationId: string): StationStatus {
    const st = this.stations.find(s => s.stationId === stationId);
    if (st) {
      st.status = st.status === 'LOCKED' ? 'UNLOCKED' : 'LOCKED';
      if (st.status === 'LOCKED') st.activeUserId = null;
      this.addLog('SYSTEM', `Admin toggled station ${stationId} status to ${st.status}.`, 'info');
      this.persistState();
      return st.status;
    }
    return 'LOCKED';
  }

  adminReleaseStationHardware(stationId: string): boolean {
    const st = this.stations.find(s => s.stationId === stationId);
    if (st) {
      st.pcMacAddress = 'Pending First Run';
      st.status = 'LOCKED';
      st.activeUserId = null;
      this.addLog('SECURITY', `Admin released physical hardware bind for ${stationId}.`, 'warning');
      this.persistState();
      return true;
    }
    return false;
  }

  bindPhysicalStationHardware(stationId: string, macAddress: string): boolean {
    const st = this.stations.find(s => s.stationId === stationId);
    if (st) {
      st.pcMacAddress = macAddress;
      this.addLog('SYNC', `Bound hardware MAC ${macAddress} to station ${stationId}.`, 'success');
      this.persistState();
      return true;
    }
    return false;
  }

  getStationDevice() { return this.stationDevice; }
  setStationDevice(stationId: string) {
    const st = this.stations.find(s => s.stationId === stationId);
    const mac = st ? st.pcMacAddress : '00:1A:2B:3C:4D:5E';
    this.stationDevice = { stationId, pcMacAddress: mac, currentBypassCode: '850039' };
    this.persistState();
  }

  getFilesByStation(stationId: string): SyncFile[] {
    return this.files.filter(f => f.stationId === stationId);
  }

  addNewSyncFile(fileName: string, fileSize: number, stationId: string): SyncFile {
    const newFile: SyncFile = {
      id: `file_${Date.now()}`, name: fileName, size: fileSize,
      stationId, progress: 0, status: 'QUEUED', speed: 0, updatedAt: new Date().toISOString()
    };
    this.files.unshift(newFile);
    this.addLog('SYNC', `New file sync queue initialized for ${stationId}: ${fileName}`, 'info');
    this.persistState();
    return newFile;
  }

  tickSynchronizers() {
    let changed = false;
    this.files = this.files.map(f => {
      if (f.status === 'QUEUED') {
        changed = true;
        return { ...f, status: 'SYNCING', progress: 10, speed: Math.floor(200 + Math.random() * 800), updatedAt: new Date().toISOString() };
      } else if (f.status === 'SYNCING') {
        changed = true;
        const progressIncrement = Math.floor(10 + Math.random() * 20);
        const nextProgress = Math.min(100, f.progress + progressIncrement);
        const isCompleted = nextProgress === 100;
        if (isCompleted) this.addLog('SYNC', `Synchronized file for ${f.stationId}: ${f.name}`, 'success');
        return { ...f, progress: nextProgress, status: isCompleted ? 'COMPLETED' : 'SYNCING', speed: isCompleted ? 0 : Math.floor(400 + Math.random() * 1200), updatedAt: new Date().toISOString() };
      }
      return f;
    });
    if (changed) this.persistState();
    return changed;
  }

  addStationIssue(stationId: string, reportedBy: string, issueDescription: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): StationIssue {
    const nextId = this.issues.length > 0 ? Math.max(...this.issues.map(i => i.id)) + 1 : 1;
    const newIssue: StationIssue = { id: nextId, stationId, reportedBy, issueDescription, severity, status: 'PENDING', createdAt: new Date().toLocaleString() };
    this.issues.unshift(newIssue);
    this.addLog('SYSTEM', `Reported issue for ${stationId} (Severity: ${severity}): ${issueDescription}`, 'warning');
    this.persistState();
    return newIssue;
  }

  updateStationIssue(issueId: number, status: 'PENDING' | 'RESOLVED' | 'UNDER_REPAIR', repairNotes?: string): boolean {
    const is = this.issues.find(item => item.id === issueId);
    if (is) {
      is.status = status;
      if (repairNotes) is.repairNotes = repairNotes;
      this.addLog('SYSTEM', `Updated issue ID ${issueId} status to ${status}.`, 'info');
      this.persistState();
      return true;
    }
    return false;
  }

  addMaintenanceActivity(stationId: string, scheduledDate: string, technicianName: string, notes?: string): MaintenanceActivity {
    const nextId = this.maintenance.length > 0 ? Math.max(...this.maintenance.map(m => m.id)) + 1 : 1;
    const newM: MaintenanceActivity = { id: nextId, stationId, scheduledDate, technicianName, status: 'SCHEDULED', notes, createdAt: new Date().toLocaleString() };
    this.maintenance.unshift(newM);
    this.addLog('SYSTEM', `Scheduled maintenance for ${stationId} on ${scheduledDate} with ${technicianName}`, 'info');
    this.persistState();
    return newM;
  }

  updateMaintenanceActivity(activityId: number, status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED', notes?: string): boolean {
    const m = this.maintenance.find(item => item.id === activityId);
    if (m) {
      m.status = status;
      if (notes) m.notes = notes;
      this.addLog('SYSTEM', `Updated maintenance activity ID ${activityId} status to ${status}.`, 'info');
      this.persistState();
      return true;
    }
    return false;
  }

  getDepartments() {
    return [{ id: 'cs', name: 'Department of Computer Science', activeHODId: 101, activeHODName: 'Dr. A. Siva Prasad', actingHODId: null, actingHODName: '', inactivityDays: 0 }];
  }

  getSuccessionRecords() { return this.successionRecords; }

  triggerPermanentSuccession(deptId: string, newHodName: string, reason: string) {
    const rec: SuccessionRecord = {
      id: Date.now(),
      prevHODId: 101,
      prevHODName: 'Dr. A. Siva Prasad',
      successorId: 102,
      successorName: newHodName,
      timestamp: new Date().toLocaleString(),
      reason,
      mode: 'PERMANENT',
      deviceId: 'DEV-01',
      browser_signature: 'B-01',
      identity_hash: 'HASH-01',
      isActive: true
    };
    this.successionRecords.unshift(rec);
    this.addLog('SECURITY', `HOD SUCCESSION: Permanent HOD handover triggered to ${newHodName}. Reason: ${reason}`, 'success');
    this.persistState();
  }

  triggerTemporarySuccession(deptId: string, actingHodName: string, duration: string, reason: string) {
    const rec: SuccessionRecord = {
      id: Date.now(),
      prevHODId: 101,
      prevHODName: 'Dr. A. Siva Prasad',
      successorId: 103,
      successorName: actingHodName,
      timestamp: new Date().toLocaleString(),
      reason: `${reason} (Duration: ${duration})`,
      mode: 'TEMPORARY',
      deviceId: 'DEV-01',
      browser_signature: 'B-01',
      identity_hash: 'HASH-01',
      isActive: true
    };
    this.successionRecords.unshift(rec);
    this.addLog('SECURITY', `HOD SUCCESSION: Temporary handover to acting HOD ${actingHodName} active.`, 'warning');
    this.persistState();
  }

  triggerEmergencySuccession(deptId: string, actingHodName: string, reason: string) {
    const rec: SuccessionRecord = {
      id: Date.now(),
      prevHODId: 101,
      prevHODName: 'Dr. A. Siva Prasad',
      successorId: 104,
      successorName: actingHodName,
      timestamp: new Date().toLocaleString(),
      reason: `EMERGENCY OVERRIDE: ${reason}`,
      mode: 'EMERGENCY',
      deviceId: 'DEV-01',
      browser_signature: 'B-01',
      identity_hash: 'HASH-01',
      isActive: true
    };
    this.successionRecords.unshift(rec);
    this.addLog('SECURITY', `HOD SUCCESSION: Emergency acting HOD bypass activated for ${actingHodName}!`, 'error');
    this.persistState();
  }

  revertActingHOD(deptId: string) {
    this.addLog('SECURITY', `HOD SUCCESSION: Terminated acting HOD assignment, restored Dr. A. Siva Prasad.`, 'success');
    this.persistState();
  }

  updateDepartmentInactivity(deptId: string, days: number) {}

  getTrackingLicenses() { return this.trackingLicenses; }
  getActiveLicenseId() { return this.activeLicenseId; }
  setActiveLicenseId(id: string) {
    this.activeLicenseId = id;
    this.persistState();
  }

  getCurrentActiveLicense(): LicenseConfig {
    const matched = this.trackingLicenses.find(l => l.installationId === this.activeLicenseId);
    if (matched) return matched;
    return {
      institutionName: 'Dr. V.S. Krishna Govt Degree College (A)',
      departmentName: 'Computer Science',
      licenseOwner: 'Dr. A. Siva Prasad',
      installationId: 'CSYNC-GDC-CS-998',
      deploymentSignature: 'SHA256:CSYNC:998:SECURE',
      licenseMode: 'LICENSED',
      licenseState: 'ACTIVE',
      amcStartDate: '2026-01-01',
      amcExpiryDate: '2028-12-31',
      supportStatus: 'ENABLED',
      gracePeriodDays: 30
    };
  }

  issueOrUpdateLicense(config: Partial<LicenseConfig> & { installationId: string }): boolean {
    const index = this.trackingLicenses.findIndex(l => l.installationId === config.installationId);
    if (index >= 0) {
      Object.assign(this.trackingLicenses[index], config);
    } else {
      const newL: LicenseConfig = {
        institutionName: 'Custom College Node',
        departmentName: 'Computer Science',
        licenseOwner: 'Academic Staff',
        installationId: config.installationId,
        deploymentSignature: 'SHA256:MANUAL:GEN',
        licenseMode: config.licenseMode || 'FREE',
        licenseState: config.licenseState || 'ACTIVE',
        amcStartDate: config.amcStartDate || new Date().toISOString().split('T')[0],
        amcExpiryDate: config.amcExpiryDate || '2027-12-31',
        supportStatus: config.supportStatus || 'ENABLED',
        gracePeriodDays: config.gracePeriodDays !== undefined ? config.gracePeriodDays : 30
      };
      this.trackingLicenses.push(newL);
    }
    this.addLog('SECURITY', `License configuration processed for ${config.installationId}`, 'success');
    this.persistState();
    return true;
  }

  deleteLicense(installationId: string): boolean {
    this.trackingLicenses = this.trackingLicenses.filter(l => l.installationId !== installationId);
    this.addLog('SECURITY', `Revoked or deleted tracking license signature for ${installationId}`, 'warning');
    this.persistState();
    return true;
  }

  getLiveClasses() { return this.liveClasses; }

  createLiveClass(subject: string, topic: string, hostName: string, hostId: number): LiveClassSession {
    const newClass: LiveClassSession = {
      id: `class-${Date.now()}`, subject, topic, hostName, hostId, status: 'LIVE',
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), participantsCount: 1,
      jitsiLink: `https://meet.jit.si/csync-class-${Math.random().toString(36).substring(2, 10)}`,
      chatMessages: [{ id: `msg-welcome-${Date.now()}`, senderName: 'System Broadcast', senderRole: 'Admin', message: `Class room session initialized. Share Jitsi live link or draw directly on the public whiteboards.`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
      whiteboardStrokes: []
    };
    this.liveClasses.unshift(newClass);
    this.addLog('SYSTEM', `Live Class hosted for ${subject} - "${topic}" by ${hostName}.`, 'success');
    return newClass;
  }

  addLiveClassChatMessage(classId: string, senderName: string, senderRole: string, message: string) {
    const t = this.liveClasses.find(c => c.id === classId);
    if (t) {
      const { filteredText } = censorText(message);
      t.chatMessages.push({ id: `msg-${Date.now()}-${Math.random()}`, senderName, senderRole, message: filteredText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
      t.participantsCount = Math.min(45, t.participantsCount + 1);
    }
  }

  saveWhiteboardStroke(classId: string, stroke: WhiteboardStroke) {
    const t = this.liveClasses.find(c => c.id === classId);
    if (t) t.whiteboardStrokes.push(stroke);
  }

  clearWhiteboard(classId: string) {
    const t = this.liveClasses.find(c => c.id === classId);
    if (t) t.whiteboardStrokes = [];
  }

  endLiveClass(classId: string) {
    const t = this.liveClasses.find(c => c.id === classId);
    if (t) {
      t.status = 'ENDED';
      this.addLog('SYSTEM', `Live classroom session for "${t.topic}" has been concluded.`, 'info');
    }
  }

  requestDevDeck() {
    this.devDeckRequested = true;
    this.addLog('SYSTEM', 'Developer code triple-click pattern. Activating Dev Deck...', 'success');
  }

  checkAndResetDevDeckRequest(): boolean {
    const val = this.devDeckRequested;
    this.devDeckRequested = false;
    return val;
  }

  sendChatMessage(threadId: string, senderName: string, senderRole: string, text: string): ChatMessage {
    const { filteredText } = censorText(text);
    const newMsg: ChatMessage = { id: `msg_${Date.now()}`, threadId, senderName, senderRole, senderAvatar: senderRole === 'Admin' ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' : undefined, text: filteredText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    this.chatMessages.push(newMsg);
    const th = this.chatThreads.find(t => t.id === threadId);
    if (th) {
      th.lastMessage = filteredText;
      th.lastMessageTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    this.persistState();
    return newMsg;
  }

  createGroup(name: string, creatorName: string, members: string[]): ChatThread {
    const newThread: ChatThread = { id: `group_${Date.now()}`, name, type: 'group', avatar: '', unreadCount: 0, lastMessage: `Group created by ${creatorName}`, lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    this.chatThreads.push(newThread);
    this.persistState();
    return newThread;
  }

  createChannel(name: string, creatorName: string): ChatThread {
    const newThread: ChatThread = { id: `chan_${Date.now()}`, name: `# ${name}`, type: 'channel', avatar: '', unreadCount: 0, lastMessage: `Channel established by ${creatorName}`, lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    this.chatThreads.push(newThread);
    this.persistState();
    return newThread;
  }

  createBroadcast(name: string, creatorName: string): ChatThread {
    const newThread: ChatThread = { id: `broad_${Date.now()}`, name: `📢 ${name}`, type: 'broadcast', avatar: '', unreadCount: 0, lastMessage: `Broadcast list opened by ${creatorName}`, lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    this.chatThreads.push(newThread);
    this.persistState();
    return newThread;
  }

  createCommunity(name: string, creatorName: string): ChatThread {
    const newThread: ChatThread = { id: `comm_${Date.now()}`, name: `🌐 ${name}`, type: 'community', avatar: '', unreadCount: 0, lastMessage: `Community hub setup by ${creatorName}`, lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    this.chatThreads.push(newThread);
    this.persistState();
    return newThread;
  }

  createCustomBot(botName: string, creatorName: string, keywords: { phrase: string; response: string }[], botAvatar?: string): ChatThread {
    const newThread: ChatThread = { id: `bot_${Date.now()}`, name: `🤖 ${botName}`, type: 'bot', avatar: '', unreadCount: 0, lastMessage: `Agent AI customized by ${creatorName}`, lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    this.chatThreads.push(newThread);
    this.persistState();
    return newThread;
  }

  createOrGetDirectChatThread(targetUserId: number, currentUserName: string): ChatThread {
    const target = this.users.find(u => u.id === targetUserId);
    const name = target ? target.fullName : `User #${targetUserId}`;
    const existing = this.chatThreads.find(t => t.type === 'direct' && t.name === name);
    if (existing) return existing;
    const newThread: ChatThread = { id: `direct_${Date.now()}`, name, type: 'direct', avatar: '', unreadCount: 0, lastMessage: `Secure conversation initialized.`, lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    this.chatThreads.push(newThread);
    this.persistState();
    return newThread;
  }

  createTelegramExternalThread(contactValue: string, currentUserName: string): ChatThread {
    const newThread: ChatThread = { id: `tele_${Date.now()}`, name: `Telegram: ${contactValue}`, type: 'direct', avatar: '', unreadCount: 0, lastMessage: 'Linked external Telegram relay channel.', lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    this.chatThreads.push(newThread);
    this.persistState();
    return newThread;
  }

  fetchTelegramAvatarAsynchronously(threadId: string, contactValue: string) {}

  deleteChatThread(id: string) {
    this.chatThreads = this.chatThreads.filter(t => t.id !== id);
    this.persistState();
  }

  purgePreseededChatThreads() {
    this.chatThreads = [];
    this.persistState();
  }

  getApiProjects() { return this.apiProjects; }
  getApiRequests() { return this.apiRequests; }
  submitApiRequest(projectName: string, ownerName: string, allowedOrigins: string, reason: string) {
    const newReq = { id: `api_req_${Date.now()}`, projectName, ownerName, allowedOrigins, reason, status: 'PENDING', submittedAt: new Date().toLocaleString() };
    this.apiRequests.push(newReq);
    this.addLog('SECURITY', `API access credentials request submitted for project: ${projectName}`, 'info');
    this.persistState();
    return newReq;
  }

  approveApiRequest(id: string): boolean {
    const req = this.apiRequests.find(r => r.id === id);
    if (req) {
      req.status = 'APPROVED';
      const proj: CsyncApiProject = { id: `api_proj_${Date.now()}`, projectName: req.projectName, ownerName: req.ownerName, apiKey: `CSYNC-API-KEY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`, allowedOrigins: req.allowedOrigins, totalRequests: 0, createdAt: new Date().toISOString() };
      this.apiProjects.push(proj);
      this.addLog('SECURITY', `Approved API key credentials for ${req.projectName}. Key provisioned.`, 'success');
      this.persistState();
      return true;
    }
    return false;
  }

  rejectApiRequest(id: string, rejectionReason: string): boolean {
    const req = this.apiRequests.find(r => r.id === id);
    if (req) {
      req.status = 'REJECTED';
      req.rejectionReason = rejectionReason;
      this.addLog('SECURITY', `Rejected API access request for ID ${id}. Reason: ${rejectionReason}`, 'warning');
      this.persistState();
      return true;
    }
    return false;
  }

  createApiProject(projectName: string, ownerName: string, allowedOrigins: string): CsyncApiProject {
    const proj: CsyncApiProject = { id: `api_proj_${Date.now()}`, projectName, ownerName, apiKey: `CSYNC-API-KEY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`, allowedOrigins, totalRequests: 0, createdAt: new Date().toISOString() };
    this.apiProjects.push(proj);
    this.persistState();
    return proj;
  }

  deleteApiProject(id: string): boolean {
    this.apiProjects = this.apiProjects.filter(p => p.id !== id);
    this.persistState();
    return true;
  }

  incrementApiRequests(apiKey: string): boolean {
    const p = this.apiProjects.find(item => item.apiKey === apiKey);
    if (p) {
      p.totalRequests += 1;
      this.persistState();
      return true;
    }
    return false;
  }

  getUserStories() { return this.userStories; }
  createUserStory(title: string, authorName: string, content: string, anonymous: boolean) {
    const nextId = `story_${Date.now()}`;
    const newStory: UserStory = {
      id: nextId,
      fullName: anonymous ? 'Anonymous Student' : authorName,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      caption: `${title}: ${content}`,
      timestamp: new Date().toLocaleDateString(),
      views: 0,
      role: 'Student'
    };
    this.userStories.unshift(newStory);
    this.addLog('SYSTEM', `New dynamic student story published: "${title}"`, 'success');
    this.persistState();
    return newStory;
  }

  postJobFromAlumni(userId: number, job: Partial<JobOpportunity>) {
    const u = this.users.find(usr => usr.id === userId);
    const nextId = `job_${Date.now()}`;
    const newJob: JobOpportunity = {
      id: nextId,
      title: job.title || 'Technical Trainee',
      company: job.company || 'VSP Tech',
      location: job.location || 'Visakhapatnam',
      salary: job.salary || '₹3.5 - 5.0 LPA',
      skillsRequired: job.skillsRequired || ['Java', 'SQL'],
      description: job.description || 'Entry level software engineering position.',
      type: 'Full-time',
      category: 'Software Engineering',
      requirements: [],
      postedDate: new Date().toISOString().split('T')[0],
      applicantsCount: 0
    };
    this.jobOpportunities.unshift(newJob);
    this.addLog('SYSTEM', `New career alert: ${newJob.title} at ${newJob.company} posted.`, 'success');
    this.persistState();
    return { success: true, message: 'Career opportunity published successfully.' };
  }

  applyToJob(jobId: string, studentId: number, resumeSummary: string, resumeSkills: string[]) {
    const u = this.users.find(usr => usr.id === studentId);
    if (!u) return { success: false, message: 'Student profile not found.' };
    const newApp: JobApplication = {
      id: `app_${Date.now()}`,
      jobId,
      studentId,
      studentName: u.fullName,
      studentEmail: u.email || '',
      studentRollNumber: u.idNumber,
      resumeSummary,
      resumeSkills,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'PENDING'
    };
    this.jobApplications.push(newApp);
    this.addLog('SYSTEM', `${u.fullName} applied to career opening ID ${jobId}.`, 'info');
    this.persistState();
    return { success: true, message: 'Application submitted perfectly.' };
  }

  updateStudentResume(userId: number, resumeData: any) {
    const u = this.users.find(usr => usr.id === userId);
    if (u) {
      this.addLog('SYSTEM', `Resume and skills matrix updated for ${u.fullName}.`, 'success');
      this.persistState();
      return { success: true, message: 'Resume skills indexed successfully.' };
    }
    return { success: false, message: 'Student not found.' };
  }

  getMotherUpi() { return this.motherUpi; }
  setMotherUpi(upi: string) {
    this.motherUpi = upi;
    this.persistState();
    return { success: true, message: `Mother UPI updated to ${upi}.` };
  }

  getGatewayAutoApprove() { return this.gatewayAutoApprove; }
  setGatewayAutoApprove(val: boolean) {
    this.gatewayAutoApprove = val;
    this.persistState();
    return { success: true, message: `Gateway sandbox auto approval set to ${val}.` };
  }

  initiateMotherDeposit(senderId: number, receiverId: number, amount: number, utr: string, note?: string): { success: boolean; message: string; txId: string; referenceId: string; autoApproved: boolean } {
    const sender = this.users.find(u => u.id === senderId);
    const receiver = this.users.find(u => u.id === receiverId);
    if (!sender || !receiver) return { success: false, message: 'Sender or receiver not found.', txId: '', referenceId: '', autoApproved: false };
    const txId = `DEP-${Date.now()}`;
    const autoApp = this.gatewayAutoApprove;
    const tx: BankTransaction = { id: txId, senderId, senderName: sender.fullName, receiverId, receiverName: receiver.fullName, amount, type: 'DEPOSIT', timestamp: new Date().toLocaleString(), status: autoApp ? 'SUCCESS' : 'PENDING', referenceId: utr, description: note || 'Mother Deposit UPI clearance' };
    if (autoApp) {
      receiver.walletBalance = (receiver.walletBalance || 0) + amount;
      if (this.currentStudentUser && this.currentStudentUser.id === receiverId) this.currentStudentUser.walletBalance = receiver.walletBalance;
      this.addLog('SYSTEM', `Automated gateway clearance: ₹${amount} credited to ${receiver.fullName} (UTR ${utr}).`, 'success');
    } else {
      this.addLog('SECURITY', `Deposit pending verification: ₹${amount} from ${sender.fullName} (UTR ${utr}).`, 'warning');
    }
    this.bankTransactions.unshift(tx);
    this.persistState();
    return { success: true, message: 'Deposit initiated.', txId, referenceId: utr, autoApproved: autoApp };
  }

  depositMoney(userId: number, amount: number, description?: string) {
    const u = this.users.find(usr => usr.id === userId);
    if (u) {
      u.walletBalance = (u.walletBalance || 0) + amount;
      if (this.currentStudentUser && this.currentStudentUser.id === userId) this.currentStudentUser.walletBalance = u.walletBalance;
      const tx: BankTransaction = { id: `TX-${Date.now()}`, senderId: 1, senderName: 'Central Treasury', receiverId: userId, receiverName: u.fullName, amount, type: 'DEPOSIT', timestamp: new Date().toLocaleString(), status: 'SUCCESS', referenceId: `UTX-${Date.now()}`, description: description || 'Direct Credit' };
      this.bankTransactions.unshift(tx);
      this.persistState();
      return { success: true, message: `Deposited ₹${amount} successfully.`, balance: u.walletBalance };
    }
    return { success: false, message: 'User not found.', balance: 0 };
  }

  withdrawMoney(userId: number, amount: number, description?: string) {
    const u = this.users.find(usr => usr.id === userId);
    if (u) {
      if ((u.walletBalance || 0) < amount) return { success: false, message: 'Insufficient balance.', balance: u.walletBalance || 0 };
      u.walletBalance = (u.walletBalance || 0) - amount;
      if (this.currentStudentUser && this.currentStudentUser.id === userId) this.currentStudentUser.walletBalance = u.walletBalance;
      const tx: BankTransaction = { id: `TX-${Date.now()}`, senderId: userId, senderName: u.fullName, receiverId: 1, receiverName: 'Central Treasury', amount, type: 'WITHDRAW', timestamp: new Date().toLocaleString(), status: 'SUCCESS', referenceId: `UTX-${Date.now()}`, description: description || 'Cash Withdrawal' };
      this.bankTransactions.unshift(tx);
      this.persistState();
      return { success: true, message: `Withdrew ₹${amount} successfully.`, balance: u.walletBalance };
    }
    return { success: false, message: 'User not found.', balance: 0 };
  }

  transferMoney(senderId: number, receiverId: number, amount: number, method: 'IMPS' | 'NEFT' | 'RTGS' | 'WIRE', description?: string) {
    const sender = this.users.find(u => u.id === senderId);
    const receiver = this.users.find(u => u.id === receiverId);
    if (!sender || !receiver) return { success: false, message: 'Sender or receiver profile not found.', senderBalance: 0 };
    if ((sender.walletBalance || 0) < amount) return { success: false, message: 'Insufficient wallet balance.', senderBalance: sender.walletBalance || 0 };
    sender.walletBalance = (sender.walletBalance || 0) - amount;
    receiver.walletBalance = (receiver.walletBalance || 0) + amount;
    if (this.currentStudentUser) {
      if (this.currentStudentUser.id === senderId) this.currentStudentUser.walletBalance = sender.walletBalance;
      if (this.currentStudentUser.id === receiverId) this.currentStudentUser.walletBalance = receiver.walletBalance;
    }
    const typeStr = method === 'IMPS' ? 'TRANSFER_IMPS' : method === 'NEFT' ? 'TRANSFER_NEFT' : method === 'RTGS' ? 'TRANSFER_RTGS' : 'TRANSFER_WIRE';
    const tx: BankTransaction = { id: `TX-${Date.now()}`, senderId, senderName: sender.fullName, receiverId, receiverName: receiver.fullName, amount, type: typeStr, timestamp: new Date().toLocaleString(), status: 'SUCCESS', referenceId: `UTR-${Date.now()}`, description: `${description || 'Direct Transfer'} via ${method}` };
    this.bankTransactions.unshift(tx);
    this.addLog('SYSTEM', `Transferred ₹${amount} from ${sender.fullName} to ${receiver.fullName} via ${method}.`, 'success');
    this.persistState();
    return { success: true, message: 'Transfer completed successfully.', senderBalance: sender.walletBalance };
  }

  processUpiPayment(senderId: number, receiverVpa: string, amount: number, note?: string) {
    const sender = this.users.find(u => u.id === senderId);
    if (!sender) return { success: false, message: 'Sender profile not found.', referenceId: '' };
    if ((sender.walletBalance || 0) < amount) return { success: false, message: 'Insufficient balance to settle UPI payment.', referenceId: '' };
    const receiver = this.users.find(u => u.csyncUpi === receiverVpa || u.upiId === receiverVpa);
    sender.walletBalance = (sender.walletBalance || 0) - amount;
    if (receiver) receiver.walletBalance = (receiver.walletBalance || 0) + amount;
    if (this.currentStudentUser) {
      if (this.currentStudentUser.id === senderId) this.currentStudentUser.walletBalance = sender.walletBalance;
      if (receiver && this.currentStudentUser.id === receiver.id) this.currentStudentUser.walletBalance = receiver.walletBalance;
    }
    const refId = `UPI-${Date.now()}`;
    const tx: BankTransaction = { id: refId, senderId, senderName: sender.fullName, receiverId: receiver ? receiver.id : 0, receiverName: receiver ? receiver.fullName : receiverVpa, amount, type: 'UPI_DISPATCH', timestamp: new Date().toLocaleString(), status: 'SUCCESS', referenceId: refId, description: note || `UPI Payment to VPA ${receiverVpa}` };
    this.bankTransactions.unshift(tx);
    this.addLog('SYSTEM', `UPI Payment of ₹${amount} completed successfully from ${sender.fullName} to ${receiverVpa}.`, 'success');
    this.persistState();
    return { success: true, message: 'UPI transaction verified.', updatedUser: sender, referenceId: refId };
  }

  processCsyncUpiTransfer(payload: any) {
    return this.processUpiPayment(payload.senderId, payload.receiverVpa, payload.amount, payload.note);
  }

  approveMotherClearance(txId: string) {
    const tx = this.bankTransactions.find(t => t.id === txId);
    if (tx && tx.status === 'PENDING') {
      tx.status = 'SUCCESS';
      const receiver = this.users.find(u => u.id === tx.receiverId);
      if (receiver) {
        receiver.walletBalance = (receiver.walletBalance || 0) + tx.amount;
        if (this.currentStudentUser && this.currentStudentUser.id === tx.receiverId) this.currentStudentUser.walletBalance = receiver.walletBalance;
      }
      this.addLog('SYSTEM', `Admin manually cleared transaction ${txId}. ₹${tx.amount} credited.`, 'success');
      this.persistState();
      return { success: true, message: 'Transaction approved.' };
    }
    return { success: false, message: 'Transaction not found or already processed.' };
  }

  forceSetBalance(userId: number, amt: number) {
    const u = this.users.find(usr => usr.id === userId);
    if (u) {
      u.walletBalance = amt;
      if (this.currentStudentUser && this.currentStudentUser.id === userId) this.currentStudentUser.walletBalance = amt;
      this.addLog('SYSTEM', `Developer forced wallet balance of ${u.fullName} to ₹${amt}.`, 'warning');
      this.persistState();
      return { success: true, message: `Successfully forced balance of ${u.fullName} to ₹${amt}.` };
    }
    return { success: false, message: 'User not found.' };
  }

  forceReconcileTransaction(txId: string) {
    const tx = this.bankTransactions.find(t => t.id === txId);
    if (tx) {
      tx.status = 'SUCCESS';
      this.addLog('SYSTEM', `Forced manual reconciliation of transaction ${txId}.`, 'warning');
      this.persistState();
      return { success: true, message: `Forced manual reconciliation of transaction ${txId}.` };
    }
    return { success: false, message: 'Transaction not found.' };
  }

  submitAccountClosureRequest(userId: number, idNumber: string, email: string, reason: string) {
    const u = this.users.find(usr => usr.id === userId);
    const nextId = `cls_${Date.now()}`;
    const newReq: AccountClosureRequest = {
      id: nextId, userId, userName: u ? u.fullName : 'Academic Student', userRole: u ? u.role : 'Student',
      userUpiId: u ? u.upiId || '' : '', remainingBalance: u ? u.walletBalance || 0 : 0, disbursalChoice: 'DONATE',
      status: 'PENDING', timestamp: new Date().toLocaleString()
    };
    this.accountClosureRequests.unshift(newReq);
    this.addLog('SECURITY', `Account closure request submitted for ${u?.fullName || idNumber}`, 'warning');
    this.persistState();
    return { success: true, message: 'Closure request submitted.' };
  }

  processAccountClosureRequest(reqId: string, status: 'APPROVED' | 'REJECTED', notes?: string) {
    const req = this.accountClosureRequests.find(r => r.id === reqId);
    if (req) {
      req.status = status;
      if (notes) req.reviewedAt = notes;
      if (status === 'APPROVED') {
        const u = this.users.find(usr => usr.id === req.userId);
        if (u) {
          u.isApproved = false;
          u.approvalStatus = 'REJECTED';
        }
        this.addLog('SECURITY', `Account closure approved for ${req.userName}. Profile deactivated.`, 'error');
      } else {
        this.addLog('SECURITY', `Account closure request rejected for ${req.userName}.`, 'success');
      }
      this.persistState();
      return { success: true, message: `Account closure request ${status.toLowerCase()} successfully.` };
    }
    return { success: false, message: 'Request not found.' };
  }

  createFundraiserCampaign(title: string, creatorName: string, description: string, targetAmount: number, deadline: string) {
    const nextId = `fund_${Date.now()}`;
    const newCamp: FundraiserCampaign = {
      id: nextId, title, description, targetAmount, requiredAmountPerStudent: 10,
      targetYear: 'All', targetMajor: 'All', status: 'ACTIVE', totalCollected: 0,
      creatorId: 1, creatorName, createdAt: new Date().toLocaleDateString(), autoDebited: false
    };
    this.fundraiserCampaigns.unshift(newCamp);
    this.addLog('SYSTEM', `New fundraiser campaign created: "${title}"`, 'success');
    this.persistState();
    return newCamp;
  }

  executeFundraiserAutoDebit(campaignId: string) {
    const camp = this.fundraiserCampaigns.find(c => c.id === campaignId);
    if (!camp || camp.status !== 'ACTIVE') return { success: false, attemptedCount: 0, successCount: 0, failedCount: 0, message: 'Campaign is not active.' };
    let successCount = 0;
    let failedCount = 0;
    const debitAmount = 500;
    for (const u of this.users) {
      if (u.walletBalance && u.walletBalance >= debitAmount && u.id !== 1) {
        u.walletBalance -= debitAmount;
        camp.totalCollected += debitAmount;
        const nextContId = `cont_${Date.now()}_${Math.random()}`;
        const newCont: FundraiserContribution = {
          id: nextContId, campaignId, campaignTitle: camp.title, studentId: u.id,
          studentName: u.fullName, studentYear: u.year || '3', studentMajor: u.subject || 'CS',
          amount: debitAmount, timestamp: new Date().toLocaleString(), status: 'SUCCESS'
        };
        this.fundraiserContributions.unshift(newCont);
        successCount++;
      } else {
        failedCount++;
      }
    }
    this.addLog('SYSTEM', `Fundraiser Auto Debit Executed: Credited ₹${successCount * debitAmount} to "${camp.title}".`, 'success');
    this.persistState();
    return { success: true, attemptedCount: successCount + failedCount, successCount, failedCount, message: `Auto debit successfully debited ₹${successCount * debitAmount} from ${successCount} active accounts.` };
  }

  updateCampaignStatus(campaignId: string, status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'): boolean {
    const camp = this.fundraiserCampaigns.find(c => c.id === campaignId);
    if (camp) {
      camp.status = status;
      this.persistState();
      return true;
    }
    return false;
  }

  getPanicAlerts() { return this.panicAlerts; }
  addPanicAlert(stationId: string, reportedBy: string, details: string): PanicAlert {
    const nextId = Date.now();
    const newAlert: PanicAlert = { id: nextId, stationId, userName: reportedBy, message: details, timestamp: new Date().toLocaleTimeString(), status: 'ACTIVE' };
    this.panicAlerts.unshift(newAlert);
    this.addLog('SECURITY', `PANIC ALREADY: Emergency Panic alert raised at ${stationId} by ${reportedBy}! Details: ${details}`, 'error');
    this.persistState();
    return newAlert;
  }

  resolvePanicAlert(id: string, resolvedBy: string) {
    const numId = parseInt(id, 10);
    const alert = this.panicAlerts.find(a => a.id === numId || String(a.id) === id);
    if (alert) {
      alert.status = 'RESOLVED';
      alert.resolvedUserName = resolvedBy;
      this.addLog('SECURITY', `Panic alert ID ${id} resolved successfully by ${resolvedBy}.`, 'success');
      this.persistState();
    }
  }

  async refreshWeatherFromAPI(customLat?: number, customLon?: number) {
    try {
      const lat = customLat !== undefined ? customLat : 17.740697;
      const lon = customLon !== undefined ? customLon : 83.321251;
      let locName = 'college';
      if (Math.abs(lat - 17.898094) < 0.05) locName = 'Satellite Hub';
      else if (Math.abs(lat - 18.106691) < 0.05) locName = 'Trusted Node';
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data && data.current) {
        const temp = Math.round(data.current.temperature_2m || 28);
        const humidity = Math.round(data.current.relative_humidity_2m || 82);
        const windSpeed = Math.round(data.current.wind_speed_10m || 15);
        const code = data.current.weather_code || 0;
        const rain = data.current.rain || 0;
        let condition = 'Sunny / Clear sky';
        let umbrellaRequired = false;
        if (code === 0) condition = 'Sunny / Clear Sky';
        else if (code >= 1 && code <= 3) condition = 'Partly Cloudy';
        else if (code >= 51 && code <= 57) { condition = 'Light Coastal Drizzle'; umbrellaRequired = true; }
        else if (code >= 61 && code <= 67) { condition = 'Steady Rain Showers'; umbrellaRequired = true; }
        else if (code >= 80 && code <= 82) { condition = 'Heavy Rain / Showers'; umbrellaRequired = true; }
        else if (code >= 95) { condition = 'Severe Thunderstorm & Lightning'; umbrellaRequired = true; }
        else if (code >= 45 && code <= 48) condition = 'Oceanic Fog / Overcast';
        let heatRisk: 'LOW' | 'MODERATE' | 'SEVERE' = 'LOW';
        if (temp >= 42) heatRisk = 'SEVERE';
        else if (temp >= 37) heatRisk = 'MODERATE';
        let alertMsg = `☀️ Dynamic environmental index is clear (${temp}°C). Perfect conditions for undergraduate degree lab sessions.`;
        if (temp >= 37) alertMsg = `⚠️ ALERT: EXTREME REGIONAL HEATWAVE (temp ${temp}°C)! Hydrate inside deep computing labs!`;
        else if (umbrellaRequired || rain > 0) alertMsg = `🌧️ MET ADVISORY: Dynamic Rainfall of ${rain}mm detected. Carry an umbrella to College!`;
        this.weather = {
          temp, condition, humidity, windSpeed, umbrellaRequired, alert: alertMsg, latitude: lat, longitude: lon, locationName: locName, heatwaveRisk: heatRisk, uvIndex: temp > 35 ? (temp >= 40 ? 11 : 8) : 5, lastUpdated: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
        };
      }
    } catch (_) {}
  }

  addLog(category: 'SECURITY' | 'SYNC' | 'SYSTEM', message: string, level: 'info' | 'warning' | 'error' | 'success' = 'info') {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.systemLogs.unshift({ id: 'log_' + Math.random().toString(36).substr(2, 9), timestamp: timeStr, level, message, category });
    if (this.systemLogs.length > 100) this.systemLogs.pop();
  }

  flushDatabaseToFreshEmptyState() {
    this.users = []; this.stations = []; this.files = []; this.systemLogs = []; this.attendanceLogs = [];
    this.issues = []; this.maintenance = []; this.deviceChangeRequests = []; this.leaveRequests = [];
    this.jobOpportunities = []; this.jobApplications = []; this.chatThreads = []; this.chatMessages = [];
    this.bankTransactions = []; this.accountClosureRequests = []; this.fundraiserCampaigns = []; this.fundraiserContributions = [];
    this.discussionTopics = [];
    this.persistState();
  }

  executeSQLQuery(sql: string): { status: 'success' | 'error'; header: string[]; rows: any[][]; message: string } {
    this.addLog('SECURITY', `Developer executed raw SQL sandbox trace: ${sql.substring(0, 40)}...`, 'warning');
    return { status: 'success', header: ['Status', 'Info'], rows: [['Active', 'SQL simulation trace passed']], message: 'Query executed successfully over sandbox environment' };
  }

  async sendTelegramOtp(chatId: string, otp: string, phoneNumber: string): Promise<any> {
    const gasUrl = this.getGoogleAppsScriptUrl();
    if (gasUrl) {
      return this.fetchGas('telegram-send-otp', {
        contact: chatId,
        chatId: chatId,
        text: `Your C-Sync secure MFA verification code is: ${otp}`
      });
    } else {
      throw new Error("Google Apps Script Web App is not configured. Please paste your deployed Web App URL in the Developer Console / Database Settings to enable real Telegram OTP verification.");
    }
  }

  async fetchTelegramUpdates(): Promise<any> {
    const gasUrl = this.getGoogleAppsScriptUrl();
    if (gasUrl) {
      return this.fetchGas('telegram-chat-messages');
    } else {
      throw new Error("Google Apps Script Web App is not configured. Cannot poll for live Telegram updates.");
    }
  }

  async sendTelegramChatMessage(chatId: string, text: string): Promise<any> {
    const gasUrl = this.getGoogleAppsScriptUrl();
    if (gasUrl) {
      return this.fetchGas('telegram-chat-send', { chatId, text });
    } else {
      throw new Error("Google Apps Script Web App is not configured. Cannot transmit real-time Telegram messages.");
    }
  }

  async generateGroqContent(prompt: string): Promise<any> {
    const gasUrl = this.getGoogleAppsScriptUrl();
    if (gasUrl) {
      return this.fetchGas('groq-generate', { prompt });
    } else {
      throw new Error("Google Apps Script Web App is not configured. AI transcription is disabled.");
    }
  }

  async generateGeminiEmail(prompt: string): Promise<any> {
    const gasUrl = this.getGoogleAppsScriptUrl();
    if (gasUrl) {
      return this.fetchGas('gemini-synthesize', { prompt });
    } else {
      throw new Error("Google Apps Script Web App is not configured. Gemini email generation is disabled.");
    }
  }
}
