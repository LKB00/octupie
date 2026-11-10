"use client";

import { useSyncExternalStore } from "react";

/** Re-run whenever the theme attribute or the OS colour scheme changes. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

const SEP = "\u0000";

/** Resolved values of CSS custom properties on <html>, in the current theme. */
export function useComputedTokens(names: readonly string[]): string[] {
  const joined = useSyncExternalStore(
    subscribe,
    () => {
      const style = getComputedStyle(document.documentElement);
      return names.map((n) => style.getPropertyValue(n).trim()).join(SEP);
    },
    () => "",
  );
  return joined ? joined.split(SEP) : names.map(() => "");
}
