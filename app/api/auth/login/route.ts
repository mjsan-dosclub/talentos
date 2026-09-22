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
      const { data: expert } = await supabaseAdmin.from("experts").select("id,full_name,email,status,password_hash,must_reset_password").ilike("email", cleanEmail).maybeSingle();
      if (expert) {
        if (expert.status === "INACTIVE") return NextResponse.json({ error: "This Technical Expert account is inactive." }, { status: 403 });
        if (!expert.password_hash || !verifyPassword(providedPwd, expert.password_hash)) return NextResponse.json({ error: "Invalid password for Technical Expert role." }, { status: 401 });
        user = { id: expert.id, email: expert.email, name: expert.full_name, role: "TRAINER", requiresOnboarding: Boolean(expert.must_reset_password) };
      } else if ((cleanEmail.toLowerCase() === "faculty@dosclub.org" || cleanEmail.toLowerCase() === "priya@dosclub.org") && (providedPwd === "trainer@2026" || providedPwd === "dosclub2026")) {
        user = { ...DEMO_ACCOUNTS.trainer, email: cleanEmail };
      } else {
        return NextResponse.json({ error: `No registered Technical Expert account found for email: "${cleanEmail}".` }, { status: 404 });
      }
    } else if (role === "college") {
      const { data: institution } = await supabaseAdmin.from("institutions").select("id,name,contact_email,is_active,password_hash,must_reset_password").ilike("contact_email", cleanEmail).maybeSingle();
      if (institution) {
        if (!institution.is_active) return NextResponse.json({ error: "This College account is inactive." }, { status: 403 });
        if (!institution.password_hash || !verifyPassword(providedPwd, institution.password_hash)) return NextResponse.json({ error: "Invalid password for College Coordinator role." }, { status: 401 });
        user = { id: institution.id, email: institution.contact_email, name: institution.name, role: "COLLEGE_ADMIN", institution_id: institution.id, requiresOnboarding: Boolean(institution.must_reset_password) };
      } else if (cleanEmail.toLowerCase() === "coordinator@annauniv.edu" && (providedPwd === "college@2026" || providedPwd === "dosclub2026")) {
        user = { ...DEMO_ACCOUNTS.college, email: cleanEmail };
      } else {
        return NextResponse.json({ error: `No registered College Coordinator account found for email: "${cleanEmail}".` }, { status: 404 });
      }
    } else if (role === "admin") {
      const configuredEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
      const configuredPasswordHash = process.env.SUPER_ADMIN_PASSWORD_HASH?.trim();
      if (configuredEmail && configuredPasswordHash && cleanEmail.toLowerCase() === configuredEmail && verifyPassword(providedPwd, configuredPasswordHash)) {
        user = { ...DEMO_ACCOUNTS.admin, email: configuredEmail };
      } else {
        const { data: customAdmin } = await supabaseAdmin.from("custom_admins").select("id,full_name,email,password_hash,permissions,status,must_reset_password").ilike("email", cleanEmail).maybeSingle();
        if (!customAdmin) return NextResponse.json({ error: "Invalid administrator credentials." }, { status: 401 });
        if (customAdmin.status !== "ACTIVE") return NextResponse.json({ error: "This administrator account is inactive." }, { status: 403 });
        if (!customAdmin.password_hash || !verifyPassword(providedPwd, customAdmin.password_hash)) return NextResponse.json({ error: "Invalid administrator credentials." }, { status: 401 });
        user = { id: customAdmin.id, email: customAdmin.email, name: customAdmin.full_name, role: "CUSTOM_ADMIN", permissions: customAdmin.permissions || [], requiresOnboarding: Boolean(customAdmin.must_reset_password) };
      }
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
        avatar_url: student.avatar_url || undefined,
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
          : user.role === "SUPER_ADMIN" || user.role === "CUSTOM_ADMIN"
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
