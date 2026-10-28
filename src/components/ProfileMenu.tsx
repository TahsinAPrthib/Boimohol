"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronIcon, ExchangeIcon, HeartIcon, LogoutIcon, RequestIcon, SettingsIcon, ShieldIcon } from "@/components/AppIcons";

// On phones the profile page holds what the desktop navbar does: the
// reader's own lists and settings, the admin pages for admins, and log out.
// Hidden from lg up, where the navbar and the page's own links remain.

const row =
  "flex min-h-14 items-center gap-3 px-4 py-3 font-body font-semibold text-ink transition-colors hover:bg-ink/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-turmeric";

function MenuLink({ href, label, Icon }: { href: string; label: string; Icon: typeof HeartIcon }) {
  return (
    <li>
      <Link href={href} className={row}>
        <Icon className="h-6 w-6 shrink-0 text-cloth" />
        <span className="flex-1">{label}</span>
        <ChevronIcon className="h-5 w-5 shrink-0 text-ink/40" />
      </Link>
    </li>
  );
}

const list = "divide-y-2 divide-ink/10 overflow-hidden rounded-book border-2 border-ink/10 bg-paper-dark";

export function ProfileLinks() {
  return (
    <nav aria-label="আমার পাতা" className="mb-10 lg:hidden">
      <ul className={list}>
        <MenuLink href="/wishlist" label="আমার উইশলিস্ট" Icon={HeartIcon} />
        <MenuLink href="/marketplace/mine" label="আমার বিনিময় তালিকা" Icon={ExchangeIcon} />
        <MenuLink href="/requests/mine" label="আমার অনুরোধ" Icon={RequestIcon} />
        <MenuLink href="/settings" label="অ্যাকাউন্ট সেটিংস" Icon={SettingsIcon} />
      </ul>
    </nav>
  );
}

export function ProfileFooter({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="mt-12 flex flex-col gap-8 lg:hidden">
      {isAdmin && (
        <section aria-labelledby="admin-pages">
          <h2 id="admin-pages" className="mb-3 font-display text-xl text-ink">
            অ্যাডমিন
          </h2>
          <ul className={list}>
            <MenuLink href="/admin/reports" label="রিপোর্ট" Icon={ShieldIcon} />
            <MenuLink href="/admin/books" label="বই ও ফাইল" Icon={ShieldIcon} />
            <MenuLink href="/admin/users" label="ব্যবহারকারী" Icon={ShieldIcon} />
          </ul>
        </section>
      )}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex min-h-14 items-center justify-center gap-2 rounded-book border-2 border-oxblood/40 px-4 font-body font-semibold text-oxblood transition-colors hover:border-oxblood hover:bg-oxblood/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric"
      >
        <LogoutIcon className="h-6 w-6" />
        লগ আউট
      </button>
    </div>
  );
}
