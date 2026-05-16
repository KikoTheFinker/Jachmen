import { PublicKey } from '@solana/web3.js';
import type { LandKind, PropertyAsset } from '@/lib/types';

export function demoPubkey(seed: string): PublicKey {
  const b = Buffer.alloc(32);
  Buffer.from(seed, 'utf8').copy(b);
  return new PublicKey(b);
}

/** dx = lat half-width, dy = lng half-width. Values tuned for visible-but-realistic parcel sizes. */
function box(lat: number, lng: number, dx: number, dy: number): [number, number][] {
  return [
    [lat - dx, lng - dy],
    [lat + dx, lng - dy],
    [lat + dx, lng + dy],
    [lat - dx, lng + dy],
  ];
}

// Parcel sizes by land type — small enough to look like real parcels, large enough to see at zoom 12
const SZ: Record<LandKind, [number, number]> = {
  Residential:  [0.0006, 0.0008],
  Commercial:   [0.0009, 0.0012],
  Agricultural: [0.0018, 0.0024],
  Industrial:   [0.0012, 0.0016],
};

type Seed = Omit<PropertyAsset, 'mint' | 'owner' | 'boundary' | 'centerLat' | 'centerLng'> & {
  lat: number; lng: number;
};

const NOW = Math.floor(Date.now() / 1000);

