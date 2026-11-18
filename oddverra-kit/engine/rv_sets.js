// rv_sets.js [RV-sets]: sets for "Paul Revere never shouted 'The British are coming!'" (Oddverra short). All period details are our own
// stylization (no real map art, no logos). Each set: local frame, floor y = 0, camera side +z. Test flag ?rvview=N (main.js).
//   town  : Boston's North End at night, April 18 1775: a cobbled lane running away from camera (along -z) between brick and clapboard
//           houses (lit windows, shutters, a tavern sign, a 1707 Union flag over one door), oil lamps, and Christ Church's (Old North)
//           brick tower + white steeple at the end; two signal lanterns in the steeple window. Mood 'townNight'.   origin (-112000,0,0)
//   river : the Charles at night from the Charlestown bank: a dock, reeds, a far Boston skyline with the steeple (two lanterns),
//           a moored warship silhouette, moon path on the water. Mood 'riverNight'.                                origin (-112000,0,800)
//   road  : the country road west (runs along x): stone walls, fields, bare April trees, farmhouses with lit windows, a farmhouse
//           door by the road, fingerposts (LEXINGTON / LINCOLN / CONCORD / BOSTON NECK), Concord's meeting house + bell at x=+46.
//           Mood 'roadNight'.                                                                                         origin (-112000,0,1600)
//   study : a poet's study, 1860: panelled walls, bookshelves, a desk with an oil lamp, inkwell, quill and the poem's manuscript,
//           a fireplace, a night window. Mood 'study'.                                                                origin (-114500,0,0)
//   park  : a sunny brick plaza with a big bronze rider statue on a granite plinth, trees, benches, a tiny overlooked marker stone.
//           Mood 'park'.                                                                                              origin (-114500,0,800)
import { H, TAU, sm, SERIF, SANS, cyl, sph, plane, planeUV, mesh, nond, lumpGeo, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';

export const RV_ORIGIN = { town: [-112000, 0, 0], river: [-112000, 0, 800], road: [-112000, 0, 1600], study: [-114500, 0, 0], park: [-114500, 0, 800] };
const GROUP_OF = { townNight: 'town', riverNight: 'river', roadNight: 'road', study: 'study', park: 'park' };
let THREE, PT, M;

// ---------------------------------------------------------------- painters
function plainTex(col, k = 0.1) { return (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 1 - k / 2 + k * PT.fbm(u, v, 4, 4, 3, 5)); }; }
function cobbleTex(g, w, h) { g.fillStyle = '#4a4450'; g.fillRect(0, 0, w, h); const R = PT.rng(17), n = 14, c = w / n;
  for (let j = 0; j < n * 1.2; j++) for (let i = 0; i < n; i++) { const x = (i + 0.5 + (j % 2) * 0.5 + (R() - 0.5) * 0.25) * c, y = (j + 0.5) * c * 0.85, col = ['#8a8290', '#7a7484', '#9a9098', '#6e6878', '#8a8478'][(R() * 5) | 0];
    g.fillStyle = col; g.beginPath(); g.ellipse(x, y, c * 0.42, c * 0.34, R(), 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,0.14)'; g.beginPath(); g.ellipse(x - c * 0.1, y - c * 0.1, c * 0.18, c * 0.1, 0, 0, TAU); g.fill(); }
  PT.modulate(g, w, h, (u, v) => 0.85 + 0.2 * PT.fbm(u, v, 4, 4, 3, 9)); }
function waterTex(g, w, h) { g.fillStyle = '#16244a'; g.fillRect(0, 0, w, h); const R = PT.rng(5); for (let i = 0; i < 260; i++) { const y = R() * h, x = R() * w, L = 10 + R() * 40; g.strokeStyle = `rgba(${120 + R() * 60 | 0},${150 + R() * 60 | 0},230,${0.18 + R() * 0.25})`; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L / 2, y - 3, x + L, y); g.stroke(); } }
function moonPathTex(g, w, h) { g.clearRect(0, 0, w, h); const R = PT.rng(9); for (let i = 0; i < 220; i++) { const v = R(), y = v * h, spread = (0.08 + 0.4 * v) * w, x = w / 2 + (R() - 0.5) * spread, L = 6 + R() * 26 * (0.3 + v); g.strokeStyle = `rgba(255,244,200,${0.3 + 0.6 * R()})`; g.lineWidth = 1.5 + 2 * v; g.beginPath(); g.moveTo(x - L / 2, y); g.lineTo(x + L / 2, y); g.stroke(); } }
function winTex(o) { return (g, w, h) => { g.fillStyle = o.frame || '#f2ece0'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.a); gr.addColorStop(1, o.b); g.fillStyle = gr; g.fillRect(w * 0.08, h * 0.06, w * 0.84, h * 0.88);
  if (o.lit) { g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(w * 0.12, h * 0.1, w * 0.2, h * 0.8); if (o.curtain) { g.fillStyle = o.curtain; g.beginPath(); g.moveTo(w * 0.08, h * 0.06); g.quadraticCurveTo(w * 0.3, h * 0.4, w * 0.12, h * 0.94); g.lineTo(w * 0.08, h * 0.94); g.fill(); g.beginPath(); g.moveTo(w * 0.92, h * 0.06); g.quadraticCurveTo(w * 0.7, h * 0.4, w * 0.88, h * 0.94); g.lineTo(w * 0.92, h * 0.94); g.fill(); } }
  g.fillStyle = o.frame || '#f2ece0'; for (let i = 1; i < 3; i++) g.fillRect(w * 0.08 + i * w * 0.84 / 3 - 3, 0, 6, h); for (let j = 1; j < 4; j++) g.fillRect(0, h * 0.06 + j * h * 0.88 / 4 - 3, w, 6); }; }
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); if (!o.flat) PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * PT.fbm(u, v, 6, 2, 3, 7)); g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08);
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : 0.34 + i * 0.36), w * 0.84, h * (lines.length === 1 ? 0.5 : 0.28), { col: o.col || '#3a2414', font: o.font || SERIF })); }; }
function unionTex(g, w, h) { // the 1707 Union flag (no St Patrick's saltire: that came in 1801)
  g.fillStyle = '#1e3a8a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f4f2ee'; g.lineWidth = h * 0.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
  g.fillStyle = '#f4f2ee'; g.fillRect(w * 0.42, 0, w * 0.16, h); g.fillRect(0, h * 0.37, w, h * 0.26); g.fillStyle = '#c8202a'; g.fillRect(w * 0.45, 0, w * 0.1, h); g.fillRect(0, h * 0.41, w, h * 0.18); PT.modulate(g, w, h, (u, v) => 0.86 + 0.16 * PT.fbm(u, v, 4, 2, 3, 3)); }
function skylineTex(g, w, h) { g.clearRect(0, 0, w, h); const R = PT.rng(1775); g.fillStyle = '#0e1430'; g.beginPath(); g.moveTo(0, h); let x = 0; while (x < w) { const bw = 30 + R() * 60, bh = h * (0.18 + R() * 0.22); g.lineTo(x, h - bh); g.lineTo(x + bw * 0.5, h - bh - bw * 0.3); g.lineTo(x + bw, h - bh); x += bw; } g.lineTo(w, h); g.fill();
  for (let i = 0; i < 90; i++) { g.fillStyle = R() < 0.6 ? '#ffd27a' : '#ffb050'; g.fillRect(R() * w, h * (0.72 + R() * 0.24), 5, 7); } }
function hillsTex(cols) { return (g, w, h) => { g.clearRect(0, 0, w, h); cols.forEach(([y0, c, a], k) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * y0 + Math.sin(x * 0.011 + y0 * 9 + k) * h * a + Math.sin(x * 0.029 + y0) * h * a * 0.4); g.lineTo(w, h); g.fill(); }); }; }
function paperTex(g, w, h) { g.fillStyle = '#d8c8a4'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 5, 5, 3, 3));
  txt(g, "Paul Revere's Ride", w / 2, h * 0.09, w * 0.84, h * 0.075, { col: '#1a1028', font: SERIF, italic: true }); g.strokeStyle = 'rgba(30,20,50,0.9)'; g.lineWidth = 3; const R = PT.rng(11);
  for (let i = 0; i < 17; i++) { const y = h * (0.18 + i * 0.045); let x = w * 0.1; g.beginPath(); g.moveTo(x, y); while (x < w * (0.7 + R() * 0.2)) { const s = 6 + R() * 10; g.quadraticCurveTo(x + s / 2, y - 5 - R() * 8, x + s, y); x += s + (R() < 0.15 ? 9 : 0); if (R() < 0.15) g.moveTo(x, y); } g.stroke(); }
  g.fillStyle = 'rgba(40,30,60,0.6)'; g.beginPath(); g.ellipse(w * 0.8, h * 0.9, 16, 7, 0.4, 0, TAU); g.fill(); }
