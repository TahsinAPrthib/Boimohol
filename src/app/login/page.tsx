"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { safeCallbackUrl, withCallbackUrl } from "@/lib/safe-redirect";
import {
  ACCOUNT_SUSPENDED,
  GOOGLE_ONLY_ACCOUNT,
  SIGN_IN_SERVER_ERROR,
  loginErrorMessage,
} from "@/lib/account-notices";
import GoogleButton, { OrDivider } from "@/components/GoogleButton";

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
  // A refused or failed Google sign-in comes back through NextAuth as
  // ?error=<code>.
  const [error, setError] = useState<string | null>(() => {
    const code = searchParams.get("error");
    return code ? loginErrorMessage(code) : null;
  });
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const attempt = () => signIn("credentials", { email, password, redirect: false });
    // NextAuth answers a rejected CSRF token with ok and no error (it would
    // redirect to its own sign-in page), which would send the reader on as if
    // signed in when they aren't. So a sign-in counts only once a session
    // exists; a second attempt fetches a fresh token.
    const signedIn = async () => Boolean((await getSession())?.user);
    let result = await attempt();
    if (!result?.error && !(await signedIn())) {
      result = await attempt();
      if (!result?.error && !(await signedIn())) {
        setPending(false);
        setError(loginErrorMessage(SIGN_IN_SERVER_ERROR));
        return;
      }
    }

    setPending(false);

    if (result?.error) {
      // Only CredentialsSignin means the email or password was rejected;
      // AccountSuspended (sent only after a correct password) that an admin
      // has suspended the account; GoogleOnlyAccount that it has no password
      // to check. Anything else -- most often the database not answering --
      // is a server problem, and telling the user their password is wrong
      // would be false.
      const known = ["CredentialsSignin", ACCOUNT_SUSPENDED, GOOGLE_ONLY_ACCOUNT];
      setError(loginErrorMessage(known.includes(result.error) ? result.error : SIGN_IN_SERVER_ERROR));
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="mb-1 font-display text-3xl text-ink">লগইন</h1>
      <p className="mb-6 font-body text-sm text-ink/70">আপনার বইতাকে ফিরে আসুন।</p>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-book border-2 border-oxblood bg-oxblood/10 px-4 py-3 font-body text-sm text-oxblood [overflow-wrap:anywhere]"
        >
          {error}
        </div>
      )}

      <GoogleButton callbackUrl={callbackUrl} />
      <OrDivider label="অথবা ইমেইল দিয়ে" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

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

      <p className="mt-6 text-center font-body text-sm text-ink/70">
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
        <p className="mt-4 rounded-book border-2 border-dashed border-ink/15 px-4 py-3 text-center font-body text-xs text-ink/70">
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
