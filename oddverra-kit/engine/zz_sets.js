// zz_sets.js [ZZ-sets]: sets for "The shortest war in history" (Anglo-Zanzibar War, 27 Aug 1896, Oddverra short). Stylized and generic:
// the palace is an invented coral-stone palace with wraparound verandas and a clock tower (not a replica of any building), the ships are
// generic 1890s warships (black hull, white band, buff funnels) and a white steam yacht labelled GLASGOW. Everything respectful: smoke,
// flashes and damage only, no bodies, no gore.
//   harbor  : waterfront: the palace + clock tower (live hands) + flagpole (lowerable red flag), a barricade with two old cannons, town
//             houses + palms, the sea (scrolling toon water), the yacht (sinkable, masts stay above water), five warships offshore with
//             muzzle flashes + gun smoke, shell-hit flashes + smoke plumes on the palace, damage state, a rowboat (rescue).
//             Moods 'hbDawn', 'hbMorning', 'hbBattle', 'hbAfter'.                                                   origin (-118000,0,0)
//   throne  : palace hall: carved studded doors, arched sea windows, dais + throne, rugs, hanging brass lamps. 'thMourn', 'thDay'. (-118000,0,800)
//   office  : British consulate office: desk, wall map, big wall clock (live hands), window onto the warships, ceiling fan; the bill
//             (sheet + spent shell casings + coins) for the payoff. Moods 'ofDay', 'ofBill'.                        origin (-118000,0,1600)
//   consul  : German consulate: white facade, shutters, a black-white-red flag, garden with palms, a sea wall with a water gate, high
//             tide at the steps, a ship's boat at the gate, a warship far out. Moods 'gcDay' (smoky morning), 'gcDusk'. (-120500,0,0)
//   clock   : a "time" void: navy grid, a giant clock whose minute wedge fills 0 -> 38 -> 45 minutes. Mood 'void'.  origin (-120500,0,800)
// Each set: local frame, floor y = 0 (harbor water y = -1), camera side +z. Test flag ?zzview=N (main.js).
import { H, TAU, sm, SERIF, SANS, cyl, sph, plane, planeUV, lathe, mesh, nond, lumpGeo, shapeGeo, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';
import { dial } from './zz_cast.js';

export const ZZ_ORIGIN = { harbor: [-118000, 0, 0], throne: [-118000, 0, 800], office: [-118000, 0, 1600], consul: [-120500, 0, 0], clock: [-120500, 0, 800] };
const GROUP_OF = { hbDawn: 'harbor', hbMorning: 'harbor', hbBattle: 'harbor', hbAfter: 'harbor', thMourn: 'throne', thDay: 'throne', ofDay: 'office', ofBill: 'office', gcDay: 'consul', gcDusk: 'consul', void: 'clock' };
let THREE, PT, M;

// ---------------------------------------------------------------- painters
const plainTex = (col, k = 0.12, s = 5) => (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 1 - k / 2 + k * PT.fbm(u, v, 4, 4, 3, s)); };
function plasterTex(base, o = {}) { return (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.2 * PT.fbm(u, v, 5, 5, 4, o.seed || 9)); grain(g, w, h, 'rgba(120,100,80,1)', 600, o.seed || 4, 0.18);
  const R = PT.rng(o.seed || 3); g.fillStyle = 'rgba(120,96,70,0.07)'; for (let i = 0; i < 10; i++) { g.beginPath(); g.ellipse(R() * w, h * (0.75 + R() * 0.25), 20 + R() * 50, 4 + R() * 10, 0, 0, TAU); g.fill(); }
  if (o.burn) { g.fillStyle = 'rgba(30,20,24,0.72)'; for (let i = 0; i < 9; i++) { const x = R() * w, y = R() * h * 0.8, r = 30 + R() * 70; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(20,14,18,0.85)'); gr.addColorStop(1, 'rgba(20,14,18,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } } }; }
// a facade with rows of arched shuttered windows
function facadeTex(base, o = {}) { return (g, w, h) => { plasterTex(base, o)(g, w, h); const cols = o.cols || 8, rows = o.rows || 3, R = PT.rng(o.seed || 5);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const cw = w / cols, rh = h / rows, x = i * cw + cw * 0.3, y = j * rh + rh * 0.28, ww = cw * 0.4, hh = rh * 0.52;
    g.fillStyle = o.lit && R() < 0.5 ? '#ffc870' : '#2a2436'; g.beginPath(); g.moveTo(x, y + hh); g.lineTo(x, y + ww / 2); g.arc(x + ww / 2, y + ww / 2, ww / 2, Math.PI, TAU); g.lineTo(x + ww, y + hh); g.closePath(); g.fill();
    if (!o.lit) { g.fillStyle = o.shut || '#3f7a5a'; g.fillRect(x - ww * 0.42, y + ww * 0.3, ww * 0.38, hh - ww * 0.3); g.fillRect(x + ww * 1.04, y + ww * 0.3, ww * 0.38, hh - ww * 0.3); }
    g.fillStyle = 'rgba(255,250,236,0.7)'; g.fillRect(x - ww * 0.1, y + hh, ww * 1.2, rh * 0.04); }
  g.fillStyle = 'rgba(60,40,40,0.25)'; for (let j = 1; j < rows; j++) g.fillRect(0, j * h / rows - 3, w, 6); }; }
function waterTex(o) { return (g, w, h) => { g.fillStyle = o.base; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.85 + 0.25 * PT.fbm(u, v, 3, 6, 3, 8)); const R = PT.rng(5);
  for (let i = 0; i < 380; i++) { const x = R() * w, y = R() * h, l = 10 + R() * 34; g.strokeStyle = o.hi.replace('A', (0.3 + R() * 0.5).toFixed(2)); g.lineWidth = 1.5 + R() * 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 3, x + l, y); g.stroke(); }
  for (let i = 0; i < 240; i++) { const x = R() * w, y = R() * h, l = 8 + R() * 26; g.strokeStyle = o.lo; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y + 3, x + l, y); g.stroke(); } }; }
function smokeTex(g, w, h) { g.clearRect(0, 0, w, h); const R = PT.rng(11); for (let i = 0; i < 9; i++) { const x = w * (0.3 + R() * 0.4), y = h * (0.3 + R() * 0.4), r = w * (0.18 + R() * 0.14); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } }
function hillsTex(cols) { return (g, w, h) => { g.clearRect(0, 0, w, h); cols.forEach(([y0, c, a], k) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * y0 + Math.sin(x * 0.011 + y0 * 9) * h * a + Math.sin(x * 0.031 + k) * h * a * 0.4); g.lineTo(w, h); g.fill(); }); }; }
function doorTex(g, w, h) { PT.planks(g, w, h, { base: '#6a4026', n: 4, seed: 23 }); g.strokeStyle = '#3a2214'; g.lineWidth = w * 0.03; g.strokeRect(w * 0.06, h * 0.05, w * 0.88, h * 0.93); g.beginPath(); g.moveTo(w / 2, h * 0.05); g.lineTo(w / 2, h); g.stroke();
  g.lineWidth = w * 0.02; g.beginPath(); g.moveTo(w * 0.1, h * 0.2); g.quadraticCurveTo(w / 2, h * 0.02, w * 0.9, h * 0.2); g.stroke(); for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(w / 2, h * 0.16, w * (0.08 + i * 0.05), Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
  for (let j = 0; j < 7; j++) for (let i = 0; i < 4; i++) { const x = w * (0.18 + i * 0.21), y = h * (0.3 + j * 0.1); g.fillStyle = '#e0b048'; g.beginPath(); g.arc(x, y, w * 0.025, 0, TAU); g.fill(); g.fillStyle = '#8a6020'; g.beginPath(); g.arc(x + 1, y + 1, w * 0.012, 0, TAU); g.fill(); } }
function rugTex(a, b, c) { return (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); g.strokeStyle = b; g.lineWidth = w * 0.04; g.strokeRect(w * 0.06, h * 0.06, w * 0.88, h * 0.88); g.lineWidth = w * 0.015; g.strokeStyle = c; g.strokeRect(w * 0.12, h * 0.12, w * 0.76, h * 0.76);
  g.fillStyle = b; for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) { const x = w * (0.25 + j * 0.25), y = h * (0.2 + i * 0.15); g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x + 12, y); g.lineTo(x, y + 14); g.lineTo(x - 12, y); g.closePath(); g.fill(); }
  PT.modulate(g, w, h, (u, v) => 0.88 + 0.16 * PT.fbm(u, v, 8, 8, 3, 2)); }; }
function seaWinTex(o) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.a); gr.addColorStop(0.62, o.b); gr.addColorStop(0.62, o.s1); gr.addColorStop(1, o.s2); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  if (o.ships) { g.fillStyle = o.ship; for (const [x, s] of [[0.2, 1], [0.55, 1.4], [0.82, 0.8]]) { const y = h * 0.6; g.fillRect(w * x - 30 * s, y - 6 * s, 60 * s, 8 * s); g.fillRect(w * x - 12 * s, y - 16 * s, 8 * s, 12 * s); g.fillRect(w * x + 2 * s, y - 16 * s, 8 * s, 12 * s); g.fillRect(w * x - 22 * s, y - 34 * s, 2 * s, 30 * s); g.fillRect(w * x + 20 * s, y - 34 * s, 2 * s, 30 * s); } }
  if (o.sun) { g.fillStyle = o.sun; g.beginPath(); g.arc(w * 0.7, h * 0.36, h * 0.06, 0, TAU); g.fill(); } }; }
