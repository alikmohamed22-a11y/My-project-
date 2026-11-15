// [ZZ-story] "The shortest war in history" timeline (62.36 s voice, 1871 f @ 30 fps). Anglo-Zanzibar War, 27 Aug 1896.
// Sets: zz_sets.js (harbor / throne / office / consul / clock) through setAt. Pattern: story_pringles.js (slow push per shot, zoom-through
// whips on cuts, screen-pinned boards / bursts / stamps, punch-ins on beats). The motif is the CLOCK: the palace tower clock (live hands,
// minutes past nine), the consul's wall clock, the giant clock in the time void, and TICKY (a living pocket watch, the sidekick) whose
// dial always shows the same minutes. Respectful by design: the casualty beat is a quiet, slow, grey shot with plain boards and no gags.
import * as S from './story.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]                                       narration (word frames from work/words_frames.txt)
const SH = [
  [0, 138, 'hook', 'hbMorning'],      // The shortest war in history started and ended before ten in the morning.  (started 44, ended 69, 10 94, morning 112)
  [138, 226, 'date', 'hbDawn'],       // Zanzibar, August 25th, 1896,  (Zanzibar 141, August 160, 25th 164, 1896 190)
  [226, 300, 'mourn', 'thMourn'],     // Sultan Hamad bin Thuwaini died suddenly.  (Sultan 229, died 267, suddenly 275)
  [300, 478, 'khalid', 'thDay'],      // Within hours, Khalid bin Barghash moved into the palace and declared himself Sultan, without Britain's approval.  (Khalid 333, palace 374, declared 390, without 431, approval 453)
  [478, 650, 'ultim', 'ofDay'],       // Britain, which ran Zanzibar as a protectorate, sent an ultimatum: be out by 9 a.m. on the 27th.  (protectorate 526, ultimatum 561, 9 601, 27th 627)
  [650, 755, 'barr', 'hbMorning'],    // Khalid barricaded himself inside, with guards, cannons,  (barricaded 660, guards 713, cannons 739)
  [755, 800, 'yacht', 'hbMorning'],   // and the royal yacht, the Glasgow.  (royal 761, yacht 768, Glasgow 783)
  [800, 873, 'nine', 'hbMorning'],    // 9 o'clock came. He stayed.  (9 804, came 817, stayed 846)
  [873, 967, 'fire', 'hbBattle'],     // At 2 minutes past 9, Royal Navy ships opened fire.  (2 875, past 890, 9 897, Royal 922, opened 939, fire 951)
  [967, 1080, 'sink', 'hbBattle'],    // The Glasgow fired back and was quickly sunk. Her crew was rescued.  (fired 981, sunk 1023, crew 1044, rescued 1058)
  [1080, 1205, 'wreck', 'hbAfter'],   // By about 9:40, the palace was wrecked and the flag came down.  (9:40 1093, wrecked 1139, flag 1163, down 1178)
  [1205, 1372, 'toll', 'hbAfter'],    // Around 500 people on the Zanzibari side were killed or wounded. One British sailor was hurt.  (500 1213, killed 1281, One 1315, sailor 1329, hurt 1345)
  [1372, 1497, 'dur', 'void'],        // The whole war lasted somewhere between 38 and 45 minutes.  (lasted 1396, 38 1430, 45 1454, minutes 1470)
  [1497, 1604, 'escape', 'gcDay'],    // You see, Khalid himself had escaped to the German consulate.  (see 1501, escaped 1543, German 1571, consulate 1582)
  [1604, 1690, 'boat', 'gcDusk'],     // Weeks later, he left by boat, straight from its garden.  (Weeks 1608, boat 1645, straight 1657, garden 1677)
  [1690, 1871, 'bill', 'ofBill'],     // And his supporters? They were reportedly made to pay for the shells fired at them.  (supporters 1707, reportedly 1748, pay 1775, shells 1795, them 1820)
];
export const NF = 1871;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['zz', segAt(f)[3]];

