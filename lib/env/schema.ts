import { z } from "zod";

const optional = z
  .string()
  .optional()
  .transform((v) => (v === undefined || v.trim() === "" ? undefined : v.trim()));

const booleanFlag = (fallback: boolean) =>
  z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined || v.trim() === "") return fallback;
      return ["true", "1", "yes", "on"].includes(v.trim().toLowerCase());
    });

/** Every variable from .env.example. Secrets are optional here; see requireEnv. */
export const envSchema = z.object({
  MOCK_MODE: booleanFlag(true),

  NEXT_PUBLIC_SUPABASE_URL: optional.pipe(z.url().optional()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optional,
  SUPABASE_SERVICE_ROLE_KEY: optional,

  INNGEST_EVENT_KEY: optional,
  INNGEST_SIGNING_KEY: optional,

  INSTAGRAM_PROVIDER: z.enum(["mock", "apify", "meta"]).default("mock"),
  APIFY_TOKEN: optional,
  APIFY_REELS_ACTOR_ID: optional,
  APIFY_PROFILE_ACTOR_ID: optional,
  META_APP_ID: optional,
  META_APP_SECRET: optional,
  META_IG_USER_ID: optional,
  META_ACCESS_TOKEN: optional,

  ANTHROPIC_API_KEY: optional,
  CLAUDE_MODEL_SMART: z.string().default("claude-sonnet-5-5"),
  CLAUDE_MODEL_FAST: z.string().default("claude-haiku-5-5"),
  GEMINI_API_KEY: optional,
  GEMINI_VIDEO_MODEL: z.string().default("gemini-3.5-flash"),
  STT_PROVIDER: z.enum(["openai", "deepgram"]).default("openai"),
  OPENAI_API_KEY: optional,
  DEEPGRAM_API_KEY: optional,

  PADDLE_API_KEY: optional,
  PADDLE_WEBHOOK_SECRET: optional,
  PADDLE_PRICE_CREATOR_MONTHLY: optional,
  PADDLE_PRICE_PRO_MONTHLY: optional,

  RESEND_API_KEY: optional,

  OUTLIER_MIN_MULTIPLE: z.coerce.number().positive().default(3),
});

export type Env = z.output<typeof envSchema>;
export type EnvKey = keyof Env;

/** Empty strings from .env files count as "not set". */
function blankToUndefined(source: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(source).map(([k, v]) => [k, v === "" ? undefined : v]));
}

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(blankToUndefined(source));
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment variables:\n${issues}\nSee .env.example.`);
  }
  return result.data;
}

/**
 * Read a variable that a real (non-mock) service needs. In mock mode a missing
 * value returns undefined so callers fall back to fixtures; otherwise it throws
 * a message naming the variable.
 */
export function requireEnvFrom<K extends EnvKey>(
  env: Env,
  key: K,
): NonNullable<Env[K]> | undefined {
  const value = env[key];
  if (value !== undefined && value !== null) return value as NonNullable<Env[K]>;
  if (env.MOCK_MODE) return undefined;
  throw new Error(
    `${key} is not set. Add it to .env.local, or set MOCK_MODE=true to use fixtures.`,
  );
}
