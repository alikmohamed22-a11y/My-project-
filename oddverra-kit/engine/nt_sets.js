// nt_sets.js [NT-sets]: sets for "Nintendo started as a playing-card company" (Oddverra short). Generic cards (plum / pine / cherry /
// maple motifs), a generic arcade box and a generic grey console only: no company logos, no game characters, no trade dress.
//   shop   : Meiji card workshop, Kyoto 1889: tatami + wood floor, glowing shoji back wall, a low paint bench with stacks of cards,
//            drying lines of cards, paper lanterns, a players' low table, a hand press. Moods 'shopDay', 'shopLamp' (evening play),
//            'shopNow' (twist: the same room today, a glass case of boxed modern decks).                       origin (-70000,0,0)
//   street : a Kyoto street of machiya (lattice fronts, tiled eaves, noren, lanterns), hills behind. Moods 'kyoto' (1889 morning),
//            'street60' (1960s dusk: poles + wires, neon TAXI / INSTANT RICE / HOTEL signs, a cab), 'street60n' (night: stalled cab,
//            picket, rice flop), 'streetDawn' (payoff sunrise).                                                  origin (-70000,0,800)
//   office : 1960s toy office/workshop: desk, toy shelves, Yokoi's bench, window. Moods 'office60' (day), 'officeNight' (blue
//            "You see"), 'deskMacro' (generic pocket LCD game on the desk, 1980).                              origin (-70000,0,1600)
//   home   : 1980s game room: CRT TV with a generic block game, a plain grey console + pads, a generic arcade cabinet, sofa, posters.
//            Moods 'homeNight' (hook), 'home85' (warm evening).                                                 origin (-72500,0,0)
// Each set: local frame, floor y = 0, camera side +z. Test flag ?ntview=N (main.js).
import { H, TAU, clamp01, sm, SERIF, SANS, cyl, sph, plane, planeUV, lathe, mesh, nond, lumpGeo, shapeGeo, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';
import { car } from './lb_sets.js';
import { cardArt } from './nt_cast.js';

export const NT_ORIGIN = { shop: [-70000, 0, 0], street: [-70000, 0, 800], office: [-70000, 0, 1600], home: [-72500, 0, 0] };
const GROUP_OF = { shopDay: 'shop', shopLamp: 'shop', shopNow: 'shop', kyoto: 'street', street60: 'street', street60n: 'street', streetDawn: 'street', office60: 'office', officeNight: 'office', deskMacro: 'office', homeNight: 'home', home85: 'home' };
let THREE, PT, M;

// ---------------------------------------------------------------- painters
function cardTex(motif, o = {}) { return (g, w, h) => { g.clearRect(0, 0, w, h); g.save(); g.translate(w / 2, h / 2); cardArt(g, w * 0.96, h * 0.96, motif, o); g.restore(); }; }
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); if (!o.flat) PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 6, 2, 3, 7)); g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08);
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : 0.34 + i * 0.36), w * 0.86, h * (lines.length === 1 ? 0.52 : 0.3), { col: o.col || '#3a2414', font: o.font || SANS })); }; }
function neonTex(s, col) { return (g, w, h) => { g.fillStyle = '#14101c'; g.fillRect(0, 0, w, h); g.save(); g.shadowColor = col; g.shadowBlur = h * 0.25; for (let i = 0; i < 2; i++) txt(g, s, w / 2, h * 0.54, w * 0.86, h * 0.6, { col: '#fff', font: SANS }); g.restore(); g.globalCompositeOperation = 'source-atop'; g.fillStyle = col; g.globalAlpha = 0.55; g.fillRect(0, 0, w, h); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.strokeStyle = col; g.lineWidth = h * 0.05; g.strokeRect(h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12); }; }
function shojiTex(g, w, h) { g.fillStyle = '#f4ead2'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.93 + 0.08 * PT.fbm(u, v, 3, 6, 3, 4)); g.fillStyle = '#5a3a24'; const nx = 4, ny = 6; for (let i = 0; i <= nx; i++) g.fillRect(i * w / nx - (i === nx ? 8 : 0), 0, 8, h); for (let j = 0; j <= ny; j++) g.fillRect(0, j * h / ny - (j === ny ? 8 : 0), w, 8); }
function tatamiTex(g, w, h) { g.fillStyle = '#c8b870'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,100,40,0.35)'; g.lineWidth = 2; for (let y = 0; y < h; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } PT.modulate(g, w, h, (u, v) => 0.88 + 0.16 * PT.fbm(u, v, 2, 8, 3, 6)); g.fillStyle = '#2a3a2a'; g.fillRect(0, 0, 14, h); g.fillRect(w - 14, 0, 14, h); }
function earthTex(g, w, h) { g.fillStyle = '#d8c09a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.18 * PT.fbm(u, v, 4, 4, 3, 5)); grain(g, w, h, 'rgba(110,80,50,1)', 700, 4, 0.25); }
function kawaraTex(g, w, h) { const n = 12; for (let i = 0; i < n; i++) { const x = i * w / n, gr = g.createLinearGradient(x, 0, x + w / n, 0); gr.addColorStop(0, '#2e3240'); gr.addColorStop(0.5, '#6a7080'); gr.addColorStop(1, '#2e3240'); g.fillStyle = gr; g.fillRect(x, 0, w / n, h); } g.fillStyle = 'rgba(20,20,30,0.4)'; for (let y = 0; y < h; y += h / 8) g.fillRect(0, y, w, 4); PT.modulate(g, w, h, (u, v) => 0.85 + 0.25 * PT.fbm(u, v, 4, 4, 3, 9)); }
function latticeTex(g, w, h) { g.fillStyle = '#2a1a12'; g.fillRect(0, 0, w, h); for (let i = 0; i < 24; i++) { const x = i * w / 24; g.fillStyle = i % 2 ? '#6a4228' : '#7a4c2e'; g.fillRect(x + 2, 0, w / 24 - 6, h); } PT.modulate(g, w, h, (u, v) => 0.85 + 0.2 * PT.fbm(u, v, 2, 12, 3, 3)); }
function norenTex(col, mark) { return (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * PT.fbm(u, v, 3, 6, 3, 8)); g.fillStyle = 'rgba(0,0,0,0.35)'; for (const x of [w / 3, 2 * w / 3]) g.fillRect(x - 3, h * 0.25, 6, h);
  g.strokeStyle = '#f2ead6'; g.lineWidth = w * 0.03; g.beginPath(); g.arc(w / 2, h * 0.5, h * 0.22, 0, TAU); g.stroke(); if (mark === 'card') { g.fillStyle = '#f2ead6'; g.fillRect(w / 2 - h * 0.09, h * 0.36, h * 0.18, h * 0.28); } else { g.fillStyle = '#f2ead6'; g.beginPath(); g.arc(w / 2, h * 0.5, h * 0.08, 0, TAU); g.fill(); } }; }
function lanternTex(col) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, col); gr.addColorStop(0.5, '#fff2d0'); gr.addColorStop(1, col); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(60,20,10,0.35)'; for (let y = 0; y < h; y += h / 9) g.fillRect(0, y, w, 3); g.fillStyle = '#1a1010'; g.fillRect(0, 0, w, h * 0.08); g.fillRect(0, h * 0.92, w, h * 0.08); }; }
function stoneTex(g, w, h) { g.fillStyle = '#8a8478'; g.fillRect(0, 0, w, h); const R = PT.rng(9); for (let j = 0; j < 8; j++) for (let i = 0; i < 6; i++) { const x = i * w / 6 + (j % 2) * w / 12, y = j * h / 8; g.fillStyle = `rgba(${150 + R() * 40 | 0},${140 + R() * 36 | 0},${120 + R() * 30 | 0},1)`; g.fillRect(x + 3, y + 3, w / 6 - 6, h / 8 - 6); } PT.modulate(g, w, h, (u, v) => 0.85 + 0.25 * PT.fbm(u, v, 6, 6, 4, 3)); }
function hillsTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.3, 'rgba(0,0,0,0)'); g.clearRect(0, 0, w, h); for (const [y0, c, a] of [[0.4, '#7a8aa8', 0.05], [0.55, '#5a7088', 0.08], [0.7, '#3e5a5a', 0.12]]) { g.fillStyle = c; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * y0 + Math.sin(x * 0.012 + y0 * 9) * h * a + Math.sin(x * 0.031 + y0) * h * a * 0.4); g.lineTo(w, h); g.fill(); } }
function screenTex(k) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#4a7af0'); gr.addColorStop(1, '#9ac0ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const px = w / 32;
  g.fillStyle = '#f4f4f8'; for (const [cx, cy] of [[6, 4], [20, 6]]) { const x = ((cx - k * 0.5) % 32 + 32) % 32 * px; g.fillRect(x, cy * px, 5 * px, px); g.fillRect(x + px, (cy - 1) * px, 3 * px, px); }
  g.fillStyle = '#3aa848'; for (let i = 0; i < 3; i++) { const x = ((i * 13 - k) % 40 + 40) % 40 * px - 4 * px; g.beginPath(); g.ellipse(x + 4 * px, h - 6 * px, 6 * px, 5 * px, 0, Math.PI, TAU); g.fill(); }
  g.fillStyle = '#c86a2a'; g.fillRect(0, h - 4 * px, w, 4 * px); g.fillStyle = '#7a3a1a'; for (let i = 0; i < 16; i++) g.fillRect(((i * 2 - k) % 32 + 32) % 32 * px, h - 4 * px, px * 0.3, 4 * px);
  g.fillStyle = '#e8b030'; for (let i = 0; i < 3; i++) { const x = ((i * 9 + 5 - k) % 32 + 32) % 32 * px; g.fillRect(x, h - 11 * px, 2 * px, 2 * px); }
  const by = h - 4 * px - 3 * px - Math.abs(Math.sin(k * 0.8)) * 4 * px; g.fillStyle = '#e8402a'; g.fillRect(9 * px, by, 2 * px, 3 * px); g.fillStyle = '#ffe0c0'; g.fillRect(9 * px, by - px, 2 * px, px);
  g.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 2); }; }
