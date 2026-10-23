import { z } from "zod";
import { bnYear } from "@/lib/bangla";
import { canBePublicDomain, publicDomainCutoffYear } from "@/lib/public-domain";
import { rightsBasisSchema } from "@/lib/rights";
import { parseSourceUrl, SOURCE_KINDS } from "@/lib/book-sources";
import { parseCoverUrl } from "@/lib/covers";

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

const searchAliasesSchema = z.preprocess(
  (v) => (typeof v === "string" ? v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean) : v ?? []),
  z
    .array(z.string().trim().min(1).max(200, "বিকল্প নামটি অনেক বড়।"), { invalid_type_error: "বিকল্প নাম একটি তালিকা হিসেবে দিন।" })
    .max(10, "সর্বোচ্চ ১০টি বিকল্প নাম দেওয়া যায়।")
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
  // Who wrote the text in this language, for a translation or retelling.
  translator: optionalText(200, "অনুবাদকের নামটি অনেক বড়।"),
  // Hidden names the book is also found by in search. In the form, one per
  // line (a title can contain a comma).
  searchAliases: searchAliasesSchema,
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

// A real cover for an import row: an image on an allowed source
// (src/lib/covers.ts) and why it is free. Only a public-domain book may have
// one; the server fetches it into Cloudinary after the rows are saved.
const importCoverSchema = z
  .object({
    url: z
      .string({ required_error: "প্রচ্ছদের ঠিকানা (url) আবশ্যক।" })
      .trim()
      .max(2000, "প্রচ্ছদের ঠিকানাটি অনেক বড়।")
      .superRefine((url, ctx) => {
        const parsed = parseCoverUrl(url);
        if (!parsed.ok) ctx.addIssue({ code: z.ZodIssueCode.custom, message: parsed.error });
      }),
    rightsBasis: rightsBasisSchema,
  })
  .strict("প্রচ্ছদে অজানা ঘর আছে; শুধু url ও rightsBasis দেওয়া যায়।");

function coverRule(data: { isPublicDomain: boolean; authorDeathYear?: number | null; cover?: unknown }, ctx: z.RefinementCtx) {
  if (data.cover && !(data.isPublicDomain && canBePublicDomain(data.authorDeathYear))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cover"], message: "পাবলিক ডোমেইনের বই ছাড়া অন্য বইয়ে প্রচ্ছদের ছবি দেওয়া যায় না।" });
  }
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
    cover: importCoverSchema.optional(),
  })
  .strict("অজানা ঘর আছে; বানান দেখুন।")
  .superRefine(publicDomainRule)
  .superRefine(sourcesRule)
  .superRefine(coverRule);

// A correction to a book already in the catalog, in an import file: "match"
// names the book (as duplicate detection does: author plus either title),
// "set" changes the fields it lists -- a key left out stays as it is, null
// clears it -- and "sources" adds links or rewrites the rights note of links
// the book already has, and "cover" gives it a real cover (the server checks
// the book is public domain). Nothing else about the book changes.
export const bookUpdateRowSchema = z
  .object({
    match: z
      .object({
        title: base.shape.title,
        titleBangla: base.shape.titleBangla,
        author: base.shape.author,
      })
      .strict("match-এ অজানা ঘর আছে; বানান দেখুন।"),
    set: z
      .object({
        translator: base.shape.translator.optional(),
        titleBangla: base.shape.titleBangla.optional(),
        searchAliases: searchAliasesSchema.optional(),
      })
      .strict("set-এ অজানা ঘর আছে; শুধু translator, titleBangla ও searchAliases বদলানো যায়।")
      .optional(),
    sources: z.array(importSourceSchema).max(10, "একটি বইয়ে সর্বোচ্চ ১০টি বাইরের কপি দেওয়া যায়।").optional(),
    cover: importCoverSchema.optional(),
  })
  .strict("অজানা ঘর আছে; বানান দেখুন।")
  .superRefine((data, ctx) => {
    if (!data.set && !data.sources?.length && !data.cover)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "হালনাগাদের সারিতে set, sources বা cover থাকতে হবে।" });
    sourcesRule({ isPublicDomain: true, sources: data.sources }, ctx);
  });

export type BookUpdateRow = z.infer<typeof bookUpdateRowSchema>;
export type BookFormInput = z.infer<typeof bookFormSchema>;
export type BookImportRow = z.infer<typeof bookImportRowSchema>;

export type BookFieldErrors = Partial<
  Record<
    | "title"
    | "titleBangla"
    | "author"
    | "translator"
    | "searchAliases"
    | "categoryId"
    | "description"
    | "language"
    | "publishYear"
    | "authorDeathYear"
    | "isPublicDomain",
    string
  >
>;

export function fieldErrorsOf(error: z.ZodError): BookFieldErrors {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out as BookFieldErrors;
}
