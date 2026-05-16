'use client';

import {
  AnchorProvider,
  type Idl,
  Program,
} from '@coral-xyz/anchor';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import {
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import BN from 'bn.js';
import { MPL_CORE_ID, DEVNET_USDC as DEVNET_USDC_STR } from '@/lib/constants';

const LISTING_TAG = Buffer.from('listing_v1');
const TREASURY_TAG = Buffer.from('treasury');

export const DEVNET_USDC_PK = new PublicKey(DEVNET_USDC_STR);
export const MPL_CORE_PK = new PublicKey(MPL_CORE_ID);

export function listingVaultPda(
  programId: PublicKey,
  asset: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([LISTING_TAG, asset.toBuffer()], programId);
}

export function treasuryPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([TREASURY_TAG], programId);
}

export async function initTreasuryIfNeeded(opts: {
  program: Program<Idl>;
  authority: PublicKey;
}): Promise<string | undefined> {
  const { program, authority } = opts;
  const [t] = treasuryPda(program.programId);
  const info = await program.provider.connection.getAccountInfo(t);
  if (info) return undefined;
  const tx = await program.methods
    .initialize(authority)
    .accounts({
      payer: (program.provider as AnchorProvider).wallet.publicKey,
      treasury: t,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  return tx;
}

/** List NFT into protocol escrow vault */
export async function listCoreProperty(opts: {
  program: Program<Idl>;
  seller: PublicKey;
  nftAsset: PublicKey;
  plotId: string;
  municipality: string;
  landType: number;
  areaM2: bigint;
  priceUsdcHuman: number;
}) {
  const { program, priceUsdcHuman } = opts;
  const priceAtomic = BigInt(Math.round(priceUsdcHuman * 1_000_000));
  const [listing] = listingVaultPda(program.programId, opts.nftAsset);

  const txSig = await program.methods
    .listProperty(
      opts.plotId,
      opts.municipality,
      opts.landType,
      new BN(opts.areaM2.toString()),
      new BN(priceAtomic.toString()),
    )
    .accounts({
      seller: opts.seller,
      mplCoreProgram: MPL_CORE_PK,
      asset: opts.nftAsset,
      systemProgram: SystemProgram.programId,
      listing,
    })
    .rpc();

  return { txSig, listingPda: listing };
}

export async function buyListedProperty(opts: {
  program: Program<Idl>;
  buyer: PublicKey;
  seller: PublicKey;
  nftAsset: PublicKey;
}) {
  const { program } = opts;
  const [listingPk] = listingVaultPda(program.programId, opts.nftAsset);
  const [treasuryPk] = treasuryPda(program.programId);

  const buyerAta = getAssociatedTokenAddressSync(
    DEVNET_USDC_PK,
    opts.buyer,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const sellerAta = getAssociatedTokenAddressSync(
    DEVNET_USDC_PK,
    opts.seller,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const treasuryAta = getAssociatedTokenAddressSync(
    DEVNET_USDC_PK,
    treasuryPk,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const txSig = await program.methods
    .buyProperty()
    .accounts({
      buyer: opts.buyer,
      mplCoreProgram: MPL_CORE_PK,
      seller: opts.seller,
      listing: listingPk,
      asset: opts.nftAsset,
      systemProgram: SystemProgram.programId,
      treasuryState: treasuryPk,
      usdcMint: DEVNET_USDC_PK,
      buyerUsdc: buyerAta,
      sellerUsdc: sellerAta,
      treasuryUsdc: treasuryAta,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .rpc();

  return { txSig, listingPk, treasuryPk };
}

export async function cancelListingIx(opts: {
  program: Program<Idl>;
  listedBy: PublicKey;
  nftAsset: PublicKey;
}) {
  const [listingPk] = listingVaultPda(opts.program.programId, opts.nftAsset);

  const txSig = await opts.program.methods
    .cancelListing()
    .accounts({
      listedBy: opts.listedBy,
      mplCoreProgram: MPL_CORE_PK,
      asset: opts.nftAsset,
      systemProgram: SystemProgram.programId,
      listing: listingPk,
    })
    .rpc();

  return { txSig, listingPk };
}

export type RawListingDecoded = {
  listedBy: PublicKey;
  owner: PublicKey;
  nftAsset: PublicKey;
  priceUsdc: BN | bigint | number | string;
  plotId: string;
  municipality: string;
  landType: number;
  areaM2: BN | bigint | number | string;
  isActive: boolean;
  createdAt: BN | bigint | number | string;
  soldAt: BN | bigint | number | string;
  bump: number;
};

export function toBn(v: BN | bigint | number | string): bigint {
  if (typeof v === 'bigint') return v;
  if (typeof v === 'number') return BigInt(v);
  if (typeof v === 'string') return BigInt(v);
  return BigInt(v.toString());
}
