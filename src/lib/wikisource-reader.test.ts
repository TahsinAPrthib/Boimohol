import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { imageSource, linksBelow, rewriteHref, sanitizeWikisourceHtml, scanFiles } from "./wikisource/sanitize";
import { pathFromSegments, pathInWork, readerHref, workRootFromUrl, wikisourceUrl } from "./wikisource/titles";

const ctx = { bookId: "uponnash-gora", root: "গোরা", current: "গোরা/১" };
const clean = (html: string) => sanitizeWikisourceHtml(html, ctx).html;
const wiki = (title: string) => `/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;

// Nothing executable may survive, whatever the markup.
function assertInert(out: string) {
  assert.doesNotMatch(out, /<script|<style|<iframe|<object|<embed|<form|<input|<button|<svg|<math|<base|<meta|<link|<template|<textarea|<noscript/i, out);
  assert.doesNotMatch(out, /\son[a-z]+\s*=/i, out);
  assert.doesNotMatch(out, /javascript:|vbscript:|data:/i, out);
  assert.doesNotMatch(out, /\sstyle\s*=/i, out);
  assert.doesNotMatch(out, /\ssrcset\s*=/i, out);
  for (const m of out.matchAll(/<img[^>]*\ssrc="([^"]*)"/g)) assert.match(m[1], /^https:\/\/upload\.wikimedia\.org\//, out);
}

describe("sanitizer: malicious HTML", () => {
  const attacks: [string, string][] = [
    ["script", `<p>a</p><script>alert(1)</script><p>b</p>`],
    ["script, uppercase and attributes", `<SCRIPT type="text/javascript" src="https://evil.example/x.js"></SCRIPT>`],
    ["img onerror, bad src", `<img src=x onerror=alert(1)>`],
    ["img onerror, allowed src", `<img src="https://upload.wikimedia.org/a.png" onerror="alert(1)" onload="alert(2)">`],
    ["javascript: link", `<a href="javascript:alert(1)">x</a>`],
    ["javascript: link, mixed case", `<a href="JaVaScRiPt:alert(1)">x</a>`],
    ["javascript: link with a tab", `<a href="java\tscript:alert(1)">x</a>`],
    ["javascript: link, entity-encoded", `<a href="&#106;avascript:alert(1)">x</a>`],
    ["javascript: link, leading space", `<a href=" javascript:alert(1)">x</a>`],
    ["data: link", `<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>`],
    ["vbscript: link", `<a href="vbscript:msgbox(1)">x</a>`],
    ["svg onload", `<svg onload=alert(1)><script>alert(2)</script></svg>`],
    ["svg animate", `<svg><a><animate attributeName="href" values="javascript:alert(1)"/><text y="20">x</text></a></svg>`],
    ["iframe", `<iframe src="https://evil.example/" srcdoc="<script>alert(1)</script>"></iframe>`],
    ["object and embed", `<object data="https://evil.example/x.swf"></object><embed src="https://evil.example/x.swf">`],
    ["form", `<form action="https://evil.example/"><input name="p" type="password"><button formaction="javascript:alert(1)">ok</button></form>`],
    ["style element", `<style>body{display:none}</style><p>x</p>`],
    ["style attribute", `<p style="background:url(javascript:alert(1));position:fixed;inset:0">x</p>`],
    ["event handlers", `<div onclick="alert(1)" onmouseover="alert(2)"><p onfocus="alert(3)" tabindex="0">x</p></div>`],
    ["mXSS via math/style", `<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>`],
    ["noscript breakout", `<noscript><p title="</noscript><img src=x onerror=alert(1)>"></noscript>`],
    ["textarea breakout", `<textarea></textarea/><img src=x onerror=alert(1)></textarea>`],
    ["xmp", `<xmp><img src=x onerror=alert(1)></xmp>`],
    ["template", `<template><img src=x onerror=alert(1)></template>`],
    ["base and meta refresh", `<base href="https://evil.example/"><meta http-equiv="refresh" content="0;url=javascript:alert(1)"><link rel="stylesheet" href="https://evil.example/x.css">`],
    ["srcset", `<img src="https://upload.wikimedia.org/a.png" srcset="https://evil.example/x.png 2x">`],
    ["data: image", `<img src="data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+">`],
    ["attribute breakout", `<img src="https://upload.wikimedia.org/a.png&quot; onerror=&quot;alert(1)">`],
    ["unclosed tags", `<p>a<b>b<i>c<a href="javascript:alert(1)">d`],
    ["video poster", `<video poster="javascript:alert(1)"><source src="https://evil.example/x.mp4"></video>`],
    ["details ontoggle", `<details open ontoggle="alert(1)"><summary>x</summary></details>`],
    ["dialog", `<dialog open onclose="alert(1)">x</dialog>`],
  ];
  for (const [name, html] of attacks) {
    test(name, () => assertInert(clean(html)));
  }

  test("script and style text don't leak as text", () => {
    const out = clean(`<script>var secret = 1;</script><style>.x{}</style><p>ok</p>`);
    assert.doesNotMatch(out, /secret|\.x\{/);
    assert.match(out, /<p>ok<\/p>/);
  });

  test("escaped markup stays text", () => {
    assert.equal(clean(`<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>`), `<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>`);
  });

  test("ids are prefixed, so a page can't shadow ours", () => {
    const out = clean(`<p id="__next">a</p><a id="location">b</a>`);
    assert.match(out, /id="ws-__next"/);
    assert.match(out, /id="ws-location"/);
    assert.doesNotMatch(out, /id="(__next|location)"/);
  });

  test("only our own classes survive", () => {
    const out = clean(`<div class="fixed inset-0 z-50 btn-primary wst-center">x</div>`);
    assert.equal(out, `<div class="ws-center">x</div>`);
  });

  test("deep nesting doesn't break it", () => {
    const deep = "<div>".repeat(5000) + "x" + "</div>".repeat(5000);
    assertInert(clean(deep));
  });
});

describe("sanitizer: links", () => {
  test("a link within the work goes to the reader", () => {
    assert.equal(clean(`<a href="${wiki("গোরা/২")}">পরের</a>`), `<a href="/books/uponnash-gora/read/%E0%A6%A8">পরের</a>`.replace("%E0%A6%A8", encodeURIComponent("২")));
    assert.equal(clean(`<a href="${wiki("গোরা")}">সূচি</a>`), `<a href="/books/uponnash-gora/read">সূচি</a>`);
  });

  test("a link to another Wikisource page goes to Wikisource, in a new tab", () => {
    const out = clean(`<a href="${wiki("লেখক:রবীন্দ্রনাথ ঠাকুর")}">রবীন্দ্রনাথ</a>`);
    assert.match(out, /^<a href="https:\/\/bn\.wikisource\.org\/wiki\/[^"]+" target="_blank" rel="noopener noreferrer nofollow" class="ws-external">রবীন্দ্রনাথ<\/a>$/);
  });

  test("full and protocol-relative Wikisource URLs are understood", () => {
    assert.equal(rewriteHref(`//bn.wikisource.org${wiki("গোরা/৩")}`, ctx)?.href, readerHref(ctx.bookId, "৩"));
    assert.equal(rewriteHref(`http://bn.wikisource.org${wiki("গোরা/৩")}`, ctx)?.href, readerHref(ctx.bookId, "৩"));
  });

  test("links to other sites, red links and edit links become plain text", () => {
    assert.equal(clean(`<a href="https://evil.example/">x</a>`), `<span>x</span>`);
    assert.equal(clean(`<a href="//evil.example/">x</a>`), `<span>x</span>`);
    assert.equal(clean(`<a href="https://bn.wikisource.org.evil.example/wiki/X">x</a>`), `<span>x</span>`);
    assert.equal(clean(`<a href="https://en.wikipedia.org/wiki/X">x</a>`), `<span>x</span>`);
    assert.equal(clean(`<a href="/w/index.php?title=X&amp;action=edit&amp;redlink=1">x</a>`), `<span>x</span>`);
  });

  test("in-page anchors follow the prefixed ids", () => {
    assert.equal(clean(`<a href="#cite_note-1">[১]</a>`), `<a href="#ws-cite_note-1">[১]</a>`);
    assert.equal(rewriteHref(`${wiki("গোরা/১")}#cite_note-2`, ctx)?.href, "#ws-cite_note-2");
  });

  test("a page's own target and rel are replaced", () => {
    const out = clean(`<a href="${wiki("লেখক:X")}" target="_top" rel="opener">x</a>`);
    assert.match(out, /target="_blank" rel="noopener noreferrer nofollow"/);
    assert.doesNotMatch(out, /_top|opener"/);
  });
});

