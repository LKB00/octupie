"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { checkHandle, completeOnboarding, interviewKeys, saveAnswer, savePillars } from "@/lib/db";
import { MAX_PILLARS } from "@/lib/onboarding/steps";

const handle = z
  .string()
  .trim()
  .regex(/^@?[a-zA-Z0-9._]{1,30}$/, "Use letters, numbers, dots and underscores only.");

export async function checkHandleAction(raw: string) {
  await requireSession();
  const p = handle.safeParse(raw);
  if (!p.success)
    return {
      ok: false as const,
      message: p.error.issues[0]?.message ?? "Enter your Instagram handle.",
    };
  return checkHandle(p.data);
}

export async function saveAnswerAction(input: { key: string; value: string }) {
  await requireSession();
  const p = z
    .object({
      key: z.string().refine((k) => interviewKeys.includes(k)),
      value: z.string().max(600),
    })
    .parse(input);
  saveAnswer(p.key, p.value);
}

export async function savePillarsAction(input: { ids: string[]; custom: string[] }) {
  await requireSession();
  const p = z
    .object({ ids: z.array(z.string().max(40)), custom: z.array(z.string().trim().min(2).max(40)) })
    .refine(
      (v) => v.ids.length + v.custom.length >= 1 && v.ids.length + v.custom.length <= MAX_PILLARS,
    )
    .safeParse(input);
  if (!p.success)
    return { ok: false as const, message: `Pick between 1 and ${MAX_PILLARS} pillars.` };
  savePillars(p.data.ids, p.data.custom);
  return { ok: true as const };
}

export async function finishOnboardingAction() {
  const session = await requireSession();
  completeOnboarding();
  redirect(`/c/${session.defaultCreatorId}/discover`);
}
