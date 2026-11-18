// [KCH-story] "Ketchup was sold as medicine" timeline (67.12 s voice, 2014 f @ 30 fps).
// Sets: ohio.js (lecture / street / streetGloom / diner) and pills.js (workshop / press / lab), driven through setAt.
// Pattern: story_liberty.js (slow push per shot, zoom-through whips on cuts, boards for facts, bursts on SFX hits).
// TOMMY (tomato mascot) is the recurring comic sidekick; narrator is not lip-synced.
import * as S from './story.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, module, set]                                   narration (word frames from work/words_frames.txt)
const SH = [
  [0, 46, 'hook', 'ohio', 'diner'],            // In the 1830s,  (modern bottle squeeze macro)
  [46, 111, 'apoth', 'ohio', 'street'],         // you could buy ketchup... as medicine.  (MEDICINE board 82)
  [111, 204, 'gloom', 'ohio', 'streetGloom'],   // Back then, lots of Americans didn't trust tomatoes.
  [204, 255, 'badfor', 'ohio', 'streetGloom'],  // Some thought they were bad for you.  (tuba wah 204)
  [255, 316, 'hall', 'ohio', 'lecture'],        // Then, an Ohio doctor named John Cook Bennett
  [316, 393, 'lectern', 'ohio', 'lecture'],     // stood up at a medical college and announced
  [393, 421, 'opposite', 'ohio', 'lecture'],    // the opposite.  (ting 393)
  [421, 505, 'chart', 'ohio', 'lecture'],       // Tomatoes, he said, could fix diarrhea, indigestion,  (465 / 489)
  [505, 549, 'cholera', 'ohio', 'lecture'],     // even cholera.  (thump 519)
  [549, 610, 'table', 'ohio', 'lecture'],       // Eat them raw, eat them cooked,
  [610, 648, 'ketchup', 'ohio', 'lecture'],     // or eat them as ketchup.  (squirt 624)
  [648, 718, 'crazy', 'ohio', 'street'],        // America went tomato crazy.  (cheer 684)
  [718, 776, 'miles', 'pills', 'workshop'],     // A businessman named Archibald Miles saw an opportunity.
  [776, 818, 'cash', 'pills', 'workshop'],      // (cash ding 786) He started
  [818, 843, 'rattle', 'pills', 'workshop'],    // selling pills.  (rattle 837)
  [843, 948, 'product', 'pills', 'workshop'],   // Dr. Miles's compound extract of tomato.  (fanfare 843)
  [948, 987, 'rival', 'pills', 'press'],        // Then, a rival doctor,
  [987, 1062, 'phelps', 'pills', 'press'],      // Guy Phelps, launched his own tomato pills.  (brass stab 987)
  [1062, 1119, 'ads', 'pills', 'press'],        // Newspapers filled with ads.
  [1119, 1188, 'split', 'pills', 'press'],      // Each side swore theirs was the real one.
  [1188, 1290, 'slogan', 'ohio', 'street'],     // The slogan? Tomato pills will cure all your ills.  (jingle 1224-1266)
  [1290, 1338, 'signs', 'ohio', 'street'],      // Pharmacies put up signs.  (hammer 1302 / 1314)
  [1338, 1404, 'queue', 'ohio', 'street'],      // Hundreds of thousands of people bought them.  (babble 1338)
  [1404, 1443, 'problem', 'pills', 'lab'],      // There was just one problem.  (music stop, thud 1437)
  [1443, 1510, 'check', 'pills', 'lab'],        // When people finally checked,
  [1510, 1542, 'magnify', 'pills', 'lab'],      // many of those pills had
  [1542, 1578, 'verdict', 'pills', 'lab'],      // no tomato in them at all.  (bonk 1542)
  [1578, 1666, 'lax', 'ohio', 'street'],        // Some were reportedly cut with laxatives.  (tuba slide, oof 1623)
  [1666, 1708, 'fizzle', 'ohio', 'streetGloom'],// The craze fizzled out.  (descending fife)
  [1708, 1768, 'won', 'ohio', 'street'],        // But the tomato won anyway.  (fanfare 1728)
  [1768, 1863, 'love', 'ohio', 'street'],       // People had learned to love it, especially as ketchup.
  [1863, 1902, 'diner', 'ohio', 'diner'],       // So, next time you
  [1902, 1946, 'squeeze', 'ohio', 'diner'],     // squeeze the bottle, remember,  (squeeze 1902)
  [1946, 2014, 'end', 'ohio', 'diner'],         // somebody once sold that as medicine.  (glock 1989)
];
export const NF = 2014;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
const LIGHT = { lecture: 'office', street: 'day', streetGloom: 'day', diner: 'office', workshop: 'office', press: 'office', lab: 'explain' };
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: LIGHT[s[4]], kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {}; // narrator not lip-synced; characters don't talk
export const setAt = (f) => { const s = segAt(f); return [s[3], s[4]]; };