function shelfBooks(g, w, h) { g.fillStyle = '#3a2418'; g.fillRect(0, 0, w, h); const R = PT.rng(3); for (let r = 0; r < 5; r++) { const y0 = r * h / 5; g.fillStyle = '#2a180e'; g.fillRect(0, y0 + h / 5 - 8, w, 8); let x = 4; while (x < w - 10) { const bw = 10 + R() * 16, bh = h / 5 * (0.62 + R() * 0.3); g.fillStyle = ['#7a2a2a', '#2a4a6a', '#5a6a2a', '#8a6a2a', '#4a2a5a', '#2a5a4a', '#9a8a6a'][(R() * 7) | 0]; g.fillRect(x, y0 + h / 5 - 8 - bh, bw, bh); g.fillStyle = 'rgba(240,210,120,0.6)'; g.fillRect(x + 2, y0 + h / 5 - 8 - bh * 0.8, bw - 4, 3); x += bw + 1; } } }
function plaqueTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#6a4a2a'; g.fillRect(0, 0, w, h); g.strokeStyle = o.rim || '#d8b060'; g.lineWidth = h * 0.05; g.strokeRect(h * 0.05, h * 0.05, w - h * 0.1, h - h * 0.1); lines.forEach((s, i) => txt(g, s, w / 2, h * (0.32 + i * 0.36 / Math.max(1, lines.length - 1)), w * 0.8, h * (lines.length > 1 ? 0.26 : 0.4), { col: o.col || '#f0d890', font: SERIF })); PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * PT.fbm(u, v, 4, 2, 3, 2)); }; }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.cobble = vc({ map: T(512, 512, cobbleTex) }); m.cobble.map.wrapS = m.cobble.map.wrapT = THREE.RepeatWrapping;
  m.brickA = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#9a4434', rows: 30, cols: 7, seed: 61 })) }); m.brickB = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#7a3a34', rows: 30, cols: 7, seed: 62 })) });
  m.siding = vc({ map: T(256, 256, (g, w, h) => PT.siding(g, w, h, { base: '#d8d0c0', n: 18, seed: 41 })) }); m.sidingB = vc({ map: T(256, 256, (g, w, h) => PT.siding(g, w, h, { base: '#5a7a8a', n: 18, seed: 42 })) }); m.sidingC = vc({ map: T(256, 256, (g, w, h) => PT.siding(g, w, h, { base: '#c8a060', n: 18, seed: 43 })) });
  m.shing = vc({ map: T(256, 256, (g, w, h) => PT.shingles(g, w, h, { base: '#4a3a3a', n: 12, seed: 51 })) });
  m.white = vc(); m.paint = vc(); m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 8, seed: 51 })) }); m.dark = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#4a2e1e', n: 6, seed: 33 })) });
  m.stoneW = vc({ map: T(256, 256, (g, w, h) => PT.stone(g, w, h, { base: '#8a8a90', n: 5, seed: 71 })) });
  m.winLit = new THREE.MeshBasicMaterial({ map: T(128, 192, winTex({ a: '#ffe08a', b: '#ff9a40', lit: 1, curtain: 'rgba(160,50,40,0.55)' })), fog: false }); m.winLit.color.setScalar(1.15);
  m.winLit2 = new THREE.MeshBasicMaterial({ map: T(128, 192, winTex({ a: '#fff0b0', b: '#ffb860', lit: 1 })), fog: false }); m.winLit2.color.setScalar(1.1);
  m.winDark = toon({ map: T(128, 192, winTex({ a: '#2a3a6a', b: '#141c3a' })), emissive: 0x0a0e20 }); m.winDark.emissiveMap = m.winDark.map;
  m.water = toon({ map: T(512, 512, waterTex), emissive: 0x0a1430 }); m.water.emissiveMap = m.water.map; m.water.map.wrapS = m.water.map.wrapT = THREE.RepeatWrapping;
  m.moonPath = new THREE.MeshBasicMaterial({ map: T(256, 512, moonPathTex), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  m.skyline = new THREE.MeshBasicMaterial({ map: T(1024, 256, skylineTex), transparent: true, depthWrite: false, fog: false });
  m.union = em(T(256, 160, unionTex), 0x101828, { side: THREE.DoubleSide });
  m.grassN = vc({ map: T(512, 512, (g, w, h) => PT.grass(g, w, h, { base: '#5a7a3a', seed: 23 })) }); m.grassN.map.wrapS = m.grassN.map.wrapT = THREE.RepeatWrapping;
  m.road = vc({ map: T(256, 512, (g, w, h) => PT.dirt(g, w, h, { base: '#9a8060', seed: 11 })) }); m.road.map.wrapS = m.road.map.wrapT = THREE.RepeatWrapping;
  m.hillsN = new THREE.MeshBasicMaterial({ map: T(1024, 256, hillsTex([[0.45, '#2a3460', 0.06], [0.6, '#1e2848', 0.07], [0.74, '#141c38', 0.08]])), transparent: true, fog: false, depthWrite: false });
  m.hillsP = new THREE.MeshBasicMaterial({ map: T(1024, 256, hillsTex([[0.45, '#a8b0d8', 0.05], [0.6, '#8aa0b8', 0.07], [0.74, '#6a8a78', 0.08]])), transparent: true, fog: false, depthWrite: false });
  m.leaf = vc(); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.metal = vc({ emissive: 0x0c0c12 }); m.brass = vc({ emissive: 0x3a2408 });
  m.bronze = toon({ color: 0x6a5a3a, emissive: 0x241a08 }); m.granite = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#9a96a0'; g.fillRect(0, 0, w, h); grain(g, w, h, 'rgba(40,40,50,1)', 1600, 4, 0.35); grain(g, w, h, 'rgba(255,240,230,1)', 700, 5, 0.3); }) });
  m.lantGlass = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb040).multiplyScalar(1.35), fog: false });
  m.lampGlass = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe0a0).multiplyScalar(1.8), fog: false });
  m.moon = new THREE.MeshBasicMaterial({ map: T(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,250,225,1)'); gr.addColorStop(0.42, 'rgba(255,248,215,1)'); gr.addColorStop(0.46, 'rgba(220,230,255,0.35)'); gr.addColorStop(1, 'rgba(160,180,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(200,190,170,0.4)'; for (const [x, y, r] of [[0.42, 0.42, 0.06], [0.56, 0.5, 0.04], [0.48, 0.58, 0.035]]) { g.beginPath(); g.arc(w * x, h * y, w * r, 0, TAU); g.fill(); } }), transparent: true, depthWrite: false, fog: false });
  m.panel = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#5a3422'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(30,14,8,0.6)'; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28); g.strokeStyle = 'rgba(255,220,170,0.15)'; g.lineWidth = 3; g.strokeRect(22, 22, w - 44, h - 44); PT.modulate(g, w, h, (u, v) => 0.9 + 0.14 * PT.fbm(u, v, 3, 8, 3, 4)); }) });
  m.wallpaper = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#4a5a3a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(220,200,120,0.25)'; for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse((i + (j % 2) * 0.5) * w / 8, j * h / 8, 6, 10, 0, 0, TAU); g.fill(); } PT.modulate(g, w, h, (u, v) => 0.9 + 0.1 * PT.fbm(u, v, 4, 4, 3, 5)); }) });
  m.books = vc({ map: T(512, 512, shelfBooks) }); m.paper = H.M.em(T(512, 700, paperTex), 0x0c0a08, { side: THREE.DoubleSide });
  m.rug = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#7a2a2a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(232,192,120,0.6)'; g.lineWidth = 10; g.strokeRect(16, 16, w - 32, h - 32); g.lineWidth = 4; g.strokeRect(36, 36, w - 72, h - 72); PT.modulate(g, w, h, (u, v) => 0.86 + 0.18 * PT.fbm(u, v, 8, 8, 3, 2)); }) });
  m.paving = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#b0604a', rows: 16, cols: 8, seed: 66 })) }); m.paving.map.wrapS = m.paving.map.wrapT = THREE.RepeatWrapping;
  m.sky = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  const sign = (lines, o, w = 512, h = 160) => em(T(w, h, signTex(lines, o)), 0x201810, { side: THREE.DoubleSide });
  m.signs = { lex: sign(['LEXINGTON']), lin: sign(['LINCOLN']), con: sign(['CONCORD']), neck: sign(['BOSTON NECK']), conMi: sign(['CONCORD 18 MI']), tavern: sign(['GREEN DRAGON'], { bg: '#2a5a3a', col: '#f2e8c0', rim: '#d8b060' }, 512, 200), smith: sign(['P. REVERE', 'GOLDSMITH'], { bg: '#f2e8cc' }, 512, 220) };
  m.plaqueRev = em(T(512, 220, plaqueTex(['PAUL REVERE', '1735 – 1818'])), 0x1a1006); m.plaquePres = em(T(256, 128, plaqueTex(['S. PRESCOTT'], { bg: '#7a7a80', rim: '#5a5a62', col: '#2a2a34' })), 0x101014);
  m.lampPost = vc({ emissive: 0x08080c });
  return m; }

// ---------------------------------------------------------------- shared pieces
const prism = (w, h, d) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); g.computeVertexNormals(); return g; };
function tree(K, x, z, s, R, bare = true, col = 0x3f6a34) { K.beam(M.bark, [x, 0, z], [x + 0.2 * s, 2.6 * s, z], 0.22 * s, 0x4a3a34, true, 7);
  const br = (p, a, L, t, d) => { if (d > 3) return; const e = [p[0] + Math.sin(a) * L, p[1] + Math.cos(a) * L * 0.9, p[2] + (R() - 0.5) * L * 0.6]; K.beam(M.bark, p, e, t, 0x4a3a34, true, 5); br(e, a - 0.5 + R() * 0.2, L * 0.7, t * 0.65, d + 1); br(e, a + 0.45 + R() * 0.2, L * 0.68, t * 0.65, d + 1); };
  const top = [x + 0.2 * s, 2.5 * s, z]; br(top, -0.5, 1.1 * s, 0.1 * s, 0); br(top, 0.55, 1.0 * s, 0.1 * s, 0); br(top, 0.05, 1.2 * s, 0.09 * s, 1);
  if (!bare) for (let i = 0; i < 8; i++) K.put(M.leaf, lumpGeo(i + 7, 1, 0.25), x + (R() - 0.5) * 3 * s, (3.0 + R() * 1.4) * s, z + (R() - 0.5) * 2 * s, 0, R() * 6, 0, (1.0 + R() * 0.5) * s, (0.8 + R() * 0.3) * s, (0.9 + R() * 0.4) * s, [col, 0x4a8a3a, 0x356a2e][i % 3]); }
