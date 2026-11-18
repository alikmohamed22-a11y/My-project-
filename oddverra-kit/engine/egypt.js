// egypt.js [LIB-egypt]: sets for "The Statue of Liberty was supposed to stand in Egypt" (Oddverra short).
//   colossi : golden-hour Nile bank, 1855-56: a sandstone cliff temple with four weathered seated colossi (original design, one broken,
//             the left ones half-buried in a sand dune), turquoise Nile with feluccas, palms, far bank, and young Bartholdi's camp:
//             1850s ridge tent, easel with a sketch of the colossi, folding stool, trunk, lantern (practical).      origin (-9000, 0, 0)
//   canal   : Port Said, Mediterranean entrance of the Suez Canal, Nov 1869, sunset: canal cut, concrete-block breakwaters, bucket
//             dredgers with long chutes + smoke, paddle steamer dressed with bunting, quay town, "PORT SAID 1869" / "SUEZ CANAL"
//             signs; plain white octagonal lighthouse (setLighthouse(k): k = built height 0..1, beam), and the DREAM: a colossal
//             robed peasant woman holding a torch high on an Egyptian pedestal at the same spot (dream(t): glowing vision 0..1). origin (-9000, 0, 600)
//   palace  : Khedive Isma'il's hall, 1860s Ottoman-Egyptian: ablaq horseshoe arches, mashrabiya screens, Iznik tile dado, coffered
//             ceiling, big brass chandelier + pierced brass lanterns (practicals), carpets, divans; gilded desk with the statue
//             maquette and a long price scroll (setScroll(k) unrolls it off the desk across the carpet); horseshoe windows on a
//             sunset over Cairo minarets.                                                                              origin (-9000, 0, 1200)
// Each set: local frame, ground y = 0, camera side +z. All groups start hidden; show(world, name) displays one.
import { Kit, instance } from './world.js';
import { LIGHTS_ } from './story.js';

let THREE, toon, mkTex, PT, NOND, CAM, MACRO;
export const EGYPT_ORIGIN = { colossi: [-9000, 0, 0], canal: [-9000, 0, 600], palace: [-9000, 0, 1200] };
const O = EGYPT_ORIGIN, SETS = Object.keys(O);
const W3 = (name, p) => [p[0] + O[name][0], p[1] + O[name][1], p[2] + O[name][2]];
const INK = '#2b1d4a', TAU = Math.PI * 2;
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ---------------------------------------------------------------- geometry helpers
const GC = new Map();
const cached = (k, mk) => { let g = GC.get(k); if (!g) GC.set(k, (g = mk())); return g; };
const cyl = (rt, rb, h, rs = 12, open = false) => cached(`c${rt}|${rb}|${h}|${rs}|${open}`, () => new THREE.CylinderGeometry(rt, rb, h, rs, 1, open));
const sph = (r, ws = 14, hs = 10) => cached(`s${r}|${ws}|${hs}`, () => new THREE.SphereGeometry(r, ws, hs));
const tor = (r, t, rs = 6, ts = 24, arc = TAU) => cached(`t${r}|${t}|${rs}|${ts}|${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));
const plane = (w, h) => cached(`p${w}|${h}`, () => new THREE.PlaneGeometry(w, h));
const BOX = () => cached('box1', () => new THREE.BoxGeometry(1, 1, 1));
const lathe = (key, pts, n = 20, ps = 0, pl = TAU) => cached('la' + key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n, ps, pl));
const mesh = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, shadow = true) => { if (mat.vertexColors && !geo.attributes.color && geo.attributes.position) geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(1), 3)); const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz, 'YXZ'); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
const nond = (o) => { if (NOND) NOND.add(o); o.castShadow = false; return o; };
const lumpGeo = (seed, det = 2, rough = 0.22) => cached(`lump${seed}|${det}|${rough}`, () => { const g = new THREE.IcosahedronGeometry(1, det), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), h = Math.sin(x * 5.9898 + y * 7.233 + z * 3.719 + seed * 4.1) * 43758.5453, h2 = Math.sin(x * 2.1 + y * 1.3 + z * 2.9 + seed) * 0.5, k = 1 - rough / 2 + rough * (h - Math.floor(h)) * 0.6 + rough * 0.4 * h2; p.setXYZ(i, x * k, y * k * 0.85, z * k); }
  g.computeVertexNormals(); return g; });
const prismGeo = (w, h, d) => cached(`pr${w}|${h}|${d}`, () => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g; });
// lathe with vertical folds (robes), folds fade toward ytop
const robeGeo = (key, pts, folds, amp, ytop, n = 40, ps = 0, pl = TAU) => cached('robe' + key, () => { const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n, ps, pl), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(x, z), k = 1 + amp * Math.sin(a * folds + y * 1.3) * Math.max(0, Math.min(1, (ytop - y) / ytop)); p.setX(i, x * k); p.setZ(i, z * k); }
  g.computeVertexNormals(); return g; });
// a ribbon along a polyline (scroll paper): pts [[x,y,z]], width w, side vector fixed; uv v in metres / vlen
function ribbonGeo(pts, w, side, vlen) { const P = [], N = [], U = [], I = []; let L = 0; const a = new THREE.Vector3(), b = new THREE.Vector3(), t = new THREE.Vector3(), n = new THREE.Vector3(), s = new THREE.Vector3(...side);
  pts.forEach((p, i) => { a.set(...p); if (i) L += a.distanceTo(b.set(...pts[i - 1])); const q = pts[Math.min(pts.length - 1, i + 1)], r = pts[Math.max(0, i - 1)]; t.set(q[0] - r[0], q[1] - r[1], q[2] - r[2]).normalize(); n.crossVectors(t, s).normalize(); if (n.y < 0 && Math.abs(t.y) < 0.9) n.negate();
    for (const k of [-1, 1]) { P.push(p[0] + s.x * k * w / 2, p[1] + s.y * k * w / 2, p[2] + s.z * k * w / 2); N.push(n.x, n.y, n.z); U.push(k < 0 ? 0 : 1, L / vlen); }
    if (i) { const o = (i - 1) * 2; I.push(o, o + 1, o + 2, o + 1, o + 3, o + 2); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); return g; }
// a billowed triangle sail between A (head), B (tack), C (clew)
function sailGeo(A, B, C, bil, n = 10) { const P = [], N = [], U = [], I = [], a = new THREE.Vector3(...A), b = new THREE.Vector3(...B), c = new THREE.Vector3(...C), nr = new THREE.Vector3().crossVectors(b.clone().sub(a), c.clone().sub(a)).normalize(), idx = [];
  for (let i = 0; i <= n; i++) { idx.push([]); for (let j = 0; j <= n - i; j++) { const u = i / n, v = j / n, w = 1 - u - v, d = bil * 6.75 * u * v * w * 1.6 + bil * 0.25 * u * v; const p = a.clone().addScaledVector(b.clone().sub(a), u).addScaledVector(c.clone().sub(a), v).addScaledVector(nr, d); idx[i].push(P.length / 3); P.push(p.x, p.y, p.z); N.push(nr.x, nr.y, nr.z); U.push(u, v); } }
  for (let i = 0; i < n; i++) for (let j = 0; j < n - i; j++) { I.push(idx[i][j], idx[i + 1][j], idx[i][j + 1]); if (j < n - i - 1) I.push(idx[i + 1][j], idx[i + 1][j + 1], idx[i][j + 1]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); g.computeVertexNormals(); return g; }
// heightfield terrain with vertex colours
function terrain(root, w, d, nx, nz, cx, cz, hf, colf, mat) { const g = new THREE.PlaneGeometry(w, d, nx, nz); g.rotateX(-Math.PI / 2); const p = g.attributes.position, c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) + cx, z = p.getZ(i) + cz, y = hf(x, z); p.setY(i, y); c.set(colf(x, z, y), i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); m.position.set(cx, 0, cz); m.receiveShadow = true; m.castShadow = true; root.add(m); return m; }
// horseshoe arch outline (for Shape holes / paths): jambs at cx +- r cos(t0), springing below centre
function horseshoe(path, cx, sill, cy, r, t0 = 0.36) { const jx = r * Math.cos(t0), jy = cy - r * Math.sin(t0); path.moveTo(cx - jx, sill); path.lineTo(cx - jx, jy); path.absarc(cx, cy, r, Math.PI + t0, -t0, true); path.lineTo(cx + jx, sill); path.lineTo(cx - jx, sill); return path; }

// ---------------------------------------------------------------- painters
const css = (...a) => PT.css(...a), shade = (...a) => PT.shade(...a), tint = (...a) => PT.tint(...a), vary = (...a) => PT.vary(...a), rng = (...a) => PT.rng(...a), fbm = (...a) => PT.fbm(...a), modulate = (...a) => PT.modulate(...a), hex = (...a) => PT.hex(...a);
const SERIF = '"DejaVu Serif", Georgia, serif';
function txt(g, s, cx, cy, maxW, sz, o = {}) { g.save(); g.font = `${o.italic ? 'italic ' : ''}${o.bold === false ? '' : 'bold '}${sz | 0}px ${o.font || SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const tw = g.measureText(s).width, sx = Math.min(1, maxW / tw); g.translate(cx, cy); g.scale(sx, 1); if (o.shadow) { g.fillStyle = o.shadow; g.fillText(s, 3, 3); } g.fillStyle = o.col || INK; g.fillText(s, 0, 0); g.restore(); }
function grain(g, w, h, col, n, seed, a = 0.5) { const R = rng(seed); g.fillStyle = col; for (let i = 0; i < n; i++) { g.globalAlpha = a * R(); g.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2); } g.globalAlpha = 1; }
function sandTex(g, w, h, o = {}) { g.fillStyle = o.base || '#f0c890'; g.fillRect(0, 0, w, h); const R = rng(o.seed || 5), b = hex(o.base || '#f0c890');
  for (let i = 0; i < 70; i++) { const y = R() * h, x0 = R() * w, L = 60 + R() * 160; g.strokeStyle = css(shade(b, 0.8), 0.35); g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= L; x += 6) g.lineTo((x0 + x) % w, y + Math.sin((x0 + x) * 0.05) * 4); g.stroke(); g.strokeStyle = css(tint(b, 1.25), 0.4); g.lineWidth = 1.5; g.beginPath(); for (let x = 0; x <= L; x += 6) g.lineTo((x0 + x) % w, y - 3 + Math.sin((x0 + x) * 0.05) * 4); g.stroke(); }
  grain(g, w, h, css(shade(b, 0.6)), 2400, 3, 0.35); grain(g, w, h, '#fff4e0', 1200, 4, 0.4); modulate(g, w, h, (u, v) => 0.9 + 0.16 * fbm(u, v, 4, 4, 3, 11)); }
function sandstoneTex(g, w, h, o = {}) { const b = hex(o.base || '#ecc89c'), R = rng(o.seed || 9); g.fillStyle = css(b); g.fillRect(0, 0, w, h);
  let y = 0; while (y < h) { const t = 6 + R() * 26; g.fillStyle = css(vary(b, (R() - 0.5) * 0.22)); g.fillRect(0, y, w, t); g.fillStyle = css(shade(b, 0.7), 0.5); g.fillRect(0, y + t - 2, w, 2); y += t; } // strata
  for (let i = 0; i < 26; i++) { g.strokeStyle = css(shade(b, 0.5), 0.6); g.lineWidth = 1.5 + R() * 1.5; g.beginPath(); let x = R() * w, yy = R() * h; g.moveTo(x, yy); for (let k = 0; k < 8; k++) { x += (R() - 0.5) * 30; yy += 8 + R() * 14; g.lineTo(x, yy); } g.stroke(); } // cracks
  for (let i = 0; i < 90; i++) { g.fillStyle = css(shade(b, 0.62), 0.35 + R() * 0.3); g.beginPath(); g.ellipse(R() * w, R() * h, 2 + R() * 9, 1 + R() * 4, R() * 3, 0, TAU); g.fill(); } // pits
  grain(g, w, h, css(shade(b, 0.55)), 3000, 7, 0.3); grain(g, w, h, '#fff0d8', 1200, 8, 0.3); modulate(g, w, h, (u, v) => 0.85 + 0.24 * fbm(u, v, 3, 3, 4, o.seed || 9)); }
function glyphTex(g, w, h, o = {}) { const b = hex(o.base || '#e4bc90'); sandstoneTex(g, w, h, { base: o.base, seed: 13 }); const R = rng(o.seed || 21), cols = o.cols || 3, cw = w / cols, s = cw * 0.55;
  g.strokeStyle = css(shade(b, 0.55), 0.8); g.lineWidth = 2; for (let i = 1; i < cols; i++) { g.beginPath(); g.moveTo(i * cw, 0); g.lineTo(i * cw, h); g.stroke(); }
  for (let c = 0; c < cols; c++) for (let y = s * 0.7; y < h - s * 0.4; y += s * 1.15) { const x = c * cw + cw / 2, k = (R() * 9) | 0; g.save(); g.translate(x, y); g.fillStyle = css(shade(b, 0.48), 0.85); g.strokeStyle = css(shade(b, 0.45), 0.9); g.lineWidth = s * 0.09; g.beginPath();
    if (k === 0) { g.ellipse(0, 0, s * 0.42, s * 0.2, 0, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, s * 0.08, 0, TAU); g.fill(); } // eye
    else if (k === 1) { g.moveTo(-s * 0.4, 0); for (let i = 0; i <= 6; i++) g.lineTo(-s * 0.4 + i * s * 0.133, (i % 2 ? -1 : 1) * s * 0.12); g.stroke(); } // water
    else if (k === 2) { g.ellipse(0, -s * 0.15, s * 0.14, s * 0.18, 0, 0, TAU); g.moveTo(0, 0.03 * s); g.lineTo(0, s * 0.45); g.moveTo(-s * 0.25, s * 0.12); g.lineTo(s * 0.25, s * 0.12); g.stroke(); } // looped cross
    else if (k === 3) { g.ellipse(-s * 0.05, 0, s * 0.3, s * 0.16, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(s * 0.2, -s * 0.05); g.lineTo(s * 0.38, -s * 0.28); g.lineWidth = s * 0.07; g.stroke(); g.beginPath(); g.moveTo(-s * 0.1, s * 0.12); g.lineTo(-s * 0.15, s * 0.38); g.moveTo(s * 0.05, s * 0.12); g.lineTo(s * 0.08, s * 0.38); g.stroke(); } // bird
    else if (k === 4) { g.arc(0, 0, s * 0.2, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, s * 0.05, 0, TAU); g.fill(); } // sun
    else if (k === 5) { g.fillRect(-s * 0.35, -s * 0.07, s * 0.7, s * 0.14); } // bar
    else if (k === 6) { g.moveTo(-s * 0.3, s * 0.3); g.lineTo(0, -s * 0.3); g.lineTo(s * 0.3, s * 0.3); g.closePath(); g.stroke(); } // triangle
    else if (k === 7) { g.moveTo(-s * 0.3, s * 0.2); g.quadraticCurveTo(0, -s * 0.5, s * 0.3, s * 0.2); g.stroke(); g.beginPath(); g.arc(0, s * 0.25, s * 0.06, 0, TAU); g.fill(); } // reed
    else { g.moveTo(0, -s * 0.35); g.lineTo(0, s * 0.35); g.moveTo(-s * 0.15, -s * 0.2); g.lineTo(s * 0.15, -s * 0.2); g.moveTo(-s * 0.2, 0); g.lineTo(s * 0.2, 0); g.stroke(); } // staff
    g.restore(); } }
function waterTex(g, w, h, o = {}) { const b = hex(o.base || '#38b8b0'); g.fillStyle = css(b); g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => { const n = fbm(u, v, 3, 6, 4, o.seed || 3); return [0.8 + 0.35 * n, 0.85 + 0.25 * n, 0.9 + 0.2 * n]; });
  const R = rng(o.seed || 3); for (let i = 0; i < 420; i++) { const x = R() * w, y = R() * h, L = 10 + R() * 34, lt = R() < 0.55; g.strokeStyle = lt ? css(tint(b, 1.5), 0.55 + R() * 0.35) : css(shade(b, 0.62), 0.5); g.lineWidth = lt ? 1.8 : 2.4; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L / 2, y - 4, x + L, y); g.stroke(); }
  for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(255,250,230,0.9)'; g.fillRect(R() * w, R() * h, 3 + R() * 8, 1.5); } }
function frondTex(g, w, h, o = {}) { g.clearRect(0, 0, w, h); const R = rng(o.seed || 4); g.strokeStyle = o.rib || '#6a7a30'; g.lineWidth = 5; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, 0); g.stroke();
  for (let y = h * 0.02; y < h * 0.97; y += 7) { const t = y / h, L = w * 0.48 * Math.sin(Math.min(1, (1 - t) * 1.25) * Math.PI * 0.5 + 0.25) * (0.85 + R() * 0.2); for (const s of [-1, 1]) { const c = ['#4a7a2a', '#5a8a30', '#3e6a28', '#6a9638', '#7a9a3a'][(R() * 5) | 0]; g.strokeStyle = o.dry ? ['#b88a4a', '#a8783a', '#c89a58'][(R() * 3) | 0] : c; g.lineWidth = 4.5; g.beginPath(); g.moveTo(w / 2, y); g.quadraticCurveTo(w / 2 + s * L * 0.6, y + 6, w / 2 + s * L, y + 22 + R() * 10); g.stroke(); } } }
