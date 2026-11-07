// 1904 Olympic marathon: shots, cameras, light, world, actors, effects (30 fps, 1317 f).
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const sm = (a, b, f) => { const t = clamp01((f - a) / (b - a)); return t * t * t * (t * (t * 6 - 15) + 10); };
export const eo = (a, b, f) => { const t = clamp01((f - a) / (b - a)); return 1 - (1 - t) ** 3; };
export const ei = (a, b, f) => { const t = clamp01((f - a) / (b - a)); return t * t; };
export const back = (a, b, f) => { const t = clamp01((f - a) / (b - a)), c = 1.9; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };
export const lerp = (a, b, t) => a + (b - a) * t;
export const L3 = (a, b, t) => a.map((x, i) => lerp(x, b[i], t));
export const add3 = (a, b) => a.map((x, i) => x + b[i]);
export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const q = (x, s = 0.5) => Math.round(x / s) * s;
const rnd = (k) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export const SHOTS = [
  { id: 1, f0: 0, f1: 137, light: 'hot' }, { id: 2, f0: 137, f1: 179, light: 'day' }, { id: 3, f0: 179, f1: 215, light: 'hot' },
  { id: 4, f0: 215, f1: 344, light: 'hot' }, { id: 5, f0: 344, f1: 425, light: 'hot' }, { id: 6, f0: 425, f1: 475, light: 'hot' },
  { id: 7, f0: 475, f1: 525, light: 'hot' }, { id: 8, f0: 525, f1: 598, light: 'hot' }, { id: 9, f0: 598, f1: 676, light: 'hot' },
  { id: 10, f0: 676, f1: 727, light: 'day' }, { id: 11, f0: 727, f1: 767, light: 'day' }, { id: 12, f0: 767, f1: 820, light: 'day' },
  { id: 13, f0: 820, f1: 900, light: 'day' }, { id: 14, f0: 900, f1: 966, light: 'day' }, { id: 15, f0: 966, f1: 1077, light: 'explain' },
  { id: 16, f0: 1077, f1: 1120, light: 'explain' }, { id: 17, f0: 1120, f1: 1208, light: 'golden' }, { id: 18, f0: 1208, f1: 1317, light: 'office' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.f0 && f < s.f1) || SHOTS[SHOTS.length - 1];
const LIGHTS = {
  // key/fill: warm low-ish sun (long shadows) vs cool sky + cool opposing fill; purple-leaning ground bounce. practI = warm lanterns.
  day: { top: '#4f8ad8', hor: '#a4bfea', fog: '#d0e8f8', fogN: 60, fogF: 420, sky: '#9fb8f0', ground: '#5c4f72', hemiI: 0.64, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#ffe6bc', sunI: 3.9, az: 35, el: 36, disc: '#fffbe8', cloud: '#ffffff', cardTint: '#ffffff', fxTint: '#ffffff' },
  hot: { top: '#4f8ad8', hor: '#a4bfea', fog: '#c4def0', fogN: 120, fogF: 800, sky: '#9fb6ec', ground: '#5e4e70', hemiI: 0.62, fillCol: '#7a90e2', fillI: 0.35, sunCol: '#ffe0b0', sunI: 4.2, az: 28, el: 38, disc: '#fffbe0', discSize: 0.004, cloud: '#ffffff', cardTint: '#ffffff', fxTint: '#ffffff' },
  golden: { top: '#5a78c8', hor: '#ffc890', fog: '#f8c89a', fogN: 50, fogF: 300, sky: '#8f90d8', ground: '#5a3e58', hemiI: 0.95, fillCol: '#6f7ad8', fillI: 0.3, sunCol: '#ffb070', sunI: 3.1, az: -112, el: 11, disc: '#fff0c8', discSize: 0.003, cloud: '#ffd8b0', cardTint: '#fff2e2', fxTint: '#fff6ea' },
  explain: { top: '#060c26', hor: '#1a2854', fog: '#141d40', fogN: 25, fogF: 200, sky: '#3c4fa8', ground: '#121730', hemiI: 0.7, fillCol: '#3a4cb0', fillI: 0.25, sunCol: '#93a8ff', sunI: 0.9, az: 140, el: 34, disc: '#f2f4ff', discSize: 0.0012, stars: 1, cloud: '#2c3a66', cardTint: '#d8e2ff', fxTint: '#eef2ff', practI: 40, practCol: '#ffa64d', practD: 18, practKey: [-2.4, 2.6, -1.6], practKeyI: 11, practKeyD: 7 },
  office: { top: '#000000', hor: '#3a2a1e', fog: '#3b2a1d', fogN: 10, fogF: 60, sky: '#ffe8c8', ground: '#6a4a32', hemiI: 1.4, fillCol: '#8a90c8', fillI: 0.2, sunCol: '#ffe2b0', sunI: 0.9, az: 20, el: 65, disc: '#000000', clouds: false, shadow: false, cardTint: '#fff0e2', fxTint: '#ffffff', practI: 6, practCol: '#ffc070', practD: 8 },
};
export const lightFor = (f) => LIGHTS[shotAt(f).light];
export const LIGHTS_ = LIGHTS;

// ---------- car ----------
function carState(f) {
  const id = shotAt(f).id;
  if (id === 1) return { pos: [0, 0, -30 + f * 0.33], v: 0.33 };
  if (id === 6) return { pos: [-0.6, 0, lerp(-46, -10, sm(425, 480, f))], v: 0.6 };
  if (id === 7) { const z = f < 508 ? lerp(-10, -1.4, eo(475, 492, f)) : -1.4 + 0.5 * (f - 508) * ei(508, 525, f); return { pos: [-0.6, 0, z], v: f < 492 ? 0.3 : f > 508 ? 0.2 : 0 }; }
  if (id === 8) { const d = f < 567 ? (f - 525) * 0.4 : 16.8 + 3.0 * eo(567, 582, f); return { pos: [0, 0, -60 + d], v: f < 567 ? 0.4 : 0.2 * (1 - eo(567, 582, f)), bang: f >= 567 ? f - 567 : -1 }; }
  if (id === 9) return { pos: [0, 0, -40.2], v: 0, bang: 40 };
  return null;
}
const SEAT_D = [-0.32, 1.0, -0.62], SEAT_F = [0.34, 1.0, -0.62];

export function worldAt(f, w) {
  const id = shotAt(f).id, set = id === 2 || (id >= 10 && id <= 14) ? 'stadium' : id === 18 ? 'office' : 'road';
  w.road.visible = set === 'road'; w.stadium.visible = set === 'stadium'; w.office.visible = set === 'office';
  const C = carState(f);
  w.car.visible = !!C;
  if (C) {
    const jolt = C.bang >= 0 && C.bang < 20 ? 0.06 * Math.exp(-C.bang * 0.2) * Math.sin(C.bang * 1.3) : 0;
    w.car.position.set(C.pos[0], 0.02 * Math.abs(Math.sin(f * 0.9)) * (C.v > 0 ? 1 : 0), C.pos[2]); w.car.rotation.set(jolt, 0, 0.01 * Math.sin(f * 0.7) * (C.v > 0 ? 1 : 0));
    for (const wh of w.car.wheels) wh.rotation.x = C.pos[2] / wh.r;
    const run = C.v > 0.02 ? 1 : 0, eng = C.bang >= 0 && C.bang > 20 ? 0 : 1;
    w.car.body.position.y = run * (0.025 * Math.sin(f * 1.7) + 0.035 * Math.max(0, Math.sin(f * 0.37))) + eng * 0.006 * Math.sin(f * 3.1);
    w.car.body.rotation.z = run * 0.018 * Math.sin(f * 0.53); w.car.body.rotation.x = run * 0.012 * Math.sin(f * 0.71) - (C.bang >= 0 && C.bang < 14 ? 0.05 * Math.exp(-C.bang * 0.25) : 0);
    w.car.steer.visible = false;
  }
  const br = id === 10 ? sm(698, 712, f) : id > 10 && id <= 14 ? 1 : 0;
  w.tape[0].rotation.y = 1.3 * br; w.tape[1].rotation.y = -1.3 * br;
  w.doc.material.map = w.docTex[f >= 1294 ? 1 : 0];
}

// ---------- positions ----------
const STD = [400, 0, 0];
const fredRun5 = (f) => [0.2, 0, -10 + (Math.min(f, 402) - 344) * 0.12];
const fredHop = (f) => { const C = carState(f); const seat = add3(C.pos, SEAT_F); const t = sm(490, 504, f); const p = L3([1.4, 0, -0.9], seat, t); p[1] += 0.9 * Math.sin(Math.PI * t); return p; };
const fredOut = (f) => { const car = [0, 0, -40.2], t = sm(611, 624, f); const p = L3(add3(car, SEAT_F), [1.3, 0, -39.4], t); p[1] += 0.8 * Math.sin(Math.PI * t); if (f > 628) p[2] += (f - 628) * 0.1; return p; };
const fredFin = (f) => [400.4, 0, -4 + (f - 676) * 0.24];
const hicksFin = (f) => [400.0, 0.12, -8 + (f - 900) * 0.07];

// ---------- camera ----------
const IMP = [[567, 0.08], [698, 0.05], [1294, 0.08]];
const kick = (f) => { let v = [0, 0, 0]; for (const [i, a] of IMP) { const t = f - i; if (t >= 0 && t < 7) { const k = a * 0.7 * (1 - t / 7) * (t % 2 ? -1 : 1); v = add3(v, [k, k * 0.6, 0]); } } return v; };
// Camera grammar (see REPORT.md): locked-off or slow push-in by default; the actors and the car do the moving.
// WIDE: head ~1/8 of frame (d≈7.5 @ fov 36). MEDIUM-WIDE: head ~1/6 (d≈5.5). CU only for beats (cramp, medal, stamp).
// push(p, l, k, t): dolly the lens a fraction k of the way toward the look point (k ≤ 0.12 per shot = slow push).
const push = (p, l, k, t) => L3(p, l, k * t);
const lock = (p, l, fov, fp, cInf, x = {}) => ({ p, l, fov, fp, cInf, ...x });
function camRaw(f) {
  const id = shotAt(f).id, C = carState(f);
  if (id === 1) { // tripod telephoto ahead of the car: it grows out of the heat haze, camera only pans gently after it
    const t = sm(0, 137, f), aim = add3(C.pos, [0.1, 1.15, 0]), l = L3(aim, [-0.4, 1.0, -8], 0.35);
    return lock([1.15, 1.3, 24], l, lerp(11, 26, t), add3(C.pos, [0.3, 1.5, -0.4]), 5, { fy: -0.1 }); }
  if (id === 2) { const t = sm(137, 179, f); return lock(L3([394, 12.5, 18], [396.5, 8.5, 14], t), L3([401, 1.2, -16], [401, 2.0, -18], t), 44, [401, 1.5, -16], 2); } // slow crane-down establishing wide
  if (id === 3) { const t = sm(179, 215, f); return lock(push([2.35, 2.05, 4.4], [3.3, 2.0, 0.8], 0.08, t), [3.3, 2.0, 0.8], 36, [3.3, 2.0, 0.8], 6); } // thermometer insert
  if (id === 4) { const t = sm(215, 344, f); return lock(push([0.5, 2.3, 13.5], [0.0, 0.8, 0], 0.06, t), [0.0, 0.8, 0], 40, [0, 1.4, 2.5], 5, { fy: -0.12 }); } // runners walk into a locked wide and drop
  if (id === 5) { // locked wide down the road as Fred runs in past mile 9 -> punch-in on the cramp
    const fr = fredRun5(f), z = eo(402, 409, f), l = L3([0.6, 1.05, -5], add3(fr, [0, 1.25, 0]), z);
    return lock([1.55, 1.45, 4.8], l, lerp(36, 17, z), add3(fr, [0, 1.4, 0]), lerp(5, 9, z)); }
  if (id === 6) { const t = sm(425, 475, f); return lock(push([2.9, 1.6, 8.0], [0.4, 1.1, -6], 0.05, t), [0.4, 1.1, -6], 38, [1.4, 1.4, -0.9], 5, { fy: -0.12 }); }
  if (id === 7) return lock([2.7, 1.45, 7.6], [-0.35, 1.1, -2.4], 38, [0.2, 1.4, -1.2], 5, { fy: -0.14 });
  if (id === 8) { const t = sm(525, 598, f); return lock(push([2.0, 1.45, -32.0], [-0.1, 1.05, -43], 0.06, t), [-0.1, 1.05, -43], 40, add3(C.pos, [0.2, 1.4, -0.4]), 5, { fy: -0.1 }); } // car drives in and dies in a locked frame
  if (id === 9) { const t = sm(598, 676, f); return lock(push([3.0, 1.4, -29.0], [0.7, 1.0, -38.5], 0.05, t), [0.7, 1.0, -38.5], 38, add3(fredOut(f), [0, 1.3, 0]), 5, { fy: -0.08 }); } // Fred hops out, jogs toward lens
  if (id === 10) return lock([401.0, 1.3, 13.8], [400.3, 1.65, 2], 40, add3(fredFin(f), [0, 1.4, 0]), 5);
  if (id === 11) { const t = sm(727, 767, f); return lock(push([397.4, 2.0, 7.5], [409, 3.0, -6], 0.06, t), [409, 3.0, -6], 44, [409, 3, -6], 3); }
  if (id === 12) { const t = sm(767, 820, f); return lock(push([400.25, 1.5, 14.8], [400.0, 1.3, 8.6], 0.12, t), [400.0, 1.3, 8.6], 36, [400, 1.5, 8.6], 6); } // medal: two-shot, slow push
  if (id === 13) { const t = eo(862, 880, f); return lock(L3([400.75, 1.5, 17.0], [400.6, 1.5, 13.4], t), L3([400.75, 1.2, 8.6], [400.6, 1.35, 8.6], t), 36, [400.6, 1.45, 8.6], lerp(5, 7, t)); } // kid enters; push to Fred on "the car"
  if (id === 14) { const t = sm(900, 966, f); return lock(push([400.7, 1.45, 4.8], [400.0, 1.2, -7], 0.05, t), [400.0, 1.2, -7], 34, add3(hicksFin(f), [0, 1.4, 0]), 5); }
  if (id === 15 || id === 16) { const t = sm(966, 1120, f); return lock(push([0.15, 1.55, 7.4], [0, 1.25, 0], 0.12, t), [0, 1.25, 0], 38, [0, 1.4, 0], 7); }
  if (id === 17) { const t = sm(1120, 1208, f); return lock(push([0.9, 1.25, 12.5], [0, 1.15, 2], 0.05, t), [0, 1.15, 2], 34, [0, 1.4, (f - 1120) * 0.05], 6); } // trio walks into a low locked wide
  // office: medium-wide of the official at his desk, snap in to the stamp as it lands
  const t = eo(1288, 1296, f);
  return lock(L3([-399.45, 1.6, 3.4], [-399.85, 2.05, 0.75], t), L3([-400, 1.15, -1.3], [-399.9, 0.93, -0.35], t), lerp(38, 36, t), L3([-400.05, 1.3, -1.75], [-399.9, 0.93, -0.35], t), lerp(5, 7, t));
}
const WHIPS = [];
export function camAt(f) {
  const c = camRaw(f), k = kick(f);
  for (const w of WHIPS) { const d = f - w; if (d >= -6 && d < 6) { const s = d < 0 ? (d + 7) / 7 : (6 - d) / 7; c.fov *= d < 0 ? 1 - 0.32 * s * s : 1 + 0.28 * s * s; c.whip = true; } }
  c.p = add3(c.p, k); c.l = add3(c.l, k.map((x) => x * 0.6));
  c.focus = dist(c.p, c.fp || c.l); return c;
}
const CUTS = [1208], HITS = [[567, 0.3], [698, 0.2], [873, 0.15], [1294, 0.35]];
export function gradeAt(f) {
  const L = shotAt(f).light; let flash = 0;
  for (const c of CUTS) { if (f >= c - 2 && f < c) flash = Math.max(flash, (f - c + 3) / 3); if (f >= c && f < c + 6) flash = Math.max(flash, 1 - (f - c) / 6); }
  for (const [c, a] of HITS) if (f >= c && f < c + 5) flash = Math.max(flash, a * (1 - (f - c) / 5));
  // look: the per-scene colour grade in main.js GRADES (road / stadium / night / golden / office)
  const G = { sat: 1.15, gain: [1.03, 1.03, 1.03], lift: [0.01, 0.006, 0.004], vig: 0.28, flash, look: { hot: 'road', day: 'stadium', explain: 'night', golden: 'golden', office: 'office' }[L] || 'road' };
  if (L === 'hot') Object.assign(G, { sat: 1.22, gain: [1.05, 1.03, 1.0] });
  if (L === 'explain') Object.assign(G, { sat: 1.05, lift: [0, 0.004, 0.016], vig: 0.35 });
  if (L === 'golden') Object.assign(G, { gain: [1.06, 1.0, 0.94] });
  if (L === 'office') Object.assign(G, { vig: 0.4, gain: [1.05, 1.0, 0.94], dofK: 0.3 }); // plaque insert: keep the text legible
  return G;
}

// ---------- actors ----------
const blinkAt = (f, seed) => { const p = 70 + Math.floor(40 * rnd(seed)), t = (f + seed * 37) % p; return t < 1 ? 0.5 : t < 3 ? 1 : t < 4 ? 0.5 : 0; };
export const person = (f, o, seed, pos, opts = {}, extra = {}) => ({ o, k: extra.k || 2, pos: add3(pos, [0, 0.006 * Math.sin(f * 0.11 + seed), 0]), roll: extra.roll || 0, blob: extra.blob, s: extra.s,
  opts: { mode: 'stand', seed, blink: blinkAt(f, seed), headTilt: q(2.2 * Math.sin(f * 0.07 + seed), 0.5), ...opts } });
export const runner = (f, o, seed, pos, expr, sp = 0.06, extra = {}) => { const ph = (f * sp + seed * 0.37) % 1; return person(f, o, seed, add3(pos, [0, 0.12 * Math.abs(Math.sin(ph * Math.PI * 2)), 0]), { mode: 'march', phase: q(ph, 0.05), expr, lift: 40, headTilt: q(4 * Math.sin(ph * Math.PI * 2), 0.5) }, { roll: 0.07 * Math.sin(ph * Math.PI * 2), ...extra }); };
export const seated = (f, o, seed, pos, expr) => person(f, o, seed, pos, { mode: 'sit', expr }, { blob: false });
const CROWD = []; for (let i = 0; i < 60; i++) { const r = i % 5, side = 1; CROWD.push({ x: 400 + side * (6.6 + r * 1.2), y: 0.6 + 0.6 * r, z: -26 + Math.floor(i / 5) * 3.0 + (r % 2) * 1.3, seed: 50 + i }); }
export const crowd = (f, cheer, k = 0.9) => CROWD.map((c, i) => person(f, 'PASS' + (i % 8), c.seed, [c.x, c.y + (cheer ? 0.05 * Math.abs(Math.sin(f * 0.35 + i)) : 0), c.z], cheer ? { expr: i % 3 ? 'grin' : 'laugh', cheer: q(0.5 + 0.5 * Math.sin(f * 0.4 + i), 0.1), wave: q(0.5 + 0.5 * Math.sin(f * 0.4 + i + 1), 0.1) } : { expr: f > 880 ? 'shock' : 'neutral' }, { k, blob: false }));
const DROPS = [285, 304, 312, 320];
// z-window of spectators each road shot's camera can see
const SPECW = { 1: [-44, 22], 4: [-16, 10], 5: [-20, 4], 6: [-24, 6], 7: [-12, 6], 8: [-52, -32], 9: [-48, -28] };
export function actorsAt(f) {
  const id = shotAt(f).id, A = [], C = carState(f);
  if (C && id !== 9) {
    const bump = C.v > 0.02 ? 0.025 * Math.sin(f * 1.7) + 0.035 * Math.max(0, Math.sin(f * 0.37)) : 0;
    A.push({ ...seated(f, 'DRIVER', 6, add3(C.pos, add3(SEAT_D, [0, bump, 0])), C.bang >= 0 ? 'shock' : 'neutral'), drive: true });
    if (id === 1 || id === 8 || (id === 7 && f >= 504)) { const bump = C.v > 0.02 ? 0.025 * Math.sin(f * 1.7 + 0.4) + 0.035 * Math.max(0, Math.sin(f * 0.37)) : 0; const fr = seated(f, 'FRED', 3, add3(C.pos, add3(SEAT_F, [0, bump, 0])), C.bang >= 0 ? 'shock' : 'grin'); if (C.bang < 0) fr.opts.wave = q(0.5 + 0.5 * Math.sin(f * 0.3), 0.1); A.push(fr); }
  }
  if (id === 9) A.push(seated(f, 'DRIVER', 6, add3(C.pos, SEAT_D), 'nervous'));
  if (id === 1) for (let i = 0; i < 5; i++) A.push(runner(f, 'RUN' + i, 10 + i, [(i % 2 ? -1.4 : -2.4), 0, -24 + i * 9 + f * 0.04], i % 2 ? 'nervous' : 'pained', 0.05));
  if ([1, 4, 5, 6, 7, 8, 9].includes(id)) { // roadside spectators on a world-anchored grid (no popping under locked cameras)
    const [z0, z1] = SPECW[id];
    for (let k = Math.ceil(z0 / 3.1); k * 3.1 <= z1; k++) { const z = k * 3.1, i = k & 15; A.push(person(f, 'PASS' + (k & 7), 70 + i, [-4.75 - (k & 1) * 0.5, 0, z], { expr: i % 3 ? 'grin' : 'laugh', cheer: k & 1 ? q(0.5 + 0.5 * Math.sin(f * 0.35 + i), 0.1) : undefined, wave: k & 1 ? undefined : q(0.5 + 0.5 * Math.sin(f * 0.3 + i), 0.1) }, { k: 1 })); } }
  if (id === 2) A.push(...crowd(f, true, 0.7));
  if (id === 2) for (let i = 0; i < 6; i++) A.push(person(f, 'PASS' + i, 30 + i, [397 + i * 1.2, 0, -27 - (i % 2)], { expr: 'grin', wave: i % 2 ? q(0.5 + 0.5 * Math.sin(f * 0.3 + i), 0.1) : undefined }, { k: 1 }));
  if (id === 4) for (let i = 0; i < 6; i++) {
    const base = [-1.8 + i * 0.75, 0, -4 - (i % 3) * 1.4], d = DROPS[i] ?? 1e9, zf = Math.min(f, d) - 215;
    const p = add3(base, [0, 0, zf * 0.06]);
    if (f >= d) { const a = person(f, 'RUN' + i, 10 + i, add3(p, [0, 0.22, 0]), { mode: 'fall', expr: 'dazed' }, { roll: (i % 2 ? 1 : -1) * 1.35 * back(d, d + 7, f) }); A.push(a); }
    else A.push(runner(f, 'RUN' + i, 10 + i, p, i % 2 ? 'nervous' : 'pained', 0.05));
  }
  if (id === 5) { const fr = fredRun5(f); if (f < 402) A.push(runner(f, 'FRED', 3, fr, 'neutral', 0.07)); else A.push(person(f, 'FRED', 3, add3(fr, [0, f >= 404 ? 0.12 * Math.abs(Math.sin((f - 404) * 0.45)) : 0, 0]), { expr: f >= 404 ? 'pained' : 'nervous', tilt: f >= 404 ? -10 : 0 })); }
  if (id === 6) A.push(person(f, 'FRED', 3, [1.4, 0, -0.9], { expr: f < 450 ? 'nervous' : 'smile', look: q(Math.sin(f * 0.12), 0.25), headTilt: q(6 * Math.sin(f * 0.1), 0.5) }));
  if (id === 7 && f < 504) A.push(person(f, 'FRED', 3, f < 490 ? [1.4, 0, -0.9] : fredHop(f), { expr: 'grin' }, { blob: f < 490 }));
  if (id === 9) { const fr = fredOut(f); if (f < 628) A.push(f < 611 ? seated(f, 'FRED', 3, add3([0, 0, -40.2], SEAT_F), 'nervous') : person(f, 'FRED', 3, fr, { expr: 'grin' })); else A.push(runner(f, 'FRED', 3, fr, 'whistle', 0.05)); }
  if (id === 10) { A.push(runner(f, 'FRED', 3, fredFin(f), f >= 698 ? 'laugh' : 'grin', 0.08)); A.push(...crowd(f, true, 0.7)); }
  if (id === 11) A.push(...crowd(f, true, 1.0));
  if (id === 12 || id === 13) {
    const frozen = id === 13 && f >= 830;
    A.push(person(f, 'FRED', 3, [400.6, 0, 8.5], { expr: id === 13 && f >= 873 ? 'nervous' : 'grin', blink: frozen ? 0 : blinkAt(f, 3) }));
    const rc = id === 12 ? back(775, 790, f) : f < 873 ? 1 : 1 - eo(873, 884, f);
    A.push(person(f, 'OFFICIAL', 7, [399.4, 0, 8.6], { expr: frozen ? (f > 873 ? 'stern' : 'neutral') : 'smile', prop: 'medal', reach: q(rc, 0.05) }));
    if (id === 13 && f >= 846) A.push(person(f, 'KID', 9, [401.7, 0, 9.0], { expr: 'stern', wave: 1 }));
  }
  if (id === 14) { const h = hicksFin(f); A.push(runner(f, 'HICKS', 4, h, 'dazed', 0.03, { roll: 0.12 * Math.sin(f * 0.08) })); A.push(runner(f, 'TRN0', 20, add3(h, [-0.62, -0.12, 0.05]), 'stern', 0.03)); A.push(runner(f, 'TRN1', 21, add3(h, [0.62, -0.12, 0.05]), 'nervous', 0.03)); }
  if (id === 15 || id === 16) {
    A.push(person(f, 'HICKS', 4, [0.55, 0, 0], { expr: 'dazed', headTilt: q(8 * Math.sin(f * 0.07), 0.5) }, { roll: 0.06 * Math.sin(f * 0.05) }));
    const pr = f >= 1047 && id === 15 ? 'bottle' : f >= 1020 && id === 15 ? 'spoon' : undefined, rr = pr ? q(f >= 1047 ? back(1047, 1058, f) : back(1020, 1031, f), 0.05) : 0;
    A.push(person(f, 'TRN0', 20, [-0.55, 0, 0.1], { expr: id === 16 ? 'grin' : 'smile', prop: pr, reach: rr, wave: id === 16 ? q(back(1078, 1086, f), 0.1) : undefined }));
  }
  if (id === 17) { const z = (f - 1120) * 0.05, h = [0, 0.15, z]; A.push(runner(f, 'HICKS', 4, h, 'dazed', 0.02, { roll: 0.1 * Math.sin(f * 0.07) })); A.push(runner(f, 'TRN0', 20, add3(h, [-0.6, -0.15, 0.05]), 'stern', 0.04)); A.push(runner(f, 'TRN1', 21, add3(h, [0.6, -0.15, 0.05]), 'nervous', 0.04)); }
  if (id === 18) A.push(person(f, 'OFFICIAL', 7, [-400.05, 0, -1.75], { expr: f >= 1294 ? 'grin' : 'stern', prop: 'stick', reach: q(0.55 + 0.1 * Math.sin(f * 0.5), 0.05) }));
  return A;
}

// ---------- effects ----------
export function fxAt(f) {
  const id = shotAt(f).id, F = [], C = carState(f);
  if (C && C.v > 0.25) { F.push({ fx: 'speed', k: f % 7, pos: add3(C.pos, [-1.3, 1.3, -1.2]), size: 1.4, op: 0.55 }); F.push({ fx: 'speed', k: (f + 3) % 7, pos: add3(C.pos, [1.4, 1.1, -1.0]), size: 1.2, op: 0.5 }); for (let i = 0; i < 2; i++) { const tt = ((f / 10) + i / 2) % 1; F.push({ fx: 'puff', t: tt, pos: add3(C.pos, [0.35, 0.55 + tt * 0.5, -1.5 - tt * 1.6]), size: 0.6 + tt, tint: '#b8b4b0' }); } }
  if (C && C.v > 0.05) for (let i = 0; i < 5; i++) { const t = ((f / 18) + i / 3) % 1; F.push({ fx: 'puff', t, pos: add3(C.pos, [(i - 1) * 0.6, 0.4 + t * 0.6, -1.8 - t * 3]), size: 1.6 + t * 1.5, tint: '#e2cfa8' }); }
  if (C && C.bang >= 0) for (let i = 0; i < 3; i++) { const t = ((C.bang / 30) + i / 3) % 1; F.push({ fx: 'steam', t, pos: add3(C.pos, [0, 1.4 + t * 1.2, 1.2]), size: 1.4 + t, tint: '#f4f4f2' }); }
  if (id === 8 && f >= 567 && f < 585) F.push({ fx: 'burst', t: (f - 567) / 18, pos: add3(C.pos, [0, 1.3, 1.4]), size: 1.6, col: '#ffd36b', rays: 12 });
  if (id === 3) { F.push({ fx: 'thermo', lvl: q(lerp(0.45, 1, eo(181, 206, f)), 0.02), pos: [3.3, 2.0, 0.8], size: 0.5 }); F.push({ fx: 'sun', pos: [5.2, 3.2, -5], size: 2.2, roll: f * 0.01 }); }
  if (id === 4) for (const d of DROPS) if (f >= d && f < d + 16) F.push({ fx: 'puff', t: (f - d) / 16, pos: [-1.8 + DROPS.indexOf(d) * 0.75, 0.3, -4 - (DROPS.indexOf(d) % 3) * 1.4 + (d - 215) * 0.06 + 0.2], size: 1.2, tint: '#e2cfa8' });
  if (id === 5) F.push({ fx: 'sign', n: 9, pos: [2.6, 1.0, -2.2], size: 0.9 });
  if (id === 5 && f >= 404 && f < 420) F.push({ fx: 'burst', t: (f - 404) / 16, pos: add3(fredRun5(f), [0.1, 0.7, 0.2]), size: 0.7, col: '#ff6b5a', rays: 8 });
  if (id === 8) F.push({ fx: 'sign', n: 20, pos: [-3.3, 1.0, -44], size: 1.0 });
  if (id === 10 && f >= 698 && f < 716) F.push({ fx: 'burst', t: (f - 698) / 18, pos: [400.4, 2.3, 5.2], size: 1.1, col: '#fff3b0', rays: 12 });
  if (id === 11) for (let i = 0; i < 5; i++) { const t0 = 730 + i * 6, t = (f - t0) / 30; if (t >= 0 && t < 1) F.push({ fx: 'hat', pos: [407 + i * 1.1, 3.5 + 3 * t - 2.4 * t * t, -8 + i * 1.5], size: 0.5, roll: t * 6 * (i % 2 ? 1 : -1) }); }
  if (id === 12 && f >= 805 && f < 820) F.push({ fx: 'burst', t: (f - 805) / 15, pos: [399.95, 1.75, 8.8], size: 0.6, col: '#fff3b0', rays: 10 });
  if (id === 14 && f >= 940 && f < 962) F.push({ fx: 'burst', t: (f - 940) / 22, pos: add3(hicksFin(f), [0, 2.1, 0.1]), size: 0.8, col: '#fff3b0', rays: 10 });
  if (id === 15) { if (f >= 1020) F.push({ fx: 'tin', pos: [-0.75, 2.2, 0.5], size: 0.38 * back(1020, 1028, f) }); }
  if (id === 16 && f >= 1079) F.push({ fx: 'check', pos: [0.05, 2.45, 0.3], size: 0.7 * back(1079, 1088, f) });
  if (id === 18 && f >= 1280) { const down = f < 1294 ? ei(1280, 1294, f) : 1 - eo(1300, 1314, f); F.push({ fx: 'stamp', pos: [-399.9, 0.93 + 0.17 + (1 - down) * 0.7, -0.3], size: 0.3 }); }
  return F;
}

export const TALKER = { 1: 'FRED', 5: 'FRED', 6: 'FRED', 7: 'FRED', 8: 'FRED', 9: 'FRED', 10: 'FRED', 12: 'FRED', 13: 'FRED', 15: 'TRN0', 16: 'TRN0', 17: 'TRN0', 18: 'OFFICIAL' };
