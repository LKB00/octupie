/**
 * The one definition of "usual views" (CLAUDE.md rule 1, docs/05-ARCHITECTURE.md §3).
 * Never compute a baseline anywhere else.
 */

export const USUAL_VIEWS_DEFINITION =
  "Usual views = the median of their last 30 reels older than 3 days.";
export const YOUR_USUAL_VIEWS_DEFINITION =
  "Your usual views = the median of your last 30 reels older than 3 days.";

export const BASELINE_WINDOW_DAYS = 90;
export const BASELINE_MIN_AGE_DAYS = 3;
export const BASELINE_MAX_SAMPLE = 30;
export const BASELINE_MIN_CONFIDENT_SAMPLE = 8;

const DAY_MS = 24 * 60 * 60 * 1000;

export type BaselineReel = {
  shortcode: string;
  postedAt: string;
  views: number | null;
};

export type Baseline = {
  /** null when no eligible reels exist */
  usualViews: number | null;
  sampleSize: number;
  lowConfidence: boolean;
};

export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/**
 * Usual views for an account at time `at`:
 * reels posted in the last 90 days, excluding reels younger than 3 days and the reel being
 * scored, most recent 30, median of their views. Fewer than 8 → low confidence.
 */
export function computeBaseline(
  reels: readonly BaselineReel[],
  opts: { at: Date; excludeShortcode?: string },
): Baseline {
  const now = opts.at.getTime();
  const eligible = reels
    .filter((r) => r.shortcode !== opts.excludeShortcode && r.views !== null)
    .map((r) => ({ views: r.views as number, age: now - new Date(r.postedAt).getTime() }))
    .filter(
      (r) => r.age >= BASELINE_MIN_AGE_DAYS * DAY_MS && r.age <= BASELINE_WINDOW_DAYS * DAY_MS,
    )
    .sort((a, b) => a.age - b.age)
    .slice(0, BASELINE_MAX_SAMPLE);

  return {
    usualViews: median(eligible.map((r) => r.views)),
    sampleSize: eligible.length,
    lowConfidence: eligible.length < BASELINE_MIN_CONFIDENT_SAMPLE,
  };
}
