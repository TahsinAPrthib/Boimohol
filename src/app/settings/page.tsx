import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
import { bnDate } from "@/lib/bangla";
import { canDeleteOwnAccount } from "@/lib/account-rules";
import { DELETED_USER_LABEL } from "@/lib/account-notices";
import SettingsNameForm from "@/components/SettingsNameForm";
import SettingsPasswordForm from "@/components/SettingsPasswordForm";
import DeleteAccountForm from "@/components/DeleteAccountForm";
import GoogleConnection from "@/components/GoogleConnection";
import FormMessage from "@/components/FormMessage";

export const metadata: Metadata = { title: "অ্যাকাউন্ট সেটিংস — বই মহল" };

const CARD = "rounded-book border-2 border-ink/10 bg-paper-dark p-5";

// What came of "Connect Google", reported back by src/lib/google-auth.ts.
const GOOGLE_RESULT: Record<string, string> = {
  "email-mismatch":
    "যুক্ত করা যায়নি: বেছে নেওয়া Google অ্যাকাউন্টের ইমেইল আপনার বই মহল অ্যাকাউন্টের ইমেইলের সাথে মেলেনি। একই ইমেইলের Google অ্যাকাউন্ট বেছে নিন।",
  taken: "যুক্ত করা যায়নি: এই Google অ্যাকাউন্টটি অন্য একটি বই মহল অ্যাকাউন্টে যুক্ত আছে।",
  already: "আপনার অ্যাকাউন্টে আগে থেকেই আরেকটি Google অ্যাকাউন্ট যুক্ত আছে। আগে সেটি সরিয়ে দিন।",
  unverified: "যুক্ত করা যায়নি: এই Google অ্যাকাউন্টের ইমেইল Google-এ যাচাই করা নেই।",
  expired: "যুক্ত করা যায়নি: অনেক সময় পেরিয়ে গেছে, অথবা এর মধ্যে লগ আউট হয়ে গিয়েছিলেন। আবার চেষ্টা করুন।",
  error: "Google যুক্ত করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।",
};

