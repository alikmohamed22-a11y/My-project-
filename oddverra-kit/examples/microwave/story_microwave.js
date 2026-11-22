// [MW-story] "The microwave oven was invented after a candy bar melted in an engineer's pocket" timeline (61.38 s voice, 1842 f @ 30 fps).
// Sets: mw_sets.js (kitchen / lab / inside / show / k67) through setAt. Pattern: story_niagara.js (slow push per shot, zoom-through whips on
// cuts, screen-pinned boards / bursts / stamps, punch-ins on beats). Structure differs from the Super Soaker Short: a modern cold open on
// the motif (a microwave counting down to DING), the 1945 discovery told as three escalating food tests (candy, popcorn, egg), a cutaway
// INSIDE the food, a live "spec sheet" scale reveal (6 ft ruler, 750 lb dial, $5,000 tag), a shrink across 20 years, and the $2 payoff
// back at the DING. CHOCO (a living candy bar) is the sidekick; the DING + popcorn is the motif.
import * as S from './story.js';
import { MWP } from './mw_sets.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]                                   narration (word frames from work/words_frames.txt)
const SH = [
  [0, 127, 'hook', 'kitchenNight'],  // Your microwave exists because a candy bar melted in a man's pocket.  (microwave 9, exists 23, candy 55, melted 71, pocket 99)
  [127, 292, 'lab', 'lab'],          // It's 1945. Percy Spencer, a Raytheon engineer who'd barely gone to school, is working beside  (1945 131, Percy 170, Raytheon 198, barely 230, school 249, working 268)
  [292, 357, 'rig', 'lab'],          // a magnetron, the tube that powers radar.  (magnetron 292, tube 318, radar 338)
  [357, 457, 'pocket', 'labPocket'], // Then he notices something. The candy bar in his pocket? Melted.  (notices 372, candy 404, pocket 423, Melted 442)
  [457, 549, 'napkin', 'lab'],       // Most people would grab a napkin. Percy grabbed popcorn.  (napkin 488, Percy 506, popcorn 525)
  [549, 670, 'pop', 'lab'],          // He held the kernels near the tube, and they popped all over the lab!  (kernels 563, tube 582, popped 615, lab 645)
  [670, 804, 'egg', 'lab'],          // Next, he reportedly tried an egg. It exploded, right on a coworker.  (reportedly 687, egg 717, exploded 735, coworker 774)
  [804, 981, 'inside', 'inside'],    // You see, those invisible microwaves make the water inside food jiggle. And all that jiggling is heat.  (see 806, microwaves 837, water 866, jiggle 896, jiggling 930, heat 952)
  [981, 1056, 'patent', 'labWarm'],  // Raytheon filed a patent that same year,  (filed 989, patent 1002, same 1027, year 1038)
  [1056, 1185, 'show', 'show'],      // and by 1947, they were selling the first microwave oven: the Radarange.  (1947 1060, selling 1100, first 1114, oven 1136, Radarange 1157)
  [1185, 1302, 'specs', 'show'],     // It stood nearly six feet tall, weighed about seven hundred fifty pounds,  (six 1205, tall 1223, weighed 1239, seven 1250, pounds 1280)
  [1302, 1388, 'price', 'show'],     // and reportedly cost around five thousand dollars.  (reportedly 1302, cost 1313, five 1333, thousand 1344, dollars 1357)
  [1388, 1440, 'shrink', 'showShrink'], // It took twenty years to shrink it  (twenty 1397, years 1412, shrink 1433)
  [1440, 1562, 'k67', 'k67'],        // onto a kitchen counter: the Amana Radarange, in 1967.  (kitchen 1452, counter 1458, Amana 1480, 1967 1517)
  [1562, 1710, 'bonus', 'labWarm'],  // And Percy's reward? Reportedly, the same two-dollar bonus Raytheon paid for every patent.  (reward 1581, Reportedly 1602, two-dollar 1631, bonus 1644, every 1683, patent 1692)
  [1710, 1842, 'payoff', 'kitchenEnd'], // Two dollars for the machine that pops your popcorn.  (Two 1710, dollars 1716, machine 1756, pops 1770, popcorn 1783)
];
export const NF = 1842;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['mw', segAt(f)[3]];

