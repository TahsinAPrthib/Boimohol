"use client";
import { bn } from "@/lib/bangla";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getUnreadCount } from "@/actions/messages";

const POLL_INTERVAL_MS = 20000;

// One poll for the whole page: the desktop navbar and the phone top bar both
// show the count, and only one of them is ever visible.
const UnreadCount = createContext(0);

export function UnreadCountProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
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
  }, [status]);

  return <UnreadCount.Provider value={status === "authenticated" ? count : 0}>{children}</UnreadCount.Provider>;
}

export const useUnreadCount = () => useContext(UnreadCount);

export default function UnreadBadge() {
  const count = useUnreadCount();

  if (count === 0) return null;

  return (
    <span className="ml-1 rounded-book bg-oxblood px-1.5 py-0.5 font-body text-xs font-semibold text-paper">
      {bn(count)}
    </span>
  );
}
