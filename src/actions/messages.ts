"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isBlockedEitherWay } from "@/lib/blocks";

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
  senderId: string;
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

// The other participant is whichever of (buyer, listing seller) isn't you.
function otherParticipantId(
  conversation: { buyerId: string; listing: { sellerId: string } },
  userId: string
) {
  return conversation.buyerId === userId ? conversation.listing.sellerId : conversation.buyerId;
}

// A conversation's participants are its buyer and the listing's seller.
// Every action below authorizes against exactly this pair.
async function loadAuthorizedConversation(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { listing: { select: { sellerId: true } } },
  });

  if (!conversation) return null;
  if (conversation.buyerId !== userId && conversation.listing.sellerId !== userId) return null;

  return conversation;
}

export async function startOrGetConversation(listingId: string): Promise<StartConversationResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "বার্তা পাঠাতে হলে আগে লগইন করুন।" };
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return { success: false, message: "তালিকাটি খুঁজে পাওয়া যায়নি।" };
  }
  if (listing.sellerId === session.user.id) {
    return { success: false, message: "নিজের তালিকায় নিজে বার্তা পাঠাতে পারবেন না।" };
  }

  if (await isBlockedEitherWay(session.user.id, listing.sellerId)) {
    return { success: false, message: "ব্লক থাকার কারণে এই বিক্রেতার সাথে যোগাযোগ করা যাবে না।" };
  }

  const conversation = await prisma.conversation.upsert({
    where: { listingId_buyerId: { listingId, buyerId: session.user.id } },
    update: {},
    create: { listingId, buyerId: session.user.id },
  });

  return { success: true, conversationId: conversation.id };
}

export async function sendMessage(conversationId: string, text: string): Promise<SendMessageResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "বার্তা পাঠাতে হলে আগে লগইন করুন।" };
  }

  const parsed = messageSchema.safeParse({ conversationId, text });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "বার্তাটি সঠিক নয়।" };
  }

  const conversation = await loadAuthorizedConversation(parsed.data.conversationId, session.user.id);
  if (!conversation) {
    return { success: false, message: "এই আলাপে বার্তা পাঠানোর অনুমতি আপনার নেই।" };
  }

  if (await isBlockedEitherWay(session.user.id, otherParticipantId(conversation, session.user.id))) {
    return { success: false, message: BLOCKED_NOTICE };
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: session.user.id,
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "বার্তা দেখতে হলে আগে লগইন করুন।" };
  }

  const conversation = await loadAuthorizedConversation(conversationId, session.user.id);
  if (!conversation) {
    return { success: false, message: "এই আলাপ দেখার অনুমতি আপনার নেই।" };
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
  });

  const blocked = await isBlockedEitherWay(
    session.user.id,
    otherParticipantId(conversation, session.user.id)
  );

  return {
    success: true,
    canSend: !blocked,
    blockedNotice: blocked ? BLOCKED_NOTICE : undefined,
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "বার্তা দেখতে হলে আগে লগইন করুন।" };
  }

  const conversation = await loadAuthorizedConversation(conversationId, session.user.id);
  if (!conversation) {
    return { success: false, message: "এই আলাপ দেখার অনুমতি আপনার নেই।" };
  }

  await prisma.message.updateMany({
    where: {
      conversationId: conversation.id,
      senderId: { not: session.user.id },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return { success: true };
}

export async function getUnreadCount(): Promise<number> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return 0;

  const userId = session.user.id;

  return prisma.message.count({
    where: {
      senderId: { not: userId },
      readAt: null,
      conversation: {
        OR: [{ buyerId: userId }, { listing: { sellerId: userId } }],
      },
    },
  });
}
