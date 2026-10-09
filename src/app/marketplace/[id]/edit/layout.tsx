import { notFound, redirect } from "next/navigation";
import { requireUserId } from "@/lib/authz";
import { loadListing } from "@/lib/loaders";

// The edit page's checks, in its order, above its loading skeleton: signed
// out -> 307 to login, no such listing -> 404, not the seller -> 307 to
// "my listings".
export default async function EditListingLayout(props: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const userId = await requireUserId(`/marketplace/${id}/edit`);
  const listing = await loadListing(id);
  if (!listing) notFound();
  if (listing.sellerId !== userId) redirect("/marketplace/mine");
  return props.children;
}
