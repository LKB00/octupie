import Link from "next/link";
import { ArrowLeft as ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/app/shell/logo";
import { buttonVariants } from "@/components/ui/button";
import { ONBOARDING_STEPS, stepIndex } from "@/lib/onboarding/steps";
import { cn } from "@/lib/utils";

/** Full-screen onboarding shell: logo, "Step 2 of 5", a segmented progress bar, one column. */
export function OnboardingFrame({ step, children }: { step: string; children: React.ReactNode }) {
  const i = stepIndex(step);
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="flex items-center gap-4 px-4 py-4 sm:px-8">
        <span className="flex items-center gap-2">
          <Logo />
          <span className="type-section max-sm:sr-only">Octupie</span>
        </span>
        <p className="type-caption text-muted">
          Step {i + 1} of {ONBOARDING_STEPS.length}
          <span className="max-sm:sr-only"> · {ONBOARDING_STEPS[i]?.label}</span>
        </p>
        <ol aria-hidden="true" className="ml-auto flex w-32 gap-1 sm:w-48">
          {ONBOARDING_STEPS.map((s, j) => (
            <li
              key={s.slug}
              className={cn("h-1 flex-1 rounded-full", j <= i ? "bg-brand" : "bg-surface-3")}
            />
          ))}
        </ol>
      </header>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-4 pt-6 pb-16 sm:pt-12">
        {children}
      </main>
    </div>
  );
}

export function StepTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="type-title text-balance">{title}</h1>
      {sub ? <p className="type-body text-muted">{sub}</p> : null}
    </div>
  );
}

/** Back on the left, the step's own primary action on the right. */
export function StepFooter({ back, children }: { back?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border pt-6">
      {back ? (
        <Link href={back} className={buttonVariants({ variant: "ghost" })}>
          <ArrowLeftIcon aria-hidden="true" /> Back
        </Link>
      ) : (
        <span />
      )}
      <div className="flex gap-2">{children}</div>
    </div>
  );
}