function stoneWall(K, x0, x1, z, R) { for (let x = x0; x < x1; x += 0.34) { for (let r = 0; r < 3; r++) { const s = 0.17 + R() * 0.07; K.put(M.stoneW, lumpGeo(((x * 7 + r) | 0) % 40, 1, 0.25), x + (R() - 0.5) * 0.1 + (r % 2) * 0.15, 0.12 + r * 0.2, z + (R() - 0.5) * 0.08, 0, R() * 6, 0, s, s * 0.75, s * 0.85, [0x8a8a94, 0x7a7a84, 0x9a9488][(R() * 3) | 0]); } } }
function fingerpost(root, K, x, z, mats, ry = 0) { K.beam(M.wood, [x, 0, z], [x, 2.1, z], 0.09, 0x6a4a30, false); mats.forEach((mt, i) => { const s = mesh(root, plane(1.1, 0.32), mt, x + (i % 2 ? -0.5 : 0.5), 1.85 - i * 0.42, z + 0.06, 0, ry, 0, false); const b = mesh(root, plane(1.1, 0.32), mt, x + (i % 2 ? -0.5 : 0.5), 1.85 - i * 0.42, z - 0.06, 0, ry + Math.PI, 0, false); void s; void b; }); }
// a colonial house: facade on the side facing +dir (dir = +1: faces +x, -1: faces -x; 'front' faces +z). w along street, d deep, h eaves height
function house(root, K, o) { const { x, z, w, d, h, wall, face = 1, roof = 'gable', R, lit = 0.6, door = true, flag = false } = o; const t = 0.08;
  // body
  K.at(x, 0, z, face === 'front' ? 0 : face * Math.PI / 2, () => {
    K.box(wall, -w / 2, w / 2, 0, h, -d / 2, d / 2, 0xffffff, 0.02);
    K.box(M.white, -w / 2 - 0.05, w / 2 + 0.05, h - 0.1, h + 0.04, -d / 2 - 0.05, d / 2 + 0.06, 0xf2ece0, 0.02);
    K.box(M.stoneW, -w / 2 - 0.02, w / 2 + 0.02, 0, 0.35, -d / 2 - 0.02, d / 2 + 0.03, 0x8a8a90, 0.02);
    if (roof === 'gable') { K.put(M.shing, prism(w + 0.3, h * 0.42, d + 0.3), 0, h + 0.03, 0, 0, Math.PI / 2 * 0, 0, 1, 1, 1, 0x5a4a4a); K.box(M.brickB, w * 0.22, w * 0.22 + 0.45, h, h + h * 0.55, -0.25, 0.25, 0x8a4a3a, 0.02); }
    else { K.put(M.shing, prism(d + 0.3, h * 0.3, w + 0.3), 0, h + 0.03, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0x4a3a3a); }
    // windows (front face z = d/2): rows, lit or dark with shutters
    const rows = Math.max(1, Math.round((h - 0.4) / 1.25)), cols = Math.max(2, Math.round(w / 1.15));
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const wx = -w / 2 + (c + 0.5) * w / cols, wy = 0.95 + r * 1.2 + (r ? 0.1 : 0); if (door && r === 0 && Math.abs(wx) < w / cols * 0.6) continue; if (wy + 0.45 > h - 0.1) continue;
      const L = R() < lit; K.put(L ? (R() < 0.5 ? M.winLit : M.winLit2) : M.winDark, plane(0.5, 0.78), wx, wy, d / 2 + 0.012, 0, 0, 0, 1, 1, 1);
      K.box(M.white, wx - 0.3, wx + 0.3, wy - 0.45, wy - 0.4, d / 2, d / 2 + 0.06, 0xf2ece0, 0.01);
      if (!L || R() < 0.5) for (const s of [-1, 1]) K.box(M.paint, wx + s * 0.27 - 0.1, wx + s * 0.27 + 0.1, wy - 0.4, wy + 0.4, d / 2 + 0.01, d / 2 + 0.04, [0x2a4a3a, 0x3a2a2a, 0x2a3a5a][(x * 3 | 0) % 3 < 0 ? 0 : (x * 3 | 0) % 3], 0.005); }
    if (door) { K.box(M.paint, -0.36, 0.36, 0.3, 2.1, d / 2, d / 2 + 0.05, [0x5a2a2a, 0x2a4a3a, 0x2a2a3a][(R() * 3) | 0], 0.01); K.box(M.white, -0.48, 0.48, 2.1, 2.24, d / 2, d / 2 + 0.09, 0xf2ece0, 0.01); K.put(M.winLit2, plane(0.64, 0.22), 0, 2.36, d / 2 + 0.012, 0, 0, 0, 1, 1, 1); K.box(M.stoneW, -0.6, 0.6, 0, 0.3, d / 2, d / 2 + 0.4, 0x9a9690, 0.02); K.put(M.brass, sph(0.035, 8, 6), 0.22, 1.15, d / 2 + 0.07, 0, 0, 0, 1, 1, 1, 0xc89a3a); }
  });
  if (flag) { const a = face === 'front' ? 0 : face * Math.PI / 2, fx = x + Math.sin(a) * (d / 2 + 0.05) + Math.cos(a) * 0.9, fz = z + Math.cos(a) * (d / 2 + 0.05) - Math.sin(a) * 0.9; K.beam(M.wood, [fx, 2.6, fz], [fx + Math.sin(a) * 1.1, 3.3, fz + Math.cos(a) * 1.1], 0.03, 0x6a4a30, true, 5);
    const fl = mesh(root, plane(0.9, 0.56), M.union, fx + Math.sin(a) * 0.95 + Math.cos(a) * 0.0, 2.9, fz + Math.cos(a) * 0.95, 0, a + Math.PI / 2, 0, false); fl.material = M.union; return fl; }
  return null; }
