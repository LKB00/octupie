"use client";

import { useTransition } from "react";
import { ClockCounterClockwise as HistoryIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { restoreVoiceAction } from "@/app/(app)/_actions/context";
import { Button } from "@/components/ui/button";

export type VersionRow = { id: string; reason: string; when: string };

/** Newest first; the first row is the voice in use. */
export function VoiceVersions({ versions }: { versions: VersionRow[] }) {
  const [pending, start] = useTransition();
  return (
    <section className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2">
        <HistoryIcon aria-hidden="true" className="size-4 text-muted" />
        <h3 className="type-card-title">Versions</h3>
      </div>
      <ol className="divide-y divide-border">
        {versions.map((v, i) => (
          <li key={v.id} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="type-label">{v.reason}</p>
              <p className="type-caption text-muted">{v.when}</p>
            </div>
            {i === 0 ? (
              <span className="type-caption font-medium text-success">In use</span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await restoreVoiceAction(v.id);
                    toast.success("Voice restored. New scripts will use it.");
                  })
                }
              >
                Restore
              </Button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