function arcadeScreenTex(k) { return (g, w, h) => { g.fillStyle = '#0a0a1a'; g.fillRect(0, 0, w, h); const R = PT.rng(5); g.fillStyle = '#fff'; for (let i = 0; i < 40; i++) g.fillRect(R() * w, (R() * h + k * 6) % h, 2, 2); const px = w / 20;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { g.fillStyle = ['#e84a6a', '#4ae8a0', '#e8d04a'][r]; const x = (2 + c * 2.6 + Math.sin(k * 0.6) * 1.2) * px, y = (3 + r * 2) * px; g.fillRect(x, y, 1.6 * px, px); g.fillRect(x + 0.4 * px, y + px, 0.8 * px, 0.5 * px); }
  g.fillStyle = '#5ae0ff'; const sx = (8 + Math.sin(k * 0.4) * 5) * px; g.fillRect(sx, h - 3 * px, 2 * px, px); g.fillRect(sx + 0.7 * px, h - 3.6 * px, 0.6 * px, 0.6 * px); g.fillStyle = 'rgba(0,0,0,0.2)'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 2); }; }
function posterTex(kind) { return (g, w, h) => { const P = { rocket: ['#1a2a5a', '#e8402a'], planet: ['#3a1a5a', '#e8b030'], wave: ['#0a6a8a', '#f4f0e0'] }[kind]; g.fillStyle = P[0]; g.fillRect(0, 0, w, h); g.fillStyle = P[1];
  if (kind === 'rocket') { g.beginPath(); g.moveTo(w / 2, h * 0.15); g.lineTo(w * 0.62, h * 0.6); g.lineTo(w * 0.38, h * 0.6); g.fill(); g.fillStyle = '#f4f0e0'; g.beginPath(); g.arc(w / 2, h * 0.42, w * 0.06, 0, TAU); g.fill(); g.fillStyle = '#e8b030'; g.beginPath(); g.moveTo(w * 0.42, h * 0.6); g.lineTo(w / 2, h * 0.8); g.lineTo(w * 0.58, h * 0.6); g.fill(); }
  if (kind === 'planet') { g.beginPath(); g.arc(w / 2, h * 0.45, w * 0.22, 0, TAU); g.fill(); g.strokeStyle = '#f4f0e0'; g.lineWidth = w * 0.03; g.beginPath(); g.ellipse(w / 2, h * 0.45, w * 0.36, w * 0.08, -0.3, 0, TAU); g.stroke(); }
  if (kind === 'wave') { for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(w * (0.2 + i * 0.2), h * 0.7, w * 0.16, Math.PI, TAU); g.fill(); } }
  const R = PT.rng(kind.length); g.fillStyle = '#fff'; for (let i = 0; i < 30; i++) g.fillRect(R() * w, R() * h * 0.5, 2, 2); g.strokeStyle = '#f4f0e0'; g.lineWidth = w * 0.03; g.strokeRect(w * 0.04, w * 0.04, w * 0.92, h - w * 0.08); }; }
function windowTex(o) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.a); gr.addColorStop(1, o.b); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = o.c; for (let i = 0; i < 9; i++) { const x = i * w / 8 - 20, bh = h * (0.18 + 0.2 * ((i * 37) % 7) / 7); g.fillRect(x, h - bh, w / 9, bh); if (o.lit) { g.fillStyle = o.lit; for (let k = 0; k < 6; k++) g.fillRect(x + 6 + (k % 2) * 16, h - bh + 8 + Math.floor(k / 2) * 18, 8, 8); g.fillStyle = o.c; } }
  if (o.moon) { g.fillStyle = '#f4f0d8'; g.beginPath(); g.arc(w * 0.75, h * 0.22, h * 0.07, 0, TAU); g.fill(); } }; }
function boxTex(lines, o) { return (g, w, h) => { g.fillStyle = o.bg; g.fillRect(0, 0, w, h); g.fillStyle = o.band; g.fillRect(0, 0, w, h * 0.3); lines.forEach((s, i) => txt(g, s, w / 2, h * (0.15 + i * 0.36), w * 0.8, h * 0.18, { col: i ? o.ink : '#fff', font: SANS })); if (o.bowl) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(w / 2, h * 0.7, w * 0.26, h * 0.14, 0, 0, TAU); g.fill(); g.fillStyle = '#c8302a'; g.fillRect(w * 0.24, h * 0.7, w * 0.52, h * 0.12); } PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 5)); }; }
function deckBoxTex(col, motif) { return (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); g.save(); g.translate(w / 2, h * 0.5); cardArt(g, w * 0.5, h * 0.62, motif); g.restore(); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(0, 0, w * 0.12, h); }; }
function calTex(year) { return (g, w, h) => { g.fillStyle = '#f2ece0'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8402a'; g.fillRect(0, 0, w, h * 0.22); txt(g, year, w / 2, h * 0.11, w * 0.6, h * 0.14, { col: '#fff', font: SANS }); g.strokeStyle = 'rgba(40,30,30,0.6)'; g.lineWidth = 2; for (let i = 0; i <= 7; i++) { g.beginPath(); g.moveTo(i * w / 7, h * 0.3); g.lineTo(i * w / 7, h * 0.95); g.stroke(); } for (let j = 0; j <= 5; j++) { g.beginPath(); g.moveTo(0, h * (0.3 + j * 0.13)); g.lineTo(w, h * (0.3 + j * 0.13)); g.stroke(); } }; }
function carpetTex(g, w, h) { g.fillStyle = '#8a5a3a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.88 + 0.16 * PT.fbm(u, v, 8, 8, 3, 2)); g.strokeStyle = 'rgba(232,192,120,0.5)'; g.lineWidth = 8; g.strokeRect(20, 20, w - 40, h - 40); }
function wallpaperTex(g, w, h) { g.fillStyle = '#d8c8a0'; g.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? 'rgba(160,110,60,0.18)' : 'rgba(255,255,255,0.08)'; g.fillRect(i * w / 16, 0, w / 32, h); } PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 5)); }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.plank = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 8, seed: 51 })) }); m.darkwood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#4a2e1e', n: 6, seed: 33 })) });
  m.tatami = vc({ map: T(256, 512, tatamiTex) }); m.earth = vc({ map: T(256, 256, earthTex) }); m.kawara = vc({ map: T(256, 256, kawaraTex) }); m.lattice = vc({ map: T(512, 256, latticeTex) });
  m.shoji = em(T(256, 384, shojiTex), 0x5a4a30); m.shojiN = em(T(256, 384, shojiTex), 0x2a2018);
  m.cards = ['plum', 'pine', 'cherry', 'maple'].map((k) => new THREE.MeshLambertMaterial({ map: T(128, 200, cardTex(k)), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide })); m.cardBack = new THREE.MeshLambertMaterial({ map: T(128, 200, cardTex('plum', { back: 1 })), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide });
  m.noren = em(T(256, 256, norenTex('#2a3a6a', 'card')), 0x101828, { side: THREE.DoubleSide }); m.noren2 = em(T(256, 256, norenTex('#6a2a2a')), 0x180c0c, { side: THREE.DoubleSide }); m.noren3 = em(T(256, 256, norenTex('#3a5a3a')), 0x0c180c, { side: THREE.DoubleSide });
  m.lantern = new THREE.MeshBasicMaterial({ map: T(128, 128, lanternTex('#e86a3a')), fog: true }); m.lantern.color.setScalar(1.25); m.lanternW = new THREE.MeshBasicMaterial({ map: T(128, 128, lanternTex('#f0e0b0')), fog: true }); m.lanternW.color.setScalar(1.2);
  m.stone = vc({ map: T(512, 512, stoneTex) }); m.hills = new THREE.MeshBasicMaterial({ map: T(1024, 256, hillsTex), transparent: true, fog: false, depthWrite: false });
  m.sky = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  m.neonTaxi = new THREE.MeshBasicMaterial({ map: T(512, 160, neonTex('TAXI', '#ffd040')), fog: false }); m.neonRice = new THREE.MeshBasicMaterial({ map: T(768, 160, neonTex('INSTANT RICE', '#ff6a4a')), fog: false }); m.neonHotel = new THREE.MeshBasicMaterial({ map: T(512, 160, neonTex('HOTEL', '#6ae0ff')), fog: false });
  for (const k of ['neonTaxi', 'neonRice', 'neonHotel']) m[k].color.setScalar(1.25);
  m.riceBox = em(T(256, 320, boxTex(['RICE', 'INSTANT'], { bg: '#f2e8d0', band: '#d8302a', ink: '#2a1a14', bowl: 1 })), 0x201810); m.toyBox = em(T(256, 256, boxTex(['TOY', 'FUN'], { bg: '#f0d040', band: '#3a6ad8', ink: '#2a1a14' })), 0x201810);
  m.screens = [0, 1, 2, 3, 4, 5].map((k) => new THREE.MeshBasicMaterial({ map: T(256, 192, screenTex(k * 1.6)), fog: false })); m.screens.forEach((s) => s.color.setScalar(1.15));
  m.arcScreens = [0, 1, 2, 3].map((k) => new THREE.MeshBasicMaterial({ map: T(192, 256, arcadeScreenTex(k)), fog: false })); m.marquee = new THREE.MeshBasicMaterial({ map: T(512, 128, neonTex('ARCADE', '#ff5ad0')), fog: false });
  m.posters = ['rocket', 'planet', 'wave'].map((k) => em(T(256, 360, posterTex(k)), 0x181010));
  m.winNight = new THREE.MeshBasicMaterial({ map: T(512, 320, windowTex({ a: '#0a1030', b: '#2a3a7a', c: '#141a3a', lit: '#ffd890', moon: 1 })), fog: false }); m.winDay = new THREE.MeshBasicMaterial({ map: T(512, 320, windowTex({ a: '#6a9ae0', b: '#d8e4f0', c: '#9aa0b0' })), fog: false });
  m.cal83 = em(T(200, 260, calTex('1983')), 0x202020); m.cal66 = em(T(200, 260, calTex('1966')), 0x202020);
  m.deckBoxes = [['#c8302a', 'plum'], ['#1a1a22', 'pine'], ['#2a4a8a', 'cherry'], ['#c8302a', 'maple'], ['#1a1a22', 'cherry']].map(([c, k]) => em(T(160, 220, deckBoxTex(c, k)), 0x201010));
  m.carpet = vc({ map: T(256, 256, carpetTex) }); m.wallpaper = vc({ map: T(256, 256, wallpaperTex) }); m.wallW = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#e8e4d8'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 5)); }) });
  m.lcd = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xa8b890).multiplyScalar(1.1), fog: false }); m.lcdInk = new THREE.MeshBasicMaterial({ color: 0x2a2a30, fog: false });
  m.glassC = toon({ color: 0xcfe8f0, transparent: true, opacity: 0.25, depthWrite: false, emissive: 0x18303a });
  m.leaf = vc(); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.cloth = vc(); m.plastic = vc({ emissive: 0x0c0c10 });
  m.spot = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2d8).multiplyScalar(2.0), fog: false });
  return m; }

