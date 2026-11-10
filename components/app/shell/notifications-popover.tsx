"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { AppIcon } from "../icons";
import { toast } from "sonner";
import { markNotificationsReadAction } from "@/app/(app)/_actions/shell";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import type { Notification } from "@/lib/db/types";

const ICONS = {
  feed_ready: [AppIcon.discover, "violet"],
  voice_ready: [AppIcon.voice, "sky"],
  breakout: [AppIcon.hot, "rose"],
  quota: [AppIcon.quota, "amber"],
} as const;

type Props = { notifications: (Notification & { when: string })[] };

/** Bell popover: newest first; opening it marks everything read (docs/03-SCREENS.md S11). */
export function NotificationsPopover({ notifications }: Props) {
  const [, startTransition] = useTransition();
  const [items, markRead] = useOptimistic(notifications, (state) =>
    state.map((n) => ({ ...n, read: true })),
  );
  const unread = items.filter((n) => !n.read).length;

  return (
    <Popover
      onOpenChange={(open) => {
        if (open && unread > 0) {
          startTransition(async () => {
            markRead(undefined);
            await markNotificationsReadAction();
          });
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
            className="relative"
          />
        }
      >
        <AppIcon.notifications />
        {unread ? (
          <span
            aria-hidden="true"
            className="absolute top-2 right-2.5 size-2 rounded-full bg-hot ring-2 ring-surface"
          />
        ) : null}
      </PopoverTrigger>
      <PopoverContent className="w-90 p-0">
        <PopoverTitle className="border-b border-border px-4 py-3 type-body-sm font-medium">
          Notifications
        </PopoverTitle>
        {items.length === 0 ? (
          <p className="px-4 py-6 type-body-sm text-muted">
            Nothing new. We&apos;ll tell you when a tracked account breaks out.
          </p>
        ) : (
          <ul className="max-h-96 overflow-y-auto p-1.5">
            {items.map((n) => {
              const [Icon, tone] = ICONS[n.kind];
              const body = (
                <>
                  <IconTile tone={tone} size="sm">
                    <Icon />
                  </IconTile>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="type-body-sm text-text">{n.title}</span>
                    <span className="type-caption text-muted">{n.when}</span>
                  </span>
                </>
              );
              return (
                <li key={n.id} className="relative">
                  {!n.read ? (
                    <span
                      aria-hidden="true"
                      className="absolute top-4 right-3 size-2 rounded-full bg-brand"
                    />
                  ) : null}
                  {n.href ? (
                    <Link
                      href={n.href}
                      className="flex gap-3 rounded-[10px] px-3 py-2.5 hover:bg-surface-2"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="flex gap-3 px-3 py-2.5">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => toast.info("Desktop notifications arrive with the real data milestone.")}
          >
            Get desktop notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
