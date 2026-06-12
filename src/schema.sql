-- ==========================================
-- C-SYNC COMPREHENSIVE PRODUCTION SCHEMA
-- TARGET DATABASE: PostgreSQL 14+ / MySQL 8.x Compatible
-- C-SYNC Biometric Workstation Geofence Network Setup
-- ==========================================

BEGIN;

-- 1. UTILITY AND SCHEMA EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
CREATE TYPE user_role AS ENUM (
  'Student', 'Staff', 'Admin', 'Major Student', 'Minor Student', 'Alumni', 'Guest', 'HOD', 'Parent'
);

CREATE TYPE approval_status AS ENUM (
  'APPROVED', 'PENDING', 'REJECTED'
);

CREATE TYPE session_status AS ENUM (
  'PRESENT', 'ABSENT', 'APPROVED_LEAVE', 'HOLIDAY', 'NONE'
);

CREATE TYPE alert_severity AS ENUM (
  'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
);

CREATE TYPE alert_state AS ENUM (
  'ACTIVE', 'RESOLVED'
);

CREATE TYPE station_state AS ENUM (
  'LOCKED', 'UNLOCKED'
);

CREATE TYPE file_sync_status AS ENUM (
  'QUEUED', 'SYNCING', 'COMPLETED', 'FAILED'
);

CREATE TYPE sys_log_level AS ENUM (
  'info', 'warning', 'error', 'success'
);

CREATE TYPE sys_log_category AS ENUM (
  'SECURITY', 'SYNC', 'SYSTEM'
);

CREATE TYPE job_status AS ENUM (
  'OPEN', 'CLOSED', 'ARCHIVED'
);

CREATE TYPE app_status AS ENUM (
  'SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED'
);

CREATE TYPE succession_mode AS ENUM (
  'PERMANENT', 'TEMPORARY', 'EMERGENCY'
);


-- 3. USERS MASTER TABLE
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  id_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. Roll Number / Emp ID
  role user_role DEFAULT 'Student' NOT NULL,
  password VARCHAR(255) NOT NULL, -- Hashed passwords
  email VARCHAR(120) UNIQUE,
  mobile_number VARCHAR(20) NOT NULL,
  gender VARCHAR(15),
  
  -- Student specific academic parameters
  year VARCHAR(10),
  batch VARCHAR(20),
  subject VARCHAR(100),
  reason_for_4th_year TEXT,
  
  -- Host parent liaison variables (Telegram integrations)
  parent_mobile VARCHAR(20),
  linked_student_id VARCHAR(50), -- Binds parent roles to student roll numbers
  
  -- Biometric & Device compliance tracking
  phone_fingerprint VARCHAR(100), -- Browser device signature hash
  device_id VARCHAR(255),          -- Physical hardware ID
  face_data TEXT,                  -- Base64 or tensor coordinate model
  photo_blob TEXT,                 -- Profile base64 visual
  is_approved BOOLEAN DEFAULT FALSE,
  approval_status_val approval_status DEFAULT 'PENDING',
  
  -- Security Identity Bridge signatures
  browser_signature VARCHAR(255),
  identity_hash VARCHAR(64),
  trust_score INTEGER DEFAULT 80,
  browser_type VARCHAR(100),
  user_agent TEXT,
  screen_resolution VARCHAR(30),
  timezone VARCHAR(50),
  platform VARCHAR(50),
  is_developer BOOLEAN DEFAULT FALSE,
  is_hod BOOLEAN DEFAULT FALSE,

  -- Gamification, XP Loop & Streak Registers
  streak INTEGER DEFAULT 0,
  streak_tier VARCHAR(50) DEFAULT 'Newcomer',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  attendance_energy INTEGER DEFAULT 100,
  reputation_score INTEGER DEFAULT 100,
  campus_presence_score INTEGER DEFAULT 0,
  badges VARCHAR(100)[], -- List of badges earned
  
  -- Digital ID themes and visual customization overrides
  digital_id_theme VARCHAR(50) DEFAULT 'cyberpunk',
  profile_frame VARCHAR(50),

  -- Careers / Alumni placements track
  current_job_title VARCHAR(150),
  current_company VARCHAR(150),
  previous_experiences TEXT,
  current_address TEXT,
  permanent_address TEXT,
  is_staying_abroad BOOLEAN DEFAULT FALSE,
  intl_phone_number VARCHAR(30),
  
  -- Resumes / Skills JSON data
  resume_summary TEXT,
  resume_skills VARCHAR(100)[],
  resume_education TEXT,
  resume_experience TEXT,
  resume_projects TEXT,
  resume_file_name VARCHAR(255),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 4. ATTENDANCE HISTORY TRANSACTIONAL LEDGER
