"use client";

import { useState, useTransition } from "react";
import {
  FileText as FileTextIcon,
  Microphone as MicIcon,
  Plus as PlusIcon,
} from "@phosphor-icons/react/dist/ssr";
import { toggleSourceAction } from "@/app/(app)/_actions/context";
import { AppIcon } from "@/components/app/icons";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { Switch } from "@/components/ui/switch";
import type { VoiceSource } from "@/lib/db/types";
import { WritingSampleDialog } from "./writing-sample-dialog";

const ICON = { reels: AppIcon.reels, recording: MicIcon, writing: FileTextIcon } as const;

function SourceRow({ source }: { source: VoiceSource }) {
  const [pending, start] = useTransition();
  const Icon = ICON[source.kind];
  const unavailable = source.kind === "recording" && !source.text;
  return (
    <li className="flex items-center gap-3 py-3">
      <IconTile tone="neutral">
        <Icon />
      </IconTile>
      <div className="min-w-0 flex-1">
        <p id={`src-${source.id}`} className="type-label">
          {source.label}
        </p>
        <p className="type-caption text-muted">
          {unavailable ? "Not recorded yet" : source.detail}
        </p>
      </div>
      <Switch
        aria-labelledby={`src-${source.id}`}
        checked={source.enabled}
        disabled={pending || unavailable}
        onCheckedChange={() => start(() => toggleSourceAction(source.id))}
      />
    </li>
  );
}

/** What the voice is learned from. Turning one off rebuilds the voice as a new version. */
export function VoiceSources({ sources }: { sources: VoiceSource[] }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="type-card-title">Learned from</h3>
          <p className="type-caption text-muted">
            Turn a source off to stop it shaping your voice.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          <PlusIcon aria-hidden="true" /> Writing sample
        </Button>
      </div>
      <ul className="divide-y divide-border">
        {sources.map((s) => (
          <SourceRow key={s.id} source={s} />
        ))}
      </ul>
      <WritingSampleDialog open={open} onOpenChange={setOpen} />
    </section>
  );
}
