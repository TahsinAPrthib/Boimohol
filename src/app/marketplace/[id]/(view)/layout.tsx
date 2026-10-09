import { notFound } from "next/navigation";
import { loadListing } from "@/lib/loaders";

// Above this route's loading skeleton, so a missing listing is a real 404.
// (The view lives in a route group so its skeleton doesn't also wrap /edit.)
export default async function ListingLayout(props: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  if (!(await loadListing(id))) notFound();
  return props.children;
}
