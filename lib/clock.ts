import { fixtures } from "@/lib/data/fixtures";
import { parseEnv } from "@/lib/env/schema";

const mock = parseEnv(process.env).MOCK_MODE;

/**
 * "Now" for the app. In mock mode it's pinned to the fixture's timestamp so ages, recency
 * and the Breaking now order stay the same on every run.
 */
export function now(): Date {
  return mock ? new Date(fixtures.now) : new Date();
}
