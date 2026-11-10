import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { compactNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MultipleBadge } from "./multiple-badge";

export type ReelRowData = {
  shortcode: string;
  thumbnailUrl: string;
  hook: string;
  handle: string;
  /** Carousels have no view count */
  views: number | null;
  multiple: number | null;
  usualViews: number | null;
  lowConfidence?: boolean;
};

/**
 * ReelRow: a reel as one item in a list (Studio's starters, the weekly email). Same cover, same
 * multiple badge, same "handle · views" as ReelCard, just laid out in a row.
 */
export function ReelRow({
  reel,
  href,
  leading,
  className,
}: {
  reel: ReelRowData;
  href: string;
  /** e.g. a rank number in the email */
  leading?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-border-strong hover:bg-surface-2/60",
        className,
      )}
    >
      {leading}
      <span className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden rounded-lg bg-surface-3">
        <Image src={reel.thumbnailUrl} alt="" fill sizes="48px" className="object-cover" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Link
          href={href}
          className="line-clamp-2 type-label text-text outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-brand"
        >
          {reel.hook}
        </Link>
        <span className="flex min-w-0 items-center gap-2 type-caption text-muted">
          <span className="relative z-10 shrink-0">
            <MultipleBadge
              multiple={reel.multiple}
              usualViews={reel.usualViews}
              lowConfidence={reel.lowConfidence}
            />
          </span>
          <span className="min-w-0 truncate">
            <span className="font-semibold text-text">{reel.handle}</span>
            {reel.views !== null ? ` · ${compactNumber(reel.views)} views` : null}
          </span>
        </span>
      </span>
      <ArrowUpRight
        aria-hidden="true"
        className="size-4 shrink-0 text-faint group-hover:text-text"
      />
    </div>
  );
}