function oilLamp(root, K, x, z, h = 2.6) { K.beam(M.lampPost, [x, 0, z], [x, h, z], 0.05, 0x1e1c24, true, 6); K.box(M.lampPost, x - 0.14, x + 0.14, h, h + 0.04, z - 0.14, z + 0.14, 0x1e1c24, 0.01); mesh(root, cyl(0.1, 0.12, 0.28, 6), M.lampGlass, x, h + 0.18, z, 0, 0, 0, false); K.put(M.lampPost, new THREE.ConeGeometry(0.18, 0.16, 6), x, h + 0.4, z, 0, 0, 0, 1, 1, 1, 0x1e1c24); return glowAt(root, [x, h + 0.2, z], 1.4, '#ffc870', 0.55); }
// steeple of Christ Church (Old North): brick tower + white stages + spire; returns the two lantern glows (window at lanY)
function steeple(root, K, x, z, s = 1) { const L = []; K.at(x, 0, z, 0, () => {
  K.box(M.brickA, -1.6, 1.6, 0, 11, -1.6, 1.6, 0xa85a44, 0.03); K.box(M.white, -1.7, 1.7, 11, 11.3, -1.7, 1.7, 0xf2ece0, 0.03);
  for (let i = 0; i < 3; i++) { K.put(M.winDark, plane(0.7, 1.6), 0, 3 + i * 3, 1.62, 0, 0, 0, 1, 1, 1); K.box(M.white, -0.45, 0.45, 2.1 + i * 3, 2.2 + i * 3, 1.6, 1.7, 0xf2ece0, 0.01); }
  K.box(M.white, -1.25, 1.25, 11.3, 14.6, -1.25, 1.25, 0xf2ece0, 0.03); K.box(M.white, -1.35, 1.35, 14.6, 14.85, -1.35, 1.35, 0xe8e2d6, 0.03);
  for (const a of [0, 1, 2, 3]) for (const dx of [-0.9, 0.9]) K.put(M.white, cyl(0.09, 0.09, 3.2, 8), Math.cos(a * Math.PI / 2) * dx - Math.sin(a * Math.PI / 2) * 1.28, 13, Math.sin(a * Math.PI / 2) * dx + Math.cos(a * Math.PI / 2) * 1.28, 0, 0, 0, 1, 1, 1, 0xf6f2ea);
  K.put(M.winDark, plane(1.0, 2.2), 0, 13, 1.262, 0, 0, 0, 1, 1, 1);
  K.box(M.white, -0.95, 0.95, 14.85, 17.2, -0.95, 0.95, 0xf2ece0, 0.03); K.put(M.winDark, plane(0.6, 1.4), 0, 16.1, 0.962, 0, 0, 0, 1, 1, 1); K.box(M.white, -1.05, 1.05, 17.2, 17.4, -1.05, 1.05, 0xe8e2d6, 0.02);
  K.put(M.white, cyl(0.62, 0.72, 1.4, 8), 0, 18.1, 0, 0, Math.PI / 8, 0, 1, 1, 1, 0xf2ece0); K.put(M.white, new THREE.ConeGeometry(0.6, 6.5, 8), 0, 22.05, 0, 0, Math.PI / 8, 0, 1, 1, 1, 0xf6f2ea);
  K.put(M.brass, sph(0.14, 10, 8), 0, 25.4, 0, 0, 0, 0, 1, 1, 1, 0xd8a83a); K.beam(M.brass, [0, 25.4, 0], [0, 26.4, 0], 0.03, 0xd8a83a, true, 5); K.box(M.brass, -0.4, 0.4, 26.2, 26.26, -0.02, 0.02, 0xd8a83a, 0.0);
  // nave behind
  K.box(M.brickA, -4.5, 4.5, 0, 8.5, -18, -1.6, 0xa05a44, 0.03); K.put(M.shing, prism(9.4, 3.2, 16.6), 0, 8.5, -9.8, 0, 0, 0, 1, 1, 1, 0x4a4048);
  }, s);
  for (const dx of [-0.32, 0.32]) { const p = [x + dx * s, 13.0 * s, z + 1.3 * s]; const g = new THREE.Group(); g.position.set(...p); root.add(g); mesh(g, cyl(0.12, 0.12, 0.34, 10), M.lantGlass, 0, 0, 0, 0, 0, 0, false); for (let b = 0; b < 4; b++) mesh(g, cyl(0.022, 0.022, 0.4, 5), M.lampPost, Math.cos(b * Math.PI / 2 + 0.6) * 0.13, 0, Math.sin(b * Math.PI / 2 + 0.6) * 0.13, 0, 0, 0, false); mesh(g, cyl(0.15, 0.15, 0.05, 10), M.lampPost, 0, -0.2, 0, 0, 0, 0, false); mesh(g, new THREE.ConeGeometry(0.17, 0.2, 10), M.lampPost, 0, 0.29, 0, 0, 0, 0, false); mesh(g, new THREE.TorusGeometry(0.06, 0.012, 5, 12), M.lampPost, 0, 0.43, 0, 0, 0, 0, false);
    const gl = glowAt(root, [p[0], p[1], p[2] + 0.15], 1.3 * s, '#ffc860', 0.7); L.push({ g, gl }); }
  return L; }

// ================================================================= TOWN (North End, 1775 night)
function buildTown(root) { const R = PT.rng(1775), K = new Kit(), Z1 = -30;
  const gr = mesh(root, planeUV(14, 60, 5, 22), M.cobble, 0, 0, -22, -Math.PI / 2, 0, 0, false); gr.receiveShadow = true;
  for (const s of [-1, 1]) K.box(M.stoneW, s * 2.9 - 0.6, s * 2.9 + 0.6, 0, 0.08, Z1 + 2, 6, 0x7a7680, 0.01); // stone sidewalks
  const flags = []; let z = 4;
  const walls = [M.brickA, M.siding, M.brickB, M.sidingB, M.brickA, M.sidingC, M.brickB, M.siding];
  for (let i = 0; z > Z1 + 4; i++) { const w = 3.2 + R() * 1.6, h = 4.6 + (i % 3) * 1.4 + R() * 0.6; z -= w / 2;
    for (const s of [-1, 1]) { const wall = walls[(i * 2 + (s > 0 ? 1 : 0)) % walls.length]; const fl = house(root, K, { x: s * (3.4 + 2.6), z, w, d: 5.2, h, wall, face: -s, R, lit: 0.55, flag: false }); if (fl) flags.push(fl); }
    z -= w / 2 + 0.05; }
  { K.beam(M.lampPost, [-3.4, 3.25, -7.6], [-2.3, 3.25, -7.6], 0.03, 0x1e1c24, true, 5); K.beam(M.wood, [-3.4, 2.4, -7.6], [-2.3, 3.25, -7.6], 0.025, 0x6a4a30, true, 5); const fl = mesh(root, plane(1.0, 0.62), M.union, -2.85, 2.9, -7.6, 0, 0, 0, false); flags.push(fl); }
  // hanging tavern sign + Revere's shop sign
  K.beam(M.lampPost, [3.35, 3.2, -2.2], [2.4, 3.2, -2.2], 0.03, 0x1e1c24, true, 5); const tav = mesh(root, plane(0.9, 0.36), M.signs.tavern, 2.85, 2.85, -2.2, 0, Math.PI / 2, 0, false);
  K.beam(M.lampPost, [-3.35, 3.0, -6.5], [-2.4, 3.0, -6.5], 0.03, 0x1e1c24, true, 5); mesh(root, plane(0.9, 0.4), M.signs.smith, -2.85, 2.62, -6.5, 0, Math.PI / 2, 0, false);
  const lamps = []; for (const [x, z2] of [[-2.5, 1.5], [2.5, -5], [-2.5, -11], [2.5, -17], [-2.5, -23]]) lamps.push(oilLamp(root, K, x, z2));
  // barrels, crates, a cart, a horse trough, a hitching post (clutter at three depths)
  for (const [x, z2] of [[1.9, 2.4], [2.1, 2.0], [-2.0, -3.6], [1.9, -9.2], [-2.1, -14]]) K.put(M.wood, cyl(0.26, 0.24, 0.62, 12), x, 0.31, z2, 0, R() * 6, 0, 1, 1, 1, 0x8a5a38);
  K.box(M.wood, 1.6, 2.4, 0, 0.5, -12.4, -11.6, 0x7a5030, 0.02); K.box(M.wood, 1.7, 2.3, 0.5, 0.85, -12.3, -11.8, 0x8a6040, 0.02);
  K.at(-1.9, 0, -8.2, 0.2, () => { K.box(M.wood, -0.6, 0.6, 0.45, 0.6, -0.35, 0.35, 0x6a4a30, 0.02); for (const s of [-1, 1]) K.put(M.wood, cyl(0.28, 0.28, 0.06, 14), s * 0.62, 0.3, -0.1, 0, 0, Math.PI / 2, 1, 1, 1, 0x5a3a24); K.beam(M.wood, [0, 0.55, 0.35], [0, 0.4, 1.4], 0.05, 0x6a4a30, true, 5); });
  K.box(M.wood, 2.0, 2.6, 0, 0.5, 0.2, 1.6, 0x6a4a30, 0.02); K.beam(M.wood, [-2.2, 0, 3.0], [-2.2, 1.1, 3.0], 0.07, 0x5a3a24, true, 6); K.beam(M.wood, [-2.2, 1.0, 3.0], [-2.2, 1.0, 1.8], 0.04, 0x5a3a24, true, 5);
  const lantern = steeple(root, K, 0, Z1 - 4.5, 1);
  // houses beyond the church + hills of the far shore
  for (let i = 0; i < 12; i++) { const s = i % 2 ? 1 : -1, x = s * (8 + R() * 10), z2 = Z1 - 8 - R() * 20; house(root, K, { x, z: z2, w: 3 + R() * 2, d: 4, h: 4 + R() * 3, wall: walls[i % walls.length], face: 'front', R, lit: 0.4, door: false }); }
  K.build(root, 12);
  const moon = mesh(root, plane(9, 9), M.moon, 16, 34, -90, 0, -0.15, 0, false); moon.renderOrder = -1; nond(moon);
  const dust = motes(root, 50, [-2.5, 2.5, 0.2, 3.5, -10, 3], 77, 0.012);
  return { flags, lamps, lantern, moon, dust, tav, Z1 }; }

