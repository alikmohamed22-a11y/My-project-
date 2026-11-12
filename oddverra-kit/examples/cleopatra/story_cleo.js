// [CLEO-story] "Cleopatra lived closer to the Moon landing than to the pyramids" timeline (62.6 s voice + tail, 1930 f @ 30 fps).
// Sets: cleo_sets.js (giza / gizaLow / terrace / ruins / road / roadHigh / moon / classroom), driven through setAt.
// Pattern: story_napoleon.js (slow push per shot, zoom-through whips on cuts, screen-pinned boards / stamps, punch-ins on punchlines).
// PIP (a little living pyramid) turns up in every era: pushing blocks at Giza, sprinting down the timeline road, in sunglasses at the
// old pyramids, in a tiny diadem in Alexandria, in a fishbowl helmet on the Moon and in a school cap in the classroom.
import * as S from './story.js';
const { sm, eo, back, add3, dist, person, lerp } = S;
import { ROADZ } from './cleo_sets.js';

// [f0, f1, id, module, set]                      narration (word frames from work/words.json)
const SH = [
  [0, 52, 'hook', 'cleo', 'terrace'],          // Cleopatra lived closer to the Moon  (Cleopatra 3, Moon 49)
  [52, 96, 'hookMoon', 'cleo', 'moon'],         // landing...  (landing 57)
  [96, 128, 'hookPyr', 'cleo', 'giza'],         // than to the pyramids.  (pyramids 99)
  [128, 185, 'math', 'cleo', 'classroom'],      // Sounds wrong? Let's do the math.  (wrong 132, math 165)
  [185, 239, 'giza', 'cleo', 'giza'],           // The Great Pyramid of Giza was finished around  (Giza 207)
  [239, 300, 'date', 'cleo', 'gizaLow'],        // 2560 BC.  (2560 239, BC 270)
  [300, 397, 'khufu', 'cleo', 'giza'],          // Pharaoh Khufu wanted a tomb, and he wanted it big.  (Khufu 303, big 371)
  [397, 432, 'workers', 'cleo', 'giza'],        // Thousands of workers,  (workers 410)
  [432, 506, 'ramps', 'cleo', 'gizaLow'],       // giant ramps, very heavy rocks.  (giant 432, heavy 473)
  [506, 608, 'ff', 'cleo', 'road'],             // Now, fast-forward. Every marker on this road is a century.  (fast 517, century 588)
  [608, 663, 'keep', 'cleo', 'road'],           // Keep going, keep going.  (608, 632)
  [663, 740, 'born', 'cleo', 'road'],           // Cleopatra is born in 69 BC.  (69 697)
  [740, 828, 'gap', 'cleo', 'roadHigh'],        // That's about 2,500 years after the pyramid.  (2,500 751)
  [828, 872, 'notnew', 'cleo', 'ruins'],        // To her, the pyramids weren't new.  (new 864)
  [872, 948, 'tourist', 'cleo', 'ruins'],       // They were ancient tourist attractions.  (tourist 900)
  [948, 1004, 'herod', 'cleo', 'ruins'],        // Greek travelers like Herodotus had visited them  (Herodotus 967)
  [1004, 1071, 'herod2', 'cleo', 'ruins'],      // four centuries before she was born.  (four 1004)
  [1071, 1139, 'blood', 'cleo', 'terrace'],     // And Cleopatra wasn't even Egyptian by blood.  (blood 1119)
  [1139, 1197, 'greek', 'cleo', 'terrace'],     // Her family was Macedonian Greek.  (Macedonian 1157)
  [1197, 1308, 'learn', 'cleo', 'terrace'],     // She was reportedly the first in her dynasty to actually learn Egyptian.  (first 1225, learn 1271)
  [1308, 1374, 'ff2', 'cleo', 'road'],          // Now fast-forward again, all the way to  (fast 1319)
  [1374, 1424, 'y1969', 'cleo', 'road'],        // 1969.  (1374)
  [1424, 1474, 'apollo', 'cleo', 'moon'],       // Apollo 11 lands on the Moon.  (Apollo 1424, Moon 1457)
  [1474, 1534, 'twok', 'cleo', 'roadHigh'],     // That's only about 2,000 years.  (2,000 1493)
  [1534, 1617, 'backfwd', 'cleo', 'roadHigh'],  // 2,500 years back. 2,000 forward.  (1534, 1578)
  [1617, 1696, 'closer', 'cleo', 'road'],       // Cleopatra is closer to the astronauts...  (astronauts 1659)
  [1696, 1723, 'builders', 'cleo', 'road'],     // than to the pyramid builders.  (builders 1711)
  [1723, 1805, 'which', 'cleo', 'classroom'],   // Which means the pyramids were older to Cleopatra...  (older 1789)
  [1805, 1930, 'you', 'cleo', 'classroom'],     // than Cleopatra is to you.  (Cleopatra 1845, you 1877)
];
export const NF = 1930;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
const LIGHT = { classroom: 'office' };
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: LIGHT[s[4]] || 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.day;
export const TALKER = {}; // narrator not lip-synced
export const setAt = (f) => { const s = segAt(f); return [s[3], s[4]]; };

