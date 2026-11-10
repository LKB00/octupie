import { Tooltip } from "@/components/ui/tooltip";
import { USUAL_VIEWS_DEFINITION, YOUR_USUAL_VIEWS_DEFINITION } from "@/lib/outliers/baseline";

/** The one definition of "usual views", shown wherever a multiple appears (CLAUDE.md rule 1). */
export function UsualTooltip({
  children,
  own = false,
  lowConfidence = false,
}: {
  children: React.ReactElement<Record<string, unknown>>;
  own?: boolean;
  lowConfidence?: boolean;
}) {
  const definition = own ? YOUR_USUAL_VIEWS_DEFINITION : USUAL_VIEWS_DEFINITION;
  return (
    <Tooltip
      content={
        <>
          {definition}
          {lowConfidence ? " Based on fewer than 8 reels, so treat it as a rough guide." : null}
        </>
      }
    >
      {children}
    </Tooltip>
  );
}
