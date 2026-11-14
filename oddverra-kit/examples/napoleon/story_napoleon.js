// [NAP-story] "Napoleon wasn't short" timeline (58.2 s voice + tail, 1830 f @ 30 fps).
// Sets: napoleon_sets.js (tent / tentMap / helena / chart / shop / shopFog / parade / paradeLow / museum), driven through setAt.
// Pattern: story_joughin.js (slow push per shot, zoom-through whips on cuts, screen-pinned boards / stamps, punch-ins on punchlines).
// LITTLE BONEY (the cartoon Napoleon, kid build + giant hat) is the recurring gag: he hops off the paper, stomps on the map, climbs out of the museum frame.
import * as S from './story.js';
const { sm, eo, back, add3, dist, person } = S;

// [f0, f1, id, module, set]                      narration (word frames from work/words.json)
const SH = [
  [0, 64, 'hook', 'napoleon', 'tent'],              // Napoleon wasn't short.  (short 43)
  [64, 112, 'tricked', 'napoleon', 'shop'],         // You were tricked...  (tricked 72)
  [112, 151, 'cartoonist', 'napoleon', 'shop'],     // by a cartoonist.  (cartoonist 116)
  [151, 206, 'died', 'napoleon', 'helena'],         // When he died in 1821,  (1821 172)
  [206, 250, 'measured', 'napoleon', 'helena'],     // his doctor measured him:  (measured 224)
  [250, 288, 'fivetwo', 'napoleon', 'helena'],      // five foot two.  (five 253, two 264)
  [288, 316, 'tiny', 'napoleon', 'helena'],         // Tiny, right?  (tiny 290, right 298)
  [316, 392, 'french', 'napoleon', 'chart'],        // Except those were French feet and inches,  (French 346)
  [392, 470, 'longer', 'napoleon', 'chart'],        // and the French inch was longer than the British one.  (longer 420, British 443)
  [470, 520, 'convert', 'napoleon', 'chart'],       // Convert it, and Napoleon was about  (convert 478)
  [520, 570, 'fiveseven', 'napoleon', 'chart'],     // five foot seven.  (five 522, seven 541)
  [570, 668, 'average', 'napoleon', 'chart'],       // Average... maybe even a little tall for a Frenchman back then.  (average 577, tall 613)
  [668, 748, 'london', 'napoleon', 'shopFog'],      // So where did "short" come from? London.  (short 693, London 734)
  [748, 825, 'gillray', 'napoleon', 'shop'],        // A British cartoonist named James Gillray,  (Gillray 804)
  [825, 895, 'neversaw', 'napoleon', 'shopFog'],    // who never even saw Napoleon in person,  (never 831)
  [895, 955, 'drew', 'napoleon', 'shop'],           // drew him as a tiny,  (drew 901, tiny 926)
  [955, 1000, 'tantrum', 'napoleon', 'shop'],       // tantrum-throwing little man.
  [1000, 1036, 'boney', 'napoleon', 'shop'],        // "Little Boney."  (Little 1001, Boney 1007)
  [1036, 1085, 'loved', 'napoleon', 'shop'],        // And Britain loved it.  (loved 1050)
  [1085, 1150, 'guard', 'napoleon', 'parade'],      // It didn't help that Napoleon was often surrounded
  [1150, 1215, 'guard2', 'napoleon', 'parade'],     // by his Imperial Guard:  (imperial 1167)
  [1215, 1290, 'giants', 'napoleon', 'paradeLow'],  // giant soldiers in towering fur hats.  (giant 1219, towering 1243)
  [1290, 1365, 'corporal', 'napoleon', 'parade'],   // And his troops called him "the little corporal"...  (corporal 1343)
  [1365, 1440, 'affection', 'napoleon', 'parade'],  // but that was affection, not a measurement.  (affection 1382, measurement 1417)
  [1440, 1503, 'conquered', 'napoleon', 'tentMap'], // Napoleon conquered half of Europe.  (conquered 1457, Europe 1493)
  [1503, 1583, 'beat', 'napoleon', 'tent'],         // But he never beat the cartoon.  (never 1533, cartoon 1556)
  [1583, 1645, 'later', 'napoleon', 'museum'],      // Two hundred years later,  (two 1586)
  [1645, 1700, 'bossy', 'napoleon', 'museum'],      // we still call bossy short guys...  (bossy 1656)
  [1700, 1830, 'complex', 'napoleon', 'museum'],    // a "Napoleon complex."  (Napoleon 1702, complex 1717)
];
export const NF = 1830;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
const LIGHT = { tent: 'office', tentMap: 'office', helena: 'office', chart: 'office', shop: 'office', shopFog: 'office', museum: 'office', parade: 'day', paradeLow: 'day' };
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: LIGHT[s[4]], kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {}; // narrator not lip-synced
export const setAt = (f) => { const s = segAt(f); return [s[3], s[4]]; };