export default async function SettingsPage(props: { searchParams: Promise<{ google?: string | string[] }> }) {
  // The layout has already sent signed-out visitors to the login page.
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      username: true,
      email: true,
      emailVerified: true,
      role: true,
      passwordHash: true,
      passwordChangedAt: true,
      googleId: true,
    },
  });
  if (!user) redirect("/login");
  const hasPassword = user.passwordHash !== null;
  const connected = user.googleId !== null;

  const googleParam = (await props.searchParams).google;
  const googleResult = Array.isArray(googleParam) ? googleParam[0] : googleParam;
  const googleMessage =
    googleResult === "connected"
      ? connected
        ? { success: true, message: "Google অ্যাকাউন্ট যুক্ত হয়েছে, আর আপনার ইমেইল যাচাই হয়ে গেছে।" }
        : null
      : googleResult && GOOGLE_RESULT[googleResult]
        ? { success: false, message: GOOGLE_RESULT[googleResult] }
        : null;

  const otherActiveAdmins =
    user.role === "ADMIN"
      ? await prisma.user.count({ where: { role: "ADMIN", suspendedAt: null, id: { not: userId } } })
      : 0;
  const mayDelete = canDeleteOwnAccount(user.role, otherActiveAdmins);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/profile" className="font-body text-sm font-semibold text-cloth hover:underline">
        ← প্রোফাইল
      </Link>
      <h1 className="mt-3 mb-8 font-display text-3xl text-ink">অ্যাকাউন্ট সেটিংস</h1>

      <div className="flex flex-col gap-6">
        <section className={CARD} aria-labelledby="settings-account">
          <h2 id="settings-account" className="mb-3 font-display text-xl text-ink">
            অ্যাকাউন্ট
          </h2>
          <dl className="flex flex-col gap-3 font-body text-sm [overflow-wrap:anywhere]">
            <div>
              <dt className="text-ink/60">ইউজারনেম</dt>
              <dd className="font-semibold text-ink">@{user.username}</dd>
              <dd className="mt-1 text-xs text-ink/50">
                ইউজারনেম বদলানো যায় না — আলাপে, তালিকায় আর অনুরোধে সবাই আপনাকে এই নামেই চেনেন।
              </dd>
            </div>
            <div>
              <dt className="text-ink/60">ইমেইল</dt>
              <dd className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                {user.email}
                {user.emailVerified ? (
                  <span className="rounded-book bg-sage/15 px-2 py-0.5 text-xs font-semibold text-sage">যাচাই করা</span>
                ) : (
                  <span className="rounded-book bg-ink/10 px-2 py-0.5 text-xs font-semibold text-ink/60">
                    যাচাই করা হয়নি
                  </span>
                )}
              </dd>
              {!user.emailVerified && (
                <dd className="mt-1 text-xs text-ink/50">
                  একই ইমেইলের Google অ্যাকাউন্ট যুক্ত করলে আপনার ইমেইল যাচাই হয়ে যাবে।
                </dd>
              )}
              <dd className="mt-1 text-xs text-ink/50">
                ইমেইল বদলানোর ব্যবস্থা এখনো সাইটে নেই; দরকার হলে{" "}
                <a href="mailto:tahsinaparthib1@gmail.com" className="font-semibold text-cloth hover:underline">
                  আমাদের ইমেইল করুন
                </a>
                ।
              </dd>
            </div>
          </dl>
        </section>

        <section className={CARD} aria-labelledby="settings-name-heading">
          <h2 id="settings-name-heading" className="mb-3 font-display text-xl text-ink">
            নাম
          </h2>
          <SettingsNameForm currentName={user.name} />
        </section>

        <section className={CARD} aria-labelledby="settings-google-heading">
          <h2 id="settings-google-heading" className="mb-3 font-display text-xl text-ink">
            Google
          </h2>
          {googleMessage && (
            <div className="mb-3">
              <FormMessage result={googleMessage} />
            </div>
          )}
          <GoogleConnection connected={connected} hasPassword={hasPassword} email={user.email} />
        </section>

        <section className={CARD} aria-labelledby="settings-password-heading">
          <h2 id="settings-password-heading" className="mb-1 font-display text-xl text-ink">
            {hasPassword ? "পাসওয়ার্ড" : "পাসওয়ার্ড ঠিক করুন"}
          </h2>
          <p className="mb-4 font-body text-sm text-ink/60">
            {hasPassword
              ? "পাসওয়ার্ড বদলালে অন্য সব ডিভাইস ও ব্রাউজার থেকে আপনাকে লগ আউট করা হবে।"
              : "আপনার অ্যাকাউন্ট Google দিয়ে খোলা, এতে এখনো কোনো পাসওয়ার্ড নেই। পাসওয়ার্ড ঠিক করলে ইমেইল ও পাসওয়ার্ড দিয়েও লগইন করতে পারবেন।"}
            {user.passwordChangedAt && ` শেষ বদলেছেন ${bnDate(user.passwordChangedAt)}।`}
          </p>
          <SettingsPasswordForm email={user.email} hasPassword={hasPassword} />
        </section>

        <section className="rounded-book border-2 border-oxblood/40 bg-oxblood/5 p-5" aria-labelledby="settings-delete-heading">
          <h2 id="settings-delete-heading" className="mb-2 font-display text-xl text-oxblood">
            অ্যাকাউন্ট মুছে ফেলুন
          </h2>
          <p className="mb-2 max-w-prose font-body text-sm text-ink/80">
            অ্যাকাউন্ট মুছে ফেললে আপনার তালিকা ও ছবি, পর্যালোচনা, অনুরোধ ও সাড়া, বইতাক, উইশলিস্ট এবং পড়ার
            কার্যকলাপ চিরতরে মুছে যাবে। অন্যদের পাঠানো আপনার বার্তাগুলো তাঁদের কথোপকথনে থেকে যাবে, তবে সেখানে
            আপনার ইউজারনেমের বদলে “{DELETED_USER_LABEL}” দেখাবে।
          </p>
          <p className="mb-4 max-w-prose font-body text-sm text-ink/80">
            <strong className="font-semibold text-oxblood">এটি আর ফেরানো যাবে না।</strong> বিস্তারিত{" "}
            <Link href="/privacy" className="font-semibold text-cloth hover:underline">
              গোপনীয়তা নীতিতে
            </Link>
            ।
          </p>
          {mayDelete ? (
            <DeleteAccountForm username={user.username} email={user.email} hasPassword={hasPassword} />
          ) : (
            <p className="rounded-book border-2 border-dashed border-oxblood/40 px-4 py-3 font-body text-sm text-ink/70">
              আপনিই সাইটের একমাত্র সক্রিয় অ্যাডমিন, তাই এখন আপনার অ্যাকাউন্ট মুছে ফেলা যাবে না। আরেকজন অ্যাডমিন
              থাকলে তবেই এটি করা যাবে।
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
