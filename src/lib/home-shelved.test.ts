import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { MIN_BOOKS, MIN_READERS, SHOWN, mostShelved } from "./home-shelved";

const book = (id: string, curated = true) => ({ id, curated });

describe("the home page's most shelved books", () => {
  test("the thresholds: three readers for a book, four books for the section, six shown", () => {
    assert.deepEqual([MIN_READERS, MIN_BOOKS, SHOWN], [3, 4, 6]);
  });

  test("fewer than four books that count: no section at all", () => {
    const books = ["a", "b", "c"].map((id) => book(id));
    assert.deepEqual(mostShelved(["a", "b", "c"], books), []);
    // A ranked book that has since gone (deleted) doesn't count either.
    assert.deepEqual(mostShelved(["a", "b", "c", "gone"], books), []);
  });

  test("four or more: in shelf order, curated books first, at most six", () => {
    const books = [book("a"), book("b", false), book("c"), book("d", false), book("e"), book("f"), book("g"), book("h")];
    const ranked = ["b", "a", "d", "c", "e", "f", "g", "h"];
    assert.deepEqual(
      mostShelved(ranked, books).map((b) => b.id),
      ["a", "c", "e", "f", "g", "h"]
    );
    assert.deepEqual(
      mostShelved(["b", "a", "d", "c"], books).map((b) => b.id),
      ["a", "c", "b", "d"]
    );
  });
});
