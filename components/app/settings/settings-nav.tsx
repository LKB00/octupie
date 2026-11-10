"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const SETTINGS_SECTIONS = [
  { slug: "profile", label: "Account" },
  { slug: "accounts", label: "Linked accounts" },
  { slug: "notifications", label: "Notifications" },
  { slug: "billing", label: "Plan & billing" },
  { slug: "danger", label: "Danger zone" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Settings"
      className="-mx-1 flex gap-1 overflow-x-auto px-1 sm:flex-wrap sm:overflow-visible lg:mx-0 lg:flex-col lg:px-0"
    >
      {SETTINGS_SECTIONS.map((s) => {
        const href = `/settings/${s.slug}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={s.slug}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-9 shrink-0 items-center rounded-[10px] px-3 type-body-sm whitespace-nowrap text-muted hover:bg-surface-2 hover:text-text",
              active && "bg-surface-2 font-medium text-text",
            )}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
