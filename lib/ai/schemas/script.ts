import { z } from "zod";

export const beatSchema = z.enum(["hook", "setup", "payoff", "cta"]);
export type Beat = z.infer<typeof beatSchema>;

export const scriptLineSchema = z.object({
  text: z.string().max(140),
  cue: z.string().max(120).nullable(),
  beat: beatSchema,
});
export type ScriptLine = z.infer<typeof scriptLineSchema>;

export const hookOptionSchema = z.object({ text: z.string().max(120), why: z.string().max(100) });

/** P4 · a ready-to-film script, as the model returns it. */
export const scriptSchema = z.object({
  title: z.string().max(80),
  hooks: z.array(hookOptionSchema).length(3),
  lines: z.array(scriptLineSchema).min(4).max(20),
  cta: z.string().max(120),
  caption: z.string().max(600),
  hashtags: z.array(z.string()).min(3).max(6),
  estSeconds: z.number().int(),
  pillar: z.string().nullable(),
});
export type ScriptOutput = z.infer<typeof scriptSchema>;

/** What we store in scripts.content: the model output plus the chosen hook. */
export const scriptContentSchema = scriptSchema.extend({
  selectedHook: z.number().int().min(0).max(2),
});
export type ScriptContent = z.infer<typeof scriptContentSchema>;

export const SCRIPT_STATUSES = ["draft", "ready", "filmed", "posted"] as const;
export type ScriptStatus = (typeof SCRIPT_STATUSES)[number];
export const SCRIPT_STATUS_LABEL: Record<ScriptStatus, string> = {
  draft: "Draft",
  ready: "Ready to film",
  filmed: "Filmed",
  posted: "Posted",
};

export const ANGLES = ["same_hook", "same_structure", "counter_take"] as const;
export type ReelAngle = (typeof ANGLES)[number];
export type ScriptAngle = ReelAngle | "from_idea" | "from_pillar";
export const ANGLE_LABEL: Record<ScriptAngle, string> = {
  same_hook: "Same hook, your topic",
  same_structure: "Same structure, your story",
  counter_take: "Your counter-take",
  from_idea: "From an idea",
  from_pillar: "From a pillar",
};

export type VoiceMode = "own" | "neutral";
