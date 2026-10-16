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
  economics: F("economics", "অর্থনীতি বিষয়ক বই", "probondho"),
  language: F("language", "ভাষা বিষয়ক বই", "probondho"),
  letters: F("letters", "চিঠিপত্রের সংকলন", "probondho"),
  novel: F("novel", "উপন্যাস", "uponnash"),
} as const;

// Myths, legends, fables and fairy tales -- collections and retellings, and
// the ancient epics that are a mythology's own texts -- go to পুরাণ ও লোককথা
// (decided 2026-10-16, as for the Bangla works). Set by hand after reading
// each selected book shelved under "Mythology, Legends & Folklore" or with a
// myth, legend, folklore, fable or fairy-tale subject heading; the value is
// the noun for the neutral description. Books that only use such material
// are left where they were: see NOT_MYTH.
export const MYTH_BY_HAND: Record<number, string> = {
  21: "উপকথা", // Three Hundred Aesop's Fables
  5314: "রূপকথার সংকলন", // Grimm, Household Tales
  503: "রূপকথার সংকলন", // Lang, The Blue Fairy Book
  128: "আরব্য রজনীর গল্প", // Lang, The Arabian Nights Entertainments
  4018: "রূপকথার সংকলন", // Ozaki, Japanese Fairy Tales
  18155: "রূপকথা", // The Story of the Three Little Pigs
  902: "রূপকথার সংকলন", // Wilde, The Happy Prince and Other Tales
  76391: "রূপকথার সংকলন", // Austin, Fairy Dreams
  2781: "উপকথার সংকলন", // Kipling, Just So Stories
  26429: "লোককথার সংকলন", // Harris, Nights With Uncle Remus
  23634: "লোককথার সংকলন", // Crane, Italian Popular Tales
  1210: "কিংবদন্তির কাহিনি", // Hearn, Kwaidan: Japanese legends retold
  40588: "কাহিনিমালা", // Somadeva, Kathasaritsagara
  18442: "কিংবদন্তির কাহিনি", // Baldwin, Fifty Famous Stories Retold
  10148: "কিংবদন্তির কাহিনি", // Pyle, The Merry Adventures of Robin Hood
  36462: "কিংবদন্তির কাহিনি", // Malory, King Arthur and the Knights of the Round Table
  12753: "কিংবদন্তির কাহিনি", // Knowles, The Legends of King Arthur
  831: "কিংবদন্তির কাহিনি", // Chrétien de Troyes, Four Arthurian Romances
  14244: "কিংবদন্তির কাহিনি", // Bédier, The Romance of Tristan and Iseult
  25502: "পুরাণ ও কিংবদন্তির কাহিনি", // Ebbutt, Hero-Myths & Legends of the British Race
  45634: "পুরাণকথার সংকলন", // Mooney, Myths of the Cherokee
  15250: "পুরাণ ও কিংবদন্তির কাহিনি", // Werner, Myths and Legends of China
  16653: "পুরাণকথা", // Mackenzie, Myths of Babylonia and Assyria
  18947: "পুরাণকথা", // Snorri, The Younger Edda
  14726: "পুরাণকথার কাব্য", // The Elder Eddas
  1150: "কিংবদন্তির ইতিহাস", // Saxo Grammaticus, The Danish History, Books I-IX (the legendary books)
  1727: "মহাকাব্য", // Homer, Odyssey
  1728: "মহাকাব্য", // Homer, The Odyssey of Homer
  48895: "মহাকাব্য", // Homer, The Odysseys (Chapman)
  6130: "মহাকাব্য", // Homer, Iliad
  228: "মহাকাব্য", // Virgil, Aeneid
  21765: "পুরাণকথার কাব্য", // Ovid, Metamorphoses
  348: "মহাকাব্য ও স্তোত্র", // Hesiod, the Homeric Hymns and Homerica
  830: "মহাকাব্য", // Apollonius, Argonautica
  11000: "মহাকাব্য", // The Gilgamesh Epic (Old Babylonian version)
  4928: "পুরাণকথা", // Bulfinch's Mythology
};

