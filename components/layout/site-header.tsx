'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const links = [
  { label: 'Registry', href: '/registry' },
  { label: 'Map',      href: '/map'      },
  { label: 'Register', href: '/register' },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-k-border bg-k-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-k-accent">
            <span className="text-xs font-bold text-k-bg">K</span>
          </div>
          <span className="text-sm font-semibold text-k-text">Kataster Chain</span>
        </Link>

        {/* Nav */}
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + '/');
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-k-raised text-k-text'
                    : 'text-k-muted hover:bg-k-raised/60 hover:text-k-text',
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Wallet — only render client-side to avoid SSR/hydration mismatch */}
        <div className="ml-auto">
          {mounted && <WalletMultiButton className="wallet-adapter-button-trigger" />}
        </div>
      </div>
    </header>
  );
}
