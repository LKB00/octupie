"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus as PlusIcon, MagnifyingGlass as SearchIcon } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";
import type { ScriptStatus } from "@/lib/ai/schemas";
import { cn } from "@/lib/utils";
import { ChatItem } from "./chat-item";

export type ChatSummary = {
  id: string;
  title: string;
  status: ScriptStatus;
  updatedAt: string;
  /** "Draft · 2 days ago" */
  meta: string;
};

const DAY = 86_400_000;

function groupOf(iso: string, now: number) {
  const age = now - new Date(iso).getTime();
  return age < DAY ? "Today" : age < 7 * DAY ? "Previous 7 days" : "Older";
}

/** Studio's script list: each script keeps its own chat. New, search, rename, duplicate, delete. */
export function ChatList({
  creatorId,
  chats,
  activeId,
  onNavigate,
}: {
  creatorId: string;
  chats: ChatSummary[];
  activeId: string | null;
  onNavigate?: () => void;
}) {
  const [q, setQ] = useState("");
  // Pin "now" once per mount so grouping is stable during render.
  const [now] = useState(() => Date.now());
  const groups = useMemo(() => {
    const t = q.trim().toLowerCase();
    const hits = chats.filter((c) => !t || c.title.toLowerCase().includes(t));
    const out = new Map<string, ChatSummary[]>();
    for (const c of hits) {
      const g = groupOf(c.updatedAt, now);
      out.set(g, [...(out.get(g) ?? []), c]);
    }
    return [...out.entries()];
  }, [chats, q, now]);

  return (
    <nav aria-label="Your scripts" className="flex h-full min-h-0 flex-col gap-3">
      <Link
        href={`/c/${creatorId}/studio`}
        onClick={onNavigate}
        className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "w-full justify-start")}
      >
        <PlusIcon aria-hidden="true" />
        New script
      </Link>
      <div className="relative">
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-faint"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search scripts"
          placeholder="Search scripts"
          className="h-8 w-full rounded-sm border border-border bg-surface pr-2 pl-8 type-body-sm placeholder:text-faint focus-visible:border-brand focus-visible:outline-none"
        />
      </div>
      <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1 pb-2">
        {groups.length === 0 ? (
          <p className="px-2 type-caption text-muted">
            {q ? `No scripts match "${q}".` : "No scripts yet."}
          </p>
        ) : null}
        {groups.map(([label, items]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <p className="px-2 pb-1 type-overline text-faint">{label}</p>
            {items.map((c) => (
              <ChatItem
                key={c.id}
                creatorId={creatorId}
                chat={c}
                active={c.id === activeId}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
