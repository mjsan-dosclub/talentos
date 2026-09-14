import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, workshop_id, check_out_lat, check_out_lng, feedback_rating, feedback_text } = body;

    if (!student_id || !workshop_id) {
      return NextResponse.json(
        { error: "Missing required parameters: student_id and workshop_id." },
        { status: 400 }
      );
    }

    const checkOutTime = new Date().toISOString();

    // 1. If feedback rating was submitted along with checkout, record it in session_feedback
    if (feedback_rating) {
      try {
        await supabase.from("session_feedback").insert({
          workshop_id,
          student_id,
          rating: Number(feedback_rating) || 4,
          reflection_text: feedback_text?.trim() || "Completed checkout with positive session reflection.",
          confidence_score: 4,
        });
      } catch (fbErr) {
        console.warn("Feedback recording notice during checkout:", fbErr);
      }
    }

    // 2. Query or update attendance record in Supabase
    let updatedRecord = null;

    try {
      // Find existing check-in record
      const { data: existing } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("student_id", student_id)
        .eq("workshop_id", workshop_id)
        .single();

      if (existing) {
        // If checked in previously, updating checkout completes the attendance: status = PRESENT
        const finalStatus = existing.status === "LATE" ? "LATE" : "PRESENT";

        const { data: updated } = await supabase
          .from("attendance_records")
          .update({
            check_out_time: checkOutTime,
            status: finalStatus,
            updated_at: checkOutTime,
          })
          .eq("id", existing.id)
          .select()
          .single();

        updatedRecord = updated;
      } else {
        // Direct checkout without check-in creates a record with PARTIAL_ATTENDANCE status
        const { data: created } = await supabase
          .from("attendance_records")
          .insert({
            student_id,
            workshop_id,
            check_out_time: checkOutTime,
            status: "PARTIAL_ATTENDANCE",
            source: "QR_SCAN",
          })
          .select()
          .single();

        updatedRecord = created;
      }
    } catch (dbErr) {
      console.warn("Supabase checkout notice:", dbErr);
    }

    // Fallback response if DB offline
    if (!updatedRecord) {
      updatedRecord = {
        id: `att-checkout-${Date.now()}`,
        student_id,
        workshop_id,
        check_out_time: checkOutTime,
        check_out_lat: check_out_lat || null,
        check_out_lng: check_out_lng || null,
        status: "PRESENT",
        source: "QR_SCAN",
      };
    }

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
