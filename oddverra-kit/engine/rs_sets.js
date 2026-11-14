// rs_sets.js [RS-sets]: sets for "Mount Rushmore was never finished" (Oddverra short). Our own stylized granite busts of the four
// presidents (Washington, Jefferson, T. Roosevelt, Lincoln), built from primitives; no park logos or signage beyond generic labels.
//   mount  : the granite mountain, pines and foothills, the four busts (each 0 hidden / 1 rough-blocked / 2 carved), the first Jefferson
//            on Washington's right (viewer left) with its crack card, bosun-chair cables + seats, a hoist house on top, a ghost card of
//            the planned waist-length bodies, flying debris for blasts, and a visitor terrace with banners for "today".
//            Moods mToday, m1927, mWork, mGold, m41, mSunset, mDawn.                                          origin (-88000,0,0)
//   studio : Borglum's studio: plaster model of the full waist-length design, wall plans (history inscription panel, Hall of Records
//            cross-section), desk, lamp, window onto the mountain. Moods studioDay, studioNight (cash box empty, hat on the chair).  (-88000,0,800)
//   tunnel : the canyon behind the heads, the rough 70-ft Hall of Records tunnel with work lamps. Moods tunnel41 (dusty, unfinished),
//            tunnel98 (1998: the floor vault at the entry, teak box, enamel panels, the granite capstone lowering).   origin (-90500,0,0)
// Each set: local frame, floor y = 0, camera side +z. Test flag ?rsview=N (main.js).
import { H, TAU, sm, SANS, SERIF, cyl, sph, plane, planeUV, mesh, nond, lumpGeo, txt, grain, glowAt, shaftAt, motes, tickMotes, makeAPI, initDoh } from './doh_kit.js';
import { Kit } from './world.js';

export const RS_ORIGIN = { mount: [-88000, 0, 0], studio: [-88000, 0, 800], tunnel: [-90500, 0, 0] };
const GROUP_OF = { mToday: 'mount', m1927: 'mount', mWork: 'mount', mGold: 'mount', m41: 'mount', mSunset: 'mount', mDawn: 'mount', studioDay: 'studio', studioNight: 'studio', tunnel41: 'tunnel', tunnel98: 'tunnel' };
// head centres + scale (set-local); W J T L, and JL = the first Jefferson on Washington's right (viewer left)
export const RS_HEADS = { W: [-14, 33, -37, 7.0, 0.14, 0], J: [-5.5, 35, -41.5, 6.8, -0.12, -0.16], T: [2.6, 33.4, -46.5, 6.3, 0.02, 0], L: [11, 33, -39.5, 7.0, -0.14, 0], JL: [-24.5, 31.5, -41, 6.4, 0.2, 0] };
// bosun-chair seats (set-local, actor feet go on these)
export const RS_SEATS = [[-17.6, 29.2, -30.6], [-10.2, 37.4, -31.4], [-22.6, 34.4, -34.6], [-25.8, 27.6, -35.4]];
let THREE, PT, M;

// ---------------------------------------------------------------- painters
function graniteTex(g, w, h) { g.fillStyle = '#d6d0c6'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.84 + 0.22 * PT.fbm(u, v, 5, 5, 4, 11)); grain(g, w, h, 'rgba(80,70,80,1)', 2600, 7, 0.35); grain(g, w, h, 'rgba(255,240,235,1)', 1400, 8, 0.4);
  g.strokeStyle = 'rgba(90,80,90,0.25)'; g.lineWidth = 2; const R = PT.rng(4); for (let i = 0; i < 14; i++) { g.beginPath(); let x = R() * w, y = R() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (R() - 0.5) * 60; y += R() * 40; g.lineTo(x, y); } g.stroke(); } }
function crackTex(g, w, h) { g.clearRect(0, 0, w, h); const R = PT.rng(31); g.lineCap = 'round';
  for (let i = 0; i < 9; i++) { let x = w * (0.2 + R() * 0.6), y = h * R() * 0.3; const pts = [[x, y]]; for (let k = 0; k < 9; k++) { x += (R() - 0.5) * w * 0.16; y += h * 0.06 + R() * h * 0.05; pts.push([x, y]); }
    for (const [lw, col] of [[12, 'rgba(255,120,60,0.35)'], [6, '#2a1a2a']]) { g.strokeStyle = col; g.lineWidth = lw * (i < 3 ? 1.3 : 0.8); g.beginPath(); pts.forEach(([a, b], j) => (j ? g.lineTo(a, b) : g.moveTo(a, b))); g.stroke(); } } }
function hillsTex(g, w, h) { g.clearRect(0, 0, w, h); for (const [y0, c, a] of [[0.35, '#8a96b8', 0.06], [0.5, '#5a7088', 0.08], [0.66, '#34503e', 0.1], [0.8, '#26402e', 0.06]]) { g.fillStyle = c; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 6) g.lineTo(x, h * y0 + Math.sin(x * 0.011 + y0 * 9) * h * a + Math.sin(x * 0.037 + y0) * h * a * 0.5); g.lineTo(w, h); g.fill();
  if (y0 > 0.6) { g.fillStyle = 'rgba(20,40,30,0.5)'; for (let x = 0; x < w; x += 7) { const y = h * y0 + Math.sin(x * 0.011 + y0 * 9) * h * a + Math.sin(x * 0.037 + y0) * h * a * 0.5; g.beginPath(); g.moveTo(x - 4, y + 4); g.lineTo(x, y - 12 - (x * 7 % 9)); g.lineTo(x + 4, y + 4); g.fill(); } } } }
// the planned bodies (blueprint ghost): four waist-length coats under the heads; xs = head x in [0..1], plane is 46 x 30
function ghostTex(xs) { return (g, w, h) => { g.clearRect(0, 0, w, h); g.lineJoin = 'round'; g.lineCap = 'round';
  const pass = (lw, col) => { g.strokeStyle = col; g.lineWidth = lw;
    xs.forEach((u, i) => { const cx = u * w, top = h * 0.02, sw = w * 0.15, bot = h * 0.97; g.beginPath();
      g.moveTo(cx - sw * 0.3, top); g.quadraticCurveTo(cx - sw * 0.95, top + h * 0.0, cx - sw * 1.1, top + h * 0.14); g.lineTo(cx - sw * 1.0, bot);
      g.moveTo(cx + sw * 0.3, top); g.quadraticCurveTo(cx + sw * 0.95, top + h * 0.0, cx + sw * 1.1, top + h * 0.14); g.lineTo(cx + sw * 1.0, bot);
      g.moveTo(cx - sw * 0.3, top + h * 0.02); g.lineTo(cx - sw * 0.05, top + h * 0.42); g.lineTo(cx + sw * 0.3, top + h * 0.02); // lapels
      g.moveTo(cx - sw * 0.05, top + h * 0.42); g.lineTo(cx - sw * 0.02, bot); for (let k = 0; k < 4; k++) { g.moveTo(cx + sw * 0.06, top + h * (0.48 + k * 0.12)); g.arc(cx + sw * 0.02, top + h * (0.48 + k * 0.12), sw * 0.04, 0, TAU); }
      if (i === 3) { g.moveTo(cx - sw * 0.5, top + h * 0.5); g.quadraticCurveTo(cx - sw * 0.25, top + h * 0.3, cx - sw * 0.1, top + h * 0.22); g.moveTo(cx - sw * 0.1, top + h * 0.15); g.lineTo(cx - sw * 0.1, top + h * 0.28); } // hand on the lapel
      if (lw > 20) { g.save(); g.fillStyle = 'rgba(120,200,255,0.10)'; g.fillRect(cx - sw * 1.0, top + h * 0.1, sw * 2.0, bot - top - h * 0.1); g.restore(); }
      if (i === 0) { g.moveTo(cx - sw * 0.9, top + h * 0.62); g.quadraticCurveTo(cx - sw * 0.3, top + h * 0.7, cx + sw * 0.1, top + h * 0.64); } g.stroke(); }); // arm across
    g.beginPath(); g.moveTo(0, h * 0.97); g.lineTo(w, h * 0.97); g.stroke(); };
  pass(26, 'rgba(120,200,255,0.25)'); pass(9, 'rgba(170,230,255,0.95)');
  g.setLineDash([18, 16]); g.strokeStyle = 'rgba(200,240,255,0.6)'; g.lineWidth = 4; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(0, h * k / 4); g.lineTo(w, h * k / 4); g.stroke(); } g.setLineDash([]);
  txt(g, 'PLANNED: DOWN TO THE WAIST', w / 2, h * 0.9, w * 0.6, h * 0.05, { col: 'rgba(200,240,255,0.95)', font: SANS }); }; }
function windowMtTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6a9ae0'); gr.addColorStop(1, '#e8eef4'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#b8b2aa'; g.beginPath(); g.moveTo(0, h * 0.7); g.lineTo(w * 0.15, h * 0.35); g.lineTo(w * 0.35, h * 0.28); g.lineTo(w * 0.6, h * 0.3); g.lineTo(w * 0.85, h * 0.36); g.lineTo(w, h * 0.55); g.lineTo(w, h); g.lineTo(0, h); g.fill();
  for (const [x, y] of [[0.32, 0.42], [0.45, 0.4], [0.58, 0.44]]) { g.fillStyle = '#d8d2ca'; g.beginPath(); g.ellipse(w * x, h * y, w * 0.045, h * 0.07, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(60,50,60,0.5)'; g.fillRect(w * x - w * 0.025, h * y - h * 0.01, w * 0.05, h * 0.012); }
  g.fillStyle = '#2f5a3a'; for (let x = 0; x < w; x += 9) { const y = h * 0.8 + Math.sin(x * 0.05) * 6; g.beginPath(); g.moveTo(x - 6, h); g.lineTo(x, y - 14); g.lineTo(x + 6, h); g.fill(); } }
function entTex(g, w, h) { g.fillStyle = '#efe4c8'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 4, 4, 3, 5));
  txt(g, 'HISTORY INSCRIPTION', w / 2, h * 0.08, w * 0.8, h * 0.07, { col: '#3a2414', font: SERIF });
  // a big tablet outline shaped like a rough western territory, faux lines of carved text inside
  g.fillStyle = 'rgba(160,150,140,0.35)'; g.strokeStyle = '#3a2414'; g.lineWidth = 5; g.beginPath(); const P = [[0.12, 0.2], [0.42, 0.17], [0.6, 0.22], [0.72, 0.18], [0.9, 0.3], [0.86, 0.55], [0.74, 0.7], [0.6, 0.82], [0.44, 0.86], [0.34, 0.74], [0.18, 0.62], [0.1, 0.4]];
  P.forEach(([x, y], i) => (i ? g.lineTo(w * x, h * y) : g.moveTo(w * x, h * y))); g.closePath(); g.fill(); g.stroke();
  const R = PT.rng(17); g.fillStyle = 'rgba(58,36,20,0.75)'; for (let i = 0; i < 10; i++) { const y = h * (0.28 + i * 0.05), x0 = w * (0.24 + (i > 6 ? 0.08 * (i - 6) : 0)), L = w * (0.48 - (i > 6 ? 0.1 * (i - 6) : 0)); let x = x0; while (x < x0 + L) { const ww = 8 + R() * 22; g.fillRect(x, y, Math.min(ww, x0 + L - x), 6); x += ww + 6; } }
  for (const [s, x, y] of [['1776', 0.3, 0.92], ['1803', 0.5, 0.92], ['1906', 0.7, 0.92]]) txt(g, s, w * x, h * y, w * 0.16, h * 0.05, { col: '#7a2a1a', font: SERIF }); }
function horTex(g, w, h) { g.fillStyle = '#1d4a8a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(200,225,255,0.16)'; g.lineWidth = 1; for (let x = 0; x < w; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.strokeStyle = '#e8f2ff'; g.lineWidth = 4; g.beginPath(); g.moveTo(w * 0.05, h * 0.9); g.lineTo(w * 0.1, h * 0.5); g.lineTo(w * 0.2, h * 0.32); g.lineTo(w * 0.3, h * 0.24); g.lineTo(w * 0.62, h * 0.2); g.lineTo(w * 0.8, h * 0.3); g.lineTo(w * 0.95, h * 0.5); g.lineTo(w * 0.98, h * 0.9); g.stroke();
  for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(w * (0.2 + i * 0.05), h * 0.34 - i * 4, w * 0.04, h * 0.06, 0, 0, TAU); g.stroke(); }
  g.setLineDash([10, 8]); g.beginPath(); g.moveTo(w * 0.42, h * 0.62); g.lineTo(w * 0.7, h * 0.62); g.stroke(); g.setLineDash([]); g.strokeRect(w * 0.7, h * 0.5, w * 0.18, h * 0.22);
  g.fillStyle = '#ffd860'; g.beginPath(); g.moveTo(w * 0.62, h * 0.56); g.lineTo(w * 0.69, h * 0.62); g.lineTo(w * 0.62, h * 0.68); g.fill();
  txt(g, 'HALL OF RECORDS', w * 0.5, h * 0.08, w * 0.8, h * 0.08, { col: '#ffffff', font: SANS }); txt(g, 'BEHIND THE HEADS', w * 0.5, h * 0.84, w * 0.5, h * 0.05, { col: '#cfe2ff', font: SANS }); }
function billTex(g, w, h) { g.fillStyle = '#f2ece0'; g.fillRect(0, 0, w, h); txt(g, 'BUDGET', w / 2, h * 0.12, w * 0.7, h * 0.1, { col: '#2a2020', font: SERIF }); g.fillStyle = 'rgba(40,30,30,0.5)'; for (let i = 0; i < 6; i++) g.fillRect(w * 0.1, h * (0.26 + i * 0.09), w * 0.5, 5);
  g.strokeStyle = '#c8302a'; g.lineWidth = 6; g.strokeRect(w * 0.1, h * 0.8, w * 0.8, h * 0.14); txt(g, 'FUNDS: $0', w / 2, h * 0.87, w * 0.7, h * 0.1, { col: '#c8302a', font: SANS }); }
function panelTex(g, w, h) { g.fillStyle = '#f6f4ee'; g.fillRect(0, 0, w, h); g.fillStyle = '#1e3a7a'; g.fillRect(w * 0.08, h * 0.06, w * 0.84, h * 0.1); g.fillStyle = 'rgba(30,40,80,0.6)'; for (let i = 0; i < 12; i++) g.fillRect(w * 0.1, h * (0.24 + i * 0.058), w * (i % 4 === 3 ? 0.5 : 0.8), h * 0.018);
  g.strokeStyle = '#1e3a7a'; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); }
function bannerTex(c1, c2) { return (g, w, h) => { g.fillStyle = c1; g.fillRect(0, 0, w, h); g.fillStyle = c2; g.fillRect(0, h * 0.4, w, h * 0.2); g.beginPath(); g.arc(w / 2, h * 0.5, w * 0.18, 0, TAU); g.fill(); g.fillStyle = c1; g.beginPath(); g.arc(w / 2, h * 0.5, w * 0.1, 0, TAU); g.fill(); PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 3, 3, 3, 4)); }; }
function teakTex(g, w, h) { PT.planks(g, w, h, { base: '#8a5426', n: 4, seed: 61 }); }
function signTex(lines, o = {}) { return (g, w, h) => { g.fillStyle = o.bg || '#5a3a24'; g.fillRect(0, 0, w, h); g.strokeStyle = o.rim || '#f2e6c8'; g.lineWidth = h * 0.06; g.strokeRect(h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12);
  lines.forEach((s, i) => txt(g, s, w / 2, h * (lines.length === 1 ? 0.54 : 0.34 + i * 0.34), w * 0.84, h * (lines.length === 1 ? 0.5 : 0.28), { col: o.col || '#f2e6c8', font: o.font || SANS })); }; }

