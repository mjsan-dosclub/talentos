import { NextResponse } from "next/server";
import { getSystemConfig, updateSystemConfig, DEFAULT_SYSTEM_CONFIG } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const config = getSystemConfig();
    // Attempt reading from Supabase if table exists
    const { data, error } = await supabaseAdmin
      .from("system_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data?.settings && Object.keys(data.settings).length > 0) {
      // Merge live DB with local config so user updates take precedence
      const merged = updateSystemConfig(data.settings);
      return NextResponse.json({ config: merged, isLiveDb: true });
    }

    return NextResponse.json({ config, isLiveDb: false });
  } catch (err: any) {
    return NextResponse.json({ config: getSystemConfig(), isLiveDb: false });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = updateSystemConfig(body);

    // Persist to Supabase if table exists
    try {
      await supabaseAdmin.from("system_settings").upsert(
        [
          {
            id: "00000000-0000-0000-0000-000000000001",
            settings: updated,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "id" }
      );
    } catch (dbErr) {
      console.warn("DB settings persist fallback (using in-memory):", dbErr);
    }

    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
