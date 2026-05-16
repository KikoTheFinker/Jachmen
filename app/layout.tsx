import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

import '@/app/globals.css';
import { KatasterProviders } from '@/components/providers/kataster-providers';
import { SiteHeader } from '@/components/layout/site-header';

export const metadata: Metadata = {
  title: 'Kataster Chain — National Land Registry',
  description: 'On-chain property deeds, atomic USDC escrow, and public cadastral registry for North Macedonia.',
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetBrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="mk" suppressHydrationWarning className={`${inter.variable} ${jetBrains.variable}`}>
      <body className="min-h-screen bg-k-bg motion-fade">
        <KatasterProviders>
          <SiteHeader />
          <main className="mx-auto w-full max-w-7xl px-6 py-10 pb-32">
            {children}
          </main>
          <footer className="border-t border-k-border">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-k-subtle">
                © {new Date().getFullYear()} Kataster Chain · Republic of North Macedonia
              </p>
              <div className="flex items-center gap-6 text-sm text-k-subtle">
                <span>Solana Devnet</span>
                <span>·</span>
                <span>Metaplex Core</span>
                <span>·</span>
                <a
                  href="https://explorer.solana.com/?cluster=devnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-k-muted"
                >
                  Explorer ↗
                </a>
              </div>
            </div>
          </footer>
        </KatasterProviders>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1c1c1f',
              color: '#f4f4f5',
              border: '1px solid #27272a',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: 'var(--font-inter), sans-serif',
            },
          }}
        />
      </body>
    </html>
  );
}
