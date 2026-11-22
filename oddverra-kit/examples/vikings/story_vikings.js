// [VK-story] "Vikings never wore horned helmets" timeline (54.7 s voice, 1641 f @ 30 fps).
// Sets: vk_sets.js (fjord / dig / bog / Bayreuth / stage / workshop) through setAt. Pattern: story_lincoln.js (slow push per shot, zoom-through
// whips on cuts, screen-pinned boards / bursts / stamps, punch-ins on beats). HELMI (a living Viking-age iron helmet) is the sidekick; the
// horned helmet is the motif: it pops off in the hook, grows on Doepler's dummy, sits on 1876 posters and pays off on the opera stage.
import * as S from './story.js';
import { ff, df, bf, bayf } from './vk_sets.js';
const { sm, eo, back, add3, dist, q, person } = S;
const TAU = Math.PI * 2;

// [f0, f1, id, set]                                     narration (word frames from work/words_frames.txt)
const SH = [
  [0, 111, 'hook', 'fjord'],          // Every horned Viking helmet you've ever seen is wrong.  (wrong 79)
  [111, 212, 'found', 'dig'],         // Archaeologists have found Viking ships, swords, and graves,  (ships 150, swords 174, graves 191)
  [212, 288, 'none', 'dig'],          // but not one horned helmet from the Viking Age.  (one 222)
  [288, 408, 'y1943', 'dig43'],       // The most complete Viking helmet ever found turned up in Norway in 1943  (Norway 366, 1943 384)
  [408, 464, 'farm', 'dig43'],        // at a farm called Gjermundbu.  (Gjermundbu 441)
  [464, 577, 'cap', 'digTent'],       // It's a rounded iron cap with a guard around the eyes. No horns.  (rounded 473, guard 513, No 549)
  [577, 629, 'where', 'fjordDay'],    // So where did the horns come from?
  [629, 769, 'bay', 'bayNight'],      // You see, in 1876, Richard Wagner staged his giant opera cycle,  (1876 648, Richard 692, giant 729)
  [769, 858, 'ring', 'stage'],        // The Ring of the Nibelung, at the very first Bayreuth Festival.  (Ring 771, first 821, Bayreuth 833)
  [858, 978, 'doepler', 'shop'],      // The costume designer, Carl Emil Doepler, put horns on the helmets.  (Carl 904, put 934, horns 938)
  [978, 1091, 'paint', 'shop'],       // Painters had toyed with the idea before, but the opera made it stick.  (but 1036, opera 1045, stick 1069)
  [1091, 1164, 'soon', 'bayDay'],     // Soon, horns meant Viking everywhere.  (everywhere 1134)
  [1164, 1279, 'twist', 'bog'],       // Here's the twist. Horned helmets really did exist in Scandinavia,  (Horned 1200, Scandinavia 1253)
  [1279, 1377, 'vekso', 'bog'],       // the Veksø helmets, from Denmark, around 900 BC,  (Veksø 1282, Denmark 1316, 900 1337)
  [1377, 1457, 'years', 'bog'],       // about 1,700 years before the Vikings.  (1,700 1380, Vikings 1435)
  [1457, 1641, 'payoff', 'stage'],    // So the most famous Viking look in history... is basically an opera costume.  (opera 1571, costume 1580)
];
export const NF = 1641;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => { const s = segAt(f); if (s[2] === 'payoff' && f >= 1562) return ['vk', 'stageHouse']; return ['vk', s[3]]; };

