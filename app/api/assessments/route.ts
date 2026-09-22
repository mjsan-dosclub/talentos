import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAttendanceSession } from "@/lib/attendance-auth";

export async function GET(request: Request) {
  const session = await getAttendanceSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const requestedStudentId = searchParams.get("student_id");
  if (session.role === "STUDENT" && requestedStudentId && ![session.id, session.dos_id, session.email].includes(requestedStudentId)) {
    return NextResponse.json({ error: "Students may only view their own assessments." }, { status: 403 });
  }
  const studentId = session.role === "STUDENT" ? session.id : requestedStudentId;

  try {
    let resolvedId = studentId;
    if (studentId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId);
      if (!isUuid) {
        const { data: stu } = await supabaseAdmin
          .from("students")
          .select("id")
          .or(`dos_id.eq.${studentId},email.eq.${studentId}`)
          .maybeSingle();
        if (stu?.id) {
          resolvedId = stu.id;
        } else {
          return NextResponse.json({ assessments: [] });
        }
      }
    }

    let query = supabaseAdmin.from("external_assessments").select("*");
    if (resolvedId) {
      query = query.eq("student_id", resolvedId);
    }

    const { data, error } = await query.order("assessed_at", { ascending: false });

    if (error) {
      console.warn("Supabase external_assessments GET error:", error.message);
      return NextResponse.json({ assessments: [], error: error.message }, { status: 500 });
    }

    return NextResponse.json({ assessments: data || [] });
  } catch (err: any) {
    return NextResponse.json({ assessments: [], error: err.message }, { status: 500 });
  }
}
