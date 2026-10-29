import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { checkUploaded, COVER_SIZES, coverSourceLabel, coverSrcSet, coverUrl, isAllowedCoverSourceUrl, MAX_COVER_BYTES, parseCoverUrl } from "./covers";
import nextConfig from "../../next.config.js";

describe("cover URLs: allowed sources", () => {
  test("a Commons image is fetched as is and credited to its file page", () => {
    const r = parseCoverUrl("https://upload.wikimedia.org/wikipedia/commons/a/ab/Gora_title_page.jpg");
    assert.deepEqual(r, {
      ok: true,
      site: "wikimedia",
      fetchUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Gora_title_page.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Gora_title_page.jpg",
    });
  });

  test("a rendered page of a PDF scan goes through Wikimedia's thumbnail host and keeps its page", () => {
    const r = parseCoverUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Gora.pdf/page5-960px-Gora.pdf.jpg");
    assert.ok(r.ok && r.site === "wikimedia");
    assert.equal(r.fetchUrl, "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Gora.pdf/page5-960px-Gora.pdf.jpg");
    assert.equal(r.sourceUrl, "https://commons.wikimedia.org/wiki/File:Gora.pdf?page=5");
  });

  test("a DjVu page kept on Bangla Wikisource is credited to Wikisource, Bangla name intact", () => {
    const name = encodeURIComponent("গোরা.djvu");
    const r = parseCoverUrl(`https://upload.wikimedia.org/wikisource/bn/thumb/1/1a/${name}/page3-960px-${name}.jpg`);
    assert.ok(r.ok && r.site === "wikimedia");
    assert.equal(r.sourceUrl, `https://bn.wikisource.org/wiki/File:${name}?page=3`);
  });

  test("a whole PDF is not an image", () => {
    const r = parseCoverUrl("https://upload.wikimedia.org/wikipedia/commons/a/ab/Gora.pdf");
    assert.equal(r.ok, false);
  });

  test("a Commons file page, with ?page= for a scan", () => {
    assert.deepEqual(parseCoverUrl("https://commons.wikimedia.org/wiki/File:Pather_Panchali_1929.pdf?page=7"), {
      ok: true,
      site: "commons-page",
      file: "Pather Panchali 1929.pdf",
      page: 7,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Pather_Panchali_1929.pdf?page=7",
    });
    const r = parseCoverUrl("https://commons.wikimedia.org/w/index.php?title=File:Gora.djvu&page=2");
    assert.ok(r.ok && r.site === "commons-page" && r.file === "Gora.djvu" && r.page === 2);
    assert.equal(parseCoverUrl("https://commons.wikimedia.org/wiki/Category:Book_covers").ok, false);
  });

  test("a Gutenberg cover is credited to the ebook's page", () => {
    for (const url of [
      "https://www.gutenberg.org/cache/epub/120/images/cover.jpg",
      "https://gutenberg.org/cache/epub/120/pg120.cover.medium.jpg",
      "https://www.gutenberg.org/files/120/120-h/images/cover.jpg",
    ]) {
      const r = parseCoverUrl(url);
      assert.ok(r.ok && r.site === "gutenberg", url);
      assert.equal(r.sourceUrl, "https://www.gutenberg.org/ebooks/120");
      assert.ok(r.fetchUrl.startsWith("https://www.gutenberg.org/"));
    }
  });

  test("anything else is refused, in Bangla", () => {
    for (const url of [
      "http://upload.wikimedia.org/wikipedia/commons/a/ab/X.jpg",
      "https://upload.wikimedia.org.evil.example/wikipedia/commons/a/ab/X.jpg",
      "https://upload.wikimedia.org@evil.example/wikipedia/commons/a/ab/X.jpg",
      "https://upload.wikimedia.org:8443/wikipedia/commons/a/ab/X.jpg",
      "https://upload.wikimedia.org/wikipedia/en/a/ab/Modern_cover.jpg",
      "https://en.wikipedia.org/wiki/File:Gora.jpg",
      "https://m.media-amazon.com/images/I/cover.jpg",
      "https://www.rokomari.com/book/1/cover.jpg",
      "https://gutenberg.pglaf.org/cache/epub/120/pg120.cover.medium.jpg",
      "https://www.gutenberg.org/ebooks/120",
      "https://www.gutenberg.org/cache/epub/120/../../../etc/x.jpg",
      "not a url",
    ]) {
      const r = parseCoverUrl(url);
      assert.equal(r.ok, false, url);
      assert.ok(!r.ok && /[ঀ-৿]/.test(r.error), url);
    }
  });

  test("an uploaded image's source page must be on an allowed site", () => {
    assert.ok(isAllowedCoverSourceUrl("https://commons.wikimedia.org/wiki/File:Gora.pdf?page=3"));
    assert.ok(isAllowedCoverSourceUrl("https://bn.wikisource.org/wiki/File:X.djvu"));
    assert.ok(isAllowedCoverSourceUrl("https://www.gutenberg.org/ebooks/120"));
    assert.equal(isAllowedCoverSourceUrl("http://commons.wikimedia.org/wiki/File:X.jpg"), false);
    assert.equal(isAllowedCoverSourceUrl("https://www.goodreads.com/book/show/1"), false);
    assert.equal(isAllowedCoverSourceUrl(""), false);
  });

  test("the credit names the site", () => {
    assert.equal(coverSourceLabel("https://commons.wikimedia.org/wiki/File:X.pdf?page=2"), "উইকিমিডিয়া কমন্স");
    assert.equal(coverSourceLabel("https://bn.wikisource.org/wiki/File:X.djvu"), "উইকিসংকলন");
    assert.equal(coverSourceLabel("https://www.gutenberg.org/ebooks/120"), "প্রজেক্ট গুটেনবার্গ");
  });
});

