import { IconTile } from "@/components/ui/icon-tile";
import { cn } from "@/lib/utils";

type Tone = "violet" | "amber" | "sky" | "rose" | "mint" | "neutral";
type IconType = React.ComponentType<{ className?: string }>;

/**
 * Hierarchy (docs/04 §3): page title (type-title) → section header (type-section) →
 * card title (type-card-title) → body → caption. Use these two components instead of
 * hand-rolled headings so every page reads the same way.
 */
export function SectionHeader({
  title,
  description,
  action,
  id,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 id={id} className="type-section">
          {title}
        </h2>
        {description ? <p className="mt-0.5 type-body-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  tone = "neutral",
  action,
  children,
  className,
  bodyClassName,
  highlight = false,
  ...rest
}: {
  title: string;
  description?: string;
  icon?: IconType;
  tone?: Tone;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  highlight?: boolean;
} & Omit<React.ComponentProps<"section">, "title">) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-xl border p-5",
        highlight ? "border-brand/20 bg-(image:--wash-violet)" : "border-border bg-surface",
        className,
      )}
      {...rest}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {Icon ? (
            <IconTile tone={tone} size="sm">
              <Icon />
            </IconTile>
          ) : null}
          <div className="min-w-0">
            <h3 className="type-card-title">{title}</h3>
            {description ? <p className="type-caption text-muted">{description}</p> : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn("min-w-0", bodyClassName)}>{children}</div>
    </section>
  );
}
