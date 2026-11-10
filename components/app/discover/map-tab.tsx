import { computeBaseline } from "@/lib/outliers";
import { now } from "@/lib/clock";
import { getMockProvider } from "@/lib/data";
import { getOwnReels, listSuggestedAccounts, listTrackedAccounts } from "@/lib/db";
import type { Creator } from "@/lib/db/types";
import { compactNumber } from "@/lib/format";
import { AccountRow } from "../ig/account";
import { AddSuggestedSingle } from "./add-suggested-single";
import { CreatorMap, type MapPoint } from "./creator-map";
import { discoverHref, type DiscoverParams } from "./search-params";

export async function MapTab({
  creator,
  base,
  params,
}: {
  creator: Creator;
  base: string;
  params: DiscoverParams;
}) {
  const [tracked, suggested, own, profile] = await Promise.all([
    listTrackedAccounts(),
    listSuggestedAccounts(6),
    getOwnReels({ sort: "newest", pillar: null }),
    getMockProvider().getProfile(creator.igHandle),
  ]);
  const at = now();
  const ownOutliers = own.reels.filter(
    (r) => r.isOutlier && at.getTime() - new Date(r.postedAt).getTime() <= 30 * 86_400_000,
  ).length;
  const points: MapPoint[] = [
    ...tracked.map((a) => ({
      ...a.profile,
      usualViews: a.baseline.usualViews,
      outliers30d: a.outliers30d,
      kind: "tracked" as const,
    })),
    ...suggested.map((a) => ({
      ...a.profile,
      usualViews: a.baseline.usualViews,
      outliers30d: a.outliers30d,
      kind: "suggested" as const,
    })),
    {
      handle: creator.igHandle,
      name: creator.displayName,
      avatarUrl: creator.avatarUrl,
      followers: profile?.followers ?? 1000,
      usualViews: computeBaseline(own.reels, { at }).usualViews,
      outliers30d: ownOutliers,
      kind: "you",
    },
  ];
  const feedHrefFor = Object.fromEntries([
    ...tracked.map((a) => [
      a.profile.handle,
      discoverHref(base, params, { tab: "feed", account: a.profile.handle }),
    ]),
    [creator.igHandle, `/c/${creator.id}/your-reels`],
  ]);

  return (
    <div className="flex flex-col gap-8">
      <CreatorMap points={points} feedHrefFor={feedHrefFor} />
      <section aria-labelledby="suggested-title" className="flex flex-col gap-3">
        <h2 id="suggested-title" className="type-section">
          Suggested accounts to track
        </h2>
        {suggested.length === 0 ? (
          <p className="type-body-sm text-muted">
            You&apos;re tracking every account we suggested.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {suggested.map((a) => (
              <li key={a.profile.handle} className="rounded-xl border border-border bg-surface p-5">
                <AccountRow
                  handle={a.profile.handle}
                  avatarUrl={a.profile.avatarUrl}
                  meta={`${compactNumber(a.profile.followers)} · ${a.outliers30d} outliers`}
                  trailing={<AddSuggestedSingle handle={a.profile.handle} />}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
