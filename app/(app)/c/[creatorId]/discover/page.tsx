import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoverTabs } from "@/components/app/discover/discover-tabs";
import { FeedResults, SavedResults } from "@/components/app/discover/feed-results";
import { FilterBar } from "@/components/app/discover/filter-bar";
import { MapTab } from "@/components/app/discover/map-tab";
import { parseDiscoverParams } from "@/components/app/discover/search-params";
import { TrackedRail } from "@/components/app/discover/tracked-rail";
import { PageHeader } from "@/components/app/page-header";
import { ReelGridSkeleton } from "@/components/app/states";
import { Skeleton } from "@/components/ui/skeleton";
import { requireCreator } from "@/lib/auth/session";
import { getUsage, listTrackedAccounts, savedCount } from "@/lib/db";

export const metadata: Metadata = { title: "Discover" };

export default async function DiscoverPage({
  params,
  searchParams,
}: PageProps<"/c/[creatorId]/discover">) {
  const { creatorId } = await params;
  const creator = await requireCreator(creatorId);
  const p = parseDiscoverParams(await searchParams);
  const base = `/c/${creatorId}/discover`;
  const [accounts, usage] = [await listTrackedAccounts(), getUsage()];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Discover"
          help="Reels from the accounts you track that beat their creator's usual views, refreshed daily. Open one to see why it worked and write your own version."
        />
        <DiscoverTabs base={base} params={p} savedCount={savedCount()} />
      </div>
      {p.tab === "map" ? (
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <MapTab creator={creator} base={base} params={p} />
        </Suspense>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_var(--rail-w)]">
          <div className="@container flex min-w-0 flex-col gap-5">
            {p.tab === "feed" ? <FilterBar params={p} pillars={creator.strategy.pillars} /> : null}
            <Suspense key={JSON.stringify(p)} fallback={<ReelGridSkeleton />}>
              {p.tab === "saved" ? (
                <SavedResults creatorId={creatorId} base={base} params={p} />
              ) : (
                <FeedResults creatorId={creatorId} base={base} params={p} />
              )}
            </Suspense>
          </div>
          <TrackedRail accounts={accounts} base={base} params={p} usage={usage} />
        </div>
      )}
    </div>
  );
}
