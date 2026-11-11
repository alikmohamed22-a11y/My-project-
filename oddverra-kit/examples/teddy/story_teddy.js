// [TEDDY-story] "The teddy bear exists because a president refused to shoot a bear" timeline (54.0 s mix, 1620 f @ 30 fps).
// Sets: swamp.js (swamp / camp / willow / newsroom) and brooklyn.js (street / window / shop / kids / world). Pattern: story_castro.js.
// Wholesome: no gun is ever pointed or fired, no animal is harmed; the bear beat ends with TR's palm up ("no") and the bear relieved.
import * as S from './story.js';
const { sm, eo, back, L3, add3, dist, q, person } = S;

// [f0, f1, id, module, set]
const SH = [
  [0, 30, 'hook', 'brooklyn', 'kids'],         // The teddy bear exists
  [30, 57, 'hookbear', 'swamp', 'willow'],     // because a president
  [57, 112, 'hookno', 'swamp', 'willow'],      // refused to shoot a bear.
  [112, 175, 'camp', 'swamp', 'camp'],         // You see, in November 1902,
  [175, 266, 'campfire', 'swamp', 'camp'],     // President Theodore Roosevelt went bear hunting in Mississippi.
  [266, 310, 'days', 'swamp', 'swamp'],        // After days in the swamps,
  [310, 378, 'found', 'swamp', 'swamp'],       // the other hunters had all found bears,
  [378, 423, 'except', 'swamp', 'swamp'],      // except the president.
  [423, 465, 'collier', 'swamp', 'swamp'],     // So his guide, Holt Collier,
  [465, 509, 'track', 'swamp', 'swamp'],       // tracked down a black bear,
  [509, 531, 'corner', 'swamp', 'willow'],     // cornered it,
  [531, 571, 'tied', 'swamp', 'willow'],       // and tied it to a tree.
  [571, 640, 'called', 'swamp', 'willow'],     // Then he called Roosevelt over to finish the job.
  [640, 690, 'looked', 'swamp', 'willow'],     // Roosevelt looked at the tied-up
  [690, 714, 'bearcu', 'swamp', 'willow'],     // bear and
  [714, 747, 'no', 'swamp', 'willow'],         // said no.
  [747, 789, 'sporting', 'swamp', 'willow'],   // Shooting it like that wasn't sporting.
  [789, 852, 'news', 'swamp', 'newsroom'],     // A cartoonist named Clifford Berryman
  [852, 906, 'draw', 'swamp', 'newsroom'],     // heard the story and drew it
  [906, 934, 'front', 'swamp', 'newsroom'],    // for The Washington Post.
  [934, 1012, 'street', 'brooklyn', 'street'], // In Brooklyn, a candy shop owner named Morris Michtom
  [1012, 1051, 'reads', 'brooklyn', 'street'], // saw that cartoon.
  [1051, 1120, 'sew', 'brooklyn', 'shop'],     // His wife, Rose, sewed a little stuffed bear
  [1120, 1195, 'window', 'brooklyn', 'window'],// and they put it in the shop window with a sign,
  [1195, 1224, 'card', 'brooklyn', 'window'],  // "Teddy's Bear."
  [1224, 1266, 'queue', 'brooklyn', 'street'], // People lined up.
  [1266, 1330, 'more', 'brooklyn', 'window'],  // They made more, then more.
  [1330, 1394, 'sign', 'brooklyn', 'shop'],    // Soon, they closed the candy shop and started a
  [1394, 1425, 'toys', 'brooklyn', 'shop'],    // toy company.
  [1425, 1494, 'trend', 'swamp', 'swamp'],     // Roosevelt went hunting to bring home a bear,
  [1494, 1530, 'nursery', 'brooklyn', 'kids'], // and instead, he gave one
  [1530, 1620, 'globe', 'brooklyn', 'world'],  // to every kid on Earth.
];
export const NF = 1620;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
const LIGHT = { kids: 'night', street: 'night', window: 'night', world: 'night', shop: 'office', newsroom: 'office' };
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: LIGHT[s[4]] || 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {}; // no narrator lip-sync, no dialogue
export const setAt = (f) => { const s = segAt(f); return [s[3], s[4]]; };

