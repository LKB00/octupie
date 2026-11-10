import { fixtures } from "@/lib/data/fixtures";

export type Plan = "free" | "creator" | "pro";
export type UsageKind = "breakdown" | "script" | "chat_message";

export type PlanLimits = {
  trackedAccounts: number;
  breakdowns: number;
  /** null = unlimited (fair use) */
  scripts: number | null;
  chatMessages: number;
};

export const PLAN_LIMITS: Record<Plan, PlanLimits> = fixtures.plans;

export const PLAN_LABEL: Record<Plan, string> = { free: "Free", creator: "Creator", pro: "Pro" };

export const USAGE_NOUN: Record<UsageKind, { one: string; many: string }> = {
  breakdown: { one: "breakdown", many: "breakdowns" },
  script: { one: "script", many: "scripts" },
  chat_message: { one: "chat message", many: "chat messages" },
};

export function limitFor(plan: Plan, kind: UsageKind): number | null {
  const l = PLAN_LIMITS[plan];
  return kind === "breakdown" ? l.breakdowns : kind === "script" ? l.scripts : l.chatMessages;
}

export type Meter = {
  used: number;
  limit: number | null;
  remaining: number | null;
  atLimit: boolean;
};

export function meter(used: number, limit: number | null): Meter {
  if (limit === null) return { used, limit, remaining: null, atLimit: false };
  const remaining = Math.max(0, limit - used);
  return { used, limit, remaining, atLimit: remaining === 0 };
}

/** "uses 1 breakdown": the cost label shown on every paid button (CLAUDE.md rule 2). */
export function costLabel(kind: UsageKind, amount = 1): string {
  const noun = amount === 1 ? USAGE_NOUN[kind].one : USAGE_NOUN[kind].many;
  return `uses ${amount} ${noun}`;
}

/** "3 left this month" for result toasts. */
export function remainingLabel(m: Meter): string {
  return m.remaining === null ? "unlimited this month" : `${m.remaining} left this month`;
}

export class QuotaExceededError extends Error {
  constructor(public readonly kind: UsageKind) {
    super(`You've used all your ${USAGE_NOUN[kind].many} for this month.`);
    this.name = "QuotaExceededError";
  }
}

/** Throws when the action would go over the plan limit. Call on the server before every paid action. */
export function assertWithinQuota(kind: UsageKind, used: number, plan: Plan, amount = 1): void {
  const limit = limitFor(plan, kind);
  if (limit !== null && used + amount > limit) throw new QuotaExceededError(kind);
}

/** Start of the current monthly period, anchored on the workspace's period start day. */
export function periodBounds(periodStart: Date, now: Date): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), periodStart.getUTCDate()),
  );
  if (start > now) start.setUTCMonth(start.getUTCMonth() - 1);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { start, end };
}

/** True when this use moved the meter across 80% of the limit (fires once per period). */
export function crossedWarning(
  usedBefore: number,
  usedAfter: number,
  limit: number | null,
): boolean {
  if (limit === null || limit <= 0) return false;
  const line = limit * 0.8;
  return usedBefore < line && usedAfter >= line;
}
