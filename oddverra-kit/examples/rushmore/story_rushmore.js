// [RS-story] "Mount Rushmore was never finished" timeline (57.51 s voice, 1726 f @ 30 fps).
// Sets: rs_sets.js (mount / studio / tunnel) through setAt. Pattern: story_nintendo.js (slow push per shot, zoom-through whips on cuts,
// screen-pinned boards / bursts / stamps, punch-ins on beats). PEBB (a living granite pebble chipped off the mountain) is the sidekick; the
// motif is the ghost of the planned waist-length bodies: it glows under the heads in the hook, is the plaster model in the studio,
// gets crossed out when the work stops, and flickers back in the payoff ("still waiting on their bodies").
import * as S from './story.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]                                     narration (word frames from work/words_frames.txt)
const SH = [
  [0, 139, 'hook', 'mToday'],        // Mount Rushmore was never finished. The presidents were supposed to have bodies.  (never 33, finished 43, bodies 108)
  [139, 313, 'y1927', 'm1927'],      // In 1927, sculptor Gutzon Borglum started carving four presidents into a South Dakota mountain.  (1927 142, Gutzon 190, four 235, South 274, mountain 290)
  [313, 433, 'plan', 'studioDay'],   // His plan: carve them down to the waist. Add a giant history inscription,  (plan 316, waist 361, add 376, history 399, inscription 412)
  [433, 511, 'plan2', 'studioDay'],  // and behind the heads, a Hall of Records.  (behind 438, heads 450, Hall 468, Records 481)
  [511, 682, 'work', 'mWork'],       // Workers dangled over the cliff in bosun chairs. About 90% of the rock came off with dynamite.  (dangled 519, bosun 558, 90% 592, dynamite 649)
  [682, 849, 'jeff', 'mGold'],       // Jefferson started on Washington's right. The rock was cracked, so they blasted him off and moved him to the left.  (right 727, cracked 752, blasted 781, moved 810, left 827)
  [849, 893, 'why', 'mGold'],        // So why do we only get heads?  (why 854, heads 884)
  [893, 1072, 'money', 'studioNight'], // You see, the money kept running out. Then, in March 1941, Borglum died.  (money 936, out 959, March 991, 1941 997, died 1043)
  [1072, 1188, 'linc', 'm41'],       // His son Lincoln wrapped up the faces, and that October, the work stopped.  (Lincoln 1083, faces 1110, October 1137, stopped 1167)
  [1188, 1242, 'nobod', 'm41'],      // No bodies, no inscription,  (bodies 1193, inscription 1218)
  [1242, 1318, 'tunnel', 'tunnel41'],// just a 70-foot tunnel to nowhere.  (70-foot 1254, tunnel 1271, nowhere 1290)
  [1318, 1434, 'safe', 'mSunset'],   // And in 14 years of blasting, not one worker died.  (14 1325, blasting 1356, not 1378, one 1381, died 1403)
  [1434, 1600, 'twist', 'tunnel98'], // Here's the twist. In 1998, history panels were finally sealed in a vault at that tunnel's entrance.  (twist 1443, 1998 1463, panels 1503, sealed 1532, vault 1554, entrance 1584)
  [1600, 1726, 'payoff', 'mDawn'],   // But the presidents? They're still waiting on their bodies.  (presidents 1617, still 1643, waiting 1649, bodies 1666)
];
export const NF = 1726;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['rs', segAt(f)[3]];

