import Image from "next/image";
import Link from "next/link";
import { IgAvatar } from "@/components/app/ig/ig-avatar";
import type { ScoredReel } from "@/lib/db/types";
import { compactNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AppIcon } from "./icons";
import { MultipleBadge } from "./multiple-badge";
import { SaveButton } from "./save-button";

/**
 * The one grid every reel list uses (Home, Discover, Saved, Your reels, and their skeletons).
 * auto-fill, not auto-fit: three cards stay card-sized instead of stretching across the row.
 */
export const REEL_GRID =
  "grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-[repeat(auto-fill,minmax(184px,1fr))] sm:gap-x-5";

const shadowText = "[text-shadow:0_1px_3px_var(--scrim-strong)]";

/**
 * The overlays every reel cover uses, card and reel page alike: multiple (top-left), format
 * (top-right: a reel icon, or a carousel's "1/3" when `format` is passed), views (bottom-left,
 * reels only), over a bottom scrim.
 */
export function CoverOverlays({
  reel,
  own,
  format,
}: {
  reel: ScoredReel;
  own: boolean;
  /** Replaces the format icon, e.g. the carousel's slide counter */
  format?: React.ReactNode;
}) {
  const TypeIcon = reel.type === "carousel" ? AppIcon.carousel : AppIcon.reels;
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-scrim to-transparent"
      />
      <div className="absolute top-2.5 left-2.5 z-10">
        <MultipleBadge
          multiple={reel.multiple}
          usualViews={reel.baseline.usualViews}
          lowConfidence={reel.baseline.lowConfidence}
          own={own}
        />
      </div>
      {format ?? (
        <TypeIcon
          aria-label={reel.type === "carousel" ? "Carousel" : "Reel"}
          className="pointer-events-none absolute top-3 right-3 size-[18px] text-on-media [filter:drop-shadow(0_1px_2px_var(--scrim-strong))]"
        />
      )}
      {reel.type === "reel" ? (
        <span
          className={cn(
            "pointer-events-none absolute bottom-2.5 left-3 flex items-center gap-1 type-caption font-semibold text-on-media",
            shadowText,
          )}
        >
          <AppIcon.views aria-hidden="true" weight="fill" className="size-3.5" />
          {compactNumber(reel.views)}
          <span className="sr-only">views</span>
        </span>
      ) : null}
    </>
  );
}

/** Who and when, under every cover: avatar · handle · age, with an optional trailing action. */
export function CreatorLine({
  reel,
  age,
  trailing,
}: {
  reel: ScoredReel;
  age: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-8 items-center gap-2">
      <IgAvatar src={reel.owner.avatarUrl} size={20} />
      <p className="flex min-w-0 flex-1 items-baseline gap-1 type-caption text-muted">
        <span className="min-w-0 truncate font-semibold text-text">{reel.ownerHandle}</span>
        <span aria-hidden="true">·</span>
        <span className="shrink-0 whitespace-nowrap">{age}</span>
      </p>
      {trailing}
    </div>
  );
}

/** 3:4 cover for grids. */
function Cover({ reel, own, priority }: { reel: ScoredReel; own: boolean; priority: boolean }) {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-surface-3">
      <Image
        src={reel.thumbnailUrl}
        alt=""
        fill
        sizes="(min-width: 1280px) 220px, (min-width: 640px) 30vw, 50vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        priority={priority}
      />
      <CoverOverlays reel={reel} own={own} />
    </div>
  );
}

type Props = { reel: ScoredReel; href: string; age: string; own?: boolean; priority?: boolean };

/**
 * ReelCard: the same card everywhere a reel is browsed. Cover, the hook in two lines, who and
 * when, and Save (not on your own reels: you don't save your own work).
 */
export function ReelTile({ reel, href, age, own = false, priority = false }: Props) {
  const hook = reel.hookLine || reel.caption.split("#")[0]!.trim();
  return (
    <article data-testid="reel-card" className="group relative flex min-w-0 flex-col gap-3">
      <Cover reel={reel} own={own} priority={priority} />
      <div className="flex min-w-0 flex-col gap-2 px-0.5">
        <h3 className="line-clamp-2 min-h-10 type-label text-text">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-brand focus-visible:after:ring-offset-2"
          >
            {hook}
          </Link>
        </h3>
        <CreatorLine
          reel={reel}
          age={age}
          trailing={
            !own ? (
              <SaveButton
                shortcode={reel.shortcode}
                saved={reel.saved}
                variant="bar"
                className="relative z-10"
              />
            ) : null
          }
        />
      </div>
    </article>
  );
}

export function ReelGrid({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <section aria-label={label} className={REEL_GRID}>
      {children}
    </section>
  );
}
