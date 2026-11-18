// [BOOTH-story] "Booth saved Lincoln's son" timeline (59.7 s, 1792 f @ 30 fps).
// Sets: station.js (jersey 1864 platform, dc1881 B&P waiting room) and theatre.js (fordsExt, box, dressing, expo, study).
// Violence is never shown: Ford's box = house lights down + a silhouette in the doorway + a white flash; 1881 / 1901 = reaction shots.
import * as S from './story.js';
const { sm, eo, ei, back, lerp, L3, add3, dist, q, person } = S;

// [f0, f1, id, module, set]
const SH = [
  [0, 102, 'hook', 'theatre', 'dressing'],      // The man who saved Abraham Lincoln's son was the brother
  [102, 170, 'jwb', 'theatre', 'fordsExt'],     // of the man who killed Abraham Lincoln.
  [170, 234, 'war', 'station', 'jersey'],       // You see, it's the Civil War.
  [234, 352, 'robert', 'station', 'jersey'],    // Lincoln's oldest son, Robert, is waiting for a train in Jersey City.
  [352, 444, 'crowd', 'station', 'jersey'],     // The platform is packed, the crowd shoves,
  [444, 496, 'move', 'station', 'jersey'],      // the train starts to move,
  [496, 548, 'slip', 'station', 'jersey'],      // and Robert slips into the gap
  [548, 604, 'gap', 'station', 'jersey'],       // between the platform and the moving train.
  [604, 700, 'grab', 'station', 'jersey'],      // Then a hand grabs his collar and yanks him back up.
  [700, 794, 'turn', 'station', 'jersey'],      // Robert turns around, and he recognizes the man.
  [794, 847, 'edwin', 'station', 'jersey'],     // It's Edwin Booth,
  [847, 906, 'stage', 'theatre', 'box'],        // one of the most famous actors in America.
  [906, 950, 'thanks', 'station', 'jersey'],    // Robert thanks him.
  [950, 1028, 'noidea', 'station', 'jersey'],   // Edwin has no idea who he just saved.
  [1028, 1096, 'april', 'theatre', 'fordsExt'], // A few months later, Edwin's younger brother,
  [1096, 1174, 'walks', 'theatre', 'fordsExt'], // John Wilkes Booth walks into Ford's Theatre
  [1174, 1218, 'boxcu', 'theatre', 'box'],      // and shoots the President.
  [1218, 1269, 'crushed', 'theatre', 'dressing'], // Edwin is crushed,
  [1269, 1316, 'letter', 'theatre', 'dressing'],  // but later he finds out whose son
  [1316, 1372, 'reads', 'theatre', 'dressing'],   // he pulled off those tracks,
  [1372, 1459, 'comfort', 'theatre', 'dressing'], // and for the rest of his life, that's what comforts him.
  [1459, 1528, 'y1881', 'station', 'dc1881'],   // And Robert, years later, he was there when
  [1528, 1598, 'garfield', 'station', 'dc1881'], // President Garfield was shot,
  [1598, 1628, 'expo', 'theatre', 'expo'],      // and he was nearby when
  [1628, 1660, 'temple', 'theatre', 'expo'],    // President McKinley was shot.
  [1660, 1750, 'invites', 'theatre', 'study'],  // After that, he started turning down invitations from presidents,
  [1750, 1792, 'case', 'theatre', 'study'],     // just in case.
];
export const NF = 1792;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: s[4] === 'jersey' ? 'day' : 'office', kind: s[2] }; }
export const roomAt = () => null;
export const lightFor = () => S.LIGHTS_.office;
export const TALKER = {}; // no narrator lip-sync; real dialogue uses op.say

// ---------- places (world coords from the set modules' local frames) ----------
const at = (o) => (p) => [p[0] + o[0], p[1] + o[1], p[2] + o[2]];
const J = at([-1600, 0, 0]), D = at([-1600, 0, 100]), F = at([-1600, 0, 400]), B = at([-1600, 0, 500]), R = at([-1600, 0, 600]), E = at([-1600, 0, 800]), ST = at([-1600, 0, 1000]);
const PY = 0.95; // jersey platform deck; the gap is local x 1.47 (car steps) .. 1.85 (platform edge)
const GAPX = 1.66;

