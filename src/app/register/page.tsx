import type { Metadata } from "next";
import Link from "next/link";
import { safeCallbackUrl, withCallbackUrl } from "@/lib/safe-redirect";
import GoogleButton from "@/components/GoogleButton";

export const metadata: Metadata = { title: "নতুন অ্যাকাউন্ট — বই মহল" };

// New accounts are made only through Google, so every account starts with an
// email address that is known to belong to its owner. There is no email and
// password sign-up on the server any more either: the only code that creates
// an account is the Google sign-in in src/lib/google-auth.ts. Existing
// email/password accounts still log in as before.
export default async function RegisterPage(props: { searchParams: Promise<{ callbackUrl?: string | string[] }> }) {
  const raw = (await props.searchParams).callbackUrl;
  const rawCallback = Array.isArray(raw) ? raw[0] : raw;
  const callbackUrl = safeCallbackUrl(rawCallback);
  // Carry the destination through to the login page, sanitised.
  const loginHref = rawCallback ? withCallbackUrl("/login", callbackUrl) : "/login";

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="mb-1 font-display text-3xl text-ink">নতুন অ্যাকাউন্ট</h1>
      <p className="mb-6 font-body text-sm text-ink/60">
        বই মহলে যোগ দিন — পড়ুন, পর্যালোচনা লিখুন, নিজের বইতাক সাজান।
      </p>

      <GoogleButton callbackUrl={callbackUrl} />

      <p className="mt-5 font-body text-sm leading-relaxed text-ink/70">
        নতুন অ্যাকাউন্ট এখন শুধু Google দিয়ে খোলা যায়, যাতে প্রতিটি অ্যাকাউন্টের ইমেইল ঠিকানা যে সত্যিই তার মালিকের,
        তা নিশ্চিত থাকে। অ্যাকাউন্ট খোলার পর চাইলে সেটিংস থেকে একটি পাসওয়ার্ডও ঠিক করে নিতে পারবেন।
      </p>

      <p className="mt-4 font-body text-xs leading-relaxed text-ink/60">
        সাইন আপ করলে আপনি আমাদের{" "}
        <Link href="/terms" className="font-semibold text-cloth hover:underline">
          ব্যবহারের শর্তাবলী
        </Link>{" "}
        ও{" "}
        <Link href="/privacy" className="font-semibold text-cloth hover:underline">
          গোপনীয়তা নীতিতে
        </Link>{" "}
        সম্মতি দিচ্ছেন।
      </p>

      <p className="mt-6 text-center font-body text-sm text-ink/60">
        আগে থেকেই অ্যাকাউন্ট আছে?{" "}
        <Link href={loginHref} className="font-semibold text-cloth hover:underline">
          লগইন করুন
        </Link>
      </p>
    </div>
  );
}
