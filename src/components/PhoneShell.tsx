"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { activeTab, fullScreenBack, type TabKey } from "@/lib/app-shell";
import { bn } from "@/lib/bangla";
import { useUnreadCount } from "@/components/UnreadBadge";
import { BackIcon, ExchangeIcon, HomeIcon, LibraryIcon, MessagesIcon, ProfileIcon, SearchTabIcon } from "@/components/AppIcons";

// The layout below lg, where the desktop navbar is hidden: a slim top bar
// and a bottom tab bar, as in a phone app. Both clear the notch and the home
// indicator (env(safe-area-inset-*), with viewport-fit=cover in the root
// layout). On a message thread and in the reader the tab bar steps aside, so
// nothing sits over the message box, the keyboard or the text, and the top
// bar offers the way back instead.

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:ring-offset-2 focus-visible:ring-offset-paper-dark";

export function PhoneTopBar() {
  const pathname = usePathname();
  const { status } = useSession();
  const unread = useUnreadCount();
  const back = fullScreenBack(pathname);
  const inMessages = pathname === "/messages" || pathname.startsWith("/messages/");

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink/10 bg-paper-dark pt-[env(safe-area-inset-top)] lg:hidden">
      <div className="flex h-14 items-center justify-between gap-3 px-2">
        {back ? (
          <Link href={back.href} className={`flex h-11 min-w-11 items-center gap-1 rounded-book pl-1 pr-3 font-body text-sm font-semibold text-cloth ${focusRing}`}>
            <BackIcon className="h-6 w-6" />
            {back.label}
          </Link>
        ) : (
          <Link href="/" className={`flex h-11 items-center whitespace-nowrap rounded-book px-2 font-display text-2xl text-cloth ${focusRing}`}>
            বই মহল
          </Link>
        )}

        {status === "authenticated" && !back && (
          <Link
            href="/messages"
            aria-label={unread > 0 ? `বার্তা, ${bn(unread)}টি না-পড়া` : "বার্তা"}
            aria-current={pathname === "/messages" ? "page" : undefined}
            className={`relative flex h-11 w-11 items-center justify-center rounded-book ${inMessages ? "text-cloth" : "text-ink"} ${focusRing}`}
          >
            <MessagesIcon active={inMessages} />
            {unread > 0 && (
              <span className="absolute right-0.5 top-1 min-w-5 rounded-full bg-oxblood px-1 text-center font-body text-[11px] font-semibold leading-5 text-paper">
                {bn(unread)}
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}

const TABS: { key: TabKey; label: string; href: string; Icon: typeof HomeIcon }[] = [
  { key: "home", label: "হোম", href: "/", Icon: HomeIcon },
  { key: "search", label: "খুঁজুন", href: "/search", Icon: SearchTabIcon },
  { key: "library", label: "লাইব্রেরি", href: "/library", Icon: LibraryIcon },
  { key: "exchange", label: "বিনিময়", href: "/marketplace", Icon: ExchangeIcon },
  { key: "profile", label: "প্রোফাইল", href: "/profile", Icon: ProfileIcon },
];

export function PhoneTabBar() {
  const pathname = usePathname();
  const { status } = useSession();
  if (fullScreenBack(pathname)) return null;
  const active = activeTab(pathname);

  return (
    <>
      {/* Keeps the end of every page (and the footer) clear of the bar. */}
      <div aria-hidden="true" className="h-[calc(3.75rem+env(safe-area-inset-bottom))] shrink-0 lg:hidden" />
      <nav
        aria-label="প্রধান"
        className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink/10 bg-paper-dark pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] lg:hidden"
      >
        <ul className="mx-auto grid max-w-xl grid-cols-5">
          {TABS.map(({ key, label, href, Icon }) => {
            const isActive = active === key;
            // Signed out, the profile tab is the way in.
            const to = key === "profile" && status === "unauthenticated" ? "/login" : href;
            return (
              <li key={key}>
                <Link
                  href={to}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex h-14 flex-col items-center justify-center gap-0.5 font-body text-[11px] leading-4 ${
                    // ink at 75% on paper-dark is about 5.4:1 (65% was 4.1:1).
                    isActive ? "font-semibold text-cloth" : "text-ink/75 hover:text-ink"
                  } ${focusRing}`}
                >
                  {/* A ribbon marker, like a bookmark, over the open tab. */}
                  {isActive && <span aria-hidden="true" className="absolute left-1/2 top-0 h-1 w-8 -translate-x-1/2 rounded-b-book bg-cloth" />}
                  <Icon active={isActive} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

// The footer stays off full-screen pages on phones, where the message box or
// the reader's last line should be the end of the page.
export function HideWhenFullScreen({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className={fullScreenBack(pathname) ? "max-lg:hidden lg:contents" : "contents"}>{children}</div>;
}
