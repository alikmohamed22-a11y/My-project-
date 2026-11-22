// pr_sets.js [PR-sets]: sets for "The man who designed the Pringles can is buried in one" (Oddverra short). NO real brand art: every
// chip tube carries the invented "STAX-A-LOT" label from pr_cast.js (generic flavours), no mascot, no logo, no real trade dress.
//   lab      : 1950s food-research lab: checker floor, sage wainscot, tall windows, a chalkboard with a saddle sketch, a long bench with a
//              fryer, flasks, a chip mould tray (identical saddle chips pop up), puffy chip bags + crumbs, a tube with a lowering chip stack,
//              a desk with a typewriter and a patent sheet. Moods 'labDay', 'labLate' (golden evening).             origin (-82000,0,0)
//   store    : a grocery (1968: pyramid of NEW! tubes, banner, checkout) / a 2008 drugstore at night (fluorescent chip aisle with four
//              generic flavours). Moods 'store68', 'store08'.                                                   origin (-82000,0,800)
//   home     : a family living room: armchair, sofa, fireplace with the tube proudly on the mantel, photos, lamp, 80s TV.
//              Moods 'home80' (warm evening), 'homeNight' (blue "You see", empty chair, lamp on).               origin (-82000,0,1600)
//   cemetery : a quiet lawn cemetery with a cut-away soil section under one headstone (the tube and an urn side by side), an oak,
//              hedges, rows of plain stones, hills. Moods 'cemNoon' (hook), 'cemGold' (sunset, payoff).        origin (-84500,0,0)
//   blueprint: a "math idea" void: navy grid floor/wall, a big grid saddle (z = x^2 - y^2) with axes, chips dropping onto a perfect
//              stack. Mood 'blue'.                                                                              origin (-84500,0,800)
// Each set: local frame, floor y = 0, camera side +z. Test flag ?prview=N (main.js).
import { H, TAU, sm, SERIF, SANS, cyl, sph, plane, planeUV, lathe, mesh, nond, lumpGeo, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';
import { tubeLabel, chipIcon, FLAV } from './pr_cast.js';

export const PR_ORIGIN = { lab: [-82000, 0, 0], store: [-82000, 0, 800], home: [-82000, 0, 1600], cem: [-84500, 0, 0], blue: [-84500, 0, 800] };
const GROUP_OF = { labDay: 'lab', labLate: 'lab', store68: 'store', store08: 'store', home80: 'home', homeNight: 'home', cemNoon: 'cem', cemGold: 'cem', blue: 'blue' };
let THREE, PT, M;
const CHIP_T = 0.0055; // nesting step of a chip stack (one chip's height in the stack)

// ---------------------------------------------------------------- geometry
// saddle chip (hyperbolic paraboloid y = k((x/a)^2 - (z/b)^2) over an elliptic disc), uv = planar x/z for grid / speckle maps
function saddleGeo(a, b, k, nr = 10, nt = 36) { const pos = [], uv = [], idx = [];
  for (let i = 0; i <= nr; i++) for (let j = 0; j <= nt; j++) { const r = i / nr, th = j / nt * TAU, x = a * r * Math.cos(th), z = b * r * Math.sin(th), y = k * ((x / a) ** 2 - (z / b) ** 2); pos.push(x, y, z); uv.push(0.5 + x / (2 * a), 0.5 + z / (2 * b)); }
  for (let i = 0; i < nr; i++) for (let j = 0; j < nt; j++) { const p = i * (nt + 1) + j, q = p + nt + 1; idx.push(p, q, p + 1, p + 1, q, q + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g; }
// rim of the saddle as a tube (glowing edge on the blueprint saddle)
function saddleRim(a, b, k, r) { const P = []; for (let j = 0; j <= 64; j++) { const th = j / 64 * TAU, x = a * Math.cos(th), z = b * Math.sin(th); P.push(new THREE.Vector3(x, k * ((x / a) ** 2 - (z / b) ** 2), z)); } return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P, true), 128, r, 8, true); }
// irregular broken chip shard
function shardGeo(seed) { const R = PT.rng(seed), n = 6, pts = []; for (let i = 0; i < n; i++) { const a = i / n * TAU + R() * 0.6, r = 0.6 + R() * 0.5; pts.push([Math.cos(a) * r, Math.sin(a) * r]); } const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); const g = new THREE.ShapeGeometry(s); g.rotateX(-Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, 0.12 * Math.sin(p.getX(i) * 2 + seed)); g.computeVertexNormals(); return g; }

