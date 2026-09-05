# বই মহল (Boi Mohol) — MVP

A Bangla-language book discovery and review platform.
Stack: Next.js 14 (App Router, TypeScript) + PostgreSQL + Prisma + NextAuth + Tailwind CSS.

## What's built (this phase)
- `prisma/schema.prisma` — MVP data model: User, Category, Book, BookFile, Review, StarterPick, ShelfItem
- `prisma/seed.ts` — 6 categories + real books (with honest `isPublicDomain` flags) + per-category "start here" picks + a demo user
- `tailwind.config.ts` — custom design tokens (paper/ink/cloth/oxblood/turmeric/sage palette; see file comments)
- `src/lib/prisma.ts` — Prisma client singleton
- `src/lib/auth.ts` + `src/app/api/auth/[...nextauth]/route.ts` — NextAuth Credentials login (bcrypt, JWT sessions)
- `src/types/next-auth.d.ts` — session type augmentation (adds `id`, `username`)
- `src/actions/auth.ts` — `registerUser` server action: zod validation, bcrypt hash, unique email/username checks, Bangla error messages
- `src/app/globals.css`, `src/app/layout.tsx` — Tailwind base styles, Tiro Bangla + Hind Siliguri fonts (via `next/font/google`, bengali subset), `SessionProvider` wrapper, PWA meta tags
- `src/components/SessionProvider.tsx` — client wrapper around NextAuth's `SessionProvider`
- `src/components/Navbar.tsx` — session-aware nav with Bangla labels (হোম, বিভাগ, প্রোফাইল, লগইন/লগ আউট, সাইন আপ)
- `src/app/register/page.tsx`, `src/app/login/page.tsx` — client auth forms
- `src/components/BookCover.tsx` — generated placeholder book cover, colored by `Category.colorKey`, shows title/author — no external cover art (see copyright note below)
- `src/app/page.tsx` — home page: hero + category grid (reads categories from the DB, links to `/categories/[slug]`)
- `public/manifest.json` + `public/icons/icon.svg` — PWA manifest and icon for installability
- `src/app/categories/[slug]/page.tsx` — books in a category, with the starter pick as the visual centerpiece
- `src/app/books/[id]/page.tsx`, `src/components/ReviewForm.tsx`, `src/actions/reviews.ts` — book detail + reviews (overall rating plus optional কাহিনি/লেখনশৈলী/গতি aspect ratings)
- `src/app/profile/page.tsx`, `src/components/ShelfButtons.tsx`, `src/actions/shelf.ts` — profile + "আমার বইতাক" shelf
- `src/lib/streak.ts` — daily reading-activity log + current-streak calculation, shown on the profile page
- `src/actions/profile.ts`, `src/components/YearlyGoalForm.tsx` — yearly reading goal with a progress bar on the profile page
- `Listing` model + `src/actions/listings.ts` — secondhand-book marketplace: create/edit a listing, seller-only status changes (AVAILABLE → RESERVED/COMPLETED/REMOVED)
- `src/components/CoverPlaceholder.tsx` — the generated cover/spine logic, shared by `BookCover` (catalog books) and the new `ListingCover` (freeform listings, which may have no category)
- `src/components/ListingCard.tsx`, `src/components/ListingForm.tsx`, `src/components/ListingStatusControls.tsx`, `src/components/SafetyNotice.tsx`
- `src/app/marketplace/page.tsx` (browse + category filter), `.../new/page.tsx`, `.../[id]/page.tsx`, `.../[id]/edit/page.tsx`, `.../mine/page.tsx`

## Not built yet (next phase)
Explicitly out of scope for the MVP entirely: in-app chat, reporting/blocking, photo uploads on listings, wishlist, book requests, paid-PDF payments, social sharing, ads, ML recommendations.

## Local setup
```bash
cp .env.example .env   # fill in DATABASE_URL, DIRECT_URL, and NEXTAUTH_SECRET
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```
Demo login after seeding: `demo@boimohol.test` / `demo1234`

### Neon database note
`prisma/schema.prisma` sets both `url` (pooled, `DATABASE_URL`) and `directUrl`
(unpooled, `DIRECT_URL`). `prisma migrate dev`/`db execute` need the direct
connection — Neon's pooled endpoint runs PgBouncer in transaction mode, which
doesn't support the advisory locks and shadow database Prisma Migrate needs.
The app itself (`src/lib/prisma.ts`) always uses the pooled `DATABASE_URL`.
If you're on Neon's free tier, the compute auto-suspends when idle and the
*first* connection after a while can fail or be slow to wake — retry once if
a `prisma migrate`/`db execute` command reports `P1001`.

## Icons note
`public/icons/icon.svg` is a lightweight vector placeholder so the app installs as a PWA today. Swap in real raster PNGs (192×192, 512×512, and a maskable 512×512) before shipping — iOS home-screen icons in particular expect a PNG `apple-touch-icon`.

## Copyright note (important)
- `BookFile.rightsVerified` must only be `true` for files that are genuinely
  public domain or explicitly licensed. Never mark a `PAID` file verified
  without an actual rights agreement.
- Seed data's `isPublicDomain` flags are accurate as of authoring — verify
  before adding new titles, especially anything by an author who died less
  than ~60 years ago.
- Book covers are never hotlinked from real cover art. `BookCover.tsx` always
  renders a generated placeholder.
