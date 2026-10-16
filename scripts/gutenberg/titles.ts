// Bangla titles for Gutenberg books (decided 2026-10-16). A book shows a
// Bangla title only when it has a genuine, well-established Bangla one: a
// translated title (যুদ্ধ ও শান্তি) or the work's own name in Bangla
// (কথাসরিৎসাগর). Every other Bangla Wikipedia title -- a transliteration of
// the English (প্রাইড অ্যান্ড প্রেজুডিস) or a name written in Bangla
// (হ্যামলেট) -- is kept as a hidden search alias instead, so a search in
// Bangla script still finds the book. Checked by hand against the list of
// Bangla Wikipedia titles; keyed by ebook id.
export const GENUINE_BANGLA_TITLES = new Set<number>([
  2600, // War and Peace: যুদ্ধ ও শান্তি
  2554, // Crime and Punishment: অপরাধ ও শাস্তি
  2166, // King Solomon's Mines: সলোমনের গুপ্তধন
  3289, // The Valley of Fear: আতঙ্কের উপত্যকা
  61, // The Communist Manifesto: কমিউনিস্ট ইস্তেহার
  7142, // History of the Peloponnesian War: পেলোপনেশীয় যুদ্ধের ইতিহাস
  6762, // Aristotle, Politics: রাজনীতি
  17306, // The Condition of the Working Class in England: ইংল্যান্ডে শ্রমিক শ্রেণির অবস্থা
  40588, // Kathasaritsagara: কথাসরিৎসাগর (its own Sanskrit name)
  44608, // Baburnama: বাবরনামা (its own name)
]);
