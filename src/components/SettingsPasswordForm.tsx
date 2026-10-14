"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { changePassword, type AccountResult } from "@/actions/account";
import FormMessage from "@/components/FormMessage";

// hasPassword false: an account created through Google, setting its first
// password -- there is no current one to ask for.
export default function SettingsPasswordForm({ email, hasPassword }: { email: string; hasPassword: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [result, setResult] = useState<AccountResult | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent) {
    event.preventDefault();
    setResult(null);
    startTransition(async () => {
      const response = await changePassword(current, next, confirm);
      if (!response.success) {
        setResult(response);
        return;
      }
      // The change signs out every session issued before it, this one
      // included, so sign straight back in with the new password.
      const signedIn = await signIn("credentials", { email, password: next, redirect: false });
      startTransition(() => {
        setCurrent("");
        setNext("");
        setConfirm("");
        setResult(
          signedIn?.error
            ? { success: false, message: "পাসওয়ার্ড বদলানো হয়েছে, কিন্তু আবার লগইন করা যায়নি। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।" }
            : response
        );
        router.refresh();
      });
    });
  }

  const field = (id: "current" | "next" | "confirm") => ({
    "aria-invalid": result?.field === id || undefined,
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      {/* Lets a password manager tell which account the new password is for. */}
      <input type="email" name="email" autoComplete="username" value={email} readOnly hidden />
      {hasPassword && (
        <div>
          <label htmlFor="settings-current" className="field-label">
            বর্তমান পাসওয়ার্ড
          </label>
          <input
            id="settings-current"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="field-input"
            {...field("current")}
          />
        </div>
      )}
      <div>
        <label htmlFor="settings-new" className="field-label">
          নতুন পাসওয়ার্ড
        </label>
        <input
          id="settings-new"
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          aria-describedby="settings-new-help"
          className="field-input"
          {...field("next")}
        />
        <p id="settings-new-help" className="mt-1 font-body text-xs text-ink/50">
          কমপক্ষে ৬ অক্ষর।
        </p>
      </div>
      <div>
        <label htmlFor="settings-confirm" className="field-label">
          নতুন পাসওয়ার্ড আবার লিখুন
        </label>
        <input
          id="settings-confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="field-input"
          {...field("confirm")}
        />
      </div>
      <FormMessage result={result} />
      <div>
        <button
          type="submit"
          disabled={pending || (hasPassword && !current) || !next || !confirm}
          className="btn-primary disabled:opacity-60"
        >
          {pending ? "সংরক্ষণ হচ্ছে..." : hasPassword ? "পাসওয়ার্ড বদলান" : "পাসওয়ার্ড ঠিক করুন"}
        </button>
      </div>
    </form>
  );
}
