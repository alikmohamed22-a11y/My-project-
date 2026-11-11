// pills.js [KCH-sets2]: sets for "Ketchup was sold as medicine" (Oddverra short), Ohio 1830s.
//   workshop : Archibald Miles' Cleveland pill workshop, 1837, evening amber: wooden pill machine (grooved brass plate + grooved
//              cutter board with two handles; the cutter rolls back and forth in tick and pills tumble into the tray), mortar &
//              pestle (grinds), heaps / tubs of brown pills, stacks of round pill boxes, paper-labelled bottles
//              "DR. MILES' COMPOUND EXTRACT OF TOMATO", shelves of apothecary jars, red + green show globes glowing in the window,
//              iron cash box + coin stacks (cash(t)), oil lamps, herb bundles; a crate of fresh tomatoes in the corner, untouched
//              (cobweb + dust) - the story gag.                                                        origin (-16500, 0, 0)
//   press    : 1830s print shop, warm afternoon: wooden common hand press (bar pulls in tick), slanted type cases, ink balls,
//              broadsheets drying on lines, and the AD-WAR WALL: Miles' red posters (left) vs Phelps' green posters (right) of a
//              central post; ads(t) 0..1 piles posters up over each other.                              origin (-16500, 0, 200)
//   lab      : the expose, night: chemist's bench in blue-violet moonlight with a candle + oil lamp, big magnifying glass on a
//              stand, a pill cut in half on a white dish, test tubes, balance scales, open notebook, spirit lamp + flask;
//              plus a MACRO stage (giant halved pill, plain brown filling) and the verdict card "NO TOMATO" (verdict(t)).
//                                                                                                       origin (-16500, 0, 400)
// Each set: local frame, floor y = 0, camera side +z. All groups start hidden; show(world, name) displays one.
import { Kit } from './world.js';
import { LIGHTS_ } from './story.js';

let THREE, toon, mkTex, PT, NOND, CAM, M;
export const PILLS_ORIGIN = { workshop: [-16500, 0, 0], press: [-16500, 0, 200], lab: [-16500, 0, 400] };
const O = PILLS_ORIGIN, SETS = Object.keys(O);
const W3 = (name, p) => [p[0] + O[name][0], p[1] + O[name][1], p[2] + O[name][2]];
const INK = '#2b1d4a', TAU = Math.PI * 2, MAC = [40, 0, 0]; // lab macro stage offset (local)
const clamp01 = (x) => Math.max(0, Math.min(1, x)), smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const backOut = (x) => { x = clamp01(x); const s = 2.2; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };

// ---------------------------------------------------------------- geometry helpers
const GC = new Map();
const cached = (k, mk) => { let g = GC.get(k); if (!g) GC.set(k, (g = mk())); return g; };
const cyl = (rt, rb, h, rs = 14, open = false) => cached(`c${rt}|${rb}|${h}|${rs}|${open}`, () => new THREE.CylinderGeometry(rt, rb, h, rs, 1, open));
const band = (r, h, arc, rs = 16) => cached(`b${r}|${h}|${arc}`, () => new THREE.CylinderGeometry(r, r, h, rs, 1, true, -arc / 2, arc));
const sph = (r, ws = 12, hs = 9) => cached(`s${r}|${ws}|${hs}`, () => new THREE.SphereGeometry(r, ws, hs));
const hemi = (r, ws = 24, hs = 10) => cached(`h${r}|${ws}`, () => new THREE.SphereGeometry(r, ws, hs, 0, TAU, 0, Math.PI / 2));
const tor = (r, t, rs = 8, ts = 28, arc = TAU) => cached(`t${r}|${t}|${rs}|${ts}|${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));
const cone = (r, h, rs = 10) => cached(`k${r}|${h}|${rs}`, () => new THREE.ConeGeometry(r, h, rs));
const plane = (w, h) => cached(`p${w}|${h}`, () => new THREE.PlaneGeometry(w, h));
const disc = (r, n = 32) => cached(`d${r}|${n}`, () => new THREE.CircleGeometry(r, n));
const lathe = (key, pts, n = 20) => cached('la' + key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n));
const mesh = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, shadow = true) => { if (mat.vertexColors && !geo.attributes.color && geo.attributes.position) geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(1), 3)); const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz, 'YXZ'); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
const nond = (o) => { if (NOND) NOND.add(o); o.castShadow = false; o.receiveShadow = false; return o; };
const lumpGeo = (seed, det = 1) => cached('lump' + seed + '|' + det, () => { const g = new THREE.IcosahedronGeometry(1, det), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), h = Math.sin(x * 5.9898 + y * 7.233 + z * 3.719 + seed * 4.1) * 43758.5453, k = 0.8 + 0.3 * (h - Math.floor(h)); p.setXYZ(i, x * k, y * k, z * k); }
  g.computeVertexNormals(); return g; });

// ---------------------------------------------------------------- painters
const css = (...a) => PT.css(...a), rng = (...a) => PT.rng(...a), fbm = (...a) => PT.fbm(...a), modulate = (...a) => PT.modulate(...a);
const SERIF = '"DejaVu Serif", Georgia, serif', FAT = '"Inter Black", "Inter", "DejaVu Sans", sans-serif', ROMAN = '"FreeSerif", "Liberation Serif", serif';
function txt(g, s, cx, cy, maxW, sz, o = {}) { g.save(); g.font = `${o.italic ? 'italic ' : ''}${o.bold === false ? '' : 'bold '}${sz | 0}px ${o.font || SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const tw = g.measureText(s).width, sx = Math.min(o.maxSx || 1, maxW / tw); g.translate(cx, cy); g.scale(sx, 1);
  if (o.shadow) { g.fillStyle = o.shadow; g.fillText(s, sz * 0.05, sz * 0.05); }
  if (o.stroke) { g.lineWidth = o.stroke; g.strokeStyle = o.strokeCol || INK; g.lineJoin = 'round'; g.strokeText(s, 0, 0); } g.fillStyle = o.col || INK; g.fillText(s, 0, 0); g.restore(); }
function grain(g, w, h, col, n, seed, a = 0.5) { const R = rng(seed); g.fillStyle = col; for (let i = 0; i < n; i++) { g.globalAlpha = a * R(); g.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2); } g.globalAlpha = 1; }
function paper(g, w, h, base, seed) { g.fillStyle = base; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.9 + 0.12 * fbm(u, v, 4, 4, 3, seed) - 0.12 * Math.pow(Math.max(Math.abs(u - 0.5), Math.abs(v - 0.5)) * 2, 6)); grain(g, w, h, 'rgba(90,60,40,1)', (w * h) / 900, seed, 0.12); }
function tomatoIcon(g, cx, cy, r, o = {}) { g.save(); g.translate(cx, cy);
  g.fillStyle = o.col || '#d8382a'; g.beginPath(); g.ellipse(0, 0, r * 1.08, r * 0.92, 0, 0, TAU); g.fill();
  g.strokeStyle = o.ink || INK; g.lineWidth = Math.max(2, r * 0.07); g.stroke();
  g.strokeStyle = 'rgba(80,10,20,0.35)'; g.lineWidth = r * 0.05; for (const a of [-0.45, 0.45]) { g.beginPath(); g.ellipse(a * r * 0.9, 0, r * 0.35, r * 0.85, 0, a > 0 ? -1.2 : 1.9, a > 0 ? 1.2 : 4.4); g.stroke(); }
  g.fillStyle = 'rgba(255,240,220,0.75)'; g.beginPath(); g.ellipse(-r * 0.42, -r * 0.38, r * 0.2, r * 0.12, -0.6, 0, TAU); g.fill();
  g.fillStyle = o.leaf || '#3e8a3a'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, rr = i % 2 ? r * 0.12 : r * 0.42; g.lineTo(Math.cos(a) * rr, -r * 0.82 + Math.sin(a) * rr * 0.55); } g.closePath(); g.fill(); g.lineWidth = Math.max(1.5, r * 0.04); g.strokeStyle = o.ink || INK; g.stroke();
  g.fillRect(-r * 0.04, -r * 1.12, r * 0.08, r * 0.3); g.restore(); }
function pillIcon(g, cx, cy, r, col = '#7a4a2a') { g.save(); g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = Math.max(2, r * 0.12); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,230,200,0.5)'; g.beginPath(); g.arc(cx - r * 0.35, cy - r * 0.35, r * 0.25, 0, TAU); g.fill(); g.restore(); }
function bottleIcon(g, cx, by, H, col = '#7a3a1a', lab = '#efe2c0') { g.save(); g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = Math.max(2, H * 0.025); const w = H * 0.36;
  g.beginPath(); g.moveTo(cx - w / 2, by); g.lineTo(cx - w / 2, by - H * 0.6); g.quadraticCurveTo(cx - w / 2, by - H * 0.72, cx - w * 0.16, by - H * 0.76); g.lineTo(cx - w * 0.16, by - H * 0.92); g.lineTo(cx + w * 0.16, by - H * 0.92); g.lineTo(cx + w * 0.16, by - H * 0.76); g.quadraticCurveTo(cx + w / 2, by - H * 0.72, cx + w / 2, by - H * 0.6); g.lineTo(cx + w / 2, by); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#c8b090'; g.fillRect(cx - w * 0.2, by - H, w * 0.4, H * 0.1); g.strokeRect(cx - w * 0.2, by - H, w * 0.4, H * 0.1);
  g.fillStyle = lab; g.fillRect(cx - w * 0.42, by - H * 0.5, w * 0.84, H * 0.32); g.strokeRect(cx - w * 0.42, by - H * 0.5, w * 0.84, H * 0.32); tomatoIcon(g, cx, by - H * 0.34, H * 0.09); g.restore(); }
function handIcon(g, cx, cy, s, flip = false) { g.save(); g.translate(cx, cy); g.scale(flip ? -s : s, s); g.fillStyle = INK; // pointing fist (printer's manicule)
  g.beginPath(); g.moveTo(-1, -0.35); g.lineTo(0.2, -0.35); g.lineTo(1.0, -0.3); g.quadraticCurveTo(1.15, -0.18, 1.0, -0.08); g.lineTo(0.3, -0.08); g.lineTo(0.3, 0.05); g.quadraticCurveTo(0.42, 0.18, 0.3, 0.3); g.lineTo(0.0, 0.42); g.quadraticCurveTo(-0.35, 0.5, -0.55, 0.35); g.lineTo(-1, 0.3); g.closePath(); g.fill();
  g.fillRect(-1.35, -0.42, 0.32, 0.84); g.restore(); }
function star(g, cx, cy, r, col) { g.save(); g.fillStyle = col; g.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, rr = i % 2 ? r * 0.42 : r; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); g.fill(); g.restore(); }
function rule(g, x0, x1, y, col, t = 3) { g.fillStyle = col; g.fillRect(x0, y - t / 2, x1 - x0, t); }
function ornRule(g, x0, x1, y, col) { rule(g, x0, x1, y - 4, col, 2); rule(g, x0, x1, y + 4, col, 2); g.fillStyle = col; g.beginPath(); g.ellipse((x0 + x1) / 2, y, 14, 7, 0, 0, TAU); g.fill(); }

// bottle label wrap (front band), Miles or Phelps
function labelTex(kind) { return (g, w, h) => { const P = kind === 'phelps'; paper(g, w, h, P ? '#e6efd8' : '#f1e6c8', P ? 31 : 21);
  const ac = P ? '#2a6a3a' : '#b02a22'; g.strokeStyle = ac; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20); g.lineWidth = 2; g.strokeRect(20, 20, w - 40, h - 40);
  if (P) { txt(g, "PHELPS'", w / 2, h * 0.22, w * 0.6, 40, { col: INK }); txt(g, 'TOMATO', w / 2, h * 0.48, w * 0.8, 74, { font: FAT, col: ac }); txt(g, 'PILLS', w / 2, h * 0.74, w * 0.5, 50, { font: FAT, col: ac }); }
  else { txt(g, "DR. MILES'", w / 2, h * 0.19, w * 0.6, 34, { col: INK }); txt(g, 'COMPOUND EXTRACT', w / 2, h * 0.41, w * 0.82, 44, { col: ac }); txt(g, 'OF TOMATO', w / 2, h * 0.64, w * 0.66, 56, { font: FAT, col: ac }); rule(g, w * 0.25, w * 0.75, h * 0.82, INK, 2); }
  tomatoIcon(g, w * 0.12, h * 0.5, 26); tomatoIcon(g, w * 0.88, h * 0.5, 26); }; }
// round pill-box lid
function lidTex(kind) { return (g, w, h) => { const P = kind === 'phelps', c = w / 2; g.fillStyle = P ? '#dfead0' : '#f2e8cc'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.92 + 0.1 * fbm(u, v, 3, 3, 2, 3));
  const ac = P ? '#2a6a3a' : '#b02a22'; g.strokeStyle = ac; g.lineWidth = 10; g.beginPath(); g.arc(c, c, c - 8, 0, TAU); g.stroke(); g.lineWidth = 3; g.beginPath(); g.arc(c, c, c - 26, 0, TAU); g.stroke();
  if (P) { txt(g, "PHELPS'", c, c * 0.62, w * 0.6, 34, { col: INK }); txt(g, 'TOMATO', c, c * 0.98, w * 0.72, 50, { font: FAT, col: ac }); txt(g, 'PILLS', c, c * 1.34, w * 0.46, 40, { font: FAT, col: ac }); }
  else { txt(g, "DR. MILES'", c, c * 0.55, w * 0.56, 30, { col: INK }); txt(g, 'COMPOUND', c, c * 0.83, w * 0.7, 34, { col: ac }); txt(g, 'EXTRACT OF', c, c * 1.08, w * 0.7, 30, { col: ac }); txt(g, 'TOMATO', c, c * 1.38, w * 0.62, 44, { font: FAT, col: ac }); } }; }
// apothecary jar label: script squiggles (no words)
function jarLabelTex(g, w, h) { paper(g, w, h, '#efe6cc', 41); const R = rng(4); for (let i = 0; i < 4; i++) { const x0 = i * w / 4; g.strokeStyle = '#2b1d4a'; g.lineWidth = 3; g.strokeRect(x0 + 10, 14, w / 4 - 20, h - 28); g.strokeStyle = 'rgba(43,29,74,0.8)'; g.lineWidth = 3;
    for (let l = 0; l < 2; l++) { g.beginPath(); let x = x0 + 26 + R() * 10; const y = h * (0.42 + l * 0.22); g.moveTo(x, y); while (x < x0 + w / 4 - 30) { x += 6 + R() * 8; g.lineTo(x, y + (R() - 0.5) * 14); } g.stroke(); } } }
