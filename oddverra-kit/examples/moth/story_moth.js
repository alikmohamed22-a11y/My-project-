// [MT-story] "The first computer bug was a real moth" timeline (56.77 s voice, 1703 f @ 30 fps).
// Sets: mt_sets.js (lab / relay / desk / edison / museum) through setAt. Pattern: story_niagara.js (slow push per shot, zoom-through
// whips on cuts, screen-pinned boards / bursts / stamps, punch-ins on beats). The motif is the moth (MOTHY card): it flutters through
// the Mark II room in the hook, gets wedged in Relay #70, is taped flat into the logbook (decal, dazed -> wink), and the payoff
// returns to it in the museum case with the cartoon moth sitting smugly on top. Relay clicks are the sound motif.
import * as S from './story.js';
import { LAB, RELAY, DESK } from './mt_sets.js';
const { sm, eo, back, add3, dist, q, person } = S;

// [f0, f1, id, set]                                   narration (word frames from work/words_frames.txt)
const SH = [
  [0, 100, 'hook', 'lab'],            // The first computer bug... was an actual bug.  (bug 30, actual 57, bug 72)
  [100, 204, 'date', 'labCal'],       // September ninth, nineteen forty-seven. Harvard University.  (Sept 103, 9th 111, 1947 131, Harvard 166)
  [204, 364, 'machine', 'lab'],       // The Mark Two is a giant computer: a room full of thousands of clicking switches called relays.  (Mark 206, giant 238, room 273, thousands 293, clicking 313, relays 344)
  [364, 428, 'wrong', 'labAlarm'],    // And today, something is wrong.  (today 368, wrong 401)
  [428, 568, 'hunt', 'labHunt'],      // So the operators go hunting. Panel by panel. Relay by relay.  (operators 441, hunting 462, panel 488/496, relay 514/532, until 550)
  [568, 642, 'find', 'labHunt'],      // Until, in Relay number seventy, Panel F, they find it.  (relay 572, seventy 586, Panel F 607/611, find 633)
  [642, 724, 'moth', 'relay'],        // A moth! Trapped in the switch.  (moth 663, trapped 674, switch 705)
  [724, 864, 'tape', 'desk'],         // They pull it out, tape it into the logbook, and write: First actual case of bug being found.  (pull 726, tape 748, logbook 766, write 786, first 804, found 852)
  [864, 1053, 'hopper', 'lab'],       // Grace Hopper was on that team, and she loved telling this story. Though reportedly, she wasn't the one who found it.  (Grace 864, Hopper 887, team 912, loved 934, story 960, reportedly 981, wasn't 1009, found 1032)
  [1053, 1116, 'actual', 'deskQ'],    // But why does it say "actual"?  (why 1057, actual 1082)
  [1116, 1285, 'edison', 'edison'],   // You see, engineers were already calling glitches "bugs." Thomas Edison did it back in the 1870s.  (engineers 1137, glitches 1173, bugs 1189, Thomas 1216, Edison 1221, 1870s 1251)
  [1285, 1334, 'joke', 'labJoke'],    // So the note was a joke.  (note 1300, joke 1319)
  [1334, 1412, 'real', 'desk'],       // For once, the bug was a real bug.  (once 1337, real 1379, bug 1388)
  [1412, 1518, 'museum', 'museum'],   // And that moth is still taped in the logbook, now at the Smithsonian.  (moth 1419, still 1434, taped 1443, logbook 1459, Smithsonian 1489)
  [1518, 1703, 'payoff', 'museumGold'], // The most famous bug in computer history... and it never wrote a single line of code.  (famous 1529, history 1568, never 1603, single 1625, code 1649)
];
export const NF = 1703;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: 'day', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {};
export const setAt = (f) => ['mt', segAt(f)[3]];

