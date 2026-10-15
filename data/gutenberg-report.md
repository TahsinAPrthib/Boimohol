# Project Gutenberg import — review report

Generated 2026-10-15 by `scripts/gutenberg-import.ts` from Gutenberg's official RDF catalog feed (`cache/epub/feeds/rdf-files.tar.bz2`, downloaded 2026-10-16; download counts are Gutenberg's last-30-days figures). Public-domain cutoff: died in **1965 or earlier**.

## Totals

| | Books |
|---|---|
| Gutenberg catalog | 79609 |
| Selected: the 1000 most downloaded that pass every rule (down to 2875 downloads) | 1000 |
| New books to import (`data/gutenberg-import-1.json`, `data/gutenberg-import-2.json`) | 890 |
| Links for books already in the catalog (same files, at the end) | 22 |
| Selected but no fitting category (`data/gutenberg-unfit.json`, not imported) | 85 |
| Left out while selecting, with reasons (`data/gutenberg-excluded.json`) | 1010 |

**Language.** Gutenberg has no Bangla books, so every row is English (`language: "en"` — the language of the text the link leads to, including English translations).

**Descriptions.** 112 very well-known works got an original one-sentence Bangla description (`scripts/gutenberg/descriptions.ts`); the rest a neutral line (author, original language, form, translator), e.g. “Lucy Maud Montgomery-এর ইংরেজি উপন্যাস।”

**Bangla titles.** Only where Wikidata links the work to a Bangla Wikipedia article (its title, as the established Bangla name): 127 books. No title was translated.

**Wikidata cross-check.** 1003 of the 1118 authors and translators in the rows were found on Wikidata with a death date (through the Wikipedia page Gutenberg links them to); the rest rely on Gutenberg's catalog year alone.

## Needs your decision

1. **Bangla titles.** 107 new books carry the title of their Bangla Wikipedia article as `titleBangla`. Most are transliterations (“প্রাইড অ্যান্ড প্রেজুডিস”), a few translations (“যুদ্ধ ও শান্তি”). Covers and lists show the Bangla title first, as for the catalog's own foreign books. Keep them, or keep only translated ones?
2. **Language.** Every row is `en`, the language of the text the link leads to (also for translations). The catalog's own foreign books keep their original language (*Crime and Punishment* is `ru`), so the ইংরেজি filter won't show them even once they have an English Gutenberg link.
3. **What “most downloaded” means.** Gutenberg's count covers the last 30 days, so 35 recent releases (ebook ids from 77000) are in on a short spike, e.g. *Barry Locke, Half-back*, *A Guide to the History of Physical Education*, *Tales Grotesque and Curious*. They pass every rule; drop them if you'd rather have only long-standing favourites.
4. **85 selected books fit no category** (dictionaries, cookery, manuals, textbooks, folklore collections ...), listed below and in `data/gutenberg-unfit.json`. Not imported.

## New books by category

| Category | Books |
|---|---|
| `uponnash` | 276 |
| `itihash-jiboni` | 139 |
| `probondho` | 134 |
| `thriller-rohosso` | 103 |
| `kobita` | 58 |
| `shishu-sahitto` | 58 |
| `chhotogolpo` | 40 |
| `natok` | 40 |
| `biggan-kolpokahini` | 22 |
| `bhromon` | 18 |
| `atmounnoyon` | 2 |

| Form | Category | Books |
|---|---|---|
| উপন্যাস | `uponnash` | 276 |
| রহস্য-রোমাঞ্চ কাহিনি | `thriller-rohosso` | 103 |
| দর্শন বিষয়ক বই | `probondho` | 102 |
| ইতিহাস বিষয়ক বই | `itihash-jiboni` | 81 |
| কাব্যগ্রন্থ | `kobita` | 58 |
| ছোটদের বই | `shishu-sahitto` | 58 |
| জীবনী | `itihash-jiboni` | 58 |
| গল্পের বই | `chhotogolpo` | 40 |
| নাটক | `natok` | 40 |
| বিজ্ঞান কল্পকাহিনী | `biggan-kolpokahini` | 22 |
| ভ্রমণকাহিনি | `bhromon` | 18 |
| প্রবন্ধের বই | `probondho` | 15 |
| বিজ্ঞান বিষয়ক বই | `probondho` | 12 |
| ধর্ম বিষয়ক বই | `probondho` | 5 |
| আত্ম-উন্নয়নের বই | `atmounnoyon` | 2 |

