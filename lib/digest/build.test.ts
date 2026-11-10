import { describe, expect, it } from "vitest";
import type { ScoredReel } from "@/lib/db/types";
import { buildDigest } from "./build";

const reel = (id: string, multiple: number, pillarId: string | null, daysAgo: number) =>
  ({
    shortcode: id,
    multiple,
    isOutlier: true,
    pillarId,
    hookLine: `hook ${id}`,
    caption: "",
    postedAt: new Date(Date.UTC(2026, 10, 10) - daysAgo * 86_400_000).toISOString(),
  }) as unknown as ScoredReel;

const pillars = [
  { id: "p1", name: "One", description: "" },
  { id: "p2", name: "Two", description: "" },
];
const since = new Date(Date.UTC(2026, 10, 3));

describe("buildDigest", () => {
  it("ranks the last 7 days by multiple and caps at 5", () => {
    const reels = [1, 2, 3, 4, 5, 6].map((n) => reel(`r${n}`, n, "p1", 1));
    const d = buildDigest([...reels, reel("old", 99, "p1", 20)], pillars, since);
    expect(d.top.map((r) => r.shortcode)).toEqual(["r6", "r5", "r4", "r3", "r2"]);
  });
  it("gives one idea per pillar from its best reel and lists empty pillars as quiet", () => {
    const d = buildDigest([reel("a", 3, "p1", 1), reel("b", 8, "p1", 2)], pillars, since);
    expect(d.ideas).toHaveLength(1);
    expect(d.ideas[0]!.reel.shortcode).toBe("b");
    expect(d.quiet.map((p) => p.id)).toEqual(["p2"]);
  });
});
