// [SK-story] "The Super Soaker was invented by a NASA engineer" timeline (63.63 s voice, 1910 f @ 30 fps).
// Sets: sk_sets.js (bath / shop / yard / jpl / court / space) through setAt. Pattern: story_pringles.js (slow push per shot, zoom-through
// whips on cuts, screen-pinned boards / bursts / stamps, punch-ins on beats). DRIPPY (a living water drop) is the sidekick; the water jet
// is the motif: the backyard hook, the bathroom blast, the prototype, the 1990 water fights, the water glass at the arbitration, the payoff.
// No real brand art: on-screen words never show the toy's brand names (only the narration says them); every blaster is the invented design.
import * as S from './story.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]                                     narration (word frames from work/words_frames.txt)
const SH = [
  [0, 178, 'hook', 'yardSun'],      // The most famous water gun ever made was invented by a NASA spacecraft engineer. By accident.  (water 25, gun 33, invented 70, NASA 94, engineer 116, accident 144)
  [178, 327, 'who', 'jplDay'],      // Lonnie Johnson was a nuclear engineer who worked for the Air Force, and for NASA's Jet Propulsion Lab.  (Lonnie 178, nuclear 206, Air Force 249, NASA's 280, Jet 292, Lab 310)
  [327, 467, 'space', 'space'],     // He helped power the Galileo probe to Jupiter, and later worked on Cassini, bound for Saturn.  (power 336, Galileo 350, Jupiter 377, Cassini 419, Saturn 447)
  [467, 616, 'pump', 'bathNight'],  // But in 1982, at home, he was building a heat pump that used plain water instead of Freon.  (1982 473, home 506, heat 541, pump 547, plain 564, water 575, Freon 600)
  [616, 784, 'blast', 'bathNight'], // He hooked a test nozzle to his bathroom sink... and a jet of water blasted right across the room, into the tub.  (nozzle 636, sink 663, jet 687, blasted 705, across 725, tub 762)
  [784, 863, 'idea', 'bathNight'],  // His first thought? This would make an amazing water gun.  (thought 794, amazing 831, gun 855)
  [863, 995, 'build', 'shopLate'],  // So he built one, out of PVC pipe, Plexiglas, and an empty soda bottle.  (built 876, PVC 900, Plexiglas 932, soda 966, bottle 973)
  [995, 1100, 'doubt', 'shopLate'], // Toy companies weren't so sure. It took him years to find a maker.  (companies 995, sure 1022, years 1053, maker 1078)
  [1100, 1313, 'launch', 'yardSun'], // You see, in 1990, a company called Larami launched it as the Power Drencher. A year later, it got a new name: the Super Soaker.  (1990 1115, Larami 1161, launched 1172, Power 1197, year 1227, new name 1259, Super 1278)
  [1313, 1521, 'sales', 'yardSun'], // It reportedly sold $200 million worth in 1991 alone, and became one of the best-selling toys of all time.  (reportedly 1315, $200 1338, million 1358, 1991 1395, best-selling 1462, all time 1494)
  [1521, 1704, 'court', 'courtDay'], // Years later, he took Hasbro to arbitration over unpaid royalties. In 2013, he won nearly $73 million.  (Hasbro 1548, arbitration 1564, unpaid 1587, 2013 1624, won 1654, nearly 1659, $73 1668, million 1686)
  [1704, 1800, 'payJ', 'spaceGold'], // The man who helped send a probe to Jupiter...  (man 1737, send 1756, probe 1767, Jupiter 1780)
  [1800, 1910, 'payoff', 'yardGold'], // ...is best known for soaking your little brother.  (best 1812, known 1819, soaking 1832, little 1848, brother 1853)
];
export const NF = 1910;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['sk', segAt(f)[3]];

