// reef.js [CASTRO-reef]: sets for "The CIA tried to make Castro's beard fall out" (Oddverra short).
//   beach      : a Caribbean cove, early 1960s: turquoise water, white sand, palms, a wooden rowboat, rocks, a diver's gear on the sand  origin (0,    0, 3200)
//   underwater : the reef below: blue-teal water, god-rays, coral, sea fans, fish schools, bubbles, and a GIANT painted conch (setShellGlow,
//                setBoard: comic "TOO IMPRACTICAL" board). No explosion, ever.                                                             origin (600,  0, 3200)
//   senate     : 1975 Senate committee hearing room: raised dais, "SENATOR" nameplates, invented emblem, mics, witness table, press area,
//                marble columns, green drapes, easel chart "AT LEAST 8 PLOTS" (setChart(t): tally marks 1..8)                              origin (1000, 0, 3200)
//   shoes      : dim shuttered 1960s office desk (teal + amber): black dress shoes on a white cloth, "THALLIUM SALTS" vial, powder brush,
//                manila folder stamped "OPERATION: BEARD", green banker's lamp, venetian blinds
//                (setDust(t): powder sparkle puffs into the shoes)                                                                       origin (1400, 0, 3200)
// Each set: local frame, ground / floor y = 0, camera side +z. All groups start hidden; show(world, name) displays one.
// Animated bits (fish, bubbles, caustics, sparkle) follow tick(f) (main.js calls it every frame).
import { Kit, rboxGeo } from './world.js';
import { LIGHTS_ } from './story.js';

let THREE, toon, mkTex, PT, NOND;
export const REEF_ORIGIN = { beach: [0, 0, 3200], underwater: [600, 0, 3200], senate: [1000, 0, 3200], shoes: [1400, 0, 3200] };
const O = REEF_ORIGIN, SETS = Object.keys(O);
const W3 = (name, p) => [p[0] + O[name][0], p[1] + O[name][1], p[2] + O[name][2]];
const INK = '#2b1d4a';

// ---------------------------------------------------------------- geometry helpers
const GC = new Map();
const cached = (k, mk) => { let g = GC.get(k); if (!g) GC.set(k, (g = mk())); return g; };
const cyl = (rt, rb, h, rs = 12, open = false, t0 = 0, tl = Math.PI * 2) => cached(`c${rt}|${rb}|${h}|${rs}|${open}|${t0}|${tl}`, () => new THREE.CylinderGeometry(rt, rb, h, rs, 1, open, t0, tl));
const sph = (r, ws = 14, hs = 10, p0 = 0, pl = Math.PI * 2, t0 = 0, tl = Math.PI) => cached(`s${r}|${ws}|${hs}|${p0}|${pl}|${t0}|${tl}`, () => new THREE.SphereGeometry(r, ws, hs, p0, pl, t0, tl));
const tor = (r, t, rs = 6, ts = 24, arc = Math.PI * 2) => cached(`t${r}|${t}|${rs}|${ts}|${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));
const cone = (r, h, rs = 8) => cached(`k${r}|${h}|${rs}`, () => new THREE.ConeGeometry(r, h, rs));
const capsule = (r, l, a = 4, b = 10) => cached(`cap${r}|${l}|${a}|${b}`, () => new THREE.CapsuleGeometry(r, l, a, b));
const plane = (w, h) => cached(`p${w}|${h}`, () => new THREE.PlaneGeometry(w, h));
const lathe = (key, pts, n = 24) => cached('la' + key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n));
const mesh = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz, 'YXZ'); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
// faceted rock: icosahedron with jitter hashed on position (shared corners stay shared)
const rockGeo = (seed) => cached('rock' + seed, () => { const g = new THREE.IcosahedronGeometry(1, 1), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed * 4.1) * 43758.5453, k = 0.78 + 0.4 * (h - Math.floor(h)); p.setXYZ(i, x * k, y * k * 0.8, z * k); }
  g.computeVertexNormals(); return g; });
// palm frond: a strip along +z, drooping (parabola) with a shallow V fold; uv v = along the frond
const frondGeo = (w, L, droop) => cached(`fr${w}|${L}|${droop}`, () => { const g = new THREE.PlaneGeometry(w, L, 2, 10), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), t = (p.getY(i) + L / 2) / L; p.setXYZ(i, x * (1 - 0.6 * t * t), -droop * t * t * L - Math.abs(x) * 0.35, t * L); }
  g.computeVertexNormals(); return g; });
// pleated drape: plane hanging from y = h (top) to 0, folds along x
const drapeGeo = (w, h, n = 7, amp = 0.09) => cached(`dr${w}|${h}|${n}|${amp}`, () => { const g = new THREE.PlaneGeometry(w, h, n * 6, 2); g.translate(0, h / 2, 0); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, amp * Math.sin((x / w + 0.5) * n * Math.PI * 2)); } g.computeVertexNormals(); return g; });
// rolling sand bottom
const dunes = (w, d, seg, amp, seed) => cached(`du${w}|${d}|${amp}|${seed}`, () => { const g = new THREE.PlaneGeometry(w, d, seg, seg); g.rotateX(-Math.PI / 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, amp * (Math.sin(x * 0.21 + seed) * Math.cos(z * 0.17 - seed) + 0.5 * Math.sin(x * 0.53 + z * 0.41 + seed * 2)) * Math.min(1, Math.hypot(x, z) / 8)); }
  g.computeVertexNormals(); return g; });

// ---------------------------------------------------------------- painters (calm fills + darker indigo-leaning marks)
const css = (...a) => PT.css(...a), shade = (...a) => PT.shade(...a), tint = (...a) => PT.tint(...a), vary = (...a) => PT.vary(...a), rng = (...a) => PT.rng(...a), fbm = (...a) => PT.fbm(...a), modulate = (...a) => PT.modulate(...a), hex = (...a) => PT.hex(...a);
const SERIF = '"DejaVu Serif", Georgia, serif', SANS = '"DejaVu Sans", Arial, sans-serif';
function txt(g, s, cx, cy, maxW, sz, o = {}) {
  g.save(); g.font = `${o.italic ? 'italic ' : ''}${o.bold === false ? '' : 'bold '}${sz | 0}px ${o.font || SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const tw = g.measureText(s).width, sx = Math.min(1, maxW / tw); g.translate(cx, cy); if (o.rot) g.rotate(o.rot); g.scale(sx, 1);
  if (o.sh) { g.fillStyle = o.sh; g.fillText(s, sz * 0.05, sz * 0.06); } if (o.stroke) { g.lineWidth = o.lw || sz * 0.12; g.strokeStyle = o.stroke; g.lineJoin = 'round'; g.strokeText(s, 0, 0); }
  g.fillStyle = o.col || INK; g.fillText(s, 0, 0); g.restore();
}
function sandTex(g, w, h, o = {}) {
  const base = hex(o.base || '#eed9b0'), R = rng(o.seed || 11); g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) { const c = vary(base, (R() - 0.55) * 0.3); g.fillStyle = css(c, 0.55); g.fillRect(R() * w, R() * h, 1.5 + R() * 2, 1.5 + R() * 2); }
  g.strokeStyle = css(shade(base, 0.86), 0.35); g.lineWidth = 2; for (let k = 0; k < 18; k++) { const y0 = R() * h; g.beginPath(); for (let x = 0; x <= w; x += 16) g.lineTo(x, y0 + Math.sin(x * 0.03 + k) * 6); g.stroke(); }
  modulate(g, w, h, (u, v) => 0.92 + 0.14 * fbm(u, v, 3, 3, 3, o.seed || 11));
}
// shallow-to-deep turquoise, along v (v = 0 far, 1 at the shore)
function seaTex(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h); [[0, '#1c4f9a'], [0.35, '#1f72b8'], [0.62, '#1aa6c4'], [0.8, '#27c8c8'], [0.92, '#6fe2d2'], [1, '#c8f4e4']].forEach(([s, c]) => gr.addColorStop(s, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const R = rng(5); // patchy reef shadows in the shallows + glints
  for (let i = 0; i < 70; i++) { const y = h * (0.62 + R() * 0.3); g.fillStyle = `rgba(30,70,120,${0.12 + R() * 0.12})`; g.beginPath(); g.ellipse(R() * w, y, 30 + R() * 90, 6 + R() * 14, 0, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineCap = 'round'; for (let i = 0; i < 520; i++) { const y = R() * h, k = y / h, x = R() * w, L = 6 + k * 30; g.lineWidth = 1 + k * 3; g.globalAlpha = 0.25 + 0.5 * R(); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L / 2, y - 2 - k * 3, x + L, y); g.stroke(); }
  g.globalAlpha = 1;
}
function foamTex(g, w, h) { g.clearRect(0, 0, w, h); const R = rng(9); g.fillStyle = '#ffffff';
  g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * 0.45 + Math.sin(x * 0.05) * h * 0.12 + Math.sin(x * 0.013) * h * 0.15); g.lineTo(w, h); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 200; i++) { g.beginPath(); g.ellipse(R() * w, h * (0.2 + R() * 0.3), 3 + R() * 10, 2 + R() * 4, 0, 0, 7); g.fill(); } }
function leafTex(g, w, h, o = {}) { // pinnate palm leaf, rib along v
  g.clearRect(0, 0, w, h); const c = hex(o.c || '#3f9a48'), d = shade(c, 0.7), R = rng(o.seed || 3);
  for (let y = 8; y < h - 4; y += 7) { const t = y / h, L = w * 0.5 * Math.sin(Math.PI * Math.min(1, t * 1.15)) * (0.85 + R() * 0.2); for (const s of [-1, 1]) { g.strokeStyle = css(R() < 0.5 ? c : vary(c, 0.12)); g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(w / 2, y); g.quadraticCurveTo(w / 2 + s * L * 0.6, y - 4, w / 2 + s * L, y + 10 + t * 8); g.stroke(); g.strokeStyle = css(d, 0.6); g.lineWidth = 1.2; g.stroke(); } }
  g.strokeStyle = css(shade(c, 0.6)); g.lineWidth = 5; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
}
function stripesTex(g, w, h, cols, n = 8) { for (let i = 0; i < n; i++) { g.fillStyle = cols[i % cols.length]; g.fillRect(i * w / n, 0, w / n + 1, h); } modulate(g, w, h, (u, v) => 0.94 + 0.08 * fbm(u, v, 3, 3, 3, 4)); }
// underwater sand with baked caustic net (bright cells)
function reefSandTex(g, w, h) {
  sandTex(g, w, h, { base: '#e8dcb8', seed: 21 }); const R = rng(41); g.strokeStyle = 'rgba(255,255,240,0.5)'; g.lineWidth = 3; g.lineJoin = 'round';
  const pts = []; for (let i = 0; i < 90; i++) pts.push([R() * w, R() * h]);
  for (const [x, y] of pts) { g.beginPath(); const n = 6; for (let k = 0; k <= n; k++) { const a = k / n * Math.PI * 2 + x, r = 22 + 12 * Math.sin(a * 3 + y); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.stroke(); }
  g.strokeStyle = 'rgba(120,110,150,0.25)'; g.lineWidth = 2; for (let k = 0; k < 20; k++) { const y0 = R() * h; g.beginPath(); for (let x = 0; x <= w; x += 12) g.lineTo(x, y0 + Math.sin(x * 0.05 + k) * 5); g.stroke(); }
}
function fanTex(g, w, h, o = {}) { // gorgonian sea fan lattice
  g.clearRect(0, 0, w, h); const c = o.c || '#b04aa8', R = rng(o.seed || 7); g.strokeStyle = c; g.lineCap = 'round';
  const br = (x, y, a, L, wd, d) => { if (d > 6 || L < 6) return; const x2 = x + Math.cos(a) * L, y2 = y + Math.sin(a) * L; g.lineWidth = wd; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); br(x2, y2, a - 0.35 - R() * 0.2, L * 0.8, wd * 0.75, d + 1); br(x2, y2, a + 0.35 + R() * 0.2, L * 0.8, wd * 0.75, d + 1); };
  br(w / 2, h, -Math.PI / 2, h * 0.2, 14, 0); g.lineWidth = 2; g.globalAlpha = 0.8;
  for (let i = 0; i < 260; i++) { const a = -Math.PI * (0.1 + R() * 0.8), r = h * (0.15 + R() * 0.8), x = w / 2 + Math.cos(a) * r * 0.55, y = h + Math.sin(a) * r * 0.95; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 40, y + (R() - 0.5) * 40); g.stroke(); }
  g.globalAlpha = 1;
}
function brainTex(g, w, h) { g.fillStyle = '#c8b070'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a6a4a'; g.lineWidth = 4; const R = rng(13);
  for (let k = 0; k < 40; k++) { let x = R() * w, y = R() * h, a = R() * 6; g.beginPath(); g.moveTo(x, y); for (let i = 0; i < 40; i++) { a += (R() - 0.5) * 1.2; x += Math.cos(a) * 8; y += Math.sin(a) * 8; g.lineTo(x, y); } g.stroke(); } }
