// "Mona Lisa theft" timeline (58 s, 1740 f @ 30 fps). Sets: louvre (gallery / stair / exterior) and paris (street / attic / shop).
import * as S from './story.js';
const { sm, eo, ei, back, lerp, L3, add3, dist, q, person } = S;

// [f0, f1, id, module, set]
const SH = [
  [0, 151, 'hook', 'louvre', 'gallery'],
  [151, 232, 'paris', 'paris', 'street'],
  [232, 289, 'hangs', 'louvre', 'gallery'],
  [289, 392, 'bored', 'louvre', 'gallery'],
  [392, 480, 'closed', 'louvre', 'exterior'],
  [480, 676, 'slips', 'louvre', 'gallery'],
  [676, 732, 'lift', 'louvre', 'gallery'],
  [732, 786, 'stair', 'louvre', 'stair'],
  [786, 868, 'out', 'louvre', 'exterior'],
  [868, 951, 'nobody', 'louvre', 'gallery'],
  [951, 1046, 'world', 'paris', 'street'],
  [1046, 1128, 'kiosk', 'paris', 'street'],
  [1128, 1181, 'queue', 'louvre', 'exterior'],
  [1181, 1260, 'stare', 'louvre', 'gallery'],
  [1260, 1335, 'attic', 'paris', 'attic'],
  [1335, 1386, 'reveal', 'paris', 'attic'],
  [1386, 1427, 'years', 'paris', 'attic'],
  [1427, 1533, 'caught', 'paris', 'shop'],
  [1533, 1611, 'italy', 'paris', 'shop'],
  [1611, 1700, 'famous', 'louvre', 'gallery'],
  [1700, 1740, 'france', 'louvre', 'gallery'],
];
export const NF = 1740;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'office', kind: s[2] }; }
export const roomAt = () => null;
export const setAt = (f) => { const s = segAt(f); return [s[3], s[4]]; };
export const lightFor = () => S.LIGHTS_.office;
const u = (f) => f - segAt(f)[0];
export const TALKER = {}; SH.forEach((s, i) => { TALKER[i + 1] = { slips: 'PERUGGIA', attic: 'PERUGGIA', caught: 'DEALER', italy: 'PERUGGIA' }[s[2]]; });

// ---------- places (world coords, from the set modules) ----------
const G0 = [0, 0, -1600];                       // gallery origin; painting centre (0, 1.95, -1607.95)
const PAINT = [0, 1.95, -1607.95];
const STAIRMAN = [39.25, 1.75, -1602.05];
const DOOR = [0, 0.15, -1799.2];
const QUEUE = Array.from({ length: 14 }, (_, i) => [2.4 + i * 0.95, 0.15, -1797.86]);
const KIOSK = [1593.6, 0.15, 2.7];
const TRUNK = [1599.75, 0, 101.05];
const SHOP = { dealer: [1601.1, 0, 199.1], customer: [1601.1, 0, 200.9], door: [1600, 0, 197.2] };

