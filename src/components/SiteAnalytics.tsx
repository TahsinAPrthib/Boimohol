"use client";

import { Analytics } from "@vercel/analytics/next";
import { forAnalytics } from "@/lib/analytics";

// Visitor numbers (Vercel Web Analytics), on every page, signed in or not and
// in the installed app. What it is sent is trimmed by forAnalytics; a client
// component because that function can't be passed from the server layout.
export default function SiteAnalytics() {
  return <Analytics beforeSend={forAnalytics} />;
}
