'use client';

import * as Leaflet from 'leaflet';
import type { Polygon } from 'leaflet';
import { useEffect } from 'react';

import type { PropertyAsset } from '@/lib/types';

import 'leaflet/dist/leaflet.css';

import { fixLeafletIcon } from '@/lib/geo';

export default function KatMap(props: {
  readonly properties: PropertyAsset[];
  readonly highlighted?: PropertyAsset['mint'];
  readonly onSelect?: (p: PropertyAsset) => void;
}) {
  const { properties, highlighted, onSelect } = props;

  useEffect(() => {
    fixLeafletIcon();
    const node = typeof document !== 'undefined' ?
      document.querySelector<HTMLElement>('[data-map-host]')
    : null;
    if (!node) return;
    node.innerHTML = '';

    const map = Leaflet.map(node, {
      zoomControl: true,
      maxZoom: 19,
      minZoom: 6,
      center: [41.6086, 21.7453],
      zoom: 8,
    });

    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const layers: Polygon[] = [];

    properties.forEach((prop) => {
      const stroke =
        highlighted === prop.mint ?
          '#c084fc'
        : prop.status === 'for_sale' ?
          '#10b981'
        : prop.status === 'recent_sale' ?
          '#a855f7'
        : '#38bdf8';

      const ring = Leaflet.polygon(
        prop.boundary.map(([lat, lng]) => [lat, lng] as Leaflet.LatLngTuple),
        {
          color: stroke,
          weight: highlighted === prop.mint ? 4 : 2,
          dashArray: highlighted === prop.mint ? '6 10' :
            '',
          opacity:
            highlighted === prop.mint ? 0.95 :
            0.78,
          fillOpacity:
            highlighted === prop.mint ? 0.5 :
            0.29,
          fillColor: stroke,
        },
      ).addTo(map);

      ring.on('click', () => {
        onSelect?.(prop);
      });
      layers.push(ring);
    });

    if (layers.length)
      map.fitBounds(Leaflet.featureGroup(layers).getBounds(), { padding: [48, 48] });

    const resize = () => map.invalidateSize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      map.remove();
    };
  }, [highlighted, onSelect, properties]);

  return (
    <div className="relative h-full min-h-[540px] w-full overflow-hidden border border-k-border bg-k-surface">
      <div data-map-host className="absolute inset-0 [&_.leaflet-control-attribution]:text-[11px]" />
    </div>
  );
}