CREATE TABLE attendance_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  fn_status session_status DEFAULT 'NONE' NOT NULL,
  an_status session_status DEFAULT 'NONE' NOT NULL,
  fn_arrival VARCHAR(15), -- "09:42 AM" Format
  an_arrival VARCHAR(15), -- "02:18 PM" Format
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (user_id, date)
);


-- 5. WORKSTATION TERMINALS TABLE
CREATE TABLE stations (
  station_id VARCHAR(30) PRIMARY KEY, -- e.g. "CS-01", "CS-02"
  pc_mac_address VARCHAR(50) UNIQUE NOT NULL,
  status station_state DEFAULT 'LOCKED' NOT NULL,
  active_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 6. BIOMETRIC ACCESS & ATTENDANCE TRANSACTION LOGS
CREATE TABLE attendance_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  user_name VARCHAR(120) NOT NULL,
  event_type VARCHAR(25) NOT NULL, -- "LOGIN", "LAB_ACCESS", "ATTENDANCE"
  station_id VARCHAR(30) REFERENCES stations(station_id) ON DELETE SET NULL,
  gps_coords VARCHAR(100),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 7. PANIC ALERTS MASTER DATABASE (EMERGENCY RESPONSE)
CREATE TABLE panic_alerts (
  id SERIAL PRIMARY KEY,
  station_id VARCHAR(30) NOT NULL,
  user_name VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  status alert_state DEFAULT 'ACTIVE' NOT NULL,
  is_extreme_female_panic BOOLEAN DEFAULT FALSE,
  telegram_dispatched BOOLEAN DEFAULT FALSE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  siren_active BOOLEAN DEFAULT FALSE,
  resolved_by_face BOOLEAN DEFAULT FALSE,
  resolved_user_name VARCHAR(120),
  resolved_face_score REAL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE
);


-- 8. SYNC FILES DISPATCH CHANNELS
CREATE TABLE sync_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  size BIGINT DEFAULT 0,
  progress INTEGER DEFAULT 0,
  speed INTEGER DEFAULT 0, -- Kilobytes / Second
  status file_sync_status DEFAULT 'QUEUED' NOT NULL,
  station_id VARCHAR(30) REFERENCES stations(station_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 9. USER LEAVE APPLICATIONS QUEUE
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  student_name VARCHAR(120) NOT NULL,
  roll_number VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status approval_status DEFAULT 'PENDING' NOT NULL,
  attachment_url VARCHAR(255),
  submitted_to_id INTEGER REFERENCES users(id),
  submitted_to_name VARCHAR(120),
  security_hash VARCHAR(64),
  hod_biometric_vouch BOOLEAN DEFAULT FALSE,
  parent_sms_notified BOOLEAN DEFAULT FALSE,
  review_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE
);


-- 10. PLACEMENTS & CAREERS VACANCIES
CREATE TABLE job_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company VARCHAR(150) NOT NULL,
  title VARCHAR(150) NOT NULL,
  location VARCHAR(120) NOT NULL,
  salary VARCHAR(50),
  description TEXT NOT NULL,
  requirements TEXT[],
  skills VARCHAR(50)[],
  status job_status DEFAULT 'OPEN',
  is_international BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 11. PLACEMENT CANDIDATE APPLICATIONS
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES job_opportunities(id) ON DELETE CASCADE NOT NULL,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  student_name VARCHAR(120) NOT NULL,
  student_roll VARCHAR(50) NOT NULL,
  resume_summary TEXT,
  resume_skills VARCHAR(50)[],
  status app_status DEFAULT 'SUBMITTED',
  reviewed_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 12. STATION FAULT & BROKEN HARDWARE REPORTS
CREATE TABLE station_issues (
  id SERIAL PRIMARY KEY,
  station_id VARCHAR(30) REFERENCES stations(station_id) ON DELETE CASCADE NOT NULL,
  reported_by VARCHAR(120) NOT NULL,
  issue_description TEXT NOT NULL,
  severity alert_severity DEFAULT 'LOW' NOT NULL,
  status VARCHAR(25) DEFAULT 'PENDING' NOT NULL, -- PENDING / UNDER_REPAIR / RESOLVED
  repair_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE
);


-- 13. PREVENTATIVE MAINTENANCE ACTIVITIES JOURNAL
CREATE TABLE maintenance_activities (
  id SERIAL PRIMARY KEY,
  station_id VARCHAR(30) REFERENCES stations(station_id) ON DELETE CASCADE NOT NULL,
  scheduled_date DATE NOT NULL,
  technician_name VARCHAR(120) NOT NULL,
  status VARCHAR(25) DEFAULT 'SCHEDULED' NOT NULL, -- SCHEDULED / IN_PROGRESS / COMPLETED / CANCELLED
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 14. IN-APP AND TELEGRAM SECURITY AUDIT CHANNELS
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level sys_log_level DEFAULT 'info' NOT NULL,
  category sys_log_category DEFAULT 'SYSTEM' NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 15. HOD SUCCESSION TRANSITION LOGS
CREATE TABLE succession_records (
  id SERIAL PRIMARY KEY,
  prev_hod_id INTEGER REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
  prev_hod_name VARCHAR(120) NOT NULL,
  successor_id INTEGER REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
  successor_name VARCHAR(120) NOT NULL,
  reason TEXT NOT NULL,
  mode succession_mode DEFAULT 'TEMPORARY' NOT NULL,
  device_id VARCHAR(255) NOT NULL,
  browser_signature VARCHAR(255) NOT NULL,
  identity_hash VARCHAR(64) NOT NULL,
  duration_days INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 16. HOLIDAY RECONCILIATION INDEX DATA
CREATE TABLE campus_holidays (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  date DATE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- PERFORMANCE INDEXES & OPTIMIZATIONS
-- ==========================================

CREATE INDEX idx_users_id_number ON users(id_number);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_linked_student ON users(linked_student_id);
CREATE INDEX idx_attendance_user_date ON attendance_history(user_id, date);
CREATE INDEX idx_attendance_logs_timestamp ON attendance_logs(timestamp);
CREATE INDEX idx_leave_requests_student ON leave_requests(student_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_job_applications_student ON job_applications(student_id);
CREATE INDEX idx_panic_alerts_status ON panic_alerts(status);
CREATE INDEX idx_system_logs_level_cat ON system_logs(level, category);


-- ==========================================
-- TRIGGER DEFINITIONS FOR REACTION LOGS
-- ==========================================

-- Trigger to auto-update timestamp of user records
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_stations_modtime BEFORE UPDATE ON stations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


-- ==========================================
-- SEED DATASETS INSERT STATS
-- ==========================================

-- 1. ADHOC DEFAULT USERS
INSERT INTO users (full_name, id_number, role, password, email, mobile_number, is_approved, approval_status_val, is_hod, is_developer, streak, xp, level) VALUES
('Thrinadh Marukonda', '8500394696', 'Admin', 'admin_hash_pass_verify', 'marukondathrinadh@gmail.com', '8500394696', TRUE, 'APPROVED', TRUE, TRUE, 12, 1200, 4);

-- 2. SAMPLE STATIONS OR TERMINALS
INSERT INTO stations (station_id, pc_mac_address, status, last_heartbeat) VALUES
('CS-01', '38:00:25:85:B7:D6', 'UNLOCKED', NOW()),
('CS-02', '3E:F2:1A:67:B2:90', 'LOCKED', NOW() - INTERVAL '1 hour'),
('CS-34', 'A1:C2:E3:D4:B5:10', 'LOCKED', NOW());

-- 3. ATTENDANCE HISTORY SEEDS
INSERT INTO attendance_history (user_id, date, fn_status, an_status, fn_arrival, an_arrival) VALUES
(1, CURRENT_DATE - INTERVAL '1 day', 'PRESENT', 'PRESENT', '09:20 AM', '02:05 PM');

-- 4. CAMPUS HOLIDAYS SEED
INSERT INTO campus_holidays (name, date) VALUES
('Monsoon Cyclonic Precautionary Holiday', '2026-06-15'),
('Eid-al-Adha Break', '2026-06-29'),
('Mahatma Gandhi Jayanti Holiday', '2026-10-02');

COMMIT;
