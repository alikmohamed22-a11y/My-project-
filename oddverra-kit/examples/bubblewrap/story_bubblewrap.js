// [BW-story] "Bubble Wrap was supposed to go on your walls" timeline (62.87 s voice, 1887 f @ 30 fps).
// Sets: bw_sets.js (garage / living / green / factory / computer / modern), driven through setAt. Pattern: story_hollywood.js (slow push per
// shot, zoom-through whips on cuts, screen-pinned boards / bursts / stamps, punch-ins on punchlines). POPPY (a single bubble) is the sidekick.
import * as S from './story.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]                                       narration (word frames from work/words_frames.txt)
const SH = [
  [0, 56, 'hook', 'living'],          // Bubble Wrap was supposed to go  (go 43)
  [56, 97, 'walls', 'living'],        // on your walls.  (walls 57)
  [97, 164, 'y1957', 'garage'],       // In 1957, in New Jersey,  (1957 99, Jersey 143)
  [164, 216, 'eng1', 'garage'],       // two engineers, Alfred Fielding  (engineers 168, Alfred 196)
  [216, 248, 'eng2', 'garage'],       // and Marc Chavannes,  (Marc 222)
  [248, 328, 'seal', 'garage'],       // sealed two plastic shower curtains together.  (curtains 291, together 302)
  [328, 364, 'idea', 'garage'],       // Their big idea?  (idea 337)
  [364, 411, 'paper', 'garage'],      // Textured wallpaper!  (wallpaper 372)
  [411, 438, 'modern', 'living'],     // Modern!  (411)
  [438, 473, 'bubbly', 'living'],     // Bubbly!  (438)
  [473, 523, 'nobody', 'livingNo'],   // Nobody bought it.  (hard cut, music stop)
  [523, 569, 'again', 'green'],       // So they tried again.
  [569, 614, 'greenhouse', 'green'],  // Greenhouse insulation.  (569)
  [614, 664, 'warm', 'green'],        // Bubbles to keep the plants warm.
  [664, 713, 'flopped', 'greenFlop'], // That flopped too.  (flopped 671)
  [713, 750, 'two', 'garage'],        // Two failures.  (719)
  [750, 804, 'company', 'factory'],   // They started a company anyway,
  [804, 861, 'sealedair', 'factory'], // Sealed Air, in 1960,  (Sealed 804, 1960 827)
  [861, 918, 'hunting', 'factory'],   // and kept hunting for a use.
  [918, 1003, 'ibm', 'computer'],     // Then IBM launched a new computer:  (IBM 931, computer 976)
  [1003, 1047, 'y1401', 'computer'],  // the 1401.  (1003)
  [1047, 1102, 'delicate', 'computer'], // Big, delicate,  (Big 1047, delicate 1063)
  [1102, 1150, 'ship', 'computer'],   // and it had to be shipped all over the country.  (shipped 1102)
  [1150, 1206, 'protect', 'computer'], // How do you protect a computer?
  [1206, 1258, 'wrapit', 'computer'], // You wrap it in bubbles!  (bubbles 1226)
  [1258, 1359, 'customer', 'computer'], // IBM became Bubble Wrap's first big packaging customer,  (customer 1338)
  [1359, 1420, 'world', 'factory'],   // and soon the whole world was  (world 1394)
  [1420, 1481, 'fragile', 'factory'], // wrapping fragile stuff in bubbles.  (fragile 1423)
  [1481, 1580, 'today', 'modern'],    // Today there's even a Bubble Wrap Appreciation Day,  (Appreciation 1528)
  [1580, 1629, 'monday', 'modern'],   // the last Monday of January.  (Monday 1580)
  [1629, 1712, 'pop', 'modern'],      // So next time you pop one, remember,  (pop 1660)
  [1712, 1782, 'satisfy', 'modern'],  // the world's most satisfying sound came from  (satisfying 1733)
  [1782, 1887, 'end', 'living'],      // a wallpaper nobody wanted.  (wallpaper 1785, nobody 1799, wanted 1815)
];
export const NF = 1887;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
const LIGHT = { garage: 'office', living: 'office', livingNo: 'office', green: 'day', greenFlop: 'day', factory: 'office', computer: 'office', modern: 'office' };
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: LIGHT[s[3]], kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['bw', segAt(f)[3]];

// ---------- places ----------
const at = (o) => (p) => [p[0] + o[0], p[1] + o[1], p[2] + o[2]];
const GA = at([-40000, 0, 0]), LV = at([-40000, 0, 600]), GR = at([-40000, 0, 1200]), FA = at([-42500, 0, 0]), CO = at([-42500, 0, 600]), MO = at([-42500, 0, 1200]);

