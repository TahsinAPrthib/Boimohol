import CoverPlaceholder from "@/components/CoverPlaceholder";

export default function BookCover({
  title,
  author,
  colorKey = "cloth",
  className = "",
}: {
  title: string;
  author: string;
  colorKey?: string;
  className?: string;
}) {
  return <CoverPlaceholder title={title} author={author} colorKey={colorKey} className={className} />;
}
