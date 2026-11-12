// [HW-story] "The Hollywood sign was an ad for houses" timeline (63.98 s voice, 1920 f @ 30 fps).
// Sets: hw_sets.js (hill: one location in many moods / office / gala), driven through setAt. Pattern: story_playdoh.js (slow push per shot,
// zoom-through whips on cuts, screen-pinned boards / bursts / stamps, punch-ins on punchlines). LIL H (letter mascot) is the sidekick.
import * as S from './story.js';
import { hf, LX, LY, LZ, trailAt, CLEAR } from './hw_sets.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]                                         narration (word frames from work/words_frames.txt)
const SH = [
  [0, 56, 'hook', 'hillNow'],        // The Hollywood sign... was an ad  (ad 48)
  [56, 104, 'houses', 'hill30'],     // for houses.  (houses 64)
  [104, 155, 'y1923', 'hill23'],     // In 1923, a new neighborhood  (1923 106)
  [155, 207, 'buyers', 'office'],    // in the hills needed buyers.  (buyers 182)
  [207, 269, 'name', 'office'],      // Its name? Hollywoodland.  (Hollywoodland 234)
  [269, 357, 'backers', 'office'],   // Its backers, including the publisher of the Los Angeles Times,  (publisher 315)
  [357, 457, 'paid', 'office'],      // paid $21,000 for a giant billboard.  ($21,000 364, billboard 427)
  [457, 543, 'mules', 'hill23'],     // Mules dragged telephone poles and sheet metal up the mountain.
  [543, 600, 'tall', 'hill23'],      // Each letter stood 50 feet tall,  (50 565)
  [600, 684, 'bulbs', 'hill23n'],    // wrapped in 4,000 light bulbs that flashed:  (4,000 615, flashed 656)
  [684, 772, 'flash', 'hill23n'],    // HOLLY... WOOD... LAND!  (684 / 711 / 736)
  [772, 846, 'months', 'office'],    // It was supposed to last 18 months.  (18 796)
  [846, 899, 'nobody', 'hill30'],    // Nobody took it down.  (hard cut, music stop)
  [899, 951, 'bust', 'officeBust'],  // The real estate company went bust,  (bust 930)
  [951, 994, 'rotted', 'hill44'],    // and the sign rotted.  (rotted 964)
  [994, 1098, 'fallH', 'hill44'],    // By 1944, the H had blown over.  (1944 997, H 1034, blown 1050)
  [1098, 1166, 'y1949', 'hill49'],   // In 1949, the Chamber of Commerce  (1949 1101, Chamber 1136)
  [1166, 1240, 'fix', 'hill49'],     // agreed to fix it, on one condition:  (condition 1202)
  [1240, 1295, 'chop', 'hill49'],    // chop off LAND.  (hard cut, music stop; LAND 1250)
  [1295, 1371, 'seventies', 'hill70'], // By the 70s, it was falling apart again.  (70s 1303)
  [1371, 1421, 'y1978', 'hill78'],   // So in 1978,  (1978 1383)
  [1421, 1488, 'celebs', 'gala'],    // celebrities rebuilt it, one letter at a time,
  [1488, 1568, 'price', 'gala'],     // about $27,000 each.  ($27,000 1495)
  [1568, 1622, 'rock', 'gala'],      // A rock star bought an O.  (O 1596)
  [1622, 1686, 'cowboy', 'gala'],    // A cowboy singer bought an L.  (L 1657)
  [1686, 1782, 'today', 'hillNow'],  // Today, it's the most famous sign on Earth.  (famous 1713, Earth 1743)
  [1782, 1830, 'dream', 'hillNow'],  // Hollywood kept the dream...
  [1830, 1920, 'end', 'hillNow'],    // it just dropped the LAND.  (LAND 1857)
];
export const NF = 1920;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
const LIGHT = { hillNow: 'day', hill30: 'day', hill23: 'day', hill23n: 'night', hill44: 'day', hill49: 'day', hill70: 'day', hill78: 'day', office: 'office', officeBust: 'office', gala: 'night' };
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: LIGHT[s[3]], kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['hw', segAt(f)[3]];

// ---------- places ----------
const at = (o) => (p) => [p[0] + o[0], p[1] + o[1], p[2] + o[2]];
const HL = at([-34000, 0, 0]), OF = at([-36500, 0, 0]), GA = at([-36500, 0, 600]);
const G = (x, z, h = 0) => HL([x, hf(x, z) + h, z]);           // hill ground point
const LT = (i, dy = 7) => HL([LX(i), LY(i) + dy, LZ(i)]);       // letter i, dy up its face