// ---------- places (local set coords -> world; origins from ohio.js / pills.js) ----------
const at = (o) => (p) => [p[0] + o[0], p[1] + o[1], p[2] + o[2]];
const LE = at([-14000, 0, 0]), ST = at([-14000, 0, 600]), DI = at([-14000, 0, 1200]);
const WS = at([-16500, 0, 0]), PR = at([-16500, 0, 200]), LB = at([-16500, 0, 400]);
const BW = 0.3; // street boardwalk height
const ROWS = [ // lecture student seats (feet on tier r), from ohio.spots.students
  [[-2.69, 0.55, 1.72], [-1.38, 0.55, 2.2], [0.42, 0.55, 2.35], [1.79, 0.55, 2.09], [3.06, 0.55, 1.52]],
  [[-3.12, 1.1, 2.57], [-1.6, 1.1, 3.12], [-0.49, 1.1, 3.29], [1.13, 1.1, 3.22], [2.68, 1.1, 2.77]],
  [[-2.36, 1.65, 3.9], [-0.55, 1.65, 4.24], [1.28, 1.65, 4.15], [3.05, 1.65, 3.64]],
  [[-1.44, 2.2, 5.09], [0.62, 2.2, 5.19], [2.64, 2.2, 4.8]],
];
const CROWD = [[-6.02, 0, -2.2], [-4.58, 0, -2.2], [-2.71, 0, -2.2], [-1.29, 0, -2.2], [0.34, 0, -2.2], [-6.01, 0, -0.7], [-4.23, 0, -0.7], [-2.74, 0, -0.7], [-1.29, 0, -0.7], [0.59, 0, -0.7]];
const QUEUE = [[2.5, BW, -5.1], [3.45, BW, -4.95], [4.4, BW, -5.1], [5.35, BW, -4.95], [6.3, BW, -5.1], [7.25, BW, -4.95], [8.2, BW, -5.1], [9.15, BW, -4.95]];

// ---------- cameras ----------
const C = (W, p, l, fov, cInf, fp) => ({ p: W(p), l: W(l), fov, cInf, fp: W(fp || l) });
const V = {
  hook: C(DI, [0.78, 1.08, 0.92], [0.1, 0.96, 0.08], 40, 6, [0.15, 0.95, 0.12]),
  apoth: C(ST, [4.2, 1.7, 3.6], [0.4, 1.9, -6.4], 44, 2.2, [2.2, 1.4, -3.4]),
  gloom: C(ST, [4.4, 1.55, 4.8], [-0.6, 1.5, -2.0], 50, 2.2, [0.6, 1.3, -1.2]),
  badfor: C(ST, [2.0, 1.45, 3.3], [0.25, 1.2, -1.0], 44, 4, [0.3, 1.2, -0.8]),
  hall: C(LE, [-1.6, 5.9, 7.4], [-0.4, 0.6, -5.6], 56, 1.4, [0.4, 1.2, -4.1]),
  lectern: C(LE, [2.4, 1.65, -0.6], [0.0, 1.75, -5.2], 44, 2.6, [0.4, 1.5, -4.1]),
  opposite: C(LE, [1.9, 1.55, -0.7], [0.3, 1.7, -4.1], 44, 4, [0.4, 1.6, -4.1]),
  chart: C(LE, [1.0, 1.8, -2.2], [-1.4, 2.1, -7.2], 50, 2.5, [-0.6, 1.4, -5.9]),
  cholera: C(LE, [0.7, 1.55, -1.0], [-0.5, 3.0, 6.0], 60, 1.6, [0, 2.2, 3.4]),
  table: C(LE, [-0.85, 1.5, -2.0], [-1.95, 0.9, -3.55], 40, 6, [-1.9, 0.95, -3.4]),
  ketchup: C(LE, [0.9, 1.55, 0.4], [-1.1, 1.15, -3.2], 44, 3, [-1.0, 1.1, -2.6]),
  crazy: C(ST, [3.6, 1.6, 6.6], [-2.0, 2.2, -3.0], 54, 1.8, [-1.0, 1.4, -1.4]),
  miles: C(WS, [0.45, 1.5, 1.9], [-0.15, 1.25, -1.4], 56, 2.2, [-0.1, 1.3, -1.45]),
  cash: C(WS, [2.05, 1.62, 0.55], [2.47, 0.87, -0.58], 40, 5, [2.35, 0.9, -0.63]),
  rattle: C(WS, [0.42, 1.5, 0.12], [0.05, 0.94, -0.42], 40, 6, [0.05, 0.99, -0.35]),
  product: C(WS, [0.5, 1.4, 2.9], [0.1, 1.3, -0.4], 48, 3, [0.0, 1.3, 0.0]),
  rival: C(PR, [1.5, 1.6, 3.4], [-0.6, 1.5, -1.6], 58, 2.2, [0.6, 1.3, -0.4]),
  phelps: C(PR, [-0.2, 1.55, 1.7], [0.5, 1.45, -0.7], 42, 4, [0.55, 1.4, -0.6]),
  ads: C(PR, [0, 1.8, 0.3], [0, 1.85, -3.4], 64, 2.5, [0, 1.8, -3.3]),
  split: C(PR, [0, 1.6, 1.7], [0, 1.65, -3.4], 60, 2.5, [0, 1.5, -1.3]),
  slogan: C(ST, [-21.3, 1.55, -0.6], [-21.3, 1.5, -6.4], 46, 4, [-21.3, 1.0, -4.6]),
  signs: C(ST, [-8.6, 1.8, 1.4], [-8.4, 2.5, -6.4], 48, 3, [-8.3, 2.8, -6.2]),
  queue: C(ST, [1.9, 1.5, 0.2], [7.0, 1.35, -5.0], 50, 2.2, [4.4, 1.4, -5.0]),
  problem: C(LB, [0.3, 0.95, 1.9], [0.0, 0.85, -0.6], 50, 3, [0.15, 0.55, 0.15]),
  check: C(LB, [0.2, 1.45, 2.0], [-0.25, 1.15, -0.7], 54, 2.2, [-0.45, 1.2, 0.05]),
  magnify: C(LB, [0.06, 1.25, 0.55], [0.02, 0.98, -0.5], 40, 5, [0.0, 0.95, -0.5]),
  verdict: C(LB, [40.5, 4.4, 7.6], [40.15, 1.7, 0], 40, 4, [39.4, 0.95, 0.2]),
  lax: C(ST, [2.6, 1.5, 5.2], [-0.8, 1.3, -2.0], 50, 2.5, [0.4, 1.2, -0.6]),
  fizzle: C(ST, [4.4, 1.55, 4.8], [-0.6, 1.7, -2.4], 50, 2.2, [2.2, 0.8, 1.6]),
  won: C(ST, [-2.2, 1.9, 8.6], [-1.2, 2.6, -6], 56, 1.4, [-1.4, 1.2, 2.6]),
  love: C(ST, [-11.2, 1.6, 4.4], [-14.3, 1.25, -1.4], 50, 2.2, [-14.0, 1.2, 0.6]),
  diner: C(DI, [0.0, 1.3, 1.75], [0.0, 0.95, -0.4], 50, 3, [0.0, 0.95, -0.2]),
  squeeze: C(DI, [0.78, 1.08, 0.92], [0.1, 0.96, 0.08], 40, 6, [0.15, 0.95, 0.12]),
  end: C(DI, [0.05, 1.3, 1.85], [0.0, 0.98, -0.4], 48, 3, [0.0, 0.95, -0.2]),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]]; return { ...v, p: add3(v.p, d.map((x) => x * k * t)) }; };
