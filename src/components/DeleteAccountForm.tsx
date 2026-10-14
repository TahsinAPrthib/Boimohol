"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { deleteOwnAccount, type AccountResult } from "@/actions/account";
import FormMessage from "@/components/FormMessage";

// Two things stand in for a confirmation dialog: the current password, and
// typing the username. The server checks both again. An account created
// through Google with no password confirms with the username alone.
export default function DeleteAccountForm({
  username,
  email,
  hasPassword,
}: {
  username: string;
  email: string;
  hasPassword: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [result, setResult] = useState<AccountResult | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent) {
    event.preventDefault();
    setResult(null);
    startTransition(async () => {
      const response = await deleteOwnAccount(password, confirmation);
      setResult(response);
      if (!response.success) return;
      // The account is already gone, so the login no longer counts anywhere;
      // this clears the cookie and the navbar too, then leaves for the home
      // page (replace: going back would only land on the login page).
      await signOut({ redirect: false });
      router.replace("/");
      router.refresh();
    });
  }

  const ready = confirmation.trim() === username && (!hasPassword || password.length > 0);

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <input type="email" name="email" autoComplete="username" value={email} readOnly hidden />
      {hasPassword && (
        <div>
          <label htmlFor="delete-password" className="field-label">
            বর্তমান পাসওয়ার্ড
          </label>
          <input
            id="delete-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={result?.field === "current" || undefined}
            className="field-input"
          />
        </div>
      )}
      <div>
        <label htmlFor="delete-confirmation" className="field-label">
          নিশ্চিত করতে আপনার ইউজারনেম লিখুন: <span className="font-semibold text-ink">{username}</span>
        </label>
        <input
          id="delete-confirmation"
          type="text"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          aria-invalid={result?.field === "confirmation" || undefined}
          className="field-input"
        />
      </div>
      <FormMessage result={result} />
      <div>
        <button
          type="submit"
          disabled={pending || !ready || result?.success}
          className="rounded-book bg-oxblood px-4 py-2 font-body text-sm font-semibold text-paper disabled:opacity-50"
        >
          {pending ? "মুছে ফেলা হচ্ছে..." : "অ্যাকাউন্ট চিরতরে মুছে ফেলুন"}
        </button>
      </div>
    </form>
  );
}
