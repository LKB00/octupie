import { z } from "zod";

const score = z.number().int().min(0).max(100);

/** P2 · why a reel beat its creator's usual views. */
export const breakdownSchema = z.object({
  headline: z.string().max(140),
  hook: z.object({
    verbal: z.object({
      score,
      label: z.string().max(40),
      quote: z.string(),
      reason: z.string().max(140),
    }),
    visual: z.object({
      score,
      label: z.string().max(40),
      description: z.string(),
      reason: z.string().max(140),
    }),
    onScreen: z.object({
      score,
      label: z.string().max(40),
      quote: z.string().nullable(),
      reason: z.string().max(140),
    }),
    summary: z.string().max(300),
  }),
  structure: z
    .array(
      z.object({
        beat: z.enum(["hook", "setup", "payoff", "cta", "other"]),
        start: z.number(),
        end: z.number(),
        what: z.string().max(120),
      }),
    )
    .min(2),
  whyItWorked: z
    .array(z.object({ key: z.string().max(40), detail: z.string().max(160) }))
    .length(3),
  borrow: z.array(z.string().max(180)).min(2).max(4),
  hookTemplate: z.string().max(160),
  topicTags: z.array(z.string()).max(5),
});
export type Breakdown = z.infer<typeof breakdownSchema>;

/** P3 · one-line previews for the three angles. */
export const anglePreviewsSchema = z.object({
  same_hook: z.string().max(120),
  same_structure: z.string().max(120),
  counter_take: z.string().max(120),
});
export type AnglePreviews = z.infer<typeof anglePreviewsSchema>;