const PUSH = { hook: 0.12, apoth: 0.14, gloom: 0.08, badfor: 0.1, hall: 0.08, lectern: 0.1, opposite: 0.06, chart: 0.08, cholera: 0.06, table: 0.12, ketchup: 0.08, crazy: 0.08,
  miles: 0.1, cash: 0.12, rattle: 0.1, product: 0.1, rival: 0.08, phelps: 0.08, ads: 0.12, split: 0.06, slogan: 0.1, signs: 0.06, queue: 0.08, problem: 0.0, check: 0.08,
  magnify: 0.1, verdict: 0.06, lax: 0.04, fizzle: -0.08, won: 0.08, love: 0.1, diner: 0.1, squeeze: 0.08, end: -0.1 };
const base = (k) => V[k] || V.hook;
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  if (k === 'apoth') { punch(82, 88, 0.1); kick(82, 0.05); }
  if (k === 'badfor') punch(204, 212, 0.08);
  if (k === 'opposite') { punch(393, 399, 0.14); kick(393, 0.03); }
  if (k === 'chart') { kick(465, 0.04); kick(489, 0.04); }
  if (k === 'cholera') { punch(519, 524, 0.16); kick(519, 0.12); }
  if (k === 'ketchup') punch(624, 630, 0.08);
  if (k === 'crazy') kick(684, 0.12);
  if (k === 'cash') punch(786, 792, 0.08);
  if (k === 'product') punch(843, 850, 0.1);
  if (k === 'phelps') { punch(987, 993, 0.14); kick(987, 0.04); }
  if (k === 'signs') { kick(1302, 0.05); kick(1314, 0.05); }
  if (k === 'problem') { punch(1437, 1441, 0.12); kick(1437, 0.03); }
  if (k === 'verdict') { punch(1542, 1548, 0.12); kick(1542, 0.25); }
  if (k === 'lax') kick(1623, 0.06);
  if (k === 'won') punch(1728, 1736, 0.08);
  if (k === 'end') punch(1989, 1995, 0.08);
  return c;
}
const HARD = new Set([1404]); // hard cut into the music stop
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0; // white flashes on place jumps and big hits
  for (const [c, a, n] of [[46, 0.8, 10], [82, 0.5, 8], [255, 0.5, 8], [393, 0.6, 8], [519, 0.5, 8], [648, 0.6, 10], [684, 0.4, 8], [718, 0.6, 10], [843, 0.5, 8], [987, 0.6, 8], [1188, 0.4, 8], [1542, 0.6, 8], [1708, 0.7, 10], [1728, 0.5, 8], [1863, 0.7, 10], [1989, 0.4, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state ----------
export function worldAt(f, w) {
  const s = segAt(f), k = s[2], O = w.ohio, P = w.pills;
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  if (O) {
    if (s[4] === 'street') O.mood('crazy');
    O.signs(k === 'apoth' || k === 'slogan' || k === 'queue' || k === 'lax' ? 1 : k === 'signs' ? sm(1294, 1336, f) : k === 'fizzle' ? 1 - sm(1672, 1700, f) : 0);
    O.squeeze(k === 'hook' ? 0.26 + 0.48 * sm(2, 44, f) : k === 'squeeze' ? 0.12 + 0.84 * sm(1902, 1942, f) : 0);
  }
  if (P) {
    P.roll(k === 'rattle' ? 1.8 : 1);
    P.cash(k === 'miles' ? 0.15 : k === 'cash' ? 0.15 + 0.85 * eo(786, 814, f) : 1);
    P.ads(k === 'ads' ? 0.08 + 0.85 * sm(1064, 1116, f) : k === 'split' ? 1 : k === 'rival' || k === 'phelps' ? 0.1 : 0.5);
    if (k === 'verdict') P.verdictAt(1542); else P.verdict(0);
    P.magnify(k === 'magnify', k === 'magnify' ? camAt(f).p : null);
  }
}

// ---------- actors ----------
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const TOM = (f, pos, opts = {}, extra = {}) => person(f, 'TOMMY', 7, pos, { t: f, ...opts }, extra);
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
const hop = (f, i = 0, a = 0.06) => [0, a * Math.abs(Math.sin(f * 0.35 + i)), 0];

export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') A.push(TOM(f, DI([0.3, 0.76, 0.42]), { expr: f < 30 ? 'smile' : 'happy', pose: 'wave' }, { s: 0.16, blob: false }));
  if (k === 'apoth') {
    A.push(P(f, 'TOWNWOMAN', 21, ST(QUEUE[0]), { expr: 'happy', prop: 'pillbottle', label: 'pills', reach: 0.8, view: '34R' }));
    A.push(P(f, 'FARMER', 22, ST(QUEUE[1]), { expr: 'smile', prop: 'pillbox', label: 'pills', reach: 0.6, view: '34L' }));
    A.push(TOM(f, ST([2.0, 0, -2.6]), { expr: f < 82 ? 'smile' : 'proud', variant: 'pill', label: 'pills' }));
  }
  if (k === 'gloom') {
    A.push(P(f, 'TOWNWOMAN', 21, ST([-0.9, 0, -1.6]), { expr: 'sly', cross: 1, look: 1, view: '34R' }));
    A.push(P(f, 'FARMER', 22, ST([0.9, 0, -2.2]), { expr: 'mean', cross: 1, look: -1, view: '34L' }));
    A.push(P(f, 'TOWNKID', 23, ST([-2.4, 0, -0.9]), { expr: 'worried', look: 1, view: '34R' }));
    A.push(P(f, 'STUDENT2', 24, ST([-3.4, 0, -2.4]), { expr: 'sly', cross: 1, look: 1, view: '34R' }));
    A.push(TOM(f, ST([1.9, 0, 1.0]), { expr: 'sad' }));
  }
  if (k === 'badfor') {
    A.push(P(f, 'TOWNWOMAN', 21, ST([-0.45, 0, -1.2]), { expr: 'sly', cross: 1, look: 1, view: '34R' }));
    A.push(P(f, 'FARMER', 22, ST([1.05, 0, -1.6]), { expr: f < 226 ? 'mean' : 'worried', cross: 1, look: -1, view: '34L' }));
    A.push(TOM(f, ST([0.4, 0, 0.0]), { expr: f < 226 ? 'sad' : 'shock' }));
  }
  if (s[4] === 'lecture') {
    const BEN = (pos, opts) => A.push(P(f, 'BENNETT', 11, LE(pos), opts));
    const studs = (expr, up) => ROWS.forEach((row, r) => row.forEach((p, i) => A.push(P(f, (r + i) % 2 ? 'STUDENT1' : 'STUDENT2', 30 + r * 7 + i, LE(p), { mode: 'sit', expr: typeof expr === 'function' ? expr(r, i) : expr, look: i < row.length / 2 ? 1 : -1, cheer: up ? wav(f, r + i) : undefined }, { blob: false }))));
    if (k === 'hall') { BEN([0.4, 0, -4.1], { expr: 'smile', view: 'front' }); studs((r, i) => ['smile', 'thoughtful', 'bored'][(r + i) % 3]); A.push(TOM(f, LE([-1.0, 0, -2.1]), { expr: 'smile' })); }
    if (k === 'lectern') { BEN([0.4, 0, -4.1], { expr: f < 372 ? 'smile' : 'excited', cheer: 0, view: '34R' }); A.push(TOM(f, LE([1.3, 0, -2.6]), { expr: f < 372 ? 'smile' : 'happy', flip: true })); }
    if (k === 'opposite') { BEN([0.4, 0, -4.1], { expr: 'excited', cheer: 0, prop: 'bigtomato', raise: 1, reach: 0.9, view: '34R' }); }
    if (k === 'chart') { BEN([-0.6, 0, -5.9], { expr: f < 460 ? 'smile' : 'excited', cheer: 0, prop: 'pointer', point: 1, reach: 0.9, view: '34L' }); A.push(TOM(f, LE([-1.3, 0, -5.3]), { expr: 'happy', pose: 'point', flip: true })); }
    if (k === 'cholera') { studs(() => f < 519 ? 'surprised' : 'shock'); A.push(TOM(f, LE([0.32, 1.1, 3.25]), { expr: f < 519 ? 'smile' : 'shock' })); }
    if (k === 'table') A.push(TOM(f, LE([-1.75, 0.86, -3.1]), { expr: f < 580 ? 'happy' : 'proud', pose: 'hold', prop: 'tomato' }, { s: 0.42, blob: false }));
    if (k === 'ketchup') {
      BEN([-1.5, 0, -4.0], { expr: 'happy', prop: 'tomato', raise: 1, reach: 0.8, view: '34R' });
      A.push(TOM(f, LE([-1.05, 0, -2.15]), { expr: f < 624 ? 'smile' : 'triumph', pose: 'hold', prop: 'ketchup', squeeze: q(0.9 * sm(616, 626, f), 0.1) }));
    }
  }
  if (k === 'crazy' || k === 'won') {
    const CAST = ['TOWNWOMAN', 'FARMER', 'TOWNKID', 'STUDENT1', 'STUDENT2', 'BENNETT', 'TOWNWOMAN', 'FARMER', 'STUDENT1', 'TOWNKID'];
    const props = ['tomato', 'tomatobasket', 'tomato', null, 'tomato', 'bigtomato', null, 'tomato', 'tomato', null];
    CROWD.forEach((p, i) => { const pr = props[i]; A.push(P(f, CAST[i], 40 + i, ST(add3(p, hop(f, i))), pr ? { expr: i % 2 ? 'laugh' : 'excited', cheer: 0, prop: pr, raise: 1, reach: 0.85 } : { expr: 'excited', cheer: wav(f, i) })); });
    A.push(TOM(f, k === 'crazy' ? ST([1.2, 0, 2.6]) : ST([-1.4, 0, 2.6]), { expr: 'triumph' }));
  }
  if (k === 'miles') { A.push(P(f, 'MILES', 12, WS([-0.1, 0, -1.45]), { expr: f < 770 ? 'smug' : 'sly', prop: 'pill', reach: 0.5, view: 'front' })); A.push(TOM(f, WS([0.55, 0.92, -0.45]), { expr: 'sly', flip: true }, { s: 0.42, blob: false })); }
  if (k === 'cash') A.push(P(f, 'MILES', 12, WS([1.7, 0, -1.3]), { expr: f < 786 ? 'smug' : 'happy', prop: 'moneybag', count: 1, reach: 0.4, view: '34R' }));
  if (k === 'product') {
    A.push(P(f, 'MILES', 12, WS([-0.25, 0, -0.1]), { expr: f < 843 ? 'smug' : 'excited', cheer: 0, prop: 'pillbottle', label: 'miles', reach: 0.9, view: '34R' }));
    A.push(TOM(f, WS([0.55, 0, 0.5]), { expr: 'happy', variant: 'pill', label: 'miles', pose: 'wave' }));
  }
  if (k === 'rival') { A.push(P(f, 'PHELPS', 13, PR([0.7, 0, -0.5]), { expr: 'mean', prop: 'pillbottle', label: 'phelps', reach: 0.7, view: '34L' })); A.push(TOM(f, PR([-0.4, 0, 0.6]), { expr: 'sly' })); }
  if (k === 'phelps') { A.push(P(f, 'PHELPS', 13, PR([0.55, 0, -0.6]), { expr: 'angry', prop: 'poster', open: 1, label: 'phelps', reach: 0.8, view: '34L' })); }
    if (k === 'split') {
    A.push(P(f, 'MILES', 12, PR([-0.55, 0, -1.3]), { expr: 'angry', prop: 'pillbox', closed: 1, label: 'miles', reach: 0.8, view: '34R' }));
    A.push(P(f, 'PHELPS', 13, PR([0.55, 0, -1.3]), { expr: 'angry', prop: 'pillbox', closed: 1, label: 'phelps', reach: 0.8, view: '34L' }));
  }
  if (k === 'slogan') A.push(TOM(f, ST(add3([-21.3, BW, -4.5], hop(f, 0, 0.08))), { expr: f < 1224 ? 'happy' : 'triumph', variant: 'pill', label: 'pills', pose: f < 1224 ? 'wave' : 'cheer' }));
  if (k === 'signs') A.push(TOM(f, ST([-8.1, BW, -4.2]), { expr: f < 1302 ? 'smile' : 'happy', pose: 'point', flip: true }));
  if (k === 'queue') {
    const QC = ['TOWNWOMAN', 'FARMER', 'STUDENT1', 'TOWNKID', 'STUDENT2', 'BENNETT', 'FARMER', 'TOWNWOMAN'];
    QUEUE.forEach((p, i) => A.push(P(f, QC[i], 50 + i, ST(p), { expr: ['happy', 'excited', 'smile', 'excited', 'laugh', 'smile', 'happy', 'grin'][i], cheer: 0, prop: i % 3 === 0 ? 'pillbox' : i % 3 === 1 ? 'moneybag' : undefined, label: 'pills', reach: 0.6, view: '34L' })));
    A.push(TOM(f, ST([5.6, 0, -3.3]), { expr: 'happy', pose: 'hold', prop: 'pillbox' }));
  }
  if (k === 'problem') A.push(TOM(f, LB([0.15, 0, 0.15]), { expr: f < 1437 ? 'smile' : 'shock' }));
  if (k === 'check') { A.push(P(f, 'CHEMIST', 14, LB([-0.22, 0, 0.1]), { expr: f < 1480 ? 'thoughtful' : 'surprised', prop: 'magnifier', reach: 0.9, view: '34R' })); }
  if (k === 'lax') {
    const x = -2.6 + 0.12 * Math.max(0, f - 1600), ph = (f * 0.09) % 1;
    if (x < 4) A.push(P(f, 'FARMER', 22, ST([x, 0.1 * Math.abs(Math.sin(ph * Math.PI * 2)), -0.5]), { expr: 'pained', tummy: 1, mode: 'run', phase: q(ph, 0.05), view: 'sideR' }));
    A.push(P(f, 'TOWNWOMAN', 21, ST([-1.4, 0, -2.4]), { expr: f < 1600 ? 'smile' : 'surprised', prop: 'pillbottle', label: 'pills', reach: 0.6, view: '34R' }));
    A.push(TOM(f, ST([0.9, 0, 2.6]), { expr: f < 1610 ? 'smile' : 'shock', flip: true }));
  }
  if (k === 'fizzle') { A.push(TOM(f, ST([2.2, 0, 1.6]), { expr: 'sad' })); A.push(P(f, 'TOWNWOMAN', 21, ST([-1.2, 0, -1.8]), { expr: 'bored', view: '34R' })); }
  if (k === 'love') {
    A.push(P(f, 'TOWNKID', 23, ST([-13.1, 0, 0.9]), { expr: 'love', prop: 'tomato', reach: 0.9, view: '34L' }));
    A.push(P(f, 'TOWNWOMAN', 21, ST([-14.5, 0, 0.3]), { expr: 'love', prop: 'tomato', raise: 1, reach: 0.8, view: '34R' }));
    A.push(TOM(f, ST([-12.75, 0, 2.0]), f < 1816 ? { expr: 'love' } : { expr: 'love', pose: 'hold', prop: 'ketchup', squeeze: q(0.8 * sm(1830, 1842, f), 0.1) }));
  }
  if (k === 'diner' || k === 'end') {
    const e = k === 'end';
    A.push(P(f, 'MODERN_KID', 15, DI([0.12, 0, -0.75]), e ? { expr: f < 1975 ? 'happy' : 'excited', cheer: 0, prop: 'ketchup', raise: f >= 1986 ? 1 : undefined, reach: 0.9, view: 'front' } : { expr: 'excited', cheer: 0, prop: 'ketchup', reach: 0.8, view: 'front' }));
    A.push(TOM(f, DI([-0.47, 0.76, -0.2]), e ? { expr: f < 1975 ? 'love' : 'sly' } : { expr: 'happy', pose: 'wave' }, { s: 0.2, blob: false }));
  }
  if (k === 'squeeze') A.push(TOM(f, DI([0.3, 0.76, 0.42]), { expr: f < 1918 ? 'happy' : 'love', pose: 'cheer' }, { s: 0.16, blob: false }));
  return A;
}

// ---------- effects ----------
// screen-anchored placement from the shot's pushed camera at the current frame: ndc (x, y), depth z -> world point; w = ndc half-width -> world size
const ASP = 1080 / 1920; let CURF = 0;
function SB(k, x, y, z) { const c = cam(k, CURF), n = (v) => { const l = Math.hypot(...v); return v.map((u) => u / l); }, fw = n([c.l[0] - c.p[0], c.l[1] - c.p[1], c.l[2] - c.p[2]]), r = n([-fw[2], 0, fw[0]]), u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]], t = Math.tan(c.fov * Math.PI / 360);
  return [0, 1, 2].map((i) => c.p[i] + fw[i] * z + r[i] * x * t * ASP * z + u[i] * y * t * z); }