// ---------- cameras ----------
const V = {
  galWide: { p: [0.4, 1.6, -1592.45], l: [0, 3.1, -1608], fov: 58, cInf: 2 },
  paintCU: { p: [0.05, 1.98, -1606.15], l: [0, 1.95, -1608], fov: 40, cInf: 6 },
  emptyWall: { p: [0.45, 1.7, -1604.3], l: [0, 1.98, -1608], fov: 48, cInf: 5 },
  stair: { p: [39.05, 1.0, -1597.3], l: [39.55, 2.75, -1602.6], fov: 54, cInf: 4 },
  ext: { p: [8.6, 1.6, -1789.2], l: [1.8, 3.0, -1799.5], fov: 54, cInf: 3 },
  galCorner: { p: [6.2, 1.7, -1593.4], l: [-1.5, 4.6, -1606], fov: 54, cInf: 2 },
  street: { p: [1603.2, 1.45, 8.2], l: [1587.5, 6.4, -0.6], fov: 56, cInf: 2 },
  kioskCU: { p: [1596.2, 1.42, 3.33], l: [1594.41, 1.43, 2.88], fov: 42, cInf: 5 },
  attic: { p: [1600.6, 1.58, 103.95], l: [1599.8, 0.85, 99.0], fov: 60, cInf: 3 },
  trunk: { p: [1600.82, 1.38, 100.95], l: [1599.68, 0.05, 101.08], fov: 50, cInf: 5 },
  shop: { p: [1601.75, 1.62, 203.8], l: [1598.0, 1.4, 198.5], fov: 58, cInf: 3 },
  counter: { p: [1600.15, 1.42, 202.35], l: [1601.5, 1.22, 199.7], fov: 48, cInf: 5 },
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]]; return { ...v, p: add3(v.p, d.map((x) => x * k * t)) }; };
function cam(k, f) {
  const s = segAt(f), f0 = s[0], f1 = s[1];
  if (k === 'hook') return push(V.paintCU, 0.18, 0, 151, f);
  if (k === 'paris') return push(V.street, 0.08, f0, f1, f);
  if (k === 'hangs') return push(V.galWide, 0.12, f0, f1, f);
  if (k === 'bored') return { p: [1.7, 1.6, -1602.8], l: [-0.6, 1.65, -1607.9], fov: 52, cInf: 3, fp: [0.2, 1.4, -1605.6] };
  if (k === 'closed' || k === 'out' || k === 'queue') return push(V.ext, 0.06, f0, f1, f);
  if (k === 'slips') return push({ p: [2.3, 1.55, -1598.4], l: [0.4, 1.45, -1605.2], fov: 52, cInf: 4, fp: [1.4, 1.4, -1603.2] }, 0.08, f0, f1, f);
  if (k === 'lift') return push({ p: [0.9, 1.75, -1603.6], l: [0, 1.85, -1608], fov: 50, cInf: 5 }, 0.12, f0, f1, f);
  if (k === 'stair') return push(V.stair, 0.1, f0, f1, f);
  if (k === 'nobody') return push({ p: [1.6, 1.7, -1603.4], l: [0.0, 1.85, -1608], fov: 50, cInf: 4 }, 0.1, f0, f1, f);
  if (k === 'world') return push(V.street, 0.1, f0, f1, f);
  if (k === 'kiosk') return push(V.kioskCU, 0.15, f0, f1, f);
  if (k === 'stare') return { p: [3.4, 1.7, -1602.6], l: [-0.6, 1.8, -1607.6], fov: 50, cInf: 3, fp: [0, 1.6, -1605] };
  if (k === 'attic' || k === 'years') return push(V.attic, 0.08, f0, f1, f);
  if (k === 'reveal') return push(V.trunk, 0.12, f0, f1, f);
  if (k === 'caught') return push({ p: [1598.4, 1.6, 203.4], l: [1601.0, 1.3, 199.8], fov: 52, cInf: 3 }, 0.06, f0, f1, f);
  if (k === 'italy') return push({ ...V.counter, fov: 56 }, 0.1, f0, f1, f);
  if (k === 'famous') return push({ p: [0.3, 1.7, -1599.0], l: [0, 2.0, -1608], fov: 52, cInf: 3 }, 0.15, f0, f1, f);
  return push(V.paintCU, 0.2, f0, f1, f);
}
const CUTS = SH.slice(1).map((s) => s[0]);
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const c of [126]) { if (f >= c && f < c + 8) flash = Math.max(flash, 0.7 * (1 - (f - c) / 8)); }
  for (const c of [1647, 1662, 1678, 1690]) if (f >= c && f < c + 3) flash = Math.max(flash, 0.35 * (1 - (f - c) / 3));   // camera flashes
  return { flash, look: 'office' };
}

