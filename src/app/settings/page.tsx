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

export const metadata: Metadata = { title: "অ্যাকাউন্ট সেটিংস — বই মহল" };

const CARD = "rounded-book border-2 border-ink/10 bg-paper-dark p-5";

export default async function SettingsPage() {
  // The layout has already sent signed-out visitors to the login page.
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, username: true, email: true, role: true, passwordChangedAt: true },
  });
  if (!user) redirect("/login");

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
              <dd className="font-semibold text-ink">{user.email}</dd>
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

        <section className={CARD} aria-labelledby="settings-password-heading">
          <h2 id="settings-password-heading" className="mb-1 font-display text-xl text-ink">
            পাসওয়ার্ড
          </h2>
          <p className="mb-4 font-body text-sm text-ink/60">
            পাসওয়ার্ড বদলালে অন্য সব ডিভাইস ও ব্রাউজার থেকে আপনাকে লগ আউট করা হবে।
            {user.passwordChangedAt && ` শেষ বদলেছেন ${bnDate(user.passwordChangedAt)}।`}
          </p>
          <SettingsPasswordForm email={user.email} />
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
            <DeleteAccountForm username={user.username} email={user.email} />
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
