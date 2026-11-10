"use client";

import { useOptimistic, useTransition } from "react";
import { setNotificationPrefAction } from "@/app/(app)/_actions/shell";
import { Switch } from "@/components/ui/switch";
import type { NotificationPrefs } from "@/lib/db/types";

const ROWS: { key: keyof NotificationPrefs; label: string; hint: string }[] = [
  {
    key: "weeklyEmail",
    label: "Weekly email",
    hint: "Mondays: your top 5 outliers and one idea per pillar.",
  },
  {
    key: "breakoutAlerts",
    label: "Breakout alerts",
    hint: "When a tracked account's reel passes 5× within a day. At most 2 a week.",
  },
  {
    key: "quotaWarnings",
    label: "Quota warnings",
    hint: "When you've used 80% of your breakdowns or scripts.",
  },
];

export function NotificationToggles({ prefs }: { prefs: NotificationPrefs }) {
  const [, start] = useTransition();
  const [state, set] = useOptimistic(prefs, (s, p: Partial<NotificationPrefs>) => ({ ...s, ...p }));
  return (
    <ul className="flex flex-col divide-y divide-border">
      {ROWS.map((r) => (
        <li key={r.key} className="flex items-start justify-between gap-4 py-3">
          <div>
            <p id={`${r.key}-label`} className="type-body-sm font-medium">
              {r.label}
            </p>
            <p className="type-caption text-muted">{r.hint}</p>
          </div>
          <Switch
            aria-labelledby={`${r.key}-label`}
            checked={state[r.key]}
            onCheckedChange={(value) =>
              start(async () => {
                set({ [r.key]: value });
                await setNotificationPrefAction({ key: r.key, value });
              })
            }
          />
        </li>
      ))}
    </ul>
  );
}
