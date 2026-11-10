import Link from "next/link";
import { Info as InfoIcon } from "@phosphor-icons/react/dist/ssr";
import { AddSuggestedButton } from "./add-suggested-button";
import { discoverHref, type DiscoverParams } from "./search-params";

const WIDER: Record<number, number | undefined> = { 7: 30, 30: 90 };
const link = "type-body-sm font-medium text-brand-strong underline-offset-4 hover:underline";

/** Fewer than 15 cards: one quiet line that says why, with concrete ways to see more. */
export function SparseBanner({
  count,
  base,
  params,
}: {
  count: number;
  base: string;
  params: DiscoverParams;
}) {
  const wider = WIDER[params.window];
  return (
    <div
      role="status"
      data-testid="sparse-banner"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 type-body-sm text-muted"
    >
      <InfoIcon aria-hidden="true" className="size-4 shrink-0 text-tint-sky" />
      <span>
        Only {count} {count === 1 ? "outlier" : "outliers"} in the last {params.window} days
        {params.minMultiple > 2 ? ` at ${params.minMultiple}× and up` : ""}.
      </span>
      {wider ? (
        <Link className={link} href={discoverHref(base, params, { window: String(wider) })}>
          Try {wider} days
        </Link>
      ) : null}
      {params.minMultiple > 2 ? (
        <Link className={link} href={discoverHref(base, params, { min: "2" })}>
          Show 2× and up
        </Link>
      ) : null}
      <AddSuggestedButton variant="link" />
    </div>
  );
}
