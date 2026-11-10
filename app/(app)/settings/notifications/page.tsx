import type { Metadata } from "next";
import Link from "next/link";
import { EnvelopeSimple as MailIcon } from "@phosphor-icons/react/dist/ssr";
import { NotificationToggles } from "@/components/app/settings/notification-toggles";
import { SettingsCard } from "@/components/app/settings/field";
import { buttonVariants } from "@/components/ui/button";
import { getPrefs } from "@/lib/db";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <SettingsCard title="Notifications">
      <NotificationToggles prefs={{ ...getPrefs() }} />
      <Link
        href="/settings/notifications/digest"
        className={`${buttonVariants({ variant: "secondary", size: "sm" })} self-start`}
      >
        <MailIcon aria-hidden="true" /> Preview this week&apos;s email
      </Link>
    </SettingsCard>
  );
}
