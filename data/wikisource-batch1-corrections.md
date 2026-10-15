# Batch 1 corrections (2026-10-16)

Three rights notes in `data/wikisource-import.json` gave an approximate Wikidata death date as if it were exact (or a BCE year as a negative number). Only these notes changed; nothing else in batch 1 did. If batch 1 is already imported, edit each note on /admin/books, in the book's “বাইরের সাইটে বিনামূল্যের কপি” box.

| Book | Was | Now |
|---|---|---|
| কথামালা | লেখক ঈসপ -৫৬৪ সালে ও অনুবাদক ঈশ্বরচন্দ্র বিদ্যাসাগর ১৮৯১ সালে মারা গেছেন; … | লেখক ঈসপ আনুমানিক খ্রিস্টপূর্ব ৫৬৪ সালে ও অনুবাদক ঈশ্বরচন্দ্র বিদ্যাসাগর ১৮৯১ সালে মারা গেছেন; … |
| চিত্রে জয়দেব ও গীতগোবিন্দ | লেখক জয়দেব ১২৪৫ সালে, … | লেখক জয়দেব আনুমানিক ১২৪৫ সালে, … |
| মেগাস্থেনীসের ভারত-বিবরণ | লেখক মেগাস্থিনিস -২৮১ সালে, … | লেখক মেগাস্থিনিস খ্রিস্টপূর্ব ২৯০-এর দশকে, … |

Why: Wikidata marks ঈসপ's and জয়দেব's dates as “circa” and gives মেগাস্থিনিস's only to the decade. The import now follows Wikidata's own precision (`deathOf` in `scripts/wikisource/wikidata.ts`).
