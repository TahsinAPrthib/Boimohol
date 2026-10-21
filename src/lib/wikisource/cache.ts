import "server-only";
import { after } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// The reader's cache (ReaderCache) lives in the site's own Postgres, which
// has a storage limit; if the database filled up, every write on the site
// would fail. So the cache is bounded:
// - a row not read for UNREAD_DAYS is deleted;
// - the total size is capped at READER_CACHE_MAX_MB (default 50 MB of JSON
//   text, which Postgres stores compressed, so less on disk); above it the
//   least recently read rows go first;
// - a single page above MAX_ROW_BYTES is shown but never stored;
// - the cleanup runs after a write now and then (always after a large one)
//   and once a day from Vercel cron (/api/cron/reader-cache), so the cap
//   can only be passed by the few writes between two cleanups.
// A copy older than a week stays usable as the fallback while Wikisource is
// down, for as long as someone reads it at least once in UNREAD_DAYS (and
// it isn't among the least recently read when the cap bites).

const UNREAD_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_ROW_BYTES = 3 * 1024 * 1024;
const PRUNE_EVERY = 10; // on about one write in this many
const LARGE_WRITE = 256 * 1024;

export function maxCacheBytes(): number {
  const mb = Number(process.env.READER_CACHE_MAX_MB);
  return (Number.isFinite(mb) && mb > 0 ? mb : 50) * 1024 * 1024;
}

export type CacheRow = { key: string; data: unknown; fetchedAt: Date };

// Marks rows as read today, at most once a day per row, after the response
// has gone out.
function touch(rows: { key: string; readAt: Date }[]) {
  const due = rows.filter((r) => Date.now() - r.readAt.getTime() > DAY_MS).map((r) => r.key);
  if (due.length === 0) return;
  after(async () => {
    try {
      await prisma.readerCache.updateMany({ where: { key: { in: due } }, data: { readAt: new Date() } });
    } catch (err) {
      console.error(`[reader-cache] marking as read failed: ${err instanceof Error ? err.message : err}`);
    }
  });
}

export async function readCache(key: string): Promise<CacheRow | null> {
  const row = await prisma.readerCache.findUnique({ where: { key }, select: { key: true, data: true, fetchedAt: true, readAt: true } });
  if (row) touch([row]);
  return row;
}

export async function readCacheMany(keys: string[]): Promise<CacheRow[]> {
  if (keys.length === 0) return [];
  const rows = await prisma.readerCache.findMany({ where: { key: { in: keys } }, select: { key: true, data: true, fetchedAt: true, readAt: true } });
  touch(rows);
  return rows;
}

export async function writeCache(key: string, value: unknown): Promise<void> {
  const bytes = Buffer.byteLength(JSON.stringify(value), "utf8");
  if (bytes > MAX_ROW_BYTES) {
    console.error(`[reader-cache] not storing ${key}: ${bytes} bytes is over the per-page limit`);
    return;
  }
  const data = value as Prisma.InputJsonValue;
  const now = new Date();
  await prisma.readerCache.upsert({
    where: { key },
    create: { key, data, bytes, fetchedAt: now, readAt: now },
    update: { data, bytes, fetchedAt: now, readAt: now },
  });
  if (bytes >= LARGE_WRITE || Math.random() < 1 / PRUNE_EVERY) {
    after(async () => {
      try {
        await pruneReaderCache();
      } catch (err) {
        console.error(`[reader-cache] cleanup failed: ${err instanceof Error ? err.message : err}`);
      }
    });
  }
}

export type CacheReport = { removedUnread: number; removedOverCap: number; rows: number; bytes: number; capBytes: number };

export async function cacheTotals(): Promise<{ rows: number; bytes: number }> {
  const [t] = await prisma.$queryRaw<{ rows: number; bytes: bigint }[]>`
    SELECT COUNT(*)::int AS rows, COALESCE(SUM("bytes"), 0)::bigint AS bytes FROM "ReaderCache"`;
  return { rows: t?.rows ?? 0, bytes: Number(t?.bytes ?? 0) };
}

// Drops rows nobody has read for UNREAD_DAYS, then, while the total is over
// the cap, the least recently read: the rows kept are the most recently read
// ones whose sizes add up to no more than the cap.
export async function pruneReaderCache(): Promise<CacheReport> {
  const capBytes = maxCacheBytes();
  const unread = await prisma.readerCache.deleteMany({ where: { readAt: { lt: new Date(Date.now() - UNREAD_DAYS * DAY_MS) } } });
  const overCap = await prisma.$executeRaw`
    DELETE FROM "ReaderCache" WHERE "key" IN (
      SELECT "key" FROM (
        SELECT "key", SUM("bytes") OVER (ORDER BY "readAt" DESC, "key") AS kept FROM "ReaderCache"
      ) ranked
      WHERE kept > ${capBytes}
    )`;
  const totals = await cacheTotals();
  return { removedUnread: unread.count, removedOverCap: overCap, ...totals, capBytes };
}
