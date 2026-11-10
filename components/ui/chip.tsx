"use client";

import * as React from "react";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cn } from "@/lib/utils";

const chipBase =
  "type-label inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 whitespace-nowrap text-muted [&_svg]:size-3.5";

/** Static pill label. */
function Chip({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="chip" className={cn(chipBase, className)} {...props} />;
}

/** Pill that toggles on and off. Pressed: brand-weak fill, brand-strong text. */
function SelectableChip({ className, ...props }: TogglePrimitive.Props) {
  return (
    <TogglePrimitive
      data-slot="chip"
      className={cn(
        chipBase,
        "cursor-pointer bg-surface text-text transition-colors duration-150 ease-out hover:border-border-strong hover:bg-surface-2",
        "data-pressed:border-transparent data-pressed:bg-brand-weak data-pressed:text-brand-strong",
        "disabled:pointer-events-none disabled:opacity-45",
        className,
      )}
      {...props}
    />
  );
}

export { Chip, SelectableChip };
