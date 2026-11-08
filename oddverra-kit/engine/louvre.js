// louvre.js [MONA-louvre]: the Louvre sets for the 1911 Mona Lisa theft short.
//   gallery  : the Salon Carré (1911), red damask, coved ceiling + skylight      group origin (0, 0, -1600)
//   stair    : narrow stone dog-leg service stairwell                            group origin (40, 0, -1600)
//   exterior : a short stretch of Louvre street front, doorway + queue pavement   group origin (0, 0, -1800)
// Each set is built in a local frame (floor y = 0). Geometry goes through world.js Kit (rounded boxes merged per
// material). Textures: paint.js + new painters here (damask, parquet, gilt, ashlar, the generic salon canvases and
// drawMona). All painted works are generic inventions except the Mona Lisa, which is a simplified painted rendition
// of the public-domain Leonardo portrait (drawMona works standalone on any 2D canvas).
import { Kit, rboxGeo, instance, signMat, props } from './world.js';
import { LIGHTS_ } from './story.js';
import { oddverra } from './oddverra_next.js';
import * as PT from './paint.js';

let THREE, toon, mkTex, Mx;
export const ORIGIN = { gallery: [0, 0, -1600], stair: [40, 0, -1600], exterior: [0, 0, -1800] };
const INK = '#2b1d4a';

