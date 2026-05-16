'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';
import { cn } from '@/lib/utils';

export type SimpleSliderProps = React.ComponentProps<typeof SliderPrimitive.Root> & {
  readonly thumbs?: 1 | 2;
};

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SimpleSliderProps
>(({ className, thumbs = 1, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center py-4', className)}
    minStepsBetweenThumbs={props.minStepsBetweenThumbs ?? (thumbs === 2 ? 1 : 0)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-px flex-1 bg-k-border">
      <SliderPrimitive.Range className="absolute h-full bg-k-accent" />
    </SliderPrimitive.Track>
    {Array.from({ length: thumbs === 2 ? 2 : 1 }).map((__, idx) => (
      <SliderPrimitive.Thumb
        key={`thumb_${idx}`}
        className="block size-4 rounded-full border-2 border-k-accent bg-k-surface focus:outline-none focus:ring-2 focus:ring-k-accent/40"
      />
    ))}
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;
