import Link from "next/link";
import { now } from "@/lib/clock";
import { getFeed, getUsage, listNotifications, listScripts } from "@/lib/db";
import type { Creator } from "@/lib/db/types";
import type { Session } from "@/lib/auth/session";
import { compactNumber, relativeDate } from "@/lib/format";
import { formatMultiple } from "@/lib/outliers/multiple";
import { PLAN_LABEL } from "@/lib/quota";
import { AccountMenu } from "./account-menu";
import { BottomTabBar } from "./bottom-tab-bar";
import { CommandPalette, type PaletteItem } from "./command-palette";
import { Logo } from "./logo";
import { NotificationsPopover } from "./notifications-popover";
import { QuotaMeter } from "./quota-meter";
import { ScrollReset } from "./scroll-reset";
import { SidebarFrame } from "./sidebar";
import { SidebarProvider } from "./sidebar-state";
import { SidebarNav } from "./sidebar-nav";

/** Signed-in frame: sidebar on the canvas, content in an inset panel (docs/03 S0). */
export async function AppShell({
  session,
  creator,
  children,
}: {
  session: Session;
  creator: Creator;
  children: React.ReactNode;
}) {
  const usage = getUsage();
  const at = now();
  const notifications = listNotifications().map((n) => ({
    ...n,
    when: relativeDate(n.createdAt, at),
  }));
  const scripts = listScripts();
  const outliers = await getFeed({
    sort: "multiple",
    window: 30,
    format: "all",
    pillar: null,
    account: null,
    minMultiple: 3,
  }).catch(() => []);
  const palette: PaletteItem[] = [
    ...scripts.map((s) => ({
      id: `s-${s.id}`,
      label: s.title,
      hint: s.status,
      href: `/c/${creator.id}/studio?script=${s.id}`,
      kind: "script" as const,
    })),
    ...outliers.slice(0, 20).map((r) => ({
      id: `r-${r.shortcode}`,
      label: r.hookLine ?? r.caption,
      hint: `@${r.ownerHandle} · ${r.multiple ? formatMultiple(r.multiple) : ""} · ${compactNumber(r.views)}`,
      href: `/c/${creator.id}/reels/${r.shortcode}`,
      kind: "reel" as const,
    })),
  ];

  return (
    <SidebarProvider>
      <div className="relative flex min-h-dvh w-full bg-bg md:h-dvh md:overflow-hidden">
        <a
          href="#main"
          className="sr-only z-50 rounded-sm bg-surface p-3 type-body-sm focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to content
        </a>
        <SidebarFrame
          creatorId={creator.id}
          bottom={
            <>
              <QuotaMeter usage={usage} />
              <AccountMenu
                name={session.user.name}
                email={session.user.email}
                plan={PLAN_LABEL[usage.plan]}
                creator={creator}
              />
            </>
          }
        >
          <SidebarNav creatorId={creator.id} scriptCount={scripts.length} />
        </SidebarFrame>
        <div className="flex min-w-0 flex-1 flex-col md:min-h-0 md:py-2 md:pr-2">
          {/* The frame always fits the window; its content scrolls inside it (md and up). */}
          <div className="flex flex-1 flex-col bg-surface md:min-h-0 md:overflow-hidden md:rounded-2xl md:border md:border-border">
            <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur md:static md:px-6">
              <Link
                href={`/c/${creator.id}/home`}
                className="flex items-center gap-2 md:hidden"
                aria-label="Octupie home"
              >
                <Logo />
              </Link>
              <CommandPalette creatorId={creator.id} items={palette} />
              <div className="ml-auto flex items-center gap-1">
                <NotificationsPopover notifications={notifications} />
              </div>
            </header>
            <div
              data-scroll-root
              className="relative flex flex-1 [scrollbar-gutter:stable] flex-col md:min-h-0 md:overflow-y-auto"
            >
              <ScrollReset />
              <main
                id="main"
                className="mx-auto w-full max-w-(--content-max) flex-1 px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-12"
              >
                {children}
              </main>
            </div>
          </div>
        </div>
        <BottomTabBar creatorId={creator.id} avatarUrl={creator.avatarUrl} />
      </div>
    </SidebarProvider>
  );
}
