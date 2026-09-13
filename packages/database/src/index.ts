import { createClient } from "@supabase/supabase-js";
import type {
  CohortType,
  SessionMode,
  SubmissionType,
  SubmissionStatus,
  AttendanceStatus,
  AttendanceSource,
  SkillMaturity,
  VerificationStatus,
  UserRole,
} from "@talentos/shared";

export const getSupabaseClient = (url: string, key: string) => {
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

export interface DatabaseRecord {
  id: string;
  created_at: string;
}
