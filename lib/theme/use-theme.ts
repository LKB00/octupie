"use client";

import { useCallback, useSyncExternalStore } from "react";
import { applyTheme, readTheme, type Theme } from "./theme";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Current theme choice ("system" on the server) and a setter that persists it. */
export function useTheme() {
  const theme = useSyncExternalStore<Theme>(subscribe, readTheme, () => "system");
  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    listeners.forEach((l) => l());
  }, []);
  return { theme, setTheme };
}
