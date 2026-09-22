import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { canManageAttendance, getAttendanceSession } from "@/lib/attendance-auth";

export async function GET(request: Request) {
  try {
    const session = await getAttendanceSession();
    if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const workshopId = searchParams.get("workshop_id");
    const requestedStudentId = searchParams.get("student_id");
    const studentId = session.role === "STUDENT" ? session.id : requestedStudentId;
    if (session.role === "STUDENT" && requestedStudentId && requestedStudentId !== session.id) {
      return NextResponse.json({ error: "Students may only view their own attendance." }, { status: 403 });
    }

    let query = supabaseAdmin.from("attendance_records").select("*");
    if (workshopId) query = query.eq("workshop_id", workshopId);
    if (studentId) query = query.eq("student_id", studentId);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const workshopIds = [...new Set((data || []).map((row: any) => String(row.workshop_id)).filter(Boolean))];
    const workshopCodes = new Map<string, string>();
    if (workshopIds.length) {
      const { data: workshops } = await supabaseAdmin.from("workshops").select("id,code").in("id", workshopIds);
      (workshops || []).forEach((workshop: any) => workshopCodes.set(String(workshop.id), String(workshop.code || "")));
    }
    return NextResponse.json({
      attendance: (data || []).map((row: any) => ({ ...row, workshop_code: workshopCodes.get(String(row.workshop_id)) || "" })),
      isLiveDb: true,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAttendanceSession();
    if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json();
    const {
      student_id,
      workshop_id,
      status,
      source,
      check_in_time,
      check_in_lat,
      check_in_lng,
      override_reason,
      manual_override_by,
      session_id,
      qr_token,
    } = body;

    if (!student_id || !workshop_id) {
      return NextResponse.json(
        { error: "Missing required fields: student_id, workshop_id" },
        { status: 400 }
      );
    }
    if (session.role === "STUDENT" && student_id !== session.id) {
      return NextResponse.json({ error: "Students may only record their own attendance." }, { status: 403 });
    }
    if (!canManageAttendance(session) && session.role !== "STUDENT") {
      return NextResponse.json({ error: "This role cannot record attendance." }, { status: 403 });
    }

    // Never trust the browser's display name for the audit foreign key. The
    // trainer UI may have an older local-session cache, while the signed
    // server session remains authoritative. Resolve the trainer UUID on the
    // server before writing a manual attendance record.
    let verifiedManualOverrideBy: string | null = null;
    if (session.role === "TRAINER" && source === "TRAINER_MANUAL") {
      const { data: trainer, error: trainerError } = await supabaseAdmin
        .from("experts")
        .select("id")
        .eq("email", String(session.email || "").trim().toLowerCase())
        .maybeSingle();
      if (trainerError) return NextResponse.json({ error: trainerError.message }, { status: 500 });
      verifiedManualOverrideBy = trainer?.id ? String(trainer.id) : null;
      if (!verifiedManualOverrideBy) {
        return NextResponse.json({ error: "Authenticated trainer record could not be resolved." }, { status: 403 });
      }
    }

    let verifiedWorkshopId = String(workshop_id);
    if (session.role === "STUDENT") {
      if (!session_id || !qr_token) return NextResponse.json({ error: "A current workshop QR token is required." }, { status: 400 });
      const tokenHash = createHash("sha256").update(String(qr_token)).digest("hex");
      const { data: token, error: tokenError } = await supabaseAdmin
        .from("attendance_qr_tokens")
        .select("session_id,workshop_id,expires_at")
        .eq("token_hash", tokenHash)
        .eq("session_id", String(session_id))
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (tokenError) return NextResponse.json({ error: tokenError.message }, { status: 500 });
      if (!token) return NextResponse.json({ error: "The workshop QR token is invalid or expired." }, { status: 403 });
      verifiedWorkshopId = token.workshop_id;

      const { data: scheduled, error: scheduledError } = await supabaseAdmin
        .from("scheduled_workshop_sessions")
        .select("institution_id,institution_name")
        .eq("id", String(session_id))
        .maybeSingle();
      if (scheduledError) return NextResponse.json({ error: scheduledError.message }, { status: 500 });
      if (!scheduled) return NextResponse.json({ error: "Scheduled workshop session not found." }, { status: 404 });
      const { data: student, error: studentError } = await supabaseAdmin
        .from("students")
        .select("id,group_id,institution_name")
        .eq("id", session.id)
        .maybeSingle();
      if (studentError) return NextResponse.json({ error: studentError.message }, { status: 500 });
      if (!student) return NextResponse.json({ error: "Student record not found." }, { status: 404 });

      let studentInstitutionId = "";
      if (student.group_id) {
        const { data: group, error: groupError } = await supabaseAdmin.from("cohort_groups").select("batch_id").eq("id", student.group_id).maybeSingle();
        if (groupError) return NextResponse.json({ error: groupError.message }, { status: 500 });
        if (group?.batch_id) {
          const { data: batch, error: batchError } = await supabaseAdmin.from("batches").select("institution_id").eq("id", group.batch_id).maybeSingle();
          if (batchError) return NextResponse.json({ error: batchError.message }, { status: 500 });
          studentInstitutionId = String(batch?.institution_id || "");
        }
      }
      const studentInstitutionName = String(student.institution_name || "").trim().toLowerCase();
      const scheduledInstitutionName = String(scheduled.institution_name || "").trim().toLowerCase();
      const institutionNameMatches = Boolean(
        studentInstitutionName &&
        scheduledInstitutionName &&
        (studentInstitutionName.includes(scheduledInstitutionName) || scheduledInstitutionName.includes(studentInstitutionName))
      );
      // The explicit student institution is authoritative. Older records may
      // still point through a stale group/batch institution, so use that link
      // only when no explicit institution name is stored.
      if (studentInstitutionName) {
        if (!institutionNameMatches) {
          return NextResponse.json({ error: "This student is not assigned to the scheduled workshop college." }, { status: 403 });
        }
      } else if (studentInstitutionId && studentInstitutionId !== scheduled.institution_id) {
        return NextResponse.json({ error: "This student is not assigned to the scheduled workshop college." }, { status: 403 });
      }
    }

    // Check if an attendance record already exists for this student and workshop
    const { data: existing, error: findError } = await supabaseAdmin
      .from("attendance_records")
      .select("id")
      .eq("student_id", student_id)
      .eq("workshop_id", verifiedWorkshopId)
      .maybeSingle();

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    let data;
    if (existing) {
      // Update existing record in-place; do NOT mutate primary key 'id' to preserve foreign key constraints
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("attendance_records")
        .update({
          status: session.role === "STUDENT" ? "CHECKED_IN" : status || "CHECKED_IN",
          source: session.role === "STUDENT" ? "QR_SCAN" : source || "QR_SCAN",
          check_in_time: check_in_time || new Date().toISOString(),
          check_in_lat: check_in_lat !== undefined ? check_in_lat : null,
          check_in_lng: check_in_lng !== undefined ? check_in_lng : null,
          override_reason: override_reason !== undefined ? override_reason : null,
          manual_override_by: verifiedManualOverrideBy || (session.role === "SUPER_ADMIN" ? manual_override_by || null : null),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      data = updated;
    } else {
      // Insert new attendance record
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("attendance_records")
        .insert({
          student_id,
          workshop_id: verifiedWorkshopId,
          status: session.role === "STUDENT" ? "CHECKED_IN" : status || "CHECKED_IN",
          source: session.role === "STUDENT" ? "QR_SCAN" : source || "QR_SCAN",
          check_in_time: check_in_time || new Date().toISOString(),
          check_in_lat: check_in_lat !== undefined ? check_in_lat : null,
          check_in_lng: check_in_lng !== undefined ? check_in_lng : null,
          override_reason: override_reason !== undefined ? override_reason : null,
          manual_override_by: verifiedManualOverrideBy || (session.role === "SUPER_ADMIN" ? manual_override_by || null : null),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      data = inserted;
    }

    return NextResponse.json({ record: data, isLiveDb: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}
