import CoverPlaceholder from "@/components/CoverPlaceholder";

// The cover shows the Bangla title when the book has one, like the text
// under it on cards and the book page; English-only books keep their title.
export default function BookCover({
  title,
  titleBangla,
  author,
  colorKey = "cloth",
  className = "",
}: {
  title: string;
  titleBangla?: string | null;
  author: string;
  colorKey?: string;
  className?: string;
}) {
  return (
    <CoverPlaceholder title={titleBangla?.trim() || title} author={author} colorKey={colorKey} className={className} />
  );
}
