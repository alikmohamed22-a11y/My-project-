// [BB-story] "Big Ben isn't the tower, it's the bell" timeline (59.03 s voice, 1771 f @ 30 fps).
// Sets: bb_sets.js (tower / belfry / yard / foundry / clock) through setAt. Pattern: story_niagara.js (slow push per shot, zoom-through
// whips on cuts, screen-pinned boards / bursts / stamps, punch-ins on beats). The motif is the bell's BONG: the cold open rings out of
// the tower, the reveal strikes Big Ben in the belfry, the first bell cracks on its test strike, the 1859 bell rings then cracks, the
// fixed bell strikes fresh metal, the crack close-up rings, and the payoff BONG rolls over Westminster at dusk. Sidekick: BONGO, a
// little living bell who ends up with his own crack.
import * as S from './story.js';
import { TOWER, BELL } from './bb_sets.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]                                   narration (word frames from work/words_frames.txt)
const SH = [
  [0, 58, 'hook', 'towerDay'],        // Big Ben isn't the tower,  (Big 3, tower 33)
  [58, 106, 'bell', 'belfry'],        // it's the bell inside it.  (bell 63, inside 70)
  [106, 199, 'plaque', 'towerDay'],   // The tower was simply called the Clock Tower. In twenty twelve,  (Clock 147, In 171, twelve 181)
  [199, 310, 'jubilee', 'towerGold'], // it was renamed Elizabeth Tower, for the Queen's Diamond Jubilee.  (renamed 204, Elizabeth 217, Diamond 277)
  [310, 403, 'why', 'yard'],          // So why "Big Ben"? Nobody's totally sure.  (why 314, Big 328, Nobody's 357)
  [403, 498, 'hall', 'yard'],         // Maybe Sir Benjamin Hall, the big man in charge of the works.  (Sir 411, Hall 433, big 453, works 482)
  [498, 586, 'caunt', 'yard'],        // Or maybe Ben Caunt, a heavyweight boxer.  (Ben 516, Caunt 525, heavyweight 545, boxer 555)
  [586, 760, 'test', 'yard'],         // But the bell had a rough start. In eighteen fifty-seven, the first great bell cracked during testing.  (rough 615, eighteen 649, cracked 717, testing 742)
  [760, 839, 'recast', 'foundry'],    // So it was broken up, and recast at Whitechapel.  (broken 778, recast 801, Whitechapel 823)
  [839, 1007, 'ring', 'belfryGold'],  // The new bell rang out in eighteen fifty-nine. And within months... it cracked too!  (rang 868, eighteen 889, within 930, cracked 966, too 975)
  [1007, 1216, 'fix', 'belfryNight'], // You see, instead of starting over, they turned the bell a quarter-turn, so the hammer hits fresh metal, and gave it a lighter hammer.  (turned 1065, quarter 1089, hammer 1123, hits 1131, lighter 1183)
  [1216, 1371, 'still', 'belfry'],    // And the crack? It's still there. It's reportedly part of why Big Ben sounds the way it does.  (crack 1223, still 1247, reportedly 1272, sounds 1319)
  [1371, 1572, 'clock', 'clock'],     // Even the clock is fine-tuned with old pennies. Add one to the pendulum, and it gains about two-fifths of a second a day.  (pennies 1430, Add 1451, pendulum 1470, two-fifths 1507)
  [1572, 1771, 'payoff', 'towerDusk'], // So the most famous bell on Earth is a cracked one... and most people still think it's a tower.  (famous 1595, cracked 1642, people 1679, tower 1715)
];
export const NF = 1771;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['bb', segAt(f)[3]];