// the conch: bold stripes along v + polka dots, deliberately loud
function shellTex(g, w, h) {
  const cols = ['#ff6fae', '#ffa13a', '#ffe14a', '#ff6fae', '#ff8a3a', '#fff0a0'], n = 12;
  for (let i = 0; i < n; i++) { g.fillStyle = cols[i % cols.length]; g.fillRect(0, i * h / n, w, h / n + 1); g.fillStyle = 'rgba(43,29,74,0.5)'; g.fillRect(0, (i + 1) * h / n - 3, w, 3); }
  const R = rng(77); for (let j = 0; j < 14; j++) for (let i = 0; i < 16; i++) { const x = (i + (j % 2) * 0.5) * w / 16, y = (j + 0.5) * h / 14, r = 9 + R() * 6;
    g.fillStyle = ['#ffffff', '#3ac8e8', '#7a3ad8', '#ffffff', '#3ae08a'][(i + j * 3) % 5]; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = 'rgba(43,29,74,0.55)'; g.lineWidth = 2; g.stroke(); }
}
function lipTex(g, w, h) { const gr = g.createRadialGradient(w * 0.3, h / 2, 10, w * 0.3, h / 2, w * 0.8); gr.addColorStop(0, '#c83a78'); gr.addColorStop(0.5, '#ff8ab8'); gr.addColorStop(1, '#ffd0d8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(160,40,90,0.35)'; g.lineWidth = 3; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, i * h / 11); g.stroke(); } }
function boardTex(g, w, h) {
  PT.planks(g, w, h, { base: '#c8a070', n: 3, seed: 7 }); g.fillStyle = 'rgba(255,248,230,0.82)'; g.fillRect(w * 0.04, h * 0.08, w * 0.92, h * 0.84);
  txt(g, 'TOO', w / 2, h * 0.3, w * 0.8, h * 0.3, { col: '#d8282e', font: SANS, stroke: '#ffffff', lw: 10, sh: 'rgba(43,29,74,0.6)' });
  txt(g, 'IMPRACTICAL', w / 2, h * 0.64, w * 0.86, h * 0.32, { col: '#d8282e', font: SANS, stroke: '#ffffff', lw: 10, sh: 'rgba(43,29,74,0.6)' });
  g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(w * 0.04, h * 0.08, w * 0.92, h * 0.84);
  for (const [x, y] of [[0.09, 0.2], [0.91, 0.2], [0.09, 0.8], [0.91, 0.8]]) { g.fillStyle = '#6a6a7a'; g.beginPath(); g.arc(x * w, y * h, 7, 0, 7); g.fill(); }
}
// senate
function marbleTex(g, w, h, o = {}) { const base = hex(o.base || '#ece4d6'); g.fillStyle = css(base); g.fillRect(0, 0, w, h); const R = rng(o.seed || 17);
  modulate(g, w, h, (u, v) => 0.93 + 0.1 * fbm(u, v, 3, 3, 4, o.seed || 17)); g.strokeStyle = css(shade(base, 0.72), 0.45); g.lineWidth = 1.5;
  for (let k = 0; k < 14; k++) { let x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); for (let i = 0; i < 30; i++) { x += (R() - 0.3) * 18; y += (R() - 0.5) * 22; g.lineTo(x, y); } g.stroke(); } }
function drapeTex(g, w, h) { g.fillStyle = '#2f6a4a'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += w / 10) { const gr = g.createLinearGradient(x, 0, x + w / 10, 0); gr.addColorStop(0, 'rgba(10,30,30,0.45)'); gr.addColorStop(0.5, 'rgba(120,200,150,0.18)'); gr.addColorStop(1, 'rgba(10,30,30,0.45)'); g.fillStyle = gr; g.fillRect(x, 0, w / 10, h); }
  g.fillStyle = '#d8b860'; g.fillRect(0, h - 18, w, 10); }
function nameplateTex(g, w, h, s) { g.fillStyle = '#f2ead6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a5a30'; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); txt(g, s, w / 2, h * 0.54, w * 0.85, h * 0.56, { col: '#1e1a30' }); }
function emblemTex(g, w, h) {
  const c = w / 2; g.clearRect(0, 0, w, h); g.fillStyle = '#d8b050'; g.beginPath(); g.arc(c, c, c * 0.98, 0, 7); g.fill(); g.fillStyle = '#1f2f6a'; g.beginPath(); g.arc(c, c, c * 0.86, 0, 7); g.fill();
  g.strokeStyle = '#f0d890'; g.lineWidth = 4; g.beginPath(); g.arc(c, c, c * 0.62, 0, 7); g.stroke();
  g.save(); g.font = `bold ${c * 0.13 | 0}px ${SERIF}`; g.fillStyle = '#f4e4b0'; g.textAlign = 'center'; g.textBaseline = 'middle'; const s = 'SELECT COMMITTEE ★ INQUIRY ★', n = s.length;
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 - 1.75 + i / (n - 1) * 3.5; g.save(); g.translate(c + Math.cos(a) * c * 0.74, c + Math.sin(a) * c * 0.74); g.rotate(a + Math.PI / 2); g.fillText(s[i], 0, 0); g.restore(); } g.restore();
  // centre: an open ledger with a quill and a lamp of inquiry (invented)
  g.fillStyle = '#f4ecd6'; g.beginPath(); g.moveTo(c, c + c * 0.18); g.quadraticCurveTo(c - c * 0.25, c + c * 0.05, c - c * 0.42, c + c * 0.12); g.lineTo(c - c * 0.42, c + c * 0.36); g.quadraticCurveTo(c - c * 0.22, c + c * 0.3, c, c + c * 0.4); g.quadraticCurveTo(c + c * 0.22, c + c * 0.3, c + c * 0.42, c + c * 0.36); g.lineTo(c + c * 0.42, c + c * 0.12); g.quadraticCurveTo(c + c * 0.25, c + c * 0.05, c, c + c * 0.18); g.fill();
  g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); g.beginPath(); g.moveTo(c, c + c * 0.18); g.lineTo(c, c + c * 0.4); g.stroke();
  g.fillStyle = '#d8b050'; g.beginPath(); g.ellipse(c, c - c * 0.05, c * 0.16, c * 0.06, 0, 0, 7); g.fill(); g.fillRect(c - c * 0.03, c - c * 0.05, c * 0.06, c * 0.2);
  g.fillStyle = '#ffb040'; g.beginPath(); g.moveTo(c - c * 0.06, c - c * 0.1); g.quadraticCurveTo(c, c - c * 0.45, c + c * 0.06, c - c * 0.1); g.fill();
  for (let i = 0; i < 13; i++) { const a = -Math.PI / 2 + (i - 6) * 0.24; g.fillStyle = '#ffffff'; star(g, c + Math.cos(a) * c * 0.5, c + Math.sin(a) * c * 0.5 + c * 0.05, c * 0.035); }
}
function star(g, x, y, r) { g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); }
function flagTex(g, w, h) { for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#f4f0e8' : '#c8323a'; g.fillRect(0, i * h / 13, w, h / 13 + 1); } g.fillStyle = '#2a3a7a'; g.fillRect(0, 0, w * 0.4, h * 7 / 13); g.fillStyle = '#ffffff'; for (let j = 0; j < 9; j++) for (let i = 0; i < (j % 2 ? 5 : 6); i++) star(g, (i + (j % 2 ? 1 : 0.5)) * w * 0.4 / 6, (j + 0.6) * h * 7 / 13 / 9.6, 4); }
function chartTex(g, w, h, t) {
  g.fillStyle = '#fbf8ee'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,150,200,0.35)'; g.lineWidth = 2; for (let y = h * 0.3; y < h; y += h / 14) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  txt(g, 'AT LEAST', w / 2, h * 0.1, w * 0.8, h * 0.085, { col: '#1e2a5a', font: SANS });
  txt(g, '8 PLOTS', w / 2, h * 0.2, w * 0.86, h * 0.12, { col: '#c8282e', font: SANS }); g.fillStyle = '#c8282e'; g.fillRect(w * 0.15, h * 0.27, w * 0.7, 6);
  const n = Math.max(0, Math.min(8, t * 8)); g.strokeStyle = '#1e2a5a'; g.lineCap = 'round'; g.lineWidth = w * 0.03;
  const mark = (i, k) => { const grp = Math.floor(i / 5), j = i % 5, x0 = w * 0.16 + grp * w * 0.42, y0 = h * 0.42, y1 = h * 0.78;
    g.beginPath(); if (j < 4) { const x = x0 + j * w * 0.075 + Math.sin(i * 3.1) * 4; g.moveTo(x, y0); g.lineTo(x + 6, y0 + (y1 - y0) * k); }
    else { g.moveTo(x0 - w * 0.04, y1 - 10); g.lineTo(x0 - w * 0.04 + (w * 0.31) * k, y1 - 10 - (y1 - y0 - 20) * k); } g.stroke(); };
  for (let i = 0; i < 8; i++) { const k = Math.max(0, Math.min(1, n - i)); if (k > 0) mark(i, k); }
  if (n >= 7.999) { txt(g, '…AND COUNTING', w / 2, h * 0.9, w * 0.7, h * 0.055, { col: '#1e2a5a', font: SANS, italic: true }); }
  else { txt(g, `${Math.floor(n)}`, w * 0.86, h * 0.9, w * 0.2, h * 0.07, { col: '#c8282e', font: SANS }); }
}
// shoes / lab
function vialLabelTex(g, w, h) { g.fillStyle = '#f4ecd2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a1d4a'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12);
  txt(g, 'THALLIUM', w / 2, h * 0.3, w * 0.86, h * 0.22, { col: '#1e1a30', font: SANS }); txt(g, 'SALTS', w / 2, h * 0.55, w * 0.6, h * 0.22, { col: '#1e1a30', font: SANS });
  g.fillStyle = '#c8282e'; g.fillRect(w * 0.1, h * 0.72, w * 0.8, h * 0.16); txt(g, '☠ HANDLE WITH CARE', w / 2, h * 0.8, w * 0.75, h * 0.11, { col: '#ffffff', font: SANS }); }
function rayTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.15, 'rgba(255,255,255,0.12)'); gr.addColorStop(0.75, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0.7)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const gx = g.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.5, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over'; }
function surfaceTex(g, w, h) { g.fillStyle = '#9feae8'; g.fillRect(0, 0, w, h); const R = rng(3); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 3;
  for (let i = 0; i < 140; i++) { const x = R() * w, y = R() * h; g.beginPath(); for (let k = 0; k <= 7; k++) { const a = k / 7 * Math.PI * 2, r = 14 + 9 * Math.sin(a * 2 + i); g.lineTo(x + Math.cos(a) * r * 1.6, y + Math.sin(a) * r); } g.stroke(); }
  g.fillStyle = 'rgba(40,120,150,0.25)'; for (let i = 0; i < 60; i++) { g.beginPath(); g.ellipse(R() * w, R() * h, 20 + R() * 40, 10 + R() * 20, 0, 0, 7); g.fill(); } }
function glowTex(g, w, h) { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }

// ---------------------------------------------------------------- materials
let M;
function materials() {
  const vc = (o = {}) => toon({ vertexColors: true, ...o }), T = (w, h, fn, rep) => mkTex(w, h, fn, rep), m = {};
  m.paint = vc(); m.glossy = vc(); m.metal = vc({ emissive: 0x101018 });
  m.sand = vc({ map: T(512, 512, (g, w, h) => sandTex(g, w, h), [24, 24]) });
  m.sea = toon({ map: T(256, 1024, seaTex), emissive: 0x0a3a48 });
  m.foam = toon({ map: T(1024, 64, foamTex, [6, 1]), transparent: true, alphaTest: 0.35, emissive: 0x506060, depthWrite: false });
  m.rock = vc(); m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#c09a6a', n: 5, seed: 31 })) });
  m.bark = vc({ map: T(256, 256, (g, w, h) => PT.bark(g, w, h, { base: '#9a7a5a' })) });
  m.leaf = toon({ map: T(256, 1024, leafTex), alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true });
  m.towel = toon({ map: T(256, 256, (g, w, h) => stripesTex(g, w, h, ['#e84a4a', '#f4f0e6', '#3a8ad8', '#f4f0e6'], 8)) });
  m.reefSand = vc({ map: T(1024, 1024, reefSandTex, [8, 8]) });
  m.coral = vc(); m.brain = vc({ map: T(256, 256, brainTex) });
  m.fan = toon({ map: T(512, 512, (g, w, h) => fanTex(g, w, h)), alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true });
  m.fish = vc(); m.shell = toon({ map: T(1024, 1024, shellTex), emissiveMap: null }); m.shell.emissiveMap = m.shell.map; m.shell.emissive = new THREE.Color(0);
  m.lip = toon({ map: T(256, 256, lipTex), side: THREE.DoubleSide }); m.lip.emissiveMap = m.lip.map; m.lip.emissive = new THREE.Color(0);
  m.board = toon({ map: T(1024, 512, boardTex), emissive: 0x302820 });
  m.surface = new THREE.MeshBasicMaterial({ map: T(512, 512, surfaceTex, [40, 40]), transparent: true, opacity: 0.55, side: THREE.DoubleSide, fog: true, depthWrite: false });
  m.ray = new THREE.MeshBasicMaterial({ map: T(64, 256, rayTex), color: 0xc8fff0, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  m.bubble = new THREE.MeshBasicMaterial({ color: 0xe8ffff, transparent: true, opacity: 0.75, fog: false });
  m.halo = new THREE.MeshBasicMaterial({ map: T(128, 128, glowTex), color: 0xff9ad0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  m.marble = vc({ map: T(512, 512, (g, w, h) => marbleTex(g, w, h)) }); m.marbleDark = vc({ map: T(512, 512, (g, w, h) => marbleTex(g, w, h, { base: '#8a7a70', seed: 5 })) });
  m.panel = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#7a4a2e', n: 4, seed: 51, joints: 0 })) });
  m.drape = toon({ map: T(512, 512, drapeTex) }); m.carpet = vc({ map: T(512, 512, (g, w, h) => PT.fabric(g, w, h, { base: '#7a2a30' })) });
  m.emblem = toon({ map: T(512, 512, emblemTex), transparent: true, alphaTest: 0.5, emissive: 0x201810 }); m.flag = toon({ map: T(512, 300, flagTex), side: THREE.DoubleSide });
  m.nameplate = toon({ map: T(512, 128, (g, w, h) => nameplateTex(g, w, h, 'SENATOR')) }); m.witnessPlate = toon({ map: T(512, 128, (g, w, h) => nameplateTex(g, w, h, 'WITNESS')) });
  m.chart = toon({ map: T(512, 640, (g, w, h) => chartTex(g, w, h, 0)), emissive: 0x2a2a22 }); m.chart.emissiveMap = m.chart.map;
  m.baize = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#3a6a4a' })) }); m.paper = vc({ map: T(256, 256, (g, w, h) => PT.paper(g, w, h, {})) });
  m.glowWarm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd8a0).multiplyScalar(2.6), fog: false }); m.glowCool = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xe8f0ff).multiplyScalar(2.2), fog: false });
  m.glass = new THREE.MeshBasicMaterial({ color: 0xc8e8f0, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide });
  m.wall = vc({ map: T(512, 512, wallTex) }); m.cloth = vc({ map: T(256, 256, clothTex) }); m.leather = vc(); m.map = toon({ map: T(512, 360, mapTex) }); m.folder = toon({ map: T(512, 680, folderTex), emissive: 0x1a140a });
  m.lampShade = toon({ color: 0x1f7a4a, emissive: 0x0a3a20, side: THREE.DoubleSide }); m.blindLight = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc070).multiplyScalar(2.2), fog: false });
  m.label = toon({ map: T(256, 160, vialLabelTex), emissive: 0x1a1a14 });
  m.shine = new THREE.MeshBasicMaterial({ color: 0xf0f4ff, fog: false }); m.powder = new THREE.MeshBasicMaterial({ color: 0xf8f4ff, transparent: true, opacity: 0, depthWrite: false });
  m.sparkle = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff4c0).multiplyScalar(1.7), fog: false });
  m.puffCloud = new THREE.MeshBasicMaterial({ map: T(128, 128, glowTex), color: 0xf4f0ff, transparent: true, opacity: 0, depthWrite: false, fog: false });
  return m;
}
const nond = (o) => { if (NOND) NOND.add(o); o.castShadow = false; return o; };

