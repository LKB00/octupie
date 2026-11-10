import "server-only";
import { now } from "@/lib/clock";
import { getMockProvider, HANDLE_PATTERN, normaliseHandle } from "@/lib/data";
import { SUGGESTED_ACCOUNTS } from "@/lib/data/mock/generate";
import type { IgProfile } from "@/lib/data/instagram-provider";
import { computeBaseline, computeMultiple, isOutlier } from "@/lib/outliers";
import { PLAN_LIMITS } from "@/lib/quota";
import { store } from "./mock-store";
import type { TrackedAccount } from "./types";

const DAY_MS = 86_400_000;

async function summarise(profile: IgProfile, addedAt: string): Promise<TrackedAccount> {
  const at = now();
  const reels = await getMockProvider().listReels(profile.handle, { limit: 100 });
  const baseline = computeBaseline(reels, { at });
  const outliers30d = reels.filter((r) => {
    if (at.getTime() - new Date(r.postedAt).getTime() > 30 * DAY_MS) return false;
    const b = computeBaseline(reels, { at, excludeShortcode: r.shortcode });
    return isOutlier({ views: r.views, multiple: computeMultiple(r.views, b.usualViews), baseline: b });
  }).length;
  return { profile, baseline, outliers30d, addedAt };
}

export async function listTrackedAccounts(): Promise<TrackedAccount[]> {
  const provider = getMockProvider();
  const rows = await Promise.all(
    store().tracked.map(async (t) => {
      const p = await provider.getProfile(t.handle);
      return p ? summarise(p, t.addedAt) : null;
    }),
  );
  return rows.filter((r): r is TrackedAccount => r !== null);
}

export async function listSuggestedAccounts(limit = 6): Promise<TrackedAccount[]> {
  const tracked = new Set(store().tracked.map((t) => t.handle));
  const rows = SUGGESTED_ACCOUNTS.filter((p) => !tracked.has(p.handle)).slice(0, limit);
  return Promise.all(rows.map((p) => summarise(p, now().toISOString())));
}

export type AddAccountResult =
  | { ok: true; handle: string }
  | { ok: false; error: string; atLimit?: boolean };

/** Validate the handle with the provider, enforce the plan's tracked-account limit, then add it. */
export async function addTrackedAccount(input: string): Promise<AddAccountResult> {
  const handle = normaliseHandle(input);
  if (!HANDLE_PATTERN.test(handle)) {
    return { ok: false, error: "Handles can only use letters, numbers, dots and underscores." };
  }
  const s = store();
  if (s.tracked.some((t) => t.handle === handle)) return { ok: false, error: `You already track @${handle}.` };
  const limit = PLAN_LIMITS[s.plan].trackedAccounts;
  if (s.tracked.length >= limit) {
    return { ok: false, error: `Your plan tracks up to ${limit} accounts. Remove one or upgrade to add more.`, atLimit: true };
  }
  const profile = await getMockProvider().getProfile(handle);
  if (!profile) return { ok: false, error: `We couldn't find @${handle}.` };
  if (profile.isPrivate) return { ok: false, error: `@${handle} is private, so we can't read its reels.` };
  s.tracked.push({ handle, addedAt: now().toISOString() });
  return { ok: true, handle };
}

export function removeTrackedAccount(handle: string): void {
  const s = store();
  s.tracked = s.tracked.filter((t) => t.handle !== handle);
}
