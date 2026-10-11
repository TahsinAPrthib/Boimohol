import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/authz";
import { bn, bnDate, bnDateTime } from "@/lib/bangla";
import { MODERATION_ACTION_LABEL } from "@/lib/moderation";
import { DELETED_USER_LABEL } from "@/lib/account-notices";
import {
  adminDeleteRequest,
  adminDeleteReview,
  adminRemoveListing,
  deleteUserAccount,
  suspendUser,
  unsuspendUser,
} from "@/actions/admin-moderation";
import ConfirmAction from "@/components/ConfirmAction";

const LISTING_STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "উপলব্ধ",
  RESERVED: "রিজার্ভড",
  COMPLETED: "সম্পন্ন",
  REMOVED: "সরিয়ে ফেলা হয়েছে",
};

const REQUEST_STATUS_LABEL: Record<string, string> = {
  OPEN: "খোলা",
  FULFILLED: "পাওয়া গেছে",
  CLOSED: "বন্ধ",
};

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 font-display text-xl text-ink">
        {title}
        {count !== undefined && <span className="ml-2 font-body text-base text-ink/50">({bn(count)})</span>}
      </h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="font-body text-sm text-ink/50">{children}</p>;
}

const ROW = "flex flex-col gap-3 rounded-book border-2 border-ink/10 bg-paper-dark p-4 sm:flex-row sm:items-start sm:justify-between";