// ---------- world state ----------
export function worldAt(f, w) {
  const s = segAt(f), k = s[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const empty = (k === 'hook' && f >= 126) || (k === 'lift' && f >= 690) || ['nobody', 'stare'].includes(k);
  w.louvre.setEmpty(empty);
  w.louvre.setStairBeat(k === 'stair' ? (f < 752 ? 'framed' : 'discarded') : null);
  const P = w.paris; P.setTrunk(k === 'attic' ? eo(1296, 1318, f) : k === 'reveal' || k === 'years' ? 1 : 0); P.setFalseBottom(k === 'attic' ? eo(1318, 1334, f) : k === 'reveal' || k === 'years' ? 1 : 0);
}

// ---------- actors ----------
const PG = (f, pos, opts = {}, extra = {}) => person(f, 'PERUGGIA', 71, pos, { expr: 'smile', ...opts }, extra);
const walk = (f, o, seed, a, b, f0, f1, opts = {}) => { const t = Math.max(0, Math.min(1, (f - f0) / (f1 - f0))); return person(f, o, seed, L3(a, b, t), { mode: t > 0 && t < 1 ? 'march' : 'stand', phase: q((f * 0.05 + seed * 0.3) % 1, 0.05), ...opts }); };
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hangs' || k === 'bored') {
    for (let i = 0; i < 4; i++) A.push(walk(f, 'PASS' + i, 80 + i, [3.0, 0, -1605.6 + (i % 2) * 0.7], [-4.0, 0, -1605.6 + (i % 2) * 0.7], s[0] - 30 + i * 35, s[0] + 120 + i * 35, { expr: i % 2 ? 'smile' : 'whistle', look: 1 }));
  }
  if (k === 'closed') A.push(walk(f, 'PERUGGIA', 71, [6.0, 0.15, -1795.5], [0.4, 0.15, -1799.0], 400, 476, { expr: 'nervous', look: 1 }));
  if (k === 'slips') {
    A.push(walk(f, 'PERUGGIA', 71, [4.2, 0, -1601.2], [0.9, 0, -1604.8], 488, 660, { expr: f > 600 ? 'whistle' : 'smile' }));
    if (f > 610) A.push(person(f, 'GUARD', 72, [-0.9, 0, -1603.6], { expr: 'happy', wave: q(back(625, 640, f) * 0.6, 0.1) }));
  }
  if (k === 'lift') A.push(PG(f, [0.15, 0, -1606.4], { expr: 'grin', prop: f >= 690 ? 'framed' : undefined, reach: q(eo(690, 712, f), 0.05) }));
  if (k === 'stair') A.push(PG(f, STAIRMAN, { expr: f < 752 ? 'nervous' : 'grin', prop: f < 752 ? 'framed' : 'mona', reach: 0.6 }));
  if (k === 'out') { A.push(walk(f, 'PERUGGIA', 71, [0.2, 0.15, -1799.0], [7.5, 0.15, -1795.2], 800, 866, { expr: 'whistle' })); A.push(person(f, 'GUARD', 72, [-1.9, 0.3, -1799.1], { expr: 'happy', sleep: true })); }
  if (k === 'nobody' && f >= 900) { A.push(walk(f, 'PAINTER', 73, [2.4, 0, -1605.2], [1.0, 0, -1606.6], 900, 925, { expr: f > 925 ? 'shock' : 'smile' })); }
  if (k === 'world') {
    A.push(person(f, 'NEWSBOY', 74, [1595.2, 0.15, 4.2], { expr: 'excited', cheer: 1 }));
    for (let i = 0; i < 6; i++) A.push(person(f, 'PASS' + (i + 2), 90 + i, [1592.0 + i * 0.9, 0.15, 5.2 + (i % 2) * 0.8], { expr: i % 2 ? 'shock' : 'surprised', look: 0.5 }));
  }
  if (k === 'queue') for (let i = 0; i < 12; i++) A.push(person(f, 'PASS' + (i % 8), 100 + i, QUEUE[i], { expr: i % 3 ? 'smile' : 'surprised', look: -1 }));
  if (k === 'stare') for (let i = 0; i < 9; i++) A.push(person(f, 'PASS' + (i % 8), 110 + i, [-2.0 + (i % 5) * 1.0 + (i > 4 ? 0.5 : 0), 0, -1604.6 + (i > 4 ? 1.3 : 0)], { expr: i % 2 ? 'shock' : 'surprised', look: 0 }));
  if (k === 'attic') A.push(PG(f, [1600.3, 0, 100.2], { expr: f < 1300 ? 'whistle' : 'grin', look: -1 }));
  if (k === 'years') A.push(PG(f, [1600.3, 0, 100.2], { expr: 'smug', mode: 'stand' }));
  if (k === 'caught') {
    A.push(PG(f, SHOP.customer, { expr: f < 1490 ? 'grin' : 'shock', prop: 'mona', reach: 0.8 }));
    A.push(person(f, 'DEALER', 75, SHOP.dealer, { expr: f < 1470 ? 'shock' : 'excited' }));
    if (f >= 1480) A.push(walk(f, 'POLICE', 76, [1599.4, 0, 198.0], [1600.2, 0, 200.3], 1480, 1520, { expr: 'angry' }));
  }
  if (k === 'italy') { A.push(PG(f, SHOP.customer, { expr: 'happy', prop: 'mona', reach: 0.5 })); A.push(person(f, 'POLICE', 76, [1600.2, 0, 200.4], { expr: 'angry' })); }
  if (k === 'famous' || k === 'france') for (let i = 0; i < 12; i++) A.push(person(f, 'PASS' + (i % 8), 120 + i, [-2.4 + (i % 6) * 0.95, 0, -1604.4 + Math.floor(i / 6) * 1.25], { expr: i % 3 ? 'excited' : 'laugh', cheer: i % 2 ? q(0.5 + 0.5 * Math.sin(f * 0.3 + i), 0.1) : undefined }));
  return A;
}

