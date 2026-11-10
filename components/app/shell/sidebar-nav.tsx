"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CollapsedHint } from "./collapsed-hint";
import { NAV_ITEMS, type NavItem, isActive, navHref } from "./nav-items";

function Item({
  item,
  href,
  active,
  count,
}: {
  item: NavItem;
  href: string;
  active: boolean;
  count?: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/nav relative flex h-10 items-center gap-2.5 rounded-[10px] px-3 type-body-sm text-muted transition-colors duration-150 hover:bg-surface hover:text-text",
        "group-data-[collapsed=true]/sidebar:mx-auto group-data-[collapsed=true]/sidebar:w-10 group-data-[collapsed=true]/sidebar:justify-center group-data-[collapsed=true]/sidebar:px-0",
        active && "bg-surface font-medium text-text shadow-selected",
      )}
    >
      <item.icon
        aria-hidden="true"
        weight={active ? "duotone" : "regular"}
        className={cn("size-5 shrink-0", active && "text-brand")}
      />
      <span className="min-w-0 flex-1 truncate group-data-[collapsed=true]/sidebar:sr-only">
        {item.label}
      </span>
      {count ? (
        <span
          className={
            "rounded-full bg-surface-3 px-1.5 type-caption text-muted group-data-[collapsed=true]/sidebar:hidden"
          }
        >
          {count}
        </span>
      ) : null}
      <CollapsedHint>{item.label}</CollapsedHint>
    </Link>
  );
}

/** Home, Discover, Scripts, Your reels, Brand & voice. */
export function SidebarNav({ creatorId, scriptCount }: { creatorId: string; scriptCount: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <Item
          key={item.segment}
          item={item}
          href={navHref(creatorId, item.segment)}
          active={isActive(pathname, creatorId, item.segment)}
          count={item.segment === "scripts" ? scriptCount : undefined}
        />
      ))}
    </nav>
  );
}
