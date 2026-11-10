import type { Metadata } from "next";
import { IgAvatar } from "@/components/app/ig/ig-avatar";
import { ArrowSquareOut as ExternalLinkIcon } from "@phosphor-icons/react/dist/ssr";
import { AppIcon } from "@/components/app/icons";
import { PageHelp } from "@/components/app/page-header";
import { ReelGrid, ReelTile } from "@/components/app/reel-tile";
import { EmptyState } from "@/components/app/states";
import { UsualTooltip } from "@/components/app/usual-tooltip";
import { ReelsToolbar } from "@/components/app/your-reels/reels-toolbar";
import { buttonVariants } from "@/components/ui/button";
import { requireCreator } from "@/lib/auth/session";
import { now } from "@/lib/clock";
import { getMockProvider } from "@/lib/data";
import { getOwnReels } from "@/lib/db";
import { compactNumber, igCount, relativeDate } from "@/lib/format";

export const metadata: Metadata = { title: "Your reels" };

export default async function YourReelsPage({
  params,
  searchParams,
}: PageProps<"/c/[creatorId]/your-reels">) {
  const { creatorId } = await params;
  const creator = await requireCreator(creatorId);
  const sp = await searchParams;
  const sort = sp.sort === "multiple" ? "multiple" : "newest";
  const pillar = typeof sp.pillar === "string" ? sp.pillar : null;
  const [{ baseline, reels }, all, profile] = await Promise.all([
    getOwnReels({ sort, pillar }),
    getOwnReels({ sort: "newest", pillar: null }),
    getMockProvider().getProfile(creator.igHandle),
  ]);
  const at = now();
  const outliers = all.reels.filter((r) => r.isOutlier).length;

  const igStats = [
    { label: "posts", value: igCount(profile?.mediaCount ?? 0) },
    { label: "followers", value: igCount(profile?.followers ?? 0) },
    { label: "following", value: igCount(profile?.following ?? 0) },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Instagram profile header: photo, username + actions, posts/followers/following, name, bio */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-10 sm:px-6">
        <div className="flex items-center gap-6 sm:block sm:shrink-0">
          <IgAvatar src={creator.avatarUrl} size={88} className="sm:size-[136px]" />
          {/* phone: stats sit beside the photo, number over label */}
          <dl className="grid flex-1 grid-cols-3 text-center sm:hidden">
            {igStats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="type-caption text-muted">{s.label}</dt>
                <dd className="type-card-title">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="type-section font-normal">{creator.igHandle}</h1>
            <a
              href={`https://www.instagram.com/${creator.igHandle}/`}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              View on Instagram
              <ExternalLinkIcon aria-hidden="true" />
            </a>
            <PageHelp
              title="Your reels"
              text="Your own reels, each compared with your usual views. Open one to ask how it did."
            />
          </div>
          <dl className="flex gap-8 max-sm:hidden">
            {igStats.map((s) => (
              <div key={s.label} className="flex flex-row-reverse items-baseline gap-1.5">
                <dt className="type-body-sm text-muted">{s.label}</dt>
                <dd className="type-body-sm font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>
          <div>
            <p className="type-body-sm font-semibold">{creator.displayName}</p>
            <p className="max-w-xl type-body-sm">{creator.strategy.positioning}</p>
          </div>
          {/* Octupie's own numbers, kept apart from Instagram's */}
          <div className="flex flex-wrap gap-2">
            <UsualTooltip own lowConfidence={baseline.lowConfidence}>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border bg-surface-2 px-3 type-label hover:border-border-strong"
              >
                <AppIcon.views aria-hidden="true" className="size-3.5 text-muted" />
                Your usual: {compactNumber(baseline.usualViews)} views
              </button>
            </UsualTooltip>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border bg-surface-2 px-3 type-label">
              <AppIcon.multiple aria-hidden="true" className="size-3.5 text-muted" />
              {outliers} outliers at 3× and up
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div
            role="tablist"
            aria-label="Your content"
            className="flex justify-center border-t border-border"
          >
            <span
              role="tab"
              aria-selected="true"
              className="-mt-px inline-flex h-12 items-center gap-2 border-t border-text px-1 type-overline text-text"
            >
              <AppIcon.reels aria-hidden="true" className="size-3.5" />
              Reels
            </span>
          </div>
          <div className="flex justify-end">
            <ReelsToolbar sort={sort} pillar={pillar} pillars={creator.strategy.pillars} />
          </div>
        </div>
        {reels.length === 0 ? (
          <EmptyState
            icon={<AppIcon.reels />}
            title="No reels in this pillar yet"
            body="Try All pillars to see every reel."
          />
        ) : (
          <ReelGrid label="Your reels">
            {reels.map((r, i) => (
              <ReelTile
                key={r.shortcode}
                own
                reel={r}
                href={`/c/${creatorId}/reels/${r.shortcode}`}
                age={relativeDate(r.postedAt, at)}
                priority={i < 5}
              />
            ))}
          </ReelGrid>
        )}
      </div>
    </div>
  );
}
