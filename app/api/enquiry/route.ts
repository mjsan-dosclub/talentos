import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body.name || body.fullName;
    const contact = body.contact || body.email || body.phone;
    const category = body.category || "Student";
    const message = body.message || body.statement || "";

    if (!name || !contact) {
      return NextResponse.json(
        { error: "Name and Contact (Email or Mobile) are required." },
        { status: 400 }
      );
    }

    const enquiryId = `ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    // Best-effort insertion into Supabase if table exists
    try {
      await supabase.from("aspirant_enquiries").insert([
        {
          id: crypto.randomUUID(),
          enquiry_ref: enquiryId,
          full_name: name,
          email: contact.includes("@") ? contact : null,
          phone: !contact.includes("@") ? contact : null,
          institution: category,
          statement: message,
          created_at: timestamp,
        },
      ]);
    } catch (dbErr) {
      console.warn("Notice: Supabase aspirant_enquiries insert skipped or table not created:", dbErr);
    }

    console.log(`[TalentOS] New Enquiry registered: ${enquiryId} - ${name} (${contact}) - [${category}]`);

    return NextResponse.json({
      success: true,
      enquiryId,
      message: "Enquiry submitted successfully. Our team will connect with you.",
    });
  } catch (error: any) {
    console.error("Enquiry API error:", error);
    return NextResponse.json(
      { error: "Failed to process enquiry. Please try again or join directly via the membership portal." },
      { status: 500 }
    );
  }
}
