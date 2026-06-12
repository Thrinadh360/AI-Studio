-- ====================================================================
-- C-SYNC COMPREHENSIVE PRODUCTION SCHEMA
-- TARGET DATABASE: MySQL 8.0+ / MariaDB 10.5+ Compatible
-- AUTHOR: C-Sync Ecosystem Core Engine
-- DESCRIPTION: Highly optimized production database layout for the
-- C-Sync Smart Campus Geofenced Biometry Application. Handles students,
-- staff, parents, HOD succession transitions, workstation locking nodes,
-- panic emergency responses, and UPI fundraiser campaigns.
-- ====================================================================

-- Create database if not exists (Uncomment in multi-tenant environment)
-- CREATE DATABASE IF NOT EXISTS csync_db;
-- USE csync_db;

-- Disable foregn key checks during setup to cleanly drop if rebuilding
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables to ensure a clean slate if reapplied
DROP TABLE IF EXISTS fundraiser_contributions;
DROP TABLE IF EXISTS fundraiser_campaigns;
DROP TABLE IF EXISTS bank_utrs;
DROP TABLE IF EXISTS campus_holidays;
DROP TABLE IF EXISTS succession_records;
DROP TABLE IF EXISTS system_logs;
DROP TABLE IF EXISTS maintenance_activities;
DROP TABLE IF EXISTS station_issues;
DROP TABLE IF EXISTS job_applications;
DROP TABLE IF EXISTS job_opportunities;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS sync_files;
DROP TABLE IF EXISTS panic_alerts;
DROP TABLE IF EXISTS attendance_logs;
DROP TABLE IF EXISTS stations;
DROP TABLE IF EXISTS attendance_history;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;


-- ==========================================
-- 1. MASTER USERS TABLE
-- ==========================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  id_number VARCHAR(50) NOT NULL, -- e.g., Roll number, Staff ID, Child ID
  role ENUM('Student', 'Staff', 'Admin', 'Major Student', 'Minor Student', 'Alumni', 'Guest', 'HOD', 'Parent') DEFAULT 'Student' NOT NULL,
  password VARCHAR(255) NOT NULL, -- Cryptographically hashed credentials
  email VARCHAR(120) NULL,
  mobile_number VARCHAR(25) NOT NULL,
  gender VARCHAR(15) DEFAULT 'Male',
  designation VARCHAR(150) NULL,

  -- Student Academic Metadata
  year VARCHAR(10) NULL,
  batch VARCHAR(50) NULL,
  subject VARCHAR(100) NULL,
  reason_for_4th_year TEXT NULL,

  -- Host Parent Liaison Parameters (Telegraph Node integrations)
  parent_mobile VARCHAR(25) NULL,
  linked_student_id VARCHAR(50) NULL, -- Roll number of target student

  -- Advanced Biometric & Device Binding compliance
  phone_fingerprint VARCHAR(100) NULL, -- Device browser identity signature
  device_id VARCHAR(255) NULL,          -- Physical/Hardware binding UUID
  
  -- CRITICAL: PostgreSQL "TEXT" stores base64 images, but in MySQL, TEXT has a 64KB limit. 
  -- We must use MEDIUMTEXT/LONGTEXT here to reliably store high-resolution profile pictures 
  -- and neural land-marking descriptors without truncation!
  face_data MEDIUMTEXT NULL,            -- Base64 facial descriptors/landmark coordinate arrays
  photo_blob LONGTEXT NULL,             -- Sovereign avatar JPEG/PNG source stream

  is_approved BOOLEAN DEFAULT FALSE,
  approval_status_val ENUM('APPROVED', 'PENDING', 'REJECTED') DEFAULT 'PENDING',

  -- Security Identity Bridge signatures
  browser_signature VARCHAR(255) NULL,
  identity_hash VARCHAR(64) NULL,
  trust_score INT DEFAULT 80,
  browser_type VARCHAR(100) NULL,
  user_agent TEXT NULL,
  screen_resolution VARCHAR(30) NULL,
  timezone VARCHAR(50) NULL,
  platform VARCHAR(50) NULL,
  is_developer BOOLEAN DEFAULT FALSE,
  is_hod BOOLEAN DEFAULT FALSE,

  -- Gamification, XP Loops & Attendance Streak Registers
  streak INT DEFAULT 0,
  streak_tier VARCHAR(50) DEFAULT 'Newcomer',
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  attendance_energy INT DEFAULT 100,
  reputation_score INT DEFAULT 100,
  campus_presence_score INT DEFAULT 0,
  
  -- MySQL does not have native arrays. We use the JSON data type to provide 
  -- robust, indexable list storage for active user badges.
  badges JSON NULL, -- List of earned badges (e.g. ["Streak Champ", "Bio Verifier"])

  -- Digital ID Custom Overrides
  digital_id_theme VARCHAR(50) DEFAULT 'cyberpunk',
  profile_frame VARCHAR(50) NULL,

  -- Placements & Careers Portal Parameters (Alumni track)
  current_job_title VARCHAR(150) NULL,
  current_company VARCHAR(150) NULL,
  previous_experiences TEXT NULL,
  current_address TEXT NULL,
  permanent_address TEXT NULL,
  is_staying_abroad BOOLEAN DEFAULT FALSE,
  intl_phone_number VARCHAR(30) NULL,

  -- Interactive resumes JSON templates
  resume_summary TEXT NULL,
  resume_skills JSON NULL, -- Array of skills (e.g. ["React", "Go"])
  resume_education TEXT NULL,
  resume_experience TEXT NULL,
  resume_projects TEXT NULL,
  resume_file_name VARCHAR(255) NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_id_number (id_number),
  UNIQUE KEY uq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 2. ATTENDANCE HISTORY LEDGER
