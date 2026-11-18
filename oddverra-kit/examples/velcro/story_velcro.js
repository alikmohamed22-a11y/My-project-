// [VC-story] "Velcro was invented because burrs kept sticking to a dog" timeline (frames from vc_beats.js, generated from work/words.json).
// Sets: vc_sets.js (meadow / study / micro / mill / runway / capsule) through setAt. Pattern: story_bigben.js (slow push per shot, zoom-through
// whips on cuts, screen-pinned boards / bursts / stamps, punch-ins on beats). The motif is the hook-and-loop RRRIP: the cold open sticks a
// burr (Burry) onto the dog, the hooks grab the fur, the name lands, the astronaut's gear sticks, and the payoff rips a strip at dawn.
// Sidekick: BURRY, a living burdock burr. Hero object: the burr.
import * as S from './story.js';
import { B, NF as NF0 } from './vc_beats.js';
import { SCOPE } from './vc_sets.js';
import { BURR_SPOTS } from './vc_cast.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]
const SH = [
  [0, B.in41, 'hook', 'meadowDay'],            // Velcro exists because of a dog that kept getting covered in burrs.
  [B.in41, B.most, 'walk', 'meadowGold'],      // In 1941, Swiss engineer George de Mestral came home from a hunting trip, and his dog was full of them.
  [B.most, B.yousee, 'pick', 'study'],         // Most people would just pick them off. George put one under a microscope.
  [B.yousee, B.and, 'hooks', 'micro'],         // You see, every burr is covered in tiny hooks.
  [B.and, B.so, 'grab', 'micro'],              // And hooks grab anything with a loop... like fur. Or fabric.
  [B.so, B.but, 'idea', 'studyNight'],         // So George had an idea. A fake burr! Hooks on one strip, loops on the other.
  [B.but, B.nylon, 'cotton', 'mill'],          // But making it was a nightmare. Cotton hooks wore out fast.
  [B.nylon, B.took, 'nylon', 'mill'],          // Nylon worked, reportedly once it was sewn under hot infrared light. Then the loops had to be cut just right.
  [B.took, B.named, 'decade', 'mill'],         // It took him nearly a decade.
  [B.named, B.patented, 'name', 'mill'],       // He named it after two French words: velours, for velvet, and crochet, for hook. Velcro!
  [B.patented, B.then2, 'runway', 'runway'],   // It was patented in the mid-fifties. But the fashion world reportedly turned up its nose. It looked cheap.
  [B.then2, B.so3, 'space', 'capsule'],        // Then NASA came calling. On the Apollo missions, it kept tools and snacks from floating away.
  [B.so3, NF0, 'payoff', 'meadowDawn'],        // So next time you hear that sound... thank a dog who just wouldn't stay out of the weeds.
];
export const NF = NF0;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['vc', segAt(f)[3]];
export const SHOTS = SH;

