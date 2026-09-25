// DRAFT — starting point only. This text has NOT been reviewed by a lawyer.
// It should be reviewed by someone qualified before the platform accepts
// real users.
//
// This page is written to match what the app ACTUALLY does today (see
// prisma/schema.prisma). If you add analytics, ads, payments, email sending,
// or any other third party, update this page in the same change — otherwise
// it silently becomes untrue.
//
// Do not surface this note in the page content itself.

import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection, PolicyList } from "@/components/policy";

export const metadata: Metadata = {
  title: "গোপনীয়তা নীতি — বই মহল",
  description: "বই মহল কী কী তথ্য রাখে, কেন রাখে, আর কারা সেগুলো দেখতে পায়।",
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="গোপনীয়তা নীতি"
      intro="বই মহল আপনার কোন তথ্যগুলো রাখে, কেন রাখে, আর কারা সেগুলো দেখতে পায় — সব এখানে সোজাসুজি লেখা আছে।"
      updated="১৩ সেপ্টেম্বর, ২০২৬"
    >
      <PolicySection title="কী কী তথ্য রাখা হয়">
        <p>
          <strong className="font-semibold text-ink">অ্যাকাউন্টের তথ্য:</strong> আপনার নাম,
          ইউজারনেম, ইমেইল ঠিকানা, পাসওয়ার্ড, এবং অ্যাকাউন্ট খোলার তারিখ। চাইলে প্রোফাইলে নিজের
          সম্পর্কে দু-এক লাইন (বায়ো) যোগ করতে পারেন।
        </p>
        <p>
          <strong className="font-semibold text-ink">পড়াশোনার তথ্য:</strong> আপনার দেওয়া রেটিং ও
          পর্যালোচনা, বইতাকে রাখা বই ও সেগুলোর অবস্থা (পড়তে চাই / পড়ছি / পড়া শেষ), কোন দিন আপনি
          সক্রিয় ছিলেন তার তারিখ (পড়ার ধারাবাহিকতা হিসাব করার জন্য), এবং বছরের লক্ষ্য ঠিক করে
          থাকলে সেটি।
        </p>
        <p>
          <strong className="font-semibold text-ink">বিনিময়ের তালিকা:</strong> আপনার দেওয়া বইয়ের
          নাম, লেখক, বিবরণ, বইয়ের অবস্থা, ধরন (বিক্রি/বিনিময়/দান), দাম, এবং{" "}
          <strong className="font-semibold text-ink">আপনি যে এলাকার নাম লেখেন</strong>।
        </p>
        <p>
          <strong className="font-semibold text-ink">তালিকার ছবি:</strong> বিনিময়ের তালিকায় আপনি
          যে ছবিগুলো দেন। ছবিগুলো আমাদের নিজেদের সার্ভারে নয়, Cloudinary নামের একটি বাইরের সেবায়
          জমা থাকে — নিচে তৃতীয় পক্ষের অংশে এ নিয়ে বিস্তারিত আছে। তালিকা যেহেতু সবাই দেখতে পান,
          ছবিগুলোও সবাই দেখতে পাবেন।
        </p>
        <p>
          <strong className="font-semibold text-ink">বার্তা:</strong> অন্য ব্যবহারকারীর সাথে আপনার
          আলাপের সব বার্তা, কখন পাঠানো হয়েছে এবং কখন পড়া হয়েছে।
        </p>
        <p>
          <strong className="font-semibold text-ink">রিপোর্ট ও ব্লক:</strong> আপনি কাকে রিপোর্ট
          করেছেন, কী কারণে, সাথে লেখা বিবরণ, এবং আপনি কাকে ব্লক করেছেন।
        </p>
      </PolicySection>

      <PolicySection title="যা রাখা হয় না">
        <PolicyList
          items={[
            "আপনার পাসওয়ার্ড আমরা পড়তে পারি না। সেটি এনক্রিপ্ট করে (হ্যাশ করে) রাখা হয়, মূল পাসওয়ার্ড কোথাও জমা থাকে না।",
            "আমরা আপনার ফোন নম্বর, জাতীয় পরিচয়পত্র, ঠিকানা বা জন্মতারিখ চাই না।",
            "আমরা কোনো টাকা-পয়সার লেনদেন করি না, তাই কার্ড বা বিকাশ/নগদের কোনো তথ্য আমাদের কাছে নেই।",
            "আমরা আপনার অবস্থান (GPS) নিই না। তালিকায় যে এলাকার নাম দেখা যায়, সেটি আপনি নিজে হাতে লিখে দেন।",
          ]}
        />
        <p className="text-ink/60">
          প্রোফাইলে একটি “লোকেশন” ঘর তৈরি করা আছে, কিন্তু এই মুহূর্তে সেটি সাইটের কোথাও চাওয়া বা
          দেখানো হয় না।
        </p>
      </PolicySection>

      <PolicySection title="বার্তা নিয়ে স্পষ্ট কথা">
        <div className="rounded-book border-2 border-turmeric/50 bg-turmeric/10 p-4">
          <p className="text-ink/80">
            আপনার বার্তাগুলো আমাদের ডেটাবেজে সাধারণ লেখা হিসেবে জমা থাকে। এগুলো{" "}
            <strong className="font-semibold text-ink">এন্ড-টু-এন্ড এনক্রিপ্টেড নয়</strong>।
          </p>
        </div>
        <p>স্বাভাবিক অবস্থায় একটি আলাপ শুধু সেই দুজনই দেখতে পান, যাঁরা আলাপটি করছেন।</p>
        <p>
          তবে{" "}
          <strong className="font-semibold text-ink">
            কেউ কোনো বার্তা রিপোর্ট করলে সেই বার্তাটির লেখা এবং কে পাঠিয়েছেন তা অ্যাডমিন দেখতে
            পান
          </strong>{" "}
          — কারণ না দেখে হয়রানি বা প্রতারণার অভিযোগ যাচাই করা সম্ভব নয়। রিপোর্ট না করা হলে অ্যাডমিন
          সাইটের ভেতর দিয়ে আপনার আলাপ পড়তে পারেন না।
        </p>
        <p className="text-ink/60">
          এর বাইরে, ডেটাবেজে সরাসরি হাত দিতে পারেন এমন কারিগরি দায়িত্বে থাকা ব্যক্তিরা প্রযুক্তিগত
          ভাবে সব তথ্যই দেখতে সক্ষম। এটি প্রায় সব অনলাইন সেবার ক্ষেত্রেই সত্যি, তবু জেনে রাখা ভালো।
          তাই খুব ব্যক্তিগত বা স্পর্শকাতর কিছু বার্তায় না লেখাই ভালো।
        </p>
      </PolicySection>

      <PolicySection title="কারা কী দেখতে পান">
        <p>
          <strong className="font-semibold text-ink">সবাই দেখতে পান:</strong> আপনার ইউজারনেম, আপনার
          লেখা পর্যালোচনা ও রেটিং, আপনার দেওয়া বিনিময়ের তালিকা (এলাকার নাম ও ছবিসহ), এবং
          প্রোফাইলের বায়ো।
        </p>
        <p>
          <strong className="font-semibold text-ink">কেউ দেখতে পান না:</strong> আপনার পাসওয়ার্ড ও
          ইমেইল ঠিকানা। ইমেইল শুধু লগইনের জন্য ব্যবহৃত হয়, অন্য ব্যবহারকারীদের দেখানো হয় না।
        </p>
        <p>
          যেহেতু তালিকার এলাকার নাম সবাই দেখতে পান,{" "}
          <strong className="font-semibold text-ink">
            সেখানে বাসার পুরো ঠিকানা লিখবেন না
          </strong>{" "}
          — এলাকার নাম লিখলেই যথেষ্ট।
        </p>
      </PolicySection>

      <PolicySection title="এই তথ্য কী কাজে লাগে">
        <PolicyList
          items={[
            "আপনাকে লগইন করানো এবং আপনার অ্যাকাউন্ট চালু রাখা।",
            "আপনার বইতাক, পর্যালোচনা, পড়ার ধারাবাহিকতা ও বছরের লক্ষ্য দেখানো।",
            "আপনার তালিকা অন্য পাঠকদের সামনে তুলে ধরা, আর আগ্রহীদের সাথে আপনার যোগাযোগ করিয়ে দেওয়া।",
            "রিপোর্ট যাচাই করা এবং নীতিমালা ভাঙার ঘটনায় ব্যবস্থা নেওয়া।",
            "আপনি কাউকে ব্লক করলে সেই অনুযায়ী তার তালিকা ও বার্তা আটকে দেওয়া।",
          ]}
        />
        <p>আপনার তথ্য আমরা বিক্রি করি না, বিজ্ঞাপনদাতাদের কাছে দিই না।</p>
      </PolicySection>

      <PolicySection title="তৃতীয় পক্ষ">
        <p>এই মুহূর্তে বই মহল দুটি বাইরের সেবা ব্যবহার করে:</p>
        <PolicyList
          items={[
            <>
              <strong className="font-semibold text-ink">Neon</strong> — ডেটাবেজ হোস্টিং। ছবি ছাড়া
              উপরে বলা সব তথ্য Neon-এর সার্ভারে জমা থাকে।
            </>,
            <>
              <strong className="font-semibold text-ink">Cloudinary</strong> — ছবি রাখা ও দেখানোর
              সেবা। তালিকার ছবিগুলো আপনার ব্রাউজার থেকে সরাসরি Cloudinary-তে যায় — মাঝখানে আমাদের
              সার্ভারে আসে না। আমাদের ডেটাবেজে শুধু ছবিটির পরিচয়-সংকেত (public id) রাখা হয়, ছবিটি
              নিজে নয়।
            </>,
          ]}
        />
        <p>
          এর বাইরে কোনো অ্যানালিটিক্স, বিজ্ঞাপন নেটওয়ার্ক বা পেমেন্ট সেবা আমরা ব্যবহার করি না —
          কারণ সেগুলো এখনো যুক্তই করা হয়নি। ভবিষ্যতে এমন কিছু যোগ করা হলে এই পাতা হালনাগাদ করা হবে
          এবং “সর্বশেষ হালনাগাদ”-এর তারিখ বদলে যাবে।
        </p>
      </PolicySection>

      <PolicySection title="আপনার অধিকার">
        <PolicyList
          items={[
            "আপনার তথ্য ভুল থাকলে ঠিক করে নিতে পারেন — নাম, বায়ো, তালিকা বা পর্যালোচনা যেকোনো সময় সম্পাদনা করা যায়।",
            "নিজের পর্যালোচনা, তালিকা বা তালিকার ছবি মুছে ফেলতে পারেন। ছবি মুছলে সেটি Cloudinary থেকেও মুছে যায়, শুধু আমাদের ডেটাবেজ থেকে নয়।",
            "পুরো অ্যাকাউন্ট ও তথ্য মুছে ফেলার অনুরোধ করতে পারেন। অনুরোধ পেলে আমরা আপনার অ্যাকাউন্ট, পর্যালোচনা, বইতাক, তালিকা, ছবি ও বার্তা মুছে দেব।",
            "কোন কোন তথ্য আপনার সম্পর্কে রাখা আছে তা জানতে চাইতে পারেন।",
          ]}
        />
        <p className="text-ink/60">
          আলাপের ক্ষেত্রে একটু জটিলতা আছে: একটি বার্তা দুজনের আলাপের অংশ, তাই আপনার অ্যাকাউন্ট মুছে
          ফেললেও অন্য পক্ষের কাছে আলাপের কিছু অংশ থেকে যেতে পারে।
        </p>
      </PolicySection>

      <PolicySection title="তথ্য কতদিন রাখা হয়">
        <p>
          আপনার অ্যাকাউন্ট চালু থাকা পর্যন্ত তথ্য রাখা হয়। অ্যাকাউন্ট মুছে ফেলার অনুরোধ করলে তথ্য
          মুছে ফেলা হয়, তবে ব্যাকআপ কপি থেকে পুরোপুরি মুছতে কিছুদিন সময় লাগতে পারে।
        </p>
      </PolicySection>

      <PolicySection title="যোগাযোগ">
        <p>
          তথ্য মুছে ফেলার অনুরোধ বা গোপনীয়তা নিয়ে যেকোনো প্রশ্নের জন্য ইমেইল করুন:{" "}
          <a
            href="mailto:tahsinaparthib1@gmail.com"
            className="font-semibold text-cloth hover:underline"
          >
            tahsinaparthib1@gmail.com
          </a>
        </p>
      </PolicySection>

      <PolicySection title="আরও পড়ুন">
        <p>
          <Link href="/guidelines" className="font-semibold text-cloth hover:underline">
            কমিউনিটি নীতিমালা
          </Link>{" "}
          ও{" "}
          <Link href="/terms" className="font-semibold text-cloth hover:underline">
            ব্যবহারের শর্তাবলী
          </Link>
          ।
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
