import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readLinkIntent, signLinkIntent } from "./link-intent";

const SECRET = "test-secret";
const NOW = Date.parse("2026-10-14T00:00:00Z");

describe("link intent cookie", () => {
  test("round-trips the account id before it expires", () => {
    assert.equal(readLinkIntent(signLinkIntent("user_1", NOW + 1000, SECRET), SECRET, NOW), "user_1");
  });

  test("rejects an expired intent", () => {
    assert.equal(readLinkIntent(signLinkIntent("user_1", NOW - 1, SECRET), SECRET, NOW), null);
  });

  test("rejects another account id, expiry or secret", () => {
    const value = signLinkIntent("user_1", NOW + 1000, SECRET);
    const [, expires, sig] = value.split(".");
    assert.equal(readLinkIntent(`user_2.${expires}.${sig}`, SECRET, NOW), null);
    assert.equal(readLinkIntent(`user_1.${NOW + 99999}.${sig}`, SECRET, NOW), null);
    assert.equal(readLinkIntent(value, "other-secret", NOW), null);
  });

  test("rejects junk", () => {
    for (const junk of [undefined, "", "a.b", "a.b.c.d", "user_1.soon.sig"]) {
      assert.equal(readLinkIntent(junk, SECRET, NOW), null, String(junk));
    }
  });
});
