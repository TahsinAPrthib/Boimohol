# Spot-check, batch 1 (`data/wikisource-import.json`)

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
