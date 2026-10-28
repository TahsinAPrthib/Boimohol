import { notFound } from "next/navigation";
import BookCover from "@/components/BookCover";
import { bnDigits, DIRECTIONS, firstLineOf, loadBooks, SHELF, TODAY, type Direction, type ShownBook } from "../data";

// Design exploration: the home page's first screen in one of three
// directions. ?theme=night for the night palette; ?vt=slow slows the cover's
// transition to the book page (for screenshots of it).

const MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const today = () => {
  const d = new Date();
  return `${bnDigits(d.getDate())} ${MONTHS[d.getMonth()]}`;
};
const cover = (b: ShownBook, context: "card" | "detail" | "small", priority = false) => (
  <BookCover
    bookId={b.id}
    categorySlug={b.category.slug}
    title={b.title}
    titleBangla={b.titleBangla}
    author={b.author}
    colorKey={b.category.colorKey}
    coverPublicId={b.coverPublicId}
    context={context}
    priority={priority}
  />
);

export default async function DesignHome(props: { params: Promise<{ dir: string }>; searchParams: Promise<{ theme?: string; vt?: string }> }) {
  const { dir } = await props.params;
  const { theme, vt } = await props.searchParams;
  if (!DIRECTIONS.includes(dir as Direction)) notFound();
  const direction = dir as Direction;
  const [book] = await loadBooks([TODAY[direction]]);
  const night = theme === "night" ? { "data-night": "" } : {};
  const bookHref = `/design/${direction}/book/${book.id}${theme === "night" ? "?theme=night" : ""}${vt === "slow" ? `${theme === "night" ? "&" : "?"}vt=slow` : ""}`;
  const name = book.titleBangla || book.title;

  if (direction === "shelf") {
    const shelf = await loadBooks(SHELF);
    return (
      <div className="dl" {...night}>
        <section className="dl-wrap a-hero">
          <div className="a-stage">
            <div className="a-shelf" aria-hidden="true">
              <div className="a-track">
                {[...shelf, ...shelf].map((b, i) => (
                  <div key={`${b.id}-${i}`}>{cover(b, "small")}</div>
                ))}
              </div>
              <div className="a-board" />
            </div>
            <span className="a-tag">আজকের বই · {today()}</span>
            <a href={bookHref} className="a-today dl-vt-cover" aria-label={`${name}, বইয়ের পাতা`}>
              {cover(book, "detail", true)}
            </a>
          </div>
          <div>
            <h1 className="a-title">{name}</h1>
            <p className="a-author">{book.author}</p>
            <p className="a-blurb">{book.description}</p>
            <div className="dl-actions">
              <a href={bookHref} className="dl-btn">
                আজকের বইটি পড়ুন
              </a>
              <a href="/library" className="dl-btn-ghost">
                লাইব্রেরি ঘুরে দেখুন
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (direction === "line") {
    const line = firstLineOf(book.id)!;
    return (
      <div className="dl" {...night}>
        <section className="dl-wrap b-hero">
          <p className="dl-eyebrow">আজকের প্রথম লাইন · {today()}</p>
          <blockquote className="b-line">
            <span className="b-q" aria-hidden="true">
              “
            </span>
            <span className="b-line-text">{line.line}</span>
          </blockquote>
          <a href={bookHref} className="b-book">
            <span className="dl-vt-cover">{cover(book, "small", true)}</span>
            <span>
              <strong>{name}</strong>
              <span className="b-who">{book.author}</span>
              <span className="b-go">প্রথম পাতা থেকে পড়ুন →</span>
            </span>
          </a>
          <p className="b-note">প্রতিদিন একটি বইয়ের প্রথম লাইন, আর বইটি পুরোটাই বিনামূল্যে পড়ার সুযোগ।</p>
          <div className="dl-actions">
            <a href="/library" className="dl-btn">
              বিনামূল্যে পড়ুন
            </a>
            <a href="/search" className="dl-btn-ghost">
              বই খুঁজুন
            </a>
          </div>
        </section>
      </div>
    );
  }

  // The catalogue card. Library cards file the author surname first.
  const parts = book.author.split(/\s+/);
  const filed = parts.length > 1 ? `${parts[parts.length - 1]}, ${parts.slice(0, -1).join(" ")}` : book.author;
  const line = firstLineOf(book.id);
  return (
    <div className="dl" {...night}>
      <section className="dl-wrap c-hero">
        <div className="c-drawer">
          <span className="c-card c-back two" aria-hidden="true" />
          <span className="c-card c-back one" aria-hidden="true" />
          <a href={bookHref} className="c-card c-front">
            <span className="c-head">
              <span>বিভাগ · {book.category.nameBangla}</span>
              <span>আজকের কার্ড · {today()}</span>
            </span>
            <p className="c-author">
              {filed}
              {book.authorDeathYear ? ` · মৃত্যু ${bnDigits(book.authorDeathYear)}` : ""}
            </p>
            <h1 className="c-title">{name}</h1>
            {line && <p className="c-line">প্রথম লাইন: “{line.line}”</p>}
            <span className="c-clip" aria-hidden="true" />
            <span className="c-photo dl-vt-cover">{cover(book, "small", true)}</span>
            <span className="c-stamp" aria-hidden="true">
              বিনামূল্যে
              <small>পাবলিক ডোমেইন</small>
            </span>
            <span className="c-hole" aria-hidden="true" />
          </a>
          <span className="c-front-label" aria-hidden="true">
            ক — ঙ
          </span>
        </div>
        <div className="c-copy">
          <h2>এক ড্রয়ার ভরা বই, সবগুলো বিনামূল্যে</h2>
          <p>প্রতিদিন ক্যাটালগ থেকে একটি কার্ড। কপিরাইট পেরোনো বাংলা বই, পড়ুন এখানেই বা বিশ্বস্ত সাইটে।</p>
          <div className="dl-actions">
            <a href="/library" className="dl-btn">
              বিনামূল্যে পড়ুন
            </a>
            <a href="/search" className="dl-btn-ghost">
              বই খুঁজুন
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