// ================================================================= beach
function palm(K, x, z, h, lean, ry, seed) {
  const R = rng(seed), segs = 9; let px = 0, py = 0, pz = 0; const pts = [];
  for (let i = 0; i <= segs; i++) { const t = i / segs; pts.push([x + Math.sin(ry) * lean * h * t * t, h * t, z + Math.cos(ry) * lean * h * t * t]); }
  for (let i = 0; i < segs; i++) { const r = 0.2 - 0.08 * i / segs; K.beam(M.bark, pts[i], pts[i + 1], r, 0xd8c0a0, true, 10); K.put(M.bark, tor(r + 0.01, 0.025, 4, 12), ...pts[i + 1], Math.PI / 2, 0, 0, 1, 1, 1, 0x8a6a50); }
  [px, py, pz] = pts[segs];
  for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2 + R() * 0.3, L = 2.4 + R() * 0.8; K.put(M.leaf, frondGeo(0.9, L, 0.32 + R() * 0.15), px, py, pz, -0.35 - R() * 0.3, a, 0, 1, 1, 1, [0x58b858, 0x48a050, 0x6ac460][k % 3]); }
  for (let k = 0; k < 4; k++) { const a = k * 1.6 + 0.4; K.put(M.paint, sph(0.11, 10, 8), px + Math.cos(a) * 0.16, py - 0.18, pz + Math.sin(a) * 0.16, 0, 0, 0, 1, 1, 1, 0x6a4a2a); }
  return pts[segs];
}
function rock(K, x, y, z, s, sy = 0.7, seed = 1, c = 0x8a8098, ry = 0) { K.put(M.rock, rockGeo(seed % 7), x, y, z, 0, ry, 0, s, s * sy, s * 1.1, c); }
function rowboat(K) { // a small wooden dinghy, bow to -z, resting tilted on the sand
  K.put(M.wood, sph(1, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), 0, 0.42, 0, 0, 0, 0, 0.72, 0.42, 1.75, 0xf2ece0);
  K.put(M.paint, tor(1, 0.035, 6, 32), 0, 0.42, 0, Math.PI / 2, 0, 0, 0.72, 1.75, 1, 0x2a5aa8); K.put(M.paint, tor(1, 0.02, 6, 32), 0, 0.3, 0, Math.PI / 2, 0, 0, 0.7, 1.72, 1, 0xd84a3a);
  for (const z of [-0.7, 0.05, 0.75]) K.box(M.wood, -0.66 * Math.sqrt(1 - (z / 1.75) ** 2), 0.66 * Math.sqrt(1 - (z / 1.75) ** 2), 0.34, 0.38, z - 0.13, z + 0.13, 0xb08a5a, 0.01);
  K.box(M.wood, -0.03, 0.03, 0.02, 0.42, -1.6, -1.45, 0x8a6a4a, 0.01); // stem
  for (const s of [-1, 1]) K.beam(M.wood, [s * 0.4, 0.4, 0.1], [s * 1.1, 0.06, 1.6], 0.035, 0xc8a070, true, 6); // oars across, blades on the sand
  for (const s of [-1, 1]) K.cb(M.wood, 0.14, 0.012, 0.38, s * 1.13, 0.05, 1.75, 0xc8a070, 0, s * 0.4, 0);
  K.beam(M.paint, [0, 0.42, -1.6], [-0.6, 0.02, -2.8], 0.012, 0xd8c8a0); // bow line to a stake
  K.beam(M.wood, [-0.6, 0, -2.8], [-0.6, 0.3, -2.8], 0.03, 0x8a6a4a, true);
}
function diverGear(K, x, z) { // tank, fins, mask, weight belt, towel, straw hat
  K.at(x, 0, z, 0.3, () => {
    K.box(M.towel, -0.55, 0.55, 0, 0.012, -0.9, 0.9, 0xffffff, 0.004);
    K.put(M.paint, cyl(0.1, 0.1, 0.62, 18), 0.0, 0.11, -0.25, 0, 0.2, Math.PI / 2, 1, 1, 1, 0xf2c030); K.put(M.paint, sph(0.1, 16, 10), 0.31 * Math.cos(0.2), 0.11, -0.25 - 0.31 * Math.sin(0.2), 0, 0, 0, 1, 1, 1, 0xf2c030);
    K.put(M.paint, sph(0.1, 16, 10), -0.31 * Math.cos(0.2), 0.11, -0.25 + 0.31 * Math.sin(0.2), 0, 0, 0, 1, 1, 1, 0xf2c030);
    K.put(M.metal, cyl(0.03, 0.035, 0.08, 10), -0.42 * Math.cos(0.2), 0.11, -0.25 + 0.42 * Math.sin(0.2), 0, 0.2, Math.PI / 2, 1, 1, 1, 0xb8b8c8); K.put(M.metal, cyl(0.04, 0.04, 0.03, 10), -0.47, 0.15, -0.15, 0, 0, 0, 1, 1, 1, 0x3a3a48);
    K.beam(M.paint, [-0.47, 0.13, -0.15], [-0.1, 0.04, 0.25], 0.012, 0x2a2a30, true); K.put(M.paint, tor(0.14, 0.02, 6, 16), 0.0, 0.2, -0.25, 0, 0, 0, 1, 1, 0.4, 0x2a2a30); // regulator hose + harness
    for (const s of [-1, 1]) { K.cb(M.paint, 0.2, 0.02, 0.5, s * 0.17, 0.03, 0.42, 0x2a7ad8, 0, s * 0.12, 0, 0.008); K.cb(M.paint, 0.12, 0.07, 0.16, s * 0.15, 0.06, 0.2, 0x1e3a6a, 0, s * 0.12, 0, 0.03); }
    K.put(M.paint, tor(0.07, 0.02, 6, 16), 0.32, 0.03, 0.15, Math.PI / 2, 0, 0, 1.3, 1, 1, 0x2a2a30); K.put(M.glass, cyl(0.06, 0.06, 0.02, 16), 0.32, 0.04, 0.15, 0, 0, 0, 1.3, 1, 1); // mask
    K.put(M.paint, cyl(0.24, 0.26, 0.02, 20), -0.62, 0.02, 0.62, 0.1, 0, 0.1, 1, 1, 1, 0xe8cc80); K.put(M.paint, cyl(0.12, 0.14, 0.09, 16), -0.62, 0.07, 0.62, 0.1, 0, 0.1, 1, 1, 1, 0xe0c070); K.put(M.paint, cyl(0.135, 0.135, 0.02, 16), -0.62, 0.06, 0.62, 0.1, 0, 0.1, 1, 1, 1, 0xc83a3a);
    K.box(M.paint, -0.3, 0.3, 0, 0.03, 0.7, 0.76, 0x2a2a30, 0.01); for (const dx of [-0.2, 0, 0.2]) K.box(M.metal, dx - 0.05, dx + 0.05, 0, 0.06, 0.68, 0.78, 0x6a6a78, 0.01); // weight belt
  });
}
function buildBeach(root) {
  const K = new Kit(), R = rng(7);
  K.box(M.sand, -260, 260, -1.5, 0, -2, 60, 0xffffff, 0.02, 4); // dry beach
  K.put(M.sand, plane(520, 30), 0, -0.25, -16, -Math.PI / 2 - 0.03, 0, 0, 1, 1, 1, 0xd8d0b0); // wet slope under water
  for (let i = 0; i < 60; i++) { const x = (R() - 0.5) * 60, z = 2 + R() * 24; if (Math.abs(x) < 4 && z < 10) continue; rock(K, x, 0, z, 0.06 + R() * 0.12, 0.6, i, 0xb8a8a0); } // pebbles
  // cove headlands (rock + green crowns) both sides, a far island
  const head = (sx, z0, z1, x0, x1, seed) => { const R2 = rng(seed); for (let z = z0; z > z1; z -= 2.2) { const k = (z0 - z) / (z0 - z1), xc = sx * (x0 + (x1 - x0) * k * k * 0 + (x1 - x0) * k);
      for (let j = 0; j < 3; j++) { const s = 2.5 + R2() * 3.5 + k * 3; rock(K, xc + sx * j * 3.5 + (R2() - 0.5) * 2, s * 0.25 - 0.4, z + (R2() - 0.5) * 2, s, 0.8 + R2() * 0.4, (z * 7 + j) | 0, [0x8a7a90, 0x7a6e88, 0x9a8a98][j]);
        if (j > 0) K.put(M.paint, sph(1, 12, 8), xc + sx * j * 3.5, s * 0.9 + 0.4, z, 0, R2() * 3, 0, s * 0.8, s * 0.45, s * 0.8, [0x3a8a4a, 0x4a9a48, 0x2e7a44][(j + (z | 0)) % 3]); } } };
  head(-1, -6, -70, 16, 34, 3); head(1, -10, -80, 18, 30, 5);
  for (let i = 0; i < 8; i++) K.put(M.paint, sph(1, 14, 8), -60 + i * 9, 0, -230, 0, 0, 0, 7 + (i % 3) * 3, 2.5 + (i % 4), 5, 0x5a7aa8); // far island, hazy
  for (let i = 0; i < 6; i++) rock(K, -12 + R() * 4, -0.1, -2 - R() * 6, 0.5 + R() * 0.9, 0.6, 30 + i, 0x7a7088); // tide rocks left
  for (let i = 0; i < 5; i++) rock(K, 9 + R() * 4, -0.1, -1 - R() * 5, 0.4 + R() * 0.8, 0.6, 40 + i, 0x7a7088);
  rock(K, 4.2, 0.1, 1.2, 0.55, 0.7, 2, 0x9a8aa0); rock(K, 4.8, 0.05, 1.8, 0.3, 0.7, 3, 0x8a7a98);
  // palms framing the cove (lean toward the sea) + sea-grape bushes at the back
  const tops = [[-6.5, 4, 7.5, 0.18, Math.PI + 0.3], [-9, 1.5, 8.5, 0.24, Math.PI - 0.2], [-4.2, 9, 6.2, 0.12, Math.PI + 0.6], [7, 3, 7.8, 0.2, Math.PI - 0.5], [10, 6.5, 9, 0.16, Math.PI - 0.1], [5.4, 10, 6.4, 0.1, Math.PI + 0.2], [-14, 4, 9.5, 0.2, Math.PI], [15, 1, 8.8, 0.22, Math.PI + 0.4]];
  tops.forEach(([x, z, h, l, ry], i) => palm(K, x, z, h, l, ry, 10 + i));
  palm(K, -3.3, 6.6, 5.2, 0.32, Math.PI * 0.72, 31); palm(K, 3.5, 3.6, 5.6, 0.28, -Math.PI * 0.78, 32); palm(K, 4.6, 5.2, 6.4, 0.18, -Math.PI * 0.6, 33);
  for (let i = 0; i < 26; i++) { const x = (R() - 0.5) * 60, z = 12 + R() * 14; K.put(M.paint, sph(1, 12, 8), x, 0.3, z, 0, R() * 3, 0, 1.2 + R(), 0.8 + R() * 0.6, 1.2 + R(), [0x3a8a44, 0x4a9a4a, 0x2f7a3e][i % 3]); }
  // driftwood, shells, starfish, coconuts
  K.beam(M.bark, [-2.6, 0.08, 3.4], [-0.6, 0.12, 4.4], 0.07, 0xc8b8a8, true, 7); K.beam(M.bark, [-1.4, 0.1, 3.95], [-1.2, 0.35, 3.3], 0.03, 0xc8b8a8, true, 6);
  for (let i = 0; i < 14; i++) { const x = (R() - 0.5) * 12, z = 0.4 + R() * 6; K.put(M.paint, sph(0.05, 8, 6), x, 0.01, z, 0, R() * 3, 0, 1, 0.5, 1.4, [0xf4d8d0, 0xf8e8c8, 0xe8b8a8][i % 3]); }
  for (const [x, z, r] of [[2.4, 3.1, 0.3], [-3.4, 1.6, 1.2]]) for (let k = 0; k < 5; k++) K.cb(M.paint, 0.05, 0.02, 0.14, x + Math.sin(k * 1.256 + r) * 0.07, 0.012, z + Math.cos(k * 1.256 + r) * 0.07, 0xf08a4a, 0, k * 1.256 + r, 0, 0.01);
  for (const [x, z] of [[-6.3, 3.6], [-5.8, 4.2], [7.4, 2.4]]) K.put(M.paint, sph(0.12, 10, 8), x, 0.11, z, 0, 0, 0, 1, 1, 1, 0x6a4a2a);
  K.at(-3.4, 0, -0.6, 0.35, () => rowboat(K)); diverGear(K, 1.6, 2.6);
  // distant sailboat
  K.at(-30, 0, -120, 0, () => { K.box(M.paint, -2.5, 2.5, 0, 0.8, -0.8, 0.8, 0xf4f0e6, 0.2); K.beam(M.paint, [0, 0.8, 0], [0, 8, 0], 0.08, 0xd8c8a8, true); K.put(M.paint, new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(3.5, 0), new THREE.Vector2(0, 6.5)])), 0.1, 1.3, 0, 0, 0, 0, 1, 1, 1, 0xfff8ee); });
  K.build(root, 40);
  // sea + foam (own meshes)
  const sea = mesh(root, plane(640, 330), M.sea, 0, 0.03, -165.5, -Math.PI / 2, 0, 0, false); sea.receiveShadow = true;
  const foam = mesh(root, plane(400, 1.4), M.foam, 0, 0.05, -0.6, -Math.PI / 2, 0, 0, false); const foam2 = mesh(root, plane(400, 1.0), M.foam, 0, 0.045, -3.2, -Math.PI / 2, 0, 0, false); foam2.material = M.foam.clone(); foam2.material.opacity = 0.6; foam2.material.transparent = true;
  nond(foam); nond(foam2);
  return { foam, foam2 };
}