describe("sanitizer: images", () => {
  test("only upload.wikimedia.org, over https", () => {
    assert.equal(imageSource("//upload.wikimedia.org/wikipedia/commons/a/ab/X.png"), "https://upload.wikimedia.org/wikipedia/commons/a/ab/X.png");
    assert.equal(imageSource("//thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/X.jpg/120px-X.jpg?utm_source=x"), "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/X.jpg/120px-X.jpg");
    for (const bad of ["http://upload.wikimedia.org/a.png", "https://evil.example/a.png", "https://upload.wikimedia.org.evil.example/a.png", "https://user@upload.wikimedia.org/a.png", "https://upload.wikimedia.org:8443/a.png", "data:image/png;base64,AAAA", "/a.png", "x"]) {
      assert.equal(imageSource(bad), null, bad);
    }
  });

  test("an allowed image keeps size and alt, loads lazily, sends no referrer", () => {
    assert.equal(
      clean(`<img alt="প্রচ্ছদ" src="//upload.wikimedia.org/a.png" width="120" height="175" class="mw-file-element" onerror="x()">`),
      `<img src="https://upload.wikimedia.org/a.png" alt="প্রচ্ছদ" width="120" height="175" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`
    );
  });
});

describe("sanitizer: Wikisource layout", () => {
  test("header, page numbers, licence box and edit links are removed", () => {
    const out = clean(
      `<div id="headertemplate" class="ws-noexport"><a href="${wiki("গোরা")}">গোরা</a></div>` +
        `<p><span class="pagenum ws-pagenum" data-page-name="পাতা:গোরা.pdf/৯"><span>৯</span></span>প্রথম কথা</p>` +
        `<div class="licenseContainer"><p>Public domain</p></div><span class="mw-editsection">[সম্পাদনা]</span>` +
        `<div class="ws-noexport"><p>chrome</p><div><p>more chrome</p></div></div><p>শেষ</p>`
    );
    assert.equal(out, `<p>প্রথম কথা</p><p>শেষ</p>`);
  });

  test("centring, indents, poems and headings are kept as our classes", () => {
    assert.equal(clean(`<div style="text-align:center">x</div>`), `<div class="ws-center">x</div>`);
    assert.equal(clean(`<center>x</center>`), `<div class="ws-center">x</div>`);
    assert.equal(clean(`<p><span style="display:inline-block; width:2em;">&#160;</span>অনুচ্ছেদ</p>`), `<p><span class="ws-indent">${String.fromCharCode(160)}</span>অনুচ্ছেদ</p>`);
    assert.equal(clean(`<div class="poem"><p>পদ<br /></p></div>`), `<div class="ws-poem"><p>পদ<br /></p></div>`);
    assert.equal(clean(`<h1>শিরোনাম</h1>`), `<h2>শিরোনাম</h2>`);
    assert.equal(clean(`<span style="display:none">লুকানো</span><p>দেখা</p>`), `<p>দেখা</p>`);
  });
});

