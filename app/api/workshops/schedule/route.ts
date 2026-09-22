import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { deserializeSignedSession } from "@/lib/session-server";
import { buildGoogleCalendarUrl, buildIcsDataUri, ScheduledWorkshopSession } from "@/lib/workshop-schedule";

type DbSession = {
  id: string; workshop_code: string; workshop_title: string; institution_id: string; institution_name: string;
  trainer_id: string; trainer_name: string; session_date: string; start_time: string; end_time: string;
  venue: string; focus_topic: string; cohort_size: number; manual_status: "SCHEDULED" | "POSTPONED";
  lifecycle_status?: "NOT_STARTED" | "IN_SESSION" | "ENDED"; started_at?: string | null; ended_at?: string | null;
};

const TIME_PATTERN = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/i;

async function requireAdmin() {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = await deserializeSignedSession(cookie);
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ success: false, error: "Super Admin authentication required." }, { status: 403 });
  }
  return null;
}

async function currentSession() {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return deserializeSignedSession(cookie);
}

function minutes(value: string) {
  const match = value.match(/^(\d+):(\d+)\s(AM|PM)$/i);
  if (!match) return -1;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hour += 12;
  return hour * 60 + Number(match[2]);
}

function status(row: DbSession): ScheduledWorkshopSession["status"] {
  if (row.manual_status === "POSTPONED") return "POSTPONED";
  if (row.lifecycle_status === "ENDED") return "COMPLETED";
  if (row.lifecycle_status === "IN_SESSION") return "ACTIVE_IN_SESSION";
  return "SCHEDULED";
}

function map(row: DbSession): ScheduledWorkshopSession {
  const session = {
    id: row.id, workshopCode: row.workshop_code, workshopTitle: row.workshop_title, sessionNumber: 1,
    institutionId: row.institution_id, institutionName: row.institution_name, trainerId: row.trainer_id,
    trainerName: row.trainer_name, date: row.session_date, startTime: row.start_time, endTime: row.end_time,
    venue: row.venue, focusTopic: row.focus_topic, cohortSize: row.cohort_size, status: status(row),
    lifecycleStatus: row.lifecycle_status || "NOT_STARTED", startedAt: row.started_at || null, endedAt: row.ended_at || null,
  } satisfies ScheduledWorkshopSession;
  const description = "College: " + session.institutionName + "\nExpert: " + session.trainerName + "\nTopic: " + session.focusTopic;
  const location = session.venue + ", " + session.institutionName;
  return {
    ...session,
    calendarLinks: {
      google: buildGoogleCalendarUrl({ title: "DOS Club " + session.workshopCode + ": " + session.workshopTitle, description, location, date: session.date, startTime: session.startTime, endTime: session.endTime }),
      ics: buildIcsDataUri({ title: "DOS Club " + session.workshopCode + ": " + session.workshopTitle, description, location, date: session.date, startTime: session.startTime, endTime: session.endTime }),
    },
  };
}

function validate(body: Record<string, unknown>) {
  const required = ["workshopCode", "workshopTitle", "institutionId", "institutionName", "date", "trainerId", "trainerName", "startTime", "endTime", "venue", "focusTopic"];
  const missing = required.filter((field) => !String(body[field] || "").trim());
  if (missing.length) return "Please complete the required fields: " + missing.join(", ") + ".";
  if (!TIME_PATTERN.test(String(body.startTime)) || !TIME_PATTERN.test(String(body.endTime))) return "Time must use 12-hour format, for example 09:00 AM.";
  if (minutes(String(body.startTime)) >= minutes(String(body.endTime))) return "End time must be later than start time.";
  if (Number.isNaN(new Date(String(body.date) + "T00:00:00").getTime())) return "A valid session date is required.";
  if (String(body.venue).length > 500 || String(body.focusTopic).length > 10000) return "Venue or curriculum content is too long.";
  return null;
}

async function validateReferences(body: Record<string, unknown>) {
  const [workshopResult, institutionResult, expertResult] = await Promise.all([
    supabaseAdmin.from("workshops").select("code,is_active").eq("code", String(body.workshopCode || "")).maybeSingle(),
    supabaseAdmin.from("institutions").select("id,is_active").eq("id", String(body.institutionId || "")).maybeSingle(),
    supabaseAdmin.from("experts").select("id,status").eq("id", String(body.trainerId || "")).maybeSingle(),
  ]);
  if (workshopResult.error) throw workshopResult.error;
  if (institutionResult.error) throw institutionResult.error;
  if (expertResult.error) throw expertResult.error;
  if (!workshopResult.data) return "Selected workshop record was not found.";
  if (!workshopResult.data.is_active) return "Only active master workshops can be scheduled.";
  if (!institutionResult.data || !institutionResult.data.is_active) return "Selected college is not available for scheduling.";
  if (!expertResult.data || expertResult.data.status !== "ACTIVE") return "Selected expert is not active or was not found.";
  return null;
}

