// Which of our categories a Gutenberg book belongs to, from its "Category:"
// bookshelves, Library of Congress subject headings (LCSH) and class (LCC).
// Checked in order, specific forms first; a book that matches none of the
// fitting forms is listed in the report instead of being forced in.

export type GForm = { key: string; noun: string; category: string };

const F = (key: string, noun: string, category: string): GForm => ({ key, noun, category });
export const GFORMS = {
  children: F("children", "ছোটদের বই", "shishu-sahitto"),
  mystery: F("mystery", "রহস্য-রোমাঞ্চ কাহিনি", "thriller-rohosso"),
  scifi: F("scifi", "বিজ্ঞান কল্পকাহিনী", "biggan-kolpokahini"),
  play: F("play", "নাটক", "natok"),
  poetry: F("poetry", "কাব্যগ্রন্থ", "kobita"),
  stories: F("stories", "গল্পের বই", "chhotogolpo"),
  travel: F("travel", "ভ্রমণকাহিনি", "bhromon"),
  autobiography: F("autobiography", "আত্মজীবনী", "itihash-jiboni"),
  biography: F("biography", "জীবনী", "itihash-jiboni"),
  history: F("history", "ইতিহাস বিষয়ক বই", "itihash-jiboni"),
  selfhelp: F("selfhelp", "আত্ম-উন্নয়নের বই", "atmounnoyon"),
  philosophy: F("philosophy", "দর্শন বিষয়ক বই", "probondho"),
  religion: F("religion", "ধর্ম বিষয়ক বই", "probondho"),
  science: F("science", "বিজ্ঞান বিষয়ক বই", "probondho"),
  essays: F("essays", "প্রবন্ধের বই", "probondho"),
  novel: F("novel", "উপন্যাস", "uponnash"),
} as const;

// Shelves that mark a book as something we have no category for.
const UNFIT_SHELVES = [
  "Encyclopedias/Dictionaries/Reference",
  "Cooking & Drinking",
  "Health & Medicine",
  "Engineering & Technology",
  "How To ...",
  "Law & Criminology",
  "Sports/Hobbies",
  "Music",
  "Architecture",
  "Journals",
  "Reports & Conference Proceedings",
  "Language & Communication",
  "Teaching & Education",
  "Business/Management",
  "Computers & Technology",
  "Fashion",
  "Crafts/Hobbies",
  "Games/Video Games",
  "Mathematics",
];

export type FormResult = { form: GForm; why: string } | { form: null; why: string };

// Set by hand, by ebook id, where the shelves and headings mislead.
const FORM_BY_HAND: Record<number, keyof typeof GFORMS> = {
  205: "essays", // Walden: catalogued as biography
  10661: "philosophy", // Discourses of Epictetus: catalogued as biography
  1404: "essays", // The Federalist Papers: catalogued as history
  289: "children", // The Wind in the Willows
  132: "essays", // The Art of War: catalogued as history
};

export function formOf(book: { id: number; bookshelves: string[]; lcsh: string[]; lcc: string[] }): FormResult {
  const byHand = FORM_BY_HAND[book.id];
  if (byHand) return { form: GFORMS[byHand], why: "set by hand" };
  const shelves = book.bookshelves.filter((s) => s.startsWith("Category: ")).map((s) => s.slice("Category: ".length));
  const has = (name: string) => shelves.includes(name);
  const subject = (re: RegExp) => book.lcsh.some((s) => re.test(s));
  const fiction = subject(/\bfiction\b|stories|tales\b|romances?\b/i) || has("Novels") || has("Short Stories") || has("Historical Novels") || has("Romance");

  if (subject(/juvenile (fiction|literature|poetry)|children's (stories|literature|poetry)|nursery rhymes|fairy tales/i))
    return { form: GFORMS.children, why: "children's subject heading" };
  if (has("Crime, Thrillers and Mystery") || subject(/detective and mystery|mystery fiction|spy stories|suspense fiction/i))
    return { form: GFORMS.mystery, why: "crime/mystery" };
  if (subject(/science fiction/i)) return { form: GFORMS.scifi, why: "science fiction subject heading" };
  if (has("Plays/Films/Dramas") || subject(/\bdrama\b|tragedies|comedies|tragicomedies|one-act plays/i))
    return { form: GFORMS.play, why: "plays" };
  if (has("Poetry") || subject(/\bpoetry\b|\bpoems\b|sonnets|epic poetry|ballads/i)) return { form: GFORMS.poetry, why: "poetry" };
  if (has("Short Stories") && !has("Novels")) return { form: GFORMS.stories, why: "short stories" };
  if (!fiction) {
    if (has("Travel Writing") || subject(/description and travel|voyages and travels/i)) return { form: GFORMS.travel, why: "travel" };
    if (subject(/autobiograph/i)) return { form: GFORMS.autobiography, why: "autobiography" };
    // The Biographies shelf alone isn't enough when the book is also shelved
    // as essays (Walden is both).
    if (subject(/biography|memoirs|diaries/i) || (has("Biographies") && !has("Essays, Letters & Speeches")))
      return { form: GFORMS.biography, why: "biography" };
    // Only books about getting on in life; "conduct of life" alone also
    // covers Epictetus, Schopenhauer and Ruskin.
    if (subject(/^success|self-culture|self-realization|self-help/i) && !has("Philosophy & Ethics")) return { form: GFORMS.selfhelp, why: "self-help" };
    const unfit = UNFIT_SHELVES.find((s) => has(s));
    if (unfit) return { form: null, why: `non-fiction we have no category for (${unfit})` };
    // Political and moral philosophy before history: The Prince, Leviathan
    // and Locke are shelved under history periods too.
    if (has("Philosophy & Ethics") || subject(/philosophy|political science|ethics|social contract|political ethics/i))
      return { form: GFORMS.philosophy, why: "philosophy" };
    if (shelves.some((s) => s.startsWith("History - ")) || subject(/\bhistory\b/i)) return { form: GFORMS.history, why: "history" };
    if (has("Religion/Spirituality")) return { form: GFORMS.religion, why: "religion" };
    if (shelves.some((s) => s.startsWith("Science - ")) || has("Nature/Gardening/Animals") || has("Psychiatry/Psychology"))
      return { form: GFORMS.science, why: "science" };
    if (has("Essays, Letters & Speeches") || has("Politics") || has("Sociology") || subject(/essays|letters|speeches|addresses/i))
      return { form: GFORMS.essays, why: "essays" };
    return { form: null, why: `non-fiction of no clear form (shelves: ${shelves.join(", ") || "none"})` };
  }
  if (has("Children & Young Adult Reading") && !has("Novels")) return { form: GFORMS.children, why: "children's shelf" };
  return { form: GFORMS.novel, why: "fiction" };
}
