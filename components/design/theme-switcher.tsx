"use client";

import { SegmentedControl } from "@/components/ui/segmented-control";
import { useTheme } from "@/lib/theme/use-theme";
import type { Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <SegmentedControl aria-label="Colour theme" options={OPTIONS} value={theme} onValueChange={setTheme} />
  );
}
