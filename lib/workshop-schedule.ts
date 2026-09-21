/**
 * TalentOS Multi-College Workshop Scheduling & Calendar Engine
 * Manages institutional assignments, multi-day consecutive sessions, and role-filtered schedules.
 */

export interface ScheduledWorkshopSession {
  id: string;
  workshopCode: string; // e.g. "WS-02", "WS-03"
  workshopTitle: string; // e.g. "Linux Kernel Primitives & eBPF"
  sessionNumber: number; // e.g. 2, 3
  institutionId: string; // e.g. "inst-001"
  institutionName: string; // e.g. "Anna University Campus Hub"
  trainerId: string; // e.g. "exp-001"
  trainerName: string; // e.g. "Priya Sundaram"
  date: string; // ISO date string YYYY-MM-DD
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "05:00 PM"
  venue: string; // e.g. "Turing Lab 3, Department of Computer Science"
  focusTopic: string; // e.g. "Kernel ring buffers and live tracing"
  cohortSize: number; // e.g. 42
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  attendanceCount?: number;
  avgRating?: number;
  calendarLinks?: {
    google: string;
    ics: string;
  };
}

/**
 * Helper to generate a standardized calendar date string (YYYYMMDDTHHmmssZ)
 */
function toCalendarUtc(dateStr: string, timeStr: string): string {
  try {
    const isPm = timeStr.includes("PM");
    const [rawH, rawM] = timeStr.replace(/[^0-9:]/g, "").split(":");
    let h = parseInt(rawH, 10);
    if (isPm && h < 12) h += 12;
    if (!isPm && h === 12) h = 0;
    const m = parseInt(rawM || "0", 10);
    const d = new Date(dateStr);
    d.setHours(h, m, 0, 0);
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  } catch {
    return "20260920T033000Z";
  }
}

export function buildGoogleCalendarUrl(session: {
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
}): string {
  const start = toCalendarUtc(session.date, session.startTime);
  const end = toCalendarUtc(session.date, session.endTime);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: session.title,
    details: session.description,
    location: session.location,
    dates: `${start}/${end}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsDataUri(session: {
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
}): string {
  const start = toCalendarUtc(session.date, session.startTime);
  const end = toCalendarUtc(session.date, session.endTime);
  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DeScience Open Source Club//TalentOS//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `SUMMARY:${session.title.replace(/[,;]/g, " ")}`,
    `DESCRIPTION:${session.description.replace(/\n/g, "\\n").replace(/[,;]/g, " ")}`,
    `LOCATION:${session.location.replace(/[,;]/g, " ")}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const content = icsLines.join("\r\n");
  if (typeof btoa !== "undefined") {
    return `data:text/calendar;base64,${btoa(unescape(encodeURIComponent(content)))}`;
  }
  return `data:text/calendar;charset=utf8,${encodeURIComponent(content)}`;
}


import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SCHEDULE_FILE = path.join(DATA_DIR, "scheduled-sessions.json");

export const INITIAL_SCHEDULED_SESSIONS: ScheduledWorkshopSession[] = [];

function ensureScheduleFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SCHEDULE_FILE)) {
      fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(INITIAL_SCHEDULED_SESSIONS, null, 2), "utf-8");
    }
  } catch (e) {
    console.warn("Failed ensuring scheduled-sessions.json file:", e);
  }
}

