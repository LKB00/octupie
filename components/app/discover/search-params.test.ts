import { describe, expect, it } from "vitest";
import { discoverHref, parseDiscoverParams } from "./search-params";

describe("discover search params", () => {
  it("falls back to defaults for missing or junk values", () => {
    expect(parseDiscoverParams({ window: "12", sort: "viral", tab: "x" })).toMatchObject({
      tab: "feed",
      sort: "breaking",
      window: 30,
      format: "all",
      minMultiple: 3,
    });
  });

  it("round-trips filters and drops defaults from the URL", () => {
    const p = parseDiscoverParams({ window: "7", pillar: "p2" });
    expect(discoverHref("/d", p, { sort: "newest" })).toBe("/d?sort=newest&window=7&pillar=p2");
    expect(discoverHref("/d", p, { window: "30", pillar: null })).toBe("/d");
  });
});
