"use client";

import { useEffect, useState } from "react";
import { Check as CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { StepTitle } from "./frame";

const STAGES = ["Profile", "Reels", "Transcripts", "Summary"];

/**
 * "Reading your last 30 reels…" with a staged progress bar, then the cards (passed in from the
 * server). Under reduced motion the cards show straight away.
 */
export function UnderstoodStep({
  handle,
  children,
}: {
  handle: string;
  children: React.ReactNode;
}) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setInterval(
      () => setStage((s) => (s >= STAGES.length ? s : s + 1)),
      reduce ? 1 : 650,
    );
    return () => clearInterval(t);
  }, []);
  const done = stage >= STAGES.length;
  if (!done) {
    return (
      <>
        <StepTitle
          title="Reading your last 30 reels…"
          sub={`From @${handle}. This takes about a minute on real accounts.`}
        />
        <div className="flex flex-col gap-3" role="status" aria-live="polite">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-500"
              style={{ width: `${(stage / STAGES.length) * 100}%` }}
            />
          </div>
          <ol className="flex flex-wrap gap-x-4 gap-y-1">
            {STAGES.map((s, i) => (
              <li
                key={s}
                className={cn(
                  "flex items-center gap-1 type-caption",
                  i < stage ? "text-text" : "text-faint",
                )}
              >
                {i < stage ? (
                  <CheckIcon aria-hidden="true" className="size-3.5 text-success" />
                ) : null}
                {s}
              </li>
            ))}
          </ol>
        </div>
        <div className="grid gap-3" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </>
    );
  }
  return (
    <>
      <StepTitle
        title="Here's what we understood"
        sub="Fix anything that's off. You can change all of this later in Brand & voice."
      />
      {children}
    </>
  );
}
