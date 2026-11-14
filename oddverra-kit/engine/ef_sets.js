// ef_sets.js [EF-sets]: sets for "The Eiffel Tower was only meant to stand for 20 years" (Oddverra short). A generic stylized iron
// tower, generic exposition pavilions, a generic domed hall in the distance and generic Paris blocks. No logos, no real signage.
//   fair   : Champ de Mars at real scale (metres): the 300 m tower (four curved lattice legs, first-level arches, three platforms,
//            summit gallery + lantern; 'today' adds a striped antenna mast), promenade, fountain, lamp posts, flags, trees, pavilion
//            rows, a wooden army radio hut by the front-right leg, a river + far hall, Paris blocks and a domed hall to the right.
//            Summit props (weather instruments, a test cable with sliding shapes, antenna wires) sit on the third platform.
//            Moods 'fair89' (noon), 'fairDusk' (golden), 'fairNight' (blue night, lamps + beacon), 'topDay' / 'topNight' (summit),
//            'fairToday' (modern: bronze paint, antennas, helicopter), 'fairDawn' (payoff sunrise).            origin (-76000,0,0)
//   office : Paris city office: desk with the permit, tall window with the tower outside, cabinets, clock, calendar, lamp.
//            Moods 'office89' (day, "1889-1909"), 'office10' (warm, "RENEWED 1910").                       origin (-78500,0,0)
//   studio : 1887 artists' studio: easels, the protest letter on a table, piano, bust, big window. Moods 'studio87' (lamp-lit),
//            'chimney' (easel painting close-up: the tower painted as a black factory chimney).            origin (-78500,0,800)
//   radio  : 1914 army radio room: receiver bench, morse key, paper tape, wall map with a river line. Mood 'radio14'. origin (-78500,0,1600)
// Each set: local frame, floor y = 0, camera side +z. Test flag ?efview=N (main.js).
import { H, TAU, clamp01, sm, SERIF, SANS, cyl, sph, plane, planeUV, mesh, nond, lumpGeo, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit, instance } from './world.js';

export const EF_ORIGIN = { fair: [-76000, 0, 0], office: [-78500, 0, 0], studio: [-78500, 0, 800], radio: [-78500, 0, 1600] };
const GROUP_OF = { fair89: 'fair', fairDusk: 'fair', fairNight: 'fair', topDay: 'fair', topNight: 'fair', fairToday: 'fair', fairDawn: 'fair', office89: 'office', office10: 'office', studio87: 'studio', chimney: 'studio', radio14: 'radio' };
export const TZ = -90, TOP = 277.5; // tower centre z (fair-local) and the summit floor height
let THREE, PT, M;

// ---------------------------------------------------------------- tower profile (metres)
export const TW = (y) => 3.5 + 59 * Math.exp(-y / 75);                     // half outer width
const LEGW = (y) => TW(y) * (0.2 + 0.3 * Math.min(1, y / 180));             // half width of one leg
const LEVELS = [0, 8, 16, 24, 33, 42, 50, 57.6, 67, 77, 87, 97, 106, 115.7, 130, 145, 160, 180, 196, 212, 228, 244, 260, 276];

// ---------------------------------------------------------------- painters
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 6, 2, 3, 7)); g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08);
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : 0.32 + i * 0.38), w * 0.86, h * (lines.length === 1 ? 0.5 : 0.3), { col: i && o.col2 ? o.col2 : o.col || '#3a2414', font: o.font || SANS })); }; }
function lawnTex(g, w, h) { g.fillStyle = '#5a8a3a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.82 + 0.26 * PT.fbm(u, v, 6, 6, 4, 3)); grain(g, w, h, 'rgba(150,200,90,1)', 1600, 7, 0.35); }
function gravelTex(g, w, h) { g.fillStyle = '#d8c8a0'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.18 * PT.fbm(u, v, 5, 5, 3, 9)); grain(g, w, h, 'rgba(120,100,70,1)', 2000, 4, 0.35); }
function waterTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#4a7ab0'); gr.addColorStop(1, '#2a4a7a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(220,235,255,0.35)'; g.lineWidth = 3; const R = PT.rng(4); for (let i = 0; i < 60; i++) { const x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 20 + R() * 30, y); g.stroke(); } }
function facadeTex(o) { return (g, w, h) => { g.fillStyle = o.wall; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 3, 3, 3, 5)); const nx = 6, ny = 5;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const x = (i + 0.25) * w / nx, y = (j + 0.25) * h / ny; g.fillStyle = o.lit && ((i * 7 + j * 3) % 5 < 2) ? o.lit : o.win; g.fillRect(x, y, w / nx * 0.5, h / ny * 0.55); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x - 2, y + h / ny * 0.55, w / nx * 0.5 + 4, 3); }
  g.fillStyle = 'rgba(0,0,0,0.18)'; for (let j = 1; j < ny; j++) g.fillRect(0, j * h / ny - 2, w, 3); }; }
function friezeTex(g, w, h) { g.fillStyle = '#8a3a2a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { const x = (i + 0.5) * w / 16; g.fillStyle = '#5a2018'; g.beginPath(); g.moveTo(x - w / 40, h * 0.9); g.lineTo(x - w / 40, h * 0.45); g.arc(x, h * 0.45, w / 40, Math.PI, 0); g.lineTo(x + w / 40, h * 0.9); g.fill(); }
  g.fillStyle = '#e0b060'; g.fillRect(0, 0, w, h * 0.1); g.fillRect(0, h * 0.9, w, h * 0.1); }
function ringTex(g, w, h) { g.clearRect(0, 0, w, h); const gr = g.createRadialGradient(w / 2, h / 2, w * 0.36, w / 2, h / 2, w * 0.5); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.45, 'rgba(255,255,255,1)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
function flagTex(g, w, h) { ['#2a4aa8', '#f4f0e8', '#d8302a'].forEach((c, i) => { g.fillStyle = c; g.fillRect(i * w / 3, 0, w / 3 + 1, h); }); PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * Math.sin(u * 9)); }
function pennantTex(cols) { return (g, w, h) => { cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * h / cols.length, w, h / cols.length + 1); }); }; }
function wallpaperTex(base, stripe) { return (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); for (let i = 0; i < 12; i++) { g.fillStyle = stripe; g.fillRect(i * w / 12, 0, w / 30, h); } g.fillStyle = 'rgba(255,240,200,0.18)'; for (let j = 0; j < 8; j++) for (let i = 0; i < 6; i++) { g.beginPath(); g.arc((i + 0.5 + (j % 2) * 0.5) * w / 6, (j + 0.5) * h / 8, w / 40, 0, TAU); g.fill(); } PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, 5)); }; }
// window view: Paris roofs + the tower (o.tower 0..1 = how much is built), o.night
function viewTex(o) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.night ? '#0a1238' : '#6a9ae0'); gr.addColorStop(1, o.night ? '#2a3a7a' : '#e8e0d0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  if (o.tower) { const cx = w * 0.62, base = h * 0.78, top = base - h * 0.7 * o.tower; g.fillStyle = o.night ? '#3a2a40' : '#8a4a3a'; g.beginPath(); g.moveTo(cx - w * 0.16, base); g.quadraticCurveTo(cx - w * 0.04, base - h * 0.25, cx - w * 0.012, top); g.lineTo(cx + w * 0.012, top); g.quadraticCurveTo(cx + w * 0.04, base - h * 0.25, cx + w * 0.16, base); g.lineTo(cx + w * 0.1, base); g.quadraticCurveTo(cx, base - h * 0.14, cx - w * 0.1, base); g.fill();
    g.fillStyle = o.night ? '#2a1a30' : '#6a3428'; for (const [y, k] of [[0.62, 0.11], [0.45, 0.06]]) { const yy = base - (base - top) * (1 - y) * 0 - h * 0.7 * (1 - y) * o.tower; if (yy > top) g.fillRect(cx - w * k, yy, 2 * w * k, h * 0.012); } }
  for (let i = 0; i < 14; i++) { const x = i * w / 13 - 10, bh = h * (0.14 + 0.1 * ((i * 37) % 7) / 7); g.fillStyle = o.night ? '#141a3a' : '#a8a0a8'; g.fillRect(x, h - bh, w / 12, bh); g.fillStyle = o.night ? '#1a1a30' : '#6a6a80'; g.fillRect(x - 2, h - bh - h * 0.03, w / 12 + 4, h * 0.03);
    if (o.night) { g.fillStyle = '#ffd890'; for (let k = 0; k < 3; k++) g.fillRect(x + 6 + k * 12, h - bh + 10 + (k % 2) * 14, 5, 7); } }
  if (o.night) { g.fillStyle = '#f4f0d8'; g.beginPath(); g.arc(w * 0.2, h * 0.2, h * 0.06, 0, TAU); g.fill(); } }; }
function docTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = '#f4ecd6'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, 2)); g.strokeStyle = '#8a6a3a'; g.lineWidth = w * 0.012; g.strokeRect(w * 0.05, w * 0.05, w * 0.9, h - w * 0.1);
  lines.forEach(([s, y, sz, col], i) => txt(g, s, w / 2, h * y, w * 0.8, h * sz, { col: col || '#3a2414', font: SERIF }));
  g.strokeStyle = 'rgba(58,36,20,0.45)'; g.lineWidth = 3; for (let i = 0; i < (o.lines ?? 6); i++) { const y = h * (o.ly ?? 0.5) + i * h * 0.045; g.beginPath(); g.moveTo(w * 0.14, y); g.lineTo(w * (0.86 - (i % 3) * 0.06), y); g.stroke(); }
  if (o.sigs) { const R = PT.rng(7); g.strokeStyle = 'rgba(30,20,60,0.85)'; g.lineWidth = 3; for (let i = 0; i < o.sigs; i++) { const x = w * (0.12 + (i % 3) * 0.28), y = h * (0.72 + Math.floor(i / 3) * 0.06); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) g.quadraticCurveTo(x + k * 12 + 6, y - 14 * R(), x + k * 12 + 12, y + 4 * R()); g.stroke(); } }
  if (o.stamp) { g.save(); g.translate(w * 0.66, h * 0.8); g.rotate(-0.25); g.strokeStyle = o.stampCol || '#c8302a'; g.lineWidth = w * 0.02; g.strokeRect(-w * 0.26, -h * 0.06, w * 0.52, h * 0.12); txt(g, o.stamp, 0, 0, w * 0.46, h * 0.08, { col: o.stampCol || '#c8302a', font: SANS }); g.restore(); }
  if (o.seal) { g.fillStyle = '#c8302a'; g.beginPath(); g.arc(w * 0.78, h * 0.88, w * 0.07, 0, TAU); g.fill(); } }; }
