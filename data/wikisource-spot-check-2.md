# Spot-check, batch 2 (`data/wikisource-import-2.json`)

Checked 2026-10-15 by `scripts/wikisource-spot-check.ts`, live, not from the import's cache (95 requests). A seeded random sample of 13 of the included works (ready and pending).

**13 of 13 passed.** For each work:
- **Died:** the death year Wikidata gives now, for every author, translator and editor, compared with an independent list of death years written down by hand (✓ = they agree). 6 of the 16 people are on that list.
- **Scans complete:** how many of the scans the main page transcludes are still in a 100% proofread category on bn.wikisource.
- **Pages:** the scan's proofread pages / validated pages, of all its pages; and the share of its proofread pages that the main page (and its chapter subpages) transcludes. Every transcluded page was confirmed proofread or validated.

| # | Work | Died (Wikidata now; independent list) | Scans complete | Pages proofread / validated | On the main page | Result |
|---|---|---|---|---|---|---|
| 1 | [বেল্লিক রামায়ণ](https://bn.wikisource.org/wiki/বেল্লিক_রামায়ণ) | কালীপ্রসন্ন বিদ্যারত্ন: 1924 (not on the independent list) | 1/1 | 218 / 2 of 230 | 100%, 30 subpages | ✓ pass |
| 2 | [প্রাচীন ভারতে নারী](https://bn.wikisource.org/wiki/প্রাচীন_ভারতে_নারী) | ক্ষিতিমোহন সেন: 1960 (not on the independent list) | 1/1 | 134 / 3 of 134 | 100%, 12 subpages | ✓ pass |
| 3 | [পাষাণের কথা](https://bn.wikisource.org/wiki/পাষাণের_কথা) | রাখালদাস বন্দ্যোপাধ্যায়: 1930 ✓ | 1/1 | 183 / 61 of 195 | 100%, 14 subpages | ✓ pass |
| 4 | [নীলগঞ্জের ফালমন সাহেব](https://bn.wikisource.org/wiki/নীলগঞ্জের_ফালমন_সাহেব) | বিভূতিভূষণ বন্দ্যোপাধ্যায়: 1950 ✓ | 1/1 | 123 / 0 of 132 | 100%, 12 subpages | ✓ pass |
| 5 | [কাদম্বরী](https://bn.wikisource.org/wiki/কাদম্বরী_(তারাশঙ্কর_তর্করত্ন,_১৮৯২)) | বাণভট্ট: 650 (not on the independent list)<br>ভূষণভট্ট: by 800 (en.wikipedia.org; not on Wikidata)<br>তারাশঙ্কর তর্করত্ন: 1858 (not on the independent list) | 1/1 | 151 / 151 of 151 | 100%, 16 subpages | ✓ pass |
| 6 | [গ্রাম্য উপাখ্যান](https://bn.wikisource.org/wiki/গ্রাম্য_উপাখ্যান) | রাজনারায়ণ বসু: 1899 ✓ | 1/1 | 159 / 2 of 165 | 100%, 19 subpages | ✓ pass |
| 7 | [গুরুদক্ষিণা](https://bn.wikisource.org/wiki/গুরুদক্ষিণা) | সতীশচন্দ্র রায়: 1904 (not on the independent list) | 1/1 | 74 / 2 of 79 | 100%, 8 subpages | ✓ pass |
| 8 | [মহারাজ কৃষ্ণচন্দ্র রায়স্য চরিত্রং](https://bn.wikisource.org/wiki/মহারাজ_কৃষ্ণচন্দ্র_রায়স্য_চরিত্রং) | রাজীবলোচন মুখোপাধ্যায়: by 1900 (bn.banglapedia.org; not on Wikidata) | 1/1 | 79 / 0 of 85 | 100% | ✓ pass |
| 9 | [গোচারণের মাঠ](https://bn.wikisource.org/wiki/গোচারণের_মাঠ) | অক্ষয়চন্দ্র সরকার: 1917 (not on the independent list) | 1/1 | 28 / 28 of 35 | 100% | ✓ pass |
| 10 | [রসমঞ্জরী](https://bn.wikisource.org/wiki/রসমঞ্জরী) | ভানুদত্ত মিশ্র: by 1600 (en.wikipedia.org; not on Wikidata)<br>ভারতচন্দ্র রায়: 1760 ✓ | 1/1 | 37 / 0 of 41 | 100% | ✓ pass |
| 11 | [মোহনলাল](https://bn.wikisource.org/wiki/মোহনলাল) | যোগীন্দ্রনাথ সরকার: 1937 ✓ | 1/1 | 74 / 0 of 78 | 100%, 4 subpages | ✓ pass |
| 12 | [সংকলন](https://bn.wikisource.org/wiki/সংকলন) | রবীন্দ্রনাথ ঠাকুর: 1941 ✓ | 1/1 | 389 / 4 of 392 | 100%, 36 subpages | ✓ pass |
| 13 | [প্রেমিক সন্ন্যাসী](https://bn.wikisource.org/wiki/প্রেমিক_সন্ন্যাসী) | অনাথনাথ বসু: 1935 (not on the independent list) | 1/1 | 134 / 0 of 146 | 100%, 11 subpages | ✓ pass |

No problems found.
