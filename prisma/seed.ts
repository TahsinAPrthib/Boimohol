import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { canBePublicDomain } from "../src/lib/public-domain";
import { bookSearchText } from "../src/lib/search";

const prisma = new PrismaClient();

// Category colorKey values map to the Tailwind palette in tailwind.config.ts
const categories = [
  {
    slug: "uponnash",
    name: "Fiction",
    nameBangla: "উপন্যাস",
    description: "সামাজিক ও পারিবারিক জীবনের গল্প নিয়ে লেখা উপন্যাস।",
    colorKey: "cloth",
  },
  {
    slug: "kobita",
    name: "Poetry",
    nameBangla: "কবিতা",
    description: "কবিতা ও কাব্যগ্রন্থ।",
    colorKey: "oxblood",
  },
  {
    slug: "thriller-rohosso",
    name: "Thriller & Mystery",
    nameBangla: "থ্রিলার ও রহস্য",
    description: "গোয়েন্দা কাহিনি, রহস্য ও রোমাঞ্চকর গল্প।",
    colorKey: "ink",
  },
  {
    slug: "biggan-kolpokahini",
    name: "Science Fiction",
    nameBangla: "বিজ্ঞান কল্পকাহিনী",
    description: "বিজ্ঞানভিত্তিক কল্পকাহিনী।",
    colorKey: "sage",
  },
  {
    slug: "atmounnoyon",
    name: "Self-help",
    nameBangla: "আত্ম-উন্নয়ন",
    description: "ব্যক্তিগত উন্নয়ন ও দক্ষতা বৃদ্ধির বই।",
    colorKey: "turmeric",
  },
  {
    slug: "itihash-jiboni",
    name: "History & Biography",
    nameBangla: "ইতিহাস ও জীবনী",
    description: "ইতিহাস ও জীবনীমূলক গ্রন্থ।",
    colorKey: "cloth-light",
  },
];

// Real, well-known books. Descriptions below are original one-line summaries
// written for this catalog, not copied jacket/blurb text.
// isPublicDomain follows the Bangladeshi rule in src/lib/public-domain.ts:
// protected until 60 years after the end of the year the author died, so in
// 2026 only authors who died in 1965 or earlier qualify. authorDeathYear is
// required here (null = living) so no book is added without checking it, and
// main() refuses to seed a flag the rule doesn't allow.
const booksByCategory: Record<
  string,
  Array<{
    title: string;
    titleBangla?: string;
    author: string;
    description: string;
    publishYear?: number;
    authorDeathYear: number | null;
    isPublicDomain?: boolean;
  }>
