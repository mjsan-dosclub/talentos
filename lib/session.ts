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
 * Encodes session payload to URL-safe JSON string
 */
export function serializeSession(user: TalentosUser): string {
  const payload = {
    ...user,
    loginTime: user.loginTime || new Date().toISOString(),
  };
  return encodeURIComponent(JSON.stringify(payload));
}

/**
 * Decodes session payload from URL-safe string, with base64 and JSON fallbacks
 */
export function deserializeSession(serialized: string | null | undefined): TalentosUser | null {
  if (!serialized) return null;

  // 1. Try URL-encoded JSON
  try {
    const trimmed = decodeURIComponent(serialized.trim());
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return JSON.parse(trimmed) as TalentosUser;
    }
  } catch (e) {}

  // 2. Try raw JSON
  try {
    if (serialized.startsWith("{") && serialized.endsWith("}")) {
      return JSON.parse(serialized) as TalentosUser;
    }
  } catch (e) {}

  // 3. Fallback: Base64 decode
  try {
    let b64Str = serialized.trim();
    if (b64Str.includes("%")) {
      b64Str = decodeURIComponent(b64Str);
    }
    let decoded = "";
    if (typeof atob === "function") {
      decoded = atob(b64Str);
    } else if (typeof Buffer !== "undefined") {
      decoded = Buffer.from(b64Str, "base64").toString("utf-8");
    }
    if (decoded.startsWith("{") && decoded.endsWith("}")) {
      return JSON.parse(decoded) as TalentosUser;
    }
  } catch (e) {}

  return null;
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
