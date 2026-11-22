// px_sets.js [PX-sets]: sets for "The Moon spacesuits were sewn by a bra company" (ILC, Dover, Delaware; Apollo A7L). Oddverra short.
// All original, no logos or brand marks (the company is named only in the narration).
//   moon      : July 1969 lunar surface: cratered grey regolith, rocks, a generic lander (gold-foil descent stage, legs, ladder, footpad),
//               the Earth low in a black sky, bootprints that appear as the astronaut steps off (setPrints).         origin (-124000,0,0)
//   lab       : 1960s test hall: tiled floor, panelled walls, a chalkboard listing what the suit must do (setChecks 0..3), three
//               suit stands for the 1965 trials (two stiff hard suits + the soft suit, setStand3), a scoreboard (setScore 0..3).
//               Moods 'lab', 'labTest'.                                                                              (-124000,0,800)
//   factory   : the sewing floor: rows of sewing machines (animated needles + hand wheels), dress forms with bras and girdles, fabric
//               bolts, hanging lamps, a big wall calendar (setCal: weeks left), the hero soft suit on a stand whose 21 layers fan
//               out (setLayers), a close-up machine sewing a seam (setStitch) next to a tiny ruler. Moods 'factory',
//               'factoryNight' (six-week crunch), 'factoryLamp' (lamp-lit sewing).                                  (-126500,0,0)
//   office    : 1965 manager's office at dusk: desk, phone, lamp, letter, filing cabinets, window, calendar. Mood 'office'. (-126500,0,800)
//   blueprint : night-blue cutaway void with a glowing grid: the soft suit (arm bends on accordion joints, setBend) beside a dress
//               form whose girdle squeezes (setSqueeze). Mood 'blueprint'.                                              (-126500,0,1600)
// The soft suit (makeSuit) is the motif: on the stand, in the trials, in the cutaway, in the sewing room. Test flag ?pxview=N.
import { H, TAU, clamp01, sm, SERIF, SANS, cyl, sph, plane, planeUV, mesh, nond, lumpGeo, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh, cached } from './doh_kit.js';
import { Kit } from './world.js';

export const PX_ORIGIN = { moon: [-124000, 0, 0], lab: [-124000, 0, 800], factory: [-126500, 0, 0], office: [-126500, 0, 800], blueprint: [-126500, 0, 1600] };
const GROUP_OF = { moon: 'moon', moonLow: 'moon', lab: 'lab', labTest: 'lab', factory: 'factory', factoryNight: 'factory', factoryLamp: 'factory', office: 'office', blueprint: 'blueprint' };
export const MOON = { LX: 2.6, LZ: -7.0 }; // lander centre (ladder faces +z)
let THREE, PT, M;

// ---------------------------------------------------------------- moon height field
const CR = [[-6, -14, 3.5], [8, -22, 5], [-14, -30, 6], [3.5, 1.5, 1.4], [-3.5, 3, 1.2], [12, -6, 2.5], [-20, -12, 4], [20, -40, 9], [-2.5, -2.5, 0.9]];
export const moonH = (x, z) => { let y = 0.12 * Math.sin(x * 0.3) * Math.cos(z * 0.25) + 0.06 * Math.sin(x * 1.1 + z * 0.7); for (const [cx, cz, r] of CR) { const d = Math.hypot(x - cx, z - cz) / r; if (d < 1.4) y += d < 1 ? -0.35 * r * 0.25 * (1 - d * d) : 0.12 * r * 0.25 * Math.sin((d - 1) / 0.4 * Math.PI); }
  if (Math.hypot(x - MOON.LX, z - MOON.LZ) < 5) y *= sm(2.5, 5, Math.hypot(x - MOON.LX, z - MOON.LZ)); return y + (z < -60 ? 2 * sm(-60, -120, z) * (1 + Math.sin(x * 0.05)) : 0); };

// ---------------------------------------------------------------- painters
function regTex(g, w, h) { g.fillStyle = '#9a9a9e'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.82 + 0.3 * PT.fbm(u, v, 12, 12, 4, 5)); grain(g, w, h, 'rgba(40,40,50,1)', 2500, 3, 0.35); grain(g, w, h, 'rgba(230,230,235,1)', 1200, 7, 0.3); }
function earthTex(g, w, h) { g.clearRect(0, 0, w, h); const c = w / 2, r = w * 0.42; const gl = g.createRadialGradient(c, c, r * 0.95, c, c, w / 2); gl.addColorStop(0, 'rgba(120,170,255,0.6)'); gl.addColorStop(1, 'rgba(120,170,255,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
  g.save(); g.beginPath(); g.arc(c, c, r, 0, TAU); g.clip(); g.fillStyle = '#2a6ad0'; g.fillRect(0, 0, w, h); const R = PT.rng(4); g.fillStyle = '#4aa05a'; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(c + (R() - 0.5) * r * 1.4, c + (R() - 0.5) * r * 1.4, r * (0.15 + R() * 0.25), r * (0.1 + R() * 0.2), R() * 3, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 10; i++) { g.beginPath(); g.ellipse(c + (R() - 0.5) * r * 1.6, c + (R() - 0.5) * r * 1.6, r * (0.2 + R() * 0.3), r * 0.05, R() * 0.6, 0, TAU); g.fill(); }
  const sh = g.createLinearGradient(c - r, 0, c + r, 0); sh.addColorStop(0, 'rgba(0,0,10,0)'); sh.addColorStop(0.55, 'rgba(0,0,10,0)'); sh.addColorStop(0.8, 'rgba(0,0,10,0.85)'); g.fillStyle = sh; g.fillRect(0, 0, w, h); g.restore();
  g.lineWidth = 5; g.strokeStyle = '#2b1d4a'; g.beginPath(); g.arc(c, c, r, 0, TAU); g.stroke(); }
function foilTex(g, w, h) { g.fillStyle = '#d8a838'; g.fillRect(0, 0, w, h); const R = PT.rng(9); for (let i = 0; i < 260; i++) { const x = R() * w, y = R() * h, s = 10 + R() * 40; g.fillStyle = R() < 0.5 ? `rgba(255,240,170,${0.2 + R() * 0.4})` : `rgba(120,70,10,${0.15 + R() * 0.3})`; g.beginPath(); g.moveTo(x, y); g.lineTo(x + s, y + R() * 10); g.lineTo(x + s * 0.6, y + s * 0.7); g.closePath(); g.fill(); } }
function flagTex(g, w, h) { for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#f6f2ea' : '#c8302c'; g.fillRect(0, i * h / 13, w, h / 13 + 1); } g.fillStyle = '#2a3a8a'; g.fillRect(0, 0, w * 0.42, h * 7 / 13); g.fillStyle = '#f6f2ea'; for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { g.beginPath(); g.arc(w * 0.035 + c * w * 0.068, h * 0.05 + r * h * 0.1, 3.4, 0, TAU); g.fill(); } }
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#f2e8cc'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.92 + 0.1 * PT.fbm(u, v, 6, 2, 3, 7)); if (o.rim !== false) { g.strokeStyle = o.rim || '#3a2414'; g.lineWidth = h * 0.05; g.strokeRect(h * 0.05, h * 0.05, w - h * 0.1, h - h * 0.1); }
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : (0.5 - (lines.length - 1) * 0.17) + i * 0.34), w * 0.86, h * (lines.length === 1 ? 0.5 : 0.28), { col: o.col || '#3a2414', font: o.font || SANS })); }; }
function chalkTex(n) { return (g, w, h) => { g.fillStyle = '#24382e'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.85 + 0.3 * PT.fbm(u, v, 6, 3, 3, 8)); g.globalAlpha = 0.1; g.fillStyle = '#fff'; for (let i = 0; i < 5; i++) g.fillRect(w * (0.05 + i * 0.2), h * 0.08, w * 0.14, h * 0.8); g.globalAlpha = 1;
  const C = 'rgba(244,244,232,0.94)'; txt(g, 'THE SUIT MUST:', w * 0.5, h * 0.13, w * 0.8, h * 0.13, { col: 'rgba(255,236,170,0.95)', font: SANS });
  ['HOLD AIR', 'BLOCK HEAT', 'BEND!'].forEach((s, i) => { const y = h * (0.37 + i * 0.22); g.strokeStyle = C; g.lineWidth = 5; g.strokeRect(w * 0.14, y - h * 0.07, h * 0.14, h * 0.14); txt(g, s, w * 0.56, y, w * 0.6, h * 0.14, { col: C, font: SANS });
    if (i < n) { g.strokeStyle = '#ffd838'; g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.moveTo(w * 0.15, y); g.lineTo(w * 0.15 + h * 0.06, y + h * 0.065); g.lineTo(w * 0.15 + h * 0.2, y - h * 0.1); g.stroke(); } }); }; }
function scoreTex(n) { return (g, w, h) => { g.fillStyle = '#1e2436'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c8a050'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16); txt(g, '1965 SUIT TRIALS', w / 2, h * 0.17, w * 0.8, h * 0.15, { col: '#ffd890', font: SANS });
  ['SUIT A', 'SUIT B', 'SUIT C'].forEach((s, i) => { const x = w * (0.2 + i * 0.3); txt(g, s, x, h * 0.42, w * 0.25, h * 0.12, { col: '#e8ecf4', font: SANS }); const on = n > i;
    if (on && i < 2) { g.strokeStyle = '#ff5a4a'; g.lineWidth = 14; g.lineCap = 'round'; for (const s2 of [-1, 1]) { g.beginPath(); g.moveTo(x - h * 0.13, h * 0.58); g.lineTo(x + h * 0.13, h * 0.84); g.stroke(); g.beginPath(); g.moveTo(x + h * 0.13 * s2, h * 0.58); g.lineTo(x - h * 0.13 * s2, h * 0.84); g.stroke(); } }
    if (on && i === 2) { g.strokeStyle = '#5ae07a'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - h * 0.14, h * 0.71); g.lineTo(x - h * 0.03, h * 0.84); g.lineTo(x + h * 0.16, h * 0.56); g.stroke(); } }); }; }