> = {
  uponnash: [
    {
      title: "Pather Panchali",
      titleBangla: "পথের পাঁচালী",
      author: "বিভূতিভূষণ বন্দ্যোপাধ্যায়",
      description:
        "গ্রামবাংলার প্রকৃতি এবং অপু-দুর্গার শৈশবকে ঘিরে বাংলা সাহিত্যের অন্যতম আলোচিত ধ্রুপদী উপন্যাস।",
      publishYear: 1929,
      authorDeathYear: 1950,
      isPublicDomain: true,
    },
    {
      title: "Shesher Kobita",
      titleBangla: "শেষের কবিতা",
      author: "রবীন্দ্রনাথ ঠাকুর",
      description: "প্রেম ও যুক্তির দ্বন্দ্ব নিয়ে রবীন্দ্রনাথের ভিন্নধর্মী এক উপন্যাস।",
      publishYear: 1929,
      authorDeathYear: 1941,
      isPublicDomain: true,
    },
    {
      title: "Devdas",
      titleBangla: "দেবদাস",
      author: "শরৎচন্দ্র চট্টোপাধ্যায়",
      description: "না-পাওয়া প্রেমের এক করুণ আখ্যান, বাংলা উপন্যাসের অন্যতম পরিচিত নাম।",
      publishYear: 1917,
      authorDeathYear: 1938,
      isPublicDomain: true,
    },
  ],
  kobita: [
    {
      title: "Sonar Tori",
      titleBangla: "সোনার তরী",
      author: "রবীন্দ্রনাথ ঠাকুর",
      description: "রবীন্দ্রনাথের অন্যতম বিখ্যাত কাব্যগ্রন্থ, শিরোনাম-কবিতাটির জন্য বিশেষভাবে পরিচিত।",
      publishYear: 1894,
      authorDeathYear: 1941,
      isPublicDomain: true,
    },
    {
      title: "Agnibina",
      titleBangla: "অগ্নিবীণা",
      author: "কাজী নজরুল ইসলাম",
      description: "নজরুলের প্রথম কাব্যগ্রন্থ, বিদ্রোহ ও প্রতিবাদের সুরে বাঁধা।",
      publishYear: 1922,
      authorDeathYear: 1976,
      isPublicDomain: false,
    },
  ],
  "thriller-rohosso": [
    {
      title: "Feluda Samagra (Prothom Khondo)",
      titleBangla: "ফেলুদা সমগ্র (প্রথম খণ্ড)",
      author: "সত্যজিৎ রায়",
      description: "গোয়েন্দা ফেলুদা ও তোপসের প্রথম দিকের অভিযানগুলোর সংকলন।",
      publishYear: 1965,
      authorDeathYear: 1992,
      isPublicDomain: false,
    },
    {
      title: "The Adventures of Sherlock Holmes",
      author: "Arthur Conan Doyle",
      description: "শার্লক হোমসের প্রথম ছোটগল্প সংকলন, গোয়েন্দা কাহিনির একটি ভিত্তি-গ্রন্থ।",
      publishYear: 1892,
      authorDeathYear: 1930,
      isPublicDomain: true,
    },
  ],
  "biggan-kolpokahini": [
    {
      title: "Copotronic Sukh Dukkho",
      titleBangla: "কপোট্রনিক সুখ দুঃখ",
      author: "মুহম্মদ জাফর ইকবাল",
      description: "রোবট আর মানুষের সম্পর্ক নিয়ে বাংলা বিজ্ঞান কল্পকাহিনীর একটি পরিচিত নাম।",
      publishYear: 1985,
      authorDeathYear: null, // living
      isPublicDomain: false,
    },
    {
      title: "The War of the Worlds",
      author: "H. G. Wells",
      description: "ভিনগ্রহী আক্রমণ নিয়ে লেখা বিজ্ঞান কল্পকাহিনীর একটি ভিত্তিপ্রস্তর উপন্যাস।",
      publishYear: 1898,
      authorDeathYear: 1946,
      isPublicDomain: true,
    },
  ],
  atmounnoyon: [
    {
      title: "Think and Grow Rich",
      author: "Napoleon Hill",
      description: "সাফল্যের মানসিকতা নিয়ে লেখা আত্ম-উন্নয়নমূলক বইয়ের জগতের একটি আলোচিত নাম।",
      publishYear: 1937,
      authorDeathYear: 1970,
      isPublicDomain: false,
    },
    {
      title: "How to Win Friends and Influence People",
      author: "Dale Carnegie",
      description: "মানুষের সাথে সম্পর্ক তৈরি ও যোগাযোগের দক্ষতা নিয়ে লেখা আত্ম-উন্নয়নমূলক বইয়ের একটি ক্লাসিক নাম।",
      publishYear: 1936,
      authorDeathYear: 1955,
      isPublicDomain: false,
    },
  ],
  "itihash-jiboni": [
    {
      title: "Oshomapto Attojiboni",
      titleBangla: "অসমাপ্ত আত্মজীবনী",
      author: "শেখ মুজিবুর রহমান",
      description: "বঙ্গবন্ধু শেখ মুজিবুর রহমানের নিজের হাতে লেখা আত্মজীবনী।",
      publishYear: 2012,
      authorDeathYear: 1975,
      isPublicDomain: false,
    },
    {
      title: "Karagarer Rojnamcha",
      titleBangla: "কারাগারের রোজনামচা",
      author: "শেখ মুজিবুর রহমান",
      description: "কারাবন্দি অবস্থায় লেখা বঙ্গবন্ধুর ব্যক্তিগত রোজনামচা, পরবর্তীতে গ্রন্থাকারে প্রকাশিত।",
      publishYear: 2017,
      authorDeathYear: 1975,
      isPublicDomain: false,
    },
  ],
};

