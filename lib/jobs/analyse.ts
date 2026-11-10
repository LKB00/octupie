import "server-only";
import { aiBreakdown } from "@/lib/ai";
import { mockBreakdown } from "@/lib/ai/mock/breakdown";
import { getMockProvider } from "@/lib/data";
import { nextId, store } from "@/lib/db/mock-store";
import { checkQuota, getUsage, recordUsage } from "@/lib/db/usage";
import { remainingLabel } from "@/lib/quota";

/**
 * reel/analyse. In mock mode the "job" is time-based: progress is derived from elapsed time
 * and the breakdown is written when it finishes (~3 s), so no background worker is needed.
 * The Inngest version (M4/M6) keeps the same start/status contract.
 */
export const ANALYSE_STEPS = [
  "Watching the video",
  "Reading the transcript",
  "Writing the breakdown",
] as const;
const STEP_MS = 1000;

export type JobStatus = {
  id: string;
  shortcode: string;
  status: "running" | "done" | "failed";
  step: number;
  error?: string;
  remaining?: string;
};

export function startAnalyse(shortcode: string): { jobId: string; free: boolean } {
  const s = store();
  const running = [...s.jobs.values()].find(
    (j) => j.shortcode === shortcode && j.status === "running",
  );
  if (running) return { jobId: running.id, free: false };
  const free = s.breakdowns.has(shortcode);
  if (!free) checkQuota("breakdown");
  const id = nextId("job");
  s.jobs.set(id, { id, shortcode, startedAt: Date.now(), status: free ? "done" : "running" });
  return { jobId: id, free };
}

export async function getJobStatus(id: string): Promise<JobStatus | null> {
  const s = store();
  const job = s.jobs.get(id);
  if (!job) return null;
  const elapsed = Date.now() - job.startedAt;
  if (job.status === "running" && elapsed >= STEP_MS * ANALYSE_STEPS.length) {
    try {
      const reel = await getMockProvider().getReel(job.shortcode);
      if (!reel) throw new Error("Reel not found");
      const { observation } = mockBreakdown(reel);
      const breakdown = await aiBreakdown(reel);
      if (!s.breakdowns.has(job.shortcode)) {
        s.breakdowns.set(job.shortcode, {
          breakdown,
          observation,
          createdAt: new Date().toISOString(),
        });
        recordUsage("breakdown");
      }
      job.status = "done";
    } catch (e) {
      job.status = "failed";
      job.error = e instanceof Error ? e.message : "Something went wrong.";
    }
  }
  return {
    id: job.id,
    shortcode: job.shortcode,
    status: job.status,
    step: Math.min(ANALYSE_STEPS.length - 1, Math.floor(elapsed / STEP_MS)),
    error: job.error,
    remaining: job.status === "done" ? remainingLabel(getUsage().breakdowns) : undefined,
  };
}