// ---------- places (local set coords -> world; origins from napoleon_sets.js) ----------
const at = (o) => (p) => [p[0] + o[0], p[1] + o[1], p[2] + o[2]];
const TN = at([-34000, 0, 0]), HE = at([-34000, 0, 800]), CH = at([-34000, 0, 1600]), SP = at([-34000, 0, 2400]), MU = at([-34000, 0, 3200]), PA = at([-36000, 0, 0]);

// ---------- cameras ----------
const C = (W, p, l, fov, cInf, fp) => ({ p: W(p), l: W(l), fov, cInf, fp: W(fp || l) });
const V = {
  hook: C(TN, [0.25, 1.45, 1.5], [-0.15, 1.25, -1.8], 48, 2.2, [-0.15, 1.2, -1.75]),
  tricked: C(SP, [0.85, 1.75, 0.15], [0.83, 1.0, -1.0], 46, 3, [0.83, 1.0, -0.98]),
  cartoonist: C(SP, [0.45, 1.5, 1.1], [0.95, 1.25, -1.5], 46, 2.6, [0.95, 1.2, -1.5]),
  died: C(HE, [0.35, 1.5, 2.1], [0.0, 0.85, -1.4], 50, 1.8, [0.1, 0.8, -1.2]),
  measured: C(HE, [0.05, 1.3, 1.35], [0.2, 0.85, -1.3], 50, 2.2, [0.2, 0.8, -1.1]),
  fivetwo: C(HE, [0.35, 1.25, 1.05], [0.45, 0.85, -1.2], 48, 2.6, [0.45, 0.8, -1.0]),
  tiny: C(HE, [1.15, 1.05, 0.25], [1.6, 0.92, -1.05], 44, 3.2, [1.6, 0.9, -1.0]),
  french: C(CH, [2.1, 1.3, 0.9], [2.3, 1.12, -0.8], 46, 2.6, [2.3, 1.1, -0.75]),
  longer: C(CH, [2.15, 1.3, 1.9], [2.15, 1.12, -0.9], 46, 2.4, [2.15, 1.1, -0.85]),
  convert: C(CH, [0.25, 1.25, 2.4], [0.15, 1.1, -2.0], 50, 1.8, [0.1, 1.0, -1.8]),
  fiveseven: C(CH, [0.15, 1.35, 2.3], [0.05, 1.25, -2.0], 46, 2.2, [0.0, 1.25, -1.8]),
  average: C(CH, [0.35, 1.3, 3.2], [0.15, 1.05, -2.0], 50, 1.6, [0.0, 1.0, -1.7]),
  london: C(SP, [-0.4, 1.5, 1.6], [-2.8, 1.4, -0.8], 50, 2, [-2.2, 1.4, -0.3]),
  gillray: C(SP, [0.35, 1.55, 2.2], [0.6, 1.25, -1.8], 50, 1.8, [0.95, 1.2, -1.5]),
  neversaw: C(SP, [-0.55, 1.45, 1.0], [-2.4, 1.35, -0.8], 48, 2.4, [-2.1, 1.35, -0.6]),
  drew: C(SP, [0.55, 1.6, 0.95], [0.95, 1.2, -1.3], 48, 2.6, [0.9, 1.1, -1.0]),
  tantrum: C(SP, [0.85, 1.48, -0.05], [0.84, 1.12, -1.0], 46, 3.4, [0.84, 1.15, -0.98]),
  boney: C(SP, [0.85, 1.5, 0.45], [0.84, 1.15, -1.0], 46, 3.0, [0.84, 1.12, -0.98]),
  loved: C(SP, [0.15, 1.5, 2.7], [0.0, 1.4, -2.5], 50, 1.6, [0.0, 1.2, -1.5]),
  guard: C(PA, [0.4, 1.6, 4.0], [0.0, 1.5, -4.0], 50, 1.4, [0.0, 1.3, -3.0]),
  guard2: C(PA, [0.25, 1.5, 0.6], [0.0, 1.55, -4.0], 50, 2.0, [0.0, 1.4, -3.0]),
  giants: C(PA, [0.4, 0.35, 0.6], [0.0, 2.0, -4.0], 52, 1.6, [0.0, 1.6, -3.4]),
  corporal: C(PA, [0.6, 1.5, 2.3], [0.0, 1.2, -3.2], 50, 2.0, [0.0, 1.1, -3.0]),
  affection: C(PA, [-0.5, 1.35, 0.4], [0.0, 1.25, -3.1], 46, 2.6, [0.0, 1.2, -3.0]),
  conquered: C(TN, [0.5, 1.6, 1.3], [-0.1, 1.15, -1.4], 50, 2.0, [-0.2, 1.1, -1.4]),
  beat: C(TN, [0.2, 1.45, 1.0], [0.05, 1.05, -1.5], 50, 2.4, [0.1, 1.0, -1.1]),
  later: C(MU, [0.2, 1.45, 2.6], [0.0, 1.35, -2.4], 52, 1.6, [0.0, 1.2, -0.6]),
  bossy: C(MU, [0.25, 1.45, 1.1], [0.75, 1.4, -2.4], 50, 2.2, [0.6, 1.3, -1.6]),
  complex: C(MU, [0.95, 1.5, 0.35], [1.0, 1.42, -2.4], 46, 3, [1.0, 1.4, -2.3]),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]]; return { ...v, p: add3(v.p, d.map((x) => x * k * t)) }; };
