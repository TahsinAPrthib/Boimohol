import type { Metadata } from "next";
import "./design.css";

// Design exploration only: not linked from the site, not indexed.
export const metadata: Metadata = { title: "নকশা — বই মহল", robots: { index: false, follow: false } };

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return children;
}