## Links for books already in the catalog

| Catalog book | Author | Gutenberg |
|---|---|---|
| Frankenstein | Mary Shelley | https://www.gutenberg.org/ebooks/84 |
| The Adventures of Sherlock Holmes | Arthur Conan Doyle | https://www.gutenberg.org/ebooks/1661 |
| Crime and Punishment | Fyodor Dostoevsky | https://www.gutenberg.org/ebooks/2554 |
| A Study in Scarlet | Arthur Conan Doyle | https://www.gutenberg.org/ebooks/244 |
| The Hound of the Baskervilles | Arthur Conan Doyle | https://www.gutenberg.org/ebooks/2852 |
| The Time Machine | H. G. Wells | https://www.gutenberg.org/ebooks/35 |
| The Moonstone | Wilkie Collins | https://www.gutenberg.org/ebooks/155 |
| The Sign of the Four | Arthur Conan Doyle | https://www.gutenberg.org/ebooks/2097 |
| The Thirty-Nine Steps | John Buchan | https://www.gutenberg.org/ebooks/558 |
| The War of the Worlds | H. G. Wells | https://www.gutenberg.org/ebooks/36 |
| The Prophet | Kahlil Gibran | https://www.gutenberg.org/ebooks/58585 |
| Autobiography of a Yogi | Paramahansa Yogananda | https://www.gutenberg.org/ebooks/7452 |
| Up from Slavery | Booker T. Washington | https://www.gutenberg.org/ebooks/2376 |
| Leaves of Grass | Walt Whitman | https://www.gutenberg.org/ebooks/1322 |
| Meditations | Marcus Aurelius | https://www.gutenberg.org/ebooks/55317 |
| As a Man Thinketh | James Allen | https://www.gutenberg.org/ebooks/4507 |
| The Invisible Man | H. G. Wells | https://www.gutenberg.org/ebooks/5230 |
| The Science of Getting Rich | Wallace D. Wattles | https://www.gutenberg.org/ebooks/59844 |
| The Island of Doctor Moreau | H. G. Wells | https://www.gutenberg.org/ebooks/159 |
| We | Yevgeny Zamyatin | https://www.gutenberg.org/ebooks/61963 |
| Self-Help | Samuel Smiles | https://www.gutenberg.org/ebooks/935 |
| The Waste Land | T. S. Eliot | https://www.gutenberg.org/ebooks/1321 |

## Selected, but no fitting category

