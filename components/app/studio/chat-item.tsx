"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  CopySimple as CopyPlusIcon,
  DotsThree as EllipsisIcon,
  PencilSimple as PencilIcon,
  Trash as Trash2Icon,
} from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import {
  deleteScriptAction,
  duplicateScriptAction,
  renameScriptAction,
} from "@/app/(app)/_actions/studio";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { cn } from "@/lib/utils";
import { STATUS_DOT } from "../home/pipeline";
import type { ChatSummary } from "./chat-list";

export function ChatItem({
  creatorId,
  chat,
  active,
  onNavigate,
}: {
  creatorId: string;
  chat: ChatSummary;
  active: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const href = `/c/${creatorId}/studio?script=${chat.id}`;

  const rename = (title: string) =>
    start(async () => {
      setRenaming(false);
      if (!title.trim() || title.trim() === chat.title) return;
      const res = await renameScriptAction({ scriptId: chat.id, title });
      if (!res.ok) toast.error(res.message);
    });

  return (
    <div
      className={cn(
        "group/chat relative flex items-center rounded-[10px]",
        active ? "bg-surface-2" : "hover:bg-surface-2/70",
      )}
    >
      {renaming ? (
        <input
          autoFocus
          defaultValue={chat.title}
          aria-label="Chat title"
          maxLength={80}
          onBlur={(e) => rename(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") rename(e.currentTarget.value);
            if (e.key === "Escape") setRenaming(false);
          }}
          className="m-1 h-8 w-full rounded-sm border border-brand bg-surface px-2 type-body-sm focus-visible:outline-none"
        />
      ) : (
        <Link
          href={href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className="flex min-w-0 flex-1 flex-col gap-0.5 py-2 pr-8 pl-2"
        >
          <span className="truncate type-body-sm font-medium text-text">{chat.title}</span>
          <span className="flex min-w-0 items-center gap-1.5 type-caption text-muted">
            <span
              aria-hidden="true"
              className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[chat.status])}
            />
            <span className="truncate">{chat.meta}</span>
          </span>
        </Link>
      )}
      {!renaming ? (
        <Menu>
          <MenuTrigger
            aria-label={`Options for ${chat.title}`}
            disabled={pending}
            className="absolute right-1 inline-flex size-7 items-center justify-center rounded-sm text-muted opacity-0 transition-opacity group-focus-within/chat:opacity-100 group-hover/chat:opacity-100 hover:bg-surface-3 hover:text-text data-popup-open:opacity-100"
          >
            <EllipsisIcon className="size-4" />
          </MenuTrigger>
          <MenuContent align="start">
            <MenuItem onClick={() => setRenaming(true)}>
              <PencilIcon aria-hidden="true" /> Rename
            </MenuItem>
            <MenuItem
              onClick={() =>
                start(async () => {
                  const res = await duplicateScriptAction(chat.id);
                  if (res.ok) {
                    toast.success("Duplicated");
                    router.push(`/c/${creatorId}/studio?script=${res.id}`);
                  }
                })
              }
            >
              <CopyPlusIcon aria-hidden="true" /> Duplicate
            </MenuItem>
            <MenuSeparator />
            <MenuItem onClick={() => setConfirm(true)} className="text-danger [&_svg]:text-danger">
              <Trash2Icon aria-hidden="true" /> Delete
            </MenuItem>
          </MenuContent>
        </Menu>
      ) : null}
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this chat?</DialogTitle>
            <DialogDescription>
              “{chat.title}”, its script and every version will be deleted. This can&apos;t be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
            <Button
              variant="danger"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await deleteScriptAction(chat.id);
                  setConfirm(false);
                  toast.success("Chat deleted");
                  if (active) router.push(`/c/${creatorId}/studio`);
                })
              }
            >
              Delete chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
