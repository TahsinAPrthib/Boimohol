import { test, describe } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { bookCardSvg, renderJpeg, wrapText } from "./share-card";
import { bookCardUrl, bookShareMetadata, cardVersion, previewText, siteShareMetadata, SITE_SHARE_IMAGE } from "./share";
import { FAMILY_BY_CATEGORY } from "./cover-design";

// One unit per character: enough to check where lines break.
const chars = (s: string) => [...s].length;

describe("card text", () => {
  test("breaks at spaces and balances the lines", () => {
    // Greedy would give "aaa bbb ccc" / "ddd"; balanced, two even lines.
    assert.deepEqual(wrapText(chars, "aaa bbb ccc ddd", 11, 3), ["aaa bbb", "ccc ddd"]);
    assert.deepEqual(wrapText(chars, "short", 11, 3), ["short"]);
  });

  test("past the last line, an ellipsis", () => {
    const lines = wrapText(chars, "one two three four five six", 9, 2);
    assert.equal(lines.length, 2);
    assert.ok(lines[1].endsWith("…"));
    assert.ok(lines.every((l) => chars(l) <= 9));
  });

  test("a word longer than the line breaks between letters, never inside one", () => {
    const lines = wrapText(chars, "স্ত্রীলোকদিগের", 4, 6);
    assert.equal(lines.join(""), "স্ত্রীলোকদিগের");
    // Each piece is whole graphemes: none starts with a vowel sign or a hasanta.
    for (const l of lines) assert.doesNotMatch(l, /^[া-্]/u);
  });
});

describe("book cards", () => {
  const book = (slug: string) => ({
    id: `${slug}-test-book`,
    title: "Pasara",
    titleBangla: "পসরা",
    author: "হেমেন্দ্রকুমার রায়",
    coverPublicId: null,
    category: { slug, colorKey: "cloth", nameBangla: "ছোটগল্প" },
  });

  test("every cover family draws, its colours resolved and its text as outlines", async () => {
    for (const slug of [...Object.keys(FAMILY_BY_CATEGORY), "onnanno"]) {
      const { svg, complete } = await bookCardSvg(book(slug));
      assert.equal(complete, true);
      assert.doesNotMatch(svg, /currentColor|var\(--|<text/, slug);
    }
  });

  test("renders a 1200 x 630 JPEG", async () => {
    const { svg } = await bookCardSvg(book("uponnash"));
    const meta = await sharp(await renderJpeg(svg)).metadata();
    assert.deepEqual([meta.format, meta.width, meta.height], ["jpeg", 1200, 630]);
  });
});

describe("link-preview tags", () => {
  const shared = {
    id: "chhotogolpo-pasara",
    title: "Pasara",
    titleBangla: "পসরা",
    author: "হেমেন্দ্রকুমার রায়",
    description: "হেমেন্দ্রকুমার রায়ের ছোটগল্পের বই।",
    coverPublicId: "covers/chhotogolpo-pasara-mvmphx03",
    category: { slug: "chhotogolpo", colorKey: "cloth", nameBangla: "ছোটগল্প" },
  };

  test("a book's preview: its title and author, description and card", () => {
    const m = bookShareMetadata(shared, "/books/chhotogolpo-pasara");
    const og = m.openGraph as Record<string, unknown> & { images: { url: string; width: number; height: number }[] };
    assert.equal(og.title, "পসরা — হেমেন্দ্রকুমার রায়");
    assert.equal(og.description, shared.description);
    assert.equal(og.url, "/books/chhotogolpo-pasara");
    assert.equal(og.siteName, "বই মহল");
    assert.deepEqual([og.images[0].width, og.images[0].height], [1200, 630]);
    assert.match(og.images[0].url, /^\/share\/books\/chhotogolpo-pasara\?v=[0-9a-z]+$/);
    assert.equal((m.twitter as { card: string }).card, "summary_large_image");
  });

  test("the card's address changes with what it draws, not with the description", () => {
    const v = cardVersion(shared);
    assert.equal(cardVersion({ ...shared, description: "অন্য বিবরণ" } as typeof shared), v);
    assert.notEqual(cardVersion({ ...shared, author: "প্রসাদদাস রায়" }), v);
    assert.notEqual(cardVersion({ ...shared, coverPublicId: null }), v);
    assert.equal(bookCardUrl(shared), `/share/books/chhotogolpo-pasara?v=${v}`);
  });

  test("the site-wide preview has no page address of its own", () => {
    const og = siteShareMetadata.openGraph as Record<string, unknown>;
    assert.equal(og.title, "বই মহল");
    assert.equal(og.url, undefined);
    assert.deepEqual(og.images, [SITE_SHARE_IMAGE]);
  });

  test("long descriptions are cut at a word", () => {
    const long = "শব্দ ".repeat(80).trim();
    const cut = previewText(long, 50);
    assert.ok(cut.endsWith("…") && cut.length <= 51);
    assert.ok(!cut.slice(0, -1).endsWith("শব"));
  });
});
