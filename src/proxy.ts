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

// Vercel Web Analytics' script and intake, under a path Vercel picks for each
// build: not pages.
const ANALYTICS = process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH;

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (ANALYTICS && pathname.startsWith(`${ANALYTICS}/`)) return NextResponse.next();
  if (OPEN.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return NextResponse.next();

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.needsUsername) return NextResponse.next();

  const welcome = new URL("/welcome", request.url);
  if (pathname !== "/") welcome.searchParams.set("callbackUrl", `${pathname}${search}`);
  return NextResponse.redirect(welcome);
}

export const config = {
  // Pages only: not NextAuth's own routes, Next's assets, public files, the
  // cover images fetched through the site (next.config.js rewrites), or the
  // link-preview images (/share), or Vercel's own routes (/_vercel).
  matcher: ["/((?!api/|_next/|_vercel/|cover-image/|share/|icons/|cursors/|manifest.json|favicon.ico|robots.txt|sitemap.xml).*)"],
};
