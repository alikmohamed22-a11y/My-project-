// [LN-story] "Abraham Lincoln is in the Wrestling Hall of Fame" timeline (64.0 s voice, 1920 f @ 30 fps).
// Sets: ln_sets.js (village in four moods / store / cabin / camp day+dusk / hall), driven through setAt. Pattern: story_hollywood.js
// (slow push per shot, zoom-through whips on cuts, screen-pinned boards / bursts / stamps, punch-ins on punchlines). TOPPER (a living
// stovepipe hat) is the sidekick. Young Lincoln is beardless; the bearded president / grey statue only appear for the honour beats.
import * as S from './story.js';
import { vf, cf } from './ln_sets.js';
const { sm, eo, back, add3, dist, q, person } = S;
const TAU = Math.PI * 2;

// [f0, f1, id, set]                                           narration (word frames from work/words_frames.txt)
const SH = [
  [0, 60, 'hook', 'hall'],             // Abraham Lincoln is in the Wrestling Hall of Fame.  (Hall 49)
  [60, 140, 'really', 'hall'],         // No, really.  (No 93)
  [140, 200, 'y1831', 'village'],      // 1831. New Salem, Illinois.  (1831 140, New 157)
  [200, 288, 'tall', 'village'],       // Lincoln is 22, six-foot-four,  (22 228, 6-4 255)
  [288, 344, 'store', 'store'],        // and clerking in a little general store.
  [344, 405, 'brag', 'store'],         // His boss brags that his lanky clerk  (brags 355)
  [405, 462, 'anybody', 'store'],      // can out-wrestle anybody.  (out-wrestle 409, anybody 426)
  [462, 503, 'badidea', 'store'],      // Bad idea.  (hard cut, music stop)
  [503, 610, 'gang', 'village'],       // The local gang, the Clary's Grove Boys, send their champion:  (Clary's 531)
  [610, 642, 'jack', 'village'],       // Jack Armstrong.
  [642, 701, 'crowd', 'villageGold'],  // The whole village crowds around.
  [701, 755, 'lock', 'villageGold'],   // They lock up in the dust.  (lock 704, dust 726)
  [755, 785, 'who', 'villageGold'],    // Who won?
  [785, 819, 'differ', 'villageGold'], // Accounts differ.
  [819, 849, 'win', 'villageGold'],    // Some say Lincoln.
  [849, 872, 'draw', 'villageGold'],   // Some say a draw.
  [872, 954, 'dirty', 'villageGold'],  // Some say Armstrong fought dirty.  (dirty 923)
  [954, 1065, 'friends', 'villageSun'], // But afterward, Armstrong became one of Lincoln's best friends.  (best 1023)
  [1065, 1178, 'buck', 'villageSun'],  // Lincoln reportedly told a crowd, "I'm the big buck of this lick."  (I'm 1113)
  [1178, 1256, 'legend', 'cabin'],     // Legend says he wrestled about 300 matches  (300 1218)
  [1256, 1338, 'once', 'cabin'],       // and lost only once.  (once 1299)
  [1338, 1414, 'y1832', 'camp'],       // In 1832, during the Black Hawk War,  (1832 1341, Black Hawk 1383)
  [1414, 1490, 'threw', 'camp'],       // a soldier named Thompson threw him.  (Thompson 1432, threw 1447: music stop)
  [1490, 1577, 'pres', 'villageDawn'], // Lincoln went on to become the 16th president.  (16th 1526)
  [1577, 1660, 'y1992', 'hall'],       // In 1992, the National Wrestling Hall of Fame  (1992 1580, National 1618)
  [1660, 1743, 'honor', 'hall'],       // honored him as an Outstanding American.  (Outstanding 1688)
  [1743, 1805, 'beat', 'campDusk'],    // And the only man who ever beat him?  (hard cut)
  [1805, 1920, 'name', 'campDusk'],    // History can't even agree on his first name.  (first name 1845)
];
export const NF = 1920;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
const LIGHT = { village: 'day', villageGold: 'day', villageSun: 'day', villageDawn: 'day', store: 'office', cabin: 'night', camp: 'day', campDusk: 'day', hall: 'office' };
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: LIGHT[s[3]], kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['ln', segAt(f)[3]];

// ---------- places ----------
const OXV = -46000, OXC = -48500;
const at = (o) => (p) => [p[0] + o[0], p[1] + o[1], p[2] + o[2]];
const VLo = at([OXV, 0, 0]), STo = at([OXV, 0, 600]), CBo = at([OXV, 0, 1200]), CPo = at([OXC, 0, 0]), HAo = at([OXC, 0, 600]);
const VL = (x, z, h = 0) => VLo([x, vf(x, z) + h, z]), CP = (x, z, h = 0) => CPo([x, cf(x, z) + h, z]);
const ST = (x, y, z) => STo([x, y, z]), CB = (x, y, z) => CBo([x, y, z]), HA = (x, y, z) => HAo([x, y, z]);
const VLa = (x, y, z) => VLo([x, y, z]), CPa = (x, y, z) => CPo([x, y, z]);

