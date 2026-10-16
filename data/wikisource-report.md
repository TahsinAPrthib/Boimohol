# Bangla Wikisource import — review report

Generated 2026-10-16 by `scripts/wikisource-import.ts`. Public-domain cutoff: the author (and any translator or editor) died in **1965 or earlier**.

## Totals

| | Works |
|---|---|
| Fully proofread scans on bn.wikisource (start) | 652 |
| Batch 1, already prepared (`data/wikisource-import.json`, unchanged) | 422 |
| Batch 2, new books (`data/wikisource-import-2.json`) | 23 |
| Batch 2, links for books already in the catalog (same file) | 0 |
| Batch 1 corrections: translator credits and rights notes (`data/wikisource-batch1-corrections.json`, update rows) | 26 |
| Not imported yet: no confirmed category (`data/wikisource-unclassified.json`) | 0 |
| Left out, with reasons (`data/wikisource-excluded.json`) | 207 |

Every batch 1 row still passes every check.

**Batch 1 corrections.** `data/wikisource-batch1-corrections.json` has 26 update rows for batch 1 books already imported: a translator credit for each of the 26 translations, and the rights note each link should carry — including the three notes corrected after batch 1 was handed over (`data/wikisource-batch1-corrections.md`). Upload it on /admin/books like any import: the preview lists every book it changes under “আগের বইয়ে হালনাগাদ হবে”, and a note that is already right shows no change.

**Importing.** Batch 1 is `data/wikisource-import.json` as before. Batch 2 is `data/wikisource-import-2.json`: 5 works whose author's death year was confirmed from another source (below), and 18 works whose category was settled by reading the text. Upload each on /admin/books.

**Rules beyond the death year.** A work first published after its author's death (or a translation after its translator's) is protected in Bangladesh for 60 years from publication, so such a work first printed after 1965 is excluded even when the author died earlier. Wikidata labels Manik Bandopadhyay by his legal name, প্রবোধকুমার বন্দ্যোপাধ্যায়; the import uses মানিক বন্দ্যোপাধ্যায়. A translation's Bangla title is taken from its Wikisource page, not from the original work's label.

## Decisions applied (2026-10-16)

1. **কুমুদিনী বসু (সাহিত্য-চিন্তা): included.** Both Wikipedias put her death in 1942–43; the year used is 1943. Rights note: “লেখক কুমুদিনী বসু আনুমানিক ১৯৪২–৪৩ সালে মারা গেছেন (সাল নিশ্চিত নয়, তবে দশ বছরের ভুল হলেও তা ১৯৬৫-র আগে); কপিরাইটের মেয়াদ শেষ। উৎস: বাংলা উইকিসংকলন”
2. **পুরাণ ও লোককথা** (`puran-lokkotha`, migration 20261015203820): 8 works — অদ্ভুত রামায়ণ, কুরু পাণ্ডব, বত্রিশ সিংহাসন, ভয়ভাঙ্গা, মহাভারত (উপক্রমণিকাভাগ), মহাভারত, মেয়েলি ব্রত ও কথা, সতী.
3. **পথে-বিপথে: chhotogolpo.** Of its 16 pieces, 12 are first-person stories on the Ganges ferry with the friend অবিন (মোহিনী, অস্থি, গুরুজী, টুপি, দোশালা, মাতু, শেমুষী, ইন্দু, অরোরা, পর্-ঈ-তাউস্, ছাই-ভস্ম, লুকি-বিদ্যে); 4 are travel sketches (গমনাগমন, নিষ্ক্রমণ, আরোহণ, বিচরণ).
4. **শরৎ-সাহিত্য-সংগ্রহ: left out** (in `data/wikisource-excluded.json`).

## Translators: who wrote the Bangla text

