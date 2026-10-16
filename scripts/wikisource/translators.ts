// Who wrote the Bangla text, for works whose original is older than Bangla
// prose or in another language. Wikidata names a translator for most (P655 on
// the edition), and the import requires one whenever it sees a translation.
// Two kinds of work need a person's word on top of that:
//
// - retellings and translations that Wikisource and Wikidata credit to the
//   Bangla writer as author (রাজশেখর বসু's মহাভারত): the person who wrote the
//   Bangla text is the credited author, so the death-year rule already
//   applies to them; listed here so the report can say so;
// - works by an author who died before 1800 with no translator: either the
//   author wrote in Bangla (listed here, with how we know), or the Bangla
//   text's writer is unidentified and the work fails the check.
//
// Keys are `${titleBangla}|${author}` as in the import row.

export const RETOLD_BY_AUTHOR: Record<string, string> = {
  "শকুন্তলা|ঈশ্বরচন্দ্র বিদ্যাসাগর": "Kalidasa's Abhijnanasakuntalam (Sanskrit), retold as Bangla prose",
  "শকুন্তলা|অবনীন্দ্রনাথ ঠাকুর": "Kalidasa's Abhijnanasakuntalam (Sanskrit), retold for children",
  "ভ্রান্তিবিলাস|ঈশ্বরচন্দ্র বিদ্যাসাগর": "Shakespeare's The Comedy of Errors (English), adapted as Bangla prose",
  "সীতার বনবাস|ঈশ্বরচন্দ্র বিদ্যাসাগর": "Bhavabhuti's Uttararamacharita and the Ramayana (Sanskrit), retold",
  "হেক্‌টর বধ|মাইকেল মধুসূদন দত্ত": "Homer's Iliad (Greek), retold as Bangla prose",
  "মহাভারত (উপক্রমণিকাভাগ)|ঈশ্বরচন্দ্র বিদ্যাসাগর": "the Mahabharata (Sanskrit), opening chapters translated",
  "মহাভারত|রাজশেখর বসু": "the Mahabharata (Sanskrit), condensed translation (সারানুবাদ)",
  "কুরু পাণ্ডব|রবীন্দ্রনাথ ঠাকুর": "the Mahabharata (Sanskrit), episodes retold",
  "সতী|দীনেশচন্দ্র সেন": "the Puranic Sati legend, retold",
  "ভয়ভাঙ্গা|দীনেশচন্দ্র সেন": "Radha-Krishna legends, retold",
  "মেয়েলি ব্রত ও কথা|পরমেশপ্রসন্ন রায়": "oral folk tales and rituals of East Bengal, collected and written down",
};

export const BANGLA_ORIGINAL: Record<string, string> = {
  "মানসিংহ|ভারতচন্দ্র রায়": "ভারতচন্দ্র wrote in Bangla: মানসিংহ is the third part of his Bangla অন্নদামঙ্গল (1752)",
};
