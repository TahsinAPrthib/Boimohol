import { z } from "zod";
import { bnYear } from "@/lib/bangla";
import { canBePublicDomain, publicDomainCutoffYear } from "@/lib/public-domain";
import { rightsBasisSchema } from "@/lib/rights";
import { parseSourceUrl, SOURCE_KINDS } from "@/lib/book-sources";

// Validation for a book, shared by the admin form and the JSON import. The
// public-domain rule is part of the schema, so neither path can skip it.

const thisYear = () => new Date().getUTCFullYear();

// Empty input means "not known"; anything else must be a whole year.
const year = (label: string, min: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : typeof v === "string" ? Number(v.trim()) : v),
    z
      .number({ invalid_type_error: `${label} একটি সংখ্যা হতে হবে।` })
      .int(`${label} একটি পূর্ণ সংখ্যা হতে হবে।`)
      .min(min, `${label} সঠিক নয়।`)
      .max(thisYear(), `${label} ভবিষ্যতের হতে পারে না।`)
      .nullable()
  );

const optionalText = (max: number, message: string) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v ?? null),
    z.string().trim().max(max, message).nullable()
  );

const base = z.object({
  title: z
    .string({ required_error: "বইয়ের নাম আবশ্যক।", invalid_type_error: "বইয়ের নাম লেখা হিসেবে দিন।" })
    .trim()
    .min(1, "বইয়ের নাম (ইংরেজি বা প্রতিবর্ণীকৃত) আবশ্যক।")
    .max(200, "বইয়ের নামটি অনেক বড়।"),
  titleBangla: optionalText(200, "বাংলা নামটি অনেক বড়।"),
  author: z
    .string({ required_error: "লেখকের নাম আবশ্যক।", invalid_type_error: "লেখকের নাম লেখা হিসেবে দিন।" })
    .trim()
    .min(1, "লেখকের নাম আবশ্যক।")
    .max(120, "লেখকের নামটি অনেক বড়।"),
  description: z
    .string({ required_error: "বিবরণ আবশ্যক।", invalid_type_error: "বিবরণ লেখা হিসেবে দিন।" })
    .trim()
    .min(1, "বিবরণ আবশ্যক।")
    .max(2000, "বিবরণ অনেক বড় হয়ে গেছে।"),
  language: z
    .string({ required_error: "ভাষা আবশ্যক।" })
    .trim()
    .regex(/^[a-z]{2,3}$/, "ভাষার কোড দুই বা তিন অক্ষরের হতে হবে, যেমন bn বা en।"),
  publishYear: year("প্রকাশের বছর", 1),
  // Negative = BCE, for ancient authors.
  authorDeathYear: year("লেখকের মৃত্যুর বছর", -3000),
});

export function publicDomainRuleMessage(authorDeathYear: number | null): string {
  const cutoff = bnYear(publicDomainCutoffYear());
  const why =
    authorDeathYear === null
      ? "লেখকের মৃত্যুর বছর দেওয়া নেই"
      : `লেখক মারা গেছেন ${bnYear(authorDeathYear)} সালে`;
  return `পাবলিক ডোমেইন হিসেবে চিহ্নিত করা যাবে না: ${why}। এখন কেবল ${cutoff} বা তার আগে মারা যাওয়া লেখকের বই পাবলিক ডোমেইন।`;
}

function publicDomainRule(data: { isPublicDomain: boolean; authorDeathYear: number | null }, ctx: z.RefinementCtx) {
  if (data.isPublicDomain && !canBePublicDomain(data.authorDeathYear)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["isPublicDomain"], message: publicDomainRuleMessage(data.authorDeathYear) });
  }
}

// From the admin form (FormData strings; a checkbox is "on" or absent).
export const bookFormSchema = base
  .extend({
    categoryId: z.string({ required_error: "বিভাগ বেছে নিন।" }).trim().min(1, "বিভাগ বেছে নিন।"),
    isPublicDomain: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
  })
  .superRefine(publicDomainRule);

// A free copy hosted elsewhere, in an import row: the link must be on one of
// the trusted sites (src/lib/book-sources.ts); "kind" may be given, but must
// then agree with the link.
const importSourceSchema = z
  .object({
    url: z.string({ required_error: "বাইরের কপির লিংক (url) আবশ্যক।", invalid_type_error: "লিংক লেখা হিসেবে দিন।" }),
    rightsBasis: rightsBasisSchema,
    kind: z.enum(SOURCE_KINDS as [string, ...string[]]).optional(),
  })
  .strict("বাইরের কপিতে অজানা ঘর আছে; বানান দেখুন।");

function sourcesRule(data: { isPublicDomain: boolean; sources?: { url: string; kind?: string }[] }, ctx: z.RefinementCtx) {
  if (!data.sources?.length) return;
  if (!data.isPublicDomain) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sources"], message: "বাইরের বিনামূল্যের কপি শুধু পাবলিক ডোমেইনের বইয়ে যোগ করা যায়।" });
  }
  const seen = new Set<string>();
  data.sources.forEach((s, i) => {
    const parsed = parseSourceUrl(s.url);
    if (!parsed.ok) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sources", i, "url"], message: parsed.message });
      return;
    }
    if (s.kind && s.kind !== parsed.kind) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sources", i, "kind"], message: `লিংকটি ${parsed.kind}-এর, কিন্তু kind দেওয়া আছে ${s.kind}।` });
    }
    if (seen.has(parsed.url)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sources", i, "url"], message: "একই লিংক দুবার দেওয়া হয়েছে।" });
    seen.add(parsed.url);
  });
}

// One row of an import file. Stricter than the form: unknown fields are an
// error (a misspelt "authorDeathYear" must not silently become null) and the
// flag must be a real true/false.
export const bookImportRowSchema = base
  .extend({
    category: z.string({ required_error: "বিভাগ (category) আবশ্যক।" }).trim().min(1, "বিভাগ (category) আবশ্যক।"),
    isPublicDomain: z.boolean({
      required_error: "isPublicDomain আবশ্যক।",
      invalid_type_error: "isPublicDomain শুধু true বা false হতে পারে।",
    }),
    language: base.shape.language.default("bn"),
    sources: z.array(importSourceSchema).max(10, "একটি বইয়ে সর্বোচ্চ ১০টি বাইরের কপি দেওয়া যায়।").optional(),
  })
  .strict("অজানা ঘর আছে; বানান দেখুন।")
  .superRefine(publicDomainRule)
  .superRefine(sourcesRule);

export type BookFormInput = z.infer<typeof bookFormSchema>;
export type BookImportRow = z.infer<typeof bookImportRowSchema>;

export type BookFieldErrors = Partial<
  Record<"title" | "titleBangla" | "author" | "categoryId" | "description" | "language" | "publishYear" | "authorDeathYear" | "isPublicDomain", string>
>;

export function fieldErrorsOf(error: z.ZodError): BookFieldErrors {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out as BookFieldErrors;
}
