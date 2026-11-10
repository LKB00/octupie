import "server-only";
import { now } from "@/lib/clock";
import { nextId, store } from "@/lib/db/mock-store";
import { PLAN_LABEL } from "@/lib/quota";
import { chargeFor } from "./prices";
import type { BillingProvider } from "./types";

/** Codes that work in mock mode. Real codes are Paddle discounts. */
const CODES: Record<string, "creator" | "pro"> = {
  "OCTUPIE-CREATOR": "creator",
  "OCTUPIE-PRO": "pro",
};

export const mockBilling: BillingProvider = {
  async checkout({ plan, billing }) {
    const s = store();
    const invoice = {
      id: nextId("inv"),
      number: `HK-${String(s.invoices.length + 1041).padStart(5, "0")}`,
      date: now().toISOString(),
      plan,
      billing,
      amount: chargeFor(plan, billing),
      status: "paid" as const,
    };
    s.invoices.push(invoice);
    s.plan = plan;
    s.billing = billing;
    return { ok: true, invoice };
  },
  async cancel() {
    const s = store();
    s.plan = "free";
  },
  async redeem(code) {
    const plan = CODES[code.trim().toUpperCase()];
    if (!plan)
      return {
        ok: false,
        message: "That code isn't valid. Check for typos, or it may have expired.",
      };
    store().plan = plan;
    return {
      ok: true,
      message: `Code applied. You're on ${PLAN_LABEL[plan]} for this billing period.`,
    };
  },
  async listInvoices() {
    return [...store().invoices].reverse();
  },
};