function calTex(wk) { return (g, w, h) => { g.fillStyle = '#f6f2e8'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8302c'; g.fillRect(0, 0, w, h * 0.24); txt(g, '1965', w / 2, h * 0.12, w * 0.6, h * 0.16, { col: '#fff4e8', font: SANS });
  txt(g, String(wk), w / 2, h * 0.55, w * 0.7, h * 0.5, { col: wk <= 1 ? '#c8302c' : '#2a2a3a', font: SANS }); txt(g, wk === 1 ? 'WEEK LEFT' : 'WEEKS LEFT', w / 2, h * 0.88, w * 0.86, h * 0.12, { col: '#5a4a4a', font: SANS });
  g.fillStyle = '#5a5a62'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(w * (0.12 + i * 0.152), h * 0.03, 5, 0, TAU); g.fill(); } }; }
function rulerTex(g, w, h) { g.fillStyle = '#f2d050'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a2018'; for (let i = 0; i <= 64; i++) { const x = 8 + i * (w - 16) / 64, L = i % 16 === 0 ? 0.6 : i % 8 === 0 ? 0.45 : i % 4 === 0 ? 0.32 : 0.18; g.lineWidth = i % 16 === 0 ? 3 : 1.5; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h * L); g.stroke(); }
  txt(g, '1 INCH', w * 0.5, h * 0.8, w * 0.3, h * 0.26, { col: '#2a2018', font: SANS }); }
function floorTex(o) { return (g, w, h) => { g.fillStyle = o.base; g.fillRect(0, 0, w, h); if (o.tile) { g.strokeStyle = o.tile; g.lineWidth = 3; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * w / 8, 0); g.lineTo(i * w / 8, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 8); g.lineTo(w, i * h / 8); g.stroke(); }
  if (o.check) { g.fillStyle = o.check; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2) g.fillRect(c * w / 8, r * h / 8, w / 8, h / 8); } } PT.modulate(g, w, h, (u, v) => 0.86 + 0.22 * PT.fbm(u, v, 6, 6, 4, o.seed || 3)); }; }
function gridTex(g, w, h) { g.fillStyle = '#0e1838'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(90,170,255,0.55)'; g.lineWidth = 2; for (let i = 0; i <= 16; i++) { g.beginPath(); g.moveTo(i * w / 16, 0); g.lineTo(i * w / 16, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 16); g.lineTo(w, i * h / 16); g.stroke(); }
  g.strokeStyle = 'rgba(140,210,255,0.85)'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4); }
function letterTex(g, w, h) { g.fillStyle = '#f6f2e6'; g.fillRect(0, 0, w, h); txt(g, 'NOTICE', w / 2, h * 0.12, w * 0.7, h * 0.08, { col: '#2a2a3a', font: SERIF }); g.fillStyle = 'rgba(60,60,80,0.55)'; for (let i = 0; i < 9; i++) g.fillRect(w * 0.1, h * (0.24 + i * 0.06), w * (i % 4 === 3 ? 0.5 : 0.8), 4);
  g.save(); g.translate(w * 0.5, h * 0.82); g.rotate(-0.18); g.strokeStyle = '#c8302c'; g.lineWidth = 7; g.strokeRect(-w * 0.38, -h * 0.07, w * 0.76, h * 0.14); txt(g, 'CANCELLED', 0, 2, w * 0.68, h * 0.09, { col: '#c8302c', font: SANS }); g.restore(); }
function windowTex(dusk) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); if (dusk) { gr.addColorStop(0, '#3a3a8a'); gr.addColorStop(0.6, '#e88a6a'); gr.addColorStop(1, '#f4c890'); } else { gr.addColorStop(0, '#8ab8e8'); gr.addColorStop(1, '#e0f0ff'); } g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const R = PT.rng(dusk ? 3 : 4); g.fillStyle = dusk ? '#2a2440' : '#7a8a9a'; for (let i = 0; i < 14; i++) { const x = i * w / 14, bh = h * (0.12 + R() * 0.28); g.fillRect(x, h - bh, w / 14 - 3, bh); if (dusk) { g.fillStyle = '#ffd890'; for (let k = 0; k < 4; k++) if (R() < 0.5) g.fillRect(x + 4 + (k % 2) * 10, h - bh + 8 + Math.floor(k / 2) * 14, 5, 7); g.fillStyle = '#2a2440'; } } }; }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.reg = toon({ map: T(512, 512, regTex, [1 / 6, 1 / 6]), vertexColors: true, emissive: 0x0a0a10 }); m.rock = vc(); if (H.MACRO) H.MACRO(m.rock, 0.18, 0.05);
  m.earth = new THREE.MeshBasicMaterial({ map: T(512, 512, earthTex), transparent: true, depthWrite: false, fog: false }); m.earth.color.setScalar(1.15);
  m.foil = vc({ map: T(256, 256, foilTex), emissive: 0x3a2408 }); m.flag = em(T(256, 160, flagTex), 0x202020, { side: THREE.DoubleSide });
  m.suit = vc({ emissive: 0x30323c }); m.ring = vc({ emissive: 0x101014 }); m.glass = toon({ color: 0xcfe4f4, transparent: true, opacity: 0.32, depthWrite: false, emissive: 0x18283a }); m.visor = toon({ color: 0xe8b040, transparent: true, opacity: 0.55, depthWrite: false, emissive: 0x4a3008 });
  m.hard = vc({ emissive: 0x0c0c12 });
  m.tile = vc({ map: T(512, 512, floorTex({ base: '#c8ccc4', tile: '#8a9088', check: 'rgba(60,80,110,0.18)', seed: 4 })) }); m.panel = vc({ map: T(256, 256, (g, w, h) => PT.siding(g, w, h, { base: '#a8b8c8' })) });
  m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#9a6a44', n: 8, seed: 61 })) }); m.floorW = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#a07850', n: 10, seed: 64 })) });
  m.wall = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#e8b8b0'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.14 * PT.fbm(u, v, 4, 4, 3, 9)); }) });
  m.cloth = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#ffffff' })) });
  m.chalk = [0, 1, 2, 3].map((n) => em(T(768, 512, chalkTex(n)), 0x101810)); m.score = [0, 1, 2, 3].map((n) => em(T(768, 384, scoreTex(n)), 0x303040));
  m.cal = [6, 5, 4, 3, 2, 1, 0].map((n) => em(T(256, 320, calTex(n)), 0x2a2a2a));
  m.ruler = em(T(1024, 96, rulerTex), 0x302810); m.letter = em(T(256, 340, letterTex), 0x303030);
  m.signSew = em(T(1024, 160, signTex(['SEWING DEPT.  -  BRAS & GIRDLES'], { bg: '#f6ecd8', col: '#a8304a', rim: '#a8304a' })), 0x303030);
  m.signDover = em(T(512, 160, signTex(['DOVER, DEL.'], { bg: '#2a4a7a', col: '#ffe8a8', rim: '#ffe8a8' })), 0x202020);
  m.signLab = em(T(1024, 160, signTex(['SPACESUIT TEST HALL'], { bg: '#e8ecf0', col: '#2a3a6a', rim: '#2a3a6a' })), 0x303030);
  m.signNeed = em(T(512, 160, signTex(['NOW HIRING:', 'A MOON SUIT'], { bg: '#ffe0a0', col: '#7a2a1a', rim: '#7a2a1a' })), 0x303030);
  m.calOff = em(T(256, 320, (g, w, h) => { calTex(0)(g, w, h); g.fillStyle = '#f6f2e8'; g.fillRect(0, h * 0.26, w, h * 0.74); txt(g, 'FEB', w / 2, h * 0.5, w * 0.7, h * 0.3, { col: '#2a2a3a', font: SANS }); g.strokeStyle = '#c8302c'; g.lineWidth = 6; g.beginPath(); g.arc(w * 0.5, h * 0.8, 26, 0, TAU); g.stroke(); txt(g, '1965', w / 2, h * 0.8, w * 0.4, h * 0.1, { col: '#2a2a3a', font: SANS }); }), 0x2a2a2a);
  m.winDay = m.basic(T(512, 256, windowTex(false)), 1.15); m.winDusk = m.basic(T(512, 256, windowTex(true)), 1.15); m.winNight = new THREE.MeshBasicMaterial({ color: 0x1a2250, fog: false });
  m.grid = toon({ map: T(512, 512, gridTex, [1 / 2, 1 / 2]), emissive: 0x2a4a8a }); m.grid.emissiveMap = m.grid.map; m.line = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x7ac8ff).multiplyScalar(1.4), fog: false });
  m.lampOn = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe0a0).multiplyScalar(1.6), fog: false });
  return m; }

const tintM = (m, hex) => { m.geometry = m.geometry.clone(); /* own copy: cached geometries are shared */ const c = new THREE.Color(hex), a = m.geometry.attributes.position.count, arr = new Float32Array(a * 3); for (let i = 0; i < a; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; } m.geometry.setAttribute('color', new THREE.Float32BufferAttribute(arr, 3)); return m; };

