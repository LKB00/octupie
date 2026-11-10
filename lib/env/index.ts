import "server-only";
import { parseEnv, requireEnvFrom, type Env, type EnvKey } from "./schema";

let cached: Env | undefined;

/** Validated server environment. Parsed once per process. */
export function env(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}

/** True when every external service should read from fixtures/ instead. */
export function isMockMode(): boolean {
  return env().MOCK_MODE;
}

/** See requireEnvFrom: throws for a missing key unless MOCK_MODE is on. */
export function requireEnv<K extends EnvKey>(key: K) {
  return requireEnvFrom(env(), key);
}

export type { Env, EnvKey };
