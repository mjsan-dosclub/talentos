import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workshopId = searchParams.get("workshop_id");
    const studentId = searchParams.get("student_id");

    let query = supabaseAdmin.from("attendance_records").select("*");
    if (workshopId) query = query.eq("workshop_id", workshopId);
    if (studentId) query = query.eq("student_id", studentId);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ attendance: data, isLiveDb: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      student_id,
      workshop_id,
      status,
      source,
      check_in_time,
      check_in_lat,
      check_in_lng,
      override_reason,
      manual_override_by,
    } = body;

    if (!student_id || !workshop_id) {
      return NextResponse.json(
        { error: "Missing required fields: student_id, workshop_id" },
        { status: 400 }
      );
    }

    // Check if an attendance record already exists for this student and workshop
    const { data: existing, error: findError } = await supabaseAdmin
      .from("attendance_records")
      .select("id")
      .eq("student_id", student_id)
      .eq("workshop_id", workshop_id)
      .maybeSingle();

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    let data;
    if (existing) {
      // Update existing record in-place; do NOT mutate primary key 'id' to preserve foreign key constraints
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("attendance_records")
        .update({
          status: status || "CHECKED_IN",
          source: source || "QR_SCAN",
          check_in_time: check_in_time || new Date().toISOString(),
          check_in_lat: check_in_lat !== undefined ? check_in_lat : null,
          check_in_lng: check_in_lng !== undefined ? check_in_lng : null,
          override_reason: override_reason !== undefined ? override_reason : null,
          manual_override_by: manual_override_by !== undefined ? manual_override_by : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      data = updated;
    } else {
      // Insert new attendance record
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("attendance_records")
        .insert({
          student_id,
          workshop_id,
          status: status || "CHECKED_IN",
          source: source || "QR_SCAN",
          check_in_time: check_in_time || new Date().toISOString(),
          check_in_lat: check_in_lat !== undefined ? check_in_lat : null,
          check_in_lng: check_in_lng !== undefined ? check_in_lng : null,
          override_reason: override_reason !== undefined ? override_reason : null,
          manual_override_by: manual_override_by !== undefined ? manual_override_by : null,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      data = inserted;
    }

    return NextResponse.json({ record: data, isLiveDb: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}