// ---------------------------------------------------------------- the soft suit ('soft') and the stiff rival suits ('hard', 'hard2')
// Origin at the feet, ~1.85 tall, facing +z. pose({ aL, aR, bL, bR, lift, jit, f }): arm raise (sideways, rad), elbow bend (rad),
// whole-body bob; the soft suit's elbows/knees are accordion convolutes (a chain of rings that fans as it bends).
// layers(t): 21 layer swatches fan out of the chest (soft suit only).
const LAYER_COLS = [0x4aa0e8, 0xf4f4f0, 0x2a3a6a, 0xe8e8e0, 0x9aa8c0, 0xd8a040, 0xb0b8c8, 0xd8a040, 0xb0b8c8, 0xd8a040, 0xb0b8c8, 0xd8a040, 0xb0b8c8, 0xd8a040, 0xb0b8c8, 0xd8a040, 0x5ab0a8, 0x8a90a0, 0xf4f2ea, 0xe8ecf0, 0xffffff];
export function makeSuit(kind = 'soft') { const G = new THREE.Group(), soft = kind === 'soft', W = soft ? 0xf6f6f2 : kind === 'hard' ? 0x9aa0aa : 0xc8b890, Wd = soft ? 0xd8dce4 : kind === 'hard' ? 0x6a707a : 0x9a8a64, mat = soft ? M.suit : M.hard;
  const body = new THREE.Group(); G.add(body); const add = (p, geo, m, x, y, z, rx = 0, ry = 0, rz = 0, c = W) => tintM(mesh(p, geo, m, x, y, z, rx, ry, rz), c);
  // torso
  if (soft) { const prof = [[0.001, 0.86], [0.17, 0.88], [0.2, 0.98], [0.21, 1.2], [0.23, 1.38], [0.19, 1.5], [0.08, 1.54], [0.001, 1.54]].map(([r, y]) => new THREE.Vector2(r, y)); add(body, cached('pxTorso', () => new THREE.LatheGeometry(prof, 20)), mat, 0, 0, 0);
    add(body, new THREE.BoxGeometry(0.26, 0.15, 0.08), mat, 0, 1.24, 0.2, -0.1, 0, 0, 0xd8dce4); for (const [x, c] of [[-0.08, 0xc0302c], [0, 0x2a6ad0], [0.08, 0xe8b838]]) add(body, sph(0.022, 8, 6), M.paint, x, 1.25, 0.25, 0, 0, 0, c);
    for (const s of [-1, 1]) add(body, cyl(0.035, 0.035, 0.05, 10), M.ring, s * 0.1, 1.08, 0.2, Math.PI / 2, 0, 0, s < 0 ? 0xc0302c : 0x2a6ad0);
    for (const y of [0.92, 1.02]) add(body, new THREE.TorusGeometry(0.205, 0.016, 6, 28), M.ring, 0, y, 0, Math.PI / 2, 0, 0, 0xc8ccd6);
    add(body, new THREE.BoxGeometry(0.42, 0.5, 0.2), mat, 0, 1.22, -0.27, 0, 0, 0, 0xe8e8e4); add(body, new THREE.BoxGeometry(0.36, 0.1, 0.18), mat, 0, 1.52, -0.26, 0, 0, 0, 0xd0d4dc);
    add(body, new THREE.TorusGeometry(0.12, 0.03, 8, 24), M.ring, 0, 1.55, 0, Math.PI / 2, 0, 0, 0xc8ccd6);
    const helm = mesh(body, sph(0.19, 22, 16), M.glass, 0, 1.7, 0.01); helm.castShadow = false; const vis = mesh(body, new THREE.SphereGeometry(0.195, 22, 12, -Math.PI * 0.55, Math.PI * 1.1, 0.3, 0.9), M.visor, 0, 1.7, 0.01); vis.castShadow = false;
    add(body, sph(0.1, 12, 10), M.suit, 0, 1.66, -0.02, 0, 0, 0, 0x9aa4b4); }
  else { add(body, new THREE.BoxGeometry(0.46, 0.66, 0.36), mat, 0, 1.2, 0, 0, 0, 0, W); for (let i = 0; i < 4; i++) add(body, new THREE.BoxGeometry(0.48, 0.03, 0.38), M.hard, 0, 0.94 + i * 0.16, 0, 0, 0, 0, Wd);
    for (let i = 0; i < 6; i++) add(body, sph(0.016, 6, 4), M.chrome, -0.18 + i * 0.072, 1.47, 0.185, 0, 0, 0, 0xe8e8ec); add(body, new THREE.BoxGeometry(0.3, 0.3, 0.3), mat, 0, 1.68, 0, 0, 0, 0, Wd);
    const win = mesh(body, new THREE.BoxGeometry(0.16, 0.08, 0.02), M.glass, 0, 1.7, 0.155); win.castShadow = false; add(body, new THREE.BoxGeometry(0.34, 0.06, 0.34), M.hard, 0, 1.54, 0, 0, 0, 0, W);
    if (kind === 'hard') add(body, new THREE.ConeGeometry(0.05, 0.12, 6), M.chrome, 0, 1.89, 0, 0, 0, 0, 0xd8d8dc); else add(body, cyl(0.02, 0.02, 0.2, 6), M.chrome, 0.1, 1.92, 0, 0, 0, 0.3, 0xd8d8dc); }
  // limbs: a joint is a chain of N links; each link turns by bend/N
  const chain = (parent, n, gap, r, axis) => { const links = []; let p = parent; for (let i = 0; i < n; i++) { const l = new THREE.Group(); l.position.y = i ? -gap : 0; p.add(l); if (soft) add(l, new THREE.TorusGeometry(r, r * 0.3, 6, 18), M.ring, 0, -gap / 2, 0, Math.PI / 2, 0, 0, i % 2 ? 0xe8eaee : 0xd0d4dc); else add(l, cyl(r * 1.05, r * 1.05, gap, 10), M.hard, 0, -gap / 2, 0, 0, 0, 0, Wd); links.push(l); p = l; } return { links, end: p, axis }; };
  const limb = (x, y, len1, len2, r, n, foot) => { const root = new THREE.Group(); root.position.set(x, y, 0); body.add(root); const up = soft ? cyl(r, r * 0.95, len1, 12) : cyl(r * 1.15, r * 1.15, len1, 8); add(root, up, mat, 0, -len1 / 2, 0, 0, 0, 0, W);
    const j = new THREE.Group(); j.position.y = -len1; root.add(j); const ch = chain(j, n, soft ? 0.03 : 0.08 / n, r * 1.04, 'x'); const lo = new THREE.Group(); lo.position.y = -(soft ? 0.03 : 0.08 / n); ch.end.add(lo);
    add(lo, soft ? cyl(r * 0.95, r * 0.85, len2, 12) : cyl(r * 1.1, r * 1.1, len2, 8), mat, 0, -len2 / 2, 0, 0, 0, 0, W);
    if (foot) add(lo, new THREE.BoxGeometry(0.17, 0.11, 0.28), mat, 0, -len2 - 0.05, 0.05, 0, 0, 0, soft ? 0xe0e2e6 : Wd); else add(lo, soft ? sph(r * 1.05, 10, 8) : new THREE.BoxGeometry(r * 2, r * 2, r * 2), soft ? M.ring : M.hard, 0, -len2 - 0.04, 0, 0, 0, 0, soft ? 0x6a7a9a : Wd);
    return { root, links: ch.links }; };
  const arms = [-1, 1].map((s) => limb(s * (soft ? 0.27 : 0.3), 1.44, 0.24, 0.24, 0.07, soft ? 6 : 2, false));
  const legs = [-1, 1].map((s) => limb(s * 0.11, 0.9, 0.36, 0.33, 0.085, soft ? 5 : 2, true));
  // layers fan (soft only)
  const fan = new THREE.Group(); body.add(fan); fan.position.set(0, 1.18, -0.42); const cards = soft ? LAYER_COLS.map((c, i) => { const k = tintM(mesh(fan, new THREE.BoxGeometry(0.13, 0.62, 0.01), M.cloth, 0, 0, 0), c); k.visible = false; return k; }) : [];
  const API = { G, body, arms, legs, cards,
    pose(p = {}) { const f = p.f || 0, jit = p.jit || 0; body.position.y = p.lift || 0; body.rotation.z = p.lean || 0;
      arms.forEach((a, i) => { const s = i ? 1 : -1, raise = (i ? p.aR : p.aL) || 0, bend = (i ? p.bR : p.bL) || 0; a.root.rotation.set(-(p.fwd || 0) * (i ? p.fR ?? 1 : p.fL ?? 1), 0, s * (0.12 + raise) + jit * Math.sin(f * 2.7 + i) * 0.04); a.links.forEach((l) => (l.rotation.x = -bend / a.links.length)); });
      legs.forEach((l, i) => { const k = (i ? p.kR : p.kL) || 0; l.root.rotation.x = (i ? p.hR : p.hL) || 0; l.links.forEach((q) => (q.rotation.x = k / l.links.length)); }); },
    layers(t) { cards.forEach((k, i) => { const u = clamp01(t * 23 - i * 1.0), e = 1 - (1 - clamp01(u)) ** 3; k.visible = u > 0; const a = -1.15 + 2.3 * i / 20; const r = 0.42 * e; k.position.set(Math.sin(a * e) * r, Math.cos(a * e) * r, -i * 0.004); k.rotation.set(0, 0, -a * e); k.scale.setScalar(0.3 + 0.7 * e); }); } };
  API.pose({}); G.traverse((o) => { if (o.isMesh && o.material.vertexColors && !o.geometry.attributes.color) tintM(o, 0xffffff); }); return API; }

