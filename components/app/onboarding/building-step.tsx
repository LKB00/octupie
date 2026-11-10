"use client";

import { useEffect, useState } from "react";
import {
  Check as CheckIcon,
  CircleNotch as LoaderCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { finishOnboardingAction } from "@/app/(app)/_actions/onboarding";
import { ConflictCard } from "@/components/app/context/conflict-card";
import { Button } from "@/components/ui/button";
import type { VoiceConflict } from "@/lib/ai/schemas";
import { cn } from "@/lib/utils";
import { StepTitle } from "./frame";

export function BuildingStep({
  accounts,
  conflict,
}: {
  accounts: number;
  conflict: VoiceConflict | null;
}) {
  const items = [
    "Strategy written",
    "Voice built",
    `${accounts} accounts found in your niche`,
    "Finding outliers",
  ];
  const [done, setDone] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setInterval(() => setDone((d) => (d >= items.length ? d : d + 1)), reduce ? 1 : 800);
    return () => clearInterval(t);
  }, [items.length]);
  const finished = done >= items.length;
  return (
    <>
      <StepTitle
        title={finished ? "Your feed is ready" : "Building your feed…"}
        sub={
          finished
            ? "Outliers from your niche, ranked by how far they beat their creator's usual views."
            : "This takes a minute or two on real accounts."
        }
      />
      <ol className="flex flex-col gap-3" aria-live="polite">
        {items.map((label, i) => {
          const state = i < done ? "done" : i === done ? "active" : "todo";
          return (
            <li
              key={label}
              className={cn("flex items-center gap-3 type-body", state === "todo" && "text-faint")}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full",
                  state === "done" ? "bg-success-bg text-success" : "bg-surface-3 text-muted",
                )}
              >
                {state === "done" ? (
                  <CheckIcon aria-hidden="true" className="size-4" />
                ) : state === "active" ? (
                  <LoaderCircleIcon aria-hidden="true" className="size-4 animate-spin" />
                ) : null}
              </span>
              {label}
              <span className="sr-only">
                {state === "done" ? "done" : state === "active" ? "in progress" : "waiting"}
              </span>
            </li>
          );
        })}
      </ol>
      {finished && conflict ? <ConflictCard conflict={conflict} /> : null}
      {finished ? (
        <form action={finishOnboardingAction} className="border-t border-border pt-6">
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Open my feed
          </Button>
        </form>
      ) : null}
    </>
  );
}
