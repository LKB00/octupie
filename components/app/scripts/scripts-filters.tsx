"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { MagnifyingGlass as SearchIcon } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { SCRIPT_STATUSES, SCRIPT_STATUS_LABEL, type ScriptStatus } from "@/lib/ai/schemas";
import type { Pillar } from "@/lib/db/types";
import { cn } from "@/lib/utils";

/** Status tabs with counts, search by title, pillar filter; all in the URL. */
export function ScriptsFilters({
  pillars,
  counts,
  total,
}: {
  pillars: Pillar[];
  counts: Record<ScriptStatus, number>;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const status = sp.get("status") ?? "";
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    start(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };
  const tabs = [
    { id: "", label: "All", n: total },
    ...SCRIPT_STATUSES.map((s) => ({ id: s, label: SCRIPT_STATUS_LABEL[s], n: counts[s] })),
  ];
  return (
    // One row when the page is wide enough (container ≥ 896px); otherwise status on top and a
    // full-width search row below, never a half-empty second row.
    <div className="@container">
      <div
        aria-busy={pending}
        className="flex flex-col gap-3 @4xl:flex-row @4xl:items-center @4xl:justify-between"
      >
        <div
          role="tablist"
          aria-label="Status"
          className="-mx-1 flex min-w-0 [scrollbar-width:none] gap-1 overflow-x-auto px-1"
        >
          {tabs.map((t) => {
            const active = status === t.id;
            return (
              <button
                key={t.id || "all"}
                role="tab"
                aria-selected={active}
                onClick={() => set("status", t.id)}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-sm px-3 type-label transition-colors",
                  active ? "bg-edge text-bg" : "text-muted hover:bg-surface-2 hover:text-text",
                )}
              >
                {t.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 type-caption",
                    active ? "bg-bg/20" : "bg-surface-3",
                  )}
                >
                  {t.n}
                </span>
              </button>
            );
          })}
        </div>
        <div
          role="search"
          className="flex w-full min-w-0 items-center gap-2 @4xl:w-auto @4xl:shrink-0"
        >
          <div className="relative min-w-0 flex-1 @4xl:w-56 @4xl:flex-none">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            />
            <Input
              type="search"
              aria-label="Search scripts by title"
              placeholder="Search by title"
              defaultValue={sp.get("q") ?? ""}
              onChange={(e) => set("q", e.target.value)}
              className="h-9 pl-9"
            />
          </div>
          <NativeSelect
            size="sm"
            aria-label="Pillar"
            value={sp.get("pillar") ?? ""}
            onChange={(e) => set("pillar", e.target.value)}
            className="w-44 min-w-0 shrink-0 max-sm:w-[42%]"
          >
            <option value="">All pillars</option>
            {pillars.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
    </div>
  );
}
