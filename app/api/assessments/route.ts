import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("student_id");

  try {
    let query = supabaseAdmin.from("external_assessments").select("*");
    if (studentId) {
      query = query.eq("student_id", studentId);
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
