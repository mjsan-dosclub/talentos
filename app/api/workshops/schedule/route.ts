import { NextRequest, NextResponse } from "next/server";
import {
  getFilteredSchedule,
  addScheduledSession,
  updateSessionStatus,
  updateScheduledSession,
  deleteScheduledSession,
  deleteBulkScheduledSessions,
  updateBulkScheduledStatus,
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

    // Priority 2 Overbooking Conflict Prevention Rule: Check expert schedule overlap
    const existingSchedule = getFilteredSchedule({ role: "SUPER_ADMIN" });
    const hasTrainerConflict = existingSchedule.some((s) => {
      if (s.date === date && s.trainerName.toLowerCase() === trainerName.toLowerCase() && s.status !== "CANCELLED") {
        // Compare time slots
        const newStart = startTime || "09:00 AM";
        const newEnd = endTime || "05:00 PM";
        if (s.startTime === newStart || s.endTime === newEnd) {
          return true;
        }
      }
      return false;
    });

    if (hasTrainerConflict) {
      return NextResponse.json(
        {
          success: false,
          error: `Overbooking Conflict: Technical Expert "${trainerName}" is already assigned to another session on ${date} during slot [${startTime || "09:00 AM"} - ${endTime || "05:00 PM"}]. Scheduling rejected.`,
        },
        { status: 409 }
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
    const { id, ids, status, ...updates } = body;

    // Bulk status update
    if (ids && Array.isArray(ids) && status) {
      const updatedCount = updateBulkScheduledStatus(ids, status);
      return NextResponse.json({
        success: true,
        updatedCount,
        message: `Updated status to ${status} for ${updatedCount} scheduled sessions.`,
      });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Session id is required" },
        { status: 400 }
      );
    }

    // Full or partial updates
    const updated = updateScheduledSession(id, {
      ...(status ? { status } : {}),
      ...updates,
    });

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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("id");

    let idsToDelete: string[] = [];
    if (queryId) {
      idsToDelete = [queryId];
    } else {
      try {
        const body = await req.json();
        if (body.ids && Array.isArray(body.ids)) {
          idsToDelete = body.ids;
        } else if (body.id) {
          idsToDelete = [body.id];
        }
      } catch {
        // query only
      }
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json(
        { success: false, error: "Session id(s) required for deletion" },
        { status: 400 }
      );
    }

    const deletedCount = deleteBulkScheduledSessions(idsToDelete);
    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} scheduled workshop session(s).`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete scheduled session(s)" },
      { status: 500 }
    );
  }
}
