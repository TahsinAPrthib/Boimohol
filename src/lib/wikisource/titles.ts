// Page titles on bn.wikisource.org and the reader's URLs for them.
//
// A work is a main page ("গোরা") and its subpages ("গোরা/১",
// "মা (ম্যাক্সিম গোর্কি, বিমল সেন)/প্রথম খণ্ড/এক"). The reader addresses a
// subpage by its path below the main page: /books/<id>/read/প্রথম_খণ্ড/এক.

export const WIKISOURCE_HOST = "bn.wikisource.org";
export const WIKISOURCE_ORIGIN = `https://${WIKISOURCE_HOST}`;

// MediaWiki treats "_" and " " as the same character in titles.
export function normalizeTitle(title: string): string {
  return title.replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

// Characters MediaWiki never allows in a title, and a byte limit of 255.
const ILLEGAL = /[#<>[\]|{}\u0000-\u001f\u007f]/;
export function isValidTitle(title: string): boolean {
  return title.length > 0 && !ILLEGAL.test(title) && new TextEncoder().encode(title).length <= 255;
}

// "/wiki/<percent-encoded title>" -> the title, or null when it isn't one.
export function titleFromWikiPath(path: string): string | null {
  try {
    const title = normalizeTitle(decodeURIComponent(path));
    return isValidTitle(title) ? title : null;
  } catch {
    return null;
  }
}

const encodeSegment = (s: string) => encodeURIComponent(s.replace(/ /g, "_"));

export function wikisourceUrl(title: string, fragment?: string): string {
  const path = normalizeTitle(title).split("/").map(encodeSegment).join("/");
  return `${WIKISOURCE_ORIGIN}/wiki/${path}${fragment ? `#${encodeURIComponent(fragment)}` : ""}`;
}

// The main page a book's Wikisource link points at, if it is a page on
// bn.wikisource.org (the only Wikisource the reader reads).
export function workRootFromUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== WIKISOURCE_HOST || !parsed.pathname.startsWith("/wiki/")) return null;
  return titleFromWikiPath(parsed.pathname.slice("/wiki/".length));
}

// Where a page of the work sits below the main page: "" for the main page
// itself, "প্রথম খণ্ড/এক" for a subpage, null when it isn't part of the work.
export function pathInWork(root: string, title: string): string | null {
  if (title === root) return "";
  return title.startsWith(`${root}/`) && title.length > root.length + 1 ? title.slice(root.length + 1) : null;
}

export const titleInWork = (root: string, path: string) => (path ? `${root}/${path}` : root);

export function readerHref(bookId: string, path: string, fragment?: string): string {
  const base = `/books/${encodeURIComponent(bookId)}/read`;
  const rest = path ? `/${path.split("/").map(encodeSegment).join("/")}` : "";
  return `${base}${rest}${fragment ? `#${encodeURIComponent(fragment)}` : ""}`;
}

// The chapter segments of a reader URL -> a path in the work, or null when
// they can't name a page (empty segments, characters no title may have).
// Next hands the segments over decoded; a stray percent sign is left as is.
export function pathFromSegments(segments: string[]): string | null {
  if (segments.length === 0) return "";
  const parts = segments.map((s) => {
    let value = s;
    if (/%[0-9A-Fa-f]{2}/.test(value)) {
      try {
        value = decodeURIComponent(value);
      } catch {
        return null;
      }
    }
    return normalizeTitle(value);
  });
  if (parts.some((p) => !p)) return null;
  const path = parts.join("/");
  return isValidTitle(path) ? path : null;
}
