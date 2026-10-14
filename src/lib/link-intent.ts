import { createHmac, timingSafeEqual } from "node:crypto";

// "Connect Google" leaves the site for Google and comes back through
// NextAuth's sign-in callback, which can't tell a deliberate connect from an
// ordinary sign-in. So the settings page first sets this: the account id and
// an expiry, signed with the app secret so it can't be forged or altered.
// The callback links only when it finds a valid one for the account that is
// signed in at that moment.

export const LINK_INTENT_TTL_MS = 10 * 60 * 1000;

function signature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(`google-link:${payload}`).digest("base64url");
}

export function signLinkIntent(userId: string, expiresAt: number, secret: string): string {
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${signature(payload, secret)}`;
}

// The account id, or null if the value is malformed, forged or expired.
export function readLinkIntent(value: string | undefined, secret: string, now: number): string | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [userId, expires, sig] = parts;
  const expected = Buffer.from(signature(`${userId}.${expires}`, secret));
  const given = Buffer.from(sig);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  if (!/^\d+$/.test(expires) || Number(expires) < now) return null;
  return userId || null;
}
