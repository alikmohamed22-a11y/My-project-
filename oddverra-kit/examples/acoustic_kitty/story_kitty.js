// "Acoustic Kitty" timeline (56 s, 1674 f @ 30 fps). Sets: rooms (x=-800: lab z0, office z100, home z200) and the 1960s D.C. street (z~800).
import * as S from './story.js';
const { sm, eo, ei, back, lerp, L3, add3, dist, q, person } = S;

// [f0, f1, id, light, set, room]
const SH = [
  [0, 137, 'hook', 'office', 'room', 'office'],
  [137, 288, 'estab', 'day', 'dc'],
  [288, 390, 'bench', 'day', 'dc'],
  [390, 489, 'suspect', 'day', 'dc'],
  [489, 545, 'surgery', 'office', 'room', 'lab'],
  [545, 731, 'blueprint', 'office', 'void'],
  [731, 916, 'problem', 'office', 'room', 'lab'],
  [916, 1021, 'van', 'day', 'dc'],
  [1021, 1149, 'release', 'day', 'dc'],
  [1149, 1200, 'street', 'day', 'dc'],
  [1200, 1259, 'street2', 'day', 'dc'],
  [1259, 1384, 'survived', 'day', 'dc'],
  [1384, 1453, 'orders', 'office', 'room', 'lab'],
  [1453, 1608, 'memo', 'office', 'room', 'office'],
  [1608, 1674, 'home', 'office', 'room', 'home'],
];
export const NF = 1674;
const segAt = (f) => SH.find((s) => f >= s[0] && f < s[1]) || SH[SH.length - 1];
export function shotAt(f) { const s = segAt(f); return { id: SH.indexOf(s) + 1, f0: s[0], f1: s[1], light: s[3], kind: s[2] }; }
export const roomAt = (f) => { const s = segAt(f); return s[4] === 'room' ? s[5] : null; };
export const lightFor = (f) => S.LIGHTS_[segAt(f)[3]];
const u = (f) => f - segAt(f)[0];
export const TALKER = {}; SH.forEach((s, i) => { TALKER[i + 1] = { hook: 'AGENT2', bench: 'SOV1', suspect: 'SOV2', problem: 'AGENT2', orders: 'AGENT2', home: 'GRANNY' }[s[2]]; });

// ---------- key places ----------
const R = { lab: [-800, 0, 0], office: [-800, 0, 100], home: [-800, 0, 200] };
const BENCH = [[13.95, 0.15, 802.75], [13.95, 0.15, 803.65]];
const TAXI_Z = (f) => f < 1149 ? 900 : 862 - (f - 1149) * 0.62;      // taxi drives -z down the park-side lane (x=+1.5)
const FREEZE = [1226, 1238];                                                   // freeze-frame just before the taxi reaches the cat
const fz = (f) => (f >= FREEZE[0] && f < FREEZE[1] + 6 ? FREEZE[0] : f);

