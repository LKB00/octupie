import type {
  Breakdown,
  ReelAngle,
  ScriptAngle,
  ScriptContent,
  ScriptStatus,
  VideoObservation,
  VoiceConflict,
  VoiceMode,
  VoiceProfile,
} from "@/lib/ai/schemas";
import type { IgProfile, IgReel, Snapshot } from "@/lib/data/instagram-provider";
import type { Baseline } from "@/lib/outliers/baseline";
import type { ScriptDiff } from "@/lib/studio/diff";
import type { Meter, Plan } from "@/lib/quota";

export type Pillar = { id: string; name: string; description: string };

export type Creator = {
  id: string;
  displayName: string;
  igHandle: string;
  avatarUrl: string;
  primaryLanguage: string;
  strategy: {
    positioning: string;
    audience: string;
    goals: string;
    pillars: Pillar[];
    proof: string[];
    dontUse: string[];
  };
  voice: VoiceProfile;
  voiceConflict: VoiceConflict;
};

export type TrackedAccount = {
  profile: IgProfile;
  baseline: Baseline;
  outliers30d: number;
  addedAt: string;
};

export type ScoredReel = IgReel & {
  baseline: Baseline;
  multiple: number | null;
  isOutlier: boolean;
  breakingScore: number;
  pillarId: string | null;
  owner: Pick<IgProfile, "handle" | "name" | "avatarUrl" | "followers">;
  saved: boolean;
  analysed: boolean;
};

export type FeedSort = "breaking" | "newest" | "multiple";
export type FeedWindow = 7 | 30 | 90;
export type FeedFormat = "all" | "reel" | "carousel";

export type FeedFilters = {
  sort: FeedSort;
  window: FeedWindow;
  format: FeedFormat;
  pillar: string | null;
  account: string | null;
  minMultiple: number;
};

export type ReelDetail = {
  reel: ScoredReel;
  snapshots: Snapshot[];
  typicalCurve: Snapshot[];
  trackingStartedDay: number | null;
  breakdown: { breakdown: Breakdown; observation: VideoObservation | null } | null;
  isOwn: boolean;
};

export type ScriptVersion = { id: string; content: ScriptContent; reason: string; createdAt: string };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
  /** For assistant edits: what changed and the version to return to */
  change?: { summary: string; undoVersionId: string; diff?: ScriptDiff };
  /** Thumbs up/down from the creator, with a reason when it's down */
  feedback?: { value: "up" | "down"; reason?: string };
  /** One-tap follow-ups offered under an assistant reply */
  suggestions?: string[];
  error?: boolean;
};

export type ScriptRecord = {
  id: string;
  creatorId: string;
  title: string;
  status: ScriptStatus;
  angle: ScriptAngle;
  voiceMode: VoiceMode;
  pillarId: string | null;
  sourceShortcode: string | null;
  content: ScriptContent;
  currentVersionId: string;
  createdAt: string;
  updatedAt: string;
};

export type ScriptWithHistory = ScriptRecord & {
  versions: ScriptVersion[];
  canUndo: boolean;
  canRedo: boolean;
  messages: ChatMessage[];
};

export type UsageSummary = {
  plan: Plan;
  periodStart: string;
  renewsAt: string;
  breakdowns: Meter;
  scripts: Meter;
  chatMessages: Meter;
  trackedAccounts: Meter;
};

export type Notification = {
  id: string;
  kind: "feed_ready" | "voice_ready" | "breakout" | "quota";
  title: string;
  href?: string;
  createdAt: string;
  read: boolean;
};

export type NotificationPrefs = { weeklyEmail: boolean; breakoutAlerts: boolean; quotaWarnings: boolean };

export type { ReelAngle };

export type LiveFact = { id: string; label: string; value: string; checkedAt: string };

export type VoiceSource = {
  id: string;
  kind: "reels" | "recording" | "writing";
  label: string;
  detail: string;
  enabled: boolean;
  text?: string;
};

export type VoiceVersion = { id: string; voice: VoiceProfile; reason: string; createdAt: string };

export type OnboardingState = {
  handle: string | null;
  answers: Record<string, string>;
  pillarIds: string[];
  completed: boolean;
};

export type StrategyField = "positioning" | "audience" | "goals";

export type ContextDiff = { field: StrategyField; label: string; before: string; after: string }[];
