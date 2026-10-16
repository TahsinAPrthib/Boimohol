// Death years for authors Wikidata has none for, each confirmed by a source
// a person checked (evidence gathered by death-evidence.ts, 2026-10-16).
// Only these are used; every other author without a Wikidata death year
// stays excluded, with the reason below shown in the report.
//
// For an author known only by era, `year` is the latest year the source
// allows (the end of the century it names), so the public-domain check errs
// strict, and `era` is what the rights note says instead of a year.

export type DeathFinding = {
  year: number;
  era?: string; // Bangla, for the rights note: "<role> <name> <era>"
  sources: { url: string; says: string }[];
};

export const CONFIRMED_DEATHS: Record<string, DeathFinding> = {
  // রাজীবলোচন মুখোপাধ্যায় — মহারাজ কৃষ্ণচন্দ্র রায়স্য চরিত্রং
  Q28060605: {
    year: 1900,
    era: "আঠারো-উনিশ শতকের লেখক",
    sources: [
      {
        url: "https://bn.banglapedia.org/index.php/মুখোপাধ্যায়,_রাজীবলোচন",
        says: "মুখোপাধ্যায়, রাজীবলোচন (১৮শ-১৯শ শতক) … একমাত্র গ্রন্থ কৃষ্ণচন্দ্ররায়স্য চরিত্রম (১৮০৫)",
      },
    ],
  },
  // বাল্মীকি — অদ্ভুত রামায়ণ (সৌদামিনী দেবীর অনুবাদ)
  Q715607: {
    year: 300,
    era: "প্রাচীন ভারতের কবি",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Valmiki",
        says: "the earliest stage of the [Ramayana] text … 8th to 4th centuries BCE, and later stages extending up to the 3rd century CE (cites Goldman 1984; Brockington 1998)",
      },
    ],
  },
  // ভানুদত্ত মিশ্র — রসমঞ্জরী (ভারতচন্দ্র রায়ের অনুবাদ)
  Q115902455: {
    year: 1600,
    era: "পনেরো-ষোলো শতকের কবি",
    sources: [
      {
        url: "https://en.wikipedia.org/wiki/Bhanudatta_Misra",
        says: "a Sanskrit poet … dated to some time in the late 15th and early 16th century (cites Pollock 2009, NYU Press)",
      },
    ],
  },
  // কুমুদিনী বসু — সাহিত্য-চিন্তা. Neither Wikipedia cites the year, but
  // both put it in 1942–43; the year used is the later one, and even a
  // decade's error would leave it before the cutoff (decided 2026-10-16).
  Q141100605: {
    year: 1943,
    era: "আনুমানিক ১৯৪২–৪৩ সালে মারা গেছেন (সাল নিশ্চিত নয়, তবে দশ বছরের ভুল হলেও তা ১৯৬৫-র আগে)",
    sources: [
      { url: "https://bn.wikipedia.org/wiki/কুমুদিনী_বসু", says: "কুমুদিনী বসু (১৮৭৮ – ১৯৪৩) ছিলেন একজন সাহিত্যিক এবং সমাজসেবক। (lists সাহিত্য-চিন্তা among her works; cites only Wikisource)" },
      { url: "https://en.wikipedia.org/wiki/Kumudini_Basu", says: "Kumudini Basu (née Mitra, 1873–1942) was a Bengali writer, social reformer … (death year marked 'citation needed')" },
    ],
  },
  // ভূষণভট্ট — কাদম্বরী (with his father বাণভট্ট; তারাশঙ্কর তর্করত্নের অনুবাদ)
  Q133386331: {
    year: 800,
    era: "সাত শতকের লেখক বাণভট্টের পুত্র",
    sources: [
      { url: "https://en.wikipedia.org/wiki/Kadambari", says: "The novel was completed by Banabhatta's son Bhushanabhatta" },
      { url: "https://en.wikipedia.org/wiki/Banabhatta", says: "a 7th-century Sanskrit prose writer and poet (cites Upinder Singh)" },
    ],
  },
};

// Why the others weren't confirmed, where there's more to say than "no
// source found". The report lists every author.
export const NOT_CONFIRMED: Record<string, string> = {
  Q33133756: "কৈলাসবাসিনী দেবী: bn Wikipedia gives her death as '?' yet files her under 1895 deaths; nothing cited.",
  Q28309662: "আশুতোষ মুখোপাধ্যায় (প্রমোদকামিনী কাব্য): Wikipedia has two writers of this name (1864–1924, 1920–1989); nothing ties either to this book.",
  Q139815811: "সুরেন্দ্রনাথ বন্দ্যোপাধ্যায় (বিজ্ঞান বাবু): the only article of this name is the politician (1848–1925); nothing ties him to this book.",
  Q134523011: "চারুশীলা দেবী (বেহুলা): two articles of this name (1883–?, 1882–1979); nothing ties either to this book.",
  Q117038792: "তারাপদ বন্দ্যোপাধ্যায় (দার্জ্জিলিঙ্গ-প্রবাসীর পত্র): the article of this name is a photographer (1946–2024), not this author.",
  Q94513389: "মানদা দেবী: Wikidata gives her birth (1900) but no source gives a death year.",
  Q132157373: "এনামূল হক পলাশ: a living author (born 1977, Wikidata).",
  Q130320353: "রণবীর পুরকায়স্থ: born 1949 (Wikidata); a recent author.",
  Q130347926: "আশিসরঞ্জন নাথ: born 1960 (Wikidata); a recent author.",
  Q19745349: "হাসান ফকরী: a living author (born 1952, bn Wikipedia).",
  Q50810370: "তপোধীর ভট্টাচার্য: a living author (born 1949, bn Wikipedia).",
  Q130396512: "সঞ্জীব দেবলস্কর: born 1957 (Wikidata); a recent author.",
  Q123913764: "পিনাকী বিশ্বাস: described on Wikidata as a Bangla Wikipedian; a contemporary author.",
};

export const NO_SOURCE = "no death year in Wikidata, bn/en Wikipedia or Banglapedia";
