import "server-only";
import { isMockMode } from "@/lib/env";
import { mockBilling } from "./mock";
import { paddleBilling } from "./paddle";
import type { BillingProvider } from "./types";

export function billing(): BillingProvider {
  return isMockMode() ? mockBilling : paddleBilling;
}

export type { Invoice } from "./types";
