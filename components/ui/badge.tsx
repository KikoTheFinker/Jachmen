import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

const tone = {
  sale:  'text-k-accent border-k-accent/40  bg-k-accent/10',
  own:   'text-k-muted  border-k-border     bg-k-surface',
  pulse: 'text-k-red    border-k-red/40     bg-k-red/10',
} satisfies Record<string, string>;

export function Badge({
  className,
  toneKey,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { toneKey: keyof typeof tone }) {
  return (
    <span
      {...rest}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tone[toneKey],
        className,
      )}
    />
  );
}
