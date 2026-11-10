import { AppIcon } from "../icons";

/** Placeholder brand mark: Lucide's fishing hook in a brand tile. Replace with your own logo. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex size-7 items-center justify-center rounded-sm bg-brand text-on-brand ${className ?? ""}`}
    >
      <AppIcon.logo className="size-4" strokeWidth={2.25} />
    </span>
  );
}