function materials() { const { toon, mkTex: T } = H, C = H.M, m = { ...C }, vc = C.vc, em = C.em;
  m.granite = vc({ map: T(512, 512, graniteTex) }); m.rock = vc({ map: T(512, 512, graniteTex) }); m.rough = toon({ map: m.rock.map, color: 0xb4aea4 });
  m.plaster = vc({ emissive: 0x0c0a08 });
  m.crack = new THREE.MeshBasicMaterial({ map: T(256, 320, crackTex), transparent: true, depthWrite: false, opacity: 0, fog: false });
  m.hills = new THREE.MeshBasicMaterial({ map: T(1024, 256, hillsTex), transparent: true, fog: false, depthWrite: false });
  m.ghost = new THREE.MeshBasicMaterial({ map: T(1024, 680, ghostTex(['W', 'J', 'T', 'L'].map((k) => (RS_HEADS[k][0] + 24) / 46))), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide });
  m.plank = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 8, seed: 51 })) }); m.darkwood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#4a2e1e', n: 6, seed: 33 })) });
  m.winMt = new THREE.MeshBasicMaterial({ map: T(512, 384, windowMtTex), fog: false }); m.winMtN = new THREE.MeshBasicMaterial({ map: T(512, 384, windowMtTex), fog: false }); m.winMtN.color.set(0x3a4a8a);
  m.ent = em(T(512, 512, entTex), 0x241c14); m.hor = em(T(512, 512, horTex), 0x0c1830); m.bill = em(T(256, 320, billTex), 0x201810);
  m.panel = em(T(256, 320, panelTex), 0x303030); m.teak = vc({ map: T(256, 256, teakTex) });
  m.banners = [['#c8302a', '#f2ece0'], ['#2a4a8a', '#e8c040'], ['#2a6a4a', '#f2ece0'], ['#e8c040', '#2a4a8a'], ['#6a2a6a', '#f2ece0'], ['#f2ece0', '#2a4a8a']].map(([a, b]) => em(T(128, 192, bannerTex(a, b)), 0x181010, { side: THREE.DoubleSide }));
  m.leaf = vc(); m.bark = vc({ map: T(128, 256, (g, w, h) => PT.bark(g, w, h, {})) }); m.cloth = vc(); m.grass = vc({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#5a6a3a'; g.fillRect(0, 0, w, h); PT.modulate(g, w, h, (u, v) => 0.8 + 0.3 * PT.fbm(u, v, 6, 6, 3, 2)); }) });
  m.sky = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  m.signHall = em(T(512, 128, signTex(['HALL OF RECORDS'])), 0x201410); m.sign70 = em(T(256, 128, signTex(['70 FT'], { bg: '#e8c040', col: '#2a1a14', rim: '#2a1a14' })), 0x201410);
  m.bulb = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe0a0).multiplyScalar(2.0), fog: false });
  return m; }

// ---------------------------------------------------------------- busts (unit head, face +z)
const BOX = () => H.THREE.BoxGeometry ? new H.THREE.BoxGeometry(1, 1, 1) : null;
// one continuous sculpted surface per head: an ellipsoid displaced by 3D gaussian bumps (nose, brow, sockets, lips, hair...) so the
// ink pass only draws real creases and silhouettes, like carved stone
const BUMPS = (who) => { const b = [], add = (x, y, z, rx, ry, rz, a) => b.push([x, y, z, rx, ry, rz, a]), sym = (x, y, z, rx, ry, rz, a) => { add(x, y, z, rx, ry, rz, a); add(-x, y, z, rx, ry, rz, a); };
  for (let i = 0; i <= 6; i++) { const t = i / 6; add(0, 0.17 - 0.45 * t, 0.84 + 0.02 * t, 0.05 + 0.03 * t, 0.07, 0.08, 0.035 + 0.12 * t * t); } // nose ridge to tip
  sym(0.075, -0.29, 0.8, 0.05, 0.04, 0.06, 0.06); sym(0.045, -0.33, 0.86, 0.025, 0.015, 0.04, -0.04); // nostril wings + nostrils
  sym(0.26, 0.25, 0.76, 0.16, who === 'L' ? 0.06 : 0.045, 0.1, who === 'L' ? 0.07 : 0.05); add(0, 0.2, 0.84, 0.07, 0.05, 0.08, 0.03); // brow + glabella
  sym(0.27, 0.06, 0.79, 0.1, 0.055, 0.1, -0.12); sym(0.27, 0.06, 0.8, 0.026, 0.026, 0.05, 0.04); sym(0.27, 0.13, 0.8, 0.12, 0.025, 0.08, 0.02); // sockets, pupil posts, lids
  sym(0.38, -0.14, 0.66, 0.12, 0.1, 0.12, who === 'L' ? 0.02 : 0.04); if (who === 'L') sym(0.36, -0.3, 0.62, 0.1, 0.09, 0.12, -0.045);
  add(0, -0.5, 0.82, 0.15, 0.016, 0.1, -0.05); add(0, -0.455, 0.82, 0.13, 0.028, 0.1, 0.02); add(0, -0.555, 0.8, 0.11, 0.03, 0.1, 0.025); // mouth
  sym(0.23, -0.4, 0.72, 0.03, 0.12, 0.06, -0.025); // smile folds
  add(0, -0.82, 0.6, 0.18, 0.12, 0.16, 0.1); sym(0.5, -0.55, 0.3, 0.2, 0.2, 0.2, 0.08); sym(0.8, 0.0, 0.0, 0.05, 0.18, 0.1, 0.09); // chin, jaw, ears
  add(0, 0.72, -0.2, 0.8, 0.38, 0.75, 0.13); // hair mass
  if (who === 'W') { sym(0.72, 0.1, -0.3, 0.1, 0.18, 0.25, 0.16); sym(0.7, -0.15, -0.35, 0.09, 0.1, 0.2, 0.1); add(0, 0.0, -0.86, 0.3, 0.35, 0.15, 0.1); }
  if (who === 'J') { sym(0.7, 0.05, -0.2, 0.12, 0.3, 0.3, 0.1); }
  if (who === 'T') { sym(0.12, -0.4, 0.83, 0.12, 0.035, 0.06, 0.055); }
  if (who === 'L') { add(0, -0.78, 0.42, 0.55, 0.3, 0.45, 0.13); sym(0.45, -0.6, 0.42, 0.18, 0.25, 0.25, 0.06); }
  return b; };
const HAIRN = { W: 0.03, J: 0.07, T: 0.04, L: 0.05 };
const HG = {};
export function headGeo(who, G = 0xd8d2c8) { const key = who + G; if (HG[key]) return HG[key];
  const g = new THREE.SphereGeometry(1, 120, 90), p = g.attributes.position, B = BUMPS(who), hn = HAIRN[who] || 0.04, col = new Float32Array(p.count * 3), base = new THREE.Color(G);
  for (let i = 0; i < p.count; i++) { const ux = p.getX(i), uy = p.getY(i), uz = p.getZ(i), x = ux * 0.8, y = uy, z = uz * 0.86; let d = 0, neg = 0;
    for (const [cx, cy, cz, rx, ry, rz, a] of B) { const q = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + ((z - cz) / rz) ** 2; if (q < 9) { const e = a * Math.exp(-0.5 * q); d += e; if (a < 0) neg += e; } }
    const hair = Math.max(0, Math.min(1, (y - 0.32) * 4)) * Math.max(0, Math.min(1, (0.55 - z) * 3)) + (who === 'L' ? Math.max(0, Math.min(1, (-0.48 - y) * 4)) * Math.max(0, Math.min(1, z * 3)) : 0);
    const wav = Math.sin(x * 23 + y * 7) * 0.6 + Math.sin(y * 31 - z * 13) * 0.4; d += hair * hn * wav + 0.008 * Math.sin(x * 53 + y * 41 + z * 37);
    const nx = x / 0.64, ny = y, nz = z / 0.7396, nl = Math.hypot(nx, ny, nz); p.setXYZ(i, x + nx / nl * d, y + ny / nl * d, z + nz / nl * d);
    const sh = Math.max(0.7, 1 + 2.2 * neg + hair * 0.08 * wav - (y < -0.9 ? 0.15 : 0)); col[i * 3] = base.r * sh; col[i * 3 + 1] = base.g * sh; col[i * 3 + 2] = base.b * sh; }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return (HG[key] = g); }
function bustFeatures(K, who, mat, G, DD) { K.put(mat, cyl(0.5, 0.7, 1.2, 18), 0, -1.15, -0.05, 0, 0, 0, 1, 1, 1, G);
  if (who === 'T') for (const s of [-1, 1]) K.put(mat, new THREE.TorusGeometry(0.15, 0.022, 6, 20), s * 0.27, 0.07, 0.83, 0, 0, 0, 1, 1, 1, G);
}
function makeBust(root, who, o) { const g = new THREE.Group(); root.add(g); const K = new Kit(); bustFeatures(K, who, o.mat, o.G, o.DD); K.build(g, 0); const h = new THREE.Mesh(headGeo(who, o.G), o.mat); h.castShadow = h.receiveShadow = true; g.add(h); return g; }

