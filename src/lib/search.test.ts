import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_QUERY_LENGTH,
  bookSearchText,
  escapeLike,
  hrefWith,
  listingSearchText,
  matchRank,
  normalizeForSearch,
  readQuery,
  requestSearchText,
  searchFilter,
} from "./search";

// Every string whose encoding is under test is built from code points, so the
// test checks exactly the encoding it names, whatever an editor does to this
// file.
const cp = (...codes: number[]) => String.fromCodePoint(...codes);
const ZWJ = cp(0x200d);
const ZWNJ = cp(0x200c);

describe("normalizeForSearch", () => {
  test("য় as one character (U+09DF) and as য + nukta normalize the same", () => {
    const precomposed = cp(0x09b8, 0x09ae, 0x09df); // সময়
    const decomposed = cp(0x09b8, 0x09ae, 0x09af, 0x09bc);
    assert.notEqual(precomposed, decomposed);
    assert.equal(normalizeForSearch(precomposed), normalizeForSearch(decomposed));
  });

  test("ড় and ঢ় in both encodings normalize the same", () => {
    assert.equal(normalizeForSearch(cp(0x09dc)), normalizeForSearch(cp(0x09a1, 0x09bc)));
    assert.equal(normalizeForSearch(cp(0x09dd)), normalizeForSearch(cp(0x09a2, 0x09bc)));
  });

  test("a two-part vowel sign typed as its parts matches the single character", () => {
    // কো: ো (U+09CB) and ে + া
    assert.equal(normalizeForSearch(cp(0x0995, 0x09cb)), normalizeForSearch(cp(0x0995, 0x09c7, 0x09be)));
    // কৌ: ৌ (U+09CC) and ে + ৗ
    assert.equal(normalizeForSearch(cp(0x0995, 0x09cc)), normalizeForSearch(cp(0x0995, 0x09c7, 0x09d7)));
  });

  test("zero-width joiner and non-joiner are removed", () => {
    // র্যাব: ra + ZWJ + virama + ya + aa + ba
    assert.equal(normalizeForSearch(cp(0x09b0) + ZWJ + cp(0x09cd, 0x09af, 0x09be, 0x09ac)), cp(0x09b0, 0x09cd, 0x09af, 0x09be, 0x09ac));
    assert.equal(normalizeForSearch(cp(0x0995) + ZWNJ + cp(0x09b2, 0x09ae)), cp(0x0995, 0x09b2, 0x09ae));
  });

  test("other invisible characters (zero-width space, word joiner, BOM) are removed", () => {
    const gora = cp(0x0997, 0x09cb, 0x09b0, 0x09be);
    assert.equal(normalizeForSearch(cp(0xfeff) + gora + cp(0x200b, 0x2060)), gora);
  });

  test("removing a joiner between the parts of a vowel sign still composes it", () => {
    assert.equal(normalizeForSearch(cp(0x0995, 0x09c7) + ZWJ + cp(0x09be)), cp(0x0995, 0x09cb));
  });

  test("khanda ta written as ত্ + ZWJ is unified with ৎ", () => {
    const modern = cp(0x0989, 0x09ce, 0x09b8, 0x09ac); // উৎসব
    const old = cp(0x0989, 0x09a4, 0x09cd) + ZWJ + cp(0x09b8, 0x09ac); // উত্সব
    assert.equal(normalizeForSearch(old), modern);
    assert.equal(normalizeForSearch(modern), modern);
  });

  test("ত্ followed by a consonant (a real conjunct) is left alone", () => {
    const uttor = cp(0x0989, 0x09a4, 0x09cd, 0x09a4, 0x09b0); // উত্তর
    assert.equal(normalizeForSearch(uttor), uttor);
  });

  test("lowercases, so English matching is case-insensitive", () => {
    assert.equal(normalizeForSearch("The War of the WORLDS"), "the war of the worlds");
    assert.equal(normalizeForSearch("GARCÍA Márquez"), "garcía márquez");
  });

  test("collapses runs of whitespace, including no-break spaces, and trims", () => {
    const nbsp = cp(0xa0);
    assert.equal(normalizeForSearch(`  Pather${nbsp}${nbsp} Panchali \t`), "pather panchali");
  });

  test("empty and invisible-only values become an empty string", () => {
    assert.equal(normalizeForSearch(""), "");
    assert.equal(normalizeForSearch(null), "");
    assert.equal(normalizeForSearch(undefined), "");
    assert.equal(normalizeForSearch(ZWJ + ZWNJ + " "), "");
  });
});

