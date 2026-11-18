// station.js [BOOTH-station]: railway sets for the "Booth saved Lincoln's son" short.
//   jersey : a crowded Jersey City railway platform, c. 1864: timber train shed on iron-tied trusses, a raised plank platform
//            beside the track, a 4-4-0 American-type locomotive + tender + 3 wooden passenger cars that move along the track
//            (setTrain), luggage, benches, gas lamps, a big hanging clock, period signs.     group origin (-1600, 0,   0)
//   dc1881 : the Baltimore & Potomac station waiting room, Washington, July 1881 (tiled floor, arched windows, benches,
//            ticket window, gas chandeliers).                                                    group origin (-1600, 0, 100)
// Local frame per set: ground / floor y = 0. jersey: track centre x = 0, rails along z, platform on +x, shed opening (daylight)
// at z = -66, buffer stop + head-house wall at the +z end. Trains run toward +z (locomotive leading).
// Geometry goes through world.js Kit (rounded boxes merged per material, vertex colours); moving parts (train bodies, wheels,
// rods, smoke) are their own meshes. Original designs only: the road names are period-plausible, the engine name is invented.
import { Kit, rboxGeo, signMat } from './world.js';
import { LIGHTS_ } from './story.js';
import { oddverra } from './oddverra_next.js';

let THREE, toon, mkTex, PT, M;
export const STATION_ORIGIN = { jersey: [-1600, 0, 0], dc1881: [-1600, 0, 100] };
const O = STATION_ORIGIN;
const W3 = (name, p) => [p[0] + O[name][0], p[1] + O[name][1], p[2] + O[name][2]];

// ---------------------------------------------------------------- key dimensions (jersey local, metres)
export const TRACK = {
  railTop: 0.33, gauge: 1.435, platformY: 0.95, platformEdgeX: 1.85, carHalfW: 1.42, stepOuterX: 1.47,
  stepTreadY: [1.02, 0.72], carFloorY: 1.33, shedOpenZ: -66, bufferZ: 47.5, stopZ: 46.0,
  locoLen: 14.0, carLen: 15.0, nCars: 3,
};
const RT = TRACK.railTop, PY = TRACK.platformY, PE = TRACK.platformEdgeX;