function mapTex(g, w, h) { g.fillStyle = '#e8dcb8'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, 5)); g.fillStyle = '#9ac0d0'; g.fillRect(w * 0.05, h * 0.12, w * 0.9, h * 0.82);
  g.fillStyle = '#d8c890'; g.beginPath(); g.moveTo(w * 0.05, h * 0.12); g.lineTo(w * 0.5, h * 0.12); g.bezierCurveTo(w * 0.45, h * 0.4, w * 0.3, h * 0.6, w * 0.25, h * 0.94); g.lineTo(w * 0.05, h * 0.94); g.closePath(); g.fill(); g.strokeStyle = '#6a5a3a'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#3a3040'; for (const [x, y] of [[0.6, 0.4], [0.7, 0.55], [0.55, 0.7], [0.8, 0.3], [0.75, 0.75]]) { g.fillRect(w * x - 18, h * y - 4, 36, 8); }
  g.strokeStyle = '#a8282c'; g.lineWidth = 4; g.setLineDash([10, 8]); g.beginPath(); g.moveTo(w * 0.6, h * 0.4); g.lineTo(w * 0.32, h * 0.38); g.stroke(); g.setLineDash([]);
  txt(g, 'ZANZIBAR HARBOUR', w / 2, h * 0.06, w * 0.86, h * 0.06, { col: '#3a2a20', font: SERIF }); }
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); if (!o.flat) PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 6, 2, 3, 7)); g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08);
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : 0.34 + i * 0.34), w * 0.86, h * (lines.length === 1 ? 0.5 : 0.26), { col: o.col || '#3a2414', font: o.font || SERIF })); }; }
function billTex(g, w, h) { g.fillStyle = '#f6efdc'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 5)); const o = { col: '#2a2030', font: SERIF };
  txt(g, 'ACCOUNT', w / 2, h * 0.08, w * 0.7, h * 0.07, o); txt(g, 'Zanzibar, 1896', w / 2, h * 0.15, w * 0.6, h * 0.04, { ...o, italic: true });
  g.fillStyle = 'rgba(40,30,50,0.6)'; g.fillRect(w * 0.08, h * 0.2, w * 0.84, 3);
  [['Shells fired', 0.3], ['Damages (looting)', 0.4], ['', 0.5]].forEach(([s, y]) => { if (s) { txt(g, s, w * 0.36, h * y, w * 0.5, h * 0.045, { ...o, bold: false }); g.fillStyle = 'rgba(40,30,50,0.5)'; for (let x = w * 0.64; x < w * 0.86; x += 14) g.fillRect(x, h * y + 6, 6, 3); } });
  g.fillStyle = 'rgba(40,30,50,0.6)'; g.fillRect(w * 0.08, h * 0.6, w * 0.84, 3); txt(g, 'TOTAL DUE', w * 0.34, h * 0.68, w * 0.4, h * 0.06, o); txt(g, '₹ 300,000', w * 0.72, h * 0.68, w * 0.36, h * 0.06, { ...o, col: '#a8282c' });
  g.strokeStyle = 'rgba(40,30,50,0.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w * 0.55, h * 0.88); g.bezierCurveTo(w * 0.62, h * 0.8, w * 0.7, h * 0.94, w * 0.86, h * 0.84); g.stroke(); }
function nameTex(s, col, bg) { return (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); txt(g, s, w / 2, h * 0.55, w * 0.92, h * 0.7, { col, font: SERIF }); }; }
function flagTex(cols) { return (g, w, h) => { cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * h / cols.length, w, h / cols.length + 1); }); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 6, 3, 3, 2)); }; }
function gridTex(bg, line, n = 16) { return (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = line; for (let i = 0; i <= n; i++) { g.lineWidth = i % 4 === 0 ? 4 : 1.6; g.beginPath(); g.moveTo(i * w / n, 0); g.lineTo(i * w / n, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / n); g.lineTo(w, i * h / n); g.stroke(); } }; }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.plaster = vc({ map: T(512, 512, plasterTex('#efe4cc')) }); m.plasterIn = vc({ map: T(512, 512, plasterTex('#e2cfa8', { seed: 12 })) }); m.plasterB = vc({ map: T(512, 512, plasterTex('#e8dcc0', { burn: 1, seed: 7 })) });
  m.facade = em(T(1024, 512, facadeTex('#efe2c8', { cols: 10, rows: 3 })), 0x1a140e); m.facadeB = em(T(1024, 512, facadeTex('#e0d2b6', { cols: 10, rows: 3, burn: 1, seed: 8 })), 0x140e0a);
  m.house = [['#efe6d2', '#3f7a5a'], ['#e8cfa0', '#7a4a2a'], ['#f2ece0', '#2a5a8a'], ['#d8b890', '#5a3a5a']].map(([b, s], i) => em(T(512, 512, facadeTex(b, { cols: 3, rows: 3, shut: s, seed: 20 + i })), 0x16100c));
  m.stone = vc({ map: T(512, 512, (g, w, h) => PT.stone(g, w, h, { base: '#b8a888', n: 6, seed: 3 })) }); m.sand = vc({ map: T(512, 512, plainTex('#d8c49a', 0.16, 7)) }); m.sand.map.wrapS = m.sand.map.wrapT = THREE.RepeatWrapping;
  m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 8, seed: 51 })) }); m.dark = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#4a2e1e', n: 6, seed: 33 })) });
  const wt = (o) => { const t = T(512, 512, waterTex(o)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(60, 60); return t; };
  m.waterD = wt({ base: '#2f86a0', hi: 'rgba(170,230,236,A)', lo: 'rgba(20,70,96,0.45)' }); m.waterG = wt({ base: '#4a6a7a', hi: 'rgba(190,200,210,A)', lo: 'rgba(30,40,56,0.45)' }); m.waterN = wt({ base: '#1a3050', hi: 'rgba(240,170,120,A)', lo: 'rgba(8,14,34,0.5)' });
  m.water = toon({ map: m.waterD }); if (H.MACRO) H.MACRO(m.water, 0.18, 0.01);
  m.smoke = new THREE.MeshBasicMaterial({ map: T(128, 128, smokeTex), color: 0x8a8490, transparent: true, opacity: 0.6, depthWrite: false, fog: true });
  m.flash = H.M.glow.clone(); m.flash.color.set('#ffd080');
  m.door = em(T(256, 512, doorTex), 0x1a0e08); m.rugA = vc({ map: T(512, 512, rugTex('#8a2a2a', '#e8b048', '#2a3a6a')) }); m.rugB = vc({ map: T(512, 512, rugTex('#2a4a6a', '#e8c070', '#8a2a2a')) });
  m.tile = vc({ map: T(512, 512, (g, w, h) => { const n = 8; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { g.fillStyle = (i + j) % 2 ? '#d8c8a8' : '#b89a78'; g.fillRect(i * w / n, j * h / n, w / n, h / n); } PT.modulate(g, w, h, (u, v) => 0.88 + 0.14 * PT.fbm(u, v, 4, 4, 3, 5)); }) });
  m.winSea = new THREE.MeshBasicMaterial({ map: T(512, 512, seaWinTex({ a: '#7ab0e8', b: '#d8ecf8', s1: '#3a90b0', s2: '#2a6a8a' })), fog: false });
  m.winSeaN = new THREE.MeshBasicMaterial({ map: T(512, 512, seaWinTex({ a: '#0a1030', b: '#2a3a7a', s1: '#1a2a5a', s2: '#0a1430' })), fog: false });
  m.winShips = new THREE.MeshBasicMaterial({ map: T(512, 512, seaWinTex({ a: '#8ab8e8', b: '#e8f0f8', s1: '#3a90b0', s2: '#2a6a8a', ships: 1, ship: '#2a2a34' })), fog: false });
  m.winGold = new THREE.MeshBasicMaterial({ map: T(512, 512, seaWinTex({ a: '#e88a5a', b: '#ffd8a0', s1: '#c87a5a', s2: '#6a4a5a', ships: 1, ship: '#3a2a3a', sun: '#fff0c0' })), fog: false });
  m.map = em(T(512, 384, mapTex), 0x201810, { side: THREE.DoubleSide }); m.bill = em(T(512, 640, billTex), 0x141008, { side: THREE.DoubleSide });
  m.dialTex = T(512, 512, (g, w, h) => { g.clearRect(0, 0, w, h); dial(g, w / 2, h / 2, w * 0.48, 0, { roman: true, noHands: true }); }); m.dial = H.M.basic(m.dialTex, 1.05); m.dial.transparent = true; m.dialL = toon({ map: m.dialTex, transparent: true, emissive: 0x403020 }); m.dialL.emissiveMap = m.dialTex;
  m.hand = toon({ color: 0x1e1828, emissive: 0x08060c });
  m.flagRed = toon({ map: T(256, 160, flagTex(['#c8202a'])), side: THREE.DoubleSide, emissive: 0x300808 }); m.flagDE = toon({ map: T(256, 160, flagTex(['#1a1a1e', '#f2f0ea', '#c8202a'])), side: THREE.DoubleSide, emissive: 0x181010 });
  m.glasgow = em(T(512, 96, nameTex('GLASGOW', '#e0b048', '#f2ece0')), 0x302818, { side: THREE.DoubleSide });
  m.consSign = em(T(512, 200, signTex(['KAISERLICH DEUTSCHES', 'KONSULAT'], { bg: '#1e2a3a', col: '#e8d8a8', rim: '#c8a048', flat: 1 })), 0x101820, { side: THREE.DoubleSide });
  m.leaf = vc({ side: THREE.DoubleSide }); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.cloth = vc({ side: THREE.DoubleSide });
  m.hills = new THREE.MeshBasicMaterial({ map: T(1024, 256, hillsTex([[0.5, '#8aa0b8', 0.06], [0.64, '#6a8a7a', 0.06], [0.78, '#4a6a48', 0.08]])), transparent: true, fog: false, depthWrite: false });
  m.isles = new THREE.MeshBasicMaterial({ map: T(1024, 256, hillsTex([[0.7, '#7a92b0', 0.05], [0.84, '#5a7a7a', 0.04]])), transparent: true, fog: false, depthWrite: false });
  m.gridFloor = new THREE.MeshBasicMaterial({ map: T(512, 512, gridTex('#0e1a3e', 'rgba(110,170,255,0.55)', 8)), fog: true }); m.gridWall = new THREE.MeshBasicMaterial({ map: T(512, 512, gridTex('#0a1430', 'rgba(90,140,230,0.4)', 8)), fog: true });
  m.rimGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x9ae8ff).multiplyScalar(1.6), fog: false });
  m.wedgeA = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff9a40).multiplyScalar(1.2), transparent: true, opacity: 0.55, fog: false, side: THREE.DoubleSide, depthWrite: false });
  m.wedgeB = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe060).multiplyScalar(1.2), transparent: true, opacity: 0.6, fog: false, side: THREE.DoubleSide, depthWrite: false });
  m.spot = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2d8).multiplyScalar(2.0), fog: false });
  return m; }

// ---------------------------------------------------------------- shared pieces
function palm(K, x, z, s, R, y = 0) { let p = [x, y, z], a = R() * TAU, lean = 0.15 + R() * 0.2; for (let i = 0; i < 5; i++) { const q = [p[0] + Math.cos(a) * lean * s, p[1] + 1.7 * s, p[2] + Math.sin(a) * lean * s]; K.beam(M.bark, p, q, (0.22 - i * 0.025) * s, 0x8a6a4a, true, 7); p = q; lean *= 1.3; }
  for (let i = 0; i < 8; i++) { const b = i / 8 * TAU + R() * 0.3, L = (2.6 + R() * 0.8) * s; K.put(M.leaf, cached2('frond', () => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(0.5, 0.35, 1, 0.05); sh.quadraticCurveTo(0.5, -0.1, 0, 0); const g = new THREE.ShapeGeometry(sh, 6); g.rotateX(-Math.PI / 2); const P = g.attributes.position; for (let k = 0; k < P.count; k++) { const u = P.getX(k); P.setY(k, -0.45 * u * u); } g.computeVertexNormals(); return g; }), p[0], p[1], p[2], 0, b, 0, L, L, L, [0x3f8a3a, 0x4a9a42, 0x357a32][i % 3]); }
  K.put(M.paint, sph(0.25 * s, 8, 6), p[0], p[1] - 0.2 * s, p[2], 0, 0, 0, 1, 1, 1, 0x6a4a2a); }