// ---------- cameras ----------
function cam(k, f) {
  const t = u(f);
  if (k === 'hook') return { p: L3([-799.2, 1.45, 101.6], [-799.55, 1.2, 100.75], sm(0, 137, f)), l: [-800.35, 0.95, 99.5], fov: 44, fp: [-800.15, 0.95, 99.6], cInf: 7 };
  if (k === 'estab') { const e = eo(137, 260, f); return { p: L3([1.2, 14.0, 748], [1.6, 6.0, 757], e), l: L3([-4, 2.0, 800], [-6.6, 4.2, 798], e), fov: 54, fp: [-8, 2, 800], cInf: 2 }; }
  if (k === 'bench' || k === 'suspect') return { p: L3([9.6, 1.35, 800.6], [10.2, 1.3, 801.2], sm(288, 489, f)), l: [13.9, 0.95, 803.2], fov: 44, fp: [13.9, 1.0, 803.2], cInf: 5 };
  if (k === 'surgery') return { p: L3([-798.4, 1.75, 2.2], [-798.75, 1.6, 1.6], sm(489, 545, f)), l: [-800.05, 1.05, -0.5], fov: 52, fp: [-800, 1.0, -0.5], cInf: 5 };
  if (k === 'blueprint') return { p: [-800.03, 0.95, 4.75], l: [-800.03, 0.95, 0], fov: lerp(44, 41, sm(545, 731, f)), fp: [-799.95, 1.0, 1.5], cInf: 0 };
  if (k === 'problem' || k === 'orders') return { p: L3([-799.65, 1.85, 5.6], [-799.65, 1.75, 5.0], sm(731, 916, f)), l: [-799.95, 0.95, 0.4], fov: 50, fp: [-799.6, 0.8, 1.2], cInf: 3 };
  if (k === 'van') return { p: [7.6, 1.2, 779.4], l: [5.0, 0.8, 784.8], fov: 48, fp: [6.0, 0.5, 785.2], cInf: 4 };
  if (k === 'release') return { p: L3([9.3, 1.3, 797.8], [9.7, 1.25, 798.6], sm(1021, 1149, f)), l: [11.4, 0.75, 802.3], fov: 50, fp: [11.0, 0.5, 801.8], cInf: 4 };
  if (k === 'survived') return { p: [1.0, 0.9, 801.5], l: [5.5, 0.55, 807.2], fov: 44, fp: [5.5, 0.5, 807.2], cInf: 5 };
  if (k === 'street') { const zoom = f >= FREEZE[0] && f < 1259 ? 1 - 0.18 * eo(FREEZE[0], FREEZE[0] + 8, f) : 1; return { p: [3.9, 0.5, 801.6], l: [3.9, 0.42, 806.3], fov: 52, fp: [3.9, 0.4, 806.3], cInf: 4 }; }
  if (k === 'street2') { const zoom = f >= FREEZE[0] && f < 1259 ? 1 - 0.15 * eo(FREEZE[0], FREEZE[0] + 8, f) : 1; return { p: [2.4, 0.8, 788.0], l: [2.3, 0.45, 808.0], fov: 21 * zoom, fp: [2.2, 0.4, 806.4], cInf: 3 }; }
  if (false) { const ff = fz(f), zoom = f >= FREEZE[0] && f < 1259 ? 1 - 0.18 * eo(FREEZE[0], FREEZE[0] + 8, f) : 1; return { p: [-3.4, 1.05, 801.0], l: [2.6, 0.55, 806.6], fov: 44 * zoom, fp: [2.4, 0.4, 806.2], cInf: 4 }; }
  if (k === 'memo') return { p: L3([-799.96, 1.55, 100.1], [-799.96, 1.3, 99.82], sm(1453, 1608, f)), l: [-800, 0.77, 99.5], fov: 40, fp: [-800, 0.78, 99.52], cInf: 8 };
  if (k === 'home') return { p: L3([-799.3, 1.3, 203.6], [-799.55, 1.15, 202.6], sm(1608, 1674, f)), l: [-800.4, 0.75, 199.6], fov: 50, fp: [-800.4, 0.8, 199.8], cInf: 4 };
}
const CUTS = SH.slice(1).map((s) => s[0]), FLASH = [1244];
const IMP = [[1560, 0.035], [1232, 0.05]];
export function camAt(f) {
  const s = segAt(f), c = cam(s[2], f);
  for (const g of CUTS) { if (FLASH.includes(g)) continue; const d = f - g; if (d >= -6 && d < 6) { const k = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.3 * k * k : 1 + 0.26 * k * k; c.whip = true; } }
  for (const [i, a] of IMP) { const t = f - i; if (t >= 0 && t < 7) { const kk = a * (1 - t / 7) * (t % 2 ? -1 : 1); c.p = add3(c.p, [kk, kk * 0.6, 0]); } }
  c.focus = dist(c.p, c.fp || c.l); return c;
}
export function gradeAt(f) {
  const s = segAt(f); let flash = 0;
  for (const c of [1244]) { if (f >= c - 3 && f < c) flash = Math.max(flash, (f - c + 4) / 4); if (f >= c && f < c + 14) flash = Math.max(flash, 1 - (f - c) / 14); }
  if (f >= 1560 && f < 1565) flash = Math.max(flash, 0.25 * (1 - (f - 1560) / 5));
  return { sat: 1.15, gain: [1.03, 1.03, 1.03], lift: [0.01, 0.006, 0.004], vig: 0.28, flash, look: s[4] === 'room' ? 'office' : 'stadium' };
}

// ---------- world ----------
export function worldAt(f, w) {
  const s = segAt(f);
  for (const k of ['road', 'stadium', 'office', 'car']) if (w[k]) w[k].visible = false;
  w.dc.visible = s[4] === 'dc'; w.curRoom = s[4] === 'room' ? s[5] : null; w.rooms.show(w, w.curRoom);
  if (w.dc.visible) { w.dc.visible = true; for (const k of ['road', 'stadium', 'office', 'car']) if (w[k]) w[k].visible = false; }
  const R0 = w.rooms;
  R0.cash.visible = s[2] === 'hook'; if (R0.cash.visible) { const k = back(6, 110, f); R0.cash.scale.set(1, Math.max(0.05, k), 1); }
  R0.setMemo(f >= 1562);
  if (w.dc.visible) {
    const ff = fz(f), tx = w.dc.taxi; tx.position.set(1.5, 0, TAXI_Z(ff)); tx.rotation.y = Math.PI; for (const wh of tx.wheels || []) wh.rotation.x = -TAXI_Z(ff) / (wh.r || 0.33);
    const van = w.dc.van; van.setDoor(s[2] === 'van' ? eo(930, 962, f) : 0); for (const r of van.reels || []) r.rotation.z = f * 0.2;
    w.dc.setGate(s[2] === 'estab' ? sm(170, 230, f) : 0);
  }
}

