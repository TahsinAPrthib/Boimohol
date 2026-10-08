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
- `Conversation`/`Message` models + `src/actions/messages.ts` — buyer↔seller chat about a listing, one thread per (listing, buyer), with participant-only authorization on every action
- `src/components/MessageThread.tsx` (4s polling, optimistic send, read receipts), `src/components/UnreadBadge.tsx` (20s polling), `src/components/ContactSellerButton.tsx`
- `src/app/messages/page.tsx` (inbox, newest activity first) and `src/app/messages/[conversationId]/page.tsx` (thread; 404s for non-participants rather than revealing the thread exists)

## Not built yet (next phase)
Explicitly out of scope for now: reporting/blocking, photo uploads on listings, wishlist, book requests, paid-PDF payments, social sharing, ads, ML recommendations.

### Chat implementation note
Messaging polls rather than using websockets — `MessageThread` every 4s while open, `UnreadBadge` every 20s. That's deliberate for this phase (no extra infrastructure); revisit if thread volume makes the polling load meaningful.

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

## Deployment (Vercel)

### Build configuration

`npm run build` runs `prisma migrate deploy && next build`, so schema changes
apply automatically on each deploy. `postinstall` runs `prisma generate`,
which matters because Vercel caches `node_modules` — without it the generated
client goes stale and drifts from the schema on rebuilds.

`npm run build:noMigrate` builds without touching the database, for CI
type-checks or a local build against a database you do not want migrated.

### Environment variables to set on the host

All of these must exist in the Vercel project settings before the first
deploy. Set them for Production, and for Preview if you use preview
deployments (point Preview at a **separate database** — migrations run on
every build).

| Variable | What it is for |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection the app uses at runtime. On Neon this is the `-pooler` hostname. **Append `&connect_timeout=15&pool_timeout=20`** — Neon sleeps when idle and takes ~5 s (sometimes over 10 s) to wake. Prisma's defaults give up at 5 s to connect and 10 s waiting for a pool connection, so without both the first request after a quiet spell can fail. |
| `DIRECT_URL` | **Unpooled** Postgres connection. Required — `prisma migrate deploy` runs during the build and a pooled connection (PgBouncer) cannot run migrations. On Neon, the same host without `-pooler`. Append `&connect_timeout=15` here too. |
| `NEXTAUTH_SECRET` | Signs session JWTs. Generate with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | The full production origin, e.g. `https://boimohol.vercel.app`. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name, used server-side when signing uploads. |
| `CLOUDINARY_API_KEY` | Cloudinary API key, used server-side when signing uploads. |
| `CLOUDINARY_API_SECRET` | Signs upload requests. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Same value as `CLOUDINARY_CLOUD_NAME`, read in the browser to build delivery URLs. |

### Which variables must NOT be public

Anything prefixed `NEXT_PUBLIC_` is **inlined into the JavaScript bundle and
readable by anyone**. Only one variable here is safe to expose:

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — safe. A cloud name already appears in
  every image URL the site serves.
- **Never** add the `NEXT_PUBLIC_` prefix to `CLOUDINARY_API_SECRET`,
  `CLOUDINARY_API_KEY`, `NEXTAUTH_SECRET`, `DATABASE_URL` or `DIRECT_URL`.
  Prefixing the API secret would publish the ability to sign uploads against
  your account to every visitor.

### Two values that must differ from development

- `NEXTAUTH_URL` must be the production domain. Left as `http://localhost:3000`
  (or a LAN address), login redirects break.
- `NEXTAUTH_SECRET` must be a **different value** from the one used locally. A
  secret that has been in a developer's `.env`, shell history or backups should
  not be the one signing production sessions; anyone holding it can forge a
  session token for any account.

### Seeding

`npm run seed` creates categories, books and starter picks. The demo account
(`demo@boimohol.test`) is **skipped when `NODE_ENV=production`** — a published
email and password would be an open door on a live site. Promote your own
account to admin instead, using the commented block at the end of
`prisma/seed.ts`.

### Before going live

- The policy pages (`/terms`, `/privacy`, `/guidelines`) are drafts that have
  not been reviewed by a lawyer, and `/terms` still carries a TODO for the
  governing-law clause.
- `/privacy` names Neon and Cloudinary as the only third parties. Adding
  analytics, ads or payments means updating that page in the same change.
