import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, deserializeSession } from "./lib/session";

// Paths that are strictly public
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/robots.txt",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow Next.js internals, static assets, images, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/ledger") || // Public certificate verification ledger
    pathname.startsWith("/casestudies") || // Public student case studies & articles
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|webmanifest|js)$/) ||
    PUBLIC_PATHS.includes(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Read session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = deserializeSession(sessionCookie);

  // 3. If unauthenticated or tampered, redirect to login and clear invalid cookie
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // 4. Role-based Route Protection (RBAC)
  const role = session.role;

  // Super Admin can access all routes
  if (role === "SUPER_ADMIN") {
    return NextResponse.next();
  }

  // /admin requires SUPER_ADMIN
  if (pathname.startsWith("/admin")) {
    const deniedUrl = new URL("/login", request.url);
    deniedUrl.searchParams.set("error", "ERR_ACCESS_DENIED_ADMIN_ONLY");
    return NextResponse.redirect(deniedUrl);
  }

  // /trainer requires TRAINER or SUPER_ADMIN
  if (pathname.startsWith("/trainer")) {
    if (role !== "TRAINER") {
      const deniedUrl = new URL("/login", request.url);
      deniedUrl.searchParams.set("error", "ERR_ACCESS_DENIED_TRAINER_ONLY");
      return NextResponse.redirect(deniedUrl);
    }
  }

  // /college requires COLLEGE_ADMIN or SUPER_ADMIN
  if (pathname.startsWith("/college")) {
    if (role !== "COLLEGE_ADMIN") {
      const deniedUrl = new URL("/login", request.url);
      deniedUrl.searchParams.set("error", "ERR_ACCESS_DENIED_COLLEGE_ONLY");
      return NextResponse.redirect(deniedUrl);
    }
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
