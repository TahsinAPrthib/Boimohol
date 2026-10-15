import { z } from "zod";

// Why a free copy is legally free to read -- required for every uploaded PDF
// and every external source, shown to readers next to it. One rule, shared by
// upload, the later edit, external sources and the JSON import, so no path
// can save a note another would refuse.
export const rightsBasisSchema = z
  .string({ required_error: "কোন ভিত্তিতে ফাইলটি বিনামূল্যে দেওয়া যাচ্ছে তা লিখতে হবে।" })
  .trim()
  .min(1, "কোন ভিত্তিতে ফাইলটি বিনামূল্যে দেওয়া যাচ্ছে তা লিখতে হবে।")
  .max(1000, "ব্যাখ্যাটি অনেক বড় হয়ে গেছে।");
