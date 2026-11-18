// [GC-story] "In October 1582, ten days vanished from the calendar" timeline (59.7 s voice, 1791 f @ 30 fps).
// Sets: gc_sets.js (bed / cosmos / hall / map / london / petro) through setAt. Pattern: story_revere.js (slow push per shot, zoom-through
// whips on cuts, screen-pinned boards / stamps / bubbles, punch-ins on beats). PAGEY (a living tear-off desk calendar) is the sidekick and
// the motif: it loses ten pages in the hook, flips 4 -> 15 overnight, counts in the theory space, cheers the bull, shrugs at the riot
// myth, and flips 25 OCTOBER -> 7 NOVEMBER in Petrograd for the payoff.
import * as S from './story.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]                                       narration (word frames from work/words_frames.txt)
const SH = [
  [0, 137, 'hook', 'bedNight'],    // In October 1582, ten days vanished from the calendar.  (October 8, 1582 21, ten 67, days 71, vanished 84, calendar 106)
  [137, 207, 'bed', 'bedNight'],   // People went to bed on Thursday, October 4th  (People 137, bed 152, Thursday 159, October 180, 4th 187)
  [207, 293, 'wake', 'bedDay'],    // and woke up on Friday, October 15th.  (woke 216, Friday 230, October 250, 15th 256)
  [293, 437, 'culprit', 'cosmos'], // The culprit? The old Julian calendar. Its year was about eleven minutes too long.  (culprit 294, old 313, Julian 322, calendar 336, year 361, eleven 380, minutes 391, long 409)
  [437, 635, 'drift', 'cosmos'],   // Tiny, right? But over the centuries, those minutes piled up. By the 1500s, Easter had drifted about ten days.  (Tiny 437, centuries 472, piled 504, 1500s 536, Easter 567, drifted 578, ten 595, days 604)
  [635, 810, 'pope', 'hall'],      // So Pope Gregory the Thirteenth issued a papal bull, Inter gravissimas: skip ten days!  (Pope 641, Gregory 651, Thirteenth 668, issued 682, papal 697, bull 707, Inter 723, gravissimas 729, skip 763, ten 767, days 779)
  [810, 944, 'jump', 'map'],       // In Italy, Spain, Portugal, and Poland, the dates jumped, but the weekdays kept going.  (Italy 813, Spain 830, Portugal 855, Poland 865, dates 885, jumped 891, weekdays 915, kept 926, going 933)
  [944, 1101, 'leap', 'cosmos'],   // Plus, a new leap-year rule. Century years only count if they divide by 400.  (Plus 944, leap-year 976, rule 991, Century 1015, count 1035, divide 1053, 400 1068)
  [1101, 1318, 'brit', 'london'],  // But not everyone switched. Britain and its colonies, including America, waited until 1752 and lost eleven days.  (switched 1127, Britain 1151, colonies 1165, America 1191, waited 1212, 1752 1229, lost 1277, eleven 1284, days 1296)
  [1318, 1429, 'riot', 'london'],  // Those famous "Give us our eleven days" riots? Probably a myth.  (famous 1323, Give 1332, eleven 1353, riots 1369, Probably 1388, myth 1401)
  [1429, 1561, 'late', 'map'],     // Russia held out until 1918, Greece until 1923.  (Russia 1429, held 1435, 1918 1456, Greece 1501, 1923 1514)
  [1561, 1669, 'reveal', 'petro'], // You see, Russia was running late. So its famous October Revolution  (see 1562, Russia 1579, late 1597, famous 1631, October 1641, Revolution 1655)
  [1669, 1791, 'payoff', 'petro'], // happened in November, by everyone else's calendar.  (happened 1669, November 1690, everyone 1713, calendar 1734)
];
export const NF = 1791;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'night', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.explain;
export const TALKER = {};
export const setAt = (f) => ['gc', segAt(f)[3]];