function barkTex(g, w, h) { g.fillStyle = '#8a6a4a'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { g.fillStyle = '#6a4a34'; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + 8 + Math.sin(x * 0.3 + y) * 3); g.lineTo(w, y + 13); g.lineTo(0, y + 13); g.fill(); g.fillStyle = '#a88a64'; g.fillRect(0, y + 1, w, 2); } modulate(g, w, h, (u, v) => 0.85 + 0.25 * fbm(u, v, 3, 6, 3, 2)); }
function sailTex(g, w, h, o = {}) { PT.fabric(g, w, h, { base: o.base || '#f4ead4', folds: 1 }); g.strokeStyle = 'rgba(120,100,80,0.35)'; g.lineWidth = 2; for (let i = 1; i < 9; i++) { g.beginPath(); g.moveTo(i * w / 9, 0); g.lineTo(i * w / 9 * 0.6, h); g.stroke(); } if (o.patch) { g.fillStyle = 'rgba(200,170,120,0.5)'; g.fillRect(w * 0.3, h * 0.35, w * 0.14, h * 0.12); } modulate(g, w, h, (u, v) => 0.92 + 0.12 * fbm(u, v, 3, 3, 3, 4)); }
function sketchTex(g, w, h) { PT.paper(g, w, h, { base: '#f2e8d0', seed: 5 }); const R = rng(77); g.lineCap = 'round';
  const line = (pts, a = 0.7, lw = 2) => { for (let k = 0; k < 2; k++) { g.strokeStyle = `rgba(60,50,60,${a * (k ? 0.45 : 1)})`; g.lineWidth = lw; g.beginPath(); pts.forEach(([x, y], i) => { const X = x * w + (R() - 0.5) * 3 + k * 2, Y = y * h + (R() - 0.5) * 3; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.stroke(); } };
  line([[0.06, 0.12], [0.94, 0.12], [0.94, 0.86], [0.06, 0.86]], 0.35, 1.5); // cliff frame
  for (const cx of [0.27, 0.73]) { line([[cx - 0.13, 0.86], [cx - 0.12, 0.6], [cx + 0.12, 0.6], [cx + 0.13, 0.86]]); line([[cx - 0.1, 0.6], [cx - 0.1, 0.36], [cx - 0.05, 0.3], [cx + 0.05, 0.3], [cx + 0.1, 0.36], [cx + 0.1, 0.6]]);
    line([[cx - 0.07, 0.3], [cx - 0.08, 0.2], [cx - 0.04, 0.14], [cx + 0.04, 0.14], [cx + 0.08, 0.2], [cx + 0.07, 0.3]]); line([[cx - 0.025, 0.2], [cx + 0.025, 0.2]], 0.6, 1.5); line([[cx - 0.02, 0.24], [cx + 0.02, 0.24]], 0.6, 1.5);
    for (let i = 0; i < 12; i++) line([[cx - 0.12 + i * 0.02, 0.64], [cx - 0.13 + i * 0.02, 0.85]], 0.18, 1.2); }
  line([[0.47, 0.86], [0.47, 0.6], [0.53, 0.6], [0.53, 0.86]], 0.5); for (let i = 0; i < 40; i++) { const y = 0.87 + R() * 0.1; line([[R() * 0.9, y], [R() * 0.9 + 0.08, y + 0.01]], 0.25, 1.2); }
  g.fillStyle = 'rgba(60,50,60,0.6)'; g.font = 'italic 22px serif'; g.fillText('A.B. 1856', w * 0.72, h * 0.95); }
function tentTex(g, w, h) { PT.fabric(g, w, h, { base: '#efe4cc', folds: 3, hem: true }); g.fillStyle = 'rgba(170,60,50,0.85)'; for (let i = 0; i < 8; i += 2) g.fillRect(i * w / 8, 0, w / 8, h * 0.12); modulate(g, w, h, (u, v) => 0.9 + 0.14 * fbm(u, v, 3, 3, 3, 6)); }
function concreteTex(g, w, h, o = {}) { g.fillStyle = o.base || '#c8c0b0'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.82 + 0.26 * fbm(u, v, 5, 5, 4, o.seed || 3)); grain(g, w, h, '#5a5050', 1600, 4, 0.3); grain(g, w, h, '#ffffff', 600, 5, 0.25);
  if (o.joints) { g.strokeStyle = 'rgba(70,60,70,0.55)'; g.lineWidth = 3; for (let i = 0; i < o.joints; i++) { g.beginPath(); g.moveTo(0, i * h / o.joints + 1); g.lineTo(w, i * h / o.joints + 1); g.stroke(); } } }
function signTex(g, w, h, s, o = {}) { PT.planks(g, w, h, { base: o.base || '#2a4a6a', n: 3, seed: 7, joints: 0 }); g.strokeStyle = o.trim || '#f0d890'; g.lineWidth = h * 0.05; g.strokeRect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16); g.lineWidth = h * 0.015; g.strokeRect(h * 0.16, h * 0.16, w - h * 0.32, h - h * 0.32);
  txt(g, s, w / 2, h * 0.53, w * 0.84, h * 0.5, { col: o.col || '#f6ead0', shadow: 'rgba(10,10,30,0.5)' }); modulate(g, w, h, (u, v) => 0.9 + 0.14 * fbm(u, v, 4, 2, 3, 5)); }
function seaSkyTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5a6ac0'); gr.addColorStop(0.6, '#f8b080'); gr.addColorStop(1, '#ffd8a0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
function cairoView(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#4a5ab0'); gr.addColorStop(0.35, '#c87ab0'); gr.addColorStop(0.62, '#ff9a60'); gr.addColorStop(0.78, '#ffd080'); gr.addColorStop(1, '#ffb070'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,240,200,0.95)'; g.beginPath(); g.arc(w * 0.62, h * 0.72, w * 0.05, 0, TAU); g.fill(); const sg = g.createRadialGradient(w * 0.62, h * 0.72, 0, w * 0.62, h * 0.72, w * 0.3); sg.addColorStop(0, 'rgba(255,220,150,0.6)'); sg.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = sg; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,220,200,0.5)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(w * (0.1 + i * 0.17), h * (0.3 + (i % 3) * 0.06), w * 0.12, h * 0.012, 0, 0, TAU); g.fill(); }
  const R = rng(31), sil = (c, y0, n, big) => { g.fillStyle = c; for (let i = 0; i < n; i++) { const x = R() * w, bw = w * (0.03 + R() * 0.06), bh = h * (0.03 + R() * 0.05); g.fillRect(x, y0 - bh, bw, h); if (R() < big) { const r = bw * 0.45; g.beginPath(); g.arc(x + bw / 2, y0 - bh, r, Math.PI, 0); g.fill(); g.fillRect(x + bw / 2 - 1.5, y0 - bh - r - 10, 3, 10); } } };
  sil('#a86a8a', h * 0.8, 50, 0.2); // far city haze
  for (let i = 0; i < 11; i++) { const x = w * (0.04 + i * 0.09 + (R() - 0.5) * 0.04), mh = h * (0.18 + R() * 0.16), mw = w * 0.012, y0 = h * 0.82, c = '#7a4a72'; g.fillStyle = c; g.fillRect(x - mw / 2, y0 - mh, mw, mh); for (const f of [0.55, 0.8]) g.fillRect(x - mw, y0 - mh * f, mw * 2, h * 0.008); g.beginPath(); g.moveTo(x - mw / 2, y0 - mh); g.lineTo(x, y0 - mh - h * 0.04); g.lineTo(x + mw / 2, y0 - mh); g.fill(); } // pencil minarets
  for (let i = 0; i < 4; i++) { const x = w * (0.12 + i * 0.24 + (R() - 0.5) * 0.06), r = w * (0.035 + R() * 0.02), y0 = h * 0.84; g.fillStyle = '#6a3e66'; g.fillRect(x - r * 1.6, y0 - r * 0.9, r * 3.2, h); g.beginPath(); g.arc(x, y0 - r * 0.9, r, Math.PI, 0); g.fill(); g.fillRect(x - 1.5, y0 - r * 1.9 - 12, 3, 12); } // domes
  sil('#4a2a4e', h * 0.9, 40, 0.15); g.fillStyle = '#3a2040'; g.fillRect(0, h * 0.9, w, h * 0.1);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,${190 + R() * 50},120,${0.6 + R() * 0.4})`; g.fillRect(R() * w, h * (0.84 + R() * 0.1), 3, 4); } }
function tileTex(g, w, h) { g.fillStyle = '#f2eee2'; g.fillRect(0, 0, w, h); const s = w / 2;
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const x = i * s + s / 2, y = j * s + s / 2; g.fillStyle = '#1e4a9a'; g.beginPath(); for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, r = k % 2 ? s * 0.22 : s * 0.42; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.fill();
    g.fillStyle = '#3aa0a8'; g.beginPath(); g.arc(x, y, s * 0.17, 0, TAU); g.fill(); g.fillStyle = '#c83a2a'; g.beginPath(); g.arc(x, y, s * 0.08, 0, TAU); g.fill();
    g.fillStyle = '#2a6ab0'; for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { g.beginPath(); g.arc(i * s + a * s, j * s + b * s, s * 0.14, 0, TAU); g.fill(); } }
  g.strokeStyle = 'rgba(40,40,80,0.35)'; g.lineWidth = 2; for (let i = 0; i <= 2; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); } modulate(g, w, h, (u, v) => 0.92 + 0.1 * fbm(u, v, 4, 4, 3, 8)); }
function stuccoTex(g, w, h, o = {}) { g.fillStyle = o.base || '#efe0c4'; g.fillRect(0, 0, w, h); const c = o.line || '#b8925a'; g.strokeStyle = c; g.lineWidth = 3;
  const s = h; for (let x = -s; x < w + s; x += s) { g.beginPath(); for (let k = 0; k <= 8; k++) { const a = k / 8 * TAU + Math.PI / 8, r = s * 0.42; g.lineTo(x + s / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } g.stroke(); g.beginPath(); g.moveTo(x + s / 2, 0); g.lineTo(x + s / 2, h); g.moveTo(x, h / 2); g.lineTo(x + s, h / 2); g.stroke(); g.fillStyle = o.dot || '#2a6aa8'; g.beginPath(); g.arc(x + s / 2, h / 2, s * 0.12, 0, TAU); g.fill(); }
  g.fillStyle = c; g.fillRect(0, 0, w, 5); g.fillRect(0, h - 5, w, 5); modulate(g, w, h, (u, v) => 0.92 + 0.12 * fbm(u, v, 4, 1, 3, 3)); }
function mashTex(g, w, h) { g.clearRect(0, 0, w, h); const n = 8, s = w / n; g.fillStyle = '#ffffff';
  for (let i = 0; i <= n; i++) { g.fillRect(i * s - 3, 0, 6, h); g.fillRect(0, i * s - 3, w, 6); }
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = i * s + s / 2, y = j * s + s / 2; g.beginPath(); g.arc(x, y, s * 0.2, 0, TAU); g.fill(); for (const [dx, dy] of [[0.5, 0], [-0.5, 0], [0, 0.5], [0, -0.5]]) { g.beginPath(); g.ellipse(x + dx * s * 0.55, y + dy * s * 0.55, dx ? s * 0.16 : s * 0.07, dy ? s * 0.16 : s * 0.07, 0, 0, TAU); g.fill(); } } }
function carpetTex(g, w, h, o = {}) { const c = o.cols || ['#8a1a24', '#1e2a5a', '#e0b060', '#f2e4c4', '#2a5a4a']; g.fillStyle = c[0]; g.fillRect(0, 0, w, h); const R = rng(o.seed || 3);
  for (let k = 0; k < 3; k++) { const m = w * (0.03 + k * 0.045); g.fillStyle = c[[1, 2, 1][k]]; g.fillRect(m, m, w - 2 * m, h - 2 * m); g.fillStyle = c[0]; g.fillRect(m + w * 0.025, m + w * 0.025, w - 2 * m - w * 0.05, h - 2 * m - w * 0.05); }
  for (let i = 0; i < 24; i++) { const t = i / 24; for (const [x, y] of [[w * (0.08 + t * 0.84), h * 0.065], [w * (0.08 + t * 0.84), h * 0.935]]) { g.fillStyle = c[3]; g.beginPath(); g.moveTo(x, y - 8); g.lineTo(x + 8, y); g.lineTo(x, y + 8); g.lineTo(x - 8, y); g.fill(); } }
  const cx = w / 2, cy = h / 2; for (const [rx, col] of [[0.3, c[1]], [0.24, c[2]], [0.18, c[0]], [0.11, c[3]], [0.05, c[1]]]) { g.fillStyle = col; g.beginPath(); for (let k = 0; k < 24; k++) { const a = k / 24 * TAU, r = (k % 2 ? 0.8 : 1) * rx; g.lineTo(cx + Math.cos(a) * w * r, cy + Math.sin(a) * h * r * 0.9); } g.fill(); }
  for (let i = 0; i < 160; i++) { const x = w * (0.15 + R() * 0.7), y = h * (0.12 + R() * 0.76); if (Math.hypot((x - cx) / w, (y - cy) / h) < 0.3) continue; g.fillStyle = c[(1 + R() * 4) | 0]; g.beginPath(); g.arc(x, y, 3 + R() * 4, 0, TAU); g.fill(); }
  for (const [x, y] of [[0.16, 0.16], [0.84, 0.16], [0.16, 0.84], [0.84, 0.84]]) { g.fillStyle = c[1]; g.beginPath(); g.arc(w * x, h * y, w * 0.07, 0, TAU); g.fill(); g.fillStyle = c[2]; g.beginPath(); g.arc(w * x, h * y, w * 0.035, 0, TAU); g.fill(); }
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '255,240,220' : '20,10,30'},0.08)`; g.fillRect(R() * w, R() * h, 2, 2); } modulate(g, w, h, (u, v) => 0.86 + 0.18 * fbm(u, v, 6, 6, 3, 5)); }
function marbleTex(g, w, h) { const n = 4, s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? '#e8e0d0' : '#3a3440'; g.fillRect(i * s, j * s, s, s); } const R = rng(9); g.strokeStyle = 'rgba(160,150,150,0.35)'; g.lineWidth = 1.5; for (let i = 0; i < 40; i++) { g.beginPath(); let x = R() * w, y = R() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (R() - 0.3) * 40; y += (R() - 0.5) * 30; g.lineTo(x, y); } g.stroke(); } modulate(g, w, h, (u, v) => 0.9 + 0.12 * fbm(u, v, 4, 4, 3, 2)); }
function coffTex(g, w, h) { PT.planks(g, w, h, { base: '#5a3420', n: 1, seed: 3, joints: 0 }); const m = w * 0.12; g.fillStyle = '#2a4a6a'; g.fillRect(m, m, w - 2 * m, h - 2 * m); g.strokeStyle = '#e0b050'; g.lineWidth = 6; g.strokeRect(m, m, w - 2 * m, h - 2 * m); g.fillStyle = '#c84a3a'; g.beginPath(); for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, r = k % 2 ? w * 0.12 : w * 0.25; g.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } g.fill(); g.fillStyle = '#e8c060'; g.beginPath(); g.arc(w / 2, h / 2, w * 0.08, 0, TAU); g.fill(); modulate(g, w, h, (u, v) => 0.9 + 0.14 * fbm(u, v, 3, 3, 3, 7)); }
function lanternTex(g, w, h) { g.fillStyle = '#a87a30'; g.fillRect(0, 0, w, h); const R = rng(4); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const x = (i + 0.5) * w / 4, y = (j + 0.5) * h / 4; g.fillStyle = '#fff0a0'; g.beginPath(); for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, r = k % 2 ? w * 0.04 : w * 0.085; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.fill(); for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(x + (R() - 0.5) * w * 0.2, y + (R() - 0.5) * h * 0.2, 2.5, 0, TAU); g.fill(); } } }
function lanternEm(g, w, h) { lanternTex(g, w, h); const d = g.getImageData(0, 0, w, h); for (let i = 0; i < d.data.length; i += 4) { const lit = d.data[i + 2] > 120; if (!lit) { d.data[i] = d.data[i + 1] = d.data[i + 2] = 0; } } g.putImageData(d, 0, 0); }
function scrollTex(g, w, h) { PT.paper(g, w, h, { base: '#f2e6c8', seed: 21 }); const R = rng(55); g.strokeStyle = 'rgba(150,60,40,0.6)'; g.lineWidth = 3; for (const x of [0.06, 0.94]) { g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * x, h); g.stroke(); } g.lineWidth = 1.5; g.beginPath(); g.moveTo(w * 0.68, 0); g.lineTo(w * 0.68, h); g.stroke();
  for (let y = 18; y < h; y += 26) { g.strokeStyle = 'rgba(40,30,70,0.75)'; g.lineWidth = 2; g.beginPath(); let x = w * 0.1; g.moveTo(x, y); const L = w * (0.3 + R() * 0.25); while (x < w * 0.1 + L) { x += 4 + R() * 6; g.lineTo(x, y + (R() - 0.5) * 6); } g.stroke(); // squiggle "item"
    g.fillStyle = 'rgba(40,30,70,0.85)'; g.font = `bold ${16}px ${SERIF}`; g.textAlign = 'right'; g.fillText(`${(1 + R() * 98) | 0} ${String((R() * 1000) | 0).padStart(3, '0')} 000`, w * 0.92, y + 6); } }
function puffTex(g, w, h) { g.clearRect(0, 0, w, h); const R = rng(6); for (let i = 0; i < 14; i++) { const x = w * (0.3 + R() * 0.4), y = h * (0.3 + R() * 0.4), r = w * (0.12 + R() * 0.16); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.8)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } }
function glowTex(g, w, h) { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
function flameTex(g, w, h) { g.clearRect(0, 0, w, h); const gr = g.createRadialGradient(w / 2, h * 0.7, 0, w / 2, h * 0.6, w * 0.5); gr.addColorStop(0, 'rgba(255,255,230,1)'); gr.addColorStop(0.35, 'rgba(255,200,90,1)'); gr.addColorStop(0.7, 'rgba(255,110,40,0.8)'); gr.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(w / 2, 0); g.bezierCurveTo(w * 0.85, h * 0.4, w * 0.95, h * 0.75, w / 2, h * 0.98); g.bezierCurveTo(w * 0.05, h * 0.75, w * 0.15, h * 0.4, w / 2, 0); g.fill(); }
function flagTex(g, w, h, cols) { cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(i * w / cols.length, 0, w / cols.length + 1, h); }); modulate(g, w, h, (u, v) => 0.92 + 0.1 * fbm(u, v, 3, 3, 2, 3)); }
function pennantTex(g, w, h) { g.clearRect(0, 0, w, h); const C = ['#c8302a', '#f4f0e4', '#2a4aa0', '#e8b030', '#2a8a5a', '#f4f0e4']; for (let i = 0; i < 12; i++) { g.fillStyle = C[i % C.length]; g.beginPath(); g.moveTo(i * w / 12 + 2, 0); g.lineTo((i + 1) * w / 12 - 2, 0); g.lineTo((i + 0.5) * w / 12, h); g.fill(); } }

