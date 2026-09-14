"use client";

import React, { useState, useEffect } from "react";
import {
  ScheduledWorkshopSession,
  getFilteredSchedule,
  addScheduledSession,
  updateSessionStatus,
} from "@/lib/workshop-schedule";
import WorkshopCalendar from "@/components/WorkshopCalendar";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  BuildingIcon,
  SparklesIcon,
  CheckCircleIcon,
  SearchIcon,
  ExternalLinkIcon,
  TerminalIcon,
} from "@/components/Icons";

export default function WorkshopScheduleTab() {
  const [sessions, setSessions] = useState<ScheduledWorkshopSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedInstitution, setSelectedInstitution] = useState<string>("ALL");
  const [selectedTrainer, setSelectedTrainer] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"CALENDAR" | "TIMELINE">("CALENDAR");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Workshop Assignment Form State
  const [formData, setFormData] = useState({
    workshopCode: "WS-02",
    workshopTitle: "Linux Kernel Primitives & eBPF",
    sessionNumber: 2,
    institutionName: "Anna University Campus Hub",
    institutionId: "inst-001",
    trainerName: "Priya Sundaram",
    trainerId: "exp-001",
    date: "2026-09-16",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    venue: "Turing Computing Labs, Guindy Campus",
    focusTopic: "eBPF probe architecture and hermetic trace verification",
    cohortSize: 42,
  });

  const refreshSessions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedInstitution !== "ALL") params.set("institution", selectedInstitution);
      if (selectedTrainer !== "ALL") params.set("trainer", selectedTrainer);

      const res = await fetch(`/api/workshops/schedule?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSessions();
  }, [selectedInstitution, selectedTrainer]);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/workshops/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setNotification(`Successfully assigned ${formData.workshopCode} (Session ${formData.sessionNumber}) to ${formData.institutionName}!`);
        setIsAssignModalOpen(false);
        refreshSessions();
        setTimeout(() => setNotification(null), 4000);
      } else {
        alert(data.error || "Failed to schedule workshop");
      }
    } catch (err: any) {
      alert("Scheduling error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ScheduledWorkshopSession["status"]) => {
    try {
      const res = await fetch("/api/workshops/schedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        refreshSessions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-['Poppins',sans-serif]">
      {/* Top Banner Alert */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header and Quick Stats */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#3772FF]/10 text-[#3772FF] text-[10px] font-bold uppercase tracking-wider mb-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Master Institutional Scheduling Console</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Multi-College Workshop Itinerary & Calendar
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Assign upcoming technical sessions to partner university hubs, coordinate expert trainers across consecutive days, and sync live Google & Apple Calendar entries for students.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode("CALENDAR")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === "CALENDAR"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Interactive Calendar
            </button>
            <button
              onClick={() => setViewMode("TIMELINE")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === "TIMELINE"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Session Master List ({sessions.length})
            </button>
          </div>

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3772FF] hover:bg-[#285cdb] text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Assign Workshop</span>
          </button>
        </div>
      </div>

      {/* Main View Mode Render */}
      {viewMode === "CALENDAR" ? (
        <WorkshopCalendar
          role="SUPER_ADMIN"
          institutionName="ALL"
          title="TalentOS Master Multi-College Calendar"
          subtitle="Real-time multi-campus schedule. Filter by partner college or assigned trainer to audit delivery pipelines."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Filter by College:</span>
              <select
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
              >
                <option value="ALL">All Partner Colleges</option>
                <option value="Anna University Campus Hub">Anna University Campus Hub</option>
                <option value="PSG College of Technology Hub">PSG College of Technology Hub</option>
                <option value="Thiagarajar College of Engineering Hub">Thiagarajar College of Eng Hub</option>
              </select>

              <span className="text-xs font-bold text-slate-700 ml-2">Trainer:</span>
              <select
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
              >
                <option value="ALL">All Trainers</option>
                <option value="Priya Sundaram">Priya Sundaram</option>
                <option value="Vikram Seth">Vikram Seth</option>
                <option value="Anand Natarajan">Anand Natarajan</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Showing {sessions.length} Scheduled Sessions
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-white shrink-0 ${
                      session.status === "COMPLETED"
                        ? "bg-slate-500"
                        : session.status === "IN_PROGRESS"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-[#3772FF]"
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">
                      {new Date(session.date).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-base leading-none">
                      {session.date.split("-")[2]}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                        {session.workshopCode} &bull; Session {session.sessionNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          session.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-700"
                            : session.status === "IN_PROGRESS"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {session.workshopTitle}
                    </h4>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-1.5 font-normal">
                      <div className="flex items-center gap-1">
                        <BuildingIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{session.institutionName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>Trainer: <strong className="text-slate-700">{session.trainerName}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{session.startTime} - {session.endTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{session.venue}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 font-mono bg-slate-50 px-2.5 py-1 rounded border border-slate-100 inline-block">
                      Focus: {session.focusTopic} &bull; Cohort: {session.cohortSize} students
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                  {/* Status update buttons */}
                  <select
                    value={session.status}
                    onChange={(e) => handleStatusChange(session.id, e.target.value as any)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>

                  {session.calendarLinks && (
                    <a
                      href={session.calendarLinks.google}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold inline-flex items-center gap-1"
                      title="Sync to Google Calendar"
                    >
                      <span>Google Cal</span>
                      <ExternalLinkIcon className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assign Workshop Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl p-6 relative animate-fadeIn my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#3772FF]/10 text-[#3772FF] flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Assign Workshop to Partner College
                  </h3>
                  <p className="text-xs text-slate-500">
                    Schedule session dates, venue, and assigned expert trainer.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="mt-4 space-y-4">
              {/* College Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Partner College / Hub
                </label>
                <select
                  value={formData.institutionName}
                  onChange={(e) => {
                    const inst = e.target.value;
                    let id = "inst-001";
                    let venue = "Turing Computing Labs, Guindy Campus";
                    if (inst.includes("PSG")) {
                      id = "inst-002";
                      venue = "Seminar Hall 4, Dept of IT, PSG Tech";
                    } else if (inst.includes("Thiagarajar")) {
                      id = "inst-003";
                      venue = "ECE Auditorium, TCE Madurai";
                    }
                    setFormData({ ...formData, institutionName: inst, institutionId: id, venue });
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                >
                  <option value="Anna University Campus Hub">Anna University Campus Hub (Chennai)</option>
                  <option value="PSG College of Technology Hub">PSG College of Technology Hub (Coimbatore)</option>
                  <option value="Thiagarajar College of Engineering Hub">Thiagarajar College of Engineering Hub (Madurai)</option>
                </select>
              </div>

              {/* Workshop Module & Session */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Workshop Module
                  </label>
                  <select
                    value={formData.workshopCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      let title = "Linux Kernel Primitives & eBPF";
                      let topic = "eBPF probe architecture and hermetic trace verification";
                      if (code === "WS-01") {
                        title = "Hermetic POSIX Architecture & Toolchains";
                        topic = "POSIX system calls and reproducible C toolchains";
                      } else if (code === "WS-03") {
                        title = "Concurrent Memory Runtimes & Async IO";
                        topic = "Actor concurrency, lock-free queues, and epoll reactor patterns";
                      } else if (code === "WS-04") {
                        title = "Zero-Grace Peer Defense & Protocol Audit";
                        topic = "Distributed Raft chaos testing and split-brain recovery";
                      }
                      setFormData({ ...formData, workshopCode: code, workshopTitle: title, focusTopic: topic });
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  >
                    <option value="WS-01">WS-01: Hermetic POSIX Architecture</option>
                    <option value="WS-02">WS-02: Linux Kernel Primitives & eBPF</option>
                    <option value="WS-03">WS-03: Concurrent Memory Runtimes</option>
                    <option value="WS-04">WS-04: Zero-Grace Peer Defense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Session Number
                  </label>
                  <select
                    value={formData.sessionNumber}
                    onChange={(e) => setFormData({ ...formData, sessionNumber: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  >
                    <option value={1}>Session 1 (Core Theory & Labs)</option>
                    <option value={2}>Session 2 (Hermetic Implementation)</option>
                    <option value={3}>Session 3 (Advanced Integration & Defense)</option>
                    <option value={4}>Session 4 (Final Evaluation)</option>
                  </select>
                </div>
              </div>

              {/* Trainer Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Expert Trainer
                </label>
                <select
                  value={formData.trainerName}
                  onChange={(e) => {
                    const tName = e.target.value;
                    let tId = "exp-001";
                    if (tName.includes("Vikram")) tId = "exp-002";
                    if (tName.includes("Anand")) tId = "exp-003";
                    setFormData({ ...formData, trainerName: tName, trainerId: tId });
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                >
                  <option value="Priya Sundaram">Priya Sundaram (Distributed Systems Lead)</option>
                  <option value="Vikram Seth">Vikram Seth (Kernel Architecture Lead)</option>
                  <option value="Anand Natarajan">Anand Natarajan (Async Systems Specialist)</option>
                </select>
              </div>

              {/* Date & Times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="05:00 PM"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Venue & Cohort */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Campus Venue
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cohort Size
                  </label>
                  <input
                    type="number"
                    value={formData.cohortSize}
                    onChange={(e) => setFormData({ ...formData, cohortSize: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Focus Topic */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Curriculum Focus Topic
                </label>
                <input
                  type="text"
                  value={formData.focusTopic}
                  onChange={(e) => setFormData({ ...formData, focusTopic: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-[#3772FF] hover:bg-[#285cdb] text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <SparklesIcon className="w-3.5 h-3.5" />
                  <span>{submitting ? "Assigning..." : "Confirm Workshop Assignment"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