// ================================================================= MOUNT
function pineAt(K, x, z, s, c) { K.beam(M.bark, [x, 0, z], [x, 1.2 * s, z], 0.14 * s, 0x5a4030, true, 5); for (let i = 0; i < 3; i++) K.put(M.leaf, new THREE.ConeGeometry((1.1 - i * 0.28) * s, 1.5 * s, 7), x, (1.4 + i * 0.85) * s, z, 0, i, 0, 1, 1, 1, c); }
function buildMount(root) { const R = PT.rng(1927), K = new Kit();
  mesh(root, planeUV(500, 500, 30, 30), M.grass, 0, 0, -60, -Math.PI / 2, 0, 0, false);
  // mountain mass: big granite lumps around and behind the heads
  const L = (x, y, z, sx, sy, sz, seed, c = 0xc8c2b8, r = 0.2) => K.put(M.rock, lumpGeo(seed, 2, r), x, y, z, R() * 0.3, R() * 6, 0, sx, sy, sz, c);
  L(-2, 28, -72, 40, 30, 18, 1); L(-30, 30, -62, 14, 24, 12, 2); L(26, 32, -62, 16, 22, 12, 3); L(40, 18, -50, 14, 18, 13, 4, 0xbab4aa); L(-44, 16, -48, 16, 16, 14, 5, 0xbab4aa);
  L(-4, 52, -74, 26, 12, 12, 6, 0xc0bab0); L(-52, 8, -40, 18, 12, 16, 7, 0xa8a49c); L(50, 10, -40, 18, 14, 16, 8, 0xa8a49c);
  // rock between and behind the heads (so they read as carved out of the cliff)
  L(-20, 28, -50, 7, 10, 6, 9); L(-1, 27, -52, 6, 9, 6, 10); L(7, 28, -52, 5, 9, 5, 11); L(18, 28, -50, 6, 10, 6, 12); L(-10, 44, -54, 10, 6, 7, 13); L(6, 44, -56, 10, 6, 7, 14);
  // talus / rubble slope below the heads
  for (let i = 0; i < 18; i++) { const x = -32 + i * 3.8 + (R() - 0.5) * 2, y = 3 + R() * 8; L(x, y, -32 - R() * 6, 4 + R() * 3, 3 + R() * 3, 4 + R() * 3, 20 + i, [0xb8b2a8, 0xa8a29a, 0xc4beb4][i % 3], 0.3); }
  for (let i = 0; i < 40; i++) K.put(M.rock, lumpGeo(60 + (i % 7), 1, 0.3), -28 + R() * 52, 1 + R() * 6, -22 - R() * 10, R(), R() * 6, 0, 0.6 + R() * 1.2, 0.5 + R(), 0.6 + R(), [0xb0aaa0, 0x9a948c][i % 2]);
  // pine forest: around the base, on the shoulders of the mountain, along the terrace
  const PC = [0x2f5a3a, 0x3a6a42, 0x28503a, 0x355f3e];
  for (let i = 0; i < 170; i++) { const a = R(); let x, z; if (a < 0.5) { x = (R() < 0.5 ? -1 : 1) * (32 + R() * 70); z = -20 - R() * 60; } else { x = -90 + R() * 180; z = -12 - R() * 14 + (Math.abs(x) < 34 ? -6 : 8); }
    pineAt(K, x, z, 2.2 + R() * 1.6, PC[i % 4]); }
  for (let i = 0; i < 26; i++) { const x = (R() < 0.5 ? -1 : 1) * (22 + R() * 22), z = -36 - R() * 20; K.at(0, 14 + R() * 18, 0, 0, () => pineAt(K, x, z, 1.6 + R(), PC[i % 4])); }
  K.build(root, 60);
  const hills = mesh(root, plane(700, 140), M.hills, 0, 40, -260, 0, 0, 0, false); hills.renderOrder = -1;
  const sky = mesh(root, plane(1200, 500), M.sky, 0, 150, -320, 0, 0, 0, false);
  // busts: carved (2) and rough-blocked (1) versions
  const heads = {}; for (const k of ['W', 'J', 'T', 'L', 'JL']) { const [x, y, z, s, ry, rx] = RS_HEADS[k]; const full = k === 'JL' ? null : makeBust(root, k, { mat: M.granite, G: 0xd8d2c8, DD: 0x8a8480 });
    if (full) { full.position.set(x, y, z); full.scale.setScalar(s); full.rotation.set(rx, ry, 0, 'YXZ'); }
    const rough = mesh(root, lumpGeo(70 + k.length * 3 + k.charCodeAt(0), 2, 0.22), M.rock, x, y - 0.6, z, 0, ry, 0, true); rough.scale.set(s * 0.82, s * 1.05, s * 0.8); rough.material = M.rough;
    const neck = mesh(root, lumpGeo(90 + k.charCodeAt(0), 2, 0.3), M.rough, x, y - s * 1.75, z - 0.8, 0, 0.5, 0, true); neck.scale.set(s * 0.95, s * 0.75, s * 0.75);
    heads[k] = { full, rough, neck, s, base: [x, y, z] }; }
  const crack = mesh(root, plane(10, 12), M.crack, RS_HEADS.JL[0] + 0.6, RS_HEADS.JL[1] + 0.6, RS_HEADS.JL[2] + 5.3, 0, 0.2, 0, false); crack.renderOrder = 4;
  const ghost = nond(mesh(root, plane(46, 26), M.ghost, -1, 11.5, -29, 0, 0, 0, false)); ghost.renderOrder = 6;
  // bosun-chair cables + seats + a hoist house on top
  const rig = new THREE.Group(); root.add(rig); { const KR = new Kit();
    for (const [x, y, z] of RS_SEATS) { KR.beam(M.metal, [x, y + 0.45, z], [x - 0.5, 50, z - 10], 0.035, 0x2a2a30, true, 4); KR.box(M.plank, x - 0.38, x + 0.38, y + 0.4, y + 0.48, z - 0.2, z + 0.2, 0x8a6040, 0.01); for (const s of [-1, 1]) KR.beam(M.metal, [x + s * 0.36, y + 0.48, z], [x, y + 1.9, z], 0.012, 0x2a2a30, true, 3); }
    for (let i = 0; i < 6; i++) KR.beam(M.metal, [-30 + i * 9, 49, -48], [-28 + i * 9.5, 30 - (i % 3) * 4, -34 - (i % 2) * 3], 0.03, 0x3a3a40, true, 4);
    KR.at(-20, 47.5, -52, 0.2, () => { KR.box(M.plank, -2.4, 2.4, 0, 2.6, -1.8, 1.8, 0x8a6a48, 0.04); KR.put(M.paint, new THREE.BoxGeometry(5.4, 0.2, 4.2), 0, 2.9, 0, 0, 0, 0.12, 1, 1, 1, 0x5a4a44); KR.box(M.paint, -0.6, 0.6, 0, 1.9, 1.78, 1.84, 0x3a2a24, 0.01); });
    for (let i = 0; i < 4; i++) KR.box(M.plank, -26 + i * 0.6, -26 + i * 0.6 + 0.5, 46.5, 47.0, -46 + i * 0.4, -45.5 + i * 0.4, 0x8a6a48, 0.01); // stair bits
    KR.build(rig); }
  // flying debris (blasts)
  const debris = []; for (let i = 0; i < 18; i++) { const d = mesh(root, lumpGeo(100 + (i % 6), 1, 0.3), M.rough, 0, -50, 0, 0, 0, 0, false); d.scale.setScalar(0.35 + R() * 0.7); d.visible = false; d.userData.v = [(R() - 0.5) * 10, 4 + R() * 8, 3 + R() * 8]; debris.push(d); }
  // visitor terrace ("today"): stone wall + walk, banner pillars
  const terr = new THREE.Group(); root.add(terr); { const KT = new Kit(); KT.box(M.rock, -14, 14, 0, 0.12, 12, 40, 0xc8c0b0, 0.02); KT.box(M.rock, -14, 14, 0.12, 1.05, 12.0, 12.6, 0xb8b0a0, 0.05); KT.box(M.rock, -14.2, 14.2, 1.05, 1.18, 11.9, 12.7, 0xd0c8b8, 0.03);
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const z = 16 + i * 4.2, x = s * 6.5; KT.box(M.rock, x - 0.45, x + 0.45, 0, 3.6, z - 0.45, z + 0.45, 0xd8d0c0, 0.06); KT.beam(M.metal, [x, 3.6, z], [x, 7.2, z], 0.05, 0xc8c8d0, true, 6); }
    for (const [x, z] of [[-10, 15], [10, 18], [-11, 24]]) KT.put(M.leaf, lumpGeo(x + 30, 1, 0.3), x, 0.8, z, 0, 0, 0, 1.4, 1.0, 1.4, 0x3a6a3a);
    KT.build(terr); }
  const banners = []; for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const z = 16 + i * 4.2, x = s * 6.5, b = mesh(terr, plane(1.3, 1.9), M.banners[(i * 2 + (s > 0 ? 1 : 0)) % 6], x + s * 0.0, 6.1, z, 0, Math.PI / 2, 0, false); banners.push(b); }
  const dust = motes(root, 50, [-30, 30, 2, 40, -36, -20], 71, 0.08);
  return { heads, crack, ghost, rig, debris, terr, banners, hills, sky, dust };
}

