import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, AdminPermission, UserRole } from "@/lib/session";
import { deserializeSignedSession } from "@/lib/session-server";

export async function requireRoles(roles: UserRole[]) {
  const value = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = await deserializeSignedSession(value);
  if (!session || !roles.includes(session.role)) {
    return NextResponse.json({ error: "Authenticated role required." }, { status: 403 });
  }
  return null;
}

export function requireSuperAdmin() {
  return requireRoles(["SUPER_ADMIN"]);
}

export async function requireAdminPermission(permission: AdminPermission) {
  const value = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = await deserializeSignedSession(value);
  const allowed = session?.role === "SUPER_ADMIN" || (
    session?.role === "CUSTOM_ADMIN" && session.permissions?.includes(permission)
  );
  if (!allowed) return NextResponse.json({ error: "Administrator permission required." }, { status: 403 });
  return null;
}
