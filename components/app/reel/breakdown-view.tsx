import type { Breakdown, VideoObservation } from "@/lib/ai/schemas";
import { CopyButton } from "../copy-button";
import { AppIcon } from "../icons";
import { SectionCard } from "../section";
import { HookScore } from "./hook-score";
import { StructureTimeline } from "./structure-timeline";

/** The breakdown on the reel page (docs/03 S5 §4): summary → hook → structure → why → borrow → template. */
export function BreakdownView({
  breakdown,
  observation,
}: {
  breakdown: Breakdown;
  observation: VideoObservation | null;
}) {
  const h = breakdown.hook;
  return (
    <div className="flex flex-col gap-4" data-testid="breakdown">
      <section
        aria-labelledby="breakdown-title"
        className="rounded-xl border border-brand/20 bg-(image:--wash-violet) p-5"
      >
        <p className="flex items-center gap-1.5 type-caption font-medium text-brand-strong">
          <AppIcon.breakdown aria-hidden="true" className="size-3.5" /> Why this reel beat their
          usual
        </p>
        <h2 id="breakdown-title" className="mt-2 type-section text-balance">
          {breakdown.headline}
        </h2>
        <p className="mt-2 type-body-sm text-muted">{h.summary}</p>
      </section>

      <SectionCard
        title="The first 3 seconds"
        description="How strongly each part holds attention, compared with other outliers in your niche."
        icon={AppIcon.firstSeconds}
        tone="violet"
      >
        <div className="@container">
          <div className="grid gap-3 @2xl:grid-cols-3">
            <HookScore
              name="Spoken"
              score={h.verbal.score}
              label={h.verbal.label}
              reason={h.verbal.reason}
              quote={h.verbal.quote}
            />
            <HookScore
              name="Visual"
              score={h.visual.score}
              label={h.visual.label}
              reason={h.visual.reason}
              quote={h.visual.description}
            />
            <HookScore
              name="On-screen text"
              score={h.onScreen.score}
              label={h.onScreen.label}
              reason={h.onScreen.reason}
              quote={h.onScreen.quote}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Structure"
        description="The beats, in order, with timestamps."
        icon={AppIcon.structure}
        tone="sky"
      >
        <StructureTimeline structure={breakdown.structure} />
      </SectionCard>

      <div className="@container">
        <div className="grid gap-4 @2xl:grid-cols-2">
          <SectionCard title="Why it worked" icon={AppIcon.why} tone="amber">
            <ol className="flex flex-col gap-3">
              {breakdown.whyItWorked.map((w, i) => (
                <li key={w.key} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-3 type-caption tabular-nums">
                    {i + 1}
                  </span>
                  <p className="type-body-sm">
                    <strong className="font-semibold">{w.key}.</strong>{" "}
                    <span className="text-muted">{w.detail}</span>
                  </p>
                </li>
              ))}
            </ol>
          </SectionCard>
          <SectionCard title="Borrow this" icon={AppIcon.borrow} tone="mint">
            <ul className="flex flex-col gap-3">
              {breakdown.borrow.map((b) => (
                <li key={b} className="flex gap-2.5 type-body-sm">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-tint-mint"
                  />
                  {b}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Hook template"
        description="Fill in the brackets with your own topic."
        icon={AppIcon.template}
        tone="neutral"
        action={<CopyButton text={breakdown.hookTemplate} label="Copy" />}
      >
        <p className="rounded-lg bg-surface-2 px-4 py-3 type-mono">{breakdown.hookTemplate}</p>
      </SectionCard>

      {observation ? (
        <details className="group rounded-xl border border-border bg-surface">
          <summary className="flex cursor-pointer list-none items-center gap-3 p-5 marker:hidden">
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-sm bg-surface-3 text-muted"
            >
              <AppIcon.transcript className="size-4" />
            </span>
            <span className="flex-1 type-card-title">Transcript</span>
            <span className="type-caption text-muted group-open:hidden">Show</span>
            <span className="hidden type-caption text-muted group-open:inline">Hide</span>
          </summary>
          <ol className="flex flex-col gap-2 border-t border-border px-5 py-4">
            {observation.transcript.map((t, i) => (
              <li key={i} className="flex gap-3 type-body-sm">
                <span className="w-10 shrink-0 type-caption text-faint tabular-nums">
                  {t.start.toFixed(1)}s
                </span>
                <span>{t.text}</span>
              </li>
            ))}
          </ol>
        </details>
      ) : null}
    </div>
  );
}
