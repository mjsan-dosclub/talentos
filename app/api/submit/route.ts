import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workshop_id, student_id, artifact_url, notes } = body;

    if (!workshop_id || !student_id || !artifact_url) {
      return NextResponse.json(
        { error: "Missing required fields: workshop_id, student_id, artifact_url" },
        { status: 400 }
      );
    }

    const payload = {
      id: crypto.randomUUID(),
      workshop_id,
      student_id,
      status: "SUBMITTED",
      artifact_url,
      notes: notes || "",
      submitted_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("evidence_submissions")
      .upsert([payload], { onConflict: "workshop_id,student_id" })
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ submission: data, isLiveDb: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}
