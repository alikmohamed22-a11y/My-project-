// doh_works.js [PD-sets2]: sets for "Play-Doh was invented to clean your walls" (Oddverra short).
//   factory  : 1930s Cincinnati soap works: brick hall, steel trusses, high factory windows with sun shafts, big mixing VAT of off-white
//              putty (turning paddle), filler + CONVEYOR of "WALLPAPER CLEANER" cans (run(v)), crate stacks, soap bars, painted wall sign,
//              glass office with the SALES chart (chart(up, t) drawn left to right). Moods: 'factory' (busy, sunny),
//              'factoryBust' (1950s: stopped belt, dusty, cobwebs, dim + cold), 'factoryNew' (1956 reformulation: sacks + scent).  origin (-21500, 0, 0)
//   toystore : 1956 toy shop: tall display shelves of plain off-white PLAY-DOH cans; colors(r, y, b) pops in red / yellow / blue cans
//              (1957); tops, trains, teddy, tin robot, cash register, gumball jar, shop window onto a 1950s street.           origin (-21500, 0, 600)
//   playroom : modern kid's room, golden afternoon: low table with bright dough (red / yellow / blue / green), tubs, cutters, rolling pin,
//              a squishable dough ball (squish(t)), string lights, shelves, rainbow mural.                                   origin (-21500, 0, 1200)
import { Kit } from './world.js';
import { H, TAU, clamp01, sm, backOut, SERIF, SANS, cyl, sph, tor, plane, planeUV, lathe, mesh, nond, lumpGeo, doughGeo, snakeGeo, shapeGeo, starPts, heartPts,
  txt, grain, glowAt, shaftAt, motes, tickMotes, canLabel, makeAPI, initDoh } from './doh_kit.js';

export const WORKS_ORIGIN = { factory: [-21500, 0, 0], toystore: [-21500, 0, 600], playroom: [-21500, 0, 1200] };
let THREE, PT, M;
const GROUP_OF = { factory: 'factory', factoryBust: 'factory', factoryNew: 'factory', toystore: 'toystore', playroom: 'playroom' };

