'use client';

import type { AssetV1 } from '@metaplex-foundation/mpl-core';
import { fetchAsset } from '@metaplex-foundation/mpl-core';
import type { Idl, Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { publicKey } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCore } from '@metaplex-foundation/mpl-core';
import { useEffect, useMemo, useState } from 'react';
import type { RawListingDecoded } from '@/lib/kataster-chain';
import { toBn } from '@/lib/kataster-chain';
import { landTypeFromCode } from '@/lib/land-type';
import { mplAssetToProperty } from '@/lib/registry';
import type { PropertyAsset } from '@/lib/types';
import { buildDemoSeedProperties } from '@/lib/seed-properties';
import { SOLANA_RPC } from '@/lib/constants';
import { useKatasterProgram } from '@/components/providers/kataster-providers';

type ListingDecoded = RawListingDecoded;
type ListingRow = { account: ListingDecoded; publicKey: PublicKey };

// Single UMI instance — never recreated across renders
const umiRead = createUmi(SOLANA_RPC).use(mplCore());

export function overlayListing(
  seed: PropertyAsset,
  listing?: ListingDecoded,
): PropertyAsset {
  if (!listing) return seed;

  const soldTs = listing.isActive ? 0 : Number(toBn(listing.soldAt));
  const createdTs = Number(toBn(listing.createdAt));
  const priceHumanActive =
    listing.isActive ? Number(toBn(listing.priceUsdc)) / 1_000_000 : undefined;
  const now = Math.floor(Date.now() / 1000);

  let status: PropertyAsset['status'] = seed.status;
  if (listing.isActive && priceHumanActive) status = 'for_sale';
  else if (soldTs > 0 && now - soldTs < 86400 * 7) status = 'recent_sale';
  else status = listing.isActive ? 'for_sale' : 'owned';

  return {
    ...seed,
    plotId: listing.plotId ?? seed.plotId,
    municipality: listing.municipality ?? seed.municipality,
    landType: landTypeFromCode(Number(listing.landType)),
    areaM2: Number(toBn(listing.areaM2)) || seed.areaM2,
    owner: listing.owner.toBase58(),
    sellerWallet: listing.isActive ? listing.owner.toBase58() : seed.sellerWallet,
    isListedOnChain: listing.isActive,
    createdAtUnix: createdTs || seed.createdAtUnix,
    soldAtUnix: soldTs || seed.soldAtUnix,
    priceUsdcHuman: listing.isActive ? priceHumanActive : seed.priceUsdcHuman,
    priceAtomic: listing.isActive ? toBn(listing.priceUsdc) : seed.priceAtomic,
    status,
  };
}

async function listAll(program: Program<Idl> | null): Promise<ListingRow[]> {
  if (!program) return [];
  try {
    return await (
      program.account as unknown as {
        listingAccount: { all: () => Promise<ListingRow[]> };
      }
    ).listingAccount.all();
  } catch {
    return [];
  }
}

export function usePropertyIndex(): {
  readonly properties: PropertyAsset[];
  readonly loading: boolean;
  readonly reload: () => void;
} {
  const program = useKatasterProgram();

  // Seeds are static — compute once, never re-run
  const seeds = useMemo(() => buildDemoSeedProperties(), []);

  // Show seed data immediately — no blank loading screen
  const [properties, setProperties] = useState<PropertyAsset[]>(seeds);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void (async () => {
      // Step 1: fetch all on-chain listings (single batched RPC call)
      const rows = await listAll(program);
      if (cancelled) return;

      const listings = new Map<string, ListingDecoded>();
      for (const row of rows) {
        listings.set(row.account.nftAsset.toBase58(), row.account);
      }

      // Step 2: overlay listing data onto seeds synchronously (instant, no network)
      const merged: PropertyAsset[] = seeds.map((seed) =>
        overlayListing(seed, listings.get(seed.mint)),
      );

      // Show results immediately after the single listings fetch
      if (!cancelled) setProperties([...merged]);

      // Step 3: only fetch Core assets for mints that actually have on-chain listings
      // (seeds without listings are definitely not minted — skip the failed RPC calls)
      const listedMints = Array.from(listings.keys());
      if (listedMints.length === 0) {
        if (!cancelled) setLoading(false);
        return;
      }

      const assetResults = await Promise.allSettled(
        listedMints.map(async (mint) => {
          const lst = listings.get(mint)!;
          const asset = (await fetchAsset(umiRead, publicKey(mint))) as AssetV1;
          return { mint, prop: mplAssetToProperty(mint, asset, lst) };
        }),
      );

      if (cancelled) return;

      for (const result of assetResults) {
        if (result.status !== 'fulfilled' || !result.value?.prop) continue;
        const { mint, prop } = result.value;
        const idx = merged.findIndex((m) => m.mint === mint);
        const updated = {
          ...prop,
          boundary: prop.boundary.length >= 3 ? prop.boundary : (merged[idx]?.boundary ?? prop.boundary),
        };
        if (idx >= 0) merged[idx] = { ...merged[idx], ...updated };
        else merged.push(updated);
      }

      if (!cancelled) {
        setProperties([...merged]);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [program, seeds, tick]);

  return {
    properties,
    loading,
    reload: () => setTick((t) => t + 1),
  };
}
