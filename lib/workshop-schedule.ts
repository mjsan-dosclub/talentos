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
  status: "SCHEDULED" | "ACTIVE_IN_SESSION" | "COMPLETED" | "POSTPONED";
  lifecycleStatus?: "NOT_STARTED" | "IN_SESSION" | "ENDED";
  startedAt?: string | null;
  endedAt?: string | null;
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


/**
 * Canonical In-Memory Ledger of Scheduled Workshops
 * Explicitly models user's scenario:
 * - College 1 (Anna University Hub): Wednesday 16 Sep 2026 -> Session 2 (1 workshop assigned)
 * - College 2 (PSG Tech Hub): Thursday 18 Sep & Friday 19 Sep 2026 -> Session 2 and Session 3 simultaneously (2 workshops assigned)
 * - Plus completed past workshops (Session 1) for historical calendar view
 */
export let SCHEDULED_SESSIONS_LEDGER: ScheduledWorkshopSession[] = [
  // 1. College 1 (Anna University Hub) - Wednesday 16 Sep 2026 (Upcoming Session 2)
  {
    id: "sched-001",
    workshopCode: "WS-02",
    workshopTitle: "Linux Kernel Primitives & eBPF",
    sessionNumber: 2,
    institutionId: "inst-001",
    institutionName: "Anna University Campus Hub",
    trainerId: "exp-001",
    trainerName: "Priya Sundaram",
    date: "2026-09-16", // Wednesday
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    venue: "Turing Computing Labs, Anna University Guindy Campus",
    focusTopic: "eBPF tracepoints, kernel probe ring buffers, and zero-copy packet filtration",
    cohortSize: 42,
    status: "SCHEDULED",
  },

  // 2. College 2 (PSG Tech Hub) - Thursday 18 Sep 2026 (Upcoming Session 2)
  {
    id: "sched-002",
    workshopCode: "WS-02",
    workshopTitle: "Linux Kernel Primitives & eBPF",
    sessionNumber: 2,
    institutionId: "inst-002",
    institutionName: "PSG College of Technology Hub",
    trainerId: "exp-001",
    trainerName: "Priya Sundaram",
    date: "2026-09-18", // Thursday 18th
    startTime: "09:00 AM",
    endTime: "01:00 PM",
    venue: "Seminar Hall 4, Department of Information Technology, PSG Tech",
    focusTopic: "eBPF probe architecture and hermetic trace verification",
    cohortSize: 38,
    status: "SCHEDULED",
  },

  // 3. College 2 (PSG Tech Hub) - Friday 19 Sep 2026 (Upcoming Session 3 - Simultaneous block)
  {
    id: "sched-003",
    workshopCode: "WS-03",
    workshopTitle: "Concurrent Memory Runtimes & Async IO",
    sessionNumber: 3,
    institutionId: "inst-002",
    institutionName: "PSG College of Technology Hub",
    trainerId: "exp-001",
    trainerName: "Priya Sundaram",
    date: "2026-09-19", // Friday 19th
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    venue: "Seminar Hall 4, Department of Information Technology, PSG Tech",
    focusTopic: "Actor concurrency, lock-free queues, and epoll reactor patterns",
    cohortSize: 38,
    status: "SCHEDULED",
  },

  // 4. College 1 (Anna University Hub) - Completed Past Session 1
  {
    id: "sched-004",
    workshopCode: "WS-01",
    workshopTitle: "Hermetic POSIX Architecture & Toolchains",
    sessionNumber: 1,
    institutionId: "inst-001",
    institutionName: "Anna University Campus Hub",
    trainerId: "exp-002",
    trainerName: "Vikram Seth",
    date: "2026-09-09", // Wednesday last week
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    venue: "Turing Computing Labs, Anna University Guindy Campus",
    focusTopic: "POSIX system calls, reproducible C toolchains, and strict isolation",
    cohortSize: 42,
    status: "COMPLETED",
    attendanceCount: 41,
    avgRating: 3.9,
  },

  // 5. College 2 (PSG Tech Hub) - Completed Past Session 1
  {
    id: "sched-005",
    workshopCode: "WS-01",
    workshopTitle: "Hermetic POSIX Architecture & Toolchains",
    sessionNumber: 1,
    institutionId: "inst-002",
    institutionName: "PSG College of Technology Hub",
    trainerId: "exp-002",
    trainerName: "Vikram Seth",
    date: "2026-09-11", // Friday last week
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    venue: "Seminar Hall 4, PSG Tech",
    focusTopic: "POSIX system calls, reproducible C toolchains, and strict isolation",
    cohortSize: 38,
    status: "COMPLETED",
    attendanceCount: 37,
    avgRating: 4.0,
  },

  // 6. College 3 (Thiagarajar College of Engineering Hub) - Upcoming Session 1
  {
    id: "sched-006",
    workshopCode: "WS-01",
    workshopTitle: "Hermetic POSIX Architecture & Toolchains",
    sessionNumber: 1,
    institutionId: "inst-003",
    institutionName: "Thiagarajar College of Engineering Hub",
    trainerId: "exp-003",
    trainerName: "Anand Natarajan",
    date: "2026-09-23",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    venue: "ECE Auditorium, TCE Madurai",
    focusTopic: "POSIX system calls and hermetic environment setup",
    cohortSize: 35,
    status: "SCHEDULED",
  },
];

