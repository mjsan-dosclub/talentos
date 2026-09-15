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

    // 1. If fast-auth demo key provided
    if (demoKey && DEMO_ACCOUNTS[demoKey]) {
      user = DEMO_ACCOUNTS[demoKey];
    } else if (role === "trainer" || email?.includes("faculty") || email?.includes("priya")) {
      user = DEMO_ACCOUNTS.trainer;
    } else if (role === "college" || email?.includes("coordinator") || email?.includes("annauniv")) {
      user = DEMO_ACCOUNTS.college;
    } else if (role === "admin" || email?.includes("admin")) {
      user = DEMO_ACCOUNTS.admin;
    } else {
      // Student login
      const cleanEmail = (email || "").trim();
      const { student } = await getStudentByIdOrEmail(cleanEmail);
      const dosId = student?.dos_id || (cleanEmail.toLowerCase().includes("arumugam") ? "DOS-B3-013" : cleanEmail.includes("002") ? "DOS-B3-002" : "DOS-B3-001");
      
      // If student was queried or fallback found, validate password
      const providedPwd = (password || "").trim();
      if (providedPwd && student) {
        const validPwds = [student.dos_id, "student@2026", "dosclub2026", "DOS-B3-013"];
        if (!validPwds.includes(providedPwd)) {
          return NextResponse.json(
            { error: "Invalid password. Your default password is your DOS ID (e.g. DOS-B3-013)." },
            { status: 401 }
          );
        }
      }

      user = {
        id: student?.id || "a0000001-0000-0000-0000-000000000001",
        email: student?.email || cleanEmail || "arun@student.dosclub.org",
        name: student?.full_name || "Arunachalam Sundaram",
        role: "STUDENT",
        dos_id: dosId,
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