const GC2 = new Map(); const cached2 = (k, f) => { let g = GC2.get(k); if (!g) GC2.set(k, (g = f())); return g; };
// a clock face (dial card + two hand pivots) facing +z at (x,y,z), rotated ry
function clockFace(root, r, x, y, z, ry = 0, lit = false) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; root.add(g); mesh(g, plane(2 * r, 2 * r), lit ? M.dialL : M.dial, 0, 0, 0, 0, 0, 0, false);
  const mk = (L, w) => { const p = new THREE.Group(); p.position.z = 0.02 * r; g.add(p); mesh(p, new THREE.BoxGeometry(w, L, 0.02 * r), M.hand, 0, L * 0.42, 0, 0, 0, 0, false); return p; };
  return { g, hr: mk(r * 0.5, r * 0.09), mn: mk(r * 0.78, r * 0.06) }; }
const setClock = (c, tm) => { c.hr.rotation.z = -((9 + tm / 60) / 12) * TAU; c.mn.rotation.z = -(tm / 60) * TAU; };
// generic hull: plan-view pointed bow (+x), waterline y = 0 in the ship's group
function shapeHull(g, L, D) { const P = g.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i), yy = Math.max(0, Math.min(1, y / D)), u = x / (L / 2);
    P.setZ(i, z * (0.42 + 0.58 * Math.min(1, yy * 1.5))); P.setY(i, y + yy * D * (0.22 * Math.max(0, u) ** 2 + 0.06 * Math.max(0, -u) ** 2)); } g.computeVertexNormals(); return g; }
function hull(K, L, W, top, bot, col, band) { const pts = [[-L / 2, -W * 0.85], [L * 0.28, -W], [L / 2, 0], [L * 0.28, W], [-L / 2, W * 0.85]]; K.put(M.paint, shapeHull(shapeGeo(pts, top - bot, 0.15), L, top - bot), 0, bot, 0, 0, 0, 0, 1, 1, 1, col);
  if (band) K.put(M.paint, shapeGeo(pts.map(([a, b]) => [a * 1.004, b * 1.02]), 0.5, 0.05), 0, top - 1.0, 0, 0, 0, 0, 1, 1, 1, band); }
function warship(K, L, o = {}) { const W = L * 0.075; hull(K, L, W, 3.2, -2, 0x1e1e24, 0xf2eee4); K.box(M.paint, -L * 0.42, L * 0.36, 3.2, 3.5, -W * 0.8, W * 0.8, 0xb89a72, 0.05);
  K.box(M.paint, -L * 0.1, L * 0.12, 3.5, 6.5, -W * 0.55, W * 0.55, 0xf2eee4, 0.1); K.box(M.paint, L * 0.02, L * 0.1, 6.5, 8.2, -W * 0.4, W * 0.4, 0xf2eee4, 0.05);
  const nf = o.funnels || 2; for (let i = 0; i < nf; i++) { const x = -L * 0.05 - i * L * 0.12; K.put(M.paint, cyl(W * 0.28, W * 0.3, 9, 14), x, 9, 0, 0, 0, 0, 1, 1, 1, 0xd8b070); K.put(M.paint, cyl(W * 0.3, W * 0.3, 1.2, 14), x, 13.6, 0, 0, 0, 0, 1, 1, 1, 0x1a1a1e); }
  for (const x of [L * 0.3, -L * 0.36]) { K.put(M.paint, cyl(0.25, 0.4, 24, 6), x, 14, 0, 0, 0, 0, 1, 1, 1, 0x6a5a48); K.beam(M.paint, [x, 20, -W * 0.7], [x, 20, W * 0.7], 0.2, 0x6a5a48); }
  for (const s of [-1, 1]) for (let i = 0; i < (o.guns || 4); i++) { const x = -L * 0.3 + i * L * 0.16; K.put(M.paint, cyl(0.35, 0.45, 4, 8), x, 2.6, s * (W * 0.95 + 1.2), Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2a30); }
  K.put(M.paint, cyl(1.4, 1.6, 1.4, 12), L * 0.34, 4.1, 0, 0, 0, 0, 1, 1, 1, 0x3a3a40); K.put(M.paint, cyl(0.35, 0.35, 5, 8), L * 0.34 + 2.5, 4.3, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x2a2a30); }
function yachtGeo(K) { const L = 66, W = 5.2; hull(K, L, W, 3.0, -2.6, 0xf4f0e6, 0xd8a840); K.box(M.wood, -L * 0.42, L * 0.38, 3.0, 3.2, -W * 0.82, W * 0.82, 0xc89a68, 0.04);
  K.box(M.paint, -L * 0.18, L * 0.12, 3.2, 5.6, -W * 0.6, W * 0.6, 0xf4f0e6, 0.1); for (let i = 0; i < 9; i++) K.box(M.paint, -L * 0.16 + i * 2.2, -L * 0.16 + i * 2.2 + 1.0, 4.0, 4.9, W * 0.6, W * 0.62, 0x2a2436, 0.02);
  K.put(M.paint, cyl(1.0, 1.1, 7, 14), -2, 8, 0, 0, 0, 0, 1, 1, 1, 0xe8d8b0); K.put(M.paint, cyl(1.1, 1.1, 0.8, 14), -2, 11.4, 0, 0, 0, 0, 1, 1, 1, 0x1a1a1e);
  for (const [x, h] of [[L * 0.3, 26], [-L * 0.05 + 8, 30], [-L * 0.36, 24]]) { K.put(M.paint, cyl(0.2, 0.32, h, 6), x, 3 + h / 2, 0, 0, 0, 0, 1, 1, 1, 0x8a6a48); K.beam(M.paint, [x - 0.2, 3 + h * 0.75, 0], [x - 7, 3 + h * 0.75, 0], 0.15, 0x8a6a48); }
  K.beam(M.paint, [L / 2, 3.4, 0], [L / 2 + 9, 6.5, 0], 0.22, 0x8a6a48);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) K.put(M.paint, cyl(0.25, 0.3, 2.2, 8), -L * 0.3 + i * 8, 3.6, s * (W * 0.85 + 0.8), Math.PI / 2, 0, 0, 1, 1, 1, 0x3a3a40); }
function openHull(K, L, W, y0, h, col, t = 0.08) { const P = (k) => [[-L / 2 * k, -W * 0.85 * k], [L * 0.28 * k, -W * k], [L / 2 * k, 0], [L * 0.28 * k, W * k], [-L / 2 * k, W * 0.85 * k]];
  const sh = new THREE.Shape(); P(1).forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath(); const ho = new THREE.Path(); const k = 1 - t * 2 / W; P(k).forEach(([x, y], i) => (i ? ho.lineTo(x, y) : ho.moveTo(x, y))); ho.closePath(); sh.holes.push(ho);
  const g = cached2('oh' + L + '|' + W + '|' + h, () => { const e = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }); e.rotateX(-Math.PI / 2); return e; }); K.put(M.paint, g, 0, y0, 0, 0, 0, 0, 1, 1, 1, col); }
function rowboat(root) { const g = new THREE.Group(); root.add(g); const K = new Kit(); hull(K, 6, 0.9, 0.08, -0.3, 0xf2eee4); openHull(K, 6, 0.9, 0.08, 0.45, 0xf2eee4); K.box(M.wood, -2.6, 2.0, 0.08, 0.12, -0.6, 0.6, 0x8a6a48, 0.01); K.box(M.wood, -1.6, 1.6, 0.25, 0.32, -0.75, 0.75, 0xa8784a, 0.02); for (const s of [-1, 1]) K.beam(M.wood, [-0.5, 0.5, s * 0.8], [-1.5, -0.2, s * 2.2], 0.04, 0xc8a070); K.build(g, 0); return g; }