// Shelved with myths or given a myth heading, but not myths themselves:
// why each stays in its own category.
export const NOT_MYTH: Record<number, string> = {
  1514: "a play (Shakespeare)",
  1524: "a play (Shakespeare)",
  1532: "a play (Shakespeare)",
  27673: "a play (Greek tragedy)",
  31: "plays (Greek tragedy)",
  35451: "a play (Greek tragedy)",
  14417: "a play (Greek tragedy)",
  35173: "a play (Greek tragedy)",
  8800: "a later literary poem (Dante)",
  1001: "a later literary poem (Dante)",
  1004: "a later literary poem (Dante)",
  15272: "a later literary poem (Spenser)",
  610: "a later literary poem (Tennyson)",
  1719: "a later literary poem (Chesterton)",
  3011: "a later literary poem (Scott)",
  21700: "a later literary poem (Byron)",
  41: "an original story (Irving)",
  60976: "an original story (Irving)",
  86: "an original novel (Twain)",
  2885: "an original romance (Morris)",
  18459: "an original allegorical romance (Colonna)",
  76442: "an original novel (McCarthy)",
  76929: "an original novel",
  10897: "an original horror story (Blackwood)",
  43629: "a writer's own tales of the supernatural (Pu Songling)",
  708: "a fantasy novel for children (MacDonald)",
  26027: "historical fantasy stories for children (Kipling)",
  3623: "a study of myth and religion (Frazer)",
  40686: "a study of myth (Conway)",
  48967: "a study of myth (Goldziher)",
  66116: "a study of folklore and religion (Lawson)",
  65903: "psychology (Jung)",
  47873: "ethnography (Skeat)",
  66583: "a study of folklore of gems (Kunz)",
  61751: "history (Burton)",
  42538: "history (O'Brien)",
  41625: "natural history (Cowan)",
  41775: "history and anecdote (Baring-Gould)",
  56463: "essays (Bacon)",
  42474: "a dictionary (left out as reference)",
  34853: "a study of folklore (Evans-Wentz)",
  20758: "a study of religion (Jastrow)",
};

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
  // Non-fiction first listed as fitting no category (2026-10-16): as for the
  // Bangla works, essays, philosophy, religion, science and letters go to
  // প্রবন্ধ, and plain history to ইতিহাস.
  5000: "essays", // The Notebooks of Leonardo da Vinci
  37423: "philosophy", // Dewey, How We Think
  852: "philosophy", // Dewey, Democracy and Education
  5500: "philosophy", // Bacon, The Advancement of Learning
  16287: "essays", // William James, Talks to Teachers on Psychology
  24526: "essays", // Newman, The Idea of a University
  35898: "essays", // Ruskin, The Seven Lamps of Architecture
  16351: "essays", // MacDowell, Critical and Historical Essays (music)
  972: "essays", // Bierce, The Devil's Dictionary: satire, not a reference work
  43376: "language", // Mencken, The American Language
  33310: "economics", // Ricardo, Principles of Political Economy and Taxation
  30107: "economics", // Mill, Principles of Political Economy
  6435: "economics", // Taylor, The Principles of Scientific Management
  55822: "science", // Malinowski, Argonauts of the Western Pacific
  55264: "science", // D'Arcy Thompson, On Growth and Form
  38015: "science", // Agricola, De Re Metallica
  21076: "science", // Euclid's Elements, books I-VI
  33283: "science", // Thompson, Calculus Made Easy
  38769: "science", // Hardy, A Course of Pure Mathematics
  27963: "history", // Seeley, History of Education
  55870: "history", // Fergusson, A History of Architecture
  41538: "history", // Byrn, The Progress of Invention in the Nineteenth Century
  54977: "history", // Fulton, The Sovereignty of the Sea
  17150: "history", // The Oldest Code of Laws in the World (Hammurabi)
  2274: "selfhelp", // Bennett, How to Live on 24 Hours a Day
  58750: "history", // Lea, Superstition and Force
  60692: "history", // Tarbell, The History of the Standard Oil Company
  22090: "essays", // Havelock Ellis, The Task of Social Hygiene
  // Reached when the recent releases were dropped; their headings misled.
  69344: "history", // Treston, Poine: a study of blood-vengeance in ancient Greece, not a play
  15491: "science", // Hooke, Micrographia
  39272: "science", // Martin, The Inventions, Researches and Writings of Nikola Tesla
  50857: "religion", // Lightfoot, commentary on Colossians and Philemon
  18590: "letters", // The Letters of Cassiodorus
  35977: "letters", // Letters of Abelard and Heloise
};

// Non-fiction left out after reading the list: reference works, manuals and
// cookbooks (decided 2026-10-16), and the few that fit no rule, for a
// person to decide.
export const LEFT_OUT_BY_HAND: Record<number, "reference" | "manual" | "cookbook" | "undecided"> = {
  12342: "reference", 40521: "reference", 10681: "reference", 26000: "reference", 31543: "reference", 58529: "reference",
  42474: "reference", 61526: "reference", 41617: "reference", 48105: "reference", 47018: "reference", 10625: "reference",
  59959: "reference", 51155: "reference", 44562: "reference", 42108: "reference", 50797: "reference", 27279: "reference",
  21682: "reference", 49513: "reference", 28500: "reference", 11615: "reference",
  37134: "manual", 10766: "manual", 22298: "manual", 33870: "manual", 16317: "manual", 26318: "manual", 21829: "manual",
  14264: "manual", 14314: "manual", 20480: "manual", 21957: "manual", 23319: "manual", 17366: "manual", 65993: "manual",
  25290: "manual", 30325: "manual", 27367: "manual", 14640: "manual", 16713: "manual", 19924: "manual", 21840: "manual",
  12238: "cookbook", 29728: "cookbook", 10136: "cookbook", 65061: "cookbook",
  30802: "undecided", // Blackstone, Commentaries on the Laws of England: law
  2449: "undecided", // Holmes, The Common Law: law
  43945: "undecided", // MacGillivray, The Law of Copyright: law
  52105: "undecided", // Southard, Shell-shock and Other Neuropsychiatric Problems: medical case studies
};

export function formOf(book: { id: number; bookshelves: string[]; lcsh: string[]; lcc: string[] }): FormResult {
  const myth = MYTH_BY_HAND[book.id];
  if (myth) return { form: { key: "mythology", noun: myth, category: "puran-lokkotha" }, why: "myth, legend, fable or fairy tale (set by hand)" };
  const left = LEFT_OUT_BY_HAND[book.id];
  if (left) return { form: null, why: left === "undecided" ? "non-fiction that fits no rule: your decision" : `left out: ${left === "reference" ? "a reference work" : left === "manual" ? "a manual or textbook for drill" : "a cookbook"}` };
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
