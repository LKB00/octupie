import type { Metadata } from "next";
import { CancelPlan, RedeemCode } from "@/components/app/settings/billing-actions";
import { CheckoutDialog } from "@/components/app/settings/checkout-dialog";
import { SettingsCard } from "@/components/app/settings/field";
import { Button } from "@/components/ui/button";
import { billing } from "@/lib/billing";
import { PLAN_BLURB, PLAN_ORDER, perMonth, rupees } from "@/lib/billing/prices";
import { getUsage } from "@/lib/db";
import { shortDate } from "@/lib/format";
import { PLAN_LABEL, PLAN_LIMITS, type Meter } from "@/lib/quota";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Plan & billing" };

function UsageRow({ label, m }: { label: string; m: Meter }) {
  const pct = m.limit === null ? 4 : Math.min(100, (m.used / Math.max(1, m.limit)) * 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between type-caption">
        <span className="text-muted">{label}</span>
        <span>{m.limit === null ? `${m.used} used · unlimited` : `${m.used} of ${m.limit}`}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div
          className={cn("h-full bg-brand", m.atLimit && "bg-danger")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function BillingPage() {
  const u = getUsage();
  const invoices = await billing().listInvoices();
  const rank = PLAN_ORDER.indexOf(u.plan);
  return (
    <>
      <SettingsCard title={`${PLAN_LABEL[u.plan]} plan`}>
        <p className="type-body-sm text-muted">
          {u.plan === "free" ? "Usage resets" : "Renews and usage resets"} on{" "}
          {shortDate(u.renewsAt)}.
        </p>
        <UsageRow label="Breakdowns" m={u.breakdowns} />
        <UsageRow label="Scripts" m={u.scripts} />
        <UsageRow label="Chat messages" m={u.chatMessages} />
        <UsageRow label="Tracked accounts" m={u.trackedAccounts} />
        {u.plan !== "free" ? (
          <div className="border-t border-border pt-4">
            <CancelPlan label={PLAN_LABEL[u.plan]} />
          </div>
        ) : null}
      </SettingsCard>

      <div className="@container">
        <div className="grid gap-4 @2xl:grid-cols-3">
          {PLAN_ORDER.map((p, i) => {
            const l = PLAN_LIMITS[p];
            return (
              <section
                key={p}
                aria-label={`${PLAN_LABEL[p]} plan`}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border bg-surface p-5",
                  p === "pro" ? "border-brand" : "border-border",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="type-section">{PLAN_LABEL[p]}</h2>
                  {p === "pro" ? (
                    <span className="rounded-full bg-brand-weak px-2 py-0.5 type-label whitespace-nowrap text-brand-strong">
                      Most popular
                    </span>
                  ) : null}
                </div>
                <p>
                  <span className="type-stat">{rupees(perMonth(p, "monthly"))}</span>
                  <span className="type-caption text-muted"> / month</span>
                </p>
                <p className="type-caption text-muted">{PLAN_BLURB[p]}</p>
                <ul className="flex flex-1 flex-col gap-1 type-body-sm text-muted">
                  <li>{l.trackedAccounts} tracked accounts</li>
                  <li>{l.breakdowns} breakdowns a month</li>
                  <li>
                    {l.scripts === null
                      ? "Unlimited scripts (fair use)"
                      : `${l.scripts} scripts a month`}
                  </li>
                  <li>{l.chatMessages} chat messages</li>
                </ul>
                {u.plan === p ? (
                  <Button variant="secondary" disabled>
                    Current plan
                  </Button>
                ) : p === "free" ? (
                  <CancelPlan label={PLAN_LABEL[u.plan]} />
                ) : (
                  <CheckoutDialog plan={p} label={PLAN_LABEL[p]} upgrade={i > rank} />
                )}
              </section>
            );
          })}
        </div>
      </div>

      <SettingsCard title="Invoices">
        {invoices.length ? (
          <div className="-mx-1 overflow-x-auto px-1">
            <table className="w-full min-w-[420px] type-body-sm">
              <thead>
                <tr className="text-left type-caption text-muted">
                  <th scope="col" className="py-2 font-medium">
                    Date
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Number
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Plan
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Amount
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-2.5">{shortDate(inv.date)}</td>
                    <td className="py-2.5 type-mono">{inv.number}</td>
                    <td className="py-2.5">
                      {PLAN_LABEL[inv.plan]} · {inv.billing === "annual" ? "annual" : "monthly"}
                    </td>
                    <td className="py-2.5 text-right type-number">{rupees(inv.amount)}</td>
                    <td className="py-2.5 text-right text-success">Paid</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="type-body-sm text-muted">
            No invoices yet. They appear here after your first payment, with a PDF from Paddle.
          </p>
        )}
        <div className="border-t border-border pt-4">
          <RedeemCode />
        </div>
      </SettingsCard>
    </>
  );
}
