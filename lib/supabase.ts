import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mwpqlmptznykdjvnaqcd.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// DDL TYPES MATCHING SUPABASE EXACT ENUMS & TABLES
// ============================================================================

export type CohortType = "B2B" | "B2C";
export type SessionMode = "ONLINE" | "OFFLINE" | "HYBRID";
export type SubmissionType =
  | "NONE"
  | "GITHUB_REPO"
  | "PROJECT_URL"
  | "DOCUMENT"
  | "IMAGE"
  | "VIDEO"
  | "EXTERNAL_ASSESSMENT"
  | "FORM_RESPONSE"
  | "OTHER";

export type SubmissionStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "SUBMITTED"
  | "SUBMITTED_LATE"
  | "REVIEWED"
  | "RESUBMISSION_REQUESTED";

export type AttendanceStatus =
  | "NOT_STARTED"
  | "CHECKED_IN"
  | "LATE"
  | "PARTIAL"
  | "COMPLETED"
  | "ABSENT_UNCONFIRMED"
  | "ABSENT_CONFIRMED"
  | "EXCUSED"
  | "MANUALLY_CONFIRMED";

export type AttendanceSource =
  | "QR_SCAN"
  | "TRAINER_MANUAL"
  | "ADMIN_OVERRIDE"
  | "COLLEGE_CONFIRMED";

export type SkillMaturity =
  | "INTRODUCED"
  | "EXPLORED"
  | "APPLIED"
  | "DEMONSTRATED"
  | "CONSISTENTLY_DEMONSTRATED";

export type VerificationStatus =
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED";

export type UserRole =
  | "SUPER_ADMIN"
  | "COMMITTEE"
  | "COLLEGE_ADMIN"
  | "TRAINER"
  | "STUDENT";

export interface Institution {
  id: string;
  name: string;
  code: string;
  contact_email: string;
  contact_person: string;
  default_lat?: number | null;
  default_lng?: number | null;
  geofence_radius_meters: number;
  is_active: boolean;
  created_at: string;
}

export interface Batch {
  id: string;
  institution_id?: string | null;
  type: CohortType;
  name: string;
  year: number;
  is_active: boolean;
  created_at: string;
}

export interface CohortGroup {
  id: string;
  batch_id: string;
  group_name: string;
  max_capacity: number;
  is_closed: boolean;
  created_at: string;
}

export interface Student {
  id: string;
  user_id?: string | null;
  group_id: string;
  dos_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  course?: string | null;
  department?: string | null;
  year_of_study?: number | null;
  avatar_url?: string | null;
  baseline_assessment_notes?: string | null;
  is_archived: boolean;
  created_at: string;
}

export interface Workshop {
  id: string;
  batch_id: string;
  session_number: number;
  title: string;
  description?: string | null;
  trainer_name: string;
  trainer_user_id?: string | null;
  session_mode: SessionMode;
  scheduled_at: string;
  duration_minutes: number;
  venue_name?: string | null;
  venue_lat?: number | null;
  venue_lng?: number | null;
  venue_radius_meters: number;
  submission_required: boolean;
  submission_type: SubmissionType;
  submission_deadline?: string | null;
  submission_instructions?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  workshop_id: string;
  status: AttendanceStatus;
  source: AttendanceSource;
  check_in_time?: string | null;
  check_in_lat?: number | null;
  check_in_lng?: number | null;
  check_out_time?: string | null;
  manual_override_by?: string | null;
  override_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EvidenceSubmission {
  id: string;
  workshop_id: string;
  student_id: string;
  status: SubmissionStatus;
  artifact_url?: string | null;
  notes?: string | null;
  submitted_at?: string | null;
  reviewed_by?: string | null;
  review_notes?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_role: UserRole;
  entity_name: string;
  entity_id: string;
  action: string;
  old_state?: any;
  new_state?: any;
  reason: string;
  created_at: string;
}