// ---------------------------------------------------------------- shared pieces
const card = (root, x, y, z, rx, ry, rz, k = 0, s = 1) => mesh(root, plane(0.054 * s, 0.087 * s), k < 0 ? M.cardBack : M.cards[k % 4], x, y, z, rx, ry, rz, false);
function lantern(K, root, x, y, z, s = 1, mat = M.lantern) { mesh(root, cyl(0.16 * s, 0.16 * s, 0.4 * s, 16), mat, x, y, z, 0, 0, 0, false); K.put(M.paint, cyl(0.1 * s, 0.12 * s, 0.05 * s, 12), x, y + 0.22 * s, z, 0, 0, 0, 1, 1, 1, 0x1a1010); K.put(M.paint, cyl(0.12 * s, 0.1 * s, 0.05 * s, 12), x, y - 0.22 * s, z, 0, 0, 0, 1, 1, 1, 0x1a1010); }
function pine(K, x, z, s, R) { K.beam(M.bark, [x, 0, z], [x + 0.3 * s, 2.2 * s, z], 0.12 * s, 0x5a4030, true, 6); for (let i = 0; i < 4; i++) K.put(M.leaf, lumpGeo(i + 3, 1, 0.25), x + (R() - 0.3) * 1.4 * s, (1.6 + i * 0.5) * s, z + (R() - 0.5) * 0.8 * s, 0, R() * 6, 0, 0.9 * s, 0.32 * s, 0.7 * s, [0x2f5a32, 0x3a6a3a][i % 2]); }
// machiya front facing +x (s = 1, on the left side of the road) or -x (s = -1). local x across, z along the road
function machiya(K, root, x, z0, len, s, R, o = {}) { const HT1 = 2.9, HT2 = 5.0, D = 6, X0 = x, X1 = x - s * D;
  K.box(M.earth, Math.min(X0, X1), Math.max(X0, X1), 0, HT2, z0 - len, z0, 0xffffff, 0.03);
  K.box(M.lattice, X0 - 0.06, X0 + 0.06, 0.25, HT1 - 0.3, z0 - len + 0.2, z0 - 0.2, 0xffffff, 0.01);
  for (const zz of [z0 - 0.1, z0 - len + 0.1]) K.box(M.darkwood, X0 - 0.12, X0 + 0.12, 0, HT2, zz - 0.12, zz + 0.12, 0xffffff, 0.02);
  K.box(M.darkwood, X0 - 0.1, X0 + 0.1, HT1 - 0.32, HT1 - 0.1, z0 - len, z0, 0xffffff, 0.02);
  // lower eave (hisashi) + upper roof, both sloping toward the road
  K.put(M.kawara, new THREE.BoxGeometry(1.5, 0.1, len + 0.3), X0 + s * 0.55, HT1 + 0.1, z0 - len / 2, 0, 0, s * 0.32, 1, 1, 1, 0xffffff);
  K.put(M.kawara, new THREE.BoxGeometry(3.6, 0.14, len + 0.4), X0 - s * 0.9, HT2 + 0.45, z0 - len / 2, 0, 0, s * 0.38, 1, 1, 1, 0xffffff);
  K.box(M.paint, X0 + s * 1.15 - 0.06, X0 + s * 1.15 + 0.06, HT1 - 0.15, HT1 + 0.0, z0 - len - 0.15, z0 + 0.15, 0x3a3e4a, 0.02);
  // upper mushiko slit windows
  for (let i = 0; i < 3; i++) { const zz = z0 - len * (0.2 + i * 0.3); K.box(M.paint, X0 - 0.03, X0 + 0.05, HT1 + 0.75, HT1 + 1.35, zz - 0.45, zz + 0.45, 0x2a1a14, 0.01); for (let k = 0; k < 6; k++) K.box(M.earth, X0 - 0.02, X0 + 0.07, HT1 + 0.75, HT1 + 1.35, zz - 0.42 + k * 0.17, zz - 0.36 + k * 0.17, 0xe8d8b8, 0.005); }
  if (o.noren) { const nm = mesh(root, plane(1.8, 0.9), o.noren, X0 + s * 0.14, 2.05, z0 - (o.door ?? len / 2), 0, s * Math.PI / 2, 0, false); nm.castShadow = true; }
  if (o.lamp) { lantern(K, root, X0 + s * 0.55, 2.2, z0 - (o.door ?? len / 2) + 1.2, 1, o.lampMat || M.lantern); K.beam(M.paint, [X0, 2.55, z0 - (o.door ?? len / 2) + 1.2], [X0 + s * 0.55, 2.55, z0 - (o.door ?? len / 2) + 1.2], 0.015, 0x1a1010); }
  if (o.bench) K.box(M.plank, X0 + s * 0.15, X0 + s * 0.65, 0.4, 0.46, z0 - len + 0.6, z0 - len + 2.2, 0xffffff, 0.02);
}

