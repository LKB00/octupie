import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Native select styled with tokens: keyboard and screen-reader behaviour for free. */
function NativeSelect({
  className,
  size = "md",
  icon,
  children,
  ...props
}: Omit<React.ComponentProps<"select">, "size"> & { size?: "sm" | "md"; icon?: React.ReactNode }) {
  return (
    <span className={cn("relative inline-flex", className)}>
      {icon ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted [&_svg]:size-4"
        >
          {icon}
        </span>
      ) : null}
      <select
        className={cn(
          "w-full cursor-pointer appearance-none border border-border bg-surface pr-8 text-text",
          "transition-colors hover:border-border-strong hover:bg-surface-2 focus-visible:border-brand",
          size === "sm" ? "h-8 rounded-sm type-label" : "h-10 rounded-[10px] type-body-sm",
          icon ? "pl-8" : "pl-3",
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted"
      />
    </span>
  );
}

export { NativeSelect };
