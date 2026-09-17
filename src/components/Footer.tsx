import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t-2 border-ink/10 bg-paper-dark">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-6">
        <p className="font-body text-xs text-ink/50">বই মহল — পাঠকদের জায়গা।</p>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 font-body text-xs text-ink/60">
          <Link href="/guidelines" className="hover:text-cloth hover:underline">
            নীতিমালা
          </Link>
          <Link href="/terms" className="hover:text-cloth hover:underline">
            ব্যবহারের শর্তাবলী
          </Link>
          <Link href="/privacy" className="hover:text-cloth hover:underline">
            গোপনীয়তা নীতি
          </Link>
        </nav>
      </div>
    </footer>
  );
}
