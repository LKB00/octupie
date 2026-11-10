"use client";

import {
  Minus as MinusIcon,
  Plus as PlusIcon,
  ArrowUUpLeft as Undo2Icon,
} from "@phosphor-icons/react/dist/ssr";
import type { ScriptDiff } from "@/lib/studio/diff";
import { cn } from "@/lib/utils";

const BEAT: Record<string, string> = { hook: "Hook", setup: "Setup", payoff: "Payoff", cta: "CTA" };

/** What an edit changed, as a small diff card: old line struck in red, new line in green. */
export function EditDiff({
  summary,
  diff,
  onUndo,
  undoDisabled,
}: {
  summary: string;
  diff: ScriptDiff;
  onUndo: () => void;
  undoDisabled: boolean;
}) {
  return (
    <figure className="overflow-hidden rounded-[10px] border border-border bg-surface">
      <figcaption className="flex h-9 items-center gap-2 border-b border-border bg-surface-2 pr-1 pl-3">
        <span className="min-w-0 flex-1 truncate type-caption font-medium text-text">
          {summary}
        </span>
        <span className="type-caption font-medium whitespace-nowrap">
          <span className="text-success">+{diff.added}</span>{" "}
          <span className="text-danger">−{diff.removed}</span>
        </span>
        <button
          type="button"
          onClick={onUndo}
          disabled={undoDisabled}
          className="inline-flex h-7 items-center gap-1 rounded-sm px-2 type-caption font-medium text-muted hover:bg-surface-3 hover:text-text disabled:opacity-50"
        >
          <Undo2Icon aria-hidden="true" className="size-3.5" />
          Undo
        </button>
      </figcaption>
      <ol>
        {diff.rows.map((r, i) => {
          const removed = r.kind === "removed";
          const Icon = removed ? MinusIcon : PlusIcon;
          return (
            <li
              key={i}
              className={cn(
                "grid grid-cols-[2.5rem_1rem_minmax(0,1fr)] items-start gap-1 py-1.5 pr-3 type-body-sm",
                removed ? "bg-danger-bg" : "bg-success-bg",
              )}
            >
              <span className="pl-2 type-caption text-faint tabular-nums">
                {r.line ?? BEAT[r.label] ?? r.label}
              </span>
              <Icon
                aria-hidden="true"
                className={cn("mt-1 size-3", removed ? "text-danger" : "text-success")}
              />
              <span className={cn(removed && "text-muted line-through decoration-danger/40")}>
                <span className="sr-only">{removed ? "Removed: " : "Added: "}</span>
                {r.text}
              </span>
            </li>
          );
        })}
      </ol>
      {diff.more ? (
        <p className="border-t border-border px-3 py-1.5 type-caption text-muted">
          {diff.more} more {diff.more === 1 ? "change" : "changes"} in the script
        </p>
      ) : null}
    </figure>
  );
}
