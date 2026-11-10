"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Specimen } from "./section";

export function CardShowcase() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Why it worked</CardTitle>
          <CardDescription>Card / panel: surface, radius md, 1px border, soft lift.</CardDescription>
        </CardHeader>
        <CardContent className="text-muted">
          The first line names a mistake the viewer is making right now, then promises the fix in
          under 20 seconds.
        </CardContent>
        <CardFooter>
          <Button size="sm" variant="secondary">
            Copy hook
          </Button>
        </CardFooter>
      </Card>
      <Card aria-busy="true" aria-label="Loading card">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-40 w-full" />
      </Card>
    </div>
  );
}

export function DialogShowcase() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" className="self-start" />}>
        Open dialog
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write your version</DialogTitle>
          <DialogDescription>
            We&apos;ll write a script from this reel&apos;s structure in your voice. It&apos;s saved to
            Scripts automatically.
          </DialogDescription>
        </DialogHeader>
        <p className="type-body-sm text-muted">
          Focus stays inside this dialog. Press Escape or Cancel to close it.
        </p>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
          <DialogClose render={<Button cost="uses 1 script" />}>Write my version</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ToastShowcase() {
  return (
    <Specimen label="Auto-dismiss after 4s; hover to pause">
      <Button variant="secondary" onClick={() => toast.success("Breakdown ready · 3 left this month")}>
        Success
      </Button>
      <Button variant="secondary" onClick={() => toast.info("Tracking started. New reels appear within a day.")}>
        Info
      </Button>
      <Button variant="secondary" onClick={() => toast.warning("1 breakdown left this month")}>
        Warning
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.error("Couldn't load this account's reels", {
            description: "Instagram didn't respond. Try again in a minute.",
            action: { label: "Retry", onClick: () => toast.success("Reels loaded") },
          })
        }
      >
        Error with retry
      </Button>
    </Specimen>
  );
}

export function SkeletonShowcase() {
  return (
    <div aria-busy="true" aria-label="Loading reels" className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex flex-col gap-3 border border-border p-2.5">
          <Skeleton className="aspect-9/16 w-full rounded-none" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