// posters for the ad war
const POSTERS = [
  { side: 'M', bg: '#f2e4c0', ink: '#b02a22', lines: [["DR. MILES'", 0.12, 'serif', INK], ['COMPOUND', 0.25, 'fat'], ['EXTRACT OF', 0.36, 'serif'], ['TOMATO', 0.5, 'fat'], ['THE GENUINE!', 0.86, 'fat', INK]], icon: ['tomato', 0.68] },
  { side: 'M', bg: '#b8281e', ink: '#f6e8c8', lines: [['BEWARE', 0.1, 'fat', INK], ['IMITATIONS!', 0.22, 'fat', INK], ["DR. MILES'", 0.42, 'serif'], ['COMPOUND EXTRACT', 0.54, 'serif'], ['OF TOMATO', 0.66, 'fat'], ['THE GENUINE!', 0.86, 'roman', INK]], icon: ['hand', 0.76] },
  { side: 'M', bg: '#e8a088', ink: '#7a1010', lines: [['TOMATO PILLS', 0.12, 'fat'], ['WILL CURE ALL', 0.24, 'serif', INK], ['YOUR ILLS!', 0.36, 'fat'], ["DR. MILES'", 0.84, 'serif', INK]], icon: ['bottle', 0.7] },
  { side: 'M', bg: '#f4c8b0', ink: '#9a1a1a', lines: [["DR. MILES'", 0.14, 'fat'], ['COMPOUND EXTRACT', 0.3, 'serif', INK], ['OF TOMATO', 0.44, 'fat'], ['CURES ALL YOUR ILLS!', 0.88, 'roman', INK]], icon: ['pills', 0.66] },
  { side: 'P', bg: '#b8d8a0', ink: '#1a5a2e', lines: [["PHELPS'", 0.13, 'fat'], ['TOMATO PILLS', 0.28, 'fat', INK], ['BEWARE', 0.72, 'fat'], ['IMITATIONS!', 0.86, 'fat']], icon: ['tomato', 0.5] },
  { side: 'P', bg: '#2e6a3e', ink: '#f2ecc8', lines: [['THE GENUINE!', 0.12, 'fat', '#b02a22'], ["PHELPS'", 0.3, 'serif'], ['TOMATO PILLS', 0.44, 'fat'], ['CURES ALL YOUR ILLS!', 0.88, 'roman', INK]], icon: ['bottle', 0.72] },
  { side: 'P', bg: '#cfe4b0', ink: '#1e5a32', lines: [['BEWARE', 0.1, 'fat', '#b02a22'], ['IMITATIONS!', 0.22, 'fat', '#b02a22'], ["PHELPS'", 0.44, 'fat'], ['TOMATO PILLS', 0.58, 'serif', INK], ['THE GENUINE!', 0.86, 'fat']], icon: ['hand', 0.74] },
  { side: 'P', bg: '#9cc88a', ink: '#163e24', lines: [['TOMATO PILLS', 0.12, 'fat'], ['WILL CURE ALL', 0.24, 'serif', INK], ['YOUR ILLS!', 0.36, 'fat'], ["PHELPS'", 0.86, 'fat', INK]], icon: ['pills', 0.64] },
  { side: 'N', bg: '#f4ecd0', ink: '#b02a22', lines: [['TOMATO', 0.2, 'fat'], ['PILLS', 0.4, 'fat'], ['SOLD HERE', 0.62, 'fat', INK]], icon: ['hand', 0.84], land: true },
  { side: 'N', bg: '#fbe9b8', ink: '#2a2a6a', lines: [['TOMATO PILLS WILL', 0.2, 'serif'], ['CURE ALL YOUR ILLS!', 0.44, 'fat', '#b02a22']], icon: ['tomato', 0.74], land: true },
];
function posterTex(spec, seed) { return (g, w, h) => { paper(g, w, h, spec.bg, seed);
  g.strokeStyle = spec.ink; g.lineWidth = w * 0.02; g.strokeRect(w * 0.03, w * 0.03, w - w * 0.06, h - w * 0.06); g.lineWidth = w * 0.006; g.strokeRect(w * 0.055, w * 0.055, w - w * 0.11, h - w * 0.11);
  for (const [s, y, f, c] of spec.lines) { const sz = f === 'fat' ? h * (spec.land ? 0.17 : 0.1) : h * (spec.land ? 0.12 : 0.065); txt(g, s, w / 2, h * y, w * 0.84, sz, { font: f === 'fat' ? FAT : f === 'roman' ? ROMAN : SERIF, italic: f === 'roman', col: c || spec.ink }); }
  const [ic, iy] = spec.icon, H = spec.land ? h : h * 0.6;
  if (ic === 'tomato') tomatoIcon(g, w / 2, h * iy, H * 0.12); else if (ic === 'bottle') bottleIcon(g, w / 2, h * iy + H * 0.14, H * 0.3, '#7a3a1a', spec.bg);
  else if (ic === 'pills') { for (let i = 0; i < 5; i++) pillIcon(g, w * (0.3 + i * 0.1), h * iy + Math.sin(i * 2) * h * 0.02, w * 0.045); }
  else if (ic === 'hand') { handIcon(g, w * 0.2, h * iy, w * 0.08); handIcon(g, w * 0.8, h * iy, w * 0.08, true); }
  if (!spec.land) { ornRule(g, w * 0.2, w * 0.8, h * 0.78, spec.ink); star(g, w * 0.13, h * 0.5, w * 0.03, spec.ink); star(g, w * 0.87, h * 0.5, w * 0.03, spec.ink); }
  const R = rng(seed + 3); g.fillStyle = 'rgba(80,50,30,0.12)'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(R() * w, R() * h, 10 + R() * 40, 0, TAU); g.fill(); } }; }
function newsTex(g, w, h) { paper(g, w, h, '#ece4d0', 61); txt(g, 'TOMATO PILLS', w / 2, h * 0.08, w * 0.86, h * 0.07, { font: FAT, col: INK });
  const R = rng(9); for (let c = 0; c < 3; c++) for (let l = 0; l < 30; l++) { const x = w * (0.07 + c * 0.3), y = h * (0.16 + l * 0.026); if (l % 9 === 0) { g.fillStyle = 'rgba(43,29,74,0.75)'; g.fillRect(x, y, w * 0.24, h * 0.012); continue; } g.fillStyle = 'rgba(43,29,74,0.4)'; g.fillRect(x, y, w * (0.16 + R() * 0.08), h * 0.008); }
  g.strokeStyle = 'rgba(43,29,74,0.6)'; g.lineWidth = 2; g.strokeRect(w * 0.37, h * 0.4, w * 0.27, h * 0.2); tomatoIcon(g, w * 0.5, h * 0.5, w * 0.06); }
function typeCaseTex(g, w, h) { g.fillStyle = '#5a3a24'; g.fillRect(0, 0, w, h); const R = rng(71); const cols = 14, rows = 7;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x = c * w / cols, y = r * h / rows, cw = w / cols, ch = h / rows; g.fillStyle = '#2a1a14'; g.fillRect(x + 3, y + 3, cw - 6, ch - 6);
    g.fillStyle = '#8a8a96'; const n = 6 + (R() * 14 | 0); for (let i = 0; i < n; i++) g.fillRect(x + 6 + R() * (cw - 16), y + 6 + R() * (ch - 16), 4 + R() * 4, 4 + R() * 4); }
  g.strokeStyle = '#a07a50'; g.lineWidth = 4; for (let c = 0; c <= cols; c++) { g.beginPath(); g.moveTo(c * w / cols, 0); g.lineTo(c * w / cols, h); g.stroke(); } for (let r = 0; r <= rows; r++) { g.beginPath(); g.moveTo(0, r * h / rows); g.lineTo(w, r * h / rows); g.stroke(); } }
function plasterTex(base, seed) { return (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.88 + 0.16 * fbm(u, v, 5, 5, 4, seed)); grain(g, w, h, '#5a4a4a', 1200, seed, 0.16);
  g.strokeStyle = 'rgba(70,50,50,0.25)'; g.lineWidth = 2; const R = rng(seed + 1); for (let i = 0; i < 6; i++) { g.beginPath(); let x = R() * w, y = R() * h; g.moveTo(x, y); for (let j = 0; j < 6; j++) { x += (R() - 0.5) * 40; y += R() * 30; g.lineTo(x, y); } g.stroke(); } }; }
