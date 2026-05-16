import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-9 w-full rounded-lg border border-k-border bg-k-surface px-3 py-2 text-sm text-k-text placeholder:text-k-muted/60 focus-visible:border-k-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-k-accent/20',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';
export { Input };
