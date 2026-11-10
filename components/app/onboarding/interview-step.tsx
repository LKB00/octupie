"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveAnswerAction } from "@/app/(app)/_actions/onboarding";
import { Button } from "@/components/ui/button";
import { INTERVIEW } from "@/lib/onboarding/steps";
import { StepFooter, StepTitle } from "./frame";

/** One question per screen (?q=1…5). Answers save on Continue; Skip moves on without one. */
export function InterviewStep({ index, initial }: { index: number; initial: string }) {
  const router = useRouter();
  const item = INTERVIEW[index]!;
  const [value, setValue] = useState(initial);
  const [pending, start] = useTransition();
  const last = index === INTERVIEW.length - 1;
  const next = last ? "/onboarding/pillars" : `/onboarding/interview?q=${index + 2}`;
  const back = index === 0 ? "/onboarding/understood" : `/onboarding/interview?q=${index}`;
  return (
    <>
      <div className="flex flex-col gap-3">
        <p className="type-overline text-muted">
          Question {index + 1} of {INTERVIEW.length}
        </p>
        <StepTitle title={item.q} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="answer" className="sr-only">
          {item.q}
        </label>
        <textarea
          id="answer"
          key={item.key}
          autoFocus
          rows={5}
          maxLength={600}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={item.hint}
          className="w-full rounded-xl border border-border bg-surface p-4 type-body placeholder:text-faint focus-visible:border-brand focus-visible:shadow-glow focus-visible:outline-none"
        />
        <p className="type-caption text-muted">
          A sentence or two is enough. Typing only for now; voice answers need a speech-to-text key.
        </p>
      </div>
      <StepFooter back={back}>
        <Button variant="ghost" size="lg" onClick={() => router.push(next)}>
          Skip
        </Button>
        <Button
          size="lg"
          disabled={pending || !value.trim()}
          onClick={() =>
            start(async () => {
              await saveAnswerAction({ key: item.key, value });
              router.push(next);
            })
          }
        >
          Continue
        </Button>
      </StepFooter>
    </>
  );
}