// ---------- actors ----------
const CAT = (pos, opts, extra = {}) => ({ o: 'CAT', k: 2, pos, blobW: extra.blobW || 0.75, blobD: 0.45, s: extra.s || 1, opts: { gear: true, ...opts } });
const catWalk = (f, a, b, f0, f1) => { const t = clamp((f - f0) / (f1 - f0)); const c = cam(segAt(f)[2], f);
  // face the way it moves ON SCREEN: project the walk direction onto the camera's right vector (drawn facing right by default)
  const fw = [c.l[0] - c.p[0], 0, c.l[2] - c.p[2]], right = [-fw[2], 0, fw[0]], v = [b[0] - a[0], 0, b[2] - a[2]];
  const flip = -(v[0] * right[0] + v[2] * right[2]) < 0 ? false : true;
  return CAT(L3(a, b, t), { pose: t > 0 && t < 1 ? 'walk' : 'sit', phase: q((f * 0.06) % 1, 0.05), expr: 'smug', flip }, { blobW: 1.0 }); };
const clamp = (x) => Math.max(0, Math.min(1, x));
export function actorsAt(f) {
  const s = segAt(f), k = s[2], A = [], ff = fz(f);
  if (k === 'hook') {
    A.push(CAT([-800.05, 0.77, 99.75], { pose: f < 70 ? 'sit' : 'stare', expr: 'smug' }));
    A.push(person(f, 'AGENT2', 31, [-800.75, 0, 98.9], { expr: f < 60 ? 'grin' : 'excited', wave: f > 95 ? q(back(95, 110, f) * 0.7, 0.1) : undefined }));
  }
  if (k === 'estab') { const t = sm(175, 285, f); for (const [i, o] of ['SOV1', 'SOV2'].entries()) A.push(person(f, o, 41 + i, [lerp(-10.5, -6.8, t) + i * 0.9, 0.15, 799.6 + i * 0.6], { mode: t > 0 && t < 1 ? 'march' : 'stand', phase: q((f * 0.05 + i * 0.5) % 1, 0.05), expr: 'smile' })); }
  if (k === 'bench' || k === 'suspect') {
    A.push(person(f, 'SOV1', 41, BENCH[0], { mode: 'sit', expr: k === 'bench' && f > 345 ? 'angry' : 'smile', look: k === 'bench' && f > 345 ? -1 : 0.5 }, { blob: false }));
    A.push(person(f, 'SOV2', 42, BENCH[1], { mode: 'sit', expr: k === 'bench' && f > 345 ? 'angry' : 'grin', look: k === 'bench' && f > 345 ? -1 : -0.5 }, { blob: false }));
    if (k === 'bench') A.push(person(f, 'AGENT1', 32, [12.3, 0.15, 805.4], { expr: f > 345 ? 'nervous' : 'smile', prop: 'megaphone', reach: q(0.4 + 0.3 * sm(300, 330, f), 0.05) }));
    if (k === 'suspect') A.push(catWalk(f, [12.6, 0.15, 806.2], [12.7, 0.15, 801.0], 395, 468, false), ...(f > 468 ? [] : []));
  }
  if (k === 'surgery') {
    A.push(CAT([-800.05, 0.89, -0.45], { pose: 'sleep', expr: 'bored', gear: f > 520 }));
    A.push(person(f, 'SURG1', 51, [-800.85, 0, -0.9], { expr: 'smile', prop: 'spoon', reach: 0.4 }));
    A.push(person(f, 'SURG2', 52, [-799.15, 0, -0.95], { expr: 'grin' }));
  }
  if (k === 'blueprint') A.push(CAT([-799.95, 0.5, 3.0], { pose: 'sit', blueprint: true }, { s: 0.56 }));
  if (k === 'problem') {
    A.push(person(f, 'AGENT2', 31, [-800.7, 0, 0.6], { expr: f < 776 ? 'grin' : f < 852 ? 'shock' : 'angry', prop: 'stick', reach: q(0.4 + 0.2 * Math.sin(f * 0.2), 0.05) }));
    if (f < 806) A.push(CAT([-800.0, 0.89, -0.45], { pose: f < 776 ? 'sit' : 'stare', expr: 'smug' }));
    else if (f < 835) A.push(catWalk(f, [-799.6, 0, 0.3], [-799.45, 0, 1.85], 806, 832, false));
    else if (f < 852) A.push(CAT([-799.6, 0, 2.15], { pose: 'hungry', expr: 'happy' }));
    else A.push(CAT([-799.05, 0.1, 1.75], { pose: 'sleep', expr: 'bored' }));
  }
  if (k === 'van') { if (f >= 958) A.push(catWalk(f, [4.9, 0.6, 784.2], [6.9, 0.15, 785.6], 960, 1010, false)); }
  if (k === 'release') {
    A.push(person(f, 'SOV1', 41, BENCH[0], { mode: 'sit', expr: 'smile' }, { blob: false }));
    A.push(person(f, 'SOV2', 42, BENCH[1], { mode: 'sit', expr: 'grin' }, { blob: false }));
    A.push(catWalk(f, [9.2, 0.15, 800.8], [11.6, 0.15, 802.0], 1030, 1140, false));
  }
  if (k === 'street' || k === 'street2') {
    const t = clamp((ff - 1152) / (1205 - 1152));
    if (ff < 1206) A.push(catWalk(ff, [5.6, 0.15, 806.2], [2.2, 0, 806.4], 1152, 1205, true));
    else A.push(CAT([2.2, 0, 806.4], { pose: ff >= 1214 ? 'startled' : 'stare', expr: ff >= 1214 ? 'surprised' : 'smug', flip: true }, { blobW: 1.0 }));
  }
  if (k === 'survived') A.push(CAT([5.5, 0.15, 807.2], { pose: f < 1300 ? 'stare' : 'lick', expr: 'smug' }));
  if (k === 'orders') {
    A.push(person(f, 'AGENT2', 31, [-800.7, 0, 0.6], { expr: 'angry', prop: 'stick', reach: q(0.6 + 0.3 * Math.sin(f * 0.35), 0.05) }));
    A.push(CAT([-799.6, 0, 1.4], { pose: f < 1420 ? 'stare' : 'yawn', expr: 'bored' }));
  }
  if (k === 'home') {
    A.push(person(f, 'GRANNY', 61, [-800.95, 0.45, 198.75], { mode: 'sit', expr: f > 1640 ? 'laugh' : 'smile' }, { blob: false }));
    A.push(CAT([-800.0, 0, 200.2], { pose: f < 1650 ? 'hungry' : 'stare', expr: 'smug', gear: false }));
  }
  return A;
}

