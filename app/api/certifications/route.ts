import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("student_id");

  try {
    let query = supabaseAdmin.from("certifications").select("*");
    if (studentId) {
      query = query.eq("student_id", studentId);
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
    const body = await request.json();
    const { student_id, title, provider, category, level, completed_date, credential_url } = body;

    if (!student_id || !title || !provider) {
      return NextResponse.json({ error: "student_id, title, and provider are required" }, { status: 400 });
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