// ---------------------------------------------------------------- materials
let M;
function materials() {
  const vc = (o = {}) => toon({ vertexColors: true, ...o }), T = (w, h, fn, rep) => mkTex(w, h, fn, rep), m = {}, basic = (map, k = 1.2) => { const b = new THREE.MeshBasicMaterial({ map, fog: false }); b.color.setScalar(k); return b; };
  const em = (map, e = 0x241c14, o = {}) => { const x = toon({ map, emissive: e, ...o }); x.emissiveMap = map; return x; };
  m.paint = vc(); m.metal = vc({ emissive: 0x0c0c12 }); m.brass = vc({ emissive: 0x3a2408 }); m.gold = vc({ emissive: 0x4a3008 });
  m.sand = vc({ map: T(512, 512, sandTex, [70, 70]) }); if (MACRO) MACRO(m.sand, 0.16, 0.03);
  m.sandK = vc({ map: T(512, 512, sandTex, [1, 1]) });
  m.stone = vc({ map: T(512, 512, sandstoneTex, [1, 1]) }); m.stoneBig = vc({ map: T(512, 512, (g, w, h) => sandstoneTex(g, w, h, { seed: 17 }), [7, 6]) }); if (MACRO) MACRO(m.stoneBig, 0.2, 0.05);
  m.glyph = vc({ map: T(512, 1024, glyphTex, [1, 1]) }); m.glyph2 = vc({ map: T(512, 512, (g, w, h) => glyphTex(g, w, h, { cols: 6, seed: 5 }), [1, 1]) });
  m.nile = toon({ map: T(512, 512, waterTex, [60, 40]), emissive: 0x0a3434 }); if (MACRO) MACRO(m.nile, 0.18, 0.05);
  m.sea = toon({ map: T(512, 512, (g, w, h) => waterTex(g, w, h, { base: '#3a9ab0', seed: 8 }), [90, 90]), emissive: 0x0a2a3a }); if (MACRO) MACRO(m.sea, 0.2, 0.04);
  m.frond = toon({ map: T(128, 512, frondTex), alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true }); m.frondDry = toon({ map: T(128, 512, (g, w, h) => frondTex(g, w, h, { dry: true, rib: '#8a6a3a', seed: 9 })), alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true });
  m.bark = vc({ map: T(128, 256, barkTex, [2, 6]) });
  m.sail = toon({ map: T(256, 256, sailTex), side: THREE.DoubleSide, vertexColors: true }); m.sailP = toon({ map: T(256, 256, (g, w, h) => sailTex(g, w, h, { base: '#ead8b8', patch: true })), side: THREE.DoubleSide, vertexColors: true });
  m.tent = vc({ map: T(512, 512, tentTex), side: THREE.DoubleSide }); m.canvas = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#e8dcc0' })), side: THREE.DoubleSide });
  m.wood = vc({ map: T(256, 256, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 4, seed: 33, joints: 0 })) }); m.planks = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#9a7450', n: 6, seed: 35 }), [1, 1]) });
  m.leather = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#7a4a2a' })) });
  m.sketch = toon({ map: T(512, 400, sketchTex), emissive: 0x2a2418 }); m.sketch.emissiveMap = m.sketch.map;
  m.dark = new THREE.MeshBasicMaterial({ color: 0x1a1024 });
  m.concrete = vc({ map: T(256, 256, (g, w, h) => concreteTex(g, w, h, { joints: 2 })) }); m.white = vc({ map: T(256, 256, (g, w, h) => concreteTex(g, w, h, { base: '#f4f0e6', seed: 7 }), [1, 4]) });
  m.plaster = vc({ map: T(256, 256, (g, w, h) => concreteTex(g, w, h, { base: '#f0e6d2', seed: 11 })) });
  m.hull = vc({ map: T(512, 128, (g, w, h) => PT.planks(g, w, h, { base: '#ffffff', n: 6, seed: 4, joints: 0, varyAmt: 0.05 })) });
  m.portSaid = em(T(1024, 256, (g, w, h) => signTex(g, w, h, 'PORT SAID 1869')), 0x201810); m.suez = em(T(1024, 220, (g, w, h) => signTex(g, w, h, 'SUEZ CANAL', { base: '#6a2a24' })), 0x201810);
  m.puff = new THREE.MeshBasicMaterial({ map: T(128, 128, puffTex), transparent: true, depthWrite: false, fog: false, color: 0x5a4a58, opacity: 0.9 });
  m.glow = new THREE.MeshBasicMaterial({ map: T(128, 128, glowTex), color: 0xffc070, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  m.flame = new THREE.MeshBasicMaterial({ map: T(128, 256, flameTex), transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide }); m.flame.color.setScalar(1.8);
  m.flameCore = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd890).multiplyScalar(2.4), fog: false });
  m.lampGlass = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd890).multiplyScalar(2.0), fog: false });
  m.winLit = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc070).multiplyScalar(1.5) });
  m.beam = new THREE.MeshBasicMaterial({ color: 0xfff0c8, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  m.shaft = new THREE.MeshBasicMaterial({ color: 0xffd8a0, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  m.flagFR = toon({ map: T(96, 64, (g, w, h) => flagTex(g, w, h, ['#2a4aa0', '#f4f0e4', '#c8302a'])), side: THREE.DoubleSide }); m.flagR = toon({ map: T(96, 64, (g, w, h) => flagTex(g, w, h, ['#c8302a', '#c8302a'])), side: THREE.DoubleSide });
  m.pennants = toon({ map: T(512, 64, pennantTex, [1, 1]), alphaTest: 0.5, side: THREE.DoubleSide });
  m.seaSky = basic(T(256, 256, seaSkyTex), 1.0);
  // palace
  m.cairo = basic(T(2048, 1024, cairoView), 1.15); m.tiles = vc({ map: T(256, 256, tileTex, [2, 2]) }); m.stucco = vc({ map: T(512, 64, stuccoTex, [1, 1]) });
  m.wall = vc({ map: T(256, 256, (g, w, h) => concreteTex(g, w, h, { base: '#efe2c6', seed: 13 }), [0.3, 0.3]) });
  m.mash = toon({ map: T(256, 256, mashTex, [1, 1]), alphaTest: 0.5, side: THREE.DoubleSide, color: 0x6a3a22 });
  m.carpet = vc({ map: T(1024, 1024, carpetTex) }); m.runner = vc({ map: T(512, 1024, (g, w, h) => carpetTex(g, w, h, { cols: ['#1e2a5a', '#8a1a24', '#e0b060', '#f2e4c4', '#2a5a4a'], seed: 7 })) });
  m.marble = vc({ map: T(512, 512, marbleTex, [9, 9]) }); m.coff = vc({ map: T(256, 256, coffTex, [1, 1]) });
  m.velvet = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#a02030', folds: 3 })) }); m.cushion = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#e0b050', stripes: '#a83a2a', nStripes: 10 })) });
  m.lantern = toon({ map: T(256, 256, lanternTex), emissive: 0xffc060, vertexColors: true }); m.lantern.emissiveMap = T(256, 256, lanternEm); m.lantern.emissiveIntensity = 2.2;
  m.scroll = em(T(256, 1024, scrollTex, [1, 1]), 0x2a2218, { side: THREE.DoubleSide }); m.paper = vc({ map: T(256, 256, (g, w, h) => PT.paper(g, w, h, {})) });
  m.crystal = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2d8).multiplyScalar(1.6), fog: false });
  return m;
}
// the dream vision: fresnel glow, opacity driven by dream(t)
function ghostMat() { return new THREE.ShaderMaterial({ uniforms: { op: { value: 0 }, c0: { value: new THREE.Color(0xffc878) }, c1: { value: new THREE.Color(0xbfe8ff) }, y0: { value: 0 }, y1: { value: 50 } },
  vertexShader: 'varying vec3 vN; varying vec3 vV; varying float vY; void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vY = wp.y; vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix * viewMatrix * wp; }',
  fragmentShader: 'uniform float op; uniform vec3 c0; uniform vec3 c1; uniform float y0; uniform float y1; varying vec3 vN; varying vec3 vV; varying float vY; void main(){ float fr = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2); float h = clamp((vY - y0) / (y1 - y0), 0.0, 1.0); float lit = 0.55 + 0.45 * max(0.0, dot(normalize(vN), normalize(vec3(-0.7, 0.4, 0.5)))); vec3 c = mix(c0 * lit, c1 * 1.7, fr) * (0.85 + 0.35 * h); float a = op * (0.34 + 0.62 * fr) * (0.55 + 0.45 * h); gl_FragColor = vec4(c, a); }',
  transparent: true, depthWrite: false, fog: false }); }

// ---------------------------------------------------------------- shared props
// robed Egyptian peasant woman (fellaha) holding a torch high: local units, feet y=0, facing +z, height ~2.35 to the flame. returns flame pos
function robedWoman(K, mat, c, o = {}) { const c2 = o.c2 ?? c;
  K.put(mat, robeGeo('skirt', [[0.001, 0], [0.34, 0], [0.35, 0.04], [0.31, 0.3], [0.26, 0.7], [0.215, 1.0], [0.195, 1.14], [0.001, 1.16]], 11, 0.09, 1.1), 0, 0, 0, 0, 0, 0, 1, 1, 0.82, c);
  K.put(mat, cached('foot', () => new THREE.SphereGeometry(0.07, 10, 8)), -0.09, 0.03, 0.27, 0, 0, 0, 1, 0.5, 1.6, c2); // left foot stepping out
  K.put(mat, robeGeo('bodice', [[0.19, 1.1], [0.205, 1.25], [0.19, 1.36], [0.15, 1.46], [0.08, 1.52], [0.001, 1.535]], 5, 0.04, 1.5, 28), 0, 0, 0, 0, 0, 0, 1, 1, 0.74, c);
  K.cb(mat, 0.075, 0.5, 0.03, 0.02, 1.3, 0.12, c2, 0, 0, 0.62, 0.012); // mantle sash, shoulder to hip
  K.put(mat, cyl(0.045, 0.05, 0.1, 10), 0, 1.56, 0.01, 0, 0, 0, 1, 1, 1, c2); K.put(mat, sph(0.09, 16, 12), 0, 1.66, 0.04, 0, 0, 0, 1, 1.12, 0.95, c2);
  K.put(mat, cached('nose', () => new THREE.ConeGeometry(0.018, 0.05, 6)), 0, 1.655, 0.13, 0.3, 0, 0, 1, 1, 1, c2);
  K.put(mat, robeGeo('veil', [[0.001, 1.79], [0.06, 1.785], [0.097, 1.74], [0.108, 1.66], [0.112, 1.58], [0.15, 1.5], [0.21, 1.44], [0.245, 1.3], [0.255, 1.12]], 7, 0.05, 1.8, 30, 0.8, TAU - 1.6), 0, 0, -0.01, 0, 0, 0, 1, 1, 0.92, c);
  K.cb(mat, 0.26, 0.6, 0.04, 0, 1.05, -0.2, c, -0.12, 0, 0, 0.03); // veil train down the back
  // raised right arm (her right = -x), wide sleeve, torch
  const S = [-0.17, 1.44, 0], E = [-0.255, 1.72, 0.03], H = [-0.225, 1.98, 0.04];
  K.beam(mat, S, E, 0.065, c, true, 10); K.beam(mat, E, H, 0.036, c2, true, 8); K.put(mat, cyl(0.045, 0.095, 0.24, 12, true), -0.27, 1.62, 0.02, 0, 0, 0.35, 1, 1, 1, c); // sleeve fall
  K.put(mat, sph(0.04, 10, 8), H[0], H[1], H[2], 0, 0, 0, 1, 1.2, 1, c2);
  K.put(mat, cyl(0.024, 0.02, 0.26, 8), H[0], H[1] + 0.08, H[2], 0, 0, 0, 1, 1, 1, c2); K.put(mat, lathe('cup', [[0.02, 0], [0.055, 0.05], [0.068, 0.085], [0.062, 0.1], [0.001, 0.1]], 14), H[0], H[1] + 0.2, H[2], 0, 0, 0, 1, 1, 1, c2);
  // left arm holds a fold of the robe at the hip
  const S2 = [0.17, 1.44, 0], E2 = [0.235, 1.2, 0.04], H2 = [0.13, 1.1, 0.17]; K.beam(mat, S2, E2, 0.06, c, true, 10); K.beam(mat, E2, H2, 0.04, c, true, 8); K.put(mat, sph(0.042, 10, 8), ...H2, 0, 0, 0, 1, 1, 1, c2);
  K.put(mat, cyl(0.03, 0.07, 0.42, 10), 0.14, 0.86, 0.2, 0.15, 0, -0.05, 1, 1, 1, c); // gathered fold
  return [H[0], H[1] + 0.36, H[2]];
}
// Egyptian pedestal: battered sides, cavetto cornice, door; local units, top at y=h
function egyptPedestal(K, mat, c, w, h) { K.box(mat, -w * 0.62, w * 0.62, 0, h * 0.12, -w * 0.62, w * 0.62, c, 0.02); K.box(mat, -w * 0.56, w * 0.56, h * 0.12, h * 0.18, -w * 0.56, w * 0.56, c, 0.01);
  K.put(mat, cyl(w * 0.5 * Math.SQRT2 * 0.88, w * 0.5 * Math.SQRT2, h * 0.64, 4), 0, h * 0.5, 0, 0, Math.PI / 4, 0, 1, 1, 1, c);
  K.put(mat, cyl(w * 0.5 * Math.SQRT2 * 1.02, w * 0.5 * Math.SQRT2 * 0.88, h * 0.12, 4), 0, h * 0.88, 0, 0, Math.PI / 4, 0, 1, 1, 1, c); K.box(mat, -w * 0.52, w * 0.52, h * 0.94, h, -w * 0.52, w * 0.52, c, 0.01);
  K.box(mat, -w * 0.4, w * 0.4, h * 0.77, h * 0.8, -w * 0.47, w * 0.47, c, 0.005); }
function puffs(root, n, list, mat) { for (let i = 0; i < n; i++) { const p = nond(mesh(root, plane(1, 1), mat.clone(), 0, -999, 0, 0, 0, 0, false)); p.renderOrder = 6; list.push(p); } }

// palm tree into Kit (local base at 0), with fronds
function palm(K, x, z, h, R, lean = 0.2, y0 = 0) { const ry = R() * TAU, dir = [Math.cos(ry) * lean, 0, Math.sin(ry) * lean]; let px = x, py = y0, pz = z; const n = 7;
  for (let i = 0; i < n; i++) { const t = (i + 1) / n, nx = x + dir[0] * h * t * t, ny = y0 + h * t, nz = z + dir[2] * h * t * t, r = 0.24 - 0.08 * t; K.beam(M.bark, [px, py, pz], [nx, ny, nz], r, 0xffffff, true, 8); px = nx; py = ny; pz = nz; }
  K.put(M.bark, sph(0.3, 10, 8), px, py, pz, 0, 0, 0, 1, 0.8, 1, 0xa08060);
  for (let k = 0; k < 13; k++) { const a = k / 13 * TAU + R() * 0.3, dry = k > 10, tilt = dry ? 1.9 + R() * 0.5 : 0.35 + R() * 0.9, len = 3.6 + R() * 1.4;
    K.put(dry ? M.frondDry : M.frond, frondGeo(len, dry ? 1 : (k % 3)), px, py, pz, -Math.PI / 2 + tilt, a, 0, 1, 1, 1, dry ? 0xd8c0a0 : [0xffffff, 0xe8f0c8, 0xd0e0b0][k % 3]); }
  for (let k = 0; k < 3; k++) K.put(M.paint, sph(0.25, 8, 6), px + Math.cos(k * 2) * 0.35, py - 0.4, pz + Math.sin(k * 2) * 0.35, 0, 0, 0, 1, 1.4, 1, 0xd8782a); // dates
  return [px, py, pz]; }
// frond geometry: a strip along +y bending down (droop), folded into a shallow V
const frondGeo = (len, v) => cached(`frond${len.toFixed(1)}|${v}`, () => { const g = new THREE.PlaneGeometry(1.5, len, 2, 10); g.translate(0, len / 2, 0); const p = g.attributes.position, droop = 0.18 + v * 0.06;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), t = y / len; p.setZ(i, -droop * len * t * t * 1.4 + Math.abs(x) * 0.35); p.setX(i, x * (1 - t * 0.5)); } g.computeVertexNormals(); return g; });

function felucca(K, x, z, ry, s, R, A = {}) { K.at(x, -0.5, z, ry, () => {
  K.put(M.hull, cached('fhull', () => new THREE.SphereGeometry(1, 24, 8, 0, TAU, Math.PI / 2, Math.PI / 2)), 0, 0.55, 0, 0, 0, 0, 3.8, 0.85, 1.05, A.hull || 0xf4efe4);
  K.box(M.paint, -3.6, 3.6, 0.52, 0.62, -1.06, 1.06, A.trim || 0x2a6a9a, 0.04); K.box(M.wood, -2.2, 2.2, 0.35, 0.42, -0.8, 0.8, 0x8a6a4a, 0.01);
  K.put(M.paint, cyl(0.06, 0.08, 4.8, 8), 0.8, 2.8, 0, 0, 0, -0.04, 1, 1, 1, 0x6a4a30); // mast
  const yA = [-2.2, 9.8, 0], yB = [3.5, 0.95, 0], cl = [-3.1, 1.05, 0];
  K.beam(M.wood, yA, yB, 0.07, 0x7a5a3a, true, 6); // lateen yard
  K.put(A.patch ? M.sailP : M.sail, sailGeo(yA, yB, cl, 0.9 * (A.bil ?? 1), 12), 0, 0, 0.06, 0, 0, 0, 1, 1, 1, 0xffffff);
  K.beam(M.paint, cl, [-3.5, 0.62, 0.3], 0.012, 0x3a2a2a, true, 4); K.beam(M.paint, [0.7, 5.1, 0], [3.7, 0.62, 0], 0.012, 0x3a2a2a, true, 4); K.beam(M.paint, [0.7, 5.1, 0], [-1.0, 0.62, 0.9], 0.012, 0x3a2a2a, true, 4);
  K.box(M.wood, -3.4, -3.2, 0.2, 0.9, -0.05, 0.05, 0x5a3a2a, 0.01); // rudder
  for (const [px, c] of [[0.2, 0x2a3a6a], [-1.4, 0xf4f0e4]]) { K.put(M.paint, cyl(0.16, 0.2, 0.7, 8), px, 0.75, 0.2, 0, 0, 0, 1, 1, 1, c); K.put(M.paint, sph(0.15, 10, 8), px, 1.25, 0.2, 0, 0, 0, 1, 1.1, 1, 0x8a5a3a); K.put(M.paint, sph(0.16, 10, 8), px, 1.33, 0.2, 0, 0, 0, 1, 0.6, 1, 0xf4f0e4); } // two boatmen (tiny, far)
}, s); }

