"use client";

import React, { useState, useEffect } from "react";
import {
  ScheduledWorkshopSession,
} from "@/lib/workshop-schedule";
import WorkshopCalendar from "@/components/WorkshopCalendar";
import { downloadCsv } from "@/lib/export-csv";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  BuildingIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  TrashIcon,
  MailIcon,
} from "@/components/Icons";
import { INITIAL_INSTITUTIONS } from "@/lib/admin-data";

interface WorkshopScheduleTabProps {
  workshops?: Array<{ code: string; title: string; status?: string }>;
  experts?: Array<{ id: string; fullName: string; status?: string }>;
  institutions?: Array<{ id: string; name: string; city: string }>;
  onAuditLog?: (
    category: "Students" | "Experts" | "Attendance" | "Certifications" | "System",
    subcategory: string,
    action: "Create" | "Update" | "Perform" | "Archive",
    sourceText: string
  ) => void;
}

export default function WorkshopScheduleTab({ institutions = [], workshops = [], experts = [], onAuditLog }: WorkshopScheduleTabProps) {
  const activeWorkshops = workshops.filter((workshop) => !workshop.status || workshop.status === "ACTIVE");
  const activeExperts = experts.filter((expert) => !expert.status || expert.status === "ACTIVE");
  const [sessions, setSessions] = useState<ScheduledWorkshopSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedInstitution, setSelectedInstitution] = useState<string>("ALL");
  const [selectedTrainer, setSelectedTrainer] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"CALENDAR" | "TIMELINE">("TIMELINE");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Multi-selection state
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState<boolean>(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingSession, setEditingSession] = useState<ScheduledWorkshopSession | null>(null);

  // Workshop Report to College POC Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportingSession, setReportingSession] = useState<ScheduledWorkshopSession | null>(null);
  const [reportPocName, setReportPocName] = useState<string>("");
  const [reportPocEmail, setReportPocEmail] = useState<string>("");
  const [reportCustomNotes, setReportCustomNotes] = useState<string>("");
  const [isSendingReport, setIsSendingReport] = useState<boolean>(false);
  const [reportResult, setReportResult] = useState<any>(null);

  // New Workshop Assignment Form State
  const [formData, setFormData] = useState({
    workshopCode: "",
    workshopTitle: "",
    institutionName: "",
    institutionId: "",
    trainerName: "",
    trainerId: "",
    date: "",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    venue: "",
    focusTopic: "",
    cohortSize: 0,
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
    const requiredFields: Array<[string, string]> = [["target college", formData.institutionName], ["workshop", formData.workshopCode], ["expert", formData.trainerName], ["date", formData.date], ["start time", formData.startTime], ["end time", formData.endTime], ["venue", formData.venue], ["curriculum focus topic", formData.focusTopic]];
    const missing = requiredFields.filter(([, value]) => !String(value || "").trim()).map(([label]) => label);
    if (missing.length > 0) { alert(`Please complete the form. Missing: ${missing.join(", ")}.`); return; }
    const timePattern = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/i;
    if (!timePattern.test(formData.startTime) || !timePattern.test(formData.endTime)) { alert("Use 12-hour time format, for example 09:00 AM."); return; }
    const toMinutes = (value: string) => { const m = value.match(/^(\d+):(\d+)\s(AM|PM)$/i)!; let h = Number(m[1]) % 12; if (m[3].toUpperCase() === "PM") h += 12; return h * 60 + Number(m[2]); };
    if (toMinutes(formData.startTime) >= toMinutes(formData.endTime)) { alert("End time must be later than start time."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/workshops/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setNotification(`Successfully assigned ${formData.workshopCode} to ${formData.institutionName}!`);
        setIsAssignModalOpen(false);
        refreshSessions();
        onAuditLog?.(
          "Experts",
          "Workshop Schedule",
          "Create",
          `Scheduled ${formData.workshopCode} for ${formData.institutionName} on ${formData.date}`
        );
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
        onAuditLog?.(
          "Experts",
          "Workshop Schedule",
          "Update",
          `Changed session ${id} status to ${newStatus}`
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Single Delete
  const handleDeleteSession = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete scheduled workshop "${title}"?`)) return;

    try {
      const res = await fetch(`/api/workshops/schedule?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setNotification(`Deleted scheduled session "${title}".`);
        onAuditLog?.(
          "Experts",
          "Workshop Schedule",
          "Archive",
          `Deleted scheduled session ${id} (${title})`
        );
        const next = new Set(selectedSessionIds);
        next.delete(id);
        setSelectedSessionIds(next);
        refreshSessions();
        setTimeout(() => setNotification(null), 3500);
      }
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (session: ScheduledWorkshopSession) => {
    setEditingSession(session);
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    try {
    const manualStatus = editingSession.status === "POSTPONED" ? "POSTPONED" : undefined;
    const res = await fetch("/api/workshops/schedule", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editingSession, ...(manualStatus ? { status: manualStatus } : {}) }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification(`Updated session "${editingSession.workshopTitle}"!`);
        setIsEditModalOpen(false);
        setEditingSession(null);
        refreshSessions();
        onAuditLog?.(
          "Experts",
          "Workshop Schedule",
          "Update",
          `Edited schedule details for ${editingSession.workshopCode} (${editingSession.institutionName})`
        );
        setTimeout(() => setNotification(null), 3500);
      } else {
        alert(data.error || "Failed to update session");
      }
    } catch (err: any) {
      alert("Error saving session: " + err.message);
    }
  };

  // Open Post-Workshop Report to College POC Modal
  const handleOpenReportModal = (session: ScheduledWorkshopSession) => {
    setReportingSession(session);
    setReportResult(null);
    setReportCustomNotes("");

    // Look up institution POC
    const inst = INITIAL_INSTITUTIONS.find(
      (i) =>
        i.id === session.institutionId ||
        i.name.toLowerCase().includes(session.institutionName.toLowerCase()) ||
        session.institutionName.toLowerCase().includes(i.name.toLowerCase())
    );

    if (inst) {
      setReportPocName(inst.pocName);
      setReportPocEmail(inst.pocEmail);
    } else {
      setReportPocName("College Faculty Coordinator / Dean");
      setReportPocEmail("dean.engg@annauniv.edu");
    }

    setIsReportModalOpen(true);
  };

  // Dispatch Report to College POC via API
  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingSession || !reportPocEmail) return;

    setIsSendingReport(true);
    setReportResult(null);

    try {
      const res = await fetch("/api/workshops/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopCode: reportingSession.workshopCode,
          workshopTitle: reportingSession.workshopTitle,
          institutionName: reportingSession.institutionName,
          pocName: reportPocName,
          pocEmail: reportPocEmail,
          trainerName: reportingSession.trainerName,
          date: reportingSession.date,
          venue: reportingSession.venue,
          cohortSize: reportingSession.cohortSize,
          attendanceCount: reportingSession.attendanceCount || reportingSession.cohortSize,
          focusTopic: reportingSession.focusTopic,
          customNotes: reportCustomNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReportResult(data);
        const ccNotice = data.dispatchResult?.recipients?.cc?.length
          ? ` (CC: ${data.dispatchResult.recipients.cc.join(", ")})`
          : "";
        setNotification(`Executive Workshop Report dispatched to ${reportPocName} (${reportPocEmail})!${ccNotice}`);
        onAuditLog?.(
          "Attendance",
          "Workshop Report",
          "Perform",
          `Transmitted executive completion report for ${reportingSession.workshopCode} to ${reportPocName} (${reportPocEmail})`
        );
        setTimeout(() => setNotification(null), 6000);
      } else {
        alert(data.error || "Failed to transmit report.");
      }
    } catch (err: any) {
      alert("Report dispatch error: " + err.message);
    } finally {
      setIsSendingReport(false);
    }
  };

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(sessions.map((s) => s.id));
      setSelectedSessionIds(allIds);
    } else {
      setSelectedSessionIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedSessionIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedSessionIds(next);
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedSessionIds.size === 0) return;
    if (!confirm(`Delete ${selectedSessionIds.size} scheduled workshop session(s)?`)) return;

    setBulkProcessing(true);
    try {
      const ids = Array.from(selectedSessionIds);
      const res = await fetch("/api/workshops/schedule", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification(`Successfully deleted ${data.deletedCount} scheduled session(s).`);
        onAuditLog?.(
          "Experts",
          "Workshop Schedule",
          "Archive",
          `Bulk deleted ${data.deletedCount} scheduled workshop sessions`
        );
        setSelectedSessionIds(new Set());
        refreshSessions();
        setTimeout(() => setNotification(null), 3500);
      }
    } catch (err: any) {
      alert("Bulk delete error: " + err.message);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: ScheduledWorkshopSession["status"]) => {
    if (selectedSessionIds.size === 0) return;

    setBulkProcessing(true);
    try {
      const ids = Array.from(selectedSessionIds);
      const res = await fetch("/api/workshops/schedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification(`Updated ${data.updatedCount} session(s) to status ${newStatus}.`);
        onAuditLog?.(
          "Experts",
          "Workshop Schedule",
          "Update",
          `Bulk updated ${data.updatedCount} scheduled sessions to status ${newStatus}`
        );
        setSelectedSessionIds(new Set());
        refreshSessions();
        setTimeout(() => setNotification(null), 3500);
      }
    } catch (err: any) {
      alert("Bulk status error: " + err.message);
    } finally {
      setBulkProcessing(false);
    }
  };

  const exportSchedule = () => {
    const source = selectedSessionIds.size > 0
      ? sessions.filter((session) => selectedSessionIds.has(session.id))
      : sessions;
    const ok = downloadCsv("talentos-workshop-schedule.csv", source.map((session) => ({
      session_id: session.id,
      workshop_code: session.workshopCode,
      workshop_title: session.workshopTitle,
      college: session.institutionName,
      expert: session.trainerName,
      date: session.date,
      start_time: session.startTime,
      end_time: session.endTime,
      venue: session.venue,
      focus_topic: session.focusTopic,
      cohort_size: session.cohortSize,
      status: session.status,
    })));
    setNotification(ok ? `Exported ${source.length} scheduled session(s) to CSV.` : "No scheduled sessions to export.");
    setTimeout(() => setNotification(null), 3500);
  };

  const isAllSelected =
    sessions.length > 0 && sessions.every((s) => selectedSessionIds.has(s.id));

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
            Multi-College Workshop Itinerary &amp; Calendar
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Assign upcoming technical sessions to partner university hubs, coordinate expert trainers across consecutive days, and sync live Google &amp; Apple Calendar entries for students.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
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

      {/* Floating Bulk Action Bar */}
      {selectedSessionIds.size > 0 && (
        <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg border border-slate-800 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2 py-0.5 rounded-full bg-[#3772FF] text-white text-[11px] font-bold font-mono">
              {selectedSessionIds.size}
            </span>
            <span>Workshop Sessions Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusUpdate("SCHEDULED")}
              disabled={bulkProcessing}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Mark Scheduled
            </button>
            <button
              onClick={() => handleBulkStatusUpdate("POSTPONED")}
              disabled={bulkProcessing}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl transition-all"
            >
              Mark Postponed
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkProcessing}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              <span>Bulk Delete</span>
            </button>
            <button
              onClick={() => setSelectedSessionIds(new Set())}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-slate-700">Filter by College:</span>
              <select
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
              >
                <option value="ALL">All Partner Colleges</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.name}>
                    {inst.name}
                  </option>
                ))}
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

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-[#3772FF] focus:ring-[#3772FF]"
                />
                <span>Select All</span>
              </label>
              <div className="text-xs text-slate-500 font-mono">
                Showing {sessions.length} Scheduled Sessions
              </div>
              <button
                type="button"
                onClick={exportSchedule}
                disabled={sessions.length === 0}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Export {selectedSessionIds.size > 0 ? "Selected" : "List"}
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {sessions.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                <CalendarIcon className="w-8 h-8 text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No scheduled sessions found</p>
                <p className="text-xs text-slate-400">
                  {selectedInstitution !== "ALL" || selectedTrainer !== "ALL"
                    ? "No sessions match the selected college or trainer filter."
                    : "No campus sessions scheduled yet. Click '+ Assign Workshop' to schedule a session."}
                </p>
              </div>
            ) : (
              sessions.map((session) => {
                const isSelected = selectedSessionIds.has(session.id);
                return (
                  <div
                    key={session.id}
                    className={`p-5 hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                      isSelected ? "bg-blue-50/30" : ""
                    }`}
                  >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(session.id)}
                      className="mt-3.5 rounded border-slate-300 text-[#3772FF] focus:ring-[#3772FF] cursor-pointer"
                    />

                    <div
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-white shrink-0 ${
                        session.status === "COMPLETED"
                          ? "bg-slate-500"
                          : session.status === "ACTIVE_IN_SESSION"
                          ? "bg-amber-500 animate-pulse"
                          : session.status === "POSTPONED"
                          ? "bg-rose-500"
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
                          {session.workshopCode}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            session.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-700"
                              : session.status === "ACTIVE_IN_SESSION"
                              ? "bg-amber-100 text-amber-800"
                              : session.status === "POSTPONED"
                              ? "bg-rose-100 text-rose-700"
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

                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center flex-wrap">
                    {/* Status update selector */}
                    <select
                      value={session.status === "POSTPONED" ? "POSTPONED" : "SCHEDULED"}
                      onChange={(e) => handleStatusChange(session.id, e.target.value as any)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="POSTPONED">Postponed</option>
                    </select>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(session)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                    >
                      Edit
                    </button>

                    {/* Report to College POC Button */}
                    <button
                      onClick={() => handleOpenReportModal(session)}
                      className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100/90 text-blue-700 text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
                      title="Send Executive Workshop Report to College Point of Contact"
                    >
                      <MailIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>Report to POC</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteSession(session.id, session.workshopTitle)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Session"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>

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
              );
            }))}
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
                  required
                  value={formData.institutionName}
                  onChange={(e) => {
                    const inst = e.target.value;
                    const selectedInstitution = institutions.find((item) => item.name === inst);
                    setFormData({
                      ...formData,
                      institutionName: inst,
                      institutionId: selectedInstitution?.id || "",
                      venue: "",
                    });
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                >
                  <option value="" disabled>Select target college / hub</option>
                  {institutions.length > 0 ? (
                    institutions.map((inst) => (
                      <option key={inst.id} value={inst.name}>
                        {inst.name} ({inst.city})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No Campus Hubs Available — Add standard college first
                    </option>
                  )}
                </select>
              </div>

              {/* Workshop Module & Session */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Workshop Module
                  </label>
                  <select
                    required
                    value={formData.workshopCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      const workshop = workshops.find((item) => item.code === code);
                      const title = workshop?.title || "";
                      const topic = "";
                      setFormData({ ...formData, workshopCode: code, workshopTitle: title, focusTopic: topic });
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  >
                    <option value="" disabled>Select active workshop</option>
                    {activeWorkshops.length > 0 ? activeWorkshops.map((workshop) => (
                      <option key={workshop.code} value={workshop.code}>{workshop.code}: {workshop.title}</option>
                  )) : <option value="" disabled>No active master workshops available</option>}
                  </select>
                </div>

              </div>

              {/* Trainer Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Expert Trainer
                </label>
                <select
                  required
                  value={formData.trainerName}
                  onChange={(e) => {
                    const tName = e.target.value;
                    const selectedExpert = activeExperts.find((expert) => expert.fullName === tName);
                    setFormData({
                      ...formData,
                      trainerName: tName,
                      trainerId: selectedExpert?.id || "",
                    });
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                >
                  <option value="" disabled>Select assigned expert</option>
                  {activeExperts.length > 0 ? activeExperts.map((expert) => (
                    <option key={expert.id} value={expert.fullName}>{expert.fullName}</option>
                  )) : <option value="" disabled>No active experts available</option>}
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
                <textarea
                  value={formData.focusTopic}
                  onChange={(e) => setFormData({ ...formData, focusTopic: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  placeholder="Add objectives, preparation notes, links, and reference material..."
                  rows={6}
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

      {/* Edit Scheduled Workshop Modal */}
      {isEditModalOpen && editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl p-6 relative animate-fadeIn my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#3772FF]/10 text-[#3772FF] flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Scheduled Session ({editingSession.workshopCode})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update session timings, venue, cohort size, or assigned trainer.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingSession(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Workshop Title
                </label>
                <input
                  type="text"
                  value={editingSession.workshopTitle}
                  onChange={(e) => setEditingSession({ ...editingSession, workshopTitle: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Partner College / Hub
                  </label>
                  <input
                    type="text"
                    value={editingSession.institutionName}
                    onChange={(e) => setEditingSession({ ...editingSession, institutionName: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Expert Trainer
                  </label>
                  <input
                    type="text"
                    value={editingSession.trainerName}
                    onChange={(e) => setEditingSession({ ...editingSession, trainerName: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editingSession.date}
                    onChange={(e) => setEditingSession({ ...editingSession, date: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={editingSession.startTime}
                    onChange={(e) => setEditingSession({ ...editingSession, startTime: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={editingSession.endTime}
                    onChange={(e) => setEditingSession({ ...editingSession, endTime: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Campus Venue
                  </label>
                  <input
                    type="text"
                    value={editingSession.venue}
                    onChange={(e) => setEditingSession({ ...editingSession, venue: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingSession.status === "POSTPONED" ? "POSTPONED" : "SCHEDULED"}
                    onChange={(e) => setEditingSession({ ...editingSession, status: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="POSTPONED">Postponed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Focus Topic
                </label>
                <textarea
                  value={editingSession.focusTopic}
                  onChange={(e) => setEditingSession({ ...editingSession, focusTopic: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
                  placeholder="Add objectives, preparation notes, links, and reference material..."
                  rows={6}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingSession(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#3772FF] hover:bg-[#285cdb] text-white rounded-xl transition-all shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Workshop Report to College POC Modal */}
      {isReportModalOpen && reportingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl p-6 relative animate-fadeIn my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                  <MailIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Send Workshop Report to College POC
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official completion summary for {reportingSession.institutionName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsReportModalOpen(false);
                  setReportingSession(null);
                  setReportResult(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            {reportResult ? (
              <div className="mt-5 space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex flex-col gap-2">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                    <span>Report Dispatched Successfully!</span>
                  </div>
                  <p className="text-emerald-800">
                    The official executive completion report for <strong>{reportingSession.workshopCode}</strong> has been transmitted to <strong>{reportPocName}</strong> ({reportPocEmail}).
                  </p>
                  <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 font-mono text-[11px] text-slate-700">
                    <div>Provider: <span className="font-bold">{reportResult.dispatchResult?.provider}</span></div>
                    <div>To: {reportPocEmail}</div>
                    <div>Global CC: {reportResult.dispatchResult?.recipients?.cc?.join(", ") || "(None)"}</div>
                    <div>Message ID: {reportResult.dispatchResult?.messageId}</div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReportModalOpen(false);
                      setReportingSession(null);
                      setReportResult(null);
                    }}
                    className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="mt-4 space-y-4">
                {/* Workshop Session Overview Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{reportingSession.workshopCode}: {reportingSession.workshopTitle}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                      {reportingSession.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>Date: <strong>{reportingSession.date}</strong> ({reportingSession.startTime} - {reportingSession.endTime})</div>
                    <div>Trainer: <strong>{reportingSession.trainerName}</strong></div>
                    <div>Venue: <strong>{reportingSession.venue}</strong></div>
                    <div>Attendance: <strong>{reportingSession.attendanceCount || reportingSession.cohortSize} / {reportingSession.cohortSize} ({(((reportingSession.attendanceCount || reportingSession.cohortSize) / reportingSession.cohortSize) * 100).toFixed(0)}%)</strong></div>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 font-mono">
                    Focus: {reportingSession.focusTopic}
                  </div>
                </div>

                {/* College Point of Contact Recipient Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      College Point of Contact Name
                    </label>
                    <input
                      type="text"
                      value={reportPocName}
                      onChange={(e) => setReportPocName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      POC Email Address
                    </label>
                    <input
                      type="email"
                      value={reportPocEmail}
                      onChange={(e) => setReportPocEmail(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
                      required
                    />
                  </div>
                </div>

                {/* Global CC Callout Notice */}
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
                  <MailIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Automatic Global CC Oversight:</strong>
                    <p className="text-blue-800 mt-0.5">
                      This report will automatically carbon-copy all addresses configured in System Settings (e.g. <code>descienceosclub@gmail.com, admissions@dosclub.org</code>).
                    </p>
                  </div>
                </div>

                {/* Trainer Executive Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trainer Observations & Academic Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reportCustomNotes}
                    onChange={(e) => setReportCustomNotes(e.target.value)}
                    placeholder="e.g. Cohort achieved 100% test pass on Raft log replication. 4 students cleared for placement defense."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReportModalOpen(false);
                      setReportingSession(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingReport}
                    className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <MailIcon className="w-3.5 h-3.5" />
                    <span>{isSendingReport ? "Transmitting Report..." : "Transmit Official Report to POC"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