// ---------- effects ----------
export function fxAt(f) {
  const s = segAt(f), k = s[2], F = [];
  if (k === 'hook' && f >= 126 && f < 142) F.push({ fx: 'puff', t: (f - 126) / 16, pos: [0, 1.95, -1607.6], size: 1.1, tint: '#f2e8d8' });
  if (k === 'paris' && f > 160) F.push({ fx: 'board', lines: ['PARIS', '1911'], pos: [1597.2, 3.4, 4.6], size: 1.4 * back(160, 172, f) });
  if (false) for (let i = 0; i < 3; i++) { const z2 = ((f - 330) / 30 + i / 3) % 1; F.push({ fx: 'zzz', pos: [-3.4 + z2 * 0.3, 2.2 + z2 * 0.6, -1600.4], size: 0.18 + z2 * 0.12, op: 1 - z2 }); }
  if (k === 'closed' && f > 400) F.push({ fx: 'board', lines: ['FERMÉ', 'LUNDI'], pos: [1.3, 2.6, -1798.6], size: 1.1 * back(400, 412, f) });
  if (k === 'slips' && f > 500 && f < 640) F.push({ fx: 'board', lines: ['VINCENZO', 'PERUGGIA'], pos: [1.2, 2.75, -1603.6], size: 1.0 * back(500, 512, f) });
  if (k === 'nobody' && f > 880) F.push({ fx: 'board', lines: ['THE NEXT', 'DAY…'], pos: [-1.2, 3.0, -1606.4], size: 0.9 * back(880, 892, f) });
  if (k === 'nobody' && f > 925) F.push({ fx: 'qmark', pos: [1.0, 2.6, -1606.6], size: 0.35 * back(925, 935, f) });
  if (k === 'years' && f > 1388) F.push({ fx: 'board', lines: ['1911  →', '1913'], pos: [1599.9, 1.7, 100.4], size: 0.8 * back(1388, 1400, f) });
  if (k === 'caught' && f > 1440) F.push({ fx: 'board', lines: ['FLORENCE', '1913'], pos: [1598.6, 2.4, 199.0], size: 0.9 * back(1440, 1452, f) });
  if (k === 'caught' && f >= 1490 && f < 1506) F.push({ fx: 'burst', t: (f - 1490) / 16, pos: [1601.1, 2.2, 200.9], size: 0.7, col: '#fff3b0', rays: 10 });
  if (k === 'famous') for (const c of [1647, 1662, 1678, 1690]) if (f >= c && f < c + 8) F.push({ fx: 'burst', t: (f - c) / 8, pos: [-1.6 + (c % 5) * 0.8, 2.3, -1603.8], size: 0.5, col: '#ffffff', rays: 8 });
  return F;
}