// ================================================================= underwater
function branchCoral(K, x, z, s, c, seed) { const R = rng(seed);
  const br = (p, dir, L, r, d) => { const q = [p[0] + dir[0] * L, p[1] + dir[1] * L, p[2] + dir[2] * L]; K.beam(M.coral, p, q, r, c, true, 7); if (d >= 3) { K.put(M.coral, sph(r * 1.25, 8, 6), ...q, 0, 0, 0, 1, 1, 1, tint(c, 1.15)); return; }
    for (let k = 0; k < 2 + (R() < 0.4); k++) { const a = R() * 6.28, sp = 0.45 + R() * 0.3, nd = [dir[0] * 0.6 + Math.cos(a) * sp, dir[1] * 0.8 + 0.2, dir[2] * 0.6 + Math.sin(a) * sp], n = Math.hypot(...nd); br(q, nd.map((v) => v / n), L * 0.75, r * 0.72, d + 1); } };
  br([x, 0, z], [0, 1, 0], 0.5 * s, 0.07 * s, 0); }
function tubeSponge(K, x, z, s, c) { for (let k = 0; k < 4; k++) { const a = k * 1.7, h = s * (0.7 + (k % 3) * 0.35); K.put(M.coral, cyl(0.11 * s, 0.09 * s, h, 12, true), x + Math.cos(a) * 0.14 * s, h / 2, z + Math.sin(a) * 0.14 * s, 0.1 * Math.cos(a), 0, 0.1 * Math.sin(a), 1, 1, 1, c); K.put(M.coral, tor(0.11 * s, 0.025 * s, 5, 12), x + Math.cos(a) * 0.14 * s + 0.1 * Math.sin(a) * h * 0, h, z + Math.sin(a) * 0.14 * s, Math.PI / 2, 0, 0, 1, 1, 1, tint(c, 1.15)); } }
function seaFan(K, x, z, s, ry, c) { K.put(M.fan, plane(1.6 * s, 1.6 * s), x, 0.8 * s, z, 0, ry, 0, 1, 1, 1, c); }
function tableCoral(K, x, z, s, c) { K.put(M.coral, cyl(0.06 * s, 0.1 * s, 0.6 * s, 8), x, 0.3 * s, z, 0, 0, 0, 1, 1, 1, shade(c, 0.8)); K.put(M.coral, cyl(0.7 * s, 0.5 * s, 0.08 * s, 18), x, 0.62 * s, z, 0.05, 0, 0.08, 1, 1, 1, c); }
function seagrass(K, x, z, n, R) { for (let i = 0; i < n; i++) { const a = R() * 6.28, r = R() * 0.5, h = 0.3 + R() * 0.5; K.cb(M.coral, 0.03, h, 0.006, x + Math.cos(a) * r, h / 2, z + Math.sin(a) * r, [0x4a9a5a, 0x5aaa4a, 0x3a8a5a][i % 3], (R() - 0.5) * 0.5, R() * 3, (R() - 0.5) * 0.5, 0.003); } }
function fishPrefab(body, belly, fin) { const K = new Kit();
  K.put(M.fish, sph(0.5, 14, 10), 0, 0, 0, 0, 0, 0, 0.32, 0.62, 1, body); K.put(M.fish, sph(0.5, 12, 8), 0, -0.1, 0.06, 0, 0, 0, 0.26, 0.4, 0.8, belly);
  K.put(M.fish, cone(0.32, 0.4, 4), 0, 0, -0.62, -Math.PI / 2, 0, 0, 0.18, 1, 1, fin); K.cb(M.fish, 0.03, 0.22, 0.5, 0, 0.32, -0.05, fin, 0.3, 0, 0, 0.01);
  for (const s of [-1, 1]) { K.put(M.fish, sph(0.07, 8, 6), s * 0.13, 0.08, 0.3, 0, 0, 0, 1, 1, 1, 0xffffff); K.put(M.fish, sph(0.045, 8, 6), s * 0.16, 0.08, 0.32, 0, 0, 0, 1, 1, 1, 0x1a1428); }
  return K.prefab(); }
function buildUnder(root) {
  const K = new Kit(), R = rng(17);
  K.put(M.reefSand, dunes(160, 160, 60, 0.35, 2), 0, 0, -30, 0, 0, 0, 1, 1, 1, 0xffffff);
  // reef walls: coral-crusted rock mounds both sides + back
  const mound = (x, z, s, seed) => { rock(K, x, s * 0.25, z, s, 0.75, seed, [0x7a6a88, 0x8a6a7a, 0x6a7088][seed % 3], seed);
    for (let k = 0; k < 4; k++) { const a = rng(seed)() * 6.28 + k * 1.6, rr = s * 0.5; K.put(M.brain, sph(0.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), x + Math.cos(a) * rr, s * 0.6, z + Math.sin(a) * rr, 0, 0, 0, s * 0.35, s * 0.25, s * 0.35, [0xffffff, 0xd8a8e8, 0xb8e0a0, 0xffc8a0][k]); } };
  for (const [x, z, s] of [[-7, -2, 2.2], [-9, -7, 3.2], [-5.5, -11, 2.8], [6.5, -3, 2.4], [8.5, -8.5, 3.4], [4.5, -12, 2.6], [0, -16, 3.6], [-3, -20, 4], [4, -22, 4.5], [-12, -2, 3], [12, 0, 3], [-14, -14, 5], [15, -15, 5], [0, -30, 7], [-10, 5, 2], [11, 6, 2.2]]) mound(x, z, s, (x * 3 + z) & 63);
  const corals = [0xf27a4a, 0xff9a6a, 0xd84a8a, 0xf2c84a, 0x8a5ad8, 0xff6a7a];
  for (let i = 0; i < 26; i++) { const sd = i % 2 ? 1 : -1, x = sd * (2.6 + R() * 7), z = -14 + R() * 18; branchCoral(K, x, z, 0.6 + R() * 0.9, corals[i % corals.length], 50 + i); }
  for (let i = 0; i < 12; i++) { const sd = i % 2 ? -1 : 1, x = sd * (3 + R() * 6), z = -12 + R() * 14; tubeSponge(K, x, z, 0.7 + R() * 0.7, [0x9a4ac8, 0xc85a9a, 0xe8a03a][i % 3]); }
  for (let i = 0; i < 14; i++) { const sd = i % 2 ? 1 : -1, x = sd * (3 + R() * 8), z = -16 + R() * 18; seaFan(K, x, z, 0.8 + R() * 1.0, R() * 3, [0xb04aa8, 0xd85a8a, 0x8a4ad8, 0xe87a5a][i % 4]); }
  for (let i = 0; i < 7; i++) { const sd = i % 2 ? 1 : -1; tableCoral(K, sd * (4 + R() * 6), -10 + R() * 12, 0.9 + R() * 0.6, [0xc8a8e8, 0xe8b890, 0xa8d8c0][i % 3]); }
  for (let i = 0; i < 16; i++) seagrass(K, (R() - 0.5) * 14, -6 + R() * 14, 10, R);
  for (let i = 0; i < 40; i++) { const x = (R() - 0.5) * 16, z = -10 + R() * 18; if (Math.hypot(x, z) < 2.4) continue; rock(K, x, 0, z, 0.08 + R() * 0.2, 0.6, i, 0x9a8aa0); }
  for (let i = 0; i < 6; i++) { const x = (R() - 0.5) * 8, z = 1 + R() * 6; for (let k = 0; k < 5; k++) K.cb(M.coral, 0.06, 0.025, 0.2, x + Math.sin(k * 1.256) * 0.1, 0.02, z + Math.cos(k * 1.256) * 0.1, [0xff7a3a, 0xd84a6a][i % 2], 0, k * 1.256, 0, 0.012); } // starfish
  // the GIANT conch, lying on its side, spire to +x, aperture facing the camera
  const shellG = new THREE.Group(); shellG.position.set(0, 0.95, 0); shellG.rotation.set(0.15, -0.35, -Math.PI / 2 - 0.18); root.add(shellG);
  const prof = [[0.0, -1.75], [0.1, -1.55], [0.24, -1.1], [0.48, -0.55], [0.7, 0.0], [0.82, 0.35], [0.78, 0.5], [0.6, 0.6], [0.5, 0.8], [0.38, 1.0], [0.27, 1.2], [0.16, 1.4], [0.07, 1.58], [0.0, 1.7]];
  const sh = mesh(shellG, lathe('conch', prof, 32), M.shell); sh.scale.set(1.15, 1.15, 0.95);
  const KS = new Kit(); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; KS.put(M.shell, cone(0.1, 0.3, 8), Math.cos(a) * 0.92, 0.45, Math.sin(a) * 0.76, Math.sin(a) * 1.3, 0, -Math.cos(a) * 1.3, 1, 1, 1, 0xffffff); }
  for (const [y, r] of [[0.8, 0.5], [1.0, 0.38], [1.2, 0.27], [1.4, 0.16]]) KS.put(M.paint, tor(r * 1.12, 0.045, 6, 28), 0, y, 0, Math.PI / 2 + 0.12, 0, 0, 1, 1, 0.85, 0xc84a7a);
  KS.build(shellG);
  const lip = mesh(shellG, sph(1, 18, 12), M.lip, 0.35, -0.25, 0.55, -0.5, 0, 0.15); lip.scale.set(0.75, 1.2, 0.16);
  const halo = nond(mesh(root, sph(3.0, 20, 14), M.halo, 0, 1.1, 0, 0, 0, 0, false)); halo.visible = false;
  // comic board on a stake planted behind-left of the shell, hanging above it
  const board = new THREE.Group(); board.position.set(-0.4, 0, -1.6); board.rotation.y = 0.12; root.add(board);
  const KB = new Kit(); KB.beam(M.wood, [0, -0.2, 0], [0, 4.0, 0], 0.07, 0x8a6a4a); KB.cb(M.wood, 0.1, 0.12, 0.1, 0, 4.05, 0, 0x6a4a3a);
  for (const s of [-1, 1]) KB.beam(M.paint, [s * 0.9, 3.95, 0.05], [s * 1.0, 3.55, 0.06], 0.012, 0x3a3040, true); KB.build(board);
  mesh(board, plane(2.4, 1.2), M.board, 0, 3.0, 0.1); board.visible = false;
  // god-ray shafts (additive cones along the light), a moving surface, bubbles, fish schools
  const rays = new THREE.Group(); root.add(rays); const sunDir = new THREE.Vector3(0, Math.sin(40 * Math.PI / 180), -Math.cos(40 * Math.PI / 180)), up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 16; i++) { const L = 22, x = (R() - 0.5) * 22, z = -14 + R() * 20, w = 0.4 + R() * 1.1; const m = new THREE.Mesh(cyl(w * 0.7, w * 1.6, L, 12, true), M.ray.clone()); m.material.opacity = 0.07 + R() * 0.1;
    const mid = new THREE.Vector3(x, 0, z).addScaledVector(sunDir, L / 2 - 1.5); m.position.copy(mid); m.quaternion.setFromUnitVectors(up, sunDir); m.renderOrder = 5; m.userData.ph = R() * 6.28; rays.add(nond(m)); }
  const surf = nond(mesh(root, plane(1600, 1600), M.surface, 0, 15, -20, Math.PI / 2, 0, 0, false));
  const NB = 70, bub = nond(new THREE.InstancedMesh(sph(0.05, 8, 6), M.bubble, NB)); bub.frustumCulled = false; root.add(bub);
  const bsrc = []; for (let i = 0; i < NB; i++) { const s = i < 30 ? [-2.2, 1.6, 1.8] : i < 50 ? [3.5, 0.6, -5] : [-5.5, 1, -8]; bsrc.push([s[0], s[1], s[2], R() * 14, 0.6 + R() * 0.9, R() * 6.28]); }
  const schools = [];
  const school = (pf, n, ctr, rad, sc, sp, h, ph) => { const ims = pf.map(([mat, geo]) => { const im = new THREE.InstancedMesh(geo, mat, n); im.frustumCulled = false; im.castShadow = false; root.add(im); return im; });
    const off = []; const R2 = rng(n * 7 + ph * 100); for (let i = 0; i < n; i++) off.push([(R2() - 0.5) * 2.4, (R2() - 0.5) * 1.1, (R2() - 0.5) * 2.4, R2() * 6.28, 0.8 + R2() * 0.4]); schools.push({ ims, off, ctr, rad, sc, sp, h, ph }); };
  school(fishPrefab(0xffd83a, 0xfff0a0, 0xffb02a), 26, [-1.5, 4.2, -4], 5, 0.2, 0.012, 0.5, 0);
  school(fishPrefab(0x3a6ae8, 0x7aa0ff, 0xffd84a), 16, [2, 6, -7], 6, 0.3, -0.009, 0.8, 2);
  school(fishPrefab(0x4ac8a8, 0xf27ab0, 0xf2a03a), 5, [0, 2.4, -2], 4.5, 0.55, 0.006, 0.4, 4);
  school(fishPrefab(0xf27a3a, 0xffffff, 0x2a2a3a), 10, [-4, 2.2, -9], 3, 0.16, 0.017, 0.3, 1);
  K.build(root, 20);
  return { shellG, halo, board, rays, surf, bub, bsrc, schools };
}
const _m4 = () => new THREE.Matrix4();