// ---------- places (set-local -> world)
const O = { fjord: [-58000, 0, 0], dig: [-58000, 0, 800], bog: [-58000, 0, 1600], bay: [-60500, 0, 0], stage: [-60500, 0, 800], shop: [-60500, 0, 1600] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const FJa = at(O.fjord), DGa = at(O.dig), BGa = at(O.bog), BYa = at(O.bay), STa = at(O.stage), SPa = at(O.shop);
const FJ = (x, z, h = 0) => FJa(x, ff(x, z) + h, z), DG = (x, z, h = 0) => DGa(x, df(x, z) + h, z), BG = (x, z, h = 0) => BGa(x, bf(x, z) + h, z), BY = (x, z, h = 0) => BYa(x, bayf(x, z) + h, z);
const ST = (x, z, h = 0) => STa(x, (Math.abs(x) < 9 && z < -2 ? 1.1 : 0) + h, z), SP = (x, z, h = 0) => SPa(x, h, z);
const TRAY = DGa(-13, df(-13, -1) + 1.1, -1);

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(FJ(0.7, 13.5, 1.15), FJa(0, 2.3, -4), 44, 1.0, FJ(0.2, 6.6, 1.0)),
  found: C(DGa(0.6, 2.3, 5.4), DGa(-2.4, 0.2, -1.6), 46, 1.0, DGa(-2.4, 0.3, -1.4)),
  none: C(DGa(2.3, 1.45, 4.4), DGa(-0.4, 0.9, -1.0), 46, 1.4, DGa(0, 1.0, -0.5)),
  y1943: C(DGa(2.6, 2.4, 6.8), DGa(9.5, 1.0, -5.5), 46, 0.8, DGa(8, 1.2, -2.2)),
  farm: C(DGa(9.3, 1.1, -1.5), DGa(9.0, 0.5, -4.0), 44, 1.8, DGa(9.0, 0.5, -4.0)),
  cap: C([TRAY[0] + 0.55, TRAY[1] + 0.42, TRAY[2] + 1.05], [TRAY[0], TRAY[1] + 0.12, TRAY[2]], 40, 3.2, [TRAY[0], TRAY[1] + 0.12, TRAY[2]]),
  where: C(FJ(0.3, 11.6, 0.95), FJ(0.1, 4, 1.0), 46, 1.4, FJ(0.1, 6.6, 1.0)),
  bay: C(BYa(1.6, 1.6, 17), BYa(0, 4.6, -14), 50, 0.6, BYa(0, 1.5, 6)),
  ring: C(STa(0, 2.5, 13), STa(0, 3.5, -6), 46, 0.7, STa(0, 2.5, -5)),
  doepler: C(SPa(0.5, 1.75, 3.5), SPa(-0.3, 1.45, -2.4), 52, 1.4, SPa(-0.9, 1.4, -1.4)),
  paint: C(SPa(2.3, 1.62, 2.7), SPa(3.55, 1.55, 0.45), 46, 2.2, SPa(3.55, 1.55, 0.5)),
  soon: C(BYa(-5.8, 1.55, 9.6), BYa(-9, 1.9, 4.2), 46, 1.2, BYa(-8.6, 1.6, 5.6)),
  twist: C(BGa(0.4, 1.55, 7.2), BGa(0, 0.9, -1.4), 46, 0.9, BGa(0, 0.9, -1)),
  vekso: C(BGa(0.2, 1.45, 3.8), BGa(0, 1.0, -1.0), 40, 2.0, BGa(0, 1.0, -1.0)),
  years: C(BGa(-2.4, 2.1, 8.4), BGa(0.2, 1.0, -1.2), 46, 0.8, BGa(0, 0.9, -1)),
  payoff: C(STa(0.25, 2.55, 1.4), STa(0, 2.55, -6), 44, 1.6, STa(0, 2.5, -4.6)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.12, found: 0.08, none: 0.1, y1943: 0.08, farm: 0.12, cap: 0.12, where: 0.1, bay: 0.1, ring: 0.1, doepler: 0.08, paint: 0.1, soon: 0.08, twist: 0.1, vekso: 0.1, years: 0.06, payoff: 0 };
const base = (k) => V[k] || V.hook;
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const pan = (d, f0, f1) => { const t = sm(f0, f1, f); const o = d.map((x) => x * t); c = { ...c, p: add3(c.p, o), l: add3(c.l, o), fp: add3(c.fp, o) }; };
  const look = (d, f0, f1, fd) => { const t = sm(f0, f1, f); c = { ...c, l: add3(c.l, d.map((x) => x * t)), fp: add3(c.fp, (fd || d).map((x) => x * t)) }; };
  const orbit = (a, f0, f1) => { const t = sm(f0, f1, f) - 0.5, an = a * t, dx = c.p[0] - c.l[0], dz = c.p[2] - c.l[2]; c = { ...c, p: [c.l[0] + dx * Math.cos(an) - dz * Math.sin(an), c.p[1], c.l[2] + dx * Math.sin(an) + dz * Math.cos(an)] }; };
  if (k === 'hook') { punch(79, 86, 0.16); kick(79, 0.06); shake(80, 92, 0.05); }
  if (k === 'found') { punch(150, 156, 0.05); punch(174, 180, 0.05); punch(191, 197, 0.05); }
  if (k === 'none') { punch(222, 229, 0.12); kick(222, 0.04); }
  if (k === 'y1943') { punch(366, 372, 0.05); punch(384, 391, 0.08); }
  if (k === 'farm') { punch(441, 448, 0.12); kick(441, 0.04); }
  if (k === 'cap') { orbit(0.7, 464, 577); punch(549, 556, 0.14); kick(549, 0.03); }
  if (k === 'where') { punch(615, 621, 0.1); }
  if (k === 'bay') { punch(648, 655, 0.06); punch(692, 699, 0.06); }
  if (k === 'ring') { punch(771, 778, 0.06); punch(833, 840, 0.06); }
  if (k === 'doepler') { look([1.9, 0.62, 0], 918, 940, [2.1, 0.8, -1.0]); punch(938, 945, 0.18); kick(938, 0.04); }
  if (k === 'paint') { pan([-2.2, 0.3, -0.6], 1032, 1062); look([-0.4, 0.5, -2.6], 1032, 1062, [-2.25, 0.7, -2.9]); punch(1069, 1076, 0.12); }
  if (k === 'soon') { orbit(0.5, 1091, 1164); punch(1134, 1141, 0.1); }
  if (k === 'twist') { punch(1169, 1176, 0.08); punch(1200, 1207, 0.08); }
  if (k === 'vekso') { orbit(0.9, 1279, 1377); punch(1337, 1344, 0.08); }
  if (k === 'years') { punch(1380, 1387, 0.06); punch(1435, 1442, 0.06); }
  if (k === 'payoff') { const t = sm(1466, 1562, f); const P0 = STa(0.25, 2.55, 1.4), P1 = STa(0.6, 4.1, 21.5); c = { ...c, p: P0.map((v, i) => v + (P1[i] - v) * t), fov: 44 + 4 * t, cInf: 1.6 - 1.0 * t, fp: STa(0, 2.4 - 0.2 * t, -4.6) };
    c = push(c, 0.05, 1562, 1641, f); punch(1571, 1578, 0.08); kick(1571, 0.05); }
  return c;
}
const HARD = new Set([577, 1457]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[79, 0.35, 6], [111, 0.4, 8], [288, 0.8, 10], [464, 0.4, 8], [549, 0.3, 6], [629, 0.8, 10], [769, 0.5, 8], [858, 0.4, 8], [938, 0.3, 6], [1091, 0.5, 8], [1164, 0.8, 12], [1279, 0.4, 8], [1377, 0.4, 8], [1457, 0.6, 10], [1564, 0.5, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state
export function worldAt(f, w) {
  const s = segAt(f), k = s[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  if (!w.vk) return;
  w.vk.setCurtain(k === 'ring' ? sm(772, 806, f) : k === 'payoff' ? 1 : 0);
  if (k === 'cap') { const c = cam('cap', f); w.vk.parts.dg.tray.rotation.y = Math.atan2(c.p[0] - TRAY[0], c.p[2] - TRAY[2]) - 0.45 + 0.6 * sm(464, 577, f); }
  w.vk.setHorns(k === 'doepler' ? sm(934, 952, f) : k === 'paint' ? 1 : 0);
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const HEL = (f, pos, opts = {}, extra = {}) => person(f, 'HELMI', 9, pos, { t: f, ...opts }, { s: 0.36, ...extra });
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
const hop = (f, i = 0, a = 0.05) => [0, a * Math.abs(Math.sin(f * 0.35 + i)), 0];
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') { const off = f >= 79; A.push(P(f, off ? 'VK_OPERA0' : 'VK_OPERA', 11, FJ(0.15, 6.6), { expr: f < 79 ? 'smug' : f < 92 ? 'shock' : 'worried', view: '34R', hip: f < 79 ? 1 : undefined, cross: undefined }, { s: 1.08 }));
    A.push(HEL(f, FJ(1.25, 7.3), { expr: f < 79 ? 'smile' : 'shock', pose: f < 79 ? 'stand' : 'shock' })); }
  if (k === 'found') { A.push(P(f, 'VK_ARCH', 21, DG(-3.5, -2.2), { expr: 'thoughtful', prop: 'brush', mode: 'sit', view: '34R' }, { blob: false }));
    A.push(P(f, 'VK_ARCH2', 22, DG(0.9, -0.4), { expr: f < 174 ? 'smile' : 'excited', prop: 'trowel', view: '34L' })); A.push(HEL(f, DG(-1.6, 1.8), { expr: 'happy', pose: f > 191 ? 'cheer' : 'wave' })); }
  if (k === 'none') { A.push(P(f, 'VK_ARCH2', 22, DG(0.3, -0.6), { expr: f < 222 ? 'thoughtful' : 'worried', palm: f > 222 ? 1 : undefined, view: '34R' }));
    A.push(HEL(f, DG(-0.9, -0.2), { expr: f < 222 ? 'smile' : 'sad', pose: f > 226 ? 'shrug' : 'stand' })); }
  if (k === 'y1943') { const dig = Math.sin(f * 0.25); A.push(P(f, 'VK_FARMER', 31, DG(7.7, -1.9), { expr: f < 380 ? 'smile' : 'surprised', prop: 'shovel', view: '34R' }, { roll: 0.04 * dig }));
    A.push(HEL(f, DG(6.2, -0.4), { expr: f < 384 ? 'smile' : 'happy', pose: f < 384 ? 'stand' : 'point' })); }
  if (k === 'farm') { A.push(P(f, 'VK_FARMER', 31, DG(10.0, -2.6), { expr: f < 441 ? 'surprised' : 'excited', prop: 'shovel', view: '34R' })); }
  if (k === 'cap') { if (f >= 545) A.push(HEL(f, add3(TRAY, [0.42, -0.06 + 0.04 * back(545, 556, f) - 0.04, 0.12]), { expr: f < 556 ? 'happy' : 'proud', pose: f < 556 ? 'cheer' : 'hips' }, { s: 0.15 * back(545, 556, f) + 0.001, blob: false })); }
  if (k === 'where') { A.push(P(f, 'VK_RAIDER', 12, FJ(-0.55, 6.5), { expr: f < 600 ? 'thoughtful' : 'worried', palm: f > 600 ? 1 : undefined, view: '34R' }, { s: 1.06 }));
    A.push(HEL(f, FJ(0.85, 7.2), { expr: 'sly', pose: 'shrug' })); }
  if (k === 'bay') { A.push(P(f, 'VK_WAGNER', 41, BY(1.7, 10.4), { expr: f < 692 ? 'smile' : 'smug', point: f > 700 && f < 740 ? 1 : undefined, view: f < 700 ? 'front' : '34L' }, { s: 1.0 }));
    const W = [['VK_GENT', 42, -1.6, 14, -2], ['VK_LADY', 43, -0.6, 15.5, -1], ['VK_GENT2', 44, 1.4, 13, 0], ['VK_LADY', 45, 2.4, 16.5, -3], ['VK_GENT', 46, -2.4, 18, -5], ['VK_GENT2', 47, 1.0, 19, -4]];
    W.forEach(([o, sd, x, z0, z1], i) => { const t = (f - 629) / 140, z = z0 - 6 + (z1 - z0) * t - 8 * t; A.push(P(f, o, sd, BY(x, z), { expr: i % 2 ? 'happy' : 'smile' })); }); }
  if (k === 'ring') { const sing = f > 790; A.push(P(f, 'VK_SINGER', 51, ST(0, -5.0), { expr: sing ? 'happy' : 'smile', cheer: sing ? wav(f, 0, 0.2) : undefined, view: 'front' }, { s: 1.1 }));
    [['VK_GENT', 52, -2.2, 3.4], ['VK_LADY', 53, -0.8, 3.5], ['VK_GENT2', 54, 0.9, 3.4], ['VK_LADY', 55, 2.3, 3.6], ['VK_GENT', 56, -1.5, 5.6], ['VK_LADY', 57, 1.6, 5.7]].forEach(([o, sd, x, z]) => A.push(P(f, o, sd, STa(x, 0.42 + Math.round((z - 3.2) / 1.5) * 0.18, z + 0.15), { expr: 'smile', view: 'back', mode: 'sit' }, { blob: false })));
    A.push(P(f, 'VK_WAGNER', 41, STa(-5.6, 0, 1.2), { expr: f < 821 ? 'smile' : 'smug', view: '34R', cross: 1 })); }
  if (k === 'doepler') { A.push(P(f, 'VK_DOEPLER', 61, SP(-0.7, -1.05), { expr: f < 930 ? 'thoughtful' : 'happy', prop: 'pencil', view: '34L' }));
    A.push(HEL(f, SP(2.3, -1.1), { expr: f < 936 ? 'smile' : 'shock', pose: f < 936 ? 'stand' : 'shock' })); }
  if (k === 'paint') { A.push(HEL(f, SP(2.2, 1.2), { expr: f < 1036 ? 'sly' : f < 1069 ? 'shock' : 'dizzy', pose: f < 1036 ? 'point' : 'shock' }, { s: 0.3 }));
    if (f > 1030) A.push(P(f, 'VK_DOEPLER', 61, SP(-0.3, -1.6), { expr: 'proud', view: '34R', hip: 1 })); }
  if (k === 'soon') { const t = (f - 1091) / 73; A.push(P(f, 'VK_KID', 71, BY(-5.0 - 6.0 * t, 5.6))); A.push(P(f, 'VK_KID2', 72, BY(-3.6 - 6.0 * t, 6.2)));
    A.push(P(f, 'VK_GENT', 73, BY(-9.3, 5.4), { expr: f < 1121 ? 'thoughtful' : 'laugh', view: 'back' })); A.push(P(f, 'VK_LADY', 74, BY(-10.6, 5.0), { expr: 'happy', view: '34L' })); }
  if (k === 'twist') { A.push(HEL(f, BG(1.7, 0.6), { expr: f < 1200 ? 'smile' : 'shock', pose: f < 1200 ? 'stand' : 'shock' }, { s: 0.34 })); }
  if (k === 'vekso') { }
  if (k === 'years') { A.push(HEL(f, BG(1.9, 0.8), { expr: f < 1380 ? 'smile' : 'love', pose: f < 1430 ? 'point' : 'cheer' }, { s: 0.34 }));
    if (f > 1418) A.push(P(f, 'VK_RAIDER2', 81, BG(9.5 - 3.8 * sm(1418, 1457, f), -5.6))); }
  if (k === 'payoff') { const lit = f >= 1562; A.push(P(f, 'VK_SINGER', 51, ST(0, -4.6), { expr: f < 1520 ? 'smug' : lit ? 'nervous' : 'shock', cheer: f < 1520 ? wav(f, 0, 0.2) : undefined, view: 'front' }, { s: 1.1 }));
    A.push(HEL(f, ST(1.1, -4.0), { expr: lit ? 'love' : 'happy', pose: lit ? 'cheer' : 'wave', horns: 1 }, { s: 0.34 }));
    if (f > 1500) [['VK_GENT', 52, -2.2, 3.4], ['VK_LADY', 53, -0.8, 3.5], ['VK_GENT2', 54, 0.9, 3.4], ['VK_LADY', 55, 2.3, 3.6], ['VK_GENT', 56, -1.5, 5.6], ['VK_LADY', 57, 1.6, 5.7], ['VK_GENT2', 58, -3.4, 7.1], ['VK_LADY', 59, 3.0, 7.2], ['VK_KID', 60, 0.2, 7.0]].forEach(([o, sd, x, z], i) =>
      A.push(P(f, o, sd, STa(x, 0.42 + Math.round((z - 3.2) / 1.5) * 0.18, z + 0.15), { expr: lit ? 'laugh' : 'smile', view: 'back', mode: 'sit', cheer: lit && i % 2 ? wav(f, i) : undefined }, { blob: false }))); }
  return A;
}

// ---------- effects
const ASP = 1080 / 1920; let CURF = 0;
function SB(k, x, y, z) { const c = cam(k, CURF), n = (v) => { const l = Math.hypot(...v); return v.map((u) => u / l); }, fw = n([c.l[0] - c.p[0], c.l[1] - c.p[1], c.l[2] - c.p[2]]), r = n([-fw[2], 0, fw[0]]), u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]], t = Math.tan(c.fov * Math.PI / 360);
  return [0, 1, 2].map((i) => c.p[i] + fw[i] * z + r[i] * x * t * ASP * z + u[i] * y * t * z); }
