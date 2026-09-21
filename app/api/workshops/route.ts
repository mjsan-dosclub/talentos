import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email-service";
import { generateGoogleCalendarUrl } from "@/lib/notification-templates";

import { WORKSHOP_TOPICS_27 } from "@/lib/db";

const DEFAULT_WORKSHOPS = WORKSHOP_TOPICS_27.map((topic, idx) => ({
  id: `ws-${String(idx + 1).padStart(2, "0")}`,
  batch_id: "22222222-2222-2222-2222-222222222222",
  session_number: idx + 1,
  title: topic,
  description: `Hands-on engineering workshop covering ${topic}.`,
  trainer_name: idx >= 13 ? "Priya Sundaram" : "Dr. Vikram Sethupathi",
  session_mode: "OFFLINE",
  scheduled_at: new Date(Date.now() + idx * 86400000).toISOString(),
  duration_minutes: 180,
  venue_name: "Anna University Campus / Chennai Hub",
  venue_lat: 13.011,
  venue_lng: 80.2354,
  venue_radius_meters: 150,
  is_active: true,
}));

import { loadWorkshopsFromDisk, saveWorkshopsToDisk } from "@/lib/workshops-store";

export async function GET() {
  const diskWorkshops = loadWorkshopsFromDisk();
  try {
    const { data, error } = await supabaseAdmin
      .from("workshops")
      .select("*")
      .order("session_number", { ascending: true });

    if (!error && data && data.length > 0) {
      const workshopMap = new Map<string, any>();
      diskWorkshops.forEach((w) => workshopMap.set(String(w.session_number), w));
      data.forEach((w: any) => workshopMap.set(String(w.session_number), w));
      const merged = Array.from(workshopMap.values());
      saveWorkshopsToDisk(merged);
      return NextResponse.json({ workshops: merged, isLiveDb: true });
    }
  } catch (err: any) {
    console.warn("[TalentOS] Supabase workshops GET notice:", err?.message);
  }

  return NextResponse.json({ workshops: diskWorkshops, isLiveDb: false });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
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

    const newRecord = {
      id: newId,
      batch_id: defaultBatchId,
      session_number: Number(session_number) || 28,
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
    };

    let newWorkshop = null;
    try {
      const { data, error } = await supabaseAdmin
        .from("workshops")
        .insert([newRecord])
        .select()
        .single();

      if (!error && data) {
        newWorkshop = data;
      }
    } catch (e) {
      console.warn("[TalentOS] Supabase workshop insert notice:", e);
    }

    if (!newWorkshop) {
      newWorkshop = newRecord;
    }

    // Persist to disk backup
    const currentDisk = loadWorkshopsFromDisk();
    const updatedDisk = [...currentDisk.filter((w) => w.session_number !== newWorkshop.session_number), newWorkshop];
    saveWorkshopsToDisk(updatedDisk);

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

    return NextResponse.json({ success: true, workshop: newWorkshop });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, session_number, code, title, focusArea, expertName, mode, status, detailedDescription, prerequisites, ...updates } = body;

    const sNum = session_number || (code ? parseInt(String(code).replace(/\D/g, "")) : null);

    if (!id && !sNum) {
      return NextResponse.json({ error: "Workshop ID or session_number/code required" }, { status: 400 });
    }

    const payload: any = { ...updates };
    if (title) payload.title = title;
    if (focusArea || detailedDescription) payload.description = detailedDescription || focusArea;
    if (expertName) payload.trainer_name = expertName;
    if (mode) payload.session_mode = mode;
    if (status) payload.is_active = status !== "INACTIVE";

    // 1. Update disk store
    const diskWorkshops = loadWorkshopsFromDisk();
    const updatedDisk = diskWorkshops.map((w) => {
      if ((id && w.id === id) || (sNum && w.session_number === sNum)) {
        return {
          ...w,
          title: title || w.title,
          description: detailedDescription || focusArea || w.description,
          trainer_name: expertName || w.trainer_name,
          session_mode: mode || w.session_mode,
          is_active: status ? status !== "INACTIVE" : w.is_active,
        };
      }
      return w;
    });
    saveWorkshopsToDisk(updatedDisk);

    // 2. Update Supabase
    try {
      let query = supabaseAdmin.from("workshops").update(payload);
      if (id) {
        query = query.eq("id", id);
      } else if (sNum) {
        query = query.eq("session_number", sNum);
      }
      await query;
    } catch (e) {
      console.warn("[TalentOS] Supabase workshop patch notice:", e);
    }

    return NextResponse.json({ success: true, message: "Workshop updated successfully." });
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

    const sNum = session_number ? Number(session_number) : null;

    // 1. Update disk store
    const diskWorkshops = loadWorkshopsFromDisk();
    const updatedDisk = diskWorkshops.filter((w) => {
      if (id && w.id === id) return false;
      if (sNum && w.session_number === sNum) return false;
      return true;
    });
    saveWorkshopsToDisk(updatedDisk);

    // 2. Delete from Supabase
    try {
      let query = supabaseAdmin.from("workshops").delete();
      if (id) {
        query = query.eq("id", id);
      } else if (sNum) {
        query = query.eq("session_number", sNum);
      }
      await query;
    } catch (e) {
      console.warn("[TalentOS] Supabase workshop delete notice:", e);
    }

    return NextResponse.json({ success: true, message: "Workshop deleted from database and disk store." });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}
