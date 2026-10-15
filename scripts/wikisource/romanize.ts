// A simple Bangla -> Latin romanisation in the familiar style ("Pather
// Panchali", "Gora"), used only when Wikidata has no English title for a
// work. It handles the inherent vowel with one rule (dropped at the end of a
// word, kept elsewhere), so results can be slightly off; every title made
// this way is flagged in the report for a person to check.

const cp = (code: number) => String.fromCodePoint(code);
const VIRAMA = cp(0x09cd);

const CONSONANTS: Record<string, string> = Object.fromEntries(
  [
    [0x0995, "k"], [0x0996, "kh"], [0x0997, "g"], [0x0998, "gh"], [0x0999, "ng"],
    [0x099a, "ch"], [0x099b, "chh"], [0x099c, "j"], [0x099d, "jh"], [0x099e, "n"],
    [0x099f, "t"], [0x09a0, "th"], [0x09a1, "d"], [0x09a2, "dh"], [0x09a3, "n"],
    [0x09a4, "t"], [0x09a5, "th"], [0x09a6, "d"], [0x09a7, "dh"], [0x09a8, "n"],
    [0x09aa, "p"], [0x09ab, "ph"], [0x09ac, "b"], [0x09ad, "bh"], [0x09ae, "m"],
    [0x09af, "j"], [0x09b0, "r"], [0x09b2, "l"], [0x09b6, "sh"], [0x09b7, "sh"],
    [0x09b8, "s"], [0x09b9, "h"], [0x09dc, "r"], [0x09dd, "rh"], [0x09df, "y"],
  ].map(([c, r]) => [cp(c as number), r as string])
);
const VOWELS: Record<string, string> = Object.fromEntries(
  [
    [0x0985, "a"], [0x0986, "a"], [0x0987, "i"], [0x0988, "i"], [0x0989, "u"], [0x098a, "u"],
    [0x098b, "ri"], [0x098f, "e"], [0x0990, "oi"], [0x0993, "o"], [0x0994, "ou"],
  ].map(([c, r]) => [cp(c as number), r as string])
);
const SIGNS: Record<string, string> = Object.fromEntries(
  [
    [0x09be, "a"], [0x09bf, "i"], [0x09c0, "i"], [0x09c1, "u"], [0x09c2, "u"], [0x09c3, "ri"],
    [0x09c7, "e"], [0x09c8, "oi"], [0x09cb, "o"], [0x09cc, "ou"],
  ].map(([c, r]) => [cp(c as number), r as string])
);
const OTHERS: Record<string, string> = {
  [cp(0x09ce)]: "t", // khanda ta
  [cp(0x0982)]: "ng", // anusvara
  [cp(0x0983)]: "h", // visarga
  [cp(0x0981)]: "n", // chandrabindu
};
const DIGITS = "০১২৩৪৫৬৭৮৯";
// Built from code points so no invisible character sits in the source.
const ZERO_WIDTH = new RegExp(`[${cp(0x200b)}-${cp(0x200d)}]`);
const BANGLA = new RegExp(`[${cp(0x0980)}-${cp(0x09ff)}]`);

const YA = cp(0x09af);
const BA = cp(0x09ac);
const MA = cp(0x09ae);
const NUKTA = cp(0x09bc);
const CHANDRABINDU = cp(0x0981);
const KHANDA_TA = cp(0x09ce);
const ISWAR = cp(0x09fa); // ৺, written before a dead person's name
// Marks after a final consonant that don't stop its inherent vowel being
// dropped (ৎ does: শরৎ is "Sharat").
const SOFT_END = new Set([cp(0x0982), cp(0x0983), CHANDRABINDU]);

function word(w: string): string {
  // য + nukta and the like: compose first so one table lookup sees them.
  const chars = [...w.normalize("NFC")].filter((ch) => ch !== ISWAR && !ZERO_WIDTH.test(ch));
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];
    if (ch === NUKTA) continue; // stray nukta
    if (CONSONANTS[ch] !== undefined) {
      // Second half of a conjunct: য-ফলা reads "y" (বিদ্যা, Bidya) and ব-ফলা
      // "w" (স্বপ্ন, Swapna), except after ম (সম্বল).
      const inConjunct = chars[i - 1] === VIRAMA;
      let c = CONSONANTS[ch];
      if (inConjunct && ch === YA) c = "y";
      else if (inConjunct && ch === BA && chars[i - 2] !== MA) c = "w";
      if (next === NUKTA) {
        c = ch === YA ? "y" : ch === cp(0x09a1) ? "r" : ch === cp(0x09a2) ? "rh" : c;
        i++;
      }
      out += c;
      const after = chars[i + 1];
      if (after === VIRAMA) {
        i++;
        continue;
      }
      if (after !== undefined && SIGNS[after] !== undefined) continue;
      // The inherent vowel: kept inside the word, dropped at its end -- but
      // kept after a final conjunct (চন্দ্র, Chandra; সাহিত্য, Sahitya).
      const rest = chars.slice(i + 1);
      const atEnd = rest.every((x) => SOFT_END.has(x));
      if (!atEnd || inConjunct) out += "a";
      continue;
    }
    if (ch === CHANDRABINDU) {
      // Nasal before a consonant (চাঁদ, Chand); silent before a vowel or at
      // the end (ভূঁই, Bhui).
      if (next !== undefined && CONSONANTS[next] !== undefined) out += "n";
      continue;
    }
    if (VOWELS[ch] !== undefined) out += VOWELS[ch];
    else if (SIGNS[ch] !== undefined) out += SIGNS[ch];
    else if (ch === KHANDA_TA) out += "t";
    else if (OTHERS[ch] !== undefined) out += OTHERS[ch];
    else if (DIGITS.includes(ch)) out += String(DIGITS.indexOf(ch));
    else if (ch === VIRAMA) continue;
    else out += ch;
  }
  // ঙ্গ and ং before গ: "Sangraha", not "Sanggraha".
  return out.replace(/ngg/g, "ng");
}

export function romanize(text: string): string {
  return text
    .replace(/[‘’“”]/g, "")
    .split(/(\s+|[-–—,:;()।])/)
    .map((part) => (BANGLA.test(part) ? word(part) : part.replace("।", "")))
    .join("")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|[\s-(])([a-z])/g, (_, pre, c) => pre + c.toUpperCase());
}
