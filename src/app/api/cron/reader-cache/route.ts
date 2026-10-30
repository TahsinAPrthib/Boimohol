import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { pruneReaderCache } from "@/lib/wikisource/cache";
import { pruneTexts, textsConfigured, type TextsReport } from "@/lib/gutenberg/store";

export const dynamic = "force-dynamic";

// The reader caches' daily cleanup (src/lib/wikisource/cache.ts and
// src/lib/gutenberg/store.ts), called by
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
  // The Gutenberg books stored on demand, in the texts database (store.ts),
  // when there is one.
  let gutenberg: TextsReport | null = null;
  if (textsConfigured()) {
    try {
      gutenberg = await pruneTexts();
      console.log(`[gutenberg] cleanup: ${JSON.stringify(gutenberg)}`);
    } catch (err) {
      console.error(`[gutenberg] cleanup failed: ${err instanceof Error ? err.message : err}`);
    }
  }
  return NextResponse.json({ ok: true, ...report, gutenberg });
}
