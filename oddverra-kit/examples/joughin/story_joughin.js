// [JG-story] "The Titanic's baker survived the freezing Atlantic" timeline (59.7 s voice + tail, 1830 f @ 30 fps).
// Sets: titanic_sets.js (galley / deck / deckBerg / cabin / stern / ocean / oceanDawn / home), driven through setAt.
// Pattern: story_playdoh.js (slow push per shot, zoom-through whips on cuts, screen-pinned boards / bursts / stamps, punch-ins on punchlines).
// LOAFY (bread-loaf mascot = DOUGHY with loaf: 1) appears only in the light-hearted beats (galley, deck bread, cabin, ending), never in the water.
import * as S from './story.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, module, set]                                   narration (word frames from work/words_frames.txt)
const SH = [
  [0, 62, 'hook', 'titanic', 'ocean'],            // The Titanic's chief baker survived  (baker 34)
  [62, 112, 'atlantic', 'titanic', 'ocean'],      // the freezing Atlantic...  (freezing 73)
  [112, 158, 'drinking', 'titanic', 'cabin'],     // and he'd been drinking.  (drinking 132)
  [158, 218, 'name', 'titanic', 'galley'],        // His name was Charles Joughin.  (Charles 179)
  [218, 262, 'iceberg', 'titanic', 'deckBerg'],   // When the ship hit the iceberg,  (iceberg 243)
  [262, 292, 'nopanic', 'titanic', 'galley'],     // he didn't panic.  (panic 273)
  [292, 365, 'bakers', 'titanic', 'galley'],      // He sent his 13 bakers up to the lifeboats  (13 310)
  [365, 425, 'loaves', 'titanic', 'deck'],        // with four loaves of bread each.  (four 374)
  [425, 515, 'loading', 'titanic', 'deck'],       // Then he helped load women and children into the boats.  (women 458)
  [515, 592, 'cabin', 'titanic', 'cabin'],        // Then... he went down to his cabin, for,  (cabin 563)
  [592, 649, 'liqueur', 'titanic', 'cabin'],      // quote, "a drop of liqueur."  (drop 612, music stop)
  [649, 735, 'chairs', 'titanic', 'deck'],        // Back on deck, he threw about fifty deck chairs overboard,  (threw 679, 50 692)
  [735, 795, 'float', 'titanic', 'ocean'],        // so people would have something to float on.  (float 777)
  [795, 836, 'sank', 'titanic', 'stern'],         // As the ship sank,  (sank 816)
  [836, 880, 'climb', 'titanic', 'stern'],        // he climbed to the very back,
  [880, 912, 'rail', 'titanic', 'stern'],         // held the railing,
  [912, 985, 'elevator', 'titanic', 'stern'],     // and rode the stern down like an elevator.  (elevator 959)
  [985, 1045, 'wet', 'titanic', 'ocean'],         // He said his head barely got wet.  (wet 1025)
  [1045, 1150, 'hours', 'titanic', 'ocean'],      // He said he spent over two hours in water below freezing.  (two 1078, freezing 1131)
  [1150, 1240, 'memorial', 'titanic', 'ocean'],   // More than 1,500 people died that night.  (music stop)
  [1240, 1310, 'collapsible', 'titanic', 'oceanDawn'], // Finally, a cook on an overturned lifeboat  (overturned 1284)
  [1310, 1345, 'hand', 'titanic', 'oceanDawn'],   // held his hand,  (hand 1329)
  [1345, 1405, 'pulled', 'titanic', 'oceanDawn'], // until another lifeboat pulled him in.  (pulled 1375)
  [1405, 1440, 'injury', 'titanic', 'oceanDawn'], // His only injury?
  [1440, 1475, 'feet', 'titanic', 'oceanDawn'],   // Swollen feet.  (feet 1447)
  [1475, 1535, 'save', 'titanic', 'cabin'],       // So, did the liqueur save him?  (save 1509)
  [1535, 1563, 'doctors', 'titanic', 'cabin'],    // Doctors say no.  (no 1554)
  [1563, 1652, 'heat', 'titanic', 'ocean'],       // Alcohol actually makes you lose heat faster,  (heat 1621)
  [1652, 1742, 'luckiest', 'titanic', 'home'],    // which means the luckiest baker in history  (luckiest 1680)
  [1742, 1830, 'end', 'titanic', 'home'],         // survived... in spite of his drink.  (spite 1753, drink 1775)
];
export const NF = 1830;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
const LIGHT = { galley: 'office', cabin: 'office', home: 'office', deck: 'explain', deckBerg: 'explain', stern: 'explain', ocean: 'explain', oceanDawn: 'explain' };
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: LIGHT[s[4]], kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {}; // narrator not lip-synced; characters don't talk
export const setAt = (f) => { const s = segAt(f); return [s[3], s[4]]; };

