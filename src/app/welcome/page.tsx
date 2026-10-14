import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPendingUserId, getSessionUserId } from "@/lib/authz";
import { safeCallbackUrl, withCallbackUrl } from "@/lib/safe-redirect";
import ChooseUsernameForm from "@/components/ChooseUsernameForm";

export const metadata: Metadata = { title: "ইউজারনেম বেছে নিন — বই মহল" };

// Where a new Google account picks its username (src/proxy.ts sends it here
// from every other page until it has).
export default async function WelcomePage(props: { searchParams: Promise<{ callbackUrl?: string | string[] }> }) {
  const raw = (await props.searchParams).callbackUrl;
  const target = safeCallbackUrl(Array.isArray(raw) ? raw[0] : raw);
  const callbackUrl = target.startsWith("/welcome") ? "/" : target;

  const pendingId = await getPendingUserId();
  if (!pendingId) {
    // Already has a username: only the login token was behind, and the form
    // below refreshes it on the way through. Not signed in at all: log in.
    if (await getSessionUserId()) return <ChooseUsernameForm alreadyDone callbackUrl={callbackUrl} />;
    redirect(withCallbackUrl("/login", callbackUrl));
  }

  const user = await prisma.user.findUnique({ where: { id: pendingId }, select: { name: true, email: true } });

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="mb-1 font-display text-3xl text-ink">স্বাগতম{user?.name ? `, ${user.name}` : ""}!</h1>
      <p className="mb-6 font-body text-sm text-ink/60 [overflow-wrap:anywhere]">
        Google দিয়ে আপনার অ্যাকাউন্ট খোলা হয়েছে ({user?.email})। শুরু করার আগে একটি ইউজারনেম বেছে নিন — আলাপে,
        তালিকায় আর অনুরোধে সবাই আপনাকে এই নামেই চিনবেন, আর পরে এটি বদলানো যাবে না।
      </p>
      <ChooseUsernameForm callbackUrl={callbackUrl} />
    </div>
  );
}
