import { aiAnglePreviews } from "@/lib/ai";
import type { Breakdown } from "@/lib/ai/schemas";
import type { Creator } from "@/lib/db/types";
import { WriterPanel } from "./writer-panel";

/** Server side: generate the angle previews (P3), then render the writer panel. */
export async function WriterPanelLoader({
  creator,
  shortcode,
  breakdown,
  defaultPillarId,
  atLimit,
}: {
  creator: Creator;
  shortcode: string;
  breakdown: Breakdown;
  defaultPillarId: string | null;
  atLimit: boolean;
}) {
  const pillar =
    creator.strategy.pillars.find((p) => p.id === defaultPillarId) ?? creator.strategy.pillars[0]!;
  const previews = await aiAnglePreviews(breakdown, pillar.name);
  const opener = creator.voice.openers[0]?.example ?? "";
  return (
    <WriterPanel
      creatorId={creator.id}
      shortcode={shortcode}
      previews={previews}
      voicePreviews={{
        own: `${opener} Main batata hoon, fintech onboarding mein ye galti sab karte hain.`.trim(),
        neutral: "Most fintech apps lose users before the home screen. Here's the fix.",
      }}
      pillars={creator.strategy.pillars}
      defaultPillarId={defaultPillarId}
      atLimit={atLimit}
    />
  );
}