// ---------- cameras ----------
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(HA(-1.75, 1.6, 4.8), HA(-1.75, 1.85, -3.8), 56, 1.2, HA(-1.0, 1.3, -1.0)),
  really: C(HA(-1.6, 1.75, 0.9), HA(-3.1, 1.9, -2.6), 46, 1.6, HA(-3.0, 1.9, -2.5)),
  y1831: C(VLa(-13, 8.5, 25), VLa(0, 1.6, -4), 42, 0.4),
  tall: C(VLa(0.9, 1.0, 6.2), VLa(0.85, 0.9, 0.6), 50, 1.2, VLa(0.9, 1.0, 0.6)),
  store: C(ST(0.4, 1.55, 3.0), ST(-0.4, 1.4, -2.0), 54, 1.4, ST(-0.6, 1.3, -1.6)),
  brag: C(ST(0.9, 1.45, 3.2), ST(0.0, 1.35, -1.0), 52, 1.4, ST(0.6, 1.2, 0.2)),
  anybody: C(ST(1.6, 1.5, 3.4), ST(0.3, 1.45, -0.6), 50, 1.8, ST(0.9, 1.4, 0.2)),
  badidea: C(ST(-0.5, 1.75, 0.9), ST(-0.8, 1.75, -2.2), 44, 2.2, ST(-0.8, 1.8, -2.1)),
  gang: C(VLa(0.3, 1.35, 8.2), VLa(0, 1.35, 0), 48, 1.0, VLa(0, 1.2, 1.5)),
  jack: C(VLa(0.15, 1.45, 4.0), VLa(0, 1.45, 1.2), 44, 1.8, VLa(0, 1.4, 1.2)),
  crowd: C(VLa(0.4, 4.4, 9.6), VLa(0, 0.8, 1.6), 46, 0.8, VLa(0, 1, 2)),
  lock: C(VLa(0.3, 1.2, 6.6), VLa(0, 1.15, 2.0), 46, 1.6, VLa(0, 1.2, 2.0)),
  who: C(VLa(-0.6, 1.35, 6.2), VLa(0.1, 1.35, 2.0), 44, 1.6, VLa(0, 1.3, 2.0)),
  differ: C(VLa(1.6, 1.6, 7.4), VLa(-0.2, 1.4, 0.6), 50, 1.0, VLa(0, 1.3, 1.6)),
  win: C(VLa(0.2, 1.3, 6.2), VLa(0, 1.15, 2.0), 46, 1.4, VLa(0, 1.1, 2.0)),
  draw: C(VLa(-0.3, 1.2, 5.8), VLa(0, 1.05, 2.0), 46, 1.4, VLa(0, 1.0, 2.0)),
  dirty: C(VLa(0.6, 1.3, 6.0), VLa(0.1, 1.2, 2.0), 44, 1.6, VLa(0, 1.2, 2.0)),
  friends: C(VLa(-0.8, 1.35, 6.4), VLa(0.1, 1.5, 1.6), 46, 1.2, VLa(0, 1.4, 1.8)),
  buck: C(VLa(0.5, 1.2, 2.6), VLa(0.5, 2.0, -4.6), 50, 1.0, VLa(0.5, 2.0, -4.0)),
  legend: C(CB(0.5, 1.5, 2.2), CB(0.7, 1.55, -3.0), 54, 1.6, CB(0.4, 1.3, -1.6)),
  once: C(CB(0.6, 1.5, 1.6), CB(0.5, 1.35, -2.6), 48, 2.2, CB(0.3, 1.3, -1.8)),
  y1832: C(CPa(-5.5, 3.0, 13.5), CPa(1.5, 1.3, -3), 46, 0.6),
  threw: C(CPa(0.5, 1.35, 6.2), CPa(0.2, 1.3, 0.2), 44, 1.4, CPa(0, 1.2, 0.3)),
  pres: C(VLa(0.6, 1.35, 6.8), VLa(0.4, 1.75, 0.6), 46, 1.2, VLa(0.5, 1.5, 1.2)),
  y1992: C(HA(2.4, 2.1, 4.6), HA(-0.6, 1.5, -3.0), 54, 1.2, HA(0, 1.4, -1.0)),
  honor: C(HA(0.2, 1.7, 1.4), HA(0, 1.9, -4.0), 46, 2.0, HA(0, 2.15, -3.95)),
  beat: C(CPa(1.2, 1.4, 5.6), CPa(0.4, 1.35, 0.4), 44, 1.4, CPa(0.4, 1.3, 0.6)),
  name: C(CPa(0.9, 1.45, 4.2), CPa(0.35, 1.5, 0.5), 42, 1.8, CPa(0.4, 1.4, 0.6)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.1, really: 0.12, y1831: 0.08, tall: 0.04, store: 0.1, brag: 0.1, anybody: 0.12, badidea: 0.14, gang: 0.08, jack: 0.12, crowd: 0.1, lock: 0.1, who: 0.08, differ: 0.08, win: 0.08, draw: 0.08, dirty: 0.1,
  friends: 0.1, buck: 0.08, legend: 0.1, once: 0.14, y1832: 0.08, threw: 0.08, pres: 0.1, y1992: 0.08, honor: 0.1, beat: 0.1, name: 0.12 };
