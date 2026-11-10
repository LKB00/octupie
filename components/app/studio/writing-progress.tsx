"use client";

import { useEffect, useState } from "react";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Thinking } from "./chat/thinking";

const STEPS = [
  "Reading your idea",
  "Matching your voice",
  "Writing three hooks",
  "Adding filming cues",
];

/** Shown while a new script is being written, so the wait reads as progress, not a frozen button. */
export function WritingProgress() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <section
      aria-label="Writing your script"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5"
    >
      <Thinking label={`${STEPS[step]}…`} />
      <ol className="flex flex-wrap gap-x-4 gap-y-1">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={cn(
              "flex items-center gap-1 type-caption",
              i < step ? "text-text" : "text-faint",
            )}
          >
            {i < step ? <Check aria-hidden="true" className="size-3.5 text-success" /> : null}
            {s}
          </li>
        ))}
      </ol>
      <div aria-hidden="true" className="flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </section>
  );
}
