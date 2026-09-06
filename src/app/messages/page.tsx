import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withCallbackUrl } from "@/lib/safe-redirect";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(withCallbackUrl("/login", "/messages"));

  const userId = session.user.id;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: userId }, { listing: { sellerId: userId } }],
    },
    include: {
      buyer: { select: { id: true, username: true } },
      listing: {
        select: {
          id: true,
          title: true,
          seller: { select: { id: true, username: true } },
        },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: {
        select: {
          messages: { where: { senderId: { not: userId }, readAt: null } },
        },
      },
    },
  });

  // Sort by most recent activity (last message, else the thread's own
  // creation time) — Prisma can't order by a related row's field directly.
  const sorted = [...conversations].sort((a, b) => {
    const aTime = a.messages[0]?.createdAt ?? a.createdAt;
    const bTime = b.messages[0]?.createdAt ?? b.createdAt;
    return bTime.getTime() - aTime.getTime();
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 border-b-2 border-ink/10 pb-6 font-display text-3xl text-ink">বার্তা</h1>

      {sorted.length === 0 ? (
        <p className="font-body text-ink/50">
          এখনো কোনো আলাপ শুরু হয়নি। বিনিময় পাতা থেকে কোনো বই সম্পর্কে বিক্রেতাকে বার্তা পাঠান।
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((conversation) => {
            const otherParty =
              conversation.buyerId === userId ? conversation.listing.seller : conversation.buyer;
            const lastMessage = conversation.messages[0];
            const unread = conversation._count.messages;

            return (
              <li key={conversation.id}>
                <Link
                  href={`/messages/${conversation.id}`}
                  className="flex items-start justify-between gap-4 rounded-book border-2 border-ink/10 bg-paper-dark p-4 transition-colors hover:border-cloth"
                >
                  <div className="min-w-0">
                    <p className="font-body font-semibold text-ink">@{otherParty.username}</p>
                    <p className="font-body text-sm text-ink/60">{conversation.listing.title}</p>
                    <p className="mt-1 truncate font-body text-sm text-ink/50">
                      {lastMessage ? lastMessage.text : "এখনো কোনো বার্তা নেই"}
                    </p>
                  </div>
                  {unread > 0 && (
                    <span className="shrink-0 rounded-book bg-oxblood px-2 py-0.5 font-body text-xs font-semibold text-paper">
                      {unread}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
