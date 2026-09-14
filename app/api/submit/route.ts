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

    // Check if submission already exists for this workshop and student
    const { data: existing, error: findError } = await supabaseAdmin
      .from("evidence_submissions")
      .select("id")
      .eq("workshop_id", workshop_id)
      .eq("student_id", student_id)
      .maybeSingle();

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    let data;
    if (existing) {
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("evidence_submissions")
        .update({
          status: "SUBMITTED",
          artifact_url,
          notes: notes || "",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      data = updated;
    } else {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("evidence_submissions")
        .insert({
          workshop_id,
          student_id,
          status: "SUBMITTED",
          artifact_url,
          notes: notes || "",
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      data = inserted;
    }

    return NextResponse.json({ submission: data, isLiveDb: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}
