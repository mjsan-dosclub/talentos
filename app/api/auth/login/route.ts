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

    // Role-based credential verification
    const cleanEmail = (email || "").trim();
    const providedPwd = (password || "").trim();

    if (role === "trainer") {
      const isRegisteredExpert = cleanEmail === "faculty@dosclub.org" || cleanEmail === "priya@dosclub.org" || cleanEmail.includes("trainer");
      if (!isRegisteredExpert) {
        return NextResponse.json({ error: `No registered Technical Expert account found for email: "${cleanEmail}".` }, { status: 404 });
      }
      if (providedPwd !== "dosclub2026" && providedPwd !== "trainer@2026") {
        return NextResponse.json({ error: "Invalid password for Technical Expert role. Check your credentials." }, { status: 401 });
      }
      user = {
        ...DEMO_ACCOUNTS.trainer,
        email: cleanEmail,
      };
    } else if (role === "college") {
      const isRegisteredCoordinator = cleanEmail === "coordinator@annauniv.edu" || cleanEmail.includes("coordinator") || cleanEmail.includes("annauniv");
      if (!isRegisteredCoordinator) {
        return NextResponse.json({ error: `No registered College Coordinator account found for email: "${cleanEmail}".` }, { status: 404 });
      }
      if (providedPwd !== "dosclub2026" && providedPwd !== "college@2026") {
        return NextResponse.json({ error: "Invalid password for College Coordinator role. Check your credentials." }, { status: 401 });
      }
      user = {
        ...DEMO_ACCOUNTS.college,
        email: cleanEmail,
      };
    } else if (role === "admin") {
      const isSuperAdmin = cleanEmail === "admin@dosclub.org" || cleanEmail.includes("admin");
      if (!isSuperAdmin) {
        return NextResponse.json({ error: `No registered Super Admin account found for email: "${cleanEmail}".` }, { status: 404 });
      }
      if (providedPwd !== "admin@2026" && providedPwd !== "dosclub2026") {
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
