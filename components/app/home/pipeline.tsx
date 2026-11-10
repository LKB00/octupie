import Link from "next/link";
import { ArrowRight as ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { SCRIPT_STATUSES, SCRIPT_STATUS_LABEL, type ScriptStatus } from "@/lib/ai/schemas";
import type { ScriptRecord } from "@/lib/db/types";
import { relativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AppIcon } from "../icons";
import { SectionCard } from "../section";

export const STATUS_TONE: Record<ScriptStatus, "neutral" | "brand" | "warning" | "success"> = {
  draft: "neutral",
  ready: "brand",
  filmed: "warning",
  posted: "success",
};
export const STATUS_DOT: Record<ScriptStatus, string> = {
  draft: "bg-faint",
  ready: "bg-brand",
  filmed: "bg-warning",
  posted: "bg-success",
};

/** Draft → Ready → Filmed → Posted at a glance, plus the scripts to pick up next. */
export function Pipeline({ creatorId, scripts }: { creatorId: string; scripts: ScriptRecord[] }) {
  const at = new Date();
  const counts = Object.fromEntries(
    SCRIPT_STATUSES.map((s) => [s, scripts.filter((x) => x.status === s).length]),
  ) as Record<ScriptStatus, number>;
  const next = scripts.filter((s) => s.status !== "posted").slice(0, 4);
  return (
    <SectionCard
      title="Your pipeline"
      description="From first draft to posted"
      icon={AppIcon.scripts}
      tone="violet"
      action={
        <Link
          href={`/c/${creatorId}/scripts`}
          className="inline-flex items-center gap-1 type-label text-brand-strong hover:underline"
        >
          All scripts <ArrowRightIcon aria-hidden="true" className="size-3.5" />
        </Link>
      }
      bodyClassName="@container flex flex-col gap-4"
    >
      <ol className="grid grid-cols-2 gap-2 @md:grid-cols-4">
        {SCRIPT_STATUSES.map((s) => (
          <li key={s}>
            <Link
              href={`/c/${creatorId}/scripts?status=${s}`}
              className="flex h-full flex-col gap-1 rounded-lg border border-border bg-surface-2 p-4 transition-colors hover:border-border-strong"
            >
              <span className="type-kpi">{counts[s]}</span>
              <span className="flex min-w-0 items-center gap-1.5 type-caption whitespace-nowrap text-muted">
                <span
                  aria-hidden="true"
                  className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[s])}
                />
                <span className="truncate">{SCRIPT_STATUS_LABEL[s]}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {next.length ? (
        <ul className="-mx-2 flex flex-col">
          {next.map((s) => (
            <li key={s.id}>
              <Link
                href={`/c/${creatorId}/studio?script=${s.id}`}
                className="flex items-center gap-3 rounded-[10px] px-2 py-2.5 hover:bg-surface-2"
              >
                <span className="min-w-0 flex-1 truncate type-body-sm font-medium">{s.title}</span>
                <Badge tone={STATUS_TONE[s.status]}>{SCRIPT_STATUS_LABEL[s.status]}</Badge>
                <span className="w-16 shrink-0 text-right type-caption text-faint max-sm:hidden">
                  {relativeDate(s.updatedAt, at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="type-body-sm text-muted">
          Nothing in progress. Write your first script from an outlier.
        </p>
      )}
    </SectionCard>
  );
}
