import type { Plan } from "@/lib/quota";
import type { Billing } from "./prices";

export type Invoice = {
  id: string;
  number: string;
  date: string;
  plan: Plan;
  billing: Billing;
  amount: number;
  status: "paid" | "refunded";
};

export type CheckoutResult = { ok: true; invoice: Invoice } | { ok: false; message: string };

/**
 * Billing behind one interface (CLAUDE.md stack): Paddle in production, an in-memory mock in
 * MOCK_MODE. Webhooks from Paddle update the plan; the mock updates it directly.
 */
export interface BillingProvider {
  checkout(input: { plan: Exclude<Plan, "free">; billing: Billing }): Promise<CheckoutResult>;
  cancel(): Promise<void>;
  redeem(code: string): Promise<{ ok: boolean; message: string }>;
  listInvoices(): Promise<Invoice[]>;
}