// ---------- places (world coords from the set modules' local frames) ----------
const at = (o) => (p) => [p[0] + o[0], p[1] + o[1], p[2] + o[2]];
const SW = at([-3200, 0, -3200]), CP = at([-3500, 0, -3200]), WL = at([-3800, 0, -3200]), NR = at([-4100, 0, -3200]);
const BS = at([3200, 0, -3200]), BP = at([3200, 0, -3300]), BK = at([3200, 0, -3400]), BW = at([3200, 0, -3500]);
// swamp trail (copied from swamp.js so feet sit on the ridge)
const cA = (z) => -1.6 + 1.4 * Math.sin(z * 0.1 + 0.5), tC = (z) => cA(z) + 3.1 + 0.4 * Math.sin(z * 0.23);
const TR_ = (z, dx = 0) => SW([tC(z) + dx, 0.08, z]);
// willow set
const BEARW = WL([0.25, 0, -0.15]), TRW = WL([2.7, 0, 2.7]), COLW = WL([-2.2, 0, 2.8]), TRHOOK = WL([1.6, 0, 1.6]);
// brooklyn
const QUEUE = Array.from({ length: 10 }, (_, i) => BS([1.9 + i * 0.78, 0.16, -5.2 + (i % 2) * 0.12]));

// ---------- cameras ----------
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp });
const V = {
  hook: C(BK([0.35, 1.05, 1.15]), BK([-1.15, 0.85, -1.3]), 40, 7, BK([-1.15, 1.0, -1.3])),
  hookbear: C(WL([0.32, 0.95, 2.4]), WL([0.25, 0.85, -0.15]), 38, 7, WL([0.25, 0.95, -0.15])),
  hookno: C(WL([1.25, 1.3, 7.6]), WL([1.2, 1.0, 0.6]), 40, 6, WL([1.6, 1.4, 1.6])),
  camp: C(CP([1.0, 1.55, 10.5]), CP([0.6, 2.0, -4]), 50, 3, CP([0.2, 1.0, 1.2])),
  campfire: C(CP([2.2, 1.45, 6.2]), CP([0.6, 1.1, 0.6]), 42, 5, CP([1.5, 1.4, 1.6])),
  days: C(SW([2.6, 1.5, 10.5]), SW([1.6, 1.6, -4]), 46, 3, TR_(1)),
  found: C(add3(TR_(12), [0.3, 1.5, 0]), SW([2.0, 1.3, -4]), 44, 3, TR_(5)),
  except: C(SW([3.1, 1.45, 5.6]), SW([2.3, 1.15, 1.0]), 40, 6, add3(TR_(1.5), [0, 1.4, 0])),
  collier: C(SW([3.6, 1.3, 7.8]), SW([2.4, 1.2, 1.5]), 40, 5, add3(TR_(3), [0, 1.4, 0])),
  track: C(SW([2.0, 1.0, 9.5]), SW([2.8, 1.0, 2.0]), 44, 5, add3(TR_(4.5), [0, 1.2, 0])),
  corner: C(WL([-0.3, 1.3, 6.8]), WL([-0.4, 0.95, 0.3]), 42, 5, WL([0.25, 0.9, -0.15])),
  tied: C(WL([-0.25, 1.25, 6.4]), WL([-0.35, 0.9, 0.0]), 40, 5, WL([0.25, 0.85, -0.15])),
  called: C(WL([0.5, 1.8, 11.5]), WL([0.4, 1.3, -1]), 46, 2.5, WL([0.4, 0.8, 1.5])),
  looked: C(WL([2.9, 1.45, 7.4]), WL([1.0, 1.0, 0.8]), 40, 5, add3(TRHOOK, [0, 1.4, 0])),
  bearcu: C(WL([0.38, 0.95, 2.2]), WL([0.25, 0.85, -0.15]), 38, 7, WL([0.25, 0.95, -0.15])),
  no: C(WL([1.25, 1.3, 7.6]), WL([1.2, 1.0, 0.6]), 40, 6, WL([1.6, 1.4, 1.6])),
  sporting: C(WL([0.7, 1.45, 8.6]), WL([0.7, 1.1, 1.6]), 46, 5, WL([0.6, 1.4, 1.8])),
  news: C(NR([0.6, 1.5, 5.8]), NR([3.1, 1.0, 2.4]), 42, 4, NR([2.99, 1.2, 2.95])),
  draw: null, // view 14 (computed by swamp.js from the sheet's world matrix)
  front: C(NR([-2.4, 1.95, 3.86]), NR([-2.4, 0.757, 3.62]), 46, 7, NR([-2.4, 0.76, 3.62])),
  street: C(BS([9.5, 1.55, 5.2]), BS([-1.2, 3.6, -6.2]), 50, 2.5, BS([1.5, 1.2, -5.6])),
  reads: C(BS([1.6, 1.45, -1.6]), BS([-0.4, 1.35, -5.55]), 40, 5, BS([-0.4, 1.45, -5.55])),
  sew: C(BP([3.0, 1.55, 1.9]), BP([1.9, 1.05, -1.6]), 44, 5, BP([2.15, 1.1, -2.0])),
  window: C(BS([-1.25, 1.55, -2.3]), BS([-1.25, 1.3, -7.0]), 38, 5, BS([-1.25, 1.2, -7.0])),
  card: C(BS([-0.75, 1.22, -4.7]), BS([-1.05, 1.06, -7.0]), 34, 8, BS([-1.2, 1.15, -7.1])),
  queue: C(BS([6.5, 1.5, 0.5]), BS([2.5, 1.4, -5.5]), 44, 3, BS([4.0, 1.3, -5.2])),
  more: C(BS([-1.25, 1.45, -3.3]), BS([-1.25, 1.3, -7.0]), 40, 5, BS([-1.25, 1.2, -7.0])),
  sign: C(BP([-1.6, 1.85, 1.9]), BP([-2.3, 2.45, -2.6]), 46, 4, BP([-2.3, 3.0, -2.6])),
  toys: C(BP([-1.0, 1.7, 4.0]), BP([2.0, 1.35, -2.8]), 50, 3, BP([1.0, 1.3, 0.6])),
  trend: C(SW([3.4, 1.4, 9.0]), SW([2.6, 1.2, 2.0]), 40, 5, add3(TR_(4), [0, 1.4, 0])),
  nursery: C(BK([0.8, 1.4, 2.9]), BK([-1.35, 0.95, -2.0]), 52, 3, BK([-1.15, 1.0, -1.3])),
  globe: C(BW([0, 6.0, 27]), BW([0, 5.4, 0]), 40, 2, BW([0, 5.6, 4.6])),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]]; return { ...v, p: add3(v.p, d.map((x) => x * k * t)) }; };
