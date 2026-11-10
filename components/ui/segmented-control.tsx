"use client";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: React.ReactNode };

type SegmentedControlProps<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onValueChange: (value: T) => void;
  "aria-label": string;
  className?: string;
  size?: "sm" | "md";
};

/** Pick exactly one option. Arrow keys move between options. */
function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  className,
  size = "md",
  ...rest
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroup
      data-slot="segmented-control"
      value={[value]}
      onValueChange={(next) => {
        // A segmented control always has one value; ignore attempts to deselect.
        const picked = next[0] as T | undefined;
        if (picked) onValueChange(picked);
      }}
      aria-label={rest["aria-label"]}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-[10px] bg-surface-3 p-0.5",
        className,
      )}
    >
      {options.map((option) => (
        <Toggle
          key={option.value}
          value={option.value}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-sm px-3 type-label whitespace-nowrap text-muted",
            size === "sm" ? "h-7" : "h-8",
            "transition-[color,background-color,box-shadow] duration-150 ease-out hover:text-text",
            "data-pressed:bg-surface data-pressed:text-text data-pressed:shadow-selected",
          )}
        >
          {option.label}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}

export { SegmentedControl, type SegmentedControlProps };
