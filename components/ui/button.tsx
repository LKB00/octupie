import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Buttons (docs/04 §4). Primary = brand, dark = ink for hero moments, secondary = quiet
 * outline, ghost = toolbar. The cost of a paid action shows inside the button as a pill.
 */
const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap select-none",
    "type-body-sm font-medium transition-[background-color,color,box-shadow,border-color,transform] duration-150 ease-out",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        primary: "bg-brand text-on-brand hover:bg-brand-hover",
        dark: "bg-edge text-bg hover:opacity-90",
        secondary:
          "border border-border bg-surface text-text hover:border-border-strong hover:bg-surface-2",
        ghost: "text-muted hover:bg-surface-2 hover:text-text",
        danger: "bg-danger text-on-brand hover:opacity-90",
      },
      size: {
        md: "h-10 rounded-[10px] px-4",
        sm: "h-8 rounded-sm px-3 type-label",
        lg: "h-11 rounded-md px-5 type-body font-medium",
        icon: "size-10 rounded-[10px]",
        "icon-sm": "size-8 rounded-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /** What the click spends, shown before the click, e.g. "uses 1 breakdown". */
    cost?: string;
  };

function CostPill({ cost, variant }: { cost: string; variant: ButtonProps["variant"] }) {
  const onFill =
    variant === "primary" || variant === "dark" || variant === "danger" || variant === undefined;
  return (
    <span
      data-slot="button-cost"
      className={cn(
        "-mr-1 inline-flex h-5 items-center rounded-full px-2 type-caption font-medium",
        onFill ? "bg-on-media/20 text-current" : "bg-surface-3 text-muted",
      )}
    >
      <span className="sr-only">·</span> {cost}
    </span>
  );
}

function Button({ className, variant, size, cost, children, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {cost ? " " : null}
      {cost ? <CostPill cost={cost} variant={variant} /> : null}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants, type ButtonProps };
