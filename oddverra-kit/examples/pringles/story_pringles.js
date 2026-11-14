// [PR-story] "The man who designed the Pringles can is buried in one" timeline (58.59 s voice, 1758 f @ 30 fps).
// Sets: pr_sets.js (lab / store / home / cemetery / blueprint) through setAt. Pattern: story_nintendo.js (slow push per shot, zoom-through
// whips on cuts, screen-pinned boards / bursts / stamps, punch-ins on beats). CHIPPY (a living saddle chip) is the sidekick; the generic
// STAX-A-LOT tube is the motif: buried in the hook, invented in the lab, launched in 1968, on the mantel, chosen in 2008, buried at sunset.
// No real brand art: on-screen words never show the brand name (only the narration says it).
import * as S from './story.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]                                     narration (word frames from work/words_frames.txt)
const SH = [
  [0, 134, 'hook', 'cemNoon'],      // The man who designed the Pringles can is buried in one. Well, partly.  (designed 19, can 43, buried 60, one 74, well 87, partly 108)
  [134, 309, 'lab', 'labDay'],      // In the 1950s, Procter and Gamble gave a chemist named Fredric Baur a job: fix the potato chip.  (1950s 139, Procter 174, chemist 202, Fredric 222, job 253, fix 271, chip 292)
  [309, 441, 'bags', 'labDay'],     // Bags of chips were greasy, half full of air, and packed with broken crumbs.  (greasy 332, half 354, air 370, broken 406, crumbs 416)
  [441, 576, 'shape', 'labDay'],    // So Baur's team made every chip the exact same shape: a curved saddle.  (every 474, same 511, shape 520, curved 541, saddle 551)
  [576, 731, 'math', 'blue'],       // Mathematicians call it a hyperbolic paraboloid. It's sturdy, and it stacks perfectly.  (hyperbolic 606, paraboloid 624, sturdy 655, stacks 685, perfectly 696)
  [731, 810, 'tube', 'labLate'],    // Then Baur designed a tall tube to hold the stack.  (designed 749, tall 765, tube 774, stack 801)
  [810, 888, 'patent', 'labLate'],  // He filed the patent in 1966,  (filed 820, patent 833, 1966 848)
  [888, 984, 'launch', 'store68'],  // and in 1968, the chips launched in Indiana.  (1968 892, launched 932, Indiana 950)
  [984, 1166, 'proud', 'home80'],   // Baur was so proud of that can, he told his family he wanted to be buried in it. They chuckled. He meant it.  (proud 1004, can 1023, family 1053, buried 1082, chuckled 1107, meant 1133)
  [1166, 1301, 'promise', 'homeNight'], // You see, when he died in 2008, at 89, his kids kept the promise.  (2008 1200, 89 1232, kids 1259, promise 1283)
  [1301, 1475, 'store', 'store08'], // On the way to the funeral home, they stopped at a drugstore for a can, and reportedly argued about the flavor.  (funeral 1316, drugstore 1359, can 1379, reportedly 1409, argued 1425, flavor 1452)
  [1475, 1521, 'orig', 'store08'],  // They went with Original.  (Original 1491)
  [1521, 1664, 'rest', 'cemGold'],  // Some of his ashes went into the can, the rest into an urn, buried right beside it.  (ashes 1532, can 1561, urn 1604, beside 1631)
  [1664, 1758, 'payoff', 'cemGold'], // Talk about being buried in your work.  (buried 1683, work 1702)
];
export const NF = 1758;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['pr', segAt(f)[3]];