// ---------- cameras ----------
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(LV([0.3, 1.05, 2.6]), LV([0.45, 1.15, -3.0]), 50, 1.0, LV([0.3, 0.5, -0.2])),
  walls: C(LV([1.5, 1.2, 0.1]), LV([1.05, 1.25, -3.2]), 48, 1.2, LV([1.2, 0.9, -2.3])),
  y1957: C(GA([0.5, 1.6, 4.2]), GA([-0.05, 1.1, -2.0]), 52, 1.0, GA([0, 1.0, 0.8])),
  eng1: C(GA([-0.4, 1.5, 1.7]), GA([-1.0, 1.3, -0.8]), 44, 1.6, GA([-0.95, 1.3, -0.7])),
  eng2: C(GA([1.35, 1.45, 2.4]), GA([1.0, 1.2, -0.7]), 44, 1.6, GA([1.0, 1.3, -0.6])),
  seal: C(GA([0.75, 1.5, 0.75]), GA([-0.05, 0.95, -1.35]), 48, 2.0, GA([0, 0.95, -0.9])),
  idea: C(GA([-1.0, 1.55, 1.6]), GA([-1.6, 1.45, -2.2]), 48, 1.4, GA([-1.5, 1.3, -0.9])),
  paper: C(GA([-0.25, 1.55, -0.3]), GA([-0.25, 1.95, -3.2]), 44, 1.6, GA([-0.25, 2.04, -3.15])),
  modern: C(LV([0.3, 1.45, 3.4]), LV([0.3, 1.15, -3.0]), 52, 1.2, LV([0.3, 1.2, -0.3])),
  bubbly: C(LV([1.0, 1.35, 2.2]), LV([1.3, 1.05, -1.6]), 46, 1.6, LV([1.3, 1.0, -0.5])),
  nobody: C(LV([0.3, 1.45, 3.3]), LV([0.3, 1.1, -3.0]), 50, 1.2, LV([0.3, 1.2, -0.6])),
  again: C(GR([0.4, 1.55, 4.2]), GR([0, 1.4, -3.0]), 50, 1.0, GR([0, 1.0, 1.6])),
  greenhouse: C(GR([0.9, 2.1, 2.9]), GR([-0.2, 1.5, -4.2]), 56, 0.9, GR([-0.3, 1.0, -1.2])),
  warm: C(GR([-1.1, 1.35, 0.9]), GR([-2.05, 1.0, -0.9]), 46, 2.0, GR([-2.0, 1.0, -0.4])),
  flopped: C(GR([0.5, 1.6, 1.9]), GR([0, 1.25, -2.5]), 50, 1.4, GR([0, 1.1, -0.6])),
  two: C(GA([0.15, 1.35, 4.0]), GA([0.0, 1.0, -1.8]), 50, 1.4, GA([0.0, 0.8, 0.9])),
  company: C(FA([1.0, 1.8, 3.4]), FA([-0.2, 1.7, -3.0]), 54, 1.0, FA([0.3, 1.0, 0.6])),
  sealedair: C(FA([0.3, 1.45, 2.8]), FA([0, 2.45, -3.2]), 50, 1.0, FA([0, 1.5, 0.3])),
  hunting: C(FA([0.3, 1.6, 2.8]), FA([2.0, 1.2, -2.2]), 50, 1.4, FA([1.1, 1.0, 0.3])),
  ibm: C(CO([0.6, 1.75, 3.2]), CO([0, 1.35, -3.0]), 52, 1.0, CO([-0.4, 1.0, 0.1])),
  y1401: C(CO([0.5, 0.78, 1.2]), CO([0.15, 0.88, -1.9]), 46, 1.6, CO([0.15, 1.0, -1.5])),
  delicate: C(CO([-0.5, 1.5, 1.5]), CO([0.1, 1.1, -1.6]), 46, 1.6, CO([-0.4, 1.1, -0.7])),
  ship: C(CO([2.6, 1.9, 3.8]), CO([1.5, 0.9, 0.2]), 54, 1.2, CO([1.5, 1.0, 0.6])),
  protect: C(CO([0.7, 1.6, 2.6]), CO([0.5, 1.3, -1.2]), 50, 1.4, CO([0.5, 1.1, 0.3])),
  wrapit: C(CO([0.6, 1.6, 2.0]), CO([0.15, 1.1, -1.9]), 50, 1.4, CO([0.15, 1.0, -0.8])),
  customer: C(CO([1.3, 1.6, 2.9]), CO([0.7, 1.15, -0.6]), 50, 1.2, CO([0.6, 1.1, 0.4])),
  world: C(FA([1.2, 2.0, 3.6]), FA([-0.3, 1.5, -3.0]), 56, 1.0, FA([0, 1.0, 0.6])),
  fragile: C(FA([-0.6, 1.5, 2.6]), FA([-1.4, 1.1, -0.8]), 48, 1.6, FA([-1.2, 1.1, 0.4])),
  today: C(MO([0.3, 1.25, 3.2]), MO([0.2, 1.15, -3.0]), 52, 1.0, MO([0, 0.8, -0.2])),
  monday: C(MO([0.9, 1.25, -1.2]), MO([1.22, 1.2, -3.2]), 46, 1.6, MO([1.3, 1.2, -3.1])),
  pop: C(MO([0.3, 1.15, 1.9]), MO([-0.05, 0.75, -0.6]), 50, 1.6, MO([0, 0.6, -0.2])),
  satisfy: C(MO([0.0, 1.2, 1.2]), MO([-0.35, 1.0, -0.6]), 46, 2.0, MO([-0.4, 1.0, -0.4])),
  end: C(LV([0.4, 1.0, 2.4]), LV([0.55, 1.15, -3.0]), 50, 1.0, LV([0.3, 0.5, 0.0])),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.2) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.08, walls: 0.08, y1957: 0.1, eng1: 0.08, eng2: 0.08, seal: 0.1, idea: 0.1, paper: 0.12, modern: 0.08, bubbly: 0.1, nobody: 0.06, again: 0.12, greenhouse: 0.08, warm: 0.1, flopped: 0.08, two: 0.1,
  company: 0.08, sealedair: 0.1, hunting: 0.08, ibm: 0.08, y1401: 0.1, delicate: 0.1, ship: 0.08, protect: 0.1, wrapit: 0.08, customer: 0.08, world: 0.06, fragile: 0.1, today: 0.08, monday: 0.1, pop: 0.06, satisfy: 0.1, end: 0.06 };
