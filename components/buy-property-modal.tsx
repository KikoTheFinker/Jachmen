'use client';

import { PublicKey } from '@solana/web3.js';
import * as React from 'react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useWallet } from '@solana/wallet-adapter-react';

import { buyListedProperty } from '@/lib/kataster-chain';
import { explorerTx, protocolFeeAtomic, toAtomicUsdc } from '@/lib/format';
import { useKatasterProgram } from '@/components/providers/kataster-providers';
import type { PropertyAsset } from '@/lib/types';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Props = { property: PropertyAsset; readonly trigger?: React.ReactNode };

export function BuyPropertyModal({ property, trigger }: Props) {
  const program = useKatasterProgram();
  const wallet = useWallet();
  const [busy, setBusy] = useState(false);

  const pricing = useMemo(() => {
    if (!property.priceUsdcHuman) return null;
    const atomic = toAtomicUsdc(property.priceUsdcHuman);
    const fee = protocolFeeAtomic(atomic);
    return {
      feeHuman: Number(fee) / 1_000_000,
      totalHuman: Number(atomic + fee) / 1_000_000,
    };
  }, [property.priceUsdcHuman]);

  async function run() {
    if (!pricing || !wallet.publicKey || !program) {
      toast.error('Connect Phantom wallet first');
      return;
    }

    const sellerKey = property.sellerWallet ?? property.owner;
    let sellerPk: PublicKey;
    try { sellerPk = new PublicKey(sellerKey); }
    catch { toast.error('Invalid seller address'); return; }

    let nftMint: PublicKey;
    try { nftMint = new PublicKey(property.mint); }
    catch { toast.error('Invalid mint address'); return; }

    const loader = toast.loading('Waiting for wallet…');
    setBusy(true);
    try {
      const { txSig } = await buyListedProperty({
        program,
        buyer: wallet.publicKey,
        seller: sellerPk,
        nftAsset: nftMint,
      });
      toast.dismiss(loader);
      toast.success('Transfer complete');
      if (txSig) window.open(explorerTx(txSig), '_blank', 'noopener');
    } catch (e) {
      console.error(e);
      toast.dismiss(loader);
      toast.error('Transaction failed — check console');
    } finally {
      setBusy(false);
    }
  }

  const canBuy = pricing && property.status === 'for_sale';

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" disabled={!canBuy}>
            Purchase deed
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <div className="border-b border-k-border pb-4">
          <DialogTitle>Deed purchase confirmation</DialogTitle>
          <p className="mt-1 text-xs text-k-muted">
            Plot {property.plotId} · {property.municipality}
          </p>
        </div>

        {!canBuy ? (
          <p className="mt-4 text-sm text-k-muted">
            This parcel is not currently listed for sale on-chain.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="divide-y divide-k-border rounded-lg border border-k-border">
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-k-muted">Listed price</span>
                <span className="text-sm text-k-text">
                  {Intl.NumberFormat().format(property.priceUsdcHuman!)} USDC
                </span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-k-muted">Protocol fee (0.5%)</span>
                <span className="text-sm text-k-text">{pricing!.feeHuman.toFixed(4)} USDC</span>
              </div>
              <div className="flex justify-between rounded-b-lg bg-k-raised px-4 py-3">
                <span className="text-sm font-semibold text-k-text">Total debit</span>
                <span className="text-base font-bold text-k-accent">{pricing!.totalHuman.toFixed(3)} USDC</span>
              </div>
            </div>

            <Button onClick={() => run()} disabled={busy} className="w-full justify-center" size="lg">
              {busy ? (
                <>
                  <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-k-bg border-t-transparent" />
                  Signing…
                </>
              ) : (
                'Authorize atomic swap'
              )}
            </Button>

            <p className="text-center text-xs text-k-muted">
              Phantom wallet required · Devnet USDC only
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
