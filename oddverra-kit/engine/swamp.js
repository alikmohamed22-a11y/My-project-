// swamp.js [TEDDY-swamp]: sets for "The teddy bear exists because a president refused to shoot a bear" (Oddverra short).
//   swamp    : Mississippi bottomland, November 1902: bald cypress (rust autumn crowns) with knees, Spanish moss, murky channels,
//              canebrake, palmettos, fallen logs, mist + god-rays, a muddy trail.  Moody green-gold morning.        origin (-3200, 0, -3200)
//   camp     : the hunting camp at dusk: wall tents, campfire (tripod pot, coffee pot, smoke), hound cards lying on straw,
//              horse cards at a hitching rail, map table + lanterns, rifles upright in a rack against a tree, a 45-star flag. origin (-3500, 0, -3200)
//   willow   : bayou clearing, one black willow; a sitting black bear card (rope looped loosely to the trunk, ears down, worried),
//              mud + reeds; TR / Collier spots ~4 m away. Soft overcast.  setBear({worry, look, blink})                  origin (-3800, 0, -3200)
//   newsroom : 1902 Washington newspaper office: desk rows + typewriters, cartoonist's drafting table (setDrawing(t): an ORIGINAL ink
//              cartoon inks itself in), lamp, paper stacks, big window, press glimpse through a doorway, a front page prop
//              with the period masthead text only.                                                                     origin (-4100, 0, -3200)
// Each set: local frame, ground / floor y = 0, camera side +z. All groups start hidden; show(world, name) displays one.
import { Kit } from './world.js';
import { LIGHTS_ } from './story.js';

let THREE, toon, mkTex, PT, NOND, CAM, MACRO;
export const SWAMP_ORIGIN = { swamp: [-3200, 0, -3200], camp: [-3500, 0, -3200], willow: [-3800, 0, -3200], newsroom: [-4100, 0, -3200] };
const O = SWAMP_ORIGIN, SETS = Object.keys(O);
const W3 = (name, p) => [p[0] + O[name][0], p[1] + O[name][1], p[2] + O[name][2]];
const INK = '#2b1d4a', TAU = Math.PI * 2;

// ---------------------------------------------------------------- geometry helpers
const GC = new Map();
const cached = (k, mk) => { let g = GC.get(k); if (!g) GC.set(k, (g = mk())); return g; };
const cyl = (rt, rb, h, rs = 12, open = false) => cached(`c${rt}|${rb}|${h}|${rs}|${open}`, () => new THREE.CylinderGeometry(rt, rb, h, rs, 1, open));
const sph = (r, ws = 14, hs = 10) => cached(`s${r}|${ws}|${hs}`, () => new THREE.SphereGeometry(r, ws, hs));
const tor = (r, t, rs = 6, ts = 24, arc = TAU) => cached(`t${r}|${t}|${rs}|${ts}|${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));
const plane = (w, h) => cached(`p${w}|${h}`, () => new THREE.PlaneGeometry(w, h));
const hang = (w, h) => cached(`hg${w}|${h}`, () => new THREE.PlaneGeometry(w, h).translate(0, -h / 2, 0)); // top edge at y=0
const stand = (w, h) => cached(`st${w}|${h}`, () => new THREE.PlaneGeometry(w, h).translate(0, h / 2, 0)); // bottom edge at y=0
const lathe = (key, pts, n = 20) => cached('la' + key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n));
const mesh = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, shadow = true) => { if (mat.vertexColors && !geo.attributes.color && geo.attributes.position) geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(1), 3)); const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz, 'YXZ'); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
const nond = (o) => { if (NOND) NOND.add(o); o.castShadow = false; return o; };
const rockGeo = (seed) => cached('rock' + seed, () => { const g = new THREE.IcosahedronGeometry(1, 1), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed * 4.1) * 43758.5453, k = 0.78 + 0.4 * (h - Math.floor(h)); p.setXYZ(i, x * k, y * k * 0.8, z * k); }
  g.computeVertexNormals(); return g; });
// bald cypress trunk: flared, fluted buttress base tapering up (unit radius ~0.5 mid, height 1)
const trunkGeo = (seed, flare = 2.4) => cached(`tr${seed}|${flare}`, () => { const g = new THREE.CylinderGeometry(0.5, 0.5, 1, 22, 16, true); g.translate(0, 0.5, 0); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), th = Math.atan2(z, x);
    const fl = 1 + flare * Math.exp(-y * 7), flute = 1 + (0.2 * Math.sin(6 * th + seed) + 0.1 * Math.sin(11 * th + seed * 2)) * Math.exp(-y * 3.5), tp = 1 - 0.5 * y, k = fl * flute * tp;
    p.setXYZ(i, x * k + 0.06 * Math.sin(y * 3 + seed), y, z * k + 0.05 * Math.cos(y * 2.3 + seed)); }
  g.computeVertexNormals(); return g; });
const kneeGeo = () => lathe('knee', [[0, 0], [1, 0], [0.92, 0.35], [0.75, 0.68], [0.5, 0.9], [0.22, 0.99], [0, 1]], 10);
// ribbon along a centre line (trail): pts [[x,z],..], width w, y from fn
function ribbonGeo(pts, w, yf) { const pos = [], uv = [], idx = []; let v = 0;
  pts.forEach(([x, z], i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l;
    if (i) v += Math.hypot(x - pts[i - 1][0], z - pts[i - 1][1]) / w;
    for (const s of [-1, 1]) { const px = x + nx * s * w / 2, pz = z + nz * s * w / 2; pos.push(px, yf(px, pz), pz); uv.push(s < 0 ? 0 : 1, v); }
    if (i) { const k = i * 2; idx.push(k - 2, k, k - 1, k - 1, k, k + 1); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g; }
const prismGeo = (w, h, d) => cached(`pr${w}|${h}|${d}`, () => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g; });

// ---------------------------------------------------------------- painters
const css = (...a) => PT.css(...a), shade = (...a) => PT.shade(...a), tint = (...a) => PT.tint(...a), vary = (...a) => PT.vary(...a), rng = (...a) => PT.rng(...a), fbm = (...a) => PT.fbm(...a), modulate = (...a) => PT.modulate(...a), hex = (...a) => PT.hex(...a);
const SERIF = '"DejaVu Serif", Georgia, serif';
function txt(g, s, cx, cy, maxW, sz, o = {}) {
  g.save(); g.font = `${o.italic ? 'italic ' : ''}${o.bold === false ? '' : 'bold '}${sz | 0}px ${o.font || SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const tw = g.measureText(s).width, sx = Math.min(1, maxW / tw); g.translate(cx, cy); g.scale(sx, 1); g.fillStyle = o.col || INK; g.fillText(s, 0, 0); g.restore();
}
const LEAFC = ['#a8602a', '#8a4a24', '#c0843a', '#6a4a2a', '#9a7a3a', '#7a3a22', '#b8903e', '#5a3a26'];
function litterTex(g, w, h, o = {}) {
  const base = hex(o.base || '#6a5038'), R = rng(o.seed || 3); g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  modulate(g, w, h, (u, v) => 0.82 + 0.3 * fbm(u, v, 4, 4, 4, o.seed || 3));
  for (let i = 0; i < (o.n ?? 1100); i++) { const x = R() * w, y = R() * h, s = 3 + R() * 6, a = R() * 6.3, c = LEAFC[(R() * LEAFC.length) | 0];
    g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = css(c, 0.55 + R() * 0.4); g.beginPath(); g.ellipse(0, 0, s, s * 0.42, 0, 0, TAU); g.fill(); g.strokeStyle = css(shade(c, 0.6), 0.6); g.lineWidth = 0.8; g.beginPath(); g.moveTo(-s, 0); g.lineTo(s, 0); g.stroke(); g.restore(); }
  g.strokeStyle = 'rgba(50,34,30,0.6)'; g.lineCap = 'round'; for (let i = 0; i < 40; i++) { const x = R() * w, y = R() * h, a = R() * 6.3, L = 8 + R() * 22; g.lineWidth = 1 + R() * 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
  if (o.moss) for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(${90 + R() * 30},${110 + R() * 30},60,0.35)`; g.beginPath(); g.ellipse(R() * w, R() * h, 6 + R() * 18, 4 + R() * 10, R() * 3, 0, TAU); g.fill(); }
}
function trailTex(g, w, h) { // u across (alpha edges), v along
  g.clearRect(0, 0, w, h); const R = rng(8); const img = g.createImageData(w, h), d = img.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const u = x / w, v = y / h, e = Math.min(u, 1 - u), n = fbm(u, v, 4, 8, 4, 5), a = e * 2 + (n - 0.5) * 0.5 > 0.22 ? 255 : 0, k = 0.8 + 0.35 * fbm(u, v, 6, 12, 3, 9), wet = Math.max(0, 1 - Math.abs(u - 0.5 - 0.15 * Math.sin(v * 12)) * 8) * 0.25;
    const i = (y * w + x) * 4; d[i] = (160 - wet * 40) * k; d[i + 1] = (126 - wet * 10) * k; d[i + 2] = (88 + wet * 10) * k; d[i + 3] = a; }
  g.putImageData(img, 0, 0);
  for (let i = 0; i < 26; i++) { const x = w * (0.3 + R() * 0.4), y = R() * h; g.fillStyle = 'rgba(60,40,32,0.55)'; g.beginPath(); g.ellipse(x, y, 5, 9, 0.1, 0, TAU); g.fill(); g.beginPath(); g.ellipse(x + 3, y - 12, 4, 5, 0, 0, TAU); g.fill(); } // boot prints
  for (let i = 0; i < 14; i++) { const x = w * (0.25 + R() * 0.5), y = R() * h; g.strokeStyle = 'rgba(56,38,30,0.6)'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 7, 0.4, Math.PI * 2 - 0.4); g.stroke(); } // hoof prints
  for (let i = 0; i < 90; i++) { const c = LEAFC[(R() * LEAFC.length) | 0]; g.fillStyle = css(c, 0.8); g.save(); g.translate(R() * w, R() * h); g.rotate(R() * 6); g.beginPath(); g.ellipse(0, 0, 5, 2.2, 0, 0, TAU); g.fill(); g.restore(); }
}
function waterTex(g, w, h) {
  const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#3a4a2c'); gr.addColorStop(0.5, '#2e3e2a'); gr.addColorStop(1, '#3c4630'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  modulate(g, w, h, (u, v) => 0.8 + 0.4 * fbm(u, v, 3, 3, 4, 21)); const R = rng(4);
  g.lineCap = 'round'; for (let i = 0; i < 260; i++) { const x = R() * w, y = R() * h, L = 10 + R() * 40; g.strokeStyle = `rgba(${170 + R() * 50},${180 + R() * 40},${130},${0.12 + R() * 0.22})`; g.lineWidth = 1 + R() * 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L / 2, y - 2, x + L, y); g.stroke(); }
  for (let k = 0; k < 40; k++) { const cx = R() * w, cy = R() * h; for (let i = 0; i < 25; i++) { g.fillStyle = `rgba(${110 + R() * 40},${150 + R() * 30},60,0.75)`; g.beginPath(); g.arc(cx + (R() - 0.5) * 50, cy + (R() - 0.5) * 30, 1.2 + R() * 2, 0, TAU); g.fill(); } } // duckweed
  for (let i = 0; i < 30; i++) { const c = LEAFC[(R() * 4) | 0]; g.fillStyle = css(c, 0.9); g.save(); g.translate(R() * w, R() * h); g.rotate(R() * 6); g.beginPath(); g.ellipse(0, 0, 6, 2.6, 0, 0, TAU); g.fill(); g.restore(); }
}
function mossTex(g, w, h) { g.clearRect(0, 0, w, h); const R = rng(12); g.lineCap = 'round';
  for (let i = 0; i < 70; i++) { const x0 = w * (0.1 + R() * 0.8), L = h * (0.35 + 0.6 * Math.sin(Math.PI * x0 / w) * R()), c = ['#a8b096', '#8e9a80', '#bcc2aa', '#7e8a74'][i % 4];
    g.strokeStyle = c; g.lineWidth = 2 + R() * 3; g.beginPath(); let x = x0; g.moveTo(x, 0); for (let y = 0; y < L; y += 8) { x += (R() - 0.5) * 7; g.lineTo(x, y); } g.stroke();
    g.lineWidth = 1.2; for (let y = 10; y < L; y += 14) { const xx = x0 + (R() - 0.5) * 8; g.beginPath(); g.moveTo(xx, y); g.lineTo(xx + (R() - 0.5) * 14, y + 8); g.stroke(); } } }
function bladeTex(g, w, h, o = {}) { g.clearRect(0, 0, w, h); const c = o.c || '#7a8a3a'; const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, shadeCss(c, 0.7)); gr.addColorStop(0.7, c); gr.addColorStop(1, o.tip || '#b0a050'); g.fillStyle = gr;
  g.beginPath(); g.moveTo(w * 0.35, h); g.quadraticCurveTo(w * 0.05, h * 0.4, w * 0.5, 0); g.quadraticCurveTo(w * 0.95, h * 0.4, w * 0.65, h); g.closePath(); g.fill(); g.strokeStyle = 'rgba(40,40,20,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, 4); g.stroke(); }
const shadeCss = (c, k) => css(shade(c, k));
function palmTex(g, w, h) { g.clearRect(0, 0, w, h); const cx = w / 2, cy = h * 0.95, R = rng(5);
  for (let i = 0; i < 26; i++) { const a = Math.PI * (1.08 + 0.84 * i / 25), L = h * (0.78 + R() * 0.15), c = R() < 0.2 ? '#9a8a3a' : ['#4a6a3a', '#56763e', '#3e5e34'][i % 3];
    g.strokeStyle = c; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx, cy); g.quadraticCurveTo(cx + Math.cos(a) * L * 0.5, cy + Math.sin(a) * L * 0.55, cx + Math.cos(a) * L, cy + Math.sin(a) * L * 0.9 + 10); g.stroke(); g.strokeStyle = 'rgba(30,40,20,0.4)'; g.lineWidth = 1.5; g.stroke(); }
  g.fillStyle = '#4a5a32'; g.beginPath(); g.arc(cx, cy, 10, 0, TAU); g.fill(); g.strokeStyle = '#5a5a32'; g.lineWidth = 5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, h); g.stroke(); }
function willowTex(g, w, h) { g.clearRect(0, 0, w, h); const R = rng(17); g.lineCap = 'round';
  for (let i = 0; i < 20; i++) { const x0 = w * (0.06 + 0.88 * i / 19) + (R() - 0.5) * 10, L = h * (0.55 + 0.45 * R()); g.strokeStyle = '#6a5a3a'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x0, 0); g.quadraticCurveTo(x0 + (R() - 0.5) * 16, L / 2, x0 + (R() - 0.5) * 10, L); g.stroke();
    for (let y = 6; y < L; y += 7) { if (R() < 0.12) continue; const c = ['#c8b84a', '#a8a840', '#d8a838', '#8a9a3a', '#b8a03c'][(R() * 5) | 0], s = R() < 0.5 ? -1 : 1, xx = x0 + (y / L) * (R() - 0.5) * 6; g.fillStyle = c; g.save(); g.translate(xx, y); g.rotate(s * (0.35 + R() * 0.3)); g.beginPath(); g.ellipse(s * 8, 4, 10, 3.6, 0.2 * s, 0, TAU); g.fill(); g.restore(); } } }
function reedTex(g, w, h) { g.clearRect(0, 0, w, h); const R = rng(23); g.lineCap = 'round';
  for (let i = 0; i < 34; i++) { const x0 = w * (0.1 + R() * 0.8), H = h * (0.45 + R() * 0.52), lean = (R() - 0.5) * w * 0.25, c = ['#8a8a42', '#a89a52', '#6e7a3a', '#b8a868', '#7a6a3a'][i % 5];
    g.strokeStyle = c; g.lineWidth = 3 + R() * 3; g.beginPath(); g.moveTo(x0, h); g.quadraticCurveTo(x0 + lean * 0.3, h - H * 0.6, x0 + lean, h - H); g.stroke();
    if (i % 5 === 0) { g.fillStyle = '#6a4a2a'; g.beginPath(); g.ellipse(x0 + lean * 0.7, h - H * 0.82, 5, 16, lean * 0.002, 0, TAU); g.fill(); } } }
function rayTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.2, 'rgba(255,255,255,0.5)'); gr.addColorStop(0.7, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const gx = g.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.5, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over'; }
function glowTex(g, w, h) { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
function mistTex(g, w, h) { const img = g.createImageData(w, h), d = img.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const u = x / w, v = y / h, e = Math.min(1, Math.min(u, 1 - u) * 5) * Math.min(1, Math.min(v, 1 - v) * 4), n = fbm(u, v, 3, 2, 4, 31), i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = 255 * e * Math.max(0, n * 1.6 - 0.45); }
  g.putImageData(img, 0, 0); }
function foliageTex(g, w, h) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); const R = rng(41);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${60 + R() * 40},${40 + R() * 30},${70 + R() * 30},${0.12 + R() * 0.2})`; g.beginPath(); g.ellipse(R() * w, R() * h, 3 + R() * 6, 1.5 + R() * 3, R() * 3, 0, TAU); g.fill(); }
  for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(255,240,200,${0.15 + R() * 0.2})`; g.beginPath(); g.ellipse(R() * w, R() * h, 2 + R() * 4, 1 + R() * 2, R() * 3, 0, TAU); g.fill(); } }
function canvasClothTex(g, w, h) { PT.fabric(g, w, h, { base: '#e4d8bc' }); const R = rng(6); g.strokeStyle = 'rgba(120,100,80,0.35)'; g.lineWidth = 2; for (let x = 0; x < w; x += w / 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(120,90,60,${0.06 + R() * 0.08})`; g.beginPath(); g.ellipse(R() * w, R() * h, 20 + R() * 50, 10 + R() * 30, 0, 0, TAU); g.fill(); }
  const gr = g.createLinearGradient(0, h * 0.75, 0, h); gr.addColorStop(0, 'rgba(90,60,40,0)'); gr.addColorStop(1, 'rgba(90,60,40,0.45)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
function star5(g, x, y, r) { g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.42 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); }
function flag45Tex(g, w, h) { for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#f2ede0' : '#b8323a'; g.fillRect(0, i * h / 13, w, h / 13 + 1); } const cw = w * 0.4, ch = h * 7 / 13; g.fillStyle = '#28356e'; g.fillRect(0, 0, cw, ch); g.fillStyle = '#f4f0e4';
  for (let r = 0; r < 6; r++) { const n = r % 2 ? 7 : 8; for (let i = 0; i < n; i++) star5(g, cw * ((i + (r % 2 ? 1 : 0.5)) / 8), ch * (r + 0.6) / 6.2, h * 0.022); } modulate(g, w, h, (u, v) => 0.92 + 0.1 * fbm(u, v, 3, 3, 3, 8)); }
function huntMapTex(g, w, h) { PT.paper(g, w, h, {}); g.fillStyle = 'rgba(200,170,110,0.35)'; g.fillRect(0, 0, w, h); const R = rng(9);
  g.strokeStyle = '#4a6a8a'; g.lineCap = 'round'; for (const [y0, k, lw] of [[0.3, 1, 7], [0.65, -1, 4], [0.85, 1, 3]]) { g.lineWidth = lw; g.beginPath(); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * y0 + k * Math.sin(x * 0.02) * 30 + Math.sin(x * 0.05) * 10); g.stroke(); }
  g.strokeStyle = '#7a4a2a'; g.setLineDash([8, 7]); g.lineWidth = 3; g.beginPath(); g.moveTo(w * 0.1, h * 0.95); g.bezierCurveTo(w * 0.3, h * 0.6, w * 0.5, h * 0.55, w * 0.7, h * 0.42); g.stroke(); g.setLineDash([]);
  g.fillStyle = '#4a5a3a'; for (let i = 0; i < 40; i++) { const x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y - 8); g.lineTo(x - 5, y + 4); g.lineTo(x + 5, y + 4); g.fill(); }
  g.strokeStyle = '#b02a2a'; g.lineWidth = 6; g.beginPath(); g.moveTo(w * 0.68, h * 0.38); g.lineTo(w * 0.74, h * 0.46); g.moveTo(w * 0.74, h * 0.38); g.lineTo(w * 0.68, h * 0.46); g.stroke();
  g.strokeStyle = 'rgba(80,60,40,0.4)'; g.lineWidth = 2; g.strokeRect(10, 10, w - 20, h - 20); }
