import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight as ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { AppIcon } from "@/components/app/icons";
import { buttonVariants } from "@/components/ui/button";
import { ConflictCard } from "@/components/app/context/conflict-card";
import { BreakingAccounts } from "@/components/app/home/breaking-accounts";
import { Pipeline } from "@/components/app/home/pipeline";
import { QuickActions } from "@/components/app/home/quick-actions";
import { ReelGrid, ReelTile } from "@/components/app/reel-tile";
import { SectionHeader } from "@/components/app/section";
import { requireCreator } from "@/lib/auth/session";
import { now } from "@/lib/clock";
import { getFeed, listScripts, listTrackedAccounts } from "@/lib/db";
import { shortAge } from "@/lib/format";

export const metadata: Metadata = { title: "Home" };

function greeting(d: Date) {
  const h = (d.getUTCHours() + 5.5) % 24; // fixture creator is in India
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function HomePage({ params }: PageProps<"/c/[creatorId]/home">) {
  const { creatorId } = await params;
  const creator = await requireCreator(creatorId);
  const at = now();
  const [week, accounts] = await Promise.all([
    getFeed({
      sort: "breaking",
      window: 7,
      format: "all",
      pillar: null,
      account: null,
      minMultiple: 3,
    }),
    listTrackedAccounts(),
  ]);
  // A full row of four: this week's breakouts first, then the month's best, no repeats.
  const month =
    week.length >= 4
      ? []
      : await getFeed({
          sort: "breaking",
          window: 30,
          format: "all",
          pillar: null,
          account: null,
          minMultiple: 3,
        });
  const picks = [
    ...week,
    ...month.filter((m) => !week.some((w) => w.shortcode === m.shortcode)),
  ].slice(0, 4);
  const scripts = listScripts();

  return (
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-(image:--wash-hero) px-6 py-8 md:px-8 md:py-10">
        <p className="type-body-sm font-medium text-muted">
          {greeting(at)}, {creator.displayName}
        </p>
        <h1 className="mt-2 max-w-2xl type-display text-balance">
          {week.length} {week.length === 1 ? "reel" : "reels"} broke out in your niche this week.
        </h1>
        <p className="mt-3 max-w-xl type-body text-muted">
          Pick one, see why it worked, and film your version today.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/c/${creatorId}/discover?window=7`}
            className={buttonVariants({ variant: "dark", size: "lg" })}
          >
            <AppIcon.hot aria-hidden="true" className="size-4" />
            See this week&apos;s outliers
          </Link>
          <Link
            href={`/c/${creatorId}/studio`}
            className={buttonVariants({ variant: "secondary", size: "lg" })}
          >
            Write from an idea
          </Link>
        </div>
      </section>

      <section aria-labelledby="picks-title" className="flex flex-col gap-4">
        <SectionHeader
          id="picks-title"
          title="Worth making this week"
          description="Ranked by how fast they’re beating their usual views."
          action={
            <Link
              href={`/c/${creatorId}/discover`}
              className="inline-flex shrink-0 items-center gap-1 type-body-sm font-medium text-brand-strong hover:underline"
            >
              All outliers <ArrowRightIcon aria-hidden="true" className="size-4" />
            </Link>
          }
        />
        <ReelGrid label="Top picks">
          {picks.map((r, i) => (
            <ReelTile
              key={r.shortcode}
              reel={r}
              href={`/c/${creatorId}/reels/${r.shortcode}`}
              age={shortAge(r.postedAt, at)}
              priority={i < 3}
            />
          ))}
        </ReelGrid>
      </section>

      <QuickActions creatorId={creatorId} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-6">
          <Pipeline creatorId={creatorId} scripts={scripts} />
          {creator.voiceConflict.conflict ? (
            <ConflictCard conflict={creator.voiceConflict} compact />
          ) : null}
        </div>
        <BreakingAccounts creatorId={creatorId} accounts={accounts} />
      </div>
    </div>
  );
}
