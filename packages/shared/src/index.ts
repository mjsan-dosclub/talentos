// ============================================================================
// @talentos/shared: Domain Types, Enums & Constants
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

export type DevelopmentalGrowthBand =
  | "Developing"
  | "Progressing"
  | "Consistent"
  | "Demonstrated"
  | "Growth Opportunity";

export interface StudentProfile {
  id: string;
  dos_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  course?: string | null;
  department?: string | null;
  year_of_study?: number | null;
  institution_name?: string;
  cohort_name?: string;
}