-- ==========================================
CREATE TABLE attendance_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  fn_status ENUM('PRESENT', 'ABSENT', 'APPROVED_LEAVE', 'HOLIDAY', 'NONE') DEFAULT 'NONE' NOT NULL,
  an_status ENUM('PRESENT', 'ABSENT', 'APPROVED_LEAVE', 'HOLIDAY', 'NONE') DEFAULT 'NONE' NOT NULL,
  fn_arrival VARCHAR(15) NULL, -- "09:12 AM" Format
  an_arrival VARCHAR(15) NULL, -- "02:25 PM" Format
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_user_date (user_id, date),
  CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 3. WORKSTATION TERMINAL NODES
-- ==========================================
CREATE TABLE stations (
  station_id VARCHAR(30) PRIMARY KEY, -- e.g. "CS-01", "CS-34"
  pc_mac_address VARCHAR(50) NOT NULL,
  status ENUM('LOCKED', 'UNLOCKED') DEFAULT 'LOCKED' NOT NULL,
  active_user_id INT NULL,
  last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_mac_address (pc_mac_address),
  CONSTRAINT fk_station_active_user FOREIGN KEY (active_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 4. BIOMETRIC LOGS AND TRANSACTION AUDITS
-- ==========================================
CREATE TABLE attendance_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  user_name VARCHAR(120) NOT NULL,
  event_type VARCHAR(25) NOT NULL, -- "LOGIN", "LAB_ACCESS", "ATTENDANCE"
  station_id VARCHAR(30) NULL,
  gps_coords VARCHAR(100) NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_log_station FOREIGN KEY (station_id) REFERENCES stations (station_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 5. EMERGENCY RESPONSE PANIC ALERTS MASTER
-- ==========================================
CREATE TABLE panic_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  station_id VARCHAR(30) NOT NULL,
  user_name VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('ACTIVE', 'RESOLVED') DEFAULT 'ACTIVE' NOT NULL,
  is_extreme_female_panic BOOLEAN DEFAULT FALSE,
  telegram_dispatched BOOLEAN DEFAULT FALSE,
  latitude DOUBLE NULL,
  longitude DOUBLE NULL,
  siren_active BOOLEAN DEFAULT FALSE,
  resolved_by_face BOOLEAN DEFAULT FALSE,
  resolved_user_name VARCHAR(120) NULL,
  resolved_face_score REAL NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL DEFAULT NULL,

  CONSTRAINT fk_panic_station FOREIGN KEY (station_id) REFERENCES stations (station_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 6. FILES REAL-TIME DISPATCH AND SYNC
-- ==========================================
CREATE TABLE sync_files (
  -- Cast UUID to VARCHAR(36) in MySQL 8.0, using trigger or application-level UUID strings.
  id VARCHAR(36) PRIMARY KEY, 
  name VARCHAR(255) NOT NULL,
  size BIGINT DEFAULT 0,
  progress INT DEFAULT 0,
  speed INT DEFAULT 0, -- Kilobytes / Second
  status ENUM('QUEUED', 'SYNCING', 'COMPLETED', 'FAILED') DEFAULT 'QUEUED' NOT NULL,
  station_id VARCHAR(30) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_sync_station FOREIGN KEY (station_id) REFERENCES stations (station_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 7. LEAVE REQUEST APPLICATIONS QUEUE
-- ==========================================
CREATE TABLE leave_requests (
  id VARCHAR(36) PRIMARY KEY, -- Standard UUID representation
  student_id INT NOT NULL,
  student_name VARCHAR(120) NOT NULL,
  roll_number VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('APPROVED', 'PENDING', 'REJECTED') DEFAULT 'PENDING' NOT NULL,
  attachment_url VARCHAR(255) NULL,
  submitted_to_id INT NULL,
  submitted_to_name VARCHAR(120) NULL,
  security_hash VARCHAR(64) NULL,
  hod_biometric_vouch BOOLEAN DEFAULT FALSE,
  parent_sms_notified BOOLEAN DEFAULT FALSE,
  review_note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL DEFAULT NULL,

  CONSTRAINT fk_leave_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_leave_reviewer FOREIGN KEY (submitted_to_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 8. PLACEMENTS CAREERS PORTAL VACANCIES
-- ==========================================
CREATE TABLE job_opportunities (
  id VARCHAR(36) PRIMARY KEY,
  company VARCHAR(150) NOT NULL,
  title VARCHAR(150) NOT NULL,
  location VARCHAR(120) NOT NULL,
  salary VARCHAR(50) NULL,
  description TEXT NOT NULL,
  requirements JSON NULL, -- Array of text details (e.g. ["Must have laptop", "CGPA > 8.0"])
  skills JSON NULL,       -- Array of target skills (e.g. ["Rust", "PyTorch"])
  status ENUM('OPEN', 'CLOSED', 'ARCHIVED') DEFAULT 'OPEN',
  is_international BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 9. CANDIDATE APPLICATIONS
-- ==========================================
CREATE TABLE job_applications (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  student_id INT NOT NULL,
  student_name VARCHAR(120) NOT NULL,
  student_roll VARCHAR(50) NOT NULL,
  resume_summary TEXT NULL,
  resume_skills JSON NULL, -- Array of skills matching candidates
  status ENUM('SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED') DEFAULT 'SUBMITTED' NOT NULL,
  reviewed_note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_appl_job FOREIGN KEY (job_id) REFERENCES job_opportunities (id) ON DELETE CASCADE,
  CONSTRAINT fk_appl_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 10. FAULT HARDWARE AND TERMINAL ISSUES
-- ==========================================
CREATE TABLE station_issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  station_id VARCHAR(30) NOT NULL,
  reported_by VARCHAR(120) NOT NULL,
  issue_description TEXT NOT NULL,
  severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'LOW' NOT NULL,
  status VARCHAR(25) DEFAULT 'PENDING' NOT NULL, -- PENDING / UNDER_REPAIR / RESOLVED
  repair_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL DEFAULT NULL,

  CONSTRAINT fk_issue_station FOREIGN KEY (station_id) REFERENCES stations (station_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 11. PREVENTATIVE UPKEEP ACTIVITIES
-- ==========================================
CREATE TABLE maintenance_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  station_id VARCHAR(30) NOT NULL,
  scheduled_date DATE NOT NULL,
  technician_name VARCHAR(120) NOT NULL,
  status VARCHAR(25) DEFAULT 'SCHEDULED' NOT NULL, -- SCHEDULED / IN_PROGRESS / COMPLETED / CANCELLED
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_maint_station FOREIGN KEY (station_id) REFERENCES stations (station_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 12. AUDIT CHANNELS AND LOGGER TELEGRAMS
-- ==========================================
CREATE TABLE system_logs (
  id VARCHAR(36) PRIMARY KEY,
  level ENUM('info', 'warning', 'error', 'success') DEFAULT 'info' NOT NULL,
  category ENUM('SECURITY', 'SYNC', 'SYSTEM') DEFAULT 'SYSTEM' NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 13. HOD SUCCESSION TRANSITION RECORDS
-- ==========================================
CREATE TABLE succession_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prev_hod_id INT NOT NULL,
  prev_hod_name VARCHAR(120) NOT NULL,
  successor_id INT NOT NULL,
  successor_name VARCHAR(120) NOT NULL,
  reason TEXT NOT NULL,
  mode ENUM('PERMANENT', 'TEMPORARY', 'EMERGENCY') DEFAULT 'TEMPORARY' NOT NULL,
  device_id VARCHAR(255) NOT NULL,
  browser_signature VARCHAR(255) NOT NULL,
  identity_hash VARCHAR(64) NOT NULL,
  duration_days INT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_successor_prev FOREIGN KEY (prev_hod_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_successor_curr FOREIGN KEY (successor_id) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 14. INSTITUTIONAL HOLIDAYS REGISTER
-- ==========================================
CREATE TABLE campus_holidays (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_holiday_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 15. BANK UPI TRANSACTIONS UTR LEDGER
-- ==========================================
CREATE TABLE bank_utrs (
  utr VARCHAR(50) PRIMARY KEY,
  amount DOUBLE PRECISION NOT NULL,
  cleared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  bank_reference VARCHAR(150) NULL,
  recipient_upi VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 16. FUNDRAISER CAMPAIGNS REGISTER
-- ==========================================
CREATE TABLE fundraiser_campaigns (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  target_amount DOUBLE PRECISION NOT NULL,
  required_amount_per_student DOUBLE PRECISION NOT NULL,
  target_year VARCHAR(15) DEFAULT 'All', -- e.g. "All", "4"
  target_major VARCHAR(100) DEFAULT 'All',
  status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE' NOT NULL,
  total_collected DOUBLE PRECISION DEFAULT 0.0,
  creator_id INT NOT NULL,
  creator_name VARCHAR(120) NOT NULL,
  auto_debited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_campaign_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 17. FUNDRAISER CONTRIBUTIONS TRANSACTION RECORD
-- ==========================================
CREATE TABLE fundraiser_contributions (
  id VARCHAR(36) PRIMARY KEY,
  campaign_id VARCHAR(36) NOT NULL,
  campaign_title VARCHAR(150) NOT NULL,
  student_id INT NOT NULL,
  student_name VARCHAR(120) NOT NULL,
  student_year VARCHAR(15) NOT NULL,
  student_major VARCHAR(100) NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('SUCCESS', 'FAILED') DEFAULT 'SUCCESS' NOT NULL,
  error_message TEXT NULL,

  CONSTRAINT fk_contrib_campaign FOREIGN KEY (campaign_id) REFERENCES fundraiser_campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_contrib_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ====================================================================
-- PERFORMANCE INDEXES & QUERY OPTIMIZATIONS
-- ====================================================================
CREATE INDEX idx_users_lookup ON users (id_number, role, is_approved);
CREATE INDEX idx_users_linked_student ON users (linked_student_id);
CREATE INDEX idx_attendance_user_lookup ON attendance_history (user_id, date);
CREATE INDEX idx_logs_timestamp ON attendance_logs (timestamp);
CREATE INDEX idx_panic_alerts_status ON panic_alerts (status);
CREATE INDEX idx_sync_station_queued ON sync_files (station_id, status);
CREATE INDEX idx_leave_requests_student_status ON leave_requests (student_id, status);
CREATE INDEX idx_job_applications_search ON job_applications (job_id, student_id, status);
CREATE INDEX idx_system_logs_lookup ON system_logs (level, category);


-- ====================================================================
-- SEED VALUES FOR THE C-SYNC ECOSYSTEM
-- ====================================================================

-- 1. ADHOC DEFAULT USERS (Includes Sovereign Admin developer Thrinadh Marukonda)
INSERT INTO users (
  full_name, id_number, role, password, email, mobile_number, gender, 
  is_approved, approval_status_val, is_hod, is_developer, streak, xp, level, badges
) VALUES (
  'Thrinadh Marukonda', 
  '8500394696', 
  'Admin', 
  'admin_hash_pass_verify', 
  'marukondathrinadh@gmail.com', 
  '8500394696', 
  'Male', 
  TRUE, 
  'APPROVED', 
  TRUE, 
  TRUE, 
  12, 
  1200, 
  4,
  '["Sovereign Creator", "System Admin", "Biometric Dev"]'
);

-- 2. SAMPLE WORKSTATIONS TERMINAL NODES
INSERT INTO stations (station_id, pc_mac_address, status, active_user_id) VALUES
('CS-01', '00:1A:2B:3C:4D:5E', 'UNLOCKED', 1),
('CS-02', '3E:F2:1A:67:B2:90', 'LOCKED', NULL),
('CS-34', 'A1:C2:E3:D4:B5:10', 'LOCKED', NULL);

-- 3. HISTORIC RECONCILIATION HOLIDAYS
INSERT INTO campus_holidays (name, date) VALUES
('Monsoon Cyclonic Precautionary Holiday', '2026-06-15'),
('Eid-al-Adha Break', '2026-06-29'),
('Mahatma Gandhi Jayanti Holiday', '2026-10-02');

-- 4. ATTENDANCE HISTORY TRANSACTION FOR TESTING
INSERT INTO attendance_history (user_id, date, fn_status, an_status, fn_arrival, an_arrival) VALUES
(1, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'PRESENT', 'PRESENT', '09:20 AM', '02:05 PM');

-- Verify status report
SELECT 'C-Sync Database Schema successfully deployed to MySQL/MariaDB!' AS confirmation;
