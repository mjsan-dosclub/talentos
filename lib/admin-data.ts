import { WORKSHOP_TOPICS_27 } from "./db";

export interface StudentMember {
  id: string;
  dosId: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  institution: string;
  department: string;
  batch: string;
  completedWorkshops: number;
  status: "ACTIVE" | "ON_LEAVE" | "DEFENSE_READY" | "INACTIVE" | "ARCHIVED";
}

export interface ExpertMentor {
  id: string;
  fullName: string;
  email: string;
  organization: string;
  designation: string;
  bio: string;
  avatar: string;
  linkedinUrl: string;
  githubUrl: string;
  domainSpecialties: string[];
  assignedWorkshops: string[];
  status: "ACTIVE" | "STANDBY" | "INACTIVE";
}

export interface PartnerInstitution {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  tier: string;
  region: string;
  lat: number;
  lng: number;
  geofenceRadiusMeters: number;
  studentCount: number;
  status: "ACTIVE" | "ONBOARDING" | "INACTIVE";
  pocName: string;
  pocRole: string;
  pocEmail: string;
  pocPhone: string;
}

export interface WorkshopItem {
  code: string;
  title: string;
  focusArea: string;
  expertName: string;
  mode: "IN_PERSON" | "HYBRID" | "VIRTUAL";
  testPassThreshold: number;
  status: "COMPLETED" | "ACTIVE_IN_SESSION" | "SCHEDULED" | "INACTIVE";
  date: string;
}

export interface AuditLogEntry {
  id: string;
  category: "Students" | "Experts" | "Attendance" | "Certifications" | "System" | "Curriculum" | "Institutions" | "Enquiries";
  subcategory: string;
  action: "Create" | "Update" | "Perform" | "Archive" | "Delete" | "Bulk Update" | "Bulk Delete";
  modifiedBy: {
    name: string;
    email: string;
    avatar: string;
  };
  dateOfChange: string;
  sourceText: string;
  sourceUrl?: string;
}

export const INITIAL_STUDENTS: StudentMember[] = [
  {
    id: "a0000001",
    dosId: "DOS-B3-001",
    fullName: "Arunachalam Sundaram",
    email: "arun@student.dosclub.org",
    institution: "Anna University Campus Hub",
    department: "Computer Technology",
    batch: "Batch 3 - 2026",
    completedWorkshops: 14,
    status: "ACTIVE",
  },
  {
    id: "a0000002",
    dosId: "DOS-B3-002",
    fullName: "Kavitha Raman",
    email: "kavitha@student.dosclub.org",
    institution: "PSG Tech Innovation Hub",
    department: "Information Technology",
    batch: "Batch 3 - 2026",
    completedWorkshops: 14,
    status: "ACTIVE",
  },
  {
    id: "a0000003",
    dosId: "DOS-B3-003",
    fullName: "Dinesh Kumar V.",
    email: "dinesh@student.dosclub.org",
    institution: "NIT Trichy Center",
    department: "ECE Systems",
    batch: "Batch 3 - 2026",
    completedWorkshops: 13,
    status: "ACTIVE",
  },
  {
    id: "a0000004",
    dosId: "DOS-B3-004",
    fullName: "Meera Subramanian",
    email: "meera@student.dosclub.org",
    institution: "IIT Madras Research Park",
    department: "Distributed Systems",
    batch: "Batch 3 - 2026",
    completedWorkshops: 14,
    status: "DEFENSE_READY",
  },
  {
    id: "a0000005",
    dosId: "DOS-B3-005",
    fullName: "Siddharth Rajan",
    email: "siddharth@student.dosclub.org",
    institution: "Anna University Campus Hub",
    department: "Computer Applications",
    batch: "Batch 3 - 2026",
    completedWorkshops: 12,
    status: "ACTIVE",
  },
];

export const INITIAL_EXPERTS: ExpertMentor[] = [
  {
    id: "exp-001",
    fullName: "Priya Sundaram",
    email: "priya.lead@descience.org",
    organization: "DeScience Systems Lab Singapore",
    designation: "Principal Distributed Systems Architect",
    bio: "Ex-Google Distributed Systems lead. Focuses on consensus state machines, fault recovery, and deterministic concurrency.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    linkedinUrl: "https://linkedin.com/in/priya-sundaram-systems",
    githubUrl: "https://github.com/priyasundaram",
    domainSpecialties: ["Distributed Systems", "Fault Tolerance", "Microservices"],
    assignedWorkshops: ["WS-14", "WS-15", "WS-16"],
    status: "ACTIVE",
  },
  {
    id: "exp-002",
    fullName: "Dr. Vikram Sethupathi",
    email: "vikram@kernelresearch.in",
    organization: "Indian Institute of Science (IISc)",
    designation: "Senior Kernel Research Fellow",
    bio: "Systems researcher specializing in Linux virtual memory primitives, io_uring event loops, and eBPF tracing.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    linkedinUrl: "https://linkedin.com/in/dr-vikram-sethupathi",
    githubUrl: "https://github.com/vsethupathi",
    domainSpecialties: ["Linux Kernel", "Memory Management", "eBPF Tracing"],
    assignedWorkshops: ["WS-01", "WS-02", "WS-03", "WS-20"],
    status: "ACTIVE",
  },
  {
    id: "exp-003",
    fullName: "Anandhakrishnan R.",
    email: "anand@openprotocols.sg",
    organization: "Open Protocols Foundation",
    designation: "Head of Protocol Engineering",
    bio: "Author of storage engine implementations and distributed log mechanisms. Mentors students on LSM compaction algorithms.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    linkedinUrl: "https://linkedin.com/in/anandhakrishnan-proto",
    githubUrl: "https://github.com/anandhakrishnan",
    domainSpecialties: ["Database Internals", "LSM-Trees", "Raft Consensus"],
    assignedWorkshops: ["WS-08", "WS-09", "WS-11"],
    status: "ACTIVE",
  },
  {
    id: "exp-004",
    fullName: "Shalini Murugan",
    email: "shalini@appliedcrypto.org",
    organization: "Applied Cryptography Labs",
    designation: "Staff Cryptographic Engineer",
    bio: "Specialist in zero-trust network perimeter verification, TLS handshake performance, and elliptic curve hardware acceleration.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    linkedinUrl: "https://linkedin.com/in/shalini-murugan-crypto",
    githubUrl: "https://github.com/shalinimurugan",
    domainSpecialties: ["Zero-Knowledge Proofs", "Elliptic Curves", "Security"],
    assignedWorkshops: ["WS-18", "WS-19"],
    status: "STANDBY",
  },
];

