import { describe, expect, it } from "vitest";
import {
  breakingScore,
  computeBaseline,
  computeMultiple,
  formatMultiple,
  isOutlier,
  median,
  recency,
  roundMultiple,
  velocity,
} from ".";

const AT = new Date("2026-11-09T09:00:00Z");
const daysAgo = (d: number) => new Date(AT.getTime() - d * 86_400_000).toISOString();
const reel = (id: string, age: number, views: number | null) => ({
  shortcode: id,
  postedAt: daysAgo(age),
  views,
});

describe("median", () => {
  it("handles odd, even and empty lists", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBeNull();
  });
});

describe("computeBaseline", () => {
  it("uses the median, so one viral reel doesn't inflate it", () => {
    const reels = Array.from({ length: 9 }, (_, i) => reel(`r${i}`, 10 + i, 1000));
    reels.push(reel("viral", 5, 1_000_000));
    expect(computeBaseline(reels, { at: AT }).usualViews).toBe(1000);
  });

  it("excludes reels younger than 3 days but includes one exactly 3 days old", () => {
    const reels = [reel("young", 2.9, 50_000), reel("exact", 3, 700)];
    const b = computeBaseline(reels, { at: AT });
    expect(b.sampleSize).toBe(1);
    expect(b.usualViews).toBe(700);
  });

  it("excludes the reel being scored", () => {
    const reels = [reel("a", 5, 100), reel("b", 6, 200), reel("c", 7, 900)];
    expect(computeBaseline(reels, { at: AT, excludeShortcode: "c" }).usualViews).toBe(150);
  });

  it("ignores reels older than 90 days and keeps only the most recent 30", () => {
    const recent = Array.from({ length: 30 }, (_, i) => reel(`n${i}`, 4 + i, 100));
    const older = Array.from({ length: 10 }, (_, i) => reel(`o${i}`, 40 + i, 10_000));
    const ancient = reel("ancient", 120, 10_000);
    const b = computeBaseline([...recent, ...older, ancient], { at: AT });
    expect(b.sampleSize).toBe(30);
    expect(b.usualViews).toBe(100);
  });

  it("marks fewer than 8 reels as low confidence", () => {
    const reels = Array.from({ length: 7 }, (_, i) => reel(`r${i}`, 5 + i, 500));
    expect(computeBaseline(reels, { at: AT }).lowConfidence).toBe(true);
    reels.push(reel("r8", 20, 500));
    expect(computeBaseline(reels, { at: AT }).lowConfidence).toBe(false);
  });

  it("skips reels with null views (some carousels)", () => {
    const b = computeBaseline([reel("a", 5, null), reel("b", 6, 300)], { at: AT });
    expect(b).toMatchObject({ usualViews: 300, sampleSize: 1 });
  });

  it("returns null with no eligible reels", () => {
    expect(computeBaseline([reel("a", 1, 300)], { at: AT }).usualViews).toBeNull();
  });
});

describe("multiples", () => {
  it("is null for a zero or missing baseline, or null views", () => {
    expect(computeMultiple(1000, 0)).toBeNull();
    expect(computeMultiple(1000, null)).toBeNull();
    expect(computeMultiple(null, 1000)).toBeNull();
  });

  it("rounds to 1 decimal under 10× and whole numbers from 10×", () => {
    expect(roundMultiple(3.44)).toBe(3.4);
    expect(roundMultiple(9.96)).toBe(10);
    expect(roundMultiple(48.4)).toBe(48);
    expect(formatMultiple(3.44)).toBe("3.4×");
    expect(formatMultiple(3)).toBe("3.0×");
    expect(formatMultiple(48.4)).toBe("48×");
  });
});

describe("isOutlier", () => {
  const confident = { lowConfidence: false };
  it("needs the minimum multiple and 1,000 views", () => {
    expect(isOutlier({ views: 3000, multiple: 3, baseline: confident })).toBe(true);
    expect(isOutlier({ views: 2900, multiple: 2.9, baseline: confident })).toBe(false);
    expect(isOutlier({ views: 900, multiple: 9, baseline: confident })).toBe(false);
  });

  it("uses the sparse threshold when asked", () => {
    expect(isOutlier({ views: 2000, multiple: 2, baseline: confident, minMultiple: 2 })).toBe(true);
  });

  it("needs 5× when the baseline is low confidence", () => {
    const low = { lowConfidence: true };
    expect(isOutlier({ views: 4000, multiple: 4, baseline: low })).toBe(false);
    expect(isOutlier({ views: 5000, multiple: 5, baseline: low })).toBe(true);
  });
});

describe("breaking now", () => {
  it("keeps full weight for 7 days, then halves every 7", () => {
    expect(recency(daysAgo(7), AT)).toBe(1);
    expect(recency(daysAgo(14), AT)).toBeCloseTo(0.5);
    expect(recency(daysAgo(21), AT)).toBeCloseTo(0.25);
  });

  it("needs two snapshots in the last 24 h for velocity", () => {
    expect(velocity([{ capturedAt: daysAgo(0.5), views: 100 }], 1000, AT)).toBeNull();
    const snaps = [
      { capturedAt: daysAgo(0.5), views: 1000 },
      { capturedAt: daysAgo(0), views: 2200 },
    ];
    expect(velocity(snaps, 1000, AT)).toBeCloseTo(0.1); // 1200 views / 12 h / 1000
  });

  it("falls back to multiple × recency without snapshots", () => {
    expect(
      breakingScore({
        multiple: 4,
        postedAt: daysAgo(14),
        snapshots: [],
        usualViews: 1000,
        at: AT,
      }),
    ).toBeCloseTo(2);
  });

  it("orders ties by velocity", () => {
    const base = { multiple: 4, postedAt: daysAgo(1), usualViews: 1000, at: AT };
    const slow = breakingScore({ ...base, snapshots: [] });
    const fast = breakingScore({
      ...base,
      snapshots: [
        { capturedAt: daysAgo(0.5), views: 1000 },
        { capturedAt: daysAgo(0), views: 3000 },
      ],
    });
    expect(fast).toBeGreaterThan(slow);
  });
});
