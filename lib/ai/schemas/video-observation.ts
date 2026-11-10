import { z } from "zod";

const span = z.object({ start: z.number(), end: z.number(), text: z.string() });

/** P1 · what Gemini observed in the video (docs/06-AI-PROMPTS.md). */
export const videoObservationSchema = z.object({
  durationSec: z.number(),
  language: z.string(),
  transcript: z.array(span),
  onScreenText: z.array(span),
  shots: z.array(z.object({ start: z.number(), description: z.string() })),
  first3s: z.object({
    spoken: z.string(),
    visual: z.string(),
    onScreenText: z.string().nullable(),
  }),
  format: z.enum([
    "talking_head",
    "voiceover_broll",
    "tutorial_screen",
    "skit",
    "listicle",
    "before_after",
    "vlog",
    "interview",
    "other",
  ]),
  hasMusic: z.boolean(),
});
export type VideoObservation = z.infer<typeof videoObservationSchema>;
