"use client";

import React, { useState, useEffect } from "react";
import { ScheduledWorkshopSession } from "@/lib/workshop-schedule";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  SparklesIcon,
  BuildingIcon,
  TerminalIcon,
} from "@/components/Icons";

interface WorkshopCalendarProps {
  role?: "SUPER_ADMIN" | "TRAINER" | "COLLEGE_ADMIN" | "STUDENT";
  institutionName?: string;
  trainerName?: string;
  studentName?: string;
  title?: string;
  subtitle?: string;
}

export default function WorkshopCalendar({
  role = "STUDENT",
  institutionName = "Anna University Campus Hub",
  trainerName,
  studentName,
  title,
  subtitle,
}: WorkshopCalendarProps) {
  const [sessions, setSessions] = useState<ScheduledWorkshopSession[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<string>(institutionName);
  const [selectedDate, setSelectedDate] = useState<string>("2026-09-16");
  const [loading, setLoading] = useState<boolean>(true);
  const [nextUpcoming, setNextUpcoming] = useState<ScheduledWorkshopSession | null>(null);
  const [recentlyCompleted, setRecentlyCompleted] = useState<ScheduledWorkshopSession[]>([]);
  const [availableHubs, setAvailableHubs] = useState<string[]>(["ALL"]);

  // Sync institutional selection if prop updates
  useEffect(() => {
    if (institutionName) {
      setSelectedInstitution(institutionName);
    }
  }, [institutionName]);

  // Fetch role & institution filtered schedule
  const fetchSchedule = async (inst: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (inst && inst !== "ALL") params.set("institution", inst);
      if (trainerName) params.set("trainer", trainerName);
      if (role) params.set("role", role);

      const res = await fetch(`/api/workshops/schedule?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        const nextSessions = data.sessions || [];
        setSessions(nextSessions);
        const hubs: string[] = Array.from(new Set<string>(nextSessions.map((session: ScheduledWorkshopSession) => String(session.institutionName || "")).filter((hub: string) => Boolean(hub))));
        setAvailableHubs(["ALL", ...hubs]);
        if (selectedInstitution !== "ALL" && hubs.length > 0 && !hubs.includes(selectedInstitution)) {
          setSelectedInstitution("ALL");
        }
        setNextUpcoming(data.nextUpcoming || null);
        setRecentlyCompleted(data.recentlyCompleted || []);
        if (data.nextUpcoming?.date) {
          setSelectedDate(data.nextUpcoming.date);
        }
      }
    } catch (err) {
      console.error("Failed to load workshop calendar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // For students and college coordinators, always force their campus hub
    if (role === "STUDENT" || role === "COLLEGE_ADMIN") {
      fetchSchedule(institutionName);
    } else {
      fetchSchedule(selectedInstitution);
    }
  }, [selectedInstitution, institutionName, trainerName, role]);

  // Days in September 2026 (Starts on Tuesday Sep 1, 30 days)
  const daysInMonth = 30;
  const startDayOffset = 2; // Tuesday (0=Sun, 1=Mon, 2=Tue)

  // Map sessions by date (YYYY-MM-DD)
  const sessionsByDate: { [dateStr: string]: ScheduledWorkshopSession[] } = {};
  sessions.forEach((s) => {
    if (!sessionsByDate[s.date]) sessionsByDate[s.date] = [];
    sessionsByDate[s.date].push(s);
  });

  const selectedDaySessions = sessionsByDate[selectedDate] || [];

  return (
    <div className="flex flex-col gap-6 font-['Poppins',sans-serif]">
      {/* 1. Calendar Header & Institutional Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#3772FF]/10 text-[#3772FF] text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Academic Curriculum Schedule &bull; September 2026</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {title || (role === "TRAINER" ? "My Teaching Schedule & Itinerary" : "Workshop Calendar")}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {subtitle ||
              (role === "STUDENT"
                ? `Showing scheduled systems sessions assigned specifically to ${institutionName}.`
                : role === "TRAINER"
                ? `Showing your personal teaching itinerary and assigned workshops across university hubs.`
                : role === "COLLEGE_ADMIN"
                ? `Showing scheduled systems sessions assigned specifically to ${institutionName}.`
                : `Campus workshop timeline and multi-college delivery schedule.`)}
          </p>
        </div>

        {/* Institution Switcher (ONLY for Admins or Trainers filtering among their assigned hubs) */}
        {(role === "SUPER_ADMIN" || role === "TRAINER") && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-600">Filter Hub:</span>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-800 focus:outline-none focus:border-slate-800"
            >
              {availableHubs.map((hub) => (
                <option key={hub} value={hub}>
                  {hub === "ALL"
                    ? role === "TRAINER"
                      ? "All My Assigned Campus Hubs"
                      : "All Partner Hubs (Master View)"
                    : hub}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Hero Card: Next Upcoming Workshop */}
      {nextUpcoming && (
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl shadow-md border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF592C]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#FF592C] text-white text-[10px] font-bold uppercase tracking-wider">
                  NEXT UPCOMING WORKSHOP
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 text-[11px] font-mono font-semibold">
                  {nextUpcoming.workshopCode}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                  {nextUpcoming.institutionName}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {nextUpcoming.workshopCode}: {nextUpcoming.workshopTitle}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {nextUpcoming.focusTopic}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 font-medium">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#FF592C]" />
                  <span>
                    {new Date(nextUpcoming.date).toLocaleDateString("en-IN", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <ClockIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>{nextUpcoming.startTime} &ndash; {nextUpcoming.endTime} IST</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Expert: {nextUpcoming.trainerName}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPinIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{nextUpcoming.venue}</span>
                </div>
              </div>
            </div>

            {/* 1-Click Free Calendar Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              {nextUpcoming.calendarLinks?.google && (
                <a
                  href={nextUpcoming.calendarLinks.google}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all inline-flex items-center justify-center gap-2 shadow-xs whitespace-nowrap"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z" />
                  </svg>
                  <span>Sync to Google Calendar</span>
                </a>
              )}

              {nextUpcoming.calendarLinks?.ics && (
                <a
                  href={nextUpcoming.calendarLinks.ics}
                  download={`DOS-Club-${nextUpcoming.workshopCode}.ics`}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all inline-flex items-center justify-center gap-2 border border-white/10 shadow-xs whitespace-nowrap"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Apple iCal / Outlook (.ics)</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Calendar View & Day Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Interactive Monthly Calendar Grid */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">September 2026</h3>
              <p className="text-xs text-slate-500">
                {sessions.length} session{sessions.length === 1 ? "" : "s"} scheduled in this cycle
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF592C]" />
                <span className="text-slate-600 font-medium">Upcoming</span>
              </span>
              <span className="flex items-center gap-1 ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 font-medium">Completed</span>
              </span>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty offset padding for days before Sep 1 (Tue) */}
            {Array.from({ length: startDayOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-20 sm:h-24 rounded-2xl bg-slate-50/50" />
            ))}

            {/* 30 Days of September 2026 */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `2026-09-${String(dayNum).padStart(2, "0")}`;
              const daySessions = sessionsByDate[dateStr] || [];
              const isSelected = selectedDate === dateStr;
              const hasUpcoming = daySessions.some((s) => s.status === "SCHEDULED");
              const hasCompleted = daySessions.some((s) => s.status === "COMPLETED");

              return (
                <button
                  type="button"
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "border-[#23262F] bg-[#F4F5F6] shadow-sm ring-2 ring-slate-900/10"
                      : daySessions.length > 0
                      ? "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/80"
                      : "border-slate-100 bg-white hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected
                          ? "text-[#FF592C] font-extrabold"
                          : daySessions.length > 0
                          ? "text-slate-900"
                          : "text-slate-400"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {daySessions.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF592C]" />
                    )}
                  </div>

                  {/* Badges for workshops scheduled on this date */}
                  <div className="space-y-1">
                    {daySessions.map((s) => (
                      <div
                        key={s.id}
                        className={`px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold truncate ${
                          s.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-[#FF592C]/15 text-[#E04F26]"
                        }`}
                        title={`${s.workshopCode}: ${s.workshopTitle} @ ${s.institutionName}`}
                      >
                        {s.workshopCode}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Selected Date Breakdown & Recently Completed */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Date Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#777E90]">
                  SCHEDULE FOR SELECTED DATE
                </span>
                <h4 className="text-base font-bold text-slate-900">
                  {new Date(selectedDate).toLocaleDateString("en-IN", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 font-mono text-xs font-bold text-slate-700">
                {selectedDaySessions.length} Session{selectedDaySessions.length === 1 ? "" : "s"}
              </span>
            </div>

            {selectedDaySessions.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">No workshops scheduled on this date.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click a highlighted day in the calendar to view its schedule.</p>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                {selectedDaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 transition-all hover:bg-white hover:shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#23262F] text-white text-[10px] font-bold">
                        {session.workshopCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          session.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>

                    <h5 className="text-sm font-bold text-slate-900">
                      {session.workshopTitle}
                    </h5>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {session.focusTopic}
                    </p>

                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <BuildingIcon className="w-3.5 h-3.5 text-slate-400" />
                        <strong>Hub:</strong> {session.institutionName}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <strong>Trainer:</strong> {session.trainerName}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                        <strong>Timing:</strong> {session.startTime} &ndash; {session.endTime}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPinIcon className="w-3.5 h-3.5 text-slate-400" />
                        <strong>Venue:</strong> {session.venue}
                      </div>
                    </div>

                    {session.calendarLinks?.google && (
                      <div className="pt-2 flex items-center gap-2">
                        <a
                          href={session.calendarLinks.google}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-[#3772FF] hover:underline flex items-center gap-1"
                        >
                          <span>+ Add to Google Calendar</span>
                          <ExternalLinkIcon className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Completed Workshops Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#777E90]">
                RECENTLY COMPLETED SESSIONS
              </span>
              <span className="text-xs font-semibold text-emerald-600">Verified & Logged</span>
            </div>

            {recentlyCompleted.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No completed workshops in this cycle.</p>
            ) : (
              <div className="space-y-3">
                {recentlyCompleted.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold text-xs text-slate-900">
                          {comp.workshopCode}: {comp.workshopTitle}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {comp.workshopCode} &bull; {comp.institutionName}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Completed on {comp.date} &bull; {comp.attendanceCount || comp.cohortSize} attended
                      </div>
                    </div>

                    {comp.avgRating && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ★ {comp.avgRating}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
