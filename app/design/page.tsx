import type { Metadata } from "next";
import { ColorTokens } from "@/components/design/color-tokens";
import { Foundations } from "@/components/design/foundations";
import { DesignSection } from "@/components/design/section";
import { ButtonsShowcase, ChipsShowcase, InputsShowcase } from "@/components/design/showcase-controls";
import {
  CardShowcase,
  DialogShowcase,
  SkeletonShowcase,
  ToastShowcase,
} from "@/components/design/showcase-surfaces";
import { ThemeSwitcher } from "@/components/design/theme-switcher";
import { TypeScale } from "@/components/design/type-scale";
import { Chip } from "@/components/ui/chip";
import { isMockMode } from "@/lib/env";

export const metadata: Metadata = { title: "Design system" };

export default function DesignPage() {
  const mock = isMockMode();
  return (
    <main className="mx-auto flex w-full max-w-(--content-max) flex-col gap-12 px-4 py-10 md:px-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <p className="type-label text-muted">Octupie</p>
            {mock ? <Chip className="bg-warning-bg text-warning">Mock mode</Chip> : null}
          </div>
          <h1 className="type-title">Design system</h1>
          <p className="type-body-sm max-w-prose text-muted">
            Every token, the type scale and the core components. Switch the theme to check light and
            dark. Values come from design/tokens.css.
          </p>
        </div>
        <ThemeSwitcher />
      </header>

      <DesignSection id="colour" title="Colour" description="Resolved values for the current theme.">
        <ColorTokens />
      </DesignSection>
      <DesignSection id="type" title="Type scale">
        <TypeScale />
      </DesignSection>
      <DesignSection id="foundations" title="Space, radius, elevation, motion">
        <Foundations />
      </DesignSection>
      <DesignSection id="buttons" title="Button">
        <ButtonsShowcase />
      </DesignSection>
      <DesignSection id="input" title="Input">
        <InputsShowcase />
      </DesignSection>
      <DesignSection id="chips" title="Chip and segmented control">
        <ChipsShowcase />
      </DesignSection>
      <DesignSection id="card" title="Card" description="The second card shows its loading state.">
        <CardShowcase />
      </DesignSection>
      <DesignSection id="dialog" title="Dialog">
        <DialogShowcase />
      </DesignSection>
      <DesignSection id="toast" title="Toast">
        <ToastShowcase />
      </DesignSection>
      <DesignSection id="skeleton" title="Skeleton" description="1.2s shimmer; static with reduced motion.">
        <SkeletonShowcase />
      </DesignSection>
    </main>
  );
}
