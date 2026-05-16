import type { AssetV1 } from '@metaplex-foundation/mpl-core';
import type { RawListingDecoded } from '@/lib/kataster-chain';
import { toBn } from '@/lib/kataster-chain';
import { landTypeFromCode } from '@/lib/land-type';
import { centerOf, polygonAreaSqM } from '@/lib/geo';
import type { PropertyAsset } from '@/lib/types';

type AttrList = NonNullable<
  NonNullable<AssetV1['attributes']>['attributeList']
>;

export function traitsToMap(attributes?: AttrList): Record<string, string> {
  if (!attributes?.length) return {};
  return Object.fromEntries(attributes.map((a) => [a.key, a.value]));
}

function parseBoundaryJson(raw?: string): [number, number][] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as [number, number][];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function mplAssetToProperty(
  mint: string,
  asset: AssetV1,
  listing?: RawListingDecoded,
): PropertyAsset | null {
  const map = traitsToMap(asset.attributes?.attributeList);
  const plotId = map['Plot ID'] ?? mint.slice(0, 8);
  const municipality = map['Municipality'] ?? 'Unknown';

  const landRaw = map['Land Type'] ?? 'Residential';
  const landUpper = landRaw.charAt(0).toUpperCase() + landRaw.slice(1);
  let landKind: PropertyAsset['landType'] = [
    'Agricultural',
    'Residential',
    'Commercial',
    'Industrial',
  ].includes(landUpper)
    ? (landUpper as PropertyAsset['landType'])
    : landTypeFromCode(Number(map['Land Type Code'] ?? 1));

  if (listing) {
    landKind = landTypeFromCode(Number(listing.landType));
  }

  const areaFromListing = listing ? Number(toBn(listing.areaM2)) : 0;
  const boundary = parseBoundaryJson(map['GPS Boundary'] ?? '') as [number, number][];
  const centerLatGuess = Number(map['GPS Center Lat'] ?? 41.6);
  const centerLngGuess = Number(map['GPS Center Lng'] ?? 21.7);

  let hull = [...boundary];
  if (!hull.length) {
    hull = [
      [centerLatGuess - 0.002, centerLngGuess - 0.003],
      [centerLatGuess + 0.002, centerLngGuess - 0.003],
      [centerLatGuess + 0.002, centerLngGuess + 0.003],
      [centerLatGuess - 0.002, centerLngGuess + 0.003],
    ];
  }

  const [centerLat, centerLng] = centerOf(hull);
  let areaM2 =
    hull.length ?
      polygonAreaSqM(hull)
    : areaFromListing ||
      Number(String(map['Area m²'] ?? map['Area m2'] ?? '0').replace(/,/g, '')) ||
      1;

  if (!Number.isFinite(areaM2)) areaM2 = areaFromListing || 450;

  const docHash = map['Document Hash'];
  const registeredDate = map['Registered'];
  const description = map['Description'];

  let priceHuman: number | undefined;
  if (listing?.isActive) {
    priceHuman = Number(toBn(listing.priceUsdc)) / 1_000_000;
  }

  const soldTs =
    listing && !listing.isActive ? Number(toBn(listing.soldAt)) : 0;
  const createdTs = listing ? Number(toBn(listing.createdAt)) : undefined;
  const now = Math.floor(Date.now() / 1000);

  let status: PropertyAsset['status'] = 'owned';
  if (listing?.isActive) status = 'for_sale';
  else if (soldTs > 0 && now - soldTs < 86400 * 7) status = 'recent_sale';

  /** While escrow holds the NFT, `ListingAccount.owner` still mirrors the deed beneficiary */
  const sellerWallet =
    listing?.isActive ? listing.owner.toBase58() : undefined;

  const displayOwner =
    listing ? listing.owner.toBase58()
    : typeof asset.owner === 'string' ? asset.owner
    : String(asset.owner);

  return {
    mint,
    plotId,
    municipality,
    landType: landKind,
    areaM2: Math.round(areaM2),
    owner: displayOwner,
    boundary: hull,
    centerLat,
    centerLng,
    status,
    priceAtomic:
      listing?.isActive && listing ?
        toBn(listing.priceUsdc)
      : undefined,
    priceUsdcHuman: listing?.isActive ? priceHuman : undefined,
    docHash,
    registeredDate,
    description,
    sellerWallet,
    createdAtUnix: createdTs || undefined,
    soldAtUnix: soldTs || undefined,
    isListedOnChain: Boolean(listing?.isActive),
  };
}
