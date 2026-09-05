import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createListing } from "@/actions/listings";
import ListingForm from "@/components/ListingForm";
import SafetyNotice from "@/components/SafetyNotice";

export default async function NewListingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 font-display text-3xl text-ink">নতুন তালিকা যোগ করুন</h1>
      <p className="mb-6 font-body text-ink/70">
        আপনার বইয়ের তথ্য দিন — বিক্রি, বিনিময় বা দানের জন্য।
      </p>

      <div className="mb-6">
        <SafetyNotice />
      </div>

      <ListingForm
        action={createListing}
        categories={categories.map((c) => ({ id: c.id, nameBangla: c.nameBangla }))}
        submitLabel="তালিকা প্রকাশ করুন"
        pendingLabel="প্রকাশ হচ্ছে..."
        redirectTo="listing"
      />
    </div>
  );
}
