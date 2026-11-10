const R = 20;
const C = 2 * Math.PI * R;

/** Ring gauge with label, reason and the quote or description, never truncated. */
export function HookScore({
  name,
  score,
  label,
  reason,
  quote,
}: {
  name: string;
  score: number;
  label: string;
  reason: string;
  quote: string | null;
}) {
  const tone = score >= 70 ? "stroke-brand" : score >= 40 ? "stroke-chart-4" : "stroke-faint";
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-2/60 p-4">
      <div className="flex items-center gap-3">
        <svg
          viewBox="0 0 48 48"
          className="size-12 shrink-0"
          role="img"
          aria-label={`${name} hook score ${score} out of 100`}
        >
          <circle cx="24" cy="24" r={R} fill="none" strokeWidth="4" className="stroke-surface-3" />
          <circle
            cx="24"
            cy="24"
            r={R}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className={tone}
            strokeDasharray={`${(score / 100) * C} ${C}`}
            transform="rotate(-90 24 24)"
          />
          <text
            x="24"
            y="29"
            textAnchor="middle"
            className="fill-text font-display text-[14px] font-semibold"
          >
            {score}
          </text>
        </svg>
        <div className="min-w-0">
          <p className="type-overline text-muted">{name}</p>
          <p className="type-card-title">{label}</p>
        </div>
      </div>
      {quote ? (
        <p className="border-l-2 border-brand/40 pl-3 type-body-sm italic">“{quote}”</p>
      ) : (
        <p className="type-body-sm text-faint italic">Nothing on screen in the first 3 seconds.</p>
      )}
      <p className="type-caption text-muted">{reason}</p>
    </div>
  );
}
