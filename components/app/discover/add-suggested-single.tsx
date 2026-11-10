"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { addAccountAction } from "@/app/(app)/_actions/discover";
import { Button } from "@/components/ui/button";

export function AddSuggestedSingle({ handle }: { handle: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      aria-label={`Track @${handle}`}
      onClick={() =>
        start(async () => {
          const res = await addAccountAction(handle);
          if (res.ok) toast.success(`Now tracking @${handle}`);
          else toast.error(res.error);
        })
      }
    >
      Track
    </Button>
  );
}