function plasterTex(g, w, h) { g.fillStyle = '#d8c8a0'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.86 + 0.2 * fbm(u, v, 3, 3, 4, 13)); }
function wallpaperTex(g, w, h) { g.fillStyle = '#7a8a6a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(220,210,160,0.22)'; for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { const ox = (y / 64) % 2 ? 32 : 0; g.beginPath(); g.ellipse(x + ox + 32, y + 32, 10, 18, 0, 0, TAU); g.fill(); g.fillRect(x + ox + 30, y + 10, 4, 44); }
  for (let x = 0; x < w; x += 32) { g.fillStyle = 'rgba(40,50,30,0.12)'; g.fillRect(x, 0, 2, h); } modulate(g, w, h, (u, v) => 0.85 + 0.2 * fbm(u, v, 3, 3, 4, 19)); }
function winViewTex(g, w, h) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#d8e4f0'); gr.addColorStop(0.6, '#f4ead4'); gr.addColorStop(1, '#f0dcc0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = rng(14);
  for (const [y0, k, a] of [[0.5, 0.6, 0.35], [0.62, 1, 0.6]]) { let x = -20; while (x < w) { const bw = 50 + R() * 90, bh = h * (0.18 + R() * 0.22) * k, c = ['#c8a898', '#b8b0b0', '#d0b8a0', '#a89898'][(R() * 4) | 0]; g.fillStyle = css(c, a + 0.3); g.fillRect(x, h * y0 + h * 0.4 - bh, bw, bh + h); g.fillStyle = `rgba(90,80,100,${a * 0.5})`; for (let yy = h * y0 + h * 0.4 - bh + 10; yy < h; yy += 22) for (let xx = x + 8; xx < x + bw - 10; xx += 18) g.fillRect(xx, yy, 8, 12); x += bw + 4; } }
  g.fillStyle = 'rgba(80,60,50,0.5)'; for (let i = 0; i < 6; i++) { const x = R() * w; g.fillRect(x, h * 0.55, 4, h * 0.45); g.beginPath(); g.arc(x + 2, h * 0.55, 30, 0, TAU); g.fill(); } }
function floorTex(g, w, h) { PT.planks(g, w, h, { base: '#8a6440', n: 8, seed: 61 }); }
function scribbleLines(g, x, y, w, h, lh, a = 0.55, R = rng(3)) { g.strokeStyle = `rgba(40,34,40,${a})`; g.lineWidth = Math.max(1, lh * 0.35); for (let yy = y; yy < y + h; yy += lh) { let x0 = x; const end = x + w * (yy + lh >= y + h ? 0.5 + R() * 0.3 : 1); while (x0 < end) { const ww = Math.min(end - x0, lh * (1 + R() * 4)); g.beginPath(); g.moveTo(x0, yy); g.lineTo(x0 + ww, yy); g.stroke(); x0 += ww + lh * 0.5; } } }

// ---------------------------------------------------------------- Oddverra card painting (cel shading, indigo ink, blue-violet rim)
const SHADEC = '#a796d8', RIMC = 'rgba(122,142,255,0.7)', RIMC2 = 'rgba(122,142,255,0.34)';
function cel(g, P, base, ow = 4, dx = 12, dy = 9, rim = 6, shadeCol = SHADEC) {
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (ow) { g.strokeStyle = INK; g.save(); g.translate(ow * 0.42, ow * 0.36); g.lineWidth = ow * 2; g.stroke(P); g.restore(); g.lineWidth = ow * 1.3; g.stroke(P); }
  const paint = (sh, rimA) => { g.fillStyle = base; g.fill(P); if (sh) { g.globalCompositeOperation = 'multiply'; g.fillStyle = shadeCol; g.fill(P); } if (rimA) { g.globalCompositeOperation = 'screen'; g.fillStyle = rimA; g.fill(P); } g.globalCompositeOperation = 'source-over'; };
  const clipAt = (x, y) => { g.translate(x, y); g.clip(P); g.translate(-x, -y); };
  g.save(); g.clip(P);
  if (rim) { paint(true, RIMC); clipAt(-rim * 0.55, -rim * 0.2); paint(true, RIMC2); clipAt(-rim * 0.5, -rim * 0.2); }
  paint(true); clipAt(-dx, -dy); paint(false); g.restore();
}
const E = (x, y, rx, ry, rot = 0) => { const P = new Path2D(); P.ellipse(x, y, rx, ry, rot, 0, TAU); return P; };
function crP(pts) { const P = new Path2D(), n = pts.length; const q = (i) => pts[(i + n) % n];
  P.moveTo(...q(0)); for (let i = 0; i < n; i++) { const p0 = q(i - 1), p1 = q(i), p2 = q(i + 1), p3 = q(i + 2); P.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); } P.closePath(); return P; }
function stroke(g, pts, w, col = INK) { g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
function beanEye(g, x, y, rx, ry, look = 0, big = 0) { const P = E(x + look * 3, y, rx, ry); g.fillStyle = INK; g.fill(P); g.save(); g.clip(P); const lx = x + look * 3;
  g.fillStyle = '#fff'; g.beginPath(); g.arc(lx - rx * 0.3, y - ry * 0.37, rx * (0.34 + big * 0.06), 0, TAU); g.fill(); g.restore();
  g.save(); g.translate(lx - rx * 0.3, y - ry * 0.37); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, rx * 0.7, rx * 0.2, 0, 0, TAU); g.lineWidth = Math.max(1, rx * 0.13); g.strokeStyle = '#fff'; g.stroke(); g.restore();
  g.save(); g.clip(P); g.fillStyle = '#fff'; g.beginPath(); g.arc(lx + rx * 0.35, y + ry * 0.4, rx * 0.15 * (1 + big), 0, TAU); g.fill(); g.fillStyle = 'rgba(120,100,200,0.45)'; g.beginPath(); g.ellipse(lx + rx * 0.1, y + ry * 0.75, rx * 0.8, ry * 0.32, 0, 0, TAU); g.fill(); g.restore(); }
