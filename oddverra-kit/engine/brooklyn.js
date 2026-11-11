// brooklyn.js [TEDDY-brooklyn]: 1902-03 Brooklyn sets for "The teddy bear exists because a president refused to shoot a bear".
//   street : a late-November Brooklyn street at blue hour: brick tenements with front fire escapes, cornices, stoops; the candy shop
//            MICHTOM'S CANDY & NOTIONS (striped awning, big lit display window, recessed door); gas lamps, cobbles with trolley rails,
//            trolley wire on span wires, a horse-drawn delivery wagon, ash cans / barrels / crates; setSnow(t) flurries.
//            spots.queue = 10 sidewalk positions lining up from the shop door.                                   origin (3200, 0, -3200)
//   window : the shop display window seen from the sidewalk (same geometry as street): candy jars, chocolates, a central plush
//            teddy bear on a drum pedestal, hand-lettered "Teddy's Bear" card, a pinned newspaper clipping (pictures only);
//            setBears(n) fills the window 1 -> 19 bears. Warm interior glow vs the cold blue street.             origin (3200, 0, -3200)
//   shop   : the candy shop + back-room workshop: counter, jars, scales, register; flip sign CANDY -> TOYS (setSign);
//            sewing table with a treadle machine, fabric bolts, stuffing, thread, scissors, half-finished bears; bear shelves (setBears).
//                                                                                                                origin (3200, 0, -3300)
//   kids   : a warm night nursery: window with moon + rooftops, iron bed, quilt, a teddy bear on the pillow, toys.  origin (3200, 0, -3400)
//   world  : a playful painted Earth globe on a starry sky; tiny teddy bears pop up all over it (setGlobeBears).   origin (3200, 0, -3500)
// Local frame per set: floor y = 0, camera side +z. Geometry through world.js Kit (merged per material, vertex colours).
// No brand logos; the only lettering is the invented shop names and the hand-lettered "Teddy's Bear" card.
import { Kit, rboxGeo, signMat } from './world.js';
import { LIGHTS_ } from './story.js';
import { oddverra } from './oddverra_next.js';

let THREE, toon, mkTex, PT, M;
export const BROOKLYN_ORIGIN = { street: [3200, 0, -3200], shop: [3200, 0, -3300], kids: [3200, 0, -3400], world: [3200, 0, -3500] };
const O = BROOKLYN_ORIGIN, SETS = ['street', 'window', 'shop', 'kids', 'world'], GRP = { street: 'street', window: 'street', shop: 'shop', kids: 'kids', world: 'world' };
const W3 = (name, p) => { const o = O[GRP[name] || name]; return [p[0] + o[0], p[1] + o[1], p[2] + o[2]]; };
const INK = 0x2b1d4a;

