'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Search } from 'lucide-react';

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
    <div className="flex h-full min-h-[540px] items-center justify-center bg-[#0a0a0f] text-sm text-k-muted">
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
    <div className="-mx-6 -mt-10">

      {/* ── Full-bleed map container ─────────────────────── */}
      <div className="relative" style={{ height: 'calc(100vh - 64px)' }}>

        {/* Map */}
        <KatMap properties={filtered} highlighted={selected?.mint} onSelect={setSelected} />

        {/* ── Floating search bar ──────────────────────────── */}
        <div className="pointer-events-auto absolute left-1/2 top-4 z-[500] w-full max-w-lg -translate-x-1/2 px-4">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-sm">
            <Search className="h-4 w-4 shrink-0 text-zinc-400" />
            <input
              className="flex-1 bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
              placeholder="Search plot, municipality, wallet…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="border-l border-zinc-200 bg-transparent pl-3 text-xs text-zinc-500 focus:outline-none"
              value={municipalityFilter}
              onChange={(e) => setMunicipalityFilter(e.target.value)}
            >
              <option value="Any">All municipalities</option>
              {MK_MUNICIPALITIES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {loading && (
              <span className="ml-1 h-3.5 w-3.5 shrink-0 animate-spin rounded-full border border-zinc-300 border-t-zinc-600" />
            )}
          </div>
          {/* Result count pill */}
          {(q || municipalityFilter !== 'Any') && (
            <div className="mt-2 flex justify-center">
              <span className="rounded-full border border-zinc-200 bg-white/90 px-3 py-0.5 text-[11px] text-zinc-500 shadow-sm backdrop-blur-sm">
                {filtered.length} parcel{filtered.length !== 1 ? 's' : ''} shown
              </span>
            </div>
          )}
        </div>

        {/* ── Detail panel (slides in from right) ─────────── */}
        <aside
          className={`pointer-events-auto absolute right-0 top-0 z-[400] flex h-full w-[300px] flex-col border-l border-white/10 bg-k-bg/90 backdrop-blur-xl transition-transform duration-300 xl:w-[320px] ${
            selected ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {selected && (
            <>
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                <Badge
                  toneKey={selected.status === 'for_sale' ? 'sale' : selected.status === 'recent_sale' ? 'pulse' : 'own'}
                >
                  {selected.status.replace('_', ' ')}
                </Badge>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-xs text-white/40 hover:text-white/80 transition"
                >
                  ✕
                </button>
              </div>

              {/* Fields */}
              <div className="flex-1 divide-y divide-white/8 overflow-y-auto">
                <div className="px-5 py-5">
                  <p className="text-[11px] text-white/40">Plot ID</p>
                  <p className="mt-0.5 text-2xl font-bold text-white">{selected.plotId}</p>
                  <p className="text-sm text-white/50">{selected.municipality}</p>
                </div>
                <div className="grid grid-cols-2 divide-x divide-white/8">
                  <div className="px-5 py-4">
                    <p className="text-[11px] text-white/40">Area</p>
                    <p className="mt-0.5 text-lg font-bold text-white">
                      {Intl.NumberFormat().format(selected.areaM2)} m²
                    </p>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-[11px] text-white/40">Land type</p>
                    <p className="mt-0.5 text-lg font-bold text-white">{selected.landType}</p>
                  </div>
                </div>
                {typeof selected.priceUsdcHuman === 'number' && (
                  <div className="px-5 py-4">
                    <p className="text-[11px] text-white/40">Listed price</p>
                    <p className="mt-0.5 text-2xl font-bold text-k-accent">
                      {Intl.NumberFormat().format(selected.priceUsdcHuman)} USDC
                    </p>
                  </div>
                )}
                <div className="px-5 py-4">
                  <p className="text-[11px] text-white/40">Owner</p>
                  <div className="mt-0.5 flex items-center gap-3">
                    <span className="font-mono text-xs text-white/70">{shortenAddress(selected.owner)}</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(selected.owner)}
                      className="text-[11px] text-white/30 underline underline-offset-2 hover:text-white/60 transition"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 border-t border-white/10 px-5 py-4">
                <Button asChild className="w-full justify-center">
                  <Link href={`/property/${encodeURIComponent(selected.mint)}`}>
                    View full deed record
                  </Link>
                </Button>
                {selected.status === 'for_sale' && selected.priceUsdcHuman && (
                  !publicKey ? (
                    <p className="text-center text-xs text-white/30">
                      Connect wallet to purchase
                    </p>
                  ) : (
                    <BuyPropertyModal property={selected} />
                  )
                )}
              </div>
            </>
          )}
        </aside>

        {/* Empty state hint when no panel */}
        {!selected && (
          <div className="pointer-events-none absolute bottom-10 right-4 z-[400]">
            <div className="rounded-lg border border-zinc-200 bg-white/90 px-3 py-2 text-[11px] text-zinc-400 shadow-sm backdrop-blur-sm">
              Click a parcel to view details
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