describe("search text for each kind of row", () => {
  test("a book combines the English and Bangla titles and the author", () => {
    assert.equal(bookSearchText({ title: "Gora", titleBangla: "গোরা", author: "Rabindranath Tagore" }), "gora\nগোরা\nrabindranath tagore");
  });

  test("a book without a Bangla title has no empty field", () => {
    assert.equal(bookSearchText({ title: "The Time Machine", titleBangla: null, author: "H. G. Wells" }), "the time machine\nh. g. wells");
  });

  test("a listing includes its location; a request has its title and author", () => {
    assert.equal(listingSearchText({ title: "Devdas", author: "Sarat Chandra", location: "Mirpur, Dhaka" }), "devdas\nsarat chandra\nmirpur, dhaka");
    assert.equal(requestSearchText({ title: "Aranyak", author: "Bibhutibhushan" }), "aranyak\nbibhutibhushan");
  });

  test("stored text and query normalize the same way (য় in either encoding)", () => {
    const stored = bookSearchText({ title: "Samay", titleBangla: cp(0x09b8, 0x09ae, 0x09df), author: "x" });
    const filter = searchFilter(cp(0x09b8, 0x09ae, 0x09af, 0x09bc));
    assert.ok(filter && stored.includes(filter.searchText.contains));
  });

  test("fields are separated, so a query can't match across two of them", () => {
    const stored = bookSearchText({ title: "Gora", titleBangla: null, author: "Tagore" });
    assert.ok(!stored.includes(normalizeForSearch("gora tagore")));
  });
});

describe("queries", () => {
  test("% and _ (and the escape character itself) are matched literally", () => {
    assert.equal(escapeLike("100%_off"), "100\\%\\_off");
    assert.equal(escapeLike("a\\b"), "a\\\\b");
    assert.deepEqual(searchFilter("50%"), { searchText: { contains: "50\\%" } });
  });

  test("an empty or invisible query means no search", () => {
    assert.equal(searchFilter(""), undefined);
    assert.equal(searchFilter("   "), undefined);
    assert.equal(searchFilter(ZWJ), undefined);
  });

  test("matchRank puts exact, then leading, then word-start matches first", () => {
    assert.equal(matchRank(["Gora", "গোরা"], "গোরা"), 0);
    assert.equal(matchRank(["Pather Dabi"], "pather"), 1);
    assert.equal(matchRank(["The Pather"], "pather"), 2);
    assert.equal(matchRank(["Apathetic"], "pathe"), 3);
    assert.equal(matchRank([null, "Gora"], "GORA"), 0);
  });

  test("hrefWith keeps the given parameters and drops empty ones", () => {
    assert.equal(hrefWith("/marketplace", { category: "uponnash", q: "দেবদাস" }), "/marketplace?category=uponnash&q=" + encodeURIComponent("দেবদাস"));
    assert.equal(hrefWith("/marketplace", { category: undefined, q: "" }), "/marketplace");
    assert.equal(hrefWith("/library", { q: "a&b=c" }), "/library?q=a%26b%3Dc");
  });

  test("readQuery takes one trimmed value and caps it at the limit", () => {
    assert.equal(readQuery(undefined), "");
    assert.equal(readQuery("  Gora "), "Gora");
    assert.equal(readQuery(["first", "second"]), "first");
    assert.equal(readQuery("x".repeat(150)).length, MAX_QUERY_LENGTH);
  });
});
