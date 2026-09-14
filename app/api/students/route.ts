import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getStudents,
  addStudent,
  updateStudent,
  archiveStudent,
  restoreStudent,
  deleteStudentPermanently,
} from "@/lib/students-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    // First try disk store as primary persistent truth
    const students = getStudents(includeArchived);
    return NextResponse.json({ success: true, count: students.length, students });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dos_id, dosId, full_name, fullName, email, department, institution, batch } = body;

    const studentDosId = (dos_id || dosId || "").trim().toUpperCase();
    const studentName = (full_name || fullName || "").trim();
    const studentEmail = (email || "").trim().toLowerCase();

    if (!studentDosId || !studentName || !studentEmail) {
      return NextResponse.json(
        { error: "Missing required fields: dosId/dos_id, fullName/full_name, email" },
        { status: 400 }
      );
    }

    const created = addStudent({
      dosId: studentDosId,
      fullName: studentName,
      email: studentEmail,
      department: department || "Computer Science & Engineering",
      institution: institution || "Anna University Campus Hub",
      batch: batch || "Batch 3 - 2026",
      completedWorkshops: body.completedWorkshops || 0,
      status: body.status || "ACTIVE",
    });

    // Best-effort sync with Supabase
    try {
      await supabaseAdmin.from("students").insert([
        {
          id: created.id,
          dos_id: created.dosId,
          full_name: created.fullName,
          email: created.email,
          department: created.department,
          course: "Systems Engineering",
          year_of_study: 3,
          is_archived: false,
        },
      ]);
    } catch (e) {
      // Non-blocking
    }

    return NextResponse.json({ success: true, student: created });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, restore, ...rest } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing student id" }, { status: 400 });
    }

    let updated;
    if (restore) {
      updated = restoreStudent(id);
    } else {
      updated = updateStudent(id, {
        ...(status ? { status } : {}),
        ...rest,
      });
    }

    if (!updated) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, student: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    let permanent = searchParams.get("permanent") === "true";

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
        if (body.permanent !== undefined) {
          permanent = Boolean(body.permanent);
        }
      } catch {
        // query param only
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Missing student id" }, { status: 400 });
    }

    if (permanent) {
      const deleted = deleteStudentPermanently(id);
      return NextResponse.json({ success: deleted, mode: "PERMANENT" });
    } else {
      // Soft-delete: update status to ARCHIVED
      const archived = archiveStudent(id);
      if (!archived) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, mode: "ARCHIVED", student: archived });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}