function payload(body: Record<string, unknown>) {
  return {
    workshop_code: String(body.workshopCode).trim(), workshop_title: String(body.workshopTitle).trim(),
    institution_id: String(body.institutionId || "institution-unassigned"), institution_name: String(body.institutionName).trim(),
    trainer_id: String(body.trainerId || "expert-unassigned"), trainer_name: String(body.trainerName).trim(),
    session_date: String(body.date), start_time: String(body.startTime), end_time: String(body.endTime),
    venue: String(body.venue).trim(), focus_topic: String(body.focusTopic).trim(), cohort_size: Math.max(0, Number(body.cohortSize) || 0),
  };
}

async function conflict(body: Record<string, unknown>, id?: string) {
  const result = await supabaseAdmin.from("scheduled_workshop_sessions").select("id,start_time,end_time")
    .eq("trainer_id", String(body.trainerId || "")).eq("session_date", String(body.date || ""));
  if (result.error) throw result.error;
  return (result.data || []).find((row) => row.id !== id && minutes(String(body.startTime)) < minutes(row.end_time) && minutes(String(body.endTime)) > minutes(row.start_time));
}

async function recordAssignmentNotification(body: Record<string, unknown>) {
  const title = `Workshop scheduled: ${String(body.workshopCode)} — ${String(body.institutionName)}`;
  const content = `Workshop ${String(body.workshopCode)} (${String(body.workshopTitle)}) is scheduled for ${String(body.date)}, ${String(body.startTime)}–${String(body.endTime)} at ${String(body.venue)}. Expert: ${String(body.trainerName)}.`;
  const result = await supabaseAdmin.from("notification_dispatches").insert({
    target_filter: { institution_id: String(body.institutionId), trainer_id: String(body.trainerId) },
    channel: "IN_APP",
    title,
    content,
    dispatched_by: "SUPER_ADMIN_SCHEDULER",
    sent_count: 0,
    created_at: new Date().toISOString(),
  });
  if (result.error) throw result.error;
  return { recorded: true, emailDispatch: "PENDING_APPROVAL" as const };
}