const PUSH = { hook: 0.14, hookbear: 0.12, hookno: 0.1, camp: 0.06, campfire: 0.08, days: 0.05, found: 0.06, except: 0.12, collier: 0.08, track: 0.06, corner: 0.08, tied: 0.1,
  called: 0.06, looked: 0.1, bearcu: 0.14, no: 0.12, sporting: 0.1, news: 0.08, draw: 0.1, front: 0.1, street: 0.06, reads: 0.1, sew: 0.1, window: 0.1, card: 0.14, queue: 0.06,
  more: 0.1, sign: 0.06, toys: 0.08, trend: 0.08, nursery: 0.12, globe: 0.1 };
let DRAWV = null; // view 14 from swamp.js (filled by worldAt on the first frame; fallback below)
function cam(k, f) {
  const s = segAt(f); let v = V[k];
  if (k === 'draw') v = DRAWV || C(NR([3.0, 1.7, 2.8]), NR([3.4, 1.0, 2.2]), 34, 7, NR([3.4, 1.0, 2.2]));
  let c = push(v, PUSH[k] || 0.08, s[0], s[1], f);
  if (k === 'hookno') { const t = eo(60, 68, f); c = { ...c, fov: c.fov * (1 - 0.18 * t) }; } // punch-in on "refused" (ting 2.0 s)
  if (k === 'no') { const t = eo(720, 727, f); c = { ...c, fov: c.fov * (1 - 0.16 * t) }; } // punch-in on "no" (ting 24.0 s)
  if (k === 'front') { const t = eo(909, 915, f); c = { ...c, fov: c.fov * (1 - 0.14 * t) }; const kk = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - 909) / 6))) * 0.01; c.l = add3(c.l, [0, kk, 0]); } // press thump 30.3 s
  if (k === 'more') for (const b of [1266, 1302]) { const kk = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - b) / 6))) * 0.012; c = { ...c, l: add3(c.l, [0, kk, 0]) }; } // bonk kicks
  if (k === 'globe') { const t = eo(1536, 1560, f); c = { ...c, fov: c.fov * (1 + 0.08 * t) }; } // little pull-back as the bears pop
  return c;
}
const CUTS = SH.slice(1).map((s) => s[0]);
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[112, 0.9, 12], [789, 0.85, 10], [934, 0.9, 12], [1425, 0.8, 10], [1494, 0.85, 10], [1530, 0.5, 8]]) if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state (set animations; main shows the set after worldAt) ----------
let ROPE = null;
export function worldAt(f, w) {
  const s = segAt(f), k = s[2], SWM = w.swamp, B = w.brooklyn;
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  if (SWM) {
    if (!DRAWV && SWM.views && SWM.views[14]) { const v = SWM.views[14]; DRAWV = C(v.p, v.l, v.fov, v.cInf, v.l); }
    // willow: the cast BEAR actor replaces the set's bear card (and its rope tube); the rope wrap on the trunk stays
    SWM.bear.visible = false;
    if (ROPE === null) { const ch = SWM.groups.willow.children, wrap = ch.find((o) => o.isMesh && o.geometry && o.geometry.type === 'TorusGeometry' && Math.abs(o.geometry.parameters.radius - 0.47) < 1e-3); ROPE = (wrap && ch.find((o) => o !== wrap && o.isMesh && o.material === wrap.material)) || 0; if (ROPE) ROPE.userData.wrap = wrap; }
    if (ROPE) { ROPE.visible = false; if (ROPE.userData.wrap) ROPE.userData.wrap.visible = k !== 'corner'; }
    const dr = k === 'news' ? 0.25 * sm(828, 852, f) : k === 'draw' ? 0.25 + 0.75 * sm(852, 896, f) : 1;
    SWM.setDrawing(dr, { pen: false });
  }
  if (B) {
    B.setSnow(['street', 'reads', 'window', 'queue', 'more', 'card'].includes(k) ? (f - 900) / 30 : null);
    B.setWindowBears(k === 'more' ? (f < 1266 ? 1 : f < 1302 ? 8 : 19) : 1);
    B.setShopBears(k === 'sew' ? 0 : k === 'sign' ? 30 : k === 'toys' ? 52 : 6);
    B.setSign(k === 'sign' ? sm(1356, 1370, f) : k === 'toys' ? 1 : 0);
    B.setGlobeBears(k === 'globe' ? sm(1536, 1590, f) : 0);
    B.setGlobeSpin(k === 'globe' ? (f - 1530) * 0.004 : 0);
  }
}

