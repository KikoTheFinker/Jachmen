import Link from 'next/link';
import { MapPin, Shield, Zap } from 'lucide-react';
import { StatCounters } from '@/components/stats';

const features = [
  {
    icon: MapPin,
    title: 'GPS-anchored parcels',
    body: 'Draw polygon boundaries on the live cadastral map. Coordinates are stored in the NFT asset and publicly verifiable.',
  },
  {
    icon: Shield,
    title: 'Document fingerprinting',
    body: 'Upload your cadastral PDF. A SHA-256 hash is computed client-side and anchored to the on-chain deed — proving authenticity without exposing the document.',
  },
  {
    icon: Zap,
    title: 'Atomic USDC transfers',
    body: 'Buy or sell deeds through the Anchor escrow program. Deed and payment settle in the same transaction — no counterparty risk.',
  },
] as const;

export default function HomePage() {
  return (
    <div className="space-y-24">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="pt-16 pb-4 text-center">
        {/* Eyebrow */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-k-accent/30 bg-k-accentDim px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-k-accent" />
          <span className="text-xs font-medium text-k-accent">
            Republic of North Macedonia · Solana Devnet
          </span>
        </div>

        {/* Heading */}
        <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight text-k-text sm:text-6xl lg:text-[68px] lg:leading-[1.08]">
          The land registry<br />
          <span className="text-k-accent">Macedonia</span> deserves.
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-k-muted">
          Blockchain-anchored property deeds. Every boundary hashed, every transfer
          permanent. Owned by the chain, verifiable by anyone.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-k-accent px-6 text-sm font-semibold text-k-bg transition hover:bg-amber-400 hover:shadow-glow"
          >
            Register a parcel
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/registry"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-k-border bg-k-surface px-6 text-sm font-medium text-k-text transition hover:bg-k-raised hover:border-k-muted/40"
          >
            Browse registry
          </Link>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section>
        <StatCounters />
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="space-y-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-k-text">
            Built for integrity
          </h2>
          <p className="mt-3 text-base text-k-muted">
            Three primitives that make land corruption structurally impossible.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-k-border bg-k-surface p-6 transition hover:border-k-border/60 hover:bg-k-raised shadow-card"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-k-accentDim">
                <Icon className="h-5 w-5 text-k-accent" />
              </div>
              <h3 className="text-sm font-semibold text-k-text">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-k-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA strip ─────────────────────────────────────── */}
      <section className="rounded-2xl border border-k-accent/20 bg-k-accentDim p-10 text-center">
        <h2 className="text-2xl font-bold text-k-text">
          Ready to anchor your land on-chain?
        </h2>
        <p className="mt-3 text-base text-k-muted">
          Phantom wallet on Devnet · Free to use · Takes under 5 minutes.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-k-accent px-6 text-sm font-semibold text-k-bg transition hover:bg-amber-400 hover:shadow-glow"
          >
            Register a parcel →
          </Link>
          <Link
            href="/map"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-k-border bg-k-surface px-6 text-sm font-medium text-k-text transition hover:bg-k-raised"
          >
            View parcel map
          </Link>
        </div>
      </section>

    </div>
  );
}
