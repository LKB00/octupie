import type { Icon } from "@phosphor-icons/react";
import { AppIcon } from "../icons";

export type NavItem = {
  label: string;
  segment: string;
  icon: Icon;
  group: "main";
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", segment: "home", icon: AppIcon.home, group: "main" },
  { label: "Discover", segment: "discover", icon: AppIcon.discover, group: "main" },
  { label: "Scripts", segment: "scripts", icon: AppIcon.scripts, group: "main" },
  { label: "Your reels", segment: "your-reels", icon: AppIcon.yourReels, group: "main" },
  { label: "Brand & voice", segment: "context", icon: AppIcon.brand, group: "main" },
];

export const YOUR_REELS_SEGMENT = "your-reels";

export const navHref = (creatorId: string, segment: string) => `/c/${creatorId}/${segment}`;

/**
 * Discover owns reel detail pages; Scripts owns Studio (every Studio chat is a script).
 * A reel of your own opens from Profile, but its URL is shared, so Discover stays active there.
 */
export function isActive(pathname: string, creatorId: string, segment: string): boolean {
  const base = navHref(creatorId, segment);
  if (segment === "discover" && pathname.startsWith(`/c/${creatorId}/reels/`)) return true;
  if (segment === "scripts" && pathname.startsWith(`/c/${creatorId}/studio`)) return true;
  return pathname === base || pathname.startsWith(`${base}/`);
}
