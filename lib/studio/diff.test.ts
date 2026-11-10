import { describe, expect, it } from "vitest";
import type { ScriptContent } from "@/lib/ai/schemas";
import { diffScript } from "./diff";

const base: ScriptContent = {
  title: "T",
  hooks: [
    { text: "h1", why: "" },
    { text: "h2", why: "" },
    { text: "h3", why: "" },
  ],
  selectedHook: 0,
  lines: ["a", "b", "c", "d"].map((text) => ({ text, cue: null, beat: "setup" as const })),
  cta: "",
  caption: "",
  hashtags: ["x", "y", "z"],
  estSeconds: 30,
  pillar: null,
};

describe("diffScript", () => {
  it("shows a changed line as removed then added, with its line number", () => {
    const next = { ...base, lines: base.lines.map((l, i) => (i === 2 ? { ...l, text: "C!" } : l)) };
    const d = diffScript(base, next);
    expect(d.rows.map((r) => `${r.kind}:${r.line}:${r.text}`)).toEqual([
      "removed:3:c",
      "added:3:C!",
    ]);
    expect([d.added, d.removed]).toEqual([1, 1]);
  });
  it("reports removed lines and hook changes", () => {
    const next = { ...base, selectedHook: 1, lines: base.lines.slice(0, 3) };
    const d = diffScript(base, next);
    expect(d.rows[0]).toMatchObject({ label: "Hook", kind: "removed", text: "h1" });
    expect(d.rows.at(-1)).toMatchObject({ kind: "removed", line: 4, text: "d" });
  });
  it("is empty when nothing changed", () => {
    expect(diffScript(base, base).rows).toEqual([]);
  });
});