// ---------- the 1864 train: arrives (170-234), stands, then pulls out slowly from f 446 (pure function of f) ----------
const VT = (j) => 1.7 * sm(446, 530, j);
const ZT = new Float32Array(NF + 2); { let z = 18; for (let j = 0; j < NF + 2; j++) { if (j >= 446) z += VT(j) / 30; ZT[j] = z; } }
function trainAt(f) {
  if (f >= 170 && f < 234) { const u = (f - 170) / 80; return { z: 18 - 8 * (1 - u) ** 2, v: 6 * (1 - u), steam: 1 }; }
  if (f < 446) return { z: 18, v: 0, steam: 0.35, smoke: 0.6 };
  return { z: ZT[Math.min(NF, f)], v: VT(f), steam: VT(f) < 1.2 ? 1 : 0.5 };
}

// box state (house lights / figure / president) has to be set before main.js reads the set's light + grade, so setAt drives it
function theatreState(f, TH) {
  if (!TH) return; const k = segAt(f)[2];
  if (!TH.__boothEnv && TH.setEnvelope) { TH.__boothEnv = 1; TH.setEnvelope({ addr: '60 Lake Shore Drive' }); } // [BOOTH-story] Robert's Chicago house (default prop read 1234)
  TH.setDim(k === 'boxcu' ? eo(1176, 1192, f) : 0); TH.setFigure(k === 'boxcu' ? sm(1180, 1194, f) : 0); TH.setPresident(k === 'boxcu');
}
export const setAt = (f) => { const s = segAt(f); if (s[3] === 'theatre') theatreState(f, globalThis.__theatre); return [s[3], s[4]]; };