// QA starts with an empty scheduler. Sessions must be created by an admin in
// Campus Scheduler; the legacy demo itinerary is intentionally not loaded.
SCHEDULED_SESSIONS_LEDGER = [];

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
  let result = [...SCHEDULED_SESSIONS_LEDGER];

  // 1. Role: TRAINER (Expert Lead) - strictly restricted to workshops assigned to this expert
  if (params.role === "TRAINER") {
    const trainerToMatch = (params.trainerName && params.trainerName !== "ALL" ? params.trainerName : "Priya Sundaram")
      .toLowerCase()
      .trim();
    result = result.filter(
      (s) =>
        s.trainerName.toLowerCase().includes(trainerToMatch) ||
        trainerToMatch.includes(s.trainerName.toLowerCase())
    );
    // If the trainer optionally filters by a specific campus hub they teach at
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
    const instToMatch = (params.institutionName && params.institutionName !== "ALL" ? params.institutionName : "Anna University Campus Hub")
      .toLowerCase()
      .trim();
    result = result.filter(
      (s) =>
        s.institutionName.toLowerCase().includes(instToMatch) ||
        instToMatch.includes(s.institutionName.toLowerCase())
    );
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

  const now = Date.now();
  return result.map((session) => {
    if (session.status === "POSTPONED") return enrichSessionWithCalendar(session);
    const start = new Date(`${session.date}T${to24Hour(session.startTime)}:00`).getTime();
    const end = new Date(`${session.date}T${to24Hour(session.endTime)}:00`).getTime();
    const status = now >= end ? "COMPLETED" : now >= start ? "ACTIVE_IN_SESSION" : "SCHEDULED";
    return enrichSessionWithCalendar({ ...session, status });
  });
}

function to24Hour(time: string): string {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return "09:00";
  let hour = Number(match[1]);
  if (match[3].toUpperCase() === "PM" && hour < 12) hour += 12;
  if (match[3].toUpperCase() === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${match[2]}`;
}

/**
 * Add a new scheduled workshop session (Admin action)
 */
export function addScheduledSession(newSession: Omit<ScheduledWorkshopSession, "id">): ScheduledWorkshopSession {
  const id = `sched-${String(SCHEDULED_SESSIONS_LEDGER.length + 1).padStart(3, "0")}`;
  const created: ScheduledWorkshopSession = {
    ...newSession,
    id,
  };
  SCHEDULED_SESSIONS_LEDGER.push(created);
  return enrichSessionWithCalendar(created);
}

/**
 * Update an existing session status (e.g. mark ACTIVE_IN_SESSION or COMPLETED)
 */
export function updateSessionStatus(
  id: string,
  status: ScheduledWorkshopSession["status"]
): ScheduledWorkshopSession | null {
  const session = SCHEDULED_SESSIONS_LEDGER.find((s) => s.id === id);
  if (!session) return null;
  session.status = status;
  return enrichSessionWithCalendar(session);
}

/**
 * Update full details of an existing session
 */
export function updateScheduledSession(
  id: string,
  updates: Partial<ScheduledWorkshopSession>
): ScheduledWorkshopSession | null {
  const index = SCHEDULED_SESSIONS_LEDGER.findIndex((s) => s.id === id);
  if (index === -1) return null;
  SCHEDULED_SESSIONS_LEDGER[index] = {
    ...SCHEDULED_SESSIONS_LEDGER[index],
    ...updates,
  };
  return enrichSessionWithCalendar(SCHEDULED_SESSIONS_LEDGER[index]);
}

/**
 * Delete a single scheduled session
 */
export function deleteScheduledSession(id: string): boolean {
  const initLen = SCHEDULED_SESSIONS_LEDGER.length;
  SCHEDULED_SESSIONS_LEDGER = SCHEDULED_SESSIONS_LEDGER.filter((s) => s.id !== id);
  return SCHEDULED_SESSIONS_LEDGER.length < initLen;
}

/**
 * Bulk delete scheduled sessions
 */
export function deleteBulkScheduledSessions(ids: string[]): number {
  const initLen = SCHEDULED_SESSIONS_LEDGER.length;
  SCHEDULED_SESSIONS_LEDGER = SCHEDULED_SESSIONS_LEDGER.filter((s) => !ids.includes(s.id));
  return initLen - SCHEDULED_SESSIONS_LEDGER.length;
}

/**
 * Bulk update session status
 */
export function updateBulkScheduledStatus(
  ids: string[],
  status: ScheduledWorkshopSession["status"]
): number {
  let count = 0;
  SCHEDULED_SESSIONS_LEDGER.forEach((s) => {
    if (ids.includes(s.id)) {
      s.status = status;
      count++;
    }
  });
  return count;
}
