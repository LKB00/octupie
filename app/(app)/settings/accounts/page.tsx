import type { Metadata } from "next";
import { IgAvatar } from "@/components/app/ig/ig-avatar";
import { SettingsCard } from "@/components/app/settings/field";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import { getCreator } from "@/lib/db";

export const metadata: Metadata = { title: "Linked accounts" };

export default async function AccountsPage() {
  const session = await requireSession();
  const creator = getCreator(session.defaultCreatorId)!;
  return (
    <SettingsCard title="Linked accounts">
      <div className="flex items-center gap-3 rounded-md border border-border p-3">
        <IgAvatar src={creator.avatarUrl} size={40} />
        <div className="min-w-0 flex-1">
          <p className="type-body-sm">
            <span className="font-semibold">{creator.igHandle}</span>{" "}
            <span className="text-muted">· Instagram</span>
          </p>
          <p className="type-caption text-muted">Public reels read for Your reels and your voice</p>
        </div>
        <Button variant="secondary" size="sm" disabled>
          Disconnect
        </Button>
      </div>
      <div className="flex items-center gap-3 rounded-md border border-dashed border-border-strong p-3">
        <p className="flex-1 type-body-sm text-muted">Google sign-in</p>
        <Button variant="secondary" size="sm" disabled>
          Connect
        </Button>
      </div>
    </SettingsCard>
  );
}