Every prepared work whose original is in another language or older than Bangla prose (42): the person who wrote the Bangla text, and their death year, which must pass the same rule (1965 or earlier). A translator is credited on the book page (`translator`); for a retelling that Wikisource credits to the Bangla writer as author (রাজশেখর বসু's মহাভারত), that writer is the author shown, so there is no separate translator line. Re-checked live on Wikidata in `data/wikisource-translator-check.md` (`scripts/wikisource-translator-check.ts`).

**Every batch 1 book passes this check.** None has an unnamed translator or one who died after the cutoff.

| Batch | Work | Original | Bangla text by | Died | Passes |
|---|---|---|---|---|---|
| 1 | ৮০ দিনে ভূপ্রদক্ষিণ | জুল ভার্ন (১৯০৫ সালে) | রাজেন্দ্রলাল আচার্য (translator) | ১৯৬১ সালে | yes |
| 1 | অশ্বঘোষের বুদ্ধচরিত | অশ্বঘোষ (১৫০ সালে) | রথীন্দ্রনাথ ঠাকুর (translator) | ১৯৬১ সালে | yes |
| 1 | আলম্‌গীরের পত্রাবলী | ঔরঙ্গজেব (১৭০৭ সালে) | যামিনীকান্ত সোম (translator) | ১৯৬৪ সালে | yes |
| 1 | ইংরাজ-বর্জ্জিত ভারতবর্ষ | পিয়ের লোতি (১৯২৩ সালে) | জ্যোতিরিন্দ্রনাথ ঠাকুর (translator) | ১৯২৫ সালে | yes |
| 1 | ইয়ুরোপে তিন বৎসর | রমেশচন্দ্র দত্ত (১৯০৯ সালে) | রমেশচন্দ্র দত্ত (translator) | ১৯০৯ সালে | yes |
| 1 | এনক আর্ডেন | আলফ্রেড টেনিসন (১৮৯২ সালে) | দুর্গাদাস লাহিড়ী (translator) | ১৯৩২ সালে | yes |
| 1 | এপিক্‌টেটসের উপদেশ | আররিয়ানোস (১৮০ সালে) | জ্যোতিরিন্দ্রনাথ ঠাকুর (translator) | ১৯২৫ সালে | yes |
| 1 | এরাও মানুষ | রেনে মারাঁ (১৯৬০ সালে) | নৃপেন্দ্রকৃষ্ণ চট্টোপাধ্যায় (translator) | ১৯৬৩ সালে | yes |
| 1 | কথামালা | ঈসপ (আনুমানিক খ্রিস্টপূর্ব ৫৬৪ সালে) | ঈশ্বরচন্দ্র বিদ্যাসাগর (translator) | ১৮৯১ সালে | yes |
| 1 | কারাকাহিনী | মোহনদাস করমচাঁদ গান্ধী (১৯৪৮ সালে) | অনাথনাথ বসু (translator) | ১৯৩৫ সালে | yes |
| 1 | চন্দ্রলোকে যাত্রা | জুল ভার্ন (১৯০৫ সালে) | রাজেন্দ্রলাল আচার্য (translator) | ১৯৬১ সালে | yes |
| 1 | চিত্রে জয়দেব ও গীতগোবিন্দ | জয়দেব (আনুমানিক ১২৪৫ সালে) | নৃপেন্দ্রকৃষ্ণ চট্টোপাধ্যায় (translator) | ১৯৬৩ সালে | yes |
| 1 | টল্‌স্টয়ের গল্প | ল্যেভ তলস্তোয় (১৯১০ সালে) | দুর্গামোহন মুখোপাধ্যায় (translator) | ১৯৫৫ সালে | yes |
| 1 | তবুও আমি তাঁহারই উপর নির্ভর করিব | হানা রোসেলি হিগেন্স (১৯৪০ সালে) | মথুরানাথ নন্দী (translator) | ১৯৪৬ সালে | yes |
| 1 | নিগ্রোজাতির কর্ম্মবীর | বুকার টালিয়াফেরো ওয়াশিংটন (১৯১৫ সালে) | বিনয়কুমার সরকার (translator) | ১৯৪৯ সালে | yes |
| 1 | বিশ্ব-ইতিহাস প্রসঙ্গ | জওহরলাল নেহরু (১৯৬৪ সালে) | সত্যেন্দ্রনাথ মজুমদার (translator) | ১৯৫৪ সালে | yes |
| 1 | বেলুনে পাঁচ সপ্তাহ | জুল ভার্ন (১৯০৫ সালে) | রাজেন্দ্রলাল আচার্য (translator) | ১৯৬১ সালে | yes |
| 1 | ভারতবর্ষে | আঁদ্রে শেভ্রিয়োঁ (১৯৫৭ সালে) | জ্যোতিরিন্দ্রনাথ ঠাকুর (translator) | ১৯২৫ সালে | yes |
| 1 | ভ্রান্তিবিলাস | Shakespeare's The Comedy of Errors (English), adapted as Bangla prose | ঈশ্বরচন্দ্র বিদ্যাসাগর (Bangla writer, credited as author) | ১৮৯১ সালে | yes |
| 1 | মা | ম্যাক্সিম গোর্কি (১৯৩৬ সালে) | বিমল সেন (translator) | ১৯৩৪ সালে | yes |
| 1 | মানসিংহ | ভারতচন্দ্র রায় (১৭৬০ সালে) | ভারতচন্দ্র রায় (author) | ১৭৬০ সালে | yes |
| 1 | মার্কাস্‌ অরিলিয়সের আত্মচিন্তা | মার্কাস অরিলিয়স (১৮০ সালে) | জ্যোতিরিন্দ্রনাথ ঠাকুর (translator) | ১৯২৫ সালে | yes |
| 1 | মেগাস্থেনীসের ভারত-বিবরণ | মেগাস্থিনিস (খ্রিস্টপূর্ব ২৯০-এর দশকে) | রজনীকান্ত গুহ (translator) | ১৯৪৫ সালে | yes |
| 1 | রাজমোহনের স্ত্রী | বঙ্কিমচন্দ্র চট্টোপাধ্যায় (১৮৯৪ সালে) | সজনীকান্ত দাস (translator) | ১৯৬২ সালে | yes |
| 1 | রোবাইয়াৎ-ই-ওমর খৈয়াম | ওমর খৈয়াম (১১৩১ সালে) | কান্তিচন্দ্র ঘোষ (translator) | ১৯৪৯ সালে | yes |
| 1 | শকুন্তলা | Kalidasa's Abhijnanasakuntalam (Sanskrit), retold for children | অবনীন্দ্রনাথ ঠাকুর (Bangla writer, credited as author) | ১৯৫১ সালে | yes |
| 1 | শকুন্তলা | Kalidasa's Abhijnanasakuntalam (Sanskrit), retold as Bangla prose | ঈশ্বরচন্দ্র বিদ্যাসাগর (Bangla writer, credited as author) | ১৮৯১ সালে | yes |
| 1 | শিক্‌ওয়া ও জবাব-ই-শিক্‌ওয়া | মুহম্মদ ইকবাল (১৯৩৮ সালে) | গোলাম মোস্তফা (translator) | ১৯৬৪ সালে | yes |
| 1 | শ্রীযুত ডাক্তর এম, জে, ব্রমলি সাহেবের বক্তৃতার দ্বারা সংক্ষেপ আবেদন | মাউন্টফোর্ড জোসেফ ব্রমলি (১৮৩৭ সালে) | উদয়চন্দ্র আঢ্য (translator) | ১৮৫৬ সালে | yes |
| 1 | সীতার বনবাস | Bhavabhuti's Uttararamacharita and the Ramayana (Sanskrit), retold | ঈশ্বরচন্দ্র বিদ্যাসাগর (Bangla writer, credited as author) | ১৮৯১ সালে | yes |
| 1 | সেক্‌সপিয়র কৃত গ্রন্থ হইতে উদ্ধৃত অপূর্ব্বোপাখ্যান | চার্লস ল্যাম্ব (১৮৩৪ সালে), মেরী ল্যাম্ব (১৮৪৭ সালে) | মুক্তারাম বিদ্যাবাগীশ (translator) | ১৮৬০ সালে | yes |
| 1 | হেক্‌টর বধ | Homer's Iliad (Greek), retold as Bangla prose | মাইকেল মধুসূদন দত্ত (Bangla writer, credited as author) | ১৮৭৩ সালে | yes |
| 2 | অদ্ভুত রামায়ণ | বাল্মীকি (প্রাচীন ভারতের কবি) | সৌদামিনী দেবী (translator) | ১৯২০ সালে | yes |
| 2 | কাদম্বরী | বাণভট্ট (৬৫০ সালে), ভূষণভট্ট (সাত শতকের লেখক বাণভট্টের পুত্র) | তারাশঙ্কর তর্করত্ন (translator) | ১৮৫৮ সালে | yes |
| 2 | কুরু পাণ্ডব | the Mahabharata (Sanskrit), episodes retold | রবীন্দ্রনাথ ঠাকুর (Bangla writer, credited as author) | ১৯৪১ সালে | yes |
| 2 | বত্রিশ সিংহাসন | লাল্লু লাল (১৮২৫ সালে) | নীলমণি বসাক (translator) | ১৮৬৪ সালে | yes |
| 2 | ভয়ভাঙ্গা | Radha-Krishna legends, retold | দীনেশচন্দ্র সেন (Bangla writer, credited as author) | ১৯৩৯ সালে | yes |
| 2 | মহাভারত | the Mahabharata (Sanskrit), condensed translation (সারানুবাদ) | রাজশেখর বসু (Bangla writer, credited as author) | ১৯৬০ সালে | yes |
| 2 | মহাভারত (উপক্রমণিকাভাগ) | the Mahabharata (Sanskrit), opening chapters translated | ঈশ্বরচন্দ্র বিদ্যাসাগর (Bangla writer, credited as author) | ১৮৯১ সালে | yes |
| 2 | মেয়েলি ব্রত ও কথা | oral folk tales and rituals of East Bengal, collected and written down | পরমেশপ্রসন্ন রায় (Bangla writer, credited as author) | ১৯২৭ সালে | yes |
| 2 | রসমঞ্জরী | ভানুদত্ত মিশ্র (পনেরো-ষোলো শতকের কবি) | ভারতচন্দ্র রায় (translator) | ১৭৬০ সালে | yes |
| 2 | সতী | the Puranic Sati legend, retold | দীনেশচন্দ্র সেন (Bangla writer, credited as author) | ১৯৩৯ সালে | yes |

## Batch 2

| Work | Author | Category | Why it's new |
|---|---|---|---|
| গোচারণের মাঠ | অক্ষয়চন্দ্র সরকার | `kobita` | category settled by reading the text |
| প্রেমিক সন্ন্যাসী | অনাথনাথ বসু | `uponnash` | category settled by reading the text |
| পথে-বিপথে | অবনীন্দ্রনাথ ঠাকুর | `chhotogolpo` | category settled by reading the text |
| মহাভারত (উপক্রমণিকাভাগ) | ঈশ্বরচন্দ্র বিদ্যাসাগর | `puran-lokkotha` | category settled by reading the text |
| বেল্লিক রামায়ণ | কালীপ্রসন্ন বিদ্যারত্ন | `kobita` | category settled by reading the text |
| সাহিত্য-চিন্তা | কুমুদিনী বসু | `probondho` | death year confirmed (see below) |
| প্রাচীন ভারতে নারী | ক্ষিতিমোহন সেন | `probondho` | category settled by reading the text |
| ভয়ভাঙ্গা | দীনেশচন্দ্র সেন | `puran-lokkotha` | category settled by reading the text |
| সতী | দীনেশচন্দ্র সেন | `puran-lokkotha` | category settled by reading the text |
| মেয়েলি ব্রত ও কথা | পরমেশপ্রসন্ন রায় | `puran-lokkotha` | category settled by reading the text |
| কাদম্বরী | বাণভট্ট ও ভূষণভট্ট | `uponnash` | death year confirmed (see below) |
| অদ্ভুত রামায়ণ | বাল্মীকি | `puran-lokkotha` | death year confirmed (see below) |
| নীলগঞ্জের ফালমন সাহেব | বিভূতিভূষণ বন্দ্যোপাধ্যায় | `chhotogolpo` | category settled by reading the text |
| রসমঞ্জরী | ভানুদত্ত মিশ্র | `kobita` | death year confirmed (see below) |
| মোহনলাল | যোগীন্দ্রনাথ সরকার | `shishu-sahitto` | category settled by reading the text |
| কুরু পাণ্ডব | রবীন্দ্রনাথ ঠাকুর | `puran-lokkotha` | category settled by reading the text |
| সংকলন | রবীন্দ্রনাথ ঠাকুর | `probondho` | category settled by reading the text |
| পাষাণের কথা | রাখালদাস বন্দ্যোপাধ্যায় | `itihash-jiboni` | category settled by reading the text |
| গ্রাম্য উপাখ্যান | রাজনারায়ণ বসু | `itihash-jiboni` | category settled by reading the text |
| মহাভারত | রাজশেখর বসু | `puran-lokkotha` | category settled by reading the text |
| মহারাজ কৃষ্ণচন্দ্র রায়স্য চরিত্রং | রাজীবলোচন মুখোপাধ্যায় | `itihash-jiboni` | death year confirmed (see below) |
| বত্রিশ সিংহাসন | লাল্লু লাল | `puran-lokkotha` | category settled by reading the text |
| গুরুদক্ষিণা | সতীশচন্দ্র রায় | `uponnash` | category settled by reading the text |

Rights notes for the era-dated authors read, for example: “লেখক কুমুদিনী বসু আনুমানিক ১৯৪২–৪৩ সালে মারা গেছেন (সাল নিশ্চিত নয়, তবে দশ বছরের ভুল হলেও তা ১৯৬৫-র আগে); কপিরাইটের মেয়াদ শেষ। উৎস: বাংলা উইকিসংকলন”

## Authors without a Wikidata death year (researched 2026-10-16)

Each was looked up on Wikidata (again, live), the Bangla and English Wikipedia (article linked from Wikidata, then a search by name), and Banglapedia. A work is included only when a source confirms the year and the year passes the rule. Where a source gives only an era, the year used is the latest it allows.

| Author | Works | Decision | Source or reason |
|---|---|---|---|
| কুমুদিনী বসু | সাহিত্য-চিন্তা | **confirmed** — আনুমানিক ১৯৪২–৪৩ সালে মারা গেছেন (সাল নিশ্চিত নয়, তবে দশ বছরের ভুল হলেও তা ১৯৬৫-র আগে) (year used: 1943) | https://bn.wikipedia.org/wiki/কুমুদিনী_বসু — “কুমুদিনী বসু (১৮৭৮ – ১৯৪৩) ছিলেন একজন সাহিত্যিক এবং সমাজসেবক। (lists সাহিত্য-চিন্তা among her works; cites only Wikisource)”; https://en.wikipedia.org/wiki/Kumudini_Basu — “Kumudini Basu (née Mitra, 1873–1942) was a Bengali writer, social reformer … (death year marked 'citation needed')” |
| বাল্মীকি | অদ্ভুত রামায়ণ | **confirmed** — প্রাচীন ভারতের কবি (year used: 300) | https://en.wikipedia.org/wiki/Valmiki — “the earliest stage of the [Ramayana] text … 8th to 4th centuries BCE, and later stages extending up to the 3rd century CE (cites Goldman 1984; Brockington 1998)” |
| ভানুদত্ত মিশ্র | রসমঞ্জরী | **confirmed** — পনেরো-ষোলো শতকের কবি (year used: 1600) | https://en.wikipedia.org/wiki/Bhanudatta_Misra — “a Sanskrit poet … dated to some time in the late 15th and early 16th century (cites Pollock 2009, NYU Press)” |
| ভূষণভট্ট | কাদম্বরী | **confirmed** — সাত শতকের লেখক বাণভট্টের পুত্র (year used: 800) | https://en.wikipedia.org/wiki/Kadambari — “The novel was completed by Banabhatta's son Bhushanabhatta”; https://en.wikipedia.org/wiki/Banabhatta — “a 7th-century Sanskrit prose writer and poet (cites Upinder Singh)” |
| রাজীবলোচন মুখোপাধ্যায় | মহারাজ কৃষ্ণচন্দ্র রায়স্য চরিত্রং | **confirmed** — আঠারো-উনিশ শতকের লেখক (year used: 1900) | https://bn.banglapedia.org/index.php/মুখোপাধ্যায়,_রাজীবলোচন — “মুখোপাধ্যায়, রাজীবলোচন (১৮শ-১৯শ শতক) … একমাত্র গ্রন্থ কৃষ্ণচন্দ্ররায়স্য চরিত্রম (১৮০৫)” |
| অজিৎকুমার মুখোপাধ্যায় | জার্ম্মানীর যৌবন অভিযান | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| অনাথবন্ধু সেন | সচিত্র রেল অবতার | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| অভয়চরণ দাস | মনোরম্য ইতিহাস | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| আশিসরঞ্জন নাথ | এখানে দিনের রং বদলায় | left out | আশিসরঞ্জন নাথ: born 1960 (Wikidata); a recent author. |
| আশুতোষ বিশ্বাস | বীরজয় উপাখ্যান | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| আশুতোষ মুখোপাধ্যায় | প্রমোদকামিনী কাব্য | left out | আশুতোষ মুখোপাধ্যায় (প্রমোদকামিনী কাব্য): Wikipedia has two writers of this name (1864–1924, 1920–1989); nothing ties either to this book. |
| উদয়চাঁদ রায় | প্রাণের হিসাব | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| একাধিক লেখক | তীর্থরেণু, তীর্থ-সলিল, পঞ্চরত্ন, পূর্ব্ববঙ্গ-গীতিকা, পূর্ব্ববঙ্গ-গীতিকা, বাংলা বানানের নিয়ম, হাজার বছরের পুরাণ বাঙ্গালা ভাষায় বৌদ্ধগান ও দোহা, মৈমনসিংহ গীতিকা, হারামণি | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| এনামূল হক পলাশ | অন্ধ সময়ের ডানা, জল ও হিজল, পাপের শহরে, মেঘের সন্ন্যাস, লাবণ্য দাশ অ্যাণ্ড কোং | left out | এনামূল হক পলাশ: a living author (born 1977, Wikidata). |
| কান্তিচন্দ্র সরকার | তামাকের দোষ গুণ ও ইতিহাস | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| কার্তিকচন্দ্র মিত্র | শিখগুরু | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| কালীকমল দত্ত | দুর্গাবতী | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| কৃষ্ণকিশোর বন্দ্যোপাধ্যায় | কবিতাকুসুমাঞ্জলি | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| কৃষ্ণদাস আচার্য চৌধুরী | ইঙ্গিত | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| কৃষ্ণদ্বৈপায়ন বেদব্যাস | কল্কি পুরাণ, মহাভারতীয় স্বপ্নপর্ব্ব | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| কেদারনাথ চক্রবর্তী | ভাওয়ালী কাণ্ড | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| কেশবচন্দ্র কুণ্ডু | কবিতা | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| কৈলাসবাসিনী দেবী | হিন্দু মহিলাগণের হীনাবস্থা | left out | কৈলাসবাসিনী দেবী: bn Wikipedia gives her death as '?' yet files her under 1895 deaths; nothing cited. |
| গোপালচন্দ্র বন্দ্যোপাধ্যায় | মানসাঙ্ক | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| চণ্ডীদাস মুখোপাধ্যায় | মূর্চ্ছনা | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| চারুশীলা দেবী | বেহুলা | left out | চারুশীলা দেবী (বেহুলা): two articles of this name (1883–?, 1882–1979); nothing ties either to this book. |
| জাতিসংঘ সাধারণ পরিষদ | অর্থনৈতিক, সামাজিক ও সাংস্কৃতিক অধিকার বিষয়ক আন্তর্জাতিক চুক্তি, নির্যাতন এবং অন্যান্য নিষ্ঠুর, অমানবিক অথবা মর্যাদাহানিকর আচরণ বা শাস্তির বিরুদ্ধে কনভেনশন, নারীর রাজনৈতিক অধিকার বিষয়ক চুক্তি, নারীর প্রতি সকল প্রকার বৈষম্য বিলোপ কনভেনশন, নাগরিক ও রাজনৈতিক অধিকার বিষয়ক আন্তর্জাতিক চুক্তি, নারীর রাজনৈতিক অধিকার বিষয়ক চুক্তি, মানবাধিকারের সার্বজনীন ঘোষণাপত্র | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| জীবনকৃষ্ণ ঘোষ | দুর্য্যোধন বধ কাব্য | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| জ্ঞানেন্দ্রমোহিনী দত্ত | ধূলিরাশি | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| তপোধীর ভট্টাচার্য | বাখতিন, সময় অসময় নিঃসময়, স্বপ্নের সোভিয়েতে | left out | তপোধীর ভট্টাচার্য: a living author (born 1949, bn Wikipedia). |
| তারানাথ রায় | নব্য চীন, মুসোলিনী ও বর্ত্তমান ইটালী | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| তারাপদ বন্দ্যোপাধ্যায় | দার্জ্জিলিঙ্গ-প্রবাসীর পত্র | left out | তারাপদ বন্দ্যোপাধ্যায় (দার্জ্জিলিঙ্গ-প্রবাসীর পত্র): the article of this name is a photographer (1946–2024), not this author. |
| দয়ালকৃষ্ণ ঘোষ | ম্যালেরিয়া | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| দীননাথ দাস চন্দ | ভারত দীধিতি | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| দেবেন্দ্রকিশোর আচার্য চৌধুরী | অহল্যা | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| নরেন্দ্রকৃষ্ণ চট্টোপাধ্যায় | শ্মশানের ফুল | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| নারায়ণচন্দ্র বিদ্যারত্ন | নীতিকণা | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| নিলমণি মুখোপাধ্যায় | ধারাপাত | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| নিশিকান্ত গঙ্গোপাধ্যায় | আমেরিকার স্বাধীনতা | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| পাঁচুলাল ঘোষ | আঙুর | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| পিনাকী ঘোষ | অলৌকিক নয়, লৌকিক | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| পিনাকী বিশ্বাস | সেই সব শহীদেরা | left out | পিনাকী বিশ্বাস: described on Wikidata as a Bangla Wikipedian; a contemporary author. |
| পুলিনবিহারী রায় | বিষাদ | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| প্রবোধচন্দ্র মৈত্র | পথের বাঁশী | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| প্রমথনাথ দত্ত | জননী-জন্মভূমি | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| বঙ্কিমবিহারী দাস | কুসুম-যুগল | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| বড় বাস্কী | সাঁওতালি পুরাণকথায় পৃথিবী ও মানব সৃষ্টি কাহিনি | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| বিনয় কুমার সান্যাল | চিদ্বিলাস | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| বিপিন বিহারী শাহ | নিনিবি শহরের রিহাই, বেহেস্তের বয়ান | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| বিভাবতী দেবী চৌধুরাণী | খোঁজে | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| ভূপেন্দ্রনাথ রায় চৌধুরী | পরের-মেয়ে, লক্ষ্মী | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| মণীন্দ্রনাথ সিংহ | বাসন্তিকা | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| মানদা দেবী | শিক্ষিতা পতিতার আত্মচরিত | left out | মানদা দেবী: Wikidata gives her birth (1900) but no source gives a death year. |
| যতীন্দ্রনাথ পাল | ধৰ্ম্মঘট | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| রণবীর পুরকায়স্থ | উনিশে মে: ভাষার সংকট | left out | রণবীর পুরকায়স্থ: born 1949 (Wikidata); a recent author. |
| রবীন্দ্রনাথ সেন | ডিগবাজী খাঁ | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| রামচন্দ্র মুখোপাধ্যায় | দানবদলন কাব্য | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| রাহাতুন্নেছা খাতুন | দেবী রাবিয়া | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| রোহিণীকুমার সেনগুপ্ত | প্রমোদবালা | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| শম্ভুচন্দ্র বিদ্যারত্ন | বিদ্যাসাগর জীবনচরিত | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| শিবচন্দ্র শীল | আর্য্যজাতির আদি নিবাস | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| সঞ্জীব দেবলস্কর | ষষ্ঠীতৎপুরুষনামা | left out | সঞ্জীব দেবলস্কর: born 1957 (Wikidata); a recent author. |
| সত্যচরণ মিত্র | বড়বউ | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| সত্যভূষণ বন্দ্যোপাধ্যায় | ১৫১৩ সাল | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| সরোজনাথ মুখোপাধ্যায় | শ্রীশ্রীকৃষ্ণকালী-পদাবলী | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| সারদাপ্রসাদ ঠাকুর | মুরলী | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| সুরঙ্গিণী দেবী | তারাচরিত | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| সুরেন্দ্রকৃষ্ণ গুপ্ত | ঝঙ্কার | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| সুরেন্দ্রনাথ বন্দ্যোপাধ্যায় | বিজ্ঞান বাবু | left out | সুরেন্দ্রনাথ বন্দ্যোপাধ্যায় (বিজ্ঞান বাবু): the only article of this name is the politician (1848–1925); nothing ties him to this book. |
| সুরেশচন্দ্র ঘটক | ত্রিবেণী ও আরো দুটী গল্প | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| সৌদামিনী সিংহ | নারী-চরিত | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| হরচন্দ্র সেন | শিশূপদেশ | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| হরিনাথ ঘোষ | লাল সিংহ | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| হরিমোহন কর্মকার | ওঠ্ ছুঁড়ী তোর বিয়ে | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| হরিলাল সরকার | চতুরঙ্গ | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| হরিশ্চন্দ্র শর্মা | জীবনরক্ষক, ব্যায়াম শিক্ষা | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| হরিহর নন্দী | কলির বৌ ঘরভাঙ্গনী | left out | no death year in Wikidata, bn/en Wikipedia or Banglapedia |
| হাসান ফকরী | দেশটা কি তোর বাপের | left out | হাসান ফকরী: a living author (born 1952, bn Wikipedia). |

## Not imported yet: no confirmed category

None: every work now has a category or was left out by decision.

## All prepared books by category (batches 1 and 2)

| Category | Works |
|---|---|
| `probondho` | 109 |
| `kobita` | 79 |
| `itihash-jiboni` | 57 |
| `uponnash` | 51 |
| `thriller-rohosso` | 42 |
| `chhotogolpo` | 38 |
| `natok` | 20 |
| `bhromon` | 13 |
| `shishu-sahitto` | 10 |
| `puran-lokkotha` | 8 |
| `biggan-kolpokahini` | 2 |

## Per author (batches 1 and 2)

| Author | Died | New books | Links for catalog books | Unclassified |
|---|---|---|---|---|
| রবীন্দ্রনাথ ঠাকুর | 1941 | 94 | 6 | 0 |
| প্রিয়নাথ মুখোপাধ্যায় | 1947 | 38 | 0 | 0 |
| বঙ্কিমচন্দ্র চট্টোপাধ্যায় | 1894 | 18 | 2 | 0 |
| ঈশ্বরচন্দ্র বিদ্যাসাগর | 1891 | 14 | 0 | 0 |
| রাজশেখর বসু | 1960 | 12 | 0 | 0 |
| মাইকেল মধুসূদন দত্ত | 1873 | 10 | 0 | 0 |
| শরৎচন্দ্র চট্টোপাধ্যায় | 1938 | 6 | 3 | 0 |
| অবনীন্দ্রনাথ ঠাকুর | 1951 | 8 | 0 | 0 |
| প্রসাদদাস রায় | 1963 | 7 | 0 | 0 |
| বিভূতিভূষণ বন্দ্যোপাধ্যায় | 1950 | 5 | 0 | 0 |
| ব্রজেন্দ্রনাথ বন্দ্যোপাধ্যায় | 1952 | 5 | 0 | 0 |
| হেমচন্দ্র বন্দ্যোপাধ্যায় | 1903 | 5 | 0 | 0 |
| দীনেশচন্দ্র সেন | 1939 | 4 | 0 | 0 |
| মানিক বন্দ্যোপাধ্যায় | 1956 | 3 | 1 | 0 |
| স্বর্ণকুমারী দেবী | 1932 | 4 | 0 | 0 |
| স্বামী বিবেকানন্দ | 1902 | 4 | 0 | 0 |
| জুল ভার্ন | 1905 | 3 | 0 | 0 |
| দেবেন্দ্রনাথ ঠাকুর | 1905 | 3 | 0 | 0 |
| প্রফুল্লচন্দ্র রায় | 1944 | 3 | 0 | 0 |
| রজনীকান্ত সেন | 1910 | 3 | 0 | 0 |
| রাখালদাস বন্দ্যোপাধ্যায় | 1930 | 3 | 0 | 0 |
| রাজনারায়ণ বসু | 1899 | 3 | 0 | 0 |
| রামনাথ বিশ্বাস | 1955 | 3 | 0 | 0 |
| সখারাম গণেশ দেউস্কর | 1912 | 3 | 0 | 0 |
| হেমলতা দেবী | 1943 | 3 | 0 | 0 |
| অক্ষয়কুমার মৈত্রেয় | 1930 | 2 | 0 | 0 |
| অজিতকুমার চক্রবর্তী | 1918 | 2 | 0 | 0 |
| অনুরূপা দেবী | 1958 | 2 | 0 | 0 |
| আশুতোষ মুখোপাধ্যায় | 1924 | 2 | 0 | 0 |
| ইন্দিরা দেবী | 1939 | 2 | 0 | 0 |
| উপেন্দ্রকিশোর রায়চৌধুরী | 1915 | 2 | 0 | 0 |
| গগনেন্দ্রনাথ ঠাকুর | 1938 | 2 | 0 | 0 |
| চারুচন্দ্র বন্দ্যোপাধ্যায় | 1938 | 2 | 0 | 0 |
| চারুচন্দ্র ভট্টাচার্য | 1961 | 2 | 0 | 0 |
| চিত্তরঞ্জন দাশ | 1925 | 2 | 0 | 0 |
| জগদানন্দ রায় | 1933 | 2 | 0 | 0 |
| জলধর সেন | 1939 | 2 | 0 | 0 |
| জীবনানন্দ দাশ | 1954 | 1 | 1 | 0 |
| প্যারীচাঁদ মিত্র | 1883 | 1 | 1 | 0 |
| প্রবোধচন্দ্র বাগচী | 1956 | 2 | 0 | 0 |
| প্রমথ চৌধুরী | 1946 | 2 | 0 | 0 |
| রজনীকান্ত গুপ্ত | 1900 | 2 | 0 | 0 |
| রমেশচন্দ্র দত্ত | 1909 | 2 | 0 | 0 |
| শামসুন নাহার মাহমুদ | 1964 | 2 | 0 | 0 |
| শিবনাথ শাস্ত্রী | 1919 | 2 | 0 | 0 |
| সত্যেন্দ্রনাথ মজুমদার | 1954 | 2 | 0 | 0 |
| সুকান্ত ভট্টাচার্য | 1947 | 1 | 1 | 0 |
| সুনির্মল বসু | 1957 | 2 | 0 | 0 |
| অক্ষয়কুমার দত্ত | 1886 | 1 | 0 | 0 |
| অক্ষয়চন্দ্র সরকার | 1917 | 1 | 0 | 0 |
| অদ্বৈত মল্লবর্মণ | 1951 | 0 | 1 | 0 |
| অধরলাল সেন | 1885 | 1 | 0 | 0 |
| অনাথনাথ বসু | 1935 | 1 | 0 | 0 |
| অমলেন্দু দাশগুপ্ত | 1955 | 1 | 0 | 0 |
| অরবিন্দ ঘোষ | 1950 | 1 | 0 | 0 |
| অশ্বঘোষ | 150 | 1 | 0 | 0 |
| আঁদ্রে শেভ্রিয়োঁ | 1957 | 1 | 0 | 0 |
| আররিয়ানোস | 180 | 1 | 0 | 0 |
| আলফ্রেড টেনিসন | 1892 | 1 | 0 | 0 |
| ইন্দিরা দেবী চৌধুরানী | 1960 | 1 | 0 | 0 |
| ইন্দুমাধব মল্লিক | 1917 | 1 | 0 | 0 |
| ঈসপ | -564 | 1 | 0 | 0 |
| উইলিয়াম কেরি | 1834 | 1 | 0 | 0 |
| উমাকান্ত হাজারী | 1955 | 1 | 0 | 0 |
| উমেশচন্দ্র দত্ত | 1907 | 1 | 0 | 0 |
| ওমর খৈয়াম | 1131 | 1 | 0 | 0 |
| ঔরঙ্গজেব | 1707 | 1 | 0 | 0 |
| কনকভূষণ মুখোপাধ্যায় | 1945 | 1 | 0 | 0 |
| কালীপ্রসন্ন ঘোষ | 1910 | 1 | 0 | 0 |
| কালীপ্রসন্ন বিদ্যারত্ন | 1924 | 1 | 0 | 0 |
| কালীপ্রসন্ন সিংহ | 1870 | 1 | 0 | 0 |
| কালীময় ঘটক | 1900 | 1 | 0 | 0 |
| কুমুদিনী বসু | 1943 | 1 | 0 | 0 |
| কুমুদিনী মিত্র | 1943 | 1 | 0 | 0 |
| কৃষ্ণপ্রসন্ন সেন | 1902 | 1 | 0 | 0 |
| কৃষ্ণেন্দ্র রায় | 1898 | 1 | 0 | 0 |
| ক্ষিতিমোহন সেন | 1960 | 1 | 0 | 0 |
| গিরিশচন্দ্র ঘোষ | 1912 | 1 | 0 | 0 |
| গিরীন্দ্রমোহিনী দাসী | 1924 | 1 | 0 | 0 |
| গিরীন্দ্রশেখর বসু | 1953 | 1 | 0 | 0 |
| গুরুনাথ সেনগুপ্ত | 1914 | 1 | 0 | 0 |
| গোকুলচন্দ্র নাগ | 1925 | 1 | 0 | 0 |
| গোলাম মোস্তফা | 1964 | 1 | 0 | 0 |
| চন্দ্রনাথ বসু | 1910 | 1 | 0 | 0 |
| চার্লস ল্যাম্ব ও মেরী ল্যাম্ব | 1847 | 1 | 0 | 0 |
| জওহরলাল নেহরু | 1964 | 1 | 0 | 0 |
| জগদীশচন্দ্র বসু | 1937 | 1 | 0 | 0 |
| জন ক্লার্ক মার্শম্যান | 1877 | 1 | 0 | 0 |
| জয়দেব | 1245 | 1 | 0 | 0 |
| জ্ঞানদানন্দিনী দেবী | 1941 | 1 | 0 | 0 |
| জ্যোতিরিন্দ্রনাথ ঠাকুর | 1925 | 1 | 0 | 0 |
| ত্রৈলোক্যনাথ মুখোপাধ্যায় | 1919 | 1 | 0 | 0 |
| দীনবন্ধু মিত্র | 1873 | 1 | 0 | 0 |
| দীনেন্দ্রকুমার রায় | 1943 | 1 | 0 | 0 |
| দীনেশরঞ্জন দাশ | 1941 | 1 | 0 | 0 |
| দ্বারকানাথ বিদ্যাভূষণ | 1886 | 1 | 0 | 0 |
| দ্বিজেন্দ্রলাল রায় | 1913 | 1 | 0 | 0 |
| নগেন্দ্রনাথ গুপ্ত | 1940 | 1 | 0 | 0 |
| নবীনচন্দ্র সেন | 1909 | 1 | 0 | 0 |
| নারায়ণচন্দ্র ভট্টাচার্য | 1927 | 1 | 0 | 0 |
| নৃপেন্দ্রকৃষ্ণ চট্টোপাধ্যায় | 1963 | 1 | 0 | 0 |
| পঞ্চানন ভট্টাচার্য | 1919 | 1 | 0 | 0 |
| পরমেশপ্রসন্ন রায় | 1927 | 1 | 0 | 0 |
| পিয়ের লোতি | 1923 | 1 | 0 | 0 |
| প্রফুল্লকুমার সরকার | 1944 | 1 | 0 | 0 |
| প্রিয়দর্শন হালদার | 1928 | 1 | 0 | 0 |
| প্রিয়নাথ চক্রবর্তী | 1908 | 1 | 0 | 0 |
| বাণভট্ট ও ভূষণভট্ট | 800 | 1 | 0 | 0 |
| বারীন্দ্রকুমার ঘোষ | 1959 | 1 | 0 | 0 |
| বাল্মীকি | 300 | 1 | 0 | 0 |
| বিজয়কৃষ্ণ গোস্বামী | 1899 | 1 | 0 | 0 |
| বিজয়চন্দ্র মজুমদার | 1942 | 1 | 0 | 0 |
| বিনোদিনী দাসী | 1941 | 1 | 0 | 0 |
| বিপিনচন্দ্র পাল | 1932 | 1 | 0 | 0 |
| বিহারীলাল চক্রবর্তী | 1894 | 1 | 0 | 0 |
| বুকার টালিয়াফেরো ওয়াশিংটন | 1915 | 1 | 0 | 0 |
| ব্রহ্মবান্ধব উপাধ্যায় | 1907 | 1 | 0 | 0 |
| ভানুদত্ত মিশ্র | 1600 | 1 | 0 | 0 |
| ভারতচন্দ্র রায় | 1760 | 1 | 0 | 0 |
| ভুজঙ্গধর রায়চৌধুরী | 1940 | 1 | 0 | 0 |
| ভূদেব মুখোপাধ্যায় | 1894 | 1 | 0 | 0 |
| ভূপেন্দ্রনাথ দত্ত | 1961 | 1 | 0 | 0 |
| মণিলাল গঙ্গোপাধ্যায় | 1929 | 1 | 0 | 0 |
| মন্মথমোহন বসু | 1959 | 1 | 0 | 0 |
| মাউন্টফোর্ড জোসেফ ব্রমলি | 1837 | 1 | 0 | 0 |
| মাখনলাল রায়চৌধুরী | 1962 | 1 | 0 | 0 |
| মার্কাস অরিলিয়স | 180 | 1 | 0 | 0 |
| মুহম্মদ ইকবাল | 1938 | 1 | 0 | 0 |
| মেগাস্থিনিস | -290 | 1 | 0 | 0 |
| মোহনদাস করমচাঁদ গান্ধী | 1948 | 1 | 0 | 0 |
| মোহিতলাল মজুমদার | 1952 | 1 | 0 | 0 |
| ম্যাক্সিম গোর্কি | 1936 | 1 | 0 | 0 |
| যতীন্দ্রমোহন সেনগুপ্ত | 1952 | 1 | 0 | 0 |
| যদুনাথ মজুমদার | 1932 | 1 | 0 | 0 |
| যোগীন্দ্রনাথ সরকার | 1937 | 1 | 0 | 0 |
| যোগেন্দ্রনাথ বন্দ্যোপাধ্যায় | 1904 | 1 | 0 | 0 |
| রঙ্গলাল বন্দ্যোপাধ্যায় | 1887 | 1 | 0 | 0 |
| রবীন্দ্রনাথ মৈত্র | 1933 | 1 | 0 | 0 |
| রমাপ্রসাদ চন্দ | 1942 | 1 | 0 | 0 |
| রসময় লাহা | 1928 | 1 | 0 | 0 |
| রাজমোহন নাথ | 1965 | 1 | 0 | 0 |
| রাজীবলোচন মুখোপাধ্যায় | 1900 | 1 | 0 | 0 |
| রাজেন্দ্রনাথ বিদ্যাভূষণ | 1935 | 1 | 0 | 0 |
| রাধানাথ মিত্র | 1921 | 1 | 0 | 0 |
| রামেন্দ্রসুন্দর ত্রিবেদী | 1919 | 1 | 0 | 0 |
| রেনে মারাঁ | 1960 | 1 | 0 | 0 |
| লাল্লু লাল | 1825 | 1 | 0 | 0 |
| ল্যেভ তলস্তোয় | 1910 | 1 | 0 | 0 |
| শ্যামাপ্রসাদ মুখোপাধ্যায় | 1953 | 1 | 0 | 0 |
| সঞ্জীবচন্দ্র চট্টোপাধ্যায় | 1889 | 1 | 0 | 0 |
| সতীশচন্দ্র রায় | 1904 | 1 | 0 | 0 |
| সত্যচরণ শাস্ত্রী | 1935 | 1 | 0 | 0 |
| সত্যেন্দ্রনাথ ঠাকুর | 1923 | 1 | 0 | 0 |
| সত্যেন্দ্রনাথ দত্ত | 1922 | 1 | 0 | 0 |
| সমরেন্দ্রচন্দ্র দেববর্মণ | 1935 | 1 | 0 | 0 |
| সরলাবালা সরকার | 1961 | 1 | 0 | 0 |
| সুকুমার রায় | 1923 | 1 | 0 | 0 |
| সুনীতি দেবী | 1932 | 1 | 0 | 0 |
| সুভাষচন্দ্র বসু | 1945 | 1 | 0 | 0 |
| সুরেন্দ্রনাথ ঠাকুর | 1940 | 1 | 0 | 0 |
| সুরেন্দ্রনাথ দাশগুপ্ত | 1952 | 1 | 0 | 0 |
| সুরেশচন্দ্র চক্রবর্তী | 1951 | 1 | 0 | 0 |
| সুরেশচন্দ্র বন্দ্যোপাধ্যায় | 1941 | 1 | 0 | 0 |
| সুশীলকুমার বসু | 1945 | 1 | 0 | 0 |
| সৈয়দ ইসমাইল হোসেন সিরাজী | 1931 | 1 | 0 | 0 |
| হরপ্রসাদ শাস্ত্রী | 1931 | 1 | 0 | 0 |
| হরিশচন্দ্র মিত্র | 1872 | 1 | 0 | 0 |
| হরিসাধন মুখোপাধ্যায় | 1938 | 1 | 0 | 0 |
| হানা ক্যাথেরিন মুলেন্স | 1861 | 1 | 0 | 0 |
| হানা রোসেলি হিগেন্স | 1940 | 1 | 0 | 0 |
| হেমেন্দ্রপ্রসাদ ঘোষ | 1962 | 1 | 0 | 0 |

## Excluded, by reason

| Reason | Works |
|---|---|
| author's death year is not on Wikidata | 79 |
| not a literary book | 28 |
| anonymous, or no author on Wikidata | 24 |
| another edition of the same work | 19 |
| author died in YYYY, after YYYY | 15 |
| translation with no named translator | 12 |
| author is an organisation, not a person | 11 |
| translator's death year is not on Wikidata | 10 |
| first publication date unknown, and the scanned edition was printed in YYYY, after the death of its author | 3 |
| translator died in YYYY, after YYYY | 2 |
| editor's death year is not on Wikidata | 1 |
| left out by decision , not a book of its own | 1 |
| not in Bangla | 1 |
| the scan has no Wikidata item | 1 |

Every excluded scan, with its exact reason, is listed at the end and in `data/wikisource-excluded.json`.

## Batch 2 titles romanised by the script (please check)

- প্রেমিক সন্ন্যাসী → Premik Sannyasi
- ভয়ভাঙ্গা → Bhayabhanga
- মোহনলাল → Mohanalal
- গুরুদক্ষিণা → Gurudakshina

## Spot-checks

Live re-checks of a random sample, not from the import's cache: batch 1 in `data/wikisource-spot-check-1.md`, batch 2 in `data/wikisource-spot-check-2.md` (`scripts/wikisource-spot-check.ts 2`).

## Every excluded scan

| Work | Author | Scan | Reason |
|---|---|---|---|
| ১৯০৫ সালে বাংলা | — | ১৯০৫ সালে বাংলা.pdf | anonymous, or no author on Wikidata |
| উত্তম পাকিস্তানী | — | উত্তম পাকিস্তানী (১৯৬৫).pdf | anonymous, or no author on Wikidata |
| বাংলাদেশের সংবিধান | — | গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধান.djvu | anonymous, or no author on Wikidata |
| গোপীচন্দ্রের গান | — | গোপীচন্দ্রের গান.pdf | anonymous, or no author on Wikidata |
| গোপীচন্দ্রের গান | — | গোপীচন্দ্র (দ্বিতীয় খণ্ড) - দীনেশচন্দ্র সেন.pdf | anonymous, or no author on Wikidata |
| রুকাভিচকা | — | দাদুর দস্তানা - শঙ্কর রায় (১৯৫৫).pdf | anonymous, or no author on Wikidata |
| নাট্য-বিকার | — | নাট্য-বিকার.pdf | anonymous, or no author on Wikidata |
| ধম্মপদ | — | ধম্মপদ - সতীশচন্দ্র মিত্র.pdf | anonymous, or no author on Wikidata |
| পাণ্ডব গীতা | — | পাণ্ডব গীতা.djvu | anonymous, or no author on Wikidata |
| প্রবাদমালা | — | প্রবাদমালা.pdf | anonymous, or no author on Wikidata |
| প্রবাদ মালা | — | প্রবাদ মালা - কে. কে. জি. সরকার.pdf | anonymous, or no author on Wikidata |
| পূর্ববঙ্গ ও হিন্দু সমাজ | — | পূর্ববঙ্গ ও হিন্দু সমাজ.pdf | anonymous, or no author on Wikidata |
| পূর্ব পাকিস্তানে কৃষি | — | পূর্ব পাকিস্তানে কৃষি.pdf | anonymous, or no author on Wikidata |
| পূর্ব পাকিস্তানে শিক্ষা | — | পূর্ব পাকিস্তানে শিক্ষা.pdf | anonymous, or no author on Wikidata |
| পূর্ব পাকিস্তানে বেতার | — | পূর্ব পাকিস্তানে বেতার.pdf | anonymous, or no author on Wikidata |
| বেতাল পঞ্চবিংশতি | — | বেতালপঞ্চবিংশতি.pdf | anonymous, or no author on Wikidata |
| বৈজ্ঞানিক-পরিভাষা (পদার্থ-বিদ্যা) | — | বৈজ্ঞানিক-পরিভাষা (পদার্থ-বিদ্যা).pdf | anonymous, or no author on Wikidata |
| বৈজ্ঞানিক পরিভাষা (প্রাণিবিদ্যা) | — | বৈজ্ঞানিক পরিভাষা (প্রাণিবিদ্যা).pdf | anonymous, or no author on Wikidata |
| বৈজ্ঞানিক পরিভাষা (উদ্ভিদ্‌বিদ্যা) | — | বৈজ্ঞানিক পরিভাষা (উদ্ভিদ্‌বিদ্যা).pdf | anonymous, or no author on Wikidata |
| ভূগোল সার | — | ভূগোল সার.djvu | anonymous, or no author on Wikidata |
| মিল্টনের জীবন চরিত | — | মিল্টনের জীবন চরিত.pdf | anonymous, or no author on Wikidata |
| মাতৃ-স্নেহ ও ঈশ-স্তুতি | — | মাতৃ-স্নেহ ও ঈশ-স্তুতি.pdf | anonymous, or no author on Wikidata |
| সাক্ষী | — | সাক্ষী অর্থাৎ শ্রীকেশবচন্দ্র সেনের প্রকৃত ছবি (১৯১৪).pdf | anonymous, or no author on Wikidata |
| হেঁয়ালি (প্রথম ভাগ) | — | হেঁয়ালি (প্রথম ভাগ, ১৮৭৫).pdf | anonymous, or no author on Wikidata |
| আখ্যানমঞ্জরী | ঈশ্বরচন্দ্র বিদ্যাসাগর | আখ্যানমঞ্জরী (প্রথম ভাগ) - ঈশ্বরচন্দ্র বিদ্যাসাগর.pdf | another edition of the same work (kept আখ্যানমঞ্জরী (দ্বিতীয় ভাগ) - ঈশ্বরচন্দ্র বিদ্যাসাগর.pdf) |
| আখ্যানমঞ্জরী | ঈশ্বরচন্দ্র বিদ্যাসাগর | আখ্যানমঞ্জরী (তৃতীয় ভাগ) - ঈশ্বরচন্দ্র বিদ্যাসাগর.pdf | another edition of the same work (kept আখ্যানমঞ্জরী (দ্বিতীয় ভাগ) - ঈশ্বরচন্দ্র বিদ্যাসাগর.pdf) |
| আনন্দমঠ | বঙ্কিমচন্দ্র চট্টোপাধ্যায় | আনন্দমঠ (দ্বিতীয় সংস্করণ, ১৮৮৩).djvu | another edition of the same work (kept আনন্দমঠ - বঙ্কিমচন্দ্র চট্টোপাধ্যায়.djvu) |
| কথা | রবীন্দ্রনাথ ঠাকুর | কথা - রবীন্দ্রনাথ ঠাকুর.pdf | another edition of the same work (kept কথা-রবীন্দ্রনাথ ঠাকুর.djvu) |
| গল্পগুচ্ছ | রবীন্দ্রনাথ ঠাকুর | গল্পগুচ্ছ (তৃতীয় খণ্ড).djvu | another edition of the same work (kept গল্পগুচ্ছ (প্রথম খণ্ড).djvu) |
| গীতাঞ্জলি | রবীন্দ্রনাথ ঠাকুর | Original manuscript of Gitanjali - Rabindranath Tagore - Rothenstein collection.pdf | another edition of the same work (kept গীতাঞ্জলি - রবীন্দ্রনাথ ঠাকুর.djvu) |
| ঘর-পোড়া লোক | প্রিয়নাথ মুখোপাধ্যায় | ঘর-পোড়া লোক (মধ্যম অংশ) - প্রিয়নাথ মুখোপাধ্যায়.pdf | another edition of the same work (kept ঘর-পোড়া লোক (শেষ অংশ) - প্রিয়নাথ মুখোপাধ্যায়.pdf) |
| ঘর-পোড়া লোক | প্রিয়নাথ মুখোপাধ্যায় | ঘর-পোড়া লোক (প্রথম অংশ) - প্রিয়নাথ মুখোপাধ্যায়.pdf | another edition of the same work (kept ঘর-পোড়া লোক (শেষ অংশ) - প্রিয়নাথ মুখোপাধ্যায়.pdf) |
| জাপান-যাত্রী | রবীন্দ্রনাথ ঠাকুর | জাপান-যাত্রী - রবীন্দ্রনাথ ঠাকুর.pdf | another edition of the same work (kept জাপানে-পারস্যে-রবীন্দ্রনাথ ঠাকুর.pdf) |
| বর্ণপরিচয় | ঈশ্বরচন্দ্র বিদ্যাসাগর | বর্ণপরিচয় - প্রথম ভাগ - ঈশ্বরচন্দ্র বিদ্যাসাগর (৬২তম সংস্করণ).pdf | another edition of the same work (kept বর্ণপরিচয় - দ্বিতীয় ভাগ - ঈশ্বরচন্দ্র বিদ্যাসাগর (৬১তম সংস্করণ).pdf) |
| ভ্রান্তিবিলাস | ঈশ্বরচন্দ্র বিদ্যাসাগর | ভ্রান্তিবিলাস - ঈশ্বরচন্দ্র বিদ্যাসাগর (১৮৯০).pdf | another edition of the same work (kept ভ্রান্তিবিলাস.djvu) |
| মণিপুরের সেনাপতি | প্রিয়নাথ মুখোপাধ্যায় | মণিপুরের সেনাপতি (শেষ অংশ) - প্রিয়নাথ মুখোপাধ্যায়.pdf | another edition of the same work (kept মণিপুরের সেনাপতি (দ্বিতীয় অংশ) - প্রিয়নাথ মুখোপাধ্যায়.pdf) |
| রাজা সাহেব | প্রিয়নাথ মুখোপাধ্যায় | রাজা সাহেব (৩য় অংশ) - প্রিয়নাথ মুখোপাধ্যায়.pdf | another edition of the same work (kept রাজা সাহেব (১ম অংশ) - প্রিয়নাথ মুখোপাধ্যায়.pdf) |
| রাণী না খুনি? | প্রিয়নাথ মুখোপাধ্যায় | রাণী না খুনি? (প্রথম অংশ) - প্রিয়নাথ মুখোপাধ্যায়.pdf | another edition of the same work (kept রাণী না খুনি? (শেষ অংশ) - প্রিয়নাথ মুখোপাধ্যায়.pdf) |
| শকুন্তলা | অবনীন্দ্রনাথ ঠাকুর | শকুন্তলা (সিগনেট প্রেস সংস্করণ).djvu | another edition of the same work (kept শকুন্তলা (আদি ব্রাহ্মসমাজ সংস্করণ).djvu) |
| শকুন্তলা | ঈশ্বরচন্দ্র বিদ্যাসাগর | শকুন্তলা - ঈশ্বরচন্দ্র বিদ্যাসাগর (১৮৭৫).pdf | another edition of the same work (kept শকুন্তলা (ঈশ্বরচন্দ্র বিদ্যাসাগর).djvu) |
| শরৎ-সাহিত্য-সংগ্রহ | শরৎচন্দ্র চট্টোপাধ্যায় | শরৎ-সাহিত্য-সংগ্রহ (দশম সম্ভার) - শরৎচন্দ্র চট্টোপাধ্যায় (১৯৫৬).pdf | another edition of the same work (kept শরৎ-সাহিত্য-সংগ্রহ (ত্রয়োদশ সম্ভার) - শরৎচন্দ্র চট্টোপাধ্যায় (১৯৬০).pdf) |
| শরৎ-সাহিত্য-সংগ্রহ | শরৎচন্দ্র চট্টোপাধ্যায় | শরৎ-সাহিত্য-সংগ্রহ (পঞ্চম সম্ভার) - শরৎচন্দ্র চট্টোপাধ্যায় (১৯৫৪).pdf | another edition of the same work (kept শরৎ-সাহিত্য-সংগ্রহ (ত্রয়োদশ সম্ভার) - শরৎচন্দ্র চট্টোপাধ্যায় (১৯৬০).pdf) |
| শেষ লেখা | রবীন্দ্রনাথ ঠাকুর | শেষ লেখা - রবীন্দ্রনাথ ঠাকুর (১৯৫৬).pdf | another edition of the same work (kept শেষ লেখা - রবীন্দ্রনাথ ঠাকুর (১৯৪২).pdf) |
| নজরুলকে যেমন দেখেছি | শামসুন নাহার মাহমুদ ও হবীবুল্লাহ বাহার চৌধুরী | নজরুলকে যেমন দেখেছি - শামসুন নাহার (১৯৫৮).pdf | author died in 1966, after 1965 (হবীবুল্লাহ বাহার চৌধুরী) |
| দুনিয়ার দেনা | হেমলতা দেবী | দুনিয়ার দেনা - হেমলতা দেবী.pdf | author died in 1967, after 1965 (হেমলতা দেবী) |
| গল্পের বই | সুখলতা রাও | গল্পের বই - সুখলতা রাও.pdf | author died in 1969, after 1965 (সুখলতা রাও) |
| বন-তুলসী | কুমুদরঞ্জন মল্লিক | বন-তুলসী - কুমুদরঞ্জন মল্লিক (১৯১১).pdf | author died in 1970, after 1965 (কুমুদরঞ্জন মল্লিক) |
| লক্ষ্মী মা | বিধুভূষণ বসু | লক্ষ্মী-মা - বিধুভূষণ বসু (১৯১০).pdf | author died in 1972, after 1965 (বিধুভূষণ বসু) |
| লক্ষ্মী-মেয়ে | বিধুভূষণ বসু | লক্ষ্মী-মেয়ে - বিধুভূষণ বসু (১৯১২).pdf | author died in 1972, after 1965 (বিধুভূষণ বসু) |
| মৃতের কথোপকথন | নলিনীকান্ত গুপ্ত | মৃতের কথোপকথন - নলিনীকান্ত গুপ্ত.pdf | author died in 1983, after 1965 (নলিনীকান্ত গুপ্ত) |
| পাখীর কথা | সত্যচরণ লাহা | পাখীর কথা - সত্যচরণ লাহা.pdf | author died in 1984, after 1965 (সত্যচরণ লাহা) |
| কল্লু'স ওয়ার্ল্ড (ইন বিগ ট্রাবল এগেইন!) | সুভদ্রা সেনগুপ্ত | কল্লুর জগৎ ১ - ঘোর প্যাঁচ আর গণ্ডগোল.pdf | author died in 2021, after 1965 (সুভদ্রা সেনগুপ্ত) |
| কল্লু'স ওয়ার্ল্ড (মাঙ্কি বিজনেস অন স্টেজ) | সুভদ্রা সেনগুপ্ত | কল্লুর জগৎ ২ - মঞ্চে চড়ে মস্করা.pdf | author died in 2021, after 1965 (সুভদ্রা সেনগুপ্ত) |
| অলৌকিক নয়, লৌকিক | প্রবীর ঘোষ | অলৌকিক নয় লৌকিক (প্রথম খণ্ড) - প্রবীর ঘোষ.pdf | author died in 2023, after 1965 (প্রবীর ঘোষ) |
| অলৌকিক নয়, লৌকিক | প্রবীর ঘোষ | অলৌকিক নয়, লৌকিক (দ্বিতীয় খণ্ড) - প্রবীর ঘোষ.pdf | author died in 2023, after 1965 (প্রবীর ঘোষ) |
| আমি কেন ঈশ্বরে বিশ্বাস করি না | প্রবীর ঘোষ | আমি কেন ঈশ্বরে বিশ্বাস করিনা - প্রবীর ঘোষ.pdf | author died in 2023, after 1965 (প্রবীর ঘোষ) |
| অলৌকিক নয়, লৌকিক | প্রবীর ঘোষ ও পিনাকী ঘোষ | অলৌকিক নয়, লৌকিক (তৃতীয় খণ্ড) - প্রবীর ঘোষ.pdf | author died in 2023, after 1965 (প্রবীর ঘোষ) |
| পিটিং পিপল এগেনস্ট নেচার | মাধব গাডগিল | প্রকৃতি বনাম মানুষঃ একটি পরিকল্পিত সংঘাত - মাধব গাডগিল.pdf | author died in 2026, after 1965 (মাধব গাডগিল) |
| তীর্থরেণু | একাধিক লেখক | তীর্থরেণু.djvu | author is an organisation, not a person |
| তীর্থ-সলিল | একাধিক লেখক | তীর্থ-সলিল - সত্যেন্দ্রনাথ দত্ত (১৯০৮).pdf | author is an organisation, not a person |
| পঞ্চরত্ন | একাধিক লেখক | পঞ্চরত্ন - রাখালদাস মুখোপাধ্যায় (১৯১৪).pdf | author is an organisation, not a person |
| পূর্ব্ববঙ্গ-গীতিকা | একাধিক লেখক | পুর্ব্ববঙ্গ গীতিকা (দ্বিতীয় খণ্ড দ্বিতীয় সংখ্যা) - দীনেশচন্দ্র সেন.pdf | author is an organisation, not a person |
| পূর্ব্ববঙ্গ-গীতিকা | একাধিক লেখক | পুর্ব্ববঙ্গ গীতিকা (চতুর্থ খণ্ড) - দীনেশচন্দ্র সেন.pdf | author is an organisation, not a person |
| বাংলা বানানের নিয়ম | একাধিক লেখক | বাংলা বানানের নিয়ম (তৃতীয় সংস্করণ) - কলকাতা বিশ্ববিদ্যালয়.pdf | author is an organisation, not a person |
| হাজার বছরের পুরাণ বাঙ্গালা ভাষায় বৌদ্ধগান ও দোহা | একাধিক লেখক | বৌদ্ধগান ও দোহা.djvu | author is an organisation, not a person |
| মৈমনসিংহ গীতিকা | একাধিক লেখক | মৈমনসিংহ গীতিকা (প্রথম খণ্ড) - দীনেশচন্দ্র সেন.pdf | author is an organisation, not a person |
| হারামণি | একাধিক লেখক | হারামণি - মুহম্মদ মনসুর উদ্দীন.pdf | author is an organisation, not a person |
| কল্কি পুরাণ | কৃষ্ণদ্বৈপায়ন বেদব্যাস | কল্কিপুরাণ (ভুবনচন্দ্র বসাক).pdf | author is an organisation, not a person |
| মহাভারতীয় স্বপ্নপর্ব্ব | কৃষ্ণদ্বৈপায়ন বেদব্যাস | মহাভারতীয় স্বপ্নপর্ব্ব - কাশীরাম দাস.pdf | author is an organisation, not a person |
| জার্ম্মানীর যৌবন অভিযান | অজিৎকুমার মুখোপাধ্যায় | জার্ম্মানীর যৌবন অভিযান - অজিৎকুমার মুখোপাধ্যায় (১৯২৮).pdf | author's death year is not on Wikidata (অজিৎকুমার মুখোপাধ্যায়) |
| সচিত্র রেল অবতার | অনাথবন্ধু সেন | সচিত্র রেল অবতার - অনাথবন্ধু সেন.pdf | author's death year is not on Wikidata (অনাথবন্ধু সেন) |
| মনোরম্য ইতিহাস | অভয়চরণ দাস | মনোরম্য ইতিহাস.djvu | author's death year is not on Wikidata (অভয়চরণ দাস) |
| এখানে দিনের রং বদলায় | আশিসরঞ্জন নাথ | এখানে দিনের রং বদলায় - আশিসরঞ্জন নাথ (২০২৪).pdf | author's death year is not on Wikidata (আশিসরঞ্জন নাথ) |
| বীরজয় উপাখ্যান | আশুতোষ বিশ্বাস | বীরজয় উপাখ্যান.pdf | author's death year is not on Wikidata (আশুতোষ বিশ্বাস) |
| প্রমোদকামিনী কাব্য | আশুতোষ মুখোপাধ্যায় | প্রমোদকামিনী কাব্য.pdf | author's death year is not on Wikidata (আশুতোষ মুখোপাধ্যায়) |
| প্রাণের হিসাব | উদয়চাঁদ রায় | প্রাণের হিসাব (তৃতীয় খণ্ড) - উদয় চাঁদ রায় (১৯২৩).pdf | author's death year is not on Wikidata (উদয়চাঁদ রায়) |
| অন্ধ সময়ের ডানা | এনামূল হক পলাশ | অন্ধ সময়ের ডানা - এনামূল হক পলাশ (২০১৬).pdf | author's death year is not on Wikidata (এনামূল হক পলাশ) |
| জল ও হিজল | এনামূল হক পলাশ | জল ও হিজল - এনামূল হক পলাশ (২০১৯).pdf | author's death year is not on Wikidata (এনামূল হক পলাশ) |
| পাপের শহরে | এনামূল হক পলাশ | পাপের শহরে - এনামূল হক পলাশ (২০১৮).pdf | author's death year is not on Wikidata (এনামূল হক পলাশ) |
| মেঘের সন্ন্যাস | এনামূল হক পলাশ | মেঘের সন্ন্যাস - এনামূল হক পলাশ (২০১৭).pdf | author's death year is not on Wikidata (এনামূল হক পলাশ) |
| লাবণ্য দাশ অ্যাণ্ড কোং | এনামূল হক পলাশ | লাবণ্য দাশ অ্যান্ড কোং - এনামূল হক পলাশ (২০২২).pdf | author's death year is not on Wikidata (এনামূল হক পলাশ) |
| তামাকের দোষ গুণ ও ইতিহাস | কান্তিচন্দ্র সরকার | তামাকের দোষ গুণ ও ইতিহাস.pdf | author's death year is not on Wikidata (কান্তিচন্দ্র সরকার) |
| শিখগুরু | কার্তিকচন্দ্র মিত্র | শিখগুরু - কার্তিকচন্দ্র মিত্র (১৯২২).pdf | author's death year is not on Wikidata (কার্তিকচন্দ্র মিত্র) |
| দুর্গাবতী | কালীকমল দত্ত | দুর্গাবতী - কালীকমল দত্ত (১৮৮৮).pdf | author's death year is not on Wikidata (কালীকমল দত্ত) |
| কবিতাকুসুমাঞ্জলি | কৃষ্ণকিশোর বন্দ্যোপাধ্যায় | কবিতাকুসুমাঞ্জলি.pdf | author's death year is not on Wikidata (কৃষ্ণকিশোর বন্দ্যোপাধ্যায়) |
| ইঙ্গিত | কৃষ্ণদাস আচার্য চৌধুরী | ইঙ্গিত - কৃষ্ণদাস আচার্য্য চৌধুরী.pdf | author's death year is not on Wikidata (কৃষ্ণদাস আচার্য চৌধুরী) |
| ভাওয়ালী কাণ্ড | কেদারনাথ চক্রবর্তী | ভাওয়ালী কাণ্ড - কেদারনাথ চক্রবর্তী (১৯২১).pdf | author's death year is not on Wikidata (কেদারনাথ চক্রবর্তী) |
| কবিতা | কেশবচন্দ্র কুণ্ডু | কবিতা - কেশবচন্দ্র কুণ্ডু.pdf | author's death year is not on Wikidata (কেশবচন্দ্র কুণ্ডু) |
| হিন্দু মহিলাগণের হীনাবস্থা | কৈলাসবাসিনী দেবী | হিন্দু মহিলাগণের হীনাবস্থা - কৈলাসবাসিনী দেবী.pdf | author's death year is not on Wikidata (কৈলাসবাসিনী দেবী) |
| মানসাঙ্ক | গোপালচন্দ্র বন্দ্যোপাধ্যায় | মানসাঙ্ক (প্রথম ভাগ) - গোপালচন্দ্র বন্দ্যোপাধ্যায় (১৮৭৩).pdf | author's death year is not on Wikidata (গোপালচন্দ্র বন্দ্যোপাধ্যায়) |
| মূর্চ্ছনা | চণ্ডীদাস মুখোপাধ্যায় | মূর্চ্ছনা - চণ্ডীদাস মুখোপাধ্যায় (১৯১৬).pdf | author's death year is not on Wikidata (চণ্ডীদাস মুখোপাধ্যায়) |
| বেহুলা | চারুশীলা দেবী | বেহুলা - চারুশীলা দেবী (১৯১৫).pdf | author's death year is not on Wikidata (চারুশীলা দেবী) |
| দুর্য্যোধন বধ কাব্য | জীবনকৃষ্ণ ঘোষ | দুর্য্যোধন বধ কাব্য - জীবনকৃষ্ণ ঘোষ.pdf | author's death year is not on Wikidata (জীবনকৃষ্ণ ঘোষ) |
| ধূলিরাশি | জ্ঞানেন্দ্রমোহিনী দত্ত | ধূলারাশি - জ্ঞানেন্দ্রমোহিনী দত্ত.pdf | author's death year is not on Wikidata (জ্ঞানেন্দ্রমোহিনী দত্ত) |
| বাখতিন | তপোধীর ভট্টাচার্য | বাখতিন - তপোধীর ভট্টাচার্য.pdf | author's death year is not on Wikidata (তপোধীর ভট্টাচার্য) |
| সময় অসময় নিঃসময় | তপোধীর ভট্টাচার্য | সময় অসময় নিঃসময় - তপোধীর ভট্টাচার্য.pdf | author's death year is not on Wikidata (তপোধীর ভট্টাচার্য) |
| স্বপ্নের সোভিয়েতে | তপোধীর ভট্টাচার্য | স্বপ্নের সোভিয়েতে - তপোধীর ভট্টাচার্য (২০২৩).pdf | author's death year is not on Wikidata (তপোধীর ভট্টাচার্য) |
| নব্য চীন | তারানাথ রায় | নব্য চীন - তারানাথ রায় (১৯২৮).pdf | author's death year is not on Wikidata (তারানাথ রায়) |
| মুসোলিনী ও বর্ত্তমান ইটালী | তারানাথ রায় | মুসোলিনী ও বর্ত্তমান ইটালী - তারানাথ রায় (১৯২৭).pdf | author's death year is not on Wikidata (তারানাথ রায়) |
| দার্জ্জিলিঙ্গ-প্রবাসীর পত্র | তারাপদ বন্দ্যোপাধ্যায় | দার্জ্জিলিঙ্গ-প্রবাসীর পত্র - তারাপদ বন্দ্যোপাধ্যায় (১৮৯৫).djvu | author's death year is not on Wikidata (তারাপদ বন্দ্যোপাধ্যায়) |
| ম্যালেরিয়া | দয়ালকৃষ্ণ ঘোষ | ম্যালেরিয়া - দয়ালকৃষ্ণ ঘোষ.pdf | author's death year is not on Wikidata (দয়ালকৃষ্ণ ঘোষ) |
| ভারত দীধিতি | দীননাথ দাস চন্দ | ভারত দীধিতি - দীননাথ দাস চন্দ.pdf | author's death year is not on Wikidata (দীননাথ দাস চন্দ) |
| অহল্যা | দেবেন্দ্রকিশোর আচার্য চৌধুরী | অহল্যা - দেবেন্দ্রকিশোর আচার্য চৌধুরী (১৮৯১).pdf | author's death year is not on Wikidata (দেবেন্দ্রকিশোর আচার্য চৌধুরী) |
| শ্মশানের ফুল | নরেন্দ্রকৃষ্ণ চট্টোপাধ্যায় | শ্মশানের ফুল - নরেন্দ্রকৃষ্ণ চট্টোপাধ্যায়.pdf | author's death year is not on Wikidata (নরেন্দ্রকৃষ্ণ চট্টোপাধ্যায়) |
| নীতিকণা | নারায়ণচন্দ্র বিদ্যারত্ন | নীতিকণা - নারায়ণচন্দ্র বিদ্যারত্ন.pdf | author's death year is not on Wikidata (নারায়ণচন্দ্র বিদ্যারত্ন) |
| ধারাপাত | নিলমণি মুখোপাধ্যায় | ধারাপাত - নীলমণি মুখোপাধ্যায়.pdf | author's death year is not on Wikidata (নিলমণি মুখোপাধ্যায়) |
| আমেরিকার স্বাধীনতা | নিশিকান্ত গঙ্গোপাধ্যায় | আমেরিকার স্বাধীনতা - নিশিকান্ত গাঙ্গুলী (১৯২৩).pdf | author's death year is not on Wikidata (নিশিকান্ত গঙ্গোপাধ্যায়) |
| আঙুর | পাঁচুলাল ঘোষ | আঙুর - পাঁচুলাল ঘোষ (১৯১১).pdf | author's death year is not on Wikidata (পাঁচুলাল ঘোষ) |
| সেই সব শহীদেরা | পিনাকী বিশ্বাস | সেই সব শহীদেরা - পিনাকী বিশ্বাস (২০২২).pdf | author's death year is not on Wikidata (পিনাকী বিশ্বাস) |
| বিষাদ | পুলিনবিহারী রায় | বিষাদ - পুলিনবিহারী রায় (১৮৯৫).pdf | author's death year is not on Wikidata (পুলিনবিহারী রায়) |
| পথের বাঁশী | প্রবোধচন্দ্র মৈত্র | পথের বাঁশী - প্রবোধচন্দ্র মৈত্র (১৯৩০).pdf | author's death year is not on Wikidata (প্রবোধচন্দ্র মৈত্র) |
| জননী-জন্মভূমি | প্রমথনাথ দত্ত | জননী-জন্মভূমি - প্রমথনাথ দত্ত (১৯০৬).pdf | author's death year is not on Wikidata (প্রমথনাথ দত্ত) |
| কুসুম-যুগল | বঙ্কিমবিহারী দাস | কুসুম-যুগল - বঙ্কিমবিহারী দাস (১৮৯৮).pdf | author's death year is not on Wikidata (বঙ্কিমবিহারী দাস) |
| সাঁওতালি পুরাণকথায় পৃথিবী ও মানব সৃষ্টি কাহিনি | বড় বাস্কী | সাঁওতালি পুরাণকথায় পৃথিবী ও মানব সৃষ্টি কাহিনি - বড়ো বাস্কী (২০২১).pdf | author's death year is not on Wikidata (বড় বাস্কী) |
| চিদ্বিলাস | বিনয় কুমার সান্যাল | চিদ্বিলাস - বিনয় কুমার সান্যাল.pdf | author's death year is not on Wikidata (বিনয় কুমার সান্যাল) |
| নিনিবি শহরের রিহাই | বিপিন বিহারী শাহ | নিনিবি শহরের রিহাই - বিপিন বিহারী শাহ.pdf | author's death year is not on Wikidata (বিপিন বিহারী শাহ) |
| বেহেস্তের বয়ান | বিপিন বিহারী শাহ | বেহেস্তের বয়ান - বিপিন বিহারী শাহ.pdf | author's death year is not on Wikidata (বিপিন বিহারী শাহ) |
| খোঁজে | বিভাবতী দেবী চৌধুরাণী | খোঁজে - বিভাবতী দেবী চৌধুরাণী.pdf | author's death year is not on Wikidata (বিভাবতী দেবী চৌধুরাণী) |
| পরের-মেয়ে | ভূপেন্দ্রনাথ রায় চৌধুরী | পরের-মেয়ে - ভূপেন্দ্রনাথ রায় চৌধুরী (১৯২০).pdf | author's death year is not on Wikidata (ভূপেন্দ্রনাথ রায় চৌধুরী) |
| লক্ষ্মী | ভূপেন্দ্রনাথ রায় চৌধুরী | লক্ষ্মী - ভূপেন্দ্রনাথ রায় চৌধুরী (১৯২০).pdf | author's death year is not on Wikidata (ভূপেন্দ্রনাথ রায় চৌধুরী) |
| বাসন্তিকা | মণীন্দ্রনাথ সিংহ | বাসন্তিকা - মনীন্দ্রনাথ সিংহ.pdf | author's death year is not on Wikidata (মণীন্দ্রনাথ সিংহ) |
| শিক্ষিতা পতিতার আত্মচরিত | মানদা দেবী | শিক্ষিতা পতিতার আত্মচরিত - মানদা দেবী.pdf | author's death year is not on Wikidata (মানদা দেবী) |
| ধৰ্ম্মঘট | যতীন্দ্রনাথ পাল | ধৰ্ম্মঘট - যতীন্দ্রনাথ পাল (১৯২০).pdf | author's death year is not on Wikidata (যতীন্দ্রনাথ পাল) |
| উনিশে মে: ভাষার সংকট | রণবীর পুরকায়স্থ | উনিশে মে- ভাষার সংকট - রণবীর পুরকায়স্থ (২০২১).pdf | author's death year is not on Wikidata (রণবীর পুরকায়স্থ) |
| ডিগবাজী খাঁ | রবীন্দ্রনাথ সেন | ডিগবাজী খাঁ - রবীন্দ্রনাথ সেন (১৯২৯).pdf | author's death year is not on Wikidata (রবীন্দ্রনাথ সেন) |
| দানবদলন কাব্য | রামচন্দ্র মুখোপাধ্যায় | দানবদলন কাব্য.pdf | author's death year is not on Wikidata (রামচন্দ্র মুখোপাধ্যায়) |
| দেবী রাবিয়া | রাহাতুন্নেছা খাতুন | দেবী রাবিয়া - রাহাতুন্নেছা খাতুন.pdf | author's death year is not on Wikidata (রাহাতুন্নেছা খাতুন) |
| প্রমোদবালা | রোহিণীকুমার সেনগুপ্ত | প্রমোদবালা - রোহিণীকুমার সেনগুপ্ত (১৮৮৭).pdf | author's death year is not on Wikidata (রোহিণীকুমার সেনগুপ্ত) |
| বিদ্যাসাগর জীবনচরিত | শম্ভুচন্দ্র বিদ্যারত্ন | বিদ্যাসাগর জীবনচরিত - শম্ভুচন্দ্র বিদ্যারত্ন.pdf | author's death year is not on Wikidata (শম্ভুচন্দ্র বিদ্যারত্ন) |
| আর্য্যজাতির আদি নিবাস | শিবচন্দ্র শীল | আর্য্যজাতির আদি নিবাস - শিবচন্দ্র শীল (১৯২১).pdf | author's death year is not on Wikidata (শিবচন্দ্র শীল) |
| ষষ্ঠীতৎপুরুষনামা | সঞ্জীব দেবলস্কর | ষষ্ঠীতৎপুরুষনামা - সঞ্জীব দেবলস্কর (২০২৩).pdf | author's death year is not on Wikidata (সঞ্জীব দেবলস্কর) |
| বড়বউ | সত্যচরণ মিত্র | বড়বউ - সত্যচরণ মিত্র (১৯১৭).pdf | author's death year is not on Wikidata (সত্যচরণ মিত্র) |
| ১৫১৩ সাল | সত্যভূষণ বন্দ্যোপাধ্যায় | ১৫১৩ সাল.pdf | author's death year is not on Wikidata (সত্যভূষণ বন্দ্যোপাধ্যায়) |
| শ্রীশ্রীকৃষ্ণকালী-পদাবলী | সরোজনাথ মুখোপাধ্যায় | শ্রীশ্রীকৃষ্ণকালীপদাবলী.pdf | author's death year is not on Wikidata (সরোজনাথ মুখোপাধ্যায়) |
| মুরলী | সারদাপ্রসাদ ঠাকুর | মুরলী.djvu | author's death year is not on Wikidata (সারদাপ্রসাদ ঠাকুর) |
| তারাচরিত | সুরঙ্গিণী দেবী | তারাচরিত.pdf | author's death year is not on Wikidata (সুরঙ্গিণী দেবী) |
| ঝঙ্কার | সুরেন্দ্রকৃষ্ণ গুপ্ত | ঝঙ্কার - সুরেন্দ্রকৃষ্ণ গুপ্ত.pdf | author's death year is not on Wikidata (সুরেন্দ্রকৃষ্ণ গুপ্ত) |
| বিজ্ঞান বাবু | সুরেন্দ্রনাথ বন্দ্যোপাধ্যায় | বিজ্ঞান বাবু - সুরেন্দ্রনাথ বন্দ্যোপাধ্যায়.pdf | author's death year is not on Wikidata (সুরেন্দ্রনাথ বন্দ্যোপাধ্যায়) |
| ত্রিবেণী ও আরো দুটী গল্প | সুরেশচন্দ্র ঘটক | ত্রিবেণী ও আরো দুটী গল্প - সুরেশচন্দ্র ঘটক (১৯২৫).pdf | author's death year is not on Wikidata (সুরেশচন্দ্র ঘটক) |
| নারী-চরিত | সৌদামিনী সিংহ | নারী-চরিত - সৌদামিনী সিংহ.pdf | author's death year is not on Wikidata (সৌদামিনী সিংহ) |
| শিশূপদেশ | হরচন্দ্র সেন | শিশূপদেশ.pdf | author's death year is not on Wikidata (হরচন্দ্র সেন) |
| লাল সিংহ | হরিনাথ ঘোষ | লাল সিংহ - হরিনাথ ঘোষ (১৯১৩).pdf | author's death year is not on Wikidata (হরিনাথ ঘোষ) |
| ওঠ্ ছুঁড়ী তোর বিয়ে | হরিমোহন কর্মকার | ওঠ্‌ ছুঁড়ী তোর বিয়ে - হরিমোহন কর্মকার.pdf | author's death year is not on Wikidata (হরিমোহন কর্মকার) |
| চতুরঙ্গ | হরিলাল সরকার | চতুরঙ্গ - হরিলাল সরকার.pdf | author's death year is not on Wikidata (হরিলাল সরকার) |
| জীবনরক্ষক | হরিশ্চন্দ্র শর্মা | জীবনরক্ষক - প্রথম ভাগ.pdf | author's death year is not on Wikidata (হরিশ্চন্দ্র শর্মা) |
| ব্যায়াম শিক্ষা | হরিশ্চন্দ্র শর্মা | ব্যায়াম শিক্ষা - প্রথম ভাগ - হরিশচন্দ্র শর্মা.pdf | author's death year is not on Wikidata (হরিশ্চন্দ্র শর্মা) |
| কলির বৌ ঘরভাঙ্গনী | হরিহর নন্দী | কলির বৌ ঘরভাঙ্গনী - হরিহর নন্দী.pdf | author's death year is not on Wikidata (হরিহর নন্দী) |
| দেশটা কি তোর বাপের | হাসান ফকরী | দেশটা কি তোর বাপের - হাসান ফকরী (২০২০).pdf | author's death year is not on Wikidata (হাসান ফকরী) |
| মেঘনাদবধ কাব্য | মাইকেল মধুসূদন দত্ত | সটীক মেঘনাদবধ কাব্য - মাইকেল মধুসূদন দত্ত (১৯১৯).pdf | editor's death year is not on Wikidata (দেবেন্দ্রনাথ ভট্টাচার্য) |
| পূর্ব-বাংলার গল্প | রবীন্দ্রনাথ ঠাকুর | পূর্ব-বাংলার গল্প - রবীন্দ্রনাথ ঠাকুর.pdf | first publication date unknown, and the scanned edition was printed in 1972, after the death of its author (1941): check that it was published in their lifetime (a posthumous work is protected for 60 years from publication) |
| ভারতপথিক রামমোহন রায় | রবীন্দ্রনাথ ঠাকুর | ভারতপথিক রামমোহন রায়-রবীন্দ্রনাথ ঠাকুর.pdf | first publication date unknown, and the scanned edition was printed in 1972, after the death of its author (1941): check that it was published in their lifetime (a posthumous work is protected for 60 years from publication) |
| আলোর ফুলকি | অবনীন্দ্রনাথ ঠাকুর | আলোর ফুলকি.djvu | first publication date unknown, and the scanned edition was printed in 1979, after the death of its author (1951): check that it was published in their lifetime (a posthumous work is protected for 60 years from publication) |
| শরৎ-সাহিত্য-সংগ্রহ | শরৎচন্দ্র চট্টোপাধ্যায় | শরৎ-সাহিত্য-সংগ্রহ (ত্রয়োদশ সম্ভার) - শরৎচন্দ্র চট্টোপাধ্যায় (১৯৬০).pdf | left out by decision (2026-10-16): volume 13 of an omnibus of collected works, mixed forms (novels, stories, essays, letters), not a book of its own |
| অগ্নিপরীক্ষা | — | অগ্নিপরীক্ষা - প্রচার পুস্তিকা (১৯৫৪).pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| ওরা থাকে ওধারে | — | ওরা থাকে ওধারে - প্রচার পুস্তিকা (১৯৫৪).pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| গোপাল ভাঁড় | — | গোপাল ভাঁড় - প্রচার পুস্তিকা (১৯৫৩).pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| চিরকুমার সভা | — | চিরকুমার সভা - প্রচার পুস্তিকা (১৯৩২).pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| নটীর পূজা | — | নটীর পূজা - প্রচার পুস্তিকা (১৯৩২).pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| নীলদর্পণ | — | নীলদর্পণ - প্রচার পত্রিকা (১৯৫২).pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| পরপারে | — | পরপারে - প্রচার পুস্তিকা (১৯৩৬).pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| প্রতিমা | — | প্রতিমা - প্রচার পুস্তিকা (১৯৪৬).pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| প্রহ্লাদ | — | প্রহ্লাদ - প্রচার পত্রিকা (১৯৫২).pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| বাংলাদেশ গেজেট, অতিরিক্ত সংখ্যা (জানুয়ারী ৯, ১৯৯২) | — | বাংলাদেশ গেজেট, অতিরিক্ত, জানুয়ারী ৯, ১৯৯২.pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| বাংলাদেশ গেজেট, অতিরিক্ত সংখ্যা (এপ্রিল ২৭, ২০১৬) | — | বাংলাদেশ গেজেট, অতিরিক্ত, এপ্রিল ২৭, ২০১৬.pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| বাংলাদেশ গেজেট, অতিরিক্ত সংখ্যা (জানুয়ারী ২২, ১৯৯৭) | — | বাংলাদেশ গেজেট, অতিরিক্ত, জানুয়ারি ২২, ১৯৯৭.pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| বাংলাদেশ গেজেট, অতিরিক্ত সংখ্যা (জানুয়ারী ৫, ১৯৮৮) | — | বাংলাদেশ গেজেট, অতিরিক্ত, জানুয়ারী ৫, ১৯৮৮.pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| বাংলাদেশ গেজেট, অতিরিক্ত সংখ্যা (মে ২২, ২০১৪) | — | বাংলাদেশ গেজেট, অতিরিক্ত, মে ২২, ২০১৪.pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| বাংলাদেশ গেজেট, অতিরিক্ত সংখ্যা (মে ২২, ২০১৪) | — | বাংলাদেশ গেজেট, অতিরিক্ত, এপ্রিল ৭, ২০১৪.pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| বাংলাদেশ গেজেট, অতিরিক্ত সংখ্যা (ডিসেম্বর ১০, ২০০৯) | — | বাংলাদেশ গেজেট, অতিরিক্ত, ডিসেম্বর ১০, ২০০৯.pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| বাড়ী থেকে পালিয়ে | — | বাড়ী থেকে পালিয়ে - প্রচার পুস্তিকা (১৯৫৯).pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| ভারতের গেজেট (বিশেষ) - ভাগ ৭, অনুভাগ ১, ১০ জানুয়ারি ১৯৮৫, নং ১ | — | ভারতের গেজেট (বিশেষ) - ভাগ ৭, অনুভাগ ১, ১০ জানুয়ারি ১৯৮৫, নং ১.pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| রাজমোহনের বৌ | — | রাজমোহনের বৌ - প্রচার পুস্তিকা (১৯৫১).pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| যমালয়ে জীবন্ত মানুষ | — | যমালয়ে জীবন্ত মানুষ - প্রচার পুস্তিকা (১৯৫৮).pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| সাড়ে চুয়াত্তর | — | সাড়ে চুয়াত্তর - প্রচার পুস্তিকা (১৯৫৩).pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| অর্থনৈতিক, সামাজিক ও সাংস্কৃতিক অধিকার বিষয়ক আন্তর্জাতিক চুক্তি | জাতিসংঘ সাধারণ পরিষদ | অর্থনৈতিক, সামাজিক ও সাংস্কৃতিক অধিকার বিষয়ক আন্তর্জাতিক চুক্তি.pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| নির্যাতন এবং অন্যান্য নিষ্ঠুর, অমানবিক অথবা মর্যাদাহানিকর আচরণ বা শাস্তির বিরুদ্ধে কনভেনশন | জাতিসংঘ সাধারণ পরিষদ | নির্যাতনের বিরুদ্ধে কনভেনশন.pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| নারীর রাজনৈতিক অধিকার বিষয়ক চুক্তি | জাতিসংঘ সাধারণ পরিষদ | নারীর রাজনৈতিক অধিকার বিষয়ক চুক্তি.pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| নারীর প্রতি সকল প্রকার বৈষম্য বিলোপ কনভেনশন | জাতিসংঘ সাধারণ পরিষদ | নারীর প্রতি সকল প্রকার বৈষম্য বিলোপ কনভেনশন.pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| নাগরিক ও রাজনৈতিক অধিকার বিষয়ক আন্তর্জাতিক চুক্তি | জাতিসংঘ সাধারণ পরিষদ | নাগরিক ও রাজনৈতিক অধিকার বিষয়ক আন্তর্জাতিক চুক্তি.pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| নারীর রাজনৈতিক অধিকার বিষয়ক চুক্তি | জাতিসংঘ সাধারণ পরিষদ | নারীর রাজনৈতিক অধিকার বিষয়ক চুক্তি (২০২১).pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| মানবাধিকারের সার্বজনীন ঘোষণাপত্র | জাতিসংঘ সাধারণ পরিষদ | মানবাধিকারের সর্বজনীন ঘোষণাপত্র (২০১৯).pdf | not a literary book (gazette, legal or UN document, film booklet or periodical) |
| ভানুসিংহ ঠাকুরের পদাবলী | রবীন্দ্রনাথ ঠাকুর | ভানুসিংহ ঠাকুরের পদাবলী.djvu | not in Bangla (Wikisource language: ?; Wikidata: Q4955986) |
| লেখন-রবীন্দ্রনাথ ঠাকুর.djvu | — | লেখন-রবীন্দ্রনাথ ঠাকুর.djvu | the scan has no Wikidata item |
| এব্রাহাম লিঙ্কন স্পিক্‌স্‌ | আব্রাহাম লিঙ্কন | এব্রাহাম লিঙ্কনের বক্তৃতাবলী.djvu | translation with no named translator |
| অগস্ট কোম্‌ত, দ্য পজিটিভিস্ট | কেনেথ সোমারলেড ম্যাকডোনাল্ড | ধ্রুববাদী অগস্ত্‌ কোম্‌ত - কেনেথ সোমারলেড ম্যাকডোনাল্ড.pdf | translation with no named translator |
| চাণক্যনীতি | চাণক্য | চাণক্যশ্লোক.pdf | translation with no named translator |
| এ ভয়েজ টু লিলিপুট | জোনাথন সুইফ্ট্ | গলিভারের ভ্রমণ-বৃত্তান্ত (১৯১৩).pdf | translation with no named translator |
| রবিনসন ক্রুসো | ড্যানিয়েল ডিফো | রবিন্সন্‌ ক্রুসো (১৯১৩).pdf | translation with no named translator |
| নোটস অব সাম ওয়াণ্ডারিংস উইথ দ্য স্বামী বিবেকানন্দ | ভগিনী নিবেদিতা | স্বামিজীর সহিত হিমালয়ে - ভগিনী নিবেদিতা (১৯৫১).pdf | translation with no named translator |
| দ্য অনলি ওয়ে টু বি সেভ্‌ড্‌ | লরেঞ্জো স্নো | পরিত্রাণের কেবল মাত্র পথ - লরেঞ্জো স্নো.djvu | translation with no named translator |
| দ্য নিগ্রো সার্ভেণ্ট | লী রিচমণ্ড | কাফ্রি দাসের বৃত্তান্ত - লী রিচমণ্ড.pdf | translation with no named translator |
| পেশবাদিগের রাজ্যশাসন-পদ্ধতি | সুরেন্দ্রনাথ সেন | পেশবাদিগের রাজ্যশাসন-পদ্ধতি - সুরেন্দ্রনাথ সেন (১৯৩০).pdf | translation with no named translator |
| মদীয় আচার্যদেব | স্বামী বিবেকানন্দ | মদীয় আচার্য্যদেব - স্বামী বিবেকানন্দ.pdf | translation with no named translator |
| জনগণমন | হারবার্ট মারিল | Score of Jana Gana Mana harmonized by Herbert Murrill.jpg | translation with no named translator |
| আঙ্কল টম’স্‌ কেবিন | হ্যারিয়েট বিচার স্টো | টমকাকার কুটীর (১৯১৩).pdf | translation with no named translator |
| এ ডিফেন্স অব ইণ্ডিয়ান কালচার | অরবিন্দ ঘোষ | ভারতের রাষ্ট্রনীতিক প্রতিভা - অরবিন্দ ঘোষ (১৯২৫).pdf | translator died in 1974, after 1965 (অনিলবরণ রায়) |
| ভারতের নবজন্ম | অরবিন্দ ঘোষ | ভারতের নবজন্ম - অরবিন্দ ঘোষ.pdf | translator died in 1983, after 1965 (নলিনীকান্ত গুপ্ত) |
| দ্য হাউস দ্যাট জ্যাক বিল্ট | র‍্যাণ্ডল্ফ কল্ডেকট | The house that Jack built.djvu | translator's death year is not on Wikidata (উইকিসংকলন সম্প্রদায়) |
| সিণ্ডেরেলা | শার্ল পেরো | Cinderella (1865).djvu | translator's death year is not on Wikidata (উইকিসংকলন সম্প্রদায়) |
| পঞ্চরাত্রি | ভাস | পঞ্চরাত্র - গুরুবন্ধু ভট্টাচার্য্য.pdf | translator's death year is not on Wikidata (গুরুবন্ধু ভট্টাচার্য) |
| আঙ্কল টম’স্‌ কেবিন | হ্যারিয়েট বিচার স্টো | টম্‌ খুড়ো - তারিণীচরণ চক্রবর্তী.pdf | translator's death year is not on Wikidata (তারিণীচরণ চক্রবর্তী) |
| টুওয়ার্ডস মরাল ব্যাঙ্করাপ্টসি | মোহনদাস করমচাঁদ গান্ধী | দুর্নীতির পথে - বিনয়কৃষ্ণ সেন.pdf | translator's death year is not on Wikidata (বিনয়কৃষ্ণ সেন) |
| নেটারগেলেন | হান্স ক্রিশ্চিয়ান অ্যান্ডারসন | চীন দেশীয় বুলবুল পক্ষীর বিবরণ - মধুসূদন মুখোপাধ্যায় (১৮৫৭).pdf | translator's death year is not on Wikidata (মধুসূদন মুখোপাধ্যায়) |
| লিল ক্লাউস ওগ স্টোর ক্লাউস | হান্স ক্রিশ্চিয়ান অ্যান্ডারসন | ছোট কৈলাশ এবং বড় কৈলাশ - মধুসূদন মুখোপাধ্যায় (১৮৬০).pdf | translator's death year is not on Wikidata (মধুসূদন মুখোপাধ্যায়) |
| নেটারগেলেন | হান্স ক্রিশ্চিয়ান অ্যান্ডারসন | চীন দেশীয় বুলবুল পক্ষীর বিবরণ - মধুসূদন মুখোপাধ্যায় (১৮৬৩).pdf | translator's death year is not on Wikidata (মধুসূদন মুখোপাধ্যায়) |
| দেন লিলে হাফ্রু | হান্স ক্রিশ্চিয়ান অ্যান্ডারসন | মরমেত.pdf | translator's death year is not on Wikidata (মধুসূদন মুখোপাধ্যায়) |
| রিমার্ক্‌স্‌ অন কলেরা | নটিজ চার্লস ম্যাকনামারা | বিসূচিকার নিগূঢ় তত্ত্ব - লালমাধব মুখোপাধ্যায় (১৮৭১).pdf | translator's death year is not on Wikidata (লালমাধব মুখোপাধ্যায়) |
