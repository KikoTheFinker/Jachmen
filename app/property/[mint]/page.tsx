import type { Metadata } from 'next';

import { PropertyDetail } from '@/components/property-detail';

type Props = { params: { mint: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Plot ${shortenMint(params.mint)} — Kataster Chain`,
    description: 'Metaplex Core deed detail, kataster escrow, and Phantom buy flow.',
  };
}

function shortenMint(mint: string) {
  if (mint.length < 14) return mint;
  return `${mint.slice(0, 6)}…${mint.slice(-4)}`;
}

export default function PropertyPage({ params }: Props) {
  return (
    <section className="space-y-8">
      <PropertyDetail mint={params.mint} />
    </section>
  );
}
