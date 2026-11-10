import type { AnglePreviews, Breakdown } from "@/lib/ai/schemas";

const clip = (s: string, n = 120) => (s.length <= n ? s : `${s.slice(0, n - 1).trimEnd()}…`);

/** Canned P3 output: one line per angle, aimed at the creator's first pillar. */
export function mockAnglePreviews(breakdown: Breakdown, pillarName: string): AnglePreviews {
  return {
    same_hook: clip(`"${breakdown.hookTemplate}", applied to ${pillarName.toLowerCase()}.`),
    same_structure: clip(
      `Your own story in the same beats: ${breakdown.structure.map((s) => s.beat).join(" → ")}.`,
    ),
    counter_take: clip(`Where this advice breaks for fintech and AI products, from your own work.`),
  };
}
