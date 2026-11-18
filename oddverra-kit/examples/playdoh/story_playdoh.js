// [PD-story] "Play-Doh was invented to clean your walls" timeline (65.18 s voice, 1956 f @ 30 fps).
// Sets: doh_homes.js (parlor / home50 / classroom) and doh_works.js (factory / factoryBust / factoryNew / toystore / playroom), driven through setAt.
// Pattern: story_ketchup.js (slow push per shot, zoom-through whips on cuts, screen-pinned boards / bursts / stamps, punch-ins on punchlines).
// DOUGHY (dough-ball mascot) is the recurring sidekick: off-white -> sooty -> dusty and sad -> rainbow at the end. Narrator is not lip-synced.
import * as S from './story.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, module, set]                                    narration (word frames from work/words_frames.txt)
const SH = [
  [0, 68, 'hook', 'works', 'playroom'],          // Play-Doh was never supposed to be a toy.  (toy 50)
  [68, 147, 'invent', 'homes', 'parlor'],         // It was invented... to clean your walls.  (clean 106, walls 120)
  [147, 254, 'coal', 'homes', 'parlor'],          // In the 1930s, most American homes were heated with coal,  (1930s 154, coal 235)
  [254, 343, 'soot', 'homes', 'parlor'],          // and coal left black soot all over the wallpaper.  (soot 286)
  [343, 409, 'factory', 'works', 'factory'],      // So, a struggling soap company in Cincinnati  (Cincinnati 395)
  [409, 470, 'putty', 'works', 'factory'],        // sold a soft, doughy putty.  (doughy 439)
  [470, 512, 'roll', 'homes', 'parlor'],          // You rolled it across the wall,
  [512, 560, 'stick', 'homes', 'parlor'],         // and the soot stuck to it.  (stuck 531)
  [560, 628, 'crazy', 'works', 'factory'],        // For years, it sold like crazy.  (sold 586, crazy 601)
  [628, 672, 'problem', 'works', 'factoryBust'],  // Then came the problem.  (hard cut, music stop, thud 650)
  [672, 740, 'postwar', 'homes', 'home50'],       // After World War II, families switched to oil
  [740, 773, 'gas', 'homes', 'home50'],           // and gas heat.  (whoomp 747)
  [773, 802, 'nosoot', 'homes', 'home50'],        // No more soot.  (stamp 777)
  [802, 913, 'vinyl', 'homes', 'home50'],         // And new vinyl wallpaper? You could just wipe it with soap and water.  (wipe 859)
  [913, 962, 'nobody', 'homes', 'home50'],        // Nobody needed wall putty anymore.
  [962, 1014, 'trouble', 'works', 'factoryBust'], // The company was in trouble.  (sad trombone 982)
  [1014, 1123, 'kay', 'homes', 'classroom'],      // Then, the owner's sister-in-law, Kay Zufall, a nursery school teacher,  (Kay 1063)
  [1123, 1162, 'read', 'homes', 'classroom'],     // read that kids could make
  [1162, 1202, 'art', 'homes', 'classroom'],      // art with wallpaper cleaner.  (bulb 1162)
  [1202, 1256, 'tried', 'homes', 'classroom'],    // So she tried it in her classroom...
  [1256, 1304, 'loved', 'homes', 'classroom'],    // and the kids loved it!  (laughs 1265)
  [1304, 1385, 'told', 'works', 'factory'],       // She told him, stop selling it to clean walls,
  [1385, 1462, 'toy', 'works', 'factory'],        // sell it as a toy, and give it a better name.
  [1462, 1507, 'idea', 'homes', 'classroom'],     // Her idea? Play-Doh.  (chalk 1489)
  [1507, 1543, 'recipe', 'works', 'factoryNew'],  // They took out the detergent,  (X 1528)
  [1543, 1581, 'smell', 'works', 'factoryNew'],   // added a nicer smell,  (sniff 1562)
  [1581, 1657, 'store', 'works', 'toystore'],     // and in 1956, it hit stores.  (cash 1633)
  [1657, 1729, 'offwhite', 'works', 'toystore'],  // At first... it only came in off-white.  (punch 1700)
  [1729, 1805, 'colors', 'works', 'toystore'],    // A year later? Red, yellow, and blue.  (1757 / 1769 / 1787)
  [1805, 1877, 'kid', 'works', 'playroom'],       // So next time a kid squishes Play-Doh...  (squish 1838)
  [1877, 1956, 'end', 'works', 'playroom'],       // they're holding a wall cleaner from the 1930s.  (ting 1921)
];
export const NF = 1956;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
const LIGHT = { parlor: 'office', factory: 'office', factoryBust: 'office', factoryNew: 'office', home50: 'day', classroom: 'day', toystore: 'day', playroom: 'day' };
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: LIGHT[s[4]], kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {}; // narrator not lip-synced; characters don't talk
export const setAt = (f) => { const s = segAt(f); return [s[3], s[4]]; };

