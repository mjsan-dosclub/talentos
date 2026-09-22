import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAttendanceSession } from "@/lib/attendance-auth";

async function authorizedTrainer() {
  const session = await getAttendanceSession();
  if (!session || (session.role !== "TRAINER" && session.role !== "SUPER_ADMIN")) return null;
  return session;
}

export async function GET(request: Request) {
  const session = await authorizedTrainer();
  if (!session) return NextResponse.json({ error: "Trainer authentication required." }, { status: 403 });
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ recognitions: [] });
  const result = await supabaseAdmin.from("trainer_standouts").select("student_id,trainer_id,awarded_at").eq("session_id", sessionId);
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ recognitions: result.data || [] });
}

export async function POST(request: Request) {
  const session = await authorizedTrainer();
  if (!session) return NextResponse.json({ error: "Trainer authentication required." }, { status: 403 });
  const body = await request.json();
  if (!body.session_id || !body.student_id) return NextResponse.json({ error: "Session and student are required." }, { status: 400 });
  const expert = await supabaseAdmin.from("experts").select("id").eq("email", String(session.email || "").trim().toLowerCase()).maybeSingle();
  if (expert.error) return NextResponse.json({ error: expert.error.message }, { status: 500 });
  if (!expert.data?.id && session.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Trainer record could not be resolved." }, { status: 403 });
  const result = await supabaseAdmin.from("trainer_standouts").upsert({
    session_id: String(body.session_id), student_id: String(body.student_id), trainer_id: String(expert.data?.id || session.id),
  }, { onConflict: "session_id,student_id" }).select("student_id,trainer_id,awarded_at").single();
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ recognition: result.data });
}

export async function DELETE(request: Request) {
  const session = await authorizedTrainer();
  if (!session) return NextResponse.json({ error: "Trainer authentication required." }, { status: 403 });
  const body = await request.json();
  const result = await supabaseAdmin.from("trainer_standouts").delete().eq("session_id", String(body.session_id || "")).eq("student_id", String(body.student_id || ""));
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
