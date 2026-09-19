import type { TalentosUser } from "./session";

const DEV_SESSION_SECRET = "talentos-qa-local-session-secret";

function sessionSecret(): string {
  const configured = process.env.SESSION_SECRET?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be configured in production.");
  }
  return DEV_SESSION_SECRET;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signingKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signature(payload: string): Promise<string> {
  const result = await crypto.subtle.sign("HMAC", await signingKey(), new TextEncoder().encode(payload));
  return toBase64Url(new Uint8Array(result));
}

export async function serializeSignedSession(user: TalentosUser): Promise<string> {
  const json = JSON.stringify({ ...user, loginTime: user.loginTime || new Date().toISOString() });
  const payload = toBase64Url(new TextEncoder().encode(json));
  return payload + "." + await signature(payload);
}

export async function deserializeSignedSession(value: string | null | undefined): Promise<TalentosUser | null> {
  if (!value) return null;
  const [payload, providedSignature] = value.split(".");
  if (!payload || !providedSignature) return null;

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await signingKey(),
      fromBase64Url(providedSignature) as BufferSource,
      new TextEncoder().encode(payload)
    );
    if (!valid) return null;
    const user = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as TalentosUser;
    return user?.id && user?.email && user?.role ? user : null;
  } catch {
    return null;
  }
}
