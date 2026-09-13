"use client";

import { use } from "react";
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
  },
  {
    index: 6,
    code: "WS-06",
    title: "Asynchronous I/O & Non-Blocking Systems",
    topic: "Concurrency runtimes, coroutines, thread pooling",
    state: "EXCUSED",
    checkInTime: "FACULTY_AUTHORIZED_LEAVE",
    geofenceVerified: false,
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
  },
  {
    index: 14,
    code: "WS-14",
    title: "Microservices Resiliency & Circuit Breakers",
    topic: "Token bucket rate limiting, jittered exponential backoff",
    state: "CHECKED_IN",
    checkInTime: "2026-05-31T09:01:45Z",
    geofenceVerified: true,
    commitHash: "IN_REVIEW // CODE_SUBMITTED",
    repoArtifact: "dos-club/ws14-circuit-breakers",
  },
  // Upcoming workshops (15 through 27) registered in ledger
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
      return "border-emerald-700/60 bg-emerald-950/40 text-emerald-400";
    case "CHECKED_IN":
      return "border-sky-700/60 bg-sky-950/40 text-sky-400";
    case "LATE":
      return "border-amber-700/60 bg-amber-950/40 text-amber-400";
    case "INCOMPLETE":
      return "border-orange-700/60 bg-orange-950/40 text-orange-400";
    case "EXCUSED":
      return "border-purple-700/60 bg-purple-950/40 text-purple-400";
    case "MANUALLY_CONFIRMED":
      return "border-emerald-600/60 bg-emerald-950/30 text-emerald-300";
    case "ABSENT_CONFIRMED":
    case "ABSENT_UNCONFIRMED":
      return "border-red-800/60 bg-red-950/40 text-red-400";
    case "REGISTERED":
    default:
      return "border-neutral-800 bg-neutral-900/50 text-neutral-500";
  }
}

export default function LedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const identifier = decodeURIComponent(resolvedParams.id || "DOS-2026-B3-042");

  // Raw counts - STRICTLY ZERO COMPOSITE OR ALGORITHMIC SCORES (Rule 3)
  const completedCount = WORKSHOP_CURRICULUM.filter(
    (w) => w.state === "COMPLETED" || w.state === "MANUALLY_CONFIRMED"
  ).length;
  const inProgressCount = WORKSHOP_CURRICULUM.filter(
    (w) => w.state === "CHECKED_IN" || w.state === "LATE"
  ).length;
  const excusedCount = WORKSHOP_CURRICULUM.filter((w) => w.state === "EXCUSED").length;
  const registeredCount = WORKSHOP_CURRICULUM.filter((w) => w.state === "REGISTERED").length;

  return (
    <div className="min-h-screen bg-[#0A0D12] text-neutral-200 font-sans selection:bg-neutral-800 selection:text-neutral-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-neutral-800/80 bg-[#0A0D12]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-mono text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <span className="text-neutral-600">&larr;</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="tracking-wider uppercase font-medium">DOS CLUB // TALENT_OS</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-neutral-400 border border-neutral-800 bg-neutral-900/60 px-2.5 py-1 rounded">
              IDENTIFIER: {identifier}
            </span>
            <Link
              href="/login"
              className="font-mono text-xs text-neutral-400 hover:text-neutral-200"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Ledger Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col gap-10">
        {/* Ledger Dossier Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-800 pb-8">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-800 bg-neutral-900/60 font-mono text-[10px] sm:text-xs text-neutral-400 tracking-widest uppercase self-start">
              LONGITUDINAL AUDIT RECORD // COHORT B3_2026
            </div>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-100">
              Student Execution Ledger
            </h1>
            <p className="font-mono text-xs sm:text-sm text-neutral-400">
              DOS_ID: <span className="text-neutral-200 font-medium">{identifier}</span> • REGION: TAMIL NADU // GLOBAL
            </p>
          </div>

          {/* Raw Factual Counts (NO composite scores or percentages) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-neutral-800 bg-[#0C1017]/60 p-4 font-mono text-xs w-full md:w-auto">
            <div className="flex flex-col">
              <span className="text-neutral-500 text-[10px]">COMPLETED</span>
              <span className="text-base font-semibold text-emerald-400">{completedCount} / 27</span>
            </div>
            <div className="flex flex-col border-l border-neutral-800 pl-3">
              <span className="text-neutral-500 text-[10px]">IN EVALUATION</span>
              <span className="text-base font-semibold text-sky-400">{inProgressCount}</span>
            </div>
            <div className="flex flex-col border-l border-neutral-800 pl-3">
              <span className="text-neutral-500 text-[10px]">EXCUSED</span>
              <span className="text-base font-semibold text-purple-400">{excusedCount}</span>
            </div>
            <div className="flex flex-col border-l border-neutral-800 pl-3">
              <span className="text-neutral-500 text-[10px]">SCHEDULED</span>
              <span className="text-base font-semibold text-neutral-400">{registeredCount}</span>
            </div>
          </div>
        </section>

        {/* 27-Workshop Audit Table */}
        <section aria-label="Workshop Timeline" className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-mono text-xs uppercase tracking-wider text-neutral-400 font-medium">
              CHRONOLOGICAL WORKSHOP EVIDENCE (27 SESSIONS)
            </h2>
            <span className="font-mono text-[11px] text-neutral-600">
              GEOFENCE: DYNAMIC 120m • ZERO-GRACE
            </span>
          </div>

          <div className="border border-neutral-800 bg-[#0C1017]/40 divide-y divide-neutral-800">
            {WORKSHOP_CURRICULUM.map((ws) => (
              <div
                key={ws.index}
                className="p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-neutral-900/20 transition-colors"
              >
                {/* Left: Code, Title, Topic */}
                <div className="flex items-start gap-3 sm:gap-4 max-w-xl">
                  <span className="font-mono text-xs text-neutral-500 mt-0.5 shrink-0">
                    {ws.code}
                  </span>
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-neutral-200">
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
                      <span className="text-neutral-400 hover:text-neutral-200">
                        {ws.repoArtifact}
                      </span>
                    ) : (
                      <span className="text-neutral-600">NO_ARTIFACT_SUBMITTED</span>
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
                      <span className="text-emerald-500 text-[10px]">GEO_VERIFIED</span>
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
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Audit Verification Footer Stamp */}
        <section className="border border-neutral-800 bg-neutral-950/80 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-mono text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-neutral-300 font-medium">CRYPTOGRAPHIC AUDIT LEDGER STAMP</span>
            <span className="text-neutral-500 text-[11px]">
              SHA-256: 4a8b79e1c2d0f3a6e8b7c9a2d1f4e5a8b7c9a2d1f4e5a8b7c9a2d1f4e5a8b7c9
            </span>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-neutral-800 text-neutral-200 hover:bg-neutral-200 hover:text-neutral-950 transition-colors uppercase tracking-wider text-[11px] font-medium"
          >
            PRINT AUDIT LEDGER
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center font-mono text-[11px] text-neutral-500 tracking-wider">
          DESCIENCE OPEN SOURCE CLUB • SINGAPORE // CHENNAI • TALENT_OS V1
        </div>
      </footer>
    </div>
  );
}