// ================================================================= senate (local: floor y 0; dais along the back z -6.5 facing +z)
function chair(K, x, z, ry, c = 0x5a2a24, hi = 1.15) { K.at(x, 0, z, ry, () => { K.box(M.paint, -0.26, 0.26, 0.42, 0.52, -0.26, 0.26, c, 0.06); K.box(M.paint, -0.26, 0.26, 0.52, hi, -0.3, -0.18, c, 0.07); for (const [a, b] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) K.beam(M.metal, [a, 0, b], [a, 0.42, b], 0.03, 0x3a3040, true); }); }
function mic(K, x, y, z, ry = 0, tilt = 0.5) { K.put(M.metal, cyl(0.05, 0.06, 0.03, 12), x, y + 0.015, z, 0, 0, 0, 1, 1, 1, 0x2a2a34); K.at(x, y, z, ry, () => { K.beam(M.metal, [0, 0.02, 0], [0, 0.22, 0.04], 0.008, 0x3a3a44, true); K.beam(M.metal, [0, 0.22, 0.04], [0, 0.3, 0.15], 0.008, 0x3a3a44, true); K.put(M.metal, cyl(0.025, 0.02, 0.09, 10), 0, 0.31, 0.18, Math.PI / 2 - tilt, 0, 0, 1, 1, 1, 0x8a8a98); }); }
function waterSet(K, x, y, z) { K.put(M.glass, cyl(0.06, 0.05, 0.2, 14, true), x, y + 0.1, z); K.put(M.paint, cyl(0.055, 0.045, 0.12, 12), x, y + 0.06, z, 0, 0, 0, 1, 1, 1, 0x9ac8e0); K.put(M.glass, cyl(0.03, 0.025, 0.1, 10, true), x + 0.13, y + 0.05, z + 0.04); }
function buildSenate(root, chartCanvasHolder) {
  const K = new Kit(), R = rng(23), W = 22, D = 26, H = 9.5, dz = -6.5, dy = 0.75;
  K.box(M.carpet, -W / 2, W / 2, -0.1, 0, -D / 2, D / 2, 0xffffff, 0.01, 4); K.box(M.marble, -W / 2, W / 2, H, H + 0.4, -D / 2, D / 2, 0xc8bca8, 0.02, 4); for (let x = -W / 2 + 2; x < W / 2; x += 2.75) K.box(M.marble, x - 0.15, x + 0.15, H - 0.35, H, -D / 2, D / 2, 0xe8dcc8, 0.02); for (let z = -D / 2 + 2; z < D / 2; z += 2.75) K.box(M.marble, -W / 2, W / 2, H - 0.35, H, z - 0.15, z + 0.15, 0xe8dcc8, 0.02);
  K.box(M.marble, -W / 2, W / 2, 0, H, -D / 2 - 0.4, -D / 2, 0xffffff, 0.02, 4); for (const s of [-1, 1]) K.box(M.marble, s * W / 2 - 0.2, s * W / 2 + 0.2, 0, H, -D / 2, D / 2, 0xf0ece0, 0.02, 4);
  K.box(M.marble, -W / 2, W / 2, 0, H, D / 2, D / 2 + 0.4, 0xf0ece0, 0.02, 4);
  // back wall: columns with green drapes between, cornice, emblem
  for (let i = -3; i <= 3; i++) { const x = i * 3.0; K.put(M.marble, cyl(0.38, 0.42, H - 1.4, 20), x, (H - 1.4) / 2 + 0.6, -D / 2 + 0.6, 0, 0, 0, 1, 1, 1, 0xfffaf0); K.box(M.marble, x - 0.55, x + 0.55, 0, 0.6, -D / 2 + 0.05, -D / 2 + 1.15, 0xe8e0d0, 0.03); K.box(M.marble, x - 0.6, x + 0.6, H - 0.8, H - 0.5, -D / 2 + 0.05, -D / 2 + 1.2, 0xe8e0d0, 0.03);
    for (let k = 0; k < 8; k++) K.box(M.marble, x - 0.42 * Math.cos(k / 8 * Math.PI), x - 0.42 * Math.cos(k / 8 * Math.PI) + 0.03, 0.6, H - 0.8, -D / 2 + 0.55 - 0.42 * Math.sin(k / 8 * Math.PI) + 0.4, -D / 2 + 0.6 - 0.42 * Math.sin(k / 8 * Math.PI) + 0.43, 0xd8d0c0, 0.01); }
  K.box(M.marble, -W / 2, W / 2, H - 0.5, H, -D / 2, -D / 2 + 1.4, 0xe8e0d0, 0.04);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const z = -8 + i * 6.5; K.put(M.marble, cyl(0.34, 0.38, H - 1.4, 18), s * (W / 2 - 0.5), (H - 1.4) / 2 + 0.6, z, 0, 0, 0, 1, 1, 1, 0xfffaf0); }
  K.box(M.panel, -W / 2 + 0.2, W / 2 - 0.2, 0, 1.2, -D / 2 + 1.0, -D / 2 + 1.1, 0xffffff, 0.01); // wainscot
  // dais (two steps), long bench desk, chairs, nameplates, mics
  K.box(M.panel, -8.5, 8.5, 0, dy, dz - 2.6, dz + 0.9, 0xffffff, 0.02); K.box(M.carpet, -8.5, 8.5, dy, dy + 0.02, dz - 2.6, dz + 0.9, 0xffffff, 0.01);
  K.box(M.panel, -8.2, 8.2, dy, dy + 0.75, dz + 0.3, dz + 0.9, 0xffffff, 0.02); K.box(M.panel, -8.35, 8.35, dy + 0.75, dy + 0.82, dz - 0.1, dz + 1.0, 0x8a5a3a, 0.02);
  for (let i = -4; i <= 4; i++) K.box(M.panel, i * 1.8 - 0.05, i * 1.8 + 0.05, dy + 0.05, dy + 0.72, dz + 0.9, dz + 0.94, 0x5a3420, 0.01);
  K.build(root);
  const dais = new THREE.Group(); root.add(dais); const KD = new Kit();
  const DT = dy + 0.82;
  for (let i = -3; i <= 3; i++) { const x = i * 2.2; KD.put(M.nameplate, rboxGeo(0.62, 0.14, 0.04, 0.008), x, DT + 0.02, dz + 0.96, -0.2, 0, 0, 1, 1, 1, 0xffffff); mic(KD, x + 0.25, DT, dz + 0.55, Math.PI, 0.6);
    KD.box(M.paper, x - 0.5, x - 0.1, 1.12, 1.135, dz + 0.1, dz + 0.4, 0xffffff, 0.003); if (i % 2) waterSet(KD, x - 0.6, 1.12, dz + 0.6); KD.put(M.glass, cyl(0.07, 0.06, 0.03, 12), x + 0.6, 1.135, dz + 0.4); }
  KD.build(dais);
  const chairs = new THREE.Group(); root.add(chairs); const KC = new Kit(); for (let i = -3; i <= 3; i++) chair(KC, i * 2.2, dz - 0.5, 0, 0x4a1e1e, 1.5); KC.build(chairs); chairs.position.y = dy;
  // emblem + flags
  mesh(root, plane(2.6, 2.6), M.emblem, 0, 5.6, -D / 2 + 1.42, 0, 0, 0, false);
  for (let i = -3; i < 3; i++) { if (i === -1 || i === 0) continue; const x = (i + 0.5) * 3.0; mesh(root, drapeGeo(2.4, H - 2.2), M.drape, x, 1.2, -D / 2 + 0.25, 0, 0, 0); mesh(root, plane(2.6, 0.6), M.drape, x, H - 1.1, -D / 2 + 0.4, 0, 0, 0, false); }
  for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const z = -4.75 + i * 6.5; mesh(root, drapeGeo(3.2, H - 2.6), M.drape, s * (W / 2 - 0.3), 1.0, z, 0, -s * Math.PI / 2, 0); }
  for (const s of [-1, 1]) { const K2 = new Kit(); K2.beam(M.metal, [s * 7.6, dy, dz - 1.8], [s * 7.6, dy + 3.4, dz - 1.8], 0.03, 0xd8b050, true); K2.put(M.metal, sph(0.07, 10, 8), s * 7.6, dy + 3.45, dz - 1.8, 0, 0, 0, 1, 1, 1, 0xd8b050); K2.build(root);
    const fl = mesh(root, plane(1.4, 0.9), M.flag, s * 7.6 + s * 0.72, dy + 2.85, dz - 1.8, 0, s > 0 ? 0 : Math.PI, 0); fl.rotation.y += 0.25 * s; }
  // witness table + chairs + mic cluster; press tables; public gallery
  const KW = new Kit(), wz = 1.2;
  KW.box(M.baize, -1.6, 1.6, 0.72, 0.76, wz - 0.45, wz + 0.45, 0xffffff, 0.02); KW.box(M.baize, -1.6, 1.6, 0.05, 0.74, wz - 0.47, wz - 0.42, 0xd8d8d8, 0.01);
  for (const [a, b] of [[-1.5, -0.4], [1.5, -0.4], [-1.5, 0.4], [1.5, 0.4]]) KW.beam(M.panel, [a, 0, wz + b], [a, 0.72, wz + b], 0.05, 0x5a3420);
  for (const x of [-0.6, 0.6]) chair(KW, x, wz + 0.85, Math.PI, 0x5a2a24, 1.1);
  for (let k = 0; k < 7; k++) mic(KW, -0.45 + k * 0.15, 0.76, wz - 0.12 + (k % 2) * 0.06, Math.PI + (k - 3) * 0.08, 0.4);
  KW.put(M.witnessPlate, rboxGeo(0.6, 0.13, 0.04, 0.008), 0.0, 0.84, wz - 0.42, -0.2, Math.PI, 0, 1, 1, 1, 0xffffff); waterSet(KW, 1.0, 0.76, wz); KW.box(M.paper, -1.2, -0.8, 0.76, 0.78, wz - 0.1, wz + 0.2, 0xffffff, 0.003);
  for (const s of [-1, 1]) { KW.box(M.panel, s * 3.4 - 1.3, s * 3.4 + 1.3, 0.7, 0.75, -2.2, -1.4, 0x8a5a3a, 0.02); for (const x of [-1.1, 1.1]) KW.beam(M.panel, [s * 3.4 + x, 0, -1.8], [s * 3.4 + x, 0.7, -1.8], 0.05, 0x5a3420);
    for (const x of [-0.6, 0.6]) { KW.box(M.paint, s * 3.4 + x - 0.22, s * 3.4 + x + 0.22, 0.75, 0.88, -2.0, -1.65, 0x3a3a40, 0.02); KW.box(M.paper, s * 3.4 + x - 0.1, s * 3.4 + x + 0.1, 0.86, 0.98, -1.95, -1.9, 0xffffff, 0.002); chair(KW, s * 3.4 + x, -1.0, Math.PI, 0x3a3a44, 0.95); } } // press typewriters
  // photographers' tripods + cameras on the floor between table and dais
  for (const [x, z] of [[-2.2, -3.4], [2.6, -3.0], [-4.6, -4.2], [5.0, -4.4]]) { for (let k = 0; k < 3; k++) { const a = k * 2.09; KW.beam(M.metal, [x + Math.cos(a) * 0.35, 0, z + Math.sin(a) * 0.35], [x, 1.35, z], 0.015, 0x2a2a30, true); }
    KW.box(M.paint, x - 0.14, x + 0.14, 1.35, 1.55, z - 0.1, z + 0.1, 0x1e1e26, 0.02); KW.put(M.metal, cyl(0.06, 0.07, 0.16, 12), x, 1.45, z - 0.16, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a3a44); }
  // TV light stands (1975 hearings were lit for television)
  for (const [x, z, ry] of [[-6.5, 2.5, -0.7], [6.5, 2.5, 0.7], [-8.5, -3, -1.2], [8.5, -3, 1.2]]) { KW.beam(M.metal, [x, 0, z], [x, 2.9, z], 0.03, 0x2a2a30, true); for (let k = 0; k < 3; k++) { const a = k * 2.09; KW.beam(M.metal, [x + Math.cos(a) * 0.4, 0, z + Math.sin(a) * 0.4], [x, 0.6, z], 0.015, 0x2a2a30, true); }
    KW.at(x, 2.95, z, ry, () => { KW.box(M.paint, -0.25, 0.25, -0.2, 0.2, -0.15, 0.15, 0x2a2a34, 0.03); for (const s of [-1, 1]) KW.cb(M.paint, 0.02, 0.4, 0.2, s * 0.27, 0, 0.2, 0x2a2a34, 0, s * 0.4, 0); }); }
  // public gallery: rows of chairs with seated silhouettes
  const crowdCols = [0x3a3448, 0x4a3a3a, 0x2e3448, 0x5a4a40, 0x3a4a5a, 0x6a5040];
  for (let r = 0; r < 6; r++) for (let i = -7; i <= 7; i++) { if (Math.abs(i) < 1) continue; const x = i * 0.72, z = 4.0 + r * 1.1; chair(KW, x, z, Math.PI, 0x5a3a2a, 0.95);
    if (R() < 0.82) { const c = crowdCols[(R() * 6) | 0]; KW.put(M.paint, cyl(0.17, 0.2, 0.6, 8), x, 0.82, z + 0.05, 0, 0, 0, 1, 1, 0.8, c); KW.put(M.paint, sph(0.12, 10, 8), x, 1.25, z + 0.05, 0, 0, 0, 1, 1, 1, [0xe8c0a0, 0xc89070, 0x8a5a40, 0xf0d0b8][(R() * 4) | 0]);
      KW.put(M.paint, sph(0.125, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), x, 1.27, z + 0.07, 0, 0, 0, 1, 1, 1, [0x3a2a20, 0x6a4a2a, 0xc8b8a0, 0x2a2228][(R() * 4) | 0]); } }
  KW.box(M.panel, -6, 6, 0, 0.95, 3.2, 3.3, 0xffffff, 0.01); // rail in front of the gallery
  // chandeliers
  for (const [x, z] of [[-5, -3], [5, -3], [-5, 6], [5, 6]]) { KW.beam(M.metal, [x, H, z], [x, H - 1.4, z], 0.02, 0xd8b050, true); KW.put(M.metal, tor(0.55, 0.04, 6, 24), x, H - 1.5, z, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8b050);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; KW.put(M.glowWarm, sph(0.08, 8, 6), x + Math.cos(a) * 0.55, H - 1.38, z + Math.sin(a) * 0.55); } KW.put(M.glowWarm, sph(0.16, 10, 8), x, H - 1.6, z); }
  KW.build(root);
  // easel chart (stage right of the witness table, angled toward the dais + camera)
  const easel = new THREE.Group(); easel.position.set(3.2, 0, -0.6); easel.rotation.y = -0.55; root.add(easel); const KE = new Kit();
  KE.beam(M.wood, [-0.55, 0, 0.25], [-0.4, 2.3, 0], 0.04, 0x8a6a4a); KE.beam(M.wood, [0.55, 0, 0.25], [0.4, 2.3, 0], 0.04, 0x8a6a4a); KE.beam(M.wood, [0, 0, -0.55], [0, 2.2, -0.05], 0.035, 0x8a6a4a); KE.box(M.wood, -0.65, 0.65, 0.68, 0.74, 0.1, 0.24, 0x8a6a4a, 0.01);
  KE.box(M.paint, -0.62, 0.62, 2.33, 2.4, -0.02, 0.06, 0x2a2a34, 0.01); KE.build(easel);
  const chart = mesh(easel, plane(1.2, 1.5), M.chart, 0, 1.5, 0.1, -0.08, 0, 0); chart.castShadow = false;
  return { chart, easel };
}

