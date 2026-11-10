"use client";

import type { ScriptContent } from "@/lib/ai/schemas";
import { cn } from "@/lib/utils";

const BEAT = { hook: "Hook", setup: "Setup", payoff: "Payoff", cta: "Call to action" } as const;
const DOT = {
  hook: "bg-brand",
  setup: "bg-tint-sky",
  payoff: "bg-tint-mint",
  cta: "bg-tint-amber",
} as const;

/** Spoken lines grouped by beat, editable in place; cues under each line when on. */
export function ScriptLines({
  content,
  showCues,
  onSave,
}: {
  content: ScriptContent;
  showCues: boolean;
  onSave: (next: ScriptContent, reason: string) => void;
}) {
  return (
    <ol className="flex flex-col" aria-label="Script lines">
      {content.lines.map((line, i) => {
        const first = i === 0 || content.lines[i - 1]!.beat !== line.beat;
        return (
          <li
            key={i}
            id={first ? `beat-${line.beat}` : undefined}
            className="scroll-mt-24 md:scroll-mt-6"
          >
            {first ? (
              <p
                className={cn(
                  "flex items-center gap-2 pb-1 type-overline text-faint",
                  i > 0 && "pt-4",
                )}
              >
                <span aria-hidden="true" className={cn("size-1.5 rounded-full", DOT[line.beat])} />
                {BEAT[line.beat]}
              </p>
            ) : null}
            <div className="group grid grid-cols-[28px_1fr] gap-x-2 rounded-[10px] py-1 transition-colors focus-within:bg-surface-2 hover:bg-surface-2">
              <span className="pt-2.5 text-right type-caption text-faint tabular-nums">
                {i + 1}
              </span>
              <div className="flex min-w-0 flex-col pr-2">
                <label htmlFor={`line-${i}`} className="sr-only">
                  Line {i + 1} ({BEAT[line.beat]})
                </label>
                <textarea
                  id={`line-${i}`}
                  defaultValue={line.text}
                  maxLength={140}
                  rows={1}
                  className="field-sizing-content w-full resize-none rounded-sm bg-transparent px-2 py-1.5 type-body text-text focus-visible:outline-none"
                  onBlur={(e) => {
                    const text = e.currentTarget.value.trim();
                    if (!text || text === line.text) return;
                    const lines = content.lines.map((l, idx) => (idx === i ? { ...l, text } : l));
                    onSave({ ...content, lines }, `Edited line ${i + 1}`);
                  }}
                />
                {showCues && line.cue ? (
                  <p className="px-2 pb-1 type-body-sm text-muted italic">↳ {line.cue}</p>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
