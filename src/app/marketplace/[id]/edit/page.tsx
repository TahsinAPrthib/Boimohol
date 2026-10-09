import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loadListing } from "@/lib/loaders";
import { withCallbackUrl } from "@/lib/safe-redirect";
import { updateListing } from "@/actions/listings";
import ListingForm from "@/components/ListingForm";

export default async function EditListingPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(withCallbackUrl("/login", `/marketplace/${params.id}/edit`));
  }

  const listing = await loadListing(params.id);
  if (!listing) notFound();
  if (listing.sellerId !== session.user.id) redirect("/marketplace/mine");

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const boundUpdateListing = updateListing.bind(null, listing.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 font-display text-3xl text-ink">তালিকাটি সম্পাদনা করুন</h1>

      <ListingForm
        action={boundUpdateListing}
        categories={categories.map((c) => ({ id: c.id, nameBangla: c.nameBangla }))}
        initialValues={{
          title: listing.title,
          author: listing.author,
          categoryId: listing.categoryId,
          description: listing.description,
          condition: listing.condition,
          listingType: listing.listingType,
          price: listing.price,
          location: listing.location,
        }}
        submitLabel="পরিবর্তন সংরক্ষণ করুন"
        pendingLabel="সংরক্ষণ হচ্ছে..."
        redirectTo="mine"
        existingPhotos={listing.photos}
      />
    </div>
  );
}