// ---------- places (set-local -> world)
const O = { kitchen: [-148000, 0, 0], lab: [-148000, 0, 800], inside: [-148000, 0, 1600], show: [-150500, 0, 0], k67: [-150500, 0, 800] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const KT = at(O.kitchen), LB = at(O.lab), IN = at(O.inside), SW = at(O.show), K6 = at(O.k67);
const [DX, , DZ] = MWP.desk;

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(KT(0.16, 1.2, -0.78), KT(0.0, 1.08, -2.1), 42, 1.6, KT(0.0, 1.08, -2.0)),
  lab: C(LB(1.5, 1.7, 2.6), LB(-0.1, 1.2, -1.3), 46, 1.0, LB(0.6, 1.2, -0.9)),
  rig: C(LB(1.05, 1.45, 0.05), LB(-0.15, 1.15, -1.4), 40, 1.6, LB(0.0, 1.2, -1.4)),
  pocket: C(LB(-0.28, 1.38, 0.42), LB(-0.3, 1.38, -0.4), 36, 2.4, LB(-0.3, 1.36, -0.37)),
  napkin: C(LB(0.45, 1.55, 3.0), LB(0.45, 1.2, -0.7), 44, 1.0, LB(0.45, 1.25, -0.7)),
  pop: C(LB(0.1, 1.45, 1.9), LB(0.66, 1.25, -1.15), 44, 1.0, LB(0.7, 1.15, -1.1)),
  egg: C(LB(-0.05, 1.5, 2.3), LB(0.15, 1.1, -1.2), 46, 1.0, LB(0.6, 1.1, -1.2)),
  inside: C(IN(0, 2.3, 3.5), IN(0, 2.15, -2.4), 48, 0.6, IN(0, 1.6, -2.4)),
  patent: C(LB(DX - 0.05, 1.42, DZ + 1.25), LB(DX - 0.05, 0.84, DZ + 0.05), 40, 1.8, LB(DX - 0.05, 0.8, DZ + 0.05)),
  show: C(SW(0.15, 1.3, 3.7), SW(0, 1.2, -2.0), 46, 0.8, SW(0, 1.1, -2.0)),
  specs: C(SW(-0.2, 1.4, 1.7), SW(-0.2, 1.25, -1.9), 48, 1.2, SW(-0.2, 1.2, -1.8)),
  price: C(SW(0.62, 1.82, -0.05), SW(0.44, 1.68, -1.62), 42, 1.6, SW(0.44, 1.68, -1.62)),
  shrink: C(SW(0, 1.55, 3.3), SW(0, 1.45, -2.2), 46, 0.8, SW(0, 1.0, -2.0)),
  k67: C(K6(0.1, 1.45, 1.9), K6(0.1, 1.1, -2.1), 46, 1.0, K6(0.1, 1.1, -2.0)),
  bonus: C(LB(DX - 0.85, 1.5, DZ + 3.1), LB(DX - 0.42, 1.2, DZ + 0.2), 44, 1.0, LB(DX - 0.4, 1.2, DZ + 0.5)),
  payoff: C(KT(0.22, 1.16, -1.1), KT(0.05, 1.08, -2.1), 40, 1.6, KT(0.05, 1.08, -2.0)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.0, lab: 0.12, rig: 0.12, pocket: 0.1, napkin: 0.1, pop: 0.04, egg: 0.08, inside: 0.1, patent: 0.1, show: 0, specs: 0.04, price: 0.1, shrink: 0.06, k67: 0.1, bonus: 0.1, payoff: 0 };
const base = (k) => V[k] || V.hook;
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const look = (d, f0, f1, fd) => { const t = sm(f0, f1, f); c = { ...c, l: add3(c.l, d.map((x) => x * t)), fp: add3(c.fp, (fd || d).map((x) => x * t)) }; };
  const move = (d, f0, f1) => { const t = sm(f0, f1, f); c = { ...c, p: add3(c.p, d.map((x) => x * t)) }; };
  const lerpTo = (p1, l1, f0, f1, fov1) => { const t = sm(f0, f1, f); c = { ...c, p: c.p.map((v, i) => v + (p1[i] - v) * t), l: c.l.map((v, i) => v + (l1[i] - v) * t), fp: c.fp.map((v, i) => v + (l1[i] - v) * t), fov: fov1 ? c.fov + (fov1 - c.fov) * t : c.fov }; };
  if (k === 'hook') { move([0, 0, 0.12], 0, 40); punch(9, 15, 0.05); punch(36, 42, 0.08); kick(36, 0.03); move([0.3, 0, 0.05], 48, 66); look([0.42, -0.04, 0.08], 48, 66, [0.5, -0.02, 0.08]); punch(71, 80, 0.12); punch(99, 106, 0.1); kick(99, 0.03); }
  if (k === 'lab') { punch(131, 137, 0.05); punch(170, 176, 0.06); look([0.6, 0.12, 0.3], 160, 185, [0.4, 0.1, 0.2]); punch(249, 255, 0.08); look([-0.5, -0.05, -0.2], 262, 290, [-0.6, 0, -0.3]); }
  if (k === 'rig') { punch(292, 300, 0.06); kick(292, 0.02); look([-0.3, 0.05, 0], 310, 340); punch(338, 344, 0.08); }
  if (k === 'pocket') { punch(372, 380, 0.06); punch(404, 410, 0.06); punch(442, 448, 0.14); kick(442, 0.03); shake(442, 452, 0.01); }
  if (k === 'napkin') { look([-0.35, 0, 0], 470, 490); punch(483, 489, 0.06); look([0.7, 0.05, 0], 504, 520); punch(513, 519, 0.08); kick(525, 0.03); }
  if (k === 'pop') { punch(563, 570, 0.05); punch(582, 590, 0.08); shake(615, 640, 0.05); kick(615, 0.05); const t = sm(640, 668, f); c = { ...c, fov: c.fov * (1 + 0.28 * t), p: add3(c.p, [0.2 * t, 0.25 * t, 0.9 * t]) }; }
  if (k === 'egg') { punch(717, 723, 0.06); look([0.25, -0.05, 0], 705, 730); punch(735, 740, 0.14); shake(735, 755, 0.05); kick(735, 0.05); look([0.25, 0.2, 0.1], 760, 790); }
  if (k === 'inside') { punch(818, 826, 0.04); lerpTo(IN(0.3, 1.9, 1.4), IN(0, 1.55, -2.4), 860, 900, 46); punch(896, 902, 0.08); kick(896, 0.03); punch(952, 958, 0.08); }
  if (k === 'patent') { punch(1002, 1008, 0.1); kick(1009, 0.04); shake(1009, 1018, 0.02); }
  if (k === 'show') { const t = sm(1056, 1150, f); const P0 = SW(0.1, 1.15, -0.35), L0 = SW(0, 1.18, -2.0); c = { ...c, p: P0.map((v, i) => v + (c.p[i] - v) * t), l: L0.map((v, i) => v + (c.l[i] - v) * t) }; punch(1114, 1120, 0.04); punch(1157, 1164, 0.08); kick(1157, 0.03); }
  if (k === 'specs') { look([-0.55, 0.55, 0], 1192, 1228, [-0.5, 0.4, 0]); punch(1216, 1222, 0.06); look([1.55, -0.55, 0.15], 1236, 1262, [1.5, -0.4, 0.1]); move([0.3, 0, 0], 1236, 1262); punch(1280, 1288, 0.1); kick(1280, 0.03); }
  if (k === 'price') { punch(1313, 1319, 0.05); punch(1357, 1364, 0.12); kick(1357, 0.03); }
  if (k === 'shrink') { punch(1397, 1403, 0.04); const t = sm(1405, 1440, f); c = { ...c, l: add3(c.l, [0, -0.3 * t, 0]), fov: c.fov * (1 - 0.18 * t) }; }
  if (k === 'k67') { punch(1458, 1464, 0.08); kick(1458, 0.05); shake(1458, 1468, 0.03); punch(1517, 1524, 0.08); }
  if (k === 'bonus') { punch(1581, 1587, 0.05); look([0.25, -0.05, 0], 1620, 1640); punch(1631, 1637, 0.1); kick(1631, 0.03); punch(1683, 1689, 0.05); }
  if (k === 'payoff') { punch(1716, 1722, 0.06); kick(1777, 0.03); punch(1777, 1782, 0.06); const t = sm(1745, 1830, f); const P1 = KT(0.75, 1.5, 1.2), L1 = KT(0.05, 1.1, -2.0); c = { ...c, p: c.p.map((v, i) => v + (P1[i] - v) * t), l: c.l.map((v, i) => v + (L1[i] - v) * t), fp: c.fp.map((v, i) => v + (L1[i] - v) * t), fov: 40 + 6 * t, cInf: 1.6 - 0.6 * t }; }
  return c;
}
const HARD = new Set([127, 1056, 1440]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[36, 0.35, 8], [99, 0.3, 6], [127, 0.75, 12], [292, 0.3, 8], [357, 0.35, 8], [442, 0.4, 8], [457, 0.3, 8], [549, 0.25, 8], [615, 0.45, 8], [670, 0.3, 8], [735, 0.55, 8], [804, 0.4, 10], [952, 0.35, 8], [981, 0.35, 10], [1009, 0.18, 6],
    [1056, 0.75, 12], [1157, 0.3, 8], [1185, 0.25, 8], [1280, 0.3, 6], [1302, 0.25, 8], [1357, 0.35, 6], [1388, 0.3, 8], [1440, 0.75, 12], [1458, 0.3, 6], [1517, 0.3, 6], [1562, 0.35, 10], [1631, 0.35, 6], [1710, 0.45, 10], [1777, 0.4, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state
const DING1 = 36, DING2 = 1777, POP0 = 612;
const disp = (f, t0) => (f < t0 - 24 ? '0:03' : f < t0 - 12 ? '0:02' : f < t0 ? '0:01' : (f - t0) % 16 < 10 ? 'END' : '');
export function worldAt(f, w) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const N = w.mw; if (!N) return;
  if (k === 'hook') N.setMicro({ on: 1, open: f < DING1 + 2 ? 0 : back(DING1 + 2, DING1 + 12, f) * 0.85, bag: 0.15 + 0.85 * sm(0, DING1, f), disp: disp(f, DING1), steam: DING1 + 2 });
  if (k === 'payoff') N.setMicro({ on: 1, open: f < DING2 + 3 ? 0 : back(DING2 + 3, DING2 + 13, f) * 0.85, bag: 0.3 + 0.7 * sm(1710, DING2, f), disp: f < 1745 ? '0:05' : disp(f, DING2), steam: f >= DING2 ? DING2 + 3 : -1 });
  N.setMag(k === 'lab' ? 0.15 + 0.85 * sm(286, 300, f) : k === 'rig' || k === 'pocket' || k === 'pop' ? 1 : k === 'napkin' || k === 'egg' ? 0.8 : 0);
  // CHOCO
  const t = f;
  if (k === 'hook') { const m = sm(71, 98, f); N.setCandy({ where: 'kitchen', p: MWP.candyK, ry: -0.35, t, bounce: f < 71 ? 1 : 0.2, melt: m * 0.75, puddle: true, expr: f < 36 ? 'happy' : f < 71 ? 'proud' : f < 99 ? 'melty' : 'shock' }); }
  else if (k === 'pocket') { const m = 0.08 + 0.32 * sm(372, 440, f) + 0.55 * sm(442, 452, f); N.setCandy({ where: 'lab', p: [MWP.torso[0] - 0.2, 1.24, MWP.torso[2] + 0.18], t, melt: m, expr: f < 372 ? 'happy' : f < 442 ? 'nervous' : f < 448 ? 'shock' : 'melty', stain: 0.6 * sm(442, 456, f) }); }
  else if (k === 'payoff') N.setCandy({ where: 'kitchen', p: MWP.candyK, ry: -0.35, t, bounce: 1, melt: 0, expr: f < 1790 ? 'proud' : f < 1815 ? 'wink' : 'happy' });
  else N.setCandy(null);
  N.setPop(k === 'pop' || k === 'egg' ? POP0 : -1);
  N.setEgg(k === 'egg' ? { on: true, swell: f < 735 ? Math.max(0, Math.sin((f - 700) * 0.9)) * sm(700, 734, f) : 0, burst: f >= 735 ? 1 : 0, splat: f >= 737 ? EGGSPLAT : null, s: back(737, 744, f) } : { on: false });
  N.setStamp(k === 'patent' ? { y: f < 1000 ? 1 : f < 1009 ? 1 - eo(1000, 1009, f) : 0.05 + 0.95 * sm(1014, 1030, f), filed: f >= 1009 } : k === 'bonus' ? { y: 1, filed: true } : { y: 1, filed: false });
  N.setInside({ jig: k === 'inside' ? 0.08 + 0.32 * sm(855, 890, f) + 0.6 * sm(894, 904, f) : 0.1, heat: k === 'inside' ? sm(930, 975, f) : 0, wave: k === 'inside' ? sm(812, 840, f) : 0 });
  if (k === 'show' || k === 'specs' || k === 'price') N.setShow({ t: f, rul: k === 'show' ? 0 : sm(1196, 1230, f) + (k === 'price' ? 1 : 0) * 0, w: k === 'specs' ? 750 * eo(1246, 1286, f) + 26 * Math.sin(Math.PI * sm(1270, 1294, f)) : k === 'price' ? 750 : 0, price: k === 'price' ? 5000 * eo(1323, 1358, f) : 0, tag: k === 'price' ? back(1306, 1318, f) : 0, year: 1947, on: sm(1100, 1130, f) });
  if (k === 'price') N.setShow({ t: f, rul: 1, w: 750, price: 5000 * eo(1323, 1358, f), tag: back(1306, 1318, f), year: 1947, on: 1 });
  if (k === 'shrink') N.setShow({ t: f, rul: 0, w: 0, price: 0, tag: 0, shrink: sm(1405, 1438, f), year: 1947 + 20 * sm(1397, 1432, f), on: 0.6 });
  if (k === 'k67') { const d = sm(1442, 1458, f) ** 2, sq = f < 1458 ? 0 : Math.sin(Math.PI * Math.min(1, (f - 1458) / 8)) * (1 - Math.min(1, (f - 1458) / 14)); N.setK67({ drop: d, squash: sq, on: sm(1490, 1505, f) }); }
}
const EGGSPLAT = [0.8, 1.42, -0.8];

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') A.push(P(f, 'MW_KID', 31, KT(-0.46, 0, -1.55), { expr: f < DING1 ? 'excited' : f < 71 ? 'happy' : 'shock', view: '34R', cheer: f > DING1 && f < 64 ? wav(f, 0) : undefined }, { s: 0.82 }));
  if (k === 'lab') { A.push(P(f, 'MW_PERCY', 1, LB(0.76, 0, -0.85), { expr: f < 170 ? 'thoughtful' : f < 230 ? 'smile' : f < 262 ? 'happy' : 'determined', view: f < 168 ? '34L' : f < 225 ? 'front' : '34L', wave: f > 176 && f < 200 ? wav(f, 0, 0.3) : undefined, point: f > 268 ? 1 : undefined }));
    A.push(P(f, 'MW_COWORK', 21, LB(-1.15, 0, -0.78), { expr: 'thoughtful', view: 'back' })); A.push(P(f, 'MW_TECH', 22, LB(-3.7, 0, -0.6), { expr: 'smile', view: '34L', prop: 'notepad' })); }
  if (k === 'rig') A.push(P(f, 'MW_PERCY', 1, LB(0.98, 0, -1.02), { expr: f < 318 ? 'thoughtful' : 'excited', view: '34L', point: f > 300 ? 1 : undefined }));
  if (k === 'napkin') { A.push(P(f, 'MW_COWORK', 21, LB(-0.05, 0, -0.62), { expr: f < 488 ? 'smile' : f < 513 ? 'smug' : 'shock', view: '34R', prop: f > 474 ? 'napkin' : undefined }));
    A.push(P(f, 'MW_PERCY', 1, LB(0.98, 0, -0.78), { expr: f < 506 ? 'thoughtful' : f < 525 ? 'excited' : 'grin', view: '34L', prop: f > 509 ? 'popbag' : undefined, hip: f < 500 ? 1 : undefined })); }
  if (k === 'pop') { A.push(P(f, 'MW_PERCY', 1, LB(1.0, 0, -1.02), { expr: f < 600 ? 'determined' : f < 615 ? 'excited' : f < 640 ? 'shock' : 'laugh', view: '34L', prop: 'popbag' }, { roll: f >= 615 && f < 630 ? 0.05 * Math.sin(f * 1.3) : 0 }));
    if (f >= 620) A.push(P(f, 'MW_COWORK', 21, LB(-0.3, 0, -0.55), { expr: 'shock', view: '34R', handsUp: 1 })); }
  if (k === 'egg') { A.push(P(f, 'MW_PERCY', 1, LB(-0.28, 0, -0.5), { expr: f < 717 ? 'sly' : f < 735 ? 'excited' : f < 760 ? 'shock' : 'nervous', view: '34R', point: f > 690 && f < 735 ? 1 : undefined }));
    A.push(P(f, 'MW_COWORK', 21, LB(0.86, 0, -0.95), { expr: f < 735 ? 'thoughtful' : f < 760 ? 'shock' : 'dazed', view: '34L' }, { roll: f < 735 ? -0.12 * sm(690, 720, f) : 0.08 * Math.sin(Math.PI * sm(735, 745, f)) })); }
  if (k === 'patent') { A.push(P(f, 'MW_BOSS', 41, LB(DX + 0.45, 0, DZ - 0.75), { expr: f < 1009 ? 'determined' : 'proud', view: '34L', point: f > 1015 ? 1 : undefined }));
    A.push(P(f, 'MW_PERCY', 1, LB(DX - 0.9, 0, DZ - 0.55), { expr: f < 1009 ? 'smile' : 'happy', view: '34R', cheer: f > 1012 ? wav(f, 1, 0.3) : undefined })); }
  if (k === 'show') { A.push(P(f, 'MW_CHEF', 51, SW(-1.15, 0, -1.05), { expr: f < 1100 ? 'smile' : 'proud', view: '34R', point: f > 1110 ? 1 : undefined }));
    A.push(P(f, 'MW_PERCYS', 1, SW(1.2, 0, -1.0), { expr: f < 1157 ? 'smile' : 'happy', view: '34L', cheer: f > 1160 ? wav(f, 0, 0.3) : undefined })); }
  if (k === 'specs') { A.push(P(f, 'MW_PERCYS', 1, SW(-1.25, 0, -1.25), { expr: f < 1216 ? 'surprised' : 'shock', view: '34R' }));
    A.push(P(f, 'MW_CHEF', 51, SW(1.55, 0, -1.1), { expr: f < 1280 ? 'nervous' : 'shock', view: '34L', point: f > 1250 ? 1 : undefined })); }
  if (k === 'price') A.push(P(f, 'MW_PERCYS', 1, SW(-0.15, 0, -0.95), { expr: f < 1357 ? 'surprised' : 'shock', view: '34R' }, { s: 1 }));
  if (k === 'shrink') { A.push(P(f, 'MW_CHEF', 51, SW(-0.72, 0, -0.55), { expr: 'surprised', view: '34R' })); A.push(P(f, 'MW_PERCYS', 1, SW(0.75, 0, -0.5), { expr: f < 1420 ? 'surprised' : 'laugh', view: '34L' })); }
  if (k === 'k67') { A.push(P(f, 'MW_MOM67', 61, K6(-0.56, 0, -1.25), { expr: f < 1458 ? 'surprised' : f < 1500 ? 'happy' : 'laugh', view: '34R', cheer: f > 1462 ? wav(f, 0) : undefined }));
    A.push(P(f, 'MW_KID67', 62, K6(0.62, 0, -1.2), { expr: f < 1458 ? 'surprised' : 'excited', view: '34L', wave: f > 1466 ? wav(f, 2) : undefined }, { s: 0.8 })); }
  if (k === 'bonus') { A.push(P(f, 'MW_BOSS', 41, LB(DX + 0.05, 0, DZ - 0.75), { expr: f < 1631 ? 'smile' : 'smug', view: 'front', prop: f > 1625 ? 'bills' : undefined }));
    A.push(P(f, 'MW_PERCY', 1, LB(DX - 0.62, 0, DZ + 0.5), { expr: f < 1602 ? 'excited' : f < 1640 ? 'surprised' : f < 1683 ? 'worried' : 'sad', view: '34R' })); }
  if (k === 'payoff') A.push(P(f, 'MW_KID', 31, KT(-0.48, 0, -1.55), { expr: f < DING2 ? 'excited' : 'laugh', view: '34R', prop: f > DING2 + 14 ? 'popbowl' : undefined, cheer: f > DING2 && f < DING2 + 14 ? wav(f, 0) : undefined }, { s: 0.82 }));
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
  if (k === 'hook') { sboard(f, 4, ['YOUR MICROWAVE...'], 'hook', 0.0, 0.66, 0.9, 0.5, F2, 50); sburst(f, DING1, 'hook', 0.0, 0.1, 0.9, 0.5, F2); stamp(f, DING1, ['DING!'], 'hook', 0.0, 0.3, 0.9, 0.32, F2, 54);
    sboard(f, 54, ['...EXISTS BECAUSE A', 'CANDY BAR MELTED'], 'hook', 0.0, 0.66, 0.9, 0.58, F2, 97); stamp(f, 99, ["IN A MAN'S", 'POCKET!'], 'hook', 0.0, 0.62, 0.9, 0.46, F2); sburst(f, 99, 'hook', 0.0, 0.62, 0.9, 0.5, F2); }
  if (k === 'lab') { sboard(f, 129, ['1945'], 'lab', 0.0, 0.68, 3, 0.36, F2, 166); sboard(f, 168, ['PERCY SPENCER', 'RADAR ENGINEER'], 'lab', 0.0, 0.66, 3, 0.52, F2, 226); sboard(f, 228, ['BARELY WENT', 'TO SCHOOL'], 'lab', 0.0, 0.66, 3, 0.44, F2, 286);
    stamp(f, 252, ['SELF-TAUGHT'], 'lab', 0.0, 0.4, 3, 0.38, F2, 286); }
  if (k === 'rig') { sboard(f, 294, ['THE MAGNETRON'], 'rig', 0.0, 0.68, 0.9, 0.46, F2, 334); sboard(f, 336, ['IT POWERS', 'RADAR'], 'rig', 0.0, 0.66, 0.9, 0.38, F2); }
  if (k === 'pocket') { sboard(f, 366, ['WAIT...'], 'pocket', 0.0, 0.68, 0.45, 0.34, F2, 400); if (f < 440) qmark(f, 380, 'pocket', 0.3, 0.3, 0.45, 0.1, F2); sboard(f, 402, ['THE CANDY BAR', 'IN HIS POCKET?'], 'pocket', 0.0, 0.66, 0.45, 0.5, F2, 440); stamp(f, 442, ['MELTED!'], 'pocket', 0.0, 0.6, 0.45, 0.42, F2); sburst(f, 442, 'pocket', 0.0, 0.1, 0.45, 0.55, F2, '#ffd8a0'); }
  if (k === 'napkin') { sboard(f, 466, ['MOST PEOPLE:', 'A NAPKIN'], 'napkin', 0.0, 0.66, 3, 0.46, F2, 504); sboard(f, 508, ['PERCY:', 'POPCORN!'], 'napkin', 0.0, 0.66, 3, 0.42, F2); stars(f, 520, 'napkin', 0.25, 0.25, 3, 0.4, F2, 24); }
  if (k === 'pop') { sboard(f, 552, ['KERNELS + THE TUBE'], 'pop', 0.0, 0.68, 1.1, 0.5, F2, 612); stamp(f, 615, ['POP! POP!', 'POP!'], 'pop', 0.0, 0.6, 1.1, 0.44, F2); sburst(f, 615, 'pop', 0.0, 0.1, 1.1, 0.6, F2); stars(f, 628, 'pop', 0.0, 0.25, 1.1, 0.5, F2, 20); }
  if (k === 'egg') { sboard(f, 680, ['NEXT, REPORTEDLY:', 'AN EGG'], 'egg', 0.0, 0.66, 3, 0.5, F2, 733); stamp(f, 735, ['SPLAT!'], 'egg', 0.0, 0.6, 3, 0.36, F2); sburst(f, 735, 'egg', 0.18, 0.0, 3, 0.45, F2, '#fff0a0');
    wpuff(f, 735, LB(MWP.egg[0], 1.1, MWP.egg[2]), 0.9, F2, 16, '#fff2b0'); wpuff(f, 739, LB(0.8, 1.45, -0.85), 0.7, F2, 14, '#ffe080'); }
  if (k === 'inside') { sboard(f, 808, ['YOU SEE...'], 'inside', 0.0, 0.7, 3, 0.36, F2, 850); sboard(f, 862, ['WATER INSIDE', 'THE FOOD'], 'inside', 0.0, 0.68, 3, 0.46, F2, 925); stamp(f, 896, ['JIGGLE!'], 'inside', 0.0, 0.42, 3, 0.36, F2, 925);
    sboard(f, 928, ['JIGGLING', '= HEAT'], 'inside', 0.0, 0.68, 3, 0.4, F2); sburst(f, 952, 'inside', 0.0, 0.0, 3, 0.6, F2, '#ffb070'); }
  if (k === 'patent') { sboard(f, 984, ['PATENT FILED'], 'patent', 0.0, 0.68, 0.9, 0.48, F2); stamp(f, 1027, ['SAME YEAR:', '1945'], 'patent', 0.0, 0.4, 0.9, 0.4, F2); sburst(f, 1009, 'patent', 0.0, -0.1, 0.9, 0.45, F2, '#ffd0c0'); }
  if (k === 'show') { sboard(f, 1058, ['1947'], 'show', 0.0, 0.7, 3, 0.36, F2, 1110); sboard(f, 1112, ['THE FIRST', 'MICROWAVE OVEN'], 'show', 0.0, 0.66, 3, 0.52, F2); sburst(f, 1157, 'show', 0.0, 0.0, 3, 0.6, F2); stars(f, 1160, 'show', 0.0, 0.25, 3, 0.55, F2, 26); }
  if (k === 'specs') { sboard(f, 1200, ['NEARLY', '6 FEET TALL'], 'specs', 0.0, 0.68, 2.5, 0.44, F2, 1236); sboard(f, 1240, ['ABOUT', '750 POUNDS'], 'specs', 0.0, 0.68, 2.5, 0.44, F2); stamp(f, 1282, ['750 LB!'], 'specs', 0.0, 0.38, 2.5, 0.34, F2); }
  if (k === 'price') { sboard(f, 1304, ['COST, REPORTEDLY:'], 'price', 0.0, 0.7, 1.1, 0.5, F2, 1350); stamp(f, 1357, ['ABOUT $5,000!'], 'price', 0.0, 0.62, 1.1, 0.5, F2); sburst(f, 1357, 'price', 0.0, 0.62, 1.1, 0.5, F2); }
  if (k === 'shrink') { sboard(f, 1392, ['20 YEARS LATER...'], 'shrink', 0.0, 0.12, 3, 0.52, F2); }
  if (k === 'k67') { sboard(f, 1450, ['ON THE', 'KITCHEN COUNTER'], 'k67', 0.0, 0.66, 2.5, 0.5, F2, 1512); stamp(f, 1517, ['1967'], 'k67', 0.0, 0.62, 2.5, 0.3, F2); sburst(f, 1517, 'k67', 0.0, 0.62, 2.5, 0.5, F2); sburst(f, 1458, 'k67', 0.0, -0.05, 2.5, 0.45, F2, '#fff0c0');
    wpuff(f, 1458, K6(MWP.micro67[0], 0.95, MWP.micro67[2] + 0.25), 0.9, F2, 14, '#f0e0c0'); stars(f, 1524, 'k67', 0.0, 0.2, 2.5, 0.5, F2, 26); }
  if (k === 'bonus') { sboard(f, 1566, ["PERCY'S REWARD?"], 'bonus', 0.0, 0.68, 3, 0.5, F2, 1600); sboard(f, 1604, ['REPORTEDLY...'], 'bonus', 0.0, 0.7, 3, 0.4, F2, 1630); stamp(f, 1631, ['$2 BONUS'], 'bonus', 0.0, 0.6, 3, 0.4, F2, 1680); sburst(f, 1631, 'bonus', 0.0, 0.6, 3, 0.5, F2, '#c8f0b0');
    sboard(f, 1682, ['SAME AS FOR', 'EVERY PATENT'], 'bonus', 0.0, 0.66, 3, 0.48, F2); }
  if (k === 'payoff') { stamp(f, 1712, ['$2...'], 'payoff', 0.0, 0.62, 0.9, 0.32, F2, 1774); stamp(f, DING2, ['DING!'], 'payoff', 0.0, 0.32, 0.9, 0.32, F2, 1800); sburst(f, DING2, 'payoff', 0.0, 0.1, 0.9, 0.55, F2); sboard(f, 1802, ['THANKS, PERCY!'], 'payoff', 0.0, 0.66, 3, 0.5, F2); stars(f, 1805, 'payoff', 0.0, 0.3, 3, 0.5, F2, 24); }
  return F2;
}
