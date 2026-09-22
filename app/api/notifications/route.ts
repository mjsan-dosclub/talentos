import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireSuperAdmin } from "@/lib/api-auth";

export async function GET() {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  try {
    const { data, error } = await supabaseAdmin
      .from("notification_dispatches")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ notifications: [], error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notifications: data || [] });
  } catch (err: any) {
    return NextResponse.json({ notifications: [], error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const { target_filter, channel, title, content, dispatched_by, sent_count } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "title and content are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("notification_dispatches")
      .insert([
        {
          target_filter: target_filter || { cohort: "Batch 3" },
          channel: channel || "IN_APP",
          title,
          content,
          dispatched_by: dispatched_by || "SUPER_ADMIN",
          sent_count: sent_count || 1,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notification: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
