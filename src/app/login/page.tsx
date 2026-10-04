"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { safeCallbackUrl, withCallbackUrl } from "@/lib/safe-redirect";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl = safeCallbackUrl(rawCallback);
  // Carry the destination through the sign-up detour, but forward the
  // sanitised value rather than whatever was in the query string.
  const registerHref = rawCallback ? withCallbackUrl("/register", callbackUrl) : "/register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      // Only CredentialsSignin means the email or password was rejected.
      // Anything else -- most often the database not answering -- is a server
      // problem, and telling the user their password is wrong would be false.
      setError(
        result.error === "CredentialsSignin"
          ? "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।"
          : "সার্ভারে সাময়িক সমস্যা হয়েছে, তাই এখন লগইন করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।"
      );
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="mb-1 font-display text-3xl text-ink">লগইন</h1>
      <p className="mb-6 font-body text-sm text-ink/60">আপনার বইতাকে ফিরে আসুন।</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-book border-2 border-oxblood bg-oxblood/10 px-4 py-3 font-body text-sm text-oxblood">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="field-label">
            ইমেইল
          </label>
          <input
            id="email"
            type="email"
            required
            className="field-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="field-label">
            পাসওয়ার্ড
          </label>
          <input
            id="password"
            type="password"
            required
            className="field-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="আপনার পাসওয়ার্ড"
          />
        </div>

        <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
          {pending ? "লগইন হচ্ছে..." : "লগইন"}
        </button>
      </form>

      <p className="mt-6 text-center font-body text-sm text-ink/60">
        অ্যাকাউন্ট নেই?{" "}
        <Link href={registerHref} className="font-semibold text-cloth hover:underline">
          সাইন আপ করুন
        </Link>
      </p>

      {/* Development only. The demo account is never created in production
          (see prisma/seed.ts), and a published password on a live site is an
          open door if it were ever recreated. NODE_ENV is inlined at build
          time, so this branch -- and the password string -- is removed from
          the production bundle entirely, not just hidden. */}
      {process.env.NODE_ENV !== "production" && (
        <p className="mt-4 rounded-book border-2 border-dashed border-ink/15 px-4 py-3 text-center font-body text-xs text-ink/50">
          ডেমো লগইন: demo@boimohol.test / demo1234
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    // useSearchParams needs a Suspense boundary for this page to prerender.
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
          <h1 className="mb-1 font-display text-3xl text-ink">লগইন</h1>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
