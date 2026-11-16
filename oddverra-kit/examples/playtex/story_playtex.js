// [PX-story] "The Moon spacesuits were sewn by a bra company" timeline (60.73 s voice, 1822 f @ 30 fps).
// Sets: px_sets.js (moon / lab / factory / office / blueprint) through setAt. Pattern: story_niagara.js (slow push per shot, zoom-through
// whips on cuts, screen-pinned boards / bursts / stamps, punch-ins on beats). The motif is the soft suit: on the sewing-floor stand,
// winning the 1965 trials, bending its accordion joints in the cutaway, fanning its 21 layers, and walking on the Moon in the payoff.
// Dot, the lead seamstress (horn-rims, tape measure), is the sidekick who reacts on the sewing floor and in the trials.
import * as S from './story.js';
import { MOON, moonH } from './px_sets.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]                                   narration (word frames from work/words_frames.txt)
const SH = [
  [0, 126, 'hook', 'moon'],             // The spacesuit Neil Armstrong wore on the Moon was made by a bra company.  (Moon 58, bra 91, company 97)
  [126, 297, 'need', 'lab'],            // In the 1960s, NASA needed a suit that could hold air, block heat, and still let an astronaut bend.  (NASA 163, air 205, heat 228, bend 277)
  [297, 374, 'firms', 'lab'],           // The big aerospace firms all wanted the job.  (big 300, firms 319, job 355)
  [374, 569, 'latex', 'factory'],       // But one bidder was the International Latex Corporation, the company behind Playtex bras and girdles, in Dover, Delaware.  (Latex 421, bras 495, girdles 510, Dover 529)
  [569, 646, 'doubt', 'factory'],       // A bra company? Building spacesuits?  (bra 571, Building 592, spacesuits 608)
  [646, 746, 'fired', 'office'],        // And in 1965, it got kicked off the project.  (1965 653, kicked 695, project 714)
  [746, 873, 'weeks', 'factoryNight'],  // So it asked for one more shot, and reportedly had just six weeks to build a new suit.  (asked 753, reportedly 798, six 826, weeks 836, suit 865)
  [873, 1032, 'test', 'labTest'],       // In a head-to-head test against two rivals, NASA found its suit was by far the best.  (head 886, rivals 925, NASA 952, best 1006)
  [1032, 1258, 'reveal', 'blueprint'],  // You see, a girdle and a spacesuit do the same tricky job: squeeze tight, and still let you move. Its joints bent like rubber accordions.  (girdle 1050, spacesuit 1066, squeeze 1125, move 1172, joints 1190, accordions 1225)
  [1258, 1400, 'sew', 'factoryLamp'],   // So the seamstresses who sewed bras got to work. Up to twenty-one layers per suit,  (seamstresses 1273, work 1326, twenty-one 1348, layers 1366)
  [1400, 1531, 'stitch', 'factoryLamp'],// seams within a sixty-fourth of an inch. One bad stitch could mean a leak.  (sixty-fourth 1425, inch 1452, bad 1472, stitch 1478, leak 1506)
  [1531, 1671, 'moon', 'moonLow'],      // Then, in July 1969, Neil Armstrong stepped onto the Moon.  (July 1547, 1969 1560, Armstrong 1602, stepped 1617, Moon 1646)
  [1671, 1822, 'payoff', 'moon'],       // One small step for man. One giant leap for underwear.  (step 1688, man 1704, giant 1731, leap 1744, underwear 1762)
];
export const NF = 1822;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['px', segAt(f)[3]];

