# Catalog: what to verify

`catalog-import.json` holds 125 books I'm confident about. This file lists
three groups: books I left out, books with no single author, and details
inside the file that you should check before relying on them.

Public-domain rule used throughout: under Bangladeshi law a work is protected
until 60 years after the end of the year its author died, so in 2026 only
authors who died in 1965 or earlier qualify. Where I was unsure, the flag is
`false`.

## 1. Left out: not sure enough of the book, the author or the content

| Book | Author | Why it's not in the file |
|---|---|---|
| ফিহা সমীকরণ | হুমায়ূন আহমেদ | Sure it exists; not sure enough of the plot to describe it. |
| ক্রোমিয়াম অরণ্য, ত্রাতুলের জগৎ, অবনীল, রবোনগরী | মুহম্মদ জাফর ইকবাল | Science fiction I believe is his; not sure of exact titles or plots. |
| নিশীথিনী | হুমায়ূন আহমেদ | Believed to be a Misir Ali novel; not sure of the story. |
| ভয়ংকর সুন্দর | সুনীল গঙ্গোপাধ্যায় | Believed to be the first Kakababu novel; not certain. |
| কালো ভ্রমর | নীহাররঞ্জন গুপ্ত | Kiriti Roy mystery; not certain of the title. |
| নীলবসনা সুন্দরী | পাঁচকড়ি দে | Early Bangla detective novel; not certain of title or year. |
| দারোগার দপ্তর | প্রিয়নাথ মুখোপাধ্যায় | A long series rather than one book; needs a decision on how to list it. |
| বাংলার ইতিহাস | রাখালদাস বন্দ্যোপাধ্যায় | Not sure of the exact title and volumes. |
| আমার জীবন | রাসসুন্দরী দেবী | The book is certain (1876); her death year isn't, so the flag can't be set. |
| আমি বিজয় দেখেছি | এম আর আখতার মুকুল | Fairly sure, but not certain enough. |
| নিষ্ফলা মাঠের কৃষক | আবদুল্লাহ আবু সায়ীদ | Fairly sure it's his teaching memoir; not certain. |
| অব্যক্ত | জগদীশচন্দ্র বসু | Real (1921), but mostly essays. It contains the early science-fiction story "পলাতক তুফান"; it's not clear which category it fits. |
| ঢোঁড়াই চরিত মানস | সতীনাথ ভাদুড়ী | Sure of it, but see জাগরী below on his death year. |
| The Magic of Thinking Big | David J. Schwartz | Not sure of the author's death year. |
| Wings of Fire, Banker to the Poor, Rich Dad Poor Dad, I Am Malala | (co-written) | Each has a co-author; one `authorDeathYear` can't describe two people. |

## 2. Left out: anonymous, ancient, or no single author

| Work | Why |
|---|---|
| চর্যাপদ | Many poets. |
| ঠাকুরমার ঝুলি | Folk tales collected by দক্ষিণারঞ্জন মিত্র মজুমদার; he compiled them but didn't write them. |
| ময়মনসিংহ গীতিকা | Folk ballads, collected and edited by others. |
| পঞ্চতন্ত্র | Traditionally credited to Vishnu Sharma; authorship is uncertain. |
| The Art of War | Credited to Sun Tzu; authorship is debated. |
| Rubaiyat of Omar Khayyam | Attribution of many quatrains is disputed; the famous English version is FitzGerald's. |
| One Thousand and One Nights | Anonymous. |

Meditations (Marcus Aurelius, died 180) is in the file, because it has a
single, known author.

## 3. In the file, but check these

- **জাগরী, সতীনাথ ভাদুড়ী:** recorded as died 1965. That is exactly the cutoff year. I left the flag `false`; if you confirm 1965, it may be set to `true`.
- **The Diary of a Young Girl, Anne Frank:** she died in 1945, but the Anne Frank Fonds claims Otto Frank (died 1980) as a co-author of the published text. I left the flag `false`.
- **যে জলে আগুন জ্বলে, হেলাল হাফিজ:** recorded as died 2024. Please confirm the year (the flag is `false` either way).
- **The Richest Man in Babylon, George S. Clason:** recorded as died 1957, and flagged `true`. Please confirm the death year.
- **How to Stop Worrying and Start Living, Dale Carnegie** (died 1955, flagged `true`): the flag covers the 1948 original. Widely sold later editions were revised after his death and are still in copyright. The same applies to the seed's How to Win Friends and Influence People, which stays `false` for now.
- **Living authors:** `authorDeathYear` is `null` for authors I believe are alive (for example সেলিনা হোসেন, মুহম্মদ জাফর ইকবাল, Yuval Noah Harari, James Clear). My information runs to mid-2026.
- **Publication years:** where I wasn't sure of the first edition's year, `publishYear` is `null` (for example শ্রীকান্ত, আরণ্যক, বিষাদ-সিন্ধু, পদ্মরাগ, সোনালী কাবিন).

## 4. Translations

For books first written in another language, the flag covers the original
work only. A Bangla translation has its own copyright, held by the
translator. Before uploading a translated PDF, check that translation's
copyright and record why it is free to share in the file's "ভিত্তি"
(rightsBasis) field.
