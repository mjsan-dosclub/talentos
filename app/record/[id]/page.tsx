"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";

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
    title: "Event-Sourced Architecture & CQRS",
    topic: "Append-only immutable event streams, projection recalculation",
    state: "REGISTERED",
  },
  {
    index: 19,
    code: "WS-19",
    title: "Static Analysis & Custom Linter Architecture",
    topic: "Abstract Syntax Tree parsing, memory safety inspection, rule engines",
    state: "REGISTERED",
  },
  {
    index: 20,
    code: "WS-20",
    title: "WebAssembly & Near-Native Client Sandboxing",
    topic: "Wasm binary compilation, memory linear layout, JS interop bridge",
    state: "REGISTERED",
  },
  {
    index: 21,
    code: "WS-21",
    title: "Production Incident Engineering & Post-Mortems",
    topic: "Root-cause analysis, fault-injection testing, chaos drills",
    state: "REGISTERED",
  },
  {
    index: 22,
    code: "WS-22",
    title: "Multi-Region Cloud Architecture & Disaster Recovery",
    topic: "Cross-region active-active databases, route latency failover",
    state: "REGISTERED",
  },
  {
    index: 23,
    code: "WS-23",
    title: "High-Performance Memory Allocators",
    topic: "Slab allocation, arena memory models, cache locality optimization",
    state: "REGISTERED",
  },
  {
    index: 24,
    code: "WS-24",
    title: "Institutional Audit & Threat Modeling",
    topic: "STRIDE framework, attack vector modeling, cryptographic key rotation",
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

export default function RecordPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const identifier = decodeURIComponent(resolvedParams.id || "DOS-B3-042");
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopRecord | null>(null);
  const [copyStatus, setCopyStatus] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedWorkshop(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Raw counts - STRICTLY ZERO COMPOSITE OR ALGORITHMIC SCORES (Rule 3)
  const completedCount = WORKSHOP_CURRICULUM.filter(
    (w) => w.state === "COMPLETED" || w.state === "MANUALLY_CONFIRMED"
  ).length;
  const inProgressCount = WORKSHOP_CURRICULUM.filter(
    (w) => w.state === "CHECKED_IN" || w.state === "LATE"
  ).length;
  const excusedCount = WORKSHOP_CURRICULUM.filter((w) => w.state === "EXCUSED").length;
  const registeredCount = WORKSHOP_CURRICULUM.filter((w) => w.state === "REGISTERED").length;

  const handleCopyProof = (code: string) => {
    navigator.clipboard?.writeText(`https://talentos.dosclub.org/record/${identifier}?ws=${code}`);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-neutral-900 font-sans selection:bg-neutral-200 selection:text-neutral-900 flex flex-col justify-between">
      {/* Top Header */}
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

          <div className="flex items-center gap-3">
            <Link
              href="/submit"
              className="font-mono text-xs text-neutral-900 border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded transition-colors font-medium"
            >
              Submit Deliverable
            </Link>
            <Link
              href="/talent"
              className="font-mono text-xs text-neutral-600 hover:text-neutral-900 hidden sm:inline-block"
            >
              Recruiter Explorer
            </Link>
            <Link
              href="/admin"
              className="font-mono text-xs text-neutral-600 hover:text-neutral-900"
            >
              Admin Console
            </Link>
            <span className="font-mono text-[11px] text-neutral-700 border border-neutral-300 bg-neutral-100 px-2.5 py-1 rounded hidden md:inline-block">
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

      {/* Main Record Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col gap-10">
        {/* Record Dossier Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-200 pb-8">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-200 bg-neutral-100 font-mono text-[10px] sm:text-xs text-neutral-700 tracking-widest uppercase self-start font-medium">
              LONGITUDINAL AUDIT RECORD // BATCH VERIFICATION
            </div>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
              Student Execution Record
            </h1>
            <p className="font-mono text-xs sm:text-sm text-neutral-600">
              MEMBER_ID: <span className="text-neutral-900 font-semibold">{identifier}</span> • REGION: TAMIL NADU // GLOBAL
            </p>
          </div>

          {/* Raw Factual Counts (NO composite scores or percentages) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-neutral-200 bg-white p-4 font-mono text-xs w-full md:w-auto shadow-2xs">
            <div className="flex flex-col">
              <span className="text-neutral-500 text-[10px]">COMPLETED</span>
              <span className="text-base font-semibold text-emerald-700">{completedCount} / 27</span>
            </div>
            <div className="flex flex-col border-l border-neutral-200 pl-3">
              <span className="text-neutral-500 text-[10px]">IN EVALUATION</span>
              <span className="text-base font-semibold text-sky-700">{inProgressCount}</span>
            </div>
            <div className="flex flex-col border-l border-neutral-200 pl-3">
              <span className="text-neutral-500 text-[10px]">EXCUSED</span>
              <span className="text-base font-semibold text-purple-700">{excusedCount}</span>
            </div>
            <div className="flex flex-col border-l border-neutral-200 pl-3">
              <span className="text-neutral-500 text-[10px]">SCHEDULED</span>
              <span className="text-base font-semibold text-neutral-600">{registeredCount}</span>
            </div>
          </div>
        </section>

        {/* 27-Workshop Audit Table */}
        <section aria-label="Workshop Timeline" className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-mono text-xs uppercase tracking-wider text-neutral-700 font-semibold">
              CHRONOLOGICAL WORKSHOP EVIDENCE (27 SESSIONS)
            </h2>
            <span className="font-mono text-[11px] text-neutral-500">
              CLICK ANY ROW TO INSPECT AUDIT PROOF
            </span>
          </div>

          <div className="border border-neutral-200 bg-white divide-y divide-neutral-200 shadow-2xs">
            {WORKSHOP_CURRICULUM.map((ws) => (
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

      {/* Slide-out Deliverable Artifact & Verification Drawer */}
      {selectedWorkshop && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedWorkshop(null)}
            className="fixed inset-0 bg-neutral-950/30 backdrop-blur-2xs transition-opacity"
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <aside className="w-screen max-w-xl bg-white border-l border-neutral-200 shadow-2xl flex flex-col justify-between overflow-y-auto">
              {/* Drawer Header */}
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

              {/* Drawer Body: Factual Evidence Sections */}
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

                {/* 2. Zero-Grace Geofenced Presence Audit */}
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

                {/* 3. Production Code & Deliverable Evidence */}
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

                {/* 4. Immutable Lifecycle Audit Journal */}
                <div className="flex flex-col gap-2 border border-neutral-200 p-4 bg-white">
                  <span className="font-mono text-[11px] font-semibold text-neutral-900 tracking-wider uppercase">
                    03 / LIFECYCLE EVENT JOURNAL
                  </span>
                  <div className="flex flex-col gap-3 font-mono text-[11px] pt-2 border-t border-neutral-100">
                    <div className="flex items-start gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-neutral-800 font-medium">
                          1. STATE_TRANSITION: REGISTERED
                        </span>
                        <span className="text-neutral-500 text-[10px]">
                          Automated Batch roster ingestion by SYSTEM_ENROLLMENT
                        </span>
                      </div>
                    </div>

                    {selectedWorkshop.checkInTime && selectedWorkshop.checkInTime !== "UPCOMING" && (
                      <div className="flex items-start gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-neutral-800 font-medium">
                            2. STATE_TRANSITION: CHECKED_IN
                          </span>
                          <span className="text-neutral-500 text-[10px]">
                            Presence timestamped by GEOFENCE_ATTENDANCE_ENGINE
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedWorkshop.state !== "REGISTERED" && selectedWorkshop.state !== "CHECKED_IN" && (
                      <div className="flex items-start gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-neutral-800 font-medium">
                            3. STATE_TRANSITION: {selectedWorkshop.state}
                          </span>
                          <span className="text-neutral-500 text-[10px]">
                            Deliverable verification audited by AUTOMATED_HARNESS
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center font-mono text-[11px] sm:text-xs text-neutral-500 tracking-wider">
          DESCIENCE OPEN SOURCE CLUB • SINGAPORE // CHENNAI • TALENT_OS V1
        </div>
      </footer>
    </div>
  );
}
