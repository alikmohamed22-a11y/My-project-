// ohio.js [KCH-sets1]: sets for "Ketchup was sold as medicine" (Oddverra short).
//   lecture : Willoughby medical college lecture theatre, c.1835, afternoon: steep curved tiers of wooden benches (student spots),
//             lectern + oil lamp, big hand-painted TOMATO cross-section chart (faux period labels), demo table (basket of tomatoes,
//             glass jars, halved tomato, mortar, scales), chalkboard "TOMATO = MEDICINE?", tall windows with sun shafts + dust,
//             oil-lamp sconces, "WILLOUGHBY MEDICAL COLLEGE" board.                                          origin (-14000, 0, 0)
//   street  : 1830s Ohio / Cleveland street: clapboard + brick storefronts with pictorial signs, APOTHECARY with glowing
//             carboys, general store, market stall piled with tomatoes, boardwalk, hitching rails, oil lanterns, horse + cart.
//             signs(n 0..1) pops the tomato-pill signs/posters; mood('crazy'|'suspicious') = sunny + bunting + tomato banner
//             vs overcast + cool. Set names 'street' (crazy) and 'streetGloom' (suspicious) select the mood too.  origin (-14000, 0, 600)
//   diner   : modern-day diner booth table at golden hour: burger + fries, plain red squeeze bottle "KETCHUP";
//             squeeze(t 0..1) = lift, invert, squeeze, ketchup stream + swirl dollop on the plate.             origin (-14000, 0, 1200)
// Each set: local frame, ground y = 0, camera side +z. All groups start hidden; show(world, name) displays one.
import { Kit } from './world.js';
import { LIGHTS_ } from './story.js';

let THREE, toon, mkTex, PT, NOND, CAM, MACRO;
export const OHIO_ORIGIN = { lecture: [-14000, 0, 0], street: [-14000, 0, 600], diner: [-14000, 0, 1200] };
const O = OHIO_ORIGIN, SETS = Object.keys(O);
const GROUP_OF = { lecture: 'lecture', street: 'street', streetGloom: 'street', diner: 'diner' };
const W3 = (name, p) => { const o = O[GROUP_OF[name] || name]; return [p[0] + o[0], p[1] + o[1], p[2] + o[2]]; };
const INK = '#2b1d4a', TAU = Math.PI * 2;
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const sm = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const backOut = (t) => { const s = 1.9; t -= 1; return t * t * ((s + 1) * t + s) + 1; };

// ---------------------------------------------------------------- geometry helpers
const GC = new Map();
const cached = (k, mk) => { let g = GC.get(k); if (!g) GC.set(k, (g = mk())); return g; };
const cyl = (rt, rb, h, rs = 12, open = false) => cached(`c${rt}|${rb}|${h}|${rs}|${open}`, () => new THREE.CylinderGeometry(rt, rb, h, rs, 1, open));
const sph = (r, ws = 14, hs = 10) => cached(`s${r}|${ws}|${hs}`, () => new THREE.SphereGeometry(r, ws, hs));
const tor = (r, t, rs = 6, ts = 24, arc = TAU) => cached(`t${r}|${t}|${rs}|${ts}|${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));
const plane = (w, h) => cached(`p${w}|${h}`, () => new THREE.PlaneGeometry(w, h));
const planeUV = (w, h, su, sv) => { const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); return g; };
const lathe = (key, pts, n = 20) => cached('la' + key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n));
const mesh = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, shadow = true) => { if (mat.vertexColors && !geo.attributes.color && geo.attributes.position) geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(1), 3)); const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz, 'YXZ'); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
const nond = (o) => { if (NOND) NOND.add(o); o.castShadow = false; return o; };
// lobed tomato: radius 1, slightly squashed, 5 shallow lobes, dimple at the stem
const tomatoGeo = () => cached('tomato', () => { const g = new THREE.SphereGeometry(1, 20, 14), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), r = Math.hypot(x, z), k = 1 + 0.07 * Math.cos(a * 5) * r - 0.12 * Math.max(0, y - 0.75) * 4;
    p.setXYZ(i, x * k, y * 0.78 * (y > 0.85 ? 0.9 : 1), z * k); }
  g.computeVertexNormals(); return g; });
const calyxGeo = () => cached('calyx', () => { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, r = i % 2 ? 0.12 : 0.62; s.lineTo(Math.cos(a) * r, Math.sin(a) * r); } s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false }); g.rotateX(-Math.PI / 2); return g; });
const lumpGeo = (seed, det = 2, rough = 0.22) => cached(`lump${seed}|${det}|${rough}`, () => { const g = new THREE.IcosahedronGeometry(1, det), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), h = Math.sin(x * 5.9898 + y * 7.233 + z * 3.719 + seed * 4.1) * 43758.5453, k = 1 - rough / 2 + rough * (h - Math.floor(h)); p.setXYZ(i, x * k, y * k, z * k); }
  g.computeVertexNormals(); return g; });
const prismGeo = (w, h, d) => cached(`pr${w}|${h}|${d}`, () => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g; });

// ---------------------------------------------------------------- painters
const css = (...a) => PT.css(...a), shade = (...a) => PT.shade(...a), tint = (...a) => PT.tint(...a), rng = (...a) => PT.rng(...a), fbm = (...a) => PT.fbm(...a), modulate = (...a) => PT.modulate(...a), hex = (...a) => PT.hex(...a);
const SERIF = '"DejaVu Serif", Georgia, serif';
function txt(g, s, cx, cy, maxW, sz, o = {}) { g.save(); g.font = `${o.italic ? 'italic ' : ''}${o.bold === false ? '' : 'bold '}${sz | 0}px ${o.font || SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const tw = g.measureText(s).width, sx = Math.min(1, maxW / tw); g.translate(cx, cy); g.scale(sx, 1); if (o.shadow) { g.fillStyle = o.shadow; g.fillText(s, sz * 0.05, sz * 0.05); } if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = sz * 0.08; g.strokeText(s, 0, 0); } g.fillStyle = o.col || INK; g.fillText(s, 0, 0); g.restore(); }
function grain(g, w, h, col, n, seed, a = 0.5) { const R = rng(seed); g.fillStyle = col; for (let i = 0; i < n; i++) { g.globalAlpha = a * R(); g.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2); } g.globalAlpha = 1; }
// invented period handwriting: looping pseudo-copperplate (no real words)
function scrib(g, x, y, w, sz, R, col = 'rgba(50,30,40,0.85)') { g.save(); g.strokeStyle = col; g.lineWidth = Math.max(1.2, sz * 0.08); g.lineCap = 'round'; g.beginPath(); let cx = x; g.moveTo(cx, y);
  while (cx < x + w) { const lw = sz * (0.22 + R() * 0.2), hg = sz * (R() < 0.18 ? 0.95 : R() < 0.12 ? -0.5 : 0.42); g.bezierCurveTo(cx + lw * 0.1, y - hg, cx + lw * 0.9, y - hg, cx + lw * 0.55, y); cx += lw * 0.62; if (R() < 0.13) { cx += sz * 0.4; g.moveTo(cx, y); } }
  g.stroke(); g.restore(); }
function plasterTex(g, w, h, o = {}) { g.fillStyle = o.base || '#ece0c8'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.86 + 0.2 * fbm(u, v, 5, 5, 4, o.seed || 3)); grain(g, w, h, '#6a5040', 1400, 4, 0.25); grain(g, w, h, '#ffffff', 600, 5, 0.25);
  const R = rng(o.seed || 3); g.strokeStyle = 'rgba(110,80,70,0.35)'; g.lineWidth = 1.2; for (let i = 0; i < 6; i++) { g.beginPath(); let x = R() * w, y = R() * h; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (R() - 0.5) * 30; y += 6 + R() * 16; g.lineTo(x, y); } g.stroke(); } }
// cross-section of a tomato into a canvas circle (centre cx,cy radius r) — used by the chart and by the cut-tomato half on the demo table
function tomatoSection(g, cx, cy, r, R, o = {}) { g.save();
  g.fillStyle = '#b8231c'; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); // skin
  g.fillStyle = '#e8463a'; g.beginPath(); g.arc(cx, cy, r * 0.93, 0, TAU); g.fill(); // pericarp
  const n = 4; for (let i = 0; i < n; i++) { const a = i / n * TAU + 0.4, lx = cx + Math.cos(a) * r * 0.5, ly = cy + Math.sin(a) * r * 0.5;
    g.save(); g.translate(lx, ly); g.rotate(a); g.fillStyle = '#f7a066'; g.beginPath(); g.ellipse(0, 0, r * 0.3, r * 0.24, 0, 0, TAU); g.fill(); // locule gel
    g.fillStyle = 'rgba(255,220,150,0.55)'; g.beginPath(); g.ellipse(-r * 0.05, -r * 0.05, r * 0.2, r * 0.12, 0, 0, TAU); g.fill();
    for (let s = 0; s < 9; s++) { const sa = (s / 9) * TAU, sr = r * (0.1 + 0.1 * R()); g.fillStyle = '#f6e4a8'; g.beginPath(); g.ellipse(Math.cos(sa) * sr, Math.sin(sa) * sr * 0.75, r * 0.03, r * 0.018, sa, 0, TAU); g.fill(); g.strokeStyle = 'rgba(120,70,30,0.5)'; g.lineWidth = 1; g.stroke(); }
    g.restore(); }
  g.fillStyle = '#f26a4e'; g.beginPath(); g.arc(cx, cy, r * 0.17, 0, TAU); g.fill(); // core
  g.strokeStyle = '#d23a2e'; g.lineWidth = r * 0.045; for (let i = 0; i < n; i++) { const a = (i + 0.5) / n * TAU + 0.4; g.beginPath(); g.moveTo(cx + Math.cos(a) * r * 0.17, cy + Math.sin(a) * r * 0.17); g.lineTo(cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9); g.stroke(); } // septa
  if (o.ink !== false) { g.strokeStyle = 'rgba(60,20,30,0.75)'; g.lineWidth = Math.max(2, r * 0.018); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke(); }
  g.restore(); }
function chartTex(g, w, h) { PT.paper(g, w, h, { base: '#efe0bc', seed: 31 }); const R = rng(1835);
  modulate(g, w, h, (u, v) => 0.86 + 0.18 * fbm(u, v, 3, 3, 4, 8) - 0.12 * Math.max(0, Math.hypot(u - 0.5, v - 0.5) - 0.38)); // foxing + darker edges
  g.strokeStyle = '#6a2a24'; g.lineWidth = 7; g.strokeRect(26, 26, w - 52, h - 52); g.lineWidth = 2; g.strokeRect(40, 40, w - 80, h - 80);
  txt(g, 'TOMATO', w / 2, 120, w * 0.7, 108, { col: '#6a1e1a', shadow: 'rgba(80,40,20,0.25)' });
  g.strokeStyle = '#6a1e1a'; g.lineWidth = 3; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(w / 2 + s * 120, 192); g.bezierCurveTo(w / 2 + s * 220, 172, w / 2 + s * 300, 212, w / 2 + s * 380, 186); g.stroke(); g.beginPath(); g.arc(w / 2 + s * 385, 186, 7, 0, TAU); g.stroke(); }
  scrib(g, w * 0.3, 230, w * 0.4, 26, R, 'rgba(90,40,30,0.7)');
  const cx = w / 2, cy = h * 0.5, r = w * 0.31;
  g.fillStyle = 'rgba(80,40,20,0.18)'; g.beginPath(); g.ellipse(cx + 12, cy + 16, r, r, 0, 0, TAU); g.fill();
  tomatoSection(g, cx, cy, r, R);
  // stem + calyx drawn above
  g.fillStyle = '#3e7a2e'; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.45; g.beginPath(); g.moveTo(cx, cy - r * 0.98); g.quadraticCurveTo(cx + Math.cos(a) * r * 0.3, cy - r * 0.98 + Math.sin(a) * r * 0.08 - 10, cx + Math.cos(a) * r * 0.36, cy - r * 0.9 + Math.sin(a + 0.3) * r * 0.06); g.quadraticCurveTo(cx + Math.cos(a) * r * 0.1, cy - r * 0.9, cx, cy - r * 0.98); g.fill(); }
  g.strokeStyle = '#2e5a22'; g.lineWidth = 10; g.beginPath(); g.moveTo(cx, cy - r * 0.98); g.quadraticCurveTo(cx + 8, cy - r * 1.1, cx + 26, cy - r * 1.16); g.stroke();
  // leader lines + faux labels
  const lab = [[-0.86, -0.55, 0.12, 0.2], [-0.92, 0.1, 0.06, 0.92], [-0.8, 0.7, 0.2, 0.62], [0.86, -0.42, 0.55, -0.35], [0.92, 0.22, 0.42, 0.18], [0.82, 0.78, 0.6, 0.68]];
  lab.forEach(([lx, ly, tx, ty], i) => { const X = cx + lx * w * 0.47, Y = cy + ly * r, TX = cx + tx * r, TY = cy + ty * r; g.strokeStyle = 'rgba(60,30,30,0.85)'; g.lineWidth = 2; g.beginPath(); g.moveTo(X + (lx < 0 ? 60 : -60), Y); g.lineTo(TX, TY); g.stroke(); g.fillStyle = 'rgba(60,30,30,0.9)'; g.beginPath(); g.arc(TX, TY, 5, 0, TAU); g.fill();
    g.fillStyle = '#6a1e1a'; g.font = `bold 30px ${SERIF}`; g.textAlign = 'center'; g.fillText(['I', 'II', 'III', 'IV', 'V', 'VI'][i], X + (lx < 0 ? 24 : -24), Y - 18); scrib(g, X + (lx < 0 ? -40 : -110), Y + 18, 140, 18, R); });
  // small whole-tomato vignette + leaf sprig
  const sx = w * 0.2, sy = h * 0.85; g.fillStyle = '#c42a20'; g.beginPath(); g.ellipse(sx, sy, 62, 52, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,200,180,0.6)'; g.beginPath(); g.ellipse(sx - 22, sy - 18, 16, 9, -0.6, 0, TAU); g.fill(); g.strokeStyle = 'rgba(60,20,30,0.8)'; g.lineWidth = 3; g.beginPath(); g.ellipse(sx, sy, 62, 52, 0, 0, TAU); g.stroke();
  g.fillStyle = '#3e7a2e'; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.55; g.beginPath(); g.ellipse(sx + Math.cos(a) * 20, sy - 48 + Math.sin(a) * 6 + 8, 22, 6, a, 0, TAU); g.fill(); }
  for (let i = 0; i < 6; i++) { const lx = w * 0.72 + i * 34, ly = h * 0.86 - i * 10; g.fillStyle = i % 2 ? '#4a8a36' : '#3a6e2a'; g.beginPath(); g.ellipse(lx, ly, 26, 12, -0.5 + i * 0.1, 0, TAU); g.fill(); g.strokeStyle = 'rgba(40,60,30,0.8)'; g.lineWidth = 2; g.stroke(); }
  g.strokeStyle = '#2e5a22'; g.lineWidth = 4; g.beginPath(); g.moveTo(w * 0.7, h * 0.88); g.lineTo(w * 0.92, h * 0.8); g.stroke();
  scrib(g, w * 0.32, h * 0.86, w * 0.3, 20, R); scrib(g, w * 0.32, h * 0.9, w * 0.24, 20, R);
  grain(g, w, h, 'rgba(120,80,40,1)', 1600, 9, 0.18); }
function chalkTex(g, w, h) { g.fillStyle = '#26352e'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.85 + 0.3 * fbm(u, v, 4, 2, 4, 12));
  const R = rng(44); g.fillStyle = 'rgba(220,230,220,0.07)'; for (let i = 0; i < 26; i++) { g.beginPath(); g.ellipse(R() * w, R() * h, 40 + R() * 120, 12 + R() * 30, R() * 3, 0, TAU); g.fill(); } // old erased smudges
  const chalk = (s, x, y, sz, mw, col = 'rgba(244,240,226,0.95)') => { for (let k = 0; k < 3; k++) txt(g, s, x + (R() - 0.5) * 2, y + (R() - 0.5) * 2, mw, sz, { col: k ? 'rgba(244,240,226,0.25)' : col, font: SERIF }); };
  chalk('TOMATO =', w * 0.5, h * 0.17, h * 0.2, w * 0.6); chalk('MEDICINE?', w * 0.5, h * 0.4, h * 0.2, w * 0.62);
  g.strokeStyle = 'rgba(244,240,226,0.8)'; g.lineWidth = 4; g.beginPath(); g.moveTo(w * 0.22, h * 0.53); g.quadraticCurveTo(w * 0.5, h * 0.56, w * 0.78, h * 0.52); g.stroke();
  // chalk tomato doodle + arrow + scribbled notes
  g.strokeStyle = 'rgba(240,120,110,0.9)'; g.lineWidth = 5; g.beginPath(); g.ellipse(w * 0.18, h * 0.74, h * 0.11, h * 0.09, 0, 0, TAU); g.stroke(); g.strokeStyle = 'rgba(150,220,140,0.9)'; g.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.5; g.moveTo(w * 0.18, h * 0.65); g.lineTo(w * 0.18 + Math.cos(a) * 26, h * 0.65 + Math.sin(a) * 8 + 8); } g.stroke();
  g.strokeStyle = 'rgba(244,240,226,0.85)'; g.lineWidth = 4; g.beginPath(); g.moveTo(w * 0.3, h * 0.74); g.lineTo(w * 0.42, h * 0.74); g.moveTo(w * 0.4, h * 0.7); g.lineTo(w * 0.43, h * 0.74); g.lineTo(w * 0.4, h * 0.78); g.stroke();
  for (let i = 0; i < 3; i++) scrib(g, w * 0.47, h * (0.68 + i * 0.1), w * (0.3 + R() * 0.15), h * 0.06, R, 'rgba(240,236,220,0.75)');
  grain(g, w, h, 'rgba(240,240,230,1)', 900, 3, 0.12); }