function paintingTex(kind) { return (g, w, h) => { const R = PT.rng(kind.length * 7);
  if (kind === 'chimney') { // the tower as a black factory chimney over Paris roofs, oil-sketch strokes
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8a8a98'); gr.addColorStop(1, '#d8c0a0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 18; i++) { g.fillStyle = `rgba(${60 + R() * 40},${60 + R() * 30},${70 + R() * 30},0.5)`; g.beginPath(); g.ellipse(w * (0.45 + R() * 0.5), h * (0.05 + R() * 0.35), w * (0.1 + R() * 0.15), h * 0.05, R(), 0, TAU); g.fill(); }
    g.fillStyle = '#1a1418'; g.beginPath(); g.moveTo(w * 0.42, h * 0.86); g.lineTo(w * 0.47, h * 0.16); g.lineTo(w * 0.55, h * 0.16); g.lineTo(w * 0.6, h * 0.86); g.fill(); g.fillRect(w * 0.45, h * 0.14, w * 0.12, h * 0.04);
    g.fillStyle = 'rgba(200,60,40,0.6)'; for (let k = 0; k < 4; k++) g.fillRect(w * 0.46, h * (0.3 + k * 0.14), w * 0.11, h * 0.012);
    for (let i = 0; i < 10; i++) { const x = i * w / 9 - 10, bh = h * (0.1 + 0.08 * R()); g.fillStyle = ['#7a6a6a', '#8a7a70', '#6a5a60'][i % 3]; g.fillRect(x, h - bh, w / 9 + 2, bh); g.fillStyle = '#4a3a48'; g.fillRect(x - 3, h - bh - 8, w / 9 + 8, 10); }
    for (let i = 0; i < 400; i++) { g.strokeStyle = `rgba(${R() * 255 | 0},${R() * 200 | 0},${R() * 180 | 0},0.08)`; g.lineWidth = 3; const x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 10 * R(), y + 4 * R()); g.stroke(); }
  } else if (kind === 'river') { g.fillStyle = '#a8c8e8'; g.fillRect(0, 0, w, h * 0.5); g.fillStyle = '#5a8a4a'; g.fillRect(0, h * 0.5, w, h * 0.2); g.fillStyle = '#4a7ab0'; g.fillRect(0, h * 0.7, w, h * 0.3); g.fillStyle = '#f4e8b0'; g.beginPath(); g.arc(w * 0.7, h * 0.22, h * 0.08, 0, TAU); g.fill(); for (let i = 0; i < 6; i++) { g.fillStyle = '#2a5a3a'; g.beginPath(); g.arc(w * (0.1 + i * 0.16), h * 0.5, h * 0.08, Math.PI, 0); g.fill(); }
  } else if (kind === 'flowers') { g.fillStyle = '#3a2a3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8a070'; g.fillRect(w * 0.35, h * 0.55, w * 0.3, h * 0.35); for (let i = 0; i < 14; i++) { g.fillStyle = ['#e85a5a', '#f0c040', '#f4f0e8', '#c870c8'][i % 4]; g.beginPath(); g.arc(w * (0.3 + R() * 0.4), h * (0.2 + R() * 0.32), w * 0.06, 0, TAU); g.fill(); }
  } else if (kind === 'plan') { g.fillStyle = '#2a4a8a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8f0ff'; g.lineWidth = 3; g.beginPath(); g.moveTo(w * 0.2, h * 0.9); g.quadraticCurveTo(w * 0.42, h * 0.5, w * 0.49, h * 0.1); g.lineTo(w * 0.51, h * 0.1); g.quadraticCurveTo(w * 0.58, h * 0.5, w * 0.8, h * 0.9); g.stroke(); for (const y of [0.68, 0.45, 0.2]) { g.beginPath(); g.moveTo(w * (0.5 - (0.9 - y) * 0.33), h * y); g.lineTo(w * (0.5 + (0.9 - y) * 0.33), h * y); g.stroke(); }
    g.beginPath(); g.arc(w * 0.5, h * 0.9, w * 0.2, Math.PI, 0); g.stroke(); txt(g, '300 m', w * 0.82, h * 0.2, w * 0.3, h * 0.06, { col: '#e8f0ff', font: SANS }); g.setLineDash([6, 6]); g.beginPath(); g.moveTo(w * 0.7, h * 0.1); g.lineTo(w * 0.7, h * 0.9); g.stroke(); g.setLineDash([]); }
  PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 8, 8, 3, 4)); }; }
function mapTex(g, w, h) { g.fillStyle = '#e8dcb8'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * PT.fbm(u, v, 4, 4, 3, 6)); g.strokeStyle = 'rgba(90,70,40,0.25)'; g.lineWidth = 2; for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(i * w / 8, 0); g.lineTo(i * w / 8, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 8); g.lineTo(w, i * h / 8); g.stroke(); }
  g.strokeStyle = '#3a6ab0'; g.lineWidth = 7; g.beginPath(); g.moveTo(w * 0.05, h * 0.62); g.bezierCurveTo(w * 0.3, h * 0.5, w * 0.5, h * 0.7, w * 0.95, h * 0.55); g.stroke(); txt(g, 'MARNE', w * 0.6, h * 0.72, w * 0.3, h * 0.07, { col: '#2a4a8a', font: SERIF });
  g.fillStyle = '#2a2a2a'; g.beginPath(); g.arc(w * 0.3, h * 0.82, 9, 0, TAU); g.fill(); txt(g, 'PARIS', w * 0.3, h * 0.9, w * 0.2, h * 0.05, { col: '#2a2a2a', font: SERIF });
  g.strokeStyle = '#c8302a'; g.lineWidth = 5; for (let i = 0; i < 4; i++) { const x = w * (0.35 + i * 0.13), y = h * 0.3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30, y + 40); g.lineTo(x + 18, y + 40); g.moveTo(x + 30, y + 40); g.lineTo(x + 30, y + 26); g.stroke(); }
  g.fillStyle = '#2a4aa8'; for (let i = 0; i < 5; i++) g.fillRect(w * (0.2 + i * 0.14), h * 0.44, 22, 14); }