// ================================================================= RIVER (Charlestown bank, looking back at Boston)
function buildRiver(root) { const R = PT.rng(1776), K = new Kit();
  const wt = mesh(root, planeUV(200, 120, 12, 8), M.water, 0, -0.05, -58, -Math.PI / 2, 0, 0, false); wt.receiveShadow = true;
  const mp = nond(mesh(root, plane(10, 70), M.moonPath, 6, -0.02, -40, -Math.PI / 2, 0, 0, false)); mp.renderOrder = 2;
  // the near bank: grass, reeds, a short dock with posts, a rowboat tied up
  mesh(root, planeUV(60, 10, 12, 2), M.grassN, 0, 0.02, 4, -Math.PI / 2, 0, 0, false); K.box(M.stoneW, -30, 30, -0.4, 0.05, -1.0, -0.6, 0x5a5a64, 0.05);
  for (let i = 0; i < 60; i++) { const x = (R() - 0.5) * 16, z = -0.7 + R() * 0.6; K.put(M.leaf, new THREE.ConeGeometry(0.02, 0.5 + R() * 0.5, 4), x, 0.25, z, (R() - 0.5) * 0.3, 0, (R() - 0.5) * 0.3, 1, 1, 1, [0x3a5a3a, 0x4a6a3a, 0x5a6a3a][i % 3]); }
  K.box(M.wood, 1.2, 2.4, 0.3, 0.42, -5.5, -0.6, 0x6a4a30, 0.01); for (let i = 0; i < 4; i++) for (const s of [0, 1]) K.beam(M.wood, [1.25 + s * 1.1, -0.4, -1.0 - i * 1.5], [1.25 + s * 1.1, 0.6, -1.0 - i * 1.5], 0.07, 0x5a3a24, true, 6);
  K.at(3.2, 0, -3.2, 0.3, () => { K.put(M.wood, sph(1, 14, 8), 0, 0.05, 0, 0, 0, 0, 0.55, 0.22, 1.5, 0x6a4a30); K.box(M.wood, -0.5, 0.5, 0.12, 0.18, -0.2, 0.2, 0x8a6040, 0.01); });
  // the far Boston shore (z = -60): skyline card, houses, the steeple with the two lanterns, hills
  const sky = mesh(root, plane(140, 24), M.skyline, 0, 8, -68, 0, 0, 0, false); sky.renderOrder = -1; nond(sky);
  for (let i = 0; i < 16; i++) { const x = -34 + i * 4.6 + R() * 1.2; house(root, K, { x, z: -60 - R() * 3, w: 3 + R(), d: 3.5, h: 3.5 + R() * 3, wall: [M.brickA, M.siding, M.brickB, M.sidingB][i % 4], face: 'front', R, lit: 0.45, door: false }); }
  const lantern = steeple(root, K, -9, -62, 1.15);
  // a British man-of-war at anchor (silhouette with lit stern lanterns)
  const ship = new THREE.Group(); ship.position.set(14, 0, -34); ship.rotation.y = -0.35; root.add(ship); { const KS = new Kit();
    KS.put(M.dark, sph(1, 18, 10), 0, 0.4, 0, 0, 0, 0, 7, 1.6, 1.8, 0x2a2026); KS.box(M.dark, -6, 6, 0.4, 1.8, -1.6, 1.6, 0x2a2026, 0.1); KS.box(M.paint, -6, 6, 1.2, 1.4, 1.58, 1.62, 0xc8a050, 0.0);
    for (let i = 0; i < 10; i++) KS.put(M.winLit2, plane(0.24, 0.24), -4.8 + i * 1.05, 0.9, 1.63, 0, 0, 0, 1, 1, 1);
    for (const [mx, mh] of [[-3.4, 11], [0.4, 13], [3.8, 9]]) { KS.beam(M.dark, [mx, 1.8, 0], [mx, 1.8 + mh, 0], 0.12, 0x1e1a22, true, 6); for (const y of [0.55, 0.8]) KS.beam(M.dark, [mx, 1.8 + mh * y, -2.4], [mx, 1.8 + mh * y, 2.4], 0.06, 0x1e1a22, true, 5); }
    KS.beam(M.dark, [6, 1.8, 0], [10, 4.5, 0], 0.08, 0x1e1a22, true, 5); for (const [a, b] of [[[-3.4, 12.8, 0], [6, 1.8, 0]], [[0.4, 14.8, 0], [10, 4.5, 0]], [[-3.4, 12.8, 0], [-6, 1.8, 0]], [[0.4, 14.8, 0], [-3.4, 12.8, 0]]]) KS.beam(M.dark, a, b, 0.02, 0x1e1a22, true, 3);
    KS.build(ship); }
  glowAt(ship, [-6.2, 2.4, 0], 1.6, '#ffc870', 0.6);
  for (let i = 0; i < 4; i++) tree(K, -12 + i * 7 + R() * 2, 7 + R() * 2, 1.0 + R() * 0.3, R);
  K.build(root, 20);
  const hills = mesh(root, plane(300, 50), M.hillsN, 0, 6, -100, 0, 0, 0, false); hills.renderOrder = -2; nond(hills);
  const moon = mesh(root, plane(10, 10), M.moon, 24, 30, -120, 0, 0, 0, false); moon.renderOrder = -1; nond(moon);
  const dust = motes(root, 40, [-3, 3, 0.2, 3, -4, 2], 78, 0.012);
  return { lantern, ship, moon, mp, dust, wt }; }