function signTex(g, w, h, lines, o = {}) { PT.planks(g, w, h, { base: o.base || '#2a4a3a', n: 3, seed: o.seed || 7, joints: 0 }); g.strokeStyle = o.trim || '#e8c870'; g.lineWidth = h * 0.05; g.strokeRect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16); g.lineWidth = h * 0.015; g.strokeRect(h * 0.16, h * 0.16, w - h * 0.32, h - h * 0.32);
  const L = Array.isArray(lines) ? lines : [lines], n = L.length; L.forEach((s, i) => txt(g, s, w / 2, h * (0.5 + (i - (n - 1) / 2) * (0.62 / n + 0.06)), w * 0.84, h * (n > 1 ? 0.62 / n : 0.5), { col: o.col || '#f6e2a8', shadow: 'rgba(10,10,30,0.55)' }));
  modulate(g, w, h, (u, v) => 0.9 + 0.14 * fbm(u, v, 4, 2, 3, 5)); }
// paper poster / handbill: big headline lines + a tomato vignette + faux small print
function posterTex(g, w, h, lines, o = {}) { PT.paper(g, w, h, { base: o.base || '#f2e6c4', seed: o.seed || 3 }); const R = rng(o.seed || 3); modulate(g, w, h, (u, v) => 0.88 + 0.16 * fbm(u, v, 3, 3, 3, o.seed || 3));
  g.strokeStyle = o.ink || '#3a1a20'; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28); g.lineWidth = 2; g.strokeRect(24, 24, w - 48, h - 48);
  let y = h * 0.12; lines.forEach(([s, sz, col]) => { const H = h * sz; txt(g, s, w / 2, y + H / 2, w * 0.84, H * 0.86, { col: col || o.ink || '#3a1a20' }); y += H * 1.08; });
  if (o.tomato !== false) { const cx = w / 2, cy = y + (h * 0.92 - y) * 0.45, r = Math.min(w * 0.2, (h * 0.92 - y) * 0.36); g.fillStyle = '#c8281e'; g.beginPath(); g.ellipse(cx, cy, r, r * 0.86, 0, 0, TAU); g.fill(); g.strokeStyle = '#3a1a20'; g.lineWidth = 3; g.stroke(); g.fillStyle = 'rgba(255,220,200,0.7)'; g.beginPath(); g.ellipse(cx - r * 0.35, cy - r * 0.3, r * 0.22, r * 0.1, -0.6, 0, TAU); g.fill();
    g.fillStyle = '#3a7a2a'; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.55; g.beginPath(); g.ellipse(cx + Math.cos(a) * r * 0.3, cy - r * 0.8 + Math.sin(a) * 4 + 6, r * 0.3, r * 0.08, a, 0, TAU); g.fill(); }
    for (const s of [-1, 1]) { g.fillStyle = '#e8d8b0'; g.strokeStyle = '#3a1a20'; g.lineWidth = 2; g.beginPath(); g.ellipse(cx + s * r * 1.6, cy + r * 0.3, r * 0.22, r * 0.22, 0, 0, TAU); g.fill(); g.stroke(); } // pills
    for (let i = 0; i < 3; i++) scrib(g, w * 0.16, h * 0.92 - 8 - (2 - i) * 16, w * 0.68, 12, R, 'rgba(50,30,40,0.6)'); }
  grain(g, w, h, 'rgba(120,80,40,1)', 800, 9, 0.18); }
function shaftTex(g, w, h) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); const R = rng(4); const d = g.getImageData(0, 0, w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const u = x / w, v = 1 - y / h, k = Math.pow(Math.sin(Math.PI * u), 2) * Math.pow(1 - v, 1.4) * Math.min(1, v * 12) * (0.8 + 0.2 * Math.sin(u * 37 + Math.sin(u * 11) * 3)); const i = (y * w + x) * 4; d.data[i] = d.data[i + 1] = d.data[i + 2] = 255 * k; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0); }
function glowTex(g, w, h) { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
function flameTex(g, w, h) { g.clearRect(0, 0, w, h); const gr = g.createRadialGradient(w / 2, h * 0.7, 0, w / 2, h * 0.6, w * 0.5); gr.addColorStop(0, 'rgba(255,255,230,1)'); gr.addColorStop(0.35, 'rgba(255,200,90,1)'); gr.addColorStop(0.7, 'rgba(255,110,40,0.8)'); gr.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(w / 2, 0); g.bezierCurveTo(w * 0.85, h * 0.4, w * 0.95, h * 0.75, w / 2, h * 0.98); g.bezierCurveTo(w * 0.05, h * 0.75, w * 0.15, h * 0.4, w / 2, 0); g.fill(); }
function glassTex(g, w, h, o = {}) { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, o.a || '#3a4a78'); gr.addColorStop(0.5, o.b || '#24305a'); gr.addColorStop(1, o.a || '#3a4a78'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(220,230,255,0.35)'; for (const [x, k] of [[0.2, 0.12], [0.36, 0.05], [0.7, 0.08]]) { g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * (x + k), 0); g.lineTo(w * (x + k - 0.3), h); g.lineTo(w * (x - 0.3), h); g.fill(); } }
function outsideTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8ab4e8'); gr.addColorStop(0.55, '#f4e0b0'); gr.addColorStop(1, '#ffe8c0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = rng(8);
  for (let i = 0; i < 26; i++) { const x = R() * w, y = h * (0.45 + R() * 0.2), r = w * (0.04 + R() * 0.06); g.fillStyle = ['#7aa860', '#8ab868', '#6a9a58', '#a0c070'][(R() * 4) | 0]; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  g.fillStyle = '#c8b890'; g.fillRect(0, h * 0.62, w, h); g.fillStyle = '#e8dcc0'; for (let i = 0; i < 4; i++) { const x = w * (0.1 + i * 0.25), bw = w * 0.12; g.fillRect(x, h * 0.5, bw, h * 0.14); g.fillStyle = '#b05a40'; g.beginPath(); g.moveTo(x - 6, h * 0.5); g.lineTo(x + bw / 2, h * 0.43); g.lineTo(x + bw + 6, h * 0.5); g.fill(); g.fillStyle = '#e8dcc0'; } }
function basketTex(g, w, h) { g.fillStyle = '#a87a40'; g.fillRect(0, 0, w, h); const n = 16, m = 8; for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const x = i * w / n, y = j * h / m, up = (i + j) % 2; g.fillStyle = up ? '#c8984e' : '#8a5e2e'; g.beginPath(); g.ellipse(x + w / n / 2, y + h / m / 2, w / n * 0.48, h / m * 0.42, 0, 0, TAU); g.fill(); }
  g.strokeStyle = 'rgba(60,30,20,0.55)'; g.lineWidth = 2; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * w / n, 0); g.lineTo(i * w / n, h); g.stroke(); } }
function bookTex(g, w, h) { const R = rng(12); let x = 0; while (x < w) { const bw = 10 + R() * 22, c = ['#7a2a24', '#2a4a3a', '#3a3060', '#8a6a30', '#5a3020', '#6a2a4a'][(R() * 6) | 0]; g.fillStyle = c; const top = R() * h * 0.15; g.fillRect(x, top, bw - 2, h - top); g.fillStyle = 'rgba(240,200,120,0.75)'; for (const yy of [0.2, 0.8]) g.fillRect(x + 2, top + (h - top) * yy, bw - 6, 3); x += bw; } }
function dinerOutTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6a70c0'); gr.addColorStop(0.45, '#f0a070'); gr.addColorStop(0.7, '#ffd090'); gr.addColorStop(1, '#8a6a70'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = rng(17);
  g.fillStyle = 'rgba(255,240,200,0.9)'; g.beginPath(); g.arc(w * 0.3, h * 0.62, w * 0.06, 0, TAU); g.fill();
  for (let i = 0; i < 9; i++) { const x = R() * w, bw = w * (0.08 + R() * 0.14), bh = h * (0.12 + R() * 0.2); g.fillStyle = '#9a6a7a'; g.fillRect(x, h * 0.72 - bh, bw, bh + h); g.fillStyle = 'rgba(255,210,140,0.8)'; for (let k = 0; k < 6; k++) g.fillRect(x + bw * (0.15 + 0.3 * (k % 3)), h * 0.72 - bh * (0.8 - 0.3 * ((k / 3) | 0)), bw * 0.12, bh * 0.08); }
  g.fillStyle = '#3a2a40'; g.fillRect(0, h * 0.78, w, h); for (let i = 0; i < 40; i++) { const c = ['255,200,120', '255,160,90', '255,230,180', '200,220,255'][(R() * 4) | 0], x = R() * w, y = h * (0.55 + R() * 0.3), r = 6 + R() * 22; const gg = g.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, `rgba(${c},0.9)`); gg.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } }
function labelTex(g, w, h) { g.fillStyle = '#f4ead2'; g.fillRect(0, 0, w, h); g.fillStyle = '#b81a14'; g.fillRect(0, 0, w, h * 0.1); g.fillRect(0, h * 0.9, w, h * 0.1);
  const cx = w * 0.5; txt(g, 'KETCHUP', cx, h * 0.62, w * 0.42, h * 0.3, { col: '#9a1410', font: SERIF });
  g.fillStyle = '#c8281e'; g.beginPath(); g.ellipse(cx, h * 0.3, h * 0.11, h * 0.095, 0, 0, TAU); g.fill(); g.fillStyle = '#3a7a2a'; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.55; g.beginPath(); g.ellipse(cx + Math.cos(a) * 10, h * 0.21 + Math.sin(a) * 3 + 2, 12, 4, a, 0, TAU); g.fill(); }
  g.strokeStyle = '#9a1410'; g.lineWidth = 3; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * w * 0.06, h * 0.3); g.lineTo(cx + s * w * 0.2, h * 0.3); g.stroke(); } }
function vinylTex(g, w, h) { g.fillStyle = '#b02a2a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { const x = (i + 0.5) * w / 4; const gr = g.createLinearGradient(x - w / 8, 0, x + w / 8, 0); gr.addColorStop(0, 'rgba(60,0,10,0.35)'); gr.addColorStop(0.5, 'rgba(255,200,200,0.25)'); gr.addColorStop(1, 'rgba(60,0,10,0.35)'); g.fillStyle = gr; g.fillRect(x - w / 8, 0, w / 4, h); } }
function checkTex(g, w, h) { const n = 8, s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? '#e8e0d0' : '#2a2a3a'; g.fillRect(i * s, j * s, s, s); } modulate(g, w, h, (u, v) => 0.9 + 0.12 * fbm(u, v, 4, 4, 3, 2)); }
function bannerTex(g, w, h) { PT.fabric(g, w, h, { base: '#f2e6c8' }); g.fillStyle = '#c8281e'; g.fillRect(0, 0, w, h * 0.12); g.fillRect(0, h * 0.88, w, h * 0.12); const R = rng(5);
  for (const [cx, r] of [[w * 0.5, h * 0.3], [w * 0.2, h * 0.2], [w * 0.8, h * 0.2]]) { const cy = h * 0.52; g.fillStyle = '#c8281e'; g.beginPath(); g.ellipse(cx, cy, r * 1.1, r * 0.95, 0, 0, TAU); g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); g.fillStyle = 'rgba(255,220,200,0.7)'; g.beginPath(); g.ellipse(cx - r * 0.4, cy - r * 0.35, r * 0.25, r * 0.12, -0.6, 0, TAU); g.fill();
    g.fillStyle = '#3a8a2a'; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.55; g.beginPath(); g.ellipse(cx + Math.cos(a) * r * 0.3, cy - r * 0.85 + Math.sin(a) * 4 + 6, r * 0.32, r * 0.09, a, 0, TAU); g.fill(); } }
  g.fillStyle = '#3a8a2a'; for (let i = 0; i < 18; i++) { const x = w * (0.04 + i * 0.054); g.beginPath(); g.ellipse(x, h * 0.12, 9, 5, R(), 0, TAU); g.fill(); } }
function pennantTex(g, w, h, cols) { g.clearRect(0, 0, w, h); cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * h / cols.length, w, h / cols.length + 1); }); }
function flagTex(g, w, h) { for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#f4f0e4' : '#c8302a'; g.fillRect(0, i * h / 13, w, h / 13 + 1); } g.fillStyle = '#2a3a8a'; g.fillRect(0, 0, w * 0.42, h * 7 / 13); g.fillStyle = '#f4f0e4'; for (let i = 0; i < 24; i++) { const x = w * 0.42 * ((i % 6) + 0.5) / 6, y = h * 7 / 13 * (((i / 6) | 0) + 0.5) / 4; g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill(); } modulate(g, w, h, (u, v) => 0.92 + 0.1 * fbm(u, v, 3, 3, 2, 3)); }
// pictorial trade-sign boards (no words): mortar & pestle, barrel+sack, boot, loaf
function pictoTex(g, w, h, kind) { PT.planks(g, w, h, { base: '#2a3a5a', n: 2, seed: 4, joints: 0 }); g.strokeStyle = '#e8c870'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20); const cx = w / 2, cy = h / 2, s = h * 0.36; g.fillStyle = '#e8c870'; g.strokeStyle = '#1a1424'; g.lineWidth = 4;
  if (kind === 'mortar') { g.beginPath(); g.moveTo(cx - s, cy - s * 0.2); g.quadraticCurveTo(cx - s, cy + s, cx, cy + s); g.quadraticCurveTo(cx + s, cy + s, cx + s, cy - s * 0.2); g.closePath(); g.fill(); g.stroke(); g.save(); g.translate(cx + s * 0.2, cy - s * 0.5); g.rotate(0.5); g.fillRect(-s * 0.12, -s * 0.8, s * 0.24, s * 1.1); g.strokeRect(-s * 0.12, -s * 0.8, s * 0.24, s * 1.1); g.restore(); }
  else if (kind === 'goods') { g.fillStyle = '#c89a58'; g.fillRect(cx - s * 1.2, cy - s * 0.7, s * 1.0, s * 1.5); g.strokeRect(cx - s * 1.2, cy - s * 0.7, s * 1.0, s * 1.5); g.fillStyle = '#1a1424'; for (const y of [-0.4, 0.4]) g.fillRect(cx - s * 1.2, cy + y * s, s, 6); g.fillStyle = '#e8dcc0'; g.beginPath(); g.ellipse(cx + s * 0.55, cy + s * 0.15, s * 0.55, s * 0.7, 0, 0, TAU); g.fill(); g.stroke(); g.beginPath(); g.moveTo(cx + s * 0.3, cy - s * 0.55); g.lineTo(cx + s * 0.8, cy - s * 0.55); g.stroke(); }
  else if (kind === 'boot') { g.beginPath(); g.moveTo(cx - s * 0.5, cy - s); g.lineTo(cx + s * 0.1, cy - s); g.lineTo(cx + s * 0.1, cy + s * 0.3); g.lineTo(cx + s * 1.0, cy + s * 0.5); g.lineTo(cx + s * 1.0, cy + s * 0.9); g.lineTo(cx - s * 0.6, cy + s * 0.9); g.closePath(); g.fill(); g.stroke(); }
  else { g.beginPath(); g.ellipse(cx, cy + s * 0.1, s * 1.2, s * 0.6, 0, Math.PI, 0); g.lineTo(cx + s * 1.2, cy + s * 0.5); g.lineTo(cx - s * 1.2, cy + s * 0.5); g.closePath(); g.fill(); g.stroke(); for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(cx + i * s * 0.5 - 10, cy - s * 0.2); g.lineTo(cx + i * s * 0.5 + 10, cy + s * 0.1); g.stroke(); } } }

