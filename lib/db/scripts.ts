import "server-only";
import type { ScriptAngle, ScriptContent, ScriptStatus, VoiceMode } from "@/lib/ai/schemas";
import { nextId, store } from "./mock-store";
import type { ChatMessage, ScriptRecord, ScriptVersion, ScriptWithHistory } from "./types";

const stamp = () => new Date().toISOString();

export type ScriptFilters = { status: ScriptStatus | null; pillar: string | null; q: string };

export function listScripts(f: ScriptFilters = { status: null, pillar: null, q: "" }): ScriptRecord[] {
  const q = f.q.trim().toLowerCase();
  return [...store().scripts.values()]
    .filter((s) => !f.status || s.status === f.status)
    .filter((s) => !f.pillar || s.pillarId === f.pillar)
    .filter((s) => !q || s.title.toLowerCase().includes(q))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function countScripts(): number {
  return store().scripts.size;
}

export function getScript(id: string): ScriptWithHistory | null {
  const s = store();
  const script = s.scripts.get(id);
  if (!script) return null;
  return {
    ...script,
    versions: [...(s.versions.get(id) ?? [])].reverse(),
    canUndo: (s.undo.get(id)?.length ?? 0) > 0,
    canRedo: (s.redo.get(id)?.length ?? 0) > 0,
    messages: s.messages.get(id) ?? [],
  };
}

/** Scripts are first-class records (CLAUDE.md rule 5): created as soon as generation succeeds. */
export function createScript(input: {
  content: ScriptContent;
  angle: ScriptAngle;
  voiceMode: VoiceMode;
  pillarId: string | null;
  sourceShortcode: string | null;
}): ScriptRecord {
  const s = store();
  const id = nextId("s");
  const version: ScriptVersion = { id: nextId("v"), content: input.content, reason: "Generated", createdAt: stamp() };
  const record: ScriptRecord = {
    id,
    creatorId: s.creator.id,
    title: input.content.title,
    status: "draft",
    angle: input.angle,
    voiceMode: input.voiceMode,
    pillarId: input.pillarId,
    sourceShortcode: input.sourceShortcode,
    content: input.content,
    currentVersionId: version.id,
    createdAt: stamp(),
    updatedAt: stamp(),
  };
  s.scripts.set(id, record);
  s.versions.set(id, [version]);
  s.messages.set(id, []);
  return record;
}

/** Save new content as a version and make it one undo step. */
export function saveContent(id: string, content: ScriptContent, reason: string): ScriptVersion {
  const s = store();
  const script = s.scripts.get(id);
  if (!script) throw new Error("Script not found");
  const version: ScriptVersion = { id: nextId("v"), content, reason, createdAt: stamp() };
  s.versions.get(id)!.push(version);
  s.undo.set(id, [...(s.undo.get(id) ?? []), script.currentVersionId]);
  s.redo.set(id, []);
  s.scripts.set(id, { ...script, content, title: content.title, currentVersionId: version.id, updatedAt: stamp() });
  return version;
}

function moveTo(id: string, versionId: string) {
  const s = store();
  const script = s.scripts.get(id)!;
  const v = s.versions.get(id)!.find((x) => x.id === versionId);
  if (!v) return;
  s.scripts.set(id, { ...script, content: v.content, title: v.content.title, currentVersionId: v.id, updatedAt: stamp() });
}

export function undo(id: string): boolean {
  const s = store();
  const stack = s.undo.get(id) ?? [];
  const target = stack.pop();
  if (!target) return false;
  s.redo.set(id, [...(s.redo.get(id) ?? []), s.scripts.get(id)!.currentVersionId]);
  moveTo(id, target);
  return true;
}

export function redo(id: string): boolean {
  const s = store();
  const stack = s.redo.get(id) ?? [];
  const target = stack.pop();
  if (!target) return false;
  s.undo.set(id, [...(s.undo.get(id) ?? []), s.scripts.get(id)!.currentVersionId]);
  moveTo(id, target);
  return true;
}

export function restoreVersion(id: string, versionId: string): void {
  const v = store().versions.get(id)?.find((x) => x.id === versionId);
  if (v) saveContent(id, v.content, `Restored version from ${new Date(v.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`);
}

export function updateScriptMeta(id: string, patch: Partial<Pick<ScriptRecord, "status" | "pillarId" | "voiceMode">>): void {
  const s = store();
  const script = s.scripts.get(id);
  if (script) s.scripts.set(id, { ...script, ...patch, updatedAt: stamp() });
}

export function duplicateScript(id: string): ScriptRecord | null {
  const original = store().scripts.get(id);
  if (!original) return null;
  return createScript({
    content: { ...original.content, title: `${original.content.title} (copy)`.slice(0, 80) },
    angle: original.angle,
    voiceMode: original.voiceMode,
    pillarId: original.pillarId,
    sourceShortcode: original.sourceShortcode,
  });
}

export function deleteScript(id: string): void {
  const s = store();
  s.scripts.delete(id);
  s.versions.delete(id);
  s.messages.delete(id);
  s.undo.delete(id);
  s.redo.delete(id);
}

export function addMessage(id: string, message: Omit<ChatMessage, "id" | "createdAt">): ChatMessage {
  const s = store();
  const m: ChatMessage = { ...message, id: nextId("m"), createdAt: stamp() };
  s.messages.set(id, [...(s.messages.get(id) ?? []), m]);
  return m;
}

export function setMessageFeedback(scriptId: string, messageId: string, feedback: ChatMessage["feedback"]) {
  const s = store();
  const list = s.messages.get(scriptId) ?? [];
  s.messages.set(scriptId, list.map((m) => (m.id === messageId ? { ...m, feedback } : m)));
}

export function scriptAsText(script: Pick<ScriptRecord, "content">): string {
  const c = script.content;
  const hook = c.hooks[c.selectedHook]?.text;
  const body = c.lines.map((l, i) => `${i + 1}. ${l.text}${l.cue ? `\n   [${l.cue}]` : ""}`).join("\n");
  return [
    c.title,
    "",
    `Hook: ${hook}`,
    "",
    body,
    "",
    `CTA: ${c.cta}`,
    "",
    "Caption:",
    c.caption,
    c.hashtags.join(" "),
    "",
    `≈ ${c.estSeconds} s`,
  ].join("\n");
}

