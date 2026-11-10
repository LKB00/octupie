import { z } from "zod";
import raw from "@/fixtures/sample-data.json";
import { breakdownSchema } from "@/lib/ai/schemas/breakdown";
import { scriptContentSchema } from "@/lib/ai/schemas/script";
import { videoObservationSchema } from "@/lib/ai/schemas/video-observation";
import { voiceConflictSchema, voiceProfileSchema } from "@/lib/ai/schemas/voice";
import { reelTypeSchema } from "./instagram-provider";

const pillarSchema = z.object({ id: z.string(), name: z.string(), description: z.string() });

const fixtureSchema = z.object({
  now: z.string(),
  creator: z.object({
    id: z.string(),
    displayName: z.string(),
    igHandle: z.string(),
    primaryLanguage: z.string(),
    usualViews: z.number(),
    strategy: z.object({
      positioning: z.string(),
      audience: z.string(),
      goals: z.string(),
      pillars: z.array(pillarSchema),
      proof: z.array(z.string()),
      dontUse: z.array(z.string()),
    }),
    voice: voiceProfileSchema,
    voiceConflict: voiceConflictSchema,
  }),
  trackedAccounts: z.array(
    z.object({
      handle: z.string(),
      name: z.string(),
      followers: z.number(),
      usualViews: z.number(),
      usualSampleSize: z.number(),
      usualLowConfidence: z.boolean(),
      avatarUrl: z.string(),
    }),
  ),
  reels: z.array(
    z.object({
      shortcode: z.string(),
      ownerHandle: z.string(),
      type: reelTypeSchema,
      postedAt: z.string(),
      hookLine: z.string(),
      caption: z.string(),
      views: z.number().nullable(),
      likes: z.number().nullable(),
      comments: z.number(),
      durationSec: z.number().nullable(),
      multiple: z.number(),
      isOutlier: z.boolean(),
      pillar: z.string().nullable(),
      thumbnailUrl: z.string(),
      permalink: z.string(),
    }),
  ),
  breakdowns: z.array(
    z.object({
      shortcode: z.string(),
      observation: videoObservationSchema,
      breakdown: breakdownSchema,
    }),
  ),
  scripts: z.array(
    z.object({
      id: z.string(),
      creatorId: z.string(),
      status: z.enum(["draft", "ready", "filmed", "posted"]),
      angle: z.enum(["same_hook", "same_structure", "counter_take", "from_idea", "from_pillar"]),
      voiceMode: z.enum(["own", "neutral"]),
      pillar: z.string().nullable(),
      sourceShortcode: z.string().nullable(),
      content: scriptContentSchema,
    }),
  ),
  plans: z.record(
    z.enum(["free", "creator", "pro"]),
    z.object({
      trackedAccounts: z.number(),
      breakdowns: z.number(),
      scripts: z.number().nullable(),
      chatMessages: z.number(),
    }),
  ),
  usage: z.object({
    plan: z.enum(["free", "creator", "pro"]),
    breakdowns: z.number(),
    scripts: z.number(),
    chatMessages: z.number(),
  }),
});

export type Fixtures = z.infer<typeof fixtureSchema>;
export type FixtureReel = Fixtures["reels"][number];
export type FixtureAccount = Fixtures["trackedAccounts"][number];

/** fixtures/sample-data.json, validated once (Zod at every external boundary). */
export const fixtures: Fixtures = fixtureSchema.parse(raw);
