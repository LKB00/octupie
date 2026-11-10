import { describe, expect, it } from "vitest";
import { compactNumber, fullNumber, igCount, relativeDate, shortAge } from ".";

const NOW = new Date("2026-11-09T09:00:00Z");

describe("compactNumber", () => {
  it.each([
    [950, "950"],
    [31_000, "31K"],
    [4_700, "4.7K"],
    [1_400_000, "1.4M"],
    [193_656, "194K"],
  ])("%d → %s", (n, s) => expect(compactNumber(n)).toBe(s));
});

describe("relativeDate", () => {
  it("is relative under 7 days and a short date after", () => {
    expect(relativeDate("2026-11-06T09:00:00Z", NOW)).toBe("3 days ago");
    expect(relativeDate("2026-11-09T06:00:00Z", NOW)).toBe("3 hours ago");
    expect(relativeDate("2026-10-15T09:00:00Z", NOW)).toBe("15 Oct");
  });
});

describe("shortAge", () => {
  it("uses Instagram's compact units", () => {
    expect(shortAge("2026-11-09T08:55:00Z", NOW)).toBe("5m");
    expect(shortAge("2026-11-08T20:00:00Z", NOW)).toBe("13h");
    expect(shortAge("2026-11-06T09:00:00Z", NOW)).toBe("3d");
    expect(shortAge("2026-10-15T09:00:00Z", NOW)).toBe("15 Oct");
  });
});

describe("Instagram counts", () => {
  it("uses separators under 10K and compact above", () => {
    expect(igCount(8817)).toBe("8,817");
    expect(igCount(44100)).toBe("44.1K");
    expect(fullNumber(193656)).toBe("193,656");
  });
});