// ---------- cameras ----------
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(HL([-112, LY(0) + 6, 46]), HL([-16, LY(4) + 5, 0]), 34, 0.4),
  houses: C(G(-6, 182, 3.2), HL([-12, 2, 0]), 50, 0.8, G(-6, 177, 1)),
  y1923: C(G(-24, 38, 1.7), HL([-22, LY(3) + 3, 0]), 56, 1.0, G(-24, 32, 1)),
  buyers: C(OF([0.6, 1.6, 2.6]), OF([-0.2, 1.4, -3.0]), 52, 1.4, OF([0.4, 1.2, -1.6])),
  name: C(OF([0.25, 1.7, 2.8]), OF([0.2, 2.5, -3.2]), 56, 1.4, OF([0.2, 2.9, -3.1])),
  backers: C(OF([0.3, 1.5, 1.6]), OF([0.2, 1.3, -2.0]), 50, 2, OF([0.2, 1.2, -1.9])),
  paid: C(OF([0.9, 1.75, 0.9]), OF([0.7, 1.05, -1.5]), 56, 2.0, OF([0.6, 0.85, -1.25])),
  mules: C(G(2, 34, 2.4), G(-8, 25, 3.5), 52, 0.8, G(-5, 27, 1)),
  tall: C(G(LX(0) + 5, 11, 1.0), LT(0, 10.5), 58, 1.0, G(LX(0) + 2, 4, 1)),
  bulbs: C(G(LX(5) + 7, 19, 1.6), LT(5, 4), 58, 0.8, G(LX(5) + 5, 14, 1)),
  flash: C(HL([-96, LY(0) + 2, 36]), HL([8, LY(6) + 6, 0]), 38, 0.4),
  months: C(OF([0.6, 1.45, 0.6]), OF([-3.6, 1.35, -1.2]), 50, 2.5, OF([-3.0, 1.6, -0.9])),
  nobody: C(G(LX(6) + 3, 36, 1.4), LT(6, 2), 54, 0.8, G(LX(6) + 2.5, 30.5, 0.6)),
  bust: C(OF([0.6, 1.6, 2.6]), OF([-0.2, 1.4, -3.0]), 52, 1.4, OF([0.4, 1.2, -1.6])),
  rotted: C(G(LX(1) + 13, 26, 2.0), LT(1, 3), 52, 0.8, G(LX(1) + 9, 20, 1)),
  fallH: C(G(LX(0) + 4, 34, 2.0), HL([LX(0) - 5, LY(0) + 1, 0]), 56, 0.8, G(LX(0) + 3, 28, 0.8)),
  y1949: C(G(LX(2) + 4, 19, 1.6), LT(1, 4), 56, 1.0, G(LX(2) + 2.5, 14, 1)),
  fix: C(G(LX(0) + 7, 15, 1.4), LT(0, 5.5), 54, 1.0, G(LX(0) + 3, 5, 1)),
  chop: C(HL([LX(10), -40, 190]), HL([LX(10), LY(10) + 6, 0]), 27, 0.3),
  seventies: C(HL([-84, LY(0) + 3, 56]), HL([-6, LY(5) + 8, 0]), 38, 0.5),
  y1978: C(G(-8, 126, 14), HL([-21, LY(4) + 6, 0]), 30, 0.4),
  celebs: C(GA([0.3, 1.6, 4.2]), GA([0, 1.55, -3.5]), 54, 1.4, GA([0, 1.4, -1.0])),
  price: C(GA([0.15, 1.75, 0.2]), GA([0, 1.72, -4.0]), 46, 3, GA([0, 1.75, -3.9])),
  rock: C(GA([0.9, 1.5, 5.2]), GA([0.3, 1.3, -1.2]), 48, 1.6, GA([0.35, 1.2, -0.6])),
  cowboy: C(GA([-0.9, 1.5, 5.2]), GA([-0.3, 1.3, -1.2]), 48, 1.6, GA([-0.35, 1.2, -0.6])),
  today: C(G(44, 53, 1.6), HL([-12, LY(4) + 4, 0]), 44, 1.0, G(38, 47, 1.2)),
  dream: C(HL([LX(1), LY(1) + 3, 48]), LT(2, 6), 46, 0.5),
  end: C(G(48, 60, 3), HL([48, 5, 0]), 60, 0.6, G(48, 52, 1)),
};
const gp = (k, x, d, h = 0) => { const c = V[k], fx = c.l[0] - c.p[0], fz = c.l[2] - c.p[2], n = Math.hypot(fx, fz), ux = fx / n, uz = fz / n, wx = c.p[0] + ux * d - uz * x, wz = c.p[2] + uz * d + ux * x;
  const hill = Math.abs(wx + 34000) < 1000 && Math.abs(wz) < 1000; return [wx, (hill ? hf(wx + 34000, wz) : 0) + h, wz]; };
