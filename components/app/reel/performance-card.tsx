import { Question as CircleHelpIcon } from "@phosphor-icons/react/dist/ssr";
import type { ReelDetail } from "@/lib/db/types";
import { compactNumber } from "@/lib/format";
import { formatMultiple } from "@/lib/outliers/multiple";
import { AppIcon } from "../icons";
import { SectionCard } from "../section";
import { UsualTooltip } from "../usual-tooltip";
import { GrowthChart } from "./growth-chart";

/** KPI tiles: the multiple first (the reason this reel is here), then Instagram's counts. */
export function StatTiles({ detail }: { detail: ReelDetail }) {
  const { reel, isOwn } = detail;
  const tiles = [
    { label: "Views", value: compactNumber(reel.views), icon: AppIcon.views },
    { label: "Likes", value: compactNumber(reel.likes), icon: AppIcon.likes },
    { label: "Comments", value: compactNumber(reel.comments), icon: AppIcon.comments },
  ];
  return (
    <div className="@container">
      <dl className="grid grid-cols-2 gap-3 @lg:grid-cols-4">
        <div className="flex flex-col justify-between gap-1 rounded-xl border border-brand/20 bg-(image:--wash-violet) p-5">
          <dt className="flex items-center gap-1 type-caption text-muted">
            vs {isOwn ? "your" : "their"} usual
            <UsualTooltip own={isOwn} lowConfidence={reel.baseline.lowConfidence}>
              <button
                type="button"
                aria-label="How we define usual views"
                className="text-faint hover:text-text"
              >
                <CircleHelpIcon className="size-3.5" />
              </button>
            </UsualTooltip>
          </dt>
          <dd className="type-kpi text-brand-strong">
            {reel.multiple !== null ? formatMultiple(reel.multiple) : "—"}
          </dd>
          <dd className="type-caption text-muted">
            usual {compactNumber(reel.baseline.usualViews)}
          </dd>
        </div>
        {tiles.map((t) => (
          <div
            key={t.label}
            className="flex flex-col justify-between gap-1 rounded-xl border border-border bg-surface p-5"
          >
            <dt className="flex items-center gap-1.5 type-caption text-muted">
              <t.icon aria-hidden="true" className="size-3.5" />
              {t.label}
            </dt>
            <dd className="type-kpi">{t.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function GrowthCard({ detail }: { detail: ReelDetail }) {
  return (
    <SectionCard
      title="Views over time"
      description={
        detail.trackingStartedDay
          ? `We started tracking this reel on day ${detail.trackingStartedDay}, so the early curve is missing.`
          : "This reel against their typical reel."
      }
      icon={AppIcon.multiple}
      tone="sky"
    >
      <GrowthChart
        postedAt={detail.reel.postedAt}
        reel={detail.snapshots}
        typical={detail.typicalCurve}
      />
    </SectionCard>
  );
}
