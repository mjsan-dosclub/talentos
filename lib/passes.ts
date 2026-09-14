export interface AccessPass {
  id: string;
  pass_code: string;
  candidate_name: string;
  candidate_email: string;
  cohort_batch: string;
  institution: string;
  clearance_level: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  issued_at: string;
  expires_at: string;
  notes?: string;
}

export const INITIAL_PASSES: AccessPass[] = [
  {
    id: "pass-001",
    pass_code: "DOS-B3-001",
    candidate_name: "Siddharth Raman",
    candidate_email: "siddharth@student.dosclub.org",
    cohort_batch: "Batch 3 - 2026",
    institution: "CEG Chennai",
    clearance_level: "Tier 1 - Priority Clearance",
    status: "ACTIVE",
    issued_at: "2026-03-01T09:00:00Z",
    expires_at: "2027-03-01T09:00:00Z",
    notes: "Cleared under Raft Consensus Engine peer defense."
  },
  {
    id: "pass-002",
    pass_code: "DOS-B3-002",
    candidate_name: "Ananya Krishnan",
    candidate_email: "ananya@student.dosclub.org",
    cohort_batch: "Batch 3 - 2026",
    institution: "Anna University",
    clearance_level: "Tier 1 - Priority Clearance",
    status: "ACTIVE",
    issued_at: "2026-03-05T10:30:00Z",
    expires_at: "2027-03-05T10:30:00Z",
    notes: "Paged KV-Cache runtime author. High-velocity clearance."
  },
  {
    id: "pass-003",
    pass_code: "DOS-B3-003",
    candidate_name: "Karthik Subramanian",
    candidate_email: "karthik@student.dosclub.org",
    cohort_batch: "Batch 3 - 2026",
    institution: "MIT Chennai",
    clearance_level: "Tier 2 - Systems Pod",
    status: "ACTIVE",
    issued_at: "2026-03-08T14:15:00Z",
    expires_at: "2027-03-08T14:15:00Z",
    notes: "LSM-Tree storage compaction verified."
  },
  {
    id: "pass-004",
    pass_code: "DOS-CLEAR-77X",
    candidate_name: "Arunachalam Sundaram",
    candidate_email: "arun@student.dosclub.org",
    cohort_batch: "Batch 3 - 2026",
    institution: "Anna University Campus Hub",
    clearance_level: "Tier 1 - Priority Clearance",
    status: "ACTIVE",
    issued_at: "2026-03-10T11:00:00Z",
    expires_at: "2027-03-10T11:00:00Z",
    notes: "Executive fast-track clearance."
  },
  {
    id: "pass-005",
    pass_code: "PASS-2026-ALPHA",
    candidate_name: "Kavitha Raman",
    candidate_email: "kavitha@student.dosclub.org",
    cohort_batch: "Batch 3 - 2026",
    institution: "PSG Tech Innovation Hub",
    clearance_level: "Tier 1 - Priority Clearance",
    status: "ACTIVE",
    issued_at: "2026-03-11T16:45:00Z",
    expires_at: "2027-03-11T16:45:00Z",
    notes: "Specialized AI engineering track pass."
  },
  {
    id: "pass-006",
    pass_code: "DOS-REVOKED-TEST",
    candidate_name: "Sample Inactive Lead",
    candidate_email: "inactive@example.com",
    cohort_batch: "Batch 2 - 2025",
    institution: "University Demo Hub",
    clearance_level: "Tier 3 - Standard",
    status: "REVOKED",
    issued_at: "2025-10-01T08:00:00Z",
    expires_at: "2026-01-01T08:00:00Z",
    notes: "Sample pass revoked for testing."
  }
];

let passesStore: AccessPass[] = [...INITIAL_PASSES];

export function getAccessPasses(): AccessPass[] {
  return passesStore;
}

export function getAccessPassByCode(query: string): AccessPass | undefined {
  const clean = query.trim().toUpperCase();
  return passesStore.find(
    (p) =>
      p.pass_code.toUpperCase() === clean ||
      p.id.toUpperCase() === clean ||
      p.candidate_email.toUpperCase() === clean
  );
}

export function issueAccessPass(data: Omit<AccessPass, "id" | "issued_at">): AccessPass {
  const now = new Date().toISOString();
  const pass: AccessPass = {
    ...data,
    id: `pass-${Date.now().toString(36)}`,
    pass_code: data.pass_code.trim().toUpperCase(),
    issued_at: now,
    status: data.status || "ACTIVE",
  };
  passesStore.unshift(pass);
  return pass;
}

export function updateAccessPassStatus(id: string, status: "ACTIVE" | "REVOKED" | "EXPIRED"): AccessPass | null {
  const index = passesStore.findIndex((p) => p.id === id || p.pass_code.toUpperCase() === id.toUpperCase());
  if (index === -1) return null;
  passesStore[index] = {
    ...passesStore[index],
    status,
  };
  return passesStore[index];
}

export function deleteAccessPass(id: string): boolean {
  const initialLen = passesStore.length;
  passesStore = passesStore.filter((p) => p.id !== id && p.pass_code.toUpperCase() !== id.toUpperCase());
  return passesStore.length < initialLen;
}
