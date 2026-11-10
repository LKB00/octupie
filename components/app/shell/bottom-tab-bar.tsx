"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { AppIcon } from "../icons";
import { IgAvatar } from "../ig/ig-avatar";
import { Menu, MenuContent, MenuLinkItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, YOUR_REELS_SEGMENT, isActive, navHref } from "./nav-items";

const tab =
  "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 type-caption font-medium";
const TABS = NAV_ITEMS.filter((i) => ["home", "discover", "scripts"].includes(i.segment));

/**
 * Under 768 px: Home, Discover, New script, Scripts, and your avatar, which opens Your reels,
 * Brand & voice and Settings.
 */
export function BottomTabBar({ creatorId, avatarUrl }: { creatorId: string; avatarUrl: string }) {
  const pathname = usePathname();
  const link = (i: (typeof NAV_ITEMS)[number]) => {
    const active = isActive(pathname, creatorId, i.segment);
    return (
      <Link
        key={i.segment}
        href={navHref(creatorId, i.segment)}
        aria-current={active ? "page" : undefined}
        className={cn(tab, active ? "text-brand-strong" : "text-muted")}
      >
        <i.icon aria-hidden="true" weight={active ? "duotone" : "regular"} className="size-6" />
        {i.label}
      </Link>
    );
  };
  const youActive = [YOUR_REELS_SEGMENT, "context"].some((s) => isActive(pathname, creatorId, s));
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {TABS.slice(0, 2).map(link)}
      <Link
        href={navHref(creatorId, "studio")}
        aria-label="New script"
        className={cn(tab, "text-text")}
      >
        <span className="flex h-7 w-10 items-center justify-center rounded-[10px] bg-edge text-bg">
          <Plus aria-hidden="true" weight="bold" className="size-4" />
        </span>
      </Link>
      {TABS.slice(2).map(link)}
      <Menu>
        <MenuTrigger className={cn(tab, youActive ? "text-brand-strong" : "text-muted")}>
          <span className={cn("rounded-full p-px", youActive && "ring-2 ring-brand")}>
            <IgAvatar src={avatarUrl} size={24} />
          </span>
          You
        </MenuTrigger>
        <MenuContent side="top" align="end">
          <MenuLinkItem render={<Link href={navHref(creatorId, YOUR_REELS_SEGMENT)} />}>
            <AppIcon.yourReels aria-hidden="true" /> Your reels
          </MenuLinkItem>
          <MenuLinkItem render={<Link href={navHref(creatorId, "context")} />}>
            <AppIcon.brand aria-hidden="true" /> Brand &amp; voice
          </MenuLinkItem>
          <MenuSeparator />
          <MenuLinkItem render={<Link href="/settings/profile" />}>
            <AppIcon.settings aria-hidden="true" /> Settings
          </MenuLinkItem>
        </MenuContent>
      </Menu>
    </nav>
  );
}
