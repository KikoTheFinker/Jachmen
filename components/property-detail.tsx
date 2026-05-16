'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { BuyPropertyModal } from '@/components/buy-property-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { explorerAddress } from '@/lib/format';
import { usePropertyIndex } from '@/hooks/use-properties';
import type { PropertyAsset } from '@/lib/types';

function statusLabel(p: PropertyAsset): string {
  if (p.status === 'for_sale') return 'For sale';
  if (p.status === 'recent_sale') return 'Recent transfer';
  return 'Owned';
}

function HistoryBlock({ property }: { property: PropertyAsset }) {
  const items: { title: string; detail: string }[] = [];

  if (property.registeredDate)
    items.push({ title: 'Registered', detail: property.registeredDate });
  if (property.createdAtUnix)
    items.push({ title: 'Listing created', detail: new Date(property.createdAtUnix * 1000).toLocaleString() });
  if (property.soldAtUnix)
    items.push({ title: 'Transfer settled', detail: new Date(property.soldAtUnix * 1000).toLocaleString() });

  if (!items.length)
    return <p className="text-sm text-k-muted">No on-chain timeline recorded.</p>;

  return (
    <div className="divide-y divide-k-border rounded-lg border border-k-border">
      {items.map((line) => (
        <div key={line.title + line.detail} className="grid grid-cols-[140px_1fr] gap-4 px-4 py-3">
          <span className="text-xs font-medium text-k-muted">{line.title}</span>
          <span className="text-sm text-k-text">{line.detail}</span>
        </div>
      ))}
    </div>
  );
}

function  FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4 border-b border-k-border px-0 py-4">
      <span className="text-xs font-medium text-k-muted pt-0.5">{label}</span>
      <div>{children}</div>
    </div>
  );
}

export function PropertyDetail({ mint }: { mint: string }) {
  const { properties, loading, reload } = usePropertyIndex();

  const property = useMemo(
    () => properties.find((p) => p.mint === mint) ?? null,
    [properties, mint],
  );

  if (loading && !property) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-k-muted">
        Loading registry…
      </div>
    );
  }

  if (!property) {
    return (
      <div className="rounded-xl border border-k-border bg-k-surface p-8 max-w-xl space-y-4 shadow-card">
        <p className="text-xs font-semibold text-k-red">Record not found</p>
        <p className="text-sm text-k-text">
          Mint <span className="break-all text-k-muted">{mint}</span>
        </p>
        <p className="text-sm text-k-muted">This parcel is not in the current index.</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => reload()}>Reload index</Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/registry">← Registry</Link>
          </Button>
          <a
            href={explorerAddress(mint)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-k-muted underline underline-offset-4 hover:text-k-text transition self-center"
          >
            Explorer ↗
          </a>
        </div>
      </div>
    );
  }

  const listed = property.status === 'for_sale' && Boolean(property.priceUsdcHuman);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">

      {/* Main deed record */}
      <article className="space-y-0">
        {/* Record header */}
        <div className="border-b border-k-border pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-k-accent">Cadastral deed record</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-k-text">
                Plot {property.plotId}
              </h1>
              <p className="mt-1 text-sm text-k-muted">{property.municipality}</p>
            </div>
            <Badge
              toneKey={listed ? 'sale' : property.status === 'recent_sale' ? 'pulse' : 'own'}
              className="mt-1"
            >
              {statusLabel(property)}
            </Badge>
          </div>
        </div>

        {/* Field table */}
        <div className="divide-y divide-k-border rounded-b-lg border border-k-border border-t-0 ps-4">
          <FieldRow label="Area">
            <span className="text-xl font-bold text-k-text">{property.areaM2.toLocaleString()} m²</span>
          </FieldRow>
          <FieldRow label="Land type">
            <span className="text-base font-medium text-k-text">{property.landType}</span>
          </FieldRow>
          <FieldRow label="Owner">
            <span className="font-mono text-xs break-all text-k-text">{property.owner}</span>
          </FieldRow>
          {property.priceUsdcHuman != null && (
            <FieldRow label="Listed price">
              <span className="text-xl font-bold text-k-accent">
                {property.priceUsdcHuman.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC
              </span>
            </FieldRow>
          )}
          {property.docHash && (
            <FieldRow label="Cadastral hash">
              <span className="font-mono text-[10px] break-all text-k-muted">{property.docHash}</span>
            </FieldRow>
          )}
          <FieldRow label="Mint address">
            <span className="font-mono text-[10px] break-all text-k-muted">{property.mint}</span>
            <a
              href={explorerAddress(property.mint)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-xs text-k-muted underline underline-offset-4 hover:text-k-text transition"
            >
              View on Explorer ↗
            </a>
          </FieldRow>
        </div>

        {/* Actions */}
        {listed && (
          <div className="flex flex-wrap gap-3 border-t border-k-border pt-6">
            <BuyPropertyModal property={property} />
            <Button variant="ghost" asChild size="md">
              <Link href="/map">View on map</Link>
            </Button>
          </div>
        )}
      </article>

      {/* Sidebar */}
      <aside className="space-y-8">
        <div className="space-y-2">
          <div>
            <p className="text-xs font-semibold text-k-muted">Transaction timeline</p>
          </div>
          <div className="mt-4">
            <HistoryBlock property={property} />
          </div>
          <p className="mt-3 text-xs text-k-muted">
            Timestamps from on-chain escrow program. Core asset traits are canonical.
          </p>
        </div>

        {property.description && (
          <div className="space-y-0">
            <div className="border-b border-k-border pb-3">
              <p className="text-xs font-semibold text-k-muted">Description</p>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-k-muted">{property.description}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