// ---------- places (set-local -> world)
const O = { lab: [-142000, 0, 0], relay: [-142000, 0, 800], desk: [-144500, 0, 0], edison: [-144500, 0, 800], museum: [-144500, 0, 1600] };
const at = (o) => (x, y, z) => [x + o[0], y + o[1], z + o[2]];
const LA = at(O.lab), RL = at(O.relay), DK = at(O.desk), ED = at(O.edison), MU = at(O.museum);
const { ZP, FX, PD, CON } = LAB, PF = ZP + PD / 2; // panel front plane z
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
// keyed path: [[f, p, l], ...] smooth between keys
const path = (keys, f) => { if (f <= keys[0][0]) return keys[0]; for (let i = 0; i < keys.length - 1; i++) { const [f0, p0, l0] = keys[i], [f1, p1, l1] = keys[i + 1]; if (f < f1) { const t = sm(f0, f1, f); return [f, lerp3(p0, p1, t), lerp3(l0, l1, t)]; } } return keys[keys.length - 1]; };
const HUNTX = (f) => 4.6 - 6.2 * sm(430, 566, f); // hunters' lead x along the panel row (N -> F)

// ---------- cameras
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp: fp || l });
const V = {
  hook: C(LA(0.6, 1.55, 5.4), LA(-2.4, 1.55, -4.6), 46, 1.2, LA(-1.0, 1.5, 2.6)),
  date: C(LA(6.3, 2.0, 0.55), LA(10, 2.2, -0.15), 46, 1.6, LA(10, 2.1, 0.0)),
  machine: C(LA(5.6, 1.5, 3.8), LA(3.4, 1.1, 0.9), 46, 1.2, LA(3.4, 1.0, 1.0)),
  wrong: C(LA(FX + 2.6, 1.6, ZP + 6.6), LA(FX + 0.7, 1.55, ZP), 46, 1.3, LA(FX + 1.3, 1.4, ZP + 2.4)),
  hunt: C(LA(4.6, 1.55, -1.0), LA(3.0, 1.3, ZP), 46, 1.2, LA(3.2, 1.2, ZP + 1.4)),
  find: C(LA(FX + 1.0, 1.5, PF + 2.6), LA(FX, 1.35, ZP), 44, 1.4, LA(FX, 1.3, PF)),
  moth: C(RL(13.5, 4.6, 10.5), RL(RELAY.CX, RELAY.CY, 0), 42, 1.4, RL(RELAY.CX, RELAY.CY, RELAY.CZ)),
  tape: C(DK(0.9, 4.4, 1.7), DK(0.9, 0, -0.02), 40, 1.0, DK(0.9, 0, 0.0)),
  hopper: C(LA(3.6, 1.5, 6.4), LA(3.6, 1.15, 1.2), 46, 1.2, LA(3.5, 1.2, 2.0)),
  actual: C(DK(0.8, 1.6, 1.25), DK(0.72, 0, 0.27), 36, 1.6, DK(0.72, 0, 0.27)),
  edison: C(ED(0.4, 1.6, 4.6), ED(0.7, 1.3, -0.2), 46, 1.2, ED(1.0, 1.2, 1.2)),
  joke: C(LA(3.7, 1.55, 6.0), LA(3.6, 1.15, 1.2), 44, 1.2, LA(3.5, 1.2, 2.0)),
  real: C(DK(1.75, 1.45, 0.75), DK(1.66, 0, -0.12), 36, 1.8, DK(1.66, 0, -0.12)),
  museum: C(MU(0.5, 2.1, 5.3), MU(0, 1.45, 0), 44, 1.2, MU(0, 1.3, 0)),
  payoff: C(MU(0.6, 2.2, 2.8), MU(-0.1, 2.0, 0.0), 40, 1.6, MU(-0.2, 2.3, 0.2)),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]], L = Math.hypot(...d), kk = Math.sign(k) * Math.min(Math.abs(k) * L, 1.6) / L; return { ...v, p: add3(v.p, d.map((x) => x * kk * t)) }; };
