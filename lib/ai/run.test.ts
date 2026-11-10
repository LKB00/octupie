import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { AiOutputError, generateValidated } from "./run";

const schema = z.object({ ok: z.literal(true) });

describe("generateValidated", () => {
  it("retries once with the validation error, then succeeds", async () => {
    const produce = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true });
    await expect(generateValidated(schema, produce)).resolves.toEqual({ ok: true });
    expect(produce).toHaveBeenCalledTimes(2);
    expect(produce.mock.calls[1]![0]).toMatch(/didn't match the schema/);
  });

  it("fails with a friendly error after the retry", async () => {
    const produce = vi.fn().mockResolvedValue("raw text");
    await expect(generateValidated(schema, produce)).rejects.toBeInstanceOf(AiOutputError);
    expect(produce).toHaveBeenCalledTimes(2);
  });
});
