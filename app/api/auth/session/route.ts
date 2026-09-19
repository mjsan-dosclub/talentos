import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { deserializeSignedSession } from "@/lib/session-server";

export async function GET() {
  const value = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = await deserializeSignedSession(value);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user: session });
}