// ---------------------------------------------------------------- geometry cache + small helpers
const GEO = new Map();
const cached = (k, mk) => { let g = GEO.get(k); if (!g) { g = mk(); GEO.set(k, g); } return g; };
const cyl = (rt, rb, h, rs = 12, open = false, t0 = 0, tl = Math.PI * 2) => cached(`c${rt}|${rb}|${h}|${rs}|${open}|${t0}|${tl}`, () => new THREE.CylinderGeometry(rt, rb, h, rs, 1, open, t0, tl));
const sph = (r, ws = 12, hs = 8) => cached(`s${r}|${ws}|${hs}`, () => new THREE.SphereGeometry(r, ws, hs));
const tor = (r, t, rs = 6, ts = 20, arc = Math.PI * 2) => cached(`t${r}|${t}|${rs}|${ts}|${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));
const lathe = (key, pts, n = 14) => cached('la' + key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n));
const plane = (w, h) => cached(`p${w}|${h}`, () => new THREE.PlaneGeometry(w, h));
const R = (seed) => PT.rng(seed);
const css = (c, a) => PT.css(c, a), shade = (c, k) => PT.shade(c, k), tint = (c, k) => PT.tint(c, k);
const tex = (w, h, draw) => mkTex(w, h, draw);
const mesh = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz, 'YXZ'); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
// a local-uv plane: uv = (x - u0, y - v0) / s, so a patch lines up with a wall's texture
const uvPlane = (w, h, u0, v0, s) => { const g = new THREE.PlaneGeometry(w, h); const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - u0) / s, (p.getY(i) - v0) / s); return g; };

// ================================================================= painters (calm fills + drawn darker-shade marks)
// Red silk damask: tone-on-tone ogee motif (pomegranate + palmette + scroll leaves), half-drop repeat, satin sheen.
export function damask(g, w, h, o = {}) {
  const base = PT.hex(o.base || '#8a1f25'), ground = shade(base, 0.82), sat = o.faded ? tint(base, 1.06) : base;
  g.fillStyle = css(ground); g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 2) { g.fillStyle = css(shade(ground, 0.9), (x / 2) % 2 ? 0.16 : 0.06); g.fillRect(x, 0, 1, h); }
  const half = (big) => { // in a 100-unit space, x >= 0 side; mirrored by caller
    const P = new Path2D();
    // pomegranate body
    P.ellipse(0, 30, 30, 36, 0, -Math.PI / 2, Math.PI / 2);
    // palmette petals (fan)
    for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + 0.28 + i * 0.32, cx = Math.cos(a) * 34, cy = -6 + Math.sin(a) * 34; P.moveTo(0, -4); P.ellipse(cx, cy, 22, 7, a, 0, Math.PI * 2); }
    P.moveTo(0, -60); P.ellipse(0, -50, 6, 22, 0, 0, Math.PI * 2);
    // scroll leaf: S curve out and up, curling at the tip
    P.moveTo(8, 70); P.bezierCurveTo(60, 80, 96, 30, 78, -20); P.bezierCurveTo(70, -60, 40, -70, 46, -96); P.bezierCurveTo(70, -80, 96, -40, 92, 0); P.bezierCurveTo(90, 50, 60, 92, 8, 82); P.closePath();
    // stem and small leaf
    P.rect(-1, 64, 6, 62); P.moveTo(4, 112); P.ellipse(26, 112, 22, 7, -0.4, 0, Math.PI * 2);
    if (big) { P.moveTo(52, -118); P.ellipse(40, -118, 16, 6, 0.5, 0, Math.PI * 2); }
    return P;
  };
  const motif = (cx, cy, s, big) => {
    for (const sx of [-1, 1]) {
      g.save(); g.translate(cx, cy); g.scale(sx * s / 100, s / 100); const P = half(big);
      g.fillStyle = css(sat); g.fill(P);
      g.lineWidth = 2.2; g.strokeStyle = css(tint(sat, 1.14), 0.45); g.stroke(P);
      g.fillStyle = css(shade(sat, 0.8), 0.6); for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(8 + (i % 3) * 7, 18 + i * 8, 2.6, 0, 7); g.fill(); }
      g.restore();
    }
  };
  const s = w * 0.22;
  for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) { motif(w / 2 + dx, h / 2 + dy, s, true); motif(dx, dy, s * 0.82, false); }
  PT.modulate(g, w, h, (u, v) => 0.95 + 0.08 * PT.fbm(u, v, 3, 3, 3, o.seed || 11) + 0.04 * Math.sin((u + v) * Math.PI * 4));
}
// Herringbone oak parquet (axis-aligned zigzag; the material rotates it 45 deg). Strip L = 4W, tile = 8W, seamless.
export function parquet(g, w, h, o = {}) {
  const base = PT.hex(o.base || '#a8743e'), Wp = w / 8, L = 4 * Wp, P = w;
  g.fillStyle = css(shade(base, 0.4)); g.fillRect(0, 0, w, h);
  const hash = (x, y) => { const s = Math.sin(((x % P) + P) % P * 12.9898 + (((y % P) + P) % P) * 78.233) * 43758.5453; return s - Math.floor(s); };
  const plank = (x, y, pw, ph, horiz) => {
    if (x > w || y > h || x + pw < 0 || y + ph < 0) return;
    const k = hash(Math.round(x), Math.round(y)), col = PT.vary(base, (k - 0.5) * 0.34), r = R(1 + Math.floor(k * 9999));
    g.save(); g.beginPath(); g.rect(x + 1.5, y + 1.5, pw - 3, ph - 3); g.clip();
    g.fillStyle = css(col); g.fillRect(x, y, pw, ph);
    g.strokeStyle = css(shade(col, 0.72), 0.5); g.lineWidth = 1.4;
    for (let i = 0; i < 6; i++) { const t = (i + 0.5 + (r() - 0.5) * 0.6) / 6; g.beginPath();
      if (horiz) { const yy = y + t * ph; g.moveTo(x, yy); for (let q = 1; q <= 8; q++) g.lineTo(x + q * pw / 8, yy + Math.sin(q * 1.3 + i + k * 9) * 2.2); }
      else { const xx = x + t * pw; g.moveTo(xx, y); for (let q = 1; q <= 8; q++) g.lineTo(xx + Math.sin(q * 1.3 + i + k * 9) * 2.2, y + q * ph / 8); }
      g.stroke(); }
    if (r() < 0.35) { g.strokeStyle = css(shade(col, 0.6), 0.6); const kx = x + pw * (0.2 + 0.6 * r()), ky = y + ph * (0.2 + 0.6 * r()); g.beginPath(); g.ellipse(kx, ky, horiz ? 7 : 4, horiz ? 4 : 7, 0, 0, 7); g.stroke(); }
    g.fillStyle = css(tint(col, 1.18), 0.5); horiz ? g.fillRect(x, y + 2, pw, 2.5) : g.fillRect(x + 2, y, 2.5, ph);
    g.fillStyle = css(shade(col, 0.7), 0.5); horiz ? g.fillRect(x, y + ph - 5, pw, 3) : g.fillRect(x + pw - 5, y, 3, ph);
    g.restore();
  };
  for (let m = -4; m <= 4; m++) for (let k = -14; k <= 14; k++) {
    const x = Wp * (k + 4 * m), y = Wp * (k - 4 * m);
    plank(x, y, L, Wp, true); plank(x + L, y + Wp - L, Wp, L, false);
  }
  PT.modulate(g, w, h, (u, v) => 0.94 + 0.1 * PT.fbm(u, v, 2, 2, 3, 41));
}
// Gilt: warm gold with burnished bands, rubbed red bole showing through; o.orn adds an embossed rosette diaper
export function gilt(g, w, h, o = {}) {
  const base = PT.hex(o.base || '#c99a45'), r = R(o.seed || 5);
  g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  if (o.orn) { const n = 4, c = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = (i + 0.5) * c, y = (j + 0.5) * c;
      g.fillStyle = css(shade(base, 0.6), 0.8); for (let p = 0; p < 6; p++) { const a = p * 1.047; g.beginPath(); g.ellipse(x + Math.cos(a) * c * 0.2 + 2, y + Math.sin(a) * c * 0.2 + 2, c * 0.14, c * 0.07, a, 0, 7); g.fill(); }
      g.fillStyle = css(tint(base, 1.25)); for (let p = 0; p < 6; p++) { const a = p * 1.047; g.beginPath(); g.ellipse(x + Math.cos(a) * c * 0.2, y + Math.sin(a) * c * 0.2, c * 0.13, c * 0.06, a, 0, 7); g.fill(); }
      g.fillStyle = css(shade(base, 0.7)); g.beginPath(); g.arc(x, y, c * 0.08, 0, 7); g.fill();
      g.fillStyle = css(tint(base, 1.4)); g.beginPath(); g.arc(x - 1.5, y - 1.5, c * 0.04, 0, 7); g.fill();
      g.fillStyle = css(shade(base, 0.65), 0.7); for (const [dx, dy] of [[0.5, 0], [0, 0.5]]) { g.beginPath(); g.arc(x + dx * c, y + dy * c, c * 0.05, 0, 7); g.fill(); } } }
  for (let i = 0; i < 10; i++) { g.fillStyle = css('#8a3a22', 0.25); g.beginPath(); g.ellipse(r() * w, r() * h, 3 + r() * 8, 2 + r() * 4, r() * 3, 0, 7); g.fill(); }
  PT.modulate(g, w, h, (u, v) => { const b = 0.86 + 0.28 * PT.fbm(u, v, 2, 4, 3, 7) + 0.1 * Math.sin(v * Math.PI * 6); return [b * 1.02, b, b * 0.94]; });
}
// cut limestone ashlar (o.rustic: deep channelled horizontal joints, the Louvre ground-floor look)
export function ashlar(g, w, h, o = {}) {
  const base = PT.hex(o.base || '#d8ccb2'), r = R(o.seed || 23), rows = o.rows || 4, cols = o.cols || 2, bh = h / rows, bw = w / cols;
  g.fillStyle = css(shade(base, 0.62)); g.fillRect(0, 0, w, h);
  for (let j = 0; j < rows; j++) for (let i = -1; i <= cols; i++) {
    const x = i * bw + (j % 2) * bw / 2 + (o.rustic ? 0 : (r() - 0.5) * bw * 0.2), y = j * bh, col = PT.vary(base, (r() - 0.5) * 0.12), m = o.rustic ? bh * 0.09 : 3;
    g.fillStyle = css(col); g.fillRect(x + (o.rustic ? 1.5 : m / 2), y + m / 2, bw - (o.rustic ? 3 : m), bh - m);
    if (o.rustic) { const gr = g.createLinearGradient(0, y + m / 2, 0, y + m * 2.2); gr.addColorStop(0, css(tint(col, 1.18))); gr.addColorStop(1, css(col, 0)); g.fillStyle = gr; g.fillRect(x, y + m / 2, bw, m * 1.7);
      g.fillStyle = css(shade(col, 0.66), 0.85); g.fillRect(x, y + bh - m * 1.6, bw, m * 1.1); }
    else { g.fillStyle = css(tint(col, 1.12), 0.6); g.fillRect(x + 2, y + 2, bw - 4, 2); g.fillStyle = css(shade(col, 0.75), 0.5); g.fillRect(x + 2, y + bh - 4, bw - 4, 2); }
    for (let k = 0; k < 3; k++) { g.fillStyle = css(shade(col, 0.82), 0.35); g.beginPath(); g.arc(x + r() * bw, y + r() * bh, 1 + r() * 2.5, 0, 7); g.fill(); }
    if (r() < 0.2) { g.strokeStyle = css(shade(col, 0.6), 0.5); g.lineWidth = 1.2; const cx = x + r() * bw, cy = y + r() * bh; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + 8 + r() * 14, cy + (r() - 0.5) * 10); g.lineTo(cx + 14 + r() * 14, cy + (r() - 0.5) * 16); g.stroke(); }
  }
  for (let i = 0; i < 7; i++) { const x = r() * w; const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, css(shade(base, 0.7), 0)); gr.addColorStop(0.5, css(shade(base, 0.7), 0.12)); gr.addColorStop(1, css(shade(base, 0.7), 0)); g.fillStyle = gr; g.fillRect(x, 0, 6 + r() * 16, h); }
  PT.modulate(g, w, h, (u, v) => 0.94 + 0.1 * PT.fbm(u, v, 3, 3, 3, o.seed || 23));
}
// plaster: flat cream with soft mottling (o.stain: damp tide marks for the service stair)
function plaster(g, w, h, o = {}) {
  const base = o.base || '#efe4cc', r = R(o.seed || 9); g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 10; i++) { g.fillStyle = css(shade(base, 0.92), 0.08); g.beginPath(); g.ellipse(r() * w, r() * h, 20 + r() * 50, 10 + r() * 30, r() * 3, 0, 7); g.fill(); }
  if (o.stain) for (let i = 0; i < 4; i++) { const x = r() * w, y = h * (0.6 + r() * 0.35); g.strokeStyle = css(shade(base, 0.7), 0.25); g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, 30 + r() * 40, 14 + r() * 10, 0, Math.PI, 0); g.stroke(); g.fillStyle = css(shade(base, 0.85), 0.12); g.fill(); }
  PT.modulate(g, w, h, (u, v) => 0.94 + 0.1 * PT.fbm(u, v, 3, 3, 3, o.seed || 9));
}
// veined marble (skirting, door architraves, pedestals)
function marble(g, w, h, o = {}) {
  const base = PT.hex(o.base || '#e8e0d2'), r = R(o.seed || 13); g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  for (let i = 0; i < 14; i++) { let x = r() * w, y = r() * h; g.strokeStyle = css(shade(base, 0.55 + r() * 0.25), 0.18 + r() * 0.3); g.lineWidth = 0.8 + r() * 2.2; g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 12; k++) { x += 10 + r() * 25; y += (r() - 0.4) * 22; g.lineTo(x % (w + 40), y); } g.stroke(); }
  PT.modulate(g, w, h, (u, v) => 0.94 + 0.12 * PT.fbm(u, v, 2, 3, 3, o.seed || 13));
}
// big flagstone pavement slabs
function flags(g, w, h, o = {}) {
  const base = PT.hex(o.base || '#b3aa9a'), r = R(o.seed || 31), rows = 4; g.fillStyle = css(shade(base, 0.5)); g.fillRect(0, 0, w, h);
  for (let j = 0; j < rows; j++) { let x = -r() * w * 0.3; const y = j * h / rows; while (x < w) { const bw = w * (0.22 + r() * 0.2), col = PT.vary(base, (r() - 0.5) * 0.16);
    const d = (X) => { g.fillStyle = css(col); g.fillRect(X + 2, y + 2, bw - 4, h / rows - 4); g.fillStyle = css(tint(col, 1.1), 0.5); g.fillRect(X + 3, y + 3, bw - 6, 2);
      for (let k = 0; k < 2; k++) { g.fillStyle = css(shade(col, 0.8), 0.3); g.beginPath(); g.ellipse(X + r() * bw, y + r() * h / rows, 4 + r() * 10, 2 + r() * 5, 0, 0, 7); g.fill(); } };
    d(x); if (x + bw > w) d(x - w); x += bw; } }
  PT.modulate(g, w, h, (u, v) => 0.94 + 0.12 * PT.fbm(u, v, 3, 3, 3, 33));
}
// glazing: dark cool panes with a soft sky reflection
function glazing(g, w, h) { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#4a5a74'); gr.addColorStop(0.45, '#2a3248'); gr.addColorStop(0.55, '#5a6a88'); gr.addColorStop(1, '#232a3c'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
// a Morris column's posters: generic period bills (no real brands)
function posters(g, w, h) {
  g.fillStyle = '#2f4a3a'; g.fillRect(0, 0, w, h); const r = R(77), words = ['THÉÂTRE', 'CONCERT', 'GRAND BAL', 'CIRQUE', 'OPÉRETTE', 'EXPOSITION', 'CHOCOLAT', 'BICYCLETTES'];
  const C = [['#e8d8a8', '#8a2a22'], ['#c8402a', '#f2e6c0'], ['#f0e2b8', '#24406a'], ['#e0b040', '#2a2030'], ['#2a5a8a', '#f2e8c8'], ['#efe6d0', '#3a2a20']];
  let x = 4; let k = 0; while (x < w - 10) { const pw = w * (0.14 + r() * 0.1); let y = 8; while (y < h - 20) { const ph = h * (0.25 + r() * 0.25), [bg, fg] = C[k % C.length];
    g.fillStyle = bg; g.fillRect(x, y, pw - 4, Math.min(ph, h - y - 8)); g.fillStyle = fg; g.font = `bold ${pw * 0.16 | 0}px "DejaVu Serif", serif`; g.textAlign = 'center';
    g.save(); g.translate(x + pw / 2 - 2, y + ph * 0.3); const tw = g.measureText(words[k % words.length]).width; g.scale(Math.min(1, (pw - 14) / tw), 1); g.fillText(words[k % words.length], 0, 0); g.restore();
    g.fillRect(x + 8, y + ph * 0.45, pw - 20, 3); for (let q = 0; q < 3; q++) g.fillRect(x + 10, y + ph * (0.55 + q * 0.1), (pw - 24) * (0.5 + r() * 0.5), 4); y += ph + 6; k++; } x += pw; }
  PT.modulate(g, w, h, (u, v) => 0.9 + 0.12 * PT.fbm(u, v, 3, 3, 2, 5));
}
// light-shaft streaks (additive): u across the beam (soft ends), v along it (fades toward the floor)
function shaftTex(g, w, h) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); const r = R(3); g.filter = 'blur(6px)';
  for (let i = 0; i < 6; i++) { const x = (i + 0.2 + r() * 0.3) * w / 6, bw = w / 6 * (0.5 + r() * 0.3); g.fillStyle = `rgba(255,255,255,${0.6 + r() * 0.4})`; g.fillRect(x, -10, bw, h + 20); } g.filter = 'none';
  PT.modulate(g, w, h, (u, v) => { const e = Math.min(1, u * 5, (1 - u) * 5); return e * (0.2 + 0.8 * Math.pow(1 - v, 1.3)) * Math.min(1, v * 12 + 0.3); }); }

// ================================================================= the generic salon canvases (atlas of 16 cells)
// Every painting here is an invented generic composition, painted loosely, then darkened with old yellow varnish.
const strokeFill = (g, r, x, y, w, h, cols, n, len, ang = 0, a = 0.35) => { for (let i = 0; i < n; i++) { const px = x + r() * w, py = y + r() * h, c = cols[Math.floor(r() * cols.length)]; g.strokeStyle = css(c, a); g.lineWidth = 1.5 + r() * 3; g.lineCap = 'round'; const t = ang + (r() - 0.5) * 0.8, L = len * (0.5 + r()); g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(t) * L, py + Math.sin(t) * L); g.stroke(); } };
const blob = (g, x, y, rx, ry, c, a = 1) => { g.fillStyle = css(c, a); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); };
function paintLandscape(g, s, r, v) {
  const skies = [['#c8b48a', '#e8d8a8'], ['#7a92a8', '#d8d0a8'], ['#b88a5a', '#f0cc88'], ['#8aa0a8', '#e0dcc0']], [sk0, sk1] = skies[v % 4];
  let gr = g.createLinearGradient(0, 0, 0, s * 0.6); gr.addColorStop(0, sk0); gr.addColorStop(1, sk1); g.fillStyle = gr; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 6; i++) blob(g, r() * s, s * (0.1 + r() * 0.25), s * (0.08 + r() * 0.1), s * (0.03 + r() * 0.03), tint(sk1, 1.15), 0.6);
  const hz = s * (0.5 + (r() - 0.5) * 0.12);
  g.fillStyle = css(PT.mixc('#6a7a8a', sk1, 0.35)); g.beginPath(); g.moveTo(0, hz); for (let x = 0; x <= s; x += s / 12) g.lineTo(x, hz - s * (0.04 + 0.08 * r())); g.lineTo(s, hz + 4); g.lineTo(0, hz + 4); g.fill();
  const mid = ['#5a6a3a', '#6a6a3a', '#4a5a3a', '#7a6a42'][v % 4];
  gr = g.createLinearGradient(0, hz, 0, s); gr.addColorStop(0, mid); gr.addColorStop(1, css(shade(mid, 0.45))); g.fillStyle = gr; g.fillRect(0, hz, s, s - hz);
  if (v % 2) { g.fillStyle = css(tint(sk1, 1.05), 0.8); g.beginPath(); g.moveTo(s * 0.3, hz + 4); g.quadraticCurveTo(s * 0.7, hz + s * 0.12, s * 0.45, s); g.lineTo(s * 0.7, s); g.quadraticCurveTo(s * 0.85, hz + s * 0.15, s * 0.42, hz + 4); g.fill(); }
  strokeFill(g, r, 0, hz, s, s - hz, [shade(mid, 0.7), tint(mid, 1.2), '#8a7a4a'], 160, s * 0.03, 0, 0.35);
  const tx = v % 3 === 0 ? s * 0.22 : s * 0.75; // tree clump
  g.fillStyle = css('#3a2a1a'); g.fillRect(tx - 4, hz - s * 0.1, 8, s * 0.3);
  for (let i = 0; i < 16; i++) blob(g, tx + (r() - 0.5) * s * 0.3, hz - s * 0.12 - r() * s * 0.25, s * (0.05 + r() * 0.05), s * (0.04 + r() * 0.04), PT.vary('#3a4a26', (r() - 0.5) * 0.4), 0.9);
  for (let i = 0; i < 2; i++) { const fx = s * (0.3 + r() * 0.4), fy = hz + s * (0.15 + r() * 0.15); blob(g, fx, fy, 3, 8, ['#a82a20', '#e8e0c8', '#2a3a6a'][i % 3]); blob(g, fx, fy - 10, 3, 3, '#e0b088'); }
}
function paintPortrait(g, s, r, v) {
  const bgs = ['#2a2418', '#1e2420', '#3a2a1e', '#22202a'], bg = bgs[v % 4];
  const gr = g.createRadialGradient(s * 0.45, s * 0.35, s * 0.05, s * 0.5, s * 0.5, s * 0.75); gr.addColorStop(0, css(tint(bg, 1.35))); gr.addColorStop(1, bg); g.fillStyle = gr; g.fillRect(0, 0, s, s);
  const cx = s * (0.5 + (r() - 0.5) * 0.08), hy = s * 0.36, garm = ['#1a1a1e', '#5a1a1e', '#1e2a4a', '#2a3a22'][(v + 1) % 4];
  g.fillStyle = css(garm); g.beginPath(); g.moveTo(cx - s * 0.36, s); g.quadraticCurveTo(cx - s * 0.32, s * 0.58, cx, s * 0.56); g.quadraticCurveTo(cx + s * 0.32, s * 0.58, cx + s * 0.36, s); g.fill();
  strokeFill(g, r, cx - s * 0.3, s * 0.62, s * 0.6, s * 0.38, [tint(garm, 1.3), shade(garm, 0.7)], 50, s * 0.05, 1.4, 0.3);
  if (v % 2) { g.fillStyle = css('#ece4d0'); g.beginPath(); g.ellipse(cx, s * 0.58, s * 0.16, s * 0.05, 0, 0, 7); g.fill(); for (let i = 0; i < 14; i++) { g.strokeStyle = css('#a89a80', 0.6); g.lineWidth = 1; g.beginPath(); g.moveTo(cx - s * 0.15 + i * s * 0.022, s * 0.545); g.lineTo(cx - s * 0.15 + i * s * 0.022, s * 0.615); g.stroke(); } }
  else { g.fillStyle = css('#e8e0cc'); g.beginPath(); g.moveTo(cx - s * 0.1, s * 0.56); g.lineTo(cx, s * 0.68); g.lineTo(cx + s * 0.1, s * 0.56); g.fill(); }
  const skin = ['#d8a878', '#c89870', '#e0b890', '#b88860'][v % 4];
  g.fillStyle = css(skin); g.fillRect(cx - s * 0.05, hy + s * 0.1, s * 0.1, s * 0.12);
  const hg = g.createRadialGradient(cx - s * 0.04, hy - s * 0.03, s * 0.02, cx, hy, s * 0.15); hg.addColorStop(0, css(tint(skin, 1.15))); hg.addColorStop(1, css(shade(skin, 0.7))); g.fillStyle = hg; g.beginPath(); g.ellipse(cx, hy, s * 0.105, s * 0.14, 0, 0, 7); g.fill();
  const hair = ['#2a1a10', '#4a3420', '#8a8478', '#1a1410'][(v + 2) % 4];
  if (v % 3 === 0) { blob(g, cx, hy - s * 0.12, s * 0.17, s * 0.045, '#18141a'); blob(g, cx, hy - s * 0.14, s * 0.1, s * 0.05, '#18141a'); }
  else { g.fillStyle = css(hair); g.beginPath(); g.ellipse(cx, hy - s * 0.06, s * 0.115, s * 0.1, 0, Math.PI, 0); g.fill(); g.fillRect(cx - s * 0.115, hy - s * 0.06, s * 0.03, s * 0.12); g.fillRect(cx + s * 0.085, hy - s * 0.06, s * 0.03, s * 0.12); }
  if (v % 4 === 1) { g.fillStyle = css(hair); g.beginPath(); g.ellipse(cx, hy + s * 0.1, s * 0.07, s * 0.06, 0, 0, Math.PI); g.fill(); }
  g.fillStyle = css(shade(skin, 0.4)); for (const dx of [-0.04, 0.04]) { g.beginPath(); g.ellipse(cx + dx * s, hy - s * 0.005, s * 0.012, s * 0.007, 0, 0, 7); g.fill(); }
  g.strokeStyle = css(shade(skin, 0.6), 0.8); g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx, hy); g.lineTo(cx + s * 0.012, hy + s * 0.045); g.stroke(); g.beginPath(); g.moveTo(cx - s * 0.025, hy + s * 0.075); g.lineTo(cx + s * 0.025, hy + s * 0.075); g.stroke();
}
function paintSea(g, s, r, v) {
  let gr = g.createLinearGradient(0, 0, 0, s * 0.55); gr.addColorStop(0, '#6a7a88'); gr.addColorStop(1, '#d8ccaa'); g.fillStyle = gr; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 8; i++) blob(g, r() * s, s * (0.08 + r() * 0.3), s * (0.06 + r() * 0.12), s * (0.03 + r() * 0.04), r() < 0.5 ? '#e8dcc0' : '#5a6070', 0.55);
  const hz = s * 0.56; gr = g.createLinearGradient(0, hz, 0, s); gr.addColorStop(0, '#5a7070'); gr.addColorStop(1, '#2a3a3a'); g.fillStyle = gr; g.fillRect(0, hz, s, s - hz);
  strokeFill(g, r, 0, hz, s, s - hz, ['#a8b8a8', '#1e2a2a', '#7a9088'], 140, s * 0.04, 0, 0.45);
  const bx = s * (0.3 + 0.4 * r()), by = hz + s * 0.06; g.fillStyle = css('#2a1e18'); g.beginPath(); g.moveTo(bx - s * 0.12, by); g.lineTo(bx + s * 0.13, by); g.lineTo(bx + s * 0.09, by + s * 0.04); g.lineTo(bx - s * 0.09, by + s * 0.04); g.fill();
  g.fillRect(bx - 1.5, by - s * 0.3, 3, s * 0.3); g.fillRect(bx + s * 0.07, by - s * 0.22, 3, s * 0.22);
  for (const [x, y, ww, hh] of [[bx - s * 0.08, by - s * 0.28, s * 0.075, s * 0.11], [bx - s * 0.085, by - s * 0.15, s * 0.08, s * 0.12], [bx + s * 0.01, by - s * 0.2, s * 0.07, s * 0.16]]) { g.fillStyle = css('#e8dcc0'); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + ww * 1.3, y + hh / 2, x, y + hh); g.lineTo(x + ww * 0.1, y + hh / 2); g.fill(); }
}
function paintHistory(g, s, r, v) {
  const gr = g.createLinearGradient(0, 0, 0, s); gr.addColorStop(0, '#3a3024'); gr.addColorStop(1, '#1a1612'); g.fillStyle = gr; g.fillRect(0, 0, s, s);
  g.fillStyle = css('#6a5a44'); for (const x of [0.12, 0.82]) g.fillRect(s * x, s * 0.05, s * 0.07, s * 0.7);
  g.fillStyle = css('#e8d8a8', 0.18); g.beginPath(); g.moveTo(s * 0.4, 0); g.lineTo(s * 0.6, 0); g.lineTo(s * 0.75, s); g.lineTo(s * 0.3, s); g.fill();
  const robes = ['#a8281e', '#2a4a8a', '#c8a040', '#e8e0cc', '#3a5a2a', '#6a2a5a'];
  for (let i = 0; i < 5; i++) { const x = s * (0.18 + i * 0.16 + (r() - 0.5) * 0.05), y = s * (0.5 + (r() - 0.5) * 0.08), c = robes[(i + v) % 6];
    g.fillStyle = css(c); g.beginPath(); g.moveTo(x - s * 0.07, s * 0.9); g.quadraticCurveTo(x - s * 0.06, y, x, y - s * 0.05); g.quadraticCurveTo(x + s * 0.06, y, x + s * 0.07, s * 0.9); g.fill();
    strokeFill(g, r, x - s * 0.06, y, s * 0.12, s * 0.35, [tint(c, 1.3), shade(c, 0.6)], 14, s * 0.06, 1.5, 0.4);
    blob(g, x, y - s * 0.1, s * 0.035, s * 0.045, '#d8a878'); blob(g, x - s * 0.005, y - s * 0.13, s * 0.036, s * 0.025, '#3a2414'); }
  g.fillStyle = css('#2a2016'); g.fillRect(0, s * 0.88, s, s * 0.12);
}
function paintStill(g, s, r, v) {
  const gr = g.createRadialGradient(s * 0.4, s * 0.3, 0, s * 0.5, s * 0.5, s * 0.8); gr.addColorStop(0, '#4a3a26'); gr.addColorStop(1, '#141210'); g.fillStyle = gr; g.fillRect(0, 0, s, s);
  g.fillStyle = css('#3a2416'); g.fillRect(0, s * 0.62, s, s * 0.38); g.fillStyle = css('#e8e0cc'); g.beginPath(); g.moveTo(s * 0.1, s * 0.62); g.quadraticCurveTo(s * 0.3, s * 0.7, s * 0.25, s); g.lineTo(s * 0.55, s); g.quadraticCurveTo(s * 0.5, s * 0.72, s * 0.62, s * 0.62); g.fill();
  const vc = v % 2 ? '#7a8a9a' : '#a86a3a'; g.fillStyle = css(vc); g.beginPath(); g.ellipse(s * 0.62, s * 0.5, s * 0.1, s * 0.13, 0, 0, 7); g.fill(); g.fillRect(s * 0.58, s * 0.28, s * 0.08, s * 0.12);
  for (let i = 0; i < 8; i++) blob(g, s * (0.25 + r() * 0.5), s * (0.15 + r() * 0.2), s * 0.05, s * 0.05, ['#e8c8a8', '#c8402a', '#e8d070', '#f0ece0'][i % 4]);
  for (let i = 0; i < 6; i++) { const x = s * (0.2 + r() * 0.35), y = s * (0.56 + r() * 0.05), c = ['#c8402a', '#d8a020', '#7a9a3a', '#6a2a4a'][i % 4]; blob(g, x, y, s * 0.045, s * 0.04, c); blob(g, x - s * 0.012, y - s * 0.012, s * 0.012, s * 0.01, tint(c, 1.4)); }
}
// old varnish + fine craquelure over (x,y,w,h); shared by the atlas and drawMona
function varnish(g, x, y, w, h, r, k = 1) {
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#e6cf96'; g.fillRect(x, y, w, h);
  const vg = g.createRadialGradient(x + w / 2, y + h * 0.45, Math.min(w, h) * 0.25, x + w / 2, y + h / 2, Math.max(w, h) * 0.75); vg.addColorStop(0, 'rgba(255,255,255,1)'); vg.addColorStop(1, 'rgba(120,96,60,1)'); g.fillStyle = vg; g.fillRect(x, y, w, h);
  g.restore(); craquelure(g, x, y, w, h, r, k);
}
function craquelure(g, x0, y0, w, h, r, k = 1, sp = 12) {
  const nx = Math.ceil(w / sp) + 1, ny = Math.ceil(h / sp) + 1, P = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) P.push([x0 + (i + (r() - 0.5) * 0.8) * sp, y0 + (j + (r() - 0.5) * 0.8) * sp]);
  g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip(); g.lineWidth = 0.6;
  const seg = (a, b) => { const mx = (a[0] + b[0]) / 2 + (r() - 0.5) * sp * 0.3, my = (a[1] + b[1]) / 2 + (r() - 0.5) * sp * 0.3; g.moveTo(a[0], a[1]); g.lineTo(mx, my); g.lineTo(b[0], b[1]); };
  g.beginPath(); for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const p = P[j * nx + i]; if (i + 1 < nx && r() < 0.86) seg(p, P[j * nx + i + 1]); if (j + 1 < ny && r() < 0.86) seg(p, P[(j + 1) * nx + i]); }
  g.strokeStyle = `rgba(40,26,14,${0.2 * k})`; g.stroke(); g.translate(0.7, 0.7); g.strokeStyle = `rgba(255,236,190,${0.07 * k})`; g.stroke(); g.restore();
}
const CELL = { land: [0, 1, 2, 3, 4, 5], port: [6, 7, 8, 9], sea: [10, 11], hist: [12, 13], still: [14, 15] };
function paintAtlas(g, w, h) {
  const s = w / 4;
  for (let c = 0; c < 16; c++) { const x = (c % 4) * s, y = Math.floor(c / 4) * s, r = R(100 + c * 7);
    g.save(); g.translate(x, y); g.beginPath(); g.rect(0, 0, s, s); g.clip();
    if (c < 6) paintLandscape(g, s, r, c); else if (c < 10) paintPortrait(g, s, r, c - 6); else if (c < 12) paintSea(g, s, r, c); else if (c < 14) paintHistory(g, s, r, c); else paintStill(g, s, r, c);
    g.restore(); varnish(g, x, y, s, s, r, 0.8); }
}
// plane geometry showing atlas cell c, centre-cropped to the frame's aspect
const atlasGeo = (c, w, h) => cached(`atl${c}|${w.toFixed(3)}|${h.toFixed(3)}`, () => { const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv, a = w / h, cu = (c % 4) / 4, cv = 1 - (Math.floor(c / 4) + 1) / 4;
  const cw = a >= 1 ? 1 : a, ch = a >= 1 ? 1 / a : 1; for (let i = 0; i < uv.count; i++) uv.setXY(i, cu + (0.5 + (uv.getX(i) - 0.5) * cw) * 0.25 * 0.96 + 0.005, cv + (0.5 + (uv.getY(i) - 0.5) * ch) * 0.25 * 0.96 + 0.005); return g; });

// ================================================================= the Mona Lisa (standalone painter)
// drawMona(g, w, h[, {seed, age}]): a stylised, painterly rendition of Leonardo's portrait (public domain): dark-haired
// woman in a dark dress, hands folded, faint smile, hazy blue-green landscape with a winding path and a bridge,
// old yellowed varnish and fine craquelure. Pure 2D canvas; no other module needed. Design space 530 x 770.
export function drawMona(g, w, h, o = {}) {
  let a = ((o.seed || 1503) * 2654435761) >>> 0; const r = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const K = w / 530, blur = (px) => { g.filter = px > 0 ? `blur(${(px * K).toFixed(2)}px)` : 'none'; };
  const path = (pts, close = true) => { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const q = pts[i]; if (q.length === 4) p.quadraticCurveTo(q[0], q[1], q[2], q[3]); else if (q.length === 6) p.bezierCurveTo(...q); else p.lineTo(q[0], q[1]); } if (close) p.closePath(); return p; };
  const fill = (p, c, al = 1) => { g.globalAlpha = al; g.fillStyle = c; g.fill(p); g.globalAlpha = 1; };
  const strokes = (x, y, ww, hh, cols, n, len, ang, al, lw = 2.2, clip) => { g.save(); if (clip) g.clip(clip); g.lineCap = 'round'; for (let i = 0; i < n; i++) { const px = x + r() * ww, py = y + r() * hh, t = ang + (r() - 0.5) * 0.7, L = len * (0.5 + r()); g.strokeStyle = cols[Math.floor(r() * cols.length)]; g.globalAlpha = al * (0.5 + r() * 0.5); g.lineWidth = lw * (0.6 + r() * 0.8); g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + Math.cos(t) * L * 0.5 + (r() - 0.5) * 3, py + Math.sin(t) * L * 0.5 + (r() - 0.5) * 3, px + Math.cos(t) * L, py + Math.sin(t) * L); g.stroke(); } g.restore(); g.globalAlpha = 1; };
  g.save(); g.scale(w / 530, h / 770);
  // ---- sky: pale green-blue haze
  let gr = g.createLinearGradient(0, 0, 0, 330); gr.addColorStop(0, '#6f8270'); gr.addColorStop(0.5, '#9fae92'); gr.addColorStop(1, '#c7c8a4'); g.fillStyle = gr; g.fillRect(0, 0, 530, 770);
  blur(6); for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(214,214,184,${0.12 + r() * 0.1})`; g.beginPath(); g.ellipse(r() * 530, 30 + r() * 160, 60 + r() * 80, 10 + r() * 12, 0, 0, 7); g.fill(); } blur(0);
  // ---- distant blue mountains: left range lower, right range higher (the famous mismatched horizon)
  blur(1.5);
  const mL = [[0, 300], [0, 196], [22, 178], [40, 192], [58, 160], [80, 176], [104, 150], [126, 182], [150, 170], [176, 200], [196, 226], [210, 300]];
  const mR = [[320, 300], [326, 210], [350, 176], [372, 190], [396, 140], [418, 160], [440, 124], [466, 150], [488, 132], [512, 158], [530, 150], [530, 300]];
  fill(path(mL), '#7c958e'); fill(path(mR), '#76918c');
  fill(path([[0, 300], [0, 226], [40, 214], [90, 222], [140, 214], [200, 238], [210, 300]]), '#94a898', 0.85);
  fill(path([[320, 300], [326, 236], [380, 208], [430, 200], [480, 210], [530, 196], [530, 300]]), '#90a696', 0.85);
  blur(0);
  // lakes / water catching the sky
  fill(path([[0, 268], [60, 262], [150, 266], [208, 272], [208, 282], [0, 284]]), '#c4c8a6', 0.9);
  fill(path([[322, 244], [400, 238], [530, 236], [530, 250], [322, 256]]), '#c2c6a4', 0.9);
  // ---- middle ground: ochre-green valleys with rock outcrops
  gr = g.createLinearGradient(0, 270, 0, 470); gr.addColorStop(0, '#7e8a5e'); gr.addColorStop(1, '#5a5a36'); g.fillStyle = gr;
  g.fill(path([[0, 284], [60, 286], [120, 300], [210, 296], [215, 470], [0, 470]])); g.fill(path([[318, 258], [380, 262], [450, 270], [530, 262], [530, 470], [318, 470]]));
  strokes(0, 290, 215, 180, ['#9a9a62', '#5e6a42', '#a8a070', '#4e5a3a'], 120, 14, 0.2, 0.4, 2.2);
  strokes(318, 262, 212, 210, ['#9a9a62', '#5e6a42', '#a8a070', '#4e5a3a'], 120, 14, -0.1, 0.4, 2.2);
  // winding path on the left, snaking down and away
  g.lineCap = 'round'; g.strokeStyle = '#c0aa74'; g.lineWidth = 7; g.beginPath(); g.moveTo(150, 302); g.bezierCurveTo(110, 318, 170, 336, 120, 352); g.bezierCurveTo(70, 368, 110, 392, 54, 410); g.bezierCurveTo(30, 418, 20, 430, 8, 450); g.stroke();
  g.strokeStyle = '#8e7a50'; g.lineWidth = 2; g.stroke();
  // river and arched bridge on the right
  g.strokeStyle = '#b8bc9a'; g.lineWidth = 6; g.beginPath(); g.moveTo(530, 300); g.bezierCurveTo(480, 320, 470, 340, 430, 372); g.stroke();
  g.fillStyle = '#8a7a56'; g.fillRect(392, 344, 110, 9); for (let i = 0; i < 4; i++) { g.fillStyle = '#4e4630'; g.beginPath(); g.arc(404 + i * 26, 362, 9, Math.PI, 0); g.lineTo(413 + i * 26, 368); g.lineTo(395 + i * 26, 368); g.fill(); }
  g.fillStyle = '#6e6444'; for (let i = 0; i < 5; i++) g.fillRect(392 + i * 26, 353, 6, 15);
  // stone parapet + column bases at the edges (the loggia)
  gr = g.createLinearGradient(0, 430, 0, 470); gr.addColorStop(0, '#6a5a3e'); gr.addColorStop(1, '#3a3020'); g.fillStyle = gr; g.fillRect(0, 440, 530, 40);
  g.fillStyle = '#4a3e2a'; g.fillRect(0, 300, 12, 180); g.fillRect(518, 300, 12, 180);
  // ---- the figure ----------------------------------------------------------------------
  const HAIR = '#241910', DRESS = '#2a2618', SLEEVE = '#8a6c36', SKIN = '#d6a663', SKIN_L = '#eac381', SKIN_D = '#9a6a38';
  g.fillStyle = '#2e2416'; g.fillRect(0, 470, 530, 300); // shadow below the parapet
  // back hair mass + veil over the crown, falling behind the shoulders
  blur(1.5);
  fill(path([[265, 74], [200, 76, 184, 150], [168, 230, 166, 300], [160, 360, 150, 404], [190, 420, 222, 404], [214, 330, 226, 250], [265, 200], [304, 250], [316, 330, 310, 404], [344, 422, 382, 404], [366, 360, 362, 300], [360, 230, 346, 150], [330, 76, 265, 74]]), HAIR);
  blur(0);
  // body + dark dress, broad sloping shoulders
  const body = path([[28, 770], [34, 560, 58, 446], [110, 396, 184, 382], [265, 372], [350, 378, 424, 394], [474, 450, 500, 560], [512, 770]]);
  fill(body, DRESS);
  strokes(120, 410, 300, 360, ['rgba(92,86,54,0.9)', 'rgba(10,9,6,0.9)'], 80, 60, 1.45, 0.3, 3.2, body);
  // ochre sleeves: upper arms, then forearms meeting at the hands
  const slL = path([[58, 446], [96, 420, 128, 450], [150, 520, 156, 610], [120, 650, 74, 652], [48, 600, 44, 520], [50, 470, 58, 446]]);
  const slR = path([[424, 394], [470, 420, 490, 470], [502, 540, 496, 600], [460, 630, 416, 616], [400, 540, 404, 470], [408, 420, 424, 394]]);
  const faL = path([[70, 600], [140, 600, 230, 636], [262, 648], [260, 690], [200, 696, 92, 690], [56, 660, 70, 600]]);
  const faR = path([[492, 560], [470, 620, 400, 640], [372, 644], [368, 680], [430, 682, 490, 650], [508, 610, 492, 560]]);
  for (const sl of [slL, slR, faL, faR]) { fill(sl, SLEEVE); g.save(); g.clip(sl);
    gr = g.createLinearGradient(0, 380, 530, 700); gr.addColorStop(0, 'rgba(240,200,120,0.35)'); gr.addColorStop(1, 'rgba(40,24,8,0.35)'); g.fillStyle = gr; g.fillRect(0, 380, 530, 390);
    for (let i = 0; i < 26; i++) { const x = 30 + i * 18 + r() * 8; g.strokeStyle = i % 2 ? 'rgba(66,44,18,0.2)' : 'rgba(226,186,110,0.15)'; g.lineWidth = 4 + r() * 3; g.beginPath(); g.moveTo(x, 390); g.bezierCurveTo(x + 18, 480, x - 14, 580, x + 10, 700); g.stroke(); }
    g.restore(); }
  // chair arm under the left forearm
  gr = g.createLinearGradient(0, 690, 0, 730); gr.addColorStop(0, '#6e4a28'); gr.addColorStop(1, '#24170c'); g.fillStyle = gr; g.fillRect(14, 694, 300, 30); g.fillStyle = 'rgba(255,220,160,0.25)'; g.fillRect(14, 694, 300, 3);
  // chest skin + neckline with embroidered trim
  const chest = path([[168, 378], [222, 366, 238, 334], [292, 334], [308, 366, 362, 376], [336, 408, 265, 410], [194, 408, 168, 378]]);
  gr = g.createLinearGradient(170, 340, 350, 420); gr.addColorStop(0, SKIN_L); gr.addColorStop(0.55, SKIN); gr.addColorStop(1, SKIN_D); g.fillStyle = gr; g.fill(chest);
  g.strokeStyle = '#33240f'; g.lineWidth = 6; g.beginPath(); g.moveTo(166, 376); g.bezierCurveTo(198, 414, 332, 416, 364, 374); g.stroke();
  g.strokeStyle = 'rgba(170,134,76,0.8)'; g.lineWidth = 1.3; g.setLineDash([2.5, 2.5]); g.stroke(); g.setLineDash([]);
  for (let i = 0; i < 16; i++) { const t = i / 15, x = 166 + t * 198, y = 376 + Math.sin(t * Math.PI) * 30; g.strokeStyle = 'rgba(176,140,80,0.6)'; g.lineWidth = 0.9; g.beginPath(); g.arc(x, y + 4, 2.2, 0, 7); g.stroke(); }
  // neck, soft shadow under the chin
  const neck = path([[238, 270], [236, 320, 232, 352], [265, 362], [298, 352], [294, 320, 292, 270]]);
  gr = g.createLinearGradient(232, 0, 298, 0); gr.addColorStop(0, SKIN_L); gr.addColorStop(0.65, SKIN); gr.addColorStop(1, SKIN_D); g.fillStyle = gr; g.fill(neck);
  blur(4); fill(path([[238, 290], [265, 312], [294, 288], [294, 304], [265, 326], [238, 306]]), SKIN_D, 0.55); blur(0);
  // face: a broad soft oval, lit from the viewer's left
  const face = path([[265, 98], [322, 100, 338, 168], [346, 236, 318, 276], [294, 302, 265, 304], [236, 302, 212, 276], [184, 236, 192, 168], [208, 100, 265, 98]]);
  gr = g.createRadialGradient(248, 178, 10, 266, 200, 104); gr.addColorStop(0, SKIN_L); gr.addColorStop(0.6, SKIN); gr.addColorStop(1, SKIN_D); g.fillStyle = gr; g.fill(face);
  g.save(); g.clip(face);
  blur(7); fill(path([[312, 110], [344, 190], [330, 280], [292, 304], [312, 220]]), SKIN_D, 0.55); // shadow side
  fill(path([[214, 130], [252, 108], [268, 140], [228, 168]]), SKIN_L, 0.5); fill(path([[214, 222], [240, 216], [244, 256], [222, 254]]), SKIN_L, 0.3);
  blur(5); for (const [ex, ey] of [[236, 188], [294, 186]]) fill(path([[ex - 24, ey + 2], [ex, ey - 16, ex + 24, ey], [ex, ey + 14, ex - 24, ey + 2]]), SKIN_D, 0.5);
  blur(0); g.restore();
  // hair framing the face: soft waves, centre parting, ends curling on the shoulders
  blur(0.8);
  fill(path([[265, 92], [214, 90, 196, 150], [178, 220, 184, 290], [180, 340, 168, 396], [192, 404, 210, 384], [208, 330, 202, 280], [192, 210, 212, 150], [236, 106, 265, 106]]), HAIR);
  fill(path([[265, 92], [316, 90, 334, 150], [352, 220, 346, 290], [350, 340, 362, 396], [338, 404, 320, 384], [322, 330, 328, 280], [338, 210, 318, 150], [294, 106, 265, 106]]), HAIR);
  blur(0);
  g.save(); g.lineCap = 'round'; for (let i = 0; i < 26; i++) { const sd = i % 2 ? 1 : -1, k = i >> 1, x0 = 265 + sd * (6 + k * 3.2);
    g.strokeStyle = `rgba(${110 + (k % 3) * 20},${80 + (k % 3) * 14},44,0.38)`; g.lineWidth = 1.1; g.beginPath(); g.moveTo(x0, 96);
    g.bezierCurveTo(x0 + sd * 40, 140, x0 + sd * 30, 240, 265 + sd * (66 + k * 1.6), 300); g.bezierCurveTo(265 + sd * (78 + Math.sin(k) * 8), 340, 265 + sd * (70 + k * 2), 370, 265 + sd * (88 + k * 1.5), 396); g.stroke(); }
  for (const sd of [-1, 1]) for (let k = 0; k < 4; k++) { g.strokeStyle = 'rgba(120,88,48,0.45)'; g.lineWidth = 1.2; g.beginPath(); g.arc(265 + sd * (84 + k * 7), 392 + (k % 2) * 6, 5, 0, Math.PI * 1.5); g.stroke(); }
  g.restore();
  g.strokeStyle = 'rgba(20,16,12,0.55)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(206, 112); g.quadraticCurveTo(265, 92, 324, 112); g.stroke(); // veil edge
  g.fillStyle = 'rgba(20,16,12,0.18)'; g.beginPath(); g.moveTo(190, 120); g.quadraticCurveTo(265, 70, 340, 120); g.quadraticCurveTo(265, 96, 190, 120); g.fill();
  // eyes: heavy lids in shadow, dark irises toward the viewer, no eyebrows
  for (const [ex, ey, sc] of [[236, 189, 1], [294, 187, 0.94]]) {
    g.fillStyle = 'rgba(214,190,150,0.8)'; g.beginPath(); g.ellipse(ex, ey + 0.5, 11 * sc, 4, 0, 0, 7); g.fill();
    g.fillStyle = '#2a1c12'; g.beginPath(); g.arc(ex + 2, ey + 0.5, 4.6, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,236,200,0.6)'; g.beginPath(); g.arc(ex + 0.8, ey - 1, 1, 0, 7); g.fill();
    g.strokeStyle = '#3e2614'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(ex - 12 * sc, ey + 1); g.quadraticCurveTo(ex, ey - 7, ex + 12 * sc, ey); g.stroke();
    blur(1); g.strokeStyle = 'rgba(110,66,32,0.55)'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(ex - 13 * sc, ey - 5); g.quadraticCurveTo(ex, ey - 13, ex + 13 * sc, ey - 5); g.stroke();
    g.strokeStyle = 'rgba(120,76,40,0.4)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(ex - 10 * sc, ey + 5); g.quadraticCurveTo(ex, ey + 8, ex + 11 * sc, ey + 4); g.stroke(); blur(0);
  }
  // nose: soft shadow down the right side, nostrils
  blur(1.6); g.strokeStyle = 'rgba(140,90,44,0.6)'; g.lineWidth = 4; g.beginPath(); g.moveTo(273, 194); g.quadraticCurveTo(280, 222, 280, 238); g.stroke(); blur(0);
  g.fillStyle = 'rgba(104,60,28,0.7)'; g.beginPath(); g.ellipse(258, 242, 3.2, 1.8, 0.2, 0, 7); g.fill(); g.beginPath(); g.ellipse(276, 241, 3.2, 1.8, -0.2, 0, 7); g.fill();
  blur(1); g.strokeStyle = 'rgba(150,96,50,0.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(252, 238); g.quadraticCurveTo(267, 248, 282, 238); g.stroke(); blur(0);
  // the faint smile: thin closed lips, corners lifting softly into shadow
  blur(0.8); g.fillStyle = 'rgba(170,96,66,0.5)'; g.beginPath(); g.moveTo(246, 265); g.quadraticCurveTo(266, 259, 288, 263); g.quadraticCurveTo(266, 276, 246, 265); g.fill(); blur(0);
  g.strokeStyle = 'rgba(96,52,28,0.85)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(244, 263); g.bezierCurveTo(254, 268, 276, 268, 290, 261); g.stroke();
  blur(2); g.strokeStyle = 'rgba(120,70,36,0.5)'; g.lineWidth = 2.6; for (const [x0, y0, x1, y1] of [[240, 259, 245, 266], [294, 256, 289, 264]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0, y1, x1, y1); g.stroke(); }
  fill(path([[254, 278], [266, 284, 278, 278], [266, 290]]), SKIN_D, 0.35); blur(0);
  // hands: the left hand curls over the chair arm, the right hand rests across its wrist
  const hand = (pts, x0) => { const hp = path(pts); gr = g.createLinearGradient(x0, 620, x0 + 130, 720); gr.addColorStop(0, SKIN_L); gr.addColorStop(0.55, SKIN); gr.addColorStop(1, SKIN_D); g.fillStyle = gr; g.fill(hp); return hp; };
  hand([[254, 642], [300, 640, 330, 660], [346, 690, 330, 712], [300, 720, 262, 706], [248, 680, 254, 642]], 250);
  const hR = hand([[384, 630], [350, 626, 300, 640], [256, 650, 244, 664], [250, 676, 290, 676], [330, 680, 376, 684], [392, 668, 384, 630]], 240);
  g.save(); g.clip(hR); g.strokeStyle = 'rgba(120,74,36,0.55)'; g.lineWidth = 1.4; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(330, 650 + i * 9); g.quadraticCurveTo(290, 652 + i * 8, 250 + i * 4, 664 + i * 5); g.stroke(); } g.restore();
  blur(2); fill(path([[300, 676], [340, 684], [372, 686], [340, 694], [296, 688]]), SKIN_D, 0.4); blur(0);
  // sfumato: a soft warm haze over everything, then deepen the shadow side of the figure
  g.globalAlpha = 0.12; g.fillStyle = '#c8b07a'; g.fillRect(0, 0, 530, 770); g.globalAlpha = 1;
  // ---- old varnish: yellowed, darker toward the edges, plus fine craquelure
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#e8d090'; g.fillRect(0, 0, 530, 770);
  gr = g.createRadialGradient(265, 330, 120, 265, 400, 520); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.7, '#d8c49a'); gr.addColorStop(1, '#6a5232'); g.fillStyle = gr; g.fillRect(0, 0, 530, 770); g.restore();
  craquelure(g, 0, 0, 530, 770, r, o.age ?? 1, 9);
  g.restore();
}

