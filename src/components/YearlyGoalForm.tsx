"use client";

import { useState, useTransition, type FormEvent } from "react";
import { setYearlyGoal } from "@/actions/profile";

export default function YearlyGoalForm() {
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const goal = Number(value);

    startTransition(async () => {
      const result = await setYearlyGoal(goal);
      if (result.success) {
        setMessage({ type: "success", text: "লক্ষ্য নির্ধারণ করা হয়েছে।" });
      } else {
        setMessage({ type: "error", text: result.message ?? "কিছু একটা সমস্যা হয়েছে।" });
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-book border-2 border-ink/10 bg-paper-dark p-5"
    >
      <h3 className="mb-1 font-display text-lg text-ink">বার্ষিক পড়ার লক্ষ্য</h3>
      <p className="mb-3 font-body text-sm text-ink/60">এই বছর কতগুলো বই পড়তে চান তা ঠিক করুন।</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={500}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="field-input w-24"
          placeholder="যেমন: ১২"
        />
        <button type="submit" disabled={pending || !value} className="btn-primary disabled:opacity-60">
          {pending ? "সংরক্ষণ হচ্ছে..." : "লক্ষ্য সেট করুন"}
        </button>
      </div>
      {message && (
        <p
          className={`mt-2 font-body text-sm ${
            message.type === "success" ? "text-sage" : "text-oxblood"
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
