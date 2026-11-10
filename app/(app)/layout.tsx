import { notFound } from "next/navigation";
import { AppShell } from "@/components/app/shell/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { requireSession } from "@/lib/auth/session";
import { getCreator } from "@/lib/db";

// The mock store is mutable and per-process, so every signed-in page renders per request.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await requireSession();
  const creator = getCreator(session.defaultCreatorId);
  if (!creator) notFound();
  return (
    <TooltipProvider>
      <AppShell session={session} creator={creator}>
        {children}
      </AppShell>
    </TooltipProvider>
  );
}
