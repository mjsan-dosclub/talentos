import { randomBytes, createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireRoles } from "@/lib/api-auth";
import { getAttendanceSession } from "@/lib/attendance-auth";

export async function POST(request: NextRequest) {
  const denied = await requireRoles(["SUPER_ADMIN", "TRAINER"]);
  if (denied) return denied;
  const session = await getAttendanceSession();
  try {
    const body = await request.json();
    const sessionId = String(body.session_id || "").trim();
    if (!sessionId) return NextResponse.json({ error: "Scheduled session id is required." }, { status: 400 });

    const { data: scheduled, error: scheduleError } = await supabaseAdmin
      .from("scheduled_workshop_sessions")
      .select("id,workshop_code,workshop_title,institution_id,institution_name,trainer_id,trainer_name,session_date,start_time,end_time,venue")
      .eq("id", sessionId)
      .maybeSingle();
    if (scheduleError) throw scheduleError;
    if (!scheduled) return NextResponse.json({ error: "Scheduled session not found." }, { status: 404 });
    if (session?.role === "TRAINER" && scheduled.trainer_id !== session.id && scheduled.trainer_name !== session.name) {
      return NextResponse.json({ error: "This trainer is not assigned to the scheduled session." }, { status: 403 });
    }

    const { data: workshop, error: workshopError } = await supabaseAdmin
      .from("workshops")
      .select("id,is_active,code")
      .eq("code", scheduled.workshop_code)
      .maybeSingle();
    if (workshopError) throw workshopError;
    if (!workshop || !workshop.is_active) return NextResponse.json({ error: "The scheduled master workshop is not active." }, { status: 400 });

    const rawToken = randomBytes(24).toString("base64url");
    // Keep the trainer-controlled token valid long enough for a classroom
    // group to complete entry or departure checkout. The trainer can revoke
    // the window at any time by generating a new token.
    const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const { error: insertError } = await supabaseAdmin.from("attendance_qr_tokens").insert({
      session_id: scheduled.id,
      workshop_id: workshop.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });
    if (insertError) throw insertError;

    return NextResponse.json({
      token: rawToken,
      expiresAt,
      sessionId: scheduled.id,
      workshopId: workshop.id,
      workshopCode: workshop.code,
      institutionId: scheduled.institution_id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to issue attendance QR token." }, { status: 500 });
  }
}
