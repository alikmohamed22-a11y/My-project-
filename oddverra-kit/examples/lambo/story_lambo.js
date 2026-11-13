// [LB-story] "Lamborghini started as a tractor maker" timeline (49.5 s voice, 1485 f @ 30 fps).
// Sets: lb_sets.js (farm / shop / office / factory / show) through setAt. Pattern: story_vikings.js (slow push per shot, zoom-through
// whips on cuts, screen-pinned boards / bursts / stamps, punch-ins on beats). CLUTCHY (a living clutch disc) is the sidekick; the
// motif is the tractor: it assembles itself from surplus, is the butt of Enzo's line, is unveiled brand-new in the twist and parks
// beside the orange supercar in the payoff.
import * as S from './story.js';
import { lf } from './lb_sets.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]                                   narration (word frames from work/words_frames.txt)
const SH = [
  [0, 99, 'hook', 'showHook'],        // Lamborghini exists because of a tractor clutch.  (tractor 57, clutch 67)
  [99, 202, 'war', 'farm'],           // After World War Two, an Italian mechanic named Ferruccio Lamborghini  (Ferruccio 170)
  [202, 294, 'build', 'farm'],        // built tractors out of leftover army surplus.  (tractors 221, army 254, surplus 266)
  [294, 362, 'loved', 'farmField'],   // Farmers loved them. He got rich!  (rich 341)
  [362, 411, 'rich', 'farm'],         // Rich enough to drive Ferraris.  (Ferraris 385)
  [411, 517, 'fail', 'shopNight'],    // You see, as the story goes, his Ferrari's clutch kept failing.  (clutch 481, failing 498)
  [517, 571, 'open', 'shopBench'],    // So his mechanics opened it up and  (opened 542)
  [571, 654, 'found', 'shopBench'],   // found a clutch much like the ones in his own tractors.  (clutch 581, like 597, tractors 627)
  [654, 828, 'enzo', 'office'],       // Ferruccio complained to Enzo Ferrari himself, and Enzo, reportedly, told him to stick to tractors.  (Enzo 685, reportedly 753, stick 791, tractors 802)
  [828, 850, 'mistake', 'office'],    // Big mistake!  (Big 833)
  [850, 971, 'company', 'factory'],   // In 1963, Ferruccio founded his own car company.  (1963 872, founded 921, company 953)
  [971, 1058, 'gt350', 'factoryGT'],  // The 350 GT arrived in 1964.  (350 974, arrived 999, 1964 1020)
  [1058, 1160, 'miura', 'show66'],    // Then, in 1966, the Miura shocked the world.  (1966 1073, Miura 1112, shocked 1122)
  [1160, 1278, 'twist', 'showNow'],   // Here's the twist. You can still buy a brand new Lamborghini... Tractor.  (twist 1169, brand 1218, Tractor 1262)
  [1278, 1485, 'payoff', 'farmGold'], // So one of the most famous supercar names on Earth was born from a bad clutch and a bruised ego.  (bad 1386, bruised 1419)
];
export const NF = 1485;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['lb', segAt(f)[3]];

