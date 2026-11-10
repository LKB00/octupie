"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * The app scrolls inside its frame, not the window, so start each new page at the top of that
 * scroller. Only the path counts: changing filters (search params) keeps your place.
 */
export function ScrollReset() {
  const pathname = usePathname();
  useEffect(() => {
    document.querySelector("[data-scroll-root]")?.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}
