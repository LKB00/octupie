"use client";

import { useState } from "react";
import { ListBullets } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ChatList, type ChatSummary } from "./chat-list";

type Props = {
  creatorId: string;
  chats: ChatSummary[];
  activeId: string | null;
  header?: React.ReactNode;
  /** Undo, versions, copy, export: right side of the top bar */
  toolbar?: React.ReactNode;
  editor?: React.ReactNode;
  assistant?: React.ReactNode;
  /** Shown instead of editor + assistant when no chat is open */
  empty?: React.ReactNode;
};

const fill = "@5xl:sticky @5xl:top-6 @5xl:h-[calc(100dvh-8.25rem)] @5xl:self-start";

/**
 * Studio: Chats | Script | Assistant when there's room (container ≥ 1024px). Narrower, the
 * chat list moves into a sheet and, under 896px, Script and Assistant become tabs.
 */
export function StudioWorkspace({
  creatorId,
  chats,
  activeId,
  header,
  toolbar,
  editor,
  assistant,
  empty,
}: Props) {
  const [pane, setPane] = useState<"script" | "chat">("script");
  const [sheet, setSheet] = useState(false);
  const chatsButton = (
    <Sheet open={sheet} onOpenChange={setSheet}>
      <SheetTrigger render={<Button variant="secondary" size="sm" className="@5xl:hidden" />}>
        <ListBullets aria-hidden="true" />
        Scripts
        <span className="rounded-full bg-surface-3 px-1.5 type-caption text-muted">
          {chats.length}
        </span>
      </SheetTrigger>
      <SheetContent title="Your scripts">
        <div className="h-full p-3">
          <ChatList
            creatorId={creatorId}
            chats={chats}
            activeId={activeId}
            onNavigate={() => setSheet(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="@container">
      <div
        className={cn(
          "grid gap-6",
          empty
            ? "@5xl:grid-cols-[240px_minmax(0,1fr)]"
            : "@4xl:grid-cols-[minmax(0,1fr)_340px] @5xl:grid-cols-[240px_minmax(0,1fr)_360px]",
        )}
      >
        <aside className={cn("hidden @5xl:block", fill)}>
          <ChatList creatorId={creatorId} chats={chats} activeId={activeId} />
        </aside>

        {empty ? (
          <div className="flex min-w-0 flex-col gap-4">
            <div className="@5xl:hidden">{chatsButton}</div>
            {empty}
          </div>
        ) : (
          <>
            <div className="flex min-w-0 flex-col gap-6">
              <div className="flex flex-col gap-4">
                {/* Top bar: the script list (when it isn't a column) and the script's tools. */}
                <div className="flex min-h-9 flex-wrap items-center gap-2">
                  <div className="@5xl:hidden">{chatsButton}</div>
                  <div className="ml-auto">{toolbar}</div>
                </div>
                {header}
              </div>
              <SegmentedControl
                aria-label="Studio pane"
                className="self-start @4xl:hidden"
                options={[
                  { value: "script", label: "Script" },
                  { value: "chat", label: "Assistant" },
                ]}
                value={pane}
                onValueChange={setPane}
              />
              <div className={cn(pane !== "script" && "@max-4xl:hidden")}>{editor}</div>
            </div>
            <div
              className={cn(
                "min-w-0 @4xl:sticky @4xl:top-6 @4xl:h-[calc(100dvh-8.25rem)] @4xl:self-start",
                pane !== "chat" && "@max-4xl:hidden",
              )}
            >
              {assistant}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