// ================================================================= STUDIO (Borglum's studio)
function buildStudio(root) { const R = PT.rng(1930), K = new Kit(), X = 5.2, ZB = -3.8, HT = 3.6;
  mesh(root, planeUV(12, 10, 3, 3), M.plank, 0, 0, 0.5, -Math.PI / 2, 0, 0, false);
  K.box(M.darkwood, -X, X, 0, HT, ZB - 0.2, ZB, 0xb08a68, 0.01); for (const s of [-1, 1]) K.box(M.darkwood, s > 0 ? X : -X - 0.2, s > 0 ? X + 0.2 : -X, 0, HT, ZB, 5, 0xb08a68, 0.01);
  mesh(root, plane(2 * X, 10), H.toon({ color: 0x4a3626, side: THREE.DoubleSide }), 0, HT, 0.5, Math.PI / 2, 0, 0, false); for (let i = 0; i < 4; i++) K.box(M.darkwood, -X, X, HT - 0.24, HT - 0.04, -3.2 + i * 2.2, -3.0 + i * 2.2, 0xffffff, 0.02);
  // big window onto the mountain (back right)
  const win = mesh(root, plane(3.0, 1.9), M.winMt, 2.6, 2.0, ZB + 0.02, 0, 0, 0, false); K.box(M.plank, 1.0, 4.2, 0.98, 1.06, ZB, ZB + 0.16, 0xe8e0d0, 0.01); for (const x of [1.05, 2.6, 4.15]) K.box(M.plank, x - 0.05, x + 0.05, 1.04, 2.98, ZB, ZB + 0.08, 0xe8e0d0, 0.005); K.box(M.plank, 1.0, 4.2, 2.94, 3.02, ZB, ZB + 0.08, 0xe8e0d0, 0.005);
  // wall plans (back left): the history inscription + Hall of Records cross-section
  const ent = mesh(root, plane(1.5, 1.5), M.ent, -3.4, 2.1, ZB + 0.03, 0, 0, 0.02, false); const hor = mesh(root, plane(1.5, 1.5), M.hor, -1.6, 2.1, ZB + 0.03, 0, 0, -0.02, false);
  for (const [x, y] of [[-4.1, 2.8], [-2.7, 2.8], [-2.3, 2.8], [-0.9, 2.8]]) K.put(M.paint, sph(0.03, 8, 6), x, y, ZB + 0.05, 0, 0, 0, 1, 1, 1, 0xc8302a);
  // the plaster model: four waist-length figures on a rock base, on a pedestal (centre)
  const MX = -0.4, MZ = -1.6, MY = 1.0; K.box(M.darkwood, MX - 0.9, MX + 0.9, 0, MY, MZ - 0.6, MZ + 0.6, 0x6a4028, 0.04);
  K.put(M.plaster, lumpGeo(5, 2, 0.15), MX, MY + 0.12, MZ - 0.1, 0, 0, 0, 0.95, 0.22, 0.55, 0xd8d0c4);
  const model = new THREE.Group(); root.add(model); model.position.set(MX, MY + 0.2, MZ); { const KM = new Kit();
    const xs = { W: -0.62, J: -0.22, T: 0.16, L: 0.55 }, zs = { W: 0.08, J: -0.08, T: -0.2, L: 0.0 }, hs = 0.15;
    for (const k of ['W', 'J', 'T', 'L']) { const x = xs[k], z = zs[k]; KM.at(x, 0.0, z, 0, () => {
      KM.put(M.plaster, lumpGeo(400 + k.charCodeAt(0), 2, 0.06), 0, 0.3, 0, 0, 0, 0, 0.2, 0.3, 0.12, 0xd6cfc2); KM.put(M.plaster, sph(1, 18, 12), 0, 0.55, 0, 0, 0, 0, 0.25, 0.08, 0.13, 0xd6cfc2); // coat torso + shoulders
      for (const s of [-1, 1]) KM.put(M.plaster, new THREE.BoxGeometry(0.02, 0.24, 0.02), s * 0.045, 0.42, 0.115, 0, 0, s * 0.35, 1, 1, 1, 0xd8d0c2); // lapels
      KM.put(M.plaster, cyl(0.05, 0.06, 0.1, 10), 0, 0.62, 0, 0, 0, 0, 1, 1, 1, 0xd6cfc2); });
      const hd = new THREE.Mesh(headGeo(k, 0xdcd5c8), M.plaster); hd.scale.setScalar(hs); hd.position.set(x, 0.7 + hs * 0.55, z); hd.castShadow = true; model.add(hd);
      if (k === 'T') for (const s of [-1, 1]) KM.put(M.plaster, new THREE.TorusGeometry(0.15 * hs, 0.02 * hs, 6, 16), x + s * 0.27 * hs, 0.7 + hs * 0.62, z + 0.83 * hs, 0, 0, 0, 1, 1, 1, 0xf2ece2); }
    KM.build(model, 0); }
  // drafting table (right) with plans; desk + lamp (left front); hat stand; chair
  K.at(2.8, 0, -1.2, -0.3, () => { K.put(M.plank, new THREE.BoxGeometry(1.4, 0.05, 1.0), 0, 1.0, 0, -0.35, 0, 0, 1, 1, 1, 0xb08a60); for (const a of [-0.6, 0.6]) for (const b of [-0.4, 0.4]) K.beam(M.plank, [a, 0, b], [a, 0.95, b * 0.8], 0.03, 0x5a3a24, true, 5); K.put(M.paint, new THREE.BoxGeometry(1.0, 0.01, 0.7), 0, 1.03, 0.02, -0.35, 0, 0.03, 1, 1, 1, 0x3a6ab8); for (let i = 0; i < 3; i++) K.put(M.paint, cyl(0.03, 0.03, 0.8, 8), -0.2 + i * 0.12, 0.92, 0.55, 0, 0, Math.PI / 2, 1, 1, 1, [0xe8e0d0, 0x3a6ab8, 0xe8e0d0][i]); });
  const DX = -2.6, DZ = 0.6; K.box(M.plank, DX - 0.9, DX + 0.9, 0.74, 0.8, DZ - 0.5, DZ + 0.5, 0x5a3420, 0.03); for (const s of [-1, 1]) K.box(M.plank, DX + s * 0.7 - 0.18, DX + s * 0.7 + 0.18, 0, 0.74, DZ - 0.45, DZ + 0.45, 0x4a2a18, 0.02);
  K.at(DX - 0.6, 0.8, DZ - 0.25, 0.3, () => { K.put(M.brass, cyl(0.08, 0.1, 0.03, 12), 0, 0.015, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); K.beam(M.brass, [0, 0, 0], [0.05, 0.4, 0], 0.012, 0xc8a050, true, 6); K.put(M.paint, new THREE.ConeGeometry(0.12, 0.14, 14, 1, true), 0.1, 0.42, 0, 0, 0, 0.4, 1, 1, 1, 0x2a5a3a); });
  K.at(DX - 0.1, 0, DZ + 0.95, Math.PI, () => { K.box(M.plank, -0.25, 0.25, 0.45, 0.5, -0.25, 0.25, 0x6a4028, 0.02); K.box(M.plank, -0.25, 0.25, 0.5, 1.05, 0.2, 0.26, 0x6a4028, 0.02); for (const a of [-0.2, 0.2]) for (const b of [-0.2, 0.2]) K.box(M.plank, a - 0.025, a + 0.025, 0, 0.45, b - 0.025, b + 0.025, 0x4a2a18, 0.01); });
  K.at(4.4, 0, 1.4, 0, () => { K.beam(M.darkwood, [0, 0, 0], [0, 1.8, 0], 0.03, 0x3a2418, true, 6); for (let i = 0; i < 4; i++) K.beam(M.darkwood, [0, 1.7, 0], [Math.cos(i * 1.57) * 0.18, 1.78, Math.sin(i * 1.57) * 0.18], 0.012, 0x3a2418, true, 4); });
  // clutter: sculpting tools, plaster busts on a shelf, a bucket, sketches
  for (let j = 0; j < 2; j++) { K.box(M.plank, -X + 0.1, -X + 0.6, 0.9 + j * 0.7, 0.94 + j * 0.7, -2.6, 0.6, 0x8a5a38, 0.01); for (let i = 0; i < 4; i++) K.put(M.plaster, sph(0.12, 12, 10), -X + 0.35, 1.06 + j * 0.7, -2.3 + i * 0.75, 0, 0, 0, 0.8, 1.1, 0.9, 0xe8e2d6); }
  K.put(M.metal, cyl(0.18, 0.15, 0.32, 14), 1.4, 0.16, 0.9, 0, 0, 0, 1, 1, 1, 0x7a7a84); for (let i = 0; i < 4; i++) K.beam(M.metal, [1.2 + i * 0.08, 0.81, -0.9], [1.25 + i * 0.08, 0.81, -0.6], 0.008, 0x9a9aa4);
  // night props: empty cash box, budget sheet, the hat on the chair
  const night = new THREE.Group(); root.add(night); { const KN = new Kit(); KN.at(DX + 0.35, 0.8, DZ + 0.05, -0.2, () => { KN.box(M.metal, -0.18, 0.18, 0, 0.1, -0.12, 0.12, 0x3a5a4a, 0.01); KN.box(M.metal, -0.18, 0.18, 0.1, 0.12, -0.36, -0.12, 0x3a5a4a, 0.01); KN.box(M.paint, -0.16, 0.16, 0.012, 0.02, -0.1, 0.1, 0x1a1a1a, 0.002); });
    KN.at(DX - 0.1, 0.45, DZ + 0.95, 0, () => { KN.put(M.cloth, cyl(0.26, 0.26, 0.03, 20), 0, 0.53, 0, 0, 0, 0, 1, 1, 1, 0x7a6a52); KN.put(M.cloth, cyl(0.13, 0.15, 0.16, 16), 0, 0.62, 0, 0, 0, 0, 1, 1, 1, 0x7a6a52); KN.put(M.cloth, cyl(0.152, 0.152, 0.03, 16), 0, 0.56, 0, 0, 0, 0, 1, 1, 1, 0x3a2a20); });
    KN.build(night); }
  const bill = mesh(night, plane(0.3, 0.38), M.bill, DX - 0.15, 0.805, DZ + 0.12, -Math.PI / 2, 0, 0.25, false);
  K.build(root, 0);
  const lampG = glowAt(root, [DX - 0.5, 1.22, DZ - 0.25], 1.0, '#ffc070', 0.5);
  const shaft = shaftAt(root, [2.6, 1.5, ZB + 1.5], 2.6, 3.6, 0.25, 0.5, 0.15, 0xfff0d0);
  const dust = motes(root, 60, [-3, 4, 0.4, 3, -3.5, 1], 73, 0.011);
  return { win, ent, hor, model, night, lampG, shaft, dust, MX, MY, MZ, DX, DZ };
}