// ---------------------------------------------------------------- materials
let M;
function materials() {
  const vc = (o = {}) => toon({ vertexColors: true, ...o }), T = (w, h, fn, rep) => mkTex(w, h, fn, rep), m = {}, basic = (map, k = 1.2) => { const b = new THREE.MeshBasicMaterial({ map, fog: false }); b.color.setScalar(k); return b; };
  const em = (map, e = 0x241c14, o = {}) => { const x = toon({ map, emissive: e, ...o }); x.emissiveMap = map; return x; };
  m.paint = vc(); m.metal = vc({ emissive: 0x0c0c12 }); m.brass = vc({ emissive: 0x3a2408 });
  m.floor = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#9a6a44', n: 6, seed: 21 })) }); if (MACRO) MACRO(m.floor, 0.12, 0.05);
  m.wood = vc({ map: T(256, 256, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 4, seed: 33, joints: 0 })) });
  m.woodV = vc({ map: T(256, 256, (g, w, h) => { PT.planks(g, w, h, { base: '#8a5a38', n: 5, seed: 37 }); }) });
  m.plaster = vc({ map: T(512, 512, plasterTex) });
  m.clap = vc({ map: T(512, 512, (g, w, h) => PT.siding(g, w, h, { base: '#f2ece0', n: 14, seed: 5 })) });
  m.brick = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#b45a40', seed: 9 })) });
  m.road = vc({ map: T(512, 512, (g, w, h) => { PT.dirt(g, w, h, { base: '#a88a64', ruts: [], seed: 3 }); g.fillStyle = 'rgba(168,138,100,0.55)'; g.fillRect(0, 0, w, h); for (const v of [0.3, 0.42, 0.62, 0.74]) { g.strokeStyle = 'rgba(80,60,50,0.22)'; g.lineWidth = 9; g.beginPath(); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * v + 3 * Math.sin(x * 0.03 + v * 9)); g.stroke(); } modulate(g, w, h, (u, v) => 0.9 + 0.16 * fbm(u, v, 3, 3, 3, 21)); }, [1, 1]) }); if (MACRO) MACRO(m.road, 0.18, 0.04);
  m.shingle = vc({ map: T(256, 256, (g, w, h) => PT.shingles(g, w, h, { base: '#6a5a5a', seed: 3 })) });
  m.glass = toon({ map: T(256, 256, glassTex), emissive: 0x101830 });
  m.chart = em(T(1024, 1280, chartTex), 0x3a2a18, { side: THREE.DoubleSide }); m.chalk = em(T(1024, 512, chalkTex), 0x1a1a14);
  m.college = em(T(2048, 220, (g, w, h) => signTex(g, w, h, 'WILLOUGHBY MEDICAL COLLEGE', { base: '#3a2418', trim: '#d8b050', col: '#f0d890' })), 0x2a1c10);
  m.outside = basic(T(512, 512, outsideTex), 1.6); m.dinerOut = basic(T(1024, 512, dinerOutTex), 1.1);
  m.tomato = toon({ color: 0xffffff, vertexColors: true, emissive: 0x2a0404 }); m.leaf = toon({ color: 0xffffff, vertexColors: true, side: THREE.DoubleSide });
  m.cut = toon({ map: T(256, 256, (g, w, h) => { g.fillStyle = '#b8231c'; g.fillRect(0, 0, w, h); tomatoSection(g, w / 2, h / 2, w * 0.49, rng(3), { ink: false }); }), emissive: 0x200404 }); m.cut.emissiveMap = m.cut.map;
  m.basket = vc({ map: T(256, 128, basketTex, [3, 1]), side: THREE.DoubleSide });
  m.jar = toon({ color: 0xcfe8e0, transparent: true, opacity: 0.38, depthWrite: false, emissive: 0x18302a }); m.liquid = toon({ vertexColors: true, emissive: 0x200804 });
  m.books = vc({ map: T(512, 128, bookTex) });
  m.dark = new THREE.MeshBasicMaterial({ color: 0x1a1024 });
  m.glow = new THREE.MeshBasicMaterial({ map: T(128, 128, glowTex), color: 0xffc070, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  m.flame = new THREE.MeshBasicMaterial({ map: T(128, 256, flameTex), transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide }); m.flame.color.setScalar(1.8);
  m.lampGlass = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd890).multiplyScalar(2.0), fog: false });
  m.shaft = new THREE.MeshBasicMaterial({ map: T(128, 256, shaftTex), color: 0xffdca8, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  m.dust = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0d0).multiplyScalar(1.3), transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  m.carboy = [0xff2a1a, 0x22e070, 0xffa818, 0x3a7aff].map((c) => toon({ color: c, emissive: c, emissiveIntensity: 1.25 }));
  m.carboyGlow = [0xff4030, 0x40ff80, 0xffb030, 0x5080ff].map((c) => new THREE.MeshBasicMaterial({ map: m.glow.map, color: c, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  m.hi = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, fog: false });
  m.winLit = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc070).multiplyScalar(1.3) });
  m.pict = ['mortar', 'goods', 'boot', 'loaf'].reduce((o, k) => { o[k] = em(T(256, 256, (g, w, h) => pictoTex(g, w, h, k)), 0x1a1410, { side: THREE.DoubleSide }); return o; }, {});
  m.apoth = em(T(1536, 220, (g, w, h) => signTex(g, w, h, 'APOTHECARY', { base: '#2a2a4a', trim: '#e0b850' })), 0x221a10);
  m.awning = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#f0e6d0', stripes: '#3a6a3a', nStripes: 8 })), side: THREE.DoubleSide });
  m.awningR = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#f0e6d0', stripes: '#b8281e', nStripes: 8 })), side: THREE.DoubleSide });
  m.canvas = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#e8dcc0' })), side: THREE.DoubleSide });
  m.banner = toon({ map: T(1024, 256, bannerTex), side: THREE.DoubleSide, emissive: 0x1a1008 }); m.banner.emissiveMap = m.banner.map;
  m.bunt = toon({ vertexColors: true, side: THREE.DoubleSide }); m.flag = toon({ map: T(192, 128, flagTex), side: THREE.DoubleSide });
  const SIGN = (lines, o, w = 1024, h = 256) => em(T(w, h, (g, W, H) => signTex(g, W, H, lines, o)), 0x2a2014, { side: THREE.DoubleSide });
  const POST = (lines, o, w = 512, h = 768) => em(T(w, h, (g, W, H) => posterTex(g, W, H, lines, o)), 0x2a2418, { side: THREE.DoubleSide });
  m.sg = {
    sold: SIGN('TOMATO PILLS SOLD HERE', { base: '#7a1a18', col: '#f8e8b8' }), sold2: SIGN('TOMATO PILLS SOLD HERE', { base: '#1e3a2a', col: '#f8e0a0', seed: 9 }),
    soldBoard: SIGN(['TOMATO PILLS', 'SOLD HERE'], { base: '#2a2a4a', col: '#ffe8a8', seed: 3 }, 512, 512),
    cures: SIGN('CURES ALL YOUR ILLS!', { base: '#c8a040', col: '#5a1410', trim: '#5a1410', seed: 5 }),
    miles: POST([["DR. MILES'", 0.1, '#8a1a14'], ['COMPOUND EXTRACT', 0.075], ['OF TOMATO', 0.1, '#8a1a14'], ['THE GENUINE!', 0.06]], { seed: 11 }),
    phelps: POST([["PHELPS'", 0.12, '#1e3a6a'], ['TOMATO PILLS', 0.1, '#8a1a14'], ['CURES ALL YOUR ILLS!', 0.055], ['BEWARE IMITATIONS!', 0.05, '#1e3a6a']], { seed: 13, base: '#f4ead0' }),
    genuine: SIGN('THE GENUINE!', { base: '#8a1a14', col: '#f8e8b8', seed: 15 }, 768, 192), beware: SIGN('BEWARE IMITATIONS!', { base: '#1e2a4a', col: '#f8e8b8', seed: 17 }, 1024, 192),
  };
  // diner
  m.table = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#a8703e', n: 5, seed: 41, joints: 0 })) });
  m.vinyl = vc({ map: T(256, 256, vinylTex) }); m.check = vc({ map: T(256, 256, checkTex, [6, 6]) }); m.chrome = vc({ emissive: 0x202028 });
  m.plate = toon({ color: 0xfaf6ee, emissive: 0x1a1814 }); m.bottle = toon({ color: 0xd8180e, emissive: 0x3a0402 }); m.label = toon({ map: T(512, 256, labelTex), emissive: 0x2a2418 }); m.label.emissiveMap = m.label.map;
  m.ketchup = toon({ color: 0xc0140c, emissive: 0x500402 }); m.food = vc({ emissive: 0x140a04 });
  m.neon = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff6a8a).multiplyScalar(1.8), fog: false });
  return m;
}

// ---------------------------------------------------------------- shared props
function tomato(K, x, y, z, r, R, c) { const col = c ?? [0xd8261c, 0xe03a20, 0xc81e18, 0xe85a24, 0xb81a16][(R() * 5) | 0]; K.put(M.tomato, tomatoGeo(), x, y, z, (R() - 0.5) * 0.4, R() * TAU, (R() - 0.5) * 0.4, r, r, r, col); K.put(M.leaf, calyxGeo(), x, y + r * 0.74, z, 0, R() * TAU, 0, r, r * 1.5, r, 0x3a8a2a); }
function tomatoPile(K, cx, cy, cz, w, d, layers, r, R) { for (let l = 0; l < layers; l++) { const nx = Math.max(1, Math.floor((w - l * r) / (r * 2.05))), nz = Math.max(1, Math.floor((d - l * r) / (r * 2.05)));
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) tomato(K, cx + (i - (nx - 1) / 2) * r * 2.05 + (R() - 0.5) * r * 0.3, cy + r * 0.78 + l * r * 1.3, cz + (j - (nz - 1) / 2) * r * 2.05 + (R() - 0.5) * r * 0.3, r * (0.9 + R() * 0.2), R); } }
function oilLamp(K, x, y, z, s = 1) { K.at(x, y, z, 0, () => { K.put(M.brass, lathe('olb', [[0.001, 0], [0.09, 0], [0.1, 0.02], [0.04, 0.06], [0.035, 0.16], [0.09, 0.2], [0.1, 0.27], [0.06, 0.31], [0.001, 0.32]], 14), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xc89848);
  K.put(M.lampGlass, lathe('olg', [[0.03, 0.31], [0.07, 0.38], [0.06, 0.45], [0.035, 0.52], [0.035, 0.64], [0.03, 0.66]], 12), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xffffff); }, s); }
function sconce(K, x, y, z, ry) { K.at(x, y, z, ry, () => { K.box(M.brass, -0.08, 0.08, -0.2, 0.2, 0, 0.03, 0xb88a40, 0.01); K.beam(M.brass, [0, -0.05, 0.03], [0, -0.1, 0.25], 0.02, 0xb88a40, true, 6); oilLamp(K, 0, -0.12, 0.27, 0.9); }); }
function carboy(root, x, y, z, s, k) { const g = lathe('carboy', [[0.001, 0], [0.16, 0.01], [0.3, 0.1], [0.35, 0.28], [0.31, 0.46], [0.18, 0.57], [0.08, 0.63], [0.065, 0.86], [0.1, 0.9], [0.001, 0.92]], 24);
  const m = mesh(root, g, M.carboy[k], x, y, z, 0, 0, 0, false); m.scale.setScalar(s); const st = mesh(root, sph(0.09, 12, 8), M.carboy[k], x, y + 0.98 * s, z, 0, 0, 0, false); st.scale.setScalar(s);
  const hi = nond(mesh(root, plane(0.035, 0.26), M.hi, x - 0.17 * s, y + 0.3 * s, z + 0.32 * s, 0, 0, 0.15, false)); hi.scale.setScalar(s);
  const gl = nond(mesh(root, plane(1, 1), M.carboyGlow[k].clone(), x, y + 0.32 * s, z + 0.1, 0, 0, 0, false)); gl.scale.setScalar(s * 2.6); gl.renderOrder = 6; return gl; }
function glowAt(root, p, size, col, op = 0.5) { const m = M.glow.clone(); m.color.set(col); m.opacity = op; const g = nond(mesh(root, plane(size, size), m, ...p, 0, 0, 0, false)); g.renderOrder = 6; g.userData.op = op; return g; }

