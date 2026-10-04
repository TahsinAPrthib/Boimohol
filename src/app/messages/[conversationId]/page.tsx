import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withCallbackUrl } from "@/lib/safe-redirect";
import { isBlockedEitherWay } from "@/lib/blocks";
import ListingCover from "@/components/ListingCover";
import MessageThread from "@/components/MessageThread";
import ReportButton from "@/components/ReportButton";
import BlockButton from "@/components/BlockButton";

export default async function ConversationPage(props: {
  params: Promise<{ conversationId: string }>;
}) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(withCallbackUrl("/login", `/messages/${params.conversationId}`));
  }

  const userId = session.user.id;

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.conversationId },
    include: {
      buyer: { select: { id: true, username: true } },
      listing: { include: { category: true, seller: { select: { id: true, username: true } } } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  // 404 rather than a "forbidden" page, so a non-participant can't tell
  // whether this conversation exists at all.
  if (!conversation) notFound();
  if (conversation.buyerId !== userId && conversation.listing.sellerId !== userId) notFound();

  const otherParty = conversation.buyerId === userId ? conversation.listing.seller : conversation.buyer;

  const [iBlockedThem, blockedEitherWay] = await Promise.all([
    prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: userId, blockedId: otherParty.id } },
      select: { id: true },
    }),
    isBlockedEitherWay(userId, otherParty.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/messages" className="font-body text-sm font-semibold text-cloth hover:underline">
        ← সব বার্তা
      </Link>

      <div className="mt-4 mb-6 flex items-center gap-4 rounded-book border-2 border-ink/10 bg-paper-dark p-4">
        <Link href={`/marketplace/${conversation.listing.id}`} className="w-16 shrink-0">
          <ListingCover
            title={conversation.listing.title}
            author={conversation.listing.author}
            colorKey={conversation.listing.category?.colorKey}
          />
        </Link>
        <div className="min-w-0">
          <Link
            href={`/marketplace/${conversation.listing.id}`}
            className="font-display text-lg text-ink hover:text-cloth"
          >
            {conversation.listing.title}
          </Link>
          <p className="font-body text-sm text-ink/50">{conversation.listing.author}</p>
          <p className="mt-1 font-body text-sm text-ink/60">@{otherParty.username} এর সাথে আলাপ</p>

          <div className="mt-3 flex flex-wrap items-start gap-4">
            <ReportButton targetType="USER" targetId={otherParty.id} label="ব্যবহারকারীকে রিপোর্ট করুন" />
            <BlockButton
              userId={otherParty.id}
              isBlocked={iBlockedThem !== null}
              username={otherParty.username}
            />
          </div>
        </div>
      </div>

      <MessageThread
        conversationId={conversation.id}
        currentUserId={userId}
        initialCanSend={!blockedEitherWay}
        initialBlockedNotice={
          blockedEitherWay ? "ব্লক থাকার কারণে এই আলাপে নতুন বার্তা পাঠানো যাবে না।" : undefined
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
