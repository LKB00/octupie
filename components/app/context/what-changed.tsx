"use client";

import { useState, useTransition } from "react";
import {
  ArrowRight as ArrowRightIcon,
  Sparkle as SparklesIcon,
} from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { applyChangesAction, proposeChangesAction } from "@/app/(app)/_actions/context";
import { Button } from "@/components/ui/button";
import type { ContextDiff } from "@/lib/db/types";

/** One sentence in, a before → after preview out; nothing changes until Apply. */
export function WhatChanged() {
  const [text, setText] = useState("");
  const [diff, setDiff] = useState<ContextDiff | null>(null);
  const [pending, start] = useTransition();
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <SparklesIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand" />
        <div>
          <h2 className="type-card-title">What changed?</h2>
          <p className="type-caption text-muted">
            Tell us in a sentence. We show the edits before anything is saved. Free.
          </p>
        </div>
      </div>
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await proposeChangesAction(text);
            if (!res.ok) return void toast.error(res.message);
            setDiff(res.diff);
          });
        }}
      >
        <label htmlFor="what-changed" className="sr-only">
          What changed?
        </label>
        <input
          id="what-changed"
          value={text}
          maxLength={300}
          onChange={(e) => {
            setText(e.target.value);
            setDiff(null);
          }}
          placeholder="e.g. I now sell a 6-week cohort for junior designers at ₹14,999"
          className="h-10 min-w-0 flex-1 rounded-[10px] border border-border bg-surface px-3 type-body-sm placeholder:text-faint focus-visible:border-brand focus-visible:shadow-glow focus-visible:outline-none"
        />
        <Button type="submit" variant="secondary" disabled={pending || text.trim().length < 8}>
          {pending && !diff ? "Reading…" : "Show changes"}
        </Button>
      </form>
      {diff ? (
        <div className="flex flex-col gap-3" aria-live="polite">
          {diff.map((d) => (
            <div
              key={d.field}
              className="grid gap-2 rounded-[10px] border border-border p-4 @3xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] @3xl:items-start"
            >
              <div className="flex flex-col gap-1">
                <p className="type-overline text-muted">{d.label} · before</p>
                <p className="type-body-sm text-muted line-through decoration-faint">{d.before}</p>
              </div>
              <ArrowRightIcon
                aria-hidden="true"
                className="hidden size-4 text-faint @3xl:mt-6 @3xl:block"
              />
              <div className="flex flex-col gap-1">
                <p className="type-overline text-success">{d.label} · after</p>
                <p className="type-body-sm">{d.after}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Button
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await applyChangesAction(diff);
                  setDiff(null);
                  setText("");
                  toast.success(`Updated ${diff.map((d) => d.label.toLowerCase()).join(", ")}.`);
                })
              }
            >
              Apply {diff.length === 1 ? "change" : `${diff.length} changes`}
            </Button>
            <Button variant="ghost" onClick={() => setDiff(null)}>
              Discard
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
