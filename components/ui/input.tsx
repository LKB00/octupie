import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  [
    "type-body-sm w-full min-w-0 border border-border bg-surface text-text",
    "placeholder:text-faint transition-[border-color,box-shadow] duration-150 ease-out outline-none",
    "hover:border-border-strong focus-visible:border-brand focus-visible:shadow-glow",
    "disabled:cursor-not-allowed disabled:bg-surface-2 disabled:opacity-60",
    "aria-invalid:border-danger aria-invalid:focus-visible:shadow-[0_0_0_4px_var(--danger-bg)]",
  ],
  {
    variants: {
      variant: {
        default: "h-10 rounded-[10px] px-3",
        hero: "h-12 rounded-md px-4 type-body",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

type InputProps = React.ComponentProps<"input"> & VariantProps<typeof inputVariants>;

function Input({ className, variant, type, ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Input, inputVariants };
