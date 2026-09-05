"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import type { ListingFormState } from "@/actions/listings";

const CONDITIONS = [
  { value: "NEW", label: "নতুন" },
  { value: "LIKE_NEW", label: "প্রায় নতুন" },
  { value: "GOOD", label: "ভালো" },
  { value: "FAIR", label: "মোটামুটি" },
  { value: "WORN", label: "পুরনো/জীর্ণ" },
];

const LISTING_TYPES = [
  { value: "SELL", label: "বিক্রি" },
  { value: "EXCHANGE", label: "বিনিময়" },
  { value: "DONATE", label: "দান" },
];

type Category = { id: string; nameBangla: string };

type InitialValues = {
  title?: string;
  author?: string;
  categoryId?: string | null;
  description?: string | null;
  condition?: string;
  listingType?: string;
  price?: number | null;
  location?: string;
};

const initialState: ListingFormState = { success: false };

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
      {pending ? pendingLabel : label}
    </button>
  );
}

export default function ListingForm({
  action,
  categories,
  initialValues,
  submitLabel = "প্রকাশ করুন",
  pendingLabel = "প্রকাশ হচ্ছে...",
  redirectTo,
}: {
  action: (prevState: ListingFormState, formData: FormData) => Promise<ListingFormState>;
  categories: Category[];
  initialValues?: InitialValues;
  submitLabel?: string;
  pendingLabel?: string;
  // Where to navigate after a successful submit — kept as a plain string
  // mode (not a callback) since a Server Component parent can't hand this
  // Client Component an arbitrary closure across the boundary.
  redirectTo?: "listing" | "mine";
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(action, initialState);
  const [listingType, setListingType] = useState(initialValues?.listingType ?? "SELL");

  useEffect(() => {
    if (!state.success || !redirectTo) return;
    if (redirectTo === "listing" && state.listingId) {
      router.push(`/marketplace/${state.listingId}`);
    } else if (redirectTo === "mine") {
      router.push("/marketplace/mine");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
        <input
          id="title"
          name="title"
          type="text"
          className="field-input"
          defaultValue={initialValues?.title ?? ""}
        />
        {state.fieldErrors?.title && <p className="field-error">{state.fieldErrors.title}</p>}
      </div>

      <div>
        <label htmlFor="author" className="field-label">
          লেখক
        </label>
        <input
          id="author"
          name="author"
          type="text"
          className="field-input"
          defaultValue={initialValues?.author ?? ""}
        />
        {state.fieldErrors?.author && <p className="field-error">{state.fieldErrors.author}</p>}
      </div>

      <div>
        <label htmlFor="categoryId" className="field-label">
          বিভাগ (ঐচ্ছিক)
        </label>
        <select
          id="categoryId"
          name="categoryId"
          className="field-input"
          defaultValue={initialValues?.categoryId ?? ""}
        >
          <option value="">নির্দিষ্ট নয়</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nameBangla}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="condition" className="field-label">
          বইয়ের অবস্থা
        </label>
        <select
          id="condition"
          name="condition"
          className="field-input"
          defaultValue={initialValues?.condition ?? "GOOD"}
        >
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.condition && <p className="field-error">{state.fieldErrors.condition}</p>}
      </div>

      <div>
        <label htmlFor="listingType" className="field-label">
          ধরন
        </label>
        <select
          id="listingType"
          name="listingType"
          className="field-input"
          defaultValue={initialValues?.listingType ?? "SELL"}
          onChange={(e) => setListingType(e.target.value)}
        >
          {LISTING_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.listingType && (
          <p className="field-error">{state.fieldErrors.listingType}</p>
        )}
      </div>

      {listingType === "SELL" && (
        <div>
          <label htmlFor="price" className="field-label">
            মূল্য (টাকা)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={1}
            step="1"
            className="field-input"
            defaultValue={initialValues?.price ?? ""}
          />
          {state.fieldErrors?.price && <p className="field-error">{state.fieldErrors.price}</p>}
        </div>
      )}

      <div>
        <label htmlFor="location" className="field-label">
          লোকেশন
        </label>
        <input
          id="location"
          name="location"
          type="text"
          className="field-input"
          placeholder="যেমন: ধানমন্ডি, ঢাকা"
          defaultValue={initialValues?.location ?? ""}
        />
        {state.fieldErrors?.location && <p className="field-error">{state.fieldErrors.location}</p>}
      </div>

      <div>
        <label htmlFor="description" className="field-label">
          বিবরণ (ঐচ্ছিক)
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="field-input"
          defaultValue={initialValues?.description ?? ""}
          placeholder="বইয়ের অবস্থা, সংস্করণ বা অন্য কোনো তথ্য লিখুন..."
        />
        {state.fieldErrors?.description && (
          <p className="field-error">{state.fieldErrors.description}</p>
        )}
      </div>

      <div>
        <SubmitButton label={submitLabel} pendingLabel={pendingLabel} />
      </div>
    </form>
  );
}