for (const k of Object.keys(V)) { const c = V[k]; if (Math.abs(c.p[0] + 34000) < 1000) { CLEAR.push([c.p[0] + 34000, c.p[2], 11]); const fx = c.l[0] - c.p[0], fz = c.l[2] - c.p[2], n = Math.hypot(fx, fz); for (const d of [4, 7, 10, 14, 19, 25, 31, 38]) CLEAR.push([c.p[0] + 34000 + fx / n * d, c.p[2] + fz / n * d, d < 12 ? 7 : 9]); } }
CLEAR.push([48, 48.5, 6], [48, 54, 6], [LX(10), 24, 8], [LX(8), 24, 8], [LX(7), 18, 7]);
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 2.2) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; }; // push capped at 2.2 m so foreground actors stay in front
const PUSH = { hook: 0.08, houses: 0.1, y1923: 0.1, buyers: 0.1, name: 0.12, backers: 0.1, paid: 0.1, mules: 0.06, tall: 0.04, bulbs: 0.1, flash: 0.06, months: 0.1, nobody: 0.08, bust: 0.1, rotted: 0.1, fallH: 0.06,
  y1949: 0.1, fix: 0.1, chop: 0.06, seventies: 0.06, y1978: 0.1, celebs: 0.1, price: 0.12, rock: 0.1, cowboy: 0.1, today: 0.1, dream: 0, end: 0 };
