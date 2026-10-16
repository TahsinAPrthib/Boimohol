# Spot-check, batch 2 (`data/wikisource-import-2.json`)

Checked 2026-10-15 by `scripts/wikisource-spot-check.ts`, live, not from the import's cache (163 requests). A seeded random sample of 20 of the included works (ready and pending).

**20 of 20 passed.** For each work:
- **Died:** the death year Wikidata gives now, for every author, translator and editor, compared with an independent list of death years written down by hand (✓ = they agree). 10 of the 25 people are on that list.
- **Scans complete:** how many of the scans the main page transcludes are still in a 100% proofread category on bn.wikisource.
- **Pages:** the scan's proofread pages / validated pages, of all its pages; and the share of its proofread pages that the main page (and its chapter subpages) transcludes. Every transcluded page was confirmed proofread or validated.

| # | Work | Died (Wikidata now; independent list) | Scans complete | Pages proofread / validated | On the main page | Result |
|---|---|---|---|---|---|---|
| 1 | [পথে-বিপথে](https://bn.wikisource.org/wiki/পথে-বিপথে_(১৯১৮)) | অবনীন্দ্রনাথ ঠাকুর: 1951 ✓ | 1/1 | 146 / 0 of 147 | 100%, 16 subpages | ✓ pass |
| 2 | [সাহিত্য-চিন্তা](https://bn.wikisource.org/wiki/সাহিত্য-চিন্তা_(কুমুদিনী_বসু)) | কুমুদিনী বসু: by 1943 (bn.wikipedia.org; not on Wikidata) | 1/1 | 122 / 0 of 135 | 100%, 11 subpages | ✓ pass |
| 3 | [গ্রাম্য উপাখ্যান](https://bn.wikisource.org/wiki/গ্রাম্য_উপাখ্যান) | রাজনারায়ণ বসু: 1899 ✓ | 1/1 | 159 / 2 of 165 | 100%, 19 subpages | ✓ pass |
| 4 | [ভয়ভাঙ্গা](https://bn.wikisource.org/wiki/ভয়ভাঙ্গা) | দীনেশচন্দ্র সেন: 1939 ✓ | 1/1 | 45 / 0 of 59 | 100%, 11 subpages | ✓ pass |
| 5 | [অদ্ভুত রামায়ণ](https://bn.wikisource.org/wiki/অদ্ভুত_রামায়ণ_(১৮৯০)) | বাল্মীকি: by 300 (en.wikipedia.org; not on Wikidata)<br>সৌদামিনী দেবী: 1920 (not on the independent list) | 1/1 | 202 / 0 of 209 | 100%, 26 subpages | ✓ pass |
| 6 | [মেয়েলি ব্রত ও কথা](https://bn.wikisource.org/wiki/মেয়েলি_ব্রত_ও_কথা) | পরমেশপ্রসন্ন রায়: 1927 (not on the independent list) | 1/1 | 118 / 0 of 126 | 100%, 13 subpages | ✓ pass |
| 7 | [নীলগঞ্জের ফালমন সাহেব](https://bn.wikisource.org/wiki/নীলগঞ্জের_ফালমন_সাহেব) | বিভূতিভূষণ বন্দ্যোপাধ্যায়: 1950 ✓ | 1/1 | 123 / 0 of 132 | 100%, 12 subpages | ✓ pass |
| 8 | [কুরু পাণ্ডব](https://bn.wikisource.org/wiki/কুরু_পাণ্ডব) | রবীন্দ্রনাথ ঠাকুর: 1941 ✓ | 1/1 | 278 / 1 of 284 | 100%, 12 subpages | ✓ pass |
| 9 | [কাদম্বরী](https://bn.wikisource.org/wiki/কাদম্বরী_(তারাশঙ্কর_তর্করত্ন,_১৮৯২)) | বাণভট্ট: 650 (not on the independent list)<br>ভূষণভট্ট: by 800 (en.wikipedia.org; not on Wikidata)<br>তারাশঙ্কর তর্করত্ন: 1858 (not on the independent list) | 1/1 | 151 / 151 of 151 | 100%, 16 subpages | ✓ pass |
| 10 | [রসমঞ্জরী](https://bn.wikisource.org/wiki/রসমঞ্জরী) | ভানুদত্ত মিশ্র: by 1600 (en.wikipedia.org; not on Wikidata)<br>ভারতচন্দ্র রায়: 1760 ✓ | 1/1 | 37 / 0 of 41 | 100% | ✓ pass |
| 11 | [মহাভারত (উপক্রমণিকাভাগ)](https://bn.wikisource.org/wiki/মহাভারত_(উপক্রমণিকাভাগ)) | ঈশ্বরচন্দ্র বিদ্যাসাগর: 1891 ✓ | 1/1 | 235 / 3 of 248 | 100%, 62 subpages | ✓ pass |
| 12 | [মহাভারত](https://bn.wikisource.org/wiki/মহাভারত_(রাজশেখর_বসু)) | রাজশেখর বসু: 1960 ✓ | 1/1 | 720 / 3 of 720 | 100%, 92 subpages | ✓ pass |
| 13 | [প্রাচীন ভারতে নারী](https://bn.wikisource.org/wiki/প্রাচীন_ভারতে_নারী) | ক্ষিতিমোহন সেন: 1960 (not on the independent list) | 1/1 | 134 / 3 of 134 | 100%, 12 subpages | ✓ pass |
| 14 | [মহারাজ কৃষ্ণচন্দ্র রায়স্য চরিত্রং](https://bn.wikisource.org/wiki/মহারাজ_কৃষ্ণচন্দ্র_রায়স্য_চরিত্রং) | রাজীবলোচন মুখোপাধ্যায়: by 1900 (bn.banglapedia.org; not on Wikidata) | 1/1 | 79 / 0 of 85 | 100% | ✓ pass |
| 15 | [গুরুদক্ষিণা](https://bn.wikisource.org/wiki/গুরুদক্ষিণা) | সতীশচন্দ্র রায়: 1904 (not on the independent list) | 1/1 | 74 / 2 of 79 | 100%, 8 subpages | ✓ pass |
| 16 | [গোচারণের মাঠ](https://bn.wikisource.org/wiki/গোচারণের_মাঠ) | অক্ষয়চন্দ্র সরকার: 1917 (not on the independent list) | 1/1 | 28 / 28 of 35 | 100% | ✓ pass |
| 17 | [সতী](https://bn.wikisource.org/wiki/সতী_(দীনেশচন্দ্র_সেন)) | দীনেশচন্দ্র সেন: 1939 ✓ | 1/1 | 55 / 55 of 58 | 98%, 12 subpages | ✓ pass |
| 18 | [বত্রিশ সিংহাসন](https://bn.wikisource.org/wiki/বত্রিশ_সিংহাসন_(নীলমণি_বসাক)) | লাল্লু লাল: 1825 (not on the independent list)<br>নীলমণি বসাক: 1864 (not on the independent list) | 1/1 | 214 / 0 of 217 | 100%, 33 subpages | ✓ pass |
| 19 | [প্রেমিক সন্ন্যাসী](https://bn.wikisource.org/wiki/প্রেমিক_সন্ন্যাসী) | অনাথনাথ বসু: 1935 (not on the independent list) | 1/1 | 134 / 0 of 146 | 100%, 11 subpages | ✓ pass |
| 20 | [সংকলন](https://bn.wikisource.org/wiki/সংকলন) | রবীন্দ্রনাথ ঠাকুর: 1941 ✓ | 1/1 | 389 / 4 of 392 | 100%, 36 subpages | ✓ pass |

No problems found.