// ---------- places (local set coords -> world; origins from doh_homes.js / doh_works.js) ----------
const at = (o) => (p) => [p[0] + o[0], p[1] + o[1], p[2] + o[2]];
const PA = at([-19000, 0, 0]), K5 = at([-19000, 0, 600]), CL = at([-19000, 0, 1200]);
const FA = at([-21500, 0, 0]), TS = at([-21500, 0, 600]), PR = at([-21500, 0, 1200]);
// parlor stripe (doh_homes: SX0 -2.1 .. SX1 0.3, y 1.16..1.46, wall z -2.6)
const SX0 = -2.1, SX1 = 0.3, SYM = 1.31, PZB = -2.6;
const stripeT = (f) => { const s = segAt(f), k = s[2]; if (k === 'invent') return 0.06 + 0.36 * sm(76, 140, f); if (k === 'roll') return 0.45 + 0.32 * sm(470, 508, f); if (k === 'stick') return 0.77; return 0; };
const stripeX = (f) => SX0 + (SX1 - SX0) * stripeT(f);

// ---------- cameras ----------
const C = (W, p, l, fov, cInf, fp) => ({ p: W(p), l: W(l), fov, cInf, fp: W(fp || l) });
const V = {
  hook: C(PR, [-0.32, 0.76, 0.02], [-0.12, 0.58, -0.76], 40, 6, [-0.16, 0.56, -0.76]),
  invent: C(PA, [0.15, 1.45, 0.35], [-1.6, 1.25, -2.45], 48, 3, [-1.45, 1.2, -2.0]),
  coal: C(PA, [0.8, 1.55, 2.5], [0.3, 1.15, -2.6], 58, 1.6, [0.4, 1.0, -1.2]),
  soot: C(PA, [0.35, 1.0, 0.2], [0.95, 0.75, -1.88], 46, 3, [0.95, 0.7, -1.85]),
  factory: C(FA, [0.9, 1.9, 4.3], [-0.2, 1.75, -5.0], 56, 1.4, [0.2, 1.3, -1.6]),
  putty: C(FA, [1.25, 1.32, 0.45], [0.25, 1.0, -1.2], 46, 3.5, [0.45, 1.0, -1.2]),
  roll: C(PA, [-0.55, 1.38, -0.95], [-0.6, 1.32, -2.6], 44, 4, [-0.6, 1.31, -2.55]),
  stick: C(PA, [0.05, 1.4, -0.75], [-0.3, 1.25, -2.6], 48, 4, [-0.15, 1.2, -2.4]),
  crazy: C(FA, [-0.6, 1.55, 1.3], [3.4, 1.05, -1.7], 50, 2.5, [1.6, 1.0, -1.4]),
  problem: C(FA, [0.7, 1.6, 1.8], [0.1, 1.25, -5.0], 54, 2, [0.3, 1.0, -1.2]),
  postwar: C(K5, [0.35, 1.5, 2.4], [-0.1, 1.15, -2.4], 58, 1.6, [-0.4, 1.1, -1.4]),
  gas: C(K5, [1.45, 1.25, 0.2], [0.95, 0.55, -2.2], 52, 2.5, [0.9, 0.5, -1.7]),
  nosoot: C(K5, [0.25, 1.05, 0.45], [0.1, 1.15, -2.4], 50, 3, [0.15, 0.95, -0.62]),
  vinyl: C(K5, [-0.5, 1.35, -0.15], [-0.15, 1.25, -2.4], 50, 3, [-0.15, 1.25, -2.2]),
  nobody: C(K5, [0.85, 1.78, -1.05], [1.1, 1.86, -2.4], 42, 4, [1.05, 1.86, -2.26]),
  trouble: C(FA, [4.05, 1.55, -1.55], [3.4, 1.4, -4.2], 52, 3, [3.5, 1.4, -3.9]),
  kay: C(CL, [0.4, 1.7, 3.4], [-0.1, 1.15, -3.0], 54, 1.4, [0.1, 1.0, -1.6]),
  read: C(CL, [2.42, 1.45, -1.18], [2.58, 0.76, -1.82], 42, 5, [2.6, 0.76, -1.84]),
  art: C(CL, [1.25, 1.5, 0.35], [2.1, 1.38, -1.5], 46, 3, [2.0, 1.4, -1.3]),
  tried: C(CL, [-0.9, 1.45, 1.4], [-1.45, 0.8, -1.15], 54, 2.5, [-1.3, 0.7, -1.05]),
  loved: C(CL, [0.1, 1.25, 2.2], [0.1, 0.75, -1.2], 56, 2, [0.1, 0.8, -0.8]),
  told: C(FA, [3.6, 1.5, -0.3], [3.55, 1.3, -4.0], 52, 3, [3.5, 1.3, -3.2]),
  toy: C(FA, [2.7, 1.5, -0.8], [3.7, 1.3, -3.9], 52, 3, [3.5, 1.3, -3.2]),
  idea: C(CL, [-0.2, 1.62, 1.0], [-0.2, 1.6, -3.0], 46, 2, [-0.2, 1.62, -2.95]),
  recipe: C(FA, [-2.45, 1.5, 1.5], [-2.6, 1.1, -2.4], 50, 2.4, [-2.55, 1.0, -0.9]),
  smell: C(FA, [-1.9, 1.2, 1.9], [-2.2, 0.9, -2.4], 54, 2.4, [-2.1, 0.8, -0.6]),
  store: C(TS, [0.25, 1.5, 2.4], [0.0, 1.3, -2.4], 54, 1.6, [0.0, 1.0, -1.2]),
  offwhite: C(TS, [0.12, 1.32, -0.55], [0.0, 1.22, -2.4], 46, 4, [0.0, 1.2, -2.1]),
  colors: C(TS, [0.1, 1.4, 0.5], [0.0, 1.25, -2.4], 52, 4, [0.0, 1.25, -2.1]),
  kid: C(PR, [0.45, 1.12, 1.15], [0.05, 0.62, -0.95], 48, 2.2, [0.1, 0.6, -0.8]),
  end: C(PR, [0.22, 0.88, 0.5], [0.05, 0.78, -1.3], 50, 3, [0.05, 0.75, -0.8]),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]]; return { ...v, p: add3(v.p, d.map((x) => x * k * t)) }; };
