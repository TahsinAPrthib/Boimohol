// Free copies of a book hosted elsewhere. Only three sites are trusted to
// host public-domain texts, and a link must be on one of them: any language's
// Wikisource, Project Gutenberg, or the Internet Archive. The kind of source
// is decided by the address, never taken on trust.
//
// Pure, so the admin form, the server actions and the JSON import all run
// the same check (and the tests can too).

export type SourceKind = "WIKISOURCE" | "GUTENBERG" | "INTERNET_ARCHIVE";

export const SOURCE_KINDS: SourceKind[] = ["WIKISOURCE", "GUTENBERG", "INTERNET_ARCHIVE"];

// Shown on the button: "বিনামূল্যে পড়ুন — উইকিসংকলন".
export const SOURCE_LABEL: Record<SourceKind, string> = {
  WIKISOURCE: "উইকিসংকলন",
  GUTENBERG: "প্রজেক্ট গুটেনবার্গ",
  INTERNET_ARCHIVE: "ইন্টারনেট আর্কাইভ",
};

const SITES: { domain: string; kind: SourceKind }[] = [
  { domain: "wikisource.org", kind: "WIKISOURCE" },
  { domain: "gutenberg.org", kind: "GUTENBERG" },
  { domain: "archive.org", kind: "INTERNET_ARCHIVE" },
];

export const MAX_SOURCE_URL_LENGTH = 2000;

export type ParsedSource = { ok: true; kind: SourceKind; url: string } | { ok: false; message: string };

const REFUSED = "শুধু উইকিসংকলন (wikisource.org), প্রজেক্ট গুটেনবার্গ (gutenberg.org) বা ইন্টারনেট আর্কাইভের (archive.org) লিংক দেওয়া যায়।";

export function parseSourceUrl(raw: string): ParsedSource {
  const text = raw.trim();
  if (!text) return { ok: false, message: "লিংক দিন।" };
  if (text.length > MAX_SOURCE_URL_LENGTH) return { ok: false, message: "লিংকটি অনেক বড়।" };

  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return { ok: false, message: "পূর্ণ লিংক দিন, https:// দিয়ে শুরু করে।" };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return { ok: false, message: REFUSED };
  // user:pass@ and a non-default port have no place in a public reading link
  // (and "https://wikisource.org@evil.example" is the classic disguise).
  if (url.username || url.password || url.port) return { ok: false, message: REFUSED };

  const host = url.hostname.toLowerCase();
  const site = SITES.find((s) => host === s.domain || host.endsWith(`.${s.domain}`));
  if (!site) return { ok: false, message: REFUSED };
  if (url.pathname === "/" && !url.search) return { ok: false, message: "সাইটের মূল পাতা নয়, বইটির নিজের পাতার লিংক দিন।" };

  url.protocol = "https:";
  url.hash = "";
  return { ok: true, kind: site.kind, url: url.href };
}

// A stored (percent-encoded) address, readable again for people:
// https://bn.wikisource.org/wiki/গোরা rather than %E0%A6%97...
export function displayUrl(href: string): string {
  try {
    return decodeURI(href);
  } catch {
    return href;
  }
}
