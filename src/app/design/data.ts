import "server-only";
import { prisma } from "@/lib/prisma";

// Design exploration only (not linked from the site): real books from the
// catalog for the three directions.

export type Direction = "shelf" | "line" | "card";
export const DIRECTIONS: Direction[] = ["shelf", "line", "card"];

export const bookSelect = {
  id: true,
  title: true,
  titleBangla: true,
  author: true,
  translator: true,
  description: true,
  language: true,
  authorDeathYear: true,
  coverPublicId: true,
  coverRightsBasis: true,
  category: { select: { slug: true, colorKey: true, nameBangla: true } },
  sources: { select: { kind: true, url: true, rightsBasis: true } },
} as const;

export async function loadBooks(ids: string[]) {
  const rows = await prisma.book.findMany({ where: { id: { in: ids } }, select: bookSelect });
  const byId = new Map(rows.map((b) => [b.id, b]));
  return ids.map((id) => byId.get(id)).filter((b) => b !== undefined);
}
export type ShownBook = Awaited<ReturnType<typeof loadBooks>>[number];

// The shelf: real first-edition title pages (Wikimedia scans) between
// covers from the generated series.
export const SHELF = [
  "uponnash-indira",
  "uponnash-shesher-kobita",
  "kobita-chaturddashpadi-kabitabali",
  "uponnash-devdas",
  "kobita-chharar-chhabi",
  "uponnash-padma-nadir-majhi",
  "natok-nil-darpan-natok",
  "shishu-sahitto-tuntuni-r-boi",
  "kobita-chhara",
  "kobita-rupashi-bangla",
  "chhotogolpo-dudh-bhat",
  "uponnash-majhir-chhele",
  "probondho-realm-of-the-absurd",
  "uponnash-pather-dabi",
];

// Today's book for each direction (in the build: one a day).
export const TODAY: Record<Direction, string> = {
  shelf: "kobita-birangana-kabya",
  line: "uponnash-shesher-kobita",
  card: "uponnash-anandamath",
};

// Opening lines, exactly as Wikisource gives them (read through the site's
// reader, 2026-10-28). Only books that pass the public-domain rule.
export const FIRST_LINES: { bookId: string; line: string; chapter: string }[] = [
  { bookId: "uponnash-shesher-kobita", line: "অমিত রায় ব্যারিস্টার।", chapter: "অমিত-চরিত" },
  { bookId: "uponnash-anandamath", line: "অতি বিস্তৃত অরণ্য।", chapter: "উপক্রমণিকা" },
  { bookId: "uponnash-padma-nadir-majhi", line: "বর্ষার মাঝামাঝি। পদ্মায় ইলিশ মাছ ধরার মরশুম চলিয়াছে।", chapter: "১" },
  { bookId: "uponnash-devdas", line: "একদিন বৈশাখের দ্বিপ্রহরে রৌদ্রেরও অন্ত ছিল না উত্তাপেরও সীমা ছিল না।", chapter: "প্রথম পরিচ্ছেদ" },
  { bookId: "uponnash-gora", line: "শ্রাবণ মাসের সকালবেলায় মেঘ কাটিয়া গিয়া নির্মল রৌদ্রে কলিকাতার আকাশ ভরিয়া গিয়াছে।", chapter: "১" },
  { bookId: "uponnash-devi-chaudhurani", line: "“ও পি—ও পিপি—ও প্রফুল্ল—ও পোড়ারমুখী।”", chapter: "প্রথম খণ্ড, প্রথম পরিচ্ছেদ" },
];
export const firstLineOf = (bookId: string) => FIRST_LINES.find((l) => l.bookId === bookId) ?? null;

// The years a book's author died, in Bangla, for the card.
export const bnDigits = (n: number) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