// ================================================================= LECTURE THEATRE
function buildLecture(root) {
  const R = rng(1835), K = new Kit(), X = 9.4, ZB = -7.6, ZF = 9.6, H = 8.2, C = [0, -3.6];
  const tierR = (i) => 5.3 + i * 0.95, tierH = (i) => (i + 1) * 0.55, NT = 7;
  // pit floor + room shell (walls cast shadows so the sun only enters by the windows)
  mesh(root, planeUV(2 * X, ZF - ZB, X / 2.5, (ZF - ZB) / 5), M.floor, 0, 0, (ZB + ZF) / 2, -Math.PI / 2, 0, 0, false);
  K.box(M.plaster, -X, X, 0, H, ZB - 0.4, ZB, 0xfff6ea, 0.02); K.box(M.plaster, -X, X, 0, H, ZF, ZF + 0.4, 0xf0e6d6, 0.02); K.box(M.wood, -X - 0.4, X + 0.4, H, H + 0.4, ZB - 0.4, ZF + 0.4, 0x6a4a34, 0.02);
  K.box(M.plaster, X, X + 0.4, 0, H, ZB, ZF, 0xf4eadb, 0.02);
  // left wall with three tall windows (z centres), sill 1.3, head 5.8
  const WZ = [-4.6, -1.0, 2.6], WW = 1.6, S0 = 1.3, S1 = 5.8; let zc = ZB; for (const wz of WZ) { K.box(M.plaster, -X - 0.4, -X, 0, H, zc, wz - WW / 2, 0xf4eadb, 0.02); zc = wz + WW / 2; } K.box(M.plaster, -X - 0.4, -X, 0, H, zc, ZF, 0xf4eadb, 0.02);
  for (const wz of WZ) { K.box(M.plaster, -X - 0.4, -X, 0, S0, wz - WW / 2, wz + WW / 2, 0xf4eadb, 0.02); K.box(M.plaster, -X - 0.4, -X, S1, H, wz - WW / 2, wz + WW / 2, 0xf4eadb, 0.02);
    K.box(M.wood, -X - 0.05, -X + 0.12, S0 - 0.08, S0, wz - WW / 2 - 0.1, wz + WW / 2 + 0.1, 0x5a3a24, 0.01); // sill
    for (const dz of [-WW / 2, 0, WW / 2]) K.box(M.wood, -X - 0.25, -X - 0.15, S0, S1, wz + dz - 0.04, wz + dz + 0.04, 0x4a2e1e, 0.005);
    for (let k = 1; k < 6; k++) K.box(M.wood, -X - 0.25, -X - 0.15, S0 + k * (S1 - S0) / 6 - 0.03, S0 + k * (S1 - S0) / 6 + 0.03, wz - WW / 2, wz + WW / 2, 0x4a2e1e, 0.005);
    K.cb(M.canvas, 0.08, 4.8, 0.5, -X + 0.15, 3.5, wz - WW / 2 - 0.25, 0xb84a3a, 0, 0, 0, 0.04); K.cb(M.canvas, 0.08, 4.8, 0.4, -X + 0.15, 3.5, wz + WW / 2 + 0.2, 0xb84a3a, 0, 0, 0, 0.04); // drapes
    K.box(M.wood, -X + 0.05, -X + 0.2, S1 + 0.2, S1 + 0.35, wz - 1.4, wz + 1.4, 0x5a3a24, 0.01); }
  mesh(root, plane(40, 14), M.outside, -X - 5, 4.5, 0, 0, Math.PI / 2, 0, false);
  // wainscot + pilasters + cornice
  for (const [x0, x1, z0, z1] of [[-X, X, ZB, ZB + 0.08], [X - 0.08, X, ZB, ZF], [-X, -X + 0.08, ZB, ZF]]) K.box(M.woodV, x0, x1, 0, 1.2, z0, z1, 0x7a4a30, 0.01);
  K.box(M.wood, -X, X, 1.18, 1.26, ZB, ZB + 0.12, 0x5a3420, 0.01); K.box(M.wood, -X, X, H - 0.4, H - 0.2, ZB, ZB + 0.25, 0x6a4430, 0.02);
  for (const px of [-6.2, 6.2]) { K.box(M.plaster, px - 0.3, px + 0.3, 0, H - 0.4, ZB, ZB + 0.22, 0xfff2e0, 0.02); K.box(M.wood, px - 0.38, px + 0.38, H - 0.75, H - 0.4, ZB, ZB + 0.3, 0x6a4430, 0.02); K.box(M.wood, px - 0.36, px + 0.36, 0, 0.3, ZB, ZB + 0.3, 0x5a3420, 0.02); }
  for (let x = -X + 1; x < X; x += 2.2) K.box(M.wood, x - 0.12, x + 0.12, H - 0.28, H, ZB, ZF, 0x5a3a24, 0.02); // ceiling beams
  // college board, chart, chalkboard
  K.box(M.wood, -3.6, 3.6, 6.2, 7.1, ZB, ZB + 0.08, 0x3a2418, 0.02); mesh(root, plane(7.0, 0.75), M.college, 0, 6.65, ZB + 0.1, 0, 0, 0, false);
  const CH = { x: -2.5, y0: 1.7, y1: 5.5, w: 3.0 }; mesh(root, plane(CH.w, CH.y1 - CH.y0), M.chart, CH.x, (CH.y0 + CH.y1) / 2, ZB + 0.16, 0, 0, 0, false);
  for (const y of [CH.y0 - 0.04, CH.y1 + 0.04]) { K.put(M.wood, cyl(0.06, 0.06, CH.w + 0.3, 10), CH.x, y, ZB + 0.18, 0, 0, Math.PI / 2, 1, 1, 1, 0x4a2a18); for (const s of [-1, 1]) K.put(M.brass, sph(0.075, 10, 8), CH.x + s * (CH.w / 2 + 0.17), y, ZB + 0.18, 0, 0, 0, 1, 1, 1, 0xd0a050); }
  K.beam(M.paint, [CH.x - 1.2, CH.y1 + 0.06, ZB + 0.18], [CH.x, CH.y1 + 0.6, ZB + 0.1], 0.01, 0x3a2a20, true, 4); K.beam(M.paint, [CH.x + 1.2, CH.y1 + 0.06, ZB + 0.18], [CH.x, CH.y1 + 0.6, ZB + 0.1], 0.01, 0x3a2a20, true, 4); K.put(M.brass, sph(0.05, 8, 6), CH.x, CH.y1 + 0.6, ZB + 0.1, 0, 0, 0, 1, 1, 1, 0xd0a050);
  const BD = { x: 2.9, y0: 1.15, y1: 2.85, w: 3.4 }; K.box(M.wood, BD.x - BD.w / 2 - 0.12, BD.x + BD.w / 2 + 0.12, BD.y0 - 0.12, BD.y1 + 0.12, ZB, ZB + 0.12, 0x5a3420, 0.02); mesh(root, plane(BD.w, BD.y1 - BD.y0), M.chalk, BD.x, (BD.y0 + BD.y1) / 2, ZB + 0.13, 0, 0, 0, false);
  K.box(M.wood, BD.x - BD.w / 2, BD.x + BD.w / 2, BD.y0 - 0.16, BD.y0 - 0.1, ZB, ZB + 0.25, 0x5a3420, 0.01); for (let i = 0; i < 4; i++) K.cb(M.paint, 0.08, 0.025, 0.025, BD.x - 1 + i * 0.3, BD.y0 - 0.085, ZB + 0.18, 0xf4f0e4, 0, R(), 0, 0.005);
  K.cb(M.wood, 0.14, 0.05, 0.07, BD.x + 0.9, BD.y0 - 0.075, ZB + 0.18, 0xc8a070, 0, 0.3, 0, 0.01);
  // lectern (a little right of centre) with open book + oil lamp
  const LX = 1.0, LZ = -4.5; K.at(LX, 0, LZ, -0.15, () => { K.box(M.wood, -0.42, 0.42, 0, 0.08, -0.32, 0.32, 0x4a2a18, 0.02); K.box(M.woodV, -0.3, 0.3, 0.08, 1.05, -0.24, 0.24, 0x6a3e24, 0.02);
    for (const sx of [-0.2, 0.2]) K.box(M.wood, sx - 0.07, sx + 0.07, 0.25, 0.85, 0.24, 0.27, 0x5a3420, 0.01);
    K.cb(M.wood, 0.75, 0.06, 0.55, 0, 1.18, 0.02, 0x5a3420, -0.32, 0, 0, 0.015); K.cb(M.wood, 0.75, 0.04, 0.05, 0, 1.08, 0.3, 0x4a2a18, -0.32, 0, 0, 0.01);
    K.cb(M.paint, 0.28, 0.03, 0.38, -0.15, 1.235, 0.04, 0xf4ead0, -0.32, 0, 0.06, 0.01); K.cb(M.paint, 0.28, 0.03, 0.38, 0.15, 1.235, 0.04, 0xf2e6c8, -0.32, 0, -0.06, 0.01); K.cb(M.paint, 0.6, 0.02, 0.4, 0, 1.215, 0.04, 0x6a1a18, -0.32, 0, 0, 0.005);
    K.box(M.wood, 0.3, 0.52, 1.0, 1.04, -0.15, 0.1, 0x4a2a18, 0.01); oilLamp(K, 0.41, 1.04, -0.03, 0.9); });
  const lampP = [LX + 0.41, 1.55, LZ + 0.03];
  // demo table (left of centre): basket of tomatoes, glass jars, halved tomato, mortar, brass scale, book
  const TX = -1.7, TZ = -3.4, TH = 0.86; K.at(TX, 0, TZ, 0.08, () => { K.box(M.wood, -1.3, 1.3, TH - 0.06, TH, -0.5, 0.5, 0x5a3420, 0.02); K.box(M.wood, -1.24, 1.24, TH - 0.2, TH - 0.06, -0.44, 0.44, 0x4a2a18, 0.01);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.put(M.wood, lathe('tleg', [[0.001, 0], [0.04, 0], [0.05, 0.1], [0.035, 0.3], [0.05, 0.5], [0.04, TH - 0.2], [0.001, TH - 0.2]], 10), sx * 1.18, 0, sz * 0.38, 0, 0, 0, 1, 1, 1, 0x4a2a18);
    // basket
    K.put(M.basket, lathe('bask', [[0.25, 0], [0.33, 0.06], [0.36, 0.2], [0.36, 0.22]], 22), -0.55, TH, 0.0, 0, 0, 0, 1, 1, 1, 0xffffff); K.put(M.basket, cyl(0.25, 0.25, 0.01, 22), -0.55, TH + 0.005, 0, 0, 0, 0, 1, 1, 1, 0xc8984e);
    K.put(M.wood, tor(0.36, 0.02, 6, 24), -0.55, TH + 0.22, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x8a5e2e); K.put(M.wood, tor(0.33, 0.022, 6, 20, Math.PI), -0.55, TH + 0.22, 0, 0, 0, 0, 1, 1, 1, 0x8a5e2e);
    for (let i = 0; i < 16; i++) { const a = R() * TAU, rr = R() * 0.22, yy = TH + 0.12 + (i > 9 ? 0.09 : 0) + R() * 0.03; tomato(K, -0.55 + Math.cos(a) * rr, yy, Math.sin(a) * rr, 0.075 + R() * 0.02, R); }
    for (const [x, z] of [[-0.05, 0.3], [0.08, 0.2], [-0.12, -0.32]]) tomato(K, x, TH + 0.06, z, 0.07, R);
    // halved tomato on a little plate: cut face up
    K.put(M.plate, cyl(0.16, 0.12, 0.02, 20), 0.12, TH + 0.01, 0.25, 0, 0, 0, 1, 1, 1, 0xffffff); K.put(M.tomato, sph(0.085, 16, 8), 0.1, TH + 0.025, 0.25, 0, 0, 0, 1, 0.85, 1, 0xd8261c); K.put(M.cut, cyl(0.085, 0.085, 0.004, 24), 0.1, TH + 0.025, 0.25, 0, 0, 0, 1, 1, 1, 0xffffff);
    K.put(M.tomato, sph(0.085, 16, 8), 0.26, TH + 0.025, 0.2, 0, 0, 0, 1, 0.85, 1, 0xd8261c); K.put(M.cut, cyl(0.085, 0.085, 0.004, 24), 0.26, TH + 0.025, 0.2, 0, 1, 0, 1, 1, 1, 0xffffff);
    K.cb(M.metal, 0.22, 0.008, 0.03, 0.3, TH + 0.01, 0.34, 0xd0d0d8, 0, 0.6, 0, 0.003); K.cb(M.wood, 0.1, 0.02, 0.035, 0.42, TH + 0.012, 0.42, 0x3a2418, 0, 0.6, 0, 0.005);
    // mortar & pestle, brass scale, open book, quill + inkwell
    K.put(M.paint, lathe('mort', [[0.001, 0], [0.09, 0], [0.11, 0.06], [0.1, 0.11], [0.07, 0.11], [0.06, 0.05], [0.001, 0.05]], 16), 0.55, TH, -0.2, 0, 0, 0, 1, 1, 1, 0xe0d8c8); K.beam(M.paint, [0.55, TH + 0.06, -0.2], [0.62, TH + 0.2, -0.16], 0.018, 0xd8d0c0, true, 6);
    K.at(0.95, TH, -0.15, 0, () => { K.put(M.brass, cyl(0.06, 0.08, 0.03, 12), 0, 0.015, 0, 0, 0, 0, 1, 1, 1, 0xc89848); K.put(M.brass, cyl(0.012, 0.012, 0.36, 6), 0, 0.2, 0, 0, 0, 0, 1, 1, 1, 0xc89848); K.cb(M.brass, 0.42, 0.015, 0.015, 0, 0.37, 0, 0xc89848, 0, 0, 0.06, 0.004);
      for (const s of [-1, 1]) { K.beam(M.brass, [s * 0.2, 0.37 - s * 0.012, 0], [s * 0.2, 0.22 - s * 0.012, 0], 0.003, 0x8a6a30, true, 4); K.put(M.brass, cyl(0.08, 0.05, 0.02, 14), s * 0.2, 0.21 - s * 0.012, 0, 0, 0, 0, 1, 1, 1, 0xd8a850); } tomato(K, -0.2, 0.25, 0, 0.055, R); });
    K.cb(M.paint, 0.26, 0.025, 0.34, 0.75, TH + 0.012, 0.25, 0xf4ead0, 0, -0.2, 0.05, 0.005); K.cb(M.paint, 0.26, 0.025, 0.34, 0.99, TH + 0.012, 0.2, 0xf2e6c8, 0, -0.2, -0.05, 0.005); K.cb(M.paint, 0.52, 0.015, 0.36, 0.87, TH + 0.004, 0.22, 0x3a2a4a, 0, -0.2, 0, 0.003);
    K.put(M.paint, cyl(0.03, 0.035, 0.05, 10), 1.12, TH + 0.025, -0.33, 0, 0, 0, 1, 1, 1, 0x1a1a2a); K.beam(M.paint, [1.12, TH + 0.05, -0.33], [1.0, TH + 0.25, -0.38], 0.008, 0xf4f0e4, true, 4); });
  // glass jars (separate meshes: transparent glass + contents)
  const jars = [[-0.05, -0.25, 0.1, 0.32, 'liq'], [0.22, -0.3, 0.09, 0.26, 'tom'], [0.42, 0.05, 0.075, 0.36, 'seeds'], [-1.05, -0.3, 0.085, 0.3, 'liq2'], [0.68, -0.38, 0.06, 0.22, 'liq']];
  for (const [jx, jz, r, h, kind] of jars) { const x = TX + jx, z = TZ + jz;
    if (kind.startsWith('liq')) K.put(M.liquid, cyl(r * 0.9, r * 0.9, h * (kind === 'liq2' ? 0.4 : 0.62), 16), x, TH + h * (kind === 'liq2' ? 0.2 : 0.31), z, 0, 0, 0, 1, 1, 1, kind === 'liq2' ? 0xe88a30 : 0xc8301e);
    else if (kind === 'tom') { for (let i = 0; i < 3; i++) tomato(K, x + (i - 1) * 0.02, TH + 0.06 + i * 0.07, z + (i % 2) * 0.02, 0.05, R); }
    else { K.put(M.paint, cyl(r * 0.9, r * 0.9, h * 0.35, 14), x, TH + h * 0.175, z, 0, 0, 0, 1, 1, 1, 0xf2dca0); }
    K.put(M.wood, cyl(r * 0.75, r * 0.7, 0.05, 12), x, TH + h + 0.035, z, 0, 0, 0, 1, 1, 1, 0xb88a5a);
    mesh(root, lathe(`jar${r}|${h}`, [[0.001, 0], [r, 0], [r * 1.02, h * 0.1], [r * 1.02, h * 0.82], [r * 0.8, h * 0.92], [r * 0.78, h], [r * 0.85, h + 0.012]], 18), M.jar, x, TH, z, 0, 0, 0, false).renderOrder = 4; }
  // tiers: 7 curved rows (5 straight segments each) rising toward +z, bench + writing rail per row
  const seg = 7, a0 = -0.82, a1 = 0.82, rows = [];
  for (let i = 0; i < NT; i++) { const r0 = tierR(i), h = tierH(i), row = [];
    for (let s = 0; s < seg; s++) { const a = a0 + (a1 - a0) * (s + 0.5) / seg, da = (a1 - a0) / seg, cx = C[0] + Math.sin(a) * (r0 + 0.95 / 2 + (i === NT - 1 ? 1.0 : 0)), cz = C[1] + Math.cos(a) * (r0 + 0.95 / 2 + (i === NT - 1 ? 1.0 : 0));
      const wO = 2 * Math.sin(da / 2) * (r0 + 0.95) * 1.04, depth = i === NT - 1 ? 0.95 + 2 : 0.95;
      K.at(cx, 0, cz, a, () => { K.box(M.floor, -wO / 2, wO / 2, 0, h, -depth / 2, depth / 2, 0xe0b080, 0.01); K.box(M.woodV, -wO / 2, wO / 2, 0, h - 0.02, -depth / 2 - 0.02, -depth / 2 + 0.01, 0xa87048, 0.005); });
      // bench (seat at back of the tier) + front rail with a writing ledge
      const ra = r0 + 0.66, bx = C[0] + Math.sin(a) * ra, bz = C[1] + Math.cos(a) * ra, wB = 2 * Math.sin(da / 2) * ra * 1.01;
      K.at(bx, h, bz, a, () => { K.box(M.wood, -wB / 2, wB / 2, 0.42, 0.48, -0.18, 0.18, 0xd8a070, 0.015); K.box(M.wood, -wB / 2, wB / 2, 0.0, 0.42, 0.1, 0.16, 0x9a6440, 0.01); });
      const fa = r0 + 0.08, fx = C[0] + Math.sin(a) * fa, fz = C[1] + Math.cos(a) * fa, wF = 2 * Math.sin(da / 2) * fa * 1.01, hb = i ? tierH(i - 1) : 0;
      K.at(fx, h, fz, a, () => { K.box(M.wood, -wF / 2, wF / 2, 0.78, 0.84, -0.05, 0.22, 0xc08a58, 0.012); K.box(M.wood, -wF / 2, wF / 2, 0.0, 0.1, -0.03, 0.03, 0x9a6038, 0.008); for (let b = 0; b < 7; b++) K.put(M.wood, lathe('bal', [[0.001, 0], [0.03, 0], [0.03, 0.08], [0.018, 0.16], [0.04, 0.38], [0.018, 0.6], [0.028, 0.68], [0.028, 0.78], [0.001, 0.78]], 8), -wF / 2 + wF * (b + 0.5) / 7, 0, 0, 0, 0, 0, 1, 1, 1, 0xa87048); });
      if (i === 0) K.at(C[0] + Math.sin(a) * (r0 - 0.02), 0, C[1] + Math.cos(a) * (r0 - 0.02), a, () => { K.box(M.woodV, -wO / 2, wO / 2, 0, h, -0.04, 0.02, 0x7a4a2e, 0.01); });
      for (const k of [0.2, 0.5, 0.8]) { const sa = a - da / 2 + da * k; row.push(W3('lecture', [C[0] + Math.sin(sa) * ra, h, C[1] + Math.cos(sa) * ra])); }
      // clutter on the ledges: books, top hats, papers
      if (R() < 0.45) K.cb(M.paint, 0.22, 0.05, 0.16, fx + (R() - 0.5) * wF * 0.6, h + 0.87, fz + 0.06, [0x6a2a24, 0x2a4a3a, 0x3a3060][(R() * 3) | 0], 0, a + (R() - 0.5), 0, 0.01);
      if (R() < 0.25) { const hx = bx + (R() - 0.5) * wB * 0.6, hz = bz; K.put(M.paint, cyl(0.1, 0.095, 0.17, 12), hx, h + 0.57, hz, 0, 0, 0, 1, 1, 1, 0x2a2430); K.put(M.paint, cyl(0.16, 0.16, 0.012, 14), hx, h + 0.49, hz, 0, 0, 0, 1, 1, 1, 0x2a2430); }
      if (R() < 0.35) K.cb(M.paint, 0.2, 0.004, 0.26, fx + (R() - 0.5) * wF * 0.6, h + 0.846, fz + 0.08, 0xf2e8d0, 0, R() * 2, 0, 0.002); }
    rows.push(row); }
  // side aisle steps at both ends of the tiers
  for (const sa of [a0 - 0.08, a1 + 0.08]) for (let i = 0; i < NT; i++) { const r = tierR(i) + 0.47, x = C[0] + Math.sin(sa) * r, z = C[1] + Math.cos(sa) * r; K.at(x, 0, z, sa, () => { K.box(M.floor, -0.45, 0.45, 0, tierH(i) - 0.27, -0.475, 0, 0xa87a50, 0.01); K.box(M.floor, -0.45, 0.45, 0, tierH(i), 0, 0.475, 0xa87a50, 0.01); }); }
  // right wall: specimen cabinet with jars and books, a door, sconces; plaster bust on a pedestal
  K.at(X - 0.3, 0, -4.8, -Math.PI / 2, () => { K.box(M.wood, -1.3, 1.3, 0, 2.6, -0.25, 0.25, 0x4a2a18, 0.02); K.box(M.dark, -1.2, 1.2, 0.9, 2.45, -0.2, 0.2, 0x1a1024, 0.01);
    for (const y of [0.9, 1.4, 1.9]) { K.box(M.wood, -1.2, 1.2, y - 0.03, y, -0.2, 0.22, 0x5a3420, 0.005); } mesh(root, plane(2.3, 0.4), M.books, X - 0.12, 1.15, -4.8, 0, -Math.PI / 2, 0, false);
    for (let i = 0; i < 8; i++) { const x = -1.0 + i * 0.28, y = (i % 2 ? 1.4 : 1.9); K.put(M.liquid, cyl(0.07, 0.07, 0.24, 12), x, y + 0.12, 0, 0, 0, 0, 1, 1, 1, [0xc8301e, 0xe88a30, 0x6a8a3a, 0xd8c8a0][i % 4]); K.put(M.wood, cyl(0.05, 0.05, 0.04, 8), x, y + 0.26, 0, 0, 0, 0, 1, 1, 1, 0xb88a5a); }
    K.box(M.wood, -1.3, 1.3, 0, 0.9, -0.25, 0.27, 0x5a3420, 0.02); for (const x of [-0.65, 0.65]) K.box(M.wood, x - 0.55, x + 0.55, 0.1, 0.8, 0.27, 0.29, 0x6a3e24, 0.01); K.box(M.wood, -1.4, 1.4, 2.6, 2.75, -0.3, 0.3, 0x4a2a18, 0.02); });
  K.at(X - 0.05, 0, 0.6, -Math.PI / 2, () => { K.box(M.woodV, -0.65, 0.65, 0, 2.5, -0.05, 0.05, 0x5a3420, 0.01); K.box(M.wood, -0.8, 0.8, 2.5, 2.7, -0.08, 0.1, 0x4a2a18, 0.02); K.put(M.brass, sph(0.04, 8, 6), 0.45, 1.1, 0.09, 0, 0, 0, 1, 1, 1, 0xd0a050); });
  K.at(-5.2, 0, -6.5, 0.4, () => { K.put(M.wood, lathe('ped', [[0.001, 0], [0.25, 0], [0.25, 0.08], [0.16, 0.14], [0.13, 1.0], [0.2, 1.06], [0.22, 1.12], [0.001, 1.12]], 14), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0x6a4028);
    K.put(M.plaster, lathe('bust', [[0.001, 0], [0.22, 0], [0.24, 0.08], [0.17, 0.22], [0.07, 0.3], [0.06, 0.36], [0.001, 0.36]], 16), 0, 1.12, 0, 0, 0, 0, 1, 1, 0.7, 0xf2ece0); K.put(M.plaster, sph(0.11, 14, 10), 0, 1.6, 0.01, 0, 0, 0, 1, 1.18, 1.05, 0xf2ece0); });
  K.at(5.6, 0, -6.9, 0, () => { K.beam(M.wood, [-0.3, 0, 0], [0, 1.8, 0], 0.03, 0x5a3420, true, 6); K.beam(M.wood, [0.3, 0, 0], [0, 1.8, 0], 0.03, 0x5a3420, true, 6); K.beam(M.wood, [0, 0, 0.3], [0, 1.8, 0], 0.03, 0x5a3420, true, 6); K.put(M.paint, cyl(0.11, 0.1, 0.2, 12), 0.05, 1.86, 0, 0.1, 0, 0.2, 1, 1, 1, 0x2a2430); K.put(M.paint, cyl(0.17, 0.17, 0.012, 14), 0.04, 1.77, 0, 0.1, 0, 0.2, 1, 1, 1, 0x2a2430); }); // hat stand
  // oil lamps: sconces on the back wall + a hanging lamp over the pit
  const SC = [[-5.0, 3.3], [5.0, 3.3], [-0.2, 3.6]]; for (const [x, y] of SC) sconce(K, x, y, ZB + 0.02, 0);
  for (const z of [-2, 3]) sconce(K, X - 0.02, 3.4, z, -Math.PI / 2);
  K.beam(M.brass, [0, H, -3.2], [0, 4.6, -3.2], 0.012, 0x4a3a2a, true, 4); K.put(M.brass, tor(0.35, 0.02, 6, 24), 0, 4.6, -3.2, Math.PI / 2, 0, 0, 1, 1, 1, 0xb88a40); for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; K.beam(M.brass, [0, 5.1, -3.2], [Math.cos(a) * 0.35, 4.6, -3.2 + Math.sin(a) * 0.35], 0.008, 0x8a6a30, true, 4); oilLamp(K, Math.cos(a) * 0.35, 4.6, -3.2 + Math.sin(a) * 0.35, 0.8); }
  K.build(root, 6);
  const glows = []; for (const [x, y] of SC) glows.push(glowAt(root, [x, y + 0.36, ZB + 0.3], 0.9, '#ffb860', 0.55));
  for (const z of [-2, 3]) glows.push(glowAt(root, [X - 0.3, 3.4 + 0.36, z], 0.9, '#ffb860', 0.5)); glows.push(glowAt(root, [lampP[0], 1.55, lampP[2]], 0.8, '#ffc070', 0.6));
  for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; glows.push(glowAt(root, [Math.cos(a) * 0.35, 4.95, -3.2 + Math.sin(a) * 0.35], 0.7, '#ffb860', 0.5)); }
  // sun shafts through the windows + dust motes drifting in them (sun dir for az -68 el 26)
  const el = 26 * Math.PI / 180, az = -68 * Math.PI / 180, dir = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)), into = dir.clone().negate();
  const shafts = [], LEN = 11; const xAx = new THREE.Vector3(0, 0, 1), yAx = into.clone(), zAx = new THREE.Vector3().crossVectors(xAx, yAx).normalize(); xAx.crossVectors(yAx, zAx).normalize();
  const basis = new THREE.Matrix4().makeBasis(xAx, yAx, zAx), q = new THREE.Quaternion().setFromRotationMatrix(basis);
  for (const wz of WZ) for (const [yy, ww] of [[(S0 + S1) / 2 + 0.6, WW * 0.9], [(S0 + S1) / 2 - 0.6, WW * 0.7]]) { const p = new THREE.Vector3(-X, yy, wz).addScaledVector(into, LEN / 2); const s = nond(mesh(root, plane(ww, LEN), M.shaft.clone(), p.x, p.y, p.z, 0, 0, 0, false)); s.quaternion.copy(q); s.renderOrder = 3; shafts.push(s);
    const s2 = nond(mesh(root, plane(ww * 0.8, LEN), M.shaft.clone(), p.x, p.y, p.z, 0, 0, 0, false)); s2.quaternion.copy(q).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)); s2.renderOrder = 3; shafts.push(s2); }
  const ND = 260, dust = new THREE.InstancedMesh(sph(0.018, 5, 4), M.dust, ND); nond(dust); dust.frustumCulled = false; root.add(dust); const dustP = []; for (let i = 0; i < ND; i++) dustP.push([R(), R() - 0.5, R() - 0.5, (R() * 3) | 0, R() * TAU]);
  return { rows, glows, shafts, dust, dustP, into, WZ, X, S0, S1, WW, lampP, LX, LZ, TX, TZ, TH, CH, BD, ZB, C, tierR, tierH };
}

