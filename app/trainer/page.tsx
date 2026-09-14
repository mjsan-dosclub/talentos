"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getStudents, Student } from "@/lib/db";
import { formatConfigTime } from "@/lib/datetime";
import { getClientSession } from "@/lib/session";
import AppHeader from "@/components/AppHeader";
import SidebarNav, { SidebarGroup } from "@/components/SidebarNav";
import {
  BoltIcon,
  UsersIcon,
  StarIcon,
  BookOpenIcon,
  SmartphoneIcon,
  XIcon,
  CheckIcon,
  ClockIcon,
  SearchIcon,
  CalendarIcon,
} from "@/components/Icons";
import WorkshopCalendar from "@/components/WorkshopCalendar";

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
  const [qrToken, setQrToken] = useState<string>("TKN-ACTIVE-SYNC");
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeModalStudent, setActiveModalStudent] = useState<ParticipantState | null>(null);
  const [exceptionReason, setExceptionReason] = useState("STUDENT_DEVICE_OFFLINE");
  const [customReasonText, setCustomReasonText] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("session");
  const [searchQuery, setSearchQuery] = useState("");
  const [origin, setOrigin] = useState<string>("");
  const [trainerName, setTrainerName] = useState<string>("Priya Sundaram");

  // Read authenticated trainer identity from session
  useEffect(() => {
    const session = getClientSession();
    if (session?.role === "TRAINER" && session.name) {
      setTrainerName(session.name);
    }
  }, []);

  // Detect current hostname/origin for optical QR generation
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // Load students for today's session
  useEffect(() => {
    getStudents().then(({ students }) => {
      const now = new Date();
      const initial: ParticipantState[] = students.map((s, idx) => ({
        student: s,
        status: idx === 0 ? "CHECKED_IN" : idx === 1 ? "COMPLETED" : "NOT_STARTED",
        source: idx === 0 || idx === 1 ? "QR_SCAN" : "TRAINER_MANUAL",
        checkInTime:
          idx === 0
            ? formatConfigTime(now)
            : idx === 1
            ? formatConfigTime(new Date(now.getTime() - 15 * 60000))
            : undefined,
      }));
      setParticipants(initial);
    });
  }, []);

  // Rolling time-sensitive QR token generator (30s interval)
  useEffect(() => {
    setMounted(true);
    setQrToken("TKN-" + Math.random().toString(36).substring(2, 10).toUpperCase());
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

  // Standout Recognition Tagger
  const toggleStandout = (dosId: string) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.student.dos_id === dosId) {
          const next = !p.isStandout;
          setNotification(
            next
              ? `Standout engineering recognition awarded to ${p.student.full_name}`
              : `Recognition tag cleared for ${p.student.full_name}`
          );
          setTimeout(() => setNotification(null), 3500);
          return { ...p, isStandout: next };
        }
        return p;
      })
    );
  };

  // Manual Exception Resolution
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
            checkInTime: formatConfigTime(new Date()),
            exceptionReason: reason,
          };
        }
        return p;
      })
    );

    setNotification(`Manual attendance recorded for ${activeModalStudent.student.full_name}: ${reason}`);
    setTimeout(() => setNotification(null), 4000);
    setActiveModalStudent(null);
    setCustomReasonText("");
  };

  // Metrics
  const checkedInCount = participants.filter((p) => p.status === "CHECKED_IN" || p.status === "COMPLETED").length;
  const pendingCount = participants.filter((p) => p.status === "NOT_STARTED").length;
  const standoutCount = participants.filter((p) => p.isStandout).length;

  const filteredParticipants = participants.filter((p) => {
    if (activeTab === "standouts" && !p.isStandout) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.student.full_name.toLowerCase().includes(q) ||
      p.student.dos_id.toLowerCase().includes(q) ||
      (p.student.department || "").toLowerCase().includes(q)
    );
  });

  const sidebarGroups: SidebarGroup[] = [
    {
      title: "Live Operations",
      items: [
        { id: "session", label: "Workshop Cockpit", icon: <BoltIcon className="w-4 h-4" /> },
        { id: "schedule", label: "Teaching Itinerary & Calendar", icon: <CalendarIcon className="w-4 h-4" />, badge: "ITINERARY" },
        { id: "roster", label: "Student Roster", icon: <UsersIcon className="w-4 h-4" />, count: participants.length },
        { id: "standouts", label: "Standout Recognitions", icon: <StarIcon className="w-4 h-4" />, count: standoutCount },
      ],
    },
    {
      title: "Tools & Resources",
      items: [
        { id: "curriculum", label: "27-Session Curriculum", icon: <BookOpenIcon className="w-4 h-4" /> },
        { id: "checkin_tool", label: "Mobile Scanner Utility", icon: <SmartphoneIcon className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
      {/* 1. Global AppHeader (Unified branding, no top bar navigation links) */}
      <AppHeader />

      {/* 2. Main Workspace Layout with HubSpot-style Left Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto">
        {/* Left Sidebar Sub-Navigation */}
        <SidebarNav
          groups={sidebarGroups}
          activeId={activeTab}
          onSelect={(id) => {
            if (id === "checkin_tool") {
              window.open("/checkin", "_blank");
            } else {
              setActiveTab(id);
            }
          }}
        />

        {/* Right Content Area */}
        <main className="flex-1 p-6 sm:p-8 flex flex-col gap-6 max-w-5xl">
          {/* Notification Toast */}
          {notification && (
            <div className="p-4 bg-slate-900 text-white rounded-xl text-xs font-medium flex items-center justify-between shadow-md border border-slate-800 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{notification}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
                aria-label="Dismiss"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {activeTab === "schedule" ? (
            <WorkshopCalendar
              role="TRAINER"
              trainerName={trainerName}
              title="Expert Teaching Itinerary & Calendar"
              subtitle="Your assigned workshops across university hubs. Verify upcoming delivery dates, student cohorts, and campus venues."
            />
          ) : (
            <>
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-semibold mb-1">
                Technical Expert Lead Cockpit
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                WS-14: Resilient Microservices & Circuit Breakers
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Anna University Campus Hub • Batch 3 Cohort Alpha • Session 14 of 27
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                Session Active (Physical)
              </span>
            </div>
          </div>

          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Checked In (Present)
                </span>
                <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                  {checkedInCount} / {participants.length}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  {Math.round((checkedInCount / (participants.length || 1)) * 100)}% present rate
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckIcon className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Pending Check-In
                </span>
                <span className="text-2xl font-bold text-amber-700 mt-1 block">
                  {pendingCount}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Awaiting QR scan or manual log
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <ClockIcon className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Standouts Recognized
                </span>
                <span className="text-2xl font-bold text-purple-700 mt-1 block">
                  {standoutCount}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Tagged for leadership dossier
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <StarIcon className="w-5 h-5 fill-purple-600" />
              </div>
            </div>
          </div>

          {/* 2-Column Live Session View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Dynamic QR Attendance Code */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col items-center text-center gap-4">
              <div className="flex justify-between items-center w-full">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Dynamic Attendance QR
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                  Rolls in {String(secondsLeft).padStart(2, "0")}s
                </span>
              </div>

              {/* High-Contrast Optical QR Code (100% Scannable by Mobile Cameras) */}
              {(() => {
                const effectiveOrigin = origin || "http://localhost:3000";
                const checkInUrl = `${effectiveOrigin}/checkin?token=${qrToken}&workshop=WS-07`;
                const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  checkInUrl
                )}&margin=1`;

                return (
                  <div className="p-4 bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center border-2 border-slate-200 w-full">
                    <div className="w-52 h-52 bg-white p-2 rounded-xl flex items-center justify-center border border-slate-100 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrApiUrl}
                        alt={`Live Workshop Attendance QR - Token ${qrToken}`}
                        className="w-48 h-48 rounded-lg object-contain"
                      />
                    </div>
                    <div className="font-mono text-xs text-slate-800 mt-3 font-bold tracking-wider flex items-center gap-2">
                      <span className="text-slate-400">TOKEN:</span>
                      <span
                        className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-900 font-bold"
                        suppressHydrationWarning
                      >
                        {mounted ? qrToken : "TKN-ACTIVE-SYNC"}
                      </span>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400 font-mono break-all max-w-[220px]">
                      {effectiveOrigin}/checkin
                    </div>
                  </div>
                );
              })()}

              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Students scan using the mobile PWA inside the geofence perimeter. Token refreshes every 30s to eliminate unauthorized forwarding.
              </p>

              <Link
                href="/checkin"
                target="_blank"
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-200"
              >
                <span>Open Student Mobile Check-In Scanner</span>
                <span>↗</span>
              </Link>
            </div>

            {/* Right Column: Participant Roster */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {activeTab === "standouts" ? "Standout Recognitions" : "Today's Participant Roster"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Batch 3 Cohort Alpha • {participants.length} total enrolled
                  </p>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student or ID..."
                    className="w-full sm:w-52 pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <SearchIcon className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {filteredParticipants.map((p) => (
                  <div
                    key={p.student.dos_id}
                    className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/record/${encodeURIComponent(p.student.dos_id)}`}
                          className="font-semibold text-xs text-slate-900 hover:text-emerald-700 transition-colors"
                        >
                          {p.student.full_name}
                        </Link>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {p.student.dos_id}
                        </span>
                        {p.isStandout && (
                          <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <StarIcon className="w-3 h-3 fill-purple-600" />
                            <span>Standout Lead</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {p.student.department || p.student.course}
                        {p.checkInTime && ` • Checked in at ${p.checkInTime}`}
                        {p.exceptionReason && (
                          <span className="text-amber-700 ml-1 font-medium">
                            [Manual: {p.exceptionReason}]
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                          p.status === "CHECKED_IN" || p.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {p.status.replace("_", " ")}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleStandout(p.student.dos_id)}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          p.isStandout
                            ? "bg-purple-100 text-purple-900 border-purple-300 font-semibold"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                        }`}
                        title="Award standout engineering recognition"
                      >
                        <StarIcon className={`w-3.5 h-3.5 ${p.isStandout ? "fill-purple-700 text-purple-700" : "text-slate-400"}`} />
                        <span>{p.isStandout ? "Recognized" : "Standout"}</span>
                      </button>

                      {p.status === "NOT_STARTED" && (
                        <button
                          type="button"
                          onClick={() => setActiveModalStudent(p)}
                          className="px-2.5 py-1 text-xs border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-lg transition-colors font-medium cursor-pointer"
                        >
                          Manual Check-In
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
        </main>
      </div>

      {/* Manual Exception Modal */}
      {activeModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 max-w-md w-full shadow-xl flex flex-col gap-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Audit Trail Requirement • Section 12
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Record Manual Check-In Exception
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Recording attendance exception for <strong>{activeModalStudent.student.full_name}</strong> ({activeModalStudent.student.dos_id}).
              </p>
            </div>

            <form onSubmit={handleResolveException} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reasonSelect" className="font-semibold text-slate-700">
                  Select Verified Rationale
                </label>
                <select
                  id="reasonSelect"
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  className="border border-slate-300 bg-white p-2.5 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="STUDENT_DEVICE_OFFLINE">Student device battery depleted / offline</option>
                  <option value="QR_CAMERA_MALFUNCTION">Camera scan optical malfunction</option>
                  <option value="CONNECTIVITY_OUTAGE">Campus wireless connectivity disruption</option>
                  <option value="STUDENT_REGISTRATION_ISSUE">Late batch roster synchronization</option>
                  <option value="OTHER">Other operational exception (specify below)</option>
                </select>
              </div>

              {exceptionReason === "OTHER" && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="customReason" className="font-semibold text-slate-700">
                    Document Explanation
                  </label>
                  <input
                    id="customReason"
                    type="text"
                    required
                    value={customReasonText}
                    onChange={(e) => setCustomReasonText(e.target.value)}
                    placeholder="Enter verifiable reason..."
                    className="border border-slate-300 bg-white p-2.5 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <p className="text-[11px] text-slate-400 leading-normal">
                Notice: All manual overrides are permanently timestamped and logged with Expert credentials into the immutable audit ledger.
              </p>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Confirm Check-In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalStudent(null)}
                  className="py-2.5 px-4 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
