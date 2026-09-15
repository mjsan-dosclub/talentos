import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  serializeSession,
  DEMO_ACCOUNTS,
  TalentosUser,
  UserRole,
} from "@/lib/session";
import { getStudentByIdOrEmail } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, email, password, demoKey } = body;

    let user: TalentosUser;

    // 1. Fast-auth 1-Click Demo accounts (Explicitly selected via demo key)
    if (demoKey && DEMO_ACCOUNTS[demoKey]) {
      user = DEMO_ACCOUNTS[demoKey];
    } else if (role === "trainer") {
      if (password !== "dosclub2026" && password !== "trainer@2026") {
        return NextResponse.json({ error: "Invalid password for Technical Expert role." }, { status: 401 });
      }
      user = DEMO_ACCOUNTS.trainer;
    } else if (role === "college") {
      if (password !== "dosclub2026" && password !== "college@2026") {
        return NextResponse.json({ error: "Invalid password for College Coordinator role." }, { status: 401 });
      }
      user = DEMO_ACCOUNTS.college;
    } else if (role === "admin") {
      if (password !== "dosclub2026" && password !== "admin@2026") {
        return NextResponse.json({ error: "Invalid password for Super Admin role." }, { status: 401 });
      }
      user = DEMO_ACCOUNTS.admin;
    } else {
      // Student login - STRICT Credential Validation
      const cleanEmail = (email || "").trim();
      const providedPwd = (password || "").trim();

      const { student } = await getStudentByIdOrEmail(cleanEmail);

      if (!student) {
        return NextResponse.json(
          { error: `No registered student record found for email: "${cleanEmail}". Please check your email address.` },
          { status: 404 }
        );
      }

      // Check password: Must match student's dos_id (case-insensitive) OR standard cohort default passwords
      const validPasswords = [
        student.dos_id.toLowerCase(),
        "student@2026",
        "dosclub2026"
      ];

      if (!validPasswords.includes(providedPwd.toLowerCase())) {
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
        institution_id: "AU-DOS-01",
      };
    }

    const cookieVal = serializeSession(user);

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
          : `/record/${encodeURIComponent(user.dos_id || "DOS-B3-001")}`,
    });

    response.cookies.set(SESSION_COOKIE_NAME, cookieVal, {
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
      httpOnly: false,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to authenticate session" },
      { status: 500 }
    );
  }
}
