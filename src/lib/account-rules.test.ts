import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  canDeleteOwnAccount,
  emailsMatch,
  nameFromGoogle,
  nameSchema,
  passwordSchema,
  passwordStamp,
  pendingUsername,
  usernameSchema,
} from "./account-rules";

describe("nameSchema / passwordSchema — the sign-up rules", () => {
  test("names are trimmed, required, at most 80 characters", () => {
    assert.equal(nameSchema.parse("  রহিম  "), "রহিম");
    assert.equal(nameSchema.safeParse("   ").success, false);
    assert.equal(nameSchema.safeParse("ক".repeat(80)).success, true);
    assert.equal(nameSchema.safeParse("ক".repeat(81)).success, false);
  });

  test("passwords need at least 6 characters, kept as typed", () => {
    assert.equal(passwordSchema.safeParse("12345").success, false);
    assert.equal(passwordSchema.parse(" 12345"), " 12345");
  });
});

describe("passwordStamp", () => {
  test("never changed is 0; otherwise the time in milliseconds", () => {
    assert.equal(passwordStamp(null), 0);
    assert.equal(passwordStamp(undefined), 0);
    assert.equal(passwordStamp(new Date("2026-10-11T12:00:00.123Z")), Date.parse("2026-10-11T12:00:00.123Z"));
  });
});

describe("canDeleteOwnAccount — the last admin stays", () => {
  test("readers can always delete their own account", () => {
    assert.equal(canDeleteOwnAccount("READER", 0), true);
  });

  test("an admin only while another active admin remains", () => {
    assert.equal(canDeleteOwnAccount("ADMIN", 0), false);
    assert.equal(canDeleteOwnAccount("ADMIN", 1), true);
  });
});

describe("usernameSchema / pendingUsername", () => {
  test("the sign-up username rules", () => {
    assert.equal(usernameSchema.parse("  rahim_reads "), "rahim_reads");
    assert.equal(usernameSchema.safeParse("ab").success, false);
    assert.equal(usernameSchema.safeParse("a".repeat(31)).success, false);
    assert.equal(usernameSchema.safeParse("রহিম").success, false);
  });

  test("a Google placeholder can never be chosen as a username", () => {
    assert.equal(usernameSchema.safeParse(pendingUsername("8f3a9c2d1b")).success, false);
  });
});

describe("emailsMatch / nameFromGoogle", () => {
  test("emails match ignoring case and surrounding spaces", () => {
    assert.equal(emailsMatch("Rahim@Gmail.com ", "rahim@gmail.com"), true);
    assert.equal(emailsMatch("rahim@gmail.com", "rahima@gmail.com"), false);
  });

  test("Google's name, else the email's local part, at most 80 characters", () => {
    assert.equal(nameFromGoogle("  Rahima Khatun ", "x@y.com"), "Rahima Khatun");
    assert.equal(nameFromGoogle("", "rahim.reads@gmail.com"), "rahim.reads");
    assert.equal(nameFromGoogle("ক".repeat(90), "x@y.com").length, 80);
  });
});
