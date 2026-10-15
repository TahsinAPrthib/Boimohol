import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { displayUrl, parseSourceUrl } from "./book-sources";

const ok = (raw: string) => {
  const r = parseSourceUrl(raw);
  assert.equal(r.ok, true, `${raw} should be accepted`);
  return r as { ok: true; kind: string; url: string };
};
const refused = (raw: string) => assert.equal(parseSourceUrl(raw).ok, false, `${raw} should be refused`);

describe("parseSourceUrl — the three trusted sites", () => {
  test("any language's Wikisource", () => {
    assert.equal(ok("https://bn.wikisource.org/wiki/গোরা").kind, "WIKISOURCE");
    assert.equal(ok("https://en.wikisource.org/wiki/Gora").kind, "WIKISOURCE");
    assert.equal(ok("https://wikisource.org/wiki/Main_Page_x").kind, "WIKISOURCE");
  });

  test("Project Gutenberg and the Internet Archive", () => {
    assert.equal(ok("https://www.gutenberg.org/ebooks/7164").kind, "GUTENBERG");
    assert.equal(ok("https://archive.org/details/gora00tago").kind, "INTERNET_ARCHIVE");
  });

  test("normalised: https, no fragment, percent-encoded", () => {
    const r = ok("  http://bn.wikisource.org/wiki/গোরা#১  ");
    assert.equal(r.url, "https://bn.wikisource.org/wiki/%E0%A6%97%E0%A7%8B%E0%A6%B0%E0%A6%BE");
    assert.equal(displayUrl(r.url), "https://bn.wikisource.org/wiki/গোরা");
  });
});

describe("parseSourceUrl — everything else is refused", () => {
  test("other sites, including lookalikes", () => {
    for (const raw of [
      "https://example.com/book.pdf",
      "https://wikisource.org.evil.example/wiki/x",
      "https://evilwikisource.org/wiki/x",
      "https://gutenberg.org.evil.example/ebooks/1",
      "https://notarchive.org/details/x",
      "https://gutenberg.ca/ebooks/1",
    ])
      refused(raw);
  });

  test("credentials, ports and other schemes", () => {
    refused("https://bn.wikisource.org@evil.example/wiki/x");
    refused("https://user:pass@bn.wikisource.org/wiki/x");
    refused("https://bn.wikisource.org:8443/wiki/x");
    refused("javascript:alert(1)//wikisource.org");
    refused("ftp://archive.org/details/x");
    refused("data:text/html,wikisource.org");
  });

  test("not a link, or just a site's front page", () => {
    refused("");
    refused("bn.wikisource.org/wiki/গোরা");
    refused("https://bn.wikisource.org/");
    refused("https://archive.org");
    refused("https://bn.wikisource.org/wiki/" + "x".repeat(2000));
  });
});
