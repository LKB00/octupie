"use client";

import { useOptimistic, useTransition } from "react";
import { CaretDown as ChevronDownIcon } from "@phosphor-icons/react/dist/ssr";
import { updateScriptMetaAction } from "@/app/(app)/_actions/studio";
import { SCRIPT_STATUSES, SCRIPT_STATUS_LABEL, type ScriptStatus } from "@/lib/ai/schemas";
import { cn } from "@/lib/utils";

const TONE: Record<ScriptStatus, string> = {
  draft: "bg-surface-3 text-muted",
  ready: "bg-brand-weak text-brand-strong",
  filmed: "bg-warning-bg text-warning",
  posted: "bg-success-bg text-success",
};
const DOT: Record<ScriptStatus, string> = {
  draft: "bg-faint",
  ready: "bg-brand",
  filmed: "bg-warning",
  posted: "bg-success",
};

/** Status as a dropdown chip; changing it saves immediately. */
export function StatusChip({
  scriptId,
  status,
  title,
}: {
  scriptId: string;
  status: ScriptStatus;
  title: string;
}) {
  const [, start] = useTransition();
  const [value, setValue] = useOptimistic(status);
  return (
    <span className={cn("relative inline-flex h-7 items-center rounded-full", TONE[value])}>
      <span
        aria-hidden="true"
        className={cn("pointer-events-none absolute left-2.5 size-1.5 rounded-full", DOT[value])}
      />
      <select
        aria-label={`Status of ${title}`}
        value={value}
        onChange={(e) => {
          const next = e.target.value as ScriptStatus;
          start(async () => {
            setValue(next);
            await updateScriptMetaAction({ scriptId, status: next });
          });
        }}
        className="h-7 cursor-pointer appearance-none rounded-full bg-transparent pr-7 pl-5.5 type-label"
      >
        {SCRIPT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {SCRIPT_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute right-2 size-3.5"
      />
    </span>
  );
}