const base = (k) => V[k] || V.hook;
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const pan = (d, f0, f1) => { const t = sm(f0, f1, f); const o = d.map((x) => x * t); c = { ...c, p: add3(c.p, o), l: add3(c.l, o), fp: add3(c.fp, o) }; };
  if (k === 'hook') { punch(43, 50, 0.06); }
  if (k === 'walls') { punch(57, 64, 0.12); kick(57, 0.05); }
  if (k === 'y1957') { punch(99, 106, 0.08); punch(143, 150, 0.05); }
  if (k === 'eng1') punch(196, 203, 0.08);
  if (k === 'eng2') punch(222, 229, 0.08);
  if (k === 'seal') { punch(291, 298, 0.08); shake(302, 312, 0.02); }
  if (k === 'idea') { punch(337, 344, 0.1); kick(337, 0.04); }
  if (k === 'paper') { punch(372, 380, 0.12); }
  if (k === 'modern') { punch(411, 417, 0.1); kick(411, 0.04); }
  if (k === 'bubbly') { punch(438, 444, 0.12); kick(438, 0.04); }
  if (k === 'nobody') punch(476, 483, 0.06);
  if (k === 'again') pan([0, 0, -0.8], 523, 569);
  if (k === 'greenhouse') punch(569, 576, 0.06);
  if (k === 'warm') punch(636, 643, 0.08);
  if (k === 'flopped') { punch(671, 678, 0.1); shake(671, 682, 0.03); }
  if (k === 'two') { punch(719, 726, 0.1); }
  if (k === 'sealedair') { punch(804, 811, 0.08); punch(827, 834, 0.08); }
  if (k === 'hunting') pan([0.3, 0, 0], 861, 918);
  if (k === 'ibm') { punch(931, 938, 0.08); }
  if (k === 'y1401') { punch(1003, 1010, 0.12); kick(1003, 0.04); }
  if (k === 'delicate') { punch(1047, 1053, 0.08); shake(1047, 1056, 0.03); punch(1063, 1070, 0.06); }
  
  if (k === 'protect') punch(1171, 1178, 0.1);
  if (k === 'wrapit') { punch(1226, 1233, 0.12); kick(1226, 0.05); }
  if (k === 'customer') { punch(1338, 1345, 0.1); }
  if (k === 'world') pan([-0.8, 0.2, 0], 1359, 1420);
  if (k === 'fragile') punch(1423, 1430, 0.08);
  if (k === 'today') { punch(1528, 1535, 0.08); }
  if (k === 'monday') punch(1580, 1587, 0.08);
  if (k === 'pop') { punch(1660, 1666, 0.14); shake(1660, 1672, 0.04); }
  if (k === 'satisfy') punch(1733, 1740, 0.08);
  if (k === 'end') { punch(1799, 1806, 0.06); punch(1815, 1824, 0.1); }
  return c;
}
const HARD = new Set([473, 1206]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[57, 0.4, 8], [97, 0.7, 10], [337, 0.4, 8], [372, 0.5, 8], [411, 0.4, 6], [438, 0.4, 6], [523, 0.5, 8], [750, 0.6, 10], [827, 0.5, 8], [918, 0.6, 10], [1003, 0.4, 8], [1226, 0.5, 8], [1338, 0.4, 8], [1481, 0.7, 10], [1660, 0.6, 8], [1782, 0.6, 10]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state ----------
export function worldAt(f, w) {
  const s = segAt(f), k = s[2], B = w.bw;
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  if (!B) return;
  B.seal(k === 'seal' ? 0.05 + 0.95 * sm(256, 318, f) : k === 'y1957' || k === 'eng1' || k === 'eng2' ? 0.15 : 1);
  B.heat(k === 'seal' ? 0.4 + 0.6 * sm(250, 270, f) : k === 'idea' || k === 'paper' ? 0.5 : 0.2);
  B.droop(k === 'flopped' ? sm(668, 698, f) : 0);
  B.rolls(k === 'company' ? 2 + 2 * sm(760, 800, f) : k === 'sealedair' ? 5 : k === 'hunting' ? 5 + 9 * sm(866, 914, f) : k === 'world' ? 14 : k === 'fragile' ? 14 : 0);
  B.wrap(k === 'wrapit' ? sm(1210, 1240, f) : k === 'customer' ? 1 : 0);
  B.crate(k === 'customer' ? 0.15 + 0.85 * sm(1290, 1350, f) : 0);
  B.popped(k === 'today' ? 0.08 : k === 'monday' ? 0.12 : k === 'pop' ? 0.15 + 0.5 * sm(1640, 1705, f) : k === 'satisfy' ? 0.65 + 0.3 * sm(1712, 1780, f) : 0);
}

// ---------- actors ----------
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
// gp(k, x, d, h): floor point d metres ahead of shot k's base camera, x metres to its right (visible half-width ~0.26 d at fov 50)
const gp = (k, x, d, h = 0) => { const c = V[k], fx = c.l[0] - c.p[0], fz = c.l[2] - c.p[2], n = Math.hypot(fx, fz), ux = fx / n, uz = fz / n; return [c.p[0] + ux * d - uz * x, h, c.p[2] + uz * d + ux * x]; };
const PP = (f, pos, opts = {}, s = 0.42) => person(f, 'POPPY', 9, pos, { t: f, ...opts }, { s, blob: true, blobW: 0.6, blobD: 0.4 });
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
const hopY = (f, i = 0, a = 0.06) => a * Math.abs(Math.sin(f * 0.3 + i));
const popAt = (f, f0, f1, f2) => f < f0 ? 0 : f < f1 ? Math.min(1, (f - f0) / (f1 - f0) * 1.0) : f < f2 ? 1 : 0;
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [], g = (x, d, h = 0) => gp(k, x, d, h);
  if (k === 'hook') A.push(PP(f, add3(g(-0.05, 2.6), [0, hopY(f, 0, 0.05), 0]), { expr: f < 40 ? 'smile' : 'happy', pose: 'wave', squash: -0.3 * Math.abs(Math.sin(f * 0.3)) }, 0.5));
  if (k === 'walls') A.push(PP(f, LV([1.15, 0.55 + hopY(f, 1, 0.1), -2.45]), { expr: f < 60 ? 'shock' : 'love', pose: f < 60 ? 'shock' : 'cheer' }, 0.4));
  if (k === 'y1957') { A.push(P(f, 'BW_AL', 11, g(-0.55, 3.4), { expr: 'happy', view: '34R', wave: f > 120 ? wav(f) : undefined })); A.push(P(f, 'BW_MARC', 12, g(0.58, 3.55), { expr: 'smile', prop: 'bwsheet', reach: 0.8, view: '34L' }));
    A.push(PP(f, g(0.05, 2.4), { expr: 'happy', pose: 'wave' }, 0.3)); }
  if (k === 'eng1') { A.push(P(f, 'BW_AL', 11, g(-0.05, 2.6), { expr: f < 196 ? 'smile' : 'grin', point: f > 198 ? 1 : 0, view: '34R' })); A.push(PP(f, g(0.3, 1.8), { expr: 'happy', pose: 'point', flip: true }, 0.26)); }
  if (k === 'eng2') A.push(P(f, 'BW_MARC', 12, g(0, 3.1), { expr: f < 222 ? 'smile' : 'excited', prop: 'bwsheet', raise: f > 224 ? 1 : 0, reach: 0.85, view: '34L' }));
  if (k === 'seal') { A.push(P(f, 'BW_MARC', 12, g(0.42, 3.0), { expr: f < 300 ? 'smile' : 'laugh', view: '34L' }));
    if (f > 296) A.push(PP(f, GA([0.12, 0.84, -0.35 + 0.2 * sm(296, 320, f)]), { expr: f < 304 ? 'shock' : 'happy', pose: f < 304 ? 'shock' : 'cheer', squash: 0.6 * (1 - sm(296, 306, f)) }, 0.22 * back(296, 306, f) + 0.001)); }
  if (k === 'idea') { A.push(P(f, 'BW_AL', 11, g(-0.4, 2.7), { expr: f < 337 ? 'thoughtful' : 'excited', point: f > 340 ? 1 : 0, view: '34R' })); A.push(P(f, 'BW_MARC', 12, g(0.45, 2.9), { expr: 'happy', prop: 'bwsheet', raise: 1, reach: 0.9, view: '34L' })); }
  if (k === 'paper') A.push(PP(f, GA([-0.3, 1.3, -1.66]), { expr: f < 372 ? 'smile' : 'love', pose: 'cheer', look: 1 }, 0.18));
  if (k === 'modern') { A.push(P(f, 'BW_MARC', 12, g(-0.55, 3.9), { expr: 'excited', point: 1, raise: 1, view: '34R' })); A.push(P(f, 'BW_MOM', 21, g(0.58, 3.6), { expr: f < 418 ? 'smile' : 'bored', view: '34L' })); A.push(PP(f, add3(g(0.0, 3.1), [0, hopY(f, 2, 0.08), 0]), { expr: 'happy', pose: 'cheer' }, 0.3)); }
  if (k === 'bubbly') { A.push(P(f, 'BW_MOM', 21, g(0.2, 3.0), { expr: f < 445 ? 'bored' : 'worried', view: '34L', look: -1 })); A.push(PP(f, add3(g(-0.35, 2.6), [0, hopY(f, 0, 0.14), 0]), { expr: 'love', pose: 'cheer', squash: 0.4 * Math.max(0, Math.cos(f * 0.6)) }, 0.32)); }
  if (k === 'nobody') { A.push(P(f, 'BW_MOM', 21, g(0.55, 4.1), { expr: f < 478 ? 'bored' : 'angry', view: 'front' })); A.push(P(f, 'BW_AL', 11, g(-0.5, 4.2), { expr: 'sad', prop: 'bwroll', reach: 0.5, view: '34R' })); A.push(PP(f, g(0.05, 3.0), { expr: 'sad', pose: 'shrug' }, 0.3)); }
  if (k === 'again') { A.push(P(f, 'BW_AL', 11, g(-0.45, 3.9), { expr: 'determined', prop: 'bwroll', reach: 0.7, view: '34R' })); A.push(P(f, 'BW_MARC', 12, g(0.45, 4.2), { expr: 'happy', prop: 'bwsheet', raise: 1, reach: 0.9, view: '34L' })); }
  if (k === 'greenhouse') { A.push(P(f, 'BW_GARD', 31, g(-0.45, 4.0), { expr: f < 576 ? 'smile' : 'happy', prop: 'wcan', reach: 0.7, view: '34R' })); A.push(P(f, 'BW_MARC', 12, g(0.5, 3.6), { expr: 'excited', point: 1, view: '34L' })); }
  if (k === 'warm') { A.push(PP(f, GR([-1.92, 0.84, -0.35]), { expr: 'happy', pose: f < 640 ? 'stand' : 'cheer', look: -1 }, 0.26)); A.push(P(f, 'BW_GARD', 31, g(0.45, 2.9), { expr: 'smile', prop: 'plant', reach: 0.7, view: '34L' })); }
  if (k === 'flopped') { A.push(P(f, 'BW_GARD', 31, g(-0.2, 2.6), { expr: f < 671 ? 'worried' : 'sad', prop: 'plant', droop: sm(668, 690, f) > 0.5 ? 1 : 0, reach: 0.7, view: 'front' })); A.push(PP(f, g(0.42, 2.0), { expr: f < 672 ? 'worried' : 'sad', pose: 'shrug' }, 0.28)); }
  if (k === 'two') { A.push(P(f, 'BW_AL', 11, g(-0.55, 3.5), { expr: 'sad', view: '34R' })); A.push(P(f, 'BW_MARC', 12, g(0.58, 3.6), { expr: 'sad', view: '34L', prop: 'bwroll', reach: 0.4 })); A.push(PP(f, g(0.0, 3.0), { expr: 'sad', pose: 'stand' }, 0.3)); }
  if (k === 'company') { A.push(P(f, 'BW_AL', 11, g(-0.5, 3.0), { expr: 'determined', view: '34R', point: f > 780 ? 1 : 0 })); A.push(P(f, 'BW_MARC', 12, g(0.5, 2.9), { expr: 'happy', prop: 'clipboard', reach: 0.6, view: '34L' })); }
  if (k === 'sealedair') { A.push(P(f, 'BW_AL', 11, g(-0.45, 3.2), { expr: f < 804 ? 'smile' : 'excited', cheer: wav(f, 0), view: '34R' })); A.push(P(f, 'BW_MARC', 12, g(0.48, 3.3), { expr: 'laugh', cheer: wav(f, 2), view: '34L' })); }
  if (k === 'hunting') { A.push(P(f, 'BW_MARC', 12, g(-0.35, 2.7), { expr: 'thoughtful', prop: 'clipboard', reach: 0.6, view: '34R' })); A.push(P(f, 'BW_AL', 11, g(0.45, 3.6), { expr: 'worried', view: '34L' })); A.push(PP(f, g(-0.02, 2.1), { expr: 'smile', pose: 'shrug', look: 1 }, 0.26)); }
  if (k === 'ibm') A.push(P(f, 'BW_BUY', 41, g(-0.35, 3.3), { expr: f < 931 ? 'smile' : 'smug', prop: 'clipboard', reach: 0.6, view: '34R' }));
  if (k === 'y1401') A.push(PP(f, g(0.2, 2.45), { expr: f < 1006 ? 'shock' : 'love', pose: f < 1006 ? 'shock' : 'cheer', look: -1 }, 0.28));
  if (k === 'delicate') A.push(P(f, 'BW_BUY', 41, g(-0.2, 2.5), { expr: f < 1060 ? 'worried' : 'nervous', view: '34R', handsUp: f > 1063 ? 1 : 0 }));
  if (k === 'ship') { A.push(P(f, 'BW_MOVE1', 51, g(-0.56, 3.0), { expr: 'grin', prop: 'crowbar', reach: 0.7, view: '34R' })); A.push(P(f, 'BW_MOVE2', 52, g(0.56, 3.2), { expr: f < 1120 ? 'smile' : 'worried', view: '34L' })); }
  if (k === 'protect') { A.push(P(f, 'BW_BUY', 41, g(-0.4, 3.0), { expr: 'worried', prop: 'clipboard', reach: 0.6, view: '34R' })); A.push(P(f, 'BW_MOVE1', 51, g(0.45, 3.3), { expr: 'nervous', view: '34L' })); }
  if (k === 'wrapit') { A.push(P(f, 'BW_AL', 11, g(-0.5, 2.85), { expr: 'excited', prop: 'bwroll', reach: 0.8, view: '34R' })); A.push(P(f, 'BW_MARC', 12, g(0.52, 2.9), { expr: 'laugh', prop: 'bwsheet', raise: 1, reach: 0.9, view: '34L' }));
    A.push(PP(f, g(0.0, 2.3), { expr: f < 1226 ? 'happy' : 'love', pose: 'cheer' }, 0.28)); }
  if (k === 'customer') { A.push(P(f, 'BW_BUY', 41, g(-0.45, 3.0), { expr: f < 1338 ? 'happy' : 'excited', view: '34R', cheer: f > 1338 ? wav(f, 1) : undefined })); A.push(P(f, 'BW_AL', 11, g(0.45, 3.2), { expr: 'laugh', view: '34L', prop: 'clipboard', reach: 0.6 })); }
  if (k === 'world') { A.push(P(f, 'BW_MOVE1', 51, g(-0.42, 3.3), { expr: 'happy', prop: 'bwroll', reach: 0.7, view: '34R', mode: 'march', phase: q((f * 0.04) % 1, 0.05) })); A.push(P(f, 'BW_MARC', 12, g(0.5, 3.7), { expr: 'excited', point: 1, view: '34L' })); }
  if (k === 'fragile') { A.push(P(f, 'BW_MOVE2', 52, g(-0.2, 2.8), { expr: 'happy', prop: 'plant', wrapped: 1, reach: 0.7, view: '34R' })); A.push(PP(f, g(0.38, 2.3), { expr: 'happy', pose: 'wave' }, 0.26)); }
  if (k === 'today') { A.push(P(f, 'BW_KID', 61, g(-0.25, 3.1, 0.03), { expr: f < 1528 ? 'happy' : 'excited', cheer: wav(f, 0), view: 'front' })); A.push(PP(f, g(0.33, 2.7), { expr: 'happy', pose: 'cheer' }, 0.3)); }
  if (k === 'monday') A.push(PP(f, MO([0.98, 0.94, -3.0]), { expr: 'happy', pose: 'point' }, 0.22));
  if (k === 'pop') { A.push(P(f, 'BW_KID', 61, add3(g(-0.35, 2.4, 0.03), [0, hopY(f, 0, 0.08), 0]), { expr: f < 1660 ? 'grin' : f < 1690 ? 'shock' : 'laugh', view: '34R', point: f > 1652 && f < 1664 ? 1 : 0 }));
    const p = f < 1660 ? 0 : f < 1672 ? sm(1660, 1672, f) * 0.99 : f < 1690 ? 1 : 0; A.push(PP(f, g(0.22, 2.3), { expr: f < 1660 ? 'happy' : f < 1700 ? 'dizzy' : 'sly', pose: f < 1700 ? 'stand' : 'wave', pop: p, squash: f >= 1690 ? 0.5 * (1 - sm(1690, 1704, f)) * Math.cos((f - 1690) * 0.9) : 0 }, f >= 1690 ? 0.36 * back(1690, 1700, f) + 0.001 : 0.36)); }
  if (k === 'satisfy') A.push(P(f, 'BW_KID', 61, g(0.0, 2.0, 0.03), { expr: 'laugh', prop: 'bwsheet', raise: 1, reach: 0.9, view: '34R' }));
  if (k === 'end') { A.push(P(f, 'BW_MOM', 21, g(0.5, 3.9), { expr: f < 1805 ? 'bored' : 'smug', view: '34L' })); A.push(PP(f, g(-0.15, 2.8), { expr: f < 1815 ? 'happy' : 'sly', pose: f < 1815 ? 'wave' : 'shrug' }, 0.42)); }
  return A;
}

