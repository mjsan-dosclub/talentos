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
    const { student_id, workshop_id, status, source, check_in_time } = body;

    if (!student_id || !workshop_id) {
      return NextResponse.json(
        { error: "Missing required fields: student_id, workshop_id" },
        { status: 400 }
      );
    }

    const payload = {
      id: crypto.randomUUID(),
      student_id,
      workshop_id,
      status: status || "CHECKED_IN",
      source: source || "TRAINER_MANUAL",
      check_in_time: check_in_time || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("attendance_records")
      .upsert([payload], { onConflict: "student_id,workshop_id" })
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ record: data, isLiveDb: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}
