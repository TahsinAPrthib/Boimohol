// What kind of book a work is, from Wikisource's own categories (on the scan's
// index and the work's main page) and, failing that, Wikidata's types. Only
// six categories exist on the site; forms that don't fit one get a proposed
// new category instead of being forced into the nearest.

export type Form = {
  key: string; // stable id for the form
  noun: string; // used in the neutral description: "<author>-এর <noun>"
  category: string; // existing slug, or a proposed one
  proposed?: { nameBangla: string; name: string };
};

const P = (key: string, noun: string, slug: string, nameBangla: string, name: string): Form => ({
  key,
  noun,
  category: slug,
  proposed: { nameBangla, name },
});
const E = (key: string, noun: string, slug: string): Form => ({ key, noun, category: slug });

// Checked in order: the first rule whose pattern matches a category wins, so
// the more specific forms (children's books, plays, historical fiction) come
// before the general ones.
const RULES: { test: RegExp; form: Form }[] = [
  { test: /শিশুতোষ|শিশু সাহিত্য|শিশুসাহিত্য|ছড়া|রূপকথা|কিশোর/, form: P("children", "শিশু-কিশোরদের বই", "shishu-sahitto", "শিশুসাহিত্য", "Children's books") },
  { test: /বিজ্ঞান কল্পকাহিনী/, form: E("scifi", "বিজ্ঞান কল্পকাহিনী", "biggan-kolpokahini") },
  { test: /অপরাধ|গোয়েন্দা|রহস্য|রোমাঞ্চকর/, form: E("mystery", "রহস্য-রোমাঞ্চ কাহিনি", "thriller-rohosso") },
  { test: /নাটক|নাট্য|প্রহসন|যাত্রাপালা|গীতিনাট্য|নৃত্যনাট্য/, form: P("play", "নাটক", "natok", "নাটক", "Plays") },
  { test: /উপন্যাস|ঐতিহাসিক কল্পকাহিনী|রোমাণ্টিক কল্পকাহিনী|কল্পকাহিনী/, form: E("novel", "উপন্যাস", "uponnash") },
  { test: /ছোটগল্প|ছোট গল্প|গল্প সংকলন|গল্পগ্রন্থ/, form: P("stories", "ছোটগল্পের বই", "chhotogolpo", "ছোটগল্প", "Short stories") },
  { test: /কাব্য|কবিতা|গাথা/, form: E("poetry", "কাব্যগ্রন্থ", "kobita") },
  { test: /সঙ্গীত|সংগীত|গান|গীতি/, form: P("songs", "গানের বই", "gaan", "গান", "Songs") },
  { test: /আত্মজীবনী/, form: E("autobiography", "আত্মজীবনী", "itihash-jiboni") },
  { test: /স্মৃতিকথা/, form: E("memoir", "স্মৃতিকথা", "itihash-jiboni") },
  { test: /জীবনী/, form: E("biography", "জীবনী", "itihash-jiboni") },
  { test: /ইতিহাস|ঐতিহাসিক (বর্ণনা|অকাল্পনিক)/, form: E("history", "ইতিহাস বিষয়ক বই", "itihash-jiboni") },
  { test: /ভ্রমণ/, form: P("travel", "ভ্রমণকাহিনি", "bhromon", "ভ্রমণকাহিনি", "Travel writing") },
  { test: /চিঠিপত্র|পত্রাবলী|পত্রসাহিত্য/, form: P("letters", "চিঠিপত্রের সংকলন", "chithipotro", "চিঠিপত্র", "Letters") },
  { test: /ধর্ম|দর্শন|উপনিষদ|পুরাণ|বেদ|বৈষ্ণব|ব্রাহ্ম|আধ্যাত্মিক/, form: P("religion", "ধর্ম ও দর্শন বিষয়ক বই", "dhormo-dorshon", "ধর্ম ও দর্শন", "Religion & philosophy") },
  { test: /প্রবন্ধ|সমালোচনা|বক্তৃতা|ভাষণ|রম্য|ব্যঙ্গ/, form: P("essays", "প্রবন্ধের বই", "probondho", "প্রবন্ধ", "Essays") },
  { test: /বিজ্ঞান|বৈজ্ঞানিক|প্রকৃতি|গণিত|চিকিৎসা/, form: P("science", "বিজ্ঞান বিষয়ক বই", "biggan", "বিজ্ঞান", "Science") },
  { test: /ব্যাকরণ|অভিধান|পাঠ্যপুস্তক|শিক্ষা|প্রাইমার|বর্ণপরিচয়/, form: P("education", "ভাষা ও শিক্ষা বিষয়ক বই", "shikkha", "ভাষা ও শিক্ষা", "Language & learning") },
];

