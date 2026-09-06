// Resolving against a fixed sentinel origin rather than window.location so
// this stays pure and works during prerender. Any value that resolves off
// this origin — absolute, protocol-relative, or a scheme like javascript: —
// is rejected, so only same-origin relative paths survive.
const SENTINEL_ORIGIN = "http://localhost";

// Control characters are never legitimate in a redirect target. CR/LF would
// additionally be header-injection material if this is ever reused for a
// server-side redirect.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

// A callbackUrl arrives from the query string, so it's attacker-controllable.
// Prefix checks are NOT enough: useSearchParams percent-decodes, and the URL
// parser strips ASCII tab/CR/LF before parsing, so "/\t/evil.com" slips past
// a "//" check and still resolves to //evil.com. Parse it and compare origins.
export function safeCallbackUrl(raw: string | null | undefined, fallback = "/") {
  if (!raw || !raw.startsWith("/")) return fallback;
  if (CONTROL_CHARS.test(raw)) return fallback;

  let url: URL;
  try {
    url = new URL(raw, SENTINEL_ORIGIN);
  } catch {
    return fallback;
  }

  if (url.origin !== SENTINEL_ORIGIN) return fallback;

  return `${url.pathname}${url.search}${url.hash}`;
}

// Builds an auth-entry-point URL carrying where to return to afterwards, e.g.
// withCallbackUrl("/login", "/profile"). The single place callbackUrl links
// are produced, so encoding can't drift between call sites. Pass a path you
// trust (a server-derived route, or a value already through
// safeCallbackUrl) — this encodes, it does not sanitise.
export function withCallbackUrl(basePath: string, callbackPath: string) {
  return `${basePath}?callbackUrl=${encodeURIComponent(callbackPath)}`;
}
