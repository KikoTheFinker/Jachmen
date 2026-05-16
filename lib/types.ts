export type LandKind = 'Agricultural' | 'Residential' | 'Commercial' | 'Industrial';

export type PropertyListingState = 'for_sale' | 'owned' | 'recent_sale';

/** Normalized property surfaced to UI (chain + seeded demo overlays). */
export type PropertyAsset = {
  mint: string;
  plotId: string;
  municipality: string;
  landType: LandKind;
  areaM2: number;
  owner: string;
  centerLat: number;
  centerLng: number;
  boundary: [number, number][];
  status: PropertyListingState;
  priceAtomic?: bigint;
  priceUsdcHuman?: number;
  docHash?: string;
  registeredDate?: string;
  description?: string;
  listingPda?: string;
  sellerWallet?: string;
  createdAtUnix?: number;
  soldAtUnix?: number;
  isListedOnChain?: boolean;
};
