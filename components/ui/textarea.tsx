import * as React from 'react';
import { cn } from '@/lib/utils';

const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'min-h-[120px] w-full rounded-lg border border-k-border bg-k-surface px-3 py-2 text-sm text-k-text placeholder:text-k-muted/60 focus-visible:border-k-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-k-accent/20',
      className,
    )}
    {...props}
  />
));
TextArea.displayName = 'TextArea';
export { TextArea };