// ---------- cameras ----------
const C = (p, l, fov, cInf, fp) => ({ p, l, fov, cInf, fp });
const V = {
  hook: C(R([0.2, 1.45, 2.3]), R([0.12, 1.2, -1.4]), 56, 4, R([0.45, 1.5, -0.45])),
  jwb: C(F([6.4, 1.25, 7.2]), F([1.0, 2.2, 0.8]), 50, 4, F([1.2, 1.5, 1.6])),
  war: C(J([2.2, 2.25, 25.5]), J([0.0, 2.3, -10]), 50, 1.5, J([0.5, 2.0, 14])),
  robert: C(J([3.4, 1.9, -2.2]), J([4.4, 2.3, 20]), 50, 3, J([4.1, 2.2, 4.6])),
  crowd: C(J([3.4, 2.15, -2.4]), J([2.75, 1.35, 4.6]), 46, 3, J([2.6, 2.2, 4.0])),
  move: C(J([-3.4, 1.35, 27.5]), J([0.6, 2.4, 16.0]), 46, 2, J([0.5, 2.2, 17.0])),
  slip: C(J([5.4, 1.28, 0.25]), J([1.7, 1.3, 0.0]), 46, 4, J([2.0, 1.6, 0.0])),
  gap: C(J([4.7, 2.5, -0.3]), J([GAPX, 1.25, 0.0]), 44, 5, J([GAPX, 1.8, 0.0])),
  grab: C(J([6.2, 1.65, 0.25]), J([1.8, 1.25, 0.25]), 44, 4, J([2.2, 1.6, 0.35])),
  turn: C(J([7.2, 1.75, -1.9]), J([3.0, 1.5, -0.35]), 46, 4, J([3.0, 2.2, -0.3])),
  edwin: C(J([4.4, 1.8, -4.8]), J([3.0, 2.0, -0.4]), 46, 6, J([3.6, 2.4, -0.95])),
  stage: C(B([0.3, 2.6, 10.0]), B([0.0, 1.75, -4.0]), 42, 3, B([0.2, 2.5, -3.2])),
  thanks: C(J([2.3, 1.65, -4.4]), J([3.4, 1.4, 0.4]), 44, 4, J([3.1, 2.2, 0.2])),
  noidea: C(J([4.4, 1.8, -3.3]), J([3.0, 1.75, 1.6]), 48, 4, J([2.67, 2.3, 0.35])),
  april: C(F([2.6, 1.7, 18.5]), F([-1.0, 7.0, 0]), 56, 2.5, F([0, 4, 3])),
  walks: C(F([5.0, 1.5, 8.2]), F([0.8, 1.6, 0.8]), 48, 3, F([1.4, 1.5, 2.2])),
  boxcu: C(B([2.5, 5.45, -0.1]), B([6.6, 5.5, -1.95]), 40, 4, B([6.8, 5.6, -1.7])),
  crushed: C(R([0.05, 1.6, 1.6]), R([-0.2, 1.25, -1.2]), 50, 5, R([-0.15, 1.5, -0.5])),
  letter: C(R([0.02, 1.25, -0.55]), R([0.1, 0.79, -1.3]), 44, 6, R([0.12, 0.79, -1.3])),
  reads: C(R([0.1, 1.5, 1.5]), R([-0.1, 1.45, -1.0]), 46, 5, R([-0.1, 1.5, -0.45])),
  comfort: C(R([0.15, 1.5, 2.3]), R([0.2, 1.3, -1.4]), 54, 4, R([0.45, 1.5, -0.45])),
  y1881: C(D([8.6, 1.8, 6.0]), D([-10, 4.2, -1.2]), 66, 1.5, D([1.0, 1.4, 4.0])),
  garfield: C(D([6.0, 1.65, 5.6]), D([-4, 1.5, 1.0]), 52, 3, D([2.2, 1.5, 4.0])),
  expo: C(E([-3, 7.5, 60]), E([0, 24, -60]), 56, 1.5, E([0, 10, 10])),
  temple: C(E([11.0, 2.0, 48.5]), E([26.0, 3.4, 31.0]), 50, 3, E([15.0, 1.5, 44.6])),
  invites: C(ST([1.5, 1.55, 2.45]), ST([0.1, 1.15, -1.2]), 56, 3, ST([0.2, 1.4, -1.6])),
  case: C(ST([0.24, 1.25, -0.35]), ST([0.19, 0.8, -0.85]), 42, 6, ST([0.19, 0.8, -0.81])),   // envelope insert, then tilts up to Robert (cam())
  caseUp: C(ST([0.3, 1.12, 0.05]), ST([0.2, 1.3, -1.7]), 46, 5, ST([0.2, 1.4, -1.72])),
};
const push = (v, k, f0, f1, f) => { const t = sm(f0, f1, f); const d = [v.l[0] - v.p[0], v.l[1] - v.p[1], v.l[2] - v.p[2]]; return { ...v, p: add3(v.p, d.map((x) => x * k * t)) }; };
const PUSH = { hook: 0.15, jwb: 0.08, war: 0.05, robert: 0.12, crowd: 0.08, move: 0.06, slip: 0.1, gap: 0.12, grab: 0.06, turn: 0.06, edwin: 0.1, stage: 0.1, thanks: 0.08, noidea: 0.1,
  april: 0.06, walks: 0.06, boxcu: 0.1, crushed: 0.14, letter: 0.2, reads: 0.1, comfort: 0.16, y1881: 0.06, garfield: 0.08, expo: 0.05, temple: 0.08, invites: 0.12, case: 0.1 };
function cam(k, f) {
  const s = segAt(f); let c = push(V[k], PUSH[k] || 0.08, s[0], s[1], f);
  if (k === 'case') { const t = eo(1762, 1776, f), B = V.caseUp; c = { ...c, p: L3(c.p, B.p, t), l: L3(c.l, B.l, t), fov: lerp(c.fov, B.fov, t), fp: L3(c.fp, B.fp, t), cInf: lerp(c.cInf, B.cInf, t) }; } // "just in case": envelope -> wary face
  if (k === 'turn') { const t = eo(736, 752, f); c = { ...c, fov: c.fov * (1 - 0.25 * t) }; c.l = L3(c.l, J([2.95, 1.95, -0.3]), t); c.fp = L3(c.fp, J([2.5, 2.2, 0.2]), t); } // punch-in on "recognizes"
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
  for (const [c, a, n] of [[170, 0.55, 8], [1028, 0.85, 10], [1459, 0.85, 10], [1598, 0.85, 10]]) if (f >= c && f < c + n) flash = Math.max(flash, a * (1 - (f - c) / n));
  if (f >= 1202 && f < 1218) flash = Math.max(flash, eo(1202, 1210, f));          // box: white-out before anything happens
  if (f >= 1218 && f < 1228) flash = Math.max(flash, 1 - (f - 1218) / 10);
  for (const c of [1556, 1636]) if (f >= c && f < c + 5) flash = Math.max(flash, 0.45 * (1 - (f - c) / 5)); // off-screen moment: a pale flash, no weapon
  return { flash, look: 'office' };
}

