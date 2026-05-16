import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const RegisterWizard = dynamic(
  () => import('@/components/register-flow').then((mod) => ({ default: mod.RegisterWizard })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-k-border bg-k-surface p-8 text-center text-sm text-k-muted">
        Loading…
      </div>
    ),
  },
);

export const metadata: Metadata = {
  title: 'Register — Kataster Chain',
  description: 'Draw polygon, upload deed documents, mint Metaplex Core asset, optionally list for USDC.',
};

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-10 border-b border-k-border pb-8">
        <p className="text-xs font-medium text-k-accent">
          Cadastral intake procedure
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-k-text">
          Register a land parcel
        </h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-k-muted">
          Complete all four steps to anchor a parcel deed on the Solana blockchain.
          You will need Phantom wallet connected to Devnet and a cadastral PDF document.
        </p>
      </div>
      <RegisterWizard />
    </section>
  );
}
