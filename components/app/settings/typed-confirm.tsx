"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

/** Destructive action that needs the user to type a word to confirm. */
export function TypedConfirm({
  label,
  word,
  description,
}: {
  label: string;
  word: string;
  description: string;
}) {
  const [value, setValue] = useState("");
  return (
    <Dialog onOpenChange={() => setValue("")}>
      <DialogTrigger
        render={<Button variant="secondary" className="self-start border-danger text-danger" />}
      >
        {label}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}?</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <label className="flex flex-col gap-1.5 type-label">
          Type <span className="type-mono">{word}</span> to confirm
          <Input value={value} onChange={(e) => setValue(e.target.value)} autoComplete="off" />
        </label>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
          <DialogClose
            render={<Button variant="danger" disabled={value !== word} />}
            onClick={() => toast.info("Deleting is disabled in mock mode.")}
          >
            {label}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
