import Link from "next/link";
import { cn } from "@/lib/utils";
import { discoverHref, type DiscoverParams, type DiscoverTab } from "./search-params";

/** Feed · Saved · Creator map as a quiet underline tab bar (state lives in the URL). */
export function DiscoverTabs({
  base,
  params,
  savedCount,
}: {
  base: string;
  params: DiscoverParams;
  savedCount: number;
}) {
  const tabs: { id: DiscoverTab; label: string; count?: number }[] = [
    { id: "feed", label: "Feed" },
    { id: "saved", label: "Saved", count: savedCount },
    { id: "map", label: "Creator map" },
  ];
  return (
    <nav
      aria-label="Discover views"
      className="-mx-1 flex gap-6 overflow-x-auto border-b border-border px-1"
    >
      {tabs.map((t) => {
        const active = params.tab === t.id;
        return (
          <Link
            key={t.id}
            href={discoverHref(base, params, { tab: t.id })}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px inline-flex h-10 shrink-0 items-center gap-1.5 border-b-2 type-label whitespace-nowrap transition-colors",
              active ? "border-text text-text" : "border-transparent text-muted hover:text-text",
            )}
          >
            {t.label}
            {t.count !== undefined ? (
              <span
                className={cn(
                  "rounded-full px-1.5 type-caption",
                  active ? "bg-edge text-bg" : "bg-surface-3 text-muted",
                )}
              >
                {t.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
