"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getConversationMessages,
  markConversationRead,
  sendMessage,
  type ThreadMessage,
} from "@/actions/messages";
import ReportButton from "@/components/ReportButton";
import { DELETED_USER_LABEL } from "@/lib/account-notices";

const POLL_INTERVAL_MS = 4000;

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("bn-BD", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function MessageThread({
  conversationId,
  currentUserId,
  initialMessages,
  initialCanSend = true,
  initialBlockedNotice,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: ThreadMessage[];
  initialCanSend?: boolean;
  initialBlockedNotice?: string;
}) {
  const [messages, setMessages] = useState<ThreadMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canSend, setCanSend] = useState(initialCanSend);
  const [blockedNotice, setBlockedNotice] = useState<string | undefined>(initialBlockedNotice);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Tracks the newest message from the other party we've already marked read,
  // so polling doesn't fire a write on every tick.
  const lastMarkedRef = useRef<string | null>(null);

  const markRead = useCallback(
    async (list: ThreadMessage[]) => {
      const newestFromThem = [...list].reverse().find((m) => m.senderId !== currentUserId);
      if (!newestFromThem || lastMarkedRef.current === newestFromThem.id) return;
      lastMarkedRef.current = newestFromThem.id;
      await markConversationRead(conversationId);
    },
    [conversationId, currentUserId]
  );

  useEffect(() => {
    void markRead(initialMessages);
  }, [initialMessages, markRead]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const result = await getConversationMessages(conversationId);
      if (cancelled || !result.success || !result.messages) return;
      setMessages(result.messages);
      // A block can land mid-conversation, so sending state is refreshed
      // alongside the messages rather than only on load.
      setCanSend(result.canSend !== false);
      setBlockedNotice(result.blockedNotice);
      void markRead(result.messages);
    }

    const timer = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [conversationId, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setError(null);
    setSending(true);

    // Optimistic append — replaced by the server's copy on the next poll.
    const optimistic: ThreadMessage = {
      id: `optimistic-${Date.now()}`,
      senderId: currentUserId,
      text: trimmed,
      createdAt: new Date().toISOString(),
      readAt: null,
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");

    const result = await sendMessage(conversationId, trimmed);
    setSending(false);

    if (!result.success) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(trimmed);
      setError(result.message ?? "বার্তা পাঠানো যায়নি।");
      return;
    }

    const refreshed = await getConversationMessages(conversationId);
    if (refreshed.success && refreshed.messages) setMessages(refreshed.messages);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-h-[60vh] min-h-[240px] flex-col gap-3 overflow-y-auto rounded-book border-2 border-ink/10 bg-paper p-4">
        {messages.length === 0 ? (
          <p className="my-auto text-center font-body text-sm text-ink/50">
            এখনো কোনো বার্তা নেই। প্রথম বার্তাটি আপনিই লিখুন।
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            const optimistic = m.id.startsWith("optimistic-");
            // Sent by someone whose account has since been deleted.
            const fromDeleted = m.senderId === null;
            return (
              <div
                key={m.id}
                className={`flex flex-wrap items-center gap-1 ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-book px-3 py-2 font-body text-sm ${
                    mine ? "bg-cloth text-paper" : "border-2 border-ink/10 bg-paper-dark text-ink"
                  }`}
                >
                  {fromDeleted && (
                    <p className="mb-1 text-xs font-semibold text-ink/50">{DELETED_USER_LABEL}</p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={`mt-1 text-xs ${mine ? "text-paper/60" : "text-ink/40"}`}>
                    {formatTime(m.createdAt)}
                  </p>
                </div>

                {/* Only the other party's messages are reportable, and not
                    once their account is gone (there is no one to act on).
                    Always rendered rather than hover-revealed — hover has no
                    touch equivalent — and kept quiet via a low-contrast glyph. */}
                {!mine && !optimistic && !fromDeleted && (
                  <ReportButton
                    variant="icon"
                    targetType="MESSAGE"
                    targetId={m.id}
                    label="বার্তাটি রিপোর্ট করুন"
                  />
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="rounded-book border-2 border-oxblood bg-oxblood/10 px-3 py-2 font-body text-sm text-oxblood">
          {error}
        </div>
      )}

      {canSend ? (
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="field-input flex-1"
            placeholder="আপনার বার্তা লিখুন..."
            maxLength={2000}
          />
          <button type="submit" disabled={sending || !text.trim()} className="btn-primary disabled:opacity-60">
            {sending ? "পাঠানো হচ্ছে..." : "পাঠান"}
          </button>
        </form>
      ) : (
        <p className="rounded-book border-2 border-dashed border-ink/15 px-4 py-3 text-center font-body text-sm text-ink/60">
          {blockedNotice ?? "এই আলাপে নতুন বার্তা পাঠানো যাবে না।"}
        </p>
      )}
    </div>
  );
}
