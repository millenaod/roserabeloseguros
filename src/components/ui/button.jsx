import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-body text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Design System Rose Rabelo
        default: "bg-brand-primary text-white hover:bg-brand-hover",
        primary: "bg-brand-primary text-white hover:bg-brand-hover",
        secondary:
          "border border-brand-primary bg-transparent text-brand-primary hover:bg-brand-tint",
        ghost: "hover:bg-brand-tint hover:text-brand-primary",
        danger: "bg-neutral-800 text-white hover:bg-neutral-900",
        destructive:
          "bg-semantic-danger text-white hover:bg-brand-hover",
        outline:
          "border border-input bg-background hover:bg-brand-tint hover:text-brand-primary",
        link: "text-brand-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        md: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
