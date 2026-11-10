const SCALE = [
  { cls: "type-display", name: "display", spec: "40/48 · 600 · −0.025em", use: "Home hero, Studio start", sample: "3 reels broke out this week" },
  { cls: "type-title", name: "title", spec: "28/36 · 600 · −0.02em", use: "Page title (h1)", sample: "Discover" },
  { cls: "type-section", name: "section", spec: "18/26 · 600", use: "Section header (h2)", sample: "Worth making this week" },
  { cls: "type-card-title", name: "card-title", spec: "15/22 · 600", use: "Card, panel, list-item title", sample: "Your pipeline" },
  { cls: "type-body", name: "body", spec: "15/24 · 400", use: "Reading text", sample: "Octupie watches accounts in your niche and flags reels that beat their usual views." },
  { cls: "type-body-sm", name: "body-sm", spec: "14/20 · 400", use: "UI text, descriptions", sample: "Outliers from the 12 accounts you track, refreshed daily." },
  { cls: "type-label", name: "label", spec: "13/18 · 500", use: "Controls, tabs, badges", sample: "Breaking now" },
  { cls: "type-caption", name: "caption", spec: "12/16 · 400", use: "Meta and helper text", sample: "pmwithmeera · 13h" },
  { cls: "type-overline", name: "overline", spec: "11/16 · 600 · uppercase", use: "Group labels", sample: "Library" },
  { cls: "type-kpi", name: "kpi", spec: "28/36 · 600 · tabular", use: "Stat tiles", sample: "24× · 194K" },
  { cls: "type-stat", name: "stat", spec: "18/24 · 600 · tabular", use: "Inline numbers", sample: "8.4K followers" },
  { cls: "type-mono", name: "mono", spec: "13/20 · 400", use: "Hook templates", sample: "Stop [common habit] if you want [result]." },
] as const;

export function TypeScale() {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {SCALE.map((t) => (
        <li key={t.name} className="grid gap-3 py-5 md:grid-cols-[200px_1fr]">
          <div className="flex flex-col gap-1">
            <span className="type-mono text-text">{t.name}</span>
            <span className="type-label text-muted">{t.spec}</span>
            <span className="type-label text-faint">{t.use}</span>
          </div>
          <p className={`${t.cls} min-w-0 break-words text-text`}>{t.sample}</p>
        </li>
      ))}
    </ul>
  );
}
