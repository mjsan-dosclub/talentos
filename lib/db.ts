import {
  supabase,
  Student,
  Workshop,
  AttendanceRecord,
  EvidenceSubmission,
  StudentTechnologyInventory,
  Certification,
  ExternalAssessment,
  SessionFeedback,
} from "./supabase";

export type {
  Student,
  Workshop,
  AttendanceRecord,
  EvidenceSubmission,
  StudentTechnologyInventory,
  Certification,
  ExternalAssessment,
  SessionFeedback,
};

// High-fidelity fallback seed data matching the official Supabase DDL schema
export const SEED_INSTITUTION_ID = "11111111-1111-1111-1111-111111111111";
export const SEED_BATCH_ID = "22222222-2222-2222-2222-222222222222";
export const SEED_GROUP_ID = "33333333-3333-3333-3333-333333333333";

export const FALLBACK_STUDENTS: Student[] = [];

export const FALLBACK_SKILLS: StudentTechnologyInventory[] = [];

export const FALLBACK_CERTIFICATIONS: Certification[] = [];

export const FALLBACK_ASSESSMENTS: ExternalAssessment[] = [];

// Official 27-Session Curriculum: The Runway (27 Days to CodeZap 3.0 Hackathon)
export const WORKSHOP_TOPICS_27 = [
  "Mission Briefing — Team Formation & SDLC Orientation",
  "The Problem Vault — Statement Decoding I",
  "The Problem Vault — Statement Decoding II",
  "Convincing the Council — Defending Your Interpretation",
  "Custom Case Files — DOS Club Challenge I",
  "Custom Case Files — DOS Club Challenge II",
  "Build Arena — Day 1",
  "Build Arena — Day 2",
  "Build Arena — Day 3",
  "Build Arena — Day 4",
  "Build Arena — Day 5",
  "Build Arena — Day 6",
  "Build Arena — Day 7",
  "Build Arena — Day 8",
  "Build Arena — Day 9",
  "Build Arena — Day 10",
  "Stage Craft — Presentation Mastery",
  "The Panel Round — Team Reviews (45 min per team)",
  "AI Lab — Generative AI Deep Dive",
  "Vibe Coding Sprint",
  "Startup Launchpad — Ideation, Funding & Hackathons",
  "Team Rhythm Workshop — Part I",
  "Team Rhythm Workshop — Part II",
  "Team Rhythm Workshop — Part III",
  "Career Gateway — Resume Building & Interview Process",
  "The Arena — Demo Day",
  "The Arena — Selection Day",
];

export const WORKSHOP_PHASES_27 = [
  "Phase 1: Mission Briefing & Problem Vault",
  "Phase 1: Mission Briefing & Problem Vault",
  "Phase 1: Mission Briefing & Problem Vault",
  "Phase 1: Mission Briefing & Problem Vault",
  "Phase 1: Mission Briefing & Problem Vault",
  "Phase 1: Mission Briefing & Problem Vault",
  "Phase 2: Build Arena",
  "Phase 2: Build Arena",
  "Phase 2: Build Arena",
  "Phase 2: Build Arena",
  "Phase 2: Build Arena",
  "Phase 2: Build Arena",
  "Phase 2: Build Arena",
  "Phase 2: Build Arena",
  "Phase 2: Build Arena",
  "Phase 2: Build Arena",
  "Phase 3: Stage Craft",
  "Phase 4: The Panel Round",
  "Phase 5: AI Lab",
  "Phase 6: Vibe Coding Sprint",
  "Phase 7: Startup Launchpad",
  "Phase 8: Team Rhythm Workshop",
  "Phase 8: Team Rhythm Workshop",
  "Phase 8: Team Rhythm Workshop",
  "Phase 9: Career Gateway",
  "Phase 10: The Arena (Pre-Finals)",
  "Phase 10: The Arena (Pre-Finals)",
];

export const FALLBACK_WORKSHOPS: Workshop[] = [];