// ---------- places (local set coords -> world; origins from cleo_sets.js) ----------
const at = (o) => (p) => [p[0] + o[0], p[1] + o[1], p[2] + o[2]];
const GZ = at([-52000, 0, 0]), TE = at([-52000, 0, 800]), RU = at([-52000, 0, 1600]), RD = at([-54500, 0, 0]), MO = at([-54500, 0, 800]), CL = at([-54500, 0, 1600]);
const zP = ROADZ(-2560), zC = ROADZ(-69), zM = ROADZ(1969);
// the timeline flights: camera z along the road (local), continuous across the cuts
const fly1 = (f) => 14 - (14 - (zC + 7)) * sm(506, 738, f);
const fly2 = (f) => (zC + 7) - ((zC + 7) - (zM + 18)) * sm(1306, 1400, f);

// ---------- cameras ----------
const C = (W, p, l, fov, cInf, fp) => ({ p: W(p), l: W(l), fov, cInf, fp: W(fp || l) });
const V = {
  hook: C(TE, [0.6, 1.3, 3.7], [0.0, 2.0, -3.0], 52, 1.6, [-0.3, 1.4, -1.4]),
  hookMoon: C(MO, [0.3, 1.5, 2.6], [0.9, 1.9, -4.0], 50, 1.6, [0.7, 1.3, -2.4]),
  hookPyr: C(GZ, [0.4, 1.7, 5.0], [-6, 4.5, -60], 52, 1.2, [0.2, 1.0, -3.0]),
  math: C(CL, [0.2, 1.45, 2.3], [0.0, 1.35, -3.0], 52, 1.6, [0.0, 1.3, -1.8]),
  giza: C(GZ, [0.2, 2.6, 9.0], [-5, 6.5, -60], 52, 1.0, [0, 1.0, -3.0]),
  date: C(GZ, [2.2, 0.35, 1.6], [0.0, 9, -80], 54, 1.2, [0.8, 1.0, -3.0]),
  khufu: C(GZ, [-0.9, 1.45, 3.4], [-2.4, 1.3, -1.6], 48, 2.4, [-2.3, 1.3, -1.1]),
  workers: C(GZ, [0.6, 1.4, 2.8], [-1.6, 1.0, -3.0], 48, 2.0, [-0.8, 1.0, -3.0]),
  ramps: C(GZ, [2.6, 0.42, 0.9], [0.2, 1.2, -3.4], 50, 2.0, [0.4, 0.8, -3.0]),
  gap: C(RD, [10, 520, (zP + zC) / 2 + 100], [10, 0, (zP + zC) / 2], 34, 0, [12, 0, (zP + zC) / 2]),
  notnew: C(RU, [0.4, 1.4, 4.4], [0.0, 7.0, -60], 52, 1.4, [-0.3, 1.2, -1.2]),
  tourist: C(RU, [2.0, 1.4, 2.8], [-0.6, 2.6, -30], 50, 1.8, [0.9, 1.3, -1.8]),
  herod: C(RU, [0.9, 1.5, 2.6], [-0.4, 2.2, -12], 50, 1.8, [-0.4, 1.3, -1.4]),
  herod2: C(RU, [0.25, 1.5, 0.5], [-0.45, 1.3, -1.5], 46, 2.8, [-0.45, 1.3, -1.4]),
  blood: C(TE, [0.35, 1.45, 2.1], [0.15, 1.4, -1.5], 50, 2.2, [0.15, 1.3, -1.0]),
  greek: C(TE, [-1.1, 1.5, 1.6], [-2.9, 1.5, -2.2], 48, 2.4, [-2.2, 1.4, -0.9]),
  learn: C(TE, [1.4, 1.35, 1.4], [1.3, 1.15, -1.5], 48, 2.6, [1.2, 1.1, -0.9]),
  twok: C(RD, [6, 680, -150 + 116], [6, 0, -150], 32, 0, [6, 0, -150]),
  backfwd: C(RD, [6, 680, -150 + 116], [6, 0, -150], 32, 0, [6, 0, -150]),
  apollo: C(MO, [-0.1, 1.45, 1.1], [-1.6, 1.5, -3.6], 48, 2.2, [-1.4, 1.3, -3.4]),
  closer: C(RD, [-0.1, 1.5, zC + 5.0], [-2.0, 4.0, zC - 80], 50, 1.6, [-0.9, 1.3, zC]),
  builders: C(RD, [-0.2, 1.5, zC - 5.0], [-3.0, 3.5, zC + 80], 50, 1.6, [-0.6, 1.3, zC]),
  which: C(CL, [0.5, 1.45, 2.2], [0.0, 1.4, -3.0], 52, 1.8, [0.1, 1.4, -1.8]),
  you: C(CL, [0.8, 1.3, 1.0], [0.6, 1.15, -1.6], 46, 3.0, [0.7, 1.1, -1.4]),
};
function flyCam(k, f) {
  if (k === 'ff' || k === 'keep' || k === 'born') { const z = fly1(f), arrive = sm(690, 738, f); return C(RD, [lerp(1.2, 1.0, arrive), lerp(1.9, 1.5, arrive), z], [lerp(0.2, -2.0, arrive), lerp(1.5, 2.2, arrive), z - lerp(30, 8, arrive)], 54, 1.2, [-1, 1.2, z - 7]); }
  if (k === 'ff2' || k === 'y1969') { const z = fly2(f), up = sm(1384, 1424, f), arrive = sm(1376, 1400, f); return C(RD, [lerp(1.2, 4, arrive), lerp(1.9, 2.5, arrive), z], [lerp(0.2, -10, arrive), lerp(1.5, 8 + 22 * up, arrive), z - lerp(30, 18, arrive)], lerp(54, 56, arrive), 1.0, [-8, 6, z - 16]); }
  return null; }
