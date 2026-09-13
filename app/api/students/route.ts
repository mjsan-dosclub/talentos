import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("students")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ students: data, isLiveDb: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dos_id, full_name, email, department, group_id } = body;

    if (!dos_id || !full_name || !email) {
      return NextResponse.json(
        { error: "Missing required fields: dos_id, full_name, email" },
        { status: 400 }
      );
    }

    const payload = {
      id: crypto.randomUUID(),
      dos_id: dos_id.trim().toUpperCase(),
      group_id: group_id || "33333333-3333-3333-3333-333333333333",
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      department: department || "Anna University Hub",
      course: "Systems Engineering",
      year_of_study: 3,
      is_archived: false,
    };

    const { data, error } = await supabaseAdmin
      .from("students")
      .insert([payload])
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ student: data, isLiveDb: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}
