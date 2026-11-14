// lb_sets.js [LB-sets]: sets for "Lamborghini started as a tractor maker" (Oddverra short). Generic stylised cars and tractors only:
// no badges, no bull, no prancing horse; names appear only as plain text on signs.
//   farm    : Emilian farmyard, 1948: ochre casa colonica with terracotta roof, brick tractor shed (plain-text sign), a pile of olive army
//             surplus (crates, jerry cans, wheels, a cut-down truck), a red tractor that assembles itself (setBuild 0..1), poplars,
//             wheat and vine rows, two finished tractors in the field (driveTractors), a red GT coupe by the house (setGT).
//             Moods 'farm' (noon), 'farmField', 'farmGold' (golden payoff: old tractor + orange supercar side by side).  origin (-64000,0,0)
//   shop    : the tractor works at night: brick walls, pegboard, workbench with two clutch discs + tags, the red GT on the floor,
//             a tractor in the back, hanging lamp. Moods 'shopNight', 'shopBench'.                                           origin (-64000,0,800)
//   office  : generic 1960s Modena-area office: wood panels, desk, phone, trophies, race-car photos, window on factory roofs.
//             Mood 'office'.                                                                                              origin (-64000,0,1600)
//   factory : 1963 car factory hall: sawtooth skylights, columns, a line of silver 2+2 GTs, engine stand, plain-text wall sign.
//             Moods 'factory', 'factoryGT'.                                                                               origin (-66500,0,0)
//   show    : motor-show stand: turntable, spotlights, rope barrier, backdrop. Holds the orange mid-engine supercar or, for the twist,
//             a covered modern tractor (setCover 0..1 lifts the sheet). Moods 'showHook', 'show66', 'showNow'.          origin (-66500,0,800)
// Each set: local frame, floor y = 0, camera side +z. Test flag ?lbview=N (main.js).
import { H, TAU, clamp01, sm, SERIF, SANS, cyl, sph, plane, planeUV, lathe, mesh, nond, lumpGeo, shapeGeo, txt, grain, scrib, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';

export const LB_ORIGIN = { farm: [-64000, 0, 0], shop: [-64000, 0, 800], office: [-64000, 0, 1600], factory: [-66500, 0, 0], show: [-66500, 0, 800] };
const GROUP_OF = { farm: 'farm', farmField: 'farm', farmGold: 'farm', shopNight: 'shop', shopBench: 'shop', office: 'office', factory: 'factory', factoryGT: 'factory', showHook: 'show', show66: 'show', showNow: 'show' };
let THREE, PT, M;
export const lf = (x, z) => sm(-38, -110, z) * (5 + 3 * Math.sin(x * 0.03 + 1)) + sm(30, 90, Math.abs(x)) * 2;

// ---------------------------------------------------------------- painters
const css = (r, g, b, a = 1) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 6, 2, 3, 7)); g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08);
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : 0.34 + i * 0.36), w * 0.86, h * (lines.length === 1 ? 0.52 : 0.3), { col: o.col || '#3a2414', font: o.font || SERIF })); }; }
function stencilTex(s, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#5a6236'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.82 + 0.3 * PT.fbm(u, v, 4, 4, 3, o.seed || 3));
  g.strokeStyle = 'rgba(30,30,20,0.5)'; g.lineWidth = 6; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(0, h * i / 4); g.lineTo(w, h * i / 4); g.stroke(); }
  txt(g, s, w / 2, h * 0.52, w * 0.8, h * 0.28, { col: o.col || '#e8e0c0', font: SANS }); grain(g, w, h, 'rgba(30,30,20,1)', 500, o.seed || 3, 0.3); }; }
function tagTex(s, col) { return (g, w, h) => { g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 5)); g.fillStyle = '#2b1d4a'; g.beginPath(); g.arc(w * 0.1, h / 2, h * 0.12, 0, TAU); g.fill();
  txt(g, s, w * 0.56, h * 0.54, w * 0.74, h * 0.5, { col: col || '#2b1d4a', font: SANS }); }; }
function plasterTex(g, w, h) { g.fillStyle = '#e0a860'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.2 * PT.fbm(u, v, 4, 4, 3, 5)); grain(g, w, h, 'rgba(120,70,30,1)', 600, 4, 0.2); }
function rooftileTex(g, w, h) { const n = 10; g.fillStyle = '#a8482a'; g.fillRect(0, 0, w, h); for (let i = 0; i < n; i++) { const x = i * w / n, gr = g.createLinearGradient(x, 0, x + w / n, 0); gr.addColorStop(0, '#7a2e1c'); gr.addColorStop(0.5, '#c8603a'); gr.addColorStop(1, '#7a2e1c'); g.fillStyle = gr; g.fillRect(x, 0, w / n, h); }
  g.fillStyle = 'rgba(60,20,10,0.35)'; for (let y = 0; y < h; y += h / 8) g.fillRect(0, y, w, 3); PT.modulate(g, w, h, (u, v) => 0.85 + 0.25 * PT.fbm(u, v, 4, 4, 3, 9)); }
function panelTex(g, w, h) { g.fillStyle = '#6a3a22'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { const x = i * w / 4; g.fillStyle = 'rgba(40,20,10,0.6)'; g.fillRect(x, 0, 6, h); g.strokeStyle = 'rgba(160,100,60,0.5)'; g.lineWidth = 3; g.strokeRect(x + 22, 30, w / 4 - 44, h - 60); }
  PT.modulate(g, w, h, (u, v) => 0.85 + 0.25 * PT.fbm(u, v, 2, 12, 3, 4)); }
function viewTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6a9ae0'); gr.addColorStop(0.7, '#d8e4f0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#9aa0b0'; g.fillRect(0, h * 0.62, w, h * 0.38); for (let i = 0; i < 9; i++) { const x = i * w / 8 - 20; g.fillStyle = i % 2 ? '#e8e0d0' : '#d8ccb8'; g.beginPath(); g.moveTo(x, h * 0.66); for (let k = 0; k < 3; k++) { g.lineTo(x + k * 30 + 20, h * 0.56); g.lineTo(x + k * 30 + 30, h * 0.66); } g.lineTo(x + 100, h * 0.8); g.lineTo(x, h * 0.8); g.fill(); }
  g.fillStyle = '#c8b8a0'; g.fillRect(w * 0.7, h * 0.3, 18, h * 0.4); g.fillStyle = '#5a7a3a'; for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(i * w / 13, h * 0.8, 30, 14, 0, 0, TAU); g.fill(); } }
function photoTex(col, o = {}) { return (g, w, h) => { g.fillStyle = '#e8e0cc'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a5a6a'; g.fillRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84); const gr = g.createLinearGradient(0, h * 0.08, 0, h * 0.92); gr.addColorStop(0, '#a8b8d0'); gr.addColorStop(1, '#6a6a6a'); g.fillStyle = gr; g.fillRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84);
  // a generic open-wheel racer side view
  const y = h * 0.66; g.fillStyle = col; g.beginPath(); g.moveTo(w * 0.15, y); g.quadraticCurveTo(w * 0.2, y - h * 0.16, w * 0.45, y - h * 0.15); g.lineTo(w * 0.86, y - h * 0.05); g.lineTo(w * 0.86, y + h * 0.02); g.lineTo(w * 0.15, y + h * 0.02); g.fill();
  g.fillStyle = '#1a1a22'; for (const x of [0.28, 0.74]) { g.beginPath(); g.arc(w * x, y + h * 0.02, h * 0.1, 0, TAU); g.fill(); } g.fillStyle = '#f2ece0'; g.beginPath(); g.arc(w * 0.55, y - h * 0.06, h * 0.05, 0, TAU); g.fill();
  if (o.num) txt(g, o.num, w * 0.55, y - h * 0.06, h * 0.08, h * 0.07, { col: '#1a1a22', font: SANS }); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, 3)); g.strokeStyle = '#2a1a10'; g.lineWidth = w * 0.06; g.strokeRect(0, 0, w, h); }; }
