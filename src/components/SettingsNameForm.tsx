"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateDisplayName, type AccountResult } from "@/actions/account";
import FormMessage from "@/components/FormMessage";

export default function SettingsNameForm({ currentName }: { currentName: string }) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [result, setResult] = useState<AccountResult | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent) {
    event.preventDefault();
    setResult(null);
    startTransition(async () => {
      const response = await updateDisplayName(name);
      // Inside a fresh transition, so the old name doesn't flash back while
      // the page refreshes.
      startTransition(() => {
        setResult(response);
        if (response.success) router.refresh();
      });
    });
  }

  const unchanged = name.trim() === currentName;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <div>
        <label htmlFor="settings-name" className="field-label">
          প্রদর্শিত নাম
        </label>
        <input
          id="settings-name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={result?.field === "name" || undefined}
          aria-describedby="settings-name-help"
          className="field-input"
        />
        <p id="settings-name-help" className="mt-1 font-body text-xs text-ink/50">
          বইয়ের পাতায় আপনার পর্যালোচনার সাথে এই নাম দেখা যায়।
        </p>
      </div>
      <FormMessage result={result} />
      <div>
        <button type="submit" disabled={pending || unchanged} className="btn-primary disabled:opacity-60">
          {pending ? "সংরক্ষণ হচ্ছে..." : "নাম সংরক্ষণ করুন"}
        </button>
      </div>
    </form>
  );
}
