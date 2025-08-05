import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      size: {
        default: "h-9",
        sm: "h-8 text-sm",
        lg: "h-10 text-base",
      },
      variant: {
        default: "",
        destructive: "border-destructive focus-visible:ring-destructive/50",
        success: "border-success focus-visible:ring-success/50",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface InputProps extends React.ComponentProps<"input">, VariantProps<typeof inputVariants> {
  /**
   * Error state for validation feedback
   */
  error?: boolean
  /**
   * Success state for validation feedback
   */
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, variant, error, success, ...props }, ref) => {
    // Auto-set variant based on validation states
    const computedVariant = error ? 'destructive' : success ? 'success' : variant
    
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(inputVariants({ size, variant: computedVariant, className }))}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
