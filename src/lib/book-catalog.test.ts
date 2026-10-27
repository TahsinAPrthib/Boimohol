import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { bookIdBase, bookIdFor, clashesWith, findExisting, indexByKeys, keySetOf, normalizeForMatch } from "./book-catalog";

const existing = [
  { title: "Pather Panchali", titleBangla: "পথের পাঁচালী", author: "বিভূতিভূষণ বন্দ্যোপাধ্যায়" },
  { title: "The War of the Worlds", titleBangla: null, author: "H. G. Wells" },
];
const keys = keySetOf(existing);

describe("duplicate detection", () => {
  test("same title and author, different case and spacing", () => {
    assert.ok(clashesWith({ title: "the  war of the WORLDS", author: "h. g. wells" }, keys));
  });

  test("a Bangla title matches the existing English-titled book's Bangla title", () => {
    assert.ok(clashesWith({ title: "Pother Pachali", titleBangla: "পথের পাঁচালী", author: "বিভূতিভূষণ বন্দ্যোপাধ্যায়" }, keys));
  });

  test("a new book whose English title equals an existing Bangla title still clashes", () => {
    assert.ok(clashesWith({ title: "পথের পাঁচালী", author: "বিভূতিভূষণ বন্দ্যোপাধ্যায়" }, keys));
  });

  test("same title by a different author is not a duplicate", () => {
    assert.ok(!clashesWith({ title: "The War of the Worlds", author: "Somebody Else" }, keys));
  });

  test("Bangla letters stored in different Unicode forms are treated as equal", () => {
    // য় as a single code point (U+09DF) vs য + nukta (U+09AF U+09BC)
    assert.equal(normalizeForMatch("য়"), normalizeForMatch("য়"));
  });
});

describe("book ids", () => {
  test("follow the seed's category-title shape, URL-safe", () => {
    assert.equal(bookIdFor("uponnash", "Kopalkundala", new Set()), "uponnash-kopalkundala");
    assert.equal(bookIdFor("kobita", "Leaves of Grass: 1855", new Set()), "kobita-leaves-of-grass-1855");
  });

  test("a taken id gets a numeric suffix, and the result is reserved", () => {
    const taken = new Set(["uponnash-gora"]);
    assert.equal(bookIdFor("uponnash", "Gora", taken), "uponnash-gora-2");
    assert.equal(bookIdFor("uponnash", "Gora", taken), "uponnash-gora-3");
  });

  test("a title with no Latin letters still gets a usable id", () => {
    assert.equal(bookIdFor("kobita", "গীতাঞ্জলি", new Set()), "kobita-book");
  });

  test("every id for a title starts with its base, so the taken ones can be looked up by prefix", () => {
    const taken = new Set(["uponnash-gora", "uponnash-gora-2"]);
    assert.equal(bookIdBase("uponnash", "Gora"), "uponnash-gora");
    assert.ok(bookIdFor("uponnash", "Gora", taken).startsWith(bookIdBase("uponnash", "Gora")));
    assert.equal(bookIdBase("kobita", "Leaves of Grass: 1855"), "kobita-leaves-of-grass-1855");
  });
});

describe("finding the existing book an import row means", () => {
  const catalog = [
    { id: "uponnash-gora", title: "Gora", titleBangla: "গোরা", author: "রবীন্দ্রনাথ ঠাকুর" },
    { id: "kobita-sonar-tori", title: "Sonar Tori", titleBangla: "সোনার তরী", author: "রবীন্দ্রনাথ ঠাকুর" },
  ];
  const index = indexByKeys(catalog);

  test("by the Bangla title and author, whatever the English title", () => {
    assert.equal(findExisting({ title: "Gora (novel)", titleBangla: "গোরা", author: "রবীন্দ্রনাথ ঠাকুর" }, index)?.id, "uponnash-gora");
  });

  test("by the English title, ignoring case and spacing", () => {
    assert.equal(findExisting({ title: "sonar  tori", titleBangla: null, author: " রবীন্দ্রনাথ ঠাকুর" }, index)?.id, "kobita-sonar-tori");
  });

  test("the same title by another author is a different book", () => {
    assert.equal(findExisting({ title: "Gora", titleBangla: "গোরা", author: "অন্য লেখক" }, index), undefined);
  });
});
