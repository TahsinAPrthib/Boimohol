import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { bookFormSchema, bookImportRowSchema, bookUpdateRowSchema } from "./book-schema";

const row = {
  title: "Gora",
  titleBangla: "গোরা",
  author: "রবীন্দ্রনাথ ঠাকুর",
  category: "uponnash",
  description: "একটি বই।",
  language: "bn",
  publishYear: 1910,
  authorDeathYear: 1941,
  isPublicDomain: true,
};

describe("book import rows", () => {
  test("a correct row passes", () => {
    assert.ok(bookImportRowSchema.safeParse(row).success);
  });

  test("public domain with a too-recent death year is rejected, in Bangla", () => {
    const r = bookImportRowSchema.safeParse({ ...row, author: "কাজী নজরুল ইসলাম", authorDeathYear: 1976 });
    assert.equal(r.success, false);
    const issue = !r.success ? r.error.issues.find((i) => i.path[0] === "isPublicDomain") : undefined;
    assert.ok(issue && /পাবলিক ডোমেইন/.test(issue.message), "rule message");
  });

  test("public domain with no death year is rejected; not public domain is fine without one", () => {
    assert.equal(bookImportRowSchema.safeParse({ ...row, authorDeathYear: null }).success, false);
    assert.equal(bookImportRowSchema.safeParse({ ...row, authorDeathYear: null, isPublicDomain: false }).success, true);
  });

  test("a misspelt field is an error, not silently dropped", () => {
    const { authorDeathYear, ...rest } = row;
    const r = bookImportRowSchema.safeParse({ ...rest, authordeathyear: authorDeathYear });
    assert.equal(r.success, false);
  });

  test("the flag must be a real boolean", () => {
    assert.equal(bookImportRowSchema.safeParse({ ...row, isPublicDomain: "yes" }).success, false);
  });

  test("future years and fractions are rejected", () => {
    assert.equal(bookImportRowSchema.safeParse({ ...row, publishYear: 3000 }).success, false);
    assert.equal(bookImportRowSchema.safeParse({ ...row, publishYear: 1910.5 }).success, false);
  });
});

describe("book import rows — free copies elsewhere", () => {
  const source = { url: "https://bn.wikisource.org/wiki/গোরা", rightsBasis: "লেখক ১৯৪১ সালে মারা গেছেন।" };
  const issuesAt = (r: ReturnType<typeof bookImportRowSchema.safeParse>, key: string) =>
    r.success ? [] : r.error.issues.filter((i) => i.path[0] === key);

  test("a public-domain row may carry links to trusted sites", () => {
    const r = bookImportRowSchema.safeParse({
      ...row,
      sources: [source, { url: "https://archive.org/details/gora00tago", rightsBasis: "একই", kind: "INTERNET_ARCHIVE" }],
    });
    assert.ok(r.success);
  });

  test("a link to any other site is refused", () => {
    const r = bookImportRowSchema.safeParse({ ...row, sources: [{ ...source, url: "https://example.com/gora.pdf" }] });
    assert.equal(issuesAt(r, "sources").length, 1);
  });

  test("not public domain: no links at all", () => {
    const r = bookImportRowSchema.safeParse({ ...row, authorDeathYear: 1976, isPublicDomain: false, sources: [source] });
    assert.ok(issuesAt(r, "sources").length >= 1);
  });

  test("each link needs a reason, and a given kind must match the address", () => {
    assert.equal(bookImportRowSchema.safeParse({ ...row, sources: [{ url: source.url }] }).success, false);
    assert.equal(bookImportRowSchema.safeParse({ ...row, sources: [{ ...source, kind: "GUTENBERG" }] }).success, false);
  });

  test("the same link twice (even spelt differently) and unknown fields are refused", () => {
    const twice = bookImportRowSchema.safeParse({ ...row, sources: [source, { ...source, url: "http://bn.wikisource.org/wiki/গোরা#x" }] });
    assert.equal(issuesAt(twice, "sources").length, 1);
    assert.equal(bookImportRowSchema.safeParse({ ...row, sources: [{ ...source, note: "x" }] }).success, false);
  });
});

describe("book import rows — translator and hidden search names", () => {
  test("both are optional; aliases are a list", () => {
    const r = bookImportRowSchema.safeParse({ ...row, translator: "রাজশেখর বসু", searchAliases: ["গোরা উপন্যাস"] });
    assert.ok(r.success && r.data.translator === "রাজশেখর বসু" && r.data.searchAliases.length === 1);
    const plain = bookImportRowSchema.safeParse(row);
    assert.ok(plain.success && plain.data.translator === null && plain.data.searchAliases.length === 0);
  });

  test("at most ten aliases", () => {
    assert.equal(bookImportRowSchema.safeParse({ ...row, searchAliases: Array.from({ length: 11 }, (_, i) => `নাম ${i}`) }).success, false);
  });
});

describe("book update rows", () => {
  const match = { title: "Gora", titleBangla: "গোরা", author: "রবীন্দ্রনাথ ঠাকুর" };
  const source = { url: "https://bn.wikisource.org/wiki/গোরা", rightsBasis: "লেখক ১৯৪১ সালে মারা গেছেন।" };

  test("a translator credit, an alias list or a link note each make a valid row", () => {
    assert.ok(bookUpdateRowSchema.safeParse({ match, set: { translator: "রাজশেখর বসু" } }).success);
    assert.ok(bookUpdateRowSchema.safeParse({ match, set: { titleBangla: null, searchAliases: ["গোরা"] } }).success);
    assert.ok(bookUpdateRowSchema.safeParse({ match, sources: [source] }).success);
  });

  test("a key left out of set stays undefined, so it isn't changed", () => {
    const r = bookUpdateRowSchema.safeParse({ match, set: { translator: "x" } });
    assert.ok(r.success && r.data.set && !("titleBangla" in r.data.set && r.data.set.titleBangla !== undefined));
  });

  test("nothing to change, other fields, or a link to another site are refused", () => {
    assert.equal(bookUpdateRowSchema.safeParse({ match }).success, false);
    assert.equal(bookUpdateRowSchema.safeParse({ match, set: { author: "x" } }).success, false);
    assert.equal(bookUpdateRowSchema.safeParse({ match, set: { translator: "x" }, category: "kobita" }).success, false);
    assert.equal(bookUpdateRowSchema.safeParse({ match, sources: [{ ...source, url: "https://example.com/a" }] }).success, false);
  });
});

describe("book form", () => {
  const form = { title: "Gora", titleBangla: "", author: "রবীন্দ্রনাথ ঠাকুর", categoryId: "c1", description: "বই", language: "bn", publishYear: "", authorDeathYear: "1941", isPublicDomain: "on" };

  test("empty optional fields become null and the checkbox becomes true", () => {
    const r = bookFormSchema.safeParse(form);
    assert.ok(r.success);
    if (r.success) {
      assert.equal(r.data.titleBangla, null);
      assert.equal(r.data.publishYear, null);
      assert.equal(r.data.authorDeathYear, 1941);
      assert.equal(r.data.isPublicDomain, true);
    }
  });

  test("the rule applies to the form as well", () => {
    assert.equal(bookFormSchema.safeParse({ ...form, authorDeathYear: "1990" }).success, false);
    assert.equal(bookFormSchema.safeParse({ ...form, authorDeathYear: "1990", isPublicDomain: undefined }).success, true);
  });
});
