"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import {
  ArrowBendDownLeft as CornerDownLeftIcon,
  MagnifyingGlass as SearchIcon,
} from "@phosphor-icons/react/dist/ssr";
import { AppIcon } from "../icons";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, navHref } from "./nav-items";

export type PaletteItem = {
  id: string;
  label: string;
  hint?: string;
  href: string;
  kind: "page" | "script" | "reel";
};

const KIND_LABEL = { page: "Go to", script: "Scripts", reel: "Outliers this month" } as const;

/** ⌘K: jump to a page, a script or an outlier. */
export function CommandPalette({ creatorId, items }: { creatorId: string; items: PaletteItem[] }) {
  const router = useRouter();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const all = useMemo<PaletteItem[]>(
    () => [
      ...NAV_ITEMS.map((n) => ({
        id: `p-${n.segment}`,
        label: n.label,
        href: navHref(creatorId, n.segment),
        kind: "page" as const,
      })),
      {
        id: "p-studio",
        label: "New script (Studio)",
        href: navHref(creatorId, "studio"),
        kind: "page" as const,
      },
      { id: "p-settings", label: "Settings", href: "/settings/profile", kind: "page" as const },
      ...items,
    ],
    [creatorId, items],
  );
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    const hits = t
      ? all.filter((i) => `${i.label} ${i.hint ?? ""}`.toLowerCase().includes(t))
      : all.filter((i) => i.kind !== "reel" || all.indexOf(i) < 14);
    return hits.slice(0, 12);
  }, [all, q]);

  const go = (item: PaletteItem | undefined) => {
    if (!item) return;
    setOpen(false);
    setQ("");
    router.push(item.href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-full max-w-sm items-center gap-2 rounded-[10px] border border-border bg-surface-2 px-3 type-body-sm text-faint transition-colors hover:border-border-strong max-md:hidden"
      >
        <SearchIcon aria-hidden="true" className="size-4" />
        <span className="flex-1 text-left">Search scripts, outliers, pages…</span>
        <kbd className="rounded-[6px] border border-border bg-surface px-1.5 type-caption font-medium text-muted">
          ⌘K
        </kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="inline-flex size-10 items-center justify-center rounded-[10px] text-muted hover:bg-surface-2 md:hidden"
      >
        <SearchIcon className="size-5" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-[18%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
        >
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="flex items-center gap-2 border-b border-border px-4">
            <SearchIcon aria-hidden="true" className="size-4 text-muted" />
            <input
              autoFocus
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
              aria-label="Search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(results.length - 1, a + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(0, a - 1));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  go(results[active]);
                }
              }}
              placeholder="Search scripts, outliers, pages…"
              className="h-14 flex-1 bg-transparent type-body outline-none placeholder:text-faint"
            />
          </div>
          <ul
            id={listId}
            role="listbox"
            aria-label="Results"
            className="max-h-96 overflow-y-auto p-2"
          >
            {results.length === 0 ? (
              <li className="px-3 py-6 text-center type-body-sm text-muted">
                No matches for “{q}”.
              </li>
            ) : null}
            {results.map((r, i) => {
              const Icon =
                r.kind === "script"
                  ? AppIcon.scripts
                  : r.kind === "reel"
                    ? AppIcon.reels
                    : (NAV_ITEMS.find((n) => r.id === `p-${n.segment}`)?.icon ?? SearchIcon);
              const showHeader = i === 0 || results[i - 1]!.kind !== r.kind;
              return (
                <li key={r.id} role="presentation">
                  {showHeader ? (
                    <p className="px-3 pt-2 pb-1 type-caption font-medium text-faint">
                      {KIND_LABEL[r.kind]}
                    </p>
                  ) : null}
                  <div
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2",
                      i === active && "bg-surface-2",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0 text-muted" />
                    <span className="min-w-0 flex-1 truncate type-body-sm">{r.label}</span>
                    {r.hint ? (
                      <span className="shrink-0 type-caption text-faint">{r.hint}</span>
                    ) : null}
                    {i === active ? (
                      <CornerDownLeftIcon aria-hidden="true" className="size-3.5 text-faint" />
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
