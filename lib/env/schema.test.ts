import { describe, expect, it } from "vitest";
import { parseEnv, requireEnvFrom } from "./schema";

describe("parseEnv", () => {
  it("defaults to mock mode with an empty environment", () => {
    const env = parseEnv({});
    expect(env.MOCK_MODE).toBe(true);
    expect(env.INSTAGRAM_PROVIDER).toBe("mock");
    expect(env.OUTLIER_MIN_MULTIPLE).toBe(3);
    expect(env.CLAUDE_MODEL_SMART).toBe("claude-sonnet-5-5");
  });

  it.each([
    ["false", false],
    ["0", false],
    ["true", true],
    ["TRUE", true],
    ["", true],
  ])("reads MOCK_MODE=%j as %s", (raw, expected) => {
    expect(parseEnv({ MOCK_MODE: raw }).MOCK_MODE).toBe(expected);
  });

  it("treats blank values as unset", () => {
    const env = parseEnv({ ANTHROPIC_API_KEY: "", INSTAGRAM_PROVIDER: "" });
    expect(env.ANTHROPIC_API_KEY).toBeUndefined();
    expect(env.INSTAGRAM_PROVIDER).toBe("mock");
  });

  it("coerces OUTLIER_MIN_MULTIPLE to a number", () => {
    expect(parseEnv({ OUTLIER_MIN_MULTIPLE: "2.5" }).OUTLIER_MIN_MULTIPLE).toBe(2.5);
  });

  it("rejects an unknown provider with a readable message", () => {
    expect(() => parseEnv({ INSTAGRAM_PROVIDER: "tiktok" })).toThrow(/INSTAGRAM_PROVIDER/);
  });

  it("rejects a malformed Supabase URL", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_SUPABASE_URL: "not a url" })).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL/,
    );
  });
});

describe("requireEnvFrom", () => {
  it("returns undefined for a missing key in mock mode", () => {
    expect(requireEnvFrom(parseEnv({ MOCK_MODE: "true" }), "ANTHROPIC_API_KEY")).toBeUndefined();
  });

  it("throws naming the key when mock mode is off", () => {
    expect(() => requireEnvFrom(parseEnv({ MOCK_MODE: "false" }), "ANTHROPIC_API_KEY")).toThrow(
      /ANTHROPIC_API_KEY is not set/,
    );
  });

  it("returns the value when it is set", () => {
    const env = parseEnv({ MOCK_MODE: "false", ANTHROPIC_API_KEY: "sk-test" });
    expect(requireEnvFrom(env, "ANTHROPIC_API_KEY")).toBe("sk-test");
  });
});
