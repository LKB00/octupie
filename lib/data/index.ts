import { now } from "@/lib/clock";
import { parseEnv } from "@/lib/env/schema";
import type { InstagramProvider } from "./instagram-provider";
import { MockProvider } from "./mock-provider";

export * from "./instagram-provider";
export { HANDLE_PATTERN, MockProvider, normaliseHandle } from "./mock-provider";

const globalForProvider = globalThis as unknown as { __octupieProvider?: MockProvider };

/** The configured InstagramProvider. Apify and Meta implementations arrive in M7. */
export function getInstagramProvider(): InstagramProvider & Partial<MockProvider> {
  const env = parseEnv(process.env);
  if (env.MOCK_MODE || env.INSTAGRAM_PROVIDER === "mock") {
    globalForProvider.__octupieProvider ??= new MockProvider(now());
    return globalForProvider.__octupieProvider;
  }
  throw new Error(
    `INSTAGRAM_PROVIDER=${env.INSTAGRAM_PROVIDER} isn't implemented yet (Milestone 7). Set MOCK_MODE=true.`,
  );
}

/** Mock provider with its extra helpers; only valid in mock mode. */
export function getMockProvider(): MockProvider {
  globalForProvider.__octupieProvider ??= new MockProvider(now());
  return globalForProvider.__octupieProvider;
}