describe("cover delivery", () => {
  test("Cloudinary picks format and quality, crops to the frame and sizes per use", () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "demo";
    assert.equal(coverUrl("covers/gora-1", 240), "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_lfill,ar_2:3,g_center,w_240/covers/gora-1");
    const set = coverSrcSet("covers/gora-1", [160, 320]);
    assert.match(set, /w_160\/covers\/gora-1 160w, .*w_320\/covers\/gora-1 320w$/);
  });
});

describe("uploaded covers", () => {
  const good = { public_id: "covers/gora-1", format: "jpg", bytes: 120_000, width: 960, height: 1440 };

  test("a book-shaped image in the covers folder passes", () => {
    assert.equal(checkUploaded(good), null);
  });

  test("wrong folder, format, size or shape is refused", () => {
    assert.ok(checkUploaded({ ...good, public_id: "library/gora" }));
    assert.ok(checkUploaded({ ...good, format: "gif" }));
    assert.ok(checkUploaded({ ...good, format: "pdf" }));
    assert.ok(checkUploaded({ ...good, bytes: MAX_COVER_BYTES + 1 }));
    assert.ok(checkUploaded({ ...good, bytes: 0 }));
    assert.ok(checkUploaded({ ...good, width: 100, height: 150 }));
    assert.ok(checkUploaded({ ...good, width: 1920, height: 1300 }), "a two-page spread");
    assert.ok(checkUploaded({ ...good, width: 300, height: 1400 }), "a strip");
  });
});

describe("the day's cover through the site's own address", () => {
  test("it is a same-site path with the covers' transformation", () => {
    assert.equal(coverUrl("covers/gora-1", 340, true), "/cover-image/f_auto,q_auto,c_lfill,ar_2:3,g_center,w_340/covers/gora-1");
  });

  test("the /cover-image rewrite allows exactly the day cover's widths, and only covers", async () => {
    const [rule] = (await nextConfig.rewrites!()) as { source: string }[];
    const widths = rule.source.match(/w_\(\?:([\d|]+)\)/)?.[1].split("|").map(Number);
    assert.deepEqual(widths, [...COVER_SIZES.today.widths]);
    assert.match(rule.source, /\/covers\/:file$/);
  });
});
