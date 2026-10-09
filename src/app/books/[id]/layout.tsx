import { notFound } from "next/navigation";
import { loadBook } from "@/lib/loaders";

// Above this route's loading skeleton, so a missing book is a real 404.
export default async function BookLayout(props: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  if (!(await loadBook(id))) notFound();
  return props.children;
}
