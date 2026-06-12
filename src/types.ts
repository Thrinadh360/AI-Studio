export type Role = 'Student' | 'Staff' | 'Admin' | 'Major Student' | 'Minor Student' | 'Alumni' | 'Guest' | 'HOD' | 'Parent';

export interface User {
  id: number;
  fullName: string;
  idNumber: string;
  role: Role;
  phoneFingerprint?: string;
  photoBlob?: string; // base64 or placeholder url
  gender?: string;
  email?: string;
  year?: string;
  batch?: string;
  subject?: string;
  parentMobile?: string;
  linkedStudentId?: string; // Parent linking helper
  reasonFor4thYear?: string;
  designation?: string;
  purpose?: string;
  mobileNumber?: string;
  password?: string;
  deviceId?: string;
  faceData?: string;
  isApproved?: boolean;
  approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
  
  // Identity Bridge properties
  device_id?: string;
  browser_signature?: string;
  identity_hash?: string;
  trust_score?: number;
  browser_type?: string;
  user_agent?: string;
  screen_resolution?: string;
  timezone?: string;
  platform?: string;
  isDeveloper?: boolean;
  isHOD?: boolean;

  // Gamification & Motivation Ecosystem Properties
  streak?: number;
  streakTier?: string;
  xp?: number;
  level?: number;
  attendanceEnergy?: number;
  reputationScore?: number;
  campusPresenceScore?: number;
  badges?: string[];
  stars?: {
    attendance: number;
    punctuality: number;
    consistency: number;
    dedication: number;
    resilience: number;
    honor: number;
  };
  digitalIdTheme?: string;
  profileFrame?: string;
  attendanceHistory?: {
    date: string; // YYYY-MM-DD
    fnStatus: 'PRESENT' | 'ABSENT' | 'APPROVED_LEAVE' | 'HOLIDAY' | 'NONE';
    anStatus: 'PRESENT' | 'ABSENT' | 'APPROVED_LEAVE' | 'HOLIDAY' | 'NONE';
    fnArrival?: string; // "09:45 AM"
    anArrival?: string; // "02:15 PM"
  }[];

  // Alumni Extra Fields
  currentJobTitle?: string;
  currentCompany?: string;
  previousExperiences?: string;
  currentAddress?: string;
  permanentAddress?: string;
  isStayingAbroad?: boolean;
  intlPhoneNumber?: string;

  // Student & Alumni Careers/Resume properties
  resumeSkills?: string[];
  resumeSummary?: string;
  resumeEducation?: string;
  resumeExperience?: string;
  resumeProjects?: string;
  resumeFileName?: string;

  // Real-world Banking & UPI properties
  walletBalance?: number;
  upiId?: string;
  bankAccountNumber?: string;
  csyncUpi?: string;
}

export interface BankTransaction {
  id: string;
  senderId: number;
  senderName: string;
  receiverId?: number;
  receiverName?: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER_IMPS' | 'TRANSFER_NEFT' | 'TRANSFER_RTGS' | 'TRANSFER_WIRE' | 'UPI_DISPATCH' | 'UPI_COLLECT';
  timestamp: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'RECONCILED';
  referenceId: string;
  description?: string;
  upiPayload?: {
    vpa: string;
    pn?: string;
    txnNote?: string;
  };
}

export interface CampusHoliday {
  id: number;
  name: string;
  date: string;
}

export interface PanicAlert {
  id: number;
  stationId: string;
  userName: string;
  message: string;
  status: 'ACTIVE' | 'RESOLVED';
  timestamp: string;
  isExtremeFemalePanic?: boolean;
  telegramDispatched?: boolean;
  latitude?: number;
  longitude?: number;
  sirenActive?: boolean;
  resolvedByFace?: boolean;
  resolvedUserName?: string;
  resolvedFaceScore?: number;
}

export type StationStatus = 'LOCKED' | 'UNLOCKED';

export interface Station {
  stationId: string; // e.g. CS-01 to CS-50
  pcMacAddress: string;
  status: StationStatus;
  activeUserId: number | null;
  activeUser?: User;
  lastHeartbeat: string;
}

export interface AttendanceLog {
  id: number;
  userId: number;
  userName: string;
  eventType: 'LOGIN' | 'LAB_ACCESS' | 'ATTENDANCE' | 'LOGOUT';
  stationId: string;
  gpsCoords: string;
  timestamp: string;
}

export interface SyncFile {
  id: string;
  name: string;
  size: number; // in bytes
  progress: number; // 0 to 100
  speed: number; // in KB/s
  status: 'QUEUED' | 'SYNCING' | 'COMPLETED' | 'FAILED';
  stationId: string;
  updatedAt: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  category: 'SECURITY' | 'SYNC' | 'SYSTEM';
}

