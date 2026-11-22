// v7 timeline (67 s, 2008 f): new voiceover. Reuses old shots by time-remapping, adds new beats.
import * as S from './story.js';
const { sm, eo, ei, back, lerp, L3, add3, dist, q, person, runner, crowd } = S;

// [new f0, new f1, kind, a, b, extra]  kind 'old' maps [f0,f1) -> old [a,b); kind 'new' is a new shot.
const SEG = [
  [0, 187, 'old', 0, 137], [187, 275, 'old', 137, 179], [275, 330, 'old', 179, 215],
  [330, 460, 'new', 'water'], [460, 496, 'new', 'purpose'], [496, 556, 'old', 270, 330],
  [556, 650, 'new', 'dogs'], [650, 802, 'new', 'orchard'],
  [802, 910, 'old', 344, 425], [910, 962, 'old', 425, 475], [962, 1030, 'old', 475, 525], [1030, 1075, 'old', 60, 105],
  [1075, 1147, 'old', 525, 598], [1147, 1221, 'old', 598, 676], [1221, 1273, 'old', 676, 727], [1273, 1326, 'old', 727, 767],
  [1326, 1378, 'old', 767, 820], [1378, 1438, 'old', 820, 900], [1438, 1538, 'old', 900, 966], [1538, 1653, 'old', 966, 1077],
  [1653, 1703, 'old', 1077, 1120], [1703, 1801, 'old', 1120, 1208], [1801, 1854, 'old', 1270, 1317],
  [1854, 1940, 'old', 676, 727, 'boston'], [1940, 2008, 'old', 767, 812, 'boston'],
];
export const NF = 2008;
const FLASH = [1801, 1854];
const NEWL = { water: 'hot', purpose: 'hot', dogs: 'hot', orchard: 'hot' };
const segAt = (f) => SEG.find((s) => f >= s[0] && f < s[1]) || SEG[SEG.length - 1];
const R = (f) => { const s = segAt(f); return s[2] === 'old' ? s[3] + (f - s[0]) * (s[4] - s[3]) / (s[1] - s[0]) : 3000 + f; };
export const isBoston = (f) => segAt(f)[5] === 'boston';
export function shotAt(f) { const s = segAt(f), i = SEG.indexOf(s); const light = s[2] === 'old' ? S.shotAt(R(f)).light : NEWL[s[3]]; return { id: i + 1, f0: s[0], f1: s[1], light, kind: s[2] === 'new' ? s[3] : null, old: s[2] === 'old' ? S.shotAt(R(f)).id : null }; }
export const lightFor = (f) => S.LIGHTS_[shotAt(f).light];
const OLDT = S.TALKER;
export const TALKER = {}; SEG.forEach((s, i) => { if (s[2] === 'old') TALKER[i + 1] = OLDT[S.shotAt(s[3] + 1).id]; }); TALKER[5] = 'OFFICIAL';
export function talkerAt(f) { return TALKER[shotAt(f).id]; }

