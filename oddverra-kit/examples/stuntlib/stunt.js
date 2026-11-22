// [STUNT] Oddverra stunt-footage library: 90 s (2700 f @ 30 fps) of original open-world-style stunt driving at 1080x960 (half of a 9:16 frame).
// Everything here is our own: a generic sunny coastal city (beach boulevard -> downtown + drawbridge -> harbor -> neon strip at dusk),
// a generic orange sports car, generic police, generic HUD (speedometer, round minimap, five wanted stars). No game names, logos, maps,
// cars, UI art or fonts from any real game.
// Deterministic: renderFrame(f) depends only on f (all physics is precomputed once at load), so frames can render in any order / any worker.
// Beats (library time):  A 0-19 s beach boulevard, traffic weaving, mega-ramp barrel roll (lip ~11 s)
//                        B 19-42 s downtown, police join, open drawbridge jump (lip ~37 s)
//                        C 42-64 s harbor at golden hour, truck-ramp flat-spin (lip ~58.5 s)
//                        D 64-90 s neon strip at dusk, mega-ramp double roll over a police roadblock (lip ~79 s), drift out.
// Test flags: ?rs=2 supersample, ?nohud=1, ?dbg=1 (logs sim summary).
import * as THREE from './three/three.module.js';

const Q = new URLSearchParams(location.search);
const RS = +(Q.get('rs') || 1), W = Math.round(1080 * RS), H = Math.round(960 * RS);
const FPS = 30, NF = 2700, DT = 1 / 240, G = 9.81;
const ORIGIN = [-165000, 0, 0]; // world placement of the stunt city (keeps clear of the story sets; all geometry is local to ROOT)
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const sm5 = (t) => t * t * t * (t * (t * 6 - 15) + 10);
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function keyed(K, t) { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], ss(K[i][0], K[i + 1][0], t)); return K[K.length - 1][1]; }

// =====================================================================================================  SPEED, DISTANCE
const SPEED = [[0, 42], [8, 50], [11, 50], [15, 50], [16.5, 45], [20, 44], [26, 47], [33, 51], [37, 52], [39.8, 52], [41.2, 46], [48, 47], [55, 50], [58.5, 50], [63, 50], [64.5, 44], [70, 46], [75, 52], [79, 54], [83.6, 54], [85.2, 44], [88, 38], [90, 36]];
const vAt = (t) => keyed(SPEED, t);
const SN = Math.ceil(91 * 240); const S_T = new Float64Array(SN + 1);
for (let i = 1; i <= SN; i++) S_T[i] = S_T[i - 1] + vAt((i - 0.5) * DT) * DT;
const sAt = (t) => { const x = clamp(t / DT, 0, SN - 1), i = Math.floor(x); return lerp(S_T[i], S_T[i + 1], x - i); };
const S_END = sAt(90);

// =====================================================================================================  ROUTE (smooth curvature bumps)
const CURVES = [[18, 23, 55], [26, 30.5, -45], [43, 48, 60], [49.5, 53, 30], [66, 71, -70], [72.5, 75, 30], [86, 90.5, 50]]; // [t0, t1, deg] + = right
const CV = CURVES.map(([a, b, d]) => [sAt(a), sAt(Math.min(b, 90)) + (b > 90 ? (b - 90) * 36 : 0), d * Math.PI / 180]);
const kappa = (s) => { let k = 0; for (const [a, b, A] of CV) if (s > a && s < b) { const L = b - a; k += A * Math.PI / (2 * L) * Math.sin(Math.PI * (s - a) / L); } return k; };
const P0 = -400, P1 = S_END + 900, PD = 0.5, PN = Math.ceil((P1 - P0) / PD) + 1;
const PX = new Float64Array(PN), PZ = new Float64Array(PN), PH = new Float64Array(PN);
{ let x = 0, z = 0, th = 0; const i0 = Math.round(-P0 / PD); PX[i0] = 0; PZ[i0] = 0; PH[i0] = 0;
  for (let i = i0 + 1; i < PN; i++) { const s = P0 + (i - 0.5) * PD; th += kappa(s) * PD; x += Math.cos(th) * PD; z += Math.sin(th) * PD; PX[i] = x; PZ[i] = z; PH[i] = th; }
  x = 0; z = 0; th = 0; for (let i = i0 - 1; i >= 0; i--) { x -= Math.cos(th) * PD; z -= Math.sin(th) * PD; PX[i] = x; PZ[i] = z; PH[i] = th; } }
function path(s) { const x = clamp((s - P0) / PD, 0, PN - 1.001), i = Math.floor(x), f = x - i; return { x: lerp(PX[i], PX[i + 1], f), z: lerp(PZ[i], PZ[i + 1], f), h: lerp(PH[i], PH[i + 1], f) }; }
function ptAt(s, l, y = 0) { const p = path(s); return new THREE.Vector3(p.x - Math.sin(p.h) * l, y, p.z + Math.cos(p.h) * l); } // l > 0 = right of travel

// =====================================================================================================  LATERAL LANE PLAN
const LANES = [-5.4, -1.8, 1.8, 5.4];
const LAT = [[0, 1.8], [1.8, 5.4], [3.4, 1.8], [5.0, -1.8], [6.4, 1.8], [8.0, 3.6], [15.8, 3.6], [17.2, 5.4], [19, 1.8], [21, -1.8], [22.5, 1.8], [24.5, 5.4], [26.5, 1.8], [28.5, -1.8], [30, 1.8], [32, 3.6], [39.6, 3.6], [41, 1.8], [43, 5.4], [45, 1.8], [46.5, -1.8], [48, 1.8], [50, 5.4], [52, 1.8], [54, 3.6], [63.8, 3.6], [65.2, 1.8], [67, -1.8], [68.5, 1.8], [70.5, 5.4], [72.5, 1.8], [74.5, 3.6], [84.8, 3.6], [86.2, 1.8], [90, 1.8]];
const latAt = (t) => keyed(LAT, t);

// =====================================================================================================  RAMPS + GROUND PROFILE (player line)
const JUMPS = [
  { id: 'A', tl: 11.0, kind: 'mega', H: 5.5, L: 34, HL: 6, LL: 40, roll: 2 * Math.PI, spin: 0, cam: 'side', camSide: -1 },
  { id: 'B', tl: 37.0, kind: 'bridge', H: 4.2, L: 20, roll: 0.22, spin: 0, cam: 'side', camSide: 1 },
  { id: 'C', tl: 58.5, kind: 'truck', H: 3.0, L: 12, roll: 0.35, spin: 2 * Math.PI, cam: 'front', camSide: 1 },
  { id: 'D', tl: 79.0, kind: 'mega', H: 6.5, L: 36, HL: 7, LL: 44, roll: 4 * Math.PI, spin: 0, cam: 'side', camSide: -1 },
];
for (const J of JUMPS) {
  J.lip = sAt(J.tl); J.v = vAt(J.tl);
  J.slope = J.kind === 'bridge' ? J.H / J.L : J.kind === 'truck' ? 1.5 * J.H / J.L : 2 * J.H / J.L;
  if (J.HL) { const a = G / (2 * J.v * J.v), yT = J.HL * (1 - 12 / J.LL) ** 2, x = (J.slope + Math.sqrt(J.slope ** 2 + 4 * a * (J.H - yT))) / (2 * a); J.sL0 = J.lip + x - 12; }
  if (J.kind === 'bridge') { J.c0 = J.lip - J.L - 0.5; J.c1 = J.lip + 12 + J.L + 0.5; } // canal walls
}
function ground(s) { // height of the driving surface under the player's line
  for (const J of JUMPS) {
    const x = s - (J.lip - J.L);
    if (x >= 0 && x < J.L) { const u = x / J.L; return J.kind === 'bridge' ? J.H * (u < 0.1 ? u * u / 0.2 : u - 0.05) / 0.95 : J.kind === 'truck' ? J.H * Math.pow(u, 1.5) : J.H * u * u; }
    if (J.HL) { const y = s - J.sL0; if (y >= 0 && y <= J.LL) return J.HL * (1 - y / J.LL) ** 2; }
    if (J.kind === 'bridge') { const y = s - (J.lip + 12); if (y >= 0 && y <= J.L) return J.H * (1 - y / J.L); if (s > J.lip && s < J.lip + 12) return -6; }
  }
  return 0;
}
const gp = (s) => (ground(s + 0.05) - ground(s - 0.05)) / 0.1;
const gpp = (s) => (ground(s + 0.4) - 2 * ground(s) + ground(s - 0.4)) / 0.16;

// =====================================================================================================  PLAYER SIM (vertical + springs), per frame
const SIM = []; const AIR = []; // AIR: {J, t0, t1, s0, s1, apex}
{ let y = 0, vy = 0, air = false, cur = null, b = 0, bv = 0, pp = 0, pv = 0, rr = 0, rv = 0, droop = 0, sPrev = sAt(0), lastLand = -9, impact = 0;
  const w1 = 2 * Math.PI * 1.7, c1 = 2 * 0.32 * w1, w2 = 2 * Math.PI * 1.4, c2 = 2 * 0.3 * w2, w3 = 2 * Math.PI * 1.2, c3 = 2 * 0.45 * w3;
  const steps = NF * 8;
  for (let i = 0; i <= steps; i++) {
    const t = i / (FPS * 8), s = sAt(t), v = vAt(t), dt = 1 / (FPS * 8);
    if (!air) { y = ground(s); vy = v * gp(s);
      for (const J of JUMPS) if (sPrev < J.lip && s >= J.lip) { air = true; vy = v * J.slope; y = J.H; cur = { J, t0: t, s0: J.lip, apex: J.H }; AIR.push(cur); } }
    else { vy -= G * dt; y += vy * dt; cur.apex = Math.max(cur.apex, y); const gr = ground(s);
      if (y <= gr && s > cur.s0 + 2) { air = false; impact = v * gp(s) - vy; cur.t1 = t; cur.s1 = s; cur.impact = impact; lastLand = t; y = gr; bv -= impact * 0.11; pv -= impact * 0.035; } }
    // springs: body heave (b), pitch (pp), roll (rr)
    const lat = (latAt(t + 0.02) - latAt(t - 0.02)) / 0.04, latA = (latAt(t + 0.05) - 2 * latAt(t) + latAt(t - 0.05)) / 0.0025;
    const ay = v * v * kappa(s) + latA, ax = (vAt(t + 0.05) - vAt(t - 0.05)) / 0.1;
    const Fb = air ? w1 * w1 * 0.05 : -v * v * gpp(s) * w1 * w1 * 0.006;
    bv += (-w1 * w1 * b - c1 * bv + Fb) * dt; b += bv * dt; if (b < -0.34) { b = -0.34; bv = Math.max(bv, 0); } if (b > 0.12) { b = 0.12; bv = Math.min(bv, 0); }
    pv += (-w2 * w2 * pp - c2 * pv + w2 * w2 * (air ? 0 : ax * 0.006)) * dt; pp += pv * dt; pp = clamp(pp, -0.16, 0.12);
    rv += (-w3 * w3 * rr - c3 * rv + w3 * w3 * (air ? 0 : -ay * 0.009)) * dt; rr += rv * dt;
    droop += ((air ? 0.17 : 0) - droop) * (1 - Math.exp(-dt * (air ? 9 : 30)));
    sPrev = s;
    if (i % 8 === 0) SIM.push({ t, s, v, y, air, b, pp, rr, droop, lat, l: latAt(t), sinceLand: t - lastLand, J: air ? cur : null });
  }
}
for (const A of AIR) { A.T = A.t1 - A.t0; A.tm = (A.t0 + A.t1) / 2; A.sm = sAt(A.tm); A.landSlope = gp(A.s1 + 0.5); }