// ---------- places (set-local -> world)
const O = { meadow: [-168000, 0, 0], study: [-168000, 0, 800], micro: [-168000, 0, 1600], mill: [-170500, 0, 0], runway: [-170500, 0, 800], capsule: [-170500, 0, 1600] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const MDa = at(O.meadow), SDa = at(O.study), MCa = at(O.micro), MLa = at(O.mill), RWa = at(O.runway), CPa = at(O.capsule);
const [EX, EY, EZ] = SCOPE.EYE;
const SU = 0.00225, DOGS = 0.72;
// meadow-local point on the dog's coat for burr spot i (dog card at local pos, facing +x unless flip)
const spotAt = (pos, i, flip, s = DOGS) => { const sp = BURR_SPOTS[i % BURR_SPOTS.length]; let x, y; if (sp[0] === 'ear') { x = 150; y = -330; } else if (sp[0] === 'tail') { x = -280; y = -300; } else { x = sp[0]; y = sp[1]; }
  return [pos[0] + x * SU * s * (flip ? -1 : 1), pos[1] - y * SU * s, pos[2] + 0.02]; };
// a burr leaping from a burdock head to the dog: arc from a to b over f0..f0+n (meadow-local)
const leap = (a, b, f0, n, f) => { const t = (f - f0) / n; if (t < 0 || t >= 1) return null; const h = 0.5 * Math.sin(Math.PI * t); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + h, a[2] + (b[2] - a[2]) * t, t * 9, 1.4]; };

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const DOG1 = [0.35, 0, 0.3];
const V = {
  hook: C(MDa(0.66, 0.62, 1.95), MDa(0.56, 0.52, 0.3), 42, 1.6, MDa(0.6, 0.55, 0.3)),
  walk: C(MDa(-0.1, 1.2, 5.6), MDa(0.25, 0.85, 0), 44, 1.0, MDa(0.3, 0.8, 0)),
  pick: C(SDa(2.6, 1.35, 2.7), SDa(1.25, 0.85, -0.7), 46, 1.4, SDa(1.4, 0.8, -0.6)),
  hooks: C(MCa(0.7, 0.7, 3.6), MCa(0, 2.0, -1), 52, 1.4, MCa(0.2, 1.5, 0)),
  grab: C(MCa(0.5, 1.15, 3.7), MCa(0, 0.95, -1), 50, 1.4, MCa(0, 0.9, 0)),
  idea: C(SDa(-0.4, 1.55, 1.3), SDa(-1.55, 1.45, -2.6), 46, 1.4, SDa(-1.4, 1.4, -2.2)),
  cotton: C(MLa(0.4, 1.55, 4.1), MLa(0.4, 1.15, -0.4), 56, 1.3, MLa(0.4, 1.0, -0.3)),
  nylon: C(MLa(0.6, 1.6, 3.7), MLa(0.4, 1.4, -0.5), 56, 1.4, MLa(0.4, 1.2, -0.3)),
  decade: C(MLa(-4.5, 2.05, 0.2), MLa(-5.98, 2.12, -1.2), 42, 1.6, MLa(-5.98, 2.2, -1.2)),
  name: C(MLa(-0.7, 1.75, 2.0), MLa(-1.05, 1.75, -3.7), 46, 1.2, MLa(-1.05, 1.6, -3.7)),
  runway: C(RWa(2.4, 1.6, 6.2), RWa(0, 1.4, -3.5), 46, 1.0, RWa(0, 1.2, 0)),
  space: C(CPa(0.2, 1.5, 1.95), CPa(0, 1.6, -1), 62, 1.4, CPa(-0.2, 1.3, -0.7)),
  payoff: C(MDa(0.45, 1.0, 5.4), MDa(-0.2, 0.95, -2), 46, 1.0, MDa(-0.1, 0.8, 0)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.06, walk: 0.06, pick: 0.08, hooks: 0.1, grab: 0.08, idea: 0.1, cotton: 0.1, nylon: 0.08, decade: 0.12, name: 0.08, runway: 0.06, space: 0.08, payoff: 0.08 };
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
// walk shot: George and the dog travel along the path
const WALK = (f) => { const s = segAt(f); return -2.2 + 2.6 * sm(s[0], B.full - 4, f); };
function cam(k, f) {
  const s = segAt(f); let c = push(V[k] || V.hook, PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const look = (d, f0, f1, fd) => { const t = sm(f0, f1, f); c = { ...c, l: add3(c.l, d.map((x) => x * t)), fp: add3(c.fp, (fd || d).map((x) => x * t)) }; };
  const move = (p, l, f0, f1, fov, fp) => { const t = sm(f0, f1, f); c = { ...c, p: lerp3(c.p, p, t), l: lerp3(c.l, l, t), fp: lerp3(c.fp, fp || l, t), fov: fov ? c.fov + (fov - c.fov) * t : c.fov }; };
  if (k === 'hook') { shake(2, 12, 0.04); punch(B.velcro, B.velcro + 6, 0.05); move(MDa(0.45, 0.85, 3.3), MDa(0.3, 0.48, 0.3), B.dog - 6, B.covered + 6, 44, MDa(0.3, 0.5, 0.3)); punch(B.burrs, B.burrs + 6, 0.08); kick(B.burrs, 0.04); }
  if (k === 'walk') { const x = WALK(f); c = { ...c, p: add3(c.p, [x * 0.8, 0, 0]), l: add3(c.l, [x * 0.9, 0, 0]), fp: add3(c.fp, [x, 0, 0]) }; punch(B.nineteen, B.nineteen + 6, 0.05); punch(B.full, B.full + 6, 0.1); kick(B.full, 0.06); }
  if (k === 'pick') { punch(B.pick, B.pick + 6, 0.06); move(SDa(EX + 0.55, EY + 0.08, EZ + 0.75), SDa(EX, EY - 0.05, EZ), B.george2 - 4, B.under + 4, 40, SDa(EX, EY, EZ)); const t = sm(B.microscope - 2, s[1], f); c = { ...c, p: lerp3(c.p, SDa(EX, EY + 0.05, EZ + 0.02), t * t), fov: c.fov * (1 - 0.4 * t * t) }; }
  if (k === 'hooks') { const t = sm(s[0], s[0] + 14, f); c = { ...c, fov: c.fov * (1.35 - 0.35 * t) }; punch(B.tiny, B.tiny + 6, 0.06); punch(B.hooks, B.hooks + 6, 0.08); }
  if (k === 'grab') { punch(B.grab, B.grab + 6, 0.08); shake(B.grab + 4, B.grab + 14, 0.05); punch(B.fur, B.fur + 6, 0.06); punch(B.fabric, B.fabric + 6, 0.06); shake(B.fabric + 4, B.fabric + 14, 0.04); }
  if (k === 'idea') { punch(B.idea, B.idea + 6, 0.08); kick(B.fake, 0.05); punch(B.hooks3, B.hooks3 + 6, 0.05); punch(B.loops, B.loops + 6, 0.05); }
  if (k === 'cotton') { punch(B.nightmare, B.nightmare + 6, 0.06); punch(B.wore, B.wore + 6, 0.1); shake(B.wore, B.wore + 12, 0.04); }
  if (k === 'nylon') { punch(B.nylon, B.nylon + 6, 0.06); look([0, 0.45, 0], B.reportedly, B.infrared, [0, 0.3, 0]); punch(B.infrared, B.infrared + 6, 0.08); look([0, -0.55, 0], B.then, B.cut, [0, -0.4, 0]); punch(B.cut, B.cut + 6, 0.06); }
  if (k === 'decade') { punch(B.decade, B.decade + 6, 0.1); }
  if (k === 'name') { look([-0.4, -0.2, 0], B.french, B.velours, [-0.4, -0.2, 0]); punch(B.velours, B.velours + 6, 0.06); look([0.85, 0, 0], B.velvet + 6, B.crochet, [0.85, 0, 0]); punch(B.crochet, B.crochet + 6, 0.06); look([-0.45, 0.6, 0], B.hook + 2, B.velcro2, [-0.45, 0.6, 0]); punch(B.velcro2, B.velcro2 + 6, 0.12); kick(B.velcro2, 0.06); }
  if (k === 'runway') { punch(B.patented, B.patented + 6, 0.06); punch(B.nose, B.nose + 6, 0.08); punch(B.cheap, B.cheap + 6, 0.1); }
  if (k === 'space') { c = { ...c, roll: 0.06 * Math.sin(f * 0.04) }; punch(B.nasa, B.nasa + 6, 0.06); punch(B.apollo, B.apollo + 6, 0.05); punch(B.tools, B.tools + 6, 0.06); }
  if (k === 'payoff') { punch(B.sound + 8, B.sound + 14, 0.08); kick(B.sound + 8, 0.05); punch(B.weeds, B.weeds + 6, 0.06); const t = sm(B.weeds + 10, NF0, f); c = { ...c, fov: c.fov + 5 * t }; }
  return c;
}
const HARD = new Set([B.most, B.but, B.patented, B.then2]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g) && g !== B.yousee);
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[2, 0.35, 8], [B.velcro, 0.2, 6], [B.burrs, 0.3, 8], [B.in41, 0.5, 10], [B.nineteen, 0.25, 6], [B.full, 0.3, 8], [B.most, 0.8, 14], [B.yousee, 0.9, 12], [B.grab, 0.3, 6], [B.fabric, 0.7, 10],
    [B.so, 0.45, 10], [B.idea, 0.4, 8], [B.but, 0.7, 12], [B.wore, 0.3, 6], [B.nylon, 0.4, 10], [B.infrared, 0.3, 8], [B.took, 0.45, 10], [B.named, 0.45, 10], [B.velcro2, 0.3, 8], [B.patented, 0.7, 12], [B.cheap, 0.3, 6],
    [B.then2, 0.7, 12], [B.tools, 0.25, 6], [B.so3, 0.6, 12], [B.sound + 8, 0.35, 8], [B.weeds, 0.3, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state
const BUSH = [[-1.0, 1.25, -2.2], [-3.2, 1.15, -1.6], [1.6, 1.2, -1.4], [3.4, 1.3, -2.0], [-2.2, 1.0, 1.9], [2.6, 1.1, 2.1]];
const HOOKFLY = [0, 4, 8, 13, 18, 23, 29, 35, 41, 48, 56, 64]; // hook shot: burr leap starts
function hookBurrs(f) { const L = []; let n = 0; HOOKFLY.forEach((f0, i) => { if (f >= f0 + 10) n++; else { const p = leap(BUSH[i % 3], spotAt(DOG1, i + 1, false), f0, 10, f); if (p) L.push(p); } }); return { n, L }; }
function walkBurrs(f) { const L = []; let n = 4; const x = WALK(f), dog = [x + 0.75, 0, 0.35], s0 = B.home, st = Math.max(3, Math.floor((B.full - s0) / 13));
  for (let i = 0; i < 12; i++) { const f0 = s0 + i * st; if (f >= f0 + 9) n++; else { const p = leap([dog[0] + 1.2 + (i % 3) * 0.5, 1.1, i % 2 ? 1.7 : -1.5], spotAt(dog, (i + 4) % 18, false), f0, 9, f); if (p) L.push(p); } } return { n: Math.min(18, n), L }; }
export function worldAt(f, w) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const V2 = w.vc; if (!V2) return;
  if (k === 'hook') V2.setFly(hookBurrs(f).L); else if (k === 'walk') V2.setFly(walkBurrs(f).L);
  else if (k === 'payoff') { const L = []; for (let i = 0; i < 10; i++) { const f0 = B.dog3 + 6 + i * 3, p = leap([-1.0 + (i % 3) * 0.3, 1.1, -2.2], [-0.3 + (i % 4) * 0.12, 0.4 + (i % 3) * 0.08, -0.6], f0, 10, f); if (p) L.push(p); } V2.setFly(L); } else V2.setFly([]);
  V2.setPlan(k === 'idea' ? (f >= B.loops ? 3 : f >= B.hooks3 ? 2 : f >= B.idea ? 1 : 0) : k === 'pick' ? 0 : 3);
  V2.setEye(k === 'pick' ? 0.8 * sm(B.george2, B.microscope, f) : 0);
  // micro: hooks only (board high), then fur grabbed, then fabric grabbed
  if (k === 'hooks') { V2.setMicro(0); V2.setPress(0.1 + 0.1 * sm(B.every, B.hooks, f)); }
  if (k === 'grab') { const fab = f >= B.fabric; V2.setMicro(fab ? 0 : 1); if (!fab) V2.setPress(0.2 + 0.8 * sm(B.grab - 8, B.grab + 2, f), sm(B.loop, B.fur + 4, f)); else V2.setPress(0.6 + 0.4 * sm(B.fabric, B.fabric + 6, f), sm(B.fabric + 10, B.fabric + 22, f)); }
  V2.setIR(k === 'nylon' ? sm(B.infrared - 6, B.infrared + 2, f) : k === 'decade' || k === 'name' ? 0.6 : 0);
  V2.setYear(k === 'decade' ? 1941 + 9 * sm(B.took, B.decade + 6, f) : k === 'name' ? 1951 : k === 'nylon' || k === 'cotton' ? 1946 : 1941);
  V2.setName(k === 'name' && f >= B.velcro2 ? 1 : 0);
  const fl = [B.patented + 4, B.nose, B.cheap, B.cheap + 9].map((x) => (f >= x && f < x + 5 ? 1 - (f - x) / 5 : 0)); V2.setFlash(k === 'runway' ? Math.max(...fl) : 0);
  V2.setFloat(k === 'space' ? sm(B.tools - 4, B.away + 10, f) : 0);
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const DOG = (f, pos, opts = {}, extra = {}) => person(f, 'VCDOG', 9, pos, { t: f, pose: 'stand', expr: 'happy', ...opts }, { s: DOGS, ...extra });
const BURRY = (f, pos, opts = {}, extra = {}) => person(f, 'BURRY', 5, pos, { t: f, pose: 'stand', expr: 'smile', ...opts }, { s: 0.32, ...extra });
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') { const n = hookBurrs(f).n;
    A.push(DOG(f, MDa(...DOG1), { expr: f < B.covered ? 'happy' : f < B.burrs ? 'shock' : 'sad', pose: f > B.burrs + 4 ? 'shake' : 'stand', burrs: n, wag: f < B.covered ? 1 : 0.2 }));
    const bt = sm(0, 10, f), bp = lerp3(MDa(-0.9, 0.9, 0.1), MDa(DOG1[0] - 0.12, 0.34, DOG1[2] + 0.06), bt); bp[1] += 0.4 * Math.sin(Math.PI * bt) - 0.34;
    A.push(BURRY(f, bp, { expr: f < 10 ? 'happy' : f < B.covered ? 'smug' : 'happy', pose: f < 10 ? 'cheer' : 'grab' }, { s: 0.3 })); }
  if (k === 'walk') { const x = WALK(f), wb = walkBurrs(f), stop = f >= B.full;
    A.push(P(f, 'VC_GEORGE', 21, MDa(x, 0, -0.05), { expr: f < B.full ? 'smile' : 'surprised', prop: 'stick' }));
    A.push(DOG(f, MDa(x + 0.75, 0, 0.35), { expr: stop ? 'shock' : 'happy', pose: stop ? 'stand' : 'walk', burrs: wb.n, speed: 0.3 }));
    A.push(BURRY(f, MDa(x + 0.63, 0.3, 0.42), { expr: 'smug', pose: 'grab' }, { s: 0.22 })); }
  if (k === 'pick') { const n = Math.max(2, 16 - Math.floor(10 * sm(B.most + 6, B.george2, f)));
    A.push(DOG(f, SDa(1.7, 0, -0.45), { expr: f < B.pick ? 'sad' : f < B.george2 ? 'sleepy' : 'happy', pose: 'sit', burrs: n, flip: true }));
    A.push(P(f, 'VC_GEORGEIN', 22, SDa(f < B.george2 ? 1.0 : 0.7, 0, f < B.george2 ? -0.65 : -1.45), { expr: f < B.pick ? 'thoughtful' : f < B.george2 ? 'determined' : 'excited', prop: 'burrpinch', view: f < B.george2 ? '34R' : '34L' }));
    A.push(BURRY(f, SDa(EX + 0.12, SCOPE.DESK, EZ + 0.16), { expr: f < B.george2 ? 'worried' : 'shock', pose: f < B.george2 ? 'stand' : 'shrug' }, { s: 0.12 })); }
  if (k === 'hooks') { A.push(BURRY(f, MCa(0.35, 0, 1.0), { expr: f < B.tiny ? 'smile' : 'proud', pose: f < B.tiny ? 'wave' : 'point', look: -0.5 }, { s: 1.0 })); }
  if (k === 'grab') { A.push(BURRY(f, MCa(-1.2, 0, 1.4), { expr: f < B.grab ? 'smile' : f < B.fur ? 'happy' : f < B.fabric ? 'love' : 'happy', pose: f < B.grab ? 'point' : 'cheer', flip: true }, { s: 0.8 })); }
  if (k === 'idea') { A.push(P(f, 'VC_GEORGEIN', 22, SDa(-1.05, 0, -1.9), { expr: f < B.idea ? 'thoughtful' : f < B.hooks3 ? 'excited' : 'happy', view: '34L', prop: f >= B.loops ? 'loops' : f >= B.hooks3 ? 'strip' : undefined, point: f >= B.idea && f < B.hooks3 ? 1 : undefined }));
    A.push(DOG(f, SDa(2.0, 0.06, -0.6), { expr: 'sleepy', pose: 'sit', burrs: 0, flip: true, wag: 0.1 }));
    A.push(BURRY(f, SDa(-1.85, 1.3, -2.85), { expr: f < B.fake ? 'smile' : 'love', pose: f < B.fake ? 'stand' : 'cheer' }, { s: 0.16 })); }
  if (k === 'cotton') { const worn = f >= B.wore;
    A.push(P(f, 'VC_WEAVER', 31, MLa(-0.3, 0, -0.15), { expr: f < B.nightmare ? 'determined' : worn ? 'shock' : 'nervous', view: '34R', prop: 'strip', stripCol: '#efe6d0' }));
    A.push(P(f, 'VC_GEORGEIN', 22, MLa(1.1, 0, -0.1), { expr: f < B.nightmare ? 'smile' : worn ? 'pained' : 'worried', view: '34L' }));
    A.push(BURRY(f, MLa(0.45, 0.92, -0.45), { expr: worn ? 'sad' : 'worried', pose: worn ? 'shrug' : 'stand' }, { s: 0.16 })); }
  if (k === 'nylon') { A.push(P(f, 'VC_GEORGEIN', 22, MLa(1.1, 0, -0.1), { expr: f < B.infrared ? 'excited' : 'amused', view: '34L', prop: f < B.then ? 'spool' : undefined, spoolCol: '#dff0ff', point: f >= B.then ? 1 : undefined }));
    A.push(P(f, 'VC_WEAVER', 31, MLa(-0.3, 0, -0.15), { expr: f < B.cut ? 'smile' : 'determined', view: '34R', prop: f >= B.then - 4 ? 'scissors' : undefined }));
    A.push(BURRY(f, MLa(0.45, 0.92, -0.45), { expr: f < B.infrared ? 'smile' : 'love', pose: f < B.infrared ? 'point' : 'cheer' }, { s: 0.16 })); }
  if (k === 'decade') { A.push(P(f, 'VC_GEORGEIN', 22, MLa(-5.15, 0, 0.35), { expr: f < B.decade ? 'nervous' : 'dazed', view: '34L' })); }
  if (k === 'name') { A.push(P(f, 'VC_GEORGEIN', 22, MLa(0.25, 0, -2.6), { expr: f < B.velcro2 ? 'thoughtful' : 'excited', view: '34L', point: f >= B.velours && f < B.velcro2 ? 1 : undefined, cheer: f >= B.velcro2 + 2 ? wav(f, 0) : undefined }));
    A.push(P(f, 'VC_WEAVER', 31, MLa(-2.45, 0, -2.7), { expr: f < B.velcro2 ? 'smile' : 'laugh', view: '34R', cheer: f >= B.velcro2 + 4 ? wav(f, 1) : undefined }));
    A.push(BURRY(f, MLa(-1.05, 1.13, -3.85), { expr: f < B.velcro2 ? 'smile' : 'love', pose: f < B.velcro2 ? 'wave' : 'cheer' }, { s: 0.18 })); }
  if (k === 'runway') { const z = -7 + 7.2 * sm(s[0] + 4, B.cheap, f);
    A.push(P(f, 'VC_MODEL', 41, RWa(0, 0.5, z), { expr: f < B.nose ? 'smile' : f < B.cheap ? 'nervous' : 'sad' }));
    for (const [o, sd, x, zz, ex] of [['VC_CRITIC', 42, -1.75, 0.6, 'mean'], ['VC_CRITIC2', 43, 1.8, -0.4, 'smug'], ['VC_CRITIC', 44, -1.85, -2.6, 'mean'], ['VC_CRITIC2', 45, 1.9, -3.4, 'smug']])
      A.push(P(f, o, sd, RWa(x, 0, zz), { expr: f < B.fashion ? 'surprised' : f < B.nose ? 'thoughtful' : ex, view: x < 0 ? '34R' : '34L' }, { roll: f >= B.nose ? (x < 0 ? -0.05 : 0.05) : 0 }));
    A.push(BURRY(f, RWa(0.55, 0.5, 1.6), { expr: f < B.cheap ? 'shock' : 'angry', pose: f < B.cheap ? 'shrug' : 'stand' }, { s: 0.2 })); }
  if (k === 'space') { const bob = 0.08 * Math.sin(f * 0.07); A.push(P(f, 'VC_ASTRO', 51, CPa(-0.4, 0.45 + bob, -0.75), { expr: f < B.tools ? 'surprised' : 'happy', view: '34R', cheer: f >= B.away ? wav(f, 0) : undefined }, { roll: 0.12 * Math.sin(f * 0.05) }));
    A.push(BURRY(f, CPa(0.7, 1.1 + 0.06 * Math.sin(f * 0.09 + 1), -0.2), { expr: f < B.tools ? 'smile' : 'love', pose: f < B.tools ? 'wave' : 'cheer' }, { s: 0.2, roll: 0.2 * Math.sin(f * 0.06) })); }
  if (k === 'payoff') { const jump = f >= B.dog3 && f < B.dog3 + 22, inBush = f >= B.dog3 + 14, dx = -0.3 * sm(B.dog3, B.dog3 + 14, f);
    A.push(P(f, 'VC_GEORGE', 21, MDa(0.55, 0, 0.1), { expr: f < B.sound + 8 ? 'smile' : f < B.dog3 ? 'laugh' : f < B.weeds ? 'surprised' : 'laugh', view: '34L', prop: f >= B.so3 + 4 && f < B.thank ? 'strip' : undefined }));
    A.push(DOG(f, MDa(-0.05 + dx, 0, 0.35 - 1.0 * sm(B.dog3, B.dog3 + 14, f) + (inBush ? 1.0 * sm(B.stay, B.weeds, f) : 0)), { expr: f < B.dog3 ? 'happy' : inBush ? (f < B.weeds ? 'happy' : 'smug') : 'happy', pose: jump ? 'jump' : f >= B.weeds - 6 ? 'shake' : 'stand', burrs: inBush ? 18 : 0, flip: true }));
    A.push(BURRY(f, MDa(1.35, 0, 0.6), { expr: f < B.weeds ? 'happy' : 'love', pose: f < B.weeds ? 'stand' : 'wave', flip: true }, { s: 0.3 })); }
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
const stamp = (f, f0, lines, k, x, y, z, w, F2, f1 = 1e9) => { if (f > f0 && f < f1) { const t = Math.min(1, (f - f0) / 5); F2.push({ fx: 'rstamp', lines, pos: SB(k, x, y, z), size: SWD(k, w, z) * (1.6 - 0.6 * t * t), op: Math.min(1, t * 2) }); } };
const bubble = (f, f0, lines, k, x, y, z, w, tail, F2, f1 = 1e9) => { if (f > f0 && f < f1) F2.push({ fx: 'bubble', lines, tail, pos: SB(k, x, y, z), size: SWD(k, w, z) * back(f0, f0 + 8, f) }); };
const wpuff = (f, f0, pos, size, F2, n = 16, tint) => { if (f >= f0 && f < f0 + n) F2.push({ fx: 'puff', t: (f - f0) / n, pos, size, tint }); };
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = []; CURF = f;
  if (k === 'hook') { sburst(f, 8, 'hook', -0.1, 0.0, 2, 0.5, F2); stamp(f, 9, ['STICK!'], 'hook', -0.1, 0.62, 2, 0.34, F2, B.dog - 2); sboard(f, B.dog - 2, ['VELCRO EXISTS', 'BECAUSE OF A DOG'], 'hook', 0.0, 0.66, 2, 0.56, F2, B.burrs - 2); stamp(f, B.burrs, ['BURRS!'], 'hook', 0.0, 0.62, 2, 0.4, F2); }
  if (k === 'walk') { stamp(f, B.nineteen, ['1941'], 'walk', 0.0, 0.64, 3, 0.3, F2, B.swiss - 2); sboard(f, B.swiss - 2, ['SWITZERLAND'], 'walk', 0.0, 0.66, 3, 0.4, F2, B.george - 2); sboard(f, B.george - 2, ['GEORGE DE MESTRAL', 'ENGINEER'], 'walk', 0.0, 0.66, 3, 0.56, F2, B.hunting - 2);
    sboard(f, B.hunting - 2, ['A HUNTING TRIP'], 'walk', 0.0, 0.66, 3, 0.46, F2, B.full - 2); stamp(f, B.full, ['FULL OF BURRS!'], 'walk', 0.0, 0.62, 3, 0.5, F2); sburst(f, B.full, 'walk', 0.25, -0.2, 3, 0.4, F2); }
  if (k === 'pick') { sboard(f, s[0] + 4, ['MOST PEOPLE:', 'PICK THEM OFF'], 'pick', 0.0, 0.66, 2.4, 0.5, F2, B.george2 - 2); sboard(f, B.george2, ['GEORGE:'], 'pick', 0.0, 0.68, 2.4, 0.3, F2, B.microscope - 2); stamp(f, B.microscope, ['MICROSCOPE!'], 'pick', 0.0, 0.62, 2.4, 0.46, F2, s[1] - 4); }
  if (k === 'hooks') { sboard(f, s[0] + 4, ['YOU SEE...'], 'hooks', 0.0, 0.68, 3, 0.34, F2, B.tiny - 2); stamp(f, B.hooks, ['TINY HOOKS!'], 'hooks', 0.0, 0.62, 3, 0.46, F2); sburst(f, B.hooks, 'hooks', 0.0, 0.25, 3, 0.5, F2); }
  if (k === 'grab') { stamp(f, B.grab + 2, ['GRAB!'], 'grab', 0.0, 0.64, 3, 0.3, F2, B.loop - 2); sboard(f, B.loop - 2, ['ANYTHING', 'WITH A LOOP'], 'grab', 0.0, 0.66, 3, 0.44, F2, B.fur - 2); stamp(f, B.fur, ['FUR'], 'grab', 0.0, 0.62, 3, 0.26, F2, B.fabric - 2); stamp(f, B.fabric, ['FABRIC!'], 'grab', 0.0, 0.62, 3, 0.36, F2); sburst(f, B.fabric + 4, 'grab', 0.0, -0.1, 3, 0.5, F2); }
  if (k === 'idea') { sburst(f, B.idea, 'idea', -0.2, 0.3, 2.4, 0.4, F2); stars(f, B.idea, 'idea', -0.2, 0.3, 2.4, 0.3, F2, 24); sboard(f, B.fake - 2, ['A FAKE BURR!'], 'idea', 0.0, 0.66, 2.4, 0.46, F2, B.hooks3 - 2); sboard(f, B.hooks3 - 2, ['HOOKS ON ONE STRIP...'], 'idea', 0.0, 0.66, 2.4, 0.56, F2, B.loops - 2); sboard(f, B.loops - 2, ['...LOOPS ON', 'THE OTHER'], 'idea', 0.0, 0.66, 2.4, 0.46, F2); }
  if (k === 'cotton') { sboard(f, B.nightmare - 2, ['A NIGHTMARE'], 'cotton', 0.0, 0.66, 2.4, 0.42, F2, B.cotton - 2); sboard(f, B.cotton - 2, ['COTTON HOOKS...'], 'cotton', 0.0, 0.66, 2.4, 0.46, F2, B.wore); stamp(f, B.wore, ['WORN OUT!'], 'cotton', 0.0, 0.62, 2.4, 0.42, F2); for (const f0 of [B.wore, B.wore + 6, B.fast]) wpuff(f, f0, MLa(-0.3, 1.25, -0.2), 0.5, F2, 16, '#efe6d0'); }
  if (k === 'nylon') { stamp(f, B.nylon, ['NYLON WORKED!'], 'nylon', 0.0, 0.62, 2.4, 0.48, F2, B.reportedly); sboard(f, B.reportedly, ['REPORTEDLY: SEWN UNDER', 'HOT INFRARED LIGHT'], 'nylon', 0.0, 0.66, 2.4, 0.6, F2, B.then - 2); sburst(f, B.infrared, 'nylon', 0.0, 0.2, 2.4, 0.4, F2, '#ffb0a0');
    sboard(f, B.then, ['LOOPS CUT', 'JUST RIGHT'], 'nylon', 0.0, 0.66, 2.4, 0.44, F2); sburst(f, B.cut, 'nylon', -0.1, -0.1, 2.4, 0.3, F2); }
  if (k === 'decade') { sboard(f, s[0] + 2, ['IT TOOK...'], 'decade', 0.0, 0.68, 2, 0.32, F2, B.decade - 2); stamp(f, B.decade, ['NEARLY', 'A DECADE'], 'decade', 0.0, 0.62, 2, 0.4, F2); }
  if (k === 'name') { sboard(f, B.french - 2, ['TWO FRENCH WORDS'], 'name', 0.0, 0.68, 2.4, 0.5, F2, B.velours - 2); sboard(f, B.velours - 2, ['VELOURS = VELVET'], 'name', 0.0, 0.66, 2.4, 0.5, F2, B.crochet - 2); sboard(f, B.crochet - 2, ['CROCHET = HOOK'], 'name', 0.0, 0.66, 2.4, 0.5, F2, B.velcro2 - 2);
    stamp(f, B.velcro2, ['VEL + CRO!'], 'name', 0.0, 0.64, 2.4, 0.4, F2); sburst(f, B.velcro2, 'name', 0.0, 0.25, 2.4, 0.6, F2); stars(f, B.velcro2 + 4, 'name', 0.0, 0.25, 2.4, 0.5, F2, 24); }
  if (k === 'runway') { stamp(f, B.patented, ['PATENTED!'], 'runway', 0.0, 0.62, 3, 0.4, F2, B.but2 - 2); sboard(f, B.fifties - 2, ['MID-1950s'], 'runway', 0.0, 0.5, 3, 0.3, F2, B.but2 - 2); sboard(f, B.fashion - 2, ['THE FASHION WORLD', '(REPORTEDLY)'], 'runway', 0.0, 0.66, 3, 0.56, F2, B.cheap - 2);
    stamp(f, B.cheap, ['"LOOKS CHEAP!"'], 'runway', 0.0, 0.62, 3, 0.5, F2); bubble(f, B.nose + 4, ['HMPH!'], 'runway', -0.45, 0.25, 3, 0.26, -1, F2, B.cheap - 2); }
  if (k === 'space') { stamp(f, B.nasa, ['NASA CALLED'], 'space', 0.0, 0.62, 2.4, 0.46, F2, B.apollo - 2); sboard(f, B.apollo - 2, ['THE APOLLO', 'MISSIONS'], 'space', 0.0, 0.66, 2.4, 0.46, F2, B.tools - 2); stamp(f, B.tools, ['STUCK!'], 'space', 0.0, 0.62, 2.4, 0.34, F2, B.floating - 2);
    sboard(f, B.floating - 2, ['NO MORE', 'FLOATING AWAY'], 'space', 0.0, 0.66, 2.4, 0.46, F2); for (const f0 of [B.tools + 4, B.snacks, B.floating + 4]) sburst(f, f0, 'space', -0.35 + (f0 % 3) * 0.3, 0.0, 2.4, 0.3, F2, '#d8e8ff', 10); }
  if (k === 'payoff') { stamp(f, B.sound + 8, ['RRRIP!'], 'payoff', 0.0, 0.62, 3, 0.4, F2, B.thank); sburst(f, B.sound + 8, 'payoff', 0.15, 0.05, 3, 0.45, F2); sboard(f, B.thank, ['THANK A DOG'], 'payoff', 0.0, 0.66, 3, 0.44, F2, B.weeds);
    stamp(f, B.weeds, ['AGAIN!'], 'payoff', 0.0, 0.62, 3, 0.32, F2); bubble(f, B.weeds + 10, ['WORTH IT!'], 'payoff', -0.2, 0.36, 3, 0.36, 1, F2); stars(f, B.weeds + 6, 'payoff', 0.0, 0.3, 3, 0.5, F2, 24); }
  return F2;
}
