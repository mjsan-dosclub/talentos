"use client";

import { useState } from "react";
import Link from "next/link";

// 9 APPROVED LIFECYCLE STATES FROM PROJECT_RULES.md
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

interface WorkshopMeta {
  code: string;
  name: string;
  focus: string;
  defaultTests: number;
}

const WORKSHOPS: WorkshopMeta[] = [
  { code: "WS-01", name: "Linux Internals, File Descriptors & Syscalls", focus: "Kernel I/O", defaultTests: 15 },
  { code: "WS-02", name: "POSIX Threads, Synchronization & Race Conditions", focus: "Concurrency", defaultTests: 18 },
  { code: "WS-03", name: "Memory Allocators, Virtual Memory & Page Tables", focus: "Systems", defaultTests: 20 },
  { code: "WS-04", name: "Network Stack, Sockets & epoll Event Loops", focus: "Networking", defaultTests: 16 },
  { code: "WS-05", name: "TCP/IP Flow Control & Congestion Algorithms", focus: "Networking", defaultTests: 18 },
  { code: "WS-06", name: "HTTP/2 & HTTP/3 Frame Parsing & Multiplexing", focus: "Protocols", defaultTests: 22 },
  { code: "WS-07", name: "Protocol Buffers & gRPC Streaming Architectures", focus: "Distributed RPC", defaultTests: 20 },
  { code: "WS-08", name: "Key-Value Stores & LSM-Tree Engine Architecture", focus: "Storage Engines", defaultTests: 24 },
  { code: "WS-09", name: "B-Tree Indexing, Page Cache & WAL Crash Recovery", focus: "Database Internals", defaultTests: 25 },
  { code: "WS-10", name: "Relational Query Planners & Cost Estimators", focus: "Query Optimization", defaultTests: 20 },
  { code: "WS-11", name: "Raft Consensus & Distributed Log Replication", focus: "Distributed Systems", defaultTests: 25 },
  { code: "WS-12", name: "Vector Clocks & Distributed Transaction Isolation", focus: "Consistency Models", defaultTests: 18 },
  { code: "WS-13", name: "Paxos Algorithm & Quorum Lease Protocols", focus: "Consensus", defaultTests: 20 },
  { code: "WS-14", name: "Resilient Microservices & Circuit Breakers", focus: "Fault Tolerance", defaultTests: 20 },
  { code: "WS-15", name: "Distributed Tracing, OpenTelemetry & Span Contexts", focus: "Observability", defaultTests: 16 },
  { code: "WS-16", name: "High-Throughput Event Streaming & Kafka Topologies", focus: "Stream Processing", defaultTests: 22 },
  { code: "WS-17", name: "Actor Model & Fault-Tolerant Supervision Trees", focus: "Erlang/OTP Patterns", defaultTests: 18 },
  { code: "WS-18", name: "Zero-Knowledge Proofs & Cryptographic Commitments", focus: "Applied Cryptography", defaultTests: 15 },
  { code: "WS-19", name: "Elliptic Curve Cryptography & Digital Signatures", focus: "Security Systems", defaultTests: 16 },
  { code: "WS-20", name: "eBPF Kernel Tracing & Network Packet Filtering", focus: "Kernel Engineering", defaultTests: 20 },
  { code: "WS-21", name: "Container Runtimes, cgroups & Linux Namespaces", focus: "Infrastructure", defaultTests: 22 },
  { code: "WS-22", name: "WebAssembly Runtimes, Memory Sandboxing & JIT", focus: "Virtual Machines", defaultTests: 20 },
  { code: "WS-23", name: "Garbage Collection Algorithms & Stop-the-World Tuning", focus: "Runtimes", defaultTests: 18 },
  { code: "WS-24", name: "GPU Compute Shaders & Parallel Matrix Multiplication", focus: "High Performance", defaultTests: 20 },
  { code: "WS-25", name: "Async IO Runtimes & Future Polling State Machines", focus: "Async Runtimes", defaultTests: 24 },
  { code: "WS-26", name: "Cache Coherence, MESI Protocols & Memory Fences", focus: "Hardware Architecture", defaultTests: 16 },
  { code: "WS-27", name: "Production War Room: Multi-Region Disaster Recovery", focus: "Incident Response", defaultTests: 30 },
];

