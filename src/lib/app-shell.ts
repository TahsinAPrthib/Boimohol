// The phone layout (below lg): a slim top bar and a bottom tab bar. Which
// tab a page belongs to, and which pages are full-screen -- a message thread
// and the reader -- where the tab bar steps aside for the keyboard and the
// text, and the top bar offers a way back instead.

export type TabKey = "home" | "search" | "library" | "exchange" | "profile";

const under = (pathname: string, base: string) => pathname === base || pathname.startsWith(base + "/");

export function activeTab(pathname: string): TabKey | null {
  if (pathname === "/") return "home";
  if (under(pathname, "/search") || under(pathname, "/categories")) return "search";
  if (under(pathname, "/library")) return "library";
  if (under(pathname, "/marketplace") || under(pathname, "/requests")) return "exchange";
  if (["/profile", "/wishlist", "/settings", "/admin", "/login", "/register", "/welcome"].some((base) => under(pathname, base))) return "profile";
  return null;
}

// Where the top bar's back button goes on a full-screen page, or null for
// every other page.
export function fullScreenBack(pathname: string): { href: string; label: string } | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 2 && parts[0] === "messages") return { href: "/messages", label: "সব বার্তা" };
  if (parts.length >= 3 && parts[0] === "books" && parts[2] === "read") return { href: `/books/${parts[1]}`, label: "বইয়ের পাতা" };
  return null;
}
