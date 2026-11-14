// bw_sets.js [BW-sets]: sets for "Bubble Wrap was invented as wallpaper" (Oddverra short). Original cozy toy-like rooms, no real logos.
//   garage   : 1957 New Jersey garage workshop: heat-sealing machine with two shower curtains feeding its rollers, the bubble sheet coming
//              out across a table (seal(t) grows it), workbench, pegboard, hanging shop lamp, idea sketch, 1957 calendar.  origin (-40000, 0, 0)
//   living   : 1957 living room papered in pastel BUBBLE WALLPAPER: atomic sofa, starburst clock, TV console, floor lamp, window.  origin (-40000, 0, 600)
//              'livingNo' = same room, gloomy evening (nobody bought it).
//   green    : greenhouse wrapped in bubble panels, seed tables, pots, garden outside; 'greenFlop' = grey cold day, plants droop (droop(t)).  origin (-40000, 0, 1200)
//   factory  : 1960 small factory: film drums -> heated rollers -> conveyor -> winder, stacks of rolls (rolls(n)), SEALED AIR sign. origin (-42500, 0, 0)
//   computer : 1959 room-sized computer (generic "BIG COMPUTER CO." units, no logos): processor, console, tape drives, printer,
//              blinking lights; wrap(t) wraps the processor in bubble wrap, crate(t) builds a shipping crate.          origin (-42500, 0, 600)
//   modern   : today: a kid's bright room on a snowy January day, APPRECIATION DAY banner, calendar, 3D bubble-wrap mat (popped(t)). origin (-42500, 0, 1200)
// Each set: local frame, camera side +z, back wall at z = -3.2. Test flag ?bwview=N (main.js).
import { Kit } from './world.js';
import { H, TAU, clamp01, sm, backOut, SERIF, SANS, cyl, sph, plane, planeUV, lathe, mesh, nond, lumpGeo, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';

export const BW_ORIGIN = { garage: [-40000, 0, 0], living: [-40000, 0, 600], green: [-40000, 0, 1200], factory: [-42500, 0, 0], computer: [-42500, 0, 600], modern: [-42500, 0, 1200] };
const GROUP_OF = { garage: 'garage', living: 'living', livingNo: 'living', green: 'green', greenFlop: 'green', factory: 'factory', computer: 'computer', modern: 'modern' };
let THREE, PT, M;
const X = 3.6, ZB = -3.2;

// ---------------------------------------------------------------- painters
function bubbles(g, w, h, o = {}) { const r = o.r || 14, gap = r * 2.35, R = PT.rng(o.seed || 3);
  for (let y = r, j = 0; y < h + r; y += gap * 0.87, j++) for (let x = (j % 2) * gap / 2; x < w + r; x += gap) {
    const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r); gr.addColorStop(0, o.hi || 'rgba(255,255,255,0.95)'); gr.addColorStop(0.6, o.mid || 'rgba(225,242,255,0.7)'); gr.addColorStop(1, o.edge || 'rgba(120,170,220,0.85)');
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = gr; g.fill(); g.lineWidth = Math.max(1, r * 0.1); g.strokeStyle = o.ink || 'rgba(70,100,160,0.55)'; g.stroke();
    g.beginPath(); g.ellipse(x - r * 0.38, y - r * 0.4, r * 0.28, r * 0.16, -0.7, 0, TAU); g.fillStyle = '#ffffff'; g.fill(); if (o.pop && R() < o.pop) { g.fillStyle = o.base || '#cfe6f6'; g.beginPath(); g.arc(x, y, r * 0.9, 0, TAU); g.fill(); g.strokeStyle = 'rgba(70,100,160,0.6)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - r * 0.6, y - r * 0.2); g.lineTo(x + r * 0.5, y + r * 0.3); g.stroke(); } } }
function bubbleWrapTex(g, w, h) { g.fillStyle = '#cfe6f6'; g.fillRect(0, 0, w, h); bubbles(g, w, h, { r: 13 }); }
function wallpaperTex(g, w, h) { g.fillStyle = '#bfe6d6'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.95 + 0.06 * PT.fbm(u, v, 4, 4, 3, 2));
  bubbles(g, w, h, { r: 18, hi: 'rgba(255,255,255,0.95)', mid: 'rgba(214,246,234,0.8)', edge: 'rgba(80,170,150,0.8)', ink: 'rgba(40,110,100,0.55)' });
  const R = PT.rng(57); for (let i = 0; i < 10; i++) { const x = R() * w, y = R() * h; g.save(); g.translate(x, y); g.strokeStyle = '#e8705a'; g.lineWidth = 3; for (let k = 0; k < 8; k++) { g.rotate(Math.PI / 4); g.beginPath(); g.moveTo(4, 0); g.lineTo(k % 2 ? 12 : 18, 0); g.stroke(); } g.restore(); } }
function concreteTex(g, w, h) { g.fillStyle = '#a8a4a0'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.86 + 0.2 * PT.fbm(u, v, 6, 6, 4, 7)); const R = PT.rng(9);
  for (let i = 0; i < 8; i++) { const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); g.save(); g.translate(R() * w, R() * h); g.scale(30 + R() * 60, 20 + R() * 40); gr.addColorStop(0, 'rgba(70,60,60,0.25)'); gr.addColorStop(1, 'rgba(70,60,60,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill(); g.restore(); }
  g.strokeStyle = 'rgba(80,70,70,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke(); }
function pegTex(g, w, h) { g.fillStyle = '#c8a070'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(70,40,20,0.6)'; for (let y = 8; y < h; y += 16) for (let x = 8; x < w; x += 16) { g.beginPath(); g.arc(x, y, 2.4, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(40,30,40,0.18)'; for (const [x, y, a, b] of [[60, 40, 14, 120], [120, 30, 50, 16], [200, 50, 10, 110], [260, 40, 60, 60], [360, 50, 16, 100], [420, 60, 70, 20]]) g.fillRect(x, y, a, b); }
function sketchTex(g, w, h) { PT.paper(g, w, h, { base: '#f6f0de', seed: 11 }); g.strokeStyle = '#2a3a7a'; g.lineWidth = 4; g.strokeRect(w * 0.12, h * 0.2, w * 0.76, h * 0.5);
  g.fillStyle = 'rgba(42,58,122,0.25)'; for (let y = h * 0.25; y < h * 0.68; y += 22) for (let x = w * 0.16 + ((y / 22) % 2) * 11; x < w * 0.86; x += 22) { g.beginPath(); g.arc(x, y, 8, 0, TAU); g.fill(); }
  txt(g, 'BUBBLE WALLPAPER!', w / 2, h * 0.1, w * 0.86, h * 0.09, { col: '#2a3a7a', font: SANS }); txt(g, 'TEXTURED · MODERN', w / 2, h * 0.82, w * 0.7, h * 0.07, { col: '#c8402e', font: SANS });
  g.strokeStyle = '#c8402e'; g.lineWidth = 5; g.beginPath(); g.ellipse(w * 0.5, h * 0.45, w * 0.46, h * 0.33, -0.05, 0, TAU); g.stroke(); }
function calTex(g, w, h, mon, yr, circ) { g.fillStyle = '#f8f4ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8402e'; g.fillRect(0, 0, w, h * 0.3); txt(g, mon, w / 2, h * 0.12, w * 0.86, h * 0.14, { col: '#fff4e0', font: SANS }); if (yr) txt(g, yr, w / 2, h * 0.24, w * 0.5, h * 0.08, { col: '#fff4e0', font: SANS });
  g.fillStyle = '#3a3a4a'; g.font = `bold ${h * 0.05}px ${SANS}`; g.textAlign = 'center'; for (let i = 0; i < 31; i++) { const x = w * (0.1 + (i % 7) * 0.133), y = h * (0.4 + Math.floor(i / 7) * 0.12); g.fillText(String(i + 1), x, y);
    if (circ && i === circ) { g.strokeStyle = '#e83a5a'; g.lineWidth = 5; g.beginPath(); g.ellipse(x, y - h * 0.015, w * 0.07, h * 0.05, 0, 0, TAU); g.stroke(); } } }
function windowView(g, w, h, o = {}) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.top || '#6aa8f0'); gr.addColorStop(0.75, o.bot || '#d8ecfa'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = o.lawn || '#7ab85a'; g.fillRect(0, h * 0.72, w, h * 0.28); const R = PT.rng(o.seed || 4);
  for (let i = 0; i < 3; i++) { const x = w * (0.1 + i * 0.36), y = h * 0.6; g.fillStyle = ['#f6e8d0', '#e8d4f0', '#d8f0e0'][i]; g.fillRect(x, y, w * 0.22, h * 0.14); g.fillStyle = ['#c8503a', '#5a6ac8', '#3a8a6a'][i]; g.beginPath(); g.moveTo(x - 8, y); g.lineTo(x + w * 0.11, y - h * 0.09); g.lineTo(x + w * 0.22 + 8, y); g.fill(); g.fillStyle = '#4a5a7a'; g.fillRect(x + w * 0.04, y + h * 0.04, w * 0.05, h * 0.04); }
  for (let i = 0; i < 5; i++) { g.fillStyle = o.snow ? '#e8f0f8' : '#4a9a4a'; g.beginPath(); g.arc(R() * w, h * (0.66 + R() * 0.06), 16 + R() * 18, 0, TAU); g.fill(); }
  if (o.snow) { g.fillStyle = '#f4f8ff'; g.fillRect(0, h * 0.72, w, h * 0.28); for (let i = 0; i < 160; i++) { g.globalAlpha = 0.85; g.beginPath(); g.arc(R() * w, R() * h * 0.75, 1.5 + R() * 2.5, 0, TAU); g.fillStyle = '#ffffff'; g.fill(); } g.globalAlpha = 1; } }
function signTex(g, w, h, lines, bg, fg, acc) { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = acc; g.lineWidth = h * 0.06; g.strokeRect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16);
  lines.forEach(([s, y, sz, c], i) => txt(g, s, w / 2, h * y, w * 0.86, h * sz, { col: c || fg, font: SANS })); }
function brickTex(g, w, h) { PT.brick ? PT.brick(g, w, h, { base: '#a8584a' }) : (g.fillStyle = '#a8584a', g.fillRect(0, 0, w, h)); }
function panelTex(g, w, h) { g.fillStyle = '#9aaab8'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a3040'; g.fillRect(w * 0.08, h * 0.08, w * 0.84, h * 0.4); const R = PT.rng(14);
  for (let j = 0; j < 4; j++) for (let i = 0; i < 10; i++) { g.fillStyle = R() < 0.4 ? '#ffd860' : R() < 0.5 ? '#ff7050' : '#5a6070'; g.beginPath(); g.arc(w * (0.14 + i * 0.08), h * (0.15 + j * 0.09), w * 0.022, 0, TAU); g.fill(); }
  for (let i = 0; i < 6; i++) { g.fillStyle = '#e8e8ee'; g.fillRect(w * (0.12 + i * 0.13), h * 0.58, w * 0.09, h * 0.06); } txt(g, 'BCC', w / 2, h * 0.82, w * 0.3, h * 0.1, { col: '#2a3040', font: SANS }); }
function tapeTex(g, w, h) { g.fillStyle = '#a8b4c0'; g.fillRect(0, 0, w, h); g.fillStyle = '#20242e'; g.fillRect(w * 0.1, h * 0.06, w * 0.8, h * 0.5); for (const y of [0.2, 0.42]) { g.beginPath(); g.arc(w * 0.5, h * y, w * 0.28, 0, TAU); g.fillStyle = '#c8ccd8'; g.fill(); g.beginPath(); g.arc(w * 0.5, h * y, w * 0.1, 0, TAU); g.fillStyle = '#20242e'; g.fill(); g.strokeStyle = '#6a3a2a'; g.lineWidth = w * 0.12; g.beginPath(); g.arc(w * 0.5, h * y, w * 0.19, 0, TAU); g.stroke(); }
  for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#ffd860' : '#5a6070'; g.fillRect(w * (0.2 + i * 0.16), h * 0.66, w * 0.1, h * 0.04); } }
function crateTex(g, w, h) { PT.planks(g, w, h, { base: '#c8a06a', n: 5, seed: 71, joints: 0 }); g.save(); g.translate(w / 2, h / 2); g.rotate(-0.06); txt(g, 'FRAGILE', 0, -h * 0.08, w * 0.7, h * 0.16, { col: 'rgba(200,40,40,0.85)', font: SANS }); txt(g, 'THIS SIDE UP ↑', 0, h * 0.14, w * 0.55, h * 0.08, { col: 'rgba(40,40,60,0.8)', font: SANS }); g.restore(); }
function rugTex(g, w, h, a, b) { g.fillStyle = a; g.fillRect(0, 0, w, h); g.strokeStyle = b; g.lineWidth = 10; for (let i = 1; i < 5; i++) { g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.5 - i * 22, h * 0.5 - i * 22, 0, 0, TAU); g.stroke(); } }
function clockTex(g, w, h) { g.clearRect(0, 0, w, h); g.save(); g.translate(w / 2, h / 2); g.strokeStyle = '#c89a3a'; g.lineWidth = 6; for (let i = 0; i < 16; i++) { g.rotate(TAU / 16); g.beginPath(); g.moveTo(w * 0.2, 0); g.lineTo(w * (i % 2 ? 0.38 : 0.48), 0); g.stroke(); g.beginPath(); g.arc(w * (i % 2 ? 0.4 : 0.49), 0, 5, 0, TAU); g.fillStyle = '#c89a3a'; g.fill(); }
  g.beginPath(); g.arc(0, 0, w * 0.18, 0, TAU); g.fillStyle = '#f8f0dc'; g.fill(); g.lineWidth = 4; g.stroke(); g.strokeStyle = '#2b1d4a'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -w * 0.13); g.moveTo(0, 0); g.lineTo(w * 0.09, w * 0.04); g.stroke(); g.restore(); }
