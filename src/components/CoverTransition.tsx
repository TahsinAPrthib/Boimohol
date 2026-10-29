"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { bookPageId } from "@/lib/app-shell";

// The cover-to-book-page transition. A tap on any link that holds a cover
// ([data-cover]) and leads to a book page moves that cover into the book
// page's cover ([data-book-cover]) while the rest of the page fades across,
// using the browser's View Transitions API.
//
// One listener for the whole site, so every cover link gets it without
// knowing about it. Only the tapped cover is named, and only for the moment
// of the transition: a page can show the same book twice, and two elements
// with one name would cancel the transition.
//
// Without the API (Firefox and older browsers), with reduced motion, or for a
// modified click (new tab, etc.) nothing is intercepted: the link navigates
// as it always did. The book page's cover sits above its loading boundary, so
// it is usually in the prefetched part and arrives at once; if it hasn't
// arrived within WAIT_MS, the page changes without the morph.
const NAME = "book-cover";
const WAIT_MS = 1200;

function waitFor<T>(find: () => T | null, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const now = find();
    if (now) return resolve(now);
    const observer = new MutationObserver(() => {
      const found = find();
      if (found) done(found);
    });
    const timer = setTimeout(() => done(null), ms);
    function done(value: T | null) {
      observer.disconnect();
      clearTimeout(timer);
      resolve(value);
    }
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

const loaded = (img: HTMLImageElement | null) => Boolean(img && img.complete && img.naturalWidth > 0);

export default function CoverTransition() {
  const router = useRouter();

  useEffect(() => {
    if (typeof document.startViewTransition !== "function") return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

    function fly(cover: HTMLElement, id: string, href: string) {
      // The book page asks for a larger image than the thumbnail. If it
      // isn't there yet, the thumbnail (already loaded) is laid under it, so
      // the cover lands as itself rather than as the drawn placeholder.
      const thumb = cover.querySelector("img");
      const thumbSrc = loaded(thumb) ? thumb!.currentSrc : null;
      let target: HTMLElement | null = null;
      cover.style.viewTransitionName = NAME;

      const transition = document.startViewTransition(async () => {
        cover.style.viewTransitionName = "";
        router.push(href);
        target = await waitFor(() => document.querySelector<HTMLElement>(`[data-book-cover="${CSS.escape(id)}"]`), WAIT_MS);
        if (!target) return;
        const big = target.querySelector("img");
        if (big && !loaded(big) && thumbSrc) {
          const stand = document.createElement("img");
          stand.src = thumbSrc;
          stand.alt = "";
          stand.className = big.className;
          big.before(stand);
          big.addEventListener("load", () => stand.remove(), { once: true });
          await Promise.race([stand.decode().catch(() => {}), new Promise((r) => setTimeout(r, 300))]);
        }
        target.style.viewTransitionName = NAME;
      });
      transition.ready.catch(() => {});
      transition.finished
        .catch(() => {})
        .finally(() => {
          if (target) target.style.viewTransitionName = "";
        });
    }

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || calm.matches) return;
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const cover = link.querySelector<HTMLElement>("[data-cover]");
      if (!cover) return;
      const url = new URL(link.href);
      const id = url.origin === location.origin ? bookPageId(url.pathname) : null;
      if (!id || url.pathname === location.pathname) return;
      // The link's own handler (next/link) stands down for a prevented click.
      e.preventDefault();
      fly(cover, id, url.pathname + url.search + url.hash);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
