import { Specimen } from "./section";

const SPACING = [
  { px: 4, cls: "w-1" },
  { px: 8, cls: "w-2" },
  { px: 12, cls: "w-3" },
  { px: 16, cls: "w-4" },
  { px: 24, cls: "w-6" },
  { px: 32, cls: "w-8" },
  { px: 40, cls: "w-10" },
  { px: 48, cls: "w-12" },
  { px: 64, cls: "w-16" },
];

const RADII = [
  { token: "--r-sm", cls: "rounded-sm", use: "Small buttons, chips in rows" },
  { token: "--r-md", cls: "rounded-md", use: "Large buttons, inputs" },
  { token: "--r-lg", cls: "rounded-lg", use: "Inner cards, options" },
  { token: "--r-xl", cls: "rounded-xl", use: "Cards, panels" },
  { token: "--r-2xl", cls: "rounded-2xl", use: "App frame, dialogs, hero" },
  { token: "--r-full", cls: "rounded-full", use: "Pills, avatars" },
];

const SHADOWS = [
  { token: "--shadow-pop", cls: "shadow-pop border border-border", use: "Only for things that float: menus, popovers, dialogs, toasts" },
  { token: "--shadow-selected", cls: "shadow-selected", use: "Selected segment in a segmented control" },
  { token: "--shadow-glow", cls: "shadow-glow border border-brand", use: "Keyboard focus on inputs" },
];

const OTHER_TOKENS = [
  { token: "--font-display", note: "Host Grotesk" },
  { token: "--font-body", note: "Inter" },
  { token: "--font-mono", note: "JetBrains Mono" },
  { token: "--ease-out", note: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
  { token: "--dur-fast", note: "150ms: hovers" },
  { token: "--dur-base", note: "250ms: dialogs" },
  { token: "--sidebar-w", note: "224px" },
  { token: "--rail-w", note: "280px" },
  { token: "--content-max", note: "1240px" },
];

export function Foundations() {
  return (
    <div className="flex flex-col gap-10">
      <Specimen label="Spacing (4-point scale)">
        <ul className="flex flex-wrap items-end gap-5">
          {SPACING.map((s) => (
            <li key={s.px} className="flex flex-col items-center gap-2">
              <span aria-hidden="true" className={`${s.cls} h-10 bg-brand`} />
              <span className="type-label text-muted">{s.px}</span>
            </li>
          ))}
        </ul>
      </Specimen>

      <Specimen label="Radius">
        {RADII.map((r) => (
          <div key={r.token} className="flex flex-col gap-2">
            <span aria-hidden="true" className={`${r.cls} size-20 border border-edge bg-surface-2`} />
            <span className="type-mono text-text">{r.token}</span>
            <span className="type-label text-muted">{r.use}</span>
          </div>
        ))}
      </Specimen>

      <Specimen label="Elevation">
        {SHADOWS.map((s) => (
          <div key={s.token} className="flex w-40 flex-col gap-3">
            <span aria-hidden="true" className={`${s.cls} h-20 rounded-xl bg-surface`} />
            <span className="type-mono text-text">{s.token}</span>
            <span className="type-label text-muted">{s.use}</span>
          </div>
        ))}
      </Specimen>

      <Specimen label="Type, motion and layout">
        <dl className="grid w-full grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {OTHER_TOKENS.map((t) => (
            <div key={t.token} className="flex flex-col gap-1">
              <dt className="type-mono text-text">{t.token}</dt>
              <dd className="type-label text-muted">{t.note}</dd>
            </div>
          ))}
        </dl>
      </Specimen>
    </div>
  );
}
