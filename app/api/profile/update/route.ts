import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { deserializeSignedSession, serializeSignedSession } from "@/lib/session-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, avatar_url, bio, headline, github_handle } = body;

    // Strict Tamper Check: Reject any attempt to modify sensitive fields
    const SENSITIVE_FIELDS = [
      "email",
      "phone",
      "mobile",
      "dos_id",
      "institution_id",
      "batch_id",
      "group_id",
      "certifications",
      "skills",
      "attendance",
      "assessments",
      "recognitions",
    ];

    const attemptedTampering = SENSITIVE_FIELDS.filter((f) => body[f] !== undefined);
    if (attemptedTampering.length > 0) {
      return NextResponse.json(
        {
          error: `Security Policy Violation: Modification of sensitive fields (${attemptedTampering.join(
            ", "
          )}) is prohibited to prevent dossier tampering. Please contact your college coordinator or system administrator.`,
        },
        { status: 403 }
      );
    }

    if (!full_name || !full_name.trim()) {
      return NextResponse.json(
        { error: "Display name cannot be empty." },
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
        { error: "Authentication required to update profile." },
        { status: 401 }
      );
    }

    // Prepare updated user session
    const updatedUser = {
      ...activeUser,
      name: full_name.trim(),
      avatar_url: avatar_url || activeUser.avatar_url,
      bio: bio?.trim() || activeUser.bio || "",
      headline: headline?.trim() || activeUser.headline || "",
      github_handle: github_handle?.trim() || activeUser.github_handle || "",
    };
    if (activeUser.role === "STUDENT" && avatar_url) updatedUser.requiresOnboarding = false;

    // Save profile to persistent disk store data/profiles.json
    try {
      const fs = await import("fs");
      const path = await import("path");
      const dataDir = path.join(process.cwd(), "data");
      const profilesFile = path.join(dataDir, "profiles.json");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      let profilesMap: Record<string, any> = {};
      if (fs.existsSync(profilesFile)) {
        try {
          profilesMap = JSON.parse(fs.readFileSync(profilesFile, "utf-8"));
        } catch {}
      }
      profilesMap[activeUser.email.toLowerCase()] = updatedUser;
      fs.writeFileSync(profilesFile, JSON.stringify(profilesMap, null, 2), "utf-8");
    } catch (fsErr) {
      console.error("Failed saving profile to data/profiles.json:", fsErr);
    }

    // If Supabase is connected and student has an ID, attempt live DB update
    if (activeUser.id && activeUser.role === "STUDENT") {
      const { error: dbError } = await supabaseAdmin
        .from("students")
        .update({
          full_name: full_name.trim(),
          avatar_url: avatar_url || null,
          must_reset_password: false,
        })
        .eq("id", activeUser.id);
      if (dbError) {
        console.error("Live DB profile update failed:", dbError);
        return NextResponse.json({ error: "Profile could not be saved to the student record." }, { status: 500 });
      }
    }

    // Refresh the session cookie with updated non-sensitive fields
    const response = NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Personal information updated successfully.",
    });

    response.cookies.set("talentos_session", await serializeSignedSession(updatedUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}
