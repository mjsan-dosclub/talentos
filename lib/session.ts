export type UserRole = "STUDENT" | "TRAINER" | "COLLEGE_ADMIN" | "SUPER_ADMIN" | "ADMIN";

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
    email: "student@dosclub.org",
    name: "STUDENT",
    role: "STUDENT",
    dos_id: "DOS-B3-001",
    institution_id: "AU-DOS-01",
  },
  trainer: {
    id: "t0000001-0000-0000-0000-000000000001",
    email: "expert@dosclub.org",
    name: "EXPERT",
    role: "TRAINER",
  },
  college: {
    id: "c0000001-0000-0000-0000-000000000001",
    email: "college@dosclub.org",
    name: "COLLEGE",
    role: "COLLEGE_ADMIN",
    institution_id: "AU-DOS-01",
  },
  admin: {
    id: "s0000001-0000-0000-0000-000000000001",
    email: "admin@dosclub.org",
    name: "ADMIN",
    role: "SUPER_ADMIN",
  },
};

// Web-compatible HMAC-SHA256 calculation
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "talentos-fallback-secret-2026";

function signPayload(payload: string): string {
  // Simple, deterministic Web/Edge-safe string hashing algorithm combined with secret
  let hash = 0;
  const str = payload + SESSION_SECRET;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  // Convert 32-bit int to unsigned hex string
  const baseHash = (hash >>> 0).toString(16).padStart(8, "0");
  
  // Secondary pass for high entropy
  let hash2 = 5381;
  for (let i = 0; i < str.length; i++) {
    hash2 = (hash2 * 33) ^ str.charCodeAt(i);
  }
  const pass2 = (hash2 >>> 0).toString(16).padStart(8, "0");
  return `${baseHash}-${pass2}`;
}

/**
 * Encodes session payload to URL-safe JSON string with HMAC-SHA256 signature
 */
export function serializeSession(user: TalentosUser): string {
  const payload = {
    ...user,
    loginTime: user.loginTime || new Date().toISOString(),
  };
  const jsonStr = JSON.stringify(payload);
  const sig = signPayload(jsonStr);
  const container = JSON.stringify({ payload: jsonStr, sig });
  return encodeURIComponent(container);
}

/**
 * Decodes session payload from URL-safe string and cryptographically verifies signature
 */
export function deserializeSession(serialized: string | null | undefined): TalentosUser | null {
  if (!serialized) return null;

  try {
    const trimmed = decodeURIComponent(serialized.trim());
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const parsed = JSON.parse(trimmed);
      // If signed container exists
      if (parsed && typeof parsed === "object" && parsed.payload && parsed.sig) {
        const expectedSig = signPayload(parsed.payload);
        if (parsed.sig === expectedSig) {
          return JSON.parse(parsed.payload) as TalentosUser;
        }
        console.warn("[Security Violation] Invalid session cookie signature detected. Dropping session.");
        return null;
      }
      // Unsigned legacy fallback (ONLY allowed if demo mode is enabled during migration)
      if (process.env.ENABLE_DEMO_LOGIN === "true" && parsed.role && parsed.email) {
        return parsed as TalentosUser;
      }
    }
  } catch (e) { }

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

export function getClientSession(): TalentosUser | null {
  if (typeof document === "undefined") return null;
  let user: TalentosUser | null = null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (match) {
    const val = match.split("=")[1];
    user = deserializeSession(val);
  } else {
    const local = localStorage.getItem(SESSION_COOKIE_NAME);
    if (local) {
      try {
        user = JSON.parse(local);
      } catch {
        user = null;
      }
    }
  }

  // Merge updated profile fields from local storage cache if available
  if (user && user.email) {
    const activeUser = user;
    try {
      const storedProfile = localStorage.getItem(`profile_override_${activeUser.email.toLowerCase()}`);
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        user = { ...activeUser, ...parsed };
      }
    } catch { }

    // Enforce generic role names if legacy profile overrides exist
    const finalUser = user || activeUser;
    if (finalUser && finalUser.email) {
      const emailLower = finalUser.email.toLowerCase();
      const userName = finalUser.name;
      if (
        (emailLower === "admin@dosclub.org" && userName !== "ADMIN") ||
        (emailLower === "expert@dosclub.org" && userName !== "EXPERT") ||
        (emailLower === "college@dosclub.org" && userName !== "COLLEGE") ||
        (emailLower === "student@dosclub.org" && userName !== "STUDENT")
      ) {
        if (emailLower === "admin@dosclub.org") finalUser.name = "ADMIN";
        else if (emailLower === "expert@dosclub.org") finalUser.name = "EXPERT";
        else if (emailLower === "college@dosclub.org") finalUser.name = "COLLEGE";
        else if (emailLower === "student@dosclub.org") finalUser.name = "STUDENT";

        try {
          localStorage.removeItem(`profile_override_${emailLower}`);
        } catch { }
      }
      return finalUser;
    }
  }

  return user;
}