function bannerTex(g, w, h) { const n = 12; for (let i = 0; i < n; i++) { const x0 = i * w / n; g.fillStyle = ['#ff7a9a', '#ffd040', '#5ac8f0', '#8ae07a'][i % 4]; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + w / n, 0); g.lineTo(x0 + w / n / 2, h * 0.3); g.fill(); }
  g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(w * 0.03, h * 0.34, w * 0.94, h * 0.62, 30); g.fill(); g.lineWidth = 8; g.strokeStyle = '#3a6ac8'; g.stroke();
  txt(g, 'HAPPY BUBBLE WRAP', w / 2, h * 0.53, w * 0.86, h * 0.22, { col: '#3a6ac8', font: SANS }); txt(g, 'APPRECIATION DAY!', w / 2, h * 0.8, w * 0.8, h * 0.2, { col: '#e8406a', font: SANS }); }
function posterTex(g, w, h, kind) { g.fillStyle = kind ? '#2a3a7a' : '#ffd040'; g.fillRect(0, 0, w, h); g.fillStyle = kind ? '#ffd040' : '#e8406a'; g.beginPath(); g.arc(w / 2, h * 0.45, w * 0.3, 0, TAU); g.fill(); txt(g, kind ? 'SPACE!' : 'POP!', w / 2, h * 0.85, w * 0.8, h * 0.14, { col: kind ? '#ffffff' : '#2a3a7a', font: SANS }); }

// ---------------------------------------------------------------- materials
function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.bw = toon({ map: T(256, 256, bubbleWrapTex, [3, 3]), transparent: true, opacity: 0.82, emissive: 0x30404c, side: THREE.DoubleSide }); m.bw.emissiveMap = m.bw.map;
  m.bwSolid = em(T(256, 256, bubbleWrapTex, [2, 2]), 0x2a3a48);
  m.bwPanel = toon({ map: T(256, 256, bubbleWrapTex, [4, 4]), transparent: true, opacity: 0.5, emissive: 0x405060, depthWrite: false, side: THREE.DoubleSide }); m.bwPanel.emissiveMap = m.bwPanel.map;
  m.bubble = toon({ color: 0xe8f6ff, transparent: true, opacity: 0.86, emissive: 0x30485a }); m.bubblePop = toon({ color: 0xbfd8ea, emissive: 0x1a2a38 });
  m.wallpaper = em(T(512, 512, wallpaperTex, [3, 2]), 0x1a2a24); m.concrete = vc({ map: T(512, 512, concreteTex, [2, 2]) }); m.peg = em(T(512, 256, pegTex), 0x2a1a10);
  m.planks = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#b88a5a', n: 6, seed: 22 })) }); m.floorW = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#a8703e', n: 7, seed: 51 }), [2, 2]) });
  m.floorL = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#d8a46a', n: 7, seed: 52 }), [2, 2]) });
  m.wallG = vc({ map: T(256, 256, (g, w, h) => { PT.planks(g, w, h, { base: '#8aa8a0', n: 5, seed: 31, joints: 0 }); }, [3, 1]) });
  m.sketch = em(T(512, 400, sketchTex), 0x2a2620); m.cal57 = em(T(256, 320, (g, w, h) => calTex(g, w, h, 'MAY', '1957')), 0x2a2620); m.cal60 = em(T(256, 320, (g, w, h) => calTex(g, w, h, 'JAN', '1960')), 0x2a2620); m.cal59 = em(T(256, 320, (g, w, h) => calTex(g, w, h, 'OCT', '1959')), 0x2a2620);
  m.calJan = em(T(320, 400, (g, w, h) => calTex(g, w, h, 'JANUARY', 'LAST MONDAY!', 24)), 0x2a2620);
  m.view = C.basic(T(512, 384, (g, w, h) => windowView(g, w, h, {})), 1.1); m.viewSnow = C.basic(T(512, 384, (g, w, h) => windowView(g, w, h, { snow: 1, top: '#8ab8e8', bot: '#e8f0fa', seed: 9 })), 1.15);
  m.viewEve = C.basic(T(512, 384, (g, w, h) => windowView(g, w, h, { top: '#2a3070', bot: '#c88a8a', lawn: '#3a5a4a' })), 0.9);
  m.saSign = em(T(1024, 256, (g, w, h) => signTex(g, w, h, [['SEALED AIR CORP.', 0.44, 0.42], ['EST. 1960 · HAWTHORNE, N.J.', 0.78, 0.15, '#ffd860']], '#2a4a7a', '#ffffff', '#ffd860')), 0x202838);
  m.bccSign = em(T(1024, 256, (g, w, h) => signTex(g, w, h, [['BIG COMPUTER CO.', 0.44, 0.4], ['DATA PROCESSING SYSTEM · 1959', 0.78, 0.15, '#9ad0ff']], '#1e2a44', '#ffffff', '#9ad0ff')), 0x182030);
  m.panel = em(T(512, 512, panelTex), 0x1a2028); m.tape = em(T(256, 512, tapeTex), 0x1a2028); m.crate = vc({ map: T(512, 512, crateTex) });
  m.rugL = vc({ map: T(512, 320, (g, w, h) => rugTex(g, w, h, '#e8a868', '#c8603a')) }); m.rugM = vc({ map: T(512, 320, (g, w, h) => rugTex(g, w, h, '#8ac8f0', '#f6f0ff')) });
  m.clock = new THREE.MeshBasicMaterial({ map: T(256, 256, clockTex), transparent: true, fog: false }); m.banner = em(T(1024, 320, bannerTex), 0x2a2a30);
  m.poster = [0, 1].map((k) => em(T(256, 360, (g, w, h) => posterTex(g, w, h, k)), 0x202020)); m.brick = vc({ map: T(512, 512, brickTex, [3, 1.5]) });
  m.blink = [0, 1, 2].map((i) => new THREE.MeshBasicMaterial({ color: new THREE.Color([0xffd860, 0xff6a4a, 0x7ae0ff][i]).multiplyScalar(1.8), fog: false }));
  m.heat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff7a30).multiplyScalar(1.6), fog: false });
  m.plantG = toon({ color: 0x4aa84a }); m.plantG2 = toon({ color: 0x3a9048 }); m.flower = toon({ color: 0xff7a9a });
  m.curtA = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#f4f8ff'; g.fillRect(0, 0, w, h); g.fillStyle = '#7ab8e8'; for (let x = 0; x < w; x += 40) g.fillRect(x, 0, 18, h); }), side: THREE.DoubleSide });
  m.curtB = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#ffd8e4'; g.fillRect(0, 0, w, h); const R = PT.rng(3); for (let i = 0; i < 26; i++) { const x = R() * w, y = R() * h; g.fillStyle = '#ff8ab0'; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x + Math.cos(k * 1.256) * 7, y + Math.sin(k * 1.256) * 7, 6, 0, TAU); g.fill(); } g.fillStyle = '#ffd040'; g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); } }), side: THREE.DoubleSide });
  return m; }

