import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getJobStatus } from "@/lib/jobs/analyse";

/** Progress for a reel/analyse job; the reel page polls this. */
export async function GET(_req: Request, ctx: RouteContext<"/api/jobs/[id]">) {
  if (!(await getSession())) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { id } = await ctx.params;
  if (
    !z
      .string()
      .regex(/^job_[a-z0-9]+$/)
      .safeParse(id).success
  ) {
    return NextResponse.json({ error: "Unknown job." }, { status: 400 });
  }
  const status = await getJobStatus(id);
  if (!status) return NextResponse.json({ error: "Unknown job." }, { status: 404 });
  return NextResponse.json(status, { headers: { "Cache-Control": "no-store" } });
}
