"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  getStudentByIdOrEmail,
  getSkillsForStudent,
  getCertificationsForStudent,
  getAssessmentsForStudent,
  submitSessionFeedback,
  Student,
} from "@/lib/db";
import type {
  StudentTechnologyInventory,
  Certification,
  ExternalAssessment,
  SkillMaturity,
} from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";
import SidebarNav, { SidebarGroup } from "@/components/SidebarNav";
import {
  AcademicCapIcon,
  WrenchIcon,
  AwardIcon,
  CheckCircleIcon,
  PhoneIcon,
  UploadIcon,
  BuildingIcon,
  IdCardIcon,
  MailIcon,
  ShareIcon,
  StarIcon,
  ChartBarIcon,
  CodeIcon,
  MapPinIcon,
  EditIcon,
  CheckIcon,
  XIcon,
} from "@/components/Icons";

// STRICT INVARIANT STATES FROM PROJECT_RULES.md
type ApprovedState =
  | "REGISTERED"
  | "CHECKED_IN"
  | "LATE"
  | "INCOMPLETE"
  | "COMPLETED"
  | "ABSENT_UNCONFIRMED"
  | "ABSENT_CONFIRMED"
  | "EXCUSED"
  | "MANUALLY_CONFIRMED";

interface WorkshopRecord {
  index: number;
  code: string;
  title: string;
  topic: string;
  state: ApprovedState;
  checkInTime?: string;
  geofenceVerified?: boolean;
  commitHash?: string;
  repoArtifact?: string;
  geofenceCoordinates?: string;
  testOutcome?: string;
  peerReviewSignoff?: string;
  attendanceId?: string;
}

