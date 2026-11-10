import type { Breakdown } from "@/lib/ai/schemas";
import { cn } from "@/lib/utils";

const BEAT_LABEL = {
  hook: "Hook",
  setup: "Setup",
  payoff: "Payoff",
  cta: "CTA",
  other: "Other",
} as const;
const BEAT_CLASS = {
  hook: "bg-brand text-on-brand",
  setup: "bg-tint-sky-bg text-tint-sky",
  payoff: "bg-tint-mint-bg text-tint-mint",
  cta: "bg-tint-amber-bg text-tint-amber",
  other: "bg-surface-3 text-muted",
} as const;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

/** Hook · Setup · Payoff · CTA as proportional segments, then the beats with timestamps. */
export function StructureTimeline({ structure }: { structure: Breakdown["structure"] }) {
  const total = Math.max(...structure.map((s) => s.end), 1);
  return (
    <div className="@container flex flex-col gap-4">
      <div className="flex h-10 w-full gap-1" aria-hidden="true">
        {structure.map((s, i) => (
          <div
            key={i}
            className={cn(
              "flex min-w-10 items-center justify-center truncate rounded-sm px-1 type-label",
              BEAT_CLASS[s.beat],
            )}
            style={{ width: `${((s.end - s.start) / total) * 100}%` }}
          >
            {BEAT_LABEL[s.beat]}
          </div>
        ))}
      </div>
      <ol className="grid gap-3 @2xl:grid-cols-2">
        {structure.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="shrink-0 rounded-[6px] bg-surface-3 px-1.5 py-0.5 type-caption text-muted tabular-nums">
              {fmt(s.start)}–{fmt(s.end)}
            </span>
            <span className="min-w-0 type-body-sm">
              <span className="font-semibold">{BEAT_LABEL[s.beat]}.</span>{" "}
              <span className="text-muted">{s.what}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
