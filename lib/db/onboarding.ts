import "server-only";
import { mockAvatar } from "@/lib/data/mock/avatars";
import { EXTRA_PILLARS, INTERVIEW } from "@/lib/onboarding/steps";
import { nextId, store } from "./mock-store";
import type { Pillar } from "./types";

export type HandleCheck =
  | { ok: true; profile: { handle: string; name: string; avatarUrl: string; followers: number } }
  | { ok: false; message: string };

/** Mock profile lookup. "private" in the handle → private account; "nobody" → not found. */
export function checkHandle(raw: string): HandleCheck {
  const handle = raw.trim().replace(/^@/, "").toLowerCase();
  if (handle.includes("nobody")) return { ok: false, message: `We couldn't find @${handle}. Check the spelling.` };
  if (handle.includes("private")) return { ok: false, message: `@${handle} is private, so we can't read its reels. Switch it to public or professional, then check again.` };
  const s = store();
  const own = handle === s.creator.igHandle;
  const followers = own ? 8400 : 1200 + ([...handle].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 40) * 650;
  s.onboarding = { ...s.onboarding, handle, completed: false };
  return { ok: true, profile: { handle, name: own ? s.creator.displayName : handle, avatarUrl: own ? s.creator.avatarUrl : mockAvatar(handle), followers } };
}

export function getOnboarding() {
  const s = store();
  return { ...s.onboarding, handle: s.onboarding.handle ?? s.creator.igHandle };
}

/** Answers feed the strategy; "never mention" lines go straight onto the don't-use list. */
export function saveAnswer(key: string, value: string) {
  const s = store();
  s.onboarding.answers[key] = value.trim();
  if (key === "never_mention") {
    const lines = value.split(/\n|,/).map((l) => l.trim()).filter(Boolean);
    s.creator.strategy.dontUse = [...new Set([...s.creator.strategy.dontUse, ...lines])];
  }
}

export function suggestedPillars(): Pillar[] {
  return [...store().creator.strategy.pillars, ...EXTRA_PILLARS];
}

export function savePillars(ids: string[], custom: string[]) {
  const s = store();
  const all = suggestedPillars();
  const picked = all.filter((p) => ids.includes(p.id));
  const own = custom.map((name) => ({ id: nextId("p"), name: name.trim(), description: "Your own pillar." }));
  s.creator.strategy.pillars = [...picked, ...own].slice(0, 5);
  s.onboarding.pillarIds = s.creator.strategy.pillars.map((p) => p.id);
}

export function completeOnboarding() {
  const s = store();
  const offer = s.onboarding.answers.offer;
  if (offer && !s.creator.strategy.positioning.includes(offer)) {
    s.creator.strategy.positioning = `${s.creator.strategy.positioning} Sells: ${offer.replace(/\.$/, "")}.`;
  }
  s.onboarding.completed = true;
}

export const interviewKeys = INTERVIEW.map((q) => q.key) as string[];