// orientation per frame: yaw from path + lateral drift, pitch from ground / flight, roll from springs / stunt
const ROT = SIM.map((S, f) => {
  const p = path(S.s); let yaw = p.h + Math.atan2(S.lat, S.v), pitch, roll = S.rr, spin = 0;
  if (S.air) { const A = S.J, u = clamp((S.t - A.t0) / A.T, 0, 1), e = sm5(clamp((u - 0.1) / 0.78, 0, 1));
    pitch = lerp(Math.atan(A.J.slope), Math.atan(A.landSlope) - 0.06, ss(0, 1, u) * 0.85 + 0.15 * u * u) + 0.05 * Math.sin(u * Math.PI);
    roll += A.J.roll > 1 ? A.J.roll * e : A.J.roll * Math.sin(Math.PI * e); spin = A.J.spin * e + (A.J.id === 'B' ? 0.08 * Math.sin(u * Math.PI * 2) : 0); }
  else pitch = Math.atan(gp(S.s)) + S.pp;
  const drift = 0.42 * ss(86.0, 87.2, S.t) * (1 - 0.25 * ss(89, 90, S.t)) + 0.05 * Math.sin(S.t * 3.1) * ss(86.4, 87.4, S.t);
  return { yaw: yaw + spin + drift, pitch, roll, drift };
});

// =====================================================================================================  POLICE + TRAFFIC PLANS
const stopBefore = (J, d) => J.lip - J.L - d;
const softMin = (x, S, k = 7) => (S - x) / k > 40 ? x : S - k * Math.log1p(Math.exp((S - x) / k)); // ~x below S, eases to S
const POLICE = [ // o: offset keys relative to the player (m), side: preferred flank, stop: s where it brakes to a halt, on/off: time window
  { o: [[20.5, -140], [24.5, -26], [26.5, 2.5], [29, 4], [31, -1], [33.5, 3], [36, 1]], side: 1, J: JUMPS[1], dstop: 12, on: 20.5, off: 46 },
  { o: [[21.5, -160], [26.5, -22], [28.5, -2.5], [31, -3.5], [33, 0.5], [36, -2]], side: -1, J: JUMPS[1], dstop: 22, on: 21.5, off: 46 },
  { o: [[40, -200], [44, -30], [46, 3], [49, 1], [52, 4], [55, -1.5], [57.5, 2]], side: 1, J: JUMPS[2], dstop: 10, on: 40, off: 68 },
  { o: [[41, -220], [46.5, -18], [48.5, -2], [51, -3], [54, 1], [57.5, -2.5]], side: -1, J: JUMPS[2], dstop: 20, on: 41, off: 68 },
  { o: [[62.5, -200], [66.5, -24], [68.5, 3], [71, 0.5], [74, 3.5], [77, 1.5], [78.5, 2]], side: 1, J: JUMPS[3], dstop: 14, on: 62.5, off: 90.1 },
  { o: [[63.5, -230], [68.5, -16], [70.5, -2.5], [73, -3], [76, 0], [78.5, -2]], side: -1, J: JUMPS[3], dstop: 26, on: 63.5, off: 90.1 },
];
const PSTATE = POLICE.map((P) => { let lsm = null; const Sst = stopBefore(P.J, P.dstop);
  return SIM.map((S, f) => { const t = S.t; if (t < P.on || t > P.off) return null;
    const raw = S.s + keyed(P.o, t), s = softMin(raw, Sst, 8);
    const lp = latAt(t - 0.5); let l = lp + 3.6 * P.side; if (l > 5.4 || l < -5.4) l = lp - 3.6 * P.side;
    lsm = lsm == null ? l : lsm + (l - lsm) * (1 - Math.exp(-3 / FPS)); const stopped = ss(Sst - 30, Sst - 1, raw);
    return { s, l: lsm, skid: stopped * (P.side > 0 ? 0.55 : -0.6), stopped }; }); });
const ROADBLOCK = [-5.6, -1.9, 1.9, 5.6].map((l, i) => ({ s: JUMPS[3].lip + 74 + (i % 2) * 3, l, yaw: (i % 2 ? 0.5 : -0.5) + Math.PI / 2 }));
// traffic: one car per near-miss event; drop anything that would ever overlap the player, a police car or a stunt structure
const TRAFFIC = [], TREJ = {};
{ const R = rng(77), blocked = (t) => JUMPS.some((J) => { const A = AIR.find((a) => a.J === J); return t > J.tl - 4.2 && t < (A ? A.t1 : J.tl) + 1.6; });
  const zones = JUMPS.map((J) => J.kind === 'bridge' ? [J.c0 - 40, J.c1 + 10, -9, 9] : J.kind === 'truck' ? [J.lip - J.L - 30, J.lip + 15, 0, 9] : [J.lip - J.L - 30, J.sL0 + J.LL + 20, -9, 9]);
  zones.push([JUMPS[3].lip + 40, JUMPS[3].lip + 130, -9, 9]);
  const tryCar = (car) => { let ok = true, why = '';
    for (let f = 0; f < NF && ok; f += 2) { const S = SIM[f], sc = car.s0 + car.v * S.t;
      if (Math.abs(sc - S.s) < 5.4 && Math.abs(car.l - S.l) < 2.5 && !S.air) { ok = false; why = 'hero'; }
      if (Math.abs(sc - S.s) < 450) for (const z of zones) if (sc > z[0] && sc < z[1] && car.l > z[2] && car.l < z[3]) { ok = false; why = 'zone'; }
      if (Math.abs(sc - S.s) < 350) for (const PS of PSTATE) { const p = PS[f]; if (p && Math.abs(p.s - sc) < 6 && Math.abs(p.l - car.l) < 2.6) { ok = false; why = 'cop'; } }
      for (const o of TRAFFIC) if (o.l === car.l && Math.abs(o.s0 + o.v * S.t - sc) < 9) { ok = false; why = 'traffic'; } }
    if (!ok) TREJ[why] = (TREJ[why] || 0) + 1; return ok; };
  for (let tp = 1.2; tp < 88; tp += 0.35 + R() * 0.5) {
    if (blocked(tp)) continue;
    const lp = latAt(tp); const cand = LANES.filter((L) => Math.abs(L - lp) > 3.0).sort((a, b) => Math.abs(a - lp) - Math.abs(b - lp) + (R() - 0.5) * 2.5);
    for (const L of cand) { const v = L > 0 ? 20 + R() * 6 : -(19 + R() * 6), car = { s0: sAt(tp) - v * tp, v, l: L, type: Math.floor(R() * 4), col: Math.floor(R() * 8), tp };
      if (tryCar(car)) { TRAFFIC.push(car); break; } }
  }
}
// parked cars along the curbs (static), in the city zones
const ZONES = { beach: [P0, sAt(19)], down: [sAt(19), sAt(42)], harbor: [sAt(42), sAt(64)], neon: [sAt(64), P1] };
const zoneAt = (s) => s < ZONES.beach[1] ? 'beach' : s < ZONES.down[1] ? 'down' : s < ZONES.harbor[1] ? 'harbor' : 'neon';
const nearStructure = (s, pad = 30) => JUMPS.some((J) => s > J.lip - J.L - pad && s < (J.sL0 ? J.sL0 + J.LL : J.c1 || J.lip + 15) + pad) || (s > JUMPS[3].lip + 40 && s < JUMPS[3].lip + 140);

// =====================================================================================================  TIME OF DAY
const TOD = [ // t, sunElev(deg), sunAz(rad), sky top, horizon, sun col, sun I, hemi I, dusk(lit windows/neon)
  [0, 58, -0.5, '#2f7fdc', '#bfe2ff', '#fff2dc', 2.7, 1.05, 0], [40, 52, -0.2, '#3480da', '#c4e2fa', '#fff0d8', 2.6, 1.0, 0],
  [47, 30, 1.2, '#4a7fd0', '#ffd6a8', '#ffd8a0', 2.4, 0.85, 0.05], [60, 18, 1.4, '#4f6ec4', '#ffbe86', '#ffc890', 2.2, 0.75, 0.2],
  [66, 7, 1.25, '#33307a', '#ff8a5c', '#ff9a64', 1.5, 0.55, 0.75], [74, 3, 1.15, '#221e5c', '#f0646e', '#ff8a60', 1.1, 0.48, 1], [90, 1, 1.1, '#1b1650', '#c84c78', '#ff7a5a', 0.9, 0.44, 1]];
function todAt(t) { let i = 0; while (i < TOD.length - 2 && t > TOD[i + 1][0]) i++; const a = TOD[i], b = TOD[i + 1], u = ss(a[0], b[0], t);
  const c = (k) => new THREE.Color(a[k]).lerp(new THREE.Color(b[k]), u);
  return { elev: lerp(a[1], b[1], u), az: lerp(a[2], b[2], u), top: c(3), hor: c(4), sun: c(5), sunI: lerp(a[6], b[6], u), hemi: lerp(a[7], b[7], u), dusk: lerp(a[8], b[8], u) }; }

// =====================================================================================================  RENDERER / SCENE
const glc = document.createElement('canvas');
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.18;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
const out = document.getElementById('out'); out.width = W; out.height = H; out.style.width = (W / RS) + 'px'; const og = out.getContext('2d');
const scene = new THREE.Scene(); const ROOT = new THREE.Group(); ROOT.position.set(...ORIGIN); scene.add(ROOT);
const camera = new THREE.PerspectiveCamera(60, W / H, 0.3, 5000); scene.add(camera);
scene.fog = new THREE.Fog(0xbfe2ff, 260, 1900);
const hemi = new THREE.HemisphereLight(0xcfe6ff, 0x6a5a4a, 1.0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 2.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 1, far: 700 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04;
scene.add(sun); scene.add(sun.target);
const ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());

function canvasTex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } return t; }
function noise(g, w, h, n, a, seed, cols) { const R = rng(seed); for (let i = 0; i < n; i++) { g.fillStyle = cols ? cols[i % cols.length] : `rgba(255,255,255,${a * R()})`; if (!cols) { g.fillStyle = R() < 0.5 ? `rgba(255,255,255,${a * R()})` : `rgba(0,0,0,${a * R()})`; } const s = 1 + R() * 3; g.fillRect(R() * w, R() * h, s, s); } }
const lam = (o) => new THREE.MeshLambertMaterial(o);
const FONT = '"DejaVu Sans", "Liberation Sans", Arial, sans-serif';

