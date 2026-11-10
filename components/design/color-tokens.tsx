"use client";

import { useComputedTokens } from "./use-computed-tokens";

const GROUPS: { title: string; tokens: string[] }[] = [
  { title: "Surfaces", tokens: ["--bg", "--surface", "--surface-2", "--surface-3", "--overlay"] },
  { title: "Text", tokens: ["--text", "--text-muted", "--text-faint", "--text-on-brand", "--text-on-hot"] },
  { title: "Lines", tokens: ["--border", "--border-strong", "--edge"] },
  { title: "Brand", tokens: ["--brand", "--brand-hover", "--brand-strong", "--brand-weak", "--brand-ring", "--hot"] },
  {
    title: "Tints (icon tiles)",
    tokens: ["--tint-violet", "--tint-violet-bg", "--tint-amber", "--tint-amber-bg", "--tint-sky", "--tint-sky-bg", "--tint-rose", "--tint-rose-bg", "--tint-mint", "--tint-mint-bg"],
  },
  { title: "On media", tokens: ["--scrim", "--scrim-strong", "--glass", "--on-media"] },
  {
    title: "Status",
    tokens: ["--success", "--success-bg", "--warning", "--warning-bg", "--danger", "--danger-bg"],
  },
  {
    title: "Charts",
    tokens: ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5", "--chart-6", "--chart-7"],
  },
];

const ALL = GROUPS.flatMap((g) => g.tokens);

export function ColorTokens() {
  const values = useComputedTokens(ALL);
  const valueOf = (token: string) => values[ALL.indexOf(token)] || "—";

  return (
    <div className="flex flex-col gap-8">
      {GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-3">
          <h3 className="type-label text-muted">{group.title}</h3>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
            {group.tokens.map((token) => (
              <li key={token} className="flex flex-col gap-2">
                <span
                  aria-hidden="true"
                  className="h-14 rounded-sm border border-border"
                  style={{ background: `var(${token})` }}
                />
                <span className="type-mono text-text">{token}</span>
                <span className="type-label break-all text-muted">{valueOf(token)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