// ================================================================= COLOSSI (Nile, 1856)
function seatedColossus(K, x, z, s, o, R) { const c = o.c || 0xffffff, st = M.stone; K.at(x, 0, z, 0, () => {
  K.box(st, -0.62, 0.62, -0.1, 0.06, -0.55, 0.85, c, 0.03); // base
  K.box(M.glyph2, -0.56, 0.56, 0.06, 1.0, -0.6, 0.12, c, 0.02); // throne (merges into cliff)
  for (const sx of [-1, 1]) { K.box(st, sx * 0.17 - 0.12, sx * 0.17 + 0.12, 0.06, 0.62, 0.42, 0.66, c, 0.05); K.box(st, sx * 0.17 - 0.12, sx * 0.17 + 0.12, 0.06, 0.15, 0.42, 0.82, c, 0.04); // shins, feet
    for (let t = 0; t < 4; t++) K.box(st, sx * 0.17 - 0.1 + t * 0.055, sx * 0.17 - 0.06 + t * 0.055, 0.06, 0.13, 0.8, 0.84, c, 0.01); // toes
    K.box(st, sx * 0.17 - 0.13, sx * 0.17 + 0.13, 0.58, 0.8, -0.12, 0.7, c, 0.08); } // thighs
  K.box(st, -0.37, 0.37, 0.64, 0.86, -0.15, 0.42, c, 0.06); for (let i = 0; i < 9; i++) K.box(st, -0.33 + i * 0.08, -0.31 + i * 0.08, 0.6, 0.84, 0.42, 0.44, c, 0.005); // kilt with pleats
  if (o.broken) { // broken at the waist: jagged stump
    for (let i = 0; i < 6; i++) K.put(st, lumpGeo(i + 30, 1, 0.5), -0.25 + i * 0.1, 0.92 + R() * 0.12, 0.05 + R() * 0.1, R(), R(), R(), 0.14, 0.12 + R() * 0.12, 0.14, c);
    K.put(st, cyl(0.3, 0.24, 0.16, 4), 0, 0.92, 0.05, 0, Math.PI / 4, 0, 1, 1, 0.6, c); }
  else {
    K.put(st, cyl(0.36, 0.23, 0.66, 4), 0, 1.18, 0.02, 0, Math.PI / 4, 0, 1, 1, 0.52, c); // torso (tapered block)
    K.put(st, sph(0.1, 10, 8), -0.1, 1.33, 0.13, 0, 0, 0, 1, 0.7, 0.5, c); K.put(st, sph(0.1, 10, 8), 0.1, 1.33, 0.13, 0, 0, 0, 1, 0.7, 0.5, c); // pecs
    for (const sx of [-1, 1]) { K.beam(st, [sx * 0.34, 1.42, 0], [sx * 0.33, 0.92, 0.02], 0.095, c, true, 8); K.put(st, sph(0.11, 10, 8), sx * 0.33, 1.42, 0, 0, 0, 0, 1, 1, 1, c); // upper arm, shoulder
      K.beam(st, [sx * 0.31, 0.9, 0.0], [sx * 0.24, 0.86, 0.56], 0.08, c, true, 8); K.box(st, sx * 0.24 - 0.08, sx * 0.24 + 0.08, 0.8, 0.94, 0.5, 0.68, c, 0.04); } // forearm on thigh, fist
    K.put(st, cyl(0.1, 0.11, 0.16, 10), 0, 1.55, 0.02, 0, 0, 0, 1, 1, 1, c); // neck
    if (!o.headless) { K.put(st, sph(0.16, 16, 12), 0, 1.72, 0.04, 0, 0, 0, 0.95, 1.18, 0.95, c); // head
      K.put(st, sph(0.2, 16, 12), 0, 1.79, -0.01, 0, 0, 0, 1.05, 0.85, 1.0, c); // nemes cap
      for (const sx of [-1, 1]) { K.cb(st, 0.12, 0.36, 0.06, sx * 0.17, 1.52, 0.1, c, 0, 0, sx * 0.18, 0.02); K.cb(st, 0.1, 0.2, 0.16, sx * 0.2, 1.68, 0.0, c, 0, 0, sx * 0.25, 0.03); } // lappets, side wings
      K.box(st, -0.035, 0.035, 1.62, 1.75, 0.16, 0.2, c, 0.01); K.box(st, -0.05, 0.05, 1.42, 1.58, 0.07, 0.13, c, 0.015); // nose, beard
      for (const sx of [-1, 1]) K.box(M.paint, sx * 0.065 - 0.035, sx * 0.065 + 0.035, 1.735, 1.755, 0.145, 0.16, 0x6a4030, 0.005); // eyes (shadowed)
      K.box(st, -0.05, 0.05, 1.6, 1.615, 0.15, 0.17, 0x9a6a4a, 0.004); // mouth
      if (o.crown) { K.put(st, lathe('crownW', [[0.001, 0], [0.12, 0], [0.1, 0.15], [0.08, 0.3], [0.06, 0.37], [0.001, 0.4]], 14), 0, 1.86, 0.0, 0, 0, 0, 1, 1, 1, c); K.box(st, -0.16, 0.16, 1.84, 1.98, -0.12, -0.04, c, 0.02); } // double crown
      K.put(st, sph(0.035, 8, 6), 0, 1.86, 0.17, 0, 0, 0, 1, 1.4, 1, c); // uraeus
      if (o.chip) K.put(M.paint, lumpGeo(7, 1, 0.4), 0.11, 1.78, 0.12, 0, 0, 0, 0.07, 0.07, 0.05, 0xc88a5a); } } // weathered chip
}, s); }

