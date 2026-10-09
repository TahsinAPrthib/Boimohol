import Link from "next/link";
import HeroVideo from "@/components/HeroVideo";

// Full-width hero. The <picture> is the poster frame and is what phones see:
// a 3:4 crop for narrow screens (~6 KB), the video's own first frame from
// 768px up. It is the page's largest paint, so it loads eagerly with high
// priority; the video (wide screens only) fades in on top of it.
export default function HomeHero({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <picture>
        <source
          media="(min-width: 768px)"
          type="image/webp"
          srcSet="/media/hero-shelf-v2-1280.webp 1280w, /media/hero-shelf-v2-1920.webp 1920w"
          sizes="100vw"
        />
        <img
          src="/media/hero-shelf-v2-portrait.webp"
          width={600}
          height={800}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
      </picture>
      <HeroVideo className="absolute inset-0 z-[1] h-full w-full object-cover" />

      {/* Darkens toward where the text sits (see .hero-scrim). */}
      <div aria-hidden="true" className="hero-scrim absolute inset-0 z-[2]" />

      <div className="relative z-[3] mx-auto flex min-h-[27rem] max-w-5xl flex-col justify-end px-4 pb-10 pt-28 sm:min-h-[31rem] md:min-h-[34rem] md:justify-center md:pb-16 md:pt-16">
        <h1 className="font-display text-5xl leading-tight text-paper sm:text-6xl">বই মহল</h1>
        <p className="mt-4 max-w-xl font-body text-lg leading-relaxed text-paper/90">
          বাংলা বই খুঁজে নেওয়া, পড়া আর পর্যালোচনা লেখার একটা জায়গা। প্রতিটি বিভাগে নতুনদের জন্য একটি
          &ldquo;শুরু করুন এখান থেকে&rdquo; বইও বেছে দেওয়া আছে।
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {isLoggedIn ? (
            <>
              <Link href="/marketplace" className="btn-hero-primary">
                বিনিময় দেখুন
              </Link>
              <Link href="/profile" className="btn-hero-secondary">
                আমার বইতাক
              </Link>
            </>
          ) : (
            <>
              <Link href="/register" className="btn-hero-primary">
                সাইন আপ
              </Link>
              <Link href="/login" className="btn-hero-secondary">
                লগইন
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
