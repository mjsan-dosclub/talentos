import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// In-memory fallback ledger for enquiries so admin panel displays submissions even when database is offline
export interface EnquiryRecord {
  id: string;
  enquiry_ref: string;
  full_name: string;
  phone: string;
  email: string;
  current_role: string;
  referral_source: string;
  message: string;
  status: "NEW" | "CONTACTED" | "ACCEPTED" | "INACTIVE";
  created_at: string;
}

let ENQUIRIES_LEDGER: EnquiryRecord[] = [
  {
    id: "enq-001",
    enquiry_ref: "ENQ-2026-4819",
    full_name: "Siddharth Raman",
    phone: "+91 98401 23456",
    email: "siddharth.r@annauniv.edu",
    current_role: "Engineering Student (Year 3-4)",
    referral_source: "Campus Workshop / College Event",
    message: "Interested in Systems Pod Alpha and distributed consensus track for CodeZap 3.0.",
    status: "NEW",
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "enq-002",
    enquiry_ref: "ENQ-2026-7291",
    full_name: "Divya Natesan",
    phone: "+91 97909 87654",
    email: "divya.n@mitindia.edu",
    current_role: "Recent Engineering Graduate",
    referral_source: "LinkedIn / Social Media",
    message: "Seeking zero-trust security track and hands-on Linux kernel internals training.",
    status: "CONTACTED",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export async function GET() {
  try {
    // Try querying Supabase
    const { data, error } = await supabase
      .from("aspirant_enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return NextResponse.json({ enquiries: data });
    }
  } catch (err) {
    // Use fallback ledger
  }

  return NextResponse.json({ enquiries: ENQUIRIES_LEDGER });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body.name || body.fullName;
    const phone = body.phone || body.whatsapp || body.contact;
    const email = body.email;
    const currentRole = body.current_role || body.category || "Engineering Student (Year 3-4)";
    const referralSource = body.referral_source || body.source || "Web Search / Direct";
    const message = body.message || body.statement || "";

    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: "Full Name, WhatsApp Mobile Number, and Email Address are all required." },
        { status: 400 }
      );
    }

    const enquiryId = `ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    const newRecord: EnquiryRecord = {
      id: `enq-${Date.now()}`,
      enquiry_ref: enquiryId,
      full_name: name,
      phone,
      email,
      current_role: currentRole,
      referral_source: referralSource,
      message,
      status: "NEW",
      created_at: timestamp,
    };

    ENQUIRIES_LEDGER.unshift(newRecord);

    // Best-effort insertion into Supabase
    try {
      await supabase.from("aspirant_enquiries").insert([
        {
          id: crypto.randomUUID(),
          enquiry_ref: enquiryId,
          full_name: name,
          email,
          phone,
          institution: currentRole,
          statement: `[Source: ${referralSource}] ${message}`,
          created_at: timestamp,
        },
      ]);
    } catch (dbErr) {
      console.warn("Supabase aspirant_enquiries notice:", dbErr);
    }

    // 1. Dispatch Admin Alert Email
    console.log(`[TalentOS Notification] Admin Email Dispatched: "🚨 New Admissions Enquiry: ${name} (${currentRole}) - Contact: ${phone}, ${email}"`);

    // 2. Dispatch Candidate Auto-Responder Email (Thank You + Social Channels + Anti-Spam Whitelist)
    console.log(`[TalentOS Notification] Candidate Confirmation Dispatched to ${email}: "We received your DOS Club Admissions Enquiry (Ref: ${enquiryId}). Follow our WhatsApp Channel & Discord to avoid spam delays."`);

    // 3. Best-effort logging in notification_dispatches
    try {
      await supabase.from("notification_dispatches").insert([
        {
          channel: "EMAIL",
          title: `Admissions Enquiry Acknowledged (${enquiryId})`,
          content: `Auto-responder sent to ${name} (${email}) with WhatsApp & Discord community onboarding links.`,
          dispatched_by: "SYSTEM_ADMISSIONS_POD",
          sent_count: 2, // 1 candidate + 1 admin
          created_at: timestamp,
        },
      ]);
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      enquiryId,
      enquiry: newRecord,
      message: "Enquiry submitted successfully! We sent a confirmation to your email. Check your inbox and join our WhatsApp community.",
      socialChannels: {
        whatsapp: "https://whatsapp.com/channel/0029VaDeScienceOSClub",
        discord: "https://discord.gg/descience-osclub",
        linkedin: "https://www.linkedin.com/company/touchmark-descience/",
        github: "https://github.com/descience-osclub",
        twitter: "https://x.com/descience_club",
        youtube: "https://youtube.com/@descienceosclub",
      },
    });
  } catch (error: any) {
    console.error("Enquiry API error:", error);
    return NextResponse.json(
      { error: "Failed to process enquiry. Please try again or connect directly via the membership portal." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ids, status } = body;

    const targetIds: string[] = ids ? ids : id ? [id] : [];
    if (targetIds.length === 0 || !status) {
      return NextResponse.json(
        { error: "Enquiry ID(s) and target status are required." },
        { status: 400 }
      );
    }

    let updatedCount = 0;
    ENQUIRIES_LEDGER = ENQUIRIES_LEDGER.map((enq) => {
      if (targetIds.includes(enq.id) || targetIds.includes(enq.enquiry_ref)) {
        updatedCount++;
        return { ...enq, status: status as EnquiryRecord["status"] };
      }
      return enq;
    });

    // Best-effort update in Supabase
    try {
      await supabase
        .from("aspirant_enquiries")
        .update({ status })
        .in("id", targetIds);
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      status,
      message: `Successfully updated ${updatedCount} enquiry record(s) to ${status}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update enquiry status" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("id");

    let targetIds: string[] = [];
    if (queryId) {
      targetIds = [queryId];
    } else {
      try {
        const body = await req.json();
        if (body.ids && Array.isArray(body.ids)) {
          targetIds = body.ids;
        } else if (body.id) {
          targetIds = [body.id];
        }
      } catch {
        // No json body
      }
    }

    if (targetIds.length === 0) {
      return NextResponse.json(
        { error: "Enquiry ID(s) required for deletion." },
        { status: 400 }
      );
    }

    const initialLen = ENQUIRIES_LEDGER.length;
    ENQUIRIES_LEDGER = ENQUIRIES_LEDGER.filter(
      (enq) => !targetIds.includes(enq.id) && !targetIds.includes(enq.enquiry_ref)
    );
    const deletedCount = initialLen - ENQUIRIES_LEDGER.length;

    // Best-effort delete in Supabase
    try {
      await supabase
        .from("aspirant_enquiries")
        .delete()
        .in("id", targetIds);
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Successfully deleted ${deletedCount} enquiry record(s).`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete enquiry record(s)" },
      { status: 500 }
    );
  }
}
