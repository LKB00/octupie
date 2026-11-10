import type { Snapshot } from "@/lib/data/instagram-provider";
import { compactNumber } from "@/lib/format";

const W = 560;
const H = 180;
const PAD = { l: 44, r: 12, t: 12, b: 28 };

/** Views over time: solid line for this reel, dashed for the account's typical curve. */
export function GrowthChart({
  postedAt,
  reel,
  typical,
}: {
  postedAt: string;
  reel: Snapshot[];
  typical: Snapshot[];
}) {
  if (reel.length < 2)
    return (
      <p className="type-body-sm text-muted">
        We need two view counts before we can draw the growth curve.
      </p>
    );
  const t0 = new Date(postedAt).getTime();
  const days = (iso: string) => (new Date(iso).getTime() - t0) / 86_400_000;
  const maxX = Math.max(1, ...reel.map((s) => days(s.capturedAt)));
  const maxY = Math.max(1, ...reel.map((s) => s.views), ...typical.map((s) => s.views)) * 1.1;
  const x = (d: number) => PAD.l + (d / maxX) * (W - PAD.l - PAD.r);
  const y = (v: number) => H - PAD.b - (v / maxY) * (H - PAD.t - PAD.b);
  const path = (pts: Snapshot[]) =>
    pts
      .map((s, i) => `${i ? "L" : "M"}${x(days(s.capturedAt)).toFixed(1)},${y(s.views).toFixed(1)}`)
      .join(" ");
  const yTicks = [0, maxY / 2, maxY].map((v) => Math.round(v / 1000) * 1000);
  const last = reel[reel.length - 1]!;

  return (
    <figure className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Views grew to ${compactNumber(last.views)} over ${Math.round(maxX)} days.`}
      >
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="stroke-border" />
            <text
              x={PAD.l - 6}
              y={y(t) + 4}
              textAnchor="end"
              className="fill-muted font-display text-[11px]"
            >
              {compactNumber(t)}
            </text>
          </g>
        ))}
        {[0, maxX / 2, maxX].map((d, i) => (
          <text
            key={i}
            x={x(d)}
            y={H - 8}
            textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}
            className="fill-muted text-[11px]"
          >
            {maxX < 2 ? `${Math.round(d * 24)}h` : `Day ${Math.round(d)}`}
          </text>
        ))}
        {typical.length > 1 ? (
          <path
            d={path(typical)}
            fill="none"
            className="stroke-muted"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        ) : null}
        <path d={path(reel)} fill="none" className="stroke-brand" strokeWidth={2.5} />
        <circle cx={x(days(last.capturedAt))} cy={y(last.views)} r={4} className="fill-brand" />
      </svg>
      <figcaption className="flex gap-4 type-caption text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-brand" />
          This reel
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0 w-4 border-t border-dashed border-muted" />
          Their typical reel
        </span>
      </figcaption>
    </figure>
  );
}
