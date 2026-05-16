import { PublicKey } from '@solana/web3.js';
import type { LandKind, PropertyAsset } from '@/lib/types';

/** Deterministic 32-byte pubkey for demo rows before you mint matching Core assets */
export function demoPubkey(seed: string): PublicKey {
  const b = Buffer.alloc(32);
  Buffer.from(seed, 'utf8').copy(b);
  return new PublicKey(b);
}

function box(centerLat: number, centerLng: number, dx = 0.0038, dy = 0.0048): [number, number][] {
  return [
    [centerLat - dx, centerLng - dy],
    [centerLat + dx, centerLng - dy],
    [centerLat + dx, centerLng + dy],
    [centerLat - dx, centerLng + dy],
  ];
}

/** Five Strumica / MK-wide polygons from the hackathon demo brief */
export function buildDemoSeedProperties(): PropertyAsset[] {
  const bases: Omit<PropertyAsset, 'mint' | 'owner'>[] = [
    {
      plotId: 'MK-0001',
      municipality: 'Strumica',
      landType: 'Agricultural',
      areaM2: 3200,
      centerLat: 41.4394,
      centerLng: 22.6433,
      boundary: box(41.4394, 22.6433, 0.0028, 0.0038),
      status: 'for_sale',
      priceUsdcHuman: 2500,
      priceAtomic: BigInt(Math.round(2500 * 1_000_000)),
      description: 'Fertile Strumica valley plot — escrow demo listing.',
      registeredDate: '2026-03-02',
      docHash: 'sha256:demo000100000000000000000000000000000000000000000000000000000001',
      isListedOnChain: false,
    },
    {
      plotId: 'MK-0002',
      municipality: 'Bitola',
      landType: 'Residential',
      areaM2: 450,
      centerLat: 41.0297,
      centerLng: 21.3294,
      boundary: box(41.0297, 21.3294, 0.002, 0.0025),
      status: 'for_sale',
      priceUsdcHuman: 8000,
      priceAtomic: BigInt(Math.round(8000 * 1_000_000)),
      description: 'Bitola townhouse parcel near the Pelagonija plain.',
      registeredDate: '2026-03-06',
      docHash: 'sha256:demo000200000000000000000000000000000000000000000000000000000002',
      isListedOnChain: false,
    },
    {
      plotId: 'MK-0003',
      municipality: 'Ohrid',
      landType: 'Commercial',
      areaM2: 820,
      centerLat: 41.1231,
      centerLng: 20.8016,
      boundary: box(41.1231, 20.8016, 0.0022, 0.0029),
      status: 'owned',
      description: 'Lakeshore commercial footing — deed held privately.',
      registeredDate: '2026-03-09',
      docHash: 'sha256:demo000300000000000000000000000000000000000000000000000000000003',
      isListedOnChain: false,
      soldAtUnix: Math.floor(Date.now() / 1000) - 86400 * 9,
    },
    {
      plotId: 'MK-0004',
      municipality: 'Skopje',
      landType: 'Residential',
      areaM2: 290,
      centerLat: 41.9981,
      centerLng: 21.4254,
      boundary: box(41.9981, 21.4254, 0.0016, 0.002),
      status: 'for_sale',
      priceUsdcHuman: 45000,
      priceAtomic: BigInt(Math.round(45000 * 1_000_000)),
      description: 'Capital core micro-lot suited for densification demos.',
      registeredDate: '2026-03-17',
      docHash: 'sha256:demo000400000000000000000000000000000000000000000000000000000004',
      isListedOnChain: false,
    },
    {
      plotId: 'MK-0005',
      municipality: 'Tetovo',
      landType: 'Agricultural',
      areaM2: 12000,
      centerLat: 42.0075,
      centerLng: 20.9716,
      boundary: box(42.0075, 20.9716, 0.005, 0.007),
      status: 'recent_sale',
      description: 'High acreage plateau — simulated recent chain transfer.',
      registeredDate: '2026-04-03',
      docHash: 'sha256:demo000500000000000000000000000000000000000000000000000000000005',
      isListedOnChain: false,
      soldAtUnix: Math.floor(Date.now() / 1000) - 86400 * 3,
    },
  ];

  return bases.map((b, idx) => {
    const pk = demoPubkey(`KATASTER_DEMO_MK_${idx + 1}_${b.plotId}`);
    const owner = demoPubkey(`KATASTER_DEMO_OWNER_${b.plotId}`).toBase58();

    let status: PropertyAsset['status'] = b.status;
    if (
      b.plotId === 'MK-0003' ||
      (!b.priceUsdcHuman && ['owned', 'recent_sale'].includes(b.status))
    ) {
      status = b.plotId === 'MK-0003' ? 'owned' : 'recent_sale';
    }

    return {
      mint: pk.toBase58(),
      owner,
      ...b,
      landType: b.landType as LandKind,
      status,
    };
  });
}
