"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { cancelPlanAction, redeemCodeAction } from "@/app/(app)/_actions/billing";
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

export function CancelPlan({ label }: { label: string }) {
  const [pending, start] = useTransition();
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>Move to Free</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel {label}?</DialogTitle>
          <DialogDescription>
            You move to the Free plan and its limits. Your scripts, saved reels and context stay.
            Tracked accounts over the Free limit are paused, not deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>Keep {label}</DialogClose>
          <DialogClose
            render={<Button variant="danger" disabled={pending} />}
            onClick={() =>
              start(async () => {
                await cancelPlanAction();
                toast.success("You're on the Free plan now.");
              })
            }
          >
            Cancel plan
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RedeemCode() {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await redeemCodeAction(code);
          setMsg({ ok: res.ok, text: res.message });
          if (res.ok) setCode("");
        });
      }}
    >
      <label htmlFor="redeem" className="type-label">
        Redeem a code
      </label>
      <div className="flex gap-2">
        <Input
          id="redeem"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setMsg(null);
          }}
          placeholder="e.g. OCTUPIE-CREATOR"
          autoComplete="off"
          className="h-9 max-w-64"
          aria-describedby="redeem-msg"
        />
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          className="h-9"
          disabled={pending || code.trim().length < 3}
        >
          Apply
        </Button>
      </div>
      <p
        id="redeem-msg"
        role={msg && !msg.ok ? "alert" : undefined}
        className={
          msg
            ? msg.ok
              ? "type-caption text-success"
              : "type-caption text-danger"
            : "type-caption text-muted"
        }
      >
        {msg?.text ?? "Gift and partner codes. Demo codes: OCTUPIE-CREATOR, OCTUPIE-PRO."}
      </p>
    </form>
  );
}
