import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("student_id");

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