// ================================================================= STREET
function shop(K, o) { // o: x0, x1, zf (front face), d (depth), h (wall height), wall: 'clap'|'brick', c (wall colour), trim, ff (false-front extra), door (x offset), roof
  const { x0, x1, zf } = o, d = o.d || 8, h = o.h || 6, w = x1 - x0, cx = (x0 + x1) / 2, wm = o.wall === 'brick' ? M.brick : M.clap, tr = o.trim || 0xf4eee0, R = o.R;
  K.box(wm, x0, x1, 0, h, zf - d, zf, o.c, 0.01);
  if (o.ff) K.box(wm, x0, x1, h, h + o.ff, zf - 0.25, zf, o.c, 0.01); else { K.put(M.shingle, prismGeo(d + 0.4, 2.2, w + 0.4), cx, h, zf - d / 2, 0, Math.PI / 2, 0, 1, 1, 1, o.roof || 0x6a5050); }
  const top = h + (o.ff || 0); K.box(M.wood, x0 - 0.12, x1 + 0.12, top - 0.05, top + 0.18, zf - 0.32, zf + 0.22, tr, 0.02); K.box(M.wood, x0 - 0.06, x1 + 0.06, top - 0.45, top - 0.05, zf - 0.1, zf + 0.12, tr, 0.01);
  for (let x = x0 + 0.3; x <= x1 - 0.2; x += (w - 0.5) / Math.max(1, Math.round(w / 1.2))) K.cb(M.wood, 0.12, 0.3, 0.2, x, top - 0.2, zf + 0.18, tr, 0, 0, 0, 0.01); // brackets
  for (const sx of [x0 + 0.1, x1 - 0.1]) K.box(M.wood, sx - 0.12, sx + 0.12, 0, top - 0.4, zf - 0.02, zf + 0.08, tr, 0.01); // corner boards
  // ground floor: door + 2 display windows
  const dx = cx + (o.door || 0), dw = 1.1; K.box(M.dark, dx - dw / 2, dx + dw / 2, 0.3, 2.65, zf - 0.08, zf + 0.01, 0x1a1024, 0.005);
  K.box(M.woodV, dx - dw / 2 + 0.04, dx + dw / 2 - 0.04, 0.3, 2.55, zf - 0.06, zf + 0.0, o.doorC || 0x3a4a3a, 0.01); K.box(M.glass, dx - 0.4, dx + 0.4, 1.55, 2.4, zf - 0.03, zf + 0.02, 0xffffff, 0.005); K.box(M.wood, dx - dw / 2 - 0.1, dx + dw / 2 + 0.1, 2.65, 2.85, zf, zf + 0.1, tr, 0.01); K.put(M.brass, sph(0.035, 8, 6), dx + 0.38, 1.4, zf + 0.04, 0, 0, 0, 1, 1, 1, 0xd8b050);
  const wins = []; for (const s of [-1, 1]) { const a = s < 0 ? x0 + 0.45 : dx + dw / 2 + 0.35, b = s < 0 ? dx - dw / 2 - 0.35 : x1 - 0.45; if (b - a < 0.8) continue; wins.push([a, b]);
    if (!o.noWin) { K.box(M.glass, a, b, 0.95, 2.55, zf - 0.04, zf + 0.02, 0xffffff, 0.005); K.box(M.wood, a - 0.08, b + 0.08, 0.75, 0.95, zf, zf + 0.18, tr, 0.01); K.box(M.wood, a - 0.08, b + 0.08, 2.55, 2.75, zf, zf + 0.1, tr, 0.01);
      for (let k = 1; k < 3; k++) K.box(M.wood, a + (b - a) * k / 3 - 0.03, a + (b - a) * k / 3 + 0.03, 0.95, 2.55, zf, zf + 0.06, tr, 0.004); K.box(M.wood, a, b, 1.75, 1.8, zf, zf + 0.06, tr, 0.004);
      for (let k = 0; k < 5; k++) K.cb(M.paint, 0.18 + R() * 0.2, 0.2 + R() * 0.3, 0.2, a + 0.3 + R() * (b - a - 0.6), 1.05 + R() * 0.1, zf - 0.2, [0xc8a070, 0x8a5a3a, 0xe8dcc0, 0x6a7a5a][(R() * 4) | 0], 0, 0, 0, 0.02); } } // goods in window
  // upper floor windows with shutters
  const nU = Math.max(1, Math.round(w / 2.4)); for (let k = 0; k < nU; k++) { const ux = x0 + w * (k + 0.5) / nU, uy = 4.2; if (uy + 0.9 > h + (o.ff || 0) - 0.5) continue;
    K.box(M.glass, ux - 0.42, ux + 0.42, uy - 0.75, uy + 0.75, zf - 0.04, zf + 0.02, 0xffffff, 0.005); K.box(M.wood, ux - 0.5, ux + 0.5, uy - 0.85, uy - 0.75, zf, zf + 0.12, tr, 0.01); K.box(M.wood, ux - 0.5, ux + 0.5, uy + 0.75, uy + 0.92, zf, zf + 0.12, tr, 0.01);
    K.box(M.wood, ux - 0.03, ux + 0.03, uy - 0.75, uy + 0.75, zf, zf + 0.05, tr, 0.003); K.box(M.wood, ux - 0.42, ux + 0.42, uy - 0.03, uy + 0.03, zf, zf + 0.05, tr, 0.003);
    for (const s of [-1, 1]) { K.box(M.woodV, ux + s * 0.48 - 0.22, ux + s * 0.48 + 0.22, uy - 0.75, uy + 0.75, zf + 0.02, zf + 0.06, o.shut || 0x2a5a3a, 0.01); } }
  if (o.chim) K.box(M.brick, x1 - 1.2, x1 - 0.6, h, h + 3.2, zf - d * 0.6, zf - d * 0.6 + 0.6, 0xffffff, 0.02);
  return { wins, dx, top }; }
function horseCart(K, x, z, ry) { K.at(x, 0, z, ry, () => { const c = 0x4a2e22, d = 0x2a1a18;
  K.cb(M.paint, 1.55, 0.62, 0.55, 0, 1.25, 0, c, 0, 0, 0, 0.25); K.beam(M.paint, [0.62, 1.4, 0], [0.95, 1.95, 0], 0.26, c, true, 10); K.cb(M.paint, 0.62, 0.26, 0.24, 1.15, 1.9, 0, c, 0, 0, -0.75, 0.1); K.cb(M.paint, 0.12, 0.2, 0.06, 0.95, 2.18, 0.08, c, 0, 0, 0.3, 0.03); K.cb(M.paint, 0.12, 0.2, 0.06, 0.95, 2.18, -0.08, c, 0, 0, 0.3, 0.03);
  K.beam(M.paint, [0.6, 1.95, 0], [0.85, 2.15, 0], 0.08, d, false); K.beam(M.paint, [-0.78, 1.45, 0], [-0.95, 0.85, 0], 0.07, d, true, 6);
  for (const [lx, lz] of [[0.6, 0.18], [0.6, -0.18], [-0.6, 0.18], [-0.6, -0.18]]) { K.beam(M.paint, [lx, 1.1, lz], [lx + 0.03, 0.08, lz], 0.075, c, true, 6); K.cb(M.paint, 0.14, 0.08, 0.14, lx + 0.03, 0.04, lz, d, 0, 0, 0, 0.02); }
  K.beam(M.wood, [0.2, 1.3, 0.3], [-2.2, 0.75, 0.55], 0.05, 0x5a3420, true, 6); K.beam(M.wood, [0.2, 1.3, -0.3], [-2.2, 0.75, -0.55], 0.05, 0x5a3420, true, 6); K.cb(M.paint, 0.12, 0.4, 0.7, 0.42, 1.5, 0, 0x6a3a2a, 0, 0, 0, 0.04); // shafts + collar
  K.at(-3.2, 0, 0, 0, () => { K.box(M.wood, -1.0, 1.0, 0.75, 0.85, -0.65, 0.65, 0x7a5030, 0.02); for (const s of [-1, 1]) K.box(M.wood, -1.0, 1.0, 0.85, 1.25, s * 0.65 - 0.04, s * 0.65 + 0.04, 0x8a5a38, 0.01); K.box(M.wood, -1.04, -0.96, 0.85, 1.25, -0.65, 0.65, 0x8a5a38, 0.01);
    for (const s of [-1, 1]) { K.put(M.wood, tor(0.62, 0.04, 6, 24), 0.1, 0.64, s * 0.75, 0, 0, 0, 1, 1, 1, 0x4a2a18); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI; K.cb(M.wood, 1.2, 0.04, 0.03, 0.1, 0.64, s * 0.75, 0x5a3420, 0, 0, a, 0.01); } K.put(M.wood, cyl(0.09, 0.09, 0.16, 10), 0.1, 0.64, s * 0.75, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a2418); }
    for (let i = 0; i < 3; i++) K.put(M.paint, cyl(0.24, 0.24, 0.5, 12), -0.6 + i * 0.5, 1.1, -0.2 + (i % 2) * 0.3, Math.PI / 2, 0, 0.2, 1, 1, 1, 0xa88a5a); }); // cart with barrels
}); }
function lampPost(K, x, z) { K.put(M.wood, cyl(0.07, 0.09, 3.2, 8), x, 1.6, z, 0, 0, 0, 1, 1, 1, 0x3a2a24); K.box(M.wood, x - 0.25, x + 0.25, 3.15, 3.22, z - 0.05, z + 0.05, 0x3a2a24, 0.01);
  K.box(M.metal, x - 0.17, x + 0.17, 3.22, 3.26, z - 0.17, z + 0.17, 0x2a2a34, 0.01); K.box(M.lampGlass, x - 0.13, x + 0.13, 3.26, 3.62, z - 0.13, z + 0.13, 0xffffff, 0.005); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.box(M.metal, x + sx * 0.14 - 0.015, x + sx * 0.14 + 0.015, 3.26, 3.62, z + sz * 0.14 - 0.015, z + sz * 0.14 + 0.015, 0x2a2a34, 0.003);
  K.put(M.metal, cyl(0.02, 0.24, 0.2, 4), x, 3.72, z, 0, Math.PI / 4, 0, 1, 1, 1, 0x2a2a34); K.put(M.metal, sph(0.04, 6, 4), x, 3.85, z, 0, 0, 0, 1, 1, 1, 0x2a2a34); }
