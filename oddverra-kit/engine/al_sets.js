// al_sets.js [AL-sets]: sets for "The first American alarm clock could only ring at 4 AM" (Oddverra short).
//   town    : Concord, New Hampshire, 1787: a dirt Main Street of clapboard and brick houses, a white meetinghouse steeple at the end,
//             rail fence (ROOSTY's perch), Levi's shop with a hanging CLOCKS & WATCHES sign and an upstairs window that lights up
//             at four (setWindow). Moods 'townNight' (4 AM, moon + stars) and 'townDawn' (sunrise payoff).        origin (-180000,0,0)
//   bedroom : Levi's bedroom: plank floor, plaster walls, a rope bed with a patchwork quilt, a candle, a window with moon/stars,
//             and THE CLOCK (pine cabinet, mirror door, brass dial, a bell on top) on a wall shelf. Moods 'bedNight', 'bedDawn'.
//                                                                                                                (-180000,0,800)
//   shop    : the clock shop: workbench, tools, gear trays, tall case clocks along the wall, a window, the cabinet under
//             construction on the bench (door swings). Moods 'shop' (warm day), 'shopNight' ("You see").          (-182500,0,0)
//   works   : a blueprint cutaway of the clock's insides: the hour wheel with one red pin at IIII, the trip lever, the hammer
//             and a big bell; spinning train gears; labels on the parts. Mood 'works'.                             (-182500,0,800)
//   paris   : Paris, 1847: a clockmaker's shop with patterned wallpaper, rooftops through the window, a shelf of clocks, the
//             patent certificate (BREVET 1847) and a bedside alarm clock with a red setting hand (setBedside). Mood 'paris'.
//                                                                                                                (-182500,0,1600)
// Each set: local frame, camera side +z. Test flag ?alview=N (main.js).
import { H, TAU, clamp01, sm, SERIF, SANS, cyl, sph, plane, planeUV, mesh, nond, lumpGeo, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';

export const AL_ORIGIN = { town: [-180000, 0, 0], bedroom: [-180000, 0, 800], shop: [-182500, 0, 0], works: [-182500, 0, 800], paris: [-182500, 0, 1600] };
const GROUP_OF = { townNight: 'town', townDawn: 'town', bedNight: 'bedroom', bedDawn: 'bedroom', shop: 'shop', shopNight: 'shop', works: 'works', paris: 'paris' };
// bedroom clock: on a shelf at CAB (set-local), scale 1; works wheel radius WR at WC
export const CAB = { x: 1.3, y: 1.32, z: -2.72, s: 1.0 };
export const WORKS = { WR: 2.2, WC: [0, 2.6, 0] };
let THREE, PT, M;

// ---------------------------------------------------------------- painters
function winTex(o) { return (g, w, h) => { g.fillStyle = o.frame || '#f2ece0'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.a); gr.addColorStop(1, o.b); g.fillStyle = gr; g.fillRect(w * 0.08, h * 0.06, w * 0.84, h * 0.88);
  if (o.lit) { g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(w * 0.12, h * 0.1, w * 0.2, h * 0.8); if (o.curtain) { g.fillStyle = o.curtain; g.beginPath(); g.moveTo(w * 0.08, h * 0.06); g.quadraticCurveTo(w * 0.3, h * 0.4, w * 0.12, h * 0.94); g.lineTo(w * 0.08, h * 0.94); g.fill(); g.beginPath(); g.moveTo(w * 0.92, h * 0.06); g.quadraticCurveTo(w * 0.7, h * 0.4, w * 0.88, h * 0.94); g.lineTo(w * 0.92, h * 0.94); g.fill(); } }
  g.fillStyle = o.frame || '#f2ece0'; for (let i = 1; i < 3; i++) g.fillRect(w * 0.08 + i * w * 0.84 / 3 - 3, 0, 6, h); for (let j = 1; j < 4; j++) g.fillRect(0, h * 0.06 + j * h * 0.88 / 4 - 3, w, 6); }; }
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); if (!o.flat) PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * PT.fbm(u, v, 6, 2, 3, 7)); g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08);
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : 0.3 + i * 0.4 / (lines.length - 1)), w * 0.84, h * (lines.length === 1 ? 0.5 : 0.62 / lines.length), { col: (o.cols || [])[i] || o.col || '#3a2414', font: o.font || SERIF })); }; }
function hillsTex(cols) { return (g, w, h) => { g.clearRect(0, 0, w, h); cols.forEach(([y0, c, a], k) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * y0 + Math.sin(x * 0.011 + y0 * 9 + k) * h * a + Math.sin(x * 0.029 + y0) * h * a * 0.4); g.lineTo(w, h); g.fill(); }); }; }
// a clock dial: Roman numerals (IIII at four, as on period dials), minute ring; o.red: mark the IIII in red
function dialTex(o = {}) { return (g, w, h) => { const cx = w / 2, cy = h / 2, R = w * 0.47; g.fillStyle = o.plate || '#c8a048'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.85 + 0.25 * PT.fbm(u, v, 8, 8, 3, 7));
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, R); gr.addColorStop(0, o.face || '#f8f2e2'); gr.addColorStop(1, o.face2 || '#e2d8c0'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill();
  g.strokeStyle = '#2a2230'; g.lineWidth = w * 0.006; for (const r of [0.92, 0.82]) { g.beginPath(); g.arc(cx, cy, R * r, 0, TAU); g.stroke(); }
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU; g.beginPath(); g.moveTo(cx + Math.cos(a) * R * 0.82, cy + Math.sin(a) * R * 0.82); g.lineTo(cx + Math.cos(a) * R * (i % 5 ? 0.88 : 0.92), cy + Math.sin(a) * R * (i % 5 ? 0.88 : 0.92)); g.lineWidth = w * (i % 5 ? 0.004 : 0.01); g.stroke(); }
  const RN = o.arabic ? ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'] : ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU - Math.PI / 2; g.save(); g.translate(cx + Math.cos(a) * R * 0.66, cy + Math.sin(a) * R * 0.66); if (!o.arabic) g.rotate(a + Math.PI / 2); txt(g, RN[i], 0, 0, R * 0.34, R * (o.arabic ? 0.2 : 0.17), { col: o.red && i === 4 ? '#d02a2a' : '#1e1a26', font: SERIF }); g.restore(); }
  if (o.red) { const a = 4 / 12 * TAU - Math.PI / 2; g.strokeStyle = '#d02a2a'; g.lineWidth = w * 0.012; g.beginPath(); g.arc(cx + Math.cos(a) * R * 0.66, cy + Math.sin(a) * R * 0.66, R * 0.17, 0, TAU); g.stroke(); }
  if (o.name) txt(g, o.name, cx, cy + R * 0.32, R * 0.6, R * 0.08, { col: '#3a2a3a', font: SERIF, italic: true }); }; }
// the hour wheel face for the cutaway: brass with spokes cut out, the twelve hours painted round the rim
function wheelTex(g, w, h) { const cx = w / 2, cy = h / 2, R = w / 2; g.clearRect(0, 0, w, h); g.fillStyle = '#d8a848'; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill(); PT.modulate(g, w, h, (u, v) => 0.84 + 0.26 * PT.fbm(u, v, 6, 6, 3, 13));
  g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 6; i++) { const a0 = i / 6 * TAU + 0.12, a1 = (i + 1) / 6 * TAU - 0.12; g.beginPath(); g.arc(cx, cy, R * 0.58, a0, a1); g.arc(cx, cy, R * 0.2, a1, a0, true); g.closePath(); g.fill(); } g.globalCompositeOperation = 'source-over';
  g.strokeStyle = 'rgba(90,60,20,0.7)'; g.lineWidth = 6; for (const r of [0.6, 0.97, 0.2]) { g.beginPath(); g.arc(cx, cy, R * r, 0, TAU); g.stroke(); }
  const RN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU - Math.PI / 2; g.save(); g.translate(cx + Math.cos(a) * R * 0.79, cy + Math.sin(a) * R * 0.79); g.rotate(a + Math.PI / 2); txt(g, RN[i], 0, 0, R * 0.3, R * 0.13, { col: i === 4 ? '#c8201e' : '#3a2410', font: SERIF }); g.restore(); } }
function mirrorTex(g, w, h) { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#9ab0d0'); gr.addColorStop(0.45, '#dfe8f4'); gr.addColorStop(0.55, '#b8c8e0'); gr.addColorStop(1, '#6a80a8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.moveTo(w * 0.2, 0); g.lineTo(w * 0.36, 0); g.lineTo(w * 0.1, h); g.lineTo(-w * 0.06, h); g.fill(); g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.moveTo(w * 0.5, 0); g.lineTo(w * 0.56, 0); g.lineTo(w * 0.3, h); g.lineTo(w * 0.24, h); g.fill(); }
function bpTex(g, w, h) { g.fillStyle = '#1e3a6a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.2 * PT.fbm(u, v, 4, 4, 3, 21)); g.strokeStyle = 'rgba(190,220,255,0.22)'; g.lineWidth = 1.5; for (let i = 0; i <= w; i += w / 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); } for (let j = 0; j <= h; j += h / 16) { g.beginPath(); g.moveTo(0, j); g.lineTo(w, j); g.stroke(); }
  g.strokeStyle = 'rgba(220,236,255,0.5)'; g.lineWidth = 3; for (const [x, y, r] of [[0.14, 0.3, 0.08], [0.86, 0.7, 0.1], [0.1, 0.8, 0.05], [0.9, 0.22, 0.06]]) { g.beginPath(); g.arc(w * x, h * y, h * r * 2, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(w * x - h * r * 2.4, h * y); g.lineTo(w * x + h * r * 2.4, h * y); g.stroke(); }
  txt(g, 'L. HUTCHINS  -  CONCORD  -  1787', w * 0.2, h * 0.95, w * 0.36, h * 0.035, { col: 'rgba(220,236,255,0.7)', font: SERIF, italic: true }); }
function quiltTex(g, w, h) { const n = 6, c = w / n, cols = ['#b8483a', '#e8d8b0', '#3a5a8a', '#d8a040', '#5a7a4a', '#8a3a5a']; const R = PT.rng(1787); for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { g.fillStyle = cols[(R() * cols.length) | 0]; g.fillRect(i * c, j * c, c, c); g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(i * c, j * c); g.lineTo(i * c + c, j * c); g.lineTo(i * c, j * c + c); g.fill(); }
  g.strokeStyle = 'rgba(60,30,30,0.5)'; g.lineWidth = 3; g.setLineDash([8, 6]); for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * c, 0); g.lineTo(i * c, h); g.stroke(); g.beginPath(); g.moveTo(0, i * c); g.lineTo(w, i * c); g.stroke(); } g.setLineDash([]); PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * PT.fbm(u, v, 8, 8, 3, 4)); }
function plasterTex(o = {}) { return (g, w, h) => { g.fillStyle = o.base || '#e6dcc4'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.18 * PT.fbm(u, v, 5, 5, 4, o.seed || 3)); grain(g, w, h, 'rgba(90,70,50,1)', 900, o.seed || 5, 0.15); }; }
function parisWallTex(g, w, h) { g.fillStyle = '#5a2a3a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(232,192,120,0.32)'; for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const x = (i + (j % 2) * 0.5) * w / 8, y = j * h / 8; g.beginPath(); g.moveTo(x, y - 12); g.quadraticCurveTo(x + 9, y, x, y + 12); g.quadraticCurveTo(x - 9, y, x, y - 12); g.fill(); g.fillRect(x - 1, y + 10, 2, 8); }
  g.strokeStyle = 'rgba(232,192,120,0.25)'; g.lineWidth = 2; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(i * w / 8, 0); g.lineTo(i * w / 8, h); g.stroke(); } PT.modulate(g, w, h, (u, v) => 0.9 + 0.1 * PT.fbm(u, v, 4, 4, 3, 5)); }
