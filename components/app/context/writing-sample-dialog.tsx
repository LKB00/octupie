"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addWritingSampleAction } from "@/app/(app)/_actions/context";
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

/** Paste something you wrote; the voice is rebuilt and saved as a new version. */
export function WritingSampleDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setError(null);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a writing sample</DialogTitle>
          <DialogDescription>
            Paste a LinkedIn post, newsletter or talk notes about the topics you want to sell. We
            update your voice and keep the old one as a version you can restore. Free.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sample" className="type-label">
            Your writing
          </label>
          <textarea
            id="sample"
            rows={7}
            value={text}
            maxLength={5000}
            onChange={(e) => setText(e.target.value)}
            aria-describedby="sample-help"
            className="w-full rounded-[10px] border border-border bg-surface p-3 type-body-sm focus-visible:border-brand focus-visible:shadow-glow focus-visible:outline-none"
          />
          <p
            id="sample-help"
            className={error ? "type-caption text-danger" : "type-caption text-muted"}
          >
            {error ?? `${words} words · 40 characters minimum`}
          </p>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
          <Button
            disabled={pending || text.trim().length < 40}
            onClick={() =>
              start(async () => {
                const res = await addWritingSampleAction(text);
                if (!res.ok) return setError(res.message);
                setText("");
                onOpenChange(false);
                toast.success("Voice updated. The previous version is saved under Versions.");
              })
            }
          >
            {pending ? "Updating voice…" : "Update my voice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
