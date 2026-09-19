import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deserializeSignedSession } from "@/lib/session-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { hashPassword, verifyPassword } from "@/lib/password-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Get current session from cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("talentos_session");
    let activeUser = null;

    if (sessionCookie?.value) {
      try {
        activeUser = await deserializeSignedSession(sessionCookie.value);
      } catch {
        // malformed
      }
    }

    if (!activeUser) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to change your password." },
        { status: 401 }
      );
    }

    if (activeUser.role !== "STUDENT") {
      return NextResponse.json({ success: true, message: "Password update acknowledged." });
    }

    const { data: student } = await supabaseAdmin
      .from("students")
      .select("id,dos_id,password_hash")
      .eq("id", activeUser.id)
      .maybeSingle();
    const currentValid = student?.password_hash
      ? verifyPassword(currentPassword || "", student.password_hash)
      : String(currentPassword || "").toLowerCase() === String(student?.dos_id || "").toLowerCase();
    if (!currentValid) {
      return NextResponse.json(
        { error: "Incorrect current password. Please check your credentials." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("students").update({ password_hash: hashPassword(newPassword), must_reset_password: false }).eq("id", activeUser.id);
    if (error) return NextResponse.json({ error: "Password could not be saved." }, { status: 500 });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. Your account is secured.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update password." },
      { status: 500 }
    );
  }
}