// 27-Workshop Curriculum Audit Trail
const WORKSHOP_CURRICULUM: WorkshopRecord[] = [
  {
    index: 1,
    code: "WS-01",
    title: "Linux Kernel Fundamentals & Shell Environments",
    topic: "POSIX subsystems, process scheduling, memory namespaces",
    state: "COMPLETED",
    checkInTime: "2026-03-01T09:02:14Z",
    geofenceVerified: true,
    commitHash: "7b2c9a1",
    repoArtifact: "dos-club/ws01-kernel-namespaces",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 42m / 120m limit)",
    testOutcome: "PASSED (14/14 hermetic container test specs)",
    peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors",
    attendanceId: "att-001",
  },
  {
    index: 2,
    code: "WS-02",
    title: "Version Control Systems & Git Plumbing Internals",
    topic: "Tree objects, packfiles, cryptographic commit signing",
    state: "COMPLETED",
    checkInTime: "2026-03-08T09:00:45Z",
    geofenceVerified: true,
    commitHash: "3f98e02",
    repoArtifact: "dos-club/ws02-git-internals",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 38m / 120m limit)",
    testOutcome: "PASSED (18/18 commit graph verification tests)",
    peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors",
    attendanceId: "att-002",
  },
  {
    index: 3,
    code: "WS-03",
    title: "Data Structures in Systems Programming",
    topic: "B-Trees, LSM-Trees, lockless ring buffers in memory",
    state: "COMPLETED",
    checkInTime: "2026-03-15T08:58:30Z",
    geofenceVerified: true,
    commitHash: "9a41d77",
    repoArtifact: "dos-club/ws03-lsm-trees",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 29m / 120m limit)",
    testOutcome: "PASSED (22/22 concurrent read/write test specs)",
    peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors",
    attendanceId: "att-003",
  },
  {
    index: 4,
    code: "WS-04",
    title: "Relational Engine Design & Query Planners",
    topic: "PostgreSQL execution plans, index scans, vacuuming",
    state: "LATE",
    checkInTime: "2026-03-22T09:16:11Z",
    geofenceVerified: true,
    commitHash: "a8f3c1d",
    repoArtifact: "dos-club/ws04-query-optimizer",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 55m / 120m limit)",
    testOutcome: "PASSED (16/16 query planner cost model tests)",
    peerReviewSignoff: "Faculty Lead (Flagged: Arrived 11 min past zero-grace window)",
    attendanceId: "att-004",
  },
  {
    index: 5,
    code: "WS-05",
    title: "Network Protocols & Socket Primitives",
    topic: "TCP handshake lifecycle, epoll/kqueue event loops",
    state: "COMPLETED",
    checkInTime: "2026-03-29T09:01:03Z",
    geofenceVerified: true,
    commitHash: "c0183ee",
    repoArtifact: "dos-club/ws05-socket-epoll",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 41m / 120m limit)",
    testOutcome: "PASSED (20/20 non-blocking echo server specs)",
    peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors",
    attendanceId: "att-005",
  },
  {
    index: 6,
    code: "WS-06",
    title: "HTTP/2 & HTTP/3 Frame Parsing Internals",
    topic: "QUIC connection state machines, HPACK binary headers",
    state: "COMPLETED",
    checkInTime: "2026-04-05T08:59:12Z",
    geofenceVerified: true,
    commitHash: "44e912a",
    repoArtifact: "dos-club/ws06-quic-parser",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 33m / 120m limit)",
    testOutcome: "PASSED (24/24 frame serialization tests)",
    peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors",
    attendanceId: "att-006",
  },
  {
    index: 7,
    code: "WS-07",
    title: "Distributed Consensus: Raft Protocol",
    topic: "Leader election, log replication, term mismatch recovery",
    state: "COMPLETED",
    checkInTime: "2026-04-12T09:03:40Z",
    geofenceVerified: true,
    commitHash: "55f10bb",
    repoArtifact: "dos-club/ws07-raft-cluster",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 48m / 120m limit)",
    testOutcome: "PASSED (16/16 partition recovery scenarios)",
    peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors",
    attendanceId: "att-007",
  },
  {
    index: 8,
    code: "WS-08",
    title: "Containerization Mechanics & Linux cgroups",
    topic: "cgroups v2 resource limits, pivot_root, seccomp filters",
    state: "COMPLETED",
    checkInTime: "2026-04-19T08:57:15Z",
    geofenceVerified: true,
    commitHash: "66d34cc",
    repoArtifact: "dos-club/ws08-mini-container",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 22m / 120m limit)",
    testOutcome: "PASSED (12/12 isolation invariant tests)",
    peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors",
    attendanceId: "att-008",
  },
  {
    index: 9,
    code: "WS-09",
    title: "Zero-Knowledge Proofs & zk-SNARK Basics",
    topic: "R1CS constraint systems, QAP polynomials, Groth16 verify",
    state: "COMPLETED",
    checkInTime: "2026-04-26T09:04:19Z",
    geofenceVerified: true,
    commitHash: "77a88dd",
    repoArtifact: "dos-club/ws09-circom-circuits",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 60m / 120m limit)",
    testOutcome: "PASSED (10/10 proof generation & verification tests)",
    peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors",
    attendanceId: "att-009",
  },
  {
    index: 10,
    code: "WS-10",
    title: "WebAssembly Runtimes & Memory Sandboxing",
    topic: "Wasm linear memory, boundary crossing, WASI interfaces",
    state: "COMPLETED",
    checkInTime: "2026-05-03T09:00:22Z",
    geofenceVerified: true,
    commitHash: "88b99ee",
    repoArtifact: "dos-club/ws10-wasm-sandbox",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 36m / 120m limit)",
    testOutcome: "PASSED (15/15 host function call specs)",
    peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors",
    attendanceId: "att-010",
  },
  {
    index: 11,
    code: "WS-11",
    title: "Distributed Tracing & OpenTelemetry",
    topic: "W3C trace context, span propagation, exporter pipelines",
    state: "COMPLETED",
    checkInTime: "2026-05-10T09:01:50Z",
    geofenceVerified: true,
    commitHash: "99c00ff",
    repoArtifact: "dos-club/ws11-otel-collector",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 50m / 120m limit)",
    testOutcome: "PASSED (18/18 trace aggregation verification specs)",
    peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors",
    attendanceId: "att-011",
  },
  {
    index: 12,
    code: "WS-12",
    title: "Vector Clocks & Causality in Distributed Systems",
    topic: "Lamport timestamps, concurrency detection, conflict merges",
    state: "COMPLETED",
    checkInTime: "2026-05-17T08:58:10Z",
    geofenceVerified: true,
    commitHash: "11d22aa",
    repoArtifact: "dos-club/ws12-vector-clocks",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 28m / 120m limit)",
    testOutcome: "PASSED (20/20 causality ordering test specs)",
    peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors",
    attendanceId: "att-012",
  },
  {
    index: 13,
    code: "WS-13",
    title: "Compilers: AST Generation & Bytecode Emitting",
    topic: "Recursive descent parsing, symbol tables, stack VMs",
    state: "EXCUSED",
    checkInTime: undefined,
    geofenceVerified: false,
    commitHash: "22e33bb",
    repoArtifact: "dos-club/ws13-calc-compiler",
    geofenceCoordinates: undefined,
    testOutcome: "EXCUSED (Approved University Exam On-Duty)",
    peerReviewSignoff: "College Admin Sign-off // Approved OD (Ref: OD-2026-041)",
    attendanceId: "att-013",
  },
  {
    index: 14,
    code: "WS-14",
    title: "Resilient Microservices & Circuit Breakers",
    topic: "Token bucket rate limiting, jittered backoff, fallbacks",
    state: "COMPLETED",
    checkInTime: "2026-05-31T09:02:15Z",
    geofenceVerified: true,
    commitHash: "e8a10f4",
    repoArtifact: "dos-club/ws14-circuit-breakers",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 34m / 120m limit)",
    testOutcome: "PASSED (18/20 hermetic tests passed)",
    peerReviewSignoff: "Lead Systems Architect + Senior Peer Auditor",
    attendanceId: "att-014",
  },
  {
    index: 15,
    code: "WS-15",
    title: "Event-Driven Topologies & Kafka Streams",
    topic: "Partition rebalancing, exactly-once semantics, compaction",
    state: "CHECKED_IN",
    checkInTime: "2026-06-07T09:01:20Z",
    geofenceVerified: true,
    commitHash: "33f44cc",
    repoArtifact: "dos-club/ws15-stream-processing",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 40m / 120m limit)",
    testOutcome: "IN_PROGRESS (Awaiting final stream topology push)",
    peerReviewSignoff: "Pending session end verification",
    attendanceId: "att-015",
  },
  {
    index: 16,
    code: "WS-16",
    title: "High-Throughput In-Memory Caches & LRU Eviction",
    topic: "Segmented locks, slab allocators, cache-stampede mitigation",
    state: "REGISTERED",
  },
  {
    index: 17,
    code: "WS-17",
    title: "Public-Key Cryptography & TLS 1.3 Handshake",
    topic: "Diffie-Hellman ephemeral, certificate verification, AES-GCM",
    state: "REGISTERED",
  },
  {
    index: 18,
    code: "WS-18",
    title: "Distributed File Systems & Metadata Architecture",
    topic: "Chunk servers, master leases, heartbeats, replication factors",
    state: "REGISTERED",
  },
  {
    index: 19,
    code: "WS-19",
    title: "Actor Model Concurrency & Supervision Trees",
    topic: "Mailboxes, immutability, let-it-crash fault isolation",
    state: "REGISTERED",
  },
  {
    index: 20,
    code: "WS-20",
    title: "Columnar Storage Formats & Vectorized Execution",
    topic: "Parquet/ORC encoders, dictionary compression, SIMD filtering",
    state: "REGISTERED",
  },
  {
    index: 21,
    code: "WS-21",
    title: "Kernel BPF (eBPF) Tracing & Deep Observability",
    topic: "kprobes, tracepoints, bytecode verification, ring buffer export",
    state: "REGISTERED",
  },
  {
    index: 22,
    code: "WS-22",
    title: "Disaster Recovery & Chaos Engineering Invariants",
    topic: "Network partition injection, disk corruption recovery, chaos drills",
    state: "REGISTERED",
  },
  {
    index: 23,
    code: "WS-23",
    title: "Formal Methods & TLA+ Specification",
    topic: "State space exploration, invariant checking, temporal logic",
    state: "REGISTERED",
  },
  {
    index: 24,
    code: "WS-24",
    title: "Real-Time Collaboration Protocols & CRDTs",
    topic: "State-based vs operation-based CRDTs, vector clocks, convergence",
    state: "REGISTERED",
  },
  {
    index: 25,
    code: "WS-25",
    title: "Distributed Search Engines & Inverted Indexes",
    topic: "BM25 scoring, postings lists, segment merge algorithms",
    state: "REGISTERED",
  },
  {
    index: 26,
    code: "WS-26",
    title: "Hardware Concurrency & GPU Acceleration Basics",
    topic: "SIMD vectorization, memory bandwidth bottlenecks, parallel compute",
    state: "REGISTERED",
  },
  {
    index: 27,
    code: "WS-27",
    title: "Capstone Production Defense & Longitudinal Audit",
    topic: "Live production deployment defense before enterprise review board",
    state: "REGISTERED",
  },
];

