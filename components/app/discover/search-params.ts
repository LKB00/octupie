import { DEFAULT_MIN_MULTIPLE, SPARSE_MIN_MULTIPLE } from "@/lib/outliers/multiple";
import type { FeedFilters, FeedFormat, FeedSort, FeedWindow } from "@/lib/db/types";

export type DiscoverTab = "feed" | "saved" | "map";

export type DiscoverParams = FeedFilters & { tab: DiscoverTab };

type Raw = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Filters live in the URL (docs/02 §3). Unknown values fall back to defaults. */
export function parseDiscoverParams(raw: Raw): DiscoverParams {
  const tab = one(raw.tab);
  const sort = one(raw.sort);
  const win = Number(one(raw.window));
  const format = one(raw.format);
  const min = Number(one(raw.min));
  return {
    tab: tab === "saved" || tab === "map" ? tab : "feed",
    sort: (["breaking", "newest", "multiple"] as FeedSort[]).includes(sort as FeedSort)
      ? (sort as FeedSort)
      : "breaking",
    window: ([7, 30, 90] as FeedWindow[]).includes(win as FeedWindow) ? (win as FeedWindow) : 30,
    format: (["all", "reel", "carousel"] as FeedFormat[]).includes(format as FeedFormat)
      ? (format as FeedFormat)
      : "all",
    pillar: one(raw.pillar) || null,
    account: one(raw.account) || null,
    minMultiple: min === SPARSE_MIN_MULTIPLE ? SPARSE_MIN_MULTIPLE : DEFAULT_MIN_MULTIPLE,
  };
}

const DEFAULTS: Record<string, string> = {
  tab: "feed",
  sort: "breaking",
  window: "30",
  format: "all",
  min: "3",
};

/** Build a Discover URL from the current params plus overrides, omitting defaults. */
export function discoverHref(
  base: string,
  current: DiscoverParams,
  patch: Partial<Record<keyof typeof DEFAULTS | "pillar" | "account", string | null>>,
): string {
  const merged: Record<string, string | null> = {
    tab: current.tab,
    sort: current.sort,
    window: String(current.window),
    format: current.format,
    min: String(current.minMultiple),
    pillar: current.pillar,
    account: current.account,
    ...patch,
  };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v !== null && v !== undefined && v !== "" && DEFAULTS[k] !== v) qs.set(k, v);
  }
  const s = qs.toString();
  return s ? `${base}?${s}` : base;
}
