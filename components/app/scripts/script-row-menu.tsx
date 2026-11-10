"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Copy as CopyIcon,
  CopySimple as CopyPlusIcon,
  DownloadSimple as DownloadIcon,
  DotsThree as EllipsisIcon,
  PenNib as PenLineIcon,
  Trash as Trash2Icon,
} from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { deleteScriptAction, duplicateScriptAction } from "@/app/(app)/_actions/studio";
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

/** Open · Duplicate · Copy · Export .txt · Delete (with confirm). */
export function ScriptRowMenu({
  id,
  title,
  text,
  studioHref,
}: {
  id: string;
  title: string;
  text: string;
  studioHref: string;
}) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <Menu>
        <MenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${title}`} />}
        >
          <EllipsisIcon />
        </MenuTrigger>
        <MenuContent>
          <MenuItem onClick={() => router.push(studioHref)}>
            <PenLineIcon aria-hidden="true" /> Open in Studio
          </MenuItem>
          <MenuItem
            onClick={() =>
              start(async () => {
                const res = await duplicateScriptAction(id);
                if (res.ok) toast.success("Duplicated. The copy is a Draft.");
              })
            }
          >
            <CopyPlusIcon aria-hidden="true" /> Duplicate
          </MenuItem>
          <MenuItem
            onClick={async () => {
              await navigator.clipboard.writeText(text).catch(() => undefined);
              toast.success("Copied to clipboard");
            }}
          >
            <CopyIcon aria-hidden="true" /> Copy to clipboard
          </MenuItem>
          <MenuItem
            onClick={() => {
              const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
              const a = document.createElement("a");
              a.href = url;
              a.download = `${title.replace(/[^\w\- ]+/g, "").trim() || "script"}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <DownloadIcon aria-hidden="true" /> Export .txt
          </MenuItem>
          <MenuSeparator />
          <MenuItem onClick={() => setConfirm(true)} className="text-danger [&_svg]:text-danger">
            <Trash2Icon aria-hidden="true" /> Delete
          </MenuItem>
        </MenuContent>
      </Menu>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this script?</DialogTitle>
            <DialogDescription>
              “{title}” and all its versions will be deleted. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
            <Button
              disabled={pending}
              variant="danger"
              onClick={() =>
                start(async () => {
                  await deleteScriptAction(id);
                  setConfirm(false);
                  toast.success("Script deleted");
                })
              }
            >
              Delete script
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
