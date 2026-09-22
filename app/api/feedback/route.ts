import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAttendanceSession } from "@/lib/attendance-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const attendanceId = searchParams.get("attendance_id");

  if (!attendanceId) {
    return NextResponse.json({ error: "attendance_id required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("session_feedback")
      .select("*")
      .eq("attendance_id", attendanceId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ feedback: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAttendanceSession();
    if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json();
    const { attendance_id, rating, key_learning, confidence_score } = body;

    if (!attendance_id || !rating || !key_learning) {
      return NextResponse.json(
        { error: "attendance_id, rating (1-4), and key_learning are required" },
        { status: 400 }
      );
    }
    const { data: attendance, error: attendanceError } = await supabaseAdmin
      .from("attendance_records")
      .select("student_id")
      .eq("id", attendance_id)
      .maybeSingle();
    if (attendanceError) return NextResponse.json({ error: attendanceError.message }, { status: 500 });
    if (!attendance) return NextResponse.json({ error: "Attendance record not found." }, { status: 404 });
    if (session.role === "STUDENT" && attendance.student_id !== session.id) {
      return NextResponse.json({ error: "Students may only submit feedback for their own attendance." }, { status: 403 });
    }
    if (!["STUDENT", "TRAINER", "SUPER_ADMIN"].includes(session.role)) {
      return NextResponse.json({ error: "This role cannot submit session feedback." }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from("session_feedback")
      .upsert(
        [
          {
            attendance_id,
            rating: Math.min(4, Math.max(1, Number(rating))),
            key_learning: String(key_learning).trim(),
            confidence_score: Math.min(5, Math.max(1, Number(confidence_score || 3))),
          },
        ],
        { onConflict: "attendance_id" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ feedback: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