// ---------------- sky dome
const skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color() }, dusk: { value: 0 } },
  vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.); gl_Position = vec4(p.xy, p.w * 0.99999, p.w); }',
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float dusk; varying vec3 vD;
    float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
    float fbm(vec2 p){ float a = 0.5, s = 0.; for (int i = 0; i < 5; i++){ s += a * vn(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
    void main(){ vec3 d = normalize(vD); float y = max(d.y, 0.0); vec3 c = mix(hor, top, pow(y, 0.55)); c = mix(c, hor * 0.92, smoothstep(0.0, -0.08, d.y));
      float sd = max(dot(d, normalize(sunDir)), 0.0); c += sunCol * (pow(sd, 900.0) * 6.0 + pow(sd, 24.0) * 0.35 + pow(sd, 4.0) * 0.12);
      vec2 cp = d.xz / (y + 0.12) * vec2(1.4, 3.2); float cl = smoothstep(0.52, 0.78, fbm(cp)) * smoothstep(0.02, 0.1, y) * (1.0 - smoothstep(0.35, 0.75, y));
      c = mix(c, mix(vec3(1.0), sunCol * 1.1 + vec3(0.25, 0.1, 0.2), dusk), cl * 0.55);
      float st = step(0.9975, h21(floor(d.xz / max(y, 0.05) * 60.0))) * smoothstep(0.15, 0.6, y) * smoothstep(0.6, 1.0, dusk); c += vec3(st * 0.8);
      gl_FragColor = vec4(c, 1.0); }` });
const sky = new THREE.Mesh(new THREE.SphereGeometry(4000, 32, 16), skyMat); sky.frustumCulled = false; sky.renderOrder = -10; scene.add(sky);

// ---------------- shared materials
const asphaltTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#3d3e44'; g.fillRect(0, 0, w, h); noise(g, w, h, 9000, 0.12, 3); g.fillStyle = 'rgba(20,20,24,0.25)'; for (let i = 0; i < 6; i++) g.fillRect(w * (0.27 + i * 0.09), 0, 16, h);
  const X = (l) => (l + 8) / 16 * w; g.fillStyle = '#f2c230'; g.fillRect(X(-0.18) - 3, 0, 5, h); g.fillRect(X(0.18) - 2, 0, 5, h);
  g.fillStyle = '#ecece4'; for (const l of [-3.6, 3.6]) for (let k = 0; k < 2; k++) g.fillRect(X(l) - 3, k * h / 2, 5, h * 0.17); for (const l of [-7.1, 7.1]) g.fillRect(X(l) - 3, 0, 5, h); }, true);
const roadMat = lam({ map: asphaltTex });
const walkTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#b9b2a6'; g.fillRect(0, 0, w, h); noise(g, w, h, 2500, 0.1, 5); g.strokeStyle = 'rgba(80,70,60,0.35)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); } }, true);
const walkMat = lam({ map: walkTex }); const curbMat = lam({ color: 0xd8d4cc });
const sandMat = lam({ map: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e8cf98'; g.fillRect(0, 0, w, h); noise(g, w, h, 4000, 0.12, 9); }, true) });
const groundMat = lam({ side: THREE.DoubleSide, map: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#8a8478'; g.fillRect(0, 0, w, h); noise(g, w, h, 4000, 0.12, 11); g.strokeStyle = 'rgba(60,55,50,0.3)'; g.lineWidth = 3; g.strokeRect(0, 0, w, h); }, true) });
const lawnMat = lam({ map: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#5f9a44'; g.fillRect(0, 0, w, h); noise(g, w, h, 5000, 0.14, 13); }, true) });
const waterMat = new THREE.MeshPhongMaterial({ color: 0x1f7fae, specular: 0xbfe8ff, shininess: 90, map: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#c8e8f0'; g.fillRect(0, 0, w, h); const R = rng(21); g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 2; for (let i = 0; i < 70; i++) { const x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 8, y - 3, x + 16 + R() * 10, y); g.stroke(); } }, true) });
waterMat.map.repeat.set(1, 1);
const stripeTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#f2c21a'; g.fillRect(0, 0, w, h); g.fillStyle = '#1c1c22'; for (let i = -4; i < 8; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64 + 32, 0); g.lineTo(i * 64 + 32 + h * 0.5, h); g.lineTo(i * 64 + h * 0.5, h); g.fill(); } noise(g, w, h, 1500, 0.1, 31); }, true);
const rampTopTex = canvasTex(256, 512, (g, w, h) => { g.fillStyle = '#c9cdd4'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(60,64,72,0.55)'; g.lineWidth = 3; for (let i = 0; i < 16; i++) { g.beginPath(); g.moveTo(0, i * h / 16); g.lineTo(w, i * h / 16); g.stroke(); } noise(g, w, h, 4000, 0.12, 41); g.fillStyle = '#ff5a1f'; g.fillRect(0, 0, 18, h); g.fillRect(w - 18, 0, 18, h); }, true);
const steelMat = lam({ color: 0x8c95a3 }); const darkMat = lam({ color: 0x24252c }); const redMat = lam({ color: 0xd8322a });

// ---------------- geometry helpers
function merge(parts) { // parts: [geometry, matrix?]; returns non-indexed merged geometry with position/normal/uv
  const P = [], N = [], U = [];
  for (const [g0, m] of parts) { const g = (g0.index ? g0.toNonIndexed() : g0.clone()); if (m) g.applyMatrix4(m); const p = g.attributes.position.array, n = g.attributes.normal.array, u = g.attributes.uv ? g.attributes.uv.array : new Float32Array(p.length / 3 * 2);
    P.push(...p); N.push(...n); U.push(...u); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); return g; }
const M4 = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
function ribbon(s0, s1, l0, l1, yf, mat, o = {}) { // strip along the route; yf(s, l) height; uv: u across (0..1) * o.ru, v = s / o.vl
  const ds = o.ds || 2, n = Math.max(2, Math.ceil((s1 - s0) / ds)), P = [], U = [], I = [];
  for (let i = 0; i <= n; i++) { const s = s0 + (s1 - s0) * i / n; for (const [k, l] of [[0, l0], [1, l1]]) { const p = ptAt(s, l, yf(s, l)); P.push(p.x, p.y, p.z); U.push(k * (o.ru || 1), s / (o.vl || 16)); } if (i < n) { const a = i * 2; if (l1 > l0) I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); else I.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.receiveShadow = o.recv !== false; m.castShadow = !!o.cast; ROOT.add(m); return m; }
const flat = (y) => () => y;

// ---------------- building material (procedural windows from instance-local position; lit windows at dusk)
const WINU = { dusk: { value: 0 }, skyT: { value: new THREE.Color() } };
function buildingMat(o) { const m = lam({ color: 0xffffff }); m.onBeforeCompile = (sh) => {
  Object.assign(sh.uniforms, WINU, { winA: { value: new THREE.Vector4(o.wx || 3.2, o.wy || 3.4, o.fill || 0.62, o.glass || 0) }, glassC: { value: new THREE.Color(o.glassC || '#5f86a8') }, LITP: { value: o.lit || 0.4 } });
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLP; varying vec3 vLN;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLP = (instanceMatrix * vec4(transformed, 1.0)).xyz; vLN = normalize(mat3(instanceMatrix) * objectNormal);');
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
    varying vec3 vLP; varying vec3 vLN; uniform float dusk; uniform vec3 skyT, glassC; uniform vec4 winA; uniform float LITP; float WIN = 0.0; float LIT = 0.0;
    float hh(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 15731.73); }`)
    .replace('#include <color_fragment>', `#include <color_fragment>
    { float wall = 1.0 - step(0.6, abs(vLN.y)); vec2 tg = normalize(vec2(-vLN.z, vLN.x) + 1e-5); float u = dot(vLP.xz, tg), v = vLP.y;
      vec2 cell = vec2(u / winA.x, v / winA.y); vec2 fc = fract(cell); float m = (1.0 - winA.z) * 0.5;
      float w = wall * step(m, fc.x) * step(fc.x, 1.0 - m) * step(0.2, fc.y) * step(fc.y, 0.86) * step(3.6, v);
      w = max(w, wall * winA.w * step(3.6, v) * step(0.04, fc.x) * step(0.1, fc.y));
      float band = wall * (1.0 - step(3.6, v)) * step(0.6, v) * step(0.1, fc.x) * step(fc.x, 0.9);
      vec3 gl = mix(glassC * 0.55, mix(glassC, skyT, 0.45) * 1.25, fc.y) * (0.85 + 0.3 * hh(floor(cell) + 3.1));
      LIT = (w * step(hh(floor(cell)), LITP) + band * 0.55) * dusk; diffuseColor.rgb *= 1.0 - 0.55 * dusk * WIN * (1.0 - step(hh(floor(cell)), LITP)); WIN = max(w, band);
      diffuseColor.rgb = mix(diffuseColor.rgb, gl, WIN); diffuseColor.rgb *= 1.0 - 0.18 * wall * step(0.94, fract(v / winA.y)); }`)
    .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += LIT * vec3(0.95, 0.58, 0.26) * 0.62 + WIN * (1.0 - LIT) * glassC * 0.12;'); };
  m.customProgramCacheKey = () => 'bld' + JSON.stringify(o); return m; }
function inst(geo, mat, list, o = {}) { // list: [{p:[x,y,z], r:yaw, s:[sx,sy,sz], c}]
  const im = new THREE.InstancedMesh(geo, mat, list.length), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  list.forEach((b, i) => { e.set(b.rx || 0, b.r || 0, b.rz || 0); q.setFromEuler(e); m.compose(new THREE.Vector3(...b.p), q, new THREE.Vector3(...(b.s || [1, 1, 1]))); im.setMatrixAt(i, m); if (b.c != null) im.setColorAt(i, new THREE.Color(b.c)); });
  im.castShadow = o.cast !== false; im.receiveShadow = o.recv !== false; im.frustumCulled = false; ROOT.add(im); return im; }
const BOX = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);

// =====================================================================================================  CITY
const R = rng(2026);
// road, sidewalks, curbs (skip the canal crossing, which has its own bridge)
const JB = JUMPS[1];
for (const [a, b] of [[P0, JB.c0], [JB.c1, P1]]) { ribbon(a, b, -8, 8, flat(0), roadMat, { vl: 24, ds: 3 }); for (const sg of [-1, 1]) { ribbon(a, b, sg * 8, sg * 13, flat(0.16), walkMat, { vl: 5, ru: 1 }); ribbon(a, b, sg * 8, sg * 8.001, (s, l) => l === sg * 8 ? 0 : 0.16, curbMat, { ds: 4 }); } }
// ground: lawn/plaza beyond the walks (both sides), city grid ground far
const GR = [[P0, JB.c0 - 1], [JB.c1 + 1, P1]]; for (const [a, b] of GR) ribbon(a, b, 7.9, 1500, flat(-0.03), groundMat, { ds: 4, vl: 8, ru: 186 });
for (const [a, b] of [[ZONES.beach[1] + 60, ZONES.harbor[0] + 280], [ZONES.harbor[1] - 40, P1]]) { const a2 = Math.max(a, 0), segs = [[a2, Math.min(b, JB.c0 - 1)], [Math.max(a2, JB.c1 + 1), b]]; for (const [x, y] of segs) if (y > x) ribbon(x, y, -1500, -7.9, flat(-0.03), groundMat, { ds: 4, vl: 8, ru: 186 }); }
for (const [a, b] of [[ZONES.down[0], JB.c0 - 10], [JB.c1 + 10, ZONES.down[1]], [ZONES.neon[0], P1]]) for (const sg of [-1, 1]) ribbon(a, b, sg * 12.8, sg * 16, flat(0.05), lawnMat, { vl: 8 });
// beach: sand + ocean on the left of the boulevard; harbor water on the left of the harbor road
ribbon(P0, ZONES.beach[1] + 60, -7.9, -95, flat(0.03), sandMat, { vl: 20, ru: 4 });
{ const p = path(0), L = 9000, ocean = new THREE.Mesh(new THREE.PlaneGeometry(L, 5000), waterMat); ocean.rotation.x = -Math.PI / 2; ocean.rotation.z = -p.h; const c = ptAt(ZONES.beach[1] - 600, -95 - 2500); ocean.position.set(c.x, -0.25, c.z); waterMat.map.repeat.set(300, 160); ocean.receiveShadow = true; ROOT.add(ocean);
  const foam = ribbon(P0, ZONES.beach[1] + 60, -93, -99, flat(-0.1), lam({ color: 0xf4fbff, transparent: true, opacity: 0.75 }), { recv: false }); }