const SEEDS: Seed[] = [
  // ── Skopje (capital, dense residential + commercial) ──────────────────
  { plotId:'MK-0001', municipality:'Skopje', landType:'Residential',  areaM2:320,   lat:42.0020, lng:21.4050, status:'owned',       registeredDate:'2025-11-12' },
  { plotId:'MK-0002', municipality:'Skopje', landType:'Residential',  areaM2:410,   lat:42.0020, lng:21.4120, status:'for_sale',     priceUsdcHuman:42000, priceAtomic:BigInt(42000*1_000_000), registeredDate:'2025-11-13' },
  { plotId:'MK-0003', municipality:'Skopje', landType:'Residential',  areaM2:290,   lat:42.0020, lng:21.4190, status:'owned',       registeredDate:'2025-11-14' },
  { plotId:'MK-0004', municipality:'Skopje', landType:'Commercial',   areaM2:850,   lat:42.0020, lng:21.4280, status:'for_sale',     priceUsdcHuman:120000, priceAtomic:BigInt(120000*1_000_000), registeredDate:'2025-12-01' },
  { plotId:'MK-0005', municipality:'Skopje', landType:'Residential',  areaM2:380,   lat:42.0090, lng:21.4060, status:'owned',       registeredDate:'2025-12-03' },
  { plotId:'MK-0006', municipality:'Skopje', landType:'Residential',  areaM2:430,   lat:42.0090, lng:21.4135, status:'recent_sale', soldAtUnix:NOW-86400*2,  registeredDate:'2026-01-08' },
  { plotId:'MK-0007', municipality:'Skopje', landType:'Commercial',   areaM2:1200,  lat:42.0090, lng:21.4230, status:'for_sale',     priceUsdcHuman:195000, priceAtomic:BigInt(195000*1_000_000), registeredDate:'2026-01-15' },
  { plotId:'MK-0008', municipality:'Skopje', landType:'Residential',  areaM2:350,   lat:42.0090, lng:21.4320, status:'owned',       registeredDate:'2026-01-20' },
  { plotId:'MK-0009', municipality:'Skopje', landType:'Industrial',   areaM2:4800,  lat:42.0160, lng:21.4070, status:'owned',       registeredDate:'2026-01-22' },
  { plotId:'MK-0010', municipality:'Skopje', landType:'Residential',  areaM2:460,   lat:42.0160, lng:21.4160, status:'for_sale',     priceUsdcHuman:55000, priceAtomic:BigInt(55000*1_000_000), registeredDate:'2026-02-01' },
  { plotId:'MK-0011', municipality:'Skopje', landType:'Residential',  areaM2:510,   lat:42.0160, lng:21.4245, status:'owned',       registeredDate:'2026-02-05' },
  { plotId:'MK-0012', municipality:'Skopje', landType:'Commercial',   areaM2:960,   lat:42.0160, lng:21.4340, status:'recent_sale', soldAtUnix:NOW-86400*4,  registeredDate:'2026-02-10' },
  { plotId:'MK-0013', municipality:'Skopje', landType:'Residential',  areaM2:280,   lat:41.9950, lng:21.4080, status:'owned',       registeredDate:'2026-02-12' },
  { plotId:'MK-0014', municipality:'Skopje', landType:'Residential',  areaM2:330,   lat:41.9950, lng:21.4155, status:'for_sale',     priceUsdcHuman:38000, priceAtomic:BigInt(38000*1_000_000), registeredDate:'2026-02-14' },
  { plotId:'MK-0015', municipality:'Skopje', landType:'Agricultural', areaM2:5200,  lat:41.9950, lng:21.4250, status:'owned',       registeredDate:'2026-02-16' },
  { plotId:'MK-0016', municipality:'Skopje', landType:'Industrial',   areaM2:6100,  lat:41.9880, lng:21.4350, status:'for_sale',     priceUsdcHuman:280000, priceAtomic:BigInt(280000*1_000_000), registeredDate:'2026-02-18' },

  // ── Bitola ────────────────────────────────────────────────────────────
  { plotId:'MK-0017', municipality:'Bitola',  landType:'Residential',  areaM2:420,   lat:41.0310, lng:21.3280, status:'owned',       registeredDate:'2025-10-05' },
  { plotId:'MK-0018', municipality:'Bitola',  landType:'Residential',  areaM2:390,   lat:41.0310, lng:21.3360, status:'for_sale',     priceUsdcHuman:18000, priceAtomic:BigInt(18000*1_000_000), registeredDate:'2025-10-06' },
  { plotId:'MK-0019', municipality:'Bitola',  landType:'Agricultural', areaM2:8400,  lat:41.0370, lng:21.3300, status:'owned',       registeredDate:'2025-10-08' },
  { plotId:'MK-0020', municipality:'Bitola',  landType:'Commercial',   areaM2:730,   lat:41.0370, lng:21.3400, status:'for_sale',     priceUsdcHuman:52000, priceAtomic:BigInt(52000*1_000_000), registeredDate:'2025-10-10' },
  { plotId:'MK-0021', municipality:'Bitola',  landType:'Residential',  areaM2:475,   lat:41.0240, lng:21.3320, status:'owned',       registeredDate:'2025-10-12' },
  { plotId:'MK-0022', municipality:'Bitola',  landType:'Agricultural', areaM2:12000, lat:41.0240, lng:21.3430, status:'recent_sale', soldAtUnix:NOW-86400*5,  registeredDate:'2025-10-15' },
  { plotId:'MK-0023', municipality:'Bitola',  landType:'Residential',  areaM2:310,   lat:41.0430, lng:21.3250, status:'owned',       registeredDate:'2025-10-18' },
  { plotId:'MK-0024', municipality:'Bitola',  landType:'Industrial',   areaM2:5500,  lat:41.0430, lng:21.3400, status:'for_sale',     priceUsdcHuman:95000, priceAtomic:BigInt(95000*1_000_000), registeredDate:'2025-10-20' },

  // ── Ohrid ─────────────────────────────────────────────────────────────
  { plotId:'MK-0025', municipality:'Ohrid',   landType:'Residential',  areaM2:540,   lat:41.1240, lng:20.8010, status:'owned',       registeredDate:'2025-09-12' },
  { plotId:'MK-0026', municipality:'Ohrid',   landType:'Commercial',   areaM2:1100,  lat:41.1240, lng:20.8130, status:'for_sale',     priceUsdcHuman:145000, priceAtomic:BigInt(145000*1_000_000), registeredDate:'2025-09-14' },
  { plotId:'MK-0027', municipality:'Ohrid',   landType:'Residential',  areaM2:480,   lat:41.1310, lng:20.8060, status:'owned',       registeredDate:'2025-09-16' },
  { plotId:'MK-0028', municipality:'Ohrid',   landType:'Agricultural', areaM2:6800,  lat:41.1180, lng:20.8080, status:'recent_sale', soldAtUnix:NOW-86400*3,  registeredDate:'2025-09-18' },
  { plotId:'MK-0029', municipality:'Ohrid',   landType:'Residential',  areaM2:360,   lat:41.1310, lng:20.7950, status:'for_sale',     priceUsdcHuman:68000, priceAtomic:BigInt(68000*1_000_000), registeredDate:'2025-09-20' },
  { plotId:'MK-0030', municipality:'Ohrid',   landType:'Commercial',   areaM2:890,   lat:41.1170, lng:20.7970, status:'owned',       registeredDate:'2025-09-22' },

  // ── Tetovo ────────────────────────────────────────────────────────────
  { plotId:'MK-0031', municipality:'Tetovo',  landType:'Residential',  areaM2:390,   lat:42.0080, lng:20.9700, status:'owned',       registeredDate:'2025-11-02' },
  { plotId:'MK-0032', municipality:'Tetovo',  landType:'Agricultural', areaM2:9500,  lat:42.0080, lng:20.9840, status:'for_sale',     priceUsdcHuman:22000, priceAtomic:BigInt(22000*1_000_000), registeredDate:'2025-11-04' },
  { plotId:'MK-0033', municipality:'Tetovo',  landType:'Residential',  areaM2:440,   lat:42.0150, lng:20.9740, status:'owned',       registeredDate:'2025-11-06' },
  { plotId:'MK-0034', municipality:'Tetovo',  landType:'Commercial',   areaM2:780,   lat:41.9990, lng:20.9770, status:'for_sale',     priceUsdcHuman:60000, priceAtomic:BigInt(60000*1_000_000), registeredDate:'2025-11-08' },
  { plotId:'MK-0035', municipality:'Tetovo',  landType:'Agricultural', areaM2:14000, lat:42.0220, lng:20.9600, status:'owned',       registeredDate:'2025-11-10' },
  { plotId:'MK-0036', municipality:'Tetovo',  landType:'Industrial',   areaM2:4200,  lat:41.9950, lng:20.9880, status:'recent_sale', soldAtUnix:NOW-86400*6,  registeredDate:'2025-11-12' },

  // ── Strumica ──────────────────────────────────────────────────────────
  { plotId:'MK-0037', municipality:'Strumica', landType:'Agricultural', areaM2:4600,  lat:41.4400, lng:22.6420, status:'owned',       registeredDate:'2026-01-05' },
  { plotId:'MK-0038', municipality:'Strumica', landType:'Agricultural', areaM2:7200,  lat:41.4400, lng:22.6600, status:'for_sale',     priceUsdcHuman:9500, priceAtomic:BigInt(9500*1_000_000), registeredDate:'2026-01-07' },
  { plotId:'MK-0039', municipality:'Strumica', landType:'Residential',  areaM2:380,   lat:41.4470, lng:22.6500, status:'owned',       registeredDate:'2026-01-09' },
  { plotId:'MK-0040', municipality:'Strumica', landType:'Agricultural', areaM2:11000, lat:41.4330, lng:22.6530, status:'for_sale',     priceUsdcHuman:14000, priceAtomic:BigInt(14000*1_000_000), registeredDate:'2026-01-11' },
  { plotId:'MK-0041', municipality:'Strumica', landType:'Commercial',   areaM2:650,   lat:41.4460, lng:22.6380, status:'owned',       registeredDate:'2026-01-13' },
  { plotId:'MK-0042', municipality:'Strumica', landType:'Agricultural', areaM2:8800,  lat:41.4350, lng:22.6660, status:'recent_sale', soldAtUnix:NOW-86400*1,  registeredDate:'2026-01-15' },

  // ── Kumanovo ──────────────────────────────────────────────────────────
  { plotId:'MK-0043', municipality:'Kumanovo', landType:'Residential',  areaM2:460,   lat:42.1310, lng:21.7120, status:'owned',       registeredDate:'2025-12-10' },
  { plotId:'MK-0044', municipality:'Kumanovo', landType:'Residential',  areaM2:510,   lat:42.1310, lng:21.7210, status:'for_sale',     priceUsdcHuman:29000, priceAtomic:BigInt(29000*1_000_000), registeredDate:'2025-12-12' },
  { plotId:'MK-0045', municipality:'Kumanovo', landType:'Industrial',   areaM2:7300,  lat:42.1380, lng:21.7160, status:'owned',       registeredDate:'2025-12-14' },
  { plotId:'MK-0046', municipality:'Kumanovo', landType:'Agricultural', areaM2:10500, lat:42.1240, lng:21.7260, status:'for_sale',     priceUsdcHuman:18000, priceAtomic:BigInt(18000*1_000_000), registeredDate:'2025-12-16' },
  { plotId:'MK-0047', municipality:'Kumanovo', landType:'Residential',  areaM2:330,   lat:42.1440, lng:21.7090, status:'owned',       registeredDate:'2025-12-18' },

  // ── Štip ──────────────────────────────────────────────────────────────
  { plotId:'MK-0048', municipality:'Štip',     landType:'Residential',  areaM2:420,   lat:41.7360, lng:22.1940, status:'owned',       registeredDate:'2025-10-22' },
  { plotId:'MK-0049', municipality:'Štip',     landType:'Agricultural', areaM2:6200,  lat:41.7360, lng:22.2100, status:'for_sale',     priceUsdcHuman:11000, priceAtomic:BigInt(11000*1_000_000), registeredDate:'2025-10-24' },
  { plotId:'MK-0050', municipality:'Štip',     landType:'Commercial',   areaM2:840,   lat:41.7290, lng:22.2010, status:'owned',       registeredDate:'2025-10-26' },
  { plotId:'MK-0051', municipality:'Štip',     landType:'Residential',  areaM2:370,   lat:41.7430, lng:22.2060, status:'recent_sale', soldAtUnix:NOW-86400*2,  registeredDate:'2025-10-28' },

  // ── Veles ─────────────────────────────────────────────────────────────
  { plotId:'MK-0052', municipality:'Veles',    landType:'Residential',  areaM2:450,   lat:41.7150, lng:21.7730, status:'owned',       registeredDate:'2025-11-20' },
  { plotId:'MK-0053', municipality:'Veles',    landType:'Agricultural', areaM2:8900,  lat:41.7150, lng:21.7890, status:'for_sale',     priceUsdcHuman:13500, priceAtomic:BigInt(13500*1_000_000), registeredDate:'2025-11-22' },
  { plotId:'MK-0054', municipality:'Veles',    landType:'Industrial',   areaM2:5100,  lat:41.7220, lng:21.7800, status:'owned',       registeredDate:'2025-11-24' },
  { plotId:'MK-0055', municipality:'Veles',    landType:'Commercial',   areaM2:710,   lat:41.7070, lng:21.7820, status:'for_sale',     priceUsdcHuman:44000, priceAtomic:BigInt(44000*1_000_000), registeredDate:'2025-11-26' },

  // ── Gostivar ──────────────────────────────────────────────────────────
  { plotId:'MK-0056', municipality:'Gostivar', landType:'Residential',  areaM2:490,   lat:41.7950, lng:20.9070, status:'owned',       registeredDate:'2025-12-20' },
  { plotId:'MK-0057', municipality:'Gostivar', landType:'Agricultural', areaM2:7700,  lat:41.8030, lng:20.9150, status:'for_sale',     priceUsdcHuman:8500, priceAtomic:BigInt(8500*1_000_000), registeredDate:'2025-12-22' },
  { plotId:'MK-0058', municipality:'Gostivar', landType:'Residential',  areaM2:350,   lat:41.7880, lng:20.9120, status:'owned',       registeredDate:'2025-12-24' },

  // ── Kavadarci ─────────────────────────────────────────────────────────
  { plotId:'MK-0059', municipality:'Kavadarci', landType:'Agricultural', areaM2:9300,  lat:41.4330, lng:22.0100, status:'owned',       registeredDate:'2025-09-05' },
  { plotId:'MK-0060', municipality:'Kavadarci', landType:'Residential',  areaM2:410,   lat:41.4390, lng:22.0200, status:'for_sale',     priceUsdcHuman:21000, priceAtomic:BigInt(21000*1_000_000), registeredDate:'2025-09-07' },
  { plotId:'MK-0061', municipality:'Kavadarci', landType:'Agricultural', areaM2:13000, lat:41.4260, lng:22.0050, status:'recent_sale', soldAtUnix:NOW-86400*5,  registeredDate:'2025-09-09' },

  // ── Kočani ────────────────────────────────────────────────────────────
  { plotId:'MK-0062', municipality:'Kočani',   landType:'Agricultural', areaM2:5600,  lat:41.9170, lng:22.4090, status:'owned',       registeredDate:'2025-10-30' },
  { plotId:'MK-0063', municipality:'Kočani',   landType:'Residential',  areaM2:390,   lat:41.9230, lng:22.4180, status:'for_sale',     priceUsdcHuman:16000, priceAtomic:BigInt(16000*1_000_000), registeredDate:'2025-11-01' },
  { plotId:'MK-0064', municipality:'Kočani',   landType:'Agricultural', areaM2:8100,  lat:41.9100, lng:22.4200, status:'owned',       registeredDate:'2025-11-03' },

  // ── Gevgelija ─────────────────────────────────────────────────────────
  { plotId:'MK-0065', municipality:'Gevgelija', landType:'Agricultural', areaM2:6400,  lat:41.1410, lng:22.5010, status:'for_sale',     priceUsdcHuman:7200, priceAtomic:BigInt(7200*1_000_000), registeredDate:'2025-08-15' },
  { plotId:'MK-0066', municipality:'Gevgelija', landType:'Residential',  areaM2:430,   lat:41.1470, lng:22.5090, status:'owned',       registeredDate:'2025-08-17' },

  // ── Negotino ──────────────────────────────────────────────────────────
  { plotId:'MK-0067', municipality:'Negotino',  landType:'Agricultural', areaM2:11500, lat:41.4820, lng:22.0880, status:'owned',       registeredDate:'2025-09-25' },
  { plotId:'MK-0068', municipality:'Negotino',  landType:'Residential',  areaM2:360,   lat:41.4880, lng:22.0960, status:'for_sale',     priceUsdcHuman:14500, priceAtomic:BigInt(14500*1_000_000), registeredDate:'2025-09-27' },

  // ── Struga ────────────────────────────────────────────────────────────
  { plotId:'MK-0069', municipality:'Struga',    landType:'Commercial',   areaM2:920,   lat:41.1780, lng:20.6760, status:'for_sale',     priceUsdcHuman:88000, priceAtomic:BigInt(88000*1_000_000), registeredDate:'2025-08-20' },
  { plotId:'MK-0070', municipality:'Struga',    landType:'Agricultural', areaM2:7500,  lat:41.1720, lng:20.6850, status:'owned',       registeredDate:'2025-08-22' },

  // ── Vinica ────────────────────────────────────────────────────────────
  { plotId:'MK-0071', municipality:'Vinica',    landType:'Agricultural', areaM2:9200,  lat:41.8820, lng:22.5060, status:'owned',       registeredDate:'2025-10-01' },

  // ── Berovo ────────────────────────────────────────────────────────────
  { plotId:'MK-0072', municipality:'Berovo',    landType:'Agricultural', areaM2:16000, lat:41.7040, lng:22.8550, status:'for_sale',     priceUsdcHuman:5800, priceAtomic:BigInt(5800*1_000_000), registeredDate:'2025-09-30' },

  // ── Sveti Nikole ──────────────────────────────────────────────────────
  { plotId:'MK-0073', municipality:'Sveti Nikole', landType:'Agricultural', areaM2:7800, lat:41.8660, lng:21.9430, status:'owned',     registeredDate:'2025-11-15' },

  // ── Kratovo ───────────────────────────────────────────────────────────
  { plotId:'MK-0074', municipality:'Kratovo',   landType:'Agricultural', areaM2:10200, lat:42.0730, lng:22.1750, status:'for_sale',    priceUsdcHuman:6500, priceAtomic:BigInt(6500*1_000_000), registeredDate:'2025-11-17' },

  // ── Kriva Palanka ─────────────────────────────────────────────────────
  { plotId:'MK-0075', municipality:'Kriva Palanka', landType:'Agricultural', areaM2:8600, lat:42.2010, lng:22.3300, status:'owned',    registeredDate:'2025-12-05' },

  // ── Delčevo ───────────────────────────────────────────────────────────
  { plotId:'MK-0076', municipality:'Delčevo',   landType:'Agricultural', areaM2:12500, lat:41.9690, lng:22.7680, status:'recent_sale', soldAtUnix:NOW-86400*6, registeredDate:'2025-12-08' },

  // ── Debar ─────────────────────────────────────────────────────────────
  { plotId:'MK-0077', municipality:'Debar',     landType:'Agricultural', areaM2:9800,  lat:41.5250, lng:20.5250, status:'owned',       registeredDate:'2025-10-14' },

  // ── Resen ─────────────────────────────────────────────────────────────
  { plotId:'MK-0078', municipality:'Resen',     landType:'Agricultural', areaM2:14500, lat:40.9340, lng:21.0110, status:'for_sale',     priceUsdcHuman:4900, priceAtomic:BigInt(4900*1_000_000), registeredDate:'2025-10-16' },

  // ── Kičevo ────────────────────────────────────────────────────────────
  { plotId:'MK-0079', municipality:'Kičevo',    landType:'Agricultural', areaM2:11000, lat:41.5140, lng:20.9560, status:'owned',       registeredDate:'2025-10-18' },
  { plotId:'MK-0080', municipality:'Kičevo',    landType:'Residential',  areaM2:460,   lat:41.5210, lng:20.9640, status:'for_sale',     priceUsdcHuman:12000, priceAtomic:BigInt(12000*1_000_000), registeredDate:'2025-10-20' },

  // ── Radoviš ───────────────────────────────────────────────────────────
  { plotId:'MK-0081', municipality:'Radoviš',   landType:'Agricultural', areaM2:8300,  lat:41.6380, lng:22.4700, status:'owned',       registeredDate:'2025-09-10' },
  { plotId:'MK-0082', municipality:'Radoviš',   landType:'Agricultural', areaM2:11200, lat:41.6320, lng:22.4820, status:'for_sale',     priceUsdcHuman:7800, priceAtomic:BigInt(7800*1_000_000), registeredDate:'2025-09-12' },
  { plotId:'MK-0083', municipality:'Radoviš',   landType:'Residential',  areaM2:410,   lat:41.6450, lng:22.4760, status:'owned',       registeredDate:'2025-09-14' },

  // ── Valandovo ─────────────────────────────────────────────────────────
  { plotId:'MK-0084', municipality:'Valandovo',  landType:'Agricultural', areaM2:9600,  lat:41.3190, lng:22.5610, status:'owned',       registeredDate:'2025-08-05' },
  { plotId:'MK-0085', municipality:'Valandovo',  landType:'Agricultural', areaM2:13400, lat:41.3130, lng:22.5730, status:'for_sale',     priceUsdcHuman:6100, priceAtomic:BigInt(6100*1_000_000), registeredDate:'2025-08-07' },

  // ── Demir Kapija ──────────────────────────────────────────────────────
  { plotId:'MK-0086', municipality:'Demir Kapija', landType:'Agricultural', areaM2:7400, lat:41.4080, lng:22.2400, status:'owned',      registeredDate:'2025-09-18' },
  { plotId:'MK-0087', municipality:'Demir Kapija', landType:'Agricultural', areaM2:10800, lat:41.4010, lng:22.2530, status:'recent_sale', soldAtUnix:NOW-86400*4, registeredDate:'2025-09-20' },

  // ── Probištip ─────────────────────────────────────────────────────────
  { plotId:'MK-0088', municipality:'Probištip',  landType:'Agricultural', areaM2:6900,  lat:41.9970, lng:22.1800, status:'owned',       registeredDate:'2025-10-25' },
  { plotId:'MK-0089', municipality:'Probištip',  landType:'Residential',  areaM2:380,   lat:42.0030, lng:22.1880, status:'for_sale',     priceUsdcHuman:15000, priceAtomic:BigInt(15000*1_000_000), registeredDate:'2025-10-27' },

  // ── Makedonska Kamenica ───────────────────────────────────────────────
  { plotId:'MK-0090', municipality:'Makedonska Kamenica', landType:'Agricultural', areaM2:8800, lat:42.0170, lng:22.5850, status:'owned', registeredDate:'2025-11-05' },
  { plotId:'MK-0091', municipality:'Makedonska Kamenica', landType:'Agricultural', areaM2:12000, lat:42.0100, lng:22.5970, status:'for_sale', priceUsdcHuman:5400, priceAtomic:BigInt(5400*1_000_000), registeredDate:'2025-11-07' },

  // ── Pehčevo ───────────────────────────────────────────────────────────
  { plotId:'MK-0092', municipality:'Pehčevo',   landType:'Agricultural', areaM2:10500, lat:41.7680, lng:22.8900, status:'owned',       registeredDate:'2025-10-08' },
  { plotId:'MK-0093', municipality:'Pehčevo',   landType:'Agricultural', areaM2:15200, lat:41.7610, lng:22.9040, status:'for_sale',     priceUsdcHuman:4200, priceAtomic:BigInt(4200*1_000_000), registeredDate:'2025-10-10' },

  // ── Bogdanci ──────────────────────────────────────────────────────────
  { plotId:'MK-0094', municipality:'Bogdanci',   landType:'Agricultural', areaM2:7100,  lat:41.2020, lng:22.5770, status:'owned',       registeredDate:'2025-08-25' },
  { plotId:'MK-0095', municipality:'Bogdanci',   landType:'Agricultural', areaM2:9800,  lat:41.1960, lng:22.5890, status:'recent_sale', soldAtUnix:NOW-86400*3, registeredDate:'2025-08-27' },

  // ── Demir Hisar ───────────────────────────────────────────────────────
  { plotId:'MK-0096', municipality:'Demir Hisar', landType:'Agricultural', areaM2:11600, lat:41.2230, lng:20.5320, status:'owned',      registeredDate:'2025-09-02' },
  { plotId:'MK-0097', municipality:'Demir Hisar', landType:'Agricultural', areaM2:8400,  lat:41.2160, lng:20.5450, status:'for_sale',    priceUsdcHuman:5000, priceAtomic:BigInt(5000*1_000_000), registeredDate:'2025-09-04' },

  // ── Makedonski Brod ───────────────────────────────────────────────────
  { plotId:'MK-0098', municipality:'Makedonski Brod', landType:'Agricultural', areaM2:13800, lat:41.5120, lng:21.2160, status:'owned',  registeredDate:'2025-09-15' },

  // ── More Skopje (eastern districts) ──────────────────────────────────
  { plotId:'MK-0099', municipality:'Skopje',  landType:'Residential',  areaM2:360,   lat:42.0050, lng:21.4650, status:'owned',       registeredDate:'2026-03-01' },
  { plotId:'MK-0100', municipality:'Skopje',  landType:'Commercial',   areaM2:1050,  lat:42.0050, lng:21.4780, status:'for_sale',     priceUsdcHuman:165000, priceAtomic:BigInt(165000*1_000_000), registeredDate:'2026-03-03' },
  { plotId:'MK-0101', municipality:'Skopje',  landType:'Residential',  areaM2:420,   lat:42.0120, lng:21.4700, status:'owned',       registeredDate:'2026-03-05' },
  { plotId:'MK-0102', municipality:'Skopje',  landType:'Residential',  areaM2:390,   lat:41.9900, lng:21.4550, status:'recent_sale', soldAtUnix:NOW-86400*1, registeredDate:'2026-03-07' },
  { plotId:'MK-0103', municipality:'Skopje',  landType:'Industrial',   areaM2:8200,  lat:41.9830, lng:21.4700, status:'owned',       registeredDate:'2026-03-09' },
  { plotId:'MK-0104', municipality:'Skopje',  landType:'Residential',  areaM2:310,   lat:42.0230, lng:21.4500, status:'for_sale',     priceUsdcHuman:49000, priceAtomic:BigInt(49000*1_000_000), registeredDate:'2026-03-11' },

  // ── More Skopje (western / Gjorče Petrov) ────────────────────────────
  { plotId:'MK-0105', municipality:'Skopje',  landType:'Residential',  areaM2:470,   lat:41.9920, lng:21.3500, status:'owned',       registeredDate:'2026-03-13' },
  { plotId:'MK-0106', municipality:'Skopje',  landType:'Residential',  areaM2:530,   lat:41.9850, lng:21.3600, status:'for_sale',     priceUsdcHuman:35000, priceAtomic:BigInt(35000*1_000_000), registeredDate:'2026-03-15' },
  { plotId:'MK-0107', municipality:'Skopje',  landType:'Agricultural', areaM2:4800,  lat:41.9780, lng:21.3400, status:'owned',       registeredDate:'2026-03-17' },

  // ── More Bitola (southern) ────────────────────────────────────────────
  { plotId:'MK-0108', municipality:'Bitola',  landType:'Agricultural', areaM2:15000, lat:41.0150, lng:21.3380, status:'owned',       registeredDate:'2025-10-22' },
  { plotId:'MK-0109', municipality:'Bitola',  landType:'Residential',  areaM2:440,   lat:41.0480, lng:21.3450, status:'for_sale',     priceUsdcHuman:20000, priceAtomic:BigInt(20000*1_000_000), registeredDate:'2025-10-24' },
  { plotId:'MK-0110', municipality:'Bitola',  landType:'Commercial',   areaM2:820,   lat:41.0550, lng:21.3270, status:'owned',       registeredDate:'2025-10-26' },

  // ── More Ohrid (hillside) ─────────────────────────────────────────────
  { plotId:'MK-0111', municipality:'Ohrid',   landType:'Residential',  areaM2:520,   lat:41.1090, lng:20.7940, status:'for_sale',     priceUsdcHuman:92000, priceAtomic:BigInt(92000*1_000_000), registeredDate:'2025-09-24' },
  { plotId:'MK-0112', municipality:'Ohrid',   landType:'Agricultural', areaM2:5800,  lat:41.1350, lng:20.8200, status:'owned',       registeredDate:'2025-09-26' },

  // ── More Strumica (valley) ────────────────────────────────────────────
  { plotId:'MK-0113', municipality:'Strumica', landType:'Agricultural', areaM2:16000, lat:41.4260, lng:22.6720, status:'owned',       registeredDate:'2026-01-17' },
  { plotId:'MK-0114', municipality:'Strumica', landType:'Residential',  areaM2:350,   lat:41.4530, lng:22.6440, status:'for_sale',     priceUsdcHuman:11500, priceAtomic:BigInt(11500*1_000_000), registeredDate:'2026-01-19' },

  // ── More Tetovo ───────────────────────────────────────────────────────
  { plotId:'MK-0115', municipality:'Tetovo',  landType:'Residential',  areaM2:410,   lat:42.0050, lng:20.9620, status:'owned',       registeredDate:'2025-11-14' },
  { plotId:'MK-0116', municipality:'Tetovo',  landType:'Agricultural', areaM2:10800, lat:42.0300, lng:20.9810, status:'for_sale',     priceUsdcHuman:9800, priceAtomic:BigInt(9800*1_000_000), registeredDate:'2025-11-16' },

  // ── More Kumanovo ─────────────────────────────────────────────────────
  { plotId:'MK-0117', municipality:'Kumanovo', landType:'Agricultural', areaM2:9400,  lat:42.1170, lng:21.7340, status:'owned',       registeredDate:'2025-12-20' },
  { plotId:'MK-0118', municipality:'Kumanovo', landType:'Residential',  areaM2:500,   lat:42.1470, lng:21.7220, status:'recent_sale', soldAtUnix:NOW-86400*2, registeredDate:'2025-12-22' },

  // ── More Veles ────────────────────────────────────────────────────────
  { plotId:'MK-0119', municipality:'Veles',    landType:'Agricultural', areaM2:13000, lat:41.7080, lng:21.7940, status:'owned',       registeredDate:'2025-11-28' },
  { plotId:'MK-0120', municipality:'Veles',    landType:'Residential',  areaM2:430,   lat:41.7260, lng:21.7870, status:'for_sale',     priceUsdcHuman:24000, priceAtomic:BigInt(24000*1_000_000), registeredDate:'2025-11-30' },

  // ── More Štip ─────────────────────────────────────────────────────────
  { plotId:'MK-0121', municipality:'Štip',     landType:'Agricultural', areaM2:9100,  lat:41.7480, lng:22.2130, status:'owned',       registeredDate:'2025-10-30' },
  { plotId:'MK-0122', municipality:'Štip',     landType:'Industrial',   areaM2:6700,  lat:41.7220, lng:22.1890, status:'for_sale',     priceUsdcHuman:78000, priceAtomic:BigInt(78000*1_000_000), registeredDate:'2025-11-01' },

  // ── More Kavadarci (vineyard region) ──────────────────────────────────
  { plotId:'MK-0123', municipality:'Kavadarci', landType:'Agricultural', areaM2:18000, lat:41.4200, lng:21.9920, status:'owned',       registeredDate:'2025-09-11' },
  { plotId:'MK-0124', municipality:'Kavadarci', landType:'Agricultural', areaM2:14500, lat:41.4470, lng:22.0280, status:'for_sale',     priceUsdcHuman:8200, priceAtomic:BigInt(8200*1_000_000), registeredDate:'2025-09-13' },

  // ── More Gostivar ─────────────────────────────────────────────────────
  { plotId:'MK-0125', municipality:'Gostivar',  landType:'Agricultural', areaM2:12300, lat:41.8110, lng:20.9240, status:'owned',       registeredDate:'2025-12-26' },
  { plotId:'MK-0126', municipality:'Gostivar',  landType:'Residential',  areaM2:480,   lat:41.7820, lng:20.9000, status:'for_sale',     priceUsdcHuman:13500, priceAtomic:BigInt(13500*1_000_000), registeredDate:'2025-12-28' },

  // ── More Kočani ───────────────────────────────────────────────────────
  { plotId:'MK-0127', municipality:'Kočani',   landType:'Agricultural', areaM2:10300, lat:41.9050, lng:22.4010, status:'for_sale',     priceUsdcHuman:9200, priceAtomic:BigInt(9200*1_000_000), registeredDate:'2025-11-05' },
  { plotId:'MK-0128', municipality:'Kočani',   landType:'Residential',  areaM2:370,   lat:41.9290, lng:22.4260, status:'owned',       registeredDate:'2025-11-07' },

  // ── More Struga (lakeside) ────────────────────────────────────────────
  { plotId:'MK-0129', municipality:'Struga',    landType:'Residential',  areaM2:590,   lat:41.1840, lng:20.6700, status:'for_sale',     priceUsdcHuman:74000, priceAtomic:BigInt(74000*1_000_000), registeredDate:'2025-08-24' },
  { plotId:'MK-0130', municipality:'Struga',    landType:'Agricultural', areaM2:6200,  lat:41.1660, lng:20.6920, status:'owned',       registeredDate:'2025-08-26' },

  // ── More Gevgelija (border region) ────────────────────────────────────
  { plotId:'MK-0131', municipality:'Gevgelija', landType:'Agricultural', areaM2:11800, lat:41.1340, lng:22.4900, status:'owned',       registeredDate:'2025-08-19' },
  { plotId:'MK-0132', municipality:'Gevgelija', landType:'Commercial',   areaM2:760,   lat:41.1530, lng:22.5160, status:'for_sale',     priceUsdcHuman:41000, priceAtomic:BigInt(41000*1_000_000), registeredDate:'2025-08-21' },

  // ── More Negotino ─────────────────────────────────────────────────────
  { plotId:'MK-0133', municipality:'Negotino',  landType:'Agricultural', areaM2:16500, lat:41.4750, lng:22.0770, status:'owned',       registeredDate:'2025-09-29' },
  { plotId:'MK-0134', municipality:'Negotino',  landType:'Agricultural', areaM2:9200,  lat:41.4940, lng:22.1040, status:'recent_sale', soldAtUnix:NOW-86400*5, registeredDate:'2025-10-01' },

  // ── Ilinden (Skopje suburb) ───────────────────────────────────────────
  { plotId:'MK-0135', municipality:'Ilinden',   landType:'Residential',  areaM2:440,   lat:41.9880, lng:21.5740, status:'owned',       registeredDate:'2026-02-20' },
  { plotId:'MK-0136', municipality:'Ilinden',   landType:'Industrial',   areaM2:7600,  lat:41.9810, lng:21.5860, status:'for_sale',     priceUsdcHuman:110000, priceAtomic:BigInt(110000*1_000_000), registeredDate:'2026-02-22' },
  { plotId:'MK-0137', municipality:'Ilinden',   landType:'Residential',  areaM2:380,   lat:41.9950, lng:21.5800, status:'owned',       registeredDate:'2026-02-24' },

  // ── Čair (Skopje inner) ───────────────────────────────────────────────
  { plotId:'MK-0138', municipality:'Čair',      landType:'Commercial',   areaM2:920,   lat:42.0060, lng:21.4430, status:'for_sale',     priceUsdcHuman:185000, priceAtomic:BigInt(185000*1_000_000), registeredDate:'2026-03-19' },
  { plotId:'MK-0139', municipality:'Čair',      landType:'Residential',  areaM2:330,   lat:42.0130, lng:21.4380, status:'owned',       registeredDate:'2026-03-21' },

  // ── Gazi Baba (Skopje north) ──────────────────────────────────────────
  { plotId:'MK-0140', municipality:'Gazi Baba',  landType:'Residential',  areaM2:490,   lat:42.0010, lng:21.5020, status:'owned',       registeredDate:'2026-03-23' },
  { plotId:'MK-0141', municipality:'Gazi Baba',  landType:'Industrial',   areaM2:9300,  lat:41.9940, lng:21.5150, status:'for_sale',     priceUsdcHuman:220000, priceAtomic:BigInt(220000*1_000_000), registeredDate:'2026-03-25' },
  { plotId:'MK-0142', municipality:'Gazi Baba',  landType:'Residential',  areaM2:410,   lat:42.0080, lng:21.5100, status:'recent_sale', soldAtUnix:NOW-86400*1, registeredDate:'2026-03-27' },

  // ── Saraj (Skopje west) ───────────────────────────────────────────────
  { plotId:'MK-0143', municipality:'Saraj',     landType:'Agricultural', areaM2:7200,  lat:41.9830, lng:21.3040, status:'owned',       registeredDate:'2026-03-29' },
  { plotId:'MK-0144', municipality:'Saraj',     landType:'Residential',  areaM2:560,   lat:41.9760, lng:21.3160, status:'for_sale',     priceUsdcHuman:32000, priceAtomic:BigInt(32000*1_000_000), registeredDate:'2026-04-01' },

  // ── Zrnovci ───────────────────────────────────────────────────────────
  { plotId:'MK-0145', municipality:'Zrnovci',   landType:'Agricultural', areaM2:8700,  lat:41.8350, lng:22.4010, status:'owned',       registeredDate:'2025-11-10' },

  // ── Sveti Nikole (extra) ──────────────────────────────────────────────
  { plotId:'MK-0146', municipality:'Sveti Nikole', landType:'Agricultural', areaM2:12400, lat:41.8720, lng:21.9540, status:'for_sale', priceUsdcHuman:7100, priceAtomic:BigInt(7100*1_000_000), registeredDate:'2025-11-17' },
  { plotId:'MK-0147', municipality:'Sveti Nikole', landType:'Residential',  areaM2:390,   lat:41.8600, lng:21.9360, status:'owned',    registeredDate:'2025-11-19' },

  // ── Kratovo (extra) ───────────────────────────────────────────────────
  { plotId:'MK-0148', municipality:'Kratovo',   landType:'Agricultural', areaM2:13600, lat:42.0660, lng:22.1660, status:'owned',       registeredDate:'2025-11-19' },

  // ── Berovo (extra) ────────────────────────────────────────────────────
  { plotId:'MK-0149', municipality:'Berovo',    landType:'Agricultural', areaM2:18500, lat:41.7110, lng:22.8640, status:'owned',       registeredDate:'2025-10-02' },

  // ── Debar (extra) ─────────────────────────────────────────────────────
  { plotId:'MK-0150', municipality:'Debar',     landType:'Agricultural', areaM2:14200, lat:41.5310, lng:20.5350, status:'for_sale',     priceUsdcHuman:5600, priceAtomic:BigInt(5600*1_000_000), registeredDate:'2025-10-16' },

  // ── Skopje — Aerodrom district ────────────────────────────────────────
  { plotId:'MK-0151', municipality:'Skopje',  landType:'Residential',  areaM2:340,   lat:41.9780, lng:21.4400, status:'owned',       registeredDate:'2026-04-02' },
  { plotId:'MK-0152', municipality:'Skopje',  landType:'Residential',  areaM2:410,   lat:41.9780, lng:21.4490, status:'for_sale',     priceUsdcHuman:41000, priceAtomic:BigInt(41000*1_000_000), registeredDate:'2026-04-03' },
  { plotId:'MK-0153', municipality:'Skopje',  landType:'Commercial',   areaM2:1150,  lat:41.9780, lng:21.4580, status:'owned',       registeredDate:'2026-04-04' },
  { plotId:'MK-0154', municipality:'Skopje',  landType:'Residential',  areaM2:370,   lat:41.9710, lng:21.4430, status:'recent_sale', soldAtUnix:NOW-86400*2, registeredDate:'2026-04-05' },
  { plotId:'MK-0155', municipality:'Skopje',  landType:'Residential',  areaM2:450,   lat:41.9710, lng:21.4520, status:'owned',       registeredDate:'2026-04-06' },
  { plotId:'MK-0156', municipality:'Skopje',  landType:'Residential',  areaM2:280,   lat:41.9640, lng:21.4460, status:'for_sale',     priceUsdcHuman:36000, priceAtomic:BigInt(36000*1_000_000), registeredDate:'2026-04-07' },

  // ── Skopje — Karpoš district ──────────────────────────────────────────
  { plotId:'MK-0157', municipality:'Skopje',  landType:'Residential',  areaM2:490,   lat:41.9990, lng:21.3780, status:'owned',       registeredDate:'2026-04-08' },
  { plotId:'MK-0158', municipality:'Skopje',  landType:'Residential',  areaM2:530,   lat:41.9990, lng:21.3870, status:'for_sale',     priceUsdcHuman:58000, priceAtomic:BigInt(58000*1_000_000), registeredDate:'2026-04-09' },
  { plotId:'MK-0159', municipality:'Skopje',  landType:'Commercial',   areaM2:980,   lat:42.0060, lng:21.3820, status:'owned',       registeredDate:'2026-04-10' },
  { plotId:'MK-0160', municipality:'Skopje',  landType:'Residential',  areaM2:360,   lat:42.0060, lng:21.3910, status:'owned',       registeredDate:'2026-04-11' },
  { plotId:'MK-0161', municipality:'Skopje',  landType:'Residential',  areaM2:420,   lat:41.9920, lng:21.3830, status:'recent_sale', soldAtUnix:NOW-86400*3, registeredDate:'2026-04-12' },

  // ── Skopje — Butel district (north) ──────────────────────────────────
  { plotId:'MK-0162', municipality:'Skopje',  landType:'Residential',  areaM2:460,   lat:42.0390, lng:21.4350, status:'owned',       registeredDate:'2026-04-13' },
  { plotId:'MK-0163', municipality:'Skopje',  landType:'Residential',  areaM2:380,   lat:42.0390, lng:21.4440, status:'for_sale',     priceUsdcHuman:28000, priceAtomic:BigInt(28000*1_000_000), registeredDate:'2026-04-14' },
  { plotId:'MK-0164', municipality:'Skopje',  landType:'Agricultural', areaM2:5400,  lat:42.0460, lng:21.4390, status:'owned',       registeredDate:'2026-04-15' },
  { plotId:'MK-0165', municipality:'Skopje',  landType:'Residential',  areaM2:500,   lat:42.0320, lng:21.4410, status:'owned',       registeredDate:'2026-04-16' },
  { plotId:'MK-0166', municipality:'Skopje',  landType:'Industrial',   areaM2:7800,  lat:42.0530, lng:21.4480, status:'for_sale',     priceUsdcHuman:195000, priceAtomic:BigInt(195000*1_000_000), registeredDate:'2026-04-17' },

  // ── Skopje — Kisela Voda ──────────────────────────────────────────────
  { plotId:'MK-0167', municipality:'Skopje',  landType:'Residential',  areaM2:400,   lat:41.9610, lng:21.4250, status:'owned',       registeredDate:'2026-04-18' },
  { plotId:'MK-0168', municipality:'Skopje',  landType:'Residential',  areaM2:350,   lat:41.9610, lng:21.4340, status:'for_sale',     priceUsdcHuman:33000, priceAtomic:BigInt(33000*1_000_000), registeredDate:'2026-04-19' },
  { plotId:'MK-0169', municipality:'Skopje',  landType:'Commercial',   areaM2:870,   lat:41.9540, lng:21.4290, status:'owned',       registeredDate:'2026-04-20' },
  { plotId:'MK-0170', municipality:'Skopje',  landType:'Residential',  areaM2:430,   lat:41.9540, lng:21.4380, status:'owned',       registeredDate:'2026-04-21' },
  { plotId:'MK-0171', municipality:'Skopje',  landType:'Residential',  areaM2:310,   lat:41.9470, lng:21.4320, status:'recent_sale', soldAtUnix:NOW-86400*1, registeredDate:'2026-04-22' },

  // ── Skopje — Novo Lisice / Vizbegovo ─────────────────────────────────
  { plotId:'MK-0172', municipality:'Skopje',  landType:'Residential',  areaM2:520,   lat:42.0200, lng:21.5000, status:'owned',       registeredDate:'2026-04-23' },
  { plotId:'MK-0173', municipality:'Skopje',  landType:'Residential',  areaM2:460,   lat:42.0200, lng:21.5090, status:'for_sale',     priceUsdcHuman:39000, priceAtomic:BigInt(39000*1_000_000), registeredDate:'2026-04-24' },
  { plotId:'MK-0174', municipality:'Skopje',  landType:'Agricultural', areaM2:6800,  lat:42.0270, lng:21.5040, status:'owned',       registeredDate:'2026-04-25' },
  { plotId:'MK-0175', municipality:'Skopje',  landType:'Residential',  areaM2:390,   lat:42.0130, lng:21.5060, status:'owned',       registeredDate:'2026-04-26' },

  // ── Skopje — Šuto Orizari ─────────────────────────────────────────────
  { plotId:'MK-0176', municipality:'Skopje',  landType:'Residential',  areaM2:350,   lat:42.0490, lng:21.4200, status:'owned',       registeredDate:'2026-04-27' },
  { plotId:'MK-0177', municipality:'Skopje',  landType:'Residential',  areaM2:410,   lat:42.0560, lng:21.4270, status:'for_sale',     priceUsdcHuman:22000, priceAtomic:BigInt(22000*1_000_000), registeredDate:'2026-04-28' },

  // ── Bitola — Bitpazar / old town ──────────────────────────────────────
  { plotId:'MK-0178', municipality:'Bitola',  landType:'Commercial',   areaM2:640,   lat:41.0340, lng:21.3340, status:'for_sale',     priceUsdcHuman:47000, priceAtomic:BigInt(47000*1_000_000), registeredDate:'2025-10-28' },
  { plotId:'MK-0179', municipality:'Bitola',  landType:'Residential',  areaM2:380,   lat:41.0340, lng:21.3420, status:'owned',       registeredDate:'2025-10-29' },
  { plotId:'MK-0180', municipality:'Bitola',  landType:'Residential',  areaM2:430,   lat:41.0270, lng:21.3370, status:'owned',       registeredDate:'2025-10-30' },
  { plotId:'MK-0181', municipality:'Bitola',  landType:'Commercial',   areaM2:750,   lat:41.0270, lng:21.3450, status:'recent_sale', soldAtUnix:NOW-86400*4, registeredDate:'2025-10-31' },

  // ── Bitola — Shirok Sokak strip ───────────────────────────────────────
  { plotId:'MK-0182', municipality:'Bitola',  landType:'Commercial',   areaM2:580,   lat:41.0400, lng:21.3310, status:'owned',       registeredDate:'2025-11-01' },
  { plotId:'MK-0183', municipality:'Bitola',  landType:'Residential',  areaM2:360,   lat:41.0400, lng:21.3390, status:'for_sale',     priceUsdcHuman:16500, priceAtomic:BigInt(16500*1_000_000), registeredDate:'2025-11-02' },
  { plotId:'MK-0184', municipality:'Bitola',  landType:'Residential',  areaM2:410,   lat:41.0460, lng:21.3350, status:'owned',       registeredDate:'2025-11-03' },

  // ── Bitola — north residential ────────────────────────────────────────
  { plotId:'MK-0185', municipality:'Bitola',  landType:'Residential',  areaM2:470,   lat:41.0510, lng:21.3290, status:'owned',       registeredDate:'2025-11-04' },
  { plotId:'MK-0186', municipality:'Bitola',  landType:'Residential',  areaM2:390,   lat:41.0510, lng:21.3370, status:'for_sale',     priceUsdcHuman:17800, priceAtomic:BigInt(17800*1_000_000), registeredDate:'2025-11-05' },
  { plotId:'MK-0187', municipality:'Bitola',  landType:'Residential',  areaM2:440,   lat:41.0580, lng:21.3320, status:'owned',       registeredDate:'2025-11-06' },
  { plotId:'MK-0188', municipality:'Bitola',  landType:'Residential',  areaM2:500,   lat:41.0580, lng:21.3410, status:'owned',       registeredDate:'2025-11-07' },

  // ── Bitola — Pelagonija plain (large agricultural lots) ───────────────
  { plotId:'MK-0189', municipality:'Bitola',  landType:'Agricultural', areaM2:22000, lat:41.0100, lng:21.3160, status:'owned',       registeredDate:'2025-11-08' },
  { plotId:'MK-0190', municipality:'Bitola',  landType:'Agricultural', areaM2:18500, lat:41.0100, lng:21.3440, status:'for_sale',     priceUsdcHuman:11200, priceAtomic:BigInt(11200*1_000_000), registeredDate:'2025-11-09' },
  { plotId:'MK-0191', municipality:'Bitola',  landType:'Agricultural', areaM2:26000, lat:41.0030, lng:21.3290, status:'owned',       registeredDate:'2025-11-10' },
  { plotId:'MK-0192', municipality:'Bitola',  landType:'Agricultural', areaM2:14500, lat:41.0650, lng:21.3060, status:'recent_sale', soldAtUnix:NOW-86400*6, registeredDate:'2025-11-11' },
  { plotId:'MK-0193', municipality:'Bitola',  landType:'Agricultural', areaM2:19800, lat:41.0650, lng:21.3560, status:'owned',       registeredDate:'2025-11-12' },

  // ── Bitola — industrial zone west ─────────────────────────────────────
  { plotId:'MK-0194', municipality:'Bitola',  landType:'Industrial',   areaM2:8900,  lat:41.0330, lng:21.3120, status:'owned',       registeredDate:'2025-11-13' },
  { plotId:'MK-0195', municipality:'Bitola',  landType:'Industrial',   areaM2:11400, lat:41.0260, lng:21.3050, status:'for_sale',     priceUsdcHuman:105000, priceAtomic:BigInt(105000*1_000_000), registeredDate:'2025-11-14' },
  { plotId:'MK-0196', municipality:'Bitola',  landType:'Industrial',   areaM2:7600,  lat:41.0190, lng:21.3180, status:'owned',       registeredDate:'2025-11-15' },

  // ── Bitola — Tumbe Cafe / eastern residential ─────────────────────────
  { plotId:'MK-0197', municipality:'Bitola',  landType:'Residential',  areaM2:450,   lat:41.0360, lng:21.3500, status:'owned',       registeredDate:'2025-11-16' },
  { plotId:'MK-0198', municipality:'Bitola',  landType:'Residential',  areaM2:330,   lat:41.0290, lng:21.3530, status:'for_sale',     priceUsdcHuman:15500, priceAtomic:BigInt(15500*1_000_000), registeredDate:'2025-11-17' },
  { plotId:'MK-0199', municipality:'Bitola',  landType:'Residential',  areaM2:480,   lat:41.0220, lng:21.3470, status:'owned',       registeredDate:'2025-11-18' },
  { plotId:'MK-0200', municipality:'Bitola',  landType:'Commercial',   areaM2:900,   lat:41.0430, lng:21.3480, status:'owned',       registeredDate:'2025-11-19' },
];

export function buildDemoSeedProperties(): PropertyAsset[] {
  return SEEDS.map((s, idx) => {
    const [dx, dy] = SZ[s.landType];
    const boundary = box(s.lat, s.lng, dx, dy);
    const pk   = demoPubkey(`KATASTER_DEMO_MK_${idx + 1}_${s.plotId}`);
    const owner = demoPubkey(`KATASTER_DEMO_OWNER_${s.plotId}`).toBase58();
    const docHash = `sha256:demo${String(idx + 1).padStart(4, '0')}${'0'.repeat(56)}`;

    return {
      mint: pk.toBase58(),
      owner,
      boundary,
      centerLat: s.lat,
      centerLng: s.lng,
      docHash,
      isListedOnChain: false,
      description: undefined,
      ...s,
    };
  });
}