// ---------- actors ----------
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const walk = (f, o, seed, a, b, f0, f1, opts = {}, extra = {}) => person(f, o, seed, L3(a, b, sm(f0, f1, f)), opts, extra);
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
const shake = (f, f0, f1) => (f >= f0 && f < f1 ? q(9 * Math.sin((f - f0) * 0.55), 1) : 0); // head shake "no"
// the cast bear (bear.js): s scales the card (a sitting bear ~1.2 u tall)
const BEARA = (f, pos, opts = {}, extra = {}) => ({ o: 'BEAR', k: 2, pos, roll: 0, s: extra.s || 0.85, blob: extra.blob ?? true, opts: { seed: 3, pose: 'sit', expr: 'worried', ...opts } });
// walking bear: faces its screen direction (camera right vector), never hard-coded
function bearWalk(f, a, b, f0, f1, opts = {}, extra = {}) {
  const c = camAt(f), fw = [c.l[0] - c.p[0], c.l[2] - c.p[2]], right = [-fw[1], fw[0]], d = [b[0] - a[0], b[2] - a[2]];
  const flip = d[0] * right[0] + d[1] * right[1] < 0, t = sm(f0, f1, f), moving = f > f0 && f < f1;
  return BEARA(f, L3(a, b, t), { pose: moving ? 'walk' : 'stand', phase: q(((f * 0.045) % 1), 0.05), flip, ...opts }, extra);
}
const TR = (f, pos, opts = {}, extra = {}) => person(f, 'TR', 11, pos, opts, extra);
const COL = (f, pos, opts = {}, extra = {}) => person(f, 'COLLIER', 12, pos, opts, extra);
const CUSTS = ['CUST0', 'CUST2', 'CUST1', 'CUST3', 'CUST5', 'BKQ1', 'CUST4', 'BKQ2', 'BKQ5', 'BKQ6'];