export interface MaintenanceActivity {
  id: number;
  stationId: string;
  scheduledDate: string;
  technicianName: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

export interface StationIssue {
  id: number;
  stationId: string;
  reportedBy: string;
  issueDescription: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'RESOLVED' | 'UNDER_REPAIR';
  repairNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface SuccessionRecord {
  id: number;
  prevHODId: number;
  prevHODName: string;
  successorId: number;
  successorName: string;
  timestamp: string;
  reason: string;
  mode: 'PERMANENT' | 'TEMPORARY' | 'EMERGENCY';
  deviceId: string;
  browser_signature: string;
  identity_hash: string;
  durationDays?: number;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  activeHODId: number | null;
  activeHODName: string;
  actingHODId: number | null;
  actingHODName: string;
  inactivityDays: number;
}

export interface LicenseConfig {
  institutionName: string;
  departmentName: string;
  licenseOwner: string;
  installationId: string;
  deploymentSignature: string;
  licenseMode: 'FREE' | 'LICENSED';
  licenseState: 'ACTIVE' | 'EXPIRING' | 'EXPIRED';
  amcStartDate: string;
  amcExpiryDate: string;
  supportStatus: 'ENABLED' | 'DISABLED' | 'GRACE_PERIOD';
  gracePeriodDays: number;
}

export interface DiscussionComment {
  id: string;
  authorId: number;
  authorName: string;
  authorRole: string;
  authorPhoto?: string;
  text: string;
  timestamp: string;
  replyToCommentId?: string; // Points to another comment ID in the same topic for nested responses
  likes?: number;
}

export interface DiscussionTopic {
  id: string;
  title: string;
  description: string;
  category: 'SYLLABUS' | 'ASSIGNMENT' | 'ANNOUNCEMENT' | 'GENERAL' | 'RESEARCH';
  initiatedById: number;
  initiatedByName: string;
  initiatedByRole: string;
  initiatedByPhoto?: string;
  createdAt: string;
  comments: DiscussionComment[];
}

export interface DeviceChangeRequest {
  id: string;
  userId: number;
  userName: string;
  userRole: string;
  userEmail?: string;
  currentDeviceId?: string;
  requestedDeviceId: string;
  requestedBrowserSignature: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface LeaveRequest {
  id: string;
  userId: number;
  userName: string;
  userRole: string;
  startDate: string;
  endDate: string;
  reason: string;
  submittedToId: number; // For Student: Staff lecturer/HOD. For Staff: HOD-only (usually Dr. A. Siva Prasad, id 101)
  submittedToName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
  escalatedToHOD?: boolean; // Escalated state flag
  reviewedBy?: string;
  reviewedAt?: string;
  feedback?: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'news' | 'weather' | 'system' | 'alert';
  read: boolean;
  avatar?: string;
}

export interface MorningBrief {
  id: string;
  date: string;
  title: string;
  international: string;
  national: string;
  regional: string; // Focusing on Visakhapatnam and Andhra University
  summary: string;
}

export interface WeatherInfo {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  umbrellaRequired: boolean;
  alert?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  heatwaveRisk?: 'LOW' | 'MODERATE' | 'SEVERE';
  uvIndex?: number;
  lastUpdated?: string;
}

export interface WhiteboardStroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  tool: 'pencil' | 'eraser' | 'line' | 'rectangle';
}

export interface LiveClassSession {
  id: string;
  subject: string;
  topic: string;
  hostName: string;
  hostId: number;
  status: 'UPCOMING' | 'LIVE' | 'ENDED';
  startTime: string;
  participantsCount: number;
  jitsiLink: string;
  chatMessages: {
    id: string;
    senderName: string;
    senderRole: string;
    message: string;
    timestamp: string;
  }[];
  whiteboardStrokes: WhiteboardStroke[];
}

export interface ChatThread {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'channel' | 'bot' | 'broadcast' | 'community';
  avatar: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  isOnline?: boolean;
  lastSeen?: string;
  isTyping?: boolean;
  typingUser?: string;
  members?: string[];
  botCreatedBy?: string; // name
  botTriggerKeywords?: { phrase: string; response: string }[];
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isBot?: boolean;
}

export interface UserStory {
  id: string;
  fullName: string;
  avatar: string;
  storyImage?: string;
  storyVideo?: string;
  storyMusicTitle?: string;
  storyMusicArtist?: string;
  caption: string;
  timestamp: string;
  views: number;
  role: string;
  createdAt?: number;
  duration?: number;
  reactions?: { [key: string]: number };
  comments?: { id: string; sender: string; text: string; timestamp: string }[];
}

export interface CsyncApiProject {
  id: string;
  projectName: string;
  ownerName: string;
  apiKey: string;
  allowedOrigins: string;
  totalRequests: number;
  lastRequestAt?: string;
  createdAt: string;
}

export interface CsyncApiRequest {
  id: string;
  projectName: string;
  ownerName: string;
  allowedOrigins: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
}

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  category: 'Software Engineering' | 'Data Science' | 'Web Development' | 'Cybersecurity' | 'IT Support' | 'AI & ML';
  salary: string;
  description: string;
  requirements: string[];
  skillsRequired: string[];
  postedDate: string;
  isCustomAlumniSubmission?: boolean;
  submittedByAlumniId?: number;
  submittedByAlumniName?: string;
  applicantsCount: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  studentRollNumber: string;
  resumeSummary: string;
  resumeSkills: string[];
  appliedDate: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED';
}

export interface AccountClosureRequest {
  id: string;
  userId: number;
  userName: string;
  userRole: string;
  userUpiId: string;
  remainingBalance: number;
  disbursalChoice: 'DONATE' | 'REFUND_UPI';
  refundUpiId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface FundraiserCampaign {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  requiredAmountPerStudent: number;
  targetYear: string; // "All" or e.g. "1", "2", "3"
  targetMajor: string; // "All" or e.g. "B.Sc Computer Science"
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  totalCollected: number;
  creatorId: number;
  creatorName: string;
  createdAt: string;
  autoDebited: boolean;
}

export interface FundraiserContribution {
  id: string;
  campaignId: string;
  campaignTitle: string;
  studentId: number;
  studentName: string;
  studentYear: string;
  studentMajor: string;
  amount: number;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
}