// ================================================================= SHOP (1889 card workshop)
function buildShop(root) { const R = PT.rng(1889), K = new Kit(), X = 5.5, ZB = -4.2, HT = 3.4;
  mesh(root, planeUV(14, 12, 3, 3), M.plank, 0, 0, 1, -Math.PI / 2, 0, 0, false);
  // raised tatami platform (back half), shoji back wall, earthen side walls, ceiling beams
  K.box(M.darkwood, -X, X, 0, 0.32, ZB, -1.2, 0xffffff, 0.02); for (let i = 0; i < 6; i++) mesh(root, planeUV(1.8, 2.9, 1, 1), M.tatami, -X + 0.95 + i * 1.84, 0.325, (ZB - 1.2) / 2, -Math.PI / 2, 0, i % 2 ? Math.PI / 2 * 0 : 0, false);
  const shojis = []; for (let i = 0; i < 6; i++) { const sx = -X + 0.92 + i * 1.84; shojis.push(mesh(root, plane(1.76, 2.6), M.shoji, sx, 1.62, ZB + 0.02, 0, 0, 0, false)); K.box(M.darkwood, sx + 0.88, sx + 0.96, 0.32, 3.0, ZB, ZB + 0.08, 0xffffff, 0.01); }
  K.box(M.darkwood, -X, X, 2.92, 3.08, ZB, ZB + 0.12, 0xffffff, 0.01); K.box(M.earth, -X, X, 3.08, HT, ZB - 0.1, ZB, 0xffffff, 0.01);
  for (const s of [-1, 1]) K.box(M.earth, s > 0 ? X : -X - 0.25, s > 0 ? X + 0.25 : -X, 0, HT, ZB, 4, 0xffffff, 0.02);
  for (const s of [-1, 1]) for (const zz of [ZB + 0.1, -1.2, 1.6]) K.box(M.darkwood, s * X - 0.12, s * X + 0.12, 0, HT, zz - 0.12, zz + 0.12, 0xffffff, 0.02);
  mesh(root, plane(2 * X, 9), H.toon({ color: 0x3a2618, side: THREE.DoubleSide }), 0, HT, 0, Math.PI / 2, 0, 0, false);
  for (let i = 0; i < 4; i++) K.box(M.darkwood, -X, X, HT - 0.28, HT - 0.06, -3.4 + i * 2.2, -3.2 + i * 2.2, 0xffffff, 0.02);
  // card-maker's low bench on the platform (left): stacks of cards, paint dishes, brushes, wood blocks, a hand press
  const BX = -2.2, BZ = -2.4, BY = 1.12; K.box(M.plank, BX - 1.1, BX + 1.1, BY - 0.06, BY, BZ - 0.45, BZ + 0.45, 0xb07a4a, 0.02); for (const a of [-1, 1]) for (const b of [-1, 1]) K.box(M.plank, BX + a * 1.0 - 0.05, BX + a * 1.0 + 0.05, 0.32, BY - 0.06, BZ + b * 0.38 - 0.05, BZ + b * 0.38 + 0.05, 0x6a4028, 0.01);
  for (let i = 0; i < 5; i++) { const x = BX - 0.8 + i * 0.16; K.box(M.paint, x - 0.035, x + 0.035, BY, BY + 0.02 + (i % 3) * 0.03 + 0.04, BZ + 0.18 - 0.05, BZ + 0.18 + 0.05, 0xf2ead6, 0.004); }
  for (let i = 0; i < 4; i++) { const x = BX + 0.1 + i * 0.13; K.put(M.paint, cyl(0.05, 0.04, 0.025, 14), x, BY + 0.012, BZ - 0.22, 0, 0, 0, 1, 1, 1, 0xe8e0d0); K.put(M.paint, cyl(0.04, 0.04, 0.006, 14), x, BY + 0.026, BZ - 0.22, 0, 0, 0, 1, 1, 1, [0xc8302a, 0x1a1a22, 0x2f6a3a, 0xe8b030][i]); }
  for (let i = 0; i < 3; i++) K.beam(M.plank, [BX + 0.7, BY + 0.01, BZ - 0.1 + i * 0.06], [BX + 0.95, BY + 0.02, BZ - 0.05 + i * 0.06], 0.008, 0xc8a060);
  K.box(M.darkwood, BX - 0.95, BX - 0.6, BY, BY + 0.08, BZ - 0.32, BZ - 0.05, 0xffffff, 0.01);
  const benchCards = []; for (let i = 0; i < 12; i++) benchCards.push(card(root, BX - 0.5 + (i % 6) * 0.13, BY + 0.004 + Math.floor(i / 6) * 0.0005, BZ + 0.0 + Math.floor(i / 6) * 0.13, -Math.PI / 2, 0, (R() - 0.5) * 0.2, i));
  // the hand press (back right on the platform)
  K.at(2.8, 0.32, -3.4, -0.3, () => { K.box(M.darkwood, -0.5, 0.5, 0, 0.75, -0.35, 0.35, 0xffffff, 0.03); for (const s of [-1, 1]) K.box(M.darkwood, s * 0.45 - 0.07, s * 0.45 + 0.07, 0.75, 1.75, -0.07, 0.07, 0xffffff, 0.02); K.box(M.darkwood, -0.55, 0.55, 1.7, 1.86, -0.12, 0.12, 0xffffff, 0.02); K.beam(M.metal, [0, 1.86, 0], [0, 1.1, 0], 0.04, 0x5a5a64, true, 8); K.box(M.plank, -0.36, 0.36, 1.02, 1.1, -0.26, 0.26, 0xb07a4a, 0.02); K.beam(M.plank, [0, 1.8, 0], [0.55, 2.05, 0.1], 0.03, 0x8a5a38, true, 6); });
  // drying lines with cards (above the platform), shelves with paper stacks (right wall)
  const lineCards = []; for (let r = 0; r < 2; r++) { const z = -3.5 + r * 0.9, y = 2.55 - r * 0.12; K.beam(M.paint, [-X + 0.2, y, z], [X - 0.2, y, z], 0.006, 0x3a2a20, true, 4); for (let i = 0; i < 26; i++) { const x = -X + 0.6 + i * 0.4 + r * 0.2; lineCards.push(card(root, x, y - 0.07, z + 0.01, 0, 0, (R() - 0.5) * 0.1, i + r, 1.3)); K.put(M.paint, new THREE.BoxGeometry(0.012, 0.03, 0.01), x, y - 0.01, z + 0.012, 0, 0, 0, 1, 1, 1, 0xc8a060); } }
  for (let j = 0; j < 3; j++) { K.box(M.plank, X - 0.6, X, 0.9 + j * 0.6, 0.94 + j * 0.6, -0.8, 1.4, 0x8a5a38, 0.01); for (let i = 0; i < 6; i++) K.box(M.paint, X - 0.5, X - 0.12, 0.94 + j * 0.6, 0.94 + j * 0.6 + 0.06 + R() * 0.2, -0.65 + i * 0.34, -0.4 + i * 0.34, [0xf2ead6, 0xe8dcc0, 0xd8c8a8][i % 3], 0.01); }
  // players' low table (front, on the floor) with cards laid out, cushions; sake bottle; tea kettle on a brazier
  const TX = 0.9, TZ = 0.2; K.box(M.darkwood, TX - 0.75, TX + 0.75, 0.56, 0.62, TZ - 0.5, TZ + 0.5, 0xffffff, 0.03); for (const a of [-1, 1]) for (const b of [-1, 1]) K.box(M.darkwood, TX + a * 0.65 - 0.05, TX + a * 0.65 + 0.05, 0, 0.56, TZ + b * 0.4 - 0.05, TZ + b * 0.4 + 0.05, 0xffffff, 0.01);
  const tableCards = []; for (let i = 0; i < 10; i++) tableCards.push(card(root, TX - 0.5 + (i % 5) * 0.25, 0.622, TZ - 0.18 + Math.floor(i / 5) * 0.32, -Math.PI / 2, 0, (R() - 0.5) * 0.5, i + 2, 1.4));
  for (const [x, z] of [[TX - 1.05, TZ], [TX + 1.05, TZ], [TX, TZ - 0.85]]) K.box(M.cloth, x - 0.28, x + 0.28, 0, 0.4, z - 0.28, z + 0.28, 0x8a2a3a, 0.06);
  K.put(M.paint, cyl(0.04, 0.06, 0.2, 12), TX + 0.55, 0.72, TZ + 0.3, 0, 0, 0, 1, 1, 1, 0xe8e0d0);
  K.at(-3.6, 0, 0.9, 0, () => { K.put(M.paint, cyl(0.28, 0.24, 0.35, 16), 0, 0.17, 0, 0, 0, 0, 1, 1, 1, 0x6a5a4a); K.put(M.metal, sph(0.17, 14, 10), 0, 0.48, 0, 0, 0, 0, 1, 0.8, 1, 0x2a2a30); K.beam(M.metal, [0.15, 0.5, 0], [0.28, 0.6, 0], 0.025, 0x2a2a30, true, 6); });
  // the modern display (twist only): glass case + boxed decks + a wall shelf of decks
  const now = new THREE.Group(); root.add(now); { const KN = new Kit(); KN.box(M.darkwood, -1.0, 1.0, 0, 0.9, -0.6, 0.0, 0xffffff, 0.03); KN.box(M.glassC, -0.98, 0.98, 0.9, 1.35, -0.58, -0.02, 0xffffff, 0.01); KN.build(now); now.position.set(2.6, 0, 0.5);
    for (let i = 0; i < 5; i++) mesh(now, new THREE.BoxGeometry(0.18, 0.26, 0.06), M.deckBoxes[i], -0.7 + i * 0.35, 1.03, -0.3, -0.2, 0, 0, false); for (let i = 0; i < 6; i++) mesh(now, plane(0.12, 0.19), M.cards[i % 4], -0.75 + i * 0.3, 0.905, -0.15, -Math.PI / 2 + 0.3, 0, (i - 2.5) * 0.08, false); }
  now.visible = false;
  // lanterns hanging from the beams
  const lamps = []; for (const [x, z] of [[-2.2, -2.0], [0.9, -0.2], [3.2, -2.6]]) { K.beam(M.paint, [x, HT - 0.1, z], [x, 2.55, z], 0.008, 0x1a1010, true, 4); lantern(K, root, x, 2.3, z, 0.9, M.lanternW); lamps.push(glowAt(root, [x, 2.3, z], 1.3, '#ffc070', 0.45)); }
  const shaft = shaftAt(root, [-1.5, 1.4, ZB + 1.3], 3.2, 3.2, 0.0, 0.0, 0.12, 0xfff0d0);
  K.build(root, 0);
  const dust = motes(root, 60, [-4, 4, 0.4, 2.8, -3.8, 1.5], 41, 0.011);
  return { shojis, lamps, shaft, dust, now, lineCards, benchCards, tableCards, BX, BY, BZ, TX, TZ };
}

// ================================================================= STREET (Kyoto)
function buildStreet(root) { const R = PT.rng(1890), K = new Kit();
  mesh(root, planeUV(6.4, 120, 2, 30), M.stone, 0, 0.005, -40, -Math.PI / 2, 0, 0, false);
  mesh(root, planeUV(60, 160, 8, 20), H.toon({ color: 0x8a7a62 }), 0, -0.01, -50, -Math.PI / 2, 0, 0, false);
  for (const s of [-1, 1]) K.box(M.stone, s * 3.2 - 0.3, s * 3.2 + 0.3, 0, 0.08, -100, 12, 0x9a948a, 0.01);
  // rows of machiya; ours is the first on the left (z 4..-3)
  const NOR = [M.noren2, M.noren3, M.noren2, M.noren3];
  machiya(K, root, -3.5, 4, 7, 1, R, { noren: M.noren, lamp: true, door: 3.2 });
  for (let i = 1; i < 9; i++) machiya(K, root, -3.5, 4 - i * 6.6, 6.4, 1, R, { noren: i % 2 ? NOR[i % 4] : null, lamp: i % 3 === 1, bench: i % 4 === 2 });
  for (let i = 0; i < 9; i++) machiya(K, root, 3.5, 6 - i * 6.6, 6.4, -1, R, { noren: i % 2 === 0 ? NOR[(i + 1) % 4] : null, lamp: i % 3 === 0, lampMat: M.lanternW, bench: i % 4 === 1 });
  // our shop's hanging signboard: a big painted card + a stack of cards in the window
  const sign = mesh(root, plane(0.7, 1.1), M.cards[0], -3.5 + 1.0, 3.6, 0.6, 0, Math.PI / 2, 0, false); K.box(M.darkwood, -3.5 + 0.1, -3.5 + 1.2, 4.2, 4.28, 0.55, 0.65, 0xffffff, 0.01); K.beam(M.paint, [-2.5, 4.2, 0.6], [-2.5, 4.15, 0.6], 0.01, 0x1a1010);
  // stone lanterns, pines, buckets, a cart, potted plants
  for (const [x, z] of [[2.6, -12], [-2.7, -26]]) K.at(x, 0, z, 0, () => { K.box(M.stone, -0.25, 0.25, 0, 0.6, -0.25, 0.25, 0xb0a898, 0.03); K.box(M.stone, -0.3, 0.3, 0.6, 0.95, -0.3, 0.3, 0xb0a898, 0.03); K.put(M.kawara, new THREE.ConeGeometry(0.5, 0.3, 4), 0, 1.1, 0, 0, Math.PI / 4, 0, 1, 1, 1, 0x8a8478); });
  pine(K, 2.9, -36, 1.6, R); pine(K, -2.9, -48, 1.4, R); pine(K, -2.6, -60, 1.5, R);
  for (const [x, z] of [[-2.9, -1.6], [-2.9, -1.2], [2.9, -5.5]]) K.put(M.plank, cyl(0.18, 0.15, 0.3, 12), x, 0.15, z, 0, 0, 0, 1, 1, 1, 0x8a5a38);
  K.at(1.8, 0, -8, 0.3, () => { K.box(M.plank, -0.9, 0.9, 0.55, 0.65, -0.5, 0.5, 0x8a6040, 0.02); for (const s of [-1, 1]) K.put(M.plank, new THREE.TorusGeometry(0.42, 0.05, 6, 18), 0, 0.45, s * 0.56, 0, 0, 0, 1, 1, 1, 0x5a3a24); K.beam(M.plank, [0.9, 0.6, -0.3], [2.2, 0.35, -0.3], 0.04, 0x7a5030); K.beam(M.plank, [0.9, 0.6, 0.3], [2.2, 0.35, 0.3], 0.04, 0x7a5030); });
  for (const [x, z] of [[-2.8, 2.6], [2.8, -2.0], [-2.8, -9]]) { K.put(M.paint, cyl(0.2, 0.16, 0.36, 12), x, 0.18, z, 0, 0, 0, 1, 1, 1, 0x6a4a3a); K.put(M.leaf, lumpGeo(Math.round(z), 1, 0.3), x, 0.55, z, 0, 0, 0, 0.32, 0.3, 0.32, 0x3a7a3a); }
  K.build(root, 40);
  const hills = mesh(root, plane(260, 60), M.hills, 0, 14, -110, 0, 0, 0, false); hills.renderOrder = -1;
  const sky = mesh(root, plane(400, 160), M.sky, 0, 40, -140, 0, 0, 0, false);
  // 1960s overlay: poles + wires, neon signs, rice-shop stack, a cab, picket group spot
  const s60 = new THREE.Group(); root.add(s60); { const KS = new Kit();
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const z = 6 - i * 11 - (s > 0 ? 3 : 0); KS.beam(M.plank, [s * 2.95, 0, z], [s * 2.95, 7.2, z], 0.1, 0x5a4a3a, true, 8); KS.box(M.plank, s * 2.95 - 0.5, s * 2.95 + 0.5, 6.8, 6.88, z - 0.05, z + 0.05, 0x4a3a2a, 0.01);
      if (i < 5) for (const d of [-0.4, 0.0, 0.4]) { const z2 = z - 11, n = 8; for (let k = 0; k < n; k++) { const t0 = k / n, t1 = (k + 1) / n, sg = (t) => 0.5 * Math.sin(Math.PI * t); KS.beam(M.paint, [s * 2.95 + d, 6.86 - sg(t0), z + (z2 - z) * t0], [s * 2.95 + d, 6.86 - sg(t1), z + (z2 - z) * t1], 0.008, 0x1a1a22, true, 3); } } }
    for (let i = 0; i < 8; i++) KS.box(M.riceBox, 2.7 - (i % 2) * 0.32, 3.0 - (i % 2) * 0.32, 0.0 + Math.floor(i / 4) * 0.36, 0.34 + Math.floor(i / 4) * 0.36, -2.2 - (i % 4) * 0.34, -1.9 - (i % 4) * 0.34, 0xffffff, 0.01);
    KS.build(s60); }
  const neon = [mesh(s60, plane(1.8, 0.56), M.neonTaxi, -2.05, 3.5, -4.5, 0, Math.PI / 2, 0, false), mesh(s60, plane(2.6, 0.54), M.neonRice, 2.05, 3.55, -2.6, 0, -Math.PI / 2, 0, false), mesh(s60, plane(1.8, 0.56), M.neonHotel, 2.05, 4.2, -15, 0, -Math.PI / 2, 0, false)];
  const neonGlows = [glowAt(s60, [-1.95, 3.5, -4.5], 3.0, '#ffd040', 0.35), glowAt(s60, [1.95, 3.55, -2.6], 3.6, '#ff6a4a', 0.35), glowAt(s60, [1.95, 4.2, -15], 3.0, '#6ae0ff', 0.35)];
  const cab = car('gt350', 0x2a3a2a); cab.scale.setScalar(0.92); cab.position.set(-1.0, 0, -6); cab.rotation.y = -Math.PI / 2; s60.add(cab);
  { const KC = new Kit(); KC.box(M.paint, -0.22, 0.22, 1.18, 1.36, -0.12, 0.12, 0xf0d040, 0.03); KC.build(cab); const tl = mesh(cab, plane(0.36, 0.12), M.neonTaxi, 0, 1.27, 0.125, 0, 0, 0, false); const tl2 = mesh(cab, plane(0.36, 0.12), M.neonTaxi, 0, 1.27, -0.125, 0, Math.PI, 0, false);
    for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 1.7), H.toon({ color: 0xe8c040 })); st.position.set(0, 0.62, s * 0.84); cab.add(st); } }
  const lampGlows = []; root.traverse((o) => { if (o.isMesh && (o.material === M.lantern || o.material === M.lanternW)) lampGlows.push(glowAt(root, o.position.toArray(), 1.1, o.material === M.lantern ? '#ff9a50' : '#ffd890', 0.0)); });
  const dust = motes(root, 50, [-3, 3, 0.4, 3.5, -10, 4], 43, 0.013);
  return { s60, neon, neonGlows, cab, sign, hills, sky, lampGlows, dust };
}