// ---------------------------------------------------------------- geometry helpers
const GC = new Map();
const cached = (k, mk) => { let g = GC.get(k); if (!g) GC.set(k, (g = mk())); return g; };
const cyl = (rt, rb, h, rs = 12, open = false) => cached(`c${rt}|${rb}|${h}|${rs}|${open}`, () => new THREE.CylinderGeometry(rt, rb, h, rs, 1, open));
const sph = (r, ws = 14, hs = 10) => cached(`s${r}|${ws}|${hs}`, () => new THREE.SphereGeometry(r, ws, hs));
const tor = (r, t, rs = 6, ts = 24, arc = Math.PI * 2) => cached(`t${r}|${t}|${rs}|${ts}|${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));
const plane = (w, h) => cached(`p${w}|${h}`, () => new THREE.PlaneGeometry(w, h));
const cone = (r, h, rs = 12) => cached(`k${r}|${h}|${rs}`, () => new THREE.ConeGeometry(r, h, rs));
const lathe = (key, pts, n = 20) => cached('la' + key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n));
const drape = (w, h, n = 5, a = 0.06) => cached(`dr${w}|${h}|${n}|${a}`, () => { const g = new THREE.PlaneGeometry(w, h, 24, 6); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), t = (h / 2 - y) / h; p.setZ(i, a * Math.sin(x / w * Math.PI * 2 * n) * (0.4 + 0.6 * t)); } g.translate(0, -h / 2, 0); g.computeVertexNormals(); return g; });
const mesh = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz, 'YXZ'); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
const buildK = (K, parent, cast = true) => { const n0 = parent.children.length; K.build(parent, 0); if (!cast) for (let i = n0; i < parent.children.length; i++) parent.children[i].castShadow = false; };
const xcyl = (K, mat, r, x0, x1, y, z, c, rs = 10) => K.put(mat, cyl(r, r, Math.abs(x1 - x0), rs), (x0 + x1) / 2, y, z, 0, 0, Math.PI / 2, 1, 1, 1, c);
const zcyl = (K, mat, r, x, y, z0, z1, c, rs = 10) => K.put(mat, cyl(r, r, Math.abs(z1 - z0), rs), x, y, (z0 + z1) / 2, Math.PI / 2, 0, 0, 1, 1, 1, c);
const R1 = (k) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------------------------------------------------------------- painters
const css = (...a) => PT.css(...a), shade = (...a) => PT.shade(...a), tint = (...a) => PT.tint(...a), vary = (...a) => PT.vary(...a), rng = (s) => PT.rng(s);
const modulate = (...a) => PT.modulate(...a), fbm = (...a) => PT.fbm(...a);
function flagTex(g, w, h) { // bluestone sidewalk flags
  g.fillStyle = '#4a4a58'; g.fillRect(0, 0, w, h); const R = rng(5), n = 3, s = w / n;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const c = vary([132, 136, 150], (R() - 0.5) * 0.18); g.fillStyle = css(c); g.fillRect(i * s + 3, j * s + 3, s - 6, s - 6); g.fillStyle = css(tint(c, 1.1), 0.5); g.fillRect(i * s + 4, j * s + 4, s - 8, 3);
    for (let k = 0; k < 40; k++) { g.fillStyle = css(shade(c, 0.85), 0.25); g.fillRect(i * s + R() * s, j * s + R() * s, 2 + R() * 5, 2); } }
  modulate(g, w, h, (u, v) => 0.9 + 0.14 * fbm(u, v, 3, 3, 3, 9));
}
function paneTex(g, w, h, lit, seed = 1) { // sash window panes (2 over 2) with lace curtains; lit = warm room behind
  const R = rng(seed), gr = g.createLinearGradient(0, 0, w, h);
  if (lit) { gr.addColorStop(0, '#ffd890'); gr.addColorStop(1, '#e89a50'); } else { gr.addColorStop(0, '#3a4a78'); gr.addColorStop(0.55, '#232a4a'); gr.addColorStop(1, '#2e3458'); }
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  if (!lit) { g.fillStyle = 'rgba(160,180,240,0.22)'; g.beginPath(); g.moveTo(w * 0.1, 0); g.lineTo(w * 0.35, 0); g.lineTo(w * 0.05, h * 0.5); g.lineTo(0, h * 0.4); g.fill(); }
  else { g.fillStyle = 'rgba(120,60,40,0.35)'; g.fillRect(w * 0.3, h * 0.55, w * 0.4, h * 0.3); }
  const cc = lit ? 'rgba(255,248,230,0.75)' : 'rgba(210,214,236,0.55)', cw = w * (0.18 + R() * 0.12);
  for (const s of [0, 1]) { g.fillStyle = cc; g.beginPath(); const x0 = s ? w - cw : 0, x1 = s ? w : cw; g.moveTo(x0, 0); g.lineTo(x1, 0); g.quadraticCurveTo(s ? x0 - 6 : x1 + 6, h * 0.55, s ? x0 + cw * 0.3 : x1 - cw * 0.3, h); g.lineTo(s ? w : 0, h); g.fill();
    g.strokeStyle = lit ? 'rgba(200,140,90,0.4)' : 'rgba(120,120,170,0.4)'; g.lineWidth = 1.5; for (let k = 1; k < 4; k++) { g.beginPath(); const xx = x0 + (x1 - x0) * k / 4; g.moveTo(xx, 0); g.lineTo(xx + (s ? -4 : 4), h); g.stroke(); } }
  if (R() < 0.5) { g.fillStyle = lit ? 'rgba(255,240,210,0.5)' : 'rgba(200,190,220,0.45)'; g.fillRect(0, 0, w, h * 0.12); }
}
function plushTex(g, w, h) { // mohair plush: soft fur strokes on near-white (tinted per part)
  g.fillStyle = '#f2ece4'; g.fillRect(0, 0, w, h); const R = rng(77);
  for (let i = 0; i < 1600; i++) { const x = R() * w, y = R() * h, a = R() * 0.6 - 0.3 + Math.PI / 2, l = 3 + R() * 6; g.strokeStyle = R() < 0.5 ? 'rgba(90,60,70,0.16)' : 'rgba(255,255,255,0.35)'; g.lineWidth = 1 + R(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  modulate(g, w, h, (u, v) => 0.92 + 0.12 * fbm(u, v, 5, 5, 3, 13));
}
function clipTex(g, w, h) { // pinned newspaper clipping: no legible text, an original sketch of a man in a hat waving off a worried little bear
  g.fillStyle = '#ece2c8'; g.fillRect(0, 0, w, h); const R = rng(31);
  g.fillStyle = 'rgba(120,100,70,0.12)'; for (let i = 0; i < 30; i++) g.fillRect(R() * w, R() * h, 30 + R() * 60, 2);
  g.fillStyle = '#3a3040'; g.fillRect(w * 0.1, h * 0.05, w * 0.8, h * 0.035); // masthead bar (no letters)
  for (let r = 0; r < 3; r++) for (let x = w * 0.1; x < w * 0.88; x += 14 + R() * 26) { g.fillStyle = 'rgba(50,40,60,0.75)'; g.fillRect(x, h * (0.11 + r * 0.03), 8 + R() * 18, h * 0.012); }
  // framed drawing
  const fx = w * 0.1, fy = h * 0.22, fw = w * 0.8, fh = h * 0.5; g.strokeStyle = '#2b1d4a'; g.lineWidth = 3; g.strokeRect(fx, fy, fw, fh); g.lineWidth = 2.2; g.lineCap = 'round';
  // ground line + willow
  g.beginPath(); g.moveTo(fx + 6, fy + fh * 0.85); g.bezierCurveTo(fx + fw * 0.3, fy + fh * 0.8, fx + fw * 0.6, fy + fh * 0.9, fx + fw - 6, fy + fh * 0.84); g.stroke();
  g.beginPath(); g.moveTo(fx + fw * 0.8, fy + fh * 0.85); g.lineTo(fx + fw * 0.78, fy + fh * 0.15); g.stroke(); for (let k = 0; k < 7; k++) { g.beginPath(); const x0 = fx + fw * 0.78, y0 = fy + fh * (0.15 + k * 0.04); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + (k % 2 ? 30 : -30), y0 + 5, x0 + (k % 2 ? 36 : -38), y0 + 50); g.stroke(); }
  // little bear sitting by the tree, big worried eyes
  const bx = fx + fw * 0.68, by = fy + fh * 0.72; g.fillStyle = '#ece2c8'; g.beginPath(); g.ellipse(bx, by, 22, 26, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(bx, by - 34, 16, 0, 7); g.fill(); g.stroke();
  for (const s of [-1, 1]) { g.beginPath(); g.arc(bx + s * 12, by - 47, 6, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#2b1d4a'; g.beginPath(); g.arc(bx + s * 6, by - 36, 2.5, 0, 7); g.fill(); g.fillStyle = '#ece2c8'; }
  g.beginPath(); g.arc(bx, by - 28, 3, 0, 7); g.fillStyle = '#2b1d4a'; g.fill();
  // man in a hat, arm out, palm raised ("no")
  const mx = fx + fw * 0.3, my = fy + fh * 0.84; g.strokeStyle = '#2b1d4a'; g.fillStyle = '#ece2c8';
  g.beginPath(); g.moveTo(mx - 12, my); g.lineTo(mx - 6, my - 50); g.lineTo(mx + 6, my - 50); g.lineTo(mx + 12, my); g.stroke(); // legs
  g.beginPath(); g.ellipse(mx, my - 78, 22, 32, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(mx, my - 122, 15, 0, 7); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(mx - 26, my - 136); g.lineTo(mx + 26, my - 136); g.stroke(); g.beginPath(); g.moveTo(mx - 14, my - 136); g.quadraticCurveTo(mx, my - 156, mx + 14, my - 136); g.stroke();
  g.beginPath(); g.moveTo(mx + 18, my - 92); g.lineTo(mx + 52, my - 104); g.stroke(); g.beginPath(); g.ellipse(mx + 58, my - 108, 7, 10, 0.3, 0, 7); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(mx - 8, my - 117); g.quadraticCurveTo(mx, my - 112, mx + 8, my - 117); g.stroke(); // moustache
  for (let r = 0; r < 6; r++) for (let x = w * 0.1; x < w * 0.88; x += 14 + R() * 26) { g.fillStyle = 'rgba(50,40,60,0.6)'; g.fillRect(x, h * (0.76 + r * 0.035), 8 + R() * 18, h * 0.01); }
  g.strokeStyle = 'rgba(120,90,50,0.5)'; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4);
  modulate(g, w, h, (u, v) => 0.9 + 0.12 * fbm(u, v, 4, 4, 3, 41));
}
function cardTex(g, w, h) { // the hand-lettered "Teddy's Bear" card
  g.fillStyle = '#f6ecd2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b8323a'; g.lineWidth = 10; g.strokeRect(14, 14, w - 28, h - 28); g.lineWidth = 3; g.strokeRect(30, 30, w - 60, h - 60);
  for (const [x, y] of [[44, 44], [w - 44, 44], [44, h - 44], [w - 44, h - 44]]) { g.fillStyle = '#b8323a'; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); }
  const txt = "Teddy's Bear", R = rng(7); g.fillStyle = '#2b1d4a'; g.textBaseline = 'middle';
  g.font = `italic bold ${h * 0.34 | 0}px "DejaVu Serif", serif`; const tw = g.measureText(txt).width, sc = Math.min(1, (w - 110) / tw); let x = (w - tw * sc) / 2;
  g.save(); g.translate(0, h * 0.5); g.scale(sc, 1); x /= sc;
  for (const ch of txt) { const cw = g.measureText(ch).width; g.save(); g.translate(x + cw / 2, (R() - 0.5) * h * 0.04); g.rotate((R() - 0.5) * 0.12); g.fillText(ch, -cw / 2, 0); g.restore(); x += cw; }
  g.restore(); g.strokeStyle = '#b8323a'; g.lineWidth = 4; g.beginPath(); g.moveTo(w * 0.2, h * 0.76); g.bezierCurveTo(w * 0.4, h * 0.71, w * 0.6, h * 0.81, w * 0.8, h * 0.74); g.stroke();
  modulate(g, w, h, (u, v) => 0.94 + 0.07 * fbm(u, v, 4, 4, 2, 47));
}
function wallpaperTex(g, w, h, o = {}) { // striped wallpaper with small sprigs (shop) or stars + moons (nursery)
  g.fillStyle = o.base || '#f0e2c4'; g.fillRect(0, 0, w, h); const n = 6, s = w / n;
  for (let i = 0; i < n; i++) { g.fillStyle = o.stripe || 'rgba(170,70,60,0.35)'; g.fillRect(i * s + s * 0.42, 0, s * 0.16, h); }
  for (let j = 0; j < 6; j++) for (let i = 0; i < n; i++) { const x = i * s + s * 0.0 + ((j % 2) * s * 0.5), y = j * h / 6 + h / 12;
    if (o.stars) { g.fillStyle = o.motif || '#f4e0a0'; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 4 : 10; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.fill(); }
    else { g.fillStyle = o.motif || 'rgba(90,120,70,0.6)'; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(x + (k - 1) * 6, y + Math.abs(k - 1) * 4, 3, 6, (k - 1) * 0.6, 0, 7); g.fill(); } g.fillStyle = 'rgba(190,80,80,0.6)'; g.beginPath(); g.arc(x, y - 6, 3.5, 0, 7); g.fill(); } }
  modulate(g, w, h, (u, v) => 0.93 + 0.08 * fbm(u, v, 3, 3, 3, 51));
}
function tinTex(g, w, h) { // pressed-tin ceiling tiles
  g.fillStyle = '#e8e0d0'; g.fillRect(0, 0, w, h); const n = 4, s = w / n;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x = i * s, y = j * s; g.strokeStyle = 'rgba(80,60,90,0.35)'; g.lineWidth = 3; g.strokeRect(x + 4, y + 4, s - 8, s - 8);
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x + 6, y + 6, s - 12, 3); g.strokeStyle = 'rgba(80,60,90,0.3)'; g.lineWidth = 2; g.beginPath(); g.arc(x + s / 2, y + s / 2, s * 0.22, 0, 7); g.stroke(); g.beginPath(); g.arc(x + s / 2, y + s / 2, s * 0.08, 0, 7); g.stroke();
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; g.beginPath(); g.ellipse(x + s / 2 + Math.cos(a) * s * 0.33, y + s / 2 + Math.sin(a) * s * 0.33, 6, 12, a, 0, 7); g.stroke(); } }
}
function quiltTex(g, w, h) { // patchwork quilt
  const cols = ['#c84a4a', '#f2e2c0', '#4a7ab8', '#e8b84a', '#7aa86a', '#f0d8c8', '#9a6ab0'], n = 6, s = w / n, R = rng(61);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { g.fillStyle = cols[(i * 3 + j * 5 + (R() * 2 | 0)) % cols.length]; g.fillRect(i * s, j * s, s, s);
    if ((i + j) % 3 === 0) { g.fillStyle = 'rgba(255,250,240,0.55)'; for (let a = 0; a < 4; a++) { g.beginPath(); g.arc(i * s + s / 2 + Math.cos(a * 1.57) * s * 0.18, j * s + s / 2 + Math.sin(a * 1.57) * s * 0.18, s * 0.12, 0, 7); g.fill(); } }
    else if ((i + j) % 3 === 1) { g.fillStyle = 'rgba(43,29,74,0.18)'; for (let k = 0; k < 4; k++) g.fillRect(i * s, j * s + k * s / 4, s, s / 8); } }
  g.strokeStyle = 'rgba(255,250,235,0.85)'; g.lineWidth = 2; g.setLineDash([5, 4]); for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); } g.setLineDash([]);
  modulate(g, w, h, (u, v) => 0.92 + 0.1 * fbm(u, v, 3, 3, 3, 67));
}
function rugTex(g, w, h, o = {}) { // braided oval rag rug
  g.clearRect(0, 0, w, h); const cols = o.cols || ['#8a3a3a', '#c8a060', '#4a5a8a', '#e8d8b0', '#6a8a5a'];
  for (let k = 0; k < 16; k++) { const t = 1 - k / 16; g.fillStyle = cols[k % cols.length]; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 * t, h / 2 * t, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(43,29,74,0.25)'; g.lineWidth = 2; g.stroke(); }
  modulate(g, w, h, (u, v) => 0.9 + 0.12 * fbm(u, v, 6, 6, 2, 71));
}
function moonViewTex(g, w, h) { // nursery window view: night sky, big moon, stars, Brooklyn rooftops + a water tank
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#141a4a'); gr.addColorStop(0.7, '#2e3a7a'); gr.addColorStop(1, '#4a4a8a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const R = rng(83); for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,250,230,${0.4 + R() * 0.6})`; const s = R() < 0.1 ? 3 : 1.5; g.fillRect(R() * w, R() * h * 0.7, s, s); }
  const mx = w * 0.62, my = h * 0.26, mr = w * 0.13; const hg = g.createRadialGradient(mx, my, mr, mx, my, mr * 3); hg.addColorStop(0, 'rgba(230,236,255,0.5)'); hg.addColorStop(1, 'rgba(230,236,255,0)'); g.fillStyle = hg; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fbf6e2'; g.beginPath(); g.arc(mx, my, mr, 0, 7); g.fill(); g.fillStyle = 'rgba(200,190,170,0.5)'; for (const [a, b, r] of [[-0.3, -0.2, 0.22], [0.25, 0.1, 0.18], [-0.1, 0.35, 0.14]]) { g.beginPath(); g.arc(mx + a * mr, my + b * mr, r * mr, 0, 7); g.fill(); }
  g.fillStyle = '#1a1838'; let x = 0; while (x < w) { const bw = 40 + R() * 70, bh = h * (0.18 + R() * 0.16); g.fillRect(x, h - bh, bw + 1, bh); if (R() < 0.5) g.fillRect(x + bw * 0.3, h - bh - 14, 10, 14);
    for (let k = 0; k < 4; k++) if (R() < 0.35) { g.fillStyle = '#ffc870'; g.fillRect(x + 6 + R() * (bw - 16), h - bh + 10 + R() * (bh - 30), 6, 9); g.fillStyle = '#1a1838'; } x += bw; }
  g.fillStyle = '#1a1838'; g.fillRect(w * 0.18, h * 0.62, 34, 30); g.beginPath(); g.moveTo(w * 0.18 - 3, h * 0.62); g.lineTo(w * 0.18 + 17, h * 0.58); g.lineTo(w * 0.18 + 37, h * 0.62); g.fill(); for (const dx of [4, 28]) g.fillRect(w * 0.18 + dx, h * 0.66, 3, h * 0.1);
}
function backViewTex(g, w, h) { // shop back window: dusky alley, brick wall opposite, a lit window, snow on a sill
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a4a8a'); gr.addColorStop(1, '#232a50'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a3040'; g.fillRect(0, h * 0.18, w, h); g.fillStyle = 'rgba(30,20,40,0.5)'; for (let y = h * 0.18; y < h; y += 10) g.fillRect(0, y, w, 2);
  g.fillStyle = '#ffcf80'; g.fillRect(w * 0.55, h * 0.4, w * 0.22, h * 0.3); g.fillStyle = '#4a3040'; g.fillRect(w * 0.655, h * 0.4, 4, h * 0.3); g.fillStyle = '#e8ecf8'; g.fillRect(w * 0.53, h * 0.7, w * 0.26, 6);
  g.strokeStyle = '#1a1428'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, h * 0.3); g.quadraticCurveTo(w * 0.5, h * 0.38, w, h * 0.28); g.stroke(); // clothesline
  for (let k = 0; k < 3; k++) { g.fillStyle = ['#e8e0d0', '#a8b8d8', '#d8a8a0'][k]; g.fillRect(w * (0.15 + k * 0.2), h * (0.33 + k * 0.01), w * 0.1, h * 0.12); }
}
function earthTex(g, w, h) { // stylized painted Earth, equirectangular (u: lon -180..180, v: lat 90..-90)
  const P = (lon, lat) => [(lon + 180) / 360 * w, (90 - lat) / 180 * h];
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a7ad0'); gr.addColorStop(0.5, '#2a68c8'); gr.addColorStop(1, '#3a7ad0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const R = rng(91); for (let i = 0; i < 260; i++) { const x = R() * w, y = R() * h; g.strokeStyle = 'rgba(160,210,255,0.28)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 9, y - 5, x + 18, y); g.quadraticCurveTo(x + 27, y + 5, x + 36, y); g.stroke(); }
  const LAND = {
    nam: [[-168, 66], [-160, 71], [-140, 70], [-125, 72], [-95, 73], [-80, 73], [-65, 62], [-60, 55], [-53, 47], [-66, 44], [-70, 41], [-76, 35], [-81, 31], [-80, 25], [-82, 28], [-84, 30], [-90, 29], [-97, 26], [-97, 21], [-92, 18], [-88, 21], [-87, 16], [-83, 10], [-79, 9], [-78, 7], [-82, 8], [-86, 12], [-92, 14], [-105, 20], [-110, 24], [-112, 30], [-115, 30], [-117, 33], [-124, 40], [-124, 48], [-130, 55], [-140, 60], [-150, 60], [-158, 57], [-165, 60]],
    grl: [[-50, 60], [-42, 60], [-20, 70], [-18, 80], [-35, 83], [-60, 82], [-70, 77], [-55, 68]],
    sam: [[-78, 8], [-72, 12], [-62, 10], [-52, 5], [-35, -5], [-38, -12], [-40, -22], [-48, -26], [-53, -34], [-58, -38], [-65, -42], [-66, -50], [-69, -55], [-74, -52], [-74, -40], [-71, -30], [-70, -18], [-76, -14], [-81, -6], [-80, 0]],
    eur: [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 54], [10, 58], [5, 62], [15, 69], [28, 71], [40, 67], [60, 69], [70, 73], [80, 73], [100, 78], [115, 74], [140, 72], [160, 70], [180, 68], [180, 64], [163, 60], [156, 51], [142, 53], [137, 46], [130, 42], [127, 38], [126, 35], [121, 31], [122, 25], [110, 20], [106, 10], [100, 13], [103, 2], [98, 8], [95, 16], [90, 22], [80, 15], [77, 8], [72, 20], [66, 25], [57, 25], [52, 27], [48, 30], [56, 24], [59, 22], [52, 16], [44, 12], [38, 20], [35, 28], [34, 31], [35, 36], [28, 37], [26, 40], [23, 38], [20, 40], [18, 40], [15, 38], [12, 44], [8, 44], [3, 43], [0, 39], [-6, 36]],
    afr: [[-17, 21], [-16, 28], [-10, 30], [-6, 35], [10, 37], [11, 33], [20, 31], [32, 31], [34, 28], [39, 22], [43, 12], [51, 12], [48, 4], [40, -3], [40, -10], [40, -16], [35, -24], [32, -29], [27, -34], [20, -35], [18, -32], [15, -27], [12, -18], [13, -10], [9, -1], [9, 4], [5, 5], [-4, 5], [-8, 4], [-13, 8], [-17, 14]],
    mad: [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]], uk: [[-5, 50], [1, 51], [0, 54], [-2, 57], [-5, 58], [-6, 56], [-3, 54], [-5, 52]], irl: [[-10, 52], [-6, 52], [-6, 55], [-10, 54]],
    jap: [[130, 31], [135, 34], [140, 35], [142, 40], [141, 45], [140, 42], [136, 36], [130, 34]], aus: [[114, -22], [122, -18], [130, -12], [137, -12], [137, -16], [142, -11], [146, -18], [153, -25], [150, -37], [141, -38], [135, -35], [129, -32], [115, -34], [113, -26]],
    bor: [[109, 1], [117, 7], [119, 1], [116, -4], [110, -3]], sum: [[95, 5], [106, -6], [103, -5], [98, 0]], nz: [[172, -34], [178, -38], [174, -41], [167, -46], [171, -44]],
    ant: [[-180, -70], [-120, -73], [-60, -64], [0, -70], [60, -67], [120, -66], [180, -70], [180, -90], [-180, -90]],
  };
  const path = (pts) => { g.beginPath(); pts.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); };
  g.lineJoin = 'round'; for (const k in LAND) { path(LAND[k]); g.strokeStyle = 'rgba(140,220,230,0.55)'; g.lineWidth = 22; g.stroke(); }
  for (const k in LAND) { path(LAND[k]); g.fillStyle = k === 'ant' || k === 'grl' ? '#f4f6ff' : '#6ab45a'; g.fill(); }
  g.save(); for (const k in LAND) { if (k === 'ant' || k === 'grl') continue; path(LAND[k]); g.save(); g.clip();
    for (let i = 0; i < 200; i++) { const x = R() * w, y = R() * h; g.fillStyle = `rgba(${R() < 0.5 ? '70,140,60' : '150,200,100'},0.35)`; g.beginPath(); g.arc(x, y, 6 + R() * 20, 0, 7); g.fill(); }
    for (const [lo, la, rx, ry] of [[15, 23, 28, 9], [45, 23, 10, 7], [132, -25, 12, 7], [-112, 36, 7, 6], [90, 42, 18, 6], [-70, -25, 4, 10], [20, -22, 8, 5]]) { const [x, y] = P(lo, la); g.fillStyle = 'rgba(232,200,120,0.85)'; g.beginPath(); g.ellipse(x, y, rx / 360 * w, ry / 180 * h, 0, 0, 7); g.fill(); }
    for (const [lo, la] of [[-110, 45], [-115, 52], [-72, -20], [-70, -35], [85, 30], [95, 32], [10, 46], [40, 42], [60, 55], [100, 52], [37, -5]]) { const [x, y] = P(lo, la); for (let k = 0; k < 3; k++) { g.fillStyle = '#8a7a5a'; g.beginPath(); g.moveTo(x + k * 14 - 9, y + 8); g.lineTo(x + k * 14, y - 8); g.lineTo(x + k * 14 + 9, y + 8); g.fill(); g.fillStyle = '#f4f2ea'; g.beginPath(); g.moveTo(x + k * 14 - 3, y - 2); g.lineTo(x + k * 14, y - 8); g.lineTo(x + k * 14 + 3, y - 2); g.fill(); } }
    g.restore(); } g.restore();
  for (const k in LAND) { path(LAND[k]); g.strokeStyle = 'rgba(43,29,74,0.75)'; g.lineWidth = 3; g.stroke(); }
  g.fillStyle = 'rgba(244,246,255,0.95)'; g.fillRect(0, 0, w, h * 0.035);
  modulate(g, w, h, (u, v) => 0.94 + 0.08 * fbm(u, v, 8, 4, 3, 93));
}
function softTex(g, w, h) { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
function flakeTex(g, w, h) { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
function sparkleTex(g, w, h) { g.clearRect(0, 0, w, h); softTex(g, w, h); g.globalCompositeOperation = 'destination-in'; g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over';
  g.fillStyle = 'rgba(255,255,255,1)'; g.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, r = k % 2 ? w * 0.06 : w * 0.48; g.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } g.fill(); }
function nebulaTex(g, w, h) { g.clearRect(0, 0, w, h); const R = rng(101); for (let i = 0; i < 40; i++) { const x = w * (0.2 + R() * 0.6), y = h * (0.2 + R() * 0.6), r = w * (0.08 + R() * 0.18), gr = g.createRadialGradient(x, y, 0, x, y, r), c = [[150, 90, 220], [90, 110, 230], [230, 120, 190]][i % 3];
  gr.addColorStop(0, `rgba(${c},0.22)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(0, 0, w, h); } }
function patternTex(g, w, h) { // brown-paper sewing pattern pieces with dashed seam lines
  g.clearRect(0, 0, w, h); g.fillStyle = '#d8b882'; g.strokeStyle = '#2b1d4a'; g.lineWidth = 3;
  const shape = (fn) => { g.beginPath(); fn(); g.fill(); g.stroke(); g.save(); g.setLineDash([6, 5]); g.strokeStyle = 'rgba(160,50,50,0.8)'; g.lineWidth = 2; g.scale(1, 1); g.stroke(); g.restore(); };
  shape(() => g.ellipse(w * 0.3, h * 0.55, w * 0.22, h * 0.36, 0, 0, 7)); shape(() => g.arc(w * 0.72, h * 0.3, w * 0.17, 0, 7)); shape(() => g.ellipse(w * 0.75, h * 0.75, w * 0.18, h * 0.12, 0.4, 0, 7));
}
function blockTex(g, w, h, k) { // toy block faces: simple pictures, no letters
  const cols = ['#e05a4a', '#4a8ad8', '#f0c040', '#5ab06a'], c = cols[k % 4]; g.fillStyle = '#f4ead4'; g.fillRect(0, 0, w, h); g.strokeStyle = c; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = c;
  if (k % 4 === 0) { g.beginPath(); g.arc(w / 2, h / 2, w * 0.24, 0, 7); g.fill(); } else if (k % 4 === 1) { g.beginPath(); g.moveTo(w / 2, h * 0.22); g.lineTo(w * 0.78, h * 0.76); g.lineTo(w * 0.22, h * 0.76); g.fill(); }
  else if (k % 4 === 2) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? w * 0.12 : w * 0.3; g.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } g.fill(); } else { g.fillRect(w * 0.26, h * 0.26, w * 0.48, h * 0.48); }
}
function glassTex(g, w, h) { // display-window glass: faint diagonal reflection streaks
  g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.015)'; g.fillRect(0, 0, w, h);
  for (const [x, ww, a] of [[0.12, 0.08, 0.13], [0.24, 0.03, 0.1], [0.62, 0.12, 0.08], [0.8, 0.04, 0.11]]) { g.fillStyle = `rgba(200,215,255,${a})`; g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * (x + ww), 0); g.lineTo(w * (x + ww - 0.25), h); g.lineTo(w * (x - 0.25), h); g.fill(); }
}

function materials() {
  const vc = (o = {}) => toon({ vertexColors: true, ...o }), T = (w, h, fn, rep) => mkTex(w, h, fn, rep), m = {};
  m.paint = vc(); m.metal = vc(); m.brass = vc({ emissive: 0x2a1a00 }); m.iron = vc();
  m.brickRed = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#a84a3a', seed: 3 })) });
  m.brickBrown = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#7a4a3c', seed: 5 })) });
  m.brickBuff = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#c8945e', seed: 7 })) });
  m.brickDark = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#5e3438', seed: 9 })) });
  m.brownstone = vc({ map: T(512, 512, (g, w, h) => PT.stone(g, w, h, { base: '#8a5a48', n: 3, seed: 11 })) });
  m.cobble = vc({ map: T(512, 512, (g, w, h) => PT.stone(g, w, h, { base: '#8a8696', n: 8, seed: 13 })) });
  m.flags = vc({ map: T(512, 512, flagTex) });
  m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#b08a62', n: 6, seed: 33 })) });
  m.woodDark = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#6a4434', n: 4, seed: 35, joints: 0 })) });
  m.floor = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#9a6a44', n: 8, seed: 37 })) });
  m.fabric = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#ffffff' })) });
  m.awning = toon({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#f2ead8', stripes: '#c8423a', nStripes: 10, folds: 0 }), [3, 1]), side: THREE.DoubleSide });
  m.plush = vc({ map: T(256, 256, plushTex) });
  m.paneDark = [1, 2, 3].map((s) => toon({ map: T(128, 192, (g, w, h) => paneTex(g, w, h, false, s)), emissive: 0x0c1028 }));
  m.paneLit = [1, 2].map((s) => new THREE.MeshBasicMaterial({ map: T(128, 192, (g, w, h) => paneTex(g, w, h, true, s)), color: new THREE.Color(1.25, 1.15, 1.0) }));
  m.glass = new THREE.MeshBasicMaterial({ map: T(256, 256, glassTex), transparent: true, opacity: 1, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  m.jar = new THREE.MeshBasicMaterial({ color: 0x9ab0d0, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  m.glowWarm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc477).multiplyScalar(2.6), fog: false });
  m.glowSoft = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd8a0).multiplyScalar(1.5), fog: false });
  m.clip = toon({ map: T(256, 384, clipTex), emissive: 0x1a1408 });
  m.card = toon({ map: T(512, 256, cardTex), emissive: 0x2a2010 });
  m.wallShop = vc({ map: T(512, 512, (g, w, h) => wallpaperTex(g, w, h)) });
  m.wallKids = vc({ map: T(512, 512, (g, w, h) => wallpaperTex(g, w, h, { base: '#8a98cc', stripe: 'rgba(255,255,255,0.22)', stars: 1, motif: '#f6e6a8' })) });
  m.tin = vc({ map: T(256, 256, tinTex) });
  m.quilt = vc({ map: T(512, 512, quiltTex) });
  m.rug = toon({ map: T(512, 320, (g, w, h) => rugTex(g, w, h)), alphaTest: 0.5 });
  m.rugK = toon({ map: T(512, 320, (g, w, h) => rugTex(g, w, h, { cols: ['#c86a6a', '#f2e2c0', '#6a8ac8', '#e8c870'] })), alphaTest: 0.5 });
  m.moonView = new THREE.MeshBasicMaterial({ map: T(512, 512, moonViewTex), fog: false, color: new THREE.Color(0.85, 0.85, 0.9) });
  m.backView = new THREE.MeshBasicMaterial({ map: T(256, 256, backViewTex), fog: false, color: new THREE.Color(0.9, 0.9, 1.0) });
  m.earth = toon({ map: T(2048, 1024, earthTex), emissive: 0x0a1030 });
  m.pattern = toon({ map: T(256, 256, patternTex), alphaTest: 0.5, side: THREE.DoubleSide });
  m.blocks = [0, 1, 2, 3].map((k) => toon({ map: T(128, 128, (g, w, h) => blockTex(g, w, h, k)) }));
  const soft = T(128, 128, softTex);
  m.flake = new THREE.MeshBasicMaterial({ map: T(64, 64, flakeTex), color: 0xf4f6ff, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide });
  m.halo = new THREE.MeshBasicMaterial({ map: soft, color: 0xffc070, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
  m.haloBlue = new THREE.MeshBasicMaterial({ map: soft, color: 0x7aa0ff, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
  m.beam = new THREE.MeshBasicMaterial({ color: 0xa8b8ff, transparent: true, opacity: 0.06, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  m.sparkle = new THREE.MeshBasicMaterial({ map: T(64, 64, sparkleTex), color: 0xfff4d8, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  m.nebula = new THREE.MeshBasicMaterial({ map: T(512, 512, nebulaTex), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  m.cloud = vc();
  return m;
}
const NOINK = new Set();
const noink = (m) => { NOINK.add(m); m.castShadow = false; m.receiveShadow = false; return m; };
function sign(K, text, bg, fg, w, h, x, y, z, ry = 0, o = {}) { const mt = signMat(text, bg, fg, { w: 1024, h: Math.max(96, Math.round(1024 * h / w)), fs: o.fs || 0.56 });
  K.at(x, y, z, ry, () => { K.box(M.woodDark, -w / 2 - 0.05, w / 2 + 0.05, -h / 2 - 0.05, h / 2 + 0.05, -0.06, -0.005, o.frame || 0x4a3a2a, 0.012); K.put(mt, plane(w, h), 0, 0, 0.002); }); }

// ================================================================= the teddy bear prop (unit height ~1, sitting, faces +z)
const BEAR = { fur: 0x9a6234, light: 0xe2b886, dark: 0x2a1a22, ribbon: 0xc8302c };
function bear(K, o = {}) {
  const fur = o.fur ?? BEAR.fur, lt = o.light ?? BEAR.light, rib = o.ribbon ?? BEAR.ribbon, P = M.plush, part = o.part || 'all';
  const body = part === 'all' || part === 'body', head = part === 'all' || part === 'head';
  if (body) {
    K.put(P, sph(0.25, 16, 12), 0, 0.33, 0, 0, 0, 0, 1, 1.18, 0.9, fur);                                   // body
    K.put(P, sph(0.2, 14, 10), 0, 0.31, 0.09, 0, 0, 0, 0.85, 1.0, 0.6, lt);                                // tummy patch
    for (const s of [-1, 1]) {
      K.put(P, sph(0.085, 12, 8), s * 0.13, 0.1, 0.16, 0, 0, 0, 1, 0.95, 2.0, fur);                         // leg (forward)
      K.put(P, sph(0.07, 12, 8), s * 0.13, 0.1, 0.33, 0, 0, 0, 1, 1, 0.35, lt);                               // foot pad
      if (o.arms !== false && !(o.oneArm && s > 0)) {
        K.put(M.paint, cyl(0.055, 0.055, 0.02, 10), s * 0.215, 0.47, 0.03, 0, 0, Math.PI / 2, 1, 1, 1, shadeC(fur, 0.7)); // disc joint
        K.at(s * 0.225, 0.43, 0.07, 0, () => { K.put(P, sph(0.068, 12, 8), 0, -0.06, 0.02, -0.5, 0, s * 0.42, 1, 2.0, 1, fur); K.put(P, sph(0.05, 10, 6), s * 0.05, -0.17, 0.08, -0.5, 0, s * 0.42, 1, 0.7, 0.6, lt); });
      }
      K.put(M.paint, sph(0.012, 6, 4), s * 0.13, 0.12, 0.345, 0, 0, 0, 1, 1, 0.5, shadeC(lt, 0.6));           // claw stitch dot
    }
  }
  if (head) {
    const hy = part === 'head' ? 0.2 : 0.72;
    K.put(P, sph(0.2, 16, 12), 0, hy, 0, 0, 0, 0, 1.05, 0.95, 0.95, fur);                                    // head
    K.put(P, sph(0.09, 12, 10), 0, hy - 0.05, 0.16, 0, 0, 0, 1.15, 0.8, 0.9, lt);                            // muzzle
    K.put(M.paint, sph(0.034, 10, 6), 0, hy - 0.015, 0.245, 0, 0, 0, 1.35, 0.85, 0.8, BEAR.dark);              // nose
    K.beam(M.paint, [0, hy - 0.04, 0.248], [0, hy - 0.075, 0.24], 0.007, BEAR.dark);                         // stitched mouth
    K.beam(M.paint, [0, hy - 0.075, 0.24], [-0.035, hy - 0.087, 0.226], 0.007, BEAR.dark); K.beam(M.paint, [0, hy - 0.075, 0.24], [0.035, hy - 0.087, 0.226], 0.007, BEAR.dark);
    for (const s of [-1, 1]) {
      K.put(M.paint, sph(0.03, 10, 8), s * 0.075, hy + 0.05, 0.168, 0, 0, 0, 1, 1, 0.55, 0x161018);            // shoe-button eye
      K.put(M.paint, sph(0.009, 6, 4), s * 0.075 - 0.01, hy + 0.062, 0.184, 0, 0, 0, 1, 1, 0.5, 0xf8f4ff);     // shine
      K.put(P, sph(0.075, 12, 8), s * 0.15, hy + 0.16, -0.01, 0, 0, s * -0.3, 1, 1, 0.5, fur);                 // ear
      K.put(P, sph(0.048, 10, 6), s * 0.15, hy + 0.155, 0.02, 0, 0, s * -0.3, 1, 1, 0.35, lt);
    }
  }
  if (body && o.ribbon !== false) {
    K.put(M.fabric, tor(0.155, 0.022, 6, 22), 0, 0.55, 0.0, Math.PI / 2, 0, 0, 1, 0.92, 1, rib);
    for (const s of [-1, 1]) { K.put(M.fabric, sph(0.045, 10, 6), s * 0.055, 0.565, 0.16, 0, s * 0.3, s * 0.4, 1.4, 0.75, 0.45, rib); K.beam(M.fabric, [s * 0.015, 0.545, 0.16], [s * 0.05, 0.47, 0.17], 0.018, rib); }
    K.put(M.fabric, sph(0.025, 8, 6), 0, 0.56, 0.17, 0, 0, 0, 1, 1, 0.7, shadeC(rib, 0.85));
  }
}
const shadeC = (c, k) => { const cc = new THREE.Color(c); cc.multiplyScalar(k); return cc.getHex(); };
// an instanced set of bears: slots [[x,y,z,ry,s],...], visible count via setN
const BEAR_TINTS = [[0x9a6234, 0xc8302c], [0xb88a4a, 0x3a6ab8], [0x7a4a2e, 0x2f8a5a], [0xc8a068, 0xc8302c], [0x8a5a3a, 0xe0a030], [0xa87048, 0x8a3ab8]];
function bearSwarm(parent, slots, variants = 3) {
  const groups = []; const per = [];
  for (let v = 0; v < variants; v++) { const K = new Kit(); const [fur, rib] = BEAR_TINTS[v % BEAR_TINTS.length]; bear(K, { fur, ribbon: rib }); per.push(K.prefab()); }
  const byV = per.map(() => []); slots.forEach((s, i) => byV[i % variants].push(i));
  const ims = per.map((pf, v) => pf.map(([mat, geo]) => { const im = new THREE.InstancedMesh(geo, mat, Math.max(1, byV[v].length)); im.castShadow = true; im.receiveShadow = true; im.count = 0; im.frustumCulled = false; parent.add(im); return im; }));
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  const place = (scaleOf) => { per.forEach((pf, v) => { byV[v].forEach((si, j) => { const s = slots[si], k = scaleOf(si); m4.compose(p.set(s[0], s[1], s[2]), q.setFromEuler(e.set(s[5] || 0, s[3] || 0, s[6] || 0, 'YXZ')), sc.setScalar(Math.max(1e-4, s[4] * k))); for (const im of ims[v]) im.setMatrixAt(j, m4); }); for (const im of ims[v]) im.instanceMatrix.needsUpdate = true; }); };
  place(() => 1);
  return {
    slots, ims,
    setN(n) { n = Math.max(0, Math.min(slots.length, Math.round(n))); per.forEach((pf, v) => { let c = 0; for (const si of byV[v]) if (si < n) c++; for (const im of ims[v]) im.count = c; }); },
    setScales(fn) { place(fn); per.forEach((pf, v) => { for (const im of ims[v]) im.count = byV[v].length; }); },
  };
}

// ================================================================= STREET (and window)
const ST = { fz: -6.45, curbF: -4.0, curbN: 7.0, nz: 10.0, gf: 3.9, fl: 3.0, shop: { x0: -3.4, x1: 2.6 }, win: { x0: -2.9, x1: 0.5, y0: 0.72, y1: 2.72, back: -7.45 }, door: { x0: 0.95, x1: 1.95 } };
let SNOW = null, WBEARS = null;
function sashWin(K, x, y, w, h, lit, k, lintel = 0xd8ccb8) { // facade window on a wall at z = 0 facing +z
  K.put(lit ? M.paneLit[k % 2] : M.paneDark[k % 3], plane(w, h), x, y + h / 2, 0.012);
  K.box(M.paint, x - w / 2 - 0.07, x - w / 2, y, y + h, 0, 0.07, 0xeae2d2, 0.01); K.box(M.paint, x + w / 2, x + w / 2 + 0.07, y, y + h, 0, 0.07, 0xeae2d2, 0.01);
  K.box(M.paint, x - w / 2, x + w / 2, y + h / 2 - 0.025, y + h / 2 + 0.025, 0, 0.05, 0xeae2d2, 0.006); K.box(M.paint, x - 0.012, x + 0.012, y, y + h, 0, 0.04, 0xeae2d2, 0.004);
  K.box(M.paint, x - w / 2 - 0.16, x + w / 2 + 0.16, y + h, y + h + 0.22, -0.01, 0.1, lintel, 0.02); K.box(M.paint, x - 0.09, x + 0.09, y + h + 0.02, y + h + 0.24, 0.0, 0.12, shadeC(lintel, 0.92), 0.01); // lintel + keystone
  K.box(M.paint, x - w / 2 - 0.12, x + w / 2 + 0.12, y - 0.08, y, -0.01, 0.14, lintel, 0.015); // sill
}
function cornice(K, x0, x1, y, c = 0x4a3a52) {
  K.box(M.paint, x0 - 0.1, x1 + 0.1, y, y + 0.25, 0, 0.18, c, 0.02); K.box(M.paint, x0 - 0.22, x1 + 0.22, y + 0.6, y + 0.85, 0, 0.6, c, 0.03); K.box(M.paint, x0 - 0.16, x1 + 0.16, y + 0.25, y + 0.6, 0, 0.22, shadeC(c, 1.12), 0.02);
  for (let x = x0 + 0.1; x <= x1 - 0.05; x += 0.62) K.cb(M.paint, 0.14, 0.38, 0.4, x, y + 0.42, 0.3, shadeC(c, 0.9), 0, 0, 0, 0.02); // brackets
  for (let x = x0; x <= x1; x += 0.2) K.box(M.paint, x - 0.04, x + 0.04, y + 0.53, y + 0.6, 0.3, 0.38, shadeC(c, 1.2), 0.01); // dentils
}
function fireEscape(K, x0, x1, gf, fl, floors) { // classic NYC front fire escape: slatted landings, railings, stairs, drop ladder
  const c = 0x2a2436, D = 0.95;
  for (let i = 0; i < floors; i++) { const y = gf + i * fl - 0.1;
    for (let x = x0; x <= x1; x += 0.09) K.box(M.iron, x - 0.02, x + 0.02, y - 0.03, y, 0.05, D, c, 0.004);
    K.box(M.iron, x0, x1, y - 0.07, y, D - 0.04, D, c, 0.005); K.box(M.iron, x0, x1, y + 0.92, y + 0.97, D - 0.04, D, c, 0.006); K.box(M.iron, x0, x1, y + 0.45, y + 0.48, D - 0.03, D - 0.01, c, 0.004);
    for (let x = x0; x <= x1 + 0.01; x += 0.14) K.box(M.iron, x - 0.012, x + 0.012, y, y + 0.95, D - 0.03, D - 0.01, c, 0.003);
    for (const xx of [x0, x1]) { K.box(M.iron, xx - 0.02, xx + 0.02, y, y + 0.97, 0, D, c, 0.004); K.box(M.iron, xx - 0.015, xx + 0.015, y + 0.92, y + 0.96, 0.05, D, c, 0.003); }
    for (const xx of [x0 + 0.2, x1 - 0.2]) K.beam(M.iron, [xx, y - 0.07, D - 0.05], [xx, y - 0.7, 0.02], 0.04, c); // brackets
    if (i < floors - 1) { const sx0 = x1 - 0.3, sx1 = x0 + 1.4, y1 = y + fl; K.beam(M.iron, [sx0, y, 0.25], [sx1, y1, 0.25], 0.04, c); K.beam(M.iron, [sx0, y, 0.65], [sx1, y1, 0.65], 0.04, c);
      for (let k = 1; k < 12; k++) { const t = k / 12; K.box(M.iron, sx0 + (sx1 - sx0) * t - 0.06, sx0 + (sx1 - sx0) * t + 0.06, y + fl * t - 0.015, y + fl * t + 0.015, 0.25, 0.65, c, 0.004); }
      K.beam(M.iron, [sx0, y + 0.9, 0.67], [sx1, y1 + 0.9, 0.67], 0.025, c); }
  }
  const lx = x0 + 0.5, y = gf - 0.1; K.beam(M.iron, [lx, y, D - 0.15], [lx, y - 2.0, D - 0.15], 0.035, c); K.beam(M.iron, [lx + 0.45, y, D - 0.15], [lx + 0.45, y - 2.0, D - 0.15], 0.035, c);
  for (let k = 1; k < 8; k++) K.box(M.iron, lx, lx + 0.45, y - k * 0.25 - 0.012, y - k * 0.25 + 0.012, D - 0.17, D - 0.13, c, 0.004);
}
// tenement facade block on the wall plane z = 0 (local) facing +z, spanning x0..x1
function tenement(K, x0, x1, o) {
  const { gf, fl } = ST, floors = o.floors || 4, top = gf + floors * fl, mat = o.mat || M.brickRed, nWin = o.nWin || Math.max(2, Math.round((x1 - x0) / 1.9));
  K.box(mat, x0, x1, gf, top, -0.4, 0, 0xffffff, 0.01, 1.2); // upper brick
  for (let i = 0; i < floors; i++) for (let k = 0; k < nWin; k++) { const x = x0 + (x1 - x0) * (k + 0.5) / nWin, y = gf + i * fl + 0.85, id = Math.floor(R1(x * 7 + i * 13 + (o.seed || 0)) * 100);
    sashWin(K, x, y, 0.92, 1.6, id < (o.lit ?? 26), id, o.lintel); }
  for (let i = 1; i < floors; i++) K.box(M.paint, x0, x1, gf + i * fl - 0.05, gf + i * fl + 0.02, 0, 0.05, shadeC(o.lintel || 0xd8ccb8, 0.85), 0.01); // belt courses
  cornice(K, x0, x1, top, o.cornice || 0x4a3a52);
  K.box(M.paint, x0, x1, gf - 0.25, gf + 0.05, 0, 0.16, o.trim || 0x3a4a3a, 0.015); // storefront cornice / lintel band
  for (const xx of [x0, x1]) K.box(mat, xx - 0.12, xx + 0.12, 0, top, 0, 0.08, 0xffffff, 0.01, 1.2); // party-wall piers
  if (o.fe) fireEscape(K, x0 + (x1 - x0) * 0.18, x0 + (x1 - x0) * 0.82, gf, fl, floors);
  // ground floor
  const g = o.ground || 'stoop';
  if (g === 'shopfront') { const sx0 = x0 + 0.3, sx1 = x1 - 0.3, mid = (sx0 + sx1) / 2, tc = o.trim || 0x3a4a3a;
    K.box(M.brownstone, x0, x1, 0, gf - 0.25, -0.6, -0.4, 0xffffff, 0.01, 1.4);
    K.put(M.paneLit[1], plane(sx1 - sx0 - 1.6, 1.9), mid - 0.5, 1.75, -0.38); K.box(M.paint, sx0, sx1, 0, 0.7, -0.4, -0.25, tc, 0.02); K.box(M.paint, sx0, sx1, 2.7, 3.0, -0.4, -0.2, tc, 0.02);
    for (const xx of [sx0, mid - 0.5, sx1 - 1.3, sx1]) K.box(M.paint, xx - 0.07, xx + 0.07, 0.7, 2.7, -0.4, -0.25, tc, 0.01);
    K.box(M.woodDark, sx1 - 1.2, sx1 - 0.15, 0, 2.6, -0.62, -0.55, shadeC(tc, 0.8), 0.01); K.put(M.paneLit[0], plane(0.7, 0.9), sx1 - 0.675, 1.9, -0.54);
    if (o.sign) sign(K, o.sign, o.signBg || '#2f4a3a', o.signFg || '#f2e2b0', Math.min(sx1 - sx0 - 0.4, 5.4), 0.6, mid, 3.33, 0.12);
    if (o.goods) for (let k = 0; k < 6; k++) { const xx = sx0 + 0.35 + k * 0.5; if (xx > mid - 0.5 + (sx1 - sx0 - 1.6) / 2 - 0.2) break; K.box(M.paint, xx - 0.18, xx + 0.18, 0.7, 0.7 + 0.25 + R1(k + x0) * 0.6, -0.9, -0.5, [0xc8a060, 0x8a3a3a, 0x4a6a8a, 0xe8dcc0][k % 4], 0.02); }
  } else { // brownstone stoop + parlour door; basement windows
    K.box(M.brownstone, x0, x1, 0, gf - 0.25, -0.4, 0, 0xffffff, 0.01, 1.4);
    for (let k = 0; k < 2; k++) { const x = x0 + (x1 - x0) * (k === 0 ? 0.3 : 0.75); sashWin(K, x, 1.55, 0.9, 1.5, R1(x0 + k) < 0.3, k + 3, 0xc8b8a0); }
    const dx = x0 + (x1 - x0) * 0.52; K.box(M.woodDark, dx - 0.55, dx + 0.55, 1.35, 3.4, -0.25, -0.18, 0x4a2a22, 0.01); K.box(M.paint, dx - 0.7, dx + 0.7, 3.4, 3.6, -0.05, 0.25, 0x6a4a44, 0.02);
    K.put(M.paneLit[0], plane(0.8, 0.35), dx, 3.15, -0.17);
    for (let s = 0; s < 6; s++) K.box(M.brownstone, dx - 0.75, dx + 0.75, 0, 1.35 - s * 0.22, 0, 0.35 + s * 0.32, 0xffffff, 0.01, 1.4);
    for (const sx of [-0.78, 0.78]) { K.beam(M.iron, [dx + sx, 1.35 + 0.9, 0.2], [dx + sx, 0.35 + 0.9, 2.1], 0.035, 0x1e1a28); K.put(M.iron, cyl(0.04, 0.05, 1.0, 8), dx + sx, 0.5, 2.1, 0, 0, 0, 1, 1, 1, 0x1e1a28); K.put(M.iron, sph(0.06, 8, 6), dx + sx, 1.05, 2.1, 0, 0, 0, 1, 1, 1, 0x1e1a28);
      for (let k = 1; k < 7; k++) { const t = k / 7; K.beam(M.iron, [dx + sx, 1.35 - t * 1.0, 0.2 + t * 1.9], [dx + sx, 1.35 - t * 1.0 + 0.9, 0.2 + t * 1.9], 0.015, 0x1e1a28); } }
    K.put(M.paneDark[1], plane(0.8, 0.5), x0 + (x1 - x0) * 0.25, 0.42, 0.02); for (let k = 0; k < 5; k++) K.box(M.iron, x0 + (x1 - x0) * 0.25 - 0.4 + k * 0.2, x0 + (x1 - x0) * 0.25 - 0.38 + k * 0.2, 0.15, 0.7, 0.02, 0.05, 0x1e1a28, 0.004);
  }
}
function gasLamp(K, x, z) {
  const c = 0x2a3a34; K.put(M.iron, lathe('lpbase', [[0, 0], [0.16, 0], [0.16, 0.08], [0.11, 0.14], [0.11, 0.5], [0.07, 0.62], [0, 0.62]], 10), x, 0.16, z, 0, 0, 0, 1, 1, 1, c);
  K.put(M.iron, cyl(0.05, 0.065, 2.6, 10), x, 1.9, z, 0, 0, 0, 1, 1, 1, c); K.put(M.iron, cyl(0.075, 0.075, 0.08, 10), x, 3.2, z, 0, 0, 0, 1, 1, 1, c);
  K.box(M.iron, x - 0.32, x + 0.32, 2.95, 2.99, z - 0.02, z + 0.02, c, 0.008); // ladder bar
  K.put(M.glowWarm, cyl(0.17, 0.11, 0.42, 4), x, 3.47, z, 0, Math.PI / 4, 0);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; K.beam(M.iron, [x + Math.cos(a) * 0.115, 3.25, z + Math.sin(a) * 0.115], [x + Math.cos(a) * 0.175, 3.69, z + Math.sin(a) * 0.175], 0.018, c); }
  K.put(M.iron, cone(0.27, 0.22, 4), x, 3.8, z, 0, Math.PI / 4, 0, 1, 1, 1, c); K.put(M.iron, sph(0.045, 8, 6), x, 3.95, z, 0, 0, 0, 1, 1, 1, c); K.put(M.iron, cyl(0.12, 0.12, 0.04, 4), x, 3.24, z, 0, Math.PI / 4, 0, 1, 1, 1, c);
}
function spokedWheel(K, x, y, z, r, c = 0xc8a040) {
  K.put(M.paint, tor(r, 0.035, 6, 24), x, y, z, 0, 0, 0, 1, 1, 1, 0x2a2228); K.put(M.paint, tor(r - 0.04, 0.02, 4, 24), x, y, z, 0, 0, 0, 1, 1, 1, c);
  K.put(M.paint, cyl(0.07, 0.07, 0.14, 10), x, y, z, Math.PI / 2, 0, 0, 1, 1, 1, c); for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; K.beam(M.paint, [x, y, z], [x + Math.cos(a) * (r - 0.03), y + Math.sin(a) * (r - 0.03), z], 0.022, c); }
}
function horse(K) { // stylized standing horse, local: length along x (head at +x), ground y=0
  const c = 0xb87a4a, dk = 0x4a2a22, L = 0x2a1a1a;
  K.put(M.paint, sph(0.5, 18, 12), 0, 1.32, 0, 0, 0, 0, 1.6, 0.82, 0.78, c);                                 // barrel
  K.put(M.paint, sph(0.4, 14, 10), 0.58, 1.38, 0, 0, 0, 0, 0.9, 1.0, 0.95, c);                               // chest
  K.put(M.paint, sph(0.38, 14, 10), -0.6, 1.38, 0, 0, 0, 0, 0.95, 0.95, 0.95, c);                            // rump
  K.at(0.85, 1.6, 0, 0, () => { K.put(M.paint, cyl(0.17, 0.26, 0.85, 12), 0.22, 0.32, 0, 0, 0, -0.75, 1, 1, 0.75, c);   // neck
    K.at(0.55, 0.72, 0, 0, () => { K.put(M.paint, cyl(0.1, 0.17, 0.62, 12), 0.18, -0.12, 0, 0, 0, -1.95, 1, 1, 0.8, c); K.put(M.paint, sph(0.11, 10, 8), 0.43, -0.25, 0, 0, 0, 0, 1, 0.85, 0.8, shadeC(c, 0.8)); // head + muzzle
      K.put(M.paint, sph(0.025, 6, 4), 0.06, 0.03, 0.12, 0, 0, 0, 1, 1, 1, 0x101018); K.put(M.paint, sph(0.025, 6, 4), 0.06, 0.03, -0.12, 0, 0, 0, 1, 1, 1, 0x101018);
      for (const s of [-1, 1]) { K.put(M.paint, cone(0.05, 0.16, 6), -0.06, 0.2, s * 0.07, 0, 0, 0.2, 1, 1, 1, c); K.box(M.paint, 0.0, 0.14, 0.0, 0.1, s * 0.13 - 0.01, s * 0.13 + 0.01, L, 0.004); } // ears + blinkers
      K.beam(M.paint, [-0.05, -0.02, 0.13], [0.42, -0.25, 0.1], 0.02, L); K.beam(M.paint, [-0.05, -0.02, -0.13], [0.42, -0.25, -0.1], 0.02, L); });
    for (let k = 0; k < 8; k++) K.cb(M.paint, 0.1, 0.14, 0.06, 0.05 + k * 0.07, 0.32 + k * 0.08 + 0.12, 0, dk, 0, 0, -0.75, 0.02); }); // mane
  K.put(M.paint, tor(0.26, 0.07, 8, 18), 0.88, 1.68, 0, 0, Math.PI / 2, -0.75, 1, 1.25, 1, 0x3a2a2a);        // collar
  K.box(M.fabric, -0.45, 0.35, 1.5, 1.78, -0.42, 0.42, 0x8a2a3a, 0.05); K.box(M.paint, -0.45, 0.35, 1.48, 1.52, -0.43, 0.43, 0xd8b048, 0.01); // blanket
  K.box(M.paint, 0.15, 0.25, 0.9, 1.75, -0.41, 0.41, L, 0.01); // girth strap
  for (const [lx, lz] of [[0.6, 0.18], [0.62, -0.2], [-0.62, 0.18], [-0.6, -0.2]]) { K.put(M.paint, cyl(0.075, 0.09, 0.62, 8), lx, 0.7, lz, 0, 0, 0, 1, 1, 1, c); K.put(M.paint, cyl(0.06, 0.07, 0.42, 8), lx + 0.02, 0.24, lz, 0, 0, 0, 1, 1, 1, c);
    K.put(M.paint, cyl(0.075, 0.085, 0.09, 8), lx + 0.02, 0.045, lz, 0, 0, 0, 1, 1, 1, 0x2a2226); K.put(M.paint, cyl(0.09, 0.07, 0.1, 8), lx + 0.02, 0.14, lz, 0, 0, 0, 1, 1, 1, 0xe8e0d8); } // fetlock socks
  K.put(M.paint, cone(0.1, 0.8, 8), -1.05, 1.0, 0, 0, 0, -0.35, 1, 1, 1, dk);                                 // tail
}
function wagon(K) { // enclosed delivery wagon (no lettering), local: length along x, front (driver) at +x
  const body = 0x4a8a6a, trim = 0xe8c058;
  K.box(M.woodDark, -1.4, 1.0, 0.82, 0.92, -0.62, 0.62, 0x3a2a22, 0.01);
  K.box(M.paint, -1.4, 0.9, 0.92, 2.25, -0.65, 0.65, body, 0.03); K.box(M.paint, -1.5, 1.0, 2.25, 2.37, -0.75, 0.75, shadeC(body, 0.8), 0.03); // box + roof
  for (const s of [-1, 1]) { K.box(M.paint, -1.25, 0.75, 1.08, 2.1, s * 0.65 - 0.01, s * 0.65 + 0.01, shadeC(body, 1.15), 0.01); for (const [a, b, c2, d] of [[-1.25, 0.75, 1.08, 1.11], [-1.25, 0.75, 2.07, 2.1], [-1.25, -1.22, 1.08, 2.1], [0.72, 0.75, 1.08, 2.1]]) K.box(M.paint, a, b, c2, d, s * 0.66 - 0.006, s * 0.66 + 0.006, trim, 0.003);
    K.put(M.paint, sph(0.12, 10, 6), -0.25, 1.6, s * 0.665, 0, 0, 0, 2.4, 1.4, 0.06, trim); K.put(M.paint, sph(0.1, 10, 6), -0.25, 1.6, s * 0.67, 0, 0, 0, 2.2, 1.2, 0.06, 0xb8323a); } // painted medallion
  K.box(M.woodDark, 0.9, 1.25, 1.28, 1.36, -0.55, 0.55, 0x4a3026, 0.01); K.box(M.woodDark, 0.9, 0.98, 1.36, 1.7, -0.55, 0.55, 0x4a3026, 0.01); K.box(M.paint, 1.18, 1.5, 0.95, 1.4, -0.5, 0.5, 0x2a2228, 0.02); // seat + dash
  spokedWheel(K, -0.95, 0.56, 0.74, 0.56); spokedWheel(K, -0.95, 0.56, -0.74, 0.56); spokedWheel(K, 0.6, 0.44, 0.72, 0.44); spokedWheel(K, 0.6, 0.44, -0.72, 0.44);
  zcyl(K, M.metal, 0.03, -0.95, 0.56, -0.78, 0.78, 0x2a2228); zcyl(K, M.metal, 0.03, 0.6, 0.44, -0.76, 0.76, 0x2a2228);
  for (const s of [-1, 1]) K.beam(M.woodDark, [1.0, 0.9, s * 0.42], [3.6, 1.45, s * 0.42], 0.05, 0x5a3a2a); // shafts
  K.put(M.brass, cyl(0.06, 0.05, 0.14, 8), 1.1, 2.45, 0.6, 0, 0, 0, 1, 1, 1, 0xc8a040); K.put(M.glowSoft, cyl(0.045, 0.045, 0.1, 8), 1.1, 2.37, 0.6);
}
function buildStreet(root) {
  const K = new Kit(), { fz, curbF, curbN, nz, shop: S, win: Wn, door: D, gf } = ST;
  // ground: cobbles, trolley rails, curbs, bluestone sidewalks
  K.box(M.cobble, -45, 45, -0.1, 0, curbF, curbN, 0xffffff, 0.01, 1.6);
  for (const rz of [1.0, 2.44, 3.6, 5.04]) { K.box(M.metal, -45, 45, -0.005, 0.012, rz - 0.035, rz + 0.035, 0x8a8a9a, 0.004); K.box(M.paint, -45, 45, -0.004, 0.006, rz + 0.04, rz + 0.07, 0x2a2436, 0.002); }
  K.box(M.flags, -45, 45, 0, 0.16, fz - 0.5, curbF, 0xffffff, 0.01, 1.8); K.box(M.paint, -45, 45, 0, 0.17, curbF - 0.18, curbF, 0x9a96a4, 0.02);
  K.box(M.flags, -45, 45, 0, 0.16, curbN, nz + 0.5, 0xffffff, 0.01, 1.8); K.box(M.paint, -45, 45, 0, 0.17, curbN, curbN + 0.18, 0x9a96a4, 0.02);
  // far facade (shop in the middle), near facade (mirrored, for reverses)
  K.at(0, 0, fz, 0, () => {
    tenement(K, -36, -24, { floors: 4, mat: M.brickBrown, ground: 'shopfront', sign: 'FEED & GRAIN', fe: 1, seed: 1, trim: 0x3a3a52 });
    tenement(K, -24, -13.6, { floors: 5, mat: M.brickDark, ground: 'stoop', fe: 1, seed: 2, cornice: 0x5a4a3a });
    tenement(K, -13.6, S.x0, { floors: 5, mat: M.brickRed, ground: 'shopfront', sign: 'HOFFMAN BAKERY', signBg: '#6a2a2a', signFg: '#f6e2b0', fe: 1, seed: 3, goods: 1, trim: 0x6a2a2a });
    tenement(K, S.x1, 10, { floors: 5, mat: M.brickBrown, ground: 'shopfront', sign: 'KELLY DRY GOODS', signBg: '#2a3a5a', signFg: '#f0e0b0', fe: 1, seed: 4, goods: 1, trim: 0x2a3a5a });
    tenement(K, 10, 21, { floors: 4, mat: M.brickBuff, ground: 'stoop', fe: 1, seed: 5, cornice: 0x3a4a5a, lintel: 0xe8e0d0 });
    tenement(K, 21, 36, { floors: 5, mat: M.brickRed, ground: 'shopfront', sign: 'HARDWARE & STOVES', fe: 1, seed: 6 });
  });
  K.at(0, 0, nz, Math.PI, () => { tenement(K, -30, -16, { floors: 4, mat: M.brickBuff, ground: 'shopfront', sign: 'SHOES MENDED', seed: 7, fe: 1 }); tenement(K, -16, -4, { floors: 5, mat: M.brickRed, ground: 'stoop', seed: 8, fe: 1 }); tenement(K, -4, 9, { floors: 5, mat: M.brickDark, ground: 'shopfront', sign: 'SCHMIDT MEATS', seed: 9, fe: 1 }); tenement(K, 9, 30, { floors: 4, mat: M.brickBrown, ground: 'stoop', seed: 10, fe: 1 }); });
  // ---- the candy shop building (overrides the middle block)
  K.at(0, 0, fz, 0, () => { const x0 = S.x0, x1 = S.x1, tc = 0x2f5a46, gold = 0xd8b048;
    K.box(M.brickRed, x0, x1, gf, gf + 4 * ST.fl, -0.4, 0, 0xffffff, 0.01, 1.2);
    for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++) sashWin(K, x0 + (x1 - x0) * (k + 0.5) / 3, gf + i * ST.fl + 0.85, 0.9, 1.6, (i + k) % 3 === 1, i * 3 + k, 0xe0d6c4);
    cornice(K, x0, x1, gf + 4 * ST.fl, 0x2f4a3e); for (const xx of [x0, x1]) K.box(M.brickRed, xx - 0.12, xx + 0.12, 0, gf + 4 * ST.fl, 0, 0.08, 0xffffff, 0.01, 1.2);
    fireEscape(K, x0 + 0.5, x1 - 0.5, gf, ST.fl, 4);
    // shopfront: pilasters, bulkhead, display opening, transom, sign band
    K.box(M.paint, x0, Wn.x0, 0, gf, -0.3, 0.06, tc, 0.02); K.box(M.paint, Wn.x1, D.x0, 0, gf, -0.3, 0.06, tc, 0.02); K.box(M.paint, D.x1, x1, 0, gf, -0.3, 0.06, tc, 0.02);
    K.box(M.paint, Wn.x0, Wn.x1, 0, Wn.y0, -0.3, 0.04, tc, 0.02); for (let k = 0; k < 4; k++) { const a = Wn.x0 + 0.1 + k * (Wn.x1 - Wn.x0 - 0.2) / 4; K.box(M.paint, a + 0.06, a + (Wn.x1 - Wn.x0 - 0.2) / 4 - 0.06, 0.14, Wn.y0 - 0.14, 0.04, 0.07, shadeC(tc, 1.2), 0.015); }
    K.box(M.paint, Wn.x0 - 0.05, Wn.x1 + 0.05, Wn.y0 - 0.06, Wn.y0, -0.3, 0.12, 0xe8dcc0, 0.015); // sill
    K.box(M.paint, Wn.x0, D.x1, Wn.y1, Wn.y1 + 0.08, -0.3, 0.05, tc, 0.01); K.box(M.paint, Wn.x0, D.x1, 3.06, gf - 0.2, -0.3, 0.06, tc, 0.01);
    for (let k = 0; k < 6; k++) { const a = Wn.x0 + k * (D.x1 - Wn.x0) / 6; K.put(M.paneLit[0], plane((D.x1 - Wn.x0) / 6 - 0.08, 0.26), a + (D.x1 - Wn.x0) / 12, 2.93, -0.2); K.box(M.paint, a - 0.03, a + 0.03, 2.8, 3.06, -0.25, 0.04, tc, 0.006); } // transom lights
    K.box(M.paint, x0, x1, gf - 0.2, gf + 0.12, -0.3, 0.22, shadeC(tc, 0.8), 0.02);
    for (const xx of [x0 + 0.12, Wn.x1 + 0.22, x1 - 0.12]) { K.box(M.paint, xx - 0.14, xx + 0.14, 0, gf, 0.04, 0.14, shadeC(tc, 1.1), 0.02); K.box(M.paint, xx - 0.17, xx + 0.17, gf - 0.5, gf - 0.3, 0.04, 0.2, gold, 0.02); }
    // the door (recessed), with a lit glass panel + transom
    K.box(M.floor, D.x0, D.x1, 0, 0.16, -0.75, 0.06, 0xb08a6a, 0.01); K.box(M.paint, D.x0 - 0.02, D.x0 + 0.04, 0, 2.8, -0.75, 0.0, tc, 0.01); K.box(M.paint, D.x1 - 0.04, D.x1 + 0.02, 0, 2.8, -0.75, 0.0, tc, 0.01);
    K.box(M.woodDark, D.x0 + 0.04, D.x1 - 0.04, 0.16, 2.62, -0.76, -0.7, 0x3a2a24, 0.01); K.put(M.paneLit[1], plane(0.62, 1.0), (D.x0 + D.x1) / 2, 1.85, -0.69); K.box(M.paint, D.x0 + 0.15, D.x1 - 0.15, 0.4, 1.15, -0.7, -0.67, shadeC(tc, 0.9), 0.01);
    K.put(M.brass, sph(0.035, 8, 6), D.x1 - 0.15, 1.15, -0.66, 0, 0, 0, 1, 1, 1, gold);
    // sign
    sign(K, "MICHTOM'S CANDY & NOTIONS", '#2f5a46', '#f6dc8a', x1 - x0 - 0.5, 0.62, (x0 + x1) / 2, gf - 0.35 + 0.0, 0.24, 0, { fs: 0.6, frame: gold });
    // striped awning on iron arms + scalloped valance
    const ax0 = Wn.x0 - 0.2, ax1 = D.x1 + 0.1, aw = ax1 - ax0, ay0 = 3.08, ay1 = 2.62, az1 = 1.45, al = Math.hypot(az1, ay0 - ay1), ang = Math.atan2(ay0 - ay1, az1);
    K.put(M.awning, plane(aw, al), (ax0 + ax1) / 2, (ay0 + ay1) / 2, az1 / 2 + 0.05, -Math.PI / 2 + ang, 0, 0);
    for (let k = 0; k < 14; k++) { const xx = ax0 + (k + 0.5) * aw / 14; K.put(M.awning, plane(aw / 14, 0.24), xx, ay1 - 0.12, az1 + 0.06, 0, 0, 0); K.put(M.fabric, sph(aw / 28, 8, 4), xx, ay1 - 0.24, az1 + 0.06, 0, 0, 0, 1, 0.5, 0.15, k % 2 ? 0xc8423a : 0xf2ead8); }
    K.box(M.iron, ax0, ax1, ay0 - 0.03, ay0 + 0.03, 0.02, 0.1, 0x1e1a28, 0.01); for (const xx of [ax0 + 0.05, ax1 - 0.05]) K.beam(M.iron, [xx, ay0 - 0.6, 0.05], [xx, ay1, az1], 0.025, 0x1e1a28);
    // shop: wooden bench + boxes by the door, boot scraper
    K.box(M.wood, D.x1 + 0.15, x1 - 0.1, 0.16, 0.6, 0.15, 0.5, 0x8a6a4a, 0.02);
  });
  // display window interior (local to street root; the glass sits at z = fz)
  { const x0 = Wn.x0, x1 = Wn.x1, y0 = Wn.y0, bz = Wn.back, fzz = fz - 0.3, pc = 0x8a2a3a;
    K.box(M.wood, x0, x1, y0 - 0.1, y0, bz, fzz, 0xc89a6a, 0.01); // display floor
    K.box(M.wallShop, x0, x1, y0, Wn.y1 + 0.3, bz - 0.06, bz, 0xffffff, 0.005, 1.0); for (const xx of [x0 - 0.06, x1]) K.box(M.wallShop, xx, xx + 0.06, y0, Wn.y1 + 0.3, bz, fzz, 0xffffff, 0.005);
    K.box(M.wood, x0, x1, Wn.y1, Wn.y1 + 0.3, bz, fzz, 0x6a4434, 0.01);
    // stepped risers draped in velvet
    K.box(M.fabric, x0 + 0.02, x1 - 0.02, y0, y0 + 0.22, bz, bz + 0.42, pc, 0.04); K.box(M.fabric, x0 + 0.02, x1 - 0.02, y0, y0 + 0.44, bz, bz + 0.2, shadeC(pc, 0.9), 0.04);
    // side drapes
    for (const [xx, s] of [[x0 + 0.18, 1], [x1 - 0.18, -1]]) K.put(M.fabric, drape(0.42, 2.0, 3, 0.05), xx, Wn.y1 + 0.28, fzz - 0.12, 0, 0, s * 0.03, 1, 1, 1, 0xa8323a);
    K.put(M.fabric, drape(x1 - x0, 0.28, 12, 0.03), (x0 + x1) / 2, Wn.y1 + 0.02, fzz - 0.1, 0, 0, 0, 1, 1, 1, 0xa8323a); K.box(M.brass, x0, x1, Wn.y1 - 0.02, Wn.y1 + 0.02, fzz - 0.14, fzz - 0.1, 0xc8a040, 0.01);
    // central drum pedestal for the hero bear
    const cx = (x0 + x1) / 2 - 0.05; K.put(M.fabric, cyl(0.26, 0.26, 0.2, 20), cx, y0 + 0.1, fzz - 0.45, 0, 0, 0, 1, 1, 1, 0xd8b048); K.put(M.paint, tor(0.26, 0.02, 4, 24), cx, y0 + 0.2, fzz - 0.45, Math.PI / 2, 0, 0, 1, 1, 1, 0xf2e6c8); K.put(M.paint, tor(0.26, 0.02, 4, 24), cx, y0 + 0.01, fzz - 0.45, Math.PI / 2, 0, 0, 1, 1, 1, 0xf2e6c8);
    K.at(cx, y0 + 0.2, fzz - 0.45, 0, () => bear(K, {}), 0.62);
    // the card on a little easel, front right of the bear
    K.at(cx + 0.42, y0, fzz - 0.14, -0.3, () => { K.put(M.card, plane(0.46, 0.23), 0, 0.2, 0.005, -0.2, 0, 0); K.box(M.woodDark, -0.25, 0.25, 0.07, 0.085, -0.03, 0.02, 0x5a3a2a, 0.004); K.beam(M.woodDark, [-0.18, 0.0, -0.1], [-0.18, 0.34, 0.02], 0.015, 0x5a3a2a); K.beam(M.woodDark, [0.18, 0.0, -0.1], [0.18, 0.34, 0.02], 0.015, 0x5a3a2a); });
    // clipping pinned on a small cork board behind, upper left
    K.at(cx - 0.62, y0 + 0.44, bz + 0.12, 0.12, () => { K.box(M.woodDark, -0.2, 0.2, 0, 0.62, -0.03, 0, 0x6a4434, 0.006); K.box(M.paint, -0.18, 0.18, 0.02, 0.6, -0.005, 0.004, 0xb8885a, 0.004); K.put(M.clip, plane(0.27, 0.4), 0, 0.32, 0.008, 0, 0, 0.04); K.put(M.paint, sph(0.012, 6, 4), 0, 0.51, 0.012, 0, 0, 0, 1, 1, 1, 0xc8302c); K.beam(M.woodDark, [-0.12, 0, -0.03], [-0.16, -0.44, -0.2], 0.012, 0x5a3a2a); K.beam(M.woodDark, [0.12, 0, -0.03], [0.16, -0.44, -0.2], 0.012, 0x5a3a2a); });
    // candy: big jars on the outer steps, chocolate boxes, stick-candy jars, lollipops
    const jar = (x, y, z, s, col, k) => { K.at(x, y, z, 0, () => { K.put(M.jar, lathe('cj', [[0, 0], [0.09, 0], [0.1, 0.02], [0.1, 0.2], [0.07, 0.24], [0.06, 0.26], [0, 0.26]], 18), 0, 0, 0); K.put(M.metal, cyl(0.065, 0.065, 0.03, 14), 0, 0.27, 0, 0, 0, 0, 1, 1, 1, 0xc8c0b0); K.put(M.metal, sph(0.02, 8, 6), 0, 0.3, 0, 0, 0, 0, 1, 1, 1, 0xd8d0c0);
      for (let i = 0; i < 9; i++) { const a = i * 2.4, r = 0.05 * (i % 3) / 2 + 0.02; K.put(M.paint, sph(0.026, 8, 6), Math.cos(a) * r, 0.04 + (i / 9) * 0.13, Math.sin(a) * r, 0, 0, 0, 1, 1, 1, col[i % col.length]); } }, s); };
    const CC = [[0xe84a4a, 0xf8f0e8], [0xf0c040, 0xe87a30], [0x5ab06a, 0xf4e8c8], [0xc85ab0, 0xf0c8e0], [0x4a8ad8, 0xf8f8f8], [0x6a3a24, 0x8a5030]];
    for (let k = 0; k < 3; k++) { jar(x0 + 0.25 + k * 0.27, y0 + 0.44, bz + 0.1, 1.0, CC[k], k); jar(x1 - 0.25 - k * 0.27, y0 + 0.44, bz + 0.1, 1.0, CC[k + 3], k + 3); }
    for (let k = 0; k < 2; k++) { jar(x0 + 0.3 + k * 0.3, y0 + 0.22, bz + 0.32, 1.15, CC[(k + 2) % 6], k); jar(x1 - 0.3 - k * 0.3, y0 + 0.22, bz + 0.32, 1.15, CC[(k + 4) % 6], k); }
    for (let k = 0; k < 3; k++) { const bx = x0 + 0.25 + k * 0.32, bzz = fzz - 0.2 - (k % 2) * 0.1; K.box(M.paint, bx - 0.13, bx + 0.13, y0, y0 + 0.06, bzz - 0.09, bzz + 0.09, [0xc8302c, 0x2f5a8a, 0xd8b048][k], 0.01); K.box(M.paint, bx - 0.135, bx + 0.135, y0 + 0.06, y0 + 0.075, bzz - 0.095, bzz + 0.095, [0xf2e2c0, 0xf2e2c0, 0x8a2a3a][k], 0.005);
      for (let i = 0; i < 6; i++) K.put(M.paint, sph(0.022, 8, 6), bx - 0.09 + (i % 3) * 0.09, y0 + 0.085, bzz - 0.04 + Math.floor(i / 3) * 0.08, 0, 0, 0, 1, 0.6, 1, 0x5a2e1e); }
    for (let k = 0; k < 2; k++) { const bx = x1 - 0.3 - k * 0.42, bzz = fzz - 0.25; K.put(M.jar, cyl(0.07, 0.07, 0.22, 14, true), bx, y0 + 0.11, bzz); for (let i = 0; i < 8; i++) { const a = i * 0.8; K.beam(M.paint, [bx + Math.cos(a) * 0.035, y0 + 0.02, bzz + Math.sin(a) * 0.035], [bx + Math.cos(a) * 0.05, y0 + 0.3, bzz + Math.sin(a) * 0.05], 0.012, i % 2 ? 0xe84a4a : 0xf8f0e8, true); } }
    for (let k = 0; k < 5; k++) { const lx = x1 - 0.7 + k * 0.06, lz = fzz - 0.12; K.beam(M.paint, [lx, y0, lz], [lx + (k - 2) * 0.03, y0 + 0.28, lz], 0.006, 0xf4ecdc); K.put(M.paint, cyl(0.045, 0.045, 0.015, 14), lx + (k - 2) * 0.03, y0 + 0.31, lz, Math.PI / 2, 0, 0, 1, 1, 1, CC[k][0]); }
    // bear slots (slot 0 = the hero on the pedestal is static; these extra bears fill the window)
  }
  // ---- street furniture: gas lamps, trolley poles + span wires + trolley wire, hydrant, ash cans, barrels, crates
  for (const x of [-15, 5.4, 22]) gasLamp(K, x, curbF - 0.35); for (const x of [-6, 14]) gasLamp(K, x, curbN + 0.35);
  for (const x of [-26, -4.2, 18, 38]) { for (const z of [curbF - 0.25, curbN + 0.25]) { K.put(M.iron, cyl(0.09, 0.13, 7.4, 10), x, 3.7, z, 0, 0, 0, 1, 1, 1, 0x2a3a34); K.put(M.iron, sph(0.12, 8, 6), x, 7.45, z, 0, 0, 0, 1, 1, 1, 0x2a3a34); K.put(M.iron, cyl(0.15, 0.15, 0.08, 10), x, 2.4, z, 0, 0, 0, 1, 1, 1, 0x2a3a34); }
    K.beam(M.iron, [x, 6.6, curbF - 0.25], [x, 6.45, 2.3], 0.014, 0x1e1a28, true); K.beam(M.iron, [x, 6.45, 2.3], [x, 6.6, curbN + 0.25], 0.014, 0x1e1a28, true); }
  for (let x = -45; x < 45; x += 2) { const s0 = Math.min(1, Math.abs((x + 4.2) % 22.2) / 11), sag = 0.12; K.beam(M.iron, [x, 6.4 - sag * Math.sin(Math.PI * ((x + 45) % 22.2) / 22.2), 1.72], [x + 2, 6.4 - sag * Math.sin(Math.PI * ((x + 47) % 22.2) / 22.2), 1.72], 0.012, 0x1e1a28, true); }
  for (let x = -45; x < 45; x += 3) K.beam(M.iron, [x, 6.38, 4.3], [x + 3, 6.38, 4.3], 0.012, 0x1e1a28, true);
  // hydrant + ash cans + barrels + crates + a hand cart
  K.at(-8.6, 0.16, curbF - 0.45, 0, () => { K.put(M.iron, cyl(0.12, 0.14, 0.6, 12), 0, 0.3, 0, 0, 0, 0, 1, 1, 1, 0x3a5a4a); K.put(M.iron, sph(0.13, 10, 6), 0, 0.62, 0, 0, 0, 0, 1, 0.8, 1, 0x3a5a4a); for (const s of [-1, 1]) K.put(M.iron, cyl(0.05, 0.05, 0.12, 8), s * 0.15, 0.42, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x3a5a4a); K.put(M.iron, cyl(0.17, 0.17, 0.05, 12), 0, 0.03, 0, 0, 0, 0, 1, 1, 1, 0x2a3a34); });
  for (const [x, z, c] of [[-11.5, fz + 0.5, 0x6a6a74], [-11.0, fz + 0.65, 0x5a5a64], [7.2, fz + 0.45, 0x6a6a74], [12.6, fz + 0.55, 0x6a6a74], [-20, fz + 0.5, 0x5a5a64]]) { K.put(M.metal, cyl(0.24, 0.21, 0.72, 14), x, 0.52, z, 0, 0, 0, 1, 1, 1, c); K.put(M.metal, tor(0.235, 0.02, 4, 16), x, 0.86, z, Math.PI / 2, 0, 0, 1, 1, 1, shadeC(c, 0.8)); K.put(M.metal, cyl(0.25, 0.25, 0.04, 14), x + 0.05, 0.9, z, 0.15, 0, 0.1, 1, 1, 1, shadeC(c, 1.1)); }
  for (const [x, z, s] of [[4.0, fz + 0.5, 1], [4.55, fz + 0.45, 0.9], [8.3, fz + 0.6, 1]]) K.at(x, 0.16, z, s, () => { K.put(M.woodDark, lathe('brl', [[0, 0], [0.25, 0], [0.29, 0.38], [0.25, 0.76], [0, 0.76]], 14), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0x8a6a4a); for (const y of [0.1, 0.66]) K.put(M.metal, tor(0.268, 0.012, 4, 18), 0, y, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a3440); });
  for (const [x, z, ry] of [[5.3, fz + 0.45, 0.2], [5.3, fz + 0.45, -0.1], [-12.4, fz + 0.5, 0.3]]) { const y = 0.16 + (ry < 0 ? 0.42 : 0); K.at(x, y, z, ry, () => { K.box(M.wood, -0.3, 0.3, 0, 0.42, -0.24, 0.24, 0xb89060, 0.01); for (let k = 0; k < 3; k++) K.box(M.wood, -0.31, 0.31, 0.05 + k * 0.13, 0.08 + k * 0.13, -0.25, 0.25, 0x9a7048, 0.005); }); }
  // horse-drawn delivery wagon, standing at the curb past the shop
  K.at(-8.0, 0, 3.4, 0, () => { wagon(K); K.at(4.3, 0, 0, 0, () => horse(K)); });
  // a pushcart near the corner
  K.at(13.2, 0, curbF + 0.9, -0.3, () => { K.box(M.wood, -0.9, 0.9, 0.7, 0.85, -0.45, 0.45, 0x9a7048, 0.02); for (const s of [-1, 1]) { K.box(M.wood, -0.9, 0.9, 0.85, 1.05, s * 0.45 - 0.03, s * 0.45 + 0.03, 0x8a6040, 0.01); spokedWheel(K, 0.3, 0.55, s * 0.52, 0.55, 0x8a6040); } K.beam(M.wood, [-0.9, 0.8, 0.3], [-1.8, 0.95, 0.3], 0.04, 0x8a6040); K.beam(M.wood, [-0.9, 0.8, -0.3], [-1.8, 0.95, -0.3], 0.04, 0x8a6040);
    for (let i = 0; i < 18; i++) K.put(M.paint, sph(0.08, 8, 6), -0.7 + (i % 6) * 0.27, 0.93 + Math.floor(i / 6) * 0.06, -0.3 + Math.floor(i / 6) * 0.25, 0, 0, 0, 1, 1, 1, [0xc8382a, 0xe8a030, 0x8ab040][i % 3]); });
  buildK(K, root);
  // ---- extra window bears (slot 0 = the hero on the pedestal is part of the static set)
  { const x0 = Wn.x0, x1 = Wn.x1, y0 = Wn.y0, bz = Wn.back, cx = (x0 + x1) / 2 - 0.05, slots = [];
    const rows = [[y0 + 0.44, bz + 0.1, 0.3, [-0.4, 0.4, -0.75, 0.75, -0.15, 0.15]], [y0 + 0.22, bz + 0.32, 0.34, [-0.38, 0.38, -0.78, 0.78]], [y0, fz - 0.62, 0.36, [-0.44, 0.48, -0.86, 0.9]], [y0, fz - 0.38, 0.3, [-0.25, 0.22, -1.3, 1.18, -0.7]]];
    const order = []; rows.forEach(([y, z, s, xs], r) => xs.forEach((dx, k) => order.push([cx + dx, y, z, -dx * 0.25 + (R1(r * 9 + k) - 0.5) * 0.3, s * (0.92 + R1(k * 3 + r) * 0.16), r * 10 + k])));
    order.sort((a, b) => (a[5] % 10) - (b[5] % 10) || a[5] - b[5]); for (const o of order) slots.push(o.slice(0, 5));
    WBEARS = bearSwarm(root, slots, 4); WBEARS.setN(0); }
  // glass + its reflections, halos at the lamps, snow
  { const g = noink(mesh(root, plane(Wn.x1 - Wn.x0, Wn.y1 - Wn.y0), M.glass, (Wn.x0 + Wn.x1) / 2, (Wn.y0 + Wn.y1) / 2, fz + 0.02, 0, 0, 0, false)); g.renderOrder = 5; }
  for (const [x, z] of [[-15, curbF - 0.35], [5.4, curbF - 0.35], [22, curbF - 0.35], [-6, curbN + 0.35], [14, curbN + 0.35]]) { const h = noink(mesh(root, plane(1.6, 1.6), M.halo, x, 3.47, z, 0, 0, 0, false)); h.renderOrder = 6; }
  { const h = noink(mesh(root, plane(4.6, 1.6), M.halo.clone(), (Wn.x0 + Wn.x1) / 2, 0.2, fz + 0.6, -Math.PI / 2, 0, 0, false)); h.material.opacity = 0.12; h.renderOrder = 6; }
  { const N = 900, im = new THREE.InstancedMesh(plane(1, 1), M.flake, N); im.frustumCulled = false; im.renderOrder = 7; noink(im); root.add(im); const P = [];
    for (let i = 0; i < N; i++) P.push([-14 + R1(i * 1.3) * 28, R1(i * 2.7) * 9, -6.4 + R1(i * 3.1) * 16.2, 0.035 + R1(i * 4.3) * 0.05, 0.5 + R1(i * 5.9) * 0.6, R1(i * 7.7) * 6.28]);
    SNOW = { im, P, N }; im.visible = false; }
}
function setSnowT(t) {
  if (!SNOW) return; const on = t != null && t !== false && t >= 0; SNOW.im.visible = on; if (!on) return;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), H = 9;
  SNOW.P.forEach(([x, y, z, r, v, ph], i) => { let yy = y - t * v; yy = ((yy % H) + H) % H; p.set(x + Math.sin(t * 0.9 + ph) * 0.25 + t * 0.12, yy, z + Math.cos(t * 0.7 + ph) * 0.15); s.set(r, r, r); m4.compose(p, q, s); SNOW.im.setMatrixAt(i, m4); });
  SNOW.im.instanceMatrix.needsUpdate = true;
}

// ================================================================= SHOP interior + back-room workshop
const SH = { x0: -4.3, x1: 4.3, z0: -3.2, z1: 4.0, h: 3.6, counterTop: 1.0, table: [2.1, 0.78, -1.3] };
let SIGN = null, SBEARS = null;
function sewingMachine(K, x, y, z, ry) { // treadle machine head on a cabinet table (head local: arm along x)
  K.at(x, y, z, ry, () => { const b = 0x1a1820, gold = 0xd8b048;
    K.box(M.paint, -0.24, 0.24, 0, 0.05, -0.12, 0.12, b, 0.02); K.box(M.paint, 0.14, 0.24, 0.05, 0.34, -0.06, 0.06, b, 0.03); K.box(M.paint, -0.22, 0.24, 0.28, 0.36, -0.055, 0.055, b, 0.03);
    K.box(M.paint, -0.26, -0.15, 0.12, 0.36, -0.05, 0.05, b, 0.02); K.put(M.metal, cyl(0.007, 0.007, 0.12, 6), -0.21, 0.07, 0.0, 0, 0, 0, 1, 1, 1, 0xd8d8e0); // needle bar
    K.put(M.metal, cyl(0.08, 0.08, 0.025, 18), 0.28, 0.25, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0xa8a8b0); K.put(M.paint, tor(0.08, 0.01, 4, 18), 0.295, 0.25, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0x2a2a30);
    for (const [a, b2] of [[-0.18, 0.18], [-0.1, 0.1]]) K.box(M.paint, a, b2, 0.36, 0.362, -0.03, 0.03, gold, 0.002); for (let k = 0; k < 5; k++) K.box(M.paint, 0.165, 0.215, 0.1 + k * 0.045, 0.12 + k * 0.045, 0.06, 0.062, gold, 0.002); // gold decals
    K.put(M.metal, cyl(0.004, 0.004, 0.08, 6), 0.05, 0.4, 0, 0, 0, 0, 1, 1, 1, 0xd8d8e0); K.put(M.paint, cyl(0.018, 0.018, 0.04, 10), 0.05, 0.42, 0, 0, 0, 0, 1, 1, 1, 0xc8302c); // spool
    K.box(M.plush, -0.3, -0.05, 0.05, 0.065, -0.1, 0.12, BEAR.fur, 0.005); // plush fabric under the foot
  });
}
function treadleBase(K, x, z, w) { const c = 0x1e1a24;
  for (const s of [-1, 1]) { const xx = x + s * (w / 2 - 0.08); K.box(M.iron, xx - 0.03, xx + 0.03, 0, 0.74, z - 0.22, z - 0.18, c, 0.01); K.box(M.iron, xx - 0.03, xx + 0.03, 0, 0.74, z + 0.18, z + 0.22, c, 0.01);
    K.beam(M.iron, [xx, 0.05, z - 0.2], [xx, 0.7, z + 0.2], 0.03, c); K.beam(M.iron, [xx, 0.05, z + 0.2], [xx, 0.7, z - 0.2], 0.03, c); K.box(M.iron, xx - 0.04, xx + 0.04, 0, 0.05, z - 0.28, z + 0.28, c, 0.01);
    K.put(M.iron, tor(0.09, 0.012, 4, 14), xx, 0.42, z, 0, Math.PI / 2, 0, 1, 1, 1, c); }
  K.put(M.iron, tor(0.22, 0.018, 4, 24), x + w / 2 - 0.2, 0.35, z, 0, Math.PI / 2, 0, 1, 1, 1, c); K.box(M.iron, x - 0.3, x + 0.3, 0.12, 0.15, z - 0.1, z + 0.15, c, 0.01); // flywheel + treadle
  for (let k = 0; k < 5; k++) K.box(M.iron, x - 0.28 + k * 0.14, x - 0.24 + k * 0.14, 0.15, 0.155, z - 0.1, z + 0.15, 0x3a3440, 0.002);
  K.beam(M.iron, [x + w / 2 - 0.2, 0.35, z], [x + w / 2 - 0.25, 0.92, z], 0.006, 0x8a5a3a, true);
}
function buildShop(root) {
  const K = new Kit(), { x0, x1, z0, z1, h } = SH, ct = SH.counterTop;
  K.box(M.floor, x0, x1, -0.1, 0, z0, z1, 0xffffff, 0.01, 1.4); K.box(M.tin, x0, x1, h, h + 0.12, z0, z1, 0xffffff, 0.01, 1.2);
  for (const [a, b, c, d] of [[x0 - 0.15, x0, z0, z1], [x1, x1 + 0.15, z0, z1], [x0, x1, z0 - 0.15, z0]]) { K.box(M.wallShop, a, b, 1.1, h, c, d, 0xffffff, 0.01, 1.4); K.box(M.woodDark, a, b, 0, 1.1, c, d, 0x6a4434, 0.01, 1.0); }
  for (const [a, b, c, d] of [[x0, x0 + 0.04, z0, z1], [x1 - 0.04, x1, z0, z1], [x0, x1, z0, z0 + 0.04]]) { K.box(M.paint, a, b, 1.08, 1.14, c, d, 0x4a2a22, 0.005); K.box(M.paint, a, b, h - 0.2, h, c, d, 0xe8dcc4, 0.02); K.box(M.paint, a, b, 0, 0.12, c, d, 0x3a2420, 0.01); }
  // partition between shop (left) and back-room workshop (right): a wall stub + an open doorway with a drawn curtain
  K.box(M.wallShop, -0.2, 0.0, 0, h, z0, z0 + 1.25, 0xffffff, 0.01, 1.4); K.box(M.wood, -0.25, 0.05, 0, h, z0 + 1.25, z0 + 1.35, 0x6a4434, 0.01);
  K.put(M.fabric, drape(0.7, 2.6, 4, 0.06), -0.1, 2.75, z0 + 1.55, 0, Math.PI / 2, 0, 1, 1, 1, 0x7a3a4a); K.box(M.brass, -0.12, -0.08, 2.74, 2.78, z0 + 1.2, z0 + 2.4, 0xc8a040, 0.01);
  // ---- candy shop (left): counter with a glass case front, scale, register, jars; back shelves of jars
  const cz0 = -1.0, cz1 = -0.35, cxa = -3.9, cxb = -0.7;
  K.box(M.woodDark, cxa, cxb, 0, ct - 0.05, cz0, cz1, 0x6a3a28, 0.02, 1.0); K.box(M.wood, cxa - 0.05, cxb + 0.05, ct - 0.05, ct, cz0 - 0.05, cz1 + 0.05, 0x9a6a44, 0.01, 1.2);
  for (let k = 0; k < 4; k++) { const a = cxa + 0.1 + k * (cxb - cxa - 0.2) / 4, b = a + (cxb - cxa - 0.2) / 4 - 0.08; K.box(M.paint, a, b, 0.12, 0.38, cz1, cz1 + 0.02, 0x8a4a32, 0.01); K.box(M.paint, a, b, 0.45, ct - 0.12, cz1 - 0.01, cz1 + 0.005, 0x241a24, 0.005); // dark case glass
    for (let i = 0; i < 6; i++) K.put(M.paint, sph(0.035, 8, 6), a + 0.08 + i * (b - a - 0.16) / 5, 0.55, cz1 - 0.12, 0, 0, 0, 1, 0.6, 1, [0xe84a4a, 0xf0c040, 0x5ab06a, 0xf4e8d8, 0x6a3a24, 0xc85ab0][(i + k) % 6]); }
  const sjar = (x, y, z, s, c1, c2) => K.at(x, y, z, 0, () => { K.put(M.jar, lathe('sj', [[0, 0], [0.09, 0], [0.1, 0.02], [0.1, 0.24], [0.07, 0.28], [0.06, 0.3], [0, 0.3]], 16), 0, 0, 0); K.put(M.metal, cyl(0.065, 0.065, 0.035, 14), 0, 0.31, 0, 0, 0, 0, 1, 1, 1, 0xd8d0c0); K.put(M.paint, cyl(0.088, 0.088, 0.16, 14), 0, 0.09, 0, 0, 0, 0, 1, 1, 1, c1); K.put(M.paint, sph(0.08, 10, 6), 0, 0.17, 0, 0, 0, 0, 1, 0.4, 1, c2); }, s);
  const JC = [[0xe84a4a, 0xf8e0e0], [0xf0c040, 0xf8e8a0], [0x5ab06a, 0xc8f0c0], [0xc85ab0, 0xf0c8e8], [0x4a8ad8, 0xd0e0f8], [0x6a3a24, 0x9a6040], [0xf8f0e0, 0xf0a8a8]];
  for (let k = 0; k < 6; k++) sjar(cxa + 0.35 + k * 0.4, ct, -0.75, 1.15, ...JC[k % 7]);
  // balance scale (brass)
  K.at(-1.45, ct, -0.7, 0, () => { K.box(M.brass, -0.18, 0.18, 0, 0.04, -0.1, 0.1, 0x8a6a3a, 0.01); K.put(M.brass, cyl(0.02, 0.025, 0.36, 8), 0, 0.22, 0, 0, 0, 0, 1, 1, 1, 0xc8a040); K.box(M.brass, -0.26, 0.26, 0.4, 0.42, -0.012, 0.012, 0xc8a040, 0.004);
    for (const s of [-1, 1]) { K.beam(M.brass, [s * 0.25, 0.41, 0], [s * 0.25, 0.2, 0], 0.006, 0xc8a040, true); K.put(M.brass, cyl(0.11, 0.07, 0.04, 16), s * 0.25, 0.18, 0, 0, 0, 0, 1, 1, 1, 0xd8b048); }
    for (let i = 0; i < 5; i++) K.put(M.paint, sph(0.025, 6, 4), -0.25 + (i % 3 - 1) * 0.04, 0.215, (Math.floor(i / 3) - 0.5) * 0.04, 0, 0, 0, 1, 1, 1, 0xe84a4a); });
  // cash register (ornate brass box, no lettering)
  K.at(-3.45, ct, -0.75, 0.2, () => { K.box(M.brass, -0.22, 0.22, 0, 0.18, -0.2, 0.2, 0xc8a040, 0.02); K.box(M.brass, -0.2, 0.2, 0.18, 0.42, -0.2, 0.05, 0xb8903a, 0.03); K.box(M.paint, -0.14, 0.14, 0.32, 0.4, 0.05, 0.06, 0x2a2228, 0.005);
    for (let i = 0; i < 12; i++) K.put(M.paint, cyl(0.016, 0.016, 0.02, 8), -0.15 + (i % 6) * 0.06, 0.2, 0.08 + Math.floor(i / 6) * 0.06, 0, 0, 0, 1, 1, 1, 0xf2ead8); K.put(M.brass, tor(0.05, 0.012, 4, 12), 0.25, 0.25, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0xc8a040); });
  K.box(M.paint, -2.5, -2.2, ct, ct + 0.18, -0.6, -0.45, 0xd8b88a, 0.005); for (let k = 0; k < 5; k++) K.box(M.paint, -2.15 + k * 0.01, -1.9 + k * 0.01, ct + k * 0.006, ct + 0.005 + k * 0.006, -0.95, -0.6, 0xd8b88a, 0.002); // paper bags
  // back shelves of jars + the flip sign
  for (let s = 0; s < 4; s++) { const y = 1.15 + s * 0.48; K.box(M.wood, cxa, cxb + 0.2, y - 0.04, y, z0 + 0.04, z0 + 0.4, 0x8a5a3a, 0.01); for (let k = 0; k < 8; k++) sjar(cxa + 0.2 + k * 0.4, y, z0 + 0.22, 0.85 + (k % 2) * 0.1, ...JC[(k + s * 3) % 7]); }
  for (const xx of [cxa, cxb + 0.2]) K.box(M.wood, xx - 0.04, xx + 0.04, 0, 3.0, z0 + 0.04, z0 + 0.42, 0x6a4434, 0.01); K.box(M.wood, cxa, cxb + 0.2, 0, 1.1, z0 + 0.04, z0 + 0.5, 0x6a4434, 0.01, 1.0);
  for (let k = 0; k < 6; k++) K.box(M.paint, cxa + 0.1 + k * 0.53, cxa + 0.55 + k * 0.53, 0.15, 0.95, z0 + 0.5, z0 + 0.52, 0x7a4a36, 0.01); // drawers
  for (let k = 0; k < 6; k++) K.put(M.brass, sph(0.02, 6, 4), cxa + 0.325 + k * 0.53, 0.75, z0 + 0.53, 0, 0, 0, 1, 1, 1, 0xc8a040);
  // wall lamp + hanging lamp over the counter
  for (const [lx, lz] of [[-1.3, -0.7], [2.1, -1.3]]) { K.put(M.brass, cyl(0.008, 0.008, 1.0, 6), lx, h - 0.5, lz, 0, 0, 0, 1, 1, 1, 0x3a3030); K.put(M.brass, cyl(0.05, 0.07, 0.12, 12), lx, h - 1.05, lz, 0, 0, 0, 1, 1, 1, 0xc8a040); K.put(M.paint, cyl(0.12, 0.3, 0.18, 18, true), lx, h - 1.2, lz, 0, 0, 0, 1, 1, 1, 0x2f5a46); K.put(M.glowWarm, sph(0.07, 10, 6), lx, h - 1.27, lz); }
  // ---- workshop (right): sewing table + treadle machine, fabric bolts, stuffing, thread, scissors, half-finished bears
  const [tx, ty, tz] = SH.table, tw = 1.3, td = 0.62;
  K.box(M.woodDark, tx - tw / 2, tx + tw / 2, ty - 0.04, ty, tz - td / 2, tz + td / 2, 0x7a4a30, 0.01, 1.0); K.box(M.woodDark, tx - tw / 2 + 0.02, tx - tw / 2 + 0.45, ty - 0.22, ty - 0.04, tz - td / 2 + 0.03, tz + td / 2 - 0.03, 0x6a4030, 0.01);
  treadleBase(K, tx, tz, tw); sewingMachine(K, tx - 0.15, ty, tz - 0.05, Math.PI);
  K.put(M.pattern, plane(0.4, 0.4), tx - 0.4, ty + 0.003, tz + 0.12, -Math.PI / 2, 0, 0.3);
  for (let i = 0; i < 4; i++) { K.put(M.paint, cyl(0.022, 0.022, 0.05, 10), tx + 0.45 + (i % 2) * 0.06, ty + 0.025, tz + 0.18 - Math.floor(i / 2) * 0.06, 0, 0, 0, 1, 1, 1, [0xc8302c, 0x7a4a2a, 0x2a2a30, 0xe8dcc0][i]); K.put(M.wood, cyl(0.026, 0.026, 0.008, 10), tx + 0.45 + (i % 2) * 0.06, ty + 0.054, tz + 0.18 - Math.floor(i / 2) * 0.06, 0, 0, 0, 1, 1, 1, 0xd8b888); }
  K.at(tx - 0.15, ty + 0.006, tz + 0.2, 0.6, () => { for (const s of [-1, 1]) { K.box(M.metal, 0, 0.18, -0.003, 0.003, s * 0.006 - 0.008, s * 0.006 + 0.008, 0xc8c8d0, 0.002); K.put(M.metal, tor(0.025, 0.007, 4, 12), -0.03, 0, s * 0.03, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2a30); } }); // scissors
  for (let i = 0; i < 7; i++) K.put(M.fabric, sph(0.045 + R1(i) * 0.03, 8, 6), tx - 0.5 + R1(i * 3) * 0.25, ty + 0.03, tz - 0.2 + R1(i * 5) * 0.2, 0, 0, 0, 1, 0.7, 1, 0xf8f4ee); // stuffing tufts
  K.at(tx - 0.3, ty, tz - 0.1, 0.4, () => bear(K, { part: 'body', arms: false, ribbon: false }), 0.4); // headless body
  K.at(tx + 0.5, ty, tz - 0.17, -0.6, () => bear(K, { part: 'head' }), 0.4); // a loose head
  K.at(tx - 0.62, ty, tz + 0.05, 0.3, () => { K.put(M.plush, sph(0.03, 10, 6), 0, 0.03, 0, 0, 0, Math.PI / 2, 1, 2.2, 1, BEAR.fur); K.put(M.plush, sph(0.03, 10, 6), 0.03, 0.03, 0.08, 0, 0.4, Math.PI / 2, 1, 2.2, 1, BEAR.fur); }); // loose arms
  // chair at the machine
  K.at(tx + 0.1, 0, tz - 0.62, 0, () => { K.box(M.wood, -0.2, 0.2, 0.44, 0.48, -0.2, 0.2, 0x8a5a3a, 0.02); for (const [a, b] of [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]]) K.put(M.wood, cyl(0.02, 0.02, 0.44, 6), a, 0.22, b, 0, 0, 0, 1, 1, 1, 0x6a4030); for (const a of [-0.17, 0.17]) K.put(M.wood, cyl(0.018, 0.018, 0.5, 6), a, 0.73, 0.19, 0, 0, 0, 1, 1, 1, 0x6a4030); K.box(M.wood, -0.18, 0.18, 0.86, 0.96, 0.17, 0.21, 0x8a5a3a, 0.02); });
  // fabric bolts rack (right wall) + leaning bolts + stuffing sack + basket of stuffing
  K.box(M.wood, x1 - 0.55, x1 - 0.05, 0, 1.9, -2.6, -0.4, 0x6a4434, 0.01); for (let s = 0; s < 4; s++) K.box(M.wood, x1 - 0.55, x1 - 0.05, 0.1 + s * 0.48, 0.13 + s * 0.48, -2.6, -0.4, 0x8a5a3a, 0.01);
  const FC = [0x9a6234, 0xb88a4a, 0x7a4a2e, 0xc8a068, 0xe8dcc0, 0x8a3a3a, 0x3a5a8a, 0xd8b048];
  for (let s = 0; s < 4; s++) for (let k = 0; k < 4; k++) K.box(M.fabric, x1 - 0.52, x1 - 0.08, 0.13 + s * 0.48, 0.13 + s * 0.48 + 0.12 + R1(s * 4 + k) * 0.08, -2.5 + k * 0.5, -2.12 + k * 0.5, FC[(s * 3 + k) % 8], 0.03, 0.6);
  for (let k = 0; k < 3; k++) K.cb(M.fabric, 0.12, 1.2, 0.5, x1 - 0.8 - k * 0.16, 0.6, 0.1 + k * 0.1, FC[k], 0, 0, 0.12 + k * 0.03, 0.04);
  K.put(M.fabric, sph(0.35, 12, 10), x1 - 0.7, 0.35, 0.9, 0, 0, 0, 1, 1.1, 0.9, 0xd8c8a8); K.put(M.fabric, cyl(0.12, 0.2, 0.15, 10), x1 - 0.7, 0.75, 0.9, 0, 0, 0, 1, 1, 1, 0xd8c8a8);
  K.put(M.wood, cyl(0.3, 0.24, 0.35, 16, true), tx - 1.1, 0.175, tz + 0.2, 0, 0, 0, 1, 1, 1, 0xb8905a); for (let i = 0; i < 9; i++) K.put(M.fabric, sph(0.1 + R1(i) * 0.05, 8, 6), tx - 1.1 + (R1(i * 2) - 0.5) * 0.35, 0.35 + R1(i * 7) * 0.12, tz + 0.2 + (R1(i * 3) - 0.5) * 0.35, 0, 0, 0, 1, 0.8, 1, 0xf8f4ee);
  // back window (workshop) with a dusky alley view
  const wx = 2.6, wy0 = 1.35, wy1 = 2.75, ww = 1.0; K.box(M.paint, wx - ww / 2 - 0.08, wx + ww / 2 + 0.08, wy0 - 0.1, wy0, z0, z0 + 0.14, 0xe8dcc4, 0.01); K.box(M.paint, wx - ww / 2 - 0.08, wx + ww / 2 + 0.08, wy1, wy1 + 0.1, z0, z0 + 0.1, 0xe8dcc4, 0.01);
  for (const xx of [wx - ww / 2 - 0.04, wx + ww / 2 + 0.04, wx]) K.box(M.paint, xx - 0.03, xx + 0.03, wy0, wy1, z0, z0 + 0.06, 0xe8dcc4, 0.005); K.box(M.paint, wx - ww / 2, wx + ww / 2, (wy0 + wy1) / 2 - 0.025, (wy0 + wy1) / 2 + 0.025, z0, z0 + 0.06, 0xe8dcc4, 0.005);
  K.put(M.backView, plane(ww, wy1 - wy0), wx, (wy0 + wy1) / 2, z0 + 0.03);
  // bear shelves (back wall right) for setBears; frame + boards
  const bx0 = 0.35, bx1 = 3.95; for (let s = 0; s < 4; s++) { const y = 0.45 + s * 0.62; if (y < wy1 + 0.1 && y > wy0 - 0.3) { K.box(M.wood, bx0, wx - ww / 2 - 0.15, y - 0.04, y, z0 + 0.04, z0 + 0.42, 0x8a5a3a, 0.01); K.box(M.wood, wx + ww / 2 + 0.15, bx1, y - 0.04, y, z0 + 0.04, z0 + 0.42, 0x8a5a3a, 0.01); } else K.box(M.wood, bx0, bx1, y - 0.04, y, z0 + 0.04, z0 + 0.42, 0x8a5a3a, 0.01); }
  for (const xx of [bx0, bx1]) K.box(M.wood, xx - 0.04, xx + 0.04, 0, 2.5, z0 + 0.04, z0 + 0.44, 0x6a4434, 0.01);
  // floor clutter: crate of finished bears' boxes, thread on floor, rug
  K.put(M.rug, plane(2.4, 1.5), -2.2, 0.005, 1.3, -Math.PI / 2, 0, 0); K.box(M.wood, 0.5, 1.1, 0, 0.4, -2.45, -1.95, 0xb89060, 0.01); K.box(M.wood, 0.55, 1.15, 0.4, 0.75, -2.4, -2.0, 0xa8804a, 0.01);
  // the flip sign hangs over the counter (built separately; flips CANDY -> TOYS)
  buildK(K, root);
  SIGN = new THREE.Group(); SIGN.position.set(-2.3, 3.1, z0 + 0.6); root.add(SIGN);
  { const SK = new Kit(), w = 2.0, hh = 0.5, gold = '#f2d27a';
    SK.box(M.woodDark, -w / 2 - 0.06, w / 2 + 0.06, -hh / 2 - 0.06, hh / 2 + 0.06, -0.03, 0.03, 0x4a2a20, 0.015); SK.put(signMat('CANDY', '#8a2a2a', gold, { w: 1024, h: 256, fs: 0.62 }), plane(w, hh), 0, 0, 0.032); SK.put(signMat('TOYS', '#2f4a7a', gold, { w: 1024, h: 256, fs: 0.62 }), plane(w, hh), 0, 0, -0.032, Math.PI, 0, 0); // [TEDDY-story] back face turned about x (was y) so TOYS reads upright after the x-axis flip
    for (const s of [-1, 1]) { SK.put(M.brass, cyl(0.03, 0.03, 0.06, 8), s * (w / 2 + 0.09), 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0xc8a040); }
    buildK(SK, SIGN); }
  { const HK = new Kit(); for (const s of [-1, 1]) { HK.beam(M.iron, [-2.3 + s * 1.09, 3.1, z0 + 0.6], [-2.3 + s * 1.09, h, z0 + 0.6], 0.012, 0x2a2228, true); HK.put(M.iron, tor(0.035, 0.008, 4, 10), -2.3 + s * 1.12, 3.1, z0 + 0.6, 0, Math.PI / 2, 0, 1, 1, 1, 0x2a2228); } buildK(HK, root); }
  // bear slots: 4 shelves (back wall right) + a pile on the crate/floor + a few on the counter end
  { const slots = []; for (let s = 0; s < 4; s++) { const y = 0.45 + s * 0.62; for (let k = 0; k < 9; k++) { const x = bx0 + 0.25 + k * 0.42; if (y < wy1 + 0.1 && y > wy0 - 0.3 && Math.abs(x - wx) < ww / 2 + 0.2) continue; slots.push([x, y, z0 + 0.22, (R1(s * 9 + k) - 0.5) * 0.4, 0.34 + R1(k + s) * 0.04]); } }
    slots.sort((a, b) => a[1] - b[1] || Math.abs(a[0] - 2) - Math.abs(b[0] - 2));
    for (let i = 0; i < 10; i++) slots.push([0.6 + (i % 4) * 0.16 + R1(i) * 0.05, 0.75 + Math.floor(i / 4) * 0.2, -2.2 + (R1(i * 3) - 0.5) * 0.3, (R1(i * 5) - 0.5) * 1.2, 0.3, (R1(i * 7) - 0.5) * 0.5, (R1(i * 9) - 0.5) * 0.4]);
    for (let i = 0; i < 6; i++) slots.push([-0.95 - i * 0.24, ct, -0.55 + (i % 2) * 0.15, (R1(i + 40) - 0.5) * 0.6, 0.3]);
    SBEARS = bearSwarm(root, slots, 4); SBEARS.setN(0); }
}

// ================================================================= KIDS nursery (night)
const KD = { x0: -3.0, x1: 3.0, z0: -2.5, z1: 3.2, h: 3.0, win: [0.7, 1.0, 2.45, 1.25] };
function buildKids(root) {
  const K = new Kit(), { x0, x1, z0, z1, h } = KD, [wx, wy0, wy1, ww] = KD.win;
  K.box(M.floor, x0, x1, -0.1, 0, z0, z1, 0xffffff, 0.01, 1.2); K.box(M.paint, x0, x1, h, h + 0.1, z0, z1, 0x9a9ac8, 0.01);
  const wall = (a, b, c, d) => { K.box(M.wallKids, a, b, 0.9, h, c, d, 0xffffff, 0.01, 1.3); K.box(M.paint, a, b, 0, 0.9, c, d, 0xe8e0d0, 0.01); };
  wall(x0 - 0.15, x0, z0, z1); wall(x1, x1 + 0.15, z0, z1);
  K.box(M.wallKids, x0, wx - ww / 2, 0.9, h, z0 - 0.15, z0, 0xffffff, 0.01, 1.3); K.box(M.wallKids, wx + ww / 2, x1, 0.9, h, z0 - 0.15, z0, 0xffffff, 0.01, 1.3); K.box(M.wallKids, wx - ww / 2, wx + ww / 2, wy1, h, z0 - 0.15, z0, 0xffffff, 0.01, 1.3); K.box(M.wallKids, wx - ww / 2, wx + ww / 2, 0.9, wy0, z0 - 0.15, z0, 0xffffff, 0.01, 1.3);
  K.box(M.paint, x0, x1, 0, 0.9, z0 - 0.15, z0, 0xe8e0d0, 0.01);
  for (const [a, b, c, d] of [[x0, x0 + 0.04, z0, z1], [x1 - 0.04, x1, z0, z1], [x0, x1, z0, z0 + 0.04]]) { K.box(M.paint, a, b, 0.88, 0.94, c, d, 0xf4f0e8, 0.005); K.box(M.paint, a, b, 0, 0.12, c, d, 0xf4f0e8, 0.01); K.box(M.paint, a, b, h - 0.12, h, c, d, 0xf4f0e8, 0.01); }
  // window: frame, sill, mullions, curtains
  K.box(M.paint, wx - ww / 2 - 0.1, wx + ww / 2 + 0.1, wy0 - 0.08, wy0, z0 - 0.15, z0 + 0.14, 0xf4f0e8, 0.01); K.box(M.paint, wx - ww / 2 - 0.1, wx + ww / 2 + 0.1, wy1, wy1 + 0.1, z0 - 0.15, z0 + 0.06, 0xf4f0e8, 0.01);
  for (const xx of [wx - ww / 2 - 0.04, wx + ww / 2 + 0.04, wx]) K.box(M.paint, xx - 0.035, xx + 0.035, wy0, wy1, z0 - 0.1, z0 + 0.04, 0xf4f0e8, 0.005); K.box(M.paint, wx - ww / 2, wx + ww / 2, (wy0 + wy1) / 2 - 0.03, (wy0 + wy1) / 2 + 0.03, z0 - 0.1, z0 + 0.04, 0xf4f0e8, 0.005);
  K.put(M.moonView, plane(ww + 0.1, wy1 - wy0 + 0.1), wx, (wy0 + wy1) / 2, z0 - 0.12);
  for (const s of [-1, 1]) K.put(M.fabric, drape(0.5, 1.75, 3, 0.05), wx + s * (ww / 2 + 0.2), wy1 + 0.2, z0 + 0.12, 0, 0, 0, 1, 1, 1, 0xe8c8d8); K.box(M.brass, wx - ww / 2 - 0.5, wx + ww / 2 + 0.5, wy1 + 0.2, wy1 + 0.24, z0 + 0.08, z0 + 0.12, 0xc8a040, 0.01);
  // a potted geranium + a toy boat on the sill
  K.put(M.paint, cyl(0.07, 0.055, 0.12, 12), wx - 0.35, wy0 + 0.06, z0 + 0.05, 0, 0, 0, 1, 1, 1, 0xb85a3a); for (let i = 0; i < 6; i++) K.put(M.paint, sph(0.045, 8, 6), wx - 0.35 + (R1(i) - 0.5) * 0.12, wy0 + 0.17 + R1(i * 3) * 0.08, z0 + 0.05 + (R1(i * 5) - 0.5) * 0.08, 0, 0, 0, 1, 1, 1, i % 2 ? 0xd83a4a : 0x4a8a4a);
  K.at(wx + 0.3, wy0, z0 + 0.05, 0.3, () => { K.box(M.paint, -0.12, 0.12, 0, 0.05, -0.04, 0.04, 0xc8302c, 0.02); K.beam(M.wood, [0, 0.05, 0], [0, 0.22, 0], 0.008, 0x8a5a3a); K.put(M.fabric, plane(0.1, 0.13), 0.04, 0.14, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0xf4f0e8); });
  // iron bed with brass knobs, mattress, quilt, pillow
  const bx0 = -2.75, bx1 = -1.55, bz0 = z0 + 0.08, bz1 = z0 + 2.0, my = 0.55, ic = 0xf2eee6;
  K.box(M.paint, bx0, bx1, 0.25, my, bz0 + 0.05, bz1, 0xf4f0e8, 0.04, 1.0); // mattress
  K.box(M.quilt, bx0 - 0.06, bx1 + 0.06, my - 0.02, my + 0.06, bz0 + 0.55, bz1 + 0.03, 0xffffff, 0.04, 1.4); K.box(M.quilt, bx0 - 0.07, bx0 - 0.03, 0.3, my + 0.04, bz0 + 0.55, bz1, 0xffffff, 0.01, 1.4); K.box(M.quilt, bx1 + 0.03, bx1 + 0.07, 0.3, my + 0.04, bz0 + 0.55, bz1, 0xffffff, 0.01, 1.4); K.box(M.quilt, bx0 - 0.06, bx1 + 0.06, 0.3, my + 0.04, bz1, bz1 + 0.05, 0xffffff, 0.01, 1.4);
  K.box(M.fabric, bx0, bx1, my + 0.04, my + 0.09, bz0 + 0.5, bz0 + 0.7, 0xf8f4ee, 0.03); // folded sheet
  K.put(M.fabric, sph(0.3, 14, 8), (bx0 + bx1) / 2, my + 0.08, bz0 + 0.28, 0, 0, 0, 1.6, 0.4, 0.8, 0xf8f4f0); // pillow
  for (const [zz, hh] of [[bz0, 1.25], [bz1 + 0.05, 0.85]]) { for (const xx of [bx0 - 0.05, bx1 + 0.05]) { K.put(M.iron, cyl(0.025, 0.025, hh, 8), xx, hh / 2, zz, 0, 0, 0, 1, 1, 1, ic); K.put(M.brass, sph(0.045, 10, 8), xx, hh + 0.02, zz, 0, 0, 0, 1, 1, 1, 0xd8b048); }
    xcyl(K, M.iron, 0.02, bx0 - 0.05, bx1 + 0.05, hh - 0.05, zz, ic); xcyl(K, M.iron, 0.015, bx0 - 0.05, bx1 + 0.05, 0.32, zz, ic); for (let k = 1; k < 6; k++) K.put(M.iron, cyl(0.011, 0.011, hh - 0.37, 6), bx0 - 0.05 + k * (bx1 - bx0 + 0.1) / 6, 0.32 + (hh - 0.37) / 2, zz, 0, 0, 0, 1, 1, 1, ic);
    K.put(M.brass, tor(0.07, 0.01, 4, 16), (bx0 + bx1) / 2, hh - 0.2, zz, 0, 0, 0, 1, 1, 1, 0xd8b048); }
  // THE teddy bear on the pillow
  K.at((bx0 + bx1) / 2 + 0.05, my + 0.16, bz0 + 0.3, 0.25, () => bear(K, {}), 0.42);
  // nightstand with a little oil lamp (glow), a book, a cup
  const nx = -1.15, nz = z0 + 0.3; K.box(M.woodDark, nx - 0.25, nx + 0.25, 0, 0.62, nz - 0.22, nz + 0.22, 0x7a4a30, 0.02); K.box(M.woodDark, nx - 0.28, nx + 0.28, 0.62, 0.66, nz - 0.25, nz + 0.25, 0x8a5a3a, 0.01); K.box(M.paint, nx - 0.2, nx + 0.2, 0.36, 0.56, nz + 0.22, nz + 0.23, 0x6a3a28, 0.005);
  K.put(M.brass, cyl(0.06, 0.08, 0.06, 12), nx + 0.08, 0.69, nz - 0.05, 0, 0, 0, 1, 1, 1, 0xc8a040); K.put(M.jar, lathe('chim', [[0.03, 0], [0.06, 0.06], [0.03, 0.2], [0.03, 0.22]], 12), nx + 0.08, 0.72, nz - 0.05); K.put(M.glowWarm, sph(0.018, 8, 6), nx + 0.08, 0.77, nz - 0.05, 0, 0, 0, 1, 1.6, 1);
  K.box(M.paint, nx - 0.2, nx - 0.02, 0.66, 0.7, nz - 0.1, nz + 0.14, 0x3a5a8a, 0.01); K.put(M.paint, cyl(0.035, 0.03, 0.07, 12), nx - 0.1, 0.735, nz + 0.12, 0, 0, 0, 1, 1, 1, 0xf2e8d8);
  // rug, rocking horse, blocks, toy train, ball, drum, picture frames, toy shelf with a doll + jack-in-the-box
  K.put(M.rugK, plane(2.6, 1.7), 0.2, 0.005, 0.5, -Math.PI / 2, 0, 0.1);
  K.at(1.75, 0, -0.9, -0.7, () => { const c = 0xf2ead8; for (const s of [-1, 1]) K.put(M.wood, tor(0.75, 0.03, 4, 24, 0.9), 0, 0.82, s * 0.18, 0, 0, Math.PI * 1.5 - 0.45, 1, 1, 1, 0xc8302c);
    K.put(M.paint, sph(0.25, 14, 10), 0, 0.55, 0, 0, 0, 0, 1.5, 0.75, 0.7, c); K.put(M.paint, cyl(0.07, 0.1, 0.38, 10), 0.32, 0.72, 0, 0, 0, -0.6, 1, 1, 0.8, c); K.put(M.paint, rboxGeo(0.32, 0.14, 0.13, 0.05, 2, 2), 0.47, 0.86, 0, 0, 0, -0.5, 1, 1, 1, c);
    for (const [lx, lz] of [[0.2, 0.1], [0.2, -0.1], [-0.2, 0.1], [-0.2, -0.1]]) K.beam(M.paint, [lx, 0.5, lz], [lx * 1.5, 0.15, lz * 1.6], 0.035, c); K.box(M.paint, -0.1, 0.12, 0.72, 0.75, -0.19, 0.19, 0xc8302c, 0.02);
    for (let k = 0; k < 6; k++) K.put(M.paint, sph(0.03, 6, 4), 0.28 - k * 0.045, 0.8 + k * 0.015, 0, 0, 0, 0, 1, 1.5, 1, 0x5a3a2a); K.put(M.paint, cone(0.05, 0.3, 6), -0.38, 0.52, 0, 0, 0, 2.2, 1, 1, 1, 0x5a3a2a); K.put(M.paint, sph(0.018, 6, 4), 0.5, 0.92, 0.06, 0, 0, 0, 1, 1, 1, 0x101018); });
  for (let i = 0; i < 7; i++) { const s = 0.13; K.put(M.blocks[i % 4], rboxGeo(s, s, s, 0.01, s), -0.2 + (i % 4) * 0.2 + (i > 3 ? 0.1 : 0), s / 2 + (i > 3 ? s : 0), 0.95 + (i % 2) * 0.05 - (i > 3 ? 0 : 0), 0, (R1(i) - 0.5) * 0.6, 0); }
  K.put(M.blocks[2], rboxGeo(0.13, 0.13, 0.13, 0.01, 0.13), 0.1, 0.32, 0.97, 0, 0.3, 0);
  K.at(0.9, 0, 1.4, 0.4, () => { K.box(M.paint, -0.15, 0.15, 0.06, 0.2, -0.08, 0.08, 0x2a3a6a, 0.02); K.put(M.paint, cyl(0.07, 0.07, 0.22, 12), 0.08, 0.15, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0x2a3a6a); K.put(M.paint, cyl(0.03, 0.04, 0.1, 8), 0.14, 0.27, 0, 0, 0, 0, 1, 1, 1, 0x1a1a22); K.box(M.paint, -0.15, -0.02, 0.2, 0.32, -0.08, 0.08, 0xc8302c, 0.02);
    for (const xx of [-0.1, 0.1]) for (const s of [-1, 1]) K.put(M.paint, cyl(0.05, 0.05, 0.02, 12), xx, 0.05, s * 0.09, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8b048);
    for (let c = 1; c < 3; c++) { K.box(M.paint, -0.15 - c * 0.36, 0.05 - c * 0.36, 0.06, 0.2, -0.08, 0.08, [0xc8302c, 0x3a8a5a][c - 1], 0.02); for (const xx of [-0.08, 0.02]) for (const s of [-1, 1]) K.put(M.paint, cyl(0.04, 0.04, 0.02, 12), xx - c * 0.36, 0.04, s * 0.09, Math.PI / 2, 0, 0, 1, 1, 1, 0xd8b048); } });
  K.put(M.paint, sph(0.12, 14, 10), -0.7, 0.12, 1.6, 0, 0, 0, 1, 1, 1, 0xe85a3a); K.put(M.paint, tor(0.12, 0.012, 4, 20), -0.7, 0.12, 1.6, 0, 0.4, 0, 1, 1, 1, 0xf4e8c8);
  K.at(2.3, 0, 0.8, 0, () => { K.put(M.paint, cyl(0.17, 0.17, 0.2, 16), 0, 0.1, 0, 0, 0, 0, 1, 1, 1, 0xc8302c); for (const y of [0.01, 0.19]) K.put(M.paint, tor(0.17, 0.015, 4, 18), 0, y, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0xf2e6c8); for (let k = 0; k < 6; k++) K.beam(M.paint, [Math.cos(k) * 0.17, 0.02, Math.sin(k) * 0.17], [Math.cos(k + 0.5) * 0.17, 0.18, Math.sin(k + 0.5) * 0.17], 0.006, 0xd8b048); });
  K.box(M.woodDark, x1 - 0.4, x1 - 0.05, 0, 1.4, -0.4, 1.1, 0x8a5a3a, 0.02); for (let s = 0; s < 3; s++) K.box(M.wood, x1 - 0.42, x1 - 0.05, 0.42 + s * 0.45, 0.45 + s * 0.45, -0.4, 1.1, 0x9a6a44, 0.01);
  K.at(x1 - 0.22, 0.87, 0.05, -Math.PI / 2, () => { K.put(M.paint, cyl(0.08, 0.1, 0.22, 10), 0, 0.11, 0, 0, 0, 0, 1, 1, 1, 0x6a8ac8); K.put(M.paint, sph(0.075, 12, 8), 0, 0.29, 0, 0, 0, 0, 1, 1, 1, 0xf2d0b0); K.put(M.paint, sph(0.08, 12, 8), 0, 0.32, -0.015, 0, 0, 0, 1, 0.9, 1, 0xd8a050); for (const s of [-1, 1]) K.put(M.paint, sph(0.012, 6, 4), s * 0.025, 0.3, 0.066, 0, 0, 0, 1, 1, 1, 0x1a1a22); }); // doll
  K.at(x1 - 0.22, 0.45, 0.6, -Math.PI / 2, () => { K.box(M.paint, -0.1, 0.1, 0, 0.2, -0.1, 0.1, 0x3a8a5a, 0.015); K.put(M.paint, sph(0.07, 10, 8), 0, 0.33, 0, 0, 0, 0, 1, 1, 1, 0xf2d0b0); K.put(M.paint, cone(0.07, 0.14, 10), 0, 0.44, 0, 0, 0, 0, 1, 1, 1, 0xc8302c); for (let k = 0; k < 4; k++) K.put(M.metal, tor(0.04, 0.01, 4, 10), 0, 0.21 + k * 0.025, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0xc8c8d0); });
  for (let k = 0; k < 4; k++) K.box(M.blocks[k], x1 - 0.35, x1 - 0.2, 1.35, 1.5, -0.3 + k * 0.17, -0.15 + k * 0.17, 0xffffff, 0.01);
  for (const [px, py, pw, ph] of [[x0 + 0.01, 1.75, 0.5, 0.4], [x0 + 0.01, 1.9, 0.35, 0.45]]) { K.box(M.wood, px, px + 0.04, py, py + ph, 0.5 + (pw > 0.4 ? 0 : 0.8), 0.5 + (pw > 0.4 ? 0 : 0.8) + pw, 0xc8a040, 0.01); }
  K.box(M.paint, -0.6, 0.0, 1.9, 2.3, z0 + 0.0, z0 + 0.03, 0xc8a040, 0.01); K.box(M.paint, -0.56, -0.04, 1.94, 2.26, z0 + 0.03, z0 + 0.035, 0x5a6aa8, 0.003); K.put(M.paint, sph(0.07, 10, 6), -0.3, 2.12, z0 + 0.04, 0, 0, 0, 1, 1, 0.2, 0xf4e8b0); // little moon picture
  buildK(K, root);
  // moonbeam through the window + window glow
  for (let i = 0; i < 2; i++) { const m = noink(mesh(root, plane(0.9 + i * 0.3, 2.6), M.beam, wx - 0.4 - i * 0.2, 1.15, z0 + 1.0, -1.0, 0.15, 0, false)); m.renderOrder = 3; }
    { const m = noink(mesh(root, plane(0.7, 0.7), M.halo.clone(), nx + 0.08, 0.78, nz + 0.02, 0, 0, 0, false)); m.material.opacity = 0.2; m.renderOrder = 5; }
}

// ================================================================= WORLD globe (starry)
const GL = { c: [0, 5.6, 0], r: 4.6, lon0: -40 };
let GLOBE = null, GBEARS = null, GDIR = [];
const CITIES = [[40.7, -74], [51.5, 0], [48.8, 2.3], [55.7, 37.6], [30, 31.2], [6.5, 3.4], [-1.3, 36.8], [19, 72.8], [39.9, 116.4], [35.7, 139.7], [-33.9, 151.2], [-22.9, -43.2], [-34.6, -58.4], [19.4, -99.1], [-12, -77], [-33.9, 18.4], [41, 29], [35.7, 51.4], [-6.2, 106.8], [14.6, 121], [37.5, 127], [61.2, -149.9], [45.5, -73.6], [34, -118.2], [41.9, -87.6], [29.8, -95.4], [64.1, -21.9], [59.3, 18], [52.5, 13.4], [40.4, -3.7], [41.9, 12.5], [9, 38.7], [-4.3, 15.3], [15.6, 32.5], [24.7, 46.7], [33.7, 73], [13.7, 100.5], [21, 105.8], [-37.8, 145], [4.7, -74.1], [10.5, -66.9], [-15.8, -47.9], [-3.1, -60], [49.3, -123.1], [53.5, -113.5], [21.3, -157.8], [18.5, -69.9], [-18.9, 47.5], [-25.7, 28.2], [12, -1.5], [33.6, -7.6], [37.9, 23.7], [50.4, 30.5], [43.1, 131.9], [62, 129.7], [56, 92.9], [47.9, 106.9], [28.6, 77.2], [23.8, 90.4]];
const ll2v = (lat, lon) => { const phi = (lon + 180) / 180 * Math.PI, th = (90 - lat) / 180 * Math.PI; return new THREE.Vector3(-Math.cos(phi) * Math.sin(th), Math.cos(th), Math.sin(phi) * Math.sin(th)); };
function buildWorld(root) {
  GLOBE = new THREE.Group(); GLOBE.position.set(...GL.c); root.add(GLOBE);
  const phi0 = (GL.lon0 + 180) / 180 * Math.PI; GLOBE.rotation.set(0.32, Math.PI / 2 - phi0, 0.18, 'ZXY');
  const earth = mesh(GLOBE, new THREE.SphereGeometry(GL.r, 96, 64), M.earth, 0, 0, 0, 0, 0, 0, true);
  // tiny bears standing on the land (pop-in via setGlobeBears)
  const slots = []; GDIR = [];
  for (let i = 0; i < CITIES.length; i++) { const [la, lo] = CITIES[i], n = ll2v(la, lo); GDIR.push(n); slots.push([0, 0, 0, 0, 0.55]); }
  GBEARS = bearSwarm(GLOBE, slots, 6);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), sc = new THREE.Vector3(), tw = new THREE.Quaternion();
  GBEARS.setScales = (fn) => { GBEARS.ims.forEach((list, v) => { let j = 0; for (let si = v; si < GDIR.length; si += 6) { const n = GDIR[si], k = fn(si); q.setFromUnitVectors(up, n); tw.setFromAxisAngle(up, (R1(si) - 0.5) * 1.2); q.multiply(tw); m4.compose(n.clone().multiplyScalar(GL.r - 0.02), q, sc.setScalar(Math.max(1e-4, 0.66 * k))); for (const im of list) { im.setMatrixAt(j, m4); im.count = Math.max(im.count, j + 1); } j++; } for (const im of list) { im.instanceMatrix.needsUpdate = true; } }); };
  // (bearSwarm slots are assigned round-robin by index % variants: slot si -> variant si % 6, instance floor(si / 6))
  // cloud puffs orbiting, stars, sparkles, nebula, a soft blue atmosphere halo
  const K = new Kit(); for (let i = 0; i < 9; i++) { const n = ll2v(-50 + R1(i * 3) * 110, -180 + R1(i * 5) * 360).multiplyScalar(GL.r + 0.45 + R1(i) * 0.3);
    K.at(n.x, n.y, n.z, R1(i * 7) * 6, () => { for (let k = 0; k < 4; k++) K.put(M.cloud, sph(0.32 - k * 0.04, 12, 8), (k - 1.5) * 0.3, (k % 2) * 0.08, 0, 0, 0, 0, 1, 0.7, 0.8, 0xf8f6ff); }); }
  buildK(K, GLOBE, false);
  { const h = noink(mesh(root, plane(GL.r * 3.0, GL.r * 3.0), M.haloBlue, GL.c[0], GL.c[1], GL.c[2] - GL.r * 0.4, 0, 0, 0, false)); h.renderOrder = -2; }
  { const n = noink(mesh(root, plane(90, 90), M.nebula, 0, 8, -40, 0, 0, 0, false)); n.renderOrder = -3; }
  for (let i = 0; i < 70; i++) { const s = 0.25 + R1(i * 3) * (i % 9 === 0 ? 1.2 : 0.4), m = noink(mesh(root, plane(s, s), M.sparkle, -26 + R1(i) * 52, -6 + R1(i * 2) * 34, -18 - R1(i * 5) * 14, 0, 0, R1(i * 7), false)); m.renderOrder = -1; }
  earth.receiveShadow = true;
}
function setGlobeBearsT(t) { // t 0..1: tiny bears pop up one after another (staggered, with a little overshoot)
  if (!GBEARS) return; const N = GDIR.length, order = GDIR.map((n, i) => i);
  GBEARS.setScales((si) => { const t0 = (si / N) * 0.75, x = Math.max(0, Math.min(1, (t - t0) / 0.18)); if (x <= 0) return 0; const e = 1 - Math.pow(1 - x, 3); return e + Math.sin(x * Math.PI) * 0.35; });
}

// ================================================================= lights, grades, views
const SET_LIGHT = {
  street: { top: '#141c4a', hor: '#7a7ab8', fog: '#4a4a7a', fogN: 30, fogF: 120, sky: '#6a7ad0', ground: '#2a2440', hemiI: 1.15, fillCol: '#5a6ad8', fillI: 0.35, sunCol: '#b8c0ff', sunI: 1.5, az: 50, el: 28, disc: '#000000', discSize: 0.001, stars: 0.3, clouds: false, cloud: '#3a4070', cardTint: '#e8ecff', fxTint: '#eef2ff', shafts: 0, aoK: 0.8 },
  window: { top: '#141c4a', hor: '#7a7ab8', fog: '#4a4a7a', fogN: 30, fogF: 120, sky: '#6a7ad0', ground: '#2a2440', hemiI: 0.85, fillCol: '#5a6ad8', fillI: 0.3, sunCol: '#b8c0ff', sunI: 0.9, az: -120, el: 26, disc: '#000000', stars: 0, clouds: false, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0, aoK: 0.8 },
  shop: { top: '#000000', hor: '#2a2018', fog: '#2a2018', fogN: 12, fogF: 60, sky: '#f0d8b8', ground: '#3a2a30', hemiI: 0.8, fillCol: '#7a80c8', fillI: 0.25, sunCol: '#ffd8a8', sunI: 0.7, az: 30, el: 55, disc: '#000000', clouds: false, shadow: false, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0, aoK: 0.7 },
  kids: { top: '#000000', hor: '#141a3a', fog: '#141a3a', fogN: 12, fogF: 60, sky: '#6a7ad0', ground: '#2a2440', hemiI: 0.5, fillCol: '#5a6ad8', fillI: 0.3, sunCol: '#a8b8ff', sunI: 1.6, az: 175, el: 32, disc: '#000000', clouds: false, shadow: true, stars: 0, cardTint: '#e8ecff', fxTint: '#ffffff', shafts: 0, aoK: 0.7 },
  world: { top: '#070a26', hor: '#2a2060', fog: '#141040', fogN: 80, fogF: 300, sky: '#8a8ae0', ground: '#3a2a60', hemiI: 0.75, fillCol: '#7a6ae0', fillI: 0.6, sunCol: '#ffe0b8', sunI: 3.2, az: 35, el: 30, disc: '#000000', stars: 1, clouds: false, shadow: true, cardTint: '#fff0e8', fxTint: '#ffffff', shafts: 0, aoK: 0.5 },
};
const SET_GRADE = {
  street: { look: 'night', over: { exp: 1.45, con: 1.2, lift: [0.05, 0.05, 0.085], tH: ['#ffc080', 0.08], bloom: [0.45, 0.72], hal: [0.3, '#ff8a3a'], vig: [0.3, 0.46, '#2a2a5a'] } },
  window: { look: 'night', over: { exp: 1.45, con: 1.2, lift: [0.05, 0.05, 0.085], tH: ['#ffc080', 0.08], bloom: [0.45, 0.72], hal: [0.3, '#ff8a3a'], vig: [0.34, 0.44, '#2a2a5a'] } },
  shop: { look: 'office', over: { exp: 1.55, con: 1.22, lift: [0.065, 0.05, 0.07], tH: ['#ffc890', 0.04], bloom: [0.42, 0.8], hal: [0.24, '#ff7a3a'], vig: [0.32, 0.46, '#3a2a4a'] } },
  kids: { look: 'night', over: { exp: 1.5, con: 1.26, lift: [0.05, 0.045, 0.085], tH: ['#ffc890', 0.06], bloom: [0.45, 0.72], hal: [0.3, '#ff9a4a'], vig: [0.34, 0.44, '#2a2a5a'] } },
  world: { look: 'night', over: { exp: 1.35, con: 1.2, lift: [0.04, 0.035, 0.08], tH: ['#ffd8a0', 0.05], bloom: [0.45, 0.72], hal: [0.2, '#ff8a6a'], vig: [0.3, 0.5, '#1a1a4a'] } },
};
const SET_PRACT = {
  street: [{ p: [-1.2, 1.7, -5.4], col: '#ffb860', I: 3.2, d: 8 }, { p: [1.45, 1.9, -6.3], col: '#ffc070', I: 1.4, d: 4 }, { p: [-6, 3.4, 7.35], col: '#ffb060', I: 2.2, d: 10 }, { p: [5.4, 3.4, -4.35], col: '#ffb060', I: 1.6, d: 9 }],
  window: [{ p: [-1.25, 2.45, -6.9], col: '#ffc070', I: 1.3, d: 3.0 }, { p: [-1.2, 1.5, -5.2], col: '#ffb060', I: 0.7, d: 3.0 }, { p: [5.4, 3.4, -4.35], col: '#ffb060', I: 1.4, d: 9 }, { p: [-1.2, 1.2, -2.5], col: '#8a9aff', I: 0.8, d: 5 }],
  shop: [{ p: [2.1, 2.3, -1.3], col: '#ffc070', I: 2.6, d: 5.5 }, { p: [-1.3, 2.3, -0.7], col: '#ffc070', I: 2.6, d: 6 }, { p: [2.6, 2.0, -2.6], col: '#8a9aff', I: 0.9, d: 3.5 }, { p: [-0.5, 2.6, 2.5], col: '#ffd8a8', I: 0.8, d: 7 }],
  kids: [{ p: [-1.07, 1.0, -1.5], col: '#ffb060', I: 1.5, d: 4.0 }, { p: [0.3, 1.6, -0.6], col: '#8a9aff', I: 1.1, d: 5 }, { p: [1.5, 2.2, 2.0], col: '#7a80d8', I: 0.7, d: 6 }],
  world: [{ p: [-6.5, 10, -5], col: '#8a7aff', I: 5, d: 22 }, { p: [7, 3, -4], col: '#ff8ac8', I: 3, d: 18 }],
};

export function buildBrooklyn(ctx) {
  ({ THREE, toon, mkTex, PT } = ctx); M = materials(); NOINK.clear();
  const groups = {};
  for (const name of ['street', 'shop', 'kids', 'world']) { const g = new THREE.Group(); g.name = 'brooklyn_' + name; g.position.set(...O[name]); g.visible = false; ctx.scene.add(g); groups[name] = g; }
  buildStreet(groups.street); buildShop(groups.shop); buildKids(groups.kids); buildWorld(groups.world);
  if (ctx.NOND) { for (const m of NOINK) ctx.NOND.add(m); for (const k in groups) groups[k].traverse((o) => { if (o.isMesh && (o.material === M.glass || o.material === M.jar)) { ctx.NOND.add(o); o.castShadow = o.receiveShadow = false; } }); }
  let nW = 1, nS = 0, signT = 0;
  const queue = []; for (let i = 0; i < 10; i++) queue.push(W3('street', [1.45 + 0.45 + i * 0.78, 0.16, ST.curbF - 1.2 + (i % 2) * 0.12]));
  const spots = {
    // street
    streetOrigin: W3('street', [0, 0, 0]), shopDoor: W3('street', [1.45, 0.16, ST.fz - 0.5]), shopFront: W3('street', [-0.4, 0.16, ST.fz + 0.9]), queue,
    windowFront: W3('street', [-1.25, 0.16, ST.fz + 0.75]), windowLook: [W3('street', [-1.85, 0.16, ST.fz + 1.0]), W3('street', [-0.7, 0.16, ST.fz + 1.1])], sidewalk: W3('street', [-6, 0.16, ST.fz + 1.2]),
    lamp: W3('street', [5.4, 3.47, ST.curbF - 0.35]), wagon: W3('street', [-8.0, 0, 3.4]), horse: W3('street', [-3.7, 0, 3.4]), wagonSeat: W3('street', [-6.9, 1.36, 3.4]), road: W3('street', [0, 0, 1.5]), oppositeSidewalk: W3('street', [0, 0.16, ST.curbN + 1.2]),
    // window (heroes inside the display)
    heroBear: W3('street', [(ST.win.x0 + ST.win.x1) / 2 - 0.05, ST.win.y0 + 0.2, ST.fz - 0.75]), teddyCard: W3('street', [(ST.win.x0 + ST.win.x1) / 2 + 0.37, ST.win.y0 + 0.2, ST.fz - 0.44]), clipping: W3('street', [(ST.win.x0 + ST.win.x1) / 2 - 0.67, ST.win.y0 + 0.76, ST.win.back + 0.13]), windowGlass: W3('street', [(ST.win.x0 + ST.win.x1) / 2, 1.7, ST.fz]),
    // shop
    shopOrigin: W3('shop', [0, 0, 0]), behindCounter: W3('shop', [-2.2, 0, -1.6]), counterFront: W3('shop', [-2.0, 0, 0.3]), counterTop: W3('shop', [-2.3, SH.counterTop, -0.7]), sign: W3('shop', [-2.3, 3.1, SH.z0 + 0.6]),
    sewingChair: W3('shop', [SH.table[0] + 0.1, 0, SH.table[2] - 0.62]), sewer: W3('shop', [SH.table[0] + 0.05, 0, SH.table[2] - 0.72]), sewingTable: W3('shop', SH.table), bearShelves: W3('shop', [2.1, 1.2, SH.z0 + 0.22]), workshopFloor: W3('shop', [1.4, 0, 0.9]), shopDoorIn: W3('shop', [0.5, 0, 3.5]),
    // kids
    kidsOrigin: W3('kids', [0, 0, 0]), bed: W3('kids', [-2.15, 0.55, KD.z0 + 1.1]), bedSide: W3('kids', [-1.15, 0, KD.z0 + 1.2]), pillowBear: W3('kids', [-2.1, 0.71, KD.z0 + 0.38]), kidFloor: W3('kids', [0.3, 0, 0.6]), nursWindow: W3('kids', [KD.win[0], 1.7, KD.z0]),
    // world
    globeCenter: W3('world', GL.c), globeRadius: GL.r, globeTop: W3('world', [GL.c[0], GL.c[1] + GL.r, GL.c[2]]), globeFront: W3('world', [GL.c[0], GL.c[1], GL.c[2] + GL.r]), globeKids: [W3('world', [-2.4, 0.4, 5.6]), W3('world', [2.4, 0.4, 5.6])],
  };
  const V = (set, p, l, fov, cInf, fp, extra = {}) => { const c = { set, p: W3(set, p), l: W3(set, l), fov, cInf, fp: fp ? W3(set, fp) : null, ...extra }; c.focus = Math.hypot(...[0, 1, 2].map((i) => c.p[i] - (c.fp || c.l)[i])); return c; };
  const views = [
    V('street', [9.5, 1.55, 5.2], [-1.2, 3.6, -6.2], 50, 2.5, [3.5, 1.2, -5.2], { cards: 'queue', snow: 1 }),        // 0 street wide: along the block to the candy shop, queue, wire, fire escapes
    V('street', [-6.6, 1.65, 1.3], [0.8, 2.45, -6.2], 48, 4, [1.9, 1.3, -5.2], { cards: 'queue', snow: 1 }),           // 1 shop-front medium: awning, sign, window, the line at the door
    V('street', [2.6, 1.35, 8.2], [-5.6, 2.2, 1.0], 44, 3, [-2.8, 2.2, 3.4], { cards: 'queue', snow: 1 }),         // 2 low wide with the horse + wagon foreground
    V('window', [-1.25, 1.55, -2.3], [-1.25, 1.3, -7.0], 38, 5, [-1.25, 1.2, -7.0], { cards: 'look', bears: 1, snow: 1 }), // 3 window medium from the sidewalk (kids looking in)
    V('window', [-0.75, 1.22, -4.7], [-1.05, 1.06, -7.0], 34, 8, [-1.2, 1.15, -7.1], { bears: 1 }),                // 4 window close: the bear + the card
    V('window', [-1.25, 1.45, -3.3], [-1.25, 1.3, -7.0], 40, 5, [-1.25, 1.2, -7.0], { bears: 19, snow: 1 }),        // 5 window full of bears
    V('shop', [1.3, 1.75, 3.4], [-1.9, 1.7, -2.6], 50, 2.5, [-2.2, 1.4, -1.6], { cards: 'shop', bears: 6 }),          // 6 shop wide: counter left, workshop right
    V('shop', [3.0, 1.55, 1.9], [1.9, 1.05, -1.6], 44, 5, [2.1, 1.1, -1.9], { cards: 'sew', bears: 14 }),             // 7 workshop medium: sewing table, machine, half-made bears
    V('shop', [-1.8, 2.1, 1.4], [-2.3, 2.55, -2.6], 44, 5, [-2.3, 3.1, -2.6], { sign: 0.5 }),                       // 8 counter + sign mid-flip (CANDY -> TOYS)
    V('shop', [-0.5, 1.7, 2.7], [2.0, 1.35, -2.8], 50, 3, [2.0, 1.3, -2.6], { bears: 52, sign: 1 }),             // 9 shop wide, toy company: shelves full, TOYS sign
    V('kids', [0.8, 1.4, 2.9], [-1.35, 0.95, -2.0], 52, 3, [-2.1, 0.8, -2.1], {}),                                   // 10 nursery wide: bed, window + moon, toys
    V('kids', [-1.5, 1.08, -0.55], [-2.05, 0.78, -2.2], 38, 8, [-2.1, 0.85, -2.15], {}),                                // 11 nursery close: the bear on the pillow
    V('world', [0, 6.0, 27], [0, 5.7, 0], 40, 2, [0, 5.6, 4.6], { globe: 1 }),                                     // 12 world wide: the painted globe with tiny bears
    V('world', [1.8, 9.2, 17], [0, 7.2, 0], 36, 4, [0, 8.4, 3.6], { globe: 1 }),                                   // 13 world medium: bears popping over Europe/Africa
  ];
  const API = {
    groups, origin: O, spots, views, sets: SETS, sign: SIGN, globe: GLOBE,
    // street/window: snow flurries. t = seconds (animate with (f - f0) / 30); null / false / negative = off
    setSnow: (t) => setSnowT(t),
    // window display (n = total bears incl. the hero, 1..20) and shop shelves (0..52): setBears sets both; or use the specific ones
    setBears(n, n2) { API.setWindowBears(n); API.setShopBears(n2 ?? n); },
    setWindowBears(n) { nW = n; WBEARS.setN(Math.max(0, n - 1)); },
    setShopBears(n) { nS = n; SBEARS.setN(n); },
    // shop sign flip 0 = CANDY, 1 = TOYS (smooth flip about the horizontal axis)
    setSign(t) { signT = Math.max(0, Math.min(1, t)); const e = signT * signT * (3 - 2 * signT); SIGN.rotation.x = e * Math.PI; },
    // world: 0 = none, 1 = every bear popped (staggered west -> east); spin = extra globe rotation (rad)
    setGlobeBears: (t) => setGlobeBearsT(t),
    setGlobeSpin(a) { const phi0 = (GL.lon0 + 180) / 180 * Math.PI; GLOBE.rotation.set(0.32, Math.PI / 2 - phi0 + a, 0.18, 'ZXY'); },
    lightFor(name) { const base = name === 'shop' ? 'office' : 'explain'; return { ...LIGHTS_[base], practI: 0, ...SET_LIGHT[name] }; },
    gradeFor: (name) => ({ ...((SET_GRADE[name] || {}).over || {}) }), lookFor: (name) => (SET_GRADE[name] || {}).look || 'night',
    show(world, name) { const gk = name ? GRP[name] : null; for (const k in groups) groups[k].visible = k === gk;
      if (name) { for (const k of ['road', 'stadium', 'office', 'car', 'dc']) if (world[k]) world[k].visible = false; for (const k of ['rooms', 'louvre', 'paris', 'station', 'theatre', 'havana', 'reef']) if (world[k] && world[k].show) world[k].show(world, null); }
      if (SI && !name) SI.g.visible = false; },
    placeLights(PRACT, name, tgt) { const Lp = SET_PRACT[name] || [];
      PRACT.forEach((l, i) => { const c = Lp[i]; l.visible = true; if (!c) { l.intensity = 0; return; } l.position.set(...W3(name, c.p)); l.color.set(c.col); l.intensity = c.I; l.distance = c.d; l.decay = 1.6; }); },
    // test-view helper (main.js ?brooklynview=N | a): { i, mod, set, L, look, grade, cam, ... }
    viewFor(i, f = 0) { const k = ((i % views.length) + views.length) % views.length, c = views[k]; return { i: k, f, mod: API, set: c.set, cards: c.cards, bears: c.bears ?? 1, snow: c.snow || 0, sign: c.sign || 0, globe: c.globe || 0, L: API.lightFor(c.set), look: API.lookFor(c.set), grade: API.gradeFor(c.set), cam: { p: c.p, l: c.l, fov: c.fov, focus: c.focus, cInf: c.cInf, roll: c.roll || 0, shadowAt: c.fp || c.l } }; },
    apply(world, v) { API.show(world, v.set); const nb = v.bears ?? 1; API.setWindowBears(v.set === 'shop' ? 1 : nb); API.setShopBears(v.set === 'shop' ? nb : 0); API.setSign(v.sign || 0); API.setSnow(v.snow ? 2.0 + (v.f || 0) / 30 : null); API.setGlobeBears(v.globe ?? 0); standIns(API, v); },
  };
  API.view = API.viewFor; API.setBears(1, 0); API.setSign(0); API.setSnow(null); API.setGlobeBears(0);
  globalThis.__brooklyn = API;
  return API;
}

// ---------------------------------------------------------------- test stand-ins (Oddverra cards for scale, ?brooklynview stills only)
let SI = null;
function standIns(API, v) {
  if (!SI) { SI = { g: new THREE.Group(), cards: [] }; SI.g.name = 'brooklyn_standins'; API.groups.street.parent.add(SI.g);
    const geo = new THREE.PlaneGeometry(1.35, 2.25); geo.translate(0, 1.069, 0);
    const mk = (o, op) => { const cv = document.createElement('canvas'); cv.width = 600; cv.height = 1000; oddverra(cv.getContext('2d'), o, op); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: 0.8, color: new THREE.Color(0xffffff).multiplyScalar(0.4), alphaTest: 0.5, side: THREE.DoubleSide })); m.castShadow = true; SI.g.add(m); return m; };
    const sk = ['#f2c9a4', '#d8a47c', '#f6d0b0', '#e8b890'];
    SI.cards.push(mk({ shirt: '#f4f0e6', pants: '#3a3440', hair: 'short', hairCol: '#2a1a12', moustache: '#2a1a12', skin: '#f2c9a4', head: 'round', neck: 'tie', seed: 1 }, { expr: 'grin', t: 3 })); // Morris
    SI.cards.push(mk({ shirt: '#6a3a5a', pants: '#4a2a40', hair: 'bun', hairCol: '#3a2418', lashes: true, skin: '#f6d0b0', head: 'egg', seed: 2 }, { expr: 'smile', t: 5 })); // Rose
    for (let i = 0; i < 12; i++) SI.cards.push(mk({ shirt: ['#5a6a8a', '#8a3a3a', '#3a5a4a', '#a8885a'][i % 4], pants: '#2f2f3a', hat: ['bowler', 'cap', undefined][i % 3], hatCol: '#2a2430', hair: i % 3 === 1 ? 'curly' : 'short', hairCol: '#2a1a12', skin: sk[i % 4], head: ['round', 'wide', 'egg'][i % 3], lashes: i % 3 === 1, build: i % 4 === 3 ? 'kid' : 'adult', seed: 10 + i }, { expr: ['excited', 'happy', 'grin', 'smile'][i % 4], t: i * 5, view: i % 2 ? '34L' : 'front' }));
    for (let i = 0; i < 2; i++) SI.cards.push(mk({ shirt: ['#8a3a3a', '#3a5a8a'][i], pants: '#2f2f3a', hat: i ? 'cap' : undefined, hatCol: '#3a3440', hair: i ? 'short' : 'curly', hairCol: '#4a2a18', skin: sk[i], build: 'kid', lashes: !i, seed: 40 + i }, { expr: 'happy', view: 'back' })); }
  for (const m of SI.cards) m.visible = false; SI.g.visible = !!v.cards; if (!v.cards) return;
  const cp = v.cam.p, put = (m, p) => { m.position.set(...p); m.rotation.set(0, Math.atan2(cp[0] - p[0], cp[2] - p[2]), 0); m.visible = true; };
  const S = API.spots;
  if (v.cards === 'queue') for (let i = 0; i < 10; i++) put(SI.cards[2 + i], S.queue[i]);
  if (v.cards === 'look') { put(SI.cards[14], S.windowLook[0]); put(SI.cards[15], S.windowLook[1]); }
  if (v.cards === 'shop') { put(SI.cards[0], S.behindCounter); put(SI.cards[1], S.sewer); }
  if (v.cards === 'sew') put(SI.cards[1], S.sewer);
}
