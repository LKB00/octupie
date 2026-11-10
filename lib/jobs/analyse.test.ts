import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { resetStore, store } = await import("@/lib/db/mock-store");
const { startAnalyse } = await import("./analyse");
const { QuotaExceededError } = await import("@/lib/quota");

describe("reel/analyse quota", () => {
  beforeEach(() => resetStore());

  it("refuses a new breakdown on the server once the plan limit is used", () => {
    const s = store();
    while (s.usage.filter((u) => u.kind === "breakdown").length < 5) {
      s.usage.push({ kind: "breakdown", createdAt: "2026-11-09T08:00:00.000Z" });
    }
    expect(() => startAnalyse("8ET-BrF2SFp")).toThrow(QuotaExceededError);
  });

  it("lets anyone open a breakdown that's already cached, for free", () => {
    const s = store();
    while (s.usage.filter((u) => u.kind === "breakdown").length < 5) {
      s.usage.push({ kind: "breakdown", createdAt: "2026-11-09T08:00:00.000Z" });
    }
    expect(startAnalyse("wxrJbYD4JAE")).toMatchObject({ free: true });
  });
});
