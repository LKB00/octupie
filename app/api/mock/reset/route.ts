import { NextResponse } from "next/server";
import { resetStore } from "@/lib/db";
import { isMockMode } from "@/lib/env";

/** Mock-only: reset the in-memory store to the fixtures (used by Playwright). */
export async function POST() {
  if (!isMockMode()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  resetStore();
  return NextResponse.json({ ok: true });
}
