import { compactNumber } from "@/lib/format";
import { formatMultiple } from "@/lib/outliers/multiple";
import { cn } from "@/lib/utils";
import { AppIcon } from "./icons";
import { UsualTooltip } from "./usual-tooltip";

type Props = {
  multiple: number | null;
  usualViews: number | null;
  own?: boolean;
  lowConfidence?: boolean;
  className?: string;
};

/** "3.4×" pill; hot from 10×. Focus or hover shows the usual-views definition. */
export function MultipleBadge({ multiple, usualViews, own, lowConfidence, className }: Props) {
  if (multiple === null) return null;
  const hot = multiple >= 10;
  const text = formatMultiple(multiple);
  return (
    <UsualTooltip own={own} lowConfidence={lowConfidence}>
      <button
        type="button"
        aria-label={`${text} ${own ? "your" : "their"} usual views of ${compactNumber(usualViews)}. What's usual?`}
        className={cn(
          "inline-flex h-6 cursor-help items-center gap-1 rounded-full px-2 type-caption tabular-nums",
          hot ? "bg-hot text-on-hot" : "bg-glass text-on-hot backdrop-blur-md",
          className,
        )}
      >
        <AppIcon.multiple aria-hidden="true" className="size-3" />
        {text}
      </button>
    </UsualTooltip>
  );
}
