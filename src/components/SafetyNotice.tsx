import Link from "next/link";

export default function SafetyNotice() {
  return (
    <div className="rounded-book border-2 border-turmeric/40 bg-turmeric/10 p-5">
      <h3 className="font-display text-lg text-ink">নিরাপদে বই আদান-প্রদান করুন</h3>
      <ul className="mt-3 flex flex-col gap-2 font-body text-sm text-ink/80">
        <li>পরিচিত ও জনবহুল, ভালো আলোকিত জায়গায় দেখা করুন — যেমন লাইব্রেরি বা ক্যাফে।</li>
        <li>বইটি ভালোভাবে দেখে-বুঝে নেওয়ার আগে টাকা দেবেন না।</li>
        <li>সম্ভব হলে সঙ্গে একজন বন্ধু নিয়ে যান, অথবা কাউকে জানিয়ে যান কোথায় যাচ্ছেন।</li>
        <li>কোনো কিছু ঠিক মনে না হলে নিজের অনুভূতিকে বিশ্বাস করুন এবং পিছিয়ে আসতে দ্বিধা করবেন না।</li>
      </ul>
      <p className="mt-3 font-body text-sm text-ink/70">
        বিস্তারিত পড়ুন{" "}
        <Link href="/guidelines" className="font-semibold text-cloth hover:underline">
          নীতিমালার নিরাপত্তা অংশে
        </Link>
        । জরুরি অবস্থায় আগে পুলিশে ফোন করুন — ৯৯৯।
      </p>
    </div>
  );
}
