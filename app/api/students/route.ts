import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email-service";
import { StudentMember, INITIAL_STUDENTS } from "@/lib/admin-data";
import { requireSuperAdmin } from "@/lib/api-auth";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { deserializeSignedSession } from "@/lib/session-server";
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
    const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    const session = await deserializeSignedSession(sessionCookie);
    if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    // 1. Primary: Fetch live persistent records from Supabase
    try {
      const { data: dbStudents, error: dbErr } = await supabaseAdmin
        .from("students")
        .select("*")
        .order("created_at", { ascending: true });

      if (!dbErr && dbStudents && dbStudents.length > 0) {
        let trainerInstitutions: string[] = [];
        if (session.role === "TRAINER") {
          const { data: assignedSessions } = await supabaseAdmin
            .from("scheduled_workshop_sessions")
            .select("institution_id,institution_name")
            .or(`trainer_id.eq.${session.id},trainer_name.ilike.${session.name}`);
          trainerInstitutions = (assignedSessions || []).flatMap((row: any) => [row.institution_id, row.institution_name]).filter(Boolean).map(String);
        }
        const visibleStudents = dbStudents.filter((student: any) => {
          if (session.role === "SUPER_ADMIN") return true;
          if (session.role === "STUDENT") return String(student.id) === String(session.id);
          if (session.role === "COLLEGE_ADMIN") {
            const institution = String(student.institution_name || "").toLowerCase();
            const college = String(session.name || "").toLowerCase();
            return institution === college || institution.includes(college) || college.includes(institution);
          }
          if (session.role === "TRAINER") {
            const institution = String(student.institution_name || "").toLowerCase();
            return trainerInstitutions.some((value) => {
              const assigned = value.toLowerCase();
              return institution === assigned || institution.includes(assigned) || assigned.includes(institution);
            });
          }
          return false;
        });
        const mapped: StudentMember[] = dbStudents
          .filter((s: any) => visibleStudents.includes(s) && (includeArchived || !s.is_archived))
          .map((s: any) => ({
            id: s.id,
            dosId: s.dos_id,
            fullName: s.full_name,
            email: s.email,
            phone: s.phone || "",
            department: s.department || "Computer Science & Engineering",
            institution: s.institution_name || (s.department?.includes("Anna") ? "Anna University Campus Hub" : s.department || "Partner Institution Hub"),
            batch: "Batch 3 - 2026",
            completedWorkshops: 0,
            status: s.is_archived ? "ARCHIVED" : "ACTIVE",
            avatar: s.avatar_url || "",
          }));

        return NextResponse.json({
          success: true,
          count: mapped.length,
          students: mapped,
          source: "supabase_cloud",
        });
      }
    } catch (dbError) {
      console.warn("[TalentOS] Supabase students query notice:", dbError);
    }

    // 2. Fallback to disk store
    const students = getStudents(includeArchived).filter((student: any) => {
      if (session.role === "SUPER_ADMIN") return true;
      if (session.role === "STUDENT") return String(student.id) === String(session.id);
      if (session.role === "COLLEGE_ADMIN") {
        const institution = String(student.institution || "").toLowerCase();
        const college = String(session.name || "").toLowerCase();
        return institution === college || institution.includes(college) || college.includes(institution);
      }
      return false;
    });
    return NextResponse.json({ success: true, count: students.length, students, source: "disk_cache" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireSuperAdmin(); if (denied) return denied;
  try {
    const body = await request.json();
    const { dos_id, dosId, full_name, fullName, email, phone, department, institution, batch } = body;

    const studentDosId = (dos_id || dosId || "").trim().toUpperCase();
    const studentName = (full_name || fullName || "").trim();
    const studentEmail = (email || "").trim().toLowerCase();
    const studentPhone = (phone || "").trim();

    if (!studentDosId || !studentName || !studentEmail || !studentPhone) {
      return NextResponse.json(
        { error: "Missing required fields: DOS ID, full name, email, and mobile number" },
        { status: 400 }
      );
    }

    const [dosCheck, emailCheck, phoneCheck, groupResult] = await Promise.all([
      supabaseAdmin.from("students").select("id").eq("dos_id", studentDosId).limit(1),
      supabaseAdmin.from("students").select("id").eq("email", studentEmail).limit(1),
      supabaseAdmin.from("students").select("id").eq("phone", studentPhone).limit(1),
      supabaseAdmin.from("cohort_groups").select("id").limit(1),
    ]);
    if (dosCheck.data?.length || emailCheck.data?.length || phoneCheck.data?.length) {
      const duplicate = dosCheck.data?.length ? "DOS ID" : emailCheck.data?.length ? "email" : "mobile number";
      return NextResponse.json({ error: `A student with this ${duplicate} already exists.` }, { status: 409 });
    }
    const groupId = groupResult.data?.[0]?.id;
    if (!groupId) return NextResponse.json({ error: "No active cohort is available for student onboarding." }, { status: 503 });
    const newUuid = crypto.randomUUID();

    // 1. Primary: Insert into Supabase persistent storage
    let dbSuccess = false;
    try {
      const { data, error } = await supabaseAdmin
        .from("students")
        .insert([
          {
            id: newUuid,
            group_id: groupId,
            dos_id: studentDosId,
            full_name: studentName,
            email: studentEmail,
            phone: studentPhone,
            department: department || "Computer Science & Engineering",
            course: "Systems Engineering Fellowship",
            year_of_study: 3,
            is_archived: false,
            institution_name: institution || "",
          },
        ])
        .select();

      if (!error) {
        dbSuccess = true;
      } else {
        console.warn("[TalentOS] Supabase student insert notice:", error);
      }
    } catch (e) {
      console.warn("[TalentOS] Supabase student insert exception:", e);
    }

    if (!dbSuccess) {
      return NextResponse.json({ error: "Student could not be saved to the QA database." }, { status: 503 });
    }

    // Keep the local representation for the current session only; database is authoritative.
    const created = addStudent({
      dosId: studentDosId,
      fullName: studentName,
      email: studentEmail,
      phone: studentPhone,
      department: department || "Computer Science & Engineering",
      institution: institution || "Anna University Campus Hub",
      batch: batch || "Batch 3 - 2026",
      completedWorkshops: body.completedWorkshops || 0,
      status: body.status || "ACTIVE",
    });

    // Clean name salutation (remove test suffixes like "Verification" or "Test")
    const cleanDisplayName = studentName.replace(/\s+(Verification|Test|Engineer|Lead)$/i, "").trim();

    // 3. Dispatch Automatic Welcome & Priority Access Pass Email
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://dosclub-talentos.vercel.app").replace(/\/+$/, "");
    const loginUrl = `${baseUrl}/login`;
    const verificationUrl = `${baseUrl}/record/${studentDosId}`;

    try {
      await sendEmail({
        to: studentEmail,
        subject: `Welcome to TalentOS — Your Login Credentials & DOS ID (${studentDosId})`,
        text: `Dear ${cleanDisplayName},\n\nWelcome to DeScience Open Source Club Systems Engineering Fellowship!\n\nYOUR TALENTOS LOGIN CREDENTIALS:\nPortal Login URL: ${loginUrl}\nRegistered Email: ${studentEmail}\nDefault Password: ${studentDosId} (Your DOS ID is your default password. You can change it if needed in your portal settings)\n\nYour permanent cryptographic student identifier has been minted:\nDOS ID: ${studentDosId}\nCohort: Batch 3 (2026)\n\nInspect your live student defense record, verifiable credentials, and workshop clearance passes at:\n${verificationUrl}\n\nJoin our community channels:\n- WhatsApp: https://whatsapp.com/channel/0029VaDeScienceOSClub\n- Discord: https://discord.gg/descience-osclub\n\nDeScience Open Source Club — Academic Directorate\nno-reply@descienceosclub.com`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #0f172a;">
            <div style="background: #0f172a; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: -0.02em;">DeScience Open Source Club</h2>
              <p style="color: #38bdf8; margin: 4px 0 0; font-size: 12px; font-weight: 600;">Systems Engineering Fellowship Directorate</p>
            </div>
            
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
              Dear <strong>${cleanDisplayName}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Welcome to the <strong>DeScience Open Source Club Fellowship</strong> (Batch 3 &bull; 2026). Your candidate registration and cryptographic clearance key have been confirmed.
            </p>

            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 18px; margin: 20px 0;">
              <div style="font-size: 11px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                🔑 YOUR TALENTOS PORTAL LOGIN CREDENTIALS
              </div>
              <div style="font-size: 13px; color: #1e293b; line-height: 1.8;">
                &bull; <strong>Portal URL:</strong> <a href="${loginUrl}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${loginUrl} &rarr;</a><br/>
                &bull; <strong>Registered Email:</strong> <code style="background: #ffffff; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">${studentEmail}</code><br/>
                &bull; <strong>Default Password:</strong> <code style="background: #ffffff; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">${studentDosId}</code> <em>(Your DOS ID is your default password. You can change it if needed in your portal settings.)</em>
              </div>
            </div>

            <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 18px; margin: 20px 0;">
              <div style="font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">First login required</div>
              <div style="font-size: 13px; color: #7c2d12; line-height: 1.7;">Sign in with your email and DOS ID, create a private password, and upload a profile photo. Your student portal opens after both steps are complete.</div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                Verified Fellowship Credentials
              </div>
              <div style="font-size: 20px; font-weight: 800; color: #0284c7; font-family: monospace;">
                ${studentDosId}
              </div>
              <div style="font-size: 13px; color: #475569; margin-top: 4px;">
                Institutional Clearance: <strong>${department || "Computer Science & Engineering"}</strong>
              </div>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Your defense record, workshop attendance ledgers, and verified Git commits are tracked in real time:
            </p>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${verificationUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 700; border-radius: 8px;">
                View Your Defense & Access Pass Ledger &rarr;
              </a>
            </div>

            <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; font-size: 12px; color: #64748b; line-height: 1.6;">
              <strong>Official Community Channels:</strong><br/>
              &bull; <a href="http://descienceosclub.com/" style="color: #2563eb; text-decoration: none;">Official Website (descienceosclub.com)</a><br/>
              &bull; <a href="https://whatsapp.com/channel/0029Vb6yhyh5Ui2YyHbIL117" style="color: #2563eb; text-decoration: none;">Join WhatsApp Channel</a><br/>
              &bull; <a href="https://discord.com/channels/1503348482218524672/1503348483594129550" style="color: #2563eb; text-decoration: none;">Join Discord Community</a><br/>
              &bull; <a href="https://www.linkedin.com/company/descience-open-source-club/" style="color: #2563eb; text-decoration: none;">Follow on LinkedIn</a>
            </div>

            <div style="border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: 16px; font-size: 11px; color: #64748b; text-align: center; line-height: 1.5;">
              DeScience Open Source Club &bull; TalentOS Automated Dispatch<br/>
              Official Website: <a href="http://descienceosclub.com/" style="color: #2563eb; text-decoration: none;">descienceosclub.com</a><br/>
              <span style="color: #94a3b8; font-size: 10px;">You are receiving this email because you are subscribed to DeScience Open Source Club workshops. To unsubscribe, please reply to this email.</span>
            </div>


          </div>
        `,
      });
    } catch (mailErr) {
      console.warn("[TalentOS] Student welcome email dispatch exception:", mailErr);
    }

    return NextResponse.json({
      success: true,
      student: created,
      persistedInDb: dbSuccess,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const denied = await requireSuperAdmin(); if (denied) return denied;
  try {
    const body = await request.json();
    const { id, status, restore, ...rest } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing student id" }, { status: 400 });
    }

    // 1. Sync update in Supabase
    try {
      const isArchived = restore ? false : status === "ARCHIVED";
      await supabaseAdmin
        .from("students")
        .update({
          is_archived: isArchived,
          ...(rest.fullName ? { full_name: rest.fullName } : {}),
          ...(rest.email ? { email: rest.email } : {}),
          ...(rest.phone ? { phone: rest.phone } : {}),
          ...(rest.department ? { department: rest.department } : {}),
          ...(rest.institution ? { institution_name: rest.institution } : {}),
        })
        .or(`id.eq.${id},dos_id.eq.${id}`);
    } catch (e) {
      console.warn("[TalentOS] Supabase student PATCH notice:", e);
    }

    // 2. Disk store sync
    let updated;
    if (restore) {
      updated = restoreStudent(id);
    } else {
      updated = updateStudent(id, {
        ...(status ? { status } : {}),
        ...rest,
      });
    }

    return NextResponse.json({ success: true, student: updated || { id, status } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await requireSuperAdmin(); if (denied) return denied;
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

    // 1. Supabase deletion / archive
    try {
      if (permanent) {
        await supabaseAdmin
          .from("students")
          .delete()
          .or(`id.eq.${id},dos_id.eq.${id}`);
      } else {
        await supabaseAdmin
          .from("students")
          .update({ is_archived: true })
          .or(`id.eq.${id},dos_id.eq.${id}`);
      }
    } catch (e) {
      console.warn("[TalentOS] Supabase student DELETE notice:", e);
    }

    // 2. Disk store deletion
    if (permanent) {
      const deleted = deleteStudentPermanently(id);
      return NextResponse.json({ success: deleted, mode: "PERMANENT" });
    } else {
      const archived = archiveStudent(id);
      return NextResponse.json({ success: true, mode: "ARCHIVED", student: archived });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}
