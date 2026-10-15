# Bangla Wikisource import — review report

Generated 2026-10-15 by `scripts/wikisource-import.ts`. Public-domain cutoff: the author (and any translator or editor) died in **1965 or earlier**.

## Totals

| | Works |
|---|---|
| Fully proofread scans on bn.wikisource (start) | 652 |
| Ready to import now (`data/wikisource-import.json`) | 221 |
| Need a new category first (`data/wikisource-pending.json`) | 204 |
| Left out, with reasons (`data/wikisource-excluded.json`) | 227 |

**Descriptions.** 79 works that are well known got an original one-sentence description (written in `scripts/wikisource/descriptions.ts`; no plot detail beyond what any summary says). The other 346 use a neutral line: form and author, e.g. “রবীন্দ্রনাথ ঠাকুরের কাব্যগ্রন্থ।”

**Rules beyond the death year.** A work first published after its author's death (or a translation after its translator's) is protected in Bangladesh for 60 years from publication, so such a work first printed after 1965 is excluded even when the author died earlier. Wikidata labels Manik Bandopadhyay by his legal name, প্রবোধকুমার বন্দ্যোপাধ্যায়; the import uses মানিক বন্দ্যোপাধ্যায়. A translation's Bangla title is taken from its Wikisource page, not from the original work's label.

## Ready to import, by category

| Category | Works |
|---|---|
| `kobita` | 75 |
| `itihash-jiboni` | 54 |
| `uponnash` | 48 |
| `thriller-rohosso` | 42 |
| `biggan-kolpokahini` | 2 |

## Proposed new categories (not imported until you create them)

A work's form comes from Wikisource's own categories, else Wikidata's type. For 80 works whose form those sources don't give (or get wrong) it was set by hand, only where certain: they're listed in `FORM_BY_HAND` in `scripts/wikisource/classify.ts`. Each row in `data/wikisource-pending.json` names its proposed category; create the category, set `category` to its slug and import.