// ---------- places (set-local -> world)
const O = { tower: [-136000, 0, 0], belfry: [-136000, 0, 800], yard: [-138500, 0, 0], foundry: [-138500, 0, 800], clock: [-138500, 0, 1600] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const TWa = at(O.tower), BFa = at(O.belfry), YDa = at(O.yard), FDa = at(O.foundry), CKa = at(O.clock);
const { TW, DY, BY0, BY1 } = TOWER;
const STRIKES = { bell: [63], ring: [868, 960], fix: [1139], still: [1305] };
// hammer lift for a strike at f0: raise (f0-16..f0-5), fall onto the bell (f0-5..f0), rebound and settle (f0..f0+12)
const blow = (f, f0) => { if (f < f0 - 16 || f > f0 + 14) return 0; if (f < f0 - 5) return sm(f0 - 16, f0 - 6, f); if (f <= f0) return 1 - 1.12 * eo(f0 - 5, f0, f); return -0.12 + 0.12 * sm(f0, f0 + 12, f) + 0.25 * Math.sin(Math.PI * Math.min(1, (f - f0) / 12)) * (1 - (f - f0) / 14); };
const lastStrike = (f, k) => (STRIKES[k] || []).filter((s) => s <= f).pop() ?? -1;

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(TWa(7, 1.7, 48), TWa(0, 58, 0), 46, 0.5, TWa(0, 60, 0)),
  bell: C(BFa(-1.2, 1.8, 7.4), BFa(0.6, 3.6, 0), 50, 1.4, BFa(0.4, 3.6, 0.6)),
  plaque: C(TWa(-3.0, 1.55, 15.6), TWa(-0.2, 2.6, 6), 44, 1.2, TWa(-0.6, 2.2, 8)),
  jubilee: C(TWa(2.2, 1.6, 21), TWa(0, 3.6, 6), 46, 1.0, TWa(0, 3.4, 7)),
  why: C(YDa(1.4, 1.7, 8.2), YDa(0, 1.9, -2), 46, 1.2, YDa(0.2, 1.4, 0)),
  hall: C(YDa(0.4, 1.7, 5.8), YDa(-0.7, 1.75, 0), 44, 1.6, YDa(-0.8, 1.6, 0.4)),
  caunt: C(YDa(-4.1, 1.5, -0.6), YDa(-6.6, 1.35, -8.6), 44, 1.4, YDa(-6.2, 1.3, -7.2)),
  test: C(YDa(0.2, 1.9, 11.2), YDa(-0.1, 1.7, -2), 50, 1.0, YDa(0.0, 1.6, -1.4)),
  recast: C(FDa(2.6, 2.3, 5.6), FDa(0.2, 1.6, -0.6), 48, 1.4, FDa(0.6, 1.4, -0.4)),
  ring: C(BFa(0.9, 1.7, 5.6), BFa(0.3, 3.7, 0), 54, 1.4, BFa(0.6, 3.6, 0.6)),
  fix: C(BFa(0.3, 4.6, 5.5), BFa(1.0, 3.4, 0), 54, 1.4, BFa(1.0, 3.5, 0.4)),
  still: C(BFa(-0.6, 3.1, 4.2), BFa(0.1, 3.5, 1.1), 40, 2.2, BFa(0.05, 3.5, 1.3)),
  clock: C(CKa(3.0, 2.4, 6.6), CKa(0.3, 2.7, 0.4), 50, 1.4, CKa(0.6, 2.8, 1.6)),
  payoff: C(TWa(108, 4.0, 27.6), TWa(0, 31, 0), 54, 0.5, TWa(103, 4.2, 26.4)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.1, bell: 0.08, plaque: 0.1, jubilee: 0.06, why: 0.1, hall: 0.1, caunt: 0.1, test: 0.08, recast: 0.1, ring: 0.06, fix: 0.06, still: 0.12, clock: 0, payoff: 0.03 };
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function cam(k, f) {
  const s = segAt(f); let c = push(V[k] || V.hook, PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const look = (d, f0, f1, fd) => { const t = sm(f0, f1, f); c = { ...c, l: add3(c.l, d.map((x) => x * t)), fp: add3(c.fp, (fd || d).map((x) => x * t)) }; };
  if (k === 'hook') { shake(2, 16, 0.5); punch(33, 39, 0.06); const t = sm(40, 58, f); c = { ...c, l: lerp3(c.l, TWa(0, (BY0 + BY1) / 2, 0), t), fov: c.fov * (1 - 0.35 * t * t) }; }
  if (k === 'bell') { shake(63, 76, 0.06); punch(63, 69, 0.08); kick(63, 0.05); }
  if (k === 'plaque') { punch(147, 153, 0.08); punch(181, 187, 0.05); }
  if (k === 'jubilee') { punch(217, 223, 0.08); const t = sm(244, 284, f); c = { ...c, p: lerp3(c.p, TWa(10, 2.0, 96), t), l: lerp3(c.l, TWa(0, 40, 0), t), fp: lerp3(c.fp, TWa(0, 30, 0), t), fov: c.fov + 2 * t, cInf: 1.0 - 0.5 * t }; kick(277, 0.6); }
  if (k === 'why') { punch(328, 334, 0.06); look([0.3, -0.2, 1.8], 350, 380, [0.2, -0.2, 2.2]); }
  if (k === 'hall') { punch(433, 439, 0.08); look([0, 0.4, 0], 450, 470); punch(453, 459, 0.04); }
  if (k === 'caunt') { punch(525, 531, 0.08); punch(555, 561, 0.06); kick(555, 0.04); }
  if (k === 'test') { punch(649, 655, 0.06); punch(717, 722, 0.14); kick(717, 0.08); shake(717, 735, 0.12); }
  if (k === 'recast') { const t = sm(784, 806, f); c = { ...c, p: lerp3(FDa(5.6, 1.5, 5.0), c.p, t), l: lerp3(FDa(4.3, 0.5, 1.2), c.l, t), fp: lerp3(FDa(4.3, 0.4, 1.4), c.fp, t) }; punch(778, 784, 0.06); punch(823, 829, 0.06); }
  if (k === 'ring') { shake(868, 880, 0.06); punch(868, 874, 0.06); punch(889, 895, 0.05); look([0.3, -0.1, 0], 920, 958, [0.3, -0.1, 0]); punch(966, 972, 0.14); kick(966, 0.06); shake(966, 986, 0.1); }
  if (k === 'fix') { punch(1089, 1095, 0.06); punch(1139, 1144, 0.05); shake(1139, 1150, 0.03); punch(1183, 1189, 0.08); }
  if (k === 'still') { punch(1247, 1253, 0.08); shake(1305, 1318, 0.05); punch(1305, 1311, 0.06); }
  if (k === 'clock') { const t = sm(1420, 1452, f); c = { ...c, p: lerp3(c.p, CKa(1.75, 3.45, 4.3), t), l: lerp3(c.l, CKa(0.5, 3.2, 1.6), t), fp: lerp3(c.fp, CKa(0.5, 3.15, 1.6), t), fov: c.fov - 12 * t, cInf: c.cInf + 1.0 * t };
    punch(1466, 1472, 0.06); punch(1507, 1513, 0.06); }
  if (k === 'payoff') { punch(1595, 1601, 0.04); punch(1642, 1648, 0.08); kick(1642, 0.4); shake(1642, 1658, 0.3); const t = sm(1700, 1771, f); c = { ...c, fov: c.fov + 4 * t }; punch(1715, 1721, 0.06); }
  return c;
}
const HARD = new Set([199, 760, 1371]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[2, 0.35, 8], [33, 0.3, 6], [58, 0.45, 10], [63, 0.35, 6], [106, 0.4, 10], [147, 0.25, 6], [199, 0.8, 14], [217, 0.4, 8], [277, 0.35, 8], [310, 0.5, 10], [403, 0.35, 8], [498, 0.35, 8], [586, 0.35, 8],
    [717, 0.6, 8], [760, 0.6, 12], [801, 0.3, 8], [839, 0.45, 10], [868, 0.3, 6], [966, 0.35, 8], [1007, 0.5, 12], [1183, 0.12, 6], [1216, 0.4, 10], [1305, 0.3, 6], [1371, 0.6, 12], [1455, 0.25, 6], [1572, 0.5, 12], [1642, 0.4, 8], [1715, 0.3, 6]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state
export function worldAt(f, w) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const B = w.bb; if (!B) return;
  // tower: time on the dials, plaque, bunting, rings
  B.setTime(k === 'payoff' ? 1080 + (f - 1572) / 30 / 60 : 720 + (f - 120) / 30 / 60 * (k === 'hook' ? 0 : 1));
  B.setPlaque(k === 'jubilee' ? (f >= 217 ? 1 : 0) : 0); B.setBunting(k === 'jubilee' && f >= 270);
  // rings: tower (hook 2, payoff 1642), belfry strikes
  const sk = lastStrike(f, k); B.setRing(k === 'hook' ? 2 : k === 'payoff' ? (f >= 1642 ? 1642 : -1) : sk);
  // belfry bell: hammer, crack, turn, shake
  let lift = 0; for (const s0 of STRIKES[k] || []) lift += blow(f, s0);
  const lighter = k === 'fix' ? 1 - 0.32 * sm(1172, 1190, f) : k === 'still' ? 0.68 : 1;
  B.setHammer(k === 'fix' && f > 1176 && f < 1192 ? lift + 0.6 * Math.sin(Math.PI * sm(1172, 1192, f)) : lift, lighter);
  B.setCrack(k === 'bell' || k === 'still' || k === 'fix' ? 1 : k === 'ring' ? (f < 966 ? 0 : sm(966, 976, f)) : 1, k === 'still');
  B.setTurn(k === 'fix' ? 0.35 + 0.65 * sm(1062, 1104, f) : k === 'still' || k === 'bell' ? 1 : 0.35);
  const shk = sk >= 0 ? Math.max(0, 1 - (f - sk) / 14) : 0; B.setShake(shk * (k === 'ring' && sk === 960 ? 2 : 1), f); B.setFlash(sk >= 0 && f - sk < 4 ? 1 - (f - sk) / 4 : 0);
  // yard test strike (crack at 717)
  const yl = k === 'test' ? blow(f, 717) : 0; B.setYard({ crack: k === 'test' ? sm(717, 724, f) : 0, lift: yl, shake: k === 'test' ? Math.max(0, 1 - Math.abs(f - 720) / 14) : 0, f });
  if (k === 'test') B.setFlash(f >= 717 && f < 722 ? 1 - (f - 717) / 5 : 0);
  // foundry pour
  B.setPour(k === 'recast' ? 0.2 * sm(786, 800, f) + 0.8 * sm(800, 838, f) : 0);
  // clock pennies: 6 on the tray, the 7th drops at 1452..1466
  B.setPennies(k === 'clock' && f >= 1466 ? 7 : 6, k === 'clock' && f >= 1452 && f < 1466 ? (f - 1452) / 14 : -1); B.setSwing(1);
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const BONGO = (f, pos, opts = {}, extra = {}) => person(f, 'BONGO', 7, pos, { t: f, pose: 'stand', ...opts }, { s: 0.42, ...extra });
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
const rng = (f, s0) => (s0 >= 0 && f >= s0 && f < s0 + 24 ? 1 - (f - s0) / 24 : 0);
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  const sk = lastStrike(f, k);
  if (k === 'bell') { A.push(BONGO(f, BFa(-0.5, 1.2, 1.3), { expr: f < 63 ? 'smile' : f < 80 ? 'dazed' : 'happy', pose: f >= 63 && f < 82 ? 'ears' : 'wave', ring: rng(f, 63) })); }
  if (k === 'plaque') { A.push(P(f, 'BB_TOUR1', 11, TWa(-1.9, 0, 9.6), { expr: f < 147 ? 'smile' : 'excited', prop: 'selfie', view: '34R' }));
    A.push(P(f, 'BB_KID', 12, TWa(1.3, 0, 9.2), { expr: f < 147 ? 'smile' : 'surprised', view: '34L', point: f > 150 ? 1 : undefined }, { s: 0.8 }));
    A.push(BONGO(f, TWa(0.5, 0, 8.6), { expr: f < 147 ? 'smile' : 'proud', pose: f < 147 ? 'stand' : 'point', flip: true })); }
  if (k === 'jubilee') { A.push(P(f, 'BB_TOUR1', 11, TWa(-2.0, 0, 10.6), { expr: f < 217 ? 'surprised' : 'laugh', view: '34R', cheer: f > 270 ? wav(f, 0) : undefined }));
    A.push(P(f, 'BB_TOUR2', 13, TWa(2.1, 0, 10.2), { expr: f < 217 ? 'smile' : 'happy', view: '34L', wave: f > 222 ? wav(f, 1) : undefined }));
    A.push(P(f, 'BB_KID', 12, TWa(0.9, 0, 11.4), { expr: 'excited', view: '34L', cheer: f > 277 ? wav(f, 2) : undefined }, { s: 0.8 }));
    A.push(BONGO(f, TWa(-0.4, 0, 9.4), { expr: f < 217 ? 'shock' : 'love', pose: f < 217 ? 'shock' : 'cheer' })); }
  if (k === 'why') { A.push(BONGO(f, YDa(0.6, 0, 1.6), { expr: f < 357 ? 'smile' : 'worried', pose: f < 357 ? 'point' : 'shrug', flip: true }));
    A.push(P(f, 'BB_WORK1', 21, YDa(-2.6, 0, -0.6), { expr: f < 357 ? 'thoughtful' : 'nervous', view: '34R' }));
    A.push(P(f, 'BB_WORK2', 22, YDa(2.9, 0, -0.4), { expr: 'thoughtful', view: '34L', prop: 'mallet' })); }
  if (k === 'hall') { A.push(P(f, 'BB_HALL', 31, YDa(-1.1, 0, 0.3), { expr: f < 433 ? 'smile' : f < 453 ? 'proud' : 'smug', view: '34R', hip: f >= 440 ? 1 : undefined }, { s: 1.12 }));
    A.push(BONGO(f, YDa(-0.1, 0, 1.9), { expr: f < 453 ? 'smile' : 'shock', pose: f < 453 ? 'stand' : 'shock', flip: true })); }
  if (k === 'caunt') { A.push(P(f, 'BB_CAUNT', 41, YDa(-6.1, 0, -7.3), { expr: f < 545 ? 'grin' : 'determined', view: '34L', cheer: f >= 545 ? wav(f, 0, 0.3) : undefined }, { s: 1.06 }));
    A.push(BONGO(f, YDa(-7.1, 0, -6.1), { expr: f < 545 ? 'happy' : 'shock', pose: f < 545 ? 'wave' : 'shock', flip: true })); }
  if (k === 'test') { const sh = f >= 717 && f < 760;
    A.push(P(f, 'BB_WORK1', 21, YDa(-2.0, 0, 0.9), { expr: f < 700 ? 'determined' : sh ? 'shock' : 'nervous', view: '34R' }));
    A.push(P(f, 'BB_WORK2', 22, YDa(2.5, 0, 0.0), { expr: f < 700 ? 'smile' : sh ? 'shock' : 'worried', view: '34L', prop: 'rope' }, { roll: f > 690 && f < 715 ? -0.06 : 0 }));
    A.push(P(f, 'BB_HALL', 31, YDa(-1.6, 0, 3.6), { expr: f < 717 ? 'proud' : 'shock', view: '34R' }, { s: 1.12 }));
    A.push(P(f, 'BB_LADY', 33, YDa(1.6, 0, 3.3), { expr: f < 717 ? 'smile' : 'shock', view: '34L' }));
    A.push(BONGO(f, YDa(0.3, 0, 4.0), { expr: f < 717 ? 'smile' : 'shock', pose: f < 717 ? 'stand' : 'shock' })); }
  if (k === 'recast') { A.push(P(f, 'BB_FOUND', 51, FDa(-2.3, 0, 0.7), { expr: f < 792 ? 'determined' : 'happy', view: '34R', prop: 'ladle2' }));
    A.push(P(f, 'BB_WORK1', 52, FDa(3.3, 0, 0.5), { expr: f < 801 ? 'sad' : 'surprised', view: '34L', prop: f < 790 ? 'mallet' : undefined }));
    A.push(BONGO(f, FDa(3.4, 0, 2.4), { expr: f < 801 ? 'worried' : 'love', pose: f < 801 ? 'shock' : 'cheer', flip: true })); }
  if (k === 'ring') { A.push(BONGO(f, BFa(1.3, 1.2, 1.4), { expr: f < 868 ? 'smile' : f < 930 ? 'happy' : f < 966 ? 'smile' : 'shock', pose: f < 868 ? 'stand' : f < 930 ? 'cheer' : f < 966 ? 'stand' : 'shock', ring: rng(f, sk), crack: f >= 970 ? sm(970, 980, f) : 0 }));
    A.push(P(f, 'BB_WORK2', 62, BFa(2.0, 0, 2.4), { expr: f < 966 ? 'happy' : 'shock', view: '34L', cheer: f > 870 && f < 920 ? wav(f, 0) : undefined })); }
  if (k === 'fix') { A.push(P(f, 'BB_WORK2', 62, BFa(3.3, 0, 1.9), { expr: f < 1089 ? 'thoughtful' : f < 1170 ? 'smile' : 'grin', view: '34L', prop: f >= 1170 ? 'hammer' : undefined, point: f > 1100 && f < 1160 ? 1 : undefined }));
    A.push(BONGO(f, BFa(1.6, 0, 3.4), { expr: f < 1089 ? 'worried' : f < 1139 ? 'smile' : 'happy', pose: f < 1089 ? 'stand' : f < 1139 ? 'point' : 'cheer', crack: 1, ring: rng(f, sk), flip: true })); }
  if (k === 'still') { A.push(BONGO(f, BFa(-1.25, 0, 2.6), { expr: f < 1247 ? 'smile' : f < 1305 ? 'proud' : f < 1330 ? 'dazed' : 'sly', pose: f < 1247 ? 'stand' : f < 1305 ? 'hips' : f < 1330 ? 'ears' : 'point', crack: 1, ring: rng(f, sk) })); }
  if (k === 'clock') { A.push(P(f, 'BB_KEEP', 71, CKa(1.65, 1.2, 2.35), { expr: f < 1430 ? 'smile' : f < 1466 ? 'determined' : 'happy', view: '34L', prop: f < 1452 ? 'penny' : undefined, point: f >= 1490 ? 1 : undefined }));
    A.push(BONGO(f, CKa(-0.9, 0, 2.9), { expr: f < 1466 ? 'smile' : 'love', pose: f < 1466 ? 'stand' : 'cheer', crack: 1 })); }
  if (k === 'payoff') { A.push(P(f, 'BB_TOUR1', 11, TWa(102.6, 3.24, 27.0), { expr: f < 1642 ? 'smile' : f < 1673 ? 'surprised' : 'excited', prop: 'selfie', view: '34R' }));
    A.push(P(f, 'BB_TOUR2', 13, TWa(102.1, 3.24, 25.1), { expr: f < 1642 ? 'happy' : 'laugh', view: '34R', point: f >= 1673 ? 1 : undefined }));
    A.push(BONGO(f, TWa(100.8, 3.24, 25.6), { expr: f < 1642 ? 'smile' : f < 1690 ? 'dazed' : 'sly', pose: f < 1642 ? 'stand' : f < 1690 ? 'ears' : 'hips', crack: 1, ring: rng(f, 1642) })); }
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
  if (k === 'hook') { sburst(f, 2, 'hook', 0.0, 0.3, 3, 0.6, F2); sboard(f, 4, ['BIG BEN?'], 'hook', 0.0, 0.66, 3, 0.36, F2, 31); stamp(f, 33, ['NOT BIG BEN!'], 'hook', 0.0, 0.62, 3, 0.48, F2); }
  if (k === 'bell') { stamp(f, 63, ['BONG!'], 'bell', 0.0, 0.64, 2.4, 0.34, F2, 86); sburst(f, 63, 'bell', 0.0, 0.3, 2.4, 0.6, F2); sboard(f, 86, ['THIS IS', 'BIG BEN'], 'bell', 0.0, 0.66, 2.4, 0.4, F2); }
  if (k === 'plaque') { sboard(f, 112, ['THE TOWER WAS', 'CALLED...'], 'plaque', 0.0, 0.66, 2.4, 0.46, F2, 145); sburst(f, 147, 'plaque', 0.0, -0.1, 2.4, 0.5, F2); sboard(f, 179, ['IN 2012...'], 'plaque', 0.0, 0.68, 2.4, 0.36, F2); }
  if (k === 'jubilee') { sboard(f, 202, ['RENAMED:'], 'jubilee', 0.0, 0.68, 2.4, 0.3, F2, 216); stamp(f, 217, ['ELIZABETH TOWER'], 'jubilee', 0.0, 0.62, 2.4, 0.54, F2, 268); sburst(f, 217, 'jubilee', 0.0, -0.1, 2.4, 0.6, F2);
    sboard(f, 270, ["THE QUEEN'S", 'DIAMOND JUBILEE'], 'jubilee', 0.0, 0.66, 2.4, 0.5, F2); for (const [f0, x, y, c] of [[277, -0.5, 0.2, '#ff8a8a'], [284, 0.5, 0.36, '#8ab0ff'], [292, -0.2, 0.46, '#fff3b0'], [298, 0.4, 0.1, '#ff8a8a']]) sburst(f, f0, 'jubilee', x, y, 3, 0.4, F2, c, 14); }
  if (k === 'why') { sboard(f, 312, ['SO WHY', '"BIG BEN"?'], 'why', 0.0, 0.66, 2.4, 0.4, F2, 355); qmark(f, 330, 'why', 0.35, 0.3, 2.4, 0.12, F2); sboard(f, 357, ["NOBODY'S", 'SURE!'], 'why', 0.0, 0.66, 2.4, 0.38, F2); }
  if (k === 'hall') { sboard(f, 408, ['SIR BENJAMIN', 'HALL?'], 'hall', 0.0, 0.66, 2.4, 0.42, F2, 450); sboard(f, 452, ['A BIG MAN', 'IN CHARGE'], 'hall', 0.0, 0.66, 2.4, 0.4, F2); }
  if (k === 'caunt') { sboard(f, 504, ['OR BEN CAUNT?'], 'caunt', 0.0, 0.68, 2.4, 0.44, F2, 543); stamp(f, 545, ['HEAVYWEIGHT', 'BOXER'], 'caunt', 0.0, 0.62, 2.4, 0.46, F2); sburst(f, 555, 'caunt', 0.2, 0.0, 2.4, 0.4, F2); }
  if (k === 'test') { sboard(f, 590, ['A ROUGH', 'START'], 'test', 0.0, 0.66, 3, 0.36, F2, 645); sboard(f, 647, ['1857:', 'FIRST TEST'], 'test', 0.0, 0.66, 3, 0.4, F2, 715); stamp(f, 717, ['CRACKED!'], 'test', 0.0, 0.62, 3, 0.42, F2); sburst(f, 717, 'test', 0.1, -0.15, 3, 0.55, F2); wpuff(f, 718, YDa(1.2, 1.2, -1.2), 1.6, F2, 16, '#d8c8a8'); }
  if (k === 'recast') { stamp(f, 778, ['BROKEN UP'], 'recast', 0.0, 0.62, 3, 0.4, F2, 799); sboard(f, 801, ['RECAST AT', 'WHITECHAPEL'], 'recast', 0.0, 0.66, 3, 0.48, F2); for (const f0 of [794, 806, 818]) wpuff(f, f0, FDa(0.6, 2.4, -0.4), 1.0, F2, 18, '#c8a890'); }
  if (k === 'ring') { stamp(f, 868, ['BONG!'], 'ring', 0.0, 0.64, 2.4, 0.32, F2, 886); sboard(f, 887, ['1859: THE', 'NEW BELL'], 'ring', 0.0, 0.66, 2.4, 0.42, F2, 926); sboard(f, 928, ['WITHIN', 'MONTHS...'], 'ring', 0.0, 0.66, 2.4, 0.36, F2, 964); stamp(f, 966, ['CRACKED TOO!'], 'ring', 0.0, 0.62, 2.4, 0.5, F2); sburst(f, 966, 'ring', 0.1, -0.05, 2.4, 0.55, F2); }
  if (k === 'fix') { sboard(f, 1010, ['YOU SEE...'], 'fix', 0.0, 0.68, 2.4, 0.34, F2, 1060); sboard(f, 1062, ['TURN IT A', 'QUARTER-TURN'], 'fix', 0.0, 0.66, 2.4, 0.46, F2, 1120); sboard(f, 1122, ['HAMMER HITS', 'FRESH METAL'], 'fix', 0.0, 0.66, 2.4, 0.46, F2, 1172); sburst(f, 1139, 'fix', 0.2, -0.1, 2.4, 0.4, F2);
    stamp(f, 1180, ['LIGHTER', 'HAMMER'], 'fix', 0.0, 0.62, 2.4, 0.42, F2); }
  if (k === 'still') { sboard(f, 1220, ['THE CRACK?'], 'still', 0.0, 0.68, 2, 0.38, F2, 1245); stamp(f, 1247, ['STILL THERE'], 'still', 0.0, 0.62, 2, 0.42, F2, 1268); sboard(f, 1270, ['REPORTEDLY PART', 'OF ITS SOUND'], 'still', 0.0, 0.66, 2, 0.52, F2); sburst(f, 1305, 'still', 0.0, 0.2, 2, 0.5, F2); }
  if (k === 'clock') { sboard(f, 1376, ['THE CLOCK IS TUNED', 'WITH OLD PENNIES'], 'clock', 0.0, 0.66, 3, 0.56, F2, 1450); stamp(f, 1466, ['+1 PENNY'], 'clock', 0.0, 0.62, 3, 0.34, F2, 1500); sburst(f, 1466, 'clock', 0.0, 0.0, 3, 0.4, F2);
    sboard(f, 1502, ['= ABOUT 2/5 OF A', 'SECOND FASTER A DAY'], 'clock', 0.0, 0.66, 3, 0.58, F2); stars(f, 1510, 'clock', 0.0, 0.1, 3, 0.4, F2, 24); }
  if (k === 'payoff') { sboard(f, 1578, ['THE MOST FAMOUS', 'BELL ON EARTH...'], 'payoff', 0.0, 0.66, 3, 0.56, F2, 1640); stamp(f, 1642, ['IS CRACKED!'], 'payoff', 0.0, 0.62, 3, 0.44, F2, 1670); bubble(f, 1673, ['NICE TOWER,', 'BIG BEN!'], 'payoff', -0.2, 0.42, 2.4, 0.5, -1, F2, 1712);
    stamp(f, 1715, ["IT'S THE BELL!"], 'payoff', 0.0, 0.62, 3, 0.5, F2); sburst(f, 1715, 'payoff', 0.0, 0.62, 3, 0.5, F2); stars(f, 1722, 'payoff', 0.0, 0.3, 3, 0.5, F2, 24); }
  return F2;
}