// ================================================================= shoes (local: floor 0, bench top y = BT, bench along x, back wall at z -0.9)
function folderTex(g, w, h) { // manila folder cover, stamped
  g.fillStyle = '#d8b878'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.92 + 0.12 * fbm(u, v, 3, 3, 3, 61));
  g.fillStyle = '#c8a462'; g.fillRect(w * 0.62, 0, w * 0.3, h * 0.07); g.strokeStyle = 'rgba(90,60,30,0.5)'; g.lineWidth = 3; g.strokeRect(4, h * 0.06, w - 8, h * 0.93);
  g.fillStyle = '#f2ead0'; g.fillRect(w * 0.12, h * 0.16, w * 0.5, h * 0.08); txt(g, 'FILE 63-B  ·  TSD', w * 0.37, h * 0.2, w * 0.45, h * 0.04, { col: '#2a2a3a', font: '"DejaVu Sans Mono", monospace', bold: false });
  g.save(); g.translate(w * 0.5, h * 0.5); g.rotate(-0.12); g.strokeStyle = 'rgba(200,36,40,0.88)'; g.lineWidth = 9; g.strokeRect(-w * 0.42, -h * 0.11, w * 0.84, h * 0.22); g.lineWidth = 3; g.strokeRect(-w * 0.39, -h * 0.09, w * 0.78, h * 0.18);
  txt(g, 'OPERATION:', 0, -h * 0.04, w * 0.7, h * 0.07, { col: 'rgba(200,36,40,0.9)', font: SANS }); txt(g, 'BEARD', 0, h * 0.05, w * 0.7, h * 0.1, { col: 'rgba(200,36,40,0.9)', font: SANS }); g.restore();
  g.save(); g.translate(w * 0.7, h * 0.8); g.rotate(0.08); txt(g, 'TOP SECRET', 0, 0, w * 0.5, h * 0.055, { col: 'rgba(200,36,40,0.75)', font: SANS }); g.restore();
  const R = rng(4); g.fillStyle = 'rgba(120,80,40,0.18)'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(w * (0.2 + R() * 0.6), h * (0.3 + R() * 0.5), 30 + R() * 20, 0, 7); g.lineWidth = 6; g.strokeStyle = 'rgba(110,70,30,0.2)'; g.stroke(); } // coffee rings
}
function clothTex(g, w, h) { g.fillStyle = '#cfcac0'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.9 + 0.14 * fbm(u, v, 4, 4, 3, 71)); g.strokeStyle = 'rgba(150,160,180,0.35)'; g.lineWidth = 2; for (let k = 0; k < 9; k++) { g.beginPath(); const y = (k + 0.5) * h / 9; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 12, w * 0.6, y - 12, w, y + 4); g.stroke(); } }
function wallTex(g, w, h) { g.fillStyle = '#2c4a4c'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.86 + 0.2 * fbm(u, v, 3, 3, 4, 81)); g.fillStyle = 'rgba(10,20,30,0.25)'; for (let x = 0; x < w; x += w / 6) g.fillRect(x, 0, 3, h); }
function mapTex(g, w, h) { g.fillStyle = '#e8dcb8'; g.fillRect(0, 0, w, h); g.fillStyle = '#8ab8c8'; g.fillRect(8, 8, w - 16, h - 16); g.fillStyle = '#c8b880';
  g.beginPath(); g.moveTo(w * 0.1, h * 0.45); g.bezierCurveTo(w * 0.35, h * 0.3, w * 0.6, h * 0.42, w * 0.92, h * 0.62); g.lineTo(w * 0.88, h * 0.68); g.bezierCurveTo(w * 0.6, h * 0.55, w * 0.35, h * 0.5, w * 0.12, h * 0.52); g.fill();
  g.strokeStyle = '#c8282e'; g.lineWidth = 4; g.beginPath(); g.arc(w * 0.3, h * 0.44, 14, 0, 7); g.stroke(); txt(g, '?', w * 0.3, h * 0.3, 40, 36, { col: '#c8282e', font: SANS }); }
const BT = 0.76;
function shoe(K, x, z, ry, s) { K.at(x, BT + 0.006, z, ry, () => { const black = 0x1e1a26, sole = 0x2a1e20;
  K.cb(M.paint, 0.098, 0.016, 0.29, 0, 0.008, 0, sole, 0, 0, 0, 0.008); K.cb(M.paint, 0.085, 0.03, 0.07, 0, 0.033, -0.105, sole, 0, 0, 0, 0.008);
  K.put(M.glossy, sph(0.5, 20, 12), 0, 0.022, 0.04, 0, 0, 0, 0.094, 0.07, 0.23, black); K.put(M.glossy, sph(0.5, 18, 12), 0, 0.025, -0.075, 0, 0, 0, 0.094, 0.1, 0.17, black);
  K.put(M.paint, cyl(0.034, 0.034, 0.008, 18), 0, 0.071, -0.08, 0, 0, 0, 1, 1, 1.3, 0x050308); K.put(M.glossy, tor(0.036, 0.007, 6, 20), 0, 0.074, -0.08, Math.PI / 2, 0, 0, 1, 1.3, 1, 0x1e1a26); K.put(M.paint, cyl(0.032, 0.032, 0.004, 18), 0, 0.06, -0.08, 0, 0, 0, 1, 1, 1.3, 0x8a6a50);
  K.cb(M.glossy, 0.05, 0.008, 0.07, 0, 0.07, -0.02, black, -0.3, 0, 0); for (let k = 0; k < 4; k++) K.cb(M.paint, 0.052, 0.004, 0.004, 0, 0.074 - k * 0.005, -0.005 - k * 0.014, 0x2a2430, -0.35, 0, 0, 0.001);
  K.put(M.shine, sph(0.5, 10, 6), s * 0.014, 0.055, 0.1, -0.35, 0, 0, 0.008, 0.004, 0.06); K.put(M.shine, sph(0.5, 8, 6), -s * 0.042, 0.04, -0.1, 0, 0, 0.5, 0.004, 0.02, 0.04); }); }
