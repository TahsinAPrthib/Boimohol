# Catalog corrections 2 (2026-10-29)

Two files of update rows. Neither adds or removes a book. Each row names one book (`match`: its title and the author production shows now) and changes only the fields in `set`; a few also rewrite the rights note of a link the book already has (`sources`).

| File | Rows | Import on /admin/books | What |
|---|---|---|---|
| `data/catalog-corrections-2.json` | 36 | JSON ফাইল থেকে অনেক বই একসাথে যোগ করুন | curated books: 8 broken-Bangla repairs, 22 pen names, 6 hidden aliases |
| `data/gutenberg-all-corrections.json` | 747 | বড় ফাইল থেকে আমদানি (পুরো ক্যাটালগ) | bulk books: 98 broken-Bangla repairs, 645 pen names, 4 hidden aliases |

**What production has.** The bulk books came in from the committed `data/gutenberg-all-*.json`. The live pages still show the broken "জর্জ বার্নার্ড শ'ের" and "মম্‌ের", "Bernal Díaz del Brawl" and "Eric Temple Bell", which confirms it. Those files stay in the repo exactly as imported, and the second file brings production in line.

**Checked, not uploaded.** Production's catalog is the curated books (dev's copy) plus the committed bulk files, and the import's own matching code (`indexByKeys`, `findExisting`) was run over all 36,629 entries:
- every one of the 783 rows finds its book;
- none of the 651 renames lands on a book production already has;
- no book is in two files, or also in `data/catalog-corrections.json`.

Every row also passes the import's schema and the broken-Bangla check (`src/lib/bangla-check.ts`).

## Upload order

The three files touch different books, so the order is for tidiness, not correctness.

1. **`data/catalog-corrections.json`**, if you haven't uploaded it yet, with its hand steps (see `data/catalog-corrections.md`).
2. **`data/catalog-corrections-2.json`** with "JSON ফাইল থেকে অনেক বই একসাথে যোগ করুন".
   - The check should read "আগের বই হালনাগাদ হবে ৩৬টি", with nothing added, no duplicates and no errors.
   - Then click "৩৬টি আগের বই হালনাগাদ করুন".
3. **`data/gutenberg-all-corrections.json`** with "বড় ফাইল থেকে আমদানি (পুরো ক্যাটালগ)". It's 747 rows, three batches of 250.
   - Click "শুধু যাচাই করুন" first. It should end with "হালনাগাদ ৭৪৭টি", no new books, no duplicates and no errors.
   - Then click "আমদানি শুরু করুন".
4. **Move *The Mystery of a Turkish Bath*** to another category by hand, as you planned. File 2 already changes its description to "Rita-এর ইংরেজি উপন্যাস।"; it was "…ছোটদের বই।".

A second upload of either file changes nothing:
- the renamed books no longer match their rows ("ক্যাটালগে এই বইটি পাওয়া যায়নি": 22 in file 2, 629 in file 3);
- every other row shows "কোনো পরিবর্তন নেই" (14 and 118).

## 1. Broken Bangla: 8 curated rows, 98 bulk rows

Every title, author, translator, description, search alias and rights note was checked for sequences no correct spelling produces. These include:
- a vowel sign after a chandrabindu, a hasanta or another vowel sign;
- a doubled sign;
- a joiner (ZWJ/ZWNJ) not next to a hasanta;
- invisible characters.

All of them came from one bug, a possessive glued onto a name that ends in ঁ, a hasanta or an apostrophe. Both description generators are fixed: `possessiveAny` in `scripts/gutenberg/rules.ts`, and `possessive` in `scripts/wikisource/descriptions.ts`.

Curated books:

| Book | Was | Now |
|---|---|---|
| The Moon and Sixpence | উইলিয়াম সমারসেট মম্‌ের ইংরেজি উপন্যাস। | উইলিয়াম সমারসেট মম্‌-এর ইংরেজি উপন্যাস। |
| The Awakening | কেট শপ্যাঁের ইংরেজি উপন্যাস। | কেট শপ্যাঁর ইংরেজি উপন্যাস। |
| Pygmalion | জর্জ বার্নার্ড শ'ের ইংরেজি নাটক। | জর্জ বার্নার্ড শ'র ইংরেজি নাটক। |
| Man and Superman | জর্জ বার্নার্ড শ'ের ইংরেজি নাটক। | জর্জ বার্নার্ড শ'র ইংরেজি নাটক। |
| Swann's Way | মার্সেল প্রুস্ত্‌ের ফরাসি উপন্যাস, … | মার্সেল প্রুস্ত্‌-এর ফরাসি উপন্যাস, … |
| Dans l'Inde | আঁদ্রে শেভ্রিয়োঁের ভ্রমণকাহিনি, … | আঁদ্রে শেভ্রিয়োঁর ভ্রমণকাহিনি, … |
| Batouala | রেনে মারাঁের উপন্যাস, … | রেনে মারাঁর উপন্যাস, … |
| A Course of Pure Mathematics | search alias "এ কোর্স[ZWNJ] অফ পিওর ম্যাথমেটিক্স" | "এ কোর্স অফ পিওর ম্যাথমেটিক্স" (the stray joiner removed) |

