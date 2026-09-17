import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/authz";
import { withCallbackUrl } from "@/lib/safe-redirect";
import RequestForm from "@/components/RequestForm";

export default async function NewRequestPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect(withCallbackUrl("/login", "/requests/new"));

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 font-display text-3xl text-ink">নতুন অনুরোধ</h1>
      <p className="mb-6 font-body text-ink/70">
        যে বইটি খুঁজছেন সেটির নাম ও লেখক লিখুন। কারও কাছে থাকলে তিনি সাড়া দেবেন।
      </p>

      <RequestForm categories={categories.map((c) => ({ id: c.id, nameBangla: c.nameBangla }))} />
    </div>
  );
}
