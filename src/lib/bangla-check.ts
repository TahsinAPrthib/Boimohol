// Finds broken Bangla in catalogue text: sequences no correct spelling
// produces, which fonts draw as dotted circles or detached marks. Pure, so
// it can run over the database and the import files alike.
//
//   - a dependent vowel sign (া ি ী ু ূ ৃ ৄ ে ৈ ো ৌ ৗ ৢ ৣ) that doesn't follow a
//     consonant (with or without nukta): after another vowel sign, after
//     chandrabindu/anusvara/visarga, after an independent vowel, after a
//     hasanta, or with nothing Bangla before it ("মারাঁের": ঁ then ে);
//   - chandrabindu, anusvara or visarga with nothing to sit on, or doubled;
//   - a nukta not after a consonant; a hasanta not after a consonant, or doubled;
//   - ZWJ/ZWNJ anywhere but next to a hasanta (র[ZWJ]্য, ক্[ZWNJ]ষ);
//   - invisible characters that never belong in catalogue text: zero-width
//     space, word joiner, byte-order mark, soft hyphen.
//
// Every special character is built from its code point, so none hides in the
// source.

const cp = (...codes: number[]) => String.fromCodePoint(...codes);
const range = (from: number, to: number) => `${cp(from)}-${cp(to)}`;
const anyOf = (...parts: string[]) => new RegExp(`[${parts.join("")}]`);

const CONSONANT = anyOf(range(0x995, 0x9b9), cp(0x9ce, 0x9dc, 0x9dd, 0x9df, 0x9f0, 0x9f1));
const VOWEL_SIGN = anyOf(range(0x9be, 0x9c4), cp(0x9c7, 0x9c8, 0x9cb, 0x9cc, 0x9d7, 0x9e2, 0x9e3));
const INDEPENDENT_VOWEL = anyOf(range(0x985, 0x994), cp(0x9e0, 0x9e1));
const MODIFIER = anyOf(cp(0x981, 0x982, 0x983)); // chandrabindu, anusvara, visarga
const INVISIBLE = anyOf(cp(0x200b, 0x2060, 0xfeff, 0xad));
const NUKTA = cp(0x9bc);
const HASANTA = cp(0x9cd);
const ZWNJ = cp(0x200c);
const ZWJ = cp(0x200d);
const E_SIGN = cp(0x9c7); // ে, the first half of a decomposed ো or ৌ
const AA_SIGN = cp(0x9be);
const AU_LENGTH = cp(0x9d7);
const A_VOWEL = cp(0x985); // অ
const E_VOWEL = cp(0x98f); // এ
const YA = cp(0x9af); // য

export type BanglaProblem = { at: number; kind: string; context: string };

// Mechanical repairs that can't change a correct spelling: invisible
// characters out, joiners that join nothing out, and a mark typed twice kept
// once. (A vowel sign in the wrong place needs a person: it is reported by
// banglaProblems, not repaired here.)
export function repairBangla(text: string): string {
  const chars = [...text];
  const out: string[] = [];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const prev = out[out.length - 1] ?? "";
    if (INVISIBLE.test(c)) continue;
    if (c === ZWJ || c === ZWNJ) {
      const next = chars[i + 1] ?? "";
      if (!(prev === HASANTA || next === HASANTA) || prev === ZWJ || prev === ZWNJ) continue;
    }
    if ((MODIFIER.test(c) || VOWEL_SIGN.test(c) || c === HASANTA || c === NUKTA) && prev === c) continue;
    out.push(c);
  }
  return out.join("");
}

const NAMES = new Map<string, string>([
  [cp(0x981), "chandrabindu"],
  [cp(0x982), "anusvara"],
  [cp(0x983), "visarga"],
  [NUKTA, "nukta"],
  [HASANTA, "hasanta"],
  [ZWNJ, "ZWNJ"],
  [ZWJ, "ZWJ"],
  [cp(0x200b), "zero-width space"],
  [cp(0x2060), "word joiner"],
  [cp(0xfeff), "byte-order mark"],
  [cp(0xad), "soft hyphen"],
]);
const nameOf = (c: string) =>
  NAMES.get(c) ?? (VOWEL_SIGN.test(c) ? `vowel sign ${c}` : INDEPENDENT_VOWEL.test(c) ? `vowel ${c}` : `“${c}”`);

export function banglaProblems(text: string): BanglaProblem[] {
  const out: BanglaProblem[] = [];
  const chars = [...text];
  const context = (i: number) => chars.slice(Math.max(0, i - 4), i + 4).join("");
  // The letter a sign attaches to: the one before it, skipping a nukta.
  const baseBefore = (i: number) => {
    let j = i - 1;
    if (chars[j] === NUKTA) j--;
    return j >= 0 ? chars[j] : "";
  };
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const prev = i > 0 ? chars[i - 1] : "";
    const add = (kind: string) => out.push({ at: i, kind, context: context(i) });
    if (VOWEL_SIGN.test(c)) {
      // ো and ৌ may arrive decomposed (ে + া, ে + ৗ): the same letter.
      if ((c === AA_SIGN || c === AU_LENGTH) && prev === E_SIGN && CONSONANT.test(baseBefore(i - 1))) continue;
      if (!CONSONANT.test(baseBefore(i))) add(`${nameOf(c)} after ${prev ? nameOf(prev) : "nothing"}`);
    } else if (MODIFIER.test(c)) {
      if (MODIFIER.test(prev)) add(`${nameOf(c)} after ${nameOf(prev)}`);
      else if (!(CONSONANT.test(prev) || VOWEL_SIGN.test(prev) || INDEPENDENT_VOWEL.test(prev) || prev === NUKTA))
        add(`${nameOf(c)} after ${prev ? nameOf(prev) : "nothing"}`);
    } else if (c === NUKTA) {
      if (!CONSONANT.test(prev)) add(`nukta after ${prev ? nameOf(prev) : "nothing"}`);
    } else if (c === HASANTA) {
      // অ্যা and এ্যা (a ya-phala on a vowel) are how Bangla writes the "æ"
      // of English names: অ্যালিস, অ্যাডভেঞ্চার. Standard, not broken.
      const yaPhalaOnVowel = (prev === A_VOWEL || prev === E_VOWEL) && chars[i + 1] === YA;
      if (!CONSONANT.test(baseBefore(i)) && prev !== ZWJ && !yaPhalaOnVowel) add(`hasanta after ${prev ? nameOf(prev) : "nothing"}`);
    } else if (c === ZWJ || c === ZWNJ) {
      // র[ZWJ]্য (র + ZWJ + ্), half forms (্ + ZWJ) and ক্[ZWNJ]ষ (্ + ZWNJ).
      const next = chars[i + 1] ?? "";
      if (!(prev === HASANTA || next === HASANTA) || prev === ZWJ || prev === ZWNJ) add(`stray ${nameOf(c)}`);
    } else if (INVISIBLE.test(c)) {
      add(nameOf(c));
    }
  }
  return out;
}
