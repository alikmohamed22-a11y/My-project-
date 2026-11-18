// paris.js [MONA-paris]: sets for the "Mona Lisa theft" short (Paris 1911 / Florence 1913).
//   street : a 1911 Paris street corner (Haussmann blocks, café, kiosk, Morris column, taxi)   origin (1600, 0,   0)
//   attic  : Vincenzo Peruggia's tiny mansard room with the false-bottom trunk                   origin (1600, 0, 100)
//   shop   : a Florence antiques dealer's shop, December 1913 (interior + street front)           origin (1600, 0, 200)
// Each set is built in a local frame (floor/sidewalk y = 0, camera side +z) and placed at its origin. All groups start hidden;
// call show(world, name) (or applyView) to display one. Geometry goes through world.js Kit (rounded/chamfered boxes merged per
// material); painters are local and follow paint.js rules (calm fills + darker indigo-leaning drawn marks, no pixel noise).
// Original designs only: no real brands, newspapers or logos are reproduced.
import { Kit, rboxGeo } from './world.js';
import { LIGHTS_ } from './story.js';

let THREE, toon, mkTex, PT, macro;
let monaFn = null; // drawMona(g, w, h) supplied by the Louvre agent (optional)
export const PARIS_ORIGIN = { street: [1600, 0, 0], attic: [1600, 0, 100], shop: [1600, 0, 200] };
const O = PARIS_ORIGIN;
const INK = '#2b1d4a';
const W3 = (name, p) => [p[0] + O[name][0], p[1] + O[name][1], p[2] + O[name][2]];

// ---------------------------------------------------------------- geometry cache + helpers
const GC = new Map();
const cached = (k, mk) => { let g = GC.get(k); if (!g) GC.set(k, (g = mk())); return g; };
const cyl = (rt, rb, h, rs = 12, open = false, t0 = 0, tl = Math.PI * 2) => cached(`c${rt}|${rb}|${h}|${rs}|${open}|${t0}|${tl}`, () => new THREE.CylinderGeometry(rt, rb, h, rs, 1, open, t0, tl));
const sph = (r, ws = 14, hs = 10) => cached(`s${r}|${ws}|${hs}`, () => new THREE.SphereGeometry(r, ws, hs));
const tor = (r, t, rs = 6, ts = 24, arc = Math.PI * 2) => cached(`t${r}|${t}|${rs}|${ts}|${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));
const cone = (r, h, rs = 8) => cached(`k${r}|${h}|${rs}`, () => new THREE.ConeGeometry(r, h, rs));
const plane = (w, h) => cached(`p${w}|${h}`, () => new THREE.PlaneGeometry(w, h));
// plane whose uv repeats every su (x) / sv (y) metres (for tiling alpha railings etc.)
const uvPlane = (w, h, su, sv) => cached(`up${w}|${h}|${su}|${sv}`, () => { const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / su, uv.getY(i) * h / sv); return g; });
const lathe = (key, pts, n = 20) => cached('la' + key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n));
// triangular prism: base w on y = 0, apex h, extruded d along +z from 0
const prism = (w, h, d) => cached(`pr${w}|${h}|${d}`, () => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.lineTo(-w / 2, 0); return new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); });
// a profile (points in z,y) extruded across x, centred on x = 0
const profGeo = (key, pts, width, bevel = 0.02) => cached('pf' + key, () => { const sh = new THREE.Shape(); pts.forEach(([u, v], i) => (i ? sh.lineTo(u, v) : sh.moveTo(u, v))); const d = Math.max(0.005, width - 2 * bevel); const g = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 8 }); g.rotateY(-Math.PI / 2); g.translate(d / 2, 0, 0); return g; });
const mesh = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz, 'YXZ'); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
// slab between two (y,z) points across x0..x1, thickness t (box local +z runs a->b)
function slab(K, mat, x0, x1, a, b, t, c, s = 2, r = 0.01, side = -1) {
  const dy = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dy, dz), th = Math.atan2(-dy / L, dz / L);
  const ny = Math.cos(th), nz = Math.sin(th), T = Math.abs(t), k = t < 0 ? -side : side;
  K.cb(mat, x1 - x0, T, L, (x0 + x1) / 2, (a[0] + b[0]) / 2 + k * ny * T / 2, (a[1] + b[1]) / 2 + k * nz * T / 2, c, th, 0, 0, r, s);
}

// ---------------------------------------------------------------- painters
const { css, shade, tint, vary, rng, fbm, modulate, hex } = { css: (...a) => PT.css(...a), shade: (...a) => PT.shade(...a), tint: (...a) => PT.tint(...a), vary: (...a) => PT.vary(...a), rng: (...a) => PT.rng(...a), fbm: (...a) => PT.fbm(...a), modulate: (...a) => PT.modulate(...a), hex: (...a) => PT.hex(...a) };
// cream ashlar: running-bond blocks with fine joints, chisel pits and soft rain streaks
function ashlar(g, w, h, o = {}) {
  const base = hex(o.base || '#e6d5b2'), R = rng(o.seed || 3), rows = o.rows || 4, cols = o.cols || 2, rh = h / rows, cw = w / cols;
  g.fillStyle = css(shade(base, 0.8)); g.fillRect(0, 0, w, h);
  for (let r = 0; r < rows; r++) for (let c = -1; c <= cols; c++) {
    const x = c * cw + (r % 2) * cw / 2, y = r * rh, col = vary(base, (R() - 0.5) * 0.08);
    g.fillStyle = css(col); g.fillRect(x + 2, y + 2, cw - 4, rh - 4);
    g.fillStyle = css(tint(col, 1.12), 0.6); g.fillRect(x + 2, y + 2, cw - 4, 2);
    g.fillStyle = css(shade(col, 0.86), 0.45); g.fillRect(x + 2, y + rh - 4, cw - 4, 2);
    for (let k = 0; k < 3; k++) { g.fillStyle = css(shade(col, 0.78), 0.3); g.beginPath(); g.arc(x + 6 + R() * (cw - 12), y + 6 + R() * (rh - 12), 1 + R() * 2, 0, 7); g.fill(); }
  }
  for (let i = 0; i < 9; i++) { const x = R() * w, len = h * (0.25 + R() * 0.6); const gr = g.createLinearGradient(0, 0, 0, len); gr.addColorStop(0, css(shade(base, 0.8), 0.12)); gr.addColorStop(1, css(shade(base, 0.8), 0)); g.fillStyle = gr; g.fillRect(x, 0, 3 + R() * 9, len); }
  modulate(g, w, h, (u, v) => 0.95 + 0.08 * fbm(u, v, 3, 3, 3, o.seed || 3));
}
// continuous horizontal rustication (bossage) for the ground floor
function rustic(g, w, h, o = {}) {
  const base = hex(o.base || '#ddc9a4'), R = rng(o.seed || 9), rows = o.rows || 4, rh = h / rows;
  for (let r = 0; r < rows; r++) { const col = vary(base, (R() - 0.5) * 0.05), y = r * rh; g.fillStyle = css(col); g.fillRect(0, y, w, rh);
    g.fillStyle = css(shade(col, 0.55), 0.95); g.fillRect(0, y + rh - 9, w, 6); g.fillStyle = css(tint(col, 1.18), 0.8); g.fillRect(0, y + rh - 3, w, 3); g.fillStyle = css(shade(col, 0.85), 0.5); g.fillRect(0, y + rh - 13, w, 4);
    for (let k = 0; k < 2; k++) { const x = R() * w; g.fillStyle = css(shade(col, 0.8), 0.4); g.fillRect(x, y, 2, rh - 9); } }
  modulate(g, w, h, (u, v) => 0.95 + 0.09 * fbm(u, v, 3, 3, 3, (o.seed || 9) + 4));
}
// zinc roofing: standing seams, cross seams, patina streaks
function zinc(g, w, h, o = {}) {
  const base = hex(o.base || '#8e97a3'), R = rng(o.seed || 13), n = o.n || 4;
  g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { const x0 = i * w / n, col = vary(base, (R() - 0.5) * 0.08); g.fillStyle = css(col); g.fillRect(x0 + 3, 0, w / n - 6, h);
    for (let k = 0; k < 3; k++) { const y = ((k + R() * 0.3) / 3) * h; g.fillStyle = css(shade(col, 0.7), 0.5); g.fillRect(x0 + 3, y, w / n - 6, 2); g.fillStyle = css(tint(col, 1.15), 0.4); g.fillRect(x0 + 3, y + 2, w / n - 6, 1); }
    g.fillStyle = css(shade(base, 0.5)); g.fillRect(x0, 0, 3, h); g.fillStyle = css(tint(base, 1.3), 0.8); g.fillRect(x0 + 3, 0, 2, h); }
  for (let i = 0; i < 14; i++) { g.fillStyle = css(R() < 0.5 ? shade(base, 0.75) : tint(base, 1.12), 0.12); g.fillRect(R() * w, 0, 2 + R() * 6, h); }
  modulate(g, w, h, (u, v) => 0.94 + 0.1 * fbm(u, v, 2, 3, 3, (o.seed || 13) + 2));
}
// granite setts (pavés) in straight staggered courses
function setts(g, w, h, o = {}) {
  const base = hex(o.base || '#8c8680'), R = rng(o.seed || 17), rows = o.rows || 16, cols = o.cols || 8, rh = h / rows, cw = w / cols;
  g.fillStyle = css(shade(base, 0.42)); g.fillRect(0, 0, w, h);
  for (let r = 0; r < rows; r++) for (let c = -1; c <= cols; c++) {
    const x = c * cw + (r % 2) * cw * 0.5 + (R() - 0.5) * 3, y = r * rh, col = vary(base, (R() - 0.5) * 0.28), hue = (R() - 0.5) * 0.12, cc = [col[0] * (1 + hue), col[1], col[2] * (1 - hue)];
    const m = 3; g.fillStyle = css(cc); g.beginPath(); g.roundRect(x + m, y + m, cw - 2 * m, rh - 2 * m, 7); g.fill();
    g.fillStyle = css(tint(cc, 1.25), 0.55); g.beginPath(); g.roundRect(x + m + 3, y + m + 2, cw - 2 * m - 8, 4, 2); g.fill();
    g.fillStyle = css(shade(cc, 0.7), 0.6); g.beginPath(); g.roundRect(x + m + 2, y + rh - m - 6, cw - 2 * m - 4, 4, 2); g.fill();
    if (R() < 0.18) { g.strokeStyle = css(shade(cc, 0.6), 0.6); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + cw * 0.3, y + m + 3); g.lineTo(x + cw * 0.45, y + rh * 0.6); g.stroke(); }
  }
  modulate(g, w, h, (u, v) => { const n = fbm(u, v, 3, 3, 3, (o.seed || 17) + 1); return [0.88 + 0.2 * n, 0.88 + 0.2 * n, 0.9 + 0.18 * n]; });
}
// asphalt sidewalk: calm fill, soft blotches, a few seams and repaired patches
function asphaltWalk(g, w, h, o = {}) {
  const base = hex(o.base || '#958d84'), R = rng(o.seed || 19); g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  for (let i = 0; i < 3; i++) { const x = R() * w, y = R() * h; g.fillStyle = css(shade(base, 0.9), 0.5); g.fillRect(x, y, 60 + R() * 90, 40 + R() * 60); g.strokeStyle = css(shade(base, 0.7), 0.4); g.lineWidth = 2; g.strokeRect(x, y, 60, 40); }
  for (let i = 0; i < 4; i++) { g.strokeStyle = css(shade(base, 0.65), 0.45); g.lineWidth = 1.5; let x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (R() - 0.3) * 18; y += (R() - 0.5) * 18; g.lineTo(x, y); } g.stroke(); }
  modulate(g, w, h, (u, v) => 0.9 + 0.18 * fbm(u, v, 3, 3, 3, o.seed || 19));
}
// French window seen from outside: frame, casements, glass with sky reflection; v = 0 lace, 1 drapes, 2 lit, 3 shutters half closed, 4 green persiane (Florence)
function windowTex(g, w, h, v = 0, seed = 1) {
  const R = rng(seed + v * 7), frame = '#e8e0cf', fr = shade(frame, 0.7);
  const glass = (x, y, gw, gh) => { const gr = g.createLinearGradient(0, y, 0, y + gh); if (v === 2) { gr.addColorStop(0, '#ffcf80'); gr.addColorStop(1, '#e88a40'); } else { gr.addColorStop(0, '#6f7fa8'); gr.addColorStop(0.5, '#3a3c5c'); gr.addColorStop(1, '#2a2440'); } g.fillStyle = gr; g.fillRect(x, y, gw, gh); };
  g.fillStyle = '#2a2236'; g.fillRect(0, 0, w, h);
  const m = w * 0.07, cw = (w - 2 * m) / 2;
  for (let c = 0; c < 2; c++) { const x0 = m + c * cw; glass(x0, m, cw, h - 2 * m); }
  // curtains / interior
  if (v === 0 || v === 2) { for (const sd of [0, 1]) { const x0 = sd ? w - m - cw * 0.55 : m; g.fillStyle = css(v === 2 ? '#fff0c8' : '#e9e2d4', v === 2 ? 0.75 : 0.85); g.fillRect(x0, m, cw * 0.55, h - 2 * m);
      g.strokeStyle = css(v === 2 ? '#d89a50' : '#b8b0a4', 0.6); g.lineWidth = 2; for (let k = 0; k < 5; k++) { const xx = x0 + (k + 0.5) * cw * 0.11; g.beginPath(); g.moveTo(xx, m); g.quadraticCurveTo(xx + 4, h * 0.6, xx - 2, h - m); g.stroke(); }
      for (let y = m + 20; y < h - m; y += 26) for (let x = x0 + 8; x < x0 + cw * 0.55 - 6; x += 18) { g.fillStyle = css('#a8a094', 0.35); g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); } } }
  if (v === 1) { for (const sd of [0, 1]) { const x0 = sd ? w - m - cw * 0.7 : m; const gr = g.createLinearGradient(x0, 0, x0 + cw * 0.7, 0); gr.addColorStop(0, '#6a1e2a'); gr.addColorStop(0.5, '#8a2a34'); gr.addColorStop(1, '#5a1824'); g.fillStyle = gr; g.fillRect(x0, m, cw * 0.7, h - 2 * m); g.strokeStyle = 'rgba(40,10,20,0.5)'; g.lineWidth = 3; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x0 + (k + 0.5) * cw * 0.17, m); g.lineTo(x0 + (k + 0.5) * cw * 0.17, h - m); g.stroke(); } } }
  if (v === 2) { g.fillStyle = 'rgba(255,240,200,0.9)'; g.beginPath(); g.arc(w / 2, h * 0.36, w * 0.06, 0, 7); g.fill(); }
  // reflections: two soft diagonal streaks
  if (v !== 2) { g.save(); g.globalAlpha = 0.16; g.fillStyle = '#dfe8ff'; g.beginPath(); g.moveTo(m, h * 0.55); g.lineTo(m + cw * 0.7, h * 0.18); g.lineTo(m + cw * 0.9, h * 0.18); g.lineTo(m, h * 0.72); g.fill(); g.beginPath(); g.moveTo(w - m - cw * 0.9, h * 0.9); g.lineTo(w - m, h * 0.5); g.lineTo(w - m, h * 0.58); g.lineTo(w - m - cw * 0.75, h * 0.92); g.fill(); g.restore(); }
  // casement frames + glazing bars (3 panes high)
  g.fillStyle = css(frame); g.fillRect(0, 0, w, m); g.fillRect(0, h - m, w, m); g.fillRect(0, 0, m, h); g.fillRect(w - m, 0, m, h); g.fillRect(w / 2 - m * 0.6, 0, m * 1.2, h);
  for (let k = 1; k < 4; k++) { const y = m + k * (h - 2 * m) / 4; g.fillRect(m, y - 3, w - 2 * m, 6); }
  g.fillStyle = css(fr, 0.8); g.fillRect(m - 2, m - 2, w - 2 * m + 4, 3); g.fillRect(w / 2 + m * 0.6 - 2, m, 2, h - 2 * m);
  // shutters
  if (v === 3 || v === 4) { const sc = v === 4 ? '#4a6a4a' : '#8a8a86', sw = v === 4 ? cw * 0.95 : cw * 0.62; for (const sd of [0, 1]) { const x0 = sd ? w - sw : 0; g.fillStyle = css(sc); g.fillRect(x0, 0, sw, h); g.fillStyle = css(shade(sc, 0.6)); for (let y = 6; y < h; y += 11) g.fillRect(x0 + 6, y, sw - 12, 4); g.fillStyle = css(tint(sc, 1.2), 0.6); for (let y = 10; y < h; y += 11) g.fillRect(x0 + 6, y, sw - 12, 1.5); g.strokeStyle = css(shade(sc, 0.5)); g.lineWidth = 4; g.strokeRect(x0 + 2, 2, sw - 4, h - 4); } }
}
// wrought-iron railing (alpha): handrail, base bars, scroll modules with rosettes. Texture spans 1.2 m x 1.0 m
function railTex(g, w, h) {
  g.clearRect(0, 0, w, h); g.lineCap = 'round'; g.lineJoin = 'round';
  const draw = (lw, col, off) => {
    g.save(); g.translate(off, off); g.strokeStyle = col; g.lineWidth = lw;
    g.beginPath(); g.moveTo(-10, h * 0.05); g.lineTo(w + 10, h * 0.05); g.moveTo(-10, h * 0.95); g.lineTo(w + 10, h * 0.95); g.moveTo(-10, h * 0.85); g.lineTo(w + 10, h * 0.85); g.moveTo(-10, h * 0.16); g.lineTo(w + 10, h * 0.16); g.stroke();
    for (let m = 0; m < 2; m++) {
      const x0 = m * w / 2, cx = x0 + w / 4, cy = h * 0.5, mw = w / 2;
      g.beginPath(); g.moveTo(x0, h * 0.05); g.lineTo(x0, h * 0.95); g.stroke();
      g.beginPath(); g.arc(cx, cy, h * 0.1, 0, 7); g.stroke(); g.beginPath(); g.arc(cx, cy, h * 0.035, 0, 7); g.stroke();
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
        g.beginPath(); g.moveTo(cx + sx * h * 0.07, cy + sy * h * 0.07); g.bezierCurveTo(cx + sx * mw * 0.22, cy + sy * h * 0.26, cx + sx * mw * 0.44, cy + sy * h * 0.3, cx + sx * mw * 0.42, cy + sy * h * 0.12);
        g.arc(cx + sx * mw * 0.36, cy + sy * h * 0.12, mw * 0.06, sx > 0 ? 0 : Math.PI, sx > 0 ? (sy > 0 ? Math.PI : -Math.PI) : 0, sx * sy < 0); g.stroke();
      }
      for (const k of [0.08, 0.92]) { g.beginPath(); g.moveTo(x0 + k * mw, h * 0.16); g.lineTo(x0 + k * mw, h * 0.85); g.stroke(); }
      g.beginPath(); g.moveTo(cx, h * 0.16); g.lineTo(cx, cy - h * 0.1); g.moveTo(cx, cy + h * 0.1); g.lineTo(cx, h * 0.85); g.stroke();
      for (const k of [0.25, 0.75]) { g.beginPath(); g.moveTo(x0 + k * mw - 10, h * 0.9); g.lineTo(x0 + k * mw, h * 0.86); g.lineTo(x0 + k * mw + 10, h * 0.9); g.stroke(); }
    }
    g.restore();
  };
  draw(11, '#1b1822', 0); draw(3, 'rgba(110,104,128,0.9)', -2);
}
// scalloped valance strip (alpha) for awnings / kiosk roofs
function scallopTex(g, w, h, o = {}) {
  g.clearRect(0, 0, w, h); const n = o.n || 8, base = hex(o.base || '#7a1e24'), s2 = o.stripes ? hex(o.stripes) : null, sw = w / n;
  g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h * 0.55); for (let i = n - 1; i >= 0; i--) { g.arc((i + 0.5) * sw, h * 0.55, sw / 2, 0, Math.PI, false); } g.closePath(); g.clip();
  g.fillStyle = css(base); g.fillRect(0, 0, w, h); if (s2) for (let i = 0; i < n; i += 2) { g.fillStyle = css(s2); g.fillRect(i * sw, 0, sw, h); }
  g.fillStyle = css(shade(base, 0.6), 0.5); g.fillRect(0, h * 0.1, w, 3);
  if (o.text) { g.font = `bold ${h * 0.4 | 0}px "DejaVu Serif", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; const tw = g.measureText(o.text).width, sx = Math.min(1, w * 0.86 / tw); g.translate(w / 2, h * 0.36); g.scale(sx, 1); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillText(o.text, 2, 3); g.fillStyle = o.fg || '#f4e6c4'; g.fillText(o.text, 0, 0); }
  g.restore();
  g.strokeStyle = css(o.trim || '#e8c870'); g.lineWidth = 3; g.beginPath(); for (let i = 0; i < n; i++) g.arc((i + 0.5) * sw, h * 0.55, sw / 2 - 2, 0, Math.PI, false); g.stroke();
}
// shop fascia (devanture bandeau): painted board, gilt pinstripes, gilt serif lettering with shadow
function fasciaTex(g, w, h, text, bg, fg = '#e8c46a', o = {}) {
  const b = hex(bg); g.fillStyle = css(b); g.fillRect(0, 0, w, h);
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0.08)'); gr.addColorStop(1, 'rgba(0,0,0,0.18)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(h * 0.09, h * 0.09, w - h * 0.18, h - h * 0.18); g.lineWidth = 1.5; g.strokeRect(h * 0.16, h * 0.16, w - h * 0.32, h - h * 0.32);
  const lines = text.split('\n'), fs = (o.fs || 0.58) * h / lines.length;
  lines.forEach((ln, i) => { const y = h / 2 + (i - (lines.length - 1) / 2) * fs * 1.1, sz = i ? fs * 0.7 : fs;
    g.font = `${o.italic ? 'italic ' : ''}bold ${sz | 0}px "DejaVu Serif", serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const sp = o.spacing ?? 0.12, chars = [...ln], cwid = chars.map((c) => g.measureText(c).width + sz * sp), tot = cwid.reduce((a, c) => a + c, 0) - sz * sp, sx = Math.min(1, (w - h * 0.7) / tot);
    g.save(); g.translate(w / 2 - tot * sx / 2, y); g.scale(sx, 1); let x = 0;
    for (let k = 0; k < chars.length; k++) { const cw = cwid[k] - sz * sp; g.fillStyle = 'rgba(10,6,16,0.55)'; g.fillText(chars[k], x + cw / 2 + sz * 0.04, sz * 0.05);
      const lg = g.createLinearGradient(0, -sz / 2, 0, sz / 2); lg.addColorStop(0, tint(fg, 1.4) ? css(tint(fg, 1.35)) : fg); lg.addColorStop(0.5, fg); lg.addColorStop(1, css(shade(fg, 0.7))); g.fillStyle = lg; g.fillText(chars[k], x + cw / 2, 0); x += cwid[k]; }
    g.restore(); });
  if (o.orn !== false) for (const x of [h * 0.42, w - h * 0.42]) { g.fillStyle = fg; g.beginPath(); g.moveTo(x, h * 0.32); g.lineTo(x + h * 0.1, h / 2); g.lineTo(x, h * 0.68); g.lineTo(x - h * 0.1, h / 2); g.fill(); }
}
// shop-window interiors seen through glass (kind: bread, tabac, cafe, mercerie, vins, books, antiques)
function shopWinTex(g, w, h, kind, o = {}) {
  const R = rng(kind.length * 13 + (o.seed || 0)); const lit = kind === 'cafe';
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, lit ? '#5a3020' : '#2c2232'); bg.addColorStop(1, lit ? '#a8602c' : '#4a3a3e'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  const shelf = (y) => { g.fillStyle = '#5a3a26'; g.fillRect(0, y, w, 10); g.fillStyle = '#7a5434'; g.fillRect(0, y, w, 3); };
  if (kind === 'bread') { for (const y of [h * 0.3, h * 0.58, h * 0.86]) { shelf(y); for (let x = 10; x < w - 30; x += 34 + R() * 10) { const c = vary([214, 160, 90], (R() - 0.5) * 0.3); g.fillStyle = css(c); g.beginPath(); g.ellipse(x + 15, y - 14, 17, 13, 0, Math.PI, 0); g.fill(); g.strokeStyle = css(shade(c, 0.6)); g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x + 6 + k * 8, y - 20); g.lineTo(x + 11 + k * 8, y - 12); g.stroke(); } } }
    for (let k = 0; k < 9; k++) { const x = w * 0.1 + k * w * 0.09; g.save(); g.translate(x, h * 0.95); g.rotate(-0.25 + R() * 0.15); g.fillStyle = css(vary([210, 150, 80], (R() - 0.5) * 0.2)); g.beginPath(); g.roundRect(-7, -h * 0.4, 14, h * 0.4, 7); g.fill(); g.restore(); } }
  else if (kind === 'tabac') { for (const y of [h * 0.28, h * 0.52, h * 0.76]) { shelf(y); for (let x = 8; x < w - 26; x += 28) { g.fillStyle = css(['#b8402c', '#d8b050', '#3a5a8a', '#e8e0c8', '#5a7a4a'][(x / 28 | 0) % 5]); g.fillRect(x, y - 30, 22, 30); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, y - 30, 22, 5); } }
    for (let k = 0; k < 6; k++) { g.strokeStyle = '#3a2418'; g.lineWidth = 6; g.beginPath(); g.moveTo(w * 0.12 + k * w * 0.13, h * 0.92); g.quadraticCurveTo(w * 0.15 + k * w * 0.13, h * 0.86, w * 0.2 + k * w * 0.13, h * 0.88); g.stroke(); g.fillStyle = '#4a2c1c'; g.fillRect(w * 0.19 + k * w * 0.13, h * 0.84, 12, 14); } }
  else if (kind === 'cafe') { g.fillStyle = 'rgba(255,220,150,0.35)'; for (const x of [w * 0.25, w * 0.75]) { g.beginPath(); g.arc(x, h * 0.18, 24, 0, 7); g.fill(); g.fillStyle = 'rgba(255,248,220,0.95)'; g.beginPath(); g.arc(x, h * 0.18, 11, 0, 7); g.fill(); g.fillStyle = 'rgba(255,220,150,0.35)'; }
    g.fillStyle = 'rgba(255,230,180,0.25)'; g.fillRect(w * 0.08, h * 0.28, w * 0.84, h * 0.26); g.strokeStyle = '#6a3a1c'; g.lineWidth = 6; g.strokeRect(w * 0.08, h * 0.28, w * 0.84, h * 0.26);
    for (let k = 0; k < 12; k++) { g.fillStyle = css(['#3a6a3a', '#7a2a2a', '#d8b860', '#3a2a1a'][k % 4]); g.fillRect(w * 0.12 + k * w * 0.064, h * 0.4, 10, 34); }
    g.fillStyle = '#4a2814'; g.fillRect(0, h * 0.62, w, h * 0.38); g.fillStyle = '#c8a070'; g.fillRect(0, h * 0.62, w, 8);
    for (const x of [w * 0.2, w * 0.55, w * 0.85]) { g.fillStyle = '#2a1810'; g.beginPath(); g.ellipse(x, h * 0.5, 16, 22, 0, 0, 7); g.fill(); g.fillRect(x - 18, h * 0.55, 36, 40); } }
  else if (kind === 'mercerie') { for (const y of [h * 0.3, h * 0.6]) { shelf(y); for (let x = 10; x < w - 20; x += 22) { g.fillStyle = css(['#c84a5a', '#4a7ac8', '#e8c850', '#5aa86a', '#e8e0d0', '#8a4ab0'][(x / 22 | 0) % 6]); g.fillRect(x, y - 26, 14, 26); g.fillStyle = '#c8a878'; g.fillRect(x - 2, y - 28, 18, 4); g.fillRect(x - 2, y - 2, 18, 3); } }
    for (const x of [w * 0.3, w * 0.7]) { g.fillStyle = '#2a2a34'; g.beginPath(); g.ellipse(x, h * 0.84, 40, 14, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x, h * 0.78, 22, 18, 0, Math.PI, 0); g.fill(); g.fillStyle = '#c84a5a'; g.fillRect(x - 22, h * 0.8, 44, 5); } }
  else { for (const y of [h * 0.3, h * 0.58, h * 0.86]) { shelf(y); for (let x = 10; x < w - 20; x += 16 + R() * 10) { g.fillStyle = css(vary([90, 50, 40], (R() - 0.5) * 0.5)); const bh = 26 + R() * 20; g.fillRect(x, y - bh, 12, bh); } } }
  // glass reflection + lettering on glass
  g.save(); g.globalAlpha = 0.18; g.fillStyle = '#eef2ff'; g.beginPath(); g.moveTo(0, h * 0.62); g.lineTo(w * 0.42, 0); g.lineTo(w * 0.56, 0); g.lineTo(0, h * 0.82); g.fill(); g.restore();
  if (o.glass) { g.font = `bold ${h * 0.075 | 0}px "DejaVu Serif", serif`; g.textAlign = 'center'; const tw = g.measureText(o.glass).width, sx = Math.min(1, w * 0.86 / tw); g.save(); g.translate(w / 2, h * 0.13); g.scale(sx, 1); g.fillStyle = 'rgba(20,10,8,0.5)'; g.fillText(o.glass, 2, 2); g.fillStyle = '#f0d070'; g.fillText(o.glass, 0, 0); g.restore(); }
}
// Morris-column posters: several overlapping bills around the drum (u wraps once around)
function postersTex(g, w, h) {
  const R = rng(41); g.fillStyle = '#d8ccb0'; g.fillRect(0, 0, w, h);
  const bills = [
    ['THÉÂTRE', 'DU CHÂTELET', '#c8402c', '#f4e4c0'], ['CYCLES', 'LAFLÈCHE', '#2c4a7a', '#f2d060'], ['CHOCOLAT', 'DUVAL', '#5a2a1a', '#f2d8a0'],
    ['GRAND BAL', 'SAMEDI', '#e8c050', '#2a1a3a'], ['SAVON', 'LUNE', '#4a7a5a', '#f8f0d8'], ['CONCERT', 'POPULAIRE', '#7a2a5a', '#f2e0c8'], ['EXPOSITION', 'DES ARTS', '#e0dcc8', '#8a2a2a'],
  ];
  const bw = w / bills.length;
  bills.forEach(([a, b, bg, fg], i) => {
    const x = i * bw + (R() - 0.5) * 10, y = h * (0.04 + R() * 0.06), ww = bw * (0.95 + R() * 0.1), hh = h * (0.86 - R() * 0.08);
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x + 4, y + 4, ww, hh); g.fillStyle = bg; g.fillRect(x, y, ww, hh);
    g.strokeStyle = fg; g.lineWidth = 3; g.strokeRect(x + 8, y + 8, ww - 16, hh - 16);
    g.fillStyle = fg; g.globalAlpha = 0.85; if (i % 3 === 0) { g.beginPath(); g.arc(x + ww / 2, y + hh * 0.55, ww * 0.28, 0, 7); g.fill(); } else if (i % 3 === 1) { g.beginPath(); g.moveTo(x + ww * 0.2, y + hh * 0.75); g.lineTo(x + ww * 0.5, y + hh * 0.38); g.lineTo(x + ww * 0.8, y + hh * 0.75); g.fill(); } else { for (let k = 0; k < 4; k++) g.fillRect(x + ww * 0.2, y + hh * (0.4 + k * 0.1), ww * 0.6, 6); } g.globalAlpha = 1;
    for (const [t, yy, s] of [[a, 0.2, 0.15], [b, 0.33, 0.1]]) { g.font = `bold ${hh * s | 0}px "DejaVu Serif", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; const tw = g.measureText(t).width, sx = Math.min(1, (ww - 24) / tw); g.save(); g.translate(x + ww / 2, y + hh * yy); g.scale(sx, 1); g.fillStyle = fg; g.fillText(t, 0, 0); g.restore(); }
    g.font = `${hh * 0.045 | 0}px "DejaVu Serif", serif`; g.fillStyle = fg; g.textAlign = 'center'; g.fillText('PARIS — 1911', x + ww / 2, y + hh * 0.9);
    if (R() < 0.5) { g.fillStyle = '#d8ccb0'; g.beginPath(); g.moveTo(x + ww, y + hh); g.lineTo(x + ww - 40, y + hh); g.lineTo(x + ww, y + hh - 60); g.fill(); }
  });
  modulate(g, w, h, (u, v) => 0.92 + 0.1 * fbm(u, v, 4, 2, 3, 43));
}
// newsprint body text: greeked lines of small real words, justified into a column
const WORDS = { fr: 'le la les de du des un une et à au dans par pour sur avec Louvre tableau musée Joconde vol hier matin gardien salon carré cadre escalier police préfet enquête Léonard chef-d’œuvre disparu Paris public toile visiteurs lundi mardi galerie conservateur portrait célèbre'.split(' '),
  en: 'the a of in and to by for on with Louvre painting museum stolen yesterday morning guard salon frame stairway police prefect inquiry Leonardo masterpiece vanished Paris public canvas visitors Monday Tuesday gallery curator portrait famous'.split(' '),
  it: 'il la le di del della un una e a nel per su con Louvre quadro museo Gioconda furto ieri mattina custode sala cornice scala polizia prefetto inchiesta Leonardo capolavoro scomparso Parigi pubblico tela visitatori lunedì martedì galleria ritratto celebre'.split(' ') };
