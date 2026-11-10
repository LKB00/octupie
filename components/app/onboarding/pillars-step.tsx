"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check as CheckIcon, Plus as PlusIcon, X as XIcon } from "@phosphor-icons/react/dist/ssr";
import { savePillarsAction } from "@/app/(app)/_actions/onboarding";
import { Button } from "@/components/ui/button";
import type { Pillar } from "@/lib/db/types";
import { MAX_PILLARS } from "@/lib/onboarding/steps";
import { cn } from "@/lib/utils";
import { StepFooter, StepTitle } from "./frame";

export function PillarsStep({ suggested, initial }: { suggested: Pillar[]; initial: string[] }) {
  const router = useRouter();
  const [picked, setPicked] = useState<string[]>(initial);
  const [custom, setCustom] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const count = picked.length + custom.length;
  const full = count >= MAX_PILLARS;
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : full ? p : [...p, id]));
  return (
    <>
      <StepTitle
        title="Pick your pillars"
        sub={`The themes your scripts rotate through. Pick up to ${MAX_PILLARS}; the first ones come from your reels.`}
      />
      <div className="flex flex-col gap-2">
        <p className="type-caption text-muted" aria-live="polite">
          {count} of {MAX_PILLARS} picked
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {suggested.map((p) => {
            const on = picked.includes(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  disabled={!on && full}
                  onClick={() => toggle(p.id)}
                  className={cn(
                    "flex h-full w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors disabled:opacity-50",
                    on
                      ? "border-brand bg-brand-weak"
                      : "border-border bg-surface hover:border-border-strong",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border",
                      on ? "border-brand bg-brand text-on-brand" : "border-border-strong",
                    )}
                  >
                    {on ? <CheckIcon aria-hidden="true" className="size-3.5" /> : null}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="type-label">{p.name}</span>
                    <span className="type-caption text-muted">{p.description}</span>
                  </span>
                </button>
              </li>
            );
          })}
          {custom.map((name) => (
            <li
              key={name}
              className="flex items-center gap-3 rounded-xl border border-brand bg-brand-weak p-4"
            >
              <span className="flex-1 type-label">{name}</span>
              <button
                type="button"
                aria-label={`Remove ${name}`}
                onClick={() => setCustom((c) => c.filter((x) => x !== name))}
                className="inline-flex size-6 items-center justify-center rounded-sm text-muted hover:text-text"
              >
                <XIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const name = draft.trim();
          if (name.length < 2 || full || custom.includes(name)) return;
          setCustom((c) => [...c, name]);
          setDraft("");
        }}
      >
        <label htmlFor="own-pillar" className="sr-only">
          Write my own pillar
        </label>
        <input
          id="own-pillar"
          value={draft}
          maxLength={40}
          disabled={full}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={full ? `${MAX_PILLARS} picked` : "Write my own"}
          className="h-10 min-w-0 flex-1 rounded-[10px] border border-border bg-surface px-3 type-body-sm placeholder:text-faint focus-visible:border-brand focus-visible:outline-none"
        />
        <Button type="submit" variant="secondary" disabled={full || draft.trim().length < 2}>
          <PlusIcon aria-hidden="true" /> Add
        </Button>
      </form>
      {error ? (
        <p role="alert" className="type-caption text-danger">
          {error}
        </p>
      ) : null}
      <StepFooter back={`/onboarding/interview?q=5`}>
        <Button
          size="lg"
          disabled={pending || count === 0}
          onClick={() =>
            start(async () => {
              const res = await savePillarsAction({ ids: picked, custom });
              if (!res.ok) return setError(res.message);
              router.push("/onboarding/building");
            })
          }
        >
          Build my feed
        </Button>
      </StepFooter>
    </>
  );
}