const push = (v, k, f0, f1, f, raw) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), m = raw ? 1 : Math.min(L, 5) / L; return { ...v, p: add3(v.p, d.map((x) => x * k * t * m)) }; }; // push capped at 5 m of travel for far look targets
const PUSH = { gap: 0.12, twok: 0.04, backfwd: 0.0, hook: 0.07, date: 0.04 };
function cam(k, f) {
  const s = segAt(f); const fc = flyCam(k, f); let c = fc || push(V[k] || V.hook, PUSH[k] ?? 0.08, s[0], s[1], f, ['gap', 'twok', 'backfwd'].includes(k));
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f >= f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [k2 * Math.sin(f * 2.1), k2 * Math.sin(f * 2.7 + 1), 0]) }; };
  if (k === 'hook') { punch(3, 10, 0.06); kick(3, 0.02); punch(46, 52, 0.08); }
  if (k === 'hookMoon') { punch(57, 64, 0.1); kick(57, 0.03); }
  if (k === 'hookPyr') { punch(99, 106, 0.14); kick(99, 0.04); }
  if (k === 'math') punch(165, 172, 0.1);
  if (k === 'giza') punch(207, 214, 0.05);
  if (k === 'date') { punch(239, 246, 0.1); kick(239, 0.3); }
  if (k === 'khufu') { punch(303, 310, 0.08); punch(371, 377, 0.14); kick(371, 0.03); }
  if (k === 'workers') punch(410, 416, 0.06);
  if (k === 'ramps') { punch(473, 479, 0.1); shake(473, 495, 0.02); }
  if (k === 'born') { punch(697, 704, 0.12); kick(697, 0.02); }
  if (k === 'gap') punch(751, 758, 0.06);
  if (k === 'notnew') punch(864, 870, 0.1);
  if (k === 'tourist') punch(900, 906, 0.08);
  if (k === 'herod') punch(967, 973, 0.08);
  if (k === 'herod2') punch(1004, 1010, 0.06);
  if (k === 'blood') { punch(1119, 1125, 0.1); kick(1119, 0.02); }
  if (k === 'greek') punch(1157, 1164, 0.1);
  if (k === 'learn') punch(1271, 1278, 0.1);
  if (k === 'y1969') shake(1390, 1424, 0.08);
  if (k === 'apollo') { punch(1457, 1463, 0.1); kick(1457, 0.02); }
  if (k === 'twok') punch(1493, 1500, 0.05);
  if (k === 'closer') { punch(1659, 1666, 0.12); kick(1659, 0.03); }
  if (k === 'builders') punch(1711, 1717, 0.08);
  if (k === 'which') punch(1789, 1796, 0.08);
  if (k === 'you') { punch(1845, 1853, 0.06); punch(1877, 1886, 0.07); kick(1877, 0.03); }
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
  for (const [c, a, n] of [[3, 0.3, 8], [57, 0.4, 10], [99, 0.5, 10], [239, 0.4, 10], [371, 0.4, 8], [697, 0.5, 10], [864, 0.3, 8], [1157, 0.3, 8], [1374, 0.4, 10], [1457, 0.4, 10], [1659, 0.4, 10], [1845, 0.4, 10], [1877, 0.6, 12]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'day' };
}

