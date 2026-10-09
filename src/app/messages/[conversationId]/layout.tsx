import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/authz";
import { loadConversation } from "@/lib/loaders";

// Above this route's loading skeleton: signed out -> 307 to login; missing
// or not yours -> 404 (the same 404 either way, so a non-participant can't
// tell whether the conversation exists).
export default async function ConversationLayout(props: {
  children: React.ReactNode;
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await props.params;
  const userId = await requireUserId(`/messages/${conversationId}`);
  const conversation = await loadConversation(conversationId);
  if (!conversation) notFound();
  if (conversation.buyerId !== userId && conversation.listing.sellerId !== userId) notFound();
  return props.children;
}
