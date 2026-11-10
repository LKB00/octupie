import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { PLAN_ORDER, PLAN_PRICE, rupees } from "@/lib/billing/prices";
import type { UsageSummary } from "@/lib/db/types";
import { shortDate } from "@/lib/format";
import { PLAN_LABEL, PLAN_LIMITS, type Meter } from "@/lib/quota";
import { cn } from "@/lib/utils";
import { AppIcon } from "../icons";
import { CollapsedHint } from "./collapsed-hint";

type Level = "ok" | "low" | "out";

/** Low = one left (or 80% used on big limits); out = none left. Unlimited is always ok. */
function level(m: Meter): Level {
  if (m.limit === null || m.remaining === null) return "ok";
  if (m.remaining === 0) return "out";
  return m.remaining <= 1 || m.used / m.limit >= 0.8 ? "low" : "ok";
}

const TONE: Record<Level, { fill: string; text: string }> = {
  ok: { fill: "bg-brand", text: "text-text" },
  low: { fill: "bg-warning", text: "text-warning" },
  out: { fill: "bg-danger", text: "text-danger" },
};

/**
 * One credit type. Small limits are countable dots (filled = still yours), large limits a slim
 * bar of what's left, unlimited just says so. The number is what's left, not what's used.
 */
function Credits({
  label,
  icon: Icon,
  m,
}: {
  label: string;
  icon: typeof AppIcon.breakdown;
  m: Meter;
}) {
  const lv = level(m);
  const left = m.remaining;
  const value = left === null ? "Unlimited" : left === 0 ? "None left" : `${left} left`;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 type-caption">
        <Icon aria-hidden="true" className="size-4 text-muted" />
        <span className="flex-1 text-muted">{label}</span>
        <span className={cn("font-semibold", TONE[lv].text)}>{value}</span>
      </div>
      {m.limit !== null ? (
        <div
          role="meter"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={m.limit}
          aria-valuenow={left ?? 0}
          aria-valuetext={`${value} of ${m.limit} this period`}
          className="flex gap-1"
        >
          {m.limit <= 12 ? (
            Array.from({ length: m.limit }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  i < (left ?? 0) ? TONE[lv].fill : "bg-surface-3",
                )}
              />
            ))
          ) : (
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
              <span
                className={cn("block h-full rounded-full", TONE[lv].fill)}
                style={{ width: `${((left ?? 0) / m.limit) * 100}%` }}
              />
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** Usage this period (docs/03 S0): what's left, when it resets, and an upgrade only when it helps. */
export function QuotaMeter({ usage }: { usage: UsageSummary }) {
  const b = usage.breakdowns;
  const s = usage.scripts;
  const worst: Level = [level(b), level(s)].includes("out")
    ? "out"
    : [level(b), level(s)].includes("low")
      ? "low"
      : "ok";
  const next = PLAN_ORDER[PLAN_ORDER.indexOf(usage.plan) + 1];
  const resets = shortDate(usage.renewsAt);
  const short = level(b) !== "ok" ? "breakdowns" : "scripts";
  const nextLimit = next ? PLAN_LIMITS[next][short] : null;
  const pct = b.limit ? (b.remaining ?? 0) / b.limit : 1;
  const R = 15;
  const C = 2 * Math.PI * R;
  return (
    <>
      <section
        data-testid="quota-meter"
        aria-label="Usage this period"
        className="flex flex-col gap-3.5 rounded-lg border border-border bg-surface p-3.5 group-data-[collapsed=true]/sidebar:hidden"
      >
        <div className="flex items-baseline justify-between gap-2">
          <p className="type-label">{PLAN_LABEL[usage.plan]} plan</p>
          <span className="type-caption text-faint">Resets {resets}</span>
        </div>
        <Credits label="Breakdowns" icon={AppIcon.breakdown} m={b} />
        <Credits label="Scripts" icon={AppIcon.scripts} m={s} />
        {next && worst !== "ok" ? (
          <div
            className={cn(
              "flex flex-col gap-2 rounded-[10px] p-2.5",
              worst === "out" ? "bg-danger-bg" : "bg-warning-bg",
            )}
          >
            <p className="type-caption text-text">
              {worst === "out"
                ? `You're out of ${short} until ${resets}.`
                : `Almost out of ${short}.`}{" "}
              {PLAN_LABEL[next]} gives you {nextLimit === null ? "unlimited" : nextLimit} a month.
            </p>
            <Link
              href="/settings/billing"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-sm bg-brand type-label text-on-brand transition-colors hover:bg-brand-strong"
            >
              Upgrade · {rupees(PLAN_PRICE[next])}/mo
            </Link>
          </div>
        ) : next ? (
          <Link
            href="/settings/billing"
            className="inline-flex items-center gap-1 self-start type-caption font-medium text-brand-strong hover:underline"
          >
            See plans <ArrowRight aria-hidden="true" className="size-3" />
          </Link>
        ) : null}
      </section>
      <Link
        href="/settings/billing"
        aria-label={`${b.remaining ?? "Unlimited"} breakdowns and ${s.remaining ?? "unlimited"} scripts left. Resets ${resets}`}
        className="group/nav relative mx-auto hidden size-10 items-center justify-center rounded-[10px] group-data-[collapsed=true]/sidebar:flex hover:bg-surface"
      >
        <svg viewBox="0 0 36 36" className="size-9" aria-hidden="true">
          <circle cx="18" cy="18" r={R} fill="none" strokeWidth="3" className="stroke-surface-3" />
          <circle
            cx="18"
            cy="18"
            r={R}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            className={
              worst === "out"
                ? "stroke-danger"
                : worst === "low"
                  ? "stroke-warning"
                  : "stroke-brand"
            }
            strokeDasharray={`${pct * C} ${C}`}
            transform="rotate(-90 18 18)"
          />
          <text x="18" y="22" textAnchor="middle" className="fill-text text-[11px] font-semibold">
            {b.remaining ?? "∞"}
          </text>
        </svg>
        <CollapsedHint>
          {b.remaining ?? "Unlimited"} breakdowns · {s.remaining ?? "unlimited"} scripts left
        </CollapsedHint>
      </Link>
    </>
  );
}
