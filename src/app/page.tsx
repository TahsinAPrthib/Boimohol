import { Suspense } from "react";
import { getSessionUserId } from "@/lib/authz";
import HomeHero from "@/components/HomeHero";
import HomeSections from "@/components/HomeSections";
import { HomeSectionsSkeleton } from "@/components/Skeletons";

// Rendered per request now (it reads the session, for the hero's buttons and
// to drop blocked sellers' listings). The hero needs no database, so it is
// sent at once; the activity sections stream in behind a skeleton and can
// never hold up the first paint, even while Neon is waking.
export default async function HomePage() {
  const viewerId = await getSessionUserId();

  return (
    <>
      <HomeHero isLoggedIn={viewerId !== null} />
      <Suspense fallback={<HomeSectionsSkeleton />}>
        <HomeSections viewerId={viewerId} />
      </Suspense>
    </>
  );
}
