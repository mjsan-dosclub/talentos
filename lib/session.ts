export type UserRole = "STUDENT" | "TRAINER" | "COLLEGE_ADMIN" | "SUPER_ADMIN";

export interface TalentosUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  dos_id?: string;
  institution_id?: string;
  avatar_url?: string;
  bio?: string;
  headline?: string;
  github_handle?: string;
  loginTime?: string;
}

export const SESSION_COOKIE_NAME = "talentos_session";

export const DEMO_ACCOUNTS: Record<string, TalentosUser> = {
  student: {
    id: "a0000001-0000-0000-0000-000000000001",
    email: "arun@student.dosclub.org",
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
 * Encodes session payload to JSON string
 */
export function serializeSession(user: TalentosUser): string {
  const payload = {
    ...user,
    loginTime: user.loginTime || new Date().toISOString(),
  };
  return JSON.stringify(payload);
}

/**
 * Decodes session payload from raw JSON, single/double URL-encoded string, or base64
 */
export function deserializeSession(serialized: string | null | undefined): TalentosUser | null {
  if (!serialized) return null;

  let str = serialized.trim();
  // Strip surrounding quotes if present (cookies often have quotes)
  if (str.startsWith('"') && str.endsWith('"')) {
    str = str.slice(1, -1).trim();
  }

  // Handle unencoded, single-encoded (%7B), and double-encoded (%257B) JSON
  for (let i = 0; i < 3; i++) {
    if (str.startsWith("{") && str.endsWith("}")) {
      try {
        const parsed = JSON.parse(str);
        if (parsed && typeof parsed === "object" && parsed.role) {
          return parsed as TalentosUser;
        }
      } catch (e) {}
    }
    if (str.includes("%")) {
      try {
        str = decodeURIComponent(str).trim();
      } catch (e) {
        break;
      }
    } else {
      break;
    }
  }

  // Fallback: Base64 decode
  try {
    let b64Str = str;
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
      const parsed = JSON.parse(decoded);
      if (parsed && typeof parsed === "object" && parsed.role) {
        return parsed as TalentosUser;
      }
    }
  } catch (e) {}

  return null;
}

/**
 * Sets session cookie on client browser
 */
export function setClientSession(user: TalentosUser) {
  if (typeof document === "undefined") return;
  const val = encodeURIComponent(JSON.stringify(user));
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
    const val = match.split("=").slice(1).join("=");
    const res = deserializeSession(val);
    if (res) return res;
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
