'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import { usePropertyIndex } from '@/hooks/use-properties';
import { MK_MUNICIPALITIES } from '@/lib/mk-municipalities';
import { shortenAddress } from '@/lib/format';
import type { PropertyAsset } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BuyPropertyModal } from '@/components/buy-property-modal';

const KatMap = dynamic(() => import('@/components/kataster-map'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[420px] items-center justify-center text-sm text-k-muted">
      Loading map…
    </div>
  ),
});

export default function MapPage() {
  const { properties, loading } = usePropertyIndex();
  const { publicKey } = useWallet();
  const [municipalityFilter, setMunicipalityFilter] = useState('Any');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<PropertyAsset | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return properties.filter((p) => {
      if (municipalityFilter !== 'Any' && p.municipality !== municipalityFilter) return false;
      if (!needle.length) return true;
      return [p.plotId, p.municipality, p.owner].some((f) => f.toLowerCase().includes(needle));
    });
  }, [municipalityFilter, properties, q]);

  return (
    <div>
      {/* ── Page header ─────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-k-border pb-6">
        <div>
          <p className="text-xs font-medium text-k-accent">Cadastral map</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-k-text">National parcel atlas</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="h-9 min-w-[200px] rounded-lg border border-k-border bg-k-surface px-3 text-sm text-k-text placeholder:text-k-muted/60 focus:outline-none focus:border-k-accent/60"
            placeholder="Plot · municipality · wallet"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="h-9 rounded-lg border border-k-border bg-k-surface px-3 text-sm text-k-text focus:outline-none"
            value={municipalityFilter}
            onChange={(e) => setMunicipalityFilter(e.target.value)}
          >
            <option>Any</option>
            {MK_MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}
          </select>
          {loading && <span className="text-sm text-k-muted">Loading…</span>}
        </div>
      </div>

      {/* ── Map + detail panel ──────────────────────────── */}
      <div className="grid gap-0 overflow-hidden rounded-xl border border-k-border xl:grid-cols-[1fr_320px]">
        <div className="h-[calc(80vh_-_80px)] min-h-[480px] xl:border-r xl:border-k-border">
          <KatMap properties={filtered} highlighted={selected?.mint} onSelect={setSelected} />
        </div>

        <aside className="bg-k-surface xl:sticky xl:top-[73px] xl:h-[calc(80vh_-_80px)] xl:overflow-y-auto">
          {selected ? (
            <div className="flex h-full flex-col">
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-k-border px-5 py-3">
                <Badge
                  toneKey={selected.status === 'for_sale' ? 'sale' : selected.status === 'recent_sale' ? 'pulse' : 'own'}
                >
                  {selected.status.replace('_', ' ')}
                </Badge>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-xs text-k-muted hover:text-k-text transition"
                >
                  Dismiss
                </button>
              </div>

              {/* Fields */}
              <div className="flex-1 divide-y divide-k-border">
                <div className="px-5 py-5">
                  <p className="text-xs text-k-muted">Plot</p>
                  <p className="mt-1 text-2xl font-bold text-k-text">{selected.plotId}</p>
                  <p className="text-sm text-k-muted">{selected.municipality}</p>
                </div>
                <div className="grid grid-cols-2 divide-x divide-k-border">
                  <div className="px-5 py-4">
                    <p className="text-xs text-k-muted">Area</p>
                    <p className="mt-1 text-xl font-bold text-k-text">
                      {Intl.NumberFormat().format(selected.areaM2)} m²
                    </p>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-xs text-k-muted">Type</p>
                    <p className="mt-1 text-xl font-bold text-k-text">{selected.landType}</p>
                  </div>
                </div>
                {typeof selected.priceUsdcHuman === 'number' && (
                  <div className="px-5 py-4">
                    <p className="text-xs text-k-muted">Listed price</p>
                    <p className="mt-1 text-2xl font-bold text-k-accent">
                      {Intl.NumberFormat().format(selected.priceUsdcHuman)} USDC
                    </p>
                  </div>
                )}
                <div className="px-5 py-4">
                  <p className="text-xs text-k-muted">Owner</p>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-sm text-k-text">{shortenAddress(selected.owner)}</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(selected.owner)}
                      className="text-xs text-k-muted underline underline-offset-2 hover:text-k-text transition"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 border-t border-k-border px-5 py-4">
                <Button asChild className="w-full justify-center">
                  <Link href={`/property/${encodeURIComponent(selected.mint)}`}>
                    View full deed record
                  </Link>
                </Button>
                {selected.status === 'for_sale' && selected.priceUsdcHuman && (
                  !publicKey ? (
                    <p className="text-center text-xs text-k-muted">
                      Connect wallet to purchase
                    </p>
                  ) : (
                    <BuyPropertyModal property={selected} />
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
              <div className="h-8 w-8 rounded-lg bg-k-accentDim flex items-center justify-center">
                <span className="text-k-accent text-lg">↖</span>
              </div>
              <p className="text-sm font-medium text-k-text">No parcel selected</p>
              <p className="text-xs leading-relaxed text-k-muted">
                Click any parcel on the map<br />to view its cadastral record.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
