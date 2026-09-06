"use client";

import { useEffect, useState } from "react";
import { getUnreadCount } from "@/actions/messages";

const POLL_INTERVAL_MS = 20000;

export default function UnreadBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const value = await getUnreadCount();
      if (!cancelled) setCount(value);
    }

    void poll();
    const timer = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-1 rounded-book bg-oxblood px-1.5 py-0.5 font-body text-xs font-semibold text-paper">
      {count}
    </span>
  );
}
