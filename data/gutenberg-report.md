# Project Gutenberg import — review report

Generated 2026-10-16 by `scripts/gutenberg-import.ts` from Gutenberg's official RDF catalog feed (`cache/epub/feeds/rdf-files.tar.bz2`, downloaded 2026-10-16; download counts are Gutenberg's last-30-days figures). Public-domain cutoff: died in **1965 or earlier**.

## Totals

| | Books |
|---|---|
| Gutenberg catalog | 79609 |
| Selected: the 1000 most downloaded that pass every rule (down to 2734 downloads) | 1000 |
| New books to import (`data/gutenberg-import-1.json`, `data/gutenberg-import-2.json`) | 926 |
| Links for books already in the catalog (same files, at the end) | 22 |
| Selected but not imported: reference works, manuals, cookbooks and a few undecided (`data/gutenberg-unfit.json`) | 51 |
| Left out while selecting, with reasons (`data/gutenberg-excluded.json`) | 1118 |

**Language.** Gutenberg has no Bangla books, so every row is English (`language: "en"` — the language of the text the link leads to, including English translations).

**Descriptions.** 122 very well-known works got an original one-sentence Bangla description (`scripts/gutenberg/descriptions.ts`); the rest a neutral line (author, original language, form, translator), e.g. “Lucy Maud Montgomery-এর ইংরেজি উপন্যাস।”

**Bangla titles.** Shown only where the book has a genuine, well-established Bangla title (`scripts/gutenberg/titles.ts`): 9 new books — যুদ্ধ ও শান্তি, বাবরনামা, আতঙ্কের উপত্যকা, কমিউনিস্ট ইস্তেহার, পেলোপনেশীয় যুদ্ধের ইতিহাস, রাজনীতি, সলোমনের গুপ্তধন, কথাসরিৎসাগর, ইংল্যান্ডে শ্রমিক শ্রেণির অবস্থা. The other 102 Bangla Wikipedia titles (transliterations such as “প্রাইড অ্যান্ড প্রেজুডিস”, or names such as “হ্যামলেট”) are hidden search aliases (`searchAliases`): never shown, but a search in Bangla script finds the book. Link rows carry the catalog book's own titles; `data/catalog-title-corrections.json` (optional, from `scripts/catalog-title-corrections.ts`) applies the same rule to the catalog's own foreign books — 54 update rows that hide a transliterated Bangla title and keep it as a search alias.

**Translators.** 167 new books are translations; each row credits its translator (`translator`, shown on the book page as “অনুবাদ: …”). Every translator passed the same death-year rule as the authors — Gutenberg's year, cross-checked with Wikidata where Gutenberg links the person to Wikipedia (132 of 181 found there), the later year counting. A translation with no named translator, or one whose translator died after 1965 or has no known death year, is left out (see the exclusion reasons). Link rows don't set a translator: they add a link to a catalog book and change nothing else about it; the link's rights note names the translator.

**Wikidata cross-check.** 1057 of the 1168 authors and translators in the rows were found on Wikidata with a death date (through the Wikipedia page Gutenberg links them to); the rest rely on Gutenberg's catalog year alone.

## Decisions applied (2026-10-16)

