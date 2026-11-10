"use client";

import { useTransition } from "react";
import { X as XIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { removeAccountAction } from "@/app/(app)/_actions/discover";
import { Button } from "@/components/ui/button";

export function RemoveAccountButton({ handle }: { handle: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={pending}
      aria-label={`Stop tracking @${handle}`}
      onClick={() =>
        start(async () => {
          await removeAccountAction(handle);
          toast.success(`Stopped tracking @${handle}`);
        })
      }
    >
      <XIcon />
    </Button>
  );
}