// ================================================================= OFFICE (1960s toys)
function buildOffice(root) { const R = PT.rng(1966), K = new Kit(), X = 4.6, ZB = -3.6, HT = 3.2;
  mesh(root, planeUV(10, 9, 3, 3), M.plank, 0, 0, 0.5, -Math.PI / 2, 0, 0, false);
  K.box(M.wallW, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(M.wallW, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 5, 0xffffff, 0.01);
  K.box(M.paint, -X, X, 0, 1.0, ZB, ZB + 0.04, 0x6a8a7a, 0.01); for (const s of [-1, 1]) K.box(M.paint, s > 0 ? X - 0.04 : -X, s > 0 ? X : -X + 0.04, 0, 1.0, ZB, 5, 0x6a8a7a, 0.01);
  mesh(root, plane(2 * X, 9), H.toon({ color: 0xd8d4c8, side: THREE.DoubleSide }), 0, HT, 0.5, Math.PI / 2, 0, 0, false);
  const win = mesh(root, plane(2.6, 1.5), M.winDay, 1.8, 1.95, ZB + 0.02, 0, 0, 0, false); K.box(M.plank, 0.45, 3.15, 1.15, 1.22, ZB, ZB + 0.12, 0xe8e0d0, 0.01); for (const x of [0.5, 1.8, 3.1]) K.box(M.plank, x - 0.04, x + 0.04, 1.2, 2.72, ZB, ZB + 0.08, 0xe8e0d0, 0.005); K.box(M.plank, 0.45, 3.15, 2.7, 2.76, ZB, ZB + 0.08, 0xe8e0d0, 0.005);
  const cal = mesh(root, plane(0.45, 0.58), M.cal66, -0.4, 2.1, ZB + 0.02, 0, 0, 0.02, false);
  // toy shelves (left wall area)
  for (let j = 0; j < 4; j++) { K.box(M.plank, -X + 0.1, -1.6, 0.5 + j * 0.55, 0.54 + j * 0.55, ZB + 0.05, ZB + 0.5, 0x8a5a38, 0.01);
    for (let i = 0; i < 5; i++) { const x = -X + 0.45 + i * 0.52, y = 0.54 + j * 0.55, k = (i + j) % 5;
      if (k === 0) K.box(M.toyBox, x - 0.18, x + 0.18, y, y + 0.36, ZB + 0.12, ZB + 0.42, 0xffffff, 0.01);
      else if (k === 1) K.put(M.paint, sph(0.12, 14, 10), x, y + 0.12, ZB + 0.28, 0, 0, 0, 1, 1, 1, [0xe8402a, 0x3a6ad8, 0xe8c040][j % 3]);
      else if (k === 2) for (let b = 0; b < 3; b++) K.box(M.paint, x - 0.1 + b * 0.04, x + 0.0 + b * 0.04, y + b * 0.1, y + 0.1 + b * 0.1, ZB + 0.2, ZB + 0.32, [0xe8402a, 0x3ab858, 0x3a6ad8][b], 0.01);
      else if (k === 3) { K.put(M.paint, cyl(0.12, 0.12, 0.08, 16), x, y + 0.04, ZB + 0.28, 0, 0, 0, 1, 1, 1, 0xe8c040); K.put(M.paint, cyl(0.02, 0.05, 0.2, 10), x, y + 0.18, ZB + 0.28, 0, 0, 0, 1, 1, 1, 0xe8402a); }
      else for (let c = 0; c < 4; c++) K.box(M.paint, x - 0.15 + c * 0.075, x - 0.09 + c * 0.075, y, y + 0.26, ZB + 0.15, ZB + 0.38, [0xc8302a, 0x1a1a22, 0x2a4a8a, 0xe8dcc0][c], 0.005); } }
  // desk (centre-left) with phone, papers, lamp; Yokoi's workbench (right) with parts, springs, a cardboard box of grabbers
  const DZ = -1.4, DX = -0.6; K.box(M.plank, DX - 1.2, DX + 1.2, 0.74, 0.8, DZ - 0.55, DZ + 0.55, 0x5a3420, 0.03); for (const s of [-1, 1]) K.box(M.plank, DX + s * 0.9 - 0.3, DX + s * 0.9 + 0.3, 0, 0.74, DZ - 0.5, DZ + 0.5, 0x4a2a18, 0.02);
  K.at(DX + 0.85, 0.8, DZ - 0.15, -0.4, () => { K.box(M.paint, -0.12, 0.12, 0, 0.08, -0.1, 0.1, 0x14141a, 0.03); K.put(M.paint, new THREE.TorusGeometry(0.1, 0.025, 6, 14, Math.PI), 0, 0.14, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0x14141a); });
  for (let i = 0; i < 3; i++) K.box(M.paint, DX - 0.5 + i * 0.05, DX - 0.1 + i * 0.05, 0.8 + i * 0.006, 0.806 + i * 0.006, DZ - 0.2 + i * 0.02, DZ + 0.1 + i * 0.02, 0xf2ece0, 0.002);
  K.at(DX - 0.95, 0.8, DZ - 0.3, 0.3, () => { K.put(M.brass, cyl(0.08, 0.1, 0.03, 12), 0, 0.015, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); K.beam(M.brass, [0, 0, 0], [0.05, 0.4, 0], 0.012, 0xc8a050, true, 6); K.put(M.paint, new THREE.ConeGeometry(0.12, 0.14, 14, 1, true), 0.1, 0.42, 0, 0, 0, 0.4, 1, 1, 1, 0x2a5a3a); });
  // generic pocket LCD game on the desk (front-right of the papers) + its little moving blocks
  const hh = new THREE.Group(); hh.position.set(DX + 0.25, 0.805, DZ + 0.28); hh.rotation.y = -0.15; root.add(hh); { const KH = new Kit(); KH.box(M.plastic, -0.056, 0.056, 0, 0.012, -0.036, 0.036, 0xc8c0a8, 0.004); KH.box(M.plastic, -0.032, 0.032, 0.012, 0.013, -0.024, 0.02, 0x2a2a30, 0.001); for (const s of [-1, 1]) KH.put(M.paint, cyl(0.006, 0.006, 0.004, 10), s * 0.044, 0.014, 0.012, 0, 0, 0, 1, 1, 1, 0xc8302a); KH.build(hh); }
  const lcd = mesh(hh, plane(0.058, 0.04), M.lcd, 0, 0.0135, -0.002, -Math.PI / 2, 0, 0, false); const lcdBlocks = [0, 1, 2].map(() => mesh(hh, plane(0.005, 0.005), M.lcdInk, 0, 0.0138, 0, -Math.PI / 2, 0, 0, false)); const lcdPaddle = mesh(hh, plane(0.012, 0.003), M.lcdInk, 0, 0.0138, 0.014, -Math.PI / 2, 0, 0, false);
  K.at(2.6, 0, -2.5, -0.2, () => { K.box(M.plank, -1.0, 1.0, 0.86, 0.92, -0.45, 0.45, 0x8a6a48, 0.02); for (const a of [-0.9, 0.9]) for (const b of [-0.38, 0.38]) K.box(M.metal, a - 0.03, a + 0.03, 0, 0.86, b - 0.03, b + 0.03, 0x3a3a44, 0.01);
    for (let i = 0; i < 5; i++) K.put(M.chrome, new THREE.TorusGeometry(0.03, 0.008, 6, 12), -0.6 + i * 0.1, 0.93, 0.2, Math.PI / 2, 0, 0, 1, 1, 1, 0xb8bcc6);
    for (let i = 0; i < 4; i++) K.beam(M.paint, [0.1 + i * 0.05, 0.93, -0.1], [0.55 + i * 0.05, 0.93, 0.05], 0.008, 0xe8e4dc, true, 4);
    K.box(M.toyBox, 0.5, 0.9, 0.92, 1.22, -0.35, -0.05, 0xffffff, 0.01); K.put(M.metal, cyl(0.05, 0.08, 0.1, 10), -0.75, 0.97, -0.25, 0, 0, 0, 1, 1, 1, 0x3a3a44); });
  for (let i = 0; i < 6; i++) K.box(M.toyBox, 3.6 - (i % 3) * 0.42, 3.98 - (i % 3) * 0.42, Math.floor(i / 3) * 0.4, 0.38 + Math.floor(i / 3) * 0.4, 0.6, 1.0, 0xffffff, 0.01);
  mesh(root, planeUV(3.0, 2.2, 1, 1), H.toon({ color: 0x5a6a5a }), -0.4, 0.005, 0.1, -Math.PI / 2, 0, 0, false);
  K.at(-3.6, 0, 1.0, 0.4, () => { K.put(M.paint, cyl(0.22, 0.18, 0.5, 12), 0, 0.25, 0, 0, 0, 0, 1, 1, 1, 0x8a4a2a); for (let i = 0; i < 6; i++) K.put(M.leaf, lumpGeo(i + 2, 1, 0.3), (R() - 0.5) * 0.4, 0.8 + R() * 0.6, (R() - 0.5) * 0.4, 0, R() * 6, 0, 0.3, 0.32, 0.3, 0x3a7a3a); });
  K.build(root, 0);
  const lampG = glowAt(root, [DX - 0.85, 1.2, DZ - 0.3], 1.0, '#ffc070', 0.5);
  const shaft = shaftAt(root, [1.8, 1.4, ZB + 1.4], 2.4, 3.6, 0.25, 0.55, 0.16, 0xfff0d0);
  const dust = motes(root, 50, [-1, 3, 0.4, 2.6, -3, 0], 53, 0.01);
  return { win, lampG, shaft, dust, hh, lcdBlocks, lcdPaddle, DX, DZ };
}

// ================================================================= HOME (1980s game room)
function buildHome(root) { const R = PT.rng(1985), K = new Kit(), X = 4.2, ZB = -3.4, HT = 2.8;
  mesh(root, planeUV(10, 9, 2, 2), M.plank, 0, 0, 0.5, -Math.PI / 2, 0, 0, false); mesh(root, planeUV(4.6, 3.4, 1, 1), M.carpet, 0, 0.006, -0.6, -Math.PI / 2, 0, 0, false);
  K.box(M.wallpaper, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(M.wallpaper, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 5, 0xffffff, 0.01);
  K.box(M.plank, -X, X, 0, 0.12, ZB, ZB + 0.03, 0x5a3a24, 0.01); mesh(root, plane(2 * X, 9), H.toon({ color: 0xe8dcc8, side: THREE.DoubleSide }), 0, HT, 0.5, Math.PI / 2, 0, 0, false);
  // window (left back), posters, shelf of grey cartridges
  const win = mesh(root, plane(1.5, 1.2), M.winNight, -2.6, 1.7, ZB + 0.02, 0, 0, 0, false); K.box(M.plank, -3.4, -1.8, 1.05, 1.1, ZB, ZB + 0.12, 0xf2ece0, 0.01); K.box(M.plank, -2.64, -2.56, 1.1, 2.3, ZB, ZB + 0.06, 0xf2ece0, 0.005);
  for (const s of [-1, 1]) mesh(root, plane(0.5, 1.4), H.toon({ color: 0x8a3a3a, side: THREE.DoubleSide }), -2.6 + s * 0.95, 1.7, ZB + 0.06, 0, 0, 0, false);
  M.posters.forEach((m, i) => mesh(root, plane(0.55, 0.78), m, -0.9 + i * 0.75, 2.0, ZB + 0.02, 0, 0, (i - 1) * 0.03, false));
  K.box(M.plank, 1.6, 2.8, 1.5, 1.54, ZB, ZB + 0.24, 0x6a4028, 0.01); for (let i = 0; i < 9; i++) K.box(M.plastic, 1.68 + i * 0.12, 1.76 + i * 0.12, 1.54, 1.54 + 0.2, ZB + 0.04, ZB + 0.18, 0x8a8a92, 0.006);
  const cal = mesh(root, plane(0.36, 0.46), M.cal83, 3.0, 2.0, ZB + 0.02, 0, 0, 0.02, false);
  // TV stand + CRT (back centre)
  const TVX = 0, TVZ = ZB + 0.55; K.box(M.darkwood, TVX - 0.8, TVX + 0.8, 0, 0.5, TVZ - 0.35, TVZ + 0.35, 0xffffff, 0.02); K.box(M.darkwood, TVX - 0.7, TVX + 0.7, 0.08, 0.1, TVZ - 0.3, TVZ + 0.36, 0xffffff, 0.01);
  K.box(M.plank, TVX - 0.55, TVX + 0.55, 0.5, 1.28, TVZ - 0.32, TVZ + 0.3, 0x6a4028, 0.06); K.box(M.plastic, TVX - 0.48, TVX + 0.3, 0.58, 1.2, TVZ + 0.28, TVZ + 0.34, 0x1a1a20, 0.04);
  for (let i = 0; i < 2; i++) K.put(M.chrome, cyl(0.035, 0.035, 0.03, 12), TVX + 0.42, 1.05 - i * 0.12, TVZ + 0.31, Math.PI / 2, 0, 0, 1, 1, 1, 0xc8c8d0); for (let i = 0; i < 5; i++) K.box(M.plastic, TVX + 0.36, TVX + 0.5, 0.62 + i * 0.04, 0.635 + i * 0.04, TVZ + 0.3, TVZ + 0.32, 0x2a2a30, 0.002);
  for (const s of [-1, 1]) K.beam(M.chrome, [TVX - 0.1, 1.28, TVZ], [TVX - 0.1 + s * 0.3, 1.75, TVZ - 0.1], 0.008, 0xc8c8d0, true, 4);
  const screen = mesh(root, plane(0.74, 0.58), M.screens[0], TVX - 0.09, 0.89, TVZ + 0.345, 0, 0, 0, false);
  // generic grey console on the floor in front of the stand + two pads on cables
  const con = new THREE.Group(); con.position.set(TVX + 0.1, 0.006, TVZ + 0.75); root.add(con); { const KC = new Kit(); KC.box(M.plastic, -0.14, 0.14, 0, 0.07, -0.11, 0.11, 0xb8b8c0, 0.012); KC.box(M.plastic, -0.14, 0.14, 0.0, 0.05, 0.06, 0.112, 0x5a5a64, 0.006); KC.box(M.plastic, -0.09, 0.09, 0.07, 0.075, -0.08, 0.02, 0x9a9aa4, 0.004); for (const s of [-1, 1]) KC.box(M.plastic, s * 0.05 - 0.02, s * 0.05 + 0.02, 0.02, 0.035, 0.11, 0.115, 0x2a2a30, 0.002); KC.build(con); }
  const pads = []; for (const [x, z, ry] of [[-0.55, TVZ + 1.7, 0.3], [0.65, TVZ + 1.8, -0.4]]) { const p = new THREE.Group(); p.position.set(x, 0.006, z); p.rotation.y = ry; root.add(p); const KP = new Kit(); KP.box(M.plastic, -0.065, 0.065, 0, 0.018, -0.03, 0.03, 0xb8b8c0, 0.004); KP.box(M.plastic, -0.05, -0.02, 0.018, 0.022, -0.004, 0.004, 0x2a2a30, 0.001); KP.box(M.plastic, -0.039, -0.031, 0.018, 0.022, -0.015, 0.015, 0x2a2a30, 0.001); for (const d of [0.025, 0.045]) KP.put(M.paint, cyl(0.007, 0.007, 0.006, 10), d, 0.02, 0.005, 0, 0, 0, 1, 1, 1, 0xc8302a); KP.build(p); pads.push(p);
    const n = 8, a = [TVX + 0.1 + (x > 0 ? 0.05 : -0.05), 0.03, TVZ + 0.86], b = [x, 0.012, z - 0.03]; for (let k = 0; k < n; k++) { const t0 = k / n, t1 = (k + 1) / n, w = (t) => Math.sin(t * Math.PI * 2) * 0.12; K.beam(M.paint, [a[0] + (b[0] - a[0]) * t0 + w(t0), 0.012, a[2] + (b[2] - a[2]) * t0], [a[0] + (b[0] - a[0]) * t1 + w(t1), 0.012, a[2] + (b[2] - a[2]) * t1], 0.006, 0x2a2a30, true, 4); } }
  // generic arcade cabinet (back right corner, angled)
  const arc = new THREE.Group(); arc.position.set(3.2, 0, ZB + 0.8); arc.rotation.y = -0.6; root.add(arc); { const KA = new Kit();
    for (const s of [-1, 1]) { KA.box(M.plastic, s * 0.33 - 0.025, s * 0.33 + 0.025, 0, 1.12, -0.37, 0.44, 0x2a2a6a, 0.01); KA.box(M.plastic, s * 0.33 - 0.025, s * 0.33 + 0.025, 1.12, 1.88, -0.37, 0.32, 0x2a2a6a, 0.01); }
    KA.box(M.plastic, -0.31, 0.31, 0, 1.0, -0.35, 0.33, 0x1a1a3a, 0.02); KA.box(M.plastic, -0.31, 0.31, 1.0, 1.12, -0.2, 0.42, 0x3a3a8a, 0.02); KA.box(M.plastic, -0.31, 0.31, 1.12, 1.85, -0.35, 0.0, 0x1a1a3a, 0.02); KA.box(M.plastic, -0.31, 0.31, 1.7, 1.85, -0.35, 0.3, 0x2a2a6a, 0.02);
    KA.beam(M.metal, [-0.12, 1.12, 0.22], [-0.12, 1.22, 0.22], 0.012, 0x1a1a1a, true, 6); KA.put(M.paint, sph(0.03, 10, 8), -0.12, 1.23, 0.22, 0, 0, 0, 1, 1, 1, 0xe8302a); for (const d of [0.06, 0.16]) KA.put(M.paint, cyl(0.022, 0.022, 0.02, 12), d, 1.125, 0.22, 0, 0, 0, 1, 1, 1, [0xe8c030, 0x30a8e8][d > 0.1 ? 1 : 0]); KA.build(arc); }
  const arcScreen = mesh(arc, plane(0.5, 0.5), M.arcScreens[0], 0, 1.42, 0.08, -0.32, 0, 0, false); const marquee = mesh(arc, plane(0.58, 0.14), M.marquee, 0, 1.775, 0.305, 0, 0, 0, false);
  // sofa (front, facing the TV), cushions, a lamp, snack bowl, beanbag
  K.at(0.2, 0, 1.9, Math.PI, () => { K.box(M.cloth, -1.2, 1.2, 0, 0.42, -0.45, 0.45, 0x6a4a8a, 0.08); K.box(M.cloth, -1.2, 1.2, 0.42, 0.95, 0.3, 0.5, 0x6a4a8a, 0.1); for (const s of [-1, 1]) K.box(M.cloth, s * 1.2 - 0.14, s * 1.2 + 0.14, 0.3, 0.68, -0.45, 0.5, 0x5a3a7a, 0.08); for (const s of [-1, 1]) K.box(M.cloth, s * 0.55 - 0.5, s * 0.55 + 0.5, 0.42, 0.55, -0.4, 0.3, 0x7a5a9a, 0.06); });
  K.at(-3.4, 0, -0.4, 0, () => { K.put(M.brass, cyl(0.16, 0.2, 0.04, 14), 0, 0.02, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); K.beam(M.brass, [0, 0, 0], [0, 1.45, 0], 0.016, 0xc8a050, true, 6); K.put(M.paint, new THREE.CylinderGeometry(0.16, 0.26, 0.3, 16, 1, true), 0, 1.5, 0, 0, 0, 0, 1, 1, 1, 0xf0d8a8); });
  K.put(M.paint, new THREE.SphereGeometry(0.16, 14, 8, 0, TAU, Math.PI / 2, Math.PI / 2), 1.3, 0.12, 0.6, Math.PI, 0, 0, 1, 0.6, 1, 0xe8402a); for (let i = 0; i < 8; i++) K.put(M.paint, sph(0.025, 6, 5), 1.25 + (R() - 0.5) * 0.15, 0.13, 0.6 + (R() - 0.5) * 0.15, 0, 0, 0, 1, 1, 1, 0xf0d070);
  K.put(M.cloth, lumpGeo(5, 2, 0.12), -1.9, 0.3, 0.9, 0, 0, 0, 0.5, 0.32, 0.5, 0xe86a2a);
  K.build(root, 0);
  const tvGlow = glowAt(root, [TVX - 0.09, 0.9, TVZ + 0.5], 2.6, '#80b0ff', 0.4); const arcGlow = glowAt(root, [3.05, 1.45, ZB + 1.0], 1.4, '#c080ff', 0.35); const lampG = glowAt(root, [-3.4, 1.5, -0.4], 1.2, '#ffc070', 0.5);
  const dust = motes(root, 40, [-2, 2, 0.3, 2.2, -2.5, 1.5], 59, 0.01);
  return { screen, arcScreen, marquee, tvGlow, arcGlow, lampG, win, con, pads, dust, TVX, TVZ };
}

// ================================================================= lights, grades, API
const SET_LIGHT = {
  shopDay: { top: '#000000', hor: '#3a2618', fog: '#3a2618', fogN: 12, fogF: 60, sky: '#ffe8c8', ground: '#6a4a2a', hemiI: 0.9, fillCol: '#8a90c8', fillI: 0.32, sunCol: '#fff0d0', sunI: 2.6, az: -160, el: 35, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff4e8', fxTint: '#ffffff', shafts: 0 },
  shopLamp: { top: '#000000', hor: '#1a1018', fog: '#1a1018', fogN: 10, fogF: 50, sky: '#ffc890', ground: '#4a2a20', hemiI: 0.7, fillCol: '#5a58b8', fillI: 0.38, sunCol: '#ffc888', sunI: 1.6, az: 160, el: 50, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
  shopNow: { top: '#000000', hor: '#2a1e18', fog: '#2a1e18', fogN: 12, fogF: 60, sky: '#ffe8d0', ground: '#6a4a2a', hemiI: 0.95, fillCol: '#8a90d8', fillI: 0.35, sunCol: '#fff4e0', sunI: 2.8, az: -150, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff6ee', fxTint: '#ffffff', shafts: 0 },
  kyoto: { top: '#4a82d8', hor: '#d8e4f0', fog: '#dce4ee', fogN: 40, fogF: 260, sky: '#a8bcf0', ground: '#6a6050', hemiI: 0.74, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#fff0d0', sunI: 3.6, az: 60, el: 38, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0.3 },
  street60: { top: '#3a3a8a', hor: '#ff9a70', fog: '#b07a8a', fogN: 30, fogF: 200, sky: '#8a80d0', ground: '#4a3a40', hemiI: 0.8, fillCol: '#6a6ad8', fillI: 0.4, sunCol: '#ff9a60', sunI: 2.4, az: 70, el: 9, disc: '#ffe0b0', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff0e8', fxTint: '#ffffff', shafts: 0.4 },
  street60n: { top: '#04061a', hor: '#1a2250', fog: '#141a3a', fogN: 20, fogF: 140, sky: '#5a6ab8', ground: '#2a2030', hemiI: 0.6, fillCol: '#4a58c8', fillI: 0.45, sunCol: '#a8b8ff', sunI: 1.2, az: -50, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0.6, cardTint: '#e8e8ff', fxTint: '#ffffff', shafts: 0 },
  streetDawn: { top: '#4a5aa8', hor: '#ffc890', fog: '#f0c8a0', fogN: 40, fogF: 240, sky: '#9a90d8', ground: '#5a4a50', hemiI: 0.9, fillCol: '#7078d8', fillI: 0.32, sunCol: '#ffb070', sunI: 3.2, az: 15, el: 12, disc: '#fff0c8', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff2e2', fxTint: '#fff6ea', shafts: 0.6 },
  office60: { top: '#000000', hor: '#c8ccd0', fog: '#c8ccd0', fogN: 14, fogF: 60, sky: '#f0f0f8', ground: '#7a7068', hemiI: 0.95, fillCol: '#8a98d8', fillI: 0.35, sunCol: '#fff4e0', sunI: 2.8, az: 160, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  officeNight: { top: '#000000', hor: '#141a30', fog: '#141a30', fogN: 10, fogF: 50, sky: '#7a7ab8', ground: '#3a2a30', hemiI: 0.7, fillCol: '#5a68c8', fillI: 0.42, sunCol: '#a8b8ff', sunI: 1.3, az: 160, el: 35, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ece8ff', fxTint: '#ffffff', shafts: 0 },
  deskMacro: { top: '#000000', hor: '#2a1e18', fog: '#2a1e18', fogN: 10, fogF: 50, sky: '#ffe8c8', ground: '#5a3a2a', hemiI: 0.9, fillCol: '#8a90c8', fillI: 0.3, sunCol: '#ffe0b0', sunI: 2.2, az: 140, el: 45, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  homeNight: { top: '#000000', hor: '#0a0e20', fog: '#0a0e20', fogN: 10, fogF: 40, sky: '#6a7ad0', ground: '#2a2030', hemiI: 0.55, fillCol: '#4a68e8', fillI: 0.5, sunCol: '#90b0ff', sunI: 1.0, az: 10, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#e0e8ff', fxTint: '#ffffff', shafts: 0 },
  home85: { top: '#000000', hor: '#2a1a20', fog: '#2a1a20', fogN: 10, fogF: 40, sky: '#ffd8b0', ground: '#4a3028', hemiI: 0.8, fillCol: '#6a70d0', fillI: 0.38, sunCol: '#ffd8a8', sunI: 2.0, az: -140, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e8', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  shopDay: { look: 'office', over: { exp: 1.12, con: 1.22, sat: 1.08, lift: [0.03, 0.022, 0.04], tS: ['#3a2a6a', 0.16], tH: ['#ffd8a0', 0.1], bloom: [0.42, 0.78], hal: [0.24, '#ffa860'], vig: [0.32, 0.46, '#2a1420'] } },
  shopLamp: { look: 'office', over: { exp: 1.14, con: 1.24, sat: 1.08, lift: [0.035, 0.02, 0.05], tS: ['#2a1a6a', 0.22], tH: ['#ffc070', 0.14], bloom: [0.48, 0.7], hal: [0.3, '#ff9a50'], vig: [0.4, 0.42, '#14081a'] } },
  shopNow: { look: 'office', over: { exp: 1.1, con: 1.2, sat: 1.1, lift: [0.03, 0.022, 0.04], tS: ['#3a2a6a', 0.14], tH: ['#ffe0b8', 0.08], bloom: [0.42, 0.8], hal: [0.22, '#ffb070'], vig: [0.3, 0.48, '#2a1420'] } },
  kyoto: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.1, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.36, 0.86], vig: [0.26, 0.5, '#4a3a5a'] } },
  street60: { look: 'golden', over: { exp: 1.06, con: 1.24, sat: 1.12, tS: ['#3a2a8a', 0.2], tH: ['#ffb080', 0.1], bloom: [0.46, 0.74], hal: [0.28, '#ff9060'], vig: [0.34, 0.46, '#1e1a3a'] } },
  street60n: { look: 'night', over: { exp: 1.16, con: 1.22, sat: 1.06, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.52, 0.66], hal: [0.32, '#ff9a50'], vig: [0.42, 0.4, '#08081a'] } },
  streetDawn: { look: 'golden', over: { exp: 1.06, con: 1.22, sat: 1.08, tS: ['#3a3a8a', 0.18], tH: ['#ffc890', 0.1], bloom: [0.42, 0.78], hal: [0.24, '#ffa860'], vig: [0.3, 0.48, '#1e1a3a'] } },
  office60: { look: 'day', over: { exp: 1.04, con: 1.2, sat: 1.06, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c8', 0.06], bloom: [0.38, 0.84], vig: [0.28, 0.48, '#3a2a4a'] } },
  officeNight: { look: 'night', over: { exp: 1.16, con: 1.22, sat: 1.04, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.5, 0.68], hal: [0.3, '#ffa050'], vig: [0.4, 0.42, '#08081a'] } },
  deskMacro: { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.06, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.42, 0.78], hal: [0.26, '#ff9a50'], vig: [0.38, 0.44, '#2a1420'] } },
  homeNight: { look: 'night', over: { exp: 1.16, con: 1.24, sat: 1.1, lift: [0.02, 0.025, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#a8c8ff', 0.1], bloom: [0.5, 0.66], hal: [0.3, '#80a0ff'], vig: [0.42, 0.4, '#04061a'] } },
  home85: { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.1, lift: [0.035, 0.02, 0.045], tS: ['#3a2a6a', 0.2], tH: ['#ffc888', 0.12], bloom: [0.44, 0.74], hal: [0.28, '#ff9a50'], vig: [0.36, 0.44, '#14081a'] } },
};

export function buildNT(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'shopDay', stall: 0, cab: 0, scr: 0, gw: 0 };
  let sh, st, of, hm;
  const API = makeAPI(ctx, { prefix: 'nt_', origin: NT_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { kyoto: 'day', street60: 'day', streetDawn: 'day' },
    practicals: (name, F, W3) => { const fl = 1 + 0.05 * Math.sin(F * 0.7) + 0.03 * Math.sin(F * 1.9);
      if (name.startsWith('shop')) return [{ p: W3('shop', [-2.2, 2.2, -2.0]), col: '#ffc070', I: (name === 'shopLamp' ? 7 : 4) * fl, d: 7 }, { p: W3('shop', [0.9, 2.2, -0.2]), col: '#ffc070', I: (name === 'shopLamp' ? 7 : 3.5) * fl, d: 7 }, { p: W3('shop', [0, 1.6, -3.6]), col: '#fff0d8', I: name === 'shopLamp' ? 1.5 : 4, d: 9 }, { p: W3('shop', [3.2, 2.2, -2.6]), col: '#ffc070', I: 3 * fl, d: 6 }];
      if (name === 'street60' || name === 'street60n') { const n = name === 'street60n' ? 1.4 : 1; return [{ p: W3('street', [-2.0, 3.4, -4.5]), col: '#ffd040', I: 5 * n, d: 8 }, { p: W3('street', [2.0, 3.5, -2.6]), col: '#ff6a4a', I: 5 * n, d: 8 }, { p: W3('street', [2.0, 4.2, -15]), col: '#6ae0ff', I: 5 * n, d: 9 }, { p: W3('street', [-1.0, 1.0, -3.6 + ST.cab]), col: '#fff0c0', I: name === 'street60n' ? 3 : 0, d: 6 }]; }
      if (name === 'kyoto' || name === 'streetDawn') return [{ p: W3('street', [-2.95, 2.2, 2.0]), col: '#ff9a50', I: name === 'streetDawn' ? 2.5 : 0, d: 6 }];
      if (name === 'office60' || name === 'officeNight') return [{ p: W3('office', [-1.45, 1.2, -1.7]), col: '#ffc070', I: (name === 'officeNight' ? 4 : 2.4) * fl, d: 6 }, { p: W3('office', [1.8, 2.0, -2.6]), col: name === 'officeNight' ? '#7a8aff' : '#fff0d8', I: 3.0, d: 7 }, { p: W3('office', [2.6, 2.4, -1.6]), col: '#ffe0b8', I: name === 'officeNight' ? 3.5 : 2, d: 6 }];
      if (name === 'deskMacro') return [{ p: W3('office', [-1.4, 1.2, -1.6]), col: '#ffc070', I: 3.2 * fl, d: 5 }, { p: W3('office', [-0.2, 1.1, -0.7]), col: '#fff0d8', I: 1.6, d: 4 }];
      if (name.startsWith('home')) { const tv = 0.85 + 0.15 * Math.sin(F * 0.9) * Math.sin(F * 0.37); return [{ p: W3('home', [0, 0.9, -2.2]), col: '#80b0ff', I: 6 * tv, d: 6 }, { p: W3('home', [-3.4, 1.4, -0.4]), col: '#ffc070', I: name === 'home85' ? 5 * fl : 2.4 * fl, d: 7 }, { p: W3('home', [3.0, 1.5, -2.2]), col: '#c080ff', I: 3, d: 5 }, { p: W3('home', [0, 2.4, 1.5]), col: '#ffe0b8', I: name === 'home85' ? 2.5 : 0.6, d: 7 }]; }
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'shop' && sh) { sh.lamps.forEach((g, i) => (g.material.opacity = g.userData.op * (0.9 + 0.1 * Math.sin(f * 0.7 + i)))); tickMotes(sh.dust, f, 0.3); sh.lineCards.forEach((c, i) => (c.rotation.z = 0.06 * Math.sin(T * 1.3 + i * 0.7))); }
      if (cur === 'street' && st) { tickMotes(st.dust, f, 0.5); st.neonGlows.forEach((g, i) => (g.material.opacity = (ST.mood === 'street60n' ? 0.55 : 0.35) * (0.85 + 0.15 * Math.sin(f * (0.9 + i * 0.3))) * (ST.mood === 'street60n' && i === 0 && f % 23 < 3 ? 0.2 : 1)));
        st.cab.position.x = -1.0; st.cab.position.z = -6 + ST.cab; st.cab.position.y = ST.stall ? 0.008 * Math.sin(f * 2.1) : 0.004 * Math.sin(f * 1.3); }
      if (cur === 'office' && of) { of.lampG.material.opacity = of.lampG.userData.op * (0.92 + 0.08 * Math.sin(f * 0.8)); tickMotes(of.dust, f, 0.3);
        of.lcdBlocks.forEach((b, i) => { const a = f * 0.12 + i * 2.1; b.position.set(Math.cos(a) * 0.018, 0.0138, -0.004 - Math.abs(Math.sin(a)) * 0.012); }); of.lcdPaddle.position.x = Math.cos(f * 0.12 + Math.round(f * 0.06) % 3 * 2.1) * 0.015; }
      if (cur === 'home' && hm) { const k = Math.floor(f / 3); hm.screen.material = M.screens[k % 6]; hm.arcScreen.material = M.arcScreens[Math.floor(f / 5) % 4]; hm.tvGlow.material.opacity = 0.4 * (0.85 + 0.15 * Math.sin(f * 0.9)); tickMotes(hm.dust, f, 0.3); } },
    mood: (name) => { ST.mood = name; if (sh) { const now = name === 'shopNow'; sh.now.visible = now; sh.shojis.forEach((s) => (s.material = name === 'shopLamp' ? M.shojiN : M.shoji)); sh.shaft.visible = name !== 'shopLamp'; }
      if (st) { const s60 = name === 'street60' || name === 'street60n'; st.s60.visible = s60; st.lampGlows.forEach((g) => (g.material.opacity = name === 'street60n' ? 0.5 : name === 'streetDawn' ? 0.25 : name === 'street60' ? 0.3 : 0)); st.sky.material.color.set(name === 'kyoto' ? 0xa8c8f8 : name === 'street60' ? 0xff9a80 : name === 'street60n' ? 0x10183a : 0xffb88a); }
      if (of) { of.win.material = name === 'officeNight' ? M.winNight : M.winDay; }
      if (hm) { hm.win.material = name === 'homeNight' ? M.winNight : M.winDay; } },
    apply: (v) => { if (v.cab != null) API.setCab(v.cab); } });
  sh = buildShop(API.groups.shop); st = buildStreet(API.groups.street); of = buildOffice(API.groups.office); hm = buildHome(API.groups.home);
  API.parts = { sh, st, of, hm };
  API.setCab = (z, stall = 0) => { ST.cab = z; ST.stall = stall; };
  API.glows = { shop: sh.lamps, street: [...st.neonGlows, ...st.lampGlows], office: [of.lampG], home: [hm.tvGlow, hm.lampG, hm.arcGlow] };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  const V = API.V;
  API.views = [
    V('shopDay', [1.4, 1.5, 4.2], [-0.6, 1.1, -2.4], 46, 1.0, [-0.6, 1.0, -1.6]), // 0 workshop wide
    V('shopDay', [-1.7, 1.25, -1.2], [-2.2, 0.62, -2.4], 44, 2.6, [-2.2, 0.62, -2.4]), // 1 bench close
    V('shopLamp', [2.6, 1.3, 2.6], [0.9, 0.5, 0.2], 44, 1.6, [0.9, 0.5, 0.2]), // 2 players' table
    V('shopNow', [3.6, 1.5, 3.4], [2.4, 1.0, 0.0], 44, 1.6, [2.6, 1.0, 0.3]), // 3 modern case
    V('kyoto', [0.4, 1.7, 10], [-1.0, 2.2, -10], 44, 0.8, [-2.0, 1.4, 1.5]), // 4 street 1889
    V('street60', [0.6, 1.6, 8], [-0.4, 2.2, -10], 44, 0.8, [-1.0, 1.2, -4]), // 5 street 1960s dusk
    V('street60n', [1.6, 1.3, 2.5], [-0.8, 0.9, -5.6], 44, 1.2, [-1.0, 0.8, -5.6], { cab: 0 }), // 6 night, cab
    V('streetDawn', [0.3, 2.4, 12], [-0.6, 2.6, -10], 46, 0.8, [-2, 1.5, 1]), // 7 dawn
    V('office60', [2.2, 1.55, 3.0], [-0.4, 1.1, -1.6], 46, 1.2, [-0.4, 1.0, -1.2]), // 8 office wide
    V('officeNight', [3.6, 1.45, 1.0], [2.4, 1.05, -2.6], 44, 1.6, [2.4, 1.0, -2.0]), // 9 Yokoi bench
    V('deskMacro', [-0.31, 0.98, -0.95], [-0.35, 0.81, -1.12], 40, 4.0, [-0.35, 0.81, -1.12]), // 10 handheld macro
    V('homeNight', [0.4, 1.3, 3.4], [0, 0.85, -2.6], 44, 1.2, [0, 0.6, -1.0]), // 11 game room night
    V('home85', [-1.5, 1.2, 2.2], [0.4, 0.8, -2.4], 44, 1.2, [0.2, 0.6, -1.4]), // 12 game room evening
    V('home85', [2.0, 1.3, 1.0], [3.1, 1.3, -2.5], 42, 1.6, [3.1, 1.3, -2.5]), // 13 arcade box
  ];
  API.setCab(0); API.tick(0);
  return API;
}