// ---------- places (set-local -> world)
const O = { farm: [-64000, 0, 0], shop: [-64000, 0, 800], office: [-64000, 0, 1600], factory: [-66500, 0, 0], show: [-66500, 0, 800] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const FMa = at(O.farm), SHa = at(O.shop), OFa = at(O.office), FCa = at(O.factory), SWa = at(O.show);
const FM = (x, z, h = 0) => FMa(x, lf(x, z) + h, z), SP = (x, z, h = 0) => SHa(x, h, z), OF = (x, z, h = 0) => OFa(x, h, z), FC = (x, z, h = 0) => FCa(x, h, z), SW = (x, z, h = 0) => SWa(x, h, z);
const BX = -1.2, BY = 0.95, BZ = -3.65; // shop bench (lb_sets buildShop)

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(SWa(3.0, 1.0, 4.0), SWa(-0.2, 0.85, -0.6), 44, 1.4, SWa(0.4, 0.6, 0.2)),
  war: C(FMa(4.2, 1.75, 12.5), FMa(-2.2, 1.35, -3), 46, 0.8, FMa(-2.6, 1.2, 1.6)),
  build: C(FMa(4.6, 1.7, 5.6), FMa(0.3, 0.9, -1.0), 46, 1.4, FMa(0.4, 0.9, -1.0)),
  loved: C(FMa(16.6, 1.85, -5.0), FMa(20, 1.0, -26), 42, 0.8, FMa(18, 1.2, -13)),
  rich: C(FMa(-1.2, 1.35, 7.4), FMa(-4.6, 0.95, 1.6), 44, 1.4, FMa(-3.6, 1.1, 2.6)),
  fail: C(SHa(3.6, 1.6, 5.8), SHa(0.3, 1.0, -0.2), 48, 1.2, SHa(0.8, 1.0, 0.8)),
  open: C(SHa(-0.6, 1.7, 1.4), SHa(-1.2, 1.15, -3.6), 46, 1.4, SHa(-1.2, 1.1, -3.0)),
  found: C([BX + 0.06, BY + 1.15, BZ + 1.05].map((v, i) => v + O.shop[i]), [BX + 0.06, BY + 0.02, BZ - 0.02].map((v, i) => v + O.shop[i]), 50, 3.2, [BX, BY, BZ].map((v, i) => v + O.shop[i])),
  enzo: C(OFa(0.5, 1.6, 3.6), OFa(0.2, 1.15, -1.6), 46, 1.2, OFa(0.4, 1.2, -1.2)),
  mistake: C(OFa(2.0, 1.55, 1.2), OFa(0.9, 1.45, -0.4), 40, 2.4, OFa(1.0, 1.45, -0.4)),
  company: C(FCa(4.8, 1.8, 8.6), FCa(-0.6, 1.9, -6), 48, 0.8, FCa(-0.8, 1.2, 0.6)),
  gt350: C(FCa(4.4, 1.5, 2.6), FCa(0, 0.8, -2.4), 44, 1.4, FCa(0, 0.8, -2.2)),
  miura: C(SWa(0.6, 2.3, 10), SWa(0, 0.9, -0.6), 42, 1.0, SWa(0, 0.9, 0)),
  twist: C(SWa(0.3, 2.2, 12.5), SWa(0, 1.5, -0.6), 44, 1.0, SWa(0, 1.5, 0.4)),
  payoff: C(FMa(0.3, 1.2, 9), FMa(-0.1, 1.3, 0.4), 46, 1.2, FMa(0, 1.0, 1.9)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.14, war: 0.08, build: 0.1, loved: 0.06, rich: 0.1, fail: 0.1, open: 0.1, found: 0.12, enzo: 0.08, mistake: 0.08, company: 0.06, gt350: 0.1, miura: 0.08, twist: 0.08, payoff: 0 };
const base = (k) => V[k] || V.hook;
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const look = (d, f0, f1, fd) => { const t = sm(f0, f1, f); c = { ...c, l: add3(c.l, d.map((x) => x * t)), fp: add3(c.fp, (fd || d).map((x) => x * t)) }; };
  const orbit = (a, f0, f1) => { const t = sm(f0, f1, f) - 0.5, an = a * t, dx = c.p[0] - c.l[0], dz = c.p[2] - c.l[2]; c = { ...c, p: [c.l[0] + dx * Math.cos(an) - dz * Math.sin(an), c.p[1], c.l[2] + dx * Math.sin(an) + dz * Math.cos(an)] }; };
  if (k === 'hook') { orbit(0.3, 0, 99); punch(57, 63, 0.12); kick(57, 0.04); shake(64, 76, 0.03); }
  if (k === 'war') { punch(170, 177, 0.06); }
  if (k === 'build') { orbit(0.4, 202, 294); punch(254, 260, 0.06); }
  if (k === 'loved') { punch(341, 347, 0.1); kick(341, 0.05); }
  if (k === 'rich') { punch(385, 391, 0.08); }
  if (k === 'fail') { punch(481, 487, 0.06); punch(498, 504, 0.1); shake(498, 512, 0.04); }
  if (k === 'open') { orbit(0.3, 517, 571); }
  if (k === 'found') { punch(597, 604, 0.1); kick(597, 0.02); }
  if (k === 'enzo') { look([-0.5, 0, -0.3], 730, 760, [-1.0, 0, -0.8]); punch(791, 798, 0.12); kick(791, 0.03); }
  if (k === 'mistake') { punch(833, 839, 0.14); kick(833, 0.04); shake(834, 846, 0.03); }
  if (k === 'company') { punch(872, 879, 0.06); }
  if (k === 'gt350') { orbit(0.5, 971, 1058); punch(999, 1005, 0.08); }
  if (k === 'miura') { punch(1112, 1118, 0.1); kick(1112, 0.04); }
  if (k === 'twist') { punch(1169, 1175, 0.06); punch(1262, 1268, 0.12); kick(1262, 0.05); shake(1263, 1276, 0.03); }
  if (k === 'payoff') { const t = sm(1430, 1485, f); const P0 = FMa(0.3, 1.2, 9), P1 = FMa(1.2, 5.2, 17); c = { ...c, p: P0.map((v, i) => v + (P1[i] - v) * t), l: add3(c.l, [0, 0.5 * t, -1.0 * t]), fov: 44 + 2 * t, cInf: 1.2 - 0.6 * t };
    c = push(c, 0.06, 1278, 1430, f); punch(1386, 1392, 0.06); punch(1419, 1425, 0.08); kick(1419, 0.04); }
  return c;
}
const HARD = new Set([828, 850]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[57, 0.25, 6], [99, 0.75, 10], [202, 0.2, 6], [294, 0.25, 8], [341, 0.25, 6], [362, 0.25, 8], [411, 0.4, 10], [498, 0.25, 6], [571, 0.2, 6], [654, 0.3, 8], [833, 0.3, 6], [850, 0.75, 10], [971, 0.25, 8], [1058, 0.45, 10], [1112, 0.35, 6], [1160, 0.5, 12], [1262, 0.45, 8], [1278, 0.5, 10], [1419, 0.3, 6]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state
export function worldAt(f, w) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const L = w.lb; if (!L) return;
  L.setBuild(k === 'war' ? 0 : k === 'build' ? sm(206, 286, f) : 1);
  L.setGT(k === 'rich' ? 1 : 0);
  L.setDrive(k === 'loved' ? (f - 294) / 68 : 0);
  L.setTurn(k === 'hook' ? 0.35 + f * 0.004 : k === 'miura' ? -0.5 + (f - 1058) * 0.006 : k === 'twist' ? 0.25 + (f - 1160) * 0.0025 : 0.3);
  L.setCover(k === 'twist' ? 1 - eo(1250, 1262, f) : 1);
  const fl = (f0) => (f >= f0 && f < f0 + 4 ? 1 - (f - f0) / 4 : 0);
  L.setFlash(k === 'miura' ? Math.max(fl(1112), fl(1121), fl(1130), fl(1142)) : k === 'twist' ? fl(1262) : 0);
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const CL = (f, pos, opts = {}, extra = {}) => person(f, 'CLUTCHY', 9, pos, { t: f, ...opts }, { s: 0.32, ...extra });
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') { const up = f >= 52; if (up) A.push(CL(f, add3(SWa(1.3, 0.28, 2.0), [0, 0.06 * Math.max(0, 1 - (f - 52) / 8), 0]), { expr: f < 64 ? 'shock' : 'sly', pose: f < 64 ? 'shock' : 'shrug', worn: 1 }, { s: 0.3 * back(52, 62, f) + 0.001, blob: false }));
    [['LB_GENT', 31, -3.6, 4.4], ['LB_LADY', 32, -2.6, 5.2]].forEach(([o, sd, x, z]) => A.push(P(f, o, sd, SW(x, z), { expr: f < 57 ? 'love' : 'shock', view: '34R' }))); }
  if (k === 'war') { const t = sm(104, 186, f); A.push(P(f, 'LB_FERW', 11, FM(-1.6 - 1.6 * t, 3.2 - 2.6 * t), { expr: f < 170 ? 'thoughtful' : 'smile', prop: 'wrench', view: f < 186 ? '34L' : '34R' }));
    A.push(P(f, 'LB_FARM3', 12, FM(3.6, -0.8), { expr: 'smile', view: '34L' })); }
  if (k === 'build') { A.push(P(f, 'LB_FERW', 11, FM(1.6, -0.3), { expr: f < 254 ? 'determined' : f < 280 ? 'excited' : 'happy', prop: 'wrench', view: '34R', raise: f > 280 ? 1 : undefined }, { roll: f < 280 ? 0.03 * Math.sin(f * 0.6) : 0 }));
    if (f > 262) A.push(CL(f, FM(2.1, 0.8), { expr: 'love', pose: 'cheer' }, { s: 0.26 * back(262, 272, f) + 0.001 })); }
  if (k === 'loved') { A.push(P(f, 'LB_FARM1', 21, FM(16.6, -15.4), { expr: 'laugh', cheer: wav(f, 0), view: '34R' })); A.push(P(f, 'LB_FARM2', 22, FM(18.0, -16.2), { expr: 'happy', wave: wav(f, 1), view: '34R' }));
    A.push(P(f, 'LB_KID', 23, FM(17.3, -14.6), { expr: 'excited', cheer: wav(f, 2) }, { s: 0.85 })); A.push(P(f, 'LB_FERW', 11, FM(19.4, -15.0), { expr: f < 341 ? 'smile' : 'smug', view: '34R', hip: f > 341 ? 1 : undefined })); }
  if (k === 'rich') { A.push(P(f, 'LB_FERS', 13, FM(-3.3, 3.0), { expr: f < 385 ? 'smug' : 'happy', prop: 'keys', view: '34L' })); A.push(P(f, 'LB_FARM3', 12, FM(-7.6, 0.4), { expr: 'surprised', view: '34R' })); }
  if (k === 'fail') { A.push(P(f, 'LB_FERN', 14, SP(1.9, 1.8), { expr: f < 481 ? 'thoughtful' : f < 498 ? 'worried' : 'angry', view: '34L', palm: f > 498 ? 1 : undefined }));
    A.push(P(f, 'LB_MECH', 15, SP(-0.4, -1.2), { expr: f < 498 ? 'nervous' : 'shock', prop: 'wrench', view: '34R' })); }
  if (k === 'open') { A.push(P(f, 'LB_MECH', 15, SP(-1.9, -2.7), { expr: f < 542 ? 'thoughtful' : 'surprised', prop: 'wrench', view: '34R' })); A.push(P(f, 'LB_MECH2', 16, SP(-0.5, -2.7), { expr: f < 542 ? 'smile' : 'shock', view: '34L' })); }
  if (k === 'found') { if (f >= 594) A.push(CL(f, SHa(BX + 0.12, BY, BZ + 0.43), { expr: f < 610 ? 'shock' : f < 627 ? 'sly' : 'happy', pose: f < 610 ? 'shock' : 'point', worn: 1 }, { s: 0.13 * back(594, 604, f) + 0.001, blob: false })); }
  if (k === 'enzo') { const rep = f >= 733; A.push(P(f, 'LB_ENZO', 41, OF(-0.05, -2.45, 0.45), { expr: f < 733 ? 'bored' : f < 778 ? 'smug' : 'mean', mode: 'sit', palm: f > 778 ? 1 : undefined, view: 'front' }, { blob: false }));
    A.push(P(f, 'LB_FERS', 13, OF(0.85, -0.4), { expr: f < 733 ? 'angry' : f < 791 ? 'surprised' : 'shock', prop: f < 760 ? 'clutchp' : undefined, point: f > 664 && f < 730 ? 1 : undefined, view: '34L' })); }
  if (k === 'mistake') { A.push(P(f, 'LB_FERS', 13, OF(1.05, -0.5), { expr: 'angry', view: '34L', hip: 1 })); }
  if (k === 'company') { const t = sm(856, 940, f); A.push(P(f, 'LB_FERS', 13, FC(-1.0 + 0.2 * t, -3.2 + 4.2 * t), { expr: f < 921 ? 'determined' : 'proud', view: f < 940 ? 'front' : '34R' }));
    A.push(P(f, 'LB_WORK', 51, FC(1.9, -6.4), { expr: 'smile', prop: 'wrench', view: '34L' })); A.push(P(f, 'LB_MECH', 52, FC(-2.1, -1.8), { expr: 'happy', view: '34R' })); A.push(P(f, 'LB_WORK', 53, FC(2.0, -1.0), { expr: 'smile', view: '34L' })); }
  if (k === 'gt350') { A.push(P(f, 'LB_FERS', 13, FC(1.7, -3.8), { expr: f < 999 ? 'smile' : 'proud', view: '34R', hip: f > 1000 ? 1 : undefined })); A.push(P(f, 'LB_WORK', 51, FC(2.0, -4.6), { expr: 'happy', view: '34L' })); }
  if (k === 'miura') { const shock = f >= 1112; A.push(P(f, 'LB_FERS', 13, SW(-1.4, 2.0, 0.28), { expr: shock ? 'proud' : 'smile', view: '34R', hip: shock ? 1 : undefined }));
    [['LB_GENT', 61, -1.05, 6.0], ['LB_PHOTO', 63, 1.1, 6.3], ['LB_LADY', 62, -2.0, 4.6], ['LB_LADY2', 64, 2.0, 4.4]].forEach(([o, sd, x, z], i) =>
      A.push(P(f, o, sd, SW(x, z), { expr: shock ? (i % 2 ? 'love' : 'shock') : 'smile', prop: o === 'LB_PHOTO' ? 'flashcam' : undefined, view: z > 5.5 ? 'back' : x < 0 ? '34R' : '34L', flash: o === 'LB_PHOTO' && shock && (f - 1112 + i * 3) % 9 < 3 ? 1 : undefined }))); }
  if (k === 'twist') { const rev = f >= 1258; A.push(CL(f, SW(1.3, 3.2), { expr: f < 1200 ? 'sly' : rev ? 'love' : 'smile', pose: rev ? 'cheer' : f < 1200 ? 'shrug' : 'point' }, { s: 0.34 }));
    A.push(P(f, 'LB_NOWF', 71, SW(-1.4, 3.1), { expr: rev ? 'excited' : 'thoughtful', prop: 'keys', view: '34R', cheer: rev ? wav(f, 0, 0.3) : undefined }));
    [['LB_LADY2', 72, -1.9, 5.2], ['LB_GENT', 73, 2.0, 5.0]].forEach(([o, sd, x, z]) => A.push(P(f, o, sd, SW(x, z), { expr: rev ? 'laugh' : 'smile', view: x < 0 ? '34R' : '34L' }))); }
  if (k === 'payoff') { A.push(P(f, 'LB_FERS', 13, FM(0.0, 1.9), { expr: f < 1386 ? 'smile' : f < 1419 ? 'smug' : 'laugh', view: 'front', cross: f < 1386 ? 1 : undefined }));
    A.push(CL(f, FM(0.8, 3.0), { expr: f < 1386 ? 'happy' : 'love', pose: f < 1386 ? 'wave' : 'cheer', worn: 1 }, { s: 0.3 })); }
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
  if (k === 'hook') { sboard(f, 2, ['LAMBORGHINI'], 'hook', 0.0, 0.68, 3, 0.5, F2, 55); stamp(f, 60, ['TRACTOR', 'CLUTCH?!'], 'hook', 0.0, 0.6, 2.6, 0.44, F2); sburst(f, 57, 'hook', 0.25, -0.25, 2.6, 0.5, F2); }
  if (k === 'war') { sboard(f, 101, ['AFTER', 'WORLD WAR II'], 'war', 0.0, 0.66, 3, 0.46, F2, 166); sboard(f, 168, ['FERRUCCIO', 'LAMBORGHINI'], 'war', 0.0, 0.66, 3, 0.48, F2); }
  if (k === 'build') { sboard(f, 204, ['BUILT', 'TRACTORS...'], 'build', 0.0, 0.66, 3, 0.44, F2, 250); sboard(f, 252, ['...FROM ARMY', 'SURPLUS!'], 'build', 0.0, 0.66, 3, 0.46, F2); for (const f0 of [214, 230, 246, 262, 276]) sburst(f, f0, 'build', 0.1, -0.15, 3, 0.36, F2, '#fff3b0', 10); }
  if (k === 'loved') { sboard(f, 296, ['FARMERS', 'LOVED THEM'], 'loved', 0.0, 0.66, 3, 0.46, F2, 338); stamp(f, 340, ['RICH!'], 'loved', 0.0, 0.6, 3, 0.36, F2); stars(f, 344, 'loved', 0.0, 0.3, 3, 0.5, F2, 24); }
  if (k === 'rich') { sboard(f, 364, ['RICH ENOUGH', 'FOR FERRARIS'], 'rich', 0.0, 0.66, 3, 0.46, F2); sburst(f, 385, 'rich', 0.0, 0.66, 3, 0.5, F2); }
  if (k === 'fail') { sboard(f, 413, ['AS THE STORY', 'GOES...'], 'fail', 0.0, 0.66, 3, 0.46, F2, 478); stamp(f, 498, ['CLUTCH', 'FAILING'], 'fail', 0.0, 0.6, 3, 0.42, F2);
    for (const f0 of [481, 490, 498, 506]) wpuff(f, f0, SHa(0.4 + (f0 % 3) * 0.3, 0.45 + (f - f0) * 0.02, 0.9), 1.3, F2, 18, '#5a5a6a'); }
  if (k === 'open') { sboard(f, 519, ['HIS MECHANICS', 'OPENED IT UP'], 'open', 0.0, 0.66, 3, 0.48, F2); }
  if (k === 'found') { sboard(f, 573, ['A CLUTCH', 'MUCH LIKE...'], 'found', 0.0, 0.66, 1.2, 0.46, F2, 620); sboard(f, 622, ['...HIS TRACTOR', 'CLUTCHES!'], 'found', 0.0, 0.66, 1.2, 0.48, F2); sburst(f, 597, 'found', 0.0, 0.0, 1.2, 0.5, F2); qmark(f, 600, 'found', -0.32, 0.25, 1.2, 0.1, F2); }
  if (k === 'enzo') { sboard(f, 683, ['ENZO', 'FERRARI'], 'enzo', 0.0, 0.66, 3, 0.4, F2, 750); sboard(f, 752, ['REPORTEDLY...'], 'enzo', 0.0, 0.68, 3, 0.42, F2, 790); bubble(f, 788, ['STICK TO', 'TRACTORS!'], 'enzo', 0.1, 0.4, 3, 0.5, -1, F2); }
  if (k === 'mistake') { stamp(f, 833, ['BIG', 'MISTAKE'], 'mistake', 0.0, 0.6, 2, 0.42, F2); }
  if (k === 'company') { sboard(f, 852, ['1963'], 'company', 0.0, 0.7, 4, 0.32, F2, 916); sburst(f, 872, 'company', 0.0, 0.7, 4, 0.45, F2, '#ffe0a0'); sboard(f, 918, ['HIS OWN', 'CAR COMPANY'], 'company', 0.0, 0.66, 4, 0.46, F2); }
  if (k === 'gt350') { sboard(f, 973, ['350 GT'], 'gt350', 0.0, 0.68, 3, 0.36, F2, 1016); sboard(f, 1018, ['1964'], 'gt350', 0.0, 0.68, 3, 0.3, F2); sburst(f, 999, 'gt350', 0.0, -0.1, 3, 0.55, F2); }
  if (k === 'miura') { sboard(f, 1060, ['1966'], 'miura', 0.0, 0.7, 4, 0.3, F2, 1108); sboard(f, 1110, ['THE MIURA'], 'miura', 0.0, 0.68, 4, 0.42, F2); sburst(f, 1112, 'miura', 0.0, -0.05, 4, 0.6, F2, '#ffe0a0', 14); stars(f, 1124, 'miura', 0.0, 0.3, 4, 0.55, F2, 24); }
  if (k === 'twist') { stamp(f, 1162, ['THE TWIST'], 'twist', 0.0, 0.62, 3, 0.42, F2, 1186); sboard(f, 1188, ['STILL ON SALE:', 'A BRAND-NEW...'], 'twist', 0.0, 0.66, 3, 0.5, F2, 1258); sboard(f, 1260, ['LAMBORGHINI', 'TRACTOR!'], 'twist', 0.0, 0.66, 3, 0.5, F2); sburst(f, 1262, 'twist', 0.0, 0.0, 3, 0.6, F2, '#fff3b0', 14); }
  if (k === 'payoff') { sboard(f, 1284, ['ONE OF THE MOST', 'FAMOUS SUPERCARS...'], 'payoff', 0.0, 0.66, 3, 0.52, F2, 1382); stamp(f, 1386, ['BAD CLUTCH'], 'payoff', 0.0, 0.62, 3, 0.4, F2, 1417); stamp(f, 1419, ['+ BRUISED EGO'], 'payoff', 0.0, 0.62, 3, 0.46, F2); stars(f, 1428, 'payoff', 0.0, 0.25, 3, 0.55, F2, 24); }
  return F2;
}