function nightTex(moon) { return (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0e0c34'); gr.addColorStop(0.6, '#2a2a6e'); gr.addColorStop(1, '#4a3a7e'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const R = rng(5); for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(230,230,255,${0.3 + R() * 0.6})`; g.fillRect(R() * w, R() * h * 0.6, 2, 2); }
  if (moon) { const mx = w * 0.7, my = h * 0.22, mr = h * 0.08, gl = g.createRadialGradient(mx, my, 0, mx, my, mr * 4); gl.addColorStop(0, 'rgba(220,220,255,0.6)'); gl.addColorStop(1, 'rgba(220,220,255,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h); g.fillStyle = '#f2eeff'; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill(); }
  g.fillStyle = '#141234'; let x = 0; while (x < w) { const bw = w * (0.08 + R() * 0.12), bh = h * (0.18 + R() * 0.2); g.fillRect(x, h - bh, bw, bh); if (R() < 0.5) { g.beginPath(); g.moveTo(x, h - bh); g.lineTo(x + bw / 2, h - bh - h * 0.08); g.lineTo(x + bw, h - bh); g.fill(); } if (R() < 0.6) g.fillRect(x + bw * 0.7, h - bh - h * 0.06, bw * 0.12, h * 0.06);
    for (let k = 0; k < 3; k++) if (R() < 0.45) { g.fillStyle = '#ffc870'; g.fillRect(x + bw * (0.2 + k * 0.25), h - bh * (0.4 + R() * 0.4), bw * 0.1, h * 0.03); g.fillStyle = '#141234'; } x += bw + 2; } }; }
function dayTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9ab4e8'); gr.addColorStop(1, '#f6dcb4'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = rng(8);
  g.fillStyle = '#b89a86'; let x = 0; while (x < w) { const bw = w * (0.1 + R() * 0.14), bh = h * (0.25 + R() * 0.25); g.fillStyle = R() < 0.5 ? '#c8a48a' : '#d8c4a8'; g.fillRect(x, h - bh, bw, bh); g.fillStyle = '#6a5a6a'; g.beginPath(); g.moveTo(x - 4, h - bh); g.lineTo(x + bw / 2, h - bh - h * 0.1); g.lineTo(x + bw + 4, h - bh); g.fill();
    for (let k = 0; k < 2; k++) { g.fillStyle = '#5a5a7a'; g.fillRect(x + bw * (0.2 + k * 0.4), h - bh * 0.7, bw * 0.18, h * 0.08); } x += bw + 3; } }
function shaftTex(g, w, h) { const id = g.createImageData(w, h), d = id.data; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const u = x / w, v = y / h, a = Math.pow(Math.sin(Math.PI * u), 2) * Math.pow(Math.sin(Math.PI * Math.min(1, v * 1.1)), 0.8) * (1 - v * 0.6); const i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = a * 255; } g.putImageData(id, 0, 0); }
function glowTex(g, w, h) { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
function webTex(g, w, h) { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(235,235,250,0.7)'; g.lineWidth = 1.0; const cx = 0, cy = 0, n = 9; // corner cobweb
  for (let i = 0; i < n; i++) { const a = i / (n - 1) * Math.PI / 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(Math.cos(a) * w * 1.1, Math.sin(a) * h * 1.1); g.stroke(); }
  for (let r = 1; r < 9; r++) { g.beginPath(); for (let i = 0; i < n; i++) { const a = i / (n - 1) * Math.PI / 2, rr = r * w * 0.11 * (0.92 + 0.12 * Math.sin(i * 3 + r)); const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? g.quadraticCurveTo((x + px) / 2 * 0.94, (y + py) / 2 * 0.94, x, y) : g.moveTo(x, y); var px = x, py = y; } g.stroke(); } }
function dustTex(g, w, h) { g.clearRect(0, 0, w, h); const R = rng(91); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(${225 + R() * 30},${220 + R() * 30},${210 + R() * 30},${0.1 + R() * 0.3})`; g.fillRect(R() * w, R() * h, 1 + R(), 1 + R()); } }
function pillCutTex(g, w, h) { const c = w / 2; g.fillStyle = '#86583a'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.85 + 0.25 * fbm(u, v, 8, 8, 4, 12) - 0.12 * Math.hypot(u - 0.5, v - 0.5));
  const R = rng(14); for (let i = 0; i < 900; i++) { const a = R() * TAU, r = Math.sqrt(R()) * c * 0.96, x = c + Math.cos(a) * r, y = c + Math.sin(a) * r, s = 2 + R() * 7; g.fillStyle = R() < 0.6 ? `rgba(50,28,18,${0.4 + R() * 0.4})` : `rgba(160,120,80,${0.25 + R() * 0.3})`; g.beginPath(); g.ellipse(x, y, s, s * (0.5 + R() * 0.5), R() * 3, 0, TAU); g.fill(); }
  g.strokeStyle = 'rgba(40,22,14,0.5)'; g.lineWidth = 3; for (let i = 0; i < 7; i++) { g.beginPath(); const a = R() * TAU, r0 = R() * c * 0.5; g.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0); g.lineTo(c + Math.cos(a + 0.3) * (r0 + 40), c + Math.sin(a + 0.3) * (r0 + 40)); g.stroke(); }
  g.strokeStyle = '#3a2216'; g.lineWidth = w * 0.035; g.beginPath(); g.arc(c, c, c * 0.97, 0, TAU); g.stroke(); }
function pillSkinTex(g, w, h) { g.fillStyle = '#7a4a2c'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.86 + 0.24 * fbm(u, v, 6, 3, 4, 22)); grain(g, w, h, '#3a2014', 1600, 23, 0.4); grain(g, w, h, '#c89a6a', 500, 24, 0.25); }
function verdictTex(g, w, h) { // card: tomato in a red circle, slashed, "NO TOMATO"
  paper(g, w, h, '#f6eed8', 77); g.strokeStyle = INK; g.lineWidth = 12; g.strokeRect(12, 12, w - 24, h - 24); g.lineWidth = 4; g.strokeRect(34, 34, w - 68, h - 68);
  const cx = w / 2, cy = h * 0.4, r = w * 0.3; tomatoIcon(g, cx, cy + r * 0.06, r * 0.62);
  g.strokeStyle = '#d42a22'; g.lineWidth = w * 0.06; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(cx - r * 0.7, cy - r * 0.7); g.lineTo(cx + r * 0.7, cy + r * 0.7); g.stroke();
  txt(g, 'NO TOMATO', cx, h * 0.83, w * 0.8, h * 0.13, { font: FAT, col: '#d42a22', stroke: 10, strokeCol: INK }); }
function bookTex(g, w, h) { paper(g, w, h, '#efe6cf', 81); g.fillStyle = 'rgba(60,40,30,0.25)'; g.fillRect(w / 2 - 3, 0, 6, h); const R = rng(82);
  g.strokeStyle = 'rgba(43,29,74,0.75)'; g.lineWidth = 2.4; for (let p = 0; p < 2; p++) for (let l = 0; l < 13; l++) { if (p === 1 && l > 3 && l < 10) continue; const y = h * (0.1 + l * 0.065); let x = p * w / 2 + w * 0.06; g.beginPath(); g.moveTo(x, y); const x1 = p * w / 2 + w * (0.38 + R() * 0.06); while (x < x1) { x += 4 + R() * 6; g.lineTo(x, y + (R() - 0.5) * 7); } g.stroke(); }
  // a sketch: pill cut in half + crossed-out tomato
  const sx = w * 0.62, sy = h * 0.47; g.strokeStyle = 'rgba(43,29,74,0.85)'; g.lineWidth = 3; g.beginPath(); g.arc(sx, sy, h * 0.12, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(sx - h * 0.12, sy); g.lineTo(sx + h * 0.12, sy); g.stroke();
  g.save(); g.globalAlpha = 0.85; tomatoIcon(g, w * 0.86, sy, h * 0.08, { col: '#c8482a' }); g.restore(); g.strokeStyle = '#b02a22'; g.lineWidth = 5; g.beginPath(); g.moveTo(w * 0.79, sy - h * 0.1); g.lineTo(w * 0.93, sy + h * 0.1); g.moveTo(w * 0.93, sy - h * 0.1); g.lineTo(w * 0.79, sy + h * 0.1); g.stroke(); }

function materials() {
  const vc = (o = {}) => toon({ vertexColors: true, ...o }), T = (w, h, fn, rep) => mkTex(w, h, fn, rep), m = {};
  const add = (map, col, op) => new THREE.MeshBasicMaterial({ map, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  m.coin = toon({ color: 0xffffff, emissive: 0x3a2808 }); m.paint = vc(); m.metal = vc({ emissive: 0x0a0a12 }); m.brass = vc({ emissive: 0x2a1a06 }); m.gold = vc({ emissive: 0x4a3008 });
  m.wood = vc({ map: T(256, 256, (g, w, h) => PT.planks(g, w, h, { base: '#9a7a58', n: 4, seed: 23, joints: 0 })) });
  m.floor = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#7a5a40', n: 7, seed: 51 })) });
  m.wall = vc({ map: T(512, 512, plasterTex('#e2d4b8', 3)) }); m.brick = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#9a5a44', seed: 5 })) });
  m.stone = vc({ map: T(256, 256, (g, w, h) => PT.stone(g, w, h, { base: '#a8a098', seed: 7 })) });
  m.amber = vc({ emissive: 0x2a0e02 }); m.ceramic = vc({ emissive: 0x1a1612 });
  m.glass = new THREE.MeshBasicMaterial({ color: 0xa8b4d8, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  m.labelM = vc({ map: T(512, 224, labelTex('miles')), emissive: 0x1a1208 }); m.labelP = vc({ map: T(512, 224, labelTex('phelps')), emissive: 0x1a1208 });
  m.lidM = vc({ map: T(256, 256, lidTex('miles')) }); m.lidP = vc({ map: T(256, 256, lidTex('phelps')) });
  m.jarLabel = vc({ map: T(512, 96, jarLabelTex) });
  m.pill = toon({ color: 0xffffff }); m.tomato = vc({ emissive: 0x2a0402 });
  m.flame = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd890).multiplyScalar(3.2), fog: false });
  m.blueFlame = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x7a9aff).multiplyScalar(2.2), transparent: true, opacity: 0.85, fog: false });
  m.glow = add(T(128, 128, glowTex), 0xffb060, 0.55); m.glowR = add(m.glow.map, 0xff3a2a, 0.5); m.glowG = add(m.glow.map, 0x40ff70, 0.45); m.glowB = add(m.glow.map, 0x6a7aff, 0.4);
  m.globeR = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff3a22).multiplyScalar(1.5), fog: false }); m.globeG = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x30d860).multiplyScalar(1.3), fog: false });
  m.chimney = new THREE.MeshBasicMaterial({ color: 0xfff0d0, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  m.night = new THREE.MeshBasicMaterial({ map: T(512, 512, nightTex(false)), fog: false }); m.nightMoon = new THREE.MeshBasicMaterial({ map: T(512, 512, nightTex(true)), fog: false });
  m.day = new THREE.MeshBasicMaterial({ map: T(512, 512, dayTex), fog: false }); m.day.color.setScalar(1.1);
  m.web = new THREE.MeshBasicMaterial({ map: T(256, 256, webTex), transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false });
  m.dust = new THREE.MeshBasicMaterial({ map: T(256, 256, dustTex), transparent: true, opacity: 0.55, depthWrite: false, color: 0xfff4e4 });
  m.posters = POSTERS.map((p, i) => toon({ map: T(p.land ? 640 : 448, p.land ? 448 : 640, posterTex(p, 100 + i * 7)), side: THREE.DoubleSide, emissive: 0x241a12 }));
  m.posters.forEach((x) => { x.emissiveMap = x.map; });
  m.news = toon({ map: T(448, 640, newsTex), side: THREE.DoubleSide, emissive: 0x1a1410 });
  m.typecase = vc({ map: T(512, 256, typeCaseTex) });
  m.ink = vc({ emissive: 0x050308 });
  m.pillCut = toon({ map: T(512, 512, pillCutTex) }); m.pillSkin = toon({ map: T(512, 256, pillSkinTex) });
  m.porcelain = vc({ emissive: 0x2a2a3a }); m.book = toon({ map: T(1024, 512, bookTex), color: 0xb8b0a0 });
  m.verdict = toon({ map: T(512, 640, verdictTex), side: THREE.DoubleSide, emissive: 0x6a5a48 }); m.verdict.emissiveMap = m.verdict.map;
  m.lens = new THREE.MeshBasicMaterial({ color: 0x8a9ad8, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  m.lensHi = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  m.shaft = new THREE.MeshBasicMaterial({ map: T(64, 256, shaftTex), color: 0xffe8c0, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  return m;
}

// ---------------------------------------------------------------- shared props
const PILLC = [0x6e4428, 0x7a4c2c, 0x5e3a22, 0x84552f, 0x6a3e26];
// instanced pills: list of [x,y,z]; returns the InstancedMesh (count can be lowered for animation)
function pillsIM(root, pts, r = 0.011, seed = 1) { const R = rng(seed), im = new THREE.InstancedMesh(sph(r, 8, 6), M.pill, pts.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  pts.forEach((p, i) => { m4.compose(new THREE.Vector3(...p), q.setFromEuler(e.set(R() * 3, R() * 3, 0)), new THREE.Vector3(1, 0.86 + R() * 0.1, 1)); im.setMatrixAt(i, m4); im.setColorAt(i, c.setHex(PILLC[(R() * PILLC.length) | 0])); });
  im.castShadow = false; im.receiveShadow = true; root.add(im); return im; }
// heap of pills on a surface: mound radius rad, height ht
function heapPts(cx, y0, cz, rad, ht, n, seed, r = 0.011) { const R = rng(seed), out = []; for (let i = 0; i < n; i++) { const a = R() * TAU, d = Math.sqrt(R()) * rad, h = ht * Math.pow(1 - d / rad, 1.3) * (0.4 + 0.6 * R()); out.push([cx + Math.cos(a) * d, y0 + r * 0.85 + h, cz + Math.sin(a) * d]); } return out; }
function oilLamp(k, x, y, z, s = 1) { k.at(x, y, z, 0, () => { k.put(M.brass, lathe('olb', [[0, 0], [0.07, 0], [0.075, 0.01], [0.03, 0.04], [0.022, 0.12], [0.06, 0.16], [0.075, 0.2], [0.05, 0.24], [0.03, 0.25], [0, 0.25]], 18), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xc89a48);
  k.put(M.brass, cyl(0.035, 0.04, 0.03, 12), 0, 0.265, 0, 0, 0, 0, 1, 1, 1, 0xa87a38); k.put(M.chimney, lathe('och', [[0.03, 0], [0.055, 0.05], [0.06, 0.09], [0.035, 0.15], [0.03, 0.26]], 16, true), 0, 0.28, 0); k.put(M.flame, lathe('ofl', [[0, 0], [0.012, 0.01], [0.014, 0.03], [0.008, 0.055], [0, 0.07]], 10), 0, 0.3, 0); }, s); }
function candle(k, x, y, z, h = 0.18, s = 1) { k.at(x, y, z, 0, () => { k.put(M.brass, lathe('cst', [[0, 0], [0.07, 0], [0.072, 0.012], [0.02, 0.025], [0.016, 0.06], [0.03, 0.07], [0.032, 0.085], [0, 0.085]], 18), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xc89a48);
  k.put(M.brass, tor(0.025, 0.006, 6, 12, Math.PI * 1.4), 0.075, 0.04, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0xb88a40); k.put(M.ceramic, cyl(0.016, 0.017, h, 12), 0, 0.085 + h / 2, 0, 0, 0, 0, 1, 1, 1, 0xf2ead8);
  for (let i = 0; i < 4; i++) { const a = i * 1.7; k.put(M.ceramic, cyl(0.004, 0.005, 0.03 + i * 0.012, 6), Math.cos(a) * 0.016, 0.085 + h - 0.02 - i * 0.008, Math.sin(a) * 0.016, 0, 0, 0, 1, 1, 1, 0xf2ead8); }
  k.put(M.ink, cyl(0.0015, 0.0015, 0.012, 4), 0, 0.085 + h + 0.006, 0); k.put(M.flame, lathe('cfl', [[0, 0], [0.008, 0.008], [0.009, 0.02], [0.005, 0.036], [0, 0.048]], 10), 0, 0.085 + h + 0.005, 0); }, s); }
function jar(k, x, y, z, s, fill, lid = 0xe8e0d0) { k.at(x, y, z, 0, () => { k.put(M.glass, lathe('aj', [[0, 0], [0.07, 0], [0.075, 0.015], [0.075, 0.17], [0.05, 0.2], [0.045, 0.22], [0, 0.22]], 16), 0, 0, 0);
  k.put(M.paint, cyl(0.068, 0.068, 0.15 * (0.4 + 0.6 * ((x * 13.7 + y * 5) % 1 + 1) % 1), 14), 0, 0.075 * (0.4 + 0.6 * ((x * 13.7 + y * 5) % 1 + 1) % 1), 0, 0, 0, 0, 1, 1, 1, fill);
  k.put(M.ceramic, sph(0.05, 12, 6), 0, 0.225, 0, 0, 0, 0, 1, 0.45, 1, lid); k.put(M.ceramic, sph(0.018, 8, 6), 0, 0.25, 0, 0, 0, 0, 1, 1, 1, lid);
  k.put(M.jarLabel, band(0.077, 0.06, 1.6), 0, 0.1, 0, 0, (Math.round(x * 7) % 4) * 0.0, 0); }, s); }
function crock(k, x, y, z, s, c = 0xe8dcc0) { k.at(x, y, z, 0, () => { k.put(M.ceramic, lathe('cr', [[0, 0], [0.08, 0], [0.095, 0.05], [0.1, 0.16], [0.085, 0.22], [0.07, 0.235], [0, 0.235]], 18), 0, 0, 0, 0, 0, 0, 1, 1, 1, c); k.put(M.paint, cyl(0.1, 0.1, 0.025, 18), 0, 0.12, 0, 0, 0, 0, 1, 1, 1, 0x3a5a8a); k.put(M.wood, cyl(0.072, 0.072, 0.02, 16), 0, 0.24, 0, 0, 0, 0, 1, 1, 1, 0x8a6a48); }, s); }
function bottle(k, x, y, z, ry, s, kind = 'miles', glass = 0x6a2a0e) { k.at(x, y, z, ry, () => { k.put(M.amber, lathe('bt', [[0, 0], [0.045, 0], [0.048, 0.01], [0.048, 0.15], [0.04, 0.175], [0.018, 0.2], [0.016, 0.245], [0.02, 0.25], [0, 0.25]], 16), 0, 0, 0, 0, 0, 0, 1, 1, 1, glass);
  k.put(M.wood, cyl(0.014, 0.012, 0.03, 8), 0, 0.26, 0, 0, 0, 0, 1, 1, 1, 0xc8a070); k.put(kind === 'phelps' ? M.labelP : M.labelM, band(0.05, 0.1, 2.5), 0, 0.085, 0); }, s); }
function pillBox(k, x, y, z, ry, s, kind = 'miles', open = false) { k.at(x, y, z, ry, () => { const P = kind === 'phelps'; k.put(M.paint, cyl(0.05, 0.05, 0.035, 20), 0, 0.0175, 0, 0, 0, 0, 1, 1, 1, P ? 0x5a8a5a : 0xc8a878);
  if (!open) { k.put(M.paint, cyl(0.053, 0.053, 0.02, 20), 0, 0.03, 0, 0, 0, 0, 1, 1, 1, P ? 0x2a6a3a : 0xb02a22); k.put(P ? M.lidP : M.lidM, disc(0.052, 24), 0, 0.0405, 0, -Math.PI / 2, 0, 0); } }, s); }
function tomato(k, x, y, z, r, seed) { const R = rng(seed); k.put(M.tomato, sph(r, 14, 10), x, y, z, R() * 0.3, R() * 6, R() * 0.3, 1.08, 0.85, 1.04, [0xd8301e, 0xe03a22, 0xc82818, 0xe85a2a][(R() * 4) | 0]);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + R(); k.put(M.paint, cone(r * 0.1, r * 0.55, 4), x + Math.cos(a) * r * 0.25, y + r * 0.84, z + Math.sin(a) * r * 0.25, 0, -a, Math.PI / 2 - 0.25, 1, 1, 1, 0x3a7a2a); }
  k.put(M.paint, cyl(r * 0.05, r * 0.06, r * 0.25, 6), x, y + r * 0.95, z, 0, 0, 0, 1, 1, 1, 0x3a6a24); }
function glowAt(root, mat, x, y, z, s) { const g = mesh(root, plane(1, 1), mat, x, y, z, 0, 0, 0, false); g.scale.setScalar(s); nond(g); g.renderOrder = 5; return g; }
function scales(k, x, y, z, ry, s = 1) { k.at(x, y, z, ry, () => { k.box(M.wood, -0.14, 0.14, 0, 0.03, -0.07, 0.07, 0x5a3a24, 0.008); k.put(M.brass, cyl(0.008, 0.012, 0.3, 8), 0, 0.18, 0, 0, 0, 0, 1, 1, 1, 0xc8a048);
  k.put(M.brass, cyl(0.004, 0.004, 0.3, 6), 0, 0.33, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0xc8a048); k.put(M.brass, cone(0.012, 0.03, 6), 0, 0.345, 0, 0, 0, 0, 1, 1, 1, 0xd8b058);
  for (const sx of [-1, 1]) { for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; k.beam(M.brass, [sx * 0.15, 0.33, 0], [sx * 0.15 + Math.cos(a) * 0.05, 0.15, Math.sin(a) * 0.05], 0.002, 0x8a7a50, true, 4); } k.put(M.brass, lathe('pan', [[0, 0], [0.06, 0.01], [0.065, 0.02]], 18), sx * 0.15, 0.14, 0, 0, 0, 0, 1, 1, 1, 0xd0a850); } }, s); }

// ---------------------------------------------------------------- set: workshop (Miles' pill workshop, Cleveland 1837)
function buildWorkshop(root) {
  const R = rng(1837), K = new Kit(), X0 = -4.6, X1 = 4.6, Z0 = -3.2, HC = 3.4;
  mesh(root, plane(X1 - X0, 9), M.floor, 0, 0, 1.3, -Math.PI / 2, 0, 0, false);
  // walls: wainscot + whitewash, timber posts, window on the back wall (x 1.4..3.0)
  const WX0 = 1.3, WX1 = 3.0, WY0 = 1.05, WY1 = 2.45;
  K.box(M.wall, X0, WX0, 0, HC, Z0 - 0.2, Z0, 0xf0e2c4, 0.01, 2); K.box(M.wall, WX1, X1, 0, HC, Z0 - 0.2, Z0, 0xf0e2c4, 0.01, 2); K.box(M.wall, WX0, WX1, 0, WY0, Z0 - 0.2, Z0, 0xf0e2c4, 0.01, 2); K.box(M.wall, WX0, WX1, WY1, HC, Z0 - 0.2, Z0, 0xf0e2c4, 0.01, 2);
  K.box(M.wall, X0 - 0.2, X0, 0, HC, Z0, 4.5, 0xe8d8b8, 0.01, 2); K.box(M.wall, X1, X1 + 0.2, 0, HC, Z0, 4.5, 0xe8d8b8, 0.01, 2);
  K.box(M.wood, X0, X1, 0, 0.95, Z0, Z0 + 0.04, 0x7a5236, 0.01, 1); K.box(M.wood, X0, X1, 0.92, 0.98, Z0, Z0 + 0.07, 0x5a3a26, 0.01, 1); // wainscot + rail
  K.box(M.wood, X0, X0 + 0.04, 0, 0.95, Z0, 4.5, 0x7a5236, 0.01, 1); K.box(M.wood, X1 - 0.04, X1, 0, 0.95, Z0, 4.5, 0x7a5236, 0.01, 1);
  for (const x of [X0 + 0.1, -1.55, 1.2, X1 - 0.1]) K.box(M.wood, x - 0.1, x + 0.1, 0, HC, Z0, Z0 + 0.14, 0x6a4630, 0.015, 1);
  K.box(M.wood, X0, X1, HC - 0.2, HC, Z0, Z0 + 0.16, 0x5a3a28, 0.015, 1); K.box(M.wall, X0 - 0.2, X1 + 0.2, HC, HC + 0.15, Z0 - 0.2, 4.5, 0xd8c8a8, 0.01, 2);
  for (let i = 0; i < 5; i++) { const z = Z0 + 0.6 + i * 1.5; K.box(M.wood, X0, X1, HC - 0.24, HC, z - 0.11, z + 0.11, 0x5a3a28, 0.02, 1); }
  // window: frame, mullions, sill, night beyond; two show globes (red + green) glowing on the sill
  K.box(M.wood, WX0 - 0.08, WX1 + 0.08, WY0 - 0.08, WY0, Z0 - 0.05, Z0 + 0.18, 0x6a4630, 0.01, 1); K.box(M.wood, WX0 - 0.08, WX1 + 0.08, WY1, WY1 + 0.08, Z0 - 0.05, Z0 + 0.08, 0x6a4630, 0.01, 1);
  for (let i = 0; i <= 3; i++) { const x = WX0 + i * (WX1 - WX0) / 3; K.box(M.wood, x - 0.03, x + 0.03, WY0, WY1, Z0 - 0.1, Z0 - 0.05, 0x5a3a28, 0.005, 1); } for (let j = 1; j < 3; j++) { const y = WY0 + j * (WY1 - WY0) / 3; K.box(M.wood, WX0, WX1, y - 0.025, y + 0.025, Z0 - 0.1, Z0 - 0.05, 0x5a3a28, 0.005, 1); }
  nond(mesh(root, plane(6, 4), M.night, (WX0 + WX1) / 2, 1.9, Z0 - 1.6, 0, 0, 0, false));
  const globes = [];
  for (const [x, mat, gm, c] of [[WX0 + 0.42, M.globeR, M.glowR, 0xff4a2a], [WX1 - 0.42, M.globeG, M.glowG, 0x30c860]]) { K.put(M.brass, lathe('gst', [[0, 0], [0.08, 0], [0.06, 0.03], [0.025, 0.06], [0.025, 0.1], [0, 0.1]], 16), x, WY0, Z0 + 0.06, 0, 0, 0, 1, 1, 1, 0xc8a048);
    mesh(root, lathe('globe', [[0, 0], [0.06, 0.02], [0.15, 0.12], [0.16, 0.22], [0.12, 0.33], [0.04, 0.38], [0.035, 0.46], [0.05, 0.48], [0, 0.48]], 22), mat, x, WY0 + 0.1, Z0 + 0.06, 0, 0, 0, false);
    globes.push(glowAt(root, gm, x, WY0 + 0.32, Z0 + 0.25, 1.1)); }
  // left wall shelves: jars, crocks, bottles
  const JC = [0xc8502a, 0x8aa040, 0xd8b040, 0x6a3a7a, 0xe8d8b0, 0x4a7a5a, 0xa83a2a, 0x7a5a3a];
  for (let s = 0; s < 4; s++) { const y = 1.12 + s * 0.48; K.box(M.wood, X0, X0 + 0.42, y - 0.035, y, Z0 + 0.2, 1.4, 0x7a5236, 0.008, 1);
    for (let i = 0; i < 9; i++) { const z = Z0 + 0.42 + i * 0.5, x = X0 + 0.2; if (s % 2 === 0 && i % 3 === 1) crock(K, x, y, z, 1.0 + R() * 0.2); else jar(K, x, y, z, 0.95 + R() * 0.3, JC[(i + s * 3) % JC.length]); } }
  for (let i = 0; i < 6; i++) K.box(M.wood, X0, X0 + 0.42, 0.95, 2.62, Z0 + 0.2 + i * 0.32 * 0 + (i < 3 ? 0 : 1.15) + (i % 3) * 0.6 - 0.02, Z0 + 0.2 + (i < 3 ? 0 : 1.15) + (i % 3) * 0.6 + 0.02, 0x6a4630, 0.005, 1);
  // back shelves (left of window): bottles of the product + pill boxes
  for (let s = 0; s < 3; s++) { const y = 1.3 + s * 0.52; K.box(M.wood, -3.4, 0.9, y - 0.035, y, Z0, Z0 + 0.34, 0x7a5236, 0.008, 1); for (const x of [-3.4, -1.25, 0.9]) K.box(M.wood, x - 0.03, x + 0.03, y - 0.04, y + 0.02, Z0, Z0 + 0.34, 0x5a3a28, 0.004, 1);
    for (let i = 0; i < 20; i++) { const x = -3.25 + i * 0.21; if (x > 0.8) break; if (s === 1 && i % 7 > 3) { for (let j = 0; j < 4; j++) pillBox(K, x, y + j * 0.036, Z0 + 0.17, R() * 6, 0.95); continue; } if ((s === 2 && i % 5 === 2) || (s === 0 && i % 4 === 1)) { jar(K, x, y, Z0 + 0.17, 1.1, [0xd8301e, 0x4a9a3a, 0xe8b040, 0x6a3a8a][(i + s) % 4]); continue; } bottle(K, x, y, Z0 + 0.17, (R() - 0.5) * 0.4, 1.0 + (s === 0 ? 0.1 : 0)); } }
  for (const [x, y] of [[-3.45, 1.0], [0.95, 1.0]]) K.box(M.wood, x - 0.04, x + 0.04, y, 2.4, Z0 + 0.3, Z0 + 0.34, 0x6a4630, 0.004, 1);
  // ---- the workbench (z -1.0..-0.2, top 0.92)
  const BX0 = -1.75, BX1 = 1.75, BZ0 = -1.05, BZ1 = -0.2, BY = 0.92;
  K.box(M.wood, BX0, BX1, BY - 0.07, BY, BZ0, BZ1, 0x9a7048, 0.012, 1);
  for (const x of [BX0 + 0.08, BX1 - 0.08]) for (const z of [BZ0 + 0.08, BZ1 - 0.08]) K.box(M.wood, x - 0.05, x + 0.05, 0, BY - 0.07, z - 0.05, z + 0.05, 0x6a4630, 0.01, 1);
  K.box(M.wood, BX0 + 0.1, BX1 - 0.1, 0.18, 0.22, BZ0 + 0.1, BZ1 - 0.1, 0x6a4630, 0.008, 1); K.box(M.wood, BX0 + 0.04, BX1 - 0.04, BY - 0.24, BY - 0.07, BZ1 - 0.04, BZ1, 0x7a5236, 0.008, 1);
  for (let i = 0; i < 4; i++) K.put(M.brass, sph(0.018, 8, 6), BX0 + 0.45 + i * 0.95, BY - 0.155, BZ1 + 0.01, 0, 0, 0, 1, 1, 1, 0xc8a048);
  // mortar & pestle (left)
  const MX = -1.3, MZ = -0.55; K.put(M.stone, lathe('mort', [[0, 0], [0.11, 0], [0.13, 0.03], [0.14, 0.1], [0.13, 0.15], [0.115, 0.155], [0.1, 0.1], [0.06, 0.05], [0, 0.045]], 22), MX, BY, MZ, 0, 0, 0, 1, 1, 1, 0xd8d0c4);
  K.put(M.paint, cyl(0.095, 0.08, 0.02, 18), MX, BY + 0.105, MZ, 0, 0, 0, 1, 1, 1, 0x6a4028);
  const pestle = new THREE.Group(); root.add(pestle); pestle.position.set(MX, BY + 0.09, MZ); { const k = new Kit(); k.put(M.stone, cyl(0.022, 0.032, 0.26, 12), 0, 0.13, 0, 0, 0, 0, 1, 1, 1, 0xe2dacc); k.put(M.stone, sph(0.034, 12, 8), 0, 0.0, 0, 0, 0, 0, 1, 1, 1, 0xe2dacc); k.put(M.stone, sph(0.026, 10, 8), 0, 0.26, 0, 0, 0, 0, 1, 1, 1, 0xe2dacc); k.build(pestle); }
  // dried-herb sprigs + powder by the mortar
  for (let i = 0; i < 6; i++) K.beam(M.paint, [MX + 0.2 + i * 0.02, BY + 0.005, MZ + 0.1], [MX + 0.32 + i * 0.015, BY + 0.01, MZ - 0.05 + i * 0.02], 0.008, 0x6a7a3a, true, 4);
  K.put(M.paint, sph(0.07, 12, 6), MX + 0.05, BY, MZ + 0.22, 0, 0, 0, 1, 0.18, 0.7, 0x8a5a38);
  // bowl of pill mass + a rolled "pipe"
  K.put(M.ceramic, lathe('bowl', [[0, 0], [0.07, 0], [0.12, 0.04], [0.15, 0.09], [0.14, 0.095], [0.1, 0.05], [0, 0.04]], 20), -0.85, BY, -0.75, 0, 0, 0, 1, 1, 1, 0xe8dcc0);
  K.put(M.paint, lumpGeo(4), -0.85, BY + 0.07, -0.75, 0, 0, 0, 0.1, 0.05, 0.09, 0x6a4028); K.put(M.paint, cyl(0.013, 0.013, 0.34, 10), -0.62, BY + 0.014, -0.42, Math.PI / 2, 0.4, 0, 1, 1, 1, 0x6a4028);
  K.put(M.paint, cyl(0.03, 0.03, 0.32, 12), -0.9, BY + 0.03, -0.38, Math.PI / 2, 1.2, 0, 1, 1, 1, 0xb89a70); // rolling pin
  // ---- PILL MACHINE (centre): board, grooved brass plate, sliding grooved cutter with two handles, tray
  const PM = new THREE.Group(); root.add(PM); PM.position.set(0.05, BY, -0.62); PM.rotation.y = -Math.PI / 2; // long axis toward the camera, tray at the front
  { const k = new Kit(); k.box(M.wood, -0.42, 0.42, 0, 0.05, -0.2, 0.2, 0x8a5a36, 0.01, 1); k.box(M.wood, -0.42, 0.42, 0.05, 0.08, -0.2, -0.17, 0x6a4028, 0.006, 1); k.box(M.wood, -0.42, 0.42, 0.05, 0.08, 0.17, 0.2, 0x6a4028, 0.006, 1);
    k.box(M.brass, -0.3, 0.26, 0.05, 0.062, -0.16, 0.16, 0xc89a48, 0.003, 1); for (let i = 0; i < 13; i++) { const z = -0.15 + i * 0.025; k.put(M.brass, cyl(0.007, 0.007, 0.56, 6), -0.02, 0.064, z, 0, 0, Math.PI / 2, 1, 1, 1, 0xa87a34); }
    k.box(M.wood, 0.3, 0.42, 0.05, 0.065, -0.17, 0.17, 0x5a3a26, 0.004, 1); // tray floor
    k.build(PM); }
  const cutter = new THREE.Group(); PM.add(cutter); cutter.position.set(0, 0.08, 0);
  { const k = new Kit(); k.box(M.wood, -0.09, 0.09, 0.0, 0.06, -0.19, 0.19, 0xa87a4a, 0.01, 1); k.box(M.brass, -0.08, 0.08, -0.008, 0.004, -0.16, 0.16, 0xc89a48, 0.002, 1);
    for (const s of [-1, 1]) { k.put(M.wood, cyl(0.016, 0.016, 0.16, 10), 0, 0.035, s * 0.27, Math.PI / 2, 0, 0, 1, 1, 1, 0x7a4a2a); k.put(M.wood, sph(0.026, 10, 8), 0, 0.035, s * 0.36, 0, 0, 0, 1, 1, 1, 0x6a3a22); }
    k.box(M.wood, -0.07, 0.07, 0.06, 0.075, -0.12, 0.12, 0x8a5a36, 0.006, 1); k.build(cutter); }
  const pipe = mesh(PM, cyl(0.014, 0.014, 0.3, 10), M.paint, -0.2, 0.078, 0, Math.PI / 2, 0, 0); pipe.material = toon({ color: 0x6a4028 });
  const trayPills = pillsIM(PM, heapPts(0.36, 0.065, 0, 0.05, 0.03, 70, 5, 0.0105), 0.0105, 5);
  const rollers = pillsIM(PM, Array.from({ length: 12 }, (_, i) => [0, 0.075, -0.15 + i * 0.027]), 0.0105, 6); rollers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  // trays and heaps of pills on the bench, pill boxes stacked, bottles in a row, a scale
  K.box(M.wood, 0.55, 1.0, BY, BY + 0.03, -0.95, -0.55, 0x7a4a2a, 0.006, 1); for (const [a, b, c, d] of [[0.55, 1.0, -0.95, -0.93], [0.55, 1.0, -0.57, -0.55], [0.55, 0.57, -0.95, -0.55], [0.98, 1.0, -0.95, -0.55]]) K.box(M.wood, a, b, BY, BY + 0.05, c, d, 0x6a3a22, 0.004, 1);
  const heap1 = pillsIM(root, heapPts(0.775, BY + 0.03, -0.75, 0.2, 0.09, 520, 11), 0.011, 11);
  K.put(M.ceramic, lathe('bowl', [[0, 0], [0.07, 0], [0.12, 0.04], [0.15, 0.09], [0.14, 0.095], [0.1, 0.05], [0, 0.04]], 20), 0.45, BY, -0.32, 0, 0, 0, 1, 1, 1, 0xd8e0e8);
  const heap2 = pillsIM(root, heapPts(0.45, BY + 0.05, -0.32, 0.11, 0.07, 180, 12), 0.011, 12);
  pillsIM(root, Array.from({ length: 30 }, (_, i) => { const a = R() * TAU, d = 0.17 + R() * 0.25; return [0.6 + Math.cos(a) * d, BY + 0.011, -0.4 + Math.sin(a) * d * 0.5]; }), 0.011, 13);
  for (let c = 0; c < 4; c++) { const n = 3 + ((c * 5) % 4); for (let j = 0; j < n; j++) pillBox(K, 1.13 + (c % 2) * 0.12, BY + j * 0.042, -0.88 + Math.floor(c / 2) * 0.13, R() * 6, 1); }
  for (let i = 0; i < 6; i++) bottle(K, 1.08 + i * 0.105, BY, -0.36, (R() - 0.5) * 0.3, 1.0);
  pillBox(K, 1.45, BY, -0.62, 0.3, 1, 'miles', true); pillsIM(root, heapPts(1.45, BY + 0.035, -0.62, 0.035, 0.012, 12, 14), 0.011, 14);
  scales(K, -0.25, BY, -0.92, 0.1, 1.0);
  oilLamp(K, -0.62, BY, -0.95, 1.1); const lampW = [-0.62, BY + 0.36, -0.95];
  K.box(M.paint, -1.65, -1.25, BY, BY + 0.004, -0.98, -0.72, 0xefe4c8, 0.001, 1); K.box(M.paint, -1.6, -1.3, BY + 0.004, BY + 0.008, -0.95, -0.76, 0xf4ead4, 0.001, 1); // labels stack
  // ---- tub of pills on the floor (front left) + sacks
  const TX = -0.6, TZ = 1.0; K.put(M.wood, lathe('tub', [[0, 0], [0.32, 0], [0.36, 0.42], [0.35, 0.44], [0.31, 0.04], [0, 0.04]], 22), TX, 0, TZ, 0, 0, 0, 1, 1, 1, 0x8a5a36);
  for (const y of [0.08, 0.36]) K.put(M.metal, tor(0.33 + y * 0.09, 0.012, 6, 28), TX, y, TZ, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a3440);
  pillsIM(root, heapPts(TX, 0.36, TZ, 0.33, 0.13, 900, 21, 0.012), 0.012, 21); pillsIM(root, Array.from({ length: 40 }, () => { const a = R() * TAU, d = 0.38 + R() * 0.35; return [TX + Math.cos(a) * d, 0.012, TZ + Math.sin(a) * d]; }), 0.012, 22);
  for (const [x, z, s] of [[-3.5, -0.6, 1], [-3.1, -1.2, 0.85], [-3.7, 0.4, 0.9]]) K.put(M.paint, lumpGeo(Math.round(x * 10)), x, 0.28 * s, z, 0, R() * 3, 0, 0.3 * s, 0.32 * s, 0.26 * s, 0xc8b08a);
  // barrels + crates of empty bottles (back right)
  for (const [x, z] of [[3.6, -0.6], [3.9, 0.3]]) { K.put(M.wood, lathe('bar', [[0, 0], [0.26, 0], [0.3, 0.35], [0.26, 0.7], [0, 0.7]], 18), x, 0, z, 0, 0, 0, 1, 1, 1, 0x7a5236); for (const y of [0.1, 0.35, 0.6]) K.put(M.metal, tor(0.27 + (y === 0.35 ? 0.03 : 0), 0.012, 6, 24), x, y, z, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a3440); }
  // ---- cash desk (right): ledger, iron cash box + coin stacks
  const CX = 2.45, CZ = -0.55, CY = 0.82;
  K.box(M.wood, CX - 0.6, CX + 0.6, CY - 0.06, CY, CZ - 0.4, CZ + 0.4, 0x6a4028, 0.012, 1); for (const x of [CX - 0.54, CX + 0.54]) for (const z of [CZ - 0.34, CZ + 0.34]) K.box(M.wood, x - 0.04, x + 0.04, 0, CY - 0.06, z - 0.04, z + 0.04, 0x4a2a1a, 0.01, 1);
  K.box(M.wood, CX - 0.56, CX + 0.56, CY - 0.2, CY - 0.06, CZ + 0.34, CZ + 0.38, 0x5a3420, 0.006, 1);
  // cash box: iron with brass bands, lid open
  const BXc = CX - 0.1, BZc = CZ - 0.08; K.box(M.metal, BXc - 0.2, BXc + 0.2, CY, CY + 0.13, BZc - 0.13, BZc + 0.13, 0x3a3048, 0.012, 1);
  for (const x of [-0.12, 0.12]) K.box(M.brass, BXc + x - 0.012, BXc + x + 0.012, CY - 0.002, CY + 0.132, BZc - 0.132, BZc + 0.132, 0xc8a048, 0.004, 1);
  K.put(M.brass, sph(0.015, 8, 6), BXc, CY + 0.08, BZc + 0.135, 0, 0, 0, 1, 1, 1, 0xd8b058);
  K.at(BXc, CY + 0.13, BZc - 0.13, 0, () => { K.put(M.metal, rboxLid(), 0, 0.13, -0.02, -0.25, 0, 0, 1, 1, 1, 0x3a3048); });
  K.box(M.paint, BXc - 0.18, BXc + 0.18, CY + 0.02, CY + 0.1, BZc - 0.11, BZc + 0.11, 0x2a1a24, 0.004, 1);
  // ledger + quill + inkwell
  K.box(M.paint, CX + 0.12, CX + 0.52, CY, CY + 0.03, CZ - 0.05, CZ + 0.24, 0x6a2a24, 0.006, 1); K.box(M.paint, CX + 0.14, CX + 0.5, CY + 0.03, CY + 0.034, CZ - 0.03, CZ + 0.22, 0xb8ac94, 0.002, 1);
  K.put(M.ink, cyl(0.03, 0.035, 0.05, 10), CX + 0.45, CY + 0.025, CZ - 0.25); K.beam(M.ceramic, [CX + 0.45, CY + 0.04, CZ - 0.25], [CX + 0.36, CY + 0.25, CZ - 0.2], 0.008, 0xf4f0e8, true, 4);
  // coins: stacks in and beside the box; cash(t) reveals them (instance count)
  const coinPts = [], stacks = [[BXc - 0.12, CY + 0.02, BZc - 0.05, 0xd8b048], [BXc - 0.04, CY + 0.02, BZc + 0.04, 0xc0c0c8], [BXc + 0.06, CY + 0.02, BZc - 0.04, 0xd8b048], [BXc + 0.13, CY + 0.02, BZc + 0.05, 0xd8b048],
    [CX + 0.24, CY, CZ + 0.3, 0xd8b048], [CX + 0.32, CY, CZ + 0.28, 0xc0c0c8], [CX + 0.18, CY, CZ + 0.36, 0xd8b048], [BXc - 0.3, CY, BZc + 0.2, 0xd8b048], [BXc - 0.22, CY, BZc + 0.28, 0xc0c0c8], [BXc - 0.36, CY, BZc + 0.3, 0xd8b048], [BXc + 0.26, CY, BZc + 0.22, 0xd8b048]];
  for (let lvl = 0; lvl < 22; lvl++) stacks.forEach(([x, y, z, c], si) => { if (lvl < 22 - (si % 4) * 3) coinPts.push([x + (R() - 0.5) * 0.006, y + 0.0045 + lvl * 0.0085, z + (R() - 0.5) * 0.006, c]); });
  const coins = new THREE.InstancedMesh(cyl(0.024, 0.024, 0.0075, 16), M.coin, coinPts.length); { const m4 = new THREE.Matrix4(), c = new THREE.Color(); coinPts.forEach((p, i) => { m4.makeTranslation(p[0], p[1], p[2]); coins.setMatrixAt(i, m4); coins.setColorAt(i, c.setHex(p[3])); }); }
  coins.castShadow = true; coins.receiveShadow = true; root.add(coins);
  // banknotes bundle
  for (let i = 0; i < 3; i++) K.box(M.paint, CX - 0.5 + i * 0.03, CX - 0.32 + i * 0.03, CY + i * 0.012, CY + 0.01 + i * 0.012, CZ + 0.14 - i * 0.01, CZ + 0.24 - i * 0.01, 0xd8d4b0, 0.002, 1);
  oilLamp(K, CX + 0.42, CY, CZ - 0.1, 1.0); const lampC = [CX + 0.42, CY + 0.33, CZ - 0.1];
  // ---- THE TOMATO CRATE (back right corner, untouched: cobweb + dust)
  const TC = [2.45, -2.62]; K.at(TC[0], 0, TC[1], -0.12, () => { for (let i = 0; i < 4; i++) { const y = 0.03 + i * 0.11; K.box(M.wood, -0.38, 0.38, y, y + 0.085, 0.25, 0.28, 0x9a7a52, 0.006, 1); K.box(M.wood, -0.38, 0.38, y, y + 0.085, -0.28, -0.25, 0x9a7a52, 0.006, 1); K.box(M.wood, -0.38, -0.35, y, y + 0.085, -0.25, 0.25, 0x8a6a48, 0.006, 1); K.box(M.wood, 0.35, 0.38, y, y + 0.085, -0.25, 0.25, 0x8a6a48, 0.006, 1); }
    for (const x of [-0.36, 0.36]) for (const z of [-0.26, 0.26]) K.box(M.wood, x - 0.03, x + 0.03, 0, 0.47, z - 0.03, z + 0.03, 0x7a5a3a, 0.006, 1); K.box(M.wood, -0.36, 0.36, 0, 0.03, -0.26, 0.26, 0x7a5a3a, 0.006, 1);
    for (let i = 0; i < 14; i++) { const x = -0.26 + (i % 5) * 0.13 + (R() - 0.5) * 0.02, z = -0.14 + Math.floor(i / 5) * 0.14; tomato(K, x, 0.4 + (i % 2) * 0.03, z, 0.065, 300 + i); }
    tomato(K, 0.05, 0.5, 0.0, 0.065, 333); tomato(K, -0.12, 0.49, 0.06, 0.06, 334); }); // the pile
  const web = mesh(root, plane(0.75, 0.75), M.web, TC[0] - 0.33, 0.5, TC[1] - 0.25, 0, Math.PI / 2 - 0.12, Math.PI / 2, false); nond(web);
  const web2 = mesh(root, plane(0.7, 0.7), M.web, X1 - 0.02, HC - 0.4, Z0 + 0.4, 0, -Math.PI / 2, Math.PI, false); nond(web2);
  // ---- herb bundles + a drying rack hanging from the beams; copper pot; pegs w/ apron
  for (let i = 0; i < 9; i++) { const x = -3.6 + i * 0.85 + (R() - 0.5) * 0.2, z = Z0 + 0.6 + (i % 3) * 1.5, L = 0.3 + R() * 0.25; K.beam(M.paint, [x, HC - 0.22, z], [x, HC - 0.4, z], 0.006, 0xc8b090, true, 4);
    for (let j = 0; j < 7; j++) { const a = j / 7 * TAU; K.beam(M.paint, [x, HC - 0.4, z], [x + Math.cos(a) * 0.06, HC - 0.4 - L, z + Math.sin(a) * 0.06], 0.008, 0x7a6a3a, true, 4); }
    for (let j = 0; j < 9; j++) { const a = j * 2.4, t = 0.3 + (j / 9) * 0.7, rr = 0.03 + t * 0.06; K.put(M.paint, lumpGeo(j + i * 9), x + Math.cos(a) * rr, HC - 0.4 - L * t, z + Math.sin(a) * rr, 0, a, 0, 0.05, 0.07, 0.05, [0x6a8a3a, 0x8a9a4a, 0x5a7a2a, 0x9a7a4a][(j + i) % 4]); }
    K.box(M.paint, x - 0.025, x + 0.025, HC - 0.42, HC - 0.38, z - 0.025, z + 0.025, 0xb83a2a, 0.005, 1); }
  for (let i = 0; i < 4; i++) K.put(M.brass, cyl(0.012, 0.012, 0.08, 6), X1 - 0.05, 1.8, -1.6 + i * 0.4, 0, 0, Math.PI / 2, 1, 1, 1, 0x8a6a40);
  K.put(M.paint, lumpGeo(77), X1 - 0.15, 1.45, -1.6, 0, 0, 0, 0.12, 0.38, 0.1, 0xe8e0cc); K.put(M.paint, lumpGeo(78), X1 - 0.18, 1.5, -0.8, 0, 0, 0, 0.14, 0.35, 0.12, 0x5a3a5a);
  // small iron stove (left, back corner) with an ember glow
  K.put(M.metal, cyl(0.25, 0.28, 0.7, 16), -3.75, 0.35, -2.5, 0, 0, 0, 1, 1, 1, 0x2a2430); K.put(M.metal, cyl(0.06, 0.06, 2.6, 10), -3.75, 2.0, -2.5, 0, 0, 0, 1, 1, 1, 0x2a2430);
  K.put(M.flame, plane(0.14, 0.08), -3.75, 0.3, -2.22, 0, 0, 0); const ember = glowAt(root, M.glow, -3.75, 0.32, -2.1, 0.7);
  // a stool + a chair by the bench
  for (const [x, z] of [[0.75, 0.35]]) { K.put(M.wood, cyl(0.17, 0.17, 0.04, 16), x, 0.62, z, 0, 0, 0, 1, 1, 1, 0x8a5a36); for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + 0.4; K.beam(M.wood, [x + Math.cos(a) * 0.12, 0.6, z + Math.sin(a) * 0.12], [x + Math.cos(a) * 0.2, 0, z + Math.sin(a) * 0.2], 0.03, 0x6a4028, true, 6); } }
  // foreground: a crate of corked bottles (right front)
  K.at(1.3, 0, 1.05, 0.25, () => { K.box(M.wood, -0.3, 0.3, 0, 0.25, -0.2, 0.2, 0xa07a50, 0.01, 1); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) bottle(K, -0.21 + i * 0.14, 0.12, -0.12 + j * 0.12, 0, 1.05); });
  K.build(root);
  const lamps = [lampW, lampC].map((p) => glowAt(root, M.glow, p[0], p[1] - 0.02, p[2] + 0.02, 0.55));
  return { cutter, rollers, trayPills, pestle, coins, coinN: coinPts.length, lamps, globes, ember, PM, lampW, lampC, BY, CX, CZ, CY, BXc, BZc, TC };
}
function rboxLid() { return cached('lid', () => { const g = new THREE.BoxGeometry(0.4, 0.26, 0.02); return g; }); }

// ---------------------------------------------------------------- set: press (print shop + ad-war wall)
function buildPress(root) {
  const R = rng(1838), K = new Kit(), X0 = -5, X1 = 5, Z0 = -3.4, HC = 3.7;
  mesh(root, plane(X1 - X0, 9), M.floor, 0, 0, 1.0, -Math.PI / 2, 0, 0, false);
  // back wall (brick lower course + plaster) : the poster wall
  K.box(M.wall, X0, X1, 0, HC, Z0 - 0.2, Z0, 0xe6d8bc, 0.01, 2); K.box(M.brick, X0, X1, 0, 0.3, Z0, Z0 + 0.03, 0xffffff, 0.005, 1.2);
  K.box(M.wall, X0 - 0.2, X0, 0, HC, Z0, 4.5, 0xe0d0b4, 0.01, 2); K.box(M.wall, X1, X1 + 0.2, 0, HC, Z0, 4.5, 0xe0d0b4, 0.01, 2); K.box(M.wall, X0 - 0.2, X1 + 0.2, HC, HC + 0.15, Z0 - 0.2, 4.5, 0xd0c0a0, 0.01, 2);
  K.box(M.wood, -0.12, 0.12, 0, HC, Z0, Z0 + 0.2, 0x5a3a26, 0.015, 1); // the dividing post (Miles | Phelps)
  for (const x of [X0 + 0.1, X1 - 0.1]) K.box(M.wood, x - 0.1, x + 0.1, 0, HC, Z0, Z0 + 0.16, 0x5a3a26, 0.015, 1);
  K.box(M.wood, X0, X1, HC - 0.22, HC, Z0, Z0 + 0.18, 0x4a2e20, 0.015, 1); for (let i = 0; i < 5; i++) { const z = Z0 + 0.7 + i * 1.6; K.box(M.wood, X0, X1, HC - 0.26, HC, z - 0.12, z + 0.12, 0x4a2e20, 0.02, 1); }
  // posters on the wall: ordered list; ads(t) shows the first n. Miles side x<0, Phelps x>0, neutral "SOLD HERE" anywhere.
  const posters = []; const N = 78;
  const sideOf = (i) => (i % 2 ? 'P' : 'M');
  for (let i = 0; i < N; i++) { const s = sideOf(i), neutral = i % 9 === 8; let pi;
    if (neutral) pi = 8 + (i % 2); else { const pool = POSTERS.map((p, j) => [p, j]).filter(([p]) => p.side === s); pi = pool[(i * 7 + (i >> 1)) % pool.length][1]; }
    const spec = POSTERS[pi], land = !!spec.land, sc = 0.82 + R() * 0.45 + (i < 6 ? 0.25 : 0), w = (land ? 0.95 : 0.62) * sc, h = (land ? 0.66 : 0.88) * sc;
    const spread = Math.min(1, 0.35 + i / N), sx = s === 'M' ? -1 : 1;
    let x = neutral ? (R() - 0.5) * 8.6 : sx * (0.45 + w / 2 + R() * (4.3 - w) * spread);
    if (i > 50 && !neutral) x = sx * (0.1 + R() * 1.2); // late: the war crosses the line
    const y = 0.45 + h / 2 + R() * (2.95 - h) ;
    const m = mesh(root, plane(w, h), M.posters[pi], x, y, Z0 + 0.012 + i * 0.0016, 0, 0, (R() - 0.5) * (i < 6 ? 0.06 : 0.22), false); m.receiveShadow = true; m.userData.i = i; m.userData.sc0 = 1; posters.push(m); }
  // tatters of torn old posters (always there)
  for (let i = 0; i < 6; i++) { const m = mesh(root, plane(0.3 + R() * 0.3, 0.2 + R() * 0.3), M.news, -4.4 + R() * 8.8, 0.6 + R() * 2.4, Z0 + 0.006, 0, 0, (R() - 0.5) * 0.6, false); }
  // paste bucket + brush + ladder at the wall
  K.put(M.wood, lathe('bk', [[0, 0], [0.13, 0], [0.15, 0.26], [0, 0.26]], 16), -0.6, 0, Z0 + 0.45, 0, 0, 0, 1, 1, 1, 0x8a6a48); K.put(M.ceramic, cyl(0.14, 0.14, 0.01, 16), -0.6, 0.235, Z0 + 0.45, 0, 0, 0, 1, 1, 1, 0xf0ead8);
  K.beam(M.wood, [-0.6, 0.2, Z0 + 0.45], [-0.45, 0.62, Z0 + 0.5], 0.02, 0x9a7a52, true, 6); K.box(M.paint, -0.5, -0.4, 0.6, 0.66, Z0 + 0.46, Z0 + 0.54, 0xd8c8a0, 0.01, 1);
  for (const x of [4.35, 4.75]) K.beam(M.wood, [x, 0, Z0 + 0.7], [x - 0.05, 2.6, Z0 + 0.12], 0.05, 0x9a7a52); for (let j = 1; j < 9; j++) { const t = j / 9; K.beam(M.wood, [4.35 - 0.05 * t, 2.6 * t, Z0 + 0.7 - 0.58 * t], [4.75 - 0.05 * t, 2.6 * t, Z0 + 0.7 - 0.58 * t], 0.03, 0x8a6a48); }
  // left wall window (afternoon light) + shaft
  const WZ0 = -1.6, WZ1 = 0.2; for (const z of [WZ0, WZ1]) K.box(M.wood, X0, X0 + 0.12, 0.9, 2.6, z - 0.05, z + 0.05, 0x6a4630, 0.01, 1); K.box(M.wood, X0, X0 + 0.16, 0.86, 0.92, WZ0, WZ1, 0x6a4630, 0.01, 1); K.box(M.wood, X0, X0 + 0.12, 2.6, 2.66, WZ0, WZ1, 0x6a4630, 0.01, 1);
  for (let i = 1; i < 3; i++) K.box(M.wood, X0, X0 + 0.06, 0.9, 2.6, WZ0 + i * (WZ1 - WZ0) / 3 - 0.02, WZ0 + i * (WZ1 - WZ0) / 3 + 0.02, 0x5a3a28, 0.005, 1); for (let j = 1; j < 4; j++) K.box(M.wood, X0, X0 + 0.06, 0.9 + j * 0.425 - 0.02, 0.9 + j * 0.425 + 0.02, WZ0, WZ1, 0x5a3a28, 0.005, 1);
  K.box(M.wall, X0 - 0.2, X0, 0, 0.88, WZ0, WZ1, 0xe0d0b4, 0.01, 2); // (wall is solid; window cut is painted below)
  const sky = mesh(root, plane(1.75, 1.7), M.day, X0 + 0.005, 1.75, (WZ0 + WZ1) / 2, 0, Math.PI / 2, 0, false); nond(sky);
  const shafts = []; for (let i = 0; i < 3; i++) { const s = mesh(root, plane(0.55, 4.2), M.shaft.clone(), X0 + 1.4, 1.2, WZ0 + 0.3 + i * 0.55, 0, 0, 0, false); s.rotation.set(0, Math.PI / 2, -1.05, 'YXZ'); nond(s); shafts.push(s); }
  // ---- the wooden common press (left of centre, 3/4 view)
  const press = new THREE.Group(); root.add(press); press.position.set(-1.35, 0, 0.3); press.rotation.y = 0.35;
  const bar = new THREE.Group(), platen = new THREE.Group();
  { const k = new Kit(), wc = 0x7a4e2e, dk = 0x5a3620;
    for (const x of [-0.42, 0.42]) { k.box(M.wood, x - 0.09, x + 0.09, 0, 2.15, -0.15, 0.15, wc, 0.02, 1); k.box(M.wood, x - 0.13, x + 0.13, 0, 0.12, -0.75, 0.75, dk, 0.02, 1); k.beam(M.wood, [x, 0.1, -0.7], [x, 1.2, -0.12], 0.08, dk); }
    k.box(M.wood, -0.6, 0.6, 2.15, 2.4, -0.18, 0.18, dk, 0.02, 1); k.box(M.wood, -0.52, 0.52, 1.55, 1.7, -0.16, 0.16, wc, 0.02, 1); // cap + head
    k.box(M.wood, -0.52, 0.52, 0.72, 0.82, -0.16, 0.16, wc, 0.02, 1); // winter (bed support)
    k.box(M.wood, -0.34, 0.34, 0.82, 0.88, -0.2, 1.25, dk, 0.01, 1); // ribs / rails out to the front
    k.box(M.wood, -0.3, 0.3, 0.88, 0.94, -0.15, 0.6, 0x8a5a36, 0.008, 1); k.box(M.metal, -0.24, 0.24, 0.94, 0.96, -0.08, 0.38, 0x4a4450, 0.004, 1); // carriage + forme of type
    k.box(M.paint, -0.25, 0.25, 0.97, 0.975, -0.08, 0.38, 0xf2ead8, 0.001, 1); // sheet on the forme
    k.at(0, 0.96, 0.62, 0, () => { k.box(M.wood, -0.27, 0.27, 0, 0.02, 0, 0.5, 0x8a6a48, 0.005, 1); k.box(M.paint, -0.25, 0.25, 0.02, 0.025, 0.02, 0.48, 0xe8dcc0, 0.002, 1); }); // tympan laid open
    k.put(M.wood, cyl(0.07, 0.07, 0.2, 12), 0, 1.0 + 0.85, 0.32, 0, 0, Math.PI / 2, 1, 1, 1, dk); // rounce handle hub
    k.put(M.brass, cyl(0.035, 0.035, 0.55, 10), 0, 1.75 + 0.0, 0, 0, 0, 0, 1, 1, 1, 0x8a7a5a); // screw (spindle)
    k.box(M.wood, -0.46, -0.33, 0.12, 0.6, 0.6, 0.72, dk, 0.01, 1); k.box(M.wood, 0.33, 0.46, 0.12, 0.6, 0.6, 0.72, dk, 0.01, 1);
    k.build(press); }
  press.add(platen); platen.position.set(0, 1.08, 0.12); { const k = new Kit(); k.box(M.wood, -0.28, 0.28, 0, 0.08, -0.2, 0.2, 0x6a4028, 0.01, 1); k.box(M.metal, -0.27, 0.27, -0.01, 0.0, -0.19, 0.19, 0x5a5460, 0.003, 1); k.put(M.brass, cyl(0.03, 0.03, 0.5, 8), 0, 0.33, 0, 0, 0, 0, 1, 1, 1, 0x8a7a5a); k.build(platen); }
  press.add(bar); bar.position.set(0, 1.52, 0.0); { const k = new Kit(); k.put(M.metal, cyl(0.022, 0.018, 0.85, 8), 0.44, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x3a3440); k.put(M.wood, cyl(0.035, 0.035, 0.22, 10), 0.92, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x7a4a2a); k.build(bar); }
  // ink stand: slab + two ink balls (dabbers)
  K.at(-3.7, 0, 0.6, 0.6, () => { K.box(M.wood, -0.3, 0.3, 0, 0.82, -0.22, 0.22, 0x6a4028, 0.01, 1); K.box(M.stone, -0.28, 0.28, 0.82, 0.86, -0.2, 0.2, 0x3a3440, 0.004, 1); K.put(M.ink, sph(0.12, 14, 8), -0.1, 0.86, 0.0, 0, 0, 0, 1, 0.15, 1);
    for (const x of [0.06, 0.2]) { K.put(M.paint, sph(0.08, 14, 8), x, 0.92, 0.08, 0, 0, 0, 1, 0.6, 1, 0x4a3030); K.put(M.wood, cyl(0.018, 0.022, 0.2, 8), x, 1.04, 0.08, 0, 0, 0, 1, 1, 1, 0x8a6a48); } });
  // ---- type cases (right): slanted cabinet with compartments + composing stick
  K.at(2.9, 0, -1.4, -0.35, () => { K.box(M.wood, -0.75, 0.75, 0, 0.95, -0.35, 0.35, 0x6a4028, 0.015, 1); for (let i = 0; i < 6; i++) K.box(M.wood, -0.7, 0.7, 0.1 + i * 0.13, 0.12 + i * 0.13, 0.33, 0.36, 0x8a5a36, 0.004, 1);
    for (const [y, z] of [[1.08, -0.05], [1.4, -0.28]]) { K.at(0, y, z, 0, () => { const m = new THREE.Matrix4().makeRotationX(-0.42); const o = K.M.clone(); K.M.multiply(m); K.box(M.wood, -0.72, 0.72, -0.03, 0.0, -0.24, 0.24, 0x5a3a24, 0.006, 1); K.put(M.typecase, plane(1.4, 0.44), 0, 0.002, 0, -Math.PI / 2, 0, 0); K.M.copy(o); }); }
    K.box(M.wood, -0.72, -0.66, 0.95, 1.65, -0.45, 0.2, 0x5a3a24, 0.006, 1); K.box(M.wood, 0.66, 0.72, 0.95, 1.65, -0.45, 0.2, 0x5a3a24, 0.006, 1);
    K.box(M.metal, -0.2, 0.1, 1.13, 1.17, 0.18, 0.24, 0x8a8a96, 0.004, 1); });
  // ---- drying lines across the room with broadsheets (posters + newsprint), sway in tick
  const sheets = []; for (const [z, y] of [[0.9, 2.95], [-0.5, 3.2], [2.2, 2.75]]) { K.beam(M.paint, [X0, y, z], [X1, y, z], 0.008, 0xd8c8a8, true, 4);
    for (let i = 0; i < 9; i++) { const x = -4.2 + i * 1.02 + (R() - 0.5) * 0.15; if (z > 2 && Math.abs(x) < 1.4) continue; const mt = R() < 0.35 ? M.news : M.posters[(i * 3 + Math.round(z)) % 8]; const sg = new THREE.Group(); root.add(sg); sg.position.set(x, y, z);
      const s = mesh(sg, plane(0.5, 0.7), mt, 0, -0.35, 0, 0, 0, 0, false); s.castShadow = false; for (const dx of [-0.2, 0.2]) mesh(sg, cached('pegG', () => new THREE.BoxGeometry(0.02, 0.07, 0.02)), M.paint, dx, 0.0, 0, 0, 0, 0, false).material = toon({ color: 0xb89a70 }); sg.userData.ph = R() * 6; sheets.push(sg); } }
  // ---- paper stacks, bundles of ads tied with string, a bench with fresh sheets, crates
  for (const [x, z, n] of [[1.6, 0.6, 9], [1.95, 0.75, 6], [0.45, 1.9, 7]]) for (let j = 0; j < n; j++) K.box(M.paint, x - 0.3, x + 0.3, j * 0.045, j * 0.045 + 0.04, z - 0.21, z + 0.21, j % 2 ? 0xe8dcc0 : 0xf0e6cc, 0.004, 1);
  K.box(M.wood, -0.2, 1.4, 0, 0.78, -2.6, -2.0, 0x6a4028, 0.015, 1); for (let j = 0; j < 4; j++) { const p = mesh(root, plane(0.44, 0.62), M.posters[j * 2 % 8], 0.15 + j * 0.34, 0.785 + j * 0.002, -2.3, -Math.PI / 2, (R() - 0.5) * 0.3, 0, false); }
  oilLamp(K, 1.2, 0.78, -2.45, 1.1); const lampP = [1.2, 0.78 + 0.36, -2.45];
  // wall sconce lamps on the posts
  for (const x of [X0 + 0.1, X1 - 0.1]) { K.box(M.metal, x - 0.04, x + 0.04, 1.6, 1.64, Z0 + 0.16, Z0 + 0.36, 0x3a3440, 0.004, 1); oilLamp(K, x, 1.64, Z0 + 0.3, 1.0); }
  K.build(root);
  const glows = [lampP, [X0 + 0.1, 1.98, Z0 + 0.32], [X1 - 0.1, 1.98, Z0 + 0.32]].map((p) => glowAt(root, M.glow, p[0], p[1], p[2] + 0.02, 0.5));
  return { posters, sheets, bar, platen, shafts, glows, N };
}

// ---------------------------------------------------------------- set: lab (the expose at night) + macro stage
function buildLab(root) {
  const R = rng(1850), K = new Kit(), X0 = -3.2, X1 = 3.2, Z0 = -2.2, HC = 3.2;
  mesh(root, plane(X1 - X0, 7), M.floor, 0, 0, 1.2, -Math.PI / 2, 0, 0, false);
  const WX0 = -1.7, WX1 = 0.3, WY0 = 1.05, WY1 = 2.75;
  K.box(M.wall, X0, WX0, 0, HC, Z0 - 0.2, Z0, 0xc8b8a8, 0.01, 2); K.box(M.wall, WX1, X1, 0, HC, Z0 - 0.2, Z0, 0xc8b8a8, 0.01, 2); K.box(M.wall, WX0, WX1, 0, WY0, Z0 - 0.2, Z0, 0xc8b8a8, 0.01, 2); K.box(M.wall, WX0, WX1, WY1, HC, Z0 - 0.2, Z0, 0xc8b8a8, 0.01, 2);
  K.box(M.wall, X0 - 0.2, X0, 0, HC, Z0, 3.5, 0xc0b0a0, 0.01, 2); K.box(M.wall, X1, X1 + 0.2, 0, HC, Z0, 3.5, 0xc0b0a0, 0.01, 2); K.box(M.wall, X0 - 0.2, X1 + 0.2, HC, HC + 0.15, Z0 - 0.2, 3.5, 0xa89888, 0.01, 2);
  K.box(M.wood, X0, X1, 0, 0.85, Z0, Z0 + 0.04, 0x4a2e22, 0.01, 1);
  K.box(M.wood, WX0 - 0.1, WX1 + 0.1, WY0 - 0.1, WY0, Z0 - 0.05, Z0 + 0.2, 0x4a2e22, 0.01, 1); K.box(M.wood, WX0 - 0.1, WX1 + 0.1, WY1, WY1 + 0.1, Z0 - 0.05, Z0 + 0.06, 0x4a2e22, 0.01, 1);
  for (let i = 0; i <= 4; i++) { const x = WX0 + i * (WX1 - WX0) / 4; K.box(M.wood, x - 0.03, x + 0.03, WY0, WY1, Z0 - 0.1, Z0 - 0.04, 0x3a2418, 0.005, 1); } for (let j = 1; j < 4; j++) { const y = WY0 + j * (WY1 - WY0) / 4; K.box(M.wood, WX0, WX1, y - 0.022, y + 0.022, Z0 - 0.1, Z0 - 0.04, 0x3a2418, 0.005, 1); }
  nond(mesh(root, plane(7, 4.5), M.nightMoon, (WX0 + WX1) / 2, 2.0, Z0 - 2.0, 0, 0, 0, false));
  // moonlight shafts through the window onto the bench
  const shafts = []; for (let i = 0; i < 3; i++) { const s = mesh(root, plane(0.5, 3.4), M.shaft.clone(), -1.2 + i * 0.6, 1.6, Z0 + 0.9, 0, 0, 0, false); s.rotation.set(-0.95, 0.15, 0, 'YXZ'); s.material.color.set(0x9aa8ff); nond(s); shafts.push(s); }
  // shelves with glassware (right of window)
  for (let s = 0; s < 4; s++) { const y = 1.1 + s * 0.45; K.box(M.wood, 0.6, 3.1, y - 0.03, y, Z0, Z0 + 0.3, 0x4a2e22, 0.006, 1);
    for (let i = 0; i < 11; i++) { const x = 0.75 + i * 0.22; if (R() < 0.45) jar(K, x, y, Z0 + 0.15, 0.85 + R() * 0.3, [0x6a3a2a, 0x3a4a6a, 0x8a7a3a, 0x5a2a4a][i % 4]); else K.put(M.glass, lathe('fl' + (i % 3), i % 3 === 0 ? [[0, 0], [0.07, 0], [0.08, 0.05], [0.03, 0.14], [0.02, 0.24], [0, 0.24]] : i % 3 === 1 ? [[0, 0], [0.04, 0], [0.04, 0.22], [0, 0.22]] : [[0, 0], [0.06, 0.01], [0.07, 0.07], [0.04, 0.12], [0.015, 0.16], [0.015, 0.22], [0, 0.22]], 14), x, y, Z0 + 0.15); } }
  // left: books + a skeleton-free anatomy chart? (no) -> a framed diploma-like empty frame + coat on hook
  K.box(M.wood, -3.1, -2.2, 0, 2.2, Z0, Z0 + 0.35, 0x4a2e22, 0.015, 1); for (let s = 0; s < 4; s++) { const y = 0.3 + s * 0.5; for (let i = 0; i < 12; i++) { const x = -3.05 + i * 0.07, hb = 0.3 + R() * 0.12; K.box(M.paint, x, x + 0.06, y, y + hb, Z0 + 0.05, Z0 + 0.3, [0x6a2a2a, 0x2a3a5a, 0x5a4a2a, 0x3a2a4a, 0x2a4a3a][(i + s) % 5], 0.005, 1); } }
  // ---- the bench (z -1.0..-0.2, top 0.9)
  const BY = 0.9; K.box(M.wood, -1.9, 1.9, BY - 0.07, BY, -1.05, -0.15, 0x5a3624, 0.012, 1); for (const x of [-1.82, 1.82]) for (const z of [-0.98, -0.22]) K.box(M.wood, x - 0.05, x + 0.05, 0, BY - 0.07, z - 0.05, z + 0.05, 0x3a2418, 0.01, 1);
  K.box(M.wood, -1.8, 1.8, 0.2, 0.24, -0.95, -0.25, 0x3a2418, 0.008, 1);
  // white dish with the halved pill + crumbs + a small spatula
  const DX = 0, DZ = -0.5; K.put(M.porcelain, lathe('dish', [[0, 0], [0.09, 0], [0.13, 0.012], [0.16, 0.025], [0.165, 0.028], [0.13, 0.02], [0, 0.012]], 28), DX, BY, DZ, 0, 0, 0, 1, 1, 1, 0xf4f4fa);
  K.put(M.porcelain, tor(0.15, 0.004, 6, 30), DX, BY + 0.026, DZ, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a5aa0);
  const pr = 0.024, halves = (k, cx, cy, cz) => { k.put(M.pillSkin, hemi(pr), cx - 0.026, cy + 0.014 + pr * 0.8, cz, Math.PI + 0.5, 0.3, 0); k.put(M.pillCut, disc(pr * 0.995, 24), cx - 0.026, cy + 0.014 + pr * 0.8, cz, -Math.PI / 2 + 0.5, 0.3, 0); // half 1: cut face up toward camera
    k.put(M.pillSkin, hemi(pr), cx + 0.03, cy + 0.012, cz + 0.01, 0, 0.5, 0); }; // half 2: dome up
  halves(K, DX, BY, DZ);
  // fake magnification: a scaled copy of the halves placed in the lens plane along the view ray (see API.magnify)
  const magG = new THREE.Group(); root.add(magG); magG.visible = false; { const k = new Kit(); halves(k, 0, -0.026, 0); k.put(M.porcelain, disc(0.06, 32), 0, -0.006, -0.005, -Math.PI / 2, 0, 0, 1, 1, 1, 0xf4f4fa); k.build(magG); }
  for (let i = 0; i < 8; i++) K.put(M.paint, lumpGeo(i), DX + (R() - 0.5) * 0.12, BY + 0.016, DZ + (R() - 0.3) * 0.08, 0, 0, 0, 0.004, 0.003, 0.004, 0x5e3a22);
  K.box(M.metal, DX + 0.08, DX + 0.2, BY + 0.028, BY + 0.031, DZ + 0.06, DZ + 0.075, 0xc8c8d8, 0.001, 1); K.box(M.wood, DX + 0.2, DX + 0.3, BY + 0.025, BY + 0.037, DZ + 0.058, DZ + 0.078, 0x3a2418, 0.004, 1);
  // magnifying glass on a brass stand: base, upright, arm, ring over the dish
  const MG = { x: 0.03, y: BY + 0.14, z: -0.36 }; K.put(M.brass, cyl(0.07, 0.08, 0.025, 20), 0.42, BY + 0.012, -0.72, 0, 0, 0, 1, 1, 1, 0x8a6a30);
  K.beam(M.brass, [0.42, BY, -0.72], [0.42, BY + 0.42, -0.72], 0.012, 0xc8a048, true, 8); K.beam(M.brass, [0.42, BY + 0.42, -0.72], [MG.x + 0.11, MG.y + 0.05, MG.z - 0.02], 0.01, 0xa88a50, true, 8);
  K.put(M.brass, sph(0.018, 10, 8), 0.42, BY + 0.42, -0.72, 0, 0, 0, 1, 1, 1, 0xd8b058);
  K.put(M.brass, tor(0.11, 0.0065, 8, 48), MG.x, MG.y, MG.z, -0.45, 0, 0, 1, 1, 1, 0x9a8458); K.put(M.wood, cyl(0.014, 0.012, 0.16, 8), MG.x + 0.18, MG.y - 0.05, MG.z, 0, 0, 1.0, 1, 1, 1, 0x3a2418);
  const lens = mesh(root, disc(0.105, 40), M.lens, MG.x, MG.y, MG.z, -0.45, 0, 0, false); nond(lens); // ring normal tilted up toward the camera
  const lensHi = mesh(root, cached('lhi', () => new THREE.RingGeometry(0.06, 0.075, 24, 1, 2.2, 0.9)), M.lensHi, MG.x, MG.y + 0.001, MG.z + 0.002, 0, 0, 0, false); lensHi.rotation.copy(lens.rotation); nond(lensHi);
  // candle (left), oil lamp (right), spirit lamp + flask on a ring stand (far left)
  candle(K, -0.62, BY, -0.72, 0.17, 1.2); const candleW = [-0.62, BY + 0.085 * 1.2 + 0.17 * 1.2 + 0.03, -0.72];
  oilLamp(K, 1.35, BY, -0.82, 1.1); const lampW = [1.35, BY + 0.36, -0.82];
  K.at(-1.45, BY, -0.75, 0, () => { K.put(M.glass, lathe('sl', [[0, 0], [0.05, 0], [0.055, 0.04], [0.02, 0.07], [0, 0.07]], 14), 0, 0, 0); K.put(M.metal, cyl(0.008, 0.008, 0.5, 6), 0.12, 0.25, 0, 0, 0, 0, 1, 1, 1, 0x3a3440); K.put(M.metal, tor(0.05, 0.005, 6, 18), 0.03, 0.2, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a3440); K.beam(M.metal, [0.12, 0.2, 0], [0.08, 0.2, 0], 0.008, 0x3a3440, true, 4);
    K.put(M.glass, lathe('rf', [[0, 0], [0.04, 0.005], [0.07, 0.05], [0.065, 0.1], [0.025, 0.13], [0.018, 0.22], [0, 0.22]], 16), 0.03, 0.2, 0); K.put(M.paint, sph(0.055, 12, 8), 0.03, 0.245, 0, 0, 0, 0, 1, 0.6, 1, 0x7a4a2a); K.put(M.blueFlame, lathe('bfl', [[0, 0], [0.012, 0.01], [0.012, 0.03], [0, 0.06]], 10), 0, 0.075, 0); });
  // test-tube rack with tubes (brown, amber, cloudy), one tube lying
  K.at(-1.05, BY, -0.55, 0.15, () => { K.box(M.wood, -0.2, 0.2, 0, 0.02, -0.05, 0.05, 0x7a5236, 0.004, 1); K.box(M.wood, -0.2, 0.2, 0.1, 0.12, -0.05, 0.05, 0x7a5236, 0.004, 1); for (const x of [-0.19, 0.19]) K.box(M.wood, x - 0.01, x + 0.01, 0, 0.12, -0.05, 0.05, 0x6a4028, 0.003, 1);
    for (let i = 0; i < 6; i++) { const x = -0.15 + i * 0.06, h = 0.07 + R() * 0.05; K.put(M.glass, cyl(0.014, 0.014, 0.18, 10, true), x, 0.1, 0); K.put(M.paint, cyl(0.012, 0.012, h, 10), x, 0.02 + h / 2, 0, 0, 0, 0, 1, 1, 1, [0x7a4a2a, 0xa8743a, 0xc8b89a, 0x5a3a22, 0x9a6a3a, 0xd8c8a0][i]); } });
  K.put(M.glass, cyl(0.014, 0.014, 0.18, 10, true), -0.85, BY + 0.016, -0.3, 0, 0.6, Math.PI / 2);
  // balance scales with pills on a pan
  scales(K, 0.95, BY, -0.55, -0.1, 1.15); pillsIM(root, heapPts(0.95 - 0.17, BY + 0.163, -0.55 + 0.017, 0.03, 0.012, 8, 41), 0.01, 41);
  // notebook open (front left) + quill + inkwell
  K.box(M.paint, -0.72, -0.18, BY, BY + 0.012, -0.42, -0.16, 0x4a2a24, 0.004, 1); K.put(M.book, plane(0.52, 0.25), -0.45, BY + 0.016, -0.29, -Math.PI / 2, 0, 0);
  K.put(M.ink, cyl(0.026, 0.03, 0.045, 10), -0.1, BY + 0.0225, -0.85); K.beam(M.ceramic, [-0.1, BY + 0.04, -0.85], [-0.2, BY + 0.24, -0.78], 0.007, 0xf4f0e8, true, 4);
  // the two pill boxes (opened), whole pills spilled
  pillBox(K, 0.42, BY, -0.32, 0.4, 1.15, 'miles', true); pillBox(K, 0.62, BY, -0.25, -0.3, 1.15, 'phelps', true);
  K.put(M.paint, cyl(0.06, 0.06, 0.02, 20), 0.52, BY + 0.01, -0.45, 0.5, 0, 0.1, 1, 1, 1, 0xb02a22); K.put(M.lidM, disc(0.06, 24), 0.52, BY + 0.025, -0.45, -Math.PI / 2 + 0.5, 0, 0.1);
  pillsIM(root, [...heapPts(0.42, BY + 0.005, -0.32, 0.035, 0.015, 14, 42, 0.01), ...Array.from({ length: 9 }, () => [0.25 + R() * 0.5, BY + 0.01, -0.2 + R() * 0.08])], 0.01, 42);
  // bottles of both brands (back of bench)
  for (let i = 0; i < 3; i++) bottle(K, 0.1 + i * 0.12, BY, -0.92, (R() - 0.5) * 0.4, 1.05, i === 1 ? 'phelps' : 'miles', i === 1 ? 0x2a4a3a : 0x6a2a0e);
  // mortar
  K.put(M.stone, lathe('mort', [[0, 0], [0.11, 0], [0.13, 0.03], [0.14, 0.1], [0.13, 0.15], [0.115, 0.155], [0.1, 0.1], [0.06, 0.05], [0, 0.045]], 22), 1.65, BY, -0.6, 0, 0, 0, 0.8, 0.8, 0.8, 0xc8c0b4);
  // chair
  K.at(-1.0, 0, 0.25, 0.5, () => { K.box(M.wood, -0.22, 0.22, 0.46, 0.5, -0.2, 0.2, 0x4a2e22, 0.01, 1); for (const x of [-0.19, 0.19]) for (const z of [-0.17, 0.17]) K.box(M.wood, x - 0.02, x + 0.02, 0, 0.46, z - 0.02, z + 0.02, 0x3a2418, 0.005, 1); for (const x of [-0.19, 0.19]) K.box(M.wood, x - 0.02, x + 0.02, 0.5, 1.0, 0.17, 0.21, 0x3a2418, 0.005, 1); K.box(M.wood, -0.2, 0.2, 0.82, 0.96, 0.17, 0.21, 0x4a2e22, 0.005, 1); });
  // verdict card (bench version): floats above the dish
  const cardB = mesh(root, plane(0.16, 0.2), M.verdict, DX + 0.02, BY + 0.33, DZ + 0.12, -0.2, 0, 0.08, false);
  // ======== MACRO STAGE (giant halved pill on a giant dish); local offset MAC
  const MX = MAC[0], MZ = MAC[2], S = 1.0; // pill radius 1.0 m
  const mk = new Kit();
  mk.put(M.porcelain, lathe('gdish', [[0, 0], [5, 0], [7.5, 0.35], [8.5, 0.8], [8.7, 0.9], [7.6, 0.55], [0, 0.3]], 64), MX, -0.3, MZ, 0, 0, 0, 1, 1, 1, 0xf4f4fa);
  mk.put(M.porcelain, tor(8.2, 0.07, 6, 90), MX, 0.62, MZ, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a5aa0);
  // half 1: cut face up toward camera, tilted; half 2: dome up, behind right
  mk.put(M.pillSkin, hemi(S, 40, 16), MX - 0.6, 0.0 + 0.62, MZ + 0.2, Math.PI + 0.55, 0.2, 0, 1, 1, 1);
  mk.put(M.pillCut, disc(S * 0.995, 64), MX - 0.6, 0.95, MZ + 0.2, -Math.PI / 2 + 0.55, 0.2, 0);
  mk.put(M.pillSkin, hemi(S, 40, 16), MX + 1.35, -0.06, MZ - 0.7, -0.15, 0.6, 0.1);
  for (let i = 0; i < 26; i++) { const a = R() * TAU, d = 1.3 + R() * 2.4, s = 0.04 + R() * 0.12; mk.put(M.paint, lumpGeo(i % 7, 1), MX + Math.cos(a) * d, 0.3 + s * 0.5, MZ + Math.sin(a) * d * 0.7, R() * 3, R() * 3, 0, s, s * 0.7, s, [0x6a4228, 0x5e3a22, 0x7a4c2c][i % 3]); }
  // big blade of the spatula in the macro + far blurred bench clutter: candle + bottles
  mk.box(M.metal, MX + 2.2, MX + 6, 0.32, 0.4, MZ + 1.0, MZ + 1.5, 0xc8c8d8, 0.02, 1);
  for (let i = 0; i < 4; i++) bottle(mk, MX - 6 + i * 2.6, -0.3, MZ - 9 - (i % 2) * 2, 0, 10, i === 2 ? 'phelps' : 'miles', i === 2 ? 0x2a4a3a : 0x6a2a0e);
  mk.put(M.wood, plane(80, 40), MX, -0.31, MZ, -Math.PI / 2, 0, 0, 1, 1, 1, 0x5a3624); // bench top (giant)
  mk.put(M.wall, plane(80, 30), MX, 10, MZ - 22, 0, 0, 0, 1, 1, 1, 0x8a7a8a);
  mk.build(root);
  const macroGlows = [glowAt(root, M.glow, MX - 5.5, 4.5, MZ - 12, 9), glowAt(root, M.glowB, MX + 7, 6, MZ - 15, 14), glowAt(root, M.glow, MX + 4, 2.5, MZ - 8, 4)];
  const cardM = mesh(root, plane(1.6, 2.0), M.verdict, MX + 0.2, 2.9, MZ + 0.4, -0.05, -0.05, 0.06, false);
  K.build(root);
  const glows = [glowAt(root, M.glow, candleW[0], candleW[1] + 0.01, candleW[2] + 0.02, 0.45), glowAt(root, M.glow, lampW[0], lampW[1] - 0.02, lampW[2] + 0.02, 0.55), glowAt(root, M.glowB, -1.45, BY + 0.11, -0.73, 0.22)];
  return { cardB, cardM, glows, macroGlows, shafts, candleW, lampW, BY, DX, DZ, MG, lens, magG };
}

// ---------------------------------------------------------------- per-set light / grade / practicals
const SET_LIGHT = {
  workshop: { top: '#000000', hor: '#2e1e14', fog: '#2a1a12', fogN: 9, fogF: 40, sky: '#e8c8b0', ground: '#3a2a4a', hemiI: 0.8, fillCol: '#6a70f0', fillI: 0.6, sunCol: '#ffc888', sunI: 0.8, az: -35, el: 38, disc: '#000000', clouds: false, shadow: false, stars: 0, cardTint: '#fff0dc', fxTint: '#ffffff', shafts: 0 },
  press: { top: '#000000', hor: '#3a2a1e', fog: '#3a2a20', fogN: 12, fogF: 50, sky: '#ffe8c8', ground: '#6a4a36', hemiI: 1.15, fillCol: '#8a90e0', fillI: 0.35, sunCol: '#ffd8a0', sunI: 2.0, az: -75, el: 34, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff2e2', fxTint: '#ffffff', shafts: 0 },
  lab: { top: '#000000', hor: '#141238', fog: '#120f30', fogN: 8, fogF: 45, sky: '#6a6ad8', ground: '#1a1430', hemiI: 0.62, fillCol: '#6a6aff', fillI: 0.45, sunCol: '#9aa4ff', sunI: 1.1, az: 25, el: 40, disc: '#000000', clouds: false, shadow: false, stars: 0, cardTint: '#e8e4ff', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  workshop: { look: 'office', over: { exp: 1.22, con: 1.3, sat: 1.06, lift: [0.035, 0.025, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc070', 0.14], bloom: [0.45, 0.72], hal: [0.32, '#ff9a40'], vig: [0.36, 0.44, '#24141e'] } },
  press: { look: 'office', over: { exp: 1.18, con: 1.26, sat: 1.04, lift: [0.03, 0.03, 0.045], tS: ['#3a3a7a', 0.16], tH: ['#ffd090', 0.1], bloom: [0.45, 0.78], hal: [0.24, '#ffb060'], vig: [0.32, 0.48, '#2a1a24'] } },
  lab: { look: 'night', over: { exp: 1.3, con: 1.28, sat: 1.08, lift: [0.03, 0.025, 0.06], tS: ['#2a2a8a', 0.24], tH: ['#ffc880', 0.12], bloom: [0.45, 0.66], hal: [0.36, '#ff9a50'], vig: [0.38, 0.42, '#0a0820'] } },
};
const SET_PRACT = {
  workshop: [{ at: 'lampW', col: '#ffb060', I: 3.4, d: 4.5 }, { at: 'lampC', col: '#ffb060', I: 2.8, d: 4 }, { p: [2.15, 1.5, -2.6], col: '#ff5a3a', I: 1.0, d: 2.5 }, { p: [-3.6, 0.5, -2.0], col: '#ff8a40', I: 1.2, d: 3 }],
  press: [{ p: [1.2, 1.2, -2.3], col: '#ffc070', I: 1.6, d: 4 }, { p: [-4.6, 2.0, -0.7], col: '#fff0d0', I: 2.2, d: 7 }, { p: [4.8, 2.0, -3.0], col: '#ffb868', I: 1.4, d: 5 }, { p: [0, 2.6, 0.5], col: '#ffe0b8', I: 1.0, d: 7 }],
  lab: [{ at: 'candle', col: '#ffa850', I: 1.7, d: 3.0 }, { at: 'lamp', col: '#ffb060', I: 1.5, d: 3.5 }, { p: [-0.7, 2.4, -2.6], col: '#8a90ff', I: 2.4, d: 6 }, { p: [MAC[0] - 1, 4, MAC[2] + 2], col: '#ffb070', I: 9, d: 14 }],
};

export function buildPills(ctx) {
  ({ THREE, toon, mkTex, PT } = ctx); NOND = ctx.NOND || null; CAM = ctx.camera || null;
  M = materials();
  const groups = {};
  for (const name of SETS) { const g = new THREE.Group(); g.name = 'kch_' + name; g.position.set(...O[name]); g.visible = false; ctx.scene.add(g); groups[name] = g; }
  const ws = buildWorkshop(groups.workshop), pr = buildPress(groups.press), lb = buildLab(groups.lab);
  for (const k in groups) groups[k].traverse((o) => { if (o.isMesh && (o.material === M.glass || o.material === M.chimney || o.material === M.lens)) nond(o); });
  const spots = {
    // workshop (floor 0): bench top 0.92 at z -1.05..-0.2; stand behind the bench at z -1.3 or in front at z 0.15
    workbenchFront: W3('workshop', [0.0, 0, 0.2]), behindBench: W3('workshop', [0.0, 0, -1.45]), pillMachine: W3('workshop', [0.05, ws.BY, -0.58]), mortar: W3('workshop', [-1.3, ws.BY, -0.55]),
    cashBox: W3('workshop', [ws.BXc, ws.CY, ws.BZc]), cashDesk: W3('workshop', [ws.CX, 0, ws.CZ + 0.75]), tomatoCrate: W3('workshop', [ws.TC[0], 0, ws.TC[1]]), pillTub: W3('workshop', [-0.6, 0, 1.0]), shelves: W3('workshop', [-1.2, 0, -2.6]), window: W3('workshop', [2.15, 0, -2.6]),
    // press (floor 0): poster wall z -3.4, divider post at x 0
    posterWall: W3('press', [0, 0, -3.4]), wallMiles: W3('press', [-2.4, 0, -2.4]), wallPhelps: W3('press', [2.4, 0, -2.4]), handPress: W3('press', [-1.35, 0, 0.3]), pressman: W3('press', [-0.75, 0, 1.15]), typeCase: W3('press', [2.9, 0, -0.8]), pressFloor: W3('press', [0, 0, 1.2]),
    // lab (floor 0): bench top 0.9, dish at (0, 0.9, -0.5); chemist sits/stands at z 0.3
    chemist: W3('lab', [0.0, 0, 0.3]), dish: W3('lab', [lb.DX, lb.BY, lb.DZ]), magnifier: W3('lab', [lb.MG.x, lb.MG.y, lb.MG.z]), candle: W3('lab', lb.candleW), macroPill: W3('lab', [MAC[0] - 0.6, 0.95, MAC[2] + 0.2]),
  };
  const V = (set, p, l, fov, cInf, fp, extra = {}) => { const c = { set, p: W3(set, p), l: W3(set, l), fov, cInf, fp: fp ? W3(set, fp) : null, ...extra }; c.focus = Math.hypot(...[0, 1, 2].map((i) => c.p[i] - (c.fp || c.l)[i])); return c; };
  const B = ws.BY, mx = MAC[0];
  const views = [
    V('workshop', [0.55, 1.55, 2.9], [-0.15, 1.2, -1.4], 60, 2.2, [0, 1.0, -0.6], { cash: 0.6 }), // 0 workshop wide
    V('workshop', [0.12, B + 0.95, 0.55], [0.05, B + 0.04, -0.6], 42, 5, [0.05, B + 0.08, -0.6], { cash: 0.6 }), // 1 pill machine close (rolling)
    V('workshop', [2.05, 1.62, 0.55], [ws.BXc + 0.12, ws.CY + 0.05, ws.BZc + 0.05], 40, 5, [ws.BXc, ws.CY + 0.08, ws.BZc], { cash: 1 }), // 2 cash box + coin stacks
    V('workshop', [2.75, 0.85, -1.15], [ws.TC[0], 0.42, ws.TC[1]], 44, 5, [ws.TC[0], 0.45, ws.TC[1]], { cash: 0.6 }), // 3 tomato crate gag (cobweb)
    V('workshop', [-0.85, 1.75, -1.0], [-1.5, 1.72, -3.2], 44, 4, [-1.5, 1.6, -3.0], { cash: 0.6 }), // 4 labelled bottles on the shelf
    V('workshop', [0.1, 1.38, 0.85], [0.0, B + 0.12, -0.65], 46, 3.5, [0.0, B + 0.1, -0.6], { cash: 0.6 }), // 5 bench medium (machine, mortar, heaps, lamp)
    V('press', [1.5, 1.6, 3.4], [-0.6, 1.5, -1.6], 58, 2.2, [-1.3, 1.3, 0.3], { ads: 0.65 }), // 6 press wide
    V('press', [0, 1.8, 0.3], [0, 1.85, -3.4], 64, 2.5, [0, 1.8, -3.3], { ads: 1 }), // 7 poster wall straight-on split (Miles left | Phelps right)
    V('press', [-2.3, 1.85, -1.2], [-2.3, 1.85, -3.4], 50, 3, [-2.3, 1.85, -3.3], { ads: 1 }), // 8 Miles side (for split screen)
    V('press', [2.3, 1.85, -1.2], [2.3, 1.85, -3.4], 50, 3, [2.3, 1.85, -3.3], { ads: 1 }), // 9 Phelps side (for split screen)
    V('press', [0.75, 1.55, 2.9], [-1.3, 1.25, 0.3], 46, 3.5, [-1.3, 1.2, 0.3], { ads: 0.5 }), // 10 hand press medium
    V('press', [1.6, 0.9, 3.3], [0.6, 2.4, -1.0], 52, 2.5, [0.8, 2.5, 0.9], { ads: 0.8 }), // 11 low: drying sheets + wall
    V('lab', [0.3, 1.45, 1.55], [-0.2, 1.15, -0.9], 56, 2.2, [0, 1.0, -0.5]), // 12 lab wide (night window)
    V('lab', [0.06, 1.25, 0.55], [0.02, 0.98, -0.5], 40, 5, [0.0, 0.95, -0.5], { mag: true }), // 13 bench medium: magnifier over the dish, candle, notebook
    V('lab', [mx + 0.5, 4.4, 7.6], [mx + 0.15, 1.1, 0], 40, 4, [mx - 0.6, 0.95, 0.2], { verdict: 0 }), // 14 MACRO halved pill (plain brown filling)
    V('lab', [mx + 0.5, 4.4, 7.6], [mx + 0.15, 1.7, 0], 40, 4, [mx - 0.6, 0.95, 0.2], { verdict: 1 }), // 15 macro + NO TOMATO card
    V('lab', [-0.25, 1.4, 0.5], [-0.5, 0.98, -0.55], 44, 5, [-0.5, 1.0, -0.5]), // 16 candle + notebook close
    V('press', [0, 1.8, 0.3], [0, 1.85, -3.4], 64, 2.5, [0, 1.8, -3.3], { ads: 0.08 }), // 17 = view 7 at the start of the ad war
    V('lab', [0.06, 1.25, 0.55], [0.02, 1.0, -0.5], 40, 5, [0.0, 0.95, -0.5], { verdict: 1, mag: true }), // 18 bench close + small card over the dish
    V('workshop', [0.42, 1.5, 0.12], [0.05, B + 0.02, -0.42], 40, 6, [0.05, B + 0.07, -0.35], { cash: 0.6 }), // 19 pill tray close: pills tumbling out
  ];
  let FRAME = 0, CUR = null, ADS = 0.5, CASH = 0.5, VERDICT = 0, ROLL = 1, VF0 = null;
  const camq = new THREE.Quaternion(), m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), v4 = new THREE.Vector3(), s4 = new THREE.Vector3();
  const API = {
    groups, origin: O, spots, views, sets: SETS,
    // workshop: cash(t 0..1) grows the coin stacks; roll(on|speed) runs the pill machine (default 1)
    cash(t) { CASH = clamp01(t); ws.coins.count = Math.max(0, Math.round(ws.coinN * CASH)); },
    roll(s = 1) { ROLL = +s; },
    // press: ads(t 0..1) posters pile up (t=0: two, t=1: ~78, overlapping, crossing the centre line)
    ads(t) { ADS = clamp01(t); const n = Math.round(2 + ADS * (pr.N - 2)); pr.posters.forEach((p) => { p.visible = p.userData.i < n; }); },
    // lab: verdict(t) pops the "NO TOMATO" card in (0 hidden .. 1 shown, overshoot pop in between); verdictAt(f0) animates from frame f0
    verdict(t) { VERDICT = t; VF0 = null; },
    verdictAt(f0) { VF0 = f0; },
    // lab: magnify(on, camPos world) fakes the lens: a 2.2x copy of the halved pill sits in the lens along the camera ray (only for views looking through the ring)
    magnify(on, camP) { lb.magG.visible = !!on; if (!on || !camP) return; const o = groups.lab.position, c = new THREE.Vector3(camP[0] - o.x, camP[1] - o.y, camP[2] - o.z), P = new THREE.Vector3(lb.DX, lb.BY + 0.03, lb.DZ), C = new THREE.Vector3(lb.MG.x, lb.MG.y, lb.MG.z);
      const d = P.clone().sub(c), L = d.length(); d.normalize(); const tq = C.clone().sub(c).dot(d) + 0.012, Q = c.clone().addScaledVector(d, tq); lb.magG.position.copy(Q); lb.magG.scale.setScalar(1.75 * tq / L); },
    tick(f) { FRAME = f;
      if (CUR === 'workshop' || CUR == null) {
        const ph = f * 0.12 * ROLL, x = Math.sin(ph) * 0.2; ws.cutter.position.x = x; ws.cutter.rotation.z = Math.cos(ph) * 0.03 * ROLL;
        // pills ahead of the cutter: rolled out of the grooves, tumbling toward the tray when the cutter moves right
        const u = (Math.sin(ph) + 1) / 2, go = Math.cos(ph) > 0;
        for (let i = 0; i < 12; i++) { const z = -0.15 + i * 0.027, k = ((ph / TAU + i * 0.083) % 1), px = ROLL ? -0.05 + k * 0.4 : 0.32, py = 0.075 + (px > 0.28 ? -0.012 * (px - 0.28) / 0.1 : 0) + Math.abs(Math.sin(k * 30)) * 0.004;
          m4.compose(v4.set(Math.min(px, 0.38), py, z), q4.setFromEuler(e4.set(k * 20, 0, -k * 30)), s4.set(1, 0.92, 1)); ws.rollers.setMatrixAt(i, m4); }
        ws.rollers.instanceMatrix.needsUpdate = true;
        ws.pestle.rotation.set(0.35 + Math.sin(f * 0.18) * 0.06, f * 0.18, 0.0, 'YXZ');
        ws.lamps.forEach((g, i) => { g.material.opacity = 0.55 + 0.05 * Math.sin(f * 0.31 + i * 2) + 0.03 * Math.sin(f * 0.83 + i); });
        ws.globes.forEach((g, i) => { g.material.opacity = 0.42 + 0.04 * Math.sin(f * 0.05 + i * 3); }); ws.ember.material.opacity = 0.45 + 0.1 * Math.sin(f * 0.23) + 0.05 * Math.sin(f * 0.71);
      }
      if (CUR === 'press' || CUR == null) {
        const c = (f % 90) / 90, pull = c < 0.35 ? smooth(c / 0.12) * (1 - smooth((c - 0.22) / 0.13)) : 0; pr.bar.rotation.y = -0.15 - pull * 0.9; pr.platen.position.y = 1.08 - pull * 0.08;
        pr.sheets.forEach((s) => { s.rotation.x = 0.05 * Math.sin(f * 0.05 + s.userData.ph); s.rotation.z = 0.02 * Math.sin(f * 0.037 + s.userData.ph * 1.3); });
        pr.shafts.forEach((s, i) => { s.material.opacity = 0.06 + 0.015 * Math.sin(f * 0.02 + i); }); pr.glows.forEach((g, i) => { g.material.opacity = 0.5 + 0.05 * Math.sin(f * 0.29 + i * 2); });
      }
      if (CUR === 'lab' || CUR == null) {
        lb.glows.forEach((g, i) => { g.material.opacity = (i === 2 ? 0.35 : 0.55) + 0.07 * Math.sin(f * 0.37 + i * 2) + 0.04 * Math.sin(f * 1.1 + i); g.scale.setScalar((i === 0 ? 0.45 : i === 1 ? 0.55 : 0.22) * (1 + 0.04 * Math.sin(f * 0.53 + i))); });
        lb.macroGlows.forEach((g, i) => { g.material.opacity = 0.45 + 0.06 * Math.sin(f * 0.21 + i * 2); });
        lb.shafts.forEach((s, i) => { s.material.opacity = 0.05 + 0.015 * Math.sin(f * 0.02 + i); });
        const t = VF0 == null ? VERDICT : clamp01((f - VF0) / 14), sc = t <= 0 ? 0 : t >= 1 ? 1 : backOut(t);
        for (const c of [lb.cardB, lb.cardM]) { c.visible = sc > 0.001; c.scale.setScalar(Math.max(0.001, sc)); }
        lb.cardM.rotation.z = 0.06 + (1 - Math.min(1, t)) * 0.4 + 0.015 * Math.sin(f * 0.07); lb.cardM.position.y = 2.9 + 0.03 * Math.sin(f * 0.06);
        lb.cardB.rotation.z = 0.08 + (1 - Math.min(1, t)) * 0.4;
      }
    },
    lightFor(name) { return { ...LIGHTS_[name === 'lab' ? 'explain' : 'office'], practI: 0, practKey: null, ...SET_LIGHT[name] }; },
    gradeFor: (name) => ({ ...((SET_GRADE[name] || {}).over || {}) }),
    lookFor: (name) => (SET_GRADE[name] || {}).look || 'office',
    show(world, name) { for (const k in groups) groups[k].visible = k === name; CUR = name || null;
      if (name) { for (const k of ['road', 'stadium', 'office', 'car', 'dc']) if (world[k]) world[k].visible = false; if (world.rooms) world.rooms.show(world, null); API.tick(FRAME); } },
    placeLights(PRACT, name) { const at = { lampW: ws.lampW, lampC: ws.lampC, candle: lb.candleW, lamp: lb.lampW };
      PRACT.forEach((l, i) => { const c = (SET_PRACT[name] || [])[i]; l.visible = true; if (!c) { l.intensity = 0; return; } l.position.set(...W3(name, c.at ? [at[c.at][0], at[c.at][1] + 0.05, at[c.at][2] + 0.12] : c.p)); l.color.set(c.col); l.intensity = c.I * (c.at === 'candle' ? 1 + 0.08 * Math.sin(FRAME * 0.37) : 1); l.distance = c.d; l.decay = c.decay ?? 1.6; }); API.face(name); },
    face(name = CUR) { const cam = CAM; if (!cam) return; camq.copy(cam.quaternion);
      const list = name === 'workshop' ? [...ws.lamps, ...ws.globes, ws.ember] : name === 'press' ? pr.glows : name === 'lab' ? [...lb.glows, ...lb.macroGlows] : [];
      list.forEach((g) => g.quaternion.copy(camq)); },
    // test-view helper (main.js ?plview=N; a: view = frame)
    viewFor(i, f = 0) { const k = ((i % views.length) + views.length) % views.length, c = views[k];
      return { i: k, mod: API, set: c.set, f, mag: c.mag, ads: c.ads, cash: c.cash, verdict: c.verdict, L: API.lightFor(c.set), look: API.lookFor(c.set), grade: API.gradeFor(c.set), cam: { p: c.p, l: c.l, fov: c.fov, focus: c.focus, cInf: c.cInf, roll: c.roll || 0, shadowAt: c.fp || c.l } }; },
    apply(world, v) { API.show(world, v.set); API.magnify(!!v.mag, v.cam && v.cam.p); if (v.ads != null) API.ads(v.ads); if (v.cash != null) API.cash(v.cash); if (v.verdict != null) API.verdict(v.verdict); API.tick(v.f ?? FRAME); },
  };
  API.view = API.viewFor; API.ads(0.5); API.cash(0.5); API.verdict(0); API.tick(0);
  return API;
}
