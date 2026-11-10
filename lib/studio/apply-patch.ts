import type { ScriptContent, StudioToolCall } from "@/lib/ai/schemas";

/** Apply one assistant reply's tool calls as a single change. Pure; returns a new object. */
export function applyToolCalls(
  script: ScriptContent,
  calls: readonly StudioToolCall[],
): ScriptContent {
  let next: ScriptContent = structuredClone(script);
  for (const call of calls) {
    switch (call.tool) {
      case "update_lines": {
        let lines = next.lines.map((line, i) => {
          const edit = call.edits.find((e) => e.index === i);
          if (!edit) return line;
          return {
            ...line,
            text: edit.text ?? line.text,
            cue: edit.cue === undefined ? line.cue : edit.cue,
          };
        });
        // Inserts refer to original indexes; apply from the end so earlier ones stay valid.
        for (const ins of [...call.inserts].sort((a, b) => b.after - a.after)) {
          lines.splice(ins.after + 1, 0, { text: ins.text, cue: ins.cue ?? null, beat: ins.beat });
        }
        const deleted = new Set(call.deletes);
        if (deleted.size) {
          const shift = (i: number) => i + call.inserts.filter((x) => x.after < i).length;
          const drop = new Set([...deleted].map(shift));
          lines = lines.filter((_, i) => !drop.has(i));
        }
        next = { ...next, lines };
        break;
      }
      case "set_hooks":
        next = { ...next, hooks: call.hooks };
        break;
      case "select_hook":
        next = { ...next, selectedHook: call.index };
        break;
      case "set_caption":
        next = { ...next, caption: call.caption, hashtags: call.hashtags };
        break;
      case "set_title":
        next = { ...next, title: call.title };
        break;
    }
  }
  const cta = next.lines.findLast((l) => l.beat === "cta");
  const words = next.lines.reduce((n, l) => n + l.text.split(/\s+/).filter(Boolean).length, 0);
  return { ...next, cta: cta?.text ?? next.cta, estSeconds: Math.max(10, Math.round(words / 2.5)) };
}

/** Short human summary of what changed, for the diff card. */
export function describeChange(before: ScriptContent, after: ScriptContent): string {
  const changed: string[] = [];
  if (before.title !== after.title) changed.push("title");
  if (
    before.selectedHook !== after.selectedHook ||
    JSON.stringify(before.hooks) !== JSON.stringify(after.hooks)
  )
    changed.push("hooks");
  if (before.caption !== after.caption) changed.push("caption");
  const lineChanges = after.lines.length - before.lines.length;
  if (lineChanges > 0) changed.push(`added ${lineChanges} line${lineChanges > 1 ? "s" : ""}`);
  if (lineChanges < 0) changed.push(`removed ${-lineChanges} line${lineChanges < -1 ? "s" : ""}`);
  const edited = before.lines.filter(
    (l, i) => after.lines[i] && after.lines[i]!.text !== l.text,
  ).length;
  if (lineChanges === 0 && edited)
    changed.push(
      edited === 1
        ? `changed line ${before.lines.findIndex((l, i) => after.lines[i]!.text !== l.text) + 1}`
        : `changed ${edited} lines`,
    );
  if (!changed.length) return "No changes";
  const s = changed.join(", ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