export default async function AdminUserPage(props: { params: Promise<{ id: string }> }) {
  // 404 rather than 403: a non-admin should not learn this route exists.
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  const { id } = await props.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      suspendedAt: true,
      suspendedBy: { select: { username: true } },
      listings: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          author: true,
          status: true,
          createdAt: true,
          removedByAdminAt: true,
          removedByAdmin: { select: { username: true } },
          _count: { select: { photos: true } },
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          text: true,
          createdAt: true,
          book: { select: { id: true, title: true, titleBangla: true } },
        },
      },
      bookRequests: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          author: true,
          status: true,
          createdAt: true,
          _count: { select: { responses: true } },
        },
      },
      moderationReceived: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          action: true,
          summary: true,
          createdAt: true,
          admin: { select: { username: true } },
        },
      },
    },
  });
  if (!user) notFound();

  const isSelf = user.id === adminId;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/admin/users" className="font-body text-sm font-semibold text-cloth hover:underline">
        ← সব ব্যবহারকারী
      </Link>

      <div className="mt-4 rounded-book border-2 border-ink/10 bg-paper-dark p-5 [overflow-wrap:anywhere]">
        <h1 className="flex flex-wrap items-center gap-2 font-display text-3xl text-ink">
          @{user.username}
          {user.role === "ADMIN" && (
            <span className="rounded-book bg-cloth/15 px-2 py-0.5 font-body text-xs font-semibold text-cloth">
              অ্যাডমিন
            </span>
          )}
          {user.suspendedAt && (
            <span className="rounded-book bg-oxblood/10 px-2 py-0.5 font-body text-xs font-semibold text-oxblood">
              স্থগিত
            </span>
          )}
        </h1>
        <p className="mt-1 font-body text-ink/70">{user.name}</p>
        <p className="font-body text-sm text-ink/60">{user.email}</p>
        <p className="font-body text-xs text-ink/50">যোগ দিয়েছেন {bnDate(user.createdAt)}</p>

        {user.suspendedAt && (
          <p className="mt-3 font-body text-sm text-oxblood">
            {bnDateTime(user.suspendedAt)} থেকে স্থগিত
            {user.suspendedBy ? ` — স্থগিত করেছেন @${user.suspendedBy.username}` : ""}। এই অ্যাকাউন্টে লগইন করা বা
            কিছু করা যায় না।
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-start gap-3 border-t-2 border-ink/10 pt-4">
          {isSelf ? (
            <p className="font-body text-sm text-ink/60">এটি আপনার নিজের অ্যাকাউন্ট — নিজেকে স্থগিত বা মুছে ফেলা যায় না।</p>
          ) : (
            <>
              {user.suspendedAt ? (
                <ConfirmAction
                  action={unsuspendUser.bind(null, user.id)}
                  label="স্থগিতাদেশ তুলে নিন"
                  question={`@${user.username} আবার লগইন করতে ও সবকিছু করতে পারবেন। স্থগিতাদেশ তুলে নেবেন?`}
                  confirmLabel="হ্যাঁ, তুলে নিন"
                  pendingLabel="তুলে নেওয়া হচ্ছে..."
                  tone="neutral"
                />
              ) : (
                <ConfirmAction
                  action={suspendUser.bind(null, user.id)}
                  label="অ্যাকাউন্ট স্থগিত করুন"
                  question={`@${user.username} আর লগইন বা কিছু করতে পারবেন না, এখন লগইন থাকলেও না। স্থগিত করবেন?`}
                  confirmLabel="হ্যাঁ, স্থগিত করুন"
                  pendingLabel="স্থগিত করা হচ্ছে..."
                />
              )}
              <ConfirmAction
                action={deleteUserAccount.bind(null, user.id)}
                label="অ্যাকাউন্ট মুছে ফেলুন"
                question={`@${user.username} এর অ্যাকাউন্ট চিরতরে মুছে ফেলবেন? তাঁর তালিকা (ছবিসহ), পর্যালোচনা, অনুরোধ, বইতাক, উইশলিস্ট ও পড়ার হিসাব মুছে যাবে। অন্যরা তাঁর কাছ থেকে যে বার্তা পেয়েছেন সেগুলো থেকে যাবে, “${DELETED_USER_LABEL}” নামে। এটি আর ফেরানো যাবে না।`}
                confirmLabel="হ্যাঁ, চিরতরে মুছুন"
                pendingLabel="মুছে ফেলা হচ্ছে..."
                redirectTo="/admin/users"
              />
            </>
          )}
        </div>
      </div>

      <Section title="তালিকা" count={user.listings.length}>
        {user.listings.length === 0 ? (
          <Empty>কোনো তালিকা নেই।</Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {user.listings.map((listing) => (
              <li key={listing.id} className={ROW}>
                <div className="min-w-0 [overflow-wrap:anywhere]">
                  <Link href={`/marketplace/${listing.id}`} className="font-display text-lg text-ink hover:text-cloth">
                    {listing.title}
                  </Link>
                  <p className="font-body text-sm text-ink/60">{listing.author}</p>
                  <p className="font-body text-xs text-ink/50">
                    {LISTING_STATUS_LABEL[listing.status]} · {bn(listing._count.photos)}টি ছবি · {bnDate(listing.createdAt)}
                  </p>
                </div>
                {listing.removedByAdminAt ? (
                  <p className="shrink-0 font-body text-xs text-oxblood sm:max-w-[16rem] sm:text-right">
                    {listing.removedByAdmin ? `@${listing.removedByAdmin.username}` : "একজন অ্যাডমিন"} সরিয়েছেন,{" "}
                    {bnDateTime(listing.removedByAdminAt)}
                  </p>
                ) : (
                  <ConfirmAction
                    action={adminRemoveListing.bind(null, listing.id)}
                    label="তালিকা সরিয়ে ফেলুন"
                    question="তালিকাটি সবার কাছ থেকে সরিয়ে ফেলবেন? বিক্রেতা এটি আর ফেরাতে বা সম্পাদনা করতে পারবেন না।"
                    confirmLabel="হ্যাঁ, সরিয়ে ফেলুন"
                    pendingLabel="সরানো হচ্ছে..."
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="পর্যালোচনা" count={user.reviews.length}>
        {user.reviews.length === 0 ? (
          <Empty>কোনো পর্যালোচনা নেই।</Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {user.reviews.map((review) => (
              <li key={review.id} className={ROW}>
                <div className="min-w-0 [overflow-wrap:anywhere]">
                  <Link href={`/books/${review.book.id}`} className="font-display text-lg text-ink hover:text-cloth">
                    {review.book.titleBangla || review.book.title}
                  </Link>
                  <p className="font-body text-xs text-ink/50">
                    রেটিং {bn(review.rating)}/৫ · {bnDate(review.createdAt)}
                  </p>
                  {review.text && <p className="mt-1 max-w-prose font-body text-sm text-ink/70">{review.text}</p>}
                </div>
                <ConfirmAction
                  action={adminDeleteReview.bind(null, review.id)}
                  label="পর্যালোচনা মুছুন"
                  question="পর্যালোচনাটি চিরতরে মুছে ফেলবেন?"
                  confirmLabel="হ্যাঁ, মুছুন"
                  pendingLabel="মুছে ফেলা হচ্ছে..."
                />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="অনুরোধ" count={user.bookRequests.length}>
        {user.bookRequests.length === 0 ? (
          <Empty>কোনো অনুরোধ নেই।</Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {user.bookRequests.map((request) => (
              <li key={request.id} className={ROW}>
                <div className="min-w-0 [overflow-wrap:anywhere]">
                  <Link href={`/requests/${request.id}`} className="font-display text-lg text-ink hover:text-cloth">
                    {request.title}
                  </Link>
                  <p className="font-body text-sm text-ink/60">{request.author}</p>
                  <p className="font-body text-xs text-ink/50">
                    {REQUEST_STATUS_LABEL[request.status]} · {bn(request._count.responses)}টি সাড়া ·{" "}
                    {bnDate(request.createdAt)}
                  </p>
                </div>
                <ConfirmAction
                  action={adminDeleteRequest.bind(null, request.id)}
                  label="অনুরোধ মুছুন"
                  question="অনুরোধটি, অন্যদের সাড়াসহ, চিরতরে মুছে ফেলবেন?"
                  confirmLabel="হ্যাঁ, মুছুন"
                  pendingLabel="মুছে ফেলা হচ্ছে..."
                />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="মডারেশনের ইতিহাস">
        {user.moderationReceived.length === 0 ? (
          <Empty>এই অ্যাকাউন্টে এখনো কোনো পদক্ষেপ নেওয়া হয়নি।</Empty>
        ) : (
          <ol className="flex flex-col gap-2 border-l-2 border-ink/10 pl-4">
            {user.moderationReceived.map((entry) => (
              <li key={entry.id} className="font-body text-sm text-ink/80 [overflow-wrap:anywhere]">
                <span className="font-semibold text-ink">{MODERATION_ACTION_LABEL[entry.action]}</span>
                {entry.summary && ` — ${entry.summary}`}
                <span className="block text-xs text-ink/50">
                  {entry.admin ? `@${entry.admin.username}` : "মুছে ফেলা অ্যাডমিন"}, {bnDateTime(entry.createdAt)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Section>
    </div>
  );
}