// Wikidata types as a fallback, for works Wikisource hasn't categorised.
const WIKIDATA_TYPES: Record<string, string> = {
  Q8261: "novel",
  Q149537: "novel", // novella
  Q12106333: "poetry", // poetry collection
  Q5185: "poetry",
  Q482: "poetry",
  Q1279564: "stories", // short story collection
  Q49084: "stories",
  Q25379: "play",
  Q116476516: "play", // dramatic work
  Q35760: "essays",
  Q4184: "autobiography",
  Q36279: "biography",
  Q112983: "memoir",
  Q1164267: "travel",
  Q131539: "children",
  Q24925: "scifi",
  Q208505: "mystery",
};

const FORMS = new Map(RULES.map((r) => [r.form.key, r.form]));

// Categories that describe the publisher, place, year, language or author
// rather than the form -- ignored so "বাংলা সাহিত্য" can't decide anything.
const NOISE =
  /রচিত|অনূদিত|সম্পাদিত|প্রকাশিত|দ্বারা|হতে|খ্রিস্টাব্দ|নির্ঘণ্ট|পাতা$|উইকি|বৈধকৃত|মুদ্রণ|পরিভুক্তি|ওসিআর|ফাইল|^(বাংলা|ইংরেজি|ফরাসি|সংস্কৃত|অনুবাদ|হিন্দি|উর্দু|রুশ|জার্মান|ফারসি|আরবি|ভারতীয়|গ্রিক|ইতালীয়|স্প্যানিশ) সাহিত্য$/;

export function classify(categories: string[], wikidataTypes: string[]): Form | null {
  const useful = categories.filter((c) => !NOISE.test(c));
  for (const rule of RULES) if (useful.some((c) => rule.test.test(c))) return rule.form;
  for (const t of wikidataTypes) {
    const key = WIKIDATA_TYPES[t];
    if (key) return FORMS.get(key) ?? null;
  }
  return null;
}

export const PROPOSED_FORMS = RULES.map((r) => r.form).filter((f) => f.proposed);