// ================================================================= materials
function materials() {
  const vc = (o = {}) => toon({ vertexColors: true, ...o });
  const T = {
    damask: tex(512, 512, (g, w, h) => damask(g, w, h)), damaskLight: tex(512, 512, (g, w, h) => damask(g, w, h, { base: '#9a2a2e', faded: true })),
    damaskG: tex(512, 512, (g, w, h) => damask(g, w, h, { base: '#3a5a46', seed: 4 })),
    parquet: tex(1024, 1024, (g, w, h) => parquet(g, w, h)), gilt: tex(256, 256, (g, w, h) => gilt(g, w, h, { base: '#c2a35e' })), giltOrn: tex(256, 256, (g, w, h) => gilt(g, w, h, { orn: true, base: '#c2a35e' })),
    plaster: tex(256, 256, (g, w, h) => plaster(g, w, h)), plasterStair: tex(512, 512, (g, w, h) => plaster(g, w, h, { base: '#ddd6c6', stain: true, seed: 4 })),
    walnut: tex(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#5e3a22', n: 4, joints: 0, nails: false, knots: false, seed: 9 })),
    velvetG: tex(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#3e5a44', folds: 1, seed: 3 })), velvetR: tex(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#8a1e26', folds: 0, seed: 5 })),
    marble: tex(512, 512, (g, w, h) => marble(g, w, h)), marbleD: tex(512, 512, (g, w, h) => marble(g, w, h, { base: '#5a3a36', seed: 4 })),
    ashlar: tex(512, 512, (g, w, h) => ashlar(g, w, h, { rows: 6, cols: 3 })), rustic: tex(512, 512, (g, w, h) => ashlar(g, w, h, { rows: 4, cols: 2, rustic: true, seed: 5 })),
    stepStone: tex(512, 512, (g, w, h) => ashlar(g, w, h, { rows: 2, cols: 2, base: '#bdb4a2', seed: 8 })),
    slate: tex(512, 512, (g, w, h) => PT.shingles(g, w, h, { base: '#58606e', n: 12, seed: 6 })), flags: tex(512, 512, flags),
    cobble: tex(512, 512, (g, w, h) => PT.stone(g, w, h, { base: '#8e8678', n: 9, seed: 12 })), glass: tex(128, 128, glazing),
    oak: tex(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a6038', n: 6, seed: 21 })), posters: tex(1024, 256, posters), shaft: tex(256, 256, shaftTex),
    atlas: tex(2048, 2048, paintAtlas), mona: tex(720, 1046, (g, w, h) => drawMona(g, w, h)),
  };
  T.parquet.center.set(0.5, 0.5); T.parquet.rotation = Math.PI / 4;
  const glow = (k, c = 0xffffff) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), vertexColors: true, fog: false });
  return { T,
    paint: vc(), damask: vc({ map: T.damask }), damaskLight: vc({ map: T.damaskLight }), damaskG: vc({ map: T.damaskG }), parquet: vc({ map: T.parquet }),
    gilt: vc({ map: T.gilt }), giltOrn: vc({ map: T.giltOrn }), plaster: vc({ map: T.plaster }), plasterStair: vc({ map: T.plasterStair }), walnut: vc({ map: T.walnut }),
    velvetG: vc({ map: T.velvetG }), velvetR: vc({ map: T.velvetR }), marble: vc({ map: T.marble }), marbleD: vc({ map: T.marbleD }),
    ashlar: vc({ map: T.ashlar }), ashlarIn: vc({ map: T.ashlar, side: THREE.BackSide }), rustic: vc({ map: T.rustic }), stepStone: vc({ map: T.stepStone }), slate: vc({ map: T.slate }), flags: vc({ map: T.flags }), cobble: vc({ map: T.cobble }),
    glass: vc({ map: T.glass }), oak: vc({ map: T.oak }), posters: vc({ map: T.posters }),
    atlas: vc({ map: T.atlas, emissive: 0xffffff, emissiveMap: T.atlas, emissiveIntensity: 0.12 }),
    mona: toon({ map: T.mona, emissive: 0xffffff, emissiveMap: T.mona, emissiveIntensity: 0.38 }),
    skyP: new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2dc).multiplyScalar(2.4), fog: false }), winP: new THREE.MeshBasicMaterial({ color: new THREE.Color(0xe4ecff).multiplyScalar(1.7), fog: false }),
    sky: glow(2.4, 0xfff4e0), skyDim: glow(1.5, 0xe8eeff), winGlow: glow(1.8, 0xdde6ff), warm: glow(2.2, 0xffc070),
  };
}

