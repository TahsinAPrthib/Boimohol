"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { registerUser, type RegisterState } from "@/actions/auth";

const initialState: RegisterState = { success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
      {pending ? "তৈরি হচ্ছে..." : "সাইন আপ"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerUser, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      const timeout = setTimeout(() => router.push("/login"), 1200);
      return () => clearTimeout(timeout);
    }
  }, [state.success, router]);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="mb-1 font-display text-3xl text-ink">নতুন অ্যাকাউন্ট</h1>
      <p className="mb-6 font-body text-sm text-ink/60">
        বই মহলে যোগ দিন — পড়ুন, পর্যালোচনা লিখুন, নিজের বইতাক সাজান।
      </p>

      {state.success ? (
        <div className="rounded-book border-2 border-sage bg-sage/10 px-4 py-3 font-body text-sage">
          {state.message} লগইন পাতায় নিয়ে যাওয়া হচ্ছে...
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          {state.message && !state.success && (
            <div className="rounded-book border-2 border-oxblood bg-oxblood/10 px-4 py-3 font-body text-sm text-oxblood">
              {state.message}
            </div>
          )}

          <div>
            <label htmlFor="name" className="field-label">
              নাম
            </label>
            <input id="name" name="name" type="text" className="field-input" placeholder="আপনার নাম" />
            {state.fieldErrors?.name && <p className="field-error">{state.fieldErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="username" className="field-label">
              ইউজারনেম
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="field-input"
              placeholder="যেমন: rahim_reads"
            />
            {state.fieldErrors?.username && <p className="field-error">{state.fieldErrors.username}</p>}
          </div>

          <div>
            <label htmlFor="email" className="field-label">
              ইমেইল
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="field-input"
              placeholder="you@example.com"
            />
            {state.fieldErrors?.email && <p className="field-error">{state.fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="field-label">
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="field-input"
              placeholder="কমপক্ষে ৬ অক্ষর"
            />
            {state.fieldErrors?.password && <p className="field-error">{state.fieldErrors.password}</p>}
          </div>

          <SubmitButton />
        </form>
      )}

      <p className="mt-6 text-center font-body text-sm text-ink/60">
        আগে থেকেই অ্যাকাউন্ট আছে?{" "}
        <Link href="/login" className="font-semibold text-cloth hover:underline">
          লগইন করুন
        </Link>
      </p>
    </div>
  );
}
