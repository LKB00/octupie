import type { Baseline } from "./baseline";

export const OUTLIER_MIN_VIEWS = 1000;
export const LOW_CONFIDENCE_MIN_MULTIPLE = 5;
export const DEFAULT_MIN_MULTIPLE = 3;
export const SPARSE_MIN_MULTIPLE = 2;

/** Raw multiple = views ÷ usual views. null when either is missing or usual is 0. */
export function computeMultiple(views: number | null, usualViews: number | null): number | null {
  if (views === null || usualViews === null || usualViews <= 0) return null;
  return views / usualViews;
}

/** 1 decimal below 10×, whole numbers from 10× up. */
export function roundMultiple(multiple: number): number {
  return multiple < 10 ? Math.round(multiple * 10) / 10 : Math.round(multiple);
}

export function formatMultiple(multiple: number): string {
  const rounded = roundMultiple(multiple);
  return `${rounded < 10 ? rounded.toFixed(1) : rounded.toString()}×`;
}

export function isOutlier(input: {
  views: number | null;
  multiple: number | null;
  baseline: Pick<Baseline, "lowConfidence">;
  minMultiple?: number;
}): boolean {
  const { views, multiple, baseline, minMultiple = DEFAULT_MIN_MULTIPLE } = input;
  if (views === null || multiple === null) return false;
  if (views < OUTLIER_MIN_VIEWS) return false;
  if (multiple < minMultiple) return false;
  return !baseline.lowConfidence || multiple >= LOW_CONFIDENCE_MIN_MULTIPLE;
}
