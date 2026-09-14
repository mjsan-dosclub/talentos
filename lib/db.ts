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

export const FALLBACK_STUDENTS: Student[] = [
  {
    id: "a0000001-0000-0000-0000-000000000001",
    dos_id: "DOS-B3-001",
    group_id: SEED_GROUP_ID,
    full_name: "Arunachalam Sundaram",
    email: "arun@student.dosclub.org",
    phone: "+91 98401 23456",
    course: "B.Tech Computer Science & Engineering",
    department: "Computer Technology",
    year_of_study: 3,
    is_archived: false,
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "a0000002-0000-0000-0000-000000000002",
    dos_id: "DOS-B3-002",
    group_id: SEED_GROUP_ID,
    full_name: "Kavitha Raman",
    email: "kavitha@student.dosclub.org",
    phone: "+91 98402 34567",
    course: "B.E. Information Technology",
    department: "Information Technology",
    year_of_study: 4,
    is_archived: false,
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "a0000003-0000-0000-0000-000000000003",
    dos_id: "DOS-B3-003",
    group_id: SEED_GROUP_ID,
    full_name: "Dinesh Kumar V.",
    email: "dinesh@student.dosclub.org",
    phone: "+91 98403 45678",
    course: "B.Tech Electronics & Communication",
    department: "ECE Systems",
    year_of_study: 3,
    is_archived: false,
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "a0000004-0000-0000-0000-000000000004",
    dos_id: "DOS-B3-004",
    group_id: SEED_GROUP_ID,
    full_name: "Meera Subramanian",
    email: "meera@student.dosclub.org",
    phone: "+91 98404 56789",
    course: "B.Tech Computer Science",
    department: "IIT Madras Research Park Hub",
    year_of_study: 3,
    is_archived: false,
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "a0000005-0000-0000-0000-000000000005",
    dos_id: "DOS-B3-005",
    group_id: SEED_GROUP_ID,
    full_name: "Siddharth Rajan",
    email: "siddharth@student.dosclub.org",
    phone: "+91 98405 67890",
    course: "B.E. Computer Science",
    department: "Computer Applications",
    year_of_study: 4,
    is_archived: false,
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "a0000006-0000-0000-0000-000000000006",
    dos_id: "DOS-B3-006",
    group_id: SEED_GROUP_ID,
    full_name: "Naveen Raj S.",
    email: "naveen@student.dosclub.org",
    phone: "+91 98406 78901",
    course: "B.Tech Computer Science & Engineering",
    department: "Computer Science & Engineering",
    year_of_study: 3,
    is_archived: false,
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "a0000007-0000-0000-0000-000000000007",
    dos_id: "DOS-B3-007",
    group_id: SEED_GROUP_ID,
    full_name: "Priya Dharshini M.",
    email: "priya@student.dosclub.org",
    phone: "+91 98407 89012",
    course: "B.Tech Information Technology",
    department: "Information Technology",
    year_of_study: 3,
    is_archived: false,
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "a0000008-0000-0000-0000-000000000008",
    dos_id: "DOS-B3-008",
    group_id: SEED_GROUP_ID,
    full_name: "Karthik Sundar",
    email: "karthik.s@student.dosclub.org",
    phone: "+91 98408 90123",
    course: "B.Tech Electronics & Communication",
    department: "Electronics & Communication",
    year_of_study: 3,
    is_archived: false,
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "a0000009-0000-0000-0000-000000000009",
    dos_id: "DOS-B3-009",
    group_id: SEED_GROUP_ID,
    full_name: "Janani Balaji",
    email: "janani@student.dosclub.org",
    phone: "+91 98409 01234",
    course: "B.Tech Computer Technology",
    department: "Computer Technology",
    year_of_study: 3,
    is_archived: false,
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "a0000010-0000-0000-0000-000000000010",
    dos_id: "DOS-B3-010",
    group_id: SEED_GROUP_ID,
    full_name: "Vigneshwaran K.",
    email: "vignesh@student.dosclub.org",
    phone: "+91 98410 12345",
    course: "B.Tech AI & Data Science",
    department: "Artificial Intelligence & Data Science",
    year_of_study: 2,
    is_archived: false,
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "a0000011-0000-0000-0000-000000000011",
    dos_id: "DOS-B3-011",
    group_id: SEED_GROUP_ID,
    full_name: "Swetha Ranganathan",
    email: "swetha@student.dosclub.org",
    phone: "+91 98411 23456",
    course: "B.Tech Information Technology",
    department: "Information Technology",
    year_of_study: 3,
    is_archived: false,
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "a0000012-0000-0000-0000-000000000012",
    dos_id: "DOS-B3-012",
    group_id: SEED_GROUP_ID,
    full_name: "Harish Kumar V.",
    email: "harish@student.dosclub.org",
    phone: "+91 98412 34567",
    course: "B.E. Computer Science & Engineering",
    department: "Computer Science & Engineering",
    year_of_study: 3,
    is_archived: false,
    created_at: "2026-03-01T00:00:00Z",
  },
];

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

