'use client';

import { useInView } from 'framer-motion';
import * as React from 'react';

function useTicker(target: number, active: boolean): number {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    const duration = 900;
    const start = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / duration);
      setValue(Math.floor(target * (0.3 + p * 0.7)));
      if (p < 1) requestAnimationFrame(tick);
      else setValue(target);
    };
    requestAnimationFrame(tick);
  }, [target, active]);
  return value;
}

export function StatCounters() {
  const ref = React.useRef(null);
  const visible = useInView(ref, { margin: '-10% 0px', once: true });

  const plots   = useTicker(2847,      visible);
  const secured = useTicker(4_200_000, visible);
  const munis   = useTicker(84,        visible);

  const stats = [
    { value: Intl.NumberFormat().format(plots) + '+', label: 'Plots anchored' },
    {
      value: secured >= 3_990_000
        ? '€4.2M+'
        : Intl.NumberFormat('de-DE', { notation: 'compact' }).format(secured),
      label: 'EUR value secured',
    },
    { value: '0', label: 'Disputes tolerated' },
    { value: munis >= 82 ? '84' : String(munis), label: 'Municipalities covered' },
  ];

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-k-border bg-k-surface px-6 py-8 shadow-card"
        >
          <span className="block text-[42px] font-bold leading-none tabular-nums text-k-accent">
            {visible ? s.value : '—'}
          </span>
          <span className="mt-3 block text-sm text-k-muted">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
