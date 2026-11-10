"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { aiStudioEdit, AiOutputError } from "@/lib/ai";
import { scriptContentSchema, SCRIPT_STATUSES } from "@/lib/ai/schemas";
import { requireSession } from "@/lib/auth/session";
import {
  addMessage,
  checkQuota,
  deleteScript,
  duplicateScript,
  getScript,
  recordUsage,
  redo,
  restoreVersion,
  saveContent,
  setMessageFeedback,
  undo,
  updateScriptMeta,
} from "@/lib/db";
import { applyToolCalls, describeChange } from "@/lib/studio/apply-patch";
import { diffScript } from "@/lib/studio/diff";
import { QuotaExceededError } from "@/lib/quota";

const id = z.string().regex(/^[a-z0-9_]{3,40}$/);

export type StudioMessageResult =
  { ok: true } | { ok: false; reason: "quota" | "error"; message: string };

/** One chat message → tool calls → one patch (one undo step) → new version. */
export async function sendStudioMessageAction(
  scriptId: string,
  text: string,
): Promise<StudioMessageResult> {
  await requireSession();
  const sid = id.parse(scriptId);
  const message = z.string().trim().min(1).max(1000).safeParse(text);
  if (!message.success) return { ok: false, reason: "error", message: "Write a message first." };
  const script = getScript(sid);
  if (!script) return { ok: false, reason: "error", message: "We couldn't find that script." };
  try {
    checkQuota("chat_message");
  } catch (e) {
    if (e instanceof QuotaExceededError) return { ok: false, reason: "quota", message: e.message };
    throw e;
  }
  addMessage(sid, { role: "user", text: message.data });
  recordUsage("chat_message");
  try {
    const reply = await aiStudioEdit(message.data, script.content);
    if (reply.calls.length === 0) {
      // Conversation, not an edit: answer without touching the script.
      addMessage(sid, { role: "assistant", text: reply.message, suggestions: reply.suggestions });
    } else {
      const next = scriptContentSchema.parse(applyToolCalls(script.content, reply.calls));
      const before = script.currentVersionId;
      saveContent(sid, next, `Chat: ${message.data.slice(0, 40)}`);
      addMessage(sid, {
        role: "assistant",
        text: reply.message,
        suggestions: reply.suggestions,
        change: {
          summary: describeChange(script.content, next),
          undoVersionId: before,
          diff: diffScript(script.content, next),
        },
      });
    }
  } catch (e) {
    if (!(e instanceof AiOutputError) && !(e instanceof z.ZodError)) throw e;
    addMessage(sid, {
      role: "assistant",
      text: "I couldn't make that change cleanly. Try rephrasing, or use Retry.",
      error: true,
    });
  }
  refresh();
  return { ok: true };
}

const contentEdit = z.object({
  scriptId: id,
  content: scriptContentSchema,
  reason: z.string().max(80),
});

/** Manual edits from the editor (title, hook choice, a line). */
export async function saveScriptContentAction(input: z.input<typeof contentEdit>) {
  await requireSession();
  const { scriptId, content, reason } = contentEdit.parse(input);
  saveContent(scriptId, content, reason);
  refresh();
  return { ok: true as const, savedAt: new Date().toISOString() };
}

export async function undoAction(scriptId: string) {
  await requireSession();
  undo(id.parse(scriptId));
  refresh();
}

export async function redoAction(scriptId: string) {
  await requireSession();
  redo(id.parse(scriptId));
  refresh();
}

export async function restoreVersionAction(scriptId: string, versionId: string) {
  await requireSession();
  restoreVersion(id.parse(scriptId), id.parse(versionId));
  refresh();
}

const meta = z.object({
  scriptId: id,
  status: z.enum(SCRIPT_STATUSES).optional(),
  pillarId: z.string().max(40).nullable().optional(),
  voiceMode: z.enum(["own", "neutral"]).optional(),
});

/** Status changes save immediately (docs/03 S7). */
export async function updateScriptMetaAction(input: z.input<typeof meta>) {
  await requireSession();
  const { scriptId, ...patch } = meta.parse(input);
  updateScriptMeta(scriptId, patch);
  refresh();
}

export async function duplicateScriptAction(scriptId: string) {
  await requireSession();
  const copy = duplicateScript(id.parse(scriptId));
  refresh();
  return copy ? { ok: true as const, id: copy.id } : { ok: false as const };
}

export async function deleteScriptAction(scriptId: string) {
  await requireSession();
  deleteScript(id.parse(scriptId));
  refresh();
}

const renameSchema = z.object({ scriptId: id, title: z.string().trim().min(1).max(80) });

/** Rename a chat / script from the Studio chat list. */
export async function renameScriptAction(input: z.input<typeof renameSchema>) {
  await requireSession();
  const parsed = renameSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, message: "Titles need 1 to 80 characters." };
  const script = getScript(parsed.data.scriptId);
  if (!script) return { ok: false as const, message: "We couldn't find that script." };
  saveContent(script.id, { ...script.content, title: parsed.data.title }, "Renamed");
  refresh();
  return { ok: true as const };
}

const feedback = z.object({
  scriptId: id,
  messageId: id,
  value: z.enum(["up", "down"]).nullable(),
  reason: z.string().max(60).optional(),
});

/** Thumbs on an assistant reply. Kept with the message to tune the voice later. */
export async function messageFeedbackAction(input: z.input<typeof feedback>) {
  await requireSession();
  const p = feedback.parse(input);
  setMessageFeedback(
    p.scriptId,
    p.messageId,
    p.value ? { value: p.value, reason: p.reason } : undefined,
  );
  refresh();
}