// ================================================================= HARBOR
function buildHarbor(root) { const R = PT.rng(1896), K = new Kit();
  const water = mesh(root, plane(5000, 5000), M.water, 0, -1, 2400, -Math.PI / 2, 0, 0, false); water.receiveShadow = true;
  mesh(root, planeUV(400, 300, 40, 30), M.sand, 0, 0, -151, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  K.box(M.stone, -200, 200, -2.5, 0, -1.2, 0, 0xffffff, 0.05); for (let i = -9; i <= 9; i++) K.box(M.stone, i * 8 - 1.2, i * 8 + 1.2, -2.0, 0.05, 0, 3.2, 0xd8ccb0, 0.05);   // sea wall + steps/jetties
  // ---- the palace (front face z = -22), wraparound veranda, clock tower in front
  const pal = new THREE.Group(); root.add(pal); const KP = new Kit();
  KP.box(M.plaster, -17, 17, 0, 15.5, -38, -22, 0xffffff, 0.1); mesh(pal, plane(34, 15), M.facade, 0, 7.6, -21.96, 0, 0, 0, false);
  for (const s of [-1, 1]) mesh(pal, plane(16, 15), M.facade, s * 17.02, 7.6, -30, 0, s * Math.PI / 2, 0, false);
  for (const y of [0, 5, 10]) KP.box(M.wood, -17.5, 17.5, y, y + 0.35, -22, -18.6, 0xb8a080, 0.05);
  KP.box(M.plaster, -17.8, 17.8, 15.2, 16.0, -38.4, -18.2, 0xf2ead8, 0.1); KP.box(M.plaster, -17.8, 17.8, 16.0, 16.6, -38.4, -37.8, 0xf2ead8, 0.05);
  for (let i = 0; i <= 12; i++) { const x = -17 + i * (34 / 12); if (Math.abs(x) < 3.2) continue; KP.box(M.plaster, x - 0.22, x + 0.22, 0, 15.2, -19.0, -18.6, 0xf6f0e2, 0.06); }
  for (const y of [5.35, 10.35]) { KP.box(M.wood, -17.4, -3.2, y + 0.9, y + 1.0, -18.9, -18.7, 0xe8e0c8, 0.02); KP.box(M.wood, 3.2, 17.4, y + 0.9, y + 1.0, -18.9, -18.7, 0xe8e0c8, 0.02); for (let i = 0; i < 60; i++) { const x = -17.2 + i * 0.58; if (Math.abs(x) < 3.3) continue; KP.box(M.wood, x - 0.04, x + 0.04, y, y + 0.92, -18.85, -18.75, 0xe8e0c8, 0.01); } }
  // the tower (x -2.6..2.6, z -21..-15.8), clock faces at y 20 front + sides, roof, flagpole
  KP.box(M.plaster, -2.6, 2.6, 0, 23.5, -21, -15.8, 0xf6ecd8, 0.08); for (const y of [5, 10, 15, 23.5]) KP.box(M.plaster, -2.9, 2.9, y - 0.3, y + 0.15, -21.3, -15.5, 0xe8dcc0, 0.05);
  KP.put(M.paint, new THREE.ConeGeometry(3.9, 3.6, 4, 1), 0, 25.5, -18.4, 0, Math.PI / 4, 0, 1, 1, 1, 0x7a3a2a); KP.put(M.door, new THREE.PlaneGeometry(2.4, 3.6), 0, 1.8, -15.78, 0, 0, 0, 1, 1, 1);
  KP.put(M.paint, cyl(0.09, 0.12, 8, 6), 0, 31, -18.4, 0, 0, 0, 1, 1, 1, 0xe8e0d0);
  KP.build(pal, 0);
  const pdmg = new THREE.Group(); root.add(pdmg); { const KD = new Kit(); mesh(pdmg, plane(34, 15), M.facadeB, 0, 7.6, -21.9, 0, 0, 0, false);   // damage: scorched facade, rubble, fallen beams, broken rail
    for (let i = 0; i < 26; i++) KD.put(M.stone, lumpGeo(i + 60, 1, 0.35), -15 + R() * 30, 0.2, -18 + R() * 3.5, 0, R() * 6, 0, 0.5 + R() * 0.9, 0.3 + R() * 0.5, 0.5 + R() * 0.8, [0xd8ccb0, 0xb8a888, 0x8a7a68][i % 3]);
    for (let i = 0; i < 5; i++) KD.beam(M.dark, [-14 + i * 6.5, 0.2, -17.5 + R()], [-12 + i * 6.5 + R() * 2, 2.5 + R() * 2, -19.5], 0.18, 0x4a3020); KD.build(pdmg, 0); }
  const clocks = [clockFace(root, 1.7, 0, 20, -15.74, 0, true), clockFace(root, 1.7, 2.64, 20, -18.4, Math.PI / 2, true), clockFace(root, 1.7, -2.64, 20, -18.4, -Math.PI / 2, true)];
  const flag = mesh(root, plane(3.2, 2.0), M.flagRed, 1.65, 33.8, -18.4, 0, 0, 0, false); flag.userData.base = flag.geometry.attributes.position.array.slice(); flag.geometry = flag.geometry.clone(); flag.userData.base = flag.geometry.attributes.position.array.slice();
  // ---- the barricade: sandbags + two old cannons
  for (let i = 0; i < 46; i++) { const x = -13 + (i % 23) * 1.18, row = Math.floor(i / 23); if (Math.abs(x) < 2) continue; K.put(M.cloth, lumpGeo(i % 7 + 3, 1, 0.12), x + row * 0.5, 0.3 + row * 0.5, -11.5, 0, R() * 0.4, 0, 0.62, 0.28, 0.36, [0xc8b088, 0xb8a078, 0xd8c098][i % 3]); }
  const cannon = (x) => K.at(x, 0, -10.0, 0, () => { for (const s of [-1, 1]) K.put(M.dark, cyl(0.45, 0.45, 0.12, 14), s * 0.45, 0.45, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x4a3020); K.box(M.dark, -0.35, 0.35, 0.3, 0.6, -0.9, 0.5, 0x5a3a24, 0.03); K.put(M.metal, cyl(0.16, 0.24, 2.2, 12), 0, 0.82, 0.6, Math.PI / 2 - 0.08, 0, 0, 1, 1, 1, 0x2a2a30); });
  cannon(-3.4); cannon(3.2);
  // ---- the town: houses both sides, palms along the front
  for (const s of [-1, 1]) for (let i = 0; i < 9; i++) { const x = s * (24 + i * 9 + R() * 2), w = 7 + R() * 2, hgt = 6 + R() * 7, z0 = -14 - R() * 8, d = 8; const mm = M.house[(i + (s > 0 ? 1 : 0)) % 4];
    K.box(M.plaster, x - w / 2, x + w / 2, 0, hgt, z0 - d, z0, 0xffffff, 0.05); K.put(mm, plane(w, hgt), x, hgt / 2, z0 + 0.02, 0, 0, 0, 1, 1, 1); K.box(M.plaster, x - w / 2 - 0.2, x + w / 2 + 0.2, hgt, hgt + 0.5, z0 - d - 0.2, z0 + 0.2, 0xe8dcc0, 0.03);
    if (i % 3 === 1) K.box(M.wood, x - w / 2, x + w / 2, hgt * 0.5, hgt * 0.5 + 0.2, z0, z0 + 1.4, 0x6a4a2a, 0.02); }
  for (let i = 0; i < 22; i++) { const x = (i < 11 ? -1 : 1) * (6 + (i % 11) * 9 + R() * 4); if (Math.abs(x) < 20 && Math.abs(x) > 8) continue; palm(K, x, -6 - R() * 5, 1.0 + R() * 0.5, R); }
  for (let i = 0; i < 6; i++) palm(K, -30 - i * 14, -40 - R() * 30, 1.3, R); for (let i = 0; i < 6; i++) palm(K, 30 + i * 14, -40 - R() * 30, 1.3, R);
  K.build(root, 0);
  const hills = mesh(root, plane(900, 120), M.hills, 0, 30, -420, 0, 0, 0, false); hills.renderOrder = -1;
  const isles = mesh(root, plane(1600, 80), M.isles, 0, 14, 1300, 0, Math.PI, 0, false); isles.renderOrder = -1;
  // ---- ships: the yacht (sinkable), five warships offshore (broadside to the palace)
  const yacht = new THREE.Group(); yacht.position.set(30, -1, 46); yacht.rotation.y = -0.6; root.add(yacht); { const KY = new Kit(); yachtGeo(KY); KY.build(yacht, 0); for (const s of [-1, 1]) mesh(yacht, plane(9, 1.5), M.glasgow, -10, 1.7, s * 4.86, 0, s > 0 ? 0 : Math.PI, 0, false); }
  const SHIPS = [[-48, 270, 110, 2, 5], [62, 300, 88, 2, 4], [-6, 150, 52, 1, 3], [44, 185, 52, 1, 3], [-82, 205, 52, 1, 3]]; const ships = [];
  for (const [x, z, L, nf, ng] of SHIPS) { const g = new THREE.Group(); g.position.set(x, -1, z); g.rotation.y = Math.PI; root.add(g); const KS = new Kit(); warship(KS, L, { funnels: nf, guns: ng }); KS.build(g, 0); ships.push({ g, L, x, z }); }
  const boat = rowboat(root); boat.position.set(22, -1, 40);
  // ---- fx: muzzle flashes at the ships' palace-facing broadsides, gun smoke, hit flashes + smoke plumes on the palace, yacht's own gun
  const flashes = [], smokes = [];
  ships.forEach((s, i) => { for (let k = 0; k < 3; k++) { const x = s.x + (k - 1) * s.L * 0.2, z = s.z - s.L * 0.075 - 2.5; const fl = glowAt(root, [x, 4.5, z], s.L * 0.26, '#ffd080', 0); flashes.push({ fl, ph: (i * 37 + k * 23) % 53, per: 41 + ((i * 7 + k * 5) % 19), kind: 'gun' }); smokes.push(emitter(root, [x, 2, z], 5, { rise: 5, drift: [5, 0, -8], s0: 2, s1: 9, rate: 0.014, op: 0.4, col: 0xd8d4dc, gun: true })); } });
  const HITS = [[-9, 9, -18], [7, 12, -18], [0, 21, -15.5], [-13, 4, -18], [12, 6, -18], [-4, 14, -18]];
  HITS.forEach(([x, y, z], i) => { const fl = glowAt(root, [x, y, z + 1], 9, '#ffb060', 0); flashes.push({ fl, ph: (i * 29) % 47, per: 37 + i * 4, kind: 'hit' }); smokes.push(emitter(root, [x, y + 2, z], 6, { rise: 22, drift: [8, 0, 4], s0: 5, s1: 22, rate: 0.008, op: 0.7, col: 0x5a5260, hit: true })); });
  const yFlash = glowAt(root, [30, 2.4, 41], 8, '#ffd080', 0); smokes.push(emitter(root, [30, 2.6, 41], 4, { rise: 4, drift: [4, 0, 6], s0: 3, s1: 12, rate: 0.015, op: 0.5, col: 0xe0dce4, yacht: true }));
  for (let i = 0; i < 4; i++) smokes.push(emitter(root, [-20 + i * 14, 6, -26], 6, { rise: 40, drift: [18, 0, 6], s0: 10, s1: 36, rate: 0.004, op: 0.45, col: 0x6a6270, after: true }));
  const dust = motes(root, 40, [-6, 6, 0.4, 5, -16, -6], 61, 0.02);
  return { water, pal, pdmg, clocks, flag, yacht, ships, boat, flashes, smokes, yFlash, dust, hills };
}
// smoke emitter: n billboards cycling up and out from pos
function emitter(root, pos, n, o) { const parts = []; for (let i = 0; i < n; i++) { const m = M.smoke.clone(); m.color.set(o.col || 0x8a8490); const p = nond(mesh(root, plane(1, 1), m, ...pos, 0, 0, 0, false)); p.renderOrder = 3; p.visible = false; parts.push(p); } return { pos, parts, ...o }; }
function tickEmitter(e, f, on) { e.parts.forEach((p, i) => { if (!on) { p.visible = false; return; } const u = (f * e.rate + i / e.parts.length) % 1; p.visible = true;
  p.position.set(e.pos[0] + e.drift[0] * u, e.pos[1] + e.rise * u + e.drift[1] * u, e.pos[2] + e.drift[2] * u); p.scale.setScalar(e.s0 + (e.s1 - e.s0) * Math.sqrt(u)); p.material.opacity = e.op * on * Math.min(1, u * 6) * (1 - u); }); }

// ================================================================= THRONE ROOM
function buildThrone(root) { const R = PT.rng(25), K = new Kit(), X = 6, ZB = -5, HT = 4.6;
  mesh(root, planeUV(12, 10, 3, 3), M.tile, 0, 0, 0, -Math.PI / 2, 0, 0, false);
  K.box(M.plasterIn, -X, X, 0, HT, ZB - 0.3, ZB, 0xffffff, 0.02); for (const s of [-1, 1]) K.box(M.plasterIn, s > 0 ? X : -X - 0.3, s > 0 ? X + 0.3 : -X, 0, HT, ZB, 5, 0xffffff, 0.02);
  mesh(root, plane(2 * X, 10), H.toon({ color: 0xe8dcc0, side: THREE.DoubleSide }), 0, HT, 0, Math.PI / 2, 0, 0, false); for (let i = -2; i <= 2; i++) K.box(M.dark, i * 2.4 - 0.12, i * 2.4 + 0.12, HT - 0.25, HT, -5, 5, 0x5a3420, 0.02);
  const wins = []; for (const x of [-3.6, 3.6]) { const sh = new THREE.Shape(); sh.moveTo(-0.8, 0); sh.lineTo(0.8, 0); sh.lineTo(0.8, 1.6); sh.absarc(0, 1.6, 0.8, 0, Math.PI, false); sh.closePath(); const g = new THREE.ShapeGeometry(sh, 12); const uv = g.attributes.uv, P = g.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (P.getX(i) + 0.8) / 1.6, P.getY(i) / 2.4);
    wins.push(mesh(root, g, M.winSea, x, 1.1, ZB + 0.02, 0, 0, 0, false)); K.box(M.dark, x - 0.95, x + 0.95, 1.0, 1.1, ZB, ZB + 0.25, 0x5a3420, 0.02); for (let j = 0; j < 3; j++) K.box(M.dark, x - 0.03, x + 0.03, 1.1, 3.4, ZB, ZB + 0.06, 0x3a2414, 0.005); }
  // dais + throne, cushions, a canopy
  K.box(M.wood, -1.6, 1.6, 0, 0.3, ZB, ZB + 2.2, 0x6a4028, 0.03); K.box(M.wood, -1.3, 1.3, 0.3, 0.45, ZB, ZB + 1.8, 0x7a4a2a, 0.03); mesh(root, planeUV(2.2, 1.6, 1, 1), M.rugA, 0, 0.46, ZB + 0.95, -Math.PI / 2, 0, 0, false);
  K.at(0, 0.45, ZB + 0.6, 0, () => { K.box(M.dark, -0.55, 0.55, 0, 0.5, -0.3, 0.35, 0x8a5a2a, 0.05); K.box(M.dark, -0.55, 0.55, 0.5, 1.8, -0.4, -0.25, 0x8a5a2a, 0.06); K.put(M.paint, sph(0.14, 12, 8), 0, 1.85, -0.33, 0, 0, 0, 1, 1, 0.6, 0x8a6a2a); for (const s of [-1, 1]) { K.box(M.paint, s * 0.55 - 0.08, s * 0.55 + 0.08, 0.2, 0.85, -0.3, 0.35, 0xb88a30, 0.04); K.put(M.paint, sph(0.08, 10, 8), s * 0.55, 0.9, 0.3, 0, 0, 0, 1, 1, 1, 0xe0b048); }
    K.box(M.cloth, -0.48, 0.48, 0.5, 0.62, -0.25, 0.3, 0xa82a2a, 0.06); K.box(M.cloth, -0.45, 0.45, 0.62, 1.55, -0.26, -0.15, 0xa82a2a, 0.06); });
  for (const s of [-1, 1]) K.box(M.cloth, s * 1.5 - 0.5, s * 1.5 + 0.5, 1.0, HT - 0.1, ZB + 0.02, ZB + 0.08, 0x8a2030, 0.03); K.box(M.cloth, -2.0, 2.0, HT - 0.6, HT - 0.1, ZB + 0.02, ZB + 0.1, 0x8a2030, 0.03); // drapes behind the dais
  K.box(M.dark, -X, X, 0, 1.1, ZB, ZB + 0.05, 0x5a3420, 0.01); for (const s of [-1, 1]) K.box(M.dark, s > 0 ? X - 0.05 : -X, s > 0 ? X : -X + 0.05, 0, 1.1, ZB, 5, 0x5a3420, 0.01); K.box(M.paint, -X, X, HT - 0.45, HT - 0.3, ZB, ZB + 0.06, 0xc89a40, 0.01); // carved dado + gilt frieze
  // carved studded doors (side walls), columns, rugs, benches, brass lamps
  for (const s of [-1, 1]) { mesh(root, plane(1.6, 3.0), M.door, s * (X - 0.02), 1.5, -1.0, 0, -s * Math.PI / 2, 0, false); K.box(M.dark, s > 0 ? X - 0.25 : -X, s > 0 ? X : -X + 0.25, 3.0, 3.25, -2.0, 0.0, 0x3a2414, 0.02); }
  for (const x of [-4.4, -2.2, 2.2, 4.4]) { K.put(M.plasterIn, cyl(0.2, 0.24, HT, 14), x, HT / 2, -2.4, 0, 0, 0, 1, 1, 1, 0xf2ead8); K.box(M.plasterIn, x - 0.32, x + 0.32, 0, 0.3, -2.72, -2.08, 0xe8dcc0, 0.03); K.box(M.plasterIn, x - 0.32, x + 0.32, HT - 0.3, HT, -2.72, -2.08, 0xe8dcc0, 0.03); }
  mesh(root, planeUV(2.4, 5, 1, 2), M.rugB, 0, 0.008, 0.2, -Math.PI / 2, 0, 0, false); mesh(root, planeUV(2, 3, 1, 1), M.rugA, -4, 0.008, 1, -Math.PI / 2, 0, 0.2, false);
  for (const s of [-1, 1]) { K.box(M.wood, s * 5.0 - 0.4, s * 5.0 + 0.4, 0, 0.45, -1.5, 2.5, 0x6a4028, 0.03); K.box(M.cloth, s * 5.0 - 0.38, s * 5.0 + 0.38, 0.45, 0.6, -1.4, 2.4, 0x2a5a6a, 0.05); }
  K.at(-2.6, 0, -4.2, 0.3, () => { K.put(M.brass, cyl(0.45, 0.4, 0.06, 20), 0, 0.6, 0, 0, 0, 0, 1, 1, 1, 0xd8a840); K.put(M.dark, cyl(0.06, 0.08, 0.6, 8), 0, 0.3, 0, 0, 0, 0, 1, 1, 1, 0x3a2414); K.put(M.brass, cyl(0.06, 0.09, 0.22, 12), 0.15, 0.74, 0, 0, 0, 0, 1, 1, 1, 0xd8a840); });
  const lampP = [[-2.4, 3.2, -1], [2.4, 3.2, -1], [-2.4, 3.3, -3.6], [2.4, 3.3, -3.6]]; for (const [x, y, z] of lampP) { K.beam(M.brass, [x, HT, z], [x, y + 0.3, z], 0.012, 0x8a6a30, true, 4); K.put(M.brass, sph(0.2, 12, 8), x, y, z, 0, 0, 0, 1, 1.3, 1, 0xd8a840); K.put(M.lampGlass, sph(0.1, 8, 6), x, y - 0.12, z, 0, 0, 0, 1, 1, 1); }
  K.build(root, 0);
  const lamps = lampP.map(([x, y, z]) => glowAt(root, [x, y - 0.1, z], 1.2, '#ffc070', 0.45)); const shaft = shaftAt(root, [3.6, 1.6, -3.6], 2.2, 4.0, 0.0, 0.3, 0.2, 0xfff0d0); const shaft2 = shaftAt(root, [-3.6, 1.6, -3.6], 2.2, 4.0, 0.0, -0.3, 0.2, 0xfff0d0);
  const dust = motes(root, 50, [-3, 3, 0.4, 3.5, -4, 1], 63, 0.012);
  return { wins, lamps, shaft, shaft2, dust };
}

