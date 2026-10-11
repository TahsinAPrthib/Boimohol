"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
import { isBlockedEitherWay } from "@/lib/blocks";
import { DELETED_PARTNER_NOTICE } from "@/lib/account-notices";

const BLOCKED_NOTICE = "ব্লক থাকার কারণে এই আলাপে নতুন বার্তা পাঠানো যাবে না।";

const messageSchema = z.object({
  conversationId: z.string().min(1),
  text: z.string().trim().min(1, "বার্তা লিখুন।").max(2000, "বার্তাটি অনেক বড় হয়ে গেছে।"),
});

export type StartConversationResult = {
  success: boolean;
  message?: string;
  conversationId?: string;
};

export type SendMessageResult = {
  success: boolean;
  message?: string;
};

export type ThreadMessage = {
  id: string;
  // null once the sender's account has been deleted.
  senderId: string | null;
  text: string;
  createdAt: string;
  readAt: string | null;
};

export type MessagesResult = {
  success: boolean;
  message?: string;
  messages?: ThreadMessage[];
  // Blocked threads stay readable; only sending is disabled.
  canSend?: boolean;
  blockedNotice?: string;
};

// The other participant is whichever of (buyer, listing seller) isn't you --
// or null when their account has been deleted. Deleting the buyer clears
// buyerId; deleting the seller deletes the listing, which clears listingId.
// Either way the remaining participant keeps the thread.
function otherParticipantId(
  conversation: { buyerId: string | null; listing: { sellerId: string } | null },
  userId: string
) {
  return conversation.buyerId === userId
    ? (conversation.listing?.sellerId ?? null)
    : conversation.buyerId;
}

// A conversation's participants are its buyer and the listing's seller.
// Every action below authorizes against exactly this pair.
async function loadAuthorizedConversation(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { listing: { select: { sellerId: true } } },
  });

  if (!conversation) return null;
  if (conversation.buyerId !== userId && conversation.listing?.sellerId !== userId) return null;

  return conversation;
}

// Messages someone else sent you. senderId is NULL for a deleted sender, and
// SQL's <> never matches NULL, so "not me" has to include it explicitly.
function sentByOthers(userId: string) {
  return { OR: [{ senderId: { not: userId } }, { senderId: null }] };
}

export async function startOrGetConversation(listingId: string): Promise<StartConversationResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false, message: "বার্তা পাঠাতে হলে আগে লগইন করুন।" };
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return { success: false, message: "তালিকাটি খুঁজে পাওয়া যায়নি।" };
  }
  if (listing.status === "REMOVED") {
    return { success: false, message: "তালিকাটি সরিয়ে ফেলা হয়েছে।" };
  }
  if (listing.sellerId === userId) {
    return { success: false, message: "নিজের তালিকায় নিজে বার্তা পাঠাতে পারবেন না।" };
  }

  if (await isBlockedEitherWay(userId, listing.sellerId)) {
    return { success: false, message: "ব্লক থাকার কারণে এই বিক্রেতার সাথে যোগাযোগ করা যাবে না।" };
  }

  const conversation = await prisma.conversation.upsert({
    where: { listingId_buyerId: { listingId, buyerId: userId } },
    update: {},
    create: { listingId, buyerId: userId },
  });

  return { success: true, conversationId: conversation.id };
}

export async function sendMessage(conversationId: string, text: string): Promise<SendMessageResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false, message: "বার্তা পাঠাতে হলে আগে লগইন করুন।" };
  }

  const parsed = messageSchema.safeParse({ conversationId, text });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "বার্তাটি সঠিক নয়।" };
  }

  const conversation = await loadAuthorizedConversation(parsed.data.conversationId, userId);
  if (!conversation) {
    return { success: false, message: "এই আলাপে বার্তা পাঠানোর অনুমতি আপনার নেই।" };
  }

  const otherId = otherParticipantId(conversation, userId);
  if (!otherId) {
    return { success: false, message: DELETED_PARTNER_NOTICE };
  }
  if (await isBlockedEitherWay(userId, otherId)) {
    return { success: false, message: BLOCKED_NOTICE };
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: userId,
      text: parsed.data.text,
    },
  });

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversation.id}`);

  return { success: true };
}

// Intentionally a read in an actions file: MessageThread polls this from the
// client every few seconds, and a server action is the simplest way to do an
// authorized read without standing up a separate API route.
export async function getConversationMessages(conversationId: string): Promise<MessagesResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false, message: "বার্তা দেখতে হলে আগে লগইন করুন।" };
  }

  const conversation = await loadAuthorizedConversation(conversationId, userId);
  if (!conversation) {
    return { success: false, message: "এই আলাপ দেখার অনুমতি আপনার নেই।" };
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
  });

  const otherId = otherParticipantId(conversation, userId);
  const blocked = otherId !== null && (await isBlockedEitherWay(userId, otherId));

  return {
    success: true,
    canSend: otherId !== null && !blocked,
    blockedNotice: !otherId ? DELETED_PARTNER_NOTICE : blocked ? BLOCKED_NOTICE : undefined,
    messages: messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      text: m.text,
      createdAt: m.createdAt.toISOString(),
      readAt: m.readAt ? m.readAt.toISOString() : null,
    })),
  };
}

export async function markConversationRead(conversationId: string): Promise<SendMessageResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { success: false, message: "বার্তা দেখতে হলে আগে লগইন করুন।" };
  }

  const conversation = await loadAuthorizedConversation(conversationId, userId);
  if (!conversation) {
    return { success: false, message: "এই আলাপ দেখার অনুমতি আপনার নেই।" };
  }

  await prisma.message.updateMany({
    where: {
      conversationId: conversation.id,
      ...sentByOthers(userId),
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return { success: true };
}

export async function getUnreadCount(): Promise<number> {
  const userId = await getSessionUserId();
  if (!userId) return 0;
  return prisma.message.count({
    where: {
      AND: [
        sentByOthers(userId),
        { conversation: { OR: [{ buyerId: userId }, { listing: { sellerId: userId } }] } },
      ],
      readAt: null,
    },
  });
}
