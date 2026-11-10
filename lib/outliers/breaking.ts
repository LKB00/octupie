const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export type ViewSnapshot = { capturedAt: string; views: number };

/** 1 for reels up to 7 days old, then halves every 7 days. */
export function recency(postedAt: string, at: Date): number {
  const ageDays = Math.max(0, (at.getTime() - new Date(postedAt).getTime()) / DAY_MS);
  return ageDays <= 7 ? 1 : Math.pow(0.5, (ageDays - 7) / 7);
}

/**
 * Views gained per hour over the last 24 h, divided by usual views.
 * null without two snapshots in that window.
 */
export function velocity(
  snapshots: readonly ViewSnapshot[],
  usualViews: number | null,
  at: Date,
): number | null {
  if (!usualViews || usualViews <= 0) return null;
  const from = at.getTime() - DAY_MS;
  const recent = snapshots
    .filter((s) => {
      const t = new Date(s.capturedAt).getTime();
      return t >= from && t <= at.getTime();
    })
    .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());
  if (recent.length < 2) return null;
  const first = recent[0]!;
  const last = recent[recent.length - 1]!;
  const hours =
    (new Date(last.capturedAt).getTime() - new Date(first.capturedAt).getTime()) / HOUR_MS;
  if (hours <= 0) return null;
  return Math.max(0, last.views - first.views) / hours / usualViews;
}

/** Breaking now = multiple × (1 + velocity) × recency; without snapshots, multiple × recency. */
export function breakingScore(input: {
  multiple: number;
  postedAt: string;
  snapshots: readonly ViewSnapshot[];
  usualViews: number | null;
  at: Date;
}): number {
  const v = velocity(input.snapshots, input.usualViews, input.at);
  const r = recency(input.postedAt, input.at);
  return input.multiple * (1 + (v ?? 0)) * r;
}