const base = (k) => V[k] || V.hook;
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const pan = (d, f0, f1) => { const t = sm(f0, f1, f); const o = d.map((x) => x * t); c = { ...c, p: add3(c.p, o), l: add3(c.l, o), fp: add3(c.fp, o) }; };
  if (k === 'hook') { punch(48, 56, 0.1); kick(48, 0.6); }
  if (k === 'houses') { punch(64, 72, 0.12); kick(64, 0.5); }
  if (k === 'y1923') { punch(106, 113, 0.08); c = { ...c, l: add3(c.l, [0, 2.5 * sm(110, 150, f), 0]) }; }
  if (k === 'buyers') punch(182, 189, 0.1);
  if (k === 'name') { punch(234, 240, 0.14); kick(234, 0.05); }
  if (k === 'backers') punch(315, 322, 0.08);
  if (k === 'paid') { punch(364, 370, 0.1); kick(398, 0.04); punch(427, 434, 0.08); }
  if (k === 'mules') pan([-3, 0, -2], 457, 543);
  if (k === 'tall') { c = { ...c, l: add3(c.l, [0, -6 * (1 - sm(543, 590, f)), 0]) }; punch(565, 572, 0.06); }
  if (k === 'bulbs') { punch(615, 622, 0.08); punch(643, 650, 0.08); }
  if (k === 'flash') { kick(684, 0.5); kick(711, 0.5); kick(736, 0.5); punch(736, 744, 0.1); }
  if (k === 'months') punch(796, 804, 0.12);
  if (k === 'nobody') punch(851, 857, 0.06);
  if (k === 'bust') { punch(930, 937, 0.1); kick(930, 0.04); }
  if (k === 'rotted') punch(964, 972, 0.08);
  if (k === 'fallH') { punch(997, 1004, 0.06); shake(1062, 1082, 0.5); }
  if (k === 'y1949') { punch(1101, 1108, 0.08); punch(1136, 1143, 0.06); }
  if (k === 'fix') { kick(1178, 0.3); punch(1202, 1210, 0.1); }
  if (k === 'chop') { shake(1252, 1262, 0.4); shake(1266, 1276, 0.4); shake(1279, 1289, 0.4); punch(1250, 1258, 0.06); }
  if (k === 'seventies') punch(1303, 1310, 0.08);
  if (k === 'y1978') punch(1383, 1390, 0.1);
  if (k === 'celebs') punch(1461, 1467, 0.06);
  if (k === 'price') { punch(1495, 1502, 0.08); }
  if (k === 'rock') { punch(1596, 1602, 0.12); kick(1596, 0.04); }
  if (k === 'cowboy') { punch(1657, 1663, 0.12); kick(1657, 0.04); }
  if (k === 'today') { punch(1713, 1720, 0.08); }
  if (k === 'dream') pan([LX(5) - LX(1), 0, 0], 1782, 1830);
  if (k === 'end') { punch(1857, 1866, 0.1); }
  return c;
}
const HARD = new Set([846, 1240]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[56, 0.7, 10], [104, 0.5, 8], [234, 0.4, 8], [457, 0.5, 10], [600, 0.6, 10], [684, 0.3, 6], [711, 0.3, 6], [736, 0.4, 8], [951, 0.5, 10], [994, 0.4, 8], [1066, 0.5, 8], [1098, 0.7, 10], [1295, 0.6, 10], [1371, 0.8, 10], [1421, 0.5, 8], [1596, 0.3, 6], [1657, 0.3, 6], [1686, 0.6, 10], [1857, 0.4, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state ----------
const bulbsAt = (f, k) => { if (k === 'bulbs') { const t = sm(640, 664, f); return [sm(0, 0.3, t), sm(0.3, 0.6, t), sm(0.6, 0.9, t)]; }
  if (k === 'flash') { if (f < 711) return [1, 0, 0]; if (f < 736) return [0, 1, 0]; if (f < 752) return [0, 0, 1]; const on = Math.floor((f - 752) / 6) % 2 === 0 ? 1 : 0.15; return [on, on, on]; } return [0, 0, 0]; };
export function worldAt(f, w) {
  const s = segAt(f), k = s[2], Hw = w.hw;
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  if (!Hw) return;
  Hw.bulbs(...bulbsAt(f, k));
  Hw.fallH(k === 'fallH' ? sm(1044, 1066, f) ** 1.6 : 0);
  Hw.landOff(k === 'chop' ? sm(1248, 1292, f) * 1.15 : k === 'y1949' || k === 'fix' ? 0 : 0);
  Hw.sled(k === 'mules' ? 0.42 + 0.22 * sm(457, 543, f) : -1);
  Hw.flags(k === 'buyers' ? 0 : k === 'name' || k === 'backers' ? 0.15 : k === 'paid' ? 0.2 : k === 'months' ? 0.35 : 0);
  Hw.calendar(k === 'months' ? (f < 805 ? 0 : 1) : k === 'bust' ? 2 : 0);
  Hw.gsold(k === 'celebs' ? 3 * sm(1450, 1486, f) : k === 'price' ? 3 + 6 * sm(1500, 1560, f) : k === 'rock' || k === 'cowboy' ? 9 : 0);
  Hw.ghost(k === 'end' ? sm(1852, 1872, f) * (1 - 0.3 * (Math.sin(f * 0.4) * 0.5 + 0.5)) : 0);
}

// ---------- actors ----------
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const HH = (f, pos, opts = {}, extra = {}) => person(f, 'LILH', 9, pos, { t: f, ...opts }, { s: 0.42, ...extra });
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
const hop = (f, i = 0, a = 0.06) => [0, a * Math.abs(Math.sin(f * 0.35 + i)), 0];
const mulePos = (f) => { const t = 0.42 + 0.22 * sm(457, 543, f), a = trailAt(t), b = trailAt(Math.min(1, t + 0.01)), d = [b.p[0] - a.p[0], b.p[2] - a.p[2]], l = Math.hypot(...d) || 1; const x = a.p[0] + d[0] / l * 5.6, z = a.p[2] + d[1] / l * 5.6; return { pos: G(x, z), dir: [d[0] / l, d[1] / l], back: G(a.p[0] - d[0] / l * 5.4, a.p[2] - d[1] / l * 5.4) }; };
const camRightX = (k, f, d) => { const c = cam(k, f), fx = c.l[0] - c.p[0], fz = c.l[2] - c.p[2]; return d[0] * -fz + d[1] * fx; };

export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'y1923') { A.push(P(f, 'HW_DEV', 31, gp('y1923', 0.45, 6.0), { expr: f < 120 ? 'smile' : 'happy', point: 1, view: '34L' })); A.push(HH(f, gp('y1923', -0.75, 5.4), { expr: 'happy', pose: 'wave' })); }
  if (k === 'buyers') { A.push(P(f, 'HW_DEV', 31, OF([0.55, 0, -1.95]), { expr: f < 182 ? 'smile' : 'worried', view: 'front' })); A.push(HH(f, OF([-0.15, 0, 0.5]), { expr: f < 182 ? 'smile' : 'sad', look: 1 })); }
  if (k === 'name') { A.push(P(f, 'HW_DEV', 31, OF([-0.6, 0, -1.4]), { expr: f < 234 ? 'smile' : 'excited', point: 1, raise: f > 230 ? 1 : 0, view: '34R' })); A.push(HH(f, OF([0.85, 0, -0.9]), { expr: f < 234 ? 'smile' : 'love', pose: f < 234 ? 'stand' : 'cheer' })); }
  if (k === 'backers') { A.push(P(f, 'HW_DEV', 31, OF([-0.55, 0, -1.9]), { expr: 'happy', view: '34R' })); A.push(P(f, 'HW_PUB', 32, OF([0.85, 0, -2.0]), { expr: f < 315 ? 'smile' : 'smug', prop: 'newspaper', reach: 0.7, raise: f > 312 ? 1 : 0, view: '34L' })); }
  if (k === 'paid') A.push(P(f, 'HW_PUB', 32, OF([0.95, 0, -2.0]), { expr: f < 364 ? 'smile' : 'grin', prop: 'moneybag', reach: 0.8, raise: f > 360 ? 1 : 0, view: '34L' }));
  if (k === 'mules') { const m = mulePos(f), sp = 0.035; A.push(person(f, 'MULE', 5, m.pos, { phase: ((f * sp) % 1), flip: camRightX('mules', f, m.dir) < 0, strain: 1, t: f }, { s: 2.1, blob: false }));
    A.push(P(f, 'HW_WORK1', 41, m.back, { expr: 'worried', mode: 'march', phase: q((f * 0.04) % 1, 0.05), view: '34L' })); }
  if (k === 'tall') { A.push(P(f, 'HW_WORK2', 42, G(LX(0) + 2.2, 4.2), { expr: f < 565 ? 'smile' : 'surprised', prop: 'hammer', reach: 0.7, view: '34L' })); A.push(HH(f, G(LX(0) + 1.0, 5.6), { expr: f < 565 ? 'smile' : 'shock', look: -1 })); }
  if (k === 'bulbs') A.push(P(f, 'HW_WORK2', 42, gp('bulbs', -0.6, 6.0), { expr: f < 643 ? 'smile' : 'excited', prop: 'bulb', lit: f > 643 ? 1 : 0, raise: 1, reach: 0.95, view: '34L' }));
  if (k === 'months') { A.push(P(f, 'HW_DEV', 31, OF([-2.75, 0, -0.35]), { expr: f < 805 ? 'smile' : 'surprised', view: '34L' })); A.push(HH(f, OF([-2.2, 0, -1.6]), { expr: f < 805 ? 'smile' : 'shock' })); }
  if (k === 'nobody') A.push(HH(f, gp('nobody', 0.1, 5.5), { expr: f < 857 ? 'smile' : 'sly', pose: f < 857 ? 'stand' : 'shrug' }, { s: 0.55 }));
  if (k === 'bust') { A.push(P(f, 'HW_DEV', 31, OF([0.55, 0, -1.95]), { expr: f < 930 ? 'worried' : 'sad', view: 'front', handsUp: f > 935 ? 1 : 0 })); }
  if (k === 'rotted') A.push(HH(f, gp('rotted', -0.3, 8.5), { expr: 'sad', dented: 0.6 + 0.4 * sm(955, 990, f) }, { s: 0.5 }));
  if (k === 'fallH') A.push(HH(f, gp('fallH', 0.5, 6), { expr: f < 1044 ? 'sad' : f < 1070 ? 'shock' : 'dizzy', dented: 1, pose: f < 1044 ? 'stand' : 'shock' }, { s: 0.5 }));
  if (k === 'y1949') { A.push(P(f, 'HW_CHAMBER', 51, gp('y1949', 0.4, 5.5), { expr: f < 1136 ? 'smile' : 'happy', prop: 'notepad', reach: 0.6, view: '34L' })); A.push(HH(f, gp('y1949', -0.5, 5.0), { expr: 'happy', pose: 'wave' })); }
  if (k === 'fix') { A.push(P(f, 'HW_CREW', 52, G(LX(0) + 2.8, 4.6), { expr: f < 1202 ? 'grin' : 'surprised', prop: 'hammer', reach: 0.8, raise: Math.sin(f * 0.5) > 0 ? 1 : 0, view: '34L' }));
    A.push(P(f, 'HW_CHAMBER', 51, G(LX(0) + 5.3, 7.8), { expr: f < 1202 ? 'smile' : 'smug', point: f > 1200 ? 1 : 0, prop: 'notepad', reach: 0.6, view: '34L' })); }
  if (k === 'seventies') {}
  if (k === 'celebs' || k === 'price') { const gal = k === 'celebs';
    if (gal) { A.push(P(f, 'HW_HOST', 61, GA([0.0, 0.5, -3.0]), { expr: 'laugh', cheer: wav(f, 0), view: 'front' }));
      [['HW_GUEST', -0.95, 0.9], ['HW_ROCK', -0.4, 0.3], ['HW_COWBOY', 0.45, 0.35], ['HW_GUEST', 1.0, 1.0]].forEach(([o, x, z], i) => A.push(P(f, o, 62 + i, GA(add3([x, 0, z], hop(f, i, 0.04))), { expr: i % 2 ? 'excited' : 'happy', cheer: i % 2 ? wav(f, i) : undefined, view: x < 0 ? '34R' : '34L' }))); }
    else A.push(HH(f, GA([0.95, 0.5, -3.3]), { expr: f < 1500 ? 'smile' : 'love', pose: f < 1500 ? 'point' : 'cheer' }, { s: 0.3 })); }
  if (k === 'rock') { A.push(P(f, 'HW_ROCK', 63, GA([0.35, 0, -0.6]), { expr: f < 1596 ? 'smug' : 'excited', point: f > 1592 ? 1 : 0, view: '34L' })); A.push(person(f, 'BIGLET', 7, GA([1.05, 0, -0.75]), { ch: 'O', bow: 1, sold: sm(1596, 1604, f) }, { s: 0.95 })); A.push(HH(f, GA([-0.55, 0, 0.0]), { expr: f < 1596 ? 'smile' : 'love', pose: f < 1596 ? 'stand' : 'cheer' }, { s: 0.3 })); }
  if (k === 'cowboy') { A.push(P(f, 'HW_COWBOY', 64, GA([-0.35, 0, -0.6]), { expr: f < 1657 ? 'smile' : 'laugh', point: f > 1652 ? 1 : 0, view: '34R' })); A.push(person(f, 'BIGLET', 8, GA([-1.05, 0, -0.75]), { ch: 'L', bow: 1, sold: sm(1657, 1665, f) }, { s: 0.95 })); A.push(HH(f, GA([0.55, 0, 0.0]), { expr: f < 1657 ? 'smile' : 'happy', pose: f < 1657 ? 'stand' : 'cheer' }, { s: 0.3 })); }
  if (k === 'today') { A.push(P(f, 'HW_TOURIST', 71, gp('today', 0.35, 6.0), { expr: f < 1713 ? 'happy' : 'excited', prop: 'selfie', raise: 1, reach: 0.95, view: '34R' })); A.push(HH(f, gp('today', -0.3, 7.5), { expr: 'happy', pose: f < 1713 ? 'stand' : 'cheer' }, { s: 0.4 })); }
  if (k === 'end') A.push(HH(f, G(48, 48.5), { expr: f < 1857 ? 'smile' : 'sly', pose: f < 1857 ? 'wave' : 'shrug' }, { s: 1.15 }));
  return A;
}

