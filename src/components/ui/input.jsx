import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, error, success, ...props }, ref) => {
  const stateClasses = error
    ? "border-semantic-danger focus-visible:border-semantic-danger focus-visible:shadow-focus"
    : success
    ? "border-semantic-success focus-visible:border-semantic-success focus-visible:shadow-focus"
    : "border-neutral-200 focus-visible:border-brand-primary focus-visible:shadow-focus";

  const input = (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border bg-background px-3 py-2 font-body text-sm placeholder:text-muted-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        stateClasses,
        className
      )}
      ref={ref}
      {...props} />
  );

  if (!error && !success) return input;

  return (
    <div className="w-full">
      {input}
      {error && <p className="mt-1 font-body text-xs text-semantic-danger">{error}</p>}
      {success && !error && (
        <p className="mt-1 font-body text-xs text-semantic-success">{success}</p>
      )}
    </div>
  );
})
Input.displayName = "Input"

export { Input }