ribbon(ZONES.harbor[0] + 280, ZONES.harbor[1] - 40, -60, -1500, flat(-0.6), waterMat, { vl: 30, ru: 40, ds: 4 });
ribbon(ZONES.harbor[0] + 280, ZONES.harbor[1] - 40, -7.9, -60, flat(0.04), groundMat, { vl: 8, ru: 6 });

// buildings, palms, lamps, props by zone along both sides
const B = { pastel: [], glass: [], tower: [], ware: [], shop: [], far: [] }, PALMS = [], LAMPS = [], CONT = [], NEON = [], AC = [], UMB = [], CROSS = [];
const PASTEL = ['#f6c7a8', '#f4e2b8', '#bfe0d8', '#f7b6b8', '#e8d4f0', '#fbe7a0', '#c8e4f4', '#f0f0ea'];
function blockSide(s0, s1, side, z) {
  let s = s0 + R() * 10;
  while (s < s1) {
    const zn = zoneAt(s); let w = 0;
    if ((nearStructure(s, 12) && zn !== 'down') || (s > JB.c0 - 10 && s < JB.c1 + 10)) { s += 10; continue; }
    if (zn === 'beach' && side < 0) { s += 20; continue; }
    if (zn === 'beach' && side > 0) { w = 22 + R() * 18; const h = 10 + R() * 22, d = 20 + R() * 10, off = 18 + d / 2 + R() * 4; const p = ptAt(s + w / 2, side * off); B.pastel.push({ p: [p.x, 0, p.z], r: -path(s + w / 2).h, s: [w, h, d], c: PASTEL[Math.floor(R() * 8)] }); if (R() < 0.5) AC.push({ p: [p.x + (R() - 0.5) * 6, h, p.z + (R() - 0.5) * 6], r: R() * 3, s: [2.4, 1.4, 2], c: '#c8ccd2' }); }
    else if (zn === 'down') { w = 24 + R() * 16; const tall = R() < 0.55, h = tall ? 60 + R() * 110 : 20 + R() * 30, d = 22 + R() * 14, off = 18 + d / 2 + R() * 3; const p = ptAt(s + w / 2, side * off);
      (tall ? B.tower : B.glass).push({ p: [p.x, 0, p.z], r: -path(s + w / 2).h, s: [w, h, d], c: tall ? ['#9fb3c4', '#c4ccd4', '#8aa0b8', '#d8d0c4'][Math.floor(R() * 4)] : ['#d8c8b0', '#c8b8a8', '#e0d8cc', '#b8c4cc'][Math.floor(R() * 4)] });
      if (R() < 0.6) AC.push({ p: [p.x, h, p.z], r: R() * 3, s: [4, 2.5, 4], c: '#9aa0a8' }); if (R() < 0.35 && !nearStructure(s, 0)) CROSS.push(s + w + 5); w += 10; }
    else if (zn === 'harbor') { if (side < 0 && s > ZONES.harbor[0] + 280) { // containers on the quay
        for (let k = 0; k < 3; k++) { const cs = s + k * 6.5; const p = ptAt(cs, side * (22 + R() * 25)); const stack = 1 + Math.floor(R() * 3); for (let j = 0; j < stack; j++) CONT.push({ p: [p.x, j * 2.6, p.z], r: -path(cs).h + (R() < 0.3 ? Math.PI / 2 : 0), s: [12, 2.6, 2.5], c: ['#c8402e', '#2e6ab8', '#e0a020', '#2e8a5a', '#8a3ab0', '#d86a2a'][Math.floor(R() * 6)] }); } w = 22; }
      else { w = 34 + R() * 26; const h = 9 + R() * 8, d = 30 + R() * 16, off = 18 + d / 2 + R() * 6; const p = ptAt(s + w / 2, side * off); B.ware.push({ p: [p.x, 0, p.z], r: -path(s + w / 2).h, s: [w, h, d], c: ['#b8b0a2', '#a8b4b8', '#c8a890', '#9aa8a0'][Math.floor(R() * 4)] }); } }
    else { w = 16 + R() * 14; const h = 7 + R() * 12, d = 16 + R() * 8, off = 17 + d / 2 + R() * 3; const p = ptAt(s + w / 2, side * off); B.shop.push({ p: [p.x, 0, p.z], r: -path(s + w / 2).h, s: [w, h, d], c: ['#8a5a9a', '#5a6a9a', '#9a5a6a', '#4a8a8a', '#7a5a8a', '#c88a6a'][Math.floor(R() * 6)] });
      if (R() < 0.75) NEON.push({ s: s + w / 2, side, off: off - d / 2 - 0.4, y: h * 0.62 + R() * 1.5, word: Math.floor(R() * 10), w: Math.min(w * 0.7, 9) }); }
    s += w + 2 + R() * 5;
  }
}
for (const side of [-1, 1]) blockSide(P0 + 50, P1 - 50, side);
// far skyline ring (downtown towers in the haze) + hills
for (let i = 0; i < 70; i++) { const s = ZONES.down[0] + R() * (ZONES.down[1] - ZONES.down[0]), side = R() < 0.5 ? -1 : 1, p = ptAt(s, side * (90 + R() * 260)); if (Math.abs(p.x) < 0) continue; const h = 50 + R() * 160, w = 24 + R() * 20; B.far.push({ p: [p.x, 0, p.z], r: R() * 3, s: [w, h, w], c: ['#9fb3c4', '#b8c0cc', '#8a9ab0'][i % 3] }); }
for (let i = 0; i < 40; i++) { const s = ZONES.harbor[0] + R() * (P1 - ZONES.harbor[0]), side = 1, p = ptAt(s, side * (70 + R() * 200)); const h = 25 + R() * 90, w = 20 + R() * 18; B.far.push({ p: [p.x, 0, p.z], r: R() * 3, s: [w, h, w], c: ['#6a6a8a', '#7a6a8a', '#5a6a8a'][i % 3] }); }
const BM = { pastel: buildingMat({ wx: 3.4, wy: 3.2, fill: 0.5, glassC: '#4f7fa0' }), glass: buildingMat({ wx: 3.0, wy: 3.6, fill: 0.7, glassC: '#557ea0' }), tower: buildingMat({ wx: 2.6, wy: 3.8, fill: 0.86, glass: 1, glassC: '#4a7aa8' }), ware: buildingMat({ wx: 7, wy: 4.5, fill: 0.3, glassC: '#6a7a88' }), shop: buildingMat({ wx: 3.6, wy: 3.4, fill: 0.55, glassC: '#4a4a7a', lit: 0.3 }), far: buildingMat({ wx: 3, wy: 3.6, fill: 0.7, glass: 1, glassC: '#6a8ab0', lit: 0.18 }) };
for (const k in B) if (B[k].length) inst(BOX, BM[k], B[k], { cast: k !== 'far' });
inst(BOX, lam({ color: 0xffffff }), AC); if (CONT.length) inst(BOX, lam({ color: 0xffffff }), CONT);
// hills on the horizon
const HILLM = new THREE.MeshBasicMaterial({ color: 0x8aa0b0, fog: false });
{ let cx = 0, cz = 0; for (let i = 0; i < PN; i += 50) { cx += PX[i]; cz += PZ[i]; } cx /= PN / 50; cz /= PN / 50; const list = [];
  for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2 + R() * 0.1, rr = 3300 + R() * 500; list.push({ p: [cx + Math.cos(a) * rr, -20, cz + Math.sin(a) * rr], r: R() * 3, s: [500 + R() * 500, 160 + R() * 280, 500 + R() * 400] }); }
  inst(new THREE.SphereGeometry(1, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), HILLM, list, { cast: false, recv: false }); }
// palms + lamps + umbrellas
for (let s = P0 + 40; s < P1 - 40; s += 15 + R() * 8) { const zn = zoneAt(s); if (nearStructure(s, 6)) continue;
  for (const side of [-1, 1]) { if (zn === 'harbor' || (zn === 'down' && R() < 0.7)) continue; if (zn === 'beach' && side > 0 && R() < 0.4) continue; const p = ptAt(s + (side > 0 ? 7 : 0), side * (zn === 'beach' && side < 0 ? 14.5 + R() * 2 : 11.2)); PALMS.push({ p: [p.x, 0.15, p.z], r: R() * 6, s: [1, 0.85 + R() * 0.5, 1] }); } }
for (let s = P0 + 20; s < P1; s += 34) { if (nearStructure(s, 4)) continue; for (const side of [-1, 1]) { const p = ptAt(s + (side > 0 ? 17 : 0), side * 9.2); LAMPS.push({ p: [p.x, 0.15, p.z], r: -path(s).h + (side > 0 ? Math.PI : 0) }); } }
for (let s = P0 + 30; s < ZONES.beach[1]; s += 9 + R() * 14) { const p = ptAt(s, -(30 + R() * 50)); UMB.push({ p: [p.x, 0, p.z], r: R() * 6, c: ['#e8423a', '#f2c21a', '#2a8ae0', '#f0f0f0', '#e85aa8'][Math.floor(R() * 5)] }); }
{ // palm geometry: bent trunk + 9 drooping fronds + coconuts
  const tr = new THREE.CylinderGeometry(0.17, 0.3, 9.5, 7, 8).translate(0, 4.75, 0); const tp = tr.attributes.position; for (let i = 0; i < tp.count; i++) { const y = tp.getY(i); tp.setX(i, tp.getX(i) + 0.012 * y * y); tp.setY(i, y + (Math.floor(y / 0.6) % 2) * 0.0); } tr.computeVertexNormals();
  const parts = []; for (let k = 0; k < 9; k++) { const f = new THREE.PlaneGeometry(4.6, 1.1, 6, 1).translate(2.3, 0, 0); const fp = f.attributes.position; for (let i = 0; i < fp.count; i++) { const x = fp.getX(i); fp.setZ(i, -0.06 * x * x - 0.2 * Math.abs(fp.getY(i))); } f.computeVertexNormals(); parts.push([f, M4(1.08, 9.35, 0, -Math.PI / 2 + 0.25, k * 2 * Math.PI / 9 + 0.2 * Math.sin(k * 3), 0.1)]); }
  const crown = merge(parts); const nut = new THREE.SphereGeometry(0.2, 6, 4); const nuts = merge([[nut, M4(1.0, 9.0, 0.2)], [nut, M4(0.9, 9.0, -0.25)], [nut, M4(1.25, 9.05, 0)]]);
  inst(tr, lam({ color: 0x8a6a4a }), PALMS); const fm = lam({ color: 0x3f8a3a, side: THREE.DoubleSide }); inst(crown, fm, PALMS); inst(nuts, lam({ color: 0x5a3a20 }), PALMS);
  const lampG = merge([[new THREE.CylinderGeometry(0.09, 0.13, 8, 6).translate(0, 4, 0)], [new THREE.BoxGeometry(2.6, 0.14, 0.14), M4(1.2, 7.9, 0)], [new THREE.BoxGeometry(0.8, 0.22, 0.45), M4(2.4, 7.8, 0)]]);
  inst(lampG, lam({ color: 0x4a4e58 }), LAMPS);
  window.__lampHead = inst(new THREE.BoxGeometry(0.7, 0.08, 0.38).translate(2.4, 7.66, 0), new THREE.MeshBasicMaterial({ color: 0xfff0c0 }), LAMPS, { cast: false, recv: false });
  const um = merge([[new THREE.ConeGeometry(1.6, 0.6, 8).translate(0, 2.4, 0)], [new THREE.CylinderGeometry(0.04, 0.04, 2.4, 4).translate(0, 1.2, 0)]]); inst(um, lam({ color: 0xffffff }), UMB);
  const towel = []; UMB.forEach((u, i) => { if (i % 2) towel.push({ p: [u.p[0] + 1.6, 0.05, u.p[2] + 0.4], r: u.r, s: [1.8, 0.02, 0.8], c: ['#f2c21a', '#2ab0c0', '#e8423a'][i % 3] }); }); inst(BOX, lam({ color: 0xffffff }), towel, { cast: false });
}
// lifeguard towers on the sand
for (const sx of [120, 520, 900]) { if (sx > ZONES.beach[1]) continue; const p = ptAt(sx, -58), h = -path(sx).h; const g = new THREE.Group(); g.position.set(p.x, 0, p.z); g.rotation.y = h + Math.PI / 2;
  for (const [x, z] of [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3, 0.18), lam({ color: 0xf2f2ee })); l.position.set(x, 1.5, z); g.add(l); }
  const hut = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 3.2), lam({ color: 0xe8423a })); hut.position.y = 4.1; g.add(hut); const rf = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.2, 4), lam({ color: 0xf2c21a })); rf.position.y = 5.8; rf.rotation.y = Math.PI / 4; g.add(rf); g.traverse((o) => { o.castShadow = true; }); ROOT.add(g); }