export const FALLBACK_WORKSHOPS: Workshop[] = WORKSHOP_TOPICS_27.map((topic, idx) => {
  // Session durations based on curriculum:
  // Phase 2 (idx 6-15), Phase 4 (idx 17), Phase 10 (idx 25-26): 9AM - 4PM (420 mins)
  // Others: 10AM - 3PM (300 mins)
  const isAllDay = (idx >= 6 && idx <= 15) || idx === 17 || idx >= 25;
  const duration = isAllDay ? 420 : 300;
  const startHour = isAllDay ? 9 : 10;

  return {
    id: `w0000000-0000-0000-0000-${String(idx + 1).padStart(12, "0")}`,
    batch_id: SEED_BATCH_ID,
    session_number: idx + 1,
    title: `WS-${String(idx + 1).padStart(2, "0")}: ${topic}`,
    description: `${WORKSHOP_PHASES_27[idx]} — 27 Days to CodeZap 3.0's 36-Hour Hackathon.`,
    trainer_name: idx % 2 === 0 ? "Priya (Systems Architect)" : "DeScience Technical Faculty",
    session_mode: "OFFLINE",
    scheduled_at: new Date(2026, 2, 1 + idx * 7, startHour, 0).toISOString(),
    duration_minutes: duration,
    venue_name: "Anna University Campus / DOS Club Chennai Hub",
    venue_lat: 13.011,
    venue_lng: 80.2354,
    venue_radius_meters: 150,
    submission_required: idx < 17,
    submission_type: idx === 18 ? "DOCUMENT" : "GITHUB_REPO",
    is_active: idx === 6, // WS-07 (Build Arena — Day 1) is active workshop
    created_at: "2026-03-01T00:00:00Z",
  };
});

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

export const FALLBACK_SKILLS: StudentTechnologyInventory[] = [
  {
    id: "sk-01",
    student_id: "a0000001-0000-0000-0000-000000000001",
    tool_name: "Linux Kernel & Syscalls",
    self_confidence: 4,
    evidence_backed_maturity: "DEMONSTRATED",
    assessed_level: "Demonstrated",
    evidence_count: 6,
    updated_at: "2026-03-15T00:00:00Z",
  },
  {
    id: "sk-02",
    student_id: "a0000001-0000-0000-0000-000000000001",
    tool_name: "Git Internals & Plumbing",
    self_confidence: 5,
    evidence_backed_maturity: "CONSISTENTLY_DEMONSTRATED",
    assessed_level: "Consistent",
    evidence_count: 14,
    updated_at: "2026-03-20T00:00:00Z",
  },
  {
    id: "sk-03",
    student_id: "a0000001-0000-0000-0000-000000000001",
    tool_name: "B-Trees & LSM-Trees",
    self_confidence: 4,
    evidence_backed_maturity: "DEMONSTRATED",
    assessed_level: "Demonstrated",
    evidence_count: 5,
    updated_at: "2026-03-22T00:00:00Z",
  },
  {
    id: "sk-04",
    student_id: "a0000001-0000-0000-0000-000000000001",
    tool_name: "PostgreSQL & Query Planners",
    self_confidence: 4,
    evidence_backed_maturity: "APPLIED",
    assessed_level: "Progressing",
    evidence_count: 4,
    updated_at: "2026-03-25T00:00:00Z",
  },
  {
    id: "sk-05",
    student_id: "a0000001-0000-0000-0000-000000000001",
    tool_name: "Socket Programming & epoll",
    self_confidence: 4,
    evidence_backed_maturity: "DEMONSTRATED",
    assessed_level: "Demonstrated",
    evidence_count: 7,
    updated_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "sk-06",
    student_id: "a0000001-0000-0000-0000-000000000001",
    tool_name: "Raft Consensus Protocol",
    self_confidence: 3,
    evidence_backed_maturity: "APPLIED",
    assessed_level: "Developing",
    evidence_count: 3,
    updated_at: "2026-04-10T00:00:00Z",
  },
  {
    id: "sk-07",
    student_id: "a0000001-0000-0000-0000-000000000001",
    tool_name: "Docker & Cgroups v2",
    self_confidence: 4,
    evidence_backed_maturity: "DEMONSTRATED",
    assessed_level: "Demonstrated",
    evidence_count: 6,
    updated_at: "2026-04-18T00:00:00Z",
  },
  {
    id: "sk-08",
    student_id: "a0000001-0000-0000-0000-000000000001",
    tool_name: "OpenTelemetry & Tracing",
    self_confidence: 4,
    evidence_backed_maturity: "APPLIED",
    assessed_level: "Progressing",
    evidence_count: 4,
    updated_at: "2026-05-01T00:00:00Z",
  },
  {
    id: "sk-09",
    student_id: "a0000001-0000-0000-0000-000000000001",
    tool_name: "Circuit Breakers & Jittered Backoff",
    self_confidence: 4,
    evidence_backed_maturity: "DEMONSTRATED",
    assessed_level: "Demonstrated",
    evidence_count: 5,
    updated_at: "2026-05-15T00:00:00Z",
  },
  {
    id: "sk-10",
    student_id: "a0000001-0000-0000-0000-000000000001",
    tool_name: "GPU Compute & SIMD",
    self_confidence: 2,
    evidence_backed_maturity: "INTRODUCED",
    assessed_level: "Growth Opportunity",
    evidence_count: 1,
    updated_at: "2026-05-20T00:00:00Z",
  },
];

