import Link from "next/link";
import { Logo } from "@/components/app/shell/logo";
import { ReelRow } from "@/components/app/reel-row";
import type { Digest } from "@/lib/digest/build";
import { USUAL_VIEWS_DEFINITION } from "@/lib/outliers/baseline";

/** The Monday email as it lands in an inbox. Links go to the same pages the email will. */
export function DigestEmail({
  digest,
  creatorId,
  name,
  dateLabel,
}: {
  digest: Digest;
  creatorId: string;
  name: string;
  dateLabel: string;
}) {
  const reelHref = (code: string) => `/c/${creatorId}/reels/${code}`;
  return (
    <article className="mx-auto flex w-full max-w-[600px] flex-col gap-8 rounded-xl border border-border bg-surface p-6 sm:p-8">
      <header className="flex items-center gap-2">
        <Logo />
        <span className="type-section">Octupie</span>
        <span className="ml-auto type-caption text-muted">{dateLabel}</span>
      </header>
      <div className="flex flex-col gap-2">
        <h2 className="type-title">Your week in outliers</h2>
        <p className="type-body text-muted">
          Hi {name}.{" "}
          {digest.top.length
            ? `${digest.top.length} reels beat their creator's usual views by the most this week.`
            : "A quiet week in your niche: no new outliers."}
        </p>
      </div>
      {digest.top.length ? (
        <section className="flex flex-col gap-3">
          <h3 className="type-overline text-muted">Top outliers</h3>
          <ol className="flex flex-col gap-2">
            {digest.top.map((r, i) => (
              <li key={r.shortcode}>
                <ReelRow
                  href={reelHref(r.shortcode)}
                  leading={<span className="w-4 shrink-0 type-caption text-faint">{i + 1}</span>}
                  reel={{
                    shortcode: r.shortcode,
                    thumbnailUrl: r.thumbnailUrl,
                    hook: r.hookLine || r.caption.split("#")[0]!.trim(),
                    handle: r.ownerHandle,
                    views: r.views,
                    multiple: r.multiple,
                    usualViews: r.baseline.usualViews,
                    lowConfidence: r.baseline.lowConfidence,
                  }}
                />
              </li>
            ))}
          </ol>
          <p className="type-caption text-faint">
            × = this reel&apos;s views compared with its creator&apos;s usual views.{" "}
            {USUAL_VIEWS_DEFINITION}
          </p>
        </section>
      ) : null}
      <section className="flex flex-col gap-3">
        <h3 className="type-overline text-muted">One idea per pillar</h3>
        {digest.ideas.map((d) => (
          <div key={d.pillar.id} className="flex flex-col gap-1 rounded-[10px] bg-surface-2 p-4">
            <p className="type-caption font-medium text-brand-strong">{d.pillar.name}</p>
            <p className="type-body-sm">{d.idea}</p>
            <Link
              href={reelHref(d.reel.shortcode)}
              className="self-start type-caption font-medium underline underline-offset-2"
            >
              Open the reel and write it
            </Link>
          </div>
        ))}
        {digest.quiet.length ? (
          <p className="type-caption text-muted">
            Nothing new this week for {digest.quiet.map((p) => p.name).join(", ")}.
          </p>
        ) : null}
      </section>
      <footer className="border-t border-border pt-4 type-caption text-faint">
        You get this every Monday at 8:00. Turn it off in Settings → Notifications.
      </footer>
    </article>
  );
}
