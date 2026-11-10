import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditableText } from "@/components/app/context/editable-text";
import { BuildingStep } from "@/components/app/onboarding/building-step";
import { OnboardingFrame, StepFooter } from "@/components/app/onboarding/frame";
import { HandleStep } from "@/components/app/onboarding/handle-step";
import { InterviewStep } from "@/components/app/onboarding/interview-step";
import { PillarsStep } from "@/components/app/onboarding/pillars-step";
import { UnderstoodStep } from "@/components/app/onboarding/understood-step";
import { buttonVariants } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { requireSession } from "@/lib/auth/session";
import { getContext, getOnboarding, listTrackedAccounts, suggestedPillars } from "@/lib/db";
import { INTERVIEW, ONBOARDING_STEPS, stepIndex } from "@/lib/onboarding/steps";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Set up" };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <h2 className="type-card-title">{title}</h2>
      {children}
    </section>
  );
}

export default async function OnboardingStepPage({
  params,
  searchParams,
}: PageProps<"/onboarding/[step]">) {
  const { step } = await params;
  if (stepIndex(step) < 0) notFound();
  await requireSession();
  const sp = await searchParams;
  const ob = getOnboarding();
  const ctx = getContext();

  let body: React.ReactNode;
  if (step === "handle") {
    body = <HandleStep initial={typeof sp.handle === "string" ? sp.handle : (ob.handle ?? "")} />;
  } else if (step === "understood") {
    const v = ctx.voice;
    body = (
      <UnderstoodStep handle={ob.handle}>
        <div className="flex flex-col gap-3">
          <EditableText field="positioning" title="Who you are" value={ctx.strategy.positioning} />
          <Card title="What you post about">
            <div className="flex flex-wrap gap-2">
              {ctx.strategy.pillars.map((p) => (
                <Chip key={p.id}>{p.name}</Chip>
              ))}
            </div>
          </Card>
          <Card title="How you sound">
            <p className="type-body-sm text-muted">{v.summary}</p>
            <ul className="flex flex-col gap-1">
              {v.phrases.slice(0, 3).map((p) => (
                <li key={p} className="type-body-sm italic">
                  “{p}”
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Language">
            <p className="type-body-sm">
              {v.languageMix
                .map((l) => `${l.lang.toUpperCase()} ${Math.round(l.share * 100)}%`)
                .join(" · ")}
            </p>
          </Card>
        </div>
        <StepFooter back="/onboarding/handle">
          <Link href="/onboarding/interview?q=1" className={buttonVariants({ size: "lg" })}>
            Looks right, continue
          </Link>
        </StepFooter>
      </UnderstoodStep>
    );
  } else if (step === "interview") {
    const q = Math.min(Math.max(Number(sp.q) || 1, 1), INTERVIEW.length) - 1;
    body = <InterviewStep key={q} index={q} initial={ob.answers[INTERVIEW[q]!.key] ?? ""} />;
  } else if (step === "pillars") {
    const suggested = suggestedPillars();
    const initial = ob.pillarIds.length ? ob.pillarIds : ctx.strategy.pillars.map((p) => p.id);
    body = (
      <PillarsStep
        suggested={suggested.filter((p, i, a) => a.findIndex((x) => x.id === p.id) === i)}
        initial={initial}
      />
    );
  } else {
    const accounts = (await listTrackedAccounts()).length;
    const open = ctx.conflict.status === "open" && ctx.voiceConflict.conflict;
    body = <BuildingStep accounts={accounts} conflict={open ? ctx.voiceConflict : null} />;
  }
  return (
    <OnboardingFrame step={step as (typeof ONBOARDING_STEPS)[number]["slug"]}>
      {body}
    </OnboardingFrame>
  );
}
