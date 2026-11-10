import "server-only";
import { isMockMode } from "@/lib/env";
import type { IgReel } from "@/lib/data/instagram-provider";
import { mockAnglePreviews } from "./mock/angles";
import { mockBreakdown } from "./mock/breakdown";
import { mockScript } from "./mock/script";
import { mockStudioReply } from "./mock/studio";
import { generateValidated } from "./run";
import {
  anglePreviewsSchema,
  breakdownSchema,
  scriptSchema,
  studioReplySchema,
  type Breakdown,
  type ScriptAngle,
  type ScriptContent,
  type VoiceMode,
} from "./schemas";

/**
 * The only entry point for AI work. Mock mode returns canned output (still Zod-validated);
 * the Claude and Gemini clients replace these bodies in Milestone 6.
 */
function requireMock(step: string): void {
  if (!isMockMode())
    throw new Error(`${step} needs the real AI clients (Milestone 6). Set MOCK_MODE=true.`);
}

export async function aiBreakdown(reel: IgReel) {
  requireMock("Breakdown");
  return generateValidated(breakdownSchema, async () => mockBreakdown(reel).breakdown);
}

export async function aiAnglePreviews(breakdown: Breakdown, pillarName: string) {
  requireMock("Angle previews");
  return generateValidated(anglePreviewsSchema, async () =>
    mockAnglePreviews(breakdown, pillarName),
  );
}

export async function aiScript(input: {
  angle: ScriptAngle;
  voiceMode: VoiceMode;
  pillar: string | null;
  breakdown?: Breakdown | null;
  idea?: string | null;
}) {
  requireMock("Script");
  return generateValidated(scriptSchema, async () => mockScript(input));
}

export async function aiStudioEdit(message: string, script: ScriptContent) {
  requireMock("Studio edit");
  return generateValidated(studioReplySchema, async () => mockStudioReply(message, script));
}

export { AiOutputError } from "./run";
