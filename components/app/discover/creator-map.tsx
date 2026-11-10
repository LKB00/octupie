"use client";

import { AccountRow } from "../ig/account";
import Link from "next/link";
import { useState } from "react";
import { compactNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export type MapPoint = {
  handle: string;
  name: string;
  avatarUrl: string;
  followers: number;
  usualViews: number | null;
  outliers30d: number;
  kind: "tracked" | "suggested" | "you";
};

const W = 640;
const H = 360;
const PAD = 44;

/** Scatter: followers (log x) vs outliers in 30 days (y), with a side panel. */
export function CreatorMap({
  points,
  feedHrefFor,
}: {
  points: MapPoint[];
  feedHrefFor: Record<string, string>;
}) {
  const [selected, setSelected] = useState<string>(
    points.find((p) => p.kind === "tracked")?.handle ?? points[0]!.handle,
  );
  const minF = Math.log10(Math.min(...points.map((p) => p.followers)) * 0.8);
  const maxF = Math.log10(Math.max(...points.map((p) => p.followers)) * 1.2);
  const maxY = Math.max(4, ...points.map((p) => p.outliers30d)) + 1;
  const x = (f: number) => PAD + ((Math.log10(f) - minF) / (maxF - minF)) * (W - PAD * 2);
  const y = (o: number) => H - PAD - (o / maxY) * (H - PAD * 2);
  const ticks = [1_000, 3_000, 10_000, 30_000, 100_000].filter(
    (t) => Math.log10(t) >= minF && Math.log10(t) <= maxF,
  );
  const sel = points.find((p) => p.handle === selected)!;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <figure className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="group"
          aria-label="Accounts by followers and outliers in the last 30 days"
          className="w-full"
        >
          {[0, Math.round(maxY / 2), maxY].map((t) => (
            <g key={t}>
              <line x1={PAD} x2={W - PAD} y1={y(t)} y2={y(t)} className="stroke-border" />
              <text x={PAD - 8} y={y(t) + 4} textAnchor="end" className="fill-muted text-[11px]">
                {t}
              </text>
            </g>
          ))}
          {ticks.map((t) => (
            <text
              key={t}
              x={x(t)}
              y={H - PAD + 18}
              textAnchor="middle"
              className="fill-muted text-[11px]"
            >
              {compactNumber(t)}
            </text>
          ))}
          <text x={W / 2} y={H - 6} textAnchor="middle" className="fill-muted text-[11px]">
            Followers (log scale)
          </text>
          <text
            x={12}
            y={H / 2}
            textAnchor="middle"
            transform={`rotate(-90 12 ${H / 2})`}
            className="fill-muted text-[11px]"
          >
            Outliers, 30 days
          </text>
          {points.map((p) => (
            <g key={p.handle} transform={`translate(${x(p.followers)} ${y(p.outliers30d)})`}>
              <circle
                r={p.kind === "you" ? 9 : 7}
                tabIndex={0}
                role="button"
                aria-label={`@${p.handle}: ${compactNumber(p.followers)} followers, ${p.outliers30d} outliers`}
                aria-pressed={selected === p.handle}
                onClick={() => setSelected(p.handle)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(p.handle)}
                onMouseEnter={() => setSelected(p.handle)}
                className={cn(
                  "cursor-pointer stroke-edge outline-none focus-visible:stroke-brand focus-visible:stroke-[3]",
                  p.kind === "you"
                    ? "fill-hot"
                    : p.kind === "tracked"
                      ? "fill-brand"
                      : "fill-surface-2",
                  selected === p.handle && "stroke-[2.5]",
                )}
              />
              {p.kind === "you" ? (
                <text y={-14} textAnchor="middle" className="fill-text text-[11px] font-semibold">
                  You
                </text>
              ) : null}
            </g>
          ))}
        </svg>
        <figcaption className="flex flex-wrap gap-4 type-caption text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full border border-edge bg-brand" />
            Tracked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full border border-edge bg-surface-2" />
            Suggested
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full border border-edge bg-hot" />
            You
          </span>
        </figcaption>
      </figure>
      <aside
        aria-live="polite"
        className="flex flex-col gap-4 self-start rounded-xl border border-border bg-surface p-5"
      >
        <AccountRow
          handle={sel.handle}
          avatarUrl={sel.avatarUrl}
          size={56}
          meta={sel.kind === "you" ? "You" : sel.kind === "tracked" ? "Tracked" : "Suggested"}
        />
        <dl className="grid grid-cols-3 gap-2">
          {[
            ["Followers", compactNumber(sel.followers)],
            ["Usual", compactNumber(sel.usualViews)],
            ["Outliers", String(sel.outliers30d)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="type-caption text-muted">{k}</dt>
              <dd className="type-stat">{v}</dd>
            </div>
          ))}
        </dl>
        {feedHrefFor[sel.handle] ? (
          <Link
            href={feedHrefFor[sel.handle]!}
            className="type-body-sm font-medium text-brand-strong underline-offset-4 hover:underline"
          >
            See their outliers →
          </Link>
        ) : null}
      </aside>
    </div>
  );
}
