import type { ScriptContent } from "@/lib/ai/schemas";
import { now } from "@/lib/clock";
import { fixtures } from "@/lib/data/fixtures";
import { mockAvatar } from "@/lib/data/mock/avatars";
import type { Breakdown, VideoObservation } from "@/lib/ai/schemas";
import type { Plan, UsageKind } from "@/lib/quota";
import type { ChatMessage, Creator, LiveFact, Notification, NotificationPrefs, OnboardingState, ScriptRecord, ScriptVersion, VoiceSource, VoiceVersion } from "./types";
import type { Billing } from "@/lib/billing/prices";
import type { Invoice } from "@/lib/billing/types";

/**
 * In-memory stand-in for Supabase while MOCK_MODE=true. Seeded from fixtures; lives on
 * globalThis so it survives hot reloads, and resets when the dev server restarts.
 */
export type MockState = {
  creator: Creator;
  plan: Plan;
  periodStart: string;
  tracked: { handle: string; addedAt: string }[];
  saved: Set<string>;
  breakdowns: Map<string, { breakdown: Breakdown; observation: VideoObservation | null; createdAt: string }>;
  jobs: Map<string, { id: string; shortcode: string; startedAt: number; status: "running" | "done" | "failed"; error?: string }>;
  usage: { kind: UsageKind; createdAt: string }[];
  scripts: Map<string, ScriptRecord>;
  versions: Map<string, ScriptVersion[]>;
  undo: Map<string, string[]>;
  redo: Map<string, string[]>;
  messages: Map<string, ChatMessage[]>;
  notifications: Notification[];
  prefs: NotificationPrefs;
  /** Mock-only switch to show the feed's error state */
  feedFails: boolean;
  /** Context (M8) */
  facts: LiveFact[];
  voiceSources: VoiceSource[];
  voiceVersions: VoiceVersion[];
  conflict: { status: "open" | "kept" | "resolved"; neutralPillars: string[] };
  onboarding: OnboardingState;
  /** Billing (M9, mock) */
  invoices: Invoice[];
  billing: Billing;
  seq: number;
};

function seed(): MockState {
  const at = now();
  const iso = (hoursAgo: number) => new Date(at.getTime() - hoursAgo * 3_600_000).toISOString();
  const c = fixtures.creator;
  const creator: Creator = {
    id: c.id,
    displayName: c.displayName,
    igHandle: c.igHandle,
    avatarUrl: mockAvatar(c.igHandle),
    primaryLanguage: c.primaryLanguage,
    strategy: structuredClone(c.strategy),
    voice: structuredClone(c.voice),
    voiceConflict: structuredClone(c.voiceConflict),
  };

  const usage: MockState["usage"] = [];
  const add = (kind: UsageKind, n: number) => {
    for (let i = 0; i < n; i++) usage.push({ kind, createdAt: iso(24 * (i + 1)) });
  };
  add("breakdown", fixtures.usage.breakdowns);
  add("script", fixtures.usage.scripts);
  add("chat_message", fixtures.usage.chatMessages);

  const breakdowns: MockState["breakdowns"] = new Map(
    fixtures.breakdowns.map((b) => [b.shortcode, { breakdown: b.breakdown, observation: b.observation, createdAt: iso(30) }]),
  );

  const scripts = new Map<string, ScriptRecord>();
  const versions = new Map<string, ScriptVersion[]>();
  for (const s of fixtures.scripts) {
    const pillarId = c.strategy.pillars.find((p) => p.name === s.pillar)?.id ?? null;
    const v: ScriptVersion = { id: `${s.id}_v1`, content: structuredClone(s.content) as ScriptContent, reason: "Generated", createdAt: iso(26) };
    versions.set(s.id, [v]);
    scripts.set(s.id, {
      id: s.id,
      creatorId: s.creatorId,
      title: s.content.title,
      status: s.status,
      angle: s.angle,
      voiceMode: s.voiceMode,
      pillarId,
      sourceShortcode: s.sourceShortcode,
      content: structuredClone(s.content) as ScriptContent,
      currentVersionId: v.id,
      createdAt: iso(26),
      updatedAt: iso(26),
    });
  }

  return {
    creator,
    plan: fixtures.usage.plan,
    periodStart: "2026-08-01T00:00:00.000Z",
    tracked: fixtures.trackedAccounts.map((a, i) => ({ handle: a.handle, addedAt: iso(24 * (40 - i)) })),
    saved: new Set(fixtures.reels.filter((r) => r.isOutlier).slice(3, 5).map((r) => r.shortcode)),
    breakdowns,
    jobs: new Map(),
    usage,
    scripts,
    versions,
    undo: new Map(),
    redo: new Map(),
    messages: new Map([["s_demo", []]]),
    notifications: [
      { id: "n1", kind: "breakout", title: "@pmwithmeera has a reel at 24× in the last day", href: `/c/${c.id}/reels/cuEMrZrsBBq`, createdAt: iso(10), read: false },
      { id: "n2", kind: "feed_ready", title: "Your feed is ready: 12 accounts checked", href: `/c/${c.id}/discover`, createdAt: iso(30), read: false },
      { id: "n3", kind: "voice_ready", title: "Your voice profile is ready", href: `/c/${c.id}/context?tab=voice`, createdAt: iso(52), read: true },
    ],
    prefs: { weeklyEmail: true, breakoutAlerts: true, quotaWarnings: true },
    feedFails: false,
    facts: [
      { id: "f1", label: "Followers", value: "8,400 on Instagram", checkedAt: iso(20) },
      { id: "f2", label: "Offer", value: "Portfolio reviews for product designers, ₹2,999", checkedAt: iso(24 * 12) },
      { id: "f3", label: "Based in", value: "Bengaluru, India", checkedAt: iso(24 * 40) },
      { id: "f4", label: "Posting rhythm", value: "3 reels a week", checkedAt: iso(24 * 3) },
    ],
    voiceSources: [
      { id: "vs1", kind: "reels", label: "Your reels", detail: "781 words from 21 reels", enabled: true },
      { id: "vs2", kind: "recording", label: "Voice recording", detail: "Not added yet", enabled: false },
    ],
    voiceVersions: [{ id: "vv1", voice: creator.voice, reason: "Built from your reels", createdAt: iso(52) }],
    conflict: { status: "open", neutralPillars: [] },
    onboarding: { handle: null, answers: {}, pillarIds: [], completed: true },
    invoices: [],
    billing: "monthly",
    seq: 1,
  };
}

const g = globalThis as unknown as { __octupieStore?: MockState };

export function store(): MockState {
  g.__octupieStore ??= seed();
  return g.__octupieStore;
}

export function resetStore(): void {
  g.__octupieStore = seed();
}

export function nextId(prefix: string): string {
  const s = store();
  s.seq += 1;
  return `${prefix}_${s.seq.toString(36)}${Date.now().toString(36).slice(-4)}`;
}
