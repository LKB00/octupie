"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { aiScript, AiOutputError } from "@/lib/ai";
import { getMockProvider } from "@/lib/data";
import { checkQuota, createScript, getUsage, pillarName, recordUsage } from "@/lib/db";
import { store } from "@/lib/db/mock-store";
import { requireSession } from "@/lib/auth/session";
import { startAnalyse } from "@/lib/jobs/analyse";
import { QuotaExceededError, remainingLabel } from "@/lib/quota";

const shortcode = z.string().regex(/^[A-Za-z0-9_-]{5,20}$/);

export type StartBreakdownResult =
  | { ok: true; jobId: string; free: boolean }
  | { ok: false; reason: "quota" | "error"; message: string };

/** Quota is checked here on the server, not only in the UI (CLAUDE.md rule 2). */
export async function startBreakdownAction(input: string): Promise<StartBreakdownResult> {
  await requireSession();
  const code = shortcode.safeParse(input);
  if (!code.success || !(await getMockProvider().getReel(code.data))) {
    return { ok: false, reason: "error", message: "We couldn't find that reel." };
  }
  try {
    const { jobId, free } = startAnalyse(code.data);
    return { ok: true, jobId, free };
  } catch (e) {
    if (e instanceof QuotaExceededError) return { ok: false, reason: "quota", message: e.message };
    throw e;
  }
}

const writeSchema = z.object({
  angle: z.enum(["same_hook", "same_structure", "counter_take", "from_idea", "from_pillar"]),
  voiceMode: z.enum(["own", "neutral"]),
  pillarId: z.string().max(40).nullable(),
  shortcode: shortcode.nullable(),
  idea: z.string().trim().max(400).nullable(),
});

export type WriteScriptResult =
  | { ok: true; scriptId: string; remaining: string }
  | { ok: false; reason: "quota" | "error"; message: string };

/** Generate a script and save it to Scripts right away (CLAUDE.md rule 5). */
export async function writeScriptAction(
  input: z.input<typeof writeSchema>,
): Promise<WriteScriptResult> {
  await requireSession();
  const parsed = writeSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      reason: "error",
      message: "Some of those choices weren't valid. Try again.",
    };
  const { angle, voiceMode, pillarId, shortcode: code, idea } = parsed.data;
  try {
    checkQuota("script");
    const breakdown = code ? (store().breakdowns.get(code)?.breakdown ?? null) : null;
    const out = await aiScript({ angle, voiceMode, pillar: pillarName(pillarId), breakdown, idea });
    const record = createScript({
      content: { ...out, selectedHook: 0 },
      angle,
      voiceMode,
      pillarId,
      sourceShortcode: code,
    });
    recordUsage("script");
    refresh();
    return { ok: true, scriptId: record.id, remaining: remainingLabel(getUsage().scripts) };
  } catch (e) {
    if (e instanceof QuotaExceededError) return { ok: false, reason: "quota", message: e.message };
    if (e instanceof AiOutputError) return { ok: false, reason: "error", message: e.message };
    throw e;
  }
}