function buildStreet(root) {
  const R = rng(1837), K = new Kit(), ZF = -6.4, BW = 2.4, BY = 0.3, ZK = ZF + BW; // facades at z=-6.4, boardwalk to z=-4.0
  mesh(root, planeUV(160, 80, 20, 10), M.road, 0, 0, 10, -Math.PI / 2, 0, 0, false);
  // the row of shops (left to right); apothecary in the middle
  const S = [
    { x0: -34, x1: -27, wall: 'clap', c: 0xd8c8a8, h: 5.4, roof: 0x5a4a4a, R },
    { x0: -26.6, x1: -19.6, wall: 'brick', c: 0xffffff, h: 7.2, ff: 0, chim: true, R, shut: 0x3a3a5a, noWin: true, door: -1.6 },
    { x0: -19.2, x1: -12.4, wall: 'clap', c: 0xe8d098, h: 6.0, ff: 1.4, R, shut: 0x7a2a24, door: 0.8 }, // bakery (loaf)
    { x0: -12.0, x1: -4.6, wall: 'clap', c: 0xa8c0c8, h: 6.2, ff: 1.6, R, shut: 0x2a3a5a, doorC: 0x6a2a24 }, // general store (goods)
    { x0: -4.2, x1: 4.2, wall: 'brick', c: 0xffffff, h: 7.6, ff: 1.0, R, shut: 0x1e3a2a, noWin: true, doorC: 0x2a2a4a, door: 2.3 }, // APOTHECARY
    { x0: 4.6, x1: 11.4, wall: 'clap', c: 0xf0ece0, h: 6.0, ff: 1.2, R, shut: 0x3a5a3a, door: -1.2 }, // cobbler (boot)
    { x0: 11.8, x1: 18.8, wall: 'brick', c: 0xd8a890, h: 6.8, chim: true, R, shut: 0x5a2a2a, noWin: true, door: 2.0 },
    { x0: 19.2, x1: 26, wall: 'clap', c: 0xc8b8d0, h: 5.6, ff: 1.2, R, shut: 0x2a4a5a },
    { x0: 26.4, x1: 34, wall: 'clap', c: 0xe0d0b0, h: 5.2, roof: 0x5a4040, R },
  ];
  const info = S.map((o) => shop(K, { ...o, zf: ZF }));
  // distant buildings + trees at both street ends, plus a far church steeple
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++) { const x = s * (40 + i * 7), h = 4 + R() * 3; K.box(M.clap, x - 3, x + 3, 0, h, ZF - 6, ZF, [0xd8c8a8, 0xc8b8a0, 0xe0d8c0][i % 3], 0.02); K.put(M.shingle, prismGeo(6.4, 2, 6.4), x, h, ZF - 3, 0, 0, 0, 1, 1, 1, 0x6a5050); }
  for (let i = 0; i < 26; i++) { const x = (R() - 0.5) * 140, z = ZF - 14 - R() * 30, s = 2.5 + R() * 3; K.put(M.leaf, lumpGeo(i % 4, 1, 0.3), x, s * 1.2 + 2, z, 0, R() * TAU, 0, s * 1.1, s, s * 1.1, [0x5a8a3a, 0x4a7a34, 0x6a9a44][i % 3]); K.put(M.wood, cyl(0.25, 0.35, 3, 6), x, 1.5, z, 0, 0, 0, 1, 1, 1, 0x5a4030); }
  K.at(-22, 0, -48, 0, () => { K.box(M.clap, -3, 3, 0, 7, -5, 5, 0xf4f0e8, 0.02); K.put(M.shingle, prismGeo(6.4, 3, 10.4), 0, 7, 0, 0, 0, 0, 1, 1, 1, 0x5a4a4a); K.box(M.clap, -1.3, 1.3, 7, 11, 3, 5.6, 0xf4f0e8, 0.02); K.put(M.shingle, cyl(0.01, 1.4, 5, 4), 0, 13.5, 4.3, 0, Math.PI / 4, 0, 1, 1, 1, 0x5a4a4a); });
  // boardwalk + kerb + posts, awnings on some shops
  K.box(M.floor, -36, 36, 0, BY, ZF, ZK, 0xb89870, 0.01); K.box(M.wood, -36, 36, 0, BY + 0.02, ZK - 0.12, ZK, 0x6a4a30, 0.01);
  for (let x = -35; x <= 35; x += 3.1) { if (Math.abs(x) < 4.5 || [-8.3, 7.2, -16, -21.3].some((c) => Math.abs(x - c) < 1.0)) continue; K.box(M.wood, x - 0.09, x + 0.09, BY, 3.3, ZK - 0.2, ZK - 0.02, 0x7a5a40, 0.01); }
  K.box(M.wood, -36, -4.4, 3.3, 3.42, ZK - 0.25, ZK + 0.02, 0x6a4a30, 0.01); K.box(M.wood, 4.4, 36, 3.3, 3.42, ZK - 0.25, ZK + 0.02, 0x6a4a30, 0.01);
  for (const [a, b, mt] of [[-19.2, -12.4, M.awningR], [-12, -4.6, M.awning], [4.6, 11.4, M.awningR], [19.2, 26, M.awning]]) K.put(mt, plane(b - a, 2.6), (a + b) / 2, 3.35, ZF + 1.2, -1.15, 0, 0, 1, 1, 1, 0xffffff);
  for (const [a, b] of [[-34, -27], [-26.6, -19.6], [11.8, 18.8], [26.4, 34]]) K.box(M.shingle, a, b, 3.3, 3.42, ZF, ZK, 0x7a6a6a, 0.01);
  // hitching rails, trough, barrels, crates, bench
  for (const x of [-15, 8, 22]) { for (const dx of [-1.2, 1.2]) K.put(M.wood, cyl(0.08, 0.09, 1.1, 8), x + dx, 0.55, ZK + 0.6, 0, 0, 0, 1, 1, 1, 0x6a4a30); K.beam(M.wood, [x - 1.3, 1.0, ZK + 0.6], [x + 1.3, 1.0, ZK + 0.6], 0.07, 0x7a5a3a, true, 6); }
  K.box(M.wood, -24, -21.6, 0, 0.6, ZK + 0.3, ZK + 1.0, 0x6a4a30, 0.02); K.box(M.glass, -23.9, -21.7, 0.5, 0.56, ZK + 0.36, ZK + 0.94, 0xffffff, 0.005);
  for (const [x, z] of [[-11.3, ZF + 0.5], [-10.6, ZF + 0.45], [12.6, ZF + 0.6], [18.0, ZF + 0.5], [-26, ZF + 0.6]]) K.put(M.wood, lathe('barrel', [[0.001, 0], [0.26, 0], [0.32, 0.4], [0.26, 0.8], [0.001, 0.8]], 14), x, BY, z, 0, R(), 0, 1, 1, 1, 0x9a6a40);
  for (const [x, z] of [[-8.5, ZF + 0.55], [-7.9, ZF + 0.6], [16, ZF + 0.5], [9.8, ZF + 0.6]]) K.cb(M.wood, 0.6, 0.5, 0.5, x, BY + 0.25, z, 0xa87a50, 0, R() * 0.4, 0, 0.02);
  K.box(M.wood, 5.4, 7.2, BY + 0.42, BY + 0.48, ZF + 0.3, ZF + 0.7, 0x7a5030, 0.01); for (const x of [5.5, 7.1]) K.box(M.wood, x - 0.04, x + 0.04, BY, BY + 0.42, ZF + 0.3, ZF + 0.7, 0x6a4028, 0.005);
  // pictorial hanging trade signs (on brackets off the facades)
  const hang = (x, y, kind) => { K.beam(M.metal, [x, y + 0.6, ZF], [x, y + 0.6, ZF + 1.1], 0.04, 0x2a2a34); K.beam(M.metal, [x, y + 0.2, ZF], [x, y + 0.6, ZF + 0.8], 0.025, 0x2a2a34); K.put(M.pict[kind], plane(0.8, 0.8), x, y, ZF + 0.9, 0, Math.PI / 2, 0, 1, 1, 1, 0xffffff); K.cb(M.wood, 0.05, 0.82, 0.82, x, y, ZF + 0.9, 0x3a2a24, 0, 0, 0, 0.01); };
  hang(-12.9, 4.45, 'loaf'); hang(-5.1, 4.45, 'goods'); hang(4.0, 4.6, 'mortar'); hang(11.0, 4.45, 'boot');
  // APOTHECARY: big bay display window with glowing carboys, sign board, pilasters
  const AP = S[4]; K.box(M.wood, -4.0, 4.0, 2.95, 3.6, ZF + 0.05, ZF + 0.25, 0x2a2a4a, 0.02); mesh(root, plane(7.6, 0.6), M.apoth, 0, 3.27, ZF + 0.26, 0, 0, 0, false);
  const BX0 = -3.6, BX1 = 1.3, BZ = ZF + 1.0; K.box(M.wood, BX0 - 0.15, BX1 + 0.15, 0, 0.85, ZF, BZ + 0.05, 0x2a2a4a, 0.02); K.box(M.wood, BX0 - 0.15, BX1 + 0.15, 2.65, 2.9, ZF, BZ + 0.1, 0x2a2a4a, 0.02); K.box(M.dark, BX0, BX1, 0.85, 2.65, ZF - 0.02, ZF + 0.02, 0x1a1024, 0.005);
  for (const x of [BX0, (BX0 + BX1) / 2 - 0.85, (BX0 + BX1) / 2 + 0.85, BX1]) K.box(M.wood, x - 0.06, x + 0.06, 0.85, 2.65, BZ - 0.04, BZ + 0.06, 0xd8b050, 0.01);
  for (const s of [-1, 1]) K.box(M.wood, s < 0 ? BX0 - 0.15 : BX1 + 0.05, s < 0 ? BX0 - 0.05 : BX1 + 0.15, 0.85, 2.65, ZF, BZ, 0xd8b050, 0.01);
  for (const x of [-2.8, 0.45]) K.put(M.wood, cyl(0.3, 0.33, 0.36, 16), x, 1.03, BZ - 0.55, 0, 0, 0, 1, 1, 1, 0x4a2a2a);
  for (let i = 0; i < 14; i++) { const x = BX0 + 0.25 + i * (BX1 - BX0 - 0.5) / 13; K.put(M.liquid, cyl(0.045, 0.05, 0.22, 10), x, 2.25, ZF + 0.12, 0, 0, 0, 1, 1, 1, [0xc8301e, 0x2a8a5a, 0xe8a030, 0x3a5ac8, 0xf0e8d0][i % 5]); K.put(M.wood, cyl(0.03, 0.03, 0.04, 6), x, 2.38, ZF + 0.12, 0, 0, 0, 1, 1, 1, 0xb88a5a); }
  K.box(M.wood, BX0, BX1, 2.1, 2.14, ZF, ZF + 0.25, 0x4a2a2a, 0.005);
  // pill boxes + tomatoes on the window floor
  for (let i = 0; i < 6; i++) K.cb(M.paint, 0.18, 0.08, 0.12, BX0 + 0.5 + i * 0.7, 0.9, BZ - 0.15, [0xf0e0b0, 0xc8281e, 0xe8d8c0][i % 3], 0, R(), 0, 0.01);
  for (let i = 0; i < 5; i++) tomato(K, BX0 + 0.8 + i * 0.85, 0.94, BZ - 0.3, 0.08, R);
  // right part of the apothecary: lamp-lit window above the door, mortar sign, step
  K.box(M.wood, 1.9, 3.1, 0, 0.3, ZF, ZF + 0.5, 0x8a7a6a, 0.01);
  // general store goods out front: sacks + broom + baskets
  for (let i = 0; i < 4; i++) K.put(M.canvas, lumpGeo(10 + i, 1, 0.2), -9.4 + i * 0.55, BY + 0.32, ZF + 0.5, 0, R(), 0, 0.26, 0.36, 0.22, 0xe8dcc0);
  K.beam(M.wood, [-6.0, BY, ZF + 0.3], [-5.8, BY + 1.4, ZF + 0.1], 0.025, 0xc8a070, true, 5);
  // market stall in the street, piled with tomatoes
  const MK = [-14.5, 0, -1.6]; K.at(MK[0], 0, MK[2], 0.05, () => { K.box(M.wood, -1.6, 1.6, 0.8, 0.9, -0.7, 0.7, 0x8a5a38, 0.02); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.put(M.wood, cyl(0.05, 0.05, 2.5, 6), sx * 1.5, 1.25, sz * 0.62, 0, 0, 0, 1, 1, 1, 0x6a4028);
    K.put(M.awningR, plane(3.4, 1.9), 0, 2.45, 0, -Math.PI / 2 + 0.25, 0, 0, 1, 1, 1, 0xffffff); for (const s of [-1, 1]) K.box(M.wood, -1.6, 1.6, 0.0, 0.8, s * 0.66 - 0.03, s * 0.66 + 0.03, 0x7a5030, 0.01);
    for (const [cx, cz] of [[-0.85, 0.15], [0, -0.1], [0.85, 0.15]]) { K.box(M.wood, cx - 0.42, cx + 0.42, 0.9, 1.12, cz - 0.3, cz + 0.3, 0xa87a50, 0.01); tomatoPile(K, cx, 1.05, cz, 0.78, 0.55, 3, 0.075, R); }
    for (let i = 0; i < 3; i++) { K.box(M.wood, -1.5 + i * 0.7, -0.9 + i * 0.7, 0, 0.45, 0.75, 1.3, 0xa87a50, 0.01); tomatoPile(K, -1.2 + i * 0.7, 0.36, 1.02, 0.55, 0.5, 2, 0.07, R); }
    K.at(1.3, 0.9, -0.45, 0, () => { K.put(M.brass, cyl(0.012, 0.012, 0.5, 6), 0, 0.25, 0, 0, 0, 0, 1, 1, 1, 0xc89848); K.cb(M.brass, 0.5, 0.015, 0.015, 0, 0.5, 0, 0xc89848, 0, 0, 0, 0.004); for (const s of [-1, 1]) K.put(M.brass, cyl(0.1, 0.07, 0.02, 12), s * 0.25, 0.35, 0, 0, 0, 0, 1, 1, 1, 0xd8a850); });
    K.put(M.basket, lathe('bask', [[0.25, 0], [0.33, 0.06], [0.36, 0.2], [0.36, 0.22]], 22), 2.2, 0, 0.3, 0, 0, 0, 1, 1, 1, 0xffffff); tomatoPile(K, 2.2, 0.0, 0.3, 0.5, 0.5, 2, 0.075, R); });
  // horse + cart down the street, oil lamp posts along the kerb
  horseCart(K, 19, 1.4, Math.PI);
  const LP = [-24, -9.5, 6.8, 21]; for (const x of LP) lampPost(K, x, ZK + 0.35);
  // far side of the street (behind the camera in reverse shots): low fence + a couple of houses
  for (let x = -36; x < 36; x += 0.5) K.box(M.wood, x - 0.04, x + 0.04, 0, 1.0, 9.6, 9.66, 0xe8e0d0, 0.01); K.box(M.wood, -36, 36, 0.7, 0.78, 9.66, 9.7, 0xe8e0d0, 0.01);
  for (const x of [-20, 2, 24]) { K.box(M.clap, x - 4, x + 4, 0, 5, 12, 18, 0xe0d8c8, 0.02); K.put(M.shingle, prismGeo(8.4, 2.4, 6.4), x, 5, 15, 0, 0, 0, 1, 1, 1, 0x6a5050); }
  K.build(root, 12);
  // carboys in the bay window (unlit materials, bloom) + their glows
  const carb = [carboy(root, -2.8, 1.21, BZ - 0.55, 1.0, 0), carboy(root, -1.15, 0.86, BZ - 0.5, 1.25, 1), carboy(root, 0.45, 1.21, BZ - 0.55, 1.0, 2), carboy(root, 1.0, 2.15, ZF + 0.18, 0.4, 3), carboy(root, -3.3, 2.15, ZF + 0.18, 0.4, 0)];
  const lamps = LP.map((x) => glowAt(root, [x, 3.45, ZK + 0.35], 1.4, '#ffc070', 0.45));
  // signs that pop (signs(n)): [mesh group, kind]
  const pops = [];
  const pop = (mat, w, h, x, y, z, ry = 0, hangY = 0, frame = true) => { const g = new THREE.Group(); g.position.set(x, y + h / 2 + hangY, z); g.rotation.y = ry; root.add(g); const inner = new THREE.Group(); inner.position.y = -h / 2 - hangY; g.add(inner);
    mesh(inner, plane(w, h), mat, 0, 0, 0.03, 0, 0, 0, false); if (frame) { const k = new Kit(); k.box(M.wood, -w / 2 - 0.05, w / 2 + 0.05, -h / 2 - 0.05, h / 2 + 0.05, -0.03, 0.02, 0x3a2418, 0.01); k.build(inner); } pops.push(g); return g; };
  pop(M.sg.cures, 4.6, 0.62, -1.15, 5.35, ZF + 0.06, 0, 0.0, true); // above the bay window
  const ab = pop(M.sg.soldBoard, 0.9, 0.9, 1.6, BY + 0.85, ZF + 1.4, -0.25); { const k = new Kit(); k.beam(M.wood, [-0.45, -0.45, 0.05], [-0.5, -0.85, 0.25], 0.04, 0x5a3a24); k.beam(M.wood, [0.45, -0.45, 0.05], [0.5, -0.85, 0.25], 0.04, 0x5a3a24); k.build(ab.children[0]); } // A-board on the boardwalk
  pop(M.sg.sold, 3.6, 0.5, -8.3, 2.8, ZF + 0.25, 0, 0.0); // general store fascia
  pop(M.sg.miles, 1.0, 1.5, -20.6, 1.0, ZF + 0.03, 0, 0); pop(M.sg.phelps, 1.0, 1.5, -22.0, 1.05, ZF + 0.03, 0, 0); // posters on the brick wall
  pop(M.sg.sold2, 3.0, 0.42, 7.2, 2.95, ZF + 0.25, 0, 0); pop(M.sg.genuine, 1.4, 0.36, -1.6, 0.4, BZ + 0.1, 0, 0); pop(M.sg.beware, 1.6, 0.3, 8.0, 0.98, ZF + 0.05, 0, 0);
  pop(M.sg.miles, 0.8, 1.2, 13.3, 1.25, ZF + 0.03, 0, 0); pop(M.sg.phelps, 0.8, 1.2, 14.3, 1.2, ZF + 0.03, 0, 0); pop(M.sg.sold, 2.6, 0.36, -16, 2.85, ZF + 0.25, 0, 0);
  // CRAZY mood dressing: bunting along the facades, a tomato banner across the street, a flag
  const crazy = new THREE.Group(); root.add(crazy); const bunts = [];
  const bunting = (A, B, n, sag) => { const P = [], C = [], base = []; const cols = [[0.78, 0.15, 0.12], [0.95, 0.92, 0.84], [0.25, 0.55, 0.22]];
    for (let i = 0; i < n; i++) { const t0 = (i + 0.1) / n, t1 = (i + 0.9) / n, tm = (t0 + t1) / 2; const at = (t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t - sag * 4 * t * (1 - t), A[2] + (B[2] - A[2]) * t];
      const p0 = at(t0), p1 = at(t1), pm = at(tm); P.push(...p0, ...p1, pm[0], pm[1] - 0.42, pm[2]); const c = cols[i % 3]; for (let k = 0; k < 3; k++) C.push(...c); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.computeVertexNormals(); const m = mesh(crazy, g, M.bunt, 0, 0, 0, 0, 0, 0, false); m.userData.base = P.slice(); bunts.push(m);
    const k = new Kit(); const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t - sag * 4 * t * (1 - t), A[2] + (B[2] - A[2]) * t]); } for (let i = 0; i < 20; i++) k.beam(M.paint, pts[i], pts[i + 1], 0.012, 0x3a2a24, true, 4); k.build(crazy); };
  for (const [a, b] of [[-26.4, -19.8], [-19, -12.6], [-11.8, -4.8], [-4, 4], [4.8, 11.2], [12, 18.6], [19.4, 25.8]]) bunting([a, 6.4, ZF + 0.3], [b, 6.4, ZF + 0.3], 12, 0.5);
  bunting([-30, 3.4, ZK - 0.1], [-4.6, 3.4, ZK - 0.1], 30, 0.0); bunting([4.6, 3.4, ZK - 0.1], [30, 3.4, ZK - 0.1], 30, 0.0); bunting([-3.6, 8.2, ZF + 0.3], [-4.8, 7.0, 7.2], 18, 0.7); bunting([3.6, 8.2, ZF + 0.3], [4.8, 7.0, 7.2], 18, 0.7);
  { const k = new Kit(); for (const x of [-4.8, 4.8]) { k.put(M.wood, cyl(0.1, 0.13, 7.6, 8), x, 3.8, 7.2, 0, 0, 0, 1, 1, 1, 0x6a4a30); k.put(M.brass, sph(0.14, 8, 6), x, 7.7, 7.2, 0, 0, 0, 1, 1, 1, 0xd8b050); } k.beam(M.paint, [-4.8, 7.3, 7.2], [4.8, 7.3, 7.2], 0.02, 0x3a2a24, true, 4); k.build(crazy); }
  const banner = mesh(crazy, new THREE.PlaneGeometry(8.4, 1.9, 24, 4), M.banner, 0, 6.3, 7.2, 0, 0, 0, false); // faces the camera looking +z... (reversed for street-side views)
  const banner2 = mesh(crazy, new THREE.PlaneGeometry(6.0, 1.4, 20, 3), M.banner, 0, 6.15, ZF + 0.28, 0, 0, 0, false); // on the apothecary parapet
  const flagPole = new Kit(); flagPole.put(M.wood, cyl(0.05, 0.06, 4, 8), -16, 9, ZF - 0.6, 0, 0, 0, 1, 1, 1, 0xe8e0d0); flagPole.put(M.brass, sph(0.09, 8, 6), -16, 11.05, ZF - 0.6, 0, 0, 0, 1, 1, 1, 0xd8b050); flagPole.build(crazy);
  const flag = mesh(crazy, new THREE.PlaneGeometry(1.8, 1.1, 12, 4), M.flag, -16 + 0.9, 10.35, ZF - 0.6, 0, 0, 0, false); flag.geometry.translate(0, 0, 0);
  // GLOOM mood: closed shutters on the stall (a tarp over the tomatoes)
  const gloom = new THREE.Group(); root.add(gloom); { const k = new Kit(); k.at(MK[0], 0, MK[2], 0.05, () => { k.put(M.canvas, lumpGeo(31, 1, 0.12), 0, 1.15, 0, 0, 0, 0, 1.75, 0.28, 0.75, 0xa89880); }); k.build(gloom); }
  const queue = []; for (let i = 0; i < 8; i++) queue.push(W3('street', [2.5 + i * 0.95, BY, ZF + 1.3 + (i % 2) * 0.15]));
  const crowd = []; for (let i = 0; i < 10; i++) crowd.push(W3('street', [-6 + (i % 5) * 1.6 + (R() - 0.5) * 0.4, 0, -2.2 + Math.floor(i / 5) * 1.5]));
  return { carb, lamps, pops, crazy, gloom, bunts, banner, banner2, flag, queue, crowd, ZF, ZK, BY, MK, BZ, LP };
}

