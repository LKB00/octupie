"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle as CheckCircle2Icon } from "@phosphor-icons/react/dist/ssr";
import { updateScriptMetaAction } from "@/app/(app)/_actions/studio";
import { SCRIPT_STATUSES, SCRIPT_STATUS_LABEL, type ScriptStatus } from "@/lib/ai/schemas";
import type { ScriptWithHistory } from "@/lib/db/types";
import { cn } from "@/lib/utils";
import { useSaveContent } from "./use-save";

const STATUS_DOT: Record<ScriptStatus, string> = {
  draft: "bg-faint",
  ready: "bg-brand",
  filmed: "bg-warning",
  posted: "bg-success",
};

function SavedIndicator({ updatedAt, saving }: { updatedAt: string; saving: boolean }) {
  // Starts at the save time ("just now") and ticks forward on the client.
  const [nowMs, setNowMs] = useState(() => new Date(updatedAt).getTime());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);
  const secs = Math.max(0, Math.round((nowMs - new Date(updatedAt).getTime()) / 1000));
  const ago =
    secs < 5 ? "just now" : secs < 60 ? `${secs}s ago` : `${Math.round(secs / 60)} min ago`;
  return (
    <span role="status" className="inline-flex items-center gap-1 type-caption text-muted">
      <CheckCircle2Icon
        aria-hidden="true"
        className={cn("size-3.5", saving ? "text-faint" : "text-success")}
      />
      {saving ? "Saving…" : `Saved ${ago}`}
    </span>
  );
}

/** Title, status, voice and save state. The tools live in Studio's top bar (ScriptToolbar). */
export function StudioHeader({
  script,
  details,
}: {
  script: ScriptWithHistory;
  /** Read-only facts: length, pillar, source reel */
  details?: React.ReactNode;
}) {
  const { save, pending } = useSaveContent(script.id);
  const [, startMeta] = useTransition();
  const [status, setStatus] = useState<ScriptStatus>(script.status);
  const [voice, setVoice] = useState(script.voiceMode);
  const c = script.content;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="sr-only">Edit script</h1>
          <label htmlFor="script-title" className="sr-only">
            Title
          </label>
          <textarea
            id="script-title"
            defaultValue={c.title}
            maxLength={80}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            onBlur={(e) => {
              const title = e.currentTarget.value.trim();
              if (title && title !== c.title) save({ ...c, title }, "Edited title");
            }}
            className="field-sizing-content w-full resize-none rounded-sm border border-transparent bg-transparent px-1 type-title hover:border-border focus-visible:border-brand focus-visible:outline-none"
          />
          <div className="flex flex-wrap items-center gap-3 px-1">
            <span className="relative inline-flex items-center">
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute left-2.5 size-2 rounded-full",
                  STATUS_DOT[status],
                )}
              />
              <select
                aria-label="Status"
                value={status}
                onChange={(e) => {
                  const next = e.target.value as ScriptStatus;
                  setStatus(next);
                  startMeta(() => updateScriptMetaAction({ scriptId: script.id, status: next }));
                }}
                className="h-7 cursor-pointer appearance-none rounded-full border border-border bg-surface pr-3 pl-6 type-label hover:border-border-strong"
              >
                {SCRIPT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {SCRIPT_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </span>
            <select
              aria-label="Voice"
              value={voice}
              onChange={(e) => {
                const next = e.target.value as typeof voice;
                setVoice(next);
                startMeta(() => updateScriptMetaAction({ scriptId: script.id, voiceMode: next }));
              }}
              className="h-7 cursor-pointer appearance-none rounded-full border border-border bg-surface px-3 type-label hover:border-border-strong"
            >
              <option value="own">Your voice</option>
              <option value="neutral">Neutral voice</option>
            </select>
            {details}
            <SavedIndicator updatedAt={script.updatedAt} saving={pending} />
          </div>
        </div>
      </div>
    </div>
  );
}