// ---------------------------------------------------------------- painters
function wallSign(g, w, h) { g.clearRect(0, 0, w, h); const R = PT.rng(36); // faded painted sign on brick (transparent card), invented generic name
  g.fillStyle = 'rgba(30,40,70,0.82)'; g.fillRect(w * 0.02, h * 0.04, w * 0.96, h * 0.92); g.strokeStyle = 'rgba(240,230,200,0.9)'; g.lineWidth = h * 0.03; g.strokeRect(w * 0.04, h * 0.08, w * 0.92, h * 0.84);
  txt(g, 'SOAP WORKS', w / 2, h * 0.36, w * 0.86, h * 0.36, { col: 'rgba(244,234,204,0.95)', font: SERIF }); txt(g, 'CINCINNATI, OHIO', w / 2, h * 0.72, w * 0.7, h * 0.18, { col: 'rgba(240,200,120,0.95)', font: SERIF });
  g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(0,0,0,${0.2 + R() * 0.5})`; g.fillRect(R() * w, R() * h, 2 + R() * 6, 1 + R() * 3); } g.globalCompositeOperation = 'source-over'; }
function crateTex(g, w, h, lines, o = {}) { PT.planks(g, w, h, { base: o.base || '#b8864e', n: 4, seed: o.seed || 3, joints: 0 });
  lines.forEach(([s, y, sz]) => txt(g, s, w / 2, h * y, w * 0.86, h * sz, { col: o.ink || 'rgba(40,40,70,0.88)', font: SERIF })); g.strokeStyle = 'rgba(40,30,30,0.6)'; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20); }
function chartTex(g, w, h, up) { PT.paper(g, w, h, { base: '#f4ecd6', seed: up ? 4 : 5 }); txt(g, 'SALES', w / 2, h * 0.09, w * 0.6, h * 0.1, { col: '#2a2a4a', font: SERIF });
  g.strokeStyle = '#2a2a4a'; g.lineWidth = 5; g.beginPath(); g.moveTo(w * 0.12, h * 0.18); g.lineTo(w * 0.12, h * 0.86); g.lineTo(w * 0.92, h * 0.86); g.stroke();
  g.strokeStyle = 'rgba(60,80,140,0.3)'; g.lineWidth = 2; for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(w * 0.12, h * (0.86 - i * 0.12)); g.lineTo(w * 0.92, h * (0.86 - i * 0.12)); g.stroke(); g.beginPath(); g.moveTo(w * (0.12 + i * 0.13), h * 0.18); g.lineTo(w * (0.12 + i * 0.13), h * 0.86); g.stroke(); }
  const yrs = up ? ['1933', '1936', '1939', '1942'] : ['1946', '1950', '1953', '1955']; yrs.forEach((y, i) => txt(g, y, w * (0.18 + i * 0.24), h * 0.92, w * 0.18, h * 0.05, { col: '#2a2a4a', font: SANS })); }
export const CHART_PTS = { up: [[0.12, 0.8], [0.25, 0.72], [0.38, 0.6], [0.5, 0.55], [0.62, 0.42], [0.75, 0.33], [0.9, 0.22]], down: [[0.12, 0.25], [0.25, 0.3], [0.36, 0.42], [0.48, 0.4], [0.6, 0.58], [0.72, 0.66], [0.82, 0.78], [0.9, 0.84]] };
function chartLine(g, w, h, up) { g.clearRect(0, 0, w, h); const P = CHART_PTS[up ? 'up' : 'down'], col = up ? '#2a8a4a' : '#d02a2a'; g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [lw, c] of [[22, 'rgba(255,255,255,0.8)'], [12, col]]) { g.strokeStyle = c; g.lineWidth = lw; g.beginPath(); P.forEach(([x, y], i) => (i ? g.lineTo(w * x, h * y) : g.moveTo(w * x, h * y))); g.stroke(); }
  const [ax, ay] = P[P.length - 1], [bx, by] = P[P.length - 2], an = Math.atan2(h * (ay - by), w * (ax - bx)); g.fillStyle = col; g.save(); g.translate(w * ax, h * ay); g.rotate(an); g.beginPath(); g.moveTo(26, 0); g.lineTo(-14, -22); g.lineTo(-14, 22); g.closePath(); g.fill(); g.restore(); }
function beltTex(g, w, h) { g.fillStyle = '#3a3640'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2630'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 6, h); grain(g, w, h, 'rgba(120,110,130,1)', 500, 3, 0.3); }
function factWin(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fff2d0'); gr.addColorStop(1, '#f4d8a8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(160,140,120,0.35)'; for (let i = 0; i < 6; i++) g.fillRect(0, h * (0.4 + i * 0.1), w, 3);
  g.strokeStyle = '#3a3640'; g.lineWidth = 8; for (let i = 0; i <= 6; i++) { g.beginPath(); g.moveTo(i * w / 6, 0); g.lineTo(i * w / 6, h); g.stroke(); } for (let j = 0; j <= 5; j++) { g.beginPath(); g.moveTo(0, j * h / 5); g.lineTo(w, j * h / 5); g.stroke(); }
  const R = PT.rng(5); g.fillStyle = 'rgba(80,70,60,0.25)'; for (let i = 0; i < 6; i++) g.fillRect(((R() * 6) | 0) * w / 6 + 4, ((R() * 5) | 0) * h / 5 + 4, w / 6 - 8, h / 5 - 8); }
function street56(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7ab0f0'); gr.addColorStop(0.6, '#d8e8ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 4; i++) { const x = i * w / 4, c = ['#d8a080', '#a8c0a0', '#e8d0a0', '#c0a0b8'][i]; g.fillStyle = c; g.fillRect(x + 4, h * 0.25, w / 4 - 8, h * 0.5); g.fillStyle = '#f4f0e0'; for (let k = 0; k < 3; k++) g.fillRect(x + 14 + k * (w / 4 - 28) / 3, h * 0.32, (w / 4 - 40) / 3, h * 0.12); g.fillStyle = ['#d83a3a', '#3a8ad8', '#f0c030', '#3aa080'][i]; g.fillRect(x + 8, h * 0.5, w / 4 - 16, h * 0.04); }
  g.fillStyle = '#8a8a90'; g.fillRect(0, h * 0.75, w, h); g.fillStyle = '#c8c4b8'; g.fillRect(0, h * 0.72, w, h * 0.05);
  for (const [x, c] of [[0.15, '#e86a6a'], [0.62, '#6ab0c8']]) { const cx = w * x; g.fillStyle = c; g.beginPath(); g.ellipse(cx + 60, h * 0.8, 70, 18, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(cx + 50, h * 0.76, 40, 16, 0, Math.PI, TAU); g.fill(); g.fillStyle = '#d8e8f0'; g.fillRect(cx + 30, h * 0.75, 40, 8); g.fillStyle = '#222'; for (const dx of [20, 100]) { g.beginPath(); g.arc(cx + dx, h * 0.86, 12, 0, TAU); g.fill(); } } }
function shopGlass(g, w, h) { g.clearRect(0, 0, w, h); g.save(); g.translate(w, 0); g.scale(-1, 1); txt(g, 'TOYS', w / 2, h * 0.2, w * 0.6, h * 0.18, { col: 'rgba(240,200,80,0.92)', stroke: 'rgba(120,60,20,0.9)', font: SERIF }); g.restore(); } // gold leaf, read from outside
function shopSign(g, w, h) { PT.planks(g, w, h, { base: '#2a4a7a', n: 2, seed: 3, joints: 0 }); g.strokeStyle = '#f0c040'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16);
  txt(g, 'TOY SHOP', w / 2, h * 0.52, w * 0.8, h * 0.56, { col: '#f8e8b8', shadow: 'rgba(10,10,30,0.6)', font: SERIF }); }
function newCard(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = '#d83a3a'; g.beginPath(); starPts(w * 0.48, w * 0.36, 14).forEach(([x, y], i) => (i ? g.lineTo(w / 2 + x, h / 2 + y) : g.moveTo(w / 2 + x, h / 2 + y))); g.closePath(); g.fill(); g.strokeStyle = '#7a1a14'; g.lineWidth = 5; g.stroke();
  txt(g, 'NEW!', w / 2, h * 0.5, w * 0.6, h * 0.26, { col: '#fff6d8', stroke: '#7a1a14', font: SERIF }); }
function priceTag(g, w, h) { g.fillStyle = '#f8f4e8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a2a4a'; g.lineWidth = 3; g.strokeRect(3, 3, w - 6, h - 6); txt(g, '49¢', w / 2, h / 2, w * 0.8, h * 0.6, { col: '#c0281e', font: SERIF }); }
function rainbowWall(g, w, h) { g.fillStyle = '#bfe6d8'; g.fillRect(0, 0, w, h); const C = ['#f07a7a', '#f6b05a', '#f6e070', '#8ad08a', '#7ab0e8', '#b08ad8']; g.lineCap = 'round';
  C.forEach((c, i) => { g.strokeStyle = c; g.lineWidth = h * 0.05; g.beginPath(); g.arc(w * 0.72, h * 0.95, h * (0.55 - i * 0.055), Math.PI, TAU); g.stroke(); });
  for (const [x, y] of [[0.2, 0.25], [0.35, 0.15], [0.1, 0.5]]) { g.fillStyle = '#ffffff'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(w * x + k * 22, h * y + Math.sin(k) * 6, 20, 0, TAU); g.fill(); } }
  PT.modulate(g, w, h, (u, v) => 0.94 + 0.08 * PT.fbm(u, v, 4, 4, 3, 2)); }
function sunsetOut(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7a8ae0'); gr.addColorStop(0.5, '#ffb88a'); gr.addColorStop(1, '#ffe0a0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = PT.rng(26);
  g.fillStyle = 'rgba(255,245,210,0.95)'; g.beginPath(); g.arc(w * 0.6, h * 0.62, w * 0.08, 0, TAU); g.fill(); for (let i = 0; i < 8; i++) { g.fillStyle = '#5a7a6a'; g.beginPath(); g.arc(R() * w, h * (0.8 + R() * 0.1), 30 + R() * 30, 0, TAU); g.fill(); } g.fillStyle = '#4a6a5a'; g.fillRect(0, h * 0.88, w, h); }

// ---------------------------------------------------------------- materials
function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.concrete = vc({ map: T(512, 512, (g, w, h) => { g.fillStyle = '#9a948c'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.82 + 0.26 * PT.fbm(u, v, 6, 6, 4, 13)); grain(g, w, h, '#4a4448', 2600, 5, 0.3); g.strokeStyle = 'rgba(60,56,60,0.4)'; g.lineWidth = 3; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); } }, [3, 3]) }); if (H.MACRO) H.MACRO(m.concrete, 0.18, 0.05);
  m.brick = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#a8553e', seed: 9 })) });
  m.wallSign = toon({ map: T(1024, 360, wallSign), transparent: true, depthWrite: false, emissive: 0x1a1810 }); m.wallSign.emissiveMap = m.wallSign.map; m.wallSign.polygonOffset = true; m.wallSign.polygonOffsetFactor = -1;
  m.fwin = C.basic(T(384, 320, factWin), 1.25); m.belt = vc({ map: T(256, 64, beltTex, [8, 1]) }); m.steel = vc({ emissive: 0x101018 });
  m.wood = vc({ map: T(256, 256, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 4, seed: 33, joints: 0 })) });
  m.floorW = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#a87a4e', n: 7, seed: 51 })) }); if (H.MACRO) H.MACRO(m.floorW, 0.12, 0.05);
  const LBL = (o) => { const x = toon({ map: T(512, 256, (g, w, h) => canLabel(g, w, h, o)), emissive: 0x1a1612 }); x.emissiveMap = x.map; return x; };
  m.canWP = LBL({ base: '#e8dcc0', band: '#3a6a9a', ink: '#1e3a5a', deco: 'roller', lines: [['WALLPAPER', 0.3, 0.13], ['CLEANER', 0.45, 0.13, '#a8322a']] });
  m.canWPdust = m.canWP.clone(); m.canWPdust.color.setRGB(0.6, 0.58, 0.56);
  m.canPD = { white: LBL({ base: '#f2ecdc', band: '#c8b890', ink: '#5a4a3a', deco: 'star', seed: 5, lines: [['PLAY-DOH', 0.38, 0.2], ['FOR KIDS', 0.53, 0.07]] }),
    red: LBL({ base: '#f2ecdc', band: '#d8302a', ink: '#a8201a', deco: 'star', seed: 6, lines: [['PLAY-DOH', 0.38, 0.2], ['RED', 0.53, 0.08]] }),
    yellow: LBL({ base: '#f2ecdc', band: '#f0c020', ink: '#8a6a10', deco: 'star', seed: 7, lines: [['PLAY-DOH', 0.38, 0.2], ['YELLOW', 0.53, 0.08]] }),
    blue: LBL({ base: '#f2ecdc', band: '#2a6ad8', ink: '#1a3a8a', deco: 'star', seed: 8, lines: [['PLAY-DOH', 0.38, 0.2], ['BLUE', 0.53, 0.08]] }) };
  m.crate = em(T(512, 384, (g, w, h) => crateTex(g, w, h, [['WALLPAPER', 0.36, 0.2], ['CLEANER', 0.62, 0.2], ['24 CANS', 0.84, 0.1]])), 0x1a140c);
  m.soapCrate = em(T(512, 384, (g, w, h) => crateTex(g, w, h, [['SOAP', 0.45, 0.34], ['BAR SOAP', 0.78, 0.12]], { base: '#c8a070', seed: 7 })), 0x1a140c);
  m.chart = em(T(512, 512, (g, w, h) => chartTex(g, w, h, true)), 0x2a2620); m.chartD = em(T(512, 512, (g, w, h) => chartTex(g, w, h, false)), 0x2a2620);
  m.lineUp = new THREE.MeshBasicMaterial({ map: T(512, 512, (g, w, h) => chartLine(g, w, h, true)), transparent: true, depthWrite: false, fog: false }); m.lineDn = new THREE.MeshBasicMaterial({ map: T(512, 512, (g, w, h) => chartLine(g, w, h, false)), transparent: true, depthWrite: false, fog: false });
  m.sack = em(T(256, 256, (g, w, h) => { PT.fabric(g, w, h, { base: '#d8c8a0' }); txt(g, 'DETERGENT', w / 2, h * 0.45, w * 0.86, h * 0.16, { col: '#2a3a6a', font: SERIF }); g.strokeStyle = '#2a3a6a'; g.lineWidth = 4; g.strokeRect(w * 0.08, h * 0.3, w * 0.84, h * 0.3); }), 0x1a1610, { side: THREE.DoubleSide });
  m.plasterW = vc({ map: T(512, 512, (g, w, h) => { g.fillStyle = '#f2e6c8'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 5, 5, 4, 3)); }) });
  m.street56 = C.basic(T(1024, 512, street56), 1.15); m.shopGlass = new THREE.MeshBasicMaterial({ map: T(512, 256, shopGlass), transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide });
  m.shopSign = em(T(1024, 220, shopSign), 0x1a1a2a); m.newCard = toon({ map: T(256, 256, newCard), transparent: true, alphaTest: 0.5, emissive: 0x2a1a14, side: THREE.DoubleSide }); m.newCard.emissiveMap = m.newCard.map; m.price = em(T(128, 64, priceTag), 0x2a2a2a);
  m.rainbow = vc({ map: T(1024, 512, rainbowWall) }); m.sunset = C.basic(T(512, 512, sunsetOut), 1.2); m.plastic = vc({ emissive: 0x1a1a1a });
  m.rugK = vc({ map: T(512, 512, (g, w, h) => { const C2 = ['#f6b05a', '#7ab0e8', '#f07a7a', '#8ad08a', '#f6e070']; for (let i = 0; i < 5; i++) { g.fillStyle = C2[i]; g.beginPath(); g.arc(w / 2, h / 2, w * (0.5 - i * 0.1), 0, TAU); g.fill(); } }) });
  m.bulb = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd890).multiplyScalar(2.2), fog: false });
  m.lid = vc({ emissive: 0x141418 });
  return m; }
function ceil(root, w, d, y, z, col) { const m = mesh(root, plane(w, d), H.toon({ color: col, side: THREE.DoubleSide }), 0, y, z, Math.PI / 2, 0, 0, false); m.receiveShadow = false; return m; }
const lidMats = new Map();
function canMesh(parent, mat, lidCol, x, y, z, r = 0.075, h = 0.13, ry = 0) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); const b = mesh(g, cyl(r, r, h, 20, true), mat, 0, h / 2, 0, 0, 0, 0, true); b.userData.body = 1;
  let lm = lidMats.get(lidCol); if (!lm) lidMats.set(lidCol, (lm = H.toon({ color: lidCol, emissive: 0x141418 }))); mesh(g, cyl(r * 1.04, r * 1.04, h * 0.14, 20), lm, 0, h + h * 0.05, 0, 0, 0, 0, true); mesh(g, cyl(r * 0.98, r * 0.98, 0.006, 20), lm, 0, 0.003, 0, 0, 0, 0, false); return g; }

// ================================================================= FACTORY
function buildFactory(root) {
  const R = PT.rng(1931), K = new Kit(), X = 6.5, ZB = -5.0, HT = 5.4;
  mesh(root, planeUV(16, 12, 1, 1), M.concrete, 0, 0, -1, -Math.PI / 2, 0, 0, false);
  const WY0 = 2.9, WY1 = 4.7, WX = [-4.6, -1.6, 1.4, 4.4], WW = 2.0; let xc = -X; for (const wx of WX) { K.box(M.brick, xc, wx - WW / 2, 0, HT, ZB - 0.3, ZB, 0xffffff, 0.01); xc = wx + WW / 2; } K.box(M.brick, xc, X, 0, HT, ZB - 0.3, ZB, 0xffffff, 0.01);
  for (const wx of WX) { K.box(M.brick, wx - WW / 2, wx + WW / 2, 0, WY0, ZB - 0.3, ZB, 0xffffff, 0.01); K.box(M.brick, wx - WW / 2, wx + WW / 2, WY1, HT, ZB - 0.3, ZB, 0xffffff, 0.01); mesh(root, plane(WW, WY1 - WY0), M.fwin, wx, (WY0 + WY1) / 2, ZB - 0.2, 0, 0, 0, false); K.box(M.concrete, wx - WW / 2 - 0.05, wx + WW / 2 + 0.05, WY0 - 0.1, WY0, ZB - 0.3, ZB + 0.12, 0xb8b0a8, 0.01); }
  for (const s of [-1, 1]) K.box(M.brick, s > 0 ? X : -X - 0.3, s > 0 ? X + 0.3 : -X, 0, HT, ZB, 3, 0xffffff, 0.01);
  ceil(root, 2 * X + 0.6, 8.4, HT, ZB + 4, 0x4a4248);
  mesh(root, plane(4.0, 1.4), M.wallSign, -0.1, 2.12, ZB + 0.01, 0, 0, 0, false).renderOrder = 2;
  // steel trusses + hanging enamel lamps + pipes
  for (let z = ZB + 1.2; z < 3; z += 2.6) { K.box(M.steel, -X, X, HT - 0.5, HT - 0.4, z - 0.06, z + 0.06, 0x3a3a48, 0.01); K.box(M.steel, -X, X, HT - 1.3, HT - 1.22, z - 0.06, z + 0.06, 0x3a3a48, 0.01); for (let x = -X + 0.6; x < X; x += 1.2) K.beam(M.steel, [x, HT - 1.26, z], [x + 0.6, HT - 0.45, z], 0.05, 0x3a3a48, false); }
  const LAMPS = [[-3.0, -2.6], [0.6, -1.4], [3.6, -2.6], [0.6, 1.2]]; for (const [x, z] of LAMPS) { K.beam(M.steel, [x, HT - 1.3, z], [x, 3.1, z], 0.01, 0x2a2a30, true, 4); K.put(M.steel, lathe('flamp', [[0.03, 0.14], [0.08, 0.12], [0.34, -0.05], [0.35, -0.07]], 20), x, 3.0, z, 0, 0, 0, 1, 1, 1, 0x2a6a4a); K.put(M.lampGlass, sph(0.07, 10, 8), x, 2.96, z, 0, 0, 0, 1, 1, 1, 0xffffff); }
  for (const [y, c] of [[2.5, 0x6a6a78], [2.62, 0xa8483a]]) K.beam(M.steel, [-X, y, ZB + 0.25], [X, y, ZB + 0.25], 0.05, c, true, 10);
  // mixing VAT on legs with platform + ladder; dough inside; paddle on a gantry motor
  const VX = -3.4, VZ = -2.6, VR = 1.0, VB = 0.6, VT = 1.95; K.at(VX, 0, VZ, 0, () => { for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.78; K.beam(M.steel, [Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8], [Math.cos(a) * 0.85, VB + 0.1, Math.sin(a) * 0.85], 0.07, 0x4a4a58, false); }
    K.put(M.steel, lathe('vat', [[0.001, VB], [VR * 0.7, VB], [VR, VB + 0.25], [VR, VT], [VR + 0.05, VT + 0.02], [VR + 0.05, VT + 0.08], [VR - 0.03, VT + 0.08], [VR - 0.03, VB + 0.3], [0.001, VB + 0.3]], 28), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0x9aa0a8);
    for (const y of [VB + 0.6, VB + 1.0]) K.put(M.steel, tor(VR + 0.01, 0.025, 6, 30), 0, y, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x7a7a88);
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; K.put(M.steel, sph(0.02, 6, 5), Math.cos(a) * (VR + 0.02), VB + 0.6, Math.sin(a) * (VR + 0.02), 0, 0, 0, 1, 1, 1, 0x5a5a68); }
    K.box(M.steel, 0.9, 2.0, 1.25, 1.31, -0.6, 0.6, 0x4a4a58, 0.01); for (const [x, z] of [[1.95, -0.55], [1.95, 0.55]]) K.beam(M.steel, [x, 0, z], [x, 1.25, z], 0.04, 0x4a4a58, false); for (let k = 0; k < 2; k++) K.beam(M.steel, [1.95, 1.31 + 0.45 * (k + 1) * 0.5, -0.6], [1.95, 1.31 + 0.45 * (k + 1) * 0.5, 0.6], 0.02, 0xd8b048, true, 6);
    for (const z of [-0.25, 0.25]) K.beam(M.steel, [2.5, 0, z], [2.0, 1.31, z], 0.03, 0x4a4a58, false); for (let k = 1; k < 6; k++) K.beam(M.steel, [2.5 - k * 0.083, k * 0.218, -0.25], [2.5 - k * 0.083, k * 0.218, 0.25], 0.02, 0x4a4a58, false);
    K.box(M.steel, -0.25, 0.25, VT + 0.75, VT + 1.15, -0.25, 0.25, 0x3a6a5a, 0.04); K.beam(M.steel, [-1.3, VT + 0.95, 0], [1.3, VT + 0.95, 0], 0.08, 0x4a4a58, false); for (const s of [-1, 1]) K.beam(M.steel, [s * 1.3, VT + 0.95, 0], [s * 1.3, 0, 0], 0.07, 0x4a4a58, false);
    K.beam(M.steel, [VR * 0.6, VB + 0.1, 0], [VR + 1.1, 0.4, 0.4], 0.06, 0x8a8a96, true, 10); });
  const dough = mesh(root, doughGeo(7, 0.07), M.dough, VX, VT - 0.12, VZ, 0, 0, 0, false); dough.scale.set(0.95, 0.18, 0.95); const dc = new THREE.Color(0xf0e8d2); dough.geometry = dough.geometry.clone(); dough.geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(dough.geometry.attributes.position.count * 3).map((_, i) => [dc.r, dc.g, dc.b][i % 3]), 3));
  const paddle = new THREE.Group(); paddle.position.set(VX, 0, VZ); root.add(paddle); { const pk = new Kit(); pk.beam(M.steel, [0, VT + 0.75, 0], [0, VT - 0.3, 0], 0.04, 0x7a7a88, true, 8); pk.box(M.steel, -0.7, 0.7, VT - 0.4, VT - 0.05, -0.03, 0.03, 0x8a8a96, 0.01); pk.build(paddle); }
  // filler machine + conveyor (cans ride along +x)
  const CY = 0.92, CZ = -1.2, CX0 = -1.9, CX1 = 5.6; K.box(M.steel, CX0, CX1, CY - 0.1, CY - 0.02, CZ - 0.32, CZ + 0.32, 0x4a4a58, 0.01); for (const s of [-1, 1]) K.box(M.steel, CX0, CX1, CY - 0.02, CY + 0.06, CZ + s * 0.3 - 0.025, CZ + s * 0.3 + 0.025, 0x7a7a88, 0.005);
  for (let x = CX0 + 0.3; x < CX1; x += 1.2) for (const s of [-1, 1]) K.beam(M.steel, [x, 0, CZ + s * 0.26], [x, CY - 0.1, CZ + s * 0.26], 0.04, 0x3a3a48, false);
  const belt = mesh(root, plane(CX1 - CX0, 0.56), M.belt, (CX0 + CX1) / 2, CY - 0.015, CZ, -Math.PI / 2, 0, 0, false);
  for (let x = CX0; x <= CX1; x += 0.25) K.put(M.steel, cyl(0.04, 0.04, 0.6, 8), x, CY - 0.06, CZ, Math.PI / 2, 0, 0, 1, 1, 1, 0x8a8a96);
  K.at(-1.4, 0, CZ, 0, () => { K.box(M.steel, -0.45, 0.45, 0, 1.6, -0.75, -0.35, 0x3a6a5a, 0.04); K.box(M.steel, -0.35, 0.35, 1.6, 2.4, -0.55, 0.15, 0x3a6a5a, 0.04); K.put(M.steel, lathe('hopper', [[0.12, 0], [0.42, 0.5], [0.45, 0.55]], 16), 0, 2.4, -0.2, 0, 0, 0, 1, 1, 1, 0x9aa0a8);
    K.put(M.steel, cyl(0.06, 0.03, 0.5, 10), 0, 1.35, 0, 0, 0, 0, 1, 1, 1, 0x8a8a96); K.put(M.brass, cyl(0.06, 0.06, 0.04, 12), 0.2, 2.0, 0.17, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8b048); for (let i = 0; i < 3; i++) K.put(M.paint, sph(0.025, 8, 6), -0.2 + i * 0.1, 1.9, 0.16, 0, 0, 0, 1, 1, 1, [0xe83a2a, 0x3ae86a, 0xe8c83a][i]); });
  const cans = []; for (let i = 0; i < 17; i++) cans.push(canMesh(root, M.canWP, 0x6a6a72, CX0 + 0.4 + i * 0.42, CY, CZ, 0.075, 0.14, R() * TAU));
  // packing end + crate stacks (pallets) + soap
  const crate = (x, y, z, ry, mat = M.crate, s = 1) => { K.at(x, y, z, ry, () => { K.box(mat, -0.4 * s, 0.4 * s, 0, 0.5 * s, -0.3 * s, 0.3 * s, 0xffffff, 0.02); for (const yy of [0.04, 0.46]) K.box(M.wood, -0.41 * s, 0.41 * s, yy * s - 0.03, yy * s + 0.03, -0.31 * s, 0.31 * s, 0x7a5030, 0.008); }); };
  const pallet = (x, z, ry, n, mat) => { K.at(x, 0, z, ry, () => { K.box(M.wood, -0.9, 0.9, 0, 0.12, -0.65, 0.65, 0x9a7048, 0.01); }); for (let i = 0; i < n; i++) crate(x + ((i % 2) - 0.5) * 0.82, 0.12 + Math.floor(i / 4) * 0.5, z + (((i >> 1) % 2) - 0.5) * 0.62, ry + (R() - 0.5) * 0.06, mat); };
  pallet(-5.2, -4.2, 0, 12, M.crate); pallet(1.3, -4.2, 0.05, 4, M.crate); pallet(-5.2, -0.4, 0.2, 6, M.soapCrate); pallet(5.4, 0.9, -0.1, 8, M.crate);
  K.box(M.wood, 5.0, 6.2, 0.8, 0.86, CZ - 0.5, CZ + 0.5, 0x8a5a38, 0.01); for (const [sx, sz] of [[5.05, -0.45], [6.15, -0.45], [5.05, 0.45], [6.15, 0.45]]) K.box(M.wood, sx - 0.03, sx + 0.03, 0, 0.8, CZ + sz - 0.03, CZ + sz + 0.03, 0x6a4028, 0.005);
  for (let i = 0; i < 14; i++) K.cb(M.paint, 0.16, 0.07, 0.1, -5.6 + (i % 5) * 0.18, 0.9 + Math.floor(i / 5) * 0.075, 0.25, [0xf4f0e0, 0xe8d8b8, 0xf0e8f0][i % 3], 0, (R() - 0.5) * 0.3, 0, 0.02);
  K.box(M.wood, -6.0, -4.6, 0.82, 0.88, -0.1, 0.6, 0x8a5a38, 0.01);
  // glass office: partition, desk, phone, lamp, chart easel
  const OX = 4.3, OZ = -3.6; // office corner (no partition): desk, phone, lamp, filing cabinet, chart easel, hanging OFFICE board
  K.at(OX + 1.5, 0, OZ - 1.1, 0, () => { K.box(M.steel, -0.3, 0.3, 0, 1.3, -0.3, 0.3, 0x5a6a5a, 0.03); for (let i = 0; i < 3; i++) { K.box(M.steel, -0.27, 0.27, 0.1 + i * 0.4, 0.44 + i * 0.4, 0.29, 0.32, 0x6a7a6a, 0.02); K.box(M.brass, -0.06, 0.06, 0.32 + i * 0.4, 0.35 + i * 0.4, 0.31, 0.34, 0xc8a050, 0.005); } });
  K.at(OX + 0.3, 0, OZ - 0.4, 0, () => { K.box(M.wood, -0.7, 0.7, 0.72, 0.77, -0.35, 0.35, 0x5a3420, 0.02); K.box(M.wood, -0.66, -0.3, 0, 0.72, -0.32, 0.32, 0x4a2a18, 0.01); K.box(M.wood, 0.3, 0.66, 0, 0.72, -0.32, 0.32, 0x4a2a18, 0.01);
    K.box(M.paint, -0.2, 0.15, 0.77, 0.8, -0.1, 0.15, 0xf4ecd8, 0.005); K.box(M.paint, -0.55, -0.35, 0.77, 0.83, -0.05, 0.12, 0x1a1a22, 0.02); K.beam(M.paint, [-0.45, 0.83, 0.03], [-0.45, 1.0, 0.03], 0.012, 0x1a1a22, true, 6); K.cb(M.paint, 0.18, 0.04, 0.05, -0.45, 1.02, 0.03, 0x1a1a22, 0, 0, 0, 0.02);
    K.put(M.brass, lathe('dlamp', [[0.06, 0], [0.02, 0.02], [0.012, 0.35]], 10), 0.5, 0.77, -0.15, 0, 0, 0, 1, 1, 1, 0xc8a050); K.put(M.steel, lathe('dlsh', [[0.02, 0.06], [0.12, -0.02], [0.13, -0.03]], 14), 0.45, 1.12, -0.1, 0, 0, 0.4, 1, 1, 1, 0x2a6a4a); });
  const CHX = OX - 1.3, CHY = 1.55, CHZ = OZ - 0.6, CW = 1.05; K.at(CHX, 0, CHZ, 0.15, () => { for (const s of [-1, 1]) K.beam(M.wood, [s * 0.45, 0, 0.25], [s * 0.4, 2.2, -0.05], 0.03, 0x6a4028, false); K.beam(M.wood, [0, 0, -0.45], [0, 2.0, -0.08], 0.03, 0x6a4028, false); K.box(M.wood, -0.55, 0.55, 0.92, 0.97, -0.08, 0.12, 0x6a4028, 0.008); });
  const chartG = new THREE.Group(); chartG.position.set(CHX, CHY, CHZ + 0.05); chartG.rotation.set(-0.08, 0.15, 0, 'YXZ'); root.add(chartG);
  const chUp = mesh(chartG, plane(CW, CW), M.chart, 0, 0, 0, 0, 0, 0, false), chDn = mesh(chartG, plane(CW, CW), M.chartD, 0, 0, 0, 0, 0, 0, false);
  const lg = new THREE.PlaneGeometry(1, 1); lg.translate(0.5, 0, 0); const lineM = mesh(chartG, lg, M.lineDn, -CW / 2, 0, 0.006, 0, 0, 0, false); lineM.renderOrder = 4; nond(lineM);
  const setLine = (up, t) => { chUp.visible = up; chDn.visible = !up; lineM.material = up ? M.lineUp : M.lineDn; const k = clamp01(t); lineM.visible = k > 0.01; lineM.scale.set(CW * k, CW, 1); const uv = lg.attributes.uv; uv.setXY(0, 0, 1); uv.setXY(1, k, 1); uv.setXY(2, 0, 0); uv.setXY(3, k, 0); uv.needsUpdate = true; };
  // 1956 reformulation props: DETERGENT sacks + a crate of scent bottles beside the vat
  const newG = new THREE.Group(); root.add(newG); { const nk = new Kit(); for (let i = 0; i < 3; i++) nk.put(M.sack, lumpGeo(i + 3, 2, 0.12), -2.0 + i * 0.32, 0.3, -1.55 + (i % 2) * 0.18, 0, R(), 0, 0.28, 0.32, 0.2, 0xffffff); nk.box(M.wood, -4.75, -4.15, 0, 0.35, -1.5, -1.0, 0xb8864e, 0.02); for (let i = 0; i < 6; i++) nk.put(M.jar, lathe('scb', [[0.001, 0], [0.04, 0], [0.04, 0.1], [0.015, 0.13], [0.015, 0.16]], 10), -4.6 + (i % 3) * 0.12, 0.35, -1.35 + Math.floor(i / 3) * 0.14, 0, 0, 0, 1, 1, 1, 0xffffff); nk.build(newG); }
  // bust props: cobwebs
  const bust = new THREE.Group(); root.add(bust); for (const [x, y, z, ry, s] of [[-X + 0.05, HT - 1.6, ZB + 0.05, 0, 1.4], [CX1 - 0.1, CY + 0.2, CZ - 0.3, Math.PI, 0.6], [4.2, 1.15, -3.3, 0, 0.7], [-2.4, 2.3, -2.6, 0.6, 0.8], [OX + 1.9, 1.35, OZ - 0.9, Math.PI, 0.6], [1.2, 1.3, -1.25, 0, 0.5]]) { const w = nond(mesh(bust, plane(s, s), M.web, x, y, z, 0, ry, 0, false)); w.renderOrder = 6; }
  K.build(root, 4);
  const glows = LAMPS.map(([x, z]) => glowAt(root, [x, 2.9, z], 1.2, '#ffd890', 0.4));
  const shafts = WX.map((wx) => { const s = shaftAt(root, [wx + 0.6, 2.2, ZB + 1.6], 2.2, 5.2, 0, 0, 0.18, 0xffe0a8); s.rotation.set(-0.55, 0, 0.3); return s; });
  const dust = motes(root, 120, [-X + 0.5, X - 0.5, 0.3, 4.2, ZB + 0.5, 1.5], 31, 0.012);
  return { cans, belt, paddle, dough, setLine, newG, bust, glows, shafts, dust, CX0, CX1, CY, CZ, VX, VZ, VT, OX, OZ, CHX, CHY, CHZ, ZB };
}

// ================================================================= TOYSTORE (1956)
function buildToystore(root) {
  const R = PT.rng(1956), K = new Kit(), X = 3.6, ZB = -2.4, HT = 3.1;
  mesh(root, planeUV(9, 7, 1, 1), M.floorW, 0, 0, -0.6, -Math.PI / 2, 0, 0, false);
  K.box(M.plasterW, -X - 0.3, X + 0.3, 0, HT, ZB - 0.25, ZB, 0xffffff, 0.01); K.box(M.plasterW, X, X + 0.25, 0, HT, ZB, 2, 0xffffff, 0.01); ceil(root, 2 * X + 0.6, 4.6, HT, ZB + 2.2, 0xf0e4c8);
  K.box(M.wood, -X, X, 0, 0.9, ZB, ZB + 0.04, 0x3a6a5a, 0.006); K.box(M.wood, -X, X, 0.88, 0.94, ZB, ZB + 0.06, 0x2a4a3a, 0.006); K.box(M.wood, -X, X, HT - 0.15, HT, ZB, ZB + 0.08, 0x2a4a3a, 0.006);
  mesh(root, plane(2.6, 0.56), M.shopSign, 0, 2.72, ZB + 0.05, 0, 0, 0, false);
  // central display: 4 shelves, back row off-white cans (always), front rows coloured (pop in by colors())
  const SX0 = -1.15, SX1 = 1.15, SH = [0.55, 1.05, 1.55, 2.05], SD = 0.42; K.box(M.wood, SX0 - 0.06, SX0, 0, 2.4, ZB, ZB + SD, 0x6a4028, 0.01); K.box(M.wood, SX1, SX1 + 0.06, 0, 2.4, ZB, ZB + SD, 0x6a4028, 0.01); K.box(M.paint, SX0, SX1, 0, 2.4, ZB, ZB + 0.02, 0xe8d8b0, 0.005); K.box(M.wood, SX0 - 0.1, SX1 + 0.1, 2.4, 2.46, ZB, ZB + SD + 0.04, 0x5a3420, 0.01);
  for (const y of SH) { K.box(M.wood, SX0, SX1, y - 0.04, y, ZB, ZB + SD, 0xb88050, 0.005); K.box(M.wood, SX0, SX1, y - 0.07, y, ZB + SD - 0.02, ZB + SD, 0x5a3420, 0.004); } K.box(M.wood, SX0, SX1, 0, 0.12, ZB, ZB + SD, 0x5a3420, 0.01);
  const N = 5, white = [], cols = { red: [], yellow: [], blue: [] }, ROWC = ['red', 'yellow', 'blue'], LIDC = { red: 0xd8302a, yellow: 0xf0c020, blue: 0x2a6ad8 };
  SH.forEach((y, r) => { for (let i = 0; i < N; i++) { const x = SX0 + 0.16 + i * (SX1 - SX0 - 0.32) / (N - 1); white.push(canMesh(root, M.canPD.white, 0xe8e0cc, x, y, ZB + 0.13, 0.085, 0.17, (R() - 0.5) * 0.4)); }
    if (r < 3) for (let i = 0; i < N; i++) { const x = SX0 + 0.16 + i * (SX1 - SX0 - 0.32) / (N - 1), c = ROWC[(r + i) % 3]; cols[c].push(canMesh(root, M.canPD[c], LIDC[c], x, y, ZB + 0.31, 0.085, 0.17, (R() - 0.5) * 0.3)); } });
  for (let r = 0; r < 4; r++) for (let i = 0; i < 3; i++) mesh(root, plane(0.12, 0.06), M.price, SX0 + 0.35 + i * 0.75, SH[r] - 0.035, ZB + SD + 0.005, 0, 0, 0, false);
  const newC = mesh(root, plane(0.5, 0.5), M.newCard, SX1 - 0.05, 2.62, ZB + 0.5, 0, -0.2, 0.15, false);
  // left wall: shop window onto the street (gold-leaf TOYS), window display
  const WZ = -0.7; K.box(M.plasterW, -X - 0.25, -X, 0, 0.6, ZB, 2, 0xffffff, 0.01); K.box(M.plasterW, -X - 0.25, -X, 2.5, HT, ZB, 2, 0xffffff, 0.01); K.box(M.plasterW, -X - 0.25, -X, 0.6, 2.5, ZB, WZ - 1.0, 0xffffff, 0.01); K.box(M.plasterW, -X - 0.25, -X, 0.6, 2.5, WZ + 1.0, 2, 0xffffff, 0.01);
  mesh(root, plane(2.0, 1.9), M.street56, -X - 0.6, 1.55, WZ, 0, Math.PI / 2, 0, false); mesh(root, plane(2.0, 0.9), M.shopGlass, -X - 0.05, 2.05, WZ, 0, Math.PI / 2, 0, false).renderOrder = 4;
  for (const dz of [-1.0, 0, 1.0]) K.box(M.wood, -X - 0.06, -X + 0.04, 0.6, 2.5, WZ + dz - 0.04, WZ + dz + 0.04, 0x2a4a3a, 0.005); K.box(M.wood, -X - 0.1, -X + 0.5, 0.55, 0.62, WZ - 1.05, WZ + 1.05, 0x5a3420, 0.01);
  K.at(-X + 0.25, 0.62, WZ + 0.4, 0, () => { K.put(M.paint, cyl(0.12, 0.02, 0.2, 14), 0, 0.1, 0, 0, 0, 0, 1, 1, 1, 0xd83a3a); K.put(M.paint, cyl(0.125, 0.125, 0.04, 14), 0, 0.2, 0, 0, 0, 0, 1, 1, 1, 0xf0c030); K.beam(M.paint, [0, 0.22, 0], [0, 0.32, 0], 0.012, 0x5a3420, true, 6); });
  K.at(-X + 0.25, 0.62, WZ - 0.5, 0.5, () => { K.box(M.metal, -0.08, 0.08, 0, 0.26, -0.06, 0.06, 0xb8bcc8, 0.02); K.box(M.metal, -0.07, 0.07, 0.26, 0.38, -0.05, 0.05, 0xb8bcc8, 0.02); for (const s of [-1, 1]) K.put(M.paint, sph(0.018, 8, 6), s * 0.03, 0.33, 0.051, 0, 0, 0, 1, 1, 1, 0xe83a2a); K.beam(M.metal, [0, 0.38, 0], [0, 0.45, 0], 0.006, 0x8a8a96, true, 4); K.put(M.paint, sph(0.015, 6, 5), 0, 0.46, 0, 0, 0, 0, 1, 1, 1, 0xe83a2a); for (const s of [-1, 1]) K.beam(M.metal, [s * 0.08, 0.22, 0], [s * 0.13, 0.08, 0.02], 0.02, 0xb8bcc8, false); });
  // side shelving with toys
  K.at(2.35, 0, ZB + 0.25, 0, () => { K.box(M.wood, -0.75, 0.75, 0, 2.2, -0.22, 0.22, 0x6a4028, 0.01); for (const y of [0.6, 1.2, 1.8]) K.box(M.wood, -0.72, 0.72, y - 0.04, y, -0.2, 0.22, 0x8a5a38, 0.004);
    for (let i = 0; i < 3; i++) K.put(M.paint, lathe('top', [[0.001, 0], [0.12, 0.1], [0.11, 0.14], [0.02, 0.16], [0.01, 0.24]], 16), -0.5 + i * 0.3, 0.6, 0.02, 0, 0, 0, 1, 1, 1, [0xd83a3a, 0x3a8ad8, 0xf0c030][i]);
    K.put(M.paint, sph(0.12, 10, 8), 0.5, 0.72, 0.03, 0, 0, 0, 1, 1, 1, 0xa86a3a); K.put(M.paint, sph(0.085, 10, 8), 0.5, 0.88, 0.05, 0, 0, 0, 1, 1, 1, 0xa86a3a); for (const s of [-1, 1]) K.put(M.paint, sph(0.035, 8, 6), 0.5 + s * 0.07, 0.95, 0.05, 0, 0, 0, 1, 1, 1, 0x8a5a2a);
    for (let i = 0; i < 3; i++) { K.box(M.paint, -0.62 + i * 0.2, -0.46 + i * 0.2, 1.2, 1.32, -0.08, 0.08, [0xd83a3a, 0x2a6a4a, 0x2a4a8a][i], 0.01); K.put(M.paint, cyl(0.035, 0.035, 0.02, 10), -0.58 + i * 0.2, 1.2, 0.09, Math.PI / 2, 0, 0, 1, 1, 1, 0x1a1a22); } K.box(M.paint, -0.62, -0.54, 1.32, 1.42, -0.05, 0.05, 0x1a1a22, 0.005);
    for (let i = 0; i < 4; i++) K.put(M.paint, sph(0.08, 12, 10), 0.15 + i * 0.16, 1.28, 0.02, 0, 0, 0, 1, 1, 1, [0xe83a2a, 0x3aa0e8, 0xf0c030, 0x5ab050][i]);
    for (let i = 0; i < 4; i++) K.box(M.paint, -0.65 + i * 0.32, -0.38 + i * 0.32, 1.8, 2.15 - (i % 2) * 0.08, -0.15, 0.1, [0xc84a3a, 0x3a6aa8, 0xe8b830, 0x4a8a5a][i], 0.01); });
  K.at(-2.4, 0, ZB + 0.25, 0, () => { K.box(M.wood, -0.8, 0.8, 0, 2.2, -0.22, 0.22, 0x6a4028, 0.01); for (const y of [0.6, 1.2, 1.8]) K.box(M.wood, -0.78, 0.78, y - 0.04, y, -0.2, 0.22, 0x8a5a38, 0.004);
    for (let i = 0; i < 5; i++) K.cb(M.paint, 0.22, 0.3, 0.06, -0.6 + i * 0.3, 0.75, 0.0, [0xf0e0b0, 0xe8a0a0, 0xa0c8e8, 0xf0e0b0, 0xc8e0a0][i], 0, 0, (i - 2) * 0.05, 0.01);
    for (let i = 0; i < 6; i++) K.put(M.paint, cyl(0.06, 0.06, 0.08, 14), -0.6 + i * 0.24, 1.24, 0.02, 0, 0, 0, 1, 1, 1, [0xd83a3a, 0x3a8ad8, 0xf0c030][i % 3]);
    for (let i = 0; i < 3; i++) K.put(M.paint, lathe('pin', [[0.001, 0], [0.04, 0.02], [0.05, 0.12], [0.03, 0.2], [0.035, 0.26], [0.001, 0.29]], 12), -0.5 + i * 0.5, 1.8, 0.0, 0, 0, 0, 1, 1, 1, 0xf4f0e4); });
  // counter + brass register + gumball jar (right front)
  K.at(2.6, 0, 0.4, -Math.PI / 2, () => { K.box(M.wood, -1.1, 1.1, 0, 0.95, -0.35, 0.35, 0x5a3420, 0.02); K.box(M.wood, -1.15, 1.15, 0.95, 1.0, -0.4, 0.4, 0x3a2418, 0.01);
    K.at(0.4, 1.0, 0, 0, () => { K.box(M.brass, -0.25, 0.25, 0, 0.22, -0.2, 0.2, 0xc89838, 0.03); K.box(M.brass, -0.22, 0.22, 0.22, 0.42, -0.18, 0.05, 0xd8a848, 0.04); for (let i = 0; i < 8; i++) K.put(M.paint, cyl(0.022, 0.022, 0.02, 10), -0.15 + (i % 4) * 0.1, 0.24 + Math.floor(i / 4) * 0.08, 0.08, Math.PI / 2 - 0.5, 0, 0, 1, 1, 1, 0xf4f0e4); K.box(M.paint, -0.12, 0.12, 0.38, 0.46, -0.1, -0.02, 0x1a1a22, 0.005); });
    for (let i = 0; i < 26; i++) { const a = R() * TAU, rr = Math.sqrt(R()) * 0.11; K.put(M.paint, sph(0.025, 8, 6), -0.5 + Math.cos(a) * rr, 1.1 + R() * 0.15, Math.sin(a) * rr, 0, 0, 0, 1, 1, 1, [0xe83a2a, 0x3aa0e8, 0xf0c030, 0x5ab050, 0xf4f0e4][i % 5]); } K.put(M.brass, cyl(0.07, 0.09, 0.06, 12), -0.5, 1.03, 0, 0, 0, 0, 1, 1, 1, 0xd83a3a); });
  mesh(root, sph(0.16, 16, 12), M.jar, 2.6, 1.2, 0.9, 0, 0, 0, false).renderOrder = 4;
  for (const x of [-1.6, 1.6]) { K.beam(M.brass, [x, HT, -0.6], [x, 2.35, -0.6], 0.008, 0x3a3a40, true, 4); K.put(M.paint, lathe('tlamp', [[0.02, 0.15], [0.07, 0.12], [0.2, -0.02], [0.21, -0.04]], 18), x, 2.25, -0.6, 0, 0, 0, 1, 1, 1, 0x2a6a5a); K.put(M.lampGlass, sph(0.05, 10, 8), x, 2.22, -0.6, 0, 0, 0, 1, 1, 1, 0xffffff); }
  K.build(root, 3);
  const glows = [glowAt(root, [-1.6, 2.18, -0.6], 0.9, '#ffd090', 0.4), glowAt(root, [1.6, 2.18, -0.6], 0.9, '#ffd090', 0.4)];
  const shafts = [shaftAt(root, [-X + 1.2, 1.3, WZ + 0.4], 1.8, 3.0, Math.PI / 2 - 0.2, -0.8, 0.16, 0xffe8b8)];
  const dust = motes(root, 60, [-X + 0.4, 0.5, 0.4, 2.6, -2.0, 0.8], 41, 0.009);
  return { white, cols, newC, glows, shafts, dust, SX0, SX1, SH, ZB, SD };
}

// ================================================================= PLAYROOM (modern)
function buildPlayroom(root) {
  const R = PT.rng(2026), K = new Kit(), X = 3.2, ZB = -2.2, HT = 2.8, TY = 0.48;
  mesh(root, planeUV(9, 7, 1, 1), M.floorW, 0, 0, -0.4, -Math.PI / 2, 0, 0, false); mesh(root, plane(2.6, 2.6), M.rugK, 0.1, 0.006, -0.6, -Math.PI / 2, 0, 0, false);
  K.box(M.paint, -X - 0.3, X + 0.3, 0, HT, ZB - 0.25, ZB, 0xbfe6d8, 0.01); mesh(root, plane(2 * X, HT), M.rainbow, 0, HT / 2, ZB + 0.005, 0, 0, 0, false); K.box(M.paint, -X - 0.25, -X, 0, HT, ZB, 2, 0xd8d0f0, 0.01); ceil(root, 2 * X + 0.6, 4.4, HT, ZB + 2.1, 0xf8f4f0);
  K.box(M.paint, -X, X, 0, 0.1, ZB, ZB + 0.03, 0xffffff, 0.006);
  // window (right wall) with sunset: wall built around the opening
  const WZ = -0.9; for (const [y0, y1, z0, z1] of [[0, 0.9, ZB, 2], [2.2, HT, ZB, 2], [0.9, 2.2, ZB, WZ - 0.7], [0.9, 2.2, WZ + 0.7, 2]]) K.box(M.paint, X, X + 0.25, y0, y1, z0, z1, 0xd8d0f0, 0.01);
  mesh(root, plane(1.4, 1.3), M.sunset, X + 0.5, 1.55, WZ, 0, -Math.PI / 2, 0, false); for (const dz of [-0.7, 0, 0.7]) K.box(M.paint, X - 0.04, X + 0.04, 0.9, 2.2, WZ + dz - 0.03, WZ + dz + 0.03, 0xffffff, 0.005); for (const y of [0.9, 2.2]) K.box(M.paint, X - 0.08, X + 0.04, y - 0.03, y + 0.03, WZ - 0.72, WZ + 0.72, 0xffffff, 0.005);
  // shelves with books + toys, string lights across the back wall
  K.at(-2.1, 0, ZB + 0.2, 0, () => { K.box(M.paint, -0.8, 0.8, 0, 1.5, -0.18, 0.18, 0xffffff, 0.02); for (const y of [0.5, 1.0]) K.box(M.paint, -0.78, 0.78, y - 0.03, y, -0.16, 0.18, 0xf0f0f0, 0.004);
    for (let i = 0; i < 9; i++) K.box(M.paint, -0.7 + i * 0.07, -0.65 + i * 0.07, 0.5, 0.75 - (i % 3) * 0.04, -0.1, 0.1, [0xe86a6a, 0x6aa0e8, 0xf0c050, 0x7ac07a, 0xb08ad8][i % 5], 0.006);
    K.put(M.plastic, sph(0.12, 12, 10), 0.4, 0.62, 0, 0, 0, 0, 1, 1, 1, 0xf07a3a); for (let i = 0; i < 6; i++) K.cb(M.plastic, 0.1, 0.1, 0.1, -0.6 + (i % 3) * 0.12, 1.05 + Math.floor(i / 3) * 0.1, 0, [0xe83a2a, 0x3aa0e8, 0xf0c030, 0x5ab050][i % 4], 0, R() * 0.5, 0, 0.015);
    K.put(M.plastic, cyl(0.1, 0.1, 0.25, 14), 0.4, 1.12, 0, 0, 0, 0, 1, 1, 1, 0x5ab0a0); K.box(M.plastic, 0.0, 0.7, 0.0, 0.3, -0.12, 0.15, 0x3a8ad8, 0.04); });
  const bulbs = []; for (let i = 0; i <= 16; i++) { const t = i / 16, x = -2.8 + t * 5.6, y = 2.45 - Math.sin(t * Math.PI) * 0.3 + (i % 2) * 0.02; bulbs.push(mesh(root, sph(0.028, 8, 6), M.bulb, x, y, ZB + 0.08, 0, 0, 0, false)); }
  { const P = []; for (let i = 0; i <= 40; i++) { const t = i / 40; P.push(new THREE.Vector3(-2.8 + t * 5.6, 2.48 - Math.sin(t * Math.PI) * 0.3, ZB + 0.06)); } mesh(root, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 60, 0.004, 4), M.lid, 0, 0, 0, 0, 0, 0, false); }
  // low table + stool; dough on the table
  K.at(0.1, 0, -0.75, 0, () => { K.box(M.paint, -0.75, 0.75, TY - 0.04, TY, -0.45, 0.45, 0xffffff, 0.03); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.put(M.wood, cyl(0.03, 0.03, TY - 0.04, 10), sx * 0.66, (TY - 0.04) / 2, sz * 0.36, 0, 0, 0, 1, 1, 1, 0xd8b088); });
  const DC = [0xe8352a, 0xf6c21a, 0x2a6ae0, 0x3ab04a, 0xf080c0];
  const tub = (x, z, c, open) => { K.put(M.plastic, cyl(0.07, 0.06, 0.1, 18), x, TY + 0.05, z, 0, 0, 0, 1, 1, 1, 0xf8f8f8); if (!open) K.put(M.plastic, cyl(0.075, 0.075, 0.025, 18), x, TY + 0.11, z, 0, 0, 0, 1, 1, 1, c); else { K.put(M.dough, doughGeo(3, 0.05), x, TY + 0.1, z, 0, 0, 0, 0.062, 0.03, 0.062, c); K.put(M.plastic, cyl(0.075, 0.075, 0.025, 18), x + 0.15, TY + 0.012, z + 0.05, 0.1, 0, 0, 1, 1, 1, c); } };
  tub(-0.5, -1.0, DC[0], false); tub(-0.32, -1.08, DC[1], true); tub(0.55, -1.05, DC[2], false); tub(0.7, -0.92, DC[3], true);
  K.put(M.dough, snakeGeo(3, 0.34, 0.022), -0.35, TY, -0.55, 0, 0.6, 0, 1, 1, 1, DC[1]); K.put(M.dough, snakeGeo(5, 0.28, 0.02), -0.3, TY, -0.46, 0, 0.4, 0, 1, 1, 1, DC[2]);
  K.put(M.dough, shapeGeo(starPts(0.1, 0.045), 0.024), 0.45, TY, -0.5, 0, 0.3, 0, 1, 1, 1, DC[0]); K.put(M.dough, shapeGeo(heartPts(0.08), 0.022), 0.62, TY, -0.68, 0, -0.2, 0, 1, 1, 1, DC[4]);
  K.put(M.plastic, tor(0.06, 0.008, 4, 5), 0.3, TY + 0.012, -0.35, Math.PI / 2, 0.3, 0, 1, 1, 1, DC[2]); K.put(M.plastic, cyl(0.025, 0.025, 0.3, 12), -0.05, TY + 0.03, -0.3, 0, 0.3, Math.PI / 2, 1, 1, 1, 0xf6c21a);
  for (let i = 0; i < 3; i++) K.put(M.dough, doughGeo(i + 20, 0.08), 0.1 + i * 0.09, TY + 0.03, -0.95 + (i % 2) * 0.05, 0, 0, 0, 0.04, 0.032, 0.04, DC[(i + 2) % 5]);
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; K.put(M.dough, doughGeo(i + 30, 0.05), -0.65 + Math.cos(a) * 0.05, TY + 0.012, -0.72 + Math.sin(a) * 0.05, 0, 0, 0, 0.035, 0.014, 0.035, DC[4]); } K.put(M.dough, doughGeo(40, 0.05), -0.65, TY + 0.016, -0.72, 0, 0, 0, 0.03, 0.016, 0.03, DC[1]);
  K.at(-2.6, 0, 0.9, 0, () => { K.put(M.plastic, cyl(0.2, 0.16, 0.4, 14), 0, 0.2, 0, 0, 0, 0, 1, 1, 1, 0xe8e0d8); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, L = 0.5 + R() * 0.3; K.cb(M.paint, 0.18, 0.015, L, Math.cos(a) * L * 0.4, 0.75 + R() * 0.3, Math.sin(a) * L * 0.4, i % 2 ? 0x4aa04a : 0x3a8a3a, 0.7, -a + Math.PI / 2, 0, 0.005); } });
  K.build(root, 3);
  // the squishable ball (multi-colour swirl)
  const ball = new THREE.Group(); ball.position.set(0.1, TY, -0.62); root.add(ball); { const bk = new Kit(); bk.put(M.dough, doughGeo(50, 0.06), 0, 0.075, 0, 0, 0, 0, 0.085, 0.075, 0.085, DC[0]); bk.put(M.dough, snakeGeo(9, 0.16, 0.022), 0, 0.12, 0.02, 0.5, 0.3, 0.2, 1, 1, 1, DC[1]); bk.put(M.dough, snakeGeo(11, 0.14, 0.02), 0.01, 0.07, 0.07, -0.4, 1.2, 0.3, 1, 1, 1, DC[2]); bk.build(ball); }
  const glows = bulbs.map((b, i) => glowAt(root, [b.position.x, b.position.y, b.position.z + 0.02], 0.22, ['#ffd890', '#ffb0c8', '#b0d8ff'][i % 3], 0.5));
  const shafts = [shaftAt(root, [X - 1.2, 1.2, WZ + 0.2], 1.6, 2.8, -Math.PI / 2 + 0.25, 0.8, 0.2, 0xffc890)];
  const dust = motes(root, 50, [-1.2, X - 0.4, 0.4, 2.2, -2.0, 0.6], 51, 0.008);
  return { ball, glows, shafts, dust, bulbs, TY, ZB };
}

// ================================================================= lights, grades, API
const SET_LIGHT = {
  factory: { top: '#000000', hor: '#3a2a20', fog: '#4a3a30', fogN: 10, fogF: 70, sky: '#ffe8c8', ground: '#6a5048', hemiI: 0.95, fillCol: '#7a80d8', fillI: 0.32, sunCol: '#ffd8a0', sunI: 3.2, az: 160, el: 38, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  factoryNew: { top: '#000000', hor: '#3a2a20', fog: '#4a3a30', fogN: 10, fogF: 70, sky: '#ffe8c8', ground: '#6a5048', hemiI: 1.0, fillCol: '#7a80d8', fillI: 0.32, sunCol: '#ffe0b0', sunI: 3.4, az: 160, el: 38, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff4e8', fxTint: '#ffffff', shafts: 0 },
  factoryBust: { top: '#000000', hor: '#1a1c28', fog: '#22242e', fogN: 6, fogF: 40, sky: '#9aa8d8', ground: '#3a3640', hemiI: 0.7, fillCol: '#5a68c8', fillI: 0.3, sunCol: '#b8c4ec', sunI: 1.4, az: 160, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#e4e8f4', fxTint: '#eef0f6', shafts: 0 },
  toystore: { top: '#000000', hor: '#f0e0c0', fog: '#f0e0c4', fogN: 10, fogF: 50, sky: '#d8e0ff', ground: '#8a6a50', hemiI: 1.15, fillCol: '#8a90e8', fillI: 0.34, sunCol: '#fff0d0', sunI: 2.8, az: -110, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff8ee', fxTint: '#ffffff', shafts: 0 },
  playroom: { top: '#000000', hor: '#f8d8b8', fog: '#f8d8c0', fogN: 10, fogF: 50, sky: '#c8c8ff', ground: '#8a6a6a', hemiI: 1.0, fillCol: '#8a80e8', fillI: 0.36, sunCol: '#ffb070', sunI: 3.2, az: 105, el: 18, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff2e4', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  factory: { look: 'office', over: { exp: 1.12, con: 1.26, sat: 1.04, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.42, 0.78], hal: [0.26, '#ff9a50'], vig: [0.34, 0.46, '#2a1420'] } },
  factoryNew: { look: 'office', over: { exp: 1.14, con: 1.24, sat: 1.08, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.16], tH: ['#ffd8a0', 0.08], bloom: [0.42, 0.8], hal: [0.24, '#ff9a50'], vig: [0.3, 0.48, '#2a1420'] } },
  factoryBust: { look: 'night', over: { exp: 1.02, con: 1.2, sat: 0.66, lift: [0.03, 0.035, 0.055], tS: ['#2a3a6a', 0.26], tH: ['#c8d4ec', 0.12], bloom: [0.45, 0.72], hal: [0.1, '#8090c0'], vig: [0.4, 0.42, '#141826'] } },
  toystore: { look: 'day', over: { exp: 1.06, con: 1.22, sat: 1.12, tS: ['#3a3a8a', 0.12], tH: ['#ffe8c0', 0.06], bloom: [0.42, 0.82], hal: [0.2, '#ff9a60'], vig: [0.26, 0.48, '#4a3050'] } },
  playroom: { look: 'golden', over: { exp: 1.1, con: 1.24, sat: 1.16, tS: ['#4a3a9a', 0.16], tH: ['#ffc890', 0.1], bloom: [0.44, 0.8], hal: [0.3, '#ff8a50'], vig: [0.3, 0.46, '#3a2048'] } },
};

export function buildWorks(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  let fa, ts, pr, RUN = 1, MOOD = 'factory';
  const API = makeAPI(ctx, { prefix: 'dw_', origin: WORKS_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE, base: { factory: 'office', factoryBust: 'office', factoryNew: 'office', toystore: 'day', playroom: 'golden' },
    practicals: (name, F, W3) => { const fl = 1 + 0.06 * Math.sin(F * 0.7);
      if (name === 'factory' || name === 'factoryNew') return [{ p: W3('factory', [0.6, 2.8, -1.4]), col: '#ffd090', I: 3.2, d: 7 }, { p: W3('factory', [-3.0, 2.8, -2.6]), col: '#ffd090', I: 2.6, d: 6 }, { p: W3('factory', [fa.OX + 0.4, 1.5, fa.OZ - 0.1]), col: '#ffc070', I: 2.4, d: 4 }, { p: W3('factory', [0, 2.2, 2.0]), col: '#ffe0b0', I: 6, d: 9 }];
      if (name === 'factoryBust') return [{ p: W3('factory', [fa.OX + 0.45, 1.3, fa.OZ - 0.1]), col: '#ffb860', I: 3.2 * fl, d: 4.5 }, { p: W3('factory', [0.6, 2.8, -1.4]), col: '#a8b8ff', I: 1.2, d: 6 }, { p: W3('factory', [0, 2.2, 2.0]), col: '#8a98d8', I: 3, d: 8 }];
      if (name === 'toystore') return [{ p: W3('toystore', [0, 1.4, -1.2]), col: '#ffe8c8', I: 4.0, d: 3.5 }, { p: W3('toystore', [0, 2.2, -0.6]), col: '#ffe0b0', I: 3.4, d: 5 }, { p: W3('toystore', [0, 1.6, 1.4]), col: '#fff0e0', I: 6, d: 7 }];
      if (name === 'playroom') return [{ p: W3('playroom', [0, 2.3, -1.9]), col: '#ffc8a0', I: 2.4, d: 4 }, { p: W3('playroom', [0.1, 1.4, 0.8]), col: '#ffe0c8', I: 4.5, d: 5 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'factory' && fa) { const off = T * 0.5 * RUN; fa.cans.forEach((c, i) => { const L = fa.CX1 - fa.CX0 - 0.6, x = fa.CX0 + 0.4 + (((i * 0.42 + off) % L) + L) % L; c.position.x = x; c.visible = x < fa.CX1 - 0.25; });
        fa.belt.material.map.offset.x = -off / (fa.CX1 - fa.CX0) * 8; fa.paddle.rotation.y = T * 1.2 * RUN; fa.dough.rotation.y = T * 0.4 * RUN; fa.shafts.forEach((s) => (s.material.opacity = s.userData.op * (MOOD === 'factoryBust' ? 0.55 : 1) * (0.85 + 0.15 * Math.sin(f * 0.03)))); tickMotes(fa.dust, f, MOOD === 'factoryBust' ? 0.3 : 1); }
      if (cur === 'toystore' && ts) tickMotes(ts.dust, f, 0.6);
      if (cur === 'playroom' && pr) { pr.glows.forEach((g, i) => (g.material.opacity = g.userData.op * (0.8 + 0.2 * Math.sin(f * 0.15 + i * 1.3)))); tickMotes(pr.dust, f, 0.5); } },
    mood: (name) => { if (GROUP_OF[name] === 'factory') API.mood(name); },
    apply: (v) => { if (v.run != null) API.run(v.run); if (v.chart != null) API.chart(v.chartUp ?? false, v.chart); if (v.colors) API.colors(...v.colors); if (v.squish != null) API.squish(v.squish); } });
  fa = buildFactory(API.groups.factory); ts = buildToystore(API.groups.toystore); pr = buildPlayroom(API.groups.playroom);
  for (const g of Object.values(API.groups)) g.traverse((o) => { if (o.isMesh && [M.rainbow, M.wallSign].includes(o.material)) o.receiveShadow = false; });
  API.parts = { fa, ts, pr };
  // [PD-sets2] state setters
  API.mood = (m) => { MOOD = m; const bust = m === 'factoryBust'; fa.bust.visible = bust; fa.newG.visible = m === 'factoryNew'; if (bust) RUN = 0; fa.glows.forEach((g) => (g.material.opacity = g.userData.op * (bust ? 0.25 : 1)));
    fa.cans.forEach((c) => c.children.forEach((ch) => { if (ch.userData.body) ch.material = bust ? M.canWPdust : M.canWP; })); };
  API.run = (v) => { RUN = MOOD === 'factoryBust' ? 0 : v; };
  API.chart = (up, t) => fa.setLine(!!up, t);
  API.colors = (r = 0, y = 0, b = 0) => { const KK = { red: r, yellow: y, blue: b }; for (const c in ts.cols) { const list = ts.cols[c], n = list.length; list.forEach((g, i) => { const e = clamp01(KK[c] * n - i * 0.9), s = e <= 0 ? 0.0001 : backOut(e); g.visible = e > 0; g.scale.setScalar(s); }); } };
  API.squish = (t) => { const k = clamp01(t), sq = Math.sin(Math.PI * Math.min(1, k * 1.2)) * 0.55 + sm(0.6, 1, k) * 0.25; pr.ball.scale.set(1 + sq * 0.6, 1 - sq * 0.7, 1 + sq * 0.5); };
  API.glows = { factory: fa.glows, toystore: ts.glows, playroom: pr.glows };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  API.spots = { vat: API.W3('factory', [fa.VX, 0, fa.VZ]), belt: API.W3('factory', [0.5, fa.CY, fa.CZ]), office: API.W3('factory', [fa.OX, 0, fa.OZ]), chart: API.W3('factory', [fa.CHX, fa.CHY, fa.CHZ]),
    shelf: API.W3('toystore', [0, 0, ts.ZB + ts.SD]), table: API.W3('playroom', [0.1, pr.TY, -0.75]), ball: API.W3('playroom', [0.1, pr.TY, -0.62]) };
  const V = API.V;
  API.views = [
    V('factory', [2.2, 2.0, 4.6], [-0.6, 1.6, -4.0], 56, 1.4, [-0.4, 1.1, -1.4], { run: 1 }), // 0 factory wide (busy)
    V('factory', [1.4, 1.35, 0.6], [0.2, 0.95, -1.2], 46, 3, [0.4, 1.0, -1.2], { run: 1 }), // 1 conveyor close: WALLPAPER CLEANER cans
    V('factory', [-1.6, 2.6, -0.2], [-3.4, 1.7, -2.6], 48, 3, [-3.4, 1.8, -2.6], { run: 1 }), // 2 vat from above: putty + paddle
    V('factoryBust', [2.2, 2.0, 4.6], [-0.6, 1.6, -4.0], 56, 1.4, [-0.4, 1.1, -1.4], { run: 0 }), // 3 factory wide (bust)
    V('factoryBust', [2.55, 1.55, -0.4], [2.5, 1.5, -2.7], 46, 3, [2.5, 1.55, -2.6], { chart: 1 }), // 4 office: falling SALES chart
    V('factoryBust', [4.6, 1.4, -1.4], [4.6, 0.9, -3.6], 50, 3, [4.6, 0.9, -3.4], {}), // 5 dusty crate stacks + cobwebs
    V('factoryNew', [-1.2, 1.6, 0.6], [-2.6, 1.2, -2.8], 50, 2.4, [-2.0, 1.0, -2.8], { run: 1 }), // 6 1956 reformulation by the vat
    V('toystore', [0.25, 1.5, 2.4], [0, 1.3, -2.4], 54, 1.6, [0, 1.3, -2.0], { colors: [0, 0, 0] }), // 7 toy shop wide, off-white only
    V('toystore', [0.1, 1.35, -0.6], [0, 1.25, -2.4], 46, 4, [0, 1.25, -2.1], { colors: [1, 1, 1] }), // 8 shelf close, colours in
    V('playroom', [0.5, 1.15, 1.2], [0.05, 0.5, -0.9], 48, 2.2, [0.1, 0.55, -0.7], { squish: 0 }), // 9 playroom: table with dough
    V('playroom', [0.25, 0.75, -0.1], [0.08, 0.52, -0.7], 40, 6, [0.1, 0.55, -0.62], { squish: 0.5 }), // 10 squish macro
  ];
  API.mood('factory'); API.run(1); API.chart(false, 0); API.colors(0, 0, 0); API.squish(0); API.tick(0);
  return API;
}
