import "server-only";
import type { BillingProvider } from "./types";

const missing = () => {
  throw new Error("Paddle needs PADDLE_API_KEY and price IDs in .env.local (see .env.example).");
};

/** Paddle Billing. Checkout opens Paddle's overlay on the client; webhooks set the plan. */
export const paddleBilling: BillingProvider = {
  checkout: async () => missing(),
  cancel: async () => missing(),
  redeem: async () => missing(),
  listInvoices: async () => missing(),
};
