import type { IgProfile, IgReel, Snapshot } from "@/lib/data/instagram-provider";
import { BASELINE_MIN_AGE_DAYS, median } from "@/lib/outliers/baseline";
import { hashString, pick, seededRandom, shortcodeFrom } from "@/lib/random";
import { mockAvatar } from "./avatars";
import { NICHE_CAPTIONS, NICHE_HOOKS, OWN_HOOKS } from "./copy-bank";

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

type ReelSeed = {
  handle: string;
  index: number;
  ageDays: number;
  views: number;
  hooks: readonly string[];
};

function makeReel({ handle, index, ageDays, views, hooks }: ReelSeed, now: Date): IgReel {
  const seed = `${handle}:${index}`;
  const rand = seededRandom(seed);
  const shortcode = shortcodeFrom(seed);
  return {
    shortcode,
    ownerHandle: handle,
    postedAt: new Date(now.getTime() - ageDays * DAY_MS).toISOString(),
    caption: pick(rand, NICHE_CAPTIONS),
    hookLine: pick(rand, hooks),
    views: Math.round(views),
    likes: Math.round(views * (0.02 + rand() * 0.03)),
    comments: Math.round(views * (0.001 + rand() * 0.003)),
    durationSec: Math.round(18 + rand() * 50),
    thumbnailUrl: `https://picsum.photos/seed/${shortcode}/360/640`,
    permalink: `https://www.instagram.com/reel/${shortcode}/`,
    type: rand() < 0.15 ? "carousel" : "reel",
  };
}

/**
 * Ordinary reels that complete an account's history. The fixtures only include each account's
 * interesting reels, so these fill in the rest such that the shared baseline function returns
 * exactly the fixture's usual views: 13 below, 3 at, and 13 above the usual (29 reels).
 */
export function fillerReels(
  handle: string,
  usualViews: number,
  existing: readonly IgReel[],
  now: Date,
): IgReel[] {
  const old = existing.filter(
    (r) =>
      r.views !== null &&
      now.getTime() - new Date(r.postedAt).getTime() >= BASELINE_MIN_AGE_DAYS * DAY_MS,
  );
  const above = old.filter((r) => r.views! > usualViews).length;
  const below = old.filter((r) => r.views! < usualViews).length;
  const equal = old.length - above - below;
  const plan = [
    ...Array<number>(Math.max(0, 13 - below)).fill(-1),
    ...Array<number>(Math.max(0, 3 - equal)).fill(0),
    ...Array<number>(Math.max(0, 13 - above)).fill(1),
  ];
  const rand = seededRandom(`filler:${handle}`);
  return plan.map((side, i) => {
    const factor = side === 0 ? 1 : side < 0 ? 0.35 + rand() * 0.6 : 1.03 + rand() * 0.85;
    const ageDays = 4 + ((i * 83) % 84) + rand() * 0.9; // spread across 4–88 days
    return makeReel(
      { handle, index: 1000 + i, ageDays, views: usualViews * factor, hooks: NICHE_HOOKS },
      now,
    );
  });
}

/** The signed-in creator's own reels: usual of exactly `usualViews`, with a few outliers. */
export function ownReels(handle: string, usualViews: number, now: Date): IgReel[] {
  const factors = [
    0.42, 0.55, 0.61, 0.68, 0.74, 0.8, 0.86, 0.91, 0.96, 1, 1, 1, 1.06, 1.12, 1.2, 1.31, 1.45, 1.62,
    3.4, 5.8, 11.2,
  ];
  const rand = seededRandom(`own:${handle}`);
  const order = [...factors].sort(() => rand() - 0.5);
  const old = order.map((factor, i) =>
    makeReel(
      {
        handle,
        index: i,
        ageDays: 4 + i * 3.6 + rand(),
        views: usualViews * factor,
        hooks: OWN_HOOKS,
      },
      now,
    ),
  );
  const young = [
    makeReel({ handle, index: 90, ageDays: 0.8, views: usualViews * 2.4, hooks: OWN_HOOKS }, now),
    makeReel({ handle, index: 91, ageDays: 2.1, views: usualViews * 0.9, hooks: OWN_HOOKS }, now),
  ];
  return [...young, ...old].map((r, i) => ({ ...r, hookLine: OWN_HOOKS[i % OWN_HOOKS.length] }));
}

