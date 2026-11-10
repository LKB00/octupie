"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import {
  addFact,
  addWritingSample,
  applyChanges,
  deleteFact,
  proposeChanges,
  refreshFact,
  resolveConflict,
  restoreVoiceVersion,
  setPhrases,
  setStrategyList,
  toggleSource,
  updateFact,
  updatePillar,
  updateStrategyField,
} from "@/lib/db";
import type { ContextDiff } from "@/lib/db/types";

const field = z.enum(["positioning", "audience", "goals"]);
const id = z.string().min(1).max(40);

export async function updateStrategyFieldAction(input: { field: string; value: string }) {
  await requireSession();
  const p = z.object({ field, value: z.string().trim().min(1).max(600) }).safeParse(input);
  if (!p.success) return { ok: false as const, message: "Write between 1 and 600 characters." };
  updateStrategyField(p.data.field, p.data.value);
  refresh();
  return { ok: true as const };
}

export async function setStrategyListAction(input: { kind: string; items: string[] }) {
  await requireSession();
  const p = z
    .object({ kind: z.enum(["proof", "dontUse"]), items: z.array(z.string().max(160)).max(12) })
    .parse(input);
  setStrategyList(p.kind, p.items);
  refresh();
}

export async function updatePillarAction(input: { id: string; name: string; description: string }) {
  await requireSession();
  const p = z
    .object({ id, name: z.string().trim().min(1).max(40), description: z.string().trim().max(160) })
    .safeParse(input);
  if (!p.success) return { ok: false as const, message: "Pillar names need 1 to 40 characters." };
  updatePillar(p.data.id, p.data.name, p.data.description);
  refresh();
  return { ok: true as const };
}

export async function proposeChangesAction(
  text: string,
): Promise<{ ok: true; diff: ContextDiff } | { ok: false; message: string }> {
  await requireSession();
  const t = z.string().trim().min(8).max(500).safeParse(text);
  if (!t.success) return { ok: false, message: "Describe what changed in a sentence or two." };
  return { ok: true, diff: proposeChanges(t.data) };
}

export async function applyChangesAction(diff: ContextDiff) {
  await requireSession();
  const d = z
    .array(z.object({ field, label: z.string(), before: z.string(), after: z.string().max(1200) }))
    .parse(diff);
  applyChanges(d);
  refresh();
}

export async function factAction(input: {
  op: "add" | "update" | "delete" | "refresh";
  id?: string;
  label?: string;
  value?: string;
}) {
  await requireSession();
  const p = z
    .object({
      op: z.enum(["add", "update", "delete", "refresh"]),
      id: id.optional(),
      label: z.string().trim().max(40).optional(),
      value: z.string().trim().max(200).optional(),
    })
    .parse(input);
  let result: { ok: boolean; message?: string } = { ok: true };
  if (p.op === "add" && p.label && p.value) addFact(p.label, p.value);
  else if (p.op === "update" && p.id && p.value) updateFact(p.id, p.value);
  else if (p.op === "delete" && p.id) deleteFact(p.id);
  else if (p.op === "refresh" && p.id) result = refreshFact(p.id);
  else result = { ok: false, message: "Fill in both the label and the value." };
  refresh();
  return result;
}

export async function setPhrasesAction(phrases: string[]) {
  await requireSession();
  setPhrases(z.array(z.string().max(60)).max(8).parse(phrases));
  refresh();
}

export async function toggleSourceAction(sourceId: string) {
  await requireSession();
  toggleSource(id.parse(sourceId));
  refresh();
}

export async function addWritingSampleAction(text: string) {
  await requireSession();
  const t = z.string().trim().min(40).max(5000).safeParse(text);
  if (!t.success)
    return {
      ok: false as const,
      message: "Paste at least a few sentences (40 characters or more).",
    };
  addWritingSample(t.data);
  refresh();
  return { ok: true as const };
}

export async function restoreVoiceAction(versionId: string) {
  await requireSession();
  restoreVoiceVersion(id.parse(versionId));
  refresh();
}

export async function resolveConflictAction(input: {
  choice: "keep" | "neutral";
  pillars?: string[];
}) {
  await requireSession();
  const p = z
    .object({
      choice: z.enum(["keep", "neutral"]),
      pillars: z.array(z.string().max(40)).optional(),
    })
    .parse(input);
  resolveConflict(
    p.choice === "keep" ? "kept" : "resolved",
    p.choice === "neutral" ? (p.pillars ?? []) : [],
  );
  refresh();
}
