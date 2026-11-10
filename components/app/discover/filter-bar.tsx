"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  ArrowsDownUp as ArrowUpDownIcon,
  Check as CheckIcon,
  CircleNotch as LoaderCircleIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
  X as XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { FeedSort, Pillar } from "@/lib/db/types";
import { cn } from "@/lib/utils";
import { discoverHref, type DiscoverParams } from "./search-params";

const SORTS: { value: FeedSort; label: string }[] = [
  { value: "breaking", label: "Breaking now" },
  { value: "newest", label: "Newest" },
  { value: "multiple", label: "Highest multiple" },
];

/**
 * One row: pillar chips (the filter people use most) on the left, then Sort and Filters.
 * Everything is kept in the URL.
 */
export function FilterBar({ params, pillars }: { params: DiscoverParams; pillars: Pillar[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const go = (patch: Parameters<typeof discoverHref>[2]) =>
    start(() => router.push(discoverHref(pathname, params, patch), { scroll: false }));
  const active =
    (params.window !== 30 ? 1 : 0) +
    (params.format !== "all" ? 1 : 0) +
    (params.minMultiple !== 3 ? 1 : 0);
  const chip = (on: boolean) =>
    cn(
      "type-label inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 whitespace-nowrap transition-colors",
      on ? "bg-edge text-bg" : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-text",
    );

  return (
    <div
      role="group"
      aria-label="Filters"
      aria-busy={pending}
      className="flex flex-col gap-3 @3xl:flex-row @3xl:items-center"
    >
      <div
        aria-label="Pillar"
        role="group"
        className="-mx-1 flex min-w-0 flex-1 [scrollbar-width:none] gap-2 overflow-x-auto px-1 sm:flex-wrap sm:overflow-visible"
      >
        <button
          type="button"
          aria-pressed={!params.pillar}
          className={chip(!params.pillar)}
          onClick={() => go({ pillar: null })}
        >
          All
        </button>
        {pillars.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={params.pillar === p.id}
            className={chip(params.pillar === p.id)}
            onClick={() => go({ pillar: params.pillar === p.id ? null : p.id })}
          >
            {p.name}
          </button>
        ))}
        {params.account ? (
          <button
            type="button"
            onClick={() => go({ account: null })}
            className={chip(true)}
            aria-label={`Stop filtering by ${params.account}`}
          >
            {params.account}
            <XIcon aria-hidden="true" className="size-3.5" />
          </button>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        {pending ? (
          <LoaderCircleIcon aria-label="Updating" className="size-4 animate-spin text-muted" />
        ) : null}
        <Menu>
          <MenuTrigger render={<Button variant="ghost" size="sm" />}>
            <ArrowUpDownIcon aria-hidden="true" />
            {SORTS.find((s) => s.value === params.sort)?.label}
          </MenuTrigger>
          <MenuContent align="end">
            {SORTS.map((s) => (
              <MenuItem key={s.value} onClick={() => go({ sort: s.value })}>
                <CheckIcon
                  aria-hidden="true"
                  className={cn(params.sort !== s.value && "invisible")}
                />
                {s.label}
              </MenuItem>
            ))}
          </MenuContent>
        </Menu>

        <Popover>
          <PopoverTrigger render={<Button variant="secondary" size="sm" />}>
            <SlidersHorizontalIcon aria-hidden="true" />
            Filters
            {active ? (
              <span className="rounded-full bg-edge px-1.5 type-caption text-bg">{active}</span>
            ) : null}
          </PopoverTrigger>
          <PopoverContent className="flex w-80 flex-col gap-4">
            <PopoverTitle className="type-card-title">Filters</PopoverTitle>
            <div className="flex flex-col gap-2">
              <span className="type-label text-muted">Posted in the last</span>
              <SegmentedControl
                aria-label="Time window"
                className="w-full [&>*]:flex-1"
                options={[
                  { value: "7", label: "7 days" },
                  { value: "30", label: "30 days" },
                  { value: "90", label: "90 days" },
                ]}
                value={String(params.window) as "7" | "30" | "90"}
                onValueChange={(v) => go({ window: v })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="type-label text-muted">Format</span>
              <SegmentedControl
                aria-label="Format"
                className="w-full [&>*]:flex-1"
                options={[
                  { value: "all", label: "All" },
                  { value: "reel", label: "Reels" },
                  { value: "carousel", label: "Carousels" },
                ]}
                value={params.format}
                onValueChange={(v) => go({ format: v })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="type-label text-muted">Beat their usual by at least</span>
              <SegmentedControl
                aria-label="Minimum multiple"
                className="w-full [&>*]:flex-1"
                options={[
                  { value: "3", label: "3×" },
                  { value: "2", label: "2×" },
                ]}
                value={String(params.minMultiple) as "3" | "2"}
                onValueChange={(v) => go({ min: v })}
              />
            </div>
            {active ? (
              <Button
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={() => go({ window: "30", format: "all", min: "3" })}
              >
                Reset filters
              </Button>
            ) : null}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
