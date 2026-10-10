"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { BookFormState } from "@/actions/admin-books";
import { bnYear } from "@/lib/bangla";
import { submitKeepingValues } from "@/lib/form-submit";

type Category = { id: string; nameBangla: string };

export type BookFormValues = {
  title: string;
  titleBangla: string | null;
  author: string;
  categoryId: string;
  description: string;
  language: string;
  publishYear: number | null;
  authorDeathYear: number | null;
  isPublicDomain: boolean;
};

// Original language of the work (ISO 639-1). Only used for records today.
const LANGUAGES: [string, string][] = [
  ["bn", "বাংলা"], ["en", "ইংরেজি"], ["fr", "ফরাসি"], ["de", "জার্মান"], ["ru", "রুশ"], ["es", "স্প্যানিশ"],
  ["it", "ইতালীয়"], ["pt", "পর্তুগিজ"], ["pl", "পোলিশ"], ["el", "গ্রিক"], ["la", "লাতিন"], ["ar", "আরবি"],
  ["fa", "ফারসি"], ["ur", "উর্দু"], ["hi", "হিন্দি"], ["gu", "গুজরাটি"], ["he", "হিব্রু"], ["ja", "জাপানি"],
  ["zh", "চীনা"], ["sv", "সুইডিশ"], ["nl", "ডাচ"],
];

const initialState: BookFormState = { success: false };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
      {pending ? "সংরক্ষণ হচ্ছে..." : label}
    </button>
  );
}

export default function AdminBookForm({
  action,
  categories,
  initial,
  mode,
  cutoffYear,
  hasPdf = false,
}: {
  action: (prev: BookFormState, formData: FormData) => Promise<BookFormState>;
  categories: Category[];
  initial?: BookFormValues;
  mode: "create" | "edit";
  cutoffYear: number;
  hasPdf?: boolean;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const errors = state.fieldErrors ?? {};
  const languages = initial && !LANGUAGES.some(([code]) => code === initial.language)
    ? [...LANGUAGES, [initial.language, initial.language] as [string, string]]
    : LANGUAGES;
  // After a successful add the form is remounted empty for the next book;
  // after an error it keeps what was typed.
  const formKey = mode === "create" && state.success ? state.bookId : "book-form";

  return (
    <div className="flex flex-col gap-4">
      {state.message && (
        <div
          className={`rounded-book border-2 px-3 py-2 font-body text-sm ${
            state.success ? "border-sage bg-sage/10 text-sage" : "border-oxblood bg-oxblood/10 text-oxblood"
          }`}
        >
          {state.message}
          {state.success && state.bookId && (
            <>
              {" "}
              <Link href={`/books/${state.bookId}`} className="font-semibold underline">
                বইটি দেখুন
              </Link>
            </>
          )}
        </div>
      )}

      <form key={formKey} action={formAction} onSubmit={submitKeepingValues(formAction)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="title" label="বইয়ের নাম (ইংরেজি বা প্রতিবর্ণীকৃত) *" error={errors.title}>
          <input id="title" name="title" type="text" className="field-input" defaultValue={initial?.title ?? ""} placeholder="যেমন: Kopalkundala" />
        </Field>
        <Field id="titleBangla" label="বাংলা নাম" error={errors.titleBangla}>
          <input id="titleBangla" name="titleBangla" type="text" className="field-input" defaultValue={initial?.titleBangla ?? ""} placeholder="যেমন: কপালকুণ্ডলা" />
        </Field>
        <Field id="author" label="লেখক *" error={errors.author}>
          <input id="author" name="author" type="text" className="field-input" defaultValue={initial?.author ?? ""} />
        </Field>
        <Field id="categoryId" label="বিভাগ *" error={errors.categoryId}>
          <select id="categoryId" name="categoryId" className="field-input" defaultValue={initial?.categoryId ?? ""}>
            <option value="">বেছে নিন</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameBangla}
              </option>
            ))}
          </select>
        </Field>
        <Field id="language" label="মূল ভাষা" error={errors.language}>
          <select id="language" name="language" className="field-input" defaultValue={initial?.language ?? "bn"}>
            {languages.map(([code, name]) => (
              <option key={code} value={code}>
                {name} ({code})
              </option>
            ))}
          </select>
        </Field>
        <Field id="publishYear" label="প্রথম প্রকাশের বছর" error={errors.publishYear} hint="নিশ্চিত না হলে খালি রাখুন।">
          <input id="publishYear" name="publishYear" type="number" step="1" className="field-input" defaultValue={initial?.publishYear ?? ""} />
        </Field>
        <Field
          id="authorDeathYear"
          label="লেখকের মৃত্যুর বছর"
          error={errors.authorDeathYear}
          hint="লেখক জীবিত থাকলে বা বছর জানা না থাকলে খালি রাখুন। খ্রিস্টপূর্ব বছর ঋণাত্মক সংখ্যায় লিখুন।"
        >
          <input id="authorDeathYear" name="authorDeathYear" type="number" step="1" className="field-input" defaultValue={initial?.authorDeathYear ?? ""} />
        </Field>
        <div className="sm:col-span-2">
          <Field id="description" label="এক বাক্যের বিবরণ *" error={errors.description}>
            <textarea id="description" name="description" rows={3} className="field-input" defaultValue={initial?.description ?? ""} />
          </Field>
        </div>

        <div className="rounded-book border-2 border-ink/10 bg-paper p-4 sm:col-span-2">
          <label className="flex items-start gap-3 font-body text-sm font-semibold text-ink">
            <input
              type="checkbox"
              name="isPublicDomain"
              defaultChecked={initial?.isPublicDomain ?? false}
              className="mt-1 h-4 w-4 accent-[#5F7355]"
            />
            পাবলিক ডোমেইন (বিনামূল্যে পিডিএফ দেওয়া যাবে)
          </label>
          <p className="mt-2 max-w-prose font-body text-xs leading-relaxed text-ink/70">
            বাংলাদেশের কপিরাইট আইনে লেখকের মৃত্যুর বছর শেষ হওয়ার পর ৬০ বছর পর্যন্ত বই সুরক্ষিত থাকে। তাই এখন কেবল{" "}
            {bnYear(cutoffYear)} বা তার আগে মারা যাওয়া লেখকের বই পাবলিক ডোমেইন হিসেবে চিহ্নিত করা যায়, আর সেজন্য
            মৃত্যুর বছর দেওয়া বাধ্যতামূলক। অনুবাদের ক্ষেত্রে এই চিহ্ন শুধু মূল বইয়ের জন্য; অনুবাদের নিজস্ব কপিরাইট পিডিএফ
            যোগ করার সময় আলাদাভাবে যাচাই করতে হবে।
          </p>
          {hasPdf && (
            <p className="mt-2 font-body text-xs font-semibold text-oxblood">
              এই বইয়ের পিডিএফ লাইব্রেরিতে আছে। চিহ্ন তুলে দিতে চাইলে আগে পিডিএফটি মুছে ফেলুন।
            </p>
          )}
          {errors.isPublicDomain && <p className="field-error">{errors.isPublicDomain}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <SubmitButton label={mode === "create" ? "বইটি যোগ করুন" : "পরিবর্তন সংরক্ষণ করুন"} />
          {mode === "edit" && (
            <Link href="/admin/books" className="font-body text-sm font-semibold text-cloth hover:underline">
              বইয়ের তালিকায় ফিরে যান
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 font-body text-xs text-ink/50">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
