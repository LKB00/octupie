"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { addSuggestedAccountsAction } from "@/app/(app)/_actions/discover";
import { Button } from "@/components/ui/button";

export function AddSuggestedButton({
  count = 5,
  variant = "secondary",
}: {
  count?: number;
  variant?: "primary" | "secondary" | "ghost" | "link";
}) {
  const [pending, start] = useTransition();
  const run = () =>
    start(async () => {
      const res = await addSuggestedAccountsAction(count);
      if (res.added) toast.success(`Now tracking ${res.added} more accounts`);
      if (res.error) toast.warning(res.error);
      else if (!res.added) toast.info("No more suggestions right now.");
    });
  if (variant === "link") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={run}
        className="type-body-sm font-medium text-brand-strong underline-offset-4 hover:underline disabled:opacity-50"
      >
        {pending ? "Adding…" : `Add ${count} suggested accounts`}
      </button>
    );
  }
  return (
    <Button
      variant={variant}
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await addSuggestedAccountsAction(count);
          if (res.added) toast.success(`Now tracking ${res.added} more accounts`);
          if (res.error) toast.warning(res.error);
          else if (!res.added) toast.info("No more suggestions right now.");
        })
      }
    >
      {pending ? "Adding…" : `Add ${count} suggested accounts`}
    </Button>
  );
}
