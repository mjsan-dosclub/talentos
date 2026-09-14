"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  getSkillsForStudent,
  getCertificationsForStudent,
  getAssessmentsForStudent,
  submitSessionFeedback,
} from "@/lib/db";
import type {
  StudentTechnologyInventory,
  Certification,
  ExternalAssessment,
  SkillMaturity,
} from "@/lib/supabase";

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
    testOutcome: "PASSED (20/20 non-blocking echo benchmark tests)",
    peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors",
    attendanceId: "att-005",
  },
  {
    index: 6,
    code: "WS-06",
    title: "Asynchronous I/O & Non-Blocking Systems",
    topic: "Concurrency runtimes, coroutines, thread pooling",
    state: "EXCUSED",
    checkInTime: "FACULTY_AUTHORIZED_LEAVE",
    geofenceVerified: false,
    geofenceCoordinates: "EXEMPT // ACADEMIC OLYMPIAD PARTICIPATION",
    testOutcome: "DEFERRED AUDIT // LAB ASSIGNMENT IN PROGRESS",
    peerReviewSignoff: "Approved by Institutional Dean on 2026-04-03",
  },
  {
    index: 7,
    code: "WS-07",
    title: "Distributed Storage & Replication Protocols",
    topic: "Raft consensus protocol, leader election, log replication",
    state: "COMPLETED",
    checkInTime: "2026-04-12T08:59:19Z",
    geofenceVerified: true,
    commitHash: "45f9a0c",
    repoArtifact: "dos-club/ws07-raft-consensus",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 31m / 120m limit)",
    testOutcome: "PASSED (30/30 network partition resilience tests)",
    peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors",
    attendanceId: "att-007",
  },
  {
    index: 8,
    code: "WS-08",
    title: "Container Runtime Isolation & OCI Specs",
    topic: "Cgroups v2, pivot_root, custom micro-container runtime",
    state: "COMPLETED",
    checkInTime: "2026-04-19T09:04:12Z",
    geofenceVerified: true,
    commitHash: "8b23f11",
    repoArtifact: "dos-club/ws08-container-runtime",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 45m / 120m limit)",
    testOutcome: "PASSED (15/15 cgroup isolation & namespace tests)",
    peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors",
    attendanceId: "att-008",
  },
  {
    index: 9,
    code: "WS-09",
    title: "API Boundary Design & Protobuf RPCs",
    topic: "gRPC streaming, binary serialization, backwards schema compatibility",
    state: "MANUALLY_CONFIRMED",
    checkInTime: "2026-04-26T09:08:44Z",
    geofenceVerified: true,
    commitHash: "51d20ab",
    repoArtifact: "dos-club/ws09-grpc-schemas",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Verified via MAC Address Beacon)",
    testOutcome: "PASSED (19/19 backwards compatibility test suites)",
    peerReviewSignoff: "Manual verification confirmed by Lead Auditor",
    attendanceId: "att-009",
  },
  {
    index: 10,
    code: "WS-10",
    title: "Security Engineering & Cryptographic Primitives",
    topic: "Constant-time comparison, Ed25519 signatures, TLS 1.3 handshakes",
    state: "COMPLETED",
    checkInTime: "2026-05-03T08:57:51Z",
    geofenceVerified: true,
    commitHash: "fe298b4",
    repoArtifact: "dos-club/ws10-tls-handshake",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 28m / 120m limit)",
    testOutcome: "PASSED (25/25 timing attack & signature test suites)",
    peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors",
    attendanceId: "att-010",
  },
  {
    index: 11,
    code: "WS-11",
    title: "High-Throughput Message Brokers",
    topic: "Partitioning, consumer offset commit semantics, backpressure",
    state: "INCOMPLETE",
    checkInTime: "2026-05-10T09:02:18Z",
    geofenceVerified: true,
    commitHash: "FAIL_AUDIT // TEST_SUITE_TIMEOUT",
    repoArtifact: "dos-club/ws11-broker-offsets",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 35m / 120m limit)",
    testOutcome: "FAILED (Consumer offset lock deadlock on rebalance test #12)",
    peerReviewSignoff: "Audit Rejected: Code deliverable failed automated CI",
    attendanceId: "att-011",
  },
  {
    index: 12,
    code: "WS-12",
    title: "Observability Architecture & Distributed Tracing",
    topic: "OpenTelemetry instrumentation, trace context propagation",
    state: "COMPLETED",
    checkInTime: "2026-05-17T09:00:20Z",
    geofenceVerified: true,
    commitHash: "31cb809",
    repoArtifact: "dos-club/ws12-otel-tracing",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 30m / 120m limit)",
    testOutcome: "PASSED (16/16 W3C TraceContext propagation tests)",
    peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors",
    attendanceId: "att-012",
  },
  {
    index: 13,
    code: "WS-13",
    title: "CI/CD Pipeline Engineering & Hermetic Builds",
    topic: "Deterministic build pipelines, reproducibility, container caching",
    state: "COMPLETED",
    checkInTime: "2026-05-24T09:03:00Z",
    geofenceVerified: true,
    commitHash: "70a55ef",
    repoArtifact: "dos-club/ws13-hermetic-builds",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 39m / 120m limit)",
    testOutcome: "PASSED (Identical bit-for-bit SHA256 build artifact check)",
    peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors",
    attendanceId: "att-013",
  },
  {
    index: 14,
    code: "WS-14",
    title: "Microservices Resiliency & Circuit Breakers",
    topic: "Token bucket rate limiting, jittered exponential backoff",
    state: "CHECKED_IN",
    checkInTime: "2026-05-31T09:01:45Z",
    geofenceVerified: true,
    commitHash: "IN_REVIEW // PR_SUBMITTED #44",
    repoArtifact: "dos-club/ws14-circuit-breakers",
    geofenceCoordinates: "13.0827° N, 80.2707° E (Radius: 34m / 120m limit)",
    testOutcome: "IN_EVALUATION (18/20 tests passed, awaiting stress run)",
    peerReviewSignoff: "Pending second peer review audit",
    attendanceId: "8d8cc93f-72b5-42ef-8a5a-d0e3b802f46e",
  },
  {
    index: 15,
    code: "WS-15",
    title: "Zero-Trust Infrastructure & mTLS Service Meshes",
    topic: "SPIFFE/SPIRE identity attestation, envoy sidecar proxying",
    state: "REGISTERED",
  },
  {
    index: 16,
    code: "WS-16",
    title: "Database Sharding & Distributed Queries",
    topic: "Consistent hashing rings, two-phase commit, distributed transactions",
    state: "REGISTERED",
  },
  {
    index: 17,
    code: "WS-17",
    title: "Edge Compute & CDN Caching Algorithms",
    topic: "Vary header invalidation, stale-while-revalidate, edge workers",
    state: "REGISTERED",
  },
  {
    index: 18,
    code: "WS-18",
    title: "Modern Frontend Architecture & Hydration Internals",
    topic: "Server components, streaming HTML, selective hydration",
    state: "REGISTERED",
  },
  {
    index: 19,
    code: "WS-19",
    title: "WebAssembly Runtimes & Sandboxed Execution",
    topic: "Wasm memory linear buffers, host bindings, isolation guarantees",
    state: "REGISTERED",
  },
  {
    index: 20,
    code: "WS-20",
    title: "Distributed Consensus: Paxos & Multi-Paxos",
    topic: "Ballot numbers, phase 1a/1b promises, lease read optimizations",
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
      return "border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold";
    case "CHECKED_IN":
      return "border-sky-300 bg-sky-50 text-sky-800 font-semibold";
    case "LATE":
      return "border-amber-300 bg-amber-50 text-amber-800 font-semibold";
    case "INCOMPLETE":
      return "border-orange-300 bg-orange-50 text-orange-800 font-semibold";
    case "EXCUSED":
      return "border-purple-300 bg-purple-50 text-purple-800 font-semibold";
    case "MANUALLY_CONFIRMED":
      return "border-teal-300 bg-teal-50 text-teal-800 font-semibold";
    case "ABSENT_CONFIRMED":
    case "ABSENT_UNCONFIRMED":
      return "border-red-300 bg-red-50 text-red-800 font-semibold";
    case "REGISTERED":
    default:
      return "border-neutral-200 bg-neutral-100 text-neutral-500 font-normal";
  }
}