function brevetTex(g, w, h) { g.fillStyle = '#efe4c4'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * PT.fbm(u, v, 5, 5, 3, 3)); g.strokeStyle = '#6a4a2a'; g.lineWidth = 8; g.strokeRect(14, 14, w - 28, h - 28); g.lineWidth = 2; g.strokeRect(26, 26, w - 52, h - 52);
  txt(g, "BREVET D'INVENTION", w / 2, h * 0.13, w * 0.8, h * 0.065, { col: '#3a2410', font: SERIF }); txt(g, 'PATENT', w / 2, h * 0.24, w * 0.6, h * 0.1, { col: '#a82a2a', font: SERIF }); txt(g, 'A. REDIER', w / 2, h * 0.37, w * 0.7, h * 0.07, { col: '#2a1a40', font: SERIF });
  txt(g, 'RÉVEIL-MATIN', w / 2, h * 0.47, w * 0.7, h * 0.055, { col: '#3a2410', font: SERIF, italic: true }); txt(g, '(an alarm you can set)', w / 2, h * 0.54, w * 0.7, h * 0.04, { col: '#5a4a3a', font: SERIF, italic: true });
  g.strokeStyle = 'rgba(40,30,50,0.7)'; g.lineWidth = 2.5; const R = PT.rng(1847); for (let i = 0; i < 6; i++) { const y = h * (0.62 + i * 0.045); let x = w * 0.14; g.beginPath(); g.moveTo(x, y); while (x < w * (0.78 + R() * 0.08)) { const s = 6 + R() * 10; g.quadraticCurveTo(x + s / 2, y - 4 - R() * 5, x + s, y); x += s; } g.stroke(); }
  txt(g, '1847', w / 2, h * 0.9, w * 0.4, h * 0.08, { col: '#3a2410', font: SERIF }); g.fillStyle = '#b8302a'; g.beginPath(); g.arc(w * 0.82, h * 0.88, w * 0.08, 0, TAU); g.fill(); g.strokeStyle = '#7a1a1a'; g.lineWidth = 4; g.stroke(); }
