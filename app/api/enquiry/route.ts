import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, institution, yearAndDept, track, statement } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Full Name and Email are required fields." },
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
          full_name: fullName,
          email,
          phone: phone || null,
          institution: institution || null,
          year_and_dept: yearAndDept || null,
          track: track || null,
          statement: statement || null,
          created_at: timestamp,
        },
      ]);
    } catch (dbErr) {
      console.warn("Notice: Supabase aspirant_enquiries insert skipped or table not created:", dbErr);
    }

    console.log(`[TalentOS] New Aspirant Enquiry registered: ${enquiryId} - ${fullName} (${email}) - Track: ${track}`);

    return NextResponse.json({
      success: true,
      enquiryId,
      message: "Enquiry submitted successfully. Admissions committee will review your profile.",
    });
  } catch (error: any) {
    console.error("Enquiry API error:", error);
    return NextResponse.json(
      { error: "Failed to process enquiry. Please try again or join directly via the membership portal." },
      { status: 500 }
    );
  }
}