// ================================================================= OFFICE (British consulate) + the bill
function buildOffice(root) { const R = PT.rng(1890), K = new Kit(), X = 4.5, ZB = -4, HT = 3.4;
  mesh(root, planeUV(10, 9, 3, 3), M.wood, 0, 0, 0.5, -Math.PI / 2, 0, 0, false); mesh(root, planeUV(3.6, 2.6, 1, 1), M.rugA, 0, 0.006, -1.2, -Math.PI / 2, 0, 0, false);
  K.box(M.plaster, -X, X, 0, HT, ZB - 0.2, ZB, 0xfff6e8, 0.01); for (const s of [-1, 1]) K.box(M.plaster, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 5, 0xfff6e8, 0.01); K.box(M.dark, -X, X, 0, 0.9, ZB, ZB + 0.04, 0x6a4028, 0.01);
  mesh(root, plane(2 * X, 9), H.toon({ color: 0xece2cc, side: THREE.DoubleSide }), 0, HT, 0.5, Math.PI / 2, 0, 0, false);
  const win = mesh(root, plane(1.6, 1.8), M.winShips, -2.4, 1.9, ZB + 0.02, 0, 0, 0, false); K.box(M.wood, -3.3, -1.5, 0.94, 1.0, ZB, ZB + 0.16, 0xf2ece0, 0.01); K.box(M.wood, -2.44, -2.36, 1.0, 2.8, ZB, ZB + 0.06, 0xf2ece0, 0.005); K.box(M.wood, -3.3, -1.5, 1.86, 1.92, ZB, ZB + 0.06, 0xf2ece0, 0.005);
  for (const s of [-1, 1]) K.box(M.wood, -2.4 + s * 1.0 - 0.06, -2.4 + s * 1.0 + 0.06, 0.94, 2.86, ZB, ZB + 0.3, 0x3f6a4a, 0.02);
  mesh(root, plane(1.5, 1.12), M.map, 1.9, 1.95, ZB + 0.03, 0, 0, 0, false); K.box(M.dark, 1.1, 2.7, 1.36, 1.4, ZB, ZB + 0.06, 0x5a3420, 0.01);
  const wall = clockFace(root, 0.36, 0.0, 2.55, ZB + 0.115, 0, false); K.put(M.dark, cyl(0.42, 0.42, 0.1, 28), 0, 2.55, ZB + 0.05, Math.PI / 2, 0, 0, 1, 1, 1, 0x5a3420); K.box(M.dark, -0.12, 0.12, 1.4, 2.15, ZB, ZB + 0.12, 0x5a3420, 0.02); K.put(M.brass, sph(0.07, 10, 8), 0, 1.6, ZB + 0.14, 0, 0, 0, 1, 1, 1, 0xd8a840);
  // desk + chairs, inkwell, papers, lamp, globe, bookcase, ceiling fan
  const DZ = -1.6; K.box(M.dark, -1.3, 1.3, 0.76, 0.82, DZ - 0.55, DZ + 0.55, 0x5a3420, 0.03); for (const s of [-1, 1]) K.box(M.dark, s * 0.95 - 0.32, s * 0.95 + 0.32, 0, 0.76, DZ - 0.5, DZ + 0.5, 0x4a2a1a, 0.02); K.box(M.cloth, -0.9, 0.9, 0.82, 0.83, DZ - 0.4, DZ + 0.3, 0x2a5a3a, 0.005);
  K.put(M.metal, cyl(0.05, 0.06, 0.07, 12), 0.75, 0.86, DZ - 0.2, 0, 0, 0, 1, 1, 1, 0x1a1a24); K.beam(M.paint, [0.75, 0.88, DZ - 0.2], [0.82, 1.08, DZ - 0.25], 0.006, 0xf2ece0, true, 4);
  for (let i = 0; i < 4; i++) K.box(M.paint, -0.85 + i * 0.03, -0.45 + i * 0.03, 0.83 + i * 0.004, 0.834 + i * 0.004, DZ - 0.3 + i * 0.02, DZ + 0.1 + i * 0.02, 0xf6efdc, 0.002);
  K.at(-0.95, 0.82, DZ - 0.35, 0, () => { K.put(M.brass, cyl(0.07, 0.09, 0.03, 12), 0, 0.015, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); K.beam(M.brass, [0, 0, 0], [0.04, 0.36, 0], 0.012, 0xc8a050, true, 6); K.put(M.paint, new THREE.ConeGeometry(0.12, 0.14, 14, 1, true), 0.06, 0.38, 0, 0, 0, 0.3, 1, 1, 1, 0x2a5a3a); });
  K.at(-3.6, 0, -2.6, 0.4, () => { K.put(M.dark, cyl(0.04, 0.2, 0.8, 10), 0, 0.4, 0, 0, 0, 0, 1, 1, 1, 0x4a2a1a); K.put(M.paint, sph(0.3, 18, 12), 0, 1.15, 0, 0, 0, 0.4, 1, 1, 1, 0x7ab0c8); K.put(M.brass, tor0(0.33), 0, 1.15, 0, 0, 0, 0.4, 1, 1, 1, 0xc8a050); });
  K.box(M.dark, 3.0, 4.4, 0, 2.4, -3.95, -3.55, 0x5a3420, 0.02); for (let j = 0; j < 4; j++) { K.box(M.dark, 3.02, 4.38, 0.4 + j * 0.5, 0.44 + j * 0.5, -3.95, -3.56, 0x4a2a1a, 0.005); for (let i = 0; i < 9; i++) { const h = 0.28 + R() * 0.12; K.box(M.paint, 3.08 + i * 0.145, 3.2 + i * 0.145, 0.44 + j * 0.5, 0.44 + j * 0.5 + h, -3.9, -3.62, [0x8a3a2a, 0x2a4a6a, 0x3a6a3a, 0xc8a050, 0x5a3a5a][(i + j) % 5], 0.005); } }
  K.box(M.dark, -0.3, 0.3, 0, 0.5, DZ - 1.0, DZ - 0.7, 0x4a2a1a, 0.02); K.box(M.cloth, -0.3, 0.3, 0.5, 1.1, DZ - 1.05, DZ - 0.95, 0x6a2a2a, 0.04);
  for (const x of [-0.6, 0.6]) K.at(x, 0, DZ + 1.1, x > 0 ? -0.3 : 0.3, () => { K.box(M.dark, -0.25, 0.25, 0.42, 0.48, -0.25, 0.25, 0x5a3420, 0.02); K.box(M.dark, -0.25, 0.25, 0.48, 1.0, 0.2, 0.26, 0x5a3420, 0.02); for (const a of [-1, 1]) for (const b of [-1, 1]) K.box(M.dark, a * 0.2 - 0.025, a * 0.2 + 0.025, 0, 0.42, b * 0.2 - 0.025, b * 0.2 + 0.025, 0x4a2a1a, 0.005); });
  K.build(root, 0);
  const fan = new THREE.Group(); fan.position.set(0, HT - 0.35, -1.2); root.add(fan); { const KF = new Kit(); KF.put(M.brass, cyl(0.08, 0.08, 0.12, 12), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); for (let i = 0; i < 4; i++) KF.at(0, -0.02, 0, i * Math.PI / 2, () => KF.box(M.dark, 0.1, 0.75, -0.01, 0.01, -0.08, 0.08, 0x5a3420, 0.01)); KF.build(fan, 0); }
  mesh(root, cyl(0.01, 0.01, 0.35, 4), M.hand, 0, HT - 0.17, -1.2, 0, 0, 0, false);
  // the bill: sheet + spent brass shell casings + coin stacks (visible in 'ofBill')
  const bill = new THREE.Group(); root.add(bill); { const KB = new Kit(); for (let i = 0; i < 7; i++) KB.at(0.15 + i * 0.13, 0.83, DZ - 0.32 + (i % 2) * 0.05, 0, () => { KB.put(M.brass, cyl(0.04, 0.04, 0.22, 14), 0, 0.11, 0, 0, 0, 0, 1, 1, 1, 0xd8a840); KB.put(M.brass, cyl(0.045, 0.045, 0.012, 14), 0, 0.006, 0, 0, 0, 0, 1, 1, 1, 0xb88a30); });
    for (let i = 0; i < 3; i++) for (let k = 0; k < 4 + i * 2; k++) KB.put(M.brass, cyl(0.035, 0.035, 0.008, 14), -0.8 + i * 0.1, 0.834 + k * 0.009, DZ + 0.22, 0, 0, 0, 1, 1, 1, 0xe0c060); KB.build(bill, 0);
    mesh(bill, plane(0.36, 0.45), M.bill, -0.12, 0.838, DZ + 0.08, -Math.PI / 2, 0, 0.1, false); }
  const lamp = glowAt(root, [-0.89, 1.15, DZ - 0.35], 0.9, '#ffe0a0', 0.4); const shaft = shaftAt(root, [-2.4, 1.4, ZB + 1.6], 2.4, 3.4, 0.0, 0.3, 0.18, 0xfff0d0);
  const dust = motes(root, 40, [-2, 2, 0.4, 2.8, -3.4, 0.6], 67, 0.01);
  return { win, wall, fan, bill, lamp, shaft, dust, DZ };
}
const tor0 = (r) => cached2('tor' + r, () => new THREE.TorusGeometry(r, 0.012, 6, 40, Math.PI));