function buildColossi(root) {
  const R = rng(1856), K = new Kit(), KS = new Kit(), KP = new Kit(), FZ = -26;
  // sand: plaza, dune heaped against the cliff on the left (buries the left colossi), bank sloping into the Nile (z ~ 22)
  const hf = (x, z) => { const cliff = sm(-4, -24, z), dune = cliff * (9.2 * sm(6, -22, x) + 1.0) + 2.6 * sm(-6, -16, z) * sm(-2, -26, x) * (1 + 0.15 * Math.sin(x * 0.4));
    const bank = -1.6 * sm(14, 26, z), far = z > 60 ? 0.2 + 1.6 * sm(110, 140, z) : 0, ripple = 0.25 * Math.sin(x * 0.11 + z * 0.07) * Math.cos(z * 0.13 - x * 0.03), side = 6 * sm(32, 70, Math.abs(x)) * sm(10, -30, z) + 14 * sm(40, 110, Math.abs(x)) * sm(-10, -60, z);
    return dune + ripple + side + (z > 60 ? far - 1.6 * sm(14, 26, z) * (1 - sm(110, 140, z)) : bank); };
  terrain(root, 520, 420, 180, 150, 0, 40, hf, (x, z, y) => { const wet = sm(18, 23, z) * (1 - sm(100, 130, z)); const green = sm(128, 140, z); const c = [0.98 - wet * 0.25, 0.92 - wet * 0.25 + green * 0.02, 0.86 - wet * 0.22]; if (green) { c[0] -= 0.35 * green; c[2] -= 0.4 * green; } return c; }, M.sand);
  mesh(root, plane(900, 120), M.nile, 0, -0.55, 75, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  // cliff: battered facade plane + rock mass + lumpy crest + outcrops
  const fac = mesh(root, plane(60, 34), M.stoneBig, 0, 16.5, FZ - 0.25, 0, 0, 0, true);
  K.box(M.stoneBig, -30, 30, -1, 33, FZ - 40, FZ - 1.2, 0xf6e2c8, 0.1);
  for (let i = 0; i < 46; i++) { const x = -70 + i * 3.1 + R() * 2, top = Math.abs(x) < 29 ? 32.5 : 30 - (Math.abs(x) - 29) * 0.45, k = 3 + R() * 3; if (top < 2) continue; K.put(M.stoneBig, lumpGeo(i % 9, 1, 0.5), x, top + R() * 1.2, FZ - 9 - R() * 10, R(), R() * 3, R(), k * 1.6, k * (0.5 + R() * 0.4), k * 1.3, [0xf6e2c8, 0xecd4b8, 0xfaead4][i % 3]); }
  for (const s of [-1, 1]) for (let i = 0; i < 16; i++) { const x = s * (31 + i * 4 + R() * 3), h = Math.max(4, 30 - i * 2.2 + R() * 3), k = 5 + R() * 4; K.put(M.stoneBig, lumpGeo(i % 7 + 10, 1, 0.45), x, h * 0.55, FZ - 6 + i * 0.8 + R() * 6, R(), R(), R(), k * 1.3, h * 0.6, k * 1.6, [0xf0dcc0, 0xe6ceb4][i % 2]); }
  // facade frame: torus/cornice, baboon frieze, glyph bands, doorway, niche figure
  K.box(M.stone, -27, 27, 30, 31.4, FZ - 1.2, FZ + 0.6, 0xfaead4, 0.15); K.box(M.stone, -27.6, 27.6, 31.4, 32.6, FZ - 1.4, FZ + 1.3, 0xf6e2c8, 0.25);
  for (const s of [-1, 1]) K.box(M.stone, s * 27 - 0.7, s * 27 + 0.7, 0, 31, FZ - 1.2, FZ + 0.5, 0xf6e2c8, 0.12);
  for (let i = 0; i < 22; i++) { const x = -25 + i * (50 / 21); if (R() < 0.12) continue; K.at(x, 32.6, FZ + 0.3, 0, () => { K.put(M.stone, lumpGeo(i % 5, 1, 0.3), 0, 0.7, 0, 0, 0, 0, 0.6, 0.75, 0.5, 0xfaead4); K.put(M.stone, sph(0.38, 10, 8), 0, 1.6, 0.15, 0, 0, 0, 1, 1, 1, 0xfaead4); K.put(M.stone, sph(0.18, 8, 6), 0, 1.5, 0.48, 0, 0, 0, 1, 0.8, 1, 0xfaead4); for (const s of [-1, 1]) K.put(M.stone, sph(0.16, 8, 6), s * 0.3, 0.75, 0.42, 0, 0, 0, 1, 1, 1, 0xfaead4); }); } // seated baboons
  mesh(root, plane(46, 2.6), M.glyph2, 0, 28.6, FZ + 0.62, 0, 0, 0, false); // text band (invented glyphs)
  for (const x of [-12, -2.6, 2.6, 12]) mesh(root, plane(2.2, 13), M.glyph, x, 21, FZ - 0.18, 0, 0, 0, false);
  const DW = 3.6, DH = 8.2; mesh(root, plane(DW, DH), M.dark, 0, DH / 2, FZ + 0.2, 0, 0, 0, false); for (const s of [-1, 1]) K.box(M.stone, s * (DW / 2 + 0.4) - 0.45, s * (DW / 2 + 0.4) + 0.45, 0, DH + 0.6, FZ - 0.2, FZ + 0.9, 0xfaead4, 0.05); K.box(M.stone, -DW / 2 - 0.9, DW / 2 + 0.9, DH, DH + 1.3, FZ - 0.2, FZ + 0.95, 0xfaead4, 0.06);
  mesh(root, plane(3.6, 6.4), M.dark, 0, 14.4, FZ + 0.1, 0, 0, 0, false).material = new THREE.MeshBasicMaterial({ color: 0x3a2030 }); // niche
  K.at(0, 11.3, FZ + 0.5, 0, () => { K.box(M.stone, -0.7, 0.7, 0, 3.6, -0.5, 0.5, 0xfaead4, 0.15); K.put(M.stone, sph(0.6, 12, 10), 0, 4.2, 0, 0, 0, 0, 1, 1.1, 1, 0xfaead4); K.put(M.stone, cached('beak', () => new THREE.ConeGeometry(0.22, 0.6, 8)), 0, 4.1, 0.6, Math.PI / 2 - 0.4, 0, 0, 1, 1, 1, 0xf0d0b0); K.put(M.stone, cyl(1.0, 1.0, 0.35, 24), 0, 5.6, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0xfce4c4); });
  // the four colossi (scale 9.5: ~20 m), left pair buried, inner-left broken (its torso + head lie in the sand)
  const CS = 9.5, CZ = FZ + 5.4, CX = [-16.5, -6.8, 6.8, 16.5];
  seatedColossus(K, CX[0], CZ, CS, { crown: true, chip: true, c: 0xf4d0a8 }, R);
  seatedColossus(K, CX[1], CZ, CS, { broken: true, c: 0xffe0c0 }, R);
  seatedColossus(K, CX[2], CZ, CS, { crown: true, c: 0xffffff }, R);
  seatedColossus(K, CX[3], CZ, CS, { crown: true, chip: true, c: 0xf8dcc0 }, R);
  // fallen torso + head of the broken colossus, half sunk in the sand
  K.at(-3.2, hf(-3.2, -9.5) + 0.7, -9.5, 0.5, () => { K.put(M.stone, sph(0.16, 16, 12), 0, 0, 0, 0, 0, 0, 0.95, 1.18, 0.95, 0xffe0c0); K.put(M.stone, sph(0.2, 16, 12), 0, 0.07, -0.05, 0, 0, 0, 1.05, 0.85, 1.0, 0xffe0c0); for (const sx of [-1, 1]) K.cb(M.stone, 0.1, 0.2, 0.16, sx * 0.2, -0.04, -0.05, 0xffe0c0, 0, 0, sx * 0.25, 0.03);
    K.put(M.stone, lathe('crownW', [[0.001, 0], [0.12, 0], [0.1, 0.15], [0.08, 0.3], [0.06, 0.37], [0.001, 0.4]], 14), 0.0, 0.08, -0.12, -1.3, 0, 0, 1, 1, 1, 0xffe0c0); K.box(M.stone, -0.035, 0.035, -0.08, 0.05, 0.12, 0.16, 0xffe0c0, 0.01); }, CS);
  K.at(-10, hf(-10, -13) + 0.6, -13, -0.9, () => K.put(M.stone, cyl(0.36, 0.23, 0.66, 4), 0, 0, 0, Math.PI / 2 - 0.1, Math.PI / 4, 0.2, 1, 1, 0.52, 0xffe0c0), CS);
  for (let i = 0; i < 26; i++) { const x = -22 + R() * 40, z = -18 + R() * 22, k = 0.3 + R() * 1.4; if ((Math.abs(x - 9) < 5 && z > 0) || (x > -2 && x < 11 && z > -17)) continue; K.put(M.stone, lumpGeo(i % 9 + 20, 1, 0.5), x, hf(x, z) + k * 0.2, z, R(), R(), R(), k * 1.3, k, k, [0xf6e2c8, 0xf8e8d0, 0xecd4b8][i % 3]); } // rubble
  for (let i = 0; i < 6; i++) { const x = 18 + R() * 8, z = -8 + R() * 14; K.box(M.stone, x - 0.9, x + 0.9, hf(x, z) - 0.3, hf(x, z) + 0.7, z - 0.6, z + 0.6, 0xf8e8d0, 0.08); } // cut blocks
  // ---- Bartholdi's camp (plaza right): tent, easel, stool, trunk, lantern, jars, rug
  const TX = 12.5, TZ = 1.5, TY = hf(TX, TZ);
  KP.at(TX, TY, TZ, -0.5, () => { const L = 3.4, Wd = 1.6, H = 2.3;
    for (const z of [-L / 2, L / 2]) KP.beam(M.wood, [0, 0, z], [0, H + 0.25, z], 0.05, 0x8a6a4a, true, 8); KP.beam(M.wood, [0, H, -L / 2 - 0.1], [0, H, L / 2 + 0.1], 0.04, 0x8a6a4a, true, 6);
    for (const s of [-1, 1]) { const sl = Math.hypot(H - 0.35, Wd); KP.put(M.tent, plane(L, sl), s * Wd / 2, (H + 0.35) / 2, 0, -s * Math.atan2(Wd, H - 0.35), Math.PI / 2, 0, 1, 1, 1, 0xffffff); KP.put(M.tent, plane(L, 0.35), s * Wd, 0.175, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0xf4e8d0);
      KP.put(M.tent, plane(L + 0.1, 0.26), s * (Wd + 0.03), 0.3, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0xd86a5a); } // sides, walls, valance
    KP.put(M.tent, prismGeo(Wd * 2, H, 0.02), 0, 0, -L / 2, 0, 0, 0, 1, 1, 1, 0xf0e4cc); // back gable
    KP.put(M.dark, prismGeo(Wd * 1.4, H * 0.82, 0.02), 0, 0, L / 2 - 0.15, 0, 0, 0, 1, 1, 1, 0xffffff); // dark interior
    for (const s of [-1, 1]) KP.put(M.tent, prismGeo(Wd * 0.9, H * 0.9, 0.02), s * Wd * 0.62, 0, L / 2 + 0.1, 0, s * 0.6, s * 0.12, 1, 1, 1, 0xf0e4cc); // tied-back flaps
    for (const [a, b] of [[[0, H + 0.2, L / 2], [0, 0, L / 2 + 1.6]], [[0, H + 0.2, -L / 2], [0, 0, -L / 2 - 1.6]], [[Wd, 0.36, L / 2 - 0.3], [Wd + 1.1, 0, L / 2 - 0.3]], [[-Wd, 0.36, L / 2 - 0.3], [-Wd - 1.1, 0, L / 2 - 0.3]], [[Wd, 0.36, -L / 2 + 0.3], [Wd + 1.1, 0, -L / 2 + 0.3]], [[-Wd, 0.36, -L / 2 + 0.3], [-Wd - 1.1, 0, -L / 2 + 0.3]]]) { KP.beam(M.paint, a, b, 0.012, 0xd8c8a8, true, 4); KP.box(M.wood, b[0] - 0.03, b[0] + 0.03, -0.05, 0.12, b[2] - 0.03, b[2] + 0.03, 0x6a4a30, 0.005); }
    KP.box(M.leather, 0.6, 1.4, 0, 0.48, L / 2 + 0.5, L / 2 + 1.0, 0x8a4a2a, 0.04); KP.box(M.brass, 0.6, 1.4, 0.2, 0.25, L / 2 + 0.49, L / 2 + 1.01, 0xc8a050, 0.005); for (const x of [0.8, 1.2]) KP.box(M.paint, x - 0.03, x + 0.03, 0, 0.5, L / 2 + 0.48, L / 2 + 1.02, 0x3a2a20, 0.004); // trunk + straps
    KP.put(M.paint, cyl(0.28, 0.3, 0.06, 18), 1.0, 0.52, L / 2 + 0.75, 0.1, 0, 0.05, 1, 1, 1, 0xe8d0a0); KP.put(M.paint, cyl(0.13, 0.15, 0.12, 14), 1.0, 0.59, L / 2 + 0.75, 0, 0, 0, 1, 1, 1, 0xe8d0a0); // straw hat on the trunk
    KP.put(M.canvas, plane(1.6, 2.2), -0.2, 0.01, L / 2 + 1.2, -Math.PI / 2, 0, 0, 1, 1, 1, 0xc86a3a); // rug
    for (const [jx, jz, k] of [[-1.3, L / 2 + 0.4, 1], [-1.6, L / 2 + 0.15, 0.8]]) KP.put(M.paint, lathe('jar', [[0.001, 0], [0.12, 0.02], [0.2, 0.2], [0.18, 0.42], [0.08, 0.55], [0.09, 0.62], [0.001, 0.62]], 14), jx, 0, jz, 0, 0, 0, k, k, k, 0xb8683a); // water jars
  });
  const LAMP = [TX + 1.6, TY + 0.6, TZ + 2.4]; KP.box(M.wood, LAMP[0] - 0.25, LAMP[0] + 0.25, TY, TY + 0.5, LAMP[2] - 0.2, LAMP[2] + 0.2, 0x9a7a5a, 0.02); // crate
  KP.at(LAMP[0], TY + 0.5, LAMP[2], 0, () => { KP.put(M.metal, cyl(0.07, 0.08, 0.04, 10), 0, 0.02, 0, 0, 0, 0, 1, 1, 1, 0x2a2a30); for (let k = 0; k < 4; k++) KP.beam(M.metal, [Math.cos(k * 1.57) * 0.06, 0.04, Math.sin(k * 1.57) * 0.06], [Math.cos(k * 1.57) * 0.06, 0.25, Math.sin(k * 1.57) * 0.06], 0.008, 0x2a2a30); KP.put(M.metal, cyl(0.03, 0.08, 0.06, 10), 0, 0.28, 0, 0, 0, 0, 1, 1, 1, 0x2a2a30); KP.put(M.metal, tor(0.04, 0.006, 4, 12), 0, 0.34, 0, 0, 0, 0, 1, 1, 1, 0x2a2a30); });
  const lampGlass = mesh(root, cyl(0.05, 0.05, 0.18, 10), M.lampGlass.clone(), LAMP[0], TY + 0.65, LAMP[2], 0, 0, 0, false); nond(lampGlass);
  // easel + sketch + stool, facing the colossi (canvas faces +z toward the sketcher, colossi beyond)
  const EX = 8.6, EZ = 5.2, EY = hf(EX, EZ); KP.at(EX, EY, EZ, 0.25, () => { KP.beam(M.wood, [-0.42, 0, 0.08], [-0.3, 1.62, -0.05], 0.03, 0x8a6a4a); KP.beam(M.wood, [0.42, 0, 0.08], [0.3, 1.62, -0.05], 0.03, 0x8a6a4a); KP.box(M.wood, -0.34, 0.34, 1.56, 1.62, -0.07, -0.01, 0x8a6a4a, 0.005); KP.beam(M.wood, [0, 0, -0.55], [0, 1.65, -0.02], 0.03, 0x8a6a4a);
    KP.box(M.wood, -0.42, 0.42, 0.88, 0.92, 0.02, 0.14, 0x8a6a4a, 0.005); KP.box(M.wood, -0.38, 0.38, 0.92, 1.56, 0.03, 0.06, 0xd8c8a8, 0.005); KP.put(M.sketch, plane(0.72, 0.6), 0, 1.24, 0.066, -0.08, 0, 0, 1, 1, 1, 0xffffff);
    KP.box(M.wood, -0.25, 0.1, 0.92, 0.96, 0.06, 0.13, 0x6a4a2a, 0.005); for (let i = 0; i < 3; i++) KP.beam(M.paint, [-0.2 + i * 0.07, 0.95, 0.1], [-0.17 + i * 0.07, 0.95, 0.1 + 0.02], 0.006, 0x2a2a30); // ledge w/ pencils
    // folding stool (X legs, leather seat) behind the easel, where the sketcher sits
    KP.at(0.05, 0, 0.75, 0, () => { for (const s of [-1, 1]) { KP.beam(M.wood, [s * 0.18, 0, -0.16], [s * 0.18, 0.46, 0.16], 0.022, 0x6a4a2a, true, 6); KP.beam(M.wood, [s * 0.18, 0, 0.16], [s * 0.18, 0.46, -0.16], 0.022, 0x6a4a2a, true, 6); } KP.box(M.leather, -0.2, 0.2, 0.44, 0.47, -0.17, 0.17, 0x7a3a22, 0.01); });
    KP.box(M.wood, 0.45, 0.85, 0, 0.12, 0.3, 0.55, 0x5a3a24, 0.01); for (let i = 0; i < 6; i++) KP.box(M.paint, 0.48 + i * 0.06, 0.52 + i * 0.06, 0.12, 0.14, 0.35, 0.42, [0xc83a2a, 0x2a4aa0, 0xe8b030, 0x3a7a4a, 0x8a5a3a, 0xf4f0e4][i], 0.005); }); // open paint box
  // palms on the bank + far bank, distant hills
  for (const [x, z, h] of [[24, 13, 9], [27.5, 16, 7.5], [30, 11, 10.5], [-27, 15, 8.5], [-31, 12, 10], [-24, 18, 6.5], [34, 17, 8], [-36, 17, 7]]) palm(KP, x, z, h, R, 0.25, hf(x, z) - 0.1);
  const pf = new Kit(); palm(pf, 0, 0, 8, rng(7), 0.15); const PF = pf.prefab(), far = [];
  for (let i = 0; i < 80; i++) far.push([-260 + R() * 520, 1.5, 132 + R() * 25, R() * 6, 0.7 + R() * 0.6]);
  instance(root, PF, far, false);
  for (let i = 0; i < 26; i++) { const x = -320 + i * 26 + R() * 10, k = 18 + R() * 26; K.put(M.stoneBig, lumpGeo(i % 7 + 40, 1, 0.35), x, -2, 230 + R() * 40, 0, R() * 3, 0, k * 2.2, k * 0.55, k * 1.2, [0xecd8c0, 0xe0ccb8, 0xf2dcc4][i % 3]); } // far-bank hills (behind the camera in reverse views)
  for (let i = 0; i < 12; i++) { const x = (i < 6 ? -1 : 1) * (60 + (i % 6) * 22 + R() * 8), k = 14 + R() * 12; K.put(M.stoneBig, lumpGeo(i % 7 + 50, 1, 0.35), x, -1, -60 - R() * 40, 0, R() * 3, 0, k * 1.6, k * 0.9, k * 1.3, [0xf0dcc0, 0xe6ceb4][i % 2]); } // desert hills behind
  // feluccas on the Nile
  const boats = []; for (const [x, z, ry, s, A] of [[7, 47, 0.25, 1, { trim: 0x2a6a9a }], [-8, 58, -0.15, 1.05, { trim: 0xc84a3a, patch: true }], [26, 36, 0.4, 0.9, { trim: 0x2a8a5a }], [34, 60, 2.9, 1, { trim: 0xc84a3a }], [-46, 70, 0.1, 1, { trim: 0x2a6a9a, patch: true }], [62, 88, -0.3, 1, {}]]) { const g = new THREE.Group(); g.position.set(x, 0, z); root.add(g); const k = new Kit(); felucca(k, 0, 0, ry, s, R, A); k.build(g); boats.push({ g, ph: R() * 6 }); }
  K.build(root, 40); KP.build(root, 20);
  return { boats, lampGlass, LAMP, CX, CZ, CS, FZ, hf, tent: [TX, TY, TZ], easel: [EX, EY, EZ] };
}

// ================================================================= CANAL (Port Said, 1869)
function dredger(K, x, z, ry, R) { K.at(x, 0, z, ry, () => { const c = 0x3a3a44;
  K.box(M.hull, -10, 10, -1.4, 1.6, -3.4, 3.4, 0x3a3440, 0.15); K.box(M.paint, -10.1, 10.1, 1.4, 1.7, -3.5, 3.5, 0xa83a2a, 0.04); // hull + red rail
  K.box(M.planks, -9.5, 9.5, 1.6, 1.75, -3.2, 3.2, 0xb89a78, 0.02);
  K.box(M.wood, 2, 7, 1.7, 4.2, -2.4, 2.4, 0xd8c8a8, 0.05); K.box(M.paint, 1.8, 7.2, 4.2, 4.45, -2.6, 2.6, 0x5a4a44, 0.04); for (let i = 0; i < 3; i++) K.box(M.paint, 2.6 + i * 1.5, 3.4 + i * 1.5, 2.7, 3.6, 2.41, 2.45, 0x2a2a3a, 0.01); // engine house
  K.put(M.metal, cyl(0.55, 0.6, 9, 14), 4.5, 8.6, 0, 0, 0, 0, 1, 1, 1, 0x2a2a30); K.put(M.metal, cyl(0.68, 0.68, 0.4, 14), 4.5, 12.9, 0, 0, 0, 0, 1, 1, 1, 0xa83a2a); // funnel
  // bucket ladder: inclined frame through the middle, chain of buckets, tumbler on a gantry
  const top = [-2, 11, 0], bot = [-13, -4, 0]; for (const s of [-1, 1]) K.beam(M.metal, [top[0], top[1], s * 0.7], [bot[0], bot[1], s * 0.7], 0.3, c);
  for (const s of [-1, 1]) { K.beam(M.metal, [-4, 1.7, s * 2.6], [-2, 11.5, s * 0.9], 0.25, c); K.beam(M.metal, [1, 1.7, s * 2.6], [-2, 11.5, s * 0.9], 0.25, c); }
  K.put(M.metal, cyl(1.0, 1.0, 1.6, 8), top[0], top[1], 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x4a4450);
  const n = 26; for (let i = 0; i < n; i++) { const t = i / n, p = [top[0] + (bot[0] - top[0]) * t, top[1] + (bot[1] - top[1]) * t + 0.75, 0]; if (p[1] < -0.3) continue; K.cb(M.metal, 0.75, 0.55, 1.0, p[0], p[1], 0, 0x5a4a40, 0, 0, -0.95, 0.06); }
  // long delivery chute to the bank on a trestle
  K.at(-1, 9, 2, 0, () => { const L = 30, a = -0.28; K.cb(M.wood, 1.4, 0.15, L, 0, -Math.sin(-a) * L / 2, L / 2 * Math.cos(a), 0x8a6a4a, a, 0, 0, 0.02); for (const s of [-1, 1]) K.cb(M.wood, 0.1, 0.7, L, s * 0.7, -Math.sin(-a) * L / 2 + 0.3, L / 2 * Math.cos(a), 0x7a5a3a, a, 0, 0, 0.01); });
  for (let i = 1; i <= 3; i++) { const zz = 2 + i * 7.3, yy = 9 - Math.tan(0.28) * i * 7.3; K.beam(M.wood, [-1.5, yy, zz], [-1.8, -2, zz], 0.18, 0x6a4a30); K.beam(M.wood, [-0.5, yy, zz], [-0.2, -2, zz], 0.18, 0x6a4a30); K.beam(M.wood, [-1.6, yy * 0.5, zz], [-0.4, yy * 0.5, zz], 0.12, 0x6a4a30); }
  K.beam(M.paint, [4.5, 13, 0], [-2, 11.6, 0], 0.03, 0x2a2a2a, true, 4); K.beam(M.paint, [4.5, 13, 0], [9.5, 1.7, 0], 0.03, 0x2a2a2a, true, 4);
}); }
function steamer(K, x, z, ry, R) { K.at(x, 0, z, ry, () => { const L = 52, B = 7.6;
  K.box(M.hull, -L / 2, L / 2, -2, 2.4, -B / 2, B / 2, 0x1e1c26, 0.4); K.put(M.hull, cached('bow', () => new THREE.CylinderGeometry(B / 2, B / 2, 4.4, 16, 1, false, 0, Math.PI)), L / 2, 0.2, 0, 0, Math.PI / 2, 0, 1.6, 1, 1, 0x1e1c26); // hull + rounded bow
  K.box(M.paint, -L / 2 - 0.1, L / 2 + 0.1, 1.4, 1.8, -B / 2 - 0.05, B / 2 + 0.05, 0xf0e8d8, 0.03); K.box(M.planks, -L / 2, L / 2, 2.4, 2.55, -B / 2 + 0.2, B / 2 - 0.2, 0xc8a880, 0.02);
  for (const s of [-1, 1]) { K.put(M.paint, cyl(5.2, 5.2, 2.2, 28, false), 1, 2.6, s * (B / 2 + 1.1), Math.PI / 2, 0, 0, 1, 1, 1, 0xe8e0d0); K.put(M.paint, cyl(5.3, 5.3, 0.2, 28), 1, 2.6, s * (B / 2 + 2.25), Math.PI / 2, 0, 0, 1, 1, 1, 0xc8a050); for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI; K.cb(M.paint, 0.18, 4.6, 0.05, 1 + Math.cos(a) * 2.3, 2.6 + Math.sin(a) * 2.3, s * (B / 2 + 2.32), 0xa83a2a, 0, 0, -a + Math.PI / 2, 0.01); } } // paddle boxes w/ fan ornament
  K.box(M.wood, -14, 8, 2.5, 5, -B / 2 + 0.6, B / 2 - 0.6, 0xf4ece0, 0.05); K.box(M.paint, -14.3, 8.3, 5, 5.25, -B / 2 + 0.3, B / 2 - 0.3, 0x6a5a4a, 0.03); for (let i = 0; i < 12; i++) for (const s of [-1, 1]) K.box(M.paint, -13 + i * 1.75, -12.4 + i * 1.75, 3.4, 4.3, s * (B / 2 - 0.61) - 0.02, s * (B / 2 - 0.61) + 0.02, 0x2a2a3a, 0.01); // deckhouse + windows
  K.put(M.metal, cyl(1.0, 1.05, 10, 16), 1, 9.5, 0, 0, 0, 0, 1, 1, 1, 0xd8b040); K.put(M.metal, cyl(1.08, 1.08, 1.6, 16), 1, 14.0, 0, 0, 0, 0, 1, 1, 1, 0x1e1c26); // funnel (buff, black top)
  const masts = [[16, 22], [-15, 20]]; for (const [mx, h] of masts) { K.put(M.wood, cyl(0.18, 0.28, h, 8), mx, h / 2 + 2.4, 0, 0, 0, 0, 1, 1, 1, 0x7a5a3a); K.beam(M.wood, [mx, h * 0.72, -4.5], [mx, h * 0.72, 4.5], 0.12, 0x6a4a30, true, 6); K.beam(M.wood, [mx, h * 0.95, -3], [mx, h * 0.95, 3], 0.09, 0x6a4a30, true, 6);
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) K.beam(M.paint, [mx, h + 1.5, 0], [mx - 2 + k * 2, 2.5, s * (B / 2)], 0.025, 0x2a2420, true, 4); } // shrouds
  K.beam(M.paint, [16, 23.5, 0], [L / 2 + 2.8, 2.6, 0], 0.03, 0x2a2420, true, 4); K.beam(M.paint, [16, 23.5, 0], [-15, 21.5, 0], 0.03, 0x2a2420, true, 4); K.beam(M.paint, [-15, 21.5, 0], [-L / 2, 3, 0], 0.03, 0x2a2420, true, 4); // stays
  K.beam(M.wood, [L / 2 + 1.2, 2.6, 0], [L / 2 + 7, 4.6, 0], 0.16, 0x6a4a30, true, 6); // bowsprit
}); }
function bunting(root, a, b, sag, n) { // a sagging line of pennants a->b (a strip with pennant texture)
  const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t]); }
  const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), d = [b[0] - a[0], 0, b[2] - a[2]], side = [0, 1, 0]; const g = new THREE.BufferGeometry(), P = [], N = [], U = [], I = [];
  pts.forEach((p, i) => { P.push(p[0], p[1], p[2], p[0], p[1] - 0.9, p[2]); N.push(-d[2], 0, d[0], -d[2], 0, d[0]); U.push(i / 20 * L / 6, 1, i / 20 * L / 6, 0); if (i) { const o = (i - 1) * 2; I.push(o, o + 1, o + 2, o + 1, o + 3, o + 2); } });
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); g.computeVertexNormals();
  const m = mesh(root, g, M.pennants, 0, 0, 0, 0, 0, 0, false); const lg = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p))); root.add(new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0x2a2420 }))); return m; }

