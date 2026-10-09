import type { Metadata, Viewport } from "next";
import { Tiro_Bangla, Hind_Siliguri } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  title: "বই মহল — Boi Mohol",
  description: "বাংলা বই খুঁজে নেওয়া, পড়া আর পর্যালোচনার জন্য একটি জায়গা।",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#253F54",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={`${tiroBangla.variable} ${hindSiliguri.variable}`}>
      {/* Column layout so the footer settles at the bottom on short pages
          instead of floating up under the content. */}
      <body className="flex min-h-screen flex-col font-body">
        <SessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
