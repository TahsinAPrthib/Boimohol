import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { FIRST_LINES, firstLineOf, quotedLine } from "./first-lines";

describe("first-line epigraphs", () => {
  test("one reviewed line per book, each with where and when it was checked", () => {
    const ids = FIRST_LINES.map((l) => l.bookId);
    assert.equal(new Set(ids).size, ids.length);
    for (const l of FIRST_LINES) {
      assert.ok(l.line.length > 0 && l.line === l.line.trim(), l.bookId);
      assert.match(l.checked, /^\d{4}-\d{2}-\d{2}$/, l.bookId);
      assert.ok(l.page.includes("/"), `${l.bookId}: page should name the chapter's Wikisource page`);
      // Bangla text keeps Bangla digits.
      assert.doesNotMatch(l.line, /[0-9]/, l.bookId);
    }
  });

  test("a book that isn't on the list has no epigraph", () => {
    assert.equal(firstLineOf("uponnash-shesher-kobita")?.line, "অমিত রায় ব্যারিস্টার।");
    assert.equal(firstLineOf("uponnash-pather-dabi"), null);
  });

  test("lines get quotation marks unless they open with their own", () => {
    assert.equal(quotedLine("অতি বিস্তৃত অরণ্য।"), "“অতি বিস্তৃত অরণ্য।”");
    assert.equal(quotedLine("“ও পি—ও পিপি।”"), "“ও পি—ও পিপি।”");
  });
});
