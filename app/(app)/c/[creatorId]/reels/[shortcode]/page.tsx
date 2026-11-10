import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft as ArrowLeftIcon,
  ArrowSquareOut as ExternalLinkIcon,
  LockSimple as LockIcon,
} from "@phosphor-icons/react/dist/ssr";
import { AppIcon } from "@/components/app/icons";
import { PageHelp } from "@/components/app/page-header";
import { WriterPanelLoader } from "@/components/app/reel/angle-previews";
import { BreakdownRunner } from "@/components/app/reel/breakdown-runner";
import { BreakdownView } from "@/components/app/reel/breakdown-view";
import { GrowthCard, StatTiles } from "@/components/app/reel/performance-card";
import { InstagramEmbed } from "@/components/app/ig/instagram-embed";
import { SaveButton } from "@/components/app/save-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { requireCreator } from "@/lib/auth/session";
import { now } from "@/lib/clock";
import { getReelDetail, getUsage, pillarName } from "@/lib/db";
import { compactNumber, relativeDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: PageProps<"/c/[creatorId]/reels/[shortcode]">): Promise<Metadata> {
  const { shortcode } = await params;
  const detail = await getReelDetail(shortcode);
  return { title: detail ? `@${detail.reel.ownerHandle} reel` : "Reel" };
}

export default async function ReelPage({ params }: PageProps<"/c/[creatorId]/reels/[shortcode]">) {
  const { creatorId, shortcode } = await params;
  const creator = await requireCreator(creatorId);
  const detail = await getReelDetail(shortcode);
  if (!detail) notFound();
  const { reel } = detail;
  const usage = getUsage();
  const at = now();
  const back = detail.isOwn
    ? { href: `/c/${creatorId}/your-reels`, label: "Your reels" }
    : { href: `/c/${creatorId}/discover`, label: "Discover" };
  const pillar = pillarName(reel.pillarId);
  const hook = reel.hookLine || reel.caption.split("#")[0];

  const writerPanel = detail.isOwn ? null : detail.breakdown ? (
    <WriterPanelLoader
      creator={creator}
      shortcode={reel.shortcode}
      breakdown={detail.breakdown.breakdown}
      defaultPillarId={reel.pillarId}
      atLimit={usage.scripts.atLimit}
    />
  ) : (
    <section className="flex flex-col gap-3 rounded-xl border border-dashed border-border-strong bg-surface-2 p-5">
      <div className="flex items-center gap-3">
        <IconTile tone="neutral">
          <LockIcon />
        </IconTile>
        <div>
          <h2 className="type-card-title">Make your version</h2>
          <p className="type-caption text-muted">Unlocks after the breakdown</p>
        </div>
      </div>
      <p className="type-body-sm text-muted">
        Your script keeps this reel&apos;s mechanism, so we need the breakdown first. Then pick an
        angle and voice here.
      </p>
    </section>
  );

  /*
   * Layout follows the space the page actually has (container queries), not the screen:
   *   < 576px   stacked: player, details, breakdown, writer, growth
   *   ≥ 576px   player column (sticky) | details, breakdown, writer, growth
   *   ≥ 1024px  player column | details, breakdown, growth | writer column (sticky)
   */
  return (
    <div className="@container flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <Link
          href={back.href}
          className="inline-flex items-center gap-1.5 type-body-sm text-muted hover:text-text"
        >
          <ArrowLeftIcon aria-hidden="true" className="size-4" />
          {back.label}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {detail.breakdown && !detail.isOwn ? (
            <a
              href="#writer"
              className={`${buttonVariants({ variant: "primary", size: "sm" })} @5xl:hidden`}
            >
              <AppIcon.write aria-hidden="true" />
              Make your version
            </a>
          ) : null}
          {!detail.isOwn ? (
            <SaveButton shortcode={reel.shortcode} saved={reel.saved} variant="labelled" />
          ) : null}
          <a
            href={reel.permalink}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            <span className="max-sm:sr-only">Open on Instagram</span>
            <ExternalLinkIcon aria-hidden="true" />
          </a>
          <PageHelp
            title="Reel"
            text="How this reel did against its creator's usual views, and why it worked. Make your own version once the breakdown is ready."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 @xl:grid-cols-[272px_minmax(0,1fr)] @xl:gap-x-6 @4xl:grid-cols-[300px_minmax(0,1fr)] @5xl:grid-cols-[300px_minmax(0,1fr)_340px]">
        {/* player */}
        <div className="mx-auto w-full max-w-[340px] @xl:sticky @xl:top-6 @xl:col-start-1 @xl:row-span-3 @xl:row-start-1 @xl:mx-0 @xl:max-w-none @xl:self-start @5xl:row-span-2">
          <InstagramEmbed reel={reel} />
        </div>

        {/* details + breakdown */}
        <div className="flex min-w-0 flex-col gap-8 @xl:col-start-2 @xl:row-start-1">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="type-caption text-muted">
                Opening line · {reel.ownerHandle} · {compactNumber(reel.owner.followers)} followers
                · posted {relativeDate(reel.postedAt, at)}
              </p>
              <h1 className="type-title text-balance">“{hook}”</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {pillar ? (
                <Badge tone="brand">
                  <AppIcon.pillar aria-hidden="true" />
                  {pillar}
                </Badge>
              ) : null}
              {reel.durationSec ? (
                <Badge>
                  <AppIcon.length aria-hidden="true" />
                  {reel.durationSec}s
                </Badge>
              ) : null}
              {detail.breakdown ? (
                <Badge tone="success">
                  <AppIcon.breakdown aria-hidden="true" />
                  Breakdown ready
                </Badge>
              ) : null}
            </div>
            <StatTiles detail={detail} />
          </div>
          {detail.breakdown ? (
            <BreakdownView
              breakdown={detail.breakdown.breakdown}
              observation={detail.breakdown.observation}
            />
          ) : (
            <BreakdownRunner
              shortcode={reel.shortcode}
              atLimit={usage.breakdowns.atLimit}
              own={detail.isOwn}
            />
          )}
        </div>

        {/* writer: below the breakdown, or its own sticky column when wide */}
        {writerPanel ? (
          <aside
            aria-label="Make your version"
            className="flex min-w-0 [scrollbar-width:thin] flex-col gap-4 @xl:col-start-2 @xl:row-start-2 @5xl:sticky @5xl:top-6 @5xl:col-start-3 @5xl:row-span-2 @5xl:row-start-1 @5xl:max-h-[calc(100dvh-8.25rem)] @5xl:self-start @5xl:overflow-y-auto @5xl:rounded-xl"
          >
            {writerPanel}
          </aside>
        ) : null}

        {/* growth */}
        <div
          className={
            writerPanel
              ? "min-w-0 @xl:col-start-2 @xl:row-start-3 @5xl:row-start-2"
              : "min-w-0 @xl:col-start-2 @xl:row-start-2"
          }
        >
          <GrowthCard detail={detail} />
        </div>
      </div>
    </div>
  );
}