// ================================================================= ROAD (country road along x, night)
function buildRoad(root) { const R = PT.rng(1619), K = new Kit();
  const rd = mesh(root, planeUV(160, 3.2, 40, 1), M.road, 0, 0.01, 0, -Math.PI / 2, 0, 0, false); rd.receiveShadow = true;
  const gr = mesh(root, planeUV(170, 90, 30, 16), M.grassN, 0, 0, -30, -Math.PI / 2, 0, 0, false); gr.receiveShadow = true;
  // stone walls both sides with gaps; a tumbled wall where Prescott jumps (x ~ 24)
  for (const z of [-2.1]) for (let x = -70; x < 70; x += 9) { if (z < 0 && x > -12 && x < -2) { stoneWall(K, x, x + 2.2, z, R); continue; } stoneWall(K, x, x + 7 + R() * 1.2, z + (R() - 0.5) * 0.15, R); }
  for (let i = 0; i < 160; i++) { const x = -70 + R() * 140, z = 2.0 + R() * 3.5; K.put(M.leaf, new THREE.ConeGeometry(0.04, 0.18 + R() * 0.2, 4), x, 0.1, z, (R() - 0.5) * 0.4, R() * 3, (R() - 0.5) * 0.4, 1, 1, 1, [0x3a5a2a, 0x4a6a32][i % 2]); }
  // fields: hay stooks, fence rails, bare April trees, farmhouses with lit windows
  for (let i = 0; i < 26; i++) { const x = -70 + i * 5.5 + R() * 3, z = -6 - R() * 18; tree(K, x, z, 0.9 + R() * 0.5, R); }
  for (let i = 0; i < 12; i++) { const x = -66 + i * 12 + R() * 4, z = 6 + R() * 8; tree(K, x, z, 0.9 + R() * 0.4, R); }
  for (let i = 0; i < 10; i++) { const x = -60 + i * 13 + R() * 3; house(root, K, { x, z: -16 - R() * 10, w: 4 + R() * 2, d: 4, h: 3.2 + R() * 1.2, wall: [M.sidingC, M.siding, M.sidingB][i % 3], face: 'front', R, lit: 0.6, door: true }); }
  // the farmhouse right by the road (x = -6): door faces the road, porch lamp
  house(root, K, { x: -6, z: -5.6, w: 5.6, d: 4.2, h: 3.6, wall: M.siding, face: 'front', R: PT.rng(4), lit: 0.9, door: true });
  const porch = glowAt(root, [-5.2, 2.4, -3.3], 1.6, '#ffc870', 0.5);
  // fingerposts
  fingerpost(root, K, -24, 1.9, [M.signs.neck]); fingerpost(root, K, -12, 1.9, [M.signs.lex]); fingerpost(root, K, 18, 1.9, [M.signs.lin]); fingerpost(root, K, 40, 1.9, [M.signs.con]); fingerpost(root, K, 4, 1.9, [M.signs.conMi]);
  // Concord: meeting house with a belfry at x = 48, a few houses
  K.at(50, 0, -7, 0, () => { K.box(M.siding, -3, 3, 0, 4.2, -2.5, 2.5, 0xffffff, 0.02); K.put(M.shing, prism(6.3, 2.0, 5.3), 0, 4.2, 0, 0, Math.PI / 2 * 0, 0, 1, 1, 1, 0x4a3a3a); K.box(M.white, -0.9, 0.9, 4.2, 7.2, 1.2, 3.0, 0xf2ece0, 0.02); K.put(M.winDark, plane(0.8, 1.4), 0, 6.1, 3.012, 0, 0, 0, 1, 1, 1); K.put(M.white, new THREE.ConeGeometry(0.9, 2.4, 8), 0, 8.4, 2.1, 0, Math.PI / 8, 0, 1, 1, 1, 0xf6f2ea);
    for (let c = 0; c < 4; c++) K.put(M.winLit, plane(0.6, 1.0), -2.2 + c * 1.45, 1.8, 2.52, 0, 0, 0, 1, 1, 1); K.box(M.paint, -0.5, 0.5, 0, 2.2, 2.5, 2.56, 0x3a2a2a, 0.01); });
  const bell = new THREE.Group(); bell.position.set(50, 6.5, -3.82); root.add(bell); mesh(bell, cyl(0.25, 0.42, 0.55, 14, true), M.brass, 0, -0.28, 0, 0, 0, 0, false).material = H.toon({ color: 0xc89a3a, emissive: 0x3a2408, side: THREE.DoubleSide });
  for (let i = 0; i < 4; i++) house(root, K, { x: 42 + i * 5, z: -14 - (i % 2) * 3, w: 3.6, d: 3.6, h: 3.4, wall: [M.siding, M.sidingB][i % 2], face: 'front', R, lit: 0.8 });
  K.build(root, 16);
  const hills = mesh(root, plane(400, 60), M.hillsN, 0, 6, -90, 0, 0, 0, false); hills.renderOrder = -2; nond(hills);
  const moon = mesh(root, plane(12, 12), M.moon, 0, 36, -130, 0, 0, 0, false); moon.renderOrder = -1; nond(moon);
  const dust = motes(root, 40, [-3, 3, 0.2, 2.5, -2, 2], 79, 0.012);
  return { porch, bell, moon, hills, dust }; }

// ================================================================= STUDY (a poet's study, 1860)
function buildStudy(root) { const R = PT.rng(1860), K = new Kit(), X = 4.5, ZB = -3.6, HT = 3.4;
  mesh(root, planeUV(10, 8, 4, 4), M.dark, 0, 0, 0, -Math.PI / 2, 0, 0, false); mesh(root, plane(3.4, 2.4), M.rug, 0, 0.012, -1.2, -Math.PI / 2, 0, 0, false);
  K.box(M.wallpaper, -X, X, 1.1, HT, ZB - 0.2, ZB, 0xffffff, 0.01); K.box(M.panel, -X, X, 0, 1.1, ZB, ZB + 0.05, 0xffffff, 0.01); K.box(M.dark, -X, X, 1.08, 1.16, ZB, ZB + 0.09, 0x4a2e1e, 0.01);
  for (const s of [-1, 1]) { K.box(M.wallpaper, s * X - 0.1, s * X + 0.1, 0, HT, ZB, 3, 0xffffff, 0.01); }
  K.box(M.dark, -X, X, HT, HT + 0.2, ZB, 3, 0x3a2418, 0.01);
  // bookshelves left + right of the window; window with night, curtains
  for (const x of [-3.0, 3.0]) { K.box(M.dark, x - 1.0, x + 1.0, 0, 2.9, ZB, ZB + 0.45, 0x4a2e1e, 0.02); mesh(root, plane(1.8, 2.6), M.books, x, 1.45, ZB + 0.46, 0, 0, 0, true); }
  K.put(M.winDark, plane(1.4, 1.9), 0, 2.0, ZB + 0.012, 0, 0, 0, 1, 1, 1); K.box(M.white, -0.8, 0.8, 1.0, 1.08, ZB, ZB + 0.15, 0xe8e0d0, 0.01);
  for (const s of [-1, 1]) K.box(M.paint, s * 0.8 - 0.22, s * 0.8 + 0.22, 0.9, 3.2, ZB + 0.05, ZB + 0.16, 0x6a2a2a, 0.05);
  // the desk with lamp, inkwell, quill, papers, books; a chair
  K.box(M.dark, -1.0, 1.0, 0.74, 0.8, -1.9, -0.9, 0x5a3422, 0.02); for (const [x, z] of [[-0.9, -1.8], [0.9, -1.8], [-0.9, -1.0], [0.9, -1.0]]) K.box(M.dark, x - 0.05, x + 0.05, 0, 0.74, z - 0.05, z + 0.05, 0x4a2e1e, 0.01);
  K.box(M.dark, -1.0, -0.5, 0.36, 0.74, -1.9, -1.0, 0x4a2e1e, 0.01); K.box(M.dark, 0.5, 1.0, 0.36, 0.74, -1.9, -1.0, 0x4a2e1e, 0.01);
  const lampG = new THREE.Group(); lampG.position.set(0.62, 0.8, -1.55); root.add(lampG); mesh(lampG, cyl(0.08, 0.1, 0.06, 14), M.brass, 0, 0.03, 0, 0, 0, 0, true).material = H.toon({ color: 0xc89a3a, emissive: 0x3a2408 }); mesh(lampG, cyl(0.025, 0.04, 0.22, 10), M.brass, 0, 0.16, 0, 0, 0, 0, true).material = H.toon({ color: 0xc89a3a, emissive: 0x3a2408 });
  const lgm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc870).multiplyScalar(1.05), fog: false }); mesh(lampG, sph(0.11, 16, 12), lgm, 0, 0.36, 0, 0, 0, 0, false); mesh(lampG, cyl(0.04, 0.05, 0.16, 10), H.toon({ color: 0xe8e4f0, transparent: true, opacity: 0.5, emissive: 0x3a3020 }), 0, 0.52, 0, 0, 0, 0, false);
  const lampGl = glowAt(root, [0.62, 1.18, -1.5], 1.2, '#ffc870', 0.45);
  const page = mesh(root, plane(0.42, 0.56), M.paper, -0.05, 0.806, -1.38, -Math.PI / 2, 0, 0.08, false);
  K.put(M.paint, cyl(0.05, 0.06, 0.08, 12), -0.5, 0.84, -1.6, 0, 0, 0, 1, 1, 1, 0x1a1a2a); const quill = new THREE.Group(); quill.position.set(-0.5, 0.86, -1.6); root.add(quill); { const P = new THREE.Shape(); P.moveTo(0, 0); P.quadraticCurveTo(0.05, 0.2, 0.01, 0.38); P.quadraticCurveTo(-0.04, 0.2, 0, 0); mesh(quill, new THREE.ShapeGeometry(P), H.toon({ color: 0xf6f2ea, emissive: 0x3a3430, side: THREE.DoubleSide }), 0, 0, 0, 0, 0, 0.35, false); }
  for (let i = 0; i < 4; i++) K.box(M.paint, -0.95, -0.6, 0.8 + i * 0.06, 0.86 + i * 0.06, -1.85 + i * 0.01, -1.6, [0x7a2a2a, 0x2a4a6a, 0x5a6a2a, 0x8a6a2a][i], 0.01);
  for (let i = 0; i < 5; i++) K.put(M.paper, plane(0.3, 0.4), 0.3 + R() * 0.2, 0.802 + i * 0.002, -1.2 - R() * 0.1, -Math.PI / 2, 0, R() * 0.6, 1, 1, 1);
  K.at(-0.75, 0, -0.35, Math.PI * 0.8, () => { K.box(M.dark, -0.28, 0.28, 0.44, 0.5, -0.26, 0.26, 0x5a3422, 0.02); K.box(M.dark, -0.28, 0.28, 0.5, 1.1, 0.22, 0.27, 0x5a3422, 0.02); for (const [x, z] of [[-0.24, -0.22], [0.24, -0.22], [-0.24, 0.22], [0.24, 0.22]]) K.box(M.dark, x - 0.03, x + 0.03, 0, 0.44, z - 0.03, z + 0.03, 0x4a2e1e, 0.01); });
  // fireplace on the right wall + portrait frames + a globe + a clock
  K.box(M.stoneW, X - 0.5, X - 0.1, 0, 1.3, 0.2, 1.8, 0x8a7a70, 0.02); K.box(M.dark, X - 0.6, X - 0.1, 1.3, 1.4, 0.0, 2.0, 0x4a2e1e, 0.01); K.box(M.paint, X - 0.42, X - 0.12, 0.05, 0.85, 0.5, 1.5, 0x1a1012, 0.01);
  const fire = glowAt(root, [X - 0.5, 0.4, 1.0], 1.4, '#ff8a40', 0.5); const fl = nond(mesh(root, plane(0.4, 0.5), H.M.flame, X - 0.4, 0.32, 1.0, 0, -Math.PI / 2, 0, false));
  for (const [x, y, w, h] of [[-1.7, 2.4, 0.6, 0.75], [1.7, 2.4, 0.6, 0.75]]) { K.box(M.brass, x - w / 2 - 0.05, x + w / 2 + 0.05, y - h / 2 - 0.05, y + h / 2 + 0.05, ZB, ZB + 0.04, 0xb08a3a, 0.01); K.put(M.paint, plane(w, h), x, y, ZB + 0.045, 0, 0, 0, 1, 1, 1, 0x3a3a4a); }
  K.put(M.paint, sph(0.2, 16, 12), -2.4, 1.15, -2.4, 0, 0, 0, 1, 1, 1, 0x4a7aa8); K.beam(M.dark, [-2.4, 0, -2.4], [-2.4, 0.95, -2.4], 0.04, 0x4a2e1e, true, 6);
  K.build(root, 0);
  const shaft = shaftAt(root, [0, 1.6, -2.4], 1.4, 3.2, 0, 0.25, 0.18, 0x90b0ff);
  const dust = motes(root, 70, [-1.5, 1.5, 0.7, 2.6, -2.5, 0.5], 80, 0.01);
  return { lampGl, fire, fl, page, quill, dust, shaft }; }

