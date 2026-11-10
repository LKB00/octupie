import { CheckCircle as CheckCircle2Icon } from "@phosphor-icons/react/dist/ssr";
import { Chip } from "@/components/ui/chip";
import type { VoiceConflict, VoiceProfile } from "@/lib/ai/schemas";
import type { VoiceSource } from "@/lib/db/types";
import { ConflictCard } from "./conflict-card";
import { PhrasesEditor } from "./phrases-editor";
import { VoiceSources } from "./voice-sources";
import { type VersionRow, VoiceVersions } from "./voice-versions";

type Props = {
  voice: VoiceProfile;
  voiceConflict: VoiceConflict;
  conflict: { status: "open" | "kept" | "resolved"; neutralPillars: string[] };
  sources: VoiceSource[];
  versions: VersionRow[];
};

function ConflictNote({ conflict }: { conflict: Props["conflict"] }) {
  const text =
    conflict.status === "kept"
      ? "You chose to keep this voice for every script."
      : conflict.neutralPillars.length
        ? `Scripts for ${conflict.neutralPillars.join(", ")} use a neutral voice.`
        : "Your voice now covers the topics your strategy targets.";
  return (
    <p className="flex items-center gap-2 type-body-sm text-muted">
      <CheckCircle2Icon aria-hidden="true" className="size-4 text-success" />
      {text}
    </p>
  );
}

export function VoiceTab({ voice: v, voiceConflict, conflict, sources, versions }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {conflict.status === "open" && voiceConflict.conflict ? (
        <ConflictCard conflict={voiceConflict} />
      ) : (
        <ConflictNote conflict={conflict} />
      )}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
            <h3 className="type-card-title">How you sound</h3>
            <p className="type-body-sm">{v.summary}</p>
            <div className="flex items-center gap-3 type-body-sm">
              <span className="text-muted">Energy</span>
              <div
                role="meter"
                aria-label="Energy"
                aria-valuenow={v.energy}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 w-40 overflow-hidden rounded-full bg-surface-3"
              >
                <div className="h-full bg-brand" style={{ width: `${v.energy}%` }} />
              </div>
              <span className="type-number">{v.energy}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {v.languageMix.map((l) => (
                <Chip key={l.lang}>
                  {l.lang.toUpperCase()} {Math.round(l.share * 100)}%
                </Chip>
              ))}
              {v.tone.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
          </section>
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
            <div>
              <h3 className="type-card-title">Signature phrases</h3>
              <p className="type-caption text-muted">
                Scripts use these where they fit. Remove any you&apos;ve grown out of.
              </p>
            </div>
            <PhrasesEditor phrases={v.phrases} />
            {v.likelyTranscriptionErrors.length ? (
              <p className="type-caption text-muted">
                Possible transcription errors to check: {v.likelyTranscriptionErrors.join(", ")}
              </p>
            ) : null}
          </section>
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
            <h3 className="type-card-title">Openers and closers</h3>
            {[...v.openers, ...v.closers].map((o) => (
              <p key={o.pattern} className="type-body-sm">
                <span className="font-medium">{o.pattern}:</span>{" "}
                <span className="text-muted italic">{o.example}</span>
              </p>
            ))}
          </section>
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <VoiceSources sources={sources} />
          <VoiceVersions versions={versions} />
        </div>
      </div>
    </div>
  );
}
