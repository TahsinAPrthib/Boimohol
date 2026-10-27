# Project Gutenberg, whole catalog — import report

Generated 2026-10-27 by `scripts/gutenberg-all.ts` from Gutenberg's official RDF catalog feed (downloaded 2026-10-16). Public-domain cutoff: died in **1965 or earlier**. For the large-file import on /admin/books, which marks these books as not curated.

## Totals

| | Books |
|---|---|
| Gutenberg catalog | 79609 |
| Pass every rule | 35136 |
| New books (`data/gutenberg-all-1.json`, `data/gutenberg-all-2.json`, `data/gutenberg-all-3.json`, `data/gutenberg-all-4.json`) | 35134 |
| Links for books already in the catalog (at the end of the last file) | 2 |
| Left to the curated import | 922 |

## Left out, by rule

| Rule | Books |
|---|---|
| 1 not a text (audio, images, data) | 1251 |
| 1 not in English or Bangla only | 16512 |
| 2 anonymous | 897 |
| 2 anthology or magazine without a single author (Various) | 3651 |
| 2 more named authors or translators than one field can credit (a collection) | 8 |
| 2 no named author | 2444 |
| 3 index or catalogue | 211 |
| 3 periodical or magazine issue | 290 |
| 4 author died after 1965 (Gutenberg) | 4443 |
| 4 author died after 1965 (Wikidata) | 3 |
| 4 author's death year unknown (Gutenberg) | 8215 |
| 5 editor or introducer's death year unknown or after the cutoff | 458 |
| 5 illustrator died after the cutoff | 466 |
| 5 translation with no named translator | 1783 |
| 5 translator's death year unknown or after the cutoff | 833 |
| 6 one volume of a set whose complete edition is in the catalog | 608 |
| 7 another edition of the same work | 1469 |
| 7 another edition of the same work (same title and author) | 5 |
| 8 a volume, part or retelling of a book already in the catalog | 3 |
| 8 an English edition of a book the catalog has in another language | 1 |
| 8 in the curated import (data/gutenberg-import-*.json) | 922 |

## New books by category

| Category | Books |
|---|---|
| `uponnash` | 9057 |
| `itihash-jiboni` | 6945 |
| `shishu-sahitto` | 4430 |
| `probondho` | 4050 |
| `onnanno` | 3156 |
| `bhromon` | 2257 |
| `kobita` | 1569 |
| `thriller-rohosso` | 1245 |
| `chhotogolpo` | 1049 |
| `natok` | 803 |
| `biggan-kolpokahini` | 307 |
| `puran-lokkotha` | 249 |
| `atmounnoyon` | 17 |

## অন্যান্য (onnanno), by subject

| Subject | Books |
|---|---|
| স্বাস্থ্য ও চিকিৎসা বিষয়ক বই | 532 |
| শিক্ষা বিষয়ক বই | 437 |
| হাতে-কলমে শেখার বই | 404 |
| প্রকৌশল ও প্রযুক্তি বিষয়ক বই | 297 |
| আইন ও অপরাধতত্ত্ব বিষয়ক বই | 202 |
| স্থাপত্য বিষয়ক বই | 186 |
| খেলাধুলা ও শখ বিষয়ক বই | 169 |
| বই | 149 |
| রান্না ও খাদ্য বিষয়ক বই | 140 |
| ভাষা বিষয়ক বই | 137 |
| সংগীত বিষয়ক বই | 136 |
| তথ্যসূত্রের বই | 90 |
| শিল্পকলা বিষয়ক বই | 78 |
| গণিত বিষয়ক বই | 65 |
| ব্যবসা বিষয়ক বই | 44 |
| পোশাক বিষয়ক বই | 26 |
| বই ও গ্রন্থাগার বিষয়ক বই | 12 |
| রান্না ও গৃহস্থালি বিষয়ক বই | 10 |
| পশুপালন বিষয়ক বই | 7 |
| সামরিক বিষয়ক বই | 7 |
| আইন বিষয়ক বই | 4 |
| প্রতিবেদন | 4 |
| বাগান বিষয়ক বই | 4 |
| শিকার বিষয়ক বই | 4 |
| কৃষি বিষয়ক বই | 3 |
| মাছ ধরা বিষয়ক বই | 3 |
| হাতের কাজ বিষয়ক বই | 3 |
| রীতিনীতি বিষয়ক বই | 2 |
| ভূগোল বিষয়ক বই | 1 |

## Other facts

- Translations, each crediting its translator: 1780.
- Volumes kept on their own (no complete set in the catalog): 3231.
- Authors and translators found on Wikidata with a death date: 30990 of 38131.
- Average bytes per new row: title 27, author 17, description 89, rights note 210.
- Descriptions are neutral: author, original language, subject or form, translator; 0 well-known works keep the curated import's own line. No plot is described.

## Spot-check

See `data/gutenberg-all-spot-check.md` (`scripts/gutenberg-spot-check.ts --all`).