// Which book in each category is the recommended "start here" pick, and why.
const starterNotes: Record<string, string> = {
  "Pather Panchali":
    "সহজ ভাষা আর চেনা গ্রামীণ প্রেক্ষাপট থাকায় উপন্যাসে নতুনদের জন্য এটি ভালো একটি শুরু।",
  "The Adventures of Sherlock Holmes":
    "প্রতিটি গল্প ছোট ও স্বয়ংসম্পূর্ণ, তাই থ্রিলার/রহস্যে একদম নতুন পাঠকের জন্য আদর্শ।",
  "The War of the Worlds":
    "বিজ্ঞান কল্পকাহিনীর ধ্রুপদী কাঠামো বোঝার জন্য এটি একটি ভালো প্রথম বই।",
  "Think and Grow Rich":
    "সহজবোধ্য ভাষা আর ব্যবহারিক উদাহরণ থাকায় আত্ম-উন্নয়ন বইয়ে এটি দিয়ে শুরু করা যায়।",
  "Sonar Tori": "রবীন্দ্রনাথের কবিতার জগতে ঢোকার জন্য এটি একটি সহজগম্য শুরু।",
  "Oshomapto Attojiboni":
    "সহজ ও গল্পের ঢঙে লেখা হওয়ায় ইতিহাসভিত্তিক বই পড়া শুরু করার জন্য এটি ভালো একটি নাম।",
};

async function main() {
  console.log("Seeding...");

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });

    const books = booksByCategory[cat.slug] ?? [];
    for (const b of books) {
      if (b.isPublicDomain && !canBePublicDomain(b.authorDeathYear)) {
        throw new Error(`seed: "${b.title}" is marked public domain but its author died in ${b.authorDeathYear ?? "an unknown year"}`);
      }
      const book = await prisma.book.upsert({
        where: { id: `${cat.slug}-${b.title}`.replace(/\s+/g, "-").toLowerCase() },
        update: {},
        create: {
          id: `${cat.slug}-${b.title}`.replace(/\s+/g, "-").toLowerCase(),
          title: b.title,
          titleBangla: b.titleBangla,
          author: b.author,
          description: b.description,
          publishYear: b.publishYear,
          authorDeathYear: b.authorDeathYear,
          isPublicDomain: b.isPublicDomain ?? false,
          categoryId: category.id,
          searchText: bookSearchText(b),
        },
      });

      // If it's the designated starter pick for its category, record it.
      const note = starterNotes[b.title];
      if (note) {
        await prisma.starterPick.upsert({
          where: { categoryId_bookId: { categoryId: category.id, bookId: book.id } },
          update: {},
          create: { categoryId: category.id, bookId: book.id, note, rank: 1 },
        });
      }

    }
  }

  // A demo reader account so you can log in immediately after seeding.
  // A published email and password is an open door on a live site, so the demo
  // account is development-only. Categories and books above seed unconditionally.
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    console.log("NODE_ENV=production — skipping the demo account.");
  } else {
    const demoPasswordHash = await bcrypt.hash("demo1234", 10);
    await prisma.user.upsert({
      where: { email: "demo@boimohol.test" },
      update: {},
      create: {
        name: "নতুন পাঠক",
        username: "demo_reader",
        email: "demo@boimohol.test",
        passwordHash: demoPasswordHash,
      },
    });
  }

  // --- Promoting yourself to admin (for testing the /admin/reports queue) ---
  // Uncomment, swap in your own email, and re-run `npm run seed`. Log out and
  // back in afterwards: role is baked into the session token at login, so an
  // existing session won't show the অ্যাডমিন nav link until you sign in again.
  //
  // await prisma.user.update({
  //   where: { email: "you@example.com" },
  //   data: { role: "ADMIN" },
  // });

  console.log(
    isProduction
      ? "Seed complete."
      : "Seed complete. Demo login: demo@boimohol.test / demo1234"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