// ================================================================= frames
// gilded frame around a sight opening w x h centred at the Kit origin, front facing +z, back against z = 0.
// o.fw frame width, o.orn ornate (corner + centre cartouches), o.depth
function frameKit(K, w, h, o = {}) {
  const fw = o.fw ?? Math.max(0.055, Math.min(0.2, 0.045 + 0.065 * Math.min(w, h))), D = o.depth ?? Math.max(0.045, fw * 0.55), M = Mx;
  const band = (a, b, z0, z1, mat, c, rad) => { const x0 = w / 2 + a, x1 = w / 2 + b, y0 = h / 2 + a, y1 = h / 2 + b;
    K.box(mat, -x1, x1, y0, y1, z0, z1, c, rad, 0.2); K.box(mat, -x1, x1, -y1, -y0, z0, z1, c, rad, 0.2);
    K.box(mat, -x1, -x0, -y0, y0, z0, z1, c, rad, 0.2); K.box(mat, x0, x1, -y0, y0, z0, z1, c, rad, 0.2); };
  band(fw * 0.76, fw, 0, D * 0.55, M.gilt, 0xb08a48, 0.006);              // outer flat
  band(fw * 0.86, fw * 1.02, D * 0.4, D * 0.78, M.gilt, 0xe0bc6a, 0.008); // outer bead
  band(fw * 0.17, fw * 0.78, 0, o.plain ? D * 0.8 : D, o.plain ? M.gilt : M.giltOrn, o.plain ? 0xe6d4a4 : 0xffffff, o.plain ? 0.006 : Math.min(0.02, fw * 0.18)); // main moulding
  if (o.plain) band(fw * 0.4, fw * 0.5, D * 0.9, D * 1.08, M.gilt, 0xf4d690, 0.006); // a single raised bead
  band(-0.004, fw * 0.17, 0, D * 0.62, M.gilt, 0x8a6a3a, 0.004);          // sight edge (darker)
  if (o.orn) { const cs = fw * 0.55; for (const sx of [-1, 1]) for (const sy of [-1, 1]) K.put(M.giltOrn, sph(1, 10, 7), sx * (w / 2 + fw * 0.5), sy * (h / 2 + fw * 0.5), D * 0.95, 0, 0, 0, cs, cs, cs * 0.5, 0xfff0d0);
    if (w > 0.8) for (const sy of [-1, 1]) K.put(M.giltOrn, sph(1, 10, 7), 0, sy * (h / 2 + fw * 0.5), D * 0.95, 0, 0, 0, fw * 0.9, fw * 0.5, fw * 0.3, 0xfff0d0); }
  return { fw, D, ow: w + 2 * fw, oh: h + 2 * fw };
}