function textColumn(g, x, y, w, y1, lang, R, sz = 15) {
  const words = WORDS[lang] || WORDS.fr; g.font = `${sz}px "DejaVu Serif", serif`; g.fillStyle = '#2a2230'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  for (let yy = y; yy < y1; yy += sz * 1.28) {
    if (R() < 0.06) { g.font = `bold ${sz + 1}px "DejaVu Serif", serif`; const t = words[(R() * 10 + 10) | 0].toUpperCase(); g.fillText(t, x + (w - g.measureText(t).width) / 2, yy); g.font = `${sz}px "DejaVu Serif", serif`; continue; }
    const line = []; let lw = 0; const indent = R() < 0.12 ? sz * 1.2 : 0;
    while (true) { const wd = words[(R() * words.length) | 0], ww = g.measureText(wd).width; if (lw + ww + (line.length ? sz * 0.3 : 0) > w - indent) break; line.push([wd, ww]); lw += ww + (line.length > 1 ? sz * 0.3 : 0); }
    const gap = line.length > 1 ? (w - indent - line.reduce((a, c) => a + c[1], 0)) / (line.length - 1) : 0; let xx = x + indent;
    for (const [wd, ww] of line) { g.fillText(wd, xx, yy); xx += ww + gap; }
  }
}
// placeholder engraving portrait (used until a drawMona callback is supplied): a seated lady, hands folded, landscape behind
function portraitPlaceholder(g, w, h, colour) {
  const bgc = colour ? ['#4a5a3a', '#7a7a50', '#2a2a1c'] : ['#cfc6b2', '#a89e8a', '#5a5048'];
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, bgc[1]); gr.addColorStop(0.45, bgc[0]); gr.addColorStop(1, bgc[2]); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = colour ? 'rgba(40,50,30,0.5)' : 'rgba(60,50,50,0.45)'; g.lineWidth = Math.max(1, w / 160);
  for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(0, h * (0.28 + k * 0.05)); g.bezierCurveTo(w * 0.3, h * (0.22 + k * 0.06), w * 0.6, h * (0.34 + k * 0.04), w, h * (0.26 + k * 0.05)); g.stroke(); }
  const skin = colour ? '#d8b078' : '#e8dcc8', dress = colour ? '#2a2418' : '#4a4040', hair = colour ? '#2a1c12' : '#3a3030';
  g.fillStyle = dress; g.beginPath(); g.moveTo(w * 0.12, h); g.bezierCurveTo(w * 0.14, h * 0.62, w * 0.3, h * 0.5, w * 0.5, h * 0.5); g.bezierCurveTo(w * 0.7, h * 0.5, w * 0.86, h * 0.62, w * 0.88, h); g.fill();
  g.fillStyle = skin; g.beginPath(); g.moveTo(w * 0.38, h * 0.5); g.quadraticCurveTo(w * 0.5, h * 0.62, w * 0.62, h * 0.5); g.lineTo(w * 0.56, h * 0.44); g.lineTo(w * 0.44, h * 0.44); g.fill();
  g.fillStyle = hair; g.beginPath(); g.ellipse(w * 0.5, h * 0.32, w * 0.2, h * 0.17, 0, 0, 7); g.fill(); g.fillRect(w * 0.3, h * 0.3, w * 0.4, h * 0.22);
  g.fillStyle = skin; g.beginPath(); g.ellipse(w * 0.5, h * 0.33, w * 0.13, h * 0.13, 0, 0, 7); g.fill();
  g.fillStyle = hair; g.globalAlpha = 0.7; g.fillRect(w * 0.43, h * 0.31, w * 0.05, h * 0.01); g.fillRect(w * 0.52, h * 0.31, w * 0.05, h * 0.01); g.globalAlpha = 1;
  g.strokeStyle = hair; g.lineWidth = Math.max(1, w / 120); g.beginPath(); g.moveTo(w * 0.46, h * 0.4); g.quadraticCurveTo(w * 0.5, h * 0.415, w * 0.54, h * 0.4); g.stroke();
  g.fillStyle = skin; g.beginPath(); g.ellipse(w * 0.46, h * 0.8, w * 0.13, h * 0.05, -0.2, 0, 7); g.fill(); g.beginPath(); g.ellipse(w * 0.56, h * 0.82, w * 0.12, h * 0.045, 0.15, 0, 7); g.fill();
}
// draw the portrait (callback or placeholder) into a box. mono: printed newsprint look (ink tone on paper)
function drawPortrait(g, x, y, w, h, mono) {
  const c = document.createElement('canvas'); c.width = Math.max(8, w | 0); c.height = Math.max(8, h | 0); const q = c.getContext('2d', { willReadFrequently: true });
  try { if (monaFn) monaFn(q, c.width, c.height); else portraitPlaceholder(q, c.width, c.height, !mono); } catch (e) { portraitPlaceholder(q, c.width, c.height, !mono); }
  if (mono) { const im = q.getImageData(0, 0, c.width, c.height), d = im.data; const P0 = [242, 234, 218], I0 = [40, 30, 44];
    for (let i = 0; i < d.length; i += 4) { let L = (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255; L = Math.min(1, Math.max(0, (L - 0.08) * 1.25)); const px = (i / 4) % c.width, py = (i / 4 / c.width) | 0; const dot = ((px % 4) + (py % 4)) / 8 < L ? 1 : 0.86; L = L * 0.85 + 0.15 * dot * L; for (let k = 0; k < 3; k++) d[i + k] = I0[k] + (P0[k] - I0[k]) * L; }
    q.putImageData(im, 0, 0); }
  g.drawImage(c, x, y, w, h);
}
// headline fitted to a width (one or two lines), squeezed horizontally like a condensed grotesque
function fitHeadline(g, text, cx, y, w, hMax, font = '"DejaVu Sans", sans-serif') {
  let lines = [text]; g.font = `bold ${hMax | 0}px ${font}`;
  if (g.measureText(text).width > w * 1.35 && text.includes(' ')) { const words = text.split(' '); let best = null; for (let i = 1; i < words.length; i++) { const a = words.slice(0, i).join(' '), b = words.slice(i).join(' '); const m = Math.max(g.measureText(a).width, g.measureText(b).width); if (!best || m < best[0]) best = [m, [a, b]]; } lines = best[1]; }
  const sz = lines.length > 1 ? hMax * 0.6 : hMax; g.font = `bold ${sz | 0}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((ln, i) => { const tw = g.measureText(ln).width, sx = Math.min(0.92, w / tw); g.save(); g.translate(cx, y + (lines.length > 1 ? (i - 0.5) * sz * 0.98 : 0)); g.scale(sx, 1.0); g.fillText(ln, 0, 0); g.restore(); });
}
// ===== exported newspaper front-page painter =====
// o: { masthead, headline, sub, date, num, price, lang:'fr'|'en'|'it', caption, extra, seed, portrait:true|false, drawMona(g,w,h) }
export const HEADLINES = [
  { lang: 'fr', masthead: 'LE COURRIER DE PARIS', headline: 'LA JOCONDE VOLÉE !', sub: 'Le chef-d’œuvre de Léonard de Vinci a disparu du Louvre', date: 'MERCREDI 23 AOÛT 1911', num: 'N° 12.743', price: '5 CENTIMES', caption: 'LA JOCONDE — Musée du Louvre', extra: 'ÉDITION SPÉCIALE' },
  { lang: 'en', masthead: 'THE PARIS EVENING STAR', headline: 'MONA LISA STOLEN!', sub: 'Leonardo’s masterpiece vanishes from the Louvre', date: 'WEDNESDAY, AUGUST 23, 1911', num: 'No. 8,112', price: 'FIVE CENTIMES', caption: '“MONA LISA” by Leonardo da Vinci', extra: 'LATEST EDITION' },
  { lang: 'fr', masthead: 'LE PETIT ÉCHO', headline: 'OÙ EST LA JOCONDE ?', sub: 'Le Louvre fermé — la police interroge les gardiens', date: 'JEUDI 24 AOÛT 1911', num: 'N° 3.209', price: '5 CENTIMES', caption: 'Le tableau disparu', extra: '' },
  { lang: 'it', masthead: 'LA VOCE ITALIANA', headline: 'LA GIOCONDA RUBATA!', sub: 'Il capolavoro di Leonardo scomparso dal Louvre', date: 'MERCOLEDÌ 23 AGOSTO 1911', num: 'N. 231', price: 'CENT. 5', caption: 'La Gioconda di Leonardo', extra: '' },
];
export function paintNewspaper(g, w, h, o = {}) {
  o = { ...HEADLINES[0], ...o }; const R = rng(o.seed || (o.headline || '').length * 31 + 7), m = w * 0.04, ink = '#231a2a';
  PT.paper(g, w, h, { seed: o.seed || 11, base: '#efe6d2' });
  g.fillStyle = ink; g.textBaseline = 'middle';
  // ear line: number, date, price
  g.font = `${h * 0.016 | 0}px "DejaVu Serif", serif`; g.textAlign = 'left'; g.fillText(o.num || '', m, h * 0.025); g.textAlign = 'right'; g.fillText(o.price || '', w - m, h * 0.025); g.textAlign = 'center'; g.fillText(o.date || '', w / 2, h * 0.025);
  const rule = (y, t = 2) => g.fillRect(m, y, w - 2 * m, t);
  rule(h * 0.04, 2);
  // masthead
  g.font = `bold ${h * 0.085 | 0}px "DejaVu Serif", serif`; { const tw = g.measureText(o.masthead).width, sx = Math.min(1, (w - 2 * m) / tw); g.save(); g.translate(w / 2, h * 0.098); g.scale(sx, 1); g.fillText(o.masthead, 0, 0); g.restore(); }
  rule(h * 0.148, 4); rule(h * 0.156, 1.5);
  if (o.extra) { g.font = `italic bold ${h * 0.02 | 0}px "DejaVu Serif", serif`; g.fillText(o.extra, w / 2, h * 0.172); }
  // the headline
  g.fillStyle = '#1a1220'; fitHeadline(g, o.headline, w / 2, h * 0.262, w - 2 * m, h * 0.14);
  g.fillStyle = ink; g.font = `italic ${h * 0.026 | 0}px "DejaVu Serif", serif`; { const tw = g.measureText(o.sub).width, sx = Math.min(1, (w - 2 * m) / tw); g.save(); g.translate(w / 2, h * 0.345); g.scale(sx, 1); g.fillText(o.sub, 0, 0); g.restore(); }
  rule(h * 0.365, 2);
  // portrait slot (left) + caption
  const px = m, py = h * 0.38, pw = w * 0.42, ph = h * 0.36;
  if (o.portrait !== false) { g.fillStyle = ink; g.fillRect(px - 3, py - 3, pw + 6, ph + 6); g.fillStyle = '#efe6d2'; g.fillRect(px, py, pw, ph); drawPortrait(g, px + 6, py + 6, pw - 12, ph - 12, true);
    g.fillStyle = ink; g.font = `italic ${h * 0.017 | 0}px "DejaVu Serif", serif`; g.textAlign = 'center'; g.fillText(o.caption || '', px + pw / 2, py + ph + h * 0.016); }
  // columns
  const c0 = o.portrait !== false ? px + pw + m * 0.8 : m, sz = Math.max(9, h * 0.0125);
  g.fillRect(c0 - m * 0.4, py, 1.5, h * 0.95 - py);
  textColumn(g, c0, py + sz, (w - m - c0) / 2 - m * 0.3, h * 0.95, o.lang, R, sz); g.fillRect(c0 + (w - m - c0) / 2 - 1, py, 1.5, h * 0.95 - py);
  textColumn(g, c0 + (w - m - c0) / 2 + m * 0.3, py + sz, (w - m - c0) / 2 - m * 0.3, h * 0.95, o.lang, R, sz);
  if (o.portrait !== false) { const y0 = py + ph + h * 0.035; g.fillRect(m, y0 - sz, pw, 1.5); textColumn(g, m, y0 + sz * 0.5, pw / 2 - m * 0.3, h * 0.95, o.lang, R, sz); textColumn(g, m + pw / 2 + m * 0.3, y0 + sz * 0.5, pw / 2 - m * 0.3, h * 0.95, o.lang, R, sz); }
  rule(h * 0.955, 1.5);
  // fold crease, ink wear, foxing
  g.fillStyle = 'rgba(120,96,70,0.16)'; g.fillRect(0, h / 2 - 1, w, 3); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(0, h / 2 + 2, w, 2);
  for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(150,110,60,${0.05 + R() * 0.06})`; g.beginPath(); g.arc(R() * w, R() * h, 4 + R() * 14, 0, 7); g.fill(); }
  modulate(g, w, h, (u, v) => { const e = Math.min(u, 1 - u, v, 1 - v); return [1 - 0.08 * (1 - Math.min(1, e * 12)), 1 - 0.1 * (1 - Math.min(1, e * 12)), 1 - 0.16 * (1 - Math.min(1, e * 12))]; });
}
// enamel street plaque (Paris blue)
function plaqueTex(g, w, h, a, b) {
  g.fillStyle = '#e8e6e0'; g.beginPath(); g.roundRect(0, 0, w, h, h * 0.12); g.fill(); g.fillStyle = '#1f3a78'; g.beginPath(); g.roundRect(h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12, h * 0.1); g.fill();
  g.strokeStyle = '#e8e6e0'; g.lineWidth = h * 0.025; g.beginPath(); g.roundRect(h * 0.12, h * 0.12, w - h * 0.24, h - h * 0.24, h * 0.06); g.stroke();
  g.fillStyle = '#f2f0ea'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `bold ${h * 0.16 | 0}px "DejaVu Sans", sans-serif`; g.fillText(a, w / 2, h * 0.3);
  g.font = `bold ${h * 0.34 | 0}px "DejaVu Sans", sans-serif`; const tw = g.measureText(b).width, sx = Math.min(1, w * 0.84 / tw); g.save(); g.translate(w / 2, h * 0.62); g.scale(sx, 1); g.fillText(b, 0, 0); g.restore();
}
// attic wallpaper: faded stripes with sprigs, water stains, a torn patch showing plaster
function atticPaper(g, w, h) {
  const R = rng(51), bg = hex('#c9b48e'); g.fillStyle = css(bg); g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += w / 8) { g.fillStyle = css(shade(bg, 0.86), 0.7); g.fillRect(x, 0, w / 32, h); g.fillStyle = css(shade(bg, 0.92), 0.5); g.fillRect(x + w / 16, 0, 3, h); }
  for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const x = (i + 0.75) * w / 8, y = (j + 0.5 + (i % 2) * 0.5) * h / 8; g.fillStyle = css('#9a6a5a', 0.55); g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); g.strokeStyle = css('#7a8a5a', 0.55); g.lineWidth = 2; g.beginPath(); g.moveTo(x, y + 5); g.quadraticCurveTo(x + 6, y + 14, x + 2, y + 20); g.stroke(); g.fillStyle = css('#7a8a5a', 0.5); g.beginPath(); g.ellipse(x + 6, y + 13, 4, 2, 0.6, 0, 7); g.fill(); }
  for (let i = 0; i < 3; i++) { const x = R() * w, y = R() * h * 0.5, r = 40 + R() * 60; const gr = g.createRadialGradient(x, y, r * 0.2, x, y, r); gr.addColorStop(0, 'rgba(140,100,50,0.0)'); gr.addColorStop(0.8, 'rgba(140,100,50,0.18)'); gr.addColorStop(1, 'rgba(110,70,30,0.0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  { const x = w * 0.62, y = h * 0.68; g.fillStyle = '#ddd2bc'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 70, y - 10); g.lineTo(x + 90, y + 30); g.lineTo(x + 40, y + 60); g.lineTo(x - 10, y + 40); g.fill(); g.strokeStyle = css(shade(bg, 0.55), 0.8); g.lineWidth = 2; g.stroke(); }
  modulate(g, w, h, (u, v) => 0.88 + 0.16 * fbm(u, v, 3, 3, 3, 53));
}
// plaster ceiling / walls: cream, hairline cracks, damp stain
function plaster(g, w, h, o = {}) {
  const R = rng(o.seed || 57), bg = hex(o.base || '#e2d6bc'); g.fillStyle = css(bg); g.fillRect(0, 0, w, h);
  for (let i = 0; i < (o.cracks ?? 5); i++) { g.strokeStyle = css(shade(bg, 0.6), 0.5); g.lineWidth = 1.3; let x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 10; k++) { x += (R() - 0.5) * 30; y += R() * 14; g.lineTo(x, y); } g.stroke(); }
  if (o.stain !== false) { const x = w * 0.3, y = h * 0.4, r = w * 0.18; const gr = g.createRadialGradient(x, y, r * 0.3, x, y, r); gr.addColorStop(0, 'rgba(160,120,60,0.05)'); gr.addColorStop(0.85, 'rgba(150,110,50,0.22)'); gr.addColorStop(1, 'rgba(150,110,50,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  modulate(g, w, h, (u, v) => 0.92 + 0.12 * fbm(u, v, 3, 3, 3, (o.seed || 57) + 1));
}
// mattress ticking stripes
function ticking(g, w, h) { g.fillStyle = '#e4dccb'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += w / 12) { g.fillStyle = '#5a6a8a'; g.fillRect(x, 0, w / 48, h); g.fillRect(x + w / 32, 0, w / 96, h); } modulate(g, w, h, (u, v) => 0.92 + 0.1 * fbm(u, v, 3, 3, 2, 61)); }
// grey wool blanket with a red border stripe
function blanket(g, w, h) { const R = rng(63); g.fillStyle = '#6e6a72'; g.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { g.fillStyle = R() < 0.5 ? 'rgba(40,36,50,0.12)' : 'rgba(200,196,210,0.1)'; g.fillRect(R() * w, R() * h, 3, 1); } for (const y of [h * 0.08, h * 0.13]) { g.fillStyle = '#8a3030'; g.fillRect(0, y, w, h * 0.025); } modulate(g, w, h, (u, v) => 0.9 + 0.14 * Math.sin(u * 18 + Math.sin(v * 6) * 2) * 0.5); }
// trunk lining paper (small floral print)
function liningTex(g, w, h) { g.fillStyle = '#d8c9a2'; g.fillRect(0, 0, w, h); for (let y = 8; y < h; y += 22) for (let x = 8 + (y / 22 % 2) * 11; x < w; x += 22) { g.fillStyle = '#7a5a6a'; g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); g.fillStyle = '#6a7a50'; g.fillRect(x + 3, y - 1, 5, 2); } modulate(g, w, h, (u, v) => 0.86 + 0.16 * fbm(u, v, 3, 3, 3, 65)); }
// rag rug
function ragRug(g, w, h) { const R = rng(67); const C = ['#7a4a3a', '#5a6a7a', '#a88a5a', '#6a5a6a', '#8a7a5a']; for (let y = 0; y < h; y += 10) { g.fillStyle = C[(R() * C.length) | 0]; g.fillRect(0, y, w, 10); for (let x = 0; x < w; x += 8) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x, y + 2, 3, 6); } } modulate(g, w, h, (u, v) => { const e = Math.min(u, 1 - u, v, 1 - v); return 0.86 + 0.14 * Math.min(1, e * 20); }); }
// cotto (terracotta floor tiles), Florence
function cotto(g, w, h) { const R = rng(71), n = 4, s = w / n; g.fillStyle = '#7a4a34'; g.fillRect(0, 0, w, h); for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const c = vary([176, 98, 66], (R() - 0.5) * 0.22); g.fillStyle = css(c); g.fillRect(i * s + 3, j * s + 3, s - 6, s - 6); g.fillStyle = css(tint(c, 1.15), 0.5); g.fillRect(i * s + 3, j * s + 3, s - 6, 3); g.fillStyle = css(shade(c, 0.8), 0.4); g.beginPath(); g.ellipse(i * s + s * R(), j * s + s * R(), 8 + R() * 14, 5 + R() * 8, R() * 3, 0, 7); g.fill(); } modulate(g, w, h, (u, v) => 0.9 + 0.14 * fbm(u, v, 3, 3, 3, 73)); }
// dark walnut raised-panel wainscot (texture = one 1 m panel bay)
function wainscot(g, w, h, o = {}) {
  const base = hex(o.base || '#5a3624'); PT.planks(g, w, h, { base: css(base), n: 3, joints: 0, nails: false, knots: false, seed: 77, scratches: 2 });
  const m = w * 0.12; g.fillStyle = css(shade(base, 0.6)); g.fillRect(m - 6, m - 6, w - 2 * m + 12, h - 2 * m + 12); g.fillStyle = css(tint(base, 1.12)); g.fillRect(m, m, w - 2 * m, h - 2 * m);
  const gr = g.createLinearGradient(m, m, w - m, h - m); gr.addColorStop(0, 'rgba(255,230,190,0.18)'); gr.addColorStop(1, 'rgba(0,0,0,0.2)'); g.fillStyle = gr; g.fillRect(m + 14, m + 14, w - 2 * m - 28, h - 2 * m - 28);
  g.strokeStyle = css(shade(base, 0.5), 0.9); g.lineWidth = 3; g.strokeRect(m + 14, m + 14, w - 2 * m - 28, h - 2 * m - 28);
  if (o.gilt) { g.strokeStyle = '#c8a050'; g.lineWidth = 2; g.strokeRect(m + 22, m + 22, w - 2 * m - 44, h - 2 * m - 44); }
}
// small "old master" style painting: landscape / madonna / still life / portrait; aged varnish + craquelure
function oldPainting(g, w, h, kind, seed = 1) {
  const R = rng(seed * 17 + 3); const sky = g.createLinearGradient(0, 0, 0, h);
  if (kind === 0) { sky.addColorStop(0, '#8aa0a8'); sky.addColorStop(0.5, '#d8c8a0'); sky.addColorStop(1, '#5a5a3a'); g.fillStyle = sky; g.fillRect(0, 0, w, h); for (let k = 0; k < 3; k++) { g.fillStyle = ['#6a7a5a', '#4a5a3a', '#3a3a24'][k]; g.beginPath(); g.moveTo(0, h * (0.5 + k * 0.12)); for (let x = 0; x <= w; x += w / 8) g.lineTo(x, h * (0.48 + k * 0.12) - R() * h * 0.08); g.lineTo(w, h); g.lineTo(0, h); g.fill(); } g.fillStyle = '#2a2a1a'; g.fillRect(w * 0.7, h * 0.3, w * 0.03, h * 0.4); g.beginPath(); g.ellipse(w * 0.715, h * 0.28, w * 0.1, h * 0.12, 0, 0, 7); g.fill(); g.fillStyle = '#c8b890'; for (let k = 0; k < 4; k++) g.fillRect(w * (0.2 + k * 0.04), h * 0.55, w * 0.03, h * 0.04); }
  else if (kind === 1) { g.fillStyle = '#2a1e18'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(220,170,60,0.85)'; g.beginPath(); g.arc(w / 2, h * 0.3, w * 0.17, 0, 7); g.fill(); g.fillStyle = '#d8b088'; g.beginPath(); g.ellipse(w / 2, h * 0.32, w * 0.1, h * 0.09, 0, 0, 7); g.fill(); g.fillStyle = '#2a4a8a'; g.beginPath(); g.moveTo(w * 0.5, h * 0.24); g.bezierCurveTo(w * 0.2, h * 0.3, w * 0.12, h * 0.8, w * 0.15, h); g.lineTo(w * 0.85, h); g.bezierCurveTo(w * 0.88, h * 0.8, w * 0.8, h * 0.3, w * 0.5, h * 0.24); g.fill(); g.fillStyle = '#a83a2a'; g.fillRect(w * 0.4, h * 0.45, w * 0.2, h * 0.3); }
  else if (kind === 2) { g.fillStyle = '#1e1a14'; g.fillRect(0, 0, w, h); g.fillStyle = '#4a3020'; g.fillRect(0, h * 0.65, w, h * 0.35); for (let k = 0; k < 5; k++) { g.fillStyle = ['#c8402a', '#d8a030', '#6a8a3a', '#8a2a5a', '#e8c070'][k]; g.beginPath(); g.arc(w * (0.25 + k * 0.12), h * (0.6 - (k % 2) * 0.05), w * 0.07, 0, 7); g.fill(); } g.fillStyle = '#8a8a90'; g.beginPath(); g.ellipse(w * 0.7, h * 0.45, w * 0.08, h * 0.2, 0, 0, 7); g.fill(); }
  else { g.fillStyle = '#20241a'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1210'; g.beginPath(); g.moveTo(w * 0.15, h); g.quadraticCurveTo(w * 0.5, h * 0.45, w * 0.85, h); g.fill(); g.fillStyle = '#d0a880'; g.beginPath(); g.ellipse(w * 0.5, h * 0.42, w * 0.15, h * 0.15, 0, 0, 7); g.fill(); g.fillStyle = '#7a2a20'; g.beginPath(); g.ellipse(w * 0.5, h * 0.3, w * 0.17, h * 0.08, 0, Math.PI, 0); g.fill(); }
  g.fillStyle = 'rgba(200,150,40,0.16)'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(30,20,10,0.25)'; g.lineWidth = 1; for (let i = 0; i < 30; i++) { let x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (R() - 0.5) * 18; y += (R() - 0.5) * 18; g.lineTo(x, y); } g.stroke(); }
  modulate(g, w, h, (u, v) => { const e = Math.min(u, 1 - u, v, 1 - v); return 0.7 + 0.3 * Math.min(1, e * 6); });
}
// majolica plate (blue / ochre on white tin glaze), oriental rug, globe map
function majolica(g, w, h, seed) { const R = rng(seed); g.fillStyle = '#efe6cf'; g.fillRect(0, 0, w, h); const c = w / 2; g.strokeStyle = '#2a4a9a'; g.lineWidth = w * 0.04; g.beginPath(); g.arc(c, c, w * 0.44, 0, 7); g.stroke(); g.strokeStyle = '#d89a30'; g.lineWidth = w * 0.025; g.beginPath(); g.arc(c, c, w * 0.36, 0, 7); g.stroke(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + seed; g.fillStyle = k % 2 ? '#2a4a9a' : '#3a7a5a'; g.beginPath(); g.ellipse(c + Math.cos(a) * w * 0.24, c + Math.sin(a) * w * 0.24, w * 0.07, w * 0.03, a, 0, 7); g.fill(); } g.fillStyle = '#d89a30'; g.beginPath(); g.arc(c, c, w * 0.11, 0, 7); g.fill(); g.fillStyle = '#2a4a9a'; g.beginPath(); g.arc(c, c, w * 0.05 + R() * w * 0.02, 0, 7); g.fill(); }
function orientRug(g, w, h) { g.fillStyle = '#7a1e22'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1e2a4a'; g.lineWidth = w * 0.05; g.strokeRect(w * 0.06, h * 0.06, w * 0.88, h * 0.88); g.strokeStyle = '#d8b060'; g.lineWidth = w * 0.012; g.strokeRect(w * 0.12, h * 0.12, w * 0.76, h * 0.76); for (let y = h * 0.2; y < h * 0.85; y += h * 0.16) for (let x = w * 0.22; x < w * 0.82; x += w * 0.2) { g.fillStyle = '#e8d0a0'; g.beginPath(); g.moveTo(x, y - 18); g.lineTo(x + 16, y); g.lineTo(x, y + 18); g.lineTo(x - 16, y); g.fill(); g.fillStyle = '#1e2a4a'; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); } g.fillStyle = '#e8dcc0'; for (let x = 0; x < w; x += 6) { g.fillRect(x, 0, 2, h * 0.025); g.fillRect(x, h * 0.975, 2, h * 0.025); } modulate(g, w, h, (u, v) => 0.85 + 0.2 * fbm(u, v, 3, 3, 3, 79)); }
function globeTex(g, w, h) { g.fillStyle = '#d8c89a'; g.fillRect(0, 0, w, h); const R = rng(83); g.fillStyle = '#a8803a'; for (let i = 0; i < 7; i++) { const x = R() * w, y = h * (0.2 + R() * 0.6); g.beginPath(); for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, r = (30 + R() * 30) * (1 + i % 3 * 0.4); g.lineTo(x + Math.cos(a) * r * 1.4, y + Math.sin(a) * r); } g.fill(); } g.strokeStyle = 'rgba(80,50,20,0.5)'; g.lineWidth = 1.5; for (let x = 0; x < w; x += w / 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += h / 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } modulate(g, w, h, (u, v) => 0.85 + 0.2 * fbm(u, v, 3, 3, 3, 85)); }
function booksTex(g, w, h) { const R = rng(89); let x = 0; while (x < w) { const bw = 10 + R() * 18, c = vary(['#6a2a22', '#2a3a5a', '#4a5a2a', '#7a5a2a', '#3a2a22'][(R() * 5) | 0], (R() - 0.5) * 0.3); g.fillStyle = css(c); g.fillRect(x, h * (0.05 + R() * 0.12), bw - 1, h); g.fillStyle = '#c8a050'; g.fillRect(x + 2, h * 0.3, bw - 5, 3); g.fillRect(x + 2, h * 0.8, bw - 5, 3); x += bw; } }
// gilt lettering on glass (alpha), readable from the -z (street) side
function glassLetters(g, w, h, text, sub) {
  g.clearRect(0, 0, w, h); g.save(); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `bold ${h * 0.44 | 0}px "DejaVu Serif", serif`; const tw = g.measureText(text).width, sx = Math.min(1, w * 0.9 / tw);
  g.save(); g.translate(w / 2, h * 0.36); g.scale(sx, 1); g.lineWidth = h * 0.04; g.strokeStyle = '#2a1608'; g.strokeText(text, 0, 0); const lg = g.createLinearGradient(0, -h * 0.2, 0, h * 0.2); lg.addColorStop(0, '#fff0b0'); lg.addColorStop(0.5, '#e0b050'); lg.addColorStop(1, '#a87020'); g.fillStyle = lg; g.fillText(text, 0, 0); g.restore();
  if (sub) { g.font = `italic bold ${h * 0.17 | 0}px "DejaVu Serif", serif`; g.lineWidth = h * 0.025; g.strokeStyle = '#2a1608'; g.strokeText(sub, w / 2, h * 0.78); g.fillStyle = '#e8c060'; g.fillText(sub, w / 2, h * 0.78); }
  g.restore();
}
// Florentine stone (pietra forte): warm brown rusticated blocks
function pietraForte(g, w, h) { ashlar(g, w, h, { base: '#b8946a', seed: 91, rows: 4, cols: 2 }); }
function pietraSerena(g, w, h) { ashlar(g, w, h, { base: '#8a8c84', seed: 93, rows: 2, cols: 1 }); }
function intonaco(g, w, h) { plaster(g, w, h, { base: '#d8b07a', seed: 95, cracks: 3, stain: false }); }

// ---------------------------------------------------------------- materials
let M = null;
function materials() {
  const vc = (o = {}) => toon({ vertexColors: true, ...o });
  const T = (w, h, fn, rep) => mkTex(w, h, fn, rep);
  const m = {};
  m.paint = vc(); m.gold = toon({ color: 0xd8a848, emissive: 0x2a1a00 }); m.iron = vc();
  m.stone = vc({ map: T(512, 512, (g, w, h) => ashlar(g, w, h)) });
  m.stone2 = vc({ map: T(512, 512, (g, w, h) => ashlar(g, w, h, { base: '#e2cfae', seed: 5 })) });
  m.rustic = vc({ map: T(512, 512, (g, w, h) => rustic(g, w, h)) });
  m.zinc = vc({ map: T(512, 512, (g, w, h) => zinc(g, w, h)) });
  m.setts = vc({ map: T(1024, 1024, (g, w, h) => setts(g, w, h, { rows: 24, cols: 12 })) }); if (macro) macro(m.setts, 0.16, 0.05);
  m.walk = vc({ map: T(512, 512, (g, w, h) => asphaltWalk(g, w, h)) }); if (macro) macro(m.walk, 0.1, 0.08);
  m.kerb = vc({ map: T(256, 256, (g, w, h) => ashlar(g, w, h, { base: '#a8a49c', rows: 1, cols: 1, seed: 21 })) });
  m.win = [0, 1, 3, 0, 1].map((v, i) => vc({ map: T(256, 512, (g, w, h) => windowTex(g, w, h, v, i + 1)) }));
  m.winLit = toon({ vertexColors: true, map: T(256, 512, (g, w, h) => windowTex(g, w, h, 2, 9)), emissive: 0xffffff, emissiveMap: null });
  m.winLit.emissiveMap = m.winLit.map; m.winLit.emissive = new THREE.Color(0.9, 0.75, 0.55);
  m.rail = toon({ map: T(512, 512, railTex), alphaTest: 0.5, side: THREE.DoubleSide });
  m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a3a', n: 6, seed: 33 })) });
  m.woodDark = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#5a3a28', n: 6, seed: 35, joints: 0 })) });
  m.glowWarm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc477).multiplyScalar(3.0), fog: false });
  m.glowSoft = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd9a0).multiplyScalar(1.6), fog: false });
  m.flame = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb050).multiplyScalar(4.0), fog: false });
  m.glassFx = new THREE.MeshBasicMaterial({ color: 0xbfd0ff, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  m.cloth = vc({ side: THREE.DoubleSide });
  m.fabric = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#f0ece2', folds: 3 })), side: THREE.DoubleSide });
  m.paper = vc({ map: T(256, 256, (g, w, h) => PT.paper(g, w, h, { base: '#efe6d2' })) });
  m.marble = vc({ map: T(256, 256, (g, w, h) => plaster(g, w, h, { base: '#ece6da', cracks: 2, stain: false, seed: 99 })) });
  return m;
}
const signCache = new Map();
const fasciaMat = (text, bg, fg, o = {}) => { const k = text + bg + fg + JSON.stringify(o); if (!signCache.has(k)) signCache.set(k, toon({ map: mkTex(1024, 160, (g, w, h) => fasciaTex(g, w, h, text, bg, fg, o)) })); return signCache.get(k); };
const shopWinCache = new Map();
const shopWinMat = (kind, glass) => { const k = kind + (glass || ''); if (!shopWinCache.has(k)) { const t = mkTex(512, 512, (g, w, h) => shopWinTex(g, w, h, kind, { glass })); const mt = toon({ map: t }); if (kind === 'cafe') { mt.emissiveMap = t; mt.emissive = new THREE.Color(0.75, 0.55, 0.35); } shopWinCache.set(k, mt); } return shopWinCache.get(k); };

// ================================================================= STREET (Paris, 1911)
const FL = { g: 4.6, f1: 7.9, f2: 11.2, f3: 14.3, top: 17.2 };
const LAMPS = []; // street lamp mantle positions (local street coords)
// one Haussmann window with stone surround, sill, hood / pediment and optional balconette
function hWindow(K, cx, y0, w, h, o) {
  const st = o.tint ?? 0xffffff, sm = o.sm || M.stone2;
  K.put(o.mat, plane(w, h), cx, y0 + h / 2, 0.012);
  K.box(M.paint, cx - w / 2 - 0.02, cx + w / 2 + 0.02, y0 - 0.02, y0 + 0.02, 0.0, 0.05, 0x3a3040, 0.005);
  for (const sd of [-1, 1]) K.box(sm, cx + sd * (w / 2) - (sd > 0 ? 0 : 0.17), cx + sd * (w / 2) + (sd > 0 ? 0.17 : 0), y0, y0 + h + 0.17, 0, 0.09, st, 0.015, 1);
  K.box(sm, cx - w / 2 - 0.17, cx + w / 2 + 0.17, y0 + h, y0 + h + 0.17, 0, 0.09, st, 0.015, 1);
  K.box(sm, cx - 0.1, cx + 0.1, y0 + h - 0.06, y0 + h + 0.24, 0, 0.13, st, 0.015, 1); // keystone
  K.box(sm, cx - w / 2 - 0.26, cx + w / 2 + 0.26, y0 - 0.12, y0, 0, 0.18, st, 0.02, 1); // sill
  if (o.hood) { const yh = y0 + h + 0.19; K.box(sm, cx - w / 2 - 0.34, cx + w / 2 + 0.34, yh, yh + 0.12, 0, 0.24, st, 0.02, 1); K.box(sm, cx - w / 2 - 0.3, cx + w / 2 + 0.3, yh + 0.12, yh + 0.18, 0, 0.18, st, 0.01, 1);
    for (const sd of [-1, 1]) { K.box(sm, cx + sd * (w / 2 + 0.22) - 0.07, cx + sd * (w / 2 + 0.22) + 0.07, yh - 0.42, yh, 0, 0.16, st, 0.02, 1); K.box(sm, cx + sd * (w / 2 + 0.22) - 0.05, cx + sd * (w / 2 + 0.22) + 0.05, yh - 0.55, yh - 0.42, 0, 0.1, st, 0.02, 1); }
    if (o.hood === 'ped') K.put(sm, prism(w + 0.7, 0.42, 0.2), cx, yh + 0.18, 0.0, 0, 0, 0, 1, 1, 1, st); }
  if (o.rail) { K.put(M.rail, uvPlane(w + 0.24, 0.9, 1.2, 1.0), cx, y0 + 0.47, 0.2); K.box(M.iron, cx - w / 2 - 0.12, cx + w / 2 + 0.12, y0 + 0.9, y0 + 0.94, 0.17, 0.23, 0x1d1a24, 0.01); }
}
// continuous balcony: stone slab on consoles + iron railing along the front and returns
function hBalcony(K, x0, x1, y, dep, nb, bw, st) {
  K.box(M.stone2, x0 + 0.05, x1 - 0.05, y - 0.2, y, 0, dep, st, 0.03, 1); K.box(M.stone2, x0 + 0.1, x1 - 0.1, y - 0.28, y - 0.2, 0, dep - 0.08, st, 0.02, 1);
  for (let i = 0; i <= nb; i++) { const x = x0 + Math.min(Math.max(i * bw, 0.25), x1 - x0 - 0.25); K.put(M.stone2, profGeo('cons' + dep, [[0, 0], [dep * 0.85, 0], [dep * 0.85, -0.14], [dep * 0.3, -0.4], [0, -0.62]], 0.2, 0.015), x, y - 0.28, 0, 0, 0, 0, 1, 1, 1, st); }
  K.put(M.rail, uvPlane(x1 - x0 - 0.2, 1.0, 1.2, 1.0), (x0 + x1) / 2, y + 0.5, dep - 0.06);
  for (const x of [x0 + 0.12, x1 - 0.12]) K.put(M.rail, uvPlane(dep - 0.1, 1.0, 1.2, 1.0), x, y + 0.5, dep / 2, 0, Math.PI / 2, 0);
  K.box(M.iron, x0 + 0.08, x1 - 0.08, y + 1.0, y + 1.06, dep - 0.1, dep - 0.02, 0x1d1a24, 0.015);
}
function chimneyStack(K, x, z, h0, h1, n = 5) {
  K.box(M.stone2, x - 0.38, x + 0.38, h0, h1, z - 1.3, z + 1.3, 0xf0d8c8, 0.03, 1);
  K.box(M.stone2, x - 0.45, x + 0.45, h1, h1 + 0.12, z - 1.37, z + 1.37, 0xe8d0c0, 0.03, 1);
  for (let i = 0; i < n; i++) { const zz = z - 1.1 + i * 2.2 / (n - 1), hh = 0.38 + ((i * 37) % 5) * 0.04; K.put(M.paint, cyl(0.1, 0.12, hh, 10), x, h1 + 0.12 + hh / 2, zz, 0, 0, 0, 1, 1, 1, 0xc0643a); K.put(M.paint, cyl(0.075, 0.075, 0.02, 10), x, h1 + 0.12 + hh + 0.01, zz, 0, 0, 0, 1, 1, 1, 0x2a1a1a); }
}
// shopfront (devanture) across x0..x1: riser, glazing (interior texture), door, fascia sign, pilasters, cornice
function devanture(K, x0, x1, s) {
  const c = s.col, dz = 0.3, cd = new THREE.Color(c).multiplyScalar(0.7), W = x1 - x0, cx = (x0 + x1) / 2;
  K.box(M.paint, x0, x1, 0.12, 0.7, -0.02, dz - 0.1, c, 0.02);
  const doorW = s.door === false ? 0 : 1.0, doorX = s.doorAt ?? cx;
  const segs = doorW ? [[x0 + 0.22, doorX - doorW / 2 - 0.06], [doorX + doorW / 2 + 0.06, x1 - 0.22]] : [[x0 + 0.22, x1 - 0.22]];
  for (const [a, b] of segs) { if (b - a < 0.2) continue; const ww = b - a; K.put(shopWinMat(s.kind, s.glass), plane(ww, 2.45), (a + b) / 2, 1.97, dz - 0.14);
    K.box(M.paint, a + 0.08, b - 0.08, 0.22, 0.6, dz - 0.1, dz - 0.07, cd, 0.01);
    const nm = Math.max(1, Math.round(ww / 1.0)); for (let k = 1; k < nm; k++) K.box(M.paint, a + k * ww / nm - 0.03, a + k * ww / nm + 0.03, 0.72, 3.2, dz - 0.16, dz - 0.08, c, 0.01); }
  if (doorW) { K.box(M.paint, doorX - doorW / 2, doorX + doorW / 2, 0.15, 3.0, -0.05, 0.05, cd, 0.02); K.put(shopWinMat(s.kind), plane(doorW - 0.3, 1.5), doorX, 2.05, 0.06); K.box(M.paint, doorX - doorW / 2 + 0.12, doorX + doorW / 2 - 0.12, 0.35, 1.15, 0.05, 0.08, c, 0.01); K.put(M.gold, sph(0.035, 8, 6), doorX + doorW / 2 - 0.15, 1.25, 0.1); }
  K.box(M.paint, x0, x1, 3.18, 3.3, -0.02, dz - 0.04, c, 0.015);
  K.box(M.paint, x0 - 0.06, x1 + 0.06, 3.3, 4.06, -0.02, dz + 0.02, c, 0.02);
  K.put(fasciaMat(s.sign, s.signBg || '#' + new THREE.Color(c).getHexString(), s.fg || '#e8c46a', s.so || {}), plane(W - 0.3, 0.62), cx, 3.68, dz + 0.026);
  K.box(M.paint, x0 - 0.14, x1 + 0.14, 4.06, 4.2, -0.02, dz + 0.16, cd, 0.02); K.box(M.gold, x0 - 0.1, x1 + 0.1, 4.0, 4.04, dz + 0.02, dz + 0.06, 0xd8a848, 0.008);
  for (const x of [x0, x1]) { K.box(M.paint, x - 0.13, x + 0.13, 0.12, 3.3, -0.02, dz + 0.04, c, 0.02); K.box(M.paint, x - 0.17, x + 0.17, 0.12, 0.42, -0.02, dz + 0.08, cd, 0.02); K.put(M.paint, profGeo('capi', [[0, 0], [0.28, 0], [0.32, -0.12], [0.1, -0.5], [0, -0.55]], 0.24, 0.015), x, 4.06, -0.02, 0, 0, 0, 1, 1, 1, c); K.box(M.gold, x - 0.035, x + 0.035, 0.6, 3.0, dz + 0.04, dz + 0.06, 0xd8a848, 0.005); }
}
// porte cochère: carriage doorway with a stone arch and panelled double doors
function porteCochere(K, cx, col = 0x2e4434) {
  const w = 2.3, h = 3.6; K.box(M.paint, cx - w / 2, cx + w / 2, 0.12, h, -0.18, -0.08, col, 0.02);
  for (const sd of [-1, 1]) { for (let k = 0; k < 3; k++) K.box(M.paint, cx + sd * w / 4 - 0.4, cx + sd * w / 4 + 0.4, 0.4 + k * 1.05, 1.25 + k * 1.05, -0.08, -0.04, new THREE.Color(col).multiplyScalar(1.25), 0.02); K.put(M.gold, sph(0.05, 8, 6), cx + sd * 0.12, 1.3, -0.03); }
  K.box(M.paint, cx - 0.025, cx + 0.025, 0.12, h, -0.08, -0.03, 0x1a2a1e, 0.005);
  K.put(M.stone2, cyl(w / 2 + 0.25, w / 2 + 0.25, 0.14, 24, false, -Math.PI / 2, Math.PI), cx, h, 0.02, Math.PI / 2, 0, 0, 1, 1, 1, 0xffffff);
  K.put(M.paint, cyl(w / 2, w / 2, 0.1, 24, false, -Math.PI / 2, Math.PI), cx, h, -0.1, Math.PI / 2, 0, 0, 1, 1, 1, 0x3a3040);
  K.box(M.stone2, cx - 0.16, cx + 0.16, h + w / 2 - 0.05, h + w / 2 + 0.3, 0, 0.18, 0xffffff, 0.02, 1);
  for (const sd of [-1, 1]) K.box(M.stone2, cx + sd * (w / 2 + 0.12) - 0.14, cx + sd * (w / 2 + 0.12) + 0.14, 0.12, h, 0, 0.1, 0xffffff, 0.02, 1);
}
// a full Haussmann facade along local x 0..W at z = 0 (building toward -z). o.shops: [{b, n, kind, sign, col, ...}], o.doors: [bay]
function haussmann(K, W, o = {}) {
  const D = o.d ?? 12, nb = o.bays ?? Math.max(1, Math.round(W / 3)), bw = W / nb, st = o.tint ?? 0xffffff, R = rng(o.seed || 1);
  K.box(M.stone, 0, W, 4.5, FL.top, -D, 0, st, 0.01, 2);
  K.box(M.rustic, 0, W, 0, 4.5, -D, -0.01, st, 0.01, 2);
  K.box(M.stone2, -0.02, W + 0.02, 4.45, 4.72, 0, 0.14, st, 0.02, 1); K.box(M.stone2, -0.02, W + 0.02, 4.72, 4.8, 0, 0.08, st, 0.01, 1);
  K.box(M.stone2, -0.02, W + 0.02, 11.1, 11.24, 0, 0.1, st, 0.02, 1);
  const winMat = () => (R() < 0.12 ? M.winLit : M.win[(R() * M.win.length) | 0]);
  for (let i = 0; i < nb; i++) {
    const cx = (i + 0.5) * bw;
    hWindow(K, cx, 4.98, 1.22, 2.42, { mat: winMat(), rail: true, hood: true, tint: st });
    hWindow(K, cx, 8.12, 1.22, 2.45, { mat: winMat(), hood: i % 2 ? 'ped' : true, tint: st });
    hWindow(K, cx, 11.5, 1.18, 2.2, { mat: winMat(), rail: true, tint: st });
    hWindow(K, cx, 14.52, 1.12, 2.0, { mat: winMat(), tint: st });
    // dormer (lucarne) in the mansard
    if (!o.noDormer) { K.box(M.stone2, cx - 0.62, cx + 0.62, 17.85, 19.75, -1.5, -0.42, st, 0.02, 1); K.put(winMat(), plane(0.78, 1.35), cx, 18.72, -0.41);
      for (const sd of [-1, 1]) K.box(M.stone2, cx + sd * 0.48 - 0.1, cx + sd * 0.48 + 0.1, 17.95, 19.6, -0.42, -0.34, st, 0.02, 1);
      K.put(M.zinc, prism(1.5, 0.5, 1.25), cx, 19.72, -1.62, 0, 0, 0, 1, 1, 1, 0xffffff); K.box(M.stone2, cx - 0.72, cx + 0.72, 19.68, 19.8, -1.5, -0.32, st, 0.02, 1); K.put(M.rail, uvPlane(0.82, 0.5, 1.2, 1.0), cx, 18.2, -0.32); }
  }
  hBalcony(K, 0, W, 7.9, 0.82, nb, bw, st);
  hBalcony(K, 0, W, 14.3, 0.62, nb, bw, st);
  // main cornice with modillions
  K.box(M.stone2, -0.02, W + 0.02, FL.top, FL.top + 0.2, 0, 0.22, st, 0.02, 1); K.box(M.stone2, -0.02, W + 0.02, FL.top + 0.2, FL.top + 0.32, 0, 0.36, st, 0.02, 1);
  for (let x = 0.25; x < W - 0.1; x += 0.55) K.box(M.stone2, x - 0.06, x + 0.06, FL.top + 0.32, FL.top + 0.5, 0, 0.46, st, 0.02, 1);
  K.box(M.stone2, -0.02, W + 0.02, FL.top + 0.5, FL.top + 0.66, 0, 0.6, st, 0.03, 1);
  K.box(M.paint, -0.02, W + 0.02, FL.top + 0.66, FL.top + 0.76, 0.2, 0.58, 0x7a828c, 0.02);
  // mansard (steep zinc) + upper roof + ridge
  slab(K, M.zinc, -0.02, W + 0.02, [FL.top + 0.7, -0.15], [20.9, -1.55], 0.14, 0xffffff, 2);
  K.box(M.zinc, -0.02, W + 0.02, 20.8, 20.95, -D, -1.45, 0xd8dce4, 0.02, 2);
  K.box(M.paint, -0.02, W + 0.02, 20.88, 21.0, -1.62, -1.42, 0x6a727c, 0.02);
  if (!o.noChimney) for (let x = o.chimStart ?? 0.0; x <= W + 0.01; x += o.chimEvery ?? 9) chimneyStack(K, Math.min(Math.max(x, 0.5), W - 0.5), -3.2, 20.6, 22.4 + R() * 0.5, 4 + ((x * 7) % 3 | 0));
  // ground floor
  const used = new Set();
  for (const s of o.shops || []) { for (let k = 0; k < s.n; k++) used.add(s.b + k); devanture(K, s.b * bw + 0.14, (s.b + s.n) * bw - 0.14, s); }
  for (const b of o.doors || []) { used.add(b); porteCochere(K, (b + 0.5) * bw, o.doorCol); }
  for (let i = 0; i < nb; i++) if (!used.has(i)) { const cx = (i + 0.5) * bw; K.put(M.win[1], plane(1.1, 2.3), cx, 1.85, 0.012); K.box(M.stone2, cx - 0.72, cx + 0.72, 0.6, 0.72, 0, 0.16, st, 0.02, 1); K.put(M.rail, uvPlane(1.15, 0.7, 1.2, 1.0), cx, 1.1, 0.08); }
  for (let i = 0; i <= nb; i++) { const x = Math.min(Math.max(i * bw, 0.2), W - 0.2); K.box(M.rustic, x - 0.24, x + 0.24, 0, 4.45, 0, 0.07, st, 0.01, 2); }
}
// cast-iron gas lamp (candélabre) with a four-pane lantern; registers the mantle for lights
function gasLamp(K, x, z, sp) {
  const iron = 0x1f2a24;
  K.put(M.iron, lathe('lbase', [[0, 0], [0.24, 0], [0.24, 0.1], [0.19, 0.16], [0.17, 0.5], [0.13, 0.62], [0.09, 0.66], [0, 0.66]], 8), x, 0.15, z, 0, Math.PI / 8, 0, 1, 1, 1, iron);
  K.put(M.iron, cyl(0.055, 0.085, 2.6, 10), x, 0.15 + 1.95, z, 0, 0, 0, 1, 1, 1, iron);
  for (const y of [0.9, 1.5, 3.1]) K.put(M.iron, tor(0.08, 0.02, 5, 12), x, 0.15 + y, z, Math.PI / 2, 0, 0, 1, 1, 1, iron);
  K.beam(M.iron, [x - 0.38, 3.0, z], [x + 0.38, 3.0, z], 0.035, iron, true, 6);
  for (const sd of [-1, 1]) K.put(M.iron, sph(0.04, 8, 6), x + sd * 0.38, 3.0, z, 0, 0, 0, 1, 1, 1, iron);
  K.put(M.iron, cyl(0.1, 0.06, 0.25, 8), x, 3.45, z, 0, 0, 0, 1, 1, 1, iron);
  const ly = 3.62; K.put(M.iron, cyl(0.17, 0.12, 0.06, 4), x, ly - 0.02, z, 0, Math.PI / 4, 0, 1, 1, 1, iron);
  K.put(M.glowSoft, cyl(0.2, 0.14, 0.5, 4, false), x, ly + 0.26, z, 0, Math.PI / 4, 0, 1, 1, 1, 0xffffff);
  K.put(M.glowWarm, sph(0.06, 8, 6), x, ly + 0.22, z, 0, 0, 0, 1, 1.4, 1, 0xffffff);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; K.beam(M.iron, [x + Math.cos(a) * 0.15, ly + 0.01, z + Math.sin(a) * 0.15], [x + Math.cos(a) * 0.21, ly + 0.52, z + Math.sin(a) * 0.21], 0.016, iron); }
  K.put(M.iron, cone(0.31, 0.26, 4), x, ly + 0.64, z, 0, Math.PI / 4, 0, 1, 1, 1, iron); K.put(M.iron, sph(0.05, 8, 6), x, ly + 0.8, z, 0, 0, 0, 1, 1, 1, iron);
  K.put(M.iron, cone(0.035, 0.12, 6), x, ly + 0.89, z, 0, 0, 0, 1, 1, 1, iron);
  if (sp) LAMPS.push([x, ly + 0.22, z]);
}
// round Morris advertising column with posters, frieze and a scalloped dome
function morrisColumn(K, x, z, M2) {
  const g = 0x2c4a36, y0 = 0.15; K.at(x, y0, z, 0.4, () => {
    K.put(M.paint, cyl(0.78, 0.82, 0.3, 24), 0, 0.15, 0, 0, 0, 0, 1, 1, 1, g); K.put(M.paint, cyl(0.74, 0.78, 0.08, 24), 0, 0.34, 0, 0, 0, 0, 1, 1, 1, new THREE.Color(g).multiplyScalar(1.2));
    K.put(M2.posters, cyl(0.72, 0.72, 2.5, 32, true), 0, 1.63, 0, 0, 0, 0, 1, 1, 1, 0xffffff);
    K.put(M.paint, cyl(0.7, 0.7, 2.5, 20), 0, 1.63, 0, 0, 0, 0, 1, 1, 1, 0x3a3a3a);
    K.put(M.paint, cyl(0.78, 0.74, 0.12, 24), 0, 2.94, 0, 0, 0, 0, 1, 1, 1, g);
    K.put(M2.frieze, cyl(0.76, 0.76, 0.42, 24, true), 0, 3.21, 0, 0, 0, 0, 1, 1, 1, 0xffffff);
    K.put(M.paint, cyl(0.86, 0.78, 0.12, 24), 0, 3.48, 0, 0, 0, 0, 1, 1, 1, g);
    K.put(M2.valK, cyl(0.88, 0.88, 0.2, 24, true), 0, 3.46, 0, 0, 0, 0, 1, 1, 1, 0xffffff);
    K.put(M.paint, lathe('mdome', [[0.84, 0], [0.8, 0.12], [0.62, 0.38], [0.36, 0.56], [0.14, 0.62], [0, 0.64]], 24), 0, 3.54, 0, 0, 0, 0, 1, 1, 1, g);
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; K.beam(M.paint, [Math.cos(a) * 0.83, 3.56, Math.sin(a) * 0.83], [Math.cos(a) * 0.14, 4.16, Math.sin(a) * 0.14], 0.02, 0xc8a050, true, 4); }
    K.put(M.gold, sph(0.1, 10, 8), 0, 4.24, 0, 0, 0, 0, 1, 1, 1, 0xd8a848); K.put(M.gold, cone(0.05, 0.3, 8), 0, 4.45, 0, 0, 0, 0, 1, 1, 1, 0xd8a848);
  });
}
// 1910-style taxi landaulet (original design): dash radiator behind a coal-scuttle bonnet, open driver seat, closed rear cab
function taxi(M2) {
  const G = new THREE.Group(), K = new Kit(), red = 0x6e1e24, blk = 0x1c1a20, brass = 0xd8a848;
  K.box(M.paint, -0.42, 0.42, 0.48, 0.58, -1.75, 1.6, blk, 0.02);
  K.put(M.paint, profGeo('bonnet', [[1.0, 0.62], [1.62, 0.66], [1.66, 0.8], [1.25, 1.12], [1.0, 1.14]], 0.82, 0.04), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0x26242a);
  for (const sd of [-1, 1]) K.box(M.paint, sd * 0.42 - 0.07, sd * 0.42 + 0.07, 0.62, 1.12, 0.88, 1.04, 0x3a3a40, 0.02); // dash radiators
  K.box(M.paint, -0.55, 0.55, 0.6, 1.0, -0.15, 0.95, red, 0.04);
  K.box(M.paint, -0.5, 0.5, 1.0, 1.08, 0.05, 0.75, 0x3a1a14, 0.05); K.box(M.paint, -0.5, 0.5, 1.0, 1.55, -0.15, 0.02, 0x3a1a14, 0.05);
  K.box(M.paint, -0.62, 0.62, 0.6, 1.62, -1.85, -0.2, red, 0.05); K.box(M.paint, -0.62, 0.62, 1.62, 1.72, -1.9, -0.15, blk, 0.04);
  for (const sd of [-1, 1]) { K.put(M2.taxiWin, plane(0.85, 0.45), sd * 0.623, 1.32, -1.0, 0, sd * Math.PI / 2, 0); K.box(M.gold, sd * 0.62 - 0.01, sd * 0.62 + 0.01, 1.05, 1.08, -1.6, -0.4, brass, 0.004); K.put(M.gold, cyl(0.02, 0.02, 0.12, 6), sd * 0.64, 1.0, -0.5, 0, 0, Math.PI / 2, 1, 1, 1, brass); }
  K.put(M2.taxiWin, plane(0.9, 0.45), 0, 1.32, -0.199); K.put(M2.taxiWin, plane(0.9, 0.4), 0, 1.32, -1.851, 0, Math.PI, 0);
  K.put(M.paint, profGeo('lando', [[-1.9, 1.72], [-1.6, 1.98], [-1.0, 2.04], [-0.3, 1.98], [-0.18, 1.72]], 1.26, 0.04), 0, 0, 0, 0, 0, 0, 1, 1, 1, blk);
  for (const sd of [-1, 1]) { K.box(M.paint, sd * 0.78 - 0.14, sd * 0.78 + 0.14, 0.42, 0.46, -1.5, 0.9, blk, 0.01);
    K.put(M.paint, tor(0.5, 0.06, 5, 16, Math.PI * 0.75), sd * 0.78, 0.44, 1.18, 0, Math.PI / 2, Math.PI * 0.12, 1, 1, 1.3, blk);
    K.put(M.paint, tor(0.5, 0.06, 5, 16, Math.PI * 0.75), sd * 0.78, 0.44, -1.3, 0, Math.PI / 2, Math.PI * 0.12, 1, 1, 1.3, blk);
    K.put(M.gold, cyl(0.11, 0.13, 0.2, 14), sd * 0.4, 1.12, 1.25, Math.PI / 2, 0, 0, 1, 1, 1, brass); K.put(M2.lampGlass, cyl(0.095, 0.095, 0.02, 14), sd * 0.4, 1.12, 1.36, Math.PI / 2, 0, 0, 1, 1, 1, 0xffffff);
    K.box(M.paint, sd * 0.6 - 0.06, sd * 0.6 + 0.06, 1.15, 1.35, 0.0, 0.12, blk, 0.02); K.put(M2.lampGlass, plane(0.08, 0.12), sd * 0.6, 1.25, 0.125); }
  K.put(M.gold, tor(0.17, 0.02, 6, 20), -0.28, 1.5, 0.55, -0.9, 0, 0, 1, 1, 1, 0x3a2a20); K.beam(M.paint, [-0.28, 0.9, 0.85], [-0.28, 1.48, 0.58], 0.02, blk, true, 6);
  K.box(M.paint, 0.3, 0.5, 1.3, 1.52, 0.6, 0.78, 0x3a2a24, 0.02); K.box(M.paint, 0.48, 0.52, 1.5, 1.72, 0.66, 0.72, 0xc8302c, 0.005); // taximeter + flag
  K.put(M.gold, cone(0.07, 0.36, 10), 0.5, 1.2, 1.1, -Math.PI / 2, 0, 0, 1, 1, 1, brass); K.put(M.paint, sph(0.07, 8, 6), 0.5, 1.2, 0.86, 0, 0, 0, 1, 1, 1, blk);
  K.build(G);
  for (const [x, z, r] of [[-0.78, 1.18, 0.43], [0.78, 1.18, 0.43], [-0.78, -1.3, 0.43], [0.78, -1.3, 0.43]]) { const w = new THREE.Group(); w.position.set(x, r, z); G.add(w); const KW = new Kit();
    KW.put(M.paint, tor(r - 0.05, 0.05, 8, 28), 0, 0, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0x1a181e); KW.put(M.paint, tor(r - 0.11, 0.025, 5, 28), 0, 0, 0, 0, Math.PI / 2, 0, 1, 1, 1, 0x9a6a3a);
    KW.put(M.gold, cyl(0.07, 0.07, 0.14, 12), 0, 0, 0, 0, 0, Math.PI / 2, 1, 1, 1, brass);
    for (let k = 0; k < 12; k++) KW.put(M.paint, cyl(0.016, 0.022, r * 2 - 0.22, 6), 0, 0, 0, k * Math.PI / 12, 0, 0, 1, 1, 1, 0xb07a44); KW.build(w); }
  return G;
}
// Paris newsstand kiosk (original design after the octagonal pavement kiosks): papers hung on every face
function buildKiosk(M2) {
  const G = new THREE.Group(), K = new Kit(), green = 0x2a4636, gd = 0x1e3428, gold = 0xd8a848;
  const N = 8, a = 0.8, fw = 2 * a * Math.tan(Math.PI / N), Rr = a / Math.cos(Math.PI / N);
  for (let i = 0; i < N; i++) { const phi = i * Math.PI * 2 / N; K.at(0, 0, 0, phi, () => {
    K.box(M.paint, -fw / 2, fw / 2, 0, 0.32, a - 0.12, a + 0.02, gd, 0.02);
    if (i === 0) { K.box(M.paint, -fw / 2, fw / 2, 0.32, 0.98, a - 0.1, a - 0.02, green, 0.02); K.box(M.paint, -fw / 2 - 0.05, fw / 2 + 0.05, 0.98, 1.04, a - 0.12, a + 0.26, 0x6a4a2c, 0.015);
      K.put(M.paint, plane(fw, 1.2), 0, 1.6, a - 0.35, 0, 0, 0, 1, 1, 1, 0x2a2026); K.box(M.paint, -fw / 2, fw / 2, 2.2, 2.32, a - 0.1, a, green, 0.02);
      K.put(M.paint, plane(fw - 0.04, 0.35), 0, 2.33, a + 0.17, -1.0, 0, 0, 1, 1, 1, green); // raised shutter flap
    } else { K.box(M.paint, -fw / 2, fw / 2, 0.32, 2.32, a - 0.1, a - 0.02, green, 0.02); K.box(M.paint, -fw / 2 + 0.06, fw / 2 - 0.06, 0.4, 0.95, a - 0.02, a, gd, 0.01); K.box(M.gold, -fw / 2 + 0.08, fw / 2 - 0.08, 0.93, 0.95, a, a + 0.005, gold, 0.003); }
    K.put(M2.frieze, plane(fw - 0.02, 0.24), 0, 2.45, a + 0.012); K.box(M.paint, -fw / 2, fw / 2, 2.32, 2.58, a - 0.1, a, gd, 0.01);
    K.beam(M.iron, [-fw / 2 + 0.03, 1.82, a + 0.03], [fw / 2 - 0.03, 1.82, a + 0.03], 0.008, 0x2a2a2a, true, 4);
  }); }
  for (let i = 0; i < N; i++) { const p = (i + 0.5) * Math.PI * 2 / N; const x = Math.sin(p) * Rr, z = Math.cos(p) * Rr; K.put(M.paint, cyl(0.035, 0.04, 2.62, 8), x, 1.31, z, 0, 0, 0, 1, 1, 1, green); for (const y of [0.32, 2.32]) K.put(M.gold, sph(0.045, 8, 6), x, y, z, 0, 0, 0, 1, 1, 1, gold); }
  K.put(M.paint, cyl(Rr + 0.14, Rr + 0.06, 0.12, N), 0, 2.64, 0, 0, Math.PI / N, 0, 1, 1, 1, green);
  K.put(M2.valK, cyl(Rr + 0.15, Rr + 0.15, 0.2, N, true), 0, 2.6, 0, 0, Math.PI / N, 0, 1, 1, 1, 0xffffff);
  K.put(M.paint, lathe('kdome', [[Rr + 0.16, 0], [Rr + 0.1, 0.08], [Rr * 0.72, 0.36], [Rr * 0.38, 0.58], [0.16, 0.7], [0.1, 0.78], [0, 0.8]], N), 0, 2.7, 0, 0, Math.PI / N, 0, 1, 1, 1, gd);
  K.put(M.gold, sph(0.07, 10, 8), 0, 3.56, 0, 0, 0, 0, 1, 1, 1, gold); K.put(M.gold, cyl(0.02, 0.05, 0.22, 8), 0, 3.72, 0, 0, 0, 0, 1, 1, 1, gold); K.put(M.gold, sph(0.04, 8, 6), 0, 3.86, 0, 0, 0, 0, 1, 1, 1, gold);
  // the vendor's interior: shelves + magazine stacks
  K.box(M.wood, -0.45, 0.45, 0.9, 0.98, -0.2, a - 0.15, 0x8a6a4a, 0.01);
  for (let k = 0; k < 5; k++) K.box(M.paper, -0.4 + k * 0.17, -0.27 + k * 0.17, 1.05, 1.1 + (k % 3) * 0.06, a - 0.42, a - 0.18, [0xf2e8d2, 0xe8d8b0, 0xf0e0c8, 0xd8c8a8, 0xf2ecdc][k], 0.005);
  K.beam(M.iron, [0, 2.32, a - 0.3], [0, 2.12, a - 0.3], 0.006, 0x1d1a20, true, 4); K.put(M.iron, cone(0.1, 0.08, 10), 0, 2.1, a - 0.3, 0, 0, 0, 1, 1, 1, 0x2a4636); K.put(M.glowWarm, sph(0.035, 10, 8), 0, 2.04, a - 0.3, 0, 0, 0, 1, 1, 1, 0xffffff);
  K.build(G);
  // newspapers (texture-mapped, slightly bowed planes)
  const papers = [];
  const paperGeo = cached('paperGeo', () => { const g = new THREE.PlaneGeometry(0.42, 0.6, 8, 1), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, 0.012 * Math.cos(x / 0.21 * Math.PI / 2)); } g.computeVertexNormals(); return g; });
  const halfGeo = cached('paperHalf', () => { const g = new THREE.PlaneGeometry(0.42, 0.6, 8, 1); g.translate(0, 0, 0); return g; });
  const addPaper = (face, x, y, idx, s = 1, tilt = 0, dz = 0.03) => { const phi = face * Math.PI * 2 / N; const pv = new THREE.Group(); pv.rotation.y = phi; G.add(pv);
    const m = mesh(pv, paperGeo, M2.paperMats[idx % M2.paperMats.length], x, y, a + dz, tilt, 0, 0, false); m.scale.setScalar(s); papers.push(m);
    for (const sd of [-1, 1]) mesh(pv, cached('clip', () => new THREE.BoxGeometry(0.025, 0.05, 0.02)), M2.clipMat, x + sd * 0.13 * s, y + 0.29 * s, a + dz + 0.012, 0, 0, 0, false); return m; };
  // two papers per side face (upper + lower), headlines out
  for (const [f, up, lo] of [[1, 0, 1], [-1, 1, 3], [2, 2, 0], [-2, 3, 2], [3, 1, 0], [-3, 0, 1], [4, 2, 3]]) { addPaper(f, 0, 1.6, up, 0.98); addPaper(f, 0, 0.94, lo, 0.98, -0.04, 0.045); }
  // inside the opening: two papers pegged to a line above the counter + a fanned stack on the counter
  { const pv = new THREE.Group(); G.add(pv); for (const [x, idx] of [[-0.135, 0], [0.135, 1]]) { const m = mesh(pv, paperGeo, M2.paperMats[idx], x, 1.5, a - 0.26, 0, 0, 0, false); m.scale.setScalar(0.62); papers.push(m); }
    for (let k = 0; k < 3; k++) { const m = mesh(pv, halfGeo, M2.paperMats[k === 2 ? 1 : 0], -0.12 + k * 0.11, 1.07 + k * 0.006, a + 0.08 - k * 0.02, -Math.PI / 2 + 0.35, 0.25 - k * 0.22, 0, false); m.scale.setScalar(0.5); papers.push(m); } }
  const K2 = new Kit(); K2.beam(M.iron, [-0.3, 1.78, a - 0.25], [0.3, 1.78, a - 0.25], 0.004, 0x2a2a2a, true, 4); K2.build(G);
  G.papers = papers; return G;
}
// café terrace furniture
function cafeTable(K, x, z, R) {
  K.put(M.marble, cyl(0.3, 0.3, 0.035, 20), x, 0.15 + 0.72, z, 0, 0, 0, 1, 1, 1, 0xf2eee6); K.put(M.iron, cyl(0.025, 0.035, 0.7, 8), x, 0.15 + 0.36, z, 0, 0, 0, 1, 1, 1, 0x1d1a20);
  K.put(M.iron, lathe('tfoot', [[0, 0], [0.22, 0], [0.2, 0.04], [0.05, 0.12], [0, 0.12]], 10), x, 0.15, z, 0, 0, 0, 1, 1, 1, 0x1d1a20);
  if (R() < 0.7) { K.put(M.marble, cyl(0.045, 0.035, 0.07, 10), x + 0.1, 0.15 + 0.775, z - 0.05, 0, 0, 0, 1, 1, 1, 0xf6f2ea); K.put(M.marble, cyl(0.07, 0.07, 0.01, 12), x + 0.1, 0.15 + 0.742, z - 0.05, 0, 0, 0, 1, 1, 1, 0xf6f2ea); }
  if (R() < 0.5) { K.put(M.paint, cyl(0.035, 0.04, 0.24, 10), x - 0.12, 0.15 + 0.86, z + 0.06, 0, 0, 0, 1, 1, 1, 0x2a5a3a); K.put(M.paint, cyl(0.012, 0.03, 0.08, 8), x - 0.12, 0.15 + 1.02, z + 0.06, 0, 0, 0, 1, 1, 1, 0x2a5a3a); }
}
function bistroChair(K, x, z, ry) { K.at(x, 0.15, z, ry, () => { const c = 0x4a2a1a; K.put(M.paint, cyl(0.2, 0.2, 0.03, 16), 0, 0.46, 0, 0, 0, 0, 1, 1, 1, 0x7a5a3a); K.put(M.paint, tor(0.2, 0.015, 4, 20), 0, 0.44, 0, Math.PI / 2, 0, 0, 1, 1, 1, c);
  for (const [lx, lz] of [[0.14, 0.14], [-0.14, 0.14], [0.14, -0.14], [-0.14, -0.14]]) K.beam(M.paint, [lx, 0.45, lz], [lx * 1.25, 0, lz * 1.25], 0.016, c, true, 5);
  K.put(M.paint, tor(0.17, 0.016, 4, 18, Math.PI), 0, 0.82, -0.19, 0.12, 0, 0, 1, 1, 1, c); for (const sd of [-1, 1]) K.beam(M.paint, [sd * 0.17, 0.46, -0.18], [sd * 0.17, 0.82, -0.22], 0.016, c, true, 5);
  K.put(M.paint, tor(0.12, 0.014, 4, 16, Math.PI), 0, 0.66, -0.2, 0.12, 0, 0, 1, 1, 1, c); }); }

