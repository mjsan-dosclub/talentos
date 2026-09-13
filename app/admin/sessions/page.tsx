"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// STRICT APPROVED LIFECYCLE STATES FROM PROJECT_RULES.md
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

interface SessionStudent {
  id: string;
  fullName: string;
  institution: string;
  state: ApprovedState;
  checkInTime: string;
  distanceFromBeacon: string;
  repoArtifact: string;
  commitHash: string;
  ciTestResult: string;
  auditNotes: string;
}

const INITIAL_SESSION_STUDENTS: SessionStudent[] = [
  {
    id: "DOS-B3-001",
    fullName: "Arunachalam Sundaram",
    institution: "Anna University, Chennai",
    state: "CHECKED_IN",
    checkInTime: "09:01:45 UTC",
    distanceFromBeacon: "34m (Limit: 120m)",
    repoArtifact: "dos-club/ws14-circuit-breakers",
    commitHash: "e8a10f4",
    ciTestResult: "18/20 hermetic tests passed",
    auditNotes: "Pending review of token bucket jitter algorithm",
  },
  {
    id: "DOS-B3-002",
    fullName: "Kavitha Raman",
    institution: "PSG College of Technology",
    state: "COMPLETED",
    checkInTime: "08:59:12 UTC",
    distanceFromBeacon: "22m (Limit: 120m)",
    repoArtifact: "dos-club/ws14-resiliency-suite",
    commitHash: "90b4d11",
    ciTestResult: "20/20 hermetic tests passed",
    auditNotes: "Clean implementation of backpressure and fallback mocks",
  },
  {
    id: "DOS-B3-003",
    fullName: "Dinesh Kumar V.",
    institution: "NIT Trichy",
    state: "LATE",
    checkInTime: "09:12:30 UTC",
    distanceFromBeacon: "62m (Limit: 120m)",
    repoArtifact: "dos-club/ws14-breaker-patterns",
    commitHash: "5f3a802",
    ciTestResult: "17/20 hermetic tests passed",
    auditNotes: "Logged 7 minutes past zero-grace window cutoff",
  },
  {
    id: "DOS-B3-004",
    fullName: "Meera Subramanian",
    institution: "IIT Madras Research Park",
    state: "CHECKED_IN",
    checkInTime: "09:02:18 UTC",
    distanceFromBeacon: "41m (Limit: 120m)",
    repoArtifact: "dos-club/ws14-circuit-breaker-engine",
    commitHash: "7b4c9e3",
    ciTestResult: "20/20 hermetic tests passed",
    auditNotes: "Pull request submitted with benchmark metrics",
  },
  {
    id: "DOS-B3-005",
    fullName: "Siddharth Rajan",
    institution: "Thiagarajar College of Engineering",
    state: "INCOMPLETE",
    checkInTime: "09:03:50 UTC",
    distanceFromBeacon: "48m (Limit: 120m)",
    repoArtifact: "dos-club/ws14-rate-limiter",
    commitHash: "2c890ab",
    ciTestResult: "12/20 tests failed (concurrency race condition)",
    auditNotes: "Mutex deadlock identified under load benchmark",
  },
  {
    id: "DOS-B3-006",
    fullName: "Naveen Raj",
    institution: "SSN College of Engineering",
    state: "EXCUSED",
    checkInTime: "EXEMPT // LAB CONFLICT",
    distanceFromBeacon: "N/A",
    repoArtifact: "PENDING_LAB_SUBMISSION",
    commitHash: "N/A",
    ciTestResult: "Deferred until 2026-06-02",
    auditNotes: "Prior notice filed and approved by faculty lead",
  },
  {
    id: "DOS-B3-007",
    fullName: "Priya Dharshini",
    institution: "Coimbatore Institute of Technology",
    state: "ABSENT_UNCONFIRMED",
    checkInTime: "NO_RECORDED_PRESENCE",
    distanceFromBeacon: "OUT_OF_BOUNDS",
    repoArtifact: "NO_SUBMISSION",
    commitHash: "N/A",
    ciTestResult: "N/A",
    auditNotes: "No presence logged within zero-grace geofence window",
  },
];