export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') A.push(P(f, 'KID1', 81, BK([-1.15, 0, -1.3]), { expr: 'happy', hug: 1, view: 'front' }));
  if (k === 'hookbear') A.push(BEARA(f, BEARW, { expr: 'worried', look: 0.6, rope: true, ropeTo: [-230, -330] }));
  if (k === 'hookno' || k === 'no') {
    const f0 = k === 'hookno' ? 60 : 720, rel = k === 'no' && f >= 733;
    A.push(BEARA(f, BEARW, { expr: rel ? 'relieved' : f >= f0 ? 'surprised' : 'worried', look: rel ? 0 : 0.6, rope: true, ropeTo: [-230, -330] }));
    A.push(TR(f, TRHOOK, { expr: f < f0 ? 'calm' : 'smile', view: f >= f0 - 2 ? 'front' : '34L', wave: f >= f0 - 2 ? 1 : undefined, headTilt: shake(f, f0 + 2, f0 + 30), look: f >= f0 + 2 && f < f0 + 30 ? q(0.8 * Math.sin((f - f0 - 2) * 0.55), 0.25) : -0.6 }));
  }
  if (k === 'camp') {
    A.push(TR(f, CP([1.5, 0, 1.6]), { expr: 'grin', view: '34L' }));
    A.push(P(f, 'GOVERNOR', 13, CP([-1.4, 0, 1.5]), { expr: 'smile', view: '34R' }));
    A.push(P(f, 'HUNTER1', 14, CP([0.2, 0, -1.0]), { expr: 'happy', view: 'front' }));
    A.push(P(f, 'HUNTER2', 15, CP([3.0, 0, -0.8]), { expr: 'smile', view: '34L' }));
    A.push(P(f, 'HUNTER3', 16, CP([-2.5, 0, -1.7]), { expr: 'grin', view: '34R' }));
  }
  if (k === 'campfire') {
    A.push(TR(f, CP([1.5, 0, 1.6]), { expr: f < 216 ? 'grin' : 'excited', view: '34L', cheer: f >= 216 && f < 250 ? wav(f, 0, 0.35) : undefined }));
    A.push(P(f, 'GOVERNOR', 13, CP([-0.6, 0, 1.9]), { expr: f < 210 ? 'smile' : 'happy', view: '34R', wave: f > 196 && f < 214 ? wav(f, 1) : undefined }));
    A.push(P(f, 'HUNTER2', 15, CP([-0.4, 0, -1.2]), { expr: 'grin', view: 'front' }));
  }
  if (k === 'days') ['HUNTER1', 'HUNTER2', 'TR', 'HUNTER3'].forEach((o, i) => { const z0 = -3 - i * 1.2, z1 = 5 - i * 1.2; A.push(walk(f, o, 14 + i, TR_(z0, (i % 2) * 0.35 - 0.15), TR_(z1, (i % 2) * 0.35 - 0.15), 266, 310, { expr: 'calm' })); });
  if (k === 'found') {
    A.push(P(f, 'HUNTER1', 14, TR_(6.2, -0.3), { expr: f < 343 ? 'smile' : 'excited', view: '34L', wave: f >= 343 ? wav(f, 0) : undefined }));
    A.push(P(f, 'HUNTER2', 15, TR_(5.0, 0.55), { expr: f < 348 ? 'smile' : 'laugh', view: '34L', cheer: f >= 348 ? wav(f, 2) : undefined }));
    A.push(P(f, 'HUNTER3', 16, TR_(3.6, -0.1), { expr: f < 352 ? 'grin' : 'excited', view: '34R', wave: f >= 352 ? wav(f, 3) : undefined }));
  }
  if (k === 'except') A.push(TR(f, TR_(1.5), { expr: f < 396 ? 'smile' : f < 412 ? 'surprised' : 'sad', view: 'front', look: f < 396 ? q(0.9 * Math.sin(f * 0.12), 0.25) : 0, headTilt: f >= 400 ? -6 : 0 }));
  if (k === 'collier') A.push(walk(f, 'COLLIER', 12, TR_(-2.0), TR_(3.0), 423, 462, { expr: 'calm' }));
  if (k === 'track') A.push(walk(f, 'COLLIER', 12, TR_(-1.0, -0.2), TR_(4.3, 0.1), 465, 505, { expr: 'smile' }));
  if (k === 'corner') {
    A.push(BEARA(f, WL([0.45, 0, 0.0]), { pose: 'stand', expr: 'surprised', flip: true }, { s: 0.75 }));
    A.push(COL(f, WL([-1.0, 0, 1.0]), { expr: 'calm', view: '34R', prop: 'rope', reach: 0.6 }));
  }
  if (k === 'tied') {
    A.push(BEARA(f, BEARW, { expr: 'worried', look: f < 548 ? -0.6 : 0.3, rope: true, ropeTo: [-230, -330] }));
    A.push(COL(f, WL([-0.95, 0, 1.0]), { expr: f < 545 ? 'calm' : 'smile', view: '34R' }));
  }
  if (k === 'called') {
    A.push(BEARA(f, BEARW, { expr: 'worried', look: f > 600 ? 0.6 : 0, rope: true, ropeTo: [-230, -330] }));
    A.push(COL(f, WL([-1.0, 0, 2.6]), { expr: 'smile', view: '34R', wave: f >= 580 && f < 625 ? wav(f, 0, 0.35) : undefined }));
    A.push(walk(f, 'TR', 11, WL([4.6, 0, 3.4]), TRHOOK, 586, 636, { expr: 'smile' }));
  }
  if (k === 'looked') {
    A.push(BEARA(f, BEARW, { expr: 'worried', look: 0.6, rope: true, ropeTo: [-230, -330] }));
    A.push(TR(f, TRHOOK, { expr: f < 668 ? 'calm' : 'worried', view: '34L', look: -0.8, headTilt: f > 672 ? 7 : 0 }));
  }
  if (k === 'bearcu') A.push(BEARA(f, BEARW, { expr: 'worried', look: q(0.6 + 0.2 * Math.sin(f * 0.2), 0.1), rope: true, ropeTo: [-230, -330] }));
  if (k === 'sporting') {
    A.push(BEARA(f, BEARW, { expr: 'relieved', rope: true, ropeTo: [-230, -330] }));
    A.push(TR(f, TRHOOK, { expr: f < 770 ? 'calm' : 'smile', view: '34L', wave: f >= 760 ? 0.85 : undefined, headTilt: shake(f, 750, 772), look: -0.4 }));
    A.push(COL(f, WL([-0.15, 0, 2.0]), { expr: f < 777 ? 'calm' : 'happy', view: '34R', headTilt: f >= 777 ? q(5 * Math.sin((f - 777) * 0.5), 1) : 0 }));
  }
  if (k === 'news') A.push(P(f, 'BERRYMAN', 21, NR([2.99, 0, 2.95]), { expr: f < 828 ? 'calm' : 'smile', mode: 'sit', view: '34R', prop: 'pen', reach: f >= 828 ? q(0.6 + 0.12 * Math.sin(f * 0.5), 0.05) : 0.3 }));
  if (k === 'street') {
    const out = f >= 966;
    A.push(walk(f, 'MORRIS', 31, BS([1.45, 0.16, -6.2]), BS([-0.4, 0.16, -5.55]), 966, 996, { expr: 'smile', prop: out ? 'newspaper' : undefined, reach: 0.4 }));
    A.push(walk(f, 'CUST2', 42, BS([9.0, 0.16, -4.9]), BS([4.0, 0.16, -4.9]), 934, 1012, { expr: 'smile' }));
    A.push(walk(f, 'CUST0', 41, BS([-4.0, 0.16, -5.0]), BS([1.0, 0.16, -4.7]), 934, 1012, { expr: 'happy' }));
  }
  if (k === 'reads') A.push(P(f, 'MORRIS', 31, BS([-0.4, 0.16, -5.55]), { expr: f < 1022 ? 'calm' : f < 1030 ? 'surprised' : 'excited', view: '34R', prop: 'newspaper', reach: 0.7 }));
  if (k === 'sew') A.push(P(f, 'ROSE', 32, BP([2.15, 0, -2.02]), { expr: f < 1110 ? 'smile' : 'happy', view: 'front', prop: f < 1112 ? 'needle' : 'teddy', reach: f < 1112 ? q(0.55 + 0.15 * Math.sin(f * 0.8), 0.05) : 0.7 }));
  if (k === 'window') {
    A.push(P(f, 'CUST1', 43, BS([-1.85, 0.16, -5.25]), { expr: 'excited', view: 'back' }));
    A.push(P(f, 'CUST4', 44, BS([-0.7, 0.16, -5.15]), { expr: 'happy', view: 'back' }));
  }
  if (k === 'queue') CUSTS.forEach((o, i) => { const p1 = QUEUE[i], p0 = add3(p1, [4.0 + i * 0.4, 0, 0.6]); A.push(walk(f, o, 50 + i, p0, p1, 1220 + i * 3, 1248 + i * 2, { expr: ['excited', 'happy', 'grin', 'smile'][i % 4], wave: f > 1252 && i % 3 === 0 ? wav(f, i) : undefined })); });
  if (k === 'toys') {
    A.push(P(f, 'MORRIS', 31, BP([1.2, 0, -1.2]), { expr: 'excited', view: '34R', cheer: f >= 1401 ? wav(f, 0) : undefined }));
    A.push(P(f, 'ROSE', 32, BP([0.45, 0, -1.3]), { expr: 'laugh', view: '34L', prop: 'teddy', reach: 0.7 }));
  }
  if (k === 'trend') A.push(walk(f, 'TR', 11, TR_(-3.0), TR_(3.6), 1425, 1488, { expr: 'grin' }));
  if (k === 'nursery') {
    A.push(P(f, 'KID1', 81, BK([-1.15, 0, -1.3]), { expr: 'happy', hug: 1, view: 'front' }));
    A.push(P(f, 'KID2', 82, BK([-0.3, 0, -0.9]), { expr: f < 1510 ? 'smile' : 'laugh', hug: 1, view: '34L' }));
  }
  if (k === 'globe') {
    const ch = f >= 1548;
    A.push(P(f, 'KID0', 80, BW([-2.6, 0.4, 5.6]), { expr: ch ? 'laugh' : 'happy', hug: ch ? undefined : 1, cheer: ch ? wav(f, 0) : undefined, view: 'front' }));
    A.push(P(f, 'KID3', 83, BW([-1.2, 0.4, 6.4]), { expr: 'happy', hug: 1, view: 'front' }));
    A.push(P(f, 'KID4', 84, BW([1.2, 0.4, 6.4]), { expr: ch ? 'excited' : 'smile', hug: 1, view: 'front' }));
    A.push(P(f, 'KID5', 85, BW([2.6, 0.4, 5.6]), { expr: ch ? 'laugh' : 'happy', hug: ch ? undefined : 1, cheer: ch ? wav(f, 2) : undefined, view: 'front' }));
  }
  return A;
}