// ---------- world state ----------
export function worldAt(f, w) {
  const s = segAt(f);
  for (const n of ['road', 'stadium', 'office', 'car']) if (w[n]) w[n].visible = false;
  w.dc.visible = false; w.curRoom = null; w.rooms.show(w, null);
  if (s[4] === 'jersey' && w.station) { const T = trainAt(f); w.station.setTrain(T.z, { v: T.v, t: f / 30, smoke: T.smoke ?? 1, steam: T.steam }); }
  if (s[3] === 'theatre') theatreState(f, w.theatre);
}

// ---------- actors ----------
const PERSON = (f, o, seed, pos, opts = {}, extra = {}) => person(f, o, seed, pos, opts, extra);
// eased walk a -> b over [f0, f1]; the engine faces the card along its screen motion and plants the feet from the distance
const walk = (f, o, seed, a, b, f0, f1, opts = {}, extra = {}) => person(f, o, seed, L3(a, b, sm(f0, f1, f)), opts, extra);
const ROB = (f, pos, opts = {}, extra = {}) => person(f, 'ROBERT', 11, pos, opts, extra);
const EDW = (f, pos, opts = {}, extra = {}) => person(f, 'EDWIN', 12, pos, opts, extra);
const OLD = (f, pos, opts = {}, extra = {}) => person(f, 'ROBERT_OLD', 13, pos, opts, extra);
const JWB = (f, pos, opts = {}, extra = {}) => person(f, 'JWB', 14, pos, opts, extra);
// Jersey City 1864 crowd (one set of people for the whole platform scene)
const C64 = (i) => 'C64_' + (i % 10);
const CROWD64 = [[5.2, 12.5], [6.4, 14.2], [3.6, 15.5], [7.6, 16.8], [4.6, 18.6], [6.0, 20.4], [8.4, 11.6], [3.4, 21.6], [6.8, 23.0], [5.0, 24.6]];
function platformCrowd(f, view, exprs = ['smile', 'nervous', 'smile', 'whistle']) {
  return CROWD64.map(([x, z], i) => PERSON(f, C64(i), 300 + i, J([x, PY, z]), { expr: exprs[i % exprs.length], view: view[i % view.length] }));
}