// ---------- places (set-local -> world)
const O = { bed: [-154000, 0, 0], cosmos: [-154000, 0, 800], hall: [-154000, 0, 1600], map: [-156500, 0, 0], london: [-156500, 0, 800], petro: [-156500, 0, 1600] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const BDa = at(O.bed), CSa = at(O.cosmos), HLa = at(O.hall), MPa = at(O.map), LDa = at(O.london), PTa = at(O.petro);
const BD = (x, z, h = 0) => BDa(x, h, z), CS = (x, z, h = 0) => CSa(x, h, z), HL = (x, z, h = 0) => HLa(x, h, z), MP = (x, z, h = 0) => MPa(x, h, z), LD = (x, z, h = 0) => LDa(x, h, z), PT = (x, z, h = 0) => PTa(x, h, z);
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const cellX = (d) => -3.4 + (d - 8 + 0.5) * 6.8 / 17;               // March strip cell centre (cosmos local x)
const driftAt = (f) => sm(576, 628, f);                                 // equinox marker 21 -> 11
const leapX = (f) => -3.0 + 6.0 * sm(1004, 1074, f);                     // leap plinth tracking x
const mapX = (lon) => ((lon + 12) / 57 - 0.5) * 3.0;                    // map table local x for a longitude

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const mix = (a, b, t) => ({ p: lerp3(a.p, b.p, t), l: lerp3(a.l, b.l, t), fp: lerp3(a.fp, b.fp, t), fov: a.fov + (b.fov - a.fov) * t, cInf: a.cInf + (b.cInf - a.cInf) * t });
const V = {
  hook: C(BDa(0.85, 1.3, -1.05), BDa(0.45, 1.12, -2.8), 46, 2.0, BDa(0.5, 1.0, -2.8)),
  bed: C(BDa(1.1, 1.45, 2.3), BDa(-0.25, 1.15, -2.0), 46, 1.2, BDa(-0.1, 1.1, -1.4)),
  wake: C(BDa(1.1, 1.45, 2.3), BDa(-0.25, 1.15, -2.0), 46, 1.2, BDa(-0.1, 1.1, -1.0)),
  tablet: C(CSa(-1.7, 1.6, 2.0), CSa(-3.0, 1.45, -3.0), 44, 1.4, CSa(-3.2, 1.35, -2.9)),
  clock: C(CSa(1.7, 2.3, 1.7), CSa(2.9, 2.3, -3.0), 44, 1.4, CSa(3.0, 2.35, -3.0)),
  pope: C(HLa(0.3, 1.8, 2.5), HLa(0.0, 1.75, -2.2), 46, 1.2, HLa(0, 1.5, -2.0)),
  calOct: C(MPa(0.0, 2.25, 0.5), MPa(0.0, 2.3, -3.5), 44, 1.4, MPa(0, 2.3, -3.5)),
  london: C(LDa(0.7, 1.6, 5.4), LDa(-0.3, 2.1, -8), 46, 1.0, LDa(-0.3, 1.4, -1.5)),
  sept: C(LDa(-0.45, 1.45, -2.45), LDa(-3.12, 1.4, -2.6), 42, 1.8, LDa(-3.12, 1.45, -2.6)),
  riot: C(LDa(0.4, 1.5, 4.2), LDa(-0.2, 2.5, -7.2), 46, 1.0, LDa(0, 1.5, -2.0)),
  petro: C(PTa(0.7, 1.6, 4.0), PTa(-0.2, 3.0, -20), 46, 1.0, PTa(0.2, 1.4, -2.5)),
  kiosk: C(PTa(-0.45, 1.45, 2.7), PTa(-1.55, 1.3, -0.9), 46, 1.6, PTa(-1.5, 1.2, -0.8)),
};
const mapCam = (cx, h = 3.5) => C(MPa(cx, h, 0.75), MPa(cx, 0.9, -1.25), 46, 1.4, MPa(cx, 0.9, -1.2));
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.12, bed: 0.1, wake: 0.1, culprit: 0.06, pope: 0.1, brit: 0.08, riot: 0.1, reveal: 0.1, payoff: 0.08 };
function cam(k, f) {
  const s = segAt(f); let c;
  if (k === 'culprit') c = mix(V.tablet, V.clock, sm(352, 378, f));
  else if (k === 'drift') { const x = f < 570 ? 0.5 : cellX(21 - 10 * driftAt(f)) + 0.15, y = f < 570 ? 2.3 : 1.75 + 0.55 * (1 - sm(570, 600, f)); const cy = f < 570 ? 0 : 1 - sm(570, 600, f);
    c = C(CSa(x + 0.25, y + 0.05, 4.4 + 0.4 * cy), CSa(x, y - 0.15, -1.4), 44, 1.4, CSa(x, Math.min(y, 1.6), -1.4)); c = push(c, 0.08, 437, 570, f); }
  else if (k === 'pope') c = V.pope;
  else if (k === 'jump') { const cx = f < 878 ? -0.6 + 0.15 * sm(810, 878, f) : -0.45; c = mapCam(cx); c = mix(c, V.calOct, sm(882, 905, f)); }
  else if (k === 'leap') { const lx = leapX(f), b = sm(1074, 1098, f); c = C(CSa(lx * (1 - b), 1.5 + 1.8 * b, 7.6 + 12 * b), CSa(lx * (1 - b), 1.15 + 0.2 * b, 3.2), 46, 1.2, CSa(lx * (1 - b), 1.0, 3.2)); }
  else if (k === 'brit') c = mix(V.london, V.sept, sm(1262, 1285, f));
  else if (k === 'riot') c = V.riot;
  else if (k === 'late') { const t = sm(1490, 1512, f); c = mapCam(0.95 - 0.55 * t, 3.4); }
  else if (k === 'reveal') c = V.petro;
  else if (k === 'payoff') c = mix(V.petro, V.kiosk, sm(1669, 1688, f));
  else c = V[k] || V.hook;
  c = push(c, PUSH[k] ?? 0.0, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const orbit = (a, f0, f1) => { const t = sm(f0, f1, f) - 0.5, an = a * t, dx = c.p[0] - c.l[0], dz = c.p[2] - c.l[2]; c = { ...c, p: [c.l[0] + dx * Math.cos(an) - dz * Math.sin(an), c.p[1], c.l[2] + dx * Math.sin(an) + dz * Math.cos(an)] }; };
  if (k === 'hook') { orbit(0.25, 0, 137); punch(21, 27, 0.05); punch(84, 90, 0.12); kick(84, 0.03); shake(86, 104, 0.012); }
  if (k === 'bed') { orbit(-0.15, 137, 207); punch(159, 165, 0.06); punch(187, 193, 0.08); }
  if (k === 'wake') { orbit(0.18, 207, 293); punch(230, 236, 0.05); punch(256, 262, 0.05); kick(256, 0.04); shake(257, 272, 0.015); }
  if (k === 'culprit') { punch(294, 300, 0.06); punch(322, 328, 0.06); punch(380, 386, 0.08); punch(409, 415, 0.1); kick(409, 0.03); }
  if (k === 'drift') { punch(437, 443, 0.05); punch(536, 542, 0.06); punch(604, 610, 0.1); kick(604, 0.03); }
  if (k === 'pope') { orbit(0.2, 635, 810); punch(651, 657, 0.05); punch(707, 713, 0.06); punch(729, 735, 0.06); punch(767, 773, 0.12); kick(767, 0.04); shake(768, 785, 0.015); }
  if (k === 'jump') { punch(891, 897, 0.04); punch(915, 921, 0.08); }
  if (k === 'leap') { punch(976, 982, 0.05); punch(1068, 1074, 0.1); kick(1068, 0.03); }
  if (k === 'brit') { orbit(0.14, 1101, 1262); punch(1151, 1157, 0.05); punch(1191, 1197, 0.06); punch(1229, 1235, 0.1); kick(1229, 0.03); punch(1296, 1302, 0.08); }
  if (k === 'riot') { orbit(-0.16, 1318, 1429); punch(1332, 1338, 0.06); punch(1369, 1375, 0.06); punch(1401, 1407, 0.12); kick(1401, 0.03); }
  if (k === 'late') { punch(1456, 1462, 0.06); punch(1514, 1520, 0.06); }
  if (k === 'reveal') { orbit(0.2, 1561, 1669); punch(1597, 1603, 0.05); punch(1641, 1647, 0.08); }
  if (k === 'payoff') { c = push(c, -0.3, 1738, 1785, f); punch(1690, 1696, 0.12); kick(1690, 0.04); shake(1691, 1706, 0.012); punch(1734, 1740, 0.05); }
  return c;
}
const HARD = new Set([207]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g) && g !== 1669);
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[84, 0.35, 8], [137, 0.4, 10], [207, 0.9, 16], [256, 0.3, 6], [293, 0.6, 12], [409, 0.25, 6], [437, 0.4, 10], [604, 0.3, 6], [635, 0.6, 12], [767, 0.35, 8], [810, 0.5, 10], [891, 0.25, 6], [944, 0.5, 10], [1068, 0.3, 6], [1101, 0.6, 12], [1229, 0.3, 6], [1318, 0.4, 10], [1401, 0.3, 6], [1429, 0.5, 10], [1561, 0.8, 14], [1690, 0.6, 10], [1734, 0.25, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'night' };
}

