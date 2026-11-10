"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  ArrowUp as ArrowUpIcon,
  CaretDown as ChevronDownIcon,
  Lightning as ZapIcon,
} from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { restoreVersionAction, sendStudioMessageAction } from "@/app/(app)/_actions/studio";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { QUICK_CHIPS } from "@/lib/ai/mock/studio-chips";
import type { ScriptWithHistory } from "@/lib/db/types";
import { UpgradeCard } from "../states";
import { ChatThread } from "./chat-thread";

/** Right pane: a plain chat. Edits land in the script and can be undone (docs/03 S6). */
export function AssistantPanel({
  script,
  atLimit,
}: {
  script: ScriptWithHistory;
  atLimit: boolean;
}) {
  const [text, setText] = useState("");
  const [limit, setLimit] = useState(atLimit);
  const [pendingText, setPendingText] = useState<string | null>(null);
  const [busy, start] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [script.messages.length, pendingText]);

  const send = (message: string) => {
    const m = message.trim();
    if (!m || busy) return;
    setText("");
    setPendingText(m);
    start(async () => {
      const res = await sendStudioMessageAction(script.id, m);
      setPendingText(null);
      if (!res.ok) {
        if (res.reason === "quota") setLimit(true);
        else toast.error(res.message);
        setText(m);
      }
    });
  };

  return (
    <section
      aria-label="Studio assistant"
      className="flex min-h-[480px] flex-col overflow-hidden rounded-xl border border-border bg-surface lg:h-full"
    >
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
        <h2 className="type-card-title">Assistant</h2>
        <span className="type-caption text-muted">· edits apply to this script</span>
      </header>
      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
        <ChatThread
          scriptId={script.id}
          messages={script.messages}
          pending={pendingText}
          disabled={busy || limit}
          onSend={send}
          onUndo={(v) => start(() => restoreVersionAction(script.id, v))}
        />
      </div>
      <div className="shrink-0 p-3 pt-0">
        {limit ? (
          <UpgradeCard what="chat messages" />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
            className="flex flex-col gap-1 rounded-2xl border border-border bg-surface-2 p-2 transition-[border-color,box-shadow] focus-within:border-brand focus-within:bg-surface focus-within:shadow-glow"
          >
            <label htmlFor="studio-input" className="sr-only">
              Message the assistant
            </label>
            <textarea
              id="studio-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(text);
                }
              }}
              rows={1}
              placeholder="Ask for a change…"
              className="field-sizing-content max-h-40 min-h-10 w-full resize-none bg-transparent px-2 pt-1.5 type-body-sm placeholder:text-faint focus-visible:outline-none"
            />
            <div className="flex items-center gap-1">
              <Menu>
                <MenuTrigger
                  render={
                    <button
                      type="button"
                      className="inline-flex h-8 items-center gap-1.5 rounded-[10px] px-2 type-label text-muted transition-colors hover:bg-surface-3 hover:text-text"
                    />
                  }
                  disabled={busy}
                >
                  <ZapIcon aria-hidden="true" className="size-3.5" />
                  Quick edits
                  <ChevronDownIcon aria-hidden="true" className="size-3.5" />
                </MenuTrigger>
                <MenuContent side="top" align="start">
                  {QUICK_CHIPS.map((c) => (
                    <MenuItem key={c} onClick={() => send(c)}>
                      {c}
                    </MenuItem>
                  ))}
                </MenuContent>
              </Menu>
              <span className="ml-auto type-caption text-faint">Uses 1 message</span>
              <button
                type="submit"
                aria-label="Send"
                disabled={busy || !text.trim()}
                className="inline-flex size-8 items-center justify-center rounded-full bg-brand text-on-brand transition-colors hover:bg-brand-strong disabled:bg-surface-3 disabled:text-faint"
              >
                <ArrowUpIcon className="size-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
