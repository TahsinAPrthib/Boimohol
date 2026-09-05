"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b-2 border-ink/10 bg-paper-dark">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-2xl text-cloth">
          বই মহল
        </Link>

        <nav className="flex items-center gap-5 font-body text-sm font-semibold text-ink">
          <Link href="/" className="hover:text-cloth">
            হোম
          </Link>
          <Link href="/categories" className="hover:text-cloth">
            বিভাগ
          </Link>
          <Link href="/marketplace" className="hover:text-cloth">
            বিনিময়
          </Link>

          {status === "authenticated" && session?.user ? (
            <>
              <Link href="/profile" className="hover:text-cloth">
                প্রোফাইল
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-book border-2 border-ink/20 px-3 py-1.5 hover:border-ink/40"
              >
                লগ আউট
              </button>
            </>
          ) : status === "loading" ? (
            <span className="text-ink/40">...</span>
          ) : (
            <>
              <Link href="/login" className="hover:text-cloth">
                লগইন
              </Link>
              <Link href="/register" className="btn-primary px-3 py-1.5 text-sm">
                সাইন আপ
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
