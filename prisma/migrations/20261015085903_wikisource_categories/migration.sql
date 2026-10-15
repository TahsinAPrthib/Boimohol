-- Five new categories for the Bangla Wikisource import (data only; no schema
-- change). An existing slug is left as it is, so this is safe to re-run and
-- never overwrites a name or description an admin has changed.
INSERT INTO "Category" ("id", "slug", "name", "nameBangla", "description", "colorKey") VALUES
  ('cat-probondho', 'probondho', 'Essays', 'প্রবন্ধ', 'সমাজ, সাহিত্য, ধর্ম, বিজ্ঞান ও শিক্ষা নিয়ে প্রবন্ধ, বক্তৃতা আর চিঠিপত্র।', 'ink'),
  ('cat-chhotogolpo', 'chhotogolpo', 'Short Stories', 'ছোটগল্প', 'ছোটগল্প আর গল্পের সংকলন।', 'cloth-light'),
  ('cat-natok', 'natok', 'Plays', 'নাটক', 'নাটক, প্রহসন ও কাব্যনাট্য।', 'oxblood'),
  ('cat-bhromon', 'bhromon', 'Travel Writing', 'ভ্রমণকাহিনি', 'দেশ-বিদেশ ঘোরার অভিজ্ঞতা নিয়ে লেখা বই।', 'sage'),
  ('cat-shishu-sahitto', 'shishu-sahitto', 'Children''s Books', 'শিশুসাহিত্য', 'ছোটদের জন্য গল্প, ছড়া আর রূপকথা।', 'turmeric')
ON CONFLICT ("slug") DO NOTHING;
