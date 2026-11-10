import type { Plan } from "@/lib/quota";

export type Billing = "monthly" | "annual";

/** Monthly prices in rupees. Annual = 10 × monthly, shown per month. */
export const PLAN_PRICE: Record<Plan, number> = { free: 0, creator: 499, pro: 1999 };

export const PLAN_BLURB: Record<Plan, string> = {
  free: "Try the whole loop on your niche.",
  creator: "For posting a few reels a week.",
  pro: "For daily posters and small teams.",
};

export const PLAN_ORDER: readonly Plan[] = ["free", "creator", "pro"];

export function rupees(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

/** Price shown per month for the chosen billing period. */
export function perMonth(plan: Plan, billing: Billing): number {
  const monthly = PLAN_PRICE[plan];
  return billing === "annual" ? Math.round((monthly * 10) / 12) : monthly;
}

/** What one checkout charges: a month, or a year at 10 × monthly. */
export function chargeFor(plan: Plan, billing: Billing): number {
  return billing === "annual" ? PLAN_PRICE[plan] * 10 : PLAN_PRICE[plan];
}