// ============================================================================
// DATA ACCESS SERVICE WITH LIVE SUPABASE QUERY + FALLBACK RESILIENCE
// ============================================================================

/**
 * Fetch all students enrolled in the active batch
 */
export async function getStudents(): Promise<{ students: Student[]; isLiveDb: boolean }> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/students");
      if (res.ok) {
        const json = await res.json();
        if (json.students && json.students.length > 0) {
          return { students: json.students, isLiveDb: true };
        }
      }
    }
  } catch (err) {
    console.warn("API students fetch fallback:", err);
  }

  return { students: FALLBACK_STUDENTS, isLiveDb: false };
}

/**
 * Find student by DOS ID or registered email address
 */
export async function getStudentByIdOrEmail(query: string): Promise<{ student: Student | null; isLiveDb: boolean }> {
  const clean = query.trim().toLowerCase();

  try {
    const { students, isLiveDb } = await getStudents();
    const found = students.find(
      (s) => s.dos_id.toLowerCase() === clean || s.email.toLowerCase() === clean
    );
    if (found) {
      return { student: found, isLiveDb };
    }
  } catch (err) {
    console.warn("Student lookup fallback:", err);
  }

  const fallback = FALLBACK_STUDENTS.find(
    (s) => s.dos_id.toLowerCase() === clean || s.email.toLowerCase() === clean
  );
  if (fallback) {
    return { student: fallback, isLiveDb: false };
  }

  // Dynamic fallback for any DOS-B3-xxx ID
  if (clean.startsWith("dos-b3-")) {
    const num = query.trim().toUpperCase().replace("DOS-B3-", "");
    return {
      student: {
        id: `auto-${clean}`,
        dos_id: query.trim().toUpperCase(),
        group_id: SEED_GROUP_ID,
        full_name: `Cohort Member ${num}`,
        email: `student.${num.toLowerCase()}@dosclub.org`,
        phone: "+91 98400 " + num.padStart(5, "0"),
        course: "B.Tech Computer Science & Engineering",
        department: "Computer Technology",
        year_of_study: 3,
        is_archived: false,
        created_at: "2026-03-01T00:00:00Z",
      },
      isLiveDb: false,
    };
  }

  // Access Pass Ledger lookup
  try {
    const { getAccessPassByCode } = await import("./passes");
    const pass = getAccessPassByCode(clean);
    if (pass) {
      return {
        student: {
          id: pass.id,
          dos_id: pass.pass_code,
          group_id: SEED_GROUP_ID,
          full_name: pass.candidate_name,
          email: pass.candidate_email,
          phone: "+91 98400 00000",
          course: pass.clearance_level,
          department: pass.institution,
          year_of_study: 3,
          is_archived: pass.status === "REVOKED",
          created_at: pass.issued_at,
        },
        isLiveDb: false,
      };
    }
  } catch (err) {
    console.warn("Pass lookup failed:", err);
  }

  return { student: null, isLiveDb: false };
}

/**
 * Fetch all 27 workshops in curriculum
 */
export async function getWorkshops(): Promise<{ workshops: Workshop[]; isLiveDb: boolean }> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/workshops");
      if (res.ok) {
        const json = await res.json();
        if (json.workshops && json.workshops.length > 0) {
          return { workshops: json.workshops, isLiveDb: true };
        }
      }
    }
  } catch (err) {
    console.warn("API workshops fetch fallback:", err);
  }

  return { workshops: FALLBACK_WORKSHOPS, isLiveDb: false };
}

/**
 * Fetch attendance records for a student
 */