function buildCanal(root) {
  const R = rng(1869), K = new Kit(), KT = new Kit(), CW = 21;
  // land: west + east banks of the canal (z > 0), sea to -z; water plane y=0
  const hf = (x, z) => { const sd = Math.min(z + (x < 0 ? 14 : 0) + 3 * Math.sin(x * 0.05), Math.abs(x) - CW); return -3 + 4.6 * sm(-6, 3, sd); };
  terrain(root, 700, 500, 220, 160, 0, 150, hf, (x, z, y) => { const wet = 1 - sm(0, 1.4, y); return [0.98 - 0.22 * wet, 0.9 - 0.22 * wet, 0.78 - 0.18 * wet]; }, M.sand);
  mesh(root, plane(3000, 3000), M.sea, 0, 0, -400, -Math.PI / 2, 0, 0, false).receiveShadow = true;
  // stone quays lining the canal near the entrance
  for (const s of [-1, 1]) { K.box(M.concrete, s * CW - (s > 0 ? 0 : 3), s * CW + (s > 0 ? 3 : 0), -2, 1.6, -4, 120, 0xd8d0c0, 0.05); for (let z = -2; z < 118; z += 9) K.put(M.metal, cyl(0.25, 0.3, 0.6, 10), s * (CW + 0.7 * s / s) * 1 + (s > 0 ? 0.8 : -0.8), 1.9, z, 0, 0, 0, 1, 1, 1, 0x2a2a30); } // bollards
  // breakwaters of big concrete blocks, converging out to sea
  const blocks = []; const bw = (x0, x1, z1, side) => { for (let z = -2; z > z1; z -= 2.6) { const t = z / z1, x = x0 + (x1 - x0) * t; for (let k = 0; k < 4; k++) { const row = k < 3 ? k : 1; blocks.push([x + (row - 1) * 2.6 * side + (R() - 0.5) * 0.6, k < 3 ? 0.3 + R() * 0.4 : 2.2 + R() * 0.3, z + (R() - 0.5) * 1.2, R() * 0.5, 1, [0xd8d0c0, 0xc8c0b0, 0xe0d8c8, 0xb8b0a0][(R() * 4) | 0], 0.8, (R() - 0.5) * 0.4, (R() - 0.5) * 0.4]); } } };
  bw(-26, -21, -190, -1); bw(26, 22, -130, 1);
  const bk = new Kit(); bk.box(M.concrete, -1.3, 1.3, -1.2, 1.2, -1.1, 1.1, 0xffffff, 0.12); const pfB = bk.prefab(); M.concrete.userData.tint = true; instance(root, pfB, blocks);
  // lighthouse (plain white octagonal tower, ~56 m) on the west shore at the entrance
  const LH = [-34, 0, -4], lh = new THREE.Group(); lh.position.set(...LH); root.add(lh); { const k = new Kit(); const c = 0xffffff;
    k.box(M.plaster, -8, 8, 0, 5.5, -6, 6, 0xf4ece0, 0.1); k.box(M.paint, -8.3, 8.3, 5.5, 6.0, -6.3, 6.3, 0xd8d0c4, 0.05); for (let i = 0; i < 5; i++) k.box(M.paint, -6 + i * 3 - 0.5, -6 + i * 3 + 0.5, 1.5, 3.8, 6.0, 6.05, 0x3a3448, 0.02); // keeper's house
    k.put(M.white, cyl(3.4, 4.6, 50, 8), 0, 25 + 0.5, 0, 0, Math.PI / 8, 0, 1, 1, 1, c); for (let i = 0; i < 6; i++) k.box(M.paint, -0.35, 0.35, 8 + i * 7, 9.4 + i * 7, 4.25 - i * 0.18, 4.4 - i * 0.18, 0x3a3448, 0.02); // tower + slit windows
    k.put(M.paint, cyl(4.6, 3.6, 1.4, 8), 0, 51, 0, 0, Math.PI / 8, 0, 1, 1, 1, 0xf0e8dc); k.put(M.paint, cyl(4.8, 4.8, 0.4, 8), 0, 51.9, 0, 0, Math.PI / 8, 0, 1, 1, 1, 0xd8d0c4); // gallery
    for (let i = 0; i < 32; i++) { const a = i / 32 * TAU; k.beam(M.metal, [Math.cos(a) * 4.6, 52.1, Math.sin(a) * 4.6], [Math.cos(a) * 4.6, 53.2, Math.sin(a) * 4.6], 0.05, 0x2a2a30); } k.put(M.metal, tor(4.6, 0.06, 4, 32), 0, 53.2, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2a30);
    k.put(M.metal, cyl(2.3, 2.3, 0.6, 8), 0, 52.4, 0, 0, Math.PI / 8, 0, 1, 1, 1, 0x2a2a30); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + Math.PI / 8; k.beam(M.metal, [Math.cos(a) * 2.25, 52.6, Math.sin(a) * 2.25], [Math.cos(a) * 2.25, 56.0, Math.sin(a) * 2.25], 0.08, 0x2a2a30); }
    k.put(M.metal, cyl(0.4, 2.6, 1.6, 8), 0, 56.8, 0, 0, Math.PI / 8, 0, 1, 1, 1, 0x3a3a44); k.put(M.metal, sph(0.35, 8, 6), 0, 57.8, 0, 0, 0, 0, 1, 1, 1, 0x3a3a44); k.beam(M.metal, [0, 57.8, 0], [0, 59.5, 0], 0.05, 0x2a2a30);
    k.build(lh); }
  const lantern = nond(mesh(lh, cyl(2.15, 2.15, 3.3, 8), M.lampGlass, 0, 54.3, 0, 0, Math.PI / 8, 0, false));
  const beams = new THREE.Group(); beams.position.set(0, 54.3, 0); lh.add(beams); for (const s of [0, Math.PI]) { const b = nond(mesh(beams, cached('beamG', () => { const g = new THREE.ConeGeometry(9, 160, 20, 1, true); g.translate(0, -80, 0); g.rotateZ(Math.PI / 2); return g; }), M.beam, 0, 0, 0, 0, s, 0, false)); b.renderOrder = 5; }
  const lhGlow = nond(mesh(lh, plane(22, 22), M.glow.clone(), 0, 54.3, 0, 0, 0, 0, false)); lhGlow.material.color.set(0xfff0c0); lhGlow.renderOrder = 6;
  // the DREAM: colossal robed woman with a torch, on an Egyptian pedestal, same spot (glowing vision)
  const dreamG = new THREE.Group(); dreamG.position.set(LH[0], 0, LH[2]); root.add(dreamG); const gm = ghostMat(); gm.uniforms.y0.value = 0; gm.uniforms.y1.value = 46;
  const DS = 12.5, PH = 15; let flameL; { const k = new Kit(); egyptPedestal(k, gm, 0xffffff, 13, PH); k.at(0, PH, 0, 0.25, () => { flameL = robedWoman(k, gm, 0xffffff); }, DS); k.build(dreamG); dreamG.traverse((o) => { if (o.isMesh) { nond(o); o.renderOrder = 4; } }); }
  const fl = new THREE.Vector3(...flameL).multiplyScalar(DS).applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.25).add(new THREE.Vector3(0, PH, 0)), FLAME = [fl.x, fl.y, fl.z];
  const flame = nond(mesh(dreamG, plane(2.6, 5.2), M.flame.clone(), FLAME[0], FLAME[1] + 1.4, FLAME[2], 0, 0, 0, false)); flame.renderOrder = 7; const flameGlow = nond(mesh(dreamG, plane(26, 26), M.glow.clone(), FLAME[0], FLAME[1] + 1.2, FLAME[2], 0, 0, 0, false)); flameGlow.material.color.set(0xffb060); flameGlow.renderOrder = 8;
  const dreamHalo = nond(mesh(dreamG, plane(70, 90), M.glow.clone(), 0, 30, -2, 0, 0, 0, false)); dreamHalo.material.color.set(0x8ab8ff); dreamHalo.renderOrder = 3;
  // town on the west quay: two-storey houses with verandas, warehouse, offices
  for (let i = 0; i < 9; i++) { const x = -36 - (i % 3) * 16 - R() * 3, z = 14 + Math.floor(i / 3) * 18 + R() * 4, w = 10 + R() * 4, d = 9, h = 7 + R() * 3, c = [0xf4ece0, 0xe8d0a8, 0xf0dcc0, 0xd8b890, 0xf4f0e8][i % 5], y0 = hf(x, z);
    KT.at(x, y0, z, Math.PI / 2, () => { KT.box(M.plaster, -w / 2, w / 2, 0, h, -d / 2, d / 2, c, 0.06); KT.box(M.paint, -w / 2 - 0.2, w / 2 + 0.2, h, h + 0.4, -d / 2 - 0.2, d / 2 + 0.2, 0x8a6a5a, 0.04);
      for (let j = 0; j < 4; j++) for (const y of [1.0, h / 2 + 0.8]) { const xx = -w / 2 + (j + 0.5) * w / 4; KT.box(M.paint, xx - 0.45, xx + 0.45, y, y + 1.7, d / 2, d / 2 + 0.05, R() < 0.25 ? 0xffc070 : 0x2a2a3a, 0.01); for (const s of [-1, 1]) KT.box(M.paint, xx + s * 0.75 - 0.28, xx + s * 0.75 + 0.28, y, y + 1.7, d / 2, d / 2 + 0.08, [0x3a6a5a, 0x4a6a8a, 0x8a4a3a][i % 3], 0.01); }
      KT.box(M.planks, -w / 2, w / 2, h / 2 - 0.1, h / 2 + 0.1, d / 2, d / 2 + 2.2, 0xb89a78, 0.02); for (let j = 0; j <= 5; j++) KT.box(M.wood, -w / 2 + j * w / 5 - 0.1, -w / 2 + j * w / 5 + 0.1, 0, h - 0.2, d / 2 + 2.0, d / 2 + 2.2, 0xe8dcc8, 0.01); KT.box(M.paint, -w / 2, w / 2, h - 0.4, h - 0.1, d / 2, d / 2 + 2.3, 0xc8b8a0, 0.02); // veranda
      for (let j = 0; j < 20; j++) KT.box(M.wood, -w / 2 + j * w / 20, -w / 2 + j * w / 20 + 0.06, h / 2 + 0.1, h / 2 + 1.0, d / 2 + 2.12, d / 2 + 2.18, 0xe8dcc8, 0.005); KT.box(M.wood, -w / 2, w / 2, h / 2 + 1.0, h / 2 + 1.1, d / 2 + 2.1, d / 2 + 2.2, 0xe8dcc8, 0.005); }); }
  KT.box(M.plaster, -60, -36, hf(-48, 4), 6, -2, 8, 0xd8c0a0, 0.08); KT.box(M.paint, -60.3, -35.7, 6, 6.6, -2.3, 8.3, 0x7a5a4a, 0.05); for (let j = 0; j < 6; j++) KT.box(M.paint, -58 + j * 3.8, -56.5 + j * 3.8, hf(-48, 4), 4.2, 8, 8.06, 0x4a3a34, 0.02); // warehouse
  mesh(root, plane(16, 4), M.portSaid, -48, 4.6, 8.35, 0, 0, 0, false); // PORT SAID 1869 on the warehouse
  // SUEZ CANAL board on posts on the east quay facing the canal mouth
  KT.at(CW + 6, 1.6, 6, -Math.PI / 2 + 0.35, () => { for (const s of [-1, 1]) KT.box(M.wood, s * 5 - 0.2, s * 5 + 0.2, 0, 7, -0.2, 0.2, 0x6a4a30, 0.02); KT.box(M.wood, -6, 6, 6.8, 7.2, -0.3, 0.3, 0x6a4a30, 0.02); }); mesh(root, plane(11, 2.4), M.suez, CW + 6 - 0.94 * 0.25, 1.6 + 5.2, 6 + 0.34 * 0.25, 0, -Math.PI / 2 + 0.35, 0, false);
  KT.at(-CW - 6, 1.6, 20, Math.PI / 2, () => { for (const s of [-1, 1]) KT.box(M.wood, s * 6.5 - 0.2, s * 6.5 + 0.2, 0, 7.4, -0.2, 0.2, 0x6a4a30, 0.02); KT.box(M.wood, -7.4, 7.4, 7.2, 7.6, -0.3, 0.3, 0x6a4a30, 0.02); }); mesh(root, plane(14, 3.5), M.portSaid, -CW - 6 + 0.25, 1.6 + 5.3, 20, 0, Math.PI / 2, 0, false);
  // east bank: workshops, cranes, sheds, piles of sacks and timber
  for (let i = 0; i < 5; i++) { const x = CW + 14 + (i % 3) * 14, z = 20 + Math.floor(i / 3) * 22 + R() * 6, w = 11, d = 8, h = 5 + R() * 2; KT.box(M.planks, x - w / 2, x + w / 2, hf(x, z), h, z - d / 2, z + d / 2, [0xc8a880, 0xb8987a, 0xd8b890][i % 3], 0.04); KT.cb(M.metal, w + 0.6, 0.2, d / 2 + 1.2, x, h + 0.8, z - d / 4, 0x6a5a5a, -0.35, 0, 0, 0.02); KT.cb(M.metal, w + 0.6, 0.2, d / 2 + 1.2, x, h + 0.8, z + d / 4, 0x6a5a5a, 0.35, 0, 0, 0.02); }
  for (let i = 0; i < 30; i++) { const x = CW + 2 + R() * 9, z = 4 + R() * 40; KT.put(M.canvas, sph(0.45, 8, 6), x, 1.6 + 0.3, z, 0, R() * 3, 0, 1, 0.6, 1.4, 0xd8c098); } // sacks
  for (let i = 0; i < 8; i++) KT.put(M.wood, cyl(0.45, 0.45, 1.0, 12), -CW - 2 - R() * 6, 2.1, 10 + R() * 30, 0, 0, 0, 1, 1, 1, 0x8a5a38); // barrels
  for (let i = 0; i < 6; i++) { const pp = palm(KT, -CW - 4 - R() * 10, 30 + i * 9, 7 + R() * 3, R, 0.2, 1.6); }
  // dredgers in the cut + paddle steamer heading out, a few far ships at sea
  dredger(K, 10, 60, Math.PI / 2, R); dredger(K, -9, 130, -Math.PI / 2, R);
  steamer(K, -3, -22, Math.PI / 2 + 0.06, R);
  for (const [x, z, s] of [[-140, -320, 1], [120, -420, 0.8], [40, -600, 0.7]]) { K.at(x, 0, z, 0.4, () => { K.box(M.hull, -14, 14, -1, 2, -3, 3, 0x2a2a34, 0.3); for (const mx of [-7, 0, 7]) { K.put(M.wood, cyl(0.2, 0.3, 18, 6), mx, 10, 0, 0, 0, 0, 1, 1, 1, 0x5a4a3a); for (let k = 0; k < 3; k++) K.put(M.sail, plane(8 - k * 1.5, 4), mx, 5 + k * 4.6, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0xf4ead4); } }, s); }
  const buntings = [bunting(root, [-3 + 0, 25.5, -22 - 16], [-3, 2.6, -22 - 31.6], 0.6), bunting(root, [-3, 25.5, -22 - 16], [-3, 21.5, -22 + 15], 1.6), bunting(root, [-3, 21.5, -22 + 15], [-3, 3, -22 + 26], 0.6)];
  const flags = []; for (const [p, mt] of [[[-3, 25.6, -38], M.flagFR], [[-3, 22, -7], M.flagR], [[-34 + 0, 0, 0], null]]) { if (!mt) continue; const fg = nond(mesh(root, (() => { const g = new THREE.PlaneGeometry(3, 2, 10, 2); g.translate(1.5, -1, 0); return g; })(), mt, ...p, 0, Math.PI / 2 - 0.4, 0, false)); flags.push(fg); }
  // smoke puffs (filled in tick)
  const smoke = []; puffs(root, 18, smoke, M.puff); const stacks = [[10, 13.4, 60 - 4.5], [-9, 13.4, 130 + 4.5], [-3 + 0.06 * 1, 15, -22 - 1]];
  K.build(root, 40); KT.build(root, 30);
  return { lh, lantern, beams, lhGlow, dreamG, gm, flame, flameGlow, dreamHalo, FLAME: [FLAME[0] + LH[0], FLAME[1], FLAME[2] + LH[2]], LH, smoke, stacks, flags, hf };
}

// ================================================================= PALACE (Khedive's hall, 1860s)
function archWall(root, K0, w, h, d, arches, mat, ringC) { // a wall in the local x-y plane (front at z=0, back at -d) with horseshoe openings; arches: [cx, sill, cy, r]
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.closePath();
  for (const [cx, sill, cy, r] of arches) s.holes.push(horseshoe(new THREE.Path(), cx, sill, cy, r));
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 24 }); g.translate(0, 0, -d); const m = mesh(root, g, mat, 0, 0, 0, 0, 0, 0, false); const K = new Kit();
  for (const [cx, sill, cy, r] of arches) { const n = 17, t0 = 0.36, a0 = Math.PI + t0, a1 = -t0; for (let i = 0; i < n; i++) { const A = a0 + (a1 - a0) * i / n, B = a0 + (a1 - a0) * (i + 1) / n, r1 = r + 0.42;
      const key = `vs${r}|${i}`; const geo = cached(key, () => { const p = new THREE.Shape(); p.moveTo(Math.cos(A) * r, Math.sin(A) * r); p.lineTo(Math.cos(A) * r1, Math.sin(A) * r1); p.absarc(0, 0, r1, A, B, true); p.lineTo(Math.cos(B) * r, Math.sin(B) * r); p.absarc(0, 0, r, B, A, false); return new THREE.ExtrudeGeometry(p, { depth: 0.08, bevelEnabled: false, curveSegments: 4 }); });
      K.put(M.paint, geo, cx, cy, 0.0, 0, 0, 0, 1, 1, 1, i % 2 ? ringC[0] : ringC[1]); }
    const jx = r * Math.cos(t0); for (const sx of [-1, 1]) { K.box(M.paint, cx + sx * jx - 0.06, cx + sx * jx + 0.06, sill, cy - r * Math.sin(t0), -d, 0.04, 0xe8dcc0, 0.01); K.put(M.paint, cyl(0.12, 0.12, cy - r * Math.sin(t0) - sill, 10), cx + sx * (jx + 0.2), (sill + cy - r * Math.sin(t0)) / 2, 0.12, 0, 0, 0, 1, 1, 1, 0xf0e8dc); K.box(M.gold, cx + sx * (jx + 0.2) - 0.18, cx + sx * (jx + 0.2) + 0.18, cy - r * Math.sin(t0) - 0.25, cy - r * Math.sin(t0), -0.06, 0.3, 0xe0b050, 0.02); } } // colonnettes + gilt capitals
  K.build(root); return m; }
