import type { Metadata } from "next";
import { Field, SettingsCard } from "@/components/app/settings/field";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Account" };

export default async function ProfilePage() {
  const session = await requireSession();
  return (
    <>
      <SettingsCard title="Account">
        <Field id="name" label="Name" defaultValue={session.user.name} />
        <Field
          id="email"
          label="Email"
          type="email"
          defaultValue={session.user.email}
          disabled
          hint="You sign in with this address. Changing it arrives with real sign-in."
        />
        <Field
          id="tz"
          label="Time zone"
          defaultValue="Asia/Kolkata"
          hint="Your weekly email arrives Monday at 08:00 in this time zone."
        />
        <Button className="self-start" disabled>
          Save changes
        </Button>
      </SettingsCard>
      <SettingsCard title="Set up again">
        <p className="type-body-sm text-muted">
          Re-run onboarding: check your handle, answer the five questions and pick pillars again.
          Your scripts and saved reels stay.
        </p>
        <Link
          href="/onboarding/handle"
          className={`${buttonVariants({ variant: "secondary" })} self-start`}
        >
          Start setup
        </Link>
      </SettingsCard>
    </>
  );
}