| Book | Author | Downloads | Why |
|---|---|---|---|
| [The Nuttall Encyclopædia](https://www.gutenberg.org/ebooks/12342) | P. Austin Nuttall | 25634 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [Arrian on Coursing](https://www.gutenberg.org/ebooks/78013) | Arrian | 24899 | non-fiction of no clear form (shelves: none) |
| [The Dogaressas of Venice (the Wives of the Doges)](https://www.gutenberg.org/ebooks/78047) | Edgcumbe Staley | 24851 | non-fiction of no clear form (shelves: none) |
| [Cartels](https://www.gutenberg.org/ebooks/78077) | Wendell Berge | 24745 | non-fiction of no clear form (shelves: none) |
| [The Adventures of an Ensign](https://www.gutenberg.org/ebooks/78078) | Valentine Williams | 24633 | non-fiction of no clear form (shelves: none) |
| [Body-build and Its Inheritance](https://www.gutenberg.org/ebooks/78107) | Charles Benedict Davenport | 24615 | non-fiction of no clear form (shelves: none) |
| [The Eclipse of Russia](https://www.gutenberg.org/ebooks/78075) | E. J. Dillon | 24586 | non-fiction of no clear form (shelves: none) |
| [Democracy—false or True?](https://www.gutenberg.org/ebooks/78117) | W. B.  Richmond | 24551 | non-fiction of no clear form (shelves: none) |
| [Astronomy for Beginners](https://www.gutenberg.org/ebooks/78112) | Hereward Carrington | 24489 | non-fiction of no clear form (shelves: none) |
| [The Servant's Behaviour Book](https://www.gutenberg.org/ebooks/78121) | Emily A. Patmore | 24421 | non-fiction of no clear form (shelves: none) |
| [An Etymological Dictionary of the Scottish Language](https://www.gutenberg.org/ebooks/40521) | John Jamieson | 20092 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [Calculus Made Easy](https://www.gutenberg.org/ebooks/33283) | Silvanus P. Thompson | 17701 | non-fiction of no clear form (shelves: none) |
| [Roget's Thesaurus](https://www.gutenberg.org/ebooks/10681) | Peter Mark Roget | 16983 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [The Notebooks of Leonardo Da Vinci](https://www.gutenberg.org/ebooks/5000) | Leonardo da Vinci | 16121 | non-fiction we have no category for (Engineering & Technology) |
| [The Elements of Style](https://www.gutenberg.org/ebooks/37134) | William Strunk, Jr. | 15473 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [All About Coffee](https://www.gutenberg.org/ebooks/28500) | William H. Ukers | 15451 | non-fiction we have no category for (Cooking & Drinking) |
| [The Sailor's Word-Book](https://www.gutenberg.org/ebooks/26000) | William Henry Smyth | 13122 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [Three Hundred Aesop’s Fables](https://www.gutenberg.org/ebooks/21) | Aesop | 12703 | non-fiction of no clear form (shelves: Mythology, Legends & Folklore, Classics of Literature) |
| [Enquire Within Upon Everything](https://www.gutenberg.org/ebooks/10766) | Robert Kemp Philp | 10779 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [How We Think](https://www.gutenberg.org/ebooks/37423) | John Dewey | 9318 | non-fiction we have no category for (Teaching & Education) |
| [Democracy and Education](https://www.gutenberg.org/ebooks/852) | John Dewey | 9129 | non-fiction we have no category for (Teaching & Education) |
| [Science in the Kitchen](https://www.gutenberg.org/ebooks/12238) | Ella Eaton Kellogg | 8518 | non-fiction we have no category for (Cooking & Drinking) |
| [The Complete Herbal](https://www.gutenberg.org/ebooks/49513) | Nicholas Culpeper | 8272 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [Practical Mechanics for Boys](https://www.gutenberg.org/ebooks/22298) | Jules Verne | 7630 | non-fiction we have no category for (Engineering & Technology) |
| [Chess Fundamentals](https://www.gutenberg.org/ebooks/33870) | José Raúl Capablanca | 7393 | non-fiction we have no category for (How To ...) |
| [The Art of Public Speaking](https://www.gutenberg.org/ebooks/16317) | Joseph Berg Esenwein ও Dale Carnegie | 7040 | non-fiction we have no category for (How To ...) |
| [Amusements in Mathematics](https://www.gutenberg.org/ebooks/16713) | Henry Dudeney | 6884 | non-fiction we have no category for (Mathematics) |
| [Southern Literature From 1579-1895](https://www.gutenberg.org/ebooks/27279) | Louise Manly | 6808 | non-fiction we have no category for (Teaching & Education) |
| [How to Live on 24 Hours a Day](https://www.gutenberg.org/ebooks/2274) | Arnold Bennett | 6767 | non-fiction we have no category for (How To ...) |
| [Argonauts of the Western Pacific](https://www.gutenberg.org/ebooks/55822) | Bronisław Malinowski | 6255 | non-fiction of no clear form (shelves: Archaeology & Anthropology) |
| [The Horsewoman](https://www.gutenberg.org/ebooks/26318) | Alice M. Hayes | 6254 | non-fiction we have no category for (How To ...) |
| [A Concise Anglo-Saxon Dictionary](https://www.gutenberg.org/ebooks/31543) | John Richard Clark Hall | 6060 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [A Treatise on Domestic Economy](https://www.gutenberg.org/ebooks/21829) | Catharine Beecher | 5932 | non-fiction we have no category for (Health & Medicine) |
| [The Devil's Dictionary](https://www.gutenberg.org/ebooks/972) | Ambrose Bierce | 5875 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [Hobson-Jobson](https://www.gutenberg.org/ebooks/58529) | Henry Yule ও Arthur Coke Burnell | 5749 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [1000 Mythological Characters Briefly Described](https://www.gutenberg.org/ebooks/42474) | Edward S. Ellis | 5676 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [The Practice and Science of Drawing](https://www.gutenberg.org/ebooks/14264) | Harold Speed | 5520 | non-fiction we have no category for (How To ...) |
| [Etiquette in Society, in Business, in Politics, and at Home](https://www.gutenberg.org/ebooks/14314) | Emily Post | 5399 | non-fiction we have no category for (How To ...) |
| [The Principles of Scientific Management](https://www.gutenberg.org/ebooks/6435) | Frederick Winslow Taylor | 5020 | non-fiction we have no category for (Business/Management) |
| [A Dictionary of Islam](https://www.gutenberg.org/ebooks/61526) | Thomas Hughes | 5011 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [Cookery and Dining in Imperial Rome](https://www.gutenberg.org/ebooks/29728) | Marcus Gavius Apicius | 4943 | non-fiction we have no category for (Cooking & Drinking) |
| [Talks To Teachers On Psychology](https://www.gutenberg.org/ebooks/16287) | William James | 4880 | non-fiction we have no category for (Teaching & Education) |
| [Palmistry for All](https://www.gutenberg.org/ebooks/20480) | Cheiro | 4778 | non-fiction we have no category for (How To ...) |
| [The Psychology of Singing](https://www.gutenberg.org/ebooks/21957) | David C. Taylor | 4748 | non-fiction we have no category for (Health & Medicine) |
| [A Complete Guide to Heraldry](https://www.gutenberg.org/ebooks/41617) | Arthur Charles Fox-Davies | 4579 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [The First Six Books of the Elements of Euclid](https://www.gutenberg.org/ebooks/21076) | Euclid ও John Casey | 4494 | non-fiction of no clear form (shelves: none) |
| [Mrs Beeton's Book of Household Management](https://www.gutenberg.org/ebooks/10136) | Isabella Beeton | 4467 | non-fiction we have no category for (Cooking & Drinking) |
| [A Treatise Upon the Law of Copyright in the United Kingdom and the Dominions of the Crown,](https://www.gutenberg.org/ebooks/43945) | Evan James MacGillivray | 4381 | non-fiction we have no category for (Law & Criminology) |
| [Mechanical Drawing Self-Taught](https://www.gutenberg.org/ebooks/23319) | Joshua Rose | 4280 | non-fiction we have no category for (Engineering & Technology) |
| [The Common Law](https://www.gutenberg.org/ebooks/2449) | Oliver Wendell Holmes | 4139 | non-fiction we have no category for (Law & Criminology) |
| [Notes on Nursing](https://www.gutenberg.org/ebooks/17366) | Florence Nightingale | 4124 | non-fiction we have no category for (Health & Medicine) |
| [On The Principles of Political Economy, and Taxation](https://www.gutenberg.org/ebooks/33310) | David Ricardo | 4104 | non-fiction of no clear form (shelves: Economics) |
| [Principles of Political Economy](https://www.gutenberg.org/ebooks/30107) | John Stuart Mill | 4072 | non-fiction of no clear form (shelves: Economics) |
| [On Growth and Form](https://www.gutenberg.org/ebooks/55264) | D'Arcy Wentworth Thompson | 3999 | non-fiction we have no category for (Mathematics) |
| [Plain Facts for Old and Young](https://www.gutenberg.org/ebooks/19924) | John Harvey Kellogg | 3963 | non-fiction we have no category for (Health & Medicine) |
| [McGuffey's First Eclectic Reader, Revised Edition](https://www.gutenberg.org/ebooks/14640) | William Holmes McGuffey | 3786 | non-fiction we have no category for (Teaching & Education) |
| [De Re Metallica](https://www.gutenberg.org/ebooks/38015) | Georg Agricola | 3755 | non-fiction we have no category for (Engineering & Technology) |
| [Dictionary of Quotations from Ancient and Modern, English and Foreign Sources](https://www.gutenberg.org/ebooks/48105) | James Wood | 3755 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [Critical and Historical Essays](https://www.gutenberg.org/ebooks/16351) | Edward MacDowell | 3754 | non-fiction we have no category for (Music) |
| [A Dictionary of Slang, Cant, and Vulgar Words](https://www.gutenberg.org/ebooks/47018) | John Camden Hotten | 3733 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [A Concise Dictionary of Middle English from A.D. 1150 to 1580](https://www.gutenberg.org/ebooks/10625) | A. L. Mayhew ও Walter William Skeat | 3695 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [Woman](https://www.gutenberg.org/ebooks/21840) | William J. Robinson | 3633 | non-fiction we have no category for (Health & Medicine) |
| [The Advancement of Learning](https://www.gutenberg.org/ebooks/5500) | Francis Bacon | 3623 | non-fiction we have no category for (Teaching & Education) |
| [English Surnames](https://www.gutenberg.org/ebooks/59959) | Charles Wareing Endell Bardsley | 3614 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [A Complete Dictionary of Synonyms and Antonyms](https://www.gutenberg.org/ebooks/51155) | Samuel Fallows | 3602 | non-fiction of no clear form (shelves: none) |
| [The Boston Cooking-school Cook Book](https://www.gutenberg.org/ebooks/65061) | Fannie Farmer | 3558 | non-fiction we have no category for (Cooking & Drinking) |
| [The Field and Garden Vegetables of America](https://www.gutenberg.org/ebooks/21682) | Fearing Burr | 3533 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [A Course of Pure Mathematics](https://www.gutenberg.org/ebooks/38769) | G.H. Hardy | 3506 | non-fiction of no clear form (shelves: none) |
| [The Progress of Invention in the Nineteenth Century.](https://www.gutenberg.org/ebooks/41538) | Edward W. Byrn | 3482 | non-fiction we have no category for (Engineering & Technology) |
| [The Seven Lamps of Architecture](https://www.gutenberg.org/ebooks/35898) | John Ruskin | 3343 | non-fiction we have no category for (Architecture) |
| [History of Education](https://www.gutenberg.org/ebooks/27963) | Levi Seeley | 3289 | non-fiction we have no category for (Teaching & Education) |
| [Scouting for Boys](https://www.gutenberg.org/ebooks/65993) | Robert Baden-Powell, 1st Baron Baden-Powell | 3261 | non-fiction we have no category for (How To ...) |
| [Commentaries on the Laws of England](https://www.gutenberg.org/ebooks/30802) | William Blackstone | 3232 | non-fiction we have no category for (Law & Criminology) |
| [Tagalog Texts with Grammatical Analysis](https://www.gutenberg.org/ebooks/50797) | Leonard Bloomfield | 3221 | non-fiction we have no category for (Language & Communication) |
| [The Sovereignty of the Sea](https://www.gutenberg.org/ebooks/54977) | Thomas Wemyss Fulton | 3217 | non-fiction we have no category for (Law & Criminology) |
| [A Dictionary of Arts, Manufactures and Mines](https://www.gutenberg.org/ebooks/44562) | Andrew Ure | 3199 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [Line and Form (1900)](https://www.gutenberg.org/ebooks/25290) | Walter Crane | 3181 | non-fiction we have no category for (How To ...) |
| [A History of Architecture in All Countries, Volumes 1 and 2, 3rd Ed.](https://www.gutenberg.org/ebooks/55870) | James Fergusson | 3100 | non-fiction we have no category for (Architecture) |
| [The Slang Dictionary](https://www.gutenberg.org/ebooks/42108) | John Camden Hotten | 3081 | non-fiction we have no category for (Encyclopedias/Dictionaries/Reference) |
| [The American Language](https://www.gutenberg.org/ebooks/43376) | H. L. Mencken | 3069 | non-fiction we have no category for (Language & Communication) |
| [The Elements of Drawing, in Three Letters to Beginners](https://www.gutenberg.org/ebooks/30325) | John Ruskin | 3011 | non-fiction we have no category for (How To ...) |
| [The Oldest Code of Laws in the World](https://www.gutenberg.org/ebooks/17150) | Hammurabi | 2986 | non-fiction we have no category for (Law & Criminology) |
| [The Art of Stage Dancing](https://www.gutenberg.org/ebooks/27367) | Ned Wayburn | 2986 | non-fiction we have no category for (How To ...) |
| [Shell-shock and Other Neuropsychiatric Problems](https://www.gutenberg.org/ebooks/52105) | Elmer Ernest Southard | 2923 | non-fiction we have no category for (Health & Medicine) |
| [The Idea of a University Defined and Illustrated](https://www.gutenberg.org/ebooks/24526) | John Henry Newman | 2901 | non-fiction we have no category for (Teaching & Education) |

## Excluded while selecting, by reason

Every book with more downloads than the last one selected (2875) that was left out:

| Reason | Books |
|---|---|
| not a text | 212 |
| one volume of a multi-volume work | 179 |
| not in English or Bangla | 156 |
| author died after YYYY | 102 |
| no named author | 84 |
| translation with no named translator | 79 |
| author's death year is unknown | 69 |
| another edition of the same work | 46 |
| translator's death year is unknown | 30 |
| anthology without a single author | 16 |
| translator died in YYYY, after YYYY | 13 |
| editor's death year is unknown | 8 |
| illustrator died in YYYY, after YYYY | 7 |
| anonymous | 4 |
| editor died in YYYY, after YYYY | 3 |
| artist died in YYYY, after YYYY | 1 |
| author died in YYYY, after YYYY | 1 |

The 60 most downloaded of them:

| # | Book | Author | Downloads | Reason |
|---|---|---|---|---|
| 37683 | Chambers's Twentieth Century Dictionary (part 1 of 4: A-D) | — | 76172 | no named author (anonymous, or only an editor or translator credited) |
| 2641 | A Room with a View | Forster, E. M. (Edward Morgan) | 70690 | author died after 1965 (Gutenberg catalog) |
| 1184 | The Count of Monte Cristo | Dumas, Alexandre; Maquet, Auguste | 52008 | translation with no named translator (the author didn't write in English, per Wikidata) |
| 2680 | Meditations | Marcus Aurelius, Emperor of Rome | 50637 | translation with no named translator (the author didn't write in English, per Wikidata) |
| 16328 | Beowulf: An Anglo-Saxon Epic Poem | — | 50413 | no named author (anonymous, or only an editor or translator credited) |
| 65238 | The Secret of Chimneys | Christie, Agatha | 50307 | author died after 1965 (Gutenberg catalog) |
| 5197 | My Life — Volume 1 | Wagner, Richard | 50152 | one volume of a multi-volume work |
| 5200 | Metamorphosis | Kafka, Franz | 47449 | translator's death year is unknown (David Wyllie) |
| 1259 | Twenty years after | Dumas, Alexandre; Maquet, Auguste | 46606 | translation with no named translator (the author didn't write in English, per Wikidata) |
| 47530 | Oliver Twist, Vol. 2 (of 3) | Dickens, Charles | 42032 | one volume of a multi-volume work |
| 40284 | The Sex Life of the Gods | Knerr, M. E. (Michael E.) | 41358 | author died after 1965 (Gutenberg catalog) |
| 2591 | Grimms' Fairy Tales | Grimm, Jacob; Grimm, Wilhelm | 37383 | translation with no named translator (the author didn't write in English, per Wikidata) |
| 78033 | The silent Baltic : $b or, Detained near Kiel | Knox, Marcus | 37335 | author's death year is unknown (Marcus Knox) |
| 51252 | The Book of the Thousand Nights and a Night — Volume 01 (of 10) | — | 35983 | no named author (anonymous, or only an editor or translator credited) |
| 42671 | Pride and Prejudice | Austen, Jane | 33256 | another edition of the same work (kept #1342) |
| 47642 | The Strand Magazine, Vol. 27, February 1904, No. 159. | Various | 32168 | anthology without a single author ("Various") |
| 53419 | Twenty-Five Ghost Stories | — | 30972 | no named author (anonymous, or only an editor or translator credited) |
| 2148 | The Works of Edgar Allan Poe — Volume 2 | Poe, Edgar Allan | 30902 | one volume of a multi-volume work |
| 50290 | Space Station 1 | Long, Frank Belknap | 30832 | author died after 1965 (Gutenberg catalog) |
| 69087 | The murder of Roger Ackroyd | Christie, Agatha | 30771 | author died after 1965 (Gutenberg catalog) |
| 61262 | Poirot Investigates | Christie, Agatha | 29928 | author died after 1965 (Gutenberg catalog) |
| 20203 | Autobiography of Benjamin Franklin | Franklin, Benjamin | 29881 | editor's death year is unknown (Frank Woodworth Pine) |
| 58866 | The Murder on the Links | Christie, Agatha | 29614 | author died after 1965 (Gutenberg catalog) |
| 61168 | The Man in the Brown Suit | Christie, Agatha | 29124 | author died after 1965 (Gutenberg catalog) |
| 50603 | Minute Mysteries [Detectograms] | Ripley, H. A. (Harold Austin) | 28667 | author's death year is unknown (H. A. Ripley) |
| 38177 | The Passionate Elopement | MacKenzie, Compton | 28652 | author died after 1965 (Gutenberg catalog) |
| 51649 | The Mysteries of London, v. 4/4 | Reynolds, George W. M. (George William MacArthur) | 28559 | one volume of a multi-volume work |
| 42681 | The Hero of the People: A Historical Romance of Love, Liberty and Loyalty | Dumas, Alexandre | 27581 | translator's death year is unknown (Henry Llewellyn Williams) |
| 44833 | Chaucer's Works, Volume 2 — Boethius and Troilus | Chaucer, Geoffrey | 26360 | one volume of a multi-volume work |
| 78102 | The wheel of earth | Sandburg, Helga | 25951 | author died after 1965 (Gutenberg catalog) |
| 78084 | The mysterious Mr. Quin | Christie, Agatha | 25718 | author died after 1965 (Gutenberg catalog) |
| 78016 | Herman Melville | Mumford, Lewis | 25410 | author died after 1965 (Gutenberg catalog) |
| 78017 | The Swiss family Robinson | Wyss, Johann David | 25237 | translation with no named translator (the author didn't write in English, per Wikidata) |
| 78065 | The anatomy of revolution | Brinton, Crane | 25201 | author died after 1965 (Gutenberg catalog) |
| 78122 | The history of the Norman conquest of England, its causes and its results, Volum | Freeman, Edward A. (Edward Augustus) | 25028 | one volume of a multi-volume work |
| 78119 | Humanism and America : $b Essays on the outlook of modern civilisation | — | 25003 | no named author (anonymous, or only an editor or translator credited) |
| 863 | The Mysterious Affair at Styles | Christie, Agatha | 24963 | author died after 1965 (Gutenberg catalog) |
| 78124 | 1066 and all that : $b A memorable history of England, comprising all the parts  | Sellar, Walter Carruthers; Yeatman, Robert Julian | 24874 | author died after 1965 (Gutenberg catalog) |
| 78039 | Boston : $b a novel | Sinclair, Upton | 24810 | author died after 1965 (Gutenberg catalog) |
| 78053 | Field Artillery Training. 1914 | Great Britain. War Office | 24808 | author's death year is unknown (Great Britain. War Office) |
| 10 | The King James Version of the Bible | — | 24756 | no named author (anonymous, or only an editor or translator credited) |
| 49008 | The Works of William Shakespeare [Cambridge Edition] [Vol. 8 of 9] | Shakespeare, William | 24732 | one volume of a multi-volume work |
| 78090 | Blackwood's Edinburgh magazine, volume 456, no. 10, October 1853 | Various | 24724 | anthology without a single author ("Various") |
| 78092 | Records of Captain Clapperton's last expedition to Africa, Vol. 2 (of 2) | Lander, Richard | 24674 | one volume of a multi-volume work |
| 42 | The strange case of Dr. Jekyll and Mr. Hyde | Stevenson, Robert Louis | 24650 | another edition of the same work (kept #43) |
| 78028 | The loot of the Lazy A | Tuttle, W. C. (Wilbur C.) | 24606 | author died after 1965 (Gutenberg catalog) |
| 78104 | An historical account of all the voyages round the world, performed by English n | — | 24587 | no named author (anonymous, or only an editor or translator credited) |
| 78005 | The Green Dolphin | Bassett, Sara Ware | 24555 | author died after 1965 (Gutenberg catalog) |
| 78095 | Great rivers of the world : $b as seen and described by famous writers | — | 24536 | no named author (anonymous, or only an editor or translator credited) |
| 78126 | The weird of the wanderer : $b Being the papyrus records of some incidents in on | Rolfe, Frederick; Pirie-Gordon, C. H. C. (Charles Harry Clinton) | 24530 | author died after 1965 (Gutenberg catalog) |
| 78083 | Fawn in the wood | Unknown | 24519 | anonymous |
| 78111 | How they loved him, Vol. 2 (of 3) : $b A novel | Marryat, Florence | 24519 | one volume of a multi-volume work |
| 78004 | An historical account of all the voyages round the world, performed by English n | — | 24517 | no named author (anonymous, or only an editor or translator credited) |
| 78019 | An historical account of all the voyages round the world, performed by English n | — | 24510 | no named author (anonymous, or only an editor or translator credited) |
| 78032 | Twelve years in the army : $b or, The incidents of a soldier's life | Gollan, John G. | 24501 | author's death year is unknown (John G. Gollan) |
| 78015 | Khartoum, and the Blue and White Niles, Vol. 2 (of 2) | Melly, George | 24480 | one volume of a multi-volume work |
| 78024 | The woman of Andros | Wilder, Thornton | 24470 | author died after 1965 (Gutenberg catalog) |
| 47221 | Quintus Claudius: A Romance of Imperial Rome. Volume 1 | Eckstein, Ernst | 24437 | one volume of a multi-volume work |
| 78076 | Robert Frost : $b A study in sensibility and good sense | Munson, Gorham Bert | 24414 | author died after 1965 (Gutenberg catalog) |
| 78048 | Sandhills sketches | Haynes, Williams | 24412 | author died after 1965 (Gutenberg catalog) |

## Catalog and Wikidata disagree on a death year

The later year was used (the stricter choice).

- Homer: catalog -650, Wikidata -701
- Merrill, Frank T.: catalog 1923, Wikidata 1936
- Arrian: catalog 175, Wikidata 180
- Epictetus: catalog 135, Wikidata 138
- Aristophanes: catalog -388, Wikidata -385
- Tacitus, Cornelius: catalog 117, Wikidata 120
- Plutarch: catalog 119, Wikidata 120
- Xenophon: catalog -355, Wikidata -354
- Bierce, Ambrose: catalog 1913, Wikidata 1914
- Livy: catalog 16, Wikidata 17
- Miller, Florence Fenwick: catalog 1936, Wikidata 1935
- Morton, Thomas: catalog 1646, Wikidata 1647
- Herodotus: catalog -430, Wikidata -425
- Caesar, Julius: catalog -43, Wikidata -44
- Hogarth, C. J. (Charles James): catalog 1942, Wikidata 1945

## Per author (new books and links)

| Author | Books |
|---|---|
| Charles Dickens | 15 |
| Plato | 15 |
| William Shakespeare | 14 |
| Mark Twain | 13 |
| Edgar Wallace | 12 |
| Arthur Conan Doyle | 11 |
| G. K. Chesterton | 10 |
| H. G. Wells | 10 |
| Edgar Rice Burroughs | 9 |
| Oscar Wilde | 9 |
| Fyodor Dostoevsky | 7 |
| Jane Austen | 7 |
| Thomas Hardy | 7 |
| Charles Darwin | 6 |
| Edgar Allan Poe | 6 |
| Jack London | 5 |
| John Stuart Mill | 5 |
| José Rizal | 5 |
| Lucy Maud Montgomery | 5 |
| R. Austin Freeman | 5 |
| Robert E. Howard | 5 |
| Robert Louis Stevenson | 5 |
| Anton Chekhov | 4 |
| Beatrix Potter | 4 |
| Charles Norris Williamson ও Alice Muriel Williamson | 4 |
| David Hume | 4 |
| Francis Bacon | 4 |
| Friedrich Nietzsche | 4 |
| George Eliot | 4 |
| H. P. Lovecraft | 4 |
| Henry James | 4 |
| Hilaire Belloc | 4 |
| Homer | 4 |
| Immanuel Kant | 4 |
| John Buchan | 4 |
| Joseph Conrad | 4 |
| Jules Verne | 4 |
| Leo Tolstoy | 4 |
| Louis Tracy | 4 |
| Nathaniel Hawthorne | 4 |
| Rudyard Kipling | 4 |
| Sax Rohmer | 4 |
| Walter Scott | 4 |
| William James | 4 |
| Algernon Blackwood | 3 |
| Aristotle | 3 |
| Dante Alighieri | 3 |
| Edith Wharton | 3 |
| Ernest Hemingway | 3 |
| Henrik Ibsen | 3 |
| Henry David Thoreau | 3 |
| James Grant | 3 |
| James Joyce | 3 |
| Johann Wolfgang von Goethe | 3 |
| Jonathan Swift | 3 |
| L. Frank Baum | 3 |
| Lewis Carroll | 3 |
| Louisa May Alcott | 3 |
| Mary Elizabeth Braddon | 3 |
| Ralph Waldo Emerson | 3 |

## Spot-check

See `data/gutenberg-spot-check.md` (`scripts/gutenberg-spot-check.ts`).
