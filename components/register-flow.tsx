'use client';

import Link from 'next/link';
import type { LatLngLiteral, Polygon as LeafletPolygon } from 'leaflet';
import * as Leaflet from 'leaflet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextArea } from '@/components/ui/textarea';
import { useKatasterProgram } from '@/components/providers/kataster-providers';

import { MK_MUNICIPALITIES } from '@/lib/mk-municipalities';
import type { LandKind } from '@/lib/types';
import { polygonAreaSqM, fixLeafletIcon } from '@/lib/geo';
import { mintKatasterDeed } from '@/lib/mint-deed';
import { explorerAddress, explorerTx } from '@/lib/format';
import { listCoreProperty } from '@/lib/kataster-chain';
import { encodeLand } from '@/lib/land-type';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

type Step = 0 | 1 | 2 | 3;

function ringFromPolygon(layer: LeafletPolygon): [number, number][] {
  const raw = layer.getLatLngs();
  let ring: LatLngLiteral[] = [];
  const first = (raw as unknown[])[0];
  if (typeof first === 'object' && first !== null && 'lat' in first && 'lng' in first) {
    ring = raw as LatLngLiteral[];
  } else if (Array.isArray(first)) {
    ring = (raw as LatLngLiteral[][])[0] ?? [];
  }
  return ring.map((ll) => [ll.lat, ll.lng]);
}

const selectCls =
  'flex h-9 w-full rounded-lg border border-k-border bg-k-surface px-3 text-sm text-k-text focus:outline-none focus:border-k-accent/60 focus:ring-2 focus:ring-k-accent/20';

const STEPS = [
  { n: '01', label: 'Parcel data' },
  { n: '02', label: 'Boundary' },
  { n: '03', label: 'Documents' },
  { n: '04', label: 'Mint deed' },
] as const;