// ================================================================= GALLERY: the Salon Carré
const GH = 8;              // half size of the square hall (16 x 16 m)
const MONA = { w: 0.53, h: 0.77, y: 1.95, fw: 0.1 }; // the panel (77 x 53 cm) and its modest frame; centre height on the back wall
function buildGallery(G, ctx) {
  const K = new Kit(), Kc = new Kit(), M = Mx, rn = R(1911);
  // ---- floor: herringbone parquet, marble border strip
  K.box(M.parquet, -GH + 0.3, GH - 0.3, -0.1, 0, -GH + 0.3, GH - 0.3, 0xffffff, 0.005, 0.72);
  for (const [x0, x1, z0, z1] of [[-GH, GH, -GH, -GH + 0.3], [-GH, GH, GH - 0.3, GH], [-GH, -GH + 0.3, -GH + 0.3, GH - 0.3], [GH - 0.3, GH, -GH + 0.3, GH - 0.3]]) K.box(M.marbleD, x0, x1, -0.1, 0.004, z0, z1, 0xffffff, 0.005, 1.2);
  // ---- walls (wall coords: u along the wall to the viewer's right, front face at z = 0, room at +z)
  const WALLS = [{ k: 'back', x: 0, z: -GH, ry: 0, door: false }, { k: 'left', x: -GH, z: 0, ry: Math.PI / 2, door: true }, { k: 'right', x: GH, z: 0, ry: -Math.PI / 2, door: true }, { k: 'front', x: 0, z: GH, ry: Math.PI, door: true }];
  const DOOR = { hw: 1.25, h: 4.3 }, DADO = 1.05, TOPW = 6.6;
  const frames = []; // {wall, u, y, w, h, cell, orn}
  for (const Wl of WALLS) K.at(Wl.x, 0, Wl.z, Wl.ry, () => {
    const segs = Wl.door ? [[-GH, -DOOR.hw - 0.35], [DOOR.hw + 0.35, GH]] : [[-GH, GH]];
    // dado: walnut panelling with raised panels, cap rail; skirting in dark marble
    for (const [a, b] of segs) {
      K.box(M.walnut, a, b, 0, DADO, -0.08, 0.04, 0xffffff, 0.01, 1);
      K.box(M.marbleD, a, b, 0, 0.2, -0.08, 0.09, 0xffffff, 0.012, 1);
      K.box(M.walnut, a, b, DADO - 0.04, DADO + 0.05, -0.08, 0.1, 0xc8a080, 0.02, 1);
      for (let u = a + 0.18; u + 0.9 < b; u += 1.1) { K.box(M.walnut, u, u + 0.9, 0.32, DADO - 0.14, 0.04, 0.07, 0xe0b890, 0.02, 1); K.box(M.gilt, u + 0.04, u + 0.86, 0.36, 0.38, 0.06, 0.08, 0xc09050, 0.004); }
      K.box(M.damask, a, b, DADO, TOPW, -0.06, 0, 0xffffff, 0.004, 0.72);
    }
    if (Wl.door) { // damask over the door, marble architrave, entablature and a carved crest
      K.box(M.damask, -DOOR.hw - 0.35, DOOR.hw + 0.35, DOOR.h + 0.6, TOPW, -0.06, 0, 0xffffff, 0.004, 0.72);
      for (const sd of [-1, 1]) { K.box(M.marble, sd * DOOR.hw - (sd > 0 ? 0 : 0.35), sd * DOOR.hw + (sd > 0 ? 0.35 : 0), 0, DOOR.h + 0.1, -0.08, 0.14, 0xffffff, 0.02, 1);
        K.box(M.marble, sd * (DOOR.hw + 0.3) - 0.12, sd * (DOOR.hw + 0.3) + 0.12, 0, 0.3, -0.08, 0.2, 0xd8d0c4, 0.02, 1);
        K.box(M.marble, sd > 0 ? DOOR.hw - 0.02 : -DOOR.hw - 0.02, sd > 0 ? DOOR.hw + 0.02 : -DOOR.hw + 0.02, 0, DOOR.h, -0.9, -0.06, 0xe8e0d4, 0.01, 1); }
      K.box(M.marble, -DOOR.hw - 0.45, DOOR.hw + 0.45, DOOR.h + 0.1, DOOR.h + 0.42, -0.08, 0.2, 0xffffff, 0.02, 1);
      K.box(M.gilt, -DOOR.hw - 0.55, DOOR.hw + 0.55, DOOR.h + 0.42, DOOR.h + 0.52, -0.08, 0.3, 0xd8b060, 0.02);
      K.box(M.marble, -DOOR.hw - 0.02, DOOR.hw + 0.02, DOOR.h - 0.02, DOOR.h + 0.02, -0.9, -0.06, 0xe8e0d4, 0.01, 1);
      K.put(M.giltOrn, sph(1, 14, 8), 0, DOOR.h + 0.75, 0.05, 0, 0, 0, 0.42, 0.26, 0.12, 0xffffff);
      for (const sd of [-1, 1]) K.put(M.giltOrn, sph(1, 10, 6), sd * 0.62, DOOR.h + 0.66, 0.05, 0, 0, sd * 0.4, 0.3, 0.1, 0.06, 0xf0d8a0);
      // the next gallery seen through the door: green damask, a few frames, more parquet, brighter
      K.box(M.parquet, -DOOR.hw, DOOR.hw, -0.1, 0, -6, -0.06, 0xffffff, 0.005, 0.72);
      for (const sd of [-1, 1]) K.box(M.damaskG, sd * DOOR.hw - 0.05, sd * DOOR.hw + 0.05, 0, 6, -6, -0.9, 0xffffff, 0.004, 0.72);
      K.box(M.damaskG, -3, 3, 0, 6, -6.1, -6, 0xffffff, 0.004, 0.72); K.box(M.plaster, -3, 3, 5, 5.2, -6, -0.9, 0xffffff, 0.004, 1.5);
      for (const [u, y, fw2, fh] of [[-0.6, 2.1, 1.1, 0.8], [0.7, 2.4, 0.7, 1.0], [0, 3.6, 1.6, 0.9]]) K.at(u, y, -5.99, 0, () => { frameKit(K, fw2, fh, {}); K.put(M.atlas, atlasGeo((u * 10 + y) & 15, fw2, fh), 0, 0, 0.01); });
    }
    Kc.M.copy(K.M); // ceiling-side parts go to Kc (no shadow receiving)
    // picture rail, frieze, cornice
    Kc.box(M.gilt, -GH, GH, TOPW, TOPW + 0.07, -0.06, 0.06, 0xd8b060, 0.015);
    Kc.box(M.plaster, -GH, GH, TOPW + 0.07, 7.05, -0.06, 0, 0xf4ead4, 0.004, 1.5);
    for (let u = -GH + 0.4; u < GH; u += 0.8) Kc.put(M.giltOrn, sph(1, 8, 6), u, 6.86, 0.01, 0, 0, 0, 0.12, 0.09, 0.03, 0xf0d8a0);
    Kc.box(M.plaster, -GH, GH, 7.05, 7.14, -0.06, 0.1, 0xfff4e0, 0.02, 1.5); Kc.box(M.gilt, -GH, GH, 7.14, 7.2, -0.06, 0.16, 0xd8b060, 0.015);
    Kc.box(M.plaster, -GH, GH, 7.2, 7.32, -0.06, 0.3, 0xfff4e0, 0.03, 1.5);
    for (let u = -GH + 0.2; u < GH; u += 0.4) Kc.box(M.plaster, u - 0.05, u + 0.05, 7.08, 7.2, 0.1, 0.22, 0xf0e4c8, 0.01, 1);
    Kc.M.identity();
    // salon hang: reserve doors + the hero area, then pack rows of frames tightly
    const res = [];
    if (Wl.door) res.push([-DOOR.hw - 0.5, DOOR.hw + 0.5, 0, DOOR.h + 1.05]);
    if (Wl.k === 'back') {
      const hero = [[0, MONA.y, 0, 0, -1], [-1.75, 2.0, 2.0, 1.45, 12], [1.75, 2.0, 2.0, 1.5, 13], [0, 4.0, 3.6, 2.2, 2], [-4.6, 2.3, 2.3, 1.9, 4], [4.6, 2.3, 2.3, 1.9, 10]];
      for (const [u, y, fw2, fh, c] of hero) { if (c >= 0) frames.push({ wall: Wl, u, y, w: fw2, h: fh, cell: c, orn: true }); res.push(c < 0 ? [u - 0.55, u + 0.55, y - 0.65, y + 0.65] : [u - fw2 / 2 - 0.3, u + fw2 / 2 + 0.3, y - fh / 2 - 0.3, y + fh / 2 + 0.3]); }
    }
    const ROWS = [[1.25, 2.9], [3.05, 4.55], [4.7, 5.6], [5.72, 6.48]];
    ROWS.forEach(([y0, y1], ri) => { let u = -GH + 0.35 + rn() * 0.3; const bh = y1 - y0;
      while (u < GH - 0.6) { let fh = bh * (0.62 + rn() * 0.3), asp = rn() < 0.55 ? 1.2 + rn() * 0.6 : 0.68 + rn() * 0.2; if (ri === 0 && rn() < 0.3) { fh = bh * 0.9; asp = 1.4 + rn() * 0.5; }
        let fw2 = fh * asp; const fw0 = Math.max(0.055, Math.min(0.2, 0.045 + 0.065 * Math.min(fw2, fh)));
        const yc = (y0 + y1) / 2 + (rn() - 0.5) * (bh - fh) * 0.5, x0 = u, x1 = u + fw2 + 2 * fw0;
        const hit = res.find((q) => x1 > q[0] && x0 < q[1] && yc + fh / 2 + fw0 > q[2] && yc - fh / 2 - fw0 < q[3]);
        if (hit) { u = hit[1] + 0.05; continue; }
        if (x1 > GH - 0.35) break;
        const cell = asp < 0.95 ? [...CELL.port, ...CELL.hist, ...CELL.still][Math.floor(rn() * 8)] : [...CELL.land, ...CELL.sea, ...CELL.land][Math.floor(rn() * 14)];
        frames.push({ wall: Wl, u: (x0 + x1) / 2, y: yc, w: fw2, h: fh, cell, orn: fw2 * fh > 0.9 || rn() < 0.3, top: ri === 3 }); u = x1 + 0.1 + rn() * 0.14; } });
  });
  for (const f of frames) K.at(f.wall.x, 0, f.wall.z, f.wall.ry, () => K.at(f.u, f.y, 0.005, 0, () => {
    const fr = frameKit(K, f.w, f.h, { orn: f.orn }); K.put(M.atlas, atlasGeo(f.cell, f.w, f.h), 0, 0, fr.D * 0.35);
    if (f.top) for (const sd of [-1, 1]) K.beam(M.paint, [sd * f.w * 0.3, f.h / 2 + fr.fw, 0.02], [sd * 0.05, TOPW - f.y, 0.03], 0.006, 0x5a4a30, true, 4);
  }));
  // ---- the four iron hooks that held the Mona Lisa, plus the cleaner (lighter) damask where it hung
  const ow = MONA.w + 2 * MONA.fw, oh = MONA.h + 2 * MONA.fw, HOOKS = [];
  K.at(0, 0, -GH, 0, () => {
    for (const [hx, hy, up] of [[-0.2, MONA.y - oh / 2 - 0.012, 1], [0.2, MONA.y - oh / 2 - 0.012, 1], [-0.2, MONA.y + oh / 2 + 0.012, -1], [0.2, MONA.y + oh / 2 + 0.012, -1]]) {
      K.put(M.paint, cyl(0.022, 0.022, 0.012, 10), hx, hy, 0.006, Math.PI / 2, 0, 0, 1, 1, 1, 0x2a2622);
      K.box(M.paint, hx - 0.008, hx + 0.008, hy - 0.008, hy + 0.008, 0, 0.075, 0x2e2a26, 0.003);
      K.box(M.paint, hx - 0.008, hx + 0.008, up > 0 ? hy - 0.004 : hy - 0.03, up > 0 ? hy + 0.03 : hy + 0.004, 0.064, 0.08, 0x2e2a26, 0.003);
      HOOKS.push([hx, hy, -GH + 0.07]);
    }
  });
  const lighter = new THREE.Mesh(uvPlane(ow + 0.02, oh + 0.02, 0, 0, 1), toon({ map: Mx.T.damaskLight }));
  { const g2 = lighter.geometry, uv = g2.attributes.uv, p = g2.attributes.position; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + GH) / 0.72, (p.getY(i) + MONA.y - DADO) / 0.72); }
  lighter.position.set(0, MONA.y, -GH + 0.004); lighter.receiveShadow = true; G.add(lighter);
  // ---- coved ceiling: lofted ring (wall top -> cove -> flat band), gilded ribs, skylight lantern
  const prof = []; for (let i = 0; i <= 8; i++) { const t = i / 8 * Math.PI / 2; prof.push([0.3 + 1.6 * (1 - Math.cos(t)), 7.32 + 1.95 * Math.sin(t)]); }
  const CT = prof[prof.length - 1][1], SKY = 3.9, LAN = CT + 1.2;
  G.add(Object.assign(new THREE.Mesh(coveGeo(prof, GH), toon({ map: Mx.T.plaster, color: 0xfff2dc })), { castShadow: true, receiveShadow: false }));
  for (const Wl of WALLS) Kc.at(Wl.x, 0, Wl.z, Wl.ry, () => {
    for (let u = -4.8; u <= 4.81; u += 1.6) for (let i = 0; i < prof.length - 1; i++) { const [d0, y0] = prof[i], [d1, y1] = prof[i + 1]; Kc.beam(M.gilt, [u, y0, d0 - 0.02], [u, y1, d1 - 0.02 + 0.0], 0.07, 0xe0bc68); }
    for (let u = -5.6; u <= 5.61; u += 1.6) Kc.put(M.giltOrn, sph(1, 10, 6), u, prof[4][1], prof[4][0] + 0.06, -0.8, 0, 0, 0.32, 0.32, 0.06, 0xf8e0a8);
    // flat band from the cove top to the skylight opening, with a gilt fillet and coffers
    const d0 = prof[prof.length - 1][0];
    const bw = Wl.k === 'left' || Wl.k === 'right' ? SKY : GH - d0; Kc.box(M.plaster, -bw, bw, CT, CT + 0.25, d0, GH - SKY, 0xfff2dc, 0.01, 1.5);
    Kc.box(M.gilt, -(GH - d0), GH - d0, CT - 0.08, CT, d0 - 0.02, d0 + 0.12, 0xe0bc68, 0.02);
    for (let u = -SKY + 0.4; u < SKY; u += 1.1) Kc.box(M.gilt, u, u + 0.7, CT - 0.03, CT, d0 + 0.5, GH - SKY - 0.4, 0xc89a50, 0.01);
    Kc.box(M.gilt, -SKY - 0.1, SKY + 0.1, CT - 0.12, CT, GH - SKY - 0.1, GH - SKY + 0.02, 0xe0bc68, 0.02);
    // lantern walls up to the glass
    Kc.box(M.plaster, -SKY, SKY, CT, LAN, GH - SKY - 0.12, GH - SKY, 0xf6ead2, 0.01, 1.5);
  });
  // glass roof: bright panes (blooming), iron glazing bars that stripe the sun patch below
  const glassM = new THREE.Mesh(plane(SKY * 2, SKY * 2), Mx.skyP); glassM.rotation.x = Math.PI / 2; glassM.position.set(0, LAN + 0.02, 0); glassM.castShadow = false; glassM.receiveShadow = false; G.add(glassM);
  for (let i = -SKY; i <= SKY + 0.01; i += SKY / 5) { Kc.box(M.paint, i - 0.03, i + 0.03, LAN - 0.12, LAN, -SKY, SKY, 0x2a2630, 0.005); Kc.box(M.paint, -SKY, SKY, LAN - 0.12, LAN, i - 0.03, i + 0.03, 0x2a2630, 0.005); }
  Kc.box(M.paint, -SKY - 0.5, SKY + 0.5, LAN + 0.05, LAN + 0.3, -SKY - 0.5, -SKY, 0x3a3436, 0.01); Kc.box(M.paint, -SKY - 0.5, SKY + 0.5, LAN + 0.05, LAN + 0.3, SKY, SKY + 0.5, 0x3a3436, 0.01);
  Kc.box(M.paint, -SKY - 0.5, -SKY, LAN + 0.05, LAN + 0.3, -SKY, SKY, 0x3a3436, 0.01); Kc.box(M.paint, SKY, SKY + 0.5, LAN + 0.05, LAN + 0.3, -SKY, SKY, 0x3a3436, 0.01);
  // roof over the cove (keeps the sun out everywhere except the skylight)
  Kc.box(M.paint, -GH - 0.5, GH + 0.5, CT + 0.25, CT + 0.45, -GH - 0.5, -SKY - 0.5, 0x3a3436, 0.01); Kc.box(M.paint, -GH - 0.5, GH + 0.5, CT + 0.25, CT + 0.45, SKY + 0.5, GH + 0.5, 0x3a3436, 0.01);
  Kc.box(M.paint, -GH - 0.5, -SKY - 0.5, CT + 0.25, CT + 0.45, -SKY - 0.5, SKY + 0.5, 0x3a3436, 0.01); Kc.box(M.paint, SKY + 0.5, GH + 0.5, CT + 0.25, CT + 0.45, -SKY - 0.5, SKY + 0.5, 0x3a3436, 0.01);
  // ---- furniture: velvet banquettes, rope posts, copyist's easel, guard's chair, pedestals with urns, floor grilles
  const bench = (x, z, ry, L = 2.4) => K.at(x, 0, z, ry, () => {
    K.box(M.velvetG, -L / 2, L / 2, 0.36, 0.5, -0.32, 0.32, 0xffffff, 0.06, 0.6, 2);
    K.box(M.gilt, -L / 2 - 0.02, L / 2 + 0.02, 0.3, 0.37, -0.34, 0.34, 0xd8b060, 0.02);
    for (let i = 0; i < 9; i++) K.put(M.gilt, sph(0.018, 6, 4), -L / 2 + 0.1 + i * (L - 0.2) / 8, 0.42, 0.33, 0, 0, 0, 1, 1, 1, 0xf0d090);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) K.put(M.gilt, lathe('benchleg', [[0, 0], [0.035, 0], [0.03, 0.06], [0.022, 0.12], [0.034, 0.2], [0.02, 0.28], [0.04, 0.3], [0, 0.3]]), sx * (L / 2 - 0.08), 0, sz * 0.26, 0, 0, 0, 1, 1, 1, 0xd8b060);
    K.beam(M.gilt, [-L / 2 + 0.08, 0.12, 0], [L / 2 - 0.08, 0.12, 0], 0.025, 0xb08a48, true, 6);
  });
  bench(0, 1.6, 0); bench(-5.4, -1.0, Math.PI / 2, 2.0); bench(5.4, -1.0, Math.PI / 2, 2.0);
  const POSTS = [-2.9, -1.0, 1.0, 2.9], RZ = -GH + 1.25;
  for (const x of POSTS) { K.put(M.gilt, lathe('post', [[0, 0], [0.13, 0], [0.13, 0.03], [0.06, 0.06], [0.025, 0.12], [0.022, 0.86], [0.035, 0.9], [0.05, 0.95], [0.035, 1.0], [0, 1.0]], 16), x, 0, RZ, 0, 0, 0, 1, 1, 1, 0xe8c070); K.put(M.gilt, sph(0.045, 10, 8), x, 1.03, RZ, 0, 0, 0, 1, 1, 1, 0xf8e0a0); }
  for (let i = 0; i < POSTS.length - 1; i++) { const a = POSTS[i] + 0.04, b = POSTS[i + 1] - 0.04, n = 10; let prev = null; for (let k = 0; k <= n; k++) { const t = k / n, p = [a + (b - a) * t, 0.93 - 0.24 * 4 * t * (1 - t), RZ]; if (prev) K.beam(M.velvetR, prev, p, 0.022, 0xffffff, true, 6); prev = p; } }
  // copyist's easel with a half-finished copy, stool and paint box (period: copyists worked in the galleries)
  K.at(-3.3, 0, -4.0, 0.45, () => {
    for (const sx of [-1, 1]) K.beam(M.oak, [sx * 0.32, 0, 0.18], [sx * 0.08, 2.0, 0], 0.035, 0xffffff); K.beam(M.oak, [0, 0, -0.6], [0, 1.9, -0.02], 0.035, 0xffffff);
    K.box(M.oak, -0.4, 0.4, 0.82, 0.86, -0.02, 0.1, 0xffffff, 0.01); K.box(M.oak, -0.1, 0.1, 1.86, 1.92, -0.04, 0.06, 0xffffff, 0.01);
    K.at(0, 1.35, 0.06, 0, () => { K.box(M.oak, -0.42, 0.42, -0.5, 0.5, -0.03, 0.0, 0xd8c8a8, 0.005); K.put(M.atlas, atlasGeo(12, 0.8, 0.96), 0, 0, 0.003); });
    K.box(M.oak, -0.2, 0.2, 0.42, 0.46, 0.5, 0.82, 0xffffff, 0.01); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.beam(M.oak, [sx * 0.15, 0, 0.66 + sz * 0.12], [sx * 0.17, 0.42, 0.66 + sz * 0.14], 0.025, 0xffffff);
    K.box(M.oak, 0.3, 0.7, 0, 0.12, 0.3, 0.55, 0x8a6a4a, 0.01); for (let i = 0; i < 5; i++) K.put(M.paint, cyl(0.012, 0.012, 0.08, 6), 0.36 + i * 0.07, 0.15, 0.42, Math.PI / 2, 0, 0, 1, 1, 1, [0xc8302a, 0x2a4a8a, 0xe8c040, 0xf2f0e8, 0x3a6a3a][i]);
  });
  // guard's chair by the left door, a pedestal + urn in each back corner, bronze floor grilles
  K.at(-GH + 0.7, 0, 2.6, Math.PI / 2, () => { K.box(M.oak, -0.24, 0.24, 0.44, 0.49, -0.22, 0.22, 0xffffff, 0.02); K.box(M.velvetR, -0.22, 0.22, 0.49, 0.53, -0.2, 0.2, 0xffffff, 0.02); K.box(M.oak, -0.24, 0.24, 0.49, 1.0, -0.24, -0.2, 0xffffff, 0.015);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.box(M.oak, sx * 0.21 - 0.02, sx * 0.21 + 0.02, 0, 0.44, sz * 0.19 - 0.02, sz * 0.19 + 0.02, 0xffffff, 0.008); });
  for (const sx of [-1, 1]) K.at(sx * (GH - 0.9), 0, -GH + 0.9, 0, () => {
    K.box(M.marble, -0.3, 0.3, 0, 0.12, -0.3, 0.3, 0xffffff, 0.02, 1); K.box(M.marbleD, -0.24, 0.24, 0.12, 1.05, -0.24, 0.24, 0xffffff, 0.02, 1); K.box(M.marble, -0.3, 0.3, 1.05, 1.15, -0.3, 0.3, 0xffffff, 0.02, 1);
    K.put(M.marble, lathe('urn', [[0, 0], [0.14, 0], [0.1, 0.05], [0.12, 0.1], [0.24, 0.3], [0.25, 0.42], [0.2, 0.55], [0.16, 0.6], [0.2, 0.64], [0, 0.66]], 18), 0, 1.15, 0, 0, 0, 0, 1, 1, 1, 0xf4eee4);
  });
  for (const x of [-4.5, 4.5]) { K.box(M.gilt, x - 0.6, x + 0.6, 0, 0.012, -GH + 0.35, -GH + 0.6, 0x7a5a34, 0.004); for (let i = 0; i < 12; i++) K.box(M.paint, x - 0.58 + i * 0.1, x - 0.54 + i * 0.1, 0.006, 0.014, -GH + 0.37, -GH + 0.58, 0x1e1a1a, 0.002); }
  K.build(G, 6);
  { const Gc = new THREE.Group(); Gc.name = 'gallery_ceiling'; G.add(Gc); Kc.build(Gc); Gc.traverse((o) => { if (o.isMesh) o.receiveShadow = false; }); }
  // ---- skylight shafts: additive slices along the sun direction (NOND), see GALLERY_SUN
  const ld = sunDir(LIGHT.gallery).multiplyScalar(-1), t = LAN / -ld.y, sh = [];
  for (let i = 0; i < 7; i++) { const z0 = -SKY + 0.4 + i * (2 * SKY - 0.8) / 6, g2 = new THREE.BufferGeometry();
    const P = [-SKY + 0.2, LAN, z0, SKY - 0.2, LAN, z0, SKY - 0.2 + ld.x * t, 0, z0 + ld.z * t, -SKY + 0.2 + ld.x * t, 0, z0 + ld.z * t];
    g2.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g2.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2)); g2.setIndex([0, 1, 2, 0, 2, 3]);
    const m = new THREE.Mesh(g2, new THREE.MeshBasicMaterial({ map: Mx.T.shaft, color: new THREE.Color(0xfff0d0).multiplyScalar(0.2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
    m.renderOrder = 5; m.castShadow = m.receiveShadow = false; G.add(m); sh.push(m); if (ctx.NOND) ctx.NOND.add(m); }
  // ---- the hero painting (its own group so it can be lifted off the wall)
  const mona = makeMonaProp({ frame: true, canvas: true }); mona.position.set(0, MONA.y, -GH + 0.005); mona.name = 'gallery_mona'; G.add(mona);
  return { frames: frames.length, mona, lighter, hooks: HOOKS, shafts: sh, monaY: MONA.y, rope: { x: POSTS, z: RZ } };
}
// lofted cove: each side is an indexed strip so normals stay smooth along the curve and sharp at the corners
function coveGeo(prof, half) {
  const P = [], U = [], I = []; let base = 0;
  for (let s = 0; s < 4; s++) { const a = s * Math.PI / 2, c = Math.cos(a), sn = Math.sin(a);
    const pt = (u, d, y) => { const lx = u, lz = -half + d; return [lx * c + lz * sn, y, -lx * sn + lz * c]; };
    let vlen = 0;
    for (let i = 0; i < prof.length; i++) { const [d, y] = prof[i], hl = half - d; if (i) vlen += Math.hypot(d - prof[i - 1][0], y - prof[i - 1][1]);
      P.push(...pt(-hl, d, y), ...pt(hl, d, y)); U.push(-hl / 1.5, vlen / 1.5, hl / 1.5, vlen / 1.5); }
    for (let i = 0; i < prof.length - 1; i++) { const k = base + i * 2; I.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    base += prof.length * 2; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); g.computeVertexNormals();
  // make normals face into the room (toward the centre and down)
  const n = g.attributes.normal, p = g.attributes.position; for (let i = 0; i < n.count; i++) { const dx = -p.getX(i), dz = -p.getZ(i), dy = -1; if (n.getX(i) * dx + n.getY(i) * dy + n.getZ(i) * dz < 0) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i)); }
  return g;
}

// ================================================================= props: frame / panel (canvas) / framed painting
// makeMonaProp({frame, canvas, empty}) -> Group centred on the panel, front facing +z, back at z = 0.
export function makeMonaProp(o = { frame: true, canvas: true }) {
  const g = new THREE.Group(); g.name = 'monaProp';
  if (o.frame !== false) { const K = new Kit(); const fr = frameKit(K, MONA.w, MONA.h, { fw: MONA.fw, depth: 0.06, orn: false, plain: true });
    // backing slips + a stretcher bar so the empty frame reads from behind too
    K.box(Mx.oak, -MONA.w / 2 - 0.01, -MONA.w / 2 + 0.03, -MONA.h / 2, MONA.h / 2, -0.005, 0.02, 0x9a7a5a, 0.004); K.box(Mx.oak, MONA.w / 2 - 0.03, MONA.w / 2 + 0.01, -MONA.h / 2, MONA.h / 2, -0.005, 0.02, 0x9a7a5a, 0.004);
    K.build(g); g.userData.frame = fr; }
  if (o.canvas !== false) { // poplar panel: painted face, raw wood back and edges
    const K = new Kit(); K.box(Mx.oak, -MONA.w / 2 + 0.004, MONA.w / 2 - 0.004, -MONA.h / 2 + 0.004, MONA.h / 2 - 0.004, 0.004, 0.026, 0xd8b890, 0.003); K.build(g);
    const f = new THREE.Mesh(plane(MONA.w - 0.01, MONA.h - 0.01), Mx.mona); f.position.z = 0.0265; f.castShadow = f.receiveShadow = true; g.add(f); g.userData.face = f; }
  return g;
}

// ================================================================= STAIRWELL: narrow stone dog-leg service stair
const ST = { x0: -1.7, x1: 1.7, z0: -3.0, z1: 3.3, top: 7.2, rise: 0.175, run: 0.28, n: 10, zs: 1.6, landZ: -1.2 };
function buildStair(G, ctx) {
  const K = new Kit(), M = Mx, Y1 = ST.rise * ST.n;
  // shell: plaster walls (thin boxes facing in), stone floor, plaster ceiling
  K.box(M.flags, ST.x0, ST.x1, -0.1, 0, ST.z0, ST.z1, 0xd0c8b8, 0.005, 1.6);
  K.box(M.plasterStair, ST.x0 - 0.2, ST.x0, 0, ST.top, ST.z0, ST.z1, 0xffffff, 0.004, 1.6); K.box(M.plasterStair, ST.x1, ST.x1 + 0.2, 0, ST.top, ST.z0, ST.z1, 0xffffff, 0.004, 1.6);
  K.box(M.plasterStair, ST.x0, ST.x1, 0, ST.top, ST.z1, ST.z1 + 0.2, 0xffffff, 0.004, 1.6);
  K.box(M.plasterStair, ST.x0, ST.x1, ST.top, ST.top + 0.2, ST.z0, ST.z1, 0xf0ece4, 0.004, 1.6);
  // back wall with the small window above the landing
  const WX = [-0.42, 0.42], WY = [Y1 + 1.0, Y1 + 2.15];
  K.box(M.plasterStair, ST.x0, WX[0], 0, ST.top, ST.z0 - 0.45, ST.z0, 0xffffff, 0.004, 1.6); K.box(M.plasterStair, WX[1], ST.x1, 0, ST.top, ST.z0 - 0.45, ST.z0, 0xffffff, 0.004, 1.6);
  K.box(M.plasterStair, WX[0], WX[1], 0, WY[0], ST.z0 - 0.45, ST.z0, 0xffffff, 0.004, 1.6); K.box(M.plasterStair, WX[0], WX[1], WY[1], ST.top, ST.z0 - 0.45, ST.z0, 0xffffff, 0.004, 1.6);
  K.box(M.stepStone, WX[0] - 0.05, WX[1] + 0.05, WY[0] - 0.06, WY[0], ST.z0 - 0.45, ST.z0 + 0.06, 0xffffff, 0.01, 1);
  const pane = new THREE.Mesh(plane(WX[1] - WX[0] - 0.08, WY[1] - WY[0] - 0.08), Mx.winP); pane.position.set(0, (WY[0] + WY[1]) / 2, ST.z0 - 0.29); pane.castShadow = false; G.add(pane);
  for (const x of [-0.14, 0.14]) K.box(M.paint, x - 0.018, x + 0.018, WY[0], WY[1], ST.z0 - 0.3, ST.z0 - 0.26, 0x3a3a34, 0.004);
  for (const y of [WY[0] + 0.38, WY[0] + 0.76]) K.box(M.paint, WX[0], WX[1], y - 0.018, y + 0.018, ST.z0 - 0.3, ST.z0 - 0.26, 0x3a3a34, 0.004);
  for (const x of [-0.3, -0.07, 0.16, 0.36]) K.beam(M.paint, [x, WY[0], ST.z0 - 0.12], [x, WY[1], ST.z0 - 0.12], 0.014, 0x24221e, true, 6); // iron security bars
  // flight 1 (left, up toward -z), solid stone steps with nosings
  const FX1 = [ST.x0 + 0.02, -0.16], FX2 = [0.16, ST.x1 - 0.02];
  for (let i = 0; i < ST.n; i++) { const y = (i + 1) * ST.rise, za = ST.zs - i * ST.run, zb = za - ST.run;
    K.box(M.stepStone, FX1[0], FX1[1], 0, y, zb, za, 0xffffff - (i % 3) * 0x060606, 0.012, 0.9); K.box(M.stepStone, FX1[0], FX1[1], y - 0.03, y, za - 0.02, za + 0.025, 0xe8e2d4, 0.015, 0.9); }
  // landing (full width) + flight 2 (right, up toward +z) carried on a sloping stone soffit
  K.box(M.stepStone, ST.x0 + 0.02, ST.x1 - 0.02, Y1 - 0.25, Y1, ST.z0, ST.landZ, 0xf0ece0, 0.01, 1.2); K.box(M.stepStone, ST.x0, ST.x1, 0, Y1 - 0.25, ST.z0, ST.landZ - 0.5, 0xc8c0b0, 0.01, 1.2);
  for (let j = 0; j < ST.n; j++) { const y = Y1 + (j + 1) * ST.rise, za = ST.landZ + j * ST.run, zb = za + ST.run;
    K.box(M.stepStone, FX2[0], FX2[1], y - 0.32, y, za, zb, 0xffffff - (j % 3) * 0x060606, 0.012, 0.9); K.box(M.stepStone, FX2[0], FX2[1], y - 0.03, y, zb - 0.025, zb + 0.02, 0xe8e2d4, 0.015, 0.9); }
  { const a = [0, Y1 - 0.3, ST.landZ], b = [0, Y1 + ST.n * ST.rise - 0.3, ST.zs]; const L = Math.hypot(b[1] - a[1], b[2] - a[2]), ang = Math.atan2(b[1] - a[1], b[2] - a[2]);
    K.put(M.stepStone, rboxGeo(FX2[1] - FX2[0], 0.12, L, 0.01, 1), (FX2[0] + FX2[1]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, -ang, 0, 0, 1, 1, 1, 0xd0c8b8); }
  const Y2 = Y1 + ST.n * ST.rise; K.box(M.stepStone, FX2[0], ST.x1 - 0.02, Y2 - 0.25, Y2, ST.zs, ST.z1, 0xf0ece0, 0.01, 1.2);
  K.box(M.stepStone, ST.x0 + 0.02, FX2[0], Y2 - 0.25, Y2, ST.zs + 0.4, ST.z1, 0xf0ece0, 0.01, 1.2);
  // doors: lower one on the left wall, upper one (to the galleries) on the right wall
  for (const [x, y, z, sd] of [[ST.x0, 0, 2.55, 1], [ST.x1, Y2, 2.55, -1]]) K.at(x, y, z, sd * Math.PI / 2, () => {
    K.box(M.oak, -0.48, 0.48, 0, 2.15, 0, 0.05, 0x8a7060, 0.01); for (const sx of [-1, 1]) for (const yy of [0.25, 1.15]) K.box(M.oak, sx * 0.22 - 0.17, sx * 0.22 + 0.17, yy, yy + 0.75, 0.05, 0.07, 0x7a6050, 0.01);
    K.box(M.stepStone, -0.6, 0.6, 2.15, 2.3, 0, 0.08, 0xffffff, 0.01, 1); for (const sx of [-1, 1]) K.box(M.stepStone, sx * 0.54 - 0.06, sx * 0.54 + 0.06, 0, 2.15, 0, 0.08, 0xffffff, 0.01, 1);
    K.put(M.paint, sph(0.03, 8, 6), 0.36, 1.0, 0.09, 0, 0, 0, 1, 1, 1, 0x8a7a50); });
  // iron railing: balusters + handrail along both inner edges and round the well at the landing
  const rail = (a, b, n) => { const H = 0.92; K.beam(M.paint, [a[0], a[1] + H, a[2]], [b[0], b[1] + H, b[2]], 0.025, 0x2a2622, true, 6); K.beam(M.paint, [a[0], a[1] + 0.12, a[2]], [b[0], b[1] + 0.12, b[2]], 0.012, 0x2a2622, true, 5);
    for (let i = 0; i <= n; i++) { const t = i / n, p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; K.beam(M.paint, [p[0], p[1], p[2]], [p[0], p[1] + H, p[2]], 0.011, 0x2a2622, true, 5);
      if (i % 3 === 1) K.put(M.paint, sph(0.022, 6, 5), p[0], p[1] + H * 0.5, p[2], 0, 0, 0, 1, 1.6, 1, 0x2a2622); } };
  rail([-0.2, 0.0, ST.zs], [-0.2, Y1, ST.landZ], 14); rail([0.2, Y1, ST.landZ], [0.2, Y2, ST.zs], 14); rail([-0.2, Y1, ST.landZ], [0.2, Y1, ST.landZ], 2);
  rail([-0.2, Y2, ST.zs + 0.4], [-0.2, Y2, ST.z1 - 0.1], 4);
  K.put(M.paint, lathe('newel', [[0, 0], [0.05, 0], [0.04, 0.1], [0.025, 0.2], [0.025, 0.9], [0.05, 0.95], [0, 1.02]], 10), -0.2, 0, ST.zs, 0, 0, 0, 1, 1, 1, 0x2a2622);
  // gas wall bracket (dim, lit) above the landing on the left wall, a fire bucket, a broom, a pipe run
  const LAMP = [ST.x0 + 0.28, Y1 + 1.95, -2.2];
  K.box(M.paint, ST.x0, ST.x0 + 0.03, LAMP[1] - 0.12, LAMP[1] + 0.02, LAMP[2] - 0.06, LAMP[2] + 0.06, 0x3a342a, 0.005);
  K.beam(M.paint, [ST.x0 + 0.02, LAMP[1] - 0.05, LAMP[2]], [LAMP[0], LAMP[1] - 0.05, LAMP[2]], 0.012, 0x6a5a3a, true, 6);
  K.put(M.warm, sph(0.07, 10, 8), LAMP[0], LAMP[1] + 0.04, LAMP[2], 0, 0, 0, 1, 1.2, 1, 0xffffff);
  K.put(M.paint, tor(0.06, 0.01, 5, 14), LAMP[0], LAMP[1] - 0.03, LAMP[2], Math.PI / 2, 0, 0, 1, 1, 1, 0x6a5a3a);
  K.put(M.paint, cyl(0.13, 0.11, 0.28, 12, false), ST.x1 - 0.25, Y1 + 0.14, ST.z0 + 0.3, 0, 0, 0, 1, 1, 1, 0xa8301e); K.put(M.paint, tor(0.12, 0.008, 4, 14, Math.PI), ST.x1 - 0.25, Y1 + 0.28, ST.z0 + 0.3, 0, 0, 0, 1, 1, 1, 0x2a2622);
  K.beam(M.oak, [ST.x0 + 0.08, 0.02, 2.9], [ST.x0 + 0.25, 1.35, 3.15], 0.018, 0xc8a070, true, 6); K.put(M.oak, cyl(0.06, 0.12, 0.3, 8), ST.x0 + 0.08, 0.13, 2.9, -0.1, 0, 0.05, 1, 1, 0.5, 0x9a8048);
  K.beam(M.paint, [ST.x1 - 0.06, 0, ST.z1 - 0.08], [ST.x1 - 0.06, ST.top, ST.z1 - 0.08], 0.03, 0x6a6a64, true, 8); for (let y = 0.8; y < ST.top; y += 1.6) K.box(M.paint, ST.x1 - 0.1, ST.x1, y, y + 0.04, ST.z1 - 0.12, ST.z1 - 0.04, 0x4a4a44, 0.005);
  K.build(G);
  // ---- the theft beat: man's spot, held painting (framed / canvas only), discarded empty frame on a step
  const MAN = [-0.75, Y1, -2.05];
  const held = makeMonaProp({ frame: true, canvas: true }); held.position.set(MAN[0], Y1 + 0.58, MAN[2] + 0.34); held.rotation.x = -0.1; held.name = 'stair_held'; G.add(held);
  const heldCanvas = makeMonaProp({ frame: false, canvas: true }); heldCanvas.position.set(MAN[0] + 0.05, Y1 + 0.6, MAN[2] + 0.3); heldCanvas.rotation.set(-0.1, 0.12, 0.05); heldCanvas.visible = false; heldCanvas.name = 'stair_canvas'; G.add(heldCanvas);
  const sz = ST.zs - 5.5 * ST.run, sy = ST.rise * ((ST.zs - sz) / ST.run + 1), sl = Math.atan2(ST.rise, ST.run); // resting on the nosings, face up
  const discarded = makeMonaProp({ frame: true, canvas: false }); discarded.position.set(-0.95, sy + 0.035, sz + 0.02); discarded.rotation.set(-(Math.PI / 2 - sl), 0.14, 0, 'YXZ'); discarded.visible = false; discarded.name = 'stair_discarded'; G.add(discarded);
  return { held, heldCanvas, discarded, man: MAN, lamp: LAMP, window: [0, (WY[0] + WY[1]) / 2, ST.z0 - 0.3], landingY: Y1, upperY: Y2, discardStep: [-0.95, sy, sz] };
}

// ================================================================= EXTERIOR: Louvre street front
const EX = { half: 22, bay: 4.4, gf: 6.4, ff: 13.2, pave: 5.5, street: 18 };
function faceGeo(x0, x1, y0, y1, holes, s) {
  const sh = new THREE.Shape(); sh.moveTo(x0, y0); sh.lineTo(x1, y0); sh.lineTo(x1, y1); sh.lineTo(x0, y1); sh.closePath();
  for (const h of holes) { const p = new THREE.Path(); p.moveTo(h.x - h.hw, h.y0); p.lineTo(h.x + h.hw, h.y0);
    if (h.ys != null) { p.lineTo(h.x + h.hw, h.ys); p.absarc(h.x, h.ys, h.hw, 0, Math.PI, false); } else { p.lineTo(h.x + h.hw, h.y1); p.lineTo(h.x - h.hw, h.y1); } p.closePath(); sh.holes.push(p); }
  const g = new THREE.ShapeGeometry(sh, 18), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / s, uv.getY(i) / s); return g;
}
function buildExterior(G, ctx) {
  const K = new Kit(), M = Mx, B = EX.bay, gfH = [], ffH = [], DOORX = 0;
  for (let k = -4; k <= 4; k++) { const x = k * B; if (k === 0) gfH.push({ x, hw: 1.45, y0: 0.65, ys: 4.3, door: true }); else gfH.push({ x, hw: 0.95, y0: 1.5, ys: 4.3 }); ffH.push({ x, hw: 0.82, y0: 7.7, y1: 11.4 }); }
  // ground floor (rusticated), first floor (smooth ashlar)
  K.put(M.rustic, faceGeo(-EX.half, EX.half, 0.6, EX.gf, gfH, 2.4), 0, 0, 0);
  K.put(M.ashlar, faceGeo(-EX.half, EX.half, EX.gf + 0.55, EX.ff, ffH, 2.4), 0, 0, 0);
  K.box(M.stepStone, -EX.half, EX.half, 0, 0.6, -0.5, 0.18, 0xc8c0b0, 0.02, 1.2); // plinth
  K.box(M.ashlar, -EX.half, EX.half, EX.gf, EX.gf + 0.55, -0.5, 0.2, 0xfff8ec, 0.02, 2.4); K.box(M.ashlar, -EX.half, EX.half, EX.gf + 0.45, EX.gf + 0.55, -0.5, 0.28, 0xffffff, 0.02, 2.4);
  for (const [a, b] of [[-EX.half, -1.6], [1.6, EX.half]]) K.box(M.paint, a, b, 0.6, EX.ff, -2.2, -2.0, 0x1e1a22, 0.01); // dark interior behind the openings
  for (const h of gfH) { // arched openings: jambs, soffit, voussoirs + keystone, sill, glazing or doors
    const { x, hw, y0, ys } = h, D = 0.55;
    for (const sd of [-1, 1]) K.box(M.rustic, x + sd * hw - (sd > 0 ? 0 : 0.06), x + sd * hw + (sd > 0 ? 0.06 : 0), y0, ys, -D, 0, 0xe8e0d0, 0.005, 2.4);
    K.put(M.ashlarIn, cyl(hw, hw, D, 18, true, -Math.PI / 2, Math.PI), x, ys, -D / 2, -Math.PI / 2, 0, 0, 1, 1, 1, 0xe0d8c8);
    for (let i = 0; i <= 8; i++) { const a = Math.PI * i / 8, rr = hw + 0.2; K.put(M.ashlar, rboxGeo(0.24, 0.42, 0.14, 0.02, 1.2), x + Math.cos(a) * rr, ys + Math.sin(a) * rr, 0.06, 0, 0, a - Math.PI / 2, 1, 1, 1, i === 4 ? 0xfff8ec : 0xf0e8d8); }
    K.put(M.ashlar, rboxGeo(0.34, 0.62, 0.3, 0.03, 1.2), x, ys + hw + 0.22, 0.1, 0, 0, 0, 1, 1, 1, 0xfffaf0);
    if (h.door) { // open double doors (dark green, panelled) swung inward, warm interior glow, a stone threshold
      for (const sd of [-1, 1]) K.at(x + sd * hw, 0.65, -D, -sd * 1.25, () => { K.box(M.oak, sd > 0 ? -1.4 : 0, sd > 0 ? 0 : 1.4, 0, 3.7, -0.04, 0.04, 0x2e4a3a, 0.01, 1); for (const yy of [0.3, 1.9]) K.box(M.oak, sd > 0 ? -1.25 : 0.15, sd > 0 ? -0.15 : 1.25, yy, yy + 1.3, 0.04, 0.07, 0x3a5a46, 0.01, 1); });
      K.box(M.stepStone, x - hw - 0.2, x + hw + 0.2, 0.3, 0.65, -0.6, 0.6, 0xffffff, 0.02, 1.2); K.put(M.glass, cached('fan' + hw, () => new THREE.CircleGeometry(hw, 20, 0, Math.PI)), x, ys, -D + 0.06); for (let i = 1; i < 6; i++) { const a = Math.PI * i / 6; K.beam(M.paint, [x, ys, -D + 0.09], [x + Math.cos(a) * hw, ys + Math.sin(a) * hw, -D + 0.09], 0.02, 0x2e4a3a, false); } K.box(M.paint, x - hw, x + hw, ys - 0.04, ys + 0.04, -D + 0.04, -D + 0.1, 0x2e4a3a, 0.01); K.box(M.stepStone, x - hw - 0.4, x + hw + 0.4, 0.15, 0.3, -0.2, 0.95, 0xf0e8d8, 0.02, 1.2);
      K.box(M.flags, x - hw, x + hw, 0.55, 0.65, -6, -D, 0xc0b8a8, 0.01, 1.6); K.box(M.marble, x - hw, x + hw, 0.6, 6.5, -6.2, -6, 0xe8d8b8, 0.01, 1.5);
      for (const sd of [-1, 1]) K.box(M.marble, x + sd * hw - 0.1, x + sd * hw + 0.1, 0.6, 6, -6, -D, 0xd8c8a8, 0.01, 1.5);
      K.put(M.warm, plane(1.4, 2.4), x, 2.4, -5.95, 0, 0, 0, 1, 1, 1, 0xffffff);
      for (const sd of [-1, 1]) { K.put(M.ashlar, cyl(0.32, 0.36, EX.gf - 0.6, 16), x + sd * (hw + 0.85), 0.6 + (EX.gf - 0.6) / 2, 0.15, 0, 0, 0, 1, 1, 1, 0xfff6e8);
        K.box(M.ashlar, x + sd * (hw + 0.85) - 0.45, x + sd * (hw + 0.85) + 0.45, EX.gf - 0.3, EX.gf, -0.2, 0.55, 0xffffff, 0.03, 1.2); K.box(M.ashlar, x + sd * (hw + 0.85) - 0.42, x + sd * (hw + 0.85) + 0.42, 0.6, 0.85, -0.2, 0.55, 0xffffff, 0.03, 1.2); }
    } else {
      K.box(M.stepStone, x - hw - 0.12, x + hw + 0.12, y0 - 0.16, y0, -0.3, 0.16, 0xffffff, 0.02, 1.2);
      K.put(M.glass, faceGeo(x - hw, x + hw, y0, ys + hw, [], 1.0), 0, 0, -0.32);
      for (const dx of [-hw / 2, 0, hw / 2]) K.box(M.paint, x + dx - 0.025, x + dx + 0.025, y0, ys + Math.sqrt(Math.max(0, hw * hw - dx * dx)), -0.32, -0.28, 0x3a3a30, 0.005);
      for (let yy = y0 + 0.7; yy < ys + hw; yy += 0.7) { const ww = yy > ys ? Math.sqrt(Math.max(0, hw * hw - (yy - ys) ** 2)) : hw; K.box(M.paint, x - ww, x + ww, yy - 0.025, yy + 0.025, -0.32, -0.28, 0x3a3a30, 0.005); }
      for (let i = 0; i < 9; i++) { const bx = x - hw + 0.1 + i * (2 * hw - 0.2) / 8; K.beam(M.paint, [bx, y0, -0.12], [bx, y0 + 1.7, -0.12], 0.016, 0x1e2420, true, 6); K.put(M.paint, cone(0.035, 0.1, 6), bx, y0 + 1.75, -0.12, 0, 0, 0, 1, 1, 1, 0x1e2420); }
      K.beam(M.paint, [x - hw, y0 + 1.5, -0.12], [x + hw, y0 + 1.5, -0.12], 0.02, 0x1e2420, false);
    }
  }
  // first floor: pedimented tall windows (alternating triangle / segment) between pilasters
  for (const [i, h] of ffH.entries()) { const { x, hw, y0, y1 } = h;
    for (const sd of [-1, 1]) K.box(M.ashlar, x + sd * hw - (sd > 0 ? 0 : 0.06), x + sd * hw + (sd > 0 ? 0.06 : 0), y0, y1, -0.5, 0, 0xe8e0d0, 0.005, 2.4);
    K.box(M.ashlar, x - hw, x + hw, y1 - 0.06, y1, -0.5, 0, 0xe0d8c8, 0.005, 2.4);
    K.put(M.glass, plane(2 * hw, y1 - y0), x, (y0 + y1) / 2, -0.32);
    K.box(M.paint, x - 0.03, x + 0.03, y0, y1, -0.32, -0.28, 0xe8e0d0, 0.005); for (let yy = y0 + 0.62; yy < y1; yy += 0.62) K.box(M.paint, x - hw, x + hw, yy - 0.025, yy + 0.025, -0.32, -0.28, 0xe8e0d0, 0.005);
    for (const sd of [-1, 1]) K.box(M.ashlar, x + sd * (hw + 0.1) - 0.1, x + sd * (hw + 0.1) + 0.1, y0 - 0.1, y1 + 0.1, 0, 0.1, 0xfff8ec, 0.02, 2.4);
    K.box(M.ashlar, x - hw - 0.25, x + hw + 0.25, y0 - 0.2, y0, -0.1, 0.22, 0xffffff, 0.02, 2.4); K.box(M.ashlar, x - hw - 0.3, x + hw + 0.3, y1 + 0.1, y1 + 0.32, -0.1, 0.25, 0xffffff, 0.02, 2.4);
    if (i % 2) { for (const sd of [-1, 1]) K.put(M.ashlar, rboxGeo(hw + 0.42, 0.14, 0.3, 0.02, 2.4), x + sd * (hw + 0.42) / 2 * 0.98, y1 + 0.32 + 0.25, 0.1, 0, 0, -sd * 0.42, 1, 1, 1, 0xfffaf0); }
    else K.put(M.ashlar, tor(hw + 0.4, 0.12, 6, 20, 1.5), x, y1 - 0.37, 0.12, 0, 0, Math.PI / 2 - 0.75, 1, 1, 1.4, 0xfffaf0);
    // balconette balustrade under each window
    K.box(M.ashlar, x - hw - 0.15, x + hw + 0.15, EX.gf + 0.55, EX.gf + 0.65, -0.1, 0.4, 0xffffff, 0.02, 2.4); K.box(M.ashlar, x - hw - 0.15, x + hw + 0.15, y0 - 0.32, y0 - 0.22, -0.1, 0.42, 0xffffff, 0.02, 2.4);
    for (let b = 0; b < 7; b++) K.put(M.ashlar, lathe('bal', [[0, 0], [0.07, 0], [0.05, 0.08], [0.09, 0.3], [0.05, 0.62], [0.07, 0.7], [0, 0.72]], 8), x - hw + 0.1 + b * (2 * hw - 0.2) / 6, EX.gf + 0.65, 0.18, 0, 0, 0, 1, (y0 - 0.32 - EX.gf - 0.65) / 0.72, 1, 0xf6eee0);
  }
  for (let k = -4; k <= 5; k++) { const x = (k - 0.5) * B; if (Math.abs(x) > EX.half) continue; // coupled pilasters with capitals
    for (const dx of [-0.35, 0.35]) { K.box(M.ashlar, x + dx - 0.24, x + dx + 0.24, EX.gf + 0.55, EX.ff, 0, 0.14, 0xfff6e8, 0.02, 2.4); K.box(M.ashlar, x + dx - 0.3, x + dx + 0.3, EX.ff - 0.35, EX.ff, 0, 0.22, 0xffffff, 0.03, 2.4);
      for (let f = -1; f <= 1; f++) K.box(M.ashlar, x + dx + f * 0.12 - 0.02, x + dx + f * 0.12 + 0.02, EX.gf + 0.9, EX.ff - 0.45, 0.13, 0.16, 0xd8d0c0, 0.005, 2.4); } }
  // cornice with modillions, balustrade, mansard roof with dormers and chimneys
  K.box(M.ashlar, -EX.half, EX.half, EX.ff, EX.ff + 0.5, -0.5, 0.3, 0xfff6e8, 0.02, 2.4); K.box(M.ashlar, -EX.half, EX.half, EX.ff + 0.5, EX.ff + 0.75, -0.5, 0.75, 0xffffff, 0.03, 2.4);
  for (let x = -EX.half + 0.3; x < EX.half; x += 0.6) K.box(M.ashlar, x - 0.08, x + 0.08, EX.ff + 0.38, EX.ff + 0.5, 0.3, 0.68, 0xe8e0d0, 0.01, 1.2);
  const BY = EX.ff + 0.75; K.box(M.ashlar, -EX.half, EX.half, BY, BY + 0.18, -0.6, 0.35, 0xf0e8d8, 0.02, 2.4); K.box(M.ashlar, -EX.half, EX.half, BY + 0.88, BY + 1.02, -0.6, 0.38, 0xffffff, 0.02, 2.4);
  for (let x = -EX.half + 0.2; x < EX.half; x += 0.32) K.put(M.ashlar, lathe('bal2', [[0, 0], [0.07, 0], [0.05, 0.08], [0.1, 0.3], [0.05, 0.6], [0.07, 0.7], [0, 0.7]], 8), x, BY + 0.18, 0.05, 0, 0, 0, 1, 1, 1, 0xf6eee0);
  const RZ0 = -0.8, RY0 = BY, RZ1 = -3.6, RY1 = BY + 5.6, ra = Math.atan2(RY1 - RY0, RZ0 - RZ1), RL = Math.hypot(RY1 - RY0, RZ0 - RZ1);
  K.put(M.slate, rboxGeo(EX.half * 2, RL, 0.2, 0.02, 1.6), 0, (RY0 + RY1) / 2, (RZ0 + RZ1) / 2, -(Math.PI / 2 - ra), 0, 0, 1, 1, 1, 0xffffff);
  K.put(M.slate, rboxGeo(EX.half * 2, 0.2, 6, 0.02, 1.6), 0, RY1 + 0.6, RZ1 - 2.8, 0.2, 0, 0, 1, 1, 1, 0xe0e4ec);
  K.box(M.paint, -EX.half, EX.half, RY1 - 0.05, RY1 + 0.18, RZ1 - 0.1, RZ1 + 0.1, 0x6a6e72, 0.02); for (let x = -EX.half + 0.3; x < EX.half; x += 0.5) K.put(M.paint, cone(0.05, 0.3, 4), x, RY1 + 0.32, RZ1, 0, 0, 0, 1, 1, 1, 0x4a4e52);
  for (let k = -4; k <= 4; k++) { const x = k * B, z = -1.9, y = BY + 1.6; // stone dormers with oeil-de-boeuf windows
    K.box(M.ashlar, x - 0.75, x + 0.75, BY + 0.6, y + 1.5, z - 1.2, z + 0.25, 0xfff6e8, 0.02, 2.4);
    K.put(M.ashlar, cyl(0.98, 0.98, 1.0, 16, false, -Math.PI / 2, Math.PI), x, y + 1.5, z - 0.4, Math.PI / 2, 0, 0, 1, 1, 0.55, 0xffffff);
    K.put(M.paint, circleGeo(0.42), x, y + 0.7, z + 0.26, 0, 0, 0, 1, 1, 1, 0x2a3040); K.put(M.ashlar, tor(0.46, 0.08, 6, 20), x, y + 0.7, z + 0.27, 0, 0, 0, 1, 1, 1, 0xfffaf0);
    K.put(M.ashlar, rboxGeo(0.2, 0.36, 0.14, 0.02, 1.2), x, y + 1.18, z + 0.32, 0, 0, 0, 1, 1, 1, 0xfffaf0); }
  for (const x of [-15.4, -6.6, 6.6, 15.4]) { K.box(M.ashlar, x - 0.5, x + 0.5, BY + 2, RY1 + 2.2, -5.5, -4.5, 0xf0e8d8, 0.02, 2.4); K.box(M.ashlar, x - 0.6, x + 0.6, RY1 + 2.2, RY1 + 2.45, -5.6, -4.4, 0xffffff, 0.02, 2.4);
    for (const dx of [-0.25, 0, 0.25]) K.put(M.paint, cyl(0.07, 0.07, 0.35, 8), x + dx, RY1 + 2.6, -5, 0, 0, 0, 1, 1, 1, 0x8a5a3a); }
  // carved plaque over the door
  K.put(signMat('ENTRÉE DU MUSÉE', '#d8ccb0', '#3a3024', { w: 1024, h: 150, fs: 0.62, dots: false }), plane(3.1, 0.42), DOORX, EX.gf + 0.27, 0.36);
  K.box(M.ashlar, DOORX - 1.75, DOORX + 1.75, EX.gf + 0.02, EX.gf + 0.52, 0, 0.35, 0xe8dcc8, 0.02, 1.2);
  // pavement, kerb, cobbled street, far pavement with railing and trees, gutters
  K.box(M.flags, -40, 40, 0, 0.15, -0.5, EX.pave, 0xffffff, 0.01, 3.2); K.box(M.stepStone, -40, 40, 0, 0.16, EX.pave, EX.pave + 0.28, 0xb8b0a4, 0.03, 1.2);
  K.box(M.cobble, -60, 60, -0.1, 0, EX.pave + 0.28, EX.street, 0xffffff, 0.01, 1.4);
  K.box(M.flags, -60, 60, 0, 0.15, EX.street, EX.street + 4, 0xf0f0f0, 0.01, 3.2); K.box(M.stepStone, -60, 60, 0, 0.16, EX.street - 0.28, EX.street, 0xb8b0a4, 0.03, 1.2);
  K.box(M.paint, -60, 60, -0.12, 0, EX.street + 4, 120, 0x6a7a4a, 0.02); // garden ground beyond
  for (let x = -40; x <= 40; x += 0.25) K.beam(M.paint, [x, 0.15, EX.street + 3.6], [x, 1.2, EX.street + 3.6], 0.012, 0x1e2420, true, 5);
  K.beam(M.paint, [-40, 1.1, EX.street + 3.6], [40, 1.1, EX.street + 3.6], 0.02, 0x1e2420, false); K.beam(M.paint, [-40, 0.3, EX.street + 3.6], [40, 0.3, EX.street + 3.6], 0.02, 0x1e2420, false);
  // street furniture: candelabra gas lamps, a Morris column, benches, a queue barrier rail
  const lamp = (x, z) => { K.put(M.paint, lathe('lampbase', [[0, 0], [0.2, 0], [0.18, 0.2], [0.1, 0.5], [0.07, 0.9], [0.05, 1.2], [0.05, 3.4], [0.08, 3.5], [0, 3.55]], 10), x, 0.15, z, 0, 0, 0, 1, 1, 1, 0x2a3a30);
    K.box(M.warm, x - 0.16, x + 0.16, 3.75, 4.15, z - 0.16, z + 0.16, 0xfff4dc, 0.02); K.put(M.paint, cone(0.3, 0.3, 4), x, 4.3, z, 0, Math.PI / 4, 0, 1, 1, 1, 0x2a3a30);
    K.box(M.paint, x - 0.2, x + 0.2, 3.65, 3.75, z - 0.2, z + 0.2, 0x2a3a30, 0.01); for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) K.box(M.paint, x + a * 0.16 - 0.02, x + a * 0.16 + 0.02, 3.75, 4.15, z + b * 0.16 - 0.02, z + b * 0.16 + 0.02, 0x2a3a30, 0.005); };
  for (const x of [-15.4, -6.6, 6.6, 15.4]) lamp(x, EX.pave - 0.45); for (const x of [-9, 0, 9]) lamp(x, EX.street + 0.5);
  const MC = [-7.2, 0, 4.0]; K.put(M.posters, cyl(0.62, 0.62, 2.6, 24, true), MC[0], 0.95 + 1.3, MC[2], 0, 0, 0, 1, 1, 1, 0xffffff);
  K.put(M.paint, cyl(0.7, 0.75, 0.8, 24), MC[0], 0.15 + 0.4, MC[2], 0, 0, 0, 1, 1, 1, 0x2a4a3a); K.put(M.paint, cyl(0.78, 0.66, 0.25, 24), MC[0], 3.4, MC[2], 0, 0, 0, 1, 1, 1, 0x2a4a3a);
  K.put(M.paint, sph(0.6, 16, 8), MC[0], 3.55, MC[2], 0, 0, 0, 1, 0.7, 1, 0x2a4a3a); K.put(M.paint, sph(0.1, 8, 6), MC[0], 4.0, MC[2], 0, 0, 0, 1, 1, 1, 0xc8a050);
  for (const x of [-17, 9.5]) K.at(x, 0.15, EX.pave - 1.0, Math.PI, () => { K.box(M.oak, -0.9, 0.9, 0.42, 0.46, -0.2, 0.2, 0x5a7a4a, 0.01); K.box(M.oak, -0.9, 0.9, 0.55, 0.85, 0.2, 0.24, 0x5a7a4a, 0.01); for (const sx of [-1, 1]) K.box(M.paint, sx * 0.78 - 0.03, sx * 0.78 + 0.03, 0, 0.85, -0.2, 0.24, 0x2a3a30, 0.01); });
  for (let x = 2.2; x < 20; x += 2.4) { K.beam(M.paint, [x, 0.15, 3.3], [x, 1.0, 3.3], 0.03, 0x3a2a20, true, 6); if (x + 2.4 < 20) K.beam(M.oak, [x, 0.92, 3.3], [x + 2.4, 0.92, 3.3], 0.035, 0x8a6a4a, true, 6); }
  K.build(G, 12);
  // trees across the street (world.js prefabs)
  const PF = props(), list = [[], [], []]; for (let x = -38, i = 0; x <= 38; x += 7.5, i++) list[i % 3].push([x + (i % 2) * 0.8, 0, EX.street + 2.4, i * 0.7, 1.15 + (i % 3) * 0.1]);
  for (let v = 0; v < 3; v++) instance(G, PF.trees[v], list[v]);
  // queue spots: a line along the pavement from the doorway out toward +x, facing the door
  const queue = []; for (let i = 0; i < 16; i++) queue.push([2.4 + i * 0.95 + (i % 3) * 0.08, 0.15, 2.3 + ((i * 37) % 5) * 0.08 - 0.16]);
  return { queue, door: [DOORX, 0.6, 0], guard: [-1.9, 0.3, 0.9], morris: MC };
}
const cone = (r, h, rs = 4) => cached(`co${r}|${h}|${rs}`, () => new THREE.ConeGeometry(r, h, rs));
const circleGeo = (r) => cached(`ci${r}`, () => new THREE.CircleGeometry(r, 24));

