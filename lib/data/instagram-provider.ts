import { z } from "zod";

/** Public profile of an Instagram account. Every provider maps its output to this. */
export const igProfileSchema = z.object({
  handle: z.string(),
  name: z.string(),
  avatarUrl: z.string(),
  bio: z.string(),
  followers: z.number().int().nonnegative(),
  following: z.number().int().nonnegative(),
  mediaCount: z.number().int().nonnegative(),
  isPrivate: z.boolean(),
  isBusinessOrCreator: z.boolean(),
});
export type IgProfile = z.infer<typeof igProfileSchema>;

export const reelTypeSchema = z.enum(["reel", "carousel", "image"]);
export type ReelType = z.infer<typeof reelTypeSchema>;

export const igReelSchema = z.object({
  shortcode: z.string(),
  ownerHandle: z.string(),
  postedAt: z.string(), // ISO
  caption: z.string(),
  views: z.number().int().nonnegative().nullable(),
  likes: z.number().int().nonnegative().nullable(),
  comments: z.number().int().nonnegative(),
  durationSec: z.number().nullable(),
  thumbnailUrl: z.string(),
  permalink: z.string(),
  type: reelTypeSchema,
  audioTitle: z.string().optional(),
  /** First spoken line, when a transcript exists. Falls back to the caption in the UI. */
  hookLine: z.string().optional(),
});
export type IgReel = z.infer<typeof igReelSchema>;

export const snapshotSchema = z.object({
  capturedAt: z.string(),
  views: z.number().int().nonnegative(),
});
export type Snapshot = z.infer<typeof snapshotSchema>;

/** All Instagram access goes through this interface (docs/05-ARCHITECTURE.md §2). */
export interface InstagramProvider {
  /** null = not found or private */
  getProfile(handle: string): Promise<IgProfile | null>;
  listReels(handle: string, opts: { limit: number; since?: Date }): Promise<IgReel[]>;
  /** Fresh counts for snapshots */
  getReel(shortcode: string): Promise<IgReel | null>;
  /** Short-lived video URL for analysis */
  getMediaUrl(shortcode: string): Promise<string | null>;
  searchAccounts?(query: string, limit: number): Promise<IgProfile[]>;
}
