import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const tileVariants = cva("inline-flex shrink-0 items-center justify-center", {
  variants: {
    tone: {
      violet: "bg-tint-violet-bg text-tint-violet",
      amber: "bg-tint-amber-bg text-tint-amber",
      sky: "bg-tint-sky-bg text-tint-sky",
      rose: "bg-tint-rose-bg text-tint-rose",
      mint: "bg-tint-mint-bg text-tint-mint",
      neutral: "bg-surface-3 text-muted",
    },
    size: {
      sm: "size-8 rounded-sm [&_svg]:size-4",
      md: "size-10 rounded-[10px] [&_svg]:size-5",
      lg: "size-12 rounded-md [&_svg]:size-6",
    },
  },
  defaultVariants: { tone: "violet", size: "md" },
});

/** Tinted square that holds an icon: the product's main decorative device. */
function IconTile({
  className,
  tone,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof tileVariants>) {
  return (
    <span aria-hidden="true" className={cn(tileVariants({ tone, size }), className)} {...props} />
  );
}

export { IconTile };
