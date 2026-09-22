import { NextRequest, NextResponse } from "next/server";
import { sendEmail, buildWorkshopReportHtml } from "@/lib/email-service";
import { supabase } from "@/lib/supabase";
import { requireSuperAdmin } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();

    const {
      workshopCode,
      workshopTitle,
      institutionName,
      pocName,
      pocEmail,
      trainerName,
      date,
      venue,
      cohortSize = 42,
      attendanceCount = 40,
      focusTopic = "Hands-on implementation & test suite execution",
      standoutStudents = [],
      customNotes = "",
    } = body;

    if (!pocEmail || !pocEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid College Point of Contact (POC) email address is required." },
        { status: 400 }
      );
    }

    const calculatedRate =
      cohortSize > 0
        ? `${((attendanceCount / cohortSize) * 100).toFixed(1)}%`
        : "100%";

    const { html, text } = buildWorkshopReportHtml({
      workshopCode: workshopCode || "WS-01",
      workshopTitle: workshopTitle || "Systems Engineering Workshop",
      institutionName: institutionName || "Partner College Hub",
      pocName: pocName || "Dean / Faculty Coordinator",
      trainerName: trainerName || "Lead Technical Expert",
      date: date || new Date().toISOString().split("T")[0],
      venue: venue || "Main Campus Computing Hub",
      cohortSize: Number(cohortSize),
      attendanceCount: Number(attendanceCount),
      attendanceRate: calculatedRate,
      focusTopic: focusTopic || "Distributed Systems & Systems Architecture",
      standoutStudents: Array.isArray(standoutStudents) ? standoutStudents : [],
      customNotes,
    });

    const subject = `TalentOS Executive Workshop Report: ${workshopCode || "WS-01"} (${institutionName || "College Hub"})`;

    const dispatchResult = await sendEmail({
      to: pocEmail,
      subject,
      text,
      html,
    });

    // Best-effort audit logging into notification_dispatches
    try {
      await supabase.from("notification_dispatches").insert([
        {
          channel: "EMAIL",
          title: subject,
          content: `Executive Workshop Report delivered to ${pocName} (${pocEmail}) for ${workshopCode} with Global CC monitoring.`,
          dispatched_by: "ADMIN_WORKSHOP_OPERATIONS",
          sent_count: 1 + (dispatchResult.recipients.cc.length || 0),
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      message: `Workshop report successfully dispatched to ${pocName} (${pocEmail})`,
      dispatchResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to dispatch workshop report." },
      { status: 500 }
    );
  }
}
