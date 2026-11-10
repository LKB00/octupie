import { Question as CircleHelpIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  title: React.ReactNode;
  help?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
  className?: string;
};

/** Page title with a (?) popover that explains the page in 2 sentences. */
export function PageHeader({ title, help, description, actions, eyebrow, className }: Props) {
  return (
    <header
      className={cn("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", className)}
    >
      <div className="flex min-w-0 flex-col gap-1">
        {eyebrow ? <div className="type-caption font-medium text-muted">{eyebrow}</div> : null}
        <div className="flex items-center gap-1">
          <h1 className="min-w-0 truncate type-title">{title}</h1>
          {help ? (
            <PageHelp title={typeof title === "string" ? title : "This page"} text={help} />
          ) : null}
        </div>
        {description ? <div className="type-body-sm text-muted">{description}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function PageHelp({ title, text }: { title: string; text: string }) {
  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={`About ${title}`} />}
      >
        <CircleHelpIcon />
      </PopoverTrigger>
      <PopoverContent align="start">
        <PopoverTitle className="mb-1 type-card-title">{title}</PopoverTitle>
        <p className="type-body-sm text-muted">{text}</p>
      </PopoverContent>
    </Popover>
  );
}

/** Link-based segmented tabs (state lives in the URL). */
export function LinkTabs({
  label,
  items,
}: {
  label: string;
  items: { href: string; label: React.ReactNode; active: boolean }[];
}) {
  return (
    <nav
      aria-label={label}
      className="inline-flex items-center gap-0.5 self-start rounded-[10px] bg-surface-3 p-0.5"
    >
      {items.map((t) => (
        <a
          key={t.href}
          href={t.href}
          aria-current={t.active ? "page" : undefined}
          className={cn(
            "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-sm px-3 type-label whitespace-nowrap text-muted transition-colors hover:text-text",
            t.active && "bg-surface text-text shadow-selected",
          )}
        >
          {t.label}
        </a>
      ))}
    </nav>
  );
}
