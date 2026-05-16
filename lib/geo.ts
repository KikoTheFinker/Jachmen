/** Coordinates are **[lat, lng]** (matching Leaflet) */

export function polygonAreaSqM(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  const R = 6371009;
  const meanLatDeg = coords.reduce((a, [lat]) => a + lat, 0) / coords.length;
  const cosLat = Math.cos((meanLatDeg * Math.PI) / 180);

  let acc = 0;
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const [lat1, lng1] = coords[i]!;
    const [lat2, lng2] = coords[(i + 1) % n]!;
    const x1 = ((lng1 * Math.PI) / 180) * R * cosLat;
    const y1 = ((lat1 * Math.PI) / 180) * R;
    const x2 = ((lng2 * Math.PI) / 180) * R * cosLat;
    const y2 = ((lat2 * Math.PI) / 180) * R;
    acc += x1 * y2 - x2 * y1;
  }
  return Math.abs(acc / 2);
}

export function centerOf(coords: [number, number][]): [number, number] {
  if (!coords.length) return [41.6086, 21.7453];
  const [lat, lng] = coords.reduce<[number, number]>(
    (a, [lt, ln]) => [a[0] + lt, a[1] + ln],
    [0, 0]
  );
  const n = coords.length;
  return [lat / n, lng / n];
}

/** Fix leaflet default icon paths inside Next/webpack */
export function fixLeafletIcon(): void {
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}