export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [];
  if (k === 'hook') A.push(EDW(f, R([0.45, 0, -0.45]), { expr: f < 62 ? 'calm' : 'worried', view: f < 40 ? '34L' : 'front', headTilt: -3 }));
  if (k === 'jwb') A.push(JWB(f, F([1.2, 0.15, 1.6]), { expr: 'stern', view: 'front' }));
  if (k === 'war') {
    [[3.4, 13.0], [2.8, 9.5], [4.0, 7.0], [3.2, 4.5], [3.9, 16.4]].forEach(([x, z], i) => A.push(PERSON(f, C64(i + 3), 303 + i, J([x, PY, z]), { expr: ['surprised', 'smile', 'whistle'][i % 3], view: i % 2 ? 'front' : '34L' })));
    A.push(PERSON(f, 'CONDUCTOR', 15, J([3.0, PY, 11.2]), { expr: 'smile', wave: q(0.5 + 0.5 * Math.sin(f * 0.25), 0.1), view: '34L' }));
  }
  if (k === 'robert') {
    A.push(walk(f, 'ROBERT', 11, J([4.6, PY, 9.0]), J([4.1, PY, 4.6]), 238, 304, { expr: f < 300 ? 'smile' : 'whistle' }));
    A.push(...platformCrowd(f, ['34R', 'front', '34R', 'front', 'front'], ['smile', 'whistle', 'smile', 'nervous']));
  }
  if (k === 'crowd') {
    const sh = (i, a = 0.06) => a * Math.sin(f * 0.32 + i * 1.7), drift = sm(370, 430, f);
    A.push(ROB(f, J([3.0 - 0.75 * drift + sh(9, 0.05), PY, 4.0]), { expr: f < 400 ? 'nervous' : 'shock', view: 'front' }, { roll: 0.08 * Math.sin(f * 0.4) - 0.12 * drift }));
    const P = [[3.75, 3.5], [4.3, 4.8], [3.55, 5.7], [2.85, 6.7], [4.1, 7.1], [3.3, 8.4], [4.7, 2.2], [2.55, 9.2], [4.8, 6.0], [3.9, 9.6]];
    P.forEach(([x, z], i) => A.push(PERSON(f, C64(i), 300 + i, J([x - 0.55 * drift + sh(i), PY, z + sh(i + 3, 0.04)]), { expr: i % 3 ? 'nervous' : 'stern', view: i % 2 ? '34L' : 'front' }, { roll: 0.05 * Math.sin(f * 0.3 + i) })));
  }
    if (k === 'slip') {
    const t = ei(510, 526, f), wob = f < 512 ? 0.12 * Math.sin((f - 496) * 0.55) : 0;
    A.push(ROB(f, J([lerp(2.25, GAPX, eo(508, 520, f)), lerp(PY, 0.3, t), 0.0]), { expr: f < 506 ? 'nervous' : 'shock', view: 'front', cheer: f > 516 ? 1 : undefined }, { roll: wob + 0.15 * Math.sin(Math.PI * sm(506, 528, f)) }));
    A.push(PERSON(f, C64(2), 302, J([3.55, PY, -0.2]), { expr: f < 510 ? 'nervous' : 'shock', view: '34R' }, { roll: -0.06 * Math.sin(f * 0.3) })); // the man who shoved, blurred foreground
  }
  if (k === 'gap') A.push(ROB(f, J([GAPX, 0.28 + 0.04 * Math.sin(f * 0.5), 0.0]), { expr: 'shock', view: 'front', cheer: q(0.6 + 0.4 * Math.sin(f * 0.45), 0.1) }));
  if (k === 'grab') {
    const up = eo(660, 682, f);
    A.push(ROB(f, J([lerp(GAPX, 2.3, up), lerp(0.36, PY, up), 0.05 * up]), { expr: 'shock', view: 'front', cheer: f < 660 ? q(0.6 + 0.4 * Math.sin(f * 0.45), 0.1) : undefined }, { roll: -0.1 * Math.sin(Math.PI * up) }));
    const lean = eo(614, 632, f) * (1 - eo(664, 684, f)), haul = eo(660, 680, f) * (1 - eo(688, 698, f));
    A.push(walk(f, 'EDWIN', 12, J([2.6, PY, 2.4]), J([2.5, PY, 0.55]), 600, 622, { expr: 'stern', grab: f >= 616 && f < 694 ? q(haul, 0.05) : undefined, view: f >= 616 ? 'front' : undefined }, { roll: -0.32 * lean + 0.08 * haul }));
  }
  if (k === 'turn') {
    const v = f < 712 ? 'back' : f < 718 ? '34BR' : f < 724 ? 'sideR' : '34R';
    A.push(ROB(f, J([2.5, PY, 0.2]), { expr: f < 736 ? 'nervous' : 'surprised', view: v }));
    A.push(EDW(f, J([3.6, PY, -0.95]), { expr: 'calm', view: '34L' }));
  }
  if (k === 'edwin') { A.push(EDW(f, J([3.6, PY, -0.95]), { expr: 'calm', view: '34L' })); A.push(ROB(f, J([2.5, PY, 0.2]), { expr: 'surprised', view: '34R' })); }
  if (k === 'stage') {
    A.push(EDW(f, B([0.2, 1.1, -3.2]), { expr: 'calm', prop: 'skull', reach: 0.7, view: 'front' }));
    const AUD = [[-1.25, 4.4], [-0.45, 4.9], [0.75, 4.3], [1.45, 4.9], [0.15, 5.8]]; // AUD0..4: one person each
    AUD.forEach(([x, z], i) => A.push(PERSON(f, 'AUD' + i, 400 + i, B([x, 0, z]), { expr: 'laugh', view: 'back', cheer: q(0.5 + 0.5 * Math.sin(f * 0.6 + i * 1.3), 0.1) })));
  }
  if (k === 'thanks') {
    const bow = Math.sin(Math.PI * sm(918, 940, f));
    A.push(ROB(f, J([3.5, PY, 0.0]), { expr: f < 916 ? 'surprised' : 'happy', view: '34R', say: { text: 'Thank you!', t0: 912, t1: 932 } }, { roll: -0.14 * bow }));
    A.push(EDW(f, J([2.67, PY, 0.35 + 0.0]), { expr: 'calm', view: '34L', wave: f > 932 ? q(0.5 + 0.4 * Math.sin(f * 0.4), 0.1) : undefined }));
  }
  if (k === 'noidea') {
    A.push(EDW(f, J([2.67, PY, 0.35]), { expr: f < 966 ? 'calm' : f < 1000 ? 'surprised' : 'calm', view: f < 960 ? '34R' : 'front' }));
    A.push(walk(f, 'ROBERT', 11, J([3.5, PY, 0.2]), J([3.7, PY, 6.5]), 952, 1024, { expr: 'happy' }));
  }
  if (k === 'april') A.push(JWB(f, F([1.7, 0.15, 1.7]), { expr: 'stern', view: '34L' }));
  if (k === 'walks') A.push(walk(f, 'JWB', 14, F([2.6, 0.15, 3.8]), F([0.4, 0.15, 0.9]), 1088, 1172, { expr: 'stern', view: 'back' }));
  if (k === 'crushed') A.push(EDW(f, R([-0.15, 0, -0.5]), { expr: 'sad', view: 'front', headTilt: -6 + 1.5 * Math.sin(f * 0.08) }));
  if (k === 'reads') A.push(EDW(f, R([-0.1, 0, -0.45]), { expr: f < 1338 ? 'surprised' : 'calm', prop: 'letter', reach: q(0.6 + 0.2 * eo(1316, 1330, f), 0.05), view: 'front' }));
  if (k === 'comfort') A.push(EDW(f, R([0.45, 0, -0.45]), { expr: 'calm', prop: 'letter', reach: 0.1, view: f < 1400 ? '34L' : 'front' }));
  if (k === 'y1881' || k === 'garfield') {
    const alarm = k === 'garfield' && f >= 1556;
    if (k === 'y1881') A.push(walk(f, 'ROBERT_OLD', 13, D([-2.8, 0, 4.6]), D([1.6, 0, 4.0]), 1462, 1520, { expr: 'smile' }));
    else A.push(OLD(f, D([2.2, 0, 4.0]), { expr: f < 1556 ? 'smile' : 'shock', view: f < 1556 ? 'front' : '34L' }));
    const P = k === 'y1881' ? [[5.2, 3.2], [5.6, 1.6], [-4.0, 3.0], [-0.8, 5.2], [4.0, -0.2], [7.2, 1.4]] : [[0.6, 2.6], [-0.8, 3.8], [-1.8, 1.6], [3.2, 2.0], [-2.8, 3.2], [1.0, 0.6]];
    P.forEach(([x, z], i) => {
      if (alarm && i < 4) A.push(walk(f, 'C81_' + i, 500 + i, D([x, 0, z]), D([x - 3.2, 0, z - 0.6]), 1560 + i * 4, 1600 + i * 4, { expr: 'shock', cheer: i % 2 ? 1 : undefined }));
      else A.push(PERSON(f, 'C81_' + i, 500 + i, D([x, 0, z]), { expr: alarm ? 'shock' : ['smile', 'whistle', 'smile', 'calm'][i % 4], view: alarm ? '34L' : ['front', '34L', '34R', 'front'][i % 4] }));
    });
  }
  if (k === 'temple') {
    const hit = f >= 1638;
    A.push(OLD(f, E([15.0, 0, 44.6]), { expr: hit ? 'shock' : 'smile', view: hit ? 'front' : '34BR' }));
    const P = [[18.6, 41.4], [15.2, 41.0], [20.4, 39.0], [17.6, 38.6], [17.4, 43.2], [19.6, 43.4]];
    P.forEach(([x, z], i) => A.push(PERSON(f, 'C01_' + i, 600 + i, E([x, 0, z]), { expr: hit ? 'shock' : ['smile', 'happy', 'whistle'][i % 3], view: hit ? (i % 2 ? '34R' : 'front') : '34BR', cheer: hit && i % 3 === 0 ? 1 : undefined })));
  }
  if (k === 'invites') A.push(OLD(f, ST([0.2, 0, -1.72]), { expr: f < 1700 ? 'worried' : 'stern', view: 'front', headTilt: f > 1700 ? 9 * Math.sin((f - 1700) * 0.45) * (1 - sm(1736, 1750, f)) : 0, wave: f > 1704 ? q(0.5 + 0.35 * Math.sin(f * 0.5), 0.1) : undefined }));
  if (k === 'case') A.push(OLD(f, ST([0.2, 0, -1.72]), { expr: 'worried', view: 'front', look: f < 1770 ? -1 : 1 }));
  return A;
}

