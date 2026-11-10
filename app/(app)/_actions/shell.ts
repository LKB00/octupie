"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { markAllRead, resetStore, setPref } from "@/lib/db";
import { store } from "@/lib/db/mock-store";
import { isMockMode } from "@/lib/env";

export async function markNotificationsReadAction() {
  await requireSession();
  markAllRead();
  refresh();
}

const prefSchema = z.object({
  key: z.enum(["weeklyEmail", "breakoutAlerts", "quotaWarnings"]),
  value: z.boolean(),
});

export async function setNotificationPrefAction(input: z.input<typeof prefSchema>) {
  await requireSession();
  const { key, value } = prefSchema.parse(input);
  setPref(key, value);
  refresh();
}

/** Mock-only: put the demo data back to the fixtures. */
export async function resetDemoAction() {
  await requireSession();
  if (!isMockMode()) return;
  resetStore();
  refresh();
}

/** Mock-only: switch the feed's simulated provider failure on or off. */
export async function setFeedFailureAction(fails: boolean) {
  await requireSession();
  if (!isMockMode()) return;
  store().feedFails = z.boolean().parse(fails);
  refresh();
}

/** Mock-only: switch plans to try limits without Paddle (Paddle checkout arrives in M9). */
export async function setPlanAction(plan: "free" | "creator" | "pro") {
  await requireSession();
  if (!isMockMode()) return;
  store().plan = z.enum(["free", "creator", "pro"]).parse(plan);
  refresh();
}
