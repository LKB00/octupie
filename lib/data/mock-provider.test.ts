import { describe, expect, it } from "vitest";
import { computeBaseline, computeMultiple, roundMultiple } from "@/lib/outliers";
import { fixtures } from "./fixtures";
import { MockProvider } from "./mock-provider";

const NOW = new Date(fixtures.now);
const provider = new MockProvider(NOW);

describe("MockProvider", () => {
  it("recomputes every tracked account's usual views from its reels to match the fixtures", async () => {
    for (const account of fixtures.trackedAccounts) {
      const reels = await provider.listReels(account.handle, { limit: 100 });
      const b = computeBaseline(reels, { at: NOW });
      expect(b.usualViews, account.handle).toBe(account.usualViews);
      expect(b.sampleSize, account.handle).toBe(account.usualSampleSize);
      expect(b.lowConfidence).toBe(account.usualLowConfidence);
    }
  });

  it("keeps the fixture multiples when the scored reel is excluded from its own baseline", async () => {
    for (const r of fixtures.reels) {
      const reels = await provider.listReels(r.ownerHandle, { limit: 100 });
      const b = computeBaseline(reels, { at: NOW, excludeShortcode: r.shortcode });
      const m = computeMultiple(r.views, b.usualViews);
      expect(roundMultiple(m!), r.shortcode).toBeCloseTo(r.multiple, 0);
    }
  });

  it("gives the creator's own reels a usual of exactly the fixture value", async () => {
    const reels = await provider.listReels(fixtures.creator.igHandle, { limit: 100 });
    expect(computeBaseline(reels, { at: NOW }).usualViews).toBe(fixtures.creator.usualViews);
  });

  it("returns null for unknown handles and flags private ones", async () => {
    expect(await provider.getProfile("@nobody.here")).toBeNull();
    expect((await provider.getProfile("private.account"))?.isPrivate).toBe(true);
  });

  it("is deterministic", async () => {
    const a = await new MockProvider(NOW).listReels("figmafridays", { limit: 50 });
    const b = await new MockProvider(NOW).listReels("figmafridays", { limit: 50 });
    expect(a).toEqual(b);
  });
});
