import "server-only";
import { notFound, redirect } from "next/navigation";
import { getCreator } from "@/lib/db/creators";
import { store } from "@/lib/db/mock-store";
import { isMockMode } from "@/lib/env";

export type Session = {
  user: { id: string; email: string; name: string };
  defaultCreatorId: string;
};

/**
 * In MOCK_MODE everyone is signed in as the fixture creator. Supabase Auth (Google + magic
 * link) replaces this once real keys exist; until then non-mock mode has no session.
 */
export async function getSession(): Promise<Session | null> {
  if (!isMockMode()) return null;
  const c = store().creator;
  return {
    user: { id: "u_demo", email: "demo@octupie.test", name: c.displayName },
    defaultCreatorId: c.id,
  };
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}

/** Resolve the creator in the URL, or 404 if the user can't see it. */
export async function requireCreator(creatorId: string) {
  await requireSession();
  const creator = getCreator(creatorId);
  if (!creator) notFound();
  return creator;
}