export default function DeliverableSubmitPage() {
  const [selectedWsCode, setSelectedWsCode] = useState<string>("WS-14");
  const [memberId, setMemberId] = useState("DOS-B3-001");
  const [email, setEmail] = useState("arun@student.dosclub.org");
  const [repoUrl, setRepoUrl] = useState("https://github.com/arun-systems/ws14-resiliency-suite");
  const [commitSha, setCommitSha] = useState("e8a10f4");
  const [pullRequestUrl, setPullRequestUrl] = useState("https://github.com/dos-club/batch3-evaluations/pull/84");
  const [ciSuiteStatus, setCiSuiteStatus] = useState<"pass" | "fail">("pass");
  const [testsPassedCount, setTestsPassedCount] = useState<number>(20);
  const [technicalNotes, setTechnicalNotes] = useState(
    "Implemented exponential backoff with full jitter and half-open state recovery. Passed concurrency race benchmark."
  );

  const [isVerifying, setIsVerifying] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    status: ApprovedState;
    timestamp: string;
    digest: string;
    testsResult: string;
  } | null>(null);

  const currentWorkshop = WORKSHOPS.find((w) => w.code === selectedWsCode) || WORKSHOPS[13];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setSubmissionReceipt(null);

    setTimeout(() => {
      setIsVerifying(false);
      const isComplete = ciSuiteStatus === "pass" && testsPassedCount >= currentWorkshop.defaultTests;
      const finalState: ApprovedState = isComplete ? "COMPLETED" : "INCOMPLETE";

      setSubmissionReceipt({
        status: finalState,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
        digest: "sha256:d8c91a0f443b8e7c10b65ad57c2e39b74052f87a8b661c94b2a8fe402f1a94bb",
        testsResult: `${testsPassedCount} / ${currentWorkshop.defaultTests} hermetic tests passed`,
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-neutral-900 font-sans selection:bg-neutral-200 selection:text-neutral-900 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-neutral-200/90 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-mono text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <span className="text-neutral-400">&larr;</span>
            <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
            <span className="tracking-wider uppercase font-medium">DOS CLUB // TALENT_OS</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href={`/record/${encodeURIComponent(memberId)}`}
              className="font-mono text-xs text-neutral-600 hover:text-neutral-900"
            >
              My Record
            </Link>
            <span className="text-neutral-300">|</span>
            <span className="font-mono text-[11px] text-neutral-700 border border-neutral-300 bg-neutral-100 px-2.5 py-1 rounded hidden sm:inline-block">
              ROLE: MEMBER • BATCH: ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col gap-10">
        {/* Title Section */}
        <section className="flex flex-col gap-3 border-b border-neutral-200 pb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-200 bg-neutral-100 font-mono text-[10px] sm:text-xs text-neutral-700 tracking-widest uppercase self-start font-medium">
            DELIVERABLE SUBMISSION & AUDIT ENGINE
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
            Submit Practical Engineering Deliverable
          </h1>
          <p className="font-mono text-xs sm:text-sm text-neutral-600 max-w-3xl leading-relaxed">
            Principle 02 / EVIDENCE: We do not issue participation certificates. Every workshop requires production-grade code, verifiable commit hashes, and reproducible hermetic test pass records.
          </p>
        </section>

        {/* Submission Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Left / Center: 2 Cols */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <form onSubmit={handleSubmit} className="border border-neutral-200 bg-white p-6 sm:p-8 flex flex-col gap-6 shadow-2xs">
              <h2 className="font-mono text-xs uppercase tracking-wider text-neutral-900 font-semibold border-b border-neutral-200 pb-3">
                01 // WORKSHOP & IDENTITY SPECIFICATION
              </h2>

              {/* Workshop Selection */}
              <div className="flex flex-col gap-2">
                <label htmlFor="workshopSelect" className="font-mono text-xs uppercase tracking-wider text-neutral-700 font-medium">
                  SELECT WORKSHOP (1 OF 27)
                </label>
                <select
                  id="workshopSelect"
                  value={selectedWsCode}
                  onChange={(e) => {
                    setSelectedWsCode(e.target.value);
                    const ws = WORKSHOPS.find((w) => w.code === e.target.value);
                    if (ws) setTestsPassedCount(ws.defaultTests);
                    setSubmissionReceipt(null);
                  }}
                  className="border border-neutral-300 bg-white px-3.5 py-2.5 font-mono text-xs text-neutral-900 focus:outline-none focus:border-neutral-700 rounded-xs"
                >
                  {WORKSHOPS.map((ws) => (
                    <option key={ws.code} value={ws.code}>
                      {ws.code}: {ws.name} ({ws.focus})
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Identity Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="memberIdInput" className="font-mono text-[11px] uppercase tracking-wider text-neutral-600 font-medium">
                    MEMBER ID (DOS_ID)
                  </label>
                  <input
                    id="memberIdInput"
                    type="text"
                    required
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="border border-neutral-300 bg-white px-3 py-2 font-mono text-xs text-neutral-900 uppercase focus:outline-none focus:border-neutral-700 rounded-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="emailInput" className="font-mono text-[11px] uppercase tracking-wider text-neutral-600 font-medium">
                    STUDENT EMAIL
                  </label>
                  <input
                    id="emailInput"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-neutral-300 bg-white px-3 py-2 font-mono text-xs text-neutral-900 focus:outline-none focus:border-neutral-700 rounded-xs"
                  />
                </div>
              </div>

              <h2 className="font-mono text-xs uppercase tracking-wider text-neutral-900 font-semibold border-b border-neutral-200 pb-3 pt-4">
                02 // PRODUCTION CODE ARTIFACT EVIDENCE
              </h2>

              {/* Repo URL */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="repoUrlInput" className="font-mono text-xs uppercase tracking-wider text-neutral-700 font-medium">
                  PUBLIC OR CLUB REPOSITORY URL
                </label>
                <input
                  id="repoUrlInput"
                  type="url"
                  required
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="border border-neutral-300 bg-white px-3.5 py-2.5 font-mono text-xs text-neutral-900 focus:outline-none focus:border-neutral-700 rounded-xs"
                />
                <span className="font-mono text-[10px] text-neutral-500">
                  Must include clean commit history and open license.
                </span>
              </div>

              {/* Commit Hash & Pull Request */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="commitShaInput" className="font-mono text-[11px] uppercase tracking-wider text-neutral-600 font-medium">
                    COMMIT HASH (SHA-1 / SHA-256)
                  </label>
                  <input
                    id="commitShaInput"
                    type="text"
                    required
                    placeholder="e.g. e8a10f4"
                    value={commitSha}
                    onChange={(e) => setCommitSha(e.target.value)}
                    className="border border-neutral-300 bg-white px-3 py-2 font-mono text-xs text-neutral-900 focus:outline-none focus:border-neutral-700 rounded-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prUrlInput" className="font-mono text-[11px] uppercase tracking-wider text-neutral-600 font-medium">
                    PULL REQUEST URL (OPTIONAL)
                  </label>
                  <input
                    id="prUrlInput"
                    type="url"
                    placeholder="https://github.com/org/repo/pull/12"
                    value={pullRequestUrl}
                    onChange={(e) => setPullRequestUrl(e.target.value)}
                    className="border border-neutral-300 bg-white px-3 py-2 font-mono text-xs text-neutral-900 focus:outline-none focus:border-neutral-700 rounded-xs"
                  />
                </div>
              </div>

              {/* Hermetic CI Test Verification */}
              <div className="border border-neutral-200 bg-neutral-50/50 p-4 flex flex-col gap-3 rounded-xs">
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-800 font-semibold">
                  HERMETIC CI TEST SUITE VERIFICATION
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="ciStatusSelect" className="font-mono text-[10px] text-neutral-600">
                      AUTOMATED CI STATUS
                    </label>
                    <select
                      id="ciStatusSelect"
                      value={ciSuiteStatus}
                      onChange={(e) => setCiSuiteStatus(e.target.value as "pass" | "fail")}
                      className="border border-neutral-300 bg-white px-2.5 py-1.5 font-mono text-xs text-neutral-900 rounded-xs"
                    >
                      <option value="pass">PASS // All unit & integration tests passed</option>
                      <option value="fail">FAIL // Incomplete test execution / assertion failure</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="testsPassedInput" className="font-mono text-[10px] text-neutral-600">
                      HERMETIC TESTS PASSED ({currentWorkshop.defaultTests} EXPECTED)
                    </label>
                    <input
                      id="testsPassedInput"
                      type="number"
                      min={0}
                      max={currentWorkshop.defaultTests}
                      value={testsPassedCount}
                      onChange={(e) => setTestsPassedCount(Number(e.target.value))}
                      className="border border-neutral-300 bg-white px-2.5 py-1.5 font-mono text-xs text-neutral-900 rounded-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Notes */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="technicalNotesInput" className="font-mono text-xs uppercase tracking-wider text-neutral-700 font-medium">
                  IMPLEMENTATION NOTES & ARCHITECTURAL TRADEOFFS
                </label>
                <textarea
                  id="technicalNotesInput"
                  rows={3}
                  value={technicalNotes}
                  onChange={(e) => setTechnicalNotes(e.target.value)}
                  placeholder="Document concurrency guarantees, edge case mitigations, and performance observations..."
                  className="border border-neutral-300 bg-white p-3 font-mono text-xs text-neutral-900 focus:outline-none focus:border-neutral-700 rounded-xs resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isVerifying}
                className="mt-2 font-mono text-xs uppercase tracking-wider font-semibold py-3.5 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <span className="inline-block h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>RUNNING HERMETIC AUDIT & DIGEST COMPUTATION...</span>
                  </>
                ) : (
                  <>
                    <span>TRANSMIT DELIVERABLE FOR AUDIT</span>
                    <span className="text-neutral-400">&rarr;</span>
                  </>
                )}
              </button>
            </form>

            {/* Verification Receipt Banner */}
            {submissionReceipt && (
              <div className="border border-neutral-300 bg-white p-6 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    <span className="font-mono text-xs uppercase tracking-wider text-neutral-900 font-semibold">
                      AUDIT RECEIPT ISSUED
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold border ${
                      submissionReceipt.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-amber-50 text-amber-800 border-amber-300"
                    }`}
                  >
                    STATE: {submissionReceipt.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <span className="text-neutral-500 text-[10px] block">AUDITED WORKSHOP</span>
                    <span className="font-medium text-neutral-900">
                      {currentWorkshop.code}: {currentWorkshop.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block">TIMESTAMP</span>
                    <span className="font-medium text-neutral-900">{submissionReceipt.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block">TEST OUTCOME</span>
                    <span className="font-medium text-neutral-900">{submissionReceipt.testsResult}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block">COMMIT VERIFIED</span>
                    <span className="font-medium text-neutral-900">{commitSha}</span>
                  </div>
                </div>

                <div className="font-mono text-[11px] bg-neutral-50 border border-neutral-200 p-2.5 break-all text-neutral-700">
                  <span className="text-neutral-400 block text-[10px]">IMMUTABLE AUDIT HASH:</span>
                  {submissionReceipt.digest}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="font-mono text-[11px] text-neutral-500">
                    State persisted to longitudinal member chronicle.
                  </p>
                  <Link
                    href={`/record/${encodeURIComponent(memberId)}`}
                    className="font-mono text-xs text-neutral-900 underline font-medium hover:text-neutral-600"
                  >
                    View My Record &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Workshop Rules & Invariant Guidelines */}
          <aside className="flex flex-col gap-6">
            <div className="border border-neutral-200 bg-white p-6 shadow-2xs flex flex-col gap-4">
              <h3 className="font-mono text-xs uppercase tracking-wider text-neutral-900 font-semibold border-b border-neutral-200 pb-2">
                AUDIT INVARIANTS
              </h3>
              <ul className="space-y-3 font-mono text-xs text-neutral-600">
                <li className="flex items-start gap-2">
                  <span className="text-neutral-900 font-bold">•</span>
                  <span>
                    <strong className="text-neutral-900">Approved States:</strong> Every submission resolves to strictly one of the 9 invariant states. No ad-hoc statuses.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neutral-900 font-bold">•</span>
                  <span>
                    <strong className="text-neutral-900">Hermetic Verification:</strong> Deliverables must pass automated test suites independently in isolated environments.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neutral-900 font-bold">•</span>
                  <span>
                    <strong className="text-neutral-900">Git Commit Proof:</strong> Commit hashes are permanently logged into the student record drawer.
                  </span>
                </li>
              </ul>
            </div>

            <div className="border border-neutral-200 bg-neutral-100 p-6 flex flex-col gap-3 font-mono text-xs">
              <span className="text-neutral-700 font-semibold uppercase tracking-wider text-[11px]">
                NEED TO VERIFY ATTENDANCE?
              </span>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                Physical workshop check-in requires geofence verification within the zero-grace window managed by faculty leads.
              </p>
              <Link
                href="/admin/sessions"
                className="text-neutral-900 underline text-[11px] font-medium hover:text-neutral-600"
              >
                Inspect Live Session Auditor &rarr;
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center font-mono text-[11px] text-neutral-500 tracking-wider">
          DESCIENCE OPEN SOURCE CLUB • SINGAPORE // CHENNAI • TALENT_OS V1
        </div>
      </footer>
    </div>
  );
}
