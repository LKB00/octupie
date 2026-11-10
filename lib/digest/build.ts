import type { Pillar, ScoredReel } from "@/lib/db/types";

export type DigestIdea = { pillar: Pillar; reel: ScoredReel; idea: string };
export type Digest = { top: ScoredReel[]; ideas: DigestIdea[]; quiet: Pillar[] };

const hookOf = (r: ScoredReel) => (r.hookLine || r.caption.split("#")[0] || "").trim();

/**
 * The Monday email (docs/01): top 5 outliers of the last 7 days, plus one ready-to-write idea
 * per pillar from that pillar's best outlier. Pillars with nothing this week are listed as quiet.
 */
export function buildDigest(reels: ScoredReel[], pillars: Pillar[], since: Date): Digest {
  const recent = reels
    .filter((r) => r.isOutlier && r.multiple !== null && new Date(r.postedAt) >= since)
    .sort((a, b) => (b.multiple ?? 0) - (a.multiple ?? 0));
  const ideas: DigestIdea[] = [];
  const quiet: Pillar[] = [];
  for (const pillar of pillars) {
    const best = recent.find((r) => r.pillarId === pillar.id);
    if (best)
      ideas.push({
        pillar,
        reel: best,
        idea: `Your take on “${hookOf(best)}”, told through your own work.`,
      });
    else quiet.push(pillar);
  }
  return { top: recent.slice(0, 5), ideas, quiet };
}
