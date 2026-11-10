import {
  BookOpen as BookOpenIcon,
  Megaphone as MegaphoneIcon,
  Scissors as ScissorsIcon,
  User as UserRoundIcon,
  MagicWand as WandSparklesIcon,
  Lightning as ZapIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon as LucideIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const ICONS: [RegExp, LucideIcon][] = [
  [/short|cut|trim/i, ScissorsIcon],
  [/hook|open/i, MegaphoneIcon],
  [/like me|voice|my /i, UserRoundIcon],
  [/story|example/i, BookOpenIcon],
  [/punch|energy|bold/i, ZapIcon],
];

export const iconFor = (label: string) =>
  ICONS.find(([re]) => re.test(label))?.[1] ?? WandSparklesIcon;

/** Outlined icon + text buttons; one tap sends that request. */
export function SuggestionChips({
  items,
  onPick,
  disabled,
  className,
}: {
  items: readonly string[];
  onPick: (text: string) => void;
  disabled: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((s) => {
        const Icon = iconFor(s);
        return (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onPick(s)}
            className="inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-border bg-surface px-2.5 type-label whitespace-nowrap text-text transition-colors hover:border-border-strong hover:bg-surface-2 disabled:opacity-50"
          >
            <Icon aria-hidden="true" className="size-3.5 text-muted" />
            {s}
          </button>
        );
      })}
    </div>
  );
}
