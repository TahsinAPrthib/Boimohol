import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { bnDayMonth, dayNumber, dhakaDateKey, rotation, takeFrom } from "./daily";

describe("the book of the day", () => {
  test("the day turns at midnight in Dhaka (18:00 UTC), not at midnight UTC", () => {
    assert.equal(dhakaDateKey(new Date("2026-10-28T17:59:59Z")), "2026-10-28");
    assert.equal(dhakaDateKey(new Date("2026-10-28T18:00:00Z")), "2026-10-29");
    // Still the 28th in UTC, already the 29th in Dhaka.
    assert.equal(dhakaDateKey(new Date("2026-10-28T23:30:00Z")), "2026-10-29");
    assert.equal(dhakaDateKey(new Date("2026-12-31T18:00:00Z")), "2027-01-01");
  });

  test("consecutive dates are consecutive day numbers, across months and years", () => {
    assert.equal(dayNumber("1970-01-02"), 1);
    assert.equal(dayNumber("2026-11-01") - dayNumber("2026-10-31"), 1);
    assert.equal(dayNumber("2027-01-01") - dayNumber("2026-12-31"), 1);
    assert.equal(dayNumber("2028-03-01") - dayNumber("2028-02-28"), 2);
  });

  test("the date over the book is in Bangla", () => {
    assert.equal(bnDayMonth("2026-10-28"), "২৮ অক্টোবর");
    assert.equal(bnDayMonth("2027-01-01"), "১ জানুয়ারি");
  });

  test("the order doesn't depend on how the database returned the books", () => {
    const ids = ["kobita-a", "uponnash-b", "natok-c", "probondho-d", "kobita-e"];
    assert.deepEqual(rotation(ids), rotation([...ids].reverse()));
    assert.deepEqual([...rotation(ids)].sort(), [...ids].sort());
    assert.deepEqual(rotation([...ids, "kobita-a"]).length, ids.length);
  });

  test("every book has its day before any book comes round again", () => {
    const order = rotation(Array.from({ length: 30 }, (_, i) => `book-${i}`));
    const month = Array.from({ length: 30 }, (_, day) => takeFrom(order, day, 1)[0]);
    assert.equal(new Set(month).size, 30);
    assert.equal(takeFrom(order, 30, 1)[0], month[0]);
  });

  test("taking wraps round and never repeats within one take", () => {
    assert.deepEqual(takeFrom(["a", "b", "c"], 2, 2), ["c", "a"]);
    assert.deepEqual(takeFrom(["a", "b", "c"], -1, 1), ["c"]);
    assert.deepEqual(takeFrom(["a", "b"], 0, 5), ["a", "b"]);
    assert.deepEqual(takeFrom([], 3, 2), []);
  });
});
