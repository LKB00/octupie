import "server-only";
import { now } from "@/lib/clock";
import { fixtures } from "@/lib/data/fixtures";
import { getMockProvider } from "@/lib/data";
import type { IgProfile, IgReel, Snapshot } from "@/lib/data/instagram-provider";
import { trackingStartHours, viewsAtHour } from "@/lib/data/mock/generate";
import { breakingScore, computeBaseline, computeMultiple, isOutlier } from "@/lib/outliers";
import { hashString } from "@/lib/random";
import { store } from "./mock-store";
import type { FeedFilters, ReelDetail, ScoredReel } from "./types";

const DAY_MS = 86_400_000;
const LIST_LIMIT = 100;

const fixturePillar = new Map(fixtures.reels.map((r) => [r.shortcode, r.pillar]));

/** Pillar tagging: fixture tags, otherwise a deterministic stand-in for the P-tagging job. */
function pillarIdFor(reel: IgReel): string | null {
  const pillars = store().creator.strategy.pillars;
  if (fixturePillar.has(reel.shortcode)) {
    const name = fixturePillar.get(reel.shortcode);
    return pillars.find((p) => p.name === name)?.id ?? null;
  }
  const h = hashString(`pillar:${reel.shortcode}`) % (pillars.length + 2);
  return pillars[h]?.id ?? null;
}

async function profileFor(handle: string): Promise<IgProfile> {
  const p = await getMockProvider().getProfile(handle);
  if (!p) throw new Error(`Unknown account @${handle}`);
  return p;
}

/** Score every reel of an account with the shared baseline (excluding the reel itself). */
export async function scoreAccountReels(handle: string, minMultiple: number): Promise<ScoredReel[]> {
  const at = now();
  const provider = getMockProvider();
  const [profile, reels] = await Promise.all([profileFor(handle), provider.listReels(handle, { limit: LIST_LIMIT })]);
  const s = store();
  return reels.map((reel) => {
    const baseline = computeBaseline(reels, { at, excludeShortcode: reel.shortcode });
    const multiple = computeMultiple(reel.views, baseline.usualViews);
    return {
      ...reel,
      baseline,
      multiple,
      isOutlier: isOutlier({ views: reel.views, multiple, baseline, minMultiple }),
      breakingScore:
        multiple === null
          ? 0
          : breakingScore({ multiple, postedAt: reel.postedAt, snapshots: provider.snapshots(reel), usualViews: baseline.usualViews, at }),
      pillarId: pillarIdFor(reel),
      owner: { handle: profile.handle, name: profile.name, avatarUrl: profile.avatarUrl, followers: profile.followers },
      saved: s.saved.has(reel.shortcode),
      analysed: s.breakdowns.has(reel.shortcode),
    };
  });
}

const SORTERS: Record<FeedFilters["sort"], (a: ScoredReel, b: ScoredReel) => number> = {
  breaking: (a, b) => b.breakingScore - a.breakingScore,
  newest: (a, b) => b.postedAt.localeCompare(a.postedAt),
  multiple: (a, b) => (b.multiple ?? 0) - (a.multiple ?? 0),
};

function applyFilters(reels: ScoredReel[], f: Omit<FeedFilters, "minMultiple">): ScoredReel[] {
  const since = now().getTime() - f.window * DAY_MS;
  return reels
    .filter((r) => new Date(r.postedAt).getTime() >= since)
    .filter((r) => f.format === "all" || r.type === f.format)
    .filter((r) => !f.pillar || r.pillarId === f.pillar)
    .filter((r) => !f.account || r.ownerHandle === f.account)
    .sort(SORTERS[f.sort]);
}

export class FeedUnavailableError extends Error {}

/** Outliers from the creator's tracked accounts, filtered and sorted. */
export async function getFeed(filters: FeedFilters): Promise<ScoredReel[]> {
  const s = store();
  if (s.feedFails) throw new FeedUnavailableError("The data provider didn't respond.");
  const all = (await Promise.all(s.tracked.map((t) => scoreAccountReels(t.handle, filters.minMultiple)))).flat();
  return applyFilters(all.filter((r) => r.isOutlier), filters);
}

export async function getSavedReels(): Promise<ScoredReel[]> {
  const s = store();
  const handles = new Set([...s.tracked.map((t) => t.handle)]);
  const provider = getMockProvider();
  for (const code of s.saved) {
    const r = await provider.getReel(code);
    if (r) handles.add(r.ownerHandle);
  }
  const all = (await Promise.all([...handles].map((h) => scoreAccountReels(h, 3)))).flat();
  return all.filter((r) => s.saved.has(r.shortcode)).sort(SORTERS.newest);
}

/** The signed-in creator's own reels, scored against their own usual. */
export async function getOwnReels(opts: { sort: "newest" | "multiple"; pillar: string | null }) {
  const reels = await scoreAccountReels(store().creator.igHandle, 3);
  const at = now();
  const all = await getMockProvider().listReels(store().creator.igHandle, { limit: LIST_LIMIT });
  return {
    baseline: computeBaseline(all, { at }),
    reels: reels.filter((r) => !opts.pillar || r.pillarId === opts.pillar).sort(SORTERS[opts.sort === "multiple" ? "multiple" : "newest"]),
  };
}

export async function getReelDetail(shortcode: string): Promise<ReelDetail | null> {
  const provider = getMockProvider();
  const raw = await provider.getReel(shortcode);
  if (!raw) return null;
  const scored = (await scoreAccountReels(raw.ownerHandle, 3)).find((r) => r.shortcode === shortcode)!;
  const at = now();
  const snapshots = provider.snapshots(raw);
  const ageHours = (at.getTime() - new Date(raw.postedAt).getTime()) / 3_600_000;
  const usual = scored.baseline.usualViews;
  const typicalCurve: Snapshot[] =
    usual === null
      ? []
      : snapshots.map((s) => {
          const h = (new Date(s.capturedAt).getTime() - new Date(raw.postedAt).getTime()) / 3_600_000;
          return { capturedAt: s.capturedAt, views: viewsAtHour(usual, ageHours, h) };
        });
  const startHours = trackingStartHours(raw, at);
  const stored = store().breakdowns.get(shortcode);
  return {
    reel: scored,
    snapshots,
    typicalCurve,
    trackingStartedDay: startHours > 0 ? Math.round(startHours / 24) : null,
    breakdown: stored ? { breakdown: stored.breakdown, observation: stored.observation } : null,
    isOwn: raw.ownerHandle === store().creator.igHandle,
  };
}

export function toggleSaved(shortcode: string): boolean {
  const s = store();
  if (s.saved.has(shortcode)) {
    s.saved.delete(shortcode);
    return false;
  }
  s.saved.add(shortcode);
  return true;
}

export function savedCount(): number {
  return store().saved.size;
}
