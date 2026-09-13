-- ============================================================================
-- 001_initial_schema.sql: Core Schema & Enums for DOS Club TalentOS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE cohort_type AS ENUM ('B2B', 'B2C');
CREATE TYPE session_mode AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');
CREATE TYPE submission_type AS ENUM (
  'NONE',
  'GITHUB_REPO',
  'PROJECT_URL',
  'DOCUMENT',
  'IMAGE',
  'VIDEO',
  'EXTERNAL_ASSESSMENT',
  'FORM_RESPONSE',
  'OTHER'
);

CREATE TYPE submission_status AS ENUM (
  'NOT_REQUIRED',
  'PENDING',
  'SUBMITTED',
  'SUBMITTED_LATE',
  'REVIEWED',
  'RESUBMISSION_REQUESTED'
);

CREATE TYPE attendance_status AS ENUM (
  'NOT_STARTED',
  'CHECKED_IN',
  'LATE',
  'PARTIAL',
  'COMPLETED',
  'ABSENT_UNCONFIRMED',
  'ABSENT_CONFIRMED',
  'EXCUSED',
  'MANUALLY_CONFIRMED'
);

CREATE TYPE attendance_source AS ENUM (
  'QR_SCAN',
  'TRAINER_MANUAL',
  'ADMIN_OVERRIDE',
  'COLLEGE_CONFIRMED'
);

CREATE TYPE skill_maturity AS ENUM (
  'INTRODUCED',
  'EXPLORED',
  'APPLIED',
  'DEMONSTRATED',
  'CONSISTENTLY_DEMONSTRATED'
);

CREATE TYPE cert_status AS ENUM (
  'PENDING_VERIFICATION',
  'VERIFIED',
  'REJECTED'
);

-- 2. TABLES
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  contact_email TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  default_lat NUMERIC,
  default_lng NUMERIC,
  geofence_radius_meters INTEGER NOT NULL DEFAULT 200,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  type cohort_type NOT NULL DEFAULT 'B2C',
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cohort_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 40,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  group_id UUID NOT NULL REFERENCES cohort_groups(id) ON DELETE RESTRICT,
  dos_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  course TEXT,
  department TEXT,
  year_of_study INTEGER,
  avatar_url TEXT,
  baseline_assessment_notes TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  trainer_name TEXT NOT NULL,
  trainer_user_id UUID,
  session_mode session_mode NOT NULL DEFAULT 'OFFLINE',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 180,
  venue_name TEXT,
  venue_lat NUMERIC,
  venue_lng NUMERIC,
  venue_radius_meters INTEGER NOT NULL DEFAULT 150,
  submission_required BOOLEAN NOT NULL DEFAULT true,
  submission_type submission_type NOT NULL DEFAULT 'GITHUB_REPO',
  submission_deadline TIMESTAMPTZ,
  submission_instructions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(batch_id, session_number)
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  status attendance_status NOT NULL DEFAULT 'NOT_STARTED',
  source attendance_source NOT NULL DEFAULT 'QR_SCAN',
  check_in_time TIMESTAMPTZ,
  check_in_lat NUMERIC,
  check_in_lng NUMERIC,
  check_out_time TIMESTAMPTZ,
  manual_override_by UUID,
  override_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, workshop_id)
);

CREATE TABLE IF NOT EXISTS evidence_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status submission_status NOT NULL DEFAULT 'SUBMITTED',
  artifact_url TEXT,
  notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workshop_id, student_id)
);

CREATE TABLE IF NOT EXISTS student_technology_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  self_confidence INTEGER NOT NULL CHECK (self_confidence BETWEEN 1 AND 5),
  evidence_backed_maturity skill_maturity NOT NULL DEFAULT 'INTRODUCED',
  assessed_level TEXT NOT NULL DEFAULT 'Developing',
  evidence_count INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, tool_name)
);

CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  completed_date DATE NOT NULL,
  credential_url TEXT,
  file_path TEXT,
  status cert_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS external_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  assessment_title TEXT NOT NULL,
  provider TEXT NOT NULL,
  score_raw TEXT NOT NULL,
  proficiency_band TEXT NOT NULL,
  deep_link TEXT,
  assessed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attendance_id UUID NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE UNIQUE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 4),
  key_learning TEXT NOT NULL,
  confidence_score INTEGER NOT NULL CHECK (confidence_score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS active_session_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_dispatches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_filter JSONB NOT NULL DEFAULT '{}'::jsonb,
  channel TEXT NOT NULL DEFAULT 'IN_APP',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  dispatched_by TEXT NOT NULL,
  sent_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID,
  actor_role TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  old_state JSONB,
  new_state JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