function buildStreet(root, ctx) {
  const K = new Kit(), M2 = {};
  M2.posters = toon({ map: mkTex(2048, 512, postersTex) }); M2.posters.map.repeat.set(1, 1);
  M2.frieze = toon({ map: mkTex(512, 96, (g, w, h) => fasciaTex(g, w, h, 'JOURNAUX', '#2a4636', '#e8c46a', { orn: false, fs: 0.62 })) });
  M2.valK = toon({ map: mkTex(1024, 96, (g, w, h) => scallopTex(g, w, h, { n: 16, base: '#2a4636', trim: '#d8a848' })), alphaTest: 0.5, side: THREE.DoubleSide });
  M2.taxiWin = toon({ map: mkTex(256, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#8090b0'); gr.addColorStop(0.5, '#2a2a3c'); gr.addColorStop(1, '#4a4a62'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(220,230,255,0.25)'; g.fillRect(w * 0.2, 0, 20, h); }) });
  M2.lampGlass = new THREE.MeshBasicMaterial({ color: 0xfff2d0 });
  M2.clipMat = toon({ color: 0x8a8a90 });
  M2.paperTex = HEADLINES.map((o, i) => mkTex(768, 1100, (g, w, h) => paintNewspaper(g, w, h, { ...o, seed: 11 + i })));
  M2.paperMats = M2.paperTex.map((t) => toon({ map: t, side: THREE.DoubleSide }));
  const awnMat = toon({ map: mkTex(512, 512, (g, w, h) => PT.fabric(g, w, h, { base: '#7a1e24', stripes: '#e8dcc0', nStripes: 10, folds: 4 }), [3, 1]), side: THREE.DoubleSide });
  const valMat = toon({ map: mkTex(1024, 128, (g, w, h) => scallopTex(g, w, h, { n: 14, base: '#7a1e24', stripes: '#e8dcc0', text: 'CAFÉ DES ARTISTES', fg: '#f6ead0', trim: '#e8c870' })), alphaTest: 0.5, side: THREE.DoubleSide });
  const plaque = (a, b) => toon({ map: mkTex(512, 200, (g, w, h) => plaqueTex(g, w, h, a, b)) });
  // ---- ground: setts roadway, asphalt sidewalks, granite kerbs (sidewalk top y = 0.15)
  K.box(M.setts, -80, 50, -0.1, 0, -80, 50, 0xffffff, 0.01, 3.2);
  const walk = (x0, x1, z0, z1) => K.box(M.walk, x0, x1, 0, 0.15, z0, z1, 0xffffff, 0.01, 3);
  const kerb = (x0, x1, z0, z1) => K.box(M.kerb, x0, x1, 0, 0.16, z0, z1, 0xd8d4cc, 0.03, 0.6);
  walk(-80, 3.75, -3.5, 3.75); walk(-3.5, 3.75, -80, 3.75); kerb(-80, 4.0, 3.75, 4.0); kerb(3.75, 4.0, -80, 3.75);
  walk(-80, 11, 11.25, 30); walk(11.25, 30, -80, 11.25); walk(11, 30, 11, 30); kerb(-80, 11.25, 11, 11.25); kerb(11, 11.25, -80, 11.25);
  // gutters (darker stone channel) along the kerbs
  K.box(M.kerb, -80, 4.0, -0.005, 0.01, 4.0, 4.35, 0x8a8478, 0.01, 0.6); K.box(M.kerb, 4.0, 4.35, -0.005, 0.01, -80, 4.35, 0x8a8478, 0.01, 0.6);
  // ---- corner block (x < 0, z < 0): facade A along z = 0 (x -46..-3), facade B along x = 0 (z -3..-46), chamfered corner
  K.at(-46, 0, 0, 0, () => haussmann(K, 43, { seed: 3, bays: 14, chimEvery: 8.6, chimStart: 0.5,
    shops: [{ b: 13, n: 1, kind: 'cafe', sign: 'CAFÉ', col: 0x6a1e22, glass: 'CAFÉ — BILLARD' }, { b: 12, n: 1, kind: 'cafe', sign: 'CAFÉ DES ARTISTES', col: 0x6a1e22, door: false },
      { b: 10, n: 1, kind: 'tabac', sign: 'TABAC', col: 0x7a2a26, signBg: '#7a2a26' }, { b: 8, n: 2, kind: 'bread', sign: 'BOULANGERIE', col: 0x2e4a6a, glass: 'PAIN DE LUXE — VIENNOISERIE' },
      { b: 6, n: 1, kind: 'mercerie', sign: 'MERCERIE', col: 0x3a5a3a }, { b: 3, n: 2, kind: 'vins', sign: 'VINS & LIQUEURS', col: 0x4a2a3a }, { b: 0, n: 2, kind: 'books', sign: 'LIBRAIRIE', col: 0x2a3a5a }],
    doors: [11, 5, 2] }));
  K.at(0, 0, -3, Math.PI / 2, () => haussmann(K, 43, { seed: 7, bays: 14, chimEvery: 8.6, chimStart: 4.8,
    shops: [{ b: 0, n: 1, kind: 'cafe', sign: 'CAFÉ', col: 0x6a1e22, glass: 'CAFÉ — BILLARD' }, { b: 2, n: 2, kind: 'bread', sign: 'PÂTISSERIE', col: 0x6a4a7a }, { b: 5, n: 2, kind: 'tabac', sign: 'TABAC', col: 0x7a2a26 }, { b: 8, n: 2, kind: 'mercerie', sign: 'MODES', col: 0x2a4a4a }, { b: 11, n: 2, kind: 'vins', sign: 'ÉPICERIE', col: 0x5a4a1a }],
    doors: [1, 4, 7, 10, 13] }));
  K.at(-3, 0, 0, Math.PI / 4, () => haussmann(K, 4.243, { seed: 5, bays: 1, noChimney: true, d: 4, shops: [{ b: 0, n: 1, kind: 'cafe', sign: 'CAFÉ', col: 0x6a1e22, glass: 'CAFÉ DES ARTISTES' }] }));
  // ---- opposite rows + street ends (fog-softened backdrop)
  K.at(8, 0, 15, Math.PI, () => haussmann(K, 54, { seed: 11, bays: 18, tint: 0xf4ead8, chimEvery: 9, shops: [{ b: 1, n: 2, kind: 'cafe', sign: 'BRASSERIE', col: 0x2a3a2a }, { b: 5, n: 2, kind: 'bread', sign: 'BOULANGERIE', col: 0x6a3a2a }, { b: 9, n: 1, kind: 'tabac', sign: 'TABAC', col: 0x7a2a26 }, { b: 12, n: 3, kind: 'mercerie', sign: 'GRANDS MAGASINS', col: 0x1e2a4a }], doors: [0, 4, 8, 11, 16] }));
  K.at(15, 0, -46, -Math.PI / 2, () => haussmann(K, 54, { seed: 13, bays: 18, tint: 0xfaf0e0, chimEvery: 9, shops: [{ b: 2, n: 2, kind: 'books', sign: 'PAPETERIE', col: 0x2a3a5a }, { b: 7, n: 2, kind: 'vins', sign: 'CRÉMERIE', col: 0x3a5a6a }, { b: 13, n: 2, kind: 'cafe', sign: 'CAFÉ DU MATIN', col: 0x6a1e22 }], doors: [0, 5, 10, 16] }));
  K.at(-58, 0, 32, Math.PI / 2, () => haussmann(K, 40, { seed: 17, bays: 13, tint: 0xf2e6d0, noChimney: true, doors: [2, 6, 10] }));
  K.at(-6, 0, -58, 0, () => haussmann(K, 40, { seed: 19, bays: 13, tint: 0xf2e6d0, noChimney: true, doors: [2, 6, 10] }));
  // ---- café awning (corner + two bays of facade A) with valance
  const awn = (x0, x1, ry, ox, oz) => K.at(ox, 0, oz, ry, () => { const W = x1 - x0, cx = (x0 + x1) / 2; K.put(awnMat, plane(W, 1.93), cx, 2.9, 1.2, -1.2, 0, 0); K.put(valMat, plane(W, 0.4), cx, 2.36, 2.1); K.box(M.iron, x0, x1, 3.2, 3.3, 0.25, 0.4, 0x2a2224, 0.02); for (const x of [x0 + 0.1, x1 - 0.1]) K.beam(M.iron, [x, 3.25, 0.32], [x, 2.55, 2.1], 0.02, 0x2a2224, true, 4); });
  awn(36.5, 42.9, 0, -46, 0); awn(0.1, 4.14, Math.PI / 4, -3, 0); awn(0.1, 3.0, Math.PI / 2, 0, -3);
  // ---- terrace: tables + chairs on sidewalk A in front of the café, and round the corner
  const R = rng(5);
  for (const [x, z] of [[-9.6, 2.05], [-8.2, 2.1], [-6.8, 2.05], [-5.2, 2.1], [-1.5, 2.6], [2.3, -1.6], [2.2, -3.3], [2.25, -5.0]]) { cafeTable(K, x, z, R); bistroChair(K, x - 0.42, z + 0.2, Math.PI / 2 + 0.3); bistroChair(K, x + 0.4, z - 0.25, -Math.PI / 2 - 0.2); if (R() < 0.5) bistroChair(K, x + 0.1, z + 0.48, Math.PI + 0.2); }
  // café chalkboard easel
  K.at(-3.9, 0.15, 2.9, 0.4, () => { K.box(M.paint, -0.3, 0.3, 0.45, 1.25, -0.02, 0.02, 0x2a2a2a, 0.01); K.box(M.wood, -0.34, 0.34, 0.41, 1.29, -0.04, -0.01, 0x8a6a4a, 0.01); for (const sd of [-1, 1]) K.beam(M.wood, [sd * 0.3, 1.25, -0.03], [sd * 0.34, 0, 0.2], 0.025, 0x8a6a4a); K.beam(M.wood, [0, 1.25, -0.05], [0, 0, -0.45], 0.025, 0x8a6a4a); });
  // wine barrels + crates outside the vins shop and boulangerie handcart
  for (const [x, z] of [[-41.5, 0.6], [-40.8, 0.5]]) K.put(M.wood, cyl(0.3, 0.3, 0.8, 14), x, 0.55, z, 0, 0, 0, 1, 1, 1, 0x9a6a3a);
  K.at(-19.5, 0.15, 2.9, 0.15, () => { K.box(M.wood, -0.6, 0.6, 0.55, 0.62, -0.4, 0.4, 0x9a7a4a, 0.01); for (const sd of [-1, 1]) { K.box(M.wood, -0.62, 0.62, 0.62, 0.85, sd * 0.4 - 0.02, sd * 0.4 + 0.02, 0x9a7a4a, 0.005); K.put(M.paint, tor(0.42, 0.04, 5, 18), sd * 0.66 * 0 + 0, 0.42, sd * 0.47, 0, 0, 0, 1, 1, 1, 0x5a3a24); } K.beam(M.wood, [-0.6, 0.6, -0.3], [-1.6, 0.85, -0.3], 0.03, 0x8a6a3a); K.beam(M.wood, [-0.6, 0.6, 0.3], [-1.6, 0.85, 0.3], 0.03, 0x8a6a3a);
    for (let k = 0; k < 7; k++) K.put(M.paint, cyl(0.035, 0.035, 0.75, 6), -0.3 + k * 0.1, 0.72, 0, Math.PI / 2, 0.15 * (k % 2), 0, 1, 1, 1, 0xd8a060); K.box(M.wood, -0.5, 0.5, 0.62, 0.66, -0.35, 0.35, 0xc8a878, 0.005); });
  // TABAC carotte (red lozenge sign on an iron bracket) on facade A, bay 10
  { const tx = -46 + 10.5 * 43 / 14; K.beam(M.iron, [tx + 0.9, 4.5, 0.05], [tx + 0.9, 4.5, 0.85], 0.025, 0x1d1a20, true, 5); K.put(M.paint, cone(0.2, 0.5, 4), tx + 0.9, 4.52, 0.75, 0, 0, Math.PI, 1, 1, 0.5, 0xb8282a); K.put(M.paint, cone(0.2, 0.5, 4), tx + 0.9, 3.98, 0.75, 0, 0, 0, 1, 1, 0.5, 0xb8282a); K.put(M.paint, cyl(0.2, 0.2, 0.04, 4), tx + 0.9, 4.25, 0.75, 0, Math.PI / 4, 0, 1, 1, 0.71, 0xb8282a); }
  // ---- gas lamps (kerb lines) + Morris columns
  for (const x of [-9.5, -21.5, -33.5]) gasLamp(K, x, 3.42, true); for (const z of [-9.5, -21.5, -33.5]) gasLamp(K, 3.42, z, true); gasLamp(K, 3.42, 3.42, true);
  for (const x of [-3.5, -15.5, -27.5]) gasLamp(K, x, 11.6, true); for (const z of [-3.5, -15.5, -27.5]) gasLamp(K, 11.6, z, true);
  morrisColumn(K, 2.45, -9.2, M2); morrisColumn(K, -12.5, 12.6, M2);
  // street-name plaques on the corner building
  const P1 = plaque('3e ARRt', 'RUE DU CADRAN'), P2 = plaque('3e ARRt', 'RUE DES LILAS');
  K.put(P1, plane(0.9, 0.35), -4.5, 5.6, 0.16); K.put(P2, plane(0.9, 0.35), 0.16, 5.6, -4.5, 0, Math.PI / 2, 0);
  // bench + bicycle against the wall + newspaper litter
  K.at(-27, 0.15, 3.1, Math.PI, () => { K.box(M.wood, -0.9, 0.9, 0.42, 0.47, -0.2, 0.2, 0x5a4a2a, 0.01); K.box(M.wood, -0.9, 0.9, 0.55, 0.85, -0.24, -0.2, 0x5a4a2a, 0.01); for (const sd of [-1, 1]) K.box(M.iron, sd * 0.8 - 0.04, sd * 0.8 + 0.04, 0, 0.9, -0.25, 0.22, 0x1d2a24, 0.01); });
  K.at(-15.2, 0.15, 0.32, 0, () => { for (const x of [-0.55, 0.55]) K.put(M.paint, tor(0.33, 0.022, 5, 22), x, 0.34, 0, 0, 0, 0, 1, 1, 1, 0x1d1a20); K.beam(M.paint, [-0.55, 0.34, 0], [0.05, 0.7, 0], 0.02, 0x2a3a5a, true); K.beam(M.paint, [0.05, 0.7, 0], [0.55, 0.34, 0], 0.02, 0x2a3a5a, true); K.beam(M.paint, [0.05, 0.7, 0], [0.0, 0.34, 0], 0.02, 0x2a3a5a, true); K.beam(M.paint, [0.0, 0.34, 0], [-0.55, 0.34, 0], 0.02, 0x2a3a5a, true); K.beam(M.paint, [0.45, 0.62, 0], [0.5, 0.9, 0], 0.02, 0x2a3a5a, true); K.box(M.paint, -0.12, 0.08, 0.76, 0.8, -0.06, 0.06, 0x3a2a1a, 0.02); K.beam(M.paint, [0.42, 0.92, -0.22], [0.42, 0.92, 0.22], 0.015, 0x1d1a20, true); });
  K.build(root, 24);
  // ---- hero props as their own groups
  const kiosk = buildKiosk(M2); kiosk.position.set(-6.4, 0.15, 2.7); kiosk.rotation.y = 0.55; root.add(kiosk); kiosk.updateMatrix();
  { const v = new THREE.Vector3(0, 2.0, 1.15).applyMatrix4(kiosk.matrix); LAMPS.unshift([v.x, v.y, v.z, 'kiosk']); }
  const cab = taxi(M2); cab.position.set(-12.8, 0, 5.15); cab.rotation.y = -Math.PI / 2; root.add(cab);
  // a few loose papers on the pavement near the kiosk
  for (const [x, z, r, i] of [[-5.1, 3.3, 0.6, 0], [-7.6, 1.6, -0.4, 1]]) { const m = mesh(root, cached('loose', () => new THREE.PlaneGeometry(0.42, 0.6)), M2.paperMats[i], x, 0.152, z, -Math.PI / 2, r, 0, false); m.scale.setScalar(0.9); }
  for (const m of [...kiosk.children, ...cab.children]) m.traverse((o) => { if (o.isMesh) { o.receiveShadow = true; } });
  return { kiosk, cab, paperTex: M2.paperTex, paperMats: M2.paperMats };
}

// ================================================================= ATTIC (Peruggia's room, 1911)
// local frame: floor y = 0, room x -1.8..1.8, low knee wall at z = -2.0 (h 1.0), slope up to y 2.5 at z = -0.6, flat ceiling to z = 3.
// dormer window in the slope at x 0.05..0.95 (sill 0.85, head 1.95)
const AT = { x0: -1.8, x1: 1.8, zb: -2.0, knee: 1.0, zs: -0.6, ceil: 2.5, zf: 3.2, wx0: 0.05, wx1: 0.95, wy0: 0.85, wy1: 1.95 };
function buildTrunk(M2) {
  // outer 1.0 (x) x 0.6 (z) x 0.56 (y); lid hinged on the back top edge; false bottom hinged at the back, 0.17 above the floor
  const G = new THREE.Group(), K = new Kit(), wd = 0x8a5a34, band = 0x2a2026, brass = 0xc89a48, L = 1.0, D = 0.6, H = 0.5, t = 0.025;
  K.box(M2.trunkWood, -L / 2, L / 2, 0, t, -D / 2, D / 2, wd, 0.008, 0.5);
  K.box(M2.trunkWood, -L / 2, L / 2, 0, H, D / 2 - t, D / 2, wd, 0.01, 0.5); K.box(M2.trunkWood, -L / 2, L / 2, 0, H, -D / 2, -D / 2 + t, wd, 0.01, 0.5);
  for (const sd of [-1, 1]) K.box(M2.trunkWood, sd * L / 2 - t / 2 - sd * t / 2, sd * L / 2 + t / 2 - sd * t / 2, 0, H, -D / 2, D / 2, wd, 0.01, 0.5);
  // lining inside
  K.box(M2.lining, -L / 2 + t, L / 2 - t, t, t + 0.002, -D / 2 + t, D / 2 - t, 0xffffff, 0.002, 0.3);
  for (const sd of [-1, 1]) { K.put(M2.lining, plane(L - 2 * t, H - t), 0, H / 2 + t / 2, sd * (D / 2 - t - 0.001), 0, sd > 0 ? Math.PI : 0, 0); K.put(M2.lining, plane(D - 2 * t, H - t), sd * (L / 2 - t - 0.001), H / 2 + t / 2, 0, 0, -sd * Math.PI / 2, 0); }
  // bands + corners + handles + lock plate
  for (const x of [-0.3, 0.3]) { K.box(M.paint, x - 0.03, x + 0.03, 0.0, H, D / 2, D / 2 + 0.006, band, 0.004); K.box(M.paint, x - 0.03, x + 0.03, 0.0, H, -D / 2 - 0.006, -D / 2, band, 0.004); }
  for (const sd of [-1, 1]) { K.box(M.paint, -L / 2 - 0.004, L / 2 + 0.004, 0.06, 0.1, ...(sd > 0 ? [D / 2, D / 2 + 0.006] : [-D / 2 - 0.006, -D / 2]), band, 0.003); K.box(M.paint, ...(sd > 0 ? [L / 2, L / 2 + 0.006] : [-L / 2 - 0.006, -L / 2]), 0.06, 0.1, -D / 2, D / 2, band, 0.003); }
  const rg = (sd, half, k) => (sd > 0 ? [half - k, half + 0.006] : [-half - 0.006, -half + k]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [0.0, H - 0.08]) K.box(M.gold, ...rg(sx, L / 2, 0.07), y, y + 0.08, ...rg(sz, D / 2, 0.07), brass, 0.006);
  for (const sd of [-1, 1]) { K.box(M.paint, sd * (L / 2 + 0.006) - 0.008, sd * (L / 2 + 0.006) + 0.008, 0.3, 0.36, -0.12, 0.12, 0x3a2418, 0.005); K.put(M.gold, tor(0.06, 0.01, 5, 12, Math.PI), sd * (L / 2 + 0.02), 0.33, 0, 0, Math.PI / 2, Math.PI, 1, 1, 1, brass); }
  K.box(M.gold, -0.07, 0.07, H - 0.13, H - 0.01, D / 2, D / 2 + 0.012, brass, 0.006);
  K.build(G);
  // lid (pivot at the back top edge)
  const lidP = new THREE.Group(); lidP.position.set(0, H, -D / 2); G.add(lidP); const KL = new Kit(), LH = 0.07;
  KL.box(M2.trunkWood, -L / 2 - 0.006, L / 2 + 0.006, LH - t, LH, 0, D + 0.008, wd, 0.012, 0.5);
  KL.box(M2.trunkWood, -L / 2 - 0.006, L / 2 + 0.006, 0, LH, D - t + 0.008, D + 0.008, wd, 0.01, 0.5); KL.box(M2.trunkWood, -L / 2 - 0.006, L / 2 + 0.006, 0, LH, -0.002, t, wd, 0.01, 0.5);
  for (const sd of [-1, 1]) KL.box(M2.trunkWood, ...(sd > 0 ? [L / 2 + 0.006 - t, L / 2 + 0.006] : [-L / 2 - 0.006, -L / 2 - 0.006 + t]), 0, LH, 0, D + 0.008, wd, 0.01, 0.5);
  KL.put(M2.lining, plane(L - 2 * t, D - 2 * t), 0, LH - t - 0.001, D / 2, Math.PI / 2, 0, 0);
  for (const x of [-0.3, 0.3]) { KL.box(M.paint, x - 0.03, x + 0.03, LH, LH + 0.006, -0.004, D + 0.012, band, 0.003); KL.box(M.paint, x - 0.03, x + 0.03, 0, LH, D + 0.008, D + 0.014, band, 0.003); }
  KL.box(M.gold, -0.05, 0.05, -0.04, LH, D + 0.008, D + 0.02, brass, 0.005); // hasp
  KL.box(M.paint, -0.12, 0.12, LH, LH + 0.02, D / 2 - 0.04, D / 2 + 0.04, 0x3a2418, 0.008); // leather grip
  KL.build(lidP);
  // false bottom (pivot at the back edge) + its pull tab; the hidden painting underneath; clothes on top
  const FB = 0.17, fbP = new THREE.Group(); fbP.position.set(0, FB, -D / 2 + t); G.add(fbP); const KF = new Kit();
  KF.box(M2.trunkWood, -L / 2 + t + 0.004, L / 2 - t - 0.004, -0.012, 0.0, 0.002, D - 2 * t - 0.004, 0xa87a50, 0.004, 0.4);
  for (const x of [-0.25, 0.25]) KF.box(M2.trunkWood, x - 0.02, x + 0.02, -0.03, -0.012, 0.02, D - 2 * t - 0.03, 0x8a6040, 0.003);
  KF.box(M.paint, -0.04, 0.04, -0.002, 0.004, D - 2 * t - 0.07, D - 2 * t + 0.02, 0x7a2a22, 0.002); // cloth pull tab
  KF.build(fbP);
  // cleats holding the board
  const KC = new Kit(); for (const sd of [-1, 1]) KC.box(M2.trunkWood, sd * (L / 2 - t) - 0.02 * sd - 0.01, sd * (L / 2 - t) + 0.01 - 0.02 * sd, FB - 0.035, FB - 0.012, -D / 2 + t, D / 2 - t, 0x6a4028, 0.003); KC.build(G);
  // the painting: poplar panel, image facing up, long side along x (top of the picture toward -x); a red cloth beneath
  const pg = new THREE.Group(); pg.position.set(0, t + 0.012, 0); G.add(pg);
  mesh(pg, cached('clothW', () => { const g = new THREE.PlaneGeometry(0.9, 0.54, 12, 6), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, 0.012 * Math.sin(x * 19 + y * 7) + (Math.abs(x) > 0.4 ? 0.03 : 0)); } g.computeVertexNormals(); return g; }), M2.redCloth, 0, 0.0, 0, -Math.PI / 2, 0, 0, false);
  mesh(pg, rboxGeo(0.77, 0.03, 0.53, 0.006, 1), M2.panelBack, 0, 0.018, 0);
  const pic = mesh(pg, plane(0.51, 0.75), M2.paintingMat, 0, 0.0335, 0, 0, 0, 0, false); pic.rotation.set(-Math.PI / 2, 0, Math.PI / 2, 'XYZ');
  // clothes on the false bottom (rest on fbP; hidden when the board is lifted) + the same clothes piled on the floor beside the trunk
  const clothes = new THREE.Group(); clothes.position.set(0, FB, 0); G.add(clothes); const KQ = new Kit();
  KQ.box(M.fabric, -0.42, 0.0, 0, 0.06, -0.24, 0.2, 0xf0ece0, 0.02); KQ.box(M.fabric, -0.38, -0.04, 0.06, 0.1, -0.2, 0.16, 0x9ab0c8, 0.02); KQ.box(M.fabric, 0.04, 0.42, 0, 0.07, -0.22, 0.22, 0x5a5a62, 0.02); KQ.box(M.fabric, 0.1, 0.36, 0.07, 0.11, -0.18, 0.1, 0xd8cdb4, 0.02); KQ.build(clothes);
  const pile = new THREE.Group(); pile.position.set(0.82, 0, 0.12); pile.visible = false; G.add(pile); const KP = new Kit();
  KP.cb(M.fabric, 0.44, 0.07, 0.4, 0, 0.035, 0, 0xf0ece0, 0, 0.3, 0.04, 0.02); KP.cb(M.fabric, 0.36, 0.05, 0.32, 0.02, 0.095, 0.02, 0x9ab0c8, 0, -0.2, 0.06, 0.02); KP.cb(M.fabric, 0.4, 0.06, 0.38, -0.03, 0.15, -0.01, 0x5a5a62, 0, 0.5, -0.05, 0.02); KP.build(pile);
  G.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  G.lid = lidP; G.board = fbP; G.clothes = clothes; G.pile = pile; G.painting = pic; G.dims = { L, D, H, FB };
  G.setTrunk = (k) => { lidP.rotation.x = -Math.max(0, Math.min(1, k)) * 1.92; };
  G.setFalseBottom = (k) => { k = Math.max(0, Math.min(1, k)); fbP.rotation.x = -k * 1.42; fbP.position.y = FB + k * 0.04; clothes.visible = k < 0.02; pile.visible = k >= 0.02; };
  return G;
}
function buildAttic(root, ctx) {
  const K = new Kit(), M2 = {}, A = AT;
  M2.wall = toon({ vertexColors: true, map: mkTex(512, 512, atticPaper) });
  M2.plaster = toon({ vertexColors: true, map: mkTex(512, 512, (g, w, h) => plaster(g, w, h)) });
  M2.floor = toon({ vertexColors: true, map: mkTex(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#7a5a42', n: 6, seed: 101, joints: 2 })) });
  M2.ticking = toon({ vertexColors: true, map: mkTex(256, 256, ticking) }); M2.blanket = toon({ vertexColors: true, map: mkTex(256, 256, blanket), side: THREE.DoubleSide });
  M2.rug = toon({ map: mkTex(256, 256, ragRug) }); M2.trunkWood = toon({ vertexColors: true, map: mkTex(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#9a6a40', n: 5, seed: 103, joints: 0, nails: true })) });
  M2.lining = toon({ vertexColors: true, map: mkTex(256, 256, liningTex), side: THREE.DoubleSide }); M2.redCloth = toon({ map: mkTex(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#9a2a2a', folds: 5 })), side: THREE.DoubleSide });
  M2.panelBack = toon({ map: mkTex(256, 256, (g, w, h) => PT.planks(g, w, h, { base: '#b08a5a', n: 3, joints: 0, nails: false })) });
  M2.flame = M.flame; M2.mirror = toon({ color: 0x9aa6c0, emissive: 0x1a2030 }); M2.bulb = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd28a).multiplyScalar(4.5), fog: false });
  M2.paintingTex = mkTex(530, 770, (g, w, h) => drawPortrait(g, 0, 0, w, h, false)); M2.paintingMat = toon({ map: M2.paintingTex });
  M2.paper = toon({ map: mkTex(768, 1100, (g, w, h) => paintNewspaper(g, w, h, { ...HEADLINES[0], seed: 31 })), side: THREE.DoubleSide });
  M2.post = toon({ map: mkTex(256, 180, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9ab8d8'); gr.addColorStop(0.6, '#e8d8a8'); gr.addColorStop(1, '#6a8a5a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#c8b8a0'; g.fillRect(w * 0.55, h * 0.3, w * 0.12, h * 0.45); g.beginPath(); g.arc(w * 0.61, h * 0.3, w * 0.06, Math.PI, 0); g.fill(); g.fillStyle = '#3a5a8a'; g.fillRect(0, h * 0.75, w, h * 0.1); g.fillStyle = '#2a1a1a'; g.font = 'italic bold 22px "DejaVu Serif", serif'; g.fillText('Saluti da Dumenza', 12, h - 12); g.strokeStyle = '#f2ead8'; g.lineWidth = 8; g.strokeRect(0, 0, w, h); }) });
  const wallC = 0xffffff;
  // floor + walls + slope + ceiling
  K.box(M2.floor, A.x0, A.x1, -0.05, 0, A.zb, A.zf, 0xffffff, 0.005, 1.6);
  K.box(M2.wall, A.x0, A.wx0, 0, A.knee, A.zb - 0.15, A.zb, wallC, 0.005, 1.4); K.box(M2.wall, A.wx1, A.x1, 0, A.knee, A.zb - 0.15, A.zb, wallC, 0.005, 1.4); K.box(M2.wall, A.wx0, A.wx1, 0, A.wy0, A.zb - 0.15, A.zb, wallC, 0.005, 1.4);
  for (const sd of [-1, 1]) { const x = sd > 0 ? A.x1 : A.x0; K.put(M2.wall, profGeo('atticSide', [[A.zb, 0], [A.zf, 0], [A.zf, A.ceil], [A.zs, A.ceil], [A.zb, A.knee]], 0.12, 0), x + sd * 0.06, 0, 0, 0, 0, 0, 1, 1, 1, wallC); }
  const sl = (x0, x1, y0, y1) => { const za = A.zb + (y0 - A.knee) / (A.ceil - A.knee) * (A.zs - A.zb), zb = A.zb + (y1 - A.knee) / (A.ceil - A.knee) * (A.zs - A.zb); slab(K, M2.plaster, x0, x1, [y0, za], [y1, zb], 0.1, 0xf2ead8, 1.6, 0.005, 1); };
  sl(A.x0, A.wx0, A.knee, A.ceil); sl(A.wx1, A.x1, A.knee, A.ceil); sl(A.wx0, A.wx1, A.wy1, A.ceil);
  K.box(M2.plaster, A.x0, A.x1, A.ceil, A.ceil + 0.1, A.zs - 0.05, A.zf, 0xf2ead8, 0.005, 1.6);
  // dormer alcove: cheeks, little ceiling, window frame + casements (one ajar), sill
  const zTop = A.zb + (A.wy1 - A.knee) / (A.ceil - A.knee) * (A.zs - A.zb);
  for (const x of [A.wx0, A.wx1]) K.put(M2.plaster, profGeo('cheek', [[A.zb - 0.02, A.knee - 0.05], [A.zb - 0.02, A.wy1 + 0.02], [zTop + 0.02, A.wy1 + 0.02]], 0.06, 0), x, 0, 0, 0, 0, 0, 1, 1, 1, 0xece2cc);
  K.box(M2.plaster, A.wx0, A.wx1, A.wy1, A.wy1 + 0.05, A.zb - 0.05, zTop + 0.02, 0xece2cc, 0.005);
  K.box(M.wood, A.wx0 - 0.03, A.wx1 + 0.03, A.wy0 - 0.04, A.wy0, A.zb - 0.1, A.zb + 0.14, 0xd8d0c0, 0.01); // sill
  const fr = 0xe6e0d2; K.box(M.paint, A.wx0, A.wx1, A.wy0, A.wy0 + 0.05, A.zb - 0.08, A.zb - 0.03, fr, 0.008); K.box(M.paint, A.wx0, A.wx1, A.wy1 - 0.05, A.wy1, A.zb - 0.08, A.zb - 0.03, fr, 0.008);
  for (const x of [A.wx0, A.wx1 - 0.05]) K.box(M.paint, x, x + 0.05, A.wy0, A.wy1, A.zb - 0.08, A.zb - 0.03, fr, 0.008);
  // left casement closed (glazing bars), right casement swung in
  K.box(M.paint, 0.47, 0.5, A.wy0, A.wy1, A.zb - 0.08, A.zb - 0.04, fr, 0.005); for (const y of [1.21, 1.58]) K.box(M.paint, A.wx0, 0.5, y - 0.015, y + 0.015, A.zb - 0.07, A.zb - 0.05, fr, 0.004);
  K.at(A.wx1 - 0.03, 0, A.zb - 0.06, 0.95, () => { K.box(M.paint, -0.44, -0.4, A.wy0 + 0.04, A.wy1 - 0.04, -0.015, 0.015, fr, 0.005); K.box(M.paint, -0.04, 0, A.wy0 + 0.04, A.wy1 - 0.04, -0.015, 0.015, fr, 0.005); for (const y of [A.wy0 + 0.06, 1.21, 1.58, A.wy1 - 0.06]) K.box(M.paint, -0.44, 0, y - 0.015, y + 0.015, -0.012, 0.012, fr, 0.004); });
  // ---- iron bed along the left wall (head at the back)
  const bx0 = A.x0 + 0.06, bx1 = bx0 + 0.95, bz0 = A.zb + 0.1, bz1 = bz0 + 1.95, iron = 0x2a2a32;
  for (const [z, hh] of [[bz0, 1.0], [bz1, 0.8]]) { for (const x of [bx0, bx1]) { K.put(M.iron, cyl(0.022, 0.022, hh, 8), x, hh / 2, z, 0, 0, 0, 1, 1, 1, iron); K.put(M.gold, sph(0.035, 8, 6), x, hh + 0.02, z, 0, 0, 0, 1, 1, 1, 0xc8a050); }
    K.beam(M.iron, [bx0, hh - 0.05, z], [bx1, hh - 0.05, z], 0.014, iron, true, 6); K.beam(M.iron, [bx0, 0.42, z], [bx1, 0.42, z], 0.014, iron, true, 6);
    for (let k = 1; k < 7; k++) K.beam(M.iron, [bx0 + k * (bx1 - bx0) / 7, 0.42, z], [bx0 + k * (bx1 - bx0) / 7, hh - 0.05, z], 0.008, iron, true, 5);
    K.put(M.iron, tor(0.12, 0.009, 4, 16), (bx0 + bx1) / 2, hh - 0.22, z, 0, 0, 0, 1, 1, 1, iron); }
  for (const x of [bx0, bx1]) K.beam(M.iron, [x, 0.36, bz0], [x, 0.36, bz1], 0.018, iron, true, 6);
  K.box(M2.ticking, bx0 + 0.02, bx1 - 0.02, 0.36, 0.52, bz0 + 0.02, bz1 - 0.02, 0xffffff, 0.06, 0.6, 2);
  K.put(M.fabric, cyl(0.12, 0.12, 0.7, 12), (bx0 + bx1) / 2, 0.6, bz0 + 0.24, 0, 0, Math.PI / 2, 1, 0.55, 1, 0xf0eadc);
  K.box(M2.blanket, bx0 - 0.04, bx1 + 0.04, 0.5, 0.58, bz0 + 0.55, bz1 + 0.02, 0xffffff, 0.04, 1, 2); K.cb(M2.blanket, 0.98, 0.1, 0.32, (bx0 + bx1) / 2, 0.6, bz0 + 0.62, 0xffffff, 0.3, 0, 0.04, 0.04, 1);
  K.put(M2.blanket, plane(1.36, 0.36), bx1 + 0.045, 0.36, bz0 + 1.25, 0, Math.PI / 2, 0); // blanket hanging over the side
  // shoes under the bed
  for (const dz of [0, 0.13]) K.cb(M.paint, 0.11, 0.08, 0.26, bx1 + 0.12, 0.04, bz1 - 0.4 + dz, 0x2a1a14, 0, 0.2, 0, 0.03);
  // ---- nightstand by the bed head: candle in an enamel chamberstick, wine bottle, glass
  const nx = bx1 + 0.28, nz = A.zb + 0.32; K.box(M.wood, nx - 0.22, nx + 0.22, 0, 0.62, nz - 0.2, nz + 0.2, 0x7a5032, 0.01); K.box(M.wood, nx - 0.24, nx + 0.24, 0.62, 0.66, nz - 0.22, nz + 0.22, 0x8a5a3a, 0.01); K.box(M.paint, nx - 0.18, nx + 0.18, 0.4, 0.55, nz + 0.2, nz + 0.21, 0x6a4028, 0.005); K.put(M.gold, sph(0.015, 6, 4), nx, 0.48, nz + 0.22);
  K.put(M.marble, cyl(0.07, 0.075, 0.02, 14), nx - 0.06, 0.67, nz + 0.05, 0, 0, 0, 1, 1, 1, 0xf2f0ea); K.put(M.marble, cyl(0.025, 0.03, 0.04, 10), nx - 0.06, 0.7, nz + 0.05, 0, 0, 0, 1, 1, 1, 0xf2f0ea);
  K.put(M.marble, cyl(0.016, 0.016, 0.13, 10), nx - 0.06, 0.785, nz + 0.05, 0, 0, 0, 1, 1, 1, 0xf6efdc); K.put(M2.flame, sph(0.012, 8, 6), nx - 0.06, 0.865, nz + 0.05, 0, 0, 0, 1, 2.0, 1, 0xffffff); K.put(M.paint, cyl(0.002, 0.002, 0.02, 4), nx - 0.06, 0.855, nz + 0.05, 0, 0, 0, 1, 1, 1, 0x1a1010);
  K.put(M.paint, cyl(0.035, 0.038, 0.22, 12), nx + 0.1, 0.77, nz - 0.06, 0, 0, 0, 1, 1, 1, 0x1e3a24); K.put(M.paint, cyl(0.013, 0.03, 0.08, 10), nx + 0.1, 0.92, nz - 0.06, 0, 0, 0, 1, 1, 1, 0x1e3a24); K.put(M.paint, cyl(0.03, 0.025, 0.08, 10), nx + 0.02, 0.7, nz - 0.1, 0, 0, 0, 1, 1, 1, 0xb8c0c8);
  // ---- wash stand (right wall) with basin, jug, towel, mirror, soap
  const wx = A.x1 - 0.28, wz = -0.3; K.box(M.wood, wx - 0.24, wx + 0.24, 0, 0.78, wz - 0.4, wz + 0.4, 0x7a5032, 0.012); K.box(M.marble, wx - 0.26, wx + 0.26, 0.78, 0.81, wz - 0.42, wz + 0.42, 0xe6e0d6, 0.01);
  K.box(M.wood, wx - 0.2, wx - 0.18, 0.1, 0.7, wz - 0.36, wz + 0.36, 0x6a4028, 0.005); K.box(M.wood, wx + 0.18, wx + 0.24, 0.81, 1.0, wz - 0.42, wz + 0.42, 0x7a5032, 0.008);
  K.put(M.marble, lathe('basin', [[0, 0], [0.09, 0], [0.17, 0.06], [0.2, 0.09], [0.21, 0.095]], 18), wx - 0.02, 0.81, wz - 0.06, 0, 0, 0, 1, 1, 1, 0xf4f2ee);
  K.put(M.marble, lathe('jug', [[0, 0], [0.07, 0], [0.09, 0.08], [0.085, 0.18], [0.05, 0.26], [0.055, 0.3], [0.075, 0.33], [0.07, 0.34]], 16), wx - 0.02, 0.81, wz - 0.06, 0, 0, 0, 1, 1, 1, 0xf4f2ee);
  K.put(M.marble, tor(0.05, 0.012, 5, 10, Math.PI), wx - 0.02, 1.0, wz + 0.04, 0, Math.PI / 2, -Math.PI / 2, 1, 1, 1, 0xf4f2ee);
  K.box(M.paint, wx + 0.05, wx + 0.11, 0.82, 0.85, wz + 0.22, wz + 0.32, 0xe8d8a8, 0.01);
  K.beam(M.wood, [wx - 0.24, 0.65, wz - 0.42], [wx - 0.24, 0.65, wz + 0.42], 0.012, 0x6a4028, true); K.put(M.fabric, plane(0.36, 0.4), wx - 0.255, 0.48, wz + 0.05, 0, -Math.PI / 2, 0, 1, 1, 1, 0xf0ece0);
  K.box(M.paint, A.x1 - 0.02, A.x1, 1.15, 1.5, wz - 0.16, wz + 0.16, 0x5a3a24, 0.008); K.put(M2.mirror, plane(0.24, 0.28), A.x1 - 0.021, 1.325, wz, 0, -Math.PI / 2, 0);
  // ---- hooks on the right wall: the white smock + cap
  K.box(M.wood, A.x1 - 0.03, A.x1, 1.62, 1.7, 0.55, 1.45, 0x6a4028, 0.008); for (const z of [0.7, 1.0, 1.3]) K.beam(M.iron, [A.x1 - 0.02, 1.66, z], [A.x1 - 0.1, 1.7, z], 0.008, iron, true, 4);
  K.put(M.fabric, profGeo('smock', [[0, 0], [0.32, 0], [0.26, 0.6], [0.2, 0.9], [-0.2, 0.9], [-0.26, 0.6], [-0.32, 0]], 0.14, 0.03), A.x1 - 0.1, 0.78, 0.98, 0, Math.PI / 2, 0, 1, 1, 1, 0xf2eee4);
  K.put(M.fabric, sph(0.11, 12, 6, ), A.x1 - 0.1, 1.64, 1.32, 0, 0, 0, 1, 0.45, 1, 0x3a3a44);
  // ---- chair (with a jacket over the back), small table under the dormer
  K.at(1.05, 0, 0.05, -0.9, () => { K.box(M.wood, -0.21, 0.21, 0.44, 0.47, -0.2, 0.2, 0x8a5a34, 0.01); for (const [x, z] of [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]]) K.box(M.wood, x - 0.02, x + 0.02, 0, 0.44, z - 0.02, z + 0.02, 0x7a4a2a, 0.006);
    for (const x of [-0.18, 0.18]) K.box(M.wood, x - 0.02, x + 0.02, 0.47, 0.95, -0.2, -0.16, 0x7a4a2a, 0.006); for (const y of [0.7, 0.88]) K.box(M.wood, -0.18, 0.18, y, y + 0.05, -0.2, -0.17, 0x8a5a34, 0.006);
    K.put(M.cloth, profGeo('jacket', [[0, 0], [0.12, 0.02], [0.1, 0.5], [-0.02, 0.52], [-0.08, 0.3]], 0.44, 0.03), 0, 0.45, -0.2, 0, 0, 0, 1, 1, 1, 0x3a3a48); });
  K.box(M.wood, 0.0, 0.9, 0.62, 0.66, -1.75, -1.25, 0x7a5032, 0.01); for (const [x, z] of [[0.04, -1.71], [0.86, -1.71], [0.04, -1.29], [0.86, -1.29]]) K.box(M.wood, x - 0.02, x + 0.02, 0, 0.62, z - 0.02, z + 0.02, 0x6a4028, 0.005);
  K.box(M.paint, 0.12, 0.38, 0.66, 0.74, -1.6, -1.4, 0x5a6a5a, 0.01); K.put(M.paper, plane(0.22, 0.3), 0.6, 0.665, -1.5, -Math.PI / 2, 0.3, 0); K.put(M.paint, cyl(0.004, 0.004, 0.16, 4), 0.62, 0.67, -1.45, 0, 0.5, Math.PI / 2, 1, 1, 1, 0x2a2a2a);
  // ---- glazier's toolbox + bucket by the door side; crate; a bottle on the floor
  K.box(M.wood, 1.0, 1.5, 0, 0.18, 1.6, 1.85, 0x9a7a4a, 0.01); K.beam(M.wood, [1.02, 0.32, 1.72], [1.48, 0.32, 1.72], 0.015, 0x7a5a3a, true); for (const x of [1.02, 1.48]) K.box(M.wood, x - 0.01, x + 0.01, 0.18, 0.34, 1.6, 1.85, 0x9a7a4a, 0.004); K.box(M.paint, 1.1, 1.3, 0.18, 0.2, 1.65, 1.8, 0x8a8a90, 0.004);
  K.put(M.paint, cyl(0.15, 0.12, 0.28, 14, true), 1.45, 0.14, 2.3, 0, 0, 0, 1, 1, 1, 0x8a8e96); K.put(M.paint, cyl(0.12, 0.12, 0.01, 14), 1.45, 0.01, 2.3, 0, 0, 0, 1, 1, 1, 0x7a7e86); K.put(M.iron, tor(0.15, 0.006, 4, 16, Math.PI), 1.45, 0.28, 2.3, 0, 0, 0, 1, 1, 1, 0x5a5e66);
  K.box(M.wood, -1.7, -1.2, 0, 0.4, 2.2, 2.65, 0xa88a5a, 0.01); K.box(M.paper, -1.62, -1.28, 0.4, 0.46, 2.26, 2.6, 0xe8dcc0, 0.005);
  // newspaper on the floor by the trunk (the headline!)
  K.put(M2.paper, plane(0.42, 0.6), 0.55, 0.004, 1.3, -Math.PI / 2, 0.5, 0);
  // rag rug, postcard pinned on the wall, a crucifix-free calendar
  K.put(M2.rug, plane(1.2, 0.8), -0.25, 0.003, 0.9, -Math.PI / 2, 0, 0);
  K.put(M2.post, plane(0.15, 0.105), A.x0 + 0.005, 1.25, 0.4, 0, Math.PI / 2, 0);
  // single bare bulb on a twisted flex
  K.beam(M.paint, [0.25, A.ceil, -0.2], [0.25, 1.98, -0.2], 0.005, 0x3a2a24, true, 4); K.put(M.paint, cyl(0.018, 0.018, 0.05, 10), 0.25, 1.96, -0.2, 0, 0, 0, 1, 1, 1, 0x5a4a3a); K.put(M.paint, cyl(0.03, 0.03, 0.02, 10), 0.25, A.ceil - 0.005, -0.2, 0, 0, 0, 1, 1, 1, 0xd8d0c0);
  K.put(M2.bulb, sph(0.035, 12, 10), 0.25, 1.9, -0.2, 0, 0, 0, 1, 1.3, 1, 0xffffff);
  // ceiling beam + skirting
  K.box(M.wood, A.x0, A.x1, A.ceil - 0.14, A.ceil, 0.6, 0.78, 0x6a4a30, 0.01);
  K.box(M.wood, A.x0, A.x0 + 0.02, 0, 0.12, A.zb, A.zf, 0x5a3a24, 0.005); K.box(M.wood, A.x1 - 0.02, A.x1, 0, 0.12, A.zb, A.zf, 0x5a3a24, 0.005);
  // ---- rooftops outside the dormer: zinc mansards, chimney stacks with pots, a distant dome
  const RR = rng(77);
  for (let i = 0; i < 9; i++) { const z = -5 - i * 3.2 - RR() * 2, x = -6 + RR() * 12, w = 4 + RR() * 6, y = -1.5 + RR() * 1.6;
    slab(K, M.zinc, x - w / 2, x + w / 2, [y, z + 1.2], [y + 1.6, z], 0.1, 0xb8c0cc, 2); K.box(M.zinc, x - w / 2, x + w / 2, y + 1.55, y + 1.65, z - 4, z, 0xb8c0cc, 0.01, 2);
    chimneyStack(K, x + (RR() - 0.5) * w * 0.6, z - 1.8, y + 1.2, y + 2.4 + RR(), 3 + ((RR() * 3) | 0)); }
  K.put(M.marble, sph(4, 20, 10, ), 14, 4.5, -70, 0, 0, 0, 1, 1.15, 1, 0xf2ece4); K.put(M.marble, cyl(4, 4, 4, 20), 14, 2.5, -70, 0, 0, 0, 1, 1, 1, 0xece4dc); K.put(M.marble, cyl(0.6, 0.6, 2, 10), 14, 9.6, -70, 0, 0, 0, 1, 1, 1, 0xf2ece4);
  K.build(root);
  const trunk = buildTrunk(M2); trunk.position.set(-0.25, 0, 1.05); trunk.rotation.y = 0.12; root.add(trunk);
  trunk.setTrunk(0); trunk.setFalseBottom(0);
  // window glass sheen (normal pass hidden)
  const gl = mesh(root, plane(0.42, 1.05), M.glassFx, 0.27, 1.4, A.zb - 0.055, 0, 0, 0, false); ctx.NOND && ctx.NOND.add(gl);
  return { trunk, paintingTex: M2.paintingTex, paperTex: M2.paper.map };
}

// ================================================================= FLORENCE ANTIQUES SHOP (Dec 1913)
// local frame: floor y = 0, room x -3..3, storefront wall at z = -3 (outside = -z), open to +z (camera), ceiling 3.6
const SH = { x0: -3, x1: 3, zb: -3, zf: 4.5, H: 3.6 };
function buildShop(root, ctx) {
  const K = new Kit(), M2 = {}, S = SH;
  M2.cotto = toon({ vertexColors: true, map: mkTex(512, 512, cotto) }); M2.wains = toon({ vertexColors: true, map: mkTex(256, 256, (g, w, h) => wainscot(g, w, h)) });
  M2.intonaco = toon({ vertexColors: true, map: mkTex(512, 512, intonaco) }); M2.forte = toon({ vertexColors: true, map: mkTex(512, 512, pietraForte) }); M2.serena = toon({ vertexColors: true, map: mkTex(256, 256, pietraSerena) });
  M2.beams = toon({ vertexColors: true, map: mkTex(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#5a3a26', n: 4, joints: 1, seed: 111 })) });
  M2.rug = toon({ map: mkTex(512, 512, orientRug) }); M2.globe = toon({ map: mkTex(512, 256, globeTex) }); M2.books = toon({ vertexColors: true, map: mkTex(512, 128, booksTex) });
  M2.paint = [0, 1, 2, 3, 0, 2, 1, 3].map((k, i) => toon({ map: mkTex(256, 320, (g, w, h) => oldPainting(g, w, h, k, i + 1)) }));
  M2.plates = [1, 2, 3, 4].map((s) => toon({ map: mkTex(256, 256, (g, w, h) => majolica(g, w, h, s)) }));
  M2.letters = toon({ map: mkTex(1024, 256, (g, w, h) => glassLetters(g, w, h, 'ANTICHITÀ', 'oggetti d’arte')), alphaTest: 0.5, side: THREE.DoubleSide });
  M2.lettersR = toon({ map: mkTex(1024, 256, (g, w, h) => glassLetters(g, w, h, 'QUADRI', 'cornici · stampe')), alphaTest: 0.5, side: THREE.DoubleSide });
  M2.fascia = fasciaMat('ANTICHITÀ', '#2a2e26', '#e8c46a', { fs: 0.62 });
  M2.velvet = toon({ vertexColors: true, map: mkTex(128, 128, (g, w, h) => PT.fabric(g, w, h, { base: '#6a1a24', folds: 2 })) });
  M2.flame = M.flame; M2.lampShade = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe0b0).multiplyScalar(1.5), fog: false });
  M2.winOut = toon({ vertexColors: true, map: mkTex(256, 512, (g, w, h) => windowTex(g, w, h, 4, 5)) });
  const gilt = 0xd8a848, walnut = 0x5a3624;
  // ---- floor, side walls (wainscot + plaster), ceiling with beams
  K.box(M2.cotto, S.x0, S.x1, -0.05, 0, S.zb, S.zf, 0xffffff, 0.005, 1.2);
  for (const sd of [-1, 1]) { const x = sd > 0 ? S.x1 : S.x0, xi = x - sd * 0.0; K.box(M2.wains, Math.min(x, x + sd * 0.15), Math.max(x, x + sd * 0.15), 0, 1.15, S.zb, S.zf, 0xffffff, 0.005, 1.0); K.box(M2.intonaco, Math.min(x, x + sd * 0.15), Math.max(x, x + sd * 0.15), 1.15, S.H, S.zb, S.zf, 0xffffff, 0.005, 2);
    K.box(M.woodDark, Math.min(xi, xi - sd * 0.05), Math.max(xi, xi - sd * 0.05), 1.12, 1.2, S.zb, S.zf, walnut, 0.01); K.box(M.woodDark, Math.min(xi, xi - sd * 0.04), Math.max(xi, xi - sd * 0.04), 0, 0.14, S.zb, S.zf, 0x3a2418, 0.01);
    K.box(M.woodDark, Math.min(xi, xi - sd * 0.08), Math.max(xi, xi - sd * 0.08), S.H - 0.18, S.H - 0.08, S.zb, S.zf, walnut, 0.01); }
  K.box(M2.beams, S.x0, S.x1, S.H, S.H + 0.08, S.zb - 0.4, S.zf, 0xffffff, 0.005, 2);
  for (const x of [-2.2, -0.75, 0.75, 2.2]) K.box(M2.beams, x - 0.11, x + 0.11, S.H - 0.24, S.H, S.zb - 0.3, S.zf, 0xd0b090, 0.02, 2);
  K.box(M2.beams, S.x0, S.x1, S.H - 0.3, S.H, -0.6, -0.36, 0xd0b090, 0.02, 2);
  // ---- storefront wall (z = -3) with two windows and a glazed door; plaster inside, pietra forte outside
  const zW = S.zb, T0 = zW - 0.32, op = [[-2.6, -0.72, 0.6, 2.75], [-0.52, 0.52, 0, 2.6], [0.72, 2.6, 0.6, 2.75]];
  const wallPart = (x0, x1, y0, y1) => { K.box(M2.intonaco, x0, x1, y0, y1, zW - 0.05, zW, 0xf2e2c8, 0.004, 2); K.box(M2.forte, x0, x1, y0, y1, T0, zW - 0.05, 0xffffff, 0.004, 2); };
  wallPart(S.x0, -2.6, 0, S.H); wallPart(-0.72, -0.52, 0, S.H); wallPart(0.52, 0.72, 0, S.H); wallPart(2.6, S.x1, 0, S.H);
  wallPart(-2.6, -0.72, 0, 0.6); wallPart(0.72, 2.6, 0, 0.6); wallPart(-2.6, -0.72, 2.75, S.H); wallPart(0.72, 2.6, 2.75, S.H); wallPart(-0.52, 0.52, 2.6, S.H);
  K.box(M.woodDark, S.x0, S.x1, 0, 0.5, zW, zW + 0.04, walnut, 0.01); // inner skirting / wainscot under windows
  for (const [x0, x1, y0, y1] of op) { // frames, mullions, glass
    const fc = 0x2a3a2c; K.box(M.paint, x0, x1, y1 - 0.08, y1, T0 + 0.02, zW - 0.02, fc, 0.01); for (const x of [x0, x1 - 0.08]) K.box(M.paint, x, x + 0.08, y0, y1, T0 + 0.02, zW - 0.02, fc, 0.01);
    if (y0 > 0) { K.box(M.paint, x0, x1, y0, y0 + 0.08, T0 + 0.02, zW - 0.02, fc, 0.01); K.box(M.paint, (x0 + x1) / 2 - 0.03, (x0 + x1) / 2 + 0.03, y0, y1, T0 + 0.12, T0 + 0.18, fc, 0.005); K.box(M.paint, x0, x1, 2.2, 2.25, T0 + 0.12, T0 + 0.18, fc, 0.005);
      K.box(M.woodDark, x0 - 0.05, x1 + 0.05, y0 - 0.04, y0 + 0.02, T0 + 0.1, zW + 0.22, walnut, 0.01); // display sill inside
      const gm = mesh(root, plane(x1 - x0 - 0.16, y1 - y0 - 0.16), M.glassFx, (x0 + x1) / 2, (y0 + y1) / 2, T0 + 0.15, 0, 0, 0, false); ctx.NOND && ctx.NOND.add(gm); }
  }
  // gilt glass lettering (reads from the street) on the two windows
  K.put(M2.letters, plane(1.7, 0.42), -1.66, 2.0, T0 + 0.145, 0, Math.PI, 0); K.put(M2.lettersR, plane(1.7, 0.42), 1.66, 2.0, T0 + 0.145, 0, Math.PI, 0);
  // door: walnut frame, glazed upper half (ajar slightly), brass handle, shop bell on a spring
  K.at(-0.48, 0, T0 + 0.16, 0.22, () => { K.box(M.woodDark, 0, 0.96, 0.02, 2.52, -0.03, 0.03, walnut, 0.01); K.box(M.woodDark, 0.12, 0.84, 0.15, 1.0, 0.03, 0.05, 0x6a4430, 0.01); K.put(M.glassFx, plane(0.7, 1.2), 0.48, 1.75, 0.035); K.box(M.woodDark, 0.1, 0.86, 1.1, 1.14, 0.03, 0.05, walnut, 0.005); K.put(M.gold, sph(0.035, 8, 6), 0.86, 1.05, 0.07, 0, 0, 0, 1, 1, 1, gilt); });
  K.beam(M.iron, [0.3, 2.62, zW + 0.02], [0.3, 2.62, zW + 0.22], 0.008, 0x2a2a2a, true); K.put(M.gold, lathe('bell', [[0, 0], [0.05, 0], [0.045, 0.03], [0.03, 0.07], [0, 0.08]], 12), 0.3, 2.48, zW + 0.22, 0, 0, 0, 1, 1, 1, gilt);
  // ---- outside: shopfront fascia "ANTICHITÀ", pilasters, pietra serena door frame, upper floors with green persiane, eaves; pavement; the house opposite
  K.box(M.woodDark, -2.8, 2.8, 2.8, 3.45, T0 - 0.18, T0, 0x2a2e26, 0.02); K.put(M2.fascia, plane(5.3, 0.55), 0, 3.12, T0 - 0.185, 0, Math.PI, 0); K.box(M.woodDark, -2.9, 2.9, 3.45, 3.56, T0 - 0.26, T0, 0x1e221c, 0.02);
  for (const x of [-2.75, -0.62, 0.62, 2.75]) { K.box(M.woodDark, x - 0.1, x + 0.1, 0, 2.8, T0 - 0.12, T0, 0x2a2e26, 0.015); K.box(M.gold, x - 0.02, x + 0.02, 0.3, 2.6, T0 - 0.125, T0 - 0.12, gilt, 0.004); }
  K.box(M2.forte, S.x0 - 3, S.x1 + 3, S.H, 13, T0 - 0.02, T0 + 0.3, 0xffffff, 0.01, 2); K.box(M2.forte, S.x0 - 3, S.x0, 0, S.H, T0 - 0.02, T0 + 0.3, 0xffffff, 0.01, 2); K.box(M2.forte, S.x1, S.x1 + 3, 0, S.H, T0 - 0.02, T0 + 0.3, 0xffffff, 0.01, 2);
  for (const fy of [4.6, 8.2]) { K.box(M2.serena, S.x0 - 3, S.x1 + 3, fy - 0.15, fy, T0 - 0.14, T0, 0xffffff, 0.01, 1); for (const x of [-3.6, -1.2, 1.2, 3.6]) { K.put(M2.winOut, plane(1.0, 1.9), x, fy + 1.15, T0 - 0.03, 0, Math.PI, 0); K.box(M2.serena, x - 0.62, x + 0.62, fy + 0.12, fy + 0.2, T0 - 0.14, T0, 0xffffff, 0.01, 1); K.box(M2.serena, x - 0.62, x + 0.62, fy + 2.1, fy + 2.22, T0 - 0.12, T0, 0xffffff, 0.01, 1); for (const sd of [-1, 1]) K.box(M2.serena, x + sd * 0.56 - 0.06, x + sd * 0.56 + 0.06, fy + 0.2, fy + 2.1, T0 - 0.1, T0, 0xffffff, 0.01, 1); } }
  K.box(M.woodDark, S.x0 - 3, S.x1 + 3, 12.0, 12.2, T0 - 1.4, T0 + 0.2, 0x4a3020, 0.02); for (let x = S.x0 - 2.8; x < S.x1 + 3; x += 0.5) K.box(M.woodDark, x - 0.05, x + 0.05, 11.85, 12.0, T0 - 1.3, T0, 0x3a2418, 0.01);
  K.box(M2.serena, S.x0 - 6, S.x1 + 6, -0.05, 0.02, -11, T0, 0xc8c4b8, 0.005, 1.2);
  K.box(M2.forte, -12, 12, 0, 14, -12.5, -11, 0xf0e0c8, 0.01, 2); for (const x of [-6, -3.6, -1.2, 1.2, 3.6, 6]) for (const y of [0.8, 4.6, 8.2]) { K.put(M2.winOut, plane(1.0, y < 1 ? 2.2 : 1.9), x, y + 1.15, -10.99); K.box(M2.serena, x - 0.6, x + 0.6, y + 0.08, y + 0.18, -11, -10.86, 0xffffff, 0.01, 1); }
  K.box(M.woodDark, -12, 12, 13.2, 13.4, -11, -9.6, 0x4a3020, 0.02);
  // ---- glass display counter (right of centre): walnut base, brass-edged glass case, jewellery, coins, a pocket watch
  const cx0 = -0.1, cx1 = 2.3, cz0 = -0.35, cz1 = 0.35, ch = 0.88;
  K.box(M.woodDark, cx0, cx1, 0.0, ch, cz0, cz1, walnut, 0.015); for (let k = 0; k < 3; k++) { const a = cx0 + 0.1 + k * (cx1 - cx0 - 0.2) / 3, b = a + (cx1 - cx0 - 0.2) / 3 - 0.08; K.box(M.woodDark, a, b, 0.14, ch - 0.12, cz1, cz1 + 0.02, 0x6a4430, 0.01); K.box(M.gold, a + 0.04, b - 0.04, 0.2, 0.22, cz1 + 0.02, cz1 + 0.025, gilt, 0.003); }
  K.box(M.woodDark, cx0 - 0.03, cx1 + 0.03, 0.0, 0.08, cz0 - 0.03, cz1 + 0.03, 0x3a2418, 0.01); K.box(M.woodDark, cx0 - 0.02, cx1 + 0.02, ch, ch + 0.04, cz0 - 0.02, cz1 + 0.02, walnut, 0.01);
  K.box(M2.velvet, cx0 + 0.04, cx1 - 0.04, ch + 0.04, ch + 0.06, cz0 + 0.04, cz1 - 0.04, 0xffffff, 0.005);
  const ct = ch + 0.34; for (const [x, z] of [[cx0, cz0], [cx1, cz0], [cx0, cz1], [cx1, cz1]]) K.box(M.gold, x - 0.015, x + 0.015, ch + 0.04, ct, z - 0.015, z + 0.015, gilt, 0.004);
  for (const z of [cz0, cz1]) { K.beam(M.gold, [cx0, ct, z], [cx1, ct, z], 0.012, gilt); K.beam(M.gold, [cx0, ch + 0.05, z], [cx1, ch + 0.05, z], 0.012, gilt); } for (const x of [cx0, cx1]) K.beam(M.gold, [x, ct, cz0], [x, ct, cz1], 0.012, gilt);
  for (const g of [mesh(root, plane(cx1 - cx0, 0.3), M.glassFx, (cx0 + cx1) / 2, ch + 0.2, cz1, 0, 0, 0, false), mesh(root, plane(cx1 - cx0, cz1 - cz0), M.glassFx, (cx0 + cx1) / 2, ct, 0, -Math.PI / 2, 0, 0, false)]) ctx.NOND && ctx.NOND.add(g);
  { const RJ = rng(121); for (let k = 0; k < 16; k++) { const x = cx0 + 0.15 + RJ() * (cx1 - cx0 - 0.3), z = cz0 + 0.1 + RJ() * 0.5, y = ch + 0.06, t = k % 4;
    if (t === 0) K.put(M.gold, cyl(0.025, 0.025, 0.006, 14), x, y + 0.003, z, 0, 0, 0, 1, 1, 1, gilt); else if (t === 1) K.put(M.gold, tor(0.018, 0.005, 5, 12), x, y + 0.005, z, Math.PI / 2, 0, 0, 1, 1, 1, gilt);
    else if (t === 2) K.box(M2.velvet, x - 0.05, x + 0.05, y, y + 0.04, z - 0.04, z + 0.04, 0x2a3a6a, 0.01); else K.put(M.marble, sph(0.025, 10, 8), x, y + 0.02, z, 0, 0, 0, 1, 0.6, 1, [0xe8e0d0, 0xc84a4a, 0x4a8a6a][k % 3]); }
    K.put(M.gold, cyl(0.04, 0.04, 0.012, 18), 0.5, ch + 0.066, 0.05, 0, 0, 0, 1, 1, 1, gilt); K.put(M.marble, cyl(0.034, 0.034, 0.002, 18), 0.5, ch + 0.073, 0.05, 0, 0, 0, 1, 1, 1, 0xf2ece0); K.put(M.gold, tor(0.012, 0.004, 4, 10), 0.5, ch + 0.07, 0.1, Math.PI / 2, 0, 0, 1, 1, 1, gilt); }
  // oil lamp on the counter: brass base, fount, glowing milk-glass shade, chimney
  const lx = 1.85, lz = -0.12, ly = ct + 0.006; K.put(M.gold, lathe('olamp', [[0, 0], [0.09, 0], [0.08, 0.03], [0.03, 0.06], [0.025, 0.2], [0.07, 0.24], [0.085, 0.3], [0.06, 0.34], [0.03, 0.36], [0, 0.36]], 16), lx, ly, lz, 0, 0, 0, 1, 1, 1, gilt);
  K.put(M2.lampShade, sph(0.11, 16, 10), lx, ly + 0.48, lz, 0, 0, 0, 1, 0.85, 1, 0xffffff); K.put(M.flame, sph(0.018, 8, 6), lx, ly + 0.43, lz, 0, 0, 0, 1, 2, 1, 0xffffff); K.put(M.glassFx, cyl(0.03, 0.035, 0.24, 10, true), lx, ly + 0.58, lz);
  // ledger, scales, magnifier on the counter
  K.box(M.paint, 0.2, 0.55, ct, ct + 0.04, -0.2, 0.05, 0x5a2a20, 0.008); K.box(M.paper, 0.22, 0.53, ct + 0.04, ct + 0.045, -0.18, 0.03, 0xf0e6d0, 0.003);
  K.put(M.gold, cyl(0.07, 0.08, 0.02, 14), 1.2, ct + 0.01, -0.1, 0, 0, 0, 1, 1, 1, gilt); K.put(M.gold, cyl(0.008, 0.008, 0.3, 6), 1.2, ct + 0.17, -0.1, 0, 0, 0, 1, 1, 1, gilt); K.beam(M.gold, [1.0, ct + 0.32, -0.1], [1.4, ct + 0.32, -0.1], 0.006, gilt, true); for (const x of [1.02, 1.38]) K.put(M.gold, cyl(0.06, 0.04, 0.02, 12), x, ct + 0.16, -0.1, 0, 0, 0, 1, 1, 1, gilt);
  // ---- Renaissance bust on a pedestal (left foreground)
  K.at(-2.05, 0, 1.5, 0.5, () => { K.box(M.marble, -0.22, 0.22, 0, 0.08, -0.22, 0.22, 0xd8d0c4, 0.01); K.put(M.marble, cyl(0.15, 0.17, 0.95, 16), 0, 0.55, 0, 0, 0, 0, 1, 1, 1, 0xe2dbcf); K.box(M.marble, -0.2, 0.2, 1.02, 1.08, -0.2, 0.2, 0xd8d0c4, 0.01);
    K.put(M.marble, lathe('bustB', [[0, 0], [0.12, 0], [0.13, 0.04], [0.06, 0.07], [0.22, 0.12], [0.25, 0.22], [0.2, 0.3], [0.08, 0.34], [0, 0.35]], 20), 0, 1.08, 0, 0, 0, 0, 1, 1, 0.62, 0xf0eae0);
    K.put(M.marble, cyl(0.05, 0.055, 0.12, 12), 0, 1.47, 0, 0, 0, 0, 1, 1, 1, 0xf0eae0); K.put(M.marble, sph(0.1, 16, 12), 0, 1.6, 0.01, 0, 0, 0, 0.9, 1.12, 1.0, 0xf2ece2);
    K.put(M.marble, sph(0.104, 14, 10), 0, 1.64, -0.012, 0, 0, 0, 0.94, 1.0, 1.0, 0xe6ded2); K.put(M.marble, cone(0.016, 0.05, 6), 0, 1.59, 0.105, Math.PI / 2 - 0.3, 0, 0, 1, 1, 1, 0xf2ece2);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; K.put(M.marble, sph(0.03, 8, 6), Math.cos(a) * 0.09, 1.7 + Math.sin(k) * 0.01, Math.sin(a) * 0.085 - 0.01, 0, 0, 0, 1, 1, 1, 0xe2dacd); } });
  // ---- floor globe (left, mid)
  K.at(-1.75, 0, -0.9, 0.3, () => { for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3; K.beam(M.woodDark, [Math.cos(a) * 0.28, 0, Math.sin(a) * 0.28], [Math.cos(a) * 0.12, 0.62, Math.sin(a) * 0.12], 0.025, walnut, true, 6); } K.put(M.woodDark, tor(0.36, 0.025, 6, 32), 0, 0.82, 0, Math.PI / 2, 0, 0, 1, 1, 1, walnut); K.beam(M.woodDark, [0, 0.62, 0], [0, 0.82, 0], 0.03, walnut, true); });
  const globe = mesh(root, sph(0.3, 28, 18), M2.globe, -1.75, 1.0, -0.9, 0, 0.6, 0.41); const gring = mesh(root, tor(0.33, 0.012, 6, 36), toon({ color: gilt }), -1.75, 1.0, -0.9, 0, 0.3, 0.41);
  // ---- left wall: salon hang of gilt frames + leaning frames on the floor; cassone with candlesticks
  const frame = (x, y, z, w, h, mt, ry, depth = 0.06, fw = 0.08) => K.at(x, 0, z, ry, () => { K.put(mt, plane(w, h), 0, y, depth * 0.5); for (const sd of [-1, 1]) { K.box(M.gold, sd * (w / 2 + fw / 2) - fw / 2, sd * (w / 2 + fw / 2) + fw / 2, y - h / 2 - fw, y + h / 2 + fw, 0, depth, gilt, 0.012); K.box(M.gold, -w / 2 - fw, w / 2 + fw, sd > 0 ? y + h / 2 : y - h / 2 - fw, sd > 0 ? y + h / 2 + fw : y - h / 2, 0, depth, gilt, 0.012); } K.box(M.gold, -w / 2 - 0.005, w / 2 + 0.005, y - h / 2 - 0.005, y + h / 2 + 0.005, 0, depth * 0.35, 0x8a6a30, 0.004); });
  const LW = S.x0 + 0.15; let pi = 0;
  for (const [z, y, w, h] of [[-2.2, 2.3, 0.6, 0.75], [-1.3, 2.55, 0.9, 0.65], [-1.3, 1.75, 0.5, 0.4], [-0.45, 2.2, 0.55, 0.7], [0.4, 2.6, 0.7, 0.55], [0.4, 1.8, 0.45, 0.45], [1.2, 2.25, 0.5, 0.65], [2.0, 2.4, 0.8, 0.9], [-2.2, 3.2, 0.5, 0.35]]) frame(LW, y, z, w, h, M2.paint[pi++ % M2.paint.length], Math.PI / 2);
  for (const [z, w, h, tilt, k] of [[2.4, 0.9, 1.1, 0.12, 2], [2.55, 0.7, 0.85, 0.16, 5], [2.75, 0.5, 0.6, 0.2, 7]]) K.at(LW + 0.12 + tilt * 0.5, 0, z, Math.PI / 2, () => { K.at(0, 0, 0, 0, () => {}); const m = new THREE.Matrix4().makeRotationX(-tilt); const o = K.M.clone(); K.M.multiply(m); K.put(M2.paint[k], plane(w, h), 0, h / 2 + 0.1, 0.03); for (const sd of [-1, 1]) { K.box(M.gold, sd * (w / 2 + 0.05) - 0.05, sd * (w / 2 + 0.05) + 0.05, 0.05, h + 0.15, 0, 0.05, gilt, 0.01); K.box(M.gold, -w / 2 - 0.1, w / 2 + 0.1, sd > 0 ? h + 0.1 : 0.0, sd > 0 ? h + 0.2 : 0.1, 0, 0.05, gilt, 0.01); } K.M.copy(o); });
  K.at(LW + 0.36, 0, -1.5, Math.PI / 2, () => { K.box(M.woodDark, -0.8, 0.8, 0.0, 0.62, -0.3, 0.3, 0x6a3a22, 0.02); K.box(M.woodDark, -0.84, 0.84, 0.62, 0.68, -0.33, 0.33, 0x5a3020, 0.02); for (const x of [-0.45, 0.45]) { K.box(M.woodDark, x - 0.28, x + 0.28, 0.12, 0.52, 0.3, 0.32, 0x7a4a2a, 0.01); K.box(M.gold, x - 0.24, x + 0.24, 0.16, 0.18, 0.32, 0.325, gilt, 0.003); K.box(M.gold, x - 0.24, x + 0.24, 0.46, 0.48, 0.32, 0.325, gilt, 0.003); } for (const x of [-0.84, 0.84]) K.put(M.woodDark, sph(0.07, 8, 6), x, 0.04, 0.28, 0, 0, 0, 1, 1, 1, 0x3a2418);
    for (const x of [-0.6, 0.6]) { K.put(M.gold, lathe('cstick', [[0, 0], [0.07, 0], [0.06, 0.02], [0.02, 0.05], [0.025, 0.2], [0.015, 0.32], [0.04, 0.34], [0.03, 0.35], [0, 0.35]], 12), x, 0.68, 0, 0, 0, 0, 1, 1, 1, gilt); K.put(M.marble, cyl(0.014, 0.014, 0.12, 8), x, 1.09, 0, 0, 0, 0, 1, 1, 1, 0xf2ead8); }
    K.put(M.marble, lathe('vase', [[0, 0], [0.07, 0], [0.12, 0.08], [0.13, 0.16], [0.07, 0.26], [0.05, 0.3], [0.08, 0.34], [0, 0.34]], 16), 0.05, 0.68, 0, 0, 0, 0, 1, 1, 1, 0x2a4a8a);
    K.box(M2.books, -0.35, -0.12, 0.68, 0.78, -0.12, 0.14, 0xffffff, 0.01, 0.3); });
  // ---- right wall: tall walnut cabinet with plates, vases, books, a clock; frames above
  const RW = S.x1 - 0.15; K.box(M.woodDark, RW - 0.42, RW, 0, 2.7, -2.5, 0.3, walnut, 0.02); K.box(M.woodDark, RW - 0.46, RW, 2.7, 2.82, -2.55, 0.35, 0x3a2418, 0.02);
  for (const y of [0.9, 1.5, 2.1]) K.box(M.woodDark, RW - 0.4, RW - 0.02, y, y + 0.04, -2.45, 0.25, 0x6a4430, 0.01);
  K.box(M.woodDark, RW - 0.42, RW - 0.38, 0, 2.7, -2.5, -2.44, walnut, 0.01); K.box(M.woodDark, RW - 0.42, RW - 0.38, 0, 2.7, 0.24, 0.3, walnut, 0.01);
  K.box(M2.books, RW - 0.38, RW - 0.12, 1.54, 1.82, -2.4, -1.0, 0xffffff, 0.005, 0.3); K.box(M2.books, RW - 0.36, RW - 0.14, 0.94, 1.18, -0.8, 0.2, 0xffffff, 0.005, 0.3);
  for (let k = 0; k < 4; k++) { const z = -2.2 + k * 0.6; K.put(M2.plates[k], cyl(0.17, 0.17, 0.015, 24), RW - 0.25, 2.14 + 0.2, z, 0, Math.PI / 2, Math.PI / 2 - 0.2, 1, 1, 1, 0xffffff); }
  for (let k = 0; k < 3; k++) K.put(M.marble, lathe('vase' + k, [[0, 0], [0.05, 0], [0.09, 0.06 + k * 0.02], [0.09, 0.14 + k * 0.03], [0.04, 0.24 + k * 0.03], [0.05, 0.27 + k * 0.03], [0, 0.27 + k * 0.03]], 14), RW - 0.22, 0.94, -2.2 + k * 0.45, 0, 0, 0, 1, 1, 1, [0xc84a2a, 0x2a4a8a, 0xd8b050][k]);
  K.box(M.woodDark, RW - 0.32, RW - 0.08, 1.54, 1.86, -0.6, -0.3, 0x3a2418, 0.02); K.put(M.gold, cyl(0.09, 0.09, 0.01, 20), RW - 0.33, 1.72, -0.45, 0, 0, Math.PI / 2, 1, 1, 1, 0xf2ead8); K.put(M.gold, tor(0.09, 0.01, 5, 20), RW - 0.33, 1.72, -0.45, 0, Math.PI / 2, 0, 1, 1, 1, gilt);
  for (const [z, y, w, h] of [[0.9, 2.3, 0.7, 0.9], [1.9, 2.5, 0.55, 0.45], [1.9, 1.85, 0.45, 0.5]]) frame(RW, y, z, w, h, M2.paint[pi++ % M2.paint.length], -Math.PI / 2);
  // ---- Renaissance armchair (Dante style, X-frame) + rug + hanging iron lantern
  K.at(-0.75, 0, 0.95, 0.5, () => { for (const sd of [-1, 1]) { K.put(M.woodDark, tor(0.38, 0.03, 5, 16, Math.PI * 0.7), sd * 0.28, 0.42, 0.18, 0, Math.PI / 2, Math.PI * 1.15, 1, 1, 1, walnut); K.put(M.woodDark, tor(0.38, 0.03, 5, 16, Math.PI * 0.7), sd * 0.28, 0.42, -0.18, 0, -Math.PI / 2, Math.PI * 1.15, 1, 1, 1, walnut); K.beam(M.woodDark, [sd * 0.28, 0.72, -0.25], [sd * 0.28, 0.72, 0.25], 0.035, walnut, true); K.put(M.gold, sph(0.035, 8, 6), sd * 0.28, 0.74, 0.27, 0, 0, 0, 1, 1, 1, gilt); }
    K.box(M2.velvet, -0.28, 0.28, 0.44, 0.5, -0.22, 0.22, 0xffffff, 0.03); K.box(M2.velvet, -0.28, 0.28, 0.72, 1.05, -0.27, -0.23, 0xffffff, 0.02); K.box(M.woodDark, -0.3, 0.3, 1.05, 1.1, -0.28, -0.22, walnut, 0.02); });
  K.put(M2.rug, plane(2.6, 1.8), -0.3, 0.004, 1.6, -Math.PI / 2, 0, 0);
  K.beam(M.iron, [0.0, S.H - 0.24, -0.45], [0.0, 2.95, -0.45], 0.01, 0x1d1a20, true, 4);
  K.put(M.iron, cone(0.2, 0.2, 6), 0, 2.92, -0.45, 0, 0, 0, 1, 1, 1, 0x1d1a20); K.put(M2.lampShade, cyl(0.13, 0.1, 0.3, 6), 0, 2.67, -0.45, 0, 0, 0, 1, 1, 1, 0xffffff);
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; K.beam(M.iron, [Math.cos(a) * 0.14, 2.83, -0.45 + Math.sin(a) * 0.14], [Math.cos(a) * 0.11, 2.51, -0.45 + Math.sin(a) * 0.11], 0.012, 0x1d1a20); } K.put(M.iron, cyl(0.12, 0.06, 0.06, 6), 0, 2.5, -0.45, 0, 0, 0, 1, 1, 1, 0x1d1a20);
  // a few things on the floor: umbrella stand, a stack of old prints, an empty carved frame
  K.put(M.paint, cyl(0.12, 0.11, 0.55, 14, true), 2.6, 0.275, 2.3, 0, 0, 0, 1, 1, 1, 0x3a4a5a); for (const [dx, a] of [[0.03, 0.12], [-0.04, -0.1]]) K.beam(M.paint, [2.6 + dx, 0.05, 2.3], [2.6 + dx + Math.sin(a) * 0.3, 0.95, 2.3], 0.018, 0x2a2224, true, 6);
  K.box(M.paper, 1.6, 2.2, 0, 0.14, 1.6, 2.1, 0xe8dcc0, 0.01); K.box(M.paper, 1.65, 2.15, 0.14, 0.18, 1.65, 2.05, 0xd8c8a8, 0.005);
  // easel with a gilt-framed painting by the left window; window-display objects on the sills; frames over the openings
  K.at(-1.1, 0, -1.75, 0.35, () => { for (const sd of [-1, 1]) K.beam(M.woodDark, [sd * 0.32, 0, 0.18], [sd * 0.06, 1.9, 0], 0.025, walnut, true, 6); K.beam(M.woodDark, [0, 1.75, -0.02], [0, 0, -0.55], 0.022, walnut, true, 6); K.box(M.woodDark, -0.38, 0.38, 0.72, 0.76, 0.0, 0.12, walnut, 0.01);
    K.put(M2.paint[1], plane(0.56, 0.72), 0, 1.16, 0.12, -0.08, 0, 0); for (const sd of [-1, 1]) { K.box(M.gold, sd * 0.32 - 0.05, sd * 0.32 + 0.05, 0.74, 1.6, 0.06, 0.13, gilt, 0.012); K.box(M.gold, -0.37, 0.37, sd > 0 ? 1.52 : 0.74, sd > 0 ? 1.6 : 0.82, 0.06, 0.13, gilt, 0.012); } });
  for (const [x, k] of [[-2.35, 0], [-1.95, 1], [-1.0, 2], [1.0, 0], [1.5, 2], [2.3, 1]]) { const y = 0.62, z = zW + 0.08;
    if (k === 0) K.put(M.gold, lathe('cstick', [[0, 0], [0.07, 0], [0.06, 0.02], [0.02, 0.05], [0.025, 0.2], [0.015, 0.32], [0.04, 0.34], [0.03, 0.35], [0, 0.35]], 12), x, y, z, 0, 0, 0, 1, 1, 1, gilt);
    else if (k === 1) K.put(M.marble, lathe('vase', [[0, 0], [0.07, 0], [0.12, 0.08], [0.13, 0.16], [0.07, 0.26], [0.05, 0.3], [0.08, 0.34], [0, 0.34]], 16), x, y, z, 0, 0, 0, 1.2, 1.2, 1.2, 0xc84a2a);
    else { K.put(M.marble, cyl(0.06, 0.08, 0.06, 12), x, y + 0.03, z, 0, 0, 0, 1, 1, 1, 0x7a6a5a); K.put(M.marble, sph(0.06, 10, 8), x, y + 0.2, z, 0, 0, 0, 0.8, 1.8, 0.8, 0xe8e2d6); } }
  K.put(M2.plates[2], cyl(0.16, 0.16, 0.015, 24), 1.25, 0.82, zW + 0.12, Math.PI / 2 - 0.2, 0, 0, 1, 1, 1, 0xffffff); K.put(M2.plates[0], cyl(0.13, 0.13, 0.015, 24), -1.6, 0.78, zW + 0.12, Math.PI / 2 - 0.2, 0, 0, 1, 1, 1, 0xffffff);
  frame(0, 3.12, zW + 0.01, 0.62, 0.36, M2.paint[4], 0, 0.05, 0.07);
  for (const x of [-1.66, 1.66]) frame(x, 3.18, zW + 0.01, 0.5, 0.3, M2.paint[x > 0 ? 6 : 3], 0, 0.05, 0.06);
  K.build(root);
  return { globe, gring };
}

// ================================================================= lights, grades, views
const SET_LIGHT = {
  street: { top: '#6c8cd0', hor: '#ffd3a6', fog: '#ecccac', fogN: 30, fogF: 190, sky: '#b0bcf2', ground: '#6e5468', hemiI: 1.12, fillCol: '#7d8ee0', fillI: 0.42, sunCol: '#ffc480', sunI: 3.3, az: -68, el: 15, disc: '#fff2d0', discSize: 0.003, cloud: '#ffe0c0', cardTint: '#fff2e2', fxTint: '#fff6ea', shafts: 0.8 },
  attic: { top: '#1a1e48', hor: '#d88a6a', fog: '#2a1e2c', fogN: 14, fogF: 110, sky: '#ffc890', ground: '#3a2632', hemiI: 0.55, fillCol: '#6a70c0', fillI: 0.18, sunCol: '#8ea0ff', sunI: 0.45, az: 175, el: 20, disc: '#000000', clouds: false, shadow: false, cardTint: '#ffe8d0', fxTint: '#fff0e0', shafts: 0, aoK: 0.62 },
  shop: { top: '#5a78b8', hor: '#f2caa0', fog: '#cfb8a0', fogN: 25, fogF: 140, sky: '#ffe0b8', ground: '#4a3026', hemiI: 0.75, fillCol: '#8a90c8', fillI: 0.25, sunCol: '#ffd29a', sunI: 2.4, az: 196, el: 20, disc: '#fff0d0', clouds: false, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  shopOut: { top: '#5a78b8', hor: '#f2caa0', fog: '#d8c0a8', fogN: 25, fogF: 140, sky: '#b8c0f0', ground: '#5a4038', hemiI: 0.85, fillCol: '#8a90c8', fillI: 0.3, sunCol: '#ffd29a', sunI: 2.6, az: 150, el: 24, disc: '#fff0d0', clouds: false, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
};
const SET_GRADE = {
  street: { look: 'golden', over: { exp: 1.42, con: 1.2, lift: [0.075, 0.06, 0.07], bloom: [0.4, 0.86], hal: [0.16, '#ff7a40'], tH: ['#ffd0a0', 0.03], vig: [0.18, 0.55, '#6a4a6a'] } },
  attic: { look: 'night', over: { exp: 1.5, con: 1.18, lift: [0.07, 0.05, 0.075], tH: ['#ffb060', 0.1], bloom: [0.44, 0.74], hal: [0.2, '#ff8a3a'], vig: [0.3, 0.45, '#3a2a4a'] } },
  shop: { look: 'office', over: { exp: 1.42, con: 1.2, lift: [0.07, 0.055, 0.06], tH: ['#ffd8b0', 0.03], bloom: [0.38, 0.84], hal: [0.14, '#ff7a40'] } },
  shopOut: { look: 'golden', over: { exp: 1.32, lift: [0.075, 0.06, 0.07], bloom: [0.34, 0.86], hal: [0.12, '#ff7a40'] } },
};
const SET_PRACT = {
  attic: [{ p: [-0.57, 0.95, -1.63], col: '#ffa450', I: 2.2, d: 3.2 }, { p: [0.25, 1.86, -0.2], col: '#ffc27a', I: 2.6, d: 5 }, { p: [0.5, 1.45, -1.55], col: '#7f90e0', I: 1.3, d: 3.2 }, { p: [0.15, 1.25, 1.55], col: '#ffb878', I: 1.7, d: 2.8 }],
  shop: [{ p: [1.8, 2.15, 0.15], col: '#ffb45a', I: 2.2, d: 4 }, { p: [0, 2.62, -0.45], col: '#ffc070', I: 2.4, d: 6 }, { p: [-1.6, 1.8, -2.4], col: '#d8e0ff', I: 1.6, d: 5 }, { p: [0.4, 2.0, 3.0], col: '#ffd8a8', I: 1.2, d: 6 }],
};
export function buildParis(ctx) {
  ({ THREE, toon, mkTex, PT } = ctx); macro = ctx.macro || null; if (ctx.drawMona) monaFn = ctx.drawMona;
  M = materials(); M.flame = M.flame; LAMPS.length = 0;
  const groups = {};
  for (const name of ['street', 'attic', 'shop']) { const g = new THREE.Group(); g.name = 'paris_' + name; g.position.set(...O[name]); g.visible = false; ctx.scene.add(g); groups[name] = g; }
  const st = buildStreet(groups.street, ctx);
  const at = buildAttic(groups.attic, ctx);
  const sh = buildShop(groups.shop, ctx);
  const trunk = at.trunk;
  if (ctx.NOND) for (const k in groups) groups[k].traverse((o) => { if (o.isMesh && (o.material === M.glassFx)) { ctx.NOND.add(o); o.castShadow = false; } });
  // ---- key spots (world coords)
  const kp = st.kiosk.position, tp = trunk.position;
  const spots = {
    streetOrigin: W3('street', [0, 0, 0]), sidewalkY: 0.15, kerbA: 'z = 4.0 (sidewalk A z 0..3.75)', kerbB: 'x = 4.0 (sidewalk B x 0..3.75)',
    kiosk: W3('street', [kp.x, kp.y, kp.z]), kioskFront: W3('street', [kp.x + Math.sin(0.55) * 1.3, 0.15, kp.z + Math.cos(0.55) * 1.3]), kioskFacing: 0.55,
    cafeCorner: W3('street', [-1.5, 0.15, 1.5]), cafeTerrace: W3('street', [-7.5, 0.15, 2.0]), morrisColumn: W3('street', [2.45, 0.15, -9.2]), morrisColumn2: W3('street', [-12.5, 0.15, 12.6]),
    taxi: W3('street', [-12.8, 0, 5.15]), taxiFacing: -Math.PI / 2, boulangerie: W3('street', [-46 + 9 * 43 / 14, 0.15, 0.6]), tabac: W3('street', [-46 + 10.5 * 43 / 14, 0.15, 0.6]),
    roadA: 'cobbles z 4..11 along x', roadB: 'cobbles x 4..11 along z',
    attic: W3('attic', [0, 0, 0]), trunk: W3('attic', [tp.x, 0, tp.z]), trunkTop: W3('attic', [tp.x, 0.57, tp.z]), trunkInside: W3('attic', [tp.x, 0.2, tp.z]), painting: W3('attic', [tp.x, 0.07, tp.z]),
    bed: W3('attic', [-1.26, 0.52, -0.9]), candle: W3('attic', [-0.57, 0.87, -1.63]), bulb: W3('attic', [0.25, 1.9, -0.2]), window: W3('attic', [0.5, 1.4, -2.0]), washstand: W3('attic', [1.52, 0.81, -0.3]), chair: W3('attic', [1.05, 0.46, 0.05]), smock: W3('attic', [1.7, 1.2, 0.98]), standInAttic: W3('attic', [0.3, 0, 1.9]),
    shop: W3('shop', [0, 0, 0]), counter: W3('shop', [1.1, 1.23, 0]), counterFront: W3('shop', [1.1, 0, 0.9]), dealerBehindCounter: W3('shop', [1.1, 0, -0.9]), oilLamp: W3('shop', [1.85, 1.7, -0.12]), bust: W3('shop', [-2.05, 1.6, 1.5]), globe: W3('shop', [-1.75, 1.0, -0.9]), shopDoor: W3('shop', [0, 0, -3.2]), shopStreet: W3('shop', [0, 0, -6.5]),
  };
  const V = (set, p, l, fov, cInf, fp, extra = {}) => { const base = set === 'shopOut' ? 'shop' : set; const c = { set, base, p: W3(base, p), l: W3(base, l), fov, cInf, fp: fp ? W3(base, fp) : null, ...extra }; c.focus = Math.hypot(...[0, 1, 2].map((i) => c.p[i] - (c.fp || c.l)[i])); return c; };
  const views = [
    V('street', [3.2, 1.45, 8.2], [-12.5, 6.4, -0.6], 56, 2.5, [-6.4, 1.6, 2.7]),                                 // 0 street wide: down rue du Cadran, kiosk + café corner
    V('street', [-3.8, 1.42, 3.33], [-5.59, 1.43, 2.88], 42, 5, [-5.59, 1.43, 2.89]),                              // 1 kiosk close-up: headlines
    V('attic', [0.6, 1.58, 3.95], [-0.2, 0.85, -1.0], 60, 3, [-0.25, 0.5, 1.05], { trunk: 0, fb: 0 }),             // 2 attic wide with the trunk
    V('attic', [0.82, 1.38, 0.95], [-0.32, 0.05, 1.08], 50, 5, [-0.25, 0.08, 1.05], { trunk: 1, fb: 1 }),          // 3 trunk open, false bottom lifted, painting revealed (seen along the trunk)
    V('shop', [1.75, 1.62, 3.8], [-2.0, 1.4, -1.5], 58, 3, [-0.6, 1.3, -0.6]),                                       // 4 Florence shop interior (frames wall, bust, globe, counter)
    V('street', [5.5, 1.3, 6.5], [-2.0, 7.5, -2.0], 58, 2.5, [-1.5, 3, -1.5]),                                     // 5 café corner, low, looking up the Haussmann facade
    V('attic', [-0.22, 1.78, 2.4], [-0.25, 0.22, 1.0], 50, 5, [-0.25, 0.3, 1.05], { trunk: 1, fb: 0 }),            // 6 trunk open (clothes, false bottom closed)
    V('shopOut', [0.8, 1.6, -10.2], [0.0, 2.6, -3.3], 55, 3, [0, 2.0, -3.3]),                                      // 7 Florence shop from the street (ANTICHITÀ sign)
    V('street', [-19.2, 1.45, 8.9], [-12.6, 1.2, 4.9], 46, 4, [-12.8, 1.0, 5.15]),                                 // 8 taxi parked at the kerb (front 3/4)
    V('shop', [0.15, 1.42, 2.35], [1.5, 1.22, -0.3], 48, 4, [1.6, 1.25, -0.1]),                                    // 9 the dealer's counter: oil lamp, glass case
  ];
  const API = {
    groups, street: groups.street, attic: groups.attic, shop: groups.shop, origin: O, spots, views,
    kiosk: st.kiosk, cab: st.cab, trunk, globe: sh.globe,
    setTrunk: (t) => trunk.setTrunk(t), setFalseBottom: (t) => trunk.setFalseBottom(t),
    // repaint every newspaper (kiosk, pavement, attic floor) from a list of HEADLINES-style option objects
    setHeadlines(list) { list = list && list.length ? list : HEADLINES; API._headlines = list; st.paperTex.forEach((t, i) => { const c = t.image, g = c.getContext('2d'); paintNewspaper(g, c.width, c.height, { ...HEADLINES[i % HEADLINES.length], ...list[i % list.length], seed: 11 + i }); t.needsUpdate = true; });
      const t = at.paperTex, c = t.image; paintNewspaper(c.getContext('2d'), c.width, c.height, { ...HEADLINES[0], ...list[0], seed: 31 }); t.needsUpdate = true; },
    // supply drawMona(g, w, h): repaints the newspaper portrait slots and the hidden painting
    setMonaDrawer(fn) { monaFn = fn; API.setHeadlines(API._headlines); const t = at.paintingTex, c = t.image, g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); drawPortrait(g, 0, 0, c.width, c.height, false); t.needsUpdate = true; },
    _headlines: null,
    lightFor: (name) => ({ ...LIGHTS_[name === 'street' || name === 'shopOut' ? 'golden' : 'office'], ...SET_LIGHT[name] }),
    gradeFor: (name) => (SET_GRADE[name] || {}).over || {}, lookFor: (name) => (SET_GRADE[name] || {}).look || 'office',
    // show one set (or none). Hides the other sets (1904 road/stadium/office/car, D.C., 1960s rooms) when a set is shown
    show(world, name) { const base = name === 'shopOut' ? 'shop' : name; for (const k in groups) groups[k].visible = k === base;
      if (base) { for (const k of ['road', 'stadium', 'office', 'car', 'dc']) if (world[k]) world[k].visible = false; if (world.rooms) world.rooms.show(world, null); } },
    // drive main.js' 4 pooled PointLights: fixed lamp lists indoors; on the street the 4 gas lamps nearest the target (tgt: THREE.Vector3)
    placeLights(PRACT, name, tgt) { let L;
      if (name === 'street') { const t = tgt ? [tgt.x - O.street[0], tgt.z - O.street[2]] : [0, 0]; L = LAMPS.map((p) => (p[3] === 'kiosk' ? { p: [p[0], p[1], p[2]], col: '#ffc890', I: 3.2, d: 3.5 } : { p: [p[0], p[1] - 0.1, p[2]], col: '#ffbe6a', I: 5, d: 8 })).sort((a, b) => Math.hypot(a.p[0] - t[0], a.p[2] - t[1]) - Math.hypot(b.p[0] - t[0], b.p[2] - t[1])).slice(0, 3); L.push({ p: [-2.0, 2.2, 1.2], col: '#ffb060', I: 3.5, d: 6 }); }
      else L = SET_PRACT[name === 'shopOut' ? 'shop' : name] || [];
      const base = name === 'shopOut' ? 'shop' : name;
      PRACT.forEach((l, i) => { const c = L[i]; l.visible = true; if (!c) { l.intensity = 0; return; } l.position.set(...W3(base, c.p)); l.color.set(c.col); l.intensity = c.I; l.distance = c.d; l.decay = 1.6; }); },
    // test-view helper (main.js ?parisview=N): returns { set, L, look, grade, cam } and sets the trunk state
    view(i) { const c = views[((i % views.length) + views.length) % views.length]; return { set: c.set, base: c.base, trunk: c.trunk ?? 0, fb: c.fb ?? 0, L: API.lightFor(c.set), look: API.lookFor(c.set), grade: API.gradeFor(c.set), cam: { p: c.p, l: c.l, fov: c.fov, focus: c.focus, cInf: c.cInf, roll: c.roll || 0, shadowAt: c.fp || c.l } }; },
    apply(world, v) { API.show(world, v.set); trunk.setTrunk(v.trunk); trunk.setFalseBottom(v.fb); },
  };
  return API;
}