function roofsTex(o) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.top); gr.addColorStop(1, o.hor); g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = PT.rng(1848);
  g.fillStyle = o.far; for (let x = 0; x < w; x += 40 + R() * 40) { const bh = h * (0.3 + R() * 0.2); g.fillRect(x, h - bh, 44 + R() * 40, bh); g.beginPath(); g.moveTo(x - 4, h - bh); g.lineTo(x + 24, h - bh - 24); g.lineTo(x + 60, h - bh - 24); g.lineTo(x + 84, h - bh); g.fill(); for (let k = 0; k < 3; k++) g.fillRect(x + 10 + k * 22, h - bh - 40, 8, 18); }
  g.fillStyle = o.near; for (let x = -20; x < w; x += 90 + R() * 50) { const bh = h * (0.12 + R() * 0.14); g.fillRect(x, h - bh, 100, bh); g.beginPath(); g.moveTo(x - 6, h - bh); g.lineTo(x + 30, h - bh - 34); g.lineTo(x + 76, h - bh - 34); g.lineTo(x + 106, h - bh); g.fill(); g.fillRect(x + 50, h - bh - 60, 12, 28); g.fillStyle = 'rgba(255,200,110,0.85)'; for (let k = 0; k < 4; k++) g.fillRect(x + 12 + k * 22, h - bh + 14, 8, 12); g.fillStyle = o.near; }
  if (o.dome) { g.fillStyle = o.far; g.beginPath(); g.arc(w * 0.7, h * 0.52, h * 0.1, Math.PI, 0); g.fill(); g.fillRect(w * 0.7 - h * 0.12, h * 0.52, h * 0.24, h * 0.5); g.fillRect(w * 0.7 - 3, h * 0.36, 6, h * 0.06); } }; }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.brickA = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#9a4434', rows: 30, cols: 7, seed: 61 })) }); m.brickB = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#7a3a34', rows: 30, cols: 7, seed: 62 })) });
  m.siding = vc({ map: T(256, 256, (g, w, h) => PT.siding(g, w, h, { base: '#d8d0c0', n: 18, seed: 41 })) }); m.sidingB = vc({ map: T(256, 256, (g, w, h) => PT.siding(g, w, h, { base: '#5a7a8a', n: 18, seed: 42 })) }); m.sidingC = vc({ map: T(256, 256, (g, w, h) => PT.siding(g, w, h, { base: '#c8a060', n: 18, seed: 43 })) }); m.sidingD = vc({ map: T(256, 256, (g, w, h) => PT.siding(g, w, h, { base: '#a8483a', n: 18, seed: 44 })) });
  m.shing = vc({ map: T(256, 256, (g, w, h) => PT.shingles(g, w, h, { base: '#4a3a3a', n: 12, seed: 51 })) });
  m.white = vc(); m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 8, seed: 51 })) }); m.pine = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#d0a060', n: 5, seed: 57 })) });
  m.floor = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#7a5034', n: 7, seed: 58 })) }); m.stoneW = vc({ map: T(256, 256, (g, w, h) => PT.stone(g, w, h, { base: '#8a8a90', n: 5, seed: 71 })) });
  m.plaster = vc({ map: T(512, 512, plasterTex({})) }); m.plasterB = vc({ map: T(512, 512, plasterTex({ base: '#c8d0c8', seed: 9 })) });
  m.winLit = new THREE.MeshBasicMaterial({ map: T(128, 192, winTex({ a: '#ffe08a', b: '#ff9a40', lit: 1, curtain: 'rgba(160,50,40,0.55)' })), fog: false }); m.winLit.color.setScalar(1.15);
  m.winDark = toon({ map: T(128, 192, winTex({ a: '#2a3a6a', b: '#141c3a' })), emissive: 0x0a0e20 }); m.winDark.emissiveMap = m.winDark.map;
  m.grassN = vc({ map: T(512, 512, (g, w, h) => PT.grass(g, w, h, { base: '#5a7a3a', seed: 23 })) }); m.grassN.map.wrapS = m.grassN.map.wrapT = THREE.RepeatWrapping;
  m.road = vc({ map: T(512, 512, (g, w, h) => PT.dirt(g, w, h, { base: '#9a8060', seed: 11 })) }); m.road.map.wrapS = m.road.map.wrapT = THREE.RepeatWrapping;
  m.hillsN = new THREE.MeshBasicMaterial({ map: T(1024, 256, hillsTex([[0.45, '#2a3460', 0.06], [0.6, '#1e2848', 0.07], [0.74, '#141c38', 0.08]])), transparent: true, fog: false, depthWrite: false });
  m.hillsD = new THREE.MeshBasicMaterial({ map: T(1024, 256, hillsTex([[0.45, '#c88aa0', 0.06], [0.6, '#8a6a8a', 0.07], [0.74, '#4a4a6a', 0.08]])), transparent: true, fog: false, depthWrite: false });
  m.leaf = vc(); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.iron = vc({ emissive: 0x0a0a10 }); m.brass = vc({ emissive: 0x3a2408 }); m.lampPost = vc({ emissive: 0x08080c });
  m.lantGlass = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb040).multiplyScalar(1.35), fog: false });
  m.moon = new THREE.MeshBasicMaterial({ map: T(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,250,225,1)'); gr.addColorStop(0.42, 'rgba(255,248,215,1)'); gr.addColorStop(0.46, 'rgba(220,230,255,0.35)'); gr.addColorStop(1, 'rgba(160,180,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(200,190,170,0.4)'; for (const [x, y, r] of [[0.42, 0.42, 0.06], [0.56, 0.5, 0.04], [0.48, 0.58, 0.035]]) { g.beginPath(); g.arc(w * x, h * y, w * r, 0, TAU); g.fill(); } }), transparent: true, depthWrite: false, fog: false });
  m.sunDisc = new THREE.MeshBasicMaterial({ map: T(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,250,220,1)'); gr.addColorStop(0.3, 'rgba(255,220,140,1)'); gr.addColorStop(0.36, 'rgba(255,170,90,0.6)'); gr.addColorStop(1, 'rgba(255,120,80,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), transparent: true, depthWrite: false, fog: false });
  const sign = (lines, o, w = 512, h = 200) => em(T(w, h, signTex(lines, o)), 0x201810, { side: THREE.DoubleSide });
  m.signShop = sign(['HUTCHINS', 'CLOCKS & WATCHES'], { bg: '#1e3a5a', col: '#f2dc90', rim: '#d8b060' }, 512, 240); m.signInside = sign(['L. & A. HUTCHINS', 'CLOCK-MAKERS'], { bg: '#f2e8cc', col: '#3a2414' }, 512, 220);
  m.signParis = sign(['A. REDIER', 'HORLOGER  -  PARIS'], { bg: '#1a2a20', col: '#f0d890', rim: '#d8b060' }, 640, 220); m.signConcord = sign(['CONCORD'], { bg: '#f2e8cc' }, 512, 160);
  m.lblGear = sign(['EXTRA GEAR'], { bg: '#f4ecd2', col: '#a82a2a', rim: '#a82a2a', font: SANS }, 512, 150); m.lblPin = sign(['4:00 PIN'], { bg: '#f4ecd2', col: '#a82a2a', rim: '#a82a2a', font: SANS }, 512, 150);
  m.lblBell = sign(['BELL'], { bg: '#f4ecd2', col: '#2a2a5a', rim: '#2a2a5a', font: SANS }, 400, 150); m.lblPine = sign(['PINE'], { bg: '#f4ecd2', col: '#5a3a1a', rim: '#5a3a1a', font: SANS }, 400, 150); m.lblMirror = sign(['MIRROR'], { bg: '#f4ecd2', col: '#2a4a7a', rim: '#2a4a7a', font: SANS }, 400, 150);
  m.dial = em(T(512, 512, dialTex({})), 0x5a5040); m.dialR = em(T(512, 512, dialTex({ red: true })), 0x5a5040); m.dialP = em(T(512, 512, dialTex({ arabic: true, plate: '#c89a48', name: 'Redier à Paris' })), 0x5a5040);
  m.wheel = toon({ map: T(1024, 1024, wheelTex), transparent: true, alphaTest: 0.5, emissive: 0x3a2408, side: THREE.DoubleSide }); m.wheel.emissiveMap = m.wheel.map;
  m.mirror = new THREE.MeshBasicMaterial({ map: T(128, 256, mirrorTex), fog: false }); m.mirror.color.setScalar(1.0);
  m.bp = em(T(1024, 512, bpTex), 0x1a2a50); m.quilt = vc({ map: T(512, 512, quiltTex) }); m.linen = vc({ emissive: 0x141418 });
  m.parisWall = vc({ map: T(256, 256, parisWallTex) }); m.brevet = em(T(512, 700, brevetTex), 0x1a140c);
  m.roofsN = new THREE.MeshBasicMaterial({ map: T(1024, 512, roofsTex({ top: '#2a2a6a', hor: '#e89a7a', far: '#4a3a6a', near: '#2a2240', dome: 1 })), fog: false }); m.roofsN.color.setScalar(1.05);
  m.skyNight = new THREE.MeshBasicMaterial({ map: T(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#060a24'); gr.addColorStop(1, '#22306a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = PT.rng(4); g.fillStyle = '#fff'; for (let i = 0; i < 60; i++) g.fillRect(R() * w, R() * h * 0.8, 2, 2); g.fillStyle = '#fff8e0'; g.beginPath(); g.arc(w * 0.7, h * 0.28, w * 0.07, 0, TAU); g.fill(); g.fillStyle = 'rgba(200,190,170,0.5)'; g.beginPath(); g.arc(w * 0.68, h * 0.27, w * 0.015, 0, TAU); g.fill(); }), fog: false });
  m.skyDawn = new THREE.MeshBasicMaterial({ map: T(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#4a5aa8'); gr.addColorStop(0.6, '#f0a07a'); gr.addColorStop(1, '#ffd890'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), fog: false });
  m.skyDay = new THREE.MeshBasicMaterial({ map: T(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7aa8e8'); gr.addColorStop(1, '#e0ecf8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.8)'; for (const [x, y] of [[0.3, 0.3], [0.38, 0.27], [0.7, 0.5]]) { g.beginPath(); g.ellipse(w * x, h * y, w * 0.12, h * 0.05, 0, 0, TAU); g.fill(); } }), fog: false });
  m.cloth = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#c84a4a' })) }); m.rug = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#3a4a6a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(232,192,120,0.6)'; g.lineWidth = 10; g.strokeRect(16, 16, w - 32, h - 32); g.lineWidth = 4; g.strokeRect(36, 36, w - 72, h - 72); PT.modulate(g, w, h, (u, v) => 0.86 + 0.18 * PT.fbm(u, v, 8, 8, 3, 2)); }) });
  m.ring = new THREE.MeshBasicMaterial({ map: T(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); const cx = w / 2; for (const [r, a] of [[0.46, 1], [0.4, 0.45]]) { const gr = g.createRadialGradient(cx, cx, w * (r - 0.06), cx, cx, w * (r + 0.04)); gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(0.6, `rgba(255,236,190,${a})`); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  return m; }

// ---------------------------------------------------------------- shared pieces
const tintM = (m, hex) => { const c = new THREE.Color(hex), a = m.geometry.attributes.position.count, arr = new Float32Array(a * 3); for (let i = 0; i < a; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; } m.geometry = m.geometry.clone(); m.geometry.setAttribute('color', new THREE.Float32BufferAttribute(arr, 3)); return m; };
const prism = (w, h, d) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); g.computeVertexNormals(); return g; };
function tree(K, x, z, s, R, bare = false, col = 0x3f6a34) { K.beam(M.bark, [x, 0, z], [x + 0.2 * s, 2.6 * s, z], 0.22 * s, 0x4a3a34, true, 7);
  const br = (p, a, L, t, d) => { if (d > 3) return; const e = [p[0] + Math.sin(a) * L, p[1] + Math.cos(a) * L * 0.9, p[2] + (R() - 0.5) * L * 0.6]; K.beam(M.bark, p, e, t, 0x4a3a34, true, 5); br(e, a - 0.5 + R() * 0.2, L * 0.7, t * 0.65, d + 1); br(e, a + 0.45 + R() * 0.2, L * 0.68, t * 0.65, d + 1); };
  const top = [x + 0.2 * s, 2.5 * s, z]; br(top, -0.5, 1.1 * s, 0.1 * s, 0); br(top, 0.55, 1.0 * s, 0.1 * s, 0); br(top, 0.05, 1.2 * s, 0.09 * s, 1);
  if (!bare) for (let i = 0; i < 8; i++) K.put(M.leaf, lumpGeo(i + 7, 1, 0.25), x + (R() - 0.5) * 3 * s, (3.0 + R() * 1.4) * s, z + (R() - 0.5) * 2 * s, 0, R() * 6, 0, (1.0 + R() * 0.5) * s, (0.8 + R() * 0.3) * s, (0.9 + R() * 0.4) * s, [col, 0x4a7a3a, 0x356a2e][i % 3]); }
// a colonial house facing +z after rotation (face: 'front' | +1 faces +x | -1 faces -x); windows mostly dark (it's 4 AM)
function house(root, K, o) { const { x, z, w, d, h, wall, face = 1, roof = 'gable', R, lit = 0.1, door = true } = o;
  K.at(x, 0, z, face === 'front' ? 0 : face * Math.PI / 2, () => {
    K.box(wall, -w / 2, w / 2, 0, h, -d / 2, d / 2, 0xffffff, 0.02);
    K.box(M.white, -w / 2 - 0.05, w / 2 + 0.05, h - 0.1, h + 0.04, -d / 2 - 0.05, d / 2 + 0.06, 0xf2ece0, 0.02);
    K.box(M.stoneW, -w / 2 - 0.02, w / 2 + 0.02, 0, 0.35, -d / 2 - 0.02, d / 2 + 0.03, 0x8a8a90, 0.02);
    if (roof === 'gable') { K.put(M.shing, prism(w + 0.3, h * 0.42, d + 0.3), 0, h + 0.03, 0, 0, 0, 0, 1, 1, 1, 0x5a4a4a); K.box(M.brickB, w * 0.22, w * 0.22 + 0.45, h, h + h * 0.55, -0.25, 0.25, 0x8a4a3a, 0.02); }
    else { K.put(M.shing, prism(d + 0.3, h * 0.3, w + 0.3), 0, h + 0.03, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0x4a3a3a); K.box(M.brickB, -0.25, 0.25, h, h + h * 0.45, -0.25, 0.25, 0x8a4a3a, 0.02); }
    const rows = Math.max(1, Math.round((h - 0.4) / 1.25)), cols = Math.max(2, Math.round(w / 1.15));
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const wx = -w / 2 + (c + 0.5) * w / cols, wy = 0.95 + r * 1.2 + (r ? 0.1 : 0); if (door && r === 0 && Math.abs(wx) < w / cols * 0.6) continue; if (wy + 0.45 > h - 0.1) continue;
      const L = R() < lit; K.put(L ? M.winLit : M.winDark, plane(0.5, 0.78), wx, wy, d / 2 + 0.012, 0, 0, 0, 1, 1, 1);
      K.box(M.white, wx - 0.3, wx + 0.3, wy - 0.45, wy - 0.4, d / 2, d / 2 + 0.06, 0xf2ece0, 0.01);
      for (const s of [-1, 1]) K.box(M.white, wx + s * 0.27 - 0.1, wx + s * 0.27 + 0.1, wy - 0.4, wy + 0.4, d / 2 + 0.01, d / 2 + 0.04, [0x2a4a3a, 0x3a2a2a, 0x2a3a5a][Math.abs(Math.round(x * 3)) % 3], 0.005); }
    if (door) { K.box(M.white, -0.36, 0.36, 0.3, 2.1, d / 2, d / 2 + 0.05, [0x5a2a2a, 0x2a4a3a, 0x2a2a3a][(R() * 3) | 0], 0.01); K.box(M.white, -0.48, 0.48, 2.1, 2.24, d / 2, d / 2 + 0.09, 0xf2ece0, 0.01); K.box(M.stoneW, -0.6, 0.6, 0, 0.3, d / 2, d / 2 + 0.4, 0x9a9690, 0.02); K.put(M.brass, sph(0.035, 8, 6), 0.22, 1.15, d / 2 + 0.07, 0, 0, 0, 1, 1, 1, 0xc89a3a); }
  }); }

// THE CLOCK: pine cabinet (29 x 14 in, so 0.74 x 0.36 m) with a mirror on the door, a brass dial, a bell on top and a hammer.
// Origin bottom centre, front +z. userData: hh, mh (hand groups; rotation.z), door (pivot; rotation.y opens), hammer (rotation.z), body
export function makeCabinet(dialMat) { const G = new THREE.Group(), K = new Kit(), W = 0.18, D = 0.11, HT = 0.74, c = 0xd8a868;
  K.box(M.pine, -W, W, 0, HT, -D, D, c, 0.01); K.box(M.pine, -W - 0.025, W + 0.025, HT, HT + 0.035, -D - 0.025, D + 0.025, 0xc8945a, 0.008); K.box(M.pine, -W - 0.02, W + 0.02, 0, 0.04, -D - 0.02, D + 0.02, 0xb8844a, 0.008);
  K.box(M.pine, -W + 0.015, W - 0.015, 0.455, 0.47, D, D + 0.012, 0xb8844a, 0.004); // rail between hood and door
  K.put(M.brass, cyl(0.135, 0.135, 0.012, 32), 0, 0.6, D + 0.004, Math.PI / 2, 0, 0, 1, 1, 1, 0xc89a48); // bezel
  K.beam(M.brass, [0, HT + 0.035, 0], [0, HT + 0.1, 0], 0.008, 0x8a6a30, true, 6);
  K.build(G);
  const dial = mesh(G, new THREE.CircleGeometry(0.125, 40), dialMat, 0, 0.6, D + 0.012, 0, 0, 0, false);
  const hand = (len, wd, col) => { const g = new THREE.Group(); g.position.set(0, 0.6, D + 0.018); G.add(g); const Kh = new Kit(); Kh.box(M.iron, -wd / 2, wd / 2, -0.012, len, -0.002, 0.002, col, 0.001); Kh.put(M.iron, sph(wd * 0.9, 8, 6), 0, len * 0.72, 0, 0, 0, 0, 1, 0.6, 0.3, col); Kh.build(g); return g; };
  const hh = hand(0.07, 0.012, 0x1e1a26), mh = hand(0.105, 0.008, 0x1e1a26); mesh(G, sph(0.01, 8, 6), M.brass, 0, 0.6, D + 0.022, 0, 0, 0, false);
  // the door: pivot on the left edge, a mirror panel in a frame
  const door = new THREE.Group(); door.position.set(-W + 0.015, 0, D + 0.005); G.add(door); { const KD = new Kit(); KD.box(M.pine, 0, 2 * W - 0.03, 0.06, 0.44, 0, 0.018, 0xc89058, 0.004); KD.put(M.brass, sph(0.009, 8, 6), 2 * W - 0.06, 0.25, 0.024, 0, 0, 0, 1, 1, 1, 0xc89a48); KD.build(door);
    mesh(door, plane(2 * W - 0.09, 0.32), M.mirror, W - 0.015, 0.25, 0.0195, 0, 0, 0, false); }
  // bell on its post, and the hammer (pivot beside the bell)
  const bell = new THREE.Group(); bell.position.set(0, HT + 0.1, 0); G.add(bell); { const pts = [[0.075, 0], [0.072, 0.012], [0.06, 0.03], [0.045, 0.06], [0.02, 0.075], [0, 0.078]].map(([r, y]) => new THREE.Vector2(r, y)); const b = mesh(bell, new THREE.LatheGeometry(pts, 24), M.brass, 0, -0.05, 0, 0, 0, 0, true); tintM(b, 0xd8a840); b.material = M.brass; }
  const hammer = new THREE.Group(); hammer.position.set(0.13, HT + 0.035, 0); G.add(hammer); { const KH = new Kit(); KH.beam(M.iron, [0, 0, 0], [-0.04, 0.09, 0], 0.005, 0x2a2a30, true, 5); KH.put(M.iron, sph(0.016, 10, 8), -0.045, 0.095, 0, 0, 0, 0, 1, 1, 1, 0x3a3a44); KH.build(hammer); }
  G.traverse((o) => { if (o.isMesh && o.material.vertexColors && !o.geometry.attributes.color) o.geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(o.geometry.attributes.position.count * 3).fill(1), 3)); });
  G.userData = { hh, mh, door, hammer, bell, dial };
  return G; }
// set a cabinet: minutes since midnight, door 0..1 open, strike 0..1 (hammer lift: 0 rest, 1 raised), shake 0..1
export function setCab(G, o) { const U = G.userData; if (o.min != null) { const m = o.min; U.mh.rotation.z = -(m % 60) / 60 * TAU; U.hh.rotation.z = -((m / 60) % 12) / 12 * TAU; }
  if (o.door != null) U.door.rotation.y = -1.9 * o.door; if (o.strike != null) U.hammer.rotation.z = -0.6 * o.strike; U.bell.position.x = 0.004 * (o.shake || 0) * Math.sin((o.f || 0) * 2.9); }

// ================================================================= TOWN (Concord Main Street, 1787)
function buildTown(root) { const R = PT.rng(1787), K = new Kit();
  const gr = mesh(root, planeUV(12, 70, 3, 18), M.road, 0, 0, -24, -Math.PI / 2, 0, 0, false); gr.receiveShadow = true;
  for (const s of [-1, 1]) { const g2 = mesh(root, planeUV(40, 70, 10, 18), M.grassN, s * 26, -0.01, -24, -Math.PI / 2, 0, 0, false); g2.receiveShadow = true; }
  const walls = [M.siding, M.sidingD, M.brickA, M.sidingB, M.sidingC, M.siding, M.brickB, M.sidingD];
  let z = -2; for (let i = 0; z > -42; i++) { const w = 3.6 + R() * 1.6, h = 4.6 + (i % 3) * 1.2 + R() * 0.5; z -= w / 2;
    for (const s of [-1, 1]) { if (s > 0 && i === 0) continue; house(root, K, { x: s * 7.2, z, w, d: 5.2, h, wall: walls[(i * 2 + (s > 0 ? 1 : 0)) % walls.length], face: -s, R, lit: 0.06 }); }
    z -= w / 2 + 1.4 + R() * 1.2; }
  // LEVI'S SHOP (right side, nearest): two storeys, front facing -x toward the street; the sign hangs over the road
  const SX = 6.6, SZ = -4.0; house(root, K, { x: SX + 0.6, z: SZ, w: 5.0, d: 5.2, h: 5.2, wall: M.sidingB, face: -1, R: PT.rng(4), lit: 0, door: true });
  K.box(M.wood, SX - 2.06, SX - 2.02, 0.55, 2.25, SZ + 1.0, SZ + 2.2, 0x5a3a24, 0.01); // shop-window frame
  const shopWin = mesh(root, plane(1.1, 1.5), M.winDark, SX - 2.035, 1.4, SZ + 1.6, 0, -Math.PI / 2, 0, false);
  const upWin = mesh(root, plane(0.62, 0.9), M.winDark, SX - 2.035, 3.55, SZ - 1.2, 0, -Math.PI / 2, 0, false);
  K.beam(M.lampPost, [SX - 2.0, 3.0, SZ + 2.4], [SX - 3.2, 3.0, SZ + 2.4], 0.035, 0x1e1c24, true, 5); const sign = mesh(root, plane(1.3, 0.62), M.signShop, SX - 2.65, 2.6, SZ + 2.4, 0, -Math.PI / 2 + 0.0, 0, false); sign.rotation.y = 0;
  // a tall case clock painted on a board as the shop's trade sign is enough: a big dial on the gable
  mesh(root, new THREE.CircleGeometry(0.5, 32), M.dialR, SX - 2.04, 4.4, SZ + 1.2, 0, -Math.PI / 2, 0, false);
  // meetinghouse steeple at the end of the street (white, New England)
  K.at(0, 0, -50, 0, () => { K.box(M.siding, -5, 5, 0, 7.5, -12, 0, 0xf2ece0, 0.03); K.put(M.shing, prism(10.4, 3.2, 12.4), 0, 7.5, -6, 0, 0, 0, 1, 1, 1, 0x4a4048);
    K.box(M.white, -1.6, 1.6, 0, 11, -1.6, 1.6, 0xf4f0e6, 0.03); for (let i = 0; i < 3; i++) K.put(M.winDark, plane(0.7, 1.6), 0, 3 + i * 3, 1.62, 0, 0, 0, 1, 1, 1);
    K.box(M.white, -1.2, 1.2, 11, 14.2, -1.2, 1.2, 0xf4f0e6, 0.03); K.box(M.white, -1.35, 1.35, 14.2, 14.5, -1.35, 1.35, 0xe8e2d6, 0.03); K.put(M.winDark, plane(1.0, 2.0), 0, 12.6, 1.21, 0, 0, 0, 1, 1, 1);
    K.box(M.white, -0.9, 0.9, 14.5, 16.4, -0.9, 0.9, 0xf4f0e6, 0.03); K.put(M.white, new THREE.ConeGeometry(0.75, 6.0, 8), 0, 19.4, 0, 0, Math.PI / 8, 0, 1, 1, 1, 0xf6f2ea); K.put(M.brass, sph(0.16, 10, 8), 0, 22.5, 0, 0, 0, 0, 1, 1, 1, 0xd8a83a);
    K.put(M.white, new THREE.CircleGeometry(0.6, 24), 0, 15.45, 0.92, 0, 0, 0, 1, 1, 1, 0xf8f2e2); });
  // rail fence on the left (ROOSTY's perch), a well, barrels, a cart, a hitching post (clutter near / mid / far)
  for (let x = -6.2; x < -1.6; x += 1.6) { K.beam(M.wood, [x, 0, 2.2], [x, 1.1, 2.2], 0.06, 0x6a4a30, true, 6); } for (const y of [0.55, 1.0]) K.beam(M.wood, [-6.2, y, 2.2], [-1.8, y, 2.2], 0.045, 0x7a5a38, true, 5);
  K.at(-3.6, 0, -6.5, 0.3, () => { K.put(M.stoneW, cyl(0.6, 0.65, 0.8, 14), 0, 0.4, 0, 0, 0, 0, 1, 1, 1, 0x8a8a90); for (const s of [-1, 1]) K.beam(M.wood, [s * 0.6, 0.8, 0], [s * 0.6, 2.0, 0], 0.05, 0x5a3a24, true, 5); K.put(M.shing, prism(1.6, 0.5, 1.0), 0, 2.0, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0x4a3a3a); });
  for (const [x, z2] of [[3.9, -1.0], [4.3, -1.5], [-4.2, -12], [4.0, -17]]) K.put(M.wood, cyl(0.26, 0.24, 0.62, 12), x, 0.31, z2, 0, R() * 6, 0, 1, 1, 1, 0x8a5a38);
  K.at(-4.0, 0, -20, 0.4, () => { K.box(M.wood, -0.7, 0.7, 0.45, 0.62, -0.4, 0.4, 0x6a4a30, 0.02); for (const s of [-1, 1]) K.put(M.wood, cyl(0.32, 0.32, 0.06, 14), s * 0.72, 0.32, -0.1, 0, 0, Math.PI / 2, 1, 1, 1, 0x5a3a24); });
  K.beam(M.wood, [3.8, 0, 1.0], [3.8, 1.1, 1.0], 0.07, 0x5a3a24, true, 6); K.beam(M.wood, [3.8, 1.0, 1.0], [3.8, 1.0, -0.4], 0.04, 0x5a3a24, true, 5);
  for (let i = 0; i < 14; i++) { const s = i % 2 ? 1 : -1; tree(K, s * (11 + R() * 8), -4 - i * 3.6 - R() * 2, 1.4 + R() * 0.7, R); }
  K.build(root, 12);
  const hillsN = mesh(root, plane(260, 40), M.hillsN, 0, 8, -120, 0, 0, 0, false); const hillsD = mesh(root, plane(260, 40), M.hillsD, 0, 8, -120, 0, 0, 0, false); for (const hm of [hillsN, hillsD]) { hm.renderOrder = -1; nond(hm); }
  const moon = mesh(root, plane(9, 9), M.moon, -18, 30, -110, 0, 0.15, 0, false); moon.renderOrder = -2; nond(moon);
  const sun = mesh(root, plane(22, 22), M.sunDisc, 3, 3, -118, 0, 0, 0, false); sun.renderOrder = -2; nond(sun);
  const winG = glowAt(root, [SX - 2.2, 3.55, SZ - 1.2], 2.2, '#ffc060', 0); const shopG = glowAt(root, [SX - 2.2, 1.4, SZ + 1.6], 2.6, '#ffc060', 0);
  const dust = motes(root, 50, [-4, 4, 0.2, 3.5, -10, 3], 77, 0.012);
  return { shopWin, upWin, winG, shopG, moon, sun, hillsN, hillsD, dust, SX, SZ }; }

// ================================================================= BEDROOM (Levi's room)
function buildBedroom(root) { const R = PT.rng(1788), K = new Kit(), X = 4.2, ZB = -3.0, HT = 3.0;
  K.box(M.floor, -X, X, -0.06, 0, ZB, 4, 0xffffff, 0.01); K.box(M.plaster, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); K.box(M.plaster, -X - 0.2, -X, 0, HT, ZB, 4, 0xf0e8d8, 0.01); K.box(M.plaster, X, X + 0.2, 0, HT, ZB, 4, 0xf0e8d8, 0.01);
  K.box(M.wood, -X, X, HT - 0.18, HT, ZB, 4, 0x5a3a24, 0.01); for (let x = -X + 0.8; x < X; x += 1.6) K.box(M.wood, x - 0.12, x + 0.12, HT - 0.32, HT - 0.18, ZB, 4, 0x4a2e1c, 0.01); // ceiling beams
  for (const [a, b, c, d] of [[-X, X, ZB, ZB + 0.05], [-X, -X + 0.05, ZB, 4], [X - 0.05, X, ZB, 4]]) K.box(M.wood, a, b, 0, 0.16, c, d, 0x5a3a24, 0.01);
  // window, back wall left: night sky / dawn sky panes swapped by mood
  for (const [a, b, c, d] of [[-2.66, -2.54, 1.1, 2.5], [-1.06, -0.94, 1.1, 2.5], [-2.66, -0.94, 1.08, 1.18], [-2.66, -0.94, 2.42, 2.52]]) K.box(M.wood, a, b, c, d, ZB, ZB + 0.1, 0x6a4a30, 0.01); const sky = mesh(root, plane(1.4, 1.24), M.skyNight, -1.8, 1.8, ZB + 0.03, 0, 0, 0, false);
  for (let i = 1; i < 3; i++) K.box(M.wood, -2.6 + i * 1.6 / 3 - 0.02, -2.6 + i * 1.6 / 3 + 0.02, 1.15, 2.45, ZB + 0.04, ZB + 0.1, 0x6a4a30, 0.005); K.box(M.wood, -2.6, -1.0, 1.78, 1.82, ZB + 0.04, ZB + 0.1, 0x6a4a30, 0.005);
  for (const s of [-1, 1]) K.box(M.cloth, -1.8 + s * 0.85 - 0.14, -1.8 + s * 0.85 + 0.14, 1.0, 2.6, ZB + 0.08, ZB + 0.16, 0x7a3a4a, 0.03);
  // rope bed with tall posts on the left, headboard to the back wall; quilt, pillow; the sleeper card sits on it
  K.at(-2.4, 0, -1.2, 0, () => { K.box(M.wood, -1.0, 1.0, 0.36, 0.5, -1.8, 1.4, 0x7a4a2a, 0.02); for (const [x, z2, hh] of [[-1, -1.8, 1.7], [1, -1.8, 1.7], [-1, 1.4, 1.0], [1, 1.4, 1.0]]) K.put(M.wood, cyl(0.06, 0.07, hh, 10), x, hh / 2, z2, 0, 0, 0, 1, 1, 1, 0x6a3a22);
    K.box(M.wood, -1.0, 1.0, 0.5, 1.4, -1.84, -1.76, 0x6a3a22, 0.02); K.box(M.linen, -0.96, 0.96, 0.5, 0.66, -1.76, 1.36, 0xf2ece0, 0.08); K.box(M.quilt, -1.0, 1.0, 0.62, 0.74, -0.6, 1.42, 0xffffff, 0.06); K.box(M.quilt, -1.02, -0.96, 0.25, 0.74, -0.6, 1.42, 0xffffff, 0.02); K.box(M.quilt, 0.96, 1.02, 0.25, 0.74, -0.6, 1.42, 0xffffff, 0.02);
    K.put(M.linen, sph(0.4, 16, 10), 0, 0.76, -1.45, 0, 0, 0, 1.6, 0.4, 0.7, 0xf6f2ea); });
  // nightstand + candle, chair with a coat, washstand with pitcher, rug, a shelf on the back wall for THE CLOCK
  K.at(-0.8, 0, -2.4, 0, () => { K.box(M.wood, -0.3, 0.3, 0, 0.66, -0.25, 0.25, 0x7a4a2a, 0.02); K.put(M.iron, cyl(0.07, 0.09, 0.03, 12), 0, 0.68, 0, 0, 0, 0, 1, 1, 1, 0x9aa0a8); K.put(M.white, cyl(0.03, 0.03, 0.18, 10), 0, 0.78, 0, 0, 0, 0, 1, 1, 1, 0xf4ead0); });
  const flame = mesh(root, plane(0.06, 0.12), M.flame, -0.8, 0.92, -2.4, 0, 0, 0, false); nond(flame);
  K.at(2.6, 0, -0.6, -0.5, () => { K.box(M.wood, -0.25, 0.25, 0.44, 0.5, -0.25, 0.25, 0x6a3a22, 0.02); for (const [a, b] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) K.box(M.wood, a - 0.025, a + 0.025, 0, 0.44, b - 0.025, b + 0.025, 0x5a3420, 0.01); for (let i = 0; i < 4; i++) K.box(M.wood, -0.22 + i * 0.14, -0.2 + i * 0.14, 0.5, 1.1, -0.24, -0.2, 0x5a3420, 0.01); K.box(M.cloth, -0.27, 0.27, 0.5, 1.05, -0.2, -0.12, 0x3a4a5a, 0.03); });
  K.at(3.4, 0, -2.4, 0, () => { K.box(M.wood, -0.4, 0.4, 0, 0.8, -0.3, 0.3, 0x7a4a2a, 0.02); K.put(M.white, cyl(0.26, 0.18, 0.12, 18), 0, 0.86, 0, 0, 0, 0, 1, 1, 1, 0xe8ecf0); K.put(M.white, cyl(0.08, 0.11, 0.3, 14), 0.1, 1.0, 0.05, 0, 0, 0, 1, 1, 1, 0xd8e0ec); });
  mesh(root, plane(2.6, 1.8), M.rug, 0.6, 0.012, 0.6, -Math.PI / 2, 0, 0, false);
  K.box(M.wood, CAB.x - 0.4, CAB.x + 0.4, CAB.y - 0.05, CAB.y, ZB, ZB + 0.3, 0x6a4028, 0.01); for (const s of [-1, 1]) K.beam(M.wood, [CAB.x + s * 0.3, CAB.y - 0.05, ZB + 0.25], [CAB.x + s * 0.3, CAB.y - 0.35, ZB + 0.01], 0.025, 0x5a3420);
  // pegs with a hat, a framed sampler
  for (let i = 0; i < 3; i++) K.put(M.wood, cyl(0.02, 0.02, 0.12, 6), 2.4 + i * 0.3, 2.0, ZB + 0.06, Math.PI / 2, 0, 0, 1, 1, 1, 0x5a3420); K.put(M.white, cyl(0.16, 0.18, 0.12, 12), 2.7, 1.98, ZB + 0.14, 0, 0, 0.2, 1, 1, 1, 0x26222c);
  K.box(M.wood, -3.8, -3.0, 1.5, 2.2, ZB, ZB + 0.04, 0x5a3420, 0.01); mesh(root, plane(0.7, 0.6), M.signConcord, -3.4, 1.85, ZB + 0.045, 0, 0, 0, false);
  K.build(root);
  const cab = makeCabinet(M.dialR); cab.position.set(CAB.x, CAB.y, CAB.z + 0.12); root.add(cab);
  const candleG = glowAt(root, [-0.8, 0.95, -2.3], 1.3, '#ffc060', 0.6); const winG = glowAt(root, [-1.8, 1.8, ZB + 0.3], 2.6, '#8aa0ff', 0.25); const ringG = glowAt(root, [CAB.x, CAB.y + 0.82, CAB.z + 0.3], 1.4, '#fff4c0', 0);
  const rings = [0, 1, 2].map(() => { const r = nond(mesh(root, plane(1, 1), M.ring.clone(), CAB.x, CAB.y + 0.82, CAB.z + 0.25, 0, 0, 0, false)); r.renderOrder = 7; r.visible = false; return r; });
  const shaft = shaftAt(root, [-1.5, 1.2, -1.6], 1.8, 3.6, 0.3, 0.5, 0.14, 0x9ab0ff);
  const dust = motes(root, 50, [-3, 3, 0.3, 2.8, -2.5, 2.5], 41, 0.01);
  return { cab, sky, flame, candleG, winG, ringG, rings, shaft, dust }; }

// ================================================================= SHOP (the clock shop)
function buildShop(root) { const R = PT.rng(1786), K = new Kit(), X = 5, ZB = -3.4, HT = 3.6;
  K.box(M.floor, -X, X, -0.06, 0, ZB, 4, 0xe0d0c0, 0.01); K.box(M.wood, -X, X, 0, HT, ZB - 0.2, ZB, 0xb08a68, 0.01); K.box(M.wood, -X - 0.2, -X, 0, HT, ZB, 4, 0xa07a58, 0.01); K.box(M.wood, X, X + 0.2, 0, HT, ZB, 4, 0xa07a58, 0.01); K.box(M.wood, -X, X, HT - 0.15, HT, ZB, 4, 0x5a3a24, 0.01);
  // workbench along the back wall, pegboard of tools, a lathe, trays of gears; the cabinet under construction sits centre-bench
  K.box(M.wood, -3.2, 3.2, 0.9, 1.0, ZB + 0.05, ZB + 1.05, 0x8a5a38, 0.02); for (const x of [-3.0, 0, 3.0]) K.box(M.wood, x - 0.07, x + 0.07, 0, 0.9, ZB + 0.15, ZB + 0.95, 0x6a4028, 0.01); K.box(M.wood, -3.1, 3.1, 0.2, 0.26, ZB + 0.15, ZB + 0.95, 0x6a4028, 0.01);
  K.box(M.wood, -3.0, 3.0, 1.5, 2.8, ZB + 0.01, ZB + 0.05, 0x7a5030, 0.01); const R2 = PT.rng(5);
  for (let i = 0; i < 12; i++) { const x = -2.7 + i * 0.5, y = 2.2 + (i % 2) * 0.3; K.put(M.wood, cyl(0.015, 0.015, 0.08, 6), x, y + 0.15, ZB + 0.08, Math.PI / 2, 0, 0, 1, 1, 1, 0x4a2e1c);
    if (i % 3 === 0) { K.beam(M.iron, [x, y + 0.12, ZB + 0.1], [x, y - 0.3, ZB + 0.1], 0.015, 0x3a3a44); K.box(M.iron, x - 0.06, x + 0.06, y - 0.36, y - 0.3, ZB + 0.07, ZB + 0.13, 0x3a3a44, 0.005); }
    else if (i % 3 === 1) { K.beam(M.wood, [x, y + 0.12, ZB + 0.1], [x, y - 0.22, ZB + 0.1], 0.02, 0x8a5a38); K.box(M.iron, x - 0.08, x + 0.08, y - 0.3, y - 0.22, ZB + 0.06, ZB + 0.14, 0x4a4a54, 0.01); }
    else { K.put(M.brass, new THREE.TorusGeometry(0.1 + R2() * 0.05, 0.012, 5, 18), x, y - 0.05, ZB + 0.1, 0, 0, 0, 1, 1, 1, 0xc89a48); } }
  for (const [x, z2] of [[-2.4, ZB + 0.5], [-1.6, ZB + 0.7], [2.0, ZB + 0.55]]) { K.box(M.wood, x - 0.25, x + 0.25, 1.0, 1.05, z2 - 0.18, z2 + 0.18, 0x5a3a24, 0.01); for (let k = 0; k < 4; k++) K.put(M.brass, cyl(0.05 + k * 0.012, 0.05 + k * 0.012, 0.01, 16), x - 0.15 + k * 0.1, 1.06, z2 + (k % 2 ? 0.06 : -0.06), 0, 0, 0, 1, 1, 1, 0xd8a848); }
  K.at(2.6, 1.0, ZB + 0.5, 0, () => { K.box(M.iron, -0.4, 0.4, 0, 0.08, -0.12, 0.12, 0x3a3a44, 0.01); K.box(M.iron, -0.38, -0.24, 0.08, 0.32, -0.1, 0.1, 0x3a3a44, 0.01); K.put(M.iron, cyl(0.02, 0.02, 0.4, 8), 0.0, 0.22, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x8a8a90); K.put(M.iron, cyl(0.12, 0.12, 0.04, 16), -0.31, 0.22, 0.14, Math.PI / 2, 0, 0, 1, 1, 1, 0x5a5a64); });
  // tall case clocks along the left and right walls (finished work), with dials
  const dials = []; for (const [x, z2, ry] of [[-4.5, -1.6, Math.PI / 2], [-4.5, 0.2, Math.PI / 2], [4.5, -1.2, -Math.PI / 2]]) K.at(x, 0, z2, ry, () => { K.box(M.wood, -0.3, 0.3, 0, 2.3, -0.2, 0.2, 0x6a3a22, 0.02); K.box(M.wood, -0.34, 0.34, 2.3, 2.42, -0.24, 0.24, 0x5a3420, 0.02); K.box(M.wood, -0.26, 0.26, 0.4, 1.5, 0.2, 0.23, 0x7a4a2a, 0.01); dials.push([x, z2, ry]); });
  // window on the right wall with daylight; lamp hanging; shavings on the floor; a crate of pine boards
  K.box(M.wood, X - 0.08, X, 1.0, 2.6, -0.4, 1.8, 0x5a3420, 0.02); const win = mesh(root, plane(2.0, 1.4), M.skyDay, X - 0.09, 1.8, 0.7, 0, -Math.PI / 2, 0, false);
  K.beam(M.iron, [0.4, HT, -1.2], [0.4, 2.6, -1.2], 0.01, 0x2a2a30); K.put(M.iron, cyl(0.06, 0.16, 0.22, 10), 0.4, 2.5, -1.2, 0, 0, 0, 1, 1, 1, 0x2a2a30);
  for (let i = 0; i < 18; i++) K.put(M.pine, new THREE.TorusGeometry(0.06, 0.012, 4, 10, 4), -1 + R() * 3, 0.01, -2.2 + R() * 3, Math.PI / 2, 0, R() * 6, 1, 1, 1, 0xe8c080);
  K.at(-3.0, 0, 1.4, 0.3, () => { K.box(M.wood, -0.5, 0.5, 0, 0.5, -0.35, 0.35, 0x7a5030, 0.02); for (let i = 0; i < 4; i++) K.box(M.pine, -0.45, 0.45, 0.5 + i * 0.03, 0.53 + i * 0.03, -0.3 + i * 0.05, -0.2 + i * 0.05, 0xd8a868, 0.005); });
  K.build(root);
  for (const [x, z2, ry] of dials) mesh(root, new THREE.CircleGeometry(0.2, 28), M.dial, x + Math.sin(ry) * 0.24, 1.95, z2 + Math.cos(ry) * 0.24, 0, ry, 0, false);
  mesh(root, plane(1.6, 0.68), M.signInside, 0, 3.15, ZB + 0.03, 0, 0, 0, false);
  const cab = makeCabinet(M.dialR); cab.position.set(0.2, 1.0, ZB + 0.55); cab.scale.setScalar(1.25); root.add(cab);
  const lbls = [[M.lblPine, -0.3, 1.8, ZB + 0.85], [M.lblMirror, 0.62, 1.2, ZB + 0.95]].map(([mt, x, y, z2]) => { const l = mesh(root, plane(0.5, 0.19), mt, x, y, z2, 0, 0, 0, false); l.visible = false; return l; });
  const lampG = glowAt(root, [0.4, 2.35, -1.2], 1.8, '#ffc870', 0); const winG = glowAt(root, [X - 0.4, 1.8, 0.7], 3.0, '#fff0d0', 0.3);
  const shaft = shaftAt(root, [3.4, 1.4, 0.4], 2.4, 4.0, -Math.PI / 2 + 0.6, 0.6, 0.16, 0xfff0d0);
  const dust = motes(root, 60, [-3, 3.5, 0.4, 3, -2.8, 2], 51, 0.01);
  return { cab, lbls, lampG, winG, shaft, dust, win }; }

// ================================================================= WORKS (blueprint cutaway of the alarm)
function buildWorks(root) { const K = new Kit(), { WR, WC } = WORKS;
  const bp = mesh(root, plane(22, 11), M.bp, 0, 4.2, -2.0, 0, 0, 0, false); K.box(M.pine, -11, 11, -0.1, 0, -2, 6, 0x6a5a6a, 0.01);
  // back plate (brass, cut), pillars
  K.box(M.brass, -3.6, 4.6, 0.2, 5.6, -0.9, -0.8, 0xa8803a, 0.04); for (const [x, y] of [[-3.3, 0.5], [4.3, 0.5], [-3.3, 5.3], [4.3, 5.3]]) K.put(M.brass, cyl(0.08, 0.08, 0.9, 10), x, y, -0.4, Math.PI / 2, 0, 0, 1, 1, 1, 0xc89a48);
  K.build(root);
  const gears = []; const gear = (x, y, z, r, n, sp, c = 0xd8a848) => { const g = new THREE.Group(); g.position.set(x, y, z); root.add(g); const KW = new Kit(); KW.put(M.brass, new THREE.TorusGeometry(r, 0.06, 6, 48), 0, 0, 0, 0, 0, 0, 1, 1, 1, c);
    for (let i = 0; i < n; i++) { const a = i / n * TAU; KW.cb(M.brass, 0.09, 0.1, 0.08, Math.cos(a) * (r + 0.08), Math.sin(a) * (r + 0.08), 0, c, 0, 0, a); } for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; KW.beam(M.brass, [0, 0, 0], [Math.cos(a) * r, Math.sin(a) * r, 0], 0.04, c); }
    KW.put(M.iron, cyl(0.1, 0.1, 0.5, 12), 0, 0, -0.2, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a3a44); KW.build(g); g.userData.sp = sp; gears.push(g); return g; };
  gear(-2.4, 4.4, -0.55, 0.7, 26, 0.5); gear(-2.5, 1.3, -0.55, 0.55, 20, -0.7); gear(3.3, 1.2, -0.55, 0.6, 22, 0.6); gear(-1.0, 5.1, -0.6, 0.35, 14, -1.1); gear(2.2, 4.9, -0.6, 0.3, 12, 1.3);
  // the hour wheel (rotates with the hour) + its red 4 o'clock pin, mounted on the front
  const wheel = new THREE.Group(); wheel.position.set(...WC); root.add(wheel); const face = mesh(wheel, new THREE.CircleGeometry(WR, 64), M.wheel, 0, 0, 0.02, 0, 0, 0, false); { const KW = new Kit(); const n = 72; for (let i = 0; i < n; i++) { const a = i / n * TAU; KW.cb(M.brass, 0.1, 0.12, 0.1, Math.cos(a) * (WR + 0.05), Math.sin(a) * (WR + 0.05), 0, 0xc89a48, 0, 0, a); }
    KW.put(M.brass, new THREE.TorusGeometry(WR, 0.05, 6, 64), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xb8883a); KW.put(M.iron, cyl(0.16, 0.16, 0.3, 14), 0, 0, 0.05, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a3a44); KW.build(wheel); }
  const pa = Math.PI / 2 - 4 / 12 * TAU, pr = WR * 0.97; const pin = tintM(mesh(wheel, cyl(0.1, 0.1, 0.42, 12), M.iron, Math.cos(pa) * pr, Math.sin(pa) * pr, 0.24, Math.PI / 2, 0, 0, true), 0xd02a2a); pin.material = M.iron.clone(); pin.material.emissive = new THREE.Color(0x601010);
  // the trip lever: pivot upper right; its left tail rides just above the rim at the top, its right arm carries the hammer head
  // beside the bell. When the red pin reaches the top it lifts the tail, which swings the hammer into the bell.
  const LP = [1.3, WC[1] + WR + 0.5, 0.32]; const lever = new THREE.Group(); lever.position.set(...LP); root.add(lever); { const KL = new Kit(); KL.beam(M.iron, [0, 0, 0], [-1.32, -0.42, 0], 0.07, 0x3a3a44, true, 6); KL.put(M.iron, sph(0.09, 10, 8), -1.34, -0.43, 0, 0, 0, 0, 1, 1, 1, 0x3a3a44); KL.put(M.iron, cyl(0.12, 0.12, 0.2, 12), 0, 0, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2a30); KL.beam(M.iron, [0, 0, 0], [0.42, 0.85, 0], 0.07, 0x3a3a44, true, 6); KL.put(M.iron, sph(0.2, 14, 10), 0.44, 0.9, 0, 0, 0, 0, 1, 1, 1, 0x4a4a56); KL.build(lever); }
  const hammer = lever;
  const bell = new THREE.Group(); bell.position.set(LP[0] + 1.25, LP[1] + 1.25, 0.32); root.add(bell); { const pts = [[1.0, 0], [0.98, 0.1], [0.85, 0.32], [0.62, 0.7], [0.3, 0.94], [0, 1.0]].map(([r, y]) => new THREE.Vector2(r, y)); const b = mesh(bell, new THREE.LatheGeometry(pts, 36), M.brass, 0, -0.5, 0, 0, 0, 0, true); tintM(b, 0xe0b048); b.material = M.brass; bell.scale.setScalar(0.62); }
  { const KB = new Kit(); KB.beam(M.brass, [LP[0] + 1.25, LP[1] + 1.6, 0.32], [LP[0] + 1.25, LP[1] + 2.3, -0.6], 0.05, 0x8a6a30); KB.build(root); }
  const lbl = (mt, x, y, w = 1.6) => mesh(root, plane(w, w * 0.3), mt, x, y, 0.9, 0, 0, 0, false);
  const lGear = lbl(M.lblGear, 0, WC[1] - 0.75, 1.6), lPin = lbl(M.lblPin, -1.25, WC[1] + WR + 0.75, 1.3), lBell = lbl(M.lblBell, LP[0] + 1.25, LP[1] + 2.15, 0.9);
  const ringG = glowAt(root, [LP[0] + 1.25, LP[1] + 1.1, 0.8], 3.4, '#fff4c0', 0); const pinG = glowAt(root, [0, WC[1] + WR, 0.6], 1.2, '#ff6040', 0);
  const rings = [0, 1, 2].map(() => { const r = nond(mesh(root, plane(1, 1), M.ring.clone(), LP[0] + 1.25, LP[1] + 1.1, 0.6, 0, 0, 0, false)); r.renderOrder = 7; r.visible = false; return r; });
  const dust = motes(root, 50, [-4, 5, 0.3, 7, -1, 2], 91, 0.014);
  return { gears, wheel, pin, lever, hammer, bell, labels: [lGear, lPin, lBell], ringG, pinG, rings, dust, bp }; }

// ================================================================= PARIS (Redier's shop, 1847)
export function makeBedside() { const G = new THREE.Group(), K = new Kit(), R0 = 0.11;
  K.put(M.brass, cyl(R0, R0, 0.07, 36), 0, R0 + 0.03, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0xd0a048); K.put(M.brass, new THREE.TorusGeometry(R0, 0.01, 6, 36), 0, R0 + 0.03, 0.036, 0, 0, 0, 1, 1, 1, 0xe8c060);
  for (const s of [-1, 1]) K.put(M.brass, sph(0.022, 10, 8), s * 0.07, 0.025, 0, 0, 0, 0, 1, 1, 1, 0xb88a3a); K.beam(M.brass, [0, 2 * R0 + 0.03, 0], [0, 2 * R0 + 0.07, 0], 0.006, 0xb88a3a, true, 5);
  K.put(M.brass, new THREE.TorusGeometry(0.03, 0.006, 5, 14, Math.PI), 0, 2 * R0 + 0.075, 0, 0, 0, 0, 1, 1, 1, 0xd0a048); K.build(G);
  const pts = [[0.055, 0], [0.053, 0.008], [0.044, 0.022], [0.03, 0.04], [0.012, 0.05], [0, 0.052]].map(([r, y]) => new THREE.Vector2(r, y)); const bl = mesh(G, new THREE.LatheGeometry(pts, 24), M.brass, 0, 2 * R0 + 0.035, -0.01, 0, 0, 0, true); tintM(bl, 0xe0b048); bl.material = M.brass;
  mesh(G, new THREE.CircleGeometry(R0 * 0.9, 40), M.dialP, 0, R0 + 0.03, 0.0362, 0, 0, 0, false);
  const hand = (len, wd, mat, col, z) => { const g = new THREE.Group(); g.position.set(0, R0 + 0.03, 0.038 + z); G.add(g); const Kh = new Kit(); Kh.box(mat, -wd / 2, wd / 2, -0.008, len, -0.0015, 0.0015, col, 0.0005); Kh.build(g); return g; };
  const ah = hand(0.06, 0.008, M.iron, 0xd02a2a, 0.0), hh = hand(0.052, 0.008, M.iron, 0x1e1a26, 0.002), mh = hand(0.08, 0.005, M.iron, 0x1e1a26, 0.004);
  mesh(G, sph(0.008, 8, 6), M.brass, 0, R0 + 0.03, 0.045, 0, 0, 0, false);
  const knob = new THREE.Group(); knob.position.set(0.0, R0 + 0.03, -0.045); G.add(knob); { const KK = new Kit(); KK.put(M.brass, cyl(0.025, 0.025, 0.012, 10), 0, 0, -0.012, Math.PI / 2, 0, 0, 1, 1, 1, 0xd0a048); KK.box(M.brass, -0.03, 0.03, -0.006, 0.006, -0.03, -0.018, 0xd0a048, 0.002); KK.build(knob); }
  G.traverse((o) => { if (o.isMesh && o.material.vertexColors && !o.geometry.attributes.color) o.geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(o.geometry.attributes.position.count * 3).fill(1), 3)); });
  G.userData = { ah, hh, mh, knob, bell: bl }; return G; }
function buildParis(root) { const R = PT.rng(1847), K = new Kit(), X = 4.6, ZB = -3.2, HT = 3.8;
  K.box(M.floor, -X, X, -0.06, 0, ZB, 4, 0xc8a890, 0.01); K.box(M.parisWall, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); K.box(M.parisWall, -X - 0.2, -X, 0, HT, ZB, 4, 0xe8e0e8, 0.01); K.box(M.parisWall, X, X + 0.2, 0, HT, ZB, 4, 0xe8e0e8, 0.01);
  for (const [a, b, c, d] of [[-X, X, ZB, ZB + 0.06], [-X, -X + 0.06, ZB, 4], [X - 0.06, X, ZB, 4]]) { K.box(M.wood, a, b, 0, 1.0, c, d, 0x3a2418, 0.01); K.box(M.brass, a - 0.01, b + 0.01, 1.0, 1.04, c - 0.01, d + 0.01, 0xc89a48, 0.005); } K.box(M.wood, -X, X, HT - 0.2, HT, ZB, 4, 0xf0e4d0, 0.01);
  // tall window back-left with Paris rooftops at dusk
  K.box(M.wood, -3.6, -1.6, 0.9, 3.3, ZB, ZB + 0.08, 0x2a1a14, 0.02); const roofs = mesh(root, plane(1.86, 2.3), M.roofsN, -2.6, 2.1, ZB + 0.03, 0, 0, 0, false); for (let i = 1; i < 2; i++) K.box(M.wood, -2.62, -2.58, 0.95, 3.25, ZB + 0.04, ZB + 0.1, 0x2a1a14, 0.005); K.box(M.wood, -3.6, -1.6, 2.2, 2.24, ZB + 0.04, ZB + 0.1, 0x2a1a14, 0.005);
  for (const s of [-1, 1]) K.box(M.cloth, -2.6 + s * 1.1 - 0.16, -2.6 + s * 1.1 + 0.16, 0.8, 3.5, ZB + 0.1, ZB + 0.2, 0x3a5a3a, 0.03);
  // patent certificate framed on the back wall right of the window; shelf of clocks; the sign
  K.box(M.brass, 0.25, 1.65, 1.35, 3.25, ZB, ZB + 0.05, 0xc89a48, 0.02); const brevet = mesh(root, plane(1.3, 1.78), M.brevet, 0.95, 2.3, ZB + 0.055, 0, 0, 0, false);
  K.box(M.wood, 2.2, 4.4, 1.9, 1.96, ZB, ZB + 0.35, 0x3a2418, 0.01); K.box(M.wood, 2.2, 4.4, 2.7, 2.76, ZB, ZB + 0.35, 0x3a2418, 0.01); const shelfC = [];
  for (const [x, y] of [[2.5, 1.96], [3.1, 1.96], [3.8, 1.96], [2.7, 2.76], [3.4, 2.76], [4.05, 2.76]]) shelfC.push([x, y]);
  mesh(root, plane(2.2, 0.62), M.signParis, 3.3, 3.25, ZB + 0.03, 0, 0, 0, false);
  // the bench in front: a cloth, tools, the bedside alarm clock (hero) and its case; a gas lamp
  K.box(M.wood, -1.4, 1.6, 0.86, 0.94, -1.4, -0.4, 0x5a3420, 0.02); for (const [a, b] of [[-1.3, -1.3], [1.5, -1.3], [-1.3, -0.5], [1.5, -0.5]]) K.box(M.wood, a - 0.05, a + 0.05, 0, 0.86, b - 0.05, b + 0.05, 0x3a2418, 0.01); K.box(M.cloth, -0.6, 0.8, 0.94, 0.95, -1.2, -0.6, 0x2a5a3a, 0.005);
  K.at(-1.0, 0.94, -0.9, 0, () => { K.box(M.wood, -0.18, 0.18, 0, 0.1, -0.12, 0.12, 0x6a3a22, 0.01); K.put(M.brass, cyl(0.04, 0.04, 0.01, 12), 0.3, 0.005, 0.05, 0, 0, 0, 1, 1, 1, 0xd0a048); K.beam(M.iron, [0.2, 0.01, -0.1], [0.5, 0.01, -0.02], 0.008, 0x8a8a90); });
  K.at(1.25, 0.94, -1.1, 0, () => { K.put(M.brass, cyl(0.07, 0.09, 0.04, 12), 0, 0.02, 0, 0, 0, 0, 1, 1, 1, 0xc89a48); K.beam(M.brass, [0, 0.04, 0], [0, 0.52, 0], 0.012, 0xc89a48, true, 6); K.put(M.white, sph(0.09, 14, 10), 0, 0.6, 0, 0, 0, 0, 1, 1.15, 1, 0xfff4d8); });
  for (let i = 0; i < 3; i++) { const x = -3.8 + i * 0.6; K.box(M.wood, x - 0.2, x + 0.2, 0, 0.5 + i * 0.1, -2.6, -2.2, 0x4a2a1a, 0.01); }
  K.build(root);
  const bed = makeBedside(); bed.position.set(0.1, 0.95, -0.85); root.add(bed);
  const shelfCl = shelfC.map(([x, y], i) => { const c = makeBedside(); c.position.set(x, y, ZB + 0.2); c.scale.setScalar(0.8 + (i % 3) * 0.12); root.add(c); c.userData.ah.rotation.z = -i * 1.3; c.userData.hh.rotation.z = -i * 0.9; c.userData.mh.rotation.z = -i * 2.1; return c; });
  const lampG = glowAt(root, [1.25, 1.55, -1.1], 1.6, '#fff0c0', 0.6); const winG = glowAt(root, [-2.6, 2.1, ZB + 0.3], 3.2, '#ff9a7a', 0.25); const ringG = glowAt(root, [0.1, 1.25, -0.8], 0.8, '#fff4c0', 0);
  const dust = motes(root, 40, [-2, 2, 0.6, 3, -2.5, 1.5], 61, 0.009);
  return { bed, shelfCl, lampG, winG, ringG, dust, brevet, roofs }; }

// ================================================================= lights, grades, API
const SET_LIGHT = {
  townNight: { top: '#060a22', hor: '#1e2a5a', fog: '#141c40', fogN: 16, fogF: 110, sky: '#5a6ac8', ground: '#1a1630', hemiI: 0.78, fillCol: '#4a5ad0', fillI: 0.46, sunCol: '#a8b8ff', sunI: 1.3, az: 150, el: 38, disc: '#000000', stars: 1, clouds: false, shadow: true, cardTint: '#e4e8ff', fxTint: '#eef2ff', shafts: 0 },
  townDawn: { top: '#3a4aa0', hor: '#ffb888', fog: '#e0a090', fogN: 30, fogF: 160, sky: '#9a90d8', ground: '#5a4a50', hemiI: 0.9, fillCol: '#7078d8', fillI: 0.36, sunCol: '#ffb070', sunI: 3.0, az: 175, el: 8, disc: '#000000', stars: 0, clouds: true, shadow: true, cardTint: '#fff0e0', fxTint: '#fff6ea', shafts: 0.4 },
  bedNight: { top: '#000000', hor: '#101430', fog: '#101430', fogN: 10, fogF: 50, sky: '#6a74c0', ground: '#2a2030', hemiI: 0.72, fillCol: '#5a68c0', fillI: 0.44, sunCol: '#a8b8ff', sunI: 1.4, az: -40, el: 34, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#e8e8f8', fxTint: '#ffffff', shafts: 0 },
  bedDawn: { top: '#000000', hor: '#3a2a30', fog: '#3a2a30', fogN: 10, fogF: 50, sky: '#e8b8a0', ground: '#4a3a3a', hemiI: 0.86, fillCol: '#7a78c8', fillI: 0.36, sunCol: '#ffb880', sunI: 2.4, az: -40, el: 16, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
  shop: { top: '#000000', hor: '#3a3040', fog: '#3a3040', fogN: 12, fogF: 60, sky: '#fff0d8', ground: '#5a4a3a', hemiI: 1.15, fillCol: '#8a90c8', fillI: 0.44, sunCol: '#ffe8c0', sunI: 3.2, az: 60, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  shopNight: { top: '#000000', hor: '#101430', fog: '#101430', fogN: 12, fogF: 60, sky: '#7a7ab8', ground: '#2a2030', hemiI: 0.72, fillCol: '#5a68c0', fillI: 0.44, sunCol: '#a8b8ff', sunI: 1.4, az: 60, el: 36, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#e8e8f8', fxTint: '#ffffff', shafts: 0 },
  works: { top: '#000000', hor: '#14203a', fog: '#14203a', fogN: 14, fogF: 70, sky: '#8ab0ff', ground: '#2a2a3a', hemiI: 0.9, fillCol: '#6a80d8', fillI: 0.42, sunCol: '#fff0d8', sunI: 2.6, az: 30, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#f0f0ff', fxTint: '#ffffff', shafts: 0 },
  paris: { top: '#000000', hor: '#2a1a24', fog: '#2a1a24', fogN: 10, fogF: 50, sky: '#ffc8a8', ground: '#4a3030', hemiI: 0.86, fillCol: '#7a78c8', fillI: 0.34, sunCol: '#ffb880', sunI: 2.2, az: -50, el: 22, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  townNight: { look: 'night', over: { exp: 1.18, con: 1.22, sat: 1.08, lift: [0.02, 0.026, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.52, 0.66], hal: [0.32, '#ffa050'], vig: [0.42, 0.42, '#04061a'] } },
  townDawn: { look: 'golden', over: { exp: 1.08, con: 1.22, sat: 1.1, tS: ['#3a3a8a', 0.2], tH: ['#ffc080', 0.12], bloom: [0.46, 0.74], hal: [0.3, '#ff9a50'], vig: [0.34, 0.46, '#1e1a3a'] } },
  bedNight: { look: 'night', over: { exp: 1.18, con: 1.22, sat: 1.06, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.52, 0.64], hal: [0.34, '#ffa050'], vig: [0.42, 0.42, '#08081a'] } },
  bedDawn: { look: 'golden', over: { exp: 1.1, con: 1.22, sat: 1.08, lift: [0.035, 0.022, 0.04], tS: ['#3a2a6a', 0.2], tH: ['#ffb070', 0.12], bloom: [0.44, 0.74], hal: [0.3, '#ff9050'], vig: [0.36, 0.46, '#2a1420'] } },
  shop: { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.08, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.42, 0.78], hal: [0.26, '#ff9a50'], vig: [0.34, 0.46, '#2a1420'] } },
  shopNight: { look: 'night', over: { exp: 1.16, con: 1.22, sat: 1.04, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#c0d0ff', 0.1], bloom: [0.5, 0.68], hal: [0.3, '#8090ff'], vig: [0.42, 0.42, '#08081a'] } },
  works: { look: 'office', over: { exp: 1.1, con: 1.22, sat: 1.12, lift: [0.02, 0.03, 0.06], tS: ['#1a2a6a', 0.2], tH: ['#ffd090', 0.1], bloom: [0.44, 0.74], hal: [0.26, '#ffb060'], vig: [0.36, 0.46, '#08102a'] } },
  paris: { look: 'golden', over: { exp: 1.12, con: 1.24, sat: 1.08, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.2], tH: ['#ffb878', 0.12], bloom: [0.46, 0.72], hal: [0.3, '#ff9a50'], vig: [0.38, 0.44, '#2a1420'] } },
};

export function buildAL(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'townNight', win: 0, lamp: 0, ring: -1, ringG: 0, ws: { hour: 3, trip: 0, strike: 0 } };
  let tn, bd, sp, wk, pr;
  const API = makeAPI(ctx, { prefix: 'al_', origin: AL_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { townNight: 'day', townDawn: 'day', bedNight: 'office', bedDawn: 'office', shop: 'office', shopNight: 'office', works: 'office', paris: 'office' },
    practicals: (name, F, W3) => { const fl = 1 + 0.06 * Math.sin(F * 0.7) + 0.04 * Math.sin(F * 1.9);
      if (name === 'townNight' || name === 'townDawn') return [{ p: W3('town', [tn.SX - 3.0, 3.5, tn.SZ - 1.2]), col: '#ffb860', I: 9 * ST.win * fl, d: 9 }, { p: W3('town', [tn.SX - 3.0, 1.4, tn.SZ + 1.6]), col: '#ffb860', I: 7 * ST.lamp * fl, d: 8 }, { p: W3('town', [-1.0, 2.0, 2.0]), col: '#ffc070', I: 3.2 * ST.lamp * fl, d: 6 }];
      if (name === 'bedNight' || name === 'bedDawn') return [{ p: W3('bedroom', [-0.8, 1.2, -2.1]), col: '#ffb860', I: 4.2 * fl, d: 6 }, { p: W3('bedroom', [-1.8, 2.0, -2.0]), col: name === 'bedNight' ? '#8a9aff' : '#ffc8a0', I: 3.0, d: 8 }, { p: W3('bedroom', [CAB.x, CAB.y + 1.0, CAB.z + 0.6]), col: '#fff0c0', I: 1.4 + 10 * ST.ringG, d: 4 }];
      if (name === 'shop') return [{ p: W3('shop', [4.2, 1.9, 0.7]), col: '#fff0d0', I: 4.0, d: 10 }, { p: W3('shop', [0.4, 2.3, -1.2]), col: '#ffc870', I: 4.5 * fl, d: 7 }, { p: W3('shop', [0.2, 2.0, 1.8]), col: '#ffe8c8', I: 3.0, d: 8 }];
      if (name === 'shopNight') return [{ p: W3('shop', [0.4, 2.3, -1.2]), col: '#ffb860', I: 6.0 * fl, d: 7 }, { p: W3('shop', [4.2, 1.9, 0.7]), col: '#8a9aff', I: 2.6, d: 9 }, { p: W3('shop', [-2, 2.4, 1.5]), col: '#7a8aff', I: 1.4, d: 8 }];
      if (name === 'works') return [{ p: W3('works', [-1, 4, 4]), col: '#fff0d8', I: 3.2, d: 14 }, { p: W3('works', [2.55, 6.6, 1.6]), col: '#fff4c0', I: 2 + 16 * ST.ringG, d: 7 }, { p: W3('works', [0, WORKS.WC[1] + WORKS.WR, 1.2]), col: '#ff7050', I: 6 * ST.ws.trip, d: 4 }];
      if (name === 'paris') return [{ p: W3('paris', [1.25, 1.6, -1.0]), col: '#ffe8b0', I: 4.0 * fl, d: 7 }, { p: W3('paris', [-2.6, 2.1, -2.6]), col: '#ff9a7a', I: 2.2, d: 8 }, { p: W3('paris', [0.1, 1.3, -0.5]), col: '#fff0c0', I: 1.0 + 8 * ST.ringG, d: 4 }];
      return []; },
    tick: (f, cur) => { const T = f / 30, fl = 0.9 + 0.08 * Math.sin(f * 0.8) + 0.04 * Math.sin(f * 2.1);
      if (cur === 'town' && tn) { const night = ST.mood === 'townNight'; tn.upWin.material = ST.win > 0.5 ? M.winLit : M.winDark; tn.shopWin.material = ST.lamp > 0.5 ? M.winLit : M.winDark; tn.winG.material.opacity = 0.6 * ST.win * fl; tn.shopG.material.opacity = 0.5 * ST.lamp * fl;
        tn.moon.visible = night; tn.sun.visible = !night; tn.hillsN.visible = night; tn.hillsD.visible = !night; tickMotes(tn.dust, f, 0.4); }
      if (cur === 'bedroom' && bd) { bd.sky.material = ST.mood === 'bedDawn' ? M.skyDawn : M.skyNight; bd.candleG.material.opacity = 0.55 * fl; bd.flame.scale.set(1, fl, 1); bd.winG.material.opacity = ST.mood === 'bedDawn' ? 0.35 : 0.22; bd.ringG.material.opacity = 0.9 * ST.ringG; tickRings(bd.rings, f, 0.5); tickMotes(bd.dust, f, 0.3); }
      if (cur === 'shop' && sp) { const n = ST.mood === 'shopNight'; sp.lampG.material.opacity = (n ? 0.75 : 0.35) * fl; sp.winG.material.opacity = n ? 0.12 : 0.3; sp.win.material = n ? M.skyNight : M.skyDay; sp.shaft.visible = !n; tickMotes(sp.dust, f, 0.3); }
      if (cur === 'works' && wk) { wk.gears.forEach((g) => (g.rotation.z = T * g.userData.sp * 0.5)); wk.ringG.material.opacity = 0.9 * ST.ringG; wk.pinG.material.opacity = 0.8 * ST.ws.trip; tickRings(wk.rings, f, 1.6); tickMotes(wk.dust, f, 0.3); }
      if (cur === 'paris' && pr) { pr.lampG.material.opacity = 0.55 * fl; pr.ringG.material.opacity = 0.8 * ST.ringG; tickMotes(pr.dust, f, 0.3); } },
    glows: {},
    mood: (name) => { ST.mood = name; },
    apply: (v) => { if (v.win != null) API.setWindow(v.win, v.lamp || 0); if (v.cab) API.setBedCab(v.cab); if (v.shopCab) API.setShopCab(v.shopCab); if (v.works) API.setWorks(v.works); if (v.bedside) API.setBedside(v.bedside); if (v.labels != null) API.setLabels(v.labels); } });
  tn = buildTown(API.groups.town); bd = buildBedroom(API.groups.bedroom); sp = buildShop(API.groups.shop); wk = buildWorks(API.groups.works); pr = buildParis(API.groups.paris);
  API.parts = { tn, bd, sp, wk, pr };
  function tickRings(rs, f, R0) { rs.forEach((r, i) => { const t = (f - ST.ring - i * 5) / 24; r.visible = ST.ring >= 0 && t > 0 && t < 1; if (!r.visible) return; const s = R0 * (1 + 3.0 * t); r.scale.set(s, s, 1); r.material.opacity = 0.6 * (1 - t) ** 1.4; if (H.CAM) r.quaternion.copy(H.CAM.quaternion); }); }
  API.setRing = (f0, g = 0) => { ST.ring = f0; ST.ringG = g; };
  API.setWindow = (w, l = 0) => { ST.win = w; ST.lamp = l; };
  API.setBedCab = (o) => setCab(bd.cab, o); API.setShopCab = (o) => setCab(sp.cab, o);
  API.setLabels = (k) => { sp.lbls.forEach((l, i) => (l.visible = k > i)); };
  // works: hour (0..12, float), trip (0..1 lever lift), strike (0..1 hammer raised)
  API.setWorks = (o) => { Object.assign(ST.ws, o); wk.wheel.rotation.z = (ST.ws.hour / 12) * TAU; wk.lever.rotation.z = -0.2 * ST.ws.trip + 0.12 * ST.ws.strike; wk.bell.rotation.z = 0.05 * (o.shake || 0) * Math.sin((o.f || 0) * 2.7); wk.labels.forEach((l, i) => (l.visible = (o.labels ?? 3) > i)); };
  // paris bedside: alarm hand angle (hours 0..12), time (minutes), strike shake
  API.setBedside = (o) => { const U = pr.bed.userData; if (o.alarm != null) U.ah.rotation.z = -(o.alarm / 12) * TAU; if (o.min != null) { U.mh.rotation.z = -(o.min % 60) / 60 * TAU; U.hh.rotation.z = -((o.min / 60) % 12) / 12 * TAU; } if (o.knob != null) U.knob.rotation.z = o.knob; pr.bed.position.x = 0.1 + 0.004 * (o.shake || 0) * Math.sin((o.f || 0) * 2.9); };
  API.glows = { town: [tn.winG, tn.shopG], bedroom: [bd.candleG, bd.winG, bd.ringG], shop: [sp.lampG, sp.winG], works: [wk.ringG, wk.pinG], paris: [pr.lampG, pr.winG, pr.ringG] };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  const V = API.V;
  API.views = [
    V('townNight', [-1.2, 1.6, 9], [0.8, 3.0, -10], 50, 0.6, [2, 2.5, -4], { win: 1 }), // 0 Main Street at 4 AM
    V('townNight', [1.0, 1.5, 3.2], [4.4, 2.6, -2.0], 46, 1.2, [4.4, 2.4, -1.6], { win: 1, lamp: 1 }), // 1 Levi's shop front
    V('townDawn', [-1.0, 1.7, 9], [0.4, 3.2, -10], 50, 0.6, [2, 2.5, -4], { win: 1, lamp: 1 }), // 2 dawn street
    V('townDawn', [-3.4, 1.4, 4.8], [-3.8, 1.2, 2.2], 44, 1.6, [-3.8, 1.1, 2.2]), // 3 fence close (ROOSTY)
    V('bedNight', [1.0, 1.6, 2.6], [CAB.x, CAB.y + 0.45, CAB.z], 40, 1.6, [CAB.x, CAB.y + 0.45, CAB.z], { cab: { min: 239, door: 0 } }), // 4 the clock on the shelf
    V('bedNight', [0.4, 1.5, 3.6], [-1.6, 1.0, -1.4], 50, 1.0, [-2.2, 0.8, -1.4], { cab: { min: 240 } }), // 5 bedroom wide
    V('bedDawn', [0.6, 1.5, 3.4], [-1.0, 1.2, -1.6], 50, 1.0, [-2.2, 0.8, -1.4], { cab: { min: 240 } }), // 6 bedroom dawn
    V('bedNight', [CAB.x, CAB.y + 0.6, CAB.z + 0.75], [CAB.x, CAB.y + 0.6, CAB.z], 40, 2.4, [CAB.x, CAB.y + 0.6, CAB.z + 0.1], { cab: { min: 240 } }), // 7 dial close-up
    V('shop', [0.6, 1.6, 2.6], [0.1, 1.4, -2.6], 48, 1.4, [0.2, 1.4, -2.6], { shopCab: { door: 0.7, min: 600 }, labels: 2 }), // 8 shop bench
    V('shopNight', [-1.0, 1.7, 3.6], [0.2, 1.3, -2.6], 50, 1.2, [0.2, 1.3, -2.6], { shopCab: { door: 0, min: 600 } }), // 9 shop night
    V('works', [0.6, 3.6, 10.5], [0.4, 3.6, 0], 50, 1.2, [0, 3, 0], { works: { hour: 3.6 } }), // 10 cutaway wide
    V('works', [0.4, 4.6, 5.0], [0.2, 4.6, 0], 44, 1.4, [0, 4.8, 0], { works: { hour: 4, trip: 1, strike: 1 } }), // 11 cutaway: pin trips
    V('paris', [0.6, 1.5, 2.4], [-0.2, 1.4, -2.0], 50, 1.2, [0.1, 1.1, -0.9], { bedside: { alarm: 6, min: 300 } }), // 12 Paris wide
    V('paris', [0.18, 1.12, -0.42], [0.1, 1.08, -0.85], 36, 3.0, [0.1, 1.08, -0.82], { bedside: { alarm: 7, min: 300 } }), // 13 bedside close
    V('paris', [1.6, 1.8, 0.6], [0.95, 2.3, -3.1], 44, 1.4, [0.95, 2.3, -3.1]), // 14 patent on the wall
  ];
  API.setWindow(0, 0); API.setBedCab({ min: 240, door: 0, strike: 0 }); API.setShopCab({ min: 600, door: 0 }); API.setWorks({ hour: 3, trip: 0, strike: 0 }); API.setBedside({ alarm: 6, min: 300 }); API.setLabels(0); API.tick(0);
  return API;
}