// ================================================================= TUNNEL (canyon + Hall of Records)
function buildTunnel(root) { const R = PT.rng(1938), K = new Kit();
  mesh(root, planeUV(40, 60, 6, 8), M.rock, 0, 0, -10, -Math.PI / 2, 0, 0, false);
  const L = (x, y, z, sx, sy, sz, seed, c = 0xb8b2a8) => K.put(M.rock, lumpGeo(seed, 2, 0.24), x, y, z, R() * 0.4, R() * 6, 0, sx, sy, sz, c);
  // canyon walls left/right, the back cliff with the tunnel mouth (opening x -1.3..1.3, y 0..3)
  for (let i = 0; i < 7; i++) { L(-6.5 - R() * 2, 3 + i * 0.4, 8 - i * 3.2, 4, 7 + R() * 3, 3.5, 200 + i); L(6.5 + R() * 2, 3 + i * 0.4, 8 - i * 3.2, 4, 7 + R() * 3, 3.5, 220 + i); }
  L(-5.2, 5, -1.8, 4, 6, 2.2, 240); L(5.2, 5, -1.8, 4, 6, 2.2, 241); L(0, 8.4, -2.0, 4, 4.6, 2.2, 242); L(0, 14, -6, 12, 8, 6, 243, 0xc2bcb2);
  // tunnel interior: rough walls (inward lumps) along z 0..-21, tapering, dark back
  for (let i = 0; i < 14; i++) { const z = -0.6 - i * 1.5, w = 1.45 - i * 0.03, hgt = 3.1 - i * 0.05; L(-w - 0.5, hgt * 0.5, z, 0.7, hgt * 0.62, 0.95, 260 + i, 0xa8a29a); L(w + 0.5, hgt * 0.5, z, 0.7, hgt * 0.62, 0.95, 280 + i, 0xa8a29a); L(0, hgt + 0.45, z, w * 1.2, 0.6, 0.95, 300 + i, 0x9a948c); }
  L(0, 1.4, -21.6, 1.6, 1.8, 0.8, 320, 0x6a665e);
  for (let i = 0; i < 30; i++) K.put(M.rock, lumpGeo(330 + (i % 5), 1, 0.3), (R() - 0.5) * 2.2, 0.08, -R() * 20, R(), R() * 6, 0, 0.14 + R() * 0.2, 0.1 + R() * 0.1, 0.14 + R() * 0.2, 0x9a948c);
  // work-lamp cable along the ceiling
  K.beam(M.paint, [0, 2.75, 1.0], [0, 2.4, -20], 0.012, 0x1a1a22, true, 4); const bulbs = []; for (let i = 0; i < 6; i++) { const z = -1 - i * 3.6, y = 2.72 - i * 0.07; bulbs.push(mesh(root, sph(0.06, 10, 8), M.bulb, 0, y - 0.12, z, 0, 0, 0, false)); K.beam(M.paint, [0, y, z], [0, y - 0.08, z], 0.01, 0x1a1a22); }
  // signs, tools and crates outside
  const sign = mesh(root, plane(2.4, 0.6), M.signHall, 0, 3.6, -0.75, 0, 0, 0, false); const s70 = mesh(root, plane(0.8, 0.4), M.sign70, -1.7, 1.6, -0.6, 0, 0.3, 0, false);
  for (let i = 0; i < 3; i++) K.box(M.plank, 3.0 + i * 0.1, 3.7 + i * 0.1, i * 0.5, 0.48 + i * 0.5, 1.4 - i * 0.3, 2.0 - i * 0.3, 0x8a6a48, 0.02);
  K.at(-3.2, 0, 2.2, 0.4, () => { K.beam(M.plank, [0, 0, 0], [0.1, 1.1, 0.3], 0.03, 0x8a6040); K.box(M.metal, -0.15, 0.15, 0, 0.05, -0.1, 0.1, 0x6a6a74, 0.01); });
  // 1998: the floor vault at the entry: recess, teak box, panels, the capstone on a hoist
  const v98 = new THREE.Group(); root.add(v98); { const KV = new Kit(); KV.box(M.rock, -0.95, 0.95, 0, 0.05, 0.6, 2.2, 0x8a847c, 0.01); KV.box(M.paint, -0.62, 0.62, 0.0, 0.052, 1.0, 1.8, 0x141018, 0.002);
    KV.box(M.metal, -0.56, 0.56, -0.5, 0.05, 1.06, 1.74, 0x9aa0aa, 0.01); KV.box(M.teak, -0.46, 0.46, -0.4, 0.14, 1.14, 1.66, 0xffffff, 0.02);
    for (const s of [-1, 1]) KV.beam(M.metal, [s * 1.3, 0, 1.4], [0, 3.6, 1.4], 0.05, 0x5a5a64, true, 6); KV.build(v98); }
  const panels = []; for (let i = 0; i < 5; i++) panels.push(mesh(v98, plane(0.26, 0.34), M.panel, -0.32 + i * 0.16, 0.24, 1.4, 0, 0, 0, false));
  const cap = new THREE.Group(); v98.add(cap); { const KC = new Kit(); KC.box(M.granite, -0.75, 0.75, 0, 0.22, -0.48, 0.48, 0xd0cac0, 0.04); KC.beam(M.metal, [0, 0.22, 0], [0, 3.4, 0], 0.012, 0x2a2a30, true, 4); KC.build(cap); } cap.position.set(0, 2.2, 1.4);
  K.build(root, 0);
  const glows = bulbs.map((b) => glowAt(root, b.position.toArray(), 1.2, '#ffc070', 0.5));
  const dust = motes(root, 70, [-1.2, 1.2, 0.2, 2.8, -12, 2], 79, 0.012);
  return { bulbs, glows, v98, panels, cap, sign, s70, dust };
}

