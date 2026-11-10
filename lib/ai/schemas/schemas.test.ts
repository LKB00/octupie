import { describe, expect, it } from "vitest";
import { fixtures } from "@/lib/data/fixtures";
import { breakdownSchema, scriptContentSchema } from ".";

describe("AI schemas against fixture outputs", () => {
  it("accepts the fixture breakdown", () => {
    expect(breakdownSchema.safeParse(fixtures.breakdowns[0]?.breakdown).success).toBe(true);
  });

  it("accepts the fixture script", () => {
    expect(scriptContentSchema.safeParse(fixtures.scripts[0]?.content).success).toBe(true);
  });

  it("rejects a breakdown without exactly three reasons", () => {
    const bad = { ...fixtures.breakdowns[0]!.breakdown, whyItWorked: [] };
    expect(breakdownSchema.safeParse(bad).success).toBe(false);
  });
});
