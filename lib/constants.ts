import { clusterApiUrl } from '@solana/web3.js';

export const DEFAULT_PROGRAM_ID =
  process.env.NEXT_PUBLIC_PROGRAM_ID ?? 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';

export const DEVNET_USDC =
  process.env.NEXT_PUBLIC_USDC_MINT ?? '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

export const SOLANA_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC ?? clusterApiUrl('devnet');

export const EXPLORER_TX_BASE = 'https://explorer.solana.com/tx';
export const EXPLORER_ADDR_BASE = 'https://explorer.solana.com/address';

export const MPL_CORE_ID = 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d';
