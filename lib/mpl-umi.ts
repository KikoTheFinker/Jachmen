'use client';

import type { Context } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCore } from '@metaplex-foundation/mpl-core';
import { SOLANA_RPC } from '@/lib/constants';

let cached: Context | null = null;

/** Read-only Umi (+ mpl-core) for fetching Core assets — no signer required */
export function getReadonlyUmi(): Context {
  if (!cached) {
    cached = createUmi(SOLANA_RPC).use(mplCore());
  }
  return cached;
}
