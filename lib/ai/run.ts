import type { z } from "zod";

export class AiOutputError extends Error {
  constructor(message = "We couldn't produce a usable result this time. Try again in a moment.") {
    super(message);
    this.name = "AiOutputError";
  }
}

/**
 * CLAUDE.md rule 4: validate AI output with Zod; on failure retry once with the validation
 * error appended, then fail with a friendly error. Never return unvalidated text.
 */
export async function generateValidated<S extends z.ZodType>(
  schema: S,
  produce: (feedback?: string) => Promise<unknown>,
): Promise<z.output<S>> {
  const first = schema.safeParse(await produce());
  if (first.success) return first.data;
  const feedback = `Your last reply didn't match the schema: ${first.error.message}. Return only valid JSON.`;
  const second = schema.safeParse(await produce(feedback));
  if (second.success) return second.data;
  throw new AiOutputError();
}