// ---------------------------------------------------------------- helpers
// 3D bubble sheet lying in the xz plane, centred at the group origin, growing along -z..+z (length L), width W, bubble radius r
function bubbleSheet(parent, W, L, r, mat = M.bubble) { const g = new THREE.Group(); parent.add(g); const base = mesh(g, plane(W, L), M.bw, 0, 0.004, 0, -Math.PI / 2, 0, 0, false); base.receiveShadow = true;
  const gap = r * 2.3, nx = Math.floor(W / gap), nz = Math.floor(L / (gap * 0.87)), im = new THREE.InstancedMesh(sph(r, 10, 6), mat, nx * nz), m4 = new THREE.Matrix4(); let k = 0;
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = -W / 2 + gap / 2 + i * gap + (j % 2 ? gap / 4 : -gap / 4), z = -L / 2 + gap / 2 + j * gap * 0.87; m4.makeScale(1, 0.55, 1); m4.setPosition(x, 0.004, z); im.setMatrixAt(k++, m4); }
  im.castShadow = false; im.receiveShadow = true; g.add(im); g.userData = { im, n: k, base }; return g; }
function room(root, o) { const K = new Kit(), HT = o.HT || 3.0;
  mesh(root, planeUV(2 * X + 1, 8, o.fu || 1, o.fv || 1), o.floor, 0, 0, 0.6, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  K.box(o.wall, -X - 0.3, X + 0.3, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(o.side || o.wall, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 4.6, 0xffffff, 0.01);
  if (o.base !== false) K.box(M.paint, -X, X, 0, 0.12, ZB, ZB + 0.04, o.trim || 0xf4ece0, 0.01);
  mesh(root, plane(2 * X + 0.6, 8), H.toon({ color: o.ceil || 0xf0e6d6, side: THREE.DoubleSide }), 0, HT, 0.6, Math.PI / 2, 0, 0, false).receiveShadow = false;
  return K; }
function lampAt(root, K, x, z, HT, col = 0x2a6a4a, y = 2.3) { K.beam(M.metal, [x, HT, z], [x, y + 0.1, z], 0.008, 0x2a2a30, true, 4); K.put(M.paint, lathe('shadeL', [[0.02, 0.12], [0.24, -0.08], [0.25, -0.1]], 16), x, y, z, 0, 0, 0, 1, 1, 1, col); return mesh(root, sph(0.06, 10, 8), M.lampGlass, x, y - 0.05, z, 0, 0, 0, false); }
function plantAt(K, x, y, z, s = 1, col = 0xc8683a) { K.put(M.paint, cyl(0.12 * s, 0.09 * s, 0.2 * s, 12), x, y + 0.1 * s, z, 0, 0, 0, 1, 1, 1, col); const g = new THREE.Group(); g.position.set(x, y + 0.2 * s, z); g.scale.setScalar(s);
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, lf = new THREE.Group(); lf.rotation.set(0.45, a, 0, 'YXZ'); const l = mesh(lf, sph(0.09, 8, 6), i % 2 ? M.plantG : M.plantG2, 0, 0.22, 0, 0, 0, 0, true); l.scale.set(0.5, 1.5, 0.22); g.add(lf); }
  mesh(g, sph(0.05, 8, 6), M.flower, 0, 0.36, 0, 0, 0, 0, true); return g; }

// ================================================================= GARAGE (1957)
function buildGarage(root) { const R = PT.rng(1957), HT = 2.9; const K = room(root, { floor: M.concrete, wall: M.planks, HT, ceil: 0xd8c8a8, trim: 0x8a6a48 });
  // roll-up garage door (left back) with windows
  K.box(M.paint, -X + 0.2, -0.9, 0, 2.3, ZB + 0.01, ZB + 0.08, 0xe8e0d0, 0.02); for (let i = 1; i < 5; i++) K.box(M.paint, -X + 0.2, -0.9, i * 0.46 - 0.02, i * 0.46 + 0.02, ZB + 0.08, ZB + 0.1, 0xc8c0b0, 0.005);
  for (let i = 0; i < 4; i++) mesh(root, plane(0.5, 0.26), M.view, -X + 0.55 + i * 0.6, 1.72, ZB + 0.09, 0, 0, 0, false);
  // pegboard + tools (back right)
  mesh(root, plane(2.2, 1.1), M.peg, 2.2, 1.75, ZB + 0.02, 0, 0, 0, false);
  for (const [x, y, c] of [[1.4, 1.9, 0xc83a2a], [1.8, 1.95, 0x3a6ac8], [2.3, 1.85, 0x6a6a78], [2.8, 1.9, 0xe8b830]]) { K.cb(M.paint, 0.05, 0.4, 0.03, x, y, ZB + 0.05, 0x8a6a48); K.cb(M.metal, 0.16, 0.08, 0.04, x, y + 0.2, ZB + 0.06, c); }
  // workbench (right) with vise, cans, radio
  K.at(2.4, 0, -2.5, 0, () => { K.box(M.wood, -1.0, 1.0, 0.86, 0.92, -0.4, 0.4, 0x8a5a34, 0.02); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.box(M.wood, sx * 0.92 - 0.05, sx * 0.92 + 0.05, 0, 0.86, sz * 0.32 - 0.05, sz * 0.32 + 0.05, 0x6a4028, 0.01);
    K.box(M.wood, -0.95, 0.95, 0.25, 0.3, -0.36, 0.36, 0x7a4a2a, 0.01);
    for (let i = 0; i < 4; i++) K.put(M.paint, cyl(0.07, 0.07, 0.16, 12), -0.7 + i * 0.17, 1.0, -0.2, 0, 0, 0, 1, 1, 1, [0xc83a2a, 0x3a8ac8, 0xe8c040, 0x5aa85a][i]);
    K.box(M.paint, 0.35, 0.75, 0.92, 1.18, -0.25, 0.0, 0x8a3a2a, 0.04); K.put(M.brass, cyl(0.06, 0.06, 0.02, 14), 0.48, 1.06, 0.01, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8c070); });
  // shelf with boxes (left wall)
  for (const y of [1.2, 1.8]) { K.box(M.wood, -X + 0.02, -X + 0.42, y, y + 0.04, -1.8, -0.2, 0x8a6a48, 0.01); for (let i = 0; i < 3; i++) K.box(M.paint, -X + 0.06, -X + 0.36, y + 0.04, y + 0.3, -1.7 + i * 0.5, -1.35 + i * 0.5, [0xc8a070, 0xb89060, 0xd8b080][(i + (y > 1.5)) % 3], 0.02); }
  // THE MACHINE: heat sealer at (0, 0, -1.4); feed from the back, sheet out toward +z
  const MZ = -1.4; K.at(0, 0, MZ, 0, () => {
    K.box(M.paint, -0.62, 0.62, 0, 0.8, -0.36, 0.36, 0x5a8a7a, 0.06); K.box(M.paint, -0.66, 0.66, 0.8, 0.86, -0.4, 0.4, 0x3a5a54, 0.02);
    for (const z of [-0.08, 0.08]) K.put(M.chrome, cyl(0.08, 0.08, 1.1, 18), 0, 0.95, z, 0, 0, Math.PI / 2, 1, 1, 1, 0xd8dce4);
    K.box(M.paint, -0.6, 0.6, 1.06, 1.3, -0.3, 0.1, 0x6a9a8a, 0.05); K.box(M.metal, -0.55, 0.55, 1.03, 1.07, -0.26, 0.06, 0x3a3a42, 0.01);
    for (const sx of [-0.66, 0.66]) K.box(M.paint, sx - 0.04, sx + 0.04, 0.8, 1.32, -0.3, 0.1, 0x3a5a54, 0.01);
    K.put(M.paint, cyl(0.06, 0.06, 0.03, 16), -0.3, 0.55, 0.37, Math.PI / 2, 0, 0, 1, 1, 1, 0xf2ead6); K.put(M.paint, cyl(0.06, 0.06, 0.03, 16), 0.0, 0.55, 0.37, Math.PI / 2, 0, 0, 1, 1, 1, 0xf2ead6);
    K.box(M.paint, 0.22, 0.42, 0.45, 0.62, 0.36, 0.4, 0x2a2a30, 0.01); K.put(M.paint, cyl(0.04, 0.04, 0.6, 8), 0.5, 1.6, -0.2, 0, 0, 0, 1, 1, 1, 0x3a3a42);
    // curtain rolls on a stand behind
    for (const [y, c] of [[1.55, 0], [1.15, 1]]) { K.put(M.wood, cyl(0.07, 0.07, 1.0, 14), 0, y, -0.85, 0, 0, Math.PI / 2, 1, 1, 1, 0x8a6a48); K.put(c ? M.curtB : M.curtA, cyl(0.16, 0.16, 0.9, 18), 0, y, -0.85, 0, 0, Math.PI / 2, 1, 1, 1, 0xffffff); }
    for (const sx of [-0.55, 0.55]) K.box(M.wood, sx - 0.04, sx + 0.04, 0, 1.75, -0.89, -0.81, 0x6a4028, 0.01); });
  // curtains hanging from the rolls into the rollers
  const cA = mesh(root, plane(0.9, 1), M.curtA, 0, 1.25, MZ - 0.52, -0.62, 0, 0, false); cA.scale.set(1, 0.95, 1); const cB = mesh(root, plane(0.9, 1), M.curtB, 0, 1.03, MZ - 0.48, -0.42, 0, 0, false); cB.scale.set(1, 0.42, 1);
  const heat = nond(mesh(root, plane(1.0, 0.04), M.heat, 0, 1.05, MZ + 0.11, 0, 0, 0, false)); const lampR = mesh(root, sph(0.035, 10, 8), M.blink[1], 0.32, 0.53, MZ + 0.42, 0, 0, 0, false);
  // output table + growing bubble sheet
  K.box(M.wood, -0.6, 0.6, 0.78, 0.82, MZ + 0.42, MZ + 2.0, 0xa87a4a, 0.01); for (const [sx, sz] of [[-1, 0.5], [1, 0.5], [-1, 1.9], [1, 1.9]]) K.box(M.wood, sx * 0.55 - 0.04, sx * 0.55 + 0.04, 0, 0.78, MZ + sz - 0.04, MZ + sz + 0.04, 0x7a4a2a, 0.01);
  const sheetG = new THREE.Group(); sheetG.position.set(0, 0.83, MZ + 0.2); root.add(sheetG); const sheet = bubbleSheet(sheetG, 0.84, 1.8, 0.022); sheet.position.z = 0.9;
  // sketch + calendar on the wall, finished samples, leaning roll, hanging lamp
  mesh(root, plane(0.85, 0.66), M.sketch, -0.25, 2.05, ZB + 0.03, 0, 0, 0, false); mesh(root, plane(0.32, 0.4), M.cal57, 0.8, 2.05, ZB + 0.03, 0, 0, 0, false);
  for (const [x, y] of [[-X + 0.02, 1.5]]) mesh(root, plane(0.9, 1.1), M.bwSolid, x, y, 0.6, 0, Math.PI / 2, 0, false);
  K.put(M.bwSolid, cyl(0.16, 0.16, 1.1, 18), -1.5, 0.56, -2.6, 0.12, 0, 0.2, 1, 1, 1, 0xffffff);
  const bulb = lampAt(root, K, 0.3, -0.6, HT, 0x2a5a4a, 2.3);
  K.build(root, 3);
  const glows = [glowAt(root, [0.3, 2.22, -0.55], 0.9, '#ffc070', 0.5), glowAt(root, [0, 1.05, MZ + 0.16], 0.7, '#ff8a40', 0.0)];
  const dust = motes(root, 40, [-2, 2, 0.4, 2.6, -2.6, 0.6], 57, 0.008);
  return { sheet, sheetG, heat, lampR, glows, dust, cA, cB }; }

// ================================================================= LIVING ROOM (1957)
function buildLiving(root) { const HT = 2.9; const K = room(root, { floor: M.floorW, wall: M.wallpaper, side: M.wallpaper, HT, ceil: 0xfff4e4, trim: 0xf6f0e4 });
  // window (back left) with curtains
  mesh(root, plane(1.4, 1.1), M.view, -2.1, 1.65, ZB - 0.15, 0, 0, 0, false); const win = mesh(root, plane(1.4, 1.1), M.viewEve, -2.1, 1.65, ZB - 0.14, 0, 0, 0, false); win.visible = false;
  K.box(M.paint, -2.85, -1.35, 1.06, 1.1, ZB, ZB + 0.12, 0xf6f0e4, 0.01); for (const [x0, x1, y0, y1] of [[-2.85, -1.35, 2.2, 2.26], [-2.85, -2.8, 1.1, 2.2], [-1.4, -1.35, 1.1, 2.2], [-2.12, -2.08, 1.1, 2.2]]) K.box(M.paint, x0, x1, y0, y1, ZB, ZB + 0.06, 0xf6f0e4, 0.005);
  mesh(root, plane(1.6, 1.6), M.paint, -2.1, 1.65, ZB - 0.3, 0, 0, 0, false); // dark backing
  for (const s of [-1, 1]) K.box(M.paint, -2.1 + s * 0.85 - 0.15, -2.1 + s * 0.85 + 0.15, 0.9, 2.4, ZB + 0.08, ZB + 0.16, 0xe8705a, 0.05);
  // atomic sofa (back right) + cushions
  K.at(1.0, 0, -2.55, 0, () => { K.box(M.paint, -1.1, 1.1, 0.3, 0.55, -0.35, 0.35, 0x3ab0b8, 0.08); K.box(M.paint, -1.1, 1.1, 0.55, 1.0, -0.38, -0.18, 0x3ab0b8, 0.08); for (const s of [-1, 1]) K.box(M.paint, s * 1.1 - 0.12, s * 1.1 + 0.12, 0.3, 0.72, -0.36, 0.36, 0x2a9aa2, 0.06);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.beam(M.wood, [sx * 0.95, 0.3, sz * 0.25], [sx * 1.05, 0, sz * 0.3], 0.025, 0x3a2a1e, true, 5);
    for (const x of [-0.6, 0.6]) K.cb(M.paint, 0.38, 0.32, 0.12, x, 0.72, -0.12, x < 0 ? 0xf6c040 : 0xf07a6a, -0.2, 0, x < 0 ? 0.1 : -0.1, 0.05); });
  // starburst clock
  nond(mesh(root, plane(0.8, 0.8), M.clock, 1.0, 2.05, ZB + 0.04, 0, 0, 0, false));
  // TV console (right wall-ish) + floor lamp (left)
  K.at(3.0, 0, -1.0, -Math.PI / 2, () => { K.box(M.wood, -0.45, 0.45, 0.2, 0.95, -0.25, 0.25, 0x7a4a2a, 0.04); K.box(M.paint, -0.34, 0.2, 0.36, 0.82, 0.25, 0.27, 0x3a4a48, 0.04); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.beam(M.wood, [sx * 0.38, 0.2, sz * 0.18], [sx * 0.42, 0, sz * 0.2], 0.02, 0x3a2a1e, true, 5);
    K.put(M.brass, cyl(0.03, 0.03, 0.02, 10), 0.3, 0.75, 0.27, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8c070); for (const s of [-1, 1]) K.beam(M.metal, [0, 0.96, 0], [s * 0.3, 1.45, -0.05], 0.008, 0x9a9aa8, true, 4); });
  K.at(-0.6, 0, -2.6, 0, () => { K.put(M.brass, cyl(0.15, 0.18, 0.04, 16), 0, 0.02, 0, 0, 0, 0, 1, 1, 1, 0x2a2a30); K.beam(M.brass, [0, 0, 0], [0, 1.5, 0], 0.015, 0xd8b048, true, 6); K.put(M.paint, lathe('flamp', [[0.08, 0.3], [0.2, 0.0], [0.22, -0.02]], 16), 0, 1.45, 0, 0, 0, 0, 1, 1, 1, 0xf6e8c0); });
  // kidney coffee table + rug + bowl
  mesh(root, plane(2.6, 1.6), M.rugL, 0.6, 0.006, -1.0, -Math.PI / 2, 0, 0, false);
  K.at(0.8, 0, -1.3, 0, () => { K.put(M.paint, cyl(0.42, 0.42, 0.04, 24), 0, 0.4, 0, 0, 0, 0, 1.5, 1, 0.9, 0xf2e6c8); for (const a of [0.5, 2.6, 4.4]) K.beam(M.wood, [Math.cos(a) * 0.4, 0.4, Math.sin(a) * 0.25], [Math.cos(a) * 0.5, 0, Math.sin(a) * 0.32], 0.02, 0x3a2a1e, true, 5); K.put(M.paint, sph(0.12, 14, 8), 0.1, 0.44, 0, 0, 0, 0, 1, 0.4, 1, 0xe8705a); });
  // leaning roll of the wallpaper
  K.put(M.wallpaper, cyl(0.12, 0.12, 0.9, 16), -1.2, 0.46, -2.85, 0.2, 0, 0.15, 1, 1, 1, 0xffffff);
  const lamp = lampAt(root, K, 0.6, -1.0, HT, 0xf07a6a, 2.35);
  K.build(root, 3);
  const glows = [glowAt(root, [-0.6, 1.55, -2.5], 0.8, '#ffd090', 0.4), glowAt(root, [0.6, 2.25, -0.95], 0.7, '#ffc070', 0.4)];
  const dust = motes(root, 30, [-2, 2, 0.4, 2.6, -2.6, 0.6], 58, 0.008);
  return { win, glows, dust }; }

// ================================================================= GREENHOUSE
function buildGreen(root) { const K = new Kit(), R = PT.rng(58), GW = 2.6, GZ0 = -4.5, GZ1 = 3.0, HW = 2.4, HR = 3.4;
  const gg = new THREE.PlaneGeometry(160, 160, 40, 40); gg.rotateX(-Math.PI / 2); const gm = H.M.vc({ map: H.mkTex(512, 512, (g, w, h) => PT.grass ? PT.grass(g, w, h, {}) : (g.fillStyle = '#6aa84a', g.fillRect(0, 0, w, h)), [30, 30]) }); const gr = mesh(root, gg, gm, 0, 0, 0, 0, 0, 0, false); gr.receiveShadow = true;
  mesh(root, planeUV(2 * GW, GZ1 - GZ0, 2, 3), M.floorL, 0, 0.02, (GZ0 + GZ1) / 2, -Math.PI / 2, 0, 0, false);
  // frame: arches along z
  for (let i = 0; i <= 5; i++) { const z = GZ0 + i * (GZ1 - GZ0) / 5; for (const s of [-1, 1]) { K.beam(M.paint, [s * GW, 0, z], [s * GW, HW, z], 0.05, 0xf4f4f0, false); K.beam(M.paint, [s * GW, HW, z], [0, HR, z], 0.05, 0xf4f4f0, false); } }
  for (const s of [-1, 1]) for (const y of [0.9, HW]) K.beam(M.paint, [s * GW, y, GZ0], [s * GW, y, GZ1], 0.04, 0xf4f4f0, false); K.beam(M.paint, [0, HR, GZ0], [0, HR, GZ1], 0.05, 0xf4f4f0, false);
  // bubble panels (walls + roof + back gable)
  const panels = []; const L = GZ1 - GZ0, zc = (GZ0 + GZ1) / 2;
  for (const s of [-1, 1]) { panels.push(nond(mesh(root, plane(L, HW), M.bwPanel, s * GW, HW / 2, zc, 0, Math.PI / 2, 0, false))); const rw = Math.hypot(GW, HR - HW); const rp = nond(mesh(root, plane(L, rw), M.bwPanel, s * GW / 2, (HW + HR) / 2, zc, 0, 0, 0, false)); const u = new THREE.Vector3(0, 0, 1), v = new THREE.Vector3(-s * GW, HR - HW, 0).normalize(), n = new THREE.Vector3().crossVectors(u, v); rp.setRotationFromMatrix(new THREE.Matrix4().makeBasis(u, v, n)); panels.push(rp); }
  panels.push(nond(mesh(root, plane(2 * GW, HW), M.bwPanel, 0, HW / 2, GZ0, 0, 0, 0, false))); panels.forEach((p) => (p.renderOrder = 4));
  // seed tables both sides with pots
  const pots = []; for (const s of [-1, 1]) { K.box(M.wood, s * GW - (s > 0 ? 0.9 : 0), s * GW + (s < 0 ? 0.9 : 0), 0.78, 0.84, GZ0 + 0.3, GZ1 - 0.6, 0x9a6a3a, 0.01);
    for (let k = 0; k < 7; k++) K.box(M.wood, s * (GW - 0.45) - 0.04, s * (GW - 0.45) + 0.04, 0, 0.78, GZ0 + 0.5 + k * 1.0 - 0.04, GZ0 + 0.5 + k * 1.0 + 0.04, 0x7a4a2a, 0.01);
    for (let k = 0; k < 9; k++) { const p = plantAt(K, s * (GW - 0.45) + (R() - 0.5) * 0.3, 0.84, GZ0 + 0.6 + k * 0.78, 0.9 + R() * 0.5, [0xc8683a, 0xb85a30, 0xd88050][k % 3]); root.add(p); pots.push(p); } }
  // thermometer post + watering can + sacks, outside: fence, trees, shed
  K.box(M.wood, -1.26, -1.14, 0, 1.6, GZ0 + 0.4, GZ0 + 0.5, 0x8a6a48, 0.01); const therm = new THREE.Group(); therm.position.set(-1.2, 1.25, GZ0 + 0.52); root.add(therm);
  mesh(therm, plane(0.16, 0.6), H.toon({ color: 0xf8f4ea }), 0, 0, 0, 0, 0, 0, false); const merc = mesh(therm, plane(0.04, 0.5), H.M.basic(null, 1), 0, -0.02, 0.005, 0, 0, 0, false); merc.material = new THREE.MeshBasicMaterial({ color: 0xe8302a }); mesh(therm, sph(0.04, 10, 8), merc.material, 0, -0.27, 0.01, 0, 0, 0, false);
  for (let i = 0; i < 26; i++) { const a = R() * TAU, d = 9 + R() * 25, x = Math.cos(a) * d, z = Math.sin(a) * d - 6; if (z > -11 && Math.abs(x) < 7) continue; const t = 2 + R() * 3; K.beam(M.wood, [x, 0, z], [x, t * 0.5, z], 0.12, 0x6a4a30, true, 6); K.put(M.paint, lumpGeo(i, 1, 0.2), x, t * 0.62, z, 0, R() * 3, 0, 1.4 + R(), 1.2 + R() * 0.6, 1.4 + R(), [0x4a9a4a, 0x3a8a44, 0x5aa85a][i % 3]); }
  for (let i = 0; i < 24; i++) { const x = -12 + i, z = -10; K.box(M.wood, x - 0.04, x + 0.04, 0, 1.0, z - 0.04, z + 0.04, 0xf4f0e8, 0.01); } K.box(M.wood, -12, 12, 0.7, 0.76, -10.04, -9.96, 0xf4f0e8, 0.01);
  K.at(-6, 0, -7, 0.3, () => { K.box(M.wood, -1.2, 1.2, 0, 2.0, -1, 1, 0xc8503a, 0.04); K.put(M.paint, new THREE.ConeGeometry(1.8, 1.0, 4), 0, 2.5, 0, 0, Math.PI / 4, 0, 1, 1, 0.8, 0x6a4a3a); });
  K.build(root, 3);
  const dust = motes(root, 40, [-2, 2, 0.4, 2.6, -3.6, 1.0], 59, 0.008);
  return { panels, pots, merc, glows: [], dust }; }

// ================================================================= FACTORY (1960)
function buildFactory(root) { const HT = 4.2, R = PT.rng(1960); const K = room(root, { floor: M.concrete, wall: M.brick, side: M.brick, HT, ceil: 0x8a8a90, trim: 0x5a5a60, fu: 2, fv: 2 });
  mesh(root, plane(4.2, 1.05), M.saSign, 0, 3.35, ZB + 0.05, 0, 0, 0, false); mesh(root, plane(0.32, 0.4), M.cal60, -2.9, 1.9, ZB + 0.03, 0, 0, 0, false);
  for (const x of [-2.4, 2.4]) { mesh(root, plane(1.2, 0.9), M.view, x, 3.35, ZB - 0.05, 0, 0, 0, false); K.box(M.metal, x - 0.64, x + 0.64, 2.86, 2.9, ZB, ZB + 0.08, 0x3a3a42, 0.005); K.box(M.metal, x - 0.02, x + 0.02, 2.9, 3.8, ZB, ZB + 0.06, 0x3a3a42, 0.005); }
  // machine: two film drums -> rollers with heater -> conveyor toward camera -> winder
  const MZ = -2.2; K.at(0, 0, MZ, 0, () => { K.box(M.paint, -0.9, 0.9, 0, 1.0, -0.5, 0.5, 0x3a6a9a, 0.06); K.box(M.paint, -0.95, 0.95, 1.0, 1.06, -0.55, 0.55, 0x2a4a6a, 0.02);
    for (const [y, z] of [[1.7, -0.35], [1.35, -0.55]]) K.put(M.bwSolid, cyl(0.24, 0.24, 1.5, 22), 0, y, z, 0, 0, Math.PI / 2, 1, 1, 1, 0xffffff);
    for (const sx of [-0.88, 0.88]) K.box(M.paint, sx - 0.05, sx + 0.05, 1.0, 1.95, -0.7, -0.2, 0x2a4a6a, 0.02);
    for (const z of [0.15, 0.32]) K.put(M.chrome, cyl(0.1, 0.1, 1.6, 18), 0, 1.15, z, 0, 0, Math.PI / 2, 1, 1, 1, 0xd8dce4);
    K.box(M.paint, -0.8, 0.8, 1.3, 1.55, 0.05, 0.45, 0xe8b830, 0.04); for (let i = 0; i < 3; i++) K.put(M.paint, cyl(0.06, 0.06, 0.03, 14), -0.5 + i * 0.25, 0.7, 0.51, Math.PI / 2, 0, 0, 1, 1, 1, 0xf2ead6); });
  K.box(M.metal, -0.75, 0.75, 0.8, 0.86, MZ + 0.5, MZ + 1.6, 0x4a4a52, 0.01); for (const z of [0.7, 1.4]) for (const sx of [-0.7, 0.7]) K.box(M.metal, sx - 0.04, sx + 0.04, 0, 0.8, MZ + z - 0.04, MZ + z + 0.04, 0x3a3a42, 0.005);
  const sheet = bubbleSheet(root, 1.3, 1.05, 0.024); sheet.position.set(0, 0.87, MZ + 1.05);
  const winder = new THREE.Group(); winder.position.set(0, 1.0, MZ + 1.78); root.add(winder); mesh(winder, cyl(0.26, 0.26, 1.4, 22), M.bwSolid, 0, 0, 0, 0, 0, Math.PI / 2, true);
  for (const sx of [-0.78, 0.78]) K.box(M.paint, sx - 0.05, sx + 0.05, 0, 1.1, MZ + 1.62, MZ + 1.92, 0x2a4a6a, 0.02);
  const heat = nond(mesh(root, plane(1.5, 0.05), M.heat, 0, 1.28, MZ + 0.48, 0, 0, 0, false));
  // stacks of finished rolls (appear with rolls(n)), crates, hand truck, hanging lamps
  const rolls = []; for (let i = 0; i < 14; i++) { const side = i % 2 ? 1 : -1, col = Math.floor(i / 2), x = side * (1.6 + (col % 3) * 0.55), z = -2.5 + Math.floor(col / 3) * 0.7 + 0.2, y = 0.6; const r = mesh(root, cyl(0.24, 0.24, 1.2, 20), M.bwSolid, x, y, z, 0, 0, 0, true); r.visible = false; rolls.push(r); }
  for (const [x, z] of [[-2.9, 0.6], [2.9, 0.4]]) K.at(x, 0, z, 0.2, () => { K.box(M.crate, -0.35, 0.35, 0, 0.6, -0.35, 0.35, 0xffffff, 0.02); K.box(M.crate, -0.3, 0.3, 0.6, 1.1, -0.3, 0.3, 0xffffff, 0.02); });
  const lamps = []; for (const x of [-1.6, 1.6]) lamps.push(lampAt(root, K, x, -1.2, HT, 0x3a5a3a, 3.2));
  K.build(root, 3);
  const glows = [...lamps.map((l) => glowAt(root, [l.position.x, l.position.y, l.position.z + 0.05], 1.0, '#ffc070', 0.5))]; const shafts = [-2.4, 2.4].map((x) => shaftAt(root, [x * 0.7, 2.2, ZB + 1.4], 1.4, 3.6, 0.0, 0.25, 0.16, 0xffe0b0));
  const dust = motes(root, 60, [-2.6, 2.6, 0.4, 3.6, -3, 0.6], 60, 0.01);
  return { sheet, winder, heat, rolls, glows, dust }; }

// ================================================================= COMPUTER ROOM (1959)
function buildComputer(root) { const HT = 3.1, R = PT.rng(1401);
  const fl = H.M.vc({ map: H.mkTex(256, 256, (g, w, h) => { g.fillStyle = '#e8e6e0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b8b4ac'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); } }, [4, 4]) });
  const wallC = H.M.vc({ map: H.mkTex(256, 256, (g, w, h) => { g.fillStyle = '#b8d0e0'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.94 + 0.08 * PT.fbm(u, v, 4, 4, 3, 5)); }) });
  const K = room(root, { floor: fl, wall: wallC, HT, ceil: 0xf0f0f4, trim: 0x6a7a8a });
  mesh(root, plane(3.6, 0.9), M.bccSign, 0.3, 2.6, ZB + 0.03, 0, 0, 0, false); mesh(root, plane(0.32, 0.4), M.cal59, -3.0, 1.9, ZB + 0.03, 0, 0, 0, false);
  for (let i = 0; i < 3; i++) K.box(M.paint, -1.6 + i * 1.3, -1.0 + i * 1.3, HT - 0.02, HT, -2.6, 1.6, 0xfff8e8, 0.005);
  const lights = [], m4 = new THREE.Matrix4();
  const unit = (x, z, w, h, d, face, col, ry = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); const k = new Kit(); k.box(M.paint, -w / 2, w / 2, 0.04, h, -d / 2, d / 2, col, 0.03); k.box(M.paint, -w / 2 - 0.01, w / 2 + 0.01, 0, 0.06, -d / 2 - 0.01, d / 2 + 0.01, 0x2a3040, 0.01); k.build(g);
    if (face) mesh(g, plane(w * 0.9, h * 0.8), face, 0, h * 0.52, d / 2 + 0.005, 0, 0, 0, false); return g; };
  // tape drives along the back, processor centre, console front-left, printer right
  const tapes = [-2.6, -1.85, 2.0, 2.75].map((x) => unit(x, -2.75, 0.68, 1.85, 0.6, M.tape, 0x9aa8b6));
  const cpu = unit(0.15, -1.9, 1.5, 1.55, 0.8, M.panel, 0x8a9cb0);
  const console_ = new THREE.Group(); console_.position.set(-1.7, 0, -0.9); console_.rotation.y = 0.35; root.add(console_); { const k = new Kit(); k.box(M.paint, -0.6, 0.6, 0, 0.74, -0.35, 0.35, 0x8a9cb0, 0.03); k.cb(M.paint, 1.2, 0.36, 0.1, 0, 0.92, -0.2, 0x9aaabc, -0.35, 0, 0, 0.02); k.box(M.paint, -0.55, 0.55, 0.74, 0.78, -0.3, 0.3, 0x2a3040, 0.01); k.build(console_); }
  const ims = []; for (const [grp, ox, oy, oz, nx, ny, sx, sy, rx] of [[cpu, -0.55, 0.9, 0.41, 12, 4, 0.1, 0.09, 0], [console_, -0.45, 0.85, -0.13, 10, 3, 0.1, 0.07, -0.35]]) { for (let c = 0; c < 3; c++) { const im = new THREE.InstancedMesh(sph(0.018, 6, 5), M.blink[c], nx * ny); im.castShadow = false; let k = 0; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { m4.makeTranslation(ox + i * sx, oy + j * sy * Math.cos(rx), oz + j * sy * Math.sin(-rx)); im.setMatrixAt(k++, m4); } nond(im); grp.add(im); ims.push({ im, c, n: k, seed: c * 7 + ox * 3 }); } }
  const printer = unit(2.3, -1.2, 0.9, 1.0, 0.7, null, 0x9aaabc, -0.4); { const k = new Kit(); k.cb(M.paint, 0.7, 0.04, 0.4, 0, 1.05, 0, 0xf8f4ea, 0.3, 0, 0, 0.01); for (let i = 0; i < 6; i++) k.cb(M.paint, 0.6, 0.004, 0.3, 0, 0.06 + i * 0.012, 0.55, 0xf8f4ea, 0, 0, 0, 0.002); k.build(printer); }
  // bubble wrap around the processor (wrap(t): grows from the floor up), shipping crate (crate(t)) on a dolly at right front
  const wrapG = new THREE.Group(); wrapG.position.set(0.15, 0, -1.9); root.add(wrapG); const wrapM = mesh(wrapG, new THREE.BoxGeometry(1.62, 1.66, 0.92), M.bwSolid, 0, 0.83, 0, 0, 0, 0, true); wrapM.geometry.translate(0, 0, 0);
  const wrapIn = new THREE.Group(); wrapG.add(wrapIn); wrapM.position.y = 0; wrapM.geometry.translate(0, 0.83, 0); wrapG.scale.set(1, 0.001, 1); wrapG.visible = false;
  const crate = new THREE.Group(); crate.position.set(1.6, 0, 0.4); crate.rotation.y = -0.3; root.add(crate); const cboards = [];
  { const k = new Kit(); k.box(M.metal, -0.75, 0.75, 0.0, 0.12, -0.55, 0.55, 0x3a5a8a, 0.02); for (const sx of [-0.6, 0.6]) for (const sz of [-0.4, 0.4]) k.put(M.paint, cyl(0.06, 0.06, 0.05, 10), sx, 0.06, sz, Math.PI / 2, 0, 0, 1, 1, 1, 0x1a1a20); k.build(crate); }
  const inner = unit(0, 0, 1.1, 1.3, 0.8, M.panel, 0x8a9cb0); root.remove(inner); inner.position.set(0, 0.12, 0); crate.add(inner); const innerWrap = mesh(crate, new THREE.BoxGeometry(1.18, 1.36, 0.88), M.bwSolid, 0, 0.12 + 0.68, 0, 0, 0, 0, true); innerWrap.visible = false;
  for (const [w, h, d, x, y, z, ry] of [[1.3, 1.5, 0.05, 0, 0.87, 0.5, 0], [1.3, 1.5, 0.05, 0, 0.87, -0.5, 0], [1.0, 1.5, 0.05, 0.65, 0.87, 0, Math.PI / 2], [1.0, 1.5, 0.05, -0.65, 0.87, 0, Math.PI / 2], [1.3, 1.0, 0.05, 0, 1.64, 0, 0]]) { const b = mesh(crate, new THREE.BoxGeometry(w, h, d), M.crate, x, y, z, y > 1.6 ? Math.PI / 2 : 0, ry, 0, true); b.visible = false; cboards.push(b); }
  const lamps = [];
  K.build(root, 3);
  const glows = [glowAt(root, [0.15, 1.25, -1.45], 1.2, '#9ad0ff', 0.25)];
  const dust = motes(root, 30, [-2.4, 2.4, 0.4, 2.8, -2.8, 0.8], 61, 0.008);
  return { ims, wrapG, crate, cboards, innerWrap, glows, dust, cpu, tapes }; }

