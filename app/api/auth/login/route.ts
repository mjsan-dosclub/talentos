import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  DEMO_ACCOUNTS,
  TalentosUser,
  UserRole,
} from "@/lib/session";
import { serializeSignedSession } from "@/lib/session-server";
import { getStudentByIdOrEmail } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyPassword } from "@/lib/password-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, email, password, demoKey } = body;

    let user: TalentosUser;

    // Role-based credential verification
    const cleanEmail = (email || "").trim();
    const providedPwd = (password || "").trim();

    if (role === "trainer") {
      const isRegisteredExpert = cleanEmail.toLowerCase() === "faculty@dosclub.org" || cleanEmail.toLowerCase() === "priya@dosclub.org";
      if (!isRegisteredExpert) {
        return NextResponse.json({ error: `No registered Technical Expert account found for email: "${cleanEmail}".` }, { status: 404 });
      }
      if (providedPwd !== "trainer@2026" && providedPwd !== "dosclub2026") {
        return NextResponse.json({ error: "Invalid password for Technical Expert role." }, { status: 401 });
      }
      user = {
        ...DEMO_ACCOUNTS.trainer,
        email: cleanEmail,
      };
    } else if (role === "college") {
      const isRegisteredCoordinator = cleanEmail.toLowerCase() === "coordinator@annauniv.edu";
      if (!isRegisteredCoordinator) {
        return NextResponse.json({ error: `No registered College Coordinator account found for email: "${cleanEmail}".` }, { status: 404 });
      }
      if (providedPwd !== "college@2026" && providedPwd !== "dosclub2026") {
        return NextResponse.json({ error: "Invalid password for College Coordinator role." }, { status: 401 });
      }
      user = {
        ...DEMO_ACCOUNTS.college,
        email: cleanEmail,
      };
    } else if (role === "admin") {
      const isSuperAdmin = cleanEmail.toLowerCase() === "admin@dosclub.org";
      if (!isSuperAdmin) {
        return NextResponse.json({ error: `No registered Super Admin account found for email: "${cleanEmail}".` }, { status: 404 });
      }
      if (providedPwd !== "admin@2026") {
        return NextResponse.json({ error: "Invalid password for Super Admin account." }, { status: 401 });
      }
      user = {
        ...DEMO_ACCOUNTS.admin,
        email: cleanEmail,
      };
    } else {
      // Student login - STRICT Credential Validation
      const cleanEmail = (email || "").trim();
      const providedPwd = (password || "").trim();

      const { data: registeredStudent } = await supabaseAdmin
        .from("students")
        .select("id,email,full_name,dos_id,institution_name,avatar_url,password_hash,must_reset_password")
        .ilike("email", cleanEmail)
        .maybeSingle();
      const { student: fallbackStudent } = registeredStudent ? { student: null } : await getStudentByIdOrEmail(cleanEmail);
      const student: any = registeredStudent || fallbackStudent;

      if (!student) {
        return NextResponse.json(
          { error: `No registered student record found for email: "${cleanEmail}". Please check your email address.` },
          { status: 404 }
        );
      }

      // Check password: Must match student's dos_id (case-insensitive) OR standard cohort default passwords
      const validPassword = student.password_hash
        ? verifyPassword(providedPwd, student.password_hash)
        : providedPwd.toLowerCase() === student.dos_id.toLowerCase();
      if (!validPassword) {
        return NextResponse.json(
          { error: `Invalid password for ${student.full_name}. Your default password is your DOS ID (${student.dos_id}).` },
          { status: 401 }
        );
      }

      user = {
        id: student.id,
        email: student.email,
        name: student.full_name,
        role: "STUDENT",
        dos_id: student.dos_id,
        institution_id: student.institution_name || "",
        requiresOnboarding: Boolean(student.must_reset_password ?? true) || !student.avatar_url,
      };
    }

    const cookieVal = await serializeSignedSession(user);

    const response = NextResponse.json({
      success: true,
      user,
      redirect:
        user.role === "TRAINER"
          ? "/trainer"
          : user.role === "COLLEGE_ADMIN"
          ? "/college"
          : user.role === "SUPER_ADMIN"
          ? "/admin"
          : user.requiresOnboarding
          ? "/student/setup"
          : `/record/${encodeURIComponent(user.dos_id || "DOS-B3-001")}`,
    });

    response.cookies.set(SESSION_COOKIE_NAME, cookieVal, {
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
      httpOnly: true,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to authenticate session" },
      { status: 500 }
    );
  }
}
