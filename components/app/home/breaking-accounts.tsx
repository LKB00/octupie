import type { TrackedAccount } from "@/lib/db/types";
import { compactNumber } from "@/lib/format";
import { AccountRow } from "../ig/account";
import { AppIcon } from "../icons";
import { SectionCard } from "../section";

/** Tracked accounts with the most outliers this month. */
export function BreakingAccounts({
  creatorId,
  accounts,
}: {
  creatorId: string;
  accounts: TrackedAccount[];
}) {
  const top = [...accounts].sort((a, b) => b.outliers30d - a.outliers30d).slice(0, 5);
  const max = Math.max(1, ...top.map((a) => a.outliers30d));
  return (
    <SectionCard
      title="Hot in your niche"
      description="Most outliers in the last 30 days"
      icon={AppIcon.hot}
      tone="rose"
      className="self-start"
    >
      <ul className="flex flex-col gap-4">
        {top.map((a) => (
          <li key={a.profile.handle} className="flex flex-col gap-2">
            <AccountRow
              handle={a.profile.handle}
              avatarUrl={a.profile.avatarUrl}
              href={`/c/${creatorId}/discover?account=${a.profile.handle}`}
              meta={`${compactNumber(a.profile.followers)} followers · usually ${compactNumber(a.baseline.usualViews)} views`}
              trailing={<span className="type-label text-text">{a.outliers30d} outliers</span>}
            />
            <div
              aria-hidden="true"
              className="ml-[52px] h-1 overflow-hidden rounded-full bg-surface-3"
            >
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${(a.outliers30d / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