// ================================================================= lights, grades, views
export const LIGHT = {
  // gallery: daylight through the glass roof only (no electric light in the 1911 galleries); warm bounce fill
  gallery: { hemiI: 1.1, sky: '#ffe8cc', ground: '#5a2a28', sunCol: '#fff0d4', sunI: 2.7, az: 230, el: 64, shadow: true, fillCol: '#9a8ed0', fillI: 0.24, fog: '#3a2420', fogN: 22, fogF: 120, hor: '#3a2a1e', shafts: 0, cardTint: '#fff2e2' },
  stair: { hemiI: 0.62, sky: '#cfd6ee', ground: '#3a3440', sunCol: '#ffe6c0', sunI: 2.6, az: 168, el: 40, shadow: true, fillCol: '#6a78c0', fillI: 0.18, fog: '#1e1a24', fogN: 9, fogF: 45, hor: '#1e1a24', shafts: 0, cardTint: '#eef0ff' },
  exterior: { ...LIGHTS_.day, az: 28, el: 40, fogN: 80, fogF: 520, shadow: true, clouds: true, practI: 0 },
};
const sunDir = (L) => { const el = L.el * Math.PI / 180, az = L.az * Math.PI / 180; return new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)); };
export const GRADE = {
  gallery: { exp: 1.24, lift: [0.05, 0.03, 0.03], tH: ['#ffe6c8', 0.04], hal: [0.24, '#ff9a60'], bloom: [0.5, 0.82], vig: [0.3, 0.48, '#4a2a3a'] },
  stair: { exp: 1.16, lift: [0.045, 0.035, 0.05], tS: ['#3a4a7a', 0.18], tH: ['#ffe0c0', 0.04], vig: [0.38, 0.42, '#2a2a44'], bloom: [0.45, 0.8], hal: [0.22, '#ff9a50'] },
  exterior: { exp: 1.12 },
};
const LOOK = { gallery: 'office', stair: 'office', exterior: 'stadium' };
// practical point lights per set (local coords) — max 4 (main.js PRACT pool)
const PRACT_L = {
  gallery: [{ p: [0, 2.7, -5.6], col: '#ffd8a8', I: 4.5, d: 7 }, { p: [0, 5.5, 4.5], col: '#ffe4c0', I: 3.0, d: 14 }, { p: [-5.5, 4.5, -2], col: '#ffd0a0', I: 2.2, d: 9 }, { p: [5.5, 4.5, -2], col: '#ffd0a0', I: 2.2, d: 9 }],
  stair: [{ p: [ST.x0 + 0.35, 1.75 + 1.95, -2.2], col: '#ffb060', I: 1.8, d: 4.5 }, { p: [0, 1.0, 2.6], col: '#b8c4ff', I: 1.0, d: 4 }, { p: [0.6, 4.6, 1.4], col: '#ffc890', I: 1.2, d: 4 }],
  exterior: [{ p: [0, 2.6, -2.5], col: '#ffb060', I: 4, d: 6 }],
};

