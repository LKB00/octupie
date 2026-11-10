"use client";

import { useState } from "react";
import { Check as CheckIcon, Copy as CopyIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyButton({
  text,
  label = "Copy",
  size = "sm",
  compact = false,
}: {
  text: string;
  label?: string;
  size?: "sm" | "md";
  /** Hide the label on phones (icon only). */
  compact?: boolean;
}) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="secondary"
      size={size}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setDone(false), 1500);
        } catch {
          toast.error("Your browser blocked the clipboard. Select the text and copy it instead.");
        }
      }}
    >
      {done ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
      <span className={compact ? "max-sm:sr-only" : undefined}>{label}</span>
    </Button>
  );
}
