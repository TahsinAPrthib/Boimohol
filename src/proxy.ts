import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Someone who has just signed up with Google has an account but no username
// yet. Until they choose one, every page sends them to /welcome to do it,
// carrying where they were headed. This only steers the browser; the
// enforcement is server-side (getSessionUserId treats such an account as
// signed out), so a stale token here can't let anyone do anything.

// Pages a pending account may still open: the step itself, signing in as
// someone else, and the site's policies.
const OPEN = ["/welcome", "/login", "/register", "/privacy", "/terms", "/guidelines"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (OPEN.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return NextResponse.next();

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.needsUsername) return NextResponse.next();

  const welcome = new URL("/welcome", request.url);
  if (pathname !== "/") welcome.searchParams.set("callbackUrl", `${pathname}${search}`);
  return NextResponse.redirect(welcome);
}

export const config = {
  // Pages only: not NextAuth's own routes, Next's assets, public files, or
  // the cover images fetched through the site (next.config.js rewrites).
  matcher: ["/((?!api/|_next/|cover-image/|icons/|cursors/|manifest.json|favicon.ico|robots.txt|sitemap.xml).*)"],
};