// ---------- places (set-local -> world)
const O = { bath: [-106000, 0, 0], shop: [-106000, 0, 800], yard: [-106000, 0, 1600], jpl: [-108500, 0, 0], court: [-108500, 0, 800], space: [-108500, 0, 1600] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const BAa = at(O.bath), SHa = at(O.shop), YDa = at(O.yard), JPa = at(O.jpl), CTa = at(O.court), SPa = at(O.space);
const BA = (x, z, h = 0) => BAa(x, h, z), SHP = (x, z, h = 0) => SHa(x, h, z), YD = (x, z, h = 0) => YDa(x, h, z), JP = (x, z, h = 0) => JPa(x, h, z), CT = (x, z, h = 0) => CTa(x, h, z);
// probe flight in space (set-local)
const probeAt = (f) => { const s = segAt(f); if (s[2] === 'payJ') { const t = sm(1704, 1800, f); return [0.4 - 1.6 * t, 0.2 + 0.4 * t, -1.0 - 6 * t]; } const t = sm(327, 467, f); return [-0.9 + 1.4 * t, -0.1 + 0.25 * t, -1.2 + 1.0 * t]; };

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(YDa(0.3, 1.25, 3.7), YDa(0.0, 0.95, -1.2), 46, 1.2, YDa(0.0, 0.9, -1.0)),
  who: C(JPa(0.9, 1.65, 4.2), JPa(-0.1, 1.35, -1.3), 46, 1.2, JPa(-0.4, 1.2, -0.8)),
  space: C(SPa(3.4, 1.3, 6.8), SPa(-0.4, 0.2, -1.0), 46, 0.6, SPa(-0.2, 0.0, -0.6)),
  pump: C(BAa(0.2, 1.15, 2.9), BAa(-0.3, 0.75, -1.5), 44, 2.0, BAa(-0.3, 0.6, -1.4)),
  blast: C(BAa(-0.95, 1.15, -0.62), BAa(-1.4, 0.98, -1.95), 42, 3.0, BAa(-1.4, 0.98, -1.95)),
  idea: C(BAa(-0.95, 1.45, 0.95), BAa(-1.85, 1.25, -1.35), 42, 2.2, BAa(-1.85, 1.25, -1.35)),
  build: C(SHa(0.2, 1.45, 1.45), SHa(-0.35, 1.05, -1.7), 44, 1.8, SHa(-0.2, 1.0, -1.65)),
  doubt: C(SHa(1.75, 1.5, 1.9), SHa(2.35, 1.1, -1.6), 44, 2.0, SHa(2.1, 0.95, -1.1)),
  launch: C(YDa(0.2, 1.3, 3.2), YDa(0.0, 1.0, -1.5), 46, 1.2, YDa(0.0, 0.9, -1.0)),
  sales: C(YDa(0.3, 1.4, 3.8), YDa(0.0, 0.85, -1.5), 46, 1.0, YDa(0.0, 0.8, -1.2)),
  court: C(CTa(0.3, 1.45, 2.4), CTa(0.0, 1.05, -1.5), 46, 1.4, CTa(-0.6, 1.0, -0.6)),
  payJ: C(SPa(2.0, 1.0, 4.5), SPa(-3.0, 1.2, -12), 46, 0.6, SPa(0.4, 0.2, -1.0)),
  payoff: C(YDa(0.15, 1.3, 3.9), YDa(-0.1, 0.95, -1.0), 46, 1.4, YDa(0.0, 0.9, -0.9)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.1, who: 0.1, space: 0.06, pump: 0.1, blast: 0, idea: 0.14, build: 0.12, doubt: 0.12, launch: 0.08, sales: 0, court: 0.1, payJ: 0.12, payoff: 0.04 };
const base = (k) => V[k] || V.hook;
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const look = (d, f0, f1, fd) => { const t = sm(f0, f1, f); c = { ...c, l: add3(c.l, d.map((x) => x * t)), fp: add3(c.fp, (fd || d).map((x) => x * t)) }; };
  const orbit = (a, f0, f1) => { const t = sm(f0, f1, f) - 0.5, an = a * t, dx = c.p[0] - c.l[0], dz = c.p[2] - c.l[2]; c = { ...c, p: [c.l[0] + dx * Math.cos(an) - dz * Math.sin(an), c.p[1], c.l[2] + dx * Math.sin(an) + dz * Math.cos(an)] }; };
  if (k === 'hook') { orbit(0.2, 0, 178); punch(33, 39, 0.08); kick(36, 0.03); shake(36, 50, 0.02); punch(116, 122, 0.08); punch(144, 150, 0.12); kick(144, 0.04); }
  if (k === 'who') { orbit(0.18, 178, 327); punch(206, 212, 0.06); punch(249, 255, 0.06); punch(292, 298, 0.08); }
  if (k === 'space') { const p = probeAt(f); c = { ...c, l: lerp3(c.l, SPa(p[0], p[1] + 0.3, p[2]), 0.6), fp: SPa(...p) }; orbit(0.35, 327, 467); { const u = sm(410, 450, f), sp = SPa(60, 22, -160), d = sp.map((v, i) => v - c.p[i]), L = Math.hypot(...d); c = { ...c, l: lerp3(c.l, c.p.map((v, i) => v + d[i] / L * 8), u), cInf: 0.6 - 0.4 * u }; } punch(350, 356, 0.06); punch(377, 383, 0.08); punch(447, 453, 0.08); }
  if (k === 'pump') { orbit(0.12, 467, 616); punch(473, 479, 0.06); punch(541, 547, 0.08); punch(600, 606, 0.1); kick(600, 0.03); }
  if (k === 'blast') { const t = sm(668, 698, f), u = sm(738, 766, f); c = { ...c, p: lerp3(c.p, BAa(1.3, 1.35, 0.9), t), l: lerp3(c.l, BAa(-1.3, 0.95, -1.7), t), fp: lerp3(c.fp, BAa(-1.45, 0.95, -1.85), t), fov: 42 + 4 * t, cInf: 3.0 - 1.8 * t };
    c = { ...c, l: lerp3(c.l, BAa(1.45, 0.55, -1.6), u), fp: lerp3(c.fp, BAa(1.4, 0.55, -1.6), u), p: add3(c.p, [-0.3 * u, 0.1 * u, 0.2 * u]) }; punch(636, 642, 0.06); punch(663, 669, 0.05); punch(705, 711, 0.06); shake(705, 735, 0.02); punch(762, 768, 0.08); kick(762, 0.03); }
  if (k === 'idea') { punch(794, 800, 0.06); punch(831, 837, 0.1); kick(831, 0.03); punch(855, 861, 0.06); }
  if (k === 'build') { orbit(0.2, 863, 995); punch(900, 906, 0.05); punch(932, 938, 0.05); punch(973, 979, 0.08); kick(975, 0.02); }
  if (k === 'doubt') { punch(1022, 1028, 0.08); punch(1053, 1059, 0.06); punch(1078, 1084, 0.06); }
  if (k === 'launch') { orbit(0.25, 1100, 1313); punch(1115, 1121, 0.06); punch(1172, 1178, 0.08); kick(1172, 0.03); punch(1262, 1268, 0.06); punch(1278, 1284, 0.1); kick(1278, 0.03); }
  if (k === 'sales') { const t = sm(1318, 1500, f); c = { ...c, p: lerp3(V.sales.p, YDa(0.8, 4.6, 8.2), t), l: lerp3(V.sales.l, YDa(0.2, 0.5, -3.2), t), fp: lerp3(V.sales.fp, YDa(0.0, 0.5, -2.5), t), fov: 46 + 4 * t, cInf: 1.0 - 0.4 * t };
    punch(1338, 1344, 0.05 * (1 - t)); punch(1395, 1401, 0.04); punch(1462, 1468, 0.05); }
  if (k === 'court') { orbit(0.25, 1521, 1704); punch(1564, 1570, 0.05); punch(1624, 1630, 0.06); punch(1654, 1660, 0.08); punch(1686, 1692, 0.12); kick(1686, 0.04); }
  if (k === 'payJ') { const p = probeAt(f); c = { ...c, fp: SPa(...p) }; punch(1767, 1773, 0.05); punch(1780, 1786, 0.08); }
  if (k === 'payoff') { punch(1812, 1818, 0.05); punch(1832, 1838, 0.1); kick(1834, 0.04); shake(1834, 1850, 0.02); punch(1853, 1859, 0.08); }
  return c;
}
const HARD = new Set([1800]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[36, 0.3, 6], [144, 0.25, 6], [178, 0.6, 12], [327, 0.5, 10], [377, 0.2, 6], [467, 0.8, 12], [600, 0.2, 6], [616, 0.3, 8], [705, 0.35, 8], [762, 0.2, 6], [784, 0.3, 8], [831, 0.25, 6], [863, 0.5, 10], [975, 0.2, 6], [995, 0.3, 8], [1022, 0.2, 6], [1100, 0.8, 12], [1172, 0.25, 6], [1278, 0.35, 8], [1313, 0.4, 10], [1462, 0.2, 6], [1521, 0.7, 12], [1686, 0.35, 8], [1704, 0.5, 10], [1800, 0.4, 8], [1834, 0.3, 6]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- water jets per shot (set-local), set into the set module each frame
const KN = 0.7; // kid nozzle height
const jet = (a, b, arc, g0, f, o = {}) => ({ a, b, arc, grow: sm(g0, g0 + (o.gd || 8), f), tail: o.stop ? sm(o.stop, o.stop + 8, f) : 0, r: o.r || 0.022, spray: o.spray });
function jetsAt(f) { const k = segAt(f)[2], J = [];
  if (k === 'hook') { J.push(jet([-0.2, KN, -0.52], [0.62, 0.92, -1.36], 0.3, 20, f, { stop: 120 })); J.push(jet([-0.2, KN, -0.52], [0.62, 1.0, -1.36], 0.25, 128, f, { gd: 6 })); }
  if (k === 'blast') J.push({ a: [-1.36, 1.015, -1.98], b: [1.75, 0.45, -1.72], arc: 0.12, r: 0.024, grow: sm(687, 703, f), tail: 0 });
  if (k === 'idea') J.push({ a: [-1.36, 1.015, -1.98], b: [1.75, 0.45, -1.72], arc: 0.12, r: 0.024, grow: 1, tail: sm(790, 806, f) });
  if (k === 'launch') { J.push(jet([0.3, KN, -0.82], [-0.78, 1.15, -2.25], 0.4, 1186, f, { gd: 10 })); J.push(jet([0.05, KN, -1.22], [0.7, 1.0, -0.86], 0.25, 1290, f, { gd: 8 })); }
  if (k === 'sales') { J.push(jet([-0.45, KN, -0.32], [0.82, 0.95, -1.2], 0.4, 1316, f)); J.push(jet([0.45, KN, -1.22], [-0.4, 1.2, -2.45], 0.4, 1330, f)); J.push(jet([0.05, KN, -3.0], [-0.35, 1.1, -2.55], 0.3, 1345, f));
    J.push(jet([1.35, KN, -0.12], [0.6, 0.95, -2.95], 0.45, 1360, f)); J.push(jet([-2.0, 1.4, -9.5], [2.5, 1.4, -10.5], 1.2, 1380, f, { r: 0.05 })); J.push(jet([4.5, 1.4, -11], [0.5, 1.4, -10], 1.0, 1400, f, { r: 0.05 })); }
  if (k === 'payoff') J.push(jet([-0.15, KN, -0.62], [0.5, 1.0, -1.08], 0.2, 1829, f, { gd: 6 }));
  return J; }

// ---------- world state
export function worldAt(f, w) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const N = w.sk; if (!N) return;
  N.set({ jets: jetsAt(f), duck: k === 'blast' ? sm(712, 742, f) : k === 'idea' ? 1 : 0, tubFill: k === 'blast' ? sm(700, 760, f) : k === 'idea' ? 1 : 0,
    build: k === 'build' ? sm(880, 985, f) : k === 'doubt' ? 1 : 0, letters: k === 'doubt' ? sm(1000, 1092, f) : 0,
    probeP: k === 'space' || k === 'payJ' ? probeAt(f) : [0, 0, 0], probeRY: k === 'payJ' ? 2.4 : 0.6, satVis: 1, porch: k === 'payoff' ? 1 : 0 });
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const KID = (f, o, seed, pos, opts = {}) => person(f, o, seed, pos, opts, { s: 0.8 });
const DR = (f, pos, opts = {}, extra = {}) => person(f, 'DRIPPY', 9, pos, { t: f, ...opts }, { s: 0.2, ...extra });
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') { const hit = f >= 36 && f < 120;
    A.push(KID(f, 'SK_KIDA', 21, YD(-0.65, -0.5), { expr: f < 30 ? 'determined' : 'laugh', view: '34L', prop: 'blaster', blCol: 'lime' }));
    A.push(KID(f, 'SK_KIDB', 22, YD(0.7, -1.4), { expr: f < 36 ? 'excited' : f < 130 ? 'shock' : 'laugh', view: '34R', prop: 'blaster', blCol: 'orange', raise: hit ? 1 : undefined }));
    A.push(DR(f, YD(0.05, 0.4), { expr: f < 38 ? 'smile' : f < 116 ? 'shock' : f < 144 ? 'proud' : 'love', pose: f < 38 ? 'stand' : f < 116 ? 'shock' : f < 144 ? 'point' : 'cheer' })); }
  if (k === 'who') { A.push(P(f, 'SK_LJLAB', 11, JP(-0.45, -0.15), { expr: f < 206 ? 'smile' : f < 280 ? 'proud' : 'happy', view: '34L', point: f > 290 ? 1 : undefined }));
    A.push(P(f, 'SK_ENG', 12, JP(0.6, -0.7), { expr: f < 249 ? 'smile' : 'excited', view: '34R' }));
    A.push(DR(f, JP(0.15, 0.1), { expr: f < 249 ? 'smile' : 'love', pose: f < 249 ? 'wave' : 'cheer' }, { s: 0.16 })); }
  if (k === 'pump') { A.push(P(f, 'SK_LJ', 13, BA(-0.08, -1.3), { expr: f < 541 ? 'thoughtful' : f < 600 ? 'determined' : 'smug', view: '34R', prop: 'wrench' }));
    A.push(DR(f, BA(-0.75, -1.5, 0.46), { expr: f < 564 ? 'smile' : f < 600 ? 'happy' : 'proud', pose: f < 564 ? 'stand' : f < 600 ? 'cheer' : 'hips' }, { s: 0.07, blob: false })); }
  if (k === 'blast') { A.push(P(f, 'SK_LJ', 13, BA(-1.85, -1.35), { expr: f < 687 ? 'determined' : f < 750 ? 'shock' : 'surprised', view: '34L', prop: f < 680 ? 'nozzle' : undefined, raise: f >= 700 && f < 760 ? 1 : undefined }));
    A.push(DR(f, BA(1.0, -1.38, 0.56), { expr: f < 750 ? 'smile' : f < 775 ? 'shock' : 'dazed', pose: f < 750 ? 'stand' : 'shock' }, { s: 0.1, blob: false })); }
  if (k === 'idea') { A.push(P(f, 'SK_LJ', 13, BA(-1.85, -1.35), { expr: f < 808 ? 'surprised' : f < 831 ? 'thoughtful' : 'excited', view: '34L', point: f > 831 ? 1 : undefined })); }
  if (k === 'build') { A.push(P(f, 'SK_LJ', 13, SHP(-0.72, -2.25), { expr: f < 900 ? 'determined' : f < 973 ? 'smile' : 'excited', view: 'front', raise: f > 978 ? 1 : undefined }));
    A.push(DR(f, SHP(0.7, -1.45, 0.9), { expr: f < 973 ? 'smile' : 'love', pose: f < 973 ? 'point' : 'cheer' }, { s: 0.08, blob: false })); }
  if (k === 'doubt') { A.push(P(f, 'SK_LJ', 13, SHP(2.0, -0.95), { expr: f < 1022 ? 'thoughtful' : f < 1078 ? 'sad' : 'determined', view: '34L', prop: 'letter' }));
    A.push(DR(f, SHP(2.95, -1.45, 0.76), { expr: f < 1022 ? 'smile' : 'sad', pose: f < 1022 ? 'stand' : 'shrug' }, { s: 0.07, blob: false })); }
  if (k === 'launch') { const open = f >= 1180;
    A.push(KID(f, 'SK_KIDD', 24, YD(-0.4, -1.2), { expr: f < 1172 ? 'excited' : f < 1290 ? 'laugh' : 'shock', view: '34L', prop: 'blaster', blCol: 'blue', raise: open ? undefined : 1 }));
    A.push(KID(f, 'SK_KIDC', 23, YD(0.75, -0.8), { expr: f < 1186 ? 'excited' : 'laugh', view: '34R', prop: 'blaster', blCol: 'pink' }));
    A.push(P(f, 'SK_DAD90', 25, YD(-0.9, -2.3), { expr: f < 1196 ? 'smile' : 'shock', view: '34L', raise: f >= 1196 ? 1 : undefined }));
    A.push(DR(f, YD(0.45, 0.35), { expr: f < 1172 ? 'smile' : 'happy', pose: f < 1172 ? 'wave' : 'cheer' })); }
  if (k === 'sales') { A.push(KID(f, 'SK_KIDA', 21, YD(-0.9, -0.3), { expr: 'laugh', view: '34L', prop: 'blaster', blCol: 'lime' })); A.push(KID(f, 'SK_KIDB', 22, YD(0.9, -1.2), { expr: f < 1330 ? 'shock' : 'laugh', view: '34R', prop: 'blaster', blCol: 'orange' }));
    A.push(KID(f, 'SK_KIDC', 23, YD(0.5, -3.0), { expr: 'excited', view: '34R', prop: 'blaster', blCol: 'pink' })); A.push(P(f, 'SK_DAD90', 25, YD(-0.5, -2.5), { expr: f < 1340 ? 'smile' : 'laugh', view: '34L', raise: 1 }));
    A.push(KID(f, 'SK_KIDD', 24, YD(1.8, -0.1), { expr: 'laugh', view: '34R', prop: 'blaster', blCol: 'blue' })); A.push(DR(f, YD(0.2, 0.3), { expr: f < 1462 ? 'happy' : 'love', pose: 'cheer' })); }
  if (k === 'court') { A.push(P(f, 'SK_ARB', 31, CT(0.0, -2.45), { expr: f < 1654 ? 'thoughtful' : 'smile', view: 'front', prop: 'folder' }));
    A.push(P(f, 'SK_LJ13', 32, CT(-0.5, -0.85), { expr: f < 1587 ? 'determined' : f < 1654 ? 'thoughtful' : 'happy', view: '34L', raise: f > 1660 ? 1 : undefined }));
    A.push(P(f, 'SK_LAW', 33, CT(0.55, -1.0), { expr: f < 1654 ? 'determined' : 'excited', view: '34R', prop: 'folder' }));
    A.push(DR(f, CT(0.55, -1.25, 0.76), { expr: f < 1654 ? 'smile' : 'love', pose: f < 1654 ? 'stand' : 'cheer' }, { s: 0.07, blob: false })); }
  if (k === 'payoff') { const hit = f >= 1835;
    A.push(KID(f, 'SK_KIDA', 21, YD(-0.6, -0.6), { expr: f < 1829 ? 'sly' : 'laugh', view: '34L', prop: 'blaster', blCol: 'lime' }));
    A.push(KID(f, 'SK_KIDB', 26, YD(0.55, -1.1), { expr: hit ? (f < 1862 ? 'shock' : 'dazed') : 'whistle', view: '34R', raise: hit ? 1 : undefined }));
    A.push(P(f, 'SK_LJ13', 32, YD(-0.3, -2.9), { expr: f < 1835 ? 'smile' : 'laugh', view: '34L' }));
    A.push(DR(f, YD(0.3, 0.35), { expr: f < 1835 ? 'smile' : 'happy', pose: f < 1835 ? 'stand' : 'cheer' })); }
  return A;
}

