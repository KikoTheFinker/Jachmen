'use client';

import type { AssetV1 } from '@metaplex-foundation/mpl-core';
import { fetchAsset } from '@metaplex-foundation/mpl-core';
import type { Idl, Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { publicKey } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCore } from '@metaplex-foundation/mpl-core';
import { useEffect, useState } from 'react';
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

/** Apply kataster snapshots onto demo rows when Core fetch fails yet listing exists */
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

/** Core registry index — seeded demos overlap with live kataster vaults whenever those mints exist */
export function usePropertyIndex(): {
  readonly properties: PropertyAsset[];
  readonly loading: boolean;
  readonly reload: () => void;
} {
  const program = useKatasterProgram();
  const [properties, setProperties] = useState<PropertyAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);

      const rows = await listAll(program);
      const listings = new Map<string, ListingDecoded>();
      for (const row of rows) {
        listings.set(row.account.nftAsset.toBase58(), row.account);
      }

      const seeds = buildDemoSeedProperties();

      /** Read helper — no signer */
      const umiRead = createUmi(SOLANA_RPC).use(mplCore());

      const merged: PropertyAsset[] = [];

      for (const seed of seeds) {
        const lst = listings.get(seed.mint);
        try {
          const asset = (await fetchAsset(
            umiRead,
            publicKey(seed.mint),
          )) as AssetV1;
          let prop = mplAssetToProperty(seed.mint, asset, lst);
          if (!prop) {
            merged.push(overlayListing(seed, lst));
            continue;
          }
          merged.push({
            ...seed,
            ...prop,
            boundary:
              prop.boundary.length >= 3 ? prop.boundary : seed.boundary,
          });
        } catch {
          merged.push(overlayListing(seed, lst));
        }
      }

      for (const [mint, lst] of Array.from(listings.entries())) {
        if (merged.some((m) => m.mint === mint)) continue;
        try {
          const asset = (await fetchAsset(umiRead, publicKey(mint))) as AssetV1;
          const prop = mplAssetToProperty(mint, asset, lst);
          if (prop) merged.push(prop);
        } catch {
          //
        }
      }

      if (!cancelled) {
        setProperties(merged);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [program, tick]);

  return {
    properties,
    loading,
    reload: () => setTick((t) => t + 1),
  };
}
