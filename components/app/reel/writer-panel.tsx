"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Check as CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { writeScriptAction } from "@/app/(app)/_actions/reel";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { NativeSelect } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ANGLE_LABEL, type AnglePreviews, type ReelAngle, type VoiceMode } from "@/lib/ai/schemas";
import type { Pillar } from "@/lib/db/types";
import { cn } from "@/lib/utils";
import { AppIcon } from "../icons";
import { ErrorState, UpgradeCard } from "../states";

export type VoicePreviews = Record<VoiceMode, string>;

type Props = {
  creatorId: string;
  shortcode: string;
  previews: AnglePreviews;
  voicePreviews: VoicePreviews;
  pillars: Pillar[];
  defaultPillarId: string | null;
  atLimit: boolean;
};

const ANGLES: { id: ReelAngle; icon: typeof AppIcon.angleHook; tone: "violet" | "sky" | "rose" }[] =
  [
    { id: "same_hook", icon: AppIcon.angleHook, tone: "violet" },
    { id: "same_structure", icon: AppIcon.angleStructure, tone: "sky" },
    { id: "counter_take", icon: AppIcon.angleCounter, tone: "rose" },
  ];

/** "Make your version": angle, voice, pillar and the paid button, right next to the breakdown. */
export function WriterPanel({
  creatorId,
  shortcode,
  previews,
  voicePreviews,
  pillars,
  defaultPillarId,
  atLimit,
}: Props) {
  const router = useRouter();
  const pillarSelect = useId();
  const [angle, setAngle] = useState<ReelAngle>("same_hook");
  const [voice, setVoice] = useState<VoiceMode>("own");
  const [pillar, setPillar] = useState(defaultPillarId ?? pillars[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(atLimit);
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      setError(null);
      const res = await writeScriptAction({
        angle,
        voiceMode: voice,
        pillarId: pillar || null,
        shortcode,
        idea: null,
      });
      if (!res.ok) {
        if (res.reason === "quota") setLimit(true);
        else setError(res.message);
        return;
      }
      toast.success(`Script saved to Scripts · ${res.remaining}`);
      router.push(`/c/${creatorId}/studio?script=${res.scriptId}`);
    });

  return (
    <section
      aria-labelledby="writer-title"
      data-testid="writer-panel"
      className="flex scroll-mt-24 flex-col gap-5 rounded-xl border border-border bg-surface p-5 md:scroll-mt-6"
    >
      <div className="flex items-center gap-3">
        <IconTile tone="violet">
          <AppIcon.write />
        </IconTile>
        <div>
          <h2 id="writer-title" className="type-card-title">
            Make your version
          </h2>
          <p className="type-caption text-muted">Same mechanism, your story and voice.</p>
        </div>
      </div>
      {limit ? (
        <UpgradeCard what="scripts" />
      ) : (
        <>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 type-label text-muted">Angle</legend>
            {ANGLES.map(({ id, icon: Icon, tone }) => {
              const checked = angle === id;
              return (
                <label
                  key={id}
                  className={cn(
                    "relative flex cursor-pointer gap-3 rounded-lg border p-4 transition-[border-color,background-color,box-shadow] has-focus-visible:outline-2 has-focus-visible:outline-brand",
                    checked
                      ? "border-brand bg-brand-weak"
                      : "border-border hover:border-border-strong hover:bg-surface-2",
                  )}
                >
                  <input
                    type="radio"
                    name="angle"
                    value={id}
                    checked={checked}
                    onChange={() => setAngle(id)}
                    className="sr-only"
                  />
                  <IconTile tone={tone} size="sm">
                    <Icon />
                  </IconTile>
                  <span className="flex min-w-0 flex-col gap-0.5 pr-5">
                    <span className="type-card-title">{ANGLE_LABEL[id]}</span>
                    <span className="type-caption text-muted">{previews[id]}</span>
                  </span>
                  {checked ? (
                    <CheckIcon
                      aria-hidden="true"
                      className="absolute top-3 right-3 size-4 text-brand"
                    />
                  ) : null}
                </label>
              );
            })}
          </fieldset>
          <div className="flex flex-col gap-2">
            <span className="type-label text-muted">Voice</span>
            <SegmentedControl
              aria-label="Voice"
              className="w-full [&>*]:flex-1"
              options={[
                { value: "own", label: "Your voice" },
                { value: "neutral", label: "Neutral" },
              ]}
              value={voice}
              onValueChange={setVoice}
            />
            <p className="rounded-sm bg-surface-2 px-3 py-2 type-caption text-muted italic">
              “{voicePreviews[voice]}”
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={pillarSelect} className="type-label text-muted">
              Pillar
            </label>
            <NativeSelect
              id={pillarSelect}
              value={pillar}
              onChange={(e) => setPillar(e.target.value)}
            >
              {pillars.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </NativeSelect>
          </div>
          {error ? <ErrorState title={error} /> : null}
          <Button
            size="lg"
            onClick={submit}
            disabled={pending}
            cost="uses 1 script"
            className="w-full"
          >
            {pending ? "Writing your script…" : "Write script"}
          </Button>
          <p className="-mt-2 text-center type-caption text-faint">
            Saved to Scripts automatically. Edit it in Studio.
          </p>
        </>
      )}
    </section>
  );
}