// ---------- effects ----------
export function fxAt(f) {
  const s = segAt(f), k = s[2], F = [];
  if (k === 'hook' && f > 40) F.push({ fx: 'board', lines: ['CIA', 'BUDGET: $$$'], pos: [-800.95, 1.55, 98.9], size: 0.55 * back(40, 52, f) });
  if (k === 'estab' && f > 150) F.push({ fx: 'board', lines: ['WASHINGTON', '1960s'], pos: [-1.5, 3.4, 778], size: 2.2 * back(150, 166, f) });
  if (k === 'bench' && f > 345) F.push({ fx: 'qmark', pos: [13.6, 2.0, 803.2], size: 0.4 * back(345, 355, f) });
  if (k === 'blueprint') F.push({ fx: 'bpbg', pos: [-799.95, 0.95, 2.85], size: 1.5 });
  if (k === 'problem' && f >= 835 && f < 852) F.push({ fx: 'qmark', pos: [-799.3, 1.0, 2.1], size: 0.25 });
  if (k === 'problem' && f >= 860) for (let i = 0; i < 3; i++) { const z2 = ((f - 860) / 30 + i / 3) % 1; F.push({ fx: 'zzz', pos: [-798.85 + z2 * 0.3, 0.55 + z2 * 0.6, 1.8], size: 0.14 + z2 * 0.12, op: 1 - z2 }); }
  if (k === 'release' && f > 1024) F.push({ fx: 'board', lines: ['THE FAMOUS', 'VERSION'], pos: [12.0, 2.0, 801.4], size: 1.0 * back(1024, 1036, f) });
  if ((k === 'street' || k === 'street2') && fz(f) >= 1214) F.push({ fx: 'burst', t: Math.min(1, (fz(f) - 1214) / 14), pos: [2.2, 0.9, 806.4], size: 0.7, col: '#fff3b0', rays: 10 });
  if (k === 'survived' && f < 1300) F.push({ fx: 'puff', t: (f - 1259) / 41, pos: [0.5, 0.6, 806.0], size: 2.0, tint: '#d8d4cc' });
  if (k === 'survived' && f >= 1354) F.push({ fx: 'check', pos: [5.5, 1.1, 807.2], size: 0.5 * back(1354, 1364, f) });
  if (k === 'memo' && f >= 1540) { const down = f < 1560 ? ei(1540, 1560, f) : 1 - eo(1568, 1590, f); F.push({ fx: 'stamp', pos: [-800, 0.779 + 0.12 + (1 - down) * 0.5, 99.52], size: 0.22 }); }
  return F;
}
