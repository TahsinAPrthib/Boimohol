import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { BOOK_TOKEN, mentionsGutenberg, parseGutenbergHtml } from "./gutenberg/parse";
import { gutenbergEbookId, readableHere } from "./gutenberg/source";
import { readerSource } from "./reader/source";
import lists from "./gutenberg/lists.json";
import { OPENING, shortLabel, tocRows } from "./reader/toc";

// A book as Project Gutenberg's generated HTML lays it out: the licence
// header and the START line, the text, the END line and the licence footer.
const LICENCE =
  "This eBook is for the use of anyone anywhere in the United States and most other parts of the world at no cost. You may copy it under the terms of the Project Gutenberg License included with this eBook or online at www.gutenberg.org.";
function book(body: string, css = "") {
  return `<!DOCTYPE html><html><head><title>The Project Gutenberg eBook of A Test</title><style>${css}</style></head><body>
<header class="pg-boilerplate pgheader" id="pg-header"><h2 id="pg-header-heading">The Project Gutenberg eBook of A Test</h2><div>${LICENCE}</div></header>
<div id="pg-start-separator"><span>*** START OF THE PROJECT GUTENBERG EBOOK A TEST ***</span></div>
${body}
<div id="pg-end-separator"><span>*** END OF THE PROJECT GUTENBERG EBOOK A TEST ***</span></div>
<footer class="pg-boilerplate" id="pg-footer"><h2>THE FULL PROJECT GUTENBERG™ LICENSE</h2><p>${LICENCE}</p></footer>
</body></html>`;
}
const words = (n: number, tag = "w") => Array.from({ length: n }, (_, i) => `${tag}${i}`).join(" ");
const para = (n: number, size = 60) => `<p>${words(size, `p${n}x`)}</p>`;
const paras = (count: number, size = 60) => Array.from({ length: count }, (_, i) => para(i, size)).join("\n");
const chapter = (title: string, body: string) => `<div class="chapter"><h2>${title}</h2>${body}</div>`;
const allText = (b: ReturnType<typeof parseGutenbergHtml>) => [b.front, ...b.pages.map((p) => p.html)].join("\n");

