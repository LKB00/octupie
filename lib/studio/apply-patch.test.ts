import { describe, expect, it } from "vitest";
import { mockStudioReply, QUICK_CHIPS } from "@/lib/ai/mock/studio";
import { scriptContentSchema, studioReplySchema } from "@/lib/ai/schemas";
import { fixtures } from "@/lib/data/fixtures";
import { applyToolCalls, describeChange } from "./apply-patch";

const script = fixtures.scripts[0]!.content;

describe("applyToolCalls", () => {
  it("applies edits, inserts and deletes against original indexes", () => {
    const next = applyToolCalls(script, [
      {
        tool: "update_lines",
        edits: [{ index: 1, text: "Edited." }],
        inserts: [{ after: 0, text: "Inserted.", cue: null, beat: "setup" }],
        deletes: [2],
      },
    ]);
    expect(next.lines.map((l) => l.text).slice(0, 3)).toEqual([
      script.lines[0]!.text,
      "Inserted.",
      "Edited.",
    ]);
    expect(next.lines).toHaveLength(script.lines.length);
    expect(next.lines.some((l) => l.text === script.lines[2]!.text)).toBe(false);
  });

  it("does not mutate the input", () => {
    const copy = structuredClone(script);
    applyToolCalls(script, [{ tool: "set_title", title: "New" }]);
    expect(script).toEqual(copy);
  });

  it("keeps every quick chip's result valid", () => {
    for (const chip of QUICK_CHIPS) {
      const reply = studioReplySchema.parse(mockStudioReply(chip, script));
      const next = applyToolCalls(script, reply.calls);
      expect(scriptContentSchema.safeParse(next).success, chip).toBe(true);
      expect(describeChange(script, next), chip).not.toBe("No changes");
    }
  });

  it("replies without editing when the creator is just chatting", () => {
    for (const msg of [
      "hi",
      "Hello!",
      "thanks",
      "what can you do?",
      "how long is it?",
      "asdf qwerty",
    ]) {
      const reply = studioReplySchema.parse(mockStudioReply(msg, script));
      expect(reply.calls, msg).toHaveLength(0);
      expect(reply.message.length, msg).toBeGreaterThan(10);
    }
  });

  it("edits a specific line when asked", () => {
    const reply = studioReplySchema.parse(mockStudioReply("make line 3 punchier", script));
    const next = applyToolCalls(script, reply.calls);
    expect(next.lines[2]!.text).not.toBe(script.lines[2]!.text);
    expect(next.lines[0]!.text).toBe(script.lines[0]!.text);
  });
});