// ================================================================= GERMAN CONSULATE (garden + water gate)
function buildConsul(root) { const R = PT.rng(1002), K = new Kit();
  const water = mesh(root, plane(3000, 3000), M.water, 0, -0.5, 1500, -Math.PI / 2, 0, 0, false); water.receiveShadow = true;
  mesh(root, planeUV(80, 60, 8, 6), M.sand, 0, 0, -30.4, -Math.PI / 2, 0, 0, false).receiveShadow = true; mesh(root, planeUV(1.6, 11, 1, 6), M.tile, 0, 0.01, -5.5, -Math.PI / 2, 0, 0, false);
  K.box(M.plaster, -9, 9, 0, 9, -20, -12, 0xffffff, 0.08); mesh(root, plane(18, 9), M.house[2], 0, 4.5, -11.97, 0, 0, 0, false); K.box(M.plaster, -9.3, 9.3, 9, 9.5, -20.3, -11.7, 0xe8dcc0, 0.04);
  K.box(M.wood, -3, 3, 4.4, 4.6, -12, -10.6, 0xe8e0c8, 0.03); for (let i = 0; i < 16; i++) K.box(M.wood, -2.9 + i * 0.39, -2.86 + i * 0.39, 4.6, 5.5, -10.7, -10.64, 0xe8e0c8, 0.005); K.box(M.wood, -3, 3, 5.45, 5.55, -10.72, -10.6, 0xe8e0c8, 0.01);
  K.put(M.door, new THREE.PlaneGeometry(1.6, 2.8), 0, 1.4, -11.95, 0, 0, 0, 1, 1, 1); K.put(M.consSign, new THREE.PlaneGeometry(1.5, 0.58), 1.9, 2.3, -11.94, 0, 0, 0, 1, 1, 1);
  K.put(M.paint, cyl(0.06, 0.08, 5, 6), 0, 11.7, -16, 0, 0, 0, 1, 1, 1, 0xe8e0d0); const flag = mesh(root, plane(2.4, 1.5), M.flagDE, 1.25, 13.3, -16, 0, 0, 0, false); flag.geometry = flag.geometry.clone(); flag.userData.base = flag.geometry.attributes.position.array.slice();
  // garden: palms, shrubs, path; the sea wall along z = 0 with a water gate (x -1..1) and steps down to the tide
  for (let i = 0; i < 9; i++) palm(K, (i % 2 ? 1 : -1) * (3 + R() * 6), -2 - R() * 8, 0.8 + R() * 0.3, R);
  for (let i = 0; i < 18; i++) K.put(M.leaf, lumpGeo(i + 5, 1, 0.25), (R() - 0.5) * 16, 0.4, -1.4 - R() * 9, 0, R() * 6, 0, 0.6 + R() * 0.4, 0.5, 0.6 + R() * 0.4, [0x3f7a34, 0x4a8a3a, 0x356a2e][i % 3]);
  for (const s of [-1, 1]) { K.box(M.plaster, s > 0 ? 1.0 : -30, s > 0 ? 30 : -1.0, -0.5, 2.2, -0.5, 0.0, 0xf2ead8, 0.05); K.box(M.plaster, s * 1.0 - 0.3, s * 1.0 + 0.3, -0.5, 3.0, -0.6, 0.1, 0xe8dcc0, 0.05); K.put(M.paint, sph(0.22, 10, 8), s * 1.0, 3.2, -0.25, 0, 0, 0, 1, 1, 1, 0xe8dcc0); }
  K.box(M.dark, -1.05, 1.05, 2.6, 2.85, -0.45, -0.05, 0x3a2414, 0.02); for (let i = 0; i < 4; i++) K.box(M.stone, -1.0, 1.0, -0.5 - i * 0.15, -0.35 - i * 0.15, i * 0.35, i * 0.35 + 0.35, 0xc8b898, 0.02);
  for (const s of [-1, 1]) { K.beam(M.metal, [s * 1.0, 3.0, -0.25], [s * 1.0, 3.3, 0.3], 0.02, 0x2a2a30); K.put(M.metal, cyl(0.1, 0.12, 0.26, 8), s * 1.0, 3.12, 0.3, 0, 0, 0, 1, 1, 1, 0x2a2a30); K.put(M.lampGlass, sph(0.07, 8, 6), s * 1.0, 3.1, 0.3, 0, 0, 0, 1, 1, 1); }
  K.build(root, 0);
  const boat = rowboat(root); boat.position.set(0.4, -0.5, 2.2); boat.rotation.y = 0.08;
  const far = new THREE.Group(); far.position.set(-40, -0.5, 160); far.rotation.y = 0.2; root.add(far); { const KS = new Kit(); warship(KS, 60, { funnels: 1, guns: 3 }); KS.build(far, 0); }
  const isles = mesh(root, plane(1600, 80), M.isles, 0, 14, 1000, 0, Math.PI, 0, false); isles.renderOrder = -1;
  const lamps = [glowAt(root, [-1.0, 3.1, 0.3], 0.9, '#ffd080', 0.5), glowAt(root, [1.0, 3.1, 0.3], 0.9, '#ffd080', 0.5)];
  const haze = []; for (let i = 0; i < 3; i++) haze.push(emitter(root, [-30 + i * 25, 4, -40], 5, { rise: 30, drift: [14, 0, 0], s0: 14, s1: 40, rate: 0.004, op: 0.35, col: 0x8a8490 }));
  const dust = motes(root, 40, [-3, 3, 0.4, 3, -6, 2], 69, 0.012);
  return { water, flag, boat, lamps, haze, dust, far };
}

