import { fixtures } from "./fixtures";
import { mockAvatar } from "./mock/avatars";
import type { IgProfile, IgReel, InstagramProvider, Snapshot } from "./instagram-provider";
import {
  SUGGESTED_ACCOUNTS,
  fillerReels,
  ownReels,
  snapshotsFor,
  suggestedAccountReels,
} from "./mock/generate";

/**
 * Reads fixtures/sample-data.json and fills in deterministic history around it.
 * Same output on every run (MOCK_MODE, tests, milestones 0–5).
 */
export class MockProvider implements InstagramProvider {
  private readonly reelsByHandle = new Map<string, IgReel[]>();
  private readonly profiles = new Map<string, IgProfile>();

  constructor(private readonly now: Date) {
    for (const a of fixtures.trackedAccounts) {
      this.profiles.set(a.handle, {
        handle: a.handle,
        name: a.name,
        avatarUrl: mockAvatar(a.handle),
        bio: "",
        followers: a.followers,
        following: 300,
        mediaCount: 200,
        isPrivate: false,
        isBusinessOrCreator: true,
      });
      const own: IgReel[] = fixtures.reels
        .filter((r) => r.ownerHandle === a.handle)
        .map((r) => ({
          shortcode: r.shortcode,
          ownerHandle: r.ownerHandle,
          postedAt: r.postedAt,
          caption: r.caption,
          hookLine: r.hookLine,
          views: r.views,
          likes: r.likes,
          comments: r.comments,
          durationSec: r.durationSec,
          thumbnailUrl: r.thumbnailUrl,
          permalink: r.permalink,
          type: r.type,
        }));
      this.reelsByHandle.set(a.handle, [...own, ...fillerReels(a.handle, a.usualViews, own, now)]);
    }

    const c = fixtures.creator;
    this.profiles.set(c.igHandle, {
      handle: c.igHandle,
      name: c.displayName,
      avatarUrl: mockAvatar(c.igHandle),
      bio: c.strategy.positioning,
      followers: 8400,
      following: 610,
      mediaCount: 140,
      isPrivate: false,
      isBusinessOrCreator: true,
    });
    this.reelsByHandle.set(c.igHandle, ownReels(c.igHandle, c.usualViews, now));

    for (const p of SUGGESTED_ACCOUNTS) {
      this.profiles.set(p.handle, p);
      this.reelsByHandle.set(p.handle, suggestedAccountReels(p, now));
    }
    this.profiles.set("private.account", {
      ...SUGGESTED_ACCOUNTS[0]!,
      handle: "private.account",
      name: "Private account",
      avatarUrl: "",
      isPrivate: true,
    });
  }

  async getProfile(handle: string): Promise<IgProfile | null> {
    return this.profiles.get(normaliseHandle(handle)) ?? null;
  }

  async listReels(handle: string, opts: { limit: number; since?: Date }): Promise<IgReel[]> {
    const since = opts.since?.getTime() ?? 0;
    return (this.reelsByHandle.get(normaliseHandle(handle)) ?? [])
      .filter((r) => new Date(r.postedAt).getTime() >= since)
      .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
      .slice(0, opts.limit);
  }

  async getReel(shortcode: string): Promise<IgReel | null> {
    for (const reels of this.reelsByHandle.values()) {
      const found = reels.find((r) => r.shortcode === shortcode);
      if (found) return found;
    }
    return null;
  }

  async getMediaUrl(shortcode: string): Promise<string | null> {
    return (await this.getReel(shortcode)) ? `mock://video/${shortcode}.mp4` : null;
  }

  async searchAccounts(query: string, limit: number): Promise<IgProfile[]> {
    const q = query.toLowerCase();
    return SUGGESTED_ACCOUNTS.filter(
      (p) => p.handle.includes(q) || p.name.toLowerCase().includes(q) || q.length === 0,
    ).slice(0, limit);
  }

  /** Mock-only: the view history the snapshots job would have stored. */
  snapshots(reel: IgReel): Snapshot[] {
    return snapshotsFor(reel, this.now);
  }

  /** Mock-only: every handle with reels, for seeding the store. */
  allHandles(): string[] {
    return [...this.reelsByHandle.keys()];
  }
}

export function normaliseHandle(input: string): string {
  return input
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

/** Instagram handles: letters, numbers, dots and underscores, 1–30 characters. */
export const HANDLE_PATTERN = /^[a-z0-9._]{1,30}$/;
