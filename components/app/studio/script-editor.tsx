"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import type { ScriptWithHistory } from "@/lib/db/types";
import { CopyButton } from "../copy-button";
import { HookOptions } from "./hook-options";
import { ScriptLines } from "./script-lines";
import { useSaveContent } from "./use-save";

/** Centre pane of Studio (docs/03 S6). Remounted per version so inputs reflect undo/redo. */
export function ScriptEditor({ script }: { script: ScriptWithHistory }) {
  const { save } = useSaveContent(script.id);
  const [showCues, setShowCues] = useState(true);
  const c = script.content;

  return (
    <section aria-label="Script" className="@container flex min-w-0 flex-col gap-6">
      <HookOptions
        content={c}
        onSelect={(next) => save(next, `Picked hook ${next.selectedHook + 1}`)}
      />

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="type-card-title">Script</h2>
          <label className="flex items-center gap-2 type-caption text-muted">
            Show cues
            <Switch checked={showCues} onCheckedChange={setShowCues} aria-label="Show cues" />
          </label>
        </div>
        <ScriptLines content={c} showCues={showCues} onSave={save} />
      </div>

      <div
        id="caption"
        className="flex scroll-mt-24 flex-col gap-3 rounded-xl border border-border bg-surface-2/60 p-5 md:scroll-mt-6"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="type-card-title">Caption</h2>
          <CopyButton text={`${c.caption}\n\n${c.hashtags.join(" ")}`} label="Copy caption" />
        </div>
        <p className="type-body-sm whitespace-pre-line">{c.caption}</p>
        <div className="flex flex-wrap gap-1.5">
          {c.hashtags.map((h) => (
            <span
              key={h}
              className="rounded-full bg-brand-weak px-2 py-0.5 type-caption font-medium text-brand-strong"
            >
              {h}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
