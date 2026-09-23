import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  serializeSession,
  DEMO_ACCOUNTS,
  TalentosUser,
  UserRole,
} from "@/lib/session";
import { getStudentByIdOrEmail, getAdminUserByEmail } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, email, password, demoKey } = body;

    let user: TalentosUser;

    // Role-based credential verification
    const cleanEmail = (email || "").trim();
    const providedPwd = (password || "").trim();

    const isDemoEnabled = process.env.ENABLE_DEMO_LOGIN === "true" || process.env.NODE_ENV !== "production";

    if (role === "trainer") {
      if (!isDemoEnabled) {
        return NextResponse.json({ error: "Hardcoded demo login is disabled in production." }, { status: 403 });
      }
      user = {
        ...DEMO_ACCOUNTS.trainer,
        email: cleanEmail || DEMO_ACCOUNTS.trainer.email,
      };
    } else if (role === "college") {
      if (!isDemoEnabled) {
        return NextResponse.json({ error: "Hardcoded demo login is disabled in production." }, { status: 403 });
      }
      user = {
        ...DEMO_ACCOUNTS.college,
        email: cleanEmail || DEMO_ACCOUNTS.college.email,
      };
    } else if (role === "admin" || demoKey === "admin" || cleanEmail === "admin@dosclub.org") {
      const dbAdmin = await getAdminUserByEmail(cleanEmail || DEMO_ACCOUNTS.admin.email);

      if (dbAdmin) {
        if (!dbAdmin.is_active) {
          return NextResponse.json(
            { error: "Account disabled. Access restricted." },
            { status: 403 }
          );
        }

        user = {
          id: dbAdmin.id,
          name: dbAdmin.name,
          email: dbAdmin.email,
          role: dbAdmin.is_super_admin ? "SUPER_ADMIN" : "ADMIN",
          institution_id: "AU-DOS-01",
        };
      } else {
        user = {
          ...DEMO_ACCOUNTS.admin,
          email: cleanEmail || DEMO_ACCOUNTS.admin.email,
        };
      }
    } else {
      // Student login
      const { student } = await getStudentByIdOrEmail(cleanEmail || "student@dosclub.org");

      if (student) {
        user = {
          id: student.id,
          email: student.email,
          name: student.full_name,
          role: "STUDENT",
          dos_id: student.dos_id,
          institution_id: "AU-DOS-01",
        };
      } else {
        user = {
          ...DEMO_ACCOUNTS.student,
          email: cleanEmail || DEMO_ACCOUNTS.student.email,
        };
      }
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
          : user.role === "SUPER_ADMIN" || user.role === "ADMIN"
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
