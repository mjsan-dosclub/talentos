import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, type TalentosUser } from "@/lib/session";
import { deserializeSignedSession } from "@/lib/session-server";

export async function getAttendanceSession(): Promise<TalentosUser | null> {
  const value = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return deserializeSignedSession(value);
}

export function canManageAttendance(session: TalentosUser) {
  return session.role === "SUPER_ADMIN" || session.role === "TRAINER";
}
