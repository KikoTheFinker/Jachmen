'use client';

import * as Leaflet from 'leaflet';
import type { Polygon } from 'leaflet';
import { useEffect, useRef } from 'react';

import type { PropertyAsset } from '@/lib/types';

import 'leaflet/dist/leaflet.css';

import { fixLeafletIcon } from '@/lib/geo';

const STATUS_STYLE: Record<PropertyAsset['status'], { stroke: string; fill: string; weight: number }> = {
  for_sale:    { stroke: '#d97706', fill: '#f59e0b', weight: 1.5 },
  recent_sale: { stroke: '#dc2626', fill: '#ef4444', weight: 1.5 },
  owned:       { stroke: '#52525b', fill: '#71717a', weight: 1   },
};

export default function KatMap(props: {
  readonly properties: PropertyAsset[];
  readonly highlighted?: PropertyAsset['mint'];
  readonly onSelect?: (p: PropertyAsset) => void;
}) {
  const { properties, highlighted, onSelect } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    fixLeafletIcon();

    // Destroy any previous instance cleanly before creating a new one
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = Leaflet.map(node, {
      zoomControl: false,
      maxZoom: 19,
      minZoom: 5,
      center: [41.6086, 21.7453],
      zoom: 8,
    });
    mapRef.current = map;

    Leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    Leaflet.control.zoom({ position: 'bottomright' }).addTo(map);

    const layers: Polygon[] = [];

    properties.forEach((prop) => {
      if (!prop.boundary?.length) return;

      const isHighlighted = highlighted === prop.mint;
      const { stroke, fill, weight } = STATUS_STYLE[prop.status];

      let ring: Polygon;
      try {
        ring = Leaflet.polygon(
          prop.boundary.map(([lat, lng]) => [lat, lng] as Leaflet.LatLngTuple),
          {
            color: isHighlighted ? '#1e293b' : stroke,
            weight: isHighlighted ? 2.5 : weight,
            opacity: isHighlighted ? 1 : 0.9,
            fillColor: fill,
            fillOpacity: isHighlighted ? 0.65 : 0.38,
          },
        );
      } catch {
        return;
      }

      ring.addTo(map);

      ring.on('mouseover', () => {
        if (!isHighlighted) ring.setStyle({ fillOpacity: 0.6, weight: 2, opacity: 1 });
      });
      ring.on('mouseout', () => {
        if (!isHighlighted) ring.setStyle({ fillOpacity: 0.38, weight, opacity: 0.9 });
      });
      ring.on('click', () => {
        onSelect?.(prop);
        try {
          map.flyToBounds(ring.getBounds(), { padding: [60, 60], duration: 0.5 });
        } catch { /* map may be mid-teardown */ }
      });

      layers.push(ring);
    });

    if (highlighted) {
      const idx = properties.findIndex((p) => p.mint === highlighted);
      if (layers[idx]) {
        try { map.flyToBounds(layers[idx].getBounds(), { padding: [80, 80], duration: 0.6 }); }
        catch { /* ignore */ }
      }
    } else if (layers.length) {
      try { map.fitBounds(Leaflet.featureGroup(layers).getBounds(), { padding: [48, 48] }); }
      catch { /* ignore */ }
    }

    const resize = () => {
      try { map.invalidateSize(); } catch { /* ignore */ }
    };
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      // Let Leaflet clean up its own DOM — do NOT touch innerHTML
      try { map.remove(); } catch { /* ignore */ }
      if (mapRef.current === map) mapRef.current = null;
    };
  }, [highlighted, onSelect, properties]);

  return (
    <div className="relative h-full min-h-[540px] w-full overflow-hidden bg-[#f0f0e8]">
      <div
        ref={containerRef}
        className="absolute inset-0 [&_.leaflet-control-attribution]:bg-white/70 [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:text-zinc-400 [&_.leaflet-control-attribution]:backdrop-blur-sm [&_.leaflet-control-attribution]:rounded [&_.leaflet-control-attribution]:border-0 [&_.leaflet-control-zoom]:shadow-md [&_.leaflet-control-zoom-in]:bg-white [&_.leaflet-control-zoom-in]:text-zinc-700 [&_.leaflet-control-zoom-out]:bg-white [&_.leaflet-control-zoom-out]:text-zinc-700"
      />

      {/* Floating legend */}
      <div className="pointer-events-none absolute bottom-10 left-3 z-[400] flex flex-col gap-1.5 rounded-lg border border-zinc-200 bg-white/90 px-3 py-2.5 shadow-md backdrop-blur-sm">
        <LegendDot color="#f59e0b" label="For sale" />
        <LegendDot color="#ef4444" label="Recent transfer" />
        <LegendDot color="#71717a" label="Owned" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
      <span className="text-[11px] text-zinc-500">{label}</span>
    </div>
  );
}