// ================================================================= CLOCK VOID
function buildClock(root) { const K = new Kit();
  const fl = mesh(root, planeUV(40, 40, 10, 10), M.gridFloor, 0, 0, -8, -Math.PI / 2, 0, 0, false); mesh(root, planeUV(40, 16, 10, 4), M.gridWall, 0, 8, -9, 0, 0, 0, false);
  const big = new THREE.Group(); big.position.set(0, 2.7, -3); root.add(big); const RR = 2.2;
  const c = clockFace(big, RR, 0, 0, 0.02, 0, true); K.put(M.brass, new THREE.TorusGeometry(RR * 1.02, 0.12, 12, 72), 0, 0, 0.02, 0, 0, 0, 1, 1, 1, 0xd8a840); K.put(M.dark, cyl(RR * 1.06, RR * 1.06, 0.3, 64), 0, 0, -0.14, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a2414);
  K.put(M.brass, cyl(0.25, 0.35, 0.5, 16), 0, RR + 0.35, 0, 0, 0, 0, 1, 1, 1, 0xd8a840); K.put(M.brass, new THREE.TorusGeometry(0.3, 0.07, 10, 30), 0, RR + 0.85, 0, 0, 0, 0, 1, 1, 1, 0xd8a840); K.build(big, 0);
  const wedges = []; for (let i = 0; i < 45; i++) { const g = new THREE.CircleGeometry(RR * 0.93, 3, Math.PI / 2 - (i + 1) / 60 * TAU, TAU / 60); const w = mesh(big, g, i < 38 ? M.wedgeA : M.wedgeB, 0, 0, 0.035, 0, 0, 0, false); w.renderOrder = 4; w.visible = false; wedges.push(w); }
  for (const h of [c.hr, c.mn]) h.position.z = 0.06;
  K.box(M.paint, -0.9, 0.9, 0, 0.5, -1.0, -0.2, 0x2a4a8a, 0.03); K.build(root, 0);
  const halo = glowAt(root, [0, 2.7, -3.3], 7, '#6aa8ff', 0.35);
  const dust = motes(root, 60, [-3, 3, 0.2, 5, -4, 1], 79, 0.014);
  return { big, c, wedges, halo, dust };
}