// ---------- places (set-local -> world)
const O = { mount: [-88000, 0, 0], studio: [-88000, 0, 800], tunnel: [-90500, 0, 0] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const MTa = at(O.mount), SDa = at(O.studio), TNa = at(O.tunnel);
const MT = (x, z, h = 0) => MTa(x, h, z), SD = (x, z, h = 0) => SDa(x, h, z), TN = (x, z, h = 0) => TNa(x, h, z);
const SEATS = [[-17.6, 29.2, -30.6], [-10.2, 37.4, -31.4], [-22.6, 34.4, -34.6], [-25.8, 27.6, -35.4]]; // = RS_SEATS in rs_sets.js

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(MTa(0.6, 1.0, 22.5), MTa(-1, 15, -40), 50, 0.8, MTa(0.2, 1.4, 17.6)),
  y1927: C(MTa(4.5, 1.0, 4), MTa(-3, 15, -40), 50, 0.8, MTa(1.6, 1.2, -4)),
  plan: C(SDa(0.9, 1.75, 1.6), SDa(-0.4, 1.45, -1.6), 44, 1.6, SDa(-0.4, 1.5, -1.6)),
  plan2: C(SDa(-1.5, 1.95, 0.9), SDa(-2.5, 2.0, -3.8), 44, 1.6, SDa(-2.2, 2.0, -3.7)),
  work: C(MTa(-12.5, 31.5, -19), MTa(-19.5, 30.8, -33), 44, 1.2, MTa(-17.6, 30, -31)),
  jeff: C(MTa(-17, 22, 20), MTa(-17, 31, -38), 46, 0.8, MTa(-17, 32, -38)),
  why: C(MTa(-1.3, 0.75, -10.6), MTa(-2.0, 1.1, -14.5), 46, 2.0, MTa(-2.0, 0.4, -14)),
  money: C(SDa(-1.0, 1.55, 2.7), SDa(-2.5, 1.0, 0.6), 44, 1.6, SDa(-2.5, 1.0, 0.7)),
  linc: C(MTa(-6.5, 43.5, -26.5), MTa(-11.5, 41.2, -37.5), 44, 1.2, MTa(-12.5, 41.5, -37.4)),
  nobod: C(MTa(0.2, 9, 30), MTa(-1, 24, -40), 46, 0.8, MTa(-1, 24, -40)),
  tunnel: C(TNa(0.4, 1.7, 7.5), TNa(0, 1.5, -14), 46, 1.0, TNa(0.2, 0.8, 1.0)),
  safe: C(MTa(-4.2, 41.5, -25), MTa(-4.2, 41.6, -42), 44, 1.2, MTa(-4.2, 42.2, -41)),
  twist: C(TNa(2.0, 2.5, 4.6), TNa(0, 0.5, 1.3), 44, 1.4, TNa(0, 0.4, 1.4)),
  payoff: C(MTa(0.6, 1.0, 21.5), MTa(-1, 15, -40), 50, 0.8, MTa(0.6, 1.4, 16)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.05, y1927: 0.04, plan: 0.12, plan2: 0.1, work: 0.06, jeff: 0.03, why: 0.12, money: 0.12, linc: 0.06, nobod: 0.03, tunnel: 0, safe: 0.05, twist: 0.1, payoff: 0 };
const base = (k) => V[k] || V.hook;
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.06, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const look = (d, f0, f1, fd) => { const t = sm(f0, f1, f); c = { ...c, l: add3(c.l, d.map((x) => x * t)), fp: add3(c.fp, (fd || d).map((x) => x * t)) }; };
  const orbit = (a, f0, f1) => { const t = sm(f0, f1, f) - 0.5, an = a * t, dx = c.p[0] - c.l[0], dz = c.p[2] - c.l[2]; c = { ...c, p: [c.l[0] + dx * Math.cos(an) - dz * Math.sin(an), c.p[1], c.l[2] + dx * Math.sin(an) + dz * Math.cos(an)] }; };
  if (k === 'hook') { look([0, 4, 0], 0, 90, [0, 0, 0]); look([0, -3, 0], 96, 124, [0, 0, 0]); punch(43, 49, 0.06); punch(108, 114, 0.08); kick(108, 0.5); }
  if (k === 'y1927') { orbit(0.12, 139, 313); look([0, 7, 0], 225, 300, [0, 0, 0]); punch(142, 148, 0.06); punch(202, 208, 0.06); punch(290, 296, 0.06); }
  if (k === 'plan') { orbit(0.35, 313, 433); punch(361, 367, 0.1); kick(361, 0.03); look([-0.9, 0.5, -1.6], 384, 428, [-1.2, 0.5, -2.0]); }
  if (k === 'plan2') { look([1.6, 0, 0], 455, 480, [1.6, 0, 0]); punch(468, 474, 0.1); }
  if (k === 'work') { const t = sm(585, 640, f); c = { ...c, p: lerp3(c.p, MTa(-6, 20, 14), t), l: lerp3(c.l, MTa(-10, 26, -34), t), fov: c.fov + 4 * t, fp: lerp3(c.fp, MTa(-10, 24, -30), t), cInf: c.cInf - 0.2 * t };
    punch(558, 564, 0.08); punch(592, 598, 0.05); shake(650, 676, 0.9); }
  if (k === 'jeff') { punch(727, 733, 0.05); punch(752, 758, 0.08); shake(783, 800, 1.0); look([5, 0, 0], 800, 830, [5, 0, 0]); punch(827, 833, 0.06); }
  if (k === 'why') { punch(854, 860, 0.08); punch(884, 890, 0.1); kick(884, 0.03); }
  if (k === 'money') { look([-0.3, -0.15, 0.05], 1030, 1068, [-0.2, -0.1, 0.1]); punch(936, 942, 0.06); punch(991, 997, 0.06); }
  if (k === 'linc') { orbit(0.2, 1072, 1188); punch(1083, 1089, 0.06); punch(1137, 1143, 0.06); punch(1167, 1173, 0.08); kick(1167, 0.3); }
  if (k === 'nobod') { punch(1193, 1199, 0.06); punch(1218, 1224, 0.06); }
  if (k === 'tunnel') { const t = sm(1242, 1318, f); c = { ...c, p: lerp3(c.p, TNa(0.1, 1.6, -3.5), t), fp: lerp3(c.fp, TNa(0, 1.4, -10), sm(1250, 1300, f)) }; punch(1290, 1296, 0.06); }
  if (k === 'safe') { orbit(0.18, 1318, 1434); punch(1325, 1331, 0.06); punch(1381, 1387, 0.08); kick(1403, 0.3); }
  if (k === 'twist') { orbit(0.4, 1434, 1600); punch(1463, 1469, 0.06); punch(1532, 1538, 0.08); kick(1580, 0.02); }
  if (k === 'payoff') { const t = sm(1606, 1726, f); c = { ...c, p: lerp3(c.p, MTa(1.2, 7, 36), t), l: add3(c.l, [0, 4 * t, 0]), fov: 50 - 2 * t, fp: lerp3(c.fp, MTa(-1, 26, -40), t) };
    punch(1643, 1649, 0.04); punch(1666, 1672, 0.06); }
  return c;
}
const HARD = new Set([893, 1434]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[43, 0.25, 6], [108, 0.35, 8], [139, 0.85, 12], [313, 0.5, 10], [361, 0.25, 6], [433, 0.3, 8], [511, 0.5, 10], [592, 0.2, 6], [650, 0.6, 10], [682, 0.4, 10], [752, 0.25, 6], [783, 0.7, 10], [812, 0.3, 8], [849, 0.3, 8],
    [893, 0.6, 12], [1072, 0.6, 12], [1167, 0.3, 8], [1188, 0.3, 8], [1242, 0.4, 10], [1318, 0.5, 10], [1381, 0.25, 6], [1434, 0.7, 12], [1532, 0.4, 8], [1600, 0.6, 12], [1666, 0.3, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state
const BL_W = [-12, 15, -28], BL_J = [-24.5, 31.5, -36]; // blast points (set-local)
export function worldAt(f, w) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const N = w.rs; if (!N) return;
  const ALL = { W: 2, J: 2, T: 2, L: 2, JL: 0 };
  if (k === 'hook') N.state({ heads: ALL, terr: 1, rig: 0, crack: 0, ghost: 0.9 * sm(96, 118, f), blast: null });
  else if (k === 'y1927') N.state({ heads: { W: 0, J: 0, T: 0, L: 0, JL: 0 }, terr: 0, rig: 0, crack: 0, ghost: 0, blast: null });
  else if (k === 'work') N.state({ heads: { W: 2, J: 0, T: 0, L: 0, JL: 1 }, terr: 0, rig: 1, crack: 0, ghost: 0, blast: f >= 649 ? { t: (f - 649) / 34, at: BL_W, k: 1.2 } : null });
  else if (k === 'jeff' || k === 'why') { const gone = f >= 786, back2 = f >= 812; N.state({ heads: { W: 2, J: back2 ? 1 : 0, T: 0, L: 0, JL: gone ? 0 : 1 }, terr: 0, rig: 1, crack: sm(752, 766, f), ghost: 0, blast: f >= 783 && f < 830 ? { t: (f - 783) / 34, at: BL_J, k: 1.4 } : null }); }
  else if (k === 'linc' || k === 'safe') N.state({ heads: ALL, terr: 0, rig: k === 'linc' ? 1 : 0, crack: 0, ghost: 0, blast: null });
  else if (k === 'nobod') { const fl = f < 1188 ? 0 : 0.95 * (1 - sm(1226, 1240, f)) * (0.75 + 0.25 * Math.sin(f * 0.9)); N.state({ heads: ALL, terr: 0, rig: 1, crack: 0, ghost: fl, blast: null }); }
  else if (k === 'twist') N.state({ cap: 1 - sm(1532, 1572, f), vault: sm(1497, 1528, f) });
  else if (k === 'payoff') N.state({ heads: ALL, terr: 1, rig: 0, crack: 0, ghost: 0.85 * sm(1614, 1636, f) * (0.8 + 0.2 * Math.sin(f * 0.5)), blast: null });
  else if (k === 'tunnel') N.state({ cap: 1, vault: 0 });
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const PB = (f, pos, opts = {}, extra = {}) => person(f, 'PEBB', 9, pos, { t: f, ...opts }, { s: 0.3, ...extra });
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
const seat = (i, dy = 0.48) => MT(SEATS[i][0], SEATS[i][2], SEATS[i][1] + dy);
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') { A.push(P(f, 'RS_TOUR', 21, MT(0.3, 18.6), { expr: f < 43 ? 'excited' : f < 108 ? 'happy' : 'shock', view: f < 100 ? 'back' : '34R', point: f > 50 && f < 100 ? 1 : undefined }, { s: 0.8 }));
    A.push(P(f, 'RS_MOM', 22, MT(1.3, 17.6), { expr: f < 108 ? 'smile' : 'surprised', view: 'back' })); A.push(PB(f, MT(2.4, 12.35, 1.18), { expr: f < 108 ? 'proud' : 'shock', pose: f < 108 ? 'hips' : 'shock' }, { s: 0.26, blob: false })); }
  if (k === 'y1927') { A.push(P(f, 'RS_GUTZ', 11, MT(3.1, -1.4), { expr: f < 202 ? 'determined' : f < 274 ? 'proud' : 'excited', view: '34L', prop: f < 230 ? 'plans' : undefined, point: f >= 230 ? 1 : undefined }));
    A.push(P(f, 'RS_WORK1', 31, MT(1.2, -3.2), { expr: f < 235 ? 'smile' : 'surprised', view: '34R', prop: 'shovel' })); if (f > 250) A.push(PB(f, MT(2.3, -0.8), { expr: 'happy', pose: 'wave' }, { s: 0.22 * back(250, 260, f) + 0.001 })); }
  if (k === 'plan') { A.push(P(f, 'RS_GUTZ', 11, SD(-1.55, -1.9), { expr: f < 361 ? 'proud' : f < 400 ? 'excited' : 'determined', view: '34L', point: f > 330 && f < 400 ? 1 : undefined }));
    if (f > 350) A.push(PB(f, SD(0.3, -1.12, 1.0), { expr: 'love', pose: f < 380 ? 'shock' : 'cheer' }, { s: 0.11 * back(350, 360, f) + 0.001, blob: false })); }
  if (k === 'plan2') { A.push(P(f, 'RS_GUTZ', 11, SD(-0.9, -2.9), { expr: f < 468 ? 'smug' : 'excited', view: '34L', point: 1 })); }
  if (k === 'work') { const drill = (i) => f + i * 3; A.push(P(f, 'RS_WORK1', 31, seat(0), { expr: f < 650 ? 'determined' : 'shock', mode: 'sit', prop: 'drill', drill: drill(0), view: 'back' }, { blob: false }));
    A.push(P(f, 'RS_WORK2', 32, seat(1), { expr: f < 650 ? 'grin' : 'surprised', mode: 'sit', prop: 'drill', drill: drill(1), view: '34L' }, { blob: false }));
    A.push(P(f, 'RS_WORK3', 33, seat(2), { expr: f < 600 ? 'nervous' : 'happy', mode: 'sit', prop: 'drill', drill: drill(2), view: 'back' }, { blob: false }));
    A.push(P(f, 'RS_WORK1', 34, seat(3), { expr: 'whistle', mode: 'sit', view: '34L', wave: f > 600 && f < 640 ? wav(f) : undefined }, { blob: false })); }
  if (k === 'why') { A.push(PB(f, MT(-2.0, -14), { expr: f < 884 ? 'worried' : 'shock', pose: f < 870 ? 'shrug' : 'point', look: -0.4 }, { s: 0.5 })); }
  if (k === 'money') { const out = f >= 1012; if (!out) A.push(P(f, 'RS_GUTZ0', 11, SD(-3.0, -0.2), { expr: f < 936 ? 'thoughtful' : f < 978 ? 'worried' : 'sad', view: 'front', prop: 'letter' }, { s: 0.999 * (1 - sm(990, 1012, f)) + 0.001 }));
    A.push(PB(f, SD(-2.95, 0.75, 0.8), { expr: f < 959 ? 'worried' : f < 1036 ? 'sad' : 'sad', pose: f < 959 ? 'shrug' : 'stand' }, { s: 0.14, blob: false })); }
  if (k === 'linc') { A.push(P(f, 'RS_LINC', 41, MT(-12.8, -37.4, 40.5), { expr: f < 1110 ? 'determined' : f < 1167 ? 'smile' : 'thoughtful', view: '34L', prop: f < 1150 ? 'mallet' : undefined, wave: f >= 1150 && f < 1167 ? wav(f) : undefined }));
    A.push(P(f, 'RS_WORK2', 42, MT(-5.5, -41.4, 42.3), { expr: f < 1167 ? 'happy' : 'surprised', view: '34R', prop: f < 1167 ? 'drill' : undefined, drill: f }));
    A.push(P(f, 'RS_WORK3', 43, MT(1.8, -46.2, 40.1), { expr: f < 1167 ? 'grin' : 'sad', view: '34L' })); }
  if (k === 'tunnel') { A.push(PB(f, TN(0.35, -8.5), { expr: f < 1271 ? 'smile' : f < 1290 ? 'worried' : 'sly', pose: f < 1290 ? 'stand' : 'shrug', look: f < 1271 ? 0 : 0.6 }, { s: 0.32 })); }
  if (k === 'safe') { const ch = (i) => (f > 1381 ? wav(f, i, 0.35) : undefined);
    A.push(P(f, 'RS_WORK1', 51, MT(-7.6, -41.0, 41.8), { expr: f < 1381 ? 'smile' : 'laugh', view: 'front', cheer: ch(0) })); A.push(P(f, 'RS_LINC', 41, MT(-5.5, -41.4, 42.3), { expr: f < 1381 ? 'proud' : 'happy', view: 'front', wave: f > 1340 ? wav(f, 2) : undefined }));
    A.push(P(f, 'RS_WORK2', 52, MT(-3.4, -41.2, 41.9), { expr: f < 1381 ? 'grin' : 'laugh', view: 'front', cheer: ch(1) })); A.push(P(f, 'RS_WORK3', 53, MT(0.6, -46.0, 39.9), { expr: 'happy', view: 'front', cheer: ch(2) })); }
  if (k === 'twist') { A.push(P(f, 'RS_CREW', 61, TN(1.15, 1.9), { expr: f < 1503 ? 'smile' : f < 1532 ? 'proud' : 'happy', view: '34L', prop: f < 1520 ? 'panel' : undefined }));
    A.push(P(f, 'RS_FAM', 62, TN(-1.35, 2.25), { expr: f < 1532 ? 'smile' : 'happy', view: '34R', wave: f > 1560 ? wav(f) : undefined })); A.push(P(f, 'RS_CREW', 63, TN(-0.9, 0.35), { expr: 'determined', view: '34R' }));
    A.push(PB(f, TN(0.85, 2.7), { expr: f < 1532 ? 'happy' : 'love', pose: f < 1532 ? 'wave' : 'cheer' }, { s: 0.22 })); }
  if (k === 'payoff') { A.push(P(f, 'RS_TOUR', 21, MT(0.3, 18.4), { expr: f < 1643 ? 'smile' : 'thoughtful', view: f < 1640 ? 'back' : '34R' }, { s: 0.8 }));
    A.push(PB(f, MT(2.3, 12.35, 1.18), { expr: f < 1643 ? 'sly' : 'smile', pose: 'tap' }, { s: 0.26, blob: false })); }
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
const bigx = (f, f0, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'bigx', pos: SB(k, x, y, z), size: SWD(k, w, z) * back(f0, f0 + 8, f) }); };
const wpuff = (f, f0, pos, size, F2, n = 16) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'puff', t: (f - f0) / n, pos, size }); };
const tick = (f, f0, f1, y0, y1) => String(Math.round(y0 + (y1 - y0) * sm(f0, f1, f)));
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { sboard(f, 30, ['NEVER', 'FINISHED?!'], 'hook', 0.0, 0.7, 3, 0.42, F2, 96); stamp(f, 106, ['BODIES?!'], 'hook', 0.0, 0.66, 3, 0.4, F2); sburst(f, 108, 'hook', 0.0, 0.0, 3, 0.55, F2, '#bfe8ff'); }
  if (k === 'y1927') { if (f > 140 && f < 184) F2.push({ fx: 'board', lines: [tick(f, 142, 168, 1900, 1927)], pos: SB('y1927', 0.0, 0.7, 3), size: SWD('y1927', 0.42, 3) * back(140, 150, f) }); sburst(f, 168, 'y1927', 0.0, 0.7, 3, 0.4, F2);
    if (f > 186 && f < 270) F2.push({ fx: 'board', lines: ['GUTZON', 'BORGLUM'], pos: SB('y1927', 0.0, 0.66, 3), size: SWD('y1927', 0.42, 3) * back(186, 198, f) });
    sboard(f, 272, ['SOUTH', 'DAKOTA'], 'y1927', 0.0, 0.66, 3, 0.38, F2); }
  if (k === 'plan') { sboard(f, 318, ['THE PLAN'], 'plan', 0.0, 0.7, 2, 0.36, F2, 356); sboard(f, 358, ['DOWN TO', 'THE WAIST'], 'plan', 0.0, 0.66, 2, 0.42, F2, 396); sburst(f, 361, 'plan', 0.0, 0.66, 2, 0.45, F2); sboard(f, 398, ['GIANT HISTORY', 'INSCRIPTION'], 'plan', 0.0, 0.66, 2, 0.5, F2); }
  if (k === 'plan2') { sboard(f, 436, ['BEHIND', 'THE HEADS...'], 'plan2', 0.0, 0.66, 2, 0.42, F2, 464); sboard(f, 466, ['A HALL OF', 'RECORDS'], 'plan2', 0.0, 0.66, 2, 0.44, F2); stars(f, 470, 'plan2', 0.0, 0.3, 2, 0.5, F2, 24); }
  if (k === 'work') { sboard(f, 520, ['BOSUN', 'CHAIRS'], 'work', 0.0, 0.68, 3, 0.36, F2, 586); if (f > 590) F2.push({ fx: 'board', lines: [tick(f, 592, 620, 0, 90) + '%'], pos: SB('work', 0.0, 0.7, 3), size: SWD('work', 0.42, 3) * back(590, 600, f) });
    stamp(f, 646, ['DYNAMITE!'], 'work', 0.0, 0.5, 3, 0.42, F2); for (const [d, dx, dy] of [[0, 0, 0], [3, 3, 2], [6, -3, 3], [9, 1, 6]]) wpuff(f, 650 + d, MTa(BL_W[0] + dx, BL_W[1] + dy, BL_W[2] + 1), 9 + d * 0.6, F2, 26); sburst(f, 650, 'work', 0.0, -0.1, 3, 0.6, F2, '#ffd890', 14); }
  if (k === 'jeff') { sboard(f, 690, ['JEFFERSON', '#1'], 'jeff', 0.0, 0.68, 3, 0.4, F2, 724); sboard(f, 726, ["WASHINGTON'S", 'RIGHT'], 'jeff', 0.0, 0.68, 3, 0.5, F2, 750); stamp(f, 752, ['CRACKED!'], 'jeff', 0.0, 0.64, 3, 0.4, F2, 780);
    for (const [d, dx, dy] of [[0, 0, 0], [2, 3, 2], [4, -3, 3], [7, 1, 6], [10, -1, -3]]) wpuff(f, 783 + d, MTa(BL_J[0] + dx, BL_J[1] + dy, BL_J[2] + 2), 8 + d * 0.5, F2, 26); sburst(f, 783, 'jeff', -0.35, 0.05, 3, 0.55, F2, '#ffd890', 14);
    stamp(f, 784, ['BOOM!'], 'jeff', 0.0, 0.64, 3, 0.34, F2, 808); wpuff(f, 812, MTa(-5.5, 35, -38), 9, F2, 18); sboard(f, 812, ["WASHINGTON'S", 'LEFT'], 'jeff', 0.0, 0.68, 3, 0.5, F2); }
  if (k === 'why') { sboard(f, 852, ['ONLY', 'HEADS?'], 'why', 0.0, 0.68, 2, 0.36, F2); qmark(f, 860, 'why', 0.42, 0.35, 2, 0.12, F2); }
  if (k === 'money') { sboard(f, 896, ['YOU SEE...'], 'money', 0.0, 0.7, 2, 0.38, F2, 932); sboard(f, 934, ['MONEY KEPT', 'RUNNING OUT'], 'money', 0.0, 0.66, 2, 0.48, F2, 984);
    sboard(f, 988, ['MARCH', '1941'], 'money', 0.0, 0.68, 2, 0.36, F2, 1034);
    sboard(f, 1038, ['GUTZON BORGLUM', '1867 - 1941'], 'money', 0.0, 0.66, 2, 0.48, F2); }
  if (k === 'linc') { sboard(f, 1078, ['HIS SON', 'LINCOLN'], 'linc', 0.0, 0.68, 3, 0.4, F2, 1132); sboard(f, 1134, ['OCTOBER', '1941'], 'linc', 0.0, 0.68, 3, 0.36, F2, 1164); stamp(f, 1166, ['WORK', 'STOPPED'], 'linc', 0.0, 0.64, 3, 0.4, F2); }
  if (k === 'nobod') { stamp(f, 1190, ['NO BODIES'], 'nobod', 0.0, 0.64, 3, 0.42, F2, 1214); bigx(f, 1193, 'nobod', 0.0, -0.3, 3, 0.5, F2, 1214); stamp(f, 1215, ['NO', 'INSCRIPTION'], 'nobod', 0.0, 0.64, 3, 0.42, F2); bigx(f, 1218, 'nobod', 0.0, -0.3, 3, 0.5, F2); }
  if (k === 'tunnel') { sboard(f, 1250, ['70-FOOT', 'TUNNEL'], 'tunnel', 0.0, 0.68, 3, 0.4, F2, 1286); sboard(f, 1288, ['TO', 'NOWHERE'], 'tunnel', 0.0, 0.68, 3, 0.36, F2); qmark(f, 1292, 'tunnel', 0.3, 0.1, 3, 0.1, F2); }
  if (k === 'safe') { if (f > 1322 && f < 1374) F2.push({ fx: 'board', lines: [tick(f, 1325, 1350, 0, 14) + ' YEARS'], pos: SB('safe', 0.0, 0.7, 3), size: SWD('safe', 0.42, 3) * back(1322, 1332, f) });
    sboard(f, 1376, ['NOT ONE', 'WORKER DIED'], 'safe', 0.0, 0.6, 3, 0.48, F2); sburst(f, 1381, 'safe', 0.0, 0.0, 3, 0.55, F2); stars(f, 1390, 'safe', 0.0, 0.25, 3, 0.55, F2, 24); }
  if (k === 'twist') { stamp(f, 1438, ['THE TWIST'], 'twist', 0.0, 0.66, 2, 0.4, F2, 1460); sboard(f, 1461, ['1998'], 'twist', 0.0, 0.7, 2, 0.28, F2, 1494); sboard(f, 1496, ['16 HISTORY', 'PANELS'], 'twist', 0.0, 0.68, 2, 0.44, F2, 1528);
    stamp(f, 1530, ['SEALED IN', 'A VAULT'], 'twist', 0.0, 0.64, 2, 0.42, F2); wpuff(f, 1572, TNa(0, 0.25, 1.4), 1.6, F2, 18); stars(f, 1576, 'twist', 0.0, 0.25, 2, 0.5, F2, 24); }
  if (k === 'payoff') { sboard(f, 1606, ['THE', 'PRESIDENTS?'], 'payoff', 0.0, 0.7, 3, 0.4, F2, 1640); stamp(f, 1642, ['STILL', 'WAITING...'], 'payoff', 0.0, 0.66, 3, 0.4, F2); }
  return F2;
}
