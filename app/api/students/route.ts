import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email-service";
import { StudentMember, INITIAL_STUDENTS } from "@/lib/admin-data";
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

    // 1. Primary: Fetch live persistent records from Supabase
    try {
      const { data: dbStudents, error: dbErr } = await supabaseAdmin
        .from("students")
        .select("*")
        .order("created_at", { ascending: true });

      if (!dbErr && dbStudents && dbStudents.length > 0) {
        const mapped: StudentMember[] = dbStudents
          .filter((s: any) => includeArchived || !s.is_archived)
          .map((s: any) => ({
            id: s.id,
            dosId: s.dos_id,
            fullName: s.full_name,
            email: s.email,
            phone: s.phone || "",
            department: s.department || "Computer Science & Engineering",
            institution: s.department?.includes("Anna")
              ? "Anna University Campus Hub"
              : s.department || "Partner Institution Hub",
            batch: "Batch 3 - 2026",
            completedWorkshops: 0,
            status: s.is_archived ? "ARCHIVED" : "ACTIVE",
            avatar: s.avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
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
    const students = getStudents(includeArchived);
    return NextResponse.json({ success: true, count: students.length, students, source: "disk_cache" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dos_id, dosId, full_name, fullName, email, phone, department, institution, batch } = body;

    const studentDosId = (dos_id || dosId || "").trim().toUpperCase();
    const studentName = (full_name || fullName || "").trim();
    const studentEmail = (email || "").trim().toLowerCase();
    const studentPhone = (phone || "").trim();

    if (!studentDosId || !studentName || !studentEmail) {
      return NextResponse.json(
        { error: "Missing required fields: dosId/dos_id, fullName/full_name, email" },
        { status: 400 }
      );
    }

    const newUuid = crypto.randomUUID();

    // 1. Primary: Insert into Supabase persistent storage
    let dbSuccess = false;
    try {
      const { data, error } = await supabaseAdmin
        .from("students")
        .insert([
          {
            id: newUuid,
            group_id: "33333333-3333-3333-3333-333333333333",
            dos_id: studentDosId,
            full_name: studentName,
            email: studentEmail,
            phone: studentPhone || "+91 98401 00000",
            department: department || "Computer Science & Engineering",
            course: "Systems Engineering Fellowship",
            year_of_study: 3,
            is_archived: false,
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

    // 2. Local fallback store
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

    // 3. Dispatch Automatic Welcome & Priority Access Pass Email
    const verificationUrl = `https://dosclub-talentos.vercel.app/record/${studentDosId}`;
    try {
      await sendEmail({
        to: studentEmail,
        subject: `Welcome to TalentOS — Your DOS ID (${studentDosId}) & Clearance Pass`,
        text: `Dear ${studentName},\n\nWelcome to DeScience Open Source Club Systems Engineering Fellowship!\n\nYour permanent cryptographic student identifier has been minted:\nDOS ID: ${studentDosId}\nCohort: Batch 3 (2026)\n\nInspect your live student defense record, verifiable credentials, and workshop clearance passes at:\n${verificationUrl}\n\nJoin our community channels:\n- WhatsApp: https://whatsapp.com/channel/0029VaDeScienceOSClub\n- Discord: https://discord.gg/descience-osclub\n\nDeScience Open Source Club — Academic Directorate\nnotifications@descienceosclub.com`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #0f172a;">
            <div style="background: #0f172a; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: -0.02em;">DeScience Open Source Club</h2>
              <p style="color: #38bdf8; margin: 4px 0 0; font-size: 12px; font-weight: 600;">Systems Engineering Fellowship Directorate</p>
            </div>
            
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
              Dear <strong>${studentName}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Welcome to the <strong>DeScience Open Source Club Fellowship</strong> (Batch 3 &bull; 2026). Your candidate registration and cryptographic clearance key have been confirmed.
            </p>

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