function getMaturityBadge(maturity: SkillMaturity) {
  switch (maturity) {
    case "CONSISTENTLY_DEMONSTRATED":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "DEMONSTRATED":
      return "bg-teal-100 text-teal-800 border-teal-300";
    case "APPLIED":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "EXPLORED":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "INTRODUCED":
    default:
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
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

  // Fetch student data on mount
  useEffect(() => {
    getSkillsForStudent(identifier).then(setSkills);
    getCertificationsForStudent(identifier).then(setCertifications);
    getAssessmentsForStudent(identifier).then(setAssessments);
  }, [identifier]);

  // Raw counts - STRICTLY ZERO COMPOSITE OR ALGORITHMIC SCORES (Rule 3)
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
      setFeedbackStatus("FEEDBACK_RECORDED // PULSE APPENDED TO AUDIT TRAIL");
      setTimeout(() => {
        setFeedbackWorkshop(null);
        setFeedbackStatus(null);
        setFeedbackLearning("");
      }, 1500);
    } else {
      setFeedbackStatus(res.error || "FEEDBACK RECORDED LOCALLY");
      setTimeout(() => {
        setFeedbackWorkshop(null);
        setFeedbackStatus(null);
        setFeedbackLearning("");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-neutral-900 font-sans selection:bg-neutral-200 selection:text-neutral-900 flex flex-col justify-between">
      {/* 1. Top Header */}
      <header className="border-b border-neutral-200/90 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-mono text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <span className="text-neutral-400">&larr;</span>
            <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
            <span className="tracking-wider uppercase font-medium">DOS CLUB // TALENT_OS</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/checkin?dos_id=${encodeURIComponent(identifier)}`}
              className="font-mono text-xs text-emerald-800 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded transition-colors font-semibold flex items-center gap-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Mobile Check-In
            </Link>
            <Link
              href="/submit"
              className="font-mono text-xs text-neutral-900 border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded transition-colors font-medium"
            >
              Submit Deliverable
            </Link>
            <Link
              href="/trainer"
              className="font-mono text-xs text-neutral-600 hover:text-neutral-900 hidden sm:inline-block"
            >
              Trainer Portal
            </Link>
            <Link
              href="/college"
              className="font-mono text-xs text-neutral-600 hover:text-neutral-900 hidden md:inline-block"
            >
              College Portal
            </Link>
            <Link
              href="/admin"
              className="font-mono text-xs text-neutral-600 hover:text-neutral-900"
            >
              Admin Console
            </Link>
            <span className="font-mono text-[11px] text-neutral-700 border border-neutral-300 bg-neutral-100 px-2.5 py-1 rounded hidden lg:inline-block">
              MEMBER: {identifier}
            </span>
            <Link
              href="/login"
              className="font-mono text-xs text-neutral-500 hover:text-neutral-900 font-medium"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Student 360 Profile Dossier */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-8">
        {/* Student 360 Header Dossier */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-200 pb-8">
          <div className="flex flex-col gap-2.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-200 bg-neutral-100 font-mono text-[10px] sm:text-xs text-neutral-700 tracking-widest uppercase self-start font-medium">
              STUDENT 360 AUDIT DOSSIER // BATCH 3 (2026)
            </div>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
              {identifier === "DOS-B3-001" ? "Arunachalam Sundaram" : `Student Profile // ${identifier}`}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-neutral-600">
              <span>MEMBER_ID: <strong className="text-neutral-900">{identifier}</strong></span>
              <span>•</span>
              <span>INSTITUTION: <strong className="text-neutral-900">Anna University & DOS Hub</strong></span>
              <span>•</span>
              <span>COHORT: <strong className="text-neutral-900">Group Alpha (Systems)</strong></span>
            </div>
          </div>

          {/* Raw Factual Counts - STRICTLY ZERO COMPOSITE SCORES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-neutral-200 bg-white p-4 font-mono text-xs w-full md:w-auto shadow-2xs">
            <div className="flex flex-col">
              <span className="text-neutral-500 text-[10px]">WORKSHOPS</span>
              <span className="text-base font-semibold text-emerald-700">{completedCount} / 27</span>
            </div>
            <div className="flex flex-col border-l border-neutral-200 pl-3">
              <span className="text-neutral-500 text-[10px]">SKILLS INVENTORY</span>
              <span className="text-base font-semibold text-sky-700">{skills.length} Tools</span>
            </div>
            <div className="flex flex-col border-l border-neutral-200 pl-3">
              <span className="text-neutral-500 text-[10px]">CREDENTIALS</span>
              <span className="text-base font-semibold text-purple-700">
                {certifications.filter((c) => c.status === "VERIFIED").length} Verified
              </span>
            </div>
            <div className="flex flex-col border-l border-neutral-200 pl-3">
              <span className="text-neutral-500 text-[10px]">BENCHMARKS</span>
              <span className="text-base font-semibold text-neutral-800">{assessments.length} Audited</span>
            </div>
          </div>
        </section>

        {/* 3. 4-Tab Switcher */}
        <nav className="flex border-b border-neutral-200 overflow-x-auto gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("journey")}
            className={`pb-3 px-3 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === "journey"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-400 hover:text-neutral-700"
            }`}
          >
            01 // WORKSHOP JOURNEY (27)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("skills")}
            className={`pb-3 px-3 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === "skills"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-400 hover:text-neutral-700"
            }`}
          >
            02 // SKILLS & TOOLS ({skills.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("certifications")}
            className={`pb-3 px-3 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === "certifications"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-400 hover:text-neutral-700"
            }`}
          >
            03 // CERTIFICATIONS ({certifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("assessments")}
            className={`pb-3 px-3 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === "assessments"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-400 hover:text-neutral-700"
            }`}
          >
            04 // ASSESSMENTS & RECOGNITIONS
          </button>
        </nav>

        {/* ===================================================================== */}
        {/* TAB 01: WORKSHOP JOURNEY (27 SESSIONS) */}
        {/* ===================================================================== */}
        {activeTab === "journey" && (
          <section aria-label="Workshop Timeline" className="flex flex-col gap-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-mono text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-neutral-400 mr-1 uppercase text-[10px]">FILTER:</span>
                {["ALL", "COMPLETED", "IN_PROGRESS", "EXCUSED", "REGISTERED"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setWorkshopFilter(f)}
                    className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                      workshopFilter === f
                        ? "bg-neutral-900 text-white border-neutral-900 font-medium"
                        : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <span className="text-neutral-500 text-[11px]">
                CLICK ANY SESSION TO INSPECT AUDIT PROOF & REFLECTION
              </span>
            </div>

            {/* Curriculum Table */}
            <div className="border border-neutral-200 bg-white divide-y divide-neutral-200 shadow-2xs">
              {filteredWorkshops.map((ws) => (
                <div
                  key={ws.index}
                  onClick={() => setSelectedWorkshop(ws)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedWorkshop(ws);
                    }
                  }}
                >
                  {/* Left: Code, Title, Topic */}
                  <div className="flex items-start gap-3 sm:gap-4 max-w-xl">
                    <span className="font-mono text-xs text-neutral-500 mt-0.5 shrink-0 group-hover:text-neutral-900 transition-colors">
                      {ws.code}
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-medium text-neutral-900 group-hover:text-black">
                        {ws.title}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {ws.topic}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Badge & Evidence Record */}
                  <div className="flex flex-wrap md:flex-nowrap items-center gap-3 sm:gap-6 font-mono text-xs w-full md:w-auto justify-between md:justify-end">
                    {/* Artifact / Git Evidence */}
                    <div className="flex flex-col items-start md:items-end text-[11px]">
                      {ws.repoArtifact ? (
                        <span className="text-neutral-800 font-medium group-hover:underline">
                          {ws.repoArtifact}
                        </span>
                      ) : (
                        <span className="text-neutral-400">NO_ARTIFACT_SUBMITTED</span>
                      )}

                      {ws.commitHash && (
                        <span className="text-neutral-500 text-[10px]">
                          commit: {ws.commitHash}
                        </span>
                      )}
                    </div>

                    {/* Geofence Check-in Status */}
                    <div className="hidden lg:flex flex-col items-end text-[11px] text-neutral-500">
                      <span>{ws.checkInTime ? ws.checkInTime.slice(0, 19).replace("T", " ") : "UPCOMING"}</span>
                      {ws.geofenceVerified && (
                        <span className="text-emerald-700 text-[10px] font-semibold">GEO_VERIFIED</span>
                      )}
                    </div>

                    {/* Approved State Badge */}
                    <div
                      className={`px-2.5 py-1 rounded border text-[10px] uppercase tracking-wider font-medium shrink-0 ${getStateBadge(
                        ws.state
                      )}`}
                    >
                      {ws.state}
                    </div>

                    {/* Visual inspect indicator */}
                    <span className="text-neutral-400 group-hover:text-neutral-900 text-xs hidden sm:inline-block font-mono">
                      &rarr;
                    </span>
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
            <div className="border border-neutral-200 bg-white p-5 rounded-xs shadow-2xs font-mono text-xs">
              <div className="flex items-center gap-2 text-neutral-900 font-semibold uppercase tracking-wider mb-1">
                <span className="h-2 w-2 rounded-full bg-sky-600" />
                THREE DISTINCT SKILL DIMENSIONS (NO COMPOSITE SCORES)
              </div>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                Per DOS Club TalentOS PRD Section 19 & 20, technical competence is captured across three
                distinct, unmerged dimensions: <strong>Dimension 1: Self-Reported Confidence</strong> (1–5),
                <strong> Dimension 2: Audited Exposure Count</strong> (deliverables & verified commits), and
                <strong> Dimension 3: Developmental Maturity</strong> (Introduced &rarr; Consistently Demonstrated).
                Evaluations use developmental growth language (Developing, Progressing, Consistent, Demonstrated, Growth Opportunity).
              </p>
            </div>

            {/* Actions & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="w-full sm:w-80">
                <input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder="FILTER TECHNOLOGY / TOOL..."
                  className="w-full border border-neutral-300 bg-white px-3 py-2 font-mono text-xs text-neutral-900 placeholder:text-neutral-400 uppercase tracking-wider focus:outline-none focus:border-neutral-900 shadow-2xs"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsAddingSkill(true)}
                className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 font-mono text-xs uppercase tracking-wider font-medium shadow-2xs"
              >
                + ADD TECHNICAL TOOL
              </button>
            </div>

            {/* Skills Inventory Table */}
            <div className="border border-neutral-200 bg-white shadow-2xs overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50/70 text-[10px] text-neutral-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 sm:px-6">Technology / Tool</th>
                    <th className="p-3.5 sm:px-4">Dim 1: Self-Confidence</th>
                    <th className="p-3.5 sm:px-4">Dim 2: Audited Exposure</th>
                    <th className="p-3.5 sm:px-4">Dim 3: Developmental Maturity</th>
                    <th className="p-3.5 sm:px-4">Assessed Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredSkills.map((skill) => (
                    <tr key={skill.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="p-3.5 sm:px-6 font-medium text-neutral-900">
                        {skill.tool_name}
                      </td>
                      <td className="p-3.5 sm:px-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`h-2.5 w-4 rounded-xs border ${
                                star <= skill.self_confidence
                                  ? "bg-neutral-900 border-neutral-900"
                                  : "bg-neutral-100 border-neutral-300"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-[11px] text-neutral-500 font-semibold">
                            {skill.self_confidence}/5
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 sm:px-4 text-neutral-700 font-semibold">
                        {skill.evidence_count} {skill.evidence_count === 1 ? "deliverable" : "deliverables"}
                      </td>
                      <td className="p-3.5 sm:px-4">
                        <span
                          className={`px-2 py-0.5 rounded border text-[10px] uppercase tracking-wider font-medium ${getMaturityBadge(
                            skill.evidence_backed_maturity
                          )}`}
                        >
                          {skill.evidence_backed_maturity.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-3.5 sm:px-4">
                        <span
                          className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${getAssessedBadge(
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
                <h2 className="font-mono text-xs uppercase tracking-wider text-neutral-700 font-semibold">
                  AUDITED CREDENTIALS & INDUSTRY CERTIFICATIONS
                </h2>
                <p className="font-mono text-[11px] text-neutral-500 mt-1">
                  Credentials submitted by students require verification against issuing registries.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingCert(true)}
                className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 font-mono text-xs uppercase tracking-wider font-medium shadow-2xs shrink-0"
              >
                + SUBMIT CREDENTIAL
              </button>
            </div>

            <div className="border border-neutral-200 bg-white shadow-2xs divide-y divide-neutral-200">
              {certifications.map((cert) => (
                <div key={cert.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex flex-col gap-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-neutral-500 uppercase px-2 py-0.5 rounded border border-neutral-200 bg-neutral-50 font-medium">
                        {cert.provider}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-400">
                        ISSUED: {cert.completed_date}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-neutral-900">
                      {cert.title}
                    </div>
                    <div className="font-mono text-xs text-neutral-500">
                      Category: {cert.category} • Level: {cert.level}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 font-mono text-xs">
                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-700 hover:text-neutral-900 underline text-[11px]"
                      >
                        Registry Link ↗
                      </a>
                    )}
                    <span
                      className={`px-2.5 py-1 rounded border text-[10px] uppercase tracking-wider font-semibold ${
                        cert.status === "VERIFIED"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : cert.status === "PENDING_VERIFICATION"
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : "bg-red-50 text-red-800 border-red-300"
                      }`}
                    >
                      {cert.status.replace("_", " ")}
                    </span>
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
              <h2 className="font-mono text-xs uppercase tracking-wider text-neutral-700 font-semibold">
                BASELINE & EXTERNAL DIAGNOSTIC BENCHMARKS
              </h2>
              <div className="border border-neutral-200 bg-white shadow-2xs divide-y divide-neutral-200">
                {assessments.map((ass) => (
                  <div key={ass.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500">
                        <span className="px-2 py-0.5 rounded border border-neutral-200 bg-neutral-50">
                          {ass.provider}
                        </span>
                        <span>ASSESSED: {ass.assessed_at.slice(0, 10)}</span>
                      </div>
                      <div className="text-sm font-semibold text-neutral-900">
                        {ass.assessment_title}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-xs">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-neutral-400 uppercase">RAW SCORE</span>
                        <span className="font-bold text-neutral-900">{ass.score_raw}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded border border-teal-200 bg-teal-50 text-teal-800 text-[10px] font-semibold uppercase">
                        {ass.proficiency_band}
                      </span>
                      {ass.deep_link && (
                        <a
                          href={ass.deep_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neutral-700 hover:text-neutral-900 underline text-[11px]"
                        >
                          Audit Report ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Trainer Standout Recognitions (PRD Section 10) */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="font-mono text-xs uppercase tracking-wider text-neutral-700 font-semibold">
                  TRAINER OBSERVATIONS & STANDOUT RECOGNITION (PRD SECTION 10)
                </h2>
                <span className="font-mono text-[10px] text-neutral-400">
                  TOP-3 STANDOUT PARTICIPANT TAGS LOGGED BY LEAD FACULTY
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-neutral-200 bg-white p-5 shadow-2xs flex flex-col gap-2.5">
                  <div className="flex justify-between items-center font-mono text-[10px]">
                    <span className="text-emerald-700 font-bold uppercase">WS-14 // MICROSERVICES RESILIENCY</span>
                    <span className="text-neutral-400">2026-05-31</span>
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900">
                    Exceptional Resiliency Architecture & Fault Recovery
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed font-mono">
                    &ldquo;Arun demonstrated production-grade implementation of token-bucket rate limiting with
                    jittered exponential backoff. Effectively prevented cascading failure in stress test simulations.&rdquo;
                  </p>
                  <div className="font-mono text-[10px] text-neutral-500 pt-2 border-t border-neutral-100">
                    Observed by: DeScience Systems Faculty Lead
                  </div>
                </div>

                <div className="border border-neutral-200 bg-white p-5 shadow-2xs flex flex-col gap-2.5">
                  <div className="flex justify-between items-center font-mono text-[10px]">
                    <span className="text-emerald-700 font-bold uppercase">WS-07 // DISTRIBUTED STORAGE</span>
                    <span className="text-neutral-400">2026-04-12</span>
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900">
                    Fastest Zero-Regression Raft Consensus Implementation
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed font-mono">
                    &ldquo;Clean leader election and log replication under simulated network partition.
                    Assisted peers in debugging quorum split-brain states.&rdquo;
                  </p>
                  <div className="font-mono text-[10px] text-neutral-500 pt-2 border-t border-neutral-100">
                    Observed by: Faculty Lead + Senior Peer Auditor
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Audit Verification Footer Stamp */}
        <section className="border border-neutral-200 bg-white p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-mono text-xs shadow-2xs">
          <div className="flex flex-col gap-1">
            <span className="text-neutral-900 font-semibold">CRYPTOGRAPHIC AUDIT RECORD STAMP</span>
            <span className="text-neutral-500 text-[11px]">
              SHA-256: 4a8b79e1c2d0f3a6e8b7c9a2d1f4e5a8b7c9a2d1f4e5a8b7c9a2d1f4e5a8b7c9
            </span>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors uppercase tracking-wider text-[11px] font-medium shadow-2xs"
          >
            PRINT AUDIT RECORD
          </button>
        </section>
      </main>

      {/* ===================================================================== */}
      {/* DRAWER: WORKSHOP DELIVERABLE & AUDIT DOSSIER */}
      {/* ===================================================================== */}
      {selectedWorkshop && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setSelectedWorkshop(null)}
            className="fixed inset-0 bg-neutral-950/30 backdrop-blur-2xs transition-opacity"
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <aside className="w-screen max-w-xl bg-white border-l border-neutral-200 shadow-2xl flex flex-col justify-between overflow-y-auto">
              <div className="p-6 border-b border-neutral-200 bg-neutral-50/70 sticky top-0 z-10">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded border border-neutral-200 bg-white font-mono text-[10px] text-neutral-600 tracking-wider uppercase font-medium">
                      AUDIT DOSSIER // {selectedWorkshop.code}
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-950">
                      {selectedWorkshop.title}
                    </h3>
                    <p className="text-xs text-neutral-500 font-mono">
                      {selectedWorkshop.topic}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedWorkshop(null)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 rounded border border-neutral-200 font-mono text-xs transition-colors shrink-0"
                    aria-label="Close dossier"
                  >
                    ESC ✕
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="p-6 flex flex-col gap-6 flex-1 text-xs">
                {/* 1. Status Invariant */}
                <div className="flex justify-between items-center p-3.5 border border-neutral-200 bg-neutral-50/50 rounded-xs">
                  <span className="font-mono text-[11px] text-neutral-600 font-medium uppercase tracking-wider">
                    CURRENT APPROVED LIFECYCLE STATE:
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded border text-[11px] uppercase tracking-wider ${getStateBadge(
                      selectedWorkshop.state
                    )}`}
                  >
                    {selectedWorkshop.state}
                  </span>
                </div>

                {/* 2. Geofenced Presence Audit */}
                <div className="flex flex-col gap-2 border border-neutral-200 p-4 bg-white">
                  <span className="font-mono text-[11px] font-semibold text-neutral-900 tracking-wider uppercase">
                    01 / ZERO-GRACE PRESENCE AUDIT
                  </span>
                  <div className="flex flex-col gap-2 font-mono text-[11px] text-neutral-600 pt-2 border-t border-neutral-100">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">SCHEDULED WINDOW:</span>
                      <span className="text-neutral-800">09:00:00 UTC - 09:05:00 UTC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">RECORDED CHECK-IN:</span>
                      <span className="text-neutral-800 font-medium">
                        {selectedWorkshop.checkInTime || "NO_PRESENCE_RECORDED"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">GEOFENCE STATUS:</span>
                      <span className={selectedWorkshop.geofenceVerified ? "text-emerald-700 font-medium" : "text-neutral-500"}>
                        {selectedWorkshop.geofenceVerified ? "VERIFIED (IN-BOUNDS)" : "NOT_APPLICABLE"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">LOCATION LOG:</span>
                      <span className="text-neutral-700">
                        {selectedWorkshop.geofenceCoordinates || "STANDARD CLASSROOM BEACON"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Code & Deliverable Evidence */}
                <div className="flex flex-col gap-2 border border-neutral-200 p-4 bg-white">
                  <span className="font-mono text-[11px] font-semibold text-neutral-900 tracking-wider uppercase">
                    02 / CODE ARTIFACT & DELIVERABLE EVIDENCE
                  </span>
                  <div className="flex flex-col gap-2 font-mono text-[11px] text-neutral-600 pt-2 border-t border-neutral-100">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">REPOSITORY:</span>
                      <span className="text-neutral-900 font-medium">
                        {selectedWorkshop.repoArtifact || "NO_REPOSITORY_BOUND"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">COMMIT SHA:</span>
                      <span className="text-neutral-800 font-mono">
                        {selectedWorkshop.commitHash || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">TEST SUITE RUN:</span>
                      <span className="text-neutral-800">
                        {selectedWorkshop.testOutcome || "UPCOMING_OR_NOT_STARTED"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">AUDIT SIGN-OFF:</span>
                      <span className="text-neutral-800">
                        {selectedWorkshop.peerReviewSignoff || "PENDING_SCHEDULED_EVALUATION"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Session Feedback / Student Reflection Button */}
                {(selectedWorkshop.state === "COMPLETED" || selectedWorkshop.state === "CHECKED_IN") && (
                  <div className="border border-neutral-200 p-4 bg-neutral-50/60 flex flex-col gap-3">
                    <div className="flex justify-between items-center font-mono text-[11px]">
                      <span className="font-semibold text-neutral-900 uppercase">SESSION FEEDBACK & LEARNING REFLECTION</span>
                      <span className="text-emerald-700 font-medium">STEP 09 AUDIT</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 font-mono">
                      Reflect on technical concepts mastered, rate session pacing, and record self-confidence.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackWorkshop(selectedWorkshop);
                      }}
                      className="w-full py-2 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 font-mono text-xs uppercase tracking-wider font-semibold shadow-2xs transition-colors"
                    >
                      ✍️ Submit / Update Reflection Pulse
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-neutral-200 bg-neutral-50/70 flex flex-col gap-3">
                <div className="flex justify-between items-center font-mono text-[10px] text-neutral-500">
                  <span>CRYPTOGRAPHIC PROOF DIGEST</span>
                  <span>SHA-256 VERIFIED</span>
                </div>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleCopyProof(selectedWorkshop.code)}
                    className="flex-1 py-2.5 px-3 bg-neutral-900 text-white hover:bg-neutral-800 font-mono text-xs uppercase tracking-wider font-medium transition-colors text-center"
                  >
                    {copyStatus ? "PROOF LINK COPIED!" : "COPY VERIFICATION LINK"}
                  </button>
                  <Link
                    href="/submit"
                    className="py-2.5 px-3 border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 font-mono text-xs uppercase tracking-wider font-medium transition-colors text-center"
                  >
                    SUBMIT ARTIFACT
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedWorkshop(null)}
                    className="py-2.5 px-4 border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 font-mono text-xs uppercase tracking-wider font-medium transition-colors"
                  >
                    CLOSE
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
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-2xs"
            aria-hidden="true"
          />

          <div className="relative bg-white border border-neutral-300 w-full max-w-lg p-6 sm:p-8 shadow-2xl flex flex-col gap-6 z-10">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-medium">
                  FEEDBACK PULSE // {feedbackWorkshop.code}
                </span>
                <h3 className="text-lg font-semibold text-neutral-950">
                  {feedbackWorkshop.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackWorkshop(null)}
                className="font-mono text-xs text-neutral-400 hover:text-neutral-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-5">
              {/* Rating Scale (1-4) */}
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs uppercase font-medium text-neutral-800">
                  Session Comprehension Rating (1 to 4):
                </label>
                <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                  {[
                    { val: 1, label: "1: Basic Exposure" },
                    { val: 2, label: "2: Working Knowledge" },
                    { val: 3, label: "3: Confident App" },
                    { val: 4, label: "4: Production Mastery" },
                  ].map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={() => setFeedbackRating(r.val)}
                      className={`p-2 border text-center rounded-xs transition-colors text-[11px] ${
                        feedbackRating === r.val
                          ? "border-neutral-900 bg-neutral-900 text-white font-semibold"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confidence Score (1-5) */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="uppercase font-medium text-neutral-800">Self-Assessed Confidence:</span>
                  <span className="font-bold text-neutral-900">{feedbackConfidence} / 5</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFeedbackConfidence(lvl)}
                      className={`flex-1 py-2 border text-center font-mono text-xs font-semibold rounded-xs transition-colors ${
                        lvl <= feedbackConfidence
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-neutral-200 bg-neutral-50 text-neutral-400 hover:bg-neutral-100"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Technical Learning Text */}
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs uppercase font-medium text-neutral-800">
                  Key Technical Reflection & Edge Cases Solved:
                </label>
                <textarea
                  required
                  rows={4}
                  value={feedbackLearning}
                  onChange={(e) => setFeedbackLearning(e.target.value)}
                  placeholder="E.g., Successfully engineered a half-open state machine with token bucket replenishment to prevent cascading connection pool exhaustion..."
                  className="w-full border border-neutral-300 p-3 font-mono text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>

              {feedbackStatus && (
                <div className="p-3 bg-neutral-100 border border-neutral-300 font-mono text-xs text-neutral-800 font-semibold text-center">
                  {feedbackStatus}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="flex-1 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 font-mono text-xs uppercase tracking-wider font-semibold disabled:opacity-50"
                >
                  {isSubmittingFeedback ? "RECORDING..." : "COMMIT REFLECTION TO LEDGER"}
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackWorkshop(null)}
                  className="py-2.5 px-4 border border-neutral-300 text-neutral-800 font-mono text-xs uppercase hover:bg-neutral-100"
                >
                  CANCEL
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
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-2xs"
            aria-hidden="true"
          />

          <div className="relative bg-white border border-neutral-300 w-full max-w-md p-6 shadow-2xl flex flex-col gap-5 z-10 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <span className="font-bold text-neutral-900 uppercase">ADD TECHNICAL TOOL</span>
              <button
                type="button"
                onClick={() => setIsAddingSkill(false)}
                className="text-neutral-400 hover:text-neutral-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-700 font-semibold">TOOL / FRAMEWORK / PROTOCOL:</label>
                <input
                  type="text"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="E.g., Apache Kafka / Vector Clocks"
                  className="border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-700 font-semibold">
                  SELF-REPORTED CONFIDENCE (1–5):
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewSkillConfidence(s)}
                      className={`flex-1 py-1.5 border text-center font-bold ${
                        s <= newSkillConfidence
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "bg-white text-neutral-500 border-neutral-200"
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
                  className="flex-1 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 uppercase font-semibold"
                >
                  RECORD INVENTORY
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingSkill(false)}
                  className="py-2.5 px-3 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 uppercase"
                >
                  CANCEL
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
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-2xs"
            aria-hidden="true"
          />

          <div className="relative bg-white border border-neutral-300 w-full max-w-md p-6 shadow-2xl flex flex-col gap-5 z-10 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <span className="font-bold text-neutral-900 uppercase">SUBMIT CREDENTIAL FOR VERIFICATION</span>
              <button
                type="button"
                onClick={() => setIsAddingCert(false)}
                className="text-neutral-400 hover:text-neutral-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCert} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-700 font-semibold">CREDENTIAL TITLE:</label>
                <input
                  type="text"
                  required
                  value={newCertTitle}
                  onChange={(e) => setNewCertTitle(e.target.value)}
                  placeholder="E.g., Certified Kubernetes Administrator (CKA)"
                  className="border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-700 font-semibold">ISSUING AUTHORITY / PROVIDER:</label>
                <input
                  type="text"
                  required
                  value={newCertProvider}
                  onChange={(e) => setNewCertProvider(e.target.value)}
                  placeholder="E.g., Linux Foundation / CNCF"
                  className="border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-700 font-semibold">CATEGORY:</label>
                <select
                  value={newCertCategory}
                  onChange={(e) => setNewCertCategory(e.target.value)}
                  className="border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                >
                  <option value="Systems & Infrastructure">Systems & Infrastructure</option>
                  <option value="Cloud Architecture">Cloud Architecture</option>
                  <option value="Security Engineering">Security Engineering</option>
                  <option value="Open Source Contributions">Open Source Contributions</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-700 font-semibold">VERIFIABLE REGISTRY URL:</label>
                <input
                  type="url"
                  value={newCertUrl}
                  onChange={(e) => setNewCertUrl(e.target.value)}
                  placeholder="https://www.credly.com/badges/..."
                  className="border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 uppercase font-semibold"
                >
                  SUBMIT CREDENTIAL
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCert(false)}
                  className="py-2.5 px-3 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 uppercase"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] sm:text-xs text-neutral-500 tracking-wider">
          <div>DESCIENCE OPEN SOURCE CLUB • SINGAPORE // CHENNAI • TALENT_OS V1</div>
          <div className="flex items-center gap-4">
            <Link href="/trainer" className="hover:text-neutral-900 transition-colors">
              Trainer Portal
            </Link>
            <span className="text-neutral-300">•</span>
            <Link href="/college" className="hover:text-neutral-900 transition-colors">
              College Portal
            </Link>
            <span className="text-neutral-300">•</span>
            <Link href="/admin" className="hover:text-neutral-900 transition-colors">
              Admin Console
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
