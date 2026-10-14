import { z } from "zod";

// Shared by sign-up and the settings page, so a name or password accepted in
// one is accepted in the other.
export const nameSchema = z.string().trim().min(1, "নাম আবশ্যক।").max(80, "নাম অনেক বড়।");
export const usernameSchema = z
  .string()
  .trim()
  .min(3, "ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।")
  .max(30, "ইউজারনেম অনেক বড়।")
  .regex(/^[a-zA-Z0-9_]+$/, "ইউজারনেমে শুধু ইংরেজি অক্ষর, সংখ্যা ও আন্ডারস্কোর (_) ব্যবহার করা যাবে।");
export const passwordSchema = z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");

// The username an account created through Google holds until its owner picks
// one. The hyphen is something usernameSchema never allows, so no one can
// choose it and it can never clash with a real username.
export function pendingUsername(random: string): string {
  return `google-${random}`;
}

// Email addresses compared the way mail providers treat them: case doesn't
// matter. (Accounts store the address as it was typed.)
export function emailsMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

// The display name for a new Google account: Google's name, else the part of
// the email before the @, cut to what sign-up allows.
export function nameFromGoogle(name: string | null | undefined, email: string): string {
  const fromGoogle = (name ?? "").trim();
  return (fromGoogle || email.split("@")[0] || "পাঠক").slice(0, 80);
}

// What a login token remembers about the password it was issued for: when
// it was last changed, or 0 if never. A token whose value no longer matches
// the account's was issued before a password change and stops counting.
// (NextAuth re-stamps the token's own issue time on every session refresh,
// so that can't be compared against -- an old session would revive itself.)
export function passwordStamp(passwordChangedAt: Date | null | undefined): number {
  return passwordChangedAt ? passwordChangedAt.getTime() : 0;
}

// The site must keep at least one admin who can act: an admin may delete
// their own account only while another, unsuspended admin remains.
export function canDeleteOwnAccount(role: string, otherActiveAdmins: number): boolean {
  return role !== "ADMIN" || otherActiveAdmins > 0;
}