const PUSH = { hook: 0.12, date: 0.14, machine: 0, wrong: 0.1, hunt: 0, find: 0, moth: 0.14, tape: 0.03, hopper: 0.1, actual: 0.12, edison: 0, joke: 0.1, real: 0.14, museum: 0.16, payoff: 0 };
const base = (k) => V[k] || V.hook;
function cam(k, f) {
  const s = segAt(f); let c = push(base(k), PUSH[k] ?? 0.08, s[0], s[1], f);
  const punch = (f0, f1, a) => { const t = eo(f0, f1, f); c = { ...c, fov: c.fov * (1 - a * t) }; };
  const kick = (f0, a) => { const t = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - f0) / 6))) * a; c = { ...c, l: add3(c.l, [0, t, 0]) }; };
  const shake = (f0, f1, a) => { if (f < f0 || f > f1) return; const k2 = a * (1 - (f - f0) / (f1 - f0)); c = { ...c, l: add3(c.l, [Math.sin(f * 2.3) * k2, Math.cos(f * 3.1) * k2, 0]) }; };
  const keyed = (keys) => { const [, p, l] = path(keys, f); c = { ...c, p, l, fp: l }; };
  if (k === 'hook') { punch(30, 36, 0.06); punch(57, 63, 0.1); kick(72, 0.04); }
  if (k === 'date') { punch(131, 137, 0.06); punch(166, 172, 0.06); }
  if (k === 'machine') { keyed([[206, LA(5.4, 1.45, 3.6), LA(3.3, 1.05, 0.9)], [290, LA(6.2, 3.1, 8.6), LA(-1.5, 1.3, -3.8)], [322, LA(5.7, 2.95, 8.1), LA(-1.8, 1.3, -3.9)], [352, LA(-4.6, 1.55, -2.7), LA(-5.4, 1.35, -5.2)], [364, LA(-4.75, 1.5, -3.0), LA(-5.4, 1.35, -5.2)]]); c.fov = 46 + 4 * sm(206, 290, f) - 6 * sm(322, 352, f); punch(344, 350, 0.08); }
  if (k === 'wrong') { punch(401, 407, 0.1); kick(401, 0.06); shake(401, 420, 0.05); }
  if (k === 'hunt') { const x = HUNTX(f); c = { ...c, p: LA(x + 1.9, 1.55, -1.1), l: LA(x - 0.6, 1.3, ZP), fp: LA(x - 0.2, 1.25, PF + 1.2) }; punch(488, 494, 0.04); punch(514, 520, 0.04); }
  if (k === 'find') { keyed([[568, LA(FX + 1.4, 1.5, PF + 2.8), LA(FX, 1.4, ZP)], [600, LA(FX + 0.8, 1.45, PF + 2.0), LA(FX + 0.05, 1.35, ZP)], [632, LA(FX + 0.25, 1.32, PF + 0.75), LA(FX + 0.16, 1.26, ZP - 0.2)]]); c.fp = LA(FX + 0.16, 1.26, ZP - 0.15); punch(586, 592, 0.06); punch(611, 617, 0.06); }
  if (k === 'moth') { punch(663, 669, 0.1); kick(663, 0.06); punch(705, 711, 0.06); }
  if (k === 'tape') { punch(753, 759, 0.06); kick(753, 0.04);  }
  if (k === 'hopper') { punch(887, 893, 0.06); punch(1009, 1015, 0.08); kick(1009, 0.04); }
  if (k === 'actual') { punch(1082, 1090, 0.12); kick(1082, 0.03); }
  if (k === 'edison') { keyed([[1116, ED(0.4, 1.65, 4.8), ED(0.7, 1.3, -0.4)], [1205, ED(0.9, 1.6, 3.6), ED(1.0, 1.25, 0.2)], [1250, ED(1.95, 1.55, 1.95), ED(1.55, 0.82, 0.62)], [1285, ED(1.85, 1.4, 1.7), ED(1.55, 0.82, 0.62)]]); c.fp = f < 1230 ? ED(1.0, 1.2, 1.1) : ED(1.55, 0.82, 0.62); c.fov = 46 - 8 * sm(1205, 1250, f); punch(1189, 1195, 0.05); punch(1251, 1257, 0.06); }
  if (k === 'joke') { punch(1319, 1325, 0.08); kick(1319, 0.04); }
  if (k === 'real') { punch(1379, 1385, 0.06); punch(1388, 1396, 0.1); kick(1388, 0.04); }
  if (k === 'museum') { punch(1489, 1495, 0.06); }
  if (k === 'payoff') { c = push(c, 0.1, 1518, 1640, f); punch(1529, 1535, 0.05); punch(1649, 1656, 0.1); kick(1649, 0.04); const t = sm(1660, 1703, f); c = { ...c, p: lerp3(c.p, MU(0.8, 2.3, 4.2), t), fov: c.fov + 4 * t }; }
  return c;
}
const HARD = new Set([]);
const CUTS = SH.slice(1).map((s) => s[0]).filter((g) => !HARD.has(g));
export function camAt(f) {
  const s = segAt(f), c = { ...cam(s[2], f) };
  for (const g of CUTS) { const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  c.fp = c.fp || c.l; c.focus = dist(c.p, c.fp); c.shadowAt = c.fp; return c;
}
export function gradeAt(f) {
  let flash = 0;
  for (const [c, a, n] of [[57, 0.35, 6], [100, 0.4, 10], [204, 0.3, 8], [344, 0.25, 6], [364, 0.4, 10], [401, 0.35, 6], [428, 0.3, 10], [568, 0.25, 8], [642, 0.5, 10], [663, 0.35, 6], [724, 0.4, 10], [753, 0.25, 6], [864, 0.3, 10], [1009, 0.25, 6], [1053, 0.3, 8], [1116, 0.75, 12], [1285, 0.6, 12], [1334, 0.3, 8], [1388, 0.35, 6], [1412, 0.75, 12], [1518, 0.3, 10], [1649, 0.35, 8]])
    if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  return { flash, look: 'office' };
}

// ---------- world state
export function worldAt(f, w) {
  const k = segAt(f)[2];
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  const T = w.mt; if (!T) return;
  const blinkA = (f0) => (Math.sin((f - f0) * 0.45) > 0 ? 1 : 0.25);
  const st = { alarm: 0, door: 0, click: 0, torch: 0, spark: 0, lampsOn: 1, r70: 0, spots: [], wr: 1, circ: 0, tape: 1, drop: 1, face: 'daze', later: false };
  if (k === 'wrong') { st.alarm = f < 380 ? 0 : blinkA(380); st.lampsOn = 1 - sm(372, 400, f); }
  if (k === 'hunt') { const x = HUNTX(f); st.alarm = 0.35 * blinkA(0); st.lampsOn = 0; st.spots = [[x - 0.4 + 0.3 * Math.sin(f * 0.07), 1.3 + 0.5 * Math.sin(f * 0.05), 1], [x + 1.1 + 0.25 * Math.sin(f * 0.06 + 2), 0.9 + 0.6 * Math.sin(f * 0.043 + 1), 0.8]]; }
  if (k === 'find') { st.alarm = 0.35 * blinkA(0); st.lampsOn = 0; const t = sm(568, 600, f); st.spots = [[FX + 0.2 * (1 - t), 1.3 + 0.2 * (1 - t), 1], [FX + 1.0 - 0.6 * t, 1.0 + 0.2 * t, 0.8 * (1 - sm(610, 630, f))]]; st.door = eo(588, 606, f); st.r70 = sm(586, 600, f); }
  if (k === 'moth') { st.torch = 1; st.click = f < 690 ? 0 : 0.4 * Math.max(0, Math.sin((f - 690) * 0.9)) * (f < 720 ? 1 : 0); st.spark = f >= 692 && f < 718 && Math.sin((f - 690) * 0.9) > 0.6 ? 1 : 0; }
  if (k === 'tape') { st.drop = sm(728, 748, f); st.tape = eo(750, 757, f); st.wr = sm(788, 860, f); st.face = 'daze'; }
  if (k === 'actual') { st.circ = sm(1074, 1096, f); st.face = 'daze'; }
  if (k === 'real') { st.circ = 0; st.face = f < 1386 ? 'daze' : f < 1404 ? 'wink' : 'smile'; st.later = false; }
  if (k === 'hopper' || k === 'joke' || k === 'machine' || k === 'date' || k === 'hook') st.lampsOn = 1;
  T.set(st);
}

// ---------- actors
const P = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
const wav = (f, i = 0, a = 0.4) => q(0.55 + a * Math.sin(f * 0.42 + i), 0.1);
// MOTHY: centre point c of the moth body; s card scale (card height 2.25*s); pose fly/stuck/sit
const MOTH = (f, c, s, opts = {}, extra = {}) => { const pose = opts.pose || 'fly', cy = pose === 'fly' || pose === 'cheer' ? 560 : pose === 'stuck' ? 520 : 330; const up = (965 - cy) / 1000 * 2.25 * s;
  return { o: 'MOTHY', k: 2, pos: add3(c, [0, -up, 0]), roll: extra.roll || 0, blob: false, s, opts: { seed: 7, t: f, pose, ...opts } }; };
const flyPath = (pts, f0, f1, f) => { const t = sm(f0, f1, f), n = pts.length - 1, i = Math.min(n - 1, Math.floor(t * n)), u = t * n - i; const a = pts[i], b = pts[i + 1]; return lerp3(a, b, u * u * (3 - 2 * u)); };
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') { const c = flyPath([LA(-1.6, 2.0, 0.4), LA(-1.6, 1.8, 0.6), LA(-1.0, 1.45, 1.6), LA(-0.15, 1.3, 2.9)], 0, 56, f), wob = [0.08 * Math.sin(f * 0.21), 0.06 * Math.sin(f * 0.33), 0];
    A.push(MOTH(f, add3(c, wob), 0.32, { pose: 'fly', expr: f < 57 ? 'smile' : f < 80 ? 'surprised' : 'happy', flip: f < 60, flap: 1.3 }));
    A.push(P(f, 'MT_OP1', 11, LA(-5.0, 0, -3.2), { expr: 'smile', view: '34R', prop: 'ledger' })); A.push(P(f, 'MT_OP2', 12, LA(1.4, 0, -3.4), { expr: 'smile', view: '34L' })); }
  if (k === 'date') { const c = flyPath([LA(9.6, 1.4, 1.3), LA(9.5, 1.9, 0.6), LA(9.55, 2.5, -0.2), LA(9.4, 2.9, -1.2)], 100, 200, f);
    A.push(MOTH(f, add3(c, [0, 0.05 * Math.sin(f * 0.3), 0]), 0.14, { pose: 'fly', expr: 'smile', flip: true, flap: 1.4 })); }
  if (k === 'machine') { A.push(P(f, 'MT_OP1', 11, LA(CON[0] - 0.2, 0, CON[2] - 0.75), { expr: f < 300 ? 'smile' : 'happy', view: '34L', prop: 'pencil' }));
    A.push(P(f, 'MT_HOPPER', 1, LA(CON[0] + 1.3, 0, CON[2] - 0.2), { expr: f < 260 ? 'smile' : 'grin', view: '34L', prop: 'ledger' }));
    A.push(P(f, 'MT_OP2', 12, LA(-0.6, 0, -3.6), { expr: 'smile', view: '34R' })); A.push(P(f, 'MT_OP3', 13, LA(-6.2, 0, -3.4), { expr: 'happy', view: '34R', point: 1 }));
    const c = flyPath([LA(-6.5, 3.2, -4.0), LA(-3.0, 3.3, -3.0), LA(0.5, 3.0, -2.5)], 230, 364, f); A.push(MOTH(f, add3(c, [0, 0.06 * Math.sin(f * 0.3), 0]), 0.12, { pose: 'fly', expr: 'smile', flip: false, flap: 1.4 })); }
  if (k === 'wrong') { A.push(P(f, 'MT_OP1', 11, LA(FX + 2.7, 0, ZP + 2.3), { expr: f < 401 ? 'surprised' : 'shock', view: '34L', point: f > 404 ? 1 : undefined }));
    A.push(P(f, 'MT_OP2', 12, LA(FX + 0.3, 0, ZP + 1.6), { expr: f < 401 ? 'worried' : 'shock', view: '34R' }));
    A.push(P(f, 'MT_HOPPER', 1, LA(FX + 1.4, 0, ZP + 2.9), { expr: f < 401 ? 'thoughtful' : 'worried', view: 'front', prop: 'ledger' })); }
  if (k === 'hunt') { const x = HUNTX(f), ph1 = (f * 0.05) % 1, ph2 = (f * 0.05 + 0.5) % 1, mv = f < 562;
    A.push(P(f, 'MT_OP1', 11, LA(x - 0.3, 0, PF + 0.9), { expr: 'determined', view: '34L', prop: 'flashlight', ...(mv ? { mode: 'run', gait: 'walk', phase: q(ph1, 0.05) } : {}) }));
    A.push(P(f, 'MT_OP2', 12, LA(x + 1.3, 0, PF + 1.3), { expr: f < 514 ? 'worried' : 'determined', view: '34L', prop: 'flashlight', ...(mv ? { mode: 'run', gait: 'walk', phase: q(ph2, 0.05) } : {}) })); }
  if (k === 'find') { A.push(P(f, 'MT_OP1', 11, LA(FX - 0.85, 0, PF + 0.7), { expr: f < 633 ? 'determined' : 'shock', view: '34R', prop: 'flashlight' }));
    A.push(P(f, 'MT_OP2', 12, LA(FX + 1.3, 0, PF + 1.1), { expr: f < 600 ? 'worried' : 'surprised', view: '34L', prop: 'flashlight' })); }
  if (k === 'moth') { const wig = f > 688 && f < 722 ? 1 : 0; A.push(MOTH(f, RL(RELAY.CX, RELAY.CY + 0.05, RELAY.CZ), 3.1, { pose: 'stuck', expr: f < 668 ? 'dazed' : f < 700 ? 'shock' : 'dazed', wiggle: wig })); }
  if (k === 'hopper') { const tell = f >= 930 && f < 976;
    A.push(P(f, 'MT_HOPPER', 1, LA(3.0, 0, 2.3), { expr: f < 900 ? 'smile' : tell ? 'laugh' : f < 1009 ? 'happy' : f < 1032 ? 'sly' : 'grin', view: '34R', prop: f < 1000 ? 'ledger' : undefined, point: f >= 1009 ? 1 : undefined }));
    A.push(P(f, 'MT_OP1', 11, LA(4.2, 0, 2.0), { expr: f < 930 ? 'smile' : f < 1009 ? 'laugh' : 'grin', view: '34L', wave: f >= 1012 ? wav(f, 0, 0.3) : undefined }));
    A.push(P(f, 'MT_OP2', 12, LA(3.4, 0, 0.35), { expr: f < 930 ? 'smile' : 'laugh', view: '34L', prop: f < 1009 ? 'tweezers' : undefined, cheer: f >= 1016 ? wav(f, 1, 0.3) : undefined }));
    A.push(P(f, 'MT_OP3', 13, LA(2.55, 0, 0.7), { expr: f < 930 ? 'happy' : 'laugh', view: '34L' })); }
  if (k === 'edison') { A.push(P(f, 'MT_EDISON', 21, ED(0.55, 0, 1.35), { expr: f < 1173 ? 'thoughtful' : f < 1216 ? 'angry' : 'smile', view: '34R', prop: 'pen', point: f >= 1176 && f < 1210 ? 1 : undefined })); }
  if (k === 'joke') { A.push(P(f, 'MT_HOPPER', 1, LA(3.0, 0, 2.3), { expr: f < 1319 ? 'grin' : 'laugh', view: '34R', prop: 'ledger' }));
    A.push(P(f, 'MT_OP1', 11, LA(4.2, 0, 2.0), { expr: 'laugh', view: '34L', cheer: f > 1320 ? wav(f, 0, 0.3) : undefined })); A.push(P(f, 'MT_OP2', 12, LA(3.4, 0, 0.35), { expr: f < 1319 ? 'grin' : 'laugh', view: '34L' }));
    A.push(P(f, 'MT_OP3', 13, LA(2.55, 0, 0.7), { expr: 'laugh', view: '34L' })); }
  if (k === 'museum') { A.push(P(f, 'MT_VIS1', 31, MU(-0.6, 0, 1.75), { expr: f < 1443 ? 'smile' : 'surprised', view: '34R', point: f >= 1446 && f < 1480 ? 1 : undefined }));
    A.push(P(f, 'MT_VIS2', 32, MU(0.62, 0, 1.85), { expr: f < 1489 ? 'happy' : 'excited', view: '34L' })); A.push(P(f, 'MT_VISKID', 33, MU(0.05, 0, 2.3), { expr: f < 1460 ? 'excited' : 'surprised', view: '34R', point: f > 1470 ? 1 : undefined }, { s: 0.7 })); }
  if (k === 'payoff') { const c = lerp3(MU(-0.9, 2.9, 0.6), MU(-0.12, 2.2, 0.3), sm(1518, 1546, f)), hov = [0.05 * Math.sin(f * 0.13), 0.05 * Math.sin(f * 0.21), 0];
    A.push(MOTH(f, add3(c, hov), 0.42, { pose: f >= 1649 && f < 1684 ? 'cheer' : 'fly', expr: f < 1546 ? 'smile' : f < 1603 ? 'smug' : f < 1649 ? 'smile' : f < 1684 ? 'wink' : 'happy', flap: 1.3, flip: f < 1546 })); }
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
  if (k === 'hook') { sboard(f, 4, ['THE FIRST', 'COMPUTER BUG...'], 'hook', 0.0, 0.66, 3, 0.5, F2, 55); stamp(f, 57, ['...WAS AN', 'ACTUAL BUG!'], 'hook', 0.0, 0.62, 3, 0.5, F2); sburst(f, 57, 'hook', 0.0, 0.62, 3, 0.5, F2); }
  if (k === 'date') { sboard(f, 104, ['SEPT. 9, 1947'], 'date', 0.0, 0.68, 3, 0.5, F2, 164); sboard(f, 166, ['HARVARD', 'UNIVERSITY'], 'date', 0.0, 0.66, 3, 0.46, F2); }
  if (k === 'machine') { sboard(f, 208, ['THE HARVARD', 'MARK II'], 'machine', 0.0, 0.66, 3, 0.46, F2, 290); sboard(f, 292, ['THOUSANDS OF', 'CLICKING RELAYS'], 'machine', 0.0, 0.66, 3, 0.54, F2, 342); stamp(f, 344, ['RELAYS'], 'machine', 0.0, 0.62, 3, 0.34, F2); }
  if (k === 'wrong') { sboard(f, 368, ['AND TODAY...'], 'wrong', 0.0, 0.68, 3, 0.4, F2, 399); stamp(f, 401, ["SOMETHING'S", 'WRONG!'], 'wrong', 0.0, 0.62, 3, 0.46, F2); sburst(f, 401, 'wrong', 0.0, 0.62, 3, 0.5, F2, '#ffb0a0'); }
  if (k === 'hunt') { sboard(f, 432, ['THE HUNT', 'BEGINS'], 'hunt', 0.0, 0.66, 3, 0.42, F2, 486); sboard(f, 488, ['PANEL', 'BY PANEL...'], 'hunt', 0.0, 0.66, 3, 0.4, F2, 512); sboard(f, 514, ['RELAY', 'BY RELAY...'], 'hunt', 0.0, 0.66, 3, 0.4, F2); }
  if (k === 'find') { sboard(f, 574, ['RELAY #70'], 'find', 0.0, 0.68, 3, 0.4, F2, 606); stamp(f, 608, ['PANEL F'], 'find', 0.0, 0.62, 3, 0.36, F2); }
  if (k === 'moth') { stamp(f, 663, ['A MOTH!'], 'moth', 0.0, 0.62, 3, 0.42, F2, 700); sburst(f, 663, 'moth', 0.0, 0.0, 3, 0.6, F2); sboard(f, 702, ['TRAPPED IN', 'THE SWITCH'], 'moth', 0.0, 0.66, 3, 0.46, F2); stars(f, 670, 'moth', 0.05, 0.22, 3, 0.4, F2, 26); }
  if (k === 'tape') { sboard(f, 728, ['PULLED OUT...'], 'tape', 0.0, 0.7, 3, 0.4, F2, 750); sboard(f, 752, ['...TAPED IN', 'THE LOGBOOK'], 'tape', 0.0, 0.68, 3, 0.44, F2, 784); sburst(f, 753, 'tape', 0.18, 0.05, 3, 0.4, F2); sboard(f, 788, ['3:45 PM'], 'tape', 0.0, 0.72, 3, 0.3, F2); }
  if (k === 'hopper') { sboard(f, 866, ['GRACE HOPPER'], 'hopper', 0.0, 0.68, 3, 0.46, F2, 930); sboard(f, 932, ['HER FAVORITE', 'STORY'], 'hopper', 0.0, 0.66, 3, 0.42, F2, 978); bubble(f, 940, ['...AND THERE', 'IT WAS!'], 'hopper', -0.35, 0.36, 3, 0.36, 1, F2, 976);
    sboard(f, 980, ['REPORTEDLY...'], 'hopper', 0.0, 0.68, 3, 0.4, F2, 1006); stamp(f, 1009, ['REPORTEDLY,', 'NOT HER!'], 'hopper', 0.0, 0.62, 3, 0.44, F2); }
  if (k === 'actual') { sboard(f, 1055, ['WHY', '"ACTUAL"?'], 'actual', 0.0, 0.66, 1.0, 0.4, F2); qmark(f, 1086, 'actual', 0.42, 0.25, 1.0, 0.12, F2); }
  if (k === 'edison') { sboard(f, 1120, ['YOU SEE...'], 'edison', 0.0, 0.68, 3, 0.36, F2, 1170); sboard(f, 1172, ['GLITCHES WERE', 'ALREADY "BUGS"'], 'edison', 0.0, 0.66, 3, 0.52, F2, 1214); sboard(f, 1216, ['THOMAS EDISON'], 'edison', 0.0, 0.68, 3, 0.48, F2, 1249); stamp(f, 1251, ['1870s'], 'edison', 0.0, 0.62, 3, 0.32, F2); }
  if (k === 'joke') { stamp(f, 1300, ['IT WAS', 'A JOKE!'], 'joke', 0.0, 0.62, 3, 0.4, F2); sburst(f, 1319, 'joke', 0.0, 0.62, 3, 0.5, F2); }
  if (k === 'real') { sboard(f, 1337, ['FOR ONCE...'], 'real', 0.0, 0.68, 1.0, 0.38, F2, 1378); stamp(f, 1379, ['A REAL BUG!'], 'real', 0.0, 0.62, 1.0, 0.44, F2); sburst(f, 1388, 'real', 0.0, 0.0, 1.0, 0.55, F2); stars(f, 1392, 'real', 0.0, 0.1, 1.0, 0.4, F2, 24); }
  if (k === 'museum') { sboard(f, 1430, ['STILL TAPED IN'], 'museum', 0.0, 0.68, 3, 0.46, F2, 1486); sburst(f, 1489, 'museum', 0.0, 0.6, 3, 0.7, F2); }
  if (k === 'payoff') { sboard(f, 1522, ['THE MOST FAMOUS', 'BUG IN HISTORY'], 'payoff', 0.0, 0.66, 3, 0.54, F2, 1600); sboard(f, 1603, ['...NEVER WROTE', 'A LINE OF CODE'], 'payoff', 0.0, 0.66, 3, 0.54, F2); sburst(f, 1649, 'payoff', 0.0, 0.66, 3, 0.5, F2); stars(f, 1655, 'payoff', -0.3, 0.1, 3, 0.4, F2, 24); }
  return F2;
}