// ================================================================= lights, grades, API
const SET_LIGHT = {
  hbDawn: { top: '#5a6ab8', hor: '#ffc8a0', fog: '#f0c8b0', fogN: 120, fogF: 1400, sky: '#c8a8d8', ground: '#6a5060', hemiI: 0.8, fillCol: '#7a7ad8', fillI: 0.38, sunCol: '#ffc890', sunI: 3.0, az: 70, el: 14, disc: '#fff0c8', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff2e8', fxTint: '#fff6ea', shafts: 0.4 },
  hbMorning: { top: '#3a7ad8', hor: '#b8d4f0', fog: '#d0e4f2', fogN: 140, fogF: 1500, sky: '#9fc0f0', ground: '#6a5a50', hemiI: 0.78, fillCol: '#7d93e6', fillI: 0.36, sunCol: '#fff0d0', sunI: 3.6, az: 60, el: 30, disc: '#fffbe8', discSize: 0.003, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0.3 },
  hbBattle: { top: '#5a6a98', hor: '#e8b890', fog: '#c8a898', fogN: 90, fogF: 900, sky: '#b8a0a0', ground: '#5a4a48', hemiI: 0.78, fillCol: '#8a78c8', fillI: 0.38, sunCol: '#ffd0a0', sunI: 3.0, az: 60, el: 26, disc: '#fff0c8', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff0e4', fxTint: '#fff2e4', shafts: 0.5 },
  hbAfter: { top: '#4a5470', hor: '#a8a4ac', fog: '#9a98a4', fogN: 60, fogF: 700, sky: '#8a8ca8', ground: '#4a4450', hemiI: 0.8, fillCol: '#7a80c0', fillI: 0.4, sunCol: '#e8dcd0', sunI: 2.2, az: 60, el: 26, disc: '#000000', clouds: true, stars: 0, cardTint: '#eeeef4', fxTint: '#ffffff', shafts: 0.2 },
  thMourn: { top: '#000000', hor: '#141a30', fog: '#141a30', fogN: 10, fogF: 40, sky: '#7a8ad0', ground: '#2a2030', hemiI: 0.62, fillCol: '#4a68e8', fillI: 0.48, sunCol: '#a0b8ff', sunI: 1.3, az: 160, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#e8ecff', fxTint: '#ffffff', shafts: 0 },
  thDay: { top: '#000000', hor: '#3a2618', fog: '#3a2618', fogN: 12, fogF: 50, sky: '#ffe0b0', ground: '#5a3a2a', hemiI: 0.85, fillCol: '#7a78c8', fillI: 0.36, sunCol: '#ffd8a0', sunI: 2.6, az: 160, el: 32, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff2e4', fxTint: '#ffffff', shafts: 0 },
  ofDay: { top: '#000000', hor: '#c8c0b0', fog: '#c8c0b0', fogN: 14, fogF: 60, sky: '#f0f0f8', ground: '#7a6a5a', hemiI: 0.92, fillCol: '#8a98d8', fillI: 0.34, sunCol: '#fff4e0', sunI: 2.8, az: 150, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  ofBill: { top: '#000000', hor: '#3a2618', fog: '#3a2618', fogN: 12, fogF: 60, sky: '#ffd8a8', ground: '#5a3a2a', hemiI: 0.85, fillCol: '#7a78c8', fillI: 0.36, sunCol: '#ffc888', sunI: 2.4, az: 150, el: 22, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
  gcDay: { top: '#4a5a90', hor: '#c8b8b0', fog: '#b8b0b8', fogN: 40, fogF: 500, sky: '#a8a8c8', ground: '#5a4a50', hemiI: 0.8, fillCol: '#6a78d8', fillI: 0.42, sunCol: '#ffe0c0', sunI: 2.6, az: 60, el: 30, disc: '#000000', clouds: true, stars: 0, cardTint: '#f4f2f8', fxTint: '#ffffff', shafts: 0.3 },
  gcDusk: { top: '#2a2a70', hor: '#ff9a70', fog: '#a87a90', fogN: 40, fogF: 600, sky: '#7a6ac0', ground: '#3a2a40', hemiI: 0.75, fillCol: '#5a5ad8', fillI: 0.45, sunCol: '#ff9a60', sunI: 2.2, az: 200, el: 6, disc: '#ffe0b0', discSize: 0.006, clouds: true, stars: 0, cardTint: '#ffe8e0', fxTint: '#fff2ea', shafts: 0.5 },
  void: { top: '#000000', hor: '#0a1430', fog: '#0a1430', fogN: 8, fogF: 40, sky: '#8ab8ff', ground: '#10204a', hemiI: 0.75, fillCol: '#5a88ff', fillI: 0.45, sunCol: '#d8ecff', sunI: 2.0, az: 140, el: 50, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#eef4ff', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  hbDawn: { look: 'golden', over: { exp: 1.06, con: 1.2, sat: 1.1, tS: ['#3a2a8a', 0.18], tH: ['#ffc898', 0.1], bloom: [0.44, 0.76], hal: [0.24, '#ff9a60'], vig: [0.3, 0.46, '#1e1a3a'] } },
  hbMorning: { look: 'day', over: { exp: 1.04, con: 1.2, sat: 1.12, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c8', 0.06], bloom: [0.38, 0.84], vig: [0.26, 0.5, '#3a2a4a'] } },
  hbBattle: { look: 'golden', over: { exp: 1.04, con: 1.24, sat: 1.06, tS: ['#3a2a6a', 0.2], tH: ['#ffc080', 0.12], bloom: [0.46, 0.72], hal: [0.28, '#ff8a50'], vig: [0.36, 0.44, '#1a1020'] } },
  hbAfter: { look: 'night', over: { exp: 1.06, con: 1.16, sat: 0.72, lift: [0.03, 0.03, 0.05], tS: ['#2a2a5a', 0.2], tH: ['#e8e0e8', 0.06], bloom: [0.4, 0.8], vig: [0.4, 0.42, '#0a0a18'] } },
  thMourn: { look: 'night', over: { exp: 1.14, con: 1.2, sat: 0.95, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.12], bloom: [0.5, 0.68], hal: [0.28, '#ffa050'], vig: [0.42, 0.42, '#08081a'] } },
  thDay: { look: 'office', over: { exp: 1.1, con: 1.22, sat: 1.1, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.44, 0.76], hal: [0.24, '#ff9a50'], vig: [0.34, 0.46, '#2a1420'] } },
  ofDay: { look: 'day', over: { exp: 1.04, con: 1.2, sat: 1.08, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c8', 0.06], bloom: [0.38, 0.84], vig: [0.28, 0.48, '#3a2a4a'] } },
  ofBill: { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.08, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.12], bloom: [0.44, 0.76], hal: [0.26, '#ff9a50'], vig: [0.36, 0.44, '#2a1420'] } },
  gcDay: { look: 'night', over: { exp: 1.1, con: 1.18, sat: 0.9, lift: [0.025, 0.03, 0.06], tS: ['#1a2a7a', 0.22], tH: ['#ffe0c0', 0.08], bloom: [0.44, 0.74], vig: [0.38, 0.44, '#08081a'] } },
  gcDusk: { look: 'golden', over: { exp: 1.08, con: 1.22, sat: 1.08, tS: ['#2a2a8a', 0.22], tH: ['#ffb080', 0.12], bloom: [0.46, 0.72], hal: [0.3, '#ff8a60'], vig: [0.38, 0.44, '#14102a'] } },
  void: { look: 'night', over: { exp: 1.14, con: 1.22, sat: 1.1, lift: [0.02, 0.03, 0.07], tS: ['#1a2a7a', 0.24], tH: ['#c8e8ff', 0.1], bloom: [0.5, 0.66], hal: [0.3, '#6aa8ff'], vig: [0.4, 0.42, '#04061a'] } },
};

export function buildZZ(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'hbMorning', tm: 0, dmg: 0, flag: 0, sink: 0, fire: 0, hits: 0, yfire: 0, boatT: 0, after: 0, wedge: 0, bill: 0, gcBoat: 0, fan: 1 };
  let hb, th, of, gc, ck;
  const API = makeAPI(ctx, { prefix: 'zz_', origin: ZZ_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { hbDawn: 'day', hbMorning: 'day', hbBattle: 'day', hbAfter: 'day', gcDay: 'day', gcDusk: 'day' },
    practicals: (name, F, W3) => { const fl = 1 + 0.04 * Math.sin(F * 0.7) + 0.02 * Math.sin(F * 1.9);
      if (name === 'hbBattle') { const k = hb ? Math.max(0, ...hb.flashes.filter((x) => x.kind === 'hit').map((x) => x.fl.material.opacity)) : 0; return [{ p: W3('harbor', [0, 10, -12]), col: '#ffa050', I: 30 * k, d: 40 }]; }
      if (name.startsWith('th')) return [{ p: W3('throne', [-2.4, 3.0, -1]), col: '#ffc070', I: (name === 'thMourn' ? 2.5 : 2) * fl, d: 5 }, { p: W3('throne', [2.4, 3.0, -1]), col: '#ffc070', I: (name === 'thMourn' ? 2.5 : 2) * fl, d: 5 }, { p: W3('throne', [0, 2.6, 1.5]), col: '#ffd890', I: 2 * fl, d: 7 }, { p: W3('throne', [0, 3.9, -1.5]), col: name === 'thMourn' ? '#8aa0ff' : '#fff0d0', I: 2.5, d: 8 }];
      if (name.startsWith('of')) return [{ p: W3('office', [-0.9, 1.25, -1.95]), col: '#ffe0a0', I: (name === 'ofBill' ? 1.6 : 1.5) * fl, d: 4 }, { p: W3('office', [-2.4, 1.9, -3.4]), col: name === 'ofBill' ? '#ffb070' : '#fff4e0', I: 4, d: 8 }, { p: W3('office', [0, 2.6, 1.0]), col: '#ffe8c8', I: 2, d: 7 }];
      if (name.startsWith('gc')) return [{ p: W3('consul', [-1.0, 3.0, 0.5]), col: '#ffc070', I: (name === 'gcDusk' ? 4 : 1.5) * fl, d: 6 }, { p: W3('consul', [1.0, 3.0, 0.5]), col: '#ffc070', I: (name === 'gcDusk' ? 4 : 1.5) * fl, d: 6 }];
      if (name === 'void') return [{ p: W3('clock', [0, 4.2, -0.5]), col: '#9ac8ff', I: 5, d: 8 }, { p: W3('clock', [-0.8, 1.4, 1.2]), col: '#fff0d0', I: 1.6, d: 5 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'harbor' && hb) { tickMotes(hb.dust, f, 0.3); for (const t of [M.waterD, M.waterG]) t.offset.set(f * 0.00035, Math.sin(f * 0.02) * 0.004 + f * 0.0002);
        hb.clocks.forEach((c) => setClock(c, ST.tm)); hb.pdmg.visible = ST.dmg > 0.5;
        const fp = hb.flag.geometry.attributes.position, b = hb.flag.userData.base; for (let i = 0; i < fp.count; i++) { const x = b[i * 3] + 1.6; fp.setZ(i, Math.sin(x * 1.8 - T * 6) * 0.18 * x); } fp.needsUpdate = true; hb.flag.position.y = 33.8 - 5.6 * ST.flag;
        const sk = ST.sink; hb.yacht.position.y = -1 - 10.5 * sk * sk; hb.yacht.rotation.set(0.12 * sk + 0.01 * Math.sin(T * 1.1), -0.6, -0.32 * Math.min(1, sk * 1.6) + 0.008 * Math.sin(T * 0.8));
        hb.ships.forEach((s, i) => { s.g.position.y = -1 + 0.08 * Math.sin(T * 0.9 + i); s.g.rotation.z = 0.006 * Math.sin(T * 0.7 + i * 2); });
        hb.boat.visible = ST.boatT > 0; hb.boat.position.set(22 + 6 * ST.boatT, -1 + 0.05 * Math.sin(T * 2), 40 - 26 * ST.boatT); hb.boat.rotation.y = Math.PI / 2 + 0.3; hb.boat.rotation.z = 0.03 * Math.sin(T * 1.7);
        hb.flashes.forEach((x) => { const on = x.kind === 'gun' ? ST.fire : ST.hits, u = (f + x.ph) % x.per; x.fl.material.opacity = on ? on * (u < 3 ? 0.95 : u < 9 ? 0.95 * (1 - (u - 3) / 6) : 0) : 0; x.fl.visible = x.fl.material.opacity > 0.01; });
        hb.yFlash.material.opacity = ST.yfire ? (f % 29 < 2 ? 0.9 : f % 29 < 5 ? 0.9 * (1 - (f % 29 - 2) / 3) : 0) * ST.yfire : 0; hb.yFlash.visible = hb.yFlash.material.opacity > 0.01;
        for (const e of hb.smokes) tickEmitter(e, f, e.gun ? ST.fire : e.hit ? Math.max(ST.hits, ST.after * 0.8) : e.yacht ? ST.yfire : e.after ? ST.after : 0); }
      if (cur === 'throne' && th) { tickMotes(th.dust, f, 0.3); th.lamps.forEach((g, i) => (g.material.opacity = g.userData.op * (0.9 + 0.1 * Math.sin(f * 0.6 + i)))); }
      if (cur === 'office' && of) { tickMotes(of.dust, f, 0.3); setClock(of.wall, ST.tm); of.fan.rotation.y = T * 2.4 * ST.fan; of.bill.visible = ST.bill > 0; }
      if (cur === 'consul' && gc) { tickMotes(gc.dust, f, 0.3); M.waterD.offset.set(f * 0.00035, f * 0.0002); const fp = gc.flag.geometry.attributes.position, b = gc.flag.userData.base; for (let i = 0; i < fp.count; i++) { const x = b[i * 3] + 1.2; fp.setZ(i, Math.sin(x * 2.2 - T * 5) * 0.12 * x); } fp.needsUpdate = true;
        gc.boat.position.y = -0.5 + 0.05 * Math.sin(T * 1.6); gc.boat.position.z = 2.2 + 4 * ST.gcBoat; gc.boat.rotation.z = 0.03 * Math.sin(T * 1.3); for (const e of gc.haze) tickEmitter(e, f, ST.mood === 'gcDay' ? 1 : 0); }
      if (cur === 'clock' && ck) { tickMotes(ck.dust, f, 0.3); const n = Math.round(ST.wedge); ck.wedges.forEach((w, i) => (w.visible = i < n)); setClock(ck.c, ST.tm); ck.big.position.y = 2.7 + 0.03 * Math.sin(T * 1.2); } },
    mood: (name) => { ST.mood = name; if (hb) { M.water.map = name === 'hbAfter' || name === 'hbBattle' ? M.waterG : M.waterD; hb.hills.material.opacity = name === 'hbAfter' ? 0.6 : 1; }
      if (gc && name.startsWith('gc')) M.water.map = name === 'gcDusk' ? M.waterN : M.waterG;
      if (th) th.wins.forEach((w) => (w.material = name === 'thMourn' ? M.winSeaN : M.winSea)); if (th) { th.shaft.visible = th.shaft2.visible = name === 'thDay'; }
      if (of) { of.win.material = name === 'ofBill' ? M.winGold : M.winShips; of.shaft.material.color.set(name === 'ofBill' ? 0xffb070 : 0xfff0d0); } },
    apply: (v) => { if (v.st) Object.assign(ST, v.st); } });
  hb = buildHarbor(API.groups.harbor); th = buildThrone(API.groups.throne); of = buildOffice(API.groups.office); gc = buildConsul(API.groups.consul); ck = buildClock(API.groups.clock);
  API.parts = { hb, th, of, gc, ck };
  API.set = (o) => Object.assign(ST, o);
  const bill = (cur) => cur === 'harbor' ? [...hb.flashes.map((x) => x.fl), hb.yFlash, ...hb.smokes.flatMap((e) => e.parts)] : cur === 'throne' ? [...th.lamps] : cur === 'office' ? [of.lamp] : cur === 'consul' ? [...gc.lamps, ...gc.haze.flatMap((e) => e.parts)] : cur === 'clock' ? [ck.halo] : [];
  API.face = () => { const cam = H.CAM; if (!cam || !API.cur) return; for (const g of bill(API.cur)) g.quaternion.copy(cam.quaternion); };
  const V = API.V;
  API.views = [
    V('hbMorning', [0, 2.2, 60], [0, 12, -20], 40, 0.6, [0, 10, -18], { st: { tm: 0 } }), // 0 palace from the sea
    V('hbMorning', [0, 19.5, -9], [0, 20, -16], 40, 3.0, [0, 20, -15.7], { st: { tm: 2 } }), // 1 tower clock close
    V('hbMorning', [3, 1.7, -4], [0, 2.2, -14], 44, 1.2, [0, 1, -11], {}), // 2 barricade + cannons
    V('hbMorning', [16, 2.6, 4], [30, 3, 46], 40, 0.8, [30, 3, 46], {}), // 3 yacht from the quay
    V('hbBattle', [10, 6, 360], [0, 8, 0], 30, 0.5, [0, 4, 200], { st: { fire: 1, hits: 1, tm: 2 } }), // 4 battle from behind the fleet
    V('hbBattle', [16, 2.6, 4], [30, 2, 46], 40, 0.8, [30, 2, 46], { st: { sink: 0.8, boatT: 0.5, yfire: 0 } }), // 5 sinking yacht
    V('hbAfter', [8, 3, 22], [0, 14, -18], 44, 0.8, [0, 10, -18], { st: { dmg: 1, flag: 0.9, after: 1, tm: 40 } }), // 6 after: damage + flag down
    V('hbDawn', [-40, 8, 80], [0, 10, -10], 40, 0.6, [0, 8, -18], {}), // 7 dawn establishing
    V('thMourn', [0.8, 1.6, 3.6], [0, 1.3, -4], 46, 1.2, [0, 1.0, -4.2]), // 8 throne mourn
    V('thDay', [1.2, 1.6, 3.6], [0, 1.3, -4], 46, 1.2, [0, 1.0, -4.2]), // 9 throne day
    V('ofDay', [0.6, 1.6, 2.6], [-0.2, 1.4, -3.5], 46, 1.2, [0, 1.0, -1.6], { st: { tm: -10 } }), // 10 office
    V('ofBill', [0.2, 1.35, -0.6], [-0.1, 0.82, -1.65], 42, 3.0, [-0.1, 0.84, -1.6], { st: { bill: 1 } }), // 11 bill close
    V('gcDay', [3, 2, 9], [0, 3, -12], 44, 0.8, [0, 2, -11.5]), // 12 consulate facade
    V('gcDusk', [4, 1.8, 6], [0, 0.8, 0.5], 42, 1.2, [0, 0.4, 1.5]), // 13 water gate + boat
    V('void', [0.4, 2.2, 5], [0, 2.6, -3], 44, 1.0, [0, 2.6, -3], { st: { wedge: 42, tm: 42 } }), // 14 clock void
  ];
  API.tick(0);
  return API;
}