function blush(g, x, y, r, a = 0.5) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(255,120,170,${a})`); gr.addColorStop(1, 'rgba(255,120,170,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r, r * 0.65, 0, 0, TAU); g.fill(); }

// the black bear, sitting, front 3/4 (600 x 700 canvas, sit line y = 680). worry 0..1, look -1..1, blink 0/1
const BEAR_W = 600, BEAR_H = 700, BEAR_TAIL = [478, 462]; // canvas px where the rope tail leaves the card (right side)
function drawBear(g, o = {}) {
  const w = BEAR_W, h = BEAR_H, k = Math.max(0, Math.min(1, o.worry ?? 0.8)), look = o.look ?? 0, fur = '#4a4058', furD = '#3a3248', muz = '#c69c74', cx = 300;
  g.clearRect(0, 0, w, h);
  // shadow pool
  const sg = g.createRadialGradient(cx, 684, 0, cx, 684, 220); sg.addColorStop(0, 'rgba(30,20,50,0.45)'); sg.addColorStop(1, 'rgba(30,20,50,0)'); g.fillStyle = sg; g.beginPath(); g.ellipse(cx, 684, 220, 22, 0, 0, TAU); g.fill();
  // rope tail behind (goes off to the right / back toward the trunk)
  // body (pear)
  const body = crP([[cx, 300], [cx + 120, 340], [cx + 175, 470], [cx + 165, 610], [cx + 90, 668], [cx, 676], [cx - 90, 668], [cx - 165, 610], [cx - 175, 470], [cx - 120, 340]]);
  cel(g, body, fur, 4.5, 16, 12, 9);
  // fur tufts on the body edge
  for (const [x, y, s] of [[cx - 172, 500, -1], [cx - 160, 580, -1], [cx + 172, 520, 1], [cx + 150, 600, 1]]) stroke(g, [[x, y - 14], [x + s * 12, y - 4], [x, y + 6]], 4, INK);
  // hind feet with soles toward us
  for (const s of [-1, 1]) { const fx = cx + s * 105, fy = 648; cel(g, E(fx, fy, 62, 36, s * 0.12), furD, 4, 6, 6, 5); cel(g, E(fx, fy + 4, 40, 22, s * 0.12), '#7a6a6a', 2.5, 4, 3, 0); for (let t = -1; t <= 1; t++) { g.fillStyle = '#5a4a52'; g.beginPath(); g.arc(fx + t * 16, fy - 18 + Math.abs(t) * 4, 7, 0, TAU); g.fill(); } }
  // rope loop round the belly (loose), knot on the right
  const ry = 470; stroke(g, [[cx - 168, ry - 18], [cx - 90, ry + 10], [cx, ry + 18], [cx + 90, ry + 8], [cx + 170, ry - 14]], 15, INK); stroke(g, [[cx - 168, ry - 18], [cx - 90, ry + 10], [cx, ry + 18], [cx + 90, ry + 8], [cx + 170, ry - 14]], 9, '#d0ae74');
  g.strokeStyle = 'rgba(120,80,40,0.7)'; g.lineWidth = 2; for (let x = cx - 160; x < cx + 165; x += 14) { const yy = ry + 18 * Math.cos((x - cx) / 175 * 1.4) - 3; g.beginPath(); g.moveTo(x, yy - 3); g.lineTo(x + 6, yy + 3); g.stroke(); }
  cel(g, E(cx + 170, ry - 10, 18, 14), '#d0ae74', 3, 4, 3, 0); stroke(g, [[cx + 162, ry - 12], [cx + 178, ry - 8]], 2, 'rgba(120,80,40,0.8)');
  // front paws held together at the chest (worried)
  const pk = 18 * k;
  for (const s of [-1, 1]) { const arm = crP([[cx + s * 120, 370], [cx + s * 70, 420 - pk], [cx + s * 26, 448 - pk], [cx + s * 34, 486 - pk], [cx + s * 96, 470], [cx + s * 140, 430]]); cel(g, arm, fur, 4, 8, 7, 6);
    cel(g, E(cx + s * 30, 462 - pk, 34, 28, s * 0.3), furD, 4, 5, 5, 4); for (let t = 0; t < 3; t++) stroke(g, [[cx + s * (12 + t * 12), 484 - pk], [cx + s * (10 + t * 12), 492 - pk]], 3, '#e8dcc8'); }
  // head
  const hy = 205, hx = cx + look * 8;
  const ear = (s) => { const a = (0.35 + 0.9 * k) * s, ex = hx + s * (110 + 22 * k), ey = hy - 92 + 52 * k; g.save(); g.translate(ex, ey); g.rotate(a); cel(g, E(0, 0, 40, 36), fur, 4, 6, 5, 5); cel(g, E(0, 6, 22, 18), '#7a6070', 2.5, 0, 0, 0); g.restore(); };
  ear(-1); ear(1);
  const head = crP([[hx, hy - 118], [hx + 108, hy - 92], [hx + 150, hy - 10], [hx + 132, hy + 80], [hx + 60, hy + 118], [hx, hy + 124], [hx - 60, hy + 118], [hx - 132, hy + 80], [hx - 150, hy - 10], [hx - 108, hy - 92]]);
  cel(g, head, fur, 4.5, 14, 11, 8);
  for (const [x, y, s] of [[hx - 148, hy + 20, -1], [hx - 136, hy + 70, -1], [hx + 148, hy + 20, 1], [hx + 136, hy + 70, 1]]) stroke(g, [[x, y - 12], [x + s * 14, y], [x, y + 8]], 4, INK);
  // tan brow spots (black bears have them): inner ends lift with worry
  for (const s of [-1, 1]) { const bx = hx + s * 52 + look * 4, by = hy - 48; g.save(); g.translate(bx, by); g.rotate(-s * (0.15 + 0.45 * k)); cel(g, E(0, 0, 20, 8), '#a8865e', 2.5, 0, 0, 0); g.restore(); }
  // eyes (bean, ringed-planet shine), soft lighter socket so they read on black fur
  for (const s of [-1, 1]) { const ex = hx + s * 50, ey = hy - 8; g.fillStyle = 'rgba(150,140,190,0.28)'; g.beginPath(); g.ellipse(ex + look * 3, ey + 2, 25, 28, 0, 0, TAU); g.fill();
    if (o.blink) stroke(g, [[ex - 14, ey + 2], [ex, ey + 8], [ex + 14, ey + 2]], 5, INK);
    else { beanEye(g, ex, ey, 14 + 2 * k, 19 + 2 * k, look, k); stroke(g, [[ex - s * 18 + look * 3, ey - 22 - 6 * k], [ex + s * 14 + look * 3, ey - 26 + 6 * k]], 4.5, INK); } }
  // muzzle + nose + small worried mouth
  cel(g, E(hx + look * 6, hy + 52, 66, 50), muz, 4, 8, 7, 4, '#c8a8d8');
  cel(g, E(hx + look * 8, hy + 30, 26, 17), '#241a30', 3, 3, 3, 0); g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.ellipse(hx + look * 8 - 8, hy + 24, 7, 4, -0.3, 0, TAU); g.fill();
  stroke(g, [[hx + look * 8, hy + 46], [hx + look * 8, hy + 58]], 3.5, INK);
  const mw = 22, my = hy + 70; stroke(g, [[hx + look * 8 - mw, my + 4 * k], [hx + look * 8 - mw / 2, my - 4 * k], [hx + look * 8, my + 2 * k], [hx + look * 8 + mw / 2, my - 4 * k], [hx + look * 8 + mw, my + 4 * k]], 3.5, INK);
  blush(g, hx - 92, hy + 40, 30, 0.55); blush(g, hx + 92, hy + 40, 30, 0.55);
  if (k > 0.55) { const a = Math.min(1, (k - 0.55) / 0.3), sx = hx + 142, sy = hy - 64; g.globalAlpha = a; const dp = new Path2D(); dp.moveTo(sx, sy - 22); dp.quadraticCurveTo(sx + 14, sy, sx + 10, sy + 8); dp.arc(sx, sy + 6, 10, 0.2, Math.PI - 0.2); dp.quadraticCurveTo(sx - 12, sy, sx, sy - 22); cel(g, dp, '#9ad8ff', 3, 0, 0, 0); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(sx - 3, sy + 2, 3, 5, 0, 0, TAU); g.fill(); g.globalAlpha = 1; }
}
// coonhound lying down (720 x 360, belly line y = 340), facing left. v: 0 redbone, 1 black-and-tan, 2 bluetick
function drawHound(g, v = 0, sleep = false) {
  const w = 720, h = 360; g.clearRect(0, 0, w, h); const col = ['#b0542c', '#2e2836', '#8a92a6'][v], tan = ['#c8763c', '#b07a44', '#c08a58'][v];
  const sg = g.createRadialGradient(380, 340, 0, 380, 340, 300); sg.addColorStop(0, 'rgba(30,20,50,0.4)'); sg.addColorStop(1, 'rgba(30,20,50,0)'); g.fillStyle = sg; g.beginPath(); g.ellipse(380, 340, 300, 20, 0, 0, TAU); g.fill();
  stroke(g, [[620, 300], [672, 296], [700, 318]], 16, INK); stroke(g, [[620, 300], [672, 296], [700, 318]], 9, col); // tail
  cel(g, crP([[250, 220], [380, 186], [520, 196], [625, 240], [640, 300], [600, 338], [420, 342], [260, 336], [215, 290]]), col, 4, 12, 9, 7); // body
  cel(g, E(560, 318, 70, 26), col, 3.5, 5, 4, 4); // hind leg
  if (v === 2) { g.fillStyle = 'rgba(40,40,60,0.55)'; const R = rng(4); for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse(270 + R() * 340, 210 + R() * 110, 4 + R() * 9, 3 + R() * 6, 0, 0, TAU); g.fill(); } cel(g, E(470, 245, 60, 40), '#2a2836', 0, 0, 0, 0); }
  if (v === 1) cel(g, crP([[220, 300], [300, 330], [420, 342], [260, 338]]), tan, 0, 0, 0, 0);
  for (const dx of [0, 46]) { cel(g, crP([[120 + dx, 318], [250 + dx, 304], [262 + dx, 334], [118 + dx, 340]]), v === 1 ? tan : col, 3.5, 4, 4, 3); cel(g, E(112 + dx, 330, 24, 14), v === 1 ? tan : col, 3, 3, 3, 0); } // front legs + paws
  const hx = 150, hy = 262; // head resting on the paws
  cel(g, crP([[hx - 30, hy - 52], [hx + 50, hy - 62], [hx + 92, hy - 26], [hx + 80, hy + 34], [hx - 10, hy + 46], [hx - 90, hy + 40], [hx - 108, hy + 8], [hx - 80, hy - 24]]), v === 2 ? '#b8bccc' : col, 4, 8, 7, 6);
  if (v === 1) cel(g, E(hx - 70, hy + 22, 40, 22), tan, 0, 0, 0, 0);
  cel(g, E(hx - 104, hy + 4, 15, 12), '#2a1e2a', 2.5, 0, 0, 0);
  cel(g, crP([[hx + 30, hy - 40], [hx + 66, hy - 30], [hx + 70, hy + 40], [hx + 50, hy + 74], [hx + 20, hy + 60], [hx + 18, hy]]), v === 2 ? '#2a2836' : shadeCss(col, 0.72), 3.5, 6, 6, 5); // long ear
  if (sleep) stroke(g, [[hx - 50, hy - 14], [hx - 38, hy - 8], [hx - 26, hy - 14]], 4, INK); else beanEye(g, hx - 40, hy - 14, 8, 11, -0.6);
  blush(g, hx - 50, hy + 16, 18, 0.45); cel(g, crP([[hx + 120, hy - 32], [hx + 160, hy - 40], [hx + 176, hy - 6], [hx + 120, hy - 4]]), '#7a4a2a', 3, 0, 0, 0); // collar
}
// saddled horse, side view facing left (800 x 820, hooves y = 800). v 0 bay, 1 grey
function drawHorse(g, v = 0) {
  const w = 800, h = 820; g.clearRect(0, 0, w, h); const col = ['#8a4a2c', '#a6a2b2'][v], mane = ['#2a1e24', '#d8d4dc'][v], hoof = '#3a2a2a';
  const sg = g.createRadialGradient(420, 800, 0, 420, 800, 330); sg.addColorStop(0, 'rgba(30,20,50,0.4)'); sg.addColorStop(1, 'rgba(30,20,50,0)'); g.fillStyle = sg; g.beginPath(); g.ellipse(420, 800, 330, 22, 0, 0, TAU); g.fill();
  const leg = (x, far) => { const c = far ? shadeCss(col, 0.75) : col; cel(g, crP([[x - 24, 470], [x + 24, 470], [x + 20, 640], [x + 16, 770], [x - 14, 770], [x - 18, 640]]), c, 3.5, 5, 4, 3); cel(g, crP([[x - 20, 768], [x + 20, 768], [x + 24, 798], [x - 24, 798]]), hoof, 3, 0, 0, 0); };
  leg(250, true); leg(560, true);
  stroke(g, [[640, 360], [690, 420], [700, 560]], 30, INK); stroke(g, [[640, 360], [690, 420], [700, 560]], 22, mane); // tail
  cel(g, crP([[200, 340], [400, 310], [620, 330], [670, 420], [620, 520], [400, 540], [220, 520], [170, 430]]), col, 4.5, 14, 11, 8); // barrel
  leg(210, false); leg(600, false);
  cel(g, crP([[170, 430], [150, 300], [120, 200], [160, 170], [230, 260], [280, 380]]), col, 4, 9, 7, 6); // neck
  stroke(g, [[150, 186], [190, 230], [222, 290], [250, 350]], 22, mane);
  cel(g, crP([[110, 160], [160, 150], [180, 200], [120, 330], [70, 350], [44, 320], [60, 270]]), col, 4, 8, 7, 5); // head
  cel(g, E(140, 140, 14, 26, -0.3), col, 3, 0, 0, 0); // ear
  beanEye(g, 128, 210, 9, 12, -0.5); blush(g, 104, 260, 20, 0.4);
  stroke(g, [[52, 300], [90, 230], [150, 180]], 5, '#4a2a1a'); stroke(g, [[70, 330], [130, 310]], 5, '#4a2a1a'); // bridle
  stroke(g, [[62, 334], [70, 420], [60, 520]], 5, '#4a2a1a'); // rein hanging down to the rail
  cel(g, crP([[320, 330], [500, 330], [520, 470], [300, 470]]), '#3a4a6a', 3.5, 6, 5, 4); // saddle blanket
  cel(g, crP([[330, 300], [370, 330], [470, 330], [500, 300], [480, 350], [350, 350]]), '#6a3a1e', 4, 6, 5, 5); // McClellan-style saddle
  stroke(g, [[420, 350], [420, 520]], 6, '#4a2a1a'); cel(g, E(420, 530, 16, 12), '#9a9aa8', 2.5, 0, 0, 0); // stirrup
}

// ---------------------------------------------------------------- the ORIGINAL cartoon (ink line drawing, our own design)
// a man in a slouch hunting hat (glasses, moustache, belted coat, tall boots) holds up an open hand: "no"; a small bear sits by a willow
const CW = 800, CH = 1000;
let STROKES = null;
function cartoonStrokes() {
  if (STROKES) return STROKES; const S = [], R = rng(77), wob = (pts, a = 1.2) => pts.map(([x, y]) => [x + (R() - 0.5) * a, y + (R() - 0.5) * a]);
  const bz = (p0, p1, p2, p3, n = 14) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; });
  const ar = (cx, cy, rx, ry, a0, a1, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const add = (pts, w = 3.2) => S.push({ p: wob(pts), w });
  add([[60, 60], [740, 60], [740, 940], [60, 940], [60, 60]], 2.4); // panel border
  add(bz([70, 808], [250, 798], [520, 815], [730, 800], 24), 3); // ground
  // the man: hat
  add(bz([206, 306], [250, 322], [350, 320], [396, 298]), 3.6); add(bz([206, 306], [252, 292], [350, 290], [396, 298]), 3);
  add(bz([246, 298], [238, 244], [262, 214], [302, 212]), 3.4); add(bz([302, 212], [342, 214], [362, 242], [354, 296]), 3.4); add(bz([268, 228], [290, 244], [312, 244], [334, 228]), 2.4);
  add(bz([248, 284], [280, 292], [322, 292], [354, 283]), 2.6); add(bz([248, 276], [280, 284], [322, 284], [354, 275]), 1.6);
  // face, glasses, moustache, stern mouth
  add(bz([252, 312], [244, 352], [258, 392], [302, 404]), 3); add(bz([302, 404], [344, 394], [358, 352], [350, 312]), 3);
  add(ar(283, 340, 14, 13, 0, TAU), 2.4); add(ar(321, 340, 14, 13, 0, TAU), 2.4); add([[297, 338], [307, 338]], 2); add([[269, 337], [252, 331]], 1.8); add([[335, 337], [350, 331]], 1.8);
  add([[281, 347], [284, 343]], 3.5); add([[319, 347], [322, 343]], 3.5); // eyes behind the lenses
  add(bz([270, 372], [286, 360], [298, 362], [302, 368]), 3.4); add(bz([302, 368], [308, 361], [322, 360], [336, 373]), 3.4); add([[290, 386], [314, 385]], 2.4);
  add(bz([275, 318], [282, 314], [292, 316], [296, 320]), 2.6); add(bz([308, 320], [314, 312], [324, 312], [330, 318]), 2.6); // brows, firm
  // collar, coat, belt with cartridge loops, pockets
  add([[284, 404], [280, 424], [300, 440], [322, 424], [318, 404]], 2.6);
  add(bz([280, 422], [256, 428], [246, 440], [240, 470]), 3.4); add(bz([322, 422], [344, 426], [356, 438], [362, 470]), 3.4);
  add(bz([240, 470], [236, 520], [236, 570], [240, 610]), 3.4); add(bz([362, 470], [364, 520], [364, 570], [360, 610]), 3.4); add([[240, 610], [300, 616], [360, 610]], 3);
  add([[300, 440], [300, 612]], 2); add([[243, 546], [358, 546]], 2.6); add([[243, 562], [358, 562]], 2.6);
  for (let x = 250; x < 356; x += 10) add([[x, 547], [x, 561]], 1.6);
  add([[256, 480], [286, 480], [286, 510], [256, 510]], 1.8); add([[314, 480], [344, 480], [344, 510], [314, 510]], 1.8);
  // left arm, hand on hip
  add(bz([246, 440], [220, 470], [218, 500], [236, 530]), 3.2); add(bz([256, 466], [240, 488], [240, 506], [250, 522]), 2.6); add(ar(244, 534, 12, 10, 0, TAU, 10), 2.6);
  // RIGHT arm raised, open palm out toward the bear: "no"
  add(bz([354, 432], [384, 424], [410, 410], [432, 382]), 3.4); add(bz([360, 464], [392, 452], [424, 432], [452, 394]), 3.4);
  add(bz([426, 384], [424, 372], [426, 364], [430, 360]), 3); add([[430, 362], [427, 328]], 3); add([[440, 358], [440, 318]], 3); add([[450, 358], [453, 321]], 3); add([[459, 364], [465, 334]], 3);
  add(bz([427, 328], [430, 318], [438, 316], [440, 318]), 2.6); add(bz([453, 321], [456, 316], [463, 326], [465, 334]), 2.6); add(bz([459, 366], [462, 380], [456, 392], [452, 394]), 3);
  add(bz([430, 372], [418, 366], [414, 356], [416, 348]), 3); add([[436, 372], [452, 370]], 1.6); // thumb, palm crease
  add(bz([478, 320], [486, 312], [494, 312], [500, 318]), 2.4); add([[482, 350], [508, 348]], 2.4); add(bz([478, 380], [488, 388], [496, 390], [504, 386]), 2.4); // emphasis marks
  // legs: breeches into tall boots
  add(bz([252, 612], [248, 650], [250, 680], [254, 704]), 3.2); add(bz([296, 616], [296, 650], [294, 680], [292, 704]), 3.2);
  add(bz([306, 616], [306, 650], [308, 680], [310, 704]), 3.2); add(bz([350, 612], [354, 650], [354, 680], [352, 704]), 3.2);
  add([[250, 704], [246, 784], [226, 790], [228, 800], [298, 800], [294, 704]], 3.4); add([[310, 704], [312, 800], [376, 800], [376, 790], [356, 784], [352, 704]], 3.4);
  add([[250, 712], [294, 712]], 2); add([[310, 712], [352, 712]], 2);
  // the willow at the right edge, strands, and the small bear tied loosely to it
  add(bz([676, 802], [684, 700], [690, 560], [672, 420]), 3.4); add(bz([716, 800], [712, 700], [716, 560], [706, 420]), 3.4);
  add(bz([672, 420], [640, 380], [600, 360], [560, 360]), 3); add(bz([706, 420], [720, 380], [736, 360], [738, 352]), 3); add(bz([688, 420], [690, 380], [700, 340], [690, 300]), 3);
  for (let i = 0; i < 9; i++) { const x0 = 568 + i * 20, y0 = 362 - Math.max(0, i - 5) * 10; add(bz([x0, y0], [x0 - 6, y0 + 60], [x0 + 4, y0 + 110], [x0 - 2, y0 + 150 + (i % 3) * 22], 8), 1.6); }
  for (let y = 600; y < 790; y += 14) add([[698, y], [708, y + 8]], 1.4); // trunk hatching
  add(bz([590, 800], [566, 790], [560, 730], [585, 698]), 3.2); add(bz([585, 698], [610, 690], [636, 694], [640, 730]), 3.2); add(bz([640, 730], [646, 770], [640, 792], [620, 800]), 3.2); // bear body
  add(ar(604, 662, 36, 33, 0, TAU, 22), 3.2); add(ar(576, 636, 11, 10, Math.PI * 0.6, Math.PI * 2.1), 2.8); add(ar(634, 638, 11, 10, Math.PI * 0.9, Math.PI * 2.4), 2.8); // head + ears (low)
  add(ar(600, 676, 13, 9, 0, TAU, 12), 2.4); add([[598, 670], [604, 670]], 4); // muzzle, nose
  add([[590, 656], [591, 658]], 4.5); add([[614, 656], [615, 658]], 4.5); add([[582, 646], [594, 642]], 2.2); add([[610, 642], [622, 646]], 2.2); // eyes + worried brows
  add(bz([592, 686], [596, 683], [604, 683], [608, 686]), 2); // little mouth
  add(ar(588, 726, 9, 7, 0, TAU, 10), 2.4); add(ar(614, 726, 9, 7, 0, TAU, 10), 2.4); // paws together
  add(ar(582, 798, 14, 7, Math.PI, TAU, 8), 2.6); add(ar(628, 798, 14, 7, Math.PI, TAU, 8), 2.6); // feet
  add(bz([570, 740], [600, 754], [628, 752], [644, 738]), 2.6); add(bz([644, 738], [664, 732], [676, 712], [682, 690]), 2.6); // loose rope to the trunk
  add(ar(696, 688, 22, 6, 0, TAU, 14), 2.4);
  // ground hatching, grass, reeds
  for (let i = 0; i < 12; i++) add([[214 + i * 14, 816], [224 + i * 14, 806]], 1.6);
  for (let i = 0; i < 7; i++) add([[560 + i * 13, 816], [570 + i * 13, 806]], 1.6);
  for (const x of [100, 140, 470, 510, 540]) { add([[x, 806], [x - 8, 780]], 1.8); add([[x + 4, 806], [x + 6, 774]], 1.8); add([[x + 8, 806], [x + 18, 784]], 1.8); }
  for (let i = 0; i < 5; i++) add(bz([90 + i * 12, 806], [88 + i * 12, 740], [96 + i * 12, 700], [92 + i * 12, 660], 8), 1.6);
  add(bz([620, 900], [640, 880], [660, 905], [680, 885], 10), 2); add(bz([680, 885], [690, 878], [700, 900], [712, 890], 6), 2); // signature squiggle (no letters)
  let L = 0; for (const s of S) { s.L0 = L; let l = 0; for (let i = 1; i < s.p.length; i++) l += Math.hypot(s.p[i][0] - s.p[i - 1][0], s.p[i][1] - s.p[i - 1][1]); s.len = l; L += l + 30; }
  STROKES = { S, L }; return STROKES;
}
// draws the cartoon into g at (x, y, w, h), revealed t 0..1 (pencil underdrawing first when pencil). Returns the pen tip [u, v] (0..1)
function drawCartoon(g, x, y, w, h, t, o = {}) {
  const { S, L } = cartoonStrokes(), sx = w / CW, sy = h / CH, P = (p) => [x + p[0] * sx, y + p[1] * sy]; let tip = null; const rev = t * L;
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (o.pencil) { g.strokeStyle = 'rgba(110,110,130,0.28)'; for (const s of S) { g.lineWidth = 1.2 * sx; g.beginPath(); s.p.forEach((p, i) => { const [a, b] = P([p[0] + 3, p[1] - 2]); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.stroke(); } }
  g.strokeStyle = o.ink || '#1c1626';
  for (const s of S) { if (rev <= s.L0) break; let rem = rev - s.L0; g.lineWidth = s.w * sx * (o.wk || 1); g.beginPath(); g.moveTo(...P(s.p[0])); tip = s.p[0];
    for (let i = 1; i < s.p.length; i++) { const seg = Math.hypot(s.p[i][0] - s.p[i - 1][0], s.p[i][1] - s.p[i - 1][1]); if (rem >= seg) { g.lineTo(...P(s.p[i])); rem -= seg; tip = s.p[i]; } else { const f = rem / seg, q = [s.p[i - 1][0] + (s.p[i][0] - s.p[i - 1][0]) * f, s.p[i - 1][1] + (s.p[i][1] - s.p[i - 1][1]) * f]; g.lineTo(...P(q)); tip = q; rem = -1; break; } }
    g.stroke(); if (rem < 0) break; }
  return tip ? [tip[0] / CW, tip[1] / CH] : null;
}
function draftPaperTex(g, w, h, t) { g.fillStyle = '#f2ead6'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.94 + 0.08 * fbm(u, v, 3, 3, 3, 15)); return drawCartoon(g, 0, 0, w, h, t, { pencil: true }); }
function frontPageTex(g, w, h) {
  g.fillStyle = '#e8dfc6'; g.fillRect(0, 0, w, h); modulate(g, w, h, (u, v) => 0.9 + 0.12 * fbm(u, v, 3, 4, 4, 27)); const R = rng(11);
  txt(g, 'THE WASHINGTON POST', w / 2, h * 0.065, w * 0.92, h * 0.07, { col: '#1a1620' });
  g.fillStyle = '#1a1620'; g.fillRect(w * 0.04, h * 0.105, w * 0.92, 4); g.fillRect(w * 0.04, h * 0.125, w * 0.92, 2); scribbleLines(g, w * 0.06, h * 0.112, w * 0.88, h * 0.01, h * 0.009, 0.5, R);
  const cols = 6, cw = w * 0.92 / cols, x0 = w * 0.04, y0 = h * 0.14;
  for (let c = 0; c < cols; c++) { const cx = x0 + c * cw; if (c) { g.fillStyle = 'rgba(30,26,32,0.5)'; g.fillRect(cx - 1, y0, 2, h * 0.82); }
    if (c >= 1 && c <= 4) { scribbleLines(g, cx + 8, h * 0.66, cw - 16, h * 0.3, h * 0.0105, 0.45, R); continue; }
    scribbleLines(g, cx + 8, y0 + 8, cw - 16, h * 0.035, h * 0.016, 0.85, R); scribbleLines(g, cx + 8, y0 + h * 0.06, cw - 16, h * 0.76, h * 0.0105, 0.45, R); }
  // the cartoon block (our own drawing) across the four middle columns
  const bx = x0 + cw + 10, by = y0 + 10, bw = cw * 4 - 20, bh = h * 0.5; g.fillStyle = '#efe7d0'; g.fillRect(bx, by, bw, bh);
  const dw = Math.min(bw, bh * 0.8), dx = bx + (bw - dw) / 2; drawCartoon(g, dx, by, dw, dw * 1.25 > bh ? bh : dw * 1.25, 1, { wk: 1.2 });
  scribbleLines(g, bx + bw * 0.2, by + bh + 8, bw * 0.6, h * 0.012, h * 0.011, 0.6, R);
  g.strokeStyle = 'rgba(80,60,40,0.18)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w * 0.5, 0); g.lineTo(w * 0.5, h); g.stroke(); // fold
}

// ---------------------------------------------------------------- materials
let M;
function materials() {
  const vc = (o = {}) => toon({ vertexColors: true, ...o }), T = (w, h, fn, rep) => mkTex(w, h, fn, rep), m = {};
  m.paint = vc(); m.metal = vc({ emissive: 0x0c0c12 });
  m.ground = toon({ vertexColors: true, map: T(512, 512, (g, w, h) => litterTex(g, w, h, { moss: true }), [36, 36]) }); if (MACRO) MACRO(m.ground, 0.2, 0.06);
  m.litter = vc({ map: T(512, 512, (g, w, h) => litterTex(g, w, h, { base: '#6e5236', seed: 7, n: 900 }), [10, 10]) });
  m.dirt = toon({ map: T(512, 512, (g, w, h) => litterTex(g, w, h, { base: '#7a5a3e', seed: 9, n: 220 }), [6, 6]), transparent: false });
  m.trail = toon({ map: T(128, 512, trailTex, [1, 1]), alphaTest: 0.45 });
  m.water = toon({ map: T(512, 512, waterTex, [12, 12]), emissive: 0x141c12 }); if (MACRO) MACRO(m.water, 0.25, 0.08);
  m.bark = vc({ map: T(256, 256, (g, w, h) => PT.bark(g, w, h, { base: '#a89484' }), [3, 4]) });
  m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#a07a52', n: 5, seed: 31 })) });
  m.foliage = vc({ map: T(256, 256, foliageTex, [2, 2]) });
  m.moss = toon({ map: T(256, 512, mossTex), alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true });
  m.blade = toon({ map: T(64, 256, (g, w, h) => bladeTex(g, w, h)), alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true });
  m.palm = toon({ map: T(512, 256, palmTex), alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true });
  m.willow = toon({ map: T(256, 512, willowTex), alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true });
  m.reed = toon({ map: T(256, 256, reedTex), alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true });
  m.ray = new THREE.MeshBasicMaterial({ map: T(64, 256, rayTex), color: 0xffe6a8, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  m.mist = new THREE.MeshBasicMaterial({ map: T(256, 128, mistTex), color: 0xdcdcc0, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide, fog: true });
  m.smoke = new THREE.MeshBasicMaterial({ map: T(128, 128, glowTex), color: 0xa8a8b8, transparent: true, opacity: 0.3, depthWrite: false, fog: true });
  m.glowWarm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc070).multiplyScalar(2.6), fog: false });
  m.flame = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff8a2a).multiplyScalar(2.4), fog: false }); m.flameCore = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe080).multiplyScalar(2.6), fog: false });
  m.halo = new THREE.MeshBasicMaterial({ map: T(128, 128, glowTex), color: 0xff9a40, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  m.canvas = vc({ map: T(512, 512, canvasClothTex) }); m.flag = toon({ map: T(570, 300, flag45Tex), side: THREE.DoubleSide });
  m.map = toon({ map: T(512, 384, huntMapTex), emissive: 0x1a120a }); m.paper = vc({ map: T(256, 256, (g, w, h) => PT.paper(g, w, h, {})) });
  m.dark = new THREE.MeshBasicMaterial({ color: 0x1a1218 });
  m.plaster = vc({ map: T(512, 512, plasterTex, [3, 2]) }); m.wallpaper = vc({ map: T(512, 512, wallpaperTex, [6, 2]) }); m.floor = vc({ map: T(512, 512, floorTex, [4, 4]) });
  m.panel = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#5a3a24', n: 6, seed: 51, joints: 0 })) });
  m.glass = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0d0).multiplyScalar(1.9), fog: false }); m.glassCool = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xe8f0ff).multiplyScalar(1.8), fog: false });
  m.shaft = new THREE.MeshBasicMaterial({ color: 0xfff0c8, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  m.winView = new THREE.MeshBasicMaterial({ map: T(512, 384, winViewTex), fog: false }); m.winView.color.setScalar(1.35);
  m.lampShade = toon({ color: 0x2a7a4a, emissive: 0x0a3a20, side: THREE.DoubleSide });
  const dpc = document.createElement('canvas'); dpc.width = 800; dpc.height = 1000; const dpt = new THREE.CanvasTexture(dpc); dpt.colorSpace = THREE.SRGBColorSpace; dpt.anisotropy = 8;
  m.draft = toon({ map: dpt, emissive: 0x141008 }); m.draft.emissiveMap = dpt;
  m.front = toon({ map: T(1024, 1400, frontPageTex), emissive: 0x241e14, side: THREE.DoubleSide }); m.front.emissiveMap = m.front.map;
  return m;
}
// a card (2D Oddverra-style animal) as a billboard (yaw toward the camera in placeLights)
function cardMat(tex) { const m = new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, emissive: 0xffffff, emissiveIntensity: 0.86, emissiveMap: tex }); m.color.setScalar(0.3); return m; }
function mkCard(parent, w, h, draw, cw, ch, x, y, z, cards) { const c = document.createElement('canvas'); c.width = cw; c.height = ch; draw(c.getContext('2d')); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const m = new THREE.Mesh(stand(w, h), cardMat(tex)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; m.renderOrder = 1; m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaTest: 0.5, map: tex, side: THREE.DoubleSide }); parent.add(m); cards.push(m); m.userData.canvas = c; m.userData.tex = tex; return m; }

// ================================================================= shared nature kit
const CRUST = [0xa8582c, 0x9a4a26, 0xb86a34, 0x8a5a2a, 0x7a6a34, 0xc07a3a], CGREEN = [0x6a7a3a, 0x5a6a34, 0x7a8040, 0x8a7a3a];
function cypress(K, x, z, h, r, seed, o = {}) {
  const R = rng(seed), y0 = o.y0 ?? -0.5, ry = R() * 6;
  K.put(M.bark, trunkGeo(seed % 4, o.flare ?? 2.4), x, y0, z, 0, ry, 0, r, h, r, o.bc ?? 0xb0a090);
  const nb = 4 + ((R() * 3) | 0), crown = [];
  for (let i = 0; i < nb; i++) { const a = R() * TAU, yb = y0 + h * (0.58 + 0.36 * i / nb), L = (1.6 + R() * 2.2) * (h / 18), ex = x + Math.cos(a) * L, ez = z + Math.sin(a) * L, ey = yb + L * (0.2 + R() * 0.35);
    K.beam(M.bark, [x, yb, z], [ex, ey, ez], Math.max(0.05, r * 0.12), 0x9a8a7a, true, 6); crown.push([ex, ey, ez]); }
  crown.push([x, y0 + h, z]);
  for (const [cx, cy, cz] of crown) { const s = (1.1 + R() * 1.2) * (h / 18), c = R() < (o.green ?? 0.25) ? CGREEN[(R() * 4) | 0] : CRUST[(R() * 6) | 0];
    K.put(M.foliage, rockGeo((seed + 3) % 7), cx, cy + 0.2, cz, 0, R() * 6, 0, s * 1.4, s * 0.72, s * 1.3, c);
    K.put(M.foliage, rockGeo((seed + 5) % 7), cx + (R() - 0.5) * s, cy + 0.6 * s, cz + (R() - 0.5) * s, 0, R() * 6, 0, s, s * 0.7, s * 0.9, tint(hex(c), 1.12));
    K.put(M.foliage, rockGeo((seed + 6) % 7), cx + (R() - 0.5) * s * 1.4, cy - 0.3 * s, cz + (R() - 0.5) * s * 1.4, 0, R() * 6, 0, s * 0.8, s * 0.6, s * 0.8, shade(hex(c), 0.85));
    if (!o.noMoss) for (let k = 0; k < (o.moss ?? 3); k++) { const t = 0.3 + R() * 0.6, mx = x + (cx - x) * t, mz = z + (cz - z) * t, my = cy - (cy - (y0 + h * 0.6)) * (1 - t) - 0.2, ms = 0.7 + R() * 0.9;
      K.put(M.moss, hang(0.9, 2.2), mx, my, mz, 0, R() * 6, 0, ms, ms * (0.8 + R() * 0.6), ms, [0xc8ccb4, 0xb4bca0, 0xd4d4c0][k % 3]); } }
  for (let k = 0; k < (o.knees ?? 5); k++) { const a = R() * TAU, d = r * (2.0 + R() * 2.6), kh = 0.25 + R() * 0.45, kr = 0.12 + R() * 0.08; K.put(M.bark, kneeGeo(), x + Math.cos(a) * d, (o.kneeY ?? y0) - 0.05, z + Math.sin(a) * d, (R() - 0.5) * 0.3, 0, (R() - 0.5) * 0.3, kr, kh + 0.25, kr * 1.1, 0x9a8676); }
}
function hardwood(K, x, z, h, r, seed, o = {}) { // sweetgum / oak: straight trunk, round autumn crown
  const R = rng(seed); K.put(M.bark, cyl(r * 0.7, r, h * 0.7, 10), x, h * 0.35 - 0.1, z, (R() - 0.5) * 0.06, 0, (R() - 0.5) * 0.06, 1, 1, 1, o.bc ?? 0x8a7a72);
  for (let i = 0; i < 5; i++) { const a = R() * TAU, d = R() * h * 0.18, s = h * (0.16 + R() * 0.1), c = [0xc8682a, 0xd8963a, 0xa8402a, 0x8a6a2a, 0xb8782e, 0x7a7030][(R() * 6) | 0]; K.put(M.foliage, rockGeo((seed + i) % 7), x + Math.cos(a) * d, h * (0.72 + R() * 0.2), z + Math.sin(a) * d, 0, R() * 6, 0, s, s * 0.8, s, c); }
  if (o.moss) for (let k = 0; k < 3; k++) K.put(M.moss, hang(0.9, 2.2), x + (R() - 0.5) * h * 0.3, h * 0.62, z + (R() - 0.5) * h * 0.3, 0, R() * 6, 0, 1, 1, 1, 0xc0c4ac);
}
function caneClump(K, x, z, n, rad, seed, hmax = 3.4) { const R = rng(seed);
  for (let i = 0; i < n; i++) { const a = R() * TAU, d = Math.sqrt(R()) * rad, bx = x + Math.cos(a) * d, bz = z + Math.sin(a) * d, H = hmax * (0.55 + R() * 0.45), lx = (R() - 0.5) * 0.5, lz = (R() - 0.5) * 0.5, c = [0x8a9a48, 0xa0a050, 0x7a8a3e, 0xb0a058][i % 4];
    K.beam(M.paint, [bx, -0.1, bz], [bx + lx, H, bz + lz], 0.022, c, true, 5);
    for (let k = 0; k < 6; k++) { const t = 0.4 + 0.6 * k / 6, py = H * t, px = bx + lx * t, pz = bz + lz * t, ry = R() * 6, ln = 0.5 + R() * 0.3; K.put(M.blade, stand(0.24, ln * 1.6), px, py, pz, 1.1 + R() * 0.5, ry, 0, 1, 1, 1, [0x9aa850, 0xb8b060, 0x8a9a44, 0xc8a85a][(k + i) % 4]); } } }
function palmetto(K, x, y, z, s, seed) { const R = rng(seed); for (let i = 0; i < 6; i++) { const ry = R() * 6, tilt = 0.35 + R() * 0.5; K.put(M.palm, stand(1.1 * s, 0.55 * s), x + Math.sin(ry) * 0.12 * s, y, z + Math.cos(ry) * 0.12 * s, -tilt, ry, 0, 1, 1, 1, [0xd0d8b0, 0xe8e0b0, 0xc0c8a8][i % 3]); } }
function log(K, x, y, z, L, r, ry, seed, o = {}) { const R = rng(seed);
  K.put(M.bark, cyl(r * 0.92, r, L, 12), x, y + r * 0.8, z, 0, ry, Math.PI / 2 + (o.tilt || 0), 1, 1, 1, o.c ?? 0x8a7666);
  const ex = Math.cos(ry) * L / 2, ez = -Math.sin(ry) * L / 2;
  for (const s of [-1, 1]) K.put(M.paint, cyl(r * 0.84, r * 0.84, 0.02, 12), x + s * ex * 1.0, y + r * 0.8, z + s * ez * 1.0, 0, ry, Math.PI / 2, 1, 1, 1, 0xc8a070);
  for (let i = 0; i < 4; i++) { const t = (R() - 0.5) * 0.8; K.put(M.foliage, rockGeo(i % 7), x + ex * t * 2, y + r * 1.62, z + ez * t * 2, 0, R() * 6, 0, r * 1.1, r * 0.25, r * 0.8, [0x5a7a34, 0x6a8a3a, 0x4a6a30][i % 3]); }
  for (let i = 0; i < 3; i++) { const t = (R() - 0.5) * 0.8; K.put(M.paint, cyl(0.12, 0.12, 0.03, 10, false), x + ex * t * 2, y + r * 1.0, z + ez * t * 2 + r * 0.9, 0.2, 0, 0, 1, 1, 0.6, 0xd8b878); } // shelf fungus
}
function rock(K, x, y, z, s, seed, c = 0x7a7480) { K.put(M.paint, rockGeo(seed % 7), x, y, z, 0, seed, 0, s, s * 0.7, s * 1.1, c); }

// god-ray: crossed additive planes along the sun direction, from p (top) downward
function rayAt(root, p, len, wdt, dir, list) { const g = new THREE.Group(); g.position.set(p[0] - dir.x * len / 2, p[1] - dir.y * len / 2, p[2] - dir.z * len / 2); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  for (const a of [0, Math.PI / 2, Math.PI / 4]) { const m = nond(mesh(g, plane(wdt, len), M.ray.clone(), 0, 0, 0, 0, a, 0, false)); m.renderOrder = 3; m.userData.ph = list.length * 1.7 + a; list.push(m); } root.add(g); }
function mistSheet(root, x, y, z, w, d, op, list) { const m = nond(mesh(root, plane(w, d), M.mist.clone(), x, y, z, -Math.PI / 2, 0, 0, false)); m.material.opacity = op; m.renderOrder = 4; m.userData.base = op; m.userData.ph = list.length; list.push(m); return m; }
function mistWall(root, x, y, z, w, h, op, list) { const m = nond(mesh(root, plane(w, h), M.mist.clone(), x, y, z, 0, 0, 0, false)); m.material.opacity = op; m.renderOrder = 4; m.userData.base = op; m.userData.ph = list.length; list.push(m); return m; }

// ================================================================= SWAMP
const cA = (z) => -1.6 + 1.4 * Math.sin(z * 0.1 + 0.5), tC = (z) => cA(z) + 3.1 + 0.4 * Math.sin(z * 0.23), cB = (z) => 6.5 + 2 * Math.sin(z * 0.08 + 1.3);
function swampY(x, z) { const n = Math.sin(x * 0.7 + z * 0.3) * 0.05 + Math.sin(x * 1.9 - z * 1.3) * 0.03 + Math.sin(x * 0.21 + z * 0.17) * 0.1;
  const dA = Math.abs(x - cA(z)), dB = Math.abs(x - cB(z)), dP = Math.hypot((x - 1.5) / 7, (z + 26) / 4), dT = Math.abs(x - tC(z));
  let y = 0.04 + n - 0.85 * Math.exp(-((dA / 2.1) ** 2)) - 0.8 * Math.exp(-((dB / 2.4) ** 2)) - 0.9 * Math.exp(-(dP ** 4));
  if (z < -34) y -= 0.5; // open flooded slough far back
  if (dT < 1.8) y = y * 0.3 + 0.06 * (1 - dT / 1.8) + 0.02; // trail on a low ridge
  return y; }
const SWATER = -0.22;
function buildSwampSet(root, rays, mist) {
  const R = rng(101), K = new Kit();
  // ground (vertex coloured: dark wet mud near the water)
  const gg = new THREE.PlaneGeometry(150, 150, 150, 150); gg.rotateX(-Math.PI / 2); const p = gg.attributes.position, cols = [];
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) - 20, y = swampY(x, z); p.setY(i, y); p.setZ(i, z); const wet = Math.max(0, Math.min(1, 1 - (y - SWATER) / 0.25)); cols.push(1 - wet * 0.45, 1 - wet * 0.48, 1 - wet * 0.42); }
  gg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); gg.computeVertexNormals(); mesh(root, gg, M.ground, 0, 0, 0, 0, 0, 0, false);
  const water = mesh(root, plane(150, 150), M.water, 0, SWATER, -20, -Math.PI / 2, 0, 0, false);
  // the muddy trail
  const tp = []; for (let z = 12; z > -40; z -= 0.5) tp.push([tC(z), z]);
  mesh(root, ribbonGeo(tp, 1.5, (x, z) => swampY(x, z) + 0.06), M.trail, 0, 0, 0, 0, 0, 0, false);
  const clearOf = (x, z, r = 1.6) => Math.abs(x - tC(z)) > r && !(z > 6 && Math.abs(x - 1.5) < 4);
  // hero cypresses (framing + mid)
  cypress(K, -3.0, 6.5, 22, 1.0, 11, { knees: 7, moss: 4 }); cypress(K, 4.6, 2.5, 20, 0.85, 12, { knees: 6, moss: 4, y0: -0.3 });
  cypress(K, -1.4, -6, 21, 0.9, 13, { knees: 8 }); cypress(K, 5.4, -9, 23, 1.0, 14); cypress(K, -4.4, -14, 22, 0.9, 15); cypress(K, 0.6, -19, 20, 0.8, 16, { y0: -0.6 });
  // forest fill
  let n = 0; for (let i = 0; i < 400 && n < 70; i++) { const x = (R() - 0.5) * 60, z = 8 - R() * 75; if (!clearOf(x, z, 2.2) || Math.abs(x) + Math.max(0, z) < 3) continue; if (z > 0 && Math.abs(x) < 7) continue; n++;
    if (R() < 0.75) cypress(K, x, z, 17 + R() * 9, 0.6 + R() * 0.5, 200 + i, { knees: (R() * 6) | 0, moss: 2 + ((R() * 3) | 0), y0: swampY(x, z) - 0.4 }); else hardwood(K, x, z, 14 + R() * 8, 0.35 + R() * 0.2, 300 + i, { moss: R() < 0.5 }); }
  // canebrake + palmettos along the dry ridges
  caneClump(K, 7.5, 6.0, 26, 1.6, 401); caneClump(K, 3.2, -3.5, 16, 1.0, 402, 3.0); caneClump(K, -6.8, 2.0, 22, 1.6, 403); caneClump(K, 9.0, -15, 30, 2.2, 404); caneClump(K, -9, -9, 26, 2, 405); caneClump(K, 3.6, -24, 18, 1.5, 406);
  for (let i = 0; i < 26; i++) { const x = (R() - 0.5) * 22, z = 10 - R() * 38; if (!clearOf(x, z, 1.1) || swampY(x, z) < SWATER + 0.05) continue; palmetto(K, x, swampY(x, z), z, 0.9 + R() * 0.7, 500 + i); }
  palmetto(K, 2.6, swampY(2.6, 9), 9, 1.4, 590); palmetto(K, -0.8, swampY(-0.8, 10.5), 10.5, 1.6, 591);
  // fallen logs (one across the channel), stumps
  log(K, cA(-2) - 0.2, -0.32, -2, 5.5, 0.32, 0.25, 601); log(K, tC(-12) + 1.6, 0, -12, 4.2, 0.26, 1.2, 602); log(K, 3.0, 0, 4.6, 3.0, 0.22, -0.4, 603); log(K, cB(-6), -0.3, -6, 6, 0.36, 0.1, 604);
  for (const [x, z] of [[-0.5, 1], [2.0, -8], [6.2, -2]]) { K.put(M.bark, cyl(0.28, 0.36, 0.5, 10), x, swampY(x, z) + 0.2, z, 0, 0, 0, 1, 1, 1, 0x8a7666); K.put(M.paint, cyl(0.27, 0.27, 0.02, 10), x, swampY(x, z) + 0.46, z, 0, 0, 0, 1, 1, 1, 0xc8a070); }
  for (let i = 0; i < 18; i++) { const x = (R() - 0.5) * 16, z = 6 - R() * 30; if (Math.abs(x - tC(z)) < 0.9) continue; rock(K, x, swampY(x, z) + 0.02, z, 0.1 + R() * 0.2, i, 0x7a6e70); }
  { const RK = rng(77); for (let i = 0; i < 11; i++) { const a = RK() * TAU, d = 0.3 + RK() * 1.3, kh = 0.25 + RK() * 0.45, kr = 0.13 + RK() * 0.08; K.put(M.bark, kneeGeo(), -0.5 + Math.cos(a) * d, SWATER - 0.35, 4.0 + Math.sin(a) * d * 0.8, (RK() - 0.5) * 0.4, 0, (RK() - 0.5) * 0.4, kr, kh + 0.35, kr * (0.8 + RK() * 0.5), 0x8e7c74); }
    K.put(M.moss, hang(0.9, 2.2), 0.1, 2.6, 3.3, 0, 0.4, 0, 0.9, 0.9, 0.9, 0xc8ccb4); K.put(M.moss, hang(0.9, 2.2), -1.3, 3.0, 2.8, 0, 1.4, 0, 1.0, 1.1, 1.0, 0xb4bca0); }
  K.build(root, 12);
  // falling leaves
  const NL = 90, leaves = nond(new THREE.InstancedMesh(plane(0.06, 0.035), new THREE.MeshLambertMaterial({ color: 0xc87a3a, side: THREE.DoubleSide, emissive: 0x3a1a08 }), NL)); leaves.frustumCulled = false; root.add(leaves);
  const lsrc = Array.from({ length: NL }, (_, i) => [(R() - 0.5) * 12, R() * 10, 8 - R() * 22, R(), R() * 6]);
  // god-rays from the gap over the trail; mist on the water + layers in depth
  const sd = sunDir(SET_LIGHT.swamp);
  for (const [x, z, w] of [[0.8, -8, 1.6], [2.6, -12, 2.4], [-1.4, -15, 1.4], [3.4, -4, 1.0], [-3, -22, 3], [1.4, -28, 2.6], [5, -18, 1.8]]) rayAt(root, [x + sd.x * 16, 16, z + sd.z * 16], 26, w, sd, rays);
  for (const [x, z, w, d, op] of [[-1.5, -2, 10, 8, 0.35], [6, -8, 12, 10, 0.3], [0, -16, 22, 10, 0.4], [2, -28, 30, 12, 0.5], [-2, 4, 6, 4, 0.25]]) mistSheet(root, x, SWATER + 0.25, z, w, d, op, mist);
  for (const [z, y, op] of [[-20, 2.5, 0.28], [-32, 3, 0.42], [-46, 4, 0.55]]) mistWall(root, 1, y, z, 60, 7, op, mist);
  return { water, leaves, lsrc };
}

// ================================================================= CAMP
function wallTent(K, x, z, ry, o = {}) { K.at(x, 0, z, ry, () => {
  const W = 2.8, D = 3.6, WH = 1.15, RH = 0.95;
  K.box(M.canvas, -W / 2, W / 2, 0, WH, -D / 2, D / 2, 0xffffff, 0.04); // walls
  const sl = Math.hypot(W / 2, RH), ang = Math.atan2(RH, W / 2);
  for (const s of [-1, 1]) K.cb(M.canvas, sl + 0.25, 0.04, D + 0.5, s * W / 4, WH + RH / 2, 0.1, 0xf4ecda, 0, 0, -s * ang, 0.01); // roof (fly runs out front)
  for (const zz of [-D / 2, D / 2]) K.put(M.canvas, prismGeo(W, RH, 0.04), 0, WH, zz, 0, 0, 0, 1, 1, 1, 0xffffff); // gables
  K.box(M.paint, -0.5, 0.5, 0.02, 1.7, D / 2 - 0.01, D / 2 + 0.02, 0x3a2418, 0.01); // dark doorway
  for (const s of [-1, 1]) K.put(M.canvas, prismGeo(0.5, 1.6, 0.03), s * 0.72, 0.05, D / 2 + 0.06, 0, 0, s * 0.12, 1, 1, 1, 0xe8dcc4); // tied-back flaps
  K.beam(M.wood, [0, 0, D / 2 + 0.35], [0, WH + RH + 0.2, D / 2 + 0.35], 0.045, 0x7a5a3a, true); K.beam(M.wood, [0, WH + RH + 0.05, -D / 2], [0, WH + RH + 0.05, D / 2 + 0.4], 0.04, 0x7a5a3a, true);
  for (const s of [-1, 1]) for (const zz of [-1.4, 0, 1.4]) { K.beam(M.paint, [s * (W / 2 + 0.05), WH, zz], [s * (W / 2 + 1.0), 0.05, zz], 0.012, 0xd8c8a0, true, 4); K.beam(M.wood, [s * (W / 2 + 1.0), -0.05, zz], [s * (W / 2 + 1.05), 0.3, zz], 0.025, 0x6a4a30); }
  K.box(M.wood, -1.1, -0.5, 0, 0.28, 0.9, 1.5, 0x8a6a42, 0.02); // cot edge visible
  if (o.bed) { K.put(M.canvas, cyl(0.16, 0.16, 0.9, 10), 0.9, 0.16, D / 2 + 0.55, 0, 0.3, Math.PI / 2, 1, 1, 1, 0x8a3a3a); for (const t of [-0.25, 0.25]) K.put(M.paint, tor(0.165, 0.015, 4, 12), 0.9 + t * Math.cos(0.3), 0.16, D / 2 + 0.55 - t * Math.sin(0.3), 0, 0.3 + Math.PI / 2, 0, 1, 1, 1, 0x3a2418); }
}); }
function lantern(K, x, y, z, s = 1) { K.put(M.metal, cyl(0.07 * s, 0.08 * s, 0.06 * s, 12), x, y + 0.03 * s, z, 0, 0, 0, 1, 1, 1, 0x8a2a24); K.put(M.glass, sph(0.065 * s, 12, 8), x, y + 0.13 * s, z, 0, 0, 0, 1, 1.3, 1);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; K.beam(M.metal, [x + Math.cos(a) * 0.07 * s, y + 0.06 * s, z + Math.sin(a) * 0.07 * s], [x + Math.cos(a) * 0.05 * s, y + 0.23 * s, z + Math.sin(a) * 0.05 * s], 0.006 * s, 0x2a2a30, true, 4); }
  K.put(M.metal, cyl(0.03 * s, 0.07 * s, 0.05 * s, 12), x, y + 0.25 * s, z, 0, 0, 0, 1, 1, 1, 0x8a2a24); K.put(M.metal, tor(0.08 * s, 0.006 * s, 4, 16, Math.PI), x, y + 0.28 * s, z, 0, 0, 0, 1, 1, 1, 0x2a2a30); }
function rifle(K, x, z, lean, ry) { K.at(x, 0, z, ry, () => { // standing upright, butt on the ground, muzzle up against the rack
  const up = (t) => [Math.sin(lean) * t, Math.cos(lean) * t];
  const P = (t, dx = 0) => { const [a, b] = up(t); return [a + dx, b, 0]; };
  K.cb(M.wood, 0.13, 0.36, 0.045, ...P(0.18, 0.02), 0xa0602e, 0, 0, -lean, 0.02); K.cb(M.wood, 0.06, 0.16, 0.04, ...P(0.38, -0.01), 0xa0602e, 0, 0, -lean, 0.015); // butt stock + wrist
  K.cb(M.metal, 0.07, 0.2, 0.05, ...P(0.54), 0x3a3a44, 0, 0, -lean, 0.01); K.put(M.metal, tor(0.035, 0.007, 4, 10), ...P(0.5, 0.05), 0, 0, Math.PI / 2, 1, 1, 1, 0x3a3a44); // receiver + lever loop
  K.cb(M.wood, 0.05, 0.36, 0.045, ...P(0.82), 0xa0602e, 0, 0, -lean, 0.012); // fore-end
  K.beam(M.metal, P(0.6, -0.012), P(1.25, -0.012), 0.014, 0x2a2a34, true, 6); }); }
function buildCamp(root, fx) {
  const R = rng(202), K = new Kit();
  mesh(root, plane(90, 90), M.litter, 0, 0, -10, -Math.PI / 2, 0, 0, false);
  const dirt = mesh(root, new THREE.CircleGeometry(6.5, 40), M.dirt, 0, 0.01, -1.5, -Math.PI / 2, 0, 0, false);
  // tents, flag
  wallTent(K, -3.2, -6.0, 0.12, { bed: true }); wallTent(K, 1.5, -6.6, -0.08); wallTent(K, -8.5, -3.5, 0.6);
  K.beam(M.wood, [0, 0, -8.6], [0, 6.2, -8.6], 0.05, 0xd8cfc0, true, 8); K.put(M.metal, sph(0.07), 0, 6.25, -8.6, 0, 0, 0, 1, 1, 1, 0xd8b050);
  // trees ringing the clearing (cypress + oaks), cane walls, palmettos
  const ring = [[-6, -10, 1], [6.5, -11, 1], [-11, -2, 1], [10.5, -3, 0], [-9, 5, 0], [12, 4, 1], [-2, -14, 1], [4, -16, 0], [-14, -12, 1], [15, -12, 1], [0, -22, 1], [-8, -20, 1], [9, -22, 0]];
  ring.forEach(([x, z, cy], i) => cy ? cypress(K, x, z, 18 + R() * 6, 0.7 + R() * 0.3, 700 + i, { y0: -0.1, kneeY: -0.1, knees: 3, flare: 1.6, green: 0.35 }) : hardwood(K, x, z, 16 + R() * 6, 0.45, 750 + i, { moss: true }));
  hardwood(K, -3.5, -3.2, 17, 0.5, 790, { moss: true }); // the rifle-rack tree
  caneClump(K, -10, -8, 30, 2.4, 801); caneClump(K, 9, -8, 30, 2.4, 802); caneClump(K, 12, 1, 20, 2, 803); caneClump(K, -12, 3, 20, 2, 804); caneClump(K, 3, -13, 26, 3, 805);
  for (let i = 0; i < 12; i++) { const a = R() * TAU, d = 7 + R() * 5; palmetto(K, Math.cos(a) * d, 0, -1.5 + Math.sin(a) * d * 0.8, 1 + R() * 0.6, 820 + i); }
  // campfire: stone ring, logs, tripod + pot, coffee pot on a stone, tin cups, log seats
  for (let i = 0; i < 11; i++) { const a = i / 11 * TAU; rock(K, Math.cos(a) * 0.62, 0.08, 0.5 + Math.sin(a) * 0.62, 0.15 + R() * 0.05, i + 3, 0x6a6470); }
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI + 0.3; K.put(M.bark, cyl(0.06, 0.07, 0.8, 8), Math.cos(a) * 0.12, 0.12, 0.5 + Math.sin(a) * 0.12, 0.6, a, Math.PI / 2 - 0.35, 1, 1, 1, 0x3a2a26); }
  K.put(M.paint, cyl(0.42, 0.45, 0.04, 16), 0, 0.02, 0.5, 0, 0, 0, 1, 1, 1, 0x2a2024);
  for (let k = 0; k < 3; k++) { const a = k / 3 * TAU + 0.4; K.beam(M.wood, [Math.cos(a) * 0.85, 0, 0.5 + Math.sin(a) * 0.85], [0, 1.45, 0.5], 0.03, 0x5a4030, true); }
  K.beam(M.metal, [0, 1.45, 0.5], [0, 0.82, 0.5], 0.008, 0x2a2a30, true, 4);
  K.put(M.metal, lathe('pot', [[0, 0], [0.16, 0.02], [0.2, 0.12], [0.19, 0.24], [0.17, 0.26]], 18), 0, 0.5, 0.5, 0, 0, 0, 1, 1, 1, 0x26222a); K.put(M.metal, tor(0.19, 0.008, 4, 18, Math.PI), 0, 0.76, 0.5, 0, 0, 0, 1, 1.6, 1, 0x2a2a30);
  rock(K, 0.78, 0.07, 0.95, 0.2, 9, 0x6a6470);
  K.at(0.78, 0.16, 0.95, -0.6, () => { K.put(M.metal, lathe('cof', [[0, 0], [0.1, 0], [0.105, 0.03], [0.08, 0.22], [0.045, 0.25], [0.05, 0.27], [0, 0.29]], 16), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0x4a5a86);
    K.beam(M.metal, [0.07, 0.06, 0], [0.18, 0.22, 0], 0.014, 0x4a5a86, true, 6); K.put(M.metal, tor(0.06, 0.012, 4, 12, Math.PI), -0.09, 0.14, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x4a5a86); K.put(M.metal, sph(0.02), 0, 0.3, 0, 0, 0, 0, 1, 1, 1, 0x2a2a30); });
  for (const [x, z] of [[1.0, 1.3], [-0.9, 1.4]]) { K.put(M.metal, cyl(0.04, 0.035, 0.09, 12), x, 0.045, z, 0, 0, 0, 1, 1, 1, 0xb8b8c4); K.put(M.metal, tor(0.03, 0.006, 4, 10), x + 0.045, 0.05, z, 0, 0, Math.PI / 2, 1, 1, 1, 0xb8b8c4); }
  log(K, -1.7, 0, 1.2, 2.0, 0.2, 0.8, 901, { c: 0x7a6656 }); log(K, 1.8, 0, 2.0, 2.0, 0.2, -0.6, 902, { c: 0x7a6656 });
  // map table with lanterns
  K.at(3.3, 0, -1.6, -0.35, () => { K.box(M.wood, -0.95, 0.95, 0.74, 0.8, -0.45, 0.45, 0xb08a5a, 0.02); for (const s of [-1, 1]) { K.beam(M.wood, [s * 0.75, 0, -0.38], [s * 0.75, 0.74, 0.38], 0.05, 0x7a5a3a); K.beam(M.wood, [s * 0.75, 0, 0.38], [s * 0.75, 0.74, -0.38], 0.05, 0x7a5a3a); } K.beam(M.wood, [-0.75, 0.3, 0], [0.75, 0.3, 0], 0.05, 0x7a5a3a);
    lantern(K, 0.7, 0.8, -0.2, 1.2); K.put(M.metal, cyl(0.04, 0.035, 0.09, 12), -0.7, 0.845, 0.2, 0, 0, 0, 1, 1, 1, 0xb8b8c4); K.box(M.paper, -0.85, -0.55, 0.8, 0.84, -0.3, -0.05, 0xf0e8d0, 0.004); K.put(M.paint, cyl(0.035, 0.035, 0.03, 16), -0.3, 0.815, 0.3, 0, 0, 0, 1, 1, 1, 0xc8a050); // compass
    K.at(-0.65, 0.8, -0.25, 0.4, () => { K.put(M.paint, cyl(0.2, 0.2, 0.012, 20), 0, 0.006, 0, 0, 0, 0, 1, 1, 1, 0x5a4a3a); K.put(M.paint, cyl(0.11, 0.12, 0.1, 16), 0, 0.06, 0, 0, 0, 0, 1, 1, 1, 0x5a4a3a); }); }); // slouch hat
  const map = mesh(root, plane(0.78, 0.56), M.map, 3.3 + 0.05, 0.805, -1.6, -Math.PI / 2, -0.35 + 0.1, 0, false); map.rotation.set(-Math.PI / 2, 0, -0.25);
  // lantern hung on the tent pole
  lantern(K, -3.2 + 0.35 * Math.sin(0.12), 1.55, -6.0 + 1.8 + 0.35 + 0.08, 1);
  // rifle rack against the tree (rifles upright, muzzles skyward)
  K.at(-3.3, 0, -2.6, 0.25, () => { for (const s of [-1, 1]) K.beam(M.wood, [s * 0.6, 0, 0], [s * 0.6, 1.25, 0], 0.06, 0x6a4a30, true); K.beam(M.wood, [-0.7, 1.15, 0], [0.7, 1.15, 0], 0.05, 0x6a4a30, true); K.beam(M.wood, [-0.7, 0.08, -0.05], [0.7, 0.08, -0.05], 0.05, 0x6a4a30, true);
    for (const [x, l] of [[-0.36, 0.05], [0.0, -0.04], [0.36, 0.06]]) rifle(K, x, 0.1, l, 0); });
  // hound area: straw bed, water pan, stake
  K.put(M.foliage, cyl(1, 1, 0.05, 20), -2.0, 0.025, 3.1, 0, 0.3, 0, 1.25, 1, 0.85, 0xd8b860); for (let i = 0; i < 16; i++) K.beam(M.paint, [-2.0 + (R() - 0.5) * 2.4, 0.04, 3.1 + (R() - 0.5) * 1.5], [-2.0 + (R() - 0.5) * 2.4, 0.05, 3.1 + (R() - 0.5) * 1.5], 0.012, [0xe0c470, 0xc8a850][i % 2], true, 4);
  K.put(M.metal, cyl(0.2, 0.17, 0.07, 18), -0.6, 0.035, 3.7, 0, 0, 0, 1, 1, 1, 0x8a8a98); K.put(M.paint, cyl(0.18, 0.18, 0.01, 18), -0.6, 0.06, 3.7, 0, 0, 0, 1, 1, 1, 0x4a5a6a);
  K.beam(M.wood, [-3.2, 0, 2.4], [-3.2, 0.6, 2.4], 0.04, 0x6a4a30, true);
  // hitching rail + saddles over a log
  for (const x of [3.4, 6.8]) K.beam(M.wood, [x, 0, -4.6], [x, 1.1, -4.6], 0.08, 0x6a4a30, true); K.beam(M.wood, [3.2, 1.0, -4.6], [7.0, 1.0, -4.6], 0.06, 0x7a5a3a, true);
  log(K, 6.0, 0, -2.2, 2.6, 0.22, 0.1, 903, { c: 0x7a6656 }); for (const x of [5.5, 6.5]) K.at(x, 0.5, -2.2, 0, () => { K.cb(M.paint, 0.5, 0.06, 0.62, 0, 0.02, 0, 0x3a4a6a, 0, 0, 0, 0.02); K.cb(M.paint, 0.36, 0.12, 0.5, 0, 0.1, 0, 0x6a3a1e, 0, 0, 0, 0.05); });
  // crates, firewood, axe in a stump, bucket, bedrolls
  K.box(M.wood, 1.4, 2.0, 0, 0.5, -4.4, -3.8, 0xb08a5a, 0.02); K.box(M.wood, 1.5, 1.95, 0.5, 0.86, -4.3, -3.9, 0xa07a4a, 0.02);
  for (let i = 0; i < 9; i++) K.put(M.bark, cyl(0.07, 0.07, 0.7, 8), -6.2 + (i % 3) * 0.16, 0.08 + Math.floor(i / 3) * 0.14, -4.6, 0, 0, Math.PI / 2, 1, 1, 1, 0x7a6252);
  K.put(M.bark, cyl(0.25, 0.3, 0.45, 12), -5.2, 0.22, -4.0, 0, 0, 0, 1, 1, 1, 0x8a7666); K.beam(M.wood, [-5.2, 0.45, -4.0], [-5.0, 0.95, -3.9], 0.03, 0x9a7a4a, true); K.cb(M.metal, 0.03, 0.16, 0.12, -5.18, 0.48, -4.0, 0x6a6a74, 0, 0.3, 0.3, 0.01);
  K.put(M.metal, cyl(0.15, 0.12, 0.3, 14, true), 1.9, 0.15, -2.9, 0, 0, 0, 1, 1, 1, 0x7a8090);
  K.build(root);
  // cards: hounds lying on straw, horses tied at the rail
  const cards = [];
  const hounds = [[-2.65, 3.05, 0, true], [-1.25, 2.6, 1, false], [-2.1, 3.95, 2, true]].map(([x, z, v, sl]) => mkCard(root, 1.25, 0.62, (g) => drawHound(g, v, sl), 720, 360, x, 0, z, cards));
  const horses = [[4.3, -5.15, 0], [5.95, -5.15, 1]].map(([x, z, v]) => mkCard(root, 2.3, 2.36, (g) => drawHorse(g, v), 800, 820, x, 0, z, cards));
  // flag (waving), fire + glow + smoke
  const fg = new THREE.PlaneGeometry(1.45, 0.92, 14, 6); fg.translate(0.725, 0, 0); const flag = mesh(root, fg, M.flag, 0.05, 5.7, -8.6, 0, 0.35, 0, true); flag.userData.base = fg.attributes.position.array.slice();
  const flames = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, rr = i ? 0.14 : 0; const f = nond(mesh(root, lathe('flm', [[0, 0], [0.09, 0.05], [0.07, 0.18], [0.03, 0.32], [0, 0.42]], 10), i % 2 ? M.flame : M.flameCore, Math.cos(a) * rr, 0.1, 0.5 + Math.sin(a) * rr, 0, 0, 0, false)); f.userData.s = (i ? 0.8 : 1.4) * (0.8 + R() * 0.4); f.userData.ph = R() * 6; flames.push(f); }
  const halo = nond(mesh(root, plane(2.6, 2.6), M.halo, 0, 0.6, 0.5, 0, 0, 0, false)); halo.renderOrder = 5;
  const embers = nond(new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.012, 0), M.flameCore, 24)); embers.frustumCulled = false; root.add(embers);
  const smoke = []; for (let i = 0; i < 12; i++) { const s = nond(mesh(root, plane(1, 1), M.smoke.clone(), 0, 0, 0, 0, 0, 0, false)); s.renderOrder = 4; s.userData.ph = i / 12; s.userData.src = i < 9 ? [0, 0.6, 0.5, 1] : [0.78 + 0.18 * Math.cos(-0.6) , 0.5, 0.95, 0.35]; smoke.push(s); }
  return { cards, hounds, horses, flag, flames, halo, embers, smoke, dirt };
}

// ================================================================= WILLOW
function buildWillow(root, mist) {
  const R = rng(303), K = new Kit();
  const gg = new THREE.PlaneGeometry(90, 90, 90, 90); gg.rotateX(-Math.PI / 2); const p = gg.attributes.position, cols = [];
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) - 15; let y = 0.03 * Math.sin(x * 1.3 + z * 0.7) + 0.05 * Math.sin(x * 0.3 - z * 0.4); const bz = -3.6 - 0.6 * Math.sin(x * 0.35); if (z < bz) y -= Math.min(0.9, (bz - z) * 0.45); if (x < -6 && z < 2) y -= Math.min(0.8, (-6 - x) * 0.3);
    p.setY(i, y); p.setZ(i, z); const wet = Math.max(0, Math.min(1, 1 - (y + 0.2) / 0.25)); const mud = Math.exp(-(x * x + (z + 0.3) ** 2) / 6); cols.push(1 - wet * 0.4 - mud * 0.25, 1 - wet * 0.45 - mud * 0.28, 1 - wet * 0.4 - mud * 0.25); }
  gg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); gg.computeVertexNormals(); mesh(root, gg, M.ground, 0, 0, 0, 0, 0, 0, false);
  const water = mesh(root, plane(90, 90), M.water, 0, -0.2, -15, -Math.PI / 2, 0, 0, false);
  // the willow: leaning, forked trunk, arching limbs, hanging strands (kept off the bear)
  const T0 = [0, 0, -0.95], lean = 0.13;
  K.put(M.bark, trunkGeo(2, 0.7), T0[0], -0.12, T0[2], 0, 0.4, -lean, 0.8, 3.3, 0.8, 0x8a7a6a);
  const top = [T0[0] + Math.sin(lean) * 3.2, 3.1, T0[2]], limbs = [];
  for (const [a, b] of [[[top[0] - 0.05, 2.4, T0[2]], [-1.3, 3.5, -1.5]], [[top[0], 2.7, T0[2]], [1.5, 3.7, -1.7]]]) { K.beam(M.bark, a, b, 0.09, 0x8a7a6a, true, 7); limbs.push([a, a.map((v, j) => (v + b[j]) / 2), b]); }
  for (let i = 0; i < 7; i++) { const a = -0.4 + i / 6 * (Math.PI + 0.8) + (R() - 0.5) * 0.3, L = 2.6 + R() * 1.6, mid = [top[0] + Math.cos(a) * L * 0.5, top[1] + 1.2 + R() * 0.8, top[2] - Math.abs(Math.sin(a)) * L * 0.5 * (i % 2 ? 1 : -0.4)], end = [top[0] + Math.cos(a) * L, top[1] + 0.6 + R() * 0.8, mid[2] + (mid[2] - top[2]) * 0.6];
    K.beam(M.bark, [top[0], top[1], top[2]], mid, 0.13, 0x8a7a6a, true, 7); K.beam(M.bark, mid, end, 0.08, 0x8a7a6a, true, 6); limbs.push([top.slice(0, 3), mid, end]); }
  for (const [a, b, c] of limbs) for (let k = 0; k < 9; k++) { const t = k / 8, P = t < 0.5 ? a.map((v, j) => v + (b[j] - v) * t * 2) : b.map((v, j) => v + (c[j] - v) * (t - 0.5) * 2), hgt = 1.6 + R() * 1.4;
    const nearBear = P[2] > -1.6 && Math.abs(P[0] - 0.2) < 1.3 && P[1] - hgt < 1.6; for (let j = 0; j < 2; j++) { const hh = nearBear ? Math.min(hgt, P[1] - 1.7) : hgt; if (hh < 0.4) continue; K.put(M.willow, hang(0.7, hh), P[0] + (R() - 0.5) * 0.3, P[1], P[2] + (R() - 0.5) * 0.3, 0, R() * 6, 0, 1, 1, 1, [0xffffff, 0xe8e8d0, 0xf4ecc8][j % 3]); } }
  if (0) for (const [a, b, c] of limbs) for (const P of [b, c]) K.put(M.foliage, rockGeo(((P[0] * 10) | 0) & 7 % 7), P[0], P[1] + 0.15, P[2], 0, P[0], 0, 0.75, 0.4, 0.7, [0xb8b048, 0xa8a040, 0xc8b050][((P[2] * 10) | 0) & 1]);
  for (let i = 0; i < 70; i++) { const a = R() * TAU, rr = 0.3 + Math.sqrt(R()) * 2.4, P = [top[0] + Math.cos(a) * rr, top[1] + 1.7 - rr * rr * 0.2, top[2] - 0.3 + Math.sin(a) * rr * 0.8], hh = 1.8 + R() * 1.4, nb = P[2] > -1.6 && Math.abs(P[0] - 0.2) < 1.3; const H2 = nb ? Math.min(hh, P[1] - 1.7) : hh; if (H2 > 0.4) K.put(M.willow, hang(0.8, H2), P[0], P[1], P[2], 0, R() * 6, 0, 1, 1, 1, [0xffffff, 0xece4c4][i % 2]); }
  // reeds along the bank, cattails, mud puddles, a few cypress + willows beyond the bayou, cane
  for (let i = 0; i < 40; i++) { const x = (R() - 0.5) * 22, z = -3.2 - 0.6 * Math.sin(x * 0.35) + (R() - 0.5) * 1.4; if (Math.abs(x) < 1.5 && z > -3.6) continue; const s = 0.9 + R() * 0.8; for (const ry of [0, Math.PI / 2]) K.put(M.reed, stand(1.4 * s, 1.4 * s), x, -0.25, z, 0, ry + R(), 0, 1, 1, 1, [0xffffff, 0xf0e8d0][i % 2]); }
  for (const [x, z, s] of [[-3.6, 1.4, 1.1], [-5.0, -0.5, 1.3], [3.8, 1.2, 1.0], [5.6, -1.6, 1.4], [-2.2, 3.8, 0.9], [2.6, 4.4, 1.0]]) for (const ry of [0, Math.PI / 2]) K.put(M.reed, stand(1.3 * s, 1.2 * s), x, 0, z, 0, ry + x, 0, 1, 1, 1, 0xfff4dc);
  for (let i = 0; i < 9; i++) cypress(K, -12 + i * 3.2 + R(), -10 - R() * 8, 27 + R() * 6, 0.6 + R() * 0.3, 900 + i, { y0: -0.8, knees: 3, green: 0.3 });
  for (let i = 0; i < 6; i++) hardwood(K, -16 + i * 6.5 + R(), -22 - R() * 6, 24 + R() * 6, 0.4, 950 + i, { moss: true });
  caneClump(K, -7.5, 1.5, 22, 1.8, 961); caneClump(K, 8, 0.5, 22, 1.8, 962); caneClump(K, -9, 6, 14, 1.4, 963); caneClump(K, 10, 6, 14, 1.4, 964);
  log(K, -4.6, 0, 3.4, 2.6, 0.2, 0.7, 971); log(K, 5.0, 0, 3.6, 2.2, 0.18, -0.5, 972); palmetto(K, -6, 0, 4.5, 1.3, 973); palmetto(K, 6.8, 0, 4.8, 1.3, 974); palmetto(K, 1.8, 0, 6.5, 1.0, 975);
  for (let i = 0; i < 10; i++) rock(K, (R() - 0.5) * 10, 0.02, 2 - R() * 4, 0.08 + R() * 0.12, i, 0x6e6670);
  K.build(root);
  // the bear card + rope (rope rebuilt in placeLights to meet the billboard)
  const cards = [];
  const bear = mkCard(root, 1.05, 1.225, (g) => drawBear(g, { worry: 0.8 }), BEAR_W, BEAR_H, 0.25, 0.0, -0.15, cards);
  const ropeMat = toon({ color: 0xd0ae74 });
  const ropeWrap = mesh(root, tor(0.47, 0.024, 6, 30), ropeMat, T0[0] + 0.1, 0.72, T0[2], Math.PI / 2 - 0.28, 0, 0.12, true);
  const rope = mesh(root, new THREE.BufferGeometry(), ropeMat, 0, 0, 0, 0, 0, 0, true);
  // overcast mist hanging over the bayou
  for (const [x, z, w, d, op] of [[0, -9, 24, 8, 0.3], [-6, -14, 20, 10, 0.4]]) mistSheet(root, x, 0.05, z, w, d, op, mist);
  for (const [z, y, op] of [[-16, 2.5, 0.3], [-26, 3, 0.45]]) mistWall(root, 0, y, z, 60, 7, op, mist);
  return { bear, rope, ropeWrap, cards, trunk: [T0[0] + 0.1, 0.72, T0[2]], water };
}

// ================================================================= NEWSROOM
function typewriter(K, x, y, z, ry) { K.at(x, y, z, ry, () => { const blk = 0x1e1a22;
  K.box(M.metal, -0.2, 0.2, 0, 0.05, -0.16, 0.14, blk, 0.015); // base
  K.cb(M.metal, 0.36, 0.1, 0.18, 0, 0.09, -0.02, blk, -0.5, 0, 0, 0.03); // sloped body
  for (let r = 0; r < 4; r++) for (let c = 0; c < 10; c++) K.put(M.metal, cyl(0.011, 0.011, 0.012, 8), -0.135 + c * 0.03 + (r % 2) * 0.012, 0.045 + r * 0.022, 0.12 - r * 0.035, 0, 0, 0, 1, 1, 1, 0xe8e4dc); // keys
  K.put(M.metal, tor(0.09, 0.012, 4, 16, Math.PI), 0, 0.15, -0.05, 0, 0, 0, 1, 1, 1, 0x3a3a44); // typebar basket
  K.put(M.metal, cyl(0.03, 0.03, 0.46, 12), 0, 0.2, -0.1, 0, 0, Math.PI / 2, 1, 1, 1, 0x26222a); // platen
  for (const s of [-1, 1]) K.put(M.metal, cyl(0.025, 0.025, 0.02, 10), s * 0.24, 0.2, -0.1, 0, 0, Math.PI / 2, 1, 1, 1, 0x3a3a44);
  K.beam(M.metal, [-0.25, 0.21, -0.1], [-0.31, 0.24, -0.02], 0.008, 0xc8c8d0, true, 4); // return lever
  K.cb(M.paper, 0.2, 0.2, 0.004, 0, 0.3, -0.13, 0xfaf4e4, -0.2, 0, 0, 0.002); }); } // sheet in the platen
function desk(K, x, z, ry, R) { K.at(x, 0, z, ry, () => { const top = 0.76;
  K.box(M.wood, -0.75, 0.75, top - 0.04, top, -0.4, 0.4, 0x8a5a34, 0.015); K.box(M.wood, 0.25, 0.73, 0, top - 0.04, -0.38, 0.38, 0x7a4a2c, 0.02); for (let k = 0; k < 3; k++) K.box(M.wood, 0.28, 0.7, 0.08 + k * 0.22, 0.26 + k * 0.22, 0.38, 0.4, 0x8a5a34, 0.01);
  for (const [a, b] of [[-0.7, -0.35], [-0.7, 0.35]]) K.beam(M.wood, [a, 0, b], [a, top - 0.04, b], 0.05, 0x6a4024);
  typewriter(K, -0.15, top, 0.02, 0);
  const n = (R() * 4) | 0; for (let k = 0; k < 4 + n; k++) K.box(M.paper, 0.32, 0.6, top + k * 0.012, top + k * 0.012 + 0.01, -0.3, -0.06, k % 2 ? 0xf4ecd8 : 0xe8dcc0, 0.002); // paper stack
  K.beam(M.metal, [-0.55, top, -0.25], [-0.55, top + 0.18, -0.25], 0.004, 0x6a6a74, true, 4); K.put(M.metal, cyl(0.05, 0.05, 0.012, 12), -0.55, top + 0.006, -0.25, 0, 0, 0, 1, 1, 1, 0x2a2a30); // spike file
  for (let k = 0; k < 5; k++) K.cb(M.paper, 0.12, 0.002, 0.08, -0.55, top + 0.03 + k * 0.03, -0.25, 0xf4ecd8, 0, k, 0, 0.001);
  K.put(M.paint, cyl(0.025, 0.03, 0.05, 10), 0.45, top + 0.025, 0.2, 0, 0, 0, 1, 1, 1, 0x1a2a4a); // ink bottle
  K.at(0, 0, 0.75, Math.PI, () => { K.box(M.wood, -0.22, 0.22, 0.44, 0.48, -0.22, 0.22, 0x6a4024, 0.03); K.box(M.wood, -0.22, 0.22, 0.48, 0.9, -0.24, -0.2, 0x6a4024, 0.03); K.beam(M.metal, [0, 0, 0], [0, 0.44, 0], 0.03, 0x2a2a30, true); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; K.beam(M.metal, [0, 0.02, 0], [Math.cos(a) * 0.28, 0.02, Math.sin(a) * 0.28], 0.02, 0x2a2a30, true, 4); } }); // swivel chair
}); }
function deskLamp(K, x, y, z, ry, list, root) { K.at(x, y, z, ry, () => { K.put(M.metal, cyl(0.07, 0.08, 0.02, 14), 0, 0.01, 0, 0, 0, 0, 1, 1, 1, 0x9a7a3a); K.beam(M.metal, [0, 0.02, 0], [0, 0.34, 0], 0.012, 0x9a7a3a, true, 6); K.beam(M.metal, [0, 0.34, 0], [0, 0.36, 0.1], 0.01, 0x9a7a3a, true, 6); }); }
function buildNewsroom(root) {
  const R = rng(404), K = new Kit(), X0 = -7, X1 = 7, Z0 = -6, Z1 = 7, H = 4.2;
  mesh(root, plane(X1 - X0, Z1 - Z0), M.floor, 0, 0, (Z0 + Z1) / 2, -Math.PI / 2, 0, 0, false);
  mesh(root, plane(X1 - X0, Z1 - Z0), M.plaster, 0, H, (Z0 + Z1) / 2, Math.PI / 2, 0, 0, false);
  // walls: back (big window + doorway to the press room), left, right; wainscot below, wallpaper above
  const wall = (x0, x1, y0, y1, z, mat) => mesh(root, plane(x1 - x0, y1 - y0), mat, (x0 + x1) / 2, (y0 + y1) / 2, z, 0, 0, 0, false);
  const WX0 = -4.2, WX1 = -0.6, WY0 = 1.0, WY1 = 3.7, DX0 = 3.2, DX1 = 4.6, DY = 2.6;
  wall(X0, WX0, 1.0, H, Z0, M.wallpaper); wall(WX1, DX0, 1.0, H, Z0, M.wallpaper); wall(DX1, X1, 1.0, H, Z0, M.wallpaper); wall(WX0, WX1, WY1, H, Z0, M.wallpaper); wall(DX0, DX1, DY, H, Z0, M.wallpaper);
  wall(X0, DX0, 0, 1.0, Z0 + 0.01, M.panel); wall(DX1, X1, 0, 1.0, Z0 + 0.01, M.panel);
  for (const s of [-1, 1]) { const m1 = mesh(root, plane(Z1 - Z0, H - 1), M.wallpaper, s * X1, (H + 1) / 2, (Z0 + Z1) / 2, 0, -s * Math.PI / 2, 0, false); const m2 = mesh(root, plane(Z1 - Z0, 1), M.panel, s * (X1 - 0.01), 0.5, (Z0 + Z1) / 2, 0, -s * Math.PI / 2, 0, false); }
  K.box(M.wood, X0, X1, 0.98, 1.06, Z0, Z0 + 0.06, 0x4a2a18, 0.01); K.box(M.wood, X0, X1, H - 0.18, H, Z0, Z0 + 0.12, 0xe8dcc0, 0.01); // chair rail, crown
  for (const s of [-1, 1]) K.box(M.wood, s * X1 - 0.06, s * X1 + 0.06, 0.98, 1.06, Z0, Z1, 0x4a2a18, 0.01);
  // the big window: glowing panes behind mullions, sill
  mesh(root, plane(WX1 - WX0, WY1 - WY0), M.winView, (WX0 + WX1) / 2, (WY0 + WY1) / 2, Z0 - 0.08, 0, 0, 0, false);
  for (let i = 0; i <= 3; i++) K.box(M.wood, WX0 + i * (WX1 - WX0) / 3 - 0.04, WX0 + i * (WX1 - WX0) / 3 + 0.04, WY0, WY1, Z0 - 0.06, Z0 + 0.04, 0xe8dcc0, 0.01);
  for (let i = 0; i <= 4; i++) K.box(M.wood, WX0, WX1, WY0 + i * (WY1 - WY0) / 4 - 0.035, WY0 + i * (WY1 - WY0) / 4 + 0.035, Z0 - 0.06, Z0 + 0.04, 0xe8dcc0, 0.01);
  K.box(M.wood, WX0 - 0.15, WX1 + 0.15, WY0 - 0.08, WY0, Z0, Z0 + 0.2, 0xe8dcc0, 0.01);
  // window light: a few shafts across the room
  const shafts = []; for (let i = 0; i < 3; i++) { const s = nond(mesh(root, plane(1.1, 6.5), M.shaft, WX0 + 0.6 + i * 1.2, 2.0, Z0 + 2.4, -0.95, 0.25, 0, false)); s.renderOrder = 3; shafts.push(s); }
  // doorway: frame + the press room beyond (warm light, the press)
  K.box(M.wood, DX0 - 0.12, DX0, 0, DY + 0.1, Z0 - 0.15, Z0 + 0.05, 0x4a2a18, 0.01); K.box(M.wood, DX1, DX1 + 0.12, 0, DY + 0.1, Z0 - 0.15, Z0 + 0.05, 0x4a2a18, 0.01); K.box(M.wood, DX0 - 0.12, DX1 + 0.12, DY, DY + 0.16, Z0 - 0.15, Z0 + 0.05, 0x4a2a18, 0.01);
  const PZ = Z0 - 4.5; mesh(root, plane(8, 6), M.floor, 4, 0.001, Z0 - 3, -Math.PI / 2, 0, 0, false); mesh(root, plane(8, H), M.panel, 4, H / 2, PZ - 1.4, 0, 0, 0, false);
  for (const x of [0.2, 7.8]) mesh(root, plane(6, H), M.panel, x, H / 2, Z0 - 3, 0, x < 4 ? Math.PI / 2 : -Math.PI / 2, 0, false);
  K.at(4.1, 0, Z0 - 3.2, 0, () => { const ir = 0x2a3a34; // flatbed cylinder press
    K.box(M.metal, -1.6, 1.6, 0, 0.8, -0.8, 0.8, ir, 0.04); K.box(M.metal, -1.4, 1.4, 0.8, 0.9, -0.7, 0.7, 0x3a4a44, 0.02);
    for (const s of [-1, 1]) K.box(M.metal, -0.5, 0.5, 0.8, 1.8, s * 0.72 - 0.06, s * 0.72 + 0.06, ir, 0.04);
    K.put(M.metal, cyl(0.42, 0.42, 1.36, 24), 0, 1.35, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x5a5a62); for (let k = 0; k < 3; k++) K.put(M.metal, cyl(0.07, 0.07, 1.36, 12), -0.6 + k * 0.6, 1.9, 0.1, Math.PI / 2, 0, 0, 1, 1, 1, 0x1a1a20);
    K.put(M.metal, tor(0.55, 0.05, 8, 28), -1.75, 1.0, 0.85, 0, Math.PI / 2, 0, 1, 1, 1, 0x3a4a44); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; K.beam(M.metal, [-1.75, 1.0, 0.85], [-1.75 + Math.cos(a) * 0.55, 1.0 + Math.sin(a) * 0.55, 0.85], 0.03, 0x3a4a44); } // flywheel
    K.cb(M.wood, 1.0, 0.04, 0.9, 1.0, 1.9, 0, 0x9a7a4a, 0, 0, -0.3, 0.01); for (let k = 0; k < 8; k++) K.cb(M.paper, 0.9, 0.006, 0.8, 1.0, 1.93 + k * 0.007, 0, 0xf0e8d4, 0, 0, -0.3, 0.002); // feed board + sheets
    for (let k = 0; k < 6; k++) K.box(M.paper, -2.6, -2.0, k * 0.08, k * 0.08 + 0.07, -0.4 + (k % 2) * 0.02, 0.2, 0xe8e0cc, 0.004); }); // bundled papers
  // rows of desks with typewriters
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const x = -4.6 + c * 2.3 + (r % 2) * 0.2, z = -3.4 + r * 2.2; if (r === 2 && c === 2) continue; desk(K, x, z, 0, R); }
  // pigeonhole cabinet, coat rack + hats, wall clock, framed pictures (no text), pot-bellied stove, wall telephone, waste basket
  K.box(M.wood, X0 + 0.05, X0 + 0.5, 0, 2.1, -3.0, -0.6, 0x6a4024, 0.02); for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) K.box(M.paper, X0 + 0.45, X0 + 0.52, 1.0 + i * 0.17, 1.12 + i * 0.17, -2.9 + j * 0.58, -2.5 + j * 0.58, 0xf0e4c8, 0.004);
  K.beam(M.wood, [X0 + 0.5, 0, 2.2], [X0 + 0.5, 1.85, 2.2], 0.03, 0x4a2a18, true); for (let k = 0; k < 3; k++) { const a = k * 2.09; K.beam(M.wood, [X0 + 0.5 + Math.cos(a) * 0.3, 0, 2.2 + Math.sin(a) * 0.3], [X0 + 0.5, 0.4, 2.2], 0.015, 0x4a2a18, true); }
  for (const [dy, c] of [[1.78, 0x2a2228], [1.6, 0x4a3a2a]]) { K.put(M.paint, cyl(0.15, 0.15, 0.01, 18), X0 + 0.55, dy, 2.2 + (dy > 1.7 ? 0 : 0.12), 0.2, 0, 0, 1, 1, 1, c); K.put(M.paint, sph(0.1, 12, 8), X0 + 0.55, dy + 0.02, 2.2 + (dy > 1.7 ? 0 : 0.12), 0, 0, 0, 1, 0.8, 1, c); } // bowler + derby
  K.put(M.paint, cyl(0.24, 0.24, 0.05, 24), 1.2, 3.1, Z0 + 0.03, Math.PI / 2, 0, 0, 1, 1, 1, 0x5a3a24); K.put(M.paint, cyl(0.2, 0.2, 0.01, 24), 1.2, 3.1, Z0 + 0.06, Math.PI / 2, 0, 0, 1, 1, 1, 0xf4ecd6); K.beam(M.paint, [1.2, 3.1, Z0 + 0.07], [1.2, 3.25, Z0 + 0.07], 0.012, 0x2a1d4a); K.beam(M.paint, [1.2, 3.1, Z0 + 0.07], [1.29, 3.05, Z0 + 0.07], 0.012, 0x2a1d4a);
  for (const [x, y, w, h] of [[-6, 2.4, 0.8, 0.6], [5.8, 2.3, 0.7, 0.9], [2.2, 2.1, 0.6, 0.45]]) { K.box(M.wood, x - w / 2, x + w / 2, y - h / 2, y + h / 2, Z0, Z0 + 0.04, 0x3a2418, 0.01); K.box(M.paint, x - w / 2 + 0.06, x + w / 2 - 0.06, y - h / 2 + 0.06, y + h / 2 - 0.06, Z0 + 0.04, Z0 + 0.045, [0xc8b890, 0x9aa0a8, 0xb8a888][(x | 0) % 3 & 3] || 0xc8b890, 0.002); }
  K.at(5.6, 0, 0.8, 0, () => { K.put(M.metal, lathe('stove', [[0, 0], [0.3, 0.1], [0.36, 0.5], [0.3, 0.9], [0.2, 1.0], [0.2, 1.1]], 18), 0, 0.12, 0, 0, 0, 0, 1, 1, 1, 0x2a2a30); K.beam(M.metal, [0, 1.2, 0], [0, H, 0], 0.08, 0x2a2a30, true, 10); for (let k = 0; k < 3; k++) { const a = k * 2.09; K.beam(M.metal, [Math.cos(a) * 0.25, 0, Math.sin(a) * 0.25], [Math.cos(a) * 0.2, 0.15, Math.sin(a) * 0.2], 0.03, 0x2a2a30); } });
  K.box(M.wood, X1 - 0.2, X1 - 0.02, 1.4, 1.95, -2.4, -2.1, 0x6a4024, 0.02); K.put(M.metal, cyl(0.03, 0.04, 0.12, 10), X1 - 0.24, 1.75, -2.25, 0, 0, Math.PI / 2, 1, 1, 1, 0x1a1a20); for (const dz of [-0.1, 0.1]) K.put(M.metal, sph(0.04), X1 - 0.24, 1.88, -2.25 + dz, 0, 0, 0, 1, 1, 1, 0xd8b050); // wall phone
  K.put(M.paint, cyl(0.18, 0.14, 0.4, 14, true), -1.3, 0.2, 2.0, 0, 0, 0, 1, 1, 1, 0x6a4a2a); for (let k = 0; k < 4; k++) K.put(M.paper, sph(0.07, 8, 6), -1.3 + (k - 1.5) * 0.06, 0.38, 2.0 + (k % 2) * 0.05, 0, 0, 0, 1, 0.7, 1, 0xf0e8d0);
  // hanging electric lamps with green shades
  for (const [x, z] of [[-3.5, -2.3], [0.2, -2.3], [-3.5, 1.2], [0.2, 1.2]]) { K.beam(M.metal, [x, H, z], [x, 2.7, z], 0.008, 0x2a2a30, true, 4); K.put(M.lampShade, lathe('shade', [[0.04, 0.12], [0.1, 0.1], [0.24, 0], [0.25, -0.02]], 18), x, 2.58, z); K.put(M.glass, sph(0.05, 10, 8), x, 2.57, z); }
  // the cartoonist's drafting table (board faces +z, tilted), lamp, ink pots, nibs in a jar, T-square, stool
  const DT = [3.4, 0, 2.2], DRY = -0.5, ang = 0.62, BW = 0.9, BH = 0.7, by = 1.0;
  K.at(DT[0], 0, DT[2], DRY, () => { for (const s of [-1, 1]) { K.beam(M.wood, [s * 0.4, 0, -0.3], [s * 0.4, by, -0.12], 0.05, 0x6a4024); K.beam(M.wood, [s * 0.4, 0, 0.2], [s * 0.4, by - 0.25, 0.14], 0.05, 0x6a4024); }
    K.beam(M.wood, [-0.4, 0.25, -0.05], [0.4, 0.25, -0.05], 0.04, 0x6a4024);
    K.cb(M.wood, BW, BH, 0.03, 0, by + Math.sin(ang) * 0, 0.02, 0xb08a5a, -(Math.PI / 2 - ang), 0, 0, 0.01); // board
    K.cb(M.wood, 0.32, 0.03, 0.18, BW / 2 + 0.2, by - 0.05, 0.1, 0x8a5a34, 0, 0, 0, 0.01); // side tray
    for (const [x, c] of [[0.36, 0x1a1428], [0.44, 0x1a1428], [0.52, 0x7a2a2a]]) { K.put(M.glass === M.glass ? M.paint : M.paint, cyl(0.022, 0.028, 0.05, 12), BW / 2 + 0.2 + x - 0.44, by - 0.01, 0.07, 0, 0, 0, 1, 1, 1, c); K.put(M.paint, cyl(0.012, 0.012, 0.01, 8), BW / 2 + 0.2 + x - 0.44, by + 0.02, 0.07, 0, 0, 0, 1, 1, 1, 0x2a2a30); } // ink pots
    K.put(M.paint, cyl(0.03, 0.03, 0.08, 12, true), BW / 2 + 0.28, by + 0.0, 0.15, 0, 0, 0, 1, 1, 1, 0x8a9aa8); for (let k = 0; k < 4; k++) K.beam(M.paint, [BW / 2 + 0.28, by, 0.15], [BW / 2 + 0.28 + (k - 1.5) * 0.02, by + 0.2, 0.15 + (k % 2) * 0.02], 0.006, [0x6a3a1e, 0x2a2a30, 0x8a5a2a, 0x2a2a30][k], true, 4); // nib holders in a jar
    K.cb(M.wood, 0.04, 0.012, 0.85, -BW / 2 - 0.03, by + 0.02, 0.02, 0x3a2418, -(Math.PI / 2 - ang), 0, 0, 0.004); // T-square head
    K.at(0.1, 0, 0.75, 0, () => { K.put(M.wood, cyl(0.2, 0.2, 0.04, 16), 0, 0.72, 0, 0, 0, 0, 1, 1, 1, 0x6a4024); for (let k = 0; k < 3; k++) { const a = k * 2.09; K.beam(M.wood, [Math.cos(a) * 0.08, 0.7, Math.sin(a) * 0.08], [Math.cos(a) * 0.24, 0, Math.sin(a) * 0.24], 0.025, 0x6a4024, true); } }); // stool
    K.beam(M.metal, [-BW / 2, by + 0.1, -0.2], [-BW / 2 - 0.1, by + 0.65, -0.25], 0.012, 0x2a2a30, true); K.beam(M.metal, [-BW / 2 - 0.1, by + 0.65, -0.25], [-BW / 2 + 0.2, by + 0.75, -0.05], 0.012, 0x2a2a30, true); // lamp arm
  });
  // the paper on the board (own mesh: repainted by setDrawing)
  const dtg = new THREE.Group(); dtg.position.set(DT[0], 0, DT[2]); dtg.rotation.y = DRY; root.add(dtg);
  const sheet = mesh(dtg, plane(0.48, 0.6), M.draft, 0.02, by + 0.01 + Math.cos(ang) * 0.0, 0.02 + 0.03, -(Math.PI / 2 - ang), 0, 0, false); sheet.rotation.set(-(Math.PI / 2 - ang) + 0, 0, 0); sheet.position.set(0.02, by, 0.02); sheet.translateZ(0.02);
  const shadeM = mesh(dtg, lathe('dshade', [[0.03, 0.1], [0.07, 0.08], [0.15, 0], [0.16, -0.02]], 16), M.lampShade, -BW / 2 + 0.2, by + 0.73, -0.05, -0.5, 0, 0, false); mesh(dtg, sph(0.035, 10, 8), M.glass, -BW / 2 + 0.2, by + 0.7, -0.03, 0, 0, 0, false);
  const pen = new THREE.Group(); dtg.add(pen); { const pk = new Kit(); pk.beam(M.paint, [0, 0, 0], [0, 0.03, 0], 0.004, 0xb8b8c0, true, 4); pk.beam(M.paint, [0, 0.03, 0], [0, 0.19, 0], 0.008, 0x3a2418, true, 6); pk.build(pen); }
  // the front page prop (flat on a small side table, front left)
  K.at(-2.4, 0, 3.6, 0.2, () => { K.box(M.wood, -0.45, 0.45, 0.7, 0.75, -0.35, 0.35, 0x7a4a2c, 0.015); for (const [a, b] of [[-0.4, -0.3], [0.4, -0.3], [-0.4, 0.3], [0.4, 0.3]]) K.beam(M.wood, [a, 0, b], [a, 0.7, b], 0.04, 0x6a4024); K.put(M.paint, cyl(0.04, 0.035, 0.08, 12), 0.3, 0.79, 0.2, 0, 0, 0, 1, 1, 1, 0xe8e4dc); });
  const front = mesh(root, plane(0.5, 0.68), M.front, -2.4, 0.757, 3.6, -Math.PI / 2, 0, 0, false); front.rotation.set(-Math.PI / 2, 0, 0.05);
  K.build(root);
  return { sheet, pen, front, shafts, board: { ang, by, BW, BH }, dtg };
}

// ================================================================= lights, grades, practicals, views
const SET_LIGHT = {
  swamp: { top: '#5a7a74', hor: '#e4d6a0', fog: '#8f9670', fogN: 5, fogF: 62, sky: '#a8b884', ground: '#3a3048', hemiI: 0.62, fillCol: '#6a80c8', fillI: 0.3, sunCol: '#ffd890', sunI: 3.0, az: 162, el: 24, disc: '#fff4d0', discSize: 0.003, clouds: false, stars: 0, cardTint: '#fff2d8', fxTint: '#fff4e0', shafts: 1.3 },
  camp: { top: '#1e2a6a', hor: '#e8946a', fog: '#4a4a78', fogN: 10, fogF: 70, sky: '#5a68b8', ground: '#2a2038', hemiI: 0.62, fillCol: '#4a62d0', fillI: 0.38, sunCol: '#ff9a5a', sunI: 1.3, az: -118, el: 7, disc: '#ffd0a0', discSize: 0.002, clouds: false, stars: 0.25, cardTint: '#ffd8c0', fxTint: '#ffe0c8', shafts: 0.4 },
  willow: { top: '#8a94aa', hor: '#d0d2cc', fog: '#b4b8b0', fogN: 6, fogF: 60, sky: '#c4c8d0', ground: '#4a4250', hemiI: 1.25, fillCol: '#8a98d0', fillI: 0.35, sunCol: '#f4f0e8', sunI: 1.35, az: 30, el: 55, disc: '#000000', discSize: 0.0, clouds: false, stars: 0, cardTint: '#f4f2f8', fxTint: '#ffffff', shafts: 0 },
  newsroom: { top: '#000000', hor: '#2e2620', fog: '#2e261e', fogN: 12, fogF: 40, sky: '#f4e2c4', ground: '#6a4a34', hemiI: 1.25, fillCol: '#8a90d0', fillI: 0.3, sunCol: '#fff0d4', sunI: 1.3, az: -38, el: 38, disc: '#000000', clouds: false, shadow: false, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
};
function sunDir(L) { const el = L.el * Math.PI / 180, az = L.az * Math.PI / 180; return new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)); }
const SET_GRADE = {
  swamp: { look: 'golden', over: { exp: 1.12, con: 1.3, sat: 0.95, lift: [0.03, 0.04, 0.03], gain: [1.02, 1.02, 0.94], tS: ['#2a4a4a', 0.2], tH: ['#ffd890', 0.12], bloom: [0.42, 0.8], hal: [0.22, '#ffb040'], vig: [0.34, 0.48, '#1e2a24'] } },
  camp: { look: 'night', over: { exp: 1.2, con: 1.3, sat: 1.0, tS: ['#2a3a8a', 0.24], tH: ['#ffa050', 0.2], bloom: [0.5, 0.74], hal: [0.32, '#ff7a30'], vig: [0.36, 0.45, '#141a3a'] } },
  willow: { look: 'stadium', over: { exp: 1.04, con: 1.22, sat: 0.9, lift: [0.035, 0.035, 0.05], tS: ['#4a4a7a', 0.16], tH: ['#f0e8d8', 0.04], bloom: [0.28, 0.9], vig: [0.26, 0.5, '#4a4a5a'] } },
  newsroom: { look: 'office', over: { exp: 1.32, con: 1.28, lift: [0.04, 0.03, 0.05], tH: ['#ffd8a0', 0.06], bloom: [0.42, 0.78], hal: [0.24, '#ff9a50'], vig: [0.34, 0.46, '#3a2a30'] } },
};
const SET_PRACT = {
  swamp: [{ p: [0.8, 1.6, 6.2], col: '#ffd890', I: 1.8, d: 6 }],
  camp: [{ p: [0, 0.7, 0.5], col: '#ff9a40', I: 9, d: 11, fire: 1 }, { p: [4.03, 1.15, -1.55], col: '#ffc070', I: 2.2, d: 4 }, { p: [-3.0, 1.75, -3.7], col: '#ffb060', I: 2.4, d: 5 }, { p: [-3.2, 1.1, -6.0], col: '#ffa050', I: 1.6, d: 3 }],
  willow: [{ p: [0.6, 2.2, 3.2], col: '#e8ecff', I: 1.4, d: 6 }],
  newsroom: [{ p: [3.4 - 0.2, 1.85, 2.2 + 0.1], col: '#ffd090', I: 1.3, d: 3.2 }, { p: [-3.5, 2.5, -2.3], col: '#ffc880', I: 2.8, d: 5 }, { p: [0.2, 2.5, 1.2], col: '#ffc880', I: 2.6, d: 5 }, { p: [4.1, 2.6, -9.2], col: '#ffa860', I: 6, d: 7 }],
};
export function buildSwamp(ctx) {
  ({ THREE, toon, mkTex, PT } = ctx); NOND = ctx.NOND || null; CAM = ctx.camera || null; MACRO = ctx.macro || null;
  M = materials();
  const groups = {};
  for (const name of SETS) { const g = new THREE.Group(); g.name = 'teddy_' + name; g.position.set(...O[name]); g.visible = false; ctx.scene.add(g); groups[name] = g; }
  const rays = [], mist = [];
  const sw = buildSwampSet(groups.swamp, rays, mist), cp = buildCamp(groups.camp), wl = buildWillow(groups.willow, mist), nr = buildNewsroom(groups.newsroom);
  const SY = (x, z) => swampY(x, z);
  const spots = {
    // swamp (trail centre line; ground ~0)
    trail0: W3('swamp', [tC(7), SY(tC(7), 7), 7]), trail1: W3('swamp', [tC(4), SY(tC(4), 4), 4]), trail2: W3('swamp', [tC(1), SY(tC(1), 1), 1]), trail3: W3('swamp', [tC(-3), SY(tC(-3), -3), -3]), trail4: W3('swamp', [tC(-7), SY(tC(-7), -7), -7]), trailFar: W3('swamp', [tC(-14), SY(tC(-14), -14), -14]),
    hound0: W3('swamp', [tC(5.5) - 0.6, SY(tC(5.5) - 0.6, 5.5), 5.5]), hound1: W3('swamp', [tC(2.5) + 0.5, SY(tC(2.5) + 0.5, 2.5), 2.5]), logAcross: W3('swamp', [cA(-2), 0.1, -2]), waterEdge: W3('swamp', [cA(3) + 1.5, SY(cA(3) + 1.5, 3), 3]),
    // camp
    fire: W3('camp', [0, 0, 0.5]), fireL: W3('camp', [-1.4, 0, 1.5]), fireR: W3('camp', [1.5, 0, 1.6]), fireBack: W3('camp', [0.2, 0, -1.0]), logSeatL: W3('camp', [-1.7, 0.3, 1.2]), logSeatR: W3('camp', [1.8, 0.3, 2.0]),
    table: W3('camp', [3.3, 0.8, -1.6]), atTable: W3('camp', [3.0, 0, -0.8]), atTable2: W3('camp', [4.3, 0, -1.0]), tentDoor: W3('camp', [-3.0, 0, -3.6]), tentDoor2: W3('camp', [1.65, 0, -4.4]), rifleRack: W3('camp', [-3.3, 0, -2.6]), byRack: W3('camp', [-2.5, 0, -1.7]),
    houndBed: W3('camp', [-2.0, 0, 3.0]), dog0: W3('camp', [-2.65, 0, 3.05]), dog1: W3('camp', [-1.25, 0, 2.6]), dog2: W3('camp', [-2.1, 0, 3.95]), dogFree: W3('camp', [-0.4, 0, 3.0]), horse0: W3('camp', [4.3, 0, -5.15]), horse1: W3('camp', [5.95, 0, -5.15]), byHorses: W3('camp', [3.2, 0, -3.9]), flag: W3('camp', [0, 0, -8.6]), coffeePot: W3('camp', [0.78, 0.16, 0.95]),
    // willow
    bear: W3('willow', [0.25, 0, -0.15]), bearHead: W3('willow', [0.25, 0.95, -0.15]), tree: W3('willow', [0, 0, -0.95]), tr: W3('willow', [2.7, 0, 2.7]), collier: W3('willow', [-2.2, 0, 2.8]), hunter0: W3('willow', [5.2, 0, -0.6]), hunter1: W3('willow', [6.0, 0, 0.6]), hunter2: W3('willow', [-5.0, 0, 1.2]), bankEdge: W3('willow', [2.2, 0, -2.6]), dog: W3('willow', [-4.0, 0, 3.4]),
    // newsroom (floor 0; desk tops 0.76)
    cartoonist: W3('newsroom', [3.4 + Math.sin(-0.5) * 0.85, 0, 2.2 + Math.cos(-0.5) * 0.85]), drafting: W3('newsroom', [3.4, 1.0, 2.2]), editor: W3('newsroom', [1.6, 0, 3.6]), desk0: W3('newsroom', [-4.6, 0, -2.65]), desk1: W3('newsroom', [-2.3, 0, -2.65]), desk2: W3('newsroom', [0.0, 0, -2.65]),
    desk3: W3('newsroom', [-4.4, 0, -0.45]), desk4: W3('newsroom', [-2.1, 0, -0.45]), desk5: W3('newsroom', [0.2, 0, -0.45]), desk6: W3('newsroom', [-4.6, 0, 1.75]), desk7: W3('newsroom', [-2.3, 0, 1.75]), window: W3('newsroom', [-2.4, 0, -5.0]), pressDoor: W3('newsroom', [3.9, 0, -5.5]), pressman: W3('newsroom', [2.6, 0, -8.4]), newspaper: W3('newsroom', [-2.4, 0.76, 3.6]), doorway: W3('newsroom', [3.9, 0, -4.6]),
  };
  const V = (set, p, l, fov, cInf, fp, extra = {}) => { const c = { set, p: W3(set, p), l: W3(set, l), fov, cInf, fp: fp ? W3(set, fp) : null, ...extra }; c.focus = Math.hypot(...[0, 1, 2].map((i) => c.p[i] - (c.fp || c.l)[i])); return c; };
  const t4 = [tC(3), 0.1, 3];
  const views = [
    V('swamp', [1.9, 1.75, 15.5], [0.9, 3.4, -10], 50, 2, t4), // 0 swamp wide: trail through cypress + moss, channel, god-rays, mist
    V('swamp', [2.0, 1.5, 9.8], [2.5, 1.4, 0], 40, 4, [tC(3), 1, 3]), // 1 swamp medium: down the trail, log across the channel, cane
    V('swamp', [1.4, 0.32, 6.4], [-0.4, 0.2, 4.0], 38, 6, [-0.4, 0.1, 4.0]), // 2 swamp close: cypress knees in murky water, moss above
    V('camp', [1.0, 1.55, 10.5], [0.6, 2.0, -4], 50, 2, [0, 0.6, 0.5]), // 3 camp wide: tents, fire, flag, table, rifle-rack tree
    V('camp', [1.6, 1.35, 5.4], [0.6, 0.75, -0.6], 42, 4, [0.3, 0.5, 0.5]), // 4 camp medium: fire + coffee pot + table + log seats
    V('camp', [1.95, 1.15, 2.7], [0.35, 0.45, 0.6], 38, 7, [0.6, 0.35, 0.8]), // 5 camp close: pot on the tripod, coffee pot on the stone
    V('camp', [5.3, 1.55, 3.6], [5.0, 1.15, -5.0], 42, 4, [5.1, 1.2, -5.1]), // 6 camp horses at the hitching rail
    V('camp', [-2.0, 2.2, 7.6], [-2.0, 0.35, 3.1], 46, 6, [-2.0, 0.35, 3.2]), // 7 camp hounds on the straw
    V('camp', [-2.3, 1.25, 0.9], [-3.3, 0.7, -2.6], 42, 5, [-3.3, 0.7, -2.6]), // 8 camp rifle rack (rifles upright, never pointed)
    V('willow', [0.25, 2.0, 14.5], [0.25, 1.45, -1], 50, 2, [0.25, 0.6, 1.5], { worry: 0.8 }), // 9 willow wide: tree, bear, TR + Collier spots, bayou
    V('willow', [0.5, 1.2, 5.6], [0.25, 0.9, -0.5], 40, 4, [0.25, 0.6, -0.15], { worry: 0.8 }), // 10 willow medium: bear tied loosely to the willow
    V('willow', [0.3, 0.85, 2.1], [0.25, 0.75, -0.2], 38, 7, [0.25, 0.75, -0.15], { worry: 1, look: -0.6 }), // 11 bear close: worried
    V('newsroom', [1.0, 1.65, 5.0], [-0.9, 1.45, -3], 52, 2, [-1, 1, -1], { draw: 0.6 }), // 12 newsroom wide: desk rows, window, hanging lamps
    V('newsroom', [1.5, 1.75, 4.6], [3.3, 1.05, 2.0], 46, 4, [3.4, 1.05, 2.2], { draw: 0.5 }), // 13 newsroom medium: cartoonist's drafting table, ink, lamp
    V('newsroom', [0, 0, 0], [0, 0, 0], 34, 7, null, { draw: 1, insert: 'drawing' }), // 14 drawing insert (camera square-on to the paper)
    V('newsroom', [-2.4, 1.95, 3.86], [-2.4, 0.757, 3.62], 46, 7, [-2.4, 0.76, 3.62], { draw: 1 }), // 15 front page insert (top-down)
  ];
  // view 14: square onto the drafting paper, computed from the sheet's world matrix
  { groups.newsroom.updateMatrixWorld(true); const c = new THREE.Vector3(), n = new THREE.Vector3(0, 0, 1); nr.sheet.getWorldPosition(c); n.applyQuaternion(nr.sheet.getWorldQuaternion(new THREE.Quaternion())); const p = c.clone().addScaledVector(n, 1.05); const v = views[14]; v.p = p.toArray(); v.l = c.toArray(); v.focus = 1.05; v.fp = v.l; }
  let BEAR = { worry: -1, look: 9, blink: -1 }, DRAW = -1, FRAME = 0, CUR = null;
  const v3 = new THREE.Vector3(), q = new THREE.Quaternion(), e = new THREE.Euler(), s3 = new THREE.Vector3(), m4 = new THREE.Matrix4();
  const allCards = [...cp.cards, ...wl.cards];
  const API = {
    groups, origin: O, spots, views, bear: wl.bear, sheet: nr.sheet, front: nr.front,
    // the bear card: worry 0..1 (ears droop, brows lift, paws rise to the chest, sweat drop > 0.55), look -1..1 (eyes left/right), blink 0/1
    setBear(o = {}) { const b = { worry: Math.max(0, Math.min(1, o.worry ?? 0.8)), look: Math.max(-1, Math.min(1, o.look ?? 0)), blink: o.blink ? 1 : 0 };
      if (Math.abs(b.worry - BEAR.worry) < 0.01 && Math.abs(b.look - BEAR.look) < 0.02 && b.blink === BEAR.blink) return; BEAR = b; const c = wl.bear.userData.canvas; drawBear(c.getContext('2d'), b); wl.bear.userData.tex.needsUpdate = true; },
    // the drafting-table cartoon inks itself in, t 0..1 (pencil underdrawing visible from the start); pen: show the nib at the stroke tip
    setDrawing(t, o = {}) { t = Math.max(0, Math.min(1, t)); const pen = o.pen ?? (t > 0.001 && t < 0.999); nr.pen.visible = pen;
      if (Math.abs(t - DRAW) > 1e-4) { DRAW = t; const tex = M.draft.map, c = tex.image, g = c.getContext('2d'); API._tip = draftPaperTex(g, c.width, c.height, t); tex.needsUpdate = true; }
      if (pen && API._tip) { const [u, v] = API._tip; v3.set((u - 0.5) * 0.48, (0.5 - v) * 0.6, 0.004); nr.sheet.updateMatrixWorld(true); nr.dtg.updateMatrixWorld(true); const wp = nr.sheet.localToWorld(v3.clone()); nr.dtg.worldToLocal(wp); nr.pen.position.copy(wp); nr.pen.rotation.set(-0.5, 0.3, 0.25); } },
    tick(f) { FRAME = f;
      // swamp: falling leaves, water drift, rays shimmer, mist drift
      sw.lsrc.forEach((L, i) => { const y = 10 - ((L[1] + f * 0.012 * (0.6 + L[3])) % 10), sx = Math.sin(f * 0.05 + L[4]) * 0.4; v3.set(L[0] + sx, y, L[2] + Math.cos(f * 0.04 + L[4]) * 0.2); q.setFromEuler(e.set(f * 0.07 + L[4], f * 0.05 + i, Math.sin(f * 0.1 + i))); s3.setScalar(1); m4.compose(v3, q, s3); sw.leaves.setMatrixAt(i, m4); }); sw.leaves.instanceMatrix.needsUpdate = true;
      M.water.map.offset.set(f * 0.0003, Math.sin(f * 0.01) * 0.003);
      rays.forEach((r) => { r.material.opacity = 0.11 + 0.05 * Math.sin(f * 0.035 + r.userData.ph); });
      mist.forEach((m) => { m.material.map = M.mist.map; m.material.opacity = m.userData.base * (0.85 + 0.15 * Math.sin(f * 0.02 + m.userData.ph)); m.position.x += 0; });
      // camp: flicker, embers, smoke, flag
      cp.flames.forEach((fl, i) => { const k = 1 + 0.18 * Math.sin(f * 0.9 + fl.userData.ph) + 0.1 * Math.sin(f * 2.3 + i); fl.scale.set(fl.userData.s * (0.9 + 0.1 * k), fl.userData.s * k, fl.userData.s * (0.9 + 0.1 * k)); fl.rotation.z = 0.08 * Math.sin(f * 0.6 + i); });
      cp.halo.material.opacity = 0.32 + 0.05 * Math.sin(f * 0.8);
      for (let i = 0; i < 24; i++) { const ph = ((f * 0.012 + i * 0.137) % 1), a = i * 2.4; v3.set(Math.cos(a) * 0.15 + Math.sin(f * 0.05 + i) * 0.1 * ph, 0.3 + ph * 1.8, 0.5 + Math.sin(a) * 0.15); q.identity(); s3.setScalar(ph < 0.9 ? 1 : 0); m4.compose(v3, q, s3); cp.embers.setMatrixAt(i, m4); } cp.embers.instanceMatrix.needsUpdate = true;
      cp.smoke.forEach((s) => { const [sx, sy, sz, sc] = s.userData.src, ph = (s.userData.ph + f * 0.006) % 1; s.position.set(sx + Math.sin(ph * 4 + s.userData.ph * 9) * 0.25 * ph + ph * 0.6 * sc, sy + ph * 3.6 * sc, sz - ph * 0.3); s.scale.setScalar((0.3 + ph * 1.6) * sc); s.material.opacity = 0.32 * Math.sin(Math.PI * Math.min(1, ph * 1.2)) * (sc < 1 ? 0.7 : 1); });
      { const P = cp.flag.geometry.attributes.position, B = cp.flag.userData.base; for (let i = 0; i < P.count; i++) { const x = B[i * 3], y = B[i * 3 + 1]; P.setZ(i, Math.sin(x * 4 - f * 0.18) * 0.09 * (x / 1.45) + Math.sin(y * 3 + f * 0.1) * 0.02 * x); P.setY(i, y - 0.06 * (x / 1.45) ** 2); } P.needsUpdate = true; cp.flag.geometry.computeVertexNormals(); }
      // bear: a little shiver of worry
      wl.bear.scale.set(1 + 0.006 * Math.sin(f * 0.5), 1 + 0.01 * Math.sin(f * 0.21), 1);
    },
    lightFor(name) { const base = name === 'camp' ? 'golden' : name === 'newsroom' ? 'office' : 'day'; return { ...LIGHTS_[base], ...SET_LIGHT[name] }; },
    gradeFor: (name) => ({ ...((SET_GRADE[name] || {}).over || {}) }),
    lookFor: (name) => (SET_GRADE[name] || {}).look || 'office',
    // show one set (or none); hides the base road/stadium/office/car/dc + 1960s rooms when one is shown
    show(world, name) { for (const k in groups) groups[k].visible = k === name; CUR = name;
      if (name) { for (const k of ['road', 'stadium', 'office', 'car', 'dc']) if (world[k]) world[k].visible = false; if (world.rooms) world.rooms.show(world, null); API.tick(FRAME); } },
    // practicals + per-frame camera-facing bits (cards yaw to the camera, smoke faces it, the bear's rope meets the card)
    placeLights(PRACT, name, tgt) { const fl = 1 + 0.12 * Math.sin(FRAME * 0.9) + 0.07 * Math.sin(FRAME * 2.1 + 1);
      PRACT.forEach((l, i) => { const c = (SET_PRACT[name] || [])[i]; l.visible = true; if (!c) { l.intensity = 0; return; } l.position.set(...W3(name, c.p)); l.color.set(c.col); l.intensity = c.I * (c.fire ? fl : 1); l.distance = c.d; l.decay = 1.6; });
      API.face(name); },
    face(name = CUR) { const cam = CAM; if (!cam) return; const L = SET_LIGHT[name] || {}; const tc = new THREE.Color(L.cardTint || '#ffffff').multiplyScalar(0.3);
      for (const m of allCards) { if (!m.parent.visible) continue; m.updateMatrixWorld(); const wp = m.getWorldPosition(v3); m.rotation.y = Math.atan2(cam.position.x - wp.x, cam.position.z - wp.z); m.material.color.copy(tc); }
      if (name === 'camp') cp.smoke.forEach((s) => s.quaternion.copy(cam.quaternion));
      if (name === 'willow') { const b = wl.bear; b.updateMatrixWorld(); const [u, v] = [BEAR_TAIL[0] / BEAR_W, BEAR_TAIL[1] / BEAR_H], lp = new THREE.Vector3((u - 0.5) * 1.05, (1 - v) * 1.225, -0.02);
        const a = wl.bear.parent.worldToLocal(b.localToWorld(lp.clone())), dd = new THREE.Vector2(a.x - wl.trunk[0], a.z - wl.trunk[2]).normalize().multiplyScalar(0.47), t = new THREE.Vector3(wl.trunk[0] + dd.x, wl.trunk[1], wl.trunk[2] + dd.y), mid = a.clone().lerp(t, 0.5); mid.y -= 0.16;
        const key = a.toArray().map((x) => x.toFixed(3)).join(); if (key !== wl.rope.userData.key) { wl.rope.userData.key = key; wl.rope.geometry.dispose(); wl.rope.geometry = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, t), 16, 0.022, 6, false); } } },
    // test-view helper (main.js ?swampview=N; a: view = frame)
    viewFor(i, f = 0) { const k = ((i % views.length) + views.length) % views.length, c = views[k];
      return { i: k, mod: API, set: c.set, f, worry: c.worry ?? 0.8, bearLook: c.look ?? 0, draw: c.draw ?? 1, L: API.lightFor(c.set), look: API.lookFor(c.set), grade: API.gradeFor(c.set), cam: { p: c.p, l: c.l, fov: c.fov, focus: c.focus, cInf: c.cInf, roll: c.roll || 0, shadowAt: c.fp || c.l } }; },
    apply(world, v) { API.show(world, v.set); API.setBear({ worry: v.worry ?? 0.8, look: v.bearLook ?? 0 }); API.setDrawing(v.draw ?? 1, { pen: v.set === 'newsroom' && v.draw < 1 }); API.tick(v.f ?? FRAME); },
  };
  API.view = API.viewFor; API.tick(0); API.setDrawing(1, { pen: false }); API.setBear({ worry: 0.8 });
  return API;
}