// ================================================================= MODERN KID ROOM (today)
function buildModern(root) { const HT = 2.8; const wallM = H.M.vc({ map: H.mkTex(256, 256, (g, w, h) => { g.fillStyle = '#ffd8c8'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.95 + 0.06 * PT.fbm(u, v, 4, 4, 3, 8)); }) });
  const K = room(root, { floor: M.floorL, wall: wallM, HT, ceil: 0xfff6ee, trim: 0xffffff });
  // window with snow (back left), banner, calendar, posters
  mesh(root, plane(1.5, 1.2), M.viewSnow, -1.9, 1.55, ZB - 0.15, 0, 0, 0, false); mesh(root, plane(1.7, 1.4), M.paint, -1.9, 1.55, ZB - 0.3, 0, 0, 0, false);
  for (const [x0, x1, y0, y1] of [[-2.7, -1.1, 0.92, 0.98], [-2.7, -1.1, 2.12, 2.18], [-2.7, -2.64, 0.92, 2.18], [-1.16, -1.1, 0.92, 2.18], [-1.93, -1.87, 0.92, 2.18]]) K.box(M.paint, x0, x1, y0, y1, ZB, ZB + 0.08, 0xffffff, 0.005);
  mesh(root, plane(3.0, 0.94), M.banner, 0.55, 2.3, ZB + 0.04, 0, 0, 0, false); const cal = mesh(root, plane(0.56, 0.7), M.calJan, 1.6, 1.35, ZB + 0.03, 0, 0, 0, false);
  mesh(root, plane(0.5, 0.7), M.poster[0], 0.4, 1.35, ZB + 0.03, 0, 0, 0.05, false); mesh(root, plane(0.45, 0.62), M.poster[1], X - 0.02, 1.6, -1.6, 0, -Math.PI / 2, 0, false);
  // bed edge (right), beanbag (left), shelf with toys, balloons, string lights
  K.at(2.6, 0, -1.2, 0, () => { K.box(M.wood, -0.95, 0.95, 0, 0.42, -1.0, 1.0, 0xf6f0e8, 0.04); K.box(M.paint, -0.92, 0.92, 0.42, 0.6, -0.98, 0.98, 0x5a8ae8, 0.08); K.cb(M.paint, 0.6, 0.18, 0.4, 0, 0.7, -0.75, 0xffffff, 0, 0, 0, 0.08); });
  K.put(M.paint, lumpGeo(77, 2, 0.12), -2.6, 0.38, -0.6, 0, 0.3, 0, 0.62, 0.42, 0.6, 0xff7a6a);
  K.box(M.wood, 0.05, 1.05, 0.9, 0.94, ZB, ZB + 0.3, 0xf6f0e8, 0.01); for (let i = 0; i < 3; i++) K.put(M.paint, i % 2 ? sph(0.09, 12, 8) : cyl(0.07, 0.07, 0.2, 12), 0.2 + i * 0.24, 1.04, ZB + 0.15, 0, 0, 0, 1, 1, 1, [0xff5a7a, 0x5ac8f0, 0xffd040, 0x8ae07a][i]);
  const balloons = []; for (const [x, y, z, c] of [[-3.0, 1.9, -2.6, 0xff5a7a], [-2.7, 2.05, -2.8, 0x5ac8f0], [3.0, 1.9, -2.2, 0xffd040]]) { K.beam(M.paint, [x, y - 0.2, z], [x + 0.1, 0.9, z + 0.2], 0.004, 0xffffff, true, 3); balloons.push(mesh(root, sph(0.2, 18, 12), H.toon({ color: c, emissive: 0x201010 }), x, y, z, 0, 0, 0, true)); }
  const sl = []; for (let i = 0; i <= 20; i++) { const t = i / 20, x = -X + 0.2 + t * (2 * X - 0.4), y = HT - 0.15 - Math.sin(t * Math.PI) * 0.25; sl.push(mesh(root, sph(0.03, 8, 6), M.blink[i % 3], x, y, ZB + 0.1, 0, 0, 0, false)); }
  mesh(root, plane(3.0, 2.2), M.rugM, 0.0, 0.006, -0.6, -Math.PI / 2, 0, 0, false);
  // 3D bubble-wrap mat on the rug (popped(t) flattens bubbles in a wave)
  const mat = bubbleSheet(root, 1.8, 1.2, 0.03); mat.position.set(-0.1, 0.012, -0.2);
  const lamp = lampAt(root, K, 0.0, 1.0, HT, 0xff9ac0, 2.4);
  K.build(root, 3);
  const glows = [glowAt(root, [0.0, 2.32, 1.05], 0.8, '#ffd0a0', 0.4), ...sl.filter((_, i) => i % 2 === 0).map((b, i) => glowAt(root, [b.position.x, b.position.y, b.position.z + 0.02], 0.3, ['#ffd890', '#ff9ad8', '#9ad8ff'][i % 3], 0.5))];
  const dust = motes(root, 30, [-2, 2, 0.4, 2.6, -2.6, 0.6], 62, 0.008);
  return { mat, balloons, glows, dust }; }