// ---------- effects ----------
const board = (f, f0, lines, pos, size, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'board', lines, pos, size: size * back(f0, f0 + 12, f) }); };
const burst = (f, f0, pos, size, F2, col = '#fff3b0', n = 12) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'burst', t: (f - f0) / n, pos, size, col, rays: 10 }); };
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = [];
  if (k === 'hook') F2.push({ fx: 'stars', t: (f / 30) % 1, pos: BK([-1.15, 1.55, -1.25]), size: 0.5 });
  if (k === 'hookno') burst(f, 60, add3(TRHOOK, [0.35, 1.9, 0.05]), 0.6, F2);
  if (k === 'no') burst(f, 720, add3(TRHOOK, [0.35, 1.9, 0.05]), 0.6, F2);
  if (k === 'no' && f >= 733) F2.push({ fx: 'stars', t: ((f - 733) / 24) % 1, pos: WL([0.25, 1.45, -0.1]), size: 0.45 });
  if (k === 'camp') board(f, 124, ['MISSISSIPPI', 'NOVEMBER 1902'], CP([-0.3, 3.4, -1.5]), 2.0, F2);
  if (k === 'campfire') board(f, 182, ['PRESIDENT', 'T. ROOSEVELT'], CP([1.2, 2.2, 1.3]), 0.8, F2);
  if (k === 'campfire' && f >= 214 && f < 250) for (let i = 0; i < 3; i++) { const u = ((f - 214) / 22 + i / 3) % 1; F2.push({ fx: 'note', kind: i % 2, pos: CP([-0.2 + Math.sin(u * 6 + i) * 0.2, 1.9 + u * 0.7, -1.1]), size: 0.25, op: 1 - u }); } // hunting horn
  if (k === 'days') { const d = 1 + Math.min(3, Math.floor(Math.max(0, f - 272) / 9)); board(f, 270, ['DAY', String(d)], SW([1.9, 2.25, 4.5]), 1.0, F2); }
  if (k === 'found') for (const [c, p] of [[343, SW([2.6, 2.3, 4.6])], [352, SW([3.4, 2.2, 3.6])]]) burst(f, c, p, 1.0, F2, '#ffffff', 10);
  if (k === 'except') board(f, 397, ['BEARS FOUND', 'TR: 0'], add3(TR_(1.0), [0.25, 2.2, -0.4]), 0.8, F2);
  if (k === 'except' && f >= 398) F2.push({ fx: 'qmark', pos: add3(TR_(1.5), [-0.45, 2.05, 0.05]), size: 0.26 * back(398, 408, f) });
  if (k === 'collier') board(f, 445, ['HOLT COLLIER', 'THE GUIDE'], add3(TR_(1.0), [0.2, 2.6, -0.6]), 1.0, F2);
  if (k === 'track') for (let i = 0; i < 2; i++) { const u = sm(465, 505, f); F2.push({ fx: 'dog', v: i, k: Math.floor(f / 4 + i) % 2, pos: add3(L3(TR_(-0.2 + i * 0.8, 0.6), TR_(5.0 + i * 0.6, 0.7), u), [0, 0.3, 0]), size: 0.7 }); }
  if (k === 'corner') burst(f, 512, WL([0.35, 1.25, 0.05]), 0.6, F2, '#ffffff', 10);
  if (k === 'tied') burst(f, 531, WL([0.0, 0.85, -0.6]), 0.5, F2, '#ffe6c8', 10);
  if (k === 'sporting') board(f, 774, ['NOT', 'SPORTING'], WL([0.6, 2.45, 1.4]), 0.9, F2);
  if (k === 'news') board(f, 830, ['CLIFFORD', 'BERRYMAN'], NR([2.8, 1.95, 2.4]), 0.7, F2);
  if (k === 'front') burst(f, 909, NR([-2.18, 0.8, 3.48]), 0.22, F2, '#ffffff', 10);
  if (k === 'street') board(f, 942, ['BROOKLYN', '1902'], BS([1.2, 4.6, -5.5]), 1.9, F2, 986);
  if (k === 'street') board(f, 990, ['MORRIS', 'MICHTOM'], BS([-0.3, 2.85, -5.3]), 1.2, F2);
  if (k === 'reads') { burst(f, 1029, BS([-0.25, 2.25, -5.45]), 0.6, F2); if (f >= 1031) F2.push({ fx: 'stars', t: ((f - 1031) / 24) % 1, pos: BS([-0.4, 2.15, -5.5]), size: 0.5 }); }
  if (k === 'sew') board(f, 1078, ['ROSE', 'MICHTOM'], BP([2.0, 2.05, -2.3]), 0.6, F2);
  if (k === 'sew' && f >= 1086 && f < 1134) for (let i = 0; i < 3; i++) { const u = ((f - 1086) / 20 + i / 3) % 1; F2.push({ fx: 'puff', t: u, pos: BP([1.95 + (i - 1) * 0.12, 0.95 + u * 0.4, -1.3]), size: 0.15 + u * 0.12, tint: '#f6f0e4', op: 0.8 * (1 - u) }); }
  if (k === 'sew') burst(f, 1113, BP([2.3, 1.15, -1.9]), 0.5, F2);
  if (k === 'card') { burst(f, 1195, BS([-0.88, 1.0, -6.85]), 0.45, F2, '#fff3b0', 14); if (f >= 1197) F2.push({ fx: 'stars', t: ((f - 1197) / 24) % 1, pos: BS([-0.88, 1.12, -6.8]), size: 0.4 }); }
  if (k === 'more') for (const c of [1266, 1302]) burst(f, c, BS([-1.25, 1.7, -6.9]), 1.1, F2, '#ffffff', 10);
  if (k === 'more') board(f, 1268, [f < 1302 ? 'MORE...' : '...AND MORE!'], BS([-1.25, 1.95, -6.4]), 0.7, F2);
  if (k === 'sign') burst(f, 1368, BP([-2.3, 3.1, -2.4]), 0.9, F2, '#ffffff', 10);
  if (k === 'toys') { burst(f, 1401, BP([-2.3, 3.1, -2.4]), 1.0, F2, '#fff3b0', 14); if (f >= 1403) F2.push({ fx: 'stars', t: ((f - 1403) / 24) % 1, pos: BP([1.5, 2.3, 0.4]), size: 0.6 }); }
  if (k === 'trend') board(f, 1458, ['GOAL:', 'BRING HOME A BEAR'], add3(TR_(4.5), [-0.15, 2.0, 0]), 1.1, F2);
  if (k === 'nursery') F2.push({ fx: 'stars', t: (f / 30) % 1, pos: BK([-0.5, 1.75, -0.9]), size: 0.6 });
  if (k === 'globe') { burst(f, 1536, BW([0, 5.6, 4.8]), 4.5, F2, '#fff3b0', 16); if (f >= 1540) F2.push({ fx: 'stars', t: ((f - 1540) / 30) % 1, pos: BW([0, 10.6, 3.0]), size: 3.0 }); }
  if (k === 'globe') board(f, 1562, ['EVERY KID', 'ON EARTH'], BW([0, 11.3, 2.0]), 3.2, F2);
  return F2;
}
