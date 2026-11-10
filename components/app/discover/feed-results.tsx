import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { now } from "@/lib/clock";
import { FeedUnavailableError, getFeed, getSavedReels } from "@/lib/db";
import { store } from "@/lib/db/mock-store";
import { clockTime, shortAge } from "@/lib/format";
import { ReelGrid, ReelTile } from "../reel-tile";
import { EmptyState, ErrorState } from "../states";
import { AddAccountForm } from "./add-account-form";
import { AddSuggestedButton } from "./add-suggested-button";
import { RetryFeedButton } from "./retry-feed-button";
import { discoverHref, type DiscoverParams } from "./search-params";
import { SparseBanner } from "./sparse-banner";

export const FEED_TARGET = 15;

/** Feed tab with all four list states: loading (Suspense), empty, sparse, error. */
export async function FeedResults({
  creatorId,
  base,
  params,
}: {
  creatorId: string;
  base: string;
  params: DiscoverParams;
}) {
  if (store().tracked.length === 0) {
    return (
      <EmptyState
        title="Add accounts in your niche to start your feed"
        body="We'll watch them every day and show the reels that beat their usual views."
        action={
          <div className="flex w-full max-w-md flex-col gap-3">
            <AddAccountForm />
            <AddSuggestedButton variant="primary" />
          </div>
        }
      />
    );
  }

  let reels;
  try {
    reels = await getFeed(params);
  } catch (e) {
    if (!(e instanceof FeedUnavailableError)) throw e;
    return (
      <ErrorState
        title="We couldn't refresh your feed"
        body={`Instagram didn't respond. Your last good update was at ${clockTime(now().toISOString())}.`}
        retry={<RetryFeedButton />}
      />
    );
  }

  const at = now();
  return (
    <div className="flex flex-col gap-6">
      {reels.length < FEED_TARGET ? (
        <SparseBanner count={reels.length} base={base} params={params} />
      ) : null}
      {reels.length === 0 ? (
        <EmptyState
          title="No outliers match these filters"
          body="Try a longer time window or clear the pillar and format filters."
          action={
            <Link
              href={discoverHref(base, params, {
                window: "90",
                pillar: null,
                format: null,
                account: null,
              })}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Show the last 90 days
            </Link>
          }
        />
      ) : (
        <ReelGrid label="Outliers">
          {reels.map((r, i) => (
            <ReelTile
              key={r.shortcode}
              reel={r}
              href={`/c/${creatorId}/reels/${r.shortcode}`}
              age={shortAge(r.postedAt, at)}
              priority={i < 4}
            />
          ))}
        </ReelGrid>
      )}
    </div>
  );
}

export async function SavedResults({
  creatorId,
  base,
  params,
}: {
  creatorId: string;
  base: string;
  params: DiscoverParams;
}) {
  const reels = await getSavedReels();
  const at = now();
  if (reels.length === 0) {
    return (
      <EmptyState
        title="Nothing saved yet"
        body="Save reels from your feed with the bookmark, and they'll wait for you here."
        action={
          <Link
            href={discoverHref(base, params, { tab: "feed" })}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            Go to the feed
          </Link>
        }
      />
    );
  }
  return (
    <ReelGrid label="Saved reels">
      {reels.map((r) => (
        <ReelTile
          key={r.shortcode}
          reel={r}
          href={`/c/${creatorId}/reels/${r.shortcode}`}
          age={shortAge(r.postedAt, at)}
        />
      ))}
    </ReelGrid>
  );
}
