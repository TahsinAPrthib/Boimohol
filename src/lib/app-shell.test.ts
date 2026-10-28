import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { activeTab, fullScreenBack } from "./app-shell";

describe("phone tab bar", () => {
  test("each section lights its tab, including the pages under it", () => {
    assert.equal(activeTab("/"), "home");
    assert.equal(activeTab("/search"), "search");
    assert.equal(activeTab("/categories/uponnash"), "search");
    assert.equal(activeTab("/library"), "library");
    assert.equal(activeTab("/marketplace"), "exchange");
    assert.equal(activeTab("/marketplace/mine"), "exchange");
    assert.equal(activeTab("/requests/new"), "exchange");
    assert.equal(activeTab("/profile"), "profile");
    assert.equal(activeTab("/wishlist"), "profile");
    assert.equal(activeTab("/admin/books"), "profile");
    assert.equal(activeTab("/login"), "profile");
  });

  test("a page that belongs to no tab lights none; a lookalike prefix isn't a section", () => {
    assert.equal(activeTab("/books/uponnash-gora"), null);
    assert.equal(activeTab("/messages"), null);
    assert.equal(activeTab("/privacy"), null);
    assert.equal(activeTab("/librarybooks"), null);
    assert.equal(activeTab("/searchable"), null);
  });

  test("a message thread and the reader are full-screen, with a way back", () => {
    assert.deepEqual(fullScreenBack("/messages/abc123"), { href: "/messages", label: "সব বার্তা" });
    assert.deepEqual(fullScreenBack("/books/uponnash-gora/read"), { href: "/books/uponnash-gora", label: "বইয়ের পাতা" });
    assert.deepEqual(fullScreenBack("/books/uponnash-gora/read/%E0%A6%85"), { href: "/books/uponnash-gora", label: "বইয়ের পাতা" });
  });

  test("the inbox, a book page and everything else keep the tab bar", () => {
    assert.equal(fullScreenBack("/messages"), null);
    assert.equal(fullScreenBack("/books/uponnash-gora"), null);
    assert.equal(fullScreenBack("/"), null);
    assert.equal(fullScreenBack("/marketplace/abc"), null);
  });
});