export function RegisterWizard() {
  const wallet = useWallet();
  const program = useKatasterProgram();

  const [step, setStep] = useState<Step>(0);
  const [plotId, setPlotId] = useState('MK-2847');
  const [municipality, setMunicipality] = useState('Strumica');
  const [landKind, setLandKind] = useState<LandKind>('Agricultural');
  const [area, setArea] = useState<number>(1240);
  const [description, setDescription] = useState('');

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Leaflet.Map | null>(null);
  const drawnLayerRef = useRef<Leaflet.FeatureGroup | null>(null);
  const drawCleanupRef = useRef<(() => void) | null>(null);

  const [boundary, setBoundary] = useState<[number, number][]>([
    [41.439, 22.6428], [41.4398, 22.6428], [41.4398, 22.6438], [41.439, 22.6438],
  ]);

  const [docName, setDocName] = useState<string | null>(null);
  const [docSize, setDocSize] = useState<number | null>(null);
  const [docFingerprint, setDocFingerprint] = useState('');

  const [mintResult, setMintResult] = useState<{ mint: string; signature?: string } | null>(null);
  const [minting, setMinting] = useState(false);
  const [listAfterMint, setListAfterMint] = useState(false);
  const [listPriceHuman, setListPriceHuman] = useState<number>(420);
  const [listingBusy, setListingBusy] = useState(false);

  const registeredLabel = useMemo(
    () => new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
    [],
  );

  const syncPolygonDimensions = useCallback((poly: LeafletPolygon) => {
    const ring = ringFromPolygon(poly);
    if (ring.length < 3) return;
    setBoundary(ring);
    setArea(Math.round(polygonAreaSqM(ring)));
  }, []);

  const processFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') { toast.error('PDF only'); return; }
    try {
      setDocName(file.name);
      setDocSize(file.size);
      const buffer = await file.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', buffer);
      const bytes = Array.from(new Uint8Array(digest));
      setDocFingerprint(`sha256:${bytes.map((b) => b.toString(16).padStart(2, '0')).join('')}`);
      toast.success('Document fingerprinted');
    } catch (error) {
      console.error(error);
      toast.error('Could not fingerprint document');
    }
  }, []);

  useEffect(() => {
    if (step !== 1) return;
    if (!mapRef.current || typeof window === 'undefined') return;

    fixLeafletIcon();
    let cancelled = false;

    void (async () => {
      await import('leaflet-draw');
      if (cancelled || !mapRef.current) return;

      const map = Leaflet.map(mapRef.current, {
        zoomControl: false, scrollWheelZoom: true, preferCanvas: false,
        center: [41.4394, 22.6432], zoom: 16, minZoom: 6,
      });

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      Leaflet.control.zoom({ position: 'bottomright' }).addTo(map);

      const fg = new Leaflet.FeatureGroup();
      fg.addTo(map);
      drawnLayerRef.current = fg;

      const polygon = Leaflet.polygon(boundary, {
        color: '#5c7d46', fillColor: '#5c7d46', weight: 2, fillOpacity: 0.15,
      });
      polygon.addTo(fg);
      map.fitBounds(polygon.getBounds().pad(0.05));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const LDraw = Leaflet as any;
      const drawControl = new LDraw.Control.Draw({
        edit: { featureGroup: fg },
        draw: { polygon: true, polyline: false, rectangle: false, circle: false, circlemarker: false, marker: false },
      });
      map.addControl(drawControl);

      const createdType = String(LDraw.Draw.Event?.CREATED ?? 'draw:created');
      const editedType  = String(LDraw.Draw.Event?.EDITED  ?? 'draw:edited');

      const onCreated = (e: Leaflet.LeafletEvent & { layer: Leaflet.Layer }) => {
        fg.clearLayers();
        if (e.layer instanceof Leaflet.Polygon) { e.layer.addTo(fg); syncPolygonDimensions(e.layer); }
      };
      const onEdited = (e: Leaflet.LeafletEvent & { layers: Leaflet.LayerGroup }) => {
        e.layers.eachLayer((layer) => { if (layer instanceof Leaflet.Polygon) syncPolygonDimensions(layer); });
      };

      map.on(createdType, onCreated as Leaflet.LeafletEventHandlerFn);
      map.on(editedType,  onEdited  as Leaflet.LeafletEventHandlerFn);
      mapInstance.current = map;

      drawCleanupRef.current = () => {
        map.off(createdType, onCreated as Leaflet.LeafletEventHandlerFn);
        map.off(editedType,  onEdited  as Leaflet.LeafletEventHandlerFn);
        map.remove();
        mapInstance.current = null;
        drawnLayerRef.current = null;
      };
    })();

    return () => {
      cancelled = true;
      drawCleanupRef.current?.();
      drawCleanupRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  async function handleMint() {
    if (!wallet.connected || !wallet.publicKey || !wallet.wallet) {
      toast.error('Connect Phantom on Devnet'); return;
    }
    if (!docFingerprint) { toast.error('Document hash required'); return; }

    setMinting(true);
    const loader = toast.loading('Minting deed…');
    try {
      const { mint, signature } = await mintKatasterDeed({
        signer: wallet.wallet?.adapter, plotId, municipality, landKind,
        description, areaHuman: area, boundary, docFingerprint, registeredHuman: registeredLabel,
      });
      setMintResult({ mint, signature });

      if (listAfterMint && program) {
        setListingBusy(true);
        toast.loading('Submitting escrow listing…', { id: loader });
        await listCoreProperty({
          program, seller: wallet.publicKey, nftAsset: new PublicKey(mint),
          plotId, municipality, landType: encodeLand(landKind), areaM2: BigInt(area), priceUsdcHuman: listPriceHuman,
        });
        toast.success('Deed minted and listed', { id: loader });
      } else {
        toast.success('Deed minted', { id: loader });
      }
    } catch (error) {
      console.error(error);
      toast.error('Mint failed — check console', { id: loader });
    } finally {
      setMinting(false);
      setListingBusy(false);
    }
  }

  async function listExistingDeed() {
    if (!wallet.publicKey || !program || !mintResult?.mint) {
      toast.error('Connect wallet and finish mint'); return;
    }
    setListingBusy(true);
    const lid = toast.loading('Listing deed…');
    try {
      await listCoreProperty({
        program, seller: wallet.publicKey, nftAsset: new PublicKey(mintResult.mint),
        plotId, municipality, landType: encodeLand(landKind), areaM2: BigInt(area), priceUsdcHuman: listPriceHuman,
      });
      toast.success('Listed for USDC escrow', { id: lid });
    } catch (e) {
      console.error(e);
      toast.error('Listing failed', { id: lid });
    } finally {
      setListingBusy(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* Step indicator */}
      <div className="grid grid-cols-4 gap-2">
        {STEPS.map(({ n, label }, idx) => (
          <div
            key={n}
            className={`rounded-lg border px-4 py-3 transition ${
              idx === step
                ? 'border-k-accent/40 bg-k-accentDim'
                : idx < step
                  ? 'border-k-border bg-k-surface'
                  : 'border-k-border bg-k-bg'
            }`}
          >
            <span className={`text-xs font-medium ${idx === step ? 'text-k-accent' : idx < step ? 'text-k-muted' : 'text-k-muted/40'}`}>
              {n}
            </span>
            <p className={`mt-0.5 text-xs font-semibold ${idx === step ? 'text-k-text' : 'text-k-muted/50'}`}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Step 0 — Parcel data */}
      {step === 0 && (
        <div className="rounded-xl border border-k-border shadow-card">
          <div className="border-b border-k-border bg-k-surface px-5 py-3 rounded-t-xl">
            <span className="text-xs font-semibold text-k-muted">Step 01 · Parcel identification</span>
          </div>
          <div className="space-y-5 px-5 py-6">
            <div className="space-y-1.5">
              <Label>Plot ID</Label>
              <Input value={plotId} onChange={(e) => setPlotId(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Municipality</Label>
              <select className={selectCls} value={municipality} onChange={(e) => setMunicipality(e.target.value)}>
                {MK_MUNICIPALITIES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Land type</Label>
              <select className={selectCls} value={landKind} onChange={(e) => setLandKind(e.target.value as LandKind)}>
                <option>Agricultural</option>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Declared area (m²)</Label>
              <Input type="number" min={1} value={area} onChange={(e) => setArea(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <TextArea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end rounded-b-xl border-t border-k-border px-5 py-4">
            <Button onClick={() => setStep(1)}>Continue →</Button>
          </div>
        </div>
      )}

      {/* Step 1 — Boundary */}
      {step === 1 && (
        <div className="rounded-xl border border-k-border shadow-card">
          <div className="border-b border-k-border bg-k-surface px-5 py-3 rounded-t-xl">
            <span className="text-xs font-semibold text-k-muted">Step 02 · Boundary survey</span>
          </div>
          <div className="space-y-5 px-5 py-6">
            <p className="text-sm text-k-muted">
              Use the polygon tool in the map toolbar to draw the parcel boundary.
              Drag vertices to adjust. Area is recalculated automatically.
            </p>
            <div ref={mapRef} className="h-[420px] overflow-hidden rounded-lg border border-k-border" />
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-k-border px-4 py-3">
                <span className="text-xs text-k-muted">Computed area</span>
                <p className="mt-1 text-xl font-bold text-k-accent">{area} m²</p>
              </div>
              <div className="rounded-lg border border-k-border px-4 py-3">
                <span className="text-xs text-k-muted">Vertices</span>
                <p className="mt-1 text-xl font-bold text-k-text">{boundary.length}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Raw coordinates (lat, lng)</Label>
              <TextArea value={JSON.stringify(boundary, null, 2)} readOnly className="font-mono text-[10px]" />
            </div>
          </div>
          <div className="flex justify-between rounded-b-xl border-t border-k-border px-5 py-4">
            <Button variant="ghost" onClick={() => setStep(0)}>← Back</Button>
            <Button onClick={() => setStep(2)}>Continue →</Button>
          </div>
        </div>
      )}

      {/* Step 2 — Documents */}
      {step === 2 && (
        <div className="rounded-xl border border-k-border shadow-card">
          <div className="border-b border-k-border bg-k-surface px-5 py-3 rounded-t-xl">
            <span className="text-xs font-semibold text-k-muted">Step 03 · Document fingerprint</span>
          </div>
          <div className="space-y-5 px-5 py-6">
            <p className="text-sm text-k-muted">
              Upload the official cadastral PDF document.
              A SHA-256 hash will be computed and stored in the deed asset as proof of authenticity.
            </p>

            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-k-border bg-k-bg py-12 text-center transition hover:border-k-accent/40 hover:bg-k-accentDim/30"
              role="presentation"
              tabIndex={0}
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) await processFile(file);
              }}
            >
              <span className="text-xs text-k-muted">Drag & drop PDF or</span>
              <label className="cursor-pointer text-sm font-medium text-k-text underline underline-offset-4">
                Browse file
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await processFile(file);
                  }}
                />
              </label>
            </div>

            {docName && (
              <div className="rounded-lg border border-k-accent/30 bg-k-accentDim px-4 py-3">
                <p className="text-sm font-medium text-k-accent">Document accepted</p>
                <p className="mt-1 text-xs text-k-muted">
                  {docName} · {((docSize ?? 0) / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            {docFingerprint && (
              <div className="space-y-1.5">
                <Label>SHA-256 fingerprint</Label>
                <p className="break-all font-mono text-[10px] text-k-text">{docFingerprint}</p>
              </div>
            )}
          </div>
          <div className="flex justify-between rounded-b-xl border-t border-k-border px-5 py-4">
            <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
            <Button disabled={!docFingerprint} onClick={() => setStep(3)}>Continue →</Button>
          </div>
        </div>
      )}

      {/* Step 3 — Mint */}
      {step === 3 && (
        <div className="rounded-xl border border-k-border shadow-card">
          <div className="border-b border-k-border bg-k-surface px-5 py-3 rounded-t-xl">
            <span className="text-xs font-semibold text-k-muted">Step 04 · Blockchain issuance</span>
          </div>
          <div className="space-y-5 px-5 py-6">

            {/* Summary */}
            <div className="divide-y divide-k-border rounded-lg border border-k-border">
              <div className="grid grid-cols-[120px_1fr] gap-4 px-4 py-3">
                <span className="text-xs text-k-muted">Plot</span>
                <span className="text-sm text-k-text">{plotId}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 px-4 py-3">
                <span className="text-xs text-k-muted">Municipality</span>
                <span className="text-sm text-k-text">{municipality}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 px-4 py-3">
                <span className="text-xs text-k-muted">Land type</span>
                <span className="text-sm text-k-text">{landKind}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 px-4 py-3">
                <span className="text-xs text-k-muted">Area</span>
                <span className="text-sm text-k-text">{area} m²</span>
              </div>
            </div>

            {!mintResult && (
              <div className="space-y-4">
                {!wallet.connected && (
                  <div className="rounded-lg border border-k-accent/30 bg-k-accentDim px-4 py-3">
                    <p className="text-sm text-k-accent">
                      Connect Phantom wallet (Devnet) to proceed.
                    </p>
                  </div>
                )}

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="size-4 rounded border border-k-border bg-k-bg accent-k-accent"
                    checked={listAfterMint}
                    disabled={!program}
                    onChange={(e) => setListAfterMint(e.target.checked)}
                  />
                  <span className="text-sm text-k-text">
                    List immediately for USDC sale
                  </span>
                </label>

                {!program && wallet.connected && (
                  <p className="text-xs text-k-muted">
                    Program client loads once the wallet exposes a signer — reconnect if stuck.
                  </p>
                )}

                {listAfterMint && (
                  <div className="space-y-1.5">
                    <Label>List price (USDC)</Label>
                    <Input
                      type="number" min={1} step={0.01} value={listPriceHuman}
                      onChange={(e) => setListPriceHuman(Number(e.target.value))}
                    />
                  </div>
                )}
              </div>
            )}

            {mintResult && (
              <div className="space-y-4">
                <div className="rounded-lg border border-k-accent/30 bg-k-accentDim px-4 py-3">
                  <p className="text-sm font-medium text-k-accent">Deed minted successfully</p>
                  <p className="mt-1 break-all font-mono text-[10px] text-k-muted">{mintResult.mint}</p>
                </div>

                {!listAfterMint && program && wallet.publicKey && (
                  <div className="space-y-3 rounded-lg border border-k-border p-4">
                    <Label>List price (USDC)</Label>
                    <Input
                      type="number" min={1} step={0.01} value={listPriceHuman}
                      onChange={(e) => setListPriceHuman(Number(e.target.value))}
                    />
                    <Button variant="outline" disabled={listingBusy} onClick={() => void listExistingDeed()}>
                      List on escrow
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  {mintResult.signature && (
                    <a href={explorerTx(mintResult.signature)} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-k-muted underline underline-offset-4 hover:text-k-text transition">
                      Transaction ↗
                    </a>
                  )}
                  <a href={explorerAddress(mintResult.mint)} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-k-muted underline underline-offset-4 hover:text-k-text transition">
                    Asset ↗
                  </a>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/property/${mintResult.mint}`}>View deed record</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/map">Open map</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {!mintResult && (
            <div className="flex justify-between rounded-b-xl border-t border-k-border px-5 py-4">
              <Button variant="ghost" onClick={() => setStep(2)}>← Back</Button>
              <Button
                onClick={() => void handleMint()}
                disabled={minting || listingBusy || !wallet.connected}
              >
                {minting || listingBusy ? 'Working…' : 'Mint deed →'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