function clockTex(g, w, h) { g.fillStyle = '#f4ecd8'; g.beginPath(); g.arc(w / 2, h / 2, w * 0.48, 0, TAU); g.fill(); g.strokeStyle = '#3a2414'; g.lineWidth = w * 0.03; g.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.fillStyle = '#3a2414'; g.fillRect(w / 2 + Math.cos(a) * w * 0.38 - 3, h / 2 + Math.sin(a) * h * 0.38 - 3, 6, 6); } }
function calTex(year) { return (g, w, h) => { g.fillStyle = '#f2ece0'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8402a'; g.fillRect(0, 0, w, h * 0.3); txt(g, year, w / 2, h * 0.16, w * 0.8, h * 0.2, { col: '#fff', font: SANS }); g.strokeStyle = 'rgba(40,30,30,0.6)'; g.lineWidth = 2; for (let i = 0; i <= 7; i++) { g.beginPath(); g.moveTo(i * w / 7, h * 0.36); g.lineTo(i * w / 7, h * 0.95); g.stroke(); } for (let j = 0; j <= 5; j++) { g.beginPath(); g.moveTo(0, h * (0.36 + j * 0.118)); g.lineTo(w, h * (0.36 + j * 0.118)); g.stroke(); } }; }
function cityTex(g, w, h) { g.fillStyle = '#8a8a7a'; g.fillRect(0, 0, w, h); const R = PT.rng(11); for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const x = i * w / 16, y = j * h / 16; g.fillStyle = ['#c8b8a0', '#b8a890', '#d0c4b0', '#a89888'][(i * 3 + j * 5) % 4]; g.fillRect(x + 4, y + 4, w / 16 - 8, h / 16 - 8); g.fillStyle = 'rgba(70,70,90,0.55)'; g.fillRect(x + 4, y + 4, w / 16 - 8, (h / 16 - 8) * 0.4);
  if (R() < 0.12) { g.fillStyle = '#4a7a3a'; g.fillRect(x + 4, y + 4, w / 16 - 8, h / 16 - 8); } } PT.modulate(g, w, h, (u, v) => 0.85 + 0.2 * PT.fbm(u, v, 4, 4, 3, 2)); }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.iron = vc(); m.ironDark = vc();
  m.lawn = vc({ map: T(512, 512, lawnTex) }); m.gravel = vc({ map: T(512, 512, gravelTex) }); m.water = toon({ map: T(256, 256, waterTex), emissive: 0x0a1428 });
  m.city = toon({ map: T(1024, 1024, cityTex) });
  m.facade = [['#e8dcc0', '#3a4a6a'], ['#d8c8a8', '#2a3a5a'], ['#f0e4cc', '#4a4a6a']].map(([wall, win]) => vc({ map: T(256, 256, facadeTex({ wall, win })) }));
  m.facadeN = vc({ map: T(256, 256, facadeTex({ wall: '#8a8090', win: '#2a2a40', lit: '#ffd890' })), emissive: 0x201810 }); m.facadeN.emissiveMap = m.facadeN.map;
  m.frieze = vc({ map: T(512, 64, friezeTex) });
  m.ring = new THREE.MeshBasicMaterial({ map: T(256, 256, ringTex), color: 0x7ae0ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
  m.flag = toon({ map: T(96, 64, flagTex), side: THREE.DoubleSide }); m.pennants = [['#f0c040', '#d8302a'], ['#3a6ad8', '#f4f0e8'], ['#3a9a5a', '#f0c040']].map((c) => toon({ map: T(32, 64, pennantTex(c)), side: THREE.DoubleSide }));
  m.sky = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  m.lampGlobe = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0c8).multiplyScalar(1.4), fog: true });
  m.bulb = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd890).multiplyScalar(1.8), fog: false });
  m.demo = em(T(320, 200, signTex(['DEMOLITION', '1909'], { bg: '#f4e8c8', col: '#c8302a', col2: '#2a1a14' })), 0x201410);
  m.tower87 = em(T(256, 256, signTex(['FUTURE', 'TOWER', '300 m'], { bg: '#e8d8b0' })), 0x201410);
  m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a6040', n: 8, seed: 21 })) }); m.darkwood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#4a2e1e', n: 6, seed: 33 })) });
  m.wallO = vc({ map: T(256, 256, wallpaperTex('#3a5a4a', 'rgba(20,40,30,0.4)')) }); m.wallS = vc({ map: T(256, 256, wallpaperTex('#c8a878', 'rgba(120,80,40,0.25)')) }); m.wallR = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#6a6a5a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.82 + 0.22 * PT.fbm(u, v, 4, 4, 3, 5)); }) });
  m.view = new THREE.MeshBasicMaterial({ map: T(512, 640, viewTex({ tower: 1 })), fog: false }); m.viewN = new THREE.MeshBasicMaterial({ map: T(512, 640, viewTex({ tower: 1, night: 1 })), fog: false }); m.view87 = new THREE.MeshBasicMaterial({ map: T(512, 640, viewTex({ tower: 0 })), fog: false });
  m.docPermit = em(T(512, 680, docTex([['PERMIT', 0.12, 0.08], ['TOWER ON THE', 0.22, 0.05], ['CHAMP DE MARS', 0.28, 0.05], ['1889 - 1909', 0.38, 0.08, '#c8302a']], { ly: 0.48, lines: 5, seal: 1 })), 0x201810);
  m.docRenew = em(T(512, 680, docTex([['PERMIT', 0.12, 0.08], ['TOWER ON THE', 0.22, 0.05], ['CHAMP DE MARS', 0.28, 0.05], ['1889 - 1909', 0.38, 0.08, '#c8302a']], { ly: 0.48, lines: 5, seal: 1, stamp: 'RENEWED 1910', stampCol: '#2a8a3a' })), 0x201810);
  m.docProtest = em(T(512, 680, docTex([['PROTEST', 0.1, 0.09], ['AGAINST THE TOWER', 0.2, 0.05], ['"USELESS"', 0.3, 0.06, '#c8302a'], ['"MONSTROUS"', 0.38, 0.06, '#c8302a']], { ly: 0.46, lines: 5, sigs: 9 })), 0x201810);
  m.paint = C.paint; m.paintings = ['chimney', 'river', 'flowers', 'plan'].map((k) => em(T(384, 512, paintingTex(k)), 0x181010));
  m.canvasBack = vc(); m.map = em(T(512, 384, mapTex), 0x181410); m.clock = em(T(128, 128, clockTex), 0x201810); m.cal89 = em(T(160, 200, calTex('1889')), 0x202020); m.cal10 = em(T(160, 200, calTex('1910')), 0x202020);
  m.tape = toon({ color: 0xf4ecd8, side: THREE.DoubleSide }); m.dial = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe8a0).multiplyScalar(1.1), fog: false });
  m.leaf = vc(); m.leaf.userData.tint = true; m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.cloth = vc(); m.crowd = vc(); m.crowd.userData.tint = true;
  m.glassC = toon({ color: 0xcfe8f0, transparent: true, opacity: 0.3, depthWrite: false, emissive: 0x18303a });
  m.heli = vc({ emissive: 0x0c0c10 }); m.rotor = new THREE.MeshBasicMaterial({ color: 0x8a8a9a, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
  m.mast = vc({ emissive: 0x141010 });
  return m; }

// ---------------------------------------------------------------- the tower (fair-local, centre (0, 0, TZ))
function buildTower(K, root) {
  const ZC = TZ, CB = 1.15, BR = 0.42;
  const corner = (y, sx, sz, a, b) => { if (y >= 180) return [a * TW(y), y, ZC + b * TW(y)]; const l = LEGW(y), c = TW(y) - l; return [sx * c + a * l, y, ZC + sz * c + b * l]; };
  const legLv = LEVELS.filter((y) => y <= 180), shLv = LEVELS.filter((y) => y >= 180);
  // four legs: corner columns, X braces on each face, ties at each level
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    for (let i = 0; i + 1 < legLv.length; i++) { const y0 = legLv[i], y1 = legLv[i + 1];
      for (const a of [-1, 1]) for (const b of [-1, 1]) K.beam(M.iron, corner(y0, sx, sz, a, b), corner(y1, sx, sz, a, b), CB, 0xffffff);
      for (const b of [-1, 1]) { K.beam(M.iron, corner(y0, sx, sz, -1, b), corner(y1, sx, sz, 1, b), BR, 0xe8e0e0); K.beam(M.iron, corner(y0, sx, sz, 1, b), corner(y1, sx, sz, -1, b), BR, 0xe8e0e0); K.beam(M.iron, corner(y1, sx, sz, -1, b), corner(y1, sx, sz, 1, b), BR * 1.2, 0xd8d0d0); }
      for (const a of [-1, 1]) { K.beam(M.iron, corner(y0, sx, sz, a, -1), corner(y1, sx, sz, a, 1), BR, 0xe8e0e0); K.beam(M.iron, corner(y0, sx, sz, a, 1), corner(y1, sx, sz, a, -1), BR, 0xe8e0e0); K.beam(M.iron, corner(y1, sx, sz, a, -1), corner(y1, sx, sz, a, 1), BR * 1.2, 0xd8d0d0); } }
    // stone footing
    const l0 = LEGW(0), c0 = TW(0) - l0; K.box(M.paint, sx * c0 - l0 - 2, sx * c0 + l0 + 2, 0, 2.2, ZC + sz * c0 - l0 - 2, ZC + sz * c0 + l0 + 2, 0xb8ac98, 0.3);
  }
  // single shaft above 180 m
  for (let i = 0; i + 1 < shLv.length; i++) { const y0 = shLv[i], y1 = shLv[i + 1], C = (y, a, b) => corner(y, 0, 0, a, b);
    for (const a of [-1, 1]) for (const b of [-1, 1]) K.beam(M.iron, C(y0, a, b), C(y1, a, b), CB * 0.9, 0xffffff);
    for (const b of [-1, 1]) { K.beam(M.iron, C(y0, -1, b), C(y1, 1, b), BR, 0xe8e0e0); K.beam(M.iron, C(y0, 1, b), C(y1, -1, b), BR, 0xe8e0e0); }
    for (const a of [-1, 1]) { K.beam(M.iron, C(y0, a, -1), C(y1, a, 1), BR, 0xe8e0e0); K.beam(M.iron, C(y0, a, 1), C(y1, a, -1), BR, 0xe8e0e0); }
    for (const [a, b, c2, d] of [[-1, -1, 1, -1], [-1, 1, 1, 1], [-1, -1, -1, 1], [1, -1, 1, 1]]) K.beam(M.iron, C(y1, a, b), C(y1, c2, d), BR * 1.2, 0xd8d0d0); }
  // where the legs meet the shaft: tie the inner leg corners together
  // first-level arches on all four faces (in the sloping outer face plane)
  for (const [ax, sgn] of [['x', 1], ['x', -1], ['z', 1], ['z', -1]]) { const N = 22, yb = 8, Hh = 45;
    for (const dr of [0, 2.6]) { let prev = null; for (let i = 0; i <= N; i++) { const th = i / N * Math.PI, y = yb + (Hh - dr) * Math.sin(th), R = TW(18) - LEGW(18) * 1.8 - dr, u = R * Math.cos(th), f = TW(y) - 0.4, p = ax === 'z' ? [u, y, ZC + sgn * f] : [sgn * f, y, ZC + u];
      if (prev) K.beam(M.iron, prev, p, dr ? 0.6 : 0.95, 0xffffff); prev = p; } }
    for (let i = 1; i < 22; i += 2) { const th = i / 22 * Math.PI, R = TW(18) - LEGW(18) * 1.8, y0 = yb + Hh * Math.sin(th), y1 = yb + (Hh - 2.6) * Math.sin(th), f0 = TW(y0) - 0.4, f1 = TW(y1) - 0.4, u0 = R * Math.cos(th), u1 = (R - 2.6) * Math.cos(th);
      K.beam(M.iron, ax === 'z' ? [u0, y0, ZC + sgn * f0] : [sgn * f0, y0, ZC + u0], ax === 'z' ? [u1, y1, ZC + sgn * f1] : [sgn * f1, y1, ZC + u1], 0.35, 0xe8e0e0); } }
  // platforms: first (frieze + kiosks), second, third (gallery), each a hollow square slab with a railing
  const slab = (y, half, hole, th, col) => { K.box(M.ironDark, -half, half, y, y + th, ZC + hole, ZC + half, col, 0.2); K.box(M.ironDark, -half, half, y, y + th, ZC - half, ZC - hole, col, 0.2); K.box(M.ironDark, -half, -hole, y, y + th, ZC - hole, ZC + hole, col, 0.2); K.box(M.ironDark, hole, half, y, y + th, ZC - hole, ZC + hole, col, 0.2);
    const rh = 1.1; for (const s of [-1, 1]) { K.box(M.iron, -half, half, y + th + rh - 0.08, y + th + rh, ZC + s * half - 0.08, ZC + s * half + 0.08, 0xffffff, 0.02); K.box(M.iron, s * half - 0.08, s * half + 0.08, y + th + rh - 0.08, y + th + rh, ZC - half, ZC + half, 0xffffff, 0.02);
      const n = Math.round(half * 2 / 1.2); for (let i = 0; i <= n; i++) { const u = -half + i * 2 * half / n; K.box(M.iron, u - 0.03, u + 0.03, y + th, y + th + rh, ZC + s * half - 0.03, ZC + s * half + 0.03, 0xffffff, 0.01); K.box(M.iron, s * half - 0.03, s * half + 0.03, y + th, y + th + rh, ZC + u - 0.03, ZC + u + 0.03, 0xffffff, 0.01); } } };
  const h1 = TW(57.6) + 2.5; slab(57.6, h1, TW(57.6) - LEGW(57.6) * 2.2, 2.6, 0xc8b0a8);
  for (const s of [-1, 1]) { K.box(M.frieze, -h1, h1, 53.6, 57.6, ZC + s * h1 - 0.3, ZC + s * h1 + 0.3, 0xffffff, 0.05); K.box(M.frieze, s * h1 - 0.3, s * h1 + 0.3, 53.6, 57.6, ZC - h1, ZC + h1, 0xffffff, 0.05); }
  for (const [x, z, ry] of [[0, h1 - 6, 0], [0, -h1 + 6, 0], [h1 - 6, 0, 1], [-h1 + 6, 0, 1]]) { const w = ry ? 6 : 16, d = ry ? 16 : 6; K.box(M.facade[0], x - w / 2, x + w / 2, 60.2, 66, ZC + z - d / 2, ZC + z + d / 2, 0xffffff, 0.2); K.box(M.paint, x - w / 2 - 0.6, x + w / 2 + 0.6, 66, 67, ZC + z - d / 2 - 0.6, ZC + z + d / 2 + 0.6, 0x4a5a6a, 0.2); K.put(M.paint, sph(2.2, 12, 8), x, 67.5, ZC + z, 0, 0, 0, 1, 0.7, 1, 0x5a7a8a); }
  slab(115.7, TW(115.7) + 2, TW(115.7) - LEGW(115.7) * 2.3, 1.8, 0xc8b0a8);
  const h3 = 8.5; K.box(M.ironDark, -h3, h3, 274.5, 276, ZC - h3, ZC + h3, 0xc8b0a8, 0.15); slab(274.5, h3, h3 - 0.5, 1.5, 0xc8b0a8);
  // summit gallery (glazed cabin) + campanile ribs + lantern
  K.box(M.ironDark, -5.6, 5.6, 276, 276.9, ZC - 5.6, ZC + 5.6, 0xd8c0b0, 0.05); K.box(M.glassC, -5.5, 5.5, 276.9, 279.4, ZC - 5.5, ZC + 5.5, 0xffffff, 0.02); K.box(M.paint, -5.2, 5.2, 276.9, 279.3, ZC - 5.2, ZC + 5.2, 0xe8d8b8, 0.02); for (let i = 0; i <= 8; i++) { const u = -5.6 + i * 1.4; for (const sg of [-1, 1]) { K.box(M.iron, u - 0.08, u + 0.08, 276.9, 279.4, ZC + sg * 5.6 - 0.08, ZC + sg * 5.6 + 0.08, 0xffffff, 0.01); K.box(M.iron, sg * 5.6 - 0.08, sg * 5.6 + 0.08, 276.9, 279.4, ZC + u - 0.08, ZC + u + 0.08, 0xffffff, 0.01); } } K.box(M.ironDark, -6.2, 6.2, 279.4, 280.0, ZC - 6.2, ZC + 6.2, 0xb8a098, 0.1);
  for (const a of [-1, 1]) for (const b of [-1, 1]) { let prev = [a * 5.8, 280, ZC + b * 5.8]; for (let i = 1; i <= 8; i++) { const t = i / 8, p = [a * 5.8 * (1 - t) * (1 - t * 0.2), 280 + 11 * Math.sin(t * Math.PI / 2), ZC + b * 5.8 * (1 - t) * (1 - t * 0.2)]; K.beam(M.iron, prev, p, 0.45, 0xffffff); prev = p; } }
  K.put(M.ironDark, cyl(1.4, 1.8, 2.6, 16), 0, 292.2, ZC, 0, 0, 0, 1, 1, 1, 0xb8a098); K.put(M.ironDark, sph(1.6, 16, 10), 0, 294, ZC, 0, 0, 0, 1, 0.7, 1, 0x8a6a5a);
  K.beam(M.iron, [0, 295, ZC], [0, 300.5, ZC], 0.25, 0x3a3a44, true, 8);
  return { };
}