// ---------- world state ----------
const sledK = (k, f) => k === 'hookPyr' ? 0.1 + 0.2 * sm(96, 128, f) : k === 'workers' ? 0.1 + 0.4 * sm(397, 432, f) : k === 'ramps' ? 0.5 + 0.5 * sm(436, 500, f) : 0.1;
export function worldAt(f, w) {
  const k = segAt(f)[2], Q = w.cleo;
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  if (!Q) return;
  Q.sledge(sledK(k, f));
  Q.launch(k === 'y1969' ? sm(1392, 1424, f) : 0);
  Q.span(k === 'gap' ? sm(750, 772, f) : ['twok', 'backfwd'].includes(k) ? 1 : 0, k === 'twok' ? sm(1490, 1512, f) : k === 'backfwd' ? 1 : 0);
  Q.plant(k === 'apollo' ? sm(1426, 1448, f) : 1);
}

// ---------- actors ----------
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const hop = (f, i = 0, a = 0.04, sp = 0.35) => [0, a * Math.abs(Math.sin(f * sp + i)), 0];
const PIP = (f, pos, opts = {}, extra = {}) => P(f, 'PIP', 9, pos, { ...opts }, { s: 0.46, blob: false, ...extra });
const CLEO = (f, pos, opts = {}) => P(f, 'CLEO', 1, pos, { view: 'front', ...opts }, { s: 1.0 });
export function actorsAt(f) {
  const k = segAt(f)[2], A = [];
  if (k === 'hook') { A.push(CLEO(f, TE([-0.2, 0, -1.4]), { expr: f < 30 ? 'smug' : 'surprised', point: f >= 30 ? 1 : 0, raise: f >= 30 ? 1 : 0, reach: 1, view: f < 30 ? 'front' : '34R' }));
    A.push(PIP(f, TE([0.6, 0, -0.9]), { expr: f < 30 ? 'smile' : 'shock', acc: 'crown', new: 1 })); }
  if (k === 'hookMoon') { A.push(P(f, 'ASTRO', 2, MO([0.7, 0, -2.4]), { expr: 'excited', wave: 0.8, view: 'front' }));
    A.push(PIP(f, MO(add3([1.75, 0, -2.0], hop(f, 1, 0.06, 0.3))), { expr: 'happy', pose: 'cheer', acc: 'helmet' })); }
  if (k === 'hookPyr' || k === 'giza' || k === 'workers') { const sx = 1.4 - 2.2 * sledK(k, f);
    [['WORK1', 11, 2.1, -3.15], ['WORK2', 12, 2.85, -2.85], ['WORK3', 13, 3.6, -3.2]].forEach(([o, sd, dx, z], i) => A.push(P(f, o, sd, GZ(add3([sx - dx, 0, z], hop(f, i, 0.02, 0.5))), { expr: k === 'workers' ? ['determined', 'grin', 'nervous'][i] : 'determined', view: 'sideL', reach: 1 })));
    if (k !== 'workers') A.push(P(f, 'OVERSEER', 14, GZ([-3.2, 0, -1.5]), { expr: 'mean', prop: 'staff', reach: 0.4, view: '34R' }));
    if (k === 'workers') A.push(PIP(f, GZ([sx + 1.25, 0, -2.6]), { expr: 'proud', pose: 'push', flip: true })); }
  if (k === 'date') A.push(PIP(f, GZ([2.0, 0, -0.9]), { expr: f < 239 ? 'smile' : 'shock', pose: f < 239 ? 'point' : 'shock', look: -1 }));
  if (k === 'khufu') { A.push(P(f, 'KHUFU', 21, GZ([-2.25, 0, -1.05]), { expr: f < 330 ? 'determined' : f < 371 ? 'smug' : 'excited', prop: 'plan', reach: 0.9, raise: f >= 371 ? 1 : 0, view: '34R' }));
    A.push(P(f, 'OVERSEER', 14, GZ([-3.6, 0, -2.0]), { expr: f < 371 ? 'nervous' : 'shock', prop: 'staff', reach: 0.4, view: '34R' })); }
  if (k === 'ramps') { const sx = 1.4 - 2.2 * sledK(k, f);
    A.push(PIP(f, GZ([sx + 1.3, 0, -2.75]), { expr: f < 473 ? 'proud' : 'shock', pose: 'push', flip: true }, { s: 0.5 }));
    [['WORK2', 12, 2.85, -2.85], ['WORK1', 11, 2.1, -3.15]].forEach(([o, sd, dx, z]) => A.push(P(f, o, sd, GZ([sx - dx, 0, z]), { expr: 'determined', view: 'sideL', reach: 1 }))); }
  if (k === 'ff' || k === 'keep' || k === 'born') { const z = fly1(f), stop = sm(700, 740, f);
    A.push(PIP(f, RD([lerp(0.9, 0.6, stop), 0, Math.max(z - 4.2, zC + 2.6)]), { expr: k === 'keep' ? 'dizzy' : k === 'born' && f > 705 ? 'happy' : 'smile', pose: f < 712 ? 'run' : 'wave', flip: true }));
    if (k === 'born' || k === 'keep') A.push(CLEO(f, RD([-1.8, 0, zC - 0.4]), { expr: f < 697 ? 'smile' : 'happy', wave: f > 697 ? 0.8 : undefined, view: 'front' })); }
  if (k === 'notnew' || k === 'tourist') { A.push(CLEO(f, RU([-0.45, 0, -1.1]), { expr: k === 'notnew' && f < 860 ? 'smile' : 'smug', cross: k === 'notnew' && f >= 860 ? 1 : 0, view: k === 'tourist' ? '34L' : 'front' }));
    A.push(PIP(f, RU([0.55, 0, -0.85]), { expr: k === 'notnew' && f < 860 ? 'smile' : 'sly', pose: 'shrug', acc: 'shades' }));
    if (k === 'tourist') { A.push(P(f, 'GREEK1', 31, RU([0.95, 0, -1.9]), { expr: 'excited', point: 1, reach: 1, raise: 1, view: '34L' })); A.push(P(f, 'GREEK2', 32, RU([1.75, 0, -2.3]), { expr: 'happy', view: '34L' })); } }
  if (k === 'herod' || k === 'herod2') { A.push(P(f, 'HERODOTUS', 41, RU([-0.45, 0, -1.4]), { expr: k === 'herod' ? (f < 967 ? 'excited' : 'happy') : 'thoughtful', prop: 'scroll', reach: 0.8, view: '34R' }));
    if (k === 'herod') A.push(P(f, 'GREEK1', 31, RU([0.75, 0, -2.0]), { expr: 'surprised', point: 1, reach: 1, raise: 1, view: '34L' })); }
  if (k === 'blood') { A.push(CLEO(f, TE([0.15, 0, -1.0]), { expr: f < 1101 ? 'smile' : 'smug', cross: f >= 1101 ? 1 : 0, view: 'front' })); A.push(PIP(f, TE([1.0, 0, -0.75]), { expr: f < 1119 ? 'smile' : 'shock', acc: 'crown', new: 1 })); }
  if (k === 'greek') A.push(CLEO(f, TE([-1.75, 0, -0.75]), { expr: f < 1157 ? 'smile' : 'happy', point: 1, reach: 1, view: '34L' }));
  if (k === 'learn') { A.push(CLEO(f, TE([1.05, 0, -0.95]), { expr: f < 1271 ? 'thoughtful' : 'excited', prop: 'glyphs', reach: 0.85, view: '34L' }));
    A.push(PIP(f, TE(add3([1.95, 0, -1.25], f > 1271 ? hop(f, 2, 0.05, 0.4) : [0, 0, 0])), { expr: f < 1271 ? 'smile' : 'love', pose: f < 1271 ? 'stand' : 'cheer', acc: 'crown', new: 1 })); }
  if (k === 'ff2' || k === 'y1969') { const z = fly2(f), stop = sm(1380, 1400, f); A.push(PIP(f, RD([lerp(0.9, 2.6, stop), 0, Math.max(z - 4.2, zM + 13)]), { expr: k === 'y1969' ? 'shock' : 'smile', pose: f < 1396 ? 'run' : 'shock', flip: f < 1396 })); }
  if (k === 'apollo') { A.push(P(f, 'ASTRO', 2, MO([-1.05, 0, -3.25]), { expr: f < 1457 ? 'determined' : 'excited', reach: 0.8, raise: f < 1448 ? 1 : 0, wave: f >= 1457 ? 0.8 : undefined, view: '34L' }));
    A.push(PIP(f, MO([0.0, 0, -2.6]), { expr: f < 1457 ? 'smile' : 'love', pose: f < 1457 ? 'stand' : 'cheer', acc: 'helmet' })); }
  if (k === 'closer') { A.push(CLEO(f, RD([-0.5, 0, zC]), { expr: f < 1659 ? 'smile' : 'excited', point: 1, reach: 1, raise: 1, view: '34L' })); A.push(PIP(f, RD([0.4, 0, zC - 0.5]), { expr: 'happy', pose: 'point', acc: 'crown', new: 1 }));
    A.push(P(f, 'ASTRO', 2, RD([-3.0, 0, zM + 8]), { expr: 'excited', wave: 0.9, view: 'front' })); }
  if (k === 'builders') { A.push(CLEO(f, RD([-0.6, 0, zC]), { expr: 'smug', view: 'front' })); A.push(PIP(f, RD([0.3, 0, zC + 0.5]), { expr: 'sly', pose: 'shrug', acc: 'crown', new: 1 })); }
  if (k === 'math' || k === 'which') { A.push(P(f, 'TEACHER', 51, CL([-0.65, 0, -2.2]), { expr: k === 'math' ? (f < 160 ? 'smile' : 'excited') : 'smile', prop: 'pointer', reach: 0.95, raise: 1, view: '34R' }));
    A.push(P(f, 'KID', 52, CL([0.45, 0, -1.55]), { expr: k === 'math' ? (f < 150 ? 'surprised' : 'thoughtful') : f < 1789 ? 'thoughtful' : 'surprised', view: k === 'which' && f < 1760 ? '34BL' : 'front' }));
    A.push(PIP(f, CL([-0.25, 0, -1.7]), { expr: k === 'which' && f > 1789 ? 'shock' : 'smile', pose: k === 'math' && f > 165 ? 'cheer' : 'stand', acc: 'cap' })); }
  if (k === 'you') { A.push(P(f, 'KID', 52, CL([0.45, 0, -1.55]), { expr: f < 1845 ? 'thoughtful' : f < 1890 ? 'shock' : 'laugh', view: 'front', handsUp: f >= 1845 && f < 1890 ? 1 : 0 }));
    A.push(PIP(f, CL(add3([1.05, 0, -2.0], f > 1890 ? hop(f, 3, 0.05, 0.4) : [0, 0, 0])), { expr: f < 1845 ? 'smile' : f < 1890 ? 'shock' : 'happy', pose: f < 1890 ? 'stand' : 'wave', acc: 'cap' })); }
  return A;
}

