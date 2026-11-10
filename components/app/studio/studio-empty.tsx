"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowUpRight as ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { AppIcon } from "../icons";
import { toast } from "sonner";
import { writeScriptAction } from "@/app/(app)/_actions/reel";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { VoiceMode } from "@/lib/ai/schemas";
import type { Pillar } from "@/lib/db/types";
import { ReelRow, type ReelRowData } from "../reel-row";
import { ErrorState, UpgradeCard } from "../states";
import { WritingProgress } from "./writing-progress";

export type Starter =
  | { kind: "reel"; reel: ReelRowData; href: string }
  | { kind: "pillar"; pillarId: string; name: string; description: string };

type Props = {
  creatorId: string;
  /** The most recently edited script, to jump back into */
  recent: { title: string; meta: string; href: string } | null;
  name: string;
  starters: Starter[];
  pillars: Pillar[];
  atLimit: boolean;
};

/** No script open: an idea composer, then starters from outliers and pillars. */
export function StudioEmpty({ creatorId, recent, name, starters, pillars, atLimit }: Props) {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [voice, setVoice] = useState<VoiceMode>("own");
  const [pillar, setPillar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(atLimit);
  const [pending, start] = useTransition();

  const write = (input: Parameters<typeof writeScriptAction>[0]) =>
    start(async () => {
      setError(null);
      const res = await writeScriptAction(input);
      if (!res.ok) {
        if (res.reason === "quota") setLimit(true);
        else setError(res.message);
        return;
      }
      toast.success(`Script saved to Scripts · ${res.remaining}`);
      router.push(`/c/${creatorId}/studio?script=${res.scriptId}`);
    });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-4 md:py-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <IconTile tone="violet" size="lg">
          <AppIcon.write />
        </IconTile>
        <h1 className="type-display">What should we write, {name}?</h1>
        <p className="type-body text-muted">
          Describe an idea, or start from an outlier or one of your pillars.
        </p>
      </div>

      {limit ? <UpgradeCard what="scripts" /> : null}
      {recent && !pending ? (
        <Link
          href={recent.href}
          className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-border-strong hover:bg-surface-2/60"
        >
          <IconTile tone="neutral" size="sm">
            <AppIcon.scripts />
          </IconTile>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="type-caption text-muted">Continue where you left off</span>
            <span className="truncate type-label">{recent.title}</span>
          </span>
          <span className="shrink-0 type-caption text-faint max-sm:hidden">{recent.meta}</span>
          <ArrowUpRightIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-faint group-hover:text-text"
          />
        </Link>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (idea.trim())
            write({
              angle: "from_idea",
              voiceMode: voice,
              pillarId: pillar || null,
              shortcode: null,
              idea,
            });
        }}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 transition-[border-color,box-shadow] focus-within:border-brand focus-within:shadow-glow"
      >
        <label htmlFor="idea" className="sr-only">
          Describe an idea
        </label>
        <textarea
          id="idea"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={3}
          maxLength={400}
          placeholder="e.g. Why fintech onboarding should show the reward before KYC…"
          className="min-h-24 resize-none bg-transparent px-2 pt-1 type-body placeholder:text-faint focus-visible:outline-none"
        />
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            size="sm"
            aria-label="Voice"
            options={[
              { value: "own", label: "Your voice" },
              { value: "neutral", label: "Neutral" },
            ]}
            value={voice}
            onValueChange={setVoice}
          />
          <span className="relative inline-flex">
            <AppIcon.pillar
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted"
            />
            <select
              aria-label="Pillar"
              value={pillar}
              onChange={(e) => setPillar(e.target.value)}
              className="h-8 cursor-pointer appearance-none rounded-sm border border-border bg-surface pr-3 pl-7 type-label hover:border-border-strong"
            >
              <option value="">Any pillar</option>
              {pillars.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </span>
          <Button
            type="submit"
            className="ml-auto"
            disabled={pending || !idea.trim() || limit}
            cost="uses 1 script"
          >
            {pending ? "Writing…" : "Write my script"}
          </Button>
        </div>
      </form>
      {error ? <ErrorState title={error} /> : null}
      {pending ? <WritingProgress /> : null}

      <div className={pending ? "hidden" : "@container flex flex-col gap-3"}>
        <p className="type-overline text-faint">Or start from</p>
        <ul className="grid gap-3 @xl:grid-cols-2">
          {starters.map((s) => (
            <li key={s.kind === "reel" ? s.reel.shortcode : s.pillarId}>
              {s.kind === "reel" ? (
                <ReelRow reel={s.reel} href={s.href} className="h-full" />
              ) : (
                <button
                  type="button"
                  disabled={pending || limit}
                  onClick={() =>
                    write({
                      angle: "from_pillar",
                      voiceMode: voice,
                      pillarId: s.pillarId,
                      shortcode: null,
                      idea: null,
                    })
                  }
                  className="group flex h-full w-full items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:border-border-strong hover:bg-surface-2/60 disabled:opacity-50"
                >
                  <IconTile tone="sky" className="h-16 w-12 rounded-lg">
                    <AppIcon.pillar />
                  </IconTile>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate type-caption text-muted">Pillar · uses 1 script</span>
                    <span className="type-card-title">{s.name}</span>
                    <span className="type-caption text-muted">{s.description}</span>
                  </span>
                  <ArrowUpRightIcon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-faint group-hover:text-text"
                  />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