// ---------------------------------------------------------------- FAIR (Champ de Mars, real scale)
function buildFair(root, API) { const R = PT.rng(1889), K = new Kit();
  mesh(root, planeUV(3000, 3000, 60, 60), M.lawn, 0, -0.02, 0, -Math.PI / 2, 0, 0, false);
  mesh(root, planeUV(5000, 5000, 5, 5), M.city, 0, -0.06, 0, -Math.PI / 2, 0, 0, false).position.y = -0.1;
  // promenade + cross path under the tower
  mesh(root, planeUV(26, 900, 2, 60), M.gravel, 0, 0.01, 330, -Math.PI / 2, 0, 0, false); mesh(root, planeUV(170, 170, 10, 10), M.gravel, 0, 0.012, TZ, -Math.PI / 2, 0, 0, false);
  for (const s of [-1, 1]) mesh(root, planeUV(10, 700, 1, 50), M.gravel, s * 48, 0.011, 420, -Math.PI / 2, 0, 0, false);
  // river + quay + far hall with two towers (generic) across it
  mesh(root, planeUV(3000, 120, 30, 2), M.water, 0, -0.5, -330, -Math.PI / 2, 0, 0, false);
  for (const s of [-1, 1]) K.box(M.paint, -1500, 1500, -1.5, 0.6, -330 + s * 60 - 2, -330 + s * 60 + 2, 0xb8ac98, 0.1);
  K.box(M.paint, -16, 16, 0, 1.2, -392, -268, 0xc8bca8, 0.2); for (let i = 0; i < 5; i++) K.box(M.paint, -14, 14, -4, 0.6, -385 + i * 26, -377 + i * 26, 0xb8ac98, 0.3);
  K.at(0, 0, -520, 0, () => { K.box(M.facade[1], -140, 140, 0, 24, -20, 20, 0xffffff, 0.5); K.put(M.paint, sph(26, 20, 12, 0, TAU, 0, Math.PI / 2), 0, 24, 0, 0, 0, 0, 1, 0.9, 1, 0x8a8aa0); for (const s of [-1, 1]) { K.box(M.facade[2], s * 60 - 7, s * 60 + 7, 0, 44, -7, 7, 0xffffff, 0.3); K.put(M.paint, cyl(5, 7, 4, 12), s * 60, 46, 0, 0, 0, 0, 1, 1, 1, 0xf0e4cc); K.put(M.paint, sph(5.5, 14, 10), s * 60, 49, 0, 0, 0, 0, 1, 1.2, 1, 0x6a7a9a); } for (const s of [-1, 1]) K.box(M.facade[0], s * 80, s * 260, 0, 18, -10 + s * 0, 10, 0xffffff, 0.4); });
  // pavilion rows down both sides of the promenade (coloured domes), trees, lamp posts, benches, flags
  const domeCols = [0x4a8ab0, 0xd8a040, 0x3a9a7a, 0xc85a4a];
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const z = 60 + i * 110, x = s * 120; K.box(M.facade[i % 3], x - 34, x + 34, 0, 16, z - 40, z + 40, 0xffffff, 0.4); K.box(M.paint, x - 36, x + 36, 16, 18, z - 42, z + 42, 0x6a5a5a, 0.3);
    K.put(M.paint, cyl(9, 10, 6, 20), x, 21, z, 0, 0, 0, 1, 1, 1, 0xf0e4cc); K.put(M.paint, sph(10, 20, 12), x, 24, z, 0, 0, 0, 1, 0.9, 1, domeCols[(i + (s > 0 ? 1 : 0)) % 4]); K.beam(M.paint, [x, 33, z], [x, 40, z], 0.25, 0x3a3a44, true, 6); }
  const trees = []; for (const s of [-1, 1]) for (let i = 0; i < 26; i++) { const z = 30 + i * 22 + R() * 4, x = s * (26 + R() * 3); trees.push([x, z]); trees.push([s * 70 + (R() - 0.5) * 4, z + 9]); }
  for (const [x, z] of [[-30, -10], [30, -10], [-62, 10], [62, 10], [-80, -60], [80, -60], [-90, -140], [90, -150], [-40, -190], [40, -200]]) trees.push([x, z]);
  for (const [x, z] of trees) { const h = 7 + R() * 3; K.beam(M.bark, [x, 0, z], [x, h * 0.55, z], 0.35, 0x6a4a3a, true, 6); for (let k = 0; k < 3; k++) K.put(M.leaf, lumpGeo(3 + k, 1, 0.25), x + (R() - 0.5) * 2, h * (0.62 + k * 0.14), z + (R() - 0.5) * 2, 0, R() * 6, 0, 3.2 - k * 0.6, 2.4 - k * 0.3, 3.2 - k * 0.6, [0x3a7a3a, 0x4a8a3a, 0x2f6a32][k]); }
  const lamps = []; for (const s of [-1, 1]) for (let i = 0; i < 28; i++) { const z = 16 + i * 18, x = s * 14.5; lamps.push([x, 4.6, z]); K.beam(M.paint, [x, 0, z], [x, 4.3, z], 0.12, 0x2a3a3a, true, 8); K.put(M.paint, cyl(0.28, 0.2, 0.4, 10), x, 0.2, z, 0, 0, 0, 1, 1, 1, 0x2a3a3a); K.put(M.paint, cyl(0.06, 0.24, 0.25, 8), x, 4.35, z, 0, 0, 0, 1, 1, 1, 0x2a3a3a); }
  const globes = lamps.map((p) => mesh(root, sph(0.32, 12, 8), M.lampGlobe, ...p, 0, 0, 0, false));
  for (const s of [-1, 1]) for (let i = 0; i < 9; i++) { const z = -4 + i * 36; K.box(M.wood, s * 12.3 - 0.3, s * 12.3 + 0.3, 0.42, 0.48, z - 1, z + 1, 0x8a5a38, 0.02); K.box(M.wood, s * 12.6 - 0.05, s * 12.6 + 0.05, 0.48, 0.95, z - 1, z + 1, 0x8a5a38, 0.02); for (const d of [-0.9, 0.9]) K.box(M.paint, s * 12.3 - 0.3, s * 12.3 + 0.3, 0, 0.42, z + d - 0.05, z + d + 0.05, 0x2a3a3a, 0.01); }
  // fountain on the promenade
  K.at(0, 0, 40, 0, () => { K.put(M.paint, cyl(9, 9.4, 0.9, 40), 0, 0.45, 0, 0, 0, 0, 1, 1, 1, 0xd8ccb8); K.put(M.paint, cyl(2.2, 2.8, 2.4, 20), 0, 1.6, 0, 0, 0, 0, 1, 1, 1, 0xd8ccb8); K.put(M.paint, cyl(4, 1.2, 0.6, 24), 0, 3.0, 0, 0, 0, 0, 1, 1, 1, 0xd8ccb8); K.put(M.paint, cyl(0.6, 1.0, 2.0, 12), 0, 4.2, 0, 0, 0, 0, 1, 1, 1, 0xd8ccb8); });
  const fwater = mesh(root, cyl(8.7, 8.7, 0.1, 40), M.water, 0, 0.8, 40, 0, 0, 0, false); const jet = mesh(root, cyl(0.25, 0.6, 5, 10, true), H.toon({ color: 0xcfe8ff, transparent: true, opacity: 0.6, emissive: 0x2a4a6a, depthWrite: false }), 0, 7.5, 40, 0, 0, 0, false);
  // army radio hut by the front-right leg (wooden, door, glowing window, wire up into the tower)
  K.at(30, 0, -22, -0.25, () => { K.box(M.wood, -2.6, 2.6, 0, 2.7, -2, 2, 0x9a7050, 0.04); K.put(M.darkwood, new THREE.BoxGeometry(6.0, 0.2, 5.0), 0, 2.9, 0, 0.12, 0, 0, 1, 1, 1, 0x5a3a2a); K.box(M.darkwood, -0.5, 0.5, 0, 2.0, 1.98, 2.06, 0x4a2e1e, 0.02); K.box(M.paint, 1.0, 2.0, 1.2, 2.0, 1.98, 2.06, 0xffd890, 0.01); K.box(M.wood, -2.4, -1.4, 0, 0.9, 2.1, 2.7, 0x8a6040, 0.02); });
  const hutGlow = glowAt(root, [31.2, 1.6, -19.7], 1.1, '#ffc070', 0.3);
  K.beam(M.paint, [30, 2.9, -22], [36, 90, -60], 0.05, 0x1a1a22, true, 4);
  // Paris blocks beyond the fair + a domed hall (Panthéon stand-in, generic) far right
  const pfB = (() => { const KB = new Kit(); KB.box(M.facade[0], -10, 10, 0, 20, -10, 10, 0xffffff, 0.2); KB.box(M.paint, -10.5, 10.5, 20, 25, -10.5, 10.5, 0x5a6070, 0.4); return KB.prefab(); })();
  const blocks = []; for (let i = 0; i < 160; i++) { const a = R() * TAU, r = 260 + R() * 900, x = Math.cos(a) * r, z = Math.sin(a) * r * 0.9 + 100; if (Math.abs(x) < 170 && z > -260 && z < 800) continue; if (z < -260 && z > -400) continue; if (Math.hypot(x - 220, z - 250) < 70) continue; blocks.push([x, 0, z, R() * 0.4, 0.9 + R() * 0.5, null, 0.8 + R() * 0.6]); }
  instance(root, pfB, blocks, false);
  const PX = 220, PZ = 250; K.at(PX, 0, PZ, -0.6, () => { K.box(M.facade[2], -30, 30, 0, 26, -40, 40, 0xffffff, 0.5); K.put(M.paint, cyl(16, 16, 22, 28), 0, 37, 0, 0, 0, 0, 1, 1, 1, 0xf0e8d8); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; K.put(M.paint, cyl(0.7, 0.7, 18, 8), Math.cos(a) * 16.6, 37, Math.sin(a) * 16.6, 0, 0, 0, 1, 1, 1, 0xfff8ec); }
    K.put(M.paint, sph(15, 24, 14), 0, 48, 0, 0, 0, 0, 1, 1.1, 1, 0x8a96a8); K.put(M.paint, cyl(2.4, 2.8, 6, 12), 0, 66, 0, 0, 0, 0, 1, 1, 1, 0xf0e8d8); K.put(M.paint, sph(2.6, 12, 8), 0, 70, 0, 0, 0, 0, 1, 1, 1, 0x8a96a8);
    K.box(M.paint, -16, 16, 0, 22, 40, 50, 0xf0e8d8, 0.3); for (let i = 0; i < 6; i++) K.put(M.paint, cyl(1, 1, 20, 10), -13 + i * 5.2, 10, 51, 0, 0, 0, 1, 1, 1, 0xfff8ec); K.put(M.paint, new THREE.ConeGeometry(18, 6, 3), 0, 25, 47, 0, 0, Math.PI / 2 * 0, 1, 1, 0.3, 0xf0e8d8); });
  const PANTH = [PX, 72, PZ];
  // hook prop: a demolition notice on a post by the front-left leg
  const demoSign = new THREE.Group(); root.add(demoSign); { const KD = new Kit(); KD.beam(M.wood, [-25.1, 0, -9.3], [-25.1, 2.0, -9.3], 0.08, 0x6a4a30); KD.beam(M.wood, [-23.1, 0, -9.3], [-23.1, 2.0, -9.3], 0.08, 0x6a4a30); KD.build(demoSign); mesh(demoSign, plane(2.3, 1.4), M.demo, -24.1, 1.75, -9.22, 0, 0.5, 0, true); }
  // the tower
  buildTower(K, root);
  // summit props (on the third platform at y = TOP, front side z = TZ + 6..8.3): anemometer, wind vane, instrument box, rain gauge, barometer
  const S0 = TOP; K.beam(M.paint, [-4.5, S0, TZ + 7.4], [-4.5, S0 + 3.2, TZ + 7.4], 0.07, 0x2a2a34, true, 6);
  K.box(M.paint, 0.6, 2.6, S0 + 0.9, S0 + 2.0, TZ + 6.6, TZ + 7.8, 0xf4f0e8, 0.03); for (const a of [-1, 1]) for (const b of [-1, 1]) K.box(M.paint, 1.6 + a * 0.9 - 0.04, 1.6 + a * 0.9 + 0.04, S0, S0 + 0.9, TZ + 7.2 + b * 0.5 - 0.04, TZ + 7.2 + b * 0.5 + 0.04, 0xf4f0e8, 0.01);
  for (let k = 0; k < 4; k++) K.box(M.paint, 0.62, 2.58, S0 + 1.0 + k * 0.25, S0 + 1.04 + k * 0.25, TZ + 7.8, TZ + 7.84, 0xc8c0b0, 0.005);
  K.put(M.metal, cyl(0.22, 0.2, 0.7, 14), 3.6, S0 + 0.35, TZ + 7.3, 0, 0, 0, 1, 1, 1, 0x9aa0a8); K.beam(M.paint, [4.6, S0, TZ + 7.6], [4.6, S0 + 2.8, TZ + 7.6], 0.06, 0x2a2a34, true, 6);
  K.put(M.brass, cyl(0.42, 0.42, 0.1, 24), -1.6, S0 + 1.9, TZ + 5.66, Math.PI / 2, 0, 0, 1, 1, 1, 0xc89a4a); const baro = mesh(root, plane(0.66, 0.66), M.clock, -1.6, S0 + 1.9, TZ + 5.72, 0, 0, 0, false);
  const anemo = new THREE.Group(); anemo.position.set(-4.5, S0 + 3.25, TZ + 7.4); root.add(anemo); { const KA = new Kit(); for (let i = 0; i < 4; i++) { const a = i / 4 * TAU; KA.beam(M.paint, [0, 0, 0], [Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6], 0.04, 0x2a2a34, true, 5); KA.put(M.paint, sph(0.14, 10, 6, 0, TAU, 0, Math.PI / 2), Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62, Math.PI / 2, -a, 0, 1, 1, 1, 0xd8302a); } KA.build(anemo); }
  const vane = new THREE.Group(); vane.position.set(4.6, S0 + 2.9, TZ + 7.6); root.add(vane); { const KV = new Kit(); KV.beam(M.paint, [-0.8, 0, 0], [0.8, 0, 0], 0.05, 0x2a2a34, true, 5); KV.put(M.paint, new THREE.ConeGeometry(0.12, 0.3, 8), 0.9, 0, 0, 0, 0, -Math.PI / 2, 1, 1, 1, 0x2a2a34); KV.box(M.paint, -0.95, -0.55, -0.22, 0.22, -0.02, 0.02, 0xd8302a, 0.01); KV.build(vane); }
  // the test cable: from the platform rail out and down; shapes slide along it (sphere, cone, flat plate)
  const C0 = [-8.4, S0 + 1.0, TZ + 5], C1 = [-70, 150, TZ + 70]; const cable = new THREE.Group(); root.add(cable); { const KC = new Kit(); KC.beam(M.paint, C0, C1, 0.05, 0x1a1a22, true, 4); KC.build(cable); }
  const sliders = [mesh(root, sph(0.35, 14, 10), M.metal, 0, 0, 0), mesh(root, new THREE.ConeGeometry(0.35, 0.8, 14), M.metal, 0, 0, 0), mesh(root, new THREE.BoxGeometry(0.9, 0.08, 0.9), M.metal, 0, 0, 0)];
  sliders.forEach((s, i) => { s.material = H.toon({ color: [0xe8b030, 0xd8302a, 0x3a6ad8][i] }); });
  // antenna wires from the summit fanning down (radio), visible from fairNight/topNight on (radioOn)
  const wires = new THREE.Group(); root.add(wires); { const KW = new Kit(); for (let i = 0; i < 6; i++) { const a = -0.8 + i * 0.32; KW.beam(M.paint, [0, 300, TZ], [Math.sin(a) * 140, 2, TZ + Math.cos(a) * 140 + 30], 0.06, 0x1a1a22, true, 4); } KW.build(wires); }
  // today: striped antenna mast stack on the lantern (+ the 2022 top piece carried by the helicopter)
  const today = new THREE.Group(); root.add(today); { const KT = new Kit(); for (let i = 0; i < 6; i++) KT.put(M.mast, cyl(0.9 - i * 0.08, 0.95 - i * 0.08, 4, 12), 0, 297 + i * 4 + 2, TZ, 0, 0, 0, 1, 1, 1, i % 2 ? 0xd8402a : 0xf4f0e8); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; KT.box(M.mast, Math.cos(a) * 1.1 - 0.2, Math.cos(a) * 1.1 + 0.2, 300 + (i % 3) * 5, 302 + (i % 3) * 5, TZ + Math.sin(a) * 1.1 - 0.2, TZ + Math.sin(a) * 1.1 + 0.2, 0xf4f0e8, 0.05); } KT.build(today); }
  const newTop = new THREE.Group(); root.add(newTop); { const KN = new Kit(); KN.put(M.mast, cyl(0.35, 0.45, 6, 12), 0, 3, 0, 0, 0, 0, 1, 1, 1, 0xf4f0e8); for (let i = 0; i < 3; i++) KN.put(M.mast, cyl(0.47, 0.47, 0.6, 12), 0, 1 + i * 2, 0, 0, 0, 0, 1, 1, 1, 0xd8402a); KN.build(newTop); }
  const heli = new THREE.Group(); root.add(heli); { const KH = new Kit(); KH.put(M.heli, sph(2.2, 18, 12), 0, 0, 0, 0, 0, 0, 1.6, 1, 1, 0xd8402a); KH.put(M.glassC, sph(1.5, 14, 10), 1.9, 0.3, 0, 0, 0, 0, 1, 0.8, 1, 0xffffff); KH.beam(M.heli, [-2.5, 0.4, 0], [-9, 1.2, 0], 0.5, 0xd8402a); KH.box(M.heli, -9.4, -8.6, 1.0, 2.8, -0.08, 0.08, 0xf4f0e8, 0.05);
    for (const s of [-1, 1]) { KH.beam(M.paint, [-1.6, -2.4, s * 1.4], [2.2, -2.4, s * 1.4], 0.15, 0x2a2a34, true, 6); KH.beam(M.paint, [-0.8, -2.4, s * 1.4], [-0.6, -1.4, s * 0.9], 0.1, 0x2a2a34); KH.beam(M.paint, [1.2, -2.4, s * 1.4], [1.0, -1.4, s * 0.9], 0.1, 0x2a2a34); }
    KH.put(M.paint, cyl(0.25, 0.25, 0.8, 8), 0, 2.4, 0, 0, 0, 0, 1, 1, 1, 0x2a2a34); KH.build(heli); }
  const rotor = mesh(heli, cyl(7, 7, 0.05, 32), M.rotor, 0, 2.85, 0, 0, 0, 0, false); const sling = new Kit(); sling.beam(M.paint, [0, -2.4, 0], [0, -12, 0], 0.05, 0x1a1a22, true, 4); sling.build(heli);
  // flags + pennants (1889 dressing) on the pavilions and the first platform
  const flags89 = new THREE.Group(); root.add(flags89); const flagMeshes = [];
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const f = mesh(flags89, plane(4, 2.6), M.flag, s * 120 + 2, 38.6, 60 + i * 110, 0, 0, 0, false); flagMeshes.push(f); }
  { const f = mesh(flags89, plane(9, 6), M.flag, 4.8, 306.5, TZ, 0, 0, 0, false); flagMeshes.push(f); const KF = new Kit(); KF.beam(M.paint, [0, 300.5, TZ], [0, 310, TZ], 0.18, 0x3a3a44, true, 6); KF.build(flags89); }
  for (let i = 0; i < 40; i++) { const t = i / 40, z = -20 + t * 300; for (const s of [-1, 1]) { const p = mesh(flags89, plane(0.6, 1.1), M.pennants[i % 3], s * 14.5, 5.5 + 0.6 * Math.sin(t * 40), z, 0, Math.PI / 2, 0, false); flagMeshes.push(p); } }
  // distant crowd: instanced simple figures along the promenade and around the tower (tinted); today variant brighter
  const pfP = (() => { const KP = new Kit(); KP.put(M.crowd, cyl(0.22, 0.3, 1.15, 8), 0, 0.6, 0, 0, 0, 0, 1, 1, 1); KP.put(M.crowd, sph(0.2, 10, 8), 0, 1.38, 0, 0, 0, 0, 1, 1, 1); return KP.prefab(); })();
  const mkCrowd = (seed, cols) => { const RC = PT.rng(seed), L = []; for (let i = 0; i < 260; i++) { let x, z; const k = RC(); if (k < 0.55) { x = (RC() - 0.5) * 22; z = 60 + RC() * 200; } else if (k < 0.85) { const a = RC() * TAU, r = 70 + RC() * 40; x = Math.cos(a) * r; z = TZ + Math.sin(a) * r; } else { x = (RC() < 0.5 ? -1 : 1) * (40 + RC() * 40); z = RC() * 300; }
    if (Math.abs(x) < 8 && z < 60) continue; L.push([x, 0, z, RC() * 6, 1, cols[i % cols.length], 0.9 + RC() * 0.2]); } const g = new THREE.Group(); root.add(g); instance(g, pfP, L, false); return g; };
  const crowd89 = mkCrowd(7, [0x2a2a34, 0x4a3a3a, 0x6a2a3a, 0x3a3a5a, 0x5a4a3a, 0x8a6a8a]); const crowdNow = mkCrowd(9, [0xe8604a, 0x3a8ad8, 0xf0c030, 0x3aa88a, 0xf4f0e8, 0x8a5ac8]);
  K.build(root, 120);
  // night glows: lamp globes, tower platform lamps, beacon at the top; radio rings
  const lampGlows = lamps.map((p) => glowAt(root, p, 2.2, '#ffd890', 0.0));
  const towerLamps = []; for (const [y, hf] of [[58, TW(57.6) + 2.5], [117, TW(115.7) + 2], [276, 8.5]]) for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; towerLamps.push(glowAt(root, [Math.cos(a) * hf * 1.05, y + 1, TZ + Math.sin(a) * hf * 1.05], y > 200 ? 6 : 9, '#ffc070', 0)); }
  const beacon = glowAt(root, [0, 293, TZ], 28, '#fff0c0', 0);
  const rings = Array.from({ length: 5 }, () => { const m = nond(mesh(root, plane(1, 1), M.ring.clone(), 0, 300, TZ, 0, 0, 0, false)); m.renderOrder = 8; m.visible = false; return m; });
  const pulse = glowAt(root, [0, 300, TZ], 30, '#9af0ff', 0); const panthGlow = glowAt(root, PANTH, 34, '#9af0ff', 0);
  const dust = motes(root, 60, [-12, 12, 0.5, 6, -5, 30], 47, 0.03);
  return { cable, demoSign, globes, lampGlows, towerLamps, beacon, rings, pulse, panthGlow, PANTH, hutGlow, anemo, vane, sliders, C0, C1, wires, today, newTop, heli, rotor, flags89, flagMeshes, crowd89, crowdNow, fwater, jet, dust, baro };
}