// sewing machine (origin at the table top, facing +z): base, column, arm, head, hand wheel, needle bar (tick moves it)
function makeMachine(col = 0x2a2a32) { const G = new THREE.Group(), K = new Kit(); K.box(M.metal, -0.26, 0.26, 0, 0.05, -0.13, 0.13, col, 0.012); K.box(M.metal, 0.12, 0.24, 0.05, 0.3, -0.07, 0.07, col, 0.02); K.box(M.metal, -0.22, 0.24, 0.26, 0.36, -0.07, 0.07, col, 0.03);
  K.box(M.metal, -0.27, -0.17, 0.12, 0.36, -0.07, 0.07, col, 0.02); K.put(M.brass, cyl(0.012, 0.012, 0.42, 6), -0.03, 0.31, 0.072, Math.PI / 2, 0, Math.PI / 2, 1, 1, 1, 0xd8b050); K.box(M.chrome, -0.24, -0.2, 0.0, 0.05, 0.06, 0.1, 0xd0d0d8, 0.005); K.build(G);
  const wheel = tintM(mesh(G, cyl(0.08, 0.08, 0.035, 18), M.metal, 0.27, 0.27, 0, 0, 0, Math.PI / 2), 0x8a8a92); const spoke = tintM(mesh(wheel, new THREE.BoxGeometry(0.14, 0.04, 0.01), M.chrome, 0, 0.02, 0), 0xd8d8de);
  const needle = new THREE.Group(); needle.position.set(-0.22, 0.14, 0.02); G.add(needle); tintM(mesh(needle, cyl(0.008, 0.008, 0.12, 6), M.chrome, 0, 0, 0), 0xe8e8ee); tintM(mesh(needle, cyl(0.003, 0.003, 0.05, 4), M.chrome, 0, -0.08, 0), 0xffffff);
  G.traverse((o) => { if (o.isMesh && o.material.vertexColors && !o.geometry.attributes.color) tintM(o, 0xffffff); });
  return { G, wheel, needle, tick(f, rate = 1) { wheel.rotation.y = f * 0.5 * rate; needle.position.y = 0.14 + 0.03 * Math.sin(f * 1.3 * rate); } }; }
// dress form with a cartoon bra or girdle
function dressForm(K, x, z, ry, garment, col) { K.at(x, 0, z, ry, () => { K.put(M.wood, cyl(0.2, 0.22, 0.04, 14), 0, 0.02, 0, 0, 0, 0, 1, 1, 1, 0x5a3a24); K.beam(M.wood, [0, 0, 0], [0, 0.9, 0], 0.025, 0x5a3a24, true, 6);
  K.put(M.cloth, sph(1, 16, 12), 0, 1.22, 0, 0, 0, 0, 0.2, 0.36, 0.15, 0xe8dcc8); K.put(M.cloth, cyl(0.06, 0.06, 0.08, 10), 0, 1.6, 0, 0, 0, 0, 1, 1, 1, 0x5a3a24);
  if (garment === 'bra') { for (const s of [-1, 1]) K.put(M.cloth, new THREE.SphereGeometry(0.075, 12, 8, 0, TAU, 0, Math.PI / 2), s * 0.075, 1.32, 0.11, Math.PI / 2, 0, 0, 1, 1, 1, col); K.put(M.cloth, new THREE.TorusGeometry(0.17, 0.018, 6, 20), 0, 1.27, 0, Math.PI / 2, 0, 0, 1.05, 0.8, 1, col);
    for (const s of [-1, 1]) K.beam(M.cloth, [s * 0.075, 1.36, 0.1], [s * 0.1, 1.5, 0.03], 0.008, col); }
  else K.put(M.cloth, cyl(0.19, 0.2, 0.26, 18, true), 0, 1.04, 0, 0, 0, 0, 1, 1, 0.78, col); }); }

// ================================================================= MOON
function buildMoon(root) { const K = new Kit(), R = PT.rng(1969), glows = [];
  { const g = new THREE.PlaneGeometry(260, 220, 130, 110); g.rotateX(-Math.PI / 2); const p = g.attributes.position, c = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) - 60, y = moonH(x, z); p.setY(i, y); const v = 0.86 + 0.1 * Math.sin(x * 0.2 + z * 0.13); c.set([v, v, v * 1.02], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.computeVertexNormals(); const m = new THREE.Mesh(g, M.reg); m.position.set(0, 0, -60); m.receiveShadow = true; root.add(m); }
  for (let i = 0; i < 60; i++) { const x = (R() - 0.5) * 44, z = 6 - R() * 46; if (Math.hypot(x - MOON.LX, z - MOON.LZ) < 4.5) continue; const s = 0.08 + R() * 0.4; K.put(M.rock, lumpGeo(i % 9, 1, 0.3), x, moonH(x, z) + s * 0.25, z, R(), R(), R(), s * 1.3, s * 0.8, s, [0x8a8a8e, 0x7a7a80, 0x9a9a9c][i % 3]); }
  // lander (descent stage + legs + footpads + ladder + ascent stage); the ladder faces +z
  K.at(MOON.LX, 0, MOON.LZ, 0, () => { K.put(M.foil, cyl(1.8, 1.8, 1.5, 8), 0, 1.75, 0, 0, Math.PI / 8, 0, 1, 1, 1, 0xffffff);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, cx = Math.cos(a), sz = Math.sin(a); K.beam(M.chrome, [cx * 1.5, 2.2, sz * 1.5], [cx * 3.0, 0.25, sz * 3.0], 0.07, 0xd8d8dc, true, 6); K.beam(M.chrome, [cx * 1.6, 1.1, sz * 1.6], [cx * 2.9, 0.4, sz * 2.9], 0.05, 0xd8d8dc, true, 6); K.put(M.chrome, cyl(0.45, 0.5, 0.12, 14), cx * 3.05, 0.08, sz * 3.05, 0, 0, 0, 1, 1, 1, 0xd8d8dc); }
    K.beam(M.chrome, [0, 2.2, 1.5], [0, 0.25, 2.9], 0.07, 0xd8d8dc, true, 6); K.put(M.chrome, cyl(0.5, 0.55, 0.12, 14), 0, 0.08, 3.05, 0, 0, 0, 1, 1, 1, 0xd8d8dc);
    K.box(M.paint, -1.2, 1.2, 2.5, 4.3, -1.0, 1.1, 0xc8ccd2, 0.15); K.box(M.paint, -0.9, 0.9, 4.3, 4.9, -0.8, 0.6, 0xb8bcc4, 0.1); K.put(M.paint, cyl(0.45, 0.45, 0.2, 12), 0, 5.0, -0.1, 0, 0, 0, 1, 1, 1, 0x9aa0a8); K.box(M.paint, -0.4, 0.4, 2.6, 3.4, 1.08, 1.16, 0x1a1e2a, 0.02);
    K.box(M.paint, -0.6, 0.6, 2.42, 2.52, 1.0, 1.75, 0xd8d8dc, 0.02); K.beam(M.chrome, [0, 4.9, 0.3], [0.3, 5.9, 0.3], 0.03, 0xe8e8ec, true, 6); K.put(M.chrome, sph(0.25, 10, 6), 0.32, 6.0, 0.3, 0, 0, 0, 1, 0.3, 1, 0xe8e8ec);
    for (const s of [-1, 1]) K.beam(M.chrome, [s * 0.3, 0.45, 2.85], [s * 0.3, 2.4, 1.75], 0.035, 0xd8d8dc, true, 6); for (let k = 0; k < 7; k++) { const t = (k + 0.5) / 7; K.beam(M.chrome, [-0.3, 0.45 + t * 1.95, 2.85 - t * 1.1], [0.3, 0.45 + t * 1.95, 2.85 - t * 1.1], 0.022, 0xd8d8dc, true, 6); }
    for (const s of [-1, 1]) K.box(M.paint, s * 1.25, s * 1.25 + s * 0.06, 2.6, 3.8, -0.6, 0.8, 0x8a8e96, 0.02); });
  // bootprints (story: setPrints), the Earth, distant hills
  const prints = []; for (let i = 0; i < 8; i++) { const x = MOON.LX + (i % 2 ? 0.16 : -0.14) + i * 0.05, z = MOON.LZ + 3.6 + i * 0.42; const p = tintM(mesh(root, cached('pxboot', () => new THREE.BoxGeometry(0.15, 0.015, 0.32)), M.paint, x, moonH(x, z) + 0.006, z, 0, 0.05, 0, false), 0x5a5a60); p.visible = false; prints.push(p); }
  const earth = nond(mesh(root, plane(30, 30), M.earth, -40, 52, -300, 0, 0, 0, false)); earth.renderOrder = 2;
  K.build(root, 4); const dust = motes(root, 30, [MOON.LX - 2, MOON.LX + 2, 0.05, 0.8, MOON.LZ + 3, MOON.LZ + 6], 71, 0.012); return { glows, prints, earth, dust }; }