export async function getAttendanceForStudent(studentId: string): Promise<AttendanceRecord[]> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch(`/api/attendance?student_id=${encodeURIComponent(studentId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.attendance && json.attendance.length > 0) {
          return json.attendance as AttendanceRecord[];
        }
      }
    }
  } catch (err) {
    console.warn("Supabase attendance fallback:", err);
  }

  return [];
}

/**
 * Fetch evidence submissions for a student
 */
export async function getSubmissionsForStudent(studentId: string): Promise<EvidenceSubmission[]> {
  try {
    const { data, error } = await supabase
      .from("evidence_submissions")
      .select("*")
      .eq("student_id", studentId);

    if (!error && data && data.length > 0) {
      return data as EvidenceSubmission[];
    }
  } catch (err) {
    console.warn("Supabase submissions fallback:", err);
  }

  return [];
}

/**
 * Enroll a new student into the active batch
 */
export async function enrollStudent(newStudent: Omit<Student, "id" | "created_at">): Promise<{ student: Student; isLiveDb: boolean }> {
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();
  const studentPayload: Student = { ...newStudent, id, created_at };

  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.student) {
          return { student: json.student, isLiveDb: true };
        }
      }
    }
  } catch (err) {
    console.warn("API enrollStudent fallback:", err);
  }

  return { student: studentPayload, isLiveDb: false };
}

/**
 * Transmit deliverable submission
 */
export async function submitEvidence(submission: {
  workshop_id: string;
  student_id: string;
  artifact_url: string;
  notes: string;
}): Promise<{ submission: EvidenceSubmission; isLiveDb: boolean }> {
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();
  const payload: EvidenceSubmission = {
    id,
    workshop_id: submission.workshop_id,
    student_id: submission.student_id,
    status: "SUBMITTED",
    artifact_url: submission.artifact_url,
    notes: submission.notes,
    submitted_at: created_at,
    created_at,
  };

  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.submission) {
          return { submission: json.submission, isLiveDb: true };
        }
      }
    }
  } catch (err) {
    console.warn("API submitEvidence fallback:", err);
  }

  return { submission: payload, isLiveDb: false };
}


export async function getSkillsForStudent(studentId?: string): Promise<StudentTechnologyInventory[]> {
  try {
    if (typeof window !== "undefined") {
      const url = studentId ? `/api/skills?student_id=${encodeURIComponent(studentId)}` : "/api/skills";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.skills && json.skills.length > 0) return json.skills;
      }
    }
  } catch (err) {
    console.warn("getSkillsForStudent fallback:", err);
  }
  return FALLBACK_SKILLS;
}

export async function getCertificationsForStudent(studentId?: string): Promise<Certification[]> {
  try {
    if (typeof window !== "undefined") {
      const url = studentId ? `/api/certifications?student_id=${encodeURIComponent(studentId)}` : "/api/certifications";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.certifications && json.certifications.length > 0) return json.certifications;
      }
    }
  } catch (err) {
    console.warn("getCertificationsForStudent fallback:", err);
  }
  return FALLBACK_CERTIFICATIONS;
}

export async function getAssessmentsForStudent(studentId?: string): Promise<ExternalAssessment[]> {
  try {
    if (typeof window !== "undefined") {
      const url = studentId ? `/api/assessments?student_id=${encodeURIComponent(studentId)}` : "/api/assessments";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.assessments && json.assessments.length > 0) return json.assessments;
      }
    }
  } catch (err) {
    console.warn("getAssessmentsForStudent fallback:", err);
  }
  return FALLBACK_ASSESSMENTS;
}

export async function submitSessionFeedback(feedback: {
  attendance_id: string;
  rating: number;
  key_learning: string;
  confidence_score: number;
}): Promise<{ feedback: SessionFeedback | null; error?: string }> {
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedback),
    });
    const json = await res.json();
    if (!res.ok) return { feedback: null, error: json.error };
    return { feedback: json.feedback };
  } catch (err: any) {
    return { feedback: null, error: err.message };
  }
}

export async function getAdminUserByEmail(email: string) {
  try {
    const { data } = await supabase.from("admin_users").select("*").eq("email", email.toLowerCase().trim()).maybeSingle();
    if (data) return data;
  } catch {
    // fallback
  }
  return null;
}
