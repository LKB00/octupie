"use client";

import { useTransition } from "react";
import {
  DownloadSimple as DownloadIcon,
  ClockCounterClockwise as HistoryIcon,
  ArrowUUpRight as Redo2Icon,
  ArrowUUpLeft as Undo2Icon,
} from "@phosphor-icons/react/dist/ssr";
import { redoAction, restoreVersionAction, undoAction } from "@/app/(app)/_actions/studio";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuTrigger,
} from "@/components/ui/menu";
import type { ScriptWithHistory } from "@/lib/db/types";
import { clockTime } from "@/lib/format";
import { CopyButton } from "../copy-button";

export function ScriptToolbar({ script, text }: { script: ScriptWithHistory; text: string }) {
  const [pending, start] = useTransition();
  const exportTxt = () => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${script.title.replace(/[^\w\- ]+/g, "").trim() || "script"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div role="toolbar" aria-label="Script tools" className="flex flex-wrap items-center gap-2">
      <div className="flex items-center rounded-[10px] border border-border bg-surface p-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Undo"
          disabled={!script.canUndo || pending}
          onClick={() => start(() => undoAction(script.id))}
        >
          <Undo2Icon />
        </Button>
        <span aria-hidden="true" className="h-4 w-px bg-border" />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Redo"
          disabled={!script.canRedo || pending}
          onClick={() => start(() => redoAction(script.id))}
        >
          <Redo2Icon />
        </Button>
      </div>
      <Menu>
        <MenuTrigger render={<Button variant="secondary" size="sm" />}>
          <HistoryIcon aria-hidden="true" />
          <span className="max-sm:sr-only">Versions</span> ({script.versions.length})
        </MenuTrigger>
        <MenuContent align="end" className="max-h-80 w-72 overflow-y-auto">
          <MenuGroup>
            <MenuLabel>Every version is kept</MenuLabel>
            {script.versions.map((v) => (
              <MenuItem
                key={v.id}
                disabled={v.id === script.currentVersionId}
                onClick={() => start(() => restoreVersionAction(script.id, v.id))}
              >
                <span className="w-10 shrink-0 type-caption text-muted tabular-nums">
                  {clockTime(v.createdAt)}
                </span>
                <span className="truncate">{v.reason}</span>
                {v.id === script.currentVersionId ? (
                  <span className="ml-auto type-caption text-muted">Current</span>
                ) : null}
              </MenuItem>
            ))}
          </MenuGroup>
        </MenuContent>
      </Menu>
      <CopyButton text={text} label="Copy all" compact />
      <Button variant="dark" size="sm" onClick={exportTxt}>
        <DownloadIcon aria-hidden="true" />
        <span className="max-sm:sr-only">Export .txt</span>
      </Button>
    </div>
  );
}
