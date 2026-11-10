import type { Metadata } from "next";
import Link from "next/link";
import { AppIcon } from "@/components/app/icons";
import { PageHeader } from "@/components/app/page-header";
import { ScriptRowMenu } from "@/components/app/scripts/script-row-menu";
import { ScriptsFilters } from "@/components/app/scripts/scripts-filters";
import { StatusChip } from "@/components/app/scripts/status-chip";
import { EmptyState } from "@/components/app/states";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { SCRIPT_STATUSES, type ScriptStatus } from "@/lib/ai/schemas";
import { requireCreator } from "@/lib/auth/session";
import { listScripts, pillarName, scriptAsText } from "@/lib/db";
import { relativeDate } from "@/lib/format";

export const metadata: Metadata = { title: "Scripts" };

export default async function ScriptsPage({
  params,
  searchParams,
}: PageProps<"/c/[creatorId]/scripts">) {
  const { creatorId } = await params;
  const creator = await requireCreator(creatorId);
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const status = SCRIPT_STATUSES.includes(one(sp.status) as ScriptStatus)
    ? (one(sp.status) as ScriptStatus)
    : null;
  const all = listScripts();
  const scripts = listScripts({ status, pillar: one(sp.pillar) || null, q: one(sp.q) });
  const counts = Object.fromEntries(
    SCRIPT_STATUSES.map((s) => [s, all.filter((x) => x.status === s).length]),
  ) as Record<ScriptStatus, number>;
  const studio = (id: string) => `/c/${creatorId}/studio?script=${id}`;
  const at = new Date();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Scripts"
        help="Every script you've written, with its status. Open one to keep editing it in Studio."
        description="Everything you've written, from first draft to posted."
      />
      {all.length === 0 ? (
        <EmptyState
          icon={<AppIcon.scripts />}
          title="No scripts yet"
          body="Write one from an idea, or from an outlier in Discover."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href={`/c/${creatorId}/studio`} className={buttonVariants({ size: "sm" })}>
                Write a script
              </Link>
              <Link
                href={`/c/${creatorId}/discover`}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                Go to Discover
              </Link>
            </div>
          }
        />
      ) : (
        <>
          <ScriptsFilters pillars={creator.strategy.pillars} counts={counts} total={all.length} />
          {scripts.length === 0 ? (
            <EmptyState title="No scripts match" body="Try a different search or another status." />
          ) : (
            <div className="relative overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full border-collapse text-left max-md:block">
                <thead className="border-b border-border bg-surface-2/60 max-md:hidden">
                  <tr className="type-caption font-medium text-muted">
                    <th className="w-full px-5 py-3 font-medium">Script</th>
                    <th className="px-4 py-3 font-medium max-xl:hidden">Pillar</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Updated</th>
                    <th className="px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="max-md:block">
                  {scripts.map((s) => {
                    const SourceIcon = s.sourceShortcode
                      ? AppIcon.reels
                      : s.angle === "from_idea"
                        ? AppIcon.idea
                        : AppIcon.pillar;
                    const source = s.sourceShortcode
                      ? "From an outlier"
                      : s.angle === "from_idea"
                        ? "From an idea"
                        : "From a pillar";
                    return (
                      <tr
                        key={s.id}
                        data-testid="script-row"
                        className="border-b border-border transition-colors last:border-0 hover:bg-surface-2/60 max-md:grid max-md:grid-cols-[1fr_auto] max-md:gap-3 max-md:p-4"
                      >
                        <td className="max-w-0 px-5 py-3.5 max-md:max-w-none max-md:p-0">
                          <div className="flex items-center gap-3">
                            <IconTile
                              tone={
                                s.sourceShortcode
                                  ? "rose"
                                  : s.angle === "from_idea"
                                    ? "amber"
                                    : "sky"
                              }
                              size="sm"
                            >
                              <SourceIcon />
                            </IconTile>
                            <div className="min-w-0">
                              <Link
                                href={studio(s.id)}
                                className="block truncate type-card-title hover:underline"
                              >
                                {s.title}
                              </Link>
                              <p className="type-caption text-muted">
                                {s.sourceShortcode ? (
                                  <Link
                                    href={`/c/${creatorId}/reels/${s.sourceShortcode}`}
                                    className="hover:underline"
                                  >
                                    {source}
                                  </Link>
                                ) : (
                                  source
                                )}{" "}
                                · ≈ {s.content.estSeconds}s
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 max-xl:hidden">
                          {pillarName(s.pillarId) ? (
                            <Badge>{pillarName(s.pillarId)}</Badge>
                          ) : (
                            <span className="text-faint">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 max-md:col-start-1 max-md:p-0">
                          <StatusChip scriptId={s.id} status={s.status} title={s.title} />
                        </td>
                        <td className="px-4 py-3.5 type-body-sm whitespace-nowrap text-muted max-md:hidden">
                          {relativeDate(s.updatedAt, at)}
                        </td>
                        <td className="px-4 py-3.5 text-right max-md:col-start-2 max-md:row-start-1 max-md:p-0">
                          <ScriptRowMenu
                            id={s.id}
                            title={s.title}
                            text={scriptAsText(s)}
                            studioHref={studio(s.id)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
