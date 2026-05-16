'use client';

import React, {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
} from 'react';
import type { AnchorWallet } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import {
  AnchorProvider,
  type Idl,
  Program,
} from '@coral-xyz/anchor';
import idlRaw from '@/lib/idl/kataster_idl.json';
import {
  ConnectionProvider,
  WalletProvider,
  useAnchorWallet,
  useConnection,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import {
  DEFAULT_PROGRAM_ID,
  MPL_CORE_ID,
  SOLANA_RPC,
} from '@/lib/constants';
import { PublicKey } from '@solana/web3.js';

type KProgram = Program<Idl>;

const ProgramContext = createContext<KProgram | null>(null);

function AnchorProgramBinder({ children }: { children: ReactNode }) {
  const { connection } = useConnection();
  const wallet = useAnchorWallet() as AnchorWallet | undefined;

  const program = useMemo(() => {
    try {
      if (!wallet) return null;

      const idlObj = structuredClone(idlRaw) as Idl & {
        readonly address?: string;
      };
      const addressFinal =
        process.env.NEXT_PUBLIC_PROGRAM_ID?.length ?
          process.env.NEXT_PUBLIC_PROGRAM_ID
        : DEFAULT_PROGRAM_ID;
      Object.assign(idlObj, { address: addressFinal });

      const provider = new AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      });
      return new Program(idlObj as unknown as Idl, provider) as unknown as KProgram;
    } catch {
      return null;
    }
  }, [wallet, connection]);

  return (
    <ProgramContext.Provider value={program}>{children}</ProgramContext.Provider>
  );
}

export function KatasterProviders({ children }: { readonly children: React.ReactNode }) {
  const phantom = useMemo(() => new PhantomWalletAdapter(), []);

  const wallets = useMemo(() => [phantom], [phantom]);

  return (
    <ConnectionProvider endpoint={SOLANA_RPC} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AnchorProgramBinder>{children}</AnchorProgramBinder>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function useKatasterProgram(): KProgram | null {
  return useContext(ProgramContext);
}

export function useMplCorePublicKey(): PublicKey {
  return useMemo(() => new PublicKey(MPL_CORE_ID), []);
}