// ---------- places (local set coords -> world; origins from titanic_sets.js) ----------
const at = (o) => (p) => [p[0] + o[0], p[1] + o[1], p[2] + o[2]];
const GA = at([-24000, 0, 0]), DK = at([-24000, 0, 800]), CB = at([-24000, 0, 1600]), HM = at([-24000, 0, 2400]), ST = at([-26000, 0, 0]), OC = at([-28000, 0, 0]);
// stern pivot: local deck point p -> world, for tilt a (rad, stern up) and sink d (pivot at y 6 - d)
const sternTS = (f) => { const k = segAt(f)[2];
  if (k === 'sank') return [0.12 + 0.33 * sm(795, 836, f), 0];
  if (k === 'climb') return [0.5 + 0.18 * sm(836, 880, f), 0];
  if (k === 'rail') return [0.7 + 0.1 * sm(880, 912, f), 0];
  if (k === 'elevator') return [0.8 + 0.35 * sm(912, 940, f), 11.5 * sm(926, 982, f) ** 1.3];
  return [0, 0]; };
const SP = (f, p) => { const [a, d] = sternTS(f), c = Math.cos(a), s = Math.sin(a); return ST([p[0], 6 - d + p[1] * c - p[2] * s, p[1] * s + p[2] * c]); };
const WY = -1.12; // card base height for a swimmer (water at y 0 hides the body below the chest)

// ---------- cameras ----------
const C = (W, p, l, fov, cInf, fp) => ({ p: W(p), l: W(l), fov, cInf, fp: W(fp || l) });
const V = {
  hook: C(OC, [0.2, 0.5, 1.9], [0.0, 0.42, -1.5], 44, 3, [0.0, 0.35, -1.5]),
  atlantic: C(OC, [0.8, 1.7, 5.0], [0.0, 0.2, -8.0], 54, 1.4, [0.6, 0.2, -1.0]),
  drinking: C(CB, [0.25, 1.15, 0.45], [0.7, 0.82, -0.9], 44, 3, [0.65, 0.8, -0.85]),
  name: C(GA, [0.5, 1.5, 2.4], [0.0, 1.1, -2.0], 52, 1.6, [-0.1, 1.0, -1.1]),
  iceberg: C(DK, [1.7, 1.7, 1.6], [-8, -1.5, -70], 50, 1.2, [0.9, 1.0, -1.8]),
  nopanic: C(GA, [-0.3, 1.4, 1.9], [-1.3, 1.05, -1.6], 48, 2.5, [-1.3, 1.0, -1.3]),
  bakers: C(GA, [-0.2, 1.55, 3.0], [-1.9, 1.0, -0.8], 52, 1.8, [-1.8, 1.0, -0.6]),
  loaves: C(DK, [3.1, 1.55, 2.2], [4.2, 1.0, -3.0], 52, 2, [4.0, 0.9, -1.9]),
  loading: C(DK, [5.0, 2.25, 2.7], [4.1, 0.75, -3.2], 52, 1.8, [4.3, 0.9, -2.2]),
  cabin: C(CB, [0.15, 1.5, 1.95], [0.0, 1.0, -1.4], 60, 1.6, [0.1, 0.9, -0.5]),
  liqueur: C(CB, [-0.35, 1.5, 1.95], [0.4, 1.1, -0.9], 60, 2.2, [0.35, 1.1, -0.55]),
  chairs: C(DK, [1.4, 1.6, 4.4], [0.4, 1.4, -3.0], 52, 1.8, [0.6, 1.2, -1.4]),
  float: C(OC, [0.4, 1.1, 3.4], [0.0, 0.0, -4.0], 50, 1.6, [0.0, 0.1, -1.0]),
  sank: C(ST, [16, 7.5, 14], [0, 8.5, -1], 48, 1.2, [0, 8, -1]),
  climb: C(ST, [11, 8, 7], [0, 10, -3], 48, 1.4, [1.4, 10, -2.5]),
  rail: C(ST, [6.5, 12.5, -1], [1.0, 11.5, -3.0], 46, 2.5, [1.2, 11.5, -2.8]),
  elevator: C(ST, [9, 5.5, 3], [0, 7, -3.5], 52, 1.6, [1.0, 7, -3.0]),
  wet: C(OC, [-0.1, 0.4, 1.3], [0.1, 0.32, -1.6], 42, 4, [0.1, 0.3, -1.6]),
  hours: C(OC, [0.7, 0.9, 2.2], [0.0, 0.25, -2.0], 48, 2.5, [0.1, 0.2, -1.6]),
  memorial: C(OC, [0, 3.2, 9], [0, 0.4, -40], 54, 1.0, [0, 0.4, -12]),
  collapsible: C(OC, [0.3, 1.2, 2.0], [-1.6, 0.6, -4.2], 52, 1.8, [-1.4, 0.6, -3.6]),
  hand: C(OC, [0.3, 0.9, 0.3], [-1.1, 0.5, -3.4], 46, 2.5, [-0.9, 0.45, -3.0]),
  pulled: C(OC, [-1.6, 1.0, 2.6], [0.8, 0.4, -3.4], 50, 2, [0.8, 0.4, -3.0]),
  injury: C(OC, [-0.3, 0.95, 0.3], [1.2, 0.55, -3.1], 46, 3, [1.1, 0.6, -2.9]),
  feet: C(OC, [-0.3, 0.95, 0.3], [1.2, 0.55, -3.1], 44, 3, [1.1, 0.6, -2.9]),
  save: C(CB, [0.15, 1.2, 0.6], [0.68, 0.82, -0.85], 44, 3, [0.62, 0.8, -0.8]),
  doctors: C(CB, [0.25, 1.15, 0.4], [0.7, 0.82, -0.85], 42, 3, [0.65, 0.8, -0.8]),
  heat: C(OC, [-0.4, 0.55, 1.5], [0.1, 0.35, -1.6], 44, 3.5, [0.1, 0.3, -1.6]),
  luckiest: C(HM, [0.4, 1.45, 2.4], [-0.1, 1.1, -2.2], 52, 1.6, [-0.1, 1.0, -1.1]),
  end: C(HM, [0.2, 1.45, 1.6], [-0.2, 1.2, -1.6], 48, 2.2, [-0.15, 1.15, -1.1]),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]]; return { ...v, p: add3(v.p, d.map((x) => x * k * t)) }; };