export async function GET(req: NextRequest) {
  const session = await currentSession();
  if (!session) return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  try {
    const params = new URL(req.url).searchParams;
    let query = supabaseAdmin.from("scheduled_workshop_sessions").select("*").order("session_date", { ascending: true });
    const result = await query; if (result.error) throw result.error;
    const requestedInstitution = params.get("institution");
    const requestedTrainer = params.get("trainer");
    const normalized = (value: unknown) => String(value || "").toLowerCase().trim();
    const includesEitherWay = (left: unknown, right: unknown) => {
      const a = normalized(left); const b = normalized(right);
      return Boolean(a && b && (a.includes(b) || b.includes(a)));
    };
    const visibleRows = (result.data || []).filter((row) => {
      const record = row as DbSession;
      if (session.role === "TRAINER" && !includesEitherWay(record.trainer_id, session.id) && !includesEitherWay(record.trainer_name, session.name)) return false;
      if ((session.role === "COLLEGE_ADMIN" || session.role === "STUDENT") && !includesEitherWay(record.institution_id, session.institution_id) && !includesEitherWay(record.institution_name, session.institution_id)) return false;
      if (session.role === "SUPER_ADMIN") {
        if (requestedInstitution && requestedInstitution !== "ALL" && !includesEitherWay(record.institution_name, requestedInstitution)) return false;
        if (requestedTrainer && requestedTrainer !== "ALL" && !includesEitherWay(record.trainer_name, requestedTrainer)) return false;
      } else if (session.role === "TRAINER" && requestedInstitution && requestedInstitution !== "ALL" && !includesEitherWay(record.institution_name, requestedInstitution)) return false;
      return true;
    });
    const sessions = visibleRows.map((row) => map(row as DbSession));
    return NextResponse.json({ success: true, count: sessions.length, nextUpcoming: sessions.find((s) => s.status === "SCHEDULED" || s.status === "ACTIVE_IN_SESSION") || null, recentlyCompleted: sessions.filter((s) => s.status === "COMPLETED").slice(-3).reverse(), sessions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to retrieve workshop schedule" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(); if (denied) return denied;
  try {
    const body = await req.json(); const validationError = validate(body);
    if (validationError) return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    const referenceError = await validateReferences(body);
    if (referenceError) return NextResponse.json({ success: false, error: referenceError }, { status: 400 });
    if (await conflict(body)) return NextResponse.json({ success: false, error: "This expert is already assigned to an overlapping workshop on that date." }, { status: 409 });
    const result = await supabaseAdmin.from("scheduled_workshop_sessions").insert(payload(body)).select("*").single();
    if (result.error) throw result.error;
    let notifications = { recorded: false, emailDispatch: "PENDING_APPROVAL" as const };
    try {
      notifications = await recordAssignmentNotification(body);
    } catch (notificationError) {
      console.warn("[TalentOS] Workshop assignment notification notice:", notificationError);
    }
    return NextResponse.json({ success: true, session: map(result.data as DbSession), notifications }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to schedule workshop session" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await currentSession();
  if (!session) return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  try {
    const body = await req.json(); const id = String(body.id || "");
    if (body.action === "START" || body.action === "END") {
      if (session.role !== "TRAINER" && session.role !== "SUPER_ADMIN") return NextResponse.json({ success: false, error: "Only the assigned trainer can control this workshop." }, { status: 403 });
      if (!id) return NextResponse.json({ success: false, error: "Session id is required." }, { status: 400 });
      const current = await supabaseAdmin.from("scheduled_workshop_sessions").select("*").eq("id", id).single();
      if (current.error || !current.data) return NextResponse.json({ success: false, error: "Scheduled session not found." }, { status: 404 });
      const row = current.data as DbSession;
      if (session.role === "TRAINER" && row.trainer_id !== session.id && row.trainer_name !== session.name) return NextResponse.json({ success: false, error: "This trainer is not assigned to the scheduled session." }, { status: 403 });
      if (body.action === "START" && row.lifecycle_status === "ENDED") return NextResponse.json({ success: false, error: "An ended workshop cannot be restarted." }, { status: 409 });
      const updates = body.action === "START"
        ? { lifecycle_status: "IN_SESSION", started_at: row.started_at || new Date().toISOString(), ended_at: null }
        : { lifecycle_status: "ENDED", ended_at: new Date().toISOString() };
      const result = await supabaseAdmin.from("scheduled_workshop_sessions").update(updates).eq("id", id).select("*").single();
      if (result.error) throw result.error;
      return NextResponse.json({ success: true, session: map(result.data as DbSession) });
    }
    const denied = await requireAdmin(); if (denied) return denied;
    const ids = Array.isArray(body.ids) ? body.ids.map((value: unknown) => String(value)).filter(Boolean) : [];
    if (ids.length > 0) {
      if (!["SCHEDULED", "POSTPONED"].includes(String(body.status || ""))) {
        return NextResponse.json({ success: false, error: "Bulk updates may only set Scheduled or Postponed. Active in Session and Completed are calculated from the schedule." }, { status: 400 });
      }
      const result = await supabaseAdmin.from("scheduled_workshop_sessions").update({ manual_status: body.status }).in("id", ids).select("id");
      if (result.error) throw result.error;
      return NextResponse.json({ success: true, updatedCount: result.data?.length || 0 });
    }
    if (!id) return NextResponse.json({ success: false, error: "Session id is required" }, { status: 400 });
    if (body.status && !["SCHEDULED", "POSTPONED"].includes(body.status)) return NextResponse.json({ success: false, error: "ACTIVE_IN_SESSION and COMPLETED are calculated from the schedule." }, { status: 400 });
    const current = await supabaseAdmin.from("scheduled_workshop_sessions").select("*").eq("id", id).single();
    if (current.error || !current.data) return NextResponse.json({ success: false, error: "Scheduled session not found" }, { status: 404 });
    const row = current.data as DbSession;
    const merged = { workshopCode: body.workshopCode ?? row.workshop_code, workshopTitle: body.workshopTitle ?? row.workshop_title, institutionId: body.institutionId ?? row.institution_id, institutionName: body.institutionName ?? row.institution_name, trainerId: body.trainerId ?? row.trainer_id, trainerName: body.trainerName ?? row.trainer_name, date: body.date ?? row.session_date, startTime: body.startTime ?? row.start_time, endTime: body.endTime ?? row.end_time, venue: body.venue ?? row.venue, focusTopic: body.focusTopic ?? row.focus_topic, cohortSize: body.cohortSize ?? row.cohort_size };
    const validationError = validate(merged);
    if (validationError) return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    const referenceError = await validateReferences(merged);
    if (referenceError) return NextResponse.json({ success: false, error: referenceError }, { status: 400 });
    if (await conflict(merged, id)) return NextResponse.json({ success: false, error: "This expert is already assigned to an overlapping workshop on that date." }, { status: 409 });
    const result = await supabaseAdmin.from("scheduled_workshop_sessions").update({ ...payload(merged), ...(body.status ? { manual_status: body.status } : {}) }).eq("id", id).select("*").single();
    if (result.error) throw result.error;
    return NextResponse.json({ success: true, session: map(result.data as DbSession) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to update session" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(); if (denied) return denied;
  try {
    const params = new URL(req.url).searchParams;
    let ids = params.get("id") ? [String(params.get("id"))] : [];
    if (ids.length === 0) {
      try {
        const body = await req.json();
        ids = Array.isArray(body?.ids) ? body.ids.map((value: unknown) => String(value)).filter(Boolean) : [];
      } catch {
        ids = [];
      }
    }
    if (ids.length === 0) return NextResponse.json({ success: false, error: "Session id is required" }, { status: 400 });
    const result = await supabaseAdmin.from("scheduled_workshop_sessions").delete().in("id", ids);
    if (result.error) throw result.error;
    return NextResponse.json({ success: true, deletedCount: ids.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to delete scheduled session" }, { status: 500 });
  }
}
