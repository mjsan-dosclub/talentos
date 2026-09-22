import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAttendanceSession } from "@/lib/attendance-auth";

export async function GET(request: Request) {
  const session = await getAttendanceSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const requestedStudentId = searchParams.get("student_id");
  if (session.role === "STUDENT" && requestedStudentId && ![session.id, session.dos_id, session.email].includes(requestedStudentId)) {
    return NextResponse.json({ error: "Students may only view their own certifications." }, { status: 403 });
  }
  const studentId = session.role === "STUDENT" ? session.id : requestedStudentId;

  try {
    let resolvedId = studentId;
    if (studentId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId);
      if (!isUuid) {
        const { data: stu } = await supabaseAdmin
          .from("students")
          .select("id")
          .or(`dos_id.eq.${studentId},email.eq.${studentId}`)
          .maybeSingle();
        if (stu?.id) {
          resolvedId = stu.id;
        } else {
          return NextResponse.json({ certifications: [] });
        }
      }
    }

    let query = supabaseAdmin.from("certifications").select("*");
    if (resolvedId) {
      query = query.eq("student_id", resolvedId);
    }

    const { data, error } = await query.order("completed_date", { ascending: false });

    if (error) {
      console.warn("Supabase certifications GET error:", error.message);
      return NextResponse.json({ certifications: [], error: error.message }, { status: 500 });
    }

    return NextResponse.json({ certifications: data || [] });
  } catch (err: any) {
    return NextResponse.json({ certifications: [], error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAttendanceSession();
    if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json();
    const { student_id, title, provider, category, level, completed_date, credential_url } = body;

    if (!student_id || !title || !provider) {
      return NextResponse.json({ error: "student_id, title, and provider are required" }, { status: 400 });
    }
    if (session.role === "STUDENT" && student_id !== session.id) {
      return NextResponse.json({ error: "Students may only add certifications to their own profile." }, { status: 403 });
    }
    if (!["STUDENT", "TRAINER", "SUPER_ADMIN"].includes(session.role)) {
      return NextResponse.json({ error: "This role cannot add certifications." }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from("certifications")
      .insert([
        {
          student_id,
          title,
          provider,
          category: category || "Technical Mastery",
          level: level || "Associate",
          completed_date: completed_date || new Date().toISOString().slice(0, 10),
          credential_url: credential_url || null,
          status: "PENDING_VERIFICATION",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ certification: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
