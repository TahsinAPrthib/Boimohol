import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseThemeChoice, themeCookie, THEME_SCRIPT, THEME_COLOR } from "./theme";

// Runs the inline <head> script against a stand-in document.
function runScript(cookie: string) {
  const attrs: Record<string, string> = {};
  const metas = [{ content: "", setAttribute(_: string, v: string) { this.content = v; } }];
  let ready: (() => void) | null = null;
  const document = {
    cookie,
    documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) },
    addEventListener: (_: string, fn: () => void) => (ready = fn),
    querySelectorAll: () => metas,
  };
  new Function("document", THEME_SCRIPT)(document);
  (ready as (() => void) | null)?.();
  return { theme: attrs["data-theme"] ?? null, barColor: metas[0].content };
}

describe("day and night colours", () => {
  test("only day and night are remembered; anything else follows the device", () => {
    assert.equal(parseThemeChoice("light"), "light");
    assert.equal(parseThemeChoice("dark"), "dark");
    assert.equal(parseThemeChoice("system"), "system");
    assert.equal(parseThemeChoice(undefined), "system");
    assert.equal(parseThemeChoice("DARK"), "system");
    assert.equal(parseThemeChoice("dark; path=/"), "system");
  });

  test("a choice is kept for a year; following the device removes the cookie", () => {
    assert.match(themeCookie("dark"), /^bm-theme=dark; path=\/; max-age=31536000; samesite=lax$/);
    assert.match(themeCookie("light"), /^bm-theme=light;/);
    assert.match(themeCookie("system"), /^bm-theme=; path=\/; max-age=0;/);
  });

  test("the head script puts the remembered palette on the page before it is drawn", () => {
    assert.deepEqual(runScript("a=1; bm-theme=dark; b=2"), { theme: "dark", barColor: THEME_COLOR.dark });
    assert.deepEqual(runScript("bm-theme=light"), { theme: "light", barColor: THEME_COLOR.light });
  });

  test("without a choice, or with a cookie that only looks like one, the device decides", () => {
    assert.deepEqual(runScript(""), { theme: null, barColor: "" });
    assert.deepEqual(runScript("not-bm-theme=dark"), { theme: null, barColor: "" });
    assert.deepEqual(runScript("bm-theme=darkest"), { theme: null, barColor: "" });
  });
});
