"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { resetDemoAction, setFeedFailureAction } from "@/app/(app)/_actions/shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

/** Mock-mode tools for trying the prototype's states. */
export function DemoControls({ feedFails }: { feedFails: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p id="fail-label" className="type-body-sm font-medium">
            Simulate a feed error
          </p>
          <p className="type-caption text-muted">Shows Discover&apos;s error state with Retry.</p>
        </div>
        <Switch
          aria-labelledby="fail-label"
          checked={feedFails}
          onCheckedChange={(v) => start(() => setFeedFailureAction(v))}
        />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="type-body-sm font-medium">Reset demo data</p>
          <p className="type-caption text-muted">
            Puts accounts, saves, scripts and usage back to the fixtures.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await resetDemoAction();
              toast.success("Demo data reset");
            })
          }
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