// ---------------------------------------------------------------- painters
function chipTex(g, w, h) { g.fillStyle = '#f0c050'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.14 * PT.fbm(u, v, 5, 5, 3, 11)); const R = PT.rng(7); for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(${150 + R() * 40 | 0},${80 + R() * 30 | 0},30,${0.35 + R() * 0.3})`; g.beginPath(); g.arc(R() * w, R() * h, 1 + R() * 3, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(255,250,215,0.25)'; for (let i = 0; i < 20; i++) { g.beginPath(); g.ellipse(R() * w, R() * h, 4 + R() * 8, 2, R() * 3, 0, TAU); g.fill(); } }
function gridTex(bg, line, n = 16) { return (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = line; for (let i = 0; i <= n; i++) { g.lineWidth = i % 4 === 0 ? 4 : 1.6; g.beginPath(); g.moveTo(i * w / n, 0); g.lineTo(i * w / n, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / n); g.lineTo(w, i * h / n); g.stroke(); } }; }
function checkerTex(a, b, n = 8) { return (g, w, h) => { for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * w / n, j * h / n, w / n, h / n); } PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, 5)); grain(g, w, h, 'rgba(90,70,60,1)', 300, 3, 0.15); }; }
function plainTex(col, k = 0.1) { return (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 1 - k / 2 + k * PT.fbm(u, v, 4, 4, 3, 5)); }; }
function chalkTex(g, w, h) { g.fillStyle = '#26362e'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.85 + 0.25 * PT.fbm(u, v, 3, 3, 3, 4)); g.strokeStyle = 'rgba(240,240,230,0.85)'; g.lineWidth = 5; g.lineCap = 'round';
  // saddle sketch with grid lines
  const cx = w * 0.32, cy = h * 0.48, A = w * 0.2, B = h * 0.16; for (let i = -3; i <= 3; i++) { g.beginPath(); for (let j = -10; j <= 10; j++) { const x = i / 3, z = j / 10; const y = 0.5 * (x * x - z * z); const px = cx + (x * 0.8 + z * 0.5) * A, py = cy - y * B * 1.6 + (z * 0.5 - x * 0.2) * B; j === -10 ? g.moveTo(px, py) : g.lineTo(px, py); } g.stroke(); }
  for (let j = -3; j <= 3; j++) { g.beginPath(); for (let i = -10; i <= 10; i++) { const x = i / 10, z = j / 3; const y = 0.5 * (x * x - z * z); const px = cx + (x * 0.8 + z * 0.5) * A, py = cy - y * B * 1.6 + (z * 0.5 - x * 0.2) * B; i === -10 ? g.moveTo(px, py) : g.lineTo(px, py); } g.stroke(); }
  txt(g, 'z = x² − y²', w * 0.74, h * 0.3, w * 0.4, h * 0.14, { col: '#f4f0e0', font: SERIF, italic: true });
  txt(g, 'SAME SHAPE', w * 0.74, h * 0.56, w * 0.42, h * 0.11, { col: '#ffe080', font: SANS }); txt(g, '= STACKS!', w * 0.74, h * 0.74, w * 0.36, h * 0.11, { col: '#ffe080', font: SANS });
  g.strokeStyle = 'rgba(240,240,230,0.6)'; g.lineWidth = 3; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(w * 0.1 + i * 7, h * 0.88 - i * 9, 26, 8, 0, Math.PI, TAU); g.stroke(); } }
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); if (!o.flat) PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 6, 2, 3, 7)); g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08);
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : 0.34 + i * 0.36), w * 0.86, h * (lines.length === 1 ? 0.52 : 0.3), { col: o.col || '#3a2414', font: o.font || SANS })); }; }
function windowTex(o) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, o.a); gr.addColorStop(1, o.b); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = o.c; for (let i = 0; i < 9; i++) { const x = i * w / 8 - 20, bh = h * (0.16 + 0.2 * ((i * 37) % 7) / 7); g.fillRect(x, h - bh, w / 9, bh); if (o.lit) { g.fillStyle = o.lit; for (let k = 0; k < 6; k++) g.fillRect(x + 6 + (k % 2) * 16, h - bh + 8 + Math.floor(k / 2) * 18, 8, 8); g.fillStyle = o.c; } }
  if (o.moon) { g.fillStyle = '#f4f0d8'; g.beginPath(); g.arc(w * 0.75, h * 0.22, h * 0.07, 0, TAU); g.fill(); } }; }
function patentTex(g, w, h) { g.fillStyle = '#f6f0de'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 5)); txt(g, 'PATENT APPLICATION', w / 2, h * 0.08, w * 0.86, h * 0.06, { col: '#2a2a3a', font: SERIF });
  g.strokeStyle = '#2a2a3a'; g.lineWidth = 3; g.strokeRect(w * 0.3, h * 0.16, w * 0.4, h * 0.44); for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(w / 2, h * 0.24 + i * h * 0.05, w * 0.16, h * 0.012, 0, Math.PI, TAU); g.stroke(); }
  g.fillStyle = 'rgba(50,40,60,0.55)'; for (let i = 0; i < 9; i++) g.fillRect(w * 0.1, h * (0.66 + i * 0.03), i % 4 === 3 ? w * 0.5 : w * 0.8, h * 0.012); txt(g, 'CONTAINER FOR CHIPS', w / 2, h * 0.62, w * 0.7, h * 0.035, { col: '#2a2a3a', font: SANS }); }
function bagTex(g, w, h) { g.fillStyle = '#3a7ad8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2; i++) { const cx = w * (0.25 + i * 0.5); g.fillStyle = '#f2d040'; g.beginPath(); g.ellipse(cx, h * 0.5, w * 0.16, h * 0.2, -0.15, 0, TAU); g.fill(); txt(g, 'CHIPS', cx, h * 0.5, w * 0.24, h * 0.13, { col: '#c8302a', font: SANS }); } g.fillStyle = 'rgba(255,255,255,0.25)'; for (let i = 0; i < 9; i++) g.fillRect(i * w / 9, 0, 3, h); g.fillStyle = '#c8d8f0'; g.fillRect(0, 0, w, h * 0.08); g.fillRect(0, h * 0.92, w, h * 0.08); }
function stoneTex(g, w, h) { g.fillStyle = '#9a9aa2'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.82 + 0.3 * PT.fbm(u, v, 6, 6, 4, 3)); grain(g, w, h, 'rgba(40,40,50,1)', 900, 6, 0.3); }
function headTex(g, w, h) { stoneTex(g, w, h); const o = { col: '#3a3a46', font: SERIF, shadow: 'rgba(255,255,255,0.35)' }; txt(g, 'FREDRIC J.', w / 2, h * 0.3, w * 0.8, h * 0.13, o); txt(g, 'BAUR', w / 2, h * 0.47, w * 0.6, h * 0.17, o); txt(g, '1918 – 2008', w / 2, h * 0.68, w * 0.6, h * 0.1, o);
  g.strokeStyle = '#4a4a56'; g.lineWidth = 3; g.beginPath(); g.moveTo(w * 0.3, h * 0.82); g.lineTo(w * 0.7, h * 0.82); g.stroke(); }
function soilTex(g, w, h) { const L = [['#6a4a30', 0], ['#5a3c26', 0.12], ['#4a3020', 0.4], ['#3e2a1e', 0.7]]; L.forEach(([c, y], i) => { g.fillStyle = c; g.fillRect(0, h * y, w, h); }); PT.modulate(g, w, h, (u, v) => 0.85 + 0.25 * PT.fbm(u, v, 8, 3, 4, 13)); const R = PT.rng(31);
  for (let i = 0; i < 90; i++) { g.fillStyle = ['#8a7a6a', '#6a5a4c', '#a09080'][i % 3]; g.beginPath(); g.ellipse(R() * w, h * (0.15 + R() * 0.85), 3 + R() * 9, 2 + R() * 6, R() * 3, 0, TAU); g.fill(); }
  g.strokeStyle = 'rgba(150,110,70,0.7)'; g.lineWidth = 3; for (let i = 0; i < 14; i++) { let x = R() * w, y = 0; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (R() - 0.5) * 30; y += 10 + R() * 18; g.lineTo(x, y); } g.stroke(); } g.fillStyle = '#4a7a2a'; g.fillRect(0, 0, w, h * 0.025); }
function grassTex(g, w, h) { g.fillStyle = '#5a9a3a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.82 + 0.3 * PT.fbm(u, v, 6, 6, 4, 17)); grain(g, w, h, 'rgba(40,80,20,1)', 1500, 8, 0.35); grain(g, w, h, 'rgba(170,210,90,1)', 700, 9, 0.3); }
function hillsTex(g, w, h) { g.clearRect(0, 0, w, h); for (const [y0, c, a] of [[0.45, '#8a9ac0', 0.05], [0.58, '#6a8a8a', 0.07], [0.72, '#4a7048', 0.1]]) { g.fillStyle = c; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * y0 + Math.sin(x * 0.011 + y0 * 9) * h * a + Math.sin(x * 0.029 + y0) * h * a * 0.4); g.lineTo(w, h); g.fill(); } }
function boxTex(word, bg, band) { return (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = band; g.fillRect(0, h * 0.3, w, h * 0.34); txt(g, word, w / 2, h * 0.47, w * 0.84, h * 0.22, { col: '#fff', font: SANS }); PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 5)); }; }
function photoTex(kind) { return (g, w, h) => { g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h); g.fillStyle = kind ? '#8ab0d8' : '#c8a878'; g.fillRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84); g.fillStyle = '#5a3a2a';
  const n = kind ? 3 : 1; for (let i = 0; i < n; i++) { const cx = w * (n === 1 ? 0.5 : 0.28 + i * 0.22); g.beginPath(); g.arc(cx, h * 0.45, w * 0.1, 0, TAU); g.fill(); g.fillRect(cx - w * 0.12, h * 0.56, w * 0.24, h * 0.36); } if (!kind) { g.fillStyle = '#f2f0ea'; g.fillRect(w * 0.38, h * 0.58, w * 0.24, h * 0.34); g.fillStyle = '#d0d0d6'; g.beginPath(); g.arc(w * 0.5, h * 0.4, w * 0.1, Math.PI, TAU); g.fill(); } }; }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.chip = toon({ map: T(256, 256, chipTex), side: THREE.DoubleSide, emissive: 0x140a04 }); m.chip.emissiveMap = m.chip.map;
  m.chipBlue = toon({ map: T(512, 512, gridTex('#2a5ab8', 'rgba(200,240,255,0.95)', 12)), side: THREE.DoubleSide, emissive: 0x2a5ab8 }); m.chipBlue.emissiveMap = m.chipBlue.map;
  m.rimGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x9ae8ff).multiplyScalar(1.6), fog: false });
  m.gridFloor = new THREE.MeshBasicMaterial({ map: T(512, 512, gridTex('#0e1a3e', 'rgba(110,170,255,0.55)', 8)), fog: true }); m.gridFloor.map.wrapS = m.gridFloor.map.wrapT = THREE.RepeatWrapping;
  m.gridWall = new THREE.MeshBasicMaterial({ map: T(512, 512, gridTex('#0a1430', 'rgba(90,140,230,0.4)', 8)), fog: true }); m.gridWall.map.wrapS = m.gridWall.map.wrapT = THREE.RepeatWrapping;
  m.labels = {}; for (const k of Object.keys(FLAV)) { const x = toon({ map: T(512, 256, (g, w, h) => tubeLabel(g, w, h, k, { year68: k === 'plain68' })), emissive: 0x1a1010 }); x.emissiveMap = x.map; m.labels[k] = x; }
  m.lid = toon({ color: 0x24242c, emissive: 0x08080c }); m.foil = toon({ color: 0xc8ccd4, emissive: 0x202028 }); m.lidK = vc({ emissive: 0x08080c });
  m.check = vc({ map: T(512, 512, checkerTex('#e8e0c8', '#7a9a80', 8)) }); m.checkStore = vc({ map: T(512, 512, checkerTex('#efe6d0', '#c8503a', 8)) });
  m.wallCream = vc({ map: T(256, 256, plainTex('#efe6cf')) }); m.wallSage = vc({ map: T(256, 256, plainTex('#8aa890')) }); m.slate = vc({ map: T(256, 256, plainTex('#2a2a32', 0.2)) });
  m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 8, seed: 51 })) }); m.darkwood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#4a2e1e', n: 6, seed: 33 })) });
  m.chalk = em(T(1024, 512, chalkTex), 0x101810); m.patent = em(T(512, 640, patentTex), 0x303028, { side: THREE.DoubleSide });
  m.bag = em(T(512, 256, bagTex), 0x101828); m.glassC = toon({ color: 0xcfe8f0, transparent: true, opacity: 0.28, depthWrite: false, emissive: 0x18303a });
  m.oil = toon({ color: 0xf0c040, emissive: 0x4a3008 });
  m.winDay = new THREE.MeshBasicMaterial({ map: T(512, 320, windowTex({ a: '#6a9ae0', b: '#d8e4f0', c: '#9aa0b0' })), fog: false }); m.winGold = new THREE.MeshBasicMaterial({ map: T(512, 320, windowTex({ a: '#e88a5a', b: '#ffd8a0', c: '#8a6a7a' })), fog: false });
  m.winNight = new THREE.MeshBasicMaterial({ map: T(512, 320, windowTex({ a: '#0a1030', b: '#2a3a7a', c: '#141a3a', lit: '#ffd890', moon: 1 })), fog: false });
  m.fluo = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xf0f8ff).multiplyScalar(1.6), fog: false }); m.fluoWarm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0d0).multiplyScalar(1.5), fog: false });
  m.sign68 = em(T(1024, 256, signTex(['NEW! STAX-A-LOT CHIPS'], { bg: '#f8e8b0', col: '#c8302a', rim: '#c8302a' })), 0x302010, { side: THREE.DoubleSide });
  m.signGroc = em(T(512, 160, signTex(['GROCERY'], { bg: '#2a6a4a', col: '#f8f0d0', rim: '#f8f0d0', flat: 1 })), 0x0a2014, { side: THREE.DoubleSide });
  m.signSnack = new THREE.MeshBasicMaterial({ map: T(512, 160, signTex(['SNACKS'], { bg: '#1a4a9a', col: '#ffffff', rim: '#ffffff', flat: 1 })), side: THREE.DoubleSide, fog: false }); m.signSnack.color.setScalar(1.1);
  m.signDrug = new THREE.MeshBasicMaterial({ map: T(768, 160, signTex(['DRUGSTORE · OPEN LATE'], { bg: '#c8302a', col: '#ffffff', rim: '#ffffff', flat: 1 })), side: THREE.DoubleSide, fog: false }); m.signDrug.color.setScalar(1.15);
  m.indiana = em(T(512, 200, signTex(['INDIANA', 'TEST MARKET'], { bg: '#f4ecd8', col: '#2a4a8a', rim: '#2a4a8a' })), 0x202018, { side: THREE.DoubleSide });
  m.boxes = [['OATS', '#d8a040', '#8a3a2a'], ['SOAP', '#4a8ad8', '#f2f0ea'], ['CORN', '#e8c030', '#2a7a3a'], ['TEA', '#8a3a5a', '#e8c040'], ['RICE', '#f0e8d8', '#c8302a'], ['SOUP', '#c8402a', '#f2e8d0']].map(([w, a, b]) => em(T(256, 320, boxTex(w, a, b === '#f2f0ea' ? '#2a4a8a' : b)), 0x181010));
  m.wallpaper = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#c8b088'; g.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? 'rgba(120,70,40,0.18)' : 'rgba(255,255,255,0.08)'; g.fillRect(i * w / 16, 0, w / 32, h); } PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 4, 4, 3, 5)); }) });
  m.carpet = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#7a4a3a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.88 + 0.16 * PT.fbm(u, v, 8, 8, 3, 2)); g.strokeStyle = 'rgba(232,192,120,0.5)'; g.lineWidth = 8; g.strokeRect(20, 20, w - 40, h - 40); }) });
  m.brick = vc({ map: T(256, 256, (g, w, h) => PT.bricks ? PT.bricks(g, w, h, {}) : plainTex('#9a5a40')(g, w, h)) });
  m.photos = [0, 1].map((k) => em(T(160, 200, photoTex(k)), 0x201810)); m.tvScreen = new THREE.MeshBasicMaterial({ map: T(256, 192, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5a8ae0'); gr.addColorStop(1, '#a0d0ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,0.15)'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 2); }), fog: false });
  m.stone = vc({ map: T(256, 256, stoneTex) }); m.head = em(T(512, 512, headTex), 0x18181e); m.soil = vc({ map: T(1024, 512, soilTex), side: THREE.DoubleSide }); m.soilIn = vc({ map: T(256, 256, plainTex('#3a281c', 0.3)), side: THREE.DoubleSide });
  m.grass = vc({ map: T(512, 512, grassTex) }); m.grass.map.wrapS = m.grass.map.wrapT = THREE.RepeatWrapping;
  m.hills = new THREE.MeshBasicMaterial({ map: T(1024, 256, hillsTex), transparent: true, fog: false, depthWrite: false }); m.sky = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  m.leaf = vc(); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.cloth = vc(); m.plastic = vc({ emissive: 0x0c0c10 }); m.bronze = vc({ emissive: 0x2a1808 });
  m.spot = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2d8).multiplyScalar(2.0), fog: false });
  return m; }

// ---------------------------------------------------------------- shared pieces
const TR = 0.045, TH = 0.27; // tube radius / height (a touch larger than life so it reads on a phone)
// a standing chip tube (group origin at its base): label wrap, dark lid, foil rim
function tube(parent, flav, x, y, z, ry = 0, s = 1) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.scale.setScalar(s); parent.add(g);
  mesh(g, cyl(TR, TR, TH * 0.94, 28), M.labels[flav] || M.labels.orig, 0, TH * 0.47, 0, 0, 0, 0, true);
  mesh(g, cyl(TR * 0.99, TR * 0.99, TH * 0.03, 28), M.foil, 0, TH * 0.015, 0);
  const lid = mesh(g, cyl(TR * 1.06, TR * 1.06, TH * 0.06, 28), M.lid, 0, TH * 0.97, 0); g.userData.lid = lid; return g; }
function tubeK(K, flav, x, y, z, ry = 0) { K.put(M.labels[flav], cyl(TR, TR, TH * 0.94, 20), x, y + TH * 0.47, z, 0, ry, 0, 1, 1, 1); K.put(M.lidK, cyl(TR * 1.06, TR * 1.06, TH * 0.06, 20), x, y + TH * 0.97, z, 0, 0, 0, 1, 1, 1, 0x2a2a32); }
// saddle chip mesh (real-size ~0.07 x 0.05 m by default)
let SADDLE; const chipMesh = (parent, x, y, z, ry = 0, s = 1) => mesh(parent, SADDLE, M.chip, x, y, z, 0, ry, 0, true);
function bagMesh(parent, x, y, z, ry, s = 1) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.scale.setScalar(s); parent.add(g);
  const geo = new THREE.SphereGeometry(1, 32, 20), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const X = p.getX(i), Y = p.getY(i), Z = p.getZ(i), sq = (v) => Math.sign(v) * Math.pow(Math.abs(v), 0.55); p.setXYZ(i, sq(X) * 0.11, sq(Y) * 0.15, Z * 0.045 * (1 - 0.85 * Y * Y)); } geo.computeVertexNormals();
  mesh(g, geo, M.bag, 0, 0.155, 0); const crimp = H.toon({ color: 0xc8d8f0 }); for (const yy of [0.008, 0.302]) mesh(g, new THREE.BoxGeometry(0.22, 0.018, 0.01), crimp, 0, yy, 0); return g; }
function lampShade(K, x, y, z, col = 0x2a5a4a) { K.beam(M.paint, [x, y + 0.9, z], [x, y + 0.12, z], 0.006, 0x1a1a20, true, 4); K.put(M.paint, new THREE.ConeGeometry(0.22, 0.18, 20, 1, true), x, y, z, 0, 0, 0, 1, 1, 1, col); K.put(M.lampGlass, sph(0.05, 10, 8), x, y - 0.06, z, 0, 0, 0, 1, 1, 1); }
function tree(K, x, z, s, R) { K.beam(M.bark, [x, 0, z], [x + 0.2 * s, 2.6 * s, z], 0.26 * s, 0x6a4a34, true, 8); for (const [a, b] of [[-1, 2.1], [1, 2.4], [0.3, 2.9]]) K.beam(M.bark, [x + 0.1 * s, 2.0 * s, z], [x + a * 1.2 * s, b * s + 0.4, z + (R() - 0.5)], 0.1 * s, 0x6a4a34, true, 6);
  for (let i = 0; i < 9; i++) K.put(M.leaf, lumpGeo(i + 7, 1, 0.25), x + (R() - 0.5) * 3.4 * s, (2.9 + R() * 1.5) * s, z + (R() - 0.5) * 2.2 * s, 0, R() * 6, 0, (1.1 + R() * 0.5) * s, (0.8 + R() * 0.3) * s, (1.0 + R() * 0.4) * s, [0x3f7a34, 0x4a8a3a, 0x356a2e][i % 3]); }

// ================================================================= LAB (1950s)
function buildLab(root) { const R = PT.rng(1956), K = new Kit(), X = 5, ZB = -4, HT = 3.2;
  mesh(root, planeUV(10, 9, 4, 4), M.check, 0, 0, 0.5, -Math.PI / 2, 0, 0, false);
  K.box(M.wallCream, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); K.box(M.wallSage, -X, X, 0, 1.05, ZB, ZB + 0.04, 0xffffff, 0.01);
  for (const s of [-1, 1]) { K.box(M.wallCream, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 5, 0xffffff, 0.01); K.box(M.wallSage, s > 0 ? X - 0.04 : -X, s > 0 ? X : -X + 0.04, 0, 1.05, ZB, 5, 0xffffff, 0.01); }
  mesh(root, plane(2 * X, 9), H.toon({ color: 0xe8e2d0, side: THREE.DoubleSide }), 0, HT, 0.5, Math.PI / 2, 0, 0, false);
  // windows (back left), chalkboard (back right)
  const wins = []; for (const x of [-3.4, -1.9, -0.4]) { wins.push(mesh(root, plane(1.2, 1.5), M.winDay, x, 1.95, ZB + 0.02, 0, 0, 0, false)); K.box(M.wood, x - 0.66, x + 0.66, 1.14, 1.2, ZB, ZB + 0.14, 0xe8e0d0, 0.01); K.box(M.wood, x - 0.66, x + 0.66, 2.7, 2.76, ZB, ZB + 0.08, 0xe8e0d0, 0.005); for (const d of [-0.62, 0, 0.62]) K.box(M.wood, x + d - 0.03, x + d + 0.03, 1.2, 2.72, ZB, ZB + 0.08, 0xe8e0d0, 0.005); K.box(M.wood, x - 0.6, x + 0.6, 1.93, 1.97, ZB, ZB + 0.06, 0xe8e0d0, 0.005); }
  mesh(root, plane(2.8, 1.4), M.chalk, 2.6, 1.85, ZB + 0.03, 0, 0, 0, false); K.box(M.wood, 1.15, 4.05, 1.08, 1.14, ZB, ZB + 0.12, 0x8a5a38, 0.01); K.box(M.wood, 1.15, 4.05, 2.55, 2.62, ZB, ZB + 0.06, 0x8a5a38, 0.01);
  // the long bench: dark top, wood cabinets
  const BY = 0.92, BZ = -1.4; K.box(M.slate, -1.75, 1.75, BY - 0.05, BY, BZ - 0.45, BZ + 0.45, 0xffffff, 0.02); K.box(M.wood, -1.7, 1.7, 0, BY - 0.05, BZ - 0.4, BZ + 0.4, 0xb08a5a, 0.02);
  for (let i = 0; i < 6; i++) { const x = -1.42 + i * 0.57; K.box(M.wood, x - 0.25, x + 0.25, 0.1, BY - 0.12, BZ + 0.4, BZ + 0.42, 0xc89a68, 0.01); K.put(M.brass, sph(0.018, 8, 6), x, BY - 0.25, BZ + 0.43, 0, 0, 0, 1, 1, 1, 0xc8a050); }
  // fryer pot + basket, flasks with golden oil, a balance scale
  K.put(M.metal, cyl(0.17, 0.15, 0.22, 24), -1.35, BY + 0.11, BZ - 0.05, 0, 0, 0, 1, 1, 1, 0xb8bcc6); K.put(M.oil, cyl(0.155, 0.155, 0.01, 24), -1.35, BY + 0.2, BZ - 0.05, 0, 0, 0, 1, 1, 1); K.beam(M.metal, [-1.35, BY + 0.2, BZ - 0.05], [-1.35, BY + 0.42, BZ + 0.2], 0.012, 0x3a3a44, true, 6); K.put(M.metal, cyl(0.06, 0.06, 0.012, 16), -1.6, BY + 0.006, BZ + 0.2, 0, 0, 0, 1, 1, 1, 0x3a3a44);
  for (const [x, z, h] of [[-0.95, BZ - 0.25, 0.22], [-0.82, BZ - 0.1, 0.16], [-1.02, BZ + 0.05, 0.12]]) { K.put(M.oil, cyl(0.035, 0.05, h * 0.45, 14), x, BY + h * 0.22, z, 0, 0, 0, 1, 1, 1); mesh(root, lathe('fl' + h, [[0.001, 0], [0.055, 0], [0.06, 0.02], [0.03, h * 0.6], [0.018, h * 0.7], [0.018, h], [0.022, h + 0.01]], 18), M.glassC, x, BY, z, 0, 0, 0, false); }
  K.at(1.45, BY, BZ - 0.28, 0.2, () => { K.box(M.brass, -0.12, 0.12, 0, 0.02, -0.06, 0.06, 0xc8a050, 0.005); K.beam(M.brass, [0, 0.02, 0], [0, 0.22, 0], 0.01, 0xc8a050, true, 6); K.beam(M.brass, [-0.12, 0.22, 0], [0.12, 0.22, 0], 0.006, 0xc8a050, true, 4); for (const s of [-1, 1]) K.put(M.brass, cyl(0.05, 0.04, 0.012, 14), s * 0.12, 0.14, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); });
  // the chip mould tray: 4 x 2 identical saddles (pop in sequence), broken irregular chips on a plate beside it (the old problem)
  const TX = -0.3, TZ = BZ - 0.05; K.box(M.metal, TX - 0.28, TX + 0.28, BY, BY + 0.025, TZ - 0.13, TZ + 0.13, 0xc8ccd4, 0.006);
  const trayChips = []; for (let i = 0; i < 8; i++) { const c = chipMesh(root, TX - 0.2 + (i % 4) * 0.133, BY + 0.045, TZ - 0.06 + Math.floor(i / 4) * 0.12, 0); c.scale.setScalar(0.85); trayChips.push(c); }
  K.put(M.paint, cyl(0.12, 0.1, 0.015, 20), TX - 0.55, BY + 0.008, TZ + 0.2, 0, 0, 0, 1, 1, 1, 0xf2f0ea); const shards = []; for (let i = 0; i < 7; i++) { const s = mesh(root, shardGeo(i + 3), M.chip, TX - 0.55 + (R() - 0.5) * 0.14, BY + 0.022 + i * 0.002, TZ + 0.2 + (R() - 0.5) * 0.12, 0, R() * 6, 0); s.scale.setScalar(0.018 + R() * 0.012); shards.push(s); }
  // chip bags (right) + spilled crumbs (animated spill)
  const bags = [bagMesh(root, 1.0, BY, BZ - 0.15, -0.3, 1), bagMesh(root, 1.32, BY, BZ - 0.22, 0.2, 0.9)]; const crumbs = []; for (let i = 0; i < 16; i++) { const s = mesh(root, shardGeo(i + 20), M.chip, 0, 0, 0, 0, R() * 6, 0); s.scale.setScalar(0.02 + R() * 0.016); s.userData.d = [R(), R(), R()]; crumbs.push(s); }
  // the tube station: a tube on the bench, a chip stack above it that lowers in, the lid that drops on
  const tb = tube(root, 'plain68', 0.42, BY, BZ - 0.1, 0.4, 1.25); tb.userData.lid.visible = false; const lidF = mesh(root, cyl(TR * 1.32, TR * 1.32, TH * 0.075, 28), M.lid, 0.42, BY + 0.6, BZ - 0.1);
  const stack = new THREE.Group(); root.add(stack); for (let i = 0; i < 26; i++) { const c = chipMesh(stack, 0, i * CHIP_T * 1.3, 0, 0); c.scale.setScalar(1.3); } stack.position.set(0.42, BY + 0.45, BZ - 0.1);
  // desk (front right): typewriter, patent sheet, lamp, stacked papers
  const DX = 2.7, DZ = 0.2; K.box(M.wood, DX - 0.8, DX + 0.8, 0.74, 0.8, DZ - 0.45, DZ + 0.45, 0x6a4028, 0.03); for (const s of [-1, 1]) K.box(M.wood, DX + s * 0.6 - 0.2, DX + s * 0.6 + 0.2, 0, 0.74, DZ - 0.4, DZ + 0.4, 0x5a3420, 0.02);
  K.at(DX - 0.3, 0.8, DZ - 0.1, 0.15, () => { K.box(M.paint, -0.2, 0.2, 0, 0.1, -0.15, 0.15, 0x2a3a3a, 0.03); K.box(M.paint, -0.22, 0.22, 0.1, 0.16, -0.16, -0.06, 0x2a3a3a, 0.03); K.put(M.paint, cyl(0.025, 0.025, 0.46, 12), 0, 0.17, -0.12, 0, 0, Math.PI / 2, 1, 1, 1, 0x1a1a1a); for (let i = 0; i < 12; i++) K.put(M.paint, cyl(0.012, 0.012, 0.01, 8), -0.15 + (i % 6) * 0.06, 0.105, 0.02 + Math.floor(i / 6) * 0.05, 0, 0, 0, 1, 1, 1, 0xe8e4dc); });
  const pat = mesh(root, plane(0.26, 0.33), M.patent, DX + 0.3, 0.805, DZ + 0.05, -Math.PI / 2, 0, -0.12, false);
  K.at(DX + 0.65, 0.8, DZ - 0.25, 0, () => { K.put(M.brass, cyl(0.07, 0.09, 0.03, 12), 0, 0.015, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); K.beam(M.brass, [0, 0, 0], [0.04, 0.38, 0], 0.012, 0xc8a050, true, 6); K.put(M.paint, new THREE.ConeGeometry(0.11, 0.13, 14, 1, true), 0.08, 0.4, 0, 0, 0, 0.4, 1, 1, 1, 0x2a5a3a); });
  // shelves (left wall): jars + potato sacks + crates
  for (let j = 0; j < 3; j++) { K.box(M.wood, -X + 0.05, -X + 0.45, 1.2 + j * 0.45, 1.24 + j * 0.45, -3.2, -0.6, 0x8a5a38, 0.01); for (let i = 0; i < 6; i++) { K.put(M.glassC, cyl(0.07, 0.07, 0.2, 12), -X + 0.25, 1.34 + j * 0.45, -3.0 + i * 0.42, 0, 0, 0, 1, 1, 1); K.put(M.paint, cyl(0.06, 0.06, 0.12, 12), -X + 0.25, 1.3 + j * 0.45, -3.0 + i * 0.42, 0, 0, 0, 1, 1, 1, [0xe8d8a8, 0xd8b060, 0xf0e8d0][(i + j) % 3]); } }
  for (let i = 0; i < 3; i++) K.at(-4.0 + i * 0.55, 0, -0.2 + (i % 2) * 0.3, R() * 0.6, () => { K.put(M.cloth, lumpGeo(i + 40, 2, 0.12), 0, 0.3, 0, 0, 0, 0, 0.26, 0.32, 0.22, 0xc8a878); });
  K.at(-3.6, 0, 1.1, 0.3, () => { K.box(M.wood, -0.3, 0.3, 0, 0.36, -0.22, 0.22, 0xa8784a, 0.01); for (let i = 0; i < 6; i++) K.put(M.paint, sph(0.07, 8, 6), -0.18 + (i % 3) * 0.18, 0.42, -0.08 + Math.floor(i / 3) * 0.16, 0, 0, 0, 1, 0.8, 1.1, 0xb8905a); });
  const crate = mesh(root, plane(0.5, 0.18), H.M.em(H.mkTex(256, 96, signTex(['POTATOES'], { bg: '#e8d8b0' })), 0x201810), -3.6, 0.2, 1.33, 0, 0.3, 0, false);
  lampShade(K, -1.0, 2.5, -1.4); lampShade(K, 1.0, 2.5, -1.4); lampShade(K, 2.7, 2.4, 0.2);
  K.build(root, 0);
  const lamps = [glowAt(root, [-1.0, 2.42, -1.4], 0.9, '#ffe0a0', 0.45), glowAt(root, [1.0, 2.42, -1.4], 0.9, '#ffe0a0', 0.45), glowAt(root, [2.7, 2.32, 0.2], 0.8, '#ffe0a0', 0.4)];
  const shaft = shaftAt(root, [-1.9, 1.4, ZB + 1.3], 3.6, 3.2, 0.0, 0.25, 0.14, 0xfff0d0);
  const dust = motes(root, 60, [-3, 3, 0.6, 2.6, -3.6, 0.5], 61, 0.011);
  return { wins, lamps, shaft, dust, trayChips, shards, bags, crumbs, tb, lidF, stack, pat, BY, BZ, TX, TZ, DX, DZ };
}

// ================================================================= STORE (1968 grocery / 2008 drugstore)
function buildStore(root) { const R = PT.rng(1968), K = new Kit(), X = 5, ZB = -7, HT = 3.4;
  mesh(root, planeUV(10, 12, 5, 6), M.checkStore, 0, 0, -1, -Math.PI / 2, 0, 0, false);
  K.box(M.wallCream, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(M.wallCream, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 5, 0xffffff, 0.01);
  mesh(root, plane(2 * X, 12), H.toon({ color: 0xe8e4d8, side: THREE.DoubleSide }), 0, HT, -1, Math.PI / 2, 0, 0, false);
  const fl = []; for (let i = 0; i < 4; i++) for (const x of [-1.4, 1.4]) { fl.push(mesh(root, new THREE.BoxGeometry(0.22, 0.04, 1.4), M.fluo, x, HT - 0.06, -5.6 + i * 1.8)); }
  // shelf units along both sides (facing the aisle centre): 4 levels of generic boxes + cans (the 1968 + 2008 shared stock)
  const shelf = (sx, z0, z1) => { const xi = sx * 2.2, xo = sx * 2.75, xb = sx * 2.6; K.box(M.paint, Math.min(xb, xo), Math.max(xb, xo), 0, 2.0, z0, z1, 0xd8d8de, 0.01); for (const zz of [z0, z1]) K.box(M.paint, Math.min(xi, xo), Math.max(xi, xo), 0, 2.0, zz - 0.03, zz + 0.03, 0xc8c8d0, 0.005); K.box(M.paint, Math.min(xi, xo), Math.max(xi, xo), 2.0, 2.04, z0, z1, 0xc8302a, 0.005);
    for (let j = 0; j < 4; j++) { const y = 0.12 + j * 0.47; K.box(M.paint, xi - sx * 0.02, xi + sx * 0.3, y - 0.02, y, z0, z1, 0xb8b8c0, 0.004); K.box(M.paint, xi - sx * 0.03, xi + sx * 0.0, y - 0.06, y, z0, z1, 0xe8e4dc, 0.003); } };
  shelf(-1, -6.5, -0.4); shelf(1, -6.5, -2.6);
  const stock = new THREE.Group(); root.add(stock); { const KS = new Kit(); for (const sx of [-1, 1]) for (let j = 0; j < 4; j++) { const y = 0.12 + j * 0.47; for (let z = -6.3; z < (sx > 0 ? -2.8 : -0.6); z += 0.24) { const k = Math.floor(Math.abs(z * 3 + j * 7)) % 6;
      if ((j + Math.floor(z * 2)) % 3) KS.put(M.boxes[k], new THREE.BoxGeometry(0.2, 0.3, 0.07), sx * 2.33, y + 0.15, z, 0, -sx * Math.PI / 2, 0, 1, 1, 1); else for (let c = 0; c < 2; c++) KS.put(M.paint, cyl(0.045, 0.045, 0.12, 12), sx * 2.33, y + 0.06 + c * 0.12, z, 0, 0, 0, 1, 1, 1, [0xc8402a, 0x3a7a5a, 0xe8c040][k % 3]); } } KS.build(stock); }
  // 1968 dressing: end-cap pyramid of NEW! tubes, hanging banner, grocery sign, checkout counter + register, INDIANA card
  const s68 = new THREE.Group(); root.add(s68); { const KP = new Kit(); KP.box(M.wood, -0.75, 0.75, 0, 0.3, -1.65, -0.85, 0xc8302a, 0.02);
    for (let t = 0; t < 6; t++) { const n = 12 - 2 * t, y = 0.3 + t * (TH + 0.012); for (const dz of [-0.1, 0.0]) for (let i = 0; i < n; i++) tubeK(KP, 'plain68', (i - (n - 1) / 2) * TR * 2.25, y, -1.25 + dz + (t % 2) * 0.01, 0); if (t < 5) KP.box(M.paint, -n * TR * 1.2, n * TR * 1.2, y + TH, y + TH + 0.012, -1.42, -1.18, 0xe8e0c8, 0.002); }
    KP.at(-3.6, 0, 0.6, 0.5, () => { KP.box(M.wood, -0.7, 0.7, 0, 0.95, -0.35, 0.35, 0x8a5a38, 0.02); KP.box(M.slate, -0.75, 0.75, 0.95, 1.0, -0.4, 0.4, 0xffffff, 0.01); KP.box(M.metal, -0.2, 0.2, 1.0, 1.3, -0.25, 0.05, 0xb8a070, 0.04); KP.box(M.metal, -0.18, 0.18, 1.3, 1.45, -0.2, -0.1, 0xc8b080, 0.02); });
    KP.build(s68); for (let t = 0; t < 6; t++) { const n = 6 - t; } }
  const banner = mesh(s68, plane(2.6, 0.65), M.sign68, 0, 2.6, -2.2, 0, 0, 0, false); K.beam(M.paint, [-1.2, 2.93, -2.2], [-1.2, HT, -2.2], 0.006, 0x2a2a30, true, 4); K.beam(M.paint, [1.2, 2.93, -2.2], [1.2, HT, -2.2], 0.006, 0x2a2a30, true, 4);
  const groc = mesh(s68, plane(1.6, 0.5), M.signGroc, 0, 2.6, ZB + 0.03, 0, 0, 0, false); const ind = mesh(s68, plane(0.6, 0.24), M.indiana, 0.0, 0.66, -0.84, -0.12, 0, 0, false);
  const win68 = []; for (const x of [-3.6, 3.6]) win68.push(mesh(root, plane(1.4, 1.6), M.winDay, x, 1.9, ZB + 0.02, 0, 0, 0, false));
  // 2008 dressing: the chip aisle (right shelf, four flavours of STAX-A-LOT), SNACKS hanging sign, DRUGSTORE sign
  const s08 = new THREE.Group(); root.add(s08); { const KD = new Kit(); const FL = ['orig', 'sour', 'bbq', 'cheese']; for (let j = 0; j < 4; j++) { const y = 0.12 + j * 0.47; for (let i = 0; i < 16; i++) { const z = -2.5 + i * 0.13; if (z > -0.45) break; tubeK(KD, FL[Math.floor(i / 4) % 4 === 0 ? (j % 4) : (Math.floor(i / 4) + j) % 4], 2.36, y, z, 0); } }
    KD.box(M.paint, 2.6, 2.75, 0, 2.0, -2.6, -0.4, 0xd8d8de, 0.01); for (const zz of [-2.6, -0.4]) KD.box(M.paint, 2.2, 2.75, 0, 2.0, zz - 0.03, zz + 0.03, 0xc8c8d0, 0.005); KD.box(M.paint, 2.2, 2.75, 2.0, 2.04, -2.6, -0.4, 0x1a4a9a, 0.005); for (let j = 0; j < 4; j++) { const y = 0.12 + j * 0.47; KD.box(M.paint, 2.18, 2.6, y - 0.02, y, -2.6, -0.4, 0xb8b8c0, 0.004); KD.box(M.paint, 2.17, 2.2, y - 0.06, y, -2.6, -0.4, 0xffe040, 0.003); }
    KD.build(s08); }
  const snack = mesh(s08, plane(1.2, 0.38), M.signSnack, 1.3, 2.7, -1.6, 0, -0.5, 0, false); K.beam(M.paint, [0.85, 2.89, -1.4], [0.85, HT, -1.4], 0.006, 0x2a2a30, true, 4); const drug = mesh(s08, plane(2.4, 0.5), M.signDrug, 0, 2.7, ZB + 0.03, 0, 0, 0, false);
  K.build(root, 0);
  const flGlow = fl.map((f, i) => glowAt(root, [f.position.x, HT - 0.2, f.position.z], 1.4, '#e8f4ff', 0.2));
  const dust = motes(root, 40, [-2, 2, 0.4, 2.8, -5, 1], 67, 0.01);
  return { s68, s08, stock, win68, flGlow, fl, dust, banner };
}

// ================================================================= HOME (living room)
function buildHome(root) { const R = PT.rng(1985), K = new Kit(), X = 4.2, ZB = -3.4, HT = 2.8;
  mesh(root, planeUV(10, 9, 3, 3), M.wood, 0, 0, 0.5, -Math.PI / 2, 0, 0, false); mesh(root, planeUV(4.4, 3.2, 1, 1), M.carpet, 0, 0.006, -0.9, -Math.PI / 2, 0, 0, false);
  K.box(M.wallpaper, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); for (const s of [-1, 1]) K.box(M.wallpaper, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 5, 0xffffff, 0.01);
  K.box(M.wood, -X, X, 0, 0.12, ZB, ZB + 0.03, 0x5a3a24, 0.01); mesh(root, plane(2 * X, 9), H.toon({ color: 0xe8dcc8, side: THREE.DoubleSide }), 0, HT, 0.5, Math.PI / 2, 0, 0, false);
  // fireplace + mantel (back centre): the tube stands proudly in the middle, framed photos, a clock
  K.box(M.paint, -0.9, 0.9, 0, 1.15, ZB, ZB + 0.35, 0xa8584a, 0.02); K.box(M.paint, -0.5, 0.5, 0.0, 0.7, ZB + 0.3, ZB + 0.36, 0x1a1214, 0.02); K.box(M.wood, -1.05, 1.05, 1.15, 1.22, ZB, ZB + 0.45, 0x5a3420, 0.02);
  for (let i = 0; i < 4; i++) K.put(M.wood, cyl(0.04, 0.04, 0.6, 8), -0.2 + i * 0.12, 0.08, ZB + 0.25, 0, 0.3 * i, Math.PI / 2, 1, 1, 1, 0x6a4028);
  const mCan = tube(root, 'orig', 0, 1.22, ZB + 0.25, 0.25, 1.3);
  const ph1 = mesh(root, new THREE.BoxGeometry(0.22, 0.28, 0.02), M.photos[0], -0.65, 1.37, ZB + 0.22, -0.1, 0.15, 0); const ph2 = mesh(root, new THREE.BoxGeometry(0.26, 0.21, 0.02), M.photos[1], 0.62, 1.33, ZB + 0.22, -0.1, -0.15, 0);
  K.at(0.36, 1.22, ZB + 0.2, 0, () => { K.box(M.wood, -0.07, 0.07, 0, 0.2, -0.04, 0.04, 0x3a2418, 0.02); K.put(M.paint, cyl(0.05, 0.05, 0.01, 16), 0, 0.12, 0.045, Math.PI / 2, 0, 0, 1, 1, 1, 0xf2ead6); });
  // window (left back) with curtains, bookshelf (right back), 80s TV (right)
  const win = mesh(root, plane(1.4, 1.2), M.winGold, -2.7, 1.65, ZB + 0.02, 0, 0, 0, false); K.box(M.wood, -3.45, -1.95, 1.0, 1.05, ZB, ZB + 0.12, 0xf2ece0, 0.01); K.box(M.wood, -2.74, -2.66, 1.05, 2.25, ZB, ZB + 0.06, 0xf2ece0, 0.005);
  for (const s of [-1, 1]) K.box(M.cloth, -2.7 + s * 0.85 - 0.2, -2.7 + s * 0.85 + 0.2, 0.9, 2.5, ZB + 0.05, ZB + 0.12, 0x7a3a3a, 0.04);
  K.box(M.wood, 1.6, 3.0, 0, 2.2, ZB, ZB + 0.35, 0x6a4028, 0.02); for (let j = 0; j < 4; j++) { K.box(M.wood, 1.62, 2.98, 0.4 + j * 0.48, 0.43 + j * 0.48, ZB, ZB + 0.34, 0x5a3420, 0.005); for (let i = 0; i < 9; i++) { const h = 0.26 + R() * 0.12; K.box(M.paint, 1.7 + i * 0.14, 1.81 + i * 0.14, 0.43 + j * 0.48, 0.43 + j * 0.48 + h, ZB + 0.05, ZB + 0.28, [0x8a3a2a, 0x2a4a6a, 0x3a6a3a, 0xc8a050, 0x5a3a5a][(i + j) % 5], 0.005); } }
  K.at(3.3, 0, -1.0, -1.1, () => { K.box(M.wood, -0.45, 0.45, 0, 0.75, -0.3, 0.3, 0x6a4028, 0.03); K.box(M.plastic, -0.38, 0.22, 0.12, 0.62, 0.29, 0.31, 0x2a2a30, 0.04); for (let i = 0; i < 2; i++) K.put(M.chrome, cyl(0.03, 0.03, 0.03, 12), 0.32, 0.5 - i * 0.12, 0.31, Math.PI / 2, 0, 0, 1, 1, 1, 0xc8c8d0); });
  const tv = new THREE.Group(); tv.position.set(3.3, 0, -1.0); tv.rotation.y = -1.1; root.add(tv); const tvS = mesh(tv, plane(0.52, 0.42), M.tvScreen, -0.08, 0.37, 0.315, 0, 0, 0, false);
  // armchair (left, angled), side table + lamp, sofa (right), coffee table
  const chair = new THREE.Group(); chair.position.set(-1.45, 0, -1.25); chair.rotation.y = 0.45; root.add(chair); { const KC = new Kit(); KC.box(M.cloth, -0.45, 0.45, 0.0, 0.45, -0.4, 0.4, 0x2f5a4a, 0.08); KC.box(M.cloth, -0.45, 0.45, 0.45, 1.15, -0.42, -0.2, 0x2f5a4a, 0.1); for (const s of [-1, 1]) KC.box(M.cloth, s * 0.45 - 0.12, s * 0.45 + 0.12, 0.25, 0.7, -0.42, 0.42, 0x285046, 0.08); KC.box(M.cloth, -0.36, 0.36, 0.45, 0.56, -0.25, 0.36, 0x3a6a58, 0.06); KC.build(chair); }
  K.at(-2.3, 0, -1.6, 0, () => { K.box(M.wood, -0.25, 0.25, 0.55, 0.6, -0.25, 0.25, 0x5a3420, 0.02); for (const a of [-1, 1]) for (const b of [-1, 1]) K.box(M.wood, a * 0.2 - 0.02, a * 0.2 + 0.02, 0, 0.55, b * 0.2 - 0.02, b * 0.2 + 0.02, 0x5a3420, 0.005); K.put(M.brass, cyl(0.07, 0.09, 0.03, 14), 0, 0.615, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); K.beam(M.brass, [0, 0.6, 0], [0, 1.05, 0], 0.012, 0xc8a050, true, 6); K.put(M.paint, new THREE.CylinderGeometry(0.12, 0.2, 0.24, 16, 1, true), 0, 1.12, 0, 0, 0, 0, 1, 1, 1, 0xf0d8a8); });
  const tCan = tube(root, 'orig', -2.2, 0.6, -1.5, 0.3, 1.0); tCan.visible = false; const tPh = mesh(root, new THREE.BoxGeometry(0.16, 0.2, 0.015), M.photos[0], -2.38, 0.7, -1.62, -0.2, 0.4, 0); tPh.visible = false;
  K.at(1.75, 0, -0.75, -1.1, () => { K.box(M.cloth, -1.1, 1.1, 0, 0.42, -0.42, 0.42, 0x8a6a3a, 0.08); K.box(M.cloth, -1.1, 1.1, 0.42, 0.92, -0.42, -0.24, 0x8a6a3a, 0.1); for (const s of [-1, 1]) K.box(M.cloth, s * 1.1 - 0.13, s * 1.1 + 0.13, 0.3, 0.66, -0.42, 0.42, 0x7a5a32, 0.08); for (const s of [-1, 1]) K.box(M.cloth, s * 0.52 - 0.48, s * 0.52 + 0.48, 0.42, 0.54, -0.36, 0.38, 0x9a7a4a, 0.06); });
  K.box(M.wood, -1.95, -0.75, 0.36, 0.42, -0.2, 0.4, 0x6a4028, 0.02); for (const a of [-1, 1]) for (const b of [-1, 1]) K.box(M.wood, -1.35 + a * 0.52 - 0.03, -1.35 + a * 0.52 + 0.03, 0, 0.36, 0.1 + b * 0.24 - 0.03, 0.1 + b * 0.24 + 0.03, 0x5a3420, 0.005);
  K.put(M.paint, new THREE.SphereGeometry(0.09, 14, 8, 0, TAU, Math.PI / 2, Math.PI / 2), -1.1, 0.47, 0.1, Math.PI, 0, 0, 1, 0.5, 1, 0x3a6a9a); for (let i = 0; i < 5; i++) { const c = chipMesh(root, -1.1 + (R() - 0.5) * 0.08, 0.475 + i * 0.004, 0.1 + (R() - 0.5) * 0.07, R() * 6); c.scale.setScalar(0.9); }
  K.at(-3.6, 0, 0.6, 0, () => { K.put(M.paint, cyl(0.2, 0.16, 0.4, 12), 0, 0.2, 0, 0, 0, 0, 1, 1, 1, 0x8a4a2a); for (let i = 0; i < 7; i++) K.put(M.leaf, lumpGeo(i + 2, 1, 0.3), (R() - 0.5) * 0.4, 0.7 + R() * 0.6, (R() - 0.5) * 0.4, 0, R() * 6, 0, 0.3, 0.32, 0.3, 0x3a7a3a); });
  K.build(root, 0);
  const lampG = glowAt(root, [-2.3, 1.12, -1.6], 1.2, '#ffc070', 0.5); const fireG = glowAt(root, [0, 0.35, ZB + 0.45], 1.2, '#ff8a40', 0.4); const canSpot = glowAt(root, [0, 1.4, ZB + 0.3], 0.7, '#fff0c0', 0.0);
  const dust = motes(root, 40, [-2, 2, 0.4, 2.2, -2.8, 0.8], 71, 0.01);
  return { win, mCan, tCan, tPh, lampG, fireG, canSpot, dust, chair, tvS };
}

// ================================================================= CEMETERY (cut-away grave) + BLUEPRINT void
function buildCem(root) { const R = PT.rng(2008), K = new Kit(), ZC = 1.0;
  mesh(root, planeUV(80, 120, 20, 30), M.grass, 0, 0, ZC - 60, -Math.PI / 2, 0, 0, false);
  // cut face: soil plane with a niche hole; niche walls; the tube and the urn side by side inside
  { const s = new THREE.Shape(); s.moveTo(-30, -4); s.lineTo(30, -4); s.lineTo(30, 0); s.lineTo(-30, 0); s.closePath(); const h = new THREE.Path(); h.moveTo(-0.45, -0.95); h.lineTo(0.45, -0.95); h.lineTo(0.45, -0.38); h.quadraticCurveTo(0, -0.28, -0.45, -0.38); h.closePath(); s.holes.push(h);
    const g = new THREE.ShapeGeometry(s, 8), uv = g.attributes.uv, p = g.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + 30) / 6, (p.getY(i) + 4) / 4); const face = mesh(root, g, M.soil, 0, 0, ZC, 0, 0, 0, false); face.receiveShadow = true;
    M.soil.map.wrapS = THREE.RepeatWrapping; }
  K.box(M.soilIn, -0.45, 0.45, -1.0, -0.95, 0.15, ZC, 0x8a6a50, 0.0); K.box(M.soilIn, -0.5, -0.45, -1.0, -0.3, 0.15, ZC, 0x6a5040, 0.0); K.box(M.soilIn, 0.45, 0.5, -1.0, -0.3, 0.15, ZC, 0x6a5040, 0.0); K.box(M.soilIn, -0.5, 0.5, -1.0, -0.28, 0.1, 0.15, 0x5a4434, 0.0); K.box(M.soilIn, -0.5, 0.5, -0.33, -0.25, 0.15, ZC, 0x5a4434, 0.0);
  const gCan = tube(root, 'orig', -0.2, -0.95, 0.55, 0.35, 1.25);
  const urn = mesh(root, lathe('urn', [[0.001, 0], [0.09, 0], [0.1, 0.03], [0.07, 0.06], [0.12, 0.16], [0.13, 0.24], [0.1, 0.32], [0.07, 0.35], [0.08, 0.38], [0.05, 0.4], [0.001, 0.42]], 28), M.bronze, 0.2, -0.95, 0.55, 0, 0, 0, true); urn.material = H.toon({ color: 0x8a5a3a, emissive: 0x2a1408 });
  const niche = glowAt(root, [0, -0.62, 0.75], 1.0, '#ffd890', 0.0);
  // the headstone + flowers + mound
  const head = new THREE.Group(); head.position.set(0, 0, -0.35); root.add(head); { const KH = new Kit(); KH.box(M.stone, -0.5, 0.5, 0, 0.14, -0.16, 0.16, 0x8a8a92, 0.02); KH.build(head); const tg = new THREE.Shape(); tg.moveTo(-0.4, 0); tg.lineTo(0.4, 0); tg.lineTo(0.4, 0.6); tg.quadraticCurveTo(0.4, 0.84, 0, 0.86); tg.quadraticCurveTo(-0.4, 0.84, -0.4, 0.6); tg.closePath();
    const sg = new THREE.ExtrudeGeometry(tg, { depth: 0.12, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 }); const uv = sg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + 0.4) / 0.8, uv.getY(i) / 0.86); mesh(head, sg, M.head, 0, 0.14, -0.06); }
  K.put(M.grass, lumpGeo(3, 2, 0.06), 0, -0.02, 0.35, 0, 0, 0, 0.55, 0.06, 0.55, 0x6aaa48);
  const flowers = (x, z, n, cols) => { for (let i = 0; i < n; i++) { const a = R() * TAU, r = R() * 0.1, fx = x + Math.cos(a) * r, fz = z + Math.sin(a) * r, h = 0.16 + R() * 0.12; K.beam(M.leaf, [fx, 0, fz], [fx + (R() - 0.5) * 0.06, h, fz + (R() - 0.5) * 0.04], 0.006, 0x3a7a2a, true, 4); K.put(M.paint, sph(0.025, 8, 6), fx + (R() - 0.5) * 0.06, h, fz, 0, 0, 0, 1, 0.7, 1, cols[i % cols.length]); } };
  flowers(-0.32, 0.0, 9, [0xf2e050, 0xffffff, 0xf08aa8]); flowers(0.34, 0.02, 9, [0xf2e050, 0xe85a4a, 0xffffff]);
  // rows of plain stones, hedges, the oak, a path, a bench, fence, hills, sky
  for (let r = 1; r < 6; r++) for (let i = -5; i <= 5; i++) { if (r === 1 && Math.abs(i) < 1) continue; const x = i * 1.6 + (r % 2) * 0.5 + (R() - 0.5) * 0.2, z = -0.35 - r * 2.2; K.at(x, 0, z, (R() - 0.5) * 0.1, () => { K.box(M.stone, -0.32, 0.32, 0, 0.5 + R() * 0.2, -0.08, 0.08, [0x9a9aa2, 0x8a8a94, 0xa8a49a][r % 3], 0.06); }); if ((i + r) % 3 === 0) flowers(x + 0.1, z + 0.2, 4, [0xffffff, 0xf2e050, 0xc8a0e8]); }
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) K.put(M.leaf, lumpGeo(i + (s > 0 ? 30 : 50), 1, 0.2), s * (6 + i * 0.1), 0.5, -2 - i * 2.6, 0, R() * 6, 0, 0.8, 0.6, 1.4, 0x356a2e);
  tree(K, -3.2, -2.8, 1.25, R); tree(K, 5.5, -9, 1.1, R); tree(K, -7, -14, 1.3, R);
  K.box(M.stone, -0.5, 0.5, 0.0, 0.015, -14, -1.5, 0xc8c0b0, 0.0); K.at(2.6, 0, -2.2, -0.4, () => { K.box(M.wood, -0.6, 0.6, 0.42, 0.47, -0.2, 0.2, 0x8a5a38, 0.01); K.box(M.wood, -0.6, 0.6, 0.47, 0.85, -0.22, -0.18, 0x8a5a38, 0.01); for (const s of [-1, 1]) K.box(M.metal, s * 0.5 - 0.03, s * 0.5 + 0.03, 0, 0.47, -0.2, 0.2, 0x2a2a30, 0.01); });
  for (let i = -12; i <= 12; i++) K.beam(M.metal, [i * 1.2, 0, -16], [i * 1.2, 1.2, -16], 0.02, 0x2a2a30, true, 4); K.beam(M.metal, [-14.4, 1.1, -16], [14.4, 1.1, -16], 0.015, 0x2a2a30, true, 4);
  // foreground grass tufts (depth)
  for (let i = 0; i < 26; i++) { const x = (R() - 0.5) * 4, z = ZC - 0.1 - R() * 1.2; K.put(M.leaf, new THREE.ConeGeometry(0.02, 0.1 + R() * 0.08, 4), x, 0.05, z, (R() - 0.5) * 0.4, R() * 3, (R() - 0.5) * 0.4, 1, 1, 1, [0x4a8a32, 0x5a9a3a][i % 2]); }
  K.build(root, 0);
  const hills = mesh(root, plane(260, 60), M.hills, 0, 12, -110, 0, 0, 0, false); hills.renderOrder = -1; const sky = mesh(root, plane(400, 160), M.sky, 0, 40, -140, 0, 0, 0, false);
  const dust = motes(root, 50, [-2, 2, 0.2, 2.5, -2, 1], 73, 0.012);
  return { gCan, urn, niche, hills, sky, dust, head, ZC };
}
function buildBlue(root) { const R = PT.rng(3), K = new Kit();
  const fl = mesh(root, planeUV(30, 30, 10, 10), M.gridFloor, 0, 0, -5, -Math.PI / 2, 0, 0, false); fl.material.map.repeat.set(1, 1);
  mesh(root, planeUV(30, 14, 10, 5), M.gridWall, 0, 7, -6, 0, 0, 0, false);
  const big = new THREE.Group(); big.position.set(0, 1.35, -1.6); root.add(big); const SA = 0.9, SB = 0.62, SK = 0.32;
  mesh(big, saddleGeo(SA, SB, SK, 16, 64), M.chipBlue, 0, 0, 0, 0, 0, 0, false); nond(mesh(big, saddleRim(SA, SB, SK, 0.012), M.rimGlow, 0, 0, 0, 0, 0, 0, false));
  const axes = new THREE.Group(); big.add(axes); { const KA = new Kit(); KA.beam(M.rimGlow, [-1.25, 0, 0], [1.25, 0, 0], 0.007, 0xffffff, true, 6); KA.beam(M.rimGlow, [0, -0.5, 0], [0, 0.7, 0], 0.007, 0xffffff, true, 6); KA.beam(M.rimGlow, [0, 0, -0.95], [0, 0, 0.95], 0.007, 0xffffff, true, 6);
    for (const [p, r] of [[[1.27, 0, 0], [0, 0, -Math.PI / 2]], [[0, 0.72, 0], [0, 0, 0]], [[0, 0, 0.97], [Math.PI / 2, 0, 0]]]) KA.put(M.rimGlow, new THREE.ConeGeometry(0.03, 0.08, 10), ...p, ...r, 1, 1, 1); KA.build(axes); }
  // a pedestal with the equation, and the perfect stack: chips drop one by one onto it
  K.box(M.paint, 0.2, 0.7, 0, 0.5, -0.25, 0.25, 0x2a4a8a, 0.02); const ped = mesh(root, plane(0.46, 0.2), H.M.basic(H.mkTex(512, 220, (g, w, h) => { g.fillStyle = '#10204a'; g.fillRect(0, 0, w, h); txt(g, 'z = x² − y²', w / 2, h * 0.55, w * 0.88, h * 0.5, { col: '#bfe8ff', font: SERIF, italic: true }); g.strokeStyle = '#7ab8ff'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12); }), 1.2), 0.45, 0.3, 0.255, 0, 0, 0, false);
  const stackChips = []; for (let i = 0; i < 22; i++) { const c = chipMesh(root, 0.45, 0.5 + 0.02 + i * CHIP_T * 2.6, 0.0, 0); c.scale.setScalar(1.6); stackChips.push(c); }
  K.build(root, 0);
  const dust = motes(root, 60, [-2, 2, 0.2, 3, -3, 1], 79, 0.012);
  return { big, stackChips, dust };
}

// ================================================================= lights, grades, API
const SET_LIGHT = {
  labDay: { top: '#000000', hor: '#c8ccd0', fog: '#c8ccd0', fogN: 14, fogF: 60, sky: '#f0f0f8', ground: '#7a7068', hemiI: 0.95, fillCol: '#8a98d8', fillI: 0.35, sunCol: '#fff4e0', sunI: 2.8, az: 160, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  labLate: { top: '#000000', hor: '#3a2618', fog: '#3a2618', fogN: 12, fogF: 60, sky: '#ffd8a8', ground: '#5a3a2a', hemiI: 0.85, fillCol: '#7a78c8', fillI: 0.36, sunCol: '#ffc888', sunI: 2.4, az: 150, el: 22, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
  store68: { top: '#000000', hor: '#d8ccb8', fog: '#d8ccb8', fogN: 14, fogF: 60, sky: '#fff0d8', ground: '#7a6058', hemiI: 0.95, fillCol: '#8a90d8', fillI: 0.34, sunCol: '#fff0d8', sunI: 2.6, az: -160, el: 50, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff8f0', fxTint: '#ffffff', shafts: 0 },
  store08: { top: '#000000', hor: '#1a2a3a', fog: '#1a2a3a', fogN: 12, fogF: 50, sky: '#d8f0ff', ground: '#3a3a48', hemiI: 0.8, fillCol: '#6a88e8', fillI: 0.42, sunCol: '#e8f4ff', sunI: 2.2, az: 170, el: 70, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#f0f6ff', fxTint: '#ffffff', shafts: 0 },
  home80: { top: '#000000', hor: '#2a1a20', fog: '#2a1a20', fogN: 10, fogF: 40, sky: '#ffd8b0', ground: '#4a3028', hemiI: 0.8, fillCol: '#6a70d0', fillI: 0.38, sunCol: '#ffd8a8', sunI: 2.2, az: -140, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e8', fxTint: '#ffffff', shafts: 0 },
  homeNight: { top: '#000000', hor: '#0a0e20', fog: '#0a0e20', fogN: 10, fogF: 40, sky: '#6a7ad0', ground: '#2a2030', hemiI: 0.6, fillCol: '#4a68e8', fillI: 0.5, sunCol: '#90b0ff', sunI: 1.1, az: -140, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#e8ecff', fxTint: '#ffffff', shafts: 0 },
  cemNoon: { top: '#4a82d8', hor: '#d8e4f0', fog: '#dce4ee', fogN: 30, fogF: 200, sky: '#a8bcf0', ground: '#5a6a40', hemiI: 0.8, fillCol: '#7d93e6', fillI: 0.36, sunCol: '#fff0d0', sunI: 3.4, az: 40, el: 42, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0.3 },
  cemGold: { top: '#4a4aa0', hor: '#ffb070', fog: '#e8a080', fogN: 30, fogF: 180, sky: '#9a88d0', ground: '#5a4a40', hemiI: 0.85, fillCol: '#6a6ad8', fillI: 0.38, sunCol: '#ffa060', sunI: 2.8, az: 15, el: 8, disc: '#fff0c8', discSize: 0.005, clouds: true, stars: 0, cardTint: '#fff0e2', fxTint: '#fff6ea', shafts: 0.6 },
  blue: { top: '#000000', hor: '#0a1430', fog: '#0a1430', fogN: 8, fogF: 40, sky: '#8ab8ff', ground: '#10204a', hemiI: 0.75, fillCol: '#5a88ff', fillI: 0.45, sunCol: '#d8ecff', sunI: 2.0, az: 140, el: 50, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#eef4ff', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  labDay: { look: 'day', over: { exp: 1.04, con: 1.2, sat: 1.08, tS: ['#3a4a8a', 0.14], tH: ['#ffe8c8', 0.06], bloom: [0.38, 0.84], vig: [0.28, 0.48, '#3a2a4a'] } },
  labLate: { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.08, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.12], bloom: [0.44, 0.76], hal: [0.26, '#ff9a50'], vig: [0.36, 0.44, '#2a1420'] } },
  store68: { look: 'office', over: { exp: 1.08, con: 1.2, sat: 1.12, lift: [0.03, 0.022, 0.04], tS: ['#3a2a6a', 0.14], tH: ['#ffe0b8', 0.08], bloom: [0.42, 0.8], hal: [0.2, '#ffb070'], vig: [0.3, 0.48, '#2a1420'] } },
  store08: { look: 'night', over: { exp: 1.12, con: 1.22, sat: 1.06, lift: [0.025, 0.03, 0.06], tS: ['#1a2a7a', 0.22], tH: ['#e0f0ff', 0.1], bloom: [0.48, 0.7], hal: [0.24, '#a0c8ff'], vig: [0.38, 0.42, '#08081a'] } },
  home80: { look: 'office', over: { exp: 1.12, con: 1.24, sat: 1.1, lift: [0.035, 0.02, 0.045], tS: ['#3a2a6a', 0.2], tH: ['#ffc888', 0.12], bloom: [0.44, 0.74], hal: [0.28, '#ff9a50'], vig: [0.36, 0.44, '#14081a'] } },
  homeNight: { look: 'night', over: { exp: 1.16, con: 1.22, sat: 1.04, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.5, 0.68], hal: [0.3, '#ffa050'], vig: [0.4, 0.42, '#08081a'] } },
  cemNoon: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.1, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.36, 0.86], vig: [0.26, 0.5, '#4a3a5a'] } },
  cemGold: { look: 'golden', over: { exp: 1.06, con: 1.22, sat: 1.1, tS: ['#3a2a8a', 0.18], tH: ['#ffb880', 0.1], bloom: [0.44, 0.76], hal: [0.26, '#ff9a60'], vig: [0.32, 0.46, '#1e1a3a'] } },
  blue: { look: 'night', over: { exp: 1.14, con: 1.22, sat: 1.1, lift: [0.02, 0.03, 0.07], tS: ['#1a2a7a', 0.24], tH: ['#c8e8ff', 0.1], bloom: [0.5, 0.66], hal: [0.3, '#6aa8ff'], vig: [0.4, 0.42, '#04061a'] } },
};

export function buildPR(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials(); SADDLE = saddleGeo(0.036, 0.026, 0.009, 8, 32);
  const ST = { mood: 'labDay', tray: 1, spill: 0, stackY: 0.45, lid: 0, stackN: 30, stackT: 1, spin: 0, nicheGlow: 0, chairEmpty: 0 };
  let lb, sr, hm, cm, bl;
  const API = makeAPI(ctx, { prefix: 'pr_', origin: PR_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { cemNoon: 'day', cemGold: 'day' },
    practicals: (name, F, W3) => { const fl = 1 + 0.04 * Math.sin(F * 0.7) + 0.02 * Math.sin(F * 1.9);
      if (name.startsWith('lab')) return [{ p: W3('lab', [-1.0, 2.3, -1.4]), col: '#ffe0a8', I: (name === 'labLate' ? 5 : 3) * fl, d: 6 }, { p: W3('lab', [1.0, 2.3, -1.4]), col: '#ffe0a8', I: (name === 'labLate' ? 5 : 3) * fl, d: 6 }, { p: W3('lab', [2.7, 2.2, 0.2]), col: '#ffd8a0', I: 3.5 * fl, d: 5 }, { p: W3('lab', [-1.9, 1.9, -3.4]), col: name === 'labLate' ? '#ffb070' : '#fff4e0', I: 3.5, d: 8 }];
      if (name === 'store68') return [{ p: W3('store', [-1.4, 3.1, -1.0]), col: '#fff4e0', I: 4, d: 7 }, { p: W3('store', [1.4, 3.1, -3.0]), col: '#fff4e0', I: 4, d: 7 }, { p: W3('store', [0, 2.0, 0.6]), col: '#ffe0b0', I: 3, d: 6 }];
      if (name === 'store08') return [{ p: W3('store', [1.4, 3.1, -1.0]), col: '#e8f4ff', I: 6, d: 7 }, { p: W3('store', [-1.4, 3.1, -1.0]), col: '#e8f4ff', I: 4, d: 7 }, { p: W3('store', [1.6, 1.2, -1.4]), col: '#fff0d0', I: 3, d: 4 }];
      if (name === 'home80') return [{ p: W3('home', [-2.3, 1.1, -1.6]), col: '#ffc070', I: 5 * fl, d: 7 }, { p: W3('home', [0, 0.5, -2.8]), col: '#ff8a40', I: 4 * (0.85 + 0.15 * Math.sin(F * 0.9) * Math.sin(F * 0.31)), d: 6 }, { p: W3('home', [0, 2.2, 1.0]), col: '#ffe0b8', I: 2.5, d: 7 }, { p: W3('home', [0, 1.7, -2.6]), col: '#fff0c0', I: 1.5, d: 3 }];
      if (name === 'homeNight') return [{ p: W3('home', [-2.3, 1.1, -1.6]), col: '#ffc070', I: 4.5 * fl, d: 6 }, { p: W3('home', [0, 1.7, -2.6]), col: '#fff0c0', I: 3, d: 3 }, { p: W3('home', [-2.7, 1.7, -3.0]), col: '#8aa0ff', I: 2.5, d: 6 }];
      if (name.startsWith('cem')) return [{ p: W3('cem', [0, -0.55, 0.85]), col: '#ffd890', I: 2.2 * ST.nicheGlow, d: 2.2 }];
      if (name === 'blue') return [{ p: W3('blue', [0, 2.2, -0.6]), col: '#9ac8ff', I: 5, d: 7 }, { p: W3('blue', [-0.6, 1.4, 0.8]), col: '#fff0d0', I: 1.4, d: 4 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'lab' && lb) { tickMotes(lb.dust, f, 0.3); lb.lamps.forEach((g, i) => (g.material.opacity = g.userData.op * (0.92 + 0.08 * Math.sin(f * 0.7 + i))));
        lb.trayChips.forEach((c, i) => { const k = Math.max(0, Math.min(1, ST.tray * 8 - i)); const b = k <= 0 ? 0.001 : k >= 1 ? 1 : 1 + 0.5 * Math.sin(k * Math.PI) ; c.scale.setScalar(0.85 * b); c.visible = k > 0; c.rotation.y = 0.02 * Math.sin(T * 2 + i); });
        lb.crumbs.forEach((c, i) => { const [a, b, d] = c.userData.d, t = Math.max(0, Math.min(1, ST.spill * 1.6 - a * 0.6)); c.visible = ST.spill > 0 && t > 0; const x = 0.9 + 0.05 - t * (0.12 + 0.35 * b), y = lb.BY + 0.32 * (1 - t) * (1 - t) + 0.006 + 0.03 * Math.sin(Math.PI * t) * d, z = lb.BZ - 0.1 + 0.35 * t * (0.3 + d); c.position.set(x, y, z); c.rotation.x = (1 - t) * 3 * a; });
        lb.stack.position.y = lb.BY + ST.stackY; lb.lidF.position.y = lb.BY + 0.62 - (0.62 - TH * 1.25 * 0.97 - 0.005) * ST.lid; lb.stack.visible = lb.lidF.visible = !!ST.stackVis; lb.tb.userData.lid.visible = !ST.stackVis; }
      if (cur === 'store' && sr) { tickMotes(sr.dust, f, 0.3); sr.flGlow.forEach((g, i) => (g.material.opacity = (ST.mood === 'store08' ? 0.28 : 0.16) * (ST.mood === 'store08' && i === 3 && f % 41 < 2 ? 0.3 : 1))); sr.banner.rotation.z = 0.01 * Math.sin(T * 1.1); }
      if (cur === 'home' && hm) { tickMotes(hm.dust, f, 0.3); hm.fireG.material.opacity = 0.4 * (0.8 + 0.2 * Math.sin(f * 0.9) * Math.sin(f * 0.37)); hm.canSpot.material.opacity = ST.mood === 'homeNight' ? 0.35 : 0.18 * (0.9 + 0.1 * Math.sin(f * 0.3)); }
      if (cur === 'cem' && cm) { tickMotes(cm.dust, f, 0.2); cm.niche.material.opacity = 0.35 * ST.nicheGlow; }
      if (cur === 'blue' && bl) { tickMotes(bl.dust, f, 0.3); bl.big.rotation.y = 0.5 + ST.spin + T * 0.18; bl.big.position.y = 1.35 + 0.03 * Math.sin(T * 1.2);
        bl.stackChips.forEach((c, i) => { const n = ST.stackN, tt = Math.max(0, Math.min(1, ST.stackT * n - i)), y0 = 0.52 + i * CHIP_T * 2.6; c.visible = tt > 0; c.position.y = y0 + (1 - tt) * (1 - tt) * 1.2; c.rotation.y = (1 - tt) * 1.5; }); } },
    mood: (name) => { ST.mood = name; if (lb) { lb.wins.forEach((w) => (w.material = name === 'labLate' ? M.winGold : M.winDay)); lb.shaft.material.color.set(name === 'labLate' ? 0xffb070 : 0xfff0d0); }
      if (sr) { const n = name === 'store08'; sr.s68.visible = !n; sr.s08.visible = n; sr.win68.forEach((w) => (w.material = n ? M.winNight : M.winDay)); sr.fl.forEach((m) => (m.material = n ? M.fluo : M.fluoWarm)); }
      if (hm) { const n = name === 'homeNight'; hm.win.material = n ? M.winNight : M.winGold; hm.tCan.visible = n; hm.tPh.visible = n; }
      if (cm) { cm.sky.material.color.set(name === 'cemGold' ? 0xffa880 : 0xa8c8f8); } },
    apply: (v) => { if (v.st) Object.assign(ST, v.st); } });
  lb = buildLab(API.groups.lab); sr = buildStore(API.groups.store); hm = buildHome(API.groups.home); cm = buildCem(API.groups.cem); bl = buildBlue(API.groups.blue);
  API.parts = { lb, sr, hm, cm, bl };
  API.set = (o) => Object.assign(ST, o);
  API.glows = { lab: lb.lamps, store: sr.flGlow, home: [hm.lampG, hm.fireG, hm.canSpot], cem: [cm.niche], blue: [] };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); };
  const V = API.V;
  API.views = [
    V('labDay', [1.2, 1.6, 3.4], [-0.3, 1.2, -1.6], 46, 1.0, [-0.3, 1.0, -1.4]), // 0 lab wide
    V('labDay', [-0.05, 1.22, -0.75], [-0.3, 0.95, -1.45], 42, 3.0, [-0.3, 0.95, -1.45], { st: { tray: 1 } }), // 1 tray close
    V('labDay', [1.05, 1.15, -0.55], [1.1, 1.0, -1.5], 42, 3.0, [1.1, 1.0, -1.5], { st: { spill: 1 } }), // 2 bags + crumbs
    V('labLate', [0.55, 1.35, -0.45], [0.42, 1.12, -1.5], 42, 3.0, [0.42, 1.12, -1.5], { st: { stackY: 0.06, lid: 1, stackVis: 1 } }), // 3 tube
    V('labLate', [3.0, 1.35, 1.3], [2.8, 0.8, 0.1], 42, 2.0, [2.9, 0.8, 0.2]), // 4 desk / patent
    V('store68', [0.6, 1.5, 3.2], [0, 1.0, -1.6], 46, 1.2, [0, 0.9, -1.2]), // 5 store 1968
    V('store08', [0.4, 1.45, 1.6], [2.1, 1.0, -1.4], 46, 1.4, [2.1, 1.0, -1.4]), // 6 drugstore aisle
    V('home80', [0.6, 1.4, 3.0], [-0.4, 1.0, -2.0], 46, 1.2, [-0.4, 1.0, -1.6]), // 7 living room
    V('homeNight', [-0.8, 1.3, 1.6], [-1.8, 0.85, -1.4], 44, 1.6, [-1.9, 0.8, -1.5]), // 8 empty chair night
    V('home80', [0.25, 1.38, -1.8], [0, 1.32, -3.2], 40, 2.6, [0, 1.35, -3.15]), // 9 mantel can
    V('cemNoon', [0.15, -0.1, 2.9], [0, -0.35, 0.0], 44, 1.4, [0, -0.6, 0.6], { st: { nicheGlow: 1 } }), // 10 cut-away + stone
    V('cemGold', [0.6, 0.6, 4.2], [0, 0.4, -1], 44, 1.0, [0, 0.2, 0], { st: { nicheGlow: 1 } }), // 11 grave golden
    V('cemGold', [1.0, 2.2, 7], [-1, 2.4, -12], 46, 0.8, [0, 0.6, -1]), // 12 cemetery wide
    V('blue', [0.4, 1.5, 2.6], [0.2, 1.1, -1.2], 46, 1.4, [0.2, 1.1, -1.0], { st: { stackT: 0.7 } }), // 13 blueprint
  ];
  API.tick(0);
  return API;
}
