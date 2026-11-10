import type { TrackedAccount, UsageSummary } from "@/lib/db/types";
import { compactNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AccountRow } from "../ig/account";
import { UsualTooltip } from "../usual-tooltip";
import { AddAccountForm } from "./add-account-form";
import { RemoveAccountButton } from "./remove-account-button";
import { discoverHref, type DiscoverParams } from "./search-params";

type Props = {
  accounts: TrackedAccount[];
  base: string;
  params: DiscoverParams;
  usage: UsageSummary;
};

/** Tracked accounts panel: add, filter by clicking, remove. A list beside the feed, a grid below it. */
export function TrackedRail({ accounts, base, params, usage }: Props) {
  const t = usage.trackedAccounts;
  return (
    <aside
      aria-labelledby="tracked-title"
      className="@container flex flex-col gap-4 self-start rounded-xl border border-border bg-surface p-5 xl:sticky xl:top-6 xl:max-h-[calc(100dvh-8.25rem)]"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="tracked-title" className="type-card-title">
          Tracked accounts
        </h2>
        <span className="shrink-0 type-caption text-muted">
          {t.limit !== null && t.used > t.limit
            ? `Plan limit ${t.limit}`
            : `${t.used} of ${t.limit}`}
        </span>
      </div>
      <AddAccountForm compact />
      <ul className="-mx-2 grid gap-1 overflow-y-auto @xl:grid-cols-2 @3xl:grid-cols-3">
        {accounts.map((a) => {
          const active = params.account === a.profile.handle;
          return (
            <li
              key={a.profile.handle}
              className={cn(
                "group/row rounded-[10px] py-2 pr-1 pl-2",
                active ? "bg-brand-weak" : "hover:bg-surface-2",
              )}
            >
              <AccountRow
                handle={a.profile.handle}
                avatarUrl={a.profile.avatarUrl}
                size={32}
                href={discoverHref(base, params, {
                  tab: "feed",
                  account: active ? null : a.profile.handle,
                })}
                meta={`usually ${compactNumber(a.baseline.usualViews)} · ${a.outliers30d} ${a.outliers30d === 1 ? "outlier" : "outliers"}`}
                trailing={
                  <span className="opacity-0 transition-opacity group-focus-within/row:opacity-100 group-hover/row:opacity-100">
                    <RemoveAccountButton handle={a.profile.handle} />
                  </span>
                }
              />
            </li>
          );
        })}
      </ul>
      <UsualTooltip>
        <button
          type="button"
          className="self-start type-caption text-muted underline decoration-dotted underline-offset-4"
        >
          What does &quot;usually&quot; mean?
        </button>
      </UsualTooltip>
    </aside>
  );
}
