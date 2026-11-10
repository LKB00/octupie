import type { Metadata } from "next";
import Link from "next/link";
import { EditableText } from "@/components/app/context/editable-text";
import { ListEditor } from "@/components/app/context/list-editor";
import { LiveFacts } from "@/components/app/context/live-facts";
import { PillarsEditor } from "@/components/app/context/pillars-editor";
import { VoiceTab } from "@/components/app/context/voice-tab";
import { WhatChanged } from "@/components/app/context/what-changed";
import { PageHeader } from "@/components/app/page-header";
import { requireCreator } from "@/lib/auth/session";
import { now } from "@/lib/clock";
import { getContext } from "@/lib/db";
import { relativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Brand & voice" };

/** Edits are stamped with the real clock; mock "now" is pinned, so anything newer is "just now". */
function ago(iso: string) {
  const at = now();
  return new Date(iso) > at ? "just now" : relativeDate(iso, at);
}

export default async function ContextPage({
  params,
  searchParams,
}: PageProps<"/c/[creatorId]/context">) {
  const { creatorId } = await params;
  await requireCreator(creatorId);
  const tab = (await searchParams).tab === "voice" ? "voice" : "about";
  const ctx = getContext();
  const s = ctx.strategy;
  const pill = (active: boolean) =>
    cn(
      "type-label inline-flex h-8 shrink-0 items-center rounded-sm px-4 whitespace-nowrap text-muted hover:text-text",
      active && "bg-surface text-text shadow-selected",
    );

  return (
    <div className="@container flex flex-col gap-8">
      <PageHeader
        title="Brand & voice"
        help="What we know about you and how you sound. Every script uses this, so keep it current."
        description="Every script is written from this. Edit anything; changes apply to new scripts."
        actions={
          <nav
            aria-label="Brand & voice sections"
            className="inline-flex rounded-[10px] bg-surface-3 p-0.5"
          >
            <Link
              href={`/c/${creatorId}/context`}
              aria-current={tab === "about" ? "page" : undefined}
              className={pill(tab === "about")}
            >
              About you
            </Link>
            <Link
              href={`/c/${creatorId}/context?tab=voice`}
              aria-current={tab === "voice" ? "page" : undefined}
              className={pill(tab === "voice")}
            >
              Voice
            </Link>
          </nav>
        }
      />
      {tab === "about" ? (
        <div className="flex flex-col gap-6">
          <WhatChanged />
          <div className="grid items-start gap-6 @4xl:grid-cols-3">
            <EditableText field="positioning" title="Positioning" value={s.positioning} />
            <EditableText field="audience" title="Ideal customer" value={s.audience} />
            <EditableText field="goals" title="Goals" value={s.goals} />
          </div>
          <PillarsEditor pillars={s.pillars} />
          <LiveFacts
            facts={ctx.facts.map((f) => ({
              id: f.id,
              label: f.label,
              value: f.value,
              checked: ago(f.checkedAt),
            }))}
          />
          <div className="grid items-start gap-6 @4xl:grid-cols-2">
            <ListEditor
              kind="proof"
              title="Proof bank"
              hint="Results and stories scripts can cite."
              items={s.proof}
              empty="No proof yet. Add a result a client got."
              placeholder="e.g. 3 students hired at Swiggy in 2026"
            />
            <ListEditor
              kind="dontUse"
              title="Don't use"
              hint="Words, claims and topics scripts must avoid."
              items={s.dontUse}
              empty="Nothing yet."
              placeholder="e.g. guaranteed results"
            />
          </div>
        </div>
      ) : (
        <VoiceTab
          voice={ctx.voice}
          voiceConflict={ctx.voiceConflict}
          conflict={ctx.conflict}
          sources={ctx.sources}
          versions={ctx.versions.map((v) => ({
            id: v.id,
            reason: v.reason,
            when: ago(v.createdAt),
          }))}
        />
      )}
    </div>
  );
}