const PUSH = { giants: 0.03, guard2: 0.05, tantrum: 0.05, boney: 0.04 };
const base = (k) => V[k] || V.hook;
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.09, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f >= f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [k2 * Math.sin(f * 2.1), k2 * Math.sin(f * 2.7 + 1), 0]) }; };
  if (k === 'hook') { punch(43, 50, 0.14); kick(43, 0.03); }
  if (k === 'tricked') punch(72, 80, 0.08);
  if (k === 'cartoonist') punch(116, 124, 0.1);
  if (k === 'died') punch(172, 180, 0.05);
  if (k === 'fivetwo') { punch(264, 270, 0.12); kick(264, 0.02); }
  if (k === 'tiny') punch(298, 304, 0.1);
  if (k === 'french') punch(346, 352, 0.08);
  if (k === 'longer') punch(420, 428, 0.08);
  if (k === 'fiveseven') { punch(541, 548, 0.12); kick(541, 0.02); }
  if (k === 'average') punch(613, 620, 0.06);
  if (k === 'london') { punch(734, 741, 0.14); kick(734, 0.03); }
  if (k === 'gillray') punch(804, 812, 0.1);
  if (k === 'neversaw') punch(831, 838, 0.08);
  if (k === 'drew') punch(926, 932, 0.1);
  if (k === 'tantrum') shake(958, 990, 0.012);
  if (k === 'boney') { punch(1007, 1014, 0.08); kick(1007, 0.02); }
  if (k === 'loved') punch(1050, 1057, 0.08);
  if (k === 'guard2') punch(1167, 1175, 0.08);
  if (k === 'giants') { c = { ...c, roll: 0.03 }; punch(1243, 1252, 0.06); }
  if (k === 'corporal') punch(1343, 1350, 0.1);
  if (k === 'affection') punch(1382, 1390, 0.08);
  if (k === 'conquered') punch(1493, 1500, 0.08);
  if (k === 'beat') { punch(1556, 1563, 0.14); kick(1556, 0.03); }
  if (k === 'later') punch(1586, 1594, 0.04);
  if (k === 'bossy') punch(1656, 1663, 0.08);
  if (k === 'complex') { punch(1717, 1726, 0.14); kick(1717, 0.03); }
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
  for (const [c, a, n] of [[43, 0.5, 10], [116, 0.3, 8], [264, 0.4, 8], [541, 0.5, 10], [734, 0.4, 8], [1007, 0.5, 10], [1243, 0.3, 8], [1556, 0.5, 10], [1717, 0.6, 12]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state ----------
export function worldAt(f, w) {
  const k = segAt(f)[2], N = w.napoleon;
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  if (!N) return;
  N.tape(k === 'died' ? 0 : k === 'measured' ? sm(212, 246, f) : ['fivetwo', 'tiny'].includes(k) ? 1 : 0);
  N.bars(k === 'longer' ? sm(398, 450, f) : 0);
  const yMark = k === 'fiveseven' ? 0.9 + (1.69 - 0.9) * sm(522, 544, f) : 1.69;
  N.mark(yMark, k === 'fiveseven' || k === 'average' ? 1 : 0);
}

// ---------- actors ----------
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const hop = (f, i = 0, a = 0.04, sp = 0.35) => [0, a * Math.abs(Math.sin(f * sp + i)), 0];
const BONEY = (f, pos, opts = {}, extra = {}) => P(f, 'BONEY', 7, pos, { view: 'front', ...opts }, { s: 0.24, blob: false, ...extra });
const NAPS = 1.14; // Napoleon card scale (1.69 m on the chart)
const GS = 1.17 * 1.14;  // grenadier scale (tall men) - bearskins add the rest
export function actorsAt(f) {
  const k = segAt(f)[2], A = [];
  if (k === 'hook') A.push(P(f, 'NAPOLEON', 1, TN([-0.15, 0, -1.75]), { expr: f < 43 ? 'smug' : 'determined', cross: f < 43 ? 1 : 0, point: f >= 43 ? 1 : 0, reach: 0.8, view: 'front' }, { s: NAPS }));
  if (k === 'tricked') { const up = back(84, 98, f); if (f >= 84) A.push(BONEY(f, SP([0.83, 0.98 + 0.02 * up, -0.92]), { expr: f < 100 ? 'surprised' : 'angry', handsUp: f > 100 ? 1 : 0 }, { s: 0.2 * up + 0.001 })); }
  if (k === 'cartoonist' || k === 'gillray') A.push(P(f, 'CARTOONIST', 2, SP([1.0, 0, -1.6]), { expr: f < (k === 'gillray' ? 804 : 116) ? 'smile' : 'sly', prop: 'quill', reach: 0.8, raise: k === 'gillray' && f > 804 ? 1 : 0, view: '34L' }));
  if (k === 'gillray') A.push(BONEY(f, SP(add3([0.7, 1.0, -0.9], hop(f, 1, 0.03))), { expr: 'angry', handsUp: 1 }, { s: 0.2 }));
  if (k === 'died' || k === 'measured' || k === 'fivetwo') A.push(P(f, 'DOCTOR', 3, HE([0.55, 0, -1.8]), { expr: k === 'died' ? 'sad' : k === 'measured' ? 'thoughtful' : f < 264 ? 'thoughtful' : 'surprised', prop: k !== 'died' ? 'tape' : undefined, reach: 0.6, view: '34L' }));
  if (k === 'tiny') { const up = back(290, 302, f); A.push(BONEY(f, HE([1.62, 0.7, -1.05]), { expr: f < 298 ? 'smug' : 'angry', cross: f < 298 ? 1 : 0, handsUp: f >= 298 ? 1 : 0 }, { s: 0.24 * up + 0.001 })); }
  if (k === 'french') A.push(BONEY(f, CH(add3([2.3, 0.95, -0.75], hop(f, 2, 0.02))), { expr: f < 346 ? 'thoughtful' : 'surprised', point: 1, reach: 1, view: '34L' }, { s: 0.34 }));
  if (k === 'longer') A.push(BONEY(f, CH([2.48, 0.95, -0.6]), { expr: f < 420 ? 'surprised' : 'excited', point: 1, reach: 1, view: '34L' }, { s: 0.26 }));
  if (k === 'convert' || k === 'fiveseven') { const x = k === 'convert' ? 1.4 - 1.4 * sm(472, 512, f) : 0; A.push(P(f, 'NAPOLEON', 1, CH([x, 0, -1.8]), { expr: k === 'fiveseven' && f > 541 ? 'smug' : 'determined', view: k === 'convert' && f < 512 ? '34L' : 'front', cross: k === 'fiveseven' ? 1 : 0 }, { s: NAPS })); }
  if (k === 'average') { A.push(P(f, 'NAPOLEON', 1, CH([0, 0, -1.8]), { expr: f < 613 ? 'smile' : 'smug', cross: 1, view: 'front' }, { s: NAPS }));
    A.push(P(f, 'SOLDIER1', 21, CH([-0.8, 0, -1.6]), { expr: 'smile', view: '34R' }, { s: 0.97 * 1.12 })); A.push(P(f, 'SOLDIER2', 22, CH([0.8, 0, -1.6]), { expr: 'grin', view: '34L' }, { s: 0.96 * 1.12 }));
    A.push(P(f, 'SOLDIER1', 23, CH([-1.55, 0, -1.4]), { expr: 'happy', view: '34R' }, { s: 0.98 * 1.12 })); }
  if (k === 'london') A.push(P(f, 'CARTOONIST', 2, SP([-2.2, 0, -0.3]), { expr: f < 734 ? 'thoughtful' : 'sly', view: f < 734 ? '34BL' : '34R' }));
  if (k === 'neversaw') A.push(P(f, 'CARTOONIST', 2, SP([-2.05, 0, -0.5]), { expr: f < 838 ? 'thoughtful' : 'surprised', prop: 'telescope', raise: 1, reach: 0.9, view: 'sideL' }));
  if (k === 'drew') A.push(P(f, 'CARTOONIST', 2, SP([1.15, 0, -1.65]), { expr: f < 926 ? 'smile' : 'grin', prop: 'quill', reach: 0.95, view: '34L' }));
  if (k === 'tantrum' || k === 'boney') { const st = k === 'tantrum' ? Math.abs(Math.sin(f * 0.6)) * 0.03 : 0.01 * Math.abs(Math.sin(f * 0.8));
    A.push(BONEY(f, SP([0.83, 1.02 + st, -0.95]), { expr: 'angry', handsUp: (f >> 3) % 2, shake: 1, view: 'front' }, { s: k === 'boney' ? 0.22 : 0.2 })); }
  if (k === 'loved') { [['LONDON1', 31, -0.85, -1.55, 'laugh'], ['LONDON2', 32, 0.05, -1.45, 'laugh'], ['LONDON3', 33, 0.75, -1.3, 'grin']].forEach(([o, sd, x, z, e], i) => A.push(P(f, o, sd, SP(add3([x, 0, z], hop(f, i, 0.025, 0.5))), { expr: e, point: i === 2 ? 1 : 0, reach: 1, view: i === 0 ? '34R' : 'front' }))); }
  if (k === 'guard' || k === 'guard2' || k === 'giants') { const z0 = k === 'giants' ? -3.7 : -4.2;
    [-2.4, -1.6, -0.8, 0.8, 1.6, 2.4].forEach((x, i) => A.push(P(f, ['GREN1', 'GREN2', 'GREN3'][i % 3], 41 + i, PA([x, 0, z0 + (i % 2) * 0.12]), { expr: ['determined', 'smile', 'determined'][i % 3], prop: i % 2 ? 'musket' : undefined, reach: 0.3, view: x < 0 ? '34R' : '34L' }, { s: GS })));
    A.push(P(f, 'GREN2', 47, PA([0, 0, z0 - 0.5]), { expr: 'smile', view: 'front' }, { s: GS }));
    A.push(P(f, 'NAPOLEON', 1, PA([0, 0, z0 + 0.3]), { expr: k === 'giants' && f > 1243 ? 'nervous' : 'smug', cross: 1, view: 'front' }, { s: NAPS })); }
  if (k === 'corporal' || k === 'affection') {
    A.push(P(f, 'NAPOLEON', 1, PA([0, 0, -3.0]), { expr: k === 'affection' ? 'love' : 'happy', view: 'front', wave: k === 'corporal' && f > 1340 ? 0.8 : undefined }, { s: NAPS }));
    [['SOLDIER1', 51, -1.0, -2.6], ['SOLDIER2', 52, 1.0, -2.6], ['SOLDIER1', 53, -1.7, -3.4], ['SOLDIER2', 54, 1.7, -3.4]].forEach(([o, sd, x, z], i) => A.push(P(f, o, sd, PA(add3([x, 0, z], hop(f, i, 0.05))), { expr: i % 2 ? 'laugh' : 'excited', cheer: 1, view: x < 0 ? '34R' : '34L' }))); }
  if (k === 'conquered') A.push(P(f, 'NAPOLEON', 1, TN([-0.25, 0, -1.7]), { expr: f < 1493 ? 'determined' : 'smug', point: 1, reach: 1, view: '34R' }, { s: NAPS }));
  if (k === 'beat') { A.push(P(f, 'NAPOLEON', 1, TN([-0.15, 0, -1.75]), { expr: f < 1533 ? 'smug' : 'surprised', view: 'front', handsUp: f > 1556 ? 1 : 0 }, { s: NAPS }));
    const up = back(1515, 1530, f); if (f >= 1515) A.push(BONEY(f, TN(add3([0.35, 0.86, -0.75], hop(f, 3, 0.04, 0.6))), { expr: 'angry', handsUp: (f >> 3) % 2, shake: 1 }, { s: 0.26 * up + 0.001 })); }
  if (k === 'later') { A.push(P(f, 'KID', 61, MU([-0.45 + 0.2 * sm(1583, 1640, f), 0, -0.6]), { expr: 'smile', view: f < 1630 ? '34R' : 'front' }));
    A.push(P(f, 'GUIDE', 62, MU([0.5, 0, -1.0]), { expr: 'smile', point: 1, reach: 0.9, view: '34L' })); }
  if (k === 'bossy') A.push(P(f, 'KID', 61, MU([0.45, 0, -1.85]), { expr: f < 1656 ? 'smile' : 'laugh', point: 1, reach: 1, view: '34R' }));
  if (k === 'complex') { const up = back(1690, 1704, f);
    A.push(BONEY(f, MU(add3([1.0, 0.98, -2.15], f > 1704 ? hop(f, 4, 0.03, 0.5) : [0, 0, 0])), { expr: f < 1740 ? 'angry' : 'smug', handsUp: f < 1740 ? (f >> 3) % 2 : 0, cross: f >= 1740 ? 1 : 0, shake: f < 1740 ? 1 : 0 }, { s: 0.3 * up + 0.001 }));
    A.push(P(f, 'KID', 61, MU([0.2, 0, -0.55]), { expr: f < 1717 ? 'laugh' : 'surprised', view: '34R' })); }
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
const qmark = (f, f0, k, x, y, z, w, F2) => { if (f >= f0) F2.push({ fx: 'qmark', pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 8, f) }); };
const stamp = (f, f0, lines, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) { const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos: SB(k, x, y, z), size: SW(k, w, z) * (1.6 - 0.6 * t * t), op: Math.min(1, t * 2) }); } };
const puff = (f, f0, pos, size, F2, n = 14, tint) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'puff', t: (f - f0) / n, pos, size, tint }); };
export function fxAt(f) {
  const k = segAt(f)[2], F2 = []; CURF = f;
  if (k === 'hook') { sboard(f, 4, ['NAPOLEON', "WASN'T SHORT"], 'hook', 0.0, 0.64, 1.2, 0.5, F2); sburst(f, 43, 'hook', 0.35, 0.1, 1.2, 0.35, F2, '#fff3b0', 12); }
  if (k === 'tricked') { stamp(f, 72, ['YOU WERE', 'TRICKED'], 'tricked', 0.0, 0.6, 0.6, 0.5, F2); puff(f, 84, SP([0.83, 1.05, -0.95]), 0.3, F2, 14, '#fff6e0'); }
  if (k === 'cartoonist') sboard(f, 114, ['...BY A', 'CARTOONIST'], 'cartoonist', 0.0, 0.64, 1.0, 0.46, F2);
  if (k === 'died') sboard(f, 166, ['ST HELENA', '1821'], 'died', 0.0, 0.64, 1.4, 0.42, F2);
  if (k === 'measured') sboard(f, 222, ['THE DOCTOR', 'MEASURES HIM'], 'measured', 0.0, 0.64, 0.9, 0.48, F2);
  if (k === 'fivetwo') stamp(f, 263, ['5 FT 2 IN'], 'fivetwo', 0.0, 0.15, 0.7, 0.46, F2);
  if (k === 'tiny') { sboard(f, 290, ['TINY?'], 'tiny', 0.0, 0.62, 0.7, 0.32, F2); qmark(f, 298, 'tiny', 0.36, 0.25, 0.7, 0.1, F2); }
  if (k === 'french') { sboard(f, 340, ['FRENCH', 'FEET & INCHES'], 'french', 0.0, 0.64, 1.4, 0.48, F2); sburst(f, 346, 'french', 0.3, 0.15, 1.4, 0.35, F2, '#cfe0ff', 12); }
  if (k === 'longer') sboard(f, 416, ['FRENCH INCH', '= LONGER'], 'longer', 0.0, 0.64, 0.9, 0.48, F2);
  if (k === 'convert') sboard(f, 476, ['CONVERT IT...'], 'convert', 0.0, 0.66, 1.2, 0.44, F2);
  if (k === 'fiveseven') { stamp(f, 540, ['≈ 5 FT 7 IN', '(1.69 m)'], 'fiveseven', 0.0, 0.62, 1.0, 0.5, F2); sburst(f, 541, 'fiveseven', 0.3, 0.15, 1.0, 0.35, F2, '#fff3b0', 12); }
  if (k === 'average') { sboard(f, 574, ['AVERAGE', 'FOR HIS TIME'], 'average', 0.0, 0.66, 1.4, 0.48, F2, 610); sboard(f, 612, ['MAYBE EVEN', 'A LITTLE TALL'], 'average', 0.0, 0.66, 1.4, 0.5, F2); }
  if (k === 'london') { sboard(f, 690, ['WHERE DID', '"SHORT" COME FROM?'], 'london', 0.0, 0.66, 1.2, 0.5, F2, 732); stamp(f, 733, ['LONDON'], 'london', 0.0, 0.62, 1.2, 0.46, F2); }
  if (k === 'gillray') sboard(f, 800, ['JAMES GILLRAY', 'BRITISH CARTOONIST'], 'gillray', 0.0, 0.66, 1.4, 0.52, F2);
  if (k === 'neversaw') stamp(f, 836, ['NEVER SAW HIM', 'IN PERSON'], 'neversaw', 0.0, 0.62, 1.0, 0.5, F2);
  if (k === 'drew') { sboard(f, 922, ['TINY...'], 'drew', 0.0, 0.66, 0.8, 0.34, F2); for (const f0 of [900, 912, 924, 936]) puff(f, f0, SP([0.75 + (f0 % 7) * 0.02, 1.08, -0.95]), 0.08, F2, 10, '#3a2a40'); }
  if (k === 'tantrum') { sboard(f, 958, ['TANTRUM', 'MODE'], 'tantrum', 0.0, 0.66, 0.9, 0.4, F2); for (const f0 of [960, 972, 984]) puff(f, f0, SP([0.83 + ((f0 / 12) % 2 ? 0.06 : -0.06), 1.03, -0.92]), 0.12, F2, 12, '#fff2e0'); }
  if (k === 'boney') { stamp(f, 1003, ['"LITTLE', 'BONEY"'], 'boney', 0.0, 0.6, 0.6, 0.48, F2); sburst(f, 1007, 'boney', 0.0, 0.0, 0.6, 0.5, F2, '#fff3b0', 12); }
  if (k === 'loved') { sboard(f, 1046, ['BRITAIN', 'LOVED IT'], 'loved', 0.0, 0.66, 1.2, 0.46, F2); stars(f, 1052, 'loved', 0.0, 0.42, 1.2, 0.4, F2, 24); }
  if (k === 'guard') sboard(f, 1100, ['OFTEN', 'SURROUNDED BY...'], 'guard', 0.0, 0.66, 2.0, 0.5, F2);
  if (k === 'guard2') { sboard(f, 1163, ['THE IMPERIAL', 'GUARD'], 'guard2', 0.0, 0.66, 1.6, 0.46, F2); sburst(f, 1167, 'guard2', 0.3, 0.15, 1.6, 0.35, F2, '#fff3b0', 12); }
  if (k === 'giants') sboard(f, 1236, ['TALL MEN', '+ TALL FUR HATS'], 'giants', 0.0, -0.7, 1.2, 0.46, F2);
  if (k === 'corporal') sboard(f, 1338, ['"LE PETIT', 'CAPORAL"'], 'corporal', 0.0, 0.66, 1.4, 0.46, F2);
  if (k === 'affection') { stamp(f, 1380, ['AFFECTION,', 'NOT HEIGHT'], 'affection', 0.0, 0.62, 1.0, 0.5, F2); sburst(f, 1382, 'affection', 0.0, 0.1, 1.0, 0.6, F2, '#ffb0c8', 14); stars(f, 1386, 'affection', 0.0, 0.3, 1.0, 0.4, F2, 24); }
  if (k === 'conquered') sboard(f, 1455, ['CONQUERED', 'HALF OF EUROPE'], 'conquered', 0.0, -0.7, 0.9, 0.46, F2);
  if (k === 'beat') { sboard(f, 1534, ['...BUT NOT', 'THE CARTOON'], 'beat', 0.32, 0.66, 1.0, 0.48, F2); puff(f, 1515, TN([0.35, 0.95, -0.75]), 0.35, F2, 14, '#fff6e0'); sburst(f, 1556, 'beat', 0.3, 0.15, 1.0, 0.35, F2, '#fff3b0', 12); }
  if (k === 'later') sboard(f, 1588, ['200 YEARS', 'LATER'], 'later', 0.0, 0.66, 1.4, 0.42, F2);
  if (k === 'bossy') sboard(f, 1652, ['"BOSSY', 'SHORT GUYS..."'], 'bossy', 0.0, 0.66, 1.0, 0.5, F2);
  if (k === 'complex') { puff(f, 1690, MU([1.0, 1.1, -2.15]), 0.4, F2, 14, '#fff6e0'); stamp(f, 1716, ['"NAPOLEON', 'COMPLEX"'], 'complex', 0.0, 0.62, 0.9, 0.5, F2); sburst(f, 1717, 'complex', 0.3, 0.15, 0.9, 0.35, F2, '#fff3b0', 12);
    sboard(f, 1765, ['REAL HEIGHT:', '~1.69 m'], 'complex', 0.0, -0.7, 0.9, 0.38, F2); }
  return F2;
}
