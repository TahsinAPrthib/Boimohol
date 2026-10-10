// Bangladeshi copyright: a work is protected until 60 years after the end of
// the year its author died. So in year Y, only an author who died in Y - 61 or
// earlier is out of copyright (in 2026: died 1965 or earlier).
//
// This is the one place the rule lives. It is enforced on the server -- book
// create/edit/import and PDF upload -- and the public pages only offer a PDF
// for a book that passes it.

// UTC rather than Dhaka time on purpose: for the first six hours of 1 January
// in Bangladesh the UTC year is still the old one, so the rule errs strict.
export function publicDomainCutoffYear(now: Date = new Date()): number {
  return now.getUTCFullYear() - 61;
}

export function canBePublicDomain(authorDeathYear: number | null | undefined, now: Date = new Date()): boolean {
  return typeof authorDeathYear === "number" && authorDeathYear <= publicDomainCutoffYear(now);
}

// A book whose flag says public domain but whose death year doesn't back it up
// (missing, or too recent) -- shown as a warning on /admin/books.
export function breaksPublicDomainRule(
  book: { isPublicDomain: boolean; authorDeathYear: number | null },
  now: Date = new Date()
): boolean {
  return book.isPublicDomain && !canBePublicDomain(book.authorDeathYear, now);
}
