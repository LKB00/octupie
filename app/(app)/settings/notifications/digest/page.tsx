import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft as ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { DigestEmail } from "@/components/app/digest/digest-email";
import { requireSession } from "@/lib/auth/session";
import { now } from "@/lib/clock";
import { getContext, getFeed, getPrefs } from "@/lib/db";
import { buildDigest } from "@/lib/digest/build";
import { shortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Weekly email preview" };

export default async function DigestPreviewPage() {
  const session = await requireSession();
  const at = now();
  const reels = await getFeed({
    sort: "multiple",
    window: 7,
    format: "all",
    pillar: null,
    account: null,
    minMultiple: 2,
  }).catch(() => []);
  const digest = buildDigest(
    reels,
    getContext().strategy.pillars,
    new Date(at.getTime() - 7 * 86_400_000),
  );
  const on = getPrefs().weeklyEmail;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/settings/notifications"
          className="inline-flex items-center gap-1.5 self-start type-body-sm text-muted hover:text-text"
        >
          <ArrowLeftIcon aria-hidden="true" className="size-4" /> Notifications
        </Link>
        <p className="type-body-sm text-muted">
          {on
            ? "This is what Monday's email would look like with this week's data."
            : "The weekly email is off. This is what it would look like if you turn it on."}
        </p>
      </div>
      <DigestEmail
        digest={digest}
        creatorId={session.defaultCreatorId}
        name={session.user.name}
        dateLabel={shortDate(at.toISOString())}
      />
    </div>
  );
}