// ================================================================= LAB (1960s test hall)
function buildLab(root) { const K = new Kit(), X = 7, ZB = -5, HT = 4.6;
  K.box(M.tile, -X, X, -0.05, 0, ZB, 6, 0xffffff, 0.01); K.box(M.panel, -X, X, 0, HT, ZB - 0.2, ZB, 0xe0e8f0, 0.01); K.box(M.panel, -X - 0.2, -X, 0, HT, ZB, 6, 0xd8e0e8, 0.01); K.box(M.panel, X, X + 0.2, 0, HT, ZB, 6, 0xd8e0e8, 0.01);
  K.box(M.paint, -X, X, 0, 0.12, ZB, ZB + 0.04, 0x3a4a6a, 0.005); K.box(M.paint, -X, X, HT - 0.2, HT, ZB, 6, 0xc8ccd4, 0.01);
  for (let i = 0; i < 4; i++) { const x = -5.25 + i * 3.5; K.box(M.paint, x - 0.9, x + 0.9, HT - 0.24, HT - 0.2, -2.5, -1.9, 0xe8e8e8, 0.005); mesh(root, plane(1.7, 0.5), M.lampOn, x, HT - 0.245, -2.2, Math.PI / 2, 0, 0, false); }
  mesh(root, plane(4.4, 0.6), M.signLab, 0, 4.0, ZB + 0.03, 0, 0, 0, false);
  // chalkboard (left), stands (centre), scoreboard (above), judges' table (right front), equipment racks
  K.box(M.wood, -6.2, -2.8, 0.95, 3.0, ZB, ZB + 0.06, 0x6a4028, 0.01); const chalk = mesh(root, plane(3.2, 1.9), M.chalk[0], -4.5, 1.98, ZB + 0.07, 0, 0, 0, false); K.box(M.wood, -6.2, -2.8, 0.92, 1.0, ZB, ZB + 0.16, 0x6a4028, 0.01);
  const score = mesh(root, plane(3.6, 1.8), M.score[0], 1.6, 2.95, ZB + 0.04, 0, 0, 0, false); K.box(M.paint, -0.25, 3.45, 1.98, 3.92, ZB, ZB + 0.03, 0x2a2a3a, 0.01);
  const SX = [0.3, 1.6, 2.9]; for (const x of SX) { K.put(M.metal, cyl(0.55, 0.6, 0.22, 20), x, 0.11, -2.4, 0, 0, 0, 1, 1, 1, 0x4a5a7a); K.put(M.metal, cyl(0.6, 0.6, 0.02, 20), x, 0.23, -2.4, 0, 0, 0, 1, 1, 1, 0xd8b850);
    K.beam(M.chrome, [x, 0.22, -2.85], [x, 2.25, -2.85], 0.03, 0xc8ccd4, true, 6); K.beam(M.chrome, [x - 0.4, 2.25, -2.85], [x + 0.4, 2.25, -2.85], 0.025, 0xc8ccd4, true, 6); }
  K.at(5.2, 0, 1.2, -0.5, () => { K.box(M.wood, -1.0, 1.0, 0.72, 0.8, -0.4, 0.4, 0x8a5a38, 0.02); K.box(M.cloth, -1.02, 1.02, 0.4, 0.8, 0.38, 0.42, 0x2a4a8a, 0.01); for (const s of [-0.9, 0.9]) K.box(M.wood, s - 0.05, s + 0.05, 0, 0.72, -0.35, 0.35, 0x5a3a24, 0.01);
    for (let i = 0; i < 3; i++) K.box(M.paint, -0.7 + i * 0.55, -0.4 + i * 0.55, 0.8, 0.82, -0.15, 0.15, 0xf6f2e6, 0.005); K.put(M.paint, cyl(0.05, 0.05, 0.12, 10), 0.75, 0.86, 0.1, 0, 0, 0, 1, 1, 1, 0xe8e0d0); });
  for (const x of [-6.4, 6.4]) K.box(M.metal, x - 0.4, x + 0.4, 0, 2.2, -4.6, -3.8, 0x5a6a7a, 0.02); for (let i = 0; i < 10; i++) K.put(M.paint, sph(0.03, 6, 4), -6.6 + (i % 5) * 0.1, 1.2 + Math.floor(i / 5) * 0.3, -3.78, 0, 0, 0, 1, 1, 1, [0xff5a4a, 0x5ae07a, 0xffd838][i % 3]);
  K.box(M.metal, 5.4, 6.8, 0, 1.2, -4.8, -3.6, 0x7a8a9a, 0.02); K.put(M.metal, cyl(0.3, 0.3, 1.4, 14), 6.2, 1.9, -4.2, 0, 0, 0, 1, 1, 1, 0x8a9aaa); K.put(M.chrome, sph(0.12, 10, 8), 6.2, 2.7, -4.2, 0, 0, 0, 1, 1, 1, 0xd8d8dc);
  K.build(root, 20);
  const suits = [makeSuit('hard'), makeSuit('hard2'), makeSuit('soft')]; suits.forEach((s, i) => { s.G.position.set(SX[i], 0.24, -2.4); root.add(s.G); });
  const glows = [-5.25, -1.75, 1.75, 5.25].map((x) => glowAt(root, [x, HT - 0.4, -2.2], 2.2, '#f0f4ff', 0.25)); const dust = motes(root, 50, [-5, 5, 0.3, 3.6, -4, 2], 81, 0.012);
  return { chalk, score, suits, glows, dust, SX }; }

