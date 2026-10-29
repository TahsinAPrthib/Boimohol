// The book page's epigraph: a book's opening line, shown only for the books
// listed here. This is a reviewed list, not something worked out from the
// text: each line was compared word for word with the Wikisource page it
// opens (the page's own text from the Wikisource API, not the site's cleaned
// copy of it), and each book passes the public-domain rule. A book that isn't
// listed simply has no epigraph.
//
// To add a line: copy it from the Wikisource page named in `page`, check it
// there again, and fill in `checked`. Keep the punctuation as printed; the
// page adds quotation marks only to a line that doesn't open with its own.

export type FirstLine = {
  bookId: string;
  line: string;
  // The chapter it opens, as the reader's contents name it; null when the
  // chapter has only a number.
  chapter: string | null;
  // The Wikisource page it was checked against, and when.
  page: string;
  checked: string;
};

export const FIRST_LINES: readonly FirstLine[] = [
  {
    bookId: "uponnash-shesher-kobita",
    line: "অমিত রায় ব্যারিস্টার।",
    chapter: "অমিত-চরিত",
    page: "শেষের কবিতা (রবীন্দ্রনাথ ঠাকুর, ১৯২৯)/অমিত-চরিত",
    checked: "2026-10-28",
  },
  {
    bookId: "uponnash-anandamath",
    line: "অতি বিস্তৃত অরণ্য।",
    chapter: "উপক্রমণিকা",
    page: "আনন্দমঠ (১৯৩৮)/উপক্রমণিকা",
    checked: "2026-10-28",
  },
  {
    bookId: "uponnash-padma-nadir-majhi",
    line: "বর্ষার মাঝামাঝি। পদ্মায় ইলিশ মাছ ধরার মরশুম চলিয়াছে।",
    chapter: null,
    page: "পদ্মানদীর মাঝি/১",
    checked: "2026-10-28",
  },
  {
    bookId: "uponnash-devdas",
    line: "একদিন বৈশাখের দ্বিপ্রহরে রৌদ্রেরও অন্ত ছিল না উত্তাপেরও সীমা ছিল না।",
    chapter: "প্রথম পরিচ্ছেদ",
    page: "দেবদাস (শরৎচন্দ্র চট্টোপাধ্যায়)/প্রথম পরিচ্ছেদ",
    checked: "2026-10-28",
  },
  {
    bookId: "uponnash-gora",
    line: "শ্রাবণ মাসের সকালবেলায় মেঘ কাটিয়া গিয়া নির্মল রৌদ্রে কলিকাতার আকাশ ভরিয়া গিয়াছে।",
    chapter: null,
    page: "গোরা (রবীন্দ্রনাথ ঠাকুর)/১",
    checked: "2026-10-28",
  },
  {
    bookId: "uponnash-devi-chaudhurani",
    line: "“ও পি—ও পিপি—ও প্রফুল্ল—ও পোড়ারমুখী।”",
    chapter: "প্রথম খণ্ড, প্রথম পরিচ্ছেদ",
    page: "দেবী চৌধুরাণী (বঙ্কিমচন্দ্র চট্টোপাধ্যায়, ১৯৩৯)/প্রথম খণ্ড/প্রথম পরিচ্ছেদ",
    checked: "2026-10-28",
  },
];

export function firstLineOf(bookId: string): FirstLine | null {
  return FIRST_LINES.find((l) => l.bookId === bookId) ?? null;
}

// The line as the epigraph shows it: in quotation marks, unless it opens with
// its own (dialogue).
export function quotedLine(line: string): string {
  return /^[“"‘]/.test(line) ? line : `“${line}”`;
}
