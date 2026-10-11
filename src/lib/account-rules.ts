import { z } from "zod";

// Shared by sign-up and the settings page, so a name or password accepted in
// one is accepted in the other.
export const nameSchema = z.string().trim().min(1, "নাম আবশ্যক।").max(80, "নাম অনেক বড়।");
export const passwordSchema = z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");

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
