import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
import { loadConversation } from "@/lib/loaders";
import { withCallbackUrl } from "@/lib/safe-redirect";
import { isBlockedEitherWay } from "@/lib/blocks";
import { DELETED_PARTNER_NOTICE, DELETED_USER_LABEL } from "@/lib/account-notices";
import ListingCover from "@/components/ListingCover";
import MessageThread from "@/components/MessageThread";
import ReportButton from "@/components/ReportButton";
import BlockButton from "@/components/BlockButton";

export default async function ConversationPage(props: {
  params: Promise<{ conversationId: string }>;
}) {
  const params = await props.params;
  const userId = await getSessionUserId();
  if (!userId) {
    redirect(withCallbackUrl("/login", `/messages/${params.conversationId}`));
  }
  const conversation = await loadConversation(params.conversationId);

  // 404 rather than a "forbidden" page, so a non-participant can't tell
  // whether this conversation exists at all.
  if (!conversation) notFound();
  if (conversation.buyerId !== userId && conversation.listing?.sellerId !== userId) notFound();

  // null once the other person has deleted their account: deleting the buyer
  // clears buyerId, and deleting the seller deletes the listing itself. The
  // thread stays readable for whoever is left, but nothing more can be sent.
  const { listing } = conversation;
  const otherParty = conversation.buyerId === userId ? (listing?.seller ?? null) : conversation.buyer;

  const [iBlockedThem, blockedEitherWay] = otherParty
    ? await Promise.all([
        prisma.block.findUnique({
          where: { blockerId_blockedId: { blockerId: userId, blockedId: otherParty.id } },
          select: { id: true },
        }),
        isBlockedEitherWay(userId, otherParty.id),
      ])
    : [null, false];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/messages" className="font-body text-sm font-semibold text-cloth hover:underline max-lg:hidden">
        ← সব বার্তা
      </Link>

      <div className="mt-4 mb-6 flex items-center gap-4 rounded-book border-2 border-ink/10 bg-paper-dark p-4">
        {listing && (
          <Link href={`/marketplace/${listing.id}`} className="w-16 shrink-0">
            <ListingCover title={listing.title} author={listing.author} colorKey={listing.category?.colorKey} />
          </Link>
        )}
        <div className="min-w-0 [overflow-wrap:anywhere]">
          {listing ? (
            <>
              <Link href={`/marketplace/${listing.id}`} className="font-display text-lg text-ink hover:text-cloth">
                {listing.title}
              </Link>
              <p className="font-body text-sm text-ink/70">{listing.author}</p>
            </>
          ) : (
            <p className="font-display text-lg text-ink/70">তালিকাটি আর নেই</p>
          )}
          <p className="mt-1 font-body text-sm text-ink/70">
            {otherParty ? `@${otherParty.username} এর সাথে আলাপ` : `${DELETED_USER_LABEL}র সাথে আলাপ`}
          </p>

          {otherParty && (
            <div className="mt-3 flex flex-wrap items-start gap-4">
              <ReportButton targetType="USER" targetId={otherParty.id} label="ব্যবহারকারীকে রিপোর্ট করুন" />
              <BlockButton
                userId={otherParty.id}
                isBlocked={iBlockedThem !== null}
                username={otherParty.username}
              />
            </div>
          )}
        </div>
      </div>

      <MessageThread
        conversationId={conversation.id}
        currentUserId={userId}
        initialCanSend={otherParty !== null && !blockedEitherWay}
        initialBlockedNotice={
          !otherParty
            ? DELETED_PARTNER_NOTICE
            : blockedEitherWay
              ? "ব্লক থাকার কারণে এই আলাপে নতুন বার্তা পাঠানো যাবে না।"
              : undefined
        }
        initialMessages={conversation.messages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          text: m.text,
          createdAt: m.createdAt.toISOString(),
          readAt: m.readAt ? m.readAt.toISOString() : null,
        }))}
      />
    </div>
  );
}
