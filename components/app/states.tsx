import { REEL_GRID } from "./reel-tile";
import Link from "next/link";
import { WarningCircle as CircleAlertIcon } from "@phosphor-icons/react/dist/ssr";
import { AppIcon } from "./icons";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { cn } from "@/lib/utils";

/** One sentence and one next step (docs/04 §5). */
export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface-2/60 px-6 py-12 text-center">
      {icon ? (
        <IconTile tone="violet" size="lg">
          {icon}
        </IconTile>
      ) : null}
      <h2 className="type-section">{title}</h2>
      {body ? <p className="max-w-md type-body-sm text-muted">{body}</p> : null}
      {action ? <div className="mt-1 flex w-full justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title,
  body,
  retry,
}: {
  title: string;
  body?: string;
  retry?: React.ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-danger/25 bg-danger-bg p-4"
    >
      <CircleAlertIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-danger" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="type-body-sm font-medium text-text">{title}</p>
        {body ? <p className="type-body-sm text-muted">{body}</p> : null}
        {retry ? <div className="mt-2">{retry}</div> : null}
      </div>
    </div>
  );
}

/** Inline limit-reached prompt at the point of action, never a redirect. */
export function UpgradeCard({
  what,
  className,
}: {
  what: "breakdowns" | "scripts" | "chat messages" | "tracked accounts";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-brand/20 bg-(image:--wash-violet) p-5",
        className,
      )}
      data-testid="upgrade-card"
    >
      <div className="flex items-center gap-3">
        <IconTile tone="violet">
          <AppIcon.upgrade />
        </IconTile>
        <div>
          <p className="type-card-title">You&apos;ve used all your {what} this month</p>
          <p className="type-caption text-muted">
            Creator: 50 breakdowns, 30 scripts. Pro: 100 breakdowns, unlimited scripts.
          </p>
        </div>
      </div>
      <Link
        href="/settings/billing"
        className={cn(buttonVariants({ variant: "primary", size: "sm" }), "self-start")}
      >
        Compare plans
      </Link>
    </div>
  );
}

export function ReelGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading reels" className={REEL_GRID}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-[3/4] w-full rounded-xl" />
          <div className="flex flex-col gap-2 px-0.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
