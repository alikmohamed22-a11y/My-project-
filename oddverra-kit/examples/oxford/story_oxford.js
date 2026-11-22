// [OX-story] "Oxford University is older than the Aztec Empire" timeline (62.6 s voice, 1878 f @ 30 fps).
// Sets: ox_sets.js (town / hall / lake / study / split) through setAt. Pattern: story_nintendo.js (slow push per shot, zoom-through
// whips on cuts, screen-pinned boards / bursts / stamps, punch-ins on beats, white flashes for time jumps). SANDY (a living
// hourglass) is the sidekick and the motif: it watches from the desk in the hook, visits every era, shrugs the doubter's question,
// shivers in the Arctic and comes back to the desk at dawn.
import * as S from './story.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]                                  narration (word frames from work/words_frames.txt)
const SH = [
  [0, 102, 'hook', 'studyNight'],      // Oxford University is older than the Aztec Empire.  (Oxford 3, older 37, Aztec 58, Empire 69)
  [102, 149, 'check', 'studyNight'],   // Sounds wrong? Let's check the dates.  (wrong 105, check 125, dates 132)
  [149, 287, 't1096', 'town1096'],     // In a little English town called Oxford, teaching existed in some form by 1096.  (town 167, Oxford 183, teaching 205, 1096 252)
  [287, 431, 't1167', 'town1167'],     // Then, in 1167, King Henry the Second banned English students from studying in Paris.  (1167 300, King 336, banned 359, students 381, Paris 412)
  [431, 521, 'grew', 'town1167'],      // Many came home, and Oxford grew fast.  (home 442, Oxford 461, grew 472, fast 481)
  [521, 643, 'hall', 'hallCandle'],    // Scholars in robes. Candlelit halls. Arguments in Latin.  (Scholars 521, candlelit 548, arguments 580, Latin 599)
  [643, 729, 'notyet', 'lakeEmpty'],   // Meanwhile, across the Atlantic, Tenochtitlan didn't exist yet.  (Atlantic 649, Tenochtitlan 670, didn't 686, yet 705)
  [729, 844, 't1325', 'lake1325'],     // Around 1325, the Mexica founded their city on an island in a lake.  (1325 729, Mexica 767, founded 780, island 811, lake 831)
  [844, 973, 't1428', 'lake1428'],     // And the Aztec Empire? It began when the Triple Alliance formed, in 1428.  (Aztec 849, began 878, Triple 895, 1428 934)
  [973, 1077, 'gap', 'studyDesk'],     // By then, Oxford had been teaching for over 300 years.  (Oxford 994, teaching 1009, 300 1031, years 1045)
  [1077, 1119, 'how', 'studyDesk'],    // So how is that possible?  (how 1084, possible 1100)
  [1119, 1300, 'yousee', 'studyBlue'], // You see, we file everything old under one word: ancient. But history overlaps in strange ways.  (file 1138, ancient 1203, history 1226, overlaps 1238, ways 1274)
  [1300, 1422, 'pyr', 'splitDay'],     // Here's another one. When the Great Pyramid was being built, woolly mammoths were still alive.  (Great 1328, built 1356, woolly 1375, mammoths 1381, alive 1405)
  [1422, 1560, 'wrangel', 'splitDay'], // The last ones survived on Wrangel Island, in the Arctic, until around 4000 years ago.  (Wrangel 1457, Arctic 1487, 4000 1515)
  [1560, 1626, 'reveal', 'splitDone'], // Centuries after the pyramid was finished.  (centuries 1569, pyramid 1585, finished 1600)
  [1626, 1716, 'check2', 'studyDawn'], // So when something sounds ancient, check the dates.  (ancient 1662, check 1682, dates 1690)
  [1716, 1878, 'payoff', 'townDawn'],  // Because Oxford was already old, before the Aztec Empire was even born.  (Oxford 1718, old 1750, Aztec 1780, born 1812)
];
export const NF = 1878;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['ox', segAt(f)[3]];

