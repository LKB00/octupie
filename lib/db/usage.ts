import "server-only";
import { now } from "@/lib/clock";
import {
  assertWithinQuota,
  crossedWarning,
  limitFor,
  meter,
  periodBounds,
  PLAN_LIMITS,
  USAGE_NOUN,
  type UsageKind,
} from "@/lib/quota";
import { nextId, store } from "./mock-store";
import type { UsageSummary } from "./types";

function usedThisPeriod(kind: UsageKind): number {
  const s = store();
  const { start } = periodBounds(new Date(s.periodStart), now());
  return s.usage.filter((u) => u.kind === kind && new Date(u.createdAt) >= start).length;
}

export function getUsage(): UsageSummary {
  const s = store();
  const { start, end } = periodBounds(new Date(s.periodStart), now());
  return {
    plan: s.plan,
    periodStart: start.toISOString(),
    renewsAt: end.toISOString(),
    breakdowns: meter(usedThisPeriod("breakdown"), limitFor(s.plan, "breakdown")),
    scripts: meter(usedThisPeriod("script"), limitFor(s.plan, "script")),
    chatMessages: meter(usedThisPeriod("chat_message"), limitFor(s.plan, "chat_message")),
    trackedAccounts: meter(s.tracked.length, PLAN_LIMITS[s.plan].trackedAccounts),
  };
}

/** Server-side quota check (CLAUDE.md rule 2). Throws QuotaExceededError. */
export function checkQuota(kind: UsageKind): void {
  assertWithinQuota(kind, usedThisPeriod(kind), store().plan);
}

export function recordUsage(kind: UsageKind): void {
  const s = store();
  const before = usedThisPeriod(kind);
  s.usage.push({ kind, createdAt: now().toISOString() });
  const limit = limitFor(s.plan, kind);
  // Quota warning at 80% (docs/01): one notification per kind per period, if the user wants them.
  if (kind !== "chat_message" && s.prefs.quotaWarnings && crossedWarning(before, before + 1, limit)) {
    const noun = USAGE_NOUN[kind].many;
    s.notifications.push({
      id: nextId("n"),
      kind: "quota",
      title: `You've used ${before + 1} of ${limit} ${noun} this month`,
      href: "/settings/billing",
      createdAt: new Date().toISOString(),
      read: false,
    });
  }
}
