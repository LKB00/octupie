import { z } from "zod";

/** P6 · how the creator sounds. */
export const voiceProfileSchema = z.object({
  summary: z.string().max(500),
  energy: z.number().int().min(0).max(100),
  languageMix: z.array(z.object({ lang: z.string(), share: z.number() })),
  tone: z.array(z.string()).max(4),
  phrases: z.array(z.string()).max(8),
  openers: z.array(z.object({ pattern: z.string(), example: z.string() })).max(4),
  closers: z.array(z.object({ pattern: z.string(), example: z.string() })).max(4),
  topics: z.array(z.string()).max(6),
  likelyTranscriptionErrors: z.array(z.string()).max(5),
});
export type VoiceProfile = z.infer<typeof voiceProfileSchema>;

/** P8 · voice vs strategy conflict check. */
export const voiceConflictSchema = z.object({
  conflict: z.boolean(),
  voiceIsFrom: z.string().max(120),
  strategyTargets: z.string().max(120),
  risk: z.string().max(200),
  suggestion: z.enum(["keep", "add_sample", "neutral_for_some_pillars"]),
  pillarsAtRisk: z.array(z.string()),
});
export type VoiceConflict = z.infer<typeof voiceConflictSchema>;
