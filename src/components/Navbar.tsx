"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import UnreadBadge from "@/components/UnreadBadge";
import SearchBox, { SearchIcon } from "@/components/SearchBox";

// Site search in the navbar. From lg up, a compact box that takes the reader
// to /search; below that, only an icon, so the links never get squeezed.
function NavSearch() {
  return (
    <>
      <Link
        href="/search"
        aria-label="খুঁজুন"
        className="ml-auto flex h-9 w-9 items-center justify-center rounded-book text-ink hover:bg-ink/5 hover:text-cloth lg:hidden"
      >
        <SearchIcon className="h-5 w-5" />
      </Link>
      <div className="ml-auto hidden w-48 lg:block">
        {/* useSearchParams needs a Suspense boundary on statically rendered
            pages; the fallback keeps the navbar from shifting. */}
        <Suspense fallback={<div className="h-9 rounded-book border-2 border-ink/15 bg-paper" />}>
          <SearchBox path="/search" size="sm" minLengthToLeave={2} label="সাইটে খুঁজুন" placeholder="খুঁজুন…" />
        </Suspense>
      </div>
    </>
  );
}

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b-2 border-ink/10 bg-paper-dark">
      {/* Wraps at phone width: the wordmark is pinned (shrink-0 +
          whitespace-nowrap) so the nav links drop to a second line instead of
          the wordmark breaking mid-name. Above sm everything sits on one line
          with the original gap-5 spacing. */}
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="shrink-0 whitespace-nowrap font-display text-2xl text-cloth">
          বই মহল
        </Link>

        <NavSearch />

        <nav className="flex w-full flex-wrap items-center justify-start gap-x-3 gap-y-2 whitespace-nowrap font-body text-sm font-semibold text-ink sm:w-auto sm:justify-end sm:gap-x-5">
          <Link href="/" className="hover:text-cloth">
            হোম
          </Link>
          <Link href="/categories" className="hover:text-cloth">
            বিভাগ
          </Link>
          <Link href="/marketplace" className="hover:text-cloth">
            বিনিময়
          </Link>
          <Link href="/requests" className="hover:text-cloth">
            অনুরোধ
          </Link>
          <Link href="/library" className="hover:text-cloth">
            লাইব্রেরি
          </Link>

          {status === "authenticated" && session?.user ? (
            <>
              <Link href="/messages" className="flex items-center hover:text-cloth">
                বার্তা
                <UnreadBadge />
              </Link>
              <Link href="/profile" className="hover:text-cloth">
                প্রোফাইল
              </Link>
              {session.user.role === "ADMIN" && (
                <>
                  <Link href="/admin/reports" className="hover:text-cloth">
                    রিপোর্ট
                  </Link>
                  <Link href="/admin/books" className="hover:text-cloth">
                    ফাইল
                  </Link>
                  <Link href="/admin/users" className="hover:text-cloth">
                    ব্যবহারকারী
                  </Link>
                </>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-book border-2 border-ink/20 px-3 py-1.5 hover:border-ink/40"
              >
                লগ আউট
              </button>
            </>
          ) : status === "loading" ? (
            <span className="text-ink/70">...</span>
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