// ---------- effects ----------
export function fxAt(f) {
  const s = segAt(f), k = s[2], F2 = [];
  if (k === 'war' && f > 182) F2.push({ fx: 'board', lines: ['CIVIL WAR', '1864'], pos: J([2.3, 3.5, 13.0]), size: 1.5 * back(182, 194, f) });
  if (k === 'robert' && f > 272 && f < 346) F2.push({ fx: 'board', lines: ['ROBERT', 'LINCOLN'], pos: J([3.45, 2.8, 5.6]), size: 0.85 * back(272, 284, f) });
  if (k === 'grab' && f >= 660 && f < 676) F2.push({ fx: 'burst', t: (f - 660) / 16, pos: J([1.9, 1.75, 0.1]), size: 0.7, col: '#fff3b0', rays: 10 });
  if (k === 'edwin' && f > 800) F2.push({ fx: 'board', lines: ['EDWIN', 'BOOTH'], pos: J([3.3, 3.25, -0.4]), size: 0.95 * back(800, 812, f) });
  if (k === 'noidea' && f > 966) F2.push({ fx: 'qmark', pos: J([2.67, 3.0, 0.35]), size: 0.35 * back(966, 976, f) });
  if (k === 'noidea') for (let i = 0; i < 4; i++) { const a = ((f - 950) / 70 + i / 4) % 1; F2.push({ fx: 'puff', t: a, pos: J([1.2 - a * 0.6, 3.4 + a * 1.4, 4.0 + i * 1.6 + a * 2]), size: 1.0 + a * 1.2, tint: '#d8d0d4', op: 0.85 * (1 - a) }); } // the train's smoke drifting off
  if (k === 'april' && f > 1040) F2.push({ fx: 'board', lines: ['APRIL 14', '1865'], pos: F([1.0, 5.2, 8.0]), size: 2.1 * back(1040, 1052, f) });
  if (k === 'y1881' && f > 1470) F2.push({ fx: 'board', lines: ['WASHINGTON', '1881'], pos: D([1.6, 3.0, 2.2]), size: 1.6 * back(1470, 1482, f) });
  if (k === 'garfield' && f > 1532) F2.push({ fx: 'board', lines: ['PRESIDENT', 'GARFIELD'], pos: D([-1.2, 2.9, 1.6]), size: 1.5 * back(1532, 1544, f) });
  if (k === 'expo' && f > 1602) F2.push({ fx: 'board', lines: ['BUFFALO', '1901'], pos: E([-1.6, 7.6, 51.5]), size: 2.0 * back(1602, 1614, f) });
  if (k === 'temple' && f > 1640) F2.push({ fx: 'board', lines: ['PRESIDENT', 'McKINLEY'], pos: E([19.5, 4.6, 39.0]), size: 1.6 * back(1640, 1650, f) });
  return F2;
}
