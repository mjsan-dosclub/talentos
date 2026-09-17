import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email-service";
import { generateGoogleCalendarUrl } from "@/lib/notification-templates";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("workshops")
      .select("*")
      .order("session_number", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ workshops: data, isLiveDb: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      code,
      session_number,
      description,
      trainer_name,
      trainer_email,
      session_mode,
      scheduled_at,
      venue_name,
      venue_lat,
      venue_lng,
      venue_radius_meters,
    } = body;

    const newId = crypto.randomUUID();
    const defaultBatchId = "22222222-2222-2222-2222-222222222222";

    const { data, error } = await supabaseAdmin
      .from("workshops")
      .insert([
        {
          id: newId,
          batch_id: defaultBatchId,
          session_number: Number(session_number) || 28,
          code: code || `WS-${String(Number(session_number) || 28).padStart(2, "0")}`,
          title: title || "New Systems Workshop",
          description: description || "Hands-on engineering workshop.",
          trainer_name: trainer_name || "Lead Technical Expert",
          session_mode: session_mode || "OFFLINE",
          scheduled_at: scheduled_at || new Date().toISOString(),
          duration_minutes: 180,
          venue_name: venue_name || "Anna University Campus / Chennai Hub",
          venue_lat: Number(venue_lat) || 13.011,
          venue_lng: Number(venue_lng) || 80.2354,
          venue_radius_meters: Number(venue_radius_meters) || 150,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If trainer email provided, dispatch assignment notification with calendar sync
    if (trainer_email && trainer_email.includes("@")) {
      const gcal = generateGoogleCalendarUrl({
        title: `DOS Club Workshop: ${title}`,
        description: description || "Systems Engineering Defense",
        location: venue_name || "Anna University Hub",
        startTime: scheduled_at || new Date().toISOString(),
        endTime: new Date(Date.now() + 180 * 60000).toISOString(),
      });

      try {
        await sendEmail({
          to: trainer_email,
          subject: `Workshop Assignment: ${title}`,
          text: `Dear ${trainer_name},\n\nYou have been assigned as lead expert for ${title}.\nScheduled: ${scheduled_at}\nVenue: ${venue_name}\n\n1-Click Google Calendar:\n${gcal}\n\nDeScience Open Source Club`,
        });
      } catch (mailErr) {
        console.warn("[TalentOS] Workshop mentor assignment email notice:", mailErr);
      }
    }

    return NextResponse.json({ success: true, workshop: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, session_number, ...updates } = body;

    if (!id && !session_number) {
      return NextResponse.json({ error: "Workshop ID or session_number required" }, { status: 400 });
    }

    let query = supabaseAdmin.from("workshops").update(updates);
    if (id) {
      query = query.eq("id", id);
    } else {
      query = query.eq("session_number", session_number);
    }

    const { data, error } = await query.select();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const session_number = searchParams.get("session_number");

    if (!id && !session_number) {
      return NextResponse.json({ error: "Workshop ID or session_number required" }, { status: 400 });
    }

    let query = supabaseAdmin.from("workshops").delete();
    if (id) {
      query = query.eq("id", id);
    } else {
      query = query.eq("session_number", session_number);
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Workshop deleted from database." });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}
