# Catalog corrections (2026-10-27)

Corrections to curated books already in the catalog, to make before the whole-catalog import. `data/catalog-corrections.json` has 19 update rows for the small import on /admin/books ("JSON ফাইল থেকে অনেক বই একসাথে যোগ করুন"). Each row names one book (`match`) and changes only the fields in `set`, plus, for three books, the rights note on their Gutenberg link. Five links are removed by hand, because the import never removes anything.

Rehearsed on dev (a copy of production) on 2026-10-27. The check showed 19 updates and nothing else. After they were applied:
- the book pages showed the new translators, authors and descriptions;
- the five links were gone;
- a second upload changed nothing.

The whole-catalog import that followed added only its own books and its two links.

## Order

1. Remove the five links in [section 1](#1-translations-that-name-no-translator-link-removed) by hand, and the two covers named there.
2. Upload `data/catalog-corrections.json`. The check should read "আগের বই হালনাগাদ হবে ১৯টি", with nothing added, nothing skipped as a duplicate, and no errors. Then click "১৯টি আগের বই হালনাগাদ করুন".

Uploading the file a second time changes nothing. 14 rows show as duplicates ("কোনো পরিবর্তন নেই"), and the 5 author rows show as errors ("ক্যাটালগে এই বইটি পাওয়া যায়নি"), because those books now have the corrected author.

**To remove a link:** on /admin/books, type the title into "ক্যাটালগে বই খুঁজুন". Under the book, find the line "প্রজেক্ট গুটেনবার্গ: gutenberg.org/ebooks/…" with the number below. Click "লিংক সরান", then "হ্যাঁ, সরান".

## 1. Translations that name no translator: link removed

Our rule needs a translator whose death year is known (1965 or earlier). These English texts are translations that name no translator: not on Gutenberg, and not in the text. The authors died long ago, so each book stays in the catalog as public domain, without a link, under the language it was written in, like the books in the catalog that never had a text.

| Book | Link to remove | What the text says | In the file |
|---|---|---|---|
| Manon Lescaut | gutenberg.org/ebooks/468 | "by Abbé Prévost"; no translator | language `fr`; description "ফরাসি উপন্যাস" (was "ইংরেজি উপন্যাস") |
| Novum Organum | gutenberg.org/ebooks/45988 | Bacon wrote it in Latin; "Edited by Joseph Devey"; no translator | language `la`; description "লাতিন" |
| Memoirs of the Duchesse de Dino | gutenberg.org/ebooks/44646 | written in French; "Edited … by the Princesse Radziwill"; no translator | language `fr`; description "ফরাসি" |
| Rizal's Own Story of His Life | gutenberg.org/ebooks/48438 | Rizal wrote in Spanish; "Edited by Austin Craig"; one poem names its translator (Charles Derbyshire), and "Miss M. W. Sproull revised the translations" | language `es`; description reworded |
| The Love Letters of Henry VIII to Anne Boleyn | gutenberg.org/ebooks/32155 | "eight are written in English and nine in French"; the English versions name no translator | description corrected (it called the letters "ইংরেজি উপন্যাস"); language stays `en` |

*Novum Organum* and the Dino memoirs also have a real cover scanned from that same English edition: the 1902 title page and the 1910 binding. The images are public domain, but the cover credit links to the Gutenberg page whose link you are removing. Remove those two covers as well, with "প্রচ্ছদ সরান" under the book on /admin/books; the generated cover takes their place.

The Rizal book and the Henry VIII letters are mostly, not wholly, translations. To keep either link:
- **Rizal:** keep the link and delete row 4 from the file. Its language change only makes sense once the link is gone.
- **Henry VIII:** keep the link but keep row 5 in the file; its description fix is right either way.

The Henry VIII book is also in the উপন্যাস category. The import can't change categories, so move it by hand with সম্পাদনা if you like (ইতিহাস ও জীবনী fits).

## 2. Translators not credited: credit added

| Book | Translator | Died | Evidence |
|---|---|---|---|
| The Communist Manifesto (#61) | Samuel Moore | 1911 | the text is "the English edition of 1888, edited by Friedrich Engels" ("A spectre is haunting Europe"), which is Moore's translation; the rights note now names him |
| Utopia (#2130) | Gilbert Burnet | 1715 | the introduction says "Burnet's is the translation given in this volume"; the rights note now names him |
| Grace, Actual and Habitual (#29540) | Arthur Preuss | 1934 | Pohle wrote in German; the title page says "Adapted and Edited by Arthur Preuss"; the rights note already named him; the description now says German, in his English adaptation |
| The Part Borne by the Dutch in the Discovery of Australia (#17450) | Cornelis Stoffel | 1908 | "The English translation is the work of Mr. C. Stoffel, of Nijmegen" ([Wikidata Q2605472](https://www.wikidata.org/wiki/Q2605472)); the rights note now names him; the description now says Dutch |
| Crime and Punishment (#2554) | Constance Garnett | 1946 | the book is recorded as Russian, with Garnett's English translation linked; the rights note already named her |
| Meditations (#55317) | George Chrystal | 1944 | the same, Greek |
| We (#61963) | Gregory Zilboorg | 1959 | the same, Russian |

## 3. Other errors found on the way

- **Wrong author.** The script that prepared the curated Gutenberg import matched a person to any catalog author with the same first initial and a surname two letters away. That script is now fixed (`catalogSpelling` in `scripts/gutenberg/rules.ts`). The death years were already the real author's. Fixed in the file:
  - *The Pilgrim's Progress* (#131) and its children's edition (#39452): John Buchan → John Bunyan.
  - *The Task of Social Hygiene* (#22090): H. G. Wells → Havelock Ellis.
  - *Electricity for Boys* (#22766): Jules Verne → James Slough Zerbe.
  - *The Influence of Sea Power Upon History* (#13529): "Alfred Thayer Maan" → Alfred Thayer Mahan. This spelling came from a bad Wikidata label.
- **English books marked Bangla.** *The War of the Worlds* and *The Adventures of Sherlock Holmes* were saved with language `bn`, which listed them among the Bangla books. They are now `en`.

## How the catalog was checked

- **948 curated books linking Gutenberg.** Each book's Gutenberg record (author, translator, subjects) was compared with Wikidata's languages for its author, the same test the whole-catalog import uses to find translations. The 176 books it flagged were read one by one; the doubtful ones were checked against the text itself.
  - 167 translations already credit their translator, and each translator died by 1965.
  - The rest are listed above or were false alarms. Equiano and *Pharmacographia* were written in English.
- **74 books whose author Wikidata doesn't have.** Read by title and Library of Congress class.
- **445 Bangla Wikisource links.** Their translators were checked against Wikidata on 2026-10-15 (`data/wikisource-translator-check.md`).
- **Books with no link.** They have no text, so neither problem applies to them.
- **Left as is:** *Bacon's Essays and Wisdom of the Ancients* (#56463). The essays, the larger part, were written in English. The *Wisdom of the Ancients* is a Latin work, given "in the modern translation … contained in Bohn's edition", whose translator isn't named. Remove its link by hand if you want the rule applied strictly to every part of a book.