const PUSH = { hook: 0.08, atlantic: 0.08, drinking: 0.1, name: 0.12, iceberg: 0.05, nopanic: 0.1, bakers: 0.08, loaves: 0.1, loading: 0.1, cabin: 0.1, liqueur: 0.1, chairs: 0.08, float: 0.1,
  sank: 0.06, climb: 0.04, rail: 0.06, elevator: 0, wet: 0.08, hours: 0.1, memorial: 0.05, collapsible: 0.1, hand: 0.1, pulled: 0.06, injury: 0.1, feet: 0.0, save: 0.12, doctors: 0.08, heat: 0.1, luckiest: 0.1, end: 0.12 };
const base = (k) => V[k] || V.hook;
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const sway = (a, sp = 0.05) => { c = { ...c, p: add3(c.p, [a * Math.sin(f * sp), a * 0.6 * Math.sin(f * sp * 1.3 + 1), 0]), roll: (c.roll || 0) + a * 0.25 * Math.sin(f * sp * 0.9) }; };
  if (k === 'hook') { punch(34, 42, 0.1); sway(0.03); }
  if (k === 'atlantic') { punch(73, 82, 0.06); sway(0.04, 0.03); }
  if (k === 'drinking') { punch(132, 138, 0.18); kick(132, 0.02); }
  if (k === 'name') punch(179, 186, 0.1);
  if (k === 'iceberg') { kick(243, 0.08); c = { ...c, roll: 0.03 * Math.sin(Math.PI * Math.min(1, Math.max(0, (f - 243) / 10))) }; }
  if (k === 'nopanic') punch(273, 280, 0.1);
  if (k === 'bakers') punch(310, 316, 0.06);
  if (k === 'loaves') { punch(374, 380, 0.08); kick(374, 0.02); }
  if (k === 'loading') punch(458, 465, 0.06);
  if (k === 'cabin') c = { ...c, roll: -0.04 };
  if (k === 'liqueur') { c = { ...c, roll: -0.05 }; punch(612, 620, 0.16); }
  if (k === 'chairs') { kick(679, 0.03); punch(692, 698, 0.08); }
  if (k === 'float') punch(777, 783, 0.06);
  if (k === 'sank') c = { ...c, roll: 0.02 * Math.sin(f * 0.08) };
  if (k === 'elevator') { const r = SP(f, [1.2, 1.0, -5.35]), r0 = SP(912, [1.2, 1.0, -5.35]), y = Math.max(r[1], 2.2); c = { ...c, p: [r0[0] + 8.5, y + 0.5, r0[2] + 7.5], l: [r0[0], y - 0.8, r0[2]], fp: r }; punch(959, 966, 0.1); }
  if (k === 'wet') { punch(1025, 1031, 0.14); kick(1025, 0.02); }
  if (k === 'hours') { punch(1078, 1084, 0.06); punch(1131, 1137, 0.08); sway(0.03); }
  if (k === 'collapsible') punch(1284, 1290, 0.08);
  if (k === 'hand') punch(1329, 1335, 0.1);
  if (k === 'pulled') punch(1375, 1381, 0.06);
  if (k === 'feet') { punch(1447, 1453, 0.1); kick(1447, 0.03); }
  if (k === 'save') punch(1509, 1515, 0.08);
  if (k === 'doctors') { punch(1554, 1559, 0.14); kick(1554, 0.03); }
  if (k === 'heat') { punch(1621, 1628, 0.1); sway(0.03); }
  if (k === 'luckiest') punch(1680, 1687, 0.08);
  if (k === 'end') { punch(1753, 1760, 0.08); punch(1775, 1782, 0.1); kick(1775, 0.03); }
  return c;
}
const HARD = new Set([1150]); // hard cut into the quiet memorial beat
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0; // white flashes on big hits
  for (const [c, a, n] of [[112, 0.4, 8], [158, 0.6, 10], [243, 0.8, 10], [374, 0.3, 6], [612, 0.4, 8], [692, 0.4, 8], [959, 0.5, 10], [1025, 0.4, 8], [1447, 0.5, 8], [1554, 0.4, 8], [1652, 0.7, 12], [1775, 0.4, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state ----------
const lifeAt = (f) => { const k = segAt(f)[2];
  if (k === 'collapsible' || k === 'hand') return [7.5, -8.5, -0.6];
  if (k === 'pulled') { const t = sm(1345, 1395, f); return [5.5 - 4.0 * t, -6.5 + 3.4 * t, -0.6 + 0.4 * t]; }
  if (k === 'injury' || k === 'feet') return [1.5, -3.1, -0.2];
  return [3.5, -9, -0.4]; };
export function worldAt(f, w) {
  const s = segAt(f), k = s[2], Ti = w.titanic;
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  if (!Ti) return;
  Ti.lower(k === 'loaves' || k === 'loading' ? 1 : 0);
  Ti.berg(k === 'iceberg' ? 0.25 + 0.5 * sm(218, 262, f) : 0);
  for (let i = 0; i < 3; i++) Ti.fly(i, k === 'chairs' ? (f - (668 + i * 18)) / 26 : 0, 0.6);
  const [a, d] = sternTS(f); Ti.stern(a, d);
  const L = lifeAt(f); Ti.boatAt(L[0], L[1], L[2]);
}

// ---------- actors ----------
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const LOAFY = (f, pos, opts = {}, extra = {}) => person(f, 'DOUGHY', 9, pos, { t: f, loaf: 1, dcol: '#d8904a', ...opts }, extra);
const hop = (f, i = 0, a = 0.04) => [0, a * Math.abs(Math.sin(f * 0.35 + i)), 0];
const bobY = (f, i = 0) => 0.03 * Math.sin(f * 0.09 + i);
const swim = (f, x, z, i = 0) => [x + 0.02 * Math.sin(f * 0.05 + i), WY + bobY(f, i), z];
const SWIM = { blob: false };

export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') A.push(P(f, 'JOUGHIN', 1, OC(swim(f, 0.0, -1.5)), { expr: f < 34 ? 'nervous' : 'happy', view: 'front' }, SWIM));
  if (k === 'atlantic') A.push(P(f, 'JOUGHIN', 1, OC(swim(f, 0.7, -0.6)), { expr: 'nervous', view: 'front' }, SWIM));
  if (k === 'drinking') A.push(LOAFY(f, CB([0.5, 0.72, -0.68]), { expr: f < 132 ? 'smile' : 'shock', look: 1 }, { s: 0.12, blob: false }));
  if (k === 'name') { A.push(P(f, 'JOUGHIN', 1, GA([-0.15, 0, -1.15]), { expr: f < 179 ? 'smile' : 'happy', prop: 'loaves', reach: 0.8, view: 'front' }));
    A.push(LOAFY(f, GA([0.6, 0.88, -0.3]), { expr: f < 179 ? 'smile' : 'triumph', pose: f < 179 ? 'stand' : 'cheer' }, { s: 0.15, blob: false })); }
  if (k === 'iceberg') A.push(P(f, 'OFFICER', 11, DK([0.55, 0, -1.75]), { expr: f < 243 ? 'worried' : 'shock', prop: 'lantern', reach: 0.6, view: '34R' }));
  if (k === 'nopanic') { A.push(P(f, 'JOUGHIN', 1, GA([-1.25, 0, -1.3]), { expr: f < 273 ? 'smile' : 'proud', cross: 1, view: 'front' }));
    A.push(LOAFY(f, GA([-0.55, 0.88, -0.5]), { expr: f < 268 ? 'shock' : 'smile', look: -1 }, { s: 0.14, blob: false })); }
  if (k === 'bakers') { const t = sm(296, 360, f);
    [['BAKER1', 21, -2.75, -1.25], ['BAKER2', 22, -2.25, -0.6], ['BAKER1', 23, -2.85, 0.05]].forEach(([o, sd, x, z], i) => A.push(P(f, o, sd, GA(add3([x + 1.4 * t, 0, z], hop(f, i))), { expr: ['determined', 'smile', 'excited'][i], prop: 'loaves', reach: 0.8, view: '34L' })));
    A.push(P(f, 'JOUGHIN', 1, GA([-0.95, 0, -1.6]), { expr: 'determined', point: 1, view: '34R' })); }
  if (k === 'loaves') { A.push(P(f, 'BAKER1', 21, DK([3.35, 0, -1.75]), { expr: 'smile', prop: 'loaves', raise: f > 374 ? 1 : 0, reach: 0.9, view: '34L' }));
    A.push(P(f, 'BAKER2', 22, DK([5.05, 0, -1.8]), { expr: 'determined', prop: 'loaves', reach: 0.8, view: '34R' }));
    A.push(LOAFY(f, DK(add3([4.2, 0.75, -3.15], hop(f, 3, 0.03))), { expr: 'happy', pose: 'wave' }, { s: 0.16, blob: false })); }
  if (k === 'loading') { const b = 0.6;
    A.push(P(f, 'LADY1', 31, DK([3.55, b, -3.25]), { expr: 'worried', view: '34R' }, { blob: false }));
    A.push(P(f, 'GIRL', 33, DK([4.25, b, -3.1]), { expr: 'nervous', view: 'front' }, { blob: false, s: 0.95 }));
    A.push(P(f, 'BOY', 34, DK([2.95, 0, -1.55]), { expr: 'worried', view: '34L' }));
    A.push(P(f, 'LADY2', 32, DK([3.6, 0, -1.45]), { expr: 'nervous', view: '34L' }));
    A.push(P(f, 'JOUGHIN', 1, DK([5.0, 0, -1.6]), { expr: 'determined', reach: 1, point: 1, view: '34L' }));
    A.push(P(f, 'OFFICER', 11, DK([6.1, 0, -1.35]), { expr: 'determined', prop: 'lantern', reach: 0.6, view: '34L' })); }
  if (k === 'cabin') { const x = -0.7 + 0.95 * sm(520, 575, f); A.push(P(f, 'JOUGHIN', 1, CB([x, 0, -0.35]), { expr: f < 560 ? 'smile' : 'sly', view: f < 575 ? 'sideR' : 'front' }));
    A.push(LOAFY(f, CB([-1.0, 0.55, -0.55]), { expr: f < 563 ? 'smile' : 'shock', look: 1 }, { s: 0.13, blob: false })); }
  if (k === 'liqueur') A.push(P(f, 'JOUGHIN', 1, CB([0.32, 0, -0.55]), { expr: f < 612 ? 'smile' : 'sly', prop: 'glass', raise: f > 606 ? 1 : 0, reach: 0.9, view: 'front' }));
  if (k === 'chairs') A.push(P(f, 'JOUGHIN', 1, DK([0.6, 0, -1.4]), { expr: f < 679 ? 'determined' : 'excited', prop: (f > 660 && f < 672) || (f > 680 && f < 690) || f > 700 ? 'chair' : undefined, raise: 1, reach: 1, view: '34R' }));
  if (k === 'climb') { const t = sm(836, 878, f); A.push(P(f, 'JOUGHIN', 1, SP(f, [1.4, 0, 1.0 - 4.2 * t]), { expr: 'determined', view: 'sideL', reach: 1, point: 1 })); }
  if (k === 'rail' || k === 'elevator') A.push(P(f, 'JOUGHIN', 1, SP(f, [1.2, 0, -5.35]), { expr: k === 'rail' ? 'determined' : f < 955 ? 'nervous' : 'surprised', reach: 1, raise: 1, view: 'sideL' }, { blob: false }));
  if (k === 'sank') A.push(P(f, 'JOUGHIN', 1, SP(f, [1.4, 0, 2.0]), { expr: 'worried', view: '34R' }));
  if (k === 'wet') { const y = WY - 0.5 * (1 - eo(988, 1002, f)); A.push(P(f, 'JOUGHIN', 1, OC([0.1, y + bobY(f), -1.6]), { expr: f < 1010 ? 'surprised' : f < 1025 ? 'happy' : 'proud', view: 'front' }, SWIM)); }
  if (k === 'hours' || k === 'heat') A.push(P(f, 'JOUGHIN', 1, OC(swim(f, 0.1, -1.6)), { expr: k === 'heat' ? (f < 1621 ? 'nervous' : 'shock') : f < 1131 ? 'determined' : 'nervous', view: 'front', shake: 1 }, SWIM));
  if (k === 'collapsible' || k === 'hand') { // men standing on the overturned collapsible (axis along its yaw 0.35)
    const cx = -1.8, cz = -4.2, ax = [Math.cos(0.35), 0, -Math.sin(0.35)];
    [['SAILOR', 41, -1.3], ['OFFICER', 11, -0.5], ['COOK', 43, 0.6], ['SAILOR', 42, 1.4]].forEach(([o, sd, t], i) => A.push(P(f, o, sd, OC([cx + ax[0] * t, 0.42, cz + ax[2] * t]), { expr: o === 'COOK' && f > 1300 ? 'determined' : ['worried', 'nervous', 'worried', 'nervous'][i], point: o === 'COOK' && (k === 'hand' || f > 1290) ? 1 : 0, reach: 1, view: o === 'COOK' ? '34R' : 'front' }, { blob: false })));
    A.push(P(f, 'JOUGHIN', 1, OC(swim(f, -0.85 + 0.1 * sm(1240, 1300, f), -3.0)), { expr: k === 'hand' ? (f < 1329 ? 'nervous' : 'happy') : 'nervous', raise: k === 'hand' ? 1 : 0, reach: 1, view: '34L' }, SWIM)); }
  if (k === 'pulled') { const L = lifeAt(f), ry = L[2], fw = [Math.cos(ry), 0, -Math.sin(ry)];
    A.push(P(f, 'SAILOR', 41, OC([L[0] + fw[0] * 1.2, 0.2, L[1] + fw[2] * 1.2]), { expr: 'determined', prop: 'oar', reach: 0.6, view: '34L' }, { blob: false }));
    A.push(P(f, 'SAILOR', 42, OC([L[0] - fw[0] * 0.6, 0.2, L[1] - fw[2] * 0.6 - 0.1]), { expr: f > 1375 ? 'happy' : 'determined', point: 1, reach: 1, view: '34L' }, { blob: false }));
    const inb = sm(1378, 1400, f); A.push(P(f, 'JOUGHIN', 1, OC([0.6 + 0.4 * inb, WY + (0.2 - WY) * inb + bobY(f), -2.4 - 0.3 * inb]), { expr: f < 1375 ? 'nervous' : 'happy', raise: 1, reach: 1, view: '34R' }, SWIM)); }
  if (k === 'injury' || k === 'feet') { A.push(P(f, 'JOUGHIN_WET', 2, OC([1.05, 0.15, -2.95]), { expr: k === 'feet' ? (f < 1447 ? 'nervous' : 'shock') : 'worried', view: 'front', shake: 1 }, { blob: false }));
    A.push(P(f, 'SAILOR', 42, OC([2.0, 0.15, -3.3]), { expr: 'smile', view: '34L' }, { blob: false })); }
  if (k === 'save') A.push(LOAFY(f, CB([0.5, 0.72, -0.68]), { expr: f < 1509 ? 'smile' : 'sly', look: 1, pose: f < 1509 ? 'stand' : 'shrug' }, { s: 0.12, blob: false }));
  if (k === 'doctors') A.push(LOAFY(f, CB([0.5, 0.72, -0.68]), { expr: f < 1554 ? 'sly' : 'shock', look: 1 }, { s: 0.12, blob: false }));
  if (k === 'luckiest' || k === 'end') { const e = k === 'end';
    A.push(P(f, 'JOUGHIN_OLD', 3, HM([-0.25, 0, -1.4]), { expr: e ? (f < 1775 ? 'happy' : 'sly') : 'happy', prop: 'loaf', reach: 0.85, raise: e && f > 1775 ? 1 : 0, view: 'front' }));
    A.push(LOAFY(f, HM(add3([-0.65, 0.73, -0.95], e ? hop(f, 2, 0.02) : [0, 0, 0])), { expr: e ? 'triumph' : 'happy', pose: e ? 'cheer' : 'wave' }, { s: 0.13, blob: false })); }
  return A;
}

// ---------- effects ----------
// screen-anchored placement from the shot's pushed camera at the current frame: ndc (x, y), depth z -> world point; w = ndc half-width -> world size
const ASP = 1080 / 1920; let CURF = 0;
function SB(k, x, y, z) { const c = cam(k, CURF), n = (v) => { const l = Math.hypot(...v); return v.map((u) => u / l); }, fw = n([c.l[0] - c.p[0], c.l[1] - c.p[1], c.l[2] - c.p[2]]), r = n([-fw[2], 0, fw[0]]), u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]], t = Math.tan(c.fov * Math.PI / 360);
  return [0, 1, 2].map((i) => c.p[i] + fw[i] * z + r[i] * x * t * ASP * z + u[i] * y * t * z); }