const SW = (k, w, z) => 2 * w * z * Math.tan(cam(k, CURF).fov * Math.PI / 360) * ASP;
const board = (f, f0, lines, pos, size, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'board', lines, pos, size: size * back(f0, f0 + 12, f) }); };
const sboard = (f, f0, lines, k, x, y, z, w, F2, f1) => board(f, f0, lines, SB(k, x, y, z), SW(k, w, z), F2, f1);
const sburst = (f, f0, k, x, y, z, w, F2, col = '#fff3b0', n = 12) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'burst', t: (f - f0) / n, pos: SB(k, x, y, z * 1.1), size: SW(k, w, z * 1.1), col, rays: 10 }); };
const stars = (f, f0, k, x, y, z, w, F2, per = 30) => { if (f >= f0) F2.push({ fx: 'stars', t: ((f - f0) / per) % 1, pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 10, f) }); };
const qmark = (f, f0, k, x, y, z, w, F2) => { if (f >= f0) F2.push({ fx: 'qmark', pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 8, f) }); };
const stamp = (f, f0, lines, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) { const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos: SB(k, x, y, z), size: SW(k, w, z) * (1.6 - 0.6 * t * t), op: Math.min(1, t * 2) }); } };
const wpuff = (f, f0, pos, size, F2, n = 16, tint) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'puff', t: (f - f0) / n, pos, size, tint }); };
const count = (f, f0, f1, v0, v1) => Math.round(v0 + (v1 - v0) * sm(f0, f1, f));
const DUST = '#c8a880';
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { sboard(f, 6, ['EVERY HORNED', 'VIKING HELMET...'], 'hook', 0.0, 0.66, 3, 0.5, F2, 76); stamp(f, 79, ['WRONG!'], 'hook', 0.0, 0.6, 2.6, 0.42, F2); wpuff(f, 79, FJa(0.15, ff(0.15, 6.6) + 2.15, 6.6), 1.3, F2, 16, '#f2e6c8'); sburst(f, 79, 'hook', 0.0, 0.25, 3, 0.5, F2); }
  if (k === 'found') { const L = f < 174 ? ['SHIPS: YES'] : f < 191 ? ['SHIPS: YES', 'SWORDS: YES'] : ['SWORDS: YES', 'GRAVES: YES']; board(f, f < 174 ? 146 : f < 191 ? 172 : 189, L, SB('found', 0.0, 0.64, 3), SW('found', 0.46, 3), F2); sboard(f, 112, ['ARCHAEOLOGISTS'], 'found', 0.0, -0.5, 3, 0.4, F2, 146); }
  if (k === 'none') { board(f, 214, ['HORNED HELMETS', 'FOUND: ' + (f < 222 ? '?' : '0')], SB('none', 0.0, 0.64, 2.5), SW('none', 0.5, 2.5), F2); stamp(f, 222, ['ZERO'], 'none', 0.25, 0.3, 2.5, 0.3, F2); sboard(f, 262, ['VIKING AGE', '793-1066'], 'none', 0.0, -0.46, 2.5, 0.4, F2); }
  if (k === 'y1943') { sboard(f, 292, ['MOST COMPLETE', 'VIKING HELMET'], 'y1943', 0.0, 0.66, 3, 0.5, F2, 362); sboard(f, 364, ['NORWAY,', '1943'], 'y1943', 0.0, 0.66, 3, 0.4, F2); sburst(f, 384, 'y1943', 0.0, 0.66, 3, 0.5, F2); }
  if (k === 'farm') { sboard(f, 438, ['GJERMUNDBU', 'FARM'], 'farm', 0.0, 0.66, 2.5, 0.46, F2); sburst(f, 441, 'farm', 0.05, -0.05, 2.5, 0.5, F2, '#fff3b0', 14); stars(f, 446, 'farm', 0.05, 0.0, 2.5, 0.4, F2, 24); }
  if (k === 'cap') { sboard(f, 470, ['ROUNDED', 'IRON CAP'], 'cap', 0.0, 0.66, 1.2, 0.42, F2, 510); sboard(f, 510, ['GUARD AROUND', 'THE EYES'], 'cap', 0.0, 0.66, 1.2, 0.46, F2, 547); stamp(f, 549, ['NO HORNS'], 'cap', 0.0, 0.62, 1.2, 0.44, F2); }
  if (k === 'where') { sboard(f, 579, ['SO WHERE DID', 'THE HORNS COME FROM?'], 'where', 0.0, 0.66, 3, 0.56, F2); qmark(f, 590, 'where', -0.3, 0.25, 3, 0.12, F2); qmark(f, 600, 'where', 0.32, 0.3, 3, 0.12, F2); }
  if (k === 'bay') { sboard(f, 645, ['1876'], 'bay', 0.0, 0.7, 4, 0.32, F2, 690); sboard(f, 690, ['RICHARD', 'WAGNER'], 'bay', 0.0, 0.66, 4, 0.42, F2, 738); sboard(f, 738, ['4 OPERAS', '~15 HOURS'], 'bay', 0.0, 0.66, 4, 0.42, F2); sburst(f, 648, 'bay', 0.0, 0.7, 4, 0.45, F2, '#ffe0a0'); }
  if (k === 'ring') { sboard(f, 772, ['THE RING OF', 'THE NIBELUNG'], 'ring', 0.0, 0.66, 4, 0.5, F2, 818); sboard(f, 818, ['FIRST BAYREUTH', 'FESTIVAL'], 'ring', 0.0, 0.66, 4, 0.5, F2); stars(f, 836, 'ring', 0.0, 0.2, 4, 0.5, F2, 24); }
  if (k === 'doepler') { sboard(f, 866, ['COSTUME', 'DESIGNER'], 'doepler', 0.0, 0.66, 3, 0.42, F2, 902); sboard(f, 902, ['CARL EMIL', 'DOEPLER'], 'doepler', 0.0, 0.66, 3, 0.44, F2, 932); sboard(f, 934, ['+ HORNS'], 'doepler', 0.0, 0.68, 3, 0.36, F2); sburst(f, 938, 'doepler', 0.0, 0.15, 2.2, 0.5, F2, '#fff3b0', 14); }
  if (k === 'paint') { sboard(f, 980, ['PAINTERS', 'TOYED WITH IT'], 'paint', 0.0, 0.66, 2.2, 0.46, F2, 1034); sboard(f, 1040, ['THE OPERA', 'MADE IT STICK'], 'paint', 0.0, 0.66, 2.2, 0.46, F2); sburst(f, 1069, 'paint', 0.0, 0.15, 2.2, 0.5, F2); }
  if (k === 'soon') { sboard(f, 1104, ['HORNS = VIKING'], 'soon', 0.0, 0.68, 3, 0.44, F2, 1132); sboard(f, 1132, ['EVERYWHERE!'], 'soon', 0.0, 0.68, 3, 0.4, F2); sburst(f, 1134, 'soon', 0.0, 0.66, 3, 0.55, F2, '#fff3b0', 14); }
  if (k === 'twist') { stamp(f, 1165, ['THE TWIST'], 'twist', 0.0, 0.6, 3, 0.4, F2, 1196); sboard(f, 1198, ['REAL HORNED', 'HELMETS!'], 'twist', 0.0, 0.66, 3, 0.46, F2, 1250); sboard(f, 1250, ['IN', 'SCANDINAVIA'], 'twist', 0.0, 0.66, 3, 0.44, F2); sburst(f, 1200, 'twist', 0.0, -0.05, 3, 0.5, F2, '#ffe8a0', 14); }
  if (k === 'vekso') { sboard(f, 1280, ['THE VEKSØ', 'HELMETS'], 'vekso', 0.0, 0.66, 1.6, 0.44, F2, 1314); sboard(f, 1314, ['DENMARK'], 'vekso', 0.0, 0.68, 1.6, 0.36, F2, 1334); sboard(f, 1334, ['AROUND', '900 BC'], 'vekso', 0.0, 0.66, 1.6, 0.4, F2); stars(f, 1340, 'vekso', 0.0, 0.0, 1.6, 0.5, F2, 24); }
  if (k === 'years') { board(f, 1378, ['ABOUT', count(f, 1380, 1412, 0, 1700).toLocaleString('en-US') + ' YEARS'], SB('years', 0.0, 0.66, 3), SW('years', 0.48, 3), F2, 1432); sboard(f, 1432, ['BEFORE THE', 'VIKINGS'], 'years', 0.0, 0.66, 3, 0.44, F2); sburst(f, 1412, 'years', 0.0, 0.66, 3, 0.5, F2); }
  if (k === 'payoff') { sboard(f, 1474, ['THE MOST FAMOUS', 'VIKING LOOK...'], 'payoff', 0.0, 0.66, 3, 0.52, F2, 1560); stamp(f, 1570, ['OPERA', 'COSTUME'], 'payoff', 0.0, 0.58, 3, 0.46, F2); stars(f, 1580, 'payoff', 0.0, 0.25, 3, 0.55, F2, 24); }
  return F2;
}
