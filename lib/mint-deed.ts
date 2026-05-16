'use client';

import type { Adapter } from '@solana/wallet-adapter-base';
import { mplCore, create, pluginAuthorityPairV2 } from '@metaplex-foundation/mpl-core';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { generateSigner } from '@metaplex-foundation/umi';

import type { LandKind } from '@/lib/types';
import { SOLANA_RPC } from '@/lib/constants';

const LAND_ENCODE: Record<LandKind, number> = {
  Agricultural: 0,
  Residential: 1,
  Commercial: 2,
  Industrial: 3,
};

export async function mintKatasterDeed(params: {
  /** Phantom / Wallet Standard adapter Umi signs with */
  signer: Adapter | undefined;
  plotId: string;
  municipality: string;
  landKind: LandKind;
  description: string;
  areaHuman: number;
  boundary: [number, number][];
  docFingerprint: string;
  registeredHuman: string;
}): Promise<{ signature: string | undefined; mint: string }> {
  if (!params.signer?.publicKey) throw new Error('Phantom required');

  const umiCore = createUmi(SOLANA_RPC).use(walletAdapterIdentity(params.signer)).use(mplCore());

  const assetSigner = generateSigner(umiCore);

  const n = Math.max(params.boundary.length, 1);
  const centerLat = params.boundary.reduce((acc, curr) => acc + curr[0], 0) / n;
  const centerLng = params.boundary.reduce((acc, curr) => acc + curr[1], 0) / n;
  const gpsJson = JSON.stringify(params.boundary);

  const { signature } = await create(umiCore, {
    asset: assetSigner,
    name: `Plot #${params.plotId} · ${params.municipality}`,
    uri: '',
    plugins: [
      // mpl-core narrowed plugin union mismatches inferred tuple; Anchor payload is Attributes-only.
      pluginAuthorityPairV2({
        type: 'Attributes',
        attributeList: [
          { key: 'Plot ID', value: params.plotId },
          { key: 'Municipality', value: params.municipality },
          { key: 'Land Type', value: params.landKind },
          { key: 'Land Type Code', value: `${LAND_ENCODE[params.landKind]}` },
          { key: 'Area m²', value: `${params.areaHuman}` },
          { key: 'GPS Center Lat', value: centerLat.toFixed(6) },
          { key: 'GPS Center Lng', value: centerLng.toFixed(6) },
          { key: 'Registered', value: params.registeredHuman },
          { key: 'Document Hash', value: params.docFingerprint },
          { key: 'Description', value: params.description.slice(0, 220) },
          { key: 'GPS Boundary', value: gpsJson },
        ],
      }),
    ] as unknown as NonNullable<Parameters<typeof create>[1]['plugins']>,
  }).sendAndConfirm(umiCore);

  const mint = assetSigner.publicKey.toString();

  return { mint, signature: String(signature ?? '') };
}
