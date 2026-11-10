"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  Check as CheckIcon,
  CircleNotch as LoaderCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { AppIcon } from "../icons";
import { toast } from "sonner";
import { startBreakdownAction } from "@/app/(app)/_actions/reel";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { cn } from "@/lib/utils";
import { ErrorState, UpgradeCard } from "../states";

const STEPS = ["Watching the video", "Reading the transcript", "Writing the breakdown"];

type JobStatus = {
  status: "running" | "done" | "failed";
  step: number;
  error?: string;
  remaining?: string;
};

/** "Break it down · uses 1 breakdown" with progress, result toast and the limit card. */
export function BreakdownRunner({
  shortcode,
  atLimit,
  own,
}: {
  shortcode: string;
  atLimit: boolean;
  own: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [job, setJob] = useState<{ id: string; status: JobStatus } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(atLimit);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const poll = (id: string) => {
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
      if (!res.ok) {
        setError("We lost track of that breakdown. Try again.");
        setJob(null);
        return;
      }
      const status = (await res.json()) as JobStatus;
      setJob({ id, status });
      if (status.status === "running") return poll(id);
      if (status.status === "done") {
        toast.success(`Breakdown ready · ${status.remaining}`);
        startTransition(() => router.refresh());
      } else {
        setError(status.error ?? "The breakdown didn't finish.");
        setJob(null);
      }
    }, 600);
  };

  const start = async () => {
    setError(null);
    const res = await startBreakdownAction(shortcode);
    if (!res.ok) {
      if (res.reason === "quota") setLimit(true);
      else setError(res.message);
      return;
    }
    setJob({ id: res.jobId, status: { status: "running", step: 0 } });
    poll(res.jobId);
  };

  if (limit) return <UpgradeCard what="breakdowns" />;

  return (
    <section
      aria-labelledby="get-breakdown"
      className="relative overflow-hidden rounded-xl border border-border bg-surface"
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start gap-3">
          <IconTile tone="violet" size="lg">
            <AppIcon.breakdown />
          </IconTile>
          <div className="flex flex-col gap-1">
            <h2 id="get-breakdown" className="type-section">
              {own ? "How did this do, and why?" : "Get the breakdown"}
            </h2>
            <p className="type-body-sm text-muted">
              Hook scores, structure, why it worked and what to borrow. Takes about 20 seconds.
            </p>
          </div>
        </div>
        {job ? (
          <ol aria-live="polite" className="flex flex-col gap-2 rounded-lg bg-surface-2 p-4">
            {STEPS.map((s, i) => {
              const done = job.status.status === "done" || i < job.status.step;
              const active = !done && i === job.status.step;
              return (
                <li
                  key={s}
                  className={cn(
                    "flex items-center gap-2.5 type-body-sm",
                    !done && !active && "text-faint",
                  )}
                >
                  {done ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-success-bg">
                      <CheckIcon aria-hidden="true" className="size-3.5 text-success" />
                    </span>
                  ) : active ? (
                    <LoaderCircleIcon
                      aria-hidden="true"
                      className="size-5 animate-spin text-brand"
                    />
                  ) : (
                    <span className="size-5 rounded-full border border-border-strong" />
                  )}
                  {s}
                  {active ? "…" : ""}
                </li>
              );
            })}
          </ol>
        ) : (
          <>
            {error ? <ErrorState title={error} /> : null}
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={start} cost="uses 1 breakdown">
                {own ? "How did this do?" : "Break it down"}
              </Button>
              <span className="type-caption text-muted">
                Breakdowns someone already ran are free.
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