// ---------------------------------------------------------------- geometry cache + helpers
const GC = new Map();
const cached = (k, mk) => { let g = GC.get(k); if (!g) GC.set(k, (g = mk())); return g; };
const cyl = (rt, rb, h, rs = 12, open = false, t0 = 0, tl = Math.PI * 2) => cached(`c${rt}|${rb}|${h}|${rs}|${open}|${t0}|${tl}`, () => new THREE.CylinderGeometry(rt, rb, h, rs, 1, open, t0, tl));
const sph = (r, ws = 14, hs = 10) => cached(`s${r}|${ws}|${hs}`, () => new THREE.SphereGeometry(r, ws, hs));
const tor = (r, t, rs = 6, ts = 24, arc = Math.PI * 2) => cached(`t${r}|${t}|${rs}|${ts}|${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));
const plane = (w, h) => cached(`p${w}|${h}`, () => new THREE.PlaneGeometry(w, h));
const lathe = (key, pts, n = 20) => cached('la' + key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n));
// wall panel w x h with a semicircular arch hole (radius w/2 - inset) cut from its bottom edge; extruded d along +z
const archPanel = (w, h, d, inset = 0) => cached(`ap${w}|${h}|${d}|${inset}`, () => { const s = new THREE.Shape(), r = w / 2 - inset; s.moveTo(-w / 2, 0); s.lineTo(-r, 0); s.absarc(0, 0, r, Math.PI, 0, true); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.lineTo(-w / 2, 0); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 16 }); return g; });
const mesh = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz, 'YXZ'); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
const zcyl = (K, mat, r, x, y, z0, z1, c, rs = 16) => K.put(mat, cyl(r, r, Math.abs(z1 - z0), rs), x, y, (z0 + z1) / 2, Math.PI / 2, 0, 0, 1, 1, 1, c);
const xcyl = (K, mat, r, x0, x1, y, z, c, rs = 12) => K.put(mat, cyl(r, r, Math.abs(x1 - x0), rs), (x0 + x1) / 2, y, z, 0, 0, Math.PI / 2, 1, 1, 1, c);
// build a Kit into parent; optionally no shadow casting (roof / back wall cheat so daylight reaches the platform)
const buildK = (K, parent, chunk = 0, cast = true, name) => { if (name) { const g = new THREE.Group(); g.name = name; parent.add(g); parent = g; } const n0 = parent.children.length; K.build(parent, chunk); if (!cast) for (let i = n0; i < parent.children.length; i++) parent.children[i].castShadow = parent.children[i].receiveShadow = false; }; // (VSM also renders receivers into the shadow map)

// ---------------------------------------------------------------- painters (calm fills + darker indigo-leaning marks)
const css = (...a) => PT.css(...a), shade = (...a) => PT.shade(...a), tint = (...a) => PT.tint(...a), vary = (...a) => PT.vary(...a), rng = (s) => PT.rng(s), hex = (c) => PT.hex(c);
const modulate = (...a) => PT.modulate(...a), fbm = (...a) => PT.fbm(...a);
function gravel(g, w, h, o = {}) {
  const base = hex(o.base || '#857a72'), R = rng(o.seed || 5); g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  for (let i = 0; i < 520; i++) { const x = R() * w, y = R() * h, r = 3 + R() * 6, c = vary(base, (R() - 0.5) * 0.36);
    g.fillStyle = css(shade(c, 0.7), 0.6); g.beginPath(); g.ellipse(x + 1.5, y + 2, r, r * 0.7, R() * 3, 0, 7); g.fill();
    g.fillStyle = css(c); g.beginPath(); g.ellipse(x, y, r, r * 0.7, R() * 3, 0, 7); g.fill(); g.fillStyle = css(tint(c, 1.18), 0.55); g.fillRect(x - r * 0.4, y - r * 0.45, r * 0.6, 1.5); }
  modulate(g, w, h, (u, v) => 0.88 + 0.2 * fbm(u, v, 3, 3, 3, o.seed || 5));
}
// tongue-and-groove vertical boards (near white so vertex colour tints it)
function vboards(g, w, h, o = {}) {
  const n = o.n || 16, R = rng(o.seed || 7); g.fillStyle = '#f2eee6'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { const x = i * w / n; g.fillStyle = css([242 - R() * 14, 238 - R() * 14, 230 - R() * 12]); g.fillRect(x + 2, 0, w / n - 4, h);
    g.fillStyle = 'rgba(60,40,80,0.45)'; g.fillRect(x, 0, 2, h); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x + 2, 0, 1.5, h); }
  modulate(g, w, h, (u, v) => 0.95 + 0.07 * fbm(u, v, 2, 4, 3, 9));
}
// passenger-car window (arched top), seen from outside: dark interior, half-drawn blind, a passenger hat silhouette, reflection
function carWinTex(g, w, h, frame = '#4a2a1c') {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6b6a8e'); gr.addColorStop(0.45, '#3a3550'); gr.addColorStop(1, '#2a2236'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(232,206,150,0.9)'; g.fillRect(0, 0, w, h * 0.34); g.fillStyle = 'rgba(150,110,60,0.6)'; for (let y = 8; y < h * 0.34; y += 12) g.fillRect(0, y, w, 2); g.fillStyle = '#7a5030'; g.fillRect(0, h * 0.34 - 6, w, 6);
  g.fillStyle = 'rgba(30,20,40,0.65)'; g.beginPath(); g.ellipse(w * 0.55, h * 0.78, w * 0.24, h * 0.16, 0, 0, 7); g.fill(); g.fillRect(w * 0.36, h * 0.52, w * 0.38, h * 0.1);
  g.save(); g.globalAlpha = 0.22; g.fillStyle = '#e8eeff'; g.beginPath(); g.moveTo(0, h * 0.8); g.lineTo(w * 0.7, h * 0.3); g.lineTo(w * 0.95, h * 0.3); g.lineTo(0, h * 0.98); g.fill(); g.restore();
  // arched top + frame
  g.fillStyle = frame; g.beginPath(); g.rect(0, 0, w, h); g.moveTo(w * 0.08, h); g.lineTo(w * 0.92, h); g.lineTo(w * 0.92, w * 0.5); g.arc(w / 2, w * 0.5, w * 0.42, 0, Math.PI, true); g.lineTo(w * 0.08, h); g.fill('evenodd');
  g.strokeStyle = '#d8b060'; g.lineWidth = 3; g.beginPath(); g.moveTo(w * 0.08, h - 2); g.lineTo(w * 0.08, w * 0.5); g.arc(w / 2, w * 0.5, w * 0.42, Math.PI, 0); g.lineTo(w * 0.92, h - 2); g.stroke();
}
// painted building window / door (arched) for the brick station wall; kind 'win' | 'door' | 'ticket'
function openingTex(g, w, h, kind) {
  const R = rng(kind.length * 7); g.fillStyle = '#4a2c22'; g.fillRect(0, 0, w, h);
  const m = w * 0.08, r = w / 2 - m;
  g.save(); g.beginPath(); g.moveTo(m, h); g.lineTo(m, r + m); g.arc(w / 2, r + m, r, Math.PI, 0); g.lineTo(w - m, h); g.closePath(); g.clip();
  if (kind === 'door') { g.fillStyle = '#5a3424'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a2a40'; g.fillRect(m, 0, w - 2 * m, r * 1.6); g.fillStyle = 'rgba(255,214,150,0.55)'; g.fillRect(m, 0, w - 2 * m, r * 1.6);
    for (const x of [m + 6, w / 2 + 4]) { g.fillStyle = '#6a3e2a'; g.fillRect(x, r * 1.7, w / 2 - m - 10, h - r * 1.7 - 6); g.strokeStyle = '#3a2018'; g.lineWidth = 4; g.strokeRect(x + 10, r * 1.8, w / 2 - m - 30, (h - r * 1.9) / 2 - 8); g.strokeRect(x + 10, r * 1.8 + (h - r * 1.9) / 2, w / 2 - m - 30, (h - r * 1.9) / 2 - 12); } }
  else { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, kind === 'ticket' ? '#e8b878' : '#8088b0'); gr.addColorStop(1, kind === 'ticket' ? '#8a5030' : '#3a3450'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    if (kind === 'ticket') { g.fillStyle = '#4a3020'; g.fillRect(0, h * 0.62, w, h * 0.38); g.fillStyle = '#2a1c18'; g.beginPath(); g.ellipse(w * 0.5, h * 0.5, w * 0.14, h * 0.1, 0, 0, 7); g.fill(); g.fillRect(w * 0.32, h * 0.56, w * 0.36, h * 0.08);
      g.strokeStyle = '#c8a050'; g.lineWidth = 3; for (let x = m; x < w - m; x += 14) { g.beginPath(); g.moveTo(x, h * 0.3); g.lineTo(x, h * 0.62); g.stroke(); } }
    g.fillStyle = 'rgba(240,244,255,0.18)'; g.beginPath(); g.moveTo(m, h * 0.7); g.lineTo(w * 0.6, h * 0.1); g.lineTo(w * 0.75, h * 0.1); g.lineTo(m, h * 0.85); g.fill();
    g.fillStyle = '#e8e0d0'; g.fillRect(w / 2 - 3, 0, 6, h); for (let k = 1; k < 4; k++) g.fillRect(0, r + m + k * (h - r - m) / 4 - 3, w, 6); }
  g.restore();
  g.strokeStyle = '#d8c8a8'; g.lineWidth = m * 0.7; g.beginPath(); g.moveTo(m * 0.65, h); g.lineTo(m * 0.65, r + m); g.arc(w / 2, r + m, r + m * 0.35, Math.PI, 0); g.lineTo(w - m * 0.65, h); g.stroke();
  g.fillStyle = '#d8c8a8'; g.fillRect(w / 2 - m * 0.6, 0, m * 1.2, m * 1.4);
  if (kind === 'win') { g.fillStyle = '#cfc0a0'; g.fillRect(0, h - m, w, m); }
}
function clockTex(g, w, h) {
  const c = w / 2; g.fillStyle = '#1e1a28'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4ecd6'; g.beginPath(); g.arc(c, c, c * 0.93, 0, 7); g.fill();
  g.strokeStyle = '#c8a050'; g.lineWidth = c * 0.05; g.beginPath(); g.arc(c, c, c * 0.92, 0, 7); g.stroke(); g.strokeStyle = '#2b1d4a'; g.lineWidth = 2; g.beginPath(); g.arc(c, c, c * 0.72, 0, 7); g.stroke();
  const RN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']; g.fillStyle = '#2b1d4a'; g.font = `bold ${c * 0.17 | 0}px "DejaVu Serif", serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.save(); g.translate(c + Math.sin(a) * c * 0.6, c - Math.cos(a) * c * 0.6); g.rotate(a); g.fillText(RN[i], 0, 0); g.restore(); }
  for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30, r0 = c * (i % 5 ? 0.84 : 0.8); g.lineWidth = i % 5 ? 2 : 4; g.beginPath(); g.moveTo(c + Math.sin(a) * r0, c - Math.cos(a) * r0); g.lineTo(c + Math.sin(a) * c * 0.88, c - Math.cos(a) * c * 0.88); g.stroke(); }
  const hand = (a, L, wd) => { g.lineWidth = wd; g.lineCap = 'round'; g.beginPath(); g.moveTo(c - Math.sin(a) * L * 0.15, c + Math.cos(a) * L * 0.15); g.lineTo(c + Math.sin(a) * L, c - Math.cos(a) * L); g.stroke(); };
  g.strokeStyle = '#2b1d4a'; hand((9 + 47 / 60) / 12 * Math.PI * 2, c * 0.42, c * 0.06); hand(47 / 60 * Math.PI * 2, c * 0.66, c * 0.04); g.fillStyle = '#2b1d4a'; g.beginPath(); g.arc(c, c, c * 0.05, 0, 7); g.fill();
  g.font = `${c * 0.07 | 0}px "DejaVu Serif", serif`; g.fillText('N. J. R. R. & T. CO.', c, c * 1.35);
}
// encaustic floor tiles (1881): terracotta / cream checker with small ink-blue diamonds at the corners
function tileTex(g, w, h, o = {}) {
  const n = o.n || 8, s = w / n, R = rng(3); g.fillStyle = '#5a4a44'; g.fillRect(0, 0, w, h);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const c = vary((i + j) % 2 ? [176, 92, 62] : [226, 212, 182], (R() - 0.5) * 0.08); g.fillStyle = css(c); g.fillRect(i * s + 1.5, j * s + 1.5, s - 3, s - 3);
    g.fillStyle = css(tint(c, 1.1), 0.5); g.fillRect(i * s + 2, j * s + 2, s - 4, 2); }
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) { g.fillStyle = '#3a3a5a'; g.beginPath(); g.moveTo(i * s, j * s - s * 0.2); g.lineTo(i * s + s * 0.2, j * s); g.lineTo(i * s, j * s + s * 0.2); g.lineTo(i * s - s * 0.2, j * s); g.fill(); g.fillStyle = '#e8d8a8'; g.beginPath(); g.arc(i * s, j * s, s * 0.05, 0, 7); g.fill(); }
  modulate(g, w, h, (u, v) => 0.92 + 0.12 * fbm(u, v, 3, 3, 3, 23));
}
function plasterTex(g, w, h, o = {}) {
  const base = hex(o.base || '#ead9b6'); g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  const R = rng(o.seed || 31); for (let i = 0; i < 20; i++) { g.fillStyle = css(shade(base, 0.9), 0.08); g.beginPath(); g.ellipse(R() * w, R() * h, 30 + R() * 80, 20 + R() * 50, R() * 3, 0, 7); g.fill(); }
  modulate(g, w, h, (u, v) => 0.95 + 0.08 * fbm(u, v, 3, 3, 3, o.seed || 31));
}
// lettering strip on a body colour (car letterboards, loco cab panel)
function letterTex(g, w, h, text, bg, fg = '#f0d890') {
  g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 2; g.strokeRect(6, 6, w - 12, h - 12);
  g.font = `bold ${h * 0.58 | 0}px "DejaVu Serif", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; const tw = g.measureText(text).width, sx = Math.min(1, (w - h) / tw);
  g.save(); g.translate(w / 2, h * 0.53); g.scale(sx, 1); g.fillStyle = 'rgba(10,6,16,0.5)'; g.fillText(text, 2, 2); g.fillStyle = fg; g.fillText(text, 0, 0); g.restore();
}
// view through the 1881 waiting-room doorway: sunlit platform, a passenger car side
function doorViewTex(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fff2d8'); gr.addColorStop(0.6, '#f2d8b0'); gr.addColorStop(1, '#b8987a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#9a4a34'; g.fillRect(w * 0.15, h * 0.32, w * 0.85, h * 0.36); g.fillStyle = '#5a2a20'; for (let x = w * 0.2; x < w; x += w * 0.12) g.fillRect(x, h * 0.38, w * 0.06, h * 0.12);
  g.fillStyle = '#d8c0a0'; g.fillRect(0, h * 0.72, w, h * 0.28); g.fillStyle = 'rgba(80,50,60,0.4)'; g.fillRect(0, h * 0.7, w, 4);
}

// ---------------------------------------------------------------- materials
function materials() {
  const vc = (o = {}) => toon({ vertexColors: true, ...o });
  const T = (w, h, fn, rep) => mkTex(w, h, fn, rep);
  const m = {};
  m.paint = vc(); m.iron = vc(); m.brass = vc({ emissive: 0x2a1a00 });
  m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#b08a62', n: 6, seed: 33 })) });
  m.deck = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#a88a6a', n: 8, seed: 41, joints: 2 })) });
  m.woodDark = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#6a4a36', n: 6, seed: 35, joints: 0 })) });
  m.vb = vc({ map: T(512, 512, (g, w, h) => vboards(g, w, h)) });
  m.brick = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#9a4a36', rows: 16, cols: 4 })) });
  m.gravel = vc({ map: T(512, 512, (g, w, h) => gravel(g, w, h)) });
  m.tiles = vc({ map: T(1024, 1024, (g, w, h) => tileTex(g, w, h)) });
  m.plaster = vc({ map: T(512, 512, (g, w, h) => plasterTex(g, w, h)) });
  m.carWin = toon({ map: T(128, 256, (g, w, h) => carWinTex(g, w, h)) });
  m.clock = toon({ map: T(512, 512, clockTex), emissive: 0x302820 });
  m.glowWarm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc477).multiplyScalar(3.0), fog: false });
  m.glowSoft = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe0b0).multiplyScalar(1.5), fog: false });
  m.glassFx = new THREE.MeshBasicMaterial({ color: 0xbfd0ff, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  m.open = { win: toon({ map: T(256, 512, (g, w, h) => openingTex(g, w, h, 'win')) }), door: toon({ map: T(256, 512, (g, w, h) => openingTex(g, w, h, 'door')) }), ticket: toon({ map: T(256, 512, (g, w, h) => openingTex(g, w, h, 'ticket')) }) };
  m.doorView = toon({ map: T(512, 512, doorViewTex), emissive: 0xffffff }); m.doorView.emissiveMap = m.doorView.map; m.doorView.emissive = new THREE.Color(0.55, 0.5, 0.45);
  m.smoke = toon({ color: 0xc4bcc6, emissive: 0x1a1620 }); m.smokeDk = toon({ color: 0x9a92a0 }); m.steam = toon({ color: 0xf4f0ea, emissive: 0x302c2a });
  return m;
}
const LET = new Map();
const letterMat = (text, bg, fg) => { const k = text + bg + fg; if (!LET.has(k)) LET.set(k, toon({ map: mkTex(1024, 96, (g, w, h) => letterTex(g, w, h, text, bg, fg)) })); return LET.get(k); };
const hexS = (c) => '#' + new THREE.Color(c).getHexString();
// signboard plane (world.js signMat): w x h metres, double-sided when back = true
function sign(K, text, bg, fg, w, h, x, y, z, ry = 0, o = {}) { const mt = signMat(text, bg, fg, { w: 1024, h: Math.max(96, Math.round(1024 * h / w)), fs: o.fs || 0.56, dots: o.dots });
  K.at(x, y, z, ry, () => { K.box(M.woodDark, -w / 2 - 0.05, w / 2 + 0.05, -h / 2 - 0.05, h / 2 + 0.05, -0.06, -0.005, 0x6a4a36, 0.01); K.put(mt, plane(w, h), 0, 0, 0.002); if (o.back) K.put(mt, plane(w, h), 0, 0, -0.067, 0, Math.PI, 0); }); }

// ================================================================= JERSEY: shed, platform, track
const LAMPS = []; // gas-lamp mantles (jersey local)
const TRUSS_Z = []; for (let z = -66; z <= 54; z += 6) TRUSS_Z.push(z);
const SX0 = -5.6, SX1 = 10.2, EAVE = 6.4, RIDGE = 9.6, RX = (SX0 + SX1) / 2;
function track(K, x, z0, z1) {
  for (let z = z0; z < z1; z += 0.62) K.box(M.wood, x - 1.3, x + 1.3, 0.08, 0.2, z, z + 0.24, 0x8a7060, 0.02, 1.5);
  for (const s of [-1, 1]) { const rx = x + s * (TRACK.gauge / 2 + 0.035); K.box(M.iron, rx - 0.075, rx + 0.075, 0.2, 0.23, z0, z1, 0x3a3238, 0.005); K.box(M.iron, rx - 0.012, rx + 0.012, 0.23, 0.28, z0, z1, 0x3a3238, 0.004); K.box(M.iron, rx - 0.035, rx + 0.035, 0.28, RT, z0, z1, 0x8a8a96, 0.008); }
}
function gasLampPost(K, x, z) {
  const iron = 0x22262e; K.put(M.iron, cyl(0.12, 0.17, 0.35, 8), x, PY + 0.17, z, 0, 0, 0, 1, 1, 1, iron); K.put(M.iron, cyl(0.05, 0.07, 2.6, 8), x, PY + 1.6, z, 0, 0, 0, 1, 1, 1, iron);
  for (const y of [0.5, 1.2, 2.8]) K.put(M.iron, tor(0.07, 0.018, 5, 12), x, PY + y, z, Math.PI / 2, 0, 0, 1, 1, 1, iron);
  K.beam(M.iron, [x - 0.3, PY + 2.75, z], [x + 0.3, PY + 2.75, z], 0.03, iron, true, 6);
  lantern(K, x, PY + 3.05, z);
}
function lantern(K, x, y, z, sp = true) {
  const iron = 0x22262e; K.put(M.iron, cyl(0.14, 0.1, 0.06, 4), x, y - 0.03, z, 0, Math.PI / 4, 0, 1, 1, 1, iron);
  K.put(M.glowSoft, cyl(0.17, 0.12, 0.42, 4), x, y + 0.22, z, 0, Math.PI / 4, 0, 1, 1, 1, 0xffffff); K.put(M.glowWarm, sph(0.05, 8, 6), x, y + 0.2, z);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; K.beam(M.iron, [x + Math.cos(a) * 0.13, y, z + Math.sin(a) * 0.13], [x + Math.cos(a) * 0.18, y + 0.44, z + Math.sin(a) * 0.18], 0.014, iron); }
  K.put(M.iron, cyl(0.03, 0.26, 0.2, 4), x, y + 0.54, z, 0, Math.PI / 4, 0, 1, 1, 1, iron); K.put(M.iron, sph(0.04, 8, 6), x, y + 0.66, z, 0, 0, 0, 1, 1, 1, iron);
  if (sp) LAMPS.push([x, y + 0.2, z]);
}
function trunk(K, x, y, z, ry, w = 0.9, d = 0.5, h = 0.5, c = 0x6a3a26, dome = true) {
  K.at(x, y, z, ry, () => { K.box(M.paint, -w / 2, w / 2, 0, h, -d / 2, d / 2, c, 0.02);
    if (dome) K.put(M.paint, cyl(d / 2, d / 2, w, 14, false, -Math.PI / 2, Math.PI), 0, h, 0, 0, 0, Math.PI / 2, 1, 0.45 / (d / 2) * 0.35, 1, c);
    for (const s of [-0.32, 0.32]) K.box(M.wood, s * w - 0.04, s * w + 0.04, -0.005, h + 0.005, -d / 2 - 0.01, d / 2 + 0.01, 0x9a7a52, 0.008);
    K.box(M.iron, -w / 2 - 0.01, w / 2 + 0.01, 0.04, 0.09, -d / 2 - 0.01, d / 2 + 0.01, 0x3a3238, 0.006); K.box(M.brass, -0.05, 0.05, h - 0.12, h - 0.02, d / 2, d / 2 + 0.02, 0xd8a848, 0.005); });
}
function crate(K, x, y, z, ry, s = 0.6, c = 0xb09068) { K.at(x, y, z, ry, () => { K.box(M.wood, -s / 2, s / 2, 0, s * 0.8, -s / 2, s / 2, c, 0.01); for (const sd of [-1, 1]) K.box(M.wood, -s / 2 - 0.01, s / 2 + 0.01, 0.02, s * 0.78, sd * s / 2 - 0.02, sd * s / 2 + 0.01 * sd, new THREE.Color(c).multiplyScalar(0.8), 0.005); }); }
function bench(K, x, z, ry, L = 2.2) {
  K.at(x, PY, z, ry, () => { const iron = 0x2a2e36;
    for (const sx of [-L / 2 + 0.15, 0, L / 2 - 0.15]) { K.box(M.iron, sx - 0.03, sx + 0.03, 0, 0.45, -0.22, -0.16, iron, 0.01); K.box(M.iron, sx - 0.03, sx + 0.03, 0, 0.45, 0.16, 0.22, iron, 0.01); K.box(M.iron, sx - 0.03, sx + 0.03, 0.42, 0.95, -0.27, -0.21, iron, 0.01); K.put(M.iron, tor(0.12, 0.02, 4, 10, Math.PI), sx, 0.62, 0.2, 0, Math.PI / 2, 0, 1, 1, 1, iron); }
    for (let k = 0; k < 4; k++) K.box(M.wood, -L / 2, L / 2, 0.43, 0.47, -0.2 + k * 0.11, -0.12 + k * 0.11, 0x9a6a42, 0.01);
    for (let k = 0; k < 3; k++) K.box(M.wood, -L / 2, L / 2, 0.58 + k * 0.13, 0.67 + k * 0.13, -0.26, -0.22, 0x9a6a42, 0.01); });
}
// 4-wheel station baggage wagon with a load
function baggageWagon(K, x, z, ry, load = 1) {
  K.at(x, PY, z, ry, () => { const c = 0x4a5a3a;
    K.box(M.wood, -1.0, 1.0, 0.42, 0.5, -0.55, 0.55, 0x8a6a48, 0.01); for (const sd of [-1, 1]) K.box(M.paint, -1.0, 1.0, 0.3, 0.42, sd * 0.5 - 0.04, sd * 0.5 + 0.04, c, 0.01);
    for (const [wx, wz] of [[-0.7, -0.58], [0.7, -0.58], [-0.7, 0.58], [0.7, 0.58]]) { K.put(M.iron, tor(0.19, 0.03, 5, 16), wx, 0.22, wz, 0, 0, 0, 1, 1, 1, 0x2a2228); for (let k = 0; k < 4; k++) K.cb(M.iron, 0.02, 0.36, 0.02, wx, 0.22, wz, 0x2a2228, 0, 0, k * Math.PI / 4); }
    K.beam(M.iron, [1.0, 0.48, 0], [1.6, 0.95, 0], 0.03, 0x2a2228, true); K.beam(M.iron, [1.55, 0.92, -0.18], [1.55, 0.92, 0.18], 0.025, 0x2a2228, true);
    if (load) { trunk(K, -0.45, 0.5, 0.05, 0.05, 0.85, 0.5, 0.45, 0x5a2e22); trunk(K, 0.45, 0.5, -0.05, -0.05, 0.8, 0.5, 0.42, 0x2e3a4a, false); trunk(K, 0.0, 0.95, 0.0, 0.1, 0.7, 0.44, 0.36, 0x7a5a36); crate(K, 0.5, 0.92, 0.1, 0.3, 0.42); } });
}
// two-wheel hand truck leaning back with a trunk
function handTruck(K, x, z, ry) { K.at(x, PY, z, ry, () => { const iron = 0x2a2228;
  K.put(M.iron, tor(0.16, 0.03, 5, 14), -0.25, 0.16, 0, 0, Math.PI / 2, 0, 1, 1, 1, iron); K.put(M.iron, tor(0.16, 0.03, 5, 14), 0.25, 0.16, 0, 0, Math.PI / 2, 0, 1, 1, 1, iron);
  for (const s of [-0.2, 0.2]) K.beam(M.wood, [s, 0.05, 0.05], [s, 1.35, -0.45], 0.05, 0x8a6a48); K.beam(M.wood, [-0.2, 0.7, -0.2], [0.2, 0.7, -0.2], 0.03, 0x8a6a48);
  trunk(K, 0, 0.12, -0.12, 0, 0.55, 0.36, 0.7, 0x4a2a20, false); }); }

function buildShed(root) {
  const K = new Kit(), KS = new Kit(); // KS: no-shadow shell (roof + back wall) so the sun reaches the platform through it
  // ground: ballast bed + outside ground
  K.box(M.gravel, -60, 60, -0.1, 0.0, -260, 60, 0xb8aca0, 0.01, 3);
  K.box(M.gravel, SX0 - 0.4, PE, 0, 0.08, -260, 52, 0x9a9088, 0.01, 2.2);
  track(K, 0, -260, TRACK.bufferZ + 0.6); track(K, -3.95, -260, 40);
  // buffer stop (timber crib + beam) at the track end
  K.box(M.woodDark, -1.4, 1.4, 0.2, 1.25, TRACK.bufferZ + 0.25, TRACK.bufferZ + 0.75, 0x6a4a36, 0.03); K.box(M.paint, -1.25, 1.25, 0.75, 1.15, TRACK.bufferZ, TRACK.bufferZ + 0.25, 0x8a2a22, 0.03);
  for (const s of [-1, 1]) K.beam(M.woodDark, [s * 0.9, 0.2, TRACK.bufferZ + 2.2], [s * 0.9, 1.15, TRACK.bufferZ + 0.6], 0.2, 0x5a3a2a);
  // ---- platform: plank deck, edge timber, posts under, dark void
  const pz0 = -64, pz1 = 54;
  K.box(M.deck, PE, SX1, PY - 0.1, PY, pz0, pz1, 0xd8c8b0, 0.012, 2.4);
  K.box(M.woodDark, PE, PE + 0.16, PY - 0.42, PY + 0.005, pz0, pz1, 0x7a5a42, 0.02, 1.5);
  K.box(M.woodDark, PE + 1.0, PE + 1.1, 0, PY - 0.1, pz0, pz1, 0x3a2a26, 0.01, 1.5);
  for (let z = pz0 + 1; z < pz1; z += 2.2) { K.box(M.woodDark, PE + 0.05, PE + 0.25, 0, PY - 0.42, z, z + 0.2, 0x4a3a32, 0.01); K.beam(M.woodDark, [PE + 0.2, 0.05, z + 0.1], [PE + 1.0, PY - 0.42, z + 0.1], 0.08, 0x4a3a32); }
  K.box(M.woodDark, PE, SX1, PY - 0.1, PY - 0.02, pz0 - 0.2, pz0, 0x6a4a36, 0.01); // platform end board
  // ramp at the open end
  K.at(PE + 4, 0, pz0, 0, () => { K.put(M.deck, rboxGeo(4.0, 0.08, 5.2, 0.01, 2.4), 0, PY / 2 - 0.04, -2.5, -Math.atan2(PY, 5.2), 0, 0, 1, 1, 1, 0xc8b8a0); });
  // ---- back wall: brick station building along x = SX1 (doors, windows, ticket window)
  KS.box(M.brick, SX1, SX1 + 0.5, PY - 0.1, EAVE + 0.3, pz0 - 2, 56, 0xffffff, 0.01, 2.2);
  KS.box(M.paint, SX1 - 0.08, SX1, PY, PY + 0.32, pz0, 55.8, 0x5a3a2a, 0.01);
  KS.box(M.paint, SX1 - 0.12, SX1, EAVE - 0.5, EAVE - 0.3, pz0, 55.8, 0xd8c8a8, 0.01);
  for (let i = 0; i < TRUSS_Z.length - 1; i++) { const z = TRUSS_Z[i] + 3, kind = i === 10 ? 'ticket' : i % 3 === 1 ? 'door' : 'win';
    const w = kind === 'door' ? 1.9 : 1.5, h = kind === 'door' ? 3.3 : 2.6, y0 = kind === 'win' ? PY + 1.0 : kind === 'ticket' ? PY + 0.9 : PY;
    KS.put(M.open[kind], plane(w, h), SX1 - 0.01, y0 + h / 2, z, 0, -Math.PI / 2, 0); KS.box(M.paint, SX1 - 0.12, SX1, y0 - 0.1, y0 + 0.02, z - w / 2 - 0.1, z + w / 2 + 0.1, 0xd8c8a8, 0.01);
    if (kind === 'ticket') { KS.box(M.wood, SX1 - 0.45, SX1, PY + 0.85, PY + 0.95, z - 1.0, z + 1.0, 0x8a5a3a, 0.01); KS.box(M.woodDark, SX1 - 0.4, SX1, PY, PY + 0.85, z - 1.0, z + 1.0, 0x5a3a2a, 0.01); } }
  // ---- head-house end wall at z = 55.6 with a doorway to the ferry
  KS.box(M.brick, SX0 - 0.4, SX1 + 0.5, 0, RIDGE + 0.6, 55.6, 56.2, 0xf0e0d8, 0.01, 2.2);
  KS.put(M.open.door, plane(2.6, 3.8), 6.0, PY + 1.9, 55.58, 0, Math.PI, 0); KS.put(M.open.door, plane(2.6, 3.8), -2.5, 1.9, 55.58, 0, Math.PI, 0);
  for (const x of [-4.2, 2.0, 8.6]) KS.put(M.open.win, plane(1.4, 2.6), x, 7.6, 55.58, 0, Math.PI, 0);
  // ---- trusses: wooden rafters + iron tie rods + king/queen rods + struts; colonnade posts on the open (-x) side
  const yR = (x) => (x <= RX ? EAVE + (RIDGE - EAVE) * (x - SX0) / (RX - SX0) : EAVE + (RIDGE - EAVE) * (SX1 - x) / (SX1 - RX));
  for (const z of TRUSS_Z) {
    const wd = 0x7a5a42, ir = 0x2a2a34;
    K.beam(M.woodDark, [SX0, EAVE, z], [RX, RIDGE, z], 0.26, wd); K.beam(M.woodDark, [RX, RIDGE, z], [SX1, EAVE, z], 0.26, wd);
    K.beam(M.iron, [SX0, EAVE + 0.05, z], [SX1, EAVE + 0.05, z], 0.06, ir, true, 6);
    K.beam(M.iron, [RX, EAVE + 0.05, z], [RX, RIDGE, z], 0.05, ir, true, 6);
    for (const f of [0.25, 0.75]) { const x = SX0 + (SX1 - SX0) * f; K.beam(M.iron, [x, EAVE + 0.05, z], [x, yR(x), z], 0.035, ir, true, 6); K.beam(M.woodDark, [x, EAVE + 0.05, z], [f < 0.5 ? RX - 1.2 : RX + 1.2, yR(f < 0.5 ? RX - 1.2 : RX + 1.2), z], 0.14, wd); }
    K.put(M.iron, cyl(0.12, 0.12, 0.12, 8), RX, EAVE + 0.05, z, 0, 0, Math.PI / 2, 1, 1, 1, ir);
    // colonnade post + knee braces on the open side
    K.box(M.woodDark, SX0 - 0.15, SX0 + 0.15, 0, EAVE + 0.1, z - 0.15, z + 0.15, 0x6a4a36, 0.02);
    K.box(M.stone ?? M.paint, SX0 - 0.25, SX0 + 0.25, 0, 0.5, z - 0.25, z + 0.25, 0xa8a090, 0.02);
    K.beam(M.woodDark, [SX0, EAVE - 1.3, z], [SX0 + 1.3, EAVE + 0.02, z], 0.12, wd); K.beam(M.woodDark, [SX1, EAVE - 1.3, z], [SX1 - 1.3, EAVE + 0.02, z], 0.12, wd);
  }
  // eave beam + purlins
  K.box(M.woodDark, SX0 - 0.2, SX0 + 0.2, EAVE - 0.35, EAVE + 0.05, -66, 55.6, 0x6a4a36, 0.02, 2);
  for (const f of [0.15, 0.32, 0.5, 0.68, 0.85]) { const x = SX0 + (SX1 - SX0) * f; if (Math.abs(x - RX) < 1.4) continue; K.box(M.woodDark, x - 0.08, x + 0.08, yR(x) + 0.1, yR(x) + 0.26, -66, 55.6, 0x6a4a36, 0.01, 2); }
  // roof planes (board sheathing) with a raised ventilating monitor along the ridge
  const slope = (xa, xb) => { const ya = yR(xa) + 0.26, yb = yR(xb) + 0.26, L = Math.hypot(xb - xa, yb - ya), th = Math.atan2(yb - ya, xb - xa);
    KS.put(M.woodDark, rboxGeo(L, 0.08, 122.6, 0.01, 2.2), (xa + xb) / 2, (ya + yb) / 2 + 0.04, -5.2, 0, 0, th, 1, 1, 1, 0x8a6a52); };
  slope(SX0 - 0.6, RX - 1.4); slope(RX + 1.4, SX1 + 0.6);
  KS.box(M.woodDark, RX - 2.0, RX + 2.0, RIDGE + 0.9, RIDGE + 1.0, -66, 55.6, 0x6a4a42, 0.02, 2);
  for (let z = -66; z < 55.6; z += 1.5) for (const s of [-1, 1]) K.box(M.woodDark, RX + s * 1.42 - 0.05, RX + s * 1.42 + 0.05, yR(RX - 1.4) + 0.2, RIDGE + 0.9, z, z + 0.1, 0x6a4a36, 0.01);
  // fascia board along the open side + gable boards at the opening
  KS.box(M.paint, SX0 - 0.7, SX0 - 0.6, EAVE - 0.4, EAVE + 0.3, -66.2, 55.6, 0x8a2a22, 0.01);
  for (const s of [-1, 1]) { const xa = s < 0 ? SX0 - 0.6 : SX1 + 0.6, L = Math.hypot(RX - xa, RIDGE - EAVE + 0.3), th = Math.atan2(RIDGE - EAVE + 0.3, RX - xa);
    KS.put(M.paint, rboxGeo(L, 0.5, 0.12, 0.02), (xa + RX) / 2, (EAVE + RIDGE) / 2 + 0.25, -66.3, 0, 0, th, 1, 1, 1, 0x8a2a22); }
  // ---- platform furniture: lamps, benches, luggage, hand trucks
  for (let z = -54; z <= 42; z += 12) gasLampPost(K, PE + 1.1, z);
  for (const z of TRUSS_Z) if ((z / 6) % 2 === 0 && z > -60 && z < 52) { K.beam(M.iron, [6.2, EAVE + 0.05, z], [6.2, 4.6, z], 0.02, 0x2a2a34); lantern(K, 6.2, 4.0, z); }
  for (const z of [-46, -26, -8, 16, 30]) bench(K, SX1 - 0.45, z, -Math.PI / 2, 2.6);
  for (const z of [-38, -5.0, 22]) bench(K, 5.6, z, Math.PI / 2 * (z > 0 ? 1 : -1), 2.4);
  baggageWagon(K, 7.0, -14, 0.1); baggageWagon(K, 7.3, 9, -0.05); baggageWagon(K, 6.8, 36, 0.2, 1);
  handTruck(K, 4.6, -9.5, 0.6); handTruck(K, 8.6, 3.5, -2.2);
  const R = rng(17);
  for (const [x, z] of [[8.4, -21], [8.8, -20.2], [4.8, 2.6], [8.9, 13.5], [9.0, 26], [5.3, -30]]) { trunk(K, x, PY, z, R() * 0.6 - 0.3, 0.8 + R() * 0.2, 0.48, 0.45, [0x5a2e22, 0x2e3a4a, 0x7a5a36, 0x3a4a2a][(R() * 4) | 0], R() < 0.6); if (R() < 0.6) trunk(K, x + 0.05, PY + 0.46 + 0.12, z + 0.02, R() - 0.5, 0.6, 0.4, 0.34, 0x8a6a3a, false); }
  for (const [x, z] of [[9.2, -19.5], [9.3, 12], [9.1, 27.5], [5.8, 3.4], [9.2, 38], [9.25, 38.7]]) { crate(K, x, PY, z, R() * 0.4, 0.55 + R() * 0.15); if (R() < 0.5) crate(K, x, PY + 0.5, z, R(), 0.45); }
  for (const [x, z] of [[9.3, -11.0], [9.4, 20.5]]) { K.put(M.wood, cyl(0.3, 0.3, 0.85, 14), x, PY + 0.43, z, 0, 0, 0, 1, 1, 1, 0x9a6a3a); for (const y of [0.15, 0.7]) K.put(M.iron, tor(0.3, 0.02, 4, 18), x, PY + y, z, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2228); }
  // ---- signs (period wood-type): JERSEY CITY hung from trusses, road names on the back wall, TICKETS over the ticket window
  sign(K, 'JERSEY CITY', '#1f3a2c', '#f2e2b0', 6.4, 1.0, 6.0, 5.3, -24, 0, { back: true, fs: 0.62 });
  for (const sx of [3.4, 8.6]) K.beam(M.iron, [sx, 5.82, -24.03], [sx, EAVE + 0.05, -24.03], 0.02, 0x2a2a34);
  sign(K, 'JERSEY CITY', '#1f3a2c', '#f2e2b0', 6.4, 1.0, 6.0, 5.3, 18, 0, { back: true, fs: 0.62 });
  for (const sx of [3.4, 8.6]) K.beam(M.iron, [sx, 5.82, 17.97], [sx, EAVE + 0.05, 17.97], 0.02, 0x2a2a34);
  sign(K, 'NEW YORK & PHILADELPHIA', '#6a1e1e', '#f2e2b0', 9.0, 0.8, SX1 - 0.07, EAVE - 1.05, -5, -Math.PI / 2, { fs: 0.6 });
  sign(K, 'NEW YORK & PHILADELPHIA', '#6a1e1e', '#f2e2b0', 9.0, 0.8, SX1 - 0.07, EAVE - 1.05, 31, -Math.PI / 2, { fs: 0.6 });
  sign(K, 'TICKETS', '#2a2a44', '#f2d890', 2.2, 0.5, SX1 - 0.07, PY + 4.05, TRUSS_Z[10] + 3, -Math.PI / 2, { fs: 0.62 });
  sign(K, 'TO FERRY — NEW YORK', '#1f3a2c', '#f2e2b0', 4.6, 0.7, 6.0, PY + 4.45, 55.55, Math.PI, { fs: 0.58 });
  sign(K, 'JERSEY CITY', '#1f3a2c', '#f2e2b0', 8.0, 1.2, RX, 8.0, -66.45, Math.PI, { fs: 0.62 });
  sign(K, 'BAGGAGE', '#3a2a1e', '#f2e2b0', 2.0, 0.45, SX1 - 0.07, PY + 3.7, TRUSS_Z[4] + 3, -Math.PI / 2, { fs: 0.6 });
  // ---- the big station clock: double-faced drum hung from a truss over the platform
  const CZ = 6, CX = 4.8, CY = 4.6;
  K.beam(M.iron, [CX, EAVE + 0.05, CZ], [CX, CY + 0.75, CZ], 0.03, 0x2a2a34, true); K.put(M.brass, sph(0.08, 8, 6), CX, CY + 0.78, CZ, 0, 0, 0, 1, 1, 1, 0xd8a848);
  K.put(M.paint, cyl(0.68, 0.68, 0.32, 32), CX, CY, CZ, Math.PI / 2, 0, 0, 1, 1, 1, 0x1e2a24); K.put(M.brass, tor(0.66, 0.035, 6, 32), CX, CY, CZ + 0.165, 0, 0, 0, 1, 1, 1, 0xd8a848); K.put(M.brass, tor(0.66, 0.035, 6, 32), CX, CY, CZ - 0.165, 0, 0, 0, 1, 1, 1, 0xd8a848);
  K.put(M.clock, cached('clockc', () => new THREE.CircleGeometry(0.64, 40)), CX, CY, CZ + 0.17); K.put(M.clock, cached('clockc', () => new THREE.CircleGeometry(0.64, 40)), CX, CY, CZ - 0.17, 0, Math.PI, 0);
  // ---- outside the opening: water tank, a freight shed, telegraph poles, distant warehouses (fog-softened)
  K.at(-11, 0, -96, 0, () => { for (const [x, z] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) K.beam(M.woodDark, [x * 1.1, 0, z * 1.1], [x * 0.9, 6, z * 0.9], 0.3, 0x5a3a2a);
    K.put(M.wood, cyl(2.6, 2.6, 3.4, 24), 0, 7.7, 0, 0, 0, 0, 1, 1, 1, 0x9a6040); for (const y of [6.4, 7.4, 8.4, 9.2]) K.put(M.iron, tor(2.62, 0.04, 4, 32), 0, y, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2228);
    K.put(M.paint, cyl(0.2, 2.9, 1.2, 24), 0, 10.0, 0, 0, 0, 0, 1, 1, 1, 0x5a4a44); K.box(M.woodDark, -3, 3, 5.9, 6.1, -3, 3, 0x5a3a2a, 0.02); });
  K.at(16, 0, -110, 0, () => { K.box(M.brick, -8, 8, 0, 7, -14, 14, 0xe8d0c8, 0.02, 2.2); K.put(M.woodDark, rboxGeo(18, 0.2, 30, 0.02, 2), 0, 8.2, 0, 0, 0, 0.0, 1, 1, 1, 0x5a4a4a); for (let z = -12; z < 13; z += 4) K.put(M.open.door, plane(2.4, 3.4), -8.02, 1.7, z, 0, -Math.PI / 2, 0); });
  K.at(-22, 0, -150, 0, () => { K.box(M.brick, -8, 8, 0, 10, -10, 10, 0xd8c0b8, 0.02, 2.2); for (let x = -6; x < 7; x += 3) for (const y of [2, 6]) K.put(M.open.win, plane(1.3, 2.2), x, y + 1.1, 10.02); });
  for (let z = -76; z > -250; z -= 24) { K.box(M.woodDark, -8.1, -7.9, 0, 7.5, z - 0.1, z + 0.1, 0x5a3a2a, 0.02); K.box(M.woodDark, -9.0, -7.0, 7.0, 7.12, z - 0.06, z + 0.06, 0x5a3a2a, 0.01); }
  buildK(K, root, 24); buildK(KS, root, 24, false, 'shell');
}

// ================================================================= the train
// spoked wheel prefab, axis along x, outer face toward +x * side. driver: counterweight + crank boss
function wheelPF(r, n, driver, side, col) {
  const K = new Kit(), s = side;
  K.put(M.iron, tor(r - 0.045, 0.05, 6, 32), 0, 0, 0, 0, Math.PI / 2, 0, 1, 1.0, 1.4, 0x34303a);
  K.put(M.iron, tor(r - 0.02, 0.022, 5, 32), -s * 0.05, 0, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0x34303a);
  K.put(M.paint, tor(r - 0.1, 0.028, 5, 28), s * 0.01, 0, 0, 0, Math.PI / 2, 0, 1, 1, 1, col);
  for (let k = 0; k < n; k++) { const a = (k + 0.5) * Math.PI * 2 / n; K.beam(M.paint, [s * 0.01, Math.sin(a) * r * 0.18, Math.cos(a) * r * 0.18], [s * 0.01, Math.sin(a) * (r - 0.1), Math.cos(a) * (r - 0.1)], Math.max(0.03, r * 0.055), col, true, 5); }
  K.put(M.paint, cyl(r * 0.22, r * 0.22, 0.14, 14), s * 0.01, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, col); K.put(M.brass, cyl(r * 0.1, r * 0.1, 0.16, 10), s * 0.03, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0xd8a848);
  if (driver) { const rc = driver; K.cb(M.paint, 0.07, r * 0.5, r * 0.26, s * 0.02, 0, -r * 0.66, col, 0, 0, 0, 0.03); K.put(M.paint, cyl(0.1, 0.1, 0.14, 10), s * 0.04, 0, rc, 0, 0, Math.PI / 2, 1, 1, 1, col); }
  return K.prefab();
}
function wheel(parent, pf, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); for (const [mat, geo] of pf) { const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; g.add(m); } parent.add(g); return g; }

const LOCO = { drR: 0.76, drZ: [-4.45, -6.35], ldR: 0.38, ldZ: [-1.85, -2.95], tdR: 0.42, tdZ: [-9.55, -10.75, -12.45, -13.65], rc: 0.32, cylZ: -2.15, mainL: 1.55, stack: [0, 4.7, -1.75], cylX: 1.05 };
function buildLoco() {
  const g = new THREE.Group(); g.name = 'loco'; const K = new Kit();
  const red = 0xa8302a, boilerC = 0x4e6276, black = 0x24222c, brass = 0xd8a848, green = 0x2e5a3e, cabC = 0x8a3a24, yB = 2.45, rB = 0.6;
  // frame + running boards
  for (const s of [-1, 1]) { K.box(M.iron, s * 0.42 - 0.06, s * 0.42 + 0.06, 0.95, 1.3, -7.0, -1.0, black, 0.01); K.box(M.wood, s * 0.85, s * 1.35, 1.58, 1.64, -6.7, -2.65, 0x7a5a42, 0.01); K.box(M.brass, s * 1.34, s * 1.37, 1.56, 1.66, -6.7, -2.65, brass, 0.005); }
  // pilot (cowcatcher): V of slats from the buffer beam down to the rail-level point
  K.box(M.paint, -1.32, 1.32, 0.82, 1.12, -1.25, -1.02, red, 0.02); K.box(M.brass, -1.3, 1.3, 1.05, 1.1, -1.03, -1.0, brass, 0.005);
  const zb = (x) => -Math.abs(x) * 0.78;
  for (let i = -6; i <= 6; i++) { const x = i * 0.2; K.beam(M.paint, [x, 0.95, -1.08], [x * 1.0, RT + 0.12, zb(x) + 0.0], 0.05, red); }
  K.beam(M.paint, [-1.25, RT + 0.12, zb(1.25)], [0, RT + 0.12, 0], 0.07, red); K.beam(M.paint, [1.25, RT + 0.12, zb(1.25)], [0, RT + 0.12, 0], 0.07, red);
  K.beam(M.paint, [0, RT + 0.12, 0], [0, 1.0, -1.05], 0.08, red); K.put(M.brass, sph(0.07, 8, 6), 0, 0.98, -1.0, 0, 0, 0, 1, 1, 1, brass);
  // smokebox + boiler + firebox
  zcyl(K, M.paint, 0.63, 0, yB, -1.25, -2.75, black, 24); K.put(M.paint, cyl(0.6, 0.6, 0.05, 24), 0, yB, -1.23, Math.PI / 2, 0, 0, 1, 1, 1, 0x34303a);
  K.put(M.brass, cyl(0.12, 0.12, 0.05, 12), 0, yB, -1.2, Math.PI / 2, 0, 0, 1, 1, 1, brass);
  zcyl(K, M.paint, rB, 0, yB, -2.75, -5.6, boilerC, 24);
  K.box(M.paint, -0.62, 0.62, 1.4, yB + 0.62, -5.5, -6.75, boilerC, 0.05); K.put(M.paint, cyl(0.62, 0.62, 1.25, 24, false, -Math.PI / 2, Math.PI), 0, yB + 0.6, -6.12, Math.PI / 2, 0, Math.PI / 2, 1, 1, 0.4 / 0.62, boilerC);
  for (const z of [-2.75, -3.6, -4.5, -5.5, -6.7]) K.put(M.brass, tor(z < -5.4 ? 0.64 : rB + 0.01, 0.025, 5, 28), 0, yB, z, 0, 0, 0, 1, 1, 1, brass);
  for (const s of [-1, 1]) { K.beam(M.brass, [s * 0.66, yB + 0.22, -1.6], [s * 0.66, yB + 0.22, -6.6], 0.018, brass, true, 6); }
  // balloon stack
  K.put(M.paint, cyl(0.2, 0.24, 0.85, 16), 0, yB + 0.95, -1.75, 0, 0, 0, 1, 1, 1, black); K.put(M.brass, tor(0.22, 0.03, 5, 18), 0, yB + 0.62, -1.75, Math.PI / 2, 0, 0, 1, 1, 1, brass);
  K.put(M.paint, lathe('balloon', [[0.0, 0], [0.22, 0], [0.24, 0.1], [0.62, 0.62], [0.76, 0.9], [0.78, 1.0], [0.72, 1.06], [0.0, 1.06]], 24), 0, yB + 1.35, -1.75, 0, 0, 0, 1, 1, 1, black);
  K.put(M.paint, tor(0.76, 0.04, 5, 28), 0, yB + 2.36, -1.75, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a3644);
  // headlamp (big box lamp with a reflector) on its bracket
  K.box(M.paint, -0.36, 0.36, yB + 0.62, yB + 0.72, -1.15, -1.75, black, 0.01);
  K.at(0, yB + 0.72, -1.4, 0, () => { K.box(M.paint, -0.32, 0.32, 0, 0.62, -0.32, 0.32, red, 0.03); K.box(M.brass, -0.34, 0.34, 0.6, 0.66, -0.34, 0.34, brass, 0.01); K.put(M.paint, cyl(0.08, 0.14, 0.24, 10), 0, 0.78, 0, 0, 0, 0, 1, 1, 1, black);
    K.put(M.paint, cyl(0.24, 0.24, 0.05, 20), 0, 0.31, 0.33, Math.PI / 2, 0, 0, 1, 1, 1, 0x34303a); K.put(M.brass, cyl(0.21, 0.21, 0.02, 20), 0, 0.31, 0.355, Math.PI / 2, 0, 0, 1, 1, 1, 0xfff0c0); K.put(M.brass, tor(0.23, 0.025, 5, 20), 0, 0.31, 0.34, 0, 0, 0, 1, 1, 1, brass); });
  // sand dome, bell, steam dome + whistle
  K.put(M.paint, cyl(0.26, 0.3, 0.42, 18), 0, yB + 0.72, -3.05, 0, 0, 0, 1, 1, 1, red); K.put(M.brass, sph(0.27, 16, 8), 0, yB + 0.93, -3.05, 0, 0, 0, 1, 0.55, 1, brass);
  K.at(0, yB + 0.6, -3.75, 0, () => { for (const s of [-1, 1]) K.box(M.brass, s * 0.2 - 0.03, s * 0.2 + 0.03, 0, 0.55, -0.03, 0.03, brass, 0.01); K.beam(M.brass, [-0.22, 0.55, 0], [0.22, 0.55, 0], 0.04, brass, true);
    K.put(M.brass, lathe('bell', [[0.0, 0.0], [0.24, 0.0], [0.22, 0.06], [0.16, 0.2], [0.13, 0.36], [0.06, 0.42], [0, 0.44]], 18), 0, 0.08, 0, 0, 0, 0, 1, 1, 1, brass); });
  K.put(M.brass, cyl(0.3, 0.36, 0.55, 20), 0, yB + 0.82, -4.65, 0, 0, 0, 1, 1, 1, brass); K.put(M.brass, sph(0.31, 18, 8), 0, yB + 1.1, -4.65, 0, 0, 0, 1, 0.6, 1, brass);
  K.put(M.brass, cyl(0.05, 0.05, 0.36, 10), 0, yB + 1.45, -4.65, 0, 0, 0, 1, 1, 1, brass); K.put(M.brass, cyl(0.07, 0.07, 0.2, 10), 0, yB + 1.68, -4.65, 0, 0, 0, 1, 1, 1, brass);
  // cylinders + steam chests + crosshead guides
  for (const s of [-1, 1]) { const x = s * LOCO.cylX, y = LOCO.drR + RT;
    zcyl(K, M.paint, 0.27, x, y, LOCO.cylZ + 0.45, LOCO.cylZ - 0.45, boilerC, 18); for (const dz of [0.45, -0.45]) K.put(M.brass, cyl(0.29, 0.29, 0.05, 18), x, y, LOCO.cylZ + dz, Math.PI / 2, 0, 0, 1, 1, 1, brass);
    K.box(M.paint, x - 0.18, x + 0.18, y + 0.24, y + 0.56, LOCO.cylZ - 0.36, LOCO.cylZ + 0.36, boilerC, 0.03); K.box(M.brass, x - 0.19, x + 0.19, y + 0.54, y + 0.58, LOCO.cylZ - 0.37, LOCO.cylZ + 0.37, brass, 0.01);
    K.beam(M.paint, [x, y + 0.4, LOCO.cylZ], [s * 0.6, yB - 0.2, LOCO.cylZ], 0.12, black);
    for (const dy of [0.11, -0.11]) K.box(M.iron, x - 0.04, x + 0.04, y + dy - 0.02, y + dy + 0.02, LOCO.cylZ - 1.55, LOCO.cylZ - 0.45, 0x9a9aa6, 0.005);
    // splashers over the drivers (open band + brass beading)
    for (const z of LOCO.drZ) { K.put(M.paint, cyl(0.84, 0.84, 0.12, 24, true, 0.42, Math.PI - 0.84), s * 0.76, y, z, 0, 0, Math.PI / 2, 1, 1, 1, red); K.put(M.brass, tor(0.84, 0.02, 4, 24, Math.PI - 0.84), s * 0.83, y, z, 0, Math.PI / 2, 0.42, 1, 1, 1, brass); } }
  // cab (varnished wood, arched side windows, roof) + name panel
  const cz0 = -6.55, cz1 = -8.6, cy0 = 1.62, cy1 = 3.85;
  for (const s of [-1, 1]) { K.box(M.wood, s * 1.22, s * 1.32, cy0, cy1, cz1, cz0, cabC, 0.02); K.box(M.brass, s * 1.31, s * 1.335, cy0 + 0.98, cy0 + 1.02, cz1, cz0, brass, 0.005);
    K.put(M.carWin, plane(0.9, 1.05), s * 1.325, cy0 + 1.72, (cz0 + cz1) / 2 + 0.2, 0, s * Math.PI / 2, 0); K.put(letterMat('MERCURY', hexS(cabC), '#f0d890'), plane(1.3, 0.24), s * 1.326, cy0 + 0.72, (cz0 + cz1) / 2, 0, s * Math.PI / 2, 0); }
  K.box(M.wood, -1.32, 1.32, cy0, cy1, cz0 - 0.08, cz0, cabC, 0.02); for (const s of [-1, 1]) K.put(M.carWin, plane(0.42, 0.62), s * 0.88, cy0 + 1.6, cz0 + 0.01, 0, 0, 0);
  K.put(M.paint, cyl(1.7, 1.7, 2.4, 28, false, -0.85, 1.7), 0, cy1 - 1.55, (cz0 + cz1) / 2, Math.PI / 2, 0, 0, 1, 1, 1, 0x4a2a20);
  K.box(M.paint, -1.32, 1.32, cy0 - 0.08, cy0, cz1, cz0, black, 0.01);
  // tender: frame, U tank, wood load, trucks' side frames
  const tz0 = -8.9, tz1 = -14.2;
  K.box(M.paint, -1.32, 1.32, 1.12, 1.3, tz1, tz0, black, 0.02); K.box(M.paint, -1.3, 1.3, 1.3, 2.55, tz1, tz0 - 2.4, green, 0.04);
  for (const s of [-1, 1]) K.box(M.paint, s * 0.9, s * 1.3, 1.3, 2.55, tz0 - 2.4, tz0, green, 0.04); K.box(M.paint, -1.32, 1.32, 2.52, 2.62, tz1, tz0, 0x1e3a2a, 0.02);
  for (const s of [-1, 1]) { K.box(M.brass, s * 1.31, s * 1.33, 1.6, 1.64, tz1, tz0, brass, 0.004); K.put(letterMat('N. J. R. R. & T. CO.', hexS(green), '#f0d890'), plane(3.2, 0.36), s * 1.315, 2.0, (tz0 + tz1) / 2, 0, s * Math.PI / 2, 0); }
  const R = rng(9); for (let i = 0; i < 46; i++) { const x = (R() - 0.5) * 1.7, y = 1.6 + R() * 1.45 + (0.9 - Math.abs(x)) * 0.4, z = tz0 - 0.15 - R() * 2.2, r = 0.07 + R() * 0.05; K.put(M.wood, cyl(r, r, 0.95, 7), x, Math.min(3.25, y), z, Math.PI / 2 + (R() - 0.5) * 0.3, (R() - 0.5) * 0.5, 0, 1, 1, 1, [0x8a6a48, 0x9a7a52, 0x6a4e38][i % 3]); }
  for (const zc of [-10.15, -13.05]) for (const s of [-1, 1]) { K.box(M.iron, s * 0.86, s * 0.94, 0.55, 0.7, zc - 1.0, zc + 1.0, black, 0.01); K.box(M.iron, s * 0.86, s * 0.94, 0.95, 1.05, zc - 0.9, zc + 0.9, black, 0.01); K.box(M.paint, s * 0.84, s * 0.96, 0.6, 1.0, zc - 0.12, zc + 0.12, black, 0.01); }
  // lead truck frame + coupler
  for (const s of [-1, 1]) K.box(M.iron, s * 0.86, s * 0.94, 0.6, 0.78, -3.4, -1.4, black, 0.01);
  K.box(M.iron, -0.1, 0.1, 0.85, 0.98, tz1 - 0.4, tz1, black, 0.01);
  K.build(g);
  // wheels + rods (animated)
  const W = { all: [] }, drv = LOCO.drR + RT;
  const pfD = [wheelPF(LOCO.drR, 16, LOCO.rc, -1, red), wheelPF(LOCO.drR, 16, LOCO.rc, 1, red)], pfL = [wheelPF(LOCO.ldR, 10, 0, -1, red), wheelPF(LOCO.ldR, 10, 0, 1, red)], pfT = [wheelPF(LOCO.tdR, 8, 0, -1, black), wheelPF(LOCO.tdR, 8, 0, 1, black)];
  const add = (pf, r, zs, phase0) => { for (const z of zs) for (const s of [-1, 1]) { const w = wheel(g, pf[(s + 1) / 2], s * 0.75, r + RT, z); W.all.push({ w, r, phase: s > 0 ? 0 : Math.PI / 2 * (phase0 ? 1 : 0) }); } };
  add(pfD, LOCO.drR, LOCO.drZ, true); add(pfL, LOCO.ldR, LOCO.ldZ, false); add(pfT, LOCO.tdR, LOCO.tdZ, false);
  const rodMat = toon({ color: 0xb8b8c8 }), rods = {};
  for (const s of [-1, 1]) { rods[s] = { side: mesh(g, rboxGeo(0.06, 0.12, LOCO.drZ[0] - LOCO.drZ[1] + 0.34, 0.02), rodMat), main: mesh(g, rboxGeo(0.06, 0.13, LOCO.mainL, 0.02), rodMat), xh: mesh(g, rboxGeo(0.14, 0.2, 0.24, 0.03), rodMat), pr: mesh(g, cyl(0.04, 0.04, 1, 8), rodMat) }; }
  const setPos = (z) => {
    for (const it of W.all) it.w.rotation.x = z / it.r + it.phase;
    for (const s of [-1, 1]) { const ph = z / LOCO.drR + (s > 0 ? 0 : Math.PI / 2), py = (zw) => [drv - LOCO.rc * Math.sin(ph), zw + LOCO.rc * Math.cos(ph)];
      const [y0, z0] = py(LOCO.drZ[0]), [, z1] = py(LOCO.drZ[1]), r = rods[s];
      r.side.position.set(s * 0.9, y0, (z0 + z1) / 2);
      const dz = Math.sqrt(LOCO.mainL ** 2 - (y0 - drv) ** 2), zx = z0 + dz; r.xh.position.set(s * LOCO.cylX, drv, zx);
      r.main.position.set(s * 0.98, (y0 + drv) / 2, (z0 + zx) / 2); r.main.rotation.x = Math.atan2(-(drv - y0), dz);
      const za = LOCO.cylZ - 0.45; r.pr.position.set(s * LOCO.cylX, drv, (za + zx) / 2); r.pr.rotation.x = Math.PI / 2; r.pr.scale.set(1, Math.abs(za - zx), 1); } };
  return { g, setPos };
}
// wooden passenger car (c. 1860s): clerestory roof, end platforms with railings + side steps, arched windows, truss rods
const CAR = { len: 15.0, plat: 0.9, truckZ: [-2.75, -12.25], wb: 1.5, wR: 0.42 };
function buildCar(col, label, num) {
  const g = new THREE.Group(); g.name = 'car'; const K = new Kit();
  const b0 = -CAR.plat, b1 = -CAR.len + CAR.plat, yF = TRACK.carFloorY, yT = 3.62, HW = TRACK.carHalfW, black = 0x24222c, brass = 0xd8a848, iron = 0x2a2830;
  const trim = new THREE.Color(col).multiplyScalar(0.62).getHex(), cream = 0xe8d8b0;
  // floor/sills, body sides (vertical boards), ends with doors
  K.box(M.paint, -HW - 0.02, HW + 0.02, yF - 0.2, yF, b1 - 0.04, b0 + 0.04, black, 0.02);
  K.box(M.vb, -HW, HW, yF, yT, b1, b0, col, 0.03, 1.2);
  for (const s of [-1, 1]) { K.box(M.paint, s * HW - 0.015, s * HW + 0.015 * 1, yF, yF + 0.12, b1, b0, trim, 0.01); K.box(M.paint, s * (HW + 0.0), s * (HW + 0.03), yF + 0.78, yF + 0.86, b1, b0, trim, 0.005);
    K.box(M.brass, s * (HW + 0.025), s * (HW + 0.035), yF + 0.84, yF + 0.86, b1, b0, brass, 0.003);
    const nw = 12, span = (b0 - b1) - 1.0; for (let i = 0; i < nw; i++) { const z = b1 + 0.5 + (i + 0.5) * span / nw; K.put(M.carWin, plane(0.6, 0.98), s * (HW + 0.012), yF + 1.38, z, 0, s * Math.PI / 2, 0); }
    K.box(M.paint, s * HW - 0.01, s * (HW + 0.03), yT - 0.38, yT - 0.06, b1, b0, trim, 0.01);
    K.put(letterMat(label, hexS(trim), '#f0d890'), plane(8.8, 0.26), s * (HW + 0.032), yT - 0.22, (b0 + b1) / 2, 0, s * Math.PI / 2, 0);
    K.put(letterMat(String(num), hexS(col), '#f0d890'), plane(0.5, 0.2), s * (HW + 0.004), yF + 0.45, b0 - 0.5, 0, s * Math.PI / 2, 0); }
  for (const [ze, d] of [[b0, 1], [b1, -1]]) { K.box(M.woodDark, -0.38, 0.38, yF, yF + 2.0, ze - 0.02 * d, ze + 0.03 * d, 0x5a3424, 0.02); K.put(M.carWin, plane(0.5, 0.75), 0, yF + 1.45, ze + 0.035 * d, 0, d > 0 ? 0 : Math.PI, 0); K.put(M.brass, sph(0.035, 8, 6), 0.28, yF + 1.0, ze + 0.04 * d); for (const s of [-1, 1]) K.put(M.carWin, plane(0.36, 0.6), s * 0.85, yF + 1.45, ze + 0.005 * d, 0, d > 0 ? 0 : Math.PI, 0); }
  // roof: lower deck + clerestory with small lights + upper deck, hooded over the end platforms
  K.put(M.paint, cyl(4.6, 4.6, CAR.len - 0.1, 48, false, -0.34, 0.68), 0, yT + 0.25 - 4.6 + 0.0, -CAR.len / 2, Math.PI / 2, 0, 0, 1, 1, 1, 0x4a3a36);
  K.box(M.paint, -0.78, 0.78, yT + 0.18, yT + 0.6, b1 + 0.2, b0 - 0.2, trim, 0.02); for (const s of [-1, 1]) for (let z = b1 + 0.6; z < b0 - 0.4; z += 0.9) K.box(M.paint, s * 0.785, s * 0.8, yT + 0.28, yT + 0.5, z, z + 0.45, 0xf2d8a0, 0.005);
  K.put(M.paint, cyl(3.2, 3.2, (b0 - b1) - 0.2, 40, false, -0.3, 0.6), 0, yT + 0.68 - 3.2, (b0 + b1) / 2, Math.PI / 2, 0, 0, 1, 1, 1, 0x4a3a36);
  // end platforms: floor, railings (gap in the middle), side steps, grab rails, buffer beam + link coupler
  for (const [pz0, pz1, d] of [[0, b0, 1], [b1, -CAR.len, -1]]) { const zm = (pz0 + pz1) / 2, zo = d > 0 ? -0.06 : -CAR.len + 0.06;
    K.box(M.wood, -1.3, 1.3, yF - 0.08, yF, Math.min(pz0, pz1), Math.max(pz0, pz1), 0x8a6a48, 0.01); K.box(M.paint, -1.3, 1.3, yF - 0.36, yF - 0.08, zo - 0.08, zo + 0.08, black, 0.02);
    for (const sx of [-1, 1]) { K.box(M.iron, sx * 1.22, sx * 1.27, yF, yF + 1.0, zo - 0.025, zo + 0.025, iron, 0.01); K.box(M.iron, sx * 0.42, sx * 0.47, yF, yF + 1.0, zo - 0.025, zo + 0.025, iron, 0.01);
      K.beam(M.iron, [sx * 0.44, yF + 1.0, zo], [sx * 1.25, yF + 1.0, zo], 0.03, iron, true, 6); K.beam(M.iron, [sx * 0.44, yF + 0.55, zo], [sx * 1.25, yF + 0.55, zo], 0.018, iron, true, 5);
      for (let k = 1; k < 4; k++) { const xx = sx * (0.44 + k * 0.2); K.beam(M.iron, [xx, yF, zo], [xx, yF + 1.0, zo], 0.012, iron, true, 4); }
      K.put(M.iron, tor(0.12, 0.012, 4, 12), sx * 0.85, yF + 0.77, zo, 0, 0, 0, 1, 1, 1, iron);
      // side steps (the hero detail): two treads hung under the platform corner, outer edge at stepOuterX
      const so = TRACK.stepOuterX, za = Math.min(pz0, pz1) + 0.06, zb = Math.max(pz0, pz1) - 0.06;
      for (const sz of [za, zb]) K.box(M.paint, sx * 0.98, sx * (so - 0.01), TRACK.stepTreadY[1] - 0.06, yF - 0.06, sz - 0.025, sz + 0.025, black, 0.008);
      for (const ty of TRACK.stepTreadY) K.box(M.wood, sx * 1.0, sx * so, ty - 0.04, ty, za, zb, 0x9a7a58, 0.01);
      for (const ty of TRACK.stepTreadY) K.box(M.brass, sx * (so - 0.03), sx * (so + 0.003), ty - 0.045, ty + 0.005, za, zb, 0xd8b060, 0.004);
      K.beam(M.brass, [sx * (HW + 0.05), yF + 0.15, b0 * (d > 0 ? 1 : 0) + (d > 0 ? 0 : b1) + 0.06 * d], [sx * (HW + 0.05), yF + 1.6, (d > 0 ? b0 : b1) + 0.06 * d], 0.018, brass, true, 6);
      K.beam(M.brass, [sx * 1.25, yF + 0.1, zo], [sx * 1.25, yF + 1.1, zo], 0.016, brass, true, 6); }
    K.box(M.iron, -0.1, 0.1, yF - 0.4, yF - 0.22, (d > 0 ? 0.2 : -CAR.len - 0.2) - 0.2, (d > 0 ? 0.2 : -CAR.len - 0.2) + 0.2, iron, 0.01);
    K.put(M.paint, cyl(0.36, 0.36, 0.06, 16), 0, yF + 0.08, zo, Math.PI / 2, 0, 0, 1, 1, 1, iron); }
  // truss rods + queen posts under the floor, trucks (arch-bar side frames)
  for (const s of [-0.9, 0.9]) { const qa = -4.3, qb = -10.7; K.beam(M.iron, [s, yF - 0.22, b0 - 0.4], [s, yF - 0.62, qa], 0.022, iron, true); K.beam(M.iron, [s, yF - 0.62, qa], [s, yF - 0.62, qb], 0.022, iron, true); K.beam(M.iron, [s, yF - 0.62, qb], [s, yF - 0.22, b1 + 0.4], 0.022, iron, true); for (const q of [qa, qb]) K.box(M.paint, s - 0.04, s + 0.04, yF - 0.64, yF - 0.2, q - 0.05, q + 0.05, black, 0.01); }
  for (const zc of CAR.truckZ) for (const s of [-1, 1]) { K.box(M.iron, s * 0.86, s * 0.95, 0.5, 0.62, zc - 1.05, zc + 1.05, black, 0.01); K.box(M.iron, s * 0.86, s * 0.95, 0.9, 1.0, zc - 0.95, zc + 0.95, black, 0.01); for (const dz of [-0.3, 0.3]) K.box(M.paint, s * 0.85, s * 0.96, 0.6, 0.92, zc + dz - 0.06, zc + dz + 0.06, black, 0.01); K.box(M.paint, -0.95, 0.95, 0.92, 1.12, zc - 0.15, zc + 0.15, black, 0.02); }
  K.build(g);
  const pf = [wheelPF(CAR.wR, 8, 0, -1, black), wheelPF(CAR.wR, 8, 0, 1, black)], W = [];
  for (const zc of CAR.truckZ) for (const dz of [-CAR.wb / 2, CAR.wb / 2]) for (const s of [-1, 1]) W.push(wheel(g, pf[(s + 1) / 2], s * 0.75, CAR.wR + RT, zc + dz));
  return { g, setPos: (z) => { for (const w of W) w.rotation.x = z / CAR.wR; } };
}

// ---------------------------------------------------------------- smoke + steam (3D puffs)
const SMOKE_N = 22, STEAM_N = 14;
function buildSmoke(root) {
  const geo = cached('puff', () => { const K = new Kit(); for (const [x, y, z, r] of [[0, 0, 0, 0.55], [0.38, 0.12, 0.1, 0.4], [-0.35, 0.1, -0.12, 0.42], [0.05, 0.36, -0.05, 0.38], [0.1, -0.12, 0.34, 0.33]]) K.put(M.paint, new THREE.IcosahedronGeometry(r, 1), x, y, z); return K.prefab()[0][1]; });
  const smoke = [], steam = []; for (let i = 0; i < SMOKE_N; i++) { const m = mesh(root, geo, i % 3 ? M.smoke : M.smokeDk, 0, -50, 0, i, i * 2, 0, false); m.receiveShadow = false; smoke.push(m); }
  for (let i = 0; i < STEAM_N; i++) { const m = mesh(root, geo, M.steam, 0, -50, 0, i, i * 3, 0, false); m.receiveShadow = false; steam.push(m); } return { smoke, steam };
}
// pure function of (train z, speed v, time t): puff list in jersey-local coords. kind 'smoke' (stack) | 'steam' (cylinder cocks)
export function puffList(z, v = 0, t = 0, o = {}) {
  const out = [], ks = o.smoke ?? 1, kst = o.steam ?? (v > 0.05 && v < 4 ? 1 : 0), life = 3.2, sl = 1.6;
  if (ks > 0) for (let i = 0; i < SMOKE_N; i++) { const age = ((t + i * life / SMOKE_N) % life + life) % life, a = age / life; const zb = z - v * age;
    let x = 0.4 * Math.sin(i * 2.3) * a * 3 + 1.2 * a * a, y = LOCO.stack[1] + 0.2 + 2.6 * Math.sqrt(age) + 0.6 * a, zz = zb + LOCO.stack[2] - 0.8 * age;
    if (zz > TRACK.shedOpenZ - 0.5 && y > EAVE - 0.6) { const ex = y - (EAVE - 0.6); y = EAVE - 0.6 + ex * 0.15; x += ex * 0.8 * Math.sin(i * 1.7); zz -= ex * 0.8; }
    const size = (0.45 + 1.7 * Math.sqrt(a)) * ks * (1 - Math.max(0, (a - 0.85) / 0.15) * 0.7);
    out.push({ kind: 'smoke', p: [x, y, zz], size, a }); }
  if (kst > 0) for (let i = 0; i < STEAM_N; i++) { const age = ((t * 1.3 + i * sl / STEAM_N) % sl + sl) % sl, a = age / sl, s = i % 2 ? 1 : -1, zb = z - v * age;
    const x = s * (LOCO.cylX + 0.3 + 1.6 * Math.sqrt(a)), y = 0.6 + 0.9 * a + 0.2 * Math.sin(i), zz = zb + LOCO.cylZ + 0.5 + 0.6 * a;
    out.push({ kind: 'steam', p: [s > 0 ? Math.min(x, PE - 0.05 + a * 0.4) : x, s > 0 && x > PE ? Math.min(y, PY - 0.05) + (x - PE) * 0.6 : y, zz], size: (0.3 + 1.0 * Math.sqrt(a)) * kst * (1 - a * a * 0.6), a }); }
  return out;
}

// ================================================================= DC 1881: Baltimore & Potomac waiting room
const DCW = { x0: -10, x1: 10, z0: -7, z1: 7, h: 9 };
function chandelier(K, x, y, z) {
  const br = 0xc8a050; K.beam(M.brass, [x, DCW.h, z], [x, y + 0.9, z], 0.03, br, true, 6); K.put(M.brass, sph(0.14, 10, 8), x, y + 0.9, z, 0, 0, 0, 1, 1.3, 1, br);
  K.put(M.brass, lathe('chb', [[0, 0], [0.18, 0.05], [0.12, 0.25], [0.06, 0.5], [0, 0.55]], 12), x, y + 0.1, z, 0, 0, 0, 1, 1, 1, br); K.put(M.brass, tor(0.62, 0.025, 5, 24), x, y + 0.3, z, Math.PI / 2, 0, 0, 1, 1, 1, br);
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3, ax = x + Math.cos(a) * 0.75, az = z + Math.sin(a) * 0.75; K.beam(M.brass, [x, y + 0.35, z], [ax, y + 0.25, az], 0.022, br, true, 5); K.beam(M.brass, [ax, y + 0.25, az], [ax, y + 0.5, az], 0.02, br, true, 5);
    K.put(M.brass, cyl(0.07, 0.04, 0.08, 8), ax, y + 0.52, az, 0, 0, 0, 1, 1, 1, br); K.put(M.glowSoft, lathe('globe', [[0.04, 0], [0.13, 0.08], [0.15, 0.18], [0.1, 0.3], [0.08, 0.32]], 12), ax, y + 0.54, az); K.put(M.glowWarm, sph(0.035, 6, 5), ax, y + 0.64, az); }
}
function dcBench(K, x, z, ry, L = 3.2) { K.at(x, 0, z, ry, () => { const iron = 0x2a2a30, wd = 0x7a4a2e;
  for (const sx of [-L / 2 + 0.1, L / 2 - 0.1]) { K.box(M.iron, sx - 0.04, sx + 0.04, 0, 0.92, -0.32, 0.32, iron, 0.02); K.put(M.iron, tor(0.16, 0.025, 4, 12, Math.PI), sx, 0.75, 0.0, 0, Math.PI / 2, 0, 1, 1, 1, iron); }
  for (const sd of [-1, 1]) { for (let k = 0; k < 4; k++) K.box(M.wood, -L / 2, L / 2, 0.43, 0.47, sd * (0.06 + k * 0.08), sd * (0.06 + k * 0.08) + sd * 0.06, wd, 0.008); for (let k = 0; k < 4; k++) K.box(M.wood, -L / 2, L / 2, 0.55 + k * 0.1, 0.62 + k * 0.1, sd * 0.03 - 0.02, sd * 0.03 + 0.02, wd, 0.008); }
  K.box(M.wood, -L / 2 - 0.05, L / 2 + 0.05, 0.95, 1.0, -0.06, 0.06, wd, 0.01); }); }
function buildDC(root) {
  const K = new Kit(), { x0, x1, z0, z1, h } = DCW, wd = 0x5a3424, plC = 0xffffff, cornice = 0xe8dcc0;
  K.box(M.tiles, x0, x1, -0.1, 0, z0, z1, 0xffffff, 0.005, 2.4);
  // walls with the window wall (z0) built around 4 arched openings
  const wins = [-7.2, -2.4, 2.4, 7.2], ww = 2.2, sill = 1.5, spring = 5.6, wt = 0.5;
  K.box(M.plaster, x0, x1, 0, sill, z0 - wt, z0, plC, 0.01, 3); K.box(M.plaster, x0, x1, spring + ww / 2 + 0.6, h, z0 - wt, z0, plC, 0.01, 3);
  let xp = x0; for (const wx of [...wins, x1 + ww / 2]) { const a = xp, b = Math.min(x1, wx - ww / 2); if (b > a) K.box(M.plaster, a, b, sill, spring + ww / 2 + 0.6, z0 - wt, z0, plC, 0.01, 3); xp = wx + ww / 2; }
  for (const wx of wins) { K.put(M.plaster, archPanel(ww, ww / 2 + 0.6, wt), wx, spring, z0 - wt, 0, 0, 0, 1, 1, 1, plC);
    // window: frame, mullions, transoms, fanlight radials, sill, glass
    const fr = 0x5a3a2a; K.box(M.paint, wx - ww / 2, wx + ww / 2, sill - 0.08, sill + 0.06, z0 - 0.1, z0 + 0.12, 0xd8c8a8, 0.02);
    for (const dx of [-ww / 2 + 0.06, -0.37, 0.37, ww / 2 - 0.06]) K.box(M.paint, wx + dx - 0.04, wx + dx + 0.04, sill, spring, z0 - 0.3, z0 - 0.22, fr, 0.008);
    for (let y = sill + 0.82; y < spring; y += 0.82) K.box(M.paint, wx - ww / 2, wx + ww / 2, y - 0.03, y + 0.03, z0 - 0.3, z0 - 0.22, fr, 0.008);
    K.box(M.paint, wx - ww / 2, wx + ww / 2, spring - 0.05, spring + 0.05, z0 - 0.3, z0 - 0.22, fr, 0.008);
    K.put(M.paint, tor(ww / 2 - 0.04, 0.045, 4, 24, Math.PI), wx, spring, z0 - 0.26, 0, 0, 0, 1, 1, 1, fr); K.put(M.paint, tor(0.35, 0.035, 4, 16, Math.PI), wx, spring, z0 - 0.26, 0, 0, 0, 1, 1, 1, fr);
    for (let k = 1; k < 6; k++) { const a = k * Math.PI / 6; K.beam(M.paint, [wx + Math.cos(a) * 0.35, spring + Math.sin(a) * 0.35, z0 - 0.26], [wx + Math.cos(a) * (ww / 2 - 0.05), spring + Math.sin(a) * (ww / 2 - 0.05), z0 - 0.26], 0.035, fr); }
    K.put(M.glassFx, plane(ww, spring - sill + ww / 2), wx, (sill + spring + ww / 2) / 2, z0 - 0.27);
    K.put(M.plaster, cached('archr', () => { const g = new THREE.TorusGeometry(ww / 2 + 0.12, 0.12, 4, 24, Math.PI); return g; }), wx, spring, z0 + 0.02, 0, 0, 0, 1, 1, 0.6, cornice); K.box(M.plaster, wx - 0.18, wx + 0.18, spring + ww / 2 + 0.02, spring + ww / 2 + 0.36, z0, z0 + 0.12, cornice, 0.02); }
  K.box(M.plaster, x0 - wt, x0, 0, h, z0 - wt, -1.4, plC, 0.01, 3); K.box(M.plaster, x0 - wt, x0, 0, h, 1.4, z1 + wt, plC, 0.01, 3); K.box(M.plaster, x0 - wt, x0, 3.8 + 1.4 + 0.6, h, -1.4, 1.4, plC, 0.01, 3); K.put(M.plaster, archPanel(2.8, 2.0, wt), x0 - wt, 3.8, 0, 0, Math.PI / 2, 0, 1, 1, 1, plC); K.box(M.plaster, x1, x1 + wt, 0, h, z0 - wt, z1 + wt, plC, 0.01, 3); K.box(M.plaster, x0, x1, 0, h, z1, z1 + wt, plC, 0.01, 3);
  K.box(M.plaster, x0 - wt, x1 + wt, h, h + 0.4, z0 - wt, z1 + wt, 0xf2e8d8, 0.01, 3);
  // coffered ceiling beams + cornice
  for (let x = x0 + 2.5; x < x1; x += 2.5) K.box(M.wood, x - 0.14, x + 0.14, h - 0.45, h, z0, z1, 0x8a5a3a, 0.02, 2); for (const z of [-3.5, 0, 3.5]) K.box(M.wood, x0, x1, h - 0.35, h, z - 0.12, z + 0.12, 0x8a5a3a, 0.02, 2);
  for (const [a, b, c, d] of [[x0, x1, z0, z0 + 0.3], [x0, x1, z1 - 0.3, z1], [x0, x0 + 0.3, z0, z1], [x1 - 0.3, x1, z0, z1]]) K.box(M.paint, a, b, h - 0.6, h - 0.3, c, d, cornice, 0.03);
  // wainscot + chair rail (all four walls), picture rail
  const wain = (a, b, c, d) => { K.box(M.woodDark, a, b, 0, 1.3, c, d, wd, 0.01, 1.2); };
  wain(x0, x1, z0, z0 + 0.06); wain(x0, x1, z1 - 0.06, z1); wain(x0, x0 + 0.06, z0, z1); wain(x1 - 0.06, x1, z0, z1);
  for (const [a, b, c, d] of [[x0, x1, z0, z0 + 0.1], [x0, x1, z1 - 0.1, z1], [x0, x0 + 0.1, z0, z1], [x1 - 0.1, x1, z0, z1]]) { K.box(M.wood, a, b, 1.28, 1.36, c, d, 0x8a5a3a, 0.01); K.box(M.wood, a, b, 0, 0.18, c, d, 0x3a2418, 0.01); K.box(M.paint, a, b, 6.85, 6.92, c, d, 0xc8a050, 0.005); }
  for (let x = x0 + 0.6; x < x1 - 0.3; x += 1.1) { if (wins.some((w) => Math.abs(w - x) < 0.01)) continue; K.box(M.wood, x, x + 0.8, 0.3, 1.15, z0 + 0.06, z0 + 0.09, 0x6a4430, 0.01); }
  // doorway to the trains (x0 wall): arch, panelled doors open, the platform beyond
  const dz = 0, dw = 2.8, dh = 3.8;
  K.put(M.doorView, plane(dw, dh + dw / 2), x0 - 0.42, (dh + dw / 2) / 2, dz, 0, Math.PI / 2, 0);
  K.box(M.woodDark, x0 + 0.0, x0 + 0.14, 0, dh, dz - dw / 2 - 0.2, dz - dw / 2, wd, 0.02); K.box(M.woodDark, x0, x0 + 0.14, 0, dh, dz + dw / 2, dz + dw / 2 + 0.2, wd, 0.02);
  K.put(M.woodDark, tor(dw / 2 + 0.1, 0.1, 4, 24, Math.PI), x0 + 0.07, dh, dz, 0, Math.PI / 2, 0, 1, 1, 1, wd);
  for (const s of [-1, 1]) K.at(x0 + 0.06, 0, dz + s * (dw / 2 + 0.05), s * 1.25, () => { K.box(M.woodDark, 0, 0.06, 0.05, dh - 0.05, -s * 1.3, 0, 0x6a3e2a, 0.02); for (const y of [0.4, 2.0]) K.box(M.woodDark, 0.06, 0.09, y, y + 1.3, -s * 1.15, -s * 0.15, 0x7a4a32, 0.01); });
  // cut the wall: draw it as boxes around the opening (the main x0 wall box above is replaced visually by the doorway plane sitting behind)
  sign(K, 'TO TRAINS', '#1f2a40', '#f2d890', 2.6, 0.55, x0 + 0.08, dh + dw / 2 + 0.55, dz, Math.PI / 2, { fs: 0.6 });
  sign(K, 'BALTIMORE & POTOMAC R.R.', '#1f3a2c', '#f2e2b0', 9.0, 0.9, x0 + 0.08, 7.75, dz, Math.PI / 2, { fs: 0.62 });
  // ticket window (x1 wall): moulded surround, counter, brass grille, TICKETS sign; a second doorway to the ladies' room
  const tz = -2.2; K.box(M.woodDark, x1 - 0.25, x1, 0, 1.1, tz - 1.6, tz + 1.6, wd, 0.02, 1.2); K.box(M.wood, x1 - 0.55, x1, 1.1, 1.18, tz - 1.7, tz + 1.7, 0x8a5a3a, 0.01);
  K.box(M.woodDark, x1 - 0.12, x1, 1.18, 3.6, tz - 1.6, tz - 0.8, wd, 0.02); K.box(M.woodDark, x1 - 0.12, x1, 1.18, 3.6, tz + 0.8, tz + 1.6, wd, 0.02); K.box(M.woodDark, x1 - 0.12, x1, 2.6, 3.8, tz - 1.6, tz + 1.6, wd, 0.02);
  K.put(M.open.ticket, plane(1.6, 1.42), x1 - 0.02, 1.89, tz, 0, -Math.PI / 2, 0);
  for (let z = tz - 0.75; z <= tz + 0.76; z += 0.1) K.beam(M.brass, [x1 - 0.14, 1.32, z], [x1 - 0.14, 2.58, z], 0.008, 0xc8a050, true, 4); K.box(M.brass, x1 - 0.16, x1 - 0.12, 1.3, 1.34, tz - 0.8, tz + 0.8, 0xc8a050, 0.005); K.box(M.brass, x1 - 0.16, x1 - 0.12, 2.56, 2.6, tz - 0.8, tz + 0.8, 0xc8a050, 0.005);
  sign(K, 'TICKETS', '#2a2a44', '#f2d890', 2.4, 0.55, x1 - 0.13, 4.2, tz, -Math.PI / 2, { fs: 0.62 });
  K.put(M.open.door, plane(2.0, 3.6), x1 - 0.02, 1.8, 3.6, 0, -Math.PI / 2, 0); sign(K, "LADIES' WAITING ROOM", '#4a1e2a', '#f2e2b0', 3.6, 0.5, x1 - 0.13, 4.0, 3.6, -Math.PI / 2, { fs: 0.6 });
  sign(K, 'WAITING ROOM', '#1f3a2c', '#f2e2b0', 7.0, 0.9, 0, 7.8, z0 + 0.08, 0, { fs: 0.62 });
  // clock over the doorway side, chandeliers, benches, stove, spittoons
  K.put(M.woodDark, cyl(0.62, 0.62, 0.14, 32), x1 - 0.08, 5.6, 0.9, 0, 0, Math.PI / 2, 1, 1, 1, wd); K.put(M.clock, cached('clockd', () => new THREE.CircleGeometry(0.56, 40)), x1 - 0.16, 5.6, 0.9, 0, -Math.PI / 2, 0);
  chandelier(K, -4.5, 5.2, 0); chandelier(K, 4.5, 5.2, 0); chandelier(K, 0, 5.4, 0);
  for (const z of [-3.6, -0.9, 1.8]) for (const x of [-5.6, -1.6, 2.4]) dcBench(K, x, z, 0);
  K.at(-3.5, 0, 5.6, 0, () => { K.put(M.iron, cyl(0.38, 0.42, 0.9, 16), 0, 0.75, 0, 0, 0, 0, 1, 1, 1, 0x2a2a30); K.put(M.iron, sph(0.42, 16, 10), 0, 1.25, 0, 0, 0, 0, 1, 0.6, 1, 0x2a2a30); K.put(M.iron, cyl(0.1, 0.1, 7.6, 10), 0, 5.2, 0, 0, 0, 0, 1, 1, 1, 0x2a2a30); for (let k = 0; k < 3; k++) K.beam(M.iron, [0, 0.3, 0], [Math.cos(k * 2.1) * 0.4, 0, Math.sin(k * 2.1) * 0.4], 0.04, 0x2a2a30); K.put(M.brass, tor(0.42, 0.03, 5, 20), 0, 0.95, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0xc8a050); });
  for (const [x, z] of [[-3.6, -2.3], [0.4, 0.5], [4.4, -2.3]]) K.put(M.brass, lathe('spit', [[0, 0], [0.16, 0], [0.18, 0.08], [0.12, 0.16], [0.14, 0.22], [0.0, 0.22]], 14), x, 0, z, 0, 0, 0, 1, 1, 1, 0xc8a050);
  buildK(K, root, 0);
}

// ================================================================= lights, grades, views
const SET_LIGHT = {
  jersey: { top: '#5e86d0', hor: '#d8e0f0', fog: '#cfc6c4', fogN: 35, fogF: 230, sky: '#a8b8ea', ground: '#5e4e62', hemiI: 0.78, fillCol: '#8a96e0', fillI: 0.42, sunCol: '#ffe2b4', sunI: 3.4, az: 72, el: 50, disc: '#fffbe8', discSize: 0.002, cloud: '#ffffff', cardTint: '#fff4e8', fxTint: '#f4f0ea', shafts: 0.4 },
  dc1881: { top: '#8aa6dc', hor: '#f4e6cc', fog: '#d8c4a8', fogN: 20, fogF: 120, sky: '#ffe2bc', ground: '#5a3a30', hemiI: 0.95, fillCol: '#8a90c8', fillI: 0.28, sunCol: '#ffdcac', sunI: 3.0, az: 165, el: 30, disc: '#fff0d0', discSize: 0.002, clouds: false, shadow: true, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0.5, practI: 0 },
};
const SET_GRADE = {
  jersey: { look: 'stadium', over: { exp: 1.2, lift: [0.075, 0.06, 0.075], tH: ['#ffe0b8', 0.05], bloom: [0.36, 0.86], hal: [0.14, '#ff8a50'], vig: [0.24, 0.5, '#5a4a6a'] } },
  dc1881: { look: 'office', over: { exp: 1.32, con: 1.16, lift: [0.075, 0.06, 0.065], tH: ['#ffd8b0', 0.04], bloom: [0.4, 0.84], hal: [0.18, '#ff8a50'], vig: [0.3, 0.46, '#4a3a4a'] } },
};
const SET_PRACT = { dc1881: [{ p: [-4.5, 5.6, 0], col: '#ffc890', I: 2.2, d: 7 }, { p: [4.5, 5.6, 0], col: '#ffc890', I: 2.2, d: 7 }, { p: [9.0, 2.2, -2.2], col: '#ffb060', I: 1.6, d: 4 }, { p: [0, 3.0, 5.0], col: '#d8e0ff', I: 1.2, d: 9 }] };

export function buildStation(ctx) {
  ({ THREE, toon, mkTex, PT } = ctx); M = materials(); LAMPS.length = 0;
  const groups = {};
  for (const name of ['jersey', 'dc1881']) { const g = new THREE.Group(); g.name = 'station_' + name; g.position.set(...O[name]); g.visible = false; ctx.scene.add(g); groups[name] = g; }
  buildShed(groups.jersey); buildDC(groups.dc1881);
  // the train: loco (+ tender) then 3 cars; group z = locomotive pilot tip
  const train = new THREE.Group(); train.name = 'station_train'; groups.jersey.add(train);
  const loco = buildLoco(); train.add(loco.g);
  const cars = [[0x7a2a22, 'NEW JERSEY RAIL ROAD', 14], [0xb8862e, 'NEW JERSEY RAIL ROAD', 22], [0x2e4a3a, 'NEW JERSEY RAIL ROAD', 9]].map(([c, l, n], i) => { const car = buildCar(c, l, n); car.g.position.z = -TRACK.locoLen - 0.4 - i * (TRACK.carLen + 0.4); train.add(car.g); return car; });
  const sm = buildSmoke(groups.jersey);
  if (ctx.NOND) for (const k in groups) groups[k].traverse((o) => { if (o.isMesh && o.material === M.glassFx) { ctx.NOND.add(o); o.castShadow = o.receiveShadow = false; } });
  const state = { z: 20, v: 0, t: 0, smoke: 1, steam: 0 };
  const carZ = (i) => state.z - TRACK.locoLen - 0.4 - i * (TRACK.carLen + 0.4); // car i front coupler face (jersey local)
  // ---- key spots (world coords)
  const spots = {
    jerseyOrigin: W3('jersey', [0, 0, 0]), platformY: PY, platformEdgeX: O.jersey[0] + PE, trackX: O.jersey[0], railTopY: RT,
    platformWalk: 'x ' + (O.jersey[0] + PE + 0.3).toFixed(2) + '..' + (O.jersey[0] + 9.6) + ', z -60..50, y ' + PY,
    crowdFront: W3('jersey', [3.0, PY, 0]), edge: (z) => W3('jersey', [PE + 0.2, PY, z]), clock: W3('jersey', [4.8, 4.6, 6]), ticketWindow: W3('jersey', [SX1 - 0.6, PY, TRUSS_Z[10] + 3]),
    jerseySign: W3('jersey', [6.0, 5.3, -24]), bench: W3('jersey', [SX1 - 0.45, PY + 0.45, -8]), shedOpening: W3('jersey', [0, 0, -66]), bufferStop: W3('jersey', [0, 0, TRACK.bufferZ]), ferryDoor: W3('jersey', [6.0, PY, 55.4]),
    dcOrigin: W3('dc1881', [0, 0, 0]), dcTicket: W3('dc1881', [8.9, 0, -2.2]), dcDoorToTrains: W3('dc1881', [-9.6, 0, 0]), dcLadiesDoor: W3('dc1881', [9.6, 0, 3.6]), dcBenches: [-5.6, -1.6, 2.4].flatMap((x) => [-3.6, -0.9, 1.8].map((z) => W3('dc1881', [x, 0.45, z]))), dcAisle: W3('dc1881', [0.4, 0, 3.4]), dcWindow: W3('dc1881', [2.4, 1.5, -6.8]),
  };
  // the hero gap: between the platform edge and the car steps (world coords; z of each step from stepsAt())
  const gap = { x0: O.jersey[0] + TRACK.stepOuterX, x1: O.jersey[0] + PE, width: PE - TRACK.stepOuterX, platformY: PY, stepY: TRACK.stepTreadY.slice(), carFloorY: TRACK.carFloorY, bodyX: O.jersey[0] + TRACK.carHalfW, groundY: 0.08, railTopY: RT };
  const stepsAt = () => { const out = []; for (let i = 0; i < 3; i++) { const z0 = carZ(i); out.push({ car: i, end: 'front', z: O.jersey[2] + z0 - 0.45, x: gap.x0, y: TRACK.stepTreadY }, { car: i, end: 'rear', z: O.jersey[2] + z0 - CAR.len + 0.45, x: gap.x0, y: TRACK.stepTreadY }); } return out; };
  const V = (set, p, l, fov, cInf, fp, extra = {}) => { const c = { set, p: W3(set, p), l: W3(set, l), fov, cInf, fp: fp ? W3(set, fp) : null, ...extra }; c.focus = Math.hypot(...[0, 1, 2].map((i) => c.p[i] - (c.fp || c.l)[i])); return c; };
  const views = [
    V('jersey', [2.2, 2.25, 25.5], [0.0, 2.3, -10], 50, 1.5, [0.5, 2.0, 12], { train: { z: 14, v: 3.5, t: 1.0 }, crowd: 16 }),                    // 0 platform wide, train arriving
    V('jersey', [2.3, 1.18, 3.4], [1.25, 0.8, -0.4], 48, 4, [1.45, 0.85, -0.3], { train: { z: 29.3, v: 1.4, t: 2.0 }, crowd: 'gap' }),         // 1 low close-up: the gap (platform edge / moving car steps)
    V('jersey', [4.4, 2.0, -59.5], [-1.3, 2.9, -71.0], 52, 2, [0.8, 2.4, -66.5], { train: { z: -63.5, v: 3.0, t: 3.2, steam: 1 } }),               // 2 locomotive three-quarter with smoke, at the shed opening
    V('dc1881', [8.6, 1.8, 6.0], [-10, 4.2, -1.2], 66, 1.5, [-1.5, 1.4, -1.0]),                                                              // 3 the 1881 waiting room
    V('jersey', [2.45, 2.15, 1.9], [1.5, 0.35, -0.5], 50, 4, [1.55, 0.6, -0.4], { train: { z: 29.3, v: 1.4, t: 2.0 }, crowd: 'gap' }),            // 4 looking down into the gap
    V('jersey', [3.2, 2.0, -2.0], [7.0, 2.4, 40], 50, 1.5, [5.0, 1.6, 12], { train: { z: 46, v: 0, t: 0.5, smoke: 0.4 }, crowd: 16 }),          // 5 reverse: platform toward the ferry end, train standing
    V('dc1881', [-6.8, 1.6, 4.6], [9.0, 2.2, -2.5], 52, 2, [8.0, 1.8, -2.2]),                                                                  // 6 waiting room toward the ticket window
    V('jersey', [-3.4, 1.35, 27.5], [0.6, 2.4, 16.0], 46, 2, [0.5, 2.2, 17.0], { train: { z: 19, v: 2.0, t: 4.0, steam: 1 } }),                 // 7 loco front three-quarter inside the shed (track side)
    V('jersey', [5.2, 1.75, -0.3], [0, 1.0, -0.3], 44, 0, null, { train: { z: 29.3, v: 0, t: 2.0, smoke: 0 } }),                           // 8 technical: car junction side elevation (steps, gap, platform edge)
  ];
  const API = {
    groups, jersey: groups.jersey, dc1881: groups.dc1881, origin: O, TRACK, spots, views, gap, stepsAt, train, loco, cars,
    // move the train: z = locomotive pilot tip (jersey-local z; world z is the same since the origin z = 0). Wheels + rods follow z.
    setTrainPos(z) { state.z = z; train.position.z = z; loco.setPos(z); cars.forEach((c) => c.setPos(z)); API.setSmoke(state.t, state.v); },
    // full per-frame state: z (pilot tip), v (m/s, for smoke trail), t (seconds, puff phase), smoke / steam amounts 0..1
    setTrain(z, o = {}) { Object.assign(state, { v: o.v ?? 0, t: o.t ?? 0, smoke: o.smoke ?? 1, steam: o.steam ?? (o.v > 0.05 && o.v < 4 ? 1 : 0) }); API.setTrainPos(z); },
    setSmoke(t, v) { state.t = t; state.v = v; const L = puffList(state.z, v, t, state); let si = 0, ti = 0;
      for (const p of L) { const m = p.kind === 'smoke' ? sm.smoke[si++] : sm.steam[ti++]; m.position.set(...p.p); m.scale.setScalar(Math.max(0.001, p.size)); m.visible = p.size > 0.02; }
      for (; si < SMOKE_N; si++) sm.smoke[si].visible = false; for (; ti < STEAM_N; ti++) sm.steam[ti].visible = false; },
    // timeline FX emitter: 2D 'puff' cards (main.js FX) for the same smoke/steam, world coords. o: { z, v, fps = 30, smoke, steam }
    smokeAt(f, o = {}) { const fps = o.fps || 30, t = f / fps, z = o.z ?? state.z; return puffList(z, o.v ?? 0, t, o).filter((p) => p.size > 0.05).map((p) => ({ fx: 'puff', t: p.a, pos: W3('jersey', p.p), size: p.size * 2.2, tint: p.kind === 'smoke' ? '#b8b0bc' : '#f6f2ec' })); },
    // arrival easing helper: z at time t for a train braking from v0 to a stop at stopZ over T seconds
    arriveZ: (t, T = 12, stopZ = TRACK.stopZ, v0 = 6) => { const u = Math.max(0, Math.min(1, t / T)); return stopZ - v0 * T / 2 * (1 - u) ** 2; },
    lightFor: (name) => ({ ...LIGHTS_[name === 'dc1881' ? 'office' : 'day'], ...SET_LIGHT[name] }),
    gradeFor: (name) => (SET_GRADE[name] || {}).over || {}, lookFor: (name) => (SET_GRADE[name] || {}).look || 'office',
    show(world, name) { for (const k in groups) groups[k].visible = k === name;
      if (name) { for (const k of ['road', 'stadium', 'office', 'car', 'dc']) if (world[k]) world[k].visible = false; if (world.rooms) world.rooms.show(world, null); if (world.louvre) world.louvre.show(world, null); if (world.paris) world.paris.show(world, null); }
      if (SI) SI.g.visible = false; },
    // drive main.js' 4 pooled PointLights: jersey = the 3 gas lamps nearest the target + a warm platform key; dc1881 = fixed list
    placeLights(PRACT, name, tgt) { let L;
      if (name === 'jersey') { const t = tgt ? [tgt.x - O.jersey[0], tgt.z - O.jersey[2]] : [4, 0]; L = LAMPS.map((p) => ({ p: [p[0], p[1] - 0.1, p[2]], col: '#ffbe6a', I: 3.0, d: 7 })).sort((a, b) => Math.hypot(a.p[0] - t[0], a.p[2] - t[1]) - Math.hypot(b.p[0] - t[0], b.p[2] - t[1])).slice(0, 3); L.push({ p: [PE + 0.15, 1.35, t[1] + 1.2], col: '#ffd0a0', I: 2.6, d: 4.5 }); }
      else L = SET_PRACT[name] || [];
      PRACT.forEach((l, i) => { const c = L[i]; l.visible = true; if (!c) { l.intensity = 0; return; } l.position.set(...W3(name, c.p)); l.color.set(c.col); l.intensity = c.I; l.distance = c.d; l.decay = 1.6; }); },
    // test-view helper (main.js ?stationview=N): returns { set, L, look, grade, cam, mod }
    viewFor(i) { const k = ((i % views.length) + views.length) % views.length, c = views[k]; return { i: k, mod: API, set: c.set, train: c.train, crowd: c.crowd, L: API.lightFor(c.set), look: API.lookFor(c.set), grade: API.gradeFor(c.set), cam: { p: c.p, l: c.l, fov: c.fov, focus: c.focus, cInf: c.cInf, roll: c.roll || 0, shadowAt: c.fp || c.l } }; },
    view(i) { return API.viewFor(i); },
    apply(world, v) { API.show(world, v.set); const dbg = (location.search.match(/stdbg=(\w+)/) || [])[1]; if (dbg) for (const k in groups) groups[k].traverse((o) => { if (o.name === dbg) o.visible = false; }); if (v.train) API.setTrain(v.train.z, v.train); standIns(API, v); },
  };
  API.setTrain(state.z, {}); globalThis.__station = API;
  return API;
}

// ---------------------------------------------------------------- test stand-ins (Oddverra cards for scale/crowd in ?stationview stills only)
let SI = null;
function standIns(API, v) {
  if (!SI) { SI = { g: new THREE.Group(), cards: [] }; SI.g.name = 'station_standins'; API.jersey.add(SI.g);
    const geo = new THREE.PlaneGeometry(1.35, 2.25); geo.translate(0, 1.069, 0);
    const mk = (o, op) => { const cv = document.createElement('canvas'); cv.width = 600; cv.height = 1000; oddverra(cv.getContext('2d'), o, op); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: 0.8, color: new THREE.Color(0xffffff).multiplyScalar(0.4), alphaTest: 0.5, side: THREE.DoubleSide })); m.castShadow = true; SI.g.add(m); return m; };
    const sk = ['#f2c9a4', '#e0b088', '#c98a5e', '#f6d0b0'];
    for (let i = 0; i < 18; i++) SI.cards.push(mk(i % 3 === 1 ? { shirt: ['#5a3a5a', '#2f4a6a', '#6a2a2a', '#3a4a3a'][i % 4], pants: '#3a3040', hair: ['bun', 'long', 'curly'][i % 3], hairCol: ['#4a2a1a', '#2a1a12', '#8a5a2a'][i % 3], lashes: true, head: 'egg', skin: sk[i % 4], neck: 'bow' }
      : { pattern: ['tweed', 'pinstripe', undefined][i % 3], shirt: ['#2a2a34', '#4a3a2a', '#2a3a4a', '#3a2a2a'][i % 4], pants: '#2f2f3a', hat: ['top', 'bowler', 'top', 'cap'][i % 4], hair: 'short', hairCol: '#3a2a20', moustache: i % 4 === 0 ? '#3a2a20' : undefined, skin: sk[(i + 1) % 4], head: ['round', 'wide'][i % 2], neck: 'tie' }, { expr: ['smile', 'shock', 'nervous', 'happy'][i % 4], t: i * 5 })); }
  SI.g.visible = !!v.crowd; for (const m of SI.cards) m.visible = false; if (!v.crowd) return;
  const cp = v.cam.p, face = (m, p) => { m.position.set(...p); m.rotation.set(0, Math.atan2(cp[0] - O.jersey[0] - p[0], cp[2] - O.jersey[2] - p[2]), 0); m.visible = true; };
  const R = PT.rng(7);
  if (v.crowd === 'gap') { face(SI.cards[0], [PE + 0.45, PY, -2.6]); face(SI.cards[1], [PE + 1.3, PY, -3.6]); face(SI.cards[2], [PE + 2.1, PY, -5.2]); face(SI.cards[3], [PE + 0.9, PY, -6.4]); return; }
  const zc = v.cam.l[2] - O.jersey[2] > v.cam.p[2] - O.jersey[2] ? 1 : -1;
  for (let i = 0; i < Math.min(v.crowd, SI.cards.length); i++) { const z = v.cam.p[2] - O.jersey[2] + zc * (4 + i * 1.6 + R() * 1.2), x = PE + 1.4 + R() * 5.2; face(SI.cards[i], [x, PY, z]); }
}
