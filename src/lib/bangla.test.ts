import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { bn, bnFixed, bnTaka } from "./bangla";

// Digits 0-9 must never appear in output that sits next to Bangla text.
const LATIN_DIGIT = /[0-9]/;

describe("bn — integers", () => {
  test("single digits", () => {
    assert.equal(bn(0), "০");
    assert.equal(bn(1), "১");
    assert.equal(bn(9), "৯");
  });

  test("multi-digit", () => {
    assert.equal(bn(10), "১০");
    assert.equal(bn(2026), "২,০২৬");
  });

  test("rounds away fractions rather than showing Latin decimals", () => {
    assert.equal(bn(4.6), "৫");
    assert.ok(!LATIN_DIGIT.test(bn(4.6)));
  });

  test("never emits a Latin digit across a wide sweep", () => {
    for (let i = 0; i <= 2000; i++) {
      assert.ok(!LATIN_DIGIT.test(bn(i)), `bn(${i}) leaked a Latin digit`);
    }
  });

  test("survives non-finite input instead of rendering NaN", () => {
    assert.equal(bn(Number.NaN), "০");
    assert.equal(bn(Number.POSITIVE_INFINITY), "০");
  });
});

describe("bnFixed — ratings", () => {
  test("one decimal place by default", () => {
    assert.equal(bnFixed(5), "৫.০");
    assert.equal(bnFixed(4.5), "৪.৫");
  });

  test("the exact case from the book detail page", () => {
    // Was rendering "5.0 (1টি পর্যালোচনা)".
    const line = `${bnFixed(5)} (${bn(1)}টি পর্যালোচনা)`;
    assert.equal(line, "৫.০ (১টি পর্যালোচনা)");
    assert.ok(!LATIN_DIGIT.test(line));
  });

  test("zero decimals when asked", () => {
    assert.equal(bnFixed(4.4, 0), "৪");
  });

  test("no Latin digits across fractional values", () => {
    for (let i = 0; i <= 50; i++) {
      assert.ok(!LATIN_DIGIT.test(bnFixed(i / 10)), `bnFixed(${i / 10}) leaked`);
    }
  });

  test("non-finite falls back rather than throwing", () => {
    assert.equal(bnFixed(Number.NaN), "০");
  });
});

describe("bnTaka — prices", () => {
  test("whole taka drops the decimal tail", () => {
    assert.equal(bnTaka(250), "৳২৫০");
    assert.equal(bnTaka(1200), "৳১,২০০");
  });

  test("a fractional price still renders rather than being rounded away", () => {
    assert.equal(bnTaka(99.5), "৳৯৯.৫");
  });

  test("zero and non-finite", () => {
    assert.equal(bnTaka(0), "৳০");
    assert.equal(bnTaka(Number.NaN), "৳০");
  });

  test("no Latin digits", () => {
    for (const v of [0, 5, 99, 250, 1500, 99999]) {
      assert.ok(!LATIN_DIGIT.test(bnTaka(v)), `bnTaka(${v}) leaked`);
    }
  });
});
