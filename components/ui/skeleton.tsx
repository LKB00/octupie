import { cn } from "@/lib/utils";

/** surface-2 block with a 1.2s shimmer; static under prefers-reduced-motion. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "rounded-md bg-surface-2 bg-[linear-gradient(90deg,var(--surface-2)_0%,var(--surface)_50%,var(--surface-2)_100%)] bg-size-[200%_100%]",
        "animate-shimmer motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