describe("reading the raw page", () => {
  test("links below the work, in order, once each, with their text", () => {
    const raw =
      `<a href="${wiki("গোরা")}">গোরা</a><a href="${wiki("গোরা/২")}"><span>দ্বিতীয়</span> &amp; শেষ</a>` +
      `<a href="${wiki("গোরা/১")}#x">প্রথম</a><a href="${wiki("গোরা/২")}">আবার</a><a href="${wiki("লেখক:রবীন্দ্রনাথ ঠাকুর")}">লেখক</a>`;
    assert.deepEqual(linksBelow(raw, "গোরা"), [
      { title: "গোরা/২", text: "দ্বিতীয় & শেষ" },
      { title: "গোরা/১", text: "প্রথম" },
    ]);
  });

  test("scan files named by the page-number markers", () => {
    const raw = `<span data-page-name="পাতা:মা - ম্যাক্সিম গোর্কি - বিমল সেন.pdf/১০"></span><span data-page-name="পাতা:মা - ম্যাক্সিম গোর্কি - বিমল সেন.pdf/১১"></span><span data-page-name="Page:Other.djvu/3"></span>`;
    assert.deepEqual(scanFiles(raw), ["মা - ম্যাক্সিম গোর্কি - বিমল সেন.pdf", "Other.djvu"]);
  });
});

describe("titles and reader URLs", () => {
  test("a book's Wikisource link names the work", () => {
    assert.equal(workRootFromUrl("https://bn.wikisource.org/wiki/%E0%A6%AE%E0%A6%BE_(%E0%A6%95)"), "মা (ক)");
    assert.equal(workRootFromUrl("https://en.wikisource.org/wiki/X"), null);
    assert.equal(workRootFromUrl("http://bn.wikisource.org/wiki/X"), null);
  });

  test("paths within the work, and reader URLs, both ways", () => {
    assert.equal(pathInWork("মা", "মা/প্রথম খণ্ড/এক"), "প্রথম খণ্ড/এক");
    assert.equal(pathInWork("মা", "মা"), "");
    assert.equal(pathInWork("মা", "মামা/এক"), null);
    assert.equal(readerHref("b1", "প্রথম খণ্ড/এক"), `/books/b1/read/${encodeURIComponent("প্রথম_খণ্ড")}/${encodeURIComponent("এক")}`);
    assert.equal(pathFromSegments(["প্রথম_খণ্ড", "এক"]), "প্রথম খণ্ড/এক");
    assert.equal(pathFromSegments([encodeURIComponent("প্রথম_খণ্ড")]), "প্রথম খণ্ড");
    assert.equal(pathFromSegments(["a", ""]), null);
    assert.equal(pathFromSegments(["a<b"]), null);
    assert.equal(pathFromSegments([]), "");
  });

  test("Wikisource URLs", () => {
    assert.equal(wikisourceUrl("গোরা/১", "x"), `https://bn.wikisource.org/wiki/${encodeURIComponent("গোরা")}/${encodeURIComponent("১")}#x`);
  });
});
