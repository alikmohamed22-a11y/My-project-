// [NG-story] "The first person over Niagara Falls in a barrel" timeline (57.54 s voice, 1727 f @ 30 fps).
// Sets: ng_sets.js (falls / home / shop / street) through setAt. Pattern: story_lambo.js (slow push per shot, zoom-through whips on
// cuts, screen-pinned boards / bursts / stamps, punch-ins on beats). The motif is the oak-and-iron barrel: sketched on the poster,
// built in the cooperage, sent over with the test cat, carries Annie over the crest, hauled out alive, wheeled off by the manager,
// and the payoff returns to the falls at golden hour. The test-run cat (ginger CAT card) is the sidekick from the test run on.
import * as S from './story.js';
import { FALLS } from './ng_sets.js';
import { NG_CATFUR } from './ng_cast.js';
const { sm, eo, back, add3, dist, q, person, runner } = S;

// [f0, f1, id, set]                                   narration (word frames from work/words_frames.txt)
const SH = [
  [0, 151, 'hook', 'fallsCrest'],      // The first person to go over Niagara Falls in a barrel was a sixty-three-year-old schoolteacher. (barrel 71, sixty 91, school 118)
  [151, 253, 'widow', 'home'],         // You see, Annie Edson Taylor was a widow, and she needed money.  (Annie 170, widow 204, money 236)
  [253, 379, 'plan', 'homePlan'],      // Her plan? Get famous by riding over the Horseshoe Falls. In a barrel!  (famous 277, Horseshoe 321, barrel 363)
  [379, 531, 'build', 'shop'],         // She had one built of oak and iron, with an anvil in the bottom, and her lucky pillow inside.  (oak 408, anvil 445, pillow 495)
  [531, 599, 'test', 'fallsGorge'],    // But first, a test run. A cat went over,  (test 554, cat 576, over 587)
  [599, 646, 'cat', 'fallsGorge'],     // and the cat survived!  (survived 614)
  [646, 779, 'dock', 'fallsDock'],     // So on October 24th, 1901, her birthday, Annie climbed in.  (October 660, 1901 695, birthday 726, climbed 750)
  [779, 862, 'pump', 'fallsDock'],     // Friends pumped in air with a bicycle pump, and let her go!  (pump 825, let 844)
  [862, 977, 'edge', 'fallsDay'],      // The barrel tipped over the edge, and vanished into the mist.  (tipped 880, edge 903, vanished 922, mist 949)
  [977, 1155, 'rescue', 'fallsGorge'], // About twenty minutes later, they hauled it to shore and opened it up. Annie was alive! Just a small cut on her head.  (hauled 1015, opened 1046, alive 1083, cut 1122)
  [1155, 1263, 'verdict', 'fallsGorge'], // Her verdict, reportedly: No one ought ever do that again.  (reportedly 1175, No 1197, again 1238)
  [1263, 1356, 'twist', 'street'],     // Here's the twist. She'd been telling people she was in her forties.  (twist 1272, forties 1335)
  [1356, 1455, 'manager', 'street'],   // And the fortune? Her manager reportedly ran off with the barrel.  (fortune 1362, manager 1382, ran 1412, barrel 1437)
  [1455, 1520, 'poor', 'streetDusk'],  // Years later, she died poor.  (died 1484, poor 1490)
  [1520, 1727, 'payoff', 'fallsGold'], // But she got her fame, the first person over Niagara in a barrel. And the first to say, don't.  (fame 1542, first 1559, Niagara 1585, first 1642, don't 1668)
];
export const NF = 1727;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['ng', segAt(f)[3]];

