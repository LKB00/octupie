import { z } from "zod";
import { beatSchema, hookOptionSchema } from "./script";

/** P5 · Studio edit tools. All calls in one reply are applied as one undo step. */
export const studioToolCallSchema = z.discriminatedUnion("tool", [
  z.object({
    tool: z.literal("update_lines"),
    edits: z
      .array(
        z.object({
          index: z.number().int().min(0),
          text: z.string().max(140).optional(),
          cue: z.string().max(120).nullable().optional(),
        }),
      )
      .default([]),
    inserts: z
      .array(
        z.object({
          after: z.number().int().min(-1),
          text: z.string().max(140),
          cue: z.string().max(120).nullable().optional(),
          beat: beatSchema,
        }),
      )
      .default([]),
    deletes: z.array(z.number().int().min(0)).default([]),
  }),
  z.object({ tool: z.literal("set_hooks"), hooks: z.array(hookOptionSchema).length(3) }),
  z.object({ tool: z.literal("select_hook"), index: z.number().int().min(0).max(2) }),
  z.object({
    tool: z.literal("set_caption"),
    caption: z.string().max(600),
    hashtags: z.array(z.string()).min(3).max(6),
  }),
  z.object({ tool: z.literal("set_title"), title: z.string().max(80) }),
]);
export type StudioToolCall = z.infer<typeof studioToolCallSchema>;

export const studioReplySchema = z.object({
  /** Empty when the creator is chatting, not asking for an edit. */
  calls: z.array(studioToolCallSchema),
  message: z.string().max(300),
  /** Follow-up prompts to offer as one-tap replies. */
  suggestions: z.array(z.string().max(40)).max(4).default([]),
});
export type StudioReply = z.infer<typeof studioReplySchema>;
export type StudioReplyInput = z.input<typeof studioReplySchema>;
