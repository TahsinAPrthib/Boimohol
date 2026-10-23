// Every cover candidate, checked by eye on contact sheets (2026-10-22):
// accepted with the page, kind of image, edition year and any artist, or
// rejected with the reason. Generated from the review notes; keyed by the
// book's first bookKey (author + NUL + title, as scripts/covers-prepare.ts
// computes it). Books missing here had no candidate image at all.
export type Decision =
  | { verdict: "reject"; reason: string }
  | {
      verdict: "accept";
      from: "wikisource" | "gutenberg" | "commons";
      kind: "cover" | "title" | "binding";
      page?: number;
      file?: string;
      edition?: number;
      useMedium?: boolean;
      artist?: { name: string; died: number };
    };

export const DECISIONS: Record<string, Decision> = {
  // পথের পাঁচালী — বিভূতিভূষণ বন্দ্যোপাধ্যায়
  "বিভূতিভূষণ বন্দ্যোপাধ্যায়\u0000pather panchali": { verdict: "reject", reason: "Commons has no scan of the book (film stills and photos only)" },
  // শেষের কবিতা — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000shesher kobita": { verdict: "reject", reason: "printing year not shown; this Visva-Bharati imprint was used into the 1970s" },
  // দেবদাস — শরৎচন্দ্র চট্টোপাধ্যায়
  "শরৎচন্দ্র চট্টোপাধ্যায়\u0000devdas": { verdict: "reject", reason: "later printing (Kolkata PIN code, after 1972)" },
  // সোনার তরী — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000sonar tori": { verdict: "accept", from: "wikisource", kind: "title", edition: 1893 },
  // The Adventures of Sherlock Holmes — Arthur Conan Doyle
  "arthur conan doyle\u0000the adventures of sherlock holmes": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1892 },
  // The War of the Worlds — H. G. Wells
  "h. g. wells\u0000the war of the worlds": { verdict: "reject", reason: "producer's composite (modern title over an illustration)" },
  // কপালকুণ্ডলা — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000kopalkundala": { verdict: "accept", from: "wikisource", kind: "cover", edition: 1870 },
  // দুর্গেশনন্দিনী — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000durgeshnandini": { verdict: "accept", from: "commons", kind: "title", page: 1, file: "দুর্গেশনন্দিনী বঙ্কিমচন্দ্র চট্টোপাধ্যায়.djvu", edition: 1894 },
  // আনন্দমঠ — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000anandamath": { verdict: "accept", from: "wikisource", kind: "title", edition: 1938 },
  // বিষবৃক্ষ — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000bishabriksha": { verdict: "accept", from: "commons", kind: "title", page: 2, file: "বিষবৃক্ষ-বঙ্কিমচন্দ্র চট্টোপাধ্যায়.djvu" },
  // গোরা — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000gora": { verdict: "accept", from: "wikisource", kind: "title", edition: 1961 },
  // চোখের বালি — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000chokher bali": { verdict: "reject", reason: "the only scan on Commons is a modern Visva-Bharati printing (ISBN)" },
  // ঘরে বাইরে — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000ghare baire": { verdict: "accept", from: "commons", kind: "title", page: 1, file: "ঘরে-বাইরে - রবীন্দ্রনাথ ঠাকুর.pdf", edition: 1926 },
  // নৌকাডুবি — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000noukadubi": { verdict: "accept", from: "commons", kind: "title", page: 5, file: "নৌকাডুবি-রবীন্দ্রনাথ ঠাকুর.pdf", edition: 1961 },
  // শ্রীকান্ত — শরৎচন্দ্র চট্টোপাধ্যায়
  "শরৎচন্দ্র চট্টোপাধ্যায়\u0000srikanta": { verdict: "accept", from: "wikisource", kind: "title" },
  // পথের দাবী — শরৎচন্দ্র চট্টোপাধ্যায়
  "শরৎচন্দ্র চট্টোপাধ্যায়\u0000pather dabi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1958 },
  // পরিণীতা — শরৎচন্দ্র চট্টোপাধ্যায়
  "শরৎচন্দ্র চট্টোপাধ্যায়\u0000parineeta": { verdict: "reject", reason: "Commons has no scan of the book (photos of people only)" },
  // গৃহদাহ — শরৎচন্দ্র চট্টোপাধ্যায়
  "শরৎচন্দ্র চট্টোপাধ্যায়\u0000grihadaha": { verdict: "reject", reason: "the Commons scan has no title page; the other hit is a 1936 film booklet" },
  // অপরাজিত — বিভূতিভূষণ বন্দ্যোপাধ্যায়
  "বিভূতিভূষণ বন্দ্যোপাধ্যায়\u0000aparajito": { verdict: "reject", reason: "Commons has no scan of the book (photos only)" },
  // আরণ্যক — বিভূতিভূষণ বন্দ্যোপাধ্যায়
  "বিভূতিভূষণ বন্দ্যোপাধ্যায়\u0000aranyak": { verdict: "reject", reason: "Commons has no scan of the book (photos only)" },
  // পদ্মানদীর মাঝি — মানিক বন্দ্যোপাধ্যায়
  "মানিক বন্দ্যোপাধ্যায়\u0000padma nadir majhi": { verdict: "reject", reason: "later printing (PIN code) with a website's logo printed on the page" },
  // তিতাস একটি নদীর নাম — অদ্বৈত মল্লবর্মণ
  "অদ্বৈত মল্লবর্মণ\u0000titash ekti nadir naam": { verdict: "reject", reason: "title barely legible" },
  // আলালের ঘরের দুলাল — প্যারীচাঁদ মিত্র
  "প্যারীচাঁদ মিত্র\u0000alaler gharer dulal": { verdict: "accept", from: "wikisource", kind: "title", edition: 1870 },
  // বিষাদ-সিন্ধু — মীর মশাররফ হোসেন
  "মীর মশাররফ হোসেন\u0000bishad sindhu": { verdict: "accept", from: "commons", kind: "title", page: 1, file: "বিষাদ-সিন্ধু.djvu", edition: 1935 },
  // অপরাধ ও শাস্তি — Fyodor Dostoevsky
  "fyodor dostoevsky\u0000crime and punishment": { verdict: "reject", reason: "producer's composite" },
  // গীতাঞ্জলি — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000gitanjali": { verdict: "accept", from: "wikisource", kind: "title", edition: 1913 },
  // মানসী — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000manasi": { verdict: "reject", reason: "a library stamp sits on the only usable title page" },
  // বলাকা — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000balaka": { verdict: "reject", reason: "the Commons scan has no title page (it opens on a faint inscription)" },
  // চিত্রা — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000chitra": { verdict: "accept", from: "wikisource", kind: "title", edition: 1895 },
  // মেঘনাদবধ কাব্য — মাইকেল মধুসূদন দত্ত
  "মাইকেল মধুসূদন দত্ত\u0000meghnadbadh kabya": { verdict: "accept", from: "commons", kind: "title", page: 1, file: "মেঘনাদবধ কাব্য - মাইকেল মধুসূদন দত্ত (১৯৪০).pdf", edition: 1940 },
  // চতুর্দশপদী কবিতাবলী — মাইকেল মধুসূদন দত্ত
  "মাইকেল মধুসূদন দত্ত\u0000chaturdashpadi kabitabali": { verdict: "reject", reason: "the title is set inside a large seal and hard to read; a library stamp at the edge" },
  // বনলতা সেন — জীবনানন্দ দাশ
  "জীবনানন্দ দাশ\u0000banalata sen": { verdict: "reject", reason: "Signet edition cover by Satyajit Ray (d. 1992); the first-edition image shows front and back together" },
  // রূপসী বাংলা — জীবনানন্দ দাশ
  "জীবনানন্দ দাশ\u0000rupashi bangla": { verdict: "reject", reason: "scan damaged (stripes); Signet cover art" },
  // ধূসর পাণ্ডুলিপি — জীবনানন্দ দাশ
  "জীবনানন্দ দাশ\u0000dhusar pandulipi": { verdict: "reject", reason: "Commons has no scan of the book" },
  // ছাড়পত্র — সুকান্ত ভট্টাচার্য
  "সুকান্ত ভট্টাচার্য\u0000chharpatra": { verdict: "accept", from: "wikisource", kind: "title", edition: 1955 },
  // আবোল তাবোল — সুকুমার রায়
  "সুকুমার রায়\u0000abol tabol": { verdict: "reject", reason: "Commons has a cartoon by the author but not the book's cover" },
  // জীবনস্মৃতি — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000jibansmriti": { verdict: "accept", from: "wikisource", kind: "title", edition: 1941 },
  // ছেলেবেলা — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000chhelebela": { verdict: "reject", reason: "the only scan on Commons is a modern Visva-Bharati printing (ISBN)" },
  // The Story of My Experiments with Truth — Mohandas Karamchand Gandhi
  "mohandas karamchand gandhi\u0000the story of my experiments with truth": { verdict: "accept", from: "commons", kind: "title", page: 9, file: "Gandhi - The Story of My Experiments With Truth, vol. 1.pdf", edition: 1927 },
  // কর্মযোগ — স্বামী বিবেকানন্দ
  "স্বামী বিবেকানন্দ\u0000karma yoga": { verdict: "reject", reason: "Commons search found only other books" },
  // দ্য প্রফেট — Kahlil Gibran
  "kahlil gibran\u0000the prophet": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1923, artist: { name: "Kahlil Gibran", died: 1931 } },
  // দ্য ওল্ড ম্যান অ্যান্ড দ্য সি — Ernest Hemingway
  "ernest hemingway\u0000the old man and the sea": { verdict: "accept", from: "commons", kind: "title", file: "Ernest Hemingway The old man Jonathan Cape 1952 Title.jpg", edition: 1952 },
  // লিভস অব গ্রাস — Walt Whitman
  "walt whitman\u0000leaves of grass": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // দ্য ডিসকভারি অব ইন্ডিয়া — Jawaharlal Nehru
  "jawaharlal nehru\u0000the discovery of india": { verdict: "reject", reason: "only a photograph of an open signed copy" },
  // গ্লিম্পসেস অব ওয়ার্ল্ড হিস্ট্রি — Jawaharlal Nehru
  "jawaharlal nehru\u0000glimpses of world history": { verdict: "reject", reason: "Commons search found only translations and other books" },
  // অটোবায়োগ্রাফি অব আ যোগী — Paramahansa Yogananda
  "paramahansa yogananda\u0000autobiography of a yogi": { verdict: "reject", reason: "producer's composite" },
  // আপ ফ্রম স্লেভারি — Booker T. Washington
  "booker t. washington\u0000up from slavery": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // দ্য হাউন্ড অব দ্য বাস্কারভিলস — Arthur Conan Doyle
  "arthur conan doyle\u0000the hound of the baskervilles": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1902, artist: { name: "Alfred Garth Jones", died: 1955 } },
  // আ স্টাডি ইন স্কারলেট — Arthur Conan Doyle
  "arthur conan doyle\u0000a study in scarlet": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // দ্য সাইন অব দ্য ফোর — Arthur Conan Doyle
  "arthur conan doyle\u0000the sign of the four": { verdict: "reject", reason: "producer's composite" },
  // দ্য মুনস্টোন — Wilkie Collins
  "wilkie collins\u0000the moonstone": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // দ্য মলটিজ ফ্যালকন — Dashiell Hammett
  "dashiell hammett\u0000the maltese falcon": { verdict: "accept", from: "commons", kind: "title", page: 7, file: "The Maltese Falcon (1930).pdf", edition: 1930 },
  // দ্য বিগ স্লিপ — Raymond Chandler
  "raymond chandler\u0000the big sleep": { verdict: "reject", reason: "Commons has film stills only" },
  // দ্য কাউন্ট অব মন্টি ক্রিস্টো — Alexandre Dumas
  "alexandre dumas\u0000the count of monte cristo": { verdict: "accept", from: "commons", kind: "title", page: 11, file: "The Count of Monte-Cristo (IA countofmontecris00duma 3).pdf", edition: 1888 },
  // ফ্রাঙ্কেনস্টাইন — Mary Shelley
  "mary shelley\u0000frankenstein": { verdict: "reject", reason: "producer's composite" },
  // দ্য টাইম মেশিন — H. G. Wells
  "h. g. wells\u0000the time machine": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1895 },
  // দ্য ইনভিজিবল ম্যান — H. G. Wells
  "h. g. wells\u0000the invisible man": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1897 },
  // দ্য আইল্যান্ড অব ডক্টর মোরো — H. G. Wells
  "h. g. wells\u0000the island of doctor moreau": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // টোয়েন্টি থাউজ্যান্ড লিগস আন্ডার দ্য সিজ — Jules Verne
  "jules verne\u0000twenty thousand leagues under the seas": { verdict: "reject", reason: "only interior illustrations and a collected-works volume" },
  // জার্নি টু দ্য সেন্টার অব দি আর্থ — Jules Verne
  "jules verne\u0000journey to the center of the earth": { verdict: "reject", reason: "the cover image on Commons was taken from a bookseller's site" },
  // ফ্রম দি আর্থ টু দ্য মুন — Jules Verne
  "jules verne\u0000from the earth to the moon": { verdict: "reject", reason: "the binding photo on Commons has no source or date" },
  // নাইনটিন এইটি-ফোর — George Orwell
  "george orwell\u0000nineteen eighty-four": { verdict: "reject", reason: "first-edition jacket designed by Michael Kennard, whose death year isn't established; the rest are modern" },
  // মেডিটেশনস — Marcus Aurelius
  "marcus aurelius\u0000meditations": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // সেলফ-হেল্প — Samuel Smiles
  "samuel smiles\u0000self-help": { verdict: "reject", reason: "title barely legible" },
  // ব্রেভ নিউ ওয়ার্ল্ড — Aldous Huxley
  "aldous huxley\u0000brave new world": { verdict: "reject", reason: "Commons has merchandise and a different book's jacket only" },
  // উই — Yevgeny Zamyatin
  "yevgeny zamyatin\u0000we": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1924 },
  // অ্যাজ আ ম্যান থিংকেথ — James Allen
  "james allen\u0000as a man thinketh": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // দ্য সায়েন্স অব গেটিং রিচ — Wallace D. Wattles
  "wallace d. wattles\u0000the science of getting rich": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1910 },
  // দ্য রিচেস্ট ম্যান ইন ব্যাবিলন — George S. Clason
  "george s. clason\u0000the richest man in babylon": { verdict: "reject", reason: "the Commons PDF is a modern retypeset text without the original cover" },
  // একরস অব ডায়মন্ডস — Russell H. Conwell
  "russell h. conwell\u0000acres of diamonds": { verdict: "accept", from: "commons", kind: "cover", page: 1, file: "Acres of diamonds - a lecture (IA acresofdiamondsl00conw).pdf" },
  // হাউ টু স্টপ ওয়ারিং অ্যান্ড স্টার্ট লিভিং — Dale Carnegie
  "dale carnegie\u0000how to stop worrying and start living": { verdict: "reject", reason: "Commons search found only other documents" },
  // দ্য ওয়েস্ট ল্যান্ড — T. S. Eliot
  "t. s. eliot\u0000the waste land": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // দ্য থার্টি-নাইন স্টেপস — John Buchan
  "john buchan\u0000the thirty-nine steps": { verdict: "reject", reason: "art signed by an unidentified artist" },
  // বাষ্পীয় রথারোহীদিগের প্রতি উপদেশ — অক্ষয়কুমার দত্ত
  "অক্ষয়কুমার দত্ত\u0000bashpiya ratharohidiger prati upadesha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1855 },
  // গৌড়লেখমালা — অক্ষয়কুমার মৈত্রেয়
  "অক্ষয়কুমার মৈত্রেয়\u0000gourlekhamala (pratham stabak)": { verdict: "accept", from: "wikisource", kind: "title", edition: 1912 },
  // সিরাজদ্দৌলা — অক্ষয়কুমার মৈত্রেয়
  "অক্ষয়কুমার মৈত্রেয়\u0000sirajddoula": { verdict: "accept", from: "wikisource", kind: "title", page: 3, edition: 1902 },
  // কাব্যপরিক্রমা — অজিতকুমার চক্রবর্তী
  "অজিতকুমার চক্রবর্তী\u0000kabyaparikrama": { verdict: "accept", from: "wikisource", kind: "title", edition: 1958 },
  // রবীন্দ্রনাথ — অজিতকুমার চক্রবর্তী
  "অজিতকুমার চক্রবর্তী\u0000rabindranath": { verdict: "accept", from: "wikisource", kind: "title", edition: 1960 },
  // ললিতাসুন্দরী ও কবিতাবলী — অধরলাল সেন
  "অধরলাল সেন\u0000lalita sundari o kabitabali": { verdict: "accept", from: "wikisource", kind: "title", edition: 1878 },
  // মধুমল্লী — অনুরূপা দেবী
  "অনুরূপা দেবী\u0000madhumalli": { verdict: "accept", from: "wikisource", kind: "title", edition: 1917 },
  // সাহিত্যে নারী: স্রষ্ট্রী ও সৃষ্টি — অনুরূপা দেবী
  "অনুরূপা দেবী\u0000sahitye nari: srashtri o srishti": { verdict: "accept", from: "wikisource", kind: "title", edition: 1949 },
  // ঘরোয়া — অবনীন্দ্রনাথ ঠাকুর
  "অবনীন্দ্রনাথ ঠাকুর\u0000gharoya": { verdict: "reject", reason: "1970 printing (after the cutoff)" },
  // জোড়াসাঁকোর ধারে — অবনীন্দ্রনাথ ঠাকুর
  "অবনীন্দ্রনাথ ঠাকুর\u0000jorasankor dhare": { verdict: "accept", from: "wikisource", kind: "title", edition: 1944 },
  // বাগেশ্বরী শিল্প-প্রবন্ধাবলী — অবনীন্দ্রনাথ ঠাকুর
  "অবনীন্দ্রনাথ ঠাকুর\u0000bageshwari shilpa-prabandhabali": { verdict: "accept", from: "wikisource", kind: "title", edition: 1941 },
  // বুড়ো আংলা — অবনীন্দ্রনাথ ঠাকুর
  "অবনীন্দ্রনাথ ঠাকুর\u0000buro angla": { verdict: "reject", reason: "Signet Press decoration by an unidentified artist" },
  // ভারতশিল্পে মূর্তি — অবনীন্দ্রনাথ ঠাকুর
  "অবনীন্দ্রনাথ ঠাকুর\u0000bharatshilpe murti": { verdict: "accept", from: "wikisource", kind: "title", edition: 1947 },
  // রাজকাহিনী — অবনীন্দ্রনাথ ঠাকুর
  "অবনীন্দ্রনাথ ঠাকুর\u0000rajakahini": { verdict: "reject", reason: "library stamps and marks over the title" },
  // শকুন্তলা — অবনীন্দ্রনাথ ঠাকুর
  "অবনীন্দ্রনাথ ঠাকুর\u0000shakuntala": { verdict: "accept", from: "wikisource", kind: "title", edition: 1902 },
  // বক্সা ক্যাম্প — অমলেন্দু দাশগুপ্ত
  "অমলেন্দু দাশগুপ্ত\u0000buxa camp": { verdict: "accept", from: "wikisource", kind: "title", edition: 1949 },
  // জগন্নাথের রথ — অরবিন্দ ঘোষ
  "অরবিন্দ ঘোষ\u0000jagannather rath": { verdict: "accept", from: "wikisource", kind: "title", edition: 1950 },
  // অশ্বঘোষের বুদ্ধচরিত — অশ্বঘোষ
  "অশ্বঘোষ\u0000buddhacharita": { verdict: "accept", from: "wikisource", kind: "title", edition: 1945 },
  // ভারতবর্ষে — আঁদ্রে শেভ্রিয়োঁ
  "আঁদ্রে শেভ্রিয়োঁ\u0000dans l’inde": { verdict: "accept", from: "wikisource", kind: "title", edition: 1903 },
  // এপিক্‌টেটসের উপদেশ — আররিয়ানোস
  "আররিয়ানোস\u0000epiktētou diatribai": { verdict: "accept", from: "wikisource", kind: "title", edition: 1907 },
  // এনক আর্ডেন — আলফ্রেড টেনিসন
  "আলফ্রেড টেনিসন\u0000enoch arden": { verdict: "accept", from: "wikisource", kind: "title", edition: 1911 },
  // কৃত্তিবাস স্মৃতিচিহ্ন স্থাপন — আশুতোষ মুখোপাধ্যায়
  "আশুতোষ মুখোপাধ্যায়\u0000krrittibas smritichinha sthapan": { verdict: "accept", from: "wikisource", kind: "title", edition: 1916 },
  // জাতীয় সাহিত্য — আশুতোষ মুখোপাধ্যায়
  "আশুতোষ মুখোপাধ্যায়\u0000jatiya sahitya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1936 },
  // আমার খাতা — ইন্দিরা দেবী
  "ইন্দিরা দেবী\u0000amar khata": { verdict: "accept", from: "wikisource", kind: "title", edition: 1912 },
  // স্রোতের গতি — ইন্দিরা দেবী
  "ইন্দিরা দেবী\u0000sroter gati": { verdict: "accept", from: "wikisource", kind: "title", edition: 1921 },
  // দুধ-ভাত — ইন্দিরা দেবী চৌধুরানী
  "ইন্দিরা দেবী চৌধুরানী\u0000dudh-bhat": { verdict: "accept", from: "wikisource", kind: "title", edition: 1953 },
  // বিলাত ভ্রমণ — ইন্দুমাধব মল্লিক
  "ইন্দুমাধব মল্লিক\u0000bilat bhraman": { verdict: "accept", from: "wikisource", kind: "title", edition: 1910 },
  // আখ্যানমঞ্জরী — ঈশ্বরচন্দ্র বিদ্যাসাগর
  "ঈশ্বরচন্দ্র বিদ্যাসাগর\u0000akhyanmanjari (part 2)": { verdict: "accept", from: "wikisource", kind: "title", edition: 1920 },
  // চরিতাবলী — ঈশ্বরচন্দ্র বিদ্যাসাগর
  "ঈশ্বরচন্দ্র বিদ্যাসাগর\u0000charitabali": { verdict: "accept", from: "wikisource", kind: "title", edition: 1869 },
  // নিষ্কৃতিলাভপ্রয়াস — ঈশ্বরচন্দ্র বিদ্যাসাগর
  "ঈশ্বরচন্দ্র বিদ্যাসাগর\u0000nishkritilabhprayas": { verdict: "accept", from: "wikisource", kind: "title", edition: 1888 },
  // বর্ণপরিচয় — ঈশ্বরচন্দ্র বিদ্যাসাগর
  "ঈশ্বরচন্দ্র বিদ্যাসাগর\u0000barnaparichay": { verdict: "accept", from: "wikisource", kind: "cover", edition: 1876 },
  // বহুবিবাহ রহিত হওয়া উচিত কিনা এতদ্বিষয়ক বিচার — ঈশ্বরচন্দ্র বিদ্যাসাগর
  "ঈশ্বরচন্দ্র বিদ্যাসাগর\u0000bahubibaha rahit haoa uchit kina etadbishayak bichar": { verdict: "accept", from: "wikisource", kind: "title", edition: 1871 },
  // বাঙ্গালার ইতিহাস — ঈশ্বরচন্দ্র বিদ্যাসাগর
  "ঈশ্বরচন্দ্র বিদ্যাসাগর\u0000bangalar itihas": { verdict: "accept", from: "wikisource", kind: "title", edition: 1853 },
  // বিদ্যাসাগর চরিত — ঈশ্বরচন্দ্র বিদ্যাসাগর
  "ঈশ্বরচন্দ্র বিদ্যাসাগর\u0000vidyasagar charit": { verdict: "accept", from: "wikisource", kind: "title", edition: 1891 },
  // বোধোদয় — ঈশ্বরচন্দ্র বিদ্যাসাগর
  "ঈশ্বরচন্দ্র বিদ্যাসাগর\u0000bodhodoy": { verdict: "accept", from: "wikisource", kind: "title", edition: 1852 },
  // ব্রজবিলাস — ঈশ্বরচন্দ্র বিদ্যাসাগর
  "ঈশ্বরচন্দ্র বিদ্যাসাগর\u0000brajabilas": { verdict: "accept", from: "wikisource", kind: "title", edition: 1884 },
  // ভ্রান্তিবিলাস — ঈশ্বরচন্দ্র বিদ্যাসাগর
  "ঈশ্বরচন্দ্র বিদ্যাসাগর\u0000bhranti bilas": { verdict: "accept", from: "wikisource", kind: "title", edition: 1886 },
  // শকুন্তলা — ঈশ্বরচন্দ্র বিদ্যাসাগর
  "ঈশ্বরচন্দ্র বিদ্যাসাগর\u0000shakuntala": { verdict: "accept", from: "wikisource", kind: "title", edition: 1854 },
  // সংস্কৃত ব্যাকরণের উপক্রমণিকা — ঈশ্বরচন্দ্র বিদ্যাসাগর
  "ঈশ্বরচন্দ্র বিদ্যাসাগর\u0000sanskrit byakaraner upakramanika": { verdict: "accept", from: "wikisource", kind: "title", edition: 1851 },
  // সীতার বনবাস — ঈশ্বরচন্দ্র বিদ্যাসাগর
  "ঈশ্বরচন্দ্র বিদ্যাসাগর\u0000sitar banabas": { verdict: "accept", from: "wikisource", kind: "title", edition: 1897 },
  // কথামালা — ঈসপ
  "ঈসপ\u0000aesop's fables": { verdict: "accept", from: "wikisource", kind: "title", edition: 1877 },
  // কথোপকথন — উইলিয়াম কেরি
  "উইলিয়াম কেরি\u0000dialogues, intended to facilitate the acquiring of the bengali language": { verdict: "accept", from: "wikisource", kind: "title", edition: 1801 },
  // গুপি গাইন ও বাঘা বাইন — উপেন্দ্রকিশোর রায়চৌধুরী
  "উপেন্দ্রকিশোর রায়চৌধুরী\u0000gupi gain o bagha bain": { verdict: "accept", from: "wikisource", kind: "title", edition: 1963 },
  // টুনটুনির বই — উপেন্দ্রকিশোর রায়চৌধুরী
  "উপেন্দ্রকিশোর রায়চৌধুরী\u0000ţunţuni'r boi": { verdict: "reject", reason: "cover art and lettering by an unidentified artist on a 1964 edition" },
  // নব্য জাপান ও রুষ জাপান যুদ্ধের ইতিহাস — উমাকান্ত হাজারী
  "উমাকান্ত হাজারী\u0000nabya japan o rush japan juddher itihas": { verdict: "accept", from: "wikisource", kind: "title", edition: 1906 },
  // বেদিয়া বালিকা — উমেশচন্দ্র দত্ত
  "উমেশচন্দ্র দত্ত\u0000bediya balika": { verdict: "accept", from: "wikisource", kind: "title", edition: 1884 },
  // রোবাইয়াৎ-ই-ওমর খৈয়াম — ওমর খৈয়াম
  "ওমর খৈয়াম\u0000rubáiyát of omar khayyám": { verdict: "accept", from: "wikisource", kind: "cover", edition: 1929 },
  // আলম্‌গীরের পত্রাবলী — ঔরঙ্গজেব
  "ঔরঙ্গজেব\u0000ruka’at-i-alamgiri": { verdict: "reject", reason: "library stamps over the title" },
  // চারণ — কনকভূষণ মুখোপাধ্যায়
  "কনকভূষণ মুখোপাধ্যায়\u0000charan": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // চিত্ত-মুকুর — কালীপ্রসন্ন ঘোষ
  "কালীপ্রসন্ন ঘোষ\u0000chitta-mukur": { verdict: "accept", from: "wikisource", kind: "title", edition: 1878 },
  // হুতোম প্যাঁচার নকশা — কালীপ্রসন্ন সিংহ
  "কালীপ্রসন্ন সিংহ\u0000hutom pyanchar naksha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1884 },
  // চরিতাষ্টক — কালীময় ঘটক
  "কালীময় ঘটক\u0000dwitiya charitashtak": { verdict: "accept", from: "wikisource", kind: "title", edition: 1873 },
  // মেরী কার্পেণ্টার — কুমুদিনী মিত্র
  "কুমুদিনী মিত্র\u0000mary carpenter": { verdict: "accept", from: "wikisource", kind: "title", edition: 1906 },
  // তত্ত্ববিচার — কৃষ্ণপ্রসন্ন সেন
  "কৃষ্ণপ্রসন্ন সেন\u0000tattwabichar": { verdict: "accept", from: "wikisource", kind: "title", edition: 1912 },
  // সীতা-হরণ-পাঁচালী — কৃষ্ণেন্দ্র রায়
  "কৃষ্ণেন্দ্র রায়\u0000sita-haran-panchali": { verdict: "accept", from: "wikisource", kind: "title", edition: 1927 },
  // অদ্ভুত লোক — গগনেন্দ্রনাথ ঠাকুর
  "গগনেন্দ্রনাথ ঠাকুর\u0000realm of the absurd": { verdict: "accept", from: "wikisource", kind: "cover", edition: 1917 },
  // ভোঁদড় বাহাদুর — গগনেন্দ্রনাথ ঠাকুর
  "গগনেন্দ্রনাথ ঠাকুর\u0000bhondar bahadur": { verdict: "reject", reason: "illustration on a 1956 Signet Press edition; artist not identified" },
  // সভ্যতার পাণ্ডা — গিরিশচন্দ্র ঘোষ
  "গিরিশচন্দ্র ঘোষ\u0000sabhyatar panda": { verdict: "accept", from: "wikisource", kind: "title", edition: 1894 },
  // স্বদেশিনী — গিরীন্দ্রমোহিনী দাসী
  "গিরীন্দ্রমোহিনী দাসী\u0000swadeshini": { verdict: "reject", reason: "torn, stamped page" },
  // স্বপ্ন — গিরীন্দ্রশেখর বসু
  "গিরীন্দ্রশেখর বসু\u0000swapna": { verdict: "reject", reason: "library stamps and marks across the page" },
  // হিতদীপ — গুরুনাথ সেনগুপ্ত
  "গুরুনাথ সেনগুপ্ত\u0000hitadeep": { verdict: "accept", from: "wikisource", kind: "title", edition: 1887 },
  // রূপ-রেখা — গোকুলচন্দ্র নাগ
  "গোকুলচন্দ্র নাগ\u0000rup-rekha": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // ইসলাম ও কমিউনিজ্‌ম্‌ — গোলাম মোস্তফা
  "গোলাম মোস্তফা\u0000isalam o kamiunijm": { verdict: "accept", from: "wikisource", kind: "title", edition: 1946 },
  // ‘পার্টিসন’-প্রহেলিকা — চন্দ্রনাথ বসু
  "চন্দ্রনাথ বসু\u0000partisan-prahelika": { verdict: "accept", from: "wikisource", kind: "cover", edition: 1906 },
  // চোরকাঁটা — চারুচন্দ্র বন্দ্যোপাধ্যায়
  "চারুচন্দ্র বন্দ্যোপাধ্যায়\u0000chorakanta": { verdict: "reject", reason: "library stamps (RARE) and marks across the page" },
  // পুষ্পপাত্র — চারুচন্দ্র বন্দ্যোপাধ্যায়
  "চারুচন্দ্র বন্দ্যোপাধ্যায়\u0000pushpapatra": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // নব্য-বিজ্ঞান — চারুচন্দ্র ভট্টাচার্য
  "চারুচন্দ্র ভট্টাচার্য\u0000nabya-bijnan": { verdict: "accept", from: "wikisource", kind: "title", edition: 1918 },
  // বিশ্বের উপাদান — চারুচন্দ্র ভট্টাচার্য
  "চারুচন্দ্র ভট্টাচার্য\u0000bishwer upadan": { verdict: "accept", from: "wikisource", kind: "title", edition: 1952 },
  // সেক্‌সপিয়র কৃত গ্রন্থ হইতে উদ্ধৃত অপূর্ব্বোপাখ্যান — চার্লস ল্যাম্ব ও মেরী ল্যাম্ব
  "চার্লস ল্যাম্ব ও মেরী ল্যাম্ব\u0000tales from shakspeare": { verdict: "accept", from: "wikisource", kind: "title", edition: 1852 },
  // অন্তর্যামী — চিত্তরঞ্জন দাশ
  "চিত্তরঞ্জন দাশ\u0000antarjami": { verdict: "accept", from: "wikisource", kind: "title", edition: 1914 },
  // কিশোর কিশোরী — চিত্তরঞ্জন দাশ
  "চিত্তরঞ্জন দাশ\u0000kishore kishori": { verdict: "accept", from: "wikisource", kind: "title", edition: 1929 },
  // বিশ্ব-ইতিহাস প্রসঙ্গ — জওহরলাল নেহরু
  "জওহরলাল নেহরু\u0000glimpses of world history": { verdict: "accept", from: "wikisource", kind: "title", edition: 1951 },
  // গ্রহ-নক্ষত্র — জগদানন্দ রায়
  "জগদানন্দ রায়\u0000graha-nakshatra": { verdict: "accept", from: "wikisource", kind: "title", edition: 1915 },
  // পোকা-মাকড় — জগদানন্দ রায়
  "জগদানন্দ রায়\u0000poka-makar": { verdict: "accept", from: "wikisource", kind: "title", edition: 1924 },
  // অব্যক্ত — জগদীশচন্দ্র বসু
  "জগদীশচন্দ্র বসু\u0000abyakta": { verdict: "accept", from: "wikisource", kind: "title", edition: 1957 },
  // পুরাবৃত্তের সংক্ষেপ বিবরণ — জন ক্লার্ক মার্শম্যান
  "জন ক্লার্ক মার্শম্যান\u0000brief survey of history": { verdict: "accept", from: "wikisource", kind: "title", edition: 1833 },
  // চিত্রে জয়দেব ও গীতগোবিন্দ — জয়দেব
  "জয়দেব\u0000gita govinda": { verdict: "reject", reason: "painted cover signed by an artist whose death year isn't established" },
  // প্রবাস-চিত্র — জলধর সেন
  "জলধর সেন\u0000prabas-chitra": { verdict: "reject", reason: "handwriting over the title" },
  // বড়বাড়ী — জলধর সেন
  "জলধর সেন\u0000barabari": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // জীবনানন্দ দাশের শ্রেষ্ঠ কবিতা — জীবনানন্দ দাশ
  "জীবনানন্দ দাশ\u0000jibanananda dasher shrestha kabita": { verdict: "accept", from: "wikisource", kind: "title", edition: 1954 },
  // ৮০ দিনে ভূপ্রদক্ষিণ — জুল ভার্ন
  "জুল ভার্ন\u0000around the world in eighty days": { verdict: "accept", from: "wikisource", kind: "title", edition: 1913 },
  // চন্দ্রলোকে যাত্রা — জুল ভার্ন
  "জুল ভার্ন\u0000from the earth to the moon": { verdict: "accept", from: "wikisource", kind: "title", edition: 1923 },
  // বেলুনে পাঁচ সপ্তাহ — জুল ভার্ন
  "জুল ভার্ন\u0000belune panch saptaha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1925 },
  // স্মৃতিকথা — জ্ঞানদানন্দিনী দেবী
  "জ্ঞানদানন্দিনী দেবী\u0000smritikatha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1956 },
  // ঝাঁশির রাণী — জ্যোতিরিন্দ্রনাথ ঠাকুর
  "জ্যোতিরিন্দ্রনাথ ঠাকুর\u0000jhanshir rani": { verdict: "accept", from: "wikisource", kind: "title", edition: 1903 },
  // ডমরু-চরিত — ত্রৈলোক্যনাথ মুখোপাধ্যায়
  "ত্রৈলোক্যনাথ মুখোপাধ্যায়\u0000damaru-charit": { verdict: "reject", reason: "library stamps (RARE, NOT FOR ISSUE) across the page" },
  // নীলদর্পণ — দীনবন্ধু মিত্র
  "দীনবন্ধু মিত্র\u0000nil-darpan natok": { verdict: "accept", from: "wikisource", kind: "title", edition: 1872 },
  // নাবিক-বধূ — দীনেন্দ্রকুমার রায়
  "দীনেন্দ্রকুমার রায়\u0000nabik-badhu": { verdict: "accept", from: "wikisource", kind: "title", edition: 1917 },
  // পদাবলী-মাধুর্য্য — দীনেশচন্দ্র সেন
  "দীনেশচন্দ্র সেন\u0000padabali-madhurya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1937 },
  // সুকথা — দীনেশচন্দ্র সেন
  "দীনেশচন্দ্র সেন\u0000sukatha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1912 },
  // ভূঁই-চাঁপা — দীনেশরঞ্জন দাশ
  "দীনেশরঞ্জন দাশ\u0000bhui-chanpa": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // পল্লীগ্রামস্থ চৌকীদার বিষয়ক প্রস্তাবিত রাজ নিয়মের বিরুদ্ধে ভারতবর্ষীয় সভার আবেদন — দেবেন্দ্রনাথ ঠাকুর
  "দেবেন্দ্রনাথ ঠাকুর\u0000palligramastha choukidar bishayak prastabita raj niyamer biruddhe bharatbarshiya sabhar abedan": { verdict: "accept", from: "wikisource", kind: "title", edition: 1851 },
  // পশ্চিম প্রদেশের দুর্ভিক্ষ উপশমে সাহায্য সংগ্রহার্থে ব্রাহ্মসমাজের বক্তৃতা — দেবেন্দ্রনাথ ঠাকুর
  "দেবেন্দ্রনাথ ঠাকুর\u0000pashchim pradesher durbhiksha upashame sahajya sangraharthe brahmasamajer baktrita": { verdict: "accept", from: "wikisource", kind: "title", edition: 1860 },
  // ব্রাহ্মধর্ম্মের মত ও বিশ্বাস — দেবেন্দ্রনাথ ঠাকুর
  "দেবেন্দ্রনাথ ঠাকুর\u0000brahmadharmmer mat o biswas": { verdict: "accept", from: "wikisource", kind: "title", edition: 1869 },
  // উপদেশমালা — দ্বারকানাথ বিদ্যাভূষণ
  "দ্বারকানাথ বিদ্যাভূষণ\u0000upadeshmala (part 1)": { verdict: "reject", reason: "library stamps over the title" },
  // একঘরে — দ্বিজেন্দ্রলাল রায়
  "দ্বিজেন্দ্রলাল রায়\u0000ekghare": { verdict: "accept", from: "wikisource", kind: "title", edition: 1910 },
  // রথযাত্রা ও অন্যান্য গল্প — নগেন্দ্রনাথ গুপ্ত
  "নগেন্দ্রনাথ গুপ্ত\u0000rathyatra o anyanya galpa": { verdict: "accept", from: "wikisource", kind: "title", edition: 1931 },
  // ক্লিওপেট্রা — নবীনচন্দ্র সেন
  "নবীনচন্দ্র সেন\u0000cleopatra": { verdict: "accept", from: "wikisource", kind: "title", edition: 1877 },
  // ভবঘুরে — নারায়ণচন্দ্র ভট্টাচার্য
  "নারায়ণচন্দ্র ভট্টাচার্য\u0000bhabaghure": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // জওহরলাল — নৃপেন্দ্রকৃষ্ণ চট্টোপাধ্যায়
  "নৃপেন্দ্রকৃষ্ণ চট্টোপাধ্যায়\u0000jawaharlal": { verdict: "accept", from: "wikisource", kind: "title", edition: 1948 },
  // স্ত্রীস্বাধীনতা ও স্ত্রীশিক্ষা — পঞ্চানন ভট্টাচার্য
  "পঞ্চানন ভট্টাচার্য\u0000striswadhinata o strishiksha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1893 },
  // ইংরাজ-বর্জ্জিত ভারতবর্ষ — পিয়ের লোতি
  "পিয়ের লোতি\u0000ingraj-barjjita bharatbarsha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1927 },
  // এতদ্দেশীয় স্ত্রীলোকদিগের পূর্ব্বাবস্থা — প্যারীচাঁদ মিত্র
  "প্যারীচাঁদ মিত্র\u0000etaddesiya strilokdiger purbabastha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1878 },
  // জাতীয় আন্দোলনে রবীন্দ্রনাথ — প্রফুল্লকুমার সরকার
  "প্রফুল্লকুমার সরকার\u0000jatiya andolane rabindranath": { verdict: "accept", from: "wikisource", kind: "title", edition: 1947 },
  // আচার্য্য প্রফুল্লচন্দ্র রায়ের প্রবন্ধ ও বক্তৃতাবলী — প্রফুল্লচন্দ্র রায়
  "প্রফুল্লচন্দ্র রায়\u0000acharya prafullachandra rayer prabandha o baktritabali": { verdict: "accept", from: "wikisource", kind: "title", edition: 1927 },
  // আত্মচরিত — প্রফুল্লচন্দ্র রায়
  "প্রফুল্লচন্দ্র রায়\u0000atmacharit": { verdict: "accept", from: "wikisource", kind: "title", edition: 1952 },
  // হিন্দু রসায়নী বিদ্যা — প্রফুল্লচন্দ্র রায়
  "প্রফুল্লচন্দ্র রায়\u0000hindu rasayani bidya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1943 },
  // ভারত ও চীন — প্রবোধচন্দ্র বাগচী
  "প্রবোধচন্দ্র বাগচী\u0000bharat o chin": { verdict: "accept", from: "wikisource", kind: "title", edition: 1950 },
  // ভারত ও মধ্য এশিয়া — প্রবোধচন্দ্র বাগচী
  "প্রবোধচন্দ্র বাগচী\u0000bharat o madhya asia": { verdict: "reject", reason: "handwriting and stamps across the page" },
  // অণুকথা সপ্তক — প্রমথ চৌধুরী
  "প্রমথ চৌধুরী\u0000anukatha saptak": { verdict: "reject", reason: "handwriting and stamps across the page" },
  // সনেট-পঞ্চাশৎ — প্রমথ চৌধুরী
  "প্রমথ চৌধুরী\u0000sonnet-panchashat": { verdict: "accept", from: "wikisource", kind: "title", edition: 1913 },
  // অন্ধকারের বন্ধু — প্রসাদদাস রায়
  "প্রসাদদাস রায়\u0000andhakarer bandhu": { verdict: "reject", reason: "illustration signed by an unidentified artist" },
  // অমৃত-দ্বীপ — প্রসাদদাস রায়
  "প্রসাদদাস রায়\u0000amrit-dweep": { verdict: "accept", from: "wikisource", kind: "title", edition: 1940 },
  // এখন যাঁদের দেখছি — প্রসাদদাস রায়
  "প্রসাদদাস রায়\u0000ekhon jander dekhchhi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1955 },
  // পঞ্চনদের তীরে — প্রসাদদাস রায়
  "প্রসাদদাস রায়\u0000panchanader teere": { verdict: "accept", from: "wikisource", kind: "title", edition: 1945 },
  // পসরা — প্রসাদদাস রায়
  "প্রসাদদাস রায়\u0000pasara": { verdict: "accept", from: "wikisource", kind: "title", edition: 1915 },
  // মড়ার মৃত্যু — প্রসাদদাস রায়
  "প্রসাদদাস রায়\u0000marar mrityu": { verdict: "accept", from: "wikisource", kind: "title", edition: 1939 },
  // যাঁদের দেখেছি — প্রসাদদাস রায়
  "প্রসাদদাস রায়\u0000jander dekhechhi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1951 },
  // বিদ্যাসাগর জননী ভগবতী দেবী — প্রিয়দর্শন হালদার
  "প্রিয়দর্শন হালদার\u0000vidyasagar janani bhagabati debi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1913 },
  // আনন্দ-তুফান — প্রিয়নাথ চক্রবর্তী
  "প্রিয়নাথ চক্রবর্তী\u0000ananda-tufan": { verdict: "accept", from: "wikisource", kind: "title", edition: 1917 },
  // অদ্ভুত ফকির — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000adbhut fakir": { verdict: "accept", from: "wikisource", kind: "title", edition: 1909 },
  // অদ্ভুত ভিখারী — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000adbhut bhikhari": { verdict: "accept", from: "wikisource", kind: "title", edition: 1904 },
  // ইংরেজ ডাকাত — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000ingrej dakat": { verdict: "accept", from: "wikisource", kind: "cover", edition: 1894 },
  // উভয় সঙ্কট — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000ubhay sankat": { verdict: "accept", from: "wikisource", kind: "title", edition: 1906 },
  // খুন না চুরি? — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000khun na churi?": { verdict: "accept", from: "wikisource", kind: "title", edition: 1909 },
  // খুনী কে — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000khuni ke": { verdict: "accept", from: "wikisource", kind: "title", edition: 1906 },
  // গুপ্ত-রহস্য — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000gupta-rahasya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1904 },
  // গুম খুন — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000gum khun": { verdict: "accept", from: "wikisource", kind: "title", edition: 1909 },
  // ঘর-পোড়া লোক — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000ghar-pora lok (last part)": { verdict: "accept", from: "wikisource", kind: "title", edition: 1898 },
  // চূর্ণ প্রতিমা — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000churna pratima": { verdict: "accept", from: "wikisource", kind: "title", edition: 1906 },
  // চেনা দায় — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000chena day": { verdict: "accept", from: "wikisource", kind: "title", edition: 1898 },
  // ছবি — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000chhabi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1906 },
  // ছেলে-ভুল — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000chhele-bhul": { verdict: "accept", from: "wikisource", kind: "title", edition: 1898 },
  // জীবন বীমা — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000jeeban bima": { verdict: "accept", from: "wikisource", kind: "title", edition: 1906 },
  // জোড়া পাপী — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000jora papi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1909 },
  // জ্ঞাতি-শত্রু — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000jnati-shatru": { verdict: "accept", from: "wikisource", kind: "title", edition: 1909 },
  // দায়ে খুন — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000daaye khun": { verdict: "accept", from: "wikisource", kind: "title", edition: 1898 },
  // দীর্ঘকেশী — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000deerghakeshi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1906 },
  // প্রেম-পাগলিনী — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000prem-pagalini": { verdict: "accept", from: "wikisource", kind: "title", edition: 1909 },
  // প্রেমের খেলা — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000premer khela": { verdict: "accept", from: "wikisource", kind: "title", edition: 1909 },
  // বাঁশী — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000banshi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1906 },
  // বিদায় ভোজ — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000biday bhoj": { verdict: "accept", from: "wikisource", kind: "title", edition: 1909 },
  // বিষম বুদ্ধি — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000bisham buddhi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1904 },
  // বিষম ভ্রম — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000bisham bhram (first part)": { verdict: "accept", from: "wikisource", kind: "title", edition: 1901 },
  // বেওয়ারিশ লাস — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000beoarish las": { verdict: "accept", from: "wikisource", kind: "title", edition: 1898 },
  // ভূতের বিচার — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000bhuter bichar": { verdict: "accept", from: "wikisource", kind: "title", edition: 1910 },
  // মণিপুরের সেনাপতি — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000manipurer senapati (part 2)": { verdict: "accept", from: "wikisource", kind: "title", edition: 1904 },
  // মতিয়া বিবি — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000matia bibi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1904 },
  // মানিনী — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000manini": { verdict: "accept", from: "wikisource", kind: "title", edition: 1906 },
  // মিস্ মেরি — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000miss mary": { verdict: "reject", reason: "title smudged" },
  // মেকি লোক — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000meki lok": { verdict: "accept", from: "wikisource", kind: "title", edition: 1911 },
  // রকম রকম — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000rakam rakam": { verdict: "accept", from: "wikisource", kind: "title", edition: 1898 },
  // রক্ষক না ভক্ষক — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000rakshak na bhakshak": { verdict: "accept", from: "wikisource", kind: "title", edition: 1906 },
  // রাজা সাহেব — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000raja saheb": { verdict: "accept", from: "wikisource", kind: "title", edition: 1904 },
  // রাণী না খুনি? — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000rani na khuni? (last part)": { verdict: "accept", from: "wikisource", kind: "title", edition: 1898 },
  // লুকোচুরি — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000lukochuri": { verdict: "accept", from: "wikisource", kind: "title", edition: 1909 },
  // সহুরে মেয়ে — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000sahure meye": { verdict: "accept", from: "wikisource", kind: "title", edition: 1901 },
  // সাবাইস বুদ্ধি — প্রিয়নাথ মুখোপাধ্যায়
  "প্রিয়নাথ মুখোপাধ্যায়\u0000sabais buddhi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1904 },
  // ইন্দিরা — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000indira": { verdict: "accept", from: "wikisource", kind: "title", edition: 1873 },
  // কমলাকান্ত — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000kamalakanta": { verdict: "accept", from: "wikisource", kind: "title", edition: 1885 },
  // কমলাকান্তের পত্র — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000kamalakanter patra": { verdict: "accept", from: "wikisource", kind: "title", edition: 1923 },
  // দেবী চৌধুরাণী — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000devi chaudhurani": { verdict: "accept", from: "wikisource", kind: "title", edition: 1939 },
  // বিজ্ঞানরহস্য — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000bijnanrahasya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1884 },
  // বিবিধ প্রবন্ধ — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000bibidha prabandha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1939 },
  // বিবিধ সমালোচন — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000bibidh samalochan": { verdict: "accept", from: "wikisource", kind: "title", edition: 1876 },
  // মুচিরাম গুড়ের জীবনচরিত — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000muchiram gurer jeebancharit": { verdict: "accept", from: "wikisource", kind: "title", edition: 1944 },
  // মৃণালিনী — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000mrinalini": { verdict: "accept", from: "wikisource", kind: "title", edition: 1874 },
  // যুগলাঙ্গুরীয় — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000jugalanguriya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1893 },
  // রজনী — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000rajani": { verdict: "accept", from: "wikisource", kind: "title", edition: 1895 },
  // রাজমোহনের স্ত্রী — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000rajmohan's wife": { verdict: "accept", from: "wikisource", kind: "title", edition: 1944 },
  // রাজসিংহ — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000rajsingha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1885 },
  // রাধারাণী — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000radharani": { verdict: "accept", from: "wikisource", kind: "title", edition: 1940 },
  // রায় দীনবন্ধু মিত্র বাহাদুরের জীবনী — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000rai dinabandhu mitra bahadurer jibani": { verdict: "accept", from: "wikisource", kind: "title", edition: 1882 },
  // লোকরহস্য — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000lokrahasya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1939 },
  // সাম্য — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000samya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1938 },
  // সীতারাম — বঙ্কিমচন্দ্র চট্টোপাধ্যায়
  "বঙ্কিমচন্দ্র চট্টোপাধ্যায়\u0000sitaram": { verdict: "accept", from: "wikisource", kind: "title", edition: 1939 },
  // ভারত কোন্ পথে? — বারীন্দ্রকুমার ঘোষ
  "বারীন্দ্রকুমার ঘোষ\u0000bharat kon pathe?": { verdict: "reject", reason: "library stamps across the page" },
  // সঙ্গীত-সুধা — বিজয়কৃষ্ণ গোস্বামী
  "বিজয়কৃষ্ণ গোস্বামী\u0000sangeet-sudha": { verdict: "reject", reason: "library stamps over the title" },
  // পঞ্চক মালা — বিজয়চন্দ্র মজুমদার
  "বিজয়চন্দ্র মজুমদার\u0000panchak mala": { verdict: "accept", from: "wikisource", kind: "title", edition: 1910 },
  // আমার কথা — বিনোদিনী দাসী
  "বিনোদিনী দাসী\u0000amar katha (volume 1)": { verdict: "accept", from: "wikisource", kind: "title", edition: 1913 },
  // জেলের খাতা — বিপিনচন্দ্র পাল
  "বিপিনচন্দ্র পাল\u0000jeler khata": { verdict: "accept", from: "wikisource", kind: "title", edition: 1934 },
  // অনুসন্ধান — বিভূতিভূষণ বন্দ্যোপাধ্যায়
  "বিভূতিভূষণ বন্দ্যোপাধ্যায়\u0000anusandhan": { verdict: "accept", from: "wikisource", kind: "title", edition: 1959 },
  // ইছামতী — বিভূতিভূষণ বন্দ্যোপাধ্যায়
  "বিভূতিভূষণ বন্দ্যোপাধ্যায়\u0000ichhamati": { verdict: "accept", from: "wikisource", kind: "title", edition: 1959 },
  // চাঁদের পাহাড় — বিভূতিভূষণ বন্দ্যোপাধ্যায়
  "বিভূতিভূষণ বন্দ্যোপাধ্যায়\u0000chander pahar": { verdict: "accept", from: "wikisource", kind: "title", edition: 1945 },
  // জন্ম ও মৃত্যু — বিভূতিভূষণ বন্দ্যোপাধ্যায়
  "বিভূতিভূষণ বন্দ্যোপাধ্যায়\u0000janma o mrityu": { verdict: "accept", from: "wikisource", kind: "title", edition: 1955 },
  // সারদামঙ্গল — বিহারীলাল চক্রবর্তী
  "বিহারীলাল চক্রবর্তী\u0000saradamangol": { verdict: "accept", from: "wikisource", kind: "title", edition: 1879 },
  // নিগ্রোজাতির কর্ম্মবীর — বুকার টালিয়াফেরো ওয়াশিংটন
  "বুকার টালিয়াফেরো ওয়াশিংটন\u0000up from slavery": { verdict: "accept", from: "wikisource", kind: "title", edition: 1914 },
  // বঙ্গসাহিত্যে নারী — ব্রজেন্দ্রনাথ বন্দ্যোপাধ্যায়
  "ব্রজেন্দ্রনাথ বন্দ্যোপাধ্যায়\u0000bangasahitye nari": { verdict: "accept", from: "wikisource", kind: "title", edition: 1950 },
  // বাঙ্গ্‌লার বেগম — ব্রজেন্দ্রনাথ বন্দ্যোপাধ্যায়
  "ব্রজেন্দ্রনাথ বন্দ্যোপাধ্যায়\u0000banglar begum": { verdict: "reject", reason: "a library catalogue slip pasted over the page" },
  // মোগল যুগে স্ত্রীশিক্ষা — ব্রজেন্দ্রনাথ বন্দ্যোপাধ্যায়
  "ব্রজেন্দ্রনাথ বন্দ্যোপাধ্যায়\u0000mogal yuge streeshiksha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1935 },
  // মোগল-বিদুষী — ব্রজেন্দ্রনাথ বন্দ্যোপাধ্যায়
  "ব্রজেন্দ্রনাথ বন্দ্যোপাধ্যায়\u0000mogal-bidushi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1924 },
  // রামচন্দ্র বিদ্যাবাগীশ ও হরিহরানন্দনাথ তীর্থস্বামী — ব্রজেন্দ্রনাথ বন্দ্যোপাধ্যায়
  "ব্রজেন্দ্রনাথ বন্দ্যোপাধ্যায়\u0000ramachandra bidyabagish o hariharanandanath tirthaswami": { verdict: "accept", from: "wikisource", kind: "cover", edition: 1942 },
  // বিলাতযাত্রী সন্ন্যাসীর চিঠি — ব্রহ্মবান্ধব উপাধ্যায়
  "ব্রহ্মবান্ধব উপাধ্যায়\u0000bilatyatri sannyasir chithi": { verdict: "accept", from: "wikisource", kind: "cover", edition: 1906 },
  // মানসিংহ — ভারতচন্দ্র রায়
  "ভারতচন্দ্র রায়\u0000mansingha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1854 },
  // শিশির — ভুজঙ্গধর রায়চৌধুরী
  "ভুজঙ্গধর রায়চৌধুরী\u0000shishir": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // স্বপ্নলব্ধ ভারতবর্ষের ইতিহাস — ভূদেব মুখোপাধ্যায়
  "ভূদেব মুখোপাধ্যায়\u0000swapnalabdha bharatbarsher itihas": { verdict: "accept", from: "wikisource", kind: "title", edition: 1895 },
  // সাহিত্যে প্রগতি — ভূপেন্দ্রনাথ দত্ত
  "ভূপেন্দ্রনাথ দত্ত\u0000sahitye pragati": { verdict: "accept", from: "wikisource", kind: "title", edition: 1945 },
  // ভারতীয় বিদুষী — মণিলাল গঙ্গোপাধ্যায়
  "মণিলাল গঙ্গোপাধ্যায়\u0000bharatiya bidushi": { verdict: "reject", reason: "library stamps over the title" },
  // আঁধারে আলো — মন্মথমোহন বসু
  "মন্মথমোহন বসু\u0000andhare alo": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // একেই কি বলে সভ্যতা? — মাইকেল মধুসূদন দত্ত
  "মাইকেল মধুসূদন দত্ত\u0000ekei ki bale sabhyata": { verdict: "accept", from: "wikisource", kind: "title", edition: 1862 },
  // কৃষ্ণকুমারী নাটক — মাইকেল মধুসূদন দত্ত
  "মাইকেল মধুসূদন দত্ত\u0000krishnakumari natak": { verdict: "accept", from: "wikisource", kind: "title", edition: 1945 },
  // চতুর্দ্দশপদী কবিতাবলী — মাইকেল মধুসূদন দত্ত
  "মাইকেল মধুসূদন দত্ত\u0000chaturddashpadi-kabitabali": { verdict: "accept", from: "wikisource", kind: "title", edition: 1866 },
  // তিলোত্তমাসম্ভব কাব্য — মাইকেল মধুসূদন দত্ত
  "মাইকেল মধুসূদন দত্ত\u0000tilottamasambhav kabya": { verdict: "reject", reason: "emblem scanned as a black blot" },
  // পদ্মাবতী নাটক — মাইকেল মধুসূদন দত্ত
  "মাইকেল মধুসূদন দত্ত\u0000padmabati natak": { verdict: "reject", reason: "emblem scanned as a black blot" },
  // বিবিধ কাব্য — মাইকেল মধুসূদন দত্ত
  "মাইকেল মধুসূদন দত্ত\u0000bibidha kavya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1940 },
  // বীরাঙ্গনা কাব্য — মাইকেল মধুসূদন দত্ত
  "মাইকেল মধুসূদন দত্ত\u0000birangana kabya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1868 },
  // ব্রজাঙ্গনা কাব্য — মাইকেল মধুসূদন দত্ত
  "মাইকেল মধুসূদন দত্ত\u0000brajangana kabya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1864 },
  // শর্ম্মিষ্ঠা নাটক — মাইকেল মধুসূদন দত্ত
  "মাইকেল মধুসূদন দত্ত\u0000sharmmishtha natak": { verdict: "reject", reason: "emblem scanned as a black blot" },
  // হেক্‌টর বধ — মাইকেল মধুসূদন দত্ত
  "মাইকেল মধুসূদন দত্ত\u0000hectar badh": { verdict: "accept", from: "wikisource", kind: "title", edition: 1871 },
  // শ্রীযুত ডাক্তর এম, জে, ব্রমলি সাহেবের বক্তৃতার দ্বারা সংক্ষেপ আবেদন — মাউন্টফোর্ড জোসেফ ব্রমলি
  "মাউন্টফোর্ড জোসেফ ব্রমলি\u0000shrijut daktar em, je, bramali saheber baktritar dwara sangkshep abedan": { verdict: "accept", from: "wikisource", kind: "title", edition: 1836 },
  // রামায়ণে রাক্ষস সভ্যতা — মাখনলাল রায়চৌধুরী
  "মাখনলাল রায়চৌধুরী\u0000ramayane rakshas sabhyata": { verdict: "reject", reason: "digitiser's notices printed across the scan" },
  // জননী — মানিক বন্দ্যোপাধ্যায়
  "মানিক বন্দ্যোপাধ্যায়\u0000janani": { verdict: "accept", from: "wikisource", kind: "title", edition: 1945 },
  // মাঝির ছেলে — মানিক বন্দ্যোপাধ্যায়
  "মানিক বন্দ্যোপাধ্যায়\u0000majhir chhele": { verdict: "reject", reason: "printing year not shown; could be after 1965" },
  // লেখকের কথা — মানিক বন্দ্যোপাধ্যায়
  "মানিক বন্দ্যোপাধ্যায়\u0000lekhaker katha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1957 },
  // মার্কাস্‌ অরিলিয়সের আত্মচিন্তা — মার্কাস অরিলিয়স
  "মার্কাস অরিলিয়স\u0000meditations": { verdict: "accept", from: "wikisource", kind: "title", edition: 1911 },
  // শিক্‌ওয়া ও জবাব-ই-শিক্‌ওয়া — মুহম্মদ ইকবাল
  "মুহম্মদ ইকবাল\u0000shikwa and jawab e shikwa": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // মেগাস্থেনীসের ভারত-বিবরণ — মেগাস্থিনিস
  "মেগাস্থিনিস\u0000indica": { verdict: "accept", from: "wikisource", kind: "title", edition: 1944 },
  // কারাকাহিনী — মোহনদাস করমচাঁদ গান্ধী
  "মোহনদাস করমচাঁদ গান্ধী\u0000maro jailno anubhav": { verdict: "accept", from: "wikisource", kind: "title", edition: 1922 },
  // বিবিধ কথা — মোহিতলাল মজুমদার
  "মোহিতলাল মজুমদার\u0000bibidha katha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1941 },
  // মা — ম্যাক্সিম গোর্কি
  "ম্যাক্সিম গোর্কি\u0000mat'": { verdict: "accept", from: "wikisource", kind: "title", edition: 1950 },
  // গৌরী — যতীন্দ্রমোহন সেনগুপ্ত
  "যতীন্দ্রমোহন সেনগুপ্ত\u0000gouri": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // উপবাস — যদুনাথ মজুমদার
  "যদুনাথ মজুমদার\u0000upabas": { verdict: "accept", from: "wikisource", kind: "title", edition: 1911 },
  // প্রাণোচ্ছ্বাস — যোগেন্দ্রনাথ বন্দ্যোপাধ্যায়
  "যোগেন্দ্রনাথ বন্দ্যোপাধ্যায়\u0000pranochchhwas": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // ভেক মূষিকের যুদ্ধ — রঙ্গলাল বন্দ্যোপাধ্যায়
  "রঙ্গলাল বন্দ্যোপাধ্যায়\u0000bhek mushiker yuddha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1858 },
  // আমাদের জাতীয়ভাব — রজনীকান্ত গুপ্ত
  "রজনীকান্ত গুপ্ত\u0000aamader jatiyobhab": { verdict: "accept", from: "wikisource", kind: "title", edition: 1891 },
  // স্বর্গীয় ঈশ্বরচন্দ্র বিদ্যাসাগর — রজনীকান্ত গুপ্ত
  "রজনীকান্ত গুপ্ত\u0000swargiya ishwarchandra vidyasagar": { verdict: "accept", from: "wikisource", kind: "title", edition: 1893 },
  // অমৃত — রজনীকান্ত সেন
  "রজনীকান্ত সেন\u0000amrit": { verdict: "reject", reason: "handwriting across the top and a torn edge" },
  // বাণী — রজনীকান্ত সেন
  "রজনীকান্ত সেন\u0000bani": { verdict: "accept", from: "wikisource", kind: "title", edition: 1910 },
  // সদ্ভাব কুসুম — রজনীকান্ত সেন
  "রজনীকান্ত সেন\u0000sadbhab kusum": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // আকাশ-প্রদীপ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000akash-pradip": { verdict: "accept", from: "wikisource", kind: "title", edition: 1938 },
  // আত্মশক্তি — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000atmashakti": { verdict: "accept", from: "wikisource", kind: "title", edition: 1905 },
  // আরোগ্য — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000arogya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1943 },
  // আশ্রমের রূপ ও বিকাশ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000ashramer rup o bikash": { verdict: "accept", from: "wikisource", kind: "cover", edition: 1951 },
  // ইতিহাস — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000itihas": { verdict: "accept", from: "wikisource", kind: "title", edition: 1955 },
  // ঔপনিষদ ব্রহ্ম — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000oupanishad brahma": { verdict: "accept", from: "wikisource", kind: "title", edition: 1901 },
  // কড়ি ও কোমল — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000kari o komal": { verdict: "accept", from: "wikisource", kind: "title", edition: 1886 },
  // কণিকা — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000kanika": { verdict: "accept", from: "wikisource", kind: "title", edition: 1948 },
  // কথা — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000katha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1938 },
  // কথা-চতুষ্টয় — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000katha-chatustay": { verdict: "accept", from: "wikisource", kind: "title", edition: 1894 },
  // কর্ম্মফল — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000karmmafal": { verdict: "accept", from: "wikisource", kind: "title", edition: 1903 },
  // কল্পনা — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000kalpana": { verdict: "accept", from: "wikisource", kind: "title", edition: 1952 },
  // কাহিনী — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000kahini": { verdict: "reject", reason: "handwriting across the cover" },
  // খৃষ্ট — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000khrishta": { verdict: "accept", from: "wikisource", kind: "title", edition: 1959 },
  // গল্প-দশক — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000galpa-dashak": { verdict: "accept", from: "wikisource", kind: "title", edition: 1895 },
  // গল্পগুচ্ছ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000galpaguccha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1950 },
  // গল্পসল্প — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000galpasalpa": { verdict: "reject", reason: "1978 printing (after the cutoff)" },
  // গীতালি — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000gitali": { verdict: "accept", from: "wikisource", kind: "title", edition: 1946 },
  // গীতিমাল্য — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000geetimalya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1946 },
  // চতুরঙ্গ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000chaturanga": { verdict: "reject", reason: "1983 printing (after the cutoff)" },
  // চার অধ্যায় — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000char adhyay": { verdict: "accept", from: "wikisource", kind: "title", edition: 1955 },
  // চিঠিপত্র — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000chithipatra (volume 1)": { verdict: "accept", from: "wikisource", kind: "title", edition: 1944 },
  // চিত্রাঙ্গদা — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000chitrangada": { verdict: "accept", from: "wikisource", kind: "title", edition: 1954 },
  // চৈতালি — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000chaitali": { verdict: "accept", from: "wikisource", kind: "title", edition: 1957 },
  // ছড়া — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000chhara": { verdict: "accept", from: "wikisource", kind: "title", edition: 1958 },
  // ছড়ার ছবি — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000chharar chhabi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1961 },
  // ছবি ও গান — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000chhabi o gaan": { verdict: "accept", from: "wikisource", kind: "title", edition: 1922 },
  // ছিন্নপত্র — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000chhinnapatra": { verdict: "accept", from: "wikisource", kind: "title", edition: 1912 },
  // জন্মদিনে — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000janmadine": { verdict: "accept", from: "wikisource", kind: "title", edition: 1960 },
  // জাপান-যাত্রী — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000japane-parasye": { verdict: "reject", reason: "the scan is a combined volume with another title (জাপানে-পারস্যে)" },
  // ঝান্সীর রানী — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000jhansir rani": { verdict: "reject", reason: "page is wider than tall" },
  // ডাকঘর — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000dak ghar": { verdict: "accept", from: "wikisource", kind: "title" },
  // দুই বোন — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000dui bon": { verdict: "accept", from: "wikisource", kind: "title", edition: 1943 },
  // দেশের কাজ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000desher kaj": { verdict: "accept", from: "wikisource", kind: "title", edition: 1932 },
  // নটীর পূজা — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000natir puja": { verdict: "accept", from: "wikisource", kind: "title", edition: 1945 },
  // নবজাতক — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000nabajatak": { verdict: "accept", from: "wikisource", kind: "title", edition: 1940 },
  // নবীন — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000nabin": { verdict: "accept", from: "wikisource", kind: "title", edition: 1930 },
  // নৈবেদ্য — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000naibedya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1951 },
  // পঞ্চভূত — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000panchabhut": { verdict: "accept", from: "wikisource", kind: "title", edition: 1948 },
  // পত্রপুট — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000patraput": { verdict: "accept", from: "wikisource", kind: "title", edition: 1938 },
  // পথের সঞ্চয় — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000pather sanchay": { verdict: "accept", from: "wikisource", kind: "title", edition: 1956 },
  // পরিচয় — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000parichay": { verdict: "reject", reason: "the title is missing from the page" },
  // পলাতকা — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000palataka": { verdict: "reject", reason: "title smudged" },
  // পুনশ্চ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000punascha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1932 },
  // পূরবী — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000purabi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1925 },
  // প্রজাপতির নির্বন্ধ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000prajapatir nirbandha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1900 },
  // প্রবাহিণী — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000prabahini": { verdict: "reject", reason: "handwriting over the title" },
  // প্রহাসিনী — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000prahasini": { verdict: "accept", from: "wikisource", kind: "title", edition: 1945 },
  // প্রান্তিক — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000prantik": { verdict: "reject", reason: "the title is missing from the page" },
  // বাংলাভাষা-পরিচয় — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000bangla bhasha parichay": { verdict: "accept", from: "wikisource", kind: "title", edition: 1949 },
  // বাঁশরী — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000banshari": { verdict: "accept", from: "wikisource", kind: "title", edition: 1947 },
  // বিচিত্র গল্প — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000bichitra galpa (part 2)": { verdict: "accept", from: "wikisource", kind: "title", edition: 1894 },
  // বিচিত্র প্রবন্ধ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000bichitra prabhandha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1935 },
  // বিবিধ প্রসঙ্গ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000bibidha prasanga": { verdict: "accept", from: "wikisource", kind: "title", edition: 1883 },
  // বিশ্ব-পরিচয় — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000bishwaparichay": { verdict: "accept", from: "wikisource", kind: "title", edition: 1943 },
  // বিশ্ববিদ্যালয়ের রূপ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000bishwabidyalayer rup": { verdict: "reject", reason: "stamps and handwriting across the page" },
  // বিশ্বভারতী — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000vishwabharati": { verdict: "accept", from: "wikisource", kind: "cover", edition: 1951 },
  // বুদ্ধদেব — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000buddhadeb": { verdict: "accept", from: "wikisource", kind: "title", edition: 1960 },
  // বৈকুণ্ঠের খাতা — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000baikunther khata": { verdict: "accept", from: "wikisource", kind: "title", edition: 1896 },
  // বৌ-ঠাকুরাণীর হাট — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000bou-thakuranir hat": { verdict: "accept", from: "wikisource", kind: "title", edition: 1910 },
  // ব্যঙ্গকৌতুক — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000byangakoutuk": { verdict: "accept", from: "wikisource", kind: "title", edition: 1930 },
  // ভগ্নহৃদয় — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000bhagna hriday": { verdict: "accept", from: "wikisource", kind: "title", edition: 1881 },
  // ভানুসিংহের পত্রাবলী — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000bhanusingher patrabali": { verdict: "accept", from: "wikisource", kind: "title", edition: 1929 },
  // ভারতবর্ষ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000bharatbarsha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1905 },
  // মহাত্মা গান্ধী — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000mahatma gandhi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1963 },
  // মহুয়া — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000mahua": { verdict: "accept", from: "wikisource", kind: "title", edition: 1929 },
  // মানুষের ধর্ম্ম — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000manuser dharmma": { verdict: "accept", from: "wikisource", kind: "title", edition: 1933 },
  // মুকুট — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000mukut": { verdict: "accept", from: "wikisource", kind: "title", edition: 1945 },
  // মুক্তধারা — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000muktodhara": { verdict: "accept", from: "wikisource", kind: "title", edition: 1957 },
  // যোগাযোগ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000jogajog": { verdict: "accept", from: "wikisource", kind: "title", edition: 1946 },
  // রাজর্ষি — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000rajarshi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1961 },
  // রোগশয্যায় — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000rogshayay": { verdict: "accept", from: "wikisource", kind: "title", edition: 1940 },
  // লোকসাহিত্য — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000lokasahitya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1945 },
  // শান্তিনিকেতন ব্রহ্মচর্যাশ্রম — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000shantiniketane brahmacharyashram": { verdict: "reject", reason: "title cut off at the edge" },
  // শারদোৎসব — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000sharadotsab": { verdict: "accept", from: "wikisource", kind: "title", edition: 1958 },
  // শিক্ষা — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000shiksha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1960 },
  // শিক্ষার বিকিরণ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000shikshar bikiran": { verdict: "accept", from: "wikisource", kind: "cover", edition: 1933 },
  // শিশু ভোলানাথ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000sishu bholanath": { verdict: "accept", from: "wikisource", kind: "title", edition: 1957 },
  // শেষ লেখা — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000shesh lekha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1942 },
  // শোধ-বোধ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000shodh-bodh": { verdict: "accept", from: "wikisource", kind: "title", edition: 1931 },
  // শ্যামলী — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000shyamali": { verdict: "accept", from: "wikisource", kind: "cover", edition: 1945 },
  // সন্ধ্যা সঙ্গীত — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000sandhya sangeet": { verdict: "accept", from: "wikisource", kind: "title", edition: 1881 },
  // সভ্যতার সংকট — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000sabhyatar sankat": { verdict: "accept", from: "wikisource", kind: "title", edition: 1944 },
  // সমবায়নীতি — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000samabayneeti": { verdict: "accept", from: "wikisource", kind: "cover", edition: 1953 },
  // সমালোচনা — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000samalochana": { verdict: "accept", from: "wikisource", kind: "title", edition: 1887 },
  // সমূহ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000samuha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1908 },
  // সাহিত্য — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000sahitya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1958 },
  // সাহিত্যের স্বরূপ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000sahityer swarup": { verdict: "accept", from: "wikisource", kind: "title", edition: 1958 },
  // সেঁজুতি — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000senjuti": { verdict: "accept", from: "wikisource", kind: "title", edition: 1938 },
  // স্ফুলিঙ্গ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000sphulinga": { verdict: "accept", from: "wikisource", kind: "title", edition: 1945 },
  // স্মরণ — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000smaran": { verdict: "accept", from: "wikisource", kind: "title", edition: 1961 },
  // হাস্য-কৌতুক — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000hasya-koutuk": { verdict: "accept", from: "wikisource", kind: "title", edition: 1946 },
  // থার্ডক্লাশ — রবীন্দ্রনাথ মৈত্র
  "রবীন্দ্রনাথ মৈত্র\u0000thardaklash": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // গৌড়রাজমালা — রমাপ্রসাদ চন্দ
  "রমাপ্রসাদ চন্দ\u0000gourrajmala": { verdict: "accept", from: "wikisource", kind: "title", edition: 1912 },
  // ইয়ুরোপে তিন বৎসর — রমেশচন্দ্র দত্ত
  "রমেশচন্দ্র দত্ত\u0000europer tin batsar": { verdict: "accept", from: "wikisource", kind: "title", edition: 1883 },
  // মাধবীকঙ্কণ — রমেশচন্দ্র দত্ত
  "রমেশচন্দ্র দত্ত\u0000madhabikankan": { verdict: "reject", reason: "later printing (Kolkata PIN code, after 1972)" },
  // পুষ্পাঞ্জলি — রসময় লাহা
  "রসময় লাহা\u0000pushpanjali": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // বাঙ্গালার ইতিহাস — রাখালদাস বন্দ্যোপাধ্যায়
  "রাখালদাস বন্দ্যোপাধ্যায়\u0000bangalar itihas (part 1)": { verdict: "accept", from: "wikisource", kind: "title", edition: 1923 },
  // ময়ূখ — রাখালদাস বন্দ্যোপাধ্যায়
  "রাখালদাস বন্দ্যোপাধ্যায়\u0000mayukh": { verdict: "accept", from: "wikisource", kind: "title", edition: 1916 },
  // বাঙ্গালা ভাষা ও সাহিত্য বিষয়ক বক্তৃতা — রাজনারায়ণ বসু
  "রাজনারায়ণ বসু\u0000bangala bhasha o sahitya bishayak baktrita": { verdict: "accept", from: "wikisource", kind: "title", edition: 1879 },
  // হিন্দু অথবা প্রেসিডেন্সী কলেজের ইতিবৃত্ত — রাজনারায়ণ বসু
  "রাজনারায়ণ বসু\u0000hindu athaba presidency colleger itibritta": { verdict: "accept", from: "wikisource", kind: "title", edition: 1875 },
  // কদলী-রাজ্য — রাজমোহন নাথ
  "রাজমোহন নাথ\u0000kadali-rajya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1941 },
  // আনন্দীবাঈ ইত্যাদি গল্প — রাজশেখর বসু
  "রাজশেখর বসু\u0000anandibai ityadi galpa": { verdict: "accept", from: "wikisource", kind: "title", edition: 1957 },
  // কজ্জলী — রাজশেখর বসু
  "রাজশেখর বসু\u0000kajjali": { verdict: "reject", reason: "illustration by Jatindrakumar Sen (d. 1966)" },
  // কৃষ্ণকলি ইত্যাদি গল্প — রাজশেখর বসু
  "রাজশেখর বসু\u0000krishnakali ityadi galpa": { verdict: "accept", from: "wikisource", kind: "title", edition: 1953 },
  // গড্ডলিকা — রাজশেখর বসু
  "রাজশেখর বসু\u0000gaddalika": { verdict: "accept", from: "wikisource", kind: "title", edition: 1924 },
  // গল্পকল্প — রাজশেখর বসু
  "রাজশেখর বসু\u0000galpakalpa": { verdict: "accept", from: "wikisource", kind: "title", edition: 1950 },
  // চমৎকুমারী ইত্যাদি গল্প — রাজশেখর বসু
  "রাজশেখর বসু\u0000chamatkari ityadi galpa": { verdict: "accept", from: "wikisource", kind: "title", edition: 1959 },
  // ধুস্তুরী মায়া ইত্যাদি গল্প — রাজশেখর বসু
  "রাজশেখর বসু\u0000dhusturi maya ityadi galpa": { verdict: "accept", from: "wikisource", kind: "title", edition: 1952 },
  // নীল তারা ইত্যাদি গল্প — রাজশেখর বসু
  "রাজশেখর বসু\u0000neel tara ityadi galpa": { verdict: "reject", reason: "later printing (Kolkata-73 address, after the 1972 PIN codes)" },
  // বিচিন্তা — রাজশেখর বসু
  "রাজশেখর বসু\u0000bichinta": { verdict: "accept", from: "wikisource", kind: "title", edition: 1956 },
  // লঘুগুরু প্রবন্ধাবলী — রাজশেখর বসু
  "রাজশেখর বসু\u0000laghu guru prabandhabali": { verdict: "accept", from: "wikisource", kind: "title", edition: 1939 },
  // হনুমানের স্বপ্ন ইত্যাদি গল্প — রাজশেখর বসু
  "রাজশেখর বসু\u0000hanumaner swapna ityadi galpa": { verdict: "accept", from: "wikisource", kind: "title", edition: 1948 },
  // কালিদাস ও ভবভূতি — রাজেন্দ্রনাথ বিদ্যাভূষণ
  "রাজেন্দ্রনাথ বিদ্যাভূষণ\u0000kalidas o bhababhuti": { verdict: "reject", reason: "library stamps and marks across the page" },
  // ভাবে অভাব — রাধানাথ মিত্র
  "রাধানাথ মিত্র\u0000bhabe abhab": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // আজকের আমেরিকা — রামনাথ বিশ্বাস
  "রামনাথ বিশ্বাস\u0000ajker america": { verdict: "accept", from: "wikisource", kind: "title", edition: 1945 },
  // নিগ্রো জাতির নূতন জীবন — রামনাথ বিশ্বাস
  "রামনাথ বিশ্বাস\u0000negro jatir nutan jiban": { verdict: "accept", from: "wikisource", kind: "title", edition: 1949 },
  // মাউ মাউএর দেশে — রামনাথ বিশ্বাস
  "রামনাথ বিশ্বাস\u0000mau mauer deshe": { verdict: "accept", from: "wikisource", kind: "title", edition: 1953 },
  // চরিত-কথা — রামেন্দ্রসুন্দর ত্রিবেদী
  "রামেন্দ্রসুন্দর ত্রিবেদী\u0000charit-katha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1913 },
  // এরাও মানুষ — রেনে মারাঁ
  "রেনে মারাঁ\u0000batouala": { verdict: "accept", from: "wikisource", kind: "cover", edition: 1950 },
  // টল্‌স্টয়ের গল্প — ল্যেভ তলস্তোয়
  "ল্যেভ তলস্তোয়\u0000tolstoyer galpo": { verdict: "accept", from: "wikisource", kind: "title", edition: 1955 },
  // দেনা-পাওনা — শরৎচন্দ্র চট্টোপাধ্যায়
  "শরৎচন্দ্র চট্টোপাধ্যায়\u0000dena-paona": { verdict: "reject", reason: "later printing (Kolkata PIN code, after 1972)" },
  // নারীর মূল্য — শরৎচন্দ্র চট্টোপাধ্যায়
  "শরৎচন্দ্র চট্টোপাধ্যায়\u0000nareer mulya": { verdict: "accept", from: "wikisource", kind: "title", edition: 1957 },
  // নিষ্কৃতি — শরৎচন্দ্র চট্টোপাধ্যায়
  "শরৎচন্দ্র চট্টোপাধ্যায়\u0000nishkriti": { verdict: "accept", from: "wikisource", kind: "title", edition: 1952 },
  // পল্লী-সমাজ — শরৎচন্দ্র চট্টোপাধ্যায়
  "শরৎচন্দ্র চট্টোপাধ্যায়\u0000palli-samaj": { verdict: "reject", reason: "stamps and a pasted slip across the page" },
  // বড়দিদি — শরৎচন্দ্র চট্টোপাধ্যায়
  "শরৎচন্দ্র চট্টোপাধ্যায়\u0000barodidi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1922 },
  // মেজদিদি — শরৎচন্দ্র চট্টোপাধ্যায়
  "শরৎচন্দ্র চট্টোপাধ্যায়\u0000mejodidi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1963 },
  // আমার দেখা তুরষ্ক — শামসুন নাহার মাহমুদ
  "শামসুন নাহার মাহমুদ\u0000amar dekha turashka": { verdict: "reject", reason: "library stamps and marks across the page" },
  // শিশুর শিক্ষা — শামসুন নাহার মাহমুদ
  "শামসুন নাহার মাহমুদ\u0000shishur shiksha": { verdict: "reject", reason: "library stamps and marks across the page" },
  // এই কি ব্রাহ্ম বিবাহ — শিবনাথ শাস্ত্রী
  "শিবনাথ শাস্ত্রী\u0000ei ki brahma bibaha": { verdict: "reject", reason: "library stamps and marks across the page" },
  // জাতিভেদ — শিবনাথ শাস্ত্রী
  "শিবনাথ শাস্ত্রী\u0000jatibhed": { verdict: "accept", from: "wikisource", kind: "title", edition: 1884 },
  // শ্যামাপ্রসাদের কয়েকটি রচনা — শ্যামাপ্রসাদ মুখোপাধ্যায়
  "শ্যামাপ্রসাদ মুখোপাধ্যায়\u0000shyamaprasader koyekti rachana": { verdict: "accept", from: "wikisource", kind: "title", edition: 1956 },
  // আনন্দী বাঈ — সখারাম গণেশ দেউস্কর
  "সখারাম গণেশ দেউস্কর\u0000anandi bai": { verdict: "reject", reason: "library stamp over the title" },
  // ঝাঁশীর রাজকুমার — সখারাম গণেশ দেউস্কর
  "সখারাম গণেশ দেউস্কর\u0000jhanshir rajakumar": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // বাজী রাও — সখারাম গণেশ দেউস্কর
  "সখারাম গণেশ দেউস্কর\u0000baji rao": { verdict: "accept", from: "wikisource", kind: "title", edition: 1901 },
  // পালামৌ — সঞ্জীবচন্দ্র চট্টোপাধ্যায়
  "সঞ্জীবচন্দ্র চট্টোপাধ্যায়\u0000palamou": { verdict: "accept", from: "wikisource", kind: "title", edition: 1951 },
  // ভারতে অলিকসন্দর — সত্যচরণ শাস্ত্রী
  "সত্যচরণ শাস্ত্রী\u0000bharate aliksandar": { verdict: "accept", from: "wikisource", kind: "title", edition: 1909 },
  // আমার বাল্যকথা — সত্যেন্দ্রনাথ ঠাকুর
  "সত্যেন্দ্রনাথ ঠাকুর\u0000amar balyakatha": { verdict: "reject", reason: "title too faint to read" },
  // ফুলের ফসল — সত্যেন্দ্রনাথ দত্ত
  "সত্যেন্দ্রনাথ দত্ত\u0000phuler fasal": { verdict: "accept", from: "wikisource", kind: "title" },
  // আমার দেখা রাশিয়া — সত্যেন্দ্রনাথ মজুমদার
  "সত্যেন্দ্রনাথ মজুমদার\u0000amar dekha russia": { verdict: "accept", from: "wikisource", kind: "title", edition: 1952 },
  // ষ্ট্যালিন — সত্যেন্দ্রনাথ মজুমদার
  "সত্যেন্দ্রনাথ মজুমদার\u0000stalin": { verdict: "accept", from: "wikisource", kind: "title", edition: 1944 },
  // জেবুন্নিসা বেগম — সমরেন্দ্রচন্দ্র দেববর্মণ
  "সমরেন্দ্রচন্দ্র দেববর্মণ\u0000zebunnisa begum": { verdict: "accept", from: "wikisource", kind: "title", edition: 1929 },
  // নিবেদিতা — সরলাবালা সরকার
  "সরলাবালা সরকার\u0000nivedita": { verdict: "accept", from: "wikisource", kind: "title", edition: 1912 },
  // মিঠেকড়া — সুকান্ত ভট্টাচার্য
  "সুকান্ত ভট্টাচার্য\u0000mithe kora": { verdict: "accept", from: "wikisource", kind: "title", edition: 1951 },
  // হ য ব র ল — সুকুমার রায়
  "সুকুমার রায়\u0000ha ja ba ra la": { verdict: "reject", reason: "page is wider than tall" },
  // ছন্দের টুংটাং — সুনির্মল বসু
  "সুনির্মল বসু\u0000chhander tungtang": { verdict: "reject", reason: "decorative title lettering hard to read" },
  // সুনির্মল বসুর শ্রেষ্ঠ কবিতা — সুনির্মল বসু
  "সুনির্মল বসু\u0000sunirmal basur shrestha kabita": { verdict: "reject", reason: "decorative art by an unidentified artist; printing year uncertain" },
  // সাহানা — সুনীতি দেবী
  "সুনীতি দেবী\u0000sahana": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // তরুণের স্বপ্ন — সুভাষচন্দ্র বসু
  "সুভাষচন্দ্র বসু\u0000taruner swapna": { verdict: "accept", from: "wikisource", kind: "cover", edition: 1938 },
  // বিশ্বমানবের লক্ষ্মীলাভ — সুরেন্দ্রনাথ ঠাকুর
  "সুরেন্দ্রনাথ ঠাকুর\u0000bishwamanaber lakshmilabh": { verdict: "accept", from: "wikisource", kind: "title", edition: 1940 },
  // ভারতীয় প্রাচীন চিত্রকলা — সুরেন্দ্রনাথ দাশগুপ্ত
  "সুরেন্দ্রনাথ দাশগুপ্ত\u0000bharatiya prachin chitrakala": { verdict: "accept", from: "wikisource", kind: "title", edition: 1942 },
  // ইরাণী উপকথা — সুরেশচন্দ্র চক্রবর্তী
  "সুরেশচন্দ্র চক্রবর্তী\u0000irani upakatha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1920 },
  // হানাষি — সুরেশচন্দ্র বন্দ্যোপাধ্যায়
  "সুরেশচন্দ্র বন্দ্যোপাধ্যায়\u0000hanashi": { verdict: "reject", reason: "a library catalogue slip pasted over the page" },
  // কৃষক আন্দোলন ও মধ্যবিত্ত — সুশীলকুমার বসু
  "সুশীলকুমার বসু\u0000krishak andolan o madhyabitta": { verdict: "reject", reason: "library stamps and marks across the page" },
  // স্পেনীয় মুসলমান সভ্যতা — সৈয়দ ইসমাইল হোসেন সিরাজী
  "সৈয়দ ইসমাইল হোসেন সিরাজী\u0000spainiyo musalman sabhyata": { verdict: "accept", from: "wikisource", kind: "title", edition: 1916 },
  // কাহাকে? — স্বর্ণকুমারী দেবী
  "স্বর্ণকুমারী দেবী\u0000kahake?": { verdict: "reject", reason: "library stamp over the title" },
  // গল্পস্বল্প — স্বর্ণকুমারী দেবী
  "স্বর্ণকুমারী দেবী\u0000galpaswalpa": { verdict: "accept", from: "wikisource", kind: "title", edition: 1893 },
  // ছিন্নমুকুল — স্বর্ণকুমারী দেবী
  "স্বর্ণকুমারী দেবী\u0000chhinnamukul": { verdict: "accept", from: "wikisource", kind: "title", edition: 1913 },
  // মিবাররাজ — স্বর্ণকুমারী দেবী
  "স্বর্ণকুমারী দেবী\u0000mibarraj": { verdict: "accept", from: "wikisource", kind: "title", edition: 1887 },
  // পওহারী বাবা — স্বামী বিবেকানন্দ
  "স্বামী বিবেকানন্দ\u0000paohari baba": { verdict: "accept", from: "wikisource", kind: "title", edition: 1909 },
  // বর্ত্তমান ভারত — স্বামী বিবেকানন্দ
  "স্বামী বিবেকানন্দ\u0000bartaman bharat": { verdict: "accept", from: "wikisource", kind: "title", edition: 1905 },
  // বীরবাণী — স্বামী বিবেকানন্দ
  "স্বামী বিবেকানন্দ\u0000beerbani": { verdict: "reject", reason: "handwriting across the page" },
  // ভাব্‌বার কথা — স্বামী বিবেকানন্দ
  "স্বামী বিবেকানন্দ\u0000bhabbar katha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1919 },
  // প্রাচীন বাংলার গৌরব — হরপ্রসাদ শাস্ত্রী
  "হরপ্রসাদ শাস্ত্রী\u0000prachin banglar gourab": { verdict: "reject", reason: "library stamps and marks across the page" },
  // ৺কৃত্তিবাসের পরিচয় সংগ্রহ — হরিশচন্দ্র মিত্র
  "হরিশচন্দ্র মিত্র\u0000krittibaser parichay sangrah": { verdict: "accept", from: "wikisource", kind: "title", edition: 1870 },
  // দেওয়ানা — হরিসাধন মুখোপাধ্যায়
  "হরিসাধন মুখোপাধ্যায়\u0000deoana": { verdict: "accept", from: "wikisource", kind: "title", edition: 1919 },
  // ফুলমণি ও করুণার বিবরণ — হানা ক্যাথেরিন মুলেন্স
  "হানা ক্যাথেরিন মুলেন্স\u0000fulmoni o karunar bibaran": { verdict: "accept", from: "wikisource", kind: "title", edition: 1852 },
  // তবুও আমি তাঁহারই উপর নির্ভর করিব — হানা রোসেলি হিগেন্স
  "হানা রোসেলি হিগেন্স\u0000cloud and sunshine": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // আশাকানন — হেমচন্দ্র বন্দ্যোপাধ্যায়
  "হেমচন্দ্র বন্দ্যোপাধ্যায়\u0000ashakanan": { verdict: "accept", from: "wikisource", kind: "title", edition: 1953 },
  // কবিতাবলী — হেমচন্দ্র বন্দ্যোপাধ্যায়
  "হেমচন্দ্র বন্দ্যোপাধ্যায়\u0000kabitabali": { verdict: "accept", from: "wikisource", kind: "title", edition: 1871 },
  // চিন্তাতরঙ্গিণী — হেমচন্দ্র বন্দ্যোপাধ্যায়
  "হেমচন্দ্র বন্দ্যোপাধ্যায়\u0000chintatarangini": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // বীরবাহু কাব্য — হেমচন্দ্র বন্দ্যোপাধ্যায়
  "হেমচন্দ্র বন্দ্যোপাধ্যায়\u0000birabahu kabya": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // ভারতভিক্ষা — হেমচন্দ্র বন্দ্যোপাধ্যায়
  "হেমচন্দ্র বন্দ্যোপাধ্যায়\u0000bharatbhiksha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1880 },
  // নেপালে বঙ্গনারী — হেমলতা দেবী
  "হেমলতা দেবী\u0000nepale banganari": { verdict: "accept", from: "wikisource", kind: "title", edition: 1911 },
  // ভারতবর্ষের ইতিহাস — হেমলতা দেবী
  "হেমলতা দেবী\u0000bharatabarsher itihas": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // মিবার-গৌরব-কথা — হেমলতা দেবী
  "হেমলতা দেবী\u0000mibar-gourab-katha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1912 },
  // নাগপাশ — হেমেন্দ্রপ্রসাদ ঘোষ
  "হেমেন্দ্রপ্রসাদ ঘোষ\u0000nagapash": { verdict: "accept", from: "wikisource", kind: "title", edition: 1908 },
  // গোচারণের মাঠ — অক্ষয়চন্দ্র সরকার
  "অক্ষয়চন্দ্র সরকার\u0000gocharaner maath": { verdict: "reject", reason: "library stamp over the title" },
  // প্রেমিক সন্ন্যাসী — অনাথনাথ বসু
  "অনাথনাথ বসু\u0000premik sannyasi": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // পথে-বিপথে — অবনীন্দ্রনাথ ঠাকুর
  "অবনীন্দ্রনাথ ঠাকুর\u0000pathe-bipathe": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // মহাভারত (উপক্রমণিকাভাগ) — ঈশ্বরচন্দ্র বিদ্যাসাগর
  "ঈশ্বরচন্দ্র বিদ্যাসাগর\u0000mahabhjarat (upakramanikabhag)": { verdict: "accept", from: "wikisource", kind: "title", edition: 1893 },
  // বেল্লিক রামায়ণ — কালীপ্রসন্ন বিদ্যারত্ন
  "কালীপ্রসন্ন বিদ্যারত্ন\u0000bellik ramayan": { verdict: "accept", from: "wikisource", kind: "title", edition: 1909 },
  // সাহিত্য-চিন্তা — কুমুদিনী বসু
  "কুমুদিনী বসু\u0000sahitya-chinta": { verdict: "accept", from: "wikisource", kind: "title", edition: 1915 },
  // প্রাচীন ভারতে নারী — ক্ষিতিমোহন সেন
  "ক্ষিতিমোহন সেন\u0000pracheen bharate naree": { verdict: "accept", from: "wikisource", kind: "cover", edition: 1950 },
  // ভয়ভাঙ্গা — দীনেশচন্দ্র সেন
  "দীনেশচন্দ্র সেন\u0000bhayabhanga": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // সতী — দীনেশচন্দ্র সেন
  "দীনেশচন্দ্র সেন\u0000sati": { verdict: "reject", reason: "printing year not shown; could be after 1965" },
  // মেয়েলি ব্রত ও কথা — পরমেশপ্রসন্ন রায়
  "পরমেশপ্রসন্ন রায়\u0000meyeli brata o katha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1908 },
  // কাদম্বরী — বাণভট্ট ও ভূষণভট্ট
  "বাণভট্ট ও ভূষণভট্ট\u0000kadambari": { verdict: "accept", from: "wikisource", kind: "title", edition: 1892 },
  // অদ্ভুত রামায়ণ — বাল্মীকি
  "বাল্মীকি\u0000adbhuta ramayana": { verdict: "accept", from: "wikisource", kind: "title", edition: 1890 },
  // নীলগঞ্জের ফালমন সাহেব — বিভূতিভূষণ বন্দ্যোপাধ্যায়
  "বিভূতিভূষণ বন্দ্যোপাধ্যায়\u0000neelganjer falman saheb": { verdict: "accept", from: "wikisource", kind: "title", edition: 1959 },
  // রসমঞ্জরী — ভানুদত্ত মিশ্র
  "ভানুদত্ত মিশ্র\u0000rasamanjari": { verdict: "accept", from: "wikisource", kind: "title", edition: 1853 },
  // মোহনলাল — যোগীন্দ্রনাথ সরকার
  "যোগীন্দ্রনাথ সরকার\u0000mohanalal": { verdict: "accept", from: "wikisource", kind: "title", edition: 1923 },
  // কুরু পাণ্ডব — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000kuru pandab": { verdict: "accept", from: "wikisource", kind: "title", edition: 1931 },
  // সংকলন — রবীন্দ্রনাথ ঠাকুর
  "রবীন্দ্রনাথ ঠাকুর\u0000sangkalan": { verdict: "accept", from: "wikisource", kind: "title", edition: 1946 },
  // পাষাণের কথা — রাখালদাস বন্দ্যোপাধ্যায়
  "রাখালদাস বন্দ্যোপাধ্যায়\u0000pashaner katha": { verdict: "accept", from: "wikisource", kind: "title", edition: 1914 },
  // গ্রাম্য উপাখ্যান — রাজনারায়ণ বসু
  "রাজনারায়ণ বসু\u0000gramya upakhyan": { verdict: "accept", from: "wikisource", kind: "title", edition: 1907 },
  // মহাভারত — রাজশেখর বসু
  "রাজশেখর বসু\u0000mahabharat": { verdict: "reject", reason: "later printing (Kolkata-73 address, after the 1972 PIN codes)" },
  // মহারাজ কৃষ্ণচন্দ্র রায়স্য চরিত্রং — রাজীবলোচন মুখোপাধ্যায়
  "রাজীবলোচন মুখোপাধ্যায়\u0000maharaj krishna chandra rayasya charitrang": { verdict: "accept", from: "wikisource", kind: "title", edition: 1811 },
  // বত্রিশ সিংহাসন — লাল্লু লাল
  "লাল্লু লাল\u0000singhasan battisi": { verdict: "accept", from: "wikisource", kind: "title", edition: 1854 },
  // গুরুদক্ষিণা — সতীশচন্দ্র রায়
  "সতীশচন্দ্র রায়\u0000gurudakshina": { verdict: "reject", reason: "library stamps (RARE) across the page" },
  // Pride and Prejudice — Jane Austen
  "jane austen\u0000pride and prejudice": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1894, artist: { name: "Hugh Thomson", died: 1920 } },
  // Moby-Dick — Herman Melville
  "herman melville\u0000moby-dick": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Alice's Adventures in Wonderland — Lewis Carroll
  "lewis carroll\u0000alice's adventures in wonderland": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // Romeo and Juliet — William Shakespeare
  "william shakespeare\u0000romeo and juliet": { verdict: "reject", reason: "producer's composite" },
  // Dracula — Bram Stoker
  "bram stoker\u0000dracula": { verdict: "reject", reason: "producer's recreation of the binding" },
  // The Complete Works of William Shakespeare — William Shakespeare
  "william shakespeare\u0000the complete works of william shakespeare": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1623, artist: { name: "Martin Droeshout", died: 1651 } },
  // Strange Case of Dr Jekyll and Mr Hyde — Robert Louis Stevenson
  "robert louis stevenson\u0000strange case of dr jekyll and mr hyde": { verdict: "reject", reason: "producer's composite" },
  // Middlemarch — George Eliot
  "george eliot\u0000middlemarch": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Odyssey — Homer
  "homer\u0000odyssey": { verdict: "reject", reason: "producer's composite" },
  // The Blue Castle — Lucy Maud Montgomery
  "lucy maud montgomery\u0000the blue castle": { verdict: "reject", reason: "likely a producer's composite" },
  // Jane Eyre — Charlotte Brontë
  "charlotte brontë\u0000jane eyre": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Little Women — Louisa May Alcott
  "louisa may alcott\u0000little women": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // The Picture of Dorian Gray — Oscar Wilde
  "oscar wilde\u0000the picture of dorian gray": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // A Tale of Two Cities — Charles Dickens
  "charles dickens\u0000a tale of two cities": { verdict: "reject", reason: "producer's composite" },
  // The Great Gatsby — F. Scott Fitzgerald
  "f. scott fitzgerald\u0000the great gatsby": { verdict: "reject", reason: "jacket art by Francis Cugat (d. 1981)" },
  // The Enchanted April — Elizabeth von Arnim
  "elizabeth von arnim\u0000the enchanted april": { verdict: "reject", reason: "painting signed by an unidentified artist" },
  // The Yellow Wall Paper — Charlotte Perkins Gilman
  "charlotte perkins gilman\u0000the yellow wall paper": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1899 },
  // The Prince — Niccolò Machiavelli
  "niccolò machiavelli\u0000the prince": { verdict: "reject", reason: "producer's composite" },
  // যুদ্ধ ও শান্তি — Leo Tolstoy
  "leo tolstoy\u0000war and peace": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Cranford — Elizabeth Gaskell
  "elizabeth gaskell\u0000cranford": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The King in Yellow — Robert W. Chambers
  "robert w. chambers\u0000the king in yellow": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1895 },
  // The Expedition of Humphry Clinker — Tobias Smollett
  "tobias smollett\u0000the expedition of humphry clinker": { verdict: "reject", reason: "producer's composite" },
  // The Adventures of Ferdinand, Count Fathom — Tobias Smollett
  "tobias smollett\u0000the adventures of ferdinand, count fathom": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1907 },
  // The History of Tom Jones, a Foundling — Henry Fielding
  "henry fielding\u0000the history of tom jones, a foundling": { verdict: "reject", reason: "producer's composite" },
  // The Adventures of Tom Sawyer — Mark Twain
  "mark twain\u0000the adventures of tom sawyer": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Adventures of Roderick Random — Tobias Smollett
  "tobias smollett\u0000the adventures of roderick random": { verdict: "reject", reason: "producer's composite" },
  // Narrative of the Life of Frederick Douglass, an American Slave — Frederick Douglass
  "frederick douglass\u0000narrative of the life of frederick douglass, an american slave": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The String of Pearls — James Malcolm Rymer ও Thomas Peckett Prest
  "james malcolm rymer ও thomas peckett prest\u0000the string of pearls": { verdict: "accept", from: "gutenberg", kind: "title" },
  // The Scarlet Letter — Nathaniel Hawthorne
  "nathaniel hawthorne\u0000the scarlet letter": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Confessions — Augustine of Hippo
  "augustine of hippo\u0000confessions": { verdict: "reject", reason: "producer's composite" },
  // The Wonderful Wizard of Oz — L. Frank Baum
  "l. frank baum\u0000the wonderful wizard of oz": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1900, artist: { name: "W. W. Denslow", died: 1915 } },
  // Great Expectations — Charles Dickens
  "charles dickens\u0000great expectations": { verdict: "reject", reason: "producer's composite" },
  // The Camp Fire Girls Solve a Mystery — Hildegard G. Frey
  "hildegard g. frey\u0000the camp fire girls solve a mystery": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // A Modest Proposal — Jonathan Swift
  "jonathan swift\u0000a modest proposal": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1729 },
  // Leviathan — Thomas Hobbes
  "thomas hobbes\u0000leviathan": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1651, artist: { name: "Abraham Bosse", died: 1676 } },
  // The Air Pirate — Guy Thorne
  "guy thorne\u0000the air pirate": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Adventures of Huckleberry Finn — Mark Twain
  "mark twain\u0000adventures of huckleberry finn": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1885, artist: { name: "E. W. Kemble", died: 1933 } },
  // Wuthering Heights — Emily Brontë
  "emily brontë\u0000wuthering heights": { verdict: "reject", reason: "producer's composite" },
  // Walden, and On The Duty Of Civil Disobedience — Henry David Thoreau
  "henry david thoreau\u0000walden, and on the duty of civil disobedience": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1854 },
  // A Case in Camera — Oliver Onions
  "oliver onions\u0000a case in camera": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1921 },
  // Ulysses — James Joyce
  "james joyce\u0000ulysses": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1922 },
  // A Doll's House — Henrik Ibsen
  "henrik ibsen\u0000a doll's house": { verdict: "reject", reason: "producer's composite" },
  // Sense and Sensibility — Jane Austen
  "jane austen\u0000sense and sensibility": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Dunwich Horror — H. P. Lovecraft
  "h. p. lovecraft\u0000the dunwich horror": { verdict: "reject", reason: "a magazine issue's cover, not this work's" },
  // The Legend of Sleepy Hollow — Washington Irving
  "washington irving\u0000the legend of sleepy hollow": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Importance of Being Earnest — Oscar Wilde
  "oscar wilde\u0000the importance of being earnest": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // Treasure Island — Robert Louis Stevenson
  "robert louis stevenson\u0000treasure island": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1911, artist: { name: "N. C. Wyeth", died: 1945 } },
  // Anne of Green Gables — Lucy Maud Montgomery
  "lucy maud montgomery\u0000anne of green gables": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1908 },
  // Second Treatise of Government — John Locke
  "john locke\u0000second treatise of government": { verdict: "reject", reason: "producer's composite" },
  // The Mysteries of Udolpho — Ann Radcliffe
  "ann radcliffe\u0000the mysteries of udolpho": { verdict: "reject", reason: "producer's composite" },
  // The Brothers Karamazov — Fyodor Dostoevsky
  "fyodor dostoevsky\u0000the brothers karamazov": { verdict: "reject", reason: "producer's composite" },
  // The Call of Cthulhu — H. P. Lovecraft
  "h. p. lovecraft\u0000the call of cthulhu": { verdict: "reject", reason: "a magazine issue's cover, not this work's" },
  // The Souls of Black Folk — W. E. B. Du Bois
  "w. e. b. du bois\u0000the souls of black folk": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1903 },
  // Under the Red Dragon — James Grant
  "james grant\u0000under the red dragon": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Pirate — Walter Scott
  "walter scott\u0000the pirate": { verdict: "accept", from: "gutenberg", kind: "title" },
  // What Will People Say? A Novel — Rupert Hughes
  "rupert hughes\u0000what will people say? a novel": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Turn of the Screw — Henry James
  "henry james\u0000the turn of the screw": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // A Christmas Carol — Charles Dickens
  "charles dickens\u0000a christmas carol": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Thus Spake Zarathustra — Friedrich Nietzsche
  "friedrich nietzsche\u0000thus spake zarathustra": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Problem of Cell 13 — Jacques Futrelle
  "jacques futrelle\u0000the problem of cell 13": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Carmen — Prosper Mérimée
  "prosper mérimée\u0000carmen": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Whose Body? — Dorothy L. Sayers
  "dorothy l. sayers\u0000whose body?": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1923 },
  // Beyond Good and Evil — Friedrich Nietzsche
  "friedrich nietzsche\u0000beyond good and evil": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Republic — Plato
  "plato\u0000the republic": { verdict: "reject", reason: "producer's composite" },
  // The Interesting Narrative of the Life of Olaudah Equiano — Olaudah Equiano
  "olaudah equiano\u0000the interesting narrative of the life of olaudah equiano": { verdict: "reject", reason: "producer's composite" },
  // Changeling, and Other Stories — Brian Oswald Donn-Byrne
  "brian oswald donn-byrne\u0000changeling, and other stories": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Washington Confidential — Jack Lait ও Lee Mortimer
  "jack lait ও lee mortimer\u0000washington confidential": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1951 },
  // The Man Who Was Thursday — G. K. Chesterton
  "g. k. chesterton\u0000the man who was thursday": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1908 },
  // Peter Pan — J. M. Barrie
  "j. m. barrie\u0000peter pan": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1911 },
  // The Innocence of Father Brown — G. K. Chesterton
  "g. k. chesterton\u0000the innocence of father brown": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // On Liberty — John Stuart Mill
  "john stuart mill\u0000on liberty": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Treasure of Pearls — Gustave Aimard
  "gustave aimard\u0000the treasure of pearls": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Return of Sherlock Holmes — Arthur Conan Doyle
  "arthur conan doyle\u0000the return of sherlock holmes": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1905 },
  // Flower, Fruit, and Thorn Pieces; — Jean Paul
  "jean paul\u0000flower, fruit, and thorn pieces;": { verdict: "reject", reason: "producer's composite" },
  // In Jeopardy — Van Tassel Sutphen
  "van tassel sutphen\u0000in jeopardy": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Emma — Jane Austen
  "jane austen\u0000emma": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Green Mummy — Fergus Hume
  "fergus hume\u0000the green mummy": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Forest Days — George Payne Rainsford James
  "george payne rainsford james\u0000forest days": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Cask of Amontillado — Edgar Allan Poe
  "edgar allan poe\u0000the cask of amontillado": { verdict: "reject", reason: "producer's composite" },
  // The Secret of Father Brown — G. K. Chesterton
  "g. k. chesterton\u0000the secret of father brown": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1927 },
  // At the Mountains of Madness — H. P. Lovecraft
  "h. p. lovecraft\u0000at the mountains of madness": { verdict: "reject", reason: "a magazine issue's cover, not this work's" },
  // Linnet — Grant Allen
  "grant allen\u0000linnet": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Enchiridion of Epictetus — Epictetus
  "epictetus\u0000enchiridion of epictetus": { verdict: "reject", reason: "producer's own cover design" },
  // The Memoirs of Sherlock Holmes — Arthur Conan Doyle
  "arthur conan doyle\u0000the memoirs of sherlock holmes": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Heart of Darkness — Joseph Conrad
  "joseph conrad\u0000heart of darkness": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Case-Book of Sherlock Holmes — Arthur Conan Doyle
  "arthur conan doyle\u0000the case-book of sherlock holmes": { verdict: "reject", reason: "producer's composite" },
  // The Mystery of Edwin Drood — Charles Dickens
  "charles dickens\u0000the mystery of edwin drood": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // That Which Hath Wings — Clotilde Graves
  "clotilde graves\u0000that which hath wings": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Monk — Matthew Gregory Lewis
  "matthew gregory lewis\u0000the monk": { verdict: "reject", reason: "producer's composite" },
  // Only a Girl's Love — Charles Garvice
  "charles garvice\u0000only a girl's love": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // The Wisdom of Father Brown — G. K. Chesterton
  "g. k. chesterton\u0000the wisdom of father brown": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Oedipus King of Thebes — Sophocles
  "sophocles\u0000oedipus king of thebes": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Countess of Pembroke's Arcadia — Philip Sidney
  "philip sidney\u0000the countess of pembroke's arcadia": { verdict: "accept", from: "gutenberg", kind: "title" },
  // One of the Six Hundred — James Grant
  "james grant\u0000one of the six hundred": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // Four Arthurian Romances — Chrétien de Troyes
  "chrétien de troyes\u0000four arthurian romances": { verdict: "reject", reason: "producer's composite" },
  // A Narrative of the Captivity and Restoration of Mrs. Mary Rowlandson — Mary Rowlandson
  "mary rowlandson\u0000a narrative of the captivity and restoration of mrs. mary rowlandson": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Woman in White — Wilkie Collins
  "wilkie collins\u0000the woman in white": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // Cameron of Lochiel — Aubert de Gaspé
  "aubert de gaspé\u0000cameron of lochiel": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // On the Origin of Species — Charles Darwin
  "charles darwin\u0000on the origin of species": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Iliad — Homer
  "homer\u0000iliad": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // One Woman — Alfred Ollivant
  "alfred ollivant\u0000one woman": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Anabasis of Alexander — Arrian
  "arrian\u0000anabasis of alexander": { verdict: "reject", reason: "producer's composite" },
  // A Farewell to Arms — Ernest Hemingway
  "ernest hemingway\u0000a farewell to arms": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1929 },
  // The Divine Comedy — Dante Alighieri
  "dante alighieri\u0000the divine comedy": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Life on the Mississippi — Mark Twain
  "mark twain\u0000life on the mississippi": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Unnatural Death — Dorothy L. Sayers
  "dorothy l. sayers\u0000unnatural death": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1927 },
  // A Pickle for the Knowing Ones — Timothy Dexter
  "timothy dexter\u0000a pickle for the knowing ones": { verdict: "accept", from: "gutenberg", kind: "title" },
  // The Art of War — Sun Tzu
  "sun tzu\u0000the art of war": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Girl Philippa — Robert W. Chambers
  "robert w. chambers\u0000the girl philippa": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Don Quixote — Miguel de Cervantes
  "miguel de cervantes\u0000don quixote": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Around the World in Eighty Days — Jules Verne
  "jules verne\u0000around the world in eighty days": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // White Nights, and Other Stories — Fyodor Dostoevsky
  "fyodor dostoevsky\u0000white nights, and other stories": { verdict: "reject", reason: "producer's composite" },
  // Catriona — Robert Louis Stevenson
  "robert louis stevenson\u0000catriona": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Call of the Wild — Jack London
  "jack london\u0000the call of the wild": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1903 },
  // Manon Lescaut — Antoine François Prévost
  "antoine françois prévost\u0000manon lescaut": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Eloisa — Jean-Jacques Rousseau
  "jean-jacques rousseau\u0000eloisa": { verdict: "accept", from: "gutenberg", kind: "title" },
  // Reminiscences of a Stock Operator — Edwin Lefèvre
  "edwin lefèvre\u0000reminiscences of a stock operator": { verdict: "reject", reason: "producer's own cover design" },
  // Rizal's Own Story of His Life — José Rizal
  "josé rizal\u0000rizal's own story of his life": { verdict: "reject", reason: "producer's composite" },
  // Les Misérables — Victor Hugo
  "victor hugo\u0000les misérables": { verdict: "reject", reason: "no title on the binding" },
  // The Wealth of Nations — Adam Smith
  "adam smith\u0000the wealth of nations": { verdict: "reject", reason: "producer's own cover design" },
  // The Great God Pan — Arthur Machen
  "arthur machen\u0000the great god pan": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Secret Garden — Frances Hodgson Burnett
  "frances hodgson burnett\u0000the secret garden": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Anna Karenina — Leo Tolstoy
  "leo tolstoy\u0000anna karenina": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Gulliver's Travels — Jonathan Swift
  "jonathan swift\u0000gulliver's travels": { verdict: "reject", reason: "producer's composite" },
  // Daughters of Nijo — Winnifred Eaton
  "winnifred eaton\u0000daughters of nijo": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Secret Agent — Joseph Conrad
  "joseph conrad\u0000the secret agent": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Jungle Book — Rudyard Kipling
  "rudyard kipling\u0000the jungle book": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1894 },
  // The Sorrows of Young Werther — Johann Wolfgang von Goethe
  "johann wolfgang von goethe\u0000the sorrows of young werther": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Some Jewish Witnesses For Christ — Aaron Bernstein
  "aaron bernstein\u0000some jewish witnesses for christ": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Calculus Made Easy — Silvanus P. Thompson
  "silvanus p. thompson\u0000calculus made easy": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1914 },
  // Mr Standfast — John Buchan
  "john buchan\u0000mr standfast": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1919 },
  // বাবরনামা — Babur
  "babur\u0000baburnama": { verdict: "reject", reason: "producer's composite" },
  // Tales of Terror and Mystery — Arthur Conan Doyle
  "arthur conan doyle\u0000tales of terror and mystery": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Apology — Plato
  "plato\u0000apology": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Oliver Twist — Charles Dickens
  "charles dickens\u0000oliver twist": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Lady of the Lake — Walter Scott
  "walter scott\u0000the lady of the lake": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Dubliners — James Joyce
  "james joyce\u0000dubliners": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1914 },
  // Thuvia, Maid of Mars — Edgar Rice Burroughs
  "edgar rice burroughs\u0000thuvia, maid of mars": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1920, artist: { name: "J. Allen St. John", died: 1957 } },
  // The Origin and Development of the Moral Ideas — Edvard Westermarck
  "edvard westermarck\u0000the origin and development of the moral ideas": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // De Profundis — Oscar Wilde
  "oscar wilde\u0000de profundis": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Insidious Dr. Fu Manchu — Sax Rohmer
  "sax rohmer\u0000the insidious dr. fu manchu": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Waterloo Roll Call — Charles Dalton
  "charles dalton\u0000the waterloo roll call": { verdict: "reject", reason: "producer's composite" },
  // আতঙ্কের উপত্যকা — Arthur Conan Doyle
  "arthur conan doyle\u0000the valley of fear": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Incidents in the Life of a Slave Girl — Harriet Jacobs
  "harriet jacobs\u0000incidents in the life of a slave girl": { verdict: "reject", reason: "producer's own cover design" },
  // A Midsummer Night's Dream — William Shakespeare
  "william shakespeare\u0000a midsummer night's dream": { verdict: "reject", reason: "producer's composite" },
  // Selected Works of Voltairine de Cleyre — Voltairine de Cleyre
  "voltairine de cleyre\u0000selected works of voltairine de cleyre": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1914 },
  // David Copperfield — Charles Dickens
  "charles dickens\u0000david copperfield": { verdict: "reject", reason: "producer's own cover design" },
  // Twelve Years a Slave — Solomon Northup
  "solomon northup\u0000twelve years a slave": { verdict: "reject", reason: "producer's composite" },
  // The Notebooks of Leonardo Da Vinci — Leonardo da Vinci
  "leonardo da vinci\u0000the notebooks of leonardo da vinci": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Robinson Crusoe — Daniel Defoe
  "daniel defoe\u0000robinson crusoe": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Bleak House — Charles Dickens
  "charles dickens\u0000bleak house": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Awakening — Kate Chopin
  "kate chopin\u0000the awakening": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // A Pair of Blue Eyes — Thomas Hardy
  "thomas hardy\u0000a pair of blue eyes": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Satires of Juvenal, Persius, Sulpicia, and Lucilius — Juvenal, Gaius Lucilius, Persius ও Sulpicia
  "juvenal, gaius lucilius, persius ও sulpicia\u0000the satires of juvenal, persius, sulpicia, and lucilius": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1881 },
  // Through the Looking-Glass — Lewis Carroll
  "lewis carroll\u0000through the looking-glass": { verdict: "accept", from: "gutenberg", kind: "binding", artist: { name: "John Tenniel", died: 1914 } },
  // Sonnets from the Portuguese — Elizabeth Barrett Browning
  "elizabeth barrett browning\u0000sonnets from the portuguese": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // His Last Bow — Arthur Conan Doyle
  "arthur conan doyle\u0000his last bow": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1917 },
  // Notes from Underground — Fyodor Dostoevsky
  "fyodor dostoevsky\u0000notes from underground": { verdict: "reject", reason: "producer's composite" },
  // Songs of Innocence and of Experience — William Blake
  "william blake\u0000songs of innocence and of experience": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1794, artist: { name: "William Blake", died: 1827 } },
  // Love and Freindship — Jane Austen
  "jane austen\u0000love and freindship": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Carmilla — Sheridan Le Fanu
  "sheridan le fanu\u0000carmilla": { verdict: "reject", reason: "producer's composite" },
  // Paradise Lost — John Milton
  "john milton\u0000paradise lost": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1667 },
  // The Riddle of the Sands — Erskine Childers
  "erskine childers\u0000the riddle of the sands": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1903 },
  // Metamorphoses — Ovid
  "ovid\u0000metamorphoses": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1893 },
  // Symposium — Plato
  "plato\u0000symposium": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Common Sense — Thomas Paine
  "thomas paine\u0000common sense": { verdict: "reject", reason: "producer's composite" },
  // Cornish Characters and Strange Events — Sabine Baring-Gould
  "sabine baring-gould\u0000cornish characters and strange events": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // As You Like It — William Shakespeare
  "william shakespeare\u0000as you like it": { verdict: "reject", reason: "producer's composite" },
  // The Tale of Peter Rabbit — Beatrix Potter
  "beatrix potter\u0000the tale of peter rabbit": { verdict: "accept", from: "gutenberg", kind: "binding", artist: { name: "Beatrix Potter", died: 1943 } },
  // The Red House Mystery — A. A. Milne
  "a. a. milne\u0000the red house mystery": { verdict: "reject", reason: "jacket art possibly signed; artist not identified" },
  // Persuasion — Jane Austen
  "jane austen\u0000persuasion": { verdict: "reject", reason: "producer's own cover design" },
  // Critique of Pure Reason — Immanuel Kant
  "immanuel kant\u0000critique of pure reason": { verdict: "reject", reason: "producer's composite" },
  // Love's Labour's Lost — William Shakespeare
  "william shakespeare\u0000love's labour's lost": { verdict: "reject", reason: "producer's composite" },
  // Uncle Tom's Cabin — Harriet Beecher Stowe
  "harriet beecher stowe\u0000uncle tom's cabin": { verdict: "reject", reason: "producer's composite" },
  // Essays — Michel de Montaigne
  "michel de montaigne\u0000essays": { verdict: "reject", reason: "a portrait plate, not a cover or title page" },
  // Love-at-arms — Rafael Sabatini
  "rafael sabatini\u0000love-at-arms": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Man Who Did the Right Thing — Harry Johnston
  "harry johnston\u0000the man who did the right thing": { verdict: "reject", reason: "producer's own cover design" },
  // The Honour of Savelli — Sidney Kilner Levett-Yeats
  "sidney kilner levett-yeats\u0000the honour of savelli": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Phantom 'Rickshaw, and Other Ghost Stories — Rudyard Kipling
  "rudyard kipling\u0000the phantom 'rickshaw, and other ghost stories": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // কমিউনিস্ট ইস্তেহার — Karl Marx ও Friedrich Engels
  "karl marx ও friedrich engels\u0000the communist manifesto": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The San Rosario Ranch — Maud Howe Elliott
  "maud howe elliott\u0000the san rosario ranch": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Northanger Abbey — Jane Austen
  "jane austen\u0000northanger abbey": { verdict: "reject", reason: "producer's own cover design" },
  // Memoirs of the Duchesse de Dino (Afterwards Duchesse de Talleyrand Et de Sagan), 1836-1840 — Dorothée Dino
  "dorothée dino\u0000memoirs of the duchesse de dino (afterwards duchesse de talleyrand et de sagan), 1836-1840": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Diary of Samuel Pepys — Samuel Pepys
  "samuel pepys\u0000the diary of samuel pepys": { verdict: "reject", reason: "a portrait plate, not a cover or title page" },
  // Black Beauty — Anna Sewell
  "anna sewell\u0000black beauty": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Hill of Venus — Nathan Gallizier
  "nathan gallizier\u0000the hill of venus": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Love Letters of Mary Wollstonecraft to Gilbert Imlay — Mary Wollstonecraft
  "mary wollstonecraft\u0000the love letters of mary wollstonecraft to gilbert imlay": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Zeppelin's Passenger — E. Phillips Oppenheim
  "e. phillips oppenheim\u0000the zeppelin's passenger": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Grand Babylon Hotel — Arnold Bennett
  "arnold bennett\u0000the grand babylon hotel": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Yellow Crayon — E. Phillips Oppenheim
  "e. phillips oppenheim\u0000the yellow crayon": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // A Little English Gallery — Louise Imogen Guiney
  "louise imogen guiney\u0000a little english gallery": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Children of the Whirlwind — Leroy Scott
  "leroy scott\u0000children of the whirlwind": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Essays — Ralph Waldo Emerson
  "ralph waldo emerson\u0000essays": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Canterbury Tales — Geoffrey Chaucer
  "geoffrey chaucer\u0000the canterbury tales": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Biographia Literaria — Samuel Taylor Coleridge
  "samuel taylor coleridge\u0000biographia literaria": { verdict: "reject", reason: "producer's own cover design" },
  // Under the Witches' Moon — Nathan Gallizier
  "nathan gallizier\u0000under the witches' moon": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Bacon's Essays and Wisdom of the Ancients — Francis Bacon
  "francis bacon\u0000bacon's essays and wisdom of the ancients": { verdict: "accept", from: "gutenberg", kind: "title" },
  // English Eccentrics and Eccentricities — John Timbs
  "john timbs\u0000english eccentrics and eccentricities": { verdict: "reject", reason: "producer's composite" },
  // The Ballad of the White Horse — G. K. Chesterton
  "g. k. chesterton\u0000the ballad of the white horse": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Three Hundred Aesop’s Fables — Aesop
  "aesop\u0000three hundred aesop’s fables": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // A Connecticut Yankee in King Arthur's Court — Mark Twain
  "mark twain\u0000a connecticut yankee in king arthur's court": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Ghost Stories of an Antiquary — M. R. James
  "m. r. james\u0000ghost stories of an antiquary": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Infatuation — Lloyd Osbourne
  "lloyd osbourne\u0000infatuation": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Mrs Dalloway — Virginia Woolf
  "virginia woolf\u0000mrs dalloway": { verdict: "reject", reason: "a 1960s printing (Harcourt, Brace & World), possibly after 1965" },
  // Complete Short Works of George Meredith — George Meredith
  "george meredith\u0000complete short works of george meredith": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Phaedrus — Plato
  "plato\u0000phaedrus": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // A Honeymoon in Space — George Griffith
  "george griffith\u0000a honeymoon in space": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Prince and the Pauper — Mark Twain
  "mark twain\u0000the prince and the pauper": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // White Fang — Jack London
  "jack london\u0000white fang": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1906 },
  // The Black Hawk War Including a Review of Black Hawk's Life — Frank Everett Stevens
  "frank everett stevens\u0000the black hawk war including a review of black hawk's life": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Herman Melville, Mariner and Mystic — Raymond Weaver
  "raymond weaver\u0000herman melville, mariner and mystic": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1921 },
  // Phaedo — Plato
  "plato\u0000phaedo": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Antiquities of the Jews — Josephus
  "josephus\u0000antiquities of the jews": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Tragical History of Doctor Faustus — Christopher Marlowe
  "christopher marlowe\u0000the tragical history of doctor faustus": { verdict: "reject", reason: "producer's composite" },
  // The Journals of Lewis and Clark, 1804-1806 — Meriwether Lewis ও William Clark
  "meriwether lewis ও william clark\u0000the journals of lewis and clark, 1804-1806": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Poetics — Aristotle
  "aristotle\u0000poetics": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Ann Veronica — H. G. Wells
  "h. g. wells\u0000ann veronica": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Nature — Ralph Waldo Emerson
  "ralph waldo emerson\u0000nature": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Hermit Doctor of Gaya — I. A. R. Wylie
  "i. a. r. wylie\u0000the hermit doctor of gaya": { verdict: "reject", reason: "producer's own cover design" },
  // The Memoirs of Admiral Lord Beresford — Charles Beresford
  "charles beresford\u0000the memoirs of admiral lord beresford": { verdict: "reject", reason: "producer's own cover design" },
  // Anarchism and Other Essays — Emma Goldman
  "emma goldman\u0000anarchism and other essays": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Raft — Coningsby Dawson
  "coningsby dawson\u0000the raft": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Landloper — Holman Day
  "holman day\u0000the landloper": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Addie's Husband — Harriette Smythies
  "harriette smythies\u0000addie's husband": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // Aeneid — Virgil
  "virgil\u0000aeneid": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Viper of Milan — Marjorie Bowen
  "marjorie bowen\u0000the viper of milan": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // পেলোপনেশীয় যুদ্ধের ইতিহাস — Thucydides
  "thucydides\u0000history of the peloponnesian war": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The House on the Borderland — William Hope Hodgson
  "william hope hodgson\u0000the house on the borderland": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // A Princess of Mars — Edgar Rice Burroughs
  "edgar rice burroughs\u0000a princess of mars": { verdict: "reject", reason: "jacket art by Frank E. Schoonover (d. 1972)" },
  // Desperate Remedies — Thomas Hardy
  "thomas hardy\u0000desperate remedies": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // A Romance of Billy-Goat Hill — Alice Hegan Rice
  "alice hegan rice\u0000a romance of billy-goat hill": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // India's Love Lyrics — Adela Florence Nicolson
  "adela florence nicolson\u0000india's love lyrics": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Paul Clifford — Edward Bulwer-Lytton
  "edward bulwer-lytton\u0000paul clifford": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Romance of Tristan and Iseult — Joseph Bédier
  "joseph bédier\u0000the romance of tristan and iseult": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Shakespeare's Family — Charlotte Carmichael Stopes
  "charlotte carmichael stopes\u0000shakespeare's family": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Two on a Tower — Thomas Hardy
  "thomas hardy\u0000two on a tower": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Railway Children — Edith Nesbit
  "edith nesbit\u0000the railway children": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Personal Memoirs of U. S. Grant — Ulysses S. Grant
  "ulysses s. grant\u0000personal memoirs of u. s. grant": { verdict: "reject", reason: "no legible title" },
  // Lady Audley's Secret — Mary Elizabeth Braddon
  "mary elizabeth braddon\u0000lady audley's secret": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Anabasis — Xenophon
  "xenophon\u0000anabasis": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Scourge of God — John Bloundelle-Burton
  "john bloundelle-burton\u0000the scourge of god": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Spectator — Joseph Addison ও Richard Steele
  "joseph addison ও richard steele\u0000the spectator": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // All in the Day's Work — Ida Tarbell
  "ida tarbell\u0000all in the day's work": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1939 },
  // The Castle of Otranto — Horace Walpole
  "horace walpole\u0000the castle of otranto": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Utopia — Thomas More
  "thomas more\u0000utopia": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Wind in the Willows — Kenneth Grahame
  "kenneth grahame\u0000the wind in the willows": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1908, artist: { name: "W. Graham Robertson", died: 1948 } },
  // The Will to Believe, and Other Essays in Popular Philosophy — William James
  "william james\u0000the will to believe, and other essays in popular philosophy": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Hamlet — William Shakespeare
  "william shakespeare\u0000hamlet": { verdict: "reject", reason: "producer's composite" },
  // Ethics — Benedictus de Spinoza
  "benedictus de spinoza\u0000ethics": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Fifty Years in Wall Street — Henry Clews
  "henry clews\u0000fifty years in wall street": { verdict: "reject", reason: "producer's own cover design" },
  // The Rover Boys on the Farm — Edward Stratemeyer
  "edward stratemeyer\u0000the rover boys on the farm": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Myths of the Cherokee — James Mooney
  "james mooney\u0000myths of the cherokee": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1902 },
  // The History of Sir Richard Calmady — Lucas Malet
  "lucas malet\u0000the history of sir richard calmady": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Art of Money Getting — P. T. Barnum
  "p. t. barnum\u0000the art of money getting": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Lorna Doone — Richard Doddridge Blackmore
  "richard doddridge blackmore\u0000lorna doone": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // My Bondage and My Freedom — Frederick Douglass
  "frederick douglass\u0000my bondage and my freedom": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Gift of the Magi — O. Henry
  "o. henry\u0000the gift of the magi": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Love Story of Aliette Brunton — Gilbert Frankau
  "gilbert frankau\u0000the love story of aliette brunton": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Pygmalion — George Bernard Shaw
  "george bernard shaw\u0000pygmalion": { verdict: "reject", reason: "producer's own cover design" },
  // A Portrait of the Artist as a Young Man — James Joyce
  "james joyce\u0000a portrait of the artist as a young man": { verdict: "reject", reason: "producer's own cover design" },
  // The Love Letters of Henry VIII to Anne Boleyn — Henry VIII of England
  "henry viii of england\u0000the love letters of henry viii to anne boleyn": { verdict: "reject", reason: "not a cover image" },
  // The Merry Adventures of Robin Hood — Howard Pyle
  "howard pyle\u0000the merry adventures of robin hood": { verdict: "accept", from: "gutenberg", kind: "title", artist: { name: "Howard Pyle", died: 1911 } },
  // Hypnerotomachia Poliphili — Francesco Colonna
  "francesco colonna\u0000hypnerotomachia poliphili": { verdict: "reject", reason: "a woodcut device without the title" },
  // The Reign of Greed — José Rizal
  "josé rizal\u0000the reign of greed": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Green Mouse — Robert W. Chambers
  "robert w. chambers\u0000the green mouse": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Hesiod, the Homeric Hymns, and Homerica — Hesiod
  "hesiod\u0000hesiod, the homeric hymns, and homerica": { verdict: "reject", reason: "producer's composite" },
  // The Red Badge of Courage — Stephen Crane
  "stephen crane\u0000the red badge of courage": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1895 },
  // Jane Seton — James Grant
  "james grant\u0000jane seton": { verdict: "reject", reason: "producer's own cover design" },
  // On the Nature of Things — Lucretius
  "lucretius\u0000on the nature of things": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Happy Prince and Other Tales — Oscar Wilde
  "oscar wilde\u0000the happy prince and other tales": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1888, artist: { name: "Walter Crane", died: 1915 } },
  // Blow The Man Down — Holman Day
  "holman day\u0000blow the man down": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Anatomy of Melancholy — Robert Burton
  "robert burton\u0000the anatomy of melancholy": { verdict: "accept", from: "gutenberg", kind: "title" },
  // The Last of the Mohicans — James Fenimore Cooper
  "james fenimore cooper\u0000the last of the mohicans": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1919, artist: { name: "N. C. Wyeth", died: 1945 } },
  // How We Think — John Dewey
  "john dewey\u0000how we think": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Amazing Marriage — George Meredith
  "george meredith\u0000the amazing marriage": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Discourse on the Method — René Descartes
  "rené descartes\u0000discourse on the method": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Macbeth — William Shakespeare
  "william shakespeare\u0000macbeth": { verdict: "reject", reason: "producer's composite" },
  // Henrietta Temple — Benjamin Disraeli
  "benjamin disraeli\u0000henrietta temple": { verdict: "reject", reason: "no title on the binding" },
  // Kidnapped — Robert Louis Stevenson
  "robert louis stevenson\u0000kidnapped": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1913, artist: { name: "N. C. Wyeth", died: 1945 } },
  // Shakespeare's Sonnets — William Shakespeare
  "william shakespeare\u0000shakespeare's sonnets": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1609 },
  // King Arthur and the Knights of the Round Table — Thomas Malory
  "thomas malory\u0000king arthur and the knights of the round table": { verdict: "reject", reason: "the cover names another author (a retelling by Rupert S. Holland)" },
  // The Pickwick Papers — Charles Dickens
  "charles dickens\u0000the pickwick papers": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // Democracy and Education — John Dewey
  "john dewey\u0000democracy and education": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Tess of the d'Urbervilles — Thomas Hardy
  "thomas hardy\u0000tess of the d'urbervilles": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Utilitarianism — John Stuart Mill
  "john stuart mill\u0000utilitarianism": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Eighty Years and More — Elizabeth Cady Stanton
  "elizabeth cady stanton\u0000eighty years and more": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Poems by Emily Dickinson, Three Series — Emily Dickinson
  "emily dickinson\u0000poems by emily dickinson, three series": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Vanity Fair — William Makepeace Thackeray
  "william makepeace thackeray\u0000vanity fair": { verdict: "reject", reason: "producer's own cover design" },
  // The Mysterious Island — Jules Verne
  "jules verne\u0000the mysterious island": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Moods — Louisa May Alcott
  "louisa may alcott\u0000moods": { verdict: "accept", from: "gutenberg", kind: "title" },
  // The Lost World — Arthur Conan Doyle
  "arthur conan doyle\u0000the lost world": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The First of the English — Archibald Clavering Gunter
  "archibald clavering gunter\u0000the first of the english": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // The Philippines a Century Hence — José Rizal
  "josé rizal\u0000the philippines a century hence": { verdict: "reject", reason: "producer's own cover design" },
  // The Life and Opinions of Tristram Shandy, Gentleman — Laurence Sterne
  "laurence sterne\u0000the life and opinions of tristram shandy, gentleman": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Notre-Dame de Paris — Victor Hugo
  "victor hugo\u0000notre-dame de paris": { verdict: "accept", from: "gutenberg", kind: "title" },
  // An Enquiry Concerning Human Understanding — David Hume
  "david hume\u0000an enquiry concerning human understanding": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Empty House — Algernon Blackwood
  "algernon blackwood\u0000the empty house": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Consolation of Philosophy — Boethius
  "boethius\u0000the consolation of philosophy": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Confessions of an English Opium-Eater — Thomas De Quincey
  "thomas de quincey\u0000confessions of an english opium-eater": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Plutarch's Morals — Plutarch
  "plutarch\u0000plutarch's morals": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Emily Brontë — Agnes Mary Frances Duclaux
  "agnes mary frances duclaux\u0000emily brontë": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Part Borne by the Dutch in the Discovery of Australia 1606-1765 — J. E. Heeres
  "j. e. heeres\u0000the part borne by the dutch in the discovery of australia 1606-1765": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Red Seal — Natalie Sumner Lincoln
  "natalie sumner lincoln\u0000the red seal": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Belle of Bowling Green — Amelia Edith Huddleston Barr
  "amelia edith huddleston barr\u0000the belle of bowling green": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Friday, the Thirteenth — Thomas W. Lawson
  "thomas w. lawson\u0000friday, the thirteenth": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Madame Bovary — Gustave Flaubert
  "gustave flaubert\u0000madame bovary": { verdict: "reject", reason: "producer's own cover design" },
  // Mansfield Park — Jane Austen
  "jane austen\u0000mansfield park": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Monkey's Paw — W. W. Jacobs
  "w. w. jacobs\u0000the monkey's paw": { verdict: "reject", reason: "binding art signed with an unidentified monogram" },
  // Robert Orange — John Oliver Hobbes
  "john oliver hobbes\u0000robert orange": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Declaration of Independence of the United States of America — Thomas Jefferson
  "thomas jefferson\u0000the declaration of independence of the united states of america": { verdict: "reject", reason: "producer's composite" },
  // By Advice of Counsel — Arthur Cheney Train
  "arthur cheney train\u0000by advice of counsel": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Childe Harold's Pilgrimage — Lord Byron
  "lord byron\u0000childe harold's pilgrimage": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Prairie Wife — Arthur Stringer
  "arthur stringer\u0000the prairie wife": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Don Juan — Lord Byron
  "lord byron\u0000don juan": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Czar's Spy — William Le Queux
  "william le queux\u0000the czar's spy": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Faerie Queene — Edmund Spenser
  "edmund spenser\u0000the faerie queene": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Cynthia's Chauffeur — Louis Tracy
  "louis tracy\u0000cynthia's chauffeur": { verdict: "reject", reason: "title barely legible" },
  // A Heart-Song of To-day (Disturbed by Fire from the 'Unruly Member') — Annie G. Savigny
  "annie g. savigny\u0000a heart-song of to-day (disturbed by fire from the 'unruly member')": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Fanny Hill — John Cleland
  "john cleland\u0000fanny hill": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // Gorgias — Plato
  "plato\u0000gorgias": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Nicholas Nickleby — Charles Dickens
  "charles dickens\u0000nicholas nickleby": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1910 },
  // The Silent Barrier — Louis Tracy
  "louis tracy\u0000the silent barrier": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Federalist Papers — Alexander Hamilton, John Jay ও James Madison
  "alexander hamilton, john jay ও james madison\u0000federalist papers": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Three Men in a Boat — Jerome K. Jerome
  "jerome k. jerome\u0000three men in a boat": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Hard Times — Charles Dickens
  "charles dickens\u0000hard times": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Quo Vadis — Henryk Sienkiewicz
  "henryk sienkiewicz\u0000quo vadis": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Works of the Rev. Hugh Binning — Hugh Binning
  "hugh binning\u0000the works of the rev. hugh binning": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Gay Cockade — Temple Bailey
  "temple bailey\u0000the gay cockade": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Car of Destiny — Charles Norris Williamson ও Alice Muriel Williamson
  "charles norris williamson ও alice muriel williamson\u0000the car of destiny": { verdict: "reject", reason: "not a cover (an ornament without the title)" },
  // Bartleby, the Scrivener — Herman Melville
  "herman melville\u0000bartleby, the scrivener": { verdict: "reject", reason: "producer's composite" },
  // The Daughter of Anderson Crow — George Barr McCutcheon
  "george barr mccutcheon\u0000the daughter of anderson crow": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Real Adventure — Henry Kitchell Webster
  "henry kitchell webster\u0000the real adventure": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // How the Other Half Lives — Jacob Riis
  "jacob riis\u0000how the other half lives": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Game of Life — Florence Scovel Shinn
  "florence scovel shinn\u0000the game of life": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Iron Heel — Jack London
  "jack london\u0000the iron heel": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1908 },
  // The Damned Thing — Ambrose Bierce
  "ambrose bierce\u0000the damned thing": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Torrents of Spring — Ivan Turgenev
  "ivan turgenev\u0000the torrents of spring": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Interpretation of Dreams — Sigmund Freud
  "sigmund freud\u0000the interpretation of dreams": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Knights of the Cross — Henryk Sienkiewicz
  "henryk sienkiewicz\u0000the knights of the cross": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Shunned House — H. P. Lovecraft
  "h. p. lovecraft\u0000the shunned house": { verdict: "reject", reason: "a magazine issue's cover, not this work's" },
  // The Gods of Mars — Edgar Rice Burroughs
  "edgar rice burroughs\u0000the gods of mars": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Plays — Susan Glaspell
  "susan glaspell\u0000plays": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Thoughts of Marcus Aurelius Antoninus — Marcus Aurelius
  "marcus aurelius\u0000thoughts of marcus aurelius antoninus": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Dainty's Cruel Rivals — Mrs. Alex. McVeigh Miller
  "mrs. alex. mcveigh miller\u0000dainty's cruel rivals": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // That Girl Montana — Marah Ellis Ryan
  "marah ellis ryan\u0000that girl montana": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Lineage, Life and Labors of José Rizal, Philippine Patriot — Austin Craig
  "austin craig\u0000lineage, life and labors of josé rizal, philippine patriot": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Ancient Britain and the Invasions of Julius Caesar — T. Rice Holmes
  "t. rice holmes\u0000ancient britain and the invasions of julius caesar": { verdict: "reject", reason: "producer's own cover design" },
  // Ethan Frome — Edith Wharton
  "edith wharton\u0000ethan frome": { verdict: "reject", reason: "producer's own cover design" },
  // Torchy and Vee — Sewell Ford
  "sewell ford\u0000torchy and vee": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Decameron — Giovanni Boccaccio
  "giovanni boccaccio\u0000the decameron": { verdict: "accept", from: "gutenberg", kind: "title" },
  // The Fall of the House of Usher — Edgar Allan Poe
  "edgar allan poe\u0000the fall of the house of usher": { verdict: "reject", reason: "producer's composite" },
  // A Little Princess — Frances Hodgson Burnett
  "frances hodgson burnett\u0000a little princess": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Gargantua and Pantagruel — François Rabelais
  "françois rabelais\u0000gargantua and pantagruel": { verdict: "accept", from: "gutenberg", kind: "title" },
  // Rip Van Winkle — Washington Irving
  "washington irving\u0000rip van winkle": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1905, artist: { name: "Arthur Rackham", died: 1939 } },
  // The Crack of Doom — Robert Cromie
  "robert cromie\u0000the crack of doom": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Warlord of Mars — Edgar Rice Burroughs
  "edgar rice burroughs\u0000the warlord of mars": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1919, artist: { name: "J. Allen St. John", died: 1957 } },
  // The Gay Adventure — Richard Bird
  "richard bird\u0000the gay adventure": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Ancient Stone Implements, Weapons and Ornaments, of Great Britain — John Evans
  "john evans\u0000the ancient stone implements, weapons and ornaments, of great britain": { verdict: "reject", reason: "no title on the binding" },
  // The Black Abbot — Edgar Wallace
  "edgar wallace\u0000the black abbot": { verdict: "reject", reason: "producer's own cover design" },
  // Doctor Cupid — Rhoda Broughton
  "rhoda broughton\u0000doctor cupid": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // On the Cross — Wilhelmine von Hillern
  "wilhelmine von hillern\u0000on the cross": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // A System of Logic, Ratiocinative and Inductive — John Stuart Mill
  "john stuart mill\u0000a system of logic, ratiocinative and inductive": { verdict: "reject", reason: "producer's own cover design" },
  // A Vindication of the Rights of Woman — Mary Wollstonecraft
  "mary wollstonecraft\u0000a vindication of the rights of woman": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Roughing It — Mark Twain
  "mark twain\u0000roughing it": { verdict: "reject", reason: "title barely legible" },
  // England Under the Angevin Kings, Volumes I and II — Kate Norgate
  "kate norgate\u0000england under the angevin kings, volumes i and ii": { verdict: "reject", reason: "producer's own cover design" },
  // Fundamental Principles of the Metaphysic of Morals — Immanuel Kant
  "immanuel kant\u0000fundamental principles of the metaphysic of morals": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Varieties of Religious Experience — William James
  "william james\u0000the varieties of religious experience": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1917 },
  // The Antichrist — Friedrich Nietzsche
  "friedrich nietzsche\u0000the antichrist": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1920 },
  // An Occurrence at Owl Creek Bridge — Ambrose Bierce
  "ambrose bierce\u0000an occurrence at owl creek bridge": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Three Millions! — William Taylor Adams
  "william taylor adams\u0000three millions!": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Origin of Species by Means of Natural Selection — Charles Darwin
  "charles darwin\u0000the origin of species by means of natural selection": { verdict: "reject", reason: "producer's own cover design" },
  // Monte-Cristo's Daughter — Edmund Flagg
  "edmund flagg\u0000monte-cristo's daughter": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Helen Vardon's Confession — R. Austin Freeman
  "r. austin freeman\u0000helen vardon's confession": { verdict: "reject", reason: "producer's own cover design" },
  // The Lady with the Dog and Other Stories — Anton Chekhov
  "anton chekhov\u0000the lady with the dog and other stories": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // How to Live on 24 Hours a Day — Arnold Bennett
  "arnold bennett\u0000how to live on 24 hours a day": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Influence of Sea Power Upon History — Alfred Thayer Maan
  "alfred thayer maan\u0000the influence of sea power upon history": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Language of Flowers — Kate Greenaway
  "kate greenaway\u0000language of flowers": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1884, artist: { name: "Kate Greenaway", died: 1901 } },
  // The Vampyre — John William Polidori
  "john william polidori\u0000the vampyre": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // রাজনীতি — Aristotle
  "aristotle\u0000politics": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Passionate Friends — H. G. Wells
  "h. g. wells\u0000the passionate friends": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Economic Aspect of Geology — C. K. Leith
  "c. k. leith\u0000the economic aspect of geology": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Entailed Hat — George Alfred Townsend
  "george alfred townsend\u0000the entailed hat": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Subjection of Women — John Stuart Mill
  "john stuart mill\u0000the subjection of women": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Social Contract & Discourses — Jean-Jacques Rousseau
  "jean-jacques rousseau\u0000the social contract & discourses": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Life of St. Francis of Assisi — Paul Sabatier
  "paul sabatier\u0000life of st. francis of assisi": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Civil Disobedience — Henry David Thoreau
  "henry david thoreau\u0000civil disobedience": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Heather-Moon — Charles Norris Williamson ও Alice Muriel Williamson
  "charles norris williamson ও alice muriel williamson\u0000the heather-moon": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // History of Rome — Titus Livius
  "titus livius\u0000history of rome": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Darkwater — W. E. B. Du Bois
  "w. e. b. du bois\u0000darkwater": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1920 },
  // Euthyphro — Plato
  "plato\u0000euthyphro": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Marriage of Heaven and Hell — William Blake
  "william blake\u0000the marriage of heaven and hell": { verdict: "reject", reason: "producer's own cover design" },
  // Baron Trump's Marvellous Underground Journey — Ingersoll Lockwood
  "ingersoll lockwood\u0000baron trump's marvellous underground journey": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1893, artist: { name: "Charles Howard Johnson", died: 1943 } },
  // Harriet Martineau — Florence Miller
  "florence miller\u0000harriet martineau": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Pilgrim’s Progress — John Buchan
  "john buchan\u0000the pilgrim’s progress": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Land That Time Forgot — Edgar Rice Burroughs
  "edgar rice burroughs\u0000the land that time forgot": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Chessmen of Mars — Edgar Rice Burroughs
  "edgar rice burroughs\u0000the chessmen of mars": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Age of Innocence — Edith Wharton
  "edith wharton\u0000the age of innocence": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // A Treatise of Human Nature — David Hume
  "david hume\u0000a treatise of human nature": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // A Martian Odyssey — Stanley G. Weinbaum
  "stanley g. weinbaum\u0000a martian odyssey": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Boswell's Life of Johnson — James Boswell
  "james boswell\u0000boswell's life of johnson": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Set in Silver — Charles Norris Williamson ও Alice Muriel Williamson
  "charles norris williamson ও alice muriel williamson\u0000set in silver": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Riders to the Sea — John Millington Synge
  "john millington synge\u0000riders to the sea": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Argonauts of the Western Pacific — Bronisław Malinowski
  "bronisław malinowski\u0000argonauts of the western pacific": { verdict: "reject", reason: "producer's own cover design" },
  // A Journey into the Interior of the Earth — Jules Verne
  "jules verne\u0000a journey into the interior of the earth": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Garden Party — Katherine Mansfield
  "katherine mansfield\u0000the garden party": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1922 },
  // Poems and Songs of Robert Burns — Robert Burns
  "robert burns\u0000poems and songs of robert burns": { verdict: "reject", reason: "producer's own cover design" },
  // Analects — Confucius
  "confucius\u0000analects": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The History of Human Marriage — Edvard Westermarck
  "edvard westermarck\u0000the history of human marriage": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // At the Sign of the Cat and Racket — Honoré de Balzac
  "honoré de balzac\u0000at the sign of the cat and racket": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Lost Continent — Edgar Rice Burroughs
  "edgar rice burroughs\u0000the lost continent": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // North and South — Elizabeth Gaskell
  "elizabeth gaskell\u0000north and south": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Wars of the Jews — Josephus
  "josephus\u0000the wars of the jews": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Psychology of the Unconscious — Carl Jung
  "carl jung\u0000psychology of the unconscious": { verdict: "reject", reason: "producer's own cover design" },
  // Just So Stories — Rudyard Kipling
  "rudyard kipling\u0000just so stories": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Red Nails — Robert E. Howard
  "robert e. howard\u0000red nails": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Pragmatism — William James
  "william james\u0000pragmatism": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // A History of the Philippines — David Prescott Barrows
  "david prescott barrows\u0000a history of the philippines": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // A Selection from the Discourses of Epictetus with the Encheiridion — Epictetus
  "epictetus\u0000a selection from the discourses of epictetus with the encheiridion": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Pursuit of God — A. W. Tozer
  "a. w. tozer\u0000the pursuit of god": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Fairy Dreams — Jane G. Austin
  "jane g. austin\u0000fairy dreams": { verdict: "accept", from: "gutenberg", kind: "title" },
  // Extraordinary Popular Delusions and the Madness of Crowds — Charles Mackay
  "charles mackay\u0000extraordinary popular delusions and the madness of crowds": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Devil's Dictionary — Ambrose Bierce
  "ambrose bierce\u0000the devil's dictionary": { verdict: "reject", reason: "producer's composite" },
  // The Innocents Abroad — Mark Twain
  "mark twain\u0000the innocents abroad": { verdict: "reject", reason: "photo of a worn copy; title not legible" },
  // The Autobiography of Benjamin Franklin — Benjamin Franklin
  "benjamin franklin\u0000the autobiography of benjamin franklin": { verdict: "reject", reason: "producer's own cover design" },
  // Satyricon — Petronius
  "petronius\u0000satyricon": { verdict: "reject", reason: "photo of two spines, not a cover" },
  // Mosses from an Old Manse — Nathaniel Hawthorne
  "nathaniel hawthorne\u0000mosses from an old manse": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Roman Stoicism — Edward Vernon Arnold
  "edward vernon arnold\u0000roman stoicism": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1911 },
  // Hero-Myths & Legends of the British Race — M. I. Ebbutt
  "m. i. ebbutt\u0000hero-myths & legends of the british race": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Reflections — François de La Rochefoucauld
  "françois de la rochefoucauld\u0000reflections": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Tarrano the Conqueror — Ray Cummings
  "ray cummings\u0000tarrano the conqueror": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1930 },
  // The Essays of Arthur Schopenhauer — Arthur Schopenhauer
  "arthur schopenhauer\u0000the essays of arthur schopenhauer": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Younger Edda — Snorri Sturluson
  "snorri sturluson\u0000the younger edda": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Scarlet Pimpernel — Emma Orczy
  "emma orczy\u0000the scarlet pimpernel": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Bradford's History of 'Plimoth Plantation' — William Bradford
  "william bradford\u0000bradford's history of 'plimoth plantation'": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Canterville Ghost — Oscar Wilde
  "oscar wilde\u0000the canterville ghost": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // History of Lace — Fanny Bury Palliser
  "fanny bury palliser\u0000history of lace": { verdict: "accept", from: "gutenberg", kind: "title" },
  // The History of Mary Prince — Mary Prince
  "mary prince\u0000the history of mary prince": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Revelations of Divine Love — Julian of Norwich
  "julian of norwich\u0000revelations of divine love": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1901 },
  // Plays of Sophocles — Sophocles
  "sophocles\u0000plays of sophocles": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Kybalion — Three Initiates
  "three initiates\u0000the kybalion": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Masque of the Red Death — Edgar Allan Poe
  "edgar allan poe\u0000the masque of the red death": { verdict: "reject", reason: "producer's composite" },
  // The Social Cancer — José Rizal
  "josé rizal\u0000the social cancer": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Small House at Allington — Anthony Trollope
  "anthony trollope\u0000the small house at allington": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // A Victor of Salamis — William Stearns Davis
  "william stearns davis\u0000a victor of salamis": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Fox's Book of Martyrs — John Foxe
  "john foxe\u0000fox's book of martyrs": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // My Own Story — Emmeline Pankhurst
  "emmeline pankhurst\u0000my own story": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Complete Prose Works — Walt Whitman
  "walt whitman\u0000complete prose works": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Out of Time's Abyss — Edgar Rice Burroughs
  "edgar rice burroughs\u0000out of time's abyss": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Jesus the Christ — James E. Talmage
  "james e. talmage\u0000jesus the christ": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Love and Life — Charlotte Mary Yonge
  "charlotte mary yonge\u0000love and life": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The World Below — S. Fowler Wright
  "s. fowler wright\u0000the world below": { verdict: "reject", reason: "producer's own cover design" },
  // Cicero's Tusculan Disputations — Cicero
  "cicero\u0000cicero's tusculan disputations": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Blue-grass and Broadway — Maria Thompson Daviess
  "maria thompson daviess\u0000blue-grass and broadway": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Pharmacographia — Friedrich August Flückiger ও Daniel Hanbury
  "friedrich august flückiger ও daniel hanbury\u0000pharmacographia": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1879 },
  // Anne of Avonlea — Lucy Maud Montgomery
  "lucy maud montgomery\u0000anne of avonlea": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1909 },
  // Swann's Way — Marcel Proust
  "marcel proust\u0000swann's way": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Triplanetary — Edward Elmer Smith
  "edward elmer smith\u0000triplanetary": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Ivanhoe — Walter Scott
  "walter scott\u0000ivanhoe": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Blue Fairy Book — Andrew Lang
  "andrew lang\u0000the blue fairy book": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1889, artist: { name: "H. J. Ford", died: 1941 } },
  // The Complete Poetic and Dramatic Works of Robert Browning — Robert Browning
  "robert browning\u0000the complete poetic and dramatic works of robert browning": { verdict: "reject", reason: "a portrait plate, not a cover or title page" },
  // The Imitation of Christ — Thomas à Kempis
  "thomas à kempis\u0000the imitation of christ": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Tales of Terror — J. E. Preston Muddock
  "j. e. preston muddock\u0000tales of terror": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // The Nowadays Girls in the Adirondacks — Gertrude Hall Brownell
  "gertrude hall brownell\u0000the nowadays girls in the adirondacks": { verdict: "accept", from: "gutenberg", kind: "title" },
  // They Return at Evening — H. Russell Wakefield
  "h. russell wakefield\u0000they return at evening": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1928 },
  // Cruel as the Grave — E. D. E. N. Southworth
  "e. d. e. n. southworth\u0000cruel as the grave": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Hedda Gabler — Henrik Ibsen
  "henrik ibsen\u0000hedda gabler": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Theory of the Leisure Class — Thorstein Veblen
  "thorstein veblen\u0000the theory of the leisure class": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Hunniwell Boys and the Platinum Mystery — L. P. Wyman
  "l. p. wyman\u0000the hunniwell boys and the platinum mystery": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // Thelma — Marie Corelli
  "marie corelli\u0000thelma": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Memoirs of the Author of A Vindication of the Rights of Woman — William Godwin
  "william godwin\u0000memoirs of the author of a vindication of the rights of woman": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Duchess of Malfi — John Webster
  "john webster\u0000the duchess of malfi": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Tomb of Ts'in — Edgar Wallace
  "edgar wallace\u0000the tomb of ts'in": { verdict: "reject", reason: "producer's composite" },
  // Cursed Be the Treasure — H. B. Drake
  "h. b. drake\u0000cursed be the treasure": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1928 },
  // The Blue Scarab — R. Austin Freeman
  "r. austin freeman\u0000the blue scarab": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // The Valley of Eyes Unseen — Gilbert Collins
  "gilbert collins\u0000the valley of eyes unseen": { verdict: "accept", from: "gutenberg", kind: "title" },
  // The Journal of Sir Walter Scott — Walter Scott
  "walter scott\u0000the journal of sir walter scott": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Flatland — Edwin Abbott Abbott
  "edwin abbott abbott\u0000flatland": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Complete Works of Robert Burns — Robert Burns ও Allan Cunningham
  "robert burns ও allan cunningham\u0000the complete works of robert burns": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Tapestry Book — Helen Churchill Candee
  "helen churchill candee\u0000the tapestry book": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Principles of Scientific Management — Frederick Winslow Taylor
  "frederick winslow taylor\u0000the principles of scientific management": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Grand Inquisitor — Fyodor Dostoevsky
  "fyodor dostoevsky\u0000the grand inquisitor": { verdict: "reject", reason: "producer's composite" },
  // Human, All Too Human — Friedrich Nietzsche
  "friedrich nietzsche\u0000human, all too human": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Famous Sea Fights, from Salamis to Tsu-Shima — A. Hilliard Atteridge
  "a. hilliard atteridge\u0000famous sea fights, from salamis to tsu-shima": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Magic of Jewels and Charms — George Frederick Kunz
  "george frederick kunz\u0000the magic of jewels and charms": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Mystery of Angelina Frood — R. Austin Freeman
  "r. austin freeman\u0000the mystery of angelina frood": { verdict: "reject", reason: "producer's own cover design" },
  // The Velveteen Rabbit — Margery Williams
  "margery williams\u0000the velveteen rabbit": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Hour of the Dragon — Robert E. Howard
  "robert e. howard\u0000the hour of the dragon": { verdict: "reject", reason: "a magazine issue's cover, not this work's" },
  // Peter and Wendy — J. M. Barrie
  "j. m. barrie\u0000peter and wendy": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1911 },
  // Southern Horrors — Ida B. Wells
  "ida b. wells\u0000southern horrors": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1892 },
  // The Trail of the Serpent — Mary Elizabeth Braddon
  "mary elizabeth braddon\u0000the trail of the serpent": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Sun Also Rises — Ernest Hemingway
  "ernest hemingway\u0000the sun also rises": { verdict: "reject", reason: "binding of a later edition, year unknown" },
  // The Cardinal's Snuff-box — Henry Harland
  "henry harland\u0000the cardinal's snuff-box": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Adventures of Heine — Edgar Wallace
  "edgar wallace\u0000the adventures of heine": { verdict: "reject", reason: "producer's own cover design" },
  // Essays — Francis Bacon
  "francis bacon\u0000essays": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Amazing Adventures of Letitia Carberry — Mary Roberts Rinehart
  "mary roberts rinehart\u0000the amazing adventures of letitia carberry": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Crimson Circle — Edgar Wallace
  "edgar wallace\u0000the crimson circle": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1922 },
  // Malay Magic — Walter William Skeat
  "walter william skeat\u0000malay magic": { verdict: "reject", reason: "producer's composite" },
  // Anne of the Island — Lucy Maud Montgomery
  "lucy maud montgomery\u0000anne of the island": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Crown of Wild Olive — John Ruskin
  "john ruskin\u0000the crown of wild olive": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Limanora — John Macmillan Brown
  "john macmillan brown\u0000limanora": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Terror Keep — Edgar Wallace
  "edgar wallace\u0000terror keep": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1927 },
  // The New English Canaan of Thomas Morton with Introductory Matter and Notes — Thomas Morton
  "thomas morton\u0000the new english canaan of thomas morton with introductory matter and notes": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1637 },
  // Talks To Teachers On Psychology — William James
  "william james\u0000talks to teachers on psychology": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Karl Grier — Louis Tracy
  "louis tracy\u0000karl grier": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Strange Countess — Edgar Wallace
  "edgar wallace\u0000the strange countess": { verdict: "reject", reason: "jacket art signed by an unidentified artist" },
  // Red Aces — Edgar Wallace
  "edgar wallace\u0000red aces": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1929 },
  // The New Terror — Gaston Leroux
  "gaston leroux\u0000the new terror": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Slighted Love — Mrs. Alex. McVeigh Miller
  "mrs. alex. mcveigh miller\u0000slighted love": { verdict: "accept", from: "gutenberg", kind: "title" },
  // A Child's Garden of Verses — Robert Louis Stevenson
  "robert louis stevenson\u0000a child's garden of verses": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1905, artist: { name: "Jessie Willcox Smith", died: 1935 } },
  // Medea — Euripides
  "euripides\u0000medea": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Curious Facts in the History of Insects — Frank Cowan
  "frank cowan\u0000curious facts in the history of insects": { verdict: "accept", from: "gutenberg", kind: "title" },
  // The Book of the Courtier — Baldassarre Castiglione
  "baldassarre castiglione\u0000the book of the courtier": { verdict: "reject", reason: "producer's composite" },
  // The Works of Edgar Allan Poe, The Raven Edition — Edgar Allan Poe
  "edgar allan poe\u0000the works of edgar allan poe, the raven edition": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Kant's Critique of Judgement — Immanuel Kant
  "immanuel kant\u0000kant's critique of judgement": { verdict: "reject", reason: "producer's own cover design" },
  // The Dryad — Justin Huntly McCarthy
  "justin huntly mccarthy\u0000the dryad": { verdict: "accept", from: "gutenberg", kind: "title" },
  // Snow-blind — Albert M. Treynor
  "albert m. treynor\u0000snow-blind": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Kate Plus 10 — Edgar Wallace
  "edgar wallace\u0000kate plus 10": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1919 },
  // Room 13 — Edgar Wallace
  "edgar wallace\u0000room 13": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1924 },
  // The Lilac Sunbonnet — Samuel Rutherford Crockett
  "samuel rutherford crockett\u0000the lilac sunbonnet": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Marigold — Edith Allonby
  "edith allonby\u0000marigold": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Corbin Necklace — Henry Kitchell Webster
  "henry kitchell webster\u0000the corbin necklace": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Great Britain and the American Civil War — Ephraim Douglass Adams
  "ephraim douglass adams\u0000great britain and the american civil war": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Joyous Adventures of Aristide Pujol — William John Locke
  "william john locke\u0000the joyous adventures of aristide pujol": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Four Square Jane — Edgar Wallace
  "edgar wallace\u0000four square jane": { verdict: "reject", reason: "jacket art signed by an unidentified artist" },
  // The Suppression of the African Slave-trade to the United States of America — W. E. B. Du Bois
  "w. e. b. du bois\u0000the suppression of the african slave-trade to the united states of america": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Red Record — Ida B. Wells
  "ida b. wells\u0000the red record": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Outline of History — H. G. Wells
  "h. g. wells\u0000the outline of history": { verdict: "reject", reason: "producer's composite" },
  // The First Voyage Round the World, by Magellan — Antonio Pigafetta
  "antonio pigafetta\u0000the first voyage round the world, by magellan": { verdict: "reject", reason: "a portrait plate, not a cover or title page" },
  // Beasts and Super-Beasts — Saki
  "saki\u0000beasts and super-beasts": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Much Ado About Nothing — William Shakespeare
  "william shakespeare\u0000much ado about nothing": { verdict: "reject", reason: "producer's composite" },
  // Wanted—? — Eugene Cunningham
  "eugene cunningham\u0000wanted—?": { verdict: "reject", reason: "a magazine issue's cover, not this work's" },
  // My Life and Work — Henry Ford ও Samuel Crowther
  "henry ford ও samuel crowther\u0000my life and work": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Vision of Desire — Margaret Pedler
  "margaret pedler\u0000the vision of desire": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Four Million — O. Henry
  "o. henry\u0000the four million": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // An Old Man's Love — Anthony Trollope
  "anthony trollope\u0000an old man's love": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Sergeant Dick of the Royal Mounted Police — John G. Rowe
  "john g. rowe\u0000sergeant dick of the royal mounted police": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // A Silent Witness — R. Austin Freeman
  "r. austin freeman\u0000a silent witness": { verdict: "reject", reason: "jacket of an undated reprint" },
  // A Terrible Temptation — Charles Reade
  "charles reade\u0000a terrible temptation": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Girl from Scotland Yard — Edgar Wallace
  "edgar wallace\u0000the girl from scotland yard": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1926 },
  // The People of the Black Circle — Robert E. Howard
  "robert e. howard\u0000the people of the black circle": { verdict: "reject", reason: "a magazine issue's cover, not this work's" },
  // Meno — Plato
  "plato\u0000meno": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Opticks, or a Treatise of the Reflections, Refractions, Inflections and Colours of Light — Isaac Newton
  "isaac newton\u0000opticks, or a treatise of the reflections, refractions, inflections and colours of light": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Plays by Anton Chekhov, Second Series — Anton Chekhov
  "anton chekhov\u0000plays by anton chekhov, second series": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The House of Mirth — Edith Wharton
  "edith wharton\u0000the house of mirth": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Society as I Have Found It — Ward McAllister
  "ward mcallister\u0000society as i have found it": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Theaetetus — Plato
  "plato\u0000theaetetus": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Magic Casket — R. Austin Freeman
  "r. austin freeman\u0000the magic casket": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1927 },
  // One Wonderful Night — Louis Tracy
  "louis tracy\u0000one wonderful night": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The First Six Books of the Elements of Euclid — Euclid ও John Casey
  "euclid ও john casey\u0000the first six books of the elements of euclid": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1885 },
  // The Seventh Shot — Herman Landon
  "herman landon\u0000the seventh shot": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Silas Marner — George Eliot
  "george eliot\u0000silas marner": { verdict: "accept", from: "gutenberg", kind: "binding", artist: { name: "Hugh Thomson", died: 1920 } },
  // Demonology and Devil-lore — Moncure Daniel Conway
  "moncure daniel conway\u0000demonology and devil-lore": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1879 },
  // Poems, with The Ballad of Reading Gaol — Oscar Wilde
  "oscar wilde\u0000poems, with the ballad of reading gaol": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Possessed — Fyodor Dostoevsky
  "fyodor dostoevsky\u0000the possessed": { verdict: "reject", reason: "producer's composite" },
  // Household Tales by Brothers Grimm — Jacob Grimm ও Wilhelm Grimm
  "jacob grimm ও wilhelm grimm\u0000household tales by brothers grimm": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Sociable Ghost — Olive Harper
  "olive harper\u0000the sociable ghost": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Myths of Babylonia and Assyria — Donald Alexander Mackenzie
  "donald alexander mackenzie\u0000myths of babylonia and assyria": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Our Mutual Friend — Charles Dickens
  "charles dickens\u0000our mutual friend": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Maugis, Ye Sorcerer — Gilhooley
  "gilhooley\u0000maugis, ye sorcerer": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Corsair — William Brough
  "william brough\u0000the corsair": { verdict: "accept", from: "gutenberg", kind: "title" },
  // Shadows in Zamboula — Robert E. Howard
  "robert e. howard\u0000shadows in zamboula": { verdict: "reject", reason: "a magazine issue's cover, not this work's" },
  // Only a Clod — Mary Elizabeth Braddon
  "mary elizabeth braddon\u0000only a clod": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Two Magics — Henry James
  "henry james\u0000the two magics": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1898 },
  // The Sign of the Seven Sins — William Le Queux
  "william le queux\u0000the sign of the seven sins": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Ghost of Charlotte Cray, and Other Stories — Florence Marryat
  "florence marryat\u0000the ghost of charlotte cray, and other stories": { verdict: "reject", reason: "producer's own cover design" },
  // Vegetable Teratology — Maxwell Tylden Masters
  "maxwell tylden masters\u0000vegetable teratology": { verdict: "reject", reason: "a portrait, not a cover or title page" },
  // Following the Equator — Mark Twain
  "mark twain\u0000following the equator": { verdict: "reject", reason: "no legible title" },
  // Shadows in the Moonlight — Robert E. Howard
  "robert e. howard\u0000shadows in the moonlight": { verdict: "reject", reason: "a magazine issue's cover, not this work's" },
  // The Poems of Felicia Hemans — Felicia Hemans
  "felicia hemans\u0000the poems of felicia hemans": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1875 },
  // The Arctic Legions — A. De Herries Smith
  "a. de herries smith\u0000the arctic legions": { verdict: "reject", reason: "a magazine issue's cover, not this work's" },
  // The Spirit-rapper — Orestes Brownson
  "orestes brownson\u0000the spirit-rapper": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1854 },
  // The Gilded Age — Mark Twain ও Charles Dudley Warner
  "mark twain ও charles dudley warner\u0000the gilded age": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1873 },
  // False Face — Ernest Haycox
  "ernest haycox\u0000false face": { verdict: "reject", reason: "a magazine issue's cover, not this work's" },
  // The Book of Tea — Okakura Kakuzō
  "okakura kakuzō\u0000the book of tea": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Strange Transfiguration of Hannah Stubbs — Florence Marryat
  "florence marryat\u0000the strange transfiguration of hannah stubbs": { verdict: "reject", reason: "producer's own cover design" },
  // The Underground Railroad from Slavery to Freedom — Wilbur Henry Siebert
  "wilbur henry siebert\u0000the underground railroad from slavery to freedom": { verdict: "reject", reason: "producer's composite" },
  // The Tale of Benjamin Bunny — Beatrix Potter
  "beatrix potter\u0000the tale of benjamin bunny": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Herland — Charlotte Perkins Gilman
  "charlotte perkins gilman\u0000herland": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // What Is Art? — Leo Tolstoy
  "leo tolstoy\u0000what is art?": { verdict: "reject", reason: "producer's own cover design" },
  // Poetical Works of Matthew Arnold — Matthew Arnold
  "matthew arnold\u0000poetical works of matthew arnold": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Comedies of Terence — Terence
  "terence\u0000the comedies of terence": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1887 },
  // Poems by William Cullen Bryant — William Cullen Bryant
  "william cullen bryant\u0000poems by william cullen bryant": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Lillian's Vow — Emma Augusta Sharkey
  "emma augusta sharkey\u0000lillian's vow": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // The Descent of Man, and Selection in Relation to Sex — Charles Darwin
  "charles darwin\u0000the descent of man, and selection in relation to sex": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Memoirs of Jacques Casanova de Seingalt, 1725-1798. — Giacomo Casanova
  "giacomo casanova\u0000the memoirs of jacques casanova de seingalt, 1725-1798.": { verdict: "reject", reason: "jacket art signed by an unidentified artist" },
  // The House of the Wolfings — William Morris
  "william morris\u0000the house of the wolfings": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Bambi — Marjorie Benton Cooke
  "marjorie benton cooke\u0000bambi": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Voyage of the Beagle — Charles Darwin
  "charles darwin\u0000the voyage of the beagle": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Pollyanna — Eleanor H. Porter
  "eleanor h. porter\u0000pollyanna": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Scenes in the Life of Harriet Tubman — Sarah Bradford
  "sarah bradford\u0000scenes in the life of harriet tubman": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1869 },
  // Life Without and Life Within — Margaret Fuller
  "margaret fuller\u0000life without and life within": { verdict: "reject", reason: "no legible title" },
  // Lady Windermere's Fan — Oscar Wilde
  "oscar wilde\u0000lady windermere's fan": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Blue Eyes and Diamonds — Lemuel de Bra
  "lemuel de bra\u0000blue eyes and diamonds": { verdict: "reject", reason: "a magazine issue's cover, not this work's" },
  // The Place of Honeymoons — Harold MacGrath
  "harold macgrath\u0000the place of honeymoons": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Golden Bough — James George Frazer
  "james george frazer\u0000the golden bough": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Tarzan of the Apes — Edgar Rice Burroughs
  "edgar rice burroughs\u0000tarzan of the apes": { verdict: "reject", reason: "jacket art attributed to Fred J. Arting, whose death year isn't established" },
  // The Handbook to English Heraldry — Charles Boutell
  "charles boutell\u0000the handbook to english heraldry": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Julius Caesar — William Shakespeare
  "william shakespeare\u0000julius caesar": { verdict: "reject", reason: "producer's composite" },
  // Book of the Sword — Richard Francis Burton
  "richard francis burton\u0000book of the sword": { verdict: "reject", reason: "the title is on the spine only, not legible" },
  // A General Introduction to Psychoanalysis — Sigmund Freud
  "sigmund freud\u0000a general introduction to psychoanalysis": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // সলোমনের গুপ্তধন — H. Rider Haggard
  "h. rider haggard\u0000king solomon's mines": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1885 },
  // Lady Chatterley's Lover — D. H. Lawrence
  "d. h. lawrence\u0000lady chatterley's lover": { verdict: "reject", reason: "producer's own cover design" },
  // Discourses on the First Decade of Titus Livius — Niccolò Machiavelli
  "niccolò machiavelli\u0000discourses on the first decade of titus livius": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // 'Firebrand' Trevison — Charles Alden Seltzer
  "charles alden seltzer\u0000'firebrand' trevison": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // On The Principles of Political Economy, and Taxation — David Ricardo
  "david ricardo\u0000on the principles of political economy, and taxation": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Daisy Miller — Henry James
  "henry james\u0000daisy miller": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Spoon River Anthology — Edgar Lee Masters
  "edgar lee masters\u0000spoon river anthology": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1915 },
  // The Shellback's Progress — Walter Runciman, 1st Baron Runciman
  "walter runciman, 1st baron runciman\u0000the shellback's progress": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Argonautica — Apollonius of Rhodes
  "apollonius of rhodes\u0000argonautica": { verdict: "reject", reason: "producer's composite" },
  // Considerations on Representative Government — John Stuart Mill
  "john stuart mill\u0000considerations on representative government": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Principles of Political Economy — John Stuart Mill
  "john stuart mill\u0000principles of political economy": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Alice, or the Mysteries — Edward Bulwer-Lytton
  "edward bulwer-lytton\u0000alice, or the mysteries": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Old Curiosity Shop — Charles Dickens
  "charles dickens\u0000the old curiosity shop": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Hawk of Egypt — Joan Conquest
  "joan conquest\u0000the hawk of egypt": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Far from the Madding Crowd — Thomas Hardy
  "thomas hardy\u0000far from the madding crowd": { verdict: "reject", reason: "producer's composite" },
  // A Love Story — William Harvey Christie
  "william harvey christie\u0000a love story": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Agamemnon of Aeschylus — Aeschylus
  "aeschylus\u0000the agamemnon of aeschylus": { verdict: "reject", reason: "producer's composite" },
  // Laws — Plato
  "plato\u0000laws": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Works of William Cowper — William Cowper
  "william cowper\u0000the works of william cowper": { verdict: "reject", reason: "producer's own cover design" },
  // Kwaidan — Lafcadio Hearn
  "lafcadio hearn\u0000kwaidan": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // On Growth and Form — D'Arcy Wentworth Thompson
  "d'arcy wentworth thompson\u0000on growth and form": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1917 },
  // কথাসরিৎসাগর — Somadeva
  "somadeva\u0000kathasaritsagara": { verdict: "reject", reason: "producer's own cover design" },
  // The Wife, and Other Stories — Anton Chekhov
  "anton chekhov\u0000the wife, and other stories": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Timaeus — Plato
  "plato\u0000timaeus": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The House of the Seven Gables — Nathaniel Hawthorne
  "nathaniel hawthorne\u0000the house of the seven gables": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // What Men Live By, and Other Tales — Leo Tolstoy
  "leo tolstoy\u0000what men live by, and other tales": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // History of the Inductive Sciences, from the Earliest to the Present Time — William Whewell
  "william whewell\u0000history of the inductive sciences, from the earliest to the present time": { verdict: "accept", from: "gutenberg", kind: "title" },
  // Erewhon — Samuel Butler
  "samuel butler\u0000erewhon": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // An Enemy of the People — Henrik Ibsen
  "henrik ibsen\u0000an enemy of the people": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Medals of Creation, Volumes 1 and 2 — Gideon Mantell
  "gideon mantell\u0000the medals of creation, volumes 1 and 2": { verdict: "reject", reason: "no title on the binding" },
  // Domesday Book and Beyond — Frederic William Maitland
  "frederic william maitland\u0000domesday book and beyond": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1897 },
  // The Tenant of Wildfell Hall — Anne Brontë
  "anne brontë\u0000the tenant of wildfell hall": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // History of the Reign of Philip the Second, King of Spain, Vols. 1 and 2 — William Hickling Prescott
  "william hickling prescott\u0000history of the reign of philip the second, king of spain, vols. 1 and 2": { verdict: "reject", reason: "a spine, not a cover" },
  // Ancient States and Empires — John Lord
  "john lord\u0000ancient states and empires": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Fifty Years In The Northwest — William H. C. Folsom
  "william h. c. folsom\u0000fifty years in the northwest": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Orthodoxy — G. K. Chesterton
  "g. k. chesterton\u0000orthodoxy": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Haunted Bookshop — Christopher Morley
  "christopher morley\u0000the haunted bookshop": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Daemonologie — James VI and I
  "james vi and i\u0000daemonologie": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // A Tramp Abroad — Mark Twain
  "mark twain\u0000a tramp abroad": { verdict: "reject", reason: "title not legible" },
  // Lyrical Ballads — William Wordsworth ও Samuel Taylor Coleridge
  "william wordsworth ও samuel taylor coleridge\u0000lyrical ballads": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Princess and the Goblin — George MacDonald
  "george macdonald\u0000the princess and the goblin": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Arabian Nights Entertainments — Andrew Lang
  "andrew lang\u0000the arabian nights entertainments": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Mystery of a Turkish Bath — Eliza Humphreys
  "eliza humphreys\u0000the mystery of a turkish bath": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // History of Gujarát — James Campbell
  "james campbell\u0000history of gujarát": { verdict: "reject", reason: "producer's own cover design" },
  // The Story of Paris — Thomas Okey
  "thomas okey\u0000the story of paris": { verdict: "reject", reason: "title not legible" },
  // Apology, Crito, and Phaedo of Socrates — Plato
  "plato\u0000apology, crito, and phaedo of socrates": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Italian Popular Tales — Thomas Frederick Crane
  "thomas frederick crane\u0000italian popular tales": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // My Ántonia — Willa Cather
  "willa cather\u0000my ántonia": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Tale of Squirrel Nutkin — Beatrix Potter
  "beatrix potter\u0000the tale of squirrel nutkin": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The History of Signboards, from the Earliest Times to the Present Day — Herman Diederik Joan van Schevichaven ও John Camden Hotten
  "herman diederik joan van schevichaven ও john camden hotten\u0000the history of signboards, from the earliest times to the present day": { verdict: "reject", reason: "producer's own cover design" },
  // A Little Girl of Long Ago — Amanda Minnie Douglas
  "amanda minnie douglas\u0000a little girl of long ago": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // Critique of Practical Reason — Immanuel Kant
  "immanuel kant\u0000critique of practical reason": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Theory of Colours — Johann Wolfgang von Goethe
  "johann wolfgang von goethe\u0000theory of colours": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1840 },
  // Thought-Forms — Annie Besant ও Charles Webster Leadbeater
  "annie besant ও charles webster leadbeater\u0000thought-forms": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Indolence of the Filipino — José Rizal
  "josé rizal\u0000the indolence of the filipino": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Wanderfoot (The Dream Ship) — Cynthia Stockley
  "cynthia stockley\u0000wanderfoot (the dream ship)": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // De Re Metallica — Georg Agricola
  "georg agricola\u0000de re metallica": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Critical and Historical Essays — Edward MacDowell
  "edward macdowell\u0000critical and historical essays": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Madame Flirt — Charles Edward Pearce
  "charles edward pearce\u0000madame flirt": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Twelfth Night — William Shakespeare
  "william shakespeare\u0000twelfth night": { verdict: "reject", reason: "producer's composite" },
  // Account of Egypt — Herodotus
  "herodotus\u0000account of egypt": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Some Principles of Maritime Strategy — Julian Corbett
  "julian corbett\u0000some principles of maritime strategy": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Monday or Tuesday — Virginia Woolf
  "virginia woolf\u0000monday or tuesday": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Pudd'nhead Wilson — Mark Twain
  "mark twain\u0000pudd'nhead wilson": { verdict: "reject", reason: "producer's composite" },
  // Priscilla's Spies — George A. Birmingham
  "george a. birmingham\u0000priscilla's spies": { verdict: "accept", from: "gutenberg", kind: "title" },
  // Walking — Henry David Thoreau
  "henry david thoreau\u0000walking": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Grace, Actual and Habitual — Joseph Pohle
  "joseph pohle\u0000grace, actual and habitual": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // A Journal to Stella — Jonathan Swift
  "jonathan swift\u0000a journal to stella": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Sally of Missouri — Rose E. Young
  "rose e. young\u0000sally of missouri": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Complete Poetical Works of Henry Wadsworth Longfellow — Henry Wadsworth Longfellow
  "henry wadsworth longfellow\u0000the complete poetical works of henry wadsworth longfellow": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Sketches New and Old — Mark Twain
  "mark twain\u0000sketches new and old": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Sound and the Fury — William Faulkner
  "william faulkner\u0000the sound and the fury": { verdict: "reject", reason: "jacket art by Arthur Hawkins Jr. (d. 1985)" },
  // The Merchant of Venice — William Shakespeare
  "william shakespeare\u0000the merchant of venice": { verdict: "reject", reason: "producer's composite" },
  // Japanese Fairy Tales — Yei Theodora Ozaki
  "yei theodora ozaki\u0000japanese fairy tales": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Governments of Europe — Frederic Austin Ogg
  "frederic austin ogg\u0000the governments of europe": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Three Contributions to the Theory of Sex — Sigmund Freud
  "sigmund freud\u0000three contributions to the theory of sex": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Fifth Queen — Ford Madox Ford
  "ford madox ford\u0000the fifth queen": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Children's Literature — Charles Madison Curry ও Erle Elsworth Clippinger
  "charles madison curry ও erle elsworth clippinger\u0000children's literature": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Stonewall Jackson and the American Civil War — George Francis Robert Henderson
  "george francis robert henderson\u0000stonewall jackson and the american civil war": { verdict: "reject", reason: "a portrait plate, not a cover or title page" },
  // Devotions Upon Emergent Occasions — John Donne
  "john donne\u0000devotions upon emergent occasions": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Minor Dialogues, Together With the Dialogue on Clemency — Seneca
  "seneca\u0000minor dialogues, together with the dialogue on clemency": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Advancement of Learning — Francis Bacon
  "francis bacon\u0000the advancement of learning": { verdict: "reject", reason: "producer's own cover design" },
  // The Wonders of the Invisible World — Cotton Mather ও Increase Mather
  "cotton mather ও increase mather\u0000the wonders of the invisible world": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Little Dorrit — Charles Dickens
  "charles dickens\u0000little dorrit": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1857, artist: { name: "Hablot Knight Browne", died: 1882 } },
  // My Friend the Chauffeur — Charles Norris Williamson ও Alice Muriel Williamson
  "charles norris williamson ও alice muriel williamson\u0000my friend the chauffeur": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Willows — Algernon Blackwood
  "algernon blackwood\u0000the willows": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // New Atlantis — Francis Bacon
  "francis bacon\u0000new atlantis": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Essays of Schopenhauer — Arthur Schopenhauer
  "arthur schopenhauer\u0000essays of schopenhauer": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Shakespearean Tragedy — A. C. Bradley
  "a. c. bradley\u0000shakespearean tragedy": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Myths and Legends of China — E. T. C. Werner
  "e. t. c. werner\u0000myths and legends of china": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Variation of Animals and Plants Under Domestication — Charles Darwin
  "charles darwin\u0000the variation of animals and plants under domestication": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Novum Organum — Francis Bacon
  "francis bacon\u0000novum organum": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1902 },
  // Lord Jim — Joseph Conrad
  "joseph conrad\u0000lord jim": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Betty Wales, Senior — Edith Kellogg Dunton
  "edith kellogg dunton\u0000betty wales, senior": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Athenian Constitution — Aristotle
  "aristotle\u0000the athenian constitution": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Roman Assemblies from Their Origin to the End of the Republic — George Willis Botsford
  "george willis botsford\u0000the roman assemblies from their origin to the end of the republic": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1909 },
  // The Mill on the Floss — George Eliot
  "george eliot\u0000the mill on the floss": { verdict: "reject", reason: "title barely legible" },
  // What's Wrong with the World — G. K. Chesterton
  "g. k. chesterton\u0000what's wrong with the world": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Marvelous Land of Oz — L. Frank Baum
  "l. frank baum\u0000the marvelous land of oz": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1904, artist: { name: "John R. Neill", died: 1943 } },
  // South — Ernest Shackleton
  "ernest shackleton\u0000south": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1919 },
  // The Rose of Old St. Louis — Mary Dillon
  "mary dillon\u0000the rose of old st. louis": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Mask — Arthur Hornblow
  "arthur hornblow\u0000the mask": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Voyage Out — Virginia Woolf
  "virginia woolf\u0000the voyage out": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The French Revolution — Thomas Carlyle
  "thomas carlyle\u0000the french revolution": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Essence of Christianity — Ludwig Feuerbach
  "ludwig feuerbach\u0000the essence of christianity": { verdict: "reject", reason: "producer's own cover design" },
  // The Frontier in American History — Frederick Jackson Turner
  "frederick jackson turner\u0000the frontier in american history": { verdict: "reject", reason: "an ornament without the title" },
  // A Course of Pure Mathematics — G.H. Hardy
  "g.h. hardy\u0000a course of pure mathematics": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Modern Greek Folklore and Ancient Greek Religion — J. C. Lawson
  "j. c. lawson\u0000modern greek folklore and ancient greek religion": { verdict: "reject", reason: "producer's own cover design" },
  // Electricity for Boys — Jules Verne
  "jules verne\u0000electricity for boys": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Alchemist — Ben Jonson
  "ben jonson\u0000the alchemist": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Martin Eden — Jack London
  "jack london\u0000martin eden": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1909 },
  // The Progress of Invention in the Nineteenth Century. — Edward W. Byrn
  "edward w. byrn\u0000the progress of invention in the nineteenth century.": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Wendigo — Algernon Blackwood
  "algernon blackwood\u0000the wendigo": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Candidate — Joseph Alexander Altsheler
  "joseph alexander altsheler\u0000the candidate": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // English Literature — William J. Long
  "william j. long\u0000english literature": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Sketch Book of Geoffrey Crayon, Gent. — Washington Irving
  "washington irving\u0000the sketch book of geoffrey crayon, gent.": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Roman Festivals of the Period of the Republic — William Warde Fowler
  "william warde fowler\u0000the roman festivals of the period of the republic": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1899 },
  // The Theory of Moral Sentiments — Adam Smith
  "adam smith\u0000the theory of moral sentiments": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1777 },
  // Poems — Ralph Waldo Emerson
  "ralph waldo emerson\u0000poems": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Country of the Blind and Other Stories — H. G. Wells
  "h. g. wells\u0000the country of the blind and other stories": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // A Shropshire Lad — Alfred Edward Housman
  "alfred edward housman\u0000a shropshire lad": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Rime of the Ancient Mariner — Samuel Taylor Coleridge
  "samuel taylor coleridge\u0000the rime of the ancient mariner": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Irene Iddesleigh — Amanda McKittrick Ros
  "amanda mckittrick ros\u0000irene iddesleigh": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Ion — Plato
  "plato\u0000ion": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Way of the World — William Congreve
  "william congreve\u0000the way of the world": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // American Indian Stories — Zitkala-Sa
  "zitkala-sa\u0000american indian stories": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Aladdin & Co. — John Herbert Quick
  "john herbert quick\u0000aladdin & co.": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // King Lear — William Shakespeare
  "william shakespeare\u0000king lear": { verdict: "reject", reason: "producer's composite" },
  // On Heroes, Hero-Worship, and The Heroic in History — Thomas Carlyle
  "thomas carlyle\u0000on heroes, hero-worship, and the heroic in history": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Villette — Charlotte Brontë
  "charlotte brontë\u0000villette": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Influences of Geographic Environment — Ellen Churchill Semple
  "ellen churchill semple\u0000influences of geographic environment": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Twice-Told Tales — Nathaniel Hawthorne
  "nathaniel hawthorne\u0000twice-told tales": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Five Little Peppers at School — Margaret Sidney
  "margaret sidney\u0000five little peppers at school": { verdict: "reject", reason: "a library barcode label over the title" },
  // History of the Philippine Islands — Antonio de Morga
  "antonio de morga\u0000history of the philippine islands": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Twas the Night Before Christmas — Clement Clarke Moore
  "clement clarke moore\u0000twas the night before christmas": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1912, artist: { name: "Jessie Willcox Smith", died: 1935 } },
  // A Journal of the Plague Year — Daniel Defoe
  "daniel defoe\u0000a journal of the plague year": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1722 },
  // An Enquiry Concerning the Principles of Morals — David Hume
  "david hume\u0000an enquiry concerning the principles of morals": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // How It Works — Archibald Williams
  "archibald williams\u0000how it works": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Story of Doctor Dolittle — Hugh Lofting
  "hugh lofting\u0000the story of doctor dolittle": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1920, artist: { name: "Hugh Lofting", died: 1947 } },
  // Jude the Obscure — Thomas Hardy
  "thomas hardy\u0000jude the obscure": { verdict: "reject", reason: "producer's composite" },
  // The Illustrated Key To The Tarot — Lauron William de Laurence
  "lauron william de laurence\u0000the illustrated key to the tarot": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1918 },
  // Strange Stories from a Chinese Studio — Pu Songling
  "pu songling\u0000strange stories from a chinese studio": { verdict: "reject", reason: "producer's own cover design" },
  // This Side of Paradise — F. Scott Fitzgerald
  "f. scott fitzgerald\u0000this side of paradise": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1920, artist: { name: "W. E. Hill", died: 1962 } },
  // The Moon and Sixpence — William Somerset Maugham
  "william somerset maugham\u0000the moon and sixpence": { verdict: "reject", reason: "a later reprint's jacket (Modern Library); artist and year unknown" },
  // The Catacombs of Rome, and Their Testimony Relative to Primitive Christianity — William Henry Withrow
  "william henry withrow\u0000the catacombs of rome, and their testimony relative to primitive christianity": { verdict: "accept", from: "gutenberg", kind: "title" },
  // Varney the Vampyre — Thomas Peckett Prest ও James Malcolm Rymer
  "thomas peckett prest ও james malcolm rymer\u0000varney the vampyre": { verdict: "accept", from: "gutenberg", kind: "cover" },
  // Franklin's Way to Wealth — Benjamin Franklin
  "benjamin franklin\u0000franklin's way to wealth": { verdict: "accept", from: "gutenberg", kind: "title" },
  // John Gayther's Garden and the Stories Told Therein — Frank R. Stockton
  "frank r. stockton\u0000john gayther's garden and the stories told therein": { verdict: "reject", reason: "binding design signed with an unidentified monogram" },
  // Tam O' the Scoots — Edgar Wallace
  "edgar wallace\u0000tam o' the scoots": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Nights With Uncle Remus — Joel Chandler Harris
  "joel chandler harris\u0000nights with uncle remus": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1883 },
  // The Seven Lamps of Architecture — John Ruskin
  "john ruskin\u0000the seven lamps of architecture": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // By Conduct and Courage — G. A. Henty
  "g. a. henty\u0000by conduct and courage": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // From Kingdom to Colony — Mary Devereux
  "mary devereux\u0000from kingdom to colony": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1899 },
  // The Expression of the Emotions in Man and Animals — Charles Darwin
  "charles darwin\u0000the expression of the emotions in man and animals": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Autobiography of Andrew Carnegie — Andrew Carnegie
  "andrew carnegie\u0000autobiography of andrew carnegie": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Sceptical Chymist — Robert Boyle
  "robert boyle\u0000the sceptical chymist": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1661 },
  // Seneca's Morals of a Happy Life, Benefits, Anger and Clemency — Seneca
  "seneca\u0000seneca's morals of a happy life, benefits, anger and clemency": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Cautionary Tales for Children — Hilaire Belloc
  "hilaire belloc\u0000cautionary tales for children": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1907, artist: { name: "Basil Blackwood (B. T. B.)", died: 1917 } },
  // Looking Backward — Edward Bellamy
  "edward bellamy\u0000looking backward": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Tremendous Trifles — G. K. Chesterton
  "g. k. chesterton\u0000tremendous trifles": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Book of the National Parks — Robert Sterling Yard
  "robert sterling yard\u0000the book of the national parks": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // History of Education — Levi Seeley
  "levi seeley\u0000history of education": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Protagoras — Plato
  "plato\u0000protagoras": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Fifty Famous Stories Retold — James Baldwin
  "james baldwin\u0000fifty famous stories retold": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Rise of the Mediaeval Church — Alexander Clarence Flick
  "alexander clarence flick\u0000the rise of the mediaeval church": { verdict: "reject", reason: "a later facsimile reprint (Burt Franklin), year unknown" },
  // The Legends of King Arthur and His Knights — James Knowles ও Thomas Malory
  "james knowles ও thomas malory\u0000the legends of king arthur and his knights": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Duel and Other Stories — Anton Chekhov
  "anton chekhov\u0000the duel and other stories": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // ইংল্যান্ডে শ্রমিক শ্রেণির অবস্থা — Friedrich Engels
  "friedrich engels\u0000the condition of the working class in england in 1844": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Othello — William Shakespeare
  "william shakespeare\u0000othello": { verdict: "reject", reason: "producer's composite" },
  // The Red Room — H. G. Wells
  "h. g. wells\u0000the red room": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Rinkitink in Oz — L. Frank Baum
  "l. frank baum\u0000rinkitink in oz": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1916, artist: { name: "John R. Neill", died: 1943 } },
  // Letters to His Son — Philip Stanhope, 4th Earl of Chesterfield
  "philip stanhope, 4th earl of chesterfield\u0000letters to his son": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Memorabilia — Xenophon
  "xenophon\u0000memorabilia": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Summary of the Art of War — Antoine-Henri Jomini
  "antoine-henri jomini\u0000summary of the art of war": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Microcosmography — John Earle
  "john earle\u0000microcosmography": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The History of Magic — Eliphas Levi
  "eliphas levi\u0000the history of magic": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Letters of John Keats to His Family and Friends — John Keats
  "john keats\u0000letters of john keats to his family and friends": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Sons and Lovers — D. H. Lawrence
  "d. h. lawrence\u0000sons and lovers": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1913 },
  // The Sovereignty of the Sea — Thomas Wemyss Fulton
  "thomas wemyss fulton\u0000the sovereignty of the sea": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Raven — Edgar Allan Poe
  "edgar allan poe\u0000the raven": { verdict: "reject", reason: "producer's composite" },
  // The Sea-Wolf — Jack London
  "jack london\u0000the sea-wolf": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1904 },
  // Civil War and Reconstruction in Alabama — Walter Lynwood Fleming
  "walter lynwood fleming\u0000civil war and reconstruction in alabama": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // An Ideal Husband — Oscar Wilde
  "oscar wilde\u0000an ideal husband": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Heretics — G. K. Chesterton
  "g. k. chesterton\u0000heretics": { verdict: "reject", reason: "producer's own cover design" },
  // The Bacchae — Euripides
  "euripides\u0000the bacchae": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Laughter — Henri Bergson
  "henri bergson\u0000laughter": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Underground Rail Road — William Still
  "william still\u0000the underground rail road": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Mythology Among the Hebrews and Its Historical Development — Ignaz Goldziher
  "ignaz goldziher\u0000mythology among the hebrews and its historical development": { verdict: "reject", reason: "producer's own cover design" },
  // Maxims and Reflections — Johann Wolfgang von Goethe
  "johann wolfgang von goethe\u0000maxims and reflections": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Articles of Faith — James E. Talmage
  "james e. talmage\u0000articles of faith": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Phantastes — George MacDonald
  "george macdonald\u0000phantastes": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Complete Poetical Works of Edgar Allan Poe — Edgar Allan Poe
  "edgar allan poe\u0000the complete poetical works of edgar allan poe": { verdict: "reject", reason: "producer's composite" },
  // Jane Austen, Her Life and Letters — William Austen-Leigh ও Richard Arthur Austen-Leigh
  "william austen-leigh ও richard arthur austen-leigh\u0000jane austen, her life and letters": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Winesburg, Ohio — Sherwood Anderson
  "sherwood anderson\u0000winesburg, ohio": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Psychology — William James
  "william james\u0000psychology": { verdict: "reject", reason: "producer's own cover design" },
  // The Logic of Hegel — Georg Wilhelm Friedrich Hegel
  "georg wilhelm friedrich hegel\u0000the logic of hegel": { verdict: "accept", from: "gutenberg", kind: "title" },
  // O Pioneers! — Willa Cather
  "willa cather\u0000o pioneers!": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1913 },
  // Tender Buttons — Gertrude Stein
  "gertrude stein\u0000tender buttons": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Last Man — Mary Shelley
  "mary shelley\u0000the last man": { verdict: "reject", reason: "producer's composite" },
  // Officer 666 — Barton Currie ও Augustin McHugh
  "barton currie ও augustin mchugh\u0000officer 666": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Rustle of Silk — Cosmo Hamilton
  "cosmo hamilton\u0000the rustle of silk": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1922 },
  // Adam Bede — George Eliot
  "george eliot\u0000adam bede": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Gambler — Fyodor Dostoevsky
  "fyodor dostoevsky\u0000the gambler": { verdict: "reject", reason: "producer's composite" },
  // Memoirs of My Life and Writings — Edward Gibbon
  "edward gibbon\u0000memoirs of my life and writings": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Round Towers of Ireland — Henry O'Brien
  "henry o'brien\u0000the round towers of ireland": { verdict: "accept", from: "gutenberg", kind: "title" },
  // The Elder Eddas of Saemund Sigfusson — Sæmundr fróði ও Snorri Sturluson
  "sæmundr fróði ও snorri sturluson\u0000the elder eddas of saemund sigfusson": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // L. Annaeus Seneca on Benefits — Seneca
  "seneca\u0000l. annaeus seneca on benefits": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Human Nature and Conduct — John Dewey
  "john dewey\u0000human nature and conduct": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1922 },
  // The Red and the Black — Stendhal
  "stendhal\u0000the red and the black": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Open Boat — Stephen Crane
  "stephen crane\u0000the open boat": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1898 },
  // A History of Architecture in All Countries, Volumes 1 and 2, 3rd Ed. — James Fergusson
  "james fergusson\u0000a history of architecture in all countries, volumes 1 and 2, 3rd ed.": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Rape of the Lock — Alexander Pope
  "alexander pope\u0000the rape of the lock": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // A Course of Six Lectures on the Chemical History of a Candle — Michael Faraday
  "michael faraday\u0000a course of six lectures on the chemical history of a candle": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // A New Guide for Emigrants to the West — John Mason Peck
  "john mason peck\u0000a new guide for emigrants to the west": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Men Without Women — Ernest Hemingway
  "ernest hemingway\u0000men without women": { verdict: "reject", reason: "producer's own cover design" },
  // Letters of Pliny — Pliny the Younger
  "pliny the younger\u0000letters of pliny": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Economic Consequences of the Peace — John Maynard Keynes
  "john maynard keynes\u0000the economic consequences of the peace": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Dombey and Son — Charles Dickens
  "charles dickens\u0000dombey and son": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The American Language — H. L. Mencken
  "h. l. mencken\u0000the american language": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Mysterious Stranger and Other Stories — Mark Twain
  "mark twain\u0000the mysterious stranger and other stories": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Poems on Various Subjects, Religious and Moral — Phillis Wheatley
  "phillis wheatley\u0000poems on various subjects, religious and moral": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // A Short History of the World — H. G. Wells
  "h. g. wells\u0000a short history of the world": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1922 },
  // Plymouth Memories of an Octogenarian — William T. Davis
  "william t. davis\u0000plymouth memories of an octogenarian": { verdict: "reject", reason: "producer's own cover design" },
  // Sister Carrie — Theodore Dreiser
  "theodore dreiser\u0000sister carrie": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1900 },
  // Crito — Plato
  "plato\u0000crito": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Little Men — Louisa May Alcott
  "louisa may alcott\u0000little men": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Beautiful Stories from Shakespeare — Edith Nesbit ও William Shakespeare
  "edith nesbit ও william shakespeare\u0000beautiful stories from shakespeare": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Salem Witchcraft, Volumes I and II — Charles Wentworth Upham
  "charles wentworth upham\u0000salem witchcraft, volumes i and ii": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Jew of Malta — Christopher Marlowe
  "christopher marlowe\u0000the jew of malta": { verdict: "reject", reason: "producer's composite" },
  // The Tale of Jemima Puddle-Duck — Beatrix Potter
  "beatrix potter\u0000the tale of jemima puddle-duck": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Medieval English Nunneries C. 1275 to 1535 — Eileen Power
  "eileen power\u0000medieval english nunneries c. 1275 to 1535": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Secret Societies and Subversive Movements — Nesta Helen Webster
  "nesta helen webster\u0000secret societies and subversive movements": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // An Old Babylonian Version of the Gilgamesh Epic — Morris Jastrow, Jr. ও Albert Tobias Clay
  "morris jastrow, jr. ও albert tobias clay\u0000an old babylonian version of the gilgamesh epic": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Rover Boys at Big Horn Ranch — Edward Stratemeyer
  "edward stratemeyer\u0000the rover boys at big horn ranch": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Hunting of the Snark — Lewis Carroll
  "lewis carroll\u0000the hunting of the snark": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1876, artist: { name: "Henry Holiday", died: 1927 } },
  // Idylls of the King — Alfred Tennyson
  "alfred tennyson\u0000idylls of the king": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Random Reminiscences of Men and Events — John D. Rockefeller
  "john d. rockefeller\u0000random reminiscences of men and events": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Great Controversy Between Christ and Satan — Ellen G. White
  "ellen g. white\u0000the great controversy between christ and satan": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Love and Lucy — Maurice Hewlett
  "maurice hewlett\u0000love and lucy": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Hymns for Christian Devotion — John G. Adams ও Edwin Hubbell Chapin
  "john g. adams ও edwin hubbell chapin\u0000hymns for christian devotion": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Anne's House of Dreams — Lucy Maud Montgomery
  "lucy maud montgomery\u0000anne's house of dreams": { verdict: "reject", reason: "cover art signed by an unidentified artist" },
  // The Guarded Heights — Wadsworth Camp
  "wadsworth camp\u0000the guarded heights": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Mayor of Casterbridge — Thomas Hardy
  "thomas hardy\u0000the mayor of casterbridge": { verdict: "reject", reason: "producer's composite" },
  // The Life of Jesus Critically Examined — David Strauss
  "david strauss\u0000the life of jesus critically examined": { verdict: "reject", reason: "producer's own cover design" },
  // Anecdotes of the Habits and Instinct of Animals — Sarah Bowdich Lee
  "sarah bowdich lee\u0000anecdotes of the habits and instinct of animals": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Apostolic Tradition — Hippolytus
  "hippolytus\u0000apostolic tradition": { verdict: "reject", reason: "producer's own cover design" },
  // The Dark Tower — Phyllis Bottome
  "phyllis bottome\u0000the dark tower": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Oldest Code of Laws in the World — Hammurabi
  "hammurabi\u0000the oldest code of laws in the world": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Story of the Three Little Pigs — Leonard Leslie Brooke
  "leonard leslie brooke\u0000the story of the three little pigs": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1904, artist: { name: "L. Leslie Brooke", died: 1940 } },
  // Views of Nature — Alexander von Humboldt
  "alexander von humboldt\u0000views of nature": { verdict: "reject", reason: "producer's own cover design" },
  // A Japanese Boy — Shigemi Shiukichi
  "shigemi shiukichi\u0000a japanese boy": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Jucklins — Opie Read
  "opie read\u0000the jucklins": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Eve's Diary — Mark Twain
  "mark twain\u0000eve's diary": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1906 },
  // Tacitus — Tacitus
  "tacitus\u0000tacitus": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Three Ghost Stories — Charles Dickens
  "charles dickens\u0000three ghost stories": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Pilgrim's Progress by John Bunyan Every Child Can Read — John Buchan
  "john buchan\u0000the pilgrim's progress by john bunyan every child can read": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // A Commentary to Kant's 'Critique of Pure Reason' — Norman Kemp Smith
  "norman kemp smith\u0000a commentary to kant's 'critique of pure reason'": { verdict: "reject", reason: "producer's own cover design" },
  // The History of Prostitution — William Wallace Sanger
  "william wallace sanger\u0000the history of prostitution": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1858 },
  // Story Hour Readings — E. C. Hartwell
  "e. c. hartwell\u0000story hour readings": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Dialogues Concerning Natural Religion — David Hume
  "david hume\u0000dialogues concerning natural religion": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Two Years Before the Mast — Richard Henry Dana
  "richard henry dana\u0000two years before the mast": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Napoleon of Notting Hill — G. K. Chesterton
  "g. k. chesterton\u0000the napoleon of notting hill": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The American Occupation of the Philippines 1898-1912 — James H. Blount
  "james h. blount\u0000the american occupation of the philippines 1898-1912": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1913 },
  // Past and Present — Thomas Carlyle
  "thomas carlyle\u0000past and present": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Intentions — Oscar Wilde
  "oscar wilde\u0000intentions": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Critical Period of American History — John Fiske
  "john fiske\u0000the critical period of american history": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Sunbridge Girls at Six Star Ranch — Eleanor H. Porter
  "eleanor h. porter\u0000the sunbridge girls at six star ranch": { verdict: "reject", reason: "cover art signed with an unidentified monogram" },
  // The Secret Sharer — Joseph Conrad
  "joseph conrad\u0000the secret sharer": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Mandarin's Fan — Fergus Hume
  "fergus hume\u0000the mandarin's fan": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Life of Reason — George Santayana
  "george santayana\u0000the life of reason": { verdict: "reject", reason: "producer's own cover design" },
  // The Idea of a University Defined and Illustrated — John Henry Newman
  "john henry newman\u0000the idea of a university defined and illustrated": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Pilgrimage from the Alps to the Tiber — James Aitken Wylie
  "james aitken wylie\u0000pilgrimage from the alps to the tiber": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Religious Experience of the Roman People — William Warde Fowler
  "william warde fowler\u0000the religious experience of the roman people": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Puck of Pook's Hill — Rudyard Kipling
  "rudyard kipling\u0000puck of pook's hill": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1906 },
  // The Danish History, Books I-IX — Saxo Grammaticus
  "saxo grammaticus\u0000the danish history, books i-ix": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Beast in the Jungle — Henry James
  "henry james\u0000the beast in the jungle": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Hung Lou Meng — Cao Xueqin
  "cao xueqin\u0000hung lou meng": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // On Love — Stendhal
  "stendhal\u0000on love": { verdict: "reject", reason: "producer's own cover design" },
  // In the Forbidden Land — Arnold Henry Savage Landor
  "arnold henry savage landor\u0000in the forbidden land": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // An Essay on Man — Alexander Pope
  "alexander pope\u0000an essay on man": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Exploring Expedition to the Rocky Mountains, Oregon and California — John C. Frémont
  "john c. frémont\u0000the exploring expedition to the rocky mountains, oregon and california": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Story of a Soul (L'Histoire d'une Âme) — Thérèse of Lisieux
  "thérèse of lisieux\u0000the story of a soul (l'histoire d'une âme)": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // What Is Man? — Mark Twain
  "mark twain\u0000what is man?": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Fairy-Faith in Celtic Countries — Walter Evans-Wentz
  "walter evans-wentz\u0000the fairy-faith in celtic countries": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // A History of Economic Doctrines — Charles Gide ও Charles Rist
  "charles gide ও charles rist\u0000a history of economic doctrines": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1915 },
  // Captain Canot — Théodore Canot ও Brantz Mayer
  "théodore canot ও brantz mayer\u0000captain canot": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Autobiography — John Stuart Mill
  "john stuart mill\u0000autobiography": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Road to Oz — L. Frank Baum
  "l. frank baum\u0000the road to oz": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1909, artist: { name: "John R. Neill", died: 1943 } },
  // Nonsense Books — Edward Lear
  "edward lear\u0000nonsense books": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Rubáiyát of Omar Khayyám — Omar Khayyám
  "omar khayyám\u0000rubáiyát of omar khayyám": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Man and Superman — George Bernard Shaw
  "george bernard shaw\u0000man and superman": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Inventions, Researches, and Writings of Nikola Tesla — Thomas Commerford Martin
  "thomas commerford martin\u0000the inventions, researches, and writings of nikola tesla": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Lady, or the Tiger? — Frank R. Stockton
  "frank r. stockton\u0000the lady, or the tiger?": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Polly's Business Venture — Lillian Elizabeth Roy
  "lillian elizabeth roy\u0000polly's business venture": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Superstition and Force — Henry Charles Lea
  "henry charles lea\u0000superstition and force": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // The Angel in the House — Coventry Patmore
  "coventry patmore\u0000the angel in the house": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Bulfinch's Mythology — Thomas Bulfinch
  "thomas bulfinch\u0000bulfinch's mythology": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Father Goriot — Honoré de Balzac
  "honoré de balzac\u0000father goriot": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Micrographia — Robert Hooke
  "robert hooke\u0000micrographia": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1665 },
  // A London Life — Henry James
  "henry james\u0000a london life": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Golden Sayings of Epictetus, with the Hymn of Cleanthes — Epictetus
  "epictetus\u0000the golden sayings of epictetus, with the hymn of cleanthes": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Selected Poems — Robert Frost
  "robert frost\u0000selected poems": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1923 },
  // The Letters of Cassiodorus — Cassiodorus
  "cassiodorus\u0000the letters of cassiodorus": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Pamela — Samuel Richardson
  "samuel richardson\u0000pamela": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Religion of Babylonia and Assyria — Morris Jastrow, Jr.
  "morris jastrow, jr.\u0000the religion of babylonia and assyria": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Elements of Chemistry, — Antoine Lavoisier
  "antoine lavoisier\u0000elements of chemistry,": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Letters of Abelard and Heloise — Peter Abelard ও Héloïse
  "peter abelard ও héloïse\u0000letters of abelard and heloise": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Poine — Hubert Joseph Treston
  "hubert joseph treston\u0000poine": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1923 },
  // The Beautiful and Damned — F. Scott Fitzgerald
  "f. scott fitzgerald\u0000the beautiful and damned": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1922, artist: { name: "W. E. Hill", died: 1962 } },
  // The Bronze Age and the Celtic World — Harold John Edward Peake
  "harold john edward peake\u0000the bronze age and the celtic world": { verdict: "reject", reason: "producer's own cover design" },
  // Tales of Space and Time — H. G. Wells
  "h. g. wells\u0000tales of space and time": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Eugenics and Other Evils — G. K. Chesterton
  "g. k. chesterton\u0000eugenics and other evils": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // My First Summer in the Sierra — John Muir
  "john muir\u0000my first summer in the sierra": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1911 },
  // The Return of the Native — Thomas Hardy
  "thomas hardy\u0000the return of the native": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Operas Every Child Should Know — Dolores Bacon
  "dolores bacon\u0000operas every child should know": { verdict: "accept", from: "gutenberg", kind: "binding", edition: 1904 },
  // In Connection with the De Willoughby Claim — Frances Hodgson Burnett
  "frances hodgson burnett\u0000in connection with the de willoughby claim": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // St. Paul's Epistles to the Colossians and Philemon — J. B. Lightfoot
  "j. b. lightfoot\u0000st. paul's epistles to the colossians and philemon": { verdict: "reject", reason: "producer's own cover design" },
  // The History of the Standard Oil Company — Ida Tarbell
  "ida tarbell\u0000the history of the standard oil company": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Chuang Tzu — Zhuang Zhou
  "zhuang zhou\u0000chuang tzu": { verdict: "accept", from: "gutenberg", kind: "title", edition: 1889 },
  // Dream Psychology — Sigmund Freud
  "sigmund freud\u0000dream psychology": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // Alice's Adventures Under Ground — Lewis Carroll
  "lewis carroll\u0000alice's adventures under ground": { verdict: "accept", from: "gutenberg", kind: "cover", edition: 1886, artist: { name: "Lewis Carroll", died: 1898 } },
  // The Existence and Attributes of God, Volumes 1 and 2 — Stephen Charnock
  "stephen charnock\u0000the existence and attributes of god, volumes 1 and 2": { verdict: "reject", reason: "producer's own cover design" },
  // The Task of Social Hygiene — H. G. Wells
  "h. g. wells\u0000the task of social hygiene": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // New Treasure Seekers — Edith Nesbit
  "edith nesbit\u0000new treasure seekers": { verdict: "accept", from: "gutenberg", kind: "binding" },
  // Creative Evolution — Henri Bergson
  "henri bergson\u0000creative evolution": { verdict: "reject", reason: "Gutenberg's generated template cover" },
  // The Medicine-Men of the Apache. (1892 N 09 / 1887-1888 (pages 443-604)) — John Gregory Bourke
  "john gregory bourke\u0000the medicine-men of the apache. (1892 n 09 / 1887-1888 (pages 443-604))": { verdict: "reject", reason: "Gutenberg's generated template cover" },
};
