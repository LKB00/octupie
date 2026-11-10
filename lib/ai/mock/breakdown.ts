import type { Breakdown, VideoObservation } from "@/lib/ai/schemas";
import { fixtures } from "@/lib/data/fixtures";
import type { IgReel } from "@/lib/data/instagram-provider";
import { seededRandom } from "@/lib/random";

const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).trimEnd()}…`);

/** Canned breakdown: the fixture one when it exists, otherwise built from the reel's hook line. */
export function mockBreakdown(reel: IgReel): {
  breakdown: Breakdown;
  observation: VideoObservation;
} {
  const fixture = fixtures.breakdowns.find((b) => b.shortcode === reel.shortcode);
  if (fixture) return { breakdown: fixture.breakdown, observation: fixture.observation };

  const rand = seededRandom(`breakdown:${reel.shortcode}`);
  const hook = reel.hookLine ?? reel.caption.split("#")[0]!.trim();
  const duration = reel.durationSec ?? 30;
  const score = (min: number, spread: number) => Math.round(min + rand() * spread);
  const isCarousel = reel.type === "carousel";
  const hookEnd = Math.min(3, duration * 0.1);
  const payoffStart = Math.round(duration * 0.3);
  const ctaStart = Math.round(duration * 0.85);

  const observation: VideoObservation = {
    durationSec: duration,
    language: "en",
    transcript: [
      { start: 0, end: hookEnd, text: hook },
      {
        start: hookEnd,
        end: payoffStart,
        text: "Here's what most people miss, and why it matters.",
      },
      {
        start: payoffStart,
        end: ctaStart,
        text: "Three specific changes, each shown on screen as I explain it.",
      },
      { start: ctaStart, end: duration, text: "Save this and try the first one today." },
    ],
    onScreenText: [{ start: 0, end: hookEnd, text: clip(hook, 60) }],
    shots: [
      {
        start: 0,
        description: isCarousel ? "Bold title slide" : "Close-up to camera, quick push-in",
      },
      { start: hookEnd, description: "Screen recording with highlights" },
    ],
    first3s: {
      spoken: hook,
      visual: isCarousel
        ? "Title slide with large type"
        : "Creator close to camera, mid-sentence start",
      onScreenText: clip(hook, 60),
    },
    format: isCarousel ? "listicle" : "talking_head",
    hasMusic: rand() > 0.5,
  };

  const breakdown: Breakdown = {
    headline: clip(
      `It opens on a specific claim and proves it on screen within ${payoffStart} seconds.`,
      140,
    ),
    hook: {
      verbal: {
        score: score(72, 22),
        label: "Specific, slightly contrarian claim",
        quote: hook,
        reason:
          "Names a concrete situation the viewer is in, so they stay to check if it applies to them.",
      },
      visual: {
        score: score(48, 30),
        label: isCarousel ? "Large-type title slide" : "Starts mid-sentence",
        description: observation.first3s.visual,
        reason: "There's no intro, so the first frame already carries the point.",
      },
      onScreen: {
        score: score(55, 30),
        label: "Hook repeated as text",
        quote: clip(hook, 60),
        reason: "Viewers watching muted get the same hook.",
      },
      summary:
        "The spoken line does most of the work; text on screen backs it up for muted viewers.",
    },
    structure: [
      { beat: "hook", start: 0, end: hookEnd, what: "States the claim" },
      {
        beat: "setup",
        start: hookEnd,
        end: payoffStart,
        what: "Says why it matters to the viewer",
      },
      {
        beat: "payoff",
        start: payoffStart,
        end: ctaStart,
        what: "Three concrete changes, shown on screen",
      },
      { beat: "cta", start: ctaStart, end: duration, what: "Asks viewers to save it" },
    ],
    whyItWorked: [
      {
        key: "Specific promise",
        detail: "The first line tells you exactly what you'll get, with no warm-up.",
      },
      {
        key: "Proof on screen",
        detail: "Each point is shown, not just said, which earns rewatches and saves.",
      },
      {
        key: "Save-worthy list",
        detail: "A short numbered list is easy to come back to, so people save it.",
      },
    ],
    borrow: [
      "Open with the claim itself, not with who you are.",
      "Show each point on screen as you say it.",
      "End by asking for a save, not a follow.",
    ],
    hookTemplate: "Stop [common habit] if you want [result]. Here's what to do instead.",
    topicTags: ["product design", "career"],
  };
  return { breakdown, observation };
}