function ottomanLantern(K, x, y, z, s = 1) { K.at(x, y, z, 0, () => { K.put(M.lantern, lathe('olant', [[0.001, -0.42], [0.06, -0.38], [0.16, -0.22], [0.2, 0], [0.17, 0.18], [0.1, 0.3], [0.04, 0.4], [0.001, 0.42]], 16), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xffffff);
  K.put(M.brass, lathe('olcap', [[0.001, 0.4], [0.06, 0.42], [0.03, 0.55], [0.01, 0.7], [0.001, 0.72]], 12), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); K.put(M.brass, sph(0.05, 8, 6), 0, -0.46, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); }, s); }
function chandelier(K, x, y, z, glass) { K.at(x, y, z, 0, () => { const b = 0xd8b050;
  K.beam(M.brass, [0, 0, 0], [0, 4, 0], 0.03, 0x6a5a40, true, 6); K.put(M.brass, lathe('chst', [[0.001, -1.6], [0.12, -1.5], [0.08, -1.2], [0.18, -0.9], [0.06, -0.6], [0.14, -0.2], [0.05, 0.2], [0.001, 0.3]], 14), 0, 0, 0, 0, 0, 0, 1, 1, 1, b);
  for (const [ry, R, n] of [[-1.0, 1.25, 12], [-0.35, 0.8, 8], [0.25, 0.45, 6]]) { K.put(M.brass, tor(R, 0.035, 6, 40), 0, ry, 0, Math.PI / 2, 0, 0, 1, 1, 1, b);
    for (let i = 0; i < n; i++) { const a = i / n * TAU, px = Math.cos(a) * R, pz = Math.sin(a) * R; K.beam(M.brass, [0, ry - 0.25, 0], [px, ry, pz], 0.022, b, true, 5); K.put(M.brass, cyl(0.06, 0.04, 0.08, 8), px, ry + 0.04, pz, 0, 0, 0, 1, 1, 1, b); K.put(glass, cyl(0.025, 0.025, 0.16, 6), px, ry + 0.16, pz, 0, 0, 0, 1, 1, 1, 0xffffff); K.put(glass, sph(0.035, 6, 5), px, ry + 0.28, pz, 0, 0, 0, 1, 1.5, 1, 0xffffff); K.put(M.crystal, sph(0.025, 6, 5), px, ry - 0.12, pz, 0, 0, 0, 1, 1.6, 1, 0xffffff); }
    for (let i = 0; i < n * 2; i++) { const a = (i + 0.5) / (n * 2) * TAU; K.put(M.crystal, sph(0.018, 5, 4), Math.cos(a) * R * 0.92, ry - 0.18 - (i % 2) * 0.06, Math.sin(a) * R * 0.92, 0, 0, 0, 1, 1.8, 1, 0xffffff); } }
  K.put(M.brass, sph(0.12, 10, 8), 0, -1.7, 0, 0, 0, 0, 1, 1.3, 1, b); }); }
function buildPalace(root) {
  const R = rng(1867), K = new Kit(), X = 9, ZB = -8, ZF = 8, H = 8.5;
  mesh(root, plane(2 * X, ZF - ZB), M.marble, 0, 0, 0, -Math.PI / 2, 0, 0, false);
  mesh(root, plane(7.5, 5.2), M.carpet, 0, 0.012, -2.6, -Math.PI / 2, 0, 0, false); mesh(root, plane(2.4, 9), M.runner, 0, 0.01, 3.6, -Math.PI / 2, 0, 0, false);
  for (const s of [-1, 1]) mesh(root, plane(2.6, 4.6), M.carpet, s * 6.6, 0.011, -1.5, -Math.PI / 2, 0, Math.PI / 2, false);
  // back wall: three tall horseshoe windows onto the Cairo sunset; side walls: arcades with mashrabiya; front wall with door arch
  const wallMat = M.wall; const ring = [0xf4ead4, 0xa8483a];
  const back = new THREE.Group(); back.position.set(0, 0, ZB); root.add(back); archWall(back, K, 2 * X, H, 0.7, [[-4.6, 1.0, 4.6, 1.15], [0, 0.9, 5.2, 1.5], [4.6, 1.0, 4.6, 1.15]], wallMat, ring);
  for (const s of [-1, 1]) { const sd = new THREE.Group(); sd.position.set(s * X, 0, 0); sd.rotation.y = -s * Math.PI / 2; root.add(sd); const K2 = new Kit(); archWall(sd, K2, ZF - ZB, H, 0.7, [[-4.5, 0, 3.2, 1.45], [0, 0, 3.2, 1.45], [4.5, 0, 3.2, 1.45]], wallMat, ring);
    for (const cx of [-4.5, 0, 4.5]) { if (s > 0 && cx === -4.5) continue; const mm = mesh(sd, plane(2.7, 4.6), M.mash, cx, 2.35, -0.35, 0, 0, 0, false); mm.material = M.mash; }
    for (const cx of [-4.5, 0, 4.5]) mesh(sd, plane(3.2, 4.8), M.dark, cx, 2.4, -2.0, 0, 0, 0, false); // dark galleries beyond
    for (const [a, b] of [[-8, -5.86], [-3.14, -1.36], [1.36, 3.14], [5.86, 8]]) mesh(sd, plane(b - a, 1.0), M.tiles, (a + b) / 2, 0.5, 0.03, 0, 0, 0, false); K2.build(sd); }
  const front = new THREE.Group(); front.position.set(0, 0, ZF); front.rotation.y = Math.PI; root.add(front); archWall(front, K, 2 * X, H, 0.7, [[0, 0, 3.4, 1.6]], wallMat, ring); mesh(front, plane(3.4, 5), M.dark, 0, 2.5, -1.5, 0, 0, 0, false);
  K.box(M.paint, -X, X, H - 0.05, H + 0.3, ZB, ZF, 0x5a3420, 0.02);
  mesh(root, plane(2 * X, 0.85), M.tiles, 0, 0.425, ZB + 0.03, 0, 0, 0, false); // tile dado (back)
  for (const z of [ZB + 0.03]) mesh(root, plane(2 * X, 0.7), M.stucco, 0, 7.4, z, 0, 0, 0, false); for (const s of [-1, 1]) mesh(root, plane(ZF - ZB, 0.7), M.stucco, s * (X - 0.03), 7.4, 0, 0, -s * Math.PI / 2, 0, false);
  // coffered ceiling + muqarnas-ish cornice blocks
  const ce = mesh(root, plane(2 * X, ZF - ZB), M.coff, 0, H, 0, Math.PI / 2, 0, 0, false); ce.material.map.repeat.set(9, 8);
  for (let i = -X; i <= X; i += 2) K.box(M.wood, i - 0.12, i + 0.12, H - 0.35, H, ZB, ZF, 0x4a2a18, 0.02); for (let j = ZB; j <= ZF; j += 2) K.box(M.wood, -X, X, H - 0.35, H, j - 0.12, j + 0.12, 0x4a2a18, 0.02);
  for (let i = 0; i < 36; i++) { const x = -X + 0.25 + i * (2 * X - 0.5) / 35; K.cb(M.gold, 0.3, 0.3, 0.3, x, H - 0.6, ZB + 0.15, 0xd8a840, 0.6, 0, 0, 0.02); K.cb(M.paint, 0.3, 0.2, 0.25, x + 0.25, H - 0.9, ZB + 0.12, 0x2a5a8a, 0.4, 0, 0, 0.02); }
  // window: sunset Cairo backdrop + mullions + lower mashrabiya grille
  mesh(back, plane(40, 20), M.cairo, 0, 6, -14, 0, 0, 0, false); for (const [cx, sill, cy, r] of [[-4.6, 1.0, 4.6, 1.15], [0, 0.9, 5.2, 1.5], [4.6, 1.0, 4.6, 1.15]]) { const k2 = K; k2.box(M.wood, cx - r - 0.1, cx + r + 0.1, sill - 0.12, sill, ZB - 0.1, ZB + 0.45, 0x5a3420, 0.02);
    k2.box(M.wood, cx - 0.04, cx + 0.04, sill, cy + r, ZB - 0.35, ZB - 0.3, 0x3a2418, 0.005); k2.box(M.wood, cx - r, cx + r, cy - 0.5, cy - 0.44, ZB - 0.35, ZB - 0.3, 0x3a2418, 0.005); const g2 = mesh(root, plane(2 * r * 0.95, 1.6), M.mash, cx, sill + 0.8, ZB - 0.32, 0, 0, 0, false); }
  const shafts = []; for (const [cx, k] of [[-4.6, 0.8], [0, 1.1], [4.6, 0.8]]) { const s = nond(mesh(root, plane(2.2 * k, 9), M.shaft, cx + 0.4, 3.0, ZB + 3.2, -0.9, 0.1, 0, false)); s.renderOrder = 3; shafts.push(s); }
  // chandelier + brass lanterns
  const glass = M.lampGlass; chandelier(K, 0, 6.3, -0.5, glass); for (const [x, z, y] of [[-6.5, -4.5, 5.0], [6.5, -4.5, 5.0], [-6.5, 3.5, 5.0], [6.5, 3.5, 5.0]]) { K.beam(M.brass, [x, y + 0.7, z], [x, H, z], 0.015, 0x6a5a40, true, 4); ottomanLantern(K, x, y, z, 1.25); }
  const glows = []; for (const p of [[0, 5.6, -0.5], [-6.5, 5.0, -4.5], [6.5, 5.0, -4.5], [-6.5, 5.0, 3.5], [6.5, 5.0, 3.5]]) { const gl = nond(mesh(root, plane(p[0] ? 1.8 : 4.5, p[0] ? 1.8 : 4.5), M.glow.clone(), ...p, 0, 0, 0, false)); gl.material.opacity = p[0] ? 0.45 : 0.35; gl.renderOrder = 6; glows.push(gl); }
  // the desk (gilded bureau plat), throne chair, maquette, scroll, inkstand, coffee tray
  const DZ = -3.3, DH = 0.8; K.at(0, 0, DZ, 0, () => { K.box(M.wood, -1.3, 1.3, DH - 0.06, DH, -0.62, 0.62, 0x4a2414, 0.02); K.box(M.velvet, -1.15, 1.15, DH, DH + 0.005, -0.5, 0.5, 0x2a6a3a, 0.002); K.box(M.gold, -1.32, 1.32, DH - 0.16, DH - 0.06, -0.64, 0.64, 0xe0b050, 0.02);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { K.put(M.gold, cyl(0.06, 0.035, DH - 0.16, 10), sx * 1.2, (DH - 0.16) / 2, sz * 0.52, sz * 0.08, 0, -sx * 0.08, 1, 1, 1, 0xd8a840); K.put(M.gold, sph(0.07, 8, 6), sx * 1.2, DH - 0.18, sz * 0.52, 0, 0, 0, 1, 1, 1, 0xe0b050); }
    for (let i = 0; i < 3; i++) { K.box(M.gold, -0.9 + i * 0.6, -0.5 + i * 0.6, DH - 0.14, DH - 0.08, 0.64, 0.66, 0xf0c060, 0.005); } });
  K.at(0, 0, DZ - 1.1, 0, () => { K.box(M.gold, -0.42, 0.42, 0.45, 0.55, -0.35, 0.35, 0xd8a840, 0.03); K.box(M.velvet, -0.38, 0.38, 0.55, 0.65, -0.32, 0.32, 0xa02030, 0.04); K.box(M.velvet, -0.38, 0.38, 0.65, 1.55, -0.38, -0.28, 0xa02030, 0.05); K.put(M.gold, tor(0.42, 0.04, 6, 24, Math.PI), 0, 1.5, -0.33, 0, 0, 0, 1, 0.6, 1, 0xe0b050);
    for (const sx of [-1, 1]) { K.box(M.gold, sx * 0.42 - 0.05, sx * 0.42 + 0.05, 0, 0.9, -0.33, 0.33, 0xd8a840, 0.02); K.box(M.velvet, sx * 0.42 - 0.07, sx * 0.42 + 0.07, 0.86, 0.92, -0.33, 0.3, 0xa02030, 0.02); } }); // throne chair
  // maquette: the robed torch woman on a little pedestal (terracotta plaster)
  const MQ = [-0.55, DH, DZ + 0.05]; K.at(MQ[0], MQ[1], MQ[2], 0.5, () => { egyptPedestal(K, M.stone, 0xf0c8a0, 0.36, 0.2); K.at(0, 0.2, 0, 0, () => robedWoman(K, M.paint, 0xd89870, { c2: 0xe0a07a }), 0.2); });
  // inkstand, papers, coffee tray, a small bronze bell
  K.box(M.brass, 0.6, 0.95, DH, DH + 0.04, DZ - 0.3, DZ - 0.1, 0xc8a050, 0.01); for (const x of [0.67, 0.88]) K.put(M.paint, cyl(0.04, 0.045, 0.06, 10), x, DH + 0.07, DZ - 0.2, 0, 0, 0, 1, 1, 1, 0x2a2a40); K.beam(M.paint, [0.7, DH + 0.08, DZ - 0.2], [0.82, DH + 0.3, DZ - 0.25], 0.006, 0xf4f0e4, true, 4);
  for (let i = 0; i < 4; i++) K.box(M.paper, 0.2 + R() * 0.1, 0.5 + R() * 0.1, DH + 0.005 + i * 0.003, DH + 0.008 + i * 0.003, DZ - 0.4 + R() * 0.1, DZ - 0.05, 0xf4ecd8, 0.001);
  K.at(1.6, 0, DZ + 0.3, 0, () => { K.put(M.brass, cyl(0.42, 0.42, 0.03, 24), 0, 0.55, 0, 0, 0, 0, 1, 1, 1, 0xd8b050); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; K.beam(M.wood, [0, 0, 0], [Math.cos(a) * 0.3, 0.54, Math.sin(a) * 0.3], 0.025, 0x4a2a18, true, 5); } K.put(M.brass, lathe('dallah', [[0.001, 0], [0.07, 0], [0.08, 0.06], [0.04, 0.14], [0.045, 0.2], [0.001, 0.22]], 12), 0.1, 0.57, 0, 0, 0, 0, 1, 1, 1, 0xd8b050); for (const [x, z] of [[-0.15, 0.1], [-0.1, -0.15]]) K.put(M.paint, cyl(0.03, 0.022, 0.05, 10), x, 0.6, z, 0, 0, 0, 1, 1, 1, 0xf4f0e8); });
  // divans along the side walls, cushions, potted palms, narghile
  for (const s of [-1, 1]) { K.box(M.velvet, s * (X - 1.25), s * (X - 0.4), 0, 0.42, -6, 5.5, 0xa02030, 0.05); for (let i = 0; i < 6; i++) K.cb(M.cushion, 0.18, 0.6, 0.8, s * (X - 0.55), 0.7, -5.3 + i * 1.95, 0xffffff, 0, 0, -s * 0.2, 0.08); }
  for (const [x, z] of [[-3.6, -6.8], [3.6, -6.8], [-7.2, 6.6], [7.2, 6.6]]) { K.put(M.brass, lathe('pot', [[0.001, 0], [0.3, 0], [0.4, 0.3], [0.36, 0.6], [0.42, 0.66], [0.001, 0.66]], 16), x, 0, z, 0, 0, 0, 1, 1, 1, 0xc8a050); K.at(x, 0.55, z, 0, () => palm(K, 0, 0, 3.2, R, 0.1), 0.42); }
  K.at(2.8, 0, -6.6, 0, () => { K.put(M.brass, lathe('narg', [[0.001, 0], [0.22, 0], [0.24, 0.12], [0.12, 0.3], [0.04, 0.42], [0.03, 0.9], [0.09, 0.95], [0.05, 1.02], [0.001, 1.04]], 14), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xc8a050); K.beam(M.velvet, [0.1, 0.25, 0], [0.5, 0.05, 0.3], 0.015, 0x6a2a3a, true, 4); });
  // the price scroll: rolled on the desk, unrolling over the front edge, down to the carpet and across the floor toward camera
  const SP = []; SP.push([0.45, DH + 0.012, DZ - 0.2], [0.42, DH + 0.012, DZ + 0.2], [0.4, DH + 0.012, DZ + 0.58]); for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI / 2; SP.push([0.4, DH - 0.02 + 0.03 * Math.cos(a) - (1 - Math.cos(a)) * 0.0, DZ + 0.62 + Math.sin(a) * 0.06]); }
  for (let i = 1; i <= 8; i++) { const t = i / 8; SP.push([0.4 + t * 0.02, (DH - 0.03) * (1 - t) + 0.02 * t + 0.01, DZ + 0.68 + t * t * 0.35]); }
  for (let i = 1; i <= 26; i++) { const t = i / 26; SP.push([0.42 + 0.35 * Math.sin(t * 2.2), 0.018 + 0.004 * Math.sin(t * 40), DZ + 1.05 + t * 4.6]); }
  const sgeo = ribbonGeo(SP, 0.34, [1, 0, 0], 1.2); const scroll = mesh(root, sgeo, M.scroll, 0, 0, 0, 0, 0, 0, false); scroll.castShadow = true;
  const rollEnd = mesh(root, cyl(0.055, 0.055, 0.36, 14), M.paper, 0, 0, 0, 0, 0, Math.PI / 2, true); const rollTop = mesh(root, cyl(0.07, 0.07, 0.38, 14), M.paper, 0.45, DH + 0.07, DZ - 0.24, 0, 0, Math.PI / 2, true);
  for (const ry of [1]) mesh(rollTop, cyl(0.02, 0.02, 0.46, 8), M.wood, 0, 0, 0, 0, 0, 0, false);
  const lens = [0]; for (let i = 1; i < SP.length; i++) lens.push(lens[i - 1] + Math.hypot(...[0, 1, 2].map((k) => SP[i][k] - SP[i - 1][k])));
  K.build(root, 6);
  return { shafts, glows, scroll, rollEnd, SP, lens, MQ, DZ, DH };
}