// ================================================================= lights, grades, API
const SET_LIGHT = {
  mToday: { top: '#3a76d8', hor: '#cfe0f2', fog: '#c8d6e8', fogN: 90, fogF: 420, sky: '#a8bcf0', ground: '#5a6040', hemiI: 0.78, fillCol: '#7d93e6', fillI: 0.34, sunCol: '#fff0d0', sunI: 3.6, az: -55, el: 34, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0.3 },
  m1927: { top: '#4a82d8', hor: '#dce6f0', fog: '#d6e0ea', fogN: 90, fogF: 420, sky: '#b0c4f0', ground: '#6a6448', hemiI: 0.76, fillCol: '#7d93e6', fillI: 0.34, sunCol: '#fff4d8', sunI: 3.6, az: -45, el: 40, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0.2 },
  mWork: { top: '#3a70d0', hor: '#d8e4f0', fog: '#d0dcea', fogN: 90, fogF: 420, sky: '#a8bcf0', ground: '#6a6048', hemiI: 0.76, fillCol: '#7d93e6', fillI: 0.35, sunCol: '#fff0d0', sunI: 3.7, az: -50, el: 38, disc: '#fffbe8', discSize: 0.002, clouds: true, stars: 0, cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0.3 },
  mGold: { top: '#3a5ab0', hor: '#ffd0a0', fog: '#e8c8b0', fogN: 80, fogF: 380, sky: '#9a90d8', ground: '#5a4a40', hemiI: 0.8, fillCol: '#6a6ad8', fillI: 0.4, sunCol: '#ffd8a8', sunI: 3.2, az: -40, el: 30, disc: '#ffe0b0', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0.5 },
  m41: { top: '#3a4a9a', hor: '#e8b8a0', fog: '#c0a8b0', fogN: 70, fogF: 340, sky: '#8a80c8', ground: '#4a3a40', hemiI: 0.78, fillCol: '#6a6ad8', fillI: 0.42, sunCol: '#ffd0a8', sunI: 2.8, az: -45, el: 12, disc: '#ffd0a0', discSize: 0.004, clouds: true, stars: 0, cardTint: '#ffece2', fxTint: '#ffffff', shafts: 0.4 },
  mSunset: { top: '#3a3a8a', hor: '#ffb070', fog: '#e0a890', fogN: 70, fogF: 340, sky: '#8a70c8', ground: '#4a3438', hemiI: 0.8, fillCol: '#6a5ad8', fillI: 0.44, sunCol: '#ffc890', sunI: 3.2, az: -50, el: 9, disc: '#ffe0a0', discSize: 0.005, clouds: true, stars: 0, cardTint: '#ffe8d8', fxTint: '#ffffff', shafts: 0.6 },
  mDawn: { top: '#4a6ab8', hor: '#ffd8b0', fog: '#f0d8c0', fogN: 80, fogF: 380, sky: '#9a90d8', ground: '#5a4a50', hemiI: 0.9, fillCol: '#7078d8', fillI: 0.34, sunCol: '#ffd8b0', sunI: 3.4, az: -40, el: 14, disc: '#fff0c8', discSize: 0.004, clouds: true, stars: 0, cardTint: '#fff2e2', fxTint: '#fff6ea', shafts: 0.6 },
  studioDay: { top: '#000000', hor: '#3a2618', fog: '#3a2618', fogN: 12, fogF: 60, sky: '#ffe8c8', ground: '#6a4a2a', hemiI: 0.9, fillCol: '#8a90c8', fillI: 0.32, sunCol: '#fff0d0', sunI: 2.6, az: -160, el: 35, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff4e8', fxTint: '#ffffff', shafts: 0 },
  studioNight: { top: '#000000', hor: '#141a30', fog: '#141a30', fogN: 10, fogF: 50, sky: '#7a7ab8', ground: '#3a2a30', hemiI: 0.62, fillCol: '#5a68c8', fillI: 0.45, sunCol: '#a8b8ff', sunI: 1.1, az: 160, el: 35, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ece8ff', fxTint: '#ffffff', shafts: 0 },
  tunnel41: { top: '#000000', hor: '#1a1418', fog: '#1a1418', fogN: 8, fogF: 40, sky: '#ffc890', ground: '#4a3a30', hemiI: 0.6, fillCol: '#5a58b8', fillI: 0.4, sunCol: '#ffc888', sunI: 1.6, az: 20, el: 40, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
  tunnel98: { top: '#000000', hor: '#2a2420', fog: '#2a2420', fogN: 10, fogF: 50, sky: '#ffe8d0', ground: '#6a5a4a', hemiI: 0.9, fillCol: '#8a90d8', fillI: 0.35, sunCol: '#fff4e0', sunI: 2.8, az: 20, el: 50, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff6ee', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  mToday: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.1, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.36, 0.86], vig: [0.26, 0.5, '#4a3a5a'] } },
  m1927: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.06, tS: ['#3a4a8a', 0.14], tH: ['#ffe4b8', 0.08], bloom: [0.36, 0.86], vig: [0.28, 0.5, '#4a3a5a'] } },
  mWork: { look: 'day', over: { exp: 1.04, con: 1.22, sat: 1.1, tS: ['#3a4a8a', 0.14], tH: ['#ffe0b0', 0.06], bloom: [0.36, 0.86], vig: [0.26, 0.5, '#4a3a5a'] } },
  mGold: { look: 'golden', over: { exp: 1.06, con: 1.24, sat: 1.04, tS: ['#3a2a8a', 0.2], tH: ['#ffc8a0', 0.06], bloom: [0.46, 0.74], hal: [0.14, '#ffb080'], vig: [0.34, 0.46, '#1e1a3a'] } },
  m41: { look: 'golden', over: { exp: 1.04, con: 1.24, sat: 1.0, tS: ['#2a2a7a', 0.24], tH: ['#ffc0a0', 0.06], bloom: [0.44, 0.74], hal: [0.12, '#ffa080'], vig: [0.38, 0.44, '#14102a'] } },
  mSunset: { look: 'golden', over: { exp: 1.06, con: 1.24, sat: 1.06, tS: ['#2a2a8a', 0.22], tH: ['#ffb890', 0.08], bloom: [0.5, 0.7], hal: [0.16, '#ff9a70'], vig: [0.36, 0.44, '#1a1030'] } },
  mDawn: { look: 'golden', over: { exp: 1.06, con: 1.22, sat: 1.04, tS: ['#3a3a8a', 0.18], tH: ['#ffd8b0', 0.06], bloom: [0.42, 0.78], hal: [0.12, '#ffb880'], vig: [0.3, 0.48, '#1e1a3a'] } },
  studioDay: { look: 'office', over: { exp: 1.12, con: 1.22, sat: 1.08, lift: [0.03, 0.022, 0.04], tS: ['#3a2a6a', 0.16], tH: ['#ffd8a0', 0.1], bloom: [0.42, 0.78], hal: [0.24, '#ffa860'], vig: [0.32, 0.46, '#2a1420'] } },
  studioNight: { look: 'night', over: { exp: 1.16, con: 1.22, sat: 1.04, lift: [0.025, 0.028, 0.06], tS: ['#1a2a7a', 0.26], tH: ['#ffc070', 0.14], bloom: [0.5, 0.68], hal: [0.3, '#ffa050'], vig: [0.42, 0.42, '#08081a'] } },
  tunnel41: { look: 'office', over: { exp: 1.14, con: 1.24, sat: 1.06, lift: [0.035, 0.02, 0.05], tS: ['#2a1a6a', 0.22], tH: ['#ffc070', 0.14], bloom: [0.48, 0.7], hal: [0.3, '#ff9a50'], vig: [0.44, 0.4, '#14081a'] } },
  tunnel98: { look: 'office', over: { exp: 1.1, con: 1.2, sat: 1.1, lift: [0.03, 0.022, 0.04], tS: ['#3a2a6a', 0.14], tH: ['#ffe0b8', 0.08], bloom: [0.42, 0.8], hal: [0.22, '#ffb070'], vig: [0.3, 0.48, '#2a1420'] } },
};

export function buildRS(ctx) {
  initDoh(ctx); ({ THREE, PT } = H); M = materials();
  const ST = { mood: 'mToday', heads: { W: 2, J: 2, T: 2, L: 2, JL: 0 }, crack: 0, ghost: 0, rig: 0, terr: 1, blast: null, cap: 1, vault: 0 };
  let mt, sd, tn;
  const API = makeAPI(ctx, { prefix: 'rs_', origin: RS_ORIGIN, groupOf: GROUP_OF, light: SET_LIGHT, grade: SET_GRADE,
    base: { mToday: 'day', m1927: 'day', mWork: 'day', mGold: 'day', m41: 'day', mSunset: 'day', mDawn: 'day' },
    practicals: (name, F, W3) => { const fl = 1 + 0.05 * Math.sin(F * 0.7) + 0.03 * Math.sin(F * 1.9);
      if (name.startsWith('studio')) return [{ p: W3('studio', [-3.1, 1.25, 0.35]), col: '#ffc070', I: (name === 'studioNight' ? 5 : 2.5) * fl, d: 6 }, { p: W3('studio', [2.6, 2.0, -3.2]), col: name === 'studioNight' ? '#7a8aff' : '#fff0d8', I: 3.5, d: 8 }, { p: W3('studio', [-0.4, 2.6, -0.6]), col: '#ffe0b8', I: name === 'studioNight' ? 1.2 : 3, d: 6 }];
      if (name.startsWith('tunnel')) { const t98 = name === 'tunnel98'; return [{ p: W3('tunnel', [0, 2.5, -1.5]), col: '#ffc070', I: 4 * fl, d: 7 }, { p: W3('tunnel', [0, 2.3, -9]), col: '#ffc070', I: 3.5 * fl, d: 7 }, { p: W3('tunnel', [0, 2.2, -16]), col: '#ffb060', I: 2.5 * fl, d: 6 }, { p: W3('tunnel', [0, 3.0, 3.0]), col: '#fff0d8', I: t98 ? 5 : 1.5, d: 9 }]; }
      return []; },
    tick: (f, cur) => { const T = f / 30;
      if (cur === 'mount' && mt) { tickMotes(mt.dust, f, 0.6); mt.banners.forEach((b, i) => { b.rotation.y = Math.PI / 2 + 0.25 * Math.sin(T * 2.2 + i * 0.9); });
        const B = ST.blast; mt.debris.forEach((d, i) => { if (!B || B.t <= 0 || B.t >= 1) { d.visible = false; return; } const v = d.userData.v, t = B.t * 1.6, k = B.k || 1; d.visible = true; d.position.set(B.at[0] + v[0] * t * k, B.at[1] + v[1] * t * k - 9 * t * t * k, B.at[2] + v[2] * t * k); d.rotation.set(t * 4 + i, t * 3, 0); }); }
      if (cur === 'studio' && sd) { sd.lampG.material.opacity = sd.lampG.userData.op * (0.92 + 0.08 * Math.sin(f * 0.8)); tickMotes(sd.dust, f, 0.3); }
      if (cur === 'tunnel' && tn) { tn.glows.forEach((g, i) => (g.material.opacity = g.userData.op * (0.85 + 0.15 * Math.sin(f * 0.9 + i)))); tickMotes(tn.dust, f, 0.4); } },
    mood: (name) => { ST.mood = name; if (sd) { const n = name === 'studioNight'; sd.night.visible = n; sd.win.material = n ? M.winMtN : M.winMt; sd.shaft.visible = !n; }
      if (tn) { tn.v98.visible = name === 'tunnel98'; }
      if (mt) mt.sky.material.color.set({ mToday: 0x9ac0f8, m1927: 0xa8c8f8, mWork: 0x9ac0f8, mGold: 0xff9a80, m41: 0xc88a9a, mSunset: 0xff8a6a, mDawn: 0xffb88a }[name] || 0x9ac0f8);
      applyState(); },
    apply: (v) => { if (v.st) API.state(v.st); } });
  function applyState() { if (mt) { for (const k in mt.heads) { const h = mt.heads[k], s = ST.heads[k] || 0; if (h.full) h.full.visible = s === 2; h.rough.visible = s === 1; h.neck.visible = s > 0; }
      mt.crack.material.opacity = ST.crack; mt.crack.visible = ST.crack > 0.01 && ST.heads.JL === 1; mt.ghost.material.opacity = ST.ghost; mt.ghost.visible = ST.ghost > 0.01; mt.rig.visible = !!ST.rig; mt.terr.visible = !!ST.terr; }
    if (tn) { tn.cap.position.y = 0.05 + 2.2 * ST.cap; tn.panels.forEach((p, i) => { p.visible = ST.vault > i * 0.18; p.position.y = 0.24 - 0.2 * Math.max(0, Math.min(1, (ST.vault - i * 0.18) * 3)) * 0; }); } }
  mt = buildMount(API.groups.mount); sd = buildStudio(API.groups.studio); tn = buildTunnel(API.groups.tunnel);
  API.parts = { mt, sd, tn };
  // state: { heads: {W,J,T,L,JL: 0|1|2}, crack 0..1, ghost 0..1, rig 0|1, terr 0|1, blast: {t, at:[set-local], k}, cap 0..1 (1 = up), vault 0..1 (panels in) }
  API.state = (s) => { if (s.heads) ST.heads = { ...ST.heads, ...s.heads }; for (const k of ['crack', 'ghost', 'rig', 'terr', 'cap', 'vault']) if (s[k] != null) ST[k] = s[k];
    ST.blast = s.blast || null; applyState(); };
  API.glows = { studio: [sd.lampG], tunnel: tn.glows };
  API.face = () => { const cam = H.CAM; if (!cam) return; for (const g of API.glows[API.cur] || []) g.quaternion.copy(cam.quaternion); if (API.cur === 'mount' && mt) mt.ghost.visible = mt.ghost.visible; };
  const V = API.V;
  API.views = [
    V('mToday', [0, 7, 32], [-1, 30, -40], 46, 0.8, [-1, 30, -40], { st: { heads: { W: 2, J: 2, T: 2, L: 2, JL: 0 }, terr: 1, rig: 0, ghost: 0 } }), // 0 today wide
    V('mToday', [0, 7, 32], [-1, 24, -40], 46, 0.8, [-1, 24, -40], { st: { heads: { W: 2, J: 2, T: 2, L: 2, JL: 0 }, terr: 1, rig: 0, ghost: 1 } }), // 1 ghost bodies
    V('m1927', [6, 4, 10], [-2, 26, -40], 46, 0.8, [-2, 26, -40], { st: { heads: { W: 0, J: 0, T: 0, L: 0, JL: 0 }, terr: 0, rig: 0, ghost: 0 } }), // 2 raw mountain
    V('mWork', [-8, 30, -14], [-18, 31, -34], 44, 1.0, [-18, 31, -34], { st: { heads: { W: 2, J: 0, T: 0, L: 0, JL: 1 }, terr: 0, rig: 1, ghost: 0 } }), // 3 work close
    V('mGold', [-12, 26, 0], [-16, 32, -40], 46, 0.9, [-16, 32, -40], { st: { heads: { W: 2, J: 0, T: 0, L: 0, JL: 1 }, terr: 0, rig: 1, crack: 1, ghost: 0 } }), // 4 cracked Jefferson
    V('m41', [2, 20, 8], [-1, 34, -40], 46, 0.9, [-1, 34, -40], { st: { heads: { W: 2, J: 2, T: 2, L: 2, JL: 0 }, terr: 0, rig: 1, ghost: 0 } }), // 5 1941
    V('mSunset', [0, 9, 26], [-1, 28, -40], 46, 0.8, [-1, 28, -40], { st: { heads: { W: 2, J: 2, T: 2, L: 2, JL: 0 }, terr: 1, rig: 0, ghost: 0.6 } }), // 6 sunset
    V('mWork', [-14, 37, -12], [-14, 33, -37], 40, 1.2, [-14, 33, -37], { st: { heads: { W: 2, J: 2, T: 2, L: 2, JL: 0 }, terr: 0, rig: 0 } }), // 7 Washington close
    V('mWork', [10, 35, -14], [10, 33, -39], 40, 1.2, [10, 33, -39], { st: { heads: { W: 2, J: 2, T: 2, L: 2, JL: 0 }, terr: 0, rig: 0 } }), // 8 Lincoln close
    V('studioDay', [1.2, 1.6, 2.2], [-0.4, 1.4, -1.6], 44, 1.2, [-0.4, 1.5, -1.6]), // 9 model
    V('studioDay', [-1.6, 1.9, 0.8], [-2.5, 2.0, -3.8], 44, 1.4, [-2.5, 2.0, -3.8]), // 10 wall plans
    V('studioNight', [-1.0, 1.5, 2.6], [-2.6, 0.9, 0.6], 44, 1.4, [-2.6, 0.9, 0.6]), // 11 desk night
    V('tunnel41', [0.4, 1.7, 7], [0, 1.6, -14], 46, 1.0, [0, 1.6, -4]), // 12 tunnel
    V('mToday', [0, 30, 110], [0, 30, -40], 30, 0.5, null, { st: { heads: { W: 2, J: 2, T: 2, L: 2, JL: 0 }, terr: 0, rig: 0, ghost: 0 } }), // 14 debug front far
    V('mToday', [0, 140, -20], [0, 0, -40], 40, 0.5, null, { st: { heads: { W: 2, J: 2, T: 2, L: 2, JL: 0 }, terr: 0, rig: 0, ghost: 0 } }), // 15 debug top
    V('tunnel98', [1.8, 2.2, 4.2], [0, 0.4, 1.4], 44, 1.4, [0, 0.4, 1.4], { st: { cap: 0.6, vault: 1 } }), // 13 vault
  ];
  API.state({}); API.tick(0);
  return API;
}