function backTex(o) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.a); gr.addColorStop(1, o.b); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  if (o.lines) { for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(255,255,255,${0.04 + 0.03 * (i % 2)})`; g.fillRect(i * w / 14, 0, w / 28, h); } txt(g, o.lines[0], w / 2, h * 0.3, w * (o.tw || 0.7), h * 0.1, { col: o.col, font: o.font || SERIF }); if (o.lines[1]) txt(g, o.lines[1], w / 2, h * 0.42, w * (o.tw || 0.4) * 1.3, h * 0.08, { col: o.col2 || o.col, font: o.font || SERIF }); }
  if (o.led) { for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(160,200,255,0.5)'; g.fillRect(0, h * (0.2 + i * 0.22), w, 6); } } PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, 2)); }; }
function calTex(g, w, h) { g.fillStyle = '#f2ece0'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8402a'; g.fillRect(0, 0, w, h * 0.22); txt(g, '1963', w / 2, h * 0.11, w * 0.6, h * 0.14, { col: '#fff', font: SANS }); g.strokeStyle = 'rgba(40,30,30,0.6)'; g.lineWidth = 2; for (let i = 0; i <= 7; i++) { g.beginPath(); g.moveTo(i * w / 7, h * 0.3); g.lineTo(i * w / 7, h * 0.95); g.stroke(); } for (let j = 0; j <= 5; j++) { g.beginPath(); g.moveTo(0, h * (0.3 + j * 0.13)); g.lineTo(w, h * (0.3 + j * 0.13)); g.stroke(); } }
function pegTex(g, w, h) { g.fillStyle = '#b89a70'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(60,40,20,0.6)'; for (let y = 10; y < h; y += 22) for (let x = 10; x < w; x += 22) { g.beginPath(); g.arc(x, y, 2.6, 0, TAU); g.fill(); } }
function floorTex(o) { return (g, w, h) => { g.fillStyle = o.base; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.85 + 0.25 * PT.fbm(u, v, 6, 6, 4, o.seed || 3)); if (o.stain) { const R = PT.rng(o.seed || 3); for (let i = 0; i < 18; i++) { g.fillStyle = 'rgba(30,20,20,0.18)'; g.beginPath(); g.ellipse(R() * w, R() * h, 10 + R() * 40, 6 + R() * 20, R() * 3, 0, TAU); g.fill(); } }
  if (o.grid) { g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); } } }; }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.ground = vc(); if (H.MACRO) H.MACRO(m.ground, 0.2, 0.06);
  m.plaster = vc({ map: T(256, 256, plasterTex) }); m.roof = vc({ map: T(256, 256, rooftileTex) }); m.brick = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#a85a3a', rows: 16, cols: 6, seed: 7 })) });
  m.plank = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 8, seed: 51 })) }); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.leaf = vc();
  m.olive = vc({ map: T(256, 256, stencilTex('SURPLUS', { seed: 4 })) }); m.oliveP = vc(); m.crate2 = vc({ map: T(256, 256, stencilTex('PARTS', { seed: 8, bg: '#646a3c' })) });
  m.body = vc({ emissive: 0x0c0608 }); m.glass = vc({ emissive: 0x060a18 }); m.tire = vc({ emissive: 0x040406 }); m.chrome = vc({ emissive: 0x2a2a32 }); m.lens = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2d0).multiplyScalar(1.15), fog: true });
  m.redLens = toon({ color: 0xd0302a, emissive: 0x401010 });
  m.shopSign = em(T(1024, 180, signTex(['LAMBORGHINI TRATTORI'], { bg: '#f2e8cc', col: '#2a3a6a', rim: '#2a3a6a' })), 0x202020);
  m.facSign = em(T(1024, 160, signTex(['AUTOMOBILI FERRUCCIO LAMBORGHINI'], { bg: '#f4f2ea', col: '#2a2a32', rim: '#2a2a32', font: SANS })), 0x303030);
  m.tagF = em(T(256, 96, tagTex('FERRARI', '#a82020')), 0x202020); m.tagT = em(T(256, 96, tagTex('TRACTOR', '#2a3a6a')), 0x202020);
  m.panel = vc({ map: T(512, 256, panelTex) }); m.view = em(T(512, 256, viewTex), 0x6a6a6a); m.photos = ['#c8282a', '#d84a2a', '#b82a3a'].map((c, i) => em(T(256, 200, photoTex(c, { num: String(i * 4 + 4) })), 0x201810));
  m.cal = em(T(200, 260, calTex), 0x202020); m.peg = vc({ map: T(256, 256, pegTex) });
  m.concrete = vc({ map: T(512, 512, floorTex({ base: '#8a8478', stain: 1, seed: 5 })) }); m.facFloor = vc({ map: T(512, 512, floorTex({ base: '#9a968c', grid: 1, seed: 6 })) });
  m.wallW = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#e8e4d8'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 5)); }) });
  m.sky = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xd8e8ff).multiplyScalar(1.3), fog: false });
  m.back66 = em(T(1024, 512, backTex({ a: '#2a1a3a', b: '#120a18', lines: ['SALON', 'GENÈVE 1966'], col: '#f0d8a0', tw: 0.16 })), 0x241830);
  m.backNow = em(T(1024, 512, backTex({ a: '#1a2a3a', b: '#0a1018', led: 1 })), 0x203040);
  m.carpet = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#8a2230' })) }); m.cloth = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#efe6d8', folds: 3 })), side: THREE.DoubleSide });
  m.velvet = vc(); m.gold = vc({ emissive: 0x3a2408 }); m.wheat = vc(); m.soil = vc();
  m.spot = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2d8).multiplyScalar(2.2), fog: false });
  m.skyl = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xe8f0ff).multiplyScalar(1.5), fog: false });
  m.winNight = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x3a4a8a), fog: false });
  return m; }

// ---------------------------------------------------------------- vehicles
// lofted body: stations along x (rear -L/2 .. front +L/2); profiles are [[t, v], ...] (t 0 rear .. 1 front); superellipse cross-section
const P1 = (tab, t) => { if (typeof tab === 'function') return tab(t); if (t <= tab[0][0]) return tab[0][1]; for (let i = 1; i < tab.length; i++) if (t <= tab[i][0]) { const [t0, a] = tab[i - 1], [t1, b] = tab[i], u = (t - t0) / (t1 - t0), s = u * u * (3 - 2 * u); return a + (b - a) * s; } return tab[tab.length - 1][1]; };
function loft(L, hw, yb, yt, colFn, n = 3.2, NS = 56, NR = 36, x0 = -0.5, x1 = 0.5, endK = 0.04, arch = null) { const pos = [], col = [], uv = [], idx = [];
  for (let i = 0; i <= NS; i++) { const t = x0 + (x1 - x0) * i / NS + 0.5, e = Math.min(1, Math.min(t - (x0 + 0.5), (x1 + 0.5) - t) / endK), k = Math.sqrt(Math.max(0.0, 1 - (1 - e) * (1 - e))) * 0.96 + 0.04, W = P1(hw, t) * k, B = P1(yb, t), Tp = P1(yt, t), yc = (B + Tp) / 2, hh = (Tp - B) / 2 * (0.3 + 0.7 * k);
    for (let j = 0; j <= NR; j++) { const a = j / NR * TAU - Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a), z = W * Math.sign(ca) * Math.abs(ca) ** (2 / n); let y = yc + hh * Math.sign(sa) * Math.abs(sa) ** (2 / n); if (arch && sa < 0.2) y = arch((t - 0.5) * L, y); pos.push((t - 0.5) * L, y, z); uv.push(t * 4, j / NR); col.push(...colFn(t, y, z, sa, ca)); } }
  for (let i = 0; i < NS; i++) for (let j = 0; j < NR; j++) { const a = i * (NR + 1) + j, b = a + NR + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
const C3 = (hex) => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };
const CAR = {
  gt: { L: 4.4, col: 0xc42a2a, hw: [[0, 0.8], [0.3, 0.86], [0.75, 0.84], [1, 0.72]], yb: [[0, 0.3], [1, 0.3]], yt: [[0, 0.86], [0.1, 0.92], [0.4, 0.9], [0.62, 0.86], [0.95, 0.76], [1, 0.6]], cab: [0.18, 0.56], roof: 1.32, cw: 0.66, wb: [-1.25, 1.2], lamps: 'round', grille: 1 },
  gt350: { L: 4.6, col: 0xb8bcc6, hw: [[0, 0.82], [0.3, 0.88], [0.75, 0.86], [1, 0.74]], yb: [[0, 0.3], [1, 0.3]], yt: [[0, 0.82], [0.12, 0.88], [0.45, 0.88], [0.66, 0.84], [0.95, 0.74], [1, 0.58]], cab: [0.16, 0.6], roof: 1.26, cw: 0.7, wb: [-1.3, 1.25], lamps: 'oval', grille: 2, fast: 1 },
  miura: { L: 4.36, col: 0xf08a1a, hw: [[0, 0.86], [0.25, 0.9], [0.5, 0.89], [0.8, 0.88], [1, 0.74]], yb: [[0, 0.26], [1, 0.24]], yt: [[0, 0.82], [0.25, 0.86], [0.5, 0.78], [0.7, 0.7], [0.92, 0.62], [1, 0.48]], cab: [0.36, 0.7], roof: 1.06, cw: 0.66, wb: [-1.26, 1.24], lamps: 'lash', louvre: 1 },
};
export function car(kind, colOver) { const S = { ...CAR[kind], ...(colOver ? { col: colOver } : {}) }, G = new THREE.Group(), K = new Kit(), L = S.L, body = C3(S.col), dark = C3(0x1a1a24);
  const arch = (x, y) => { for (const wx of S.wb) { const dx = x - wx, r = 0.43; if (Math.abs(dx) < r) { const top = 0.33 + Math.sqrt(r * r - dx * dx); if (y < top) return top; } } return y; };
  const bodyG = loft(L, S.hw, S.yb, S.yt, (t, y) => (y < 0.36 ? body.map((v) => v * 0.72) : body), 3.2, 72, 40, -0.5, 0.5, 0.04, arch); const bm = new THREE.Mesh(bodyG, M.body); bm.castShadow = true; bm.receiveShadow = false; /* VSM self-shadow hatching on the curved body */ G.add(bm);
  // greenhouse: glass with body-coloured roof, pillars and belt
  const [c0, c1] = S.cab, top = (t) => P1(S.yt, t), glass = C3(0x24305a);
  const cg = loft(L, [[c0, S.cw * 0.95], [(c0 + c1) / 2, S.cw], [c1, S.cw * 0.9]], [[c0, top(c0) - 0.06], [c1, top(c1) - 0.06]],
    S.fast ? [[c0, top(c0) + 0.02], [c0 + 0.12, S.roof], [c1 - 0.22, S.roof], [c1, top(c1) + 0.02]] : [[c0, top(c0) + 0.02], [c0 + 0.16, S.roof], [c1 - 0.16, S.roof], [c1, top(c1) + 0.02]],
    (t, y, z, sa) => { const u = (t - c0) / (c1 - c0); return sa > 0.82 || u < 0.08 || u > 0.92 || y < P1(S.yt, t) + 0.03 || (u > 0.5 && u < 0.54 && !S.louvre) ? body : glass; }, 3.0, 64, 48, c0 - 0.5, c1 - 0.5, 0.18);
  const cm = new THREE.Mesh(cg, M.glass); cm.castShadow = true; cm.receiveShadow = false; G.add(cm);
  // wheels: dark arch disc + tyre + rim + hub
  const R = 0.33; for (const x of S.wb) for (const s of [-1, 1]) { const hwx = P1(S.hw, x / L + 0.5);
    const wz = hwx - 0.16; K.put(M.tire, cyl(R - 0.02, R - 0.02, 0.2, 24), x, R, s * (wz - 0.06), Math.PI / 2, 0, 0, 1, 1, 1, 0x101016);
    K.put(M.tire, new THREE.TorusGeometry(R - 0.1, 0.11, 10, 28), x, R, s * wz, 0, 0, 0, 1, 1, 1.25, 0x1e1e26);
    K.put(M.chrome, cyl(R - 0.12, R - 0.12, 0.06, 20), x, R, s * (wz + 0.06), Math.PI / 2, 0, 0, 1, 1, 1, kind === 'miura' ? 0xc8c0b0 : 0xd8dce4);
    for (let k = 0; k < (kind === 'gt' ? 12 : 6); k++) { const a = k / (kind === 'gt' ? 12 : 6) * TAU; K.beam(M.chrome, [x, R, s * (wz + 0.1)], [x + Math.cos(a) * (R - 0.13), R + Math.sin(a) * (R - 0.13), s * (wz + 0.08)], 0.014, 0x9a9ea8); }
    K.put(M.chrome, sph(0.05, 10, 8), x, R, s * (wz + 0.11), 0, 0, 0, 1, 1, 0.6, 0xe8e8f0); }
  // lamps, grille, bumpers, tail lights, louvres
  const fx = L / 2, fy = P1(S.yt, 0.97), fw = P1(S.hw, 0.95);
  for (const s of [-1, 1]) {
    if (S.lamps === 'lash') { K.put(M.chrome, sph(0.1, 14, 10), fx - 0.32, fy + 0.02, s * fw * 0.62, 0, 0, 0, 1.2, 0.55, 1, 0x2a2a30); mesh(G, sph(0.075, 12, 8), M.lens, fx - 0.28, fy + 0.03, s * fw * 0.62, 0, 0, 0.5, false).scale.set(1.2, 0.55, 1);
      for (let k = 0; k < 4; k++) K.beam(M.body, [fx - 0.42 + k * 0.04, fy + 0.08, s * (fw * 0.62 - 0.12)], [fx - 0.46 + k * 0.04, fy + 0.12, s * (fw * 0.62 + 0.12)], 0.016, S.col); }
    else { const oy = S.lamps === 'oval' ? 0.62 : 0.66; K.put(M.chrome, cyl(0.11, 0.12, 0.08, 18), fx - 0.12, oy, s * fw * 0.66, 0, 0, Math.PI / 2 - 0.25, S.lamps === 'oval' ? 0.8 : 1, 1, 1.3, 0xd8dce4); mesh(G, sph(0.09, 12, 8), M.lens, fx - 0.07, oy, s * fw * 0.66, 0, 0, 0, false).scale.set(0.5, S.lamps === 'oval' ? 0.75 : 1, S.lamps === 'oval' ? 1.3 : 1); }
    K.put(M.redLens, sph(0.06, 10, 8), -L / 2 + 0.03, P1(S.yt, 0.02) - 0.12, s * P1(S.hw, 0.02) * 0.7, 0, 0, 0, 0.5, 1, 1.2, 0xd0302a); }
  if (S.grille) K.put(M.tire, sph(0.3, 16, 10), fx - 0.02, 0.48, 0, 0, 0, 0, 0.12, 0.42, S.grille === 2 ? 1.9 : 1.2, 0x14141c);
  K.beam(M.chrome, [fx + 0.02, 0.36, -fw * 0.8], [fx + 0.02, 0.36, fw * 0.8], 0.035, 0xd8dce4, true, 8); K.beam(M.chrome, [-L / 2 - 0.02, 0.36, -0.7], [-L / 2 - 0.02, 0.36, 0.7], 0.035, 0xd8dce4, true, 8);
  if (S.louvre) for (let k = 0; k < 7; k++) { const t = 0.12 + k * 0.03, y = P1(S.yt, t); K.box(M.tire, (t - 0.5) * L - 0.03, (t - 0.5) * L + 0.03, y - 0.01, y + 0.015, -0.55, 0.55, 0x14141c, 0.006); }
  K.put(M.chrome, sph(0.05, 8, 6), (S.cab[0] - 0.5) * L + 0.1, P1(S.yt, S.cab[0]) + 0.12, 0, 0, 0, 0, 1, 1, 1, 0xd8dce4);
  for (const s of [-1, 1]) K.put(M.chrome, sph(0.045, 8, 6), (S.cab[1] - 0.5) * L - 0.1, P1(S.yt, S.cab[1]) + 0.1, s * (S.cw + 0.04), 0, 0, 0, 1.4, 0.8, 0.6, 0xd8dce4);
  K.build(G); G.userData.L = L; return G; }

// vintage tractor (1950s style), parts in separate groups so it can assemble itself. local: rear axle near x=-0.7, front +x.
function tractorOld(col = 0xc8322a, opts = {}) { const G = new THREE.Group(), parts = [], cream = 0xf0e2c0, grey = 0x5a5a64;
  const part = (fn, from) => { const g = new THREE.Group(), K = new Kit(); fn(K); K.build(g); G.add(g); g.userData.from = from || [0, 0.6, 0]; parts.push(g); return g; };
  const lugWheel = (K, x, z, R, W) => { K.put(M.tire, cyl(R * 0.82, R * 0.82, W, 28), x, R, z, Math.PI / 2, 0, 0, 1, 1, 1, 0x22222a); const n = 22;
    for (let i = 0; i < n; i++) { const a = i / n * TAU; for (const s of [-1, 1]) K.put(M.tire, new THREE.BoxGeometry(0.1, R * 0.2, W * 0.5), x + Math.cos(a) * R * 0.9, R + Math.sin(a) * R * 0.9, z + s * W * 0.22, 0, 0, a + Math.PI / 2 + s * 0.35, 1, 1, 1, 0x26262e); }
    K.put(M.paint, cyl(R * 0.55, R * 0.55, W + 0.02, 22), x, R, z, Math.PI / 2, 0, 0, 1, 1, 1, cream); K.put(M.chrome, cyl(0.07, 0.07, W + 0.06, 12), x, R, z, Math.PI / 2, 0, 0, 1, 1, 1, 0x8a8a92);
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; K.put(M.chrome, sph(0.025, 6, 5), x + Math.cos(a) * R * 0.38, R + Math.sin(a) * R * 0.38, z + Math.sign(z) * (W / 2 + 0.01), 0, 0, 0, 1, 1, 1, 0x8a8a92); } };
  part((K) => { for (const s of [-1, 1]) lugWheel(K, -0.75, s * 0.78, 0.62, 0.34); K.beam(M.metal, [-0.75, 0.62, -0.7], [-0.75, 0.62, 0.7], 0.08, grey, true, 10); }, [0, 0.62, 2.5]);
  part((K) => { for (const s of [-1, 1]) lugWheel(K, 1.2, s * 0.52, 0.32, 0.14); K.beam(M.metal, [1.2, 0.32, -0.5], [1.2, 0.32, 0.5], 0.06, grey, true, 8); K.box(M.metal, 1.12, 1.28, 0.3, 0.5, -0.08, 0.08, grey, 0.02); }, [2.5, 0.4, 0]);
  part((K) => { K.box(M.metal, -0.95, 0.05, 0.38, 0.92, -0.26, 0.26, grey, 0.06); K.box(M.metal, 0.0, 1.15, 0.42, 0.78, -0.2, 0.2, 0x4a4a54, 0.05); for (let i = 0; i < 4; i++) K.put(M.metal, cyl(0.035, 0.035, 0.12, 8), 0.2 + i * 0.24, 0.82, 0.16, 0, 0, 0, 1, 1, 1, 0x6a6a74); }, [0, -1.2, 0]);
  part((K) => { K.box(M.paint, -0.25, 1.3, 0.76, 1.24, -0.29, 0.29, col, 0.1); K.box(M.paint, -0.25, 1.3, 0.98, 1.02, -0.3, 0.3, cream, 0.01); K.box(M.paint, 1.28, 1.42, 0.5, 1.22, -0.3, 0.3, col, 0.06);
    K.box(M.tire, 1.41, 1.44, 0.58, 1.14, -0.24, 0.24, 0x1a1a22, 0.01); for (let i = 0; i < 6; i++) K.box(M.chrome, 1.43, 1.46, 0.6 + i * 0.09, 0.62 + i * 0.09, -0.24, 0.24, 0xc8c8d0, 0.005);
    for (const s of [-1, 1]) { K.put(M.chrome, cyl(0.07, 0.08, 0.08, 14), 1.32, 1.08, s * 0.36, 0, 0, Math.PI / 2, 1, 1, 1, 0xc8c8d0); K.put(M.paint, sph(0.06, 10, 8), 1.37, 1.08, s * 0.36, 0, 0, 0, 0.5, 1, 1, 0xfff2c8); } K.put(M.paint, cyl(0.05, 0.05, 0.06, 10), 0.3, 1.27, 0, 0, 0, 0, 1, 1, 1, cream); }, [0, 3.0, 0]);
  part((K) => { for (const s of [-1, 1]) { K.put(M.paint, new THREE.CylinderGeometry(0.72, 0.72, 0.42, 22, 1, true, 0, Math.PI), -0.75, 0.62, s * 0.78, Math.PI / 2, Math.PI / 2, 0, 1, 1, 1, col); K.box(M.paint, -1.2, -0.3, 0.9, 0.95, s * 0.5, s * 0.99, col, 0.02); } }, [0, 2.4, 0]);
  part((K) => { K.beam(M.metal, [-1.0, 0.85, 0], [-1.05, 1.22, 0], 0.05, grey, true, 8); K.put(M.paint, new THREE.SphereGeometry(0.26, 16, 8, 0, TAU, Math.PI / 2, Math.PI / 2), -1.05, 1.36, 0, Math.PI, 0, 0, 1, 0.5, 1, 0x3a3a44);
    K.beam(M.metal, [-0.05, 1.18, 0], [-0.55, 1.5, 0], 0.035, 0x2a2a30, true, 8); K.put(M.tire, new THREE.TorusGeometry(0.17, 0.022, 8, 22), -0.58, 1.52, 0, 0, Math.PI / 2, -0.55, 1, 1, 1, 0x2a2a30);
    K.beam(M.metal, [0.95, 1.2, 0.18], [0.95, 1.85, 0.18], 0.045, 0x2a2a30, true, 10); K.put(M.metal, cyl(0.06, 0.045, 0.1, 10), 0.95, 1.88, 0.18, 0, 0, 0, 1, 1, 1, 0x2a2a30); }, [0, 2.0, 0]);
  if (opts.plate) { const p = mesh(G, planeUV(0.5, 0.12, 1, 1), M.shopSign, 0.5, 1.12, 0.3, 0, 0, 0, false); p.scale.set(1, 1, 1); }
  G.userData.parts = parts; return G; }
// modern tractor (generic): big rear tyres, cab with glass, sloping bonnet. local rear axle x=-0.9
function tractorNew(col = 0xf08a1a) { const G = new THREE.Group(), K = new Kit(), gr = 0x3a3a44, glass = 0x24305a;
  const wheel = (x, z, R, W) => { K.put(M.tire, cyl(R, R, W, 32), x, R, z, Math.PI / 2, 0, 0, 1, 1, 1, 0x1c1c22); const n = 28; for (let i = 0; i < n; i++) { const a = i / n * TAU; for (const s of [-1, 1]) K.put(M.tire, new THREE.BoxGeometry(0.12, R * 0.12, W * 0.5), x + Math.cos(a) * R, R + Math.sin(a) * R, z + s * W * 0.22, 0, 0, a + Math.PI / 2 + s * 0.4, 1, 1, 1, 0x22222a); }
    K.put(M.paint, cyl(R * 0.6, R * 0.6, W + 0.02, 24), x, R, z, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8d8dc); K.put(M.chrome, cyl(0.12, 0.12, W + 0.06, 12), x, R, z, Math.PI / 2, 0, 0, 1, 1, 1, 0x6a6a74); };
  for (const s of [-1, 1]) { wheel(-0.9, s * 0.98, 0.92, 0.55); wheel(1.75, s * 0.86, 0.6, 0.38); }
  K.box(M.metal, -1.3, 2.4, 0.55, 1.15, -0.4, 0.4, gr, 0.08); K.box(M.paint, 0.2, 2.5, 1.0, 1.75, -0.42, 0.42, col, 0.16); K.box(M.tire, 2.42, 2.56, 1.06, 1.62, -0.34, 0.34, 0x1a1a22, 0.04);
  for (let i = 0; i < 5; i++) K.box(M.chrome, 2.5, 2.57, 1.1 + i * 0.1, 1.13 + i * 0.1, -0.32, 0.32, 0x8a8a94, 0.01);
  for (const s of [-1, 1]) { K.box(M.paint, 2.3, 2.48, 1.5, 1.62, s * 0.24, s * 0.42, 0xfff2d8, 0.02); K.box(M.paint, -1.5, -0.3, 1.95, 2.02, s * 0.62, s * 1.32, col, 0.03); }
  K.box(M.paint, -1.35, 0.25, 1.15, 1.35, -0.68, 0.68, col, 0.05); // cab floor
  K.box(M.glass, -1.3, 0.2, 1.35, 2.85, -0.66, 0.66, glass, 0.06); for (const [x, z] of [[-1.3, -0.66], [-1.3, 0.66], [0.2, -0.66], [0.2, 0.66]]) K.box(M.paint, x - 0.05, x + 0.05, 1.35, 2.88, z - 0.05, z + 0.05, 0x2a2a30, 0.02);
  K.box(M.paint, -1.42, 0.32, 2.85, 3.02, -0.76, 0.76, col, 0.08); K.box(M.paint, -1.3, 0.2, 3.02, 3.06, -0.6, 0.6, 0xe8e8ec, 0.02);
  for (const s of [-1, 1]) K.put(M.lens, sph(0.06, 8, 6), 0.3, 3.0, s * 0.6, 0, 0, 0, 1, 0.6, 1, 0xffffff);
  K.beam(M.metal, [0.35, 1.7, 0.36], [0.35, 3.1, 0.36], 0.05, 0x2a2a30, true, 10); K.box(M.metal, -0.6, -0.2, 0.5, 1.35, 0.68, 0.74, 0x2a2a30, 0.02);
  K.beam(M.chrome, [0.25, 2.2, -0.7], [0.5, 2.3, -1.0], 0.02, 0x2a2a30, true, 6); K.put(M.glass, new THREE.BoxGeometry(0.04, 0.2, 0.14), 0.52, 2.3, -1.02, 0, 0, 0, 1, 1, 1, 0x3a4a6a);
  K.build(G); return G; }
// clutch disc (s=1: r 0.13): friction ring, steel plate, sprung hub, splined centre. local: lying flat (axis y)
export function clutch(K, x, y, z, rx = 0, ry = 0, rz = 0, s = 1, wear = 0) { K.at(x, y, z, ry, () => {
  const k = s, tilt = (geo, px, py, pz, c, sx = 1, sy = 1, sz = 1) => K.put(M.paint, geo, px, py, pz, rx, 0, rz, sx, sy, sz, c);
  tilt(lathe('lbclutchR', [[0.085, 0], [0.13, 0], [0.13, 0.012], [0.085, 0.012], [0.085, 0]], 40), 0, 0, 0, wear ? 0x5a3a2a : 0x8a6040, k, k, k);
  tilt(cyl(0.088, 0.088, 0.008, 36), 0, 0.004 * k, 0, 0xb8bcc6, k, k, k); tilt(cyl(0.04, 0.04, 0.03, 18), 0, 0.01 * k, 0, 0x8a8e98, k, k, k);
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; tilt(cyl(0.011, 0.011, 0.036, 8), Math.cos(a) * 0.062 * k, 0.012 * k, Math.sin(a) * 0.062 * k, 0xd8a83a, k, k, k); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; tilt(sph(0.006, 5, 4), Math.cos(a) * 0.107 * k, 0.013 * k, Math.sin(a) * 0.107 * k, 0x6a6e78, k, k, k); }
  tilt(cyl(0.016, 0.016, 0.034, 10), 0, 0.012 * k, 0, 0x1a1a22, k, k, k); }); }

// ---------------------------------------------------------------- shared pieces
function poplar(K, x, y, z, s, R) { K.beam(M.bark, [x, y - 0.2, z], [x, y + 2 * s, z], 0.12 * s, 0x5a4a3a, true, 6); for (let i = 0; i < 5; i++) { const yy = y + (2.2 + i * 1.2) * s, r = (0.85 - Math.abs(i - 1.6) * 0.12) * s; K.put(M.leaf, lumpGeo(i + Math.round(x), 1, 0.3), x + (R() - 0.5) * 0.2, yy, z, 0, R() * 6, 0, r, 1.0 * s, r, [0x4a7a3a, 0x568a3e, 0x3f6e36][i % 3]); } }
function bush(K, x, y, z, s, R, c = 0x4a7a3a) { for (let i = 0; i < 3; i++) K.put(M.leaf, lumpGeo(i + 7, 1, 0.3), x + (R() - 0.5) * s, y + s * 0.4, z + (R() - 0.5) * s, 0, R() * 6, 0, s * 0.7, s * 0.55, s * 0.7, c); }
function terrain(root, W, D, NX, NZ, zc, fn, colFn) { const g = new THREE.PlaneGeometry(W, D, NX, NZ); g.rotateX(-Math.PI / 2); const p = g.attributes.position, c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) + zc, y = fn(x, z); p.setXYZ(i, x, y, z); c.set(colFn(x, y, z), i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.computeVertexNormals(); const t = new THREE.Mesh(g, M.ground); t.receiveShadow = true; root.add(t); return t; }
function crate(K, x, y, z, ry, w, h, d, mat = M.olive) { K.at(x, y, z, ry, () => { K.box(mat, -w / 2, w / 2, 0, h, -d / 2, d / 2, 0xffffff, 0.03); for (const s of [-1, 1]) K.box(M.oliveP, -w / 2 - 0.01, w / 2 + 0.01, h / 2 + s * h * 0.3 - 0.03, h / 2 + s * h * 0.3 + 0.03, -d / 2 - 0.01, d / 2 + 0.01, 0x4a5030, 0.01); }); }
function jerry(K, x, y, z, ry) { K.at(x, y, z, ry, () => { K.box(M.oliveP, -0.17, 0.17, 0, 0.46, -0.08, 0.08, 0x5a6236, 0.03); K.box(M.oliveP, -0.12, 0.12, 0.46, 0.5, -0.03, 0.03, 0x4a5030, 0.01); K.put(M.oliveP, new THREE.BoxGeometry(0.24, 0.02, 0.17), 0, 0.23, 0, 0, 0, 0.75, 1, 1, 1, 0x4a5030); }); }
function oldTire(K, x, y, z, rx, R = 0.42) { K.put(M.tire, new THREE.TorusGeometry(R * 0.72, R * 0.28, 10, 24), x, y, z, rx, 0, 0, 1, 1, 1, 0x26262c); K.put(M.oliveP, cyl(R * 0.45, R * 0.45, R * 0.3, 16), x, y, z, rx + Math.PI / 2, 0, 0, 1, 1, 1, 0x5a6236); }

// ================================================================= FARM
function house(K, x, z, ry) { K.at(x, 0, z, ry, () => { const W = 9, D = 6, HT = 5.6;
  K.box(M.plaster, -W / 2, W / 2, 0, HT, -D / 2, D / 2, 0xffffff, 0.05);
  for (const s of [-1, 1]) K.put(M.roof, new THREE.BoxGeometry(W + 0.8, 0.18, D / 2 / Math.cos(0.38) + 0.45), 0, HT + D / 4 * Math.tan(0.38) - 0.02, s * D / 4 + s * 0.12, s * 0.38, 0, 0, 1, 1, 1, 0xffffff);
  const gab = shapeGeo([[-D / 2 - 0.02, 0], [D / 2 + 0.02, 0], [0, -(D / 2) * Math.tan(0.38)]], 0.12, 0); for (const xx of [W / 2 - 0.06, -W / 2 - 0.06]) K.put(M.plaster, gab, xx, HT, 0, -Math.PI / 2, Math.PI / 2, 0, 1, 1, 1, 0xe8b070);
  for (const [wx, wy] of [[-3, 1.5], [-0.8, 1.5], [3, 1.5], [-3, 4.0], [-0.8, 4.0], [1.4, 4.0], [3, 4.0]]) { K.box(M.paint, wx - 0.45, wx + 0.45, wy - 0.6, wy + 0.6, D / 2, D / 2 + 0.03, 0x2a2430, 0.01); K.box(M.plaster, wx - 0.55, wx + 0.55, wy - 0.72, wy - 0.62, D / 2, D / 2 + 0.08, 0xf2e2c8, 0.01);
    for (const s of [-1, 1]) { K.box(M.paint, wx + s * 0.47, wx + s * 0.85, wy - 0.62, wy + 0.62, D / 2 + 0.02, D / 2 + 0.06, 0x3a6a4a, 0.01); for (let k = 0; k < 6; k++) K.box(M.paint, wx + s * 0.49, wx + s * 0.83, wy - 0.52 + k * 0.2, wy - 0.5 + k * 0.2, D / 2 + 0.06, D / 2 + 0.075, 0x2a5a3a, 0.002); } }
  // arched portico + door
  K.box(M.brick, 0.6, 2.3, 0, 2.6, D / 2 - 0.02, D / 2 + 0.12, 0xffffff, 0.02); K.box(M.plank, 0.85, 2.05, 0, 2.2, D / 2 + 0.12, D / 2 + 0.16, 0x6a3a22, 0.02);
  K.put(M.brick, new THREE.TorusGeometry(0.6, 0.12, 6, 16, Math.PI), 1.45, 2.2, D / 2 + 0.14, 0, 0, 0, 1, 1, 1, 0xffffff);
  K.box(M.brick, W / 2 - 0.3, W / 2 + 0.1, HT + 0.4, HT + 1.6, -1.2, -0.6, 0xffffff, 0.03); K.box(M.roof, W / 2 - 0.4, W / 2 + 0.2, HT + 1.6, HT + 1.72, -1.3, -0.5, 0xffffff, 0.02);
  K.box(M.plaster, -W / 2, W / 2, 0, 0.5, D / 2, D / 2 + 0.06, 0xc8925a, 0.01); }); }
function shed(K, x, z, ry) { K.at(x, 0, z, ry, () => { const W = 10, D = 7, HT = 4.2;
  K.box(M.brick, -W / 2, W / 2, 0, HT, -D / 2, -D / 2 + 0.3, 0xffffff, 0.03); for (const s of [-1, 1]) K.box(M.brick, s * W / 2 - 0.15, s * W / 2 + 0.15, 0, HT, -D / 2, D / 2, 0xffffff, 0.03);
  for (const px of [-1.8, 1.8]) K.box(M.brick, px - 0.3, px + 0.3, 0, HT, D / 2 - 0.4, D / 2, 0xffffff, 0.03); K.box(M.brick, -W / 2, W / 2, HT - 0.7, HT, D / 2 - 0.4, D / 2, 0xffffff, 0.03);
  for (const [a, b] of [[-W / 2 + 0.15, -2.1], [-1.5, 1.5], [2.1, W / 2 - 0.15]]) K.put(M.brick, new THREE.TorusGeometry((b - a) / 2, 0.16, 6, 18, Math.PI), (a + b) / 2, HT - 0.7 - (b - a) / 2 * 0.2, D / 2 - 0.2, 0, 0, 0, 1, 0.2 + 0.8 * 0.25, 1, 0xd8a080);
  K.box(M.roof, -W / 2 - 0.4, W / 2 + 0.4, HT, HT + 0.22, -D / 2 - 0.3, D / 2 + 0.5, 0xffffff, 0.04); K.box(M.plank, -W / 2, W / 2, 0, 0.04, -D / 2, D / 2, 0x6a5a4a, 0.01);
  K.box(M.plank, -4.6, -2.6, 0, 0.9, -3.0, -2.4, 0x7a5030, 0.02); for (let i = 0; i < 4; i++) K.put(M.oliveP, cyl(0.28, 0.28, 0.85, 14), 2.8 + (i % 2) * 0.65, 0.43, -2.6 + Math.floor(i / 2) * 0.62, 0, 0, 0, 1, 1, 1, [0x3a5a8a, 0xa83a2a, 0x5a6236, 0x3a5a8a][i]); }); }
function surplusTruck(K, x, z, ry) { K.at(x, 0, z, ry, () => { const ol = 0x5a6236;
  K.box(M.oliveP, -1.6, 1.4, 0.55, 0.75, -0.55, 0.55, 0x3a3e28, 0.02); K.box(M.oliveP, 0.4, 1.5, 0.75, 1.45, -0.5, 0.5, ol, 0.08); K.box(M.oliveP, -0.5, 0.4, 0.75, 1.95, -0.62, 0.62, ol, 0.06); K.box(M.glass, 0.38, 0.42, 1.45, 1.85, -0.5, 0.5, 0x24305a, 0.01);
  K.box(M.tire, 1.48, 1.52, 0.85, 1.4, -0.4, 0.4, 0x1e2018, 0.01); for (const s of [-1, 1]) { K.put(M.oliveP, new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16, 1, true, 0, Math.PI), 1.0, 0.55, s * 0.62, Math.PI / 2, Math.PI / 2, 0, 1, 1, 1, ol); }
  for (const [wx, s] of [[1.0, 1], [-1.1, 1], [-1.1, -1]]) oldTire(K, wx, 0.42, s * 0.68, Math.PI / 2); K.put(M.tire, new THREE.TorusGeometry(0.3, 0.12, 8, 20), 1.0, 0.1, -0.9, Math.PI / 2, 0, 0, 1, 1, 1, 0x26262c);
  K.put(M.paint, cyl(0.12, 0.12, 0.02, 16), 0.0, 1.35, 0.63, Math.PI / 2, 0, 0, 1, 1, 1, 0xf2ecd8); }); }
function buildFarm(root) { const R = PT.rng(1948), K = new Kit();
  terrain(root, 500, 500, 160, 160, -150, lf, (x, y, z) => { const n = PT.fbm(x * 0.03 + 5, z * 0.03 + 2, 2, 2, 3, 6), n2 = PT.fbm(x * 0.4, z * 0.4, 2, 2, 3, 9);
    const yard = Math.max(0, 1 - Math.hypot(x / 16, (z + 2) / 11)); const wheat = x > 12 && z < -14 && z > -60 ? 1 : 0, vines = x < -14 && z < -12 && z > -60 ? 1 : 0;
    let c = [0.36 + 0.08 * n, 0.5 + 0.06 * n, 0.22]; if (wheat) c = [0.86 + 0.06 * n2, 0.7 + 0.05 * n2, 0.32]; if (vines) c = [0.48 + 0.05 * n2, 0.38, 0.24];
    const k = sm(0.2, 0.6, yard); return c.map((v, i) => v * (1 - k) + [0.62 + 0.06 * n2, 0.54 + 0.05 * n2, 0.4][i] * k); });
  house(K, -10.5, -9, 0.12); shed(K, 8.5, -9.5, -0.1);
  // surplus pile (left of the yard): crates, jerry cans, tyres, a cut-down truck, an engine block
  surplusTruck(K, -4.6, -4.8, 0.5);
  for (const [x, z, ry, w, h, d, m] of [[-6.8, -1.8, 0.3, 1.0, 0.7, 0.7, 0], [-6.3, -1.7, -0.2, 0.8, 0.6, 0.6, 1], [-6.6, -1.8, 0.1, 0.8, 0.55, 0.6, 0], [-7.6, -3.0, 0.6, 1.2, 0.8, 0.8, 1], [-3.2, -2.2, 0.4, 0.7, 0.5, 0.5, 0]]) crate(K, x, (x === -6.6 ? 0.7 : 0), z, ry, w, h, d, m ? M.crate2 : M.olive);
  for (let i = 0; i < 5; i++) jerry(K, -5.4 + i * 0.38, 0, -1.4 + (i % 2) * 0.2, 0.2 * i); for (const [x, z] of [[-8.2, -0.8], [-8.0, -0.6]]) oldTire(K, x, 0.3, z, Math.PI / 2 - 0.1, 0.4);
  K.box(M.metal, -2.9, -2.1, 0, 0.55, -3.6, -3.0, 0x4a4e3a, 0.06); for (let i = 0; i < 4; i++) K.put(M.metal, cyl(0.06, 0.06, 0.18, 8), -2.8 + i * 0.2, 0.6, -3.3, 0, 0, 0, 1, 1, 1, 0x6a6e5a);
  // sign on the shed
  const sg = mesh(root, planeUV(4.4, 0.78, 1, 1), M.shopSign, 0, 0, 0, 0, 0, 0, false); sg.position.set(8.5 + 0.0, 3.95, -9.5 + 3.52); sg.rotation.y = -0.1; sg.position.x += Math.sin(-0.1) * 0.02;
  // workbench, anvil, hay, cart, well, fences
  K.at(2.6, 0, -2.8, -0.3, () => { K.box(M.plank, -0.9, 0.9, 0.85, 0.95, -0.4, 0.4, 0x8a5a38, 0.02); for (const [a, b] of [[-0.8, -0.3], [0.8, -0.3], [-0.8, 0.3], [0.8, 0.3]]) K.box(M.plank, a - 0.05, a + 0.05, 0, 0.85, b - 0.05, b + 0.05, 0x6a4028, 0.01); K.put(M.metal, cyl(0.06, 0.08, 0.2, 10), -0.4, 1.05, 0, 0, 0, 0, 1, 1, 1, 0x3a3a44); K.box(M.metal, 0.2, 0.6, 0.95, 1.05, -0.12, 0.12, 0x5a5a64, 0.02); });
  for (const [x, z, s] of [[-17, -2, 1.2], [-15.5, 3, 1.0], [15, -3, 1.1], [17, 2, 1.3]]) K.put(M.wheat, lumpGeo(Math.round(x), 1, 0.15), x, 0.6 * s, z, 0, 0, 0, 1.0 * s, 0.9 * s, 1.0 * s, 0xd8b860);
  K.at(-13, 0, 4, 0.8, () => { K.box(M.plank, -1, 1, 0.5, 0.6, -0.6, 0.6, 0x8a6040, 0.02); for (const s of [-1, 1]) K.put(M.plank, new THREE.TorusGeometry(0.42, 0.05, 6, 18), -0.4, 0.45, s * 0.66, 0, 0, 0, 1, 1, 1, 0x6a4028); K.beam(M.plank, [1, 0.55, 0], [2.2, 0.3, 0], 0.05, 0x7a5030); });
  K.at(13, 0, 3, 0, () => { K.put(M.brick, cyl(0.7, 0.75, 0.9, 16, true), 0, 0.45, 0, 0, 0, 0, 1, 1, 1, 0xffffff); for (const s of [-1, 1]) K.beam(M.plank, [s * 0.6, 0.9, 0], [s * 0.6, 2.2, 0], 0.06, 0x6a4028); K.box(M.roof, -0.9, 0.9, 2.2, 2.3, -0.6, 0.6, 0xffffff, 0.02); });
  for (let i = 0; i < 26; i++) { const x = -26 + i * 2; if (Math.abs(x) < 4) continue; K.beam(M.plank, [x, 0, 8], [x, 0.9, 8], 0.07, 0x7a5a3a); if (i < 25) K.beam(M.plank, [x, 0.7, 8], [x + 2, 0.7, 8], 0.05, 0x8a6a48); }
  // vine rows (left), wheat (right), poplar rows, far hills dressing
  for (let r = 0; r < 12; r++) for (let i = 0; i < 16; i++) { const x = -16 - r * 2.2, z = -15 - i * 2.8; K.beam(M.bark, [x, lf(x, z), z], [x, lf(x, z) + 1.3, z], 0.04, 0x5a4030); bush(K, x, lf(x, z) + 0.9, z, 0.7, R, 0x4a8a3a); }
  for (let i = 0; i < 60; i++) { const x = 13 + R() * 40, z = -16 - R() * 42; K.put(M.wheat, lumpGeo(i, 1, 0.4), x, lf(x, z) + 0.25, z, 0, R() * 6, 0, 0.9, 0.35, 0.9, 0xe0c060); }
  for (let i = 0; i < 18; i++) poplar(K, -30 + i * 3.6, lf(-30 + i * 3.6, -64), -64, 1.5, R); for (let i = 0; i < 10; i++) poplar(K, 26 + (i % 2) * 1.5, lf(26, -10 - i * 5), -10 - i * 5, 1.4, R);
  for (let i = 0; i < 10; i++) poplar(K, -25 - (i % 2) * 1.5, lf(-25, -6 - i * 4), -6 - i * 4, 1.3, R);
  for (let i = 0; i < 40; i++) { const x = (R() - 0.5) * 200, z = -80 - R() * 120; bush(K, x, lf(x, z), z, 3 + R() * 3, R, [0x3f6e36, 0x4a7a3a][i % 2]); }
  for (let i = 0; i < 30; i++) { const x = (R() - 0.5) * 30, z = (R() - 0.5) * 16; if (Math.abs(x) < 8 && Math.abs(z) < 5) continue; K.put(M.leaf, new THREE.ConeGeometry(0.06, 0.3, 4), x, 0.12, z, 0, R(), 0, 1, 1, 1, 0x5a8a3a); }
  K.build(root, 40);
  // the self-building tractor (yard centre), two finished tractors in the field, the red GT, the payoff supercar
  const build = tractorOld(0xc8322a); build.position.set(0.6, 0, -1.4); build.rotation.y = 0.5; root.add(build);
  const fieldT = [tractorOld(0xc8322a), tractorOld(0x3a6aa8), tractorOld(0xc8322a)]; fieldT.forEach((t, i) => { t.position.set(16 + i * 5, lf(16 + i * 5, -22 - i * 6), -22 - i * 6); t.rotation.y = 0.2 * i; root.add(t); });
  const gt = car('gt'); gt.position.set(-5.2, 0, 1.8); gt.rotation.y = -0.35; root.add(gt);
  const miura = car('miura', 0xf8a422); miura.position.set(2.1, 0, 0.0); miura.rotation.y = -0.3; miura.visible = false; root.add(miura);
  const dust = motes(root, 40, [-6, 6, 0.3, 3, -4, 4], 31, 0.018);
  return { build, fieldT, gt, miura, dust };
}

// ================================================================= SHOP (night works)
function buildShop(root) { const R = PT.rng(1958), K = new Kit(), X = 7, ZB = -4.2, HT = 4.6;
  mesh(root, planeUV(16, 14, 3, 3), M.concrete, 0, 0, 1, -Math.PI / 2, 0, 0, false);
  K.box(M.brick, -X, X, 0, HT, ZB - 0.3, ZB, 0xffffff, 0.02); for (const s of [-1, 1]) K.box(M.brick, s > 0 ? X : -X - 0.3, s > 0 ? X + 0.3 : -X, 0, HT, ZB, 7, 0xffffff, 0.02);
  mesh(root, plane(2 * X, 12), H.toon({ color: 0x2a2028, side: THREE.DoubleSide }), 0, HT, 1.5, Math.PI / 2, 0, 0, false);
  for (let i = 0; i < 4; i++) K.box(M.plank, -X, X, HT - 0.4, HT - 0.2, -3.5 + i * 2.6, -3.3 + i * 2.6, 0x4a3020, 0.02);
  // night windows (back wall)
  for (const wx of [-4.6, 4.6]) { K.box(M.paint, wx - 0.9, wx + 0.9, 2.0, 3.6, ZB, ZB + 0.04, 0x2a2430, 0.01); mesh(root, plane(1.7, 1.5), M.winNight, wx, 2.8, ZB + 0.05, 0, 0, 0, false); for (const d of [-0.42, 0.42]) K.box(M.plank, wx + d - 0.03, wx + d + 0.03, 2.0, 3.6, ZB + 0.05, ZB + 0.1, 0x3a2a20, 0.005); K.box(M.plank, wx - 0.9, wx + 0.9, 2.77, 2.83, ZB + 0.05, ZB + 0.1, 0x3a2a20, 0.005); }
  // pegboard + tools, workbench with the two clutches
  mesh(root, plane(3.2, 1.4), M.peg, -1.2, 2.0, ZB + 0.02, 0, 0, 0, false);
  for (let i = 0; i < 9; i++) { const x = -2.6 + i * 0.34, L = 0.22 + (i % 3) * 0.08; K.box(M.chrome, x - 0.02, x + 0.02, 2.1 - L, 2.3, ZB + 0.04, ZB + 0.07, 0xb8bcc6, 0.005); K.put(M.chrome, new THREE.TorusGeometry(0.045, 0.014, 6, 12), x, 2.3, ZB + 0.06, 0, 0, 0, 1, 1, 1, 0xb8bcc6); }
  for (let i = 0; i < 3; i++) K.box(M.paint, 0.0 + i * 0.12, 0.06 + i * 0.12, 1.5, 2.5, ZB + 0.04, ZB + 0.12, [0xc8322a, 0x3a5a8a, 0xd8a83a][i], 0.01);
  const BX = -1.2, BZ = ZB + 0.55, BY = 0.95; K.box(M.plank, BX - 1.6, BX + 1.6, BY - 0.08, BY, BZ - 0.45, BZ + 0.45, 0x8a5a38, 0.02); for (const a of [-1.5, 1.5]) for (const b of [-0.38, 0.38]) K.box(M.plank, BX + a - 0.05, BX + a + 0.05, 0, BY - 0.08, BZ + b - 0.05, BZ + b + 0.05, 0x5a3a24, 0.01);
  K.box(M.plank, BX - 1.5, BX + 1.5, 0.25, 0.3, BZ - 0.38, BZ + 0.38, 0x6a4028, 0.01);
  clutch(K, BX, BY + 0.005, BZ + 0.19, 0, 0, 0, 1.2, 1); clutch(K, BX, BY + 0.005, BZ - 0.2, 0, 0, 0, 1.2, 0);
  K.put(M.chrome, new THREE.BoxGeometry(0.28, 0.025, 0.05), BX + 0.85, BY + 0.012, BZ + 0.15, 0, 0.5, 0, 1, 1, 1, 0xb8bcc6); K.put(M.paint, cyl(0.05, 0.05, 0.12, 10), BX - 0.95, BY + 0.06, BZ - 0.15, 0, 0, 0, 1, 1, 1, 0xc8322a);
  K.put(M.metal, cyl(0.05, 0.08, 0.1, 10), BX + 1.1, BY + 0.05, BZ - 0.2, 0, 0, 0, 1, 1, 1, 0x3a3a44); K.put(M.paint, cyl(0.035, 0.035, 0.03, 12), BX - 0.65, BY + 0.015, BZ + 0.28, 0, 0, 0, 1, 1, 1, 0x8a8e98);
  for (let i = 0; i < 6; i++) K.put(M.chrome, cyl(0.012, 0.012, 0.03, 6), BX + 0.6 + (i % 3) * 0.05, BY + 0.015, BZ + 0.3 - Math.floor(i / 3) * 0.05, 0, 0, 0, 1, 1, 1, 0xd8dce4);
  const tags = [mesh(root, plane(0.22, 0.085), M.tagF, BX + 0.27, BY + 0.006, BZ + 0.2, -Math.PI / 2, 0, 0.1, false), mesh(root, plane(0.22, 0.085), M.tagT, BX + 0.27, BY + 0.006, BZ - 0.19, -Math.PI / 2, 0, -0.08, false)];
  const cal = mesh(root, plane(0.5, 0.65), M.cal, 1.2, 2.2, ZB + 0.02, 0, 0, 0.03, false);
  // drums, tyres, a tractor in the back right, the red GT centre (parked nose to the left)
  for (const [x, z, c] of [[5.6, -3.4, 0x3a5a8a], [6.1, -2.8, 0xa83a2a], [5.5, -2.5, 0x3a5a8a]]) K.put(M.paint, cyl(0.3, 0.3, 0.9, 16), x, 0.45, z, 0, 0, 0, 1, 1, 1, c);
  for (let i = 0; i < 4; i++) K.put(M.tire, new THREE.TorusGeometry(0.24, 0.1, 8, 20), -6.0, 0.1 + i * 0.2, 1.2, Math.PI / 2, 0, 0, 1, 1, 1, 0x1e1e26);
  K.build(root, 0);
  const tr = tractorOld(0xc8322a); tr.position.set(4.0, 0, -2.4); tr.rotation.y = -0.6; root.add(tr);
  const gt = car('gt'); gt.position.set(0.6, 0, 0.4); gt.rotation.y = Math.PI - 0.25; root.add(gt);
  const lampY = 3.4, lamps = []; for (const [x, z] of [[0.5, 0.4], [-1.2, ZB + 1.0]]) { const KK = new Kit(); KK.beam(M.metal, [x, HT, z], [x, lampY + 0.3, z], 0.01, 0x2a2a30, true, 4); KK.put(M.metal, new THREE.ConeGeometry(0.32, 0.26, 16, 1, true), x, lampY + 0.12, z, 0, 0, 0, 1, 1, 1, 0x3a5a4a); KK.build(root); mesh(root, sph(0.08, 10, 8), M.lampGlass, x, lampY, z, 0, 0, 0, false); lamps.push(glowAt(root, [x, lampY - 0.05, z], 1.1, '#ffc070', 0.55)); }
  const dust = motes(root, 60, [-4, 4, 0.4, 3.4, -3.5, 2], 47, 0.012);
  return { gt, tr, tags, lamps, dust, BX, BY, BZ };
}

// ================================================================= OFFICE
function buildOffice(root) { const R = PT.rng(1962), K = new Kit(), X = 4.6, ZB = -3.6, HT = 3.4;
  mesh(root, planeUV(10, 9, 3, 3), M.plank, 0, 0, 0.5, -Math.PI / 2, 0, 0, false);
  K.box(M.panel, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(M.panel, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 5, 0xffffff, 0.01);
  mesh(root, plane(2 * X, 9), H.toon({ color: 0x3a2a24, side: THREE.DoubleSide }), 0, HT, 0.5, Math.PI / 2, 0, 0, false);
  // window to factory roofs (back wall right)
  mesh(root, plane(2.6, 1.6), M.view, 2.0, 2.0, ZB + 0.02, 0, 0, 0, false); K.box(M.plank, 0.65, 3.35, 1.15, 1.22, ZB, ZB + 0.12, 0xe8e0d0, 0.01); for (const x of [0.7, 2.0, 3.3]) K.box(M.plank, x - 0.04, x + 0.04, 1.2, 2.8, ZB, ZB + 0.08, 0xe8e0d0, 0.005); K.box(M.plank, 0.65, 3.35, 2.78, 2.84, ZB, ZB + 0.08, 0xe8e0d0, 0.005);
  // photos (back wall left), shelf with trophies
  M.photos.forEach((m, i) => mesh(root, plane(0.7, 0.55), m, -3.4 + i * 0.95, 2.3 + (i % 2) * 0.12, ZB + 0.02, 0, 0, (i - 1) * 0.02, false));
  K.box(M.plank, -3.9, -1.2, 1.42, 1.48, ZB, ZB + 0.3, 0x5a3420, 0.01);
  for (let i = 0; i < 4; i++) K.at(-3.6 + i * 0.7, 1.48, ZB + 0.15, 0, () => { K.put(M.gold, lathe('lbcup', [[0.001, 0], [0.08, 0], [0.08, 0.03], [0.03, 0.05], [0.025, 0.14], [0.1, 0.2], [0.12, 0.34], [0.001, 0.32]], 18), 0, 0, 0, 0, 0, 0, 1, 1 + (i % 2) * 0.3, 1, 0xd8a83a); for (const s of [-1, 1]) K.put(M.gold, new THREE.TorusGeometry(0.05, 0.012, 6, 12), s * 0.12, 0.26 + (i % 2) * 0.08, 0, 0, 0, 0, 1, 1, 1, 0xd8a83a); });
  // desk (centre), chair behind, phone, papers, lamp, model car
  const DZ = -1.6; K.box(M.plank, -1.4, 1.4, 0.74, 0.82, DZ - 0.6, DZ + 0.6, 0x4a2a18, 0.03); for (const s of [-1, 1]) K.box(M.plank, s > 0 ? 0.75 : -1.35, s > 0 ? 1.35 : -0.75, 0, 0.74, DZ - 0.55, DZ + 0.55, 0x3a2012, 0.02);
  K.box(M.plank, -1.1, 1.1, 0.0, 0.74, DZ - 0.5, DZ - 0.45, 0x3a2012, 0.01);
  K.box(M.paint, -0.6, 0.5, 0.82, 0.84, DZ - 0.3, DZ + 0.35, 0x2a4a3a, 0.005);
  K.at(0.95, 0.82, DZ + 0.1, -0.4, () => { K.box(M.paint, -0.12, 0.12, 0, 0.08, -0.1, 0.1, 0x14141a, 0.03); K.put(M.paint, new THREE.TorusGeometry(0.1, 0.025, 6, 14, Math.PI), 0, 0.14, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0x14141a); });
  for (let i = 0; i < 3; i++) K.box(M.paint, -0.4 + i * 0.06, -0.0 + i * 0.06, 0.84 + i * 0.006, 0.846 + i * 0.006, DZ - 0.1 + i * 0.03, DZ + 0.2 + i * 0.03, 0xf2ece0, 0.002);
  K.at(-1.1, 0.82, DZ - 0.3, 0.3, () => { K.put(M.brass, cyl(0.08, 0.1, 0.03, 12), 0, 0.015, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); K.beam(M.brass, [0, 0, 0], [0.05, 0.4, 0], 0.012, 0xc8a050, true, 6); K.put(M.paint, new THREE.ConeGeometry(0.12, 0.14, 14, 1, true), 0.1, 0.42, 0, 0, 0, 0.4, 1, 1, 1, 0x2a5a3a); });
  // chair
  K.at(0, 0, DZ - 1.0, 0, () => { K.box(M.paint, -0.32, 0.32, 0.45, 0.55, -0.3, 0.3, 0x6a2a20, 0.06); K.box(M.paint, -0.32, 0.32, 0.55, 1.35, -0.32, -0.2, 0x6a2a20, 0.08); for (const s of [-1, 1]) K.box(M.paint, s * 0.32 - 0.05, s * 0.32 + 0.05, 0.55, 0.75, -0.3, 0.25, 0x5a2218, 0.03); K.put(M.metal, cyl(0.03, 0.03, 0.45, 8), 0, 0.22, 0, 0, 0, 0, 1, 1, 1, 0x2a2a30); K.put(M.metal, cyl(0.25, 0.25, 0.03, 10), 0, 0.02, 0, 0, 0, 0, 1, 1, 1, 0x2a2a30); });
  K.at(3.4, 0, 0.2, -0.6, () => { K.box(M.paint, -0.4, 0.4, 0, 0.45, -0.35, 0.35, 0x3a2a3a, 0.08); K.box(M.paint, -0.4, 0.4, 0.45, 0.95, -0.35, -0.2, 0x3a2a3a, 0.06); });
  K.at(-3.6, 0, 0.8, 0.4, () => { K.put(M.paint, cyl(0.22, 0.18, 0.5, 12), 0, 0.25, 0, 0, 0, 0, 1, 1, 1, 0x8a4a2a); for (let i = 0; i < 6; i++) K.put(M.leaf, lumpGeo(i + 2, 1, 0.3), (R() - 0.5) * 0.4, 0.8 + R() * 0.6, (R() - 0.5) * 0.4, 0, R() * 6, 0, 0.3, 0.32, 0.3, 0x3a7a3a); });
  mesh(root, planeUV(3.2, 2.2, 1, 1), M.carpet, 0, 0.005, 0.0, -Math.PI / 2, 0, 0, false);
  K.build(root, 0);
  const lampG = glowAt(root, [-1.0, 1.2, DZ - 0.3], 1.0, '#ffc070', 0.5);
  const shaft = shaftAt(root, [2.0, 1.4, ZB + 1.4], 2.4, 3.6, 0.25, 0.55, 0.16, 0xfff0d0);
  const dust = motes(root, 50, [-1, 3, 0.4, 2.6, -3, 0], 53, 0.01);
  return { lampG, shaft, dust, DZ };
}

// ================================================================= FACTORY (1963)
function buildFactory(root) { const R = PT.rng(1963), K = new Kit(), X = 9, ZB = -12, ZF = 10, HT = 6;
  mesh(root, planeUV(20, 24, 4, 5), M.facFloor, 0, 0, -1, -Math.PI / 2, 0, 0, false);
  K.box(M.wallW, -X, X, 0, HT, ZB - 0.3, ZB, 0xffffff, 0.02); for (const s of [-1, 1]) K.box(M.wallW, s > 0 ? X : -X - 0.3, s > 0 ? X + 0.3 : -X, 0, HT, ZB, ZF, 0xffffff, 0.02);
  K.box(M.paint, -X, X, 0, 1.0, ZB, ZB + 0.06, 0x5a7a8a, 0.01); for (const s of [-1, 1]) K.box(M.paint, s > 0 ? X - 0.06 : -X, s > 0 ? X : -X + 0.06, 0, 1.0, ZB, ZF, 0x5a7a8a, 0.01);
  // sawtooth roof: slanted panels + skylight strips
  const skys = []; for (let i = 0; i < 6; i++) { const z = ZB + i * 3.8; K.put(M.wallW, new THREE.BoxGeometry(2 * X, 0.12, 3.6), 0, HT + 0.9, z + 1.9, -0.42, 0, 0, 1, 1, 1, 0xe0dcd0); skys.push(mesh(root, plane(2 * X - 0.4, 1.4), M.skyl, 0, HT + 1.05, z + 3.65, 0.25, 0, 0, false)); K.beam(M.paint, [-X, HT, z + 3.7], [X, HT, z + 3.7], 0.16, 0xb83a2a); }
  for (let i = 0; i < 5; i++) for (const s of [-1, 1]) K.box(M.paint, s * 4.2 - 0.14, s * 4.2 + 0.14, 0, HT, ZB + 2 + i * 4.6 - 0.14, ZB + 2 + i * 4.6 + 0.14, 0xb83a2a, 0.02);
  // big windows on the side walls
  for (let i = 0; i < 5; i++) for (const s of [-1, 1]) { const z = ZB + 2.5 + i * 4.4; mesh(root, plane(2.6, 2.0), M.skyl, s * (X - 0.02), 3.4, z, 0, -s * Math.PI / 2, 0, false); for (const d of [-0.65, 0, 0.65]) K.box(M.paint, s * X - 0.06, s * X + 0.06, 2.4, 4.4, z + d - 0.03, z + d + 0.03, 0x4a5a6a, 0.005); K.box(M.paint, s * X - 0.06, s * X + 0.06, 3.37, 3.43, z - 1.3, z + 1.3, 0x4a5a6a, 0.005); }
  // floor lines, car stands, engine stand, crates, tool trolleys, overhead crane rail
  for (const x of [-2.2, 2.2]) K.box(M.paint, x - 0.06, x + 0.06, 0.003, 0.008, ZB + 1, ZF - 1, 0xe8c03a, 0.002);
  for (let i = 0; i < 3; i++) { const z = -7 + i * 4.6; K.box(M.metal, -1.6, 1.6, 0, 0.12, z - 0.9, z + 0.9, 0x5a6a7a, 0.02); }
  K.at(-5.6, 0, -2.0, 0.4, () => { K.box(M.metal, -0.5, 0.5, 0, 0.08, -0.4, 0.4, 0x3a5a7a, 0.02); K.beam(M.metal, [0, 0.08, 0], [0, 0.7, 0], 0.08, 0x3a5a7a); K.box(M.metal, -0.45, 0.45, 0.7, 1.15, -0.3, 0.3, 0x8a8e98, 0.06); for (let i = 0; i < 6; i++) for (const s of [-1, 1]) K.put(M.chrome, cyl(0.045, 0.045, 0.1, 8), -0.35 + i * 0.14, 1.2, s * 0.18, 0, 0, s * 0.5, 1, 1, 1, 0xc8ccd4); K.put(M.chrome, cyl(0.12, 0.12, 0.08, 14), 0.5, 0.9, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0xb8bcc6); });
  for (const [x, z] of [[6.5, -9], [7.2, -8.2], [6.6, -7.4], [-7, 5], [-6.6, 6]]) K.box(M.plank, x - 0.5, x + 0.5, 0, 0.8, z - 0.4, z + 0.4, 0xb08a58, 0.03);
  for (const [x, z] of [[3.4, -4], [-3.4, 1]]) K.at(x, 0, z, 0, () => { K.box(M.paint, -0.35, 0.35, 0.7, 0.75, -0.25, 0.25, 0xb83a2a, 0.02); K.box(M.paint, -0.35, 0.35, 0.3, 0.34, -0.25, 0.25, 0xb83a2a, 0.02); for (const a of [-0.3, 0.3]) for (const b of [-0.2, 0.2]) K.beam(M.metal, [a, 0.05, b], [a, 0.75, b], 0.02, 0x3a3a44, true, 5); for (let i = 0; i < 4; i++) K.box(M.chrome, -0.25 + i * 0.14, -0.2 + i * 0.14, 0.75, 0.78, -0.15, 0.1, 0xb8bcc6, 0.005); });
  for (const s of [-1, 1]) K.beam(M.paint, [s * 3, HT - 0.4, ZB], [s * 3, HT - 0.4, ZF], 0.18, 0xe8c03a);
  K.box(M.paint, -3.1, 3.1, HT - 0.5, HT - 0.3, -3.1, -2.9, 0xe8c03a, 0.02);
  K.build(root, 0);
  const sign = mesh(root, plane(10, 1.56), M.facSign, 0, 4.6, ZB + 0.04, 0, 0, 0, false);
  const cars = [-7, -2.4, 2.2].map((z, i) => { const c = car('gt350'); c.position.set(0, 0.12, z); c.rotation.y = Math.PI / 2 + 0.0; root.add(c); return c; });
  const shafts = [0, 1, 2, 3].map((i) => shaftAt(root, [-1.5 + i * 1.4, 3.2, -9 + i * 4], 2.0, 7, 0.0, 0.35, 0.12, 0xfff4e0));
  const dust = motes(root, 70, [-4, 4, 0.5, 5, -9, 4], 63, 0.014);
  return { cars, sign, shafts, skys, dust };
}

// ================================================================= SHOW stand
function buildShow(root) { const R = PT.rng(1966), K = new Kit();
  mesh(root, planeUV(40, 40, 6, 6), H.toon({ color: 0x2a2430, emissive: 0x0a080e }), 0, 0, 0, -Math.PI / 2, 0, 0, false);
  const back = mesh(root, plane(22, 8), M.back66, 0, 4, -6, 0, 0, 0, false);
  for (const s of [-1, 1]) mesh(root, plane(10, 8), M.back66, s * 11, 4, -1, 0, -s * 0.9, 0, false);
  K.box(M.carpet, -6, 6, 0, 0.04, -5, 5, 0xffffff, 0.01);
  // turntable
  const tt = new THREE.Group(); tt.position.set(0, 0, -0.6); root.add(tt); { const KK = new Kit(); KK.put(M.paint, cyl(3.4, 3.5, 0.28, 64), 0, 0.14, 0, 0, 0, 0, 1, 1, 1, 0xe8e4ea); KK.put(M.chrome, new THREE.TorusGeometry(3.45, 0.04, 8, 64), 0, 0.27, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8dce4); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; KK.put(M.paint, new THREE.BoxGeometry(0.02, 0.005, 3.2), Math.cos(a) * 1.6, 0.281, Math.sin(a) * 1.6, 0, -a, 0, 1, 1, 1, 0xc8c4cc); } KK.build(tt); }
  // rope posts, plants, spot rigs
  for (let i = 0; i < 9; i++) { const a = -Math.PI * 0.95 + i * Math.PI * 0.9 / 8 + Math.PI, x = Math.cos(a) * 5.2, z = -0.6 - Math.sin(a) * 4.2; if (z < 0.8) continue; KR.put(M.gold, lathe('lbpost', [[0.001, 0], [0.16, 0], [0.16, 0.04], [0.04, 0.08], [0.03, 0.95], [0.06, 1.0], [0.001, 1.04]], 14), x, 0, z, 0, 0, 0, 1, 1, 1, 0xd8a83a); }
  const KR = new Kit(); for (let i = 0; i < 6; i++) { const a = Math.PI * 0.12 + i * Math.PI * 0.76 / 5, x0 = Math.cos(a) * 5.2, z0 = -0.6 + Math.sin(a) * 4.2, a1 = a + Math.PI * 0.76 / 5, x1 = Math.cos(a1) * 5.2, z1 = -0.6 + Math.sin(a1) * 4.2; for (let k = 0; k < 8; k++) { const t0 = k / 8, t1 = (k + 1) / 8, y0 = 0.92 - 0.18 * Math.sin(Math.PI * t0), y1 = 0.92 - 0.18 * Math.sin(Math.PI * t1); KR.beam(M.velvet, [x0 + (x1 - x0) * t0, y0, z0 + (z1 - z0) * t0], [x0 + (x1 - x0) * t1, y1, z0 + (z1 - z0) * t1], 0.03, 0x9a1a2a, true, 6); } }
  for (const [x, z] of [[-6.8, -4], [6.8, -4], [-8, 1], [8, 1]]) K.at(x, 0, z, 0, () => { K.put(M.paint, cyl(0.35, 0.28, 0.6, 14), 0, 0.3, 0, 0, 0, 0, 1, 1, 1, 0xd8d4dc); for (let i = 0; i < 7; i++) K.put(M.leaf, lumpGeo(i + 4, 1, 0.3), (R() - 0.5) * 0.6, 1.0 + R() * 1.0, (R() - 0.5) * 0.6, 0, R() * 6, 0, 0.4, 0.45, 0.4, 0x3a7a3a); });
  for (const [x, z] of [[-4.5, 3.5], [4.5, 3.5], [-4, -4.5], [4, -4.5]]) { K.beam(M.metal, [x, 0, z], [x, 6.5, z], 0.06, 0x2a2a30, true, 8); K.put(M.metal, cyl(0.18, 0.24, 0.45, 14), x * 0.92, 6.4, z * 0.92, 0.6 * Math.sign(z), 0, -0.4 * Math.sign(x), 1, 1, 1, 0x2a2a30); }
  K.build(root, 0); const ropes = new THREE.Group(); root.add(ropes); KR.build(ropes);
  const spots = [[-4.5, 3.5], [4.5, 3.5], [-4, -4.5], [4, -4.5]].map(([x, z]) => mesh(root, sph(0.14, 10, 8), M.spot, x * 0.9, 6.25, z * 0.9, 0, 0, 0, false));
  const beams = [[-4.5, 3.5], [4.5, 3.5], [-4, -4.5], [4, -4.5]].map(([x, z]) => { const s = shaftAt(root, [x * 0.45, 3.2, z * 0.45 - 0.3], 2.4, 7, Math.atan2(-x, -z), 0, 0.14, 0xfff0d8); s.lookAt(root.localToWorld(new THREE.Vector3(x * 0.9, 6.3, z * 0.9))); s.rotateX(Math.PI / 2); return s; });
  const miura = car('miura'); miura.position.set(0, 0.28, 0); tt.add(miura);
  const tnew = tractorNew(0xf08a1a); tnew.position.set(-0.3, 0.28, 0); tnew.visible = false; tt.add(tnew);
  // dust sheet over the tractor: lumpy cloth + its pivot (setCover lifts it)
  const cover = new THREE.Group(); cover.position.set(0, 0.28, -0.6); root.add(cover); { const cg = new THREE.BoxGeometry(5.4, 3.4, 2.7, 24, 16, 14), p = cg.attributes.position; for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i) + 1.7, z = p.getZ(i); const top = y / 3.4, w = 1 - 0.18 * top * top; x *= w; z *= w * (1 - 0.12 * top); const n = 0.05 * Math.sin(x * 4.1 + z * 2.3) + 0.04 * Math.sin(y * 6.1 + x * 1.3); p.setXYZ(i, x + n, Math.max(0, y + n * 0.6 - (y < 0.05 ? 0 : 0)), z + n); }
    cg.computeVertexNormals(); cg.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(p.count * 3).fill(1), 3)); const cm = new THREE.Mesh(cg, M.cloth); cm.castShadow = cm.receiveShadow = true; cover.add(cm); cover.userData.m = cm; }
  const glows = spots.map((s) => glowAt(root, s.position.toArray(), 1.6, '#fff0d0', 0.55));
  const flashG = glowAt(root, [0, 1.6, 4.5], 9, '#ffffff', 0.0);
  const dust = motes(root, 90, [-5, 5, 0.4, 6, -5, 4], 67, 0.012);
  return { tt, miura, tnew, cover, back, beams, spots, glows, flashG, dust, ropes };
}

// ================================================================= lights, grades, API
const SET_LIGHT = {
  farm: { top: '#3f7ad0', hor: '#c8dcf0', fog: '#d8e4ee', fogN: 60, fogF: 520, sky: '#a8bcf0', ground: '#6a6448', hemiI: 0.72, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#ffe8c0', sunI: 3.8, az: 40, el: 44, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  farmField: { top: '#3f7ad0', hor: '#d0e0f0', fog: '#d8e4ee', fogN: 60, fogF: 520, sky: '#a8bcf0', ground: '#6a6448', hemiI: 0.74, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#fff0d0', sunI: 3.7, az: -30, el: 40, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  farmGold: { top: '#4a5aa8', hor: '#ffc890', fog: '#f0c8a0', fogN: 50, fogF: 420, sky: '#9a90d8', ground: '#5a4a50', hemiI: 0.9, fillCol: '#7078d8', fillI: 0.32, sunCol: '#ffb070', sunI: 3.4, az: 55, el: 13, disc: '#fff0c8', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff2e2', fxTint: '#fff6ea', shafts: 0.6 },
  shopNight: { top: '#000000', hor: '#141a30', fog: '#141a30', fogN: 10, fogF: 50, sky: '#5a6ab8', ground: '#2a2030', hemiI: 0.62, fillCol: '#4a58b8', fillI: 0.4, sunCol: '#a8b8ff', sunI: 1.1, az: -60, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#e8e4f8', fxTint: '#ffffff', shafts: 0 },
  shopBench: { top: '#000000', hor: '#141a30', fog: '#141a30', fogN: 10, fogF: 50, sky: '#7a7ab8', ground: '#3a2a30', hemiI: 0.75, fillCol: '#5a68c0', fillI: 0.35, sunCol: '#ffd8a8', sunI: 1.6, az: 20, el: 60, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  office: { top: '#000000', hor: '#2a1e18', fog: '#2a1e18', fogN: 10, fogF: 50, sky: '#ffe8c8', ground: '#5a3a2a', hemiI: 0.95, fillCol: '#8a90c8', fillI: 0.3, sunCol: '#ffe8c0', sunI: 2.8, az: 150, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  factory: { top: '#000000', hor: '#c8d0d8', fog: '#c8ccd0', fogN: 20, fogF: 80, sky: '#e8eef8', ground: '#7a7470', hemiI: 1.0, fillCol: '#8a98d8', fillI: 0.35, sunCol: '#fff4e0', sunI: 2.8, az: 25, el: 58, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  factoryGT: { top: '#000000', hor: '#c8d0d8', fog: '#c8ccd0', fogN: 20, fogF: 80, sky: '#e8eef8', ground: '#7a7470', hemiI: 0.95, fillCol: '#8a98d8', fillI: 0.38, sunCol: '#fff0d8', sunI: 3.0, az: -30, el: 50, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  showHook: { top: '#000000', hor: '#120a18', fog: '#120a18', fogN: 14, fogF: 60, sky: '#ffd8b0', ground: '#2a1a28', hemiI: 0.5, fillCol: '#6a5ab8', fillI: 0.4, sunCol: '#fff0d8', sunI: 3.0, az: 20, el: 62, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  show66: { top: '#000000', hor: '#1a0e1a', fog: '#1a0e1a', fogN: 16, fogF: 70, sky: '#ffd8b0', ground: '#3a2228', hemiI: 0.7, fillCol: '#7a68c8', fillI: 0.38, sunCol: '#fff0d8', sunI: 2.8, az: -20, el: 58, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  showNow: { top: '#000000', hor: '#0a1420', fog: '#0a1420', fogN: 16, fogF: 70, sky: '#b0d0ff', ground: '#1a2430', hemiI: 0.7, fillCol: '#5a88e8', fillI: 0.45, sunCol: '#f0f4ff', sunI: 2.8, az: 15, el: 60, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#f0f4ff', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  farm: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.1, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.36, 0.86], vig: [0.24, 0.5, '#4a3a5a'] } },
  farmField: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.12, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.36, 0.86], vig: [0.24, 0.5, '#4a3a5a'] } },
  farmGold: { look: 'golden', over: { exp: 1.06, con: 1.22, sat: 1.08, tS: ['#3a3a8a', 0.18], tH: ['#ffc890', 0.1], bloom: [0.42, 0.78], hal: [0.24, '#ffa860'], vig: [0.3, 0.48, '#1e1a3a'] } },
  shopNight: { look: 'night', over: { exp: 1.16, con: 1.22, sat: 1.04, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.5, 0.68], hal: [0.3, '#ffa050'], vig: [0.4, 0.42, '#08081a'] } },
  shopBench: { look: 'office', over: { exp: 1.12, con: 1.22, sat: 1.06, lift: [0.03, 0.022, 0.05], tS: ['#2a2a7a', 0.2], tH: ['#ffc888', 0.12], bloom: [0.44, 0.74], hal: [0.26, '#ff9a50'], vig: [0.36, 0.44, '#14081a'] } },
  office: { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.06, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.42, 0.78], hal: [0.26, '#ff9a50'], vig: [0.34, 0.46, '#2a1420'] } },
  factory: { look: 'day', over: { exp: 1.04, con: 1.2, sat: 1.06, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c8', 0.06], bloom: [0.38, 0.84], vig: [0.28, 0.48, '#3a2a4a'] } },
  factoryGT: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.06, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c8', 0.06], bloom: [0.38, 0.84], vig: [0.28, 0.48, '#3a2a4a'] } },
  showHook: { look: 'office', over: { exp: 1.14, con: 1.28, sat: 1.12, lift: [0.03, 0.016, 0.04], tS: ['#3a1a5a', 0.24], tH: ['#ffc888', 0.12], bloom: [0.44, 0.7], hal: [0.32, '#ff9a50'], vig: [0.44, 0.4, '#0a040c'] } },
  show66: { look: 'office', over: { exp: 1.12, con: 1.26, sat: 1.1, lift: [0.035, 0.018, 0.04], tS: ['#3a1a5a', 0.22], tH: ['#ffc888', 0.12], bloom: [0.46, 0.72], hal: [0.3, '#ff9a50'], vig: [0.4, 0.42, '#14060c'] } },
  showNow: { look: 'night', over: { exp: 1.14, con: 1.24, sat: 1.08, lift: [0.02, 0.03, 0.06], tS: ['#1a2a7a', 0.24], tH: ['#ffd8a8', 0.08], bloom: [0.46, 0.7], hal: [0.24, '#80a0ff'], vig: [0.4, 0.42, '#040812'] } },
};

export function buildLB(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { build: 1, cover: 1, mood: 'farm', tt: 0, drive: 0, payoff: 0, flash: 0 };
  let fm, sh, of, fc, sw;
  const API = makeAPI(ctx, { prefix: 'lb_', origin: LB_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { farm: 'day', farmField: 'day', farmGold: 'day', shopNight: 'office', shopBench: 'office', office: 'office', factory: 'office', factoryGT: 'office', showHook: 'office', show66: 'office', showNow: 'office' },
    practicals: (name, F, W3) => { const fl = 1 + 0.05 * Math.sin(F * 0.7) + 0.03 * Math.sin(F * 1.9);
      if (name === 'shopNight' || name === 'shopBench') return [{ p: W3('shop', [0.5, 3.2, 0.4]), col: '#ffc070', I: 7 * fl, d: 9 }, { p: W3('shop', [-1.2, 3.2, -3.2]), col: '#ffc070', I: (name === 'shopBench' ? 6 : 4) * fl, d: 7 }, { p: W3('shop', [-4.6, 2.8, -3.6]), col: '#7a8aff', I: 2.4, d: 7 }, { p: W3('shop', [4.6, 2.8, -3.6]), col: '#7a8aff', I: 2.4, d: 7 }];
      if (name === 'office') return [{ p: W3('office', [-1.0, 1.3, -1.9]), col: '#ffc070', I: 3.2 * fl, d: 6 }, { p: W3('office', [2.0, 2.2, -2.4]), col: '#fff0d8', I: 3.0, d: 7 }, { p: W3('office', [0, 2.8, 1.5]), col: '#ffe0b8', I: 2.2, d: 8 }];
      if (name === 'factory' || name === 'factoryGT') return [{ p: W3('factory', [0, 5, -4]), col: '#fff4e0', I: 6, d: 16 }, { p: W3('factory', [0, 4, 3]), col: '#fff4e0', I: 4, d: 12 }];
      if (name.startsWith('show')) { const c = name === 'showNow' ? '#e0ecff' : '#fff0d8'; return [{ p: W3('show', [-4, 6, 3]), col: c, I: 9, d: 16 }, { p: W3('show', [4, 6, 3]), col: c, I: 9, d: 16 }, { p: W3('show', [0, 5, -4]), col: c, I: name === 'showHook' ? 4 : 7, d: 14 }, { p: W3('show', [0, 1.4, 5]), col: '#ffffff', I: 22 * ST.flash, d: 12 }]; }
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'farm' && fm) { tickMotes(fm.dust, f, 0.6); fm.fieldT.forEach((t, i) => { t.position.x = 16 + i * 5 - ST.drive * (3 + i); t.position.z = -22 - i * 6 + ST.drive * 1.2; t.position.y = lf(t.position.x, t.position.z) + 0.01 * Math.sin(T * 9 + i); t.rotation.y = 0.2 * i + 2.9; }); }
      if (cur === 'shop' && sh) { sh.lamps.forEach((g, i) => (g.material.opacity = g.userData.op * (0.9 + 0.1 * Math.sin(f * 0.7 + i)))); tickMotes(sh.dust, f, 0.3); }
      if (cur === 'office' && of) { of.lampG.material.opacity = of.lampG.userData.op * (0.92 + 0.08 * Math.sin(f * 0.8)); tickMotes(of.dust, f, 0.3); }
      if (cur === 'factory' && fc) tickMotes(fc.dust, f, 0.4);
      if (cur === 'show' && sw) { sw.tt.rotation.y = ST.tt; tickMotes(sw.dust, f, 0.3); sw.flashG.material.opacity = 0.6 * ST.flash; } },
    mood: (name) => { ST.mood = name; if (sw) { const now = name === 'showNow'; sw.back.material = now ? M.backNow : M.back66; sw.miura.visible = !now; sw.tnew.visible = now; sw.cover.visible = now && ST.cover > 0.001; sw.ropes.visible = name !== 'showHook'; }
      if (fm) { const gold = name === 'farmGold'; fm.miura.visible = gold; fm.gt.visible = name === 'farm' && ST.gtOn; fm.build.position.set(gold ? -2.0 : 0.6, 0, gold ? -0.4 : -1.4); fm.build.rotation.y = gold ? 0.25 : 0.5; } },
    apply: (v) => { if (v.build != null) API.setBuild(v.build); if (v.cover != null) API.setCover(v.cover); if (v.gt != null) API.setGT(v.gt); } });
  fm = buildFarm(API.groups.farm); sh = buildShop(API.groups.shop); of = buildOffice(API.groups.office); fc = buildFactory(API.groups.factory); sw = buildShow(API.groups.show);
  API.parts = { fm, sh, of, fc, sw };
  // parts drop in one after another (t 0..1); each part overshoots slightly
  API.setBuild = (t) => { ST.build = t; const P = fm.build.userData.parts, n = P.length; P.forEach((g, i) => { const k = clamp01(t * n - i), e = k < 1 ? 1 - (1 - k) ** 3 : 1; const f0 = g.userData.from; g.position.set(f0[0] * (1 - e), f0[1] * (1 - e), f0[2] * (1 - e)); g.visible = k > 0.001; const s = k < 1 ? 0.6 + 0.4 * e + 0.12 * Math.sin(Math.PI * e) : 1; g.scale.setScalar(s); }); };
  API.setCover = (t) => { ST.cover = t; const k = clamp01(t); sw.cover.position.y = 0.28 + (1 - k) * 7; sw.cover.rotation.z = (1 - k) * 0.5; sw.cover.visible = ST.mood === 'showNow' && k > 0.001; };
  API.setTurn = (a) => { ST.tt = a; if (sw) sw.tt.rotation.y = a; };
  API.setDrive = (d) => { ST.drive = d; };
  API.setGT = (on) => { ST.gtOn = !!on; fm.gt.visible = !!on && ST.mood === 'farm'; };
  API.setFlash = (k) => { ST.flash = k; };
  API.glows = { farm: [], shop: sh.lamps, office: [of.lampG], factory: [], show: [...sw.glows, sw.flashG] };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  const V = API.V;
  API.views = [
    V('farm', [1.5, 1.7, 13], [-1, 1.4, -3], 46, 0.8, [0, 1.2, 0]), // 0 yard wide
    V('farm', [3.4, 1.3, 3.2], [0.6, 0.9, -1.4], 44, 2.0, [0.6, 0.9, -1.4], { build: 1 }), // 1 tractor close
    V('farm', [-1.5, 1.4, 6.5], [-5.2, 0.9, 1.4], 44, 1.6, [-5.2, 0.9, 1.6], { gt: 1 }), // 2 GT by the house
    V('farmField', [16.5, 1.9, -5.5], [20, 0.9, -26], 42, 0.8, [18, 1, -14]), // 3 field tractors
    V('farmGold', [0.5, 1.5, 9.5], [-0.2, 1.0, 0], 44, 1.2, [0, 1, 0.8]), // 4 payoff pair
    V('shopNight', [3.2, 1.7, 5.5], [0.2, 1.0, -0.5], 48, 1.2, [0.6, 0.9, 0.3]), // 5 GT in the works
    V('shopBench', [-1.2, 1.55, -2.65], [-1.2, 0.95, -3.62], 40, 3.0, [-1.2, 0.95, -3.62]), // 6 bench: two clutches
    V('office', [2.6, 1.5, 3.2], [-0.2, 1.1, -1.4], 46, 1.2, [0, 1.1, -1.2]), // 7 office wide
    V('factory', [5.5, 1.8, 7], [-1, 1.6, -6], 48, 0.8, [0, 1.2, -2]), // 8 factory hall
    V('factoryGT', [3.2, 1.2, 0.8], [0, 0.7, -2.4], 42, 1.6, [0, 0.8, -2.4]), // 9 silver GT close
    V('show66', [0, 1.6, 9], [0, 0.8, -0.6], 42, 1.2, [0, 0.8, 0]), // 10 stand wide
    V('showHook', [2.4, 0.7, 4.2], [0, 0.65, -0.6], 40, 1.6, [0, 0.6, -0.4]), // 11 low hook
    V('showNow', [0, 1.8, 10], [0, 1.4, -0.6], 44, 1.0, [0, 1.4, 0], { cover: 1 }), // 12 covered tractor
    V('showNow', [0, 1.8, 10], [0, 1.4, -0.6], 44, 1.0, [0, 1.4, 0], { cover: 0 }), // 13 revealed
  ];
  API.setBuild(1); API.setCover(1); API.setGT(0); API.tick(0);
  return API;
}
