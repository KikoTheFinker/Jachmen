import type { ReactNode } from 'react';

/** Full bleed map shell while keeping typography aligned with global gutter */
export default function MapLayout({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}