// ---------- places (set-local -> world)
const O = { falls: [-94000, 0, 0], home: [-96500, 0, 0], shop: [-96500, 0, 800], street: [-96500, 0, 1600] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const FA = at(O.falls), HMa = at(O.home), SHa = at(O.shop), STa = at(O.street);
const { R, D, LH, OFF, DOCK } = FALLS, [DX, DZ] = DOCK;
const LG = -D + 1.0; // rescue ledge top
// barrel over the crest at angle A0: approach (u 0..1) then fall (s 0..1)
const A0 = 0.62, A1 = 0.3;
const rim = (a) => [R * Math.sin(a), -R * Math.cos(a)], outv = (a) => [Math.sin(a), -Math.cos(a)];
function overPath(a, u, s, f) { const [rx, rz] = rim(a), [ox, oz] = outv(a);
  if (s <= 0) { const L = 14 * (1 - u); return { p: [rx + ox * L, -0.74 + 0.05 * Math.sin(f * 0.21), rz + oz * L], r: [0.06 * Math.sin(f * 0.17) - 0.25 * sm(0.85, 1, u), 0.3 + f * 0.004, 0.05 * Math.sin(f * 0.13)] }; }
  const d = OFF * Math.sqrt(s) + 0.9, y = -0.74 - (D + 0.4) * s ** 1.15; return { p: [rx - ox * d, y, rz - oz * d], r: [-0.25 - 3.4 * s, 0.3, 1.6 * s] }; }

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const [h0x, h0z] = rim(A0), [o0x, o0z] = outv(A0), [h1x, h1z] = rim(A1), [o1x, o1z] = outv(A1), [t0x, t0z] = [Math.cos(A0), Math.sin(A0)];
const V = {
  hook: C(FA(h0x + o0x * 7 + 5.9, 2.7, h0z + o0z * 7 - 0.86), FA(-25.8, -13, -30.6), 46, 1.4, FA(h0x + o0x * 6, -0.2, h0z + o0z * 6)),
  widow: C(HMa(0.6, 1.55, 3.6), HMa(-0.5, 1.4, -1.6), 46, 1.2, HMa(-0.6, 1.3, -1.6)),
  plan: C(HMa(2.2, 1.65, 2.6), HMa(2.6, 1.55, -3.2), 44, 1.6, HMa(3.0, 1.8, -3.1)),
  build: C(SHa(0.6, 2.2, 4.3), SHa(0, 1.0, -0.6), 50, 1.4, SHa(0, 0.9, -0.6)),
  test: C(FA(4, -D + 4, 46), FA(h1x - o1x * 2, -3, h1z - o1z * 2), 26, 0.15, FA(h1x, -4, h1z)),
  cat: C(FA(R - 5.2, LG + 1.1, 19.8), FA(R - 3.5, LG + 0.5, 15.9), 44, 2.2, FA(R - 3.4, LG + 0.4, 16.2)),
  dock: C(FA(DX + 0.5, 2.3, DZ - 8), FA(DX - 4.6, 1.3, DZ + 0.2), 46, 1.2, FA(DX - 4.4, 1.2, DZ)),
  pump: C(FA(DX - 13.5, 1.5, DZ + 6.5), FA(DX - 9.0, 0.5, DZ + 1.0), 46, 1.4, FA(DX - 9.4, 0.4, DZ + 1.6)),
  edge: C(FA(h0x - o0x * 17 + t0x * 7, 3.0, h0z - o0z * 17 + t0z * 7), FA(h0x - o0x * 1.5, -4.5, h0z - o0z * 1.5), 48, 1.0, FA(h0x, -1, h0z)),
  rescue: C(FA(R - 1.4, LG + 1.9, 23), FA(R - 5.2, LG + 0.6, 14), 46, 1.4, FA(R - 3.6, LG + 0.6, 16)),
  verdict: C(FA(R - 3.0, LG + 1.55, 19.0), FA(R - 3.5, LG + 1.35, 15.6), 40, 2.6, FA(R - 3.5, LG + 1.3, 16.2)),
  twist: C(STa(-2.0, 1.6, 4.6), STa(-5.4, 1.35, -2.6), 44, 1.4, STa(-5.2, 1.2, -2.4)),
  manager: C(STa(-2.4, 1.5, 6.6), STa(-2.6, 1.15, -1.6), 50, 1.2, STa(-3, 1.1, -1.0)),
  poor: C(STa(-3.8, 1.5, 3.4), STa(-6.0, 1.3, -3.2), 42, 1.6, STa(-6.0, 1.2, -3.0)),
  payoff: C(FA(R + 5.0, LH + 1.45, 13.2), FA(R - 12, -3, -16), 46, 0.8, FA(R + 2.3, LH + 1.0, 8.6)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.12, widow: 0.1, plan: 0.22, build: 0.08, test: 0.02, cat: 0.1, dock: 0.08, pump: 0.08, edge: 0.04, rescue: 0.1, verdict: 0.1, twist: 0.1, manager: 0.04, poor: 0.12, payoff: 0 };
const base = (k) => V[k] || V.hook;
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const look = (d, f0, f1, fd) => { const t = sm(f0, f1, f); c = { ...c, l: add3(c.l, d.map((x) => x * t)), fp: add3(c.fp, (fd || d).map((x) => x * t)) }; };
  if (k === 'hook') { const b = barrelAt(f), m = overPath(A0, 0.5, 0, 0), d = [b.p[0] - m.p[0], 0, b.p[2] - m.p[2]]; c = { ...c, p: add3(c.p, d), l: add3(c.l, d), fp: add3(c.fp, d) }; punch(91, 98, 0.1); kick(91, 0.05); punch(118, 124, 0.08); }
  if (k === 'widow') { punch(204, 210, 0.06); look([0.6, -0.1, 0.2], 226, 240, [0.7, 0, 0.3]); punch(236, 242, 0.08); }
  if (k === 'plan') { punch(277, 283, 0.06); punch(363, 369, 0.12); kick(363, 0.03); }
  if (k === 'build') { punch(445, 451, 0.08); kick(445, 0.05); shake(446, 458, 0.03); punch(495, 501, 0.06); }
  if (k === 'test') { const b = overPath(A1, 1, sm(585, 599, f) ** 1.2, f); const bp = FA(...b.p); const t = sm(583, 597, f); c = { ...c, l: c.l.map((v, i) => v + (add3(bp, [0, 0.4, 0])[i] - v) * t), fp: c.fp.map((v, i) => v + (bp[i] - v) * t) }; punch(576, 582, 0.06); }
  if (k === 'cat') { punch(614, 620, 0.1); kick(614, 0.04); }
  if (k === 'dock') { punch(669, 675, 0.05); punch(726, 732, 0.08); look([0, -0.3, 0], 744, 770); }
  if (k === 'pump') { punch(825, 831, 0.06); look([0.6, 0, 2.2], 844, 862, [0.8, 0, 3]); }
  if (k === 'edge') { const b = barrelAt(f), bp = FA(...b.p), t = sm(880, 904, f); c = { ...c, l: c.l.map((v, i) => v + (add3(bp, [0, -1.5, 0])[i] - v) * t), fp: c.fp.map((v, i) => v + (bp[i] - v) * t) };
    const t2 = sm(906, 935, f); c = { ...c, fov: c.fov * (1 + 0.12 * t2) }; shake(949, 966, 0.25); }
  if (k === 'rescue') { look([0.4, 0, 0.4], 1040, 1070); punch(1083, 1089, 0.1); kick(1083, 0.04); punch(1122, 1128, 0.1); }
  if (k === 'verdict') { punch(1197, 1203, 0.08); punch(1238, 1244, 0.06); }
  if (k === 'twist') { punch(1272, 1278, 0.06); punch(1335, 1341, 0.1); kick(1335, 0.03); }
  if (k === 'manager') { const t = sm(1410, 1452, f); c = { ...c, l: add3(c.l, [5 * t, 0, 0]), fp: add3(c.fp, [6 * t, 0, 0]), p: add3(c.p, [2.5 * t, 0, 0]) }; punch(1412, 1418, 0.06); }
  if (k === 'poor') { punch(1490, 1500, 0.05); }
  if (k === 'payoff') { const t = sm(1676, 1727, f); const P0 = c.p, P1 = FA(R + 12, LH + 9, 30); c = { ...c, p: P0.map((v, i) => v + (P1[i] - v) * t), l: add3(c.l, [0, 2 * t, -6 * t]), fov: 46 + 4 * t, cInf: 0.8 - 0.3 * t };
    c = push(c, 0.08, 1520, 1676, f); punch(1559, 1565, 0.05); punch(1668, 1674, 0.1); kick(1668, 0.04); }
  return c;
}
const HARD = new Set([646, 1263]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[91, 0.3, 6], [151, 0.5, 10], [253, 0.3, 8], [363, 0.3, 6], [379, 0.4, 10], [445, 0.3, 6], [531, 0.5, 10], [614, 0.3, 6], [646, 0.75, 12], [779, 0.25, 8], [862, 0.3, 8], [949, 0.35, 10], [977, 0.45, 10], [1083, 0.35, 6], [1155, 0.25, 8], [1263, 0.75, 12], [1272, 0.5, 6], [1335, 0.3, 6], [1356, 0.25, 8], [1412, 0.3, 6], [1455, 0.45, 12], [1520, 0.6, 12], [1668, 0.35, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- the falls barrel through the story (set-local)
function barrelAt(f) { const k = segAt(f)[2];
  if (k === 'hook') { const u = 0.35 + 0.35 * sm(0, 151, f); const b = overPath(A0, u, 0, f); return { ...b, lid: back(110, 122, f) * 0.85 }; }
  if (k === 'test') { const u = 0.55 + 0.45 * sm(531, 586, f), s = sm(585, 599, f) ** 1.2; return { ...overPath(A1, u, s, f), lid: 0, s: 1.7 }; }
  if (k === 'cat') return { p: [R - 4.4, LG + 0.44, 15.0], r: [Math.PI / 2 - 0.05, 1.1, 0], lid: f < 606 ? 0 : back(606, 616, f) * 0.9 };
  if (k === 'dock') return { p: [DX - 5, 0.78, DZ], r: [0, 0.4, 0], lid: f < 770 ? 1 : 1 - eo(770, 778, f) };
  if (k === 'pump') { const t = sm(846, 862, f); return { p: [DX - 9.2 - 3.2 * t, -0.74 + 0.05 * Math.sin(f * 0.21), DZ + 2.0 + 5.5 * t], r: [0.05 * Math.sin(f * 0.17), 0.4 + 0.3 * t, 0.05 * Math.sin(f * 0.13)], lid: 0 }; }
  if (k === 'edge') { const u = 0.55 + 0.45 * sm(862, 893, f), s = sm(892, 936, f) ** 1.15; const b = overPath(A0, u, s, f); return { ...b, lid: 0, on: f < 944 }; }
  if (k === 'rescue') { const t = sm(1010, 1044, f); return { p: [R - 3.6 - 3.4 * (1 - t), (1 - t) * (-D - 0.7 + 0.05 * Math.sin(f * 0.2)) + t * LG, 16.0], r: [0.05 * (1 - t) * Math.sin(f * 0.2), 0.5, 0], lid: f < 1046 ? 0 : back(1046, 1060, f) * 0.95, fix: 1, t }; }
  if (k === 'verdict') return { p: [R - 3.6, LG, 15.4], r: [0, 0.5, 0], lid: 0.95 };
  return { on: false };
}

// ---------- world state
export function worldAt(f, w) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const N = w.ng; if (!N) return;
  N.setBarrel(barrelAt(f));
  N.setBuild(k === 'build' ? sm(382, 440, f) : 1);
  N.setAnvil(k === 'build' ? sm(436, 462, f) : 1);
  N.setPillow(k === 'build' ? (f < 492 ? 0 : sm(492, 512, f) + 0.0001) : 1);
  const t = sm(1408, 1452, f);
  N.setCart(k === 'manager' ? -1.2 + 16 * t * t : k === 'twist' ? -1.2 : 30);
  const fl = (f0) => (f >= f0 && f < f0 + 4 ? 1 - (f - f0) / 4 : 0);
  N.setFlash(k === 'twist' ? Math.max(fl(1272), fl(1301), fl(1335)) : 0);
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const CAT = (f, pos, opts = {}, extra = {}) => person(f, 'CAT', 9, pos, { t: f, ...NG_CATFUR, pose: 'sit', ...opts }, { s: 0.62, ...extra });
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
const FAL = (x, z, y = LH) => FA(x, y, z);
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  const b = barrelAt(f), bp = b.p ? FA(...b.p) : null;
  if (k === 'hook') { if (f >= 112) { const up = back(114, 126, f); A.push(P(f, 'NG_ANNIE', 1, add3(bp, [0, -0.2 + 0.42 * up, 0]), { expr: f < 130 ? 'surprised' : 'determined', view: '34R', wave: f > 128 ? wav(f, 0, 0.3) : undefined }, { blob: false })); } }
  if (k === 'widow') { A.push(P(f, 'NG_ANNIEH', 1, HMa(-0.4 + 0.5 * sm(222, 238, f), 0, -1.7 + 0.4 * sm(222, 238, f)), { expr: f < 204 ? 'smile' : f < 231 ? 'sad' : 'worried', prop: f < 222 ? 'chalk' : 'purse', view: f < 200 ? '34L' : '34R', point: f < 198 ? 1 : undefined }));
    A.push(P(f, 'NG_BOY', 31, HMa(-2.3, 0, 1.0), { expr: f < 204 ? 'smile' : 'sad', mode: 'sit', view: 'back' }, { s: 0.85, blob: false })); }
  if (k === 'plan') { A.push(P(f, 'NG_ANNIEH', 1, HMa(2.1, 0, -1.5), { expr: f < 277 ? 'thoughtful' : f < 363 ? 'excited' : 'determined', view: '34R', point: f > 268 ? 1 : undefined })); }
  if (k === 'build') { A.push(P(f, 'NG_COOPER', 21, SHa(-1.0, 0, -1.0), { expr: f < 445 ? 'happy' : f < 460 ? 'shock' : 'smile', prop: 'mallet', view: '34R' }));
    A.push(P(f, 'NG_ANNIE', 1, SHa(0.95, 0, 0.1), { expr: f < 445 ? 'smile' : f < 495 ? 'determined' : 'love', view: '34L', point: f > 400 && f < 440 ? 1 : undefined })); }
  if (k === 'test') { if (f < 588) { const pk = 1 - sm(580, 588, f); A.push(CAT(f, add3(bp, [0, 0.86 + 0.3 * pk - 0.3, 0]), { expr: f < 572 ? 'bored' : 'surprised', pose: 'stare' }, { blob: false, s: 0.62 * Math.max(0.001, pk) })); } }
  if (k === 'cat') { const up = back(608, 618, f); A.push(CAT(f, FA(R - 3.3, LG + 0.02, 15.9 + 0.3 * up), { expr: f < 614 ? 'surprised' : 'happy', pose: f < 616 ? 'startled' : 'sit', flip: true }, { s: 0.62 * up + 0.001 })); }
  if (k === 'dock') { const climb = sm(746, 776, f), hop = Math.sin(Math.PI * sm(746, 760, f)) * 0.5;
    const ap = climb <= 0 ? FA(DX - 3.5, 0.78, DZ - 0.9) : add3(FA(DX - 3.5, 0.78, DZ - 0.9).map((v, i) => v + (add3(bp, [0, 0.1, 0])[i] - v) * Math.min(1, climb * 1.6)), [0, hop - 0.9 * sm(760, 776, f), 0]);
    A.push(P(f, 'NG_ANNIE', 1, ap, { expr: f < 723 ? 'determined' : f < 744 ? 'happy' : 'determined', view: '34L', wave: f > 726 && f < 744 ? wav(f, 0) : undefined }, { blob: climb < 0.3 }));
    A.push(P(f, 'NG_HELP1', 11, FA(DX - 4.4, 0.78, DZ + 1.6), { expr: f < 726 ? 'smile' : 'grin', view: '34R', cheer: f > 726 && f < 746 ? wav(f, 1) : undefined }));
    A.push(P(f, 'NG_HELP2', 12, FA(DX - 6.4, 0.78, DZ + 1.2), { expr: 'nervous', view: '34R' }));
    [['NG_GENT', 41, DX + 2.5, DZ - 2.5], ['NG_LADY', 42, DX + 3.4, DZ - 1.0], ['NG_BOY', 43, DX + 2.2, DZ + 0.4], ['NG_LADY2', 44, DX + 3.6, DZ + 1.8]].forEach(([o, sd, x, z], i) =>
      A.push(P(f, o, sd, FA(x, LH, z), { expr: f > 726 ? (i % 2 ? 'laugh' : 'happy') : 'surprised', view: '34L', wave: f > 726 && i % 2 === 0 ? wav(f, i) : undefined }, { s: o === 'NG_BOY' ? 0.85 : 1 }))); }
  if (k === 'pump') { A.push(P(f, 'NG_HELP1', 11, FA(DX - 9.3, 0.78, DZ + 0.8), { expr: f < 844 ? 'determined' : 'grin', prop: f < 844 ? 'pump' : undefined, view: '34R', wave: f > 848 ? wav(f, 0) : undefined }, { roll: f < 840 ? 0.04 * Math.sin(f * 0.8) : 0 }));
    A.push(P(f, 'NG_HELP2', 12, FA(DX - 7.2, 0.78, DZ + 0.2), { expr: f < 844 ? 'nervous' : 'shock', view: '34R' })); }
  if (k === 'edge') { [['NG_GENT', 51, R + 1.7, 4.4], ['NG_LADY', 52, R + 2.5, 3.0], ['NG_REP', 53, R + 1.6, 1.6]].forEach(([o, sd, x, z], i) => A.push(P(f, o, sd, FAL(x, z), { expr: f < 880 ? 'surprised' : f < 949 ? 'shock' : 'worried', view: '34L', point: i === 2 && f > 884 ? 1 : undefined, prop: o === 'NG_REP' ? 'notepad' : undefined }))); }
  if (k === 'rescue') { const t = sm(1010, 1044, f), up = sm(1062, 1080, f);
    A.push(P(f, 'NG_HELP1', 11, FA(R - 2.0, LG, 17.4 - 0.4 * t), { expr: f < 1044 ? 'determined' : f < 1083 ? 'surprised' : 'laugh', prop: f < 1046 ? 'rope' : undefined, view: '34L', cheer: f > 1086 ? wav(f, 0) : undefined }, { roll: f < 1044 ? -0.08 : 0 }));
    A.push(P(f, 'NG_HELP2', 12, FA(R - 5.6, LG, 14.6), { expr: f < 1083 ? 'nervous' : 'happy', view: '34L', cheer: f > 1090 ? wav(f, 1) : undefined }));
    if (f >= 1060) A.push(P(f, 'NG_ANNIEB', 1, add3(bp, [0, -0.25 + 0.55 * up, 0]), { expr: f < 1083 ? 'dazed' : f < 1104 ? 'happy' : 'relieved', view: '34R', wave: f > 1090 && f < 1120 ? wav(f, 2) : undefined }, { blob: false }));
    if (f >= 1086) A.push(CAT(f, FA(R - 4.6, LG + 0.02, 17.2), { expr: 'happy', flip: false }, { s: 0.62 * back(1086, 1096, f) + 0.001 })); }
  if (k === 'verdict') { A.push(P(f, 'NG_ANNIEB', 1, FA(R - 3.5, LG + 0.15, 16.0), { expr: f < 1197 ? 'dazed' : f < 1238 ? 'angry' : 'determined', view: 'front', point: f > 1197 ? 1 : undefined }));
    A.push(CAT(f, FA(R - 4.6, LG + 0.02, 16.6), { expr: f < 1197 ? 'bored' : 'surprised' })); }
  if (k === 'twist') { A.push(P(f, 'NG_ANNIE', 1, STa(-6.0, 0.18, -2.7), { expr: f < 1301 ? 'smile' : f < 1335 ? 'sly' : 'nervous', view: '34R', hip: f < 1335 ? 1 : undefined }));
    A.push(P(f, 'NG_REP', 61, STa(-4.1, 0.18, -1.5), { expr: f < 1335 ? 'smile' : 'shock', prop: 'notepad', view: '34L' }));
    A.push(P(f, 'NG_PHOTO', 62, STa(-2.6, 0.18, -0.4), { expr: 'smile', prop: 'flashcam', view: '34L', flash: (f >= 1272 && f < 1276) || (f >= 1301 && f < 1305) || (f >= 1335 && f < 1339) ? 1 : undefined }));
    A.push(P(f, 'NG_GENT', 63, STa(-8.2, 0.18, -1.8), { expr: f < 1335 ? 'smile' : 'surprised', view: '34R' })); }
  if (k === 'manager') { const t = sm(1408, 1452, f), cx = -1.2 + 16 * t * t;
    A.push(P(f, 'NG_RUSS', 71, STa(cx - 2.0, 0.18, -1.0), { expr: f < 1394 ? 'smug' : 'sly', view: '34R' }));
    A.push(P(f, 'NG_ANNIE', 1, STa(-4.6, 0.18, -1.9), { expr: f < 1412 ? 'smile' : 'shock', view: '34R', point: f > 1420 ? 1 : undefined }));
    A.push(P(f, 'NG_REP', 61, STa(-5.6, 0.18, -2.6), { expr: f < 1412 ? 'smile' : 'shock', prop: 'notepad', view: '34R' })); }
  if (k === 'poor') { A.push(P(f, 'NG_ANNIEG', 1, STa(-6.0, 0.18, -3.0), { expr: f < 1484 ? 'thoughtful' : 'sad', prop: 'purse', view: '34R' })); }
  if (k === 'payoff') { A.push(P(f, 'NG_ANNIEG', 1, FAL(R + 2.3, 8.6), { expr: f < 1559 ? 'smile' : f < 1642 ? 'proud' : f < 1668 ? 'determined' : 'laugh', view: '34L', point: f >= 1660 && f < 1700 ? 1 : undefined, hip: f >= 1559 && f < 1640 ? 1 : undefined }));
    A.push(CAT(f, FAL(R + 0.7, 7.4, LH + 0.7), { expr: f < 1668 ? 'smug' : 'happy' }, { blob: false })); }
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
const qmark = (f, f0, k, x, y, z, w, F2) => { if (f >= f0) F2.push({ fx: 'qmark', pos: SB(k, x, y, z), size: SWD(k, w, z) * back(f0, f0 + 8, f) }); };
const stamp = (f, f0, lines, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) { const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos: SB(k, x, y, z), size: SWD(k, w, z) * (1.6 - 0.6 * t * t), op: Math.min(1, t * 2) }); } };
const bubble = (f, f0, lines, k, x, y, z, w, tail, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'bubble', lines, tail, pos: SB(k, x, y, z), size: SWD(k, w, z) * back(f0, f0 + 8, f) }); };
const wpuff = (f, f0, pos, size, F2, n = 16, tint) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'puff', t: (f - f0) / n, pos, size, tint }); };
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { sboard(f, 2, ['FIRST PERSON OVER', 'NIAGARA IN A BARREL'], 'hook', 0.0, 0.66, 3, 0.56, F2, 88); stamp(f, 91, ['AGE 63'], 'hook', 0.0, 0.62, 3, 0.36, F2, 117); sburst(f, 91, 'hook', 0.0, 0.62, 3, 0.5, F2); sboard(f, 118, ['A SCHOOL-', 'TEACHER!'], 'hook', 0.0, 0.66, 3, 0.44, F2); }
  if (k === 'widow') { sboard(f, 166, ['ANNIE EDSON', 'TAYLOR'], 'widow', 0.0, 0.66, 3, 0.46, F2, 228); sboard(f, 230, ['A WIDOW WHO', 'NEEDED MONEY'], 'widow', 0.0, 0.66, 3, 0.5, F2); qmark(f, 238, 'widow', 0.3, 0.2, 3, 0.1, F2); }
  if (k === 'plan') { sboard(f, 256, ['HER PLAN?'], 'plan', 0.0, 0.68, 2.4, 0.36, F2, 274); sboard(f, 276, ['GET FAMOUS...'], 'plan', 0.0, 0.68, 2.4, 0.42, F2, 318); stars(f, 280, 'plan', 0.0, 0.42, 2.4, 0.5, F2, 26);
    sboard(f, 320, ['...OVER THE', 'HORSESHOE FALLS'], 'plan', 0.0, 0.66, 2.4, 0.5, F2, 360); stamp(f, 363, ['IN A BARREL!'], 'plan', 0.0, 0.62, 2.4, 0.46, F2); sburst(f, 363, 'plan', 0.0, 0.3, 2.4, 0.5, F2); }
  if (k === 'build') { sboard(f, 398, ['OAK + IRON'], 'build', 0.0, 0.68, 3, 0.4, F2, 442); stamp(f, 445, ['ANVIL', 'BALLAST'], 'build', 0.0, 0.62, 3, 0.4, F2, 490); sburst(f, 445, 'build', 0.0, -0.2, 3, 0.5, F2, '#fff3b0', 12); wpuff(f, 452, SHa(0, 1.5, -0.6), 1.6, F2, 18, '#c8b090');
    sboard(f, 493, ['+ HER LUCKY', 'PILLOW'], 'build', 0.0, 0.66, 3, 0.44, F2); }
  if (k === 'test') { sboard(f, 533, ['BUT FIRST:', 'A TEST RUN'], 'test', 0.0, 0.66, 3, 0.46, F2, 574); sboard(f, 576, ['A CAT', 'WENT OVER'], 'test', 0.0, 0.66, 3, 0.4, F2); }
  if (k === 'cat') { stamp(f, 614, ['IT SURVIVED!'], 'cat', 0.0, 0.62, 1.5, 0.48, F2); sburst(f, 614, 'cat', 0.0, 0.0, 1.5, 0.55, F2); stars(f, 620, 'cat', 0.0, 0.1, 1.5, 0.4, F2, 24); }
  if (k === 'dock') { sboard(f, 652, ['OCT. 24, 1901'], 'dock', 0.0, 0.68, 3, 0.48, F2, 722); sboard(f, 724, ['HER 63RD', 'BIRTHDAY!'], 'dock', 0.0, 0.66, 3, 0.44, F2); stars(f, 728, 'dock', 0.0, 0.3, 3, 0.55, F2, 24); }
  if (k === 'pump') { sboard(f, 781, ['AIR FROM A', 'BICYCLE PUMP'], 'pump', 0.0, 0.66, 3, 0.48, F2, 842); sboard(f, 846, ['LET GO!'], 'pump', 0.0, 0.68, 3, 0.36, F2); }
  if (k === 'edge') { sboard(f, 864, ['HORSESHOE FALLS'], 'edge', 0.0, 0.7, 3, 0.48, F2, 900); stamp(f, 950, ['GONE!'], 'edge', 0.0, 0.6, 3, 0.34, F2); }
  if (k === 'rescue') { sboard(f, 979, ['~20 MINUTES', 'LATER...'], 'rescue', 0.0, 0.66, 3, 0.44, F2, 1044); stamp(f, 1083, ['ALIVE!'], 'rescue', 0.0, 0.62, 3, 0.34, F2, 1118); sburst(f, 1083, 'rescue', 0.0, 0.2, 3, 0.55, F2);
    sboard(f, 1120, ['JUST A', 'SMALL CUT'], 'rescue', 0.0, 0.66, 3, 0.4, F2); for (const f0 of [1046, 1052]) wpuff(f, f0, FA(R - 3.6, LG + 1.6, 16), 1.4, F2, 14, '#e8f4ff'); }
  if (k === 'verdict') { sboard(f, 1158, ['HER VERDICT', '(REPORTEDLY):'], 'verdict', 0.0, 0.68, 2, 0.46, F2, 1195); bubble(f, 1197, ['NO ONE OUGHT', 'EVER DO THAT', 'AGAIN.'], 'verdict', 0.05, 0.5, 2, 0.6, -1, F2); }
  if (k === 'twist') { stamp(f, 1265, ['THE TWIST'], 'twist', 0.0, 0.62, 3, 0.4, F2, 1298); sboard(f, 1300, ['SHE TOLD PEOPLE:', '"I\'M IN MY 40s"'], 'twist', 0.0, 0.66, 3, 0.54, F2, 1333); stamp(f, 1335, ['SHE WAS 63!'], 'twist', 0.0, 0.62, 3, 0.46, F2); sburst(f, 1335, 'twist', 0.0, 0.62, 3, 0.5, F2); }
  if (k === 'manager') { sboard(f, 1358, ['AND THE', 'FORTUNE?'], 'manager', 0.0, 0.66, 3, 0.4, F2, 1380); sboard(f, 1382, ['HER MANAGER,', 'REPORTEDLY...'], 'manager', 0.0, 0.66, 3, 0.48, F2, 1410); stamp(f, 1412, ['RAN OFF WITH', 'THE BARREL!'], 'manager', 0.0, 0.62, 3, 0.5, F2); for (const f0 of [1414, 1424, 1434]) { const cx = -1.2 + 16 * sm(1408, 1452, f0) ** 2; wpuff(f, f0, STa(cx - 1.4, 0.4, -0.6), 1.2, F2, 16, '#c8a878'); } }
  if (k === 'poor') { sboard(f, 1457, ['YEARS LATER...'], 'poor', 0.0, 0.68, 3, 0.44, F2, 1484); sboard(f, 1486, ['SHE DIED POOR', '(1921)'], 'poor', 0.0, 0.66, 3, 0.46, F2); }
  if (k === 'payoff') { sboard(f, 1530, ['BUT SHE GOT', 'HER FAME'], 'payoff', 0.0, 0.66, 3, 0.44, F2, 1556); sboard(f, 1558, ['FIRST OVER NIAGARA', 'IN A BARREL'], 'payoff', 0.0, 0.66, 3, 0.56, F2, 1640);
    sboard(f, 1642, ['...AND FIRST', 'TO SAY:'], 'payoff', 0.0, 0.66, 3, 0.4, F2, 1666); stamp(f, 1668, ["DON'T!"], 'payoff', 0.0, 0.62, 3, 0.36, F2); sburst(f, 1668, 'payoff', 0.0, 0.62, 3, 0.5, F2); stars(f, 1676, 'payoff', 0.0, 0.3, 3, 0.55, F2, 24); }
  if (k === 'edge') { for (const f0 of [938, 944, 950]) wpuff(f, f0, FA(...overPath(A0, 1, 1, f0).p).map((v, i) => v + [0, 3, 0][i]), 9, F2, 22, '#ffffff'); }
  return F2;
}
