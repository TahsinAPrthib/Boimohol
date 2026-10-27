import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { banglaFirst, bookSortTitle, inLanguage, LANGUAGE_FILTERS, languageParam, languageWhere, PAGE_SIZE, pageOf, readLanguage, readPage, splitPage } from "./book-language";

describe("language filter", () => {
  test("bn and other filter; the old en links mean other; anything else is all", () => {
    assert.equal(readLanguage("bn"), "bn");
    assert.equal(readLanguage("other"), "other");
    assert.equal(readLanguage(["en", "bn"]), "other");
    assert.equal(readLanguage(undefined), "all");
    assert.equal(readLanguage("fr"), "all");
    assert.equal(readLanguage("BN"), "all");
  });

  test("the chips read বাংলা / অন্যান্য ভাষা / সব, in that order", () => {
    assert.deepEqual(
      LANGUAGE_FILTERS.map((f) => f.value),
      ["bn", "other", "all"]
    );
  });

  test("other means every language except Bangla; all adds no condition and isn't written to the URL", () => {
    assert.deepEqual(languageWhere("all"), {});
    assert.deepEqual(languageWhere("bn"), { language: "bn" });
    assert.deepEqual(languageWhere("other"), { language: { not: "bn" } });
    assert.equal(languageParam("all"), undefined);
    assert.equal(languageParam("other"), "other");
  });

  test("inLanguage agrees with languageWhere", () => {
    assert.ok(inLanguage("en", "other") && inLanguage("ru", "other") && !inLanguage("bn", "other"));
    assert.ok(inLanguage("bn", "bn") && !inLanguage("en", "bn"));
    assert.ok(inLanguage("bn", "all") && inLanguage("fr", "all"));
  });
});

describe("Bangla books first", () => {
  const book = (language: string, title: string, titleBangla: string | null = null) => ({ language, title, titleBangla });

  test("Bangla first by Bangla title, then the rest by English title", () => {
    const ordered = banglaFirst([
      book("en", "Persuasion"),
      book("bn", "Gora", "গোরা"),
      book("ru", "Crime and Punishment", "অপরাধ ও শাস্তি"),
      book("en", "emma"),
      book("bn", "Anandamath", "আনন্দমঠ"),
    ]).map((b) => b.titleBangla ?? b.title);
    assert.deepEqual(ordered, ["আনন্দমঠ", "গোরা", "অপরাধ ও শাস্তি", "emma", "Persuasion"]);
  });

  test("doesn't change the list it's given", () => {
    const list = [book("en", "B"), book("bn", "A", "অ")];
    banglaFirst(list);
    assert.equal(list[0].title, "B");
  });
});

describe("paging", () => {
  test("page numbers: whole numbers from 1", () => {
    assert.equal(readPage("3"), 3);
    assert.equal(readPage("0"), 1);
    assert.equal(readPage("-2"), 1);
    assert.equal(readPage("2.5"), 1);
    assert.equal(readPage("abc"), 1);
    assert.equal(readPage(undefined), 1);
  });

  test("slices, and a page past the end shows the last one", () => {
    const items = Array.from({ length: 10 }, (_, i) => i);
    assert.deepEqual(pageOf(items, 2, 4), { items: [4, 5, 6, 7], page: 2, pages: 3 });
    assert.deepEqual(pageOf(items, 9, 4), { items: [8, 9], page: 3, pages: 3 });
    assert.deepEqual(pageOf([], 1, 4), { items: [], page: 1, pages: 1 });
  });

  test("curated books first, then the rest paged by the database", () => {
    // 5 curated and 10 more, 4 to a page.
    assert.deepEqual(splitPage(5, 10, 1, 4), { page: 1, pages: 4, curated: [0, 4], rest: { skip: 0, take: 0 } });
    assert.deepEqual(splitPage(5, 10, 2, 4), { page: 2, pages: 4, curated: [4, 5], rest: { skip: 0, take: 3 } });
    assert.deepEqual(splitPage(5, 10, 3, 4), { page: 3, pages: 4, curated: [5, 5], rest: { skip: 3, take: 4 } });
    assert.deepEqual(splitPage(5, 10, 9, 4), { page: 4, pages: 4, curated: [5, 5], rest: { skip: 7, take: 3 } });
    assert.deepEqual(splitPage(0, 0, 1, 4), { page: 1, pages: 1, curated: [0, 0], rest: { skip: 0, take: 0 } });
  });

  test("bulk books sort without leading quote marks and symbols, case or accents", () => {
    const titles = ["!Tention", "“1914”", "'Tis Sixty Years Since", "Élan", "alice", "Zoe", "\"A Catchcart or a Riggs?\""];
    const sorted = [...titles].sort((a, b) => (bookSortTitle(a) < bookSortTitle(b) ? -1 : 1));
    assert.deepEqual(sorted, ["“1914”", "\"A Catchcart or a Riggs?\"", "alice", "Élan", "!Tention", "'Tis Sixty Years Since", "Zoe"]);
    assert.equal(bookSortTitle("  Élan Vital"), "elan vital");
  });

  test("the sort key leaves Bangla letters and vowel signs alone", () => {
    assert.equal(bookSortTitle("গীতাঞ্জলি"), "গীতাঞ্জলি");
    assert.equal(bookSortTitle("‘পার্টিসন’-প্রহেলিকা"), "পার্টিসন’-প্রহেলিকা");
  });

  test("the pages together list every book once, in order", () => {
    for (const [curated, rest] of [[0, 9], [7, 0], [3, 13], [8, 8], [48, 1], [1, 95]]) {
      const seen: string[] = [];
      const { pages } = splitPage(curated, rest, 1);
      for (let page = 1; page <= pages; page++) {
        const s = splitPage(curated, rest, page);
        for (let i = s.curated[0]; i < s.curated[1]; i++) seen.push(`c${i}`);
        for (let i = s.rest.skip; i < s.rest.skip + s.rest.take; i++) seen.push(`r${i}`);
        if (page < pages) assert.equal(s.curated[1] - s.curated[0] + s.rest.take, PAGE_SIZE);
      }
      const all = [...Array.from({ length: curated }, (_, i) => `c${i}`), ...Array.from({ length: rest }, (_, i) => `r${i}`)];
      assert.deepEqual(seen, all);
    }
  });
});

describe("leading punctuation", () => {
  test("quote marks and ৺ don't decide the order", () => {
    const ordered = banglaFirst([
      { language: "bn", title: "Partison", titleBangla: "‘পার্টিসন’-প্রহেলিকা" },
      { language: "bn", title: "Krittibas", titleBangla: "৺কৃত্তিবাসের পরিচয় সংগ্রহ" },
      { language: "bn", title: "Gora", titleBangla: "গোরা" },
      { language: "en", title: "'Firebrand' Trevison", titleBangla: null },
      { language: "en", title: "Emma", titleBangla: null },
    ]).map((b) => b.title);
    assert.deepEqual(ordered, ["Krittibas", "Gora", "Partison", "Emma", "'Firebrand' Trevison"]);
  });
});