// a dim shuttered office, early 1960s: walnut desk, venetian blinds (amber light raking through), green banker's lamp, teal walls
function buildShoes(root) {
  const K = new Kit(), R = rng(31), wz = -1.0, wx0 = -0.2, wx1 = 1.4, wy0 = 1.0, wy1 = 2.3;
  K.box(M.wood, -5, 5, -0.05, 0, -3, 4, 0x6a4a3a, 0.01, 4); // floorboards
  K.box(M.wall, -5, wx0, 0, 3.2, wz - 0.1, wz, 0xffffff, 0.01); K.box(M.wall, wx1, 5, 0, 3.2, wz - 0.1, wz, 0xffffff, 0.01); K.box(M.wall, wx0, wx1, 0, wy0, wz - 0.1, wz, 0xffffff, 0.01); K.box(M.wall, wx0, wx1, wy1, 3.2, wz - 0.1, wz, 0xffffff, 0.01);
  K.box(M.paint, -5, 5, 0, 0.12, wz, wz + 0.02, 0x1a2a2c, 0.005); for (const s of [-1, 1]) K.box(M.wall, s * 3 - 0.1, s * 3 + 0.1, 0, 3.2, -3, 4, 0xffffff, 0.01);
  K.box(M.wood, wx0 - 0.08, wx1 + 0.08, wy0 - 0.08, wy0, wz - 0.02, wz + 0.08, 0x5a3a2a, 0.01); K.box(M.wood, wx0 - 0.08, wx1 + 0.08, wy1, wy1 + 0.1, wz - 0.02, wz + 0.06, 0x5a3a2a, 0.01);
  for (const x of [wx0 - 0.04, wx1 + 0.04, (wx0 + wx1) / 2]) K.box(M.wood, x - 0.04, x + 0.04, wy0, wy1, wz - 0.06, wz + 0.04, 0x5a3a2a, 0.01);
  for (let y = wy0 + 0.04; y < wy1 - 0.05; y += 0.055) K.cb(M.paint, wx1 - wx0, 0.006, 0.045, (wx0 + wx1) / 2, y, wz + 0.02, 0xd8c8a0, 0.5, 0, 0, 0.002); // blinds, tilted half open
  K.box(M.paint, wx0, wx1, wy1 - 0.05, wy1, wz, wz + 0.05, 0xc8b890, 0.005); K.beam(M.paint, [wx1 - 0.1, wy1, wz + 0.04], [wx1 - 0.1, wy0 + 0.3, wz + 0.04], 0.004, 0xd8d0b0, true);
  // desk (walnut) with drawers + blotter
  K.box(M.wood, -0.9, 0.9, BT - 0.04, BT, -0.55, 0.45, 0x8a5a3a, 0.01); for (const s of [-1, 1]) { K.box(M.wood, s * 0.88 - 0.36 * (s > 0 ? 1 : 0) - (s < 0 ? 0 : 0), s * 0.88 + (s > 0 ? 0 : 0.36), 0, BT - 0.04, -0.5, 0.4, 0x6a4430, 0.01);
    for (let k = 0; k < 3; k++) { const y = 0.12 + k * 0.22, xc = s * 0.7; K.box(M.wood, xc - 0.15, xc + 0.15, y, y + 0.18, 0.4, 0.42, 0x7a5038, 0.01); K.box(M.metal, xc - 0.04, xc + 0.04, y + 0.08, y + 0.1, 0.42, 0.44, 0xd8b060, 0.003); } }
  K.box(M.paint, -0.55, 0.55, BT, BT + 0.004, -0.4, 0.05, 0x2a4a3e, 0.002); // green blotter
  // white cloth with the shoes (front centre)
  K.cb(M.cloth, 0.5, 0.005, 0.42, -0.02, BT + 0.003, 0.08, 0xffffff, 0, 0.06, 0, 0.002);
  shoe(K, -0.1, 0.1, -0.12, 1); shoe(K, 0.07, 0.06, 0.1, -1);
  // vial + brush
  K.put(M.glass, cyl(0.028, 0.028, 0.11, 16, true), 0.3, BT + 0.055, -0.04); K.put(M.paint, cyl(0.025, 0.025, 0.06, 14), 0.3, BT + 0.03, -0.04, 0, 0, 0, 1, 1, 1, 0xf0f0f8); K.put(M.paint, cyl(0.022, 0.018, 0.03, 12), 0.3, BT + 0.125, -0.04, 0, 0, 0, 1, 1, 1, 0xb88a5a);
  K.at(-0.3, BT, 0.14, 0.9, () => { K.beam(M.wood, [0, 0.014, -0.09], [0, 0.014, 0.05], 0.013, 0xb05a3a, true); K.put(M.metal, cyl(0.015, 0.015, 0.022, 10), 0, 0.014, 0.065, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8b060); K.put(M.paint, cone(0.026, 0.06, 10), 0, 0.014, 0.1, -Math.PI / 2, 0, 0, 1, 1, 0.7, 0xf0e8d8); });
  K.put(M.paint, cyl(0.05, 0.06, 0.002, 16), -0.24, BT + 0.007, 0.14, 0, 0, 0, 1.4, 1, 1, 0xf4f0f8); // spilled powder
  // banker's lamp (brass + green glass shade), left rear
  K.at(-0.5, BT, -0.3, 0.25, () => { K.put(M.metal, cyl(0.08, 0.09, 0.025, 20), 0, 0.012, 0, 0, 0, 0, 1, 1, 0.7, 0xd8b060); K.beam(M.metal, [0, 0.02, 0], [0, 0.33, 0], 0.012, 0xd8b060, true);
    K.put(M.lampShade, cyl(0.09, 0.09, 0.3, 18, true, 0, Math.PI), 0, 0.36, 0.02, 0, 0, Math.PI / 2, 1, 1, 1, 0xffffff); for (const s of [-1, 1]) K.put(M.lampShade, sph(0.09, 12, 8, 0, Math.PI, 0, Math.PI / 2), s * 0.15, 0.36, 0.02, 0, 0, s * Math.PI / 2, 0.02, 1, 1, 0xffffff);
    K.put(M.glowWarm, cyl(0.012, 0.012, 0.22, 8), 0, 0.33, 0.02, 0, 0, Math.PI / 2); K.beam(M.metal, [0.04, 0.3, 0.02], [0.04, 0.2, 0.03], 0.002, 0xd8b060, true); });
  // ashtray + cigarette, rotary phone, coffee cup, pen, papers
  K.put(M.glass, cyl(0.06, 0.05, 0.02, 16), 0.55, BT + 0.01, -0.3); K.put(M.paint, cyl(0.045, 0.045, 0.004, 14), 0.55, BT + 0.012, -0.3, 0, 0, 0, 1, 1, 1, 0x5a5a5a); K.beam(M.paint, [0.53, BT + 0.022, -0.3], [0.6, BT + 0.02, -0.27], 0.004, 0xf4f0e8, true);
  K.at(0.62, BT, -0.05, -0.5, () => { K.box(M.glossy, -0.09, 0.09, 0, 0.06, -0.08, 0.1, 0x1a1a22, 0.02); K.put(M.paint, cyl(0.05, 0.05, 0.01, 18), 0, 0.065, 0.03, -0.35, 0, 0, 1, 1, 1, 0xe8e0d0); K.put(M.glossy, capsule(0.025, 0.17, 4, 8), 0, 0.085, -0.04, 0, 0, Math.PI / 2, 1, 1, 1, 0x1a1a22); });
  K.put(M.paint, cyl(0.04, 0.035, 0.08, 16), -0.7, BT + 0.04, -0.05, 0, 0, 0, 1, 1, 1, 0xe8e4dc); K.put(M.paint, cyl(0.035, 0.035, 0.003, 14), -0.7, BT + 0.078, -0.05, 0, 0, 0, 1, 1, 1, 0x3a2418);
  K.beam(M.paint, [0.38, BT + 0.006, 0.22], [0.5, BT + 0.006, 0.12], 0.005, 0x1a1a22, true); K.box(M.paper, 0.1, 0.4, BT + 0.004, BT + 0.008, -0.42, -0.2, 0xffffff, 0.001);
  // background: filing cabinet, coat rack + hat, a map with a pin, wall clock, chair
  K.box(M.metal, -1.6, -1.1, 0, 1.35, -0.95, -0.35, 0x5a6a6a, 0.02); for (let k = 0; k < 4; k++) { const y = 0.08 + k * 0.32; K.box(M.metal, -1.58, -1.12, y, y + 0.28, -0.35, -0.33, 0x6a7a7a, 0.01); K.box(M.metal, -1.4, -1.3, y + 0.2, y + 0.23, -0.33, -0.31, 0xd8d8e0, 0.004); }
  K.beam(M.wood, [1.9, 0, -0.5], [1.9, 1.8, -0.5], 0.03, 0x4a3020, true); for (let k = 0; k < 3; k++) { const a = k * 2.09; K.beam(M.wood, [1.9 + Math.cos(a) * 0.3, 0, -0.5 + Math.sin(a) * 0.3], [1.9, 0.4, -0.5], 0.015, 0x4a3020, true); }
  K.put(M.paint, cyl(0.17, 0.17, 0.01, 20), 1.95, 1.72, -0.45, 0.2, 0, 0, 1, 1, 1, 0x3a3428); K.put(M.paint, cyl(0.09, 0.1, 0.1, 16), 1.95, 1.78, -0.45, 0.2, 0, 0, 1, 1, 1, 0x3a3428); K.put(M.paint, capsule(0.12, 0.6, 4, 8), 1.85, 1.3, -0.42, 0, 0, 0.05, 1, 1, 0.6, 0x7a6a50); // fedora + trench coat
  K.put(M.paint, cyl(0.14, 0.14, 0.03, 24), -0.8, 2.15, wz + 0.02, Math.PI / 2, 0, 0, 1, 1, 1, 0xf4ecd6); K.put(M.metal, tor(0.14, 0.012, 6, 24), -0.8, 2.15, wz + 0.03, 0, 0, 0, 1, 1, 1, 0xd8b060);
  K.beam(M.paint, [-0.8, 2.15, wz + 0.04], [-0.8, 2.24, wz + 0.04], 0.007, 0x2a1d4a); K.beam(M.paint, [-0.8, 2.15, wz + 0.04], [-0.74, 2.12, wz + 0.04], 0.007, 0x2a1d4a);
  K.at(0, 0, 1.0, Math.PI, () => { K.box(M.leather, -0.25, 0.25, 0.42, 0.5, -0.25, 0.25, 0x5a2a20, 0.05); K.box(M.leather, -0.25, 0.25, 0.5, 1.0, -0.3, -0.18, 0x5a2a20, 0.06); for (const [a, b] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) K.beam(M.wood, [a, 0, b], [a, 0.42, b], 0.025, 0x3a2418, true); });
  K.build(root);
  mesh(root, plane(0.8, 0.55), M.map, -1.05, 1.75, wz + 0.01, 0, 0, 0, false); mesh(root, plane(wx1 - wx0, wy1 - wy0), M.blindLight, (wx0 + wx1) / 2, (wy0 + wy1) / 2, wz - 0.3, 0, 0, 0, false); // the glare behind the blinds
  // the manila folder (own mesh so it can be repainted), right of the shoes
  const KN = new Kit(); KN.cb(M.paper, 0.22, 0.006, 0.29, 0.43, BT + 0.004, 0.1, 0xf4f0e0, 0, -0.22, 0, 0.001); KN.build(root);
  const notes = mesh(root, plane(0.23, 0.3), M.folder, 0.44, BT + 0.009, 0.1, -Math.PI / 2, -0.28, 0, false); notes.receiveShadow = true;
  const label = mesh(root, cyl(0.0285, 0.0285, 0.045, 18, true, -Math.PI / 2 - 0.9, 1.8), M.label, 0.3, BT + 0.055, -0.04, 0, 0, 0, false);
  // dust fx: sparkles + clouds + powder in the shoe openings
  const NS = 70, spk = nond(new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.004, 0), M.sparkle, NS)); spk.frustumCulled = false; root.add(spk);
  const clouds = []; for (let i = 0; i < 5; i++) { const c = nond(mesh(root, sph(0.05, 12, 8), M.puffCloud.clone(), 0, 0, 0, 0, 0, 0, false)); c.visible = false; clouds.push(c); }
  const opens = [[-0.1 + Math.sin(-0.12) * -0.08, 0.1 - Math.cos(-0.12) * 0.08], [0.07 + Math.sin(0.1) * -0.08, 0.06 - Math.cos(0.1) * 0.08]];
  const powder = opens.map(([x, z]) => nond(mesh(root, cyl(0.028, 0.03, 0.004, 16), M.powder, x, BT + 0.072, z, 0, 0, 0, false)));
  return { notes, label, spk, clouds, powder, src: [-0.27, BT + 0.1, 0.2], shoeOpen: opens.map(([x, z]) => [x, BT + 0.082, z]) };
}