// ---------- places (set-local -> world)
const O = { harbor: [-118000, 0, 0], throne: [-118000, 0, 800], office: [-118000, 0, 1600], consul: [-120500, 0, 0], clock: [-120500, 0, 800] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const HBa = at(O.harbor), THa = at(O.throne), OFa = at(O.office), GCa = at(O.consul), CKa = at(O.clock);
const HB = (x, z, h = 0) => HBa(x, h, z), TH = (x, z, h = 0) => THa(x, h, z), OF = (x, z, h = 0) => OFa(x, h, z), GC = (x, z, h = 0) => GCa(x, h, z), CK = (x, z, h = 0) => CKa(x, h, z);
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const DY = 0.83; // office desk top

// ---------- the clock (minutes past nine, all clocks + TICKY agree)
function TM(f) { const k = segAt(f)[2];
  if (k === 'hook') return f < 44 ? -1 + f / 44 : 2 + 38 * sm(52, 92, f);
  if (k === 'date' || k === 'mourn' || k === 'khalid') return -175 + f * 0.02;
  if (k === 'ultim') return -170 + f * 0.02;
  if (k === 'barr' || k === 'yacht') return -18 + 12 * sm(650, 800, f);
  if (k === 'nine') return -1.2 + 1.2 * sm(800, 812, f) + 0.6 * sm(830, 873, f);
  if (k === 'fire') return 2 + 0.5 * sm(873, 967, f);
  if (k === 'sink') return 3 + 3 * sm(967, 1080, f);
  if (k === 'wreck') return 37 + 3 * sm(1080, 1100, f);
  if (k === 'toll') return 40 + 2 * sm(1205, 1372, f);
  if (k === 'dur') return WEDGE(f);
  return 45; }
const WEDGE = (f) => 38 * sm(1396, 1440, f) + 7 * sm(1452, 1470, f);

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(HBa(0, 20, -8.6), HBa(0, 20, -15.7), 40, 3.0, HBa(0, 20, -15.7)),
  date: C(HBa(-42, 9, 84), HBa(0, 11, -12), 38, 0.6, HBa(0, 8, -18)),
  mourn: C(THa(0.7, 1.55, 3.4), THa(0, 1.25, -4.2), 44, 1.4, THa(0, 1.1, -4.2)),
  khalid: C(THa(1.1, 1.6, 3.8), THa(-0.4, 1.25, -3.6), 46, 1.2, THa(-0.2, 1.0, -2.4)),
  ultim: C(OFa(0.7, 1.6, 2.7), OFa(-0.3, 1.35, -3.5), 46, 1.2, OFa(-0.2, 1.1, -1.9)),
  barr: C(HBa(3, 2.6, 6.5), HBa(0, 3.6, -14), 40, 0.9, HBa(0, 1.5, -10.5)),
  yacht: C(HBa(96, 7, 92), HBa(22, 4, 32), 36, 0.8, HBa(30, 3, 46)),
  nine: C(HBa(0, 20, -8.4), HBa(0, 20, -15.7), 40, 3.0, HBa(0, 20, -15.7)),
  fire: C(HBa(20, 10, 330), HBa(0, 7, 60), 26, 0.4, HBa(0, 6, 150)),
  sink: C(HBa(96, 7, 92), HBa(22, 3, 32), 36, 0.8, HBa(30, 2, 46)),
  wreck: C(HBa(9, 3.0, 20), HBa(0, 13, -18), 44, 0.8, HBa(0, 10, -18)),
  toll: C(HBa(-26, 4.5, 118), HBa(0, 11, -16), 32, 0.5, HBa(0, 10, -18)),
  dur: C(CKa(0.4, 2.8, 7.6), CKa(0, 2.8, -3), 44, 1.0, CKa(0, 2.6, -3)),
  escape: C(GCa(-2.0, 1.9, -0.3), GCa(0.6, 2.2, -12), 50, 0.8, GCa(0.6, 1.2, -6.5)),
  boat: C(GCa(5.0, 2.5, 9.5), GCa(0, 1.0, 0.8), 42, 1.0, GCa(0, 0.5, 1.2)),
  bill: C(OFa(0.5, 1.55, 1.6), OFa(-0.1, 1.0, -1.7), 46, 1.2, OFa(-0.1, 1.0, -1.8)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0, date: 0.06, mourn: 0.14, khalid: 0.1, ultim: 0.1, barr: 0.08, yacht: 0.06, nine: 0, fire: 0.05, sink: 0.06, wreck: 0.08, toll: 0.1, dur: 0.12, escape: 0.08, boat: 0.1, bill: 0 };
const base = (k) => V[k] || V.hook;
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const look = (d, f0, f1, fd) => { const t = sm(f0, f1, f); c = { ...c, l: add3(c.l, d.map((x) => x * t)), fp: add3(c.fp, (fd || d).map((x) => x * t)) }; };
  const orbit = (a, f0, f1) => { const t = sm(f0, f1, f) - 0.5, an = a * t, dx = c.p[0] - c.l[0], dz = c.p[2] - c.l[2]; c = { ...c, p: [c.l[0] + dx * Math.cos(an) - dz * Math.sin(an), c.p[1], c.l[2] + dx * Math.sin(an) + dz * Math.cos(an)] }; };
  const fly = (p1, l1, fp1, f0, f1, fov1) => { const t = sm(f0, f1, f); c = { ...c, p: lerp3(c.p, p1, t), l: lerp3(c.l, l1, t), fp: lerp3(c.fp, fp1, t), fov: fov1 ? c.fov + (fov1 - c.fov) * t : c.fov }; };
  if (k === 'hook') { c = push(c, 0.12, 0, 60, f); punch(44, 50, 0.06); punch(69, 75, 0.06); kick(69, 0.05);
    fly(HBa(2, 7.5, 34), HBa(0, 13.5, -18), HBa(0, 10, -16), 96, 138); c.cInf = 3.0 - 2.2 * sm(96, 130, f); punch(94, 100, 0.08 * (1 - sm(96, 110, f))); }
  if (k === 'date') { orbit(0.12, 138, 226); punch(141, 147, 0.04); punch(190, 196, 0.06); }
  if (k === 'mourn') { punch(267, 273, 0.04); }
  if (k === 'khalid') { orbit(0.2, 300, 478); punch(333, 339, 0.06); punch(400, 406, 0.06); punch(441, 447, 0.1); kick(441, 0.03); }
  if (k === 'ultim') { orbit(0.2, 478, 650); punch(526, 532, 0.05); punch(561, 567, 0.08); punch(601, 607, 0.1); kick(601, 0.03); punch(627, 633, 0.06); }
  if (k === 'barr') { look([-2.0, 0.2, 0], 700, 745, [-1.5, 0, 0]); punch(713, 719, 0.06); punch(739, 745, 0.1); kick(739, 0.03); }
  if (k === 'yacht') { punch(783, 789, 0.1); }
  if (k === 'nine') { punch(804, 810, 0.1); kick(808, 0.06); shake(808, 820, 0.04); fly(HBa(-7.6, 6.7, -11.8), HBa(-4.25, 6.35, -20), HBa(-4.25, 6.2, -20), 826, 850, 40); c.cInf = 3.0; punch(846, 852, 0.08); }
  if (k === 'fire') { punch(875, 881, 0.05); punch(897, 903, 0.06); punch(951, 957, 0.1); shake(951, 967, 0.6); }
  if (k === 'sink') { look([0, 0, 0], 967, 1000); punch(981, 987, 0.06); shake(983, 995, 0.08); punch(1023, 1029, 0.1); look([0, -1.5, 0], 1040, 1072, [0, -1, 0]); }
  if (k === 'wreck') { const t = sm(1100, 1136, f), w0 = { p: HBa(4.5, 19.2, -6.2), l: HBa(0, 20, -15.7), fp: HBa(0, 20, -15.7) }; c = { ...c, p: lerp3(w0.p, c.p, t), l: lerp3(w0.l, c.l, t), fp: lerp3(w0.fp, c.fp, t), cInf: 2.6 - 1.8 * t }; punch(1093, 1099, 0.06); punch(1139, 1145, 0.06); look([1.2, 14, 0], 1155, 1185, [1, 14, 0]); }
  if (k === 'toll') { /* quiet: slow push only */ }
  if (k === 'dur') { orbit(0.25, 1372, 1497); punch(1430, 1436, 0.06); punch(1454, 1460, 0.08); punch(1474, 1480, 0.08); kick(1474, 0.03); }
  if (k === 'escape') { look([0, -0.4, 0], 1500, 1540); punch(1571, 1577, 0.06); }
  if (k === 'boat') { punch(1645, 1651, 0.06); look([0, 0, 1.4], 1660, 1690, [0, 0, 1.4]); }
  if (k === 'bill') { c = push(c, 0.1, 1690, 1780, f); punch(1707, 1713, 0.05); punch(1748, 1754, 0.06); fly(OFa(0.15, 2.3, 1.3), OFa(0.15, 0.95, -1.6), OFa(0.15, 0.9, -1.55), 1784, 1812, 42); c.cInf = 1.2 + 1.8 * sm(1784, 1812, f); punch(1795, 1801, 0.1); kick(1795, 0.02); }
  return c;
}
const HARD = new Set([226, 755, 800]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[44, 0.2, 6], [69, 0.25, 6], [94, 0.3, 8], [138, 0.6, 12], [226, 0.5, 14], [300, 0.5, 10], [441, 0.25, 6], [478, 0.6, 12], [601, 0.25, 6], [650, 0.5, 10], [755, 0.3, 8], [800, 0.4, 8], [808, 0.35, 8], [873, 0.6, 10], [951, 0.2, 6], [967, 0.5, 10], [1023, 0.3, 8], [1080, 0.5, 12], [1205, 0.3, 14], [1372, 0.5, 12], [1474, 0.3, 8], [1497, 0.6, 14], [1604, 0.6, 14], [1690, 0.5, 12], [1795, 0.3, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state
export function worldAt(f, w) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const N = w.zz; if (!N) return;
  N.set({ tm: TM(f), dmg: k === 'wreck' || k === 'toll' ? 1 : 0, flag: k === 'wreck' ? sm(1163, 1192, f) : k === 'toll' ? 1 : 0,
    sink: k === 'sink' ? sm(1012, 1046, f) : k === 'wreck' || k === 'toll' ? 1 : 0, fire: k === 'fire' ? sm(951, 955, f) : k === 'sink' ? 0.8 : 0, hits: k === 'fire' ? sm(957, 962, f) : k === 'sink' ? 0.8 : k === 'wreck' ? 0.5 * (1 - sm(1080, 1120, f)) : 0,
    yfire: k === 'sink' ? (f >= 981 && f < 1012 ? 1 : 0) : 0, boatT: k === 'sink' ? sm(1040, 1080, f) * 0.9 + (f >= 1036 ? 0.02 : 0) : 0,
    after: k === 'wreck' ? 0.5 + 0.5 * sm(1080, 1120, f) : k === 'toll' ? 1 : 0, wedge: k === 'dur' ? WEDGE(f) : 0, bill: k === 'bill' ? 1 : 0,
    gcBoat: k === 'boat' ? sm(1662, 1700, f) * 0.6 : 0, fan: 1 });
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const TK = (f, pos, opts = {}, extra = {}) => person(f, 'TICKY', 9, pos, { t: f, tm: TM(f), ...opts }, { s: 0.3, ...extra });
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'khalid') { const t = sm(304, 372, f), x = -0.7 + 0.5 * t, z = -0.6 - 1.7 * t; const moving = f > 304 && f < 372;
    A.push(P(f, 'ZZ_KHALID', 31, TH(x, z), { expr: f < 372 ? 'determined' : f < 431 ? 'smug' : 'proud', view: moving ? undefined : '34L', raise: f > 398 && f < 432 ? 1 : undefined }));
    A.push(P(f, 'ZZ_GUARD1', 32, TH(-1.9 + 0.75 * sm(312, 380, f), 0.4 - 1.8 * sm(312, 380, f)), { expr: 'determined', view: f > 312 && f < 380 ? undefined : '34R' }));
    if (f >= 430) A.push(TK(f, TH(-1.2, -2.95, 0.3), { expr: 'shock', pose: 'shock', look: -1 }, { s: 0.24 * back(430, 440, f) + 0.001, blob: false })); }
  if (k === 'ultim') { A.push(P(f, 'ZZ_CONSUL', 41, OF(0.3, -2.45), { expr: f < 561 ? 'thoughtful' : f < 601 ? 'determined' : 'smug', view: 'front', prop: f < 585 ? 'pen' : 'ultim', raise: f > 596 && f < 640 ? 1 : undefined }));
    A.push(P(f, 'ZZ_ADMIRAL', 42, OF(1.0, -2.35), { expr: f < 601 ? 'determined' : 'smug', view: '34L', prop: 'spyglass' }));
    A.push(TK(f, OF(0.72, -1.28, DY), { expr: f < 601 ? 'smile' : 'worried', pose: f < 590 ? 'stand' : 'point', look: -0.6 }, { s: 0.2, blob: false })); }
  if (k === 'barr') { A.push(P(f, 'ZZ_GUARD1', 51, HB(-2.2, -10.4), { expr: f < 713 ? 'determined' : 'worried', view: '34R' })); A.push(P(f, 'ZZ_GUARD2', 52, HB(1.3, -10.5), { expr: 'determined', view: '34L' }));
    A.push(P(f, 'ZZ_GUARD1', 53, HB(4.7, -10.3), { expr: 'nervous', view: '34L' })); A.push(P(f, 'ZZ_KHALID', 31, HB(-4.25, -20.0, 5.35), { expr: f < 700 ? 'determined' : 'smug', view: '34L' })); }
  if (k === 'nine') { A.push(P(f, 'ZZ_KHALID', 31, HB(-4.25, -20.0, 5.35), { expr: f < 846 ? 'determined' : 'smug', view: 'front', palm: f > 846 ? 1 : undefined })); }
  if (k === 'sink' && f >= 1036) { const T = sm(1040, 1080, f) * 0.9 + 0.02, bx = 22 + 6 * T, bz = 40 - 26 * T;
    A.push(P(f, 'ZZ_SAILOR', 61, HB(bx - 1.0, bz + 0.2, -0.65), { expr: 'relieved', view: 'front' })); A.push(P(f, 'ZZ_SAILOR', 62, HB(bx + 1.0, bz - 0.1, -0.65), { expr: 'worried', view: 'front' })); }
  if (k === 'dur') { A.push(TK(f, CK(0.5, -0.6, 0.5), { expr: f < 1430 ? 'smile' : f < 1470 ? 'shock' : 'happy', pose: f < 1430 ? 'point' : f < 1470 ? 'shock' : 'cheer', look: 0.4 }, { s: 0.8, blob: false })); }
  if (k === 'escape') { const t = sm(1508, 1596, f); A.push(P(f, 'ZZ_KHALID', 31, GC(1.2 - 1.2 * t, -2.0 - 9.4 * t), { expr: 'worried' })); }
  if (k === 'boat') { const a = sm(1608, 1640, f), b = sm(1640, 1656, f), bz = 2.2 + 4 * sm(1662, 1700, f) * 0.6;
    let p = lerp3(GC(0, -3.2), GC(0, -0.25), a); if (f >= 1640) p = lerp3(GC(0, -0.25), GC(0.5, bz - 0.05, -0.2), b); if (f >= 1656) p = GC(0.5, bz - 0.05, -0.2);
    A.push(P(f, 'ZZ_KHALID', 31, p, { expr: f < 1650 ? 'worried' : 'relieved', view: f < 1640 ? undefined : '34R' })); }
  if (k === 'bill') { const hand = f >= 1770; A.push(P(f, 'ZZ_CLERK', 71, OF(1.15, -1.45), { expr: f < 1770 ? 'smile' : 'smug', view: '34L', prop: f < 1790 ? 'bill' : undefined, palm: f >= 1790 && f < 1840 ? 1 : undefined }));
    A.push(P(f, 'ZZ_SUPP1', 72, OF(-0.55, -2.5), { expr: f < 1740 ? 'smile' : f < 1795 ? 'surprised' : 'shock', view: '34R' })); A.push(P(f, 'ZZ_SUPP2', 73, OF(0.25, -2.65), { expr: f < 1748 ? 'thoughtful' : f < 1795 ? 'worried' : 'shock', view: '34L' }));
    A.push(TK(f, OF(0.62, -1.3, DY), { expr: f < 1795 ? 'smile' : 'shock', pose: f < 1795 ? 'stand' : f < 1830 ? 'shock' : 'shrug', look: -0.5 }, { s: 0.2, blob: false })); }
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
const wsplash = (f, f0, pos, size, F2, n = 18) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'splash', t: (f - f0) / n, pos, size }); };
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { sboard(f, 8, ['THE SHORTEST', 'WAR IN HISTORY'], 'hook', 0.0, 0.66, 3, 0.56, F2, 42); sboard(f, 44, ['STARTED...'], 'hook', 0.0, 0.7, 3, 0.4, F2, 67); sboard(f, 69, ['...ENDED'], 'hook', 0.0, 0.7, 3, 0.36, F2, 90);
    stamp(f, 92, ['BEFORE', '10 AM'], 'hook', 0.0, 0.64, 3, 0.4, F2); sburst(f, 94, 'hook', 0.0, 0.64, 3, 0.5, F2); }
  if (k === 'date') { sboard(f, 141, ['ZANZIBAR'], 'date', 0.0, 0.7, 3, 0.38, F2, 158); sboard(f, 160, ['AUGUST 25,', '1896'], 'date', 0.0, 0.66, 3, 0.44, F2); }
  if (k === 'mourn') { sboard(f, 229, ['SULTAN HAMAD', 'BIN THUWAINI'], 'mourn', 0.0, 0.66, 3, 0.56, F2, 264); sboard(f, 266, ['DIED', 'SUDDENLY'], 'mourn', 0.0, 0.66, 3, 0.4, F2); }
  if (k === 'khalid') { sboard(f, 302, ['WITHIN HOURS'], 'khalid', 0.0, 0.7, 3, 0.44, F2, 330); sboard(f, 333, ['KHALID', 'BIN BARGHASH'], 'khalid', 0.0, 0.66, 3, 0.5, F2, 386); sboard(f, 390, ['"I AM THE', 'SULTAN NOW"'], 'khalid', 0.0, 0.66, 3, 0.52, F2, 428);
    stamp(f, 440, ['WITHOUT', "BRITAIN'S OK"], 'khalid', 0.0, 0.62, 3, 0.5, F2); }
  if (k === 'ultim') { sboard(f, 481, ['BRITAIN'], 'ultim', 0.0, 0.7, 3, 0.34, F2, 522); sboard(f, 524, ['A BRITISH', 'PROTECTORATE'], 'ultim', 0.0, 0.66, 3, 0.52, F2, 558); stamp(f, 560, ['ULTIMATUM'], 'ultim', 0.0, 0.64, 3, 0.48, F2, 590);
    bubble(f, 594, ['OUT BY', '9:00 AM!'], 'ultim', 0.12, 0.42, 3, 0.42, 1, F2); sboard(f, 625, ['AUGUST 27'], 'ultim', 0.0, 0.72, 3, 0.4, F2); }
  if (k === 'barr') { sboard(f, 658, ['BARRICADED'], 'barr', 0.0, 0.7, 3, 0.44, F2, 708); sboard(f, 711, ['GUARDS'], 'barr', 0.0, 0.7, 3, 0.34, F2, 736); sboard(f, 738, ['CANNONS'], 'barr', 0.0, 0.7, 3, 0.36, F2); }
  if (k === 'yacht') { sboard(f, 758, ['THE ROYAL YACHT'], 'yacht', 0.0, 0.7, 3, 0.5, F2, 781); stamp(f, 782, ['GLASGOW'], 'yacht', 0.0, 0.64, 3, 0.44, F2); }
  if (k === 'nine') { stamp(f, 806, ["9 O'CLOCK"], 'nine', 0.0, 0.66, 3, 0.48, F2, 840); sburst(f, 808, 'nine', 0.0, 0.0, 3, 0.6, F2); sboard(f, 844, ['HE STAYED.'], 'nine', 0.0, 0.7, 3, 0.42, F2); }
  if (k === 'fire') { stamp(f, 880, ['9:02 AM'], 'fire', 0.0, 0.66, 3, 0.42, F2, 918); sboard(f, 920, ['ROYAL NAVY'], 'fire', 0.0, 0.7, 3, 0.44, F2, 948); sboard(f, 950, ['OPEN FIRE'], 'fire', 0.0, 0.7, 3, 0.42, F2); }
  if (k === 'fire') for (const [f0, x, z, sz] of [[951, -6, 143, 7], [953, -16, 143, 7], [956, 4, 143, 7], [959, -48, 258, 12], [962, 44, 178, 9], [965, -82, 198, 9]]) if (f >= f0 && f < f0 + 10) F2.push({ fx: 'burst', t: (f - f0) / 10, pos: HBa(x, 5.5, z + 6), size: sz * 1.6, col: '#ffc060', rays: 12 });
  if (k === 'fire') for (const [f0, x, y] of [[957, -8, 9], [961, 6, 12], [964, -12, 5]]) wpuff(f, f0, HBa(x, y, -17), 14, F2, 14, '#5a5060');
  if (k === 'sink') { sboard(f, 979, ['THE GLASGOW', 'FIRES BACK'], 'sink', 0.0, 0.66, 3, 0.5, F2, 1018); stamp(f, 1021, ['SUNK'], 'sink', 0.0, 0.66, 3, 0.36, F2, 1042); sboard(f, 1044, ['CREW', 'RESCUED'], 'sink', 0.0, 0.66, 3, 0.4, F2);
    for (const [f0, x, z] of [[990, 24, 52], [1003, 36, 40], [1015, 27, 36], [1030, 34, 52]]) wsplash(f, f0, HBa(x, -0.6, z), 7, F2); }
  if (k === 'wreck') { stamp(f, 1092, ['9:40 AM'], 'wreck', 0.0, 0.66, 3, 0.42, F2, 1135); sboard(f, 1138, ['THE PALACE', 'IN RUINS'], 'wreck', 0.0, 0.66, 3, 0.48, F2, 1160); sboard(f, 1162, ['THE FLAG', 'COMES DOWN'], 'wreck', 0.0, 0.66, 3, 0.5, F2); }
  if (k === 'toll') { sboard(f, 1212, ['ABOUT 500', 'KILLED OR WOUNDED'], 'toll', 0.0, 0.66, 3, 0.56, F2, 1312); sboard(f, 1315, ['1 BRITISH', 'SAILOR WOUNDED'], 'toll', 0.0, 0.66, 3, 0.52, F2); }
  if (k === 'dur') { sboard(f, 1394, ['HOW LONG?'], 'dur', 0.0, 0.72, 3, 0.4, F2, 1428); sboard(f, 1430, ['38 MINUTES...'], 'dur', 0.0, 0.72, 3, 0.48, F2, 1452); sboard(f, 1454, ['...TO 45'], 'dur', 0.0, 0.72, 3, 0.36, F2, 1472);
    stamp(f, 1473, ['38-45', 'MINUTES'], 'dur', 0.0, 0.68, 3, 0.42, F2); stars(f, 1478, 'dur', 0.0, 0.3, 3, 0.55, F2, 24); }
  if (k === 'escape') { sboard(f, 1499, ['YOU SEE...'], 'escape', 0.0, 0.7, 3, 0.4, F2, 1540); sboard(f, 1542, ['HE ESCAPED'], 'escape', 0.0, 0.7, 3, 0.44, F2, 1568); sboard(f, 1570, ['TO THE GERMAN', 'CONSULATE'], 'escape', 0.0, 0.66, 3, 0.54, F2); }
  if (k === 'boat') { sboard(f, 1606, ['WEEKS LATER'], 'boat', 0.0, 0.7, 3, 0.46, F2, 1652); sboard(f, 1655, ['STRAIGHT FROM', 'THE GARDEN'], 'boat', 0.0, 0.66, 3, 0.54, F2); }
  if (k === 'bill') { sboard(f, 1703, ['HIS SUPPORTERS?'], 'bill', 0.0, 0.7, 3, 0.52, F2, 1744); sboard(f, 1746, ['REPORTEDLY...'], 'bill', 0.0, 0.7, 3, 0.46, F2, 1790);
    stamp(f, 1793, ['PAY FOR', 'THE SHELLS'], 'bill', 0.0, 0.64, 3, 0.48, F2); if (f < 1790) qmark(f, 1712, 'bill', 0.2, 0.25, 3, 0.1, F2); }
  return F2;
}
