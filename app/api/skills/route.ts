import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAttendanceSession } from "@/lib/attendance-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("student_id");

  try {
    let resolvedId = studentId;
    if (studentId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId);
      if (!isUuid) {
        const { data: stu } = await supabaseAdmin
          .from("students")
          .select("id")
          .or(`dos_id.eq.${studentId},email.eq.${studentId}`)
          .maybeSingle();
        if (stu?.id) {
          resolvedId = stu.id;
        } else {
          return NextResponse.json({ skills: [] });
        }
      }
    }

    let query = supabaseAdmin.from("student_technology_inventory").select("*");
    if (resolvedId) {
      query = query.eq("student_id", resolvedId);
    }

    const { data, error } = await query.order("evidence_count", { ascending: false });

    if (error) {
      console.warn("Supabase skills GET error:", error.message);
      return NextResponse.json({ skills: [], error: error.message }, { status: 500 });
    }

    return NextResponse.json({ skills: data || [] });
  } catch (err: any) {
    return NextResponse.json({ skills: [], error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAttendanceSession();
    if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json();
    const { student_id, tool_name, self_confidence, evidence_backed_maturity, assessed_level, evidence_count } = body;

    if (!student_id || !tool_name) {
      return NextResponse.json({ error: "student_id and tool_name required" }, { status: 400 });
    }
    if (session.role === "STUDENT" && student_id !== session.id) {
      return NextResponse.json({ error: "Students may only update their own skills." }, { status: 403 });
    }
    if (!["STUDENT", "TRAINER", "SUPER_ADMIN"].includes(session.role)) {
      return NextResponse.json({ error: "This role cannot update student skills." }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from("student_technology_inventory")
      .upsert(
        [
          {
            student_id,
            tool_name,
            self_confidence: self_confidence ?? 3,
            evidence_backed_maturity: evidence_backed_maturity ?? "INTRODUCED",
            assessed_level: assessed_level ?? "Developing",
            evidence_count: evidence_count ?? 1,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "student_id,tool_name" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ skill: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