const ALL_APPROVED_STATES: ApprovedState[] = [
  "REGISTERED",
  "CHECKED_IN",
  "LATE",
  "INCOMPLETE",
  "COMPLETED",
  "ABSENT_UNCONFIRMED",
  "ABSENT_CONFIRMED",
  "EXCUSED",
  "MANUALLY_CONFIRMED",
];

function getStateBadgeClass(state: ApprovedState) {
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

export default function SessionAuditorPage() {
  const [students, setStudents] = useState<SessionStudent[]>(INITIAL_SESSION_STUDENTS);
  const [isWindowOpen, setIsWindowOpen] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(184); // 3m 04s countdown
  const [selectedWorkshop, setSelectedWorkshop] = useState("WS-14");
  const [filterState, setFilterState] = useState<string>("ALL");
  const [notification, setNotification] = useState<string | null>(null);

  // Geofence countdown timer
  useEffect(() => {
    if (!isWindowOpen || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isWindowOpen, secondsRemaining]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // State Transition Auditor
  const handleUpdateStudentState = (studentId: string, newState: ApprovedState) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            state: newState,
            auditNotes: `Audited state transition to ${newState} by Faculty Lead`,
          };
        }
        return s;
      })
    );

    setNotification(`STATE_UPDATED // ${studentId} TRANSITIONED TO ${newState}`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Factual Attendance Metrics (Zero Composite Scores)
  const completedCount = students.filter(
    (s) => s.state === "COMPLETED" || s.state === "MANUALLY_CONFIRMED"
  ).length;
  const presentCount = students.filter(
    (s) => s.state === "CHECKED_IN" || s.state === "LATE" || s.state === "COMPLETED"
  ).length;
  const lateCount = students.filter((s) => s.state === "LATE").length;
  const absentCount = students.filter(
    (s) => s.state === "ABSENT_UNCONFIRMED" || s.state === "ABSENT_CONFIRMED"
  ).length;

  const filteredStudents = students.filter((s) => {
    if (filterState === "ALL") return true;
    return s.state === filterState;
  });

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-neutral-900 font-sans selection:bg-neutral-200 selection:text-neutral-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-neutral-200/90 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <span className="text-neutral-400">&larr;</span>
              <span>ADMIN CONSOLE</span>
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="font-mono text-xs text-neutral-900 uppercase font-semibold">
              LIVE SESSION AUDITOR
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-neutral-700 border border-neutral-300 bg-neutral-100 px-2.5 py-1 rounded hidden sm:inline-block">
              FACULTY CLEARANCE: STRICT • BATCH: ACTIVE
            </span>
            <Link
              href="/login"
              className="text-neutral-500 hover:text-neutral-900 font-medium"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 flex flex-col gap-8">
        {/* Session Selector & Title */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-200 pb-6">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-200 bg-neutral-100 font-mono text-[10px] sm:text-xs text-neutral-700 tracking-widest uppercase self-start font-medium">
              REAL-TIME AUDIT CONTROLLER // WORKSHOP EVALUATION
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
              Session Execution & Deliverables Auditor
            </h1>
            <p className="font-mono text-xs text-neutral-600">
              Manage zero-grace attendance windows and verify engineering deliverables strictly across the 9 approved lifecycle states.
            </p>
          </div>

          {/* Workshop Switcher */}
          <div className="flex flex-col gap-1 w-full md:w-auto font-mono text-xs">
            <label className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
              ACTIVE WORKSHOP MODULE
            </label>
            <select
              value={selectedWorkshop}
              onChange={(e) => setSelectedWorkshop(e.target.value)}
              className="border border-neutral-300 bg-white px-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none shadow-2xs font-medium"
            >
              <option value="WS-14">WS-14: Microservices Resiliency & Circuit Breakers</option>
              <option value="WS-13">WS-13: CI/CD Pipeline Engineering & Hermetic Builds</option>
              <option value="WS-12">WS-12: Observability Architecture & Distributed Tracing</option>
              <option value="WS-11">WS-11: High-Throughput Message Brokers</option>
              <option value="WS-10">WS-10: Security Engineering & Cryptographic Primitives</option>
            </select>
          </div>
        </section>

        {/* Geofence Command Center */}
        <section className="border border-neutral-200 bg-white p-6 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="flex items-center gap-1.5 font-semibold">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isWindowOpen && secondsRemaining > 0 ? "bg-emerald-600 animate-pulse" : "bg-neutral-400"
                  }`}
                />
                {isWindowOpen && secondsRemaining > 0 ? "GEOFENCE WINDOW ACTIVE" : "WINDOW CLOSED // ZERO-GRACE"}
              </span>
              <span className="text-neutral-300">|</span>
              <span className="text-neutral-500 font-mono text-[11px]">
                BEACON: 13.0827° N, 80.2707° E (RADIUS: 120m)
              </span>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed font-sans">
              Dynamic geofence automatically enforces the 5-minute zero-grace window. Check-ins submitted after the window closes are flagged as <code className="font-mono text-amber-800 font-medium">LATE</code> or <code className="font-mono text-red-800 font-medium">ABSENT</code>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            {/* Timer Display */}
            <div className="border border-neutral-200 bg-neutral-50 px-4 py-2.5 flex flex-col items-center justify-center font-mono">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider">WINDOW COUNTDOWN</span>
              <span className={`text-xl font-bold ${secondsRemaining > 30 ? "text-neutral-950" : "text-amber-700"}`}>
                {isWindowOpen ? formatTimer(secondsRemaining) : "00:00"}
              </span>
            </div>

            {/* Controller Action */}
            <button
              type="button"
              onClick={() => {
                if (isWindowOpen) {
                  setIsWindowOpen(false);
                  setSecondsRemaining(0);
                } else {
                  setIsWindowOpen(true);
                  setSecondsRemaining(300); // 5 mins
                }
              }}
              className="px-4 py-3 bg-neutral-900 text-white hover:bg-neutral-800 font-mono text-xs uppercase tracking-wider font-medium transition-colors shadow-2xs shrink-0"
            >
              {isWindowOpen ? "CLOSE WINDOW EARLY" : "OPEN 5-MIN WINDOW"}
            </button>
          </div>
        </section>

        {/* Factual Metrics Bar */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-neutral-200 bg-white p-4 font-mono text-xs shadow-2xs">
          <div className="flex flex-col">
            <span className="text-neutral-500 text-[10px]">PRESENT (IN BOUNDS)</span>
            <span className="text-base font-semibold text-sky-700">{presentCount} / {students.length}</span>
          </div>
          <div className="flex flex-col border-l border-neutral-200 pl-3">
            <span className="text-neutral-500 text-[10px]">VERIFIED COMPLETED</span>
            <span className="text-base font-semibold text-emerald-700">{completedCount}</span>
          </div>
          <div className="flex flex-col border-l border-neutral-200 pl-3">
            <span className="text-neutral-500 text-[10px]">LATE CHECK-INS</span>
            <span className="text-base font-semibold text-amber-700">{lateCount}</span>
          </div>
          <div className="flex flex-col border-l border-neutral-200 pl-3">
            <span className="text-neutral-500 text-[10px]">UNCONFIRMED ABSENT</span>
            <span className="text-base font-semibold text-red-700">{absentCount}</span>
          </div>
        </section>

        {/* Live Notification Bar */}
        {notification && (
          <div className="p-3 border border-emerald-300 bg-emerald-50 text-emerald-900 font-mono text-xs tracking-wider font-medium">
            {notification}
          </div>
        )}

        {/* Deliverables Audit Queue */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-neutral-900 font-semibold">
              EVALUATION QUEUE ({filteredStudents.length} SUBMISSIONS)
            </h2>

            {/* Filter by Approved State */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-neutral-500 text-[11px]">FILTER STATE:</span>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="border border-neutral-300 bg-white px-2.5 py-1 text-xs font-mono text-neutral-800 focus:outline-none shadow-2xs"
              >
                <option value="ALL">ALL STATES</option>
                {ALL_APPROVED_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Evaluation List */}
          <div className="flex flex-col gap-3">
            {filteredStudents.map((s) => (
              <div
                key={s.id}
                className="border border-neutral-200 bg-white p-5 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 hover:border-neutral-300 transition-colors"
              >
                {/* Student Info & Presence Proof */}
                <div className="flex flex-col gap-1.5 max-w-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-950 text-sm font-sans">
                      {s.fullName}
                    </span>
                    <span className="font-mono text-[11px] text-neutral-500 border border-neutral-200 px-1.5 py-0.5 rounded">
                      {s.id}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 font-mono truncate">
                    {s.institution}
                  </span>

                  <div className="flex items-center gap-3 text-[11px] font-mono pt-1 text-neutral-600">
                    <span>TIME: {s.checkInTime}</span>
                    <span className="text-neutral-300">•</span>
                    <span>DISTANCE: {s.distanceFromBeacon}</span>
                  </div>
                </div>

                {/* Deliverable Evidence */}
                <div className="flex flex-col gap-1 text-xs font-mono border-t lg:border-t-0 lg:border-l border-neutral-200 pt-3 lg:pt-0 lg:pl-6 max-w-md w-full">
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-400 text-[11px]">ARTIFACT:</span>
                    <span className="text-neutral-900 font-medium truncate">
                      {s.repoArtifact}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-400 text-[11px]">COMMIT SHA:</span>
                    <span className="text-neutral-700">{s.commitHash}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-400 text-[11px]">CI TESTS:</span>
                    <span className="text-neutral-800 font-medium">{s.ciTestResult}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-400 text-[11px]">NOTES:</span>
                    <span className="text-neutral-500 text-[11px] italic truncate">
                      {s.auditNotes}
                    </span>
                  </div>
                </div>

                {/* State Auditor Controls */}
                <div className="flex flex-col items-start lg:items-end gap-2 shrink-0 w-full lg:w-auto border-t lg:border-t-0 border-neutral-200 pt-3 lg:pt-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase">
                      CURRENT:
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] uppercase font-mono tracking-wider ${getStateBadgeClass(
                        s.state
                      )}`}
                    >
                      {s.state}
                    </span>
                  </div>

                  {/* Transition Select Box */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="font-mono text-[10px] text-neutral-500 uppercase">
                      TRANSITION TO:
                    </label>
                    <select
                      value={s.state}
                      onChange={(e) =>
                        handleUpdateStudentState(s.id, e.target.value as ApprovedState)
                      }
                      className="border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-mono text-neutral-900 focus:outline-none shadow-2xs font-medium cursor-pointer"
                    >
                      {ALL_APPROVED_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Link
                    href={`/record/${encodeURIComponent(s.id)}`}
                    className="font-mono text-[11px] text-neutral-600 hover:text-black underline mt-1"
                  >
                    View 27-Workshop Record &rarr;
                  </Link>
                </div>
              </div>
            ))}

            {filteredStudents.length === 0 && (
              <div className="p-8 text-center text-neutral-500 font-mono text-xs border border-neutral-200 bg-white">
                NO STUDENTS CURRENTLY IN THIS AUDIT STATE
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center font-mono text-[11px] sm:text-xs text-neutral-500 tracking-wider">
          DESCIENCE OPEN SOURCE CLUB • SINGAPORE // CHENNAI • TALENT_OS V1
        </div>
      </footer>
    </div>
  );
}
