import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAttendanceSession } from "@/lib/attendance-auth";

export async function POST(request: Request) {
  try {
    const session = await getAttendanceSession();
    if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json();
    const { student_id, workshop_id, session_id, qr_token, check_out_lat, check_out_lng, feedback_rating, feedback_text } = body;

    if (!student_id || !workshop_id) {
      return NextResponse.json(
        { error: "Missing required parameters: student_id and workshop_id." },
        { status: 400 }
      );
    }

    if (session.role !== "STUDENT" || student_id !== session.id) {
      return NextResponse.json({ error: "Only the signed-in student may complete checkout." }, { status: 403 });
    }
    if (!session_id || !qr_token) return NextResponse.json({ error: "A current workshop QR token is required for checkout." }, { status: 400 });
    const tokenHash = createHash("sha256").update(String(qr_token)).digest("hex");
    const { data: token, error: tokenError } = await supabaseAdmin.from("attendance_qr_tokens").select("workshop_id").eq("token_hash", tokenHash).eq("session_id", String(session_id)).gt("expires_at", new Date().toISOString()).maybeSingle();
    if (tokenError) throw tokenError;
    if (!token) return NextResponse.json({ error: "The workshop QR token is invalid or expired." }, { status: 403 });
    const verifiedWorkshopId = token.workshop_id;
    const { data: scheduled, error: scheduledError } = await supabaseAdmin
      .from("scheduled_workshop_sessions")
      .select("lifecycle_status")
      .eq("id", String(session_id))
      .maybeSingle();
    if (scheduledError) throw scheduledError;
    if (!scheduled) return NextResponse.json({ error: "Scheduled workshop session not found." }, { status: 404 });
    if (scheduled.lifecycle_status !== "ENDED") {
      return NextResponse.json({ error: "Checkout becomes available after the trainer ends the workshop." }, { status: 409 });
    }
    const rating = Number(feedback_rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "A feedback rating from 1 to 5 is required before checkout." }, { status: 400 });
    }
    const reflectionText = typeof feedback_text === "string" ? feedback_text.trim() : "";
    if (!reflectionText) {
      return NextResponse.json({ error: "A written session reflection is required before checkout." }, { status: 400 });
    }

    const checkOutTime = new Date().toISOString();

    const { data: existing, error: attendanceError } = await supabaseAdmin
      .from("attendance_records")
      .select("*")
      .eq("student_id", student_id)
      .eq("workshop_id", verifiedWorkshopId)
      .maybeSingle();
    if (attendanceError) throw attendanceError;
    if (!existing || !existing.check_in_time) {
      return NextResponse.json({ error: "Check-in is required before checkout." }, { status: 409 });
    }
    if (existing.check_out_time) {
      return NextResponse.json({ error: "This attendance record has already been checked out." }, { status: 409 });
    }

    const { error: feedbackError } = await supabaseAdmin.from("session_feedback").upsert({
      attendance_id: existing.id,
      rating,
      key_learning: reflectionText,
      confidence_score: 4,
    }, { onConflict: "attendance_id" });
    if (feedbackError) throw feedbackError;

    const finalStatus = existing.status === "LATE" ? "LATE" : "PRESENT";
    const { data: updatedRecord, error: updateError } = await supabaseAdmin
      .from("attendance_records")
      .update({
        check_out_time: checkOutTime,
        check_out_lat: check_out_lat || null,
        check_out_lng: check_out_lng || null,
        status: finalStatus,
        updated_at: checkOutTime,
      })
      .eq("id", existing.id)
      .select()
      .single();
    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: "Check-out verified successfully. Session completed.",
      record: updatedRecord,
      checkout_time: checkOutTime,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to record check-out." },
      { status: 500 }
    );
  }
}
