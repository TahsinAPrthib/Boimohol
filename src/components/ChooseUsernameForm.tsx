"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { getSession, signOut } from "next-auth/react";
import { chooseUsername, type AccountResult } from "@/actions/account";
import FormMessage from "@/components/FormMessage";

// A full page load, not router.replace: while the account was pending, every
// page the client router prefetched came back as a redirect to /welcome, and
// the router would replay those cached redirects. replace() also keeps
// /welcome out of the back history.
function leaveFor(path: string) {
  window.location.replace(path);
}

export default function ChooseUsernameForm({
  callbackUrl,
  alreadyDone = false,
}: {
  callbackUrl: string;
  // The account already has a username and only the login token is behind.
  alreadyDone?: boolean;
}) {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<AccountResult | null>(null);
  const [pending, startTransition] = useTransition();

  // Re-reading the session refreshes the login token from the database
  // (src/lib/auth.ts), which is what lets src/proxy.ts stop sending the
  // browser back here. getSession, not useSession's update: update changes
  // with every session change, so an effect depending on it would loop.
  useEffect(() => {
    if (!alreadyDone) return;
    let cancelled = false;
    void getSession().then(() => {
      if (!cancelled) leaveFor(callbackUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [alreadyDone, callbackUrl]);

  if (alreadyDone) {
    return <p className="mx-auto max-w-md px-4 py-16 text-center font-body text-ink/60">এগিয়ে নিয়ে যাওয়া হচ্ছে...</p>;
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setResult(null);
    startTransition(async () => {
      const response = await chooseUsername(username);
      setResult(response);
      if (!response.success) return;
      // Refresh the token first (see above), then go on.
      await getSession();
      leaveFor(callbackUrl);
    });
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div>
        <label htmlFor="welcome-username" className="field-label">
          ইউজারনেম
        </label>
        <input
          id="welcome-username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={30}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-invalid={result?.field === "username" || undefined}
          aria-describedby="welcome-username-help"
          placeholder="যেমন: rahim_reads"
          className="field-input"
        />
        <p id="welcome-username-help" className="mt-1 font-body text-xs text-ink/50">
          ৩ থেকে ৩০ অক্ষর: ইংরেজি অক্ষর, সংখ্যা ও আন্ডারস্কোর (_)।
        </p>
      </div>
      <FormMessage result={result} />
      {/* Every new Google account passes through here, so this stands in for
          the sign-up form's consent line. */}
      <p className="font-body text-xs leading-relaxed text-ink/60">
        চালিয়ে গেলে আপনি আমাদের{" "}
        <Link href="/terms" className="font-semibold text-cloth hover:underline">
          ব্যবহারের শর্তাবলী
        </Link>{" "}
        ও{" "}
        <Link href="/privacy" className="font-semibold text-cloth hover:underline">
          গোপনীয়তা নীতিতে
        </Link>{" "}
        সম্মতি দিচ্ছেন।
      </p>
      <button type="submit" disabled={pending || !username.trim() || result?.success} className="btn-primary w-full disabled:opacity-60">
        {pending ? "সংরক্ষণ হচ্ছে..." : "ইউজারনেম সংরক্ষণ করে চালিয়ে যান"}
      </button>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="self-center font-body text-sm font-semibold text-ink/60 hover:text-cloth hover:underline"
      >
        এখন নয় — লগ আউট করুন
      </button>
    </form>
  );
}
