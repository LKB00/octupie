import type { Metadata } from "next";
import { DemoControls } from "@/components/app/settings/demo-controls";
import { SettingsCard } from "@/components/app/settings/field";
import { TypedConfirm } from "@/components/app/settings/typed-confirm";
import { store } from "@/lib/db/mock-store";
import { isMockMode } from "@/lib/env";

export const metadata: Metadata = { title: "Danger zone" };

export default function DangerPage() {
  return (
    <>
      {isMockMode() ? (
        <SettingsCard title="Demo controls">
          <DemoControls feedFails={store().feedFails} />
        </SettingsCard>
      ) : null}
      <SettingsCard title="Danger zone">
        <TypedConfirm
          label="Delete creator"
          word="demo.creator"
          description="Deletes this creator's scripts, context, voice, samples and threads. This can't be undone."
        />
        <TypedConfirm
          label="Delete account"
          word="delete"
          description="Deletes your account, every creator and all their data. This can't be undone."
        />
      </SettingsCard>
    </>
  );
}