export function buildLouvre(ctx) {
  ({ THREE, toon, mkTex } = ctx); Mx = materials();
  const groups = {}, info = {};
  for (const name of ['gallery', 'stair', 'exterior']) { const g = new THREE.Group(); g.name = 'louvre_' + name; g.position.set(...ORIGIN[name]); g.visible = false; ctx.scene.add(g); groups[name] = g; }
  info.gallery = buildGallery(groups.gallery, ctx); info.stair = buildStair(groups.stair, ctx); info.exterior = buildExterior(groups.exterior, ctx);
  const W = (name, p) => [p[0] + ORIGIN[name][0], p[1] + ORIGIN[name][1], p[2] + ORIGIN[name][2]];
  const gi = info.gallery, si = info.stair, ei = info.exterior;
  const spots = {
    monaCentre: W('gallery', [0, gi.monaY, -GH + 0.05]), monaWallFront: W('gallery', [0, 0, -GH + 0.6]), ropeLine: W('gallery', [0, 0, gi.rope.z]), galleryBench: W('gallery', [0, 0.5, 1.6]),
    galleryDoorL: W('gallery', [-GH, 0, 0]), galleryDoorR: W('gallery', [GH, 0, 0]), galleryEntrance: W('gallery', [0, 0, GH]), crowdFront: W('gallery', [0, 0, -4.2]),
    hooks: gi.hooks.map((h) => W('gallery', h)),
    stairMan: W('stair', si.man), stairHeld: W('stair', [si.man[0], si.landingY + 0.58, si.man[2] + 0.34]), stairDiscard: W('stair', si.discardStep), stairWindow: W('stair', si.window), stairLamp: W('stair', si.lamp),
    stairBottom: W('stair', [-0.85, 0, 2.4]), stairUpper: W('stair', [0.85, si.upperY, 2.6]),
    door: W('exterior', ei.door), guard: W('exterior', ei.guard), queue: ei.queue.map((q) => W('exterior', q)), morris: W('exterior', ei.morris),
  };
  const v = (set, p, l, fov, cInf, fp, extra = {}) => ({ set, p: W(set, p), l: W(set, l), fov, cInf, fp: fp ? W(set, fp) : null, ...extra });
  const views = [
    v('gallery', [0.4, 1.6, 7.55], [0, 3.1, -8], 58, 1.5, [0, 2, -7.9]),                                         // 0 wide: the Salon Carré with the painting
    v('gallery', [0.05, 1.98, -6.15], [0, 1.95, -8], 40, 4, [0, 1.95, -7.95]),                                    // 1 painting close-up
    v('gallery', [0.45, 1.7, -4.3], [0, 1.98, -8], 48, 2.5, [0, 1.95, -7.95], { empty: true }),                  // 2 empty wall: hooks + lighter patch
    v('stair', [-0.95, 1.0, 2.7], [-0.45, 2.75, -2.6], 54, 2, [-0.75, 2.5, -1.8], { man: 'framed' }),             // 3 stairwell: man with the framed painting
    v('exterior', [8.6, 1.6, 10.8], [1.8, 3.0, 0.5], 54, 1.5, [3.5, 1.5, 2.3], { queue: 14 }),                     // 4 exterior: doorway + queue
    v('gallery', [6.2, 1.7, 6.6], [-1.5, 4.6, -6], 54, 1.2, [0, 2.5, -7]),                                        // 5 corner wide: skylight + shafts
    v('stair', [-0.25, 2.1, 2.2], [-0.85, 1.25, -0.4], 50, 3, [-0.95, 1.15, 0.1], { man: 'canvas' }),                   // 6 discarded frame on the step (canvas only)
    v('exterior', [-3.0, 1.7, 19.4], [0.5, 8.4, -2], 60, 1, [0, 6, 0], { queue: 14 }),                               // 7 facade wide from across the street
  ];
  for (const c of views) c.focus = Math.hypot(...[0, 1, 2].map((i) => c.p[i] - (c.fp || c.l)[i]));
  const L0 = {
    groups, gallery: groups.gallery, stair: groups.stair, exterior: groups.exterior, origin: ORIGIN, spots, views, info,
    mona: gi.mona, lighterPatch: gi.lighter, shafts: gi.shafts,
    stairHeld: si.held, stairCanvas: si.heldCanvas, stairFrame: si.discarded,
    makeMonaProp, makeFrameProp: () => makeMonaProp({ frame: true, canvas: false }), makeCanvasProp: () => makeMonaProp({ frame: false, canvas: true }),
    monaTex: Mx.T.mona, drawMona,
    setEmpty(b) { gi.mona.visible = !b; },
    // stairwell beat: 'framed' (man holds the framed painting), 'canvas' (frame discarded on the step, he holds the panel), null (nothing)
    setStairBeat(beat) { si.held.visible = beat === 'framed'; si.heldCanvas.visible = beat === 'canvas'; si.discarded.visible = beat === 'canvas' || beat === 'discarded'; },
    lightFor: (name) => (name === 'exterior' ? { ...LIGHT.exterior } : { ...LIGHTS_.office, ...LIGHT[name] }), gradeFor: (name) => GRADE[name] || {}, lookFor: (name) => LOOK[name] || 'office', LIGHTS: LIGHT, GRADES: GRADE, practicals: PRACT_L,
    show(world, name) { for (const k in groups) groups[k].visible = k === name; setBias(ctx.scene, name); if (name) for (const k of ['road', 'stadium', 'office', 'car', 'dc']) if (world[k]) world[k].visible = false; if (name && world.rooms) world.rooms.show(world, null); },
    placeLights(PRACT, name) { const Lp = PRACT_L[name] || []; PRACT.forEach((l, i) => { const c = Lp[i]; l.visible = true; if (!c) { l.intensity = 0; return; } l.position.set(...W(name, c.p)); l.color.set(c.col); l.intensity = c.I; l.distance = c.d; l.decay = 1.6; }); },
    viewFor: (i) => { const c = views[i % views.length]; return { i: i % views.length, set: c.set, L: L0.lightFor(c.set), grade: L0.gradeFor(c.set), look: L0.lookFor(c.set), cam: L0.camFor(i) }; },
    camFor: (i) => { const c = views[i % views.length]; return { p: c.p, l: c.l, fov: c.fov, focus: c.focus, cInf: c.cInf }; },
    // test-view helper used by main.js ?louvreview=N: shows the set, sets props + lamps + stand-ins, returns { set, L, grade, look, cam }
    applyView(world, PRACT, i) { const c = views[i % views.length]; L0.show(world, c.set); L0.setEmpty(!!c.empty); L0.setStairBeat(c.man || null); L0.placeLights(PRACT, c.set); standIns(L0, c);
      return { set: c.set, L: L0.lightFor(c.set), grade: L0.gradeFor(c.set), look: L0.lookFor(c.set), cam: L0.camFor(i) }; },
  };
  return L0;
}

