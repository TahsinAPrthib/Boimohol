import { requireUserId } from "@/lib/authz";

// The inbox sits in a route group so its loading skeleton doesn't also wrap
// the conversation pages, which have checks of their own.
export default async function InboxLayout({ children }: { children: React.ReactNode }) {
  await requireUserId("/messages");
  return children;
}
