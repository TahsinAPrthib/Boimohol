import { Suspense } from "react";
import { getSessionUserId } from "@/lib/authz";
import HomeShelf from "@/components/HomeShelf";
import HomeSections from "@/components/HomeSections";
import { HomeSectionsSkeleton } from "@/components/Skeletons";

// Rendered per request (it reads the session, for the first screen's buttons
// and to drop blocked sellers' listings). The first screen's book of the day
// comes from the data cache, so it is sent at once; the activity sections
// stream in behind a skeleton and can never hold up the first paint, even
// while Neon is waking.
export default async function HomePage() {
  const viewerId = await getSessionUserId();

  return (
    <>
      <HomeShelf isLoggedIn={viewerId !== null} />
      <Suspense fallback={<HomeSectionsSkeleton />}>
        <HomeSections viewerId={viewerId} />
      </Suspense>
    </>
  );
}
