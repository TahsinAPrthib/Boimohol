"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { disconnectGoogle, startGoogleConnect } from "@/actions/account";
import ConfirmAction from "@/components/ConfirmAction";
import FormMessage from "@/components/FormMessage";
import { GOOGLE_BUTTON_CLASS, GoogleMark } from "@/components/GoogleButton";

export default function GoogleConnection({
  connected,
  hasPassword,
  email,
}: {
  connected: boolean;
  hasPassword: boolean;
  email: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (connected) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-body text-sm text-ink/80">
          Google অ্যাকাউন্ট যুক্ত আছে — Google দিয়েও লগইন করতে পারবেন।
        </p>
        {hasPassword ? (
          <ConfirmAction
            action={disconnectGoogle}
            label="Google সরিয়ে দিন"
            question="Google সরিয়ে দিলে শুধু ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করতে পারবেন। সরিয়ে দেবেন?"
            confirmLabel="হ্যাঁ, সরিয়ে দিন"
            pendingLabel="সরানো হচ্ছে..."
            tone="neutral"
          />
        ) : (
          <p className="rounded-book border-2 border-dashed border-ink/15 px-3 py-2 font-body text-xs text-ink/70">
            আপনার অ্যাকাউন্টে কোনো পাসওয়ার্ড নেই, তাই Google সরানো যাবে না — সরালে আর লগইন করতে পারবেন না। আগে নিচে
            একটি পাসওয়ার্ড ঠিক করুন।
          </p>
        )}
      </div>
    );
  }

  function connect() {
    setMessage(null);
    startTransition(async () => {
      const result = await startGoogleConnect();
      if (!result.success) {
        setMessage(result.message);
        return;
      }
      // Off to Google; src/lib/google-auth.ts makes the link on the way back
      // and returns here with ?google=<result>.
      await signIn("google", { callbackUrl: "/settings?google=connected" });
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="max-w-prose font-body text-sm text-ink/80">
        Google যুক্ত করলে Google দিয়েও লগইন করতে পারবেন। শুধু{" "}
        <span className="font-semibold [overflow-wrap:anywhere]">{email}</span> ইমেইলের Google অ্যাকাউন্টই যুক্ত করা
        যাবে, আর যুক্ত হলে আপনার ইমেইল যাচাই হয়ে যাবে।
      </p>
      <div className="max-w-xs">
        <button type="button" onClick={connect} disabled={pending} className={GOOGLE_BUTTON_CLASS}>
          <GoogleMark />
          <span>{pending ? "Google-এ নিয়ে যাওয়া হচ্ছে..." : "Google যুক্ত করুন"}</span>
        </button>
      </div>
      <FormMessage result={message ? { success: false, message } : null} />
    </div>
  );
}
