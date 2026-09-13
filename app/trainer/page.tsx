"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getStudents, Student } from "@/lib/db";

interface ParticipantState {
  student: Student;
  status: "NOT_STARTED" | "CHECKED_IN" | "LATE" | "COMPLETED" | "EXCUSED" | "ABSENT_UNCONFIRMED";
  source: "QR_SCAN" | "TRAINER_MANUAL" | "COLLEGE_CONFIRMED";
  checkInTime?: string;
  isStandout?: boolean;
  exceptionReason?: string;
}

export default function TrainerDashboardPage() {
  const [participants, setParticipants] = useState<ParticipantState[]>([]);
  const [qrToken, setQrToken] = useState<string>("TKN-" + Math.random().toString(36).substring(2, 10).toUpperCase());
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [activeModalStudent, setActiveModalStudent] = useState<ParticipantState | null>(null);
  const [exceptionReason, setExceptionReason] = useState("STUDENT_DEVICE_OFFLINE");
  const [customReasonText, setCustomReasonText] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Load students for today's session
  useEffect(() => {
    getStudents().then(({ students }) => {
      const initial: ParticipantState[] = students.map((s, idx) => ({
        student: s,
        status: idx === 0 ? "CHECKED_IN" : idx === 1 ? "COMPLETED" : "NOT_STARTED",
        source: idx === 0 || idx === 1 ? "QR_SCAN" : "TRAINER_MANUAL",
        checkInTime: idx === 0 ? "09:02:14 UTC" : idx === 1 ? "08:58:40 UTC" : undefined,
      }));
      setParticipants(initial);
    });
  }, []);

  // Rolling time-sensitive QR token generator (30s interval per PRD Section 10)
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setQrToken("TKN-" + Math.random().toString(36).substring(2, 10).toUpperCase());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Standout Recognition Tagger (PRD Section 5 & 17)
  const toggleStandout = (dosId: string) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.student.dos_id === dosId) {
          const next = !p.isStandout;
          setNotification(
            next
              ? `RECOGNITION // Standout engineering tagged for ${p.student.full_name}`
              : `RECOGNITION // Tag cleared for ${p.student.full_name}`
          );
          setTimeout(() => setNotification(null), 3000);
          return { ...p, isStandout: next };
        }
        return p;
      })
    );
  };

  // Manual Exception Resolution (PRD Section 12)
  const handleResolveException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalStudent) return;

    const reason = exceptionReason === "OTHER" ? customReasonText.trim() : exceptionReason;
    if (!reason) return;

    setParticipants((prev) =>
      prev.map((p) => {
        if (p.student.dos_id === activeModalStudent.student.dos_id) {
          return {
            ...p,
            status: "CHECKED_IN",
            source: "TRAINER_MANUAL",
            checkInTime: new Date().toISOString().substring(11, 19) + " UTC",
            exceptionReason: reason,
          };
        }
        return p;
      })
    );

    setNotification(`AUDIT // Manual attendance logged for ${activeModalStudent.student.dos_id}: ${reason}`);
    setTimeout(() => setNotification(null), 4000);
    setActiveModalStudent(null);
    setCustomReasonText("");
  };

  // Metrics
  const checkedInCount = participants.filter((p) => p.status === "CHECKED_IN" || p.status === "COMPLETED").length;
  const pendingCount = participants.filter((p) => p.status === "NOT_STARTED").length;

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-neutral-900 font-sans selection:bg-neutral-200 selection:text-neutral-900 flex flex-col justify-between">
      {/* Header */}
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
            <span className="font-mono text-[11px] text-neutral-700 border border-neutral-300 bg-neutral-100 px-2.5 py-1 rounded hidden sm:inline-block">
              ROLE: TRAINER • SESSION: LIVE
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

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col gap-8">
        {/* Title */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-neutral-200 pb-6">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-200 bg-neutral-100 font-mono text-[10px] sm:text-xs text-neutral-700 tracking-widest uppercase self-start font-medium">
              TRAINER OPERATIONS PORTAL // SECTION 5 & 10
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
              Today&apos;s Workshop Session
            </h1>
            <p className="font-mono text-xs text-neutral-600">
              Ultra-lightweight trainer workflow: display live attendance QR, observe participants, and resolve exceptions.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 border border-neutral-200 bg-white p-3 font-mono text-xs shadow-2xs">
            <div className="flex flex-col">
              <span className="text-neutral-500 text-[10px]">CHECKED IN</span>
              <span className="text-base font-semibold text-emerald-700">
                {checkedInCount} / {participants.length}
              </span>
            </div>
            <div className="flex flex-col border-l border-neutral-200 pl-3">
              <span className="text-neutral-500 text-[10px]">PENDING</span>
              <span className="text-base font-semibold text-neutral-600">{pendingCount}</span>
            </div>
          </div>
        </section>

        {/* Notification Banner */}
        {notification && (
          <div className="p-3 border border-neutral-300 bg-neutral-900 text-white font-mono text-xs tracking-wider flex items-center gap-2 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* 2-Column Layout: Left = Workshop + Rolling QR; Right = Participant Roster */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (1 Col) */}
          <div className="flex flex-col gap-6">
            {/* Active Session Info */}
            <div className="border border-neutral-200 bg-white p-6 shadow-2xs flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-2xs">
                  WS-14 (SESSION 14 OF 27)
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  LIVE
                </span>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-neutral-950">
                  Resilient Microservices & Circuit Breakers
                </h2>
                <p className="font-mono text-xs text-neutral-600 mt-1">
                  Token bucket algorithms, distributed jitter, and half-open state degradation.
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-200 font-mono text-xs space-y-1.5 text-neutral-600">
                <div className="flex justify-between">
                  <span className="text-neutral-500">VENUE:</span>
                  <span className="text-neutral-900">Anna University Campus</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">MODE:</span>
                  <span className="text-neutral-900">OFFLINE (PHYSICAL)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">BATCH:</span>
                  <span className="text-neutral-900">Batch 3 (Group Alpha)</span>
                </div>
              </div>
            </div>

            {/* Rolling QR Code Display (PRD Section 10) */}
            <div className="border border-neutral-200 bg-white p-6 shadow-2xs flex flex-col items-center gap-4 text-center">
              <div className="flex justify-between items-center w-full font-mono text-xs">
                <span className="uppercase tracking-wider text-neutral-600 font-semibold text-[11px]">
                  DYNAMIC ATTENDANCE QR
                </span>
                <span className="text-neutral-900 bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded-2xs font-mono text-[11px] font-semibold">
                  ROLLS IN {String(secondsLeft).padStart(2, "0")}s
                </span>
              </div>

              {/* High-Contrast Dynamic QR Visualization */}
              <div className="p-4 bg-white border-2 border-neutral-900 rounded shadow-xs flex flex-col items-center justify-center relative">
                <div className="w-48 h-48 bg-neutral-950 p-2 flex flex-col justify-between">
                  {/* Visual QR Pattern representation */}
                  <div className="flex justify-between">
                    <div className="w-12 h-12 bg-white p-2 flex items-center justify-center">
                      <div className="w-6 h-6 bg-neutral-950" />
                    </div>
                    <div className="w-8 h-8 bg-white" />
                    <div className="w-12 h-12 bg-white p-2 flex items-center justify-center">
                      <div className="w-6 h-6 bg-neutral-950" />
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5 p-2">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2.5 rounded-2xs ${
                          (i + secondsLeft) % 2 === 0 ? "bg-white" : "bg-neutral-800"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <div className="w-12 h-12 bg-white p-2 flex items-center justify-center">
                      <div className="w-6 h-6 bg-neutral-950" />
                    </div>
                    <div className="w-6 h-6 bg-white" />
                    <div className="w-8 h-8 bg-white" />
                  </div>
                </div>

                <span className="font-mono text-[10px] text-neutral-500 mt-2">
                  TOKEN: <strong className="text-neutral-900">{qrToken}</strong>
                </span>
              </div>

              <p className="font-mono text-[11px] text-neutral-500 leading-normal">
                Students scan via TalentOS mobile PWA. Token rotates every 30s to prevent link forwarding.
              </p>
            </div>
          </div>

          {/* Right Column: Participant Roster (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="font-mono text-xs uppercase tracking-wider text-neutral-700 font-semibold">
                PARTICIPANT ROSTER // BATCH 3 (GROUP ALPHA)
              </h2>
              <span className="font-mono text-xs text-neutral-500">
                CAPACITY: {participants.length} / 40
              </span>
            </div>

            <div className="border border-neutral-200 bg-white divide-y divide-neutral-200 shadow-2xs">
              {participants.map((p) => (
                <div
                  key={p.student.dos_id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-neutral-50/50 transition-colors"
                >
                  {/* Left: Info */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-neutral-950">
                        {p.student.full_name}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-500 border border-neutral-200 px-1.5 py-0.5 rounded-2xs bg-neutral-50">
                        {p.student.dos_id}
                      </span>
                      {p.isStandout && (
                        <span className="font-mono text-[10px] bg-amber-50 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded-2xs font-semibold">
                          ⭐ STANDOUT PARTICIPANT
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-neutral-500">
                      {p.student.department || p.student.course}
                      {p.checkInTime && ` • Checked in at ${p.checkInTime}`}
                      {p.exceptionReason && (
                        <span className="text-amber-700 ml-1 font-medium">
                          [MANUAL EXCEPTION: {p.exceptionReason}]
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 font-mono text-xs self-end sm:self-center">
                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold border rounded-2xs ${
                        p.status === "CHECKED_IN" || p.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-neutral-100 text-neutral-600 border-neutral-300"
                      }`}
                    >
                      {p.status}
                    </span>

                    {/* Standout Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleStandout(p.student.dos_id)}
                      className={`px-2 py-1 text-[11px] border rounded-2xs transition-colors ${
                        p.isStandout
                          ? "bg-amber-100 text-amber-900 border-amber-300 font-semibold"
                          : "bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-100"
                      }`}
                      title="Recognize standout engineering in this session"
                    >
                      ⭐ {p.isStandout ? "RECOGNIZED" : "STANDOUT"}
                    </button>

                    {/* Manual Exception Button */}
                    {p.status === "NOT_STARTED" && (
                      <button
                        type="button"
                        onClick={() => setActiveModalStudent(p)}
                        className="px-2.5 py-1 text-[11px] border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 rounded-2xs transition-colors"
                      >
                        MANUAL CHECK-IN &rarr;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Manual Exception Modal (PRD Section 12: Every manual action requires a reason) */}
      {activeModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-300 p-6 sm:p-8 max-w-md w-full shadow-lg flex flex-col gap-5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 block">
                AUDIT LOG REQUIREMENT // SECTION 12 & 29
              </span>
              <h3 className="text-lg font-semibold text-neutral-950 mt-1">
                Manual Attendance Exception
              </h3>
              <p className="font-mono text-xs text-neutral-600 mt-1">
                Resolving check-in for <strong>{activeModalStudent.student.full_name}</strong> ({activeModalStudent.student.dos_id}).
              </p>
            </div>

            <form onSubmit={handleResolveException} className="flex flex-col gap-4 font-mono text-xs">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reasonSelect" className="text-neutral-700 font-medium text-[11px]">
                  SELECT EXCEPTION REASON
                </label>
                <select
                  id="reasonSelect"
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  className="border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 rounded-xs focus:outline-none"
                >
                  <option value="STUDENT_DEVICE_OFFLINE">Student device battery dead / unavailable</option>
                  <option value="QR_CAMERA_MALFUNCTION">Device camera malfunction / scan failure</option>
                  <option value="CONNECTIVITY_OUTAGE">Campus network / cellular connectivity issue</option>
                  <option value="STUDENT_REGISTRATION_ISSUE">Late batch roster addition / registration issue</option>
                  <option value="OTHER">Other operational exception (specify below)</option>
                </select>
              </div>

              {exceptionReason === "OTHER" && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="customReason" className="text-neutral-700 font-medium text-[11px]">
                    DOCUMENT REASON FOR AUDIT LOG
                  </label>
                  <input
                    id="customReason"
                    type="text"
                    required
                    value={customReasonText}
                    onChange={(e) => setCustomReasonText(e.target.value)}
                    placeholder="Enter operational rationale..."
                    className="border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 rounded-xs focus:outline-none"
                  />
                </div>
              )}

              <p className="text-[10px] text-neutral-500 leading-normal">
                Notice: Manual attendance updates are logged permanently into the immutable audit trail with trainer credentials.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 font-mono text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors"
                >
                  CONFIRM EXCEPTION
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalStudent(null)}
                  className="py-2.5 px-4 border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 font-mono text-xs uppercase tracking-wider rounded-xs transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center font-mono text-[11px] text-neutral-500 tracking-wider">
          DESCIENCE OPEN SOURCE CLUB • SINGAPORE // CHENNAI • TALENT_OS V1
        </div>
      </footer>
    </div>
  );
}