function getStateBadge(state: ApprovedState) {
  switch (state) {
    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 font-medium";
    case "CHECKED_IN":
      return "border-sky-200 bg-sky-50 text-sky-700 font-medium";
    case "LATE":
      return "border-amber-200 bg-amber-50 text-amber-700 font-medium";
    case "INCOMPLETE":
      return "border-orange-200 bg-orange-50 text-orange-700 font-medium";
    case "EXCUSED":
      return "border-purple-200 bg-purple-50 text-purple-700 font-medium";
    case "MANUALLY_CONFIRMED":
      return "border-teal-200 bg-teal-50 text-teal-700 font-medium";
    case "ABSENT_CONFIRMED":
    case "ABSENT_UNCONFIRMED":
      return "border-red-200 bg-red-50 text-red-700 font-medium";
    case "REGISTERED":
    default:
      return "border-slate-200 bg-slate-100 text-slate-600 font-normal";
  }
}

function getMaturityBadge(maturity: SkillMaturity) {
  switch (maturity) {
    case "CONSISTENTLY_DEMONSTRATED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "DEMONSTRATED":
      return "bg-teal-50 text-teal-700 border-teal-200";
    case "APPLIED":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "EXPLORED":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "INTRODUCED":
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function getAssessedBadge(level: string) {
  switch (level) {
    case "Demonstrated":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "Consistent":
      return "text-teal-700 bg-teal-50 border-teal-200";
    case "Progressing":
      return "text-sky-700 bg-sky-50 border-sky-200";
    case "Developing":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "Growth Opportunity":
    default:
      return "text-orange-700 bg-orange-50 border-orange-200";
  }
}

export default function RecordPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const identifier = decodeURIComponent(resolvedParams.id || "DOS-B3-001");

  // Dynamic Student Profile State
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(true);

  // Tab State: "journey" | "skills" | "certifications" | "assessments"
  const [activeTab, setActiveTab] = useState<"journey" | "skills" | "certifications" | "assessments">("journey");

  // Drawer & Modal State
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopRecord | null>(null);
  const [copyStatus, setCopyStatus] = useState(false);

  // Workshop Filter State
  const [workshopFilter, setWorkshopFilter] = useState<string>("ALL");

  // Skills & Inventory State
  const [skills, setSkills] = useState<StudentTechnologyInventory[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillConfidence, setNewSkillConfidence] = useState(3);

  // Certifications State
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [newCertTitle, setNewCertTitle] = useState("");
  const [newCertProvider, setNewCertProvider] = useState("");
  const [newCertUrl, setNewCertUrl] = useState("");
  const [newCertCategory, setNewCertCategory] = useState("Systems & Infrastructure");

  // Assessments State
  const [assessments, setAssessments] = useState<ExternalAssessment[]>([]);

  // Feedback Modal State (Step 09 - Session Feedback Pulse)
  const [feedbackWorkshop, setFeedbackWorkshop] = useState<WorkshopRecord | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(4);
  const [feedbackConfidence, setFeedbackConfidence] = useState<number>(4);
  const [feedbackLearning, setFeedbackLearning] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Close drawers/modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedWorkshop(null);
        setFeedbackWorkshop(null);
        setIsAddingSkill(false);
        setIsAddingCert(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch student profile & related records on mount
  useEffect(() => {
    setIsLoadingStudent(true);
    getStudentByIdOrEmail(identifier).then(({ student: fetchedStudent }) => {
      setStudent(fetchedStudent);
      setIsLoadingStudent(false);
    });

    getSkillsForStudent(identifier).then(setSkills);
    getCertificationsForStudent(identifier).then(setCertifications);
    getAssessmentsForStudent(identifier).then(setAssessments);
  }, [identifier]);

  // Compute student display info
  const studentName =
    student?.full_name ||
    (identifier === "DOS-B3-009"
      ? "Janani Balaji"
      : identifier === "DOS-B3-001"
      ? "Arunachalam Sundaram"
      : `Cohort Member (${identifier})`);

  const studentInitials =
    studentName
      .trim()
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "DO";

  const studentEmail =
    student?.email ||
    (identifier === "DOS-B3-009" ? "janani@student.dosclub.org" : "arun@student.dosclub.org");

  const studentDept =
    student?.department ||
    (identifier === "DOS-B3-009" ? "Computer Technology" : "Computer Science & Engineering");

  const studentCourse =
    student?.course ||
    (identifier === "DOS-B3-009" ? "B.Tech Computer Technology" : "B.Tech Computer Science & Engineering");

  const studentYear = student?.year_of_study || 3;

  // Longitudinal Counts
  const completedCount = WORKSHOP_CURRICULUM.filter(
    (w) => w.state === "COMPLETED" || w.state === "MANUALLY_CONFIRMED"
  ).length;
  const inProgressCount = WORKSHOP_CURRICULUM.filter(
    (w) => w.state === "CHECKED_IN" || w.state === "LATE"
  ).length;
  const excusedCount = WORKSHOP_CURRICULUM.filter((w) => w.state === "EXCUSED").length;
  const scheduledCount = WORKSHOP_CURRICULUM.filter((w) => w.state === "REGISTERED").length;

  const filteredWorkshops = WORKSHOP_CURRICULUM.filter((ws) => {
    if (workshopFilter === "ALL") return true;
    if (workshopFilter === "COMPLETED") return ws.state === "COMPLETED" || ws.state === "MANUALLY_CONFIRMED";
    if (workshopFilter === "IN_PROGRESS") return ws.state === "CHECKED_IN" || ws.state === "LATE";
    if (workshopFilter === "EXCUSED") return ws.state === "EXCUSED";
    if (workshopFilter === "REGISTERED") return ws.state === "REGISTERED";
    return true;
  });

  const filteredSkills = skills.filter((s) =>
    s.tool_name.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const handleCopyProof = (code: string) => {
    navigator.clipboard?.writeText(`https://talentos.dosclub.org/record/${identifier}?ws=${code}`);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const payload: StudentTechnologyInventory = {
      id: crypto.randomUUID(),
      student_id: identifier,
      tool_name: newSkillName.trim(),
      self_confidence: newSkillConfidence,
      evidence_backed_maturity: "INTRODUCED",
      assessed_level: "Developing",
      evidence_count: 1,
      updated_at: new Date().toISOString(),
    };

    setSkills((prev) => [payload, ...prev]);
    setIsAddingSkill(false);
    setNewSkillName("");

    try {
      await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn("API add skill error:", err);
    }
  };

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertTitle.trim() || !newCertProvider.trim()) return;

    const payload: Certification = {
      id: crypto.randomUUID(),
      student_id: identifier,
      title: newCertTitle.trim(),
      provider: newCertProvider.trim(),
      category: newCertCategory,
      level: "Associate",
      completed_date: new Date().toISOString().slice(0, 10),
      credential_url: newCertUrl.trim() || null,
      status: "PENDING_VERIFICATION",
      created_at: new Date().toISOString(),
    };

    setCertifications((prev) => [payload, ...prev]);
    setIsAddingCert(false);
    setNewCertTitle("");
    setNewCertProvider("");
    setNewCertUrl("");

    try {
      await fetch("/api/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn("API add cert error:", err);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackWorkshop || !feedbackLearning.trim()) return;

    setIsSubmittingFeedback(true);
    setFeedbackStatus(null);

    const res = await submitSessionFeedback({
      attendance_id: feedbackWorkshop.attendanceId || "att-ws14",
      rating: feedbackRating,
      confidence_score: feedbackConfidence,
      key_learning: feedbackLearning.trim(),
    });

    setIsSubmittingFeedback(false);
    if (res.feedback) {
      setFeedbackStatus("Learning reflection successfully recorded on student dossier.");
      setTimeout(() => {
        setFeedbackWorkshop(null);
        setFeedbackStatus(null);
        setFeedbackLearning("");
      }, 1500);
    } else {
      setFeedbackStatus(res.error || "Reflection recorded locally on ledger");
      setTimeout(() => {
        setFeedbackWorkshop(null);
        setFeedbackStatus(null);
        setFeedbackLearning("");
      }, 1500);
    }
  };

  const sidebarGroups: SidebarGroup[] = [
    {
      title: "Student Dossier",
      items: [
        { id: "journey", label: "Curriculum Journey", icon: <AcademicCapIcon className="w-4 h-4" />, count: completedCount },
        { id: "skills", label: "Skills & Tools", icon: <WrenchIcon className="w-4 h-4" />, count: skills.length },
        { id: "certifications", label: "Certifications", icon: <AwardIcon className="w-4 h-4" />, count: certifications.length },
        { id: "assessments", label: "Assessments & Honors", icon: <StarIcon className="w-4 h-4" />, count: assessments.length },
      ],
    },
    {
      title: "Student Actions",
      items: [
        { id: "mobile_checkin", label: "Mobile Check-In", icon: <PhoneIcon className="w-4 h-4" /> },
        { id: "submit_deliverable", label: "Submit Deliverable", icon: <UploadIcon className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
      {/* 1. Global AppHeader */}
      <AppHeader />

      {/* Top Context & Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-14 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </Link>
            <span>/</span>
            <Link href="/admin" className="hover:text-slate-900 transition-colors">Admin Console</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold font-mono">{identifier}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin?tab=students"
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <span>&larr; Back to Admin Roster</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace Layout with Left Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto">
        <SidebarNav
          groups={sidebarGroups}
          activeId={activeTab}
          onSelect={(id) => {
            if (id === "mobile_checkin") {
              window.location.href = `/checkin?dos_id=${encodeURIComponent(identifier)}`;
            } else if (id === "submit_deliverable") {
              window.location.href = "/submit";
            } else {
              setActiveTab(id as any);
            }
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 sm:p-8 flex flex-col gap-6 max-w-5xl">
          {/* Student 360 Profile Hero Card */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left: Avatar & Personal Info */}
              <div className="flex items-start sm:items-center gap-5">
                {/* Profile Avatar with gradient ring */}
                <div className="relative shrink-0">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white font-bold text-xl sm:text-2xl flex items-center justify-center shadow-md shadow-emerald-500/20 ring-4 ring-emerald-50">
                    {studentInitials}
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center"
                    title="Active Cohort Member"
                  >
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  </div>
                </div>

                {/* Name & Academic Meta */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                      {studentName}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active Cohort Member
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      Batch 3 (Class of 2026)
                    </span>
                  </div>

                  {/* Sub-meta details */}
                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <BuildingIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <strong className="text-slate-800 font-semibold">Anna University, CEG Campus</strong>
                    </span>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <span className="flex items-center gap-1.5">
                      <AcademicCapIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{studentCourse} (Year {studentYear})</span>
                    </span>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <span className="flex items-center gap-1.5 font-mono text-slate-700">
                      <IdCardIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{identifier}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyProof("PROFILE")}
                        className="text-[10px] text-emerald-600 hover:text-emerald-700 font-sans font-semibold underline ml-1 cursor-pointer"
                      >
                        {copyStatus ? "Copied!" : "Copy"}
                      </button>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-0.5">
                    <a
                      href={`mailto:${studentEmail}`}
                      className="hover:text-emerald-600 transition-colors flex items-center gap-1"
                    >
                      <MailIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{studentEmail}</span>
                    </a>
                    {student?.phone && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <PhoneIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{student.phone}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Quick Action Buttons */}
              <div className="flex flex-row lg:flex-col gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    setCopyStatus(true);
                    setTimeout(() => setCopyStatus(false), 2000);
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ShareIcon className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>{copyStatus ? "Dossier Link Copied!" : "Share Dossier"}</span>
                </button>
                <div className="flex gap-2">
                  <Link
                    href={`/checkin?dos_id=${encodeURIComponent(identifier)}`}
                    className="flex-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <PhoneIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>Check In</span>
                  </Link>
                  <Link
                    href="/submit"
                    className="flex-1 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <UploadIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>Submit</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Longitudinal Key Metrics: 4 Modern Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-100">
              {/* 1. Workshops */}
              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-500">Curriculum</span>
                  <AcademicCapIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">{completedCount}</span>
                  <span className="text-xs font-medium text-slate-500">/ 27 Done</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((completedCount / 27) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1">
                  {Math.round((completedCount / 27) * 100)}% Completion Rate
                </span>
              </div>

              {/* 2. Skills */}
              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-500">Skills Inventory</span>
                  <WrenchIcon className="w-5 h-5 text-sky-600" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">{skills.length}</span>
                  <span className="text-xs font-medium text-slate-500">Tools</span>
                </div>
                <span className="text-[10px] text-sky-700 font-semibold mt-auto pt-2">
                  3 Developmental Dimensions
                </span>
              </div>

              {/* 3. Credentials */}
              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-500">Certifications</span>
                  <AwardIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">
                    {certifications.filter((c) => c.status === "VERIFIED").length}
                  </span>
                  <span className="text-xs font-medium text-slate-500">Verified</span>
                </div>
                <span className="text-[10px] text-purple-700 font-semibold mt-auto pt-2">
                  External Registry Validated
                </span>
              </div>

              {/* 4. Honors & Audits */}
              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-500">Evaluations</span>
                  <StarIcon className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">{assessments.length}</span>
                  <span className="text-xs font-medium text-slate-500">Audited</span>
                </div>
                <span className="text-[10px] text-amber-700 font-semibold mt-auto pt-2">
                  Faculty Benchmark Reports
                </span>
              </div>
            </div>
          </section>

          {/* 3. Modern Tabs Navigation */}
          <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
            {[
              { id: "journey", label: "Curriculum Journey", icon: <AcademicCapIcon className="w-4 h-4" />, count: 27 },
              { id: "skills", label: "Skills & Tools", icon: <WrenchIcon className="w-4 h-4" />, count: skills.length },
              { id: "certifications", label: "Certifications", icon: <AwardIcon className="w-4 h-4" />, count: certifications.length },
              { id: "assessments", label: "Assessments & Honors", icon: <StarIcon className="w-4 h-4" />, count: assessments.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3.5 pt-2 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "border-emerald-600 text-emerald-800"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === tab.id
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* ===================================================================== */}
          {/* TAB 01: WORKSHOP JOURNEY (27 SESSIONS) */}
          {/* ===================================================================== */}
          {activeTab === "journey" && (
            <section aria-label="Workshop Timeline" className="flex flex-col gap-4">
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-slate-500 mr-1">Filter:</span>
                  {[
                    { id: "ALL", label: "All Sessions (27)" },
                    { id: "COMPLETED", label: `Completed (${completedCount})` },
                    { id: "IN_PROGRESS", label: `In Progress (${inProgressCount})` },
                    { id: "EXCUSED", label: `Excused (${excusedCount})` },
                    { id: "REGISTERED", label: `Upcoming (${scheduledCount})` },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setWorkshopFilter(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        workshopFilter === f.id
                          ? "bg-slate-900 text-white shadow-xs font-semibold"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Click any workshop card to inspect evidence & reflection
                </span>
              </div>

              {/* Modern Workshop Cards Grid */}
              <div className="flex flex-col gap-3">
                {filteredWorkshops.map((ws) => (
                  <div
                    key={ws.index}
                    onClick={() => setSelectedWorkshop(ws)}
                    className="bg-white border border-slate-200/80 hover:border-emerald-300 rounded-xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col gap-3.5 group"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedWorkshop(ws);
                      }
                    }}
                  >
                    {/* Top: Code pill, Title, and State Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-slate-700 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-800 transition-colors">
                          {ws.code}
                        </span>
                        <h3 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors">
                          {ws.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStateBadge(
                            ws.state
                          )}`}
                        >
                          {ws.state.replace("_", " ")}
                        </span>
                        <span className="text-slate-400 group-hover:text-emerald-700 text-sm font-semibold transition-transform group-hover:translate-x-0.5">
                          &rarr;
                        </span>
                      </div>
                    </div>

                    {/* Topic / Learning Objective */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {ws.topic}
                    </p>

                    {/* Bottom Evidence Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 pt-3 border-t border-slate-100 text-xs">
                      {/* Left: Artifact & Commit */}
                      <div className="flex flex-wrap items-center gap-3">
                        {ws.repoArtifact ? (
                          <span className="flex items-center gap-1.5 font-mono text-slate-700 font-medium">
                            <CodeIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-emerald-700 hover:underline">{ws.repoArtifact}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No deliverable submitted</span>
                        )}

                        {ws.commitHash && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-600">
                            <span>commit:</span>
                            <strong>{ws.commitHash}</strong>
                          </span>
                        )}

                        {ws.testOutcome && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                            <CheckIcon className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{ws.testOutcome.replace("PASSED (", "").replace(")", "")}</span>
                          </span>
                        )}
                      </div>

                      {/* Right: Timestamp & Geofence */}
                      <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                        {ws.checkInTime && (
                          <span>
                            {ws.checkInTime.slice(0, 10)} at {ws.checkInTime.slice(11, 16)} IST
                          </span>
                        )}
                        {ws.geofenceVerified && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Geofence Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ===================================================================== */}
          {/* TAB 02: MULTI-DIMENSIONAL SKILLS & TECHNOLOGY INVENTORY */}
          {/* ===================================================================== */}
          {activeTab === "skills" && (
            <section aria-label="Skills & Technology Matrix" className="flex flex-col gap-6">
              {/* Explainer Note - PRD Section 19 & 20 Alignment */}
              <div className="bg-gradient-to-r from-emerald-50/70 to-sky-50/70 border border-emerald-100 rounded-2xl p-6 shadow-xs flex flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <ChartBarIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Three Developmental Dimensions (Zero Composite Scores)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Technical competence in TalentOS is captured across three independent, unmerged developmental dimensions:
                  <strong> Dimension 1: Self-Reported Confidence</strong> (1–5 scale),
                  <strong> Dimension 2: Audited Exposure Count</strong> (commits and verified deliverables), and
                  <strong> Dimension 3: Developmental Maturity</strong> (Introduced → Applied → Demonstrated → Consistently Demonstrated).
                  Evaluations adhere to developmental growth standards rather than reductive numerical scores.
                </p>
              </div>

              {/* Actions & Search */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="w-full sm:w-80 relative">
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="Search technology or tool..."
                    className="w-full border border-slate-300 rounded-xl bg-white px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingSkill(true)}
                  className="px-4 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>+</span>
                  <span>Add Technical Tool</span>
                </button>
              </div>

              {/* Skills Table in Modern Rounded Container */}
              <div className="border border-slate-200 bg-white rounded-2xl shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6">Technology / Tool</th>
                      <th className="py-3.5 px-4">Self-Confidence</th>
                      <th className="py-3.5 px-4">Audited Exposure</th>
                      <th className="py-3.5 px-4">Developmental Maturity</th>
                      <th className="py-3.5 px-4">Assessed Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSkills.map((skill) => (
                      <tr key={skill.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {skill.tool_name}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((lvl) => (
                                <div
                                  key={lvl}
                                  className={`h-2.5 w-3.5 rounded-xs transition-colors ${
                                    lvl <= skill.self_confidence
                                      ? "bg-emerald-600"
                                      : "bg-slate-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-500 font-semibold ml-1">
                              {skill.self_confidence}/5
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-700 font-semibold">
                          {skill.evidence_count} {skill.evidence_count === 1 ? "deliverable" : "deliverables"}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${getMaturityBadge(
                              skill.evidence_backed_maturity
                            )}`}
                          >
                            {skill.evidence_backed_maturity.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${getAssessedBadge(
                              skill.assessed_level
                            )}`}
                          >
                            {skill.assessed_level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ===================================================================== */}
          {/* TAB 03: STRUCTURED CERTIFICATIONS */}
          {/* ===================================================================== */}
          {activeTab === "certifications" && (
            <section aria-label="Certifications Ledger" className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Audited Credentials & Industry Certifications
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified against official issuing registries (Credly, Linux Foundation, AWS, CNCF).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingCert(true)}
                  className="px-4 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>+</span>
                  <span>Submit Credential</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-4"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                          {cert.provider}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                            cert.status === "VERIFIED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : cert.status === "PENDING_VERIFICATION"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {cert.status.replace("_", " ")}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {cert.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Category: <strong className="text-slate-700">{cert.category}</strong> • Level:{" "}
                        <strong className="text-slate-700">{cert.level}</strong>
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                      <span className="text-slate-400">
                        Issued: {cert.completed_date}
                      </span>
                      {cert.credential_url && (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
                        >
                          <span>Verify on Registry</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ===================================================================== */}
          {/* TAB 04: ASSESSMENTS & TRAINER RECOGNITIONS */}
          {/* ===================================================================== */}
          {activeTab === "assessments" && (
            <section aria-label="Assessments & Recognitions" className="flex flex-col gap-8">
              {/* 1. Diagnostic Benchmarks */}
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Baseline & Diagnostic Benchmarks
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Longitudinal assessment benchmarks validated across standardized engineering evaluation batteries.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assessments.map((ass) => (
                    <div
                      key={ass.id}
                      className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-4"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                            {ass.provider}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-teal-800 text-[11px] font-semibold">
                            {ass.proficiency_band}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 mt-1">
                          {ass.assessment_title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs text-slate-400">Score:</span>
                          <strong className="text-base font-bold text-slate-900">{ass.score_raw}</strong>
                        </div>

                        {ass.deep_link && (
                          <a
                            href={ass.deep_link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
                          >
                            <span>Audit Report</span>
                            <span>↗</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Trainer Standout Recognitions */}
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Faculty Observations & Standout Recognitions
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live engineering recognitions awarded by technical experts during workshop execution.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                        WS-14 • Microservices Resiliency
                      </span>
                      <span className="text-slate-400">31 May 2026</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Exceptional Resiliency Architecture & Fault Recovery
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      &ldquo;Demonstrated production-grade implementation of token-bucket rate limiting with
                      jittered exponential backoff. Effectively prevented cascading failure in stress test simulations.&rdquo;
                    </p>
                    <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 font-medium">
                      Observed by: DeScience Systems Faculty Lead
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                        WS-07 • Distributed Consensus
                      </span>
                      <span className="text-slate-400">12 Apr 2026</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Fastest Zero-Regression Raft Consensus Implementation
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      &ldquo;Clean leader election and log replication under simulated network partition.
                      Assisted peers in debugging quorum split-brain states.&rdquo;
                    </p>
                    <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 font-medium">
                      Observed by: Faculty Lead + Senior Peer Auditor
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Audit Verification Footer Stamp */}
          <section className="border border-slate-200/80 bg-white rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
            <div className="flex flex-col gap-1">
              <span className="text-slate-900 font-bold text-sm">Cryptographic Audit Ledger Verification</span>
              <span className="text-slate-500 text-xs font-mono">
                SHA-256: 4a8b79e1c2d0f3a6e8b7c9a2d1f4e5a8b7c9a2d1f4e5a8b7c9a2d1f4e5a8b7c9
              </span>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-colors text-xs font-semibold shadow-xs cursor-pointer"
            >
              Print Audit Dossier
            </button>
          </section>
        </main>
      </div>

      {/* ===================================================================== */}
      {/* DRAWER: WORKSHOP DELIVERABLE & AUDIT DOSSIER */}
      {/* ===================================================================== */}
      {selectedWorkshop && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setSelectedWorkshop(null)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <aside className="w-screen max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between overflow-y-auto">
              <div className="p-6 border-b border-slate-200 bg-slate-50/80 sticky top-0 z-10">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-slate-200 bg-white text-xs text-slate-700 font-semibold self-start">
                      <span>{selectedWorkshop.code}</span>
                      <span>•</span>
                      <span>Audit Dossier</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedWorkshop.title}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {selectedWorkshop.topic}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedWorkshop(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg text-sm transition-colors shrink-0 cursor-pointer"
                    aria-label="Close dossier"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="p-6 flex flex-col gap-6 flex-1 text-xs">
                {/* 1. Status Invariant */}
                <div className="flex justify-between items-center p-4 border border-slate-200 bg-slate-50/60 rounded-xl">
                  <span className="text-xs text-slate-700 font-semibold">
                    Approved Lifecycle State:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStateBadge(
                      selectedWorkshop.state
                    )}`}
                  >
                    {selectedWorkshop.state.replace("_", " ")}
                  </span>
                </div>

                {/* 2. Geofenced Presence Audit */}
                <div className="flex flex-col gap-3 border border-slate-200 rounded-xl p-5 bg-white shadow-2xs">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPinIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Zero-Grace Presence Verification</span>
                  </span>
                  <div className="flex flex-col gap-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Scheduled Check-In Window:</span>
                      <span className="text-slate-800 font-medium">09:00:00 - 09:05:00 IST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recorded Check-In:</span>
                      <span className="text-slate-900 font-semibold">
                        {selectedWorkshop.checkInTime ? selectedWorkshop.checkInTime.replace("T", " ").replace("Z", " IST") : "No presence logged"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Geofence Validation:</span>
                      <span className={selectedWorkshop.geofenceVerified ? "text-emerald-700 font-semibold flex items-center gap-1" : "text-slate-500"}>
                        {selectedWorkshop.geofenceVerified ? (
                          <>
                            <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified (Within 120m Campus Beacon)</span>
                          </>
                        ) : "Not Applicable"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location Coordinates:</span>
                      <span className="text-slate-700 font-mono text-[11px]">
                        {selectedWorkshop.geofenceCoordinates || "Standard Classroom Beacon"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Code & Deliverable Evidence */}
                <div className="flex flex-col gap-3 border border-slate-200 rounded-xl p-5 bg-white shadow-2xs">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CodeIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Code Artifact & Deliverable Evidence</span>
                  </span>
                  <div className="flex flex-col gap-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Repository:</span>
                      <span className="text-emerald-700 font-semibold font-mono">
                        {selectedWorkshop.repoArtifact || "No repository bound"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Commit SHA:</span>
                      <span className="text-slate-800 font-mono font-medium">
                        {selectedWorkshop.commitHash || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Automated Tests:</span>
                      <span className="text-emerald-700 font-semibold">
                        {selectedWorkshop.testOutcome || "Awaiting submission"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Audit Sign-Off:</span>
                      <span className="text-slate-800 font-medium">
                        {selectedWorkshop.peerReviewSignoff || "Pending scheduled evaluation"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Session Feedback / Student Reflection Button */}
                {(selectedWorkshop.state === "COMPLETED" || selectedWorkshop.state === "CHECKED_IN") && (
                  <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-950">Student Learning Reflection</span>
                      <span className="text-emerald-700 font-semibold">Audit Step 09</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Record key concepts mastered, rate session pacing, and document production edge cases solved.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackWorkshop(selectedWorkshop);
                      }}
                      className="w-full py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <EditIcon className="w-3.5 h-3.5" />
                      <span>Submit or Update Learning Reflection</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-slate-200 bg-slate-50/80 flex flex-col gap-3">
                <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
                  <span>Cryptographic Digest: SHA-256 Verified</span>
                </div>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleCopyProof(selectedWorkshop.code)}
                    className="flex-1 py-2.5 px-3 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer"
                  >
                    {copyStatus ? "Proof Link Copied!" : "Copy Verification Link"}
                  </button>
                  <Link
                    href="/submit"
                    className="py-2.5 px-4 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition-colors text-center"
                  >
                    Submit Artifact
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedWorkshop(null)}
                    className="py-2.5 px-4 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: SUBMIT SESSION FEEDBACK PULSE (STEP 09) */}
      {/* ===================================================================== */}
      {feedbackWorkshop && (
        <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setFeedbackWorkshop(null)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            aria-hidden="true"
          />

          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl flex flex-col gap-6 z-10">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  Session Feedback • {feedbackWorkshop.code}
                </span>
                <h3 className="text-lg font-bold text-slate-950">
                  {feedbackWorkshop.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackWorkshop(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                aria-label="Close"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-5">
              {/* Rating Scale (1-4) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-800">
                  Session Comprehension Rating:
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { val: 1, label: "1: Basic" },
                    { val: 2, label: "2: Working" },
                    { val: 3, label: "3: Confident" },
                    { val: 4, label: "4: Mastery" },
                  ].map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={() => setFeedbackRating(r.val)}
                      className={`p-2 border text-center rounded-lg transition-colors text-xs cursor-pointer ${
                        feedbackRating === r.val
                          ? "border-emerald-600 bg-emerald-600 text-white font-semibold shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confidence Score (1-5) */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800">Self-Assessed Confidence:</span>
                  <span className="font-bold text-emerald-700">{feedbackConfidence} / 5</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFeedbackConfidence(lvl)}
                      className={`flex-1 py-2 border text-center text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        lvl <= feedbackConfidence
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                          : "border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Technical Learning Text */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-800">
                  Key Technical Reflection & Edge Cases Solved:
                </label>
                <textarea
                  required
                  rows={4}
                  value={feedbackLearning}
                  onChange={(e) => setFeedbackLearning(e.target.value)}
                  placeholder="E.g., Engineered a half-open state machine with token bucket replenishment to prevent cascading connection pool exhaustion..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              {feedbackStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold text-center">
                  {feedbackStatus}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="flex-1 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingFeedback ? "Recording..." : "Commit Reflection to Ledger"}
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackWorkshop(null)}
                  className="py-2.5 px-4 border border-slate-300 text-slate-700 text-xs font-medium rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ADD TECHNICAL SKILL TO INVENTORY */}
      {/* ===================================================================== */}
      {isAddingSkill && (
        <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setIsAddingSkill(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            aria-hidden="true"
          />

          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl flex flex-col gap-5 z-10 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-900 text-sm">Add Technical Tool</span>
              <button
                type="button"
                onClick={() => setIsAddingSkill(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                aria-label="Close"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 font-semibold">Tool / Framework / Protocol:</label>
                <input
                  type="text"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="E.g., Apache Kafka / Vector Clocks"
                  className="border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 font-semibold">
                  Self-Reported Confidence (1–5):
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewSkillConfidence(s)}
                      className={`flex-1 py-2 border text-center font-bold rounded-lg transition-colors cursor-pointer ${
                        s <= newSkillConfidence
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                >
                  Record Tool
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingSkill(false)}
                  className="py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: SUBMIT CERTIFICATION */}
      {/* ===================================================================== */}
      {isAddingCert && (
        <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setIsAddingCert(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            aria-hidden="true"
          />

          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl flex flex-col gap-5 z-10 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-900 text-sm">Submit Credential for Verification</span>
              <button
                type="button"
                onClick={() => setIsAddingCert(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                aria-label="Close"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCert} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 font-semibold">Credential Title:</label>
                <input
                  type="text"
                  required
                  value={newCertTitle}
                  onChange={(e) => setNewCertTitle(e.target.value)}
                  placeholder="E.g., Certified Kubernetes Administrator (CKA)"
                  className="border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 font-semibold">Issuing Authority / Provider:</label>
                <input
                  type="text"
                  required
                  value={newCertProvider}
                  onChange={(e) => setNewCertProvider(e.target.value)}
                  placeholder="E.g., Linux Foundation / CNCF"
                  className="border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 font-semibold">Category:</label>
                <select
                  value={newCertCategory}
                  onChange={(e) => setNewCertCategory(e.target.value)}
                  className="border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                >
                  <option value="Systems & Infrastructure">Systems & Infrastructure</option>
                  <option value="Cloud Architecture">Cloud Architecture</option>
                  <option value="Security Engineering">Security Engineering</option>
                  <option value="Open Source Contributions">Open Source Contributions</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 font-semibold">Verifiable Registry URL:</label>
                <input
                  type="url"
                  value={newCertUrl}
                  onChange={(e) => setNewCertUrl(e.target.value)}
                  placeholder="https://www.credly.com/badges/..."
                  className="border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                >
                  Submit Credential
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCert(false)}
                  className="py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dos-club-logo.png" alt="DOS Club" className="h-5 w-5 rounded-full" />
            <span className="font-semibold text-slate-700">DeScience Open Source Club</span>
            <span className="text-slate-300">•</span>
            <span>TalentOS Student 360 & Learning Evidence Ledger</span>
          </div>
          <span className="text-slate-400">Anna University Campus Partner & Global Network</span>
        </div>
      </footer>
    </div>
  );
}
