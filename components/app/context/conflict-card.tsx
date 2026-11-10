"use client";

import { useState, useTransition } from "react";
import { Warning as TriangleAlertIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { resolveConflictAction } from "@/app/(app)/_actions/context";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import type { VoiceConflict } from "@/lib/ai/schemas";
import { WritingSampleDialog } from "./writing-sample-dialog";

/** Voice vs strategy mismatch (docs/01 F7). Disappears once the creator picks an option. */
export function ConflictCard({
  conflict,
  compact = false,
}: {
  conflict: VoiceConflict;
  compact?: boolean;
}) {
  const [sampleOpen, setSampleOpen] = useState(false);
  const [pending, start] = useTransition();
  const resolve = (choice: "keep" | "neutral") =>
    start(async () => {
      await resolveConflictAction({ choice, pillars: conflict.pillarsAtRisk });
      toast.success(
        choice === "keep"
          ? "Keeping your current voice for every script."
          : `Scripts for ${conflict.pillarsAtRisk.join(", ")} will use a neutral voice.`,
      );
    });
  return (
    <section
      aria-labelledby="conflict-title"
      aria-busy={pending}
      className="flex flex-col gap-4 rounded-xl border border-warning/25 bg-warning-bg p-5"
    >
      <div className="flex items-start gap-3">
        <IconTile tone="amber">
          <TriangleAlertIcon />
        </IconTile>
        <div className="flex flex-col gap-1">
          <h2 id="conflict-title" className="type-card-title">
            Your voice and your strategy don&apos;t match yet
          </h2>
          <p className="type-body-sm text-muted">
            Your voice comes from{" "}
            <strong className="font-medium text-text">{conflict.voiceIsFrom}</strong>. Your strategy
            targets <strong className="font-medium text-text">{conflict.strategyTargets}</strong>.
          </p>
          {!compact ? <p className="type-body-sm text-muted">{conflict.risk}</p> : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={pending} onClick={() => setSampleOpen(true)}>
          Add a writing sample
        </Button>
        <Button variant="secondary" size="sm" disabled={pending} onClick={() => resolve("keep")}>
          Keep this voice
        </Button>
        {!compact ? (
          <Button
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => resolve("neutral")}
          >
            Neutral voice for {conflict.pillarsAtRisk.length} pillars
          </Button>
        ) : null}
      </div>
      <WritingSampleDialog open={sampleOpen} onOpenChange={setSampleOpen} />
    </section>
  );
}