const base = (k) => V[k] || V.hook;
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const pan = (d, f0, f1) => { const t = sm(f0, f1, f); const o = d.map((x) => x * t); c = { ...c, p: add3(c.p, o), l: add3(c.l, o), fp: add3(c.fp, o) }; };
  const tilt = (dy, f0, f1) => { c = { ...c, l: add3(c.l, [0, dy * sm(f0, f1, f), 0]) }; };
  if (k === 'hook') { punch(46, 56, 0.1); kick(49, 0.05); }
  if (k === 'really') { punch(93, 100, 0.14); kick(93, 0.05); }
  if (k === 'y1831') { pan([3, -3.2, -4], 140, 200); punch(157, 164, 0.05); }
  if (k === 'tall') { tilt(1.15, 205, 255); punch(255, 262, 0.1); kick(255, 0.06); }
  if (k === 'store') pan([-0.3, 0, 0], 288, 344);
  if (k === 'brag') { punch(355, 362, 0.08); }
  if (k === 'anybody') { punch(426, 433, 0.14); kick(426, 0.05); }
  if (k === 'badidea') { punch(467, 474, 0.1); }
  if (k === 'gang') { punch(531, 538, 0.06); punch(580, 586, 0.06); }
  if (k === 'jack') { punch(613, 620, 0.14); kick(613, 0.05); }
  if (k === 'crowd') { c = { ...c, p: add3(c.p, [0, -1.2 * sm(642, 701, f), 0]) }; }
  if (k === 'lock') { punch(704, 710, 0.1); shake(726, 744, 0.12); }
  if (k === 'who') { punch(759, 765, 0.1); }
  if (k === 'differ') punch(787, 794, 0.08);
  if (k === 'win') { punch(830, 836, 0.1); kick(830, 0.05); }
  if (k === 'draw') punch(866, 870, 0.08);
  if (k === 'dirty') { punch(923, 930, 0.12); shake(923, 935, 0.06); }
  if (k === 'friends') { punch(1023, 1030, 0.08); }
  if (k === 'buck') { punch(1113, 1120, 0.1); kick(1130, 0.05); }
  if (k === 'legend') { punch(1218, 1225, 0.06); }
  if (k === 'once') { punch(1299, 1306, 0.12); kick(1299, 0.04); }
  if (k === 'y1832') { pan([2.5, -0.8, -2.5], 1338, 1414); }
  if (k === 'threw') { punch(1432, 1438, 0.06); shake(1460, 1474, 0.16); }
  if (k === 'pres') { punch(1526, 1533, 0.1); }
  if (k === 'y1992') { punch(1580, 1586, 0.06); punch(1618, 1624, 0.05); }
  if (k === 'honor') { punch(1688, 1696, 0.08); }
  if (k === 'beat') { punch(1771, 1778, 0.1); }
  if (k === 'name') { punch(1845, 1852, 0.12); kick(1845, 0.04); }
  return c;
}
const HARD = new Set([462, 1743]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[60, 0.4, 8], [140, 0.8, 10], [288, 0.4, 8], [503, 0.5, 8], [642, 0.5, 8], [704, 0.3, 6], [819, 0.4, 6], [849, 0.4, 6], [872, 0.4, 6], [954, 0.5, 10], [1178, 0.7, 10], [1338, 0.8, 10], [1447, 0.6, 6], [1490, 0.7, 10], [1577, 0.8, 10], [1688, 0.4, 8], [1845, 0.3, 6]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state ----------
export function worldAt(f, w) {
  const s = segAt(f), k = s[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  if (!w.ln) return;
  w.ln.tally(k === 'legend' ? 300 * sm(1206, 1250, f) : k === 'once' ? 300 : 0);
}

// ---------- actors ----------
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const ABE = (f, pos, opts = {}, extra = {}) => person(f, 'LN_ABE', 11, pos, opts, { s: 1.18, ...extra });
const JACK = (f, pos, opts = {}, extra = {}) => person(f, 'LN_JACK', 12, pos, opts, { s: 1.02, ...extra });
const TOP = (f, pos, opts = {}, extra = {}) => person(f, 'TOPPER', 9, pos, { t: f, ...opts }, { s: 0.42, ...extra });
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
const hop = (f, i = 0, a = 0.05) => [0, a * Math.abs(Math.sin(f * 0.35 + i)), 0];
const sway = (f, a = 0.05) => a * Math.sin(f * 0.28);
// onlookers in a ring around (cx, cz), skipping the arc that faces the camera of shot k
const RING = [['LN_BOY1', 21], ['LN_WOMAN', 22], ['FARMER', 23], ['LN_BOY2', 24], ['TOWNKID', 25], ['LN_BOSS', 26], ['LN_BOY3', 27], ['TOWNWOMAN', 28], ['LN_BOY1', 29], ['FARMER', 30], ['LN_WOMAN', 31], ['LN_BOY2', 32]];
function ring(f, A, k, cx, cz, r, mood = 'cheer', G = VL, ox = OXV, n = RING.length) { const c = V[k], ca = Math.atan2(c.p[0] - ox - cx, c.p[2] - cz);
  for (let i = 0; i < n; i++) { const a = ca + Math.PI * (0.38 + 1.24 * i / (n - 1)), rr = r * (1 + 0.08 * (i % 3)), x = cx + Math.sin(a) * rr, z = cz + Math.cos(a) * rr; const [o, sd] = RING[i % RING.length];
    const side = Math.sin(a - ca) > 0 ? '34L' : '34R', ex = mood === 'cheer' ? (i % 3 === 0 ? 'laugh' : i % 3 === 1 ? 'excited' : 'grin') : mood === 'shock' ? (i % 2 ? 'shock' : 'surprised') : mood === 'argue' ? (i % 2 ? 'angry' : 'smug') : 'happy';
    A.push(P(f, o, sd, add3(G(x, z), mood === 'cheer' ? hop(f, i) : [0, 0, 0]), { expr: ex, cheer: mood === 'cheer' && i % 2 ? wav(f, i) : undefined, point: mood === 'argue' && i % 2 ? 1 : undefined, cross: mood === 'argue' && !(i % 2) ? 1 : undefined, view: side })); } }
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') { A.push(P(f, 'LN_STATUE', 41, HA(-3.2, 1.0, -2.6), { expr: 'calm', view: '34R' }, { s: 1.05, blob: false })); A.push(P(f, 'LN_KID', 42, HA(-0.75, 0, -0.9), { expr: f < 49 ? 'happy' : 'excited', point: 1, view: '34L' }));
    A.push(TOP(f, HA(-2.0, 0, -0.3), { expr: f < 49 ? 'smile' : 'happy', pose: 'point' })); }
  if (k === 'really') { A.push(P(f, 'LN_STATUE', 41, HA(-3.2, 1.0, -2.6), { expr: f < 93 ? 'calm' : 'smug', view: '34R' }, { s: 1.05, blob: false })); A.push(TOP(f, HA(-2.72, 1.0, -2.25), { expr: f < 93 ? 'shock' : 'proud', pose: f < 93 ? 'shock' : 'hips' }, { s: 0.3, blob: false })); }
  if (k === 'y1831') { A.push(ABE(f, VL(-1.6 + 1.2 * sm(140, 200, f), -2.6), { expr: 'smile', view: '34R' })); A.push(P(f, 'LN_WOMAN', 22, VL(3.0 - 1.5 * sm(140, 200, f), 2.2), { expr: 'happy', view: '34L' })); A.push(P(f, 'FARMER', 23, VL(-4.5, 1.0), { expr: 'smile', wave: wav(f, 2), view: '34R' }));
    A.push(P(f, 'TOWNKID', 25, VL(1.6 + 2.0 * sm(140, 200, f), 3.0), { expr: 'laugh', view: '34R' })); A.push(P(f, 'LN_BOSS', 26, VL(-0.4, -4.1, 0.32), { expr: 'smile', view: 'front' })); }
  if (k === 'tall') { A.push(ABE(f, VL(0.85, 0.6), { expr: f < 228 ? 'smile' : f < 255 ? 'happy' : 'grin', view: '34R', wave: f > 236 && f < 252 ? wav(f) : undefined }));
    A.push(P(f, 'LN_WOMAN', 22, VL(0.05, 0.9), { expr: f < 255 ? 'smile' : 'surprised', view: '34R' })); A.push(P(f, 'FARMER', 23, VL(1.7, 0.9), { expr: f < 255 ? 'smile' : 'shock', view: '34L' })); A.push(TOP(f, VL(1.3, 1.6), { expr: f < 255 ? 'smile' : 'shock', look: -1 }, { s: 0.32 })); }
  if (k === 'store' || k === 'brag' || k === 'anybody' || k === 'badidea') {
    const ab = k === 'store' ? (f < 316 ? 'happy' : 'smile') : k === 'brag' ? (f < 381 ? 'smile' : 'nervous') : k === 'anybody' ? 'nervous' : 'worried';
    A.push(ABE(f, ST(-0.8, 0, -2.25), { expr: ab, view: k === 'store' ? '34R' : '34L', prop: k === 'store' ? 'ledger' : undefined, reach: 0.5, slump: k === 'badidea' ? 1 : undefined }, { blob: false }));
    if (k !== 'store') A.push(P(f, 'LN_BOSS', 26, ST(k === 'badidea' ? 1.0 : k === 'brag' ? 0.5 : 0.85, 0, k === 'brag' ? -0.2 : 0.15), { expr: k === 'brag' ? (f < 355 ? 'smile' : 'laugh') : k === 'anybody' ? (f < 426 ? 'laugh' : 'excited') : 'smug', point: k === 'brag' && f > 360 ? 1 : undefined, cheer: k === 'anybody' && f > 426 ? wav(f) : undefined, view: '34L' }));
    if (k === 'store') A.push(P(f, 'LN_WOMAN', 22, ST(1.3, 0, 0.4), { expr: 'happy', prop: 'basket', reach: 0.4, view: '34L' }));
    A.push(TOP(f, ST(-0.05, 1.07, -1.25), { expr: k === 'badidea' ? 'shock' : k === 'anybody' ? 'happy' : 'smile', pose: k === 'anybody' && f > 426 ? 'cheer' : k === 'badidea' ? 'shock' : 'stand' }, { s: 0.28, blob: false })); }
  if (k === 'gang') { const t = sm(503, 590, f); [['LN_BOY1', 21, -1.25], ['LN_BOY2', 24, 1.25], ['LN_BOY3', 27, 0.0]].forEach(([o, sd, x], i) => A.push(P(f, o, sd, VL(x * (1 - 0.15 * t), -3.2 + 3.6 * t + (i === 2 ? -0.7 : 0)), { expr: f < 531 ? 'smug' : i === 1 ? 'mean' : 'grin', view: 'front', cross: f > 560 && i !== 2 ? 1 : undefined })));
    A.push(ABE(f, VL(-3.0, 3.6), { expr: f < 560 ? 'surprised' : 'nervous', view: '34R' })); A.push(TOP(f, VL(-2.2, 4.3), { expr: 'shock', pose: 'shock' }, { s: 0.36 })); }
  if (k === 'jack') { A.push(JACK(f, VL(0, 1.2), { expr: f < 613 ? 'smug' : 'mean', cross: 1, view: 'front' })); A.push(P(f, 'LN_BOY1', 21, VL(-1.1, 0.0), { expr: 'grin', cheer: wav(f, 1), view: '34R' })); A.push(P(f, 'LN_BOY2', 24, VL(1.15, 0.1), { expr: 'smug', view: '34L' })); }
  const fight = ['crowd', 'lock', 'who', 'differ', 'win', 'draw', 'dirty'].includes(k);
  if (fight) {
    ring(f, A, k, 0, 2, 3.0, k === 'differ' ? 'argue' : k === 'who' || k === 'draw' ? 'shock' : 'cheer');
    if (k === 'crowd') { A.push(ABE(f, VL(-0.7, 2), { expr: 'determined', view: 'sideR' })); A.push(JACK(f, VL(0.7, 2), { expr: 'mean', view: 'sideL', cross: 1 })); }
    if (k === 'lock' || k === 'who' || k === 'differ') { const sw = k === 'lock' ? sway(f) : 0; A.push(ABE(f, VL(-0.42 + sw, 2), { expr: k === 'lock' ? 'determined' : 'worried', grapple: 1, view: 'sideR' }, { roll: k === 'lock' ? 0.04 * Math.sin(f * 0.3) : 0 })); A.push(JACK(f, VL(0.42 + sw, 2), { expr: k === 'lock' ? 'angry' : 'worried', grapple: 1, view: 'sideL' }, { roll: k === 'lock' ? -0.04 * Math.sin(f * 0.3) : 0 })); }
    if (k === 'win') { A.push(ABE(f, VL(-0.45, 2), { expr: f < 830 ? 'determined' : 'excited', cheer: f > 830 ? 1 : undefined, view: '34R' })); A.push(JACK(f, VL(0.5, 2.5), { expr: 'dazed', mode: 'fall' }, { roll: -0.25 })); }
    if (k === 'draw') { A.push(ABE(f, VL(-0.55, 2), { expr: 'dazed', slump: 1, view: '34R' })); A.push(JACK(f, VL(0.55, 2), { expr: 'dazed', slump: 1, view: '34L' })); }
    if (k === 'dirty') { A.push(ABE(f, VL(-0.4, 2), { expr: f < 923 ? 'determined' : 'shock', grapple: f < 923 ? 1 : 0.4, view: 'sideR' }, { roll: f > 923 ? 0.08 : 0 })); A.push(JACK(f, VL(0.38, 2.05), { expr: f < 900 ? 'angry' : 'sly', grapple: 1, view: 'sideL' }));
      A.push(TOP(f, VL(0.75, 3.1), { expr: f < 923 ? 'smile' : 'shock', pose: f < 923 ? 'stand' : 'shock' }, { s: 0.34 })); } }
  if (k === 'friends') { const b = f > 1023; A.push(ABE(f, VL(-0.5, 1.6), { expr: b ? 'laugh' : 'smile', view: '34R', point: b ? undefined : 1, cheer: b ? wav(f, 0) : undefined })); A.push(JACK(f, VL(0.55, 1.75), { expr: b ? 'laugh' : 'happy', view: '34L', point: b ? undefined : 1, cheer: b ? wav(f, 2) : undefined }));
    A.push(TOP(f, VL(0.0, 2.45), { expr: b ? 'love' : 'happy', pose: b ? 'cheer' : 'stand' }, { s: 0.34 })); }
  if (k === 'buck') { const q2 = f > 1110; A.push(ABE(f, VLa(0.5, 0.32, -4.6), { expr: q2 ? 'determined' : 'smile', raise: q2 ? 1 : undefined, view: 'front' }, { blob: false }));
    [['LN_BOY1', 21, -0.75, -3.2, '34R'], ['LN_BOY3', 27, 1.85, -3.3, '34L'], ['LN_WOMAN', 22, -0.2, -2.4, '34R'], ['FARMER', 23, 1.2, -2.3, '34L']].forEach(([o, sd, x, z, v], i) => A.push(P(f, o, sd, add3(VL(x, z), q2 ? hop(f, i) : [0, 0, 0]), { expr: q2 ? (i % 2 ? 'laugh' : 'excited') : 'happy', cheer: q2 && i % 2 ? wav(f, i) : undefined, view: v })));
    A.push(JACK(f, VL(2.6, -3.2), { expr: q2 ? 'laugh' : 'smile', view: '34L', cross: 1 })); }
  if (k === 'legend' || k === 'once') { A.push(ABE(f, CB(0.15, 0, -1.95), { expr: k === 'legend' ? 'thoughtful' : f < 1299 ? 'smile' : 'smug', mode: 'sit', prop: k === 'legend' ? 'ledger' : undefined, reach: 0.4, view: k === 'legend' ? '34R' : 'front' }, { blob: false }));
    if (k === 'once') A.push(TOP(f, CB(0.85, 0.78, -1.1), { expr: f < 1299 ? 'smile' : 'proud', pose: f < 1296 ? 'stand' : 'point' }, { s: 0.26, blob: false })); }
  if (k === 'y1832') { A.push(ABE(f, CP(1.0, 1.4), { expr: 'smile', view: '34R' })); [['LN_MIL1', 51, -1.4, 0.4, '34R', 'grin'], ['LN_MIL2', 52, 3.4, 0.6, '34L', 'laugh'], ['LN_THOMPSON', 53, 2.3, -0.8, '34L', 'smug'], ['LN_MIL1', 54, -3.4, -1.6, '34R', 'happy'], ['LN_MIL2', 55, 5.6, -0.2, '34L', 'smile']]
    .forEach(([o, sd, x, z, v, e]) => A.push(P(f, o, sd, CP(x, z), { expr: e, view: v, cross: o === 'LN_THOMPSON' ? 1 : undefined }))); }
  if (k === 'threw') { const tt = sm(1447, 1463, f), air = f >= 1447 && f < 1463, land = f >= 1463, ca = Math.atan2(V.threw.p[0] - OXC, V.threw.p[2] - 0.3);
    [['LN_MIL1', 51], ['LN_MIL2', 52], ['LN_BOY2', 56], ['LN_MIL1', 54], ['LN_MIL2', 55], ['LN_BOY1', 57], ['LN_MIL1', 58]].forEach(([o, sd], i) => { const a = ca + Math.PI * (0.62 + 0.76 * i / 6), x = Math.sin(a) * 3.0, z = 0.3 + Math.cos(a) * 3.0;
      A.push(P(f, o, sd, add3(CP(x, z), land ? [0, 0, 0] : hop(f, i)), { expr: land ? (i % 2 ? 'shock' : 'surprised') : i % 2 ? 'laugh' : 'excited', cheer: !land && i % 2 ? wav(f, i) : undefined, view: Math.sin(a - ca) > 0 ? '34L' : '34R' })); });
    A.push(P(f, 'LN_THOMPSON', 53, CP(0.45, 0.3), { expr: f < 1447 ? 'mean' : 'smug', grapple: f < 1447 ? 1 : undefined, cheer: f > 1466 ? 1 : undefined, view: f < 1447 ? 'sideL' : '34L' }, { s: 1.04 }));
    if (!air && !land) A.push(ABE(f, CP(-0.42, 0.3), { expr: f < 1432 ? 'determined' : 'worried', grapple: 1, view: 'sideR' }, { roll: 0.04 * Math.sin(f * 0.3) }));
    else if (air) A.push(ABE(f, add3(CP(-0.42 + 0.95 * tt, 0.3 + 1.3 * tt), [0, 1.3 * Math.sin(Math.PI * tt), 0]), { expr: 'shock', mode: 'fall' }, { roll: -TAU * 0.75 * tt }));
    else A.push(ABE(f, CP(-0.45, 1.0, -0.3), { expr: 'dazed', mode: 'sit', view: '34R' }, { roll: 0.08, blob: false }));
    if (land) A.push(TOP(f, CP(0.75, 2.3), { expr: 'shock', pose: 'shock' }, { s: 0.34 })); }
  if (k === 'pres') { const b = f > 1526; A.push(person(f, 'LN_ABEP', 13, VL(0.45, 1.2), { expr: b ? 'happy' : 'calm', wave: b ? wav(f) : undefined, view: 'front' }, { s: 1.12 }));
    [['LN_WOMAN', 22, -0.9, 1.9, '34R'], ['FARMER', 23, 1.7, 2.0, '34L'], ['TOWNKID', 25, -0.15, 2.7, 'front'], ['LN_BOY1', 21, 1.35, 2.9, '34L']].forEach(([o, sd, x, z, v], i) => A.push(P(f, o, sd, add3(VL(x, z), b ? hop(f, i) : [0, 0, 0]), { expr: b ? 'excited' : 'happy', cheer: b && i % 2 ? wav(f, i) : undefined, view: v }))); }
  if (k === 'y1992') { A.push(P(f, 'LN_STATUE', 41, HA(-3.2, 1.0, -2.6), { expr: 'calm', view: '34R' }, { s: 1.05, blob: false })); A.push(P(f, 'LN_GUIDE', 43, HA(0.9, 0, -1.7), { expr: 'smile', point: 1, view: '34L' })); A.push(P(f, 'LN_KID', 42, HA(0.1, 0, -0.6), { expr: f < 1618 ? 'happy' : 'excited', view: '34L' }));
    A.push(TOP(f, HA(-0.6, 0, -0.4), { expr: 'happy', pose: f > 1618 ? 'cheer' : 'wave' })); }
  if (k === 'honor') { A.push(P(f, 'LN_KID', 42, HA(0.55, 0, -3.2), { expr: f < 1688 ? 'happy' : 'excited', cheer: f > 1688 ? wav(f) : undefined, view: '34L' })); }
  if (k === 'beat') { A.push(P(f, 'LN_THOMPSON', 53, CP(0.4, 0.4), { expr: f < 1771 ? 'smug' : 'grin', cross: 1, view: '34L' }, { s: 1.04 })); A.push(TOP(f, CP(0.35, 1.7), { expr: f < 1771 ? 'sly' : 'shock', pose: f < 1771 ? 'point' : 'shock' }, { s: 0.36 })); }
  if (k === 'name') { A.push(P(f, 'LN_THOMPSON', 53, CP(0.4, 0.4), { expr: f < 1845 ? 'thoughtful' : 'worried', shake: f > 1828 ? 1 : undefined, palm: f > 1845 ? 1 : undefined, view: '34L' }, { s: 1.04 }));
 }
  return A;
}

