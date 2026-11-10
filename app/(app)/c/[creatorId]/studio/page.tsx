import type { Metadata } from "next";
import { AssistantPanel } from "@/components/app/studio/assistant-panel";
import { ScriptEditor } from "@/components/app/studio/script-editor";
import { ScriptToolbar } from "@/components/app/studio/script-toolbar";
import { StudioHeader } from "@/components/app/studio/studio-header";
import { StudioEmpty, type Starter } from "@/components/app/studio/studio-empty";
import { StudioWorkspace } from "@/components/app/studio/studio-workspace";
import { EmptyState } from "@/components/app/states";
import { SCRIPT_STATUS_LABEL } from "@/lib/ai/schemas";
import { requireCreator } from "@/lib/auth/session";
import { relativeDate } from "@/lib/format";
import Link from "next/link";
import type { ChatSummary } from "@/components/app/studio/chat-list";
import {
  getFeed,
  getReelDetail,
  getScript,
  getUsage,
  listScripts,
  pillarName,
  scriptAsText,
} from "@/lib/db";

export const metadata: Metadata = { title: "Studio" };

export default async function StudioPage({
  params,
  searchParams,
}: PageProps<"/c/[creatorId]/studio">) {
  const { creatorId } = await params;
  const creator = await requireCreator(creatorId);
  const { script: scriptParam } = await searchParams;
  const scriptId = Array.isArray(scriptParam) ? scriptParam[0] : scriptParam;
  const usage = getUsage();
  const at = new Date();
  const chats: ChatSummary[] = listScripts().map((sc) => ({
    id: sc.id,
    title: sc.title,
    status: sc.status,
    updatedAt: sc.updatedAt,
    meta: `${SCRIPT_STATUS_LABEL[sc.status]} · ${relativeDate(sc.updatedAt, at)}`,
  }));

  if (!scriptId) {
    const top = (
      await getFeed({
        sort: "breaking",
        window: 7,
        format: "all",
        pillar: null,
        account: null,
        minMultiple: 3,
      })
    ).slice(0, 2);
    const starters: Starter[] = [
      ...top.map((r) => ({
        kind: "reel" as const,
        reel: {
          shortcode: r.shortcode,
          thumbnailUrl: r.thumbnailUrl,
          hook: r.hookLine || r.caption,
          handle: r.ownerHandle,
          views: r.views,
          multiple: r.multiple,
          usualViews: r.baseline.usualViews,
          lowConfidence: r.baseline.lowConfidence,
        },
        href: `/c/${creatorId}/reels/${r.shortcode}`,
      })),
      ...creator.strategy.pillars.slice(0, 4 - top.length).map((p) => ({
        kind: "pillar" as const,
        pillarId: p.id,
        name: p.name,
        description: p.description,
      })),
    ];
    return (
      <StudioWorkspace
        creatorId={creatorId}
        chats={chats}
        activeId={null}
        empty={
          <StudioEmpty
            creatorId={creatorId}
            recent={
              chats[0]
                ? {
                    title: chats[0].title,
                    meta: chats[0].meta,
                    href: `/c/${creatorId}/studio?script=${chats[0].id}`,
                  }
                : null
            }
            name={creator.displayName}
            starters={starters}
            pillars={creator.strategy.pillars}
            atLimit={usage.scripts.atLimit}
          />
        }
      />
    );
  }

  const script = getScript(scriptId);
  if (!script) {
    return (
      <EmptyState
        title="We couldn't find that script"
        body="It may have been deleted. Your other scripts are in Scripts."
      />
    );
  }
  const source = script.sourceShortcode ? await getReelDetail(script.sourceShortcode) : null;

  const pillar = pillarName(script.pillarId);
  return (
    <StudioWorkspace
      creatorId={creatorId}
      chats={chats}
      activeId={script.id}
      header={
        <StudioHeader
          key={`h-${script.currentVersionId}`}
          script={script}
          details={
            <span className="flex flex-wrap items-center gap-x-2 type-caption text-muted">
              <span>≈ {script.content.estSeconds} s</span>
              {pillar ? <span>· {pillar}</span> : null}
              {source ? (
                <span>
                  ·{" "}
                  <Link
                    href={`/c/${creatorId}/reels/${source.reel.shortcode}`}
                    className="font-medium text-brand-strong hover:underline"
                  >
                    from {source.reel.ownerHandle}
                  </Link>
                </span>
              ) : null}
            </span>
          }
        />
      }
      toolbar={<ScriptToolbar script={script} text={scriptAsText(script)} />}
      editor={<ScriptEditor key={script.currentVersionId} script={script} />}
      assistant={<AssistantPanel script={script} atLimit={usage.chatMessages.atLimit} />}
    />
  );
}
