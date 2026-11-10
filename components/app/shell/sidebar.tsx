"use client";

import Link from "next/link";
import {
  SidebarSimple as PanelLeftCloseIcon,
  SidebarSimple as PanelLeftOpenIcon,
  Plus as PlusIcon,
} from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CollapsedHint } from "./collapsed-hint";
import { Logo } from "./logo";
import { useSidebar } from "./sidebar-state";

const square =
  "group-data-[collapsed=true]/sidebar:mx-auto group-data-[collapsed=true]/sidebar:size-10 group-data-[collapsed=true]/sidebar:justify-center group-data-[collapsed=true]/sidebar:px-0";

/**
 * Sidebar on the canvas: 248 px, or a 72 px icon rail where every control is the same 40 px square
 * with a label on hover or focus. In the rail the logo doubles as the expand button: it shows the
 * logo until you hover the rail (or focus the button), then the expand icon.
 */
export function SidebarFrame({
  creatorId,
  children,
  bottom,
}: {
  creatorId: string;
  children: React.ReactNode;
  bottom: React.ReactNode;
}) {
  const { open, setOpen } = useSidebar();
  const collapsed = !open;
  return (
    <aside
      aria-label="Sidebar"
      data-collapsed={collapsed}
      className={cn(
        "group/sidebar sticky top-0 z-40 hidden h-dvh shrink-0 flex-col gap-3 py-4 transition-[width] duration-200 ease-out md:flex",
        collapsed ? "w-[72px] px-4" : "w-(--sidebar-w) px-3",
      )}
    >
      {collapsed ? (
        <button
          type="button"
          aria-label="Expand sidebar"
          aria-expanded={false}
          aria-keyshortcuts="Meta+Backslash Control+Backslash"
          onClick={() => setOpen(true)}
          className="group/nav relative mx-auto grid size-10 place-items-center rounded-[10px] transition-colors group-hover/sidebar:bg-surface"
        >
          <Logo className="col-start-1 row-start-1 transition-opacity duration-150 group-hover/sidebar:opacity-0 group-focus-visible/nav:opacity-0" />
          <PanelLeftOpenIcon
            aria-hidden="true"
            className="col-start-1 row-start-1 size-[18px] text-muted opacity-0 transition-opacity duration-150 group-hover/nav:text-text group-hover/sidebar:opacity-100 group-focus-visible/nav:opacity-100"
          />
          <CollapsedHint>Expand sidebar · ⌘\</CollapsedHint>
        </button>
      ) : (
        <div className="flex items-center justify-between gap-2 pl-1.5">
          <Link
            href={`/c/${creatorId}/home`}
            aria-label="Octupie home"
            className="flex h-10 items-center gap-2"
          >
            <Logo />
            <span className="type-section">Octupie</span>
          </Link>
          <button
            type="button"
            aria-label="Collapse sidebar"
            aria-expanded={true}
            aria-keyshortcuts="Meta+Backslash Control+Backslash"
            title="Collapse sidebar (⌘\)"
            onClick={() => setOpen(false)}
            className="inline-flex size-8 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface hover:text-text"
          >
            <PanelLeftCloseIcon className="size-[18px]" />
          </button>
        </div>
      )}
      <Link
        href={`/c/${creatorId}/studio`}
        className={cn(buttonVariants({ variant: "dark" }), "group/nav relative w-full", square)}
        aria-label="New script"
      >
        <PlusIcon aria-hidden="true" />
        <span className="group-data-[collapsed=true]/sidebar:hidden">New script</span>
        <CollapsedHint>New script</CollapsedHint>
      </Link>
      <div className="-mx-1 flex-1 overflow-y-auto px-1 pt-2 group-data-[collapsed=true]/sidebar:overflow-visible">
        {children}
      </div>
      <div className="flex flex-col gap-2">{bottom}</div>
    </aside>
  );
}
