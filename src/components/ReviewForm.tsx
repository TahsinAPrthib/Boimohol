"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { submitReview, type ReviewState } from "@/actions/reviews";
import StarRating from "@/components/StarRating";

const initialState: ReviewState = { success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
      {pending ? "সংরক্ষণ হচ্ছে..." : "পর্যালোচনা জমা দিন"}
    </button>
  );
}

type ExistingReview = {
  rating: number;
  text: string | null;
  plotRating?: number | null;
  writingRating?: number | null;
  pacingRating?: number | null;
};

export default function ReviewForm({
  bookId,
  existingReview,
}: {
  bookId: string;
  existingReview?: ExistingReview | null;
}) {
  const [state, formAction] = useFormState(submitReview, initialState);
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [plotRating, setPlotRating] = useState(existingReview?.plotRating ?? 0);
  const [writingRating, setWritingRating] = useState(existingReview?.writingRating ?? 0);
  const [pacingRating, setPacingRating] = useState(existingReview?.pacingRating ?? 0);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-book border-2 border-ink/10 bg-paper-dark p-5"
    >
      <h3 className="font-display text-lg text-ink">
        {existingReview ? "আপনার পর্যালোচনা সম্পাদনা করুন" : "একটি পর্যালোচনা লিখুন"}
      </h3>

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

      <input type="hidden" name="bookId" value={bookId} />
      <input type="hidden" name="rating" value={rating} />
      <input type="hidden" name="plotRating" value={plotRating} />
      <input type="hidden" name="writingRating" value={writingRating} />
      <input type="hidden" name="pacingRating" value={pacingRating} />

      <div>
        <label className="field-label">রেটিং</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {state.fieldErrors?.rating && <p className="field-error">{state.fieldErrors.rating}</p>}
      </div>

      <div>
        <p className="field-label">আরও কিছু (ঐচ্ছিক)</p>
        <div className="flex flex-col gap-2 rounded-book border border-ink/10 bg-paper p-3 sm:flex-row sm:gap-6">
          <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start">
            <span className="font-body text-sm text-ink/70">কাহিনি</span>
            <StarRating value={plotRating} onChange={setPlotRating} size="sm" />
          </div>
          <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start">
            <span className="font-body text-sm text-ink/70">লেখনশৈলী</span>
            <StarRating value={writingRating} onChange={setWritingRating} size="sm" />
          </div>
          <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start">
            <span className="font-body text-sm text-ink/70">গতি</span>
            <StarRating value={pacingRating} onChange={setPacingRating} size="sm" />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="text" className="field-label">
          মন্তব্য (ঐচ্ছিক)
        </label>
        <textarea
          id="text"
          name="text"
          rows={4}
          className="field-input"
          defaultValue={existingReview?.text ?? ""}
          placeholder="বইটি সম্পর্কে আপনার অভিজ্ঞতা লিখুন..."
        />
        {state.fieldErrors?.text && <p className="field-error">{state.fieldErrors.text}</p>}
      </div>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