const SW = (k, w, z) => 2 * w * z * Math.tan(cam(k, CURF).fov * Math.PI / 360) * ASP;
const board = (f, f0, lines, pos, size, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'board', lines, pos, size: size * back(f0, f0 + 12, f) }); };
const sboard = (f, f0, lines, k, x, y, z, w, F2, f1) => board(f, f0, lines, SB(k, x, y, z), SW(k, w, z), F2, f1);
const burst = (f, f0, pos, size, F2, col = '#fff3b0', n = 12) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'burst', t: (f - f0) / n, pos, size, col, rays: 10 }); };
const sburst = (f, f0, k, x, y, z, w, F2, col, n) => burst(f, f0, SB(k, x, y, z), SW(k, w, z), F2, col, n);
const stars = (f, f0, k, x, y, z, w, F2, per = 30) => { if (f >= f0) F2.push({ fx: 'stars', t: ((f - f0) / per) % 1, pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 10, f) }); };
const notes = (f, f0, f1, k, x, y, z, F2, col = '#c0453a') => { if (f < f0 || f >= f1) return; for (let i = 0; i < 3; i++) { const u = ((f - f0) / 24 + i / 3) % 1; F2.push({ fx: 'note', kind: i % 2, pos: SB(k, x + 0.25 * (i - 1), y + u * 0.35, z), size: SW(k, 0.1, z), op: 0.95 * (1 - u), col }); } };
const qmark = (f, f0, k, x, y, z, w, F2) => { if (f >= f0) F2.push({ fx: 'qmark', pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 8, f) }); };
const bubble = (f, f0, lines, tail, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'bubble', lines, tail, pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 8, f) }); };
const puff = (f, f0, k, x, y, z, w, F2, n = 14) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'puff', t: (f - f0) / n, pos: SB(k, x, y, z), size: SW(k, w, z) }); };
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') sboard(f, 6, ['THE', '1830s'], 'hook', 0.45, 0.6, 0.4, 0.38, F2);
  if (k === 'apoth') { sburst(f, 82, 'apoth', 0.0, 0.4, 3, 0.75, F2, '#fff3b0', 14); sboard(f, 82, ['KETCHUP AS', 'MEDICINE'], 'apoth', 0.0, 0.5, 3, 0.48, F2); }
  if (k === 'gloom') sboard(f, 150, ['TOMATOES?', 'NO THANKS'], 'gloom', -0.35, 0.55, 3, 0.42, F2);
  if (k === 'badfor') { qmark(f, 206, 'badfor', 0.5, 0.42, 1.6, 0.12, F2); sboard(f, 224, ['BAD', 'FOR YOU?'], 'badfor', -0.25, 0.55, 2.0, 0.42, F2); }
  if (k === 'hall') sboard(f, 268, ['OHIO,', '1830s'], 'hall', -0.45, 0.5, 4, 0.36, F2);
  if (k === 'lectern') { sboard(f, 318, ['DR. JOHN', 'COOK BENNETT'], 'lectern', -0.45, 0.55, 2.5, 0.44, F2); sboard(f, 350, ['WILLOUGHBY', 'MEDICAL COLLEGE'], 'lectern', 0.42, -0.5, 2.5, 0.4, F2); }
  if (k === 'opposite') { sburst(f, 393, 'opposite', 0.25, 0.25, 1.6, 0.6, F2, '#fff3b0', 14); stars(f, 395, 'opposite', 0.25, 0.4, 1.6, 0.35, F2, 24); sboard(f, 398, ['THE', 'OPPOSITE!'], 'opposite', 0.45, 0.58, 1.6, 0.4, F2); }
  if (k === 'chart') { sboard(f, 465, ['CURES', 'DIARRHEA'], 'chart', 0.45, 0.55, 2.4, 0.4, F2); sboard(f, 489, ['CURES', 'INDIGESTION'], 'chart', 0.45, 0.12, 2.4, 0.4, F2); }
  if (k === 'cholera') { sburst(f, 519, 'cholera', 0.0, 0.35, 1.5, 0.75, F2, '#ffffff', 10); sboard(f, 519, ['EVEN', 'CHOLERA?!'], 'cholera', 0.0, 0.5, 1.5, 0.48, F2); }
  if (k === 'table') { sboard(f, 556, ['EAT THEM', 'RAW'], 'table', -0.5, 0.58, 0.9, 0.36, F2); sboard(f, 582, ['EAT THEM', 'COOKED'], 'table', 0.45, 0.58, 0.9, 0.36, F2); }
  if (k === 'ketchup') { if (f >= 624 && f < 640) F2.push({ fx: 'splash', t: (f - 624) / 16, pos: SB('ketchup', -0.15, 0.1, 2.5), size: SW('ketchup', 0.3, 2.5), tint: '#ff6050' }); sboard(f, 625, ['OR AS', 'KETCHUP!'], 'ketchup', 0.4, 0.55, 2.5, 0.42, F2); }
  if (k === 'crazy') { sburst(f, 684, 'crazy', 0.0, 0.4, 4, 0.8, F2, '#fff3b0', 14); sboard(f, 684, ['TOMATO', 'CRAZY!'], 'crazy', 0.0, 0.52, 4, 0.5, F2); stars(f, 686, 'crazy', 0.0, 0.2, 4, 0.5, F2, 24); }
  if (k === 'miles') { sboard(f, 742, ['ARCHIBALD MILES', 'CLEVELAND, 1837'], 'miles', 0.0, 0.62, 2.6, 0.48, F2); if (f >= 784) F2.push({ fx: 'bulb', t: ((f - 784) / 30) % 1, pos: SB('miles', 0.25, 0.32, 2.6), size: SW('miles', 0.14, 2.6) * back(784, 792, f) }); }
  if (k === 'cash') { sburst(f, 786, 'cash', 0.15, 0.1, 1.0, 0.6, F2, '#ffd84a', 12); stars(f, 788, 'cash', 0.15, 0.25, 1.0, 0.4, F2, 20); }
  if (k === 'rattle') sburst(f, 837, 'rattle', 0.0, 0.0, 0.5, 0.5, F2, '#ffffff', 8);
  if (k === 'product') { sburst(f, 843, 'product', 0.0, 0.45, 1.6, 0.8, F2, '#fff3b0', 14); sboard(f, 846, ["DR. MILES' COMPOUND", 'EXTRACT OF TOMATO'], 'product', 0.0, 0.6, 1.6, 0.52, F2); stars(f, 848, 'product', 0.0, 0.3, 1.6, 0.45, F2, 24); }
  if (k === 'rival') qmark(f, 966, 'rival', 0.45, 0.45, 2.5, 0.12, F2);
  if (k === 'phelps') { sburst(f, 987, 'phelps', 0.0, 0.3, 1.5, 0.75, F2, '#ffffff', 10); sboard(f, 990, ['DR. GUY PHELPS', 'THE RIVAL'], 'phelps', -0.3, 0.6, 1.5, 0.46, F2); }
  if (k === 'ads') sboard(f, 1070, ['THE AD', 'WAR!'], 'ads', 0.0, -0.5, 1.4, 0.4, F2);
  if (k === 'split') { bubble(f, 1124, ["MINE'S REAL!"], 1, 'split', -0.45, 0.42, 1.4, 0.4, F2); bubble(f, 1140, ['NO, MINE!'], -1, 'split', 0.45, 0.3, 1.4, 0.4, F2); sboard(f, 1167, ['THE', 'REAL ONE!'], 'split', 0.0, -0.5, 1.4, 0.42, F2); }
  if (k === 'slogan') { qmark(f, 1194, 'slogan', 0.5, 0.45, 2.2, 0.1, F2); notes(f, 1224, 1270, 'slogan', 0.0, 0.25, 2.2, F2); sboard(f, 1222, ['TOMATO PILLS WILL', 'CURE ALL YOUR ILLS!'], 'slogan', 0.0, 0.58, 2.2, 0.5, F2); }
  if (k === 'signs') { sburst(f, 1302, 'signs', -0.3, 0.35, 3, 0.4, F2, '#ffffff', 8); sburst(f, 1314, 'signs', 0.35, 0.15, 3, 0.4, F2, '#ffffff', 8); sboard(f, 1318, ['PHARMACIES', 'PUT UP SIGNS'], 'signs', 0.0, -0.5, 3, 0.42, F2); }
  if (k === 'queue') { sboard(f, 1345, ['100,000s', 'BOUGHT THEM'], 'queue', -0.3, 0.55, 3, 0.46, F2); stars(f, 1340, 'queue', 0.2, 0.25, 3, 0.4, F2, 24); }
  if (k === 'problem') { sboard(f, 1430, ['ONE', 'PROBLEM...'], 'problem', 0.0, 0.5, 1.0, 0.45, F2); qmark(f, 1437, 'problem', 0.5, 0.15, 1.0, 0.12, F2); }
  if (k === 'check') sboard(f, 1470, ['PEOPLE', 'CHECKED'], 'check', 0.4, 0.58, 1.4, 0.4, F2);
  if (k === 'verdict') sburst(f, 1542, 'verdict', 0.0, 0.3, 4, 0.8, F2, '#ffffff', 12);
  if (k === 'lax') { if (f >= 1623 && f < 1641) F2.push({ fx: 'puff', t: (f - 1623) / 18, pos: ST([-2.6 + 0.12 * 23 - 0.5, 0.5, -0.4]), size: 1.2 }); sboard(f, 1633, ['CUT WITH', 'LAXATIVES?!'], 'lax', -0.3, 0.55, 3, 0.44, F2); }
  if (k === 'fizzle') sboard(f, 1676, ['BY 1850:', 'FIZZLED OUT'], 'fizzle', -0.3, 0.55, 3, 0.42, F2);
  if (k === 'won') { sburst(f, 1728, 'won', 0.0, 0.42, 4, 0.8, F2, '#fff3b0', 14); sboard(f, 1730, ['THE TOMATO', 'WON ANYWAY'], 'won', 0.0, 0.55, 4, 0.5, F2); stars(f, 1730, 'won', 0.0, 0.25, 4, 0.5, F2, 24); }
  if (k === 'love') { stars(f, 1800, 'love', 0.1, 0.35, 2.2, 0.4, F2, 26); sboard(f, 1840, ['ESPECIALLY', 'AS KETCHUP'], 'love', 0.0, 0.58, 2.2, 0.46, F2); }
  if (k === 'diner') sboard(f, 1868, ['NEXT TIME', 'YOU SQUEEZE...'], 'diner', 0.0, 0.58, 0.9, 0.46, F2);
  if (k === 'squeeze') sburst(f, 1902, 'squeeze', -0.2, 0.2, 0.3, 0.4, F2, '#ffffff', 8);
  if (k === 'end') { sboard(f, 1986, ['SOLD AS', 'MEDICINE?!'], 'end', 0.0, 0.58, 0.9, 0.48, F2); sburst(f, 1989, 'end', 0.0, 0.58, 0.9, 0.6, F2, '#fff3b0', 12); stars(f, 1990, 'end', 0.0, 0.35, 0.9, 0.45, F2, 20); }
  return F2;
}
