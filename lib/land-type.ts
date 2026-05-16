import type { LandKind } from '@/lib/types';

export const LAND_TYPE_CODE: Record<LandKind, number> = {
  Agricultural: 0,
  Residential: 1,
  Commercial: 2,
  Industrial: 3,
};

export const LAND_CODES: LandKind[] = ['Agricultural', 'Residential', 'Commercial', 'Industrial'];

export function landTypeFromCode(code: number): LandKind {
  return LAND_CODES[code] ?? 'Residential';
}

export function encodeLand(kind: LandKind): number {
  return LAND_TYPE_CODE[kind];
}