// ---------- places (set-local -> world)
const O = { town: [-100000, 0, 0], hall: [-100000, 0, 800], lake: [-100000, 0, 1600], study: [-102500, 0, 0], split: [-102500, 0, 800] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const TWa = at(O.town), HLa = at(O.hall), LKa = at(O.lake), SDa = at(O.study), SPa = at(O.split);
const TW = (x, z, h = 0) => TWa(x, h, z), HL = (x, z, h = 0) => HLa(x, h, z), LK = (x, z, h = 0) => LKa(x, h, z), SD = (x, z, h = 0) => SDa(x, h, z), SP = (x, z, h = 0) => SPa(x, h, z);
const DY = 0.76, TLX = (y) => -0.6 + (y - 1000) / 500 * 1.2; // study desk top / timeline (ox_sets.js)

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(SDa(0.05, 1.36, 1.15), SDa(0.04, 0.88, -1.0), 44, 2.0, SDa(0.04, 0.85, -0.9)),
  check: C(SDa(0.28, 1.0, 0.3), SDa(0.0, 0.93, -0.8), 44, 3.0, SDa(0.0, 0.9, -0.8)),
  t1096: C(SDa(0, 0, 0), SDa(0, 0, -1), 44, 1, SDa(0, 0, -1)), // moving: see cam()
  t1167: C(TWa(-0.3, 1.5, 3.6), TWa(0.15, 1.65, -2.0), 44, 1.2, TWa(0.1, 1.2, -1.6)),
  grew: C(TWa(0.3, 1.9, 6.5), TWa(-0.3, 3.2, -24), 44, 0.8, TWa(0, 1.3, -1)),
  hall: C(HLa(0.4, 1.7, 2.4), HLa(0, 1.8, -8), 46, 1.2, HLa(0, 1.2, -4)),
  notyet: C(LKa(1.0, 1.35, 4.6), LKa(-0.6, 1.75, -4.0), 44, 1.2, LKa(-0.65, 1.8, -4.0)),
  t1325: C(LKa(3.6, 1.7, 6.6), LKa(0.5, 1.1, -7), 44, 1.0, LKa(0.8, 1.0, -5)),
  t1428: C(LKa(0.8, 1.55, -0.6), LKa(0, 2.7, -16), 44, 1.0, LKa(0, 1.2, -8.6)),
  gap: C(SDa(0.08, 1.7, 0.7), SDa(0.05, 0.78, -0.75), 44, 2.4, SDa(0.05, 0.78, -0.62)),
  how: C(SDa(0.34, 0.97, 0.05), SDa(0.0, 0.93, -0.82), 44, 3.0, SDa(0.0, 0.92, -0.82)),
  yousee: C(SDa(1.25, 1.38, 1.25), SDa(2.3, 1.08, -0.95), 44, 2.0, SDa(2.35, 1.05, -0.85)),
  pyr: C(SPa(-3.5, 1.8, 6), SPa(-6.5, 4.2, -28), 44, 0.8, SPa(-3.3, 1.0, -8)),
  wrangel: C(SPa(1.5, 1.7, 5.6), SPa(4.2, 1.9, -7), 44, 1.0, SPa(4.2, 1.4, -6.5)),
  reveal: C(SPa(0, 3.2, 12), SPa(-1.5, 3.2, -16), 46, 0.6, SPa(0, 1.5, -8)),
  check2: C(SDa(0.03, 1.45, 1.0), SDa(0.03, 1.15, -1.9), 44, 1.8, SDa(0.03, 0.95, -0.9)),
  payoff: C(TWa(0.2, 1.5, 2.2), TWa(2.0, 1.55, -3.0), 44, 1.4, TWa(2.1, 1.2, -3.0)),
};
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const mix = (A, B, t) => ({ p: lerp3(A.p, B.p, t), l: lerp3(A.l, B.l, t), fp: lerp3(A.fp, B.fp, t), fov: A.fov + (B.fov - A.fov) * t, cInf: A.cInf + (B.cInf - A.cInf) * t });
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.12, check: 0.12, t1096: 0.06, t1167: 0.1, grew: 0.05, hall: 0.08, notyet: 0.14, t1325: 0.1, t1428: 0.1, gap: 0.08, how: 0.14, yousee: 0.1, pyr: 0.06, wrangel: 0.1, reveal: 0, check2: 0.1, payoff: 0 };
const base = (k) => V[k] || V.hook;
function cam(k, f) {
  const s = segAt(f); let c;
  if (k === 't1096') { const A = C(TWa(0.0, 2.4, 12.5), TWa(0.5, 2.6, -10), 44, 0.8, TWa(1.5, 1.4, -3)), B = C(TWa(-0.7, 1.55, 3.1), TWa(1.9, 1.45, -3.1), 44, 1.2, TWa(2.0, 1.2, -3.0)); c = push(mix(A, B, sm(186, 232, f)), 0.06, 232, 287, f); }
  else if (k === 'pyr') { const A = V.pyr, B = C(SPa(2.0, 1.65, 6.4), SPa(3.8, 1.7, -6.5), 44, 1.0, SPa(3.8, 1.3, -6)); c = mix(push(A, 0.05, 1300, 1365, f), B, sm(1362, 1384, f)); }
  else if (k === 'payoff') { const A = V.payoff, B = C(TWa(-0.3, 7.6, 17), TWa(0.4, 3.0, -24), 46, 0.7, TWa(0.5, 1.5, -6)); c = mix(push(A, 0.08, 1716, 1745, f), B, sm(1745, 1878, f)); }
  else if (k === 'reveal') { const A = V.reveal, B = C(SPa(0, 7.6, 27), SPa(-1.5, 3.4, -16), 46, 0.6, SPa(0, 1.5, -8)); c = mix(A, B, sm(1560, 1626, f) * 0.7 + 0.3 * eo(1560, 1600, f)); }
  else c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const look = (d, f0, f1, fd) => { const t = sm(f0, f1, f); c = { ...c, l: add3(c.l, d.map((x) => x * t)), fp: add3(c.fp, (fd || d).map((x) => x * t)) }; };
  const orbit = (a, f0, f1) => { const t = sm(f0, f1, f) - 0.5, an = a * t, dx = c.p[0] - c.l[0], dz = c.p[2] - c.l[2]; c = { ...c, p: [c.l[0] + dx * Math.cos(an) - dz * Math.sin(an), c.p[1], c.l[2] + dx * Math.sin(an) + dz * Math.cos(an)] }; };
  if (k === 'hook') { look([-0.3, 0, 0], 0, 12, [-0.4, 0, 0]); look([0.3, 0, 0], 30, 44, [0.4, 0, 0]); look([0.32, 0, 0], 50, 64, [0.42, 0, 0]); look([-0.32, 0, 0], 72, 90, [-0.42, 0, 0]); punch(69, 75, 0.12); kick(69, 0.03); shake(70, 84, 0.012); }
  if (k === 'check') { punch(125, 131, 0.1); kick(125, 0.02); }
  if (k === 't1096') { punch(252, 258, 0.08); kick(252, 0.04); }
  if (k === 't1167') { punch(300, 306, 0.06); punch(359, 365, 0.12); kick(359, 0.04); shake(360, 372, 0.03); punch(412, 418, 0.08); }
  if (k === 'grew') { look([0, 1.6, -4], 466, 500, [0, 0.4, -6]); punch(481, 487, 0.08); }
  if (k === 'hall') { orbit(0.3, 521, 580); const t = sm(576, 600, f); const B = C(HLa(0.1, 1.45, -3.0), HLa(-0.9, 1.3, -6.0), 44, 1.6, HLa(-0.9, 1.2, -5.9)); c = { ...c, ...mix(c, B, t) }; punch(599, 605, 0.1); kick(599, 0.03); }
  if (k === 'notyet') { punch(670, 676, 0.06); punch(705, 711, 0.12); kick(705, 0.04); }
  if (k === 't1325') { orbit(0.25, 729, 844); punch(780, 786, 0.08); punch(811, 817, 0.06); }
  if (k === 't1428') { punch(858, 864, 0.06); punch(895, 901, 0.08); punch(934, 940, 0.12); kick(934, 0.04); }
  if (k === 'gap') { orbit(0.2, 973, 1077); punch(1045, 1051, 0.12); kick(1045, 0.02); }
  if (k === 'how') { punch(1084, 1090, 0.1); kick(1084, 0.02); }
  if (k === 'yousee') { orbit(-0.25, 1119, 1300); punch(1203, 1209, 0.12); kick(1203, 0.02); shake(1228, 1244, 0.02); }
  if (k === 'pyr') { punch(1328, 1334, 0.06); punch(1381, 1387, 0.08); punch(1405, 1411, 0.1); kick(1405, 0.04); }
  if (k === 'wrangel') { orbit(0.2, 1422, 1560); punch(1457, 1463, 0.06); punch(1515, 1521, 0.1); kick(1515, 0.03); }
  if (k === 'reveal') { kick(1600, 0.06); }
  if (k === 'check2') { punch(1682, 1688, 0.12); kick(1682, 0.03); }
  if (k === 'payoff') { kick(1750, 0.08); kick(1812, 0.06); }
  return c;
}
const HARD = new Set([1560]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[69, 0.35, 6], [102, 0.25, 8], [149, 0.85, 12], [252, 0.3, 6], [287, 0.3, 8], [359, 0.3, 6], [431, 0.25, 8], [481, 0.25, 6], [521, 0.4, 10], [643, 0.85, 12], [705, 0.3, 6], [729, 0.4, 10], [844, 0.6, 12], [934, 0.35, 8], [973, 0.85, 12], [1045, 0.3, 6], [1077, 0.25, 8], [1119, 0.4, 10], [1203, 0.3, 6], [1300, 0.85, 12], [1405, 0.3, 6], [1422, 0.3, 8], [1515, 0.3, 6], [1560, 0.9, 14], [1600, 0.3, 6], [1626, 0.6, 12], [1682, 0.3, 6], [1716, 0.5, 12], [1750, 0.35, 8], [1812, 0.3, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state
export function worldAt(f, w) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const X = w.ox; if (!X) return;
  X.set({
    grow: k === 'grew' ? sm(468, 506, f) : k === 'payoff' ? 1 : 0,
    rise: k === 't1325' ? sm(778, 816, f) : 1,
    span: k === 'gap' ? sm(994, 1045, f) : k === 'how' || k === 'check2' ? 1 : 0,
    drawer: k === 'yousee' ? Math.max(sm(1124, 1140, f) - 0.75 * sm(1192, 1200, f), 1.0 * sm(1226, 1234, f)) : 0,
    cards: k === 'yousee' ? (f < 1210 ? 1 - sm(1144, 1192, f) : sm(1230, 1266, f)) : 0,
    drag: 0 });
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const SY = (f, pos, opts = {}, extra = {}) => person(f, 'SANDY', 9, pos, { t: f, ...opts }, { s: 0.3, ...extra });
const MM = (f, seed, pos, opts = {}, extra = {}) => person(f, 'MAMMO', seed, pos, { t: f + seed * 13, ...opts }, { s: 4, ...extra });
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
const walkPh = (f, sp, seed = 0) => q((f * sp + seed * 0.37) % 1, 0.05);
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') A.push(SY(f, SD(0.04, -0.82, DY), { expr: f < 37 ? 'smile' : f < 69 ? 'sly' : 'shock', pose: f < 37 ? 'wave' : f < 69 ? 'point' : 'shock', look: f < 30 ? -1 : f < 69 ? 1 : 0, sand: 0.6 }, { s: 0.22, blob: false }));
  if (k === 'check') { const sp = sm(122, 136, f); A.push(SY(f, SD(0.0, -0.82, DY), { expr: f < 125 ? 'sly' : f < 136 ? 'dizzy' : 'happy', pose: f < 120 ? 'point' : f < 136 ? 'shock' : 'cheer', spin: sp < 1 && sp > 0 ? sp : 0, sand: f < 129 ? 0.15 : 0.92 }, { s: 0.22, blob: false })); }
  if (k === 't1096') { A.push(P(f, 'OX_MASTER', 11, TW(2.15, -3.0), { expr: f < 205 ? 'smile' : 'proud', prop: 'book', view: '34L', point: f > 210 && f < 250 ? 1 : undefined }));
    A.push(P(f, 'OX_SCH1', 12, TW(1.25, -2.15), { expr: f < 205 ? 'smile' : 'excited', view: '34R' })); A.push(P(f, 'OX_SCH4', 13, TW(1.05, -3.7), { expr: f < 252 ? 'happy' : 'laugh', view: '34R', prop: 'scroll' }, { s: 0.85 }));
    A.push(P(f, 'OX_TOWN1', 14, TW(-1.6, -9.5), { expr: 'smile', view: 'front' })); A.push(P(f, 'OX_TOWN2', 15, TW(-1.0, -12.6), { expr: 'happy', view: '34R' }));
    A.push(SY(f, TW(0.75, -1.4), { expr: f < 252 ? 'smile' : 'happy', pose: f < 252 ? 'stand' : 'cheer', sand: 0.7 }, { s: 0.3 })); }
  if (k === 't1167') { A.push(P(f, 'OX_KING', 21, TW(0.1, -1.7), { expr: f < 336 ? 'smug' : f < 359 ? 'proud' : 'angry', prop: 'decree', view: 'front', point: f > 405 ? 1 : undefined }));
    A.push(P(f, 'OX_SCH1', 12, TW(-1.05, -0.4), { expr: f < 359 ? 'surprised' : 'shock', view: '34R' })); A.push(P(f, 'OX_SCH2', 22, TW(1.15, -0.7), { expr: f < 359 ? 'nervous' : 'shock', view: '34L', prop: 'book' }));
    A.push(P(f, 'OX_TOWN1', 14, TW(-1.6, -5.5), { expr: f < 380 ? 'smile' : 'surprised', view: 'front' })); A.push(P(f, 'OX_TOWN2', 15, TW(1.5, -6.5), { expr: 'surprised', view: '34L' })); }
  if (k === 'grew') { for (const [o, sd, x, z0, sp] of [['OX_SCH1', 12, -0.7, -13, 0.07], ['OX_SCH2', 22, 0.5, -15, 0.065], ['OX_SCH3', 23, -0.2, -18, 0.06], ['OX_SCH4', 13, 0.9, -11, 0.07]]) { const z = z0 + (f - 431) * sp * 0.9; A.push(P(f, o, sd, TW(x, z), { expr: f < 470 ? 'happy' : 'excited', mode: 'march', phase: walkPh(f, 0.035, sd), view: 'front', prop: o === 'OX_SCH4' ? 'scroll' : undefined }, { s: o === 'OX_SCH4' ? 0.85 : 1 })); }
    A.push(SY(f, TW(-1.2, -3.0), { expr: f < 472 ? 'happy' : 'love', pose: f < 472 ? 'wave' : 'cheer', sand: 0.6 }, { s: 0.32 })); }
  if (k === 'hall') { A.push(P(f, 'OX_MASTER', 11, HL(0, -8.05, 0.35), { expr: f < 548 ? 'proud' : 'smile', view: 'front', prop: 'book', point: f > 530 && f < 570 ? 1 : undefined }));
    for (const [o, sd, x, z] of [['OX_SCH1', 31, -1.3, -3.0], ['OX_SCH4', 32, -2.5, -3.0], ['OX_SCH3', 33, 1.4, -3.0], ['OX_SCH2', 34, 2.6, -4.6], ['OX_SCH1', 35, -1.6, -4.6]]) A.push(P(f, o, sd, HL(x, z, 0.46), { expr: 'smile', mode: 'sit', view: 'back' }, { blob: false, s: o === 'OX_SCH4' ? 0.85 : 1 }));
    A.push(P(f, 'OX_SCH3', 37, HL(-1.35, -5.85), { expr: f < 580 ? 'smug' : f < 610 ? 'angry' : 'smug', view: '34R', point: f > 584 && f < 612 ? 1 : undefined })); A.push(P(f, 'OX_SCH4', 38, HL(-0.5, -6.0), { expr: f < 612 ? 'determined' : 'angry', view: '34L', prop: 'scroll', point: f > 612 ? 1 : undefined }, { s: 0.85 })); }
  if (k === 'notyet') A.push(SY(f, LK(0.35, -3.2, 0.16), { expr: f < 670 ? 'smile' : f < 705 ? 'sly' : 'shock', pose: f < 670 ? 'stand' : f < 705 ? 'shrug' : 'shock', sand: 0.55 }, { s: 0.3, blob: false }));
  if (k === 't1325') { A.push(P(f, 'MX_LEAD', 41, LK(0.95, -4.3, 0.12), { expr: f < 780 ? 'smile' : 'proud', view: '34R', point: f > 790 && f < 830 ? 1 : undefined }, { blob: false }));
    A.push(P(f, 'MX_ROW', 42, LK(1.55, -0.8, 0.14), { expr: 'happy', view: '34L', prop: 'paddle' }, { blob: false })); A.push(P(f, 'MX_WOM', 43, LK(2.6, -5.6, 0.1), { expr: f < 780 ? 'smile' : 'laugh', view: '34L', wave: f > 790 ? wav(f, 1, 0.3) : undefined }, { blob: false }));
    A.push(SY(f, LK(0.1, -3.0, 0.15), { expr: f < 780 ? 'smile' : 'love', pose: f < 780 ? 'stand' : 'cheer', sand: 0.45 }, { s: 0.28, blob: false })); }
  if (k === 't1428') { const j = sm(890, 910, f); for (const [o, sd, x, col] of [['TX_LEAD', 51, -1.25, '#2a5ad8'], ['MX_LEAD', 41, 0, '#c8302a'], ['TL_LEAD', 52, 1.25, '#e8a030']]) A.push(P(f, o, sd, LK(x * (1 - 0.3 * j), -8.7, 0.2), { expr: f < 895 ? 'smile' : f < 934 ? 'happy' : 'excited', view: x < 0 ? '34R' : x > 0 ? '34L' : 'front', prop: 'banner', bannerCol: col, cheer: f > 936 ? wav(f, sd, 0.3) : undefined })); }
  if (k === 'gap') A.push(SY(f, SD(TLX(1262), -0.84, DY), { expr: f < 1031 ? 'smile' : f < 1045 ? 'shock' : 'proud', pose: f < 1031 ? 'point' : f < 1045 ? 'shock' : 'hips', look: 1, sand: 0.4 }, { s: 0.2, blob: false }));
  if (k === 'how') A.push(SY(f, SD(0.0, -0.84, DY), { expr: f < 1084 ? 'sad' : 'sly', pose: f < 1084 ? 'stand' : 'shrug', sand: 0.35 }, { s: 0.22, blob: false }));
  if (k === 'yousee') A.push(SY(f, SD(2.32, -1.3, 1.32), { expr: f < 1203 ? 'smile' : f < 1228 ? 'proud' : 'shock', pose: f < 1203 ? 'point' : f < 1228 ? 'hips' : 'shock', look: -1, sand: 0.5 }, { s: 0.2, blob: false }));
  if (k === 'pyr') { for (const [sd, x, z] of [[61, -1.15, -9.0], [62, -0.75, -9.9]]) A.push(P(f, 'EG_WORK', sd, SP(x, z), { expr: 'determined', view: '34L', mode: 'march', phase: walkPh(f, 0.02, sd) }, { roll: -0.08 }));
    A.push(P(f, 'EG_WORK', 63, SP(-4.6, -7.0), { expr: f < 1356 ? 'smile' : 'happy', view: '34R', prop: 'block' }));
    A.push(MM(f, 71, SP(4.8, -9.5), { expr: f < 1405 ? 'smile' : 'happy', walk: walkPh(f, 0.012, 1), snow: true })); A.push(MM(f, 72, SP(3.6, -6.6), { expr: 'happy', kid: true, walk: walkPh(f, 0.014, 2) }, { s: 2.4 })); A.push(MM(f, 73, SP(8.5, -15), { expr: 'smile', walk: walkPh(f, 0.011, 3), snow: true })); }
  if (k === 'wrangel') { const dx = (f - 1422) * 0.006; A.push(MM(f, 71, SP(4.5 + dx, -9.5), { expr: f < 1515 ? 'smile' : 'happy', walk: walkPh(f, 0.012, 1), trunk: sm(1505, 1525, f) - sm(1545, 1558, f), snow: true }));
    A.push(MM(f, 72, SP(3.4 + dx, -6.6), { expr: 'happy', kid: true, walk: walkPh(f, 0.014, 2) }, { s: 2.4 })); A.push(MM(f, 73, SP(8.4 + dx, -15), { expr: 'smile', walk: walkPh(f, 0.011, 3), snow: true }));
    A.push(SY(f, SP(2.2, -3.4), { expr: f < 1487 ? 'worried' : f < 1515 ? 'shock' : 'happy', pose: f < 1515 ? 'shock' : 'cheer', sand: 0.3 }, { s: 0.3, roll: f < 1500 ? 0.03 * Math.sin(f * 1.7) : 0 })); }
  if (k === 'reveal') { for (const [sd, x, z, kid] of [[71, 5.4, -9.5, 0], [72, 4.3, -6.6, 1], [73, 9.2, -15, 0]]) A.push(MM(f, sd, SP(x, z), { expr: 'happy', kid: !!kid, walk: walkPh(f, 0.012, sd), snow: !kid }, { s: kid ? 2.4 : 4 }));
    A.push(SY(f, SP(0.5, -0.9), { expr: f < 1600 ? 'smile' : 'love', pose: f < 1600 ? 'point' : 'cheer', sand: 0.2 }, { s: 0.32 })); }
  if (k === 'check2') { A.push(P(f, 'OX_NOW', 81, SD(0.03, -1.95), { expr: f < 1662 ? 'smile' : f < 1682 ? 'surprised' : 'happy', view: '34R', prop: 'datecard', card: f < 1676 ? '1096' : '1428' }));
    A.push(SY(f, SD(0.12, -0.7, DY), { expr: f < 1682 ? 'sly' : 'happy', pose: f < 1682 ? 'hips' : 'point', look: -1, sand: 0.9 }, { s: 0.22, blob: false })); }
  if (k === 'payoff') { A.push(P(f, 'OX_MASTER', 11, TW(2.15, -3.0), { expr: f < 1750 ? 'smile' : 'proud', view: '34L', prop: 'book' })); A.push(P(f, 'OX_SCH1', 12, TW(1.3, -2.25), { expr: 'happy', view: '34R', wave: f > 1760 ? wav(f, 0, 0.3) : undefined }));
    A.push(P(f, 'OX_SCH3', 23, TW(1.2, -3.85), { expr: f < 1780 ? 'smile' : 'laugh', view: '34R' })); A.push(SY(f, TW(0.6, -2.9), { expr: f < 1750 ? 'happy' : 'love', pose: 'cheer', sand: 0.95 }, { s: 0.3 })); }
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
const tick = (f, f0, f1, a, b) => Math.round(a + (b - a) * sm(f0, f1, f));
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { sboard(f, 2, ['OXFORD', 'UNIVERSITY'], 'hook', 0.0, 0.66, 1.6, 0.48, F2, 35); sboard(f, 37, ['IS OLDER', 'THAN...'], 'hook', 0.0, 0.66, 1.6, 0.44, F2, 56); sboard(f, 58, ['THE AZTEC', 'EMPIRE?!'], 'hook', 0.0, 0.66, 1.6, 0.48, F2); sburst(f, 69, 'hook', 0.0, 0.66, 1.6, 0.55, F2); }
  if (k === 'check') { sboard(f, 104, ['SOUNDS', 'WRONG?'], 'check', 0.0, 0.66, 0.6, 0.44, F2, 122); stamp(f, 124, ['CHECK', 'THE DATES'], 'check', 0.0, 0.62, 0.6, 0.46, F2); }
  if (k === 't1096') { sboard(f, 165, ['OXFORD,', 'ENGLAND'], 't1096', 0.0, 0.66, 4, 0.42, F2, 202); sboard(f, 204, ['TEACHING...', 'IN SOME FORM'], 't1096', 0.0, 0.66, 3, 0.48, F2, 249); sboard(f, 251, ['BY 1096'], 't1096', 0.0, 0.68, 3, 0.38, F2); sburst(f, 252, 't1096', 0.0, 0.68, 3, 0.45, F2, '#ffe0a0'); }
  if (k === 't1167') { sboard(f, 292, ['1167'], 't1167', 0.0, 0.7, 3, 0.3, F2, 333); sboard(f, 335, ['KING', 'HENRY II'], 't1167', 0.0, 0.66, 3, 0.38, F2, 357); stamp(f, 359, ['BANNED!'], 't1167', 0.0, 0.64, 3, 0.4, F2, 405); stamp(f, 410, ['NO PARIS', 'FOR YOU!'], 't1167', 0.0, 0.62, 3, 0.46, F2); }
  if (k === 'grew') { sboard(f, 434, ['MANY CAME', 'HOME'], 'grew', 0.0, 0.66, 3, 0.42, F2, 466); sboard(f, 468, ['OXFORD', 'GREW FAST!'], 'grew', 0.0, 0.66, 3, 0.44, F2); sburst(f, 481, 'grew', 0.0, 0.66, 3, 0.5, F2); }
  if (k === 'hall') { sboard(f, 523, ['SCHOLARS', 'IN ROBES'], 'hall', 0.0, 0.66, 3, 0.4, F2, 546); sboard(f, 548, ['CANDLELIT', 'HALLS'], 'hall', 0.0, 0.66, 3, 0.4, F2, 576); sboard(f, 580, ['ARGUING', 'IN LATIN'], 'hall', 0.0, 0.66, 3, 0.4, F2);
    bubble(f, 584, ['ERGO!'], 'hall', -0.36, 0.3, 3, 0.36, 1, F2, 612); bubble(f, 612, ['SED...!'], 'hall', 0.36, 0.3, 3, 0.36, -1, F2); }
  if (k === 'notyet') { sboard(f, 645, ['MEANWHILE...', 'ACROSS THE ATLANTIC'], 'notyet', 0.0, 0.66, 3, 0.5, F2, 668); sboard(f, 670, ['TENOCHTITLAN?'], 'notyet', 0.0, 0.68, 3, 0.46, F2, 703); stamp(f, 705, ['NOT', 'YET!'], 'notyet', 0.0, 0.62, 3, 0.36, F2); }
  if (k === 't1325') { sboard(f, 731, ['AROUND', '1325'], 't1325', 0.0, 0.68, 3, 0.34, F2, 764); sboard(f, 766, ['THE MEXICA'], 't1325', 0.0, 0.68, 3, 0.4, F2, 808); sboard(f, 810, ['A CITY ON AN', 'ISLAND IN A LAKE'], 't1325', 0.0, 0.66, 3, 0.5, F2); sburst(f, 780, 't1325', 0.0, 0.3, 3, 0.5, F2); }
  if (k === 't1428') { sboard(f, 846, ['THE AZTEC', 'EMPIRE?'], 't1428', 0.0, 0.66, 3, 0.42, F2, 892); sboard(f, 894, ['TRIPLE', 'ALLIANCE'], 't1428', 0.0, 0.66, 3, 0.4, F2, 931); sboard(f, 933, ['1428'], 't1428', 0.0, 0.7, 3, 0.32, F2); sburst(f, 934, 't1428', 0.0, 0.7, 3, 0.45, F2, '#ffe0a0'); stars(f, 940, 't1428', 0.0, 0.3, 3, 0.55, F2, 24); }
  if (k === 'gap') { sboard(f, 976, ['BY THEN...'], 'gap', 0.0, 0.7, 1.5, 0.36, F2, 992); if (f > 994) F2.push({ fx: 'board', lines: [tick(f, 996, 1040, 0, 332) + ' YEARS'], pos: SB('gap', 0.0, 0.68, 1.5), size: SWD('gap', 0.44, 1.5) * back(994, 1004, f) }); stamp(f, 1045, ['OVER 300', 'YEARS!'], 'gap', 0.0, -0.2, 1.5, 0.42, F2); }
  if (k === 'how') { sboard(f, 1080, ['HOW?!'], 'how', 0.0, 0.68, 0.6, 0.32, F2); qmark(f, 1086, 'how', 0.32, 0.3, 0.6, 0.12, F2); }
  if (k === 'yousee') { sboard(f, 1121, ['YOU SEE...'], 'yousee', 0.0, 0.7, 2, 0.4, F2, 1142); sboard(f, 1144, ['EVERYTHING', 'OLD...'], 'yousee', 0.0, 0.66, 2, 0.42, F2, 1200); stamp(f, 1203, ['"ANCIENT"'], 'yousee', 0.0, 0.64, 2, 0.46, F2, 1224); sboard(f, 1236, ['HISTORY', 'OVERLAPS!'], 'yousee', 0.0, 0.66, 2, 0.44, F2); sburst(f, 1230, 'yousee', 0.0, 0.0, 2, 0.5, F2); }
  if (k === 'pyr') { sboard(f, 1303, ['ANOTHER', 'ONE...'], 'pyr', 0.0, 0.68, 4, 0.36, F2, 1326); sboard(f, 1328, ['THE GREAT', 'PYRAMID'], 'pyr', 0.0, 0.66, 4, 0.4, F2, 1362); sboard(f, 1378, ['WOOLLY', 'MAMMOTHS'], 'pyr', 0.0, 0.66, 4, 0.42, F2, 1403); stamp(f, 1405, ['STILL', 'ALIVE!'], 'pyr', 0.0, 0.62, 4, 0.36, F2); }
  if (k === 'wrangel') { sboard(f, 1440, ['THE LAST ONES:', 'WRANGEL ISLAND'], 'wrangel', 0.0, 0.66, 4, 0.5, F2, 1484); sboard(f, 1486, ['THE ARCTIC'], 'wrangel', 0.0, 0.68, 4, 0.4, F2, 1512); sboard(f, 1514, ['UNTIL ~4,000', 'YEARS AGO'], 'wrangel', 0.0, 0.66, 4, 0.48, F2); sburst(f, 1515, 'wrangel', 0.0, 0.66, 4, 0.5, F2, '#e0f0ff'); }
  if (k === 'reveal') { sboard(f, 1564, ['CENTURIES AFTER', 'THE PYRAMID'], 'reveal', 0.0, 0.66, 8, 0.5, F2, 1598); stamp(f, 1600, ['WAS', 'FINISHED'], 'reveal', 0.0, 0.62, 8, 0.4, F2); sburst(f, 1600, 'reveal', -0.3, 0.2, 8, 0.4, F2); }
  if (k === 'check2') { sboard(f, 1650, ['SOUNDS', 'ANCIENT?'], 'check2', 0.0, 0.66, 2, 0.4, F2, 1680); stamp(f, 1682, ['CHECK', 'THE DATES!'], 'check2', 0.0, 0.62, 2, 0.46, F2); }
  if (k === 'payoff') { sboard(f, 1719, ['OXFORD WAS', 'ALREADY OLD...'], 'payoff', 0.0, 0.66, 3, 0.5, F2, 1774); sboard(f, 1776, ['BEFORE THE', 'AZTEC EMPIRE'], 'payoff', 0.0, 0.66, 3, 0.46, F2, 1808); stamp(f, 1810, ['WAS EVEN', 'BORN!'], 'payoff', 0.0, 0.62, 3, 0.4, F2); stars(f, 1816, 'payoff', 0.0, 0.25, 3, 0.55, F2, 24); }
  return F2;
}