// ---------- new shot content ----------
const u = (f) => f - segAt(f)[0];
const waterRunners = (f) => [0, 1, 2].map((i) => [-0.9 + i * 0.9, 0, -9 - i * 1.6 + u(f) * 0.055]);
const dogRunner = (f) => { const t = u(f); return [-1.0 + 0.3 * Math.sin(t * 0.05), 0, -6 + t * 0.1]; };
function newCam(k, f) {
  const t = u(f), P = (p, l, k2, tt) => L3(p, l, k2 * tt);
  if (k === 'water') { const tt = sm(0, 130, t); return { p: P([2.5, 1.45, 7.6], [0.6, 1.05, -3], 0.06, tt), l: [0.6, 1.05, -3], fov: 38, fp: [1.2, 1.4, -2.0], cInf: 5, fy: -0.12 }; } // locked wide: runners trudge in to the one barrel
  if (k === 'purpose') { const tt = sm(0, 36, t); return { p: P([-0.3, 1.62, 2.7], [-0.75, 1.45, -1.0], 0.1, tt), l: [-0.75, 1.45, -1.0], fov: 36, fp: [-0.75, 1.45, -1.0], cInf: 9 }; } // "On purpose." close-up
  if (k === 'dogs') { const r = dogRunner(f); return { p: [1.3, 1.05, 6.2], l: L3([-0.9, 1.0, -1.0], add3(r, [0.2, 0.8, -0.9]), 0.55), fov: 44, fp: add3(r, [0, 1.4, -0.6]), cInf: 5, roll: 0.07, fy: -0.1 }; } // low dutch, runner + dogs charge the lens
  if (k === 'orchard') { const tt = sm(0, 152, t); return { p: P([0.2, 1.35, 5.8], [2.5, 0.85, -1.8], 0.08, tt), l: [2.5, 0.85, -1.8], fov: 38, fp: [2.1, 1.0, -1.6], cInf: 6 }; } // locked wide of the orchard; he naps in frame
}
// camera overrides for reused old shots (segment index -> camera)
const OVR = {
  12: (f) => { const z = -30 + R(f) * 0.33; return { p: [0.95, 1.5, 14.5], l: [-0.6, 1.05, -2.5], fov: 34, fp: [0.3, 1.5, z - 0.4], cInf: 5, fy: -0.1 }; }, // locked: car drives past the runners toward lens
  24: (f) => { const t = sm(1854, 1940, f), z = -4 + (R(f) - 676) * 0.24; return { p: L3([398.2, 2.6, 15.5], [398.5, 2.3, 14.8], t), l: [400.4, 1.5, 3], fov: 40, fp: [400.4, 1.4, z], cInf: 5 }; }, // Boston: higher 3/4 wide
};
function newActors(k, f) {
  const t = u(f), A = [];
  if (k === 'water') {
    waterRunners(f).forEach((p, i) => { if (i === 2 && t > 70) A.push(person(f, 'RUN2', 12, [1.05, 0, -1.6], { expr: 'nervous', prop: 'ladle', reach: q(0.3 + 0.2 * Math.sin(t * 0.3), 0.05) })); else A.push(runner(f, 'RUN' + i, 10 + i, p, i % 2 ? 'pained' : 'nervous', 0.05)); });
  }
  if (k === 'purpose') A.push(person(f, 'OFFICIAL', 7, [-0.75, 0, -1.0], { expr: 'whistle', prop: 'stick', reach: q(0.5 + 0.15 * Math.sin(t * 0.4), 0.05), headTilt: q(5 * Math.sin(t * 0.25), 0.5) }));
  if (k === 'dogs') { const ph = (f * 0.11) % 1; A.push(person(f, 'RUN3', 13, add3(dogRunner(f), [0, 0.14 * Math.abs(Math.sin(ph * Math.PI * 2)), 0]), { mode: 'march', phase: q(ph, 0.05), expr: 'shock', cheer: 1, headTilt: q(6 * Math.sin(ph * Math.PI * 2), 0.5) }, { roll: 0.1 * Math.sin(ph * Math.PI * 2) })); }
  if (k === 'orchard') {
    const p = [1.8, 0, -1.6];
    if (t < 98) A.push(person(f, 'RUN1', 11, p, { expr: t < 70 ? 'happy' : 'pained', prop: t < 70 ? 'apple' : 'rotten', reach: q(t < 70 ? 0.8 + 0.2 * Math.sin(t * 0.5) : 0.4, 0.05) }));
    else A.push(person(f, 'RUN1', 11, add3(p, [0, 0.22, 0]), { mode: 'fall', expr: 'happy', sleep: true }, { roll: -1.4 * back(98, 108, t) }));
  }
  return A;
}
function newFx(k, f) {
  const t = u(f), F = [];
  if (k === 'water') {
    F.push({ fx: 'barrel', pos: [1.6, 0.55, -2.2], size: 1.1 });
    if (t >= 45) F.push({ fx: 'board', lines: ['LAST WATER', 'NEXT: NONE'], pos: [0.55, 1.3, -4.2], size: 1.25 * back(45, 56, t) });
    for (let i = 0; i < 4; i++) { const tt = ((t / 22) + i / 4) % 1; F.push({ fx: 'puff', t: tt, pos: [-0.6 + i * 0.5, 0.3 + tt * 0.5, -6 + u(f) * 0.05 - tt], size: 1.3 + tt, tint: '#e2cfa8' }); }
  }
  if (k === 'purpose') { F.push({ fx: 'barrel', pos: [-0.1, 0.55, -1.25], size: 1.0 }); }
  if (k === 'dogs') {
    const r = dogRunner(f);
    for (let i = 0; i < 3; i++) { const lag = 1.25 + i * 0.85, bob = Math.abs(Math.sin((f + i * 3) * 0.6)) * 0.14; F.push({ fx: 'dog', k: Math.floor((f + i * 2) / 3) % 2, v: i, pos: [r[0] + (i - 1) * 0.4, 0.5 + bob, r[2] - lag], size: 1.3 }); }
    if (t % 16 < 9) F.push({ fx: 'bark', t: (t % 16) / 9, pos: [r[0] + 0.4, 1.35, r[2] - 1.9 - (Math.floor(t / 16) % 2) * 0.9], size: 0.75 });
    for (let i = 0; i < 3; i++) { const tt = ((t / 12) + i / 3) % 1; F.push({ fx: 'puff', t: tt, pos: [r[0], 0.25 + tt * 0.3, r[2] - 1.0 - i * 0.9 - tt * 0.6], size: 0.7 + tt, tint: '#e2cfa8' }); }
  }
  if (k === 'orchard') {
    for (const [x, z, s] of [[3.9, -5.6, 3.3], [0.2, -6.8, 3.0], [6.2, -8.6, 3.6], [-1.6, -9.4, 3.2]]) F.push({ fx: 'appletree', v: (x * 3) | 0, pos: [x, s * 0.42, z], size: s });
    if (t >= 70 && t < 84) F.push({ fx: 'puff', t: (t - 70) / 14, pos: [2.2, 1.85, -1.4], size: 0.6, tint: '#9fd06a' });
    if (t >= 108) for (let i = 0; i < 3; i++) { const z2 = ((t - 108) / 30 + i / 3) % 1; F.push({ fx: 'zzz', pos: [3.1 + z2 * 0.5, 0.75 + z2 * 0.9, -1.4], size: 0.25 + z2 * 0.2, op: 1 - z2 }); }
  }
  return F;
}

