import { NextRequest, NextResponse } from "next/server";
import {
  getFilteredSchedule,
  addScheduledSession,
  updateSessionStatus,
  ScheduledWorkshopSession,
} from "@/lib/workshop-schedule";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const institution = searchParams.get("institution") || undefined;
    const trainer = searchParams.get("trainer") || undefined;
    const role = (searchParams.get("role") as any) || undefined;

    const sessions = getFilteredSchedule({
      institutionName: institution,
      trainerName: trainer,
      role,
    });

    const todayStr = new Date().toISOString().split("T")[0];

    // Identify next upcoming session
    const upcomingSessions = sessions.filter(
      (s) => s.status === "UPCOMING" || s.status === "IN_PROGRESS"
    );
    const nextUpcoming = upcomingSessions[0] || null;

    // Identify recently completed sessions
    const completedSessions = sessions.filter((s) => s.status === "COMPLETED");

    return NextResponse.json({
      success: true,
      count: sessions.length,
      institution: institution || "ALL",
      trainer: trainer || "ALL",
      nextUpcoming,
      recentlyCompleted: completedSessions.slice(-3).reverse(),
      sessions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve workshop schedule" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      workshopCode,
      workshopTitle,
      sessionNumber,
      institutionId,
      institutionName,
      trainerId,
      trainerName,
      date,
      startTime,
      endTime,
      venue,
      focusTopic,
      cohortSize,
    } = body;

    if (!workshopCode || !workshopTitle || !institutionName || !date || !trainerName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields (workshopCode, workshopTitle, institutionName, date, trainerName)",
        },
        { status: 400 }
      );
    }

    const created = addScheduledSession({
      workshopCode,
      workshopTitle,
      sessionNumber: Number(sessionNumber) || 1,
      institutionId: institutionId || "inst-custom",
      institutionName,
      trainerId: trainerId || "exp-custom",
      trainerName,
      date,
      startTime: startTime || "09:00 AM",
      endTime: endTime || "05:00 PM",
      venue: venue || `${institutionName} Campus Lab`,
      focusTopic: focusTopic || "Hands-on implementation & defense",
      cohortSize: Number(cohortSize) || 40,
      status: "UPCOMING",
    });

    return NextResponse.json({ success: true, session: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to schedule workshop session" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "id and status are required" },
        { status: 400 }
      );
    }

    const updated = updateSessionStatus(id, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Scheduled session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, session: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update session" },
      { status: 500 }
    );
  }
}
