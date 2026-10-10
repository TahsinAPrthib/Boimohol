import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { bookFormSchema, bookImportRowSchema } from "./book-schema";

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