// ---------- effects
const ASP = 1080 / 1920; let CURF = 0;
function SB(k, x, y, z) { const c = cam(k, CURF), n = (v) => { const l = Math.hypot(...v); return v.map((u) => u / l); }, fw = n([c.l[0] - c.p[0], c.l[1] - c.p[1], c.l[2] - c.p[2]]), r = n([-fw[2], 0, fw[0]]), u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]], t = Math.tan(c.fov * Math.PI / 360);
  return [0, 1, 2].map((i) => c.p[i] + fw[i] * z + r[i] * x * t * ASP * z + u[i] * y * t * z); }
const SWD = (k, w, z) => 2 * w * z * Math.tan(cam(k, CURF).fov * Math.PI / 360) * ASP;
const board = (f, f0, lines, pos, size, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'board', lines, pos, size: size * back(f0, f0 + 12, f) }); };
const sboard = (f, f0, lines, k, x, y, z, w, F2, f1) => board(f, f0, lines, SB(k, x, y, z), SWD(k, w, z), F2, f1);
const sburst = (f, f0, k, x, y, z, w, F2, col = '#fff3b0', n = 12) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'burst', t: (f - f0) / n, pos: SB(k, x, y, z * 1.1), size: SWD(k, w, z * 1.1), col, rays: 10 }); };
const stars = (f, f0, k, x, y, z, w, F2, per = 30) => { if (f >= f0) F2.push({ fx: 'stars', t: ((f - f0) / per) % 1, pos: SB(k, x, y, z), size: SWD(k, w, z) * back(f0, f0 + 10, f) }); };
const stamp = (f, f0, lines, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) { const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos: SB(k, x, y, z), size: SWD(k, w, z) * (1.6 - 0.6 * t * t), op: Math.min(1, t * 2) }); } };
const bubble = (f, f0, lines, k, x, y, z, w, tail, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'bubble', lines, tail, pos: SB(k, x, y, z), size: SWD(k, w, z) * back(f0, f0 + 8, f) }); };
const splash = (f, f0, pos, size, F2, n = 16) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'splash', t: (f - f0) / n, pos, size }); };
const bulb = (f, f0, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'bulb', t: ((f - f0) / 20) % 1, pos: SB(k, x, y, z), size: SWD(k, w, z) * back(f0, f0 + 8, f) }); };
const counter = (f, f0, f1, to, pre, post) => { const n = Math.round(to * sm(f0, f1, f)); return [pre + n + post]; };
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { splash(f, 28, YD(0.62, -1.36, 0.95), 0.8, F2); for (let i = 0; i < 4; i++) splash(f, 44 + i * 18, YD(0.62, -1.36, 0.92), 0.55, F2, 14); splash(f, 134, YD(0.62, -1.36, 1.0), 0.7, F2);
    sboard(f, 22, ['THE GREATEST', 'WATER GUN EVER'], 'hook', 0.0, 0.66, 3, 0.52, F2, 90); sboard(f, 92, ['INVENTED BY A', 'NASA ENGINEER'], 'hook', 0.0, 0.66, 3, 0.52, F2, 140); stamp(f, 143, ['BY ACCIDENT!'], 'hook', 0.0, 0.64, 3, 0.48, F2); sburst(f, 144, 'hook', 0.0, 0.64, 3, 0.55, F2); }
  if (k === 'who') { sboard(f, 180, ['LONNIE', 'JOHNSON'], 'who', 0.0, 0.66, 3, 0.4, F2, 204); sboard(f, 205, ['NUCLEAR', 'ENGINEER'], 'who', 0.0, 0.66, 3, 0.42, F2, 246); sboard(f, 248, ['U.S. AIR FORCE'], 'who', 0.0, 0.7, 3, 0.48, F2, 278); sboard(f, 279, ['NASA JET', 'PROPULSION LAB'], 'who', 0.0, 0.66, 3, 0.5, F2); }
  if (k === 'space') { sboard(f, 334, ['NUCLEAR POWER'], 'space', 0.0, 0.7, 3, 0.48, F2, 348); sboard(f, 349, ['GALILEO', '→ JUPITER'], 'space', 0.0, 0.66, 3, 0.44, F2, 410); sboard(f, 417, ['CASSINI', '→ SATURN'], 'space', 0.0, 0.66, 3, 0.44, F2); stars(f, 380, 'space', 0.0, 0.3, 3, 0.5, F2, 24); }
  if (k === 'pump') { sboard(f, 471, ['1982'], 'pump', 0.0, 0.7, 3, 0.3, F2, 504); sboard(f, 505, ['AT HOME'], 'pump', 0.0, 0.7, 3, 0.34, F2, 538); sboard(f, 540, ['A HEAT PUMP'], 'pump', 0.0, 0.7, 3, 0.44, F2, 562); sboard(f, 563, ['PLAIN WATER...'], 'pump', 0.0, 0.7, 3, 0.48, F2, 597); stamp(f, 598, ['NOT FREON'], 'pump', 0.0, -0.55, 3, 0.44, F2); }
  if (k === 'blast') { sboard(f, 630, ['TEST NOZZLE'], 'blast', 0.0, 0.7, 0.8, 0.42, F2, 660); sboard(f, 661, ['BATHROOM SINK'], 'blast', 0.0, 0.7, 0.8, 0.46, F2, 684); stamp(f, 704, ['WHOOSH!'], 'blast', 0.0, 0.64, 3, 0.42, F2, 740); sboard(f, 745, ['ACROSS THE ROOM'], 'blast', 0.0, 0.7, 3, 0.5, F2);
    for (let i = 0; i < 6; i++) splash(f, 703 + i * 12, BA(1.7, -1.72, 0.55), 0.7, F2, 14); sburst(f, 762, 'blast', 0.0, -0.1, 3, 0.4, F2, '#bfe8ff'); }
  if (k === 'idea') { bulb(f, 806, 'idea', 0.5, 0.5, 1.5, 0.22, F2); bubble(f, 818, ['THIS WOULD', 'MAKE A GREAT', 'WATER GUN!'], 'idea', -0.1, 0.72, 1.5, 0.56, -1, F2); sburst(f, 831, 'idea', 0.5, 0.5, 1.5, 0.4, F2); }
  if (k === 'build') { sboard(f, 868, ['SO HE BUILT ONE'], 'build', 0.0, 0.7, 3, 0.5, F2, 897); sboard(f, 898, ['PVC PIPE'], 'build', 0.0, 0.7, 3, 0.36, F2, 929); sboard(f, 930, ['PLEXIGLAS'], 'build', 0.0, 0.7, 3, 0.38, F2, 963); sboard(f, 964, ['SODA BOTTLE'], 'build', 0.0, 0.7, 3, 0.42, F2); sburst(f, 975, 'build', -0.1, 0.0, 3, 0.4, F2); }
  if (k === 'doubt') { sboard(f, 997, ['TOY COMPANIES:'], 'doubt', 0.0, 0.7, 3, 0.48, F2, 1020); stamp(f, 1021, ['NOT SO SURE'], 'doubt', 0.0, 0.64, 3, 0.46, F2, 1050); sboard(f, 1051, ['YEARS...'], 'doubt', 0.0, 0.72, 3, 0.36, F2); }
  if (k === 'launch') { sboard(f, 1102, ['YOU SEE...'], 'launch', 0.0, 0.7, 3, 0.36, F2, 1113); sboard(f, 1114, ['1990'], 'launch', 0.0, 0.7, 3, 0.3, F2, 1158); sboard(f, 1159, ['A TOY COMPANY', 'SAYS YES!'], 'launch', 0.0, 0.66, 3, 0.5, F2, 1170); stamp(f, 1171, ['IN STORES!'], 'launch', 0.0, 0.64, 3, 0.42, F2, 1224);
    sboard(f, 1225, ['ONE YEAR LATER...'], 'launch', 0.0, 0.7, 3, 0.5, F2, 1258); stamp(f, 1259, ['NEW NAME!'], 'launch', 0.0, 0.64, 3, 0.42, F2); sburst(f, 1278, 'launch', 0.0, 0.64, 3, 0.55, F2); stars(f, 1282, 'launch', 0.0, 0.3, 3, 0.5, F2, 24); splash(f, 1194, YD(-0.78, -2.25, 1.15), 0.8, F2); splash(f, 1296, YD(0.7, -0.86, 1.0), 0.7, F2); }
  if (k === 'sales') { sboard(f, 1315, ['REPORTEDLY...'], 'sales', 0.0, 0.72, 3, 0.4, F2, 1336); if (f > 1336) board(f, 1336, f < 1390 ? counter(f, 1338, 1362, 200, '$', ' MILLION') : ['$200 MILLION', 'IN 1991 ALONE'], SB('sales', 0.0, 0.66, 3), SWD('sales', 0.52, 3), F2, 1460);
    stamp(f, 1461, ['ONE OF THE BEST-', 'SELLING TOYS EVER'], 'sales', 0.0, 0.66, 3, 0.56, F2); stars(f, 1470, 'sales', 0.0, 0.3, 3, 0.55, F2, 24); for (let i = 0; i < 5; i++) splash(f, 1326 + i * 24, YD(i % 2 ? -0.4 : 0.82, i % 2 ? -2.45 : -1.2, 1.1), 0.7, F2, 14); }
  if (k === 'court') { sboard(f, 1545, ['ARBITRATION'], 'court', 0.0, 0.7, 3, 0.44, F2, 1584); sboard(f, 1585, ['UNPAID', 'ROYALTIES'], 'court', 0.0, 0.66, 3, 0.42, F2, 1621); sboard(f, 1622, ['2013'], 'court', 0.0, 0.72, 3, 0.3, F2, 1652);
    if (f > 1655) board(f, 1655, ['NEARLY', counter(f, 1660, 1688, 73, '$', ' MILLION')[0]], SB('court', 0.0, 0.66, 3), SWD('court', 0.5, 3), F2); stamp(f, 1690, ['HE WON!'], 'court', 0.0, 0.4, 3, 0.36, F2); sburst(f, 1688, 'court', 0.0, 0.66, 3, 0.55, F2, '#fff3b0'); stars(f, 1692, 'court', 0.0, 0.3, 3, 0.5, F2, 24); }
  if (k === 'payJ') { sboard(f, 1735, ['SENT A PROBE', 'TO JUPITER...'], 'payJ', 0.0, 0.64, 3, 0.5, F2); }
  if (k === 'payoff') { sboard(f, 1808, ['...IS BEST', 'KNOWN FOR'], 'payoff', 0.0, 0.66, 3, 0.42, F2, 1830); splash(f, 1835, YD(0.5, -1.08, 1.0), 0.9, F2); for (let i = 0; i < 4; i++) splash(f, 1851 + i * 14, YD(0.5, -1.08, 0.95), 0.6, F2, 14);
    stamp(f, 1840, ['SOAKING YOUR', 'LITTLE BROTHER'], 'payoff', 0.0, 0.64, 3, 0.56, F2); stars(f, 1862, 'payoff', 0.22, 0.02, 3, 0.4, F2, 24); }
  return F2;
}