// ================================================================= OFFICE (city office)
function buildOffice(root) { const K = new Kit(), X = 4.4, ZB = -3.4, HT = 3.6;
  mesh(root, planeUV(10, 9, 3, 3), M.wood, 0, 0, 0.5, -Math.PI / 2, 0, 0, false);
  K.box(M.wallO, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(M.wallO, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 4, 0xffffff, 0.01);
  mesh(root, plane(2 * X, 8), H.toon({ color: 0xe8dcc8, side: THREE.DoubleSide }), 0, HT, 0.6, Math.PI / 2, 0, 0, false);
  K.box(M.darkwood, -X, X, 0, 0.9, ZB, ZB + 0.06, 0xffffff, 0.01); K.box(M.darkwood, -X, X, 0.9, 0.96, ZB, ZB + 0.1, 0xffffff, 0.01); K.box(M.paint, -X, X, HT - 0.25, HT, ZB, ZB + 0.15, 0xe8dcc8, 0.02);
  // tall window, with the tower outside
  const win = mesh(root, plane(1.8, 2.3), M.view, 1.6, 2.05, ZB + 0.03, 0, 0, 0, false); K.box(M.paint, 0.62, 2.58, 0.86, 3.24, ZB, ZB + 0.12, 0xf4efe2, 0.02); K.box(M.paint, 1.57, 1.63, 0.9, 3.2, ZB + 0.08, ZB + 0.14, 0xf4efe2, 0.01); K.box(M.paint, 0.66, 2.54, 2.0, 2.06, ZB + 0.08, ZB + 0.14, 0xf4efe2, 0.01);
  for (const s of [-1, 1]) K.box(M.cloth, 1.6 + s * 1.1 - 0.18, 1.6 + s * 1.1 + 0.18, 0.4, 3.4, ZB + 0.14, ZB + 0.3, 0x8a2a3a, 0.06);
  // desk + permit + stamp + inkwell + books + lamp
  const DX = -0.4, DZ = -1.2, DY = 0.8; K.box(M.darkwood, DX - 1.1, DX + 1.1, DY - 0.06, DY, DZ - 0.5, DZ + 0.5, 0xb07a4a, 0.02); for (const s of [-1, 1]) K.box(M.darkwood, DX + s * 0.85 - 0.25, DX + s * 0.85 + 0.25, 0, DY - 0.06, DZ - 0.45, DZ + 0.45, 0x8a5a38, 0.02);
  const doc = mesh(root, plane(0.36, 0.48), M.docPermit, DX + 0.1, DY + 0.004, DZ + 0.12, -Math.PI / 2, 0.12, 0, false);
  K.put(M.paint, cyl(0.04, 0.05, 0.1, 10), DX + 0.62, DY + 0.05, DZ - 0.1, 0, 0, 0, 1, 1, 1, 0x2a2a34); K.box(M.paint, DX + 0.5, DX + 0.74, DY, DY + 0.04, DZ + 0.1, DZ + 0.22, 0x3a3a44, 0.01); K.box(M.cloth, DX + 0.52, DX + 0.72, DY + 0.04, DY + 0.05, DZ + 0.12, DZ + 0.2, 0xc8302a, 0.005);
  for (let i = 0; i < 4; i++) K.box(M.paint, DX - 1.0, DX - 0.62, DY + i * 0.07, DY + 0.06 + i * 0.07, DZ - 0.3 + i * 0.01, DZ, [0x6a2a2a, 0x2a4a3a, 0x3a3a6a, 0x8a6a3a][i], 0.01);
  K.put(M.brass, cyl(0.07, 0.12, 0.05, 12), DX - 0.75, DY + 0.03, DZ + 0.25, 0, 0, 0, 1, 1, 1, 0xc89a4a); K.beam(M.brass, [DX - 0.75, DY, DZ + 0.25], [DX - 0.75, DY + 0.42, DZ + 0.25], 0.02, 0xc89a4a, true, 6); const lampG = glowAt(root, [DX - 0.75, DY + 0.45, DZ + 0.25], 0.9, '#ffc070', 0.5); mesh(root, cyl(0.06, 0.14, 0.14, 12, true), M.lampGlass, DX - 0.75, DY + 0.46, DZ + 0.25, 0, 0, 0, false);
  // chair, cabinets, bookshelf, clock, calendar, tower print
  K.box(M.darkwood, DX - 0.25, DX + 0.25, 0.45, 0.5, DZ - 1.05, DZ - 0.6, 0x6a3a28, 0.02); K.box(M.darkwood, DX - 0.25, DX + 0.25, 0.5, 1.1, DZ - 1.08, DZ - 1.02, 0x6a3a28, 0.02);
  for (let i = 0; i < 3; i++) { K.box(M.darkwood, -X + 0.1, -X + 0.6, 0, 1.4, -2.8 + i * 0.7, -2.2 + i * 0.7, 0xffffff, 0.02); for (let k = 0; k < 4; k++) K.box(M.brass, -X + 0.6, -X + 0.63, 0.25 + k * 0.32, 0.29 + k * 0.32, -2.55 + i * 0.7, -2.45 + i * 0.7, 0xc89a4a, 0.005); }
  K.box(M.darkwood, -3.6, -1.4, 0, 2.6, ZB, ZB + 0.4, 0xffffff, 0.02); for (let j = 0; j < 5; j++) { K.box(M.darkwood, -3.6, -1.4, 0.1 + j * 0.5, 0.14 + j * 0.5, ZB, ZB + 0.4, 0xffffff, 0.01); for (let i = 0; i < 12; i++) K.box(M.paint, -3.5 + i * 0.17, -3.38 + i * 0.17, 0.14 + j * 0.5, 0.48 + j * 0.5 - (i % 3) * 0.04, ZB + 0.05, ZB + 0.33, [0x6a2a2a, 0x2a4a3a, 0x3a3a6a, 0x8a6a3a, 0xc8b070][(i + j) % 5], 0.01); }
  mesh(root, plane(0.5, 0.5), M.clock, -0.5, 2.85, ZB + 0.03, 0, 0, 0, false); const hands = [mesh(root, plane(0.02, 0.18), H.toon({ color: 0x2a1a14 }), -0.5, 2.85, ZB + 0.05, 0, 0, 0, false), mesh(root, plane(0.025, 0.13), H.toon({ color: 0x2a1a14 }), -0.5, 2.85, ZB + 0.055, 0, 0, 0, false)];
  hands.forEach((h) => { h.geometry = h.geometry.clone(); h.geometry.translate(0, h.geometry.parameters.height / 2, 0); });
  const cal = mesh(root, plane(0.4, 0.5), M.cal89, 3.2, 1.7, ZB + 0.03, 0, 0, 0, false);
  mesh(root, plane(0.7, 0.9), M.paintings[3], -X + 0.03, 2.0, 0.6, 0, Math.PI / 2, 0, false); K.box(M.brass, -X, -X + 0.05, 1.5, 2.5, 0.2, 1.0, 0xc89a4a, 0.01);
  mesh(root, planeUV(3.4, 2.2, 1, 1), H.toon({ color: 0x6a2a2a }), DX, 0.005, DZ - 0.2, -Math.PI / 2, 0, 0, false);
  K.build(root, 0);
  const shaft = shaftAt(root, [1.6, 1.5, -1.6], 2.0, 4.0, 0, 0.5, 0.18); const dust = motes(root, 40, [-2, 3, 0.4, 3, -3, 1], 51, 0.01);
  return { win, doc, cal, hands, lampG, shaft, dust, DX, DY, DZ };
}

// ================================================================= STUDIO (1887 artists)
function buildStudio(root) { const K = new Kit(), X = 4.8, ZB = -3.6, HT = 3.8;
  mesh(root, planeUV(11, 9, 3, 3), M.wood, 0, 0, 0.6, -Math.PI / 2, 0, 0, false);
  K.box(M.wallS, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(M.wallS, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 4, 0xffffff, 0.01);
  mesh(root, plane(2 * X, 8), H.toon({ color: 0x3a2618, side: THREE.DoubleSide }), 0, HT, 0.6, Math.PI / 2, 0, 0, false); for (let i = 0; i < 4; i++) K.box(M.darkwood, -X, X, HT - 0.24, HT - 0.04, -3 + i * 2, -2.8 + i * 2, 0xffffff, 0.02);
  // big studio window (Paris roofs, no tower yet)
  const win = mesh(root, plane(3.2, 2.4), M.view87, -0.6, 2.2, ZB + 0.03, 0, 0, 0, false); K.box(M.darkwood, -2.3, 1.1, 0.94, 3.46, ZB, ZB + 0.12, 0xffffff, 0.02); for (let i = 1; i < 4; i++) K.box(M.darkwood, -2.2 + i * 0.8 - 0.03, -2.2 + i * 0.8 + 0.03, 1.0, 3.4, ZB + 0.08, ZB + 0.14, 0xffffff, 0.01); K.box(M.darkwood, -2.2, 1.0, 2.18, 2.24, ZB + 0.08, ZB + 0.14, 0xffffff, 0.01);
  // easels with paintings: centre one is the "chimney" picture
  const easel = (x, z, ry, k, s = 1) => { K.at(x, 0, z, ry, () => { K.beam(M.wood, [-0.35 * s, 0, 0.1], [0, 1.9 * s, 0], 0.045, 0x8a6040); K.beam(M.wood, [0.35 * s, 0, 0.1], [0, 1.9 * s, 0], 0.045, 0x8a6040); K.beam(M.wood, [0, 0, -0.5 * s], [0, 1.8 * s, 0], 0.04, 0x8a6040); K.box(M.wood, -0.45 * s, 0.45 * s, 0.75 * s, 0.8 * s, 0.02, 0.14, 0x8a6040, 0.01); });
    const m = mesh(root, plane(0.78 * s, 1.04 * s), M.paintings[k], x + Math.sin(ry) * 0.12, 0.8 * s + 0.53 * s, z + Math.cos(ry) * 0.12, -0.08, ry, 0, false); return m; };
  const chimPic = easel(1.5, -1.2, -0.35, 0, 1.15); easel(-3.2, -1.8, 0.45, 1); easel(3.6, -2.6, -0.2, 2, 0.9);
  // protest table with the letter, quill, inkwell, coffee cups, chairs
  const TX = -0.6, TZ2 = 0.2, TY = 0.78; K.put(M.darkwood, cyl(0.75, 0.75, 0.05, 28), TX, TY, TZ2, 0, 0, 0, 1, 1, 1, 0x8a5a38); K.put(M.darkwood, cyl(0.07, 0.1, TY, 10), TX, TY / 2, TZ2, 0, 0, 0, 1, 1, 1, 0x4a2e1e); K.put(M.darkwood, cyl(0.4, 0.45, 0.04, 16), TX, 0.02, TZ2, 0, 0, 0, 1, 1, 1, 0x4a2e1e);
  const letter = mesh(root, plane(0.4, 0.53), M.docProtest, TX + 0.05, TY + 0.03, TZ2 + 0.05, -Math.PI / 2, -0.2, 0, false);
  K.put(M.paint, cyl(0.05, 0.06, 0.08, 10), TX + 0.42, TY + 0.065, TZ2 - 0.2, 0, 0, 0, 1, 1, 1, 0x1a1a22); K.beam(M.cloth, [TX + 0.42, TY + 0.08, TZ2 - 0.2], [TX + 0.5, TY + 0.36, TZ2 - 0.28], 0.015, 0xf4f0e8);
  for (const [dx, dz] of [[-0.45, -0.3], [0.35, 0.4]]) { K.put(M.paint, cyl(0.045, 0.035, 0.07, 10), TX + dx, TY + 0.06, TZ2 + dz, 0, 0, 0, 1, 1, 1, 0xf4f0e8); K.put(M.paint, cyl(0.08, 0.08, 0.01, 12), TX + dx, TY + 0.03, TZ2 + dz, 0, 0, 0, 1, 1, 1, 0xf4f0e8); }
  for (const [dx, dz, ry] of [[-1.0, -0.6, 0.6], [0.9, -0.5, -0.7]]) K.at(TX + dx, 0, TZ2 + dz, ry, () => { K.box(M.darkwood, -0.22, 0.22, 0.44, 0.48, -0.22, 0.22, 0x6a3a28, 0.02); K.box(M.darkwood, -0.22, 0.22, 0.48, 1.0, -0.24, -0.2, 0x6a3a28, 0.02); for (const a of [-1, 1]) for (const b of [-1, 1]) K.box(M.darkwood, a * 0.19 - 0.02, a * 0.19 + 0.02, 0, 0.44, b * 0.19 - 0.02, b * 0.19 + 0.02, 0x4a2e1e, 0.005); });
  // upright piano (composer), bust on a pedestal, canvases leaning, plan drawing on the wall, rug, paint pots
  K.box(M.darkwood, -X + 0.1, -X + 0.7, 0, 1.3, -0.4, 1.2, 0x3a2418, 0.03); K.box(M.paint, -X + 0.7, -X + 0.9, 0.7, 0.76, -0.3, 1.1, 0xf4f0e8, 0.01); for (let i = 0; i < 14; i++) K.box(M.paint, -X + 0.78, -X + 0.92, 0.76, 0.79, -0.28 + i * 0.1, -0.24 + i * 0.1, 0x1a1a22, 0.005);
  K.box(M.paint, 3.4, 3.9, 0, 1.1, 0.2, 0.7, 0xe8e0d0, 0.02); K.put(M.paint, sph(0.2, 14, 10), 3.65, 1.42, 0.45, 0, 0, 0, 0.9, 1.15, 1, 0xf0ece4); K.put(M.paint, cyl(0.12, 0.2, 0.25, 12), 3.65, 1.18, 0.45, 0, 0, 0, 1, 1, 1, 0xf0ece4);
  for (let i = 0; i < 4; i++) K.cb(M.wood, 0.7, 0.9, 0.03, 3.2 + i * 0.08, 0.45, -3.2 + i * 0.12, 0xc8a878, -0.2, 0.1, 0);
  mesh(root, plane(0.9, 1.2), M.paintings[3], X - 0.03, 2.1, -1.0, 0, -Math.PI / 2, 0, false); K.box(M.darkwood, X - 0.06, X, 1.45, 2.75, -1.5, -0.5, 0x3a2418, 0.01);
  mesh(root, planeUV(3.4, 2.4, 1, 1), H.toon({ color: 0x6a3a5a }), TX, 0.005, TZ2, -Math.PI / 2, 0, 0, false);
  for (let i = 0; i < 5; i++) K.put(M.paint, cyl(0.07, 0.07, 0.12, 10), 2.6 + i * 0.16, 0.06, -0.4 + (i % 2) * 0.1, 0, 0, 0, 1, 1, 1, [0xc8302a, 0x3a6ad8, 0xf0c030, 0x3a9a5a, 0xf4f0e8][i]);
  K.put(M.brass, cyl(0.12, 0.16, 0.06, 12), TX + 0.5, TY + 0.03, TZ2 + 0.3, 0, 0, 0, 1, 1, 1, 0xc89a4a); K.beam(M.brass, [TX + 0.5, TY, TZ2 + 0.3], [TX + 0.5, TY + 0.45, TZ2 + 0.3], 0.02, 0xc89a4a, true, 6); mesh(root, cyl(0.07, 0.16, 0.16, 12, true), M.lampGlass, TX + 0.5, TY + 0.5, TZ2 + 0.3, 0, 0, 0, false); const lampG = glowAt(root, [TX + 0.5, TY + 0.5, TZ2 + 0.3], 1.0, '#ffc070', 0.55);
  K.build(root, 0);
  const shaft = shaftAt(root, [-0.6, 1.6, -2.2], 3.0, 4.0, 0, 0.5, 0.16); const dust = motes(root, 50, [-3, 3, 0.4, 3.2, -3, 1.5], 61, 0.01);
  return { win, chimPic, letter, lampG, shaft, dust, TX, TY, TZ2 };
}

// ================================================================= RADIO ROOM (1914)
function buildRadio(root) { const K = new Kit(), X = 3.6, ZB = -2.6, HT = 2.7;
  mesh(root, planeUV(8, 7, 3, 3), M.darkwood, 0, 0, 0.6, -Math.PI / 2, 0, 0, false);
  K.box(M.wallR, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(M.wallR, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 4, 0xffffff, 0.01);
  mesh(root, plane(2 * X, 7), H.toon({ color: 0x2a2620, side: THREE.DoubleSide }), 0, HT, 0.6, Math.PI / 2, 0, 0, false); for (let i = 0; i < 3; i++) K.beam(M.paint, [-X, HT - 0.1, -2 + i * 1.6], [X, HT - 0.1, -2 + i * 1.6], 0.1, 0x5a5a5a, true, 8);
  // bench + receiver boxes with dials, coils, morse key, paper tape, headphone cable, lamp
  const BY = 0.78, BZ = -1.9; K.box(M.darkwood, -2.2, 1.8, BY - 0.06, BY, BZ - 0.5, BZ + 0.45, 0x8a5a38, 0.02); for (const x of [-2.1, 1.7]) K.box(M.darkwood, x - 0.05, x + 0.05, 0, BY - 0.06, BZ - 0.45, BZ + 0.4, 0x5a3a28, 0.01);
  K.box(M.darkwood, -1.2, 0.4, BY, BY + 0.5, BZ - 0.45, BZ - 0.05, 0x4a2e1e, 0.02); K.box(M.paint, -1.15, 0.35, BY + 0.05, BY + 0.45, BZ - 0.051, BZ - 0.04, 0x1a1a1e, 0.005);
  const dials = []; for (let i = 0; i < 3; i++) { K.put(M.brass, cyl(0.07, 0.07, 0.03, 16), -0.9 + i * 0.5, BY + 0.3, BZ - 0.03, Math.PI / 2, 0, 0, 1, 1, 1, 0xc89a4a); dials.push(mesh(root, cyl(0.045, 0.045, 0.01, 16), M.dial, -0.9 + i * 0.5, BY + 0.3, BZ - 0.013, Math.PI / 2, 0, 0, false)); }
  for (let i = 0; i < 2; i++) K.put(M.brass, new THREE.TorusGeometry(0.12, 0.02, 8, 24), 0.9 + i * 0.35, BY + 0.2, BZ - 0.2, 0, 0, 0, 1, 1, 1, 0xc87a3a);
  K.box(M.brass, -1.75, -1.45, BY, BY + 0.03, BZ + 0.05, BZ + 0.2, 0xc89a4a, 0.005); const key = mesh(root, new THREE.BoxGeometry(0.22, 0.02, 0.04), H.toon({ color: 0x3a3a44 }), -1.6, BY + 0.06, BZ + 0.12, 0, 0, 0, false);
  const tape = mesh(root, planeUV(0.08, 1.0, 1, 1), M.tape, 0.9, BY + 0.01, BZ + 0.2, -Math.PI / 2, 0.3, 0, false);
  K.put(M.brass, cyl(0.1, 0.14, 0.06, 12), 1.5, BY + 0.03, BZ - 0.25, 0, 0, 0, 1, 1, 1, 0xc89a4a); K.beam(M.brass, [1.5, BY, BZ - 0.25], [1.5, BY + 0.5, BZ - 0.25], 0.02, 0xc89a4a, true, 6); mesh(root, cyl(0.08, 0.18, 0.16, 12, true), M.lampGlass, 1.5, BY + 0.55, BZ - 0.25, 0, 0, 0, false); const lampG = glowAt(root, [1.5, BY + 0.55, BZ - 0.25], 1.2, '#ffc070', 0.6);
  // wall map + clock + wire bundle + stool + crates
  mesh(root, plane(1.8, 1.35), M.map, -0.4, 1.85, ZB + 0.03, 0, 0, 0, false); K.box(M.darkwood, -1.35, 0.55, 1.12, 2.58, ZB, ZB + 0.04, 0x3a2418, 0.01);
  mesh(root, plane(0.4, 0.4), M.clock, 1.6, 2.1, ZB + 0.03, 0, 0, 0, false);
  for (let i = 0; i < 4; i++) K.beam(M.paint, [-2.6 + i * 0.05, HT, ZB + 0.1], [-0.8 + i * 0.1, BY + 0.5, BZ - 0.3], 0.012, 0x1a1a22, true, 3);
  K.put(M.darkwood, cyl(0.2, 0.2, 0.05, 14), -0.5, 0.5, BZ + 0.75, 0, 0, 0, 1, 1, 1, 0x6a3a28); K.put(M.darkwood, cyl(0.03, 0.05, 0.5, 6), -0.5, 0.25, BZ + 0.75, 0, 0, 0, 1, 1, 1, 0x4a2e1e);
  for (const [x, z, h] of [[2.8, -1.8, 0.5], [2.8, -1.2, 0.4], [-3.0, -0.4, 0.5]]) K.box(M.wood, x - 0.3, x + 0.3, 0, h, z - 0.25, z + 0.25, 0x9a7050, 0.02);
  K.build(root, 0);
  const dust = motes(root, 30, [-2, 2, 0.4, 2.4, -2.4, 0.5], 71, 0.008);
  return { dials, key, tape, lampG, dust, BY, BZ };
}

// ================================================================= lights, grades, API
const SET_LIGHT = {
  fair89: { top: '#3f7ad8', hor: '#d8e6f4', fog: '#d6e2f0', fogN: 180, fogF: 1900, sky: '#a8bcf0', ground: '#5c6a4a', hemiI: 0.74, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#fff0d0', sunI: 3.6, az: 40, el: 42, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0.3 },
  fairDusk: { top: '#3a3a8a', hor: '#ff9a70', fog: '#c08a8a', fogN: 250, fogF: 2200, sky: '#8a80d0', ground: '#4a3a40', hemiI: 0.8, fillCol: '#6a6ad8', fillI: 0.4, sunCol: '#ff9a60', sunI: 2.8, az: -70, el: 9, disc: '#ffe0b0', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff0e8', fxTint: '#ffffff', shafts: 0.4 },
  fairNight: { top: '#04061a', hor: '#1a2250', fog: '#141a3a', fogN: 400, fogF: 2600, sky: '#5a6ab8', ground: '#2a2030', hemiI: 0.62, fillCol: '#4a58c8', fillI: 0.45, sunCol: '#a8b8ff', sunI: 1.3, az: -50, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0.7, cardTint: '#e8e8ff', fxTint: '#ffffff', shafts: 0 },
  topDay: { top: '#3a72d0', hor: '#dce8f4', fog: '#c8d8ea', fogN: 220, fogF: 1700, sky: '#a8bcf0', ground: '#5c6a4a', hemiI: 0.78, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#fff0d0', sunI: 3.4, az: -30, el: 38, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0.2 },
  topNight: { top: '#03051a', hor: '#1a2458', fog: '#18204a', fogN: 200, fogF: 1400, sky: '#5a6ab8', ground: '#2a2030', hemiI: 0.62, fillCol: '#4a58c8', fillI: 0.5, sunCol: '#a8b8ff', sunI: 1.4, az: -40, el: 35, disc: '#000000', clouds: false, shadow: true, stars: 0.8, cardTint: '#e8e8ff', fxTint: '#ffffff', shafts: 0 },
  fairToday: { top: '#3a82e0', hor: '#e0eaf4', fog: '#d8e4f0', fogN: 200, fogF: 2000, sky: '#a8c4f0', ground: '#5c6a4a', hemiI: 0.76, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#fff4e0', sunI: 3.6, az: 60, el: 40, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0.3 },
  fairDawn: { top: '#4a5aa8', hor: '#ffc890', fog: '#f0c8a0', fogN: 250, fogF: 2200, sky: '#9a90d8', ground: '#5a4a50', hemiI: 0.9, fillCol: '#7078d8', fillI: 0.32, sunCol: '#ffb070', sunI: 3.2, az: 70, el: 10, disc: '#fff0c8', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff2e2', fxTint: '#fff6ea', shafts: 0.6 },
  office89: { top: '#000000', hor: '#c8ccd0', fog: '#c8ccd0', fogN: 14, fogF: 60, sky: '#f0f0f8', ground: '#7a7068', hemiI: 0.95, fillCol: '#8a98d8', fillI: 0.35, sunCol: '#fff4e0', sunI: 2.8, az: 160, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  office10: { top: '#000000', hor: '#2a1e18', fog: '#2a1e18', fogN: 12, fogF: 60, sky: '#ffe8c8', ground: '#6a4a2a', hemiI: 0.9, fillCol: '#8a90c8', fillI: 0.32, sunCol: '#ffd8a0', sunI: 2.4, az: 150, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff4e8', fxTint: '#ffffff', shafts: 0 },
  studio87: { top: '#000000', hor: '#1a1018', fog: '#1a1018', fogN: 10, fogF: 50, sky: '#ffc890', ground: '#4a2a20', hemiI: 0.75, fillCol: '#5a58b8', fillI: 0.38, sunCol: '#ffc888', sunI: 1.8, az: 160, el: 50, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
  chimney: { top: '#000000', hor: '#1a1018', fog: '#1a1018', fogN: 10, fogF: 50, sky: '#ffc890', ground: '#4a2a20', hemiI: 0.85, fillCol: '#5a58b8', fillI: 0.36, sunCol: '#ffd0a0', sunI: 2.0, az: 150, el: 45, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
  radio14: { top: '#000000', hor: '#141a30', fog: '#141a30', fogN: 8, fogF: 40, sky: '#7a7ab8', ground: '#3a2a30', hemiI: 0.62, fillCol: '#5a68c8', fillI: 0.45, sunCol: '#a8b8ff', sunI: 1.0, az: 160, el: 35, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ece8ff', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  fair89: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.1, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.36, 0.86], vig: [0.26, 0.5, '#4a3a5a'] } },
  fairDusk: { look: 'golden', over: { exp: 1.06, con: 1.24, sat: 1.12, tS: ['#3a2a8a', 0.2], tH: ['#ffb080', 0.1], bloom: [0.46, 0.74], hal: [0.28, '#ff9060'], vig: [0.34, 0.46, '#1e1a3a'] } },
  fairNight: { look: 'night', over: { exp: 1.18, con: 1.22, sat: 1.08, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.52, 0.64], hal: [0.32, '#ff9a50'], vig: [0.42, 0.4, '#08081a'] } },
  topDay: { look: 'day', over: { exp: 1.04, con: 1.2, sat: 1.1, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.36, 0.86], vig: [0.26, 0.5, '#4a3a5a'] } },
  topNight: { look: 'night', over: { exp: 1.18, con: 1.22, sat: 1.06, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.52, 0.64], hal: [0.32, '#ffa050'], vig: [0.42, 0.4, '#08081a'] } },
  fairToday: { look: 'day', over: { exp: 1.04, con: 1.2, sat: 1.12, tS: ['#3a4a8a', 0.12], tH: ['#fff0d0', 0.05], bloom: [0.36, 0.86], vig: [0.24, 0.5, '#4a3a5a'] } },
  fairDawn: { look: 'golden', over: { exp: 1.06, con: 1.22, sat: 1.1, tS: ['#3a3a8a', 0.18], tH: ['#ffc890', 0.1], bloom: [0.42, 0.78], hal: [0.24, '#ffa860'], vig: [0.3, 0.48, '#1e1a3a'] } },
  office89: { look: 'day', over: { exp: 1.04, con: 1.2, sat: 1.06, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c8', 0.06], bloom: [0.38, 0.84], vig: [0.28, 0.48, '#3a2a4a'] } },
  office10: { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.08, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.42, 0.78], hal: [0.26, '#ff9a50'], vig: [0.36, 0.44, '#2a1420'] } },
  studio87: { look: 'office', over: { exp: 1.14, con: 1.24, sat: 1.08, lift: [0.035, 0.02, 0.05], tS: ['#2a1a6a', 0.22], tH: ['#ffc070', 0.14], bloom: [0.48, 0.7], hal: [0.3, '#ff9a50'], vig: [0.4, 0.42, '#14081a'] } },
  chimney: { look: 'office', over: { exp: 1.1, con: 1.26, sat: 0.9, lift: [0.03, 0.02, 0.04], tS: ['#2a1a4a', 0.2], tH: ['#ffd0a0', 0.1], bloom: [0.44, 0.74], hal: [0.26, '#ff9a50'], vig: [0.46, 0.4, '#0a060e'] } },
  radio14: { look: 'night', over: { exp: 1.16, con: 1.22, sat: 1.04, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.5, 0.68], hal: [0.3, '#ffa050'], vig: [0.42, 0.4, '#08081a'] } },
};

export function buildEF(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'fair89', waves: 0, pulse: 0, slide: -1, heli: -1, newTop: 0, radioOn: 0, demo: 0, renew: 0 };
  let fa, of, stu, ra;
  const NIGHT = (n) => n === 'fairNight' || n === 'topNight';
  const API = makeAPI(ctx, { prefix: 'ef_', origin: EF_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { fair89: 'day', fairDusk: 'day', fairNight: 'day', topDay: 'day', topNight: 'day', fairToday: 'day', fairDawn: 'day' },
    practicals: (name, F, W3) => { const fl = 1 + 0.05 * Math.sin(F * 0.7) + 0.03 * Math.sin(F * 1.9);
      if (name === 'fairNight' || name === 'fairDusk') { const n = name === 'fairNight' ? 1 : 0.4; return [{ p: W3('fair', [-14.5, 4.6, 322]), col: '#ffd890', I: 9 * n, d: 22 }, { p: W3('fair', [14.5, 4.6, 340]), col: '#ffd890', I: 9 * n, d: 22 }, { p: W3('fair', [31.2, 1.8, -19.5]), col: '#ffc070', I: 2.5 * fl, d: 8 }, { p: W3('fair', [0, 4, 40]), col: '#9ac8ff', I: 5 * n, d: 18 }]; }
      if (name === 'topNight') return [{ p: W3('fair', [0, TOP + 2.2, TZ + 6.6]), col: '#ffc070', I: 6 * fl, d: 10 }, { p: W3('fair', [0, 293, TZ]), col: '#fff0c0', I: 8, d: 30 }];
      if (name === 'topDay') return [{ p: W3('fair', [0, TOP + 2.2, TZ + 6.6]), col: '#fff0d8', I: 1.5, d: 8 }];
      if (name.startsWith('office')) return [{ p: W3('office', [-1.15, 1.3, -0.95]), col: '#ffc070', I: (name === 'office10' ? 5 : 2.4) * fl, d: 6 }, { p: W3('office', [1.6, 2.0, -2.6]), col: name === 'office10' ? '#ffb070' : '#fff0d8', I: 3.0, d: 7 }, { p: W3('office', [0, 2.6, 1.5]), col: '#ffe0b8', I: 1.6, d: 7 }];
      if (name === 'studio87' || name === 'chimney') return [{ p: W3('studio', [-0.1, 1.35, 0.5]), col: '#ffc070', I: 6 * fl, d: 7 }, { p: W3('studio', [-0.6, 2.2, -2.4]), col: '#ffe8d0', I: 3, d: 8 }, { p: W3('studio', [1.4, 2.0, 0.8]), col: '#ffc888', I: name === 'chimney' ? 4 : 2, d: 5 }];
      if (name === 'radio14') return [{ p: W3('radio', [1.5, 1.4, -2.0]), col: '#ffc070', I: 6 * fl, d: 6 }, { p: W3('radio', [-0.4, 1.6, -1.2]), col: '#8a9aff', I: 1.6, d: 6 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'fair' && fa) { const cam = H.CAM;
        fa.anemo.rotation.y = T * 7; fa.vane.rotation.y = 0.3 * Math.sin(T * 0.8) + 0.12 * Math.sin(T * 2.3);
        fa.flagMeshes.forEach((m, i) => { m.rotation.y = (m.userData.ry ?? (m.userData.ry = m.rotation.y)) + 0.18 * Math.sin(T * 3 + i); });
        fa.jet.scale.y = 1 + 0.08 * Math.sin(f * 0.9); tickMotes(fa.dust, f, 0.5);
        // sliders along the test cable
        fa.cable.visible = ST.slide > -0.5; fa.sliders.forEach((s, i) => { const t = ST.slide - i * 0.22; s.visible = t >= 0 && t <= 1; const u = Math.min(1, Math.max(0, t)), e = u * u; for (let k = 0; k < 3; k++) s.position.setComponent(k, fa.C0[k] + (fa.C1[k] - fa.C0[k]) * e); s.position.y -= 0.4; s.rotation.z = -0.8; });
        // radio rings from the summit (billboards) + the pulse to the domed hall
        fa.rings.forEach((r, i) => { const ph = ((T * 0.55 + i / fa.rings.length) % 1); r.visible = ST.waves > 0.01; r.position.set(r.parent.position.x * 0, 300, TZ); r.scale.setScalar(6 + ph * 140); r.material.opacity = ST.waves * (1 - ph) * 0.85; if (cam) r.quaternion.copy(cam.quaternion); });
        const p = ST.pulse; fa.pulse.material.opacity = p > 0 && p < 1 ? 0.9 : 0; if (p > 0 && p < 1) { const a = [0, 300, TZ], b = fa.PANTH; fa.pulse.position.set(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p + 120 * Math.sin(Math.PI * p), a[2] + (b[2] - a[2]) * p); }
        fa.panthGlow.material.opacity = p >= 1 ? 0.45 * Math.max(0, 1 - (p - 1) * 0.6) + 0.12 : 0;
        fa.heli.visible = ST.heli >= 0; if (ST.heli >= 0) { const h = ST.heli, drop = Math.min(1, h); fa.heli.position.set(14 - 14 * Math.min(1, h * 1.6), 347 - 8 * drop + 0.4 * Math.sin(T * 2), TZ + 4 - 4 * Math.min(1, h * 1.6)); fa.heli.rotation.set(0.05 * Math.sin(T * 1.3), 0.6 - 0.6 * Math.min(1, h * 1.6), 0.04 * Math.sin(T * 1.1)); fa.rotor.rotation.y = T * 40; }
        fa.newTop.visible = ST.mood === 'fairToday' || ST.mood === 'fairDawn'; if (fa.newTop.visible) { if (ST.heli >= 0 && ST.newTop < 1) { fa.newTop.position.copy(fa.heli.position); fa.newTop.position.y -= 18; fa.newTop.rotation.copy(fa.heli.rotation); } else { fa.newTop.position.set(0, 321, TZ); fa.newTop.rotation.set(0, 0, 0); } }
        if (NIGHT(ST.mood) || ST.mood === 'fairDusk') { const n = NIGHT(ST.mood) ? 1 : 0.35; fa.lampGlows.forEach((g, i) => (g.material.opacity = 0.55 * n * (0.92 + 0.08 * Math.sin(f * 0.8 + i)))); fa.towerLamps.forEach((g, i) => (g.material.opacity = 0.5 * n * (0.9 + 0.1 * Math.sin(f * 0.6 + i * 1.7)))); fa.beacon.material.opacity = 0.55 * n * (0.8 + 0.2 * Math.sin(T * 2.4)); fa.hutGlow.material.opacity = 0.45 * (0.9 + 0.1 * Math.sin(f * 0.9)); }
        else { fa.lampGlows.forEach((g) => (g.material.opacity = 0)); fa.towerLamps.forEach((g) => (g.material.opacity = 0)); fa.beacon.material.opacity = 0; fa.hutGlow.material.opacity = 0.15; } }
      if (cur === 'office' && of) { of.lampG.material.opacity = of.lampG.userData.op * (0.92 + 0.08 * Math.sin(f * 0.8)); tickMotes(of.dust, f, 0.3); of.hands[0].rotation.z = -T * 0.6; of.hands[1].rotation.z = -T * 0.05 - 1.2; }
      if (cur === 'studio' && stu) { stu.lampG.material.opacity = stu.lampG.userData.op * (0.9 + 0.1 * Math.sin(f * 0.7)); tickMotes(stu.dust, f, 0.3); }
      if (cur === 'radio' && ra) { ra.lampG.material.opacity = ra.lampG.userData.op * (0.88 + 0.12 * Math.sin(f * 0.9)); tickMotes(ra.dust, f, 0.2); ra.key.rotation.z = (Math.floor(f / 3) % 4 === 0 || Math.floor(f / 5) % 3 === 1) ? -0.08 : 0; ra.dials.forEach((d, i) => d.material.color.setScalar(1.0 + 0.25 * Math.max(0, Math.sin(f * 0.5 + i * 2)))); ra.tape.position.x = 0.9 + ((f * 0.004) % 0.2); } },
    mood: (name) => { ST.mood = name;
      if (fa) { const today = name === 'fairToday' || name === 'fairDawn', night = NIGHT(name); M.iron.color.set(today ? 0x8a6450 : 0xa85a40); M.ironDark.color.set(today ? 0x6a4a3a : 0x7a3a2e); fa.today.visible = today; fa.flags89.visible = !today; fa.crowd89.visible = !today; fa.crowdNow.visible = today;
        fa.wires.visible = ST.radioOn > 0; fa.globes.forEach((g) => g.material.color.setScalar(night ? 2.2 : 1.1)); }
      if (of) { const r = name === 'office10'; of.doc.material = ST.renew ? M.docRenew : M.docPermit; of.cal.material = r ? M.cal10 : M.cal89; of.win.material = r ? M.viewN : M.view; of.shaft.visible = !r; }
      if (stu) { stu.shaft.visible = name !== 'chimney'; } },
    apply: (v) => { if (v.waves != null) ST.waves = v.waves; if (v.pulse != null) ST.pulse = v.pulse; if (v.slide != null) ST.slide = v.slide; if (v.heli != null) ST.heli = v.heli; if (v.radioOn != null) ST.radioOn = v.radioOn; if (v.demo != null) ST.demo = v.demo; if (fa) fa.demoSign.visible = ST.demo > 0; } });
  fa = buildFair(API.groups.fair, API); of = buildOffice(API.groups.office); stu = buildStudio(API.groups.studio); ra = buildRadio(API.groups.radio);
  API.parts = { fa, of, stu, ra };
  API.setFx = (o) => { Object.assign(ST, { waves: 0, pulse: 0, slide: -1, heli: -1, newTop: 0, radioOn: 0, demo: 0, renew: 0 }, o); if (fa) { fa.wires.visible = ST.radioOn > 0; fa.demoSign.visible = ST.demo > 0; } if (of) of.doc.material = ST.renew ? M.docRenew : M.docPermit; };
  API.glows = { fair: [...fa.lampGlows, ...fa.towerLamps, fa.beacon, fa.pulse, fa.panthGlow, fa.hutGlow], office: [of.lampG], studio: [stu.lampG], radio: [ra.lampG] };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  const V = API.V;
  API.views = [
    V('fair89', [60, 30, 330], [0, 150, TZ], 46, 0.3, [0, 100, TZ]),            // 0 full tower from the promenade
    V('fairDusk', [-19.5, 1.2, 0.5], [-30, 26, -55], 50, 1.0, [-25, 1.2, -8], { demo: 1 }),   // 1 hook: worker at the front-left leg, looking up
    V('fair89', [4, 1.6, 22], [-2, 8, -30], 46, 0.9, [-1, 1.2, 8]),            // 2 promenade, people
    V('fairNight', [-120, 40, 360], [0, 160, TZ], 46, 0.3, [0, 150, TZ], { waves: 1 }), // 3 night tower + rings
    V('topDay', [7, TOP + 5, TZ + 19], [-1.5, TOP + 1.2, TZ + 6.5], 46, 1.0, [-1.5, TOP + 1.2, TZ + 7.2], { slide: 0.6 }), // 4 summit instruments
    V('topNight', [-2, TOP + 1.7, TZ + 14], [0, TOP + 2, TZ + 5], 46, 1.0, [0, TOP + 1.2, TZ + 7], { radioOn: 1 }), // 5 summit night
    V('fairDusk', [36, 1.6, -8], [30, 1.5, -22], 46, 1.0, [31, 1.2, -19]),     // 6 radio hut
    V('fairToday', [40, 300, TZ + 70], [0, 312, TZ], 44, 0.5, [0, 312, TZ], { heli: 0.6 }), // 7 helicopter + antennas
    V('fairDawn', [20, 2, 120], [0, 120, TZ], 46, 0.4, [0, 100, TZ]),          // 8 dawn tower
    V('office89', [1.6, 1.55, 2.4], [-0.4, 1.1, -1.6], 46, 1.2, [-0.4, 1.0, -1.2]), // 9 office wide
    V('office10', [0.6, 1.3, 0.2], [-0.3, 0.8, -1.1], 44, 2.0, [-0.3, 0.8, -1.1]),  // 10 permit close
    V('studio87', [2.2, 1.6, 3.2], [-0.6, 1.0, -0.4], 46, 1.2, [-0.6, 0.9, 0.2]),   // 11 studio wide
    V('chimney', [1.0, 1.5, 0.1], [1.5, 1.4, -1.2], 40, 2.4, [1.5, 1.4, -1.2]),     // 12 chimney painting
    V('radio14', [1.2, 1.4, 1.2], [-0.4, 1.0, -1.9], 46, 1.4, [-0.4, 1.0, -1.6]),   // 13 radio room
    V('fairNight', [-260, 120, 420], [200, 140, 80], 46, 0.3, [0, 200, TZ], { waves: 1, pulse: 0.6 }), // 14 wireless to the dome
  ];
  API.setFx({}); API.tick(0);
  return API;
}