// ================================================================= FACTORY (the sewing floor)
function buildFactory(root) { const K = new Kit(), R = PT.rng(1965), X = 6.5, ZB = -4.6, HT = 4.0;
  K.box(M.floorW, -X, X, -0.05, 0, ZB, 6, 0xffffff, 0.01); K.box(M.wall, -X, X, 0, HT, ZB - 0.2, ZB, 0xffffff, 0.01); K.box(M.wall, -X - 0.2, -X, 0, HT, ZB, 6, 0xf0e0e0, 0.01); K.box(M.wall, X, X + 0.2, 0, HT, ZB, 6, 0xf0e0e0, 0.01);
  K.box(M.wood, -X, X, 0, 1.0, ZB, ZB + 0.05, 0x7a4a34, 0.01); K.box(M.wood, -X, X, 1.0, 1.06, ZB - 0.01, ZB + 0.08, 0x5a3424, 0.01); K.box(M.wood, -X, X, HT - 0.15, HT, ZB, 6, 0x6a4a34, 0.01);
  for (let i = 0; i < 5; i++) K.beam(M.wood, [-X, HT - 0.25, ZB + 0.4 + i * 2.2], [X, HT - 0.25, ZB + 0.4 + i * 2.2], 0.16, 0x6a4028);
  mesh(root, plane(5.6, 0.62), M.signSew, -0.4, 3.35, ZB + 0.03, 0, 0, 0, false); mesh(root, plane(1.3, 0.42), M.signDover, 4.6, 2.8, ZB + 0.03, 0, 0, 0, false);
  // windows (left wall)
  const wins = []; for (const z of [-2.6, 0.4, 3.2]) { K.box(M.wood, -X + 0.01, -X + 0.08, 1.2, 3.0, z - 1.05, z + 1.05, 0xf4ece0, 0.01); wins.push(mesh(root, plane(1.9, 1.6), M.winDay, -X + 0.09, 2.1, z, 0, Math.PI / 2, 0, false)); K.box(M.wood, -X + 0.02, -X + 0.12, 2.06, 2.14, z - 1.0, z + 1.0, 0xf4ece0, 0.005); K.box(M.wood, -X + 0.02, -X + 0.12, 1.25, 2.95, z - 0.04, z + 0.04, 0xf4ece0, 0.005); }
  // sewing tables in two rows; machine heads; chairs; fabric piles
  const machines = []; const TBL = [[-3.3, -2.4], [-1.1, -2.4], [1.1, -2.4], [-3.3, -0.6], [-1.1, -0.6], [1.1, -0.6]];
  for (const [x, z] of TBL) { K.box(M.wood, x - 0.7, x + 0.7, 0.72, 0.78, z - 0.38, z + 0.38, 0xa87a50, 0.015); for (const [a, b] of [[-0.62, -0.3], [0.62, -0.3], [-0.62, 0.3], [0.62, 0.3]]) K.box(M.metal, x + a - 0.03, x + a + 0.03, 0, 0.72, z + b - 0.03, z + b + 0.03, 0x3a3a42, 0.005);
    K.box(M.cloth, x - 0.5, x - 0.05, 0.78, 0.8, z - 0.05, z + 0.3, [0xf6c8d0, 0xf4e0c8, 0xffffff, 0xe8b0a8][(machines.length) % 4], 0.005); const mc = makeMachine([0x2a2a32, 0x3a2a4a, 0x2a3a3a][machines.length % 3]); mc.G.position.set(x + 0.42, 0.78, z + 0.05); mc.G.rotation.y = Math.PI + 0.5; root.add(mc.G); machines.push(mc); }
  // dress forms (left back), fabric bolts shelf (right back), the calendar, a pin-board
  dressForm(K, -5.4, -3.6, 0.3, 'bra', 0xf08aa0); dressForm(K, -4.6, -3.9, 0.1, 'girdle', 0xf4c8a8); dressForm(K, -5.6, -2.3, 0.6, 'girdle', 0xe8a0b8); dressForm(K, -3.9, -4.0, -0.1, 'bra', 0xf6e6ea);
  K.box(M.wood, 2.9, 5.6, 0, 2.2, -4.55, -4.0, 0x7a5034, 0.02); for (let s = 0; s < 3; s++) { K.box(M.wood, 2.95, 5.55, 0.05 + s * 0.72, 0.1 + s * 0.72, -4.5, -4.0, 0x5a3424, 0.005); for (let b = 0; b < 6; b++) K.put(M.cloth, cyl(0.1, 0.1, 0.44, 12), 3.15 + b * 0.4, 0.22 + s * 0.72, -4.25, Math.PI / 2, 0, 0, 1, 1, 1, [0xf4f4f0, 0x8ac8f0, 0xe8d8a8, 0xc8ccd4, 0xf08aa0, 0x3a4a6a][(b + s * 2) % 6]); }
  const cal = mesh(root, plane(0.8, 1.0), M.cal[0], 1.4, 2.1, ZB + 0.04, 0, 0, 0, false); K.box(M.wood, 0.98, 1.82, 1.58, 2.62, ZB, ZB + 0.03, 0x5a3424, 0.005);
  K.box(M.cloth, -2.2, -0.6, 1.5, 2.6, ZB, ZB + 0.03, 0xc8a070, 0.005); for (let i = 0; i < 8; i++) K.box(M.paint, -2.1 + (i % 4) * 0.38, -1.8 + (i % 4) * 0.38, 1.65 + Math.floor(i / 4) * 0.5, 2.0 + Math.floor(i / 4) * 0.5, ZB + 0.03, ZB + 0.04, [0xf6f2e6, 0xf8e0a0, 0xd8e8f8][i % 3], 0.002);
  for (let i = 0; i < 30; i++) K.put(M.cloth, new THREE.TorusGeometry(0.05, 0.008, 4, 10, Math.PI * 1.2), (R() - 0.5) * 9, 0.01, -3 + R() * 4.5, Math.PI / 2, R() * 6, 0, 1, 1, 1, [0xf08aa0, 0xffffff, 0x8ac8f0][i % 3]);
  // the close-up machine (front centre) with fabric, stitch line and ruler
  K.box(M.wood, -0.75, 0.75, 0.72, 0.78, 0.7, 1.4, 0xa87a50, 0.015); for (const [a, b] of [[-0.68, 0.76], [0.68, 0.76], [-0.68, 1.34], [0.68, 1.34]]) K.box(M.metal, a - 0.03, a + 0.03, 0, 0.72, b - 0.03, b + 0.03, 0x3a3a42, 0.005);
  K.build(root, 24);
  const hero = makeMachine(0x4a8a7a); hero.G.position.set(0.12, 0.78, 1.05); root.add(hero.G);
  const fabric = tintM(mesh(root, new THREE.BoxGeometry(0.62, 0.006, 0.5), M.cloth, -0.12, 0.833, 1.05), 0xf6f6f2); fabric.receiveShadow = true;
  const ruler = mesh(root, new THREE.BoxGeometry(0.5, 0.004, 0.05), M.ruler, -0.12, 0.79, 1.36); const stitches = []; for (let i = 0; i < 40; i++) { const s = tintM(mesh(root, new THREE.BoxGeometry(0.009, 0.003, 0.003), M.paint, 0, 0.838, 1.07, 0, 0, 0, false), 0x2a4a9a); s.visible = false; stitches.push(s); }
  const bad = tintM(mesh(root, new THREE.BoxGeometry(0.016, 0.004, 0.006), M.paint, 0, 0.839, 1.08, 0, 0, 0.5, false), 0xe02a2a); bad.visible = false;
  // the hero soft suit on its stand (right)
  K.box(M.metal, 2.1, 3.3, 0, 0.12, -2.0, -0.8, 0x4a4a5a, 0.02); const suit = makeSuit('soft'); suit.G.position.set(2.7, 0.12, -1.4); suit.G.rotation.y = -0.35; root.add(suit.G);
  const lampPos = [[-3.3, -2.4], [-1.1, -2.4], [1.1, -2.4], [-2.2, -0.6], [0.0, 0.9], [3.6, -0.2]]; const lamps = [];
  for (const [x, z] of lampPos) { const k = new Kit(); k.beam(M.metal, [x, HT, z], [x, 2.6, z], 0.01, 0x2a2a30, true, 4); k.put(M.metal, new THREE.ConeGeometry(0.26, 0.2, 14, 1, true), x, 2.5, z, 0, 0, 0, 1, 1, 1, 0x3a5a4a); k.build(root); const b = nond(mesh(root, sph(0.06, 8, 6), M.lampOn, x, 2.43, z, 0, 0, 0, false)); lamps.push(glowAt(root, [x, 2.38, z], 1.0, '#ffd890', 0)); }
  const shaft = shaftAt(root, [-4.6, 1.6, 0.4], 2.6, 4.4, Math.PI / 2 - 0.5, 0.55, 0.18, 0xfff0d8); const dust = motes(root, 70, [-5, 4, 0.4, 3.4, -3.6, 2.2], 91, 0.012);
  return { machines, hero, fabric, stitches, bad, ruler, suit, cal, lamps, shaft, dust, wins }; }

// ================================================================= OFFICE (1965, dusk)
function buildOffice(root) { const K = new Kit(), X = 4.2, ZB = -3.2, HT = 3.2;
  K.box(M.paint, -X, X, -0.05, 0, ZB, 4, 0x5a6a5a, 0.01); K.box(M.wood, -X, X, 0, HT, ZB - 0.2, ZB, 0xb88a60, 0.01); K.box(M.wood, -X - 0.2, -X, 0, HT, ZB, 4, 0xa87a54, 0.01); K.box(M.wood, X, X + 0.2, 0, HT, ZB, 4, 0xa87a54, 0.01);
  const win = mesh(root, plane(2.6, 1.5), M.winDusk, 0.6, 1.9, ZB + 0.02, 0, 0, 0, false); K.box(M.paint, -0.75, 1.95, 1.08, 1.14, ZB, ZB + 0.14, 0xf4ece0, 0.005); K.box(M.paint, 0.57, 0.63, 1.1, 2.7, ZB, ZB + 0.05, 0xf4ece0, 0.005); K.box(M.paint, -0.75, 1.95, 2.64, 2.7, ZB, ZB + 0.05, 0xf4ece0, 0.005);
  for (const s of [-1, 1]) K.box(M.cloth, 0.6 + s * 1.5 - 0.22, 0.6 + s * 1.5 + 0.22, 0.9, 2.9, ZB + 0.05, ZB + 0.15, 0x6a3a4a, 0.03);
  mesh(root, plane(0.6, 0.75), M.calOff, -2.6, 2.0, ZB + 0.03, 0, 0, 0, false);
  K.at(0, 0, -1.2, 0, () => { K.box(M.wood, -1.2, 1.2, 0.74, 0.82, -0.5, 0.5, 0x6a3a22, 0.02); K.box(M.wood, -1.15, -0.4, 0, 0.74, -0.45, 0.45, 0x5a3020, 0.02); K.box(M.wood, 0.4, 1.15, 0, 0.74, -0.45, 0.45, 0x5a3020, 0.02);
    K.box(M.paint, 0.55, 0.85, 0.82, 0.9, -0.15, 0.1, 0x1a1a22, 0.02); K.put(M.paint, cyl(0.03, 0.03, 0.28, 8), 0.7, 0.94, -0.02, 0, 0, Math.PI / 2, 1, 1, 1, 0x1a1a22); K.put(M.brass, cyl(0.08, 0.1, 0.04, 12), -0.85, 0.84, -0.2, 0, 0, 0, 1, 1, 1, 0xc8a050);
    K.beam(M.brass, [-0.85, 0.84, -0.2], [-0.8, 1.2, -0.25], 0.012, 0xc8a050, true, 6); K.put(M.paint, new THREE.ConeGeometry(0.14, 0.14, 12, 1, true), -0.78, 1.24, -0.22, 0, 0, 0, 1, 1, 1, 0x2a5a3a);
    for (let i = 0; i < 4; i++) K.box(M.paint, -0.5 + i * 0.03, -0.1 + i * 0.03, 0.82 + i * 0.012, 0.832 + i * 0.012, -0.3, 0.0, 0xf6f2e6, 0.003); });
  for (const x of [-3.6, -2.9]) { K.box(M.metal, x - 0.32, x + 0.32, 0, 1.4, ZB + 0.05, ZB + 0.65, 0x6a7a6a, 0.02); for (let d = 0; d < 3; d++) K.box(M.chrome, x - 0.08, x + 0.08, 0.3 + d * 0.42, 0.35 + d * 0.42, ZB + 0.65, ZB + 0.68, 0xd8d8dc, 0.005); }
  K.put(M.paint, cyl(0.22, 0.22, 0.04, 20), 2.8, 2.3, ZB + 0.02, Math.PI / 2, 0, 0, 1, 1, 1, 0xf2ead6); K.box(M.paint, 2.79, 2.81, 2.3, 2.45, ZB + 0.05, ZB + 0.06, 0x2a2a30, 0.002);
  K.at(3.2, 0, -2.2, -0.6, () => { K.put(M.paint, cyl(0.2, 0.15, 0.4, 12), 0, 0.2, 0, 0, 0, 0, 1, 1, 1, 0xc86a3a); for (let i = 0; i < 6; i++) K.put(M.paint, sph(0.2, 10, 8), Math.cos(i * 1.1) * 0.14, 0.55 + i * 0.09, Math.sin(i * 1.1) * 0.14, 0, 0, 0, 1, 1.3, 1, 0x4a8a3a); });
  K.build(root, 10);
  const letter = mesh(root, plane(0.32, 0.42), M.letter, -0.15, 0.845, -0.95, -Math.PI / 2, 0, 0.12, false);
  const lampG = glowAt(root, [-0.78, 1.18, -1.42], 1.0, '#ffd890', 0.5); const dust = motes(root, 30, [-2, 2, 0.4, 2.6, -2.5, 1], 101, 0.01);
  return { letter, lampG, dust, win }; }