// ================================================================= lights, grades, practicals, views
const SET_LIGHT = {
  beach: { top: '#2a76d8', hor: '#bfe8f4', fog: '#cfeaf2', fogN: 60, fogF: 520, sky: '#a8d0f8', ground: '#8a7a92', hemiI: 0.7, fillCol: '#7d98e8', fillI: 0.35, sunCol: '#fff0d0', sunI: 4.4, az: 55, el: 48, disc: '#fffbe8', discSize: 0.004, cloud: '#ffffff', cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0 },
  underwater: { top: '#6fd8e0', hor: '#0b4f72', fog: '#0c5878', fogN: 2, fogF: 38, sky: '#7ad8e0', ground: '#1a3a6a', hemiI: 0.8, fillCol: '#2a6ac0', fillI: 0.35, sunCol: '#d0fff0', sunI: 2.4, az: 180, el: 40, disc: '#f0fff8', discSize: 0.006, clouds: false, stars: 0, cardTint: '#e0f8ff', fxTint: '#e8fff8', shafts: 1.4, aoK: 0.7 },
  senate: { top: '#000000', hor: '#2a2418', fog: '#2a2418', fogN: 18, fogF: 70, sky: '#fff0d8', ground: '#5a3a30', hemiI: 0.95, fillCol: '#8a90d0', fillI: 0.3, sunCol: '#ffe8c0', sunI: 0.9, az: -35, el: 40, disc: '#000000', clouds: false, shadow: false, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  shoes: { top: '#000000', hor: '#0e1a1e', fog: '#0e1c20', fogN: 4, fogF: 16, sky: '#5a9aa0', ground: '#2a2030', hemiI: 0.45, fillCol: '#3a8a9a', fillI: 0.35, sunCol: '#ffb460', sunI: 2.6, az: 168, el: 22, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#ffe8d0', fxTint: '#ffffff', shafts: 0, aoK: 0.7 },
};
const SET_GRADE = {
  beach: { look: 'road', over: { exp: 1.12, con: 1.3, sat: 1.02, lift: [0.03, 0.02, 0.04], vig: [0.2, 0.55, '#4a4a7a'], bloom: [0.35, 0.85] } },
  underwater: { look: 'night', over: { exp: 1.08, con: 1.26, sat: 1.0, lift: [0.02, 0.06, 0.09], gain: [0.94, 1.02, 1.04], tS: ['#1a4a8a', 0.18], tH: ['#c8fff0', 0.06], bloom: [0.5, 0.72], hal: [0.2, '#6affe0'], vig: [0.38, 0.45, '#0a2a5a'] } },
  senate: { look: 'office', over: { exp: 1.5, con: 1.26, lift: [0.05, 0.04, 0.06], tH: ['#ffd8a0', 0.04], bloom: [0.4, 0.8], hal: [0.2, '#ff8a40'], vig: [0.3, 0.5, '#3a2a40'] } },
  shoes: { look: 'night', over: { exp: 1.45, con: 1.32, lift: [0.02, 0.05, 0.06], tS: ['#0e5a6a', 0.22], tH: ['#ffb060', 0.12], bloom: [0.55, 0.72], hal: [0.3, '#ff8a30'], vig: [0.45, 0.4, '#06141a'] } },
};
const SET_PRACT = {
  beach: [],
  underwater: [{ p: [0, 2.6, 1.5], col: '#ffa0d0', I: 0, d: 7, glow: 1 }, { p: [1.8, 3.2, 4.0], col: '#e0fff8', I: 7, d: 9 }, { p: [-6, 5, 4], col: '#7ae8ff', I: 1.2, d: 14 }],
  senate: [{ p: [-6.3, 2.95, 2.3], col: '#fff0d0', I: 7, d: 16 }, { p: [6.3, 2.95, 2.3], col: '#fff0d0', I: 7, d: 16 }, { p: [0, 7.5, -4], col: '#ffd8a0', I: 5, d: 18 }, { p: [0, 7.5, 6], col: '#ffd8a0', I: 4, d: 16 }],
  shoes: [{ p: [-0.5, BT + 0.3, -0.25], col: '#ffb060', I: 2.2, d: 1.8 }, { p: [0.0, BT + 0.25, 0.2], col: '#ffc890', I: 0.2, d: 1.0 }, { p: [1.2, 1.6, 1.4], col: '#3ab8c8', I: 1.4, d: 4 }, { p: [-1.6, 2.4, 0.8], col: '#2a8a9a', I: 0.8, d: 5 }],
};
export function buildReef(ctx) {
  ({ THREE, toon, mkTex, PT } = ctx); NOND = ctx.NOND || null;
  M = materials();
  const groups = {};
  for (const name of SETS) { const g = new THREE.Group(); g.name = 'reef_' + name; g.position.set(...O[name]); g.visible = false; ctx.scene.add(g); groups[name] = g; }
  const be = buildBeach(groups.beach), uw = buildUnder(groups.underwater), se = buildSenate(groups.senate), sh = buildShoes(groups.shoes);
  const spots = {
    // beach (sand y 0)
    beachCentre: W3('beach', [0, 0, 3]), shoreline: W3('beach', [0.5, 0, 0.6]), diverGear: W3('beach', [1.6, 0, 2.6]), besideGear: W3('beach', [0.6, 0, 3.4]), boat: W3('beach', [-3.4, 0, -0.6]), besideBoat: W3('beach', [-2.0, 0, 0.6]),
    palmShade: W3('beach', [-5.2, 0, 4.4]), waterEdge: W3('beach', [-0.6, 0, -1.4]), tank: W3('beach', [1.6, 0.11, 2.35]), fins: W3('beach', [1.75, 0.05, 3.0]),
    // underwater (sand y 0; surface y 15)
    shell: W3('underwater', [0, 0.95, 0]), shellTop: W3('underwater', [0, 2.2, 0]), diver: W3('underwater', [-2.4, 1.4, 1.6]), diver2: W3('underwater', [2.6, 1.8, 2.2]), diverFar: W3('underwater', [-1.5, 3.5, -5]), board: W3('underwater', [-0.4, 3.0, -1.5]), reefFloor: W3('underwater', [0, 0, 3]),
    // senate (floor y 0; dais floor y 0.75, desk top y 1.12)
    witnessChair: W3('senate', [-0.6, 0, 2.05]), witnessChair2: W3('senate', [0.6, 0, 2.05]), witnessTable: W3('senate', [0, 0.76, 1.2]), chartSide: W3('senate', [2.4, 0, -0.1]), chart: W3('senate', [3.2, 1.5, -0.6]),
    senator0: W3('senate', [-6.6, 0.75, -7.0]), senator1: W3('senate', [-4.4, 0.75, -7.0]), senator2: W3('senate', [-2.2, 0.75, -7.0]), senator3: W3('senate', [0, 0.75, -7.0]), senator4: W3('senate', [2.2, 0.75, -7.0]), senator5: W3('senate', [4.4, 0.75, -7.0]), senator6: W3('senate', [6.6, 0.75, -7.0]),
    photographers: W3('senate', [-2.6, 0, -3.0]), photographers2: W3('senate', [3.2, 0, -3.4]), gallery: W3('senate', [0, 0, 5.2]), aisle: W3('senate', [0, 0, 7]),
    // shoes (bench top y 0.92)
    shoeL: W3('shoes', [-0.1, BT, 0.1]), shoeR: W3('shoes', [0.07, BT, 0.06]), vial: W3('shoes', [0.3, BT, -0.04]), folder: W3('shoes', [0.44, BT, 0.1]), brush: W3('shoes', [-0.3, BT, 0.14]), lamp: W3('shoes', [-0.5, BT, -0.3]),
    agent: W3('shoes', [0.1, 0, 0.75]), agent2: W3('shoes', [-0.85, 0, 0.55]), desk: W3('shoes', [0, BT, 0]), window: W3('shoes', [0.6, 1.65, -1.0]),
  };
  const V = (set, p, l, fov, cInf, fp, extra = {}) => { const c = { set, p: W3(set, p), l: W3(set, l), fov, cInf, fp: fp ? W3(set, fp) : null, ...extra }; c.focus = Math.hypot(...[0, 1, 2].map((i) => c.p[i] - (c.fp || c.l)[i])); return c; };
  const views = [
    V('beach', [0.6, 3.2, 13.5], [-0.6, 0.6, -6], 52, 2, [0, 1, 2]),                          // 0 beach wide: cove, palms framing, boat, gear, sea
    V('beach', [3.6, 1.6, 7.4], [-0.6, 0.7, -1.6], 44, 4, [0.8, 0.5, 2.4]),                    // 1 beach medium: gear on the towel, boat behind
    V('beach', [2.3, 0.75, 3.8], [1.55, 0.05, 2.55], 38, 7, [1.6, 0.1, 2.6]),                // 2 beach close: tank + fins + mask
    V('underwater', [0.6, 2.4, 11], [0, 5, -6], 56, 2, [0, 1, 0]),                         // 3 underwater wide: looking up into the god-rays, shell small on the bottom
    V('underwater', [1.8, 1.9, 6.5], [-0.2, 1.4, 0], 46, 4, [0, 1, 0]),                         // 4 underwater medium: shell + diver spots
    V('underwater', [1.6, 2.6, 4.6], [-0.2, 1.9, -0.4], 52, 5, [0, 1, 0], { glow: 0.8, board: 1 }), // 5 shell close + TOO IMPRACTICAL board, glowing
    V('senate', [1.5, 2.6, 12.0], [0, 2.0, -6], 52, 2, [0, 1.2, 1.2], { chart: 0.5 }),          // 6 senate wide from the gallery: dais, emblem, witness table, chart
    V('senate', [-2.6, 1.6, 4.2], [0.8, 1.4, -4], 46, 3.5, [0, 1.0, 1.2], { chart: 1 }),        // 7 senate medium: witness table toward the dais
    V('senate', [1.3, 1.6, 1.6], [3.2, 1.55, -0.6], 44, 5, [3.2, 1.5, -0.6], { chart: 1 }),      // 8 chart close
    V('shoes', [0.55, 1.45, 2.6], [0.1, 1.15, -0.6], 50, 3, [0, 0.9, 0]),                        // 9 office wide: desk, blinds, lamp, cabinet, coat rack, agent spots
    V('shoes', [0.2, 1.12, 0.95], [0.02, 0.8, -0.05], 42, 5, [0, BT + 0.05, 0.05]),            // 10 desk medium: shoes on the cloth, vial, folder, banker's lamp
    V('shoes', [0.06, 1.02, 0.6], [-0.03, 0.8, 0.04], 38, 5, [-0.02, BT + 0.06, 0.06], { dust: 0.6 }), // 11 shoes close with powder sparkle
  ];
  let SHELLGLOW = 0, CHART = -1, DUST = 0, FRAME = 0;
  const chartTexObj = M.chart.map, q = new THREE.Quaternion(), e = new THREE.Euler(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3(), m4 = new THREE.Matrix4();
  const API = {
    groups, origin: O, spots, views, shell: uw.shellG, board: uw.board, chart: se.chart,
    // 0..1: the conch glows (emissive stripes + pink halo + practical); purely a gag glow, never an explosion
    setShellGlow(t) { SHELLGLOW = Math.max(0, Math.min(1, t)); const k = SHELLGLOW; M.shell.emissive.setRGB(0.9 * k, 0.75 * k, 0.8 * k); M.lip.emissive.setRGB(0.8 * k, 0.5 * k, 0.6 * k); M.halo.opacity = 0.22 * k; uw.halo.visible = k > 0.01; },
    setBoard(on) { uw.board.visible = !!on; },
    // 0..1 reveals the tally marks 1..8 on the easel chart
    setChart(t) { t = Math.max(0, Math.min(1, t)); if (Math.abs(t - CHART) < 1e-4) return; CHART = t; const c = chartTexObj.image, g = c.getContext('2d'); chartTex(g, c.width, c.height, t); chartTexObj.needsUpdate = true; },
    // 0..1 powder puffs + sparkle into the shoes (0 = none, ~0.5 = mid-puff, 1 = settled powder glinting in the shoes)
    setDust(t) { DUST = Math.max(0, Math.min(1, t)); API.tick(FRAME); },
    tick(f) { FRAME = f;
      // fish schools
      for (const S of uw.schools) { const a = f * S.sp + S.ph, cx = S.ctr[0] + Math.cos(a) * S.rad, cz = S.ctr[2] + Math.sin(a) * S.rad * 0.6, cy = S.ctr[1] + Math.sin(a * 2.3) * S.h, yaw = Math.atan2(-Math.sin(a) * S.sp, Math.cos(a) * S.sp * 0.6);
        S.off.forEach((o, i) => { const w = Math.sin(f * 0.25 + o[3]) * 0.12; v3.set(cx + o[0] + Math.sin(f * 0.05 + o[3]) * 0.2, cy + o[1] + Math.sin(f * 0.07 + o[3]) * 0.12, cz + o[2]); q.setFromEuler(e.set(0, yaw + w, Math.sin(f * 0.3 + o[3]) * 0.05, 'YXZ')); s3.setScalar(S.sc * o[4]); m4.compose(v3, q, s3); for (const im of S.ims) im.setMatrixAt(i, m4); });
        for (const im of S.ims) im.instanceMatrix.needsUpdate = true; }
      // bubbles: rise, wobble, grow
      uw.bsrc.forEach((b, i) => { const y = (b[3] + f * 0.045 * b[4]) % 13.5, k = y / 13.5; v3.set(b[0] + Math.sin(f * 0.12 + b[5]) * 0.08 * (1 + k * 3), b[1] + y, b[2] + Math.cos(f * 0.1 + b[5]) * 0.08); q.identity(); s3.setScalar(0.5 + b[4] * 0.5 + k * 1.2); m4.compose(v3, q, s3); uw.bub.setMatrixAt(i, m4); }); uw.bub.instanceMatrix.needsUpdate = true;
      // water: caustic drift, surface ripples, ray shimmer, foam lap
      M.reefSand.map.offset.set(Math.sin(f * 0.01) * 0.04, f * 0.0012); M.surface.map.offset.set(f * 0.0015, Math.sin(f * 0.02) * 0.02);
      uw.rays.children.forEach((r) => { r.material.opacity = (0.08 + 0.05 * Math.sin(f * 0.05 + r.userData.ph)) * 1.1; });
      M.foam.map.offset.x = f * 0.0006; be.foam.position.z = -0.6 + Math.sin(f * 0.06) * 0.25; be.foam2.position.z = -3.2 + Math.sin(f * 0.06 + 1.4) * 0.3;
      // dust: sparkles stream from the puff into the openings, clouds swell then fade, powder settles
      const d = DUST, src = sh.src; let n = 0;
      for (let i = 0; i < 70; i++) { const o = sh.shoeOpen[i % 2], ph = (i * 0.137) % 1, tt = Math.min(1, Math.max(0, d * 1.6 - ph * 0.6)); if (d <= 0.001 || (tt >= 1 && d < 0.95 && i % 3)) { m4.makeScale(0, 0, 0); sh.spk.setMatrixAt(i, m4); continue; }
        const ang = i * 2.39996, rr = 0.025 * Math.sqrt((i % 10) / 10), arc = Math.sin(tt * Math.PI) * 0.05;
        v3.set(src[0] + (o[0] - src[0]) * tt + Math.cos(ang) * rr, src[1] + (o[1] - src[1]) * tt + arc + Math.sin(ang) * rr * 0.5, src[2] + (o[2] - src[2]) * tt + Math.sin(ang) * rr);
        const tw = 0.6 + 0.8 * Math.abs(Math.sin(f * 0.4 + i * 1.7)); q.setFromEuler(e.set(f * 0.1 + i, i, 0)); s3.setScalar(tw * (tt >= 1 ? 0.9 : 1.2)); m4.compose(v3, q, s3); sh.spk.setMatrixAt(i, m4); n++; }
      sh.spk.instanceMatrix.needsUpdate = true; sh.spk.visible = n > 0;
      sh.clouds.forEach((c, i) => { const o = sh.shoeOpen[i % 2], k = Math.sin(Math.min(1, d * 1.3) * Math.PI); c.visible = k > 0.02; c.material.opacity = 0.16 * k; c.position.set(o[0] + (i - 2) * 0.03, o[1] + 0.02 + i * 0.012 + d * 0.03, o[2] + ((i * 7) % 3 - 1) * 0.02); c.scale.setScalar(0.35 + d * 0.7 + i * 0.1); });
      M.powder.opacity = Math.min(0.9, d * 1.2);
    },
    lightFor(name) { const base = name === 'beach' ? 'hot' : name === 'underwater' ? 'day' : 'office'; return { ...LIGHTS_[base], ...SET_LIGHT[name] }; },
    gradeFor: (name) => ({ ...((SET_GRADE[name] || {}).over || {}) }),
    lookFor: (name) => (SET_GRADE[name] || {}).look || 'office',
    // show one set (or none); hides the 1904 road/stadium/office/car, D.C. and 1960s rooms when a set is shown
    show(world, name) { for (const k in groups) groups[k].visible = k === name;
      if (name) { for (const k of ['road', 'stadium', 'office', 'car', 'dc']) if (world[k]) world[k].visible = false; if (world.rooms) world.rooms.show(world, null); } },
    placeLights(PRACT, name, tgt) { const Lp = (SET_PRACT[name] || []).map((c) => (c.glow ? { ...c, I: 6 * SHELLGLOW } : c));
      PRACT.forEach((l, i) => { const c = Lp[i]; l.visible = true; if (!c) { l.intensity = 0; return; } l.position.set(...W3(name, c.p)); l.color.set(c.col); l.intensity = c.I; l.distance = c.d; l.decay = 1.6; }); },
    // test-view helper (main.js ?reefview=N; a: view = frame): { i, mod, set, L, look, grade, cam, glow, board, chart, dust }
    viewFor(i, f = 0) { const k = ((i % views.length) + views.length) % views.length, c = views[k];
      return { i: k, mod: API, set: c.set, f, glow: c.glow || 0, board: c.board || 0, chart: c.chart ?? 1, dust: c.dust || 0, L: API.lightFor(c.set), look: API.lookFor(c.set), grade: API.gradeFor(c.set), cam: { p: c.p, l: c.l, fov: c.fov, focus: c.focus, cInf: c.cInf, roll: c.roll || 0, shadowAt: c.fp || c.l } }; },
    apply(world, v) { API.show(world, v.set); API.setShellGlow(v.glow || 0); API.setBoard(v.board); API.setChart(v.chart ?? 1); API.setDust(v.dust || 0); API.tick(v.f ?? FRAME); },
  };
  API.view = API.viewFor; API.tick(0); API.setChart(1);
  return API;
}