// ---------- effects ----------
const ASP = 1080 / 1920; let CURF = 0;
function SB(k, x, y, z) { const c = cam(k, CURF), n = (v) => { const l = Math.hypot(...v); return v.map((u) => u / l); }, fw = n([c.l[0] - c.p[0], c.l[1] - c.p[1], c.l[2] - c.p[2]]), r = n([-fw[2], 0, fw[0]]), u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]], t = Math.tan(c.fov * Math.PI / 360);
  return [0, 1, 2].map((i) => c.p[i] + fw[i] * z + r[i] * x * t * ASP * z + u[i] * y * t * z); }
const SW = (k, w, z) => 2 * w * z * Math.tan(cam(k, CURF).fov * Math.PI / 360) * ASP;
const board = (f, f0, lines, pos, size, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'board', lines, pos, size: size * back(f0, f0 + 12, f) }); };
const sboard = (f, f0, lines, k, x, y, z, w, F2, f1) => board(f, f0, lines, SB(k, x, y, z), SW(k, w, z), F2, f1);
const sburst = (f, f0, k, x, y, z, w, F2, col = '#fff3b0', n = 12) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'burst', t: (f - f0) / n, pos: SB(k, x, y, z * 1.1), size: SW(k, w, z * 1.1), col, rays: 10 }); };
const stars = (f, f0, k, x, y, z, w, F2, per = 30) => { if (f >= f0) F2.push({ fx: 'stars', t: ((f - f0) / per) % 1, pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 10, f) }); };
const qmark = (f, f0, k, x, y, z, w, F2) => { if (f >= f0) F2.push({ fx: 'qmark', pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 8, f) }); };
const stamp = (f, f0, lines, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) { const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos: SB(k, x, y, z), size: SW(k, w, z) * (1.6 - 0.6 * t * t), op: Math.min(1, t * 2) }); } };
const wpuff = (f, f0, pos, size, F2, n = 16, tint) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'puff', t: (f - f0) / n, pos, size, tint }); };
const count = (f, f0, f1, v0, v1, fmt) => fmt(Math.round(v0 + (v1 - v0) * sm(f0, f1, f)));
const DUST = '#d8b890';
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { sboard(f, 8, ['ABRAHAM LINCOLN'], 'hook', 0.0, 0.7, 3, 0.5, F2); sboard(f, 46, ['...WRESTLING', 'HALL OF FAME?!'], 'hook', 0.0, -0.42, 3, 0.48, F2); sburst(f, 49, 'hook', 0.0, -0.42, 3, 0.6, F2); }
  if (k === 'really') { stamp(f, 93, ['NO,', 'REALLY.'], 'really', 0.2, 0.55, 2.5, 0.42, F2); stars(f, 100, 'really', -0.1, 0.3, 2.5, 0.5, F2, 24); }
  if (k === 'y1831') { sboard(f, 140, ['1831'], 'y1831', 0.0, 0.66, 4, 0.32, F2); sboard(f, 158, ['NEW SALEM,', 'ILLINOIS'], 'y1831', 0.0, 0.4, 4, 0.46, F2); }
  if (k === 'tall') { sboard(f, 226, ['AGE 22'], 'tall', -0.36, 0.68, 3, 0.3, F2, 252); sburst(f, 255, 'tall', 0.0, 0.62, 3, 0.6, F2); sboard(f, 253, ["6' 4\""], 'tall', 0.0, 0.66, 3, 0.36, F2); }
  if (k === 'store') { sboard(f, 300, ['THE CLERK'], 'store', -0.2, -0.45, 2.5, 0.36, F2); }
  if (k === 'brag') { sboard(f, 353, ['THE BOSS', 'BRAGS...'], 'brag', 0.0, 0.66, 2.5, 0.42, F2); }
  if (k === 'anybody') { sburst(f, 426, 'anybody', 0.0, 0.62, 2.0, 0.6, F2, '#fff3b0', 14); sboard(f, 408, ['"HE CAN BEAT', 'ANYBODY!"'], 'anybody', 0.0, 0.64, 2.0, 0.46, F2); }
  if (k === 'badidea') { stamp(f, 465, ['BAD', 'IDEA.'], 'badidea', 0.0, 0.58, 1.5, 0.4, F2); }
  if (k === 'gang') { sboard(f, 529, ["THE CLARY'S", 'GROVE BOYS'], 'gang', 0.0, 0.66, 4, 0.5, F2); }
  if (k === 'jack') { sburst(f, 613, 'jack', 0.0, 0.64, 2.5, 0.6, F2, '#ffd0a0', 12); sboard(f, 611, ['JACK ARMSTRONG', 'CHAMPION'], 'jack', 0.0, 0.66, 2.5, 0.48, F2); }
  if (k === 'crowd') { sboard(f, 655, ['THE WHOLE', 'VILLAGE!'], 'crowd', 0.0, 0.66, 4, 0.44, F2); }
  if (k === 'lock') { for (const f0 of [704, 716, 726, 738]) wpuff(f, f0, VLa(f0 % 2 ? -0.4 : 0.4, 0.15, 2.25), 1.1, F2, 18, DUST); sboard(f, 724, ['IN THE DUST'], 'lock', 0.0, 0.68, 3, 0.4, F2); }
  if (k === 'who') { sboard(f, 757, ['WHO WON?'], 'who', 0.0, 0.66, 3, 0.4, F2); qmark(f, 760, 'who', -0.3, 0.35, 3, 0.12, F2); qmark(f, 766, 'who', 0.3, 0.38, 3, 0.12, F2); }
  if (k === 'differ') { sboard(f, 786, ['ACCOUNTS', 'DIFFER'], 'differ', 0.0, 0.66, 4, 0.44, F2); }
  if (k === 'win') { sboard(f, 821, ['SOME SAY:', 'LINCOLN WON'], 'win', 0.0, 0.66, 3, 0.46, F2); wpuff(f, 822, VLa(0.5, 0.2, 2.5), 1.4, F2, 18, DUST); sburst(f, 830, 'win', -0.1, 0.3, 3, 0.5, F2); }
  if (k === 'draw') { sboard(f, 851, ['SOME SAY:', 'A DRAW'], 'draw', 0.0, 0.66, 3, 0.42, F2); }
  if (k === 'dirty') { sboard(f, 874, ['SOME SAY: ARMSTRONG', 'FOUGHT DIRTY'], 'dirty', 0.0, 0.66, 3, 0.52, F2); stamp(f, 923, ['FOUL!'], 'dirty', 0.1, 0.25, 3, 0.32, F2); }
  if (k === 'friends') { sboard(f, 958, ['AFTERWARD...'], 'friends', -0.2, 0.7, 4, 0.4, F2, 1018); sburst(f, 1023, 'friends', 0.0, 0.64, 4, 0.6, F2, '#ffb0c8', 14); sboard(f, 1021, ['BEST', 'FRIENDS'], 'friends', 0.0, 0.64, 4, 0.4, F2); stars(f, 1030, 'friends', 0.0, 0.25, 4, 0.5, F2, 24); }
  if (k === 'buck') { sboard(f, 1068, ['REPORTEDLY...'], 'buck', -0.25, 0.72, 3, 0.36, F2, 1108); sburst(f, 1113, 'buck', 0.0, 0.62, 3, 0.6, F2); sboard(f, 1110, ['"I\'M THE BIG BUCK', 'OF THIS LICK!"'], 'buck', 0.0, 0.64, 3, 0.52, F2); }
  if (k === 'legend') { sboard(f, 1180, ['LEGEND SAYS...'], 'legend', 0.0, 0.7, 2.5, 0.42, F2, 1214); if (f > 1214) board(f, 1214, ['ABOUT ' + count(f, 1218, 1250, 0, 300, String), 'MATCHES'], SB('legend', 0.0, 0.66, 2.5), SW('legend', 0.42, 2.5), F2); }
  if (k === 'once') { sburst(f, 1299, 'once', 0.0, 0.62, 1.6, 0.6, F2, '#fff3b0', 14); sboard(f, 1270, ['LOST ONLY...'], 'once', 0.0, 0.66, 1.6, 0.42, F2, 1297); sboard(f, 1297, ['ONCE.'], 'once', 0.0, 0.64, 1.6, 0.36, F2); }
  if (k === 'y1832') { sboard(f, 1340, ['1832'], 'y1832', 0.0, 0.66, 4, 0.32, F2, 1379); sboard(f, 1381, ['BLACK HAWK', 'WAR'], 'y1832', 0.0, 0.66, 4, 0.42, F2); }
  if (k === 'threw') { sboard(f, 1430, ['A SOLDIER', 'NAMED THOMPSON'], 'threw', 0.0, 0.66, 3, 0.5, F2, 1447); if (f >= 1462) wpuff(f, 1462, CPa(-0.45, 0.2, 1.0), 1.6, F2, 20, DUST); stamp(f, 1449, ['THROWN!'], 'threw', 0.0, 0.62, 3, 0.42, F2); }
  if (k === 'pres') { sburst(f, 1526, 'pres', 0.0, 0.64, 4, 0.6, F2, '#fff3b0', 14); sboard(f, 1524, ['16TH', 'PRESIDENT'], 'pres', 0.0, 0.66, 4, 0.4, F2); stars(f, 1532, 'pres', 0.0, 0.25, 4, 0.5, F2, 24); }
  if (k === 'y1992') { sboard(f, 1579, ['1992'], 'y1992', -0.35, 0.7, 4, 0.3, F2); }
  if (k === 'honor') { sburst(f, 1688, 'honor', 0.0, 0.0, 2.5, 0.8, F2, '#fff3b0', 14); stars(f, 1692, 'honor', 0.0, 0.5, 2.5, 0.6, F2, 24); sboard(f, 1662, ['HONORED!'], 'honor', 0.0, 0.7, 2.5, 0.36, F2); }
  if (k === 'beat') { sboard(f, 1748, ['THE ONLY MAN', 'WHO BEAT HIM?'], 'beat', 0.0, 0.66, 3, 0.5, F2); }
  if (k === 'name') { const nm = f < 1826 ? ['HANK', 'THOMPSON?'] : f < 1843 ? ['LORENZO', 'THOMPSON?'] : ['???', 'THOMPSON']; board(f, f < 1826 ? 1806 : f < 1843 ? 1826 : 1843, nm, SB('name', 0.0, 0.64, 2.5), SW('name', 0.42, 2.5), F2);
    if (f > 1845) { qmark(f, 1846, 'name', -0.32, 0.25, 2.5, 0.12, F2); qmark(f, 1852, 'name', 0.32, 0.3, 2.5, 0.12, F2); qmark(f, 1858, 'name', 0.0, 0.42, 2.5, 0.1, F2); } }
  return F2;
}
