// The home page's book of the day: one book a day, the same for everyone,
// changing at midnight in Bangladesh (Asia/Dhaka, UTC+6 all year), not UTC.
// Pure and dependency-free; src/lib/todays-book.ts feeds it the books.

// The calendar date in Dhaka, as YYYY-MM-DD. It is also the cache key, so
// the day's choice is worked out once and changes exactly at midnight there.
export function dhakaDateKey(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

// Whole days from 1970-01-01 to that date.
export function dayNumber(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

const MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

// "২৮ অক্টোবর", for the label over the day's book.
export function bnDayMonth(dateKey: string): string {
  const [, m, d] = dateKey.split("-").map(Number);
  return `${String(d).replace(/\d/g, (c) => BN_DIGITS[Number(c)])} ${MONTHS[m - 1]}`;
}

// FNV-1a: a stable, well-spread number for each id.
function hash(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

// The order the books take their turns in: shuffled by a hash of the id, not
// alphabetical, so neighbouring days don't bring neighbouring titles; and the
// same on every server, whatever order the database returned them in. Every
// book comes round once before any comes round again.
export function rotation(ids: readonly string[]): string[] {
  return [...new Set(ids)].sort((a, b) => hash(a) - hash(b) || (a < b ? -1 : a > b ? 1 : 0));
}

// `count` books from a rotation, starting at `start` and wrapping round; never
// more than the rotation holds.
export function takeFrom(order: readonly string[], start: number, count: number): string[] {
  const n = order.length;
  if (n === 0) return [];
  const first = ((start % n) + n) % n;
  return Array.from({ length: Math.min(count, n) }, (_, i) => order[(first + i) % n]);
}