// ================================================================= BLUEPRINT (cutaway void)
function buildBlueprint(root) { const K = new Kit();
  mesh(root, planeUV(40, 40, 10, 10), M.grid, 0, 0, -6, -Math.PI / 2, 0, 0, false);
  const back = mesh(root, planeUV(40, 16, 10, 4), M.grid, 0, 8, -12, 0, 0, 0, false);
  for (const [x, z] of [[-0.65, -1.2], [0.6, -1.2]]) { K.put(M.metal, cyl(0.5, 0.54, 0.12, 28), x, 0.06, z, 0, 0, 0, 1, 1, 1, 0x1a2a5a); const r = nond(mesh(root, new THREE.TorusGeometry(0.52, 0.012, 4, 48), M.line, x, 0.125, z, Math.PI / 2, 0, 0, false)); }
  for (let i = 0; i < 6; i++) { const r = nond(mesh(root, new THREE.TorusGeometry(2.2 + i * 1.6, 0.01, 4, 64), M.line, -0.1, 0.01, -1.2, Math.PI / 2, 0, 0, false)); r.material = M.line.clone(); r.material.transparent = true; r.material.opacity = 0.5 - i * 0.07; }
  K.build(root, 4);
  const suit = makeSuit('soft'); suit.G.position.set(0.6, 0.12, -1.2); suit.G.rotation.y = -0.25; root.add(suit.G);
  const form = new THREE.Group(); form.position.set(-0.65, 0.12, -1.2); form.rotation.y = 0.3; root.add(form); { const k = new Kit(); dressForm(k, 0, 0, 0, 'girdle', 0xf4b8c8); k.build(form); }
  const bands = []; for (let i = 0; i < 4; i++) { const b = tintM(mesh(form, new THREE.TorusGeometry(0.205, 0.014, 6, 30), M.ring, 0, 0.94 + i * 0.07, 0, Math.PI / 2, 0, 0), 0xe0709a); b.scale.set(1, 0.78, 1); bands.push(b); }
  // a "squeeze" arrow pair (cones) each side of the girdle
  const arrows = [-1, 1].map((s) => { const a = tintM(mesh(form, new THREE.ConeGeometry(0.06, 0.16, 10), M.line, s * 0.42, 1.04, 0, 0, 0, s * Math.PI / 2, false), 0xffffff); a.material = M.line; return a; });
  const glows = [glowAt(root, [-0.1, 2.6, -2.6], 6, '#5aa0ff', 0.2)]; const dust = motes(root, 60, [-3, 3, 0.2, 3.4, -3, 1], 111, 0.012);
  return { suit, form, bands, arrows, glows, dust }; }

