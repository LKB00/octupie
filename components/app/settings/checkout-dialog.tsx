"use client";

import { useState, useTransition } from "react";
import { LockSimple as LockIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { checkoutAction } from "@/app/(app)/_actions/billing";
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
import { SegmentedControl } from "@/components/ui/segmented-control";
import { type Billing, chargeFor, perMonth, rupees } from "@/lib/billing/prices";

/**
 * Stand-in for Paddle's checkout overlay: shows exactly what will be charged before the click.
 * With real keys this button opens Paddle instead and a webhook sets the plan.
 */
export function CheckoutDialog({
  plan,
  label,
  upgrade,
}: {
  plan: "creator" | "pro";
  label: string;
  upgrade: boolean;
}) {
  const [period, setPeriod] = useState<Billing>("monthly");
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const total = chargeFor(plan, period);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={upgrade ? "primary" : "secondary"} />}>
        {upgrade ? `Upgrade to ${label}` : `Switch to ${label}`}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label} plan</DialogTitle>
          <DialogDescription>
            Your new limits apply as soon as payment goes through.
          </DialogDescription>
        </DialogHeader>
        <SegmentedControl
          aria-label="Billing period"
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "annual", label: "Annual · 2 months free" },
          ]}
          value={period}
          onValueChange={setPeriod}
        />
        <dl className="flex flex-col gap-2 rounded-xl bg-surface-2 p-4 type-body-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Price</dt>
            <dd>{rupees(perMonth(plan, period))} / month</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Billed</dt>
            <dd>{period === "annual" ? "Once a year" : "Every month"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-2 type-label">
            <dt>Due today</dt>
            <dd className="type-number">{rupees(total)}</dd>
          </div>
        </dl>
        <p className="flex items-start gap-2 type-caption text-muted">
          <LockIcon aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          Demo mode: no card is needed and nothing is charged. Cancel any time; full refund within 7
          days of your first payment.
        </p>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
          <Button
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await checkoutAction({ plan, billing: period });
                if (!res.ok) return void toast.error(res.message);
                setOpen(false);
                toast.success(
                  `You're on ${label}. Receipt ${res.invoice.number} is under Invoices.`,
                );
              })
            }
          >
            {pending ? "Processing…" : `Pay ${rupees(total)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