// ---------- places (set-local -> world)
const O = { moon: [-124000, 0, 0], lab: [-124000, 0, 800], factory: [-126500, 0, 0], office: [-126500, 0, 800], blueprint: [-126500, 0, 1600] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const MO = at(O.moon), LB = at(O.lab), FC = at(O.factory), OF = at(O.office), BP = at(O.blueprint);
const { LX, LZ } = MOON;
const MG = (x, z, dy = 0) => MO(x, moonH(x, z) + dy, z); // on the regolith

// astronaut on the Moon: ladder descent (moon shot), then the small step and the giant leap (payoff)
function astroAt(f) { const k = segAt(f)[2];
  if (k === 'hook') return { p: [LX - 0.6, LZ + 4.9], y: 0, view: '34R' };
  if (k === 'moon') { if (f < 1606) { const u = 1 - sm(1534, 1600, f); return { p: [LX, LZ + 2.85 - 1.1 * u + 0.28], y: 0.45 + 1.95 * u, view: 'back', ladder: true }; }
    const s2 = sm(1606, 1624, f), hop = Math.sin(Math.PI * s2) * 0.18; return { p: [LX, LZ + 3.13 + 0.52 * s2], y: 0.45 * (1 - s2) + hop, view: f < 1616 ? 'back' : '34L', ladder: s2 < 1 }; }
  if (k === 'payoff') { const w = sm(1671, 1700, f) * 0.5, j = sm(1731, 1772, f), hop = Math.sin(Math.PI * j) * 1.3; return { p: [LX + 0.0 + 0.9 * j, LZ + 3.65 + w + 1.2 * j], y: hop, view: '34L', jump: j > 0 && j < 1 }; }
  return null; }

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(MO(LX + 0.4, 1.25, LZ + 8.6), MO(LX - 0.7, 1.55, LZ + 1), 44, 1.2, MO(LX - 0.6, 1.0, LZ + 4.9)),
  need: C(LB(-3.9, 1.5, 2.6), LB(-4.1, 1.65, -5), 46, 1.4, LB(-3.3, 1.3, -3.9)),
  firms: C(LB(1.0, 1.5, 4.8), LB(0.95, 1.35, -2.6), 46, 1.2, LB(0.95, 1.2, -1.9)),
  latex: C(FC(1.4, 1.75, 5.2), FC(-0.8, 1.35, -2.4), 50, 1.0, FC(-1.1, 1.1, -1.4)),
  doubt: C(FC(-2.0, 1.45, 2.6), FC(-3.9, 1.3, -1.2), 44, 1.8, FC(-3.4, 1.2, -0.6)),
  fired: C(OF(0.5, 1.45, 2.6), OF(0.15, 1.2, -1.6), 46, 1.4, OF(0.15, 1.25, -2.0)),
  weeks: C(FC(3.0, 1.6, 2.6), FC(1.6, 1.5, -3.6), 48, 1.2, FC(2.2, 1.2, -1.6)),
  test: C(LB(1.8, 1.7, 5.4), LB(1.6, 1.55, -3.0), 50, 1.0, LB(1.6, 1.2, -2.4)),
  reveal: C(BP(-0.05, 1.3, 4.0), BP(-0.05, 1.15, -1.2), 44, 1.2, BP(-0.05, 1.1, -1.2)),
  sew: C(FC(1.2, 1.55, 2.4), FC(-1.2, 1.0, -1.5), 48, 1.2, FC(-1.3, 1.0, -1.3)),
  stitch: C(FC(-0.72, 1.22, 1.9), FC(-0.08, 0.86, 1.05), 32, 2.6, FC(-0.1, 0.85, 1.07)),
  moon: C(MO(LX - 2.6, 0.75, LZ + 8.2), MO(LX + 0.2, 1.7, LZ + 1.5), 48, 1.2, MO(LX, 1.0, LZ + 3.2)),
  payoff: C(MO(LX + 2.2, 1.1, LZ + 8.4), MO(LX - 0.2, 1.3, LZ + 3.6), 46, 1.2, MO(LX + 0.3, 1.0, LZ + 4.4)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.14, need: 0.12, firms: 0.1, latex: 0.1, doubt: 0.12, fired: 0.14, weeks: 0.1, test: 0.08, reveal: 0.08, sew: 0.06, stitch: 0.05, moon: 0.08, payoff: 0 };
const base = (k) => V[k] || V.hook;
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const look = (d, f0, f1, fd) => { const t = sm(f0, f1, f); c = { ...c, l: add3(c.l, d.map((x) => x * t)), fp: add3(c.fp, (fd || d).map((x) => x * t)) }; };
  const move = (d, f0, f1) => { const t = sm(f0, f1, f); c = { ...c, p: add3(c.p, d.map((x) => x * t)) }; };
  if (k === 'hook') { punch(58, 64, 0.05); punch(91, 98, 0.12); kick(91, 0.05); shake(92, 104, 0.05); }
  if (k === 'need') { punch(205, 211, 0.04); punch(228, 234, 0.04); punch(277, 283, 0.08); kick(277, 0.03); }
  if (k === 'firms') { punch(319, 325, 0.06); look([0.3, 0, 0], 330, 360); }
  if (k === 'latex') { punch(421, 427, 0.05); look([-1.2, 0, -0.6], 478, 500, [-2.5, 0, -1.5]); punch(495, 501, 0.06); look([2.6, 0.5, 0.4], 522, 545, [4.6, 1.2, 0]); punch(529, 535, 0.05); }
  if (k === 'doubt') { punch(571, 577, 0.06); punch(608, 614, 0.1); kick(608, 0.03); }
  if (k === 'fired') { punch(653, 659, 0.05); punch(695, 701, 0.16); kick(695, 0.06); shake(696, 712, 0.06); }
  if (k === 'weeks') { punch(826, 832, 0.1); kick(826, 0.04); look([0.6, -0.2, 1.2], 846, 868, [0.5, 0, 0.3]); }
  if (k === 'test') { punch(886, 892, 0.05); look([-0.5, 0, 0], 900, 915); look([0.9, 0, 0], 930, 948); punch(1006, 1012, 0.14); kick(1006, 0.05); move([0, 0, -1.2], 960, 1030); }
  if (k === 'reveal') { look([-0.4, 0, 0], 1044, 1056, [-0.6, 0, 0]); look([0.8, 0.05, 0], 1062, 1076, [1.2, 0.1, 0]); look([-0.5, -0.1, 0], 1118, 1132, [-0.6, -0.1, 0]); punch(1125, 1131, 0.08); look([0.5, 0.1, 0], 1164, 1180, [0.6, 0.1, 0]);
    move([0.55, 0.05, -2.2], 1186, 1236); punch(1225, 1231, 0.08); }
  if (k === 'sew') { punch(1273, 1279, 0.05); look([3.9, 0.25, 0.1], 1330, 1350, [4.0, 0.3, 0.0]); move([0.3, -0.05, 0.1], 1330, 1360); punch(1348, 1354, 0.06); kick(1366, 0.03); }
  if (k === 'stitch') { punch(1425, 1431, 0.1); punch(1472, 1478, 0.08); punch(1506, 1512, 0.12); shake(1506, 1520, 0.012); }
  if (k === 'moon') { const a = astroAt(f); const ap = MO(a.p[0], a.y + 1.0, a.p[1]); const t = sm(1540, 1610, f); c = { ...c, l: c.l.map((v, i) => v + (ap[i] - v) * 0.6 * t), fp: c.fp.map((v, i) => v + (ap[i] - v) * t) }; punch(1617, 1623, 0.08); kick(1617, 0.03); punch(1646, 1652, 0.06); }
  if (k === 'payoff') { const a = astroAt(f); const ap = MO(a.p[0], a.y + 1.0, a.p[1]); c = { ...c, l: c.l.map((v, i) => v + (ap[i] - v) * 0.5), fp: ap };
    punch(1688, 1694, 0.06); const t = sm(1744, 1822, f); c = { ...c, p: add3(c.p, [1.6 * t, 1.6 * t, 3.2 * t]), fov: c.fov * (1 + 0.08 * t) }; punch(1762, 1768, 0.08); kick(1762, 0.04); }
  return c;
}
const HARD = new Set([646, 1531]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[91, 0.35, 8], [126, 0.4, 10], [277, 0.25, 6], [297, 0.3, 8], [374, 0.4, 10], [495, 0.2, 6], [569, 0.3, 8], [646, 0.75, 12], [695, 0.4, 8], [746, 0.4, 10], [826, 0.3, 6], [873, 0.35, 10], [1006, 0.4, 8], [1032, 0.45, 12], [1125, 0.2, 6], [1258, 0.4, 10], [1348, 0.25, 6], [1400, 0.3, 8], [1506, 0.3, 6], [1531, 0.8, 14], [1617, 0.25, 6], [1671, 0.3, 8], [1762, 0.4, 10]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state
const jerk = (f, f0, f1, a) => { const t = sm(f0, f1, f); return a * Math.min(t, 0.35 + 0.02 * Math.sin(f * 3.1)); }; // stiff suits stall
export function worldAt(f, w) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const X = w.px; if (!X) return;
  X.setChecks(k === 'need' ? (f >= 277 ? 3 : f >= 228 ? 2 : f >= 205 ? 1 : 0) : 3);
  X.setStand3(k !== 'firms');
  X.setScore(k === 'test' ? (f >= 1006 ? 3 : f >= 940 ? 2 : f >= 925 ? 1 : 0) : 0);
  if (k === 'firms') { X.labPose(0, { aL: jerk(f, 330, 352, 0.9), aR: jerk(f, 334, 356, 0.9), jit: 1, f }); X.labPose(1, { aL: jerk(f, 336, 358, 0.8), aR: jerk(f, 332, 354, 0.8), jit: 1, f }); }
  else if (k === 'test') { const t = sm(890, 920, f), wv = 0.5 + 0.5 * Math.sin((f - 890) * 0.18), r = f > 940 ? sm(940, 970, f) : 0;
    X.labPose(0, { aL: jerk(f, 890, 914, 1.2), aR: jerk(f, 892, 916, 1.2), jit: f > 896 && f < 960 ? 1 : 0, f }); X.labPose(1, { aL: jerk(f, 894, 918, 1.0), aR: jerk(f, 896, 920, 1.0), bL: 0.15, jit: f > 900 && f < 964 ? 1 : 0, f });
    X.labPose(2, { aL: 1.4 * t * (0.6 + 0.4 * wv), aR: 2.2 * t, bR: 1.8 * t * wv, bL: 1.2 * t, kL: 0.9 * r * (0.5 + 0.5 * Math.sin(f * 0.2)), hL: -0.5 * r * (0.5 + 0.5 * Math.sin(f * 0.2)), lift: 0.04 * r * Math.abs(Math.sin(f * 0.2)), f }); }
  else { X.labPose(0, {}); X.labPose(1, {}); X.labPose(2, {}); }
  X.setCal(k === 'weeks' ? (f < 840 ? 0 : Math.min(6, Math.floor((f - 840) / 4.5) + 1)) : -1);
  X.setSewRate(k === 'weeks' ? 2.2 : k === 'stitch' ? 0.8 : 1);
  X.setLayers(k === 'sew' ? sm(1346, 1398, f) : 0);
  X.factoryPose(k === 'weeks' ? { aR: 0.3 * back(856, 870, f), bR: 0.4 * back(856, 870, f) } : k === 'latex' || k === 'doubt' ? { aR: 0.15, bR: 0.3 } : {});
  w.px.parts.fa.suit.G.scale.setScalar(k === 'weeks' ? Math.max(0.001, back(852, 866, f)) : 1);
  X.setStitch(k === 'stitch' ? Math.round(6 + 32 * sm(1400, 1500, f)) : k === 'sew' ? 6 : 30, k === 'stitch' && f >= 1470);
  const sq = k === 'reveal' ? 0.5 + 0.5 * Math.sin((f - 1125) * 0.25) : 0;
  X.setBend(k === 'reveal' ? Math.max(sm(1166, 1186, f) * (0.55 + 0.45 * Math.sin((f - 1166) * 0.12)), 0) : 0, k === 'reveal' && f >= 1120 && f < 1170 ? sq : 0, f);
  X.setPrints(k === 'moon' ? (f >= 1620 ? 1 : 0) : k === 'payoff' ? 1 + Math.floor(sm(1671, 1700, f) * 2) + (f >= 1772 ? 2 : 0) : 0);
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
const SEATS = [[-3.3, -2.4], [-1.1, -2.4], [1.1, -2.4], [-3.3, -0.6], [-1.1, -0.6], [1.1, -0.6]];
const SEAMS = ['PX_SEAM2', 'PX_SEAM3', 'PX_SEAM4', 'PX_SEAM3', 'PX_SEAM4', 'PX_SEAM2'];
function seamRow(f, A, skip = [], mood = 'smile') { SEATS.forEach(([x, z], i) => { if (skip.includes(i)) return; const bob = 0.012 * Math.sin(f * 0.9 + i * 2);
  A.push(P(f, SEAMS[i], 30 + i, FC(x - 0.22, bob, z - 0.6), { expr: typeof mood === 'function' ? mood(i) : mood, mode: 'sit', view: i % 2 ? '34L' : '34R', prop: i % 3 === 0 ? 'needle' : undefined }, { s: 0.92, blob: false })); }); }
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook' || k === 'moon' || k === 'payoff') { const a = astroAt(f), pos = MG(a.p[0], a.p[1], a.y);
    if (a.ladder) pos[1] = O.moon[1] + a.y;
    const ex = k === 'hook' ? (f < 91 ? (f < 58 ? 'smile' : 'excited') : 'shock') : k === 'moon' ? (f < 1617 ? 'determined' : 'excited') : f < 1731 ? 'happy' : f < 1762 ? 'excited' : 'laugh';
    A.push(P(f, 'PX_ASTRO', 1, pos, { expr: ex, view: a.view, wave: (k === 'hook' && f > 40 && f < 88) || (k === 'moon' && f > 1640) ? wav(f, 0, 0.3) : undefined, cheer: a.jump || (k === 'payoff' && f > 1772) ? wav(f, 1, 0.3) : undefined }, { blob: !a.ladder && a.y < 0.3 })); }
  if (k === 'need') { A.push(P(f, 'PX_NASA', 21, LB(-3.15, 0, -3.9), { expr: f < 205 ? 'thoughtful' : f < 277 ? 'smile' : 'excited', prop: 'chalk', view: '34L', point: f > 196 && f < 290 ? 1 : undefined }));
    A.push(P(f, 'PX_NASA2', 22, LB(-5.3, 0, -3.2), { expr: f < 277 ? 'smile' : 'surprised', prop: 'clip', view: '34L' })); }
  if (k === 'firms') { A.push(P(f, 'PX_RIVAL', 41, LB(-0.05, 0, -1.2), { expr: f < 336 ? 'smug' : 'grin', view: '34R', hip: 1 })); A.push(P(f, 'PX_RIVAL2', 42, LB(1.95, 0, -1.1), { expr: f < 336 ? 'smile' : 'smug', view: '34L', point: f > 340 ? 1 : undefined })); }
  if (k === 'latex') { seamRow(f, A, [4], (i) => (f > 495 && f < 520 && i === 1 ? 'laugh' : 'smile'));
    A.push(P(f, 'PX_DOT', 2, FC(-1.32, 0, -1.2), { expr: f < 495 ? 'happy' : f < 529 ? 'grin' : 'smile', mode: 'sit', view: '34R', prop: 'needle' }, { s: 0.92, blob: false }));
    A.push(P(f, 'PX_BOSS', 3, FC(0.6 + 0.8 * (1 - sm(380, 430, f)), 0, 0.5), { expr: f < 529 ? 'smile' : 'happy', view: '34L', wave: f > 529 && f < 560 ? wav(f, 0) : undefined })); }
  if (k === 'doubt') { A.push(P(f, 'PX_NASA', 21, FC(-3.0, 0, -0.1), { expr: f < 592 ? 'surprised' : 'sly', prop: 'clip', view: '34L', point: f > 575 && f < 600 ? 1 : undefined }));
    A.push(P(f, 'PX_DOT', 2, FC(-4.1, 0, -1.3), { expr: f < 608 ? 'smile' : 'smug', prop: 'tape', view: '34R', hip: f > 612 ? 1 : undefined })); }
  if (k === 'fired') { A.push(P(f, 'PX_BOSS', 3, OF(0.15, 0, -2.0), { expr: f < 695 ? 'thoughtful' : f < 714 ? 'shock' : 'worried', prop: 'letter', view: 'front' })); }
  if (k === 'weeks') { A.push(P(f, 'PX_BOSS', 3, FC(2.0, 0, -2.5), { expr: f < 798 ? 'worried' : f < 826 ? 'determined' : 'excited', prop: f < 798 ? 'phone' : undefined, view: '34R', cheer: f > 868 ? wav(f, 0) : undefined }));
    A.push(P(f, 'PX_DOT', 2, FC(1.5, 0, -0.8), { expr: f < 826 ? 'determined' : f < 860 ? 'nervous' : 'excited', prop: 'tape', view: '34R', point: f > 856 ? 1 : undefined }));
    seamRow(f, A, [0, 3, 4], 'determined'); }
  if (k === 'test') { A.push(P(f, 'PX_NASA', 21, LB(2.45, 0, 1.6), { expr: f < 925 ? 'thoughtful' : f < 1006 ? 'surprised' : 'excited', prop: 'clip', view: '34L' }));
    A.push(P(f, 'PX_NASA2', 22, LB(3.2, 0, -0.9), { expr: f < 1006 ? 'thoughtful' : 'happy', prop: 'clip', view: '34L' }));
    A.push(P(f, 'PX_RIVAL', 41, LB(0.0, 0, -1.3), { expr: f < 925 ? 'smug' : f < 1006 ? 'nervous' : 'shock', view: '34R' }));
    A.push(P(f, 'PX_DOT', 2, LB(0.55, 0, 1.4), { expr: f < 1006 ? 'nervous' : 'laugh', view: '34L', cheer: f > 1008 ? wav(f, 2) : undefined, prop: f < 1006 ? 'tape' : undefined })); }
  if (k === 'reveal') { /* the cutaway is objects only */ }
  if (k === 'sew') { seamRow(f, A, [4], (i) => (f > 1326 && i === 2 ? 'grin' : 'determined')); A.push(P(f, 'PX_DOT', 2, FC(-1.32, 0, -1.2), { expr: f < 1326 ? 'determined' : 'happy', mode: 'sit', view: '34R', prop: 'needle' }, { s: 0.92, blob: false })); }
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
const wpuff = (f, f0, pos, size, F2, n = 16, tint) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'puff', t: (f - f0) / n, pos, size, tint }); };
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { sboard(f, 2, ['NEIL ARMSTRONG\'S', 'MOON SUIT...'], 'hook', 0.0, 0.66, 3, 0.5, F2, 89); stamp(f, 91, ['MADE BY A', 'BRA COMPANY!'], 'hook', 0.0, 0.6, 3, 0.5, F2); sburst(f, 91, 'hook', 0.0, 0.6, 3, 0.55, F2); }
  if (k === 'need') { sboard(f, 128, ['1960s: NASA NEEDS', 'A MOON SUIT'], 'need', 0.0, 0.68, 3, 0.54, F2, 200); sboard(f, 202, ['IT MUST...'], 'need', 0.0, 0.7, 3, 0.3, F2, 274); stamp(f, 277, ['...AND BEND!'], 'need', 0.0, 0.64, 3, 0.4, F2); sburst(f, 277, 'need', 0.0, 0.64, 3, 0.5, F2); }
  if (k === 'firms') { sboard(f, 300, ['BIG AEROSPACE', 'FIRMS'], 'firms', 0.0, 0.68, 3, 0.46, F2, 340); sboard(f, 342, ['ALL WANTED', 'THE JOB'], 'firms', 0.0, 0.68, 3, 0.42, F2); }
  if (k === 'latex') { sboard(f, 378, ['BUT ONE BIDDER...'], 'latex', 0.0, 0.7, 3, 0.48, F2, 418); sboard(f, 420, ['...A LATEX', 'COMPANY'], 'latex', 0.0, 0.68, 3, 0.42, F2, 478); stamp(f, 481, ['BRAS &', 'GIRDLES!'], 'latex', 0.0, 0.64, 3, 0.4, F2, 526); sburst(f, 495, 'latex', 0.0, 0.64, 3, 0.5, F2);
    sboard(f, 527, ['DOVER,', 'DELAWARE'], 'latex', 0.0, 0.68, 3, 0.4, F2); }
  if (k === 'doubt') { sboard(f, 571, ['A BRA COMPANY?'], 'doubt', 0.0, 0.7, 3, 0.48, F2, 590); sboard(f, 592, ['BUILDING', 'SPACESUITS?!'], 'doubt', 0.0, 0.68, 3, 0.46, F2); qmark(f, 600, 'doubt', 0.25, 0.25, 3, 0.12, F2); }
  if (k === 'fired') { sboard(f, 648, ['1965'], 'fired', 0.0, 0.7, 3, 0.3, F2, 692); stamp(f, 695, ['KICKED OFF', 'THE PROJECT!'], 'fired', 0.0, 0.62, 3, 0.5, F2); sburst(f, 695, 'fired', 0.0, 0.62, 3, 0.55, F2, '#ffb0a0'); }
  if (k === 'weeks') { sboard(f, 750, ['ONE MORE', 'SHOT?'], 'weeks', 0.0, 0.68, 3, 0.4, F2, 795); sboard(f, 797, ['REPORTEDLY,', 'JUST...'], 'weeks', 0.0, 0.68, 3, 0.4, F2, 824); stamp(f, 826, ['6 WEEKS!'], 'weeks', 0.0, 0.64, 3, 0.4, F2); sburst(f, 826, 'weeks', 0.0, 0.64, 3, 0.5, F2); }
  if (k === 'test') { sboard(f, 876, ['HEAD-TO-HEAD', 'TEST'], 'test', 0.0, 0.68, 3, 0.44, F2, 950); sboard(f, 952, ['NASA\'S VERDICT...'], 'test', 0.0, 0.7, 3, 0.48, F2, 1003); stamp(f, 1006, ['BY FAR', 'THE BEST!'], 'test', 0.0, 0.64, 3, 0.42, F2); sburst(f, 1006, 'test', 0.0, 0.64, 3, 0.55, F2); stars(f, 1010, 'test', 0.0, 0.2, 3, 0.5, F2, 24); }
  if (k === 'reveal') { sboard(f, 1034, ['YOU SEE...'], 'reveal', 0.0, 0.7, 3, 0.32, F2, 1094); sboard(f, 1096, ['SAME TRICKY JOB:'], 'reveal', 0.0, 0.7, 3, 0.46, F2, 1122); stamp(f, 1125, ['SQUEEZE', 'TIGHT'], 'reveal', 0.0, 0.64, 3, 0.36, F2, 1165);
    sboard(f, 1167, ['...AND STILL', 'MOVE'], 'reveal', 0.0, 0.68, 3, 0.38, F2, 1222); stamp(f, 1225, ['ACCORDION', 'JOINTS'], 'reveal', 0.0, 0.64, 3, 0.42, F2); }
  if (k === 'sew') { sboard(f, 1262, ['THE SEAMSTRESSES', 'GOT TO WORK'], 'sew', 0.0, 0.68, 3, 0.54, F2, 1344); if (f >= 1346) { const n = Math.max(1, Math.min(21, Math.round(1 + 20 * sm(1348, 1396, f)))); board(f, 1345, [`${n} LAYERS`], SB('sew', 0.0, 0.66, 3), SWD('sew', 0.42, 3), F2); } sburst(f, 1390, 'sew', 0.0, 0.66, 3, 0.5, F2); }
  if (k === 'stitch') { sboard(f, 1404, ['SEAMS WITHIN', '1/64 OF AN INCH'], 'stitch', 0.0, 0.68, 3, 0.52, F2, 1468); sboard(f, 1470, ['ONE BAD STITCH...'], 'stitch', 0.0, 0.7, 3, 0.48, F2, 1504); stamp(f, 1506, ['= A LEAK!'], 'stitch', 0.0, 0.64, 3, 0.4, F2); sburst(f, 1506, 'stitch', 0.0, 0.64, 3, 0.5, F2, '#ffb0a0');
    for (const f0 of [1506, 1511, 1516]) wpuff(f, f0, FC(-0.2, 0.88, 1.09), 0.16, F2, 16, '#e8f4ff'); }
  if (k === 'moon') { sboard(f, 1536, ['JULY 1969'], 'moon', 0.0, 0.7, 3, 0.4, F2, 1612); stamp(f, 1617, ['FIRST STEP!'], 'moon', 0.0, 0.64, 3, 0.4, F2); for (const f0 of [1617, 1621]) wpuff(f, f0, MG(LX, LZ + 3.65, 0.08), 0.6, F2, 18, '#d8d8de'); }
  if (k === 'payoff') { sboard(f, 1673, ['ONE SMALL STEP', 'FOR MAN...'], 'payoff', 0.0, 0.68, 3, 0.48, F2, 1728); sboard(f, 1730, ['ONE GIANT LEAP', 'FOR...'], 'payoff', 0.0, 0.68, 3, 0.48, F2, 1760); stamp(f, 1762, ['UNDERWEAR!'], 'payoff', 0.0, 0.64, 3, 0.46, F2); sburst(f, 1762, 'payoff', 0.0, 0.64, 3, 0.55, F2); stars(f, 1770, 'payoff', 0.0, 0.3, 3, 0.55, F2, 24);
    for (const f0 of [1772, 1776]) { const a = astroAt(f0); wpuff(f, f0, MG(a.p[0], a.p[1], 0.08), 0.8, F2, 18, '#d8d8de'); } }
  return F2;
}
