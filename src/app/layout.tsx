import type { Metadata, Viewport } from "next";
import { Tiro_Bangla, Hind_Siliguri } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { UnreadCountProvider } from "@/components/UnreadBadge";
import { HideWhenFullScreen, PhoneTabBar, PhoneTopBar } from "@/components/PhoneShell";
import CoverTransition from "@/components/CoverTransition";
import SiteAnalytics from "@/components/SiteAnalytics";
import { THEME_COLOR, THEME_SCRIPT } from "@/lib/theme";
import { siteShareMetadata, siteUrl } from "@/lib/share";
import "./globals.css";

const tiroBangla = Tiro_Bangla({
  subsets: ["bengali"],
  weight: "400",
  variable: "--font-tiro",
  display: "swap",
});

// Only the weights in use: 400 body, 600 font-semibold, 700 for <strong>.
// Each extra weight is another ~40 KB file preloaded on every page, ahead of
// the hero image.
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});

export const metadata: Metadata = {
  // Link previews need absolute addresses (src/lib/share.ts).
  metadataBase: siteUrl(),
  title: "বই মহল — Boi Mohol",
  description: "বাংলা বই খুঁজে নেওয়া, পড়া আর পর্যালোচনার জন্য একটি জায়গা।",
  // The preview every page shows unless it has its own (books do).
  ...siteShareMetadata,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  // Opened from the home screen on an iPhone, full-screen like the
  // installed app on Android (manifest.json).
  appleWebApp: { capable: true, title: "বই মহল", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The browser's bar follows the device's palette; a palette chosen on the
  // site overrides both tags (src/lib/theme.ts).
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR.dark },
  ],
  // The page runs under the notch and the home indicator; the phone bars pad
  // themselves with env(safe-area-inset-*).
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: THEME_SCRIPT sets data-theme on <html> before
    // React hydrates, on purpose.
    <html lang="bn" className={`${tiroBangla.variable} ${hindSiliguri.variable}`} suppressHydrationWarning>
      <head>
        {/* A day or night palette chosen on the site, applied before the
            first paint so the page never flashes the other one. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      {/* Column layout so the footer settles at the bottom on short pages
          instead of floating up under the content. */}
      <body className="flex min-h-screen flex-col font-body">
        <CoverTransition />
        <SessionProvider>
          <UnreadCountProvider>
            {/* Phones and small tablets get the app layout (PhoneShell);
                from lg up, the navbar as it always was. */}
            <PhoneTopBar />
            <div className="hidden lg:contents">
              <Navbar />
            </div>
            <main className="flex-1">{children}</main>
            <HideWhenFullScreen>
              <Footer />
            </HideWhenFullScreen>
            <PhoneTabBar />
          </UnreadCountProvider>
        </SessionProvider>
        <SiteAnalytics />
      </body>
    </html>
  );
}