// ================================================================= DINER (modern finale)
function buildDiner(root) {
  const R = rng(2026), K = new Kit(), TY = 0.76;
  mesh(root, plane(16, 14), M.check, 0, 0, 0, -Math.PI / 2, 0, 0, false);
  // table + booth benches (red vinyl) facing each other along x
  K.box(M.table, -0.75, 0.75, TY - 0.04, TY, -0.48, 0.48, 0xffffff, 0.02); K.box(M.chrome, -0.76, 0.76, TY - 0.06, TY - 0.03, -0.49, 0.49, 0xd8d8e0, 0.01); K.put(M.chrome, cyl(0.05, 0.05, TY - 0.05, 10), 0, (TY - 0.05) / 2, 0, 0, 0, 0, 1, 1, 1, 0xc8c8d0); K.put(M.chrome, cyl(0.3, 0.32, 0.03, 18), 0, 0.015, 0, 0, 0, 0, 1, 1, 1, 0xc8c8d0);
  for (const s of [-1, 1]) { K.box(M.vinyl, s * 0.95 - 0.28, s * 0.95 + 0.28, 0.0, 0.46, -0.6, 0.6, 0xffffff, 0.06); K.box(M.vinyl, s * 1.25 - 0.1, s * 1.25 + 0.1, 0.4, 1.25, -0.6, 0.6, 0xffffff, 0.08); K.box(M.chrome, s * 0.95 - 0.3, s * 0.95 + 0.3, 0.0, 0.08, -0.62, 0.62, 0xa8a8b0, 0.01); }
  // back: window wall with sunset street beyond, sill, blinds rail; chrome trim
  const ZW = -0.95; K.box(M.paint, -4, 4, 0, 0.9, ZW - 0.2, ZW, 0xe8d8c0, 0.02); K.box(M.chrome, -4, 4, 0.88, 0.94, ZW - 0.2, ZW + 0.08, 0xd8d8e0, 0.01); K.box(M.paint, -4, 4, 2.6, 3.4, ZW - 0.2, ZW, 0xe8d8c0, 0.02);
  for (const x of [-2.4, -0.8, 0.8, 2.4]) K.box(M.chrome, x - 0.04, x + 0.04, 0.9, 2.6, ZW - 0.12, ZW - 0.04, 0xc8c8d0, 0.01); for (let i = 0; i < 9; i++) K.box(M.paint, -4, 4, 2.2 + i * 0.045, 2.23 + i * 0.045, ZW - 0.1, ZW - 0.06, 0xe8dcc8, 0.004);
  mesh(root, plane(14, 6), M.dinerOut, 0, 2.0, ZW - 4, 0, 0, 0, false);
  K.box(M.paint, -4, 4, 0.0, 0.9, ZW - 0.2, ZW - 0.18, 0xb02a2a, 0.01);
  // table dressing: napkin dispenser, salt + pepper, glass of soda with straw, cutlery on a napkin
  K.box(M.chrome, -0.62, -0.46, TY, TY + 0.14, -0.38, -0.28, 0xd8d8e0, 0.01); K.box(M.paint, -0.6, -0.48, TY + 0.14, TY + 0.17, -0.37, -0.29, 0xffffff, 0.005);
  for (const [x, c] of [[-0.38, 0xf4f4f4], [-0.32, 0x5a4a4a]]) { K.put(M.jar, cyl(0.02, 0.022, 0.08, 10), x, TY + 0.04, -0.34, 0, 0, 0, 1, 1, 1, 0xffffff); K.put(M.chrome, cyl(0.021, 0.021, 0.02, 10), x, TY + 0.09, -0.34, 0, 0, 0, 1, 1, 1, 0xd0d0d8); K.put(M.paint, cyl(0.017, 0.017, 0.05, 8), x, TY + 0.03, -0.34, 0, 0, 0, 1, 1, 1, c); }
  K.put(M.liquid, cyl(0.036, 0.03, 0.13, 14), 0.52, TY + 0.065, -0.2, 0, 0, 0, 1, 1, 1, 0x6a2a1a); K.beam(M.paint, [0.52, TY + 0.05, -0.2], [0.55, TY + 0.24, -0.23], 0.005, 0xf4f0f0, true, 6); for (let i = 0; i < 3; i++) K.cb(M.paint, 0.022, 0.022, 0.022, 0.515 + (i - 1) * 0.012, TY + 0.12, -0.2 + (i % 2) * 0.01, 0xe0f0ff, R(), R(), 0, 0.005);
  K.cb(M.paint, 0.14, 0.004, 0.2, 0.62, TY + 0.002, 0.18, 0xffffff, 0, 0.1, 0, 0.003); K.cb(M.chrome, 0.012, 0.004, 0.18, 0.6, TY + 0.006, 0.18, 0xd8d8e0, 0, 0.1, 0, 0.002); K.cb(M.chrome, 0.012, 0.004, 0.18, 0.64, TY + 0.006, 0.18, 0xd8d8e0, 0, 0.1, 0, 0.002);
  // plate: burger + fries
  const PL = [0.12, TY, 0.04]; K.put(M.plate, lathe('plate', [[0.001, 0], [0.13, 0], [0.15, 0.006], [0.2, 0.022], [0.21, 0.026], [0.2, 0.028], [0.15, 0.012], [0.001, 0.009]], 32), PL[0], PL[1], PL[2], 0, 0, 0, 1, 1, 1, 0xffffff);
  K.at(PL[0] - 0.06, TY + 0.01, PL[2] - 0.03, 0.4, () => { K.put(M.food, lathe('bunb', [[0.001, 0], [0.075, 0], [0.085, 0.012], [0.082, 0.026], [0.001, 0.028]], 20), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xd89a50);
    K.put(M.food, cyl(0.088, 0.086, 0.026, 16), 0, 0.04, 0, 0, 0, 0, 1, 1, 1, 0x5a3020); K.cb(M.food, 0.15, 0.006, 0.15, 0, 0.056, 0, 0xf0b830, 0, 0.6, 0.06, 0.003);
    K.put(M.leaf, tor(0.08, 0.012, 5, 22), 0, 0.064, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x6aa83a); K.put(M.tomato, cyl(0.07, 0.07, 0.01, 16), 0.005, 0.072, 0, 0, 0, 0, 1, 1, 1, 0xd8261c);
    K.put(M.food, lathe('bunt', [[0.001, 0.0], [0.085, 0.0], [0.088, 0.02], [0.075, 0.05], [0.045, 0.068], [0.001, 0.074]], 22), 0, 0.078, 0, 0, 0, 0, 1, 1, 1, 0xd08a40);
    for (let i = 0; i < 18; i++) { const a = R() * TAU, rr = Math.sqrt(R()) * 0.065, y = 0.078 + 0.074 * Math.sqrt(1 - (rr / 0.088) ** 2) - 0.004; K.put(M.food, sph(0.004, 5, 4), Math.cos(a) * rr, y, Math.sin(a) * rr, 0, a, 0, 1.6, 0.6, 1, 0xf8ecc8); } });
  for (let i = 0; i < 46; i++) { const x = PL[0] + 0.08 + (R() - 0.3) * 0.1, z = PL[2] - 0.01 + (R() - 0.5) * 0.1, y = TY + 0.02 + (i > 26 ? 0.02 : 0) + R() * 0.01; K.cb(M.food, 0.014, 0.014, 0.08 + R() * 0.04, x, y, z, [0xf0c050, 0xe8b040, 0xf4cc60, 0xd89a30][i % 4], (R() - 0.5) * 0.5, R() * TAU, (R() - 0.5) * 0.3, 0.004); }
  // diner background: counter + stools, pendant lamps, pie case, a neon tube squiggle (no words)
  K.box(M.paint, 2.4, 6.5, 0, 1.05, -0.4, 0.4, 0xe8e0d0, 0.02); K.box(M.chrome, 2.35, 6.55, 1.05, 1.1, -0.45, 0.45, 0xd8d8e0, 0.01); K.box(M.vinyl, 2.4, 6.5, 0.0, 0.18, 0.38, 0.42, 0xffffff, 0.01);
  for (let i = 0; i < 4; i++) { const x = 2.8 + i * 1.0; K.put(M.chrome, cyl(0.04, 0.04, 0.7, 8), x, 0.35, 0.85, 0, 0, 0, 1, 1, 1, 0xc8c8d0); K.put(M.vinyl, cyl(0.2, 0.2, 0.1, 16), x, 0.75, 0.85, 0, 0, 0, 1, 1, 1, 0xffffff); }
  K.box(M.jar, 3.2, 4.2, 1.1, 1.5, -0.3, 0.1, 0xffffff, 0.01); for (let i = 0; i < 2; i++) K.put(M.food, cyl(0.15, 0.15, 0.06, 16), 3.45 + i * 0.5, 1.16, -0.1, 0, 0, 0, 1, 1, 1, 0xd8a050);
  K.box(M.paint, 2, 8, 0, 3.4, -2.5, -2.3, 0xc8b8a8, 0.02);
  for (const [x, z] of [[0, 0.0], [3.6, 0.2], [5.4, 0.2]]) { K.beam(M.chrome, [x, 3.4, z], [x, 2.15, z], 0.006, 0x2a2a30, true, 4); K.put(M.paint, lathe('shade', [[0.03, 0.12], [0.06, 0.1], [0.2, -0.02], [0.21, -0.04]], 18), x, 2.05, z, 0, 0, 0, 1, 1, 1, 0xb02a2a); K.put(M.lampGlass, sph(0.06, 10, 8), x, 2.02, z, 0, 0, 0, 1, 1, 1, 0xffffff); }
  { const P = []; for (let i = 0; i <= 30; i++) { const t = i / 30; P.push(new THREE.Vector3(3.0 + t * 2.4, 2.4 + 0.15 * Math.sin(t * 14), -2.25)); } mesh(root, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 60, 0.02, 6), M.neon, 0, 0, 0, 0, 0, 0, false); }
  K.box(M.paint, -5, -2, 0, 3.4, -2.6, -2.4, 0xc8b8a8, 0.02); K.box(M.vinyl, -4.6, -2.4, 0.0, 1.2, -1.4, -1.0, 0xffffff, 0.05);
  K.build(root, 4);
  const glows = [glowAt(root, [0, 2.0, 0], 0.9, '#ffc070', 0.45), glowAt(root, [3.6, 2.0, 0.2], 0.9, '#ffc070', 0.45), glowAt(root, [5.4, 2.0, 0.2], 0.9, '#ffc070', 0.45), glowAt(root, [4.2, 2.4, -2.2], 2.0, '#ff6a8a', 0.35)];
  // the bottle: group pivot at the bottle base centre; local +y up; nozzle tip at y = NZ
  const bottle = new THREE.Group(); root.add(bottle); const body = new THREE.Group(); bottle.add(body);
  const BH = 0.17; mesh(body, lathe('bot', [[0.001, 0], [0.03, 0], [0.036, 0.008], [0.037, 0.03], [0.036, BH * 0.8], [0.032, BH * 0.92], [0.024, BH], [0.001, BH]], 28), M.bottle, 0, 0, 0, 0, 0, 0, true);
  const lab = new THREE.CylinderGeometry(0.0375, 0.0375, 0.075, 28, 1, true, -Math.PI * 0.55, Math.PI * 1.1); mesh(body, lab, M.label, 0, 0.068, 0, 0, 0, 0, false);
  mesh(bottle, cyl(0.026, 0.026, 0.03, 20), M.bottle, 0, BH + 0.012, 0).material = M.bottle; mesh(bottle, cyl(0.024, 0.027, 0.006, 20), M.bottle, 0, BH + 0.03, 0); mesh(bottle, cyl(0.004, 0.012, 0.032, 12), M.bottle, 0, BH + 0.048, 0);
  const NZ = BH + 0.064; const bHi = nond(mesh(body, plane(0.007, 0.03), M.hi, -0.022, 0.125, 0.031, 0, -0.6, 0, false)); bHi.material = M.hi.clone(); bHi.material.opacity = 0.5;
  const REST = { p: [-0.3, TY, 0.14], r: [0, 0.35, 0] }; const D = [PL[0] + 0.07, TY + 0.012, PL[2] + 0.125]; // dollop centre on the plate, beside the fries
  // dollop: spiral tube, revealed by drawRange
  const dpts = []; for (let i = 0; i <= 80; i++) { const s = i / 80, a = s * 2.2 * TAU, r = 0.036 * (1 - s * 0.75) * (1 + 0.12 * Math.sin(a * 2.5)); dpts.push(new THREE.Vector3(D[0] + Math.cos(a) * r, D[1] + 0.005 + s * 0.011, D[2] + Math.sin(a) * r * 0.85)); }
  const dGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dpts), 160, 0.0085, 10); const dollop = mesh(root, dGeo, M.ketchup, 0, 0, 0, 0, 0, 0, true); dollop.userData.n = dGeo.index.count;
  const dTip = mesh(root, sph(0.0095, 10, 8), M.ketchup, 0, 0, 0, 0, 0, 0, false); const dBase = mesh(root, sph(1, 18, 8), M.ketchup, D[0], D[1], D[2], 0, 0, 0, false); dBase.scale.set(0.04, 0.006, 0.04);
  const stream = mesh(root, new THREE.BufferGeometry(), M.ketchup, 0, 0, 0, 0, 0, 0, false);
  return { bottle, body, NZ, BH, REST, D, dpts, dollop, dTip, dBase, stream, glows, PL, TY, ZW };
}