const PUSH = { hook: 0.12, invent: 0.1, coal: 0.1, soot: 0.06, factory: 0.12, putty: 0.12, roll: 0.0, stick: 0.12, crazy: 0.08, problem: 0.1, postwar: 0.1, gas: 0.12, nosoot: 0.1, vinyl: 0.1, nobody: 0.14,
  trouble: 0.12, kay: 0.12, read: 0.14, art: 0.1, tried: 0.1, loved: 0.08, told: 0.1, toy: 0.1, idea: 0.06, recipe: 0.1, smell: 0.1, store: 0.12, offwhite: 0.1, colors: 0.08, kid: 0.12, end: -0.06 };
const base = (k) => V[k] || V.hook;
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const pan = (dx, dy, dz, f0, f1) => { const t = sm(f0, f1, f); c = { ...c, p: add3(c.p, [dx * t, dy * t, dz * t]), l: add3(c.l, [dx * t, dy * t, dz * t]), fp: add3(c.fp, [dx * t, dy * t, dz * t]) }; };
  if (k === 'hook') { punch(50, 56, 0.12); kick(50, 0.02); }
  if (k === 'invent') { pan(0.5, 0, 0, 76, 140); punch(106, 114, 0.16); kick(114, 0.03); }
  if (k === 'coal') kick(235, 0.06);
  if (k === 'soot') { c = { ...c, l: add3(c.l, [-0.6 * sm(262, 320, f), 1.25 * sm(262, 320, f), -0.7 * sm(262, 320, f)]), p: add3(c.p, [0, 0.4 * sm(262, 320, f), 0]) }; punch(286, 292, 0.08); }
  if (k === 'factory') punch(395, 402, 0.08);
  if (k === 'putty') { punch(439, 445, 0.1); kick(439, 0.02); }
  if (k === 'roll') { const x = stripeX(f) + 0.69; c = { ...c, p: add3(c.p, [x, 0, 0]), l: add3(c.l, [x, 0, 0]), fp: add3(c.fp, [x, 0, 0]) }; }
  if (k === 'stick') punch(531, 537, 0.12);
  if (k === 'crazy') { kick(586, 0.04); punch(601, 607, 0.1); }
  if (k === 'problem') { punch(650, 655, 0.12); kick(650, 0.04); }
  if (k === 'gas') { punch(747, 752, 0.1); kick(747, 0.03); }
  if (k === 'nosoot') { punch(777, 783, 0.18); kick(777, 0.03); }
  if (k === 'vinyl') punch(859, 866, 0.08);
  if (k === 'trouble') { punch(982, 990, 0.12); }
  if (k === 'kay') punch(1063, 1070, 0.12);
  if (k === 'art') { punch(1162, 1168, 0.1); }
  if (k === 'loved') { punch(1275, 1281, 0.08); kick(1275, 0.04); }
  if (k === 'told') punch(1337, 1343, 0.08);
  if (k === 'toy') punch(1388, 1394, 0.08);
  if (k === 'idea') { punch(1466, 1472, 0.04); punch(1489, 1496, 0.07); kick(1489, 0.03); }
  if (k === 'recipe') punch(1528, 1534, 0.08);
  if (k === 'smell') punch(1562, 1568, 0.1);
  if (k === 'store') { punch(1595, 1601, 0.08); kick(1633, 0.03); }
  if (k === 'offwhite') { punch(1700, 1708, 0.18); kick(1708, 0.03); }
  if (k === 'colors') { kick(1757, 0.03); kick(1769, 0.03); kick(1787, 0.03); }
  if (k === 'kid') punch(1838, 1846, 0.1);
  if (k === 'end') { punch(1915, 1925, 0.16); kick(1921, 0.03); }
  return c;
}
const HARD = new Set([628]); // hard cut into the music stop
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0; // white flashes on time jumps and big hits
  for (const [c, a, n] of [[68, 0.8, 10], [114, 0.5, 8], [343, 0.6, 10], [601, 0.4, 8], [672, 0.8, 10], [777, 0.5, 8], [1014, 0.7, 10], [1162, 0.4, 8], [1489, 0.6, 10], [1507, 0.5, 8], [1581, 0.8, 10], [1757, 0.3, 6], [1769, 0.3, 6], [1787, 0.3, 6], [1805, 0.7, 10], [1921, 0.4, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state ----------
export function worldAt(f, w) {
  const s = segAt(f), k = s[2], Hm = w.homes, Wk = w.works;
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  if (Hm) {
    Hm.soot(k === 'coal' ? 0.62 : k === 'soot' ? 0.62 + 0.38 * sm(266, 300, f) : 1);
    Hm.stripe(stripeT(f));
    Hm.wipe(k === 'vinyl' ? sm(848, 905, f) : 0);
    Hm.title(k === 'idea' ? sm(1489, 1503, f) : 0);
    Hm.shapes(k === 'tried' ? 0.08 + 0.5 * sm(1215, 1250, f) : k === 'loved' ? 0.58 + 0.42 * sm(1258, 1290, f) : k === 'kay' ? 0.3 : k === 'idea' ? 1 : 0);
  }
  if (Wk) {
    Wk.run(k === 'factory' ? 0.35 : k === 'putty' ? 0.6 : k === 'crazy' ? 2.2 : k === 'recipe' ? 0.6 : 0);
    Wk.chart(false, k === 'trouble' ? sm(966, 1004, f) : k === 'told' || k === 'toy' ? 1 : 0);
    Wk.colors(k === 'colors' ? sm(1755, 1764, f) : 0, k === 'colors' ? sm(1767, 1776, f) : 0, k === 'colors' ? sm(1785, 1794, f) : 0);
    Wk.squish(k === 'kid' ? sm(1836, 1866, f) : k === 'end' ? 1 : k === 'hook' ? 0 : 0);
  }
}

// ---------- actors ----------
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const DOH = (f, pos, opts = {}, extra = {}) => person(f, 'DOUGHY', 9, pos, { t: f, ...opts }, extra);
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
const hop = (f, i = 0, a = 0.06) => [0, a * Math.abs(Math.sin(f * 0.35 + i)), 0];
const KIDS = ['PD_KID1', 'PD_KID2', 'PD_KID3', 'PD_KID4'];

export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') A.push(DOH(f, PR([-0.2, 0.48, -0.8]), { expr: f < 30 ? 'happy' : f < 50 ? 'sly' : 'shock', pose: f < 30 ? 'wave' : f < 50 ? 'shrug' : undefined }, { s: 0.16, blob: false }));
  if (k === 'invent') { const x = stripeX(f); A.push(P(f, 'PD_HOMEMAKER', 21, PA([x + 0.62, 0, PZB + 0.42]), { expr: f < 106 ? 'smile' : 'happy', prop: 'doughball', sooty: 0.3 + 0.4 * sm(76, 140, f), reach: 0.95, view: 'sideL' }));
    A.push(DOH(f, PA([-0.3, 0, PZB + 1.25]), { expr: f < 110 ? 'smile' : 'shock', look: -1 }, { s: 0.42 })); }
  if (k === 'coal') {
    A.push(P(f, 'PD_HOMEMAKER', 21, PA([-0.45, 0, -1.95]), { expr: f < 235 ? 'smile' : 'shock', view: '34R' }));
    const cx = 1.7 - 0.6 * sm(160, 220, f); A.push(P(f, 'PD_COALMAN', 22, PA([cx, 0, -0.95]), { expr: f < 235 ? 'grin' : 'laugh', prop: 'coalsack', reach: 0.6, view: '34L' }));
    A.push(DOH(f, PA([0.35, 0, -0.75]), { expr: f < 238 ? 'smile' : 'eww', sooty: 0.6 * sm(238, 250, f) }, { s: 0.42 }));
  }
  if (k === 'soot') A.push(DOH(f, PA([0.35, 0, -1.3]), { expr: f < 286 ? 'shock' : 'eww', sooty: 0.6, look: 1 }, { s: 0.42 }));
  if (k === 'factory') {
    A.push(P(f, 'PD_WORKER1', 31, FA([-0.6, 0, -2.1]), { expr: 'worried', prop: 'wpcan', reach: 0.6, view: '34R' }));
    A.push(P(f, 'PD_WORKER2', 32, FA([1.6, 0, -2.0]), { expr: 'bored', cross: 1, view: '34L' }));
  }
  if (k === 'putty') {
    A.push(DOH(f, FA(add3([0.42, 0.92, -1.2], [0, 0.04 * Math.max(0, Math.sin((f - 430) * 0.3)) * (f > 430 && f < 452 ? 1 : 0), 0])), { expr: f < 439 ? 'smile' : 'happy', pose: f < 439 ? 'stand' : 'cheer' }, { s: 0.2, blob: false }));
    A.push(P(f, 'PD_WORKER1', 31, FA([0.7, 0, -2.0]), { expr: 'smile', prop: 'wpcan', reach: 0.7, view: '34L' }));
  }
  if (k === 'roll') { const x = stripeX(f), r = 0.15; A.push(DOH(f, PA([x + r * 0.6, SYM - 0.155, PZB + 0.16]), { expr: 'dizzy', pose: 'curl', spin: (x - SX0) / r }, { s: 0.54, blob: false })); }
  if (k === 'stick') A.push(DOH(f, PA([stripeX(f) + 0.12, SYM - 0.42, PZB + 0.2]), { expr: f < 528 ? 'smile' : 'eww', sooty: sm(518, 540, f), pose: f < 528 ? 'stand' : 'shrug' }, { s: 0.36, blob: false }));
  if (k === 'crazy') {
    A.push(P(f, 'PD_WORKER1', 31, FA(add3([1.1, 0, -2.05], hop(f, 1))), { expr: 'laugh', cheer: wav(f, 1), view: '34R' }));
    A.push(P(f, 'PD_WORKER2', 32, FA(add3([2.4, 0, -2.2], hop(f, 2))), { expr: 'excited', prop: 'wpcan', raise: 1, reach: 0.8, view: '34L' }));
    A.push(DOH(f, FA(add3([0.35, 0, -0.55], hop(f, 3, 0.05))), { expr: 'triumph' }, { s: 0.42 }));
  }
  if (k === 'problem') A.push(DOH(f, FA([0.3, 0.92, -1.2]), { expr: f < 650 ? 'smile' : 'shock' }, { s: 0.3, blob: false }));
  if (k === 'postwar') {
    A.push(P(f, 'PD_MOM50', 41, K5([-0.5, 0, -1.3]), { expr: 'happy', view: '34R', wave: f > 700 ? wav(f, 2) : undefined }));
    A.push(DOH(f, K5([0.55, 0.78, -0.7]), { expr: 'smile', pose: 'wave' }, { s: 0.22, blob: false }));
  }
  if (k === 'gas') A.push(DOH(f, K5([0.98, 0, -1.35]), { expr: f < 747 ? 'smile' : 'happy', pose: f < 747 ? 'stand' : 'cheer' }, { s: 0.36 }));
  if (k === 'nosoot') A.push(DOH(f, K5([0.15, 0.78, -0.62]), { expr: f < 777 ? 'smile' : 'shock' }, { s: 0.3, blob: false }));
  if (k === 'vinyl') A.push(P(f, 'PD_MOM50', 41, K5(add3([-0.02, 0, -2.12], [0.12 * Math.sin(Math.max(0, f - 848) * 0.35) * (f < 905 ? 1 : 0), 0, 0])), { expr: f < 860 ? 'smile' : 'happy', prop: 'sponge', reach: 0.98, suds: sm(848, 870, f), view: 'sideL' }));
  if (k === 'nobody') A.push(DOH(f, K5([1.24, 1.76, -2.2]), { expr: 'sad' }, { s: 0.16, blob: false }));
  if (k === 'trouble') { A.push(P(f, 'PD_OWNER', 51, FA([3.85, 0, -3.75]), { expr: f < 982 ? 'worried' : 'nervous', view: '34L', handsUp: f > 990 ? 1 : 0 })); A.push(DOH(f, FA([2.75, 0, -3.0]), { expr: 'sad' }, { s: 0.3 })); }
  if (k === 'kay' || k === 'loved' || k === 'tried') {
    const cheer = k === 'loved';
    const KP = cheer ? [[-0.55, -0.35], [-0.4, -1.75], [0.45, -1.45], [0.62, -0.2]] : [[-1.85, -0.6], [-0.75, -1.65], [0.7, -1.2], [1.85, -0.35]];
    KP.forEach(([x, z], i) => A.push(P(f, KIDS[i], 60 + i, CL(add3([x, 0, z], cheer ? hop(f, i, 0.05) : [0, 0, 0])), cheer ? { expr: i % 2 ? 'laugh' : 'excited', prop: i % 2 ? 'dshape' : 'doughball', raise: 1, reach: 0.85, dcol: 'white' } : { expr: k === 'tried' ? 'surprised' : ['happy', 'smile', 'excited', 'smile'][i], prop: k === 'tried' && i < 2 ? 'doughball' : undefined, reach: 0.7 }, { s: 0.72 })));
    if (k === 'kay') A.push(P(f, 'PD_KAY', 70, CL([0.1, 0, -2.3]), { expr: f < 1063 ? 'smile' : 'happy', wave: f > 1063 && f < 1100 ? wav(f, 0) : undefined, view: 'front' }));
    if (k === 'tried') A.push(P(f, 'PD_KAY', 70, CL([-2.05, 0, -1.75]), { expr: 'happy', prop: 'wpcan', open: 1, reach: 0.9, view: '34R' }));
    if (k === 'loved') A.push(DOH(f, CL(add3([0.05, 0, 0.45], hop(f, 4, 0.05))), { expr: 'triumph' }, { s: 0.36 }));
  }
  if (k === 'art') A.push(P(f, 'PD_KAY', 70, CL([2.05, 0, -1.4]), { expr: f < 1162 ? 'thoughtful' : 'excited', prop: 'clipping', reach: 0.85, view: '34L' }));
  if (k === 'told') { A.push(P(f, 'PD_KAY', 70, FA([3.0, 0, -3.15]), { expr: 'determined', point: 1, view: '34R' })); A.push(P(f, 'PD_OWNER', 51, FA([4.2, 0, -3.4]), { expr: f < 1337 ? 'worried' : 'surprised', view: '34L' })); }
  if (k === 'toy') { A.push(P(f, 'PD_KAY', 70, FA([3.0, 0, -3.15]), { expr: 'excited', prop: 'pdcan', dcol: 'white', open: 1, reach: 0.9, view: '34R' })); A.push(P(f, 'PD_OWNER', 51, FA([4.2, 0, -3.4]), { expr: f < 1430 ? 'thoughtful' : 'happy', view: '34L' })); }
  if (k === 'idea') A.push(P(f, 'PD_KAY', 70, CL([1.35, 0, -2.5]), { expr: f < 1489 ? 'smile' : 'excited', prop: 'chalk', point: f > 1489 ? 1 : 0, reach: 0.9, view: '34L' }));
  if (k === 'recipe') A.push(P(f, 'PD_WORKER1', 31, FA([-2.55 - 0.25 * sm(1530, 1543, f), 0, -0.9]), { expr: f < 1528 ? 'smile' : 'grin', prop: 'detergent', reach: 0.75, view: '34R' }));
  if (k === 'smell') { A.push(P(f, 'PD_WORKER2', 32, FA([-2.45, 0, -0.85]), { expr: f < 1556 ? 'smile' : 'happy', prop: 'scent', raise: f > 1550 ? 1 : 0, reach: 0.8, view: '34R' }));
    A.push(DOH(f, FA([-1.78, 0, -0.3]), { expr: f < 1558 ? 'smile' : 'love', pose: f < 1558 ? 'stand' : 'cheer' }, { s: 0.4 })); }
  if (k === 'store') {
    A.push(P(f, 'PD_KID1', 60, TS(add3([-0.55, 0, -1.15], f > 1633 ? hop(f, 1, 0.05) : [0, 0, 0])), { expr: 'excited', point: 1, view: '34L' }, { s: 0.8 }));
    A.push(P(f, 'PD_KID3', 62, TS(add3([0.65, 0, -1.0], f > 1633 ? hop(f, 2, 0.05) : [0, 0, 0])), { expr: f < 1633 ? 'surprised' : 'laugh', cheer: f > 1633 ? wav(f, 2) : undefined, view: '34R' }, { s: 0.8 }));
  }
  if (k === 'offwhite') A.push(DOH(f, TS([0.2, 1.05, -2.08]), { expr: f < 1700 ? 'smile' : 'sly', pose: f < 1700 ? 'stand' : 'shrug' }, { s: 0.2, blob: false }));
  if (k === 'colors') A.push(DOH(f, TS(add3([0.2, 1.05, -2.0], f > 1790 ? hop(f, 0, 0.03) : [0, 0, 0])), { expr: f < 1790 ? 'shock' : 'triumph', dcol: f < 1790 ? 'white' : 'rainbow' }, { s: 0.2, blob: false }));
  if (k === 'kid' || k === 'end') {
    const e = k === 'end';
    A.push(P(f, 'PD_MODERN_KID', 80, PR([0.12, 0, -1.48]), { expr: f < 1838 ? 'happy' : e && f > 1915 ? 'surprised' : 'laugh', prop: 'doughball', dcol: 'red', big: 1, squish: k === 'kid' ? Math.sin(Math.PI * sm(1838, 1858, f)) * 0.7 : 0.3, raise: e ? 1 : 0, reach: 0.9, view: 'front' }));
    A.push(DOH(f, PR([e ? 0.06 : -0.1, 0.48, -0.3]), e ? { expr: f < 1915 ? 'happy' : 'sly', dcol: 'rainbow', pose: f < 1915 ? 'wave' : 'hips' } : { expr: 'happy', dcol: 'rainbow', pose: 'cheer' }, { s: 0.18, blob: false }));
  }
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
const notes = (f, f0, f1, k, x, y, z, F2, col = '#c0453a') => { if (f < f0 || f >= f1) return; for (let i = 0; i < 3; i++) { const u = ((f - f0) / 24 + i / 3) % 1; F2.push({ fx: 'note', kind: i % 2, pos: SB(k, x + 0.25 * (i - 1), y + u * 0.35, z), size: SW(k, 0.1, z), op: 0.95 * (1 - u), col }); } };
const qmark = (f, f0, k, x, y, z, w, F2) => { if (f >= f0) F2.push({ fx: 'qmark', pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 8, f) }); };
const bubble = (f, f0, lines, tail, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'bubble', lines, tail, pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 8, f) }); };
const puff = (f, f0, k, x, y, z, w, F2, n = 14) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'puff', t: (f - f0) / n, pos: SB(k, x, y, z), size: SW(k, w, z) }); };
const wpuff = (f, f0, pos, size, F2, n = 16, tint) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'puff', t: (f - f0) / n, pos, size, tint }); };
const stamp = (f, f0, lines, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) { const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos: SB(k, x, y, z), size: SW(k, w, z) * (1.6 - 0.6 * t * t), op: Math.min(1, t * 2) }); } };
const bubbles = (f, f0, f1, k, x, y, z, w, F2) => { if (f >= f0 && f < f1) F2.push({ fx: 'bubbles', t: ((f - f0) / 40) % 1, seed: 3, pos: SB(k, x, y, z), size: SW(k, w, z) }); };
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { stars(f, 8, 'hook', 0.1, 0.35, 0.6, 0.3, F2, 26); sboard(f, 34, ['PLAY-DOH?', 'NOT A TOY?!'], 'hook', 0.0, 0.6, 0.6, 0.44, F2); sburst(f, 50, 'hook', 0.0, 0.6, 0.6, 0.5, F2, '#fff3b0', 12); }
  if (k === 'invent') { sburst(f, 114, 'invent', 0.0, 0.5, 2.0, 0.7, F2, '#fff3b0', 14); sboard(f, 108, ['INVENTED', 'TO CLEAN WALLS!'], 'invent', 0.0, 0.6, 2.0, 0.5, F2); }
  if (k === 'coal') { sboard(f, 156, ['THE', '1930s'], 'coal', -0.42, 0.62, 3, 0.36, F2); if (f >= 236 && f < 256) F2.push({ fx: 'puff', t: (f - 236) / 20, pos: PA([1.2, 0.8, -1.2]), size: 1.4, tint: '#5a5260' }); }
  if (k === 'soot') { for (const [f0, x] of [[264, 0.02], [280, -0.08], [298, 0.06]]) if (f >= f0 && f < f0 + 26) F2.push({ fx: 'puff', t: (f - f0) / 26, pos: PA([0.95 + x, 1.25 + (f - f0) * 0.03, -2.2]), size: 0.9, tint: '#4a4450' }); sboard(f, 288, ['COAL HEAT', '= SOOT'], 'soot', 0.0, 0.6, 1.6, 0.46, F2); }
  if (k === 'factory') { sboard(f, 352, ['STRUGGLING', 'SOAP COMPANY'], 'factory', -0.35, 0.62, 3, 0.4, F2); sboard(f, 395, ['CINCINNATI,', 'OHIO'], 'factory', 0.35, 0.38, 3, 0.38, F2); }
  if (k === 'putty') { sburst(f, 439, 'putty', -0.1, 0.0, 1.3, 0.5, F2, '#ffffff', 10); sboard(f, 452, ['WALLPAPER', 'CLEANER'], 'putty', 0.0, 0.6, 1.3, 0.48, F2); }
  if (k === 'roll') { for (let i = 0; i < 3; i++) { const ff = 474 + i * 12; if (f >= ff && f < ff + 18) F2.push({ fx: 'puff', t: (f - ff) / 18, pos: PA([stripeX(ff) + 0.05, SYM + 0.12, PZB + 0.12]), size: 0.28, tint: '#4a4450' }); } sboard(f, 478, ['ROLL IT', 'ACROSS THE WALL'], 'roll', 0.0, 0.6, 1.3, 0.46, F2); }
  if (k === 'stick') { sburst(f, 531, 'stick', 0.1, 0.0, 1.2, 0.45, F2, '#ffffff', 10); sboard(f, 534, ['THE SOOT', 'STUCK TO IT!'], 'stick', 0.0, 0.6, 1.2, 0.46, F2); }
  if (k === 'crazy') { sburst(f, 601, 'crazy', 0.0, 0.45, 2.5, 0.8, F2, '#fff3b0', 14); sboard(f, 598, ['SOLD', 'LIKE CRAZY!'], 'crazy', 0.0, 0.6, 2.5, 0.48, F2); stars(f, 603, 'crazy', 0.0, 0.3, 2.5, 0.5, F2, 24); if (f >= 586) { const t = ((f - 586) / 20) % 1; F2.push({ fx: 'note', kind: 0, pos: SB('crazy', -0.4, 0.15 + t * 0.2, 2.5), size: SW('crazy', 0.1, 2.5), op: 1 - t, col: '#3a8a4a' }); } }
  if (k === 'problem') { sboard(f, 640, ['THEN CAME', 'THE PROBLEM...'], 'problem', 0.0, 0.55, 3, 0.46, F2); qmark(f, 650, 'problem', 0.4, 0.2, 3, 0.12, F2); }
  if (k === 'postwar') { sboard(f, 680, ['AFTER', 'WWII'], 'postwar', -0.4, 0.62, 3, 0.36, F2); sboard(f, 724, ['OIL & GAS', 'HEAT'], 'postwar', 0.38, 0.4, 3, 0.36, F2); }
  if (k === 'gas') { sburst(f, 747, 'gas', 0.0, -0.1, 1.4, 0.6, F2, '#c8d8ff', 12); }
  if (k === 'nosoot') { stamp(f, 777, ['NO MORE', 'SOOT'], 'nosoot', 0.0, 0.5, 1.4, 0.5, F2); stars(f, 780, 'nosoot', 0.0, 0.1, 1.4, 0.4, F2, 24); }
  if (k === 'vinyl') { sboard(f, 810, ['NEW VINYL', 'WALLPAPER'], 'vinyl', 0.0, 0.62, 1.2, 0.44, F2, 856); sboard(f, 858, ['JUST WIPE IT', 'SOAP + WATER'], 'vinyl', 0.0, 0.62, 1.2, 0.44, F2); bubbles(f, 850, 913, 'vinyl', 0.1, -0.1, 1.2, 0.3, F2); }
  if (k === 'nobody') { sboard(f, 920, ['NOBODY', 'NEEDED IT'], 'nobody', 0.0, 0.6, 1.1, 0.44, F2); if (f >= 940 && f < 960) F2.push({ fx: 'puff', t: (f - 940) / 20, pos: K5([0.95, 2.0, -2.2]), size: 0.3, tint: '#c8c0b0' }); }
  if (k === 'trouble') { sboard(f, 972, ['SALES:', 'WAY DOWN'], 'trouble', 0.0, 0.62, 1.3, 0.42, F2); }
  if (k === 'kay') { sboard(f, 1022, ["THE OWNER'S", 'SISTER-IN-LAW'], 'kay', 0.0, 0.62, 3, 0.44, F2, 1060); sburst(f, 1063, 'kay', 0.0, 0.5, 3, 0.6, F2, '#fff3b0', 12); sboard(f, 1063, ['KAY ZUFALL', 'NURSERY TEACHER'], 'kay', 0.0, 0.62, 3, 0.46, F2); }
  if (k === 'art') { if (f >= 1162) F2.push({ fx: 'bulb', t: ((f - 1162) / 30) % 1, pos: SB('art', -0.05, 0.42, 1.8), size: SW('art', 0.14, 1.8) * back(1162, 1170, f) }); sboard(f, 1170, ['KIDS + WALLPAPER', 'CLEANER = ART?'], 'art', 0.0, 0.66, 1.8, 0.48, F2); }
  if (k === 'tried') sboard(f, 1214, ['SHE TRIED IT', 'IN CLASS'], 'tried', 0.0, 0.62, 1.4, 0.44, F2);
  if (k === 'loved') { sburst(f, 1275, 'loved', 0.0, 0.5, 2.2, 0.7, F2, '#fff3b0', 14); sboard(f, 1276, ['THE KIDS', 'LOVED IT!'], 'loved', 0.0, 0.62, 2.2, 0.46, F2); stars(f, 1278, 'loved', 0.0, 0.32, 2.2, 0.5, F2, 24); }
  if (k === 'told') { bubble(f, 1312, ['STOP SELLING IT', 'TO CLEAN WALLS!'], -1, 'told', -0.15, 0.48, 1.6, 0.5, F2); }
  if (k === 'toy') { bubble(f, 1386, ['SELL IT', 'AS A TOY!'], 1, 'toy', 0.2, 0.5, 1.6, 0.42, F2, 1428); bubble(f, 1428, ['AND GIVE IT', 'A BETTER NAME!'], 1, 'toy', 0.2, 0.5, 1.6, 0.48, F2); }
  if (k === 'idea') { sburst(f, 1489, 'idea', 0.0, 0.0, 1.6, 0.8, F2, '#fff3b0', 14); sboard(f, 1464, ['HER IDEA:', f < 1489 ? '...?' : 'PLAY-DOH'], 'idea', 0.0, 0.66, 1.6, 0.46, F2); stars(f, 1492, 'idea', 0.0, -0.2, 1.6, 0.5, F2, 24); }
  if (k === 'recipe') { sboard(f, 1512, ['TOOK OUT', 'THE DETERGENT'], 'recipe', 0.0, 0.64, 2.2, 0.44, F2); if (f >= 1528) F2.push({ fx: 'bigx', pos: FA([-2.55 - 0.25 * sm(1530, 1543, f) - 0.4, 1.3, -0.72]), size: 0.4 * back(1528, 1534, f) }); }
  if (k === 'smell') { sboard(f, 1550, ['A NICER', 'SMELL'], 'smell', 0.0, 0.64, 1.9, 0.4, F2); for (let i = 0; i < 3; i++) { const u = ((f - 1550) / 26 + i / 3) % 1; if (f >= 1550) F2.push({ fx: 'note', kind: i % 2, pos: FA([-2.25 + 0.15 * (i - 1) + u * 0.25, 1.6 + u * 0.35, -0.7]), size: 0.14, op: 0.95 * (1 - u), col: '#e86aa0' }); } }
  if (k === 'store') { sburst(f, 1595, 'store', 0.0, 0.55, 3, 0.6, F2, '#fff3b0', 12); sboard(f, 1593, ['1956:', 'IN STORES'], 'store', 0.0, 0.62, 3, 0.42, F2); }
  if (k === 'offwhite') { sboard(f, 1700, ['ONLY', 'OFF-WHITE'], 'offwhite', 0.0, 0.62, 1.2, 0.44, F2); qmark(f, 1712, 'offwhite', 0.42, 0.15, 1.2, 0.1, F2); }
  if (k === 'colors') { sboard(f, 1740, ['1957:', 'RED · YELLOW · BLUE'], 'colors', 0.0, 0.62, 1.4, 0.5, F2); for (const [f0, c, x] of [[1757, '#ff8a7a', -0.4], [1769, '#ffe680', 0.0], [1787, '#8ab4ff', 0.4]]) sburst(f, f0, 'colors', x, -0.05, 1.4, 0.35, F2, c, 10); stars(f, 1792, 'colors', 0.1, 0.2, 1.4, 0.4, F2, 24); }
  if (k === 'kid') { if (f >= 1838 && f < 1856) F2.push({ fx: 'splash', t: (f - 1838) / 18, pos: SB('kid', 0.0, -0.1, 1.9), size: SW('kid', 0.22, 1.9), tint: '#ff7a6a' }); sboard(f, 1812, ['NEXT TIME', 'A KID SQUISHES IT...'], 'kid', 0.0, 0.64, 1.9, 0.46, F2); }
  if (k === 'end') { sboard(f, 1898, ['A WALL CLEANER', 'FROM THE 1930s!'], 'end', 0.0, 0.62, 1.4, 0.5, F2); sburst(f, 1921, 'end', 0.0, 0.62, 1.4, 0.6, F2, '#fff3b0', 12); stars(f, 1924, 'end', 0.0, -0.35, 1.4, 0.45, F2, 20); }
  return F2;
}
