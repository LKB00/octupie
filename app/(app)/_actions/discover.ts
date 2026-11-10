"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import {
  addTrackedAccount,
  listSuggestedAccounts,
  removeTrackedAccount,
  toggleSaved,
  type AddAccountResult,
} from "@/lib/db";

const shortcode = z.string().regex(/^[A-Za-z0-9_-]{5,20}$/);
const handle = z.string().trim().min(1).max(80);

export async function toggleSaveAction(input: string): Promise<{ ok: boolean; saved?: boolean }> {
  await requireSession();
  const parsed = shortcode.safeParse(input);
  if (!parsed.success) return { ok: false };
  const saved = toggleSaved(parsed.data);
  refresh();
  return { ok: true, saved };
}

export async function addAccountAction(input: string): Promise<AddAccountResult> {
  await requireSession();
  const parsed = handle.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter an Instagram handle, like @yourhandle." };
  const result = await addTrackedAccount(parsed.data);
  if (result.ok) refresh();
  return result;
}

export async function removeAccountAction(input: string): Promise<{ ok: boolean }> {
  await requireSession();
  const parsed = handle.safeParse(input);
  if (!parsed.success) return { ok: false };
  removeTrackedAccount(parsed.data);
  refresh();
  return { ok: true };
}

/** "Add 5 suggested accounts" from the sparse banner and the empty state. */
export async function addSuggestedAccountsAction(
  count = 5,
): Promise<{ added: number; error?: string }> {
  await requireSession();
  const n = z.number().int().min(1).max(10).parse(count);
  const suggestions = await listSuggestedAccounts(n);
  let added = 0;
  let error: string | undefined;
  for (const s of suggestions) {
    const res = await addTrackedAccount(s.profile.handle);
    if (res.ok) added += 1;
    else if (res.atLimit) {
      error = res.error;
      break;
    }
  }
  refresh();
  return { added, error };
}
