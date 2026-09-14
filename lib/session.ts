export type UserRole = "STUDENT" | "TRAINER" | "COLLEGE_ADMIN" | "SUPER_ADMIN";

export interface TalentosUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  dos_id?: string;
  institution_id?: string;
  loginTime?: string;
}

export const SESSION_COOKIE_NAME = "talentos_session";

export const DEMO_ACCOUNTS: Record<string, TalentosUser> = {
  student: {
    id: "a0000001-0000-0000-0000-000000000001",
    email: "arun.systems@annauniv.edu",
    name: "Arunachalam S.",
    role: "STUDENT",
    dos_id: "DOS-B3-001",
    institution_id: "AU-DOS-01",
  },
  trainer: {
    id: "t0000001-0000-0000-0000-000000000001",
    email: "priya.lead@descience.org",
    name: "Priya Sundaram",
    role: "TRAINER",
  },
  college: {
    id: "c0000001-0000-0000-0000-000000000001",
    email: "dean.engg@annauniv.edu",
    name: "Dr. K. Ramanathan",
    role: "COLLEGE_ADMIN",
    institution_id: "AU-DOS-01",
  },
  admin: {
    id: "s0000001-0000-0000-0000-000000000001",
    email: "admin@dosclub.org",
    name: "Karthikeyan P.",
    role: "SUPER_ADMIN",
  },
};

/**
 * Encodes session payload to base64 JSON string
 */
export function serializeSession(user: TalentosUser): string {
  const payload = {
    ...user,
    loginTime: user.loginTime || new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/**
 * Decodes session payload from base64 JSON string
 */
export function deserializeSession(serialized: string | null | undefined): TalentosUser | null {
  if (!serialized) return null;
  try {
    let jsonStr: string;
    if (typeof window !== "undefined") {
      jsonStr = decodeURIComponent(escape(atob(serialized)));
    } else {
      jsonStr = Buffer.from(serialized, "base64").toString("utf-8");
    }
    return JSON.parse(jsonStr) as TalentosUser;
  } catch (err) {
    return null;
  }
}

/**
 * Sets session cookie on client browser
 */
export function setClientSession(user: TalentosUser) {
  if (typeof document === "undefined") return;
  const val = serializeSession(user);
  // 7 days cookie
  document.cookie = `${SESSION_COOKIE_NAME}=${val}; path=/; max-age=604800; SameSite=Lax`;
  localStorage.setItem(SESSION_COOKIE_NAME, JSON.stringify(user));
}

/**
 * Clears session cookie on client browser
 */
export function clearClientSession() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  localStorage.removeItem(SESSION_COOKIE_NAME);
}

/**
 * Gets current session on client browser
 */
export function getClientSession(): TalentosUser | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (match) {
    const val = match.split("=")[1];
    return deserializeSession(val);
  }
  const local = localStorage.getItem(SESSION_COOKIE_NAME);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return null;
    }
  }
  return null;
}
