import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { banglaProblems, repairBangla } from "./bangla-check";

// Special characters by code point, so none hides in the source.
const cp = (...codes: number[]) => String.fromCodePoint(...codes);
const ZWJ = cp(0x200d);
const ZWNJ = cp(0x200c);
const kinds = (s: string) => banglaProblems(s).map((p) => p.kind);

describe("broken Bangla", () => {
  test("correct spellings pass, including the forms that need joiners", () => {
    for (const ok of [
      "বাংলা বইয়ের ঘর",
      "চাঁদের পাহাড়",
      "রবীন্দ্রনাথ ঠাকুর",
      "দুঃখ",
      "আঁধারে আলো",
      "শরৎচন্দ্র চট্টোপাধ্যায়",
      `র${ZWJ}্যাব`, // র[ZWJ]্যাব
      `ক্${ZWNJ}ষ`, // a ক্ষ kept apart
      "কো", // ো precomposed
      cp(0x995, 0x9c7, 0x9be), // ো decomposed (ে + া): the same letter
      cp(0x995, 0x9c7, 0x9d7), // ৌ decomposed (ে + ৗ)
      `ড়, ঢ়, য় and ${cp(0x9a1, 0x9bc)}`, // precomposed and nukta forms
      "Gitanjali: Song Offerings",
      "অ্যালিস, এ্যাডভেঞ্চার", // the ya-phala on অ and এ for "æ"
    ]) {
      assert.deepEqual(kinds(ok), [], ok);
    }
  });

  test("a vowel sign after a chandrabindu (the মারাঁের typo)", () => {
    assert.deepEqual(kinds("রেনে মারাঁের উপন্যাস"), ["vowel sign ে after chandrabindu"]);
  });

  test("doubled signs", () => {
    assert.deepEqual(kinds("কিি"), ["vowel sign ি after vowel sign ি"]);
    assert.deepEqual(kinds("ক্্ষ"), ["hasanta after hasanta"]);
    assert.deepEqual(kinds("বাংং"), ["anusvara after anusvara"]);
    assert.deepEqual(kinds("চাঁঁদ"), ["chandrabindu after chandrabindu"]);
  });

  test("signs with nothing to attach to", () => {
    assert.deepEqual(kinds("আা"), ["vowel sign া after vowel আ"]);
    assert.deepEqual(kinds(" ি"), ["vowel sign ি after “ ”"]);
    assert.deepEqual(kinds("ি"), ["vowel sign ি after nothing"]);
    assert.deepEqual(kinds("ক্া"), ["vowel sign া after hasanta"]);
  });

  test("repairs: only what can't change a correct spelling", () => {
    assert.equal(repairBangla("মোপাসাঁঁ"), "মোপাসাঁ");
    assert.equal(repairBangla(`আর্থা${ZWNJ}র`), "আর্থার");
    assert.equal(repairBangla(`এ কোর্স${ZWNJ} অফ`), "এ কোর্স অফ");
    assert.equal(repairBangla(`মম্${ZWNJ}${ZWNJ}`), `মম্${ZWNJ}`);
    assert.equal(repairBangla(`বই${cp(0x200b)}মহল${cp(0xad)}`), "বইমহল");
    // Left alone: correct text, and a misplaced vowel sign (that needs a person).
    for (const s of [`র${ZWJ}্যাব`, `ক্${ZWNJ}ষ`, "অ্যালিস", "চাঁদ", "মারাঁের"]) assert.equal(repairBangla(s), s);
  });

  test("stray joiners and invisible characters", () => {
    assert.deepEqual(kinds(`বই${ZWJ} মহল`), ["stray ZWJ"]);
    assert.deepEqual(kinds(`বই${ZWNJ}`), ["stray ZWNJ"]);
    assert.deepEqual(kinds(`বই${cp(0x200b)}মহল`), ["zero-width space"]);
    assert.deepEqual(kinds(`${cp(0xfeff)}বই`), ["byte-order mark"]);
    assert.deepEqual(kinds(`বই${cp(0xad)}মহল`), ["soft hyphen"]);
  });
});