Bulk books: 95 descriptions, 5 rights notes and 1 search alias, with the same kinds of error:
- "শ'ের" in 42 of Shaw's books, now "শ'র";
- "মম্‌ের" in 26 of Maugham's, now "মম্‌-এর";
- "রোলাঁের" in 8 of Romain Rolland's;
- "মোপাসাঁঁের" (with a doubled chandrabindu) in 3;
- a few more like them (রোদাঁ, শপ্যাঁ, প্রুস্ত্‌).

## 2. Pen names, curated books: 22 rows

The rule: show the name the book itself is credited to, when that name is a pen name readers know.
- **Evidence:** the title page credits the pen name, and Wikidata records it as that person's pseudonym (or Wikipedia's article is titled by it).
- **Bangla Wikisource:** the scan shows the title page.
- **Gutenberg:** its catalog files the books under the pen name, with the legal name as an alias.

The name production shows now becomes a hidden search alias, and descriptions name the pen name. Two descriptions already explained it ("‘পরশুরাম’ ছদ্মনামে লেখা রাজশেখর বসুর…") and are kept. Death years and categories don't change.

| Shown now | Will show | Books | Evidence |
|---|---|---|---|
| প্রসাদদাস রায় | **হেমেন্দ্রকুমার রায়** | পসরা, অন্ধকারের বন্ধু, পঞ্চনদের তীরে, মড়ার মৃত্যু, অমৃত-দ্বীপ, এখন যাঁদের দেখছি, যাঁদের দেখেছি (7) | Every title page reads "শ্রীহেমেন্দ্রকুমার রায়" (পসরা, 1915: "শ্রীহেমেন্দ্রকুমার রায়-লিখিত"). [Wikidata Q5711290](https://www.wikidata.org/wiki/Q5711290) gives হেমেন্দ্রকুমার রায় as the pseudonym of প্রসাদদাস রায়, and Bangla Wikipedia's article is "হেমেন্দ্রকুমার রায়". যখের ধন is already under this name, so all 8 of his books end up under one name. |
| রাজশেখর বসু | **পরশুরাম** | গড্ডলিকা, কজ্জলী, হনুমানের স্বপ্ন ইত্যাদি গল্প, গল্পকল্প, ধুস্তুরী মায়া ইত্যাদি গল্প, কৃষ্ণকলি ইত্যাদি গল্প, নীল তারা ইত্যাদি গল্প, আনন্দীবাঈ ইত্যাদি গল্প, চমৎকুমারী ইত্যাদি গল্প (9) | Title pages: "গড্‌ডলিকা পরশুরাম রচিত" (1924), and "পরশুরাম" on each later collection. কজ্জলী's scan is filed as "কজ্জলী - পরশুরাম (১৯৪৯).pdf". [Wikidata Q7286435](https://www.wikidata.org/wiki/Q7286435) records the pseudonym. His essays and translation stay under রাজশেখর বসু, as their title pages have it: লঘুগুরু প্রবন্ধাবলী, বিচিন্তা, মহাভারত (সারানুবাদ). |
| Adela Florence Nicolson | **Laurence Hope** | India's Love Lyrics | "By Laurence Hope"; Gutenberg files her as Hope, Laurence; [Q353765](https://www.wikidata.org/wiki/Q353765). Aliases: the legal name in English and Bangla. |
| Herman Diederik Joan van Schevichaven ও John Camden Hotten | **Jacob Larwood** ও John Camden Hotten | The History of Signboards | "By Jacob Larwood and John Camden Hotten"; Gutenberg files him as Larwood, Jacob; English Wikipedia's article is "Jacob Larwood". The rights note names him too and is rewritten. |
| Clotilde Graves | **Richard Dehan** | That Which Hath Wings | "By Richard Dehan, author of 'The Dop Doctor'"; Gutenberg: Dehan, Richard; [Q5135590](https://www.wikidata.org/wiki/Q5135590). |
| Eliza Humphreys | **Rita** | The Mystery of a Turkish Bath | "by Rita"; Gutenberg: Rita; [Q5362151](https://www.wikidata.org/wiki/Q5362151). |
| J. E. Preston Muddock | **Dick Donovan** | Tales of Terror | "By Dick Donovan, author of 'A Detective's Triumphs'"; Gutenberg: Donovan, Dick; [Q4377487](https://www.wikidata.org/wiki/Q4377487). |
| Winnifred Eaton | **Onoto Watanna** | Daughters of Nijo | "By Onoto Watanna"; Gutenberg: Watanna, Onoto; [Q8025676](https://www.wikidata.org/wiki/Q8025676). |

## 3. Pen names, bulk books: 645 rows

The import scripts showed Wikidata's English label for every person, and that label is often the legal name. That is how these books lost their pen names.

`scripts/gutenberg-all.ts` now shows Gutenberg's own name for a person when both of these hold:
1. Wikidata records that name as a pseudonym, or English Wikipedia titles the person by it.
2. Its surname differs from the legal name's.

The second test leaves "E. Nesbit", "Bernard Shaw" and "Thornton W. Burgess" alone. `data/gutenberg-all-corrections.json` holds exactly what a regeneration with that rule writes, as update rows against the imported books.

What the 645 rows contain:
- 629 change the author and 12 the translator.
- 4 change only a rights note that names an introducer or editor by their legal name: Susan Coolidge on *The Letters of Jane Austen*, and Stuart Mason on two Wilde books and Bloxam's *The Priest and the Acolyte*.
- Descriptions follow the new name.
- The name production shows now is kept as a hidden search alias, with the legal name's Bangla form where Wikidata gives one.

76 authors are renamed. The most common, by number of books:
- Burt L. Standish (59, was Gilbert Patten), James Otis (55, James Otis Kaler), A. L. O. E. (46, Charlotte Maria Tucker);
- Madeline Leslie (43), Charles Egbert Craddock (40, Mary Noailles Murfree), Pansy (21), Duchess (20);
- Max Brand (18, Frederick Schiller Faust), F. Anstey, Henry Seton Merriman (17 each);
- Rolf Boldrewood (16), Ian Hay, Ralph Connor, Susan Coolidge, Sarah Tytler, Sydney C. Grier (15 each);
- Martin Ross, Onoto Watanna (14 each), Aunt Fanny (13), Ian Maclaren (11), Edna Lyall, John Oxenham (10 each);
- 49 more authors with fewer than 6 books each.

A few translators are renamed too: N. D'Anvers, Leader Scott, L. E. L., Professor Hoffmann and Susan Coolidge.

A few are another name the person went by rather than a pen name, and each matches Gutenberg's own record:
- Rose Hawthorne Lathrop (Wikidata gives her religious name, Mother Mary Alphonsa);
- Violet M. Firth (the name on her early books; she later wrote as Dion Fortune);
- Livy (the English form of Titus Livius);
- Winifred Stephens Whale, Frances Theodora Parsons (married names).

**Bernal Díaz del Castillo (2 books).** Production credits them to "Bernal Díaz del Brawl", a vandalised Wikidata label. The rows restore his name and do not keep the vandalised one as an alias.

The bulk import's spot-check (`data/gutenberg-all-spot-check.md`, 48 of 50) is left as it was for the imported files. Its two failures, Edna Lyall and Artemus Ward credited by their legal names, are among these rows. A re-run on the regenerated rows passed 50 of 50.

## 4. Your decisions (2026-10-29)

- **Hidden aliases added:**
  - টেকচাঁদ ঠাকুর on আলালের ঘরের দুলাল (still shown under প্যারীচাঁদ মিত্র);
  - বেগম রোকেয়া on রোকেয়া সাখাওয়াত হোসেন's 3 books;
  - মহাত্মা গান্ধী on his 6 books: 2 curated (মোহনদাস করমচাঁদ গান্ধী, Mohandas Karamchand Gandhi) and 4 bulk ("Mahatma Gandhi", so a Bangla search finds them).
- **Left as they are:**
  - Margaret Warde, Arthur M. Winfield and the Stratemeyer series names;
  - the other forms of real names (Abbé Prévost, Baroness Orczy, Herbert Quick, Gertrude Calvert Hall, A. Mary F. Robinson, E. Nesbit, A. E. Housman, Bernard Shaw, the initials).
- **Moved by hand:** *The Mystery of a Turkish Bath*.

**Also left as they are:**
- কুমুদিনী মিত্র (1906) and কুমুদিনী বসু (1915), each as printed;
- প্রাণোচ্ছ্বাস without the title বিদ্যাভূষণ;
- differences from Wikipedia that are spelling (জগদীশচন্দ্র / জগদীশ চন্দ্র বসু, ঔরঙ্গজেব / আওরঙ্গজেব), titles (Henry VIII of England) or a namesake matched by mistake.
