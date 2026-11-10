"use client";

import { useTransition } from "react";
import { setFeedFailureAction } from "@/app/(app)/_actions/shell";
import { Button } from "@/components/ui/button";

export function RetryFeedButton() {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() => start(() => setFeedFailureAction(false))}
    >
      {pending ? "Retrying…" : "Retry"}
    </Button>
  );
}