export const INITIAL_INSTITUTIONS: PartnerInstitution[] = [
  {
    id: "inst-001",
    code: "AU-DOS-01",
    name: "Anna University & DOS Club Hub",
    city: "Chennai",
    state: "Tamil Nadu",
    tier: "Tier 1 Engineering",
    region: "Tamil Nadu, India",
    lat: 13.011,
    lng: 80.2354,
    geofenceRadiusMeters: 200,
    studentCount: 42,
    status: "ACTIVE",
    pocName: "Dr. K. Ramanathan",
    pocRole: "Dean of Academic Systems",
    pocEmail: "ramanathan@annauniv.edu",
    pocPhone: "+91 94440 12345",
  },
  {
    id: "inst-002",
    code: "PSG-DOS-02",
    name: "PSG College of Technology Hub",
    city: "Coimbatore",
    state: "Tamil Nadu",
    tier: "Tier 1 Engineering",
    region: "Tamil Nadu, India",
    lat: 11.0247,
    lng: 77.0028,
    geofenceRadiusMeters: 250,
    studentCount: 35,
    status: "ACTIVE",
    pocName: "Prof. S. Soundarrajan",
    pocRole: "Head, Department of IT",
    pocEmail: "soundar@psgtech.edu",
    pocPhone: "+91 98422 67890",
  },
  {
    id: "inst-003",
    code: "NITT-DOS-03",
    name: "NIT Trichy Engineering Hub",
    city: "Tiruchirappalli",
    state: "Tamil Nadu",
    tier: "Premier Research",
    region: "Tamil Nadu, India",
    lat: 10.7589,
    lng: 78.8132,
    geofenceRadiusMeters: 300,
    studentCount: 28,
    status: "ACTIVE",
    pocName: "Dr. V. Sankaranarayanan",
    pocRole: "Director, Systems Innovation Cell",
    pocEmail: "sankaran@nitt.edu",
    pocPhone: "+91 94860 11223",
  },
];

export const INITIAL_WORKSHOPS: WorkshopItem[] = WORKSHOP_TOPICS_27.map((topic, i) => {
  const num = i + 1;
  const code = `WS-${String(num).padStart(2, "0")}`;
  const status: "COMPLETED" | "ACTIVE_IN_SESSION" | "SCHEDULED" =
    num < 14 ? "COMPLETED" : num === 14 ? "ACTIVE_IN_SESSION" : "SCHEDULED";
  const expertName = num >= 14 && num <= 16 ? "Priya Sundaram" : num <= 3 ? "Dr. Vikram Sethupathi" : "Anandhakrishnan R.";

  return {
    code,
    title: topic,
    focusArea: num <= 6 ? "Core Systems & I/O" : num <= 13 ? "Databases & Storage" : num <= 17 ? "Distributed Systems" : "Specialized War Room",
    expertName,
    mode: num % 2 === 0 ? "HYBRID" : "IN_PERSON",
    testPassThreshold: 20,
    status,
    date: `2026-${String(Math.floor(i / 4) + 3).padStart(2, "0")}-${String((i % 4) * 7 + 10).padStart(2, "0")}`,
  };
});

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud-001",
    category: "Students",
    subcategory: "Telemetry Pass",
    action: "Perform",
    modifiedBy: {
      name: "Platform Administrator (Live)",
      email: "admin@dosclub.org",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    },
    dateOfChange: "14 Sep 2026 10:45 AM IST",
    sourceText: "Verified clearance pass CLR-RAFT-9482 for candidate Meera Subramanian",
    sourceUrl: "/admin?tab=passes",
  },
  {
    id: "aud-002",
    category: "Curriculum",
    subcategory: "Session Schedule",
    action: "Update",
    modifiedBy: {
      name: "Platform Administrator (Live)",
      email: "admin@dosclub.org",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    },
    dateOfChange: "13 Sep 2026 04:15 PM IST",
    sourceText: "Scheduled WS-14: Distributed Consensus Workshop at Anna University Hub",
    sourceUrl: "/admin?tab=workshops",
  },
  {
    id: "aud-003",
    category: "Institutions",
    subcategory: "Campus Onboarding",
    action: "Create",
    modifiedBy: {
      name: "Platform Administrator (Live)",
      email: "admin@dosclub.org",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    },
    dateOfChange: "12 Sep 2026 02:30 PM IST",
    sourceText: "Onboarded PSG College of Technology Hub (PSG-DOS-02)",
    sourceUrl: "/admin?tab=institutions",
  },
];