describe("Gutenberg books: what is removed", () => {
  test("the licence sections and every mention of Project Gutenberg go; the rest of the passage's text stays", () => {
    const b = parseGutenbergHtml(
      book(`<h1>A Test</h1>
${chapter("Preface to the Project Gutenberg Edition", paras(5))}
${chapter("CHAPTER I", `${paras(5)}<p>Produced by a volunteer for Project Gutenberg.</p><p>See <a href="https://www.gutenberg.org/ebooks/2">another book</a> for more.</p>`)}
${chapter("CHAPTER II", paras(5))}`)
    );
    const text = allText(b);
    assert.equal(mentionsGutenberg(text), false);
    assert.doesNotMatch(text, /for the use of anyone|START OF THE|END OF THE|LICENSE/);
    // The section titled after them goes whole; the chapters stay.
    assert.deepEqual(
      b.pages.map((p) => p.label),
      ["CHAPTER I", "CHAPTER II"]
    );
    assert.doesNotMatch(text, /Preface/);
    assert.equal((text.match(/<p>p0x0 /g) ?? []).length, 2);
    // A link to their site keeps its words, not the link.
    assert.match(b.pages[0].html, /another book/);
    assert.doesNotMatch(b.pages[0].html, /href="https:\/\/www\.gutenberg/);
  });
});

describe("Gutenberg books: chapters", () => {
  test("clean chapters: one page per chapter block, titled by its heading", () => {
    const b = parseGutenbergHtml(book(`<h1>A Test</h1>${chapter("CHAPTER I. The Start", paras(10))}${chapter("CHAPTER II. The End", paras(10))}`));
    assert.deepEqual(
      b.pages.map((p) => [p.label, p.group]),
      [
        ["CHAPTER I. The Start", null],
        ["CHAPTER II. The End", null],
      ]
    );
    // The page doesn't repeat the heading the reader prints over it.
    assert.doesNotMatch(b.pages[0].html, /CHAPTER I/);
  });

  test("chapters one heading level down: a long part is split at its h3s, which it then heads", () => {
    // About 60 KB in all: over a page, so the part is split. Empty wrappers
    // and anchors stand between the part's title and its first chapter, as
    // in The Little Shepherd of Kingdom Come.
    const chapters = Array.from({ length: 8 }, (_, i) => `<div><a id="c${i + 1}"></a></div><h3>CHAPTER ${i + 1}</h3><h3>Title ${i + 1}</h3>${paras(20)}`).join("\n");
    const b = parseGutenbergHtml(
      book(`<h1>A Test</h1><h2>By Someone</h2><h2>CONTENTS</h2><p><a href="#c1">CHAPTER 1</a></p><h2>THE STORY</h2><div><br></div><div><br></div>${chapters}`)
    );
    assert.deepEqual(
      b.pages.map((p) => p.label),
      Array.from({ length: 8 }, (_, i) => `CHAPTER ${i + 1} — Title ${i + 1}`)
    );
    assert.ok(b.pages.every((p) => p.group === "THE STORY"));
    assert.doesNotMatch(b.pages[0].html, /THE STORY|CHAPTER 1/);
  });

  test("part titles head the chapters after them; a motto under one opens its first chapter", () => {
    const b = parseGutenbergHtml(
      book(
        `<h1>A Test</h1>${chapter("PART I", "")}${chapter("CHAPTER I", paras(4))}${chapter("CHAPTER II", paras(4))}${chapter("PART II", "<p>Fortune favours the bold.</p>")}${chapter("CHAPTER I", paras(4))}`
      )
    );
    assert.deepEqual(
      b.pages.map((p) => `${p.group}/${p.label}`),
      ["PART I/CHAPTER I", "PART I/CHAPTER II", "PART II/CHAPTER I"]
    );
    assert.match(b.pages[2].html, /^<p>Fortune favours the bold\.<\/p>\s*<p>p0x0/);
  });

  test("a long chapter split at its sections: a subtitle joins the first section; a longer opening is a page of its own", () => {
    const sections = (n: number) => Array.from({ length: n }, (_, i) => `<h4>${"I".repeat(i + 1)}</h4>${paras(50)}`).join("");
    const b = parseGutenbergHtml(
      book(`<h1>A Test</h1>${chapter("CHAPTER I", `<p>THE COMIC IN GENERAL</p>${paras(6)}${sections(3)}`)}${chapter("CHAPTER II", `<p>THE COMIC IN WORDS</p>${sections(3)}`)}`)
    );
    assert.deepEqual(
      b.pages.map((p) => `${p.group}/${p.label}`),
      ["CHAPTER I/CHAPTER I", "CHAPTER I/I", "CHAPTER I/II", "CHAPTER I/III", "CHAPTER II/I", "CHAPTER II/II", "CHAPTER II/III"]
    );
    assert.match(b.pages[0].html, /^<p>THE COMIC IN GENERAL<\/p>/);
    assert.match(b.pages[4].html, /^<p>THE COMIC IN WORDS<\/p>\s*<p>p0x0/);
    // The contents and the page call the first "the opening" of its chapter.
    assert.equal(shortLabel(b.pages[0].label, b.pages[0].group), OPENING);
  });

  test("the last chapter keeps its title when a transcriber's note follows its block", () => {
    const b = parseGutenbergHtml(
      book(`<h1>A Test</h1>${chapter("BOOK I", paras(5))}${chapter("BOOK II", paras(180))}<div class="tnote"><b>Transcriber's Notes</b><p>A note.</p></div>`)
    );
    const last = b.pages.filter((p) => p.label.startsWith("BOOK II"));
    assert.ok(last.length >= 2, b.pages.map((p) => p.label).join(" / "));
    assert.equal(last[0].label, "BOOK II — অংশ ১");
    assert.doesNotMatch(last[0].html, /BOOK II/);
    assert.match(last[last.length - 1].html, /A note\./);
    assert.ok(b.pages.every((p) => !/^অংশ/.test(p.label)));
  });

  test("a long chapter without sub-headings is cut by size, at paragraph breaks only", () => {
    const b = parseGutenbergHtml(book(`<h1>A Test</h1>${chapter("BOOK I", paras(180))}${chapter("BOOK II", paras(5))}`));
    const parts = b.pages.filter((p) => p.label.startsWith("BOOK I —"));
    assert.ok(parts.length >= 2, `${parts.length} parts`);
    assert.equal(parts[0].label, "BOOK I — অংশ ১");
    // Under its own title in the contents, as "অংশ ১".
    assert.equal(parts[0].group, "BOOK I");
    assert.equal(shortLabel(parts[0].label, parts[0].group), "অংশ ১");
    assert.ok(parts.every((p) => p.html.length < 45_000));
    // Every paragraph arrives whole, once.
    const count = parts.reduce((n, p) => n + (p.html.match(/<p>/g) ?? []).length, 0);
    assert.equal(count, 180);
  });
});

describe("Gutenberg books: links, front page, layout", () => {
  test("footnote links reach the page their note is on", () => {
    const b = parseGutenbergHtml(
      book(`<h1>A Test</h1>
${chapter("CHAPTER I", `${paras(3)}<p>A claim<a href="#note1" id="ref1">[1]</a> and <a href="#here">a link here</a> and <a href="#nowhere">a dead one</a>.</p><p id="here">here</p>`)}
${chapter("NOTES", `<p id="note1"><a href="#ref1">[1]</a> The note.</p>${paras(2)}`)}`)
    );
    const [one, notes] = b.pages;
    assert.match(one.html, new RegExp(`href="/books/${BOOK_TOKEN}/read/2#gb-note1"`));
    assert.match(one.html, /href="#gb-here"/);
    assert.match(one.html, /id="gb-here"/);
    assert.doesNotMatch(one.html, /nowhere/);
    assert.match(notes.html, new RegExp(`href="/books/${BOOK_TOKEN}/read/1#gb-ref1"`));
  });

  test("a note marked in a chapter's title: the title leaves the marker out, and the note's link back still lands", () => {
    const b = parseGutenbergHtml(
      book(`<h1>A Test</h1>
<div class="chapter"><h2><a id="chap18"></a>CHAPTER XVIII.<a href="#fn-18.1" id="fnref-18.1"><sup>[1]</sup></a><br>ON KEEPING FAITH</h2><p><a id="fn-18.1"></a><a href="#fnref-18.1">[1]</a> A note.</p>${paras(3)}</div>
${chapter("CHAPTER XIX.", paras(3))}`)
    );
    assert.equal(b.pages[0].label, "CHAPTER XVIII. ON KEEPING FAITH");
    assert.match(b.pages[0].html, /href="#gb-fnref-18\.1"/);
    assert.match(b.pages[0].html, /id="gb-fnref-18\.1"/);
    assert.match(b.pages[0].html, /id="gb-chap18"/);
    assert.doesNotMatch(b.pages[0].html, /CHAPTER XVIII/);
  });

  test("the front page keeps the title page, not the book's own contents list; a byline titles nothing", () => {
    const b = parseGutenbergHtml(
      book(`<h1>A Test</h1><h2>By Some Author</h2><p>To my mother.</p><h2>Contents</h2><p><a href="#c1">CHAPTER I</a></p><p><a href="#c2">CHAPTER II</a></p>
<h2 id="c1">CHAPTER I</h2>${paras(4)}<h2 id="c2">CHAPTER II</h2>${paras(4)}`)
    );
    assert.match(b.front, /To my mother/);
    assert.doesNotMatch(b.front, /Contents|href=/);
    assert.deepEqual(
      b.pages.map((p) => p.label),
      ["CHAPTER I", "CHAPTER II"]
    );
  });

  test("printed page numbers lose their text and keep their anchors", () => {
    const b = parseGutenbergHtml(book(`${chapter("CHAPTER I", `<p>Before<span class="pagenum"><a id="page_5">{5}</a></span> after.</p>${paras(2)}`)}${chapter("CHAPTER II", paras(2))}`));
    assert.doesNotMatch(b.pages[0].html, /\{5\}/);
    assert.match(b.pages[0].html, /id="gb-page_5"/);
  });

  test("text only, laid out with the reader's classes from the book's own stylesheet", () => {
    const b = parseGutenbergHtml(
      book(
        `${chapter("CHAPTER I", `<div class="figcenter"><img src="images/a.jpg" alt="A ship"><p class="caption">The ship.</p></div><p class="ctr">Centred.</p><p class="hide">Hidden.</p><p style="font-variant: small-caps">Caps.</p>${paras(2)}`)}${chapter("CHAPTER II", paras(2))}`,
        ".ctr { text-align: center } p.hide { display: none }"
      )
    );
    const html = b.pages[0].html;
    assert.equal(b.images, 1);
    assert.doesNotMatch(html, /<img|images\/a\.jpg/);
    assert.match(html, /The ship\./);
    assert.match(html, /<p class="ws-center">Centred\.<\/p>/);
    assert.doesNotMatch(html, /Hidden/);
    assert.match(html, /<p class="ws-smallcaps">Caps\.<\/p>/);
    assert.doesNotMatch(html, /style=|class="(ctr|caption|figcenter)"/);
  });

  test("the text's language is the one Gutenberg declares for it", () => {
    const body = `${chapter("CHAPTER I", paras(2))}${chapter("CHAPTER II", paras(2))}`;
    assert.equal(parseGutenbergHtml(book(body).replace("<html>", '<html lang="fr">')).lang, "fr");
    assert.equal(parseGutenbergHtml(book(body).replace("<head>", '<head><meta name="DC.language" content="bn">')).lang, "bn");
    assert.equal(parseGutenbergHtml(book(body).replace("<html>", '<html lang="en"><!-- x" -->')).lang, "en");
    assert.equal(parseGutenbergHtml(book(body).replace("<html>", '<html lang="not a language">')).lang, null);
    assert.equal(parseGutenbergHtml(book(body)).lang, null);
  });
});

describe("the contents", () => {
  const entry = (path: number, label: string, group: string | null) => ({ path: String(path), label, group });
  const shape = (rows: ReturnType<typeof tocRows>) =>
    rows.map((r) => (r.kind === "group" ? `# ${r.name}` : r.kind === "entry" ? r.label : `${r.title ?? "-"}: ${r.parts.map((p) => p.number).join(" ")}`));

  test("a section cut into parts by size: its heading once, then one row of numbers", () => {
    const b = parseGutenbergHtml(book(`<h1>A Test</h1>${chapter("INTRODUCTION", paras(180))}${chapter("BOOK I", paras(5))}${chapter("BOOK II", paras(5))}`));
    const rows = tocRows(b.pages.map((p, i) => entry(i + 1, p.label, p.group)));
    const parts = b.pages.filter((p) => p.group === "INTRODUCTION").length;
    assert.ok(parts >= 3, `${parts} parts`);
    assert.deepEqual(shape(rows), ["# INTRODUCTION", `-: ${["১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"].slice(0, parts).join(" ")}`, "BOOK I", "BOOK II"]);
    const row = rows[1];
    assert.ok(row.kind === "parts" && row.parts[0].entry.label === "INTRODUCTION — অংশ ১" && row.parts[0].entry.path === "1");
  });

  test("a chapter cut into parts under a part's heading keeps its own title over the numbers", () => {
    const rows = tocRows([
      entry(1, "CHAPTER I", "PART I"),
      entry(2, "CHAPTER II — অংশ ১", "PART I"),
      entry(3, "CHAPTER II — অংশ ২", "PART I"),
      entry(4, "CHAPTER III", "PART I"),
      entry(5, "CHAPTER I — অংশ ১", "PART II"),
      entry(6, "CHAPTER I — অংশ ২", "PART II"),
    ]);
    assert.deepEqual(shape(rows), ["# PART I", "CHAPTER I", "CHAPTER II: ১ ২", "CHAPTER III", "# PART II", "CHAPTER I: ১ ২"]);
  });

  test("a book without headings is one row of numbers; Wikisource's contents are left as they are", () => {
    assert.deepEqual(shape(tocRows([1, 2, 3].map((n) => entry(n, `অংশ ${"০১২৩"[n]}`, null)))), ["-: ১ ২ ৩"]);
    const wikisource = tocRows([
      { path: "অংশ ১", label: "অংশ ১" },
      { path: "অংশ ২", label: "অংশ ২" },
    ]);
    assert.deepEqual(shape(wikisource), ["অংশ ১", "অংশ ২"]);
  });
});

describe("which books the reader takes from Gutenberg", () => {
  test("only the landing-page links the catalog stores", () => {
    assert.equal(gutenbergEbookId("https://www.gutenberg.org/ebooks/1342"), 1342);
    assert.equal(gutenbergEbookId("https://www.gutenberg.org/files/1342/1342-h/1342-h.htm"), null);
    assert.equal(gutenbergEbookId("https://example.com/ebooks/1342"), null);
  });

  test("link-only books aren't read here; the seed list's are", () => {
    assert.equal(readableHere(lists.linkOnly[0]), false);
    assert.equal(readableHere(lists.seed[0]), true);
    assert.equal(lists.seed.length, 1000);
    assert.ok(!lists.seed.some((id) => lists.linkOnly.includes(id)));
  });

  test("Bangla Wikisource first; Gutenberg only once the texts database is configured", () => {
    const base = { isPublicDomain: true, authorDeathYear: 1900 };
    const gutenberg = { kind: "GUTENBERG", url: `https://www.gutenberg.org/ebooks/${lists.seed[0]}` };
    const wikisource = { kind: "WIKISOURCE", url: "https://bn.wikisource.org/wiki/গোরা" };
    const saved = process.env.TEXTS_DATABASE_URL;
    try {
      delete process.env.TEXTS_DATABASE_URL;
      assert.equal(readerSource({ ...base, sources: [gutenberg] }), null);
      process.env.TEXTS_DATABASE_URL = "postgres://texts.example/db";
      assert.deepEqual(readerSource({ ...base, sources: [gutenberg] }), { kind: "gutenberg", ebookId: lists.seed[0], url: gutenberg.url });
      assert.equal(readerSource({ ...base, sources: [gutenberg, wikisource] })?.kind, "wikisource");
      assert.equal(readerSource({ ...base, authorDeathYear: 2000, sources: [gutenberg] }), null);
      assert.equal(readerSource({ ...base, sources: [{ kind: "GUTENBERG", url: `https://www.gutenberg.org/ebooks/${lists.linkOnly[0]}` }] }), null);
    } finally {
      if (saved === undefined) delete process.env.TEXTS_DATABASE_URL;
      else process.env.TEXTS_DATABASE_URL = saved;
    }
  });
});