// ================================================================= PARK (sunny plaza with the bronze rider; statue art is a card)
function buildPark(root) { const R = PT.rng(1940), K = new Kit();
  const pv = mesh(root, planeUV(60, 60, 14, 14), M.paving, 0, 0, -20, -Math.PI / 2, 0, 0, false); pv.receiveShadow = true;
  // granite plinth (the bronze rider stands on top: an RVRIDE card placed by the story)
  K.box(M.granite, -1.4, 1.4, 0, 0.35, -3.6, -1.4, 0xb0acb8, 0.04); K.box(M.granite, -1.2, 1.2, 0.35, 2.6, -3.4, -1.6, 0xa8a4b0, 0.04); K.box(M.granite, -1.3, 1.3, 2.6, 2.85, -3.5, -1.5, 0xb0acb8, 0.04);
  mesh(root, plane(1.4, 0.6), M.plaqueRev, 0, 1.6, -1.585, 0, 0, 0, false);
  // the tiny overlooked marker by the path
  K.box(M.stoneW, 2.05, 2.45, 0, 0.32, -0.75, -0.55, 0x8a8a90, 0.03); mesh(root, plane(0.34, 0.17), M.plaquePres, 2.25, 0.2, -0.545, 0, 0, 0, false);
  // flowerbeds, benches, trees, brick church + houses behind, lamp posts
  for (const s of [-1, 1]) { K.box(M.paint, s * 1.8 - 0.6, s * 1.8 + 0.6, 0, 0.25, -3.6, -1.4, 0x5a4a3a, 0.02); for (let i = 0; i < 14; i++) K.put(M.paint, sph(0.07, 8, 6), s * 1.8 + (R() - 0.5) * 1.0, 0.3, -2.5 + (R() - 0.5) * 1.9, 0, 0, 0, 1, 0.8, 1, [0xf2e050, 0xe85a4a, 0xffffff, 0xf08aa8][i % 4]); }
  for (const [x, z, ry] of [[-3.4, -0.8, 0.5], [3.6, -1.2, -0.5]]) K.at(x, 0, z, ry, () => { K.box(M.wood, -0.7, 0.7, 0.42, 0.47, -0.2, 0.2, 0x8a5a38, 0.01); K.box(M.wood, -0.7, 0.7, 0.5, 0.85, -0.22, -0.18, 0x8a5a38, 0.01); for (const s of [-1, 1]) K.box(M.metal, s * 0.6 - 0.03, s * 0.6 + 0.03, 0, 0.47, -0.2, 0.2, 0x2a2a30, 0.01); });
  for (const [x, z] of [[-5, -4], [5.5, -5], [-7, -10], [7.5, -11], [-3, -14], [3.5, -15]]) tree(K, x, z, 1.1 + R() * 0.3, R, false);
  steeple(root, K, -2, -22, 0.9); for (let i = 0; i < 8; i++) house(root, K, { x: -14 + i * 4 + R(), z: -24 - R() * 4, w: 3.4, d: 4, h: 4 + R() * 2, wall: [M.brickA, M.brickB][i % 2], face: 'front', R, lit: 0, door: true });
  for (const x of [-4.5, 4.5]) { K.beam(M.lampPost, [x, 0, 0.5], [x, 3, 0.5], 0.05, 0x1e1c24, true, 6); K.put(M.lampPost, cyl(0.14, 0.1, 0.3, 6), x, 3.15, 0.5, 0, 0, 0, 1, 1, 1, 0x1e1c24); }
  K.build(root, 10);
  const hills = mesh(root, plane(300, 50), M.hillsP, 0, 6, -100, 0, 0, 0, false); hills.renderOrder = -2; nond(hills);
  const dust = motes(root, 50, [-3, 3, 0.2, 3, -4, 1], 81, 0.014);
  return { hills, dust }; }

