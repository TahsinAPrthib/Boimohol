import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { canDeleteOwnAccount, nameSchema, passwordSchema, passwordStamp } from "./account-rules";

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