const SW = (k, w, z) => 2 * w * z * Math.tan(cam(k, CURF).fov * Math.PI / 360) * ASP;
const board = (f, f0, lines, pos, size, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'board', lines, pos, size: size * back(f0, f0 + 12, f) }); };
const sboard = (f, f0, lines, k, x, y, z, w, F2, f1) => board(f, f0, lines, SB(k, x, y, z), SW(k, w, z), F2, f1);
const burst = (f, f0, pos, size, F2, col = '#fff3b0', n = 12) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'burst', t: (f - f0) / n, pos, size, col, rays: 10 }); };
const sburst = (f, f0, k, x, y, z, w, F2, col, n) => burst(f, f0, SB(k, x, y, z), SW(k, w, z), F2, col, n);
const stars = (f, f0, k, x, y, z, w, F2, per = 30) => { if (f >= f0) F2.push({ fx: 'stars', t: ((f - f0) / per) % 1, pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 10, f) }); };
const qmark = (f, f0, k, x, y, z, w, F2) => { if (f >= f0) F2.push({ fx: 'qmark', pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 8, f) }); };
const stamp = (f, f0, lines, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) { const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos: SB(k, x, y, z), size: SW(k, w, z) * (1.6 - 0.6 * t * t), op: Math.min(1, t * 2) }); } };
const splash = (f, f0, pos, size, F2, tint = '#c8dcff', n = 18) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'splash', t: (f - f0) / n, pos, size, tint }); };
const wpuff = (f, f0, pos, size, F2, n = 16, tint) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'puff', t: (f - f0) / n, pos, size, tint }); };
const breath = (f, f0, f1, pos, F2, per = 40) => { if (f < f0 || f >= f1) return; const t = ((f - f0) % per) / per; if (t < 0.55) F2.push({ fx: 'puff', t: t / 0.55, pos: add3(pos, [0.04 * t, 0.06 * t, 0.02]), size: 0.18, tint: '#e8f0ff' }); };
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { sboard(f, 6, ["THE TITANIC'S", 'CHIEF BAKER'], 'hook', 0.0, 0.66, 1.2, 0.44, F2); breath(f, 4, 62, OC([0.06, 0.52, -1.42]), F2); }
  if (k === 'atlantic') { stamp(f, 74, ['FREEZING', 'ATLANTIC'], 'atlantic', 0.0, 0.58, 2.5, 0.46, F2); }
  if (k === 'drinking') { stamp(f, 131, ["...AND HE'D BEEN", 'DRINKING'], 'drinking', 0.0, 0.6, 0.6, 0.48, F2); }
  if (k === 'name') { sburst(f, 179, 'name', 0.0, 0.6, 1.4, 0.6, F2, '#fff3b0', 12); sboard(f, 176, ['CHARLES JOUGHIN', 'CHIEF BAKER'], 'name', 0.0, 0.64, 1.4, 0.5, F2); }
  if (k === 'iceberg') { sboard(f, 222, ['APRIL 14, 1912', '11:40 PM'], 'iceberg', 0.0, 0.62, 1.6, 0.42, F2); sburst(f, 243, 'iceberg', 0.0, 0.0, 1.6, 0.7, F2, '#d8e8ff', 12); }
  if (k === 'nopanic') { stamp(f, 273, ['NO', 'PANIC'], 'nopanic', 0.0, 0.66, 1.2, 0.36, F2); }
  if (k === 'bakers') { sboard(f, 308, ['13 BAKERS', 'TO THE LIFEBOATS'], 'bakers', 0.0, 0.64, 1.5, 0.5, F2); }
  if (k === 'loaves') { sburst(f, 374, 'loaves', 0.0, 0.1, 2.0, 0.5, F2, '#ffd890', 12); sboard(f, 376, ['4 LOAVES', 'EACH'], 'loaves', 0.0, 0.64, 1.5, 0.4, F2); }
  if (k === 'loading') { sboard(f, 455, ['WOMEN & CHILDREN', 'INTO THE BOATS'], 'loading', 0.0, 0.64, 1.6, 0.5, F2); }
  if (k === 'cabin') { sboard(f, 560, ['TO HIS', 'CABIN...'], 'cabin', 0.0, 0.64, 1.3, 0.4, F2); }
  if (k === 'liqueur') { sboard(f, 608, ['"A DROP OF', 'LIQUEUR"'], 'liqueur', 0.0, 0.7, 1.2, 0.46, F2); stars(f, 616, 'liqueur', 0.5, 0.3, 1.2, 0.22, F2, 26); }
  if (k === 'chairs') { sboard(f, 690, ['~50', 'DECK CHAIRS'], 'chairs', 0.0, 0.64, 1.6, 0.42, F2); for (const f0 of [672, 690, 708]) wpuff(f, f0, DK([1.2, 1.6, -2.3]), 0.5, F2, 12, '#e8ecff'); }
  if (k === 'float') { for (const [f0, x, z] of [[738, -0.8, -2.5], [752, 1.1, -3.4], [766, 0.2, -1.8]]) splash(f, f0, OC([x, 0.1, z]), 0.9, F2); sboard(f, 772, ['SOMETHING', 'TO FLOAT ON'], 'float', 0.0, 0.62, 2.4, 0.46, F2); }
  if (k === 'elevator') { sboard(f, 956, ['LIKE AN', 'ELEVATOR'], 'elevator', 0.0, 0.62, 3.0, 0.42, F2); if (f > 965) splash(f, 966, SP(f, [1.2, 0.3, -5.35]), 2.2, F2, '#c8dcff', 16); }
  if (k === 'wet') { splash(f, 988, OC([0.1, 0.05, -1.6]), 1.1, F2); sboard(f, 1018, ['HEAD BARELY WET', '(HE SAID)'], 'wet', 0.0, 0.62, 1.2, 0.48, F2); }
  if (k === 'hours') { sboard(f, 1076, ['2+ HOURS', 'IN THE WATER'], 'hours', 0.0, 0.62, 1.8, 0.44, F2, 1128); stamp(f, 1130, ['BELOW', 'FREEZING'], 'hours', 0.0, 0.6, 1.8, 0.4, F2); breath(f, 1045, 1150, OC([0.16, 0.5, -1.52]), F2, 44); }
  if (k === 'memorial') { sboard(f, 1166, ['1,500+ LIVES', 'LOST THAT NIGHT'], 'memorial', 0.0, 0.62, 4.0, 0.44, F2); }
  if (k === 'collapsible') { sboard(f, 1280, ['OVERTURNED', 'LIFEBOAT'], 'collapsible', 0.0, 0.62, 2.4, 0.42, F2); }
  if (k === 'hand') { sburst(f, 1329, 'hand', 0.0, -0.05, 1.8, 0.4, F2, '#fff3b0', 10); }
  if (k === 'pulled') { splash(f, 1380, OC([0.9, 0.1, -2.6]), 1.0, F2); sboard(f, 1376, ['PULLED', 'ABOARD'], 'pulled', 0.0, 0.62, 3.0, 0.4, F2); }
  if (k === 'injury') { sboard(f, 1408, ['HIS ONLY', 'INJURY?'], 'injury', 0.0, 0.62, 2.0, 0.42, F2); qmark(f, 1420, 'injury', 0.38, 0.32, 2.0, 0.1, F2); }
  if (k === 'feet') { stamp(f, 1446, ['SWOLLEN', 'FEET'], 'feet', 0.0, -0.3, 1.6, 0.42, F2); }
  if (k === 'save') { sboard(f, 1484, ['DID THE LIQUEUR', 'SAVE HIM?'], 'save', 0.0, 0.62, 0.8, 0.5, F2); qmark(f, 1509, 'save', 0.4, 0.25, 0.8, 0.1, F2); }
  if (k === 'doctors') { sboard(f, 1537, ['DOCTORS', 'SAY:'], 'doctors', 0.0, 0.64, 0.8, 0.36, F2, 1554); stamp(f, 1554, ['NO.'], 'doctors', 0.0, 0.6, 0.8, 0.34, F2); if (f >= 1554) F2.push({ fx: 'bigx', pos: CB([0.78, 0.86, -0.92]), size: 0.28 * back(1554, 1560, f) }); }
  if (k === 'heat') { for (let i = 0; i < 4; i++) { const ff = 1580 + i * 12; wpuff(f, ff, OC([0.1 + 0.12 * (i % 2 ? 1 : -1), 0.55 + 0.05 * i, -1.55]), 0.35, F2, 30, '#ff8a6a'); } sboard(f, 1590, ['ALCOHOL =', 'LOSE HEAT FASTER'], 'heat', 0.0, 0.62, 1.4, 0.48, F2); }
  if (k === 'luckiest') { sboard(f, 1676, ['THE LUCKIEST', 'BAKER IN HISTORY'], 'luckiest', 0.0, 0.62, 2.2, 0.48, F2); stars(f, 1684, 'luckiest', 0.0, 0.3, 2.2, 0.45, F2, 24); }
  if (k === 'end') { sboard(f, 1748, ['SURVIVED IN SPITE', 'OF HIS DRINK'], 'end', 0.0, 0.62, 1.6, 0.5, F2); sburst(f, 1775, 'end', 0.0, 0.62, 1.6, 0.6, F2, '#fff3b0', 12); sboard(f, 1790, ['1878 – 1956'], 'end', 0.0, -0.62, 1.6, 0.3, F2); }
  return F2;
}
