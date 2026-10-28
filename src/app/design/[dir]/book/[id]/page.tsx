import { notFound } from "next/navigation";
import BookCover from "@/components/BookCover";
import { bnDigits, DIRECTIONS, firstLineOf, loadBooks, SHELF, type Direction, type ShownBook } from "../../../data";

// Design exploration: the book page in one of three directions. The cover
// carries view-transition-name dl-cover, so it flies here from the home page.

const SOURCE_NAME: Record<string, string> = { WIKISOURCE: "উইকিসংকলন", GUTENBERG: "প্রজেক্ট গুটেনবার্গ", ARCHIVE: "ইন্টারনেট আর্কাইভ" };
const cover = (b: ShownBook, context: "card" | "detail" | "small") => (
  <BookCover
    bookId={b.id}
    categorySlug={b.category.slug}
    title={b.title}
    titleBangla={b.titleBangla}
    author={b.author}
    colorKey={b.category.colorKey}
    coverPublicId={b.coverPublicId}
    context={context}
    priority
  />
);

function Facts({ book }: { book: ShownBook }) {
  const source = book.sources[0];
  return (
    <dl className="dl-facts">
      <dt>বিভাগ</dt>
      <dd>{book.category.nameBangla}</dd>
      <dt>ভাষা</dt>
      <dd>{book.language === "bn" ? "বাংলা" : book.language}</dd>
      {book.authorDeathYear !== null && (
        <>
          <dt>লেখকের মৃত্যু</dt>
          <dd>{bnDigits(book.authorDeathYear)} সালে · কপিরাইটের মেয়াদ শেষ</dd>
        </>
      )}
      {source && (
        <>
          <dt>পুরো বই</dt>
          <dd>{SOURCE_NAME[source.kind] ?? source.kind}</dd>
        </>
      )}
    </dl>
  );
}

function Actions({ book }: { book: ShownBook }) {
  const source = book.sources[0];
  return (
    <div className="dl-actions">
      <a href={source?.kind === "WIKISOURCE" ? `/books/${book.id}/read` : `/books/${book.id}`} className="dl-btn">
        বিনামূল্যে পড়ুন
      </a>
      <a href="#" className="dl-btn-ghost">
        আমার তাকে রাখুন
      </a>
    </div>
  );
}

export default async function DesignBook(props: { params: Promise<{ dir: string; id: string }>; searchParams: Promise<{ theme?: string; vt?: string }> }) {
  const { dir, id } = await props.params;
  const { theme, vt } = await props.searchParams;
  if (!DIRECTIONS.includes(dir as Direction)) notFound();
  const [book] = await loadBooks([id]);
  if (!book) notFound();
  const night = theme === "night" ? { "data-night": "" } : {};
  const name = book.titleBangla || book.title;
  const slow = vt === "slow" && (
    <style>{`::view-transition-group(dl-cover){animation-duration:3200ms} ::view-transition-old(root),::view-transition-new(root){animation-duration:1600ms}`}</style>
  );

  if (dir === "shelf") {
    const shelf = await loadBooks(SHELF.slice(0, 8));
    return (
      <div className="dl" {...night}>
        {slow}
        <section className="dl-wrap a-book">
          <div className="a-book-stage">
            <div className="a-shelf" aria-hidden="true">
              <div className="a-track" style={{ animation: "none" }}>
                {shelf.map((b) => (
                  <div key={b.id}>{cover(b, "small")}</div>
                ))}
              </div>
              <div className="a-board" />
            </div>
            <div className="a-today dl-vt-cover">{cover(book, "detail")}</div>
          </div>
          <div>
            <p className="dl-eyebrow">{book.category.nameBangla}</p>
            <h1>{name}</h1>
            <p className="a-author">{book.author}</p>
            <p className="a-blurb">{book.description}</p>
            <Actions book={book} />
            <div style={{ marginTop: 24 }}>
              <Facts book={book} />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (dir === "line") {
    const line = firstLineOf(book.id);
    return (
      <div className="dl" {...night}>
        {slow}
        <section className="dl-wrap b-page">
          {line && (
            <>
              <p className="dl-eyebrow">প্রথম লাইন · {line.chapter}</p>
              <blockquote className="b-epigraph">“{line.line}”</blockquote>
            </>
          )}
          <div className="b-head">
            <div className="dl-vt-cover">{cover(book, "detail")}</div>
            <div className="b-title">
              <h1>{name}</h1>
              <p style={{ margin: 0, color: "var(--ink-2)" }}>{book.author}</p>
            </div>
            <div className="b-body">
              <p style={{ margin: 0, color: "var(--ink-2)", maxWidth: "52ch" }}>{book.description}</p>
              <Actions book={book} />
              <Facts book={book} />
            </div>
          </div>
        </section>
      </div>
    );
  }

  const parts = book.author.split(/\s+/);
  const filed = parts.length > 1 ? `${parts[parts.length - 1]}, ${parts.slice(0, -1).join(" ")}` : book.author;
  const source = book.sources[0];
  const line = firstLineOf(book.id);
  return (
    <div className="dl" {...night}>
      {slow}
      <section className="dl-wrap c-page">
        <div className="c-card c-front">
          <span className="c-clip" aria-hidden="true" />
          <div className="c-photo dl-vt-cover">{cover(book, "detail")}</div>
          <div>
            <span className="c-head">
              <span>বিভাগ · {book.category.nameBangla}</span>
            </span>
            <h1>{name}</h1>
            <dl className="c-fields">
              <dt>লেখক</dt>
              <dd>{filed}</dd>
              {book.authorDeathYear !== null && (
                <>
                  <dt>মৃত্যু</dt>
                  <dd>{bnDigits(book.authorDeathYear)}</dd>
                </>
              )}
              <dt>ভাষা</dt>
              <dd>{book.language === "bn" ? "বাংলা" : book.language}</dd>
              {line && (
                <>
                  <dt>প্রথম লাইন</dt>
                  <dd>“{line.line}”</dd>
                </>
              )}
              {source && (
                <>
                  <dt>পুরো বই</dt>
                  <dd>{SOURCE_NAME[source.kind] ?? source.kind}</dd>
                </>
              )}
            </dl>
            <p style={{ lineHeight: "28px", margin: "0 0 18px", color: "var(--ink-2)", maxWidth: "52ch" }}>{book.description}</p>
            <Actions book={book} />
          </div>
          <span className="c-stamp" aria-hidden="true">
            বিনামূল্যে
            <small>পাবলিক ডোমেইন</small>
          </span>
        </div>
      </section>
    </div>
  );
}