// sun shadow bias: deeper normal offset inside the closed Louvre rooms (restored for every other set)
let SUN = null, BIAS0 = null;
function setBias(scene, name) {
  if (!SUN) { scene.traverse((o) => { if (!SUN && o.isDirectionalLight && o.castShadow) SUN = o; }); if (!SUN) return; BIAS0 = [SUN.shadow.bias, SUN.shadow.normalBias]; }
  const room = name === 'gallery' || name === 'stair'; SUN.shadow.bias = room ? -0.002 : BIAS0[0]; SUN.shadow.normalBias = room ? 0.12 : BIAS0[1];
}
// ---------------------------------------------------------------- test stand-ins (cards for scale in ?louvreview stills only)
let SI = null;
function standIns(L0, c) {
  if (!SI) { SI = { g: new THREE.Group(), cards: [] }; SI.g.name = 'louvre_standins'; L0.gallery.parent.add(SI.g);
    const geo = new THREE.PlaneGeometry(1.35, 2.25); geo.translate(0, 1.069, 0);
    const mk = (o, op) => { const cv = document.createElement('canvas'); cv.width = 600; cv.height = 1000; oddverra(cv.getContext('2d'), o, op); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: 0.8, color: new THREE.Color(0xffffff).multiplyScalar(0.4), alphaTest: 0.5, side: THREE.DoubleSide })); m.castShadow = true; SI.g.add(m); return m; };
    SI.man = mk({ shirt: '#eeeae0', pants: '#4a4048', hair: 'short', hairCol: '#2a1a12', moustache: '#2a1a12', build: 'adult', head: 'wide', skin: '#e8b48a' }, { expr: 'nervous', t: 3 });
    const sk = ['#f2c9a4', '#e0b088', '#c98a5e', '#f6d0b0'];
    for (let i = 0; i < 16; i++) SI.cards.push(mk(i % 2 ? { shirt: ['#5a3a5a', '#2f4a6a', '#6a2a2a', '#3a4a3a'][i % 4], pants: '#3a3040', hair: ['bun', 'long', 'curly'][i % 3], hairCol: ['#4a2a1a', '#2a1a12', '#8a5a2a'][i % 3], lashes: true, head: 'egg', skin: sk[i % 4], neck: 'bow' }
      : { pattern: ['tweed', 'pinstripe', undefined][i % 3], shirt: ['#3a3a44', '#5a4a3a', '#2a3a4a', '#4a3a2a'][i % 4], pants: '#2f2f3a', hat: ['bowler', 'top', 'cap'][i % 3], hair: 'short', hairCol: '#3a2a20', moustache: i % 4 === 0 ? '#3a2a20' : undefined, skin: sk[(i + 1) % 4], head: ['round', 'wide'][i % 2], neck: 'tie' }, { expr: ['smile', 'shock', 'nervous', 'happy'][i % 4], t: i * 5 })); }
  SI.g.visible = true; for (const m of [SI.man, ...SI.cards]) m.visible = false;
  const face = (m, p) => { m.position.set(...p); m.rotation.set(0, Math.atan2(c.p[0] - p[0], c.p[2] - p[2]), 0); m.visible = true; };
  if (c.man) face(SI.man, L0.spots.stairMan);
  if (c.queue) for (let i = 0; i < Math.min(c.queue, SI.cards.length); i++) face(SI.cards[i], L0.spots.queue[i]);
}