1. **Bangla titles:** only genuine Bangla titles are shown; transliterations are search aliases (above).
2. **পুরাণ ও লোককথা:** 34 books moved there (listed below), from all the selected books, including the ones first listed as fitting no category and the children's books.
3. **Recent releases dropped:** 46 books released from October 2025 (ebook #77000 on) that passed every other rule were left out; the selection went further down the list to keep 1000. Listed below.
4. **Non-fiction first listed as fitting no category:** essays, philosophy, religion, science (with mathematics and economics) and letters now go to `probondho`, plain history to `itihash-jiboni`, and *How to Live on 24 Hours a Day* to `atmounnoyon`; reference works, manuals and cookbooks stay out. **What's left: 4 books** — *A Treatise Upon the Law of Copyright in the United Kingdom and the Dominions of the Crown,*, *The Common Law*, *Commentaries on the Laws of England*, *Shell-shock and Other Neuropsychiatric Problems* — law treatises and medical case studies, which no rule covers; they stay out until you decide.
5. **Language filter:** every row is `en`; the library's অন্যান্য ভাষা chip shows every language except Bangla, so the catalog's own foreign books (*Crime and Punishment* is `ru`) appear under it too.

## পুরাণ ও লোককথা

Myths, legends, fables and fairy tales — collections and retellings — and the ancient epics that are a mythology's own texts, as for the Bangla works (the Mahabharata). Books that only use such material stay in their own category.

| Book | Author | Was | Now |
|---|---|---|---|
| [Odyssey](https://www.gutenberg.org/ebooks/1727) | Homer | kobita | `puran-lokkotha` (মহাকাব্য) |
| [Four Arthurian Romances](https://www.gutenberg.org/ebooks/831) | Chrétien de Troyes | uponnash | `puran-lokkotha` (কিংবদন্তির কাহিনি) |
| [Iliad](https://www.gutenberg.org/ebooks/6130) | Homer | kobita | `puran-lokkotha` (মহাকাব্য) |
| [Metamorphoses](https://www.gutenberg.org/ebooks/21765) | Ovid | kobita | `puran-lokkotha` (পুরাণকথার কাব্য) |
| [Three Hundred Aesop’s Fables](https://www.gutenberg.org/ebooks/21) | Aesop | unfit | `puran-lokkotha` (উপকথা) |
| [Aeneid](https://www.gutenberg.org/ebooks/228) | Virgil | kobita | `puran-lokkotha` (মহাকাব্য) |
| [The Romance of Tristan and Iseult](https://www.gutenberg.org/ebooks/14244) | Joseph Bédier | uponnash | `puran-lokkotha` (কিংবদন্তির কাহিনি) |
| [Myths of the Cherokee](https://www.gutenberg.org/ebooks/45634) | James Mooney | uponnash | `puran-lokkotha` (পুরাণকথার সংকলন) |
| [The Merry Adventures of Robin Hood](https://www.gutenberg.org/ebooks/10148) | Howard Pyle | uponnash | `puran-lokkotha` (কিংবদন্তির কাহিনি) |
| [Hesiod, the Homeric Hymns, and Homerica](https://www.gutenberg.org/ebooks/348) | Hesiod | kobita | `puran-lokkotha` (মহাকাব্য ও স্তোত্র) |
| [The Happy Prince and Other Tales](https://www.gutenberg.org/ebooks/902) | Oscar Wilde | shishu-sahitto | `puran-lokkotha` (রূপকথার সংকলন) |
| [King Arthur and the Knights of the Round Table](https://www.gutenberg.org/ebooks/36462) | Thomas Malory | uponnash | `puran-lokkotha` (কিংবদন্তির কাহিনি) |
| [Just So Stories](https://www.gutenberg.org/ebooks/2781) | Rudyard Kipling | shishu-sahitto | `puran-lokkotha` (উপকথার সংকলন) |
| [Fairy Dreams](https://www.gutenberg.org/ebooks/76391) | Jane G. Austin | shishu-sahitto | `puran-lokkotha` (রূপকথার সংকলন) |
| [Hero-Myths & Legends of the British Race](https://www.gutenberg.org/ebooks/25502) | M. I. Ebbutt | uponnash | `puran-lokkotha` (পুরাণ ও কিংবদন্তির কাহিনি) |
| [The Younger Edda](https://www.gutenberg.org/ebooks/18947) | Snorri Sturluson | kobita | `puran-lokkotha` (পুরাণকথা) |
| [The Blue Fairy Book](https://www.gutenberg.org/ebooks/503) | Andrew Lang | shishu-sahitto | `puran-lokkotha` (রূপকথার সংকলন) |
| [Household Tales by Brothers Grimm](https://www.gutenberg.org/ebooks/5314) | Jacob Grimm ও Wilhelm Grimm | shishu-sahitto | `puran-lokkotha` (রূপকথার সংকলন) |
| [Myths of Babylonia and Assyria](https://www.gutenberg.org/ebooks/16653) | Donald Alexander Mackenzie | itihash-jiboni | `puran-lokkotha` (পুরাণকথা) |
| [Argonautica](https://www.gutenberg.org/ebooks/830) | Apollonius of Rhodes | kobita | `puran-lokkotha` (মহাকাব্য) |
| [Kwaidan](https://www.gutenberg.org/ebooks/1210) | Lafcadio Hearn | chhotogolpo | `puran-lokkotha` (কিংবদন্তির কাহিনি) |
| [Kathasaritsagara](https://www.gutenberg.org/ebooks/40588) | Somadeva | uponnash | `puran-lokkotha` (কাহিনিমালা) |
| [The Arabian Nights Entertainments](https://www.gutenberg.org/ebooks/128) | Andrew Lang | shishu-sahitto | `puran-lokkotha` (আরব্য রজনীর গল্প) |
| [Italian Popular Tales](https://www.gutenberg.org/ebooks/23634) | Thomas Frederick Crane | uponnash | `puran-lokkotha` (লোককথার সংকলন) |
| [Japanese Fairy Tales](https://www.gutenberg.org/ebooks/4018) | Yei Theodora Ozaki | shishu-sahitto | `puran-lokkotha` (রূপকথার সংকলন) |
| [Myths and Legends of China](https://www.gutenberg.org/ebooks/15250) | E. T. C. Werner | uponnash | `puran-lokkotha` (পুরাণ ও কিংবদন্তির কাহিনি) |
| [Nights With Uncle Remus](https://www.gutenberg.org/ebooks/26429) | Joel Chandler Harris | chhotogolpo | `puran-lokkotha` (লোককথার সংকলন) |
| [Fifty Famous Stories Retold](https://www.gutenberg.org/ebooks/18442) | James Baldwin | itihash-jiboni | `puran-lokkotha` (কিংবদন্তির কাহিনি) |
| [The Legends of King Arthur and His Knights](https://www.gutenberg.org/ebooks/12753) | James Knowles ও Thomas Malory | uponnash | `puran-lokkotha` (কিংবদন্তির কাহিনি) |
| [The Elder Eddas of Saemund Sigfusson](https://www.gutenberg.org/ebooks/14726) | Sæmundr fróði ও Snorri Sturluson | kobita | `puran-lokkotha` (পুরাণকথার কাব্য) |
| [An Old Babylonian Version of the Gilgamesh Epic](https://www.gutenberg.org/ebooks/11000) | Morris Jastrow, Jr. ও Albert Tobias Clay | kobita | `puran-lokkotha` (মহাকাব্য) |
| [The Story of the Three Little Pigs](https://www.gutenberg.org/ebooks/18155) | Leonard Leslie Brooke | shishu-sahitto | `puran-lokkotha` (রূপকথা) |
| [The Danish History, Books I-IX](https://www.gutenberg.org/ebooks/1150) | Saxo Grammaticus | itihash-jiboni | `puran-lokkotha` (কিংবদন্তির ইতিহাস) |
| [Bulfinch's Mythology](https://www.gutenberg.org/ebooks/4928) | Thomas Bulfinch | new in this run | `puran-lokkotha` (পুরাণকথা) |

Shelved with myths, or with a myth or folklore heading, but kept where they are (39): *The Legend of Sleepy Hollow* (`chhotogolpo` — an original story (Irving)); *Oedipus King of Thebes* (`natok` — a play (Greek tragedy)); *The Divine Comedy* (`kobita` — a later literary poem (Dante)); *The Lady of the Lake* (`kobita` — a later literary poem (Scott)); *A Midsummer Night's Dream* (`natok` — a play (Shakespeare)); *Cornish Characters and Strange Events* (`itihash-jiboni` — history and anecdote (Baring-Gould)); *Bacon's Essays and Wisdom of the Ancients* (`probondho` — essays (Bacon)); *The Ballad of the White Horse* (`kobita` — a later literary poem (Chesterton)); *A Connecticut Yankee in King Arthur's Court* (`uponnash` — an original novel (Twain)); *Hamlet* (`natok` — a play (Shakespeare)); *Hypnerotomachia Poliphili* (`uponnash` — an original allegorical romance (Colonna)); *Don Juan* (`kobita` — a later literary poem (Byron)); *The Faerie Queene* (`kobita` — a later literary poem (Spenser)); *Rip Van Winkle* (`chhotogolpo` — an original story (Irving)); *Psychology of the Unconscious* (`probondho` — psychology (Jung)); *Plays of Sophocles* (`natok` — plays (Greek tragedy)); *The Magic of Jewels and Charms* (`itihash-jiboni` — a study of folklore of gems (Kunz)); *Malay Magic* (`probondho` — ethnography (Skeat)); *Medea* (`natok` — a play (Greek tragedy)); *Curious Facts in the History of Insects* (`itihash-jiboni` — natural history (Cowan)); *The Dryad* (`uponnash` — an original novel (McCarthy)); *Demonology and Devil-lore* (`probondho` — a study of myth (Conway)); *Maugis, Ye Sorcerer* (`uponnash` — an original novel); *The House of the Wolfings* (`uponnash` — an original romance (Morris)); *The Golden Bough* (`probondho` — a study of myth and religion (Frazer)); *Book of the Sword* (`itihash-jiboni` — history (Burton)); *The Agamemnon of Aeschylus* (`natok` — a play (Greek tragedy)); *The Princess and the Goblin* (`shishu-sahitto` — a fantasy novel for children (MacDonald)); *Modern Greek Folklore and Ancient Greek Religion* (`itihash-jiboni` — a study of folklore and religion (Lawson)); *The Wendigo* (`uponnash` — an original horror story (Blackwood)); *King Lear* (`natok` — a play (Shakespeare)); *Strange Stories from a Chinese Studio* (`chhotogolpo` — a writer's own tales of the supernatural (Pu Songling)); *The Bacchae* (`natok` — a play (Greek tragedy)); *Mythology Among the Hebrews and Its Historical Development* (`itihash-jiboni` — a study of myth (Goldziher)); *The Round Towers of Ireland* (`itihash-jiboni` — history (O'Brien)); *Idylls of the King* (`kobita` — a later literary poem (Tennyson)); *Puck of Pook's Hill* (`shishu-sahitto` — historical fantasy stories for children (Kipling)); *The Fairy-Faith in Celtic Countries* (`probondho` — a study of folklore (Evans-Wentz)); *The Religion of Babylonia and Assyria* (`itihash-jiboni` — a study of religion (Jastrow)).

## Recent releases dropped

| # | Book | Author | Downloads (30 days) |
|---|---|---|---|
| 78118 | Barry Locke, half-back | Ralph Henry Barbour | 33952 |
| 78009 | A guide to the history of physical education | Fred Eugene Leonard | 25383 |
| 78105 | Tales grotesque and curious | Ryūnosuke Akutagawa | 25025 |
| 78025 | Main currents in American thought : $b An interpretation of American literature from the b | Vernon Louis Parrington | 25000 |
| 78022 | Præraphaelite diaries and letters | Ford Madox Brown; Dante Gabriel Rossetti; Gabriele Rossetti | 24920 |
| 78013 | Arrian on coursing : $b the Cynegeticus of the younger Xenophon, translated from the Greek | Arrian | 24899 |
| 78120 | The marvellous land of Snergs | E. A. Wyke-Smith | 24859 |
| 78047 | The dogaressas of Venice (the wives of the doges) | Edgcumbe Staley | 24851 |
| 78029 | The dangerous game | William Le Queux | 24835 |
| 78011 | Three sevens : $b A detective story | Perley Poore Sheehan | 24815 |
| 78020 | The cruise of the Nona : $b The story of a cruise from Holyhead to the Wash, with reflecti | Hilaire Belloc | 24750 |
| 78077 | Cartels : $b challenge to a free world | Wendell Berge | 24745 |
| 78044 | Claribel : $b or, Rest at last | Lucy Ellen Guernsey | 24739 |
| 78087 | The black pearl | Marie Lion | 24659 |
| 78078 | The adventures of an ensign | Valentine Williams | 24633 |
| 78046 | Joan and Co. | Frederick Orin Bartlett | 24630 |
| 78107 | Body-build and its inheritance | Charles Benedict Davenport | 24615 |
| 78040 | Kate Mulhall : $b A romance of the Oregon Trail | Ezra Meeker | 24597 |
| 78075 | The eclipse of Russia | Emile Joseph Dillon | 24586 |
| 78117 | Democracy—false or true? : $b A prologue and a dream | W. B.  Richmond | 24551 |
| 78103 | The trouble at Pinelands : $b A detective story | Ernest M. Poate | 24507 |
| 78106 | Things near & far | Arthur Machen | 24505 |
| 78012 | Success | Una L. Silberrad | 24493 |
| 78112 | Astronomy for beginners | Hereward Carrington | 24489 |
| 78094 | The haunting hand | Walter Adolphe Roberts | 24472 |
| 78010 | The unknown seven : $b A detective story | Herman Landon | 24458 |
| 78060 | A young man's story | Sarah Doudney | 24452 |
| 78043 | Bushy : $b a romance founded on fact | Cynthia May Westover Alden | 24426 |
| 78121 | The servant's behaviour book : $b or, Hints on manners and dress for maid servants in smal | Emily A. Patmore | 24421 |
| 78114 | Miniatures of French history | Hilaire Belloc | 24420 |
| 78109 | Grateful Peter's new year's gift | Ruth Lamb | 24399 |
| 78085 | The Catholic Church and history | Hilaire Belloc | 24395 |
| 78110 | Verses | Violet Jacob | 24321 |
| 78051 | Borrowed feathers | Ruth Lamb | 24310 |
| 78023 | Ash-Wednesday | T. S. Eliot | 24304 |
| 78045 | The happiness of Hazelbrook | Charlotte Grace O'Brien | 24214 |
| 78115 | The story of Nelson | Edmund Francis Sellar | 24200 |
| 78086 | A municipal feud | Ernest Haycox | 24005 |
| 78228 | Two happy years in Ceylon | C. F. Gordon Cumming | 23949 |
| 77092 | She who sleeps : $b A romance of New York and the Nile | Sax Rohmer | 8258 |
| 77056 | The dream detective | Sax Rohmer | 4496 |
| 77001 | Moon of madness | Sax Rohmer | 4361 |
| 77022 | The porcelain mask : $b A detective story | John Jay Chichester | 4309 |
| 79363 | Poems | William Blake | 3696 |
| 79401 | Pickman's model | H. P. Lovecraft | 2788 |
| 79268 | A cat book | E. V. Lucas | 2746 |

## Changes from the previous files

**Added (50)** — further down the list, in place of the dropped and de-duplicated books: #53720 *On Love* (`probondho`); #22210 *In the Forbidden Land* (`bhromon`); #2428 *An Essay on Man* (`kobita`); #9294 *The Exploring Expedition to the Rocky Mountains, Oregon and California* (`bhromon`); #16772 *The Story of a Soul (L'Histoire d'une Âme)* (`itihash-jiboni`); #70 *What Is Man?* (`probondho`); #34853 *The Fairy-Faith in Celtic Countries* (`probondho`); #57500 *A History of Economic Doctrines* (`itihash-jiboni`); #23034 *Captain Canot* (`itihash-jiboni`); #10378 *Autobiography* (`itihash-jiboni`); #26624 *The Road to Oz* (`shishu-sahitto`); #13650 *Nonsense Books* (`kobita`); #246 *Rubáiyát of Omar Khayyám* (`kobita`); #3328 *Man and Superman* (`natok`); #39272 *The Inventions, Researches, and Writings of Nikola Tesla* (`probondho`); #396 *The Lady, or the Tiger?* (`chhotogolpo`); #25778 *Polly's Business Venture* (`shishu-sahitto`); #58750 *Superstition and Force* (`itihash-jiboni`); #4099 *The Angel in the House* (`kobita`); #4928 *Bulfinch's Mythology* (`puran-lokkotha`); #1237 *Father Goriot* (`uponnash`); #15491 *Micrographia* (`probondho`); #25500 *A London Life* (`uponnash`); #871 *The Golden Sayings of Epictetus, with the Hymn of Cleanthes* (`probondho`); #59824 *Selected Poems* (`kobita`); #18590 *The Letters of Cassiodorus* (`probondho`); #6124 *Pamela* (`uponnash`); #20758 *The Religion of Babylonia and Assyria* (`itihash-jiboni`); #30775 *Elements of Chemistry,* (`probondho`); #35977 *Letters of Abelard and Heloise* (`probondho`); #69344 *Poine* (`itihash-jiboni`); #9830 *The Beautiful and Damned* (`uponnash`); #46924 *The Bronze Age and the Celtic World* (`itihash-jiboni`); #27365 *Tales of Space and Time* (`biggan-kolpokahini`); #25308 *Eugenics and Other Evils* (`probondho`); #32540 *My First Summer in the Sierra* (`bhromon`); #122 *The Return of the Native* (`uponnash`); #28711 *Operas Every Child Should Know* (`shishu-sahitto`); #25810 *In Connection with the De Willoughby Claim* (`uponnash`); #50857 *St. Paul's Epistles to the Colossians and Philemon* (`probondho`); #60692 *The History of the Standard Oil Company* (`itihash-jiboni`); #59709 *Chuang Tzu* (`probondho`); #15489 *Dream Psychology* (`probondho`); #19002 *Alice's Adventures Under Ground* (`shishu-sahitto`); #53527 *The Existence and Attributes of God, Volumes 1 and 2* (`probondho`); #22090 *The Task of Social Hygiene* (`probondho`); #25496 *New Treasure Seekers* (`shishu-sahitto`); #26163 *Creative Evolution* (`probondho`); #42616 *The Medicine-Men of the Apache. (1892 N 09 / 1887-1888 (pages 443-604)* (`probondho`); #11615 *The Grammar of English Grammars* (`unfit`).

**Removed (48):** #78118 *Barry Locke, half-back* — recent release (ebook #78118, 2026-03-05): in the top downloads on a 30-day spike; #78009 *A guide to the history of physical education* — recent release (ebook #78009, 2026-02-22): in the top downloads on a 30-day spike; #78105 *Tales grotesque and curious* — recent release (ebook #78105, 2026-03-04): in the top downloads on a 30-day spike; #78025 *Main currents in American thought : $b An interpretation of American l* — recent release (ebook #78025, 2026-02-24): in the top downloads on a 30-day spike; #78022 *Præraphaelite diaries and letters* — recent release (ebook #78022, 2026-02-23): in the top downloads on a 30-day spike; #78120 *The marvellous land of Snergs* — recent release (ebook #78120, 2026-03-05): in the top downloads on a 30-day spike; #78029 *The dangerous game* — recent release (ebook #78029, 2026-02-24): in the top downloads on a 30-day spike; #78011 *Three sevens : $b A detective story* — recent release (ebook #78011, 2026-02-23): in the top downloads on a 30-day spike; #78020 *The cruise of the Nona : $b The story of a cruise from Holyhead to the* — recent release (ebook #78020, 2026-02-23): in the top downloads on a 30-day spike; #78044 *Claribel : $b or, Rest at last* — recent release (ebook #78044, 2026-02-26): in the top downloads on a 30-day spike; #78087 *The black pearl* — recent release (ebook #78087, 2026-03-02): in the top downloads on a 30-day spike; #78046 *Joan and Co.* — recent release (ebook #78046, 2026-02-26): in the top downloads on a 30-day spike; #78040 *Kate Mulhall : $b A romance of the Oregon Trail* — recent release (ebook #78040, 2026-02-25): in the top downloads on a 30-day spike; #78103 *The trouble at Pinelands : $b A detective story* — recent release (ebook #78103, 2026-03-04): in the top downloads on a 30-day spike; #78106 *Things near & far* — recent release (ebook #78106, 2026-03-04): in the top downloads on a 30-day spike; #78012 *Success* — recent release (ebook #78012, 2026-02-23): in the top downloads on a 30-day spike; #78094 *The haunting hand* — recent release (ebook #78094, 2026-03-02): in the top downloads on a 30-day spike; #78010 *The unknown seven : $b A detective story* — recent release (ebook #78010, 2026-02-22): in the top downloads on a 30-day spike; #78060 *A young man's story* — recent release (ebook #78060, 2026-02-27): in the top downloads on a 30-day spike; #78043 *Bushy : $b a romance founded on fact* — recent release (ebook #78043, 2026-02-26): in the top downloads on a 30-day spike; #78114 *Miniatures of French history* — recent release (ebook #78114, 2026-03-04): in the top downloads on a 30-day spike; #78109 *Grateful Peter's new year's gift* — recent release (ebook #78109, 2026-03-04): in the top downloads on a 30-day spike; #78085 *The Catholic Church and history* — recent release (ebook #78085, 2026-03-02): in the top downloads on a 30-day spike; #78110 *Verses* — recent release (ebook #78110, 2026-03-04): in the top downloads on a 30-day spike; #78051 *Borrowed feathers* — recent release (ebook #78051, 2026-02-26): in the top downloads on a 30-day spike; #78023 *Ash-Wednesday* — recent release (ebook #78023, 2026-02-23): in the top downloads on a 30-day spike; #78045 *The happiness of Hazelbrook* — recent release (ebook #78045, 2026-02-26): in the top downloads on a 30-day spike; #78115 *The story of Nelson* — recent release (ebook #78115, 2026-03-04): in the top downloads on a 30-day spike; #78086 *A municipal feud* — recent release (ebook #78086, 2026-03-02): in the top downloads on a 30-day spike; #78228 *Two happy years in Ceylon* — recent release (ebook #78228, 2026-03-17): in the top downloads on a 30-day spike; #1001 *Divine Comedy, Longfellow's Translation, Hell* — another edition of the same work (kept #8800); #77092 *She who sleeps : $b A romance of New York and the Nile* — recent release (ebook #77092, 2025-10-20): in the top downloads on a 30-day spike; #77056 *The dream detective* — recent release (ebook #77056, 2025-10-14): in the top downloads on a 30-day spike; #77001 *Moon of madness* — recent release (ebook #77001, 2025-10-07): in the top downloads on a 30-day spike; #77022 *The porcelain mask : $b A detective story* — recent release (ebook #77022, 2025-10-10): in the top downloads on a 30-day spike; #1728 *The Odyssey of Homer* — another edition of the same work (kept #1727); #1004 *Divine Comedy, Longfellow's Translation, Complete* — another edition of the same work (kept #8800); #79363 *Poems* — recent release (ebook #79363, 2026-08-13): in the top downloads on a 30-day spike; #48895 *The Odysseys of Homer, together with the shorter poems* — another edition of the same work (kept #1727); #78013 *Arrian on coursing : $b the Cynegeticus of the younger Xenophon, trans* — recent release (ebook #78013, 2026-02-23): in the top downloads on a 30-day spike; #78047 *The dogaressas of Venice (the wives of the doges)* — recent release (ebook #78047, 2026-02-26): in the top downloads on a 30-day spike; #78077 *Cartels : $b challenge to a free world* — recent release (ebook #78077, 2026-03-01): in the top downloads on a 30-day spike; #78078 *The adventures of an ensign* — recent release (ebook #78078, 2026-03-01): in the top downloads on a 30-day spike; #78107 *Body-build and its inheritance* — recent release (ebook #78107, 2026-03-04): in the top downloads on a 30-day spike; #78075 *The eclipse of Russia* — recent release (ebook #78075, 2026-03-01): in the top downloads on a 30-day spike; #78117 *Democracy—false or true? : $b A prologue and a dream* — recent release (ebook #78117, 2026-03-05): in the top downloads on a 30-day spike; #78112 *Astronomy for beginners* — recent release (ebook #78112, 2026-03-04): in the top downloads on a 30-day spike; #78121 *The servant's behaviour book : $b or, Hints on manners and dress for m* — recent release (ebook #78121, 2026-03-05): in the top downloads on a 30-day spike.

**Category changed (58):** #1727 *Odyssey* kobita → puran-lokkotha; #831 *Four Arthurian Romances* uponnash → puran-lokkotha; #6130 *Iliad* kobita → puran-lokkotha; #33283 *Calculus Made Easy* unfit → probondho; #5000 *The Notebooks of Leonardo Da Vinci* unfit → probondho; #21765 *Metamorphoses* kobita → puran-lokkotha; #21 *Three Hundred Aesop’s Fables* unfit → puran-lokkotha; #228 *Aeneid* kobita → puran-lokkotha; #14244 *The Romance of Tristan and Iseult* uponnash → puran-lokkotha; #45634 *Myths of the Cherokee* uponnash → puran-lokkotha; #10148 *The Merry Adventures of Robin Hood* uponnash → puran-lokkotha; #348 *Hesiod, the Homeric Hymns, and Homerica* kobita → puran-lokkotha; #902 *The Happy Prince and Other Tales* shishu-sahitto → puran-lokkotha; #37423 *How We Think* unfit → probondho; #36462 *King Arthur and the Knights of the Round Table* uponnash → puran-lokkotha; #852 *Democracy and Education* unfit → probondho; #2274 *How to Live on 24 Hours a Day* unfit → atmounnoyon; #55822 *Argonauts of the Western Pacific* unfit → probondho; #2781 *Just So Stories* shishu-sahitto → puran-lokkotha; #76391 *Fairy Dreams* shishu-sahitto → puran-lokkotha; #972 *The Devil's Dictionary* unfit → probondho; #25502 *Hero-Myths & Legends of the British Race* uponnash → puran-lokkotha; #18947 *The Younger Edda* kobita → puran-lokkotha; #503 *The Blue Fairy Book* shishu-sahitto → puran-lokkotha; #6435 *The Principles of Scientific Management* unfit → probondho; #16287 *Talks To Teachers On Psychology* unfit → probondho; #21076 *The First Six Books of the Elements of Euclid* unfit → probondho; #5314 *Household Tales by Brothers Grimm* shishu-sahitto → puran-lokkotha; #16653 *Myths of Babylonia and Assyria* itihash-jiboni → puran-lokkotha; #33310 *On The Principles of Political Economy, and Taxation* unfit → probondho; #830 *Argonautica* kobita → puran-lokkotha; #30107 *Principles of Political Economy* unfit → probondho; #1210 *Kwaidan* chhotogolpo → puran-lokkotha; #55264 *On Growth and Form* unfit → probondho; #40588 *Kathasaritsagara* uponnash → puran-lokkotha; #128 *The Arabian Nights Entertainments* shishu-sahitto → puran-lokkotha; #23634 *Italian Popular Tales* uponnash → puran-lokkotha; #38015 *De Re Metallica* unfit → probondho; #16351 *Critical and Historical Essays* unfit → probondho; #4018 *Japanese Fairy Tales* shishu-sahitto → puran-lokkotha; #5500 *The Advancement of Learning* unfit → probondho; #15250 *Myths and Legends of China* uponnash → puran-lokkotha; #38769 *A Course of Pure Mathematics* unfit → probondho; #41538 *The Progress of Invention in the Nineteenth Century.* unfit → itihash-jiboni; #26429 *Nights With Uncle Remus* chhotogolpo → puran-lokkotha; #35898 *The Seven Lamps of Architecture* unfit → probondho; #27963 *History of Education* unfit → itihash-jiboni; #18442 *Fifty Famous Stories Retold* itihash-jiboni → puran-lokkotha; #12753 *The Legends of King Arthur and His Knights* uponnash → puran-lokkotha; #54977 *The Sovereignty of the Sea* unfit → itihash-jiboni; #14726 *The Elder Eddas of Saemund Sigfusson* kobita → puran-lokkotha; #55870 *A History of Architecture in All Countries, Volumes 1 and 2, 3rd Ed.* unfit → itihash-jiboni; #43376 *The American Language* unfit → probondho; #11000 *An Old Babylonian Version of the Gilgamesh Epic* kobita → puran-lokkotha; #17150 *The Oldest Code of Laws in the World* unfit → itihash-jiboni; #18155 *The Story of the Three Little Pigs* shishu-sahitto → puran-lokkotha; #24526 *The Idea of a University Defined and Illustrated* unfit → probondho; #1150 *The Danish History, Books I-IX* itihash-jiboni → puran-lokkotha.

## Translations

| Book | Original author | Translator | Translator died |
|---|---|---|---|
| Odyssey | Homer | Samuel Butler | 1902 (Wikidata) |
| The Prince | Niccolò Machiavelli | W. K. Marriott | 1927 (Gutenberg) |
| War and Peace | Leo Tolstoy | Aylmer Maude ও Louise Maude | 1938 (Gutenberg), 1939 (Gutenberg) |
| Confessions | Augustine of Hippo | Edward Bouverie Pusey | 1882 (Wikidata) |
| A Doll's House | Henrik Ibsen | R. Farquharson Sharp | 1945 (Gutenberg) |
| The Brothers Karamazov | Fyodor Dostoevsky | Constance Garnett | 1946 (Wikidata) |
| Thus Spake Zarathustra | Friedrich Nietzsche | Thomas Common | 1919 (Wikidata) |
| Carmen | Prosper Mérimée | Mary Loyd | 1936 (Gutenberg) |
| Beyond Good and Evil | Friedrich Nietzsche | Helen Zimmern | 1934 (Wikidata) |
| The Republic | Plato | Benjamin Jowett | 1893 (Wikidata) |
| The Treasure of Pearls | Gustave Aimard | Sir Frederic Wraxall, 3rd Baronet | 1865 (Wikidata) |
| Flower, Fruit, and Thorn Pieces; | Jean Paul | Alexander Ewing | 1895 (Wikidata) |
| Enchiridion of Epictetus | Epictetus | Thomas Wentworth Higginson | 1911 (Wikidata) |
| Oedipus King of Thebes | Sophocles | Gilbert Murray | 1957 (Wikidata) |
| Four Arthurian Romances | Chrétien de Troyes | William Wistar Comfort | 1955 (Wikidata) |
| Cameron of Lochiel | Aubert de Gaspé | Charles G. D. Roberts | 1943 (Wikidata) |
| Iliad | Homer | Alexander Pope | 1744 (Wikidata) |
| Anabasis of Alexander | Arrian | E. J. Chinnock | 1911 (Gutenberg) |
| The Divine Comedy | Dante Alighieri | Henry Francis Cary | 1844 (Wikidata) |
| The Art of War | Sun Tzu | Lionel Giles | 1958 (Wikidata) |
| Don Quixote | Miguel de Cervantes | John Ormsby | 1895 (Wikidata) |
| Around the World in Eighty Days | Jules Verne | George Makepeace Towle | 1893 (Wikidata) |
| White Nights, and Other Stories | Fyodor Dostoevsky | Constance Garnett | 1946 (Wikidata) |
| Eloisa | Jean-Jacques Rousseau | William Kenrick | 1779 (Wikidata) |
| Les Misérables | Victor Hugo | Isabel Florence Hapgood | 1928 (Wikidata) |
| Anna Karenina | Leo Tolstoy | Constance Garnett | 1946 (Wikidata) |
| The Sorrows of Young Werther | Johann Wolfgang von Goethe | R. Dillon Boylan | 1888 (Gutenberg) |
| Baburnama | Babur | Annette Beveridge | 1929 (Wikidata) |
| Apology | Plato | Benjamin Jowett | 1893 (Wikidata) |
| The Notebooks of Leonardo Da Vinci | Leonardo da Vinci | Jean-Paul Richter | 1937 (Wikidata) |
| The Satires of Juvenal, Persius, Sulpicia, and Lucilius | Juvenal, Gaius Lucilius, Persius ও Sulpicia | Lewis Evans ও William Gifford | 1869 (Gutenberg), 1826 (Wikidata) |
| Notes from Underground | Fyodor Dostoevsky | Constance Garnett | 1946 (Wikidata) |
| Metamorphoses | Ovid | Henry Thomas Riley | 1878 (Wikidata) |
| Symposium | Plato | Benjamin Jowett | 1893 (Wikidata) |
| Critique of Pure Reason | Immanuel Kant | John Meiklejohn | 1902 (Wikidata) |
| Essays | Michel de Montaigne | Charles Cotton | 1687 (Wikidata) |
| The Diary of Samuel Pepys | Samuel Pepys | Mynors Bright | 1883 (Wikidata) |
| Three Hundred Aesop’s Fables | Aesop | George Fyler Townsend | 1900 (Wikidata) |
| Phaedrus | Plato | Benjamin Jowett | 1893 (Wikidata) |
| Phaedo | Plato | Benjamin Jowett | 1893 (Wikidata) |
| Antiquities of the Jews | Josephus | William Whiston | 1752 (Wikidata) |
| Poetics | Aristotle | Samuel H. Butcher | 1910 (Wikidata) |
| Aeneid | Virgil | John Dryden | 1700 (Wikidata) |
| History of the Peloponnesian War | Thucydides | Richard Crawley | 1893 (Wikidata) |
| The Romance of Tristan and Iseult | Joseph Bédier | Hilaire Belloc | 1953 (Wikidata) |
| Anabasis | Xenophon | Henry Graham Dakyns | 1911 (Wikidata) |
| Ethics | Benedictus de Spinoza | R. H. M. Elwes | 1892 (Gutenberg) |
| Hypnerotomachia Poliphili | Francesco Colonna | Robert Dallington | 1637 (Wikidata) |
| The Reign of Greed | José Rizal | Charles E. Derbyshire | 1933 (Gutenberg) |
| Hesiod, the Homeric Hymns, and Homerica | Hesiod | Hugh Gerard Evelyn-White | 1924 (Wikidata) |
| On the Nature of Things | Lucretius | William Ellery Leonard | 1944 (Wikidata) |
| Discourse on the Method | René Descartes | John Veitch | 1894 (Wikidata) |
| The Mysterious Island | Jules Verne | Agnes Kinloch Kingston | 1913 (Gutenberg) |
| The Philippines a Century Hence | José Rizal | Charles E. Derbyshire | 1933 (Gutenberg) |
| Notre-Dame de Paris | Victor Hugo | Isabel Florence Hapgood | 1928 (Wikidata) |
| The Consolation of Philosophy | Boethius | H. R. James | 1931 (Gutenberg) |
| Plutarch's Morals | Plutarch | Arthur Richard Shilleto | 1894 (Wikidata) |
| Madame Bovary | Gustave Flaubert | Eleanor Marx | 1898 (Wikidata) |
| Gorgias | Plato | Benjamin Jowett | 1893 (Wikidata) |
| Quo Vadis | Henryk Sienkiewicz | Jeremiah Curtin | 1906 (Wikidata) |
| The Torrents of Spring | Ivan Turgenev | Constance Garnett | 1946 (Wikidata) |
| The Interpretation of Dreams | Sigmund Freud | Abraham Brill | 1948 (Wikidata) |
| The Knights of the Cross | Henryk Sienkiewicz | Samuel Augustus Binion | 1914 (Gutenberg) |
| Thoughts of Marcus Aurelius Antoninus | Marcus Aurelius | George Long | 1879 (Wikidata) |
| The Decameron | Giovanni Boccaccio | John Payne | 1916 (Wikidata) |
| Gargantua and Pantagruel | François Rabelais | Peter Anthony Motteux ও Thomas Urquhart | 1718 (Wikidata), 1660 (Wikidata) |
| On the Cross | Wilhelmine von Hillern | Mary J. Safford | 1916 (Gutenberg) |
| Fundamental Principles of the Metaphysic of Morals | Immanuel Kant | Thomas Kingsmill Abbott | 1913 (Wikidata) |
| The Antichrist | Friedrich Nietzsche | H. L. Mencken | 1956 (Wikidata) |
| The Lady with the Dog and Other Stories | Anton Chekhov | Constance Garnett | 1946 (Wikidata) |
| Politics | Aristotle | William Ellis | 1801 (Gutenberg) |
| The Social Contract & Discourses | Jean-Jacques Rousseau | G. D. H. Cole | 1959 (Wikidata) |
| Life of St. Francis of Assisi | Paul Sabatier | Louise Seymour Houghton | 1920 (Gutenberg) |
| History of Rome | Titus Livius | D. Spillan | 1854 (Gutenberg) |
| Euthyphro | Plato | Benjamin Jowett | 1893 (Wikidata) |
| A Journey into the Interior of the Earth | Jules Verne | F. A. Malleson | 1897 (Gutenberg) |
| Analects | Confucius | James Legge | 1897 (Wikidata) |
| At the Sign of the Cat and Racket | Honoré de Balzac | Clara Bell | 1927 (Wikidata) |
| The Wars of the Jews | Josephus | William Whiston | 1752 (Wikidata) |
| Psychology of the Unconscious | Carl Jung | Beatrice M. Hinkle | 1953 (Wikidata) |
| A Selection from the Discourses of Epictetus with the Encheiridion | Epictetus | George Long | 1879 (Wikidata) |
| Satyricon | Petronius | William Charles Firebaugh | 1945 (Wikidata) |
| Reflections | François de La Rochefoucauld | James Hain Friswell ও John William Willis-Bund | 1878 (Wikidata), 1928 (Wikidata) |
| The Essays of Arthur Schopenhauer | Arthur Schopenhauer | T. Bailey Saunders | 1928 (Gutenberg) |
| The Younger Edda | Snorri Sturluson | Rasmus Bjørn Anderson | 1936 (Wikidata) |
| Plays of Sophocles | Sophocles | Francis Storr | 1919 (Gutenberg) |
| The Social Cancer | José Rizal | Charles E. Derbyshire | 1933 (Gutenberg) |
| Cicero's Tusculan Disputations | Cicero | Charles Duke Yonge | 1891 (Wikidata) |
| Swann's Way | Marcel Proust | Charles Kenneth Scott Moncrieff | 1930 (Wikidata) |
| The Imitation of Christ | Thomas à Kempis | William Benham | 1910 (Gutenberg) |
| Hedda Gabler | Henrik Ibsen | William Archer ও Edmund Gosse | 1924 (Wikidata), 1928 (Wikidata) |
| The Grand Inquisitor | Fyodor Dostoevsky | Helena Blavatsky | 1891 (Wikidata) |
| Human, All Too Human | Friedrich Nietzsche | Alexander Harvey | 1949 (Gutenberg) |
| The New Terror | Gaston Leroux | Hannaford Bennett | 1946 (Gutenberg) |
| Medea | Euripides | Gilbert Murray | 1957 (Wikidata) |
| The Book of the Courtier | Baldassarre Castiglione | Leonard Eckstein Opdycke | 1914 (Gutenberg) |
| Kant's Critique of Judgement | Immanuel Kant | John Bernard | 1927 (Wikidata) |
| The First Voyage Round the World, by Magellan | Antonio Pigafetta | Henry Stanley, 3rd Baron Stanley of Alderley | 1903 (Wikidata) |
| Meno | Plato | Benjamin Jowett | 1893 (Wikidata) |
| Plays by Anton Chekhov, Second Series | Anton Chekhov | Julius West | 1918 (Wikidata) |
| Theaetetus | Plato | Benjamin Jowett | 1893 (Wikidata) |
| The Possessed | Fyodor Dostoevsky | Constance Garnett | 1946 (Wikidata) |
| Household Tales by Brothers Grimm | Jacob Grimm ও Wilhelm Grimm | Margaret Raine Hunt | 1912 (Wikidata) |
| What Is Art? | Leo Tolstoy | Aylmer Maude | 1938 (Gutenberg) |
| The Comedies of Terence | Terence | Henry Thomas Riley | 1878 (Wikidata) |
| The Memoirs of Jacques Casanova de Seingalt, 1725-1798. | Giacomo Casanova | Arthur Machen | 1947 (Wikidata) |
| A General Introduction to Psychoanalysis | Sigmund Freud | G. Stanley Hall | 1924 (Wikidata) |
| Discourses on the First Decade of Titus Livius | Niccolò Machiavelli | Ninian Hill Thomson | 1921 (Gutenberg) |
| Argonautica | Apollonius of Rhodes | R. C. Seaton | 1915 (Gutenberg) |
| The Agamemnon of Aeschylus | Aeschylus | Gilbert Murray | 1957 (Wikidata) |
| Laws | Plato | Benjamin Jowett | 1893 (Wikidata) |
| Kathasaritsagara | Somadeva | Charles Henry Tawney | 1922 (Wikidata) |
| The Wife, and Other Stories | Anton Chekhov | Constance Garnett | 1946 (Wikidata) |
| Timaeus | Plato | Benjamin Jowett | 1893 (Wikidata) |
| What Men Live By, and Other Tales | Leo Tolstoy | Aylmer Maude ও Louise Maude | 1938 (Gutenberg), 1939 (Gutenberg) |
| An Enemy of the People | Henrik Ibsen | R. Farquharson Sharp | 1945 (Gutenberg) |
| Apology, Crito, and Phaedo of Socrates | Plato | Henry Cary | 1870 (Wikidata) |
| Critique of Practical Reason | Immanuel Kant | Thomas Kingsmill Abbott | 1913 (Wikidata) |
| Theory of Colours | Johann Wolfgang von Goethe | Charles Lock Eastlake | 1865 (Wikidata) |
| The Indolence of the Filipino | José Rizal | Charles E. Derbyshire | 1933 (Gutenberg) |
| De Re Metallica | Georg Agricola | Herbert Hoover ও Lou Henry Hoover | 1964 (Wikidata), 1944 (Wikidata) |
| Account of Egypt | Herodotus | George Campbell Macaulay | 1915 (Wikidata) |
| Three Contributions to the Theory of Sex | Sigmund Freud | Abraham Brill | 1948 (Wikidata) |
| Minor Dialogues, Together With the Dialogue on Clemency | Seneca | Aubrey Stewart | 1918 (Gutenberg) |
| Essays of Schopenhauer | Arthur Schopenhauer | Sara Hay Goddard Dircks | 1942 (Gutenberg) |
| The Athenian Constitution | Aristotle | Frederic G. Kenyon | 1952 (Wikidata) |
| The Essence of Christianity | Ludwig Feuerbach | George Eliot | 1880 (Wikidata) |
| Ion | Plato | Benjamin Jowett | 1893 (Wikidata) |
| History of the Philippine Islands | Antonio de Morga | Emma Helen Blair ও James Alexander Robertson | 1911 (Wikidata), 1939 (Wikidata) |
| Strange Stories from a Chinese Studio | Pu Songling | Herbert Giles | 1935 (Wikidata) |
| Seneca's Morals of a Happy Life, Benefits, Anger and Clemency | Seneca | Roger L'Estrange | 1704 (Wikidata) |
| Protagoras | Plato | Benjamin Jowett | 1893 (Wikidata) |
| The Duel and Other Stories | Anton Chekhov | Constance Garnett | 1946 (Wikidata) |
| The Condition of the Working Class in England in 1844 | Friedrich Engels | Florence Kelley | 1932 (Wikidata) |
| Memorabilia | Xenophon | Henry Graham Dakyns | 1911 (Wikidata) |
| Summary of the Art of War | Antoine-Henri Jomini | Wm. P. Craighill ও George H. Mendell | 1909 (Wikidata), 1902 (Gutenberg) |
| The History of Magic | Eliphas Levi | A. E. Waite | 1942 (Wikidata) |
| The Bacchae | Euripides | Gilbert Murray | 1957 (Wikidata) |
| Laughter | Henri Bergson | Cloudesley Brereton ও Fred Rothwell | 1937 (Wikidata), 1934 (Gutenberg) |
| Mythology Among the Hebrews and Its Historical Development | Ignaz Goldziher | R. Martineau | 1898 (Gutenberg) |
| Maxims and Reflections | Johann Wolfgang von Goethe | T. Bailey Saunders | 1928 (Gutenberg) |
| The Logic of Hegel | Georg Wilhelm Friedrich Hegel | William Wallace | 1897 (Wikidata) |
| The Gambler | Fyodor Dostoevsky | Charles James Hogarth | 1945 (Wikidata) |
| The Elder Eddas of Saemund Sigfusson | Sæmundr fróði ও Snorri Sturluson | Joseph Andrew Blackwell ও Benjamin Thorpe | 1886 (Gutenberg), 1870 (Wikidata) |
| L. Annaeus Seneca on Benefits | Seneca | Aubrey Stewart | 1918 (Gutenberg) |
| The Red and the Black | Stendhal | Horace Barnett Samuel | 1950 (Gutenberg) |
| Letters of Pliny | Pliny the Younger | William Melmoth | 1799 (Wikidata) |
| Crito | Plato | Benjamin Jowett | 1893 (Wikidata) |
| The Life of Jesus Critically Examined | David Strauss | George Eliot | 1880 (Wikidata) |
| Apostolic Tradition | Hippolytus | Burton Scott Easton | 1950 (Gutenberg) |
| The Oldest Code of Laws in the World | Hammurabi | Claude Hermann Walter Johns | 1920 (Wikidata) |
| Views of Nature | Alexander von Humboldt | Henry George Bohn ও Elise Charlotte Otté | 1884 (Wikidata), 1903 (Wikidata) |
| Tacitus | Tacitus | William Hamilton Fyfe | 1965 (Wikidata) |
| The Danish History, Books I-IX | Saxo Grammaticus | Oliver Elton | 1945 (Wikidata) |
| Hung Lou Meng | Cao Xueqin | H. Bencraft Joly | 1898 (Gutenberg) |
| On Love | Stendhal | Cecil N. Sidney Woolf ও Philip Sidney Woolf | 1917 (Gutenberg), 1965 (Gutenberg) |
| The Story of a Soul (L'Histoire d'une Âme) | Thérèse of Lisieux | Thomas N. Taylor | 1963 (Gutenberg) |
| A History of Economic Doctrines | Charles Gide ও Charles Rist | Robert Richards ও William Smart | 1954 (Wikidata), 1915 (Wikidata) |
| Rubáiyát of Omar Khayyám | Omar Khayyám | Edward FitzGerald | 1883 (Wikidata) |
| Father Goriot | Honoré de Balzac | Ellen Marriage | 1946 (Wikidata) |
| The Golden Sayings of Epictetus, with the Hymn of Cleanthes | Epictetus | Hastings Crossley | 1926 (Gutenberg) |
| The Letters of Cassiodorus | Cassiodorus | Thomas Hodgkin | 1913 (Wikidata) |
| Elements of Chemistry, | Antoine Lavoisier | Robert Kerr | 1813 (Wikidata) |
| Letters of Abelard and Heloise | Peter Abelard ও Héloïse | John Hughes | 1720 (Wikidata) |
| Chuang Tzu | Zhuang Zhou | Herbert Giles | 1935 (Wikidata) |
| Dream Psychology | Sigmund Freud | David Eder | 1936 (Wikidata) |
| Creative Evolution | Henri Bergson | Arthur Mitchell | 1953 (Gutenberg) |

## New books by category

| Category | Books |
|---|---|
| `uponnash` | 264 |
| `probondho` | 169 |
| `itihash-jiboni` | 145 |
| `thriller-rohosso` | 94 |
| `shishu-sahitto` | 48 |
| `kobita` | 47 |
| `natok` | 41 |
| `chhotogolpo` | 39 |
| `puran-lokkotha` | 34 |
| `biggan-kolpokahini` | 23 |
| `bhromon` | 19 |
| `atmounnoyon` | 3 |

| Form | Category | Books |
|---|---|---|
| উপন্যাস | `uponnash` | 264 |
| দর্শন বিষয়ক বই | `probondho` | 111 |
| রহস্য-রোমাঞ্চ কাহিনি | `thriller-rohosso` | 94 |
| ইতিহাস বিষয়ক বই | `itihash-jiboni` | 86 |
| জীবনী | `itihash-jiboni` | 59 |
| ছোটদের বই | `shishu-sahitto` | 48 |
| কাব্যগ্রন্থ | `kobita` | 47 |
| নাটক | `natok` | 41 |
| গল্পের বই | `chhotogolpo` | 39 |
| বিজ্ঞান কল্পকাহিনী | `biggan-kolpokahini` | 23 |
| প্রবন্ধের বই | `probondho` | 22 |
| বিজ্ঞান বিষয়ক বই | `probondho` | 22 |
| ভ্রমণকাহিনি | `bhromon` | 19 |
| ধর্ম বিষয়ক বই | `probondho` | 8 |
| কিংবদন্তির কাহিনি | `puran-lokkotha` | 7 |
| মহাকাব্য | `puran-lokkotha` | 5 |
| রূপকথার সংকলন | `puran-lokkotha` | 5 |
| অর্থনীতি বিষয়ক বই | `probondho` | 3 |
| আত্ম-উন্নয়নের বই | `atmounnoyon` | 3 |
| পুরাণকথা | `puran-lokkotha` | 3 |
| চিঠিপত্রের সংকলন | `probondho` | 2 |
| পুরাণ ও কিংবদন্তির কাহিনি | `puran-lokkotha` | 2 |
| পুরাণকথার কাব্য | `puran-lokkotha` | 2 |
| লোককথার সংকলন | `puran-lokkotha` | 2 |
| আরব্য রজনীর গল্প | `puran-lokkotha` | 1 |
| উপকথা | `puran-lokkotha` | 1 |
| উপকথার সংকলন | `puran-lokkotha` | 1 |
| কাহিনিমালা | `puran-lokkotha` | 1 |
| কিংবদন্তির ইতিহাস | `puran-lokkotha` | 1 |
| পুরাণকথার সংকলন | `puran-lokkotha` | 1 |
| ভাষা বিষয়ক বই | `probondho` | 1 |
| মহাকাব্য ও স্তোত্র | `puran-lokkotha` | 1 |
| রূপকথা | `puran-lokkotha` | 1 |

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

## Selected, but not imported

| Book | Author | Downloads | Why |
|---|---|---|---|
| [The Nuttall Encyclopædia](https://www.gutenberg.org/ebooks/12342) | P. Austin Nuttall | 25634 | left out: a reference work |
| [An Etymological Dictionary of the Scottish Language](https://www.gutenberg.org/ebooks/40521) | John Jamieson | 20092 | left out: a reference work |
| [Roget's Thesaurus](https://www.gutenberg.org/ebooks/10681) | Peter Mark Roget | 16983 | left out: a reference work |
| [The Elements of Style](https://www.gutenberg.org/ebooks/37134) | William Strunk, Jr. | 15473 | left out: a manual or textbook for drill |
| [All About Coffee](https://www.gutenberg.org/ebooks/28500) | William H. Ukers | 15451 | left out: a reference work |
| [The Sailor's Word-Book](https://www.gutenberg.org/ebooks/26000) | William Henry Smyth | 13122 | left out: a reference work |
| [Enquire Within Upon Everything](https://www.gutenberg.org/ebooks/10766) | Robert Kemp Philp | 10779 | left out: a manual or textbook for drill |
| [Science in the Kitchen](https://www.gutenberg.org/ebooks/12238) | Ella Eaton Kellogg | 8518 | left out: a cookbook |
| [The Complete Herbal](https://www.gutenberg.org/ebooks/49513) | Nicholas Culpeper | 8272 | left out: a reference work |
| [Practical Mechanics for Boys](https://www.gutenberg.org/ebooks/22298) | Jules Verne | 7630 | left out: a manual or textbook for drill |
| [Chess Fundamentals](https://www.gutenberg.org/ebooks/33870) | José Raúl Capablanca | 7393 | left out: a manual or textbook for drill |
| [The Art of Public Speaking](https://www.gutenberg.org/ebooks/16317) | Joseph Berg Esenwein ও Dale Carnegie | 7040 | left out: a manual or textbook for drill |
| [Amusements in Mathematics](https://www.gutenberg.org/ebooks/16713) | Henry Dudeney | 6884 | left out: a manual or textbook for drill |
| [Southern Literature From 1579-1895](https://www.gutenberg.org/ebooks/27279) | Louise Manly | 6808 | left out: a reference work |
| [The Horsewoman](https://www.gutenberg.org/ebooks/26318) | Alice M. Hayes | 6254 | left out: a manual or textbook for drill |
| [A Concise Anglo-Saxon Dictionary](https://www.gutenberg.org/ebooks/31543) | John Richard Clark Hall | 6060 | left out: a reference work |
| [A Treatise on Domestic Economy](https://www.gutenberg.org/ebooks/21829) | Catharine Beecher | 5932 | left out: a manual or textbook for drill |
| [Hobson-Jobson](https://www.gutenberg.org/ebooks/58529) | Henry Yule ও Arthur Coke Burnell | 5749 | left out: a reference work |
| [1000 Mythological Characters Briefly Described](https://www.gutenberg.org/ebooks/42474) | Edward S. Ellis | 5676 | left out: a reference work |
| [The Practice and Science of Drawing](https://www.gutenberg.org/ebooks/14264) | Harold Speed | 5520 | left out: a manual or textbook for drill |
| [Etiquette in Society, in Business, in Politics, and at Home](https://www.gutenberg.org/ebooks/14314) | Emily Post | 5399 | left out: a manual or textbook for drill |
| [A Dictionary of Islam](https://www.gutenberg.org/ebooks/61526) | Thomas Hughes | 5011 | left out: a reference work |
| [Cookery and Dining in Imperial Rome](https://www.gutenberg.org/ebooks/29728) | Marcus Gavius Apicius | 4943 | left out: a cookbook |
| [Palmistry for All](https://www.gutenberg.org/ebooks/20480) | Cheiro | 4778 | left out: a manual or textbook for drill |
| [The Psychology of Singing](https://www.gutenberg.org/ebooks/21957) | David C. Taylor | 4748 | left out: a manual or textbook for drill |
| [A Complete Guide to Heraldry](https://www.gutenberg.org/ebooks/41617) | Arthur Charles Fox-Davies | 4579 | left out: a reference work |
| [Mrs Beeton's Book of Household Management](https://www.gutenberg.org/ebooks/10136) | Isabella Beeton | 4467 | left out: a cookbook |
| [A Treatise Upon the Law of Copyright in the United Kingdom and the Dominions of the Crown,](https://www.gutenberg.org/ebooks/43945) | Evan James MacGillivray | 4381 | non-fiction that fits no rule: your decision |
| [Mechanical Drawing Self-Taught](https://www.gutenberg.org/ebooks/23319) | Joshua Rose | 4280 | left out: a manual or textbook for drill |
| [The Common Law](https://www.gutenberg.org/ebooks/2449) | Oliver Wendell Holmes | 4139 | non-fiction that fits no rule: your decision |
| [Notes on Nursing](https://www.gutenberg.org/ebooks/17366) | Florence Nightingale | 4124 | left out: a manual or textbook for drill |
| [Plain Facts for Old and Young](https://www.gutenberg.org/ebooks/19924) | John Harvey Kellogg | 3963 | left out: a manual or textbook for drill |
| [McGuffey's First Eclectic Reader, Revised Edition](https://www.gutenberg.org/ebooks/14640) | William Holmes McGuffey | 3786 | left out: a manual or textbook for drill |
| [Dictionary of Quotations from Ancient and Modern, English and Foreign Sources](https://www.gutenberg.org/ebooks/48105) | James Wood | 3755 | left out: a reference work |
| [A Dictionary of Slang, Cant, and Vulgar Words](https://www.gutenberg.org/ebooks/47018) | John Camden Hotten | 3733 | left out: a reference work |
| [A Concise Dictionary of Middle English from A.D. 1150 to 1580](https://www.gutenberg.org/ebooks/10625) | A. L. Mayhew ও Walter William Skeat | 3695 | left out: a reference work |
| [Woman](https://www.gutenberg.org/ebooks/21840) | William J. Robinson | 3633 | left out: a manual or textbook for drill |
| [English Surnames](https://www.gutenberg.org/ebooks/59959) | Charles Wareing Endell Bardsley | 3614 | left out: a reference work |
| [A Complete Dictionary of Synonyms and Antonyms](https://www.gutenberg.org/ebooks/51155) | Samuel Fallows | 3602 | left out: a reference work |
| [The Boston Cooking-school Cook Book](https://www.gutenberg.org/ebooks/65061) | Fannie Farmer | 3558 | left out: a cookbook |
| [The Field and Garden Vegetables of America](https://www.gutenberg.org/ebooks/21682) | Fearing Burr | 3533 | left out: a reference work |
| [Scouting for Boys](https://www.gutenberg.org/ebooks/65993) | Robert Baden-Powell, 1st Baron Baden-Powell | 3261 | left out: a manual or textbook for drill |
| [Commentaries on the Laws of England](https://www.gutenberg.org/ebooks/30802) | William Blackstone | 3232 | non-fiction that fits no rule: your decision |
| [Tagalog Texts with Grammatical Analysis](https://www.gutenberg.org/ebooks/50797) | Leonard Bloomfield | 3221 | left out: a reference work |
| [A Dictionary of Arts, Manufactures and Mines](https://www.gutenberg.org/ebooks/44562) | Andrew Ure | 3199 | left out: a reference work |
| [Line and Form (1900)](https://www.gutenberg.org/ebooks/25290) | Walter Crane | 3181 | left out: a manual or textbook for drill |
| [The Slang Dictionary](https://www.gutenberg.org/ebooks/42108) | John Camden Hotten | 3081 | left out: a reference work |
| [The Elements of Drawing, in Three Letters to Beginners](https://www.gutenberg.org/ebooks/30325) | John Ruskin | 3011 | left out: a manual or textbook for drill |
| [The Art of Stage Dancing](https://www.gutenberg.org/ebooks/27367) | Ned Wayburn | 2986 | left out: a manual or textbook for drill |
| [Shell-shock and Other Neuropsychiatric Problems](https://www.gutenberg.org/ebooks/52105) | Elmer Ernest Southard | 2923 | non-fiction that fits no rule: your decision |
| [The Grammar of English Grammars](https://www.gutenberg.org/ebooks/11615) | Goold Brown | 2858 | left out: a reference work |

## Excluded while selecting, by reason

Every book with more downloads than the last one selected (2734) that was left out:

| Reason | Books |
|---|---|
| not a text | 222 |
| one volume of a multi-volume work | 191 |
| not in English or Bangla | 168 |
| author died after YYYY | 103 |
| no named author | 91 |
| translation with no named translator | 84 |
| author's death year is unknown | 72 |
| another edition of the same work | 52 |
| recent release : in the top downloads on a 30-day spike | 46 |
| translator's death year is unknown | 34 |
| anthology without a single author | 16 |
| translator died in YYYY, after YYYY | 13 |
| editor's death year is unknown | 8 |
| illustrator died in YYYY, after YYYY | 7 |
| anonymous | 5 |
| editor died in YYYY, after YYYY | 3 |
| artist died in YYYY, after YYYY | 1 |
| author died in YYYY, after YYYY | 1 |
| the Inferno alone | 1 |

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
| 48320 | Adventures of Sherlock Holmes | Doyle, Arthur Conan | 34713 | another edition of the same work (kept #1661) |
| 78118 | Barry Locke, half-back | Barbour, Ralph Henry | 33952 | recent release (ebook #78118, 2026-03-05): in the top downloads on a 30-day spike |
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
| 78009 | A guide to the history of physical education | Leonard, Fred Eugene | 25383 | recent release (ebook #78009, 2026-02-22): in the top downloads on a 30-day spike |
| 78017 | The Swiss family Robinson | Wyss, Johann David | 25237 | translation with no named translator (the author didn't write in English, per Wikidata) |
| 78065 | The anatomy of revolution | Brinton, Crane | 25201 | author died after 1965 (Gutenberg catalog) |
| 78122 | The history of the Norman conquest of England, its causes and its results, Volum | Freeman, Edward A. (Edward Augustus) | 25028 | one volume of a multi-volume work |
| 78105 | Tales grotesque and curious | Akutagawa, Ryūnosuke | 25025 | recent release (ebook #78105, 2026-03-04): in the top downloads on a 30-day spike |
| 78119 | Humanism and America : $b Essays on the outlook of modern civilisation | — | 25003 | no named author (anonymous, or only an editor or translator credited) |
| 78025 | Main currents in American thought : $b An interpretation of American literature  | Parrington, Vernon Louis | 25000 | recent release (ebook #78025, 2026-02-24): in the top downloads on a 30-day spike |
| 863 | The Mysterious Affair at Styles | Christie, Agatha | 24963 | author died after 1965 (Gutenberg catalog) |
| 78022 | Præraphaelite diaries and letters | Brown, Ford Madox; Rossetti, Dante Gabriel; Rossetti, Gabriele | 24920 | recent release (ebook #78022, 2026-02-23): in the top downloads on a 30-day spike |
| 78013 | Arrian on coursing : $b the Cynegeticus of the younger Xenophon, translated from | Arrian | 24899 | recent release (ebook #78013, 2026-02-23): in the top downloads on a 30-day spike |
| 78124 | 1066 and all that : $b A memorable history of England, comprising all the parts  | Sellar, Walter Carruthers; Yeatman, Robert Julian | 24874 | author died after 1965 (Gutenberg catalog) |
| 78120 | The marvellous land of Snergs | Wyke-Smith, E. A. (Edward Augustine) | 24859 | recent release (ebook #78120, 2026-03-05): in the top downloads on a 30-day spike |
| 78047 | The dogaressas of Venice (the wives of the doges) | Staley, Edgcumbe | 24851 | recent release (ebook #78047, 2026-02-26): in the top downloads on a 30-day spike |
| 78029 | The dangerous game | Le Queux, William | 24835 | recent release (ebook #78029, 2026-02-24): in the top downloads on a 30-day spike |
| 78011 | Three sevens : $b A detective story | Sheehan, Perley Poore | 24815 | recent release (ebook #78011, 2026-02-23): in the top downloads on a 30-day spike |
| 78039 | Boston : $b a novel | Sinclair, Upton | 24810 | author died after 1965 (Gutenberg catalog) |
| 78053 | Field Artillery Training. 1914 | Great Britain. War Office | 24808 | author's death year is unknown (Great Britain. War Office) |
| 10 | The King James Version of the Bible | — | 24756 | no named author (anonymous, or only an editor or translator credited) |
| 78020 | The cruise of the Nona : $b The story of a cruise from Holyhead to the Wash, wit | Belloc, Hilaire | 24750 | recent release (ebook #78020, 2026-02-23): in the top downloads on a 30-day spike |
| 78077 | Cartels : $b challenge to a free world | Berge, Wendell | 24745 | recent release (ebook #78077, 2026-03-01): in the top downloads on a 30-day spike |
| 78044 | Claribel : $b or, Rest at last | Guernsey, Lucy Ellen | 24739 | recent release (ebook #78044, 2026-02-26): in the top downloads on a 30-day spike |
| 49008 | The Works of William Shakespeare [Cambridge Edition] [Vol. 8 of 9] | Shakespeare, William | 24732 | one volume of a multi-volume work |
| 78090 | Blackwood's Edinburgh magazine, volume 456, no. 10, October 1853 | Various | 24724 | anthology without a single author ("Various") |
| 78092 | Records of Captain Clapperton's last expedition to Africa, Vol. 2 (of 2) | Lander, Richard | 24674 | one volume of a multi-volume work |
| 78087 | The black pearl | Lion, Marie | 24659 | recent release (ebook #78087, 2026-03-02): in the top downloads on a 30-day spike |
| 42 | The strange case of Dr. Jekyll and Mr. Hyde | Stevenson, Robert Louis | 24650 | another edition of the same work (kept #43) |

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
- Omar Khayyam: catalog 1122, Wikidata 1131
- Cassiodorus, Senator: catalog 580, Wikidata 583

## Per author (new books and links)

| Author | Books |
|---|---|
| Charles Dickens | 15 |
| Plato | 15 |
| Mark Twain | 14 |
| William Shakespeare | 14 |
| Edgar Wallace | 12 |
| H. G. Wells | 12 |
| Arthur Conan Doyle | 11 |
| G. K. Chesterton | 11 |
| Edgar Rice Burroughs | 9 |
| Oscar Wilde | 9 |
| Thomas Hardy | 8 |
| Fyodor Dostoevsky | 7 |
| Jane Austen | 7 |
| John Stuart Mill | 7 |
| Charles Darwin | 6 |
| Edgar Allan Poe | 6 |
| Francis Bacon | 5 |
| Henry James | 5 |
| Jack London | 5 |
| José Rizal | 5 |
| Lucy Maud Montgomery | 5 |
| R. Austin Freeman | 5 |
| Robert E. Howard | 5 |
| Robert Louis Stevenson | 5 |
| William James | 5 |
| Anton Chekhov | 4 |
| Beatrix Potter | 4 |
| Charles Norris Williamson ও Alice Muriel Williamson | 4 |
| David Hume | 4 |
| Friedrich Nietzsche | 4 |
| George Eliot | 4 |
| H. P. Lovecraft | 4 |
| Immanuel Kant | 4 |
| John Buchan | 4 |
| Joseph Conrad | 4 |
| Jules Verne | 4 |
| L. Frank Baum | 4 |
| Leo Tolstoy | 4 |
| Lewis Carroll | 4 |
| Louis Tracy | 4 |
| Nathaniel Hawthorne | 4 |
| Rudyard Kipling | 4 |
| Sigmund Freud | 4 |
| Walter Scott | 4 |
| Algernon Blackwood | 3 |
| Ambrose Bierce | 3 |
| Aristotle | 3 |
| Edith Wharton | 3 |
| Epictetus | 3 |
| Ernest Hemingway | 3 |
| F. Scott Fitzgerald | 3 |
| Frances Hodgson Burnett | 3 |
| Henrik Ibsen | 3 |
| Henry David Thoreau | 3 |
| James Grant | 3 |
| James Joyce | 3 |
| Johann Wolfgang von Goethe | 3 |
| John Dewey | 3 |
| Jonathan Swift | 3 |
| Louisa May Alcott | 3 |

## Spot-check

See `data/gutenberg-spot-check.md` (`scripts/gutenberg-spot-check.ts`).
