"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { toggleSaveAction } from "@/app/(app)/_actions/discover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppIcon } from "./icons";

/** Save / unsave with an optimistic update. "bar": plain bookmark on tiles; "labelled": a page action. */
export function SaveButton({
  shortcode,
  saved,
  variant = "bar",
  className,
}: {
  shortcode: string;
  saved: boolean;
  variant?: "bar" | "labelled" | "overlay";
  className?: string;
}) {
  const [, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(saved);
  const onClick = () =>
    start(async () => {
      setOptimistic(!optimistic);
      const res = await toggleSaveAction(shortcode);
      if (!res.ok) toast.error("Couldn't update Saved. Try again.");
      else toast.success(res.saved ? "Saved. Find it in Discover → Saved." : "Removed from Saved");
    });
  const icon = (
    <AppIcon.save
      aria-hidden="true"
      weight={optimistic ? "fill" : "regular"}
      className={variant === "labelled" ? "size-4" : "size-[18px]"}
    />
  );
  if (variant === "labelled") {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={onClick}
        aria-pressed={optimistic}
        className={className}
      >
        {icon}
        <span className="max-sm:sr-only">{optimistic ? "Saved" : "Save"}</span>
      </Button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={optimistic}
      aria-label={optimistic ? "Remove from Saved" : "Save reel"}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
        variant === "overlay"
          ? "text-on-media hover:bg-scrim"
          : "text-muted hover:bg-surface-2 hover:text-text",
        optimistic && variant === "bar" && "text-text",
        className,
      )}
    >
      {icon}
    </button>
  );
}