// ================================================================= lights, grades, API
const IN = (o) => ({ top: '#000000', hor: '#3a2a1e', fog: '#3b2a1d', fogN: 10, fogF: 60, sky: '#ffe8c8', ground: '#6a4a32', hemiI: 1.0, fillCol: '#8a90c8', fillI: 0.3, sunCol: '#ffe0b0', sunI: 2.6, az: 150, el: 34, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0, ...o });
const SET_LIGHT = {
  garage: IN({ sunCol: '#ffe2b8', sunI: 2.4, az: 140, el: 30, ground: '#6a5040' }),
  living: IN({ sunCol: '#fff0d0', sunI: 2.8, az: -150, el: 30, ground: '#7a5a48', hemiI: 1.05, cardTint: '#fff4ea' }),
  livingNo: IN({ hor: '#1a1c28', fog: '#22242e', sky: '#9aa8d8', ground: '#3a3640', hemiI: 0.75, fillCol: '#5a68c8', sunCol: '#b8c4ec', sunI: 1.2, cardTint: '#e4e8f4', fxTint: '#eef0f6' }),
  green: { top: '#4a86d6', hor: '#c8e0f4', fog: '#d8e8f0', fogN: 30, fogF: 220, sky: '#a8c0f0', ground: '#5a6a48', hemiI: 0.75, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#fff0d0', sunI: 3.6, az: 30, el: 46, disc: '#fffbe8', discSize: 0.002, clouds: false, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0.3 },
  greenFlop: { top: '#5a6478', hor: '#a8b0bc', fog: '#9aa2b0', fogN: 20, fogF: 160, sky: '#9aa4b8', ground: '#4a4a50', hemiI: 0.85, fillCol: '#6a78b0', fillI: 0.3, sunCol: '#c8d0e0', sunI: 1.5, az: 30, el: 40, disc: '#000000', clouds: false, stars: 0, cardTint: '#e8ecf4', fxTint: '#eef0f6', shafts: 0 },
  factory: IN({ sunCol: '#ffe8c0', sunI: 2.6, az: 170, el: 40, hor: '#2a2a30', fog: '#2e2a2a', ground: '#5a4a44', shafts: 0.3 }),
  computer: IN({ sunCol: '#f0f4ff', sunI: 2.4, az: 160, el: 50, hor: '#202838', fog: '#283040', sky: '#d8e8ff', ground: '#5a6070', hemiI: 1.15, fillCol: '#8aa0d8', cardTint: '#f4f6ff' }),
  modern: IN({ sunCol: '#fff4e8', sunI: 3.0, az: -140, el: 28, sky: '#fff0f0', ground: '#8a6a60', hemiI: 1.15, cardTint: '#fff8f4' }),
};
const SET_GRADE = {
  garage: { look: 'office', over: { exp: 1.14, con: 1.24, sat: 1.06, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.42, 0.78], hal: [0.26, '#ff9a50'], vig: [0.32, 0.46, '#2a1420'] } },
  living: { look: 'office', over: { exp: 1.16, con: 1.22, sat: 1.12, lift: [0.03, 0.03, 0.045], tS: ['#3a2a6a', 0.14], tH: ['#ffd0a0', 0.08], bloom: [0.42, 0.8], hal: [0.2, '#ffa060'], vig: [0.28, 0.48, '#2a1430'] } },
  livingNo: { look: 'night', over: { exp: 1.04, con: 1.2, sat: 0.66, lift: [0.03, 0.035, 0.055], tS: ['#2a3a6a', 0.26], tH: ['#c8d4ec', 0.12], bloom: [0.45, 0.72], hal: [0.1, '#8090c0'], vig: [0.4, 0.42, '#141826'] } },
  green: { look: 'day', over: { exp: 1.05, con: 1.22, sat: 1.1, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c0', 0.06], bloom: [0.36, 0.86], vig: [0.24, 0.5, '#2a3a4a'] } },
  greenFlop: { look: 'night', over: { exp: 1.04, con: 1.18, sat: 0.6, lift: [0.03, 0.035, 0.05], tS: ['#2a3a6a', 0.24], tH: ['#c8d4ec', 0.12], bloom: [0.4, 0.75], vig: [0.38, 0.44, '#141826'] } },
  factory: { look: 'office', over: { exp: 1.14, con: 1.24, sat: 1.04, lift: [0.035, 0.022, 0.045], tS: ['#2a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.42, 0.78], hal: [0.24, '#ff9a50'], vig: [0.32, 0.46, '#1a1420'] } },
  computer: { look: 'office', over: { exp: 1.12, con: 1.22, sat: 1.0, lift: [0.03, 0.03, 0.05], tS: ['#2a3a7a', 0.18], tH: ['#e0f0ff', 0.08], bloom: [0.42, 0.78], hal: [0.2, '#80b0ff'], vig: [0.3, 0.46, '#141a30'] } },
  modern: { look: 'office', over: { exp: 1.16, con: 1.2, sat: 1.14, lift: [0.035, 0.03, 0.04], tS: ['#4a2a7a', 0.12], tH: ['#ffd8c0', 0.08], bloom: [0.42, 0.78], hal: [0.24, '#ff9ac0'], vig: [0.26, 0.5, '#2a1430'] } },
};

export function buildBW(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  let ga, lv, gr, fa, co, mo, MOOD = 'garage'; const ST = { seal: 1, droop: 0, rolls: 0, wrap: 0, crate: 0, crWrap: 0, popped: 0, heat: 0 };
  const API = makeAPI(ctx, { prefix: 'bw_', origin: BW_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { garage: 'office', living: 'office', livingNo: 'office', green: 'day', greenFlop: 'day', factory: 'office', computer: 'office', modern: 'office' },
    practicals: (name, F, W3) => { const fl = 1 + 0.06 * Math.sin(F * 0.7);
      if (name === 'garage') return [{ p: W3('garage', [0.3, 2.1, -0.6]), col: '#ffc880', I: 4.5 * fl, d: 6 }, { p: W3('garage', [0, 1.2, -1.0]), col: '#ff8a40', I: 2.5 * ST.heat, d: 3 }, { p: W3('garage', [0.5, 1.6, 2.0]), col: '#ffe8d0', I: 3, d: 6 }];
      if (name === 'living') return [{ p: W3('living', [-0.6, 1.5, -2.4]), col: '#ffd090', I: 3, d: 5 }, { p: W3('living', [0.6, 2.2, -0.9]), col: '#ffc880', I: 3.5, d: 6 }, { p: W3('living', [0.5, 1.6, 2.0]), col: '#ffeedd', I: 3, d: 6 }];
      if (name === 'livingNo') return [{ p: W3('living', [-0.6, 1.5, -2.4]), col: '#ffb860', I: 2.2 * fl, d: 4 }, { p: W3('living', [0, 2.0, 2.0]), col: '#8a98d8', I: 2.5, d: 7 }];
      if (name === 'factory') return [{ p: W3('factory', [-1.6, 3.0, -1.2]), col: '#ffc880', I: 6, d: 7 }, { p: W3('factory', [1.6, 3.0, -1.2]), col: '#ffc880', I: 6, d: 7 }, { p: W3('factory', [0, 1.3, -1.6]), col: '#ff8a40', I: 2.0, d: 3 }, { p: W3('factory', [0.4, 1.8, 2.2]), col: '#ffeedd', I: 3.5, d: 7 }];
      if (name === 'computer') return [{ p: W3('computer', [0, 2.8, -1.2]), col: '#e8f0ff', I: 5, d: 7 }, { p: W3('computer', [0.15, 1.2, -1.2]), col: '#9ad0ff', I: 1.6, d: 3 }, { p: W3('computer', [0.4, 1.8, 2.2]), col: '#fff0e0', I: 3.5, d: 7 }];
      if (name === 'modern') return [{ p: W3('modern', [0, 2.1, -0.8]), col: '#ffd0b0', I: 4, d: 6 }, { p: W3('modern', [0.4, 1.7, 2.2]), col: '#fff0e8', I: 3.5, d: 7 }, { p: W3('modern', [-1.9, 1.6, -2.4]), col: '#d8e8ff', I: 2.5, d: 5 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'garage' && ga) { tickMotes(ga.dust, f, 0.5); ga.lampR.material = Math.floor(f / 8) % 2 ? M.blink[1] : M.blink[0]; }
      if (cur === 'living' && lv) tickMotes(lv.dust, f, 0.4);
      if (cur === 'green' && gr) tickMotes(gr.dust, f, MOOD === 'greenFlop' ? 1.5 : 0.5);
      if (cur === 'factory' && fa) { tickMotes(fa.dust, f, 0.6); fa.winder.rotation.x = -T * 1.6; const im = fa.sheet.userData.im; }
      if (cur === 'computer' && co) { tickMotes(co.dust, f, 0.4); const m4 = new THREE.Matrix4(); for (const { im, c, n, seed } of co.ims) { const s0 = Math.floor(f / 5); for (let i = 0; i < n; i++) { im.getMatrixAt(i, m4); const e = m4.elements, on = Math.sin(i * 12.9 + seed * 3.1 + s0 * (1.3 + c * 0.7)) > 0.1; const k = on ? 1 : 0.001; m4.makeScale(k, k, k); m4.setPosition(e[12], e[13], e[14]); im.setMatrixAt(i, m4); } im.instanceMatrix.needsUpdate = true; } }
      if (cur === 'modern' && mo) { tickMotes(mo.dust, f, 0.4); mo.balloons.forEach((b, i) => (b.position.y = b.userData.y0 + 0.04 * Math.sin(T * 1.2 + i * 2))); } },
    mood: (name) => { MOOD = name; if (name === 'living' || name === 'livingNo') { lv.win.visible = name === 'livingNo'; lv.glows.forEach((g) => (g.material.opacity = g.userData.op * (name === 'livingNo' ? 0.4 : 1))); }
      if (name === 'green' || name === 'greenFlop') API.droop(name === 'greenFlop' ? Math.max(ST.droop, 0.0) : ST.droop); },
    apply: (v) => { for (const k of ['seal', 'droop', 'rolls', 'wrap', 'crate', 'popped', 'heat']) if (v[k] != null) API[k](v[k]); } });
  ga = buildGarage(API.groups.garage); lv = buildLiving(API.groups.living); gr = buildGreen(API.groups.green); fa = buildFactory(API.groups.factory); co = buildComputer(API.groups.computer); mo = buildModern(API.groups.modern);
  mo.balloons.forEach((b) => (b.userData.y0 = b.position.y));
  API.parts = { ga, lv, gr, fa, co, mo };
  // [BW-sets] state setters
  const sheetLen = (sh, t) => { const im = sh.userData.im, n = sh.userData.n; im.count = Math.max(0, Math.round(n * clamp01(t))); sh.userData.base.scale.y = Math.max(0.001, clamp01(t)); sh.userData.base.position.z = -0.9 * (1 - clamp01(t)); };
  API.seal = (t) => { ST.seal = t; const k = clamp01(t); ga.sheet.userData.im.count = Math.round(ga.sheet.userData.n * k); const b = ga.sheet.userData.base; b.scale.set(1, Math.max(0.001, k), 1); b.position.z = -0.9 * (1 - k); };
  API.heat = (t) => { ST.heat = t; ga.heat.material.color.setRGB(1.6 * (0.3 + 0.7 * t), 0.75 * (0.2 + 0.8 * t), 0.3 * t); ga.glows[1].material.opacity = 0.6 * t; };
  API.droop = (t) => { ST.droop = t; const k = clamp01(t); for (const p of gr.pots) p.children.forEach((lf, i) => { if (lf.isGroup) lf.rotation.x = 0.45 + 1.0 * k; }); M.plantG.color.set(0x4aa84a).lerp(new THREE.Color(0x9a8a4a), k); M.plantG2.color.set(0x3a9048).lerp(new THREE.Color(0x8a7a40), k); M.flower.color.set(0xff7a9a).lerp(new THREE.Color(0x8a6a6a), k);
    gr.merc.scale.y = 1 - 0.75 * k; gr.merc.position.y = -0.02 - 0.25 * 0.75 * k; M.bwPanel.color.set(0xffffff).lerp(new THREE.Color(0xe8f4ff), k); };
  API.rolls = (n) => { ST.rolls = n; fa.rolls.forEach((r, i) => { const k = clamp01(n - i); r.visible = k > 0; r.scale.set(1, Math.max(0.001, backOut(k)), 1); }); };
  API.wrap = (t) => { ST.wrap = t; const k = clamp01(t); co.wrapG.visible = k > 0.001; co.wrapG.scale.set(1, Math.max(0.001, k), 1); };
  API.crate = (t) => { ST.crate = t; const w = clamp01(t * 2), c = clamp01(t * 2 - 1) * co.cboards.length; co.innerWrap.visible = w > 0.01; co.innerWrap.scale.set(1, Math.max(0.001, w), 1); co.innerWrap.position.y = 0.12 + 0.68 * w;
    co.cboards.forEach((b, i) => { const k = clamp01(c - i); b.visible = k > 0; b.position.y = (i === 4 ? 1.64 : 0.87) + (1 - backOut(k)) * 0.8; }); };
  API.popped = (t) => { ST.popped = t; const im = mo.mat.userData.im, n = mo.mat.userData.n, m4 = new THREE.Matrix4(), cnt = Math.floor(n * clamp01(t)); for (let i = 0; i < n; i++) { im.getMatrixAt(i, m4); const e = m4.elements, x = e[12], y = e[13], z = e[14], pop = ((i * 7919) % n) < cnt; m4.makeScale(1, pop ? 0.12 : 0.55, 1); m4.setPosition(x, y, z); im.setMatrixAt(i, m4); } im.instanceMatrix.needsUpdate = true; };
  API.glows = { garage: ga.glows, living: lv.glows, green: gr.glows, factory: fa.glows, computer: co.glows, modern: mo.glows };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  const V = API.V;
  API.views = [
    V('garage', [0.9, 1.7, 2.6], [-0.1, 1.2, -2.0], 50, 1.4, [0, 1.0, -1.2], { seal: 0.7, heat: 1 }), // 0 garage wide
    V('garage', [0.5, 1.45, 0.3], [0, 0.95, -1.3], 46, 3, [0, 0.95, -1.2], { seal: 0.5, heat: 1 }), // 1 sealer close
    V('living', [0.3, 1.6, 2.8], [0.2, 1.5, -3.0], 52, 1.4, [0.4, 1.2, -1.6], {}), // 2 living wide
    V('livingNo', [0.3, 1.6, 2.8], [0.2, 1.5, -3.0], 52, 1.4, [0.4, 1.2, -1.6], {}), // 3 living evening
    V('green', [0.2, 1.6, 2.8], [0, 1.3, -4.0], 54, 1.2, [0, 1.0, -1.0], { droop: 0 }), // 4 greenhouse
    V('greenFlop', [0.2, 1.6, 2.8], [0, 1.3, -4.0], 54, 1.2, [0, 1.0, -1.0], { droop: 1 }), // 5 greenhouse flop
    V('factory', [1.0, 1.9, 3.0], [-0.2, 1.6, -3.0], 54, 1.4, [0, 1.0, -1.0], { rolls: 8 }), // 6 factory
    V('computer', [0.6, 1.7, 3.0], [0, 1.3, -3.0], 52, 1.4, [0.2, 1.0, -1.5], { wrap: 0.6, crate: 0.7 }), // 7 computer room
    V('modern', [0.3, 1.5, 2.8], [0.1, 1.3, -3.0], 52, 1.4, [0, 0.6, -0.4], { popped: 0.4 }), // 8 modern room
    V('computer', [1.9, 1.5, 2.8], [1.5, 0.9, 0.2], 46, 2, [1.6, 0.9, 0.4], { crate: 0.4 }), // 9 crate close
  ];
  API.era = () => {}; API.seal(1); API.heat(0); API.droop(0); API.rolls(0); API.wrap(0); API.crate(0); API.popped(0); API.tick(0);
  return API;
}
