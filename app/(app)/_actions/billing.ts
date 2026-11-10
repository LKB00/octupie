"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { billing } from "@/lib/billing";

export async function checkoutAction(input: { plan: string; billing: string }) {
  await requireSession();
  const p = z
    .object({ plan: z.enum(["creator", "pro"]), billing: z.enum(["monthly", "annual"]) })
    .safeParse(input);
  if (!p.success) return { ok: false as const, message: "Pick a plan and a billing period." };
  const res = await billing().checkout(p.data);
  refresh();
  return res;
}

export async function cancelPlanAction() {
  await requireSession();
  await billing().cancel();
  refresh();
}

export async function redeemCodeAction(code: string) {
  await requireSession();
  const c = z.string().trim().min(3).max(40).safeParse(code);
  if (!c.success) return { ok: false, message: "Enter a code." };
  const res = await billing().redeem(c.data);
  refresh();
  return res;
}