// Forms set by hand, keyed `${titleBangla}|${author}` as in the import row:
// works Wikisource gives no form for, or whose categories mislead the rules
// (an adaptation of a play that is prose, say). Only where the form is known
// for certain; anything else stays "form unknown" for a person to choose.
export const FORM_BY_HAND: Record<string, string> = {
  "চন্দ্রলোকে যাত্রা|জুল ভার্ন": "scifi",
  "বেলুনে পাঁচ সপ্তাহ|জুল ভার্ন": "scifi",
  "বিশ্ব-ইতিহাস প্রসঙ্গ|জওহরলাল নেহরু": "history",
  "বাঙ্গালার ইতিহাস|রাখালদাস বন্দ্যোপাধ্যায়": "history",
  "স্বর্গীয় ঈশ্বরচন্দ্র বিদ্যাসাগর|রজনীকান্ত গুপ্ত": "biography",
  "চরিত-কথা|রামেন্দ্রসুন্দর ত্রিবেদী": "biography",
  "স্পেনীয় মুসলমান সভ্যতা|সৈয়দ ইসমাইল হোসেন সিরাজী": "history",
  "হুতোম প্যাঁচার নকশা|কালীপ্রসন্ন সিংহ": "essays",
  "ভ্রান্তিবিলাস|ঈশ্বরচন্দ্র বিদ্যাসাগর": "novel",
  "শকুন্তলা|অবনীন্দ্রনাথ ঠাকুর": "children",
  "বিশ্ব-পরিচয়|রবীন্দ্রনাথ ঠাকুর": "science",
  "বিজ্ঞানরহস্য|বঙ্কিমচন্দ্র চট্টোপাধ্যায়": "science",
  "ঔপনিষদ ব্রহ্ম|রবীন্দ্রনাথ ঠাকুর": "religion",
  "কথামালা|ঈসপ": "children",
  "ছন্দের টুংটাং|সুনির্মল বসু": "children",
  "গ্রহ-নক্ষত্র|জগদানন্দ রায়": "science",
  "পোকা-মাকড়|জগদানন্দ রায়": "science",
  "নব্য-বিজ্ঞান|চারুচন্দ্র ভট্টাচার্য": "science",
  "বিশ্বের উপাদান|চারুচন্দ্র ভট্টাচার্য": "science",
  "হিন্দু রসায়নী বিদ্যা|প্রফুল্লচন্দ্র রায়": "science",
  "গৌড়রাজমালা|রমাপ্রসাদ চন্দ": "history",
  "গৌড়লেখমালা|অক্ষয়কুমার মৈত্রেয়": "history",
  "পুরাবৃত্তের সংক্ষেপ বিবরণ|জন ক্লার্ক মার্শম্যান": "history",
  "নব্য জাপান ও রুষ জাপান যুদ্ধের ইতিহাস|উমাকান্ত হাজারী": "history",
  "প্রাচীন বাংলার গৌরব|হরপ্রসাদ শাস্ত্রী": "history",
  "ভারতে অলিকসন্দর|সত্যচরণ শাস্ত্রী": "history",
  "ভারতবর্ষের ইতিহাস|হেমলতা দেবী": "history",
  "বাঙ্গালার ইতিহাস|ঈশ্বরচন্দ্র বিদ্যাসাগর": "history",
  "হিন্দু অথবা প্রেসিডেন্সী কলেজের ইতিবৃত্ত|রাজনারায়ণ বসু": "history",
  "মোগল যুগে স্ত্রীশিক্ষা|ব্রজেন্দ্রনাথ বন্দ্যোপাধ্যায়": "history",
  "ভারত ও মধ্য এশিয়া|প্রবোধচন্দ্র বাগচী": "history",
  "ভারত ও চীন|প্রবোধচন্দ্র বাগচী": "history",
  "জাতীয় আন্দোলনে রবীন্দ্রনাথ|প্রফুল্লকুমার সরকার": "history",
  "চরিতাবলী|ঈশ্বরচন্দ্র বিদ্যাসাগর": "biography",
  "চরিতাষ্টক|কালীময় ঘটক": "biography",
  "ভারতীয় বিদুষী|মণিলাল গঙ্গোপাধ্যায়": "biography",
  "জেলের খাতা|বিপিনচন্দ্র পাল": "memoir",
  "মাউ মাউএর দেশে|রামনাথ বিশ্বাস": "travel",
  "বিলাতযাত্রী সন্ন্যাসীর চিঠি|ব্রহ্মবান্ধব উপাধ্যায়": "letters",
  "বীরবাণী|স্বামী বিবেকানন্দ": "poetry",
  "সঙ্গীত-সুধা|বিজয়কৃষ্ণ গোস্বামী": "songs",
  "নবীন|রবীন্দ্রনাথ ঠাকুর": "play",
  "কাহাকে?|স্বর্ণকুমারী দেবী": "novel",
  "সীতার বনবাস|ঈশ্বরচন্দ্র বিদ্যাসাগর": "novel",
  "হেক্‌টর বধ|মাইকেল মধুসূদন দত্ত": "novel",
  "টল্‌স্টয়ের গল্প|ল্যেভ তলস্তোয়": "stories",
  "গল্পস্বল্প|স্বর্ণকুমারী দেবী": "stories",
  "ভূতের বিচার|প্রিয়নাথ মুখোপাধ্যায়": "mystery",
  "মণিপুরের সেনাপতি|প্রিয়নাথ মুখোপাধ্যায়": "mystery",
  "কথোপকথন|উইলিয়াম কেরি": "education",
  "বাংলাভাষা-পরিচয়|রবীন্দ্রনাথ ঠাকুর": "education",
  "সংস্কৃত ব্যাকরণের উপক্রমণিকা|ঈশ্বরচন্দ্র বিদ্যাসাগর": "education",
  "বোধোদয়|ঈশ্বরচন্দ্র বিদ্যাসাগর": "education",
  "এপিক্‌টেটসের উপদেশ|আররিয়ানোস": "religion",
  "মার্কাস্‌ অরিলিয়সের আত্মচিন্তা|মার্কাস অরিলিয়স": "religion",
  "ব্রাহ্মধর্ম্মের মত ও বিশ্বাস|দেবেন্দ্রনাথ ঠাকুর": "religion",
  "তত্ত্ববিচার|কৃষ্ণপ্রসন্ন সেন": "religion",
  "খৃষ্ট|রবীন্দ্রনাথ ঠাকুর": "religion",
  "বুদ্ধদেব|রবীন্দ্রনাথ ঠাকুর": "religion",
  "মানুষের ধর্ম্ম|রবীন্দ্রনাথ ঠাকুর": "religion",
  "মহাত্মা গান্ধী|রবীন্দ্রনাথ ঠাকুর": "essays",
  "পথের সঞ্চয়|রবীন্দ্রনাথ ঠাকুর": "essays",
  "শ্যামাপ্রসাদের কয়েকটি রচনা|শ্যামাপ্রসাদ মুখোপাধ্যায়": "essays",
  "কৃষক আন্দোলন ও মধ্যবিত্ত|সুশীলকুমার বসু": "essays",
  "ইসলাম ও কমিউনিজ্‌ম্‌|গোলাম মোস্তফা": "essays",
  "ভারত কোন্ পথে?|বারীন্দ্রকুমার ঘোষ": "essays",
  "সাহিত্যে প্রগতি|ভূপেন্দ্রনাথ দত্ত": "essays",
  "সাহিত্যে নারী: স্রষ্ট্রী ও সৃষ্টি|অনুরূপা দেবী": "essays",
  "কালিদাস ও ভবভূতি|রাজেন্দ্রনাথ বিদ্যাভূষণ": "essays",
  "লেখকের কথা|মানিক বন্দ্যোপাধ্যায়": "essays",
  "তরুণের স্বপ্ন|সুভাষচন্দ্র বসু": "essays",
  "বিশ্বমানবের লক্ষ্মীলাভ|সুরেন্দ্রনাথ ঠাকুর": "essays",
  "স্বপ্ন|গিরীন্দ্রশেখর বসু": "essays",
  "বাষ্পীয় রথারোহীদিগের প্রতি উপদেশ|অক্ষয়কুমার দত্ত": "essays",
  "নিষ্কৃতিলাভপ্রয়াস|ঈশ্বরচন্দ্র বিদ্যাসাগর": "essays",
  "ব্রজবিলাস|ঈশ্বরচন্দ্র বিদ্যাসাগর": "essays",
  "কৃত্তিবাস স্মৃতিচিহ্ন স্থাপন|আশুতোষ মুখোপাধ্যায়": "essays",
  "৺কৃত্তিবাসের পরিচয় সংগ্রহ|হরিশচন্দ্র মিত্র": "essays",
  "পল্লীগ্রামস্থ চৌকীদার বিষয়ক প্রস্তাবিত রাজ নিয়মের বিরুদ্ধে ভারতবর্ষীয় সভার আবেদন|দেবেন্দ্রনাথ ঠাকুর": "essays",
  "শ্রীযুত ডাক্তর এম, জে, ব্রমলি সাহেবের বক্তৃতার দ্বারা সংক্ষেপ আবেদন|মাউন্টফোর্ড জোসেফ ব্রমলি": "essays",
};

export function formByKey(key: string): Form {
  const form = FORMS.get(key);
  if (!form) throw new Error(`unknown form "${key}"`);
  return form;
}
