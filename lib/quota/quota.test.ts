import { describe, expect, it } from "vitest";
import {
  QuotaExceededError,
  crossedWarning,
  assertWithinQuota,
  costLabel,
  meter,
  periodBounds,
  remainingLabel,
} from ".";

describe("quota", () => {
  it("computes remaining and limit state", () => {
    expect(meter(2, 5)).toEqual({ used: 2, limit: 5, remaining: 3, atLimit: false });
    expect(meter(5, 5).atLimit).toBe(true);
    expect(meter(9, null)).toMatchObject({ remaining: null, atLimit: false });
  });

  it("blocks the action that would go over the limit", () => {
    expect(() => assertWithinQuota("breakdown", 4, "free")).not.toThrow();
    expect(() => assertWithinQuota("breakdown", 5, "free")).toThrow(QuotaExceededError);
    expect(() => assertWithinQuota("script", 500, "pro")).not.toThrow();
  });

  it("writes cost and remaining copy", () => {
    expect(costLabel("breakdown")).toBe("uses 1 breakdown");
    expect(costLabel("script", 2)).toBe("uses 2 scripts");
    expect(remainingLabel(meter(2, 5))).toBe("3 left this month");
  });

  it("anchors the period on the start day", () => {
    const { start, end } = periodBounds(
      new Date("2026-08-15T00:00:00Z"),
      new Date("2026-11-09T09:00:00Z"),
    );
    expect(start.toISOString()).toBe("2026-10-15T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-11-15T00:00:00.000Z");
  });
});

describe("crossedWarning", () => {
  it("fires once, on the use that reaches 80%", () => {
    expect(crossedWarning(3, 4, 5)).toBe(true);
    expect(crossedWarning(4, 5, 5)).toBe(false);
    expect(crossedWarning(2, 3, 5)).toBe(false);
  });
  it("never fires for unlimited plans", () => {
    expect(crossedWarning(100, 101, null)).toBe(false);
  });
});