export function loadScheduleFromDisk(): ScheduledWorkshopSession[] {
  ensureScheduleFile();
  try {
    if (fs.existsSync(SCHEDULE_FILE)) {
      const raw = fs.readFileSync(SCHEDULE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed reading scheduled-sessions.json:", e);
  }
  return [...INITIAL_SCHEDULED_SESSIONS];
}

export function saveScheduleToDisk(sessions: ScheduledWorkshopSession[]): void {
  ensureScheduleFile();
  try {
    fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(sessions, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed writing scheduled-sessions.json:", e);
  }
}

/**
 * Enrich a session with 1-click Google Calendar and Apple iCal links
 */
export function enrichSessionWithCalendar(session: ScheduledWorkshopSession): ScheduledWorkshopSession {
  const gcal = buildGoogleCalendarUrl({
    title: `DOS Club ${session.workshopCode}: ${session.workshopTitle}`,
    description: `Session ${session.sessionNumber} for ${session.institutionName}.\nTrainer: ${session.trainerName}\nTopic: ${session.focusTopic}`,
    location: `${session.venue}, ${session.institutionName}`,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
  });

  const ics = buildIcsDataUri({
    title: `DOS Club ${session.workshopCode}: ${session.workshopTitle}`,
    description: `Session ${session.sessionNumber} for ${session.institutionName}.\nTrainer: ${session.trainerName}\nTopic: ${session.focusTopic}`,
    location: `${session.venue}, ${session.institutionName}`,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
  });

  return {
    ...session,
    calendarLinks: {
      google: gcal,
      ics: ics,
    },
  };
}

/**
 * Filter scheduled sessions by role and institutional context
 */
export function getFilteredSchedule(params: {
  role?: "SUPER_ADMIN" | "TRAINER" | "COLLEGE_ADMIN" | "STUDENT";
  institutionName?: string;
  trainerName?: string;
}): ScheduledWorkshopSession[] {
  let result = loadScheduleFromDisk();

  // 1. Role: TRAINER (Expert Lead) - strictly restricted to workshops assigned to this expert
  if (params.role === "TRAINER") {
    const trainerToMatch = (params.trainerName && params.trainerName !== "ALL" ? params.trainerName : "")
      .toLowerCase()
      .trim();
    if (trainerToMatch) {
      result = result.filter(
        (s) =>
          s.trainerName.toLowerCase().includes(trainerToMatch) ||
          trainerToMatch.includes(s.trainerName.toLowerCase())
      );
    }
    if (params.institutionName && params.institutionName !== "ALL") {
      const cleanInst = params.institutionName.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.institutionName.toLowerCase().includes(cleanInst) ||
          cleanInst.includes(s.institutionName.toLowerCase())
      );
    }
  }
  // 2. Role: COLLEGE_ADMIN or STUDENT - strictly restricted to workshops scheduled for their college
  else if (params.role === "COLLEGE_ADMIN" || params.role === "STUDENT") {
    if (params.institutionName && params.institutionName !== "ALL") {
      const instToMatch = params.institutionName.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.institutionName.toLowerCase().includes(instToMatch) ||
          instToMatch.includes(s.institutionName.toLowerCase())
      );
    }
  }
  // 3. Role: SUPER_ADMIN (Platform Administrator) - full visibility with flexible filters
  else {
    if (params.institutionName && params.institutionName !== "ALL") {
      const cleanInst = params.institutionName.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.institutionName.toLowerCase().includes(cleanInst) ||
          cleanInst.includes(s.institutionName.toLowerCase())
      );
    }

    if (params.trainerName && params.trainerName !== "ALL") {
      const cleanTrainer = params.trainerName.toLowerCase().trim();
      result = result.filter((s) =>
        s.trainerName.toLowerCase().includes(cleanTrainer)
      );
    }
  }

  // Sort by date ascending
  result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return result.map(enrichSessionWithCalendar);
}

/**
 * Add a new scheduled workshop session (Admin action)
 */
export function addScheduledSession(newSession: Omit<ScheduledWorkshopSession, "id">): ScheduledWorkshopSession {
  const current = loadScheduleFromDisk();
  const id = `sched-${String(current.length + 1).padStart(3, "0")}`;
  const created: ScheduledWorkshopSession = {
    ...newSession,
    id,
  };
  current.push(created);
  saveScheduleToDisk(current);
  return enrichSessionWithCalendar(created);
}

/**
 * Update an existing session status (e.g. mark IN_PROGRESS or COMPLETED)
 */
export function updateSessionStatus(
  id: string,
  status: ScheduledWorkshopSession["status"]
): ScheduledWorkshopSession | null {
  const current = loadScheduleFromDisk();
  const session = current.find((s) => s.id === id);
  if (!session) return null;
  session.status = status;
  saveScheduleToDisk(current);
  return enrichSessionWithCalendar(session);
}

/**
 * Update full details of an existing session
 */
export function updateScheduledSession(
  id: string,
  updates: Partial<ScheduledWorkshopSession>
): ScheduledWorkshopSession | null {
  const current = loadScheduleFromDisk();
  const index = current.findIndex((s) => s.id === id);
  if (index === -1) return null;
  current[index] = {
    ...current[index],
    ...updates,
  };
  saveScheduleToDisk(current);
  return enrichSessionWithCalendar(current[index]);
}

/**
 * Delete a single scheduled session
 */
export function deleteScheduledSession(id: string): boolean {
  const current = loadScheduleFromDisk();
  const initLen = current.length;
  const filtered = current.filter((s) => s.id !== id);
  saveScheduleToDisk(filtered);
  return filtered.length < initLen;
}

/**
 * Bulk delete scheduled sessions
 */
export function deleteBulkScheduledSessions(ids: string[]): number {
  const current = loadScheduleFromDisk();
  const initLen = current.length;
  const filtered = current.filter((s) => !ids.includes(s.id));
  saveScheduleToDisk(filtered);
  return initLen - filtered.length;
}

/**
 * Bulk update session status
 */
export function updateBulkScheduledStatus(
  ids: string[],
  status: ScheduledWorkshopSession["status"]
): number {
  const current = loadScheduleFromDisk();
  let count = 0;
  current.forEach((s) => {
    if (ids.includes(s.id)) {
      s.status = status;
      count++;
    }
  });
  saveScheduleToDisk(current);
  return count;
}

