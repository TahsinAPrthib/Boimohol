"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { createRequest, type RequestFormState } from "@/actions/requests";
import { submitKeepingValues } from "@/lib/form-submit";

type Category = { id: string; nameBangla: string };

const initialState: RequestFormState = { success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
      {pending ? "প্রকাশ হচ্ছে..." : "অনুরোধ প্রকাশ করুন"}
    </button>
  );
}

export default function RequestForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [state, formAction] = useActionState(createRequest, initialState);

  useEffect(() => {
    if (state.success && state.requestId) {
      router.push(`/requests/${state.requestId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} onSubmit={submitKeepingValues(formAction)} className="flex flex-col gap-4">
      {state.message && (
        <div
          className={`rounded-book border-2 px-3 py-2 font-body text-sm ${
            state.success
              ? "border-sage bg-sage/10 text-sage"
              : "border-oxblood bg-oxblood/10 text-oxblood"
          }`}
        >
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="title" className="field-label">
          বইয়ের নাম
        </label>
        <input id="title" name="title" type="text" className="field-input" />
        {state.fieldErrors?.title && <p className="field-error">{state.fieldErrors.title}</p>}
      </div>

      <div>
        <label htmlFor="author" className="field-label">
          লেখক
        </label>
        <input id="author" name="author" type="text" className="field-input" />
        {state.fieldErrors?.author && <p className="field-error">{state.fieldErrors.author}</p>}
      </div>

      <div>
        <label htmlFor="categoryId" className="field-label">
          বিভাগ (ঐচ্ছিক)
        </label>
        <select id="categoryId" name="categoryId" className="field-input" defaultValue="">
          <option value="">নির্দিষ্ট নয়</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nameBangla}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="location" className="field-label">
          কোথা থেকে নিতে পারবেন (ঐচ্ছিক)
        </label>
        <input
          id="location"
          name="location"
          type="text"
          className="field-input"
          placeholder="যেমন: ধানমন্ডি, ঢাকা"
        />
        {state.fieldErrors?.location && <p className="field-error">{state.fieldErrors.location}</p>}
      </div>

      <div>
        <label htmlFor="note" className="field-label">
          আরও কিছু জানাতে চান? (ঐচ্ছিক)
        </label>
        <textarea
          id="note"
          name="note"
          rows={4}
          className="field-input"
          placeholder="যেমন: কোন সংস্করণ চাই, বইয়ের অবস্থা কেমন হলে চলবে।"
        />
        {state.fieldErrors?.note && <p className="field-error">{state.fieldErrors.note}</p>}
      </div>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
