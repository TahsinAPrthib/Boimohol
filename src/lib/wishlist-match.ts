// Marketplace listings are freeform text typed by sellers, so exact title
// matching would miss almost every real case — "Pather Panchali" vs
// "পথের পাঁচালী (হার্ডকভার)" vs "pather panchali - bibhutibhushan".
// Titles are therefore compared case-insensitively as substrings in BOTH
// directions, against the English and Bangla title alike.
//
// A TITLE match is required. Author is only a secondary signal: matching on
// author alone would surface every book that author ever wrote, which is
// noise rather than a match. When the author agrees too, the match is
// stronger and gets ranked first.
//
// Pure and dependency-free so it can be tested directly — see
// wishlist-match.test.ts.

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function overlaps(a: string, b: string): boolean {
  const x = normalize(a);
  const y = normalize(b);
  if (!x || !y) return false;
  return x.includes(y) || y.includes(x);
}

export type MatchStrength = "none" | "title" | "title-and-author";

export type MatchResult = {
  matched: boolean;
  titleMatch: boolean;
  authorMatch: boolean;
  strength: MatchStrength;
};

type ListingLike = { title: string; author: string };
type BookLike = { title: string; titleBangla?: string | null; author: string };

export function evaluateMatch(listing: ListingLike, book: BookLike): MatchResult {
  const titles = [book.title, book.titleBangla].filter(
    (t): t is string => typeof t === "string" && t.trim().length > 0
  );

  const titleMatch = titles.some((t) => overlaps(listing.title, t));
  const authorMatch = overlaps(listing.author, book.author);

  // Title is the gate; author only refines an already-matching result.
  const matched = titleMatch;

  return {
    matched,
    titleMatch,
    authorMatch,
    strength: !matched ? "none" : authorMatch ? "title-and-author" : "title",
  };
}

export function listingMatchesBook(listing: ListingLike, book: BookLike): boolean {
  return evaluateMatch(listing, book).matched;
}