export const FALLBACK_CERTIFICATIONS: Certification[] = [
  {
    id: "cert-01",
    student_id: "a0000001-0000-0000-0000-000000000001",
    title: "Linux Foundation Certified System Administrator (LFCS)",
    provider: "Linux Foundation",
    category: "Systems & Infrastructure",
    level: "Intermediate",
    completed_date: "2026-01-15",
    credential_url: "https://www.credly.com/org/the-linux-foundation/badge/lfcs",
    status: "VERIFIED",
    verified_by: null,
    verified_at: "2026-01-20T00:00:00Z",
    created_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "cert-02",
    student_id: "a0000001-0000-0000-0000-000000000001",
    title: "HashiCorp Certified: Terraform Associate",
    provider: "HashiCorp",
    category: "Infrastructure as Code",
    level: "Associate",
    completed_date: "2026-02-10",
    credential_url: "https://www.credly.com/badges/hashicorp-terraform",
    status: "VERIFIED",
    verified_by: null,
    verified_at: "2026-02-14T00:00:00Z",
    created_at: "2026-02-10T00:00:00Z",
  },
  {
    id: "cert-03",
    student_id: "a0000001-0000-0000-0000-000000000001",
    title: "AWS Certified Solutions Architect - Associate",
    provider: "Amazon Web Services",
    category: "Cloud Architecture",
    level: "Intermediate",
    completed_date: "2026-05-02",
    credential_url: "https://aws.amazon.com/verification/aws-csa-a",
    status: "PENDING_VERIFICATION",
    verified_by: null,
    verified_at: null,
    created_at: "2026-05-02T00:00:00Z",
  },
];

export const FALLBACK_ASSESSMENTS: ExternalAssessment[] = [
  {
    id: "ass-01",
    student_id: "a0000001-0000-0000-0000-000000000001",
    assessment_title: "Systems Engineering Baseline Diagnostic",
    provider: "DOS Diagnostic Engine",
    score_raw: "84/100",
    proficiency_band: "Consistent",
    deep_link: "https://audit.dosclub.org/assessments/baseline-01",
    assessed_at: "2026-02-25T10:00:00Z",
    created_at: "2026-02-25T10:00:00Z",
  },
  {
    id: "ass-02",
    student_id: "a0000001-0000-0000-0000-000000000001",
    assessment_title: "Linux & Concurrency Practical Benchmark",
    provider: "HackerRank Enterprise Systems",
    score_raw: "92/100",
    proficiency_band: "Demonstrated",
    deep_link: "https://hackerrank.com/certificates/sample-concurrency",
    assessed_at: "2026-04-18T14:30:00Z",
    created_at: "2026-04-18T14:30:00Z",
  },
];

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
