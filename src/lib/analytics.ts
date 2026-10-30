// What Vercel Web Analytics is told about a page view (SiteAnalytics, in the
// root layout). /privacy promises that search terms aren't kept and that no
// account is identified, so each address goes without its query string or
// fragment: search terms (?q=), callbackUrl, sign-in errors and the like
// stay on the device. A path that names a person or a private conversation
// goes as its route. Nothing else about the visitor is added: no user ID,
// email or username is ever passed to analytics.
//
// The script itself sends a referrer only when it is another site, so our
// own pages (a search, say) never arrive as referrers; it sets no cookies.

const PRIVATE_PATHS: [RegExp, string][] = [
  [/^\/admin\/users\/[^/]+/, "/admin/users/[id]"],
  [/^\/messages\/[^/]+/, "/messages/[conversationId]"],
];

export function forAnalytics<E extends { url: string }>(event: E): E | null {
  let url: URL;
  try {
    url = new URL(event.url);
  } catch {
    // An address we can't read isn't sent at all.
    return null;
  }
  url.search = "";
  url.hash = "";
  for (const [pattern, route] of PRIVATE_PATHS) url.pathname = url.pathname.replace(pattern, route);
  return { ...event, url: url.href };
}
