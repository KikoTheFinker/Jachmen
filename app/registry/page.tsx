'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

import { usePropertyIndex } from '@/hooks/use-properties';
import { MK_MUNICIPALITIES } from '@/lib/mk-municipalities';
import { shortenAddress } from '@/lib/format';
import type { PropertyAsset } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const KatMap = dynamic(() => import('@/components/kataster-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-k-muted">
      Loading map…
    </div>
  ),
});

const selectCls =
  'flex h-9 w-full rounded-lg border border-k-border bg-k-surface px-3 text-sm text-k-text focus:outline-none focus:border-k-accent/60 focus:ring-2 focus:ring-k-accent/20';

export default function RegistryPage() {
  const { properties, loading, reload } = usePropertyIndex();
  const [q, setQ] = useState('');
  const [municipality, setMunicipality] = useState('Any');
  const [landKind, setLandKind] = useState<'Any' | PropertyAsset['landType']>('Any');
  const [status, setStatus] = useState<'All' | PropertyAsset['status'] | 'recent_window'>('All');
  const [areaMax, setAreaMax] = useState(55000);
  const [priceMax, setPriceMax] = useState(500000);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return properties.filter((p) => {
      if (needle) {
        const hit = [p.owner, ...(p.sellerWallet ? [p.sellerWallet] : []), p.plotId, p.municipality]
          .some((x) => String(x).toLowerCase().includes(needle));
        if (!hit) return false;
      }
      if (municipality !== 'Any' && p.municipality !== municipality) return false;
      if (landKind !== 'Any' && p.landType !== landKind) return false;
      if (status === 'for_sale' && p.status !== 'for_sale') return false;
      if (status === 'owned' && p.status !== 'owned') return false;
      if (status === 'recent_sale' && p.status !== 'recent_sale') return false;
      if (p.areaM2 > areaMax) return false;
      const priceHuman = typeof p.priceUsdcHuman === 'number' ? p.priceUsdcHuman : Infinity;
      if (priceHuman > priceMax) return false;
      return true;
    });
  }, [areaMax, landKind, municipality, priceMax, properties, q, status]);

  return (
    <div>
      {/* ── Page header ─────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-k-border pb-6">
        <div>
          <p className="text-xs font-medium text-k-accent">National Cadastral Registry</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-k-text">Land parcels</h1>
        </div>
        <div className="flex items-center gap-5 text-sm text-k-muted">
          {loading && <span>Fetching…</span>}
          <button
            type="button"
            onClick={() => reload()}
            className="underline underline-offset-4 hover:text-k-text transition"
          >
            Reload
          </button>
          <span className="font-medium text-k-accent">{filtered.length} results</span>
        </div>
      </div>

      {/* ── Map strip ───────────────────────────────────── */}
      <div className="mb-8 h-[220px] w-full overflow-hidden rounded-xl border border-k-border">
        <KatMap properties={filtered} highlighted={filtered[0]?.mint} />
      </div>

      {/* ── Filters + results ───────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">

        {/* Sidebar */}
        <aside className="space-y-5">
          <p className="border-b border-k-border pb-3 text-xs font-semibold text-k-muted">
            Filters
          </p>

          <div className="space-y-1.5">
            <Label>Search</Label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Plot · municipality · wallet" />
          </div>

          <div className="space-y-1.5">
            <Label>Municipality</Label>
            <select className={selectCls} value={municipality} onChange={(e) => setMunicipality(e.target.value)}>
              <option>Any</option>
              {MK_MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Land type</Label>
            <select className={selectCls} value={landKind} onChange={(e) => setLandKind(e.target.value as typeof landKind)}>
              <option>Any</option>
              <option>Agricultural</option>
              <option>Residential</option>
              <option>Commercial</option>
              <option>Industrial</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              <option value="All">All</option>
              <option value="for_sale">For sale</option>
              <option value="owned">Owned</option>
              <option value="recent_sale">Recent transfers</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Max m²</Label>
              <Input type="number" value={areaMax} min={250}
                onChange={(e) => setAreaMax(Number(e.target.value || 55000))} />
            </div>
            <div className="space-y-1.5">
              <Label>Max USDC</Label>
              <Input type="number" value={priceMax} step={2500} min={2500}
                onChange={(e) => setPriceMax(Number(e.target.value || 500000))} />
            </div>
          </div>
        </aside>

        {/* Results table */}
        <div className="space-y-0">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_auto] rounded-t-xl border border-k-border bg-k-surface px-5 py-2.5">
            <div className="hidden sm:grid sm:grid-cols-[110px_150px_1fr] gap-4">
              <span className="text-xs font-medium text-k-muted">Plot</span>
              <span className="text-xs font-medium text-k-muted">Municipality</span>
              <span className="text-xs font-medium text-k-muted">Details</span>
            </div>
            <span className="text-xs font-medium text-k-muted">Status</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-k-border rounded-b-xl border border-k-border border-t-0">
            {filtered.map((p) => (
              <article
                key={p.mint + p.plotId}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 transition hover:bg-k-surface/60"
              >
                <div className="grid gap-1 sm:grid-cols-[110px_150px_1fr]">
                  <span className="text-sm font-medium text-k-text">{p.plotId}</span>
                  <span className="text-sm text-k-muted">{p.municipality}</span>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-sm text-k-muted">
                      {Intl.NumberFormat().format(p.areaM2)} m² · {p.landType}
                    </span>
                    {typeof p.priceUsdcHuman === 'number' && (
                      <span className="text-sm font-medium text-k-accent">
                        {p.priceUsdcHuman.toLocaleString()} USDC
                      </span>
                    )}
                    <span className="text-xs text-k-muted/60">
                      {shortenAddress(p.owner)}{p.isListedOnChain ? ' · on-chain' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge toneKey={p.status === 'for_sale' ? 'sale' : p.status === 'recent_sale' ? 'pulse' : 'own'}>
                    {p.status.replace('_', ' ')}
                  </Badge>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/property/${encodeURIComponent(p.mint)}`}>View</Link>
                  </Button>
                </div>
              </article>
            ))}

            {!filtered.length && !loading && (
              <div className="px-5 py-10 text-center text-sm text-k-muted">
                No parcels match the current filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