// ---------------------------------------------------------------- lights / grades
const SET_LIGHT = {
  townNight: { top: '#060a22', hor: '#1e2a5a', fog: '#141c40', fogN: 14, fogF: 90, sky: '#5a6ac8', ground: '#1a1630', hemiI: 0.75, fillCol: '#4a5ad0', fillI: 0.45, sunCol: '#a8b8ff', sunI: 1.25, az: 150, el: 38, disc: '#000000', stars: 1, clouds: false, shadow: true, cardTint: '#e4e8ff', fxTint: '#eef2ff', shafts: 0 },
  riverNight: { top: '#050820', hor: '#22306a', fog: '#18224a', fogN: 30, fogF: 200, sky: '#5a6ac8', ground: '#141830', hemiI: 0.72, fillCol: '#4a5ad0', fillI: 0.4, sunCol: '#b0c0ff', sunI: 1.2, az: 165, el: 22, disc: '#000000', stars: 1, clouds: false, shadow: true, cardTint: '#e4e8ff', fxTint: '#eef2ff', shafts: 0 },
  roadNight: { top: '#050820', hor: '#26346e', fog: '#1a2450', fogN: 25, fogF: 140, sky: '#5a6ac8', ground: '#161a30', hemiI: 0.78, fillCol: '#4a5ad0', fillI: 0.42, sunCol: '#b4c4ff', sunI: 1.35, az: 200, el: 30, disc: '#000000', stars: 1, clouds: false, shadow: true, cardTint: '#e4e8ff', fxTint: '#eef2ff', shafts: 0 },
  study: { top: '#000000', hor: '#2a1a14', fog: '#2a1a14', fogN: 10, fogF: 40, sky: '#ffd8b0', ground: '#4a3028', hemiI: 0.7, fillCol: '#6a70d0', fillI: 0.36, sunCol: '#ffd0a0', sunI: 1.4, az: -150, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  park: { top: '#4a7ad0', hor: '#ffd0a8', fog: '#f0d0b8', fogN: 40, fogF: 220, sky: '#a8b4f0', ground: '#6a5048', hemiI: 0.85, fillCol: '#7080e0', fillI: 0.36, sunCol: '#ffd8a0', sunI: 3.2, az: 60, el: 20, disc: '#fff4d8', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff6ec', fxTint: '#fff8ee', shafts: 0.5 },
};
const SET_GRADE = {
  townNight: { look: 'night', over: { exp: 1.18, con: 1.22, sat: 1.08, lift: [0.02, 0.026, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.52, 0.66], hal: [0.32, '#ffa050'], vig: [0.42, 0.42, '#04061a'] } },
  riverNight: { look: 'night', over: { exp: 1.2, con: 1.2, sat: 1.06, lift: [0.02, 0.028, 0.065], tS: ['#1a2a7a', 0.26], tH: ['#ffd090', 0.12], bloom: [0.52, 0.64], hal: [0.32, '#ffb060'], vig: [0.4, 0.42, '#04061a'] } },
  roadNight: { look: 'night', over: { exp: 1.2, con: 1.2, sat: 1.06, lift: [0.02, 0.028, 0.065], tS: ['#1a2a7a', 0.26], tH: ['#ffd090', 0.12], bloom: [0.5, 0.66], hal: [0.3, '#ffb060'], vig: [0.4, 0.42, '#04061a'] } },
  study: { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.1, lift: [0.035, 0.02, 0.045], tS: ['#3a2a6a', 0.2], tH: ['#ffc888', 0.12], bloom: [0.46, 0.72], hal: [0.3, '#ff9a50'], vig: [0.38, 0.44, '#14081a'] } },
  park: { look: 'golden', over: { exp: 1.06, con: 1.2, sat: 1.12, tS: ['#3a2a8a', 0.16], tH: ['#ffc890', 0.1], bloom: [0.42, 0.78], hal: [0.24, '#ffa060'], vig: [0.3, 0.48, '#1e1a3a'] } },
};

export function buildRV(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'townNight', lanterns: 0, lanterns2: 0, flagWave: 1, bell: 0, write: 0, fireOn: 1 };
  let tw, rv, rd, sd, pk;
  const API = makeAPI(ctx, { prefix: 'rv_', origin: RV_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { townNight: 'explain', riverNight: 'explain', roadNight: 'explain', park: 'golden', study: 'office' },
    practicals: (name, F, W3) => { const fl = 1 + 0.05 * Math.sin(F * 0.7) + 0.03 * Math.sin(F * 1.9);
      if (name === 'townNight') return [{ p: W3('town', [-2.5, 2.9, 1.5]), col: '#ffb860', I: 6 * fl, d: 7 }, { p: W3('town', [2.5, 2.9, -5]), col: '#ffb860', I: 6 * fl, d: 7 }, { p: W3('town', [-2.5, 2.9, -11]), col: '#ffb860', I: 5 * fl, d: 7 }, { p: W3('town', [0, 13.2, -32.6]), col: '#ffc060', I: 3 * ST.lanterns, d: 4 }];
      if (name === 'riverNight') return [{ p: W3('river', [-1, 1.8, 2.5]), col: '#ffb860', I: 4 * fl, d: 6 }, { p: W3('river', [-9, 15.2, -60.2]), col: '#ffc060', I: 4 * ST.lanterns2, d: 6 }];
      if (name === 'roadNight') return [{ p: W3('road', [-5.0, 2.5, -2.4]), col: '#ffb860', I: 2.2 * fl, d: 5 }, { p: W3('road', [50, 2.5, -4]), col: '#ffb860', I: 5 * fl, d: 9 }];
      if (name === 'study') return [{ p: W3('study', [0.62, 1.4, -1.5]), col: '#ffc070', I: 3.2 * fl, d: 5 }, { p: W3('study', [4.0, 0.5, 1.0]), col: '#ff8a40', I: 4 * (0.85 + 0.15 * Math.sin(F * 0.9) * Math.sin(F * 0.31)), d: 5 }, { p: W3('study', [0, 2.2, -3.0]), col: '#8aa0ff', I: 1.6, d: 5 }];
      if (name === 'park') return [];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'town' && tw) { tickMotes(tw.dust, f, 0.25); tw.lamps.forEach((g, i) => (g.material.opacity = g.userData.op * (0.9 + 0.1 * Math.sin(f * 0.7 + i))));
        tw.flags.forEach((fl) => { fl.rotation.z = 0.04 * Math.sin(T * 2.2); fl.scale.x = 0.96 + 0.04 * Math.sin(T * 3.1); });
        tw.lantern.forEach((l, i) => { const on = Math.max(0, Math.min(1, ST.lanterns * 2 - i * 0.6)); l.g.visible = on > 0.02; l.gl.material.opacity = 0.75 * on * (0.9 + 0.1 * Math.sin(f * 0.8 + i)); l.g.scale.setScalar(0.3 + 0.7 * on); }); }
      if (cur === 'river' && rv) { tickMotes(rv.dust, f, 0.25); rv.wt.material.map.offset.set(T * 0.004, T * 0.01); rv.mp.material.opacity = 0.8 + 0.2 * Math.sin(T * 1.7); rv.ship.position.y = 0.06 * Math.sin(T * 0.9); rv.ship.rotation.z = 0.012 * Math.sin(T * 0.7);
        rv.lantern.forEach((l, i) => { const on = Math.max(0, Math.min(1, ST.lanterns2 * 2 - i * 0.6)); l.g.visible = on > 0.02; l.gl.material.opacity = 0.85 * on * (0.85 + 0.15 * Math.sin(f * 0.8 + i)); l.gl.scale.setScalar(2.2); }); }
      if (cur === 'road' && rd) { tickMotes(rd.dust, f, 0.4); rd.porch.material.opacity = 0.5 * (0.9 + 0.1 * Math.sin(f * 0.6)); rd.bell.rotation.z = ST.bell * 0.45 * Math.sin(T * 6); }
      if (cur === 'study' && sd) { tickMotes(sd.dust, f, 0.2); sd.lampGl.material.opacity = 0.45 * (0.92 + 0.08 * Math.sin(f * 0.7)); sd.fire.material.opacity = 0.45 * (0.8 + 0.2 * Math.sin(f * 0.9) * Math.sin(f * 0.37)); sd.fl.scale.set(1 + 0.1 * Math.sin(f * 0.8), 1 + 0.15 * Math.sin(f * 1.1), 1);
        sd.quill.rotation.z = 0.35 + ST.write * 0.12 * Math.sin(T * 9); sd.quill.position.x = -0.5 + ST.write * (0.45 + 0.08 * Math.sin(T * 2.3)); sd.quill.position.z = -1.6 + ST.write * (0.18 + 0.03 * Math.sin(T * 4.6)); }
      if (cur === 'park' && pk) tickMotes(pk.dust, f, 0.3); },
    mood: (name) => { ST.mood = name; },
    apply: (v) => { if (v.st) Object.assign(ST, v.st); } });
  tw = buildTown(API.groups.town); rv = buildRiver(API.groups.river); rd = buildRoad(API.groups.road); sd = buildStudy(API.groups.study); pk = buildPark(API.groups.park);
  API.parts = { tw, rv, rd, sd, pk };
  API.set = (o) => Object.assign(ST, o);
  const glows = { town: [...tw.lamps, ...tw.lantern.map((l) => l.gl)], river: rv.lantern.map((l) => l.gl), road: [rd.porch], study: [sd.lampGl, sd.fire], park: [] };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  const V = API.V;
  API.views = [
    V('townNight', [0.3, 1.7, 5.5], [0, 2.4, -14], 46, 1.0, [0, 1.4, -2], { st: { lanterns: 1 } }),            // 0 lane wide to the steeple
    V('townNight', [0.6, 9, -22], [0, 13, -33], 40, 1.4, [0, 13, -33], { st: { lanterns: 1 } }),              // 1 steeple lanterns close
    V('riverNight', [0.6, 1.5, 4.5], [-4, 4, -50], 40, 1.0, [0, 1, 0], { st: { lanterns2: 1 } }),            // 2 river to Boston
    V('roadNight', [0, 1.4, 7.5], [0, 1.1, 0], 44, 1.2, [0, 1, 0]),                                          // 3 road side
    V('roadNight', [-4.5, 1.6, 2.2], [-5.6, 1.4, -3.5], 44, 1.2, [-5.6, 1.2, -3.4]),                        // 4 farmhouse door
    V('roadNight', [44, 2.2, 6], [50, 3.5, -5], 44, 1.0, [48, 1.5, 0], { st: { bell: 1 } }),                 // 5 Concord
    V('study', [0.4, 1.5, 1.6], [0, 1.0, -1.6], 44, 1.4, [0, 0.9, -1.4], { st: { write: 1 } }),             // 6 study desk
    V('study', [0.0, 1.4, -0.7], [-0.05, 0.8, -1.38], 40, 3.0, [-0.05, 0.8, -1.38]),                         // 7 poem page close
    V('park', [0.5, 1.6, 6], [0, 2.6, -2.5], 44, 1.0, [0, 2, -2.5]),                                          // 8 plaza statue
    V('park', [2.6, 0.6, 0.8], [2.25, 0.2, -0.6], 40, 3.0, [2.25, 0.2, -0.55]),                               // 9 tiny marker
  ];
  API.tick(0);
  return API;
}
