import { EXPLORER_ADDR_BASE, EXPLORER_TX_BASE } from '@/lib/constants';

export function shortenAddress(addr: string, left = 4, right = 4): string {
  if (!addr || addr.length < left + right + 3) return addr;
  return `${addr.slice(0, left)}…${addr.slice(-right)}`;
}

export function usdcDecimals(): number {
  return 6;
}

export function toAtomicUsdc(human: number): bigint {
  return BigInt(Math.round(human * 10 ** usdcDecimals()));
}

export function fromAtomicUsdc(atomic: bigint): number {
  return Number(atomic) / 10 ** usdcDecimals();
}

/** Protocol fee numerator/denominator must match kataster_chain::calculate_fee (5 / 1000 == 0.5%). */
export function protocolFeeAtomic(priceAtomic: bigint): bigint {
  return (priceAtomic * 5n) / 1000n;
}

export function explorerTx(sig: string) {
  return `${EXPLORER_TX_BASE}/${sig}?cluster=devnet`;
}

export function explorerAddress(addr: string) {
  return `${EXPLORER_ADDR_BASE}/${addr}?cluster=devnet`;
}
