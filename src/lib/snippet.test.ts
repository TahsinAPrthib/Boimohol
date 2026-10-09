import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { snippet } from "./snippet";

describe("snippet", () => {
  test("short text comes back unchanged (whitespace tidied)", () => {
    assert.equal(snippet("  চমৎকার   বই।  "), "চমৎকার বই।");
  });

  test("long text is cut at a word boundary with an ellipsis", () => {
    const text = "এই বইটি পড়ে মনে হলো লেখক আমাদের গ্রামের কথাই লিখেছেন। ".repeat(10);
    const out = snippet(text, 60);
    assert.ok(out.endsWith("…"));
    assert.ok(!out.slice(0, -1).endsWith(" "));
    // Every word in the preview is a whole word from the original.
    for (const word of out.slice(0, -1).split(" ")) assert.ok(text.includes(word), word);
  });

  test("never cuts through a conjunct or leaves a dangling hasanta", () => {
    // No spaces at all, so the cut has to fall between graphemes.
    const text = "ক্ষ্ম".repeat(80);
    const out = snippet(text, 25);
    const body = out.slice(0, -1);
    assert.ok(!body.endsWith("্"), "ends on a hasanta");
    assert.equal(body.length % "ক্ষ্ম".length, 0, "cut inside a conjunct");
  });

  test("does not end on a separator before the ellipsis", () => {
    const text = "প্রথম অংশ, দ্বিতীয় অংশ। ".repeat(20);
    assert.ok(!/[,।]…$/.test(snippet(text, 30)));
  });
});