// ---------- places (set-local -> world)
const O = { lab: [-82000, 0, 0], store: [-82000, 0, 800], home: [-82000, 0, 1600], cem: [-84500, 0, 0], blue: [-84500, 0, 800] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const LBa = at(O.lab), SRa = at(O.store), HMa = at(O.home), CMa = at(O.cem), BLa = at(O.blue);
const LB = (x, z, h = 0) => LBa(x, h, z), SR = (x, z, h = 0) => SRa(x, h, z), HM = (x, z, h = 0) => HMa(x, h, z), CM = (x, z, h = 0) => CMa(x, h, z), BL = (x, z, h = 0) => BLa(x, h, z);
const BY = 0.92, BZ = -1.4; // lab bench top / centre line

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(CMa(-0.05, -0.5, 1.95), CMa(0.0, -0.7, 0.55), 44, 2.0, CMa(0.0, -0.75, 0.55)),
  lab: C(LBa(0.9, 1.55, 2.7), LBa(0.0, 1.25, -1.8), 46, 1.2, LBa(0.1, 1.2, -2.0)),
  bags: C(LBa(0.72, 1.32, -0.15), LBa(0.98, 1.0, -1.5), 42, 2.6, LBa(1.0, 1.0, -1.5)),
  shape: C(LBa(-0.2, 1.5, -0.62), LBa(-0.3, 0.92, -1.45), 42, 3.0, LBa(-0.3, 0.95, -1.45)),
  math: C(BLa(0.45, 2.1, 3.1), BLa(0.35, 1.0, -1.0), 46, 1.4, BLa(0.3, 1.1, -1.0)),
  tube: C(LBa(0.6, 1.36, -0.62), LBa(0.42, 1.14, -1.5), 42, 3.0, LBa(0.42, 1.12, -1.5)),
  patent: C(LBa(3.05, 1.45, 1.45), LBa(2.8, 0.95, 0.0), 42, 2.0, LBa(2.95, 0.85, 0.2)),
  launch: C(SRa(0.7, 1.5, 3.3), SRa(0.0, 1.15, -1.6), 46, 1.2, SRa(0.0, 1.0, -1.0)),
  proud: C(HMa(0.45, 1.55, 2.9), HMa(0.25, 1.08, -1.8), 46, 1.2, HMa(0.2, 1.1, -2.1)),
  promise: C(HMa(-0.9, 1.4, 2.1), HMa(-1.7, 1.0, -1.6), 44, 1.5, HMa(-1.9, 0.9, -1.6)),
  store: C(SRa(0.25, 1.5, 1.9), SRa(1.55, 1.1, -1.4), 46, 1.4, SRa(1.3, 1.0, -1.0)),
  orig: C(SRa(0.9, 1.45, 1.5), SRa(0.75, 1.2, -0.75), 44, 1.8, SRa(0.75, 1.2, -0.75)),
  rest: C(CMa(0.3, 0.35, 5.3), CMa(0.0, 0.2, -0.3), 44, 1.4, CMa(0.0, -0.4, 0.4)),
  payoff: C(CMa(0.3, 0.35, 5.3), CMa(0.0, 0.2, -0.3), 44, 1.2, CMa(0.0, 0.3, -0.3)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0, lab: 0.1, bags: 0.12, shape: 0.12, math: 0.1, tube: 0.1, patent: 0.12, launch: 0.08, proud: 0.08, promise: 0.14, store: 0.06, orig: 0.12, rest: 0.06, payoff: 0 };
const base = (k) => V[k] || V.hook;
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const look = (d, f0, f1, fd) => { const t = sm(f0, f1, f); c = { ...c, l: add3(c.l, d.map((x) => x * t)), fp: add3(c.fp, (fd || d).map((x) => x * t)) }; };
  const orbit = (a, f0, f1) => { const t = sm(f0, f1, f) - 0.5, an = a * t, dx = c.p[0] - c.l[0], dz = c.p[2] - c.l[2]; c = { ...c, p: [c.l[0] + dx * Math.cos(an) - dz * Math.sin(an), c.p[1], c.l[2] + dx * Math.sin(an) + dz * Math.cos(an)] }; };
  if (k === 'hook') { const t = sm(52, 112, f); c = { ...c, p: lerp3(CMa(-0.05, -0.5, 1.95), CMa(0.3, 0.12, 4.7), t), l: lerp3(CMa(0.0, -0.7, 0.55), CMa(0.0, 0.0, -0.3), t), fp: lerp3(CMa(0.0, -0.75, 0.55), CMa(0.0, 0.1, -0.2), t), cInf: 2.0 - 0.7 * t };
    c = push(c, 0.05 * (1 - t), 0, 52, f); punch(60, 66, 0.08 * (1 - t)); punch(108, 114, 0.08); kick(108, 0.03); }
  if (k === 'lab') { orbit(0.25, 134, 309); punch(139, 145, 0.06); punch(222, 228, 0.06); punch(271, 277, 0.1); kick(271, 0.04); }
  if (k === 'bags') { punch(332, 338, 0.06); punch(354, 360, 0.06); punch(406, 412, 0.1); shake(407, 420, 0.012); }
  if (k === 'shape') { orbit(0.15, 441, 576); punch(511, 517, 0.08); punch(551, 557, 0.1); kick(551, 0.02); }
  if (k === 'math') { orbit(0.3, 576, 731); punch(606, 612, 0.06); punch(655, 661, 0.1); kick(655, 0.04); punch(696, 702, 0.06); }
  if (k === 'tube') { punch(765, 771, 0.06); punch(801, 807, 0.1); kick(803, 0.02); }
  if (k === 'patent') { punch(848, 854, 0.12); kick(848, 0.04); shake(849, 860, 0.02); }
  if (k === 'launch') { punch(892, 898, 0.06); punch(932, 938, 0.08); punch(950, 956, 0.08); }
  if (k === 'proud') { orbit(0.25, 984, 1166); punch(1004, 1010, 0.06); punch(1107, 1113, 0.08); punch(1133, 1139, 0.12); kick(1133, 0.03); }
  if (k === 'promise') { punch(1200, 1206, 0.04); punch(1283, 1289, 0.06); }
  if (k === 'store') { look([0.15, 0.05, 0], 1409, 1440); punch(1359, 1365, 0.05); punch(1425, 1431, 0.08); shake(1426, 1445, 0.015); punch(1452, 1458, 0.06); }
  if (k === 'orig') { punch(1491, 1497, 0.14); kick(1491, 0.04); }
  if (k === 'rest') { look([-0.2, -0.45, 0.35], 1550, 1575, [-0.2, -0.3, 0.3]); look([0.4, 0.0, 0.0], 1595, 1615, [0.4, 0, 0]); look([-0.2, 0.25, -0.35], 1628, 1650, [-0.2, 0.0, -0.3]); }
  if (k === 'payoff') { const t = sm(1668, 1758, f); c = { ...c, p: lerp3(CMa(0.3, 0.35, 5.3), CMa(1.4, 3.2, 6.8), t), l: lerp3(CMa(0.0, 0.2, -0.3), CMa(-0.8, 3.6, -14), t), fp: lerp3(CMa(0, 0.3, -0.3), CMa(-1, 2.5, -6), t), fov: 44 + 4 * t, cInf: 1.2 - 0.5 * t };
    punch(1683, 1689, 0.04 * (1 - t)); }
  return c;
}
const HARD = new Set([1475]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g) && g !== 1664);
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[60, 0.25, 6], [134, 0.85, 12], [271, 0.25, 6], [309, 0.3, 8], [406, 0.25, 6], [441, 0.3, 8], [551, 0.25, 6], [576, 0.5, 10], [655, 0.25, 6], [731, 0.4, 10], [801, 0.2, 6], [810, 0.3, 8], [848, 0.3, 6], [888, 0.7, 12], [932, 0.25, 6], [984, 0.7, 12], [1133, 0.25, 6], [1166, 0.5, 12], [1301, 0.6, 12], [1475, 0.35, 8], [1491, 0.35, 8], [1521, 0.5, 12], [1683, 0.3, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state
export function worldAt(f, w) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const N = w.pr; if (!N) return;
  N.set({ tray: k === 'shape' ? sm(462, 524, f) : k === 'lab' || k === 'bags' ? 1 : 1, spill: k === 'bags' ? sm(398, 436, f) : 0,
    stackVis: k === 'tube' ? 1 : 0, stackY: 0.45 - 0.39 * sm(772, 800, f), lid: sm(801, 808, f),
    stackN: 22, stackT: k === 'math' ? 0.12 + 0.88 * sm(664, 724, f) : 1, spin: k === 'math' ? 0.9 * sm(600, 640, f) : 0,
    nicheGlow: k === 'hook' ? 1 : k === 'rest' ? 0.5 + 0.5 * sm(1550, 1570, f) : k === 'payoff' ? 1 : 0 });
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const CH = (f, pos, opts = {}, extra = {}) => person(f, 'CHIPPY', 9, pos, { t: f, ...opts }, { s: 0.3, ...extra });
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') { if (f >= 62) A.push(CH(f, CM(0.62, 0.62), { expr: f < 100 ? 'shock' : 'sly', pose: f < 100 ? 'shock' : 'soso' }, { s: 0.24 * back(62, 72, f) + 0.001, blob: false })); }
  if (k === 'lab') { const t = eo(205, 250, f); A.push(P(f, 'PR_BAUR', 11, LB(-0.05, -2.25), { expr: f < 222 ? 'thoughtful' : f < 271 ? 'smile' : 'determined', view: 'front', prop: f >= 262 ? 'memo' : 'chip' }));
    A.push(P(f, 'PR_TECH', 12, LB(-1.3, -2.3), { expr: f < 271 ? 'smile' : 'surprised', view: '34R', prop: 'flask' }));
    A.push(P(f, 'PR_BOSS', 13, LB(2.1 - 1.15 * t, -1.95 + 0.2 * t), { expr: f < 253 ? 'smile' : 'smug', view: '34L', prop: f < 262 ? 'memo' : undefined, point: f > 268 ? 1 : undefined })); }
  if (k === 'bags') { A.push(CH(f, LB(0.8, BZ + 0.18, BY), { expr: f < 332 ? 'smile' : f < 406 ? 'sad' : 'shock', pose: f < 406 ? 'stand' : 'shock' }, { s: 0.1, blob: false })); }
  if (k === 'shape') { A.push(P(f, 'PR_BAUR', 11, LB(-0.3, -2.25), { expr: f < 511 ? 'determined' : 'happy', view: 'front', prop: 'chip' }));
    A.push(CH(f, LB(-0.5, BZ + 0.16, BY), { expr: f < 541 ? 'happy' : 'proud', pose: f < 541 ? 'wave' : 'hips' }, { s: 0.1, blob: false })); }
  if (k === 'math') { A.push(CH(f, BL(-0.45, 0.4), { expr: f < 655 ? 'smile' : f < 696 ? 'shock' : 'love', pose: f < 655 ? 'point' : f < 696 ? 'stand' : 'cheer' }, { s: 0.3 })); }
  if (k === 'tube') { A.push(P(f, 'PR_BAUR', 11, LB(0.5, -2.25), { expr: f < 801 ? 'determined' : 'excited', view: 'front', raise: f > 803 ? 1 : undefined })); }
  if (k === 'patent') { A.push(P(f, 'PR_BAUR', 11, LB(2.3, -0.95), { expr: f < 848 ? 'smile' : 'proud', view: '34R', prop: 'pen' }));
    A.push(CH(f, LB(2.75, 0.5, 0.8), { expr: f < 848 ? 'happy' : 'love', pose: f < 848 ? 'stand' : 'cheer' }, { s: 0.1, blob: false })); }
  if (k === 'launch') { A.push(P(f, 'PR_SHOP68', 21, SR(-0.95, -0.55), { expr: f < 932 ? 'surprised' : 'excited', view: '34R', prop: f > 915 ? 'can' : undefined, canCol: 'plain68' }));
    A.push(P(f, 'PR_DAD68', 22, SR(1.05, -0.4), { expr: f < 932 ? 'smile' : 'happy', view: '34L', prop: 'can', canCol: 'plain68' }));
    A.push(P(f, 'PR_KID68', 23, SR(0.15, 0.2), { expr: 'excited', view: 'back', cheer: f > 932 ? wav(f, 0, 0.3) : undefined }, { s: 0.8 }));
    A.push(P(f, 'PR_CLERK', 24, SR(1.75, -1.7), { expr: 'proud', view: '34L', hip: 1 })); }
  if (k === 'proud') { const L = f >= 1107 && f < 1133; A.push(P(f, 'PR_BAUR80', 31, HM(-0.45, -2.4), { expr: f < 1004 ? 'smile' : f < 1107 ? 'proud' : f < 1133 ? 'happy' : 'smug', view: '34R', prop: 'can', canCol: 'orig', point: f > 1060 && f < 1100 ? 1 : undefined }));
    A.push(P(f, 'PR_SON80', 32, HM(0.8, -1.75), { expr: L ? 'laugh' : f >= 1133 ? 'surprised' : 'smile', view: '34L', hip: L ? undefined : 1 }));
    A.push(P(f, 'PR_DAU80', 33, HM(0.15, -2.2), { expr: L ? 'laugh' : f >= 1133 ? 'shock' : 'amused', view: '34L' }));
    A.push(CH(f, HM(-0.85, -3.05, 1.22), { expr: L ? 'happy' : f >= 1133 ? 'shock' : 'smile', pose: L ? 'cheer' : f >= 1133 ? 'shock' : 'stand' }, { s: 0.09, blob: false })); }
  if (k === 'promise') { A.push(P(f, 'PR_DAU', 41, HM(-0.5, -2.1), { expr: f < 1268 ? 'sad' : 'relieved', view: '34L' }));
    A.push(P(f, 'PR_SON', 42, HM(-1.05, -2.6), { expr: f < 1268 ? 'thoughtful' : 'relieved', view: '34L' }));
    A.push(P(f, 'PR_SON2', 43, HM(-2.65, -2.85), { expr: f < 1268 ? 'sad' : 'smile', view: '34L' }));
    A.push(CH(f, HM(-2.05, -1.38, 0.6), { expr: 'tender', pose: 'heart' }, { s: 0.09, blob: false })); }
  if (k === 'store') { const arg = f >= 1420; A.push(P(f, 'PR_SON', 42, SR(1.55, -0.95), { expr: arg ? (f % 40 < 20 ? 'determined' : 'angry') : f < 1379 ? 'thoughtful' : 'smile', view: '34L', prop: f > 1385 ? 'can' : undefined, canCol: 'sour', raise: arg && f % 40 < 20 ? 1 : undefined }));
    A.push(P(f, 'PR_DAU', 41, SR(0.85, -1.55), { expr: arg ? (f % 44 < 22 ? 'smug' : 'determined') : 'smile', view: '34R', prop: f > 1390 ? 'can' : undefined, canCol: 'bbq', point: arg && f % 44 >= 22 ? 1 : undefined }));
    A.push(P(f, 'PR_SON2', 43, SR(0.95, -0.3), { expr: arg ? 'nervous' : 'smile', view: '34R', prop: f > 1395 ? 'can' : undefined, canCol: 'cheese' }));
    A.push(CH(f, SR(2.18, -0.75, 1.06), { expr: f < 1425 ? 'smile' : 'shock', pose: f < 1425 ? 'stand' : 'shrug', look: Math.sin(f * 0.25) }, { s: 0.11, blob: false })); }
  if (k === 'orig') { A.push(P(f, 'PR_SON2', 43, SR(0.75, -0.75), { expr: f < 1491 ? 'smile' : 'happy', view: 'front', prop: 'can', canCol: 'orig', raise: f > 1489 ? 1 : undefined }));
    A.push(P(f, 'PR_SON', 42, SR(1.45, -1.35), { expr: f < 1491 ? 'surprised' : 'laugh', view: '34L' })); A.push(P(f, 'PR_DAU', 41, SR(0.05, -1.4), { expr: f < 1491 ? 'thoughtful' : 'happy', view: '34R' })); }
  if (k === 'rest' || k === 'payoff') { A.push(P(f, 'PR_DAU', 41, CM(-1.0, -1.2), { expr: f < 1604 ? 'relieved' : 'smile', view: '34R' })); A.push(P(f, 'PR_SON', 42, CM(0.95, -1.15), { expr: f < 1604 ? 'thoughtful' : 'smile', view: '34L' })); A.push(P(f, 'PR_SON2', 43, CM(1.6, -1.7), { expr: f < 1683 ? 'smile' : 'happy', view: '34L' }));
    A.push(CH(f, CM(-0.45, 0.55), { expr: f < 1683 ? 'tender' : 'love', pose: f < 1683 ? 'heart' : 'wave' }, { s: 0.2, blob: false })); }
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
  if (k === 'hook') { sboard(f, 16, ['HE DESIGNED', 'THE CAN...'], 'hook', 0.0, 0.6, 0.6, 0.5, F2, 56); stamp(f, 60, ['BURIED', 'IN ONE?!'], 'hook', 0.0, 0.62, 0.6, 0.46, F2, 104); sburst(f, 74, 'hook', 0.0, -0.1, 0.6, 0.5, F2); sboard(f, 106, ['WELL...', 'PARTLY'], 'hook', 0.0, 0.66, 3, 0.42, F2); }
  if (k === 'lab') { sboard(f, 136, ['1950s'], 'lab', 0.0, 0.7, 3, 0.3, F2, 170); sboard(f, 172, ['PROCTER', '& GAMBLE'], 'lab', 0.0, 0.66, 3, 0.4, F2, 218); sboard(f, 220, ['FREDRIC', 'BAUR'], 'lab', 0.0, 0.66, 3, 0.36, F2, 265); sboard(f, 268, ['FIX THE', 'POTATO CHIP!'], 'lab', 0.0, 0.66, 3, 0.48, F2); sburst(f, 271, 'lab', 0.0, 0.66, 3, 0.5, F2); }
  if (k === 'bags') { sboard(f, 312, ['THE OLD', 'CHIP BAG'], 'bags', 0.0, 0.68, 0.6, 0.42, F2, 330); sboard(f, 331, ['GREASY'], 'bags', 0.0, 0.7, 0.6, 0.34, F2, 352); sboard(f, 353, ['HALF AIR'], 'bags', 0.0, 0.7, 0.6, 0.36, F2, 402); stamp(f, 405, ['BROKEN', 'CRUMBS!'], 'bags', 0.0, 0.62, 0.6, 0.4, F2); }
  if (k === 'shape') { sboard(f, 466, ['EVERY CHIP'], 'shape', 0.0, 0.7, 0.6, 0.42, F2, 508); sboard(f, 509, ['EXACT', 'SAME SHAPE'], 'shape', 0.0, 0.66, 0.6, 0.44, F2, 548); stamp(f, 550, ['A SADDLE!'], 'shape', 0.0, 0.62, 0.6, 0.42, F2); sburst(f, 551, 'shape', 0.0, 0.0, 0.6, 0.5, F2); }
  if (k === 'math') { sboard(f, 578, ['MATH CALLS IT A...'], 'math', 0.0, 0.7, 3, 0.5, F2, 602); sboard(f, 604, ['HYPERBOLIC', 'PARABOLOID'], 'math', 0.0, 0.66, 3, 0.52, F2, 652); stamp(f, 654, ['STURDY'], 'math', 0.0, 0.62, 3, 0.38, F2, 682); sboard(f, 684, ['STACKS', 'PERFECTLY'], 'math', 0.0, 0.66, 3, 0.42, F2); stars(f, 700, 'math', 0.0, 0.3, 3, 0.5, F2, 24); }
  if (k === 'tube') { sboard(f, 760, ['A TALL', 'TUBE'], 'tube', 0.0, 0.66, 0.6, 0.34, F2, 795); stamp(f, 800, ['PERFECT FIT'], 'tube', 0.0, 0.62, 0.6, 0.44, F2); sburst(f, 802, 'tube', 0.0, 0.0, 0.6, 0.45, F2); }
  if (k === 'patent') { sboard(f, 818, ['PATENT', 'FILED'], 'patent', 0.0, 0.66, 1.5, 0.38, F2, 846); stamp(f, 847, ['1966'], 'patent', 0.0, 0.62, 1.5, 0.32, F2); }
  if (k === 'launch') { sboard(f, 890, ['1968'], 'launch', 0.0, 0.7, 3, 0.3, F2, 928); stamp(f, 931, ['LAUNCHED!'], 'launch', 0.0, 0.62, 3, 0.42, F2, 948); sboard(f, 949, ['INDIANA'], 'launch', 0.0, 0.7, 3, 0.36, F2); sburst(f, 932, 'launch', 0.0, 0.62, 3, 0.5, F2, '#ffe0a0'); stars(f, 940, 'launch', 0.0, 0.3, 3, 0.5, F2, 24); }
  if (k === 'proud') { sboard(f, 1000, ['SO PROUD'], 'proud', 0.0, 0.7, 3, 0.36, F2, 1062); bubble(f, 1064, ['BURY ME', 'IN IT!'], 'proud', -0.2, 0.42, 3, 0.4, 1, F2, 1104); sboard(f, 1105, ['*CHUCKLE*'], 'proud', 0.0, 0.7, 3, 0.38, F2, 1130); stamp(f, 1132, ['HE MEANT IT'], 'proud', 0.0, 0.62, 3, 0.44, F2); }
  if (k === 'promise') { sboard(f, 1168, ['YOU SEE...'], 'promise', 0.0, 0.7, 3, 0.36, F2, 1196); sboard(f, 1198, ['2008'], 'promise', 0.0, 0.7, 3, 0.28, F2, 1228); sboard(f, 1230, ['AGE 89'], 'promise', 0.0, 0.7, 3, 0.3, F2, 1262); sboard(f, 1264, ['A PROMISE', 'IS A PROMISE'], 'promise', 0.0, 0.66, 3, 0.48, F2); }
  if (k === 'store') { sboard(f, 1305, ['ON THE WAY TO', 'THE FUNERAL HOME'], 'store', 0.0, 0.66, 3, 0.52, F2, 1355); sboard(f, 1357, ['A QUICK STOP'], 'store', 0.0, 0.7, 3, 0.42, F2, 1404); sboard(f, 1406, ['REPORTEDLY...'], 'store', 0.0, 0.7, 3, 0.44, F2, 1444);
    bubble(f, 1425, ['SOUR', 'CREAM!'], 'store', 0.38, 0.32, 3, 0.28, -1, F2); bubble(f, 1432, ['BBQ!'], 'store', -0.32, 0.4, 3, 0.22, 1, F2); sboard(f, 1446, ['WHICH FLAVOR?'], 'store', 0.0, 0.68, 3, 0.48, F2); qmark(f, 1450, 'store', 0.0, 0.18, 3, 0.12, F2); }
  if (k === 'orig') { stamp(f, 1489, ['ORIGINAL'], 'orig', 0.0, 0.72, 1.2, 0.44, F2); sburst(f, 1491, 'orig', 0.3, 0.35, 1.2, 0.55, F2, '#fff3b0', 14); stars(f, 1495, 'orig', 0.0, 0.25, 1.2, 0.5, F2, 24); }
  if (k === 'rest') { sboard(f, 1556, ['THE CAN'], 'rest', 0.0, 0.7, 3, 0.32, F2, 1598); sboard(f, 1600, ['THE URN'], 'rest', 0.0, 0.7, 3, 0.32, F2, 1626); sboard(f, 1628, ['SIDE BY SIDE'], 'rest', 0.0, 0.7, 3, 0.44, F2); }
  if (k === 'payoff') { stamp(f, 1682, ['BURIED IN', 'HIS WORK'], 'payoff', 0.0, 0.62, 3, 0.46, F2); stars(f, 1700, 'payoff', 0.0, 0.25, 3, 0.55, F2, 24); }
  return F2;
}
