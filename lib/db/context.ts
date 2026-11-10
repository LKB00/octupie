import "server-only";
import type { VoiceProfile } from "@/lib/ai/schemas";
import { nextId, store } from "./mock-store";
import type { ContextDiff, StrategyField } from "./types";

const stamp = () => new Date().toISOString();
const LABEL: Record<StrategyField, string> = { positioning: "Positioning", audience: "Ideal customer", goals: "Goals" };

export function getContext() {
  const s = store();
  return {
    strategy: s.creator.strategy,
    voice: s.creator.voice,
    facts: s.facts,
    sources: s.voiceSources,
    versions: [...s.voiceVersions].reverse(),
    conflict: s.conflict,
    voiceConflict: s.creator.voiceConflict,
  };
}

export function updateStrategyField(field: StrategyField, value: string) {
  store().creator.strategy[field] = value.trim();
}

export function setStrategyList(kind: "proof" | "dontUse", items: string[]) {
  store().creator.strategy[kind] = items.map((i) => i.trim()).filter(Boolean);
}

export function updatePillar(id: string, name: string, description: string) {
  const p = store().creator.strategy.pillars.find((x) => x.id === id);
  if (p) Object.assign(p, { name: name.trim(), description: description.trim() });
}

/**
 * "What changed?": the strategy/build job rewrites the docs from one sentence. Mock: route the
 * sentence to the fields it touches and show before → after for the creator to approve.
 */
export function proposeChanges(text: string): ContextDiff {
  const s = store().creator.strategy;
  const t = text.trim().replace(/\.$/, "");
  const lower = t.toLowerCase();
  const diff: ContextDiff = [];
  const add = (field: StrategyField, after: string) => diff.push({ field, label: LABEL[field], before: s[field], after });
  if (/\b(sell|offer|launch|course|cohort|service|price|₹|\$)\b/.test(lower) || diff.length === 0) {
    add("positioning", `${s.positioning} ${t}.`);
  }
  if (/\b(audience|for |junior|senior|founders|students|clients|customers)\b/.test(lower)) {
    add("audience", `${s.audience} Now also: ${t.charAt(0).toLowerCase()}${t.slice(1)}.`);
  }
  if (/\b(goal|want|aim|grow|hire|book|leads)\b/.test(lower)) add("goals", `${s.goals} ${t}.`);
  return diff;
}

export function applyChanges(diff: ContextDiff) {
  for (const d of diff) updateStrategyField(d.field, d.after);
}

export function addFact(label: string, value: string) {
  store().facts.push({ id: nextId("f"), label: label.trim(), value: value.trim(), checkedAt: stamp() });
}

export function updateFact(id: string, value: string) {
  const f = store().facts.find((x) => x.id === id);
  if (f) Object.assign(f, { value: value.trim(), checkedAt: stamp() });
}

export function deleteFact(id: string) {
  const s = store();
  s.facts = s.facts.filter((f) => f.id !== id);
}

/** Free on every plan, but rate-limited: once a minute per fact. */
export function refreshFact(id: string): { ok: boolean; message?: string } {
  const f = store().facts.find((x) => x.id === id);
  if (!f) return { ok: false, message: "That fact no longer exists." };
  const since = Date.now() - new Date(f.checkedAt).getTime();
  if (since < 60_000) return { ok: false, message: "Checked less than a minute ago. Try again shortly." };
  f.checkedAt = stamp();
  return { ok: true };
}

function saveVoice(next: VoiceProfile, reason: string) {
  const s = store();
  s.creator.voice = next;
  s.voiceVersions.push({ id: nextId("vv"), voice: structuredClone(next), reason, createdAt: stamp() });
}

export function setPhrases(phrases: string[]) {
  const v = store().creator.voice;
  saveVoice({ ...v, phrases: phrases.map((p) => p.trim()).filter(Boolean).slice(0, 8) }, "Edited phrases");
}

export function toggleSource(id: string) {
  const s = store();
  const src = s.voiceSources.find((x) => x.id === id);
  if (!src || src.kind === "recording" && !src.text) return;
  src.enabled = !src.enabled;
  saveVoice({ ...s.creator.voice }, `${src.enabled ? "Turned on" : "Turned off"} ${src.label.toLowerCase()}`);
}

/** voice/build after a writing sample: mock folds professional topics into the voice. */
export function addWritingSample(text: string) {
  const s = store();
  const words = text.trim().split(/\s+/).length;
  s.voiceSources.push({ id: nextId("vs"), kind: "writing", label: "Writing sample", detail: `${words} words`, enabled: true, text });
  const professional = /\b(design|product|founder|portfolio|ux|fintech|startup|brand|client)\b/i.test(text);
  const v = s.creator.voice;
  saveVoice(
    {
      ...v,
      summary: professional
        ? "Warm and direct; mixes Hindi and English, leaning English for product and design topics. Opens with a surprising claim and closes with a question."
        : v.summary,
      languageMix: professional ? [{ lang: "en", share: 0.65 }, { lang: "hi", share: 0.35 }] : v.languageMix,
      topics: professional ? ["product design", "personal brand", ...v.topics.slice(0, 2)] : v.topics,
    },
    "Added a writing sample",
  );
  if (professional) resolveConflict("resolved");
}

export function restoreVoiceVersion(id: string) {
  const v = store().voiceVersions.find((x) => x.id === id);
  if (v) saveVoice(structuredClone(v.voice), `Restored version from ${new Date(v.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`);
}

export function resolveConflict(status: "kept" | "resolved", neutralPillars: string[] = []) {
  const s = store();
  s.conflict = { status, neutralPillars };
  s.creator.voiceConflict = { ...s.creator.voiceConflict, conflict: false };
}