// ---------- API used by main.js ----------
export function worldAt(f, w) {
  const s = segAt(f);
  if (s[2] === 'old') S.worldAt(R(f), w);
  else { w.road.visible = true; w.stadium.visible = false; w.office.visible = false; w.car.visible = false; }
  if (w.setBoston) w.setBoston(isBoston(f));
}
// composition: tilt the lens (rotate about the camera) so the focus point lands at screen height fy (NDC, -1 bottom..1 top)
function tiltTo(c) {
  const d = [c.l[0] - c.p[0], c.l[1] - c.p[1], c.l[2] - c.p[2]], h = Math.hypot(d[0], d[2]);
  const fpd = [c.fp[0] - c.p[0], c.fp[1] - c.p[1], c.fp[2] - c.p[2]], fh = Math.hypot(fpd[0], fpd[2]);
  const pitchFp = Math.atan2(fpd[1], fh), want = pitchFp - Math.atan(c.fy * Math.tan(c.fov * Math.PI / 360));
  c.l = [c.p[0] + d[0], c.p[1] + h * Math.tan(want), c.p[2] + d[2]];
}
export function camAt(f) {
  const s = segAt(f); let c;
  const ov = OVR[SEG.indexOf(s) + 1];
  if (ov) { c = ov(f); c.focus = dist(c.p, c.fp || c.l); } else if (s[2] === 'old') c = S.camAt(R(f)); else { c = newCam(s[3], f); c.focus = dist(c.p, c.fp || c.l); }
  if (c.fy !== undefined) tiltTo(c);
  // zoom-through links at every cut except the white-flash time jumps
  for (const g of SEG.slice(1).map((x) => x[0])) { if (FLASH.includes(g)) continue; const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.32 * k * k : 1 + 0.28 * k * k; c.whip = true; } }
  return c;
}
export function gradeAt(f) {
  const s = segAt(f); const G = s[2] === 'old' ? S.gradeAt(R(f)) : { sat: 1.22, gain: [1.05, 1.03, 1.0], lift: [0.01, 0.006, 0.004], vig: 0.28, flash: 0, look: 'road' };
  if (s[5] === 'boston') G.look = 'stadium';
  for (const c of FLASH) { if (f >= c - 2 && f < c) G.flash = Math.max(G.flash, (f - c + 3) / 3); if (f >= c && f < c + 6) G.flash = Math.max(G.flash, 1 - (f - c) / 6); }
  return G;
}
export function actorsAt(f) { const s = segAt(f); const A = s[2] === 'old' ? S.actorsAt(R(f)) : newActors(s[3], f); if (isBoston(f)) for (const x of A) if (x.o === 'OFFICIAL') x.o = 'BAAOFF'; return A; }
export function fxAt(f) {
  const s = segAt(f); const F = s[2] === 'old' ? S.fxAt(R(f)) : newFx(s[3], f);
  if (f >= 1854 && f < 1925) { const t = (f - 1854) / 50; F.push({ fx: 'cal', m: Math.min(8, Math.floor(t * 9)), pos: [400.55, 2.15, 8.3], size: 0.85 * back(1854, 1862, f) }); }
  return F;
}
