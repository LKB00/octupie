import Link from "next/link";
import { ArrowRight as ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { IconTile } from "@/components/ui/icon-tile";
import { AppIcon } from "../icons";
import { SectionHeader } from "../section";

const ACTIONS = [
  {
    icon: AppIcon.idea,
    tone: "amber" as const,
    title: "Write from an idea",
    body: "One sentence in, a script with three hooks out.",
    seg: "studio",
  },
  {
    icon: AppIcon.discover,
    tone: "violet" as const,
    title: "Borrow a proven format",
    body: "Pick an outlier, see why it worked, make yours.",
    seg: "discover",
  },
  {
    icon: AppIcon.map,
    tone: "mint" as const,
    title: "Widen your niche",
    body: "See who's breaking out and track them.",
    seg: "discover?tab=map",
  },
];

/** Three ways to start: each card is one link with one clear outcome. */
export function QuickActions({ creatorId }: { creatorId: string }) {
  return (
    <section aria-labelledby="start-title" className="@container flex flex-col gap-4">
      <SectionHeader id="start-title" title="Start something" />
      <div className="grid gap-4 @2xl:grid-cols-3">
        {ACTIONS.map((a) => (
          <Link
            key={a.title}
            href={`/c/${creatorId}/${a.seg}`}
            className="group flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border-strong hover:bg-surface-2/60"
          >
            <span className="flex items-center justify-between">
              <IconTile tone={a.tone}>
                <a.icon />
              </IconTile>
              <ArrowRightIcon
                aria-hidden="true"
                className="size-4 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-text"
              />
            </span>
            <span className="flex flex-col gap-1">
              <span className="type-card-title">{a.title}</span>
              <span className="type-body-sm text-muted">{a.body}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