// ---------- effects ----------
const ASP = 1080 / 1920; let CURF = 0;
function SB(k, x, y, z) { const c = cam(k, CURF), n = (v) => { const l = Math.hypot(...v); return v.map((u) => u / l); }, fw = n([c.l[0] - c.p[0], c.l[1] - c.p[1], c.l[2] - c.p[2]]), r = n([-fw[2], 0, fw[0]]), u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]], t = Math.tan(c.fov * Math.PI / 360);
  return [0, 1, 2].map((i) => c.p[i] + fw[i] * z + r[i] * x * t * ASP * z + u[i] * y * t * z); }
const SW = (k, w, z) => 2 * w * z * Math.tan(cam(k, CURF).fov * Math.PI / 360) * ASP;
const board = (f, f0, lines, pos, size, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'board', lines, pos, size: size * back(f0, f0 + 12, f) }); };
const sboard = (f, f0, lines, k, x, y, z, w, F2, f1) => board(f, f0, lines, SB(k, x, y, z), SW(k, w, z), F2, f1);
const sburst = (f, f0, k, x, y, z, w, F2, col = '#fff3b0', n = 12) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'burst', t: (f - f0) / n, pos: SB(k, x, y, z), size: SW(k, w, z), col, rays: 10 }); };
const stars = (f, f0, k, x, y, z, w, F2, per = 30) => { if (f >= f0) F2.push({ fx: 'stars', t: ((f - f0) / per) % 1, pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 10, f) }); };
const qmark = (f, f0, k, x, y, z, w, F2) => { if (f >= f0) F2.push({ fx: 'qmark', pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 8, f) }); };
const stamp = (f, f0, lines, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) { const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos: SB(k, x, y, z), size: SW(k, w, z) * (1.6 - 0.6 * t * t), op: Math.min(1, t * 2) }); } };
const wpuff = (f, f0, pos, size, F2, n = 16, tint) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'puff', t: (f - f0) / n, pos, size, tint }); };
const notes = (f, f0, f1, k, x, y, z, F2, col = '#c0453a') => { if (f < f0 || f >= f1) return; for (let i = 0; i < 3; i++) { const u = ((f - f0) / 24 + i / 3) % 1; F2.push({ fx: 'note', kind: i % 2, pos: SB(k, x + 0.25 * (i - 1), y + u * 0.35, z), size: SW(k, 0.1, z), op: 0.95 * (1 - u), col }); } };
const count = (f, f0, f1, v0, v1, fmt) => fmt(Math.round(v0 + (v1 - v0) * sm(f0, f1, f)));
const usd = (n) => '$' + n.toLocaleString('en-US');
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { sboard(f, 46, ['THE HOLLYWOOD SIGN', 'WAS AN AD...'], 'hook', 0.0, 0.62, 3, 0.48, F2); }
  if (k === 'houses') { sburst(f, 64, 'houses', 0.0, 0.55, 3, 0.6, F2, '#fff3b0', 12); sboard(f, 62, ['...FOR', 'HOUSES?!'], 'houses', 0.0, 0.62, 3, 0.42, F2); qmark(f, 70, 'houses', 0.42, 0.25, 3, 0.1, F2); }
  if (k === 'y1923') { sboard(f, 106, ['1923'], 'y1923', -0.4, 0.66, 3, 0.3, F2); sboard(f, 141, ['A NEW', 'NEIGHBORHOOD'], 'y1923', 0.3, 0.42, 3, 0.4, F2); }
  if (k === 'buyers') { sboard(f, 178, ['NEEDED:', 'BUYERS!'], 'buyers', 0.0, 0.62, 2.5, 0.42, F2); qmark(f, 186, 'buyers', 0.36, 0.25, 2.5, 0.1, F2); }
  if (k === 'name') { sburst(f, 234, 'name', 0.0, 0.45, 2.2, 0.8, F2, '#fff3b0', 14); stars(f, 238, 'name', 0.0, 0.2, 2.2, 0.6, F2, 24); }
  if (k === 'backers') { sboard(f, 312, ['PUBLISHER OF THE', 'LOS ANGELES TIMES'], 'backers', 0.0, 0.64, 2.5, 0.5, F2); }
  if (k === 'paid') { if (f > 362 && f < 424) board(f, 362, [count(f, 364, 398, 0, 21000, usd)], SB('paid', 0.0, 0.6, 1.0), SW('paid', 0.42, 1.0), F2); sboard(f, 425, ['FOR A GIANT', 'BILLBOARD'], 'paid', 0.0, 0.6, 1.0, 0.42, F2); }
  if (k === 'mules') { sboard(f, 484, ['POLES + SHEET METAL', 'UP THE MOUNTAIN'], 'mules', 0.0, 0.64, 8, 0.5, F2); }
  if (k === 'tall') { sburst(f, 565, 'tall', 0.0, 0.55, 4, 0.5, F2); sboard(f, 563, ['EACH LETTER:', '50 FEET TALL'], 'tall', 0.0, 0.6, 4, 0.46, F2); }
  if (k === 'bulbs') { if (f > 613) board(f, 613, [count(f, 615, 640, 0, 4000, (n) => n.toLocaleString('en-US')), 'LIGHT BULBS'], SB('bulbs', 0.0, 0.62, 4), SW('bulbs', 0.44, 4), F2); }
  if (k === 'flash') { for (const [f0, x] of [[684, -0.25], [711, 0.0], [736, 0.25]]) sburst(f, f0, 'flash', x, 0.2, 4, 0.35, F2, '#ffe080', 10); stars(f, 752, 'flash', 0.0, 0.5, 4, 0.5, F2, 24); }
  if (k === 'months') { sboard(f, 794, ['MEANT TO LAST:', '18 MONTHS'], 'months', 0.0, 0.62, 1.4, 0.46, F2); }
  if (k === 'nobody') { stamp(f, 851, ['NOBODY', 'TOOK IT DOWN'], 'nobody', 0.0, 0.58, 3, 0.5, F2); }
  if (k === 'bust') { stamp(f, 930, ['WENT', 'BUST'], 'bust', 0.0, 0.58, 2.5, 0.42, F2); }
  if (k === 'rotted') { sboard(f, 962, ['...AND THE', 'SIGN ROTTED'], 'rotted', 0.0, 0.62, 4, 0.46, F2); }
  if (k === 'fallH') { sboard(f, 997, ['1944'], 'fallH', -0.38, 0.66, 4, 0.3, F2, 1060); if (f >= 1064) wpuff(f, 1064, LT(0, 0.5), 18, F2, 22, '#c8b8a0'); if (f >= 1066) stamp(f, 1068, ['THE H', 'BLEW OVER!'], 'fallH', 0.0, 0.58, 4, 0.46, F2); }
  if (k === 'y1949') { sboard(f, 1101, ['1949'], 'y1949', -0.38, 0.66, 4, 0.3, F2); sboard(f, 1136, ['CHAMBER OF', 'COMMERCE'], 'y1949', 0.25, 0.42, 4, 0.4, F2); }
  if (k === 'fix') { sboard(f, 1172, ['WE\'LL FIX IT...'], 'fix', 0.0, 0.64, 3, 0.42, F2, 1200); sboard(f, 1200, ['ON ONE', 'CONDITION!'], 'fix', 0.0, 0.64, 3, 0.42, F2); }
  if (k === 'chop') { for (const f0 of [1255, 1268, 1280, 1290]) if (f >= f0) wpuff(f, f0, HL([LX(9 + [1255, 1268, 1280, 1290].indexOf(f0)), LY(9) + 1, LZ(9) - 4]), 12, F2, 20, '#d8c8a8'); stamp(f, 1252, ['BYE BYE', '"LAND"'], 'chop', 0.0, 0.6, 4, 0.46, F2); }
  if (k === 'seventies') { sboard(f, 1300, ['THE 1970s'], 'seventies', 0.0, 0.64, 4, 0.4, F2); sboard(f, 1335, ['FALLING APART', 'AGAIN'], 'seventies', 0.0, 0.42, 4, 0.42, F2); }
  if (k === 'y1978') { sburst(f, 1383, 'y1978', 0.0, 0.6, 4, 0.6, F2, '#fff3b0', 14); sboard(f, 1381, ['1978'], 'y1978', 0.0, 0.62, 4, 0.32, F2); }
  if (k === 'celebs') { sboard(f, 1425, ['CELEBRITIES', 'TO THE RESCUE'], 'celebs', 0.0, 0.66, 3, 0.44, F2); }
  if (k === 'price') { if (f > 1493) board(f, 1493, ['ABOUT ' + count(f, 1495, 1528, 0, 27700, usd), 'PER LETTER'], SB('price', 0.0, 0.58, 1.2), SW('price', 0.36, 1.2), F2); }
  if (k === 'rock') { sburst(f, 1596, 'rock', 0.0, 0.3, 2.2, 0.6, F2, '#ff9ad8', 12); sboard(f, 1578, ['A ROCK STAR', 'BOUGHT AN "O"'], 'rock', 0.0, -0.62, 2.2, 0.4, F2); notes(f, 1585, 1622, 'rock', -0.3, 0.2, 2.2, F2, '#e8302a'); }
  if (k === 'cowboy') { sburst(f, 1657, 'cowboy', 0.0, 0.3, 2.2, 0.6, F2, '#ffe080', 12); sboard(f, 1630, ['A COWBOY SINGER', 'BOUGHT AN "L"'], 'cowboy', 0.0, -0.62, 2.2, 0.42, F2); notes(f, 1640, 1686, 'cowboy', 0.3, 0.2, 2.2, F2, '#3a6ad8'); }
  if (k === 'today') { sboard(f, 1690, ['TODAY'], 'today', -0.38, 0.68, 4, 0.3, F2, 1710); sboard(f, 1712, ['THE MOST FAMOUS', 'SIGN ON EARTH'], 'today', 0.0, 0.64, 4, 0.5, F2); stars(f, 1745, 'today', 0.0, 0.4, 4, 0.5, F2, 24); }
  if (k === 'dream') { sboard(f, 1786, ['HOLLYWOOD', 'KEPT THE DREAM...'], 'dream', 0.0, 0.64, 4, 0.48, F2); }
  if (k === 'end') { sboard(f, 1857, ['...AND DROPPED', 'THE "LAND"'], 'end', 0.0, 0.64, 4, 0.48, F2); sburst(f, 1857, 'end', 0.0, 0.64, 4, 0.6, F2, '#fff3b0', 12); stars(f, 1862, 'end', 0.0, -0.3, 4, 0.45, F2, 20); }
  return F2;
}
