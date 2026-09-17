import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { evaluateMatch, listingMatchesBook, overlaps } from "./wishlist-match";

// The catalog book a reader has wishlisted.
const PATHER_PANCHALI = {
  title: "Pather Panchali",
  titleBangla: "পথের পাঁচালী",
  author: "বিভূতিভূষণ বন্দ্যোপাধ্যায়",
};

describe("overlaps", () => {
  test("matches identical strings", () => {
    assert.equal(overlaps("Pather Panchali", "Pather Panchali"), true);
  });

  test("ignores case and surrounding whitespace", () => {
    assert.equal(overlaps("  PATHER panchali ", "pather Panchali"), true);
  });

  test("matches in both directions", () => {
    assert.equal(overlaps("Pather Panchali (hardcover)", "Pather Panchali"), true);
    assert.equal(overlaps("Panchali", "Pather Panchali"), true);
  });

  test("empty or whitespace-only never matches", () => {
    assert.equal(overlaps("", "anything"), false);
    assert.equal(overlaps("anything", ""), false);
    assert.equal(overlaps("   ", "anything"), false);
  });
});

describe("evaluateMatch — title is required", () => {
  test("author matches but title does not → NO match", () => {
    // The whole point of the tightening: another Bibhutibhushan novel must
    // not surface just because the author agrees.
    const result = evaluateMatch(
      { title: "অপরাজিত", author: "বিভূতিভূষণ বন্দ্যোপাধ্যায়" },
      PATHER_PANCHALI
    );
    assert.equal(result.matched, false);
    assert.equal(result.titleMatch, false);
    assert.equal(result.authorMatch, true);
    assert.equal(result.strength, "none");
  });

  test("neither title nor author matches → no match", () => {
    const result = evaluateMatch({ title: "দেবদাস", author: "শরৎচন্দ্র" }, PATHER_PANCHALI);
    assert.equal(result.matched, false);
    assert.equal(result.strength, "none");
  });

  test("title matches, author does not → match, title strength", () => {
    // Sellers often mistype or omit the author; the title carries the match.
    const result = evaluateMatch(
      { title: "Pather Panchali", author: "unknown" },
      PATHER_PANCHALI
    );
    assert.equal(result.matched, true);
    assert.equal(result.authorMatch, false);
    assert.equal(result.strength, "title");
  });

  test("title and author both match → strongest", () => {
    const result = evaluateMatch(
      { title: "Pather Panchali", author: "বিভূতিভূষণ বন্দ্যোপাধ্যায়" },
      PATHER_PANCHALI
    );
    assert.equal(result.matched, true);
    assert.equal(result.strength, "title-and-author");
  });
});

describe("evaluateMatch — loose title behaviour is preserved", () => {
  test("case-insensitive", () => {
    assert.equal(listingMatchesBook({ title: "pather panchali", author: "x" }, PATHER_PANCHALI), true);
  });

  test("listing title carries extra text around the book title", () => {
    assert.equal(
      listingMatchesBook({ title: "পথের পাঁচালী (হার্ডকভার) — পুরনো", author: "x" }, PATHER_PANCHALI),
      true
    );
  });

  test("listing title is a fragment of the book title", () => {
    assert.equal(listingMatchesBook({ title: "Panchali", author: "x" }, PATHER_PANCHALI), true);
  });

  test("matches the Bangla title when the listing is in Bangla", () => {
    assert.equal(listingMatchesBook({ title: "পথের পাঁচালী", author: "x" }, PATHER_PANCHALI), true);
  });

  test("matches the English title when the listing is in English", () => {
    assert.equal(listingMatchesBook({ title: "Pather Panchali", author: "x" }, PATHER_PANCHALI), true);
  });

  test("a book with no Bangla title still matches on its English title", () => {
    assert.equal(
      listingMatchesBook(
        { title: "The War of the Worlds", author: "x" },
        { title: "The War of the Worlds", titleBangla: null, author: "H. G. Wells" }
      ),
      true
    );
  });

  test("an empty listing title does not match everything", () => {
    assert.equal(listingMatchesBook({ title: "", author: "বিভূতিভূষণ বন্দ্যোপাধ্যায়" }, PATHER_PANCHALI), false);
    assert.equal(listingMatchesBook({ title: "   ", author: "x" }, PATHER_PANCHALI), false);
  });
});