// ---------- effects ----------
const ASP = 1080 / 1920; let CURF = 0;
function SB(k, x, y, z) { const c = cam(k, CURF), n = (v) => { const l = Math.hypot(...v); return v.map((u) => u / l); }, fw = n([c.l[0] - c.p[0], c.l[1] - c.p[1], c.l[2] - c.p[2]]), r = n([-fw[2], 0, fw[0]]), u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]], t = Math.tan(c.fov * Math.PI / 360);
  return [0, 1, 2].map((i) => c.p[i] + fw[i] * z + r[i] * x * t * ASP * z + u[i] * y * t * z); }
const SW = (k, w, z) => 2 * w * z * Math.tan(cam(k, CURF).fov * Math.PI / 360) * ASP;
const board = (f, f0, lines, pos, size, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'board', lines, pos, size: size * back(f0, f0 + 12, f) }); };
const sboard = (f, f0, lines, k, x, y, z, w, F2, f1) => board(f, f0, lines, SB(k, x, y, z), SW(k, w, z), F2, f1);
const burst = (f, f0, pos, size, F2, col = '#fff3b0', n = 12) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'burst', t: (f - f0) / n, pos, size, col, rays: 10 }); };
const sburst = (f, f0, k, x, y, z, w, F2, col, n) => burst(f, f0, SB(k, x, y, z), SW(k, w, z), F2, col, n);
const stars = (f, f0, k, x, y, z, w, F2, per = 30) => { if (f >= f0) F2.push({ fx: 'stars', t: ((f - f0) / per) % 1, pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 10, f) }); };
const stamp = (f, f0, lines, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) { const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos: SB(k, x, y, z), size: SW(k, w, z) * (1.6 - 0.6 * t * t), op: Math.min(1, t * 2) }); } };
const puff = (f, f0, pos, size, F2, n = 14, tint) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'puff', t: (f - f0) / n, pos, size, tint }); };
export function fxAt(f) {
  const k = segAt(f)[2], F2 = []; CURF = f;
  if (k === 'hook') { sboard(f, 2, ['CLEOPATRA', '69–30 BC'], 'hook', 0.0, 0.64, 1.2, 0.5, F2); sburst(f, 46, 'hook', 0.45, 0.42, 1.2, 0.3, F2, '#fff3b0', 10); }
  if (k === 'hookMoon') { sboard(f, 54, ['THE MOON LANDING', '1969'], 'hookMoon', 0.0, 0.64, 1.2, 0.5, F2); stars(f, 58, 'hookMoon', 0.0, 0.38, 1.2, 0.4, F2, 24); }
  if (k === 'hookPyr') { stamp(f, 98, ['...THAN TO', 'THE PYRAMIDS?!'], 'hookPyr', 0.0, 0.6, 1.2, 0.56, F2); sburst(f, 99, 'hookPyr', 0.0, 0.25, 1.2, 0.6, F2, '#fff3b0', 12); }
  if (k === 'math') { sboard(f, 129, ['SOUNDS WRONG?'], 'math', 0.0, 0.66, 1.0, 0.44, F2, 160); stamp(f, 162, ["LET'S DO", 'THE MATH'], 'math', 0.0, 0.62, 1.0, 0.5, F2); }
  if (k === 'giza') sboard(f, 192, ['THE GREAT PYRAMID', 'OF GIZA'], 'giza', 0.0, 0.64, 1.4, 0.52, F2);
  if (k === 'date') { stamp(f, 238, ['FINISHED', 'c. 2560 BC'], 'date', 0.0, 0.6, 1.2, 0.52, F2); sburst(f, 239, 'date', 0.0, 0.2, 1.2, 0.6, F2, '#fff3b0', 12); puff(f, 240, GZ([0.9, 0.5, -1.6]), 0.5, F2, 14, '#f4e0b8'); }
  if (k === 'khufu') { sboard(f, 302, ['PHARAOH KHUFU', 'WANTS A TOMB'], 'khufu', 0.0, 0.64, 1.2, 0.52, F2, 368); stamp(f, 370, ['BIG.'], 'khufu', 0.0, 0.6, 1.2, 0.4, F2); sburst(f, 371, 'khufu', 0.0, 0.2, 1.2, 0.6, F2, '#fff3b0', 12); }
  if (k === 'workers') sboard(f, 399, ['THOUSANDS', 'OF WORKERS'], 'workers', 0.0, 0.64, 1.2, 0.46, F2);
  if (k === 'ramps') { sboard(f, 433, ['GIANT RAMPS'], 'ramps', 0.0, 0.66, 1.2, 0.44, F2, 468); stamp(f, 470, ['VERY HEAVY', 'ROCKS'], 'ramps', 0.0, 0.62, 1.2, 0.5, F2); for (const f0 of [474, 484, 494]) puff(f, f0, GZ([-0.1 - (f0 - 474) * 0.03, 0.15, -3.0]), 0.5, F2, 12, '#f4e0b8'); }
  if (k === 'ff') { sboard(f, 515, ['FAST-FORWARD ▶▶'], 'ff', 0.0, 0.66, 1.2, 0.5, F2, 560); sboard(f, 562, ['1 SIGN', '= 100 YEARS'], 'ff', 0.0, 0.64, 1.2, 0.46, F2); }
  if (k === 'keep') { stamp(f, 609, ['KEEP GOING...'], 'keep', 0.0, 0.62, 1.2, 0.5, F2, 631); stamp(f, 633, ['KEEP GOING!'], 'keep', 0.0, 0.62, 1.2, 0.5, F2); }
  if (k === 'born') { sboard(f, 664, ['CLEOPATRA', 'IS BORN'], 'born', 0.0, 0.66, 1.2, 0.46, F2, 695); stamp(f, 696, ['69 BC'], 'born', 0.0, 0.62, 1.2, 0.44, F2); sburst(f, 697, 'born', 0.0, 0.25, 1.2, 0.6, F2, '#ffb0c8', 14); }
  if (k === 'gap') sboard(f, 748, ['PYRAMID ➜ CLEOPATRA'], 'gap', 0.0, 0.8, 1.2, 0.44, F2);
  if (k === 'notnew') { sboard(f, 830, ['TO HER...'], 'notnew', 0.0, 0.66, 1.2, 0.36, F2, 860); stamp(f, 862, ['NOT NEW!'], 'notnew', 0.0, 0.62, 1.2, 0.44, F2); }
  if (k === 'tourist') { sboard(f, 885, ['ANCIENT', 'TOURIST ATTRACTION'], 'tourist', 0.0, 0.64, 1.2, 0.54, F2); stars(f, 902, 'tourist', 0.0, 0.4, 1.2, 0.4, F2, 24); }
  if (k === 'herod') sboard(f, 962, ['HERODOTUS', 'GREEK TRAVELER'], 'herod', 0.0, 0.64, 1.2, 0.5, F2);
  if (k === 'herod2') stamp(f, 1006, ['VISITED c. 450 BC', '~400 YEARS BEFORE HER'], 'herod2', 0.0, 0.6, 1.0, 0.58, F2);
  if (k === 'blood') sboard(f, 1074, ['NOT EGYPTIAN', 'BY BLOOD?'], 'blood', 0.0, 0.64, 1.2, 0.48, F2);
  if (k === 'greek') { stamp(f, 1155, ['MACEDONIAN', 'GREEK'], 'greek', 0.0, 0.6, 1.2, 0.5, F2); sburst(f, 1157, 'greek', 0.0, 0.25, 1.2, 0.6, F2, '#cfe0ff', 12); }
  if (k === 'learn') { sboard(f, 1207, ['(REPORTEDLY)'], 'learn', 0.0, 0.42, 1.2, 0.3, F2); sboard(f, 1222, ['FIRST OF HER FAMILY', 'TO LEARN EGYPTIAN'], 'learn', 0.0, 0.64, 1.2, 0.56, F2); stars(f, 1273, 'learn', 0.3, 0.1, 1.2, 0.3, F2, 24); }
  if (k === 'ff2') sboard(f, 1318, ['FAST-FORWARD', 'AGAIN ▶▶'], 'ff2', 0.0, 0.66, 1.2, 0.46, F2);
  if (k === 'y1969') { stamp(f, 1375, ['1969'], 'y1969', 0.0, 0.62, 1.2, 0.4, F2); for (const f0 of [1392, 1400, 1408]) puff(f, f0, RD([-12 + (f0 % 3) * 1.5 - 1.5, 0.8, zM + 2]), 6, F2, 16, '#f0ece4'); }
  if (k === 'apollo') { sboard(f, 1426, ['APOLLO 11'], 'apollo', 0.0, 0.66, 1.2, 0.4, F2, 1455); stamp(f, 1456, ['LANDS ON', 'THE MOON'], 'apollo', 0.0, 0.62, 1.2, 0.5, F2); sburst(f, 1457, 'apollo', 0.0, 0.25, 1.2, 0.6, F2, '#fff3b0', 12); }
  if (k === 'twok') sboard(f, 1478, ['CLEOPATRA ➜ MOON'], 'twok', 0.42, 0.8, 1.2, 0.4, F2);
  if (k === 'backfwd') { sboard(f, 1535, ['2,500 YEARS BACK'], 'backfwd', 0.42, 0.8, 1.2, 0.4, F2, 1576); sboard(f, 1578, ['2,000 YEARS FORWARD'], 'backfwd', 0.42, 0.8, 1.2, 0.42, F2);
    sburst(f, 1536, 'backfwd', 0.35, -0.25, 1.2, 0.45, F2, '#ffb0b0', 14); sburst(f, 1580, 'backfwd', 0.35, 0.3, 1.2, 0.45, F2, '#b0c8ff', 14); }
  if (k === 'closer') { sboard(f, 1620, ['CLEOPATRA IS CLOSER', 'TO THE ASTRONAUTS...'], 'closer', 0.0, 0.66, 1.2, 0.56, F2); sburst(f, 1659, 'closer', -0.05, 0.25, 1.2, 0.4, F2, '#fff3b0', 12); }
  if (k === 'builders') stamp(f, 1700, ['...THAN TO THE', 'PYRAMID BUILDERS'], 'builders', 0.0, 0.62, 1.2, 0.56, F2);
  if (k === 'which') { sboard(f, 1727, ['SO...'], 'which', 0.0, 0.68, 1.2, 0.3, F2, 1760); sboard(f, 1762, ['THE PYRAMIDS WERE OLDER', 'TO CLEOPATRA...'], 'which', 0.0, 0.66, 1.2, 0.58, F2); }
  if (k === 'you') { sboard(f, 1807, ['...THAN', 'CLEOPATRA'], 'you', 0.0, 0.66, 1.0, 0.42, F2, 1874); stamp(f, 1876, ['...IS TO YOU!'], 'you', 0.0, 0.62, 1.0, 0.52, F2); sburst(f, 1877, 'you', 0.0, 0.25, 1.0, 0.7, F2, '#fff3b0', 14); stars(f, 1892, 'you', 0.0, 0.42, 1.0, 0.4, F2, 24); }
  return F2;
}
