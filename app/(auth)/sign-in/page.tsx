import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in" };

// Session depends on the runtime environment, so never prerender this page.
export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const session = await getSession();
  const { handle, plan } = await searchParams;
  // A handle from the landing page starts onboarding; otherwise go straight to the app.
  if (session && typeof handle === "string")
    redirect(`/onboarding/handle?handle=${encodeURIComponent(handle)}`);
  if (session && typeof plan === "string") redirect("/settings/billing");
  if (session) redirect(`/c/${session.defaultCreatorId}/home`);
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-4 py-16">
      <h1 className="type-title">Sign in</h1>
      <p className="type-body-sm text-muted">
        Google and email magic-link sign-in need Supabase keys. Set MOCK_MODE=true to use the demo
        account.
      </p>
      <Link href="/" className={buttonVariants({ variant: "secondary" })}>
        Back home
      </Link>
    </main>
  );
}