// ================================================================= lights, grades, practicals, views
const SET_LIGHT = {
  lecture: { top: '#000000', hor: '#2a1c14', fog: '#2a1c16', fogN: 14, fogF: 70, sky: '#ffe2c4', ground: '#8a6248', hemiI: 1.25, fillCol: '#7a7ad8', fillI: 0.32, sunCol: '#ffc888', sunI: 3.4, az: -68, el: 26, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
  street: { top: '#4a7ad0', hor: '#b8d0f0', fog: '#e8dcc8', fogN: 60, fogF: 320, sky: '#a8c0f0', ground: '#6a5060', hemiI: 0.7, fillCol: '#7d90e6', fillI: 0.36, sunCol: '#ffdcaa', sunI: 3.8, az: 38, el: 34, disc: '#fffbe8', cloud: '#ffffff', cardTint: '#ffffff', fxTint: '#ffffff', shafts: 0.4 },
  streetGloom: { top: '#5a6276', hor: '#9aa0b0', fog: '#8c92a4', fogN: 30, fogF: 200, sky: '#9aa2bc', ground: '#4a4658', hemiI: 1.15, fillCol: '#8a96c8', fillI: 0.35, sunCol: '#c8d0e4', sunI: 1.1, az: 30, el: 52, disc: '#b8bcc8', discSize: 0.0008, cloud: '#7e8296', cardTint: '#e8ecf6', fxTint: '#eef0f6', shafts: 0 },
  diner: { top: '#000000', hor: '#2a1a14', fog: '#3a2420', fogN: 4, fogF: 26, sky: '#ffd8b0', ground: '#5a2a2a', hemiI: 0.95, fillCol: '#8a7ae0', fillI: 0.3, sunCol: '#ffa860', sunI: 2.6, az: -150, el: 14, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  lecture: { look: 'office', over: { exp: 1.14, con: 1.28, sat: 1.04, lift: [0.035, 0.022, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.1], bloom: [0.45, 0.75], hal: [0.28, '#ff9a50'], vig: [0.34, 0.46, '#2a1420'] } },
  street: { look: 'day', over: { exp: 1.04, con: 1.24, sat: 1.06, tS: ['#3a3a8a', 0.14], tH: ['#ffd8a0', 0.08], bloom: [0.4, 0.85], hal: [0.18, '#ff7a40'] } },
  streetGloom: { look: 'day', over: { exp: 0.98, con: 1.16, sat: 0.72, lift: [0.03, 0.035, 0.055], tS: ['#2a3a6a', 0.24], tH: ['#c8d4ec', 0.12], bloom: [0.5, 0.7], hal: [0.1, '#8090c0'], vig: [0.34, 0.48, '#1e2236'] } },
  diner: { look: 'office', over: { exp: 1.12, con: 1.26, sat: 1.1, lift: [0.035, 0.02, 0.04], tS: ['#3a2a6a', 0.16], tH: ['#ffb070', 0.14], bloom: [0.42, 0.8], hal: [0.32, '#ff8a40'], vig: [0.34, 0.45, '#2a1420'] } },
};

export function buildOhio(ctx) {
  ({ THREE, toon, mkTex, PT } = ctx); NOND = ctx.NOND || null; CAM = ctx.camera || null; MACRO = ctx.macro || null;
  M = materials();
  const groups = {};
  for (const name of SETS) { const g = new THREE.Group(); g.name = 'ohio_' + name; g.position.set(...O[name]); g.visible = false; ctx.scene.add(g); groups[name] = g; }
  const le = buildLecture(groups.lecture), st = buildStreet(groups.street), di = buildDiner(groups.diner);
  const spots = {
    // lecture: lecturer, table, students (rows[r][k] = feet on tier r; seat top at +0.48)
    lectern: W3('lecture', [le.LX - 0.1, 0, le.LZ + 0.7]), lecturer: W3('lecture', [le.LX - 0.6, 0, le.LZ + 0.4]), demoTable: W3('lecture', [le.TX + 0.2, 0, le.TZ + 0.8]), chart: W3('lecture', [le.CH.x + 1.7, 0, le.ZB + 1.2]),
    chalkboard: W3('lecture', [le.BD.x - 0.5, 0, le.ZB + 1.0]), pitFront: W3('lecture', [0, 0, -1.2]), door: W3('lecture', [le.X - 0.8, 0, 0.6]), students: le.rows, seatH: 0.48,
    // street: queue outside the apothecary (queue[0] at the door), crowd in the road, the stall, lamp posts
    apothDoor: W3('street', [2.5, st.BY, st.ZF + 0.8]), queue: st.queue, crowd: st.crowd, stall: W3('street', [st.MK[0], 0, st.MK[2] + 1.3]), stallKeeper: W3('street', [st.MK[0] + 0.3, 0, st.MK[2] - 1.1]),
    window: W3('street', [-1.1, st.BY, st.ZF + 1.6]), boardwalk: W3('street', [-8, st.BY, st.ZF + 1.4]), road: W3('street', [0, 0, 1]), cart: W3('street', [19, 0, 1.4]),
    // diner
    table: W3('diner', [0, di.TY, 0]), seatL: W3('diner', [-0.95, 0, 0]), seatR: W3('diner', [0.95, 0, 0]), bottleRest: W3('diner', di.REST.p), dollop: W3('diner', di.D), plate: W3('diner', di.PL), bottleNozzle: null,
  };
  const V = (set, p, l, fov, cInf, fp, extra = {}) => { const c = { set, p: W3(set, p), l: W3(set, l), fov, cInf, fp: fp ? W3(set, fp) : null, ...extra }; c.focus = Math.hypot(...[0, 1, 2].map((i) => c.p[i] - (c.fp || c.l)[i])); return c; };
  const views = [
    V('lecture', [-1.6, 5.9, 7.4], [-0.4, 0.6, -5.6], 56, 1.4, [-0.5, 1.2, -4.0]), // 0 wide from the top tier: tiers, pit, lectern, chart, shafts
    V('lecture', [0.7, 1.55, -1.0], [-0.5, 3.3, 6.0], 60, 1.6, [0, 2.4, 3.6]), // 1 low from the pit up at the tiers (student spots)
    V('lecture', [2.6, 1.7, 0.6], [0.2, 1.9, -6.0], 44, 2.6, [1.0, 1.3, -4.4]), // 2 lectern medium: lectern + lamp, chart behind
    V('lecture', [-2.2, 3.55, -3.0], [-2.5, 3.55, -7.6], 42, 3, [-2.5, 3.55, -7.4]), // 3 TOMATO chart close-up
    V('lecture', [-0.85, 1.5, -2.0], [-1.95, 0.9, -3.55], 40, 6, [-1.9, 0.95, -3.4]), // 4 demo table insert: basket, jars, halved tomato
    V('lecture', [2.9, 2.05, -2.3], [2.9, 1.95, -7.6], 44, 3, [2.9, 2.0, -7.5]), // 5 chalkboard "TOMATO = MEDICINE?"
    V('street', [-2.2, 1.9, 8.6], [-1.2, 3.7, -6], 56, 1.4, [-1, 2, -5], { mood: 'crazy', signs: 1 }), // 6 street wide, tomato crazy (banner, bunting, signs)
    V('street', [4.2, 1.7, 3.6], [0.4, 1.9, -6.4], 44, 2.2, [0.8, 1.6, -5.2], { mood: 'crazy', signs: 1 }), // 7 apothecary medium: carboys, sign, queue spots
    V('street', [-1.1, 1.6, -0.8], [-1.2, 1.45, -5.9], 48, 5, [-1.2, 1.5, -5.6], { mood: 'crazy', signs: 0 }), // 8 carboys close-up
    V('street', [-21.3, 1.65, -1.0], [-21.3, 1.6, -6.4], 44, 4, [-21.3, 1.6, -6.3], { mood: 'crazy', signs: 1 }), // 9 posters close: DR. MILES' vs PHELPS'
    V('street', [7.5, 1.9, 8.4], [-6, 3.2, -6], 54, 1.4, [-4, 2, -4], { mood: 'suspicious', signs: 0 }), // 10 street wide, suspicious (overcast)
    V('street', [-12.6, 2.1, 1.5], [-14.6, 1.0, -1.5], 46, 4, [-14.4, 1.1, -1.4], { mood: 'crazy', signs: 0 }), // 11 market stall close: piles of tomatoes
    V('diner', [-0.22, 1.16, 1.3], [-0.12, 0.88, -0.4], 46, 3, [-0.05, 0.8, 0.08], { squeeze: 0 }), // 12 diner wide table
    V('diner', [-0.22, 0.92, 0.54], [-0.3, 0.86, 0.14], 30, 9, [-0.3, 0.86, 0.14], { squeeze: 0 }), // 13 bottle macro at rest: KETCHUP label
    V('diner', [0.62, 0.98, 0.62], [0.2, 0.86, 0.1], 32, 8, [0.22, 0.86, 0.12], { squeeze: 0.6 }), // 14 squeeze macro: stream + dollop forming
    V('diner', [0.42, 0.98, 0.62], [0.17, 0.79, 0.12], 30, 8, [0.19, 0.785, 0.16], { squeeze: 1 }), // 15 finished dollop beside the fries
    V('street', [-8.6, 1.8, 1.4], [-8.4, 2.5, -6.4], 48, 3, [-8.3, 2.8, -6.2], { mood: 'crazy', signs: 1 }), // 16 general store with TOMATO PILLS SOLD HERE
    V('lecture', [5.0, 2.3, 1.6], [-6, 2.2, -2.8], 52, 2, [-1.5, 1, -3.0]), // 17 across the pit toward the windows: light shafts, dust, table
  V('street', [7.5, 1.9, 8.4], [-6, 3.2, -6], 54, 1.4, [-4, 2, -4], { mood: 'crazy', signs: 1 }), // 18 street wide diagonal, tomato crazy (same framing as 10)
  ];
  for (const v of views) if (v.set === 'street' && v.mood === 'suspicious') v.set = 'streetGloom';
  let FRAME = 0, CUR = null, MOOD = 'crazy', SIGNS = 0, SQ = 0;
  const m4 = new THREE.Matrix4(), v3 = new THREE.Vector3(), q0 = new THREE.Quaternion(), e0 = new THREE.Euler(), s3 = new THREE.Vector3(1, 1, 1);
  const API = {
    groups, origin: O, spots, views,
    // street: mood 'crazy' (sunny, bunting, tomato banner) | 'suspicious' (overcast, stall covered, no bunting)
    mood(m) { MOOD = m === 'suspicious' || m === 'gloom' ? 'suspicious' : 'crazy'; st.crazy.visible = MOOD === 'crazy'; st.gloom.visible = MOOD !== 'crazy'; st.lamps.forEach((g) => (g.material.opacity = MOOD === 'crazy' ? 0.3 : 0.55)); },
    // street: pop-in tomato-pill signs, n 0..1 (staggered, each with a bounce)
    signs(n) { SIGNS = clamp01(n); const N = st.pops.length; st.pops.forEach((g, i) => { const k = clamp01(SIGNS * N * 1.0 - i * 0.92), s = k <= 0 ? 0.0001 : backOut(k); g.visible = k > 0; g.scale.set(s, s, 1); g.rotation.z = (1 - k) * 0.4 * (i % 2 ? 1 : -1); }); },
    // diner: squeeze(t 0..1): 0-0.25 lift + invert over the plate, 0.25-0.33 squeeze, 0.33-0.86 stream + swirl dollop, 0.86-1 stream breaks, bottle lifts
    squeeze(t) { SQ = clamp01(t); const lift = sm(0.0, 0.25, SQ), press = sm(0.25, 0.33, SQ) * (1 - sm(0.86, 0.95, SQ)), tip = di.D;
      const pourP = [tip[0] - 0.02, tip[1] + 0.26 + di.NZ, tip[2] + 0.01];
      const p = di.REST.p.map((a, i) => a + (pourP[i] - a) * lift); p[1] += Math.sin(lift * Math.PI) * 0.08 + sm(0.88, 1, SQ) * 0.04; di.bottle.position.set(...p); di.bottle.rotation.set(0, di.REST.r[1] * (1 - lift), lift * (Math.PI - 0.18), 'YXZ');
      di.body.scale.set(1 - 0.16 * press, 1 + 0.03 * press, 1 + 0.06 * press);
      di.bottle.updateMatrixWorld(true); const nz = new THREE.Vector3(0, di.NZ, 0).applyMatrix4(di.bottle.matrix); spots.bottleNozzle = W3('diner', nz.toArray());
      const g = clamp01((SQ - 0.36) / 0.5), n = di.dollop.userData.n, cnt = Math.floor(g * n / 6) * 6; di.dollop.geometry.setDrawRange(0, cnt); di.dollop.visible = cnt > 0;
      const top = di.dpts[Math.min(di.dpts.length - 1, Math.floor(g * (di.dpts.length - 1)))]; di.dTip.visible = cnt > 0; di.dTip.position.copy(top); di.dBase.visible = g > 0.05; di.dBase.scale.set(0.046 * Math.min(1, g * 2.5), 0.0075, 0.04 * Math.min(1, g * 2.5));
      // stream from nozzle to the top of the swirl: head falls in 0.33-0.37, tail leaves the nozzle 0.84-0.9
      const head = sm(0.33, 0.37, SQ), tail = sm(0.84, 0.9, SQ); di.stream.visible = head > 0 && tail < 1;
      if (di.stream.visible) { const a = nz.clone(), b = top.clone().add(new THREE.Vector3(0, 0.006, 0)), P = []; for (let i = 0; i <= 12; i++) { const s = tail + (head - tail) * i / 12; P.push(new THREE.Vector3(a.x + (b.x - a.x) * s + Math.sin(s * 9 + FRAME * 0.3) * 0.002, a.y + (b.y - a.y) * s, a.z + (b.z - a.z) * s)); }
        di.stream.geometry.dispose(); di.stream.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 24, 0.0055 * (0.7 + 0.3 * press), 8); } },
    tick(f) { FRAME = f; const T = f / 30;
      if (CUR === 'lecture' || CUR == null) { le.shafts.forEach((s, i) => { s.material.opacity = 0.2 + 0.05 * Math.sin(f * 0.025 + i * 1.3); }); le.glows.forEach((g, i) => { g.material.opacity = g.userData.op * (0.92 + 0.08 * Math.sin(f * 0.6 + i * 2.1) * Math.sin(f * 0.21 + i)); });
        const into = le.into, nW = le.WZ.length; for (let i = 0; i < le.dustP.length; i++) { const d = le.dustP[i], s = (d[0] + T * 0.004) % 1, wz = le.WZ[d[3] % nW], y0 = (le.S0 + le.S1) / 2;
          v3.set(-le.X, y0 + d[1] * (le.S1 - le.S0) * 0.9, wz + d[2] * le.WW * 0.9).addScaledVector(into, 0.6 + s * 8.5); v3.x += Math.sin(T * 0.4 + d[4]) * 0.08; v3.y += Math.sin(T * 0.31 + d[4] * 2) * 0.1; v3.z += Math.cos(T * 0.27 + d[4]) * 0.08;
          const k = Math.sin(s * Math.PI) * (0.6 + 0.4 * Math.sin(T * 2 + d[4])); m4.compose(v3, q0, s3.setScalar(Math.max(0.05, k))); le.dust.setMatrixAt(i, m4); } le.dust.instanceMatrix.needsUpdate = true; }
      if (CUR === 'street' || CUR == null) { st.carb.forEach((g, i) => { g.material.opacity = 0.5 + 0.12 * Math.sin(f * 0.08 + i * 1.7); }); st.lamps.forEach((g, i) => { g.scale.setScalar(1 + 0.05 * Math.sin(f * 0.7 + i)); });
        for (const b of st.bunts) { const p = b.geometry.attributes.position, B = b.userData.base; for (let j = 2; j < p.count; j += 3) { const ph = j * 0.37; p.setZ(j, B[j * 3 + 2] + Math.sin(f * 0.18 + ph) * 0.12); p.setX(j, B[j * 3] + Math.sin(f * 0.13 + ph) * 0.05); } p.needsUpdate = true; }
        for (const fg of [st.flag, st.banner, st.banner2]) { const p = fg.geometry.attributes.position; if (!fg.userData.base) fg.userData.base = p.array.slice(); const B = fg.userData.base, big = fg === st.flag; for (let j = 0; j < p.count; j++) { const x = B[j * 3], y = B[j * 3 + 1]; p.setZ(j, big ? Math.sin(x * 3 - f * 0.25) * 0.12 * (x + 0.9) : Math.sin(x * 0.9 - f * 0.08 + y) * 0.06); } p.needsUpdate = true; fg.geometry.computeVertexNormals(); } }
      if (CUR === 'diner' || CUR == null) { di.glows.forEach((g, i) => { g.material.opacity = g.userData.op * (0.95 + 0.05 * Math.sin(f * 0.2 + i)); }); }
      API.face(); },
    lightFor(name) { const base = name === 'street' ? 'day' : name === 'streetGloom' ? 'day' : 'office'; return { ...LIGHTS_[base], ...SET_LIGHT[name] }; },
    gradeFor: (name) => ({ ...((SET_GRADE[name] || {}).over || {}) }),
    lookFor: (name) => (SET_GRADE[name] || {}).look || 'day',
    show(world, name) { const gname = name ? GROUP_OF[name] : null; for (const k in groups) groups[k].visible = k === gname; CUR = gname;
      if (name === 'streetGloom') API.mood('suspicious'); else if (name === 'street') API.mood(MOOD);
      if (name) { for (const k of ['road', 'stadium', 'office', 'car', 'dc']) if (world[k]) world[k].visible = false; if (world.rooms) world.rooms.show(world, null); API.tick(FRAME); } },
    placeLights(PRACT, name) { const L = API.practicals(name); PRACT.forEach((l, i) => { const c = L[i]; l.visible = true; if (!c) { l.intensity = 0; return; } l.position.set(...c.p); l.color.set(c.col); l.intensity = c.I; l.distance = c.d; l.decay = 1.6; }); API.face(GROUP_OF[name]); },
    practicals(name) { const fl = 1 + 0.1 * Math.sin(FRAME * 0.9) * Math.sin(FRAME * 0.37);
      if (name === 'lecture') return [{ p: W3('lecture', [le.lampP[0], 1.75, le.lampP[2] + 0.2]), col: '#ffb860', I: 2.2 * fl, d: 5 }, { p: W3('lecture', [-5.0, 3.7, le.ZB + 0.6]), col: '#ffb050', I: 1.6 * fl, d: 6 }, { p: W3('lecture', [0, 4.9, -3.2]), col: '#ffc070', I: 2.6, d: 9 }, { p: W3('lecture', [0, 3.4, 0.4]), col: '#ffd0a0', I: 26.0, d: 16 }];
      if (name === 'street' || name === 'streetGloom') { const g = name === 'streetGloom' ? 1.6 : 1; return [{ p: W3('street', [-2.8, 1.6, st.BZ + 0.1]), col: '#ff4030', I: 1.6 * g, d: 4 }, { p: W3('street', [-1.15, 1.6, st.BZ + 0.3]), col: '#40ff80', I: 1.6 * g, d: 4 }, { p: W3('street', [0.45, 1.6, st.BZ + 0.1]), col: '#ffb030', I: 1.6 * g, d: 4 }, name === 'streetGloom' ? { p: W3('street', [-9.5, 3.4, st.ZK + 0.5]), col: '#ffb860', I: 1.4, d: 6 } : null]; }
      if (name === 'diner') return [{ p: W3('diner', [0, 1.85, 0.1]), col: '#ffc078', I: 1.8, d: 3.5 }, { p: W3('diner', [4.2, 2.3, -2.0]), col: '#ff6a8a', I: 2.0, d: 4 }, { p: W3('diner', [3.6, 1.6, 0.2]), col: '#ffc070', I: 1.4, d: 3 }];
      return []; },
    face(name = CUR) { const cam = CAM; if (!cam) return; const q = cam.quaternion;
      if (name === 'lecture') le.glows.forEach((g) => g.quaternion.copy(q));
      if (name === 'street') { st.lamps.forEach((g) => g.quaternion.copy(q)); st.carb.forEach((g) => g.quaternion.copy(q)); }
      if (name === 'diner') di.glows.forEach((g) => g.quaternion.copy(q)); },
    viewFor(i, f = 0) { const k = ((i % views.length) + views.length) % views.length, c = views[k];
      return { i: k, mod: API, set: c.set, f, mood: c.mood, signs: c.signs ?? 1, squeeze: c.squeeze ?? 0, L: API.lightFor(c.set), look: API.lookFor(c.set), grade: API.gradeFor(c.set), cam: { p: c.p, l: c.l, fov: c.fov, focus: c.focus, cInf: c.cInf, roll: c.roll || 0, shadowAt: c.fp || c.l } }; },
    apply(world, v) { API.show(world, v.set); if (v.set === 'street') API.mood(v.mood || 'crazy'); API.signs(v.signs ?? 1); API.squeeze(v.squeeze ?? 0); API.tick(v.f ?? FRAME); },
  };
  API.view = API.viewFor; API.mood('crazy'); API.signs(0); API.squeeze(0); API.tick(0);
  return API;
}