// ================================================================= lights, grades, API
const SET_LIGHT = {
  moon: { top: '#000000', hor: '#05060c', fog: '#05060c', fogN: 400, fogF: 2000, sky: '#8a90a8', ground: '#3a3a40', hemiI: 0.55, fillCol: '#6a7090', fillI: 0.32, sunCol: '#fffaf0', sunI: 4.2, az: 110, el: 20, disc: '#000000', clouds: false, stars: 1, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  moonLow: { top: '#000000', hor: '#05060c', fog: '#05060c', fogN: 400, fogF: 2000, sky: '#8a90a8', ground: '#3a3a40', hemiI: 0.6, fillCol: '#6a7090', fillI: 0.36, sunCol: '#fff4e0', sunI: 4.0, az: 70, el: 14, disc: '#000000', clouds: false, stars: 1, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  lab: { top: '#000000', hor: '#1e2430', fog: '#1e2430', fogN: 14, fogF: 60, sky: '#f0f4ff', ground: '#4a5060', hemiI: 0.95, fillCol: '#8a98d8', fillI: 0.36, sunCol: '#f4f6ff', sunI: 2.8, az: -40, el: 55, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  labTest: { top: '#000000', hor: '#1e2430', fog: '#1e2430', fogN: 14, fogF: 60, sky: '#f0f4ff', ground: '#4a5060', hemiI: 0.95, fillCol: '#8a98d8', fillI: 0.36, sunCol: '#fff4e0', sunI: 3.0, az: 30, el: 50, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  factory: { top: '#000000', hor: '#2a1e18', fog: '#2a1e18', fogN: 14, fogF: 60, sky: '#ffe8c8', ground: '#5a3a2a', hemiI: 0.95, fillCol: '#8a90c8', fillI: 0.3, sunCol: '#ffe8c0', sunI: 2.8, az: -80, el: 34, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff4ea', fxTint: '#ffffff', shafts: 0 },
  factoryNight: { top: '#000000', hor: '#141a30', fog: '#141a30', fogN: 12, fogF: 50, sky: '#7a7ab8', ground: '#3a2a30', hemiI: 0.7, fillCol: '#5a68c0', fillI: 0.4, sunCol: '#a8b8ff', sunI: 1.1, az: -80, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#f0e8f8', fxTint: '#ffffff', shafts: 0 },
  factoryLamp: { top: '#000000', hor: '#22161a', fog: '#22161a', fogN: 12, fogF: 50, sky: '#ffd8b0', ground: '#4a2a2a', hemiI: 0.85, fillCol: '#7a70c0', fillI: 0.34, sunCol: '#ffd8a8', sunI: 1.8, az: -80, el: 30, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  office: { top: '#000000', hor: '#2a1a28', fog: '#2a1a28', fogN: 10, fogF: 40, sky: '#e8b0a0', ground: '#3a2a30', hemiI: 0.8, fillCol: '#6a6ad0', fillI: 0.4, sunCol: '#ff9a70', sunI: 2.2, az: 170, el: 12, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#f8e4e8', fxTint: '#ffffff', shafts: 0 },
  blueprint: { top: '#000000', hor: '#0a1230', fog: '#0a1230', fogN: 10, fogF: 40, sky: '#7aa0ff', ground: '#1a2040', hemiI: 0.75, fillCol: '#5a80ff', fillI: 0.5, sunCol: '#d8e8ff', sunI: 2.6, az: 40, el: 45, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#e8f0ff', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  moon: { look: 'night', over: { exp: 1.08, con: 1.18, sat: 1.04, lift: [0.02, 0.02, 0.035], tS: ['#2a3a7a', 0.16], tH: ['#fff6e8', 0.06], bloom: [0.48, 0.72], vig: [0.32, 0.46, '#000008'] } },
  moonLow: { look: 'night', over: { exp: 1.1, con: 1.18, sat: 1.06, lift: [0.02, 0.02, 0.04], tS: ['#2a3a7a', 0.18], tH: ['#ffe8c8', 0.08], bloom: [0.5, 0.7], hal: [0.2, '#ffd8a0'], vig: [0.34, 0.46, '#000008'] } },
  lab: { look: 'office', over: { exp: 1.1, con: 1.2, sat: 1.1, lift: [0.03, 0.03, 0.05], tS: ['#2a3a7a', 0.16], tH: ['#fff0d8', 0.06], bloom: [0.42, 0.8], vig: [0.3, 0.48, '#141a30'] } },
  labTest: { look: 'office', over: { exp: 1.12, con: 1.22, sat: 1.12, lift: [0.03, 0.03, 0.05], tS: ['#2a3a7a', 0.16], tH: ['#ffe8c8', 0.08], bloom: [0.4, 0.8], vig: [0.3, 0.48, '#141a30'] } },
  factory: { look: 'office', over: { exp: 1.12, con: 1.22, sat: 1.12, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.08], bloom: [0.42, 0.8], hal: [0.22, '#ff9a70'], vig: [0.3, 0.46, '#2a1420'] } },
  factoryNight: { look: 'night', over: { exp: 1.16, con: 1.22, sat: 1.04, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.5, 0.68], hal: [0.3, '#ffa050'], vig: [0.4, 0.42, '#08081a'] } },
  factoryLamp: { look: 'office', over: { exp: 1.14, con: 1.24, sat: 1.1, lift: [0.035, 0.02, 0.045], tS: ['#3a2a6a', 0.2], tH: ['#ffc080', 0.12], bloom: [0.44, 0.74], hal: [0.28, '#ff9a50'], vig: [0.36, 0.44, '#1e0e1a'] } },
  office: { look: 'golden', over: { exp: 1.1, con: 1.22, sat: 1.04, tS: ['#2a2a7a', 0.24], tH: ['#ffb080', 0.12], bloom: [0.46, 0.72], hal: [0.3, '#ff9050'], vig: [0.4, 0.44, '#140a20'] } },
  blueprint: { look: 'night', over: { exp: 1.14, con: 1.2, sat: 1.06, lift: [0.02, 0.03, 0.07], tS: ['#1a2a8a', 0.26], tH: ['#d8ecff', 0.1], bloom: [0.5, 0.66], vig: [0.38, 0.44, '#02041a'] } },
};

export function buildPX(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'moon', checks: 0, score: 0, cal: 0, lamp: 0 };
  let mo, lb, fa, of, bp;
  const API = makeAPI(ctx, { prefix: 'px_', origin: PX_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { moon: 'day', moonLow: 'day', lab: 'office', labTest: 'office', factory: 'office', factoryNight: 'office', factoryLamp: 'office', office: 'office', blueprint: 'office' },
    practicals: (name, F, W3) => { const fl = 1 + 0.04 * Math.sin(F * 0.7) + 0.03 * Math.sin(F * 1.9);
      if (name === 'lab' || name === 'labTest') return [{ p: W3('lab', [-3.5, 3.6, -1.5]), col: '#f0f4ff', I: 3.0, d: 10 }, { p: W3('lab', [1.6, 3.6, -1.0]), col: '#fff0d8', I: 4.0, d: 10 }, { p: W3('lab', [4.5, 2.4, 1.5]), col: '#ffe0b8', I: 2.0, d: 8 }];
      if (name === 'factory') return [{ p: W3('factory', [-1.1, 2.2, -1.5]), col: '#ffe0b0', I: 3.4, d: 9 }, { p: W3('factory', [2.6, 2.2, -0.8]), col: '#fff0d8', I: 3.0, d: 8 }, { p: W3('factory', [0, 2.2, 1.4]), col: '#ffd8a0', I: 2.4, d: 6 }];
      if (name === 'factoryNight') return [{ p: W3('factory', [-1.1, 2.3, -1.5]), col: '#ffc070', I: 6.5 * fl, d: 8 }, { p: W3('factory', [3.4, 2.0, 0.2]), col: '#ffc070', I: 3.5 * fl, d: 6 }, { p: W3('factory', [0, 2.3, 0.9]), col: '#ffc070', I: 4 * fl, d: 6 }];
      if (name === 'factoryLamp') return [{ p: W3('factory', [-1.1, 2.3, -1.5]), col: '#ffc878', I: 5 * fl, d: 8 }, { p: W3('factory', [3.4, 2.0, 0.2]), col: '#ffd890', I: 3 * fl, d: 6 }, { p: W3('factory', [0, 2.3, 0.9]), col: '#ffd890', I: 5 * fl, d: 5 }];
      if (name === 'office') return [{ p: W3('office', [-0.78, 1.15, -1.2]), col: '#ffc070', I: 4.5 * fl, d: 6 }, { p: W3('office', [0.6, 2.0, -2.4]), col: '#ff9a7a', I: 2.5, d: 7 }, { p: W3('office', [-2, 2.5, 1]), col: '#8a90ff', I: 1.4, d: 8 }];
      if (name === 'blueprint') return [{ p: W3('blueprint', [-0.1, 2.8, 0.6]), col: '#8ab8ff', I: 5, d: 9 }, { p: W3('blueprint', [2.5, 1.6, 0.5]), col: '#d8e8ff', I: 2.5, d: 7 }, { p: W3('blueprint', [-2.6, 1.6, 0.4]), col: '#ffa8d0', I: 2.2, d: 7 }];
      if (name === 'moon' || name === 'moonLow') return [{ p: W3('moon', [MOON.LX, 2.0, MOON.LZ + 6]), col: '#c8d0ff', I: 0.9, d: 9 }];
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'factory' && fa) { const night = ST.mood === 'factoryNight', lit = night || ST.mood === 'factoryLamp'; fa.machines.forEach((m, i) => m.tick(f + i * 7, 1.2 + (i % 3) * 0.3)); fa.hero.tick(f, ST.sewRate ?? 1);
        fa.lamps.forEach((g, i) => (g.material.opacity = lit ? 0.6 * (0.92 + 0.08 * Math.sin(f * 0.6 + i)) : 0.12)); fa.shaft.visible = ST.mood === 'factory'; tickMotes(fa.dust, f, 0.4);
        fa.wins.forEach((w) => (w.material = night || ST.mood === 'factoryLamp' ? M.winNight : M.winDay)); }
      if (cur === 'lab' && lb) { tickMotes(lb.dust, f, 0.3); }
      if (cur === 'office' && of) { of.lampG.material.opacity = 0.5 * (0.92 + 0.08 * Math.sin(f * 0.8)); tickMotes(of.dust, f, 0.3); }
      if (cur === 'blueprint' && bp) { tickMotes(bp.dust, f, 0.5); bp.glows[0].material.opacity = 0.18 + 0.05 * Math.sin(T * 2); }
      if (cur === 'moon' && mo) { tickMotes(mo.dust, f, 0.2); } },
    mood: (name) => { ST.mood = name; },
    apply: (v) => { if (v.checks != null) API.setChecks(v.checks); if (v.score != null) API.setScore(v.score); if (v.layers != null) API.setLayers(v.layers); if (v.bend != null) API.setBend(v.bend); if (v.cal != null) API.setCal(v.cal); if (v.stitch != null) API.setStitch(v.stitch); } });
  mo = buildMoon(API.groups.moon); lb = buildLab(API.groups.lab); fa = buildFactory(API.groups.factory); of = buildOffice(API.groups.office); bp = buildBlueprint(API.groups.blueprint);
  API.parts = { mo, lb, fa, of, bp };
  API.setChecks = (n) => { ST.checks = n; lb.chalk.material = M.chalk[Math.max(0, Math.min(3, n | 0))]; };
  API.setScore = (n) => { ST.score = n; lb.score.material = M.score[Math.max(0, Math.min(3, n | 0))]; };
  API.setStand3 = (on) => { lb.suits[2].G.visible = !!on; };
  API.labPose = (i, p) => lb.suits[i].pose(p);
  API.setCal = (k) => { ST.cal = k; fa.cal.visible = k >= 0; if (k < 0) return; fa.cal.material = M.cal[Math.max(0, Math.min(6, k | 0))]; };
  API.setLayers = (t) => fa.suit.layers(t);
  API.factoryPose = (p) => fa.suit.pose(p);
  API.setSewRate = (r) => { ST.sewRate = r; };
  // stitch(n 0..40 stitches sewn, bad: show the red bad stitch, slide: fabric feed)
  API.setStitch = (n, bad = 0) => { const N = Math.max(0, Math.min(40, n)); fa.stitches.forEach((s, i) => { s.visible = i < N; s.position.set(fa.hero.G.position.x - 0.22 + 0.026 - (N - i) * 0.0134, 0.838, 1.07); }); fa.fabric.position.x = -0.12 - N * 0.0134 * 0.3; fa.bad.visible = !!bad; fa.bad.position.set(fa.hero.G.position.x - 0.22 + 0.026 - 6 * 0.0134, 0.839, 1.072); };
  API.setBend = (b, squeeze = 0, f = 0) => { bp.suit.pose({ aR: 0.5 * b, bR: 1.9 * b, fwd: 0.6 * b, fL: 0, aL: 0.05, bL: 0.2 * b, kL: 0.3 * b, hL: -0.15 * b, lift: 0, f }); const k = 1 - 0.13 * squeeze; bp.bands.forEach((band, i) => band.scale.set(k, 0.78 * k, 1)); bp.arrows.forEach((a, i) => { a.position.x = (i ? 1 : -1) * (0.42 - 0.1 * squeeze); a.visible = squeeze > 0.02; }); };
  API.setPrints = (n) => mo.prints.forEach((p, i) => (p.visible = i < n));
  API.glows = { moon: mo.glows, lab: lb.glows, factory: fa.lamps, office: [of.lampG], blueprint: bp.glows };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); if (API.cur === 'moon') mo.earth.quaternion.copy(cam.quaternion); };
  const V = API.V, LX = MOON.LX, LZ = MOON.LZ;
  API.views = [
    V('moon', [LX + 1.0, 1.4, LZ + 9.5], [LX - 0.5, 1.6, LZ], 46, 1.2, [LX, 1.0, LZ + 3.4]),           // 0 moon: lander + ladder
    V('moonLow', [LX - 3, 0.7, LZ + 7], [LX + 2, 2.4, LZ - 4], 50, 1.0, [LX, 0.8, LZ + 3.4]),          // 1 low angle, Earth
    V('lab', [-3.6, 1.6, 2.4], [-4.5, 1.8, -5], 46, 1.4, [-4.5, 1.6, -4]),                              // 2 chalkboard
    V('labTest', [1.6, 1.7, 4.6], [1.6, 1.6, -3], 48, 1.0, [1.6, 1.2, -2.4], { score: 3 }),            // 3 trials wide
    V('factory', [1.6, 1.8, 5.2], [-0.6, 1.2, -2], 50, 1.0, [-0.6, 1.0, -1.5], { cal: 0 }),             // 4 sewing floor wide
    V('factoryNight', [3.6, 1.6, 1.4], [2.4, 1.3, -1.6], 44, 1.6, [2.7, 1.2, -1.4], { cal: 5, layers: 1 }), // 5 night, suit + layers
    V('factoryLamp', [-0.1, 1.0, 1.55], [-0.12, 0.79, 1.05], 34, 3.0, [-0.12, 0.79, 1.05], { stitch: 30 }), // 6 needle close-up
    V('office', [0.4, 1.5, 2.6], [0, 1.1, -1.4], 46, 1.4, [0, 1.0, -1.2]),                              // 7 office
    V('blueprint', [0, 1.4, 3.6], [-0.1, 1.2, -1.2], 44, 1.2, [-0.1, 1.1, -1.2], { bend: 1 }),          // 8 cutaway
    V('blueprint', [0.6, 1.5, 1.6], [1.0, 1.3, -1.2], 40, 2.0, [1.0, 1.3, -1.2], { bend: 0.5 }),        // 9 cutaway close (arm)
  ];
  API.setChecks(0); API.setScore(0); API.setCal(0); API.setStitch(0); API.setBend(0); API.setLayers(0); API.setPrints(0); API.setStand3(true); API.tick(0);
  return API;
}