/** Fictional accounts offered as suggestions; each gets a generated history. */
export const SUGGESTED_ACCOUNTS: readonly IgProfile[] = [
  ["onboarding.lab", "Onboarding Lab", 18400],
  ["fintechux.in", "Fintech UX India", 33100],
  ["designleads.daily", "Design Leads Daily", 52700],
  ["caseclub.mumbai", "Case Club Mumbai", 9100],
  ["brandforfounders", "Brand for Founders", 74300],
  ["uxwriting.desi", "UX Writing Desi", 12800],
].map(([handle, name, followers]) => ({
  handle: handle as string,
  name: name as string,
  avatarUrl: mockAvatar(handle as string),
  bio: "Fictional account for mock mode.",
  followers: followers as number,
  following: 400,
  mediaCount: 180,
  isPrivate: false,
  isBusinessOrCreator: true,
}));

export function suggestedAccountReels(profile: IgProfile, now: Date): IgReel[] {
  const rand = seededRandom(`suggested:${profile.handle}`);
  const usual = Math.round(profile.followers * (0.12 + rand() * 0.18));
  const reels: IgReel[] = [];
  for (let i = 0; i < 18; i++) {
    const ageDays = 3.5 + i * 4.2 + rand();
    reels.push(
      makeReel(
        {
          handle: profile.handle,
          index: i,
          ageDays,
          views: usual * (0.45 + rand() * 1.1),
          hooks: NICHE_HOOKS,
        },
        now,
      ),
    );
  }
  const outlierAges = [0.6, 2.5, 5.5, 12];
  outlierAges.forEach((ageDays, j) => {
    reels.push(
      makeReel(
        {
          handle: profile.handle,
          index: 50 + j,
          ageDays,
          views: usual * (3.2 + rand() * 14),
          hooks: NICHE_HOOKS,
        },
        now,
      ),
    );
  });
  return reels;
}

const TAU_HOURS = 30;
const shape = (hours: number) => 1 - Math.exp(-Math.max(0, hours) / TAU_HOURS);

/** Hours after posting when tracking started; some older reels were found late. */
export function trackingStartHours(
  reel: Pick<IgReel, "shortcode" | "postedAt">,
  now: Date,
): number {
  const ageDays = (now.getTime() - new Date(reel.postedAt).getTime()) / DAY_MS;
  return ageDays > 20 && hashString(reel.shortcode) % 3 === 0 ? 14 * 24 : 0;
}

/** Views over time on a saturating curve ending at the reel's current views. */
export function viewsAtHour(finalViews: number, ageHours: number, hour: number): number {
  const end = shape(ageHours) || 1;
  return Math.round((finalViews * shape(Math.min(hour, ageHours))) / end);
}

export function snapshotsFor(reel: IgReel, now: Date): Snapshot[] {
  if (reel.views === null) return [];
  const posted = new Date(reel.postedAt).getTime();
  const ageHours = (now.getTime() - posted) / HOUR_MS;
  const start = trackingStartHours(reel, now);
  const points: Snapshot[] = [];
  // 6-hourly for the first week, daily after that.
  for (let h = Math.ceil(start / 6) * 6; h < ageHours; h += h < 168 ? 6 : 24) {
    points.push({
      capturedAt: new Date(posted + h * HOUR_MS).toISOString(),
      views: viewsAtHour(reel.views, ageHours, h),
    });
  }
  points.push({ capturedAt: now.toISOString(), views: reel.views });
  return points;
}

/** Used by tests: median views of a generated set. */
export const medianViews = (reels: readonly IgReel[]) => median(reels.map((r) => r.views ?? 0));