// cross streets: asphalt stubs + crosswalk stripes (downtown)
for (const s of CROSS) for (const side of [-1, 1]) { const p = ptAt(s, side * 40), q = ptAt(s, side * 8); const g = new THREE.Mesh(new THREE.PlaneGeometry(64, 14), roadMat); g.rotation.x = -Math.PI / 2; g.rotation.z = -path(s).h + Math.PI / 2; g.position.set((p.x + q.x) / 2 + (p.x - q.x) * 0.3, 0.02, (p.z + q.z) / 2 + (p.z - q.z) * 0.3); g.receiveShadow = true; ROOT.add(g); }
// neon signs (emissive canvas words + a soft glow card)
const NEON_WORDS = [['MOTEL', '#ff3ea5'], ['DINER', '#36e0ff'], ['ARCADE', '#b45cff'], ['TACOS', '#ffd23a'], ['OPEN 24H', '#5cff8a'], ['VIDEO', '#ff6a3a'], ['BURGERS', '#ff3a4a'], ['SURF', '#36e0ff'], ['PIZZA', '#ffd23a'], ['DANCE', '#ff3ea5']];
const glowTex = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); });
const NEONM = NEON_WORDS.map(([w, c]) => { const t = canvasTex(512, 128, (g, W2, H2) => { g.fillStyle = '#16121e'; g.fillRect(0, 0, W2, H2); g.font = `bold 84px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = c; g.shadowBlur = 26; g.fillStyle = c; g.fillText(w, W2 / 2, H2 / 2 + 4); g.shadowBlur = 0; g.fillStyle = '#ffffff'; g.globalAlpha = 0.75; g.fillText(w, W2 / 2, H2 / 2 + 4); g.globalAlpha = 1; g.strokeStyle = c; g.lineWidth = 6; g.strokeRect(8, 8, W2 - 16, H2 - 16); });
  return { m: new THREE.MeshBasicMaterial({ map: t }), c: new THREE.Color(c), g: new THREE.SpriteMaterial({ map: glowTex, color: new THREE.Color(c), transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false }) }; });
const NEON_GLOWS = [];
for (const n of NEON) { const N = NEONM[n.word], p = ptAt(n.s, n.side * n.off, n.y); const m = new THREE.Mesh(new THREE.PlaneGeometry(n.w, n.w / 4), N.m); m.position.copy(p); m.rotation.y = -path(n.s).h + (n.side > 0 ? 0 : Math.PI) + Math.PI; ROOT.add(m);
  const sp = new THREE.Sprite(N.g); sp.position.copy(ptAt(n.s, n.side * (n.off - 0.6), n.y)); sp.scale.set(n.w * 1.7, n.w * 0.9, 1); ROOT.add(sp); NEON_GLOWS.push(sp); }
// billboards downtown (generic)
const BILL = [['SUNSET BAY', 'COAST FM 98.1', '#ff7a3a', '#1a2a5a'], ['FIZZ', 'ICE COLD', '#2ad0ff', '#c02a5a'], ['DRIVE FAST?', 'DRIVE SAFE.', '#ffd23a', '#2a2a3a']];
for (let i = 0; i < 9; i++) { const s = ZONES.down[0] + 120 + i * ((ZONES.down[1] - ZONES.down[0] - 240) / 9), b = BILL[i % 3], side = i % 2 ? 1 : -1; if (nearStructure(s, 20)) continue; const t = canvasTex(512, 256, (g, w, h) => { g.fillStyle = b[3]; g.fillRect(0, 0, w, h); g.fillStyle = b[2]; g.font = `bold 92px ${FONT}`; g.textAlign = 'center'; g.fillText(b[0], w / 2, 120); g.fillStyle = '#ffffff'; g.font = `bold 44px ${FONT}`; g.fillText(b[1], w / 2, 200); g.strokeStyle = '#ffffff'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); });
  const p = ptAt(s, side * 16, 9); const m = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), lam({ map: t, emissive: 0x222222 })); m.position.copy(p); { const h = path(s).h; m.rotation.y = Math.atan2(-Math.cos(h), -Math.sin(h)) + (side > 0 ? 0.55 : -0.55); } ROOT.add(m);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 6, 6), steelMat); pole.position.set(p.x, 3, p.z); pole.castShadow = true; ROOT.add(pole); }

// =====================================================================================================  STUNT STRUCTURES
function rampMesh(sA, sB, l0, l1, hf, legs = true) { // surface + side skirts + scaffold legs, hf(s) height
  ribbon(sA, sB, l0, l1, (s) => hf(s), lam({ map: rampTopTex }), { ds: 1, vl: 12, cast: true });
  for (const l of [l0, l1]) { const n = Math.ceil((sB - sA)), P = [], I = []; for (let i = 0; i <= n; i++) { const s = sA + (sB - sA) * i / n, a = ptAt(s, l, hf(s) - 0.02), b = ptAt(s, l, Math.max(0, hf(s) - 0.7)); P.push(a.x, a.y, a.z, b.x, b.y, b.z); if (i < n) { const k = i * 2; I.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); const U = []; for (let i = 0; i <= n; i++) U.push(i / 3, 1, i / 3, 0); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); g.computeVertexNormals(); const m = new THREE.Mesh(g, lam({ map: stripeTex, side: THREE.DoubleSide })); m.castShadow = true; m.receiveShadow = true; ROOT.add(m); }
  if (legs) { const L = []; for (let s = sA + 2; s < sB; s += 3) for (const l of [l0 + 0.6, (l0 + l1) / 2, l1 - 0.6]) { const h = hf(s); if (h < 1) continue; const p = ptAt(s, l); L.push({ p: [p.x, 0, p.z], s: [0.22, h, 0.22] }); } if (L.length) inst(BOX, steelMat, L); }
  // lip edge
  const e1 = ptAt(sB, l0, hf(sB - 0.01)), e2 = ptAt(sB, l1, hf(sB - 0.01)); const lip = new THREE.Mesh(new THREE.BoxGeometry(l1 - l0, 0.18, 0.25), redMat); lip.position.set((e1.x + e2.x) / 2, e1.y - 0.05, (e1.z + e2.z) / 2); lip.rotation.y = -path(sB).h + Math.PI / 2; ROOT.add(lip); }
const BRIDGE = {};
for (const J of JUMPS) {
  const a = J.lip - J.L;
  if (J.kind === 'mega') { rampMesh(a - 0.01, J.lip, 0.0, 7.4, (s) => ground(s)); rampMesh(J.sL0, J.sL0 + J.LL, -0.2, 7.6, (s) => ground(s), true);
    // checker flags + tall pylons beside the kicker
    for (const l of [-1.2, 8.6]) { const p = ptAt(J.lip - 2, l); const py = new THREE.Mesh(new THREE.BoxGeometry(0.5, J.H + 4, 0.5), lam({ color: 0xf2f2ee })); py.position.set(p.x, (J.H + 4) / 2, p.z); py.castShadow = true; ROOT.add(py);
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.3), lam({ side: THREE.DoubleSide, map: canvasTex(64, 40, (g) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 5; j++) { g.fillStyle = (i + j) % 2 ? '#111' : '#fff'; g.fillRect(i * 8, j * 8, 8, 8); } }) })); fl.position.set(p.x, J.H + 3.3, p.z); fl.rotation.y = -path(J.lip).h; ROOT.add(fl); } }
  if (J.kind === 'truck') { rampMesh(a - 0.01, J.lip, 2.2, 5.0, (s) => ground(s), false);
    const g = new THREE.Group(), p = ptAt(J.lip, 3.6), h = -path(J.lip).h; g.position.set(p.x, 0, p.z); g.rotation.y = h; ROOT.add(g);
    const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
    const cabM = lam({ color: 0x2a6ad8 }); add(new THREE.BoxGeometry(5.0, 2.4, 2.6), cabM, 3.2, 1.9, 0); add(new THREE.BoxGeometry(2.4, 1.2, 2.5), lam({ color: 0x223040 }), 4.4, 2.6, 0); add(new THREE.BoxGeometry(0.4, 1.0, 2.7), lam({ color: 0xc8ccd4 }), 5.8, 1.1, 0);
    add(new THREE.BoxGeometry(J.L, 0.4, 2.7), darkMat, -J.L / 2, 1.1, 0); for (const x of [-J.L + 1.5, -J.L + 3, -2.5, 1.5, 4.5]) for (const z of [-1.2, 1.2]) { const w = add(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 12), darkMat, x, 0.55, z); w.rotation.x = Math.PI / 2; } }
  if (J.kind === 'bridge') { // canal + two raised bascule leaves + gatehouses + barrier arm
    const cw = lam({ color: 0x9a948a }); ribbon(J.c0, J.c1, -1500, 1500, flat(-5.5), waterMat, { ds: 4, ru: 200, vl: 12 });
    for (const s of [J.c0, J.c1]) { const p = ptAt(s, 0); const wall = new THREE.Mesh(new THREE.BoxGeometry(1.2, 6, 3000), cw); wall.position.set(p.x, -2.7, p.z); wall.rotation.y = -path(s).h; wall.receiveShadow = true; ROOT.add(wall); }
    const leaf = (s0, s1, up) => { ribbon(s0, s1, -8, 8, (s) => up ? J.H * (s - s0) / (s1 - s0) : J.H * (1 - (s - s0) / (s1 - s0)), roadMat, { ds: 1, vl: 24, cast: true }); for (const l of [-8.3, 8.3]) ribbon(s0, s1, l, l + (l > 0 ? 0.01 : -0.01), (s, ll) => (up ? J.H * (s - s0) / (s1 - s0) : J.H * (1 - (s - s0) / (s1 - s0))) + (Math.abs(ll) > 8.3 ? 1.1 : -0.8), steelMat, { ds: 1 }); };
    leaf(J.lip - J.L, J.lip, true); leaf(J.lip + 12, J.lip + 12 + J.L, false);
    for (const s of [J.lip - J.L - 4, J.lip + 12 + J.L + 4]) for (const l of [-11, 11]) { const p = ptAt(s, l); const t = new THREE.Mesh(new THREE.BoxGeometry(4, 9, 4), lam({ color: 0xb85a3a })); t.position.set(p.x, 4.5, p.z); t.rotation.y = -path(s).h; t.castShadow = true; ROOT.add(t); const r = new THREE.Mesh(new THREE.ConeGeometry(3.4, 3, 4), lam({ color: 0x3a4a6a })); r.position.set(p.x, 10.5, p.z); r.rotation.y = -path(s).h + Math.PI / 4; ROOT.add(r);
      const lt = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff3020, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); lt.position.set(p.x, 8.2, p.z); lt.scale.set(2.4, 2.4, 1); ROOT.add(lt); (BRIDGE.lights ||= []).push(lt); }
    const bp = ptAt(J.lip - J.L - 9, 7.6); const arm = new THREE.Group(); arm.position.set(bp.x, 1.1, bp.z); arm.rotation.y = -path(J.lip).h + Math.PI / 2; ROOT.add(arm);
    const am = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.25, 0.18).translate(-3.7, 0, 0), lam({ map: stripeTex })); am.castShadow = true; arm.add(am); const post = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.5), lam({ color: 0xe8e8e0 })); post.position.set(bp.x, 0.7, bp.z); ROOT.add(post);
    BRIDGE.arm = arm; BRIDGE.armS = J.lip - J.L - 9; }
}
// roadblock barriers under jump D
{ const J = JUMPS[3]; for (const l of [-6.8, -3.4, 0, 3.4, 6.8]) { const p = ptAt(J.lip + 84, l); const b = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, 3.0), lam({ map: stripeTex })); b.position.set(p.x, 0.5, p.z); b.rotation.y = -path(J.lip + 84).h; b.castShadow = true; ROOT.add(b); } }

// =====================================================================================================  CARS
const paint = (c, sh = 70) => new THREE.MeshPhongMaterial({ color: c, specular: 0x8a8a8a, shininess: sh });
const glassM = new THREE.MeshPhongMaterial({ color: 0x1a2230, specular: 0xbfd8ff, shininess: 120 });
const tireM = lam({ color: 0x1a1a1e });
const rimTex = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#1a1a1e'; g.fillRect(0, 0, w, h); const r = g.createRadialGradient(64, 64, 8, 64, 64, 50); r.addColorStop(0, '#e8ecf2'); r.addColorStop(0.55, '#9aa2b0'); r.addColorStop(0.85, '#c8ccd4'); r.addColorStop(1, '#3a3a40'); g.fillStyle = r; g.beginPath(); g.arc(64, 64, 50, 0, 7); g.fill(); g.fillStyle = 'rgba(40,40,48,0.35)'; g.beginPath(); g.arc(64, 64, 12, 0, 7); g.fill(); });
const rimM = lam({ map: rimTex });
const shadowTex = canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.save(); g.scale(1, 0.5); const r = g.createRadialGradient(64, 64, 10, 64, 64, 62); r.addColorStop(0, '#fff'); r.addColorStop(0.6, '#bbb'); r.addColorStop(1, '#000'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); g.restore(); });
const SHG = new THREE.PlaneGeometry(5.4, 2.6);
function shapeGeo(pts, depth, bevel = 0.06) { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) s.lineTo(p[0], p[1]); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 4 }); g.translate(0, 0, -depth / 2); g.computeVertexNormals(); return g; }
const SPORT_LO = [[-2.2, 0.3], [2.15, 0.3], [2.28, 0.42], [2.22, 0.62], [1.1, 0.8], [-1.55, 0.88], [-2.2, 0.86], [-2.26, 0.55]];
const SPORT_CAB = [[0.95, 0.78], [0.1, 1.16], [-0.95, 1.18], [-1.62, 0.86]];
const SEDAN_LO = [[-2.2, 0.32], [2.15, 0.32], [2.25, 0.5], [2.2, 0.78], [1.2, 0.86], [-1.9, 0.9], [-2.24, 0.82]];
const SEDAN_CAB = [[1.15, 0.84], [0.45, 1.42], [-1.2, 1.44], [-1.75, 0.88]];
function wheel(g, x, z, r = 0.36, w = 0.3) { const wg = new THREE.Group(); wg.position.set(0, r, 0); const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 16), tireM); t.rotation.x = Math.PI / 2; wg.add(t);
  const rim = new THREE.Mesh(new THREE.CircleGeometry(r * 0.78, 16), rimM); rim.position.z = Math.sign(z) * (w / 2 + 0.005); rim.rotation.y = z > 0 ? 0 : Math.PI; wg.add(rim); const sp = new THREE.Group(); sp.position.set(x, 0, z); sp.add(wg); g.add(sp); return { wg, sp, t }; }
function lightsBox(g, x, y, z, w, h, d, col) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color: col })); m.position.set(x, y, z); g.add(m); return m; }
function makeCar(kind, col) { // forward +x, up +y, right +z
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const sport = kind === 'sport' || kind === 'police';
  const lo = new THREE.Mesh(shapeGeo(sport ? SPORT_LO : SEDAN_LO, kind === 'van' ? 1.8 : 1.78), paint(col, sport ? 90 : 40)); body.add(lo);
  const cab = kind === 'van' ? new THREE.Mesh(shapeGeo([[1.3, 0.86], [0.9, 1.9], [-2.2, 1.95], [-2.22, 0.88]], 1.7), glassM) : new THREE.Mesh(shapeGeo(sport ? SPORT_CAB : SEDAN_CAB, 1.46, 0.05), glassM); body.add(cab);
  if (kind === 'van') { const side = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.0, 1.78), paint(col, 30)); side.position.set(-0.85, 1.4, 0); body.add(side); }
  const roofY = sport ? 1.2 : 1.46; if (kind !== 'van') { const roof = new THREE.Mesh(new THREE.BoxGeometry(sport ? 1.0 : 1.5, 0.05, 1.42), paint(kind === 'police' ? 0xf4f4f0 : col)); roof.position.set(sport ? -0.42 : -0.38, roofY + 0.02, 0); body.add(roof); }
  if (kind === 'police') { const door = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.42, 1.98), paint(0xf4f4f0)); door.position.set(-0.2, 0.62, 0); body.add(door);
    const bar = new THREE.Group(); bar.position.set(-0.45, roofY + 0.12, 0); body.add(bar); const r1 = lightsBox(bar, 0, 0, -0.35, 0.3, 0.16, 0.62, 0xff2020), b1 = lightsBox(bar, 0, 0, 0.35, 0.3, 0.16, 0.62, 0x2050ff);
    const gr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff2020, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })), gb = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x3060ff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    gr.position.set(-0.45, roofY + 0.2, -0.4); gb.position.set(-0.45, roofY + 0.2, 0.4); gr.scale.set(3.2, 3.2, 1); gb.scale.set(3.2, 3.2, 1); body.add(gr); body.add(gb); root.userData.pl = { r1, b1, gr, gb }; }
  if (kind === 'sport') { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 1.8), paint(0x1a1a20)); sp.position.set(-2.0, 1.08, 0); body.add(sp); for (const z of [-0.6, 0.6]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.06), paint(0x1a1a20)); st.position.set(-2.0, 0.96, z); body.add(st); }
    const str = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.02, 0.34), paint(0x16161c)); str.position.set(0.0, 0.93, 0); str.rotation.z = -0.06; body.add(str); }
  for (const z of [-0.62, 0.62]) { lightsBox(body, 2.22, 0.6, z, 0.08, 0.12, 0.42, 0xfff6e0); lightsBox(body, -2.25, 0.66, z, 0.06, 0.12, 0.46, 0xff2a2a); }
  const tail = []; for (const z of [-0.62, 0.62]) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff2a2a, blending: THREE.AdditiveBlending, transparent: true, opacity: 0, depthWrite: false })); s.position.set(-2.4, 0.66, z); s.scale.set(1.3, 0.9, 1); body.add(s); tail.push(s); }
  const W = []; for (const [x, z] of [[1.42, -0.86], [1.42, 0.86], [-1.38, -0.86], [-1.38, 0.86]]) W.push(wheel(root, x, z, sport ? 0.36 : 0.34)); W.forEach((w, i) => { w.front = i < 2; });
  // contact shadow card under the car (keeps it grounded even where the sun shadow is soft)
  const sh = new THREE.Mesh(SHG, new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: shadowTex, transparent: true, opacity: 0.45, depthWrite: false })); sh.renderOrder = 1;
  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); sh.castShadow = false; sh.receiveShadow = false;
  ROOT.add(root); return { root, body, W, tail, sh, kind };
}
const shadowCard = (car) => { ROOT.add(car.sh); return car.sh; };
const HERO = makeCar('sport', 0xff5a14); shadowCard(HERO);
const COPS = POLICE.map(() => { const c = makeCar('police', 0x15161c); shadowCard(c); return c; });
const BLOCK = ROADBLOCK.map(() => { const c = makeCar('police', 0x15161c); shadowCard(c); return c; });
const TCOL = [0xd8d8d4, 0x2a3a5a, 0x8a1a1a, 0x3a3a3e, 0xf2c21a, 0x6a8aa8, 0x2a5a3a, 0xe8e4dc];
const TCARS = TRAFFIC.map((T) => { const kind = ['sedan', 'sedan', 'van', 'sedan'][T.type], col = T.type === 3 ? 0xf2c21a : TCOL[T.col]; const c = makeCar(kind, col); shadowCard(c); return c; });

const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);
function placeCar(c, s, l, y, yaw, pitch, roll, opt = {}) { const p = ptAt(s, l, y); c.root.position.copy(p);
  _q.setFromAxisAngle(Y, -yaw); _q2.setFromAxisAngle(Z, pitch); _q.multiply(_q2); _q2.setFromAxisAngle(X, roll); _q.multiply(_q2); c.root.quaternion.copy(_q);
  c.body.position.y = opt.b || 0; const dist = opt.dist || 0, steer = opt.steer || 0, droop = opt.droop || 0;
  for (const w of c.W) { w.wg.rotation.z = -dist / 0.36; w.sp.position.y = -droop; w.sp.rotation.y = w.front ? -steer : 0; }
  const gy = ground(s) * (opt.onRamp ? 1 : 0); const hgt = y - gy; c.sh.position.set(p.x, gy + 0.04, p.z); c.sh.rotation.set(-Math.PI / 2, 0, -yaw, 'YXZ'); c.sh.rotation.set(0, 0, 0); c.sh.quaternion.setFromAxisAngle(Y, -yaw); c.sh.rotateX(-Math.PI / 2); c.sh.material.opacity = 0.5 * clamp(1 - hgt / 12, 0, 1); c.sh.scale.setScalar(1 + hgt * 0.06);
  c.root.visible = true; c.sh.visible = true; }

// =====================================================================================================  PARTICLES (landing dust + sparks, drift smoke, bridge-arm splinters)
const PN_MAX = 700; const pg = new THREE.BufferGeometry(); const pPos = new Float32Array(PN_MAX * 3), pCol = new Float32Array(PN_MAX * 4), pSz = new Float32Array(PN_MAX);
pg.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pg.setAttribute('color', new THREE.BufferAttribute(pCol, 4)); pg.setAttribute('size', new THREE.BufferAttribute(pSz, 1));
const pMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { scale: { value: H * 0.9 }, tex: { value: glowTex } },
  vertexShader: 'attribute float size; attribute vec4 color; varying vec4 vC; uniform float scale; void main(){ vC = color; vec4 mv = modelViewMatrix * vec4(position,1.); gl_PointSize = size * scale / max(-mv.z, 0.5); gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'varying vec4 vC; uniform sampler2D tex; void main(){ float a = texture2D(tex, gl_PointCoord).a; gl_FragColor = vec4(vC.rgb, vC.a * a); }' });
const points = new THREE.Points(pg, pMat); points.frustumCulled = false; ROOT.add(points);
function particles(t) { let n = 0; const push = (p, c, a, size) => { if (n >= PN_MAX) return; pPos.set([p.x, p.y, p.z], n * 3); pCol.set([c.r, c.g, c.b, a], n * 4); pSz[n] = size; n++; };
  const dustC = new THREE.Color(0xd8c8b0), sparkC = new THREE.Color(0xffc060), smokeC = new THREE.Color(0xe8e8ec);
  for (const A of AIR) { const age = t - A.t1; if (age < 0 || age > 1.6) continue; const Rr = rng(A.J.id.charCodeAt(0) * 31), s1 = A.s1, l = latAt(A.t1), y0 = ground(s1);
    for (let i = 0; i < 80; i++) { const spark = i < 34, ang = Rr() * Math.PI * 2, sp = (spark ? 9 : 5) * (0.4 + Rr()), up = (spark ? 5 : 1.6) * Rr(), lag = Rr() * 0.12; const a2 = age - lag; if (a2 < 0) continue;
      const life = spark ? 0.55 : 1.5; if (a2 > life) continue; const fwd = (spark ? 0.6 : 0.22) * vAt(A.t1) * (1 - Math.exp(-a2 * 3)) / 3;
      const s = s1 - 1.5 + fwd + Math.cos(ang) * sp * a2 * 0.4, ll = l + Math.sign(Math.sin(ang)) * 1.1 + Math.sin(ang) * sp * a2 * 0.8, y = y0 + 0.2 + up * a2 - (spark ? 6 : 0.6) * a2 * a2;
      push(ptAt(s, ll, Math.max(y0 + 0.05, y)), spark ? sparkC : dustC, (1 - a2 / life) * (spark ? 1 : 0.3), spark ? 0.18 : 0.7 + a2 * 2.2); } }
  if (t > 85.9) { for (let i = 0; i < 260; i++) { const te = 85.9 + i / 60; if (te > t) break; const age = t - te; if (age > 2.4) continue; const f = Math.round(te * FPS), S = SIM[Math.min(f, NF)], rot = ROT[Math.min(f, NF)];
      for (const side of [-0.85, 0.85]) { const Rr = rng(i * 7 + (side > 0 ? 3 : 0)); const c = Math.cos(rot.yaw - path(S.s).h), sN = Math.sin(rot.yaw - path(S.s).h); const ls = S.l + side * c - (-1.4) * sN; const ss2 = S.s - 1.4 * c - side * sN;
        push(ptAt(ss2 + (Rr() - 0.5) * age * 2 + age * 3, ls + (Rr() - 0.5) * age * 3 + age * 1.5, 0.3 + age * 1.1 + Rr() * 0.3), smokeC, 0.26 * Math.min(1, (2.4 - age) / 1.2) * Math.min(1, age * 6 + 0.2), 0.8 + age * 2.6); } } }
  if (BRIDGE.arm) { const tb = SIM.findIndex((S) => S.s > BRIDGE.armS) / FPS, age = t - tb; if (age > 0 && age < 1.2) { const Rr = rng(99); for (let i = 0; i < 26; i++) { const sp = 6 + Rr() * 10, a = Rr() * 6.28; push(ptAt(BRIDGE.armS + sp * age, 7.6 - 3 * Rr() + Math.sin(a) * age * 3, 1.1 + 4 * Rr() * age - 4.9 * age * age), new THREE.Color(Rr() < 0.5 ? 0xf2c21a : 0x222222), 1 - age / 1.2, 0.35); } } }
  for (let i = n; i < PN_MAX; i++) pSz[i] = 0;
  pg.attributes.position.needsUpdate = true; pg.attributes.color.needsUpdate = true; pg.attributes.size.needsUpdate = true; pg.setDrawRange(0, Math.max(1, n)); }

// =====================================================================================================  CAMERA (precomputed chase follow + stunt cams)
const CAM = [];
{ const fwdOf = (f) => { const S = SIM[f], a = path(S.s).h + Math.atan2(S.lat, S.v) + ROT[f].drift * 0.3; return new THREE.Vector3(Math.cos(a), 0, Math.sin(a)); };
  let cp = null, cl = null;
  for (let f = 0; f <= NF; f++) { const S = SIM[f], fw = fwdOf(f), car = ptAt(S.s, S.l, S.y + S.b);
    const D = car.clone().addScaledVector(fw, -8.0).add(new THREE.Vector3(0, 2.75, 0)), L = car.clone().addScaledVector(fw, 6.5).add(new THREE.Vector3(0, 0.9, 0));
    if (!cp) { cp = D.clone(); cl = L.clone(); }
    const kxz = 1 - Math.exp(-7.5 / FPS), ky = 1 - Math.exp(-(S.air ? 2.2 : 6) / FPS), kl = 1 - Math.exp(-11 / FPS);
    cp.x += (D.x - cp.x) * kxz; cp.z += (D.z - cp.z) * kxz; cp.y += (D.y - cp.y) * ky; cl.lerp(L, kl);
    // keep the camera above whatever is under it (ramps) and out of the canal
    let gy = 0; { let best = 1e9, sb = S.s; for (let ds = -14; ds <= 2; ds += 0.5) { const q = ptAt(S.s + ds, S.l); const d = (q.x - cp.x) ** 2 + (q.z - cp.z) ** 2; if (d < best) { best = d; sb = S.s + ds; } } gy = Math.max(0, ground(sb)); }
    cp.y = Math.max(cp.y, gy + 1.4);
    CAM.push({ p: cp.clone(), l: cl.clone(), fov: 58 + 9 * clamp((S.v - 40) / 14, 0, 1), roll: -clamp(S.v * S.v * kappa(S.s) * 0.0045, -0.06, 0.06) }); } }
const STUNT = AIR.map((A) => { const J = A.J; return { t0: A.t0 - (J.cam === 'front' ? 0.45 : 0.3), t1: A.t1 - 0.22, A }; });
function stuntCam(sc, t) { const A = sc.A, J = A.J, u = clamp((t - sc.t0) / (sc.t1 - sc.t0), 0, 1);
  const f = clamp(Math.round(t * FPS), 0, NF), S = SIM[f], car = ptAt(S.s, S.l, S.y + S.b + 0.7);
  if (J.id === 'B') return { p: ptAt(J.lip + 40 + 14 * u, 3.6 + 24 * J.camSide, 8 + 2 * u), l: car, fov: 52 - 6 * u }; // far bank, looking back across the canal gap
  // tracking stunt cam: rides alongside (A, D) or just ahead (C) of the car, a little slower so the car pulls through frame
  const k = J.id === 'C' ? 0.86 : 0.82, ahead = J.id === 'C' ? 4 : -9, side = J.id === 'D' ? 28 : J.id === 'C' ? 22 : 21;
  const cs = J.lip + (S.s - J.lip) * k + ahead, hy = 1.6 + S.y * (J.id === 'C' ? 0.8 : J.id === 'D' ? 0.3 : 0.55);
  return { p: ptAt(cs, 3.6 + J.camSide * side, hy), l: J.id === 'D' ? car.clone().add(new THREE.Vector3(0, -3, 0)) : car, fov: (J.id === 'D' ? 54 : 50) - 4 * u }; }
const shakeN = (t, k) => Math.sin(t * 13.1 + k) * 0.5 + Math.sin(t * 29.7 + k * 2.3) * 0.3 + Math.sin(t * 51.3 + k * 4.1) * 0.2;
function cameraAt(f) { const t = f / FPS, S = SIM[f]; let c = CAM[f], p = c.p.clone(), l = c.l.clone(), fov = c.fov, roll = c.roll, stunt = null;
  for (const sc of STUNT) if (t >= sc.t0 && t < sc.t1) stunt = sc;
  let amp = 0.012 + 0.03 * clamp((S.v - 38) / 16, 0, 1);
  for (const A of AIR) { const age = t - A.t1; if (age >= 0 && age < 1.0) amp += Math.min(0.38, 0.05 * A.impact) * Math.exp(-age * 5.5); }
  if (stunt) { const s2 = stuntCam(stunt, t); p = s2.p; l = s2.l; fov = s2.fov; roll = 0; amp *= 0.5; }
  p.x += shakeN(t, 1) * amp; p.y += shakeN(t, 2) * amp * 0.8; l.x += shakeN(t, 3) * amp * 0.6; l.y += shakeN(t, 4) * amp * 0.6;
  camera.position.copy(p).add(ROOT.position); camera.up.set(Math.sin(roll), Math.cos(roll), 0); camera.lookAt(l.clone().add(ROOT.position)); camera.fov = fov; camera.updateProjectionMatrix(); return { stunt: !!stunt }; }

// =====================================================================================================  HUD
const WANTED = [[0, 0], [21, 1], [30, 2], [44, 3], [66, 4], [77.5, 5]];
const starsAt = (t) => { let n = 0, t0 = -9; for (const [a, k] of WANTED) if (t >= a) { n = k; t0 = a; } return { n, since: t - t0 }; };
const MAP = []; for (let s = P0; s <= P1; s += 6) { const p = path(s); MAP.push([p.x, p.z]); }
const MAPX = []; for (const s of CROSS) { const a = ptAt(s, -160), b = ptAt(s, 160); MAPX.push([[a.x, a.z], [b.x, b.z]]); }
for (let s = ZONES.down[0]; s < ZONES.neon[1]; s += 140) { if (zoneAt(s) === 'harbor') continue; const a = ptAt(s, -220), b = ptAt(s, 220); MAPX.push([[a.x, a.z], [b.x, b.z]]); }
function star(g, x, y, r, fill) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.lineWidth = r * 0.28; g.strokeStyle = 'rgba(10,10,16,0.9)'; g.stroke(); g.fillStyle = fill; g.fill(); }
function drawHUD(g, f, isStunt) { const t = f / FPS, S = SIM[f]; g.save(); g.scale(RS, RS);
  // vignette + speed streaks
  const vg = g.createRadialGradient(540, 480, 300, 540, 480, 760); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.38)'); g.fillStyle = vg; g.fillRect(0, 0, 1080, 960);
  const sp = clamp((S.v - 44) / 10, 0, 1) * (isStunt ? 0.4 : 1); if (sp > 0.02) { const Rr = rng(f * 13 + 7); g.strokeStyle = `rgba(255,255,255,${0.16 * sp})`; g.lineCap = 'round'; for (let i = 0; i < 26; i++) { const a = Rr() * Math.PI * 2, r0 = 330 + Rr() * 140, len = 60 + Rr() * 140 * sp; g.lineWidth = 1.5 + Rr() * 2.5; g.beginPath(); g.moveTo(540 + Math.cos(a) * r0, 470 + Math.sin(a) * r0 * 0.9); g.lineTo(540 + Math.cos(a) * (r0 + len), 470 + Math.sin(a) * (r0 + len) * 0.9); g.stroke(); } }
  if (Q.get('nohud')) { g.restore(); return; }
  // minimap (heading-up), bottom-left
  const mx = 128, my = 600, mr = 96, sc = 0.55, /* left column, clear of the Shorts UI (bottom title band, right button rail) */ p = ptAt(S.s, S.l), hd = ROT[f].yaw - ROT[f].drift;
  g.save(); g.beginPath(); g.arc(mx, my, mr, 0, Math.PI * 2); g.closePath(); g.fillStyle = 'rgba(40,46,40,0.82)'; g.fill(); g.clip();
  g.translate(mx, my); g.rotate(-Math.PI / 2 - hd); g.scale(sc, sc); g.translate(-p.x, -p.z);
  if (S.s < ZONES.beach[1] + 400) { const o0 = ptAt(-400, -95), o1 = ptAt(ZONES.beach[1] + 600, -95), o2 = ptAt(ZONES.beach[1] + 600, -2000), o3 = ptAt(-400, -2000); g.fillStyle = 'rgba(70,140,200,0.95)'; g.beginPath(); g.moveTo(o0.x, o0.z); g.lineTo(o1.x, o1.z); g.lineTo(o2.x, o2.z); g.lineTo(o3.x, o3.z); g.fill(); }
  if (Math.abs(S.s - JB.lip) < 500) { g.strokeStyle = 'rgba(70,140,200,0.95)'; g.lineWidth = 50; const a = ptAt(JB.lip + 6, -300), b = ptAt(JB.lip + 6, 300); g.beginPath(); g.moveTo(a.x, a.z); g.lineTo(b.x, b.z); g.stroke(); }
  g.strokeStyle = 'rgba(150,150,140,0.9)'; g.lineWidth = 9; for (const [a, b] of MAPX) { g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  g.strokeStyle = 'rgba(235,235,225,0.95)'; g.lineWidth = 15; g.lineJoin = 'round'; g.beginPath(); MAP.forEach(([x, z], i) => (i ? g.lineTo(x, z) : g.moveTo(x, z))); g.stroke();
  // destination marker (next jump)
  const nextJ = JUMPS.find((J) => J.lip > S.s - 5); if (nextJ) { const q = ptAt(nextJ.lip, 3.6); g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(q.x, q.z, 16, 0, 7); g.fill(); g.strokeStyle = '#1a1a1a'; g.lineWidth = 4; g.stroke(); }
  const blink = Math.floor(f / 4) % 2; PSTATE.forEach((PS) => { const c = PS[f]; if (!c) return; const q = ptAt(c.s, c.l); g.fillStyle = blink ? '#ff3030' : '#3a6aff'; g.beginPath(); g.arc(q.x, q.z, 13, 0, 7); g.fill(); });
  if (t > 66) ROADBLOCK.forEach((rb, i) => { const q = ptAt(rb.s, rb.l); g.fillStyle = (blink + i) % 2 ? '#ff3030' : '#3a6aff'; g.beginPath(); g.arc(q.x, q.z, 12, 0, 7); g.fill(); });
  g.restore();
  g.lineWidth = 6; g.strokeStyle = 'rgba(15,15,20,0.9)'; g.beginPath(); g.arc(mx, my, mr, 0, Math.PI * 2); g.stroke(); g.lineWidth = 2.5; g.strokeStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.arc(mx, my, mr - 4, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#ffffff'; g.strokeStyle = '#111'; g.lineWidth = 3; g.beginPath(); g.moveTo(mx, my - 15); g.lineTo(mx + 11, my + 11); g.lineTo(mx, my + 5); g.lineTo(mx - 11, my + 11); g.closePath(); g.fill(); g.stroke();
  // speedometer (right of the minimap)
  const kmh = S.v * 3.6 + (S.air ? 0 : 0.6 * Math.sin(t * 9)), cx = 128, cy = 372, r = 80, a0 = Math.PI * 0.8, a1 = Math.PI * 2.2, frac = clamp(kmh / 280, 0, 1);
  g.lineCap = 'butt'; g.lineWidth = 16; g.strokeStyle = 'rgba(15,15,22,0.72)'; g.beginPath(); g.arc(cx, cy, r, a0, a1); g.stroke();
  const gr2 = g.createLinearGradient(cx - r, 0, cx + r, 0); gr2.addColorStop(0, '#3ad0ff'); gr2.addColorStop(0.6, '#ffd23a'); gr2.addColorStop(1, '#ff3a3a'); g.strokeStyle = gr2; g.lineWidth = 11; g.beginPath(); g.arc(cx, cy, r, a0, a0 + (a1 - a0) * frac); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 3; for (let i = 0; i <= 14; i++) { const a = a0 + (a1 - a0) * i / 14, r1 = r - 14, r2 = r - (i % 2 ? 20 : 26); g.beginPath(); g.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); g.stroke(); }
  g.textAlign = 'center'; g.font = `italic bold 50px ${FONT}`; g.lineWidth = 7; g.strokeStyle = 'rgba(10,10,16,0.85)'; g.strokeText(String(Math.round(kmh)), cx, cy + 18); g.fillStyle = '#ffffff'; g.fillText(String(Math.round(kmh)), cx, cy + 18);
  g.font = `bold 18px ${FONT}`; g.strokeText('KM/H', cx, cy + 44); g.fillStyle = '#ffd23a'; g.fillText('KM/H', cx, cy + 44);
  // wanted stars, top-right
  const W2 = starsAt(t); for (let i = 0; i < 5; i++) { const on = i < W2.n, fresh = i === W2.n - 1 && W2.since < 1.6; const vis = !fresh || Math.floor(W2.since * 6) % 2 === 0; const x = 1040 - (4 - i) * 50 - 0, y = 112;
    star(g, x, y, fresh ? 21 + 6 * Math.max(0, 1 - W2.since * 2) : 20, on && vis ? '#f6f2e6' : 'rgba(40,40,48,0.55)'); }
  g.restore(); }

// =====================================================================================================  FRAME
const _v = new THREE.Vector3();
function renderFrame(f) { f = clamp(Math.round(f), 0, NF); const t = f / FPS, S = SIM[f], r = ROT[f], tod = todAt(t);
  // light / sky / fog
  const el = tod.elev * Math.PI / 180, sd = new THREE.Vector3(Math.cos(el) * Math.cos(tod.az), Math.sin(el), Math.cos(el) * Math.sin(tod.az));
  skyMat.uniforms.top.value.copy(tod.top); skyMat.uniforms.hor.value.copy(tod.hor); skyMat.uniforms.sunDir.value.copy(sd); skyMat.uniforms.sunCol.value.copy(tod.sun); skyMat.uniforms.dusk.value = tod.dusk;
  scene.fog.color.copy(tod.hor).lerp(tod.top, 0.15); hemi.intensity = tod.hemi; hemi.color.copy(tod.top).lerp(new THREE.Color(0xffffff), 0.55); hemi.groundColor.set(tod.dusk > 0.5 ? 0x4a3a5a : 0x7a6a58);
  HILLM.color.copy(tod.hor).lerp(tod.top, 0.6).multiplyScalar(0.62); sun.color.copy(tod.sun); sun.intensity = tod.sunI; WINU.dusk.value = tod.dusk; WINU.skyT.value.copy(tod.hor);
  window.__lampHead.material.color.set(tod.dusk > 0.3 ? 0xffe0a0 : 0xd8d8d0);
  NEONM.forEach((N, i) => { N.g.opacity = 0.75 * tod.dusk * (0.9 + 0.1 * Math.sin(t * 7 + i)); N.m.color.setScalar(0.35 + 0.65 * tod.dusk); });
  // hero car
  const steer = clamp(S.lat * 0.06 + kappa(S.s) * 3 + r.drift * -0.9, -0.5, 0.5);
  placeCar(HERO, S.s, S.l, S.y, r.yaw, r.pitch, r.roll, { b: S.b, dist: S.s, steer, droop: S.droop, onRamp: true });
  HERO.tail.forEach((s) => { s.material.opacity = 0.25 + 0.75 * tod.dusk; });
  // sun shadow follows the car
  const cp = HERO.root.position.clone().add(ROOT.position); sun.position.copy(cp).addScaledVector(sd, 300); sun.target.position.copy(cp); sun.target.updateMatrixWorld();
  // police (chasers + roadblock): lights flash red/blue
  const flash = (c, ph) => { const k = Math.floor(t * 9 + ph) % 2, pl = c.root.userData.pl; pl.r1.material.color.set(k ? 0xff2020 : 0x501010); pl.b1.material.color.set(k ? 0x101850 : 0x2050ff); pl.gr.material.opacity = k ? 0.95 : 0.15; pl.gb.material.opacity = k ? 0.15 : 0.95; };
  COPS.forEach((c, i) => { const P = PSTATE[i][f]; if (!P || Math.abs(P.s - S.s) > 700) { c.root.visible = false; c.sh.visible = false; return; }
    const ph = path(P.s); const fd = Math.min(f + 1, NF), Pn = PSTATE[i][fd] || P, vs = (Pn.s - P.s) * FPS; const yaw = ph.h + Math.atan2((Pn.l - P.l) * FPS, Math.max(vs, 5)) + P.skid;
    placeCar(c, P.s, P.l, 0, yaw, -0.012 * P.stopped, 0.03 * Math.sin(t * 3 + i) * (1 - P.stopped), { dist: P.s, steer: P.skid * 0.5 }); flash(c, i * 0.5); });
  BLOCK.forEach((c, i) => { const rb = ROADBLOCK[i]; if (Math.abs(rb.s - S.s) > 900) { c.root.visible = false; c.sh.visible = false; return; } placeCar(c, rb.s, rb.l, 0, path(rb.s).h + rb.yaw, 0, 0, { dist: 0 }); flash(c, i * 0.7); });
  TRAFFIC.forEach((T, i) => { const c = TCARS[i], s = T.s0 + T.v * t; if (Math.abs(s - S.s) > 650 || nearStructure(s, 0) && false) { c.root.visible = false; c.sh.visible = false; return; }
    const yaw = path(s).h + (T.v < 0 ? Math.PI : 0); placeCar(c, s, T.l, 0, yaw, 0, 0, { dist: s * Math.sign(T.v) }); c.tail.forEach((sp) => { sp.material.opacity = 0.7 * tod.dusk; }); });
  // bridge barrier arm snaps up when the hero passes; warning lights blink
  if (BRIDGE.arm) { const tb = SIM.findIndex((s2) => s2.s > BRIDGE.armS) / FPS, age = t - tb; BRIDGE.arm.rotation.z = age > 0 ? Math.min(1.9, age * 9) : 0; BRIDGE.arm.visible = age < 0.25 || true; BRIDGE.lights.forEach((l, i) => { l.material.opacity = (Math.floor(t * 3) + i) % 2 ? 1 : 0.2; }); }
  particles(t);
  const cs = cameraAt(f); sky.position.copy(camera.position);
  renderer.render(scene, camera);
  og.drawImage(glc, 0, 0); drawHUD(og, f, cs.stunt);
}
window.renderFrame = renderFrame; window.NF = NF;
window.SIMINFO = { AIR: AIR.map((A) => ({ id: A.J.id, t0: +A.t0.toFixed(2), t1: +A.t1.toFixed(2), apex: +A.apex.toFixed(1), impact: +A.impact.toFixed(1), dist: +(A.s1 - A.s0).toFixed(0) })), traffic: TRAFFIC.length, TREJ, S_END: Math.round(S_END) };
window.EVENTS = { fps: FPS, frames: NF, speed_kmh: SIM.filter((_, i) => i % 15 === 0).map((S) => +(S.v * 3.6).toFixed(1)), jumps: AIR.map((A) => ({ id: A.J.id, kind: A.J.kind, takeoff: +A.t0.toFixed(2), landing: +A.t1.toFixed(2), apex_m: +A.apex.toFixed(1), impact: +A.impact.toFixed(1), stunt_cam: [+(A.t0 - (A.J.cam === 'front' ? 0.45 : 0.3)).toFixed(2), +(A.t1 - 0.22).toFixed(2)] })),
  near_misses: TRAFFIC.map((T) => +T.tp.toFixed(2)).sort((a, b) => a - b), wanted: WANTED, curves_t: CURVES.map((c) => [c[0], c[1]]), zones_t: { beach: [0, 19], downtown: [19, 42], harbor_golden: [42, 64], neon_dusk: [64, 90] }, drift: [86, 90] };
if (Q.get('dbg') === '2') console.log('[stunt]EV ' + JSON.stringify(window.EVENTS));
if (Q.get('dbg')) console.log("[stunt] " + JSON.stringify(window.SIMINFO).slice(-260));
renderFrame(0); window.ready = true;
