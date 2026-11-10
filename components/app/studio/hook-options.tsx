"use client";

import { Check as CheckIcon } from "@phosphor-icons/react/dist/ssr";
import type { ScriptContent } from "@/lib/ai/schemas";
import { cn } from "@/lib/utils";

/** Three hook options as radio cards; the chosen one becomes line 1. */
export function HookOptions({
  content,
  onSelect,
}: {
  content: ScriptContent;
  onSelect: (next: ScriptContent) => void;
}) {
  return (
    <fieldset id="hooks" className="flex scroll-mt-24 flex-col gap-2 md:scroll-mt-6">
      <legend className="mb-2 type-label text-muted">Hook options · pick one</legend>
      <div className="grid gap-2 @2xl:grid-cols-3">
        {content.hooks.map((h, i) => {
          const checked = content.selectedHook === i;
          return (
            <label
              key={i}
              className={cn(
                "relative flex cursor-pointer flex-col gap-2 rounded-lg border p-4.5 transition-[border-color,background-color] has-focus-visible:outline-2 has-focus-visible:outline-brand",
                checked
                  ? "border-brand bg-brand-weak"
                  : "border-border hover:border-border-strong hover:bg-surface-2",
              )}
            >
              <input
                type="radio"
                name="hook"
                checked={checked}
                onChange={() => {
                  const first = content.lines.findIndex((l) => l.beat === "hook");
                  const lines = content.lines.map((l, idx) =>
                    idx === (first < 0 ? 0 : first) ? { ...l, text: h.text } : l,
                  );
                  onSelect({ ...content, selectedHook: i, lines });
                }}
                className="sr-only"
              />
              <span className="flex items-center justify-between type-caption font-medium text-muted">
                Option {i + 1}
                {checked ? <CheckIcon aria-hidden="true" className="size-4 text-brand" /> : null}
              </span>
              <span className="type-body-sm font-medium">{h.text}</span>
              <span className="mt-auto type-caption text-muted">{h.why}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
