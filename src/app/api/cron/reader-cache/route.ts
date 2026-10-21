import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { pruneReaderCache } from "@/lib/wikisource/cache";

export const dynamic = "force-dynamic";

// The reader cache's daily cleanup (src/lib/wikisource/cache.ts), called by
// Vercel cron (vercel.json). Vercel sends the project's CRON_SECRET as a
// bearer token; without that variable set, the route refuses every call.
// (The cleanup also runs after writes, so a missed day changes little.)
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[reader-cache] CRON_SECRET is not set; the daily cleanup can't run");
    return NextResponse.json({ ok: false, error: "not configured" }, { status: 503 });
  }
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const report = await pruneReaderCache();
  console.log(`[reader-cache] cleanup: ${JSON.stringify(report)}`);
  return NextResponse.json({ ok: true, ...report });
}
