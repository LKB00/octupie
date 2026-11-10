import type { ScriptContent } from "@/lib/ai/schemas";

export type DiffRow = {
  kind: "removed" | "added";
  line: number | null;
  label: string;
  text: string;
};
export type ScriptDiff = { rows: DiffRow[]; added: number; removed: number; more: number };

const MAX_ROWS = 8;

/**
 * Line-level diff of two script versions for the chat's change card (LCS on line text).
 * The chosen hook and the title show as their own rows when they change.
 */
export function diffScript(before: ScriptContent, after: ScriptContent): ScriptDiff {
  const rows: DiffRow[] = [];
  if (before.title !== after.title) {
    rows.push({ kind: "removed", line: null, label: "Title", text: before.title });
    rows.push({ kind: "added", line: null, label: "Title", text: after.title });
  }
  const hb = before.hooks[before.selectedHook]?.text ?? "";
  const ha = after.hooks[after.selectedHook]?.text ?? "";
  if (hb !== ha) {
    rows.push({ kind: "removed", line: null, label: "Hook", text: hb });
    rows.push({ kind: "added", line: null, label: "Hook", text: ha });
  }
  const a = before.lines.map((l) => l.text);
  const b = after.lines.map((l) => l.text);
  // LCS table, then walk it to emit removed/added rows in order.
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      i++;
      j++;
    } else if (i < a.length && (j >= b.length || dp[i + 1]![j]! >= dp[i]![j + 1]!)) {
      // Removed first, so each old line sits right above what replaced it.
      rows.push({ kind: "removed", line: i + 1, label: before.lines[i]!.beat, text: a[i]! });
      i++;
    } else {
      rows.push({ kind: "added", line: j + 1, label: after.lines[j]!.beat, text: b[j]! });
      j++;
    }
  }
  const added = rows.filter((r) => r.kind === "added").length;
  const removed = rows.length - added;
  return {
    rows: rows.slice(0, MAX_ROWS),
    added,
    removed,
    more: Math.max(0, rows.length - MAX_ROWS),
  };
}
