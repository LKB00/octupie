import "server-only";
import { store } from "./mock-store";
import type { Creator } from "./types";

export function getCreator(id: string): Creator | null {
  const c = store().creator;
  return c.id === id ? c : null;
}

export function pillarName(id: string | null): string | null {
  if (!id) return null;
  return store().creator.strategy.pillars.find((p) => p.id === id)?.name ?? null;
}
