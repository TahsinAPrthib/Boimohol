import CoverPlaceholder from "@/components/CoverPlaceholder";

export default function ListingCover({
  title,
  author,
  colorKey = "cloth",
  className = "",
}: {
  title: string;
  author: string;
  colorKey?: string | null;
  className?: string;
}) {
  return (
    <CoverPlaceholder
      title={title}
      author={author}
      colorKey={colorKey ?? "cloth"}
      className={className}
    />
  );
}