// ================================================================= lights, grades, practicals, views
const SET_LIGHT = {
  colossi: { top: '#4a62c0', hor: '#ffc48c', fog: '#f4c49c', fogN: 70, fogF: 520, sky: '#9a98d8', ground: '#6a4a50', hemiI: 0.95, fillCol: '#6a78d8', fillI: 0.34, sunCol: '#ffc888', sunI: 3.0, az: 52, el: 14, disc: '#fff0c8', discSize: 0.0022, clouds: false, stars: 0, cardTint: '#fff0e0', fxTint: '#fff4e8', shafts: 0.5 },
  canal: { top: '#3a4aa8', hor: '#ffa070', fog: '#f0a888', fogN: 90, fogF: 900, sky: '#8a88d0', ground: '#5a4060', hemiI: 0.95, fillCol: '#6a70d8', fillI: 0.4, sunCol: '#ff9a5a', sunI: 3.0, az: -72, el: 7, disc: '#fff0c0', discSize: 0.005, clouds: false, stars: 0, cardTint: '#ffeee0', fxTint: '#fff0e8', shafts: 0.7 },
  palace: { top: '#000000', hor: '#2a1a14', fog: '#2a1a16', fogN: 14, fogF: 60, sky: '#ffe0c0', ground: '#5a2a24', hemiI: 1.0, fillCol: '#7a7ae0', fillI: 0.36, sunCol: '#ffa868', sunI: 1.4, az: 180 - 20, el: 22, disc: '#000000', clouds: false, shadow: false, stars: 0, cardTint: '#fff0e0', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  colossi: { look: 'golden', over: { exp: 1.06, con: 1.26, sat: 1.06, tS: ['#3a3a8a', 0.18], tH: ['#ffc080', 0.12], bloom: [0.45, 0.8], hal: [0.24, '#ffa040'], vig: [0.3, 0.5, '#2a2440'] } },
  canal: { look: 'golden', over: { exp: 1.08, con: 1.24, sat: 1.04, tS: ['#2a3a8a', 0.2], tH: ['#ffb070', 0.14], bloom: [0.42, 0.75], hal: [0.3, '#ff9a50'], vig: [0.32, 0.48, '#1e1a3a'] } },
  palace: { look: 'office', over: { exp: 1.2, con: 1.28, sat: 1.06, lift: [0.035, 0.025, 0.045], tS: ['#3a2a6a', 0.18], tH: ['#ffc888', 0.12], bloom: [0.45, 0.75], hal: [0.3, '#ff9a50'], vig: [0.34, 0.46, '#2a1420'] } },
};

export function buildEgypt(ctx) {
  ({ THREE, toon, mkTex, PT } = ctx); NOND = ctx.NOND || null; CAM = ctx.camera || null; MACRO = ctx.macro || null;
  M = materials();
  const groups = {};
  for (const name of SETS) { const g = new THREE.Group(); g.name = 'egy_' + name; g.position.set(...O[name]); g.visible = false; ctx.scene.add(g); groups[name] = g; }
  const co = buildColossi(groups.colossi), ca = buildCanal(groups.canal), pa = buildPalace(groups.palace);
  const cx = co.CX, cz = co.CZ;
  const spots = {
    // colossi (feet of the giants ~ y 0..1; tent camp at the right of the plaza)
    feetL: W3('colossi', [cx[2] - 2.5, co.hf(cx[2] - 2.5, cz + 9), cz + 9]), feetR: W3('colossi', [cx[3] - 1.5, co.hf(cx[3] - 1.5, cz + 10), cz + 10]), doorway: W3('colossi', [0, co.hf(0, -21), -21]),
    plaza: W3('colossi', [3, co.hf(3, -4), -4]), plazaB: W3('colossi', [5, co.hf(5, -2), -2]), plazaC: W3('colossi', [1.2, co.hf(1.2, -3), -3]),
    fallenHead: W3('colossi', [-3.2, 1.5, -9.5]), sketchStool: W3('colossi', [co.easel[0] + 0.25, co.easel[1], co.easel[2] + 0.75]), easel: W3('colossi', [co.easel[0], co.easel[1] + 1.24, co.easel[2]]),
    tentDoor: W3('colossi', [co.tent[0] + 1.0, co.tent[1], co.tent[2] + 2.2]), bank: W3('colossi', [6, co.hf(6, 17), 17]), lantern: W3('colossi', co.LAMP),
    // canal (quays at y = 1.6)
    quayW: W3('canal', [-25, 1.6, 6]), quayW2: W3('canal', [-27, 1.6, 9]), quayE: W3('canal', [CW_ + 3.2, 1.6, 7.5]), quayE2: W3('canal', [CW_ + 3.5, 1.6, 4.5]), signE: W3('canal', [CW_ + 4.5, 1.6, 6]), signW: W3('canal', [-CW_ - 3.5, 1.6, 20]),
    lighthouseBase: W3('canal', [ca.LH[0] + 9, 1.6, ca.LH[2] + 4]), statueBase: W3('canal', [ca.LH[0], 15 * 1, ca.LH[2]]), torch: W3('canal', ca.FLAME), steamerDeck: W3('canal', [-3, 2.55, -12]),
    // palace
    khediveChair: W3('palace', [0, 0, pa.DZ - 1.0]), khediveStand: W3('palace', [-0.4, 0, pa.DZ - 0.95]), deskFront: W3('palace', [-0.9, 0, pa.DZ + 1.1]), bartholdi: W3('palace', [-1.1, 0, pa.DZ + 1.2]), adviser: W3('palace', [1.9, 0, pa.DZ - 0.3]),
    maquette: W3('palace', pa.MQ), scrollEnd: W3('palace', [0.6, 0, pa.DZ + 5.6]), scrollMid: W3('palace', [0.6, 0, pa.DZ + 3.0]), entrance: W3('palace', [0, 0, 6.5]), window: W3('palace', [0, 0, -7.4]),
  };
  const V = (set, p, l, fov, cInf, fp, extra = {}) => { const c = { set, p: W3(set, p), l: W3(set, l), fov, cInf, fp: fp ? W3(set, fp) : null, ...extra }; c.focus = Math.hypot(...[0, 1, 2].map((i) => c.p[i] - (c.fp || c.l)[i])); return c; };
  const views = [
    V('colossi', [5.5, 1.4, 30], [5, 11.5, -24], 48, 1.8, [3, 1, -4]), // 0 colossi wide hero from the bank: four giants, tiny human spot at their feet
    V('colossi', [4, 2.4, 80], [0, 9, -20], 33, 1.2, [-1, 6, -20]), // 1 across the Nile: feluccas in front of the temple
    V('colossi', [0.2, 0.6, -5.5], [6.8, 14.5, -21], 60, 2.5, [5.5, 2, -14]), // 2 low hero at the feet, looking up a colossus
    V('colossi', [13.5, 1.6, 14], [8, 5.5, -12], 46, 3.5, [9, 1.4, 5.5]), // 3 camp medium: tent, easel, stool; giants behind
    V('colossi', [9.15, 1.75, 7.3], [8.62, 1.45, 5.25], 42, 6, [8.62, 1.3, 5.25]), // 4 sketch insert over the easel, colossi soft beyond
    V('colossi', [-6, 1.7, 15], [40, 3, 50], 42, 2.5, [16, 2, 42]), // 5 Nile view into the sun: palms, feluccas, glitter
    V('canal', [62, 30, 100], [-14, 2, -6], 44, 1.5, [-3, 5, -22]), // 6 canal wide: the cut, dredger, steamer, lighthouse at the mouth, sunset
    V('canal', [-8, 3.2, 26], [-34, 26, -6], 58, 1.6, [-34, 20, -4], { dream: 1, lh: 0 }), // 7 DREAM reveal, low hero angle: glowing robed woman with the torch
    V('canal', [-8, 3.2, 26], [-34, 26, -6], 58, 1.6, [-34, 20, -4], { dream: 0, lh: 1 }), // 8 same angle, the plain lighthouse
    V('canal', [30, 4, 40], [10, 6, 58], 44, 4, [10, 4, 58]), // 9 dredger medium: bucket chain, chute, smoke
    V('canal', [2.6, 3.6, 15.5], [CW_ + 6, 5.0, 6], 46, 4, [CW_ + 3.5, 2.5, 6]), // 10 SUEZ CANAL sign medium (spots quayE*)
    V('canal', [45, 12, -95], [-32, 22, -4], 38, 1.5, [-30, 10, -4], { dream: 0.55, lh: 0 }), // 11 from the sea: half-faded dream over the entrance
    V('palace', [2.0, 1.75, 6.8], [0, 3.0, -6], 54, 2.5, [0, 1.2, -3.3]), // 12 palace wide: chandelier, arches, desk, sunset windows
    V('palace', [1.6, 1.5, 0.3], [-0.1, 1.15, -3.6], 44, 5, [-0.2, 1.1, -3.3]), // 13 desk medium (Khedive spot, maquette, scroll)
    V('palace', [-0.05, 1.28, -2.25], [-0.55, 1.2, -3.25], 40, 8, [-0.55, 1.2, -3.25]), // 14 maquette close-up
    V('palace', [1.5, 0.45, 2.6], [0.4, 0.35, -2.6], 46, 6, [0.5, 0.2, 0.2]), // 15 scroll on the floor, low, desk beyond
    V('palace', [-2.6, 0.4, 4.0], [0.6, 4.6, -2.4], 62, 3, [0, 4.5, -0.5]), // 16 low hero: chandelier + arches
    V('canal', [6, 4.2, 28], [-27, 6.5, 18], 46, 4, [-26, 5, 20]), // 17 PORT SAID 1869 board on the west quay, lighthouse beyond (spot signW)
  ];
  for (const v of views) { if (v.set === 'canal') { v.dream ??= 0; v.lh ??= 1; } }
  let FRAME = 0, CUR = null, DREAM = 0, LHK = 1, SCROLL = 1, BEAM = 0;
  const v3 = new THREE.Vector3();
  const API = {
    groups, origin: O, spots, views, info: { colossiHeight: 2.0 * co.CS, statueTorch: spots.torch },
    // canal: the dream vision 0..1 (opacity, glow, torch light). Lighthouse built height 0..1 (0 = nothing), beam on/off
    dream(t) { DREAM = Math.max(0, Math.min(1, t)); ca.dreamG.visible = DREAM > 0.002; ca.gm.uniforms.op.value = DREAM; ca.flame.material.opacity = Math.min(1, DREAM * 1.4); ca.flameGlow.material.opacity = 0.75 * DREAM; ca.dreamHalo.material.opacity = 0.22 * DREAM; },
    setLighthouse(k, beam = BEAM) { LHK = Math.max(0, Math.min(1, k)); ca.lh.visible = LHK > 0.002; ca.lh.scale.y = Math.max(0.001, LHK); const lit = LHK > 0.999; ca.lantern.visible = lit; ca.lhGlow.visible = lit; BEAM = beam ? 1 : 0; ca.beams.visible = lit && !!beam; },
    // palace: scroll unrolled 0..1 (0 = only the roll on the desk)
    setScroll(k) { SCROLL = Math.max(0, Math.min(1, k)); const L = pa.lens[pa.lens.length - 1] * Math.max(0.02, SCROLL); let i = 1; while (i < pa.lens.length - 1 && pa.lens[i] < L) i++; pa.scroll.geometry.setDrawRange(0, (i - 1) * 6);
      const p = pa.SP[i - 1], q = pa.SP[Math.min(i, pa.SP.length - 1)]; pa.rollEnd.position.set(p[0], p[1] + 0.055, p[2]); pa.rollEnd.rotation.set(0, Math.atan2(q[0] - p[0], q[2] - p[2]), Math.PI / 2, 'YXZ'); pa.rollEnd.visible = SCROLL > 0.02; },
    tick(f) { FRAME = f; const T = f / 30;
      if (CUR === 'colossi' || CUR == null) { M.nile.map.offset.set(f * 0.0004, Math.sin(f * 0.012) * 0.004); co.boats.forEach((b, i) => { b.g.position.y = Math.sin(T * 1.3 + b.ph) * 0.06; b.g.rotation.z = Math.sin(T * 0.9 + b.ph) * 0.02; b.g.position.x += 0; });
        co.lampGlass.material.color.setScalar(1.8 + 0.25 * Math.sin(f * 0.7) * Math.sin(f * 0.23)); }
      if (CUR === 'canal' || CUR == null) { M.sea.map.offset.set(f * 0.0002, f * 0.0003); ca.beams.rotation.y = f * 0.02;
        ca.smoke.forEach((p, i) => { const st = ca.stacks[i % 3], k = Math.floor(i / 3), ph = ((f * 0.006 + k / 6) % 1); p.position.set(st[0] + ph * 9 + Math.sin(ph * 5 + i) * 0.6, st[1] + ph * 10, st[2] - ph * 4); p.scale.setScalar(2 + ph * 9); p.material.opacity = 0.95 * (1 - ph) * Math.min(1, ph * 6); if (CAM) p.quaternion.copy(CAM.quaternion); });
        ca.flags.forEach((fg, i) => { const p = fg.geometry.attributes.position; if (!fg.userData.base) fg.userData.base = p.array.slice(); const b = fg.userData.base; for (let j = 0; j < p.count; j++) { const x = b[j * 3]; p.setZ(j, Math.sin(x * 2.2 - f * 0.25 + i) * 0.22 * x / 3); } p.needsUpdate = true; fg.geometry.computeVertexNormals(); });
        const fl = 1 + 0.08 * Math.sin(f * 0.9) + 0.05 * Math.sin(f * 2.3); ca.flame.scale.set(1 + 0.05 * Math.sin(f * 1.7), fl, 1); ca.flameGlow.scale.setScalar(0.92 + 0.08 * fl); }
      if (CUR === 'palace' || CUR == null) { pa.shafts.forEach((s, i) => { s.material.opacity = 0.06 + 0.015 * Math.sin(f * 0.03 + i); }); pa.glows.forEach((g, i) => { g.material.opacity = (i ? 0.45 : 0.35) * (0.94 + 0.06 * Math.sin(f * 0.5 + i * 2)); }); }
      API.face(); },
    lightFor(name) { return { ...LIGHTS_[name === 'palace' ? 'office' : 'golden'], ...SET_LIGHT[name] }; },
    gradeFor: (name) => ({ ...((SET_GRADE[name] || {}).over || {}) }),
    lookFor: (name) => (SET_GRADE[name] || {}).look || 'golden',
    show(world, name) { for (const k in groups) groups[k].visible = k === name; CUR = name;
      if (name) { for (const k of ['road', 'stadium', 'office', 'car', 'dc']) if (world[k]) world[k].visible = false; if (world.rooms) world.rooms.show(world, null); API.tick(FRAME); } },
    placeLights(PRACT, name) { const L = API.practicals(name); PRACT.forEach((l, i) => { const c = L[i]; l.visible = true; if (!c) { l.intensity = 0; return; } l.position.set(...c.p); l.color.set(c.col); l.intensity = c.I; l.distance = c.d; l.decay = 1.6; }); API.face(name); },
    practicals(name) { const fl = 1 + 0.12 * Math.sin(FRAME * 0.9) * Math.sin(FRAME * 0.37);
      if (name === 'colossi') return [{ p: W3('colossi', [co.LAMP[0], co.LAMP[1] + 0.2, co.LAMP[2]]), col: '#ffb860', I: 1.4 * fl, d: 6 }];
      if (name === 'canal') return [DREAM > 0.01 ? { p: spots.torch, col: '#ffb060', I: 60 * DREAM * fl, d: 90 } : null, LHK > 0.999 ? { p: W3('canal', [ca.LH[0], 54, ca.LH[2]]), col: '#fff0c0', I: 30, d: 70 } : null, { p: W3('canal', [-40, 6, 24]), col: '#ffb060', I: 3, d: 16 }].filter(Boolean);
      if (name === 'palace') return [{ p: W3('palace', [0, 5.4, -0.5]), col: '#ffc070', I: 5.5 * fl, d: 14 }, { p: W3('palace', [-6.5, 4.9, -4.5]), col: '#ffb050', I: 2.0, d: 6 }, { p: W3('palace', [6.5, 4.9, -4.5]), col: '#ffb050', I: 2.0, d: 6 }, { p: W3('palace', [0, 3.5, -6.5]), col: '#ff9a70', I: 3.0, d: 9 }];
      return []; },
    face(name = CUR) { const cam = CAM; if (!cam) return; const q = cam.quaternion;
      if (name === 'canal') { for (const o of [ca.flameGlow, ca.lhGlow, ca.dreamHalo, ...ca.smoke]) o.quaternion.copy(q); ca.flame.quaternion.copy(q); }
      if (name === 'palace') pa.glows.forEach((g) => g.quaternion.copy(q)); },
    viewFor(i, f = 0) { const k = ((i % views.length) + views.length) % views.length, c = views[k];
      return { i: k, mod: API, set: c.set, f, dream: c.dream ?? 0, lh: c.lh ?? 1, scroll: c.scroll ?? 1, L: API.lightFor(c.set), look: API.lookFor(c.set), grade: API.gradeFor(c.set), cam: { p: c.p, l: c.l, fov: c.fov, focus: c.focus, cInf: c.cInf, roll: c.roll || 0, shadowAt: c.fp || c.l } }; },
    apply(world, v) { API.show(world, v.set); API.dream(v.dream ?? 0); API.setLighthouse(v.lh ?? 1, v.beam ?? 0); API.setScroll(v.scroll ?? 1); API.tick(v.f ?? FRAME); },
  };
  API.view = API.viewFor; API.dream(0); API.setLighthouse(1, 0); API.setScroll(1); API.tick(0);
  return API;
}
const CW_ = 21;