// ---------- world state
const pinT = (f, f0) => sm(f0, f0 + 8, f);
export function worldAt(f, w) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const N = w.gc; if (!N) return;
  const late = k === 'late';
  N.set({ part: k === 'culprit' ? 'culprit' : k === 'drift' ? 'drift' : k === 'leap' ? 'leap' : 'all', fly: k === 'hook' ? sm(84, 132, f) : 0, candle: k === 'bed' ? 1 - sm(192, 200, f) : 1, orbit: (f - 293) / 150, clock: k === 'culprit' ? (f < 372 ? (f - 293) / 79 : 1 + 11 / 60 * sm(378, 410, f)) : 0,
    drift: driftAt(f), year: k === 'drift' ? 325 + (1582 - 325) * sm(468, 560, f) : 325, leap: k === 'leap' ? clamp((f - 1010) / 14, 0, 5) : 0,
    fly2: k === 'pope' ? sm(768, 808, f) : 0, parch: k === 'pope' ? 0.05 + 0.95 * sm(712, 734, f) : 1,
    pins: late ? { it: 1, es: 1, pt: 1, pl: 1, ru: pinT(f, 1431), gr: pinT(f, 1503) } : { it: pinT(f, 811), es: pinT(f, 828), pt: pinT(f, 853), pl: pinT(f, 864) },
    banner: k === 'riot' ? sm(1322, 1336, f) : 0, nov: k === 'payoff' ? sm(1684, 1694, f) : 0 });
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const PG = (f, pos, opts = {}, extra = {}) => person(f, 'PAGEY', 9, pos, { t: f, ...opts }, { s: 0.5, blob: false, ...extra });
const sway = (f, a = 0.4) => q(0.5 + 0.5 * Math.sin(f * a), 0.1);
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') { const tr = (f - 84) / 5; A.push(PG(f, BD(0.5, -2.82, 0.72), { day: f < 84 ? '4' : f < 132 ? String(Math.min(15, 6 + clamp(Math.floor(tr), 0, 9))) : '15', mon: 'OCTOBER', wk: f < 84 ? 'THURSDAY' : f < 132 ? '' : 'FRIDAY', year: '1582', red: f >= 132,
      expr: f < 60 ? 'smile' : f < 84 ? 'proud' : f < 132 ? 'shock' : 'dazed', pose: f < 84 ? 'wave' : f < 132 ? 'shock' : 'shrug', tear: f >= 84 && f < 132 ? tr % 1 : 0, tearDay: String(5 + clamp(Math.floor(tr), 0, 9)), look: -0.4 }, { s: 0.34 })); }
  if (k === 'bed') { A.push(P(f, 'GC_SLEEPER', 3, BD(0.2, -0.85), { expr: f < 175 ? 'dreamy' : f < 196 ? 'whistle' : 'relieved', view: '34R', prop: 'candle', lit: 1 - sm(192, 200, f), raise: f > 176 && f < 205 ? 1 : undefined }));
    A.push(PG(f, BD(0.5, -2.82, 0.72), { day: '4', wk: 'THURSDAY', year: '1582', expr: f < 190 ? 'smile' : 'happy', pose: f < 175 ? 'stand' : 'wave' }, { s: 0.34 })); }
  if (k === 'wake') { A.push(P(f, 'GC_SLEEPER', 3, BD(0.2, -0.85), { expr: f < 240 ? 'relieved' : f < 256 ? 'surprised' : 'shock', view: '34R', cheer: f < 240 ? sway(f, 0.25) : undefined, point: f > 258 ? 1 : undefined }));
    A.push(PG(f, BD(0.5, -2.82, 0.72), { day: '15', wk: 'FRIDAY', year: '1582', red: 1, expr: f < 252 ? 'sly' : 'happy', pose: f < 252 ? 'hips' : 'cheer' }, { s: 0.34 })); }
  if (k === 'culprit') { A.push(PG(f, CS(-2.55, -1.3), { mon: 'JULIAN', day: '365¼', wk: 'DAYS A YEAR', expr: f < 330 ? 'smile' : f < 380 ? 'proud' : 'shock', pose: f < 330 ? 'point' : f < 380 ? 'hips' : 'shock', flip: f < 340 }, { s: 0.5 }));
    if (f > 340) A.push(PG(f, CS(2.1, -2.3), { mon: 'JULIAN', day: '+11', wk: 'MINUTES', expr: f < 400 ? 'sly' : 'shock', pose: f < 400 ? 'point' : 'shock', red: 1 }, { s: 0.5 * back(340, 352, f) + 0.001 })); }
  if (k === 'drift') { const mx = cellX(21 - 10 * driftAt(f)); A.push(PG(f, CS(f < 570 ? 1.2 : mx + 0.75, -0.75), { mon: 'MARCH', day: String(Math.round(21 - 10 * driftAt(f))), wk: f < 576 ? 'EQUINOX' : 'TOO EARLY!', expr: f < 460 ? 'sly' : f < 530 ? 'worried' : f < 590 ? 'shock' : 'dazed', pose: f < 460 ? 'shrug' : f < 590 ? 'shock' : 'shrug', red: f >= 590 ? 1 : 0 }, { s: 0.5 })); }
  if (k === 'pope') { A.push(P(f, 'GC_POPE', 11, HL(0.0, -2.05), { expr: f < 682 ? 'determined' : f < 763 ? 'smug' : 'excited', view: 'front', prop: 'scroll', raise: f > 700 ? 1 : undefined, scrollLen: 120 + 160 * sm(700, 730, f) }));
    A.push(P(f, 'GC_ASTRO', 12, HL(0.72, -2.3), { expr: f < 700 ? 'thoughtful' : f < 767 ? 'smile' : 'excited', view: '34L', point: f > 650 && f < 700 ? 1 : undefined, cheer: f > 770 ? sway(f) : undefined }));
    A.push(P(f, 'GC_CLERIC', 13, HL(-0.72, -2.35), { expr: f < 767 ? 'surprised' : 'shock', view: '34R' }));
    A.push(PG(f, HL(0.72, -1.1, 0.84), { day: f < 767 ? '4' : '15', mon: 'OCTOBER', wk: '1582', expr: f < 767 ? 'smile' : 'happy', pose: f < 767 ? 'stand' : 'cheer', tear: f >= 767 && f < 800 ? ((f - 767) / 4) % 1 : 0, tearDay: String(5 + clamp(Math.floor((f - 767) / 4), 0, 9)) }, { s: 0.28 })); }
  if (k === 'jump') { if (f < 900) A.push(PG(f, MP(mapX(4), -0.9, 0.88), { day: '4', wk: 'THURSDAY', expr: 'happy', pose: f < 880 ? 'cheer' : 'point' }, { s: 0.36 }));
  }
  if (k === 'leap') { const lx = leapX(f); A.push(PG(f, CS(lx + 0.85, 4.3), { mon: 'FEBRUARY', day: f < 1068 ? '29?' : '29', wk: 'LEAP DAY', expr: f < 1035 ? 'smile' : f < 1068 ? 'thoughtful' : 'proud', pose: f < 1068 ? 'point' : 'hips', flip: true }, { s: 0.5 })); }
  if (k === 'brit') { const v = f < 1262;
    if (v) { A.push(P(f, 'GC_LDN1', 21, LD(-0.8, -1.4), { expr: f < 1229 ? 'smug' : 'shock', view: '34R', hip: f < 1220 ? 1 : undefined }));
      A.push(P(f, 'GC_LDN2', 22, LD(0.55, -2.4), { expr: f < 1229 ? 'happy' : 'surprised', view: '34L', wave: f < 1180 ? sway(f) : undefined }));
      A.push(P(f, 'GC_LDNKID', 23, LD(0.15, -0.6), { expr: 'excited', view: 'front', cheer: f > 1191 ? sway(f, 0.45) : undefined }, { s: 0.8 })); }
    else { A.push(PG(f, LD(-2.65, -2.22), { mon: 'SEPTEMBER', day: f < 1277 ? '2' : '14', wk: '1752', red: f >= 1277 ? 1 : 0, expr: f < 1277 ? 'smile' : 'shock', pose: f < 1277 ? 'point' : 'shock', tear: f >= 1277 && f < 1297 ? ((f - 1277) / 2) % 1 : 0, tearDay: String(3 + clamp(Math.floor((f - 1277) / 2), 0, 10)), flip: true }, { s: 0.42 })); } }
  if (k === 'riot') { A.push(P(f, 'GC_LDN1', 21, LD(-0.7, -1.6), { expr: f < 1388 ? 'angry' : 'sad', view: '34R', prop: 'pennant', raise: f < 1388 ? 1 : undefined }));
    A.push(P(f, 'GC_LDN3', 24, LD(0.75, -2.3), { expr: f < 1369 ? 'angry' : f < 1401 ? 'thoughtful' : 'bored', view: '34L', point: f < 1369 ? 1 : undefined }));
    A.push(P(f, 'GC_LDN2', 22, LD(-1.55, -3.4), { expr: f < 1388 ? 'worried' : 'amused', view: '34R' }));
    A.push(PG(f, LD(0.3, -0.5), { mon: 'SEPTEMBER', day: '14', wk: '1752', expr: f < 1388 ? 'worried' : 'sly', pose: f < 1388 ? 'stand' : 'shrug' }, { s: 0.42 })); }
  if (k === 'late') { A.push(PG(f, MP(mapX(f < 1500 ? 33 : 19), f < 1500 ? -0.45 : -0.76, 0.88), { mon: 'JANUARY', day: f < 1501 ? '1918' : '1923', wk: f < 1501 ? 'RUSSIA' : 'GREECE', expr: f < 1490 ? 'sly' : 'happy', pose: f < 1490 ? 'point' : 'cheer' }, { s: 0.36 })); }
  if (k === 'reveal' || k === 'payoff') { const nov = f >= 1690;
    const ppl = [['GC_SAILOR', 31, 1.4, -2.2, '34L', 'redflag'], ['GC_WORKER', 32, 0.3, -3.4, '34L', null], ['GC_SOLDIER', 33, 2.4, -4.2, '34L', 'redflag'], ['GC_RWOMAN', 34, -0.4, -1.9, '34R', null], ['GC_WORKER', 35, 3.4, -6.5, 'front', 'redflag']];
    ppl.forEach(([o, sd, x, z, view, prop], i) => A.push(P(f, o, sd, PT(x, z), { expr: k === 'reveal' ? (i % 2 ? 'determined' : 'excited') : nov ? (i % 2 ? 'shock' : 'surprised') : 'determined', view, prop: prop || undefined, raise: prop ? 1 : undefined, cheer: !prop && k === 'reveal' ? sway(f + i * 7, 0.42) : undefined, point: !prop && nov ? 1 : undefined })));
    A.push(PG(f, PT(-1.15, -0.55), { mon: nov ? 'NOVEMBER' : 'OCTOBER', day: nov ? '7' : '25', wk: '1917', red: nov ? 1 : 0, expr: k === 'reveal' ? (f < 1597 ? 'smile' : 'sly') : nov ? (f < 1734 ? 'happy' : 'love') : 'proud', pose: k === 'reveal' ? 'point' : nov ? 'cheer' : 'hips', tear: f >= 1684 && f < 1694 ? (f - 1684) / 10 : 0, tearDay: '25', look: 0.3 }, { s: 0.48 })); }
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
const qmark = (f, f0, k, x, y, z, w, F2, f1 = 1e9) => { if (f >= f0 && f < f1) F2.push({ fx: 'qmark', pos: SB(k, x, y, z), size: SWD(k, w, z) * back(f0, f0 + 8, f) }); };
const stamp = (f, f0, lines, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) { const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos: SB(k, x, y, z), size: SWD(k, w, z) * (1.6 - 0.6 * t * t), op: Math.min(1, t * 2) }); } };
const bubble = (f, f0, lines, k, x, y, z, w, tail, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'bubble', lines, tail, pos: SB(k, x, y, z), size: SWD(k, w, z) * back(f0, f0 + 8, f) }); };
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { sboard(f, 4, ['OCTOBER', '1582'], 'hook', 0.0, 0.66, 1.0, 0.4, F2, 80); stamp(f, 84, ['10 DAYS', 'VANISHED!'], 'hook', 0.0, 0.64, 1.0, 0.48, F2); sburst(f, 84, 'hook', 0.0, 0.2, 1.0, 0.6, F2); }
  if (k === 'bed') { sboard(f, 156, ['THURSDAY', 'OCT 4'], 'bed', 0.0, 0.66, 3, 0.42, F2); }
  if (k === 'wake') { sboard(f, 226, ['FRIDAY', 'OCT 15'], 'wake', 0.0, 0.66, 3, 0.42, F2, 254); stamp(f, 255, ['WAIT...', '15?!'], 'wake', 0.0, 0.64, 3, 0.4, F2); sburst(f, 256, 'wake', 0.1, 0.1, 3, 0.5, F2); }
  if (k === 'culprit') { stamp(f, 294, ['THE CULPRIT?'], 'culprit', 0.0, 0.68, 3, 0.46, F2, 318); sboard(f, 319, ['THE JULIAN', 'CALENDAR'], 'culprit', 0.0, 0.66, 3, 0.44, F2, 372); sboard(f, 378, ['YEAR TOO LONG BY'], 'culprit', 0.0, 0.7, 3, 0.5, F2, 404); stamp(f, 405, ['+11 MINUTES'], 'culprit', 0.0, 0.66, 3, 0.48, F2); }
  if (k === 'drift') { bubble(f, 438, ['TINY,', 'RIGHT?'], 'drift', 0.35, 0.5, 3, 0.36, 1, F2, 466); sboard(f, 468, ['OVER THE', 'CENTURIES...'], 'drift', 0.0, 0.7, 3, 0.44, F2, 530); sboard(f, 534, ['BY THE 1500s'], 'drift', 0.0, 0.7, 3, 0.44, F2, 590); stamp(f, 600, ['EASTER DRIFTED', '~10 DAYS'], 'drift', 0.0, 0.66, 3, 0.52, F2); }
  if (k === 'pope') { sboard(f, 646, ['POPE', 'GREGORY XIII'], 'pope', 0.0, 0.7, 3, 0.42, F2, 700); sboard(f, 702, ['A PAPAL BULL'], 'pope', 0.0, 0.72, 3, 0.4, F2, 722); sboard(f, 724, ['INTER', 'GRAVISSIMAS'], 'pope', 0.0, 0.7, 3, 0.46, F2, 762); stamp(f, 764, ['SKIP', '10 DAYS!'], 'pope', 0.0, 0.66, 3, 0.42, F2); sburst(f, 767, 'pope', 0.0, 0.3, 3, 0.6, F2); }
  if (k === 'jump') { sboard(f, 812, ['1582'], 'jump', 0.0, 0.72, 2.2, 0.34, F2, 880); sboard(f, 884, ['THE DATES', 'JUMPED'], 'jump', 0.0, 0.7, 3, 0.44, F2, 912); stamp(f, 914, ['THU 4 → FRI 15'], 'jump', 0.0, -0.62, 3, 0.56, F2); sboard(f, 926, ['WEEKDAYS KEPT GOING'], 'jump', 0.0, 0.72, 3, 0.56, F2); }
  if (k === 'leap') { sboard(f, 948, ['NEW', 'LEAP-YEAR RULE'], 'leap', 0.0, 0.68, 3, 0.48, F2, 1012); sboard(f, 1014, ['CENTURY YEARS?'], 'leap', 0.0, 0.7, 3, 0.48, F2, 1062); stamp(f, 1064, ['ONLY IF', '÷ 400'], 'leap', 0.0, 0.66, 3, 0.4, F2); }
  if (k === 'brit') { sboard(f, 1104, ['NOT EVERYONE', 'SWITCHED'], 'brit', 0.0, 0.68, 3, 0.48, F2, 1148); sboard(f, 1150, ['BRITAIN', '+ COLONIES'], 'brit', 0.0, 0.68, 3, 0.44, F2, 1188); sboard(f, 1189, ['AMERICA TOO!'], 'brit', 0.0, 0.7, 3, 0.44, F2, 1226); stamp(f, 1227, ['1752'], 'brit', 0.0, 0.66, 3, 0.32, F2, 1262);
    sboard(f, 1266, ['SEPT 2', '→ SEPT 14'], 'brit', 0.0, -0.55, 1.2, 0.42, F2, 1294); stamp(f, 1295, ['LOST', '11 DAYS'], 'brit', 0.0, -0.55, 1.2, 0.4, F2); }
  if (k === 'riot') { sboard(f, 1320, ['THOSE FAMOUS', 'RIOTS?'], 'riot', 0.0, 0.72, 3, 0.44, F2, 1386); qmark(f, 1370, 'riot', 0.3, 0.2, 3, 0.2, F2, 1398); stamp(f, 1399, ['PROBABLY', 'A MYTH'], 'riot', 0.0, 0.66, 3, 0.42, F2); }
  if (k === 'late') { sboard(f, 1432, ['RUSSIA'], 'late', 0.0, 0.72, 3, 0.36, F2, 1500); stamp(f, 1455, ['1918'], 'late', 0.0, 0.55, 3, 0.3, F2, 1500); sboard(f, 1502, ['GREECE'], 'late', 0.0, 0.72, 3, 0.36, F2); stamp(f, 1513, ['1923'], 'late', 0.0, 0.55, 3, 0.3, F2); }
  if (k === 'reveal') { sboard(f, 1563, ['YOU SEE...'], 'reveal', 0.0, 0.72, 3, 0.36, F2, 1595); sboard(f, 1597, ['RUSSIA', 'RAN LATE'], 'reveal', 0.0, 0.68, 3, 0.4, F2, 1636); sboard(f, 1638, ['THE OCTOBER', 'REVOLUTION...'], 'reveal', 0.0, 0.68, 3, 0.48, F2); }
  if (k === 'payoff') { stamp(f, 1689, ['IN NOVEMBER!'], 'payoff', 0.15, -0.2, 2.5, 0.46, F2, 1730); sburst(f, 1690, 'payoff', -0.1, 0.35, 3, 0.6, F2); sboard(f, 1732, ['BY EVERYONE', "ELSE'S CALENDAR"], 'payoff', 0.0, 0.68, 3, 0.52, F2); stars(f, 1745, 'payoff', 0.0, 0.2, 3, 0.5, F2, 24); }
  return F2;
}