// ---------- effects ----------
const ASP = 1080 / 1920; let CURF = 0;
function SB(k, x, y, z) { const c = cam(k, CURF), n = (v) => { const l = Math.hypot(...v); return v.map((u) => u / l); }, fw = n([c.l[0] - c.p[0], c.l[1] - c.p[1], c.l[2] - c.p[2]]), r = n([-fw[2], 0, fw[0]]), u = [r[1] * fw[2] - r[2] * fw[1], r[2] * fw[0] - r[0] * fw[2], r[0] * fw[1] - r[1] * fw[0]], t = Math.tan(c.fov * Math.PI / 360);
  return [0, 1, 2].map((i) => c.p[i] + fw[i] * z + r[i] * x * t * ASP * z + u[i] * y * t * z); }
const SW = (k, w, z) => 2 * w * z * Math.tan(cam(k, CURF).fov * Math.PI / 360) * ASP;
const board = (f, f0, lines, pos, size, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'board', lines, pos, size: size * back(f0, f0 + 12, f) }); };
const sboard = (f, f0, lines, k, x, y, z, w, F2, f1) => board(f, f0, lines, SB(k, x, y, z), SW(k, w, z), F2, f1);
const sburst = (f, f0, k, x, y, z, w, F2, col = '#fff3b0', n = 12) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'burst', t: (f - f0) / n, pos: SB(k, x, y, z), size: SW(k, w, z), col, rays: 10 }); };
const stars = (f, f0, k, x, y, z, w, F2, per = 30) => { if (f >= f0) F2.push({ fx: 'stars', t: ((f - f0) / per) % 1, pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 10, f) }); };
const qmark = (f, f0, k, x, y, z, w, F2) => { if (f >= f0) F2.push({ fx: 'qmark', pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 8, f) }); };
const stamp = (f, f0, lines, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) { const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos: SB(k, x, y, z), size: SW(k, w, z) * (1.6 - 0.6 * t * t), op: Math.min(1, t * 2) }); } };
const bulb = (f, f0, k, x, y, z, w, F2) => { if (f >= f0) F2.push({ fx: 'bulb', t: ((f - f0) / 20) % 1, pos: SB(k, x, y, z), size: SW(k, w, z) * back(f0, f0 + 8, f) }); };
const wpuff = (f, f0, pos, size, F2, n = 16, tint) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'puff', t: (f - f0) / n, pos, size, tint }); };
const count = (f, f0, f1, v0, v1, fmt) => fmt(Math.round(v0 + (v1 - v0) * sm(f0, f1, f)));
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { sboard(f, 4, ['BUBBLE WRAP WAS', 'SUPPOSED TO GO...'], 'hook', 0.0, 0.62, 2.5, 0.5, F2); }
  if (k === 'walls') { sburst(f, 57, 'walls', 0.0, 0.5, 2.5, 0.7, F2, '#fff3b0', 12); sboard(f, 55, ['...ON YOUR', 'WALLS?!'], 'walls', 0.0, 0.62, 2.5, 0.42, F2); qmark(f, 66, 'walls', 0.4, 0.28, 2.5, 0.1, F2); }
  if (k === 'y1957') { sboard(f, 99, ['1957'], 'y1957', -0.42, 0.66, 3, 0.3, F2); sboard(f, 141, ['NEW JERSEY'], 'y1957', 0.3, 0.46, 3, 0.36, F2); }
  if (k === 'eng1') { sboard(f, 194, ['ALFRED', 'FIELDING'], 'eng1', 0.0, 0.62, 2, 0.4, F2); }
  if (k === 'eng2') { sboard(f, 219, ['MARC', 'CHAVANNES'], 'eng2', 0.0, 0.62, 2, 0.4, F2); }
  if (k === 'seal') { sboard(f, 266, ['2 CURTAINS', '+ HEAT'], 'seal', 0.0, 0.64, 1.4, 0.5, F2); sburst(f, 302, 'seal', 0.1, -0.05, 1.4, 0.4, F2, '#bfe8ff', 12); }
  if (k === 'idea') { bulb(f, 337, 'idea', -0.18, 0.5, 2.6, 0.13, F2); sboard(f, 330, ['THE BIG', 'IDEA?'], 'idea', 0.18, 0.62, 2.6, 0.36, F2); }
  if (k === 'paper') { sburst(f, 372, 'paper', 0.0, 0.1, 1.5, 0.8, F2, '#fff3b0', 14); sboard(f, 370, ['TEXTURED', 'WALLPAPER!'], 'paper', 0.0, 0.64, 1.5, 0.46, F2); stars(f, 380, 'paper', 0.3, 0.2, 1.5, 0.3, F2, 24); }
  if (k === 'modern') { stamp(f, 411, ['MODERN!'], 'modern', 0.0, 0.6, 2.5, 0.42, F2); }
  if (k === 'bubbly') { stamp(f, 438, ['BUBBLY!'], 'bubbly', 0.0, 0.6, 2.2, 0.42, F2); stars(f, 442, 'bubbly', -0.3, 0.0, 2.2, 0.3, F2, 20); }
  if (k === 'nobody') { stamp(f, 476, ['NOBODY', 'BOUGHT IT'], 'nobody', 0.0, 0.58, 2.5, 0.5, F2); }
  if (k === 'again') { sboard(f, 528, ['TRY #2:'], 'again', 0.0, 0.64, 3, 0.36, F2); }
  if (k === 'greenhouse') { sboard(f, 567, ['GREENHOUSE', 'INSULATION'], 'greenhouse', 0.0, 0.64, 3, 0.48, F2); }
  if (k === 'warm') { sboard(f, 618, ['BUBBLES KEEP', 'PLANTS WARM?'], 'warm', 0.0, 0.62, 1.8, 0.48, F2); }
  if (k === 'flopped') { stamp(f, 671, ['FLOPPED', 'TOO'], 'flopped', 0.0, 0.58, 2.5, 0.46, F2); }
  if (k === 'two') { sboard(f, 717, ['FAILURES: 2'], 'two', 0.0, 0.64, 2.5, 0.46, F2); }
  if (k === 'company') { sboard(f, 756, ['THEY STARTED A', 'COMPANY ANYWAY'], 'company', 0.0, 0.62, 1.5, 0.52, F2); }
  if (k === 'sealedair') { sburst(f, 827, 'sealedair', 0.0, -0.35, 2, 0.6, F2, '#fff3b0', 12); sboard(f, 825, ['1960'], 'sealedair', 0.0, -0.4, 2, 0.32, F2); }
  if (k === 'hunting') { qmark(f, 870, 'hunting', -0.3, 0.45, 2.5, 0.12, F2); qmark(f, 884, 'hunting', 0.25, 0.55, 2.5, 0.1, F2); sboard(f, 864, ['...BUT FOR WHAT?'], 'hunting', 0.0, 0.66, 2.5, 0.46, F2); }
  if (k === 'ibm') { sboard(f, 929, ['IBM'], 'ibm', 0.0, 0.66, 3, 0.3, F2, 970); sboard(f, 970, ['A NEW', 'COMPUTER'], 'ibm', 0.0, 0.64, 3, 0.4, F2); }
  if (k === 'y1401') { sburst(f, 1003, 'y1401', 0.0, 0.55, 1.5, 0.6, F2, '#bfe8ff', 12); sboard(f, 1001, ['THE 1401', '(1959)'], 'y1401', 0.0, 0.62, 1.5, 0.4, F2); }
  if (k === 'delicate') { sboard(f, 1047, ['BIG.'], 'delicate', -0.25, 0.66, 2, 0.26, F2); sboard(f, 1063, ['DELICATE.'], 'delicate', 0.2, 0.46, 2, 0.36, F2); }
  if (k === 'ship') { sboard(f, 1104, ['SHIPPED ALL OVER', 'THE COUNTRY'], 'ship', 0.0, 0.64, 3, 0.5, F2); }
  if (k === 'protect') { sboard(f, 1153, ['HOW DO YOU', 'PROTECT IT?'], 'protect', 0.0, 0.64, 2.5, 0.46, F2); qmark(f, 1175, 'protect', 0.42, 0.3, 2.5, 0.1, F2); }
  if (k === 'wrapit') { sburst(f, 1226, 'wrapit', 0.0, 0.3, 2, 0.8, F2, '#bfe8ff', 14); sboard(f, 1222, ['WRAP IT', 'IN BUBBLES!'], 'wrapit', 0.0, 0.64, 2, 0.46, F2); stars(f, 1236, 'wrapit', 0.0, 0.1, 2, 0.5, F2, 24); }
  if (k === 'customer') { sboard(f, 1262, ['IBM:'], 'customer', 0.0, 0.68, 2.5, 0.26, F2, 1330); sboard(f, 1330, ['FIRST BIG PACKAGING', 'CUSTOMER!'], 'customer', 0.0, 0.64, 2.5, 0.52, F2); sburst(f, 1338, 'customer', 0.0, 0.64, 2.5, 0.6, F2); }
  if (k === 'world') { sboard(f, 1384, ['THE WHOLE', 'WORLD...'], 'world', 0.0, 0.64, 3, 0.44, F2); }
  if (k === 'fragile') { sboard(f, 1421, ['FRAGILE?', 'WRAP IT!'], 'fragile', 0.0, 0.64, 2.2, 0.42, F2); }
  if (k === 'today') { sboard(f, 1484, ['TODAY'], 'today', -0.4, 0.2, 3, 0.3, F2, 1526); stars(f, 1532, 'today', 0.0, -0.2, 3, 0.5, F2, 24); }
  if (k === 'monday') { sboard(f, 1582, ['LAST MONDAY', 'OF JANUARY'], 'monday', 0.0, 0.64, 1.2, 0.48, F2); }
  if (k === 'pop') { sburst(f, 1660, 'pop', 0.2, 0.0, 1.8, 0.6, F2, '#ffd0e0', 12); if (f > 1700) stars(f, 1700, 'pop', 0.2, 0.2, 1.8, 0.35, F2, 20); }
  if (k === 'satisfy') { sboard(f, 1716, ['THE MOST', 'SATISFYING SOUND...'], 'satisfy', 0.0, 0.64, 1.4, 0.5, F2); for (const f0 of [1724, 1740, 1752, 1766]) sburst(f, f0, 'satisfy', ((f0 * 7) % 5 - 2) * 0.12, 0.1, 1.4, 0.25, F2, '#bfe8ff', 8); }
  if (k === 'end') { sboard(f, 1786, ['...CAME FROM A WALLPAPER', 'NOBODY WANTED'], 'end', 0.0, 0.62, 2.2, 0.56, F2); sburst(f, 1815, 'end', 0.0, 0.62, 2.2, 0.6, F2, '#fff3b0', 12); stars(f, 1822, 'end', 0.0, -0.35, 2.2, 0.4, F2, 20); }
  return F2;
}