| Proposed category | Slug | Works | Examples |
|---|---|---|---|
| শিশুসাহিত্য (Children's books) | `shishu-sahitto` | 9 | ৮০ দিনে ভূপ্রদক্ষিণ, কথামালা, গুপি গাইন ও বাঘা বাইন |
| নাটক (Plays) | `natok` | 20 | আঁধারে আলো, একেই কি বলে সভ্যতা?, কৃষ্ণকুমারী নাটক |
| ছোটগল্প (Short stories) | `chhotogolpo` | 36 | অনুসন্ধান, আখ্যানমঞ্জরী, আনন্দীবাঈ ইত্যাদি গল্প |
| গান (Songs) | `gaan` | 1 | সঙ্গীত-সুধা |
| ভ্রমণকাহিনি (Travel writing) | `bhromon` | 13 | আজকের আমেরিকা, আমার দেখা রাশিয়া, আমার দেখা তুরষ্ক |
| চিঠিপত্র (Letters) | `chithipotro` | 5 | আলম্‌গীরের পত্রাবলী, ছিন্নপত্র, চিঠিপত্র |
| ধর্ম ও দর্শন (Religion & philosophy) | `dhormo-dorshon` | 8 | ঔপনিষদ ব্রহ্ম, এপিক্‌টেটসের উপদেশ, খৃষ্ট |
| প্রবন্ধ (Essays) | `probondho` | 81 | অব্যক্ত, আচার্য্য প্রফুল্লচন্দ্র রায়ের প্রবন্ধ ও বক্তৃতাবলী, আমাদের জাতীয়ভাব |
| বিজ্ঞান (Science) | `biggan` | 7 | গ্রহ-নক্ষত্র, নব্য-বিজ্ঞান, পোকা-মাকড় |
| ভাষা ও শিক্ষা (Language & learning) | `shikkha` | 5 | কথোপকথন, বাংলাভাষা-পরিচয়, বর্ণপরিচয় |
| *Form unknown — needs a person to choose* | — | 19 | গোচারণের মাঠ, গ্রাম্য উপাখ্যান, কুরু পাণ্ডব |

## Included works per author (ready + pending)

| Author | Died | Ready | Pending |
|---|---|---|---|
| রবীন্দ্রনাথ ঠাকুর | 1941 | 40 | 54 |
| প্রিয়নাথ মুখোপাধ্যায় | 1947 | 38 | 0 |
| বঙ্কিমচন্দ্র চট্টোপাধ্যায় | 1894 | 11 | 7 |
| ঈশ্বরচন্দ্র বিদ্যাসাগর | 1891 | 6 | 8 |
| রাজশেখর বসু | 1960 | 0 | 12 |
| মাইকেল মধুসূদন দত্ত | 1873 | 6 | 4 |
| অবনীন্দ্রনাথ ঠাকুর | 1951 | 2 | 6 |
| প্রসাদদাস রায় | 1963 | 6 | 1 |
| শরৎচন্দ্র চট্টোপাধ্যায় | 1938 | 4 | 3 |
| বিভূতিভূষণ বন্দ্যোপাধ্যায় | 1950 | 2 | 3 |
| ব্রজেন্দ্রনাথ বন্দ্যোপাধ্যায় | 1952 | 4 | 1 |
| হেমচন্দ্র বন্দ্যোপাধ্যায় | 1903 | 5 | 0 |
| দীনেশচন্দ্র সেন | 1939 | 0 | 4 |
| স্বর্ণকুমারী দেবী | 1932 | 3 | 1 |
| স্বামী বিবেকানন্দ | 1902 | 2 | 2 |
| জুল ভার্ন | 1905 | 2 | 1 |
| দেবেন্দ্রনাথ ঠাকুর | 1905 | 0 | 3 |
| প্রফুল্লচন্দ্র রায় | 1944 | 1 | 2 |
| মানিক বন্দ্যোপাধ্যায় | 1956 | 2 | 1 |
| রজনীকান্ত সেন | 1910 | 3 | 0 |
| রাখালদাস বন্দ্যোপাধ্যায় | 1930 | 2 | 1 |
| রাজনারায়ণ বসু | 1899 | 1 | 2 |
| রামনাথ বিশ্বাস | 1955 | 0 | 3 |
| সখারাম গণেশ দেউস্কর | 1912 | 3 | 0 |
| হেমলতা দেবী | 1943 | 2 | 1 |
| অক্ষয়কুমার মৈত্রেয় | 1930 | 2 | 0 |
| অজিতকুমার চক্রবর্তী | 1918 | 0 | 2 |
| অনুরূপা দেবী | 1958 | 0 | 2 |
| আশুতোষ মুখোপাধ্যায় | 1924 | 0 | 2 |
| ইন্দিরা দেবী | 1939 | 2 | 0 |
| উপেন্দ্রকিশোর রায়চৌধুরী | 1915 | 0 | 2 |
| গগনেন্দ্রনাথ ঠাকুর | 1938 | 0 | 2 |
| চারুচন্দ্র বন্দ্যোপাধ্যায় | 1938 | 1 | 1 |
| চারুচন্দ্র ভট্টাচার্য | 1961 | 0 | 2 |
| চিত্তরঞ্জন দাশ | 1925 | 2 | 0 |
| জগদানন্দ রায় | 1933 | 0 | 2 |
| জলধর সেন | 1939 | 1 | 1 |
| প্রবোধচন্দ্র বাগচী | 1956 | 2 | 0 |
| প্রমথ চৌধুরী | 1946 | 1 | 1 |
| রজনীকান্ত গুপ্ত | 1900 | 1 | 1 |
| রমেশচন্দ্র দত্ত | 1909 | 1 | 1 |
| শামসুন নাহার মাহমুদ | 1964 | 0 | 2 |
| শিবনাথ শাস্ত্রী | 1919 | 0 | 2 |
| সত্যেন্দ্রনাথ মজুমদার | 1954 | 1 | 1 |
| সুনির্মল বসু | 1957 | 1 | 1 |
| অক্ষয়কুমার দত্ত | 1886 | 0 | 1 |
| অক্ষয়চন্দ্র সরকার | 1917 | 0 | 1 |
| অধরলাল সেন | 1885 | 1 | 0 |
| অনাথনাথ বসু | 1935 | 0 | 1 |
| অমলেন্দু দাশগুপ্ত | 1955 | 1 | 0 |
| অরবিন্দ ঘোষ | 1950 | 0 | 1 |
| অশ্বঘোষ | 150 | 1 | 0 |
| আঁদ্রে শেভ্রিয়োঁ | 1957 | 0 | 1 |
| আররিয়ানোস | 180 | 0 | 1 |
| আলফ্রেড টেনিসন | 1892 | 1 | 0 |
| ইন্দিরা দেবী চৌধুরানী | 1960 | 0 | 1 |
| ইন্দুমাধব মল্লিক | 1917 | 0 | 1 |
| ঈসপ | -564 | 0 | 1 |
| উইলিয়াম কেরি | 1834 | 0 | 1 |
| উমাকান্ত হাজারী | 1955 | 1 | 0 |
| উমেশচন্দ্র দত্ত | 1907 | 1 | 0 |
| ওমর খৈয়াম | 1131 | 1 | 0 |
| ঔরঙ্গজেব | 1707 | 0 | 1 |
| কনকভূষণ মুখোপাধ্যায় | 1945 | 1 | 0 |
| কালীপ্রসন্ন ঘোষ | 1910 | 1 | 0 |
| কালীপ্রসন্ন বিদ্যারত্ন | 1924 | 0 | 1 |
| কালীপ্রসন্ন সিংহ | 1870 | 0 | 1 |
| কালীময় ঘটক | 1900 | 1 | 0 |
| কুমুদিনী মিত্র | 1943 | 1 | 0 |
| কৃষ্ণপ্রসন্ন সেন | 1902 | 0 | 1 |
| কৃষ্ণেন্দ্র রায় | 1898 | 1 | 0 |
| ক্ষিতিমোহন সেন | 1960 | 0 | 1 |
| গিরিশচন্দ্র ঘোষ | 1912 | 0 | 1 |
| গিরীন্দ্রমোহিনী দাসী | 1924 | 1 | 0 |
| গিরীন্দ্রশেখর বসু | 1953 | 0 | 1 |
| গুরুনাথ সেনগুপ্ত | 1914 | 1 | 0 |
| গোকুলচন্দ্র নাগ | 1925 | 0 | 1 |
| গোলাম মোস্তফা | 1964 | 0 | 1 |
| চন্দ্রনাথ বসু | 1910 | 0 | 1 |
| চার্লস ল্যাম্ব ও মেরী ল্যাম্ব | 1847 | 0 | 1 |
| জওহরলাল নেহরু | 1964 | 1 | 0 |
| জগদীশচন্দ্র বসু | 1937 | 0 | 1 |
| জন ক্লার্ক মার্শম্যান | 1877 | 1 | 0 |
| জয়দেব | 1245 | 1 | 0 |
| জীবনানন্দ দাশ | 1954 | 1 | 0 |
| জ্ঞানদানন্দিনী দেবী | 1941 | 1 | 0 |
| জ্যোতিরিন্দ্রনাথ ঠাকুর | 1925 | 1 | 0 |
| ত্রৈলোক্যনাথ মুখোপাধ্যায় | 1919 | 0 | 1 |
| দীনবন্ধু মিত্র | 1873 | 0 | 1 |
| দীনেন্দ্রকুমার রায় | 1943 | 1 | 0 |
| দীনেশরঞ্জন দাশ | 1941 | 0 | 1 |
| দ্বারকানাথ বিদ্যাভূষণ | 1886 | 1 | 0 |
| দ্বিজেন্দ্রলাল রায় | 1913 | 0 | 1 |
| নগেন্দ্রনাথ গুপ্ত | 1940 | 0 | 1 |
| নবীনচন্দ্র সেন | 1909 | 1 | 0 |
| নারায়ণচন্দ্র ভট্টাচার্য | 1927 | 0 | 1 |
| নৃপেন্দ্রকৃষ্ণ চট্টোপাধ্যায় | 1963 | 1 | 0 |
| পঞ্চানন ভট্টাচার্য | 1919 | 0 | 1 |
| পরমেশপ্রসন্ন রায় | 1927 | 0 | 1 |
| পিয়ের লোতি | 1923 | 0 | 1 |
| প্যারীচাঁদ মিত্র | 1883 | 0 | 1 |
| প্রফুল্লকুমার সরকার | 1944 | 1 | 0 |
| প্রিয়দর্শন হালদার | 1928 | 1 | 0 |
| প্রিয়নাথ চক্রবর্তী | 1908 | 1 | 0 |
| বারীন্দ্রকুমার ঘোষ | 1959 | 0 | 1 |
| বিজয়কৃষ্ণ গোস্বামী | 1899 | 0 | 1 |
| বিজয়চন্দ্র মজুমদার | 1942 | 1 | 0 |
| বিনোদিনী দাসী | 1941 | 1 | 0 |
| বিপিনচন্দ্র পাল | 1932 | 1 | 0 |
| বিহারীলাল চক্রবর্তী | 1894 | 1 | 0 |
| বুকার টালিয়াফেরো ওয়াশিংটন | 1915 | 1 | 0 |
| ব্রহ্মবান্ধব উপাধ্যায় | 1907 | 0 | 1 |
| ভারতচন্দ্র রায় | 1760 | 1 | 0 |
| ভুজঙ্গধর রায়চৌধুরী | 1940 | 1 | 0 |
| ভূদেব মুখোপাধ্যায় | 1894 | 1 | 0 |
| ভূপেন্দ্রনাথ দত্ত | 1961 | 0 | 1 |
| মণিলাল গঙ্গোপাধ্যায় | 1929 | 1 | 0 |
| মন্মথমোহন বসু | 1959 | 0 | 1 |
| মাউন্টফোর্ড জোসেফ ব্রমলি | 1837 | 0 | 1 |
| মাখনলাল রায়চৌধুরী | 1962 | 0 | 1 |
| মার্কাস অরিলিয়স | 180 | 0 | 1 |
| মুহম্মদ ইকবাল | 1938 | 1 | 0 |
| মেগাস্থিনিস | -281 | 1 | 0 |
| মোহনদাস করমচাঁদ গান্ধী | 1948 | 1 | 0 |
| মোহিতলাল মজুমদার | 1952 | 0 | 1 |
| ম্যাক্সিম গোর্কি | 1936 | 1 | 0 |
| যতীন্দ্রমোহন সেনগুপ্ত | 1952 | 1 | 0 |
| যদুনাথ মজুমদার | 1932 | 0 | 1 |
| যোগীন্দ্রনাথ সরকার | 1937 | 0 | 1 |
| যোগেন্দ্রনাথ বন্দ্যোপাধ্যায় | 1904 | 1 | 0 |
| রঙ্গলাল বন্দ্যোপাধ্যায় | 1887 | 1 | 0 |
| রবীন্দ্রনাথ মৈত্র | 1933 | 0 | 1 |
| রমাপ্রসাদ চন্দ | 1942 | 1 | 0 |
| রসময় লাহা | 1928 | 1 | 0 |
| রাজমোহন নাথ | 1965 | 0 | 1 |
| রাজেন্দ্রনাথ বিদ্যাভূষণ | 1935 | 0 | 1 |
| রাধানাথ মিত্র | 1921 | 1 | 0 |
| রামেন্দ্রসুন্দর ত্রিবেদী | 1919 | 1 | 0 |
| রেনে মারাঁ | 1960 | 1 | 0 |
| লাল্লু লাল | 1825 | 0 | 1 |
| ল্যেভ তলস্তোয় | 1910 | 0 | 1 |
| শ্যামাপ্রসাদ মুখোপাধ্যায় | 1953 | 0 | 1 |
| সঞ্জীবচন্দ্র চট্টোপাধ্যায় | 1889 | 0 | 1 |
| সতীশচন্দ্র রায় | 1904 | 0 | 1 |
| সত্যচরণ শাস্ত্রী | 1935 | 1 | 0 |
| সত্যেন্দ্রনাথ ঠাকুর | 1923 | 1 | 0 |
| সত্যেন্দ্রনাথ দত্ত | 1922 | 1 | 0 |
| সমরেন্দ্রচন্দ্র দেববর্মণ | 1935 | 1 | 0 |
| সরলাবালা সরকার | 1961 | 1 | 0 |
| সুকান্ত ভট্টাচার্য | 1947 | 1 | 0 |
| সুকুমার রায় | 1923 | 0 | 1 |
| সুনীতি দেবী | 1932 | 1 | 0 |
| সুভাষচন্দ্র বসু | 1945 | 0 | 1 |
| সুরেন্দ্রনাথ ঠাকুর | 1940 | 0 | 1 |
| সুরেন্দ্রনাথ দাশগুপ্ত | 1952 | 0 | 1 |
| সুরেশচন্দ্র চক্রবর্তী | 1951 | 0 | 1 |
| সুরেশচন্দ্র বন্দ্যোপাধ্যায় | 1941 | 0 | 1 |
| সুশীলকুমার বসু | 1945 | 0 | 1 |
| সৈয়দ ইসমাইল হোসেন সিরাজী | 1931 | 1 | 0 |
| হরপ্রসাদ শাস্ত্রী | 1931 | 1 | 0 |
| হরিশচন্দ্র মিত্র | 1872 | 0 | 1 |
| হরিসাধন মুখোপাধ্যায় | 1938 | 1 | 0 |
| হানা ক্যাথেরিন মুলেন্স | 1861 | 1 | 0 |
| হানা রোসেলি হিগেন্স | 1940 | 1 | 0 |
| হেমেন্দ্রপ্রসাদ ঘোষ | 1962 | 1 | 0 |

## Excluded, by reason

| Reason | Works |
|---|---|
| author's death year is not on Wikidata | 84 |
| not a literary book | 28 |
| anonymous, or no author on Wikidata | 24 |
| another edition of the same work | 19 |
| already in our catalog | 16 |
| author died in YYYY, after YYYY | 15 |
| translation with no named translator | 12 |
| author is an organisation, not a person | 11 |
| translator's death year is not on Wikidata | 10 |
| first publication date unknown, and the scanned edition was printed in YYYY, after the death of its author | 3 |
| translator died in YYYY, after YYYY | 2 |
| editor's death year is not on Wikidata | 1 |
| not in Bangla | 1 |
| the scan has no Wikidata item | 1 |

Every excluded scan, with its exact reason, is in `data/wikisource-excluded.json`.

## Titles romanised by the script (please check)

Wikidata has no English title for these, so `title` was romanised by rule. The URL slug is made from it.

- আঁধারে আলো → Andhare Alo
- অণুকথা সপ্তক → Anukatha Saptak
- ইংরেজ ডাকাত → Ingrej Dakat
- শ্রীযুত ডাক্তর এম, জে, ব্রমলি সাহেবের বক্তৃতার দ্বারা সংক্ষেপ আবেদন → Shrijut Daktar Em, Je, Bramali Saheber Baktritar Dwara Sangkshep Abedan
- ইরাণী উপকথা → Irani Upakatha
- কদলী-রাজ্য → Kadali-Rajya
- ইসলাম ও কমিউনিজ্‌ম্‌ → Isalam O Kamiunijm
- গৌরী → Gouri
- গুরুদক্ষিণা → Gurudakshina
- কৃষক আন্দোলন ও মধ্যবিত্ত → Krishak Andolan O Madhyabitta
- কালিদাস ও ভবভূতি → Kalidas O Bhababhuti
- চোরকাঁটা → Chorakanta
- চারণ → Charan
- চিন্তাতরঙ্গিণী → Chintatarangini
- ডমরু-চরিত → Damaru-Charit
- থার্ডক্লাশ → Thardaklash
- ঝাঁশীর রাজকুমার → Jhanshir Rajakumar
- নব্য-বিজ্ঞান → Nabya-Bijnan
- নাগপাশ → Nagapash
- পসরা → Pasara
- প্রেমিক সন্ন্যাসী → Premik Sannyasi
- পুষ্পপাত্র → Pushpapatra
- পুষ্পাঞ্জলি → Pushpanjali
- প্রাণোচ্ছ্বাস → Pranochchhwas
- পশ্চিম প্রদেশের দুর্ভিক্ষ উপশমে সাহায্য সংগ্রহার্থে ব্রাহ্মসমাজের বক্তৃতা → Pashchim Pradesher Durbhiksha Upashame Sahajya Sangraharthe Brahmasamajer Baktrita
- বড়বাড়ী → Barabari
- বিলাত ভ্রমণ → Bilat Bhraman
- ভয়ভাঙ্গা → Bhayabhanga
- ভবঘুরে → Bhabaghure
- ভাবে অভাব → Bhabe Abhab
- বিশ্বের উপাদান → Bishwer Upadan
- ভারত ও চীন → Bharat O Chin
- বীরবাহু কাব্য → Birabahu Kabya
- ভূঁই-চাঁপা → Bhui-Chanpa
- ভারতবর্ষের ইতিহাস → Bharatabarsher Itihas
- রাজকাহিনী → Rajakahini
- রামায়ণে রাক্ষস সভ্যতা → Ramayane Rakshas Sabhyata
- রামচন্দ্র বিদ্যাবাগীশ ও হরিহরানন্দনাথ তীর্থস্বামী → Ramachandra Bidyabagish O Hariharanandanath Tirthaswami
- মোহনলাল → Mohanalal
- শরৎ-সাহিত্য-সংগ্রহ → Sharat-Sahitya-Sangrah
- শিশির → Shishir
- সদ্ভাব কুসুম → Sadbhab Kusum
- লোকসাহিত্য → Lokasahitya
- হানাষি → Hanashi
- হিন্দু রসায়নী বিদ্যা → Hindu Rasayani Bidya
- সাহানা → Sahana
- স্বপ্ন → Swapna
- সীতা-হরণ-পাঁচালী → Sita-Haran-Panchali
- ‘পার্টিসন’-প্রহেলিকা → Partisan-Prahelika
- ৺কৃত্তিবাসের পরিচয় সংগ্রহ → Krittibaser Parichay Sangrah

## Spot-check: 20 random entries

Checked 2026-10-15 by `scripts/wikisource-spot-check.ts`, live, not from the import's cache (150 requests). A seeded random sample of 20 of the included works (ready and pending).

**20 of 20 passed.** For each work:
- **Died:** the death year Wikidata gives now, for every author, translator and editor, compared with an independent list of death years written down by hand (✓ = they agree). 13 of the 21 people are on that list.
- **Scans complete:** how many of the scans the main page transcludes are still in a 100% proofread category on bn.wikisource.
- **Pages:** the scan's proofread pages / validated pages, of all its pages; and the share of its proofread pages that the main page (and its chapter subpages) transcludes. Every transcluded page was confirmed proofread or validated.

| # | Work | Died (Wikidata now; independent list) | Scans complete | Pages proofread / validated | On the main page | Result |
|---|---|---|---|---|---|---|
| 1 | [ভারত কোন্ পথে?](https://bn.wikisource.org/wiki/ভারত_কোন্‌_পথে%3F) | বারীন্দ্রকুমার ঘোষ: 1959 (not on the independent list) | 1/1 | 111 / 0 of 114 | 96%, 4 subpages | ✓ pass |
| 2 | [আত্মচরিত](https://bn.wikisource.org/wiki/আত্মচরিত_(প্রফুল্লচন্দ্র_রায়)) | প্রফুল্লচন্দ্র রায়: 1944 ✓ | 1/1 | 402 / 20 of 421 | 100%, 29 subpages | ✓ pass |
| 3 | [হিন্দু অথবা প্রেসিডেন্সী কলেজের ইতিবৃত্ত](https://bn.wikisource.org/wiki/হিন্দু_অথবা_প্রেসিডেন্‌সী_কলেজের_ইতিবৃত্ত) | রাজনারায়ণ বসু: 1899 ✓ | 1/1 | 43 / 0 of 44 | 100% | ✓ pass |
| 4 | [এই কি ব্রাহ্ম বিবাহ](https://bn.wikisource.org/wiki/এই_কি_ব্রাহ্ম_বিবাহ) | শিবনাথ শাস্ত্রী: 1919 ✓ | 1/1 | 29 / 8 of 31 | 100% | ✓ pass |
| 5 | [বাগেশ্বরী শিল্প-প্রবন্ধাবলী](https://bn.wikisource.org/wiki/বাগেশ্বরী_শিল্প-প্রবন্ধাবলী_(১৯৪১)) | অবনীন্দ্রনাথ ঠাকুর: 1951 ✓ | 1/1 | 399 / 126 of 401 | 100%, 29 subpages | ✓ pass |
| 6 | [চোরকাঁটা](https://bn.wikisource.org/wiki/চোরকাঁটা) | চারুচন্দ্র বন্দ্যোপাধ্যায়: 1938 (not on the independent list) | 1/1 | 166 / 1 of 167 | 100%, 17 subpages | ✓ pass |
| 7 | [অদ্ভুত ফকির](https://bn.wikisource.org/wiki/অদ্ভুত_ফকির) | প্রিয়নাথ মুখোপাধ্যায়: 1947 (not on the independent list) | 1/1 | 42 / 1 of 42 | 100%, 9 subpages | ✓ pass |
| 8 | [বিবিধ প্রসঙ্গ](https://bn.wikisource.org/wiki/বিবিধ_প্রসঙ্গ) | রবীন্দ্রনাথ ঠাকুর: 1941 ✓ | 1/1 | 152 / 0 of 154 | 100%, 38 subpages | ✓ pass |
| 9 | [স্বপ্নলব্ধ ভারতবর্ষের ইতিহাস](https://bn.wikisource.org/wiki/স্বপ্নলব্ধ_ভারতবর্ষের_ইতিহাস) | ভূদেব মুখোপাধ্যায়: 1894 ✓ | 1/1 | 64 / 64 of 68 | 100%, 10 subpages | ✓ pass |
| 10 | [আমার দেখা তুরষ্ক](https://bn.wikisource.org/wiki/আমার_দেখা_তুরষ্ক) | শামসুন নাহার মাহমুদ: 1964 (not on the independent list) | 1/1 | 280 / 2 of 286 | 100%, 6 subpages | ✓ pass |
| 11 | [ভ্রান্তিবিলাস](https://bn.wikisource.org/wiki/ভ্রান্তিবিলাস_(১৮৮৬)) | ঈশ্বরচন্দ্র বিদ্যাসাগর: 1891 ✓ | 1/1 | 115 / 1 of 120 | 100%, 5 subpages | ✓ pass |
| 12 | [ফুলমণি ও করুণার বিবরণ](https://bn.wikisource.org/wiki/ফুলমণি_ও_করুণার_বিবরণ) | হানা ক্যাথেরিন মুলেন্স: 1861 (not on the independent list) | 1/1 | 309 / 6 of 321 | 100%, 11 subpages | ✓ pass |
| 13 | [শ্রীযুত ডাক্তর এম, জে, ব্রমলি সাহেবের বক্তৃতার দ্বারা সংক্ষেপ আবেদন](https://bn.wikisource.org/wiki/শ্রীযুত_ডাক্তর_এম,_জে,_ব্রমলি_সাহেবের_বক্তৃতার_দ্বারা_সংক্ষেপ_আবেদন) | মাউন্টফোর্ড জোসেফ ব্রমলি: 1837 (not on the independent list)<br>উদয়চন্দ্র আঢ্য: 1856 (not on the independent list) | 1/1 | 20 / 0 of 22 | 100% | ✓ pass |
| 14 | [কজ্জলী](https://bn.wikisource.org/wiki/কজ্জলী) | রাজশেখর বসু: 1960 ✓ | 1/1 | 215 / 1 of 224 | 100%, 6 subpages | ✓ pass |
| 15 | [কণিকা](https://bn.wikisource.org/wiki/কণিকা_(রবীন্দ্রনাথ_ঠাকুর)) | রবীন্দ্রনাথ ঠাকুর: 1941 ✓ | 1/1 | 123 / 123 of 137 | 100%, 110 subpages | ✓ pass |
| 16 | [বৈকুণ্ঠের খাতা](https://bn.wikisource.org/wiki/বৈকুণ্ঠের_খাতা) | রবীন্দ্রনাথ ঠাকুর: 1941 ✓ | 1/1 | 57 / 0 of 59 | 100%, 3 subpages | ✓ pass |
| 17 | [মিবাররাজ](https://bn.wikisource.org/wiki/মিবাররাজ) | স্বর্ণকুমারী দেবী: 1932 ✓ | 1/1 | 82 / 0 of 85 | 100%, 18 subpages | ✓ pass |
| 18 | [ঔপনিষদ ব্রহ্ম](https://bn.wikisource.org/wiki/ঔপনিষদ_ব্রহ্ম) | রবীন্দ্রনাথ ঠাকুর: 1941 ✓ | 1/1 | 43 / 0 of 44 | 100% | ✓ pass |
| 19 | [স্বদেশিনী](https://bn.wikisource.org/wiki/স্বদেশিনী) | গিরীন্দ্রমোহিনী দাসী: 1924 (not on the independent list) | 1/1 | 31 / 0 of 33 | 100%, 18 subpages | ✓ pass |
| 20 | [চিঠিপত্র](https://bn.wikisource.org/wiki/চিঠিপত্র_(প্রথম_খণ্ড)) | রবীন্দ্রনাথ ঠাকুর: 1941 ✓ | 1/1 | 86 / 3 of 97 | 100%, 39 subpages | ✓ pass |

No problems found.

## Already in our catalog: add the link to the existing book

These passed every check but the book is already in the catalog, so they aren't in the import. Add the link on /admin/books (the book's "বাইরের সাইটে বিনামূল্যের কপি" box).

| Work | Author | Wikisource |
|---|---|---|
| তিতাস একটি নদীর নাম | অদ্বৈত মল্লবর্মণ | https://bn.wikisource.org/wiki/তিতাস_একটি_নদীর_নাম |
| রূপসী বাংলা | জীবনানন্দ দাশ | https://bn.wikisource.org/wiki/রূপসী_বাংলা |
| আলালের ঘরের দুলাল | প্যারীচাঁদ মিত্র | https://bn.wikisource.org/wiki/আলালের_ঘরের_দুলাল_(১৮৭০) |
| আনন্দমঠ | বঙ্কিমচন্দ্র চট্টোপাধ্যায় | https://bn.wikisource.org/wiki/আনন্দমঠ_(১৯৩৮) |
| কপালকুণ্ডলা | বঙ্কিমচন্দ্র চট্টোপাধ্যায় | https://bn.wikisource.org/wiki/কপালকুণ্ডলা_(বঙ্কিমচন্দ্র_চট্টোপাধ্যায়,_১৮৭০) |
| পদ্মা নদীর মাঝি | মানিক বন্দ্যোপাধ্যায় | https://bn.wikisource.org/wiki/পদ্মানদীর_মাঝি |
| গীতাঞ্জলি | রবীন্দ্রনাথ ঠাকুর | https://bn.wikisource.org/wiki/গীতাঞ্জলি_(১৯১৩) |
| গোরা | রবীন্দ্রনাথ ঠাকুর | https://bn.wikisource.org/wiki/গোরা_(রবীন্দ্রনাথ_ঠাকুর) |
| চিত্রা | রবীন্দ্রনাথ ঠাকুর | https://bn.wikisource.org/wiki/চিত্রা |
| জীবনস্মৃতি | রবীন্দ্রনাথ ঠাকুর | https://bn.wikisource.org/wiki/জীবন-স্মৃতি_(১৯৪১) |
| শেষের কবিতা | রবীন্দ্রনাথ ঠাকুর | https://bn.wikisource.org/wiki/শেষের_কবিতা_(রবীন্দ্রনাথ_ঠাকুর,_১৯২৯) |
| সোনার তরী | রবীন্দ্রনাথ ঠাকুর | https://bn.wikisource.org/wiki/সোনার_তরী_(১৮৯৩) |
| দেবদাস | শরৎচন্দ্র চট্টোপাধ্যায় | https://bn.wikisource.org/wiki/দেবদাস_(শরৎচন্দ্র_চট্টোপাধ্যায়) |
| পথের দাবী | শরৎচন্দ্র চট্টোপাধ্যায় | https://bn.wikisource.org/wiki/পথের_দাবী_(শরৎচন্দ্র_চট্টোপাধ্যায়,_১৯৫৮) |
| শ্রীকান্ত | শরৎচন্দ্র চট্টোপাধ্যায় | https://bn.wikisource.org/wiki/শ্রীকান্ত_(প্রথম_পর্ব) |
| ছাড়পত্র | সুকান্ত ভট্টাচার্য | https://bn.wikisource.org/wiki/ছাড়পত্র |

## Every excluded scan

| Work | Author | Scan | Reason |
|---|---|---|---|
| তিতাস একটি নদীর নাম | অদ্বৈত মল্লবর্মণ | তিতাস একটি নদীর নাম.djvu | already in our catalog (add this Wikisource link to the existing book instead) |
| রূপসী বাংলা | জীবনানন্দ দাশ | রূপসী বাংলা - জীবনানন্দ দাশ.pdf | already in our catalog (add this Wikisource link to the existing book instead) |
| আলালের ঘরের দুলাল | প্যারীচাঁদ মিত্র | আলালের ঘরের দুলাল.djvu | already in our catalog (add this Wikisource link to the existing book instead) |
| আনন্দমঠ | বঙ্কিমচন্দ্র চট্টোপাধ্যায় | আনন্দমঠ - বঙ্কিমচন্দ্র চট্টোপাধ্যায়.djvu | already in our catalog (add this Wikisource link to the existing book instead) |
| কপালকুণ্ডলা | বঙ্কিমচন্দ্র চট্টোপাধ্যায় | কপালকুণ্ডলা (দ্বিতীয় সংস্করণ).pdf | already in our catalog (add this Wikisource link to the existing book instead) |
| পদ্মা নদীর মাঝি | মানিক বন্দ্যোপাধ্যায় | পদ্মানদীর মাঝি - মানিক বন্দ্যোপাধ্যায়.pdf | already in our catalog (add this Wikisource link to the existing book instead) |
| গীতাঞ্জলি | রবীন্দ্রনাথ ঠাকুর | গীতাঞ্জলি - রবীন্দ্রনাথ ঠাকুর.djvu | already in our catalog (add this Wikisource link to the existing book instead) |
| গোরা | রবীন্দ্রনাথ ঠাকুর | গোরা-রবীন্দ্রনাথ ঠাকুর.pdf | already in our catalog (add this Wikisource link to the existing book instead) |
| চিত্রা | রবীন্দ্রনাথ ঠাকুর | চিত্রা-রবীন্দ্রনাথ ঠাকুর.djvu | already in our catalog (add this Wikisource link to the existing book instead) |
| জীবনস্মৃতি | রবীন্দ্রনাথ ঠাকুর | জীবন-স্মৃতি - রবীন্দ্রনাথ ঠাকুর (১৩৪৮).pdf | already in our catalog (add this Wikisource link to the existing book instead) |
| শেষের কবিতা | রবীন্দ্রনাথ ঠাকুর | শেষের কবিতা - রবীন্দ্রনাথ ঠাকুর.pdf | already in our catalog (add this Wikisource link to the existing book instead) |
| সোনার তরী | রবীন্দ্রনাথ ঠাকুর | সোনার তরী-রবীন্দ্রনাথ ঠাকুর.djvu | already in our catalog (add this Wikisource link to the existing book instead) |
| দেবদাস | শরৎচন্দ্র চট্টোপাধ্যায় | দেবদাস - শরৎচন্দ্র চট্টোপাধ্যায়.pdf | already in our catalog (add this Wikisource link to the existing book instead) |
| পথের দাবী | শরৎচন্দ্র চট্টোপাধ্যায় | পথের দাবী - শরৎচন্দ্র চট্টোপাধ্যায়.pdf | already in our catalog (add this Wikisource link to the existing book instead) |
| শ্রীকান্ত | শরৎচন্দ্র চট্টোপাধ্যায় | শ্রীকান্ত (প্রথম পর্ব).djvu | already in our catalog (add this Wikisource link to the existing book instead) |
| ছাড়পত্র | সুকান্ত ভট্টাচার্য | ছাড়পত্র - সুকান্ত ভট্টাচার্য.pdf | already in our catalog (add this Wikisource link to the existing book instead) |
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
| সাহিত্য-চিন্তা | কুমুদিনী বসু | সাহিত্য-চিন্তা - কুমুদিনী বসু.pdf | author's death year is not on Wikidata (কুমুদিনী বসু) |
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
| অদ্ভুত রামায়ণ | বাল্মীকি | অদ্ভুত রামায়ণ - সৌদামিনী দেবী.pdf | author's death year is not on Wikidata (বাল্মীকি) |
| চিদ্বিলাস | বিনয় কুমার সান্যাল | চিদ্বিলাস - বিনয় কুমার সান্যাল.pdf | author's death year is not on Wikidata (বিনয় কুমার সান্যাল) |
| নিনিবি শহরের রিহাই | বিপিন বিহারী শাহ | নিনিবি শহরের রিহাই - বিপিন বিহারী শাহ.pdf | author's death year is not on Wikidata (বিপিন বিহারী শাহ) |
| বেহেস্তের বয়ান | বিপিন বিহারী শাহ | বেহেস্তের বয়ান - বিপিন বিহারী শাহ.pdf | author's death year is not on Wikidata (বিপিন বিহারী শাহ) |
| খোঁজে | বিভাবতী দেবী চৌধুরাণী | খোঁজে - বিভাবতী দেবী চৌধুরাণী.pdf | author's death year is not on Wikidata (বিভাবতী দেবী চৌধুরাণী) |
| রসমঞ্জরী | ভানুদত্ত মিশ্র | রসমঞ্জরী - ভারতচন্দ্র রায় (১৮৫৩).pdf | author's death year is not on Wikidata (ভানুদত্ত মিশ্র) |
| পরের-মেয়ে | ভূপেন্দ্রনাথ রায় চৌধুরী | পরের-মেয়ে - ভূপেন্দ্রনাথ রায় চৌধুরী (১৯২০).pdf | author's death year is not on Wikidata (ভূপেন্দ্রনাথ রায় চৌধুরী) |
| লক্ষ্মী | ভূপেন্দ্রনাথ রায় চৌধুরী | লক্ষ্মী - ভূপেন্দ্রনাথ রায় চৌধুরী (১৯২০).pdf | author's death year is not on Wikidata (ভূপেন্দ্রনাথ রায় চৌধুরী) |
| কাদম্বরী | বাণভট্ট ও ভূষণভট্ট | কাদম্বরী.djvu | author's death year is not on Wikidata (ভূষণভট্ট) |
| বাসন্তিকা | মণীন্দ্রনাথ সিংহ | বাসন্তিকা - মনীন্দ্রনাথ সিংহ.pdf | author's death year is not on Wikidata (মণীন্দ্রনাথ সিংহ) |
| শিক্ষিতা পতিতার আত্মচরিত | মানদা দেবী | শিক্ষিতা পতিতার আত্মচরিত - মানদা দেবী.pdf | author's death year is not on Wikidata (মানদা দেবী) |
| ধৰ্ম্মঘট | যতীন্দ্রনাথ পাল | ধৰ্ম্মঘট - যতীন্দ্রনাথ পাল (১৯২০).pdf | author's death year is not on Wikidata (যতীন্দ্রনাথ পাল) |
| উনিশে মে: ভাষার সংকট | রণবীর পুরকায়স্থ | উনিশে মে- ভাষার সংকট - রণবীর পুরকায়স্থ (২০২১).pdf | author's death year is not on Wikidata (রণবীর পুরকায়স্থ) |
| ডিগবাজী খাঁ | রবীন্দ্রনাথ সেন | ডিগবাজী খাঁ - রবীন্দ্রনাথ সেন (১৯২৯).pdf | author's death year is not on Wikidata (রবীন্দ্রনাথ সেন) |
| মহারাজ কৃষ্ণচন্দ্র রায়স্য চরিত্রং | রাজীবলোচন মুখোপাধ্যায় | মহারাজ কৃষ্ণচন্দ্র রায়স্য চরিত্রং - রাজীবলোচন মুখোপাধ্যায়.pdf | author's death year is not on Wikidata (রাজীবলোচন মুখোপাধ্যায়) |
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
