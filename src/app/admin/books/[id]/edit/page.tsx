import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/authz";
import { publicDomainCutoffYear } from "@/lib/public-domain";
import { updateBook } from "@/actions/admin-books";
import AdminBookForm from "@/components/AdminBookForm";

export default async function EditBookPage(props: { params: Promise<{ id: string }> }) {
  // 404 for non-admins, as on /admin/books. (No loading.tsx anywhere above this
  // route, so notFound() here still sends a real 404.)
  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  const { id } = await props.params;
  const [book, categories] = await Promise.all([
    prisma.book.findUnique({ where: { id }, include: { _count: { select: { files: true } } } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, nameBangla: true } }),
  ]);
  if (!book) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 font-display text-3xl text-ink">বই সম্পাদনা</h1>
      <p className="mb-6 border-b-2 border-ink/10 pb-6 font-body text-ink/60">{book.titleBangla || book.title}</p>
      <AdminBookForm
        action={updateBook.bind(null, book.id)}
        mode="edit"
        cutoffYear={publicDomainCutoffYear()}
        categories={categories}
        hasPdf={book._count.files > 0}
        initial={{
          title: book.title,
          titleBangla: book.titleBangla,
          author: book.author,
          categoryId: book.categoryId,
          description: book.description,
          language: book.language,
          publishYear: book.publishYear,
          authorDeathYear: book.authorDeathYear,
          isPublicDomain: book.isPublicDomain,
        }}
      />
    </div>
  );
}
