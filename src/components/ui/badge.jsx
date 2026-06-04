import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-body text-[11px] font-medium transition-colors focus:outline-none focus-visible:shadow-focus",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand-primary text-white",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-semantic-danger text-white",
        outline: "text-foreground",
        // Design System Rose Rabelo — status
        success: "border-transparent bg-semantic-success/10 text-semantic-success",
        warning: "border-transparent bg-semantic-warning/10 text-semantic-warning",
        danger: "border-transparent bg-semantic-danger/10 text-semantic-danger",
        neutral:
          "border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  dot = false,
  children,
  ...props
}) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </div>
  );
}

export { Badge, badgeVariants }
