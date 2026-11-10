import { PageHeader } from "@/components/app/page-header";
import { SettingsNav } from "@/components/app/settings/settings-nav";

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Settings" />
      <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8">
        <SettingsNav />
        <div className="flex max-w-3xl min-w-0 flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}
