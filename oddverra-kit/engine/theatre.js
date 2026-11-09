// theatre.js [BOOTH-theatre]: sets for the "Booth saved Lincoln's son" short (Washington 1865, New York 1864, Buffalo 1901, Chicago 1900s).
//   fordsExt : Ford's Theatre, Tenth Street, Washington, night of April 14 1865 (brick 5-arch facade, gas lamps, carriage)  origin (-1600, 0,  400)
//   box      : the theatre interior seen from the audience: gaslit stage, seats, the flag-draped presidential box               origin (-1600, 0,  500)
//   dressing : Edwin Booth's dressing room (mirror + gas sconces, Hamlet costume, prop skull, playbills, letter)              origin (-1600, 0,  600)
//   expo     : 1901 Pan-American Exposition at dusk: Electric Tower, halls + Temple of Music outlined in bulbs, crowd plaza     origin (-1600, 0,  800)
//   study    : Robert Lincoln's study, 1900s (dark wood, desk with a WHITE HOUSE envelope, leather chair, books, lamp)          origin (-1600, 0, 1000)
// Each set is built in a local frame (floor / street y = 0, camera side +z) and placed at its origin. All groups start hidden;
// call show(world, name) to display one. Geometry goes through world.js Kit (rounded boxes merged per material); painters are local
// and follow paint.js rules (calm fills + darker indigo-leaning drawn marks). Violence is never shown: the box set only offers
// setDim(t) (house lights down) and setFigure(t) (a shadowy figure in the dark doorway at the back of the box). No weapons exist here.
import { Kit, rboxGeo, instance } from './world.js';
import { LIGHTS_ } from './story.js';

let THREE, toon, mkTex, PT, macro;
export const THEATRE_ORIGIN = { fordsExt: [-1600, 0, 400], box: [-1600, 0, 500], dressing: [-1600, 0, 600], expo: [-1600, 0, 800], study: [-1600, 0, 1000] };
const O = THEATRE_ORIGIN;
const SETS = Object.keys(O);
const W3 = (name, p) => [p[0] + O[name][0], p[1] + O[name][1], p[2] + O[name][2]];

// ---------------------------------------------------------------- geometry cache + helpers
const GC = new Map();
const cached = (k, mk) => { let g = GC.get(k); if (!g) GC.set(k, (g = mk())); return g; };
const cyl = (rt, rb, h, rs = 12, open = false, t0 = 0, tl = Math.PI * 2) => cached(`c${rt}|${rb}|${h}|${rs}|${open}|${t0}|${tl}`, () => new THREE.CylinderGeometry(rt, rb, h, rs, 1, open, t0, tl));
const sph = (r, ws = 14, hs = 10, p0 = 0, pl = Math.PI * 2, t0 = 0, tl = Math.PI) => cached(`s${r}|${ws}|${hs}|${p0}|${pl}|${t0}|${tl}`, () => new THREE.SphereGeometry(r, ws, hs, p0, pl, t0, tl));
const tor = (r, t, rs = 6, ts = 24, arc = Math.PI * 2) => cached(`t${r}|${t}|${rs}|${ts}|${arc}`, () => new THREE.TorusGeometry(r, t, rs, ts, arc));
const cone = (r, h, rs = 8) => cached(`k${r}|${h}|${rs}`, () => new THREE.ConeGeometry(r, h, rs));
const plane = (w, h) => cached(`p${w}|${h}`, () => new THREE.PlaneGeometry(w, h));
const lathe = (key, pts, n = 20) => cached('la' + key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n));
const capsule = (r, l, a = 4, b = 10) => cached(`cap${r}|${l}|${a}|${b}`, () => new THREE.CapsuleGeometry(r, l, a, b));
// triangular prism: base w (x) on y = 0, apex h, centred depth d along z
const prism = (w, h, d) => cached(`pr${w}|${h}|${d}`, () => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.lineTo(-w / 2, 0); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 2, uv.getY(i) / 2); return g; });
const mesh = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz, 'YXZ'); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
// a wall (local XY, front face z = 0, back z = -depth) with rectangular / round-arched holes. uv in metres / tile
// holes: [cx, y0, w, h, arch] (arch: true = semicircular head, number = segmental rise)
const holeWall = (key, x0, x1, y0, y1, holes, depth = 0.4, tile = 2) => cached('hw' + key, () => {
  const s = new THREE.Shape(); s.moveTo(x0, y0); s.lineTo(x1, y0); s.lineTo(x1, y1); s.lineTo(x0, y1); s.lineTo(x0, y0);
  for (const [cx, hy, w, h, arch] of holes) { const p = new THREE.Path(), a = cx - w / 2, b = cx + w / 2;
    if (arch === true) { const ys = hy + h - w / 2; p.moveTo(a, hy); p.lineTo(b, hy); p.lineTo(b, ys); p.absarc(cx, ys, w / 2, 0, Math.PI, false); p.lineTo(a, hy); }
    else if (arch) { const r = (w * w / 4 + arch * arch) / (2 * arch), ys = hy + h - arch, cy = ys + arch - r, th = Math.asin(w / 2 / r); p.moveTo(a, hy); p.lineTo(b, hy); p.lineTo(b, ys); p.absarc(cx, cy, r, Math.PI / 2 - th, Math.PI / 2 + th, false); p.lineTo(a, hy); }
    else { p.moveTo(a, hy); p.lineTo(b, hy); p.lineTo(b, hy + h); p.lineTo(a, hy + h); p.lineTo(a, hy); }
    s.holes.push(p); }
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 14 }); g.translate(0, 0, -depth);
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / tile, uv.getY(i) / tile); return g;
});
// hanging cloth: plane w x h with vertical folds (amp, n) and a lower hem sag; origin at top centre, hangs down -y, folds bulge +z
const drapeGeo = (w, h, n = 6, amp = 0.05, sag = 0, ws = 24, hs = 8) => cached(`dr${w}|${h}|${n}|${amp}|${sag}`, () => {
  const g = new THREE.PlaneGeometry(w, h, ws, hs), p = g.attributes.position; g.translate(0, -h / 2, 0);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), u = x / w + 0.5, v = -y / h; p.setZ(i, amp * Math.sin(u * Math.PI * 2 * n) * (0.4 + 0.6 * v)); p.setY(i, y - sag * Math.sin(u * Math.PI) * v); }
  g.computeVertexNormals(); return g; });
// bunting swag: straight top edge (width w), lower edge sagging by sag, bulging forward by bulge; v runs top (1) -> bottom (0)
const swagGeo = (w, depth0, sag, bulge = 0.12) => cached(`sw${w}|${depth0}|${sag}|${bulge}`, () => {
  const N = 20, Mv = 6, P = [], U = [], I = [];
  for (let j = 0; j <= Mv; j++) for (let i = 0; i <= N; i++) { const u = i / N, v = j / Mv, s = Math.sin(u * Math.PI); const yb = -depth0 * s - sag * s * s; P.push((u - 0.5) * w, yb * v, bulge * s * Math.sin(v * Math.PI * 0.5 + 0.3)); U.push(u, 1 - v); }
  for (let j = 0; j < Mv; j++) for (let i = 0; i < N; i++) { const a = j * (N + 1) + i, b = a + 1, c = a + N + 1, d = c + 1; I.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); g.computeVertexNormals(); return g; });

// ---------------------------------------------------------------- painters
const css = (...a) => PT.css(...a), shade = (...a) => PT.shade(...a), tint = (...a) => PT.tint(...a), vary = (...a) => PT.vary(...a), rng = (...a) => PT.rng(...a), fbm = (...a) => PT.fbm(...a), modulate = (...a) => PT.modulate(...a), hex = (...a) => PT.hex(...a);
const SERIF = '"DejaVu Serif", Georgia, serif', SANS = '"DejaVu Sans", Arial, sans-serif';
// one line of text centred at (cx, cy), squeezed to maxW. o: { font, bold, italic, col, sh (shadow col), sp (letter spacing), sy }
function txt(g, s, cx, cy, maxW, sz, o = {}) {
  g.save(); g.font = `${o.italic ? 'italic ' : ''}${o.bold === false ? '' : 'bold '}${sz | 0}px ${o.font || SERIF}`; g.textAlign = 'left'; g.textBaseline = 'middle';
  const sp = (o.sp || 0) * sz, ch = [...s], ws = ch.map((c) => g.measureText(c).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (ch.length - 1), sx = Math.min(1, maxW / tot);
  g.translate(cx - tot * sx / 2, cy); g.scale(sx, o.sy || 1);
  const run = (dx, dy, fill) => { let x = 0; g.fillStyle = fill; ch.forEach((c, i) => { g.fillText(c, x + dx, dy); x += ws[i] + sp; }); };
  if (o.sh) run(sz * 0.05, sz * 0.06, o.sh); run(0, 0, o.col || '#2a1d2a'); g.restore();
}
// aged edges
const ageEdges = (g, w, h, k = 0.14, seed = 3) => modulate(g, w, h, (u, v) => { const e = Math.min(u, 1 - u, v, 1 - v), a = 1 - k * (1 - Math.min(1, e * 10)) - 0.06 * fbm(u, v, 3, 3, 3, seed); return [a, a * 0.98, a * 0.93]; });
// period letterpress playbill. o.lines: [[text, size(frac of h), {col, italic, font, bold, sp}], ...] ('-' = rule, '~' = ornament)
export function paintPlaybill(g, w, h, o = {}) {
  PT.paper(g, w, h, { base: o.paper || '#efe2c2', seed: o.seed || 5 });
  const ink = o.ink || '#231a24', red = o.red || '#a8242a', m = w * 0.06;
  g.strokeStyle = ink; g.lineWidth = w * 0.012; g.strokeRect(m * 0.6, m * 0.6, w - m * 1.2, h - m * 1.2); g.lineWidth = w * 0.004; g.strokeRect(m, m, w - 2 * m, h - 2 * m);
  const lines = o.lines || []; const tot = lines.reduce((a, l) => a + (typeof l === 'string' ? 0.03 : l[1] * 1.22), 0); let y = m * 1.5 + Math.max(0, (h - 3 * m - tot * h) / 2);
  for (const l of lines) {
    if (l === '-') { g.fillStyle = ink; g.fillRect(w * 0.18, y + h * 0.008, w * 0.64, h * 0.004); y += h * 0.03; continue; }
    if (l === '~') { g.fillStyle = ink; for (let k = -2; k <= 2; k++) { g.beginPath(); g.arc(w / 2 + k * w * 0.05, y + h * 0.012, k ? w * 0.007 : w * 0.012, 0, 7); g.fill(); } g.fillRect(w * 0.22, y + h * 0.011, w * 0.17, h * 0.002); g.fillRect(w * 0.61, y + h * 0.011, w * 0.17, h * 0.002); y += h * 0.03; continue; }
    const [t, sz, so = {}] = l; const col = so.col === 'red' ? red : so.col || ink; txt(g, t, w / 2, y + sz * h * 0.6, w - 2.6 * m, sz * h, { ...so, col }); y += sz * h * 1.22;
  }
  if (o.wear !== false) PT.inkWear(g, m, m, w - 2 * m, h - 2 * m, o.seed || 5, 0.6);
  ageEdges(g, w, h, 0.18, (o.seed || 5) + 2);
  if (o.torn) { g.fillStyle = o.torn; g.beginPath(); g.moveTo(w, h); g.lineTo(w * 0.78, h); g.lineTo(w * 0.86, h * 0.95); g.lineTo(w * 0.93, h * 0.97); g.lineTo(w, h * 0.88); g.fill(); }
}
export const PLAYBILLS = {
  cousin: { seed: 7, lines: [["FORD'S THEATRE", 0.07, { sp: 0.06 }], ['TENTH STREET, ABOVE E', 0.03, { bold: false }], '-', ['FRIDAY EVENING, APRIL 14th, 1865', 0.035, {}], '~', ['BENEFIT', 0.05, { col: 'red', sp: 0.1 }], ['and LAST NIGHT of', 0.03, { italic: true, bold: false }], ['MISS LAURA KEENE', 0.06, {}], '-', ["TOM TAYLOR'S CELEBRATED ECCENTRIC COMEDY", 0.026, { font: SANS }], ['OUR', 0.06, { col: 'red' }], ['AMERICAN', 0.085, { col: 'red', font: SANS, sy: 1.1 }], ['COUSIN', 0.085, { col: 'red', font: SANS, sy: 1.1 }], '~', ['Doors open at 7 — Curtain rises at 8', 0.028, { italic: true, bold: false }]] },
  hamlet: { seed: 9, lines: [['WINTER GARDEN', 0.06, { sp: 0.05 }], ['BROADWAY', 0.03, { bold: false }], '~', ['EDWIN BOOTH', 0.1, { col: 'red', font: SANS, sy: 1.1 }], ['as', 0.05, { italic: true, bold: false }], ['HAMLET', 0.13, { font: SANS, sy: 1.15 }], '-', ['ONE HUNDRED NIGHTS', 0.04, { col: 'red' }], ['PRINCE OF DENMARK', 0.03, { bold: false }], '~', ['Every Evening at 8 o’clock', 0.03, { italic: true, bold: false }]] },
  hamlet2: { seed: 13, paper: '#e9dcc0', lines: [['EDWIN BOOTH', 0.09, { font: SANS }], ['as', 0.05, { italic: true, bold: false }], ['HAMLET', 0.16, { col: 'red', font: SANS, sy: 1.1 }], '-', ['THE TRAGEDY OF', 0.03, { bold: false }], ['HAMLET, PRINCE OF DENMARK', 0.035, {}], '~', ['Season of 1864', 0.035, { italic: true }]] },
  richelieu: { seed: 17, paper: '#e6d6b4', lines: [['EDWIN BOOTH', 0.08, { font: SANS }], ['IN', 0.04, {}], ['RICHELIEU', 0.12, { col: 'red', font: SANS }], '-', ['BULWER’S GREAT PLAY', 0.035, {}], '~'] },
};
// 35-star flag (April 1865): 13 stripes, blue canton, stars in 5 rows of 7, cloth folds
function flagTex(g, w, h, o = {}) {
  const sh = h / 13; for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#efe6d6' : '#b02a30'; g.fillRect(0, i * sh, w, sh + 1); }
  const cw = w * 0.42, ch = sh * 7; g.fillStyle = '#26306a'; g.fillRect(0, 0, cw, ch); g.fillStyle = '#f4ecda';
  const star = (x, y, r) => { g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.42 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); };
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) star((c + 0.5 + (r % 2 ? 0.25 : -0.1)) * cw / 7.2, (r + 0.6) * ch / 5.3, Math.min(cw, ch) * 0.045);
  const nf = o.folds ?? 4; modulate(g, w, h, (u, v) => 0.86 + 0.16 * Math.sin((o.vert ? v : u) * Math.PI * 2 * nf + Math.sin((o.vert ? u : v) * 5) * 0.8) + 0.04 * fbm(u, v, 4, 4, 2, 9));
}
// bunting: blue starred band on top, then red / white / red bands (v = 0 bottom)
function buntingTex(g, w, h) {
  const bands = [['#26306a', 0.34], ['#efe6d6', 0.22], ['#b02a30', 0.22], ['#efe6d6', 0.1], ['#b02a30', 0.12]]; let y = 0;
  for (const [c, f] of bands) { g.fillStyle = c; g.fillRect(0, y, w, f * h + 1); y += f * h; }
  g.fillStyle = '#f4ecda'; for (let x = w / 24; x < w; x += w / 12) { g.beginPath(); g.arc(x, h * 0.17, h * 0.045, 0, 7); g.fill(); }
  g.fillStyle = '#d8b050'; g.fillRect(0, h * 0.965, w, h * 0.035);
  modulate(g, w, h, (u, v) => 0.88 + 0.14 * Math.sin(u * Math.PI * 2 * 9) * (0.3 + 0.7 * v) + 0.03 * fbm(u, v, 4, 2, 2, 5));
}
// red velvet: deep red with soft vertical folds and pile sheen
function velvet(g, w, h, o = {}) {
  const base = hex(o.base || '#8a1c26'), n = o.folds || 6; g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  modulate(g, w, h, (u, v) => { const f = Math.sin(u * Math.PI * 2 * n + Math.sin(v * 3) * 0.5); const k = 0.82 + 0.22 * f + 0.1 * Math.max(0, f) ** 6 + 0.04 * fbm(u, v, 4, 4, 2, 7); return [k * 1.02, k, k * 0.98]; });
  if (o.fringe) { g.fillStyle = '#d8a848'; g.fillRect(0, h * 0.94, w, h * 0.06); for (let x = 0; x < w; x += 6) { g.fillStyle = '#b88a30'; g.fillRect(x, h * 0.96, 2, h * 0.04); } }
}
// damask wallpaper: base colour + repeating darker medallions and stripes
function damask(g, w, h, o = {}) {
  const base = hex(o.base || '#6a1e24'), n = o.n || 3; g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  const c = css(o.motif ? hex(o.motif) : shade(base, 0.78), 0.9), c2 = css(tint(base, 1.12), 0.5);
  for (let j = 0; j < n * 2; j++) for (let i = 0; i < n; i++) { const x = (i + (j % 2) * 0.5) * w / n, y = (j + 0.5) * h / (n * 2), s = w / n * 0.28;
    for (const dx of [0, w, -w]) { g.fillStyle = c; g.beginPath(); g.moveTo(x + dx, y - s); g.bezierCurveTo(x + dx + s * 0.9, y - s * 0.4, x + dx + s * 0.6, y + s * 0.5, x + dx, y + s); g.bezierCurveTo(x + dx - s * 0.6, y + s * 0.5, x + dx - s * 0.9, y - s * 0.4, x + dx, y - s); g.fill();
      g.fillStyle = c2; g.beginPath(); g.arc(x + dx, y, s * 0.18, 0, 7); g.fill(); } }
  if (o.stripe) for (let i = 0; i < n; i++) { g.fillStyle = css(shade(base, 0.85), 0.6); g.fillRect((i + 0.75) * w / n - 2, 0, 4, h); }
  modulate(g, w, h, (u, v) => 0.92 + 0.1 * fbm(u, v, 3, 3, 3, o.seed || 7));
}
// painted stage backdrop: an English country-house garden ("Trenchard Manor"), flat theatrical scene painting on canvas
function backdropTex(g, w, h) {
  const sky = g.createLinearGradient(0, 0, 0, h * 0.6); sky.addColorStop(0, '#7a96c8'); sky.addColorStop(1, '#e8d4a8'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,248,230,0.7)'; for (const [x, y, s] of [[0.2, 0.15, 1], [0.62, 0.1, 1.4], [0.85, 0.22, 0.9]]) for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(w * x + k * w * 0.03 * s, h * y + Math.sin(k) * h * 0.01, w * 0.04 * s, h * 0.025 * s, 0, 0, 7); g.fill(); }
  g.fillStyle = '#8a9a7a'; g.beginPath(); g.moveTo(0, h * 0.55); for (let x = 0; x <= w; x += w / 10) g.lineTo(x, h * (0.5 - 0.04 * Math.sin(x / w * 7))); g.lineTo(w, h * 0.62); g.lineTo(0, h * 0.62); g.fill();
  // the manor: pale stone, gables, many windows
  const mx = w * 0.5, my = h * 0.56; g.fillStyle = '#d8c8a8'; g.fillRect(mx - w * 0.2, my - h * 0.2, w * 0.4, h * 0.2); g.fillStyle = '#6a5a6a'; g.beginPath(); g.moveTo(mx - w * 0.22, my - h * 0.2); g.lineTo(mx, my - h * 0.32); g.lineTo(mx + w * 0.22, my - h * 0.2); g.fill();
  for (const gx of [-0.15, 0.15]) { g.fillStyle = '#ccbc9c'; g.fillRect(mx + gx * w - w * 0.04, my - h * 0.26, w * 0.08, h * 0.26); g.fillStyle = '#5a4a5a'; g.beginPath(); g.moveTo(mx + gx * w - w * 0.05, my - h * 0.26); g.lineTo(mx + gx * w, my - h * 0.32); g.lineTo(mx + gx * w + w * 0.05, my - h * 0.26); g.fill(); }
  g.fillStyle = '#3a3a5a'; for (let r = 0; r < 2; r++) for (let c = -6; c <= 6; c++) g.fillRect(mx + c * w * 0.028 - w * 0.007, my - h * (0.17 - r * 0.08), w * 0.014, h * 0.045);
  // trees left and right, hedges, urns and lawn
  const tree = (x, y, s, c) => { g.fillStyle = '#4a3a2a'; g.fillRect(x - s * 0.06, y - s * 0.4, s * 0.12, s * 0.4); for (let k = 0; k < 7; k++) { g.fillStyle = css(vary(hex(c), (k % 3 - 1) * 0.1)); g.beginPath(); g.arc(x + Math.cos(k * 1.7) * s * 0.35, y - s * 0.7 + Math.sin(k * 2.3) * s * 0.25, s * 0.38, 0, 7); g.fill(); } };
  tree(w * 0.08, h * 0.62, h * 0.55, '#3a6a4a'); tree(w * 0.92, h * 0.62, h * 0.6, '#3a5a46'); tree(w * 0.24, h * 0.6, h * 0.32, '#5a7a4a'); tree(w * 0.78, h * 0.6, h * 0.34, '#4a7046');
  const lawn = g.createLinearGradient(0, h * 0.6, 0, h); lawn.addColorStop(0, '#7a9a5a'); lawn.addColorStop(1, '#4a6a3a'); g.fillStyle = lawn; g.fillRect(0, h * 0.6, w, h * 0.4);
  g.fillStyle = '#d8ccb0'; g.beginPath(); g.moveTo(w * 0.46, h * 0.6); g.lineTo(w * 0.54, h * 0.6); g.lineTo(w * 0.7, h); g.lineTo(w * 0.3, h); g.fill();
  g.fillStyle = '#2e5a3a'; g.fillRect(0, h * 0.62, w * 0.38, h * 0.05); g.fillRect(w * 0.62, h * 0.62, w * 0.38, h * 0.05);
  for (const x of [0.4, 0.6]) { g.fillStyle = '#c8bca0'; g.fillRect(w * x - 12, h * 0.6, 24, 40); g.beginPath(); g.ellipse(w * x, h * 0.6, 26, 12, 0, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(40,30,50,0.25)'; g.lineWidth = 2; for (let x = w / 7; x < w; x += w / 7) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } // canvas seams
  modulate(g, w, h, (u, v) => 0.9 + 0.12 * fbm(u, v, 5, 3, 3, 21));
}
// framed oval engraving portrait of a statesman (generic, period look): white hair, dark coat, warm brown ground
function portraitTex(g, w, h) {
  g.fillStyle = '#3a2a22'; g.fillRect(0, 0, w, h); const gr = g.createRadialGradient(w / 2, h * 0.4, 5, w / 2, h * 0.45, w * 0.6); gr.addColorStop(0, '#9a7a56'); gr.addColorStop(1, '#4a3428'); g.fillStyle = gr; g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.44, h * 0.45, 0, 0, 7); g.fill();
  g.fillStyle = '#1e1a22'; g.beginPath(); g.moveTo(w * 0.15, h * 0.95); g.bezierCurveTo(w * 0.2, h * 0.62, w * 0.36, h * 0.58, w * 0.5, h * 0.58); g.bezierCurveTo(w * 0.64, h * 0.58, w * 0.8, h * 0.62, w * 0.85, h * 0.95); g.fill();
  g.fillStyle = '#efe6d8'; g.beginPath(); g.moveTo(w * 0.43, h * 0.6); g.lineTo(w * 0.5, h * 0.75); g.lineTo(w * 0.57, h * 0.6); g.fill();
  g.fillStyle = '#e2c4a0'; g.beginPath(); g.ellipse(w / 2, h * 0.42, w * 0.13, h * 0.15, 0, 0, 7); g.fill();
  g.fillStyle = '#e8e4dc'; g.beginPath(); g.ellipse(w / 2, h * 0.32, w * 0.16, h * 0.09, 0, Math.PI, 0); g.fill(); for (const s of [-1, 1]) { g.beginPath(); g.ellipse(w / 2 + s * w * 0.14, h * 0.39, w * 0.05, h * 0.07, 0, 0, 7); g.fill(); }
  g.fillStyle = '#4a3a3a'; for (const s of [-1, 1]) g.fillRect(w / 2 + s * w * 0.05 - w * 0.02, h * 0.4, w * 0.04, h * 0.01); g.fillRect(w * 0.47, h * 0.5, w * 0.06, h * 0.008);
  modulate(g, w, h, (u, v) => 0.9 + 0.12 * fbm(u, v, 4, 4, 3, 33));
}
// dressing-room mirror: dark silvered glass with a soft reflection of the warm room and the two sconce flames
function mirrorTex(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a3444'); gr.addColorStop(0.6, '#4e4650'); gr.addColorStop(1, '#2e2834'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,80,60,0.3)'; g.fillRect(0, h * 0.62, w, h * 0.38); g.fillStyle = 'rgba(30,20,30,0.35)'; g.fillRect(w * 0.62, h * 0.2, w * 0.2, h * 0.5);
  for (const x of [0.06, 0.94]) { const r = g.createRadialGradient(w * x, h * 0.42, 2, w * x, h * 0.42, w * 0.25); r.addColorStop(0, 'rgba(255,220,160,0.45)'); r.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }
  g.save(); g.globalAlpha = 0.22; g.fillStyle = '#f4eee0'; g.beginPath(); g.moveTo(w * 0.1, h); g.lineTo(w * 0.45, 0); g.lineTo(w * 0.6, 0); g.lineTo(w * 0.25, h); g.fill(); g.globalAlpha = 0.12; g.beginPath(); g.moveTo(w * 0.32, h); g.lineTo(w * 0.67, 0); g.lineTo(w * 0.72, 0); g.lineTo(w * 0.37, h); g.fill(); g.restore();
  modulate(g, w, h, (u, v) => { const e = Math.min(u, 1 - u, v, 1 - v); return 0.75 + 0.25 * Math.min(1, e * 8) - 0.06 * fbm(u, v, 4, 4, 2, 3); }); // foxed silvering at the edges
}
// book spines: rows of leather / cloth bindings with gilt bands (one shelf row per texture)
function booksTex(g, w, h, seed = 89, cols) {
  const R = rng(seed); g.fillStyle = '#1a1210'; g.fillRect(0, 0, w, h); let x = 0; const C = cols || ['#5a1e1a', '#1e2a44', '#2e4028', '#6a4a24', '#3a2420', '#4a1e30', '#2a2a2a', '#7a5a3a'];
  while (x < w) { const bw = 12 + R() * 22, top = h * (0.04 + R() * 0.16), c = vary(C[(R() * C.length) | 0], (R() - 0.5) * 0.3); if (R() < 0.06) { x += bw * 1.5; continue; }
    g.fillStyle = css(c); g.fillRect(x, top, bw - 1.5, h - top); g.fillStyle = css(tint(c, 1.18), 0.5); g.fillRect(x + 1, top, 2, h - top); g.fillStyle = css(shade(c, 0.7), 0.6); g.fillRect(x + bw - 4, top, 2.5, h - top);
    g.fillStyle = '#c8a050'; for (const v of [0.18, 0.24, 0.82]) g.fillRect(x + 2, top + (h - top) * v, bw - 5, 2.5); if (R() < 0.5) g.fillRect(x + 3, top + (h - top) * 0.4, bw - 7, (h - top) * 0.12); x += bw; }
}
// default letter (dressing room). o: { lines, sign, date, head } — handwriting faked with italic serif
export function paintLetter(g, w, h, o = {}) {
  PT.paper(g, w, h, { base: '#f0e6d0', seed: 41 }); const ink = '#2a2440'; g.fillStyle = 'rgba(120,100,80,0.12)'; g.fillRect(0, h * 0.5 - 1, w, 2); g.fillRect(w * 0.5 - 1, 0, 2, h); // fold creases
  const m = w * 0.1; let y = h * 0.09;
  if (o.head !== false) { txt(g, o.head || 'Head-Quarters, Armies of the United States', w / 2, y, w - 2 * m, h * 0.03, { col: ink, italic: true }); y += h * 0.05; }
  txt(g, o.date || 'City Point, Va., 1865', w - m - w * 0.2, y, w * 0.4, h * 0.026, { col: ink, italic: true, bold: false }); y += h * 0.07;
  const lines = o.lines || ['My dear Booth,', 'The young gentleman whose life', 'you saved on the platform at', 'Jersey City was Robert Lincoln,', 'the President’s eldest son.', 'He has spoken of it to me', 'many times, and asked that you', 'should know whose hand it was.', '', 'Ever faithfully yours,'];
  g.fillStyle = ink; for (const [i, l] of lines.entries()) { g.font = `italic ${h * 0.034 | 0}px ${SERIF}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(l, m + (i === 0 ? 0 : w * 0.04), y); y += h * 0.058; }
  txt(g, o.sign || 'A. Badeau', w - m - w * 0.18, y + h * 0.02, w * 0.36, h * 0.045, { col: ink, italic: true });
  g.strokeStyle = ink; g.lineWidth = 1.5; g.beginPath(); g.moveTo(w - m - w * 0.34, y + h * 0.05); g.bezierCurveTo(w - m - w * 0.2, y + h * 0.07, w - m - w * 0.1, y + h * 0.03, w - m, y + h * 0.055); g.stroke();
  ageEdges(g, w, h, 0.12, 43);
}
// default envelope (study): "THE WHITE HOUSE" stamped / embossed corner, addressed to Robert T. Lincoln, postmark. o: { to, addr, city, year }
export function paintEnvelope(g, w, h, o = {}) {
  PT.paper(g, w, h, { base: '#f2ead8', seed: 47 }); const ink = '#1e2244', m = w * 0.06;
  g.strokeStyle = 'rgba(120,100,80,0.18)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(w * 0.5, h * 0.55); g.lineTo(w, 0); g.stroke(); // flap shadow seen through
  txt(g, 'THE WHITE HOUSE', m + w * 0.2, m + h * 0.06, w * 0.4, h * 0.085, { col: '#1e2a5a', sp: 0.06 }); txt(g, 'WASHINGTON', m + w * 0.2, m + h * 0.16, w * 0.3, h * 0.05, { col: '#1e2a5a', bold: false, sp: 0.15 });
  g.fillStyle = '#1e2a5a'; g.fillRect(m + w * 0.04, m + h * 0.215, w * 0.32, 2);
  // postmark ring + wavy cancel lines (top right)
  const px = w - m - w * 0.16, py = m + h * 0.16; g.strokeStyle = 'rgba(40,30,60,0.75)'; g.lineWidth = 3; g.beginPath(); g.arc(px, py, h * 0.13, 0, 7); g.stroke();
  txt(g, 'WASHINGTON D.C.', px, py - h * 0.035, h * 0.22, h * 0.032, { col: 'rgba(40,30,60,0.8)' }); txt(g, o.year || 'OCT 2 1902', px, py + h * 0.03, h * 0.22, h * 0.035, { col: 'rgba(40,30,60,0.8)' });
  for (let k = 0; k < 4; k++) { g.beginPath(); for (let x = px - w * 0.36; x < px - h * 0.15; x += 6) g.lineTo(x, py - h * 0.08 + k * h * 0.05 + Math.sin(x * 0.08) * 4); g.stroke(); }
  txt(g, 'OFFICIAL BUSINESS', px - w * 0.02, py + h * 0.2, w * 0.24, h * 0.035, { col: '#7a2a2a', bold: false });
  PT.inkWear(g, px - w * 0.36, py - h * 0.14, w * 0.5, h * 0.3, 51, 0.5);
  // address in a careful clerk's hand
  g.fillStyle = ink; g.textAlign = 'left'; g.textBaseline = 'middle'; const ax = w * 0.34; let ay = h * 0.56;
  for (const [t, s] of [[o.to || 'Hon. Robert T. Lincoln', 0.075], [o.addr || '1234 Lake Shore Drive', 0.06], [o.city || 'Chicago, Illinois', 0.07]]) { g.font = `italic ${h * s | 0}px ${SERIF}`; g.fillText(t, ax, ay); ay += h * 0.1; }
  g.fillRect(ax + w * 0.17, ay - h * 0.04, w * 0.22, 2);
  ageEdges(g, w, h, 0.1, 53);
}
// warm lit window seen from outside (curtains, gaslight); v: 0 lit lace, 1 lit drapes, 2 dark, 3 dark shutters
function winTex(g, w, h, v = 0, seed = 1) {
  const R = rng(seed), lit = v < 2; const gr = g.createLinearGradient(0, 0, 0, h);
  if (lit) { gr.addColorStop(0, '#ffcf88'); gr.addColorStop(1, '#d87a38'); } else { gr.addColorStop(0, '#3a4270'); gr.addColorStop(0.6, '#1e1e38'); gr.addColorStop(1, '#141428'); } g.fillStyle = gr; g.fillRect(0, 0, w, h);
  if (lit) { const r = g.createRadialGradient(w * 0.5, h * 0.35, 4, w * 0.5, h * 0.35, w * 0.5); r.addColorStop(0, 'rgba(255,245,210,0.9)'); r.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }
  for (const sd of [0, 1]) { const cw = w * (v === 1 ? 0.3 : 0.22), x0 = sd ? w - cw : 0; g.fillStyle = v === 1 ? '#7a2228' : lit ? 'rgba(255,240,215,0.75)' : 'rgba(80,80,110,0.6)'; g.fillRect(x0, 0, cw, h); g.strokeStyle = 'rgba(60,20,30,0.35)'; g.lineWidth = 3; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x0 + k * cw / 4, 0); g.lineTo(x0 + k * cw / 4 + (sd ? -6 : 6), h); g.stroke(); } }
  if (v === 2) { g.save(); g.globalAlpha = 0.18; g.fillStyle = '#c8d4ff'; g.beginPath(); g.moveTo(0, h * 0.6); g.lineTo(w * 0.5, 0); g.lineTo(w * 0.65, 0); g.lineTo(0, h * 0.8); g.fill(); g.restore(); }
  g.fillStyle = '#2a1e24'; const m = w * 0.06; g.fillRect(0, 0, w, m); g.fillRect(0, h - m, w, m); g.fillRect(0, 0, m, h); g.fillRect(w - m, 0, m, h); g.fillRect(w / 2 - m * 0.5, 0, m, h); for (let k = 1; k < 3; k++) g.fillRect(0, k * h / 3 - m * 0.4, w, m * 0.8);
  if (v === 3) { for (const sd of [0, 1]) { const sw = w / 2, x0 = sd ? sw : 0; g.fillStyle = '#2e3a2e'; g.fillRect(x0, 0, sw, h); g.fillStyle = '#1a221a'; for (let y = 6; y < h; y += 12) g.fillRect(x0 + 6, y, sw - 12, 4); } }
}
// stucco (expo buildings): ivory staff plaster with soft blotches + faint block lines
function stucco(g, w, h, o = {}) {
  const base = hex(o.base || '#e8d4ae'); g.fillStyle = css(base); g.fillRect(0, 0, w, h);
  g.strokeStyle = css(shade(base, 0.82), 0.45); g.lineWidth = 2; for (let y = h / 4; y < h; y += h / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  modulate(g, w, h, (u, v) => 0.93 + 0.1 * fbm(u, v, 3, 3, 3, o.seed || 61));
}
// round clay roof tiles (barrel tiles) in rows
function tilesTex(g, w, h, o = {}) {
  const base = hex(o.base || '#b85a3a'), R = rng(o.seed || 63), n = 8, rows = 6; g.fillStyle = css(shade(base, 0.5)); g.fillRect(0, 0, w, h);
  for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) { const x = i * w / n, y = r * h / rows, c = vary(base, (R() - 0.5) * 0.2); const gr = g.createLinearGradient(x, 0, x + w / n, 0); gr.addColorStop(0, css(shade(c, 0.7))); gr.addColorStop(0.4, css(tint(c, 1.15))); gr.addColorStop(1, css(shade(c, 0.65))); g.fillStyle = gr; g.beginPath(); g.roundRect(x + 2, y + 2, w / n - 4, h / rows + 6, 10); g.fill(); }
}
// dusk water: deep blue with warm bulb reflections streaking down
function waterTex(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a3a78'); gr.addColorStop(1, '#3a3068'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = rng(71);
  for (let i = 0; i < 140; i++) { const x = R() * w, y = R() * h, l = 6 + R() * 30; g.fillStyle = `rgba(255,${200 + R() * 40 | 0},140,${0.25 + R() * 0.5})`; g.fillRect(x, y, 2 + R() * 3, l); }
  g.strokeStyle = 'rgba(160,180,255,0.25)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { const x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 20 + R() * 30, y); g.stroke(); }
}
// dusk sky seen through a window (study)
function duskWindowTex(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a4a8a'); gr.addColorStop(0.65, '#b88aa0'); gr.addColorStop(1, '#f0b088'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a2440'; for (let x = 0; x < w; x += 30 + (x * 7 % 23)) { const bh = h * (0.12 + ((x * 13) % 17) / 100); g.fillRect(x, h - bh, 26 + (x % 11), bh); } // distant city roofs
  g.fillStyle = '#ffd890'; for (let i = 0; i < 18; i++) g.fillRect((i * 53) % w, h - 10 - (i * 29) % (h * 0.12), 4, 5);
  g.strokeStyle = '#1e1a28'; g.lineWidth = 3; g.beginPath(); g.moveTo(w * 0.1, h); g.bezierCurveTo(w * 0.2, h * 0.6, w * 0.1, h * 0.4, w * 0.25, h * 0.2); g.stroke(); // bare tree branch
  for (let k = 0; k < 6; k++) { g.lineWidth = 1.5; g.beginPath(); g.moveTo(w * (0.13 + k * 0.02), h * (0.3 + k * 0.1)); g.lineTo(w * (0.3 + k * 0.03), h * (0.2 + k * 0.08)); g.stroke(); }
}
// lettered fascia (signboard) — gilt letters on dark board, or cut letters on stone
function fascia(g, w, h, text, bg, fg, o = {}) {
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0.1)'); gr.addColorStop(1, 'rgba(0,0,0,0.2)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
  else g.clearRect(0, 0, w, h);
  if (o.border !== false && bg) { g.strokeStyle = fg; g.lineWidth = h * 0.04; g.strokeRect(h * 0.1, h * 0.1, w - h * 0.2, h - h * 0.2); }
  txt(g, text, w / 2, h * 0.53, w - h * (bg ? 0.6 : 0.1), h * (o.fs || 0.56), { col: fg, sh: o.sh ?? 'rgba(10,6,16,0.55)', sp: o.sp ?? 0.08, font: o.font });
}
// lobby interior seen through the open arches: warm gaslit hall, stair, ticket window
function lobbyTex(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6a3020'); gr.addColorStop(0.5, '#c87a3a'); gr.addColorStop(1, '#5a2a1e'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (const x of [0.2, 0.5, 0.8]) { const r = g.createRadialGradient(w * x, h * 0.3, 2, w * x, h * 0.3, w * 0.22); r.addColorStop(0, 'rgba(255,240,190,0.95)'); r.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); g.fillStyle = '#fff4d0'; g.beginPath(); g.arc(w * x, h * 0.3, 6, 0, 7); g.fill(); }
  g.fillStyle = '#4a2018'; for (let k = 0; k < 8; k++) g.fillRect(w * (0.58 + k * 0.05), h * (0.8 - k * 0.06), w * 0.42, h * 0.06); g.fillStyle = '#7a2a24'; g.fillRect(0, h * 0.82, w, h * 0.18);
  g.fillStyle = '#3a1a14'; g.fillRect(w * 0.12, h * 0.45, w * 0.22, h * 0.3); g.fillStyle = '#ffd890'; g.fillRect(w * 0.15, h * 0.5, w * 0.16, h * 0.12); txt(g, 'TICKETS', w * 0.23, h * 0.42, w * 0.2, h * 0.05, { col: '#f0d070' });
}
// ---------------------------------------------------------------- materials
let M = null;
function materials() {
  const vc = (o = {}) => toon({ vertexColors: true, ...o }), T = (w, h, fn, rep) => mkTex(w, h, fn, rep), m = {};
  m.paint = vc(); m.iron = vc(); m.gold = vc({ emissive: 0x2a1800 });
  m.brick = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#93402e', rows: 16, cols: 4, seed: 61 })) });
  m.brick2 = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#7a4436', rows: 16, cols: 4, seed: 67 })) });
  m.walk = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#7a4a40', rows: 8, cols: 3, seed: 69 })) }); if (macro) macro(m.walk, 0.12, 0.08);
  m.trim = vc({ map: T(256, 256, (g, w, h) => stucco(g, w, h, { base: '#d6c8a8', seed: 73 })) });
  m.stucco = vc({ map: T(512, 512, (g, w, h) => stucco(g, w, h, { base: '#ecdcba', seed: 75 })) });
  m.tiles = vc({ map: T(256, 256, (g, w, h) => tilesTex(g, w, h)) });
  m.wood = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#7a4a2c', n: 6, seed: 33 })) });
  m.woodDark = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#4a2c1e', n: 6, seed: 35, joints: 0 })) });
  m.floor = vc({ map: T(512, 512, (g, w, h) => PT.planks(g, w, h, { base: '#8a5a38', n: 8, seed: 37 })) }); if (macro) macro(m.floor, 0.1, 0.3);
  m.velvet = vc({ map: T(256, 256, (g, w, h) => velvet(g, w, h)) });
  m.leather = vc({ map: T(256, 256, (g, w, h) => velvet(g, w, h, { base: '#5a2e22', folds: 2 })) });
  m.fabric = vc({ map: T(256, 256, (g, w, h) => PT.fabric(g, w, h, { base: '#efe8da', folds: 3 })), side: THREE.DoubleSide });
  m.cloth = vc({ side: THREE.DoubleSide });
  m.paper = vc({ map: T(256, 256, (g, w, h) => PT.paper(g, w, h, { base: '#efe6d2' })) });
  m.glowWarm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc477).multiplyScalar(3.0), fog: false });
  m.glowSoft = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd9a0).multiplyScalar(1.6), fog: false });
  m.flame = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb050).multiplyScalar(4.0), fog: false });
  m.sil = new THREE.MeshBasicMaterial({ color: 0x150e20 }); // silhouettes (president, figure)
  m.dark = new THREE.MeshBasicMaterial({ color: 0x07050c });
  m.houseGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd9a0).multiplyScalar(2.4), fog: false });
  m.lampGlass = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe2b0).multiplyScalar(1.9), fog: false });
  m.lampShade = toon({ vertexColors: true, color: 0x2e7a4a, emissive: 0x0e3a1e });
  m.velvetBk = vc({ map: T(256, 256, (g, w, h) => velvet(g, w, h, { base: '#2a2432', folds: 5 })) });
  m.crowd = vc(); m.crowd.userData.tint = true;
  m.bulb = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.8, 0.5).multiplyScalar(4.2), fog: false });
  m.archDark = vc({ side: THREE.DoubleSide });
  m.cascade = toon({ map: T(128, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#4a5a98'); gr.addColorStop(0.5, '#8aa0d8'); gr.addColorStop(1, '#4a5a98'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const R = PT.rng(3); for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(230,240,255,${0.3 + R() * 0.6})`; g.fillRect(R() * w, R() * h, 2 + R() * 3, 30 + R() * 90); } }), emissive: 0xffffff });
  m.cascade.emissiveMap = m.cascade.map; m.cascade.emissive = new THREE.Color(0.32, 0.38, 0.55);
  m.spray = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xe8f0ff).multiplyScalar(1.3), transparent: true, opacity: 0.45, depthWrite: false, fog: false });
  m.plaza = vc({ map: T(512, 512, (g, w, h) => PT.brick(g, w, h, { base: '#a89884', mortar: '#8a7c70', rows: 6, cols: 3, seed: 77 })) }); if (macro) macro(m.plaza, 0.12, 0.03);
  m.grass = vc({ map: T(512, 512, (g, w, h) => PT.grass(g, w, h, { base: '#4a6a3a' })) });
  m.winLit = [0, 1].map((v) => { const t = T(256, 512, (g, w, h) => winTex(g, w, h, v, v + 3)); const mt = toon({ map: t, emissiveMap: t, emissive: new THREE.Color(0.95, 0.75, 0.5) }); return mt; });
  m.winDark = [2, 3].map((v) => toon({ map: T(256, 512, (g, w, h) => winTex(g, w, h, v, v + 5)) }));
  return m;
}
const matCache = new Map();
const texMat = (key, w, h, fn, o = {}) => { if (!matCache.has(key)) { const t = mkTex(w, h, fn); const { glow, ...rest } = o; const mt = toon({ map: t, ...rest }); if (glow) { mt.emissiveMap = t; mt.emissive = new THREE.Color(glow); } matCache.set(key, mt); } return matCache.get(key); };
const fasciaMat = (text, bg, fg, o = {}) => texMat('fa' + text + bg + fg + JSON.stringify(o), o.w || 1024, o.h || 128, (g, w, h) => fascia(g, w, h, text, bg, fg, o), bg ? {} : { transparent: true, alphaTest: 0.4 });
const billMat = (k) => texMat('bill' + k, 512, 768, (g, w, h) => paintPlaybill(g, w, h, PLAYBILLS[k]));

// ---------------------------------------------------------------- shared props
const LAMPS = { fordsExt: [], expo: [] };
// 1860s cast-iron gas street lamp with a four-pane lantern; registers its mantle into list
function gasPost(K, x, z, list, y0 = 0.15) {
  const iron = 0x1c1a26;
  K.put(M.iron, lathe('gpb', [[0, 0], [0.17, 0], [0.17, 0.08], [0.13, 0.14], [0.1, 0.55], [0.07, 0.66], [0, 0.66]], 8), x, y0, z, 0, Math.PI / 8, 0, 1, 1, 1, iron);
  K.put(M.iron, cyl(0.045, 0.065, 2.5, 8), x, y0 + 1.85, z, 0, 0, 0, 1, 1, 1, iron);
  K.put(M.iron, tor(0.06, 0.016, 4, 10), x, y0 + 0.9, z, Math.PI / 2, 0, 0, 1, 1, 1, iron);
  K.beam(M.iron, [x - 0.32, y0 + 2.85, z], [x + 0.32, y0 + 2.85, z], 0.03, iron, true, 5);
  const ly = y0 + 3.15; K.put(M.iron, cyl(0.13, 0.08, 0.07, 4), x, ly - 0.03, z, 0, Math.PI / 4, 0, 1, 1, 1, iron);
  K.put(M.glowSoft, cyl(0.18, 0.12, 0.44, 4), x, ly + 0.22, z, 0, Math.PI / 4, 0, 1, 1, 1, 0xffffff);
  K.put(M.flame, sph(0.05, 8, 6), x, ly + 0.18, z, 0, 0, 0, 1, 1.5, 1, 0xffffff);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; K.beam(M.iron, [x + Math.cos(a) * 0.12, ly, z + Math.sin(a) * 0.12], [x + Math.cos(a) * 0.18, ly + 0.45, z + Math.sin(a) * 0.18], 0.014, iron); }
  K.put(M.iron, cone(0.27, 0.22, 4), x, ly + 0.55, z, 0, Math.PI / 4, 0, 1, 1, 1, iron); K.put(M.iron, sph(0.045, 8, 6), x, ly + 0.7, z, 0, 0, 0, 1, 1, 1, iron);
  if (list) list.push([x, ly + 0.2, z]);
}
// arch trim: archivolt ring, keystone, impost blocks (front face z = 0, arch hole [cx, y0, w, h])
function archTrim(K, cx, y0, w, h, c = 0xd8ccb0, t = 0.11, key = true) {
  const r = w / 2, ys = y0 + h - r; K.put(M.trim, tor(r + t * 0.7, t, 4, 18, Math.PI), cx, ys, 0.02, 0, 0, 0, 1, 1, 0.7, c);
  if (key) K.cb(M.trim, 0.26, 0.42, 0.16, cx, ys + r + 0.12, 0.04, c, 0, 0, 0, 0.02, 1);
  for (const sd of [-1, 1]) K.cb(M.trim, 0.3, 0.16, 0.14, cx + sd * (r + 0.08), ys, 0.04, c, 0, 0, 0, 0.02, 1);
}
// generic brick row-house front (x0..x1, height H) with sash windows + door; front z = 0. o: { floors, cols, lit:Set, mat, door, shop }
function rowFront(K, key, x0, x1, H, o = {}) {
  const floors = o.floors || 3, cols = o.cols || 3, fh = (H - 0.6) / floors, bw = (x1 - x0) / cols, holes = [], wins = [];
  for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) { const cx = x0 + (c + 0.5) * bw, y = f * fh + (f ? 0.9 : 0.15);
    if (f === 0 && o.door === c) { holes.push([cx, 0.15, 1.1, 2.7, 0.15]); wins.push([cx, 0.15, 1.1, 2.7, 'door']); continue; }
    if (f === 0 && o.shop === c) { holes.push([cx, 0.6, bw * 0.75, 2.4, false]); wins.push([cx, 0.6, bw * 0.75, 2.4, 'shop']); continue; }
    const ww = Math.min(1.1, bw * 0.5), wh = Math.min(2.0, fh * 0.6), yy = f ? y : 0.9; holes.push([cx, yy, ww, wh, 0.14]); wins.push([cx, yy, ww, wh, f * cols + c]); }
  K.put(o.mat || M.brick2, holeWall(key, x0, x1, -0.3, H, holes, 0.4, 1.2), 0, 0, 0, 0, 0, 0, 1, 1, 1, o.tint ?? 0xffffff);
  for (const [cx, y, w, h, k] of wins) {
    if (k === 'door') { K.box(M.woodDark, cx - w / 2, cx + w / 2, y, y + h, -0.36, -0.3, 0x5a3a2a, 0.01, 1); continue; }
    if (k === 'shop') { K.put(o.shopMat || M.winLit[0], plane(w, h), cx, y + h / 2, -0.3); continue; }
    const lit = o.lit && o.lit.has(k); K.put(lit ? M.winLit[k % 2] : M.winDark[k % 3 === 0 ? 1 : 0], plane(w + 0.1, h + 0.2), cx, y + h / 2, -0.3);
    K.box(M.trim, cx - w / 2 - 0.08, cx + w / 2 + 0.08, y - 0.12, y, 0, 0.1, 0xcfc2a2, 0.015, 1); K.box(M.trim, cx - w / 2 - 0.1, cx + w / 2 + 0.1, y + h, y + h + 0.16, 0, 0.06, 0xcfc2a2, 0.015, 1);
    if (o.shutters) for (const sd of [-1, 1]) K.box(M.paint, cx + sd * (w / 2 + 0.02) - 0.25 * (sd < 0 ? 1 : 0) * 1, cx + sd * (w / 2 + 0.02) + 0.25 * (sd > 0 ? 1 : 0), y, y + h, 0.02, 0.06, 0x2a3a2e, 0.01, 1);
  }
  K.box(M.trim, x0 - 0.05, x1 + 0.05, H - 0.1, H + 0.35, -0.05, 0.3, 0x5a4a44, 0.03, 1); // cornice
  for (let x = x0 + 0.3; x < x1 - 0.1; x += 0.7) K.box(M.trim, x - 0.07, x + 0.07, H - 0.4, H - 0.1, 0, 0.22, 0x5a4a44, 0.01, 1);
}
// a static horse-drawn carriage (brougham) facing -x, wheels on y = 0; horse between the shafts
function buildCarriage() {
  const K = new Kit(), lac = 0x1e1a24, trim = 0x8a6a2a, coat = 0x5a3424, dark = 0x2a1a14;
  K.box(M.paint, -0.9, 1.25, 0.72, 1.62, -0.62, 0.62, lac, 0.06, 1, 2); K.box(M.paint, -0.98, 1.33, 1.62, 1.72, -0.68, 0.68, lac, 0.04, 1);
  K.box(M.paint, -0.9, -0.45, 0.45, 0.78, -0.55, 0.55, lac, 0.05, 1); K.box(M.paint, -1.5, -0.9, 1.0, 1.15, -0.55, 0.55, lac, 0.03, 1); // boot + footboard
  K.box(M.leather, -1.35, -0.95, 1.15, 1.32, -0.5, 0.5, 0x4a2a22, 0.05, 1); K.box(M.leather, -1.0, -0.92, 1.3, 1.62, -0.5, 0.5, 0x4a2a22, 0.03, 1); // driver's seat
  for (const sd of [-1, 1]) { K.put(M.winLit[0], plane(0.62, 0.48), 0.25, 1.25, sd * 0.625, 0, sd > 0 ? 0 : Math.PI, 0); K.box(M.paint, -0.1, 0.6, 0.78, 1.55, sd * 0.62 - 0.01, sd * 0.62 + 0.01, trim, 0.005, 1);
    for (const [x, r] of [[0.85, 0.66], [-0.95, 0.5]]) { K.put(M.paint, tor(r, 0.035, 5, 28), x, r, sd * 0.78, 0, 0, 0, 1, 1, 1, 0x2a1e1a); K.put(M.paint, cyl(0.08, 0.08, 0.14, 10), x, r, sd * 0.78, Math.PI / 2, 0, 0, 1, 1, 1, trim);
      for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; K.beam(M.paint, [x, r, sd * 0.78], [x + Math.cos(a) * r, r + Math.sin(a) * r, sd * 0.78], 0.016, 0x5a2a20); } }
    K.put(M.iron, cyl(0.07, 0.05, 0.2, 6), -0.95, 1.55, sd * 0.7, 0, 0, 0, 1, 1, 1, 0x1a1a1e); K.put(M.glowWarm, cyl(0.05, 0.05, 0.12, 6), -0.95, 1.69, sd * 0.7, 0, 0, 0, 1, 1, 1, 0xffffff);
    K.beam(M.paint, [-1.2, 0.85, sd * 0.42], [-3.6, 1.05, sd * 0.4], 0.035, lac, true, 6); }
  K.beam(M.iron, [0.85, 0.66, -0.8], [0.85, 0.66, 0.8], 0.03, 0x1a1a1e, true); K.beam(M.iron, [-0.95, 0.5, -0.8], [-0.95, 0.5, 0.8], 0.03, 0x1a1a1e, true);
  // the horse (standing, head slightly down)
  K.put(M.paint, capsule(0.33, 0.95, 6, 12), -2.65, 1.28, 0, 0, 0, Math.PI / 2, 1, 1, 0.92, coat);
  K.put(M.paint, capsule(0.17, 0.55, 4, 10), -3.25, 1.68, 0, 0, 0, -0.75, 1, 1, 0.85, coat); K.put(M.paint, capsule(0.12, 0.42, 4, 10), -3.62, 1.82, 0, 0, 0, 1.15, 1, 1, 0.9, coat);
  K.put(M.paint, sph(0.08, 8, 6), -3.84, 1.68, 0, 0, 0, 0, 1, 0.9, 1, 0x3a2018); for (const sd of [-1, 1]) K.put(M.paint, cone(0.04, 0.12, 5), -3.48, 2.06, sd * 0.06, 0, 0, 0.2, 1, 1, 1, coat);
  K.box(M.paint, -3.45, -2.95, 1.7, 2.02, -0.03, 0.03, dark, 0.02, 1); // mane
  for (const [x, z] of [[-2.25, -0.16], [-2.25, 0.16], [-3.0, -0.16], [-3.0, 0.16]]) { K.put(M.paint, cyl(0.065, 0.05, 1.0, 6), x, 0.55, z, 0, 0, 0, 1, 1, 1, coat); K.put(M.paint, cyl(0.07, 0.08, 0.1, 6), x, 0.05, z, 0, 0, 0, 1, 1, 1, 0x1a1414); }
  K.put(M.paint, cone(0.1, 0.8, 6), -2.0, 1.0, 0, 0, 0, -0.25, 1, 1, 1, dark); // tail
  K.put(M.paint, tor(0.35, 0.03, 4, 18), -2.95, 1.28, 0, 0, Math.PI / 2, 0, 1, 1, 0.92, 0x1a1214); K.put(M.paint, tor(0.36, 0.035, 4, 18), -3.15, 1.45, 0, 0, Math.PI / 2, 0.6, 1, 1, 1, 0x1a1214); // harness
  const g = new THREE.Group(); K.build(g); return g;
}

// ================================================================= FORD'S THEATRE, exterior (Tenth Street, night of 14 April 1865)
// local frame: facade front z = 0, x -10..10; sidewalk z 0..3.6 (top y 0.15); dirt street z 3.85..20; camera side +z
function buildFordsExt(root) {
  const K = new Kit(), L = LAMPS.fordsExt; L.length = 0;
  const arches = [-8, -4, 0, 4, 8], A = 4.2, AW = 2.4;
  const holes = [...arches.map((x) => [x, 0.15, AW, A, true]), ...arches.map((x) => [x, 6.2, 1.5, 3.1, true]), ...arches.map((x) => [x, 10.5, 1.3, 2.3, true])];
  K.put(M.brick, holeWall('fords', -10, 10, -0.3, 14.2, holes, 0.5, 1.2));
  K.box(M.brick, -10, 10, -0.3, 14.2, -30, -2.6, 0xd8c8c0, 0.02, 1.2); K.box(M.paint, -10, 10, 4.5, 4.75, -2.6, -0.5, 0x4a2a22, 0.01, 1); // building mass behind (lobby recess under the dress-circle floor)
  for (const x of arches) { archTrim(K, x, 0.15, AW, A); archTrim(K, x, 6.2, 1.5, 3.1, 0xd8ccb0, 0.09); archTrim(K, x, 10.5, 1.3, 2.3, 0xd8ccb0, 0.08, false);
    for (const [y, w] of [[6.2, 1.5], [10.5, 1.3]]) { K.box(M.trim, x - w / 2 - 0.15, x + w / 2 + 0.15, y - 0.16, y, -0.02, 0.16, 0xd8ccb0, 0.02, 1); for (const sd of [-1, 1]) K.box(M.trim, x + sd * (w / 2 + 0.1) - 0.06, x + sd * (w / 2 + 0.1) + 0.06, y - 0.4, y - 0.16, 0, 0.1, 0xc8bc9c, 0.01, 1); } }
  for (const x of [-10, -6, -2, 2, 6, 10]) { K.box(M.trim, x - 0.3, x + 0.3, -0.3, 0.6, 0, 0.12, 0xb8ac90, 0.02, 1); K.box(M.brick, x - 0.36, x + 0.36, 0.6, 14.2, 0, 0.1, 0xe0d0c8, 0.01, 1.2); } // pilasters
  K.box(M.trim, -10.2, 10.2, 4.75, 5.0, -0.05, 0.22, 0xd8ccb0, 0.03, 1); K.box(M.trim, -10.2, 10.2, 9.75, 9.95, -0.05, 0.2, 0xd8ccb0, 0.03, 1);
  K.box(M.trim, -10.4, 10.4, 14.2, 14.85, -0.2, 0.5, 0xcfc2a2, 0.04, 1); for (let x = -9.9; x <= 9.95; x += 0.66) K.box(M.trim, x - 0.09, x + 0.09, 13.75, 14.2, 0, 0.36, 0xc8bc9c, 0.015, 1);
  // pediment with raking cornice + oculus
  K.put(M.brick, prism(20.4, 3.3, 0.6), 0, 14.85, -0.3, 0, 0, 0, 1, 1, 1, 0xe8d8d0);
  const ang = Math.atan2(3.3, 10.2); for (const sd of [-1, 1]) K.cb(M.trim, 10.95, 0.32, 0.8, sd * 5.1, 14.85 + 1.65 + 0.1, 0.05, 0xcfc2a2, 0, 0, -sd * ang, 0.03, 1);
  K.put(M.trim, tor(0.62, 0.1, 5, 20), 0, 16.0, 0.05, 0, 0, 0, 1, 1, 1, 0xd8ccb0); K.put(M.winLit[1], cached('ocu', () => new THREE.CircleGeometry(0.6, 20)), 0, 16.0, 0.02);
  K.box(M.paint, -10.2, 10.2, 14.85, 15.6, -30, -0.6, 0x3a3040, 0.02, 1);
  // sign band FORD'S THEATRE
  K.box(M.paint, -6.6, 6.6, 5.08, 6.02, 0, 0.14, 0x1e3a2e, 0.03, 1); K.put(fasciaMat("FORD'S THEATRE", '#1e3a2e', '#f0dca0', { w: 2048, h: 150, fs: 0.62, sp: 0.14 }), plane(13.0, 0.9), 0, 5.55, 0.145);
  // ground arches: open lobby in the middle three, panelled doors + lit fanlights in the outer two
  const lobby = texMat('lobby', 512, 512, lobbyTex, { glow: 0xb08060 });
  for (const x of arches) {
    if (Math.abs(x) < 5) { K.put(lobby, plane(AW + 0.4, A + 0.3), x, 0.15 + (A + 0.3) / 2, -2.2); for (const sd of [-1, 1]) K.box(M.paint, x + sd * AW / 2 - 0.05, x + sd * AW / 2 + 0.05, 0.15, A, -2.2, -0.5, 0x7a3a26, 0.01, 1);
      K.box(M.paint, x - AW / 2, x + AW / 2, 0.15, 0.2, -2.2, -0.5, 0x5a2a1e, 0.01, 1); for (const sd of [-1, 1]) K.box(M.woodDark, x + sd * AW / 2 - (sd > 0 ? 0.55 : -0.0) - (sd < 0 ? 0 : 0), x + sd * AW / 2 + (sd < 0 ? 0.55 : 0), 0.15, 3.0, -0.48 + (sd > 0 ? 0 : 0), -0.42, 0x3a2a24, 0.01, 1); }
    else { K.box(M.woodDark, x - AW / 2, x + AW / 2, 0.15, 3.1, -0.42, -0.36, 0x4a3a30, 0.01, 1); K.box(M.paint, x - 0.03, x + 0.03, 0.15, 3.1, -0.36, -0.33, 0x2a1e1a, 0.005);
      for (const sd of [-1, 1]) for (const [y0, y1] of [[0.4, 1.4], [1.7, 2.9]]) K.box(M.paint, x + sd * 0.6 - 0.42, x + sd * 0.6 + 0.42, y0, y1, -0.36, -0.32, 0x5a4434, 0.02, 1);
      K.put(M.winLit[0], plane(AW, 1.3), x, 3.1 + 0.6, -0.42); K.box(M.paint, x - AW / 2, x + AW / 2, 3.08, 3.18, -0.42, -0.3, 0x2a1e1a, 0.01, 1); }
  }
  // upper windows: 2nd floor (the dress circle saloon) lit, 3rd floor mostly dark
  arches.forEach((x, i) => { K.put(M.winLit[i % 2], plane(1.7, 3.4), x, 6.2 + 1.7, -0.34); K.put(i === 1 || i === 4 ? M.winLit[0] : M.winDark[i % 2], plane(1.5, 2.5), x, 10.5 + 1.25, -0.34); });
  // playbill boards on the piers + an A-frame board at the kerb
  for (const [x, k] of [[-6, 'cousin'], [-2, 'cousin'], [2, 'cousin'], [6, 'cousin']]) { K.box(M.wood, x - 0.52, x + 0.52, 1.2, 2.85, 0.1, 0.16, 0x4a2e20, 0.02, 1); K.put(billMat(k), plane(0.9, 1.5), x, 2.02, 0.165); }
  K.at(3.0, 0.15, 2.4, -0.35, () => { for (const sd of [-1, 1]) K.at(0, 0, 0, 0, () => { K.cb(M.wood, 0.75, 1.25, 0.04, 0, 0.66, sd * 0.2, 0x5a3a26, sd * 0.16, 0, 0, 0.01, 1); }); K.put(billMat('cousin'), plane(0.62, 1.0), 0, 0.7, 0.23, -0.16, 0, 0); });
  // neighbours: Star Saloon (right), row houses (left), more beyond; opposite side of the street (dark)
  rowFront(K, 'star', 10, 16.6, 12, { floors: 3, cols: 2, door: 0, shop: 1, lit: new Set([2, 5]), mat: M.brick2, shopMat: M.winLit[1] });
  K.box(M.paint, 10.2, 16.4, 3.1, 3.7, 0, 0.12, 0x2a1e30, 0.02, 1); K.put(fasciaMat('STAR SALOON', '#2a1e30', '#f0d890', { h: 128, fs: 0.6 }), plane(6.0, 0.55), 13.3, 3.4, 0.125);
  rowFront(K, 'lh1', -20, -10, 13.2, { floors: 3, cols: 3, door: 1, lit: new Set([4, 6]), mat: M.brick2, tint: 0xe0c8c0, shutters: true });
  rowFront(K, 'lh2', -30, -20, 11.5, { floors: 3, cols: 3, door: 0, shop: 2, lit: new Set([5]), mat: M.brick, tint: 0xb89a90 });
  rowFront(K, 'rh1', 16.6, 26, 13, { floors: 3, cols: 3, door: 2, lit: new Set([3, 7]), mat: M.brick, tint: 0xc0a8a0, shutters: true });
  rowFront(K, 'rh2', 26, 36, 10.5, { floors: 2, cols: 3, door: 1, lit: new Set([4]), mat: M.brick2, tint: 0xb0a0a0 });
  for (const [x0, x1] of [[-30, -20], [-20, -10], [10, 16.6], [16.6, 26], [26, 36]]) K.box(M.brick2, x0, x1, -0.3, 10, -20, -0.4, 0x8a7070, 0.02, 1.2);
  K.at(0, 0, 21.5, Math.PI, () => { rowFront(K, 'op1', -30, -15, 11, { floors: 3, cols: 4, door: 1, lit: new Set([6, 9]), mat: M.brick2, tint: 0xa08880 }); rowFront(K, 'op2', -15, 5, 12, { floors: 3, cols: 5, door: 2, shop: 4, lit: new Set([7, 11, 13]), mat: M.brick, tint: 0xa89088 }); rowFront(K, 'op3', 5, 30, 10, { floors: 3, cols: 6, door: 3, lit: new Set([8, 15]), mat: M.brick2, tint: 0x988080 }); });
  // sidewalks, kerbs, street
  K.box(M.walk, -40, 40, -0.1, 0.15, -0.5, 3.6, 0xffffff, 0.01, 1); K.box(M.trim, -40, 40, -0.1, 0.17, 3.6, 3.85, 0xa8a094, 0.03, 1);
  K.box(M.walk, -40, 40, -0.1, 0.15, 18.2, 21.6, 0xd8d0d0, 0.01, 1); K.box(M.trim, -40, 40, -0.1, 0.17, 17.95, 18.2, 0xa8a094, 0.03, 1);
  for (const x of [-14, -6.5, 1.6, 9.5]) gasPost(K, x, 3.35, L); for (const x of [-20, 0, 20]) gasPost(K, x, 18.5, L);
  // hitching posts, bench, barrels, crates, a horse trough
  for (const x of [-8.5, -1.5, 8.6, 11.8]) { K.put(M.iron, cyl(0.05, 0.06, 1.0, 8), x, 0.65, 3.4, 0, 0, 0, 1, 1, 1, 0x1c1a26); K.put(M.iron, sph(0.07, 8, 6), x, 1.17, 3.4, 0, 0, 0, 1, 1, 1, 0x1c1a26); K.put(M.iron, tor(0.06, 0.012, 4, 10), x, 1.0, 3.47, 0, 0, 0, 1, 1, 1, 0x2a2834); }
  K.at(15.4, 0.15, 0.7, 0, () => { for (const [x, z] of [[0, 0], [0.62, 0.1]]) K.put(M.wood, lathe('barrel', [[0, 0], [0.26, 0], [0.3, 0.42], [0.26, 0.85], [0, 0.85]], 12), x, 0, z, 0, 0, 0, 1, 1, 1, 0x8a5a34); K.box(M.wood, -0.9, -0.35, 0, 0.5, -0.25, 0.3, 0xa07a4a, 0.02, 1); K.box(M.wood, -0.85, -0.4, 0.5, 0.9, -0.2, 0.25, 0x8a6a40, 0.02, 1); });
  K.at(-12.5, 0.15, 0.6, 0, () => { K.box(M.wood, -0.9, 0.9, 0.42, 0.48, -0.2, 0.2, 0x5a4030, 0.01, 1); K.box(M.wood, -0.9, 0.9, 0.6, 0.85, -0.24, -0.2, 0x5a4030, 0.01, 1); for (const sd of [-1, 1]) K.box(M.iron, sd * 0.8 - 0.04, sd * 0.8 + 0.04, 0, 0.88, -0.25, 0.22, 0x1c1a26, 0.01); });
  K.at(-17.5, 0, 5.0, 0, () => { K.box(M.wood, -1.0, 1.0, 0, 0.6, -0.35, 0.35, 0x5a4a3a, 0.03, 1); K.box(M.paint, -0.92, 0.92, 0.5, 0.56, -0.28, 0.28, 0x2a3a5a, 0.01); });
  K.build(root, 20);
  // the dirt street (ruts run along x)
  const dirt = toon({ map: mkTex(512, 1024, (g, w, h) => PT.dirt(g, w, h, { base: '#7a6450', seed: 13 }), [1, 80 / 12.8]) }); if (macro) macro(dirt, 0.14, 0.05);
  mesh(root, plane(14.2, 80), dirt, 0, 0.0, 10.9, -Math.PI / 2, Math.PI / 2, 0, false);
  const car = buildCarriage(); car.position.set(-0.6, 0, 7.4); root.add(car); car.traverse((o) => { if (o.isMesh) o.receiveShadow = true; });
  LAMPS.fordsExt.push([-1.55, 1.7, 8.1, 'car']);
  return { carriage: car };
}

// ================================================================= THEATRE INTERIOR + PRESIDENTIAL BOX (Ford's, 14 April 1865)
// local frame: auditorium floor y = 0, x -9..9, z -0.6..16 (audience, camera side +z); stage floor y 1.1, z -12..-0.6; proscenium wall z = -4.
// proscenium boxes stand at x = +-6.2 (z -4..-0.6), openings facing the centre line; the presidential (upper right) box floor y 4.4.
const BX = { x: 6.2, back: 8.45, floor: 4.4, ceil: 7.45, z0: -4, z1: -0.6, rail: 5.3, door: -2.9, chair: [6.8, -1.7] };
let DIM = 0, houseBase = null;
// foliage wing flat (alpha): trunk + leaf masses painted flat
function wingTex(g, w, h, seed = 3) {
  g.clearRect(0, 0, w, h); const R = rng(seed); g.fillStyle = '#4a3428'; g.fillRect(w * 0.42, h * 0.45, w * 0.16, h * 0.55);
  for (let i = 0; i < 26; i++) { const x = w * (0.15 + R() * 0.7), y = h * (0.05 + R() * 0.55), r = w * (0.12 + R() * 0.16); g.fillStyle = css(vary([58, 100, 66], (R() - 0.5) * 0.4)); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(30,40,30,0.4)'; g.lineWidth = 3; for (let i = 0; i < 30; i++) { const x = w * (0.15 + R() * 0.7), y = h * (0.05 + R() * 0.55); g.beginPath(); g.arc(x, y, 10 + R() * 14, 3.6, 5.6); g.stroke(); }
}
// a seated silhouette (built facing +z, seat height y 0.45) — the president in the rocking chair. Original, simplified shapes only.
function seatedFigure(mat) {
  const g = new THREE.Group(); const P = (geo, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const m = mesh(g, geo, mat, x, y, z, rx, ry, rz); m.scale.set(sx, sy, sz); return m; };
  P(capsule(0.19, 0.4, 4, 12), 0, 0.95, -0.06, -0.12, 0, 0, 1.3, 1, 0.75);               // torso (frock coat)
  P(capsule(0.07, 0.12, 3, 8), 0, 1.27, -0.02, 0.1);                                       // neck
  P(sph(0.115, 16, 12), 0, 1.42, 0.0, 0, 0, 0, 0.92, 1.08, 1);                             // head
  P(sph(0.1, 12, 8), 0, 1.33, 0.055, 0.3, 0, 0, 0.95, 0.9, 0.75);                          // beard along the jaw
  P(sph(0.122, 12, 8), 0, 1.47, -0.03, 0, 0, 0, 0.98, 0.8, 1);                             // hair
  P(cone(0.02, 0.05, 5), 0, 1.42, 0.115, Math.PI / 2, 0, 0);                               // nose
  for (const sd of [-1, 1]) {
    P(capsule(0.085, 0.42, 3, 8), sd * 0.12, 0.55, 0.2, Math.PI / 2 - 0.05, 0, 0);        // thigh
    P(capsule(0.07, 0.42, 3, 8), sd * 0.13, 0.27, 0.45, 0.12, 0, 0);                       // shin
    P(rboxGeo(0.1, 0.07, 0.28, 0.03), sd * 0.13, 0.04, 0.52);                               // shoe
    P(capsule(0.065, 0.26, 3, 8), sd * 0.27, 1.0, -0.05, 0.25, 0, sd * 0.1);                // upper arm
    P(capsule(0.055, 0.26, 3, 8), sd * 0.29, 0.78, 0.13, Math.PI / 2 - 0.15, 0, 0);         // forearm on the chair arm
    P(sph(0.05, 8, 6), sd * 0.29, 0.77, 0.3);                                               // hand
  }
  return g;
}
// standing silhouette in a long coat and soft hat (the shadowy figure in the doorway; no props), facing +z
function standingFigure(mat) {
  const g = new THREE.Group(); const P = (geo, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const m = mesh(g, geo, mat, x, y, z, rx, ry, rz); m.scale.set(sx, sy, sz); return m; };
  P(lathe('coat', [[0, 0.55], [0.27, 0.55], [0.22, 0.95], [0.2, 1.3], [0.24, 1.45], [0.12, 1.52], [0, 1.53]], 14), 0, 0, 0, 0, 0, 0, 1, 1, 0.7);
  for (const sd of [-1, 1]) { P(capsule(0.07, 0.5, 3, 8), sd * 0.1, 0.32, 0); P(rboxGeo(0.1, 0.07, 0.26, 0.03), sd * 0.1, 0.04, 0.05); P(capsule(0.06, 0.55, 3, 8), sd * 0.25, 1.12, 0, 0, 0, sd * 0.06); }
  P(sph(0.105, 14, 10), 0, 1.66, 0.01); P(cyl(0.21, 0.21, 0.02, 18), 0, 1.75, 0.01, 0.08); P(cyl(0.09, 0.11, 0.13, 14), 0, 1.82, 0.0);
  return g;
}
function rocker(K, mat, c) {
  K.box(mat, -0.27, 0.27, 0.4, 0.5, -0.25, 0.25, c, 0.04, 1); K.cb(mat, 0.5, 0.8, 0.07, 0, 0.92, -0.3, c, -0.18, 0, 0, 0.03, 1);
  for (const sd of [-1, 1]) { K.beam(mat, [sd * 0.27, 0.68, -0.25], [sd * 0.29, 0.68, 0.25], 0.04, c); K.beam(mat, [sd * 0.27, 0.12, 0.22], [sd * 0.29, 0.68, 0.24], 0.03, c); K.beam(mat, [sd * 0.26, 0.12, -0.2], [sd * 0.26, 0.45, -0.22], 0.03, c);
    for (let k = 0; k < 4; k++) { const a0 = -0.5 + k * 0.25, a1 = a0 + 0.25; K.beam(mat, [sd * 0.27, 0.95 - Math.cos(a0) * 0.85, Math.sin(a0) * 0.85], [sd * 0.27, 0.95 - Math.cos(a1) * 0.85, Math.sin(a1) * 0.85], 0.028, c); } }
}
function buildBox(root) {
  const K = new Kit(), wall = texMat('damask', 256, 256, (g, w, h) => damask(g, w, h, { base: '#6e1e26', n: 2, stripe: true }), { vertexColors: true });
  const wallG = texMat('damaskG', 256, 256, (g, w, h) => damask(g, w, h, { base: '#7a5a3a', motif: '#5a3e28', n: 2 }), { vertexColors: true });
  // floor, walls, ceiling
  K.box(M.floor, -9, 9, -0.2, 0, -0.6, 16, 0xb08868, 0.01, 2); K.box(M.floor, -9, 9, -0.2, -0.05, -0.6, 16, 0xffffff, 0.01, 2);
  for (const sd of [-1, 1]) { K.box(wall, sd * 9, sd * 9.3, 0, 12, -4, 16, 0xffffff, 0.01, 1.6); K.box(M.woodDark, sd * 8.86 - 0.1, sd * 8.86 + 0.1, 0, 1.1, -0.6, 16, 0x7a4a34, 0.01, 1); }
  K.box(wall, -9.3, 9.3, 0, 12, 16, 16.3, 0xffffff, 0.01, 1.6); K.box(M.paint, -9.3, 9.3, 12, 12.4, -4.5, 16.3, 0x6a5468, 0.02, 1); for (const z of [0.4, 11]) for (const x of [-6, 0, 6]) K.box(M.paint, x - 2.2, x + 2.2, 11.9, 12, z - 1.6, z + 1.6, 0x8a6a7a, 0.02, 1);
  K.put(M.gold, tor(3.2, 0.12, 5, 40), 0, 11.95, 5.5, Math.PI / 2, 0, 0, 1, 1, 1, 0xc89a48); K.put(M.paint, cyl(3.1, 3.1, 0.05, 40), 0, 11.98, 5.5, 0, 0, 0, 1, 1, 1, 0x4a3a5a);
  // proscenium wall + gilt frame + valance + side drapes
  K.put(M.trim, holeWall('pros', -9.3, 9.3, 0, 12.4, [[0, 1.1, 11, 7.9, 1.0]], 0.4, 2), 0, 0, -4, 0, 0, 0, 1, 1, 1, 0xe0dcd0);
  for (const sd of [-1, 1]) { K.box(M.gold, sd * 5.5 - 0.22, sd * 5.5 + 0.22, 1.1, 8.0, -4.05, -3.85, 0xc8a060, 0.04, 1); K.put(M.paint, cyl(0.16, 0.16, 6.6, 10), sd * 5.75, 4.4, -3.85, 0, 0, 0, 1, 1, 1, 0xe8dcc0); }
  { const r = (5.5 * 5.5 + 1) / 2, cy = 8.0 + 1 - r; for (let k = 0; k < 12; k++) { const a = Math.PI / 2 - Math.asin(5.5 / r) + (k + 0.5) * 2 * Math.asin(5.5 / r) / 12; K.cb(M.gold, 2 * r * Math.sin(Math.asin(5.5 / r) / 12) + 0.04, 0.42, 0.2, Math.cos(a) * r, cy + Math.sin(a) * r + 0.1, -3.95, 0xc8a060, 0, 0, a - Math.PI / 2, 0.03, 1); } }
  K.put(M.gold, sph(0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0, 9.45, -3.85, Math.PI / 2, 0, 0, 1.6, 1, 0.5, 0xc8a060); // cartouche
  const drape = texMat('velvetF', 256, 512, (g, w, h) => velvet(g, w, h, { folds: 5, fringe: true }), { side: THREE.DoubleSide });
  mesh(root, drapeGeo(11.4, 1.3, 16, 0.07, 0.25), drape, 0, 9.0, -3.75, 0, 0, 0, false);
  for (const sd of [-1, 1]) { const m = mesh(root, drapeGeo(1.7, 7.9, 5, 0.09, 0, 16, 10), drape, sd * 4.75, 8.9, -3.8, 0, 0, 0, false); m.scale.x = 1; K.put(M.gold, tor(0.16, 0.035, 4, 12), sd * 4.4, 3.2, -3.62, 0, 0, 0, 1, 1, 1, 0xd8a848); }
  // stage: floor, apron front, footlights with tin hoods, backdrop, wing flats, a garden bench + urns
  K.box(M.floor, -8.5, 8.5, 0, 1.1, -12, -0.6, 0xc09070, 0.02, 2); K.box(M.paint, -6.2, 6.2, 0, 1.08, -0.62, -0.55, 0x3a1a1e, 0.01, 1);
  for (let x = -5.6; x <= 5.61; x += 1.4) K.box(M.gold, x - 0.6, x + 0.6, 0.25, 0.9, -0.55, -0.52, 0x8a6a3a, 0.02, 1);
  K.box(M.iron, -5.9, 5.9, 1.1, 1.22, -0.92, -0.62, 0x2a2430, 0.01, 1);
  for (let x = -5.6; x <= 5.61; x += 0.4) { K.put(M.flame, sph(0.04, 8, 6), x, 1.33, -0.8, 0, 0, 0, 1, 1.9, 1, 0xffffff); K.cb(M.iron, 0.32, 0.12, 0.02, x, 1.2, -0.66, 0x5a5a64, -0.5, 0, 0, 0.005, 1); }
  K.put(M.glowSoft, plane(11.6, 0.5), 0, 1.112, -1.25, -Math.PI / 2, 0, 0); // warm pool the footlights throw on the boards
  K.put(texMat('backdrop', 1024, 640, backdropTex, { glow: 0x6a5a48 }), plane(15, 9.2), 0, 1.1 + 4.6, -11.6);
  const wing = texMat('wing', 256, 512, (g, w, h) => wingTex(g, w, h), { alphaTest: 0.5, side: THREE.DoubleSide });
  for (const [z, s] of [[-9.6, 1], [-7.6, 0.95], [-5.4, 0.9]]) for (const sd of [-1, 1]) K.put(wing, plane(2.6, 6.0), sd * (5.6 - z * 0.05), 1.1 + 3.0 * s, z, 0, sd * 0.25, 0, 1, s, 1);
  K.box(M.paint, -8, 8, 8.4, 9.6, -6.6, -6.4, 0x2a2a48, 0.02, 1); K.box(M.paint, -8, 8, 8.6, 9.6, -9.0, -8.8, 0x2a2a48, 0.02, 1); // borders
  K.at(-1.6, 1.1, -6.8, 0.15, () => { K.box(M.paint, -0.8, 0.8, 0.42, 0.5, -0.22, 0.22, 0xd8d0c0, 0.03, 1); K.box(M.paint, -0.8, 0.8, 0.5, 0.95, -0.24, -0.18, 0xd8d0c0, 0.03, 1); for (const sd of [-1, 1]) K.box(M.paint, sd * 0.7 - 0.06, sd * 0.7 + 0.06, 0, 0.45, -0.2, 0.2, 0xc8c0b0, 0.02, 1); });
  for (const x of [-3.6, 2.6]) { K.put(M.trim, lathe('urn', [[0, 0], [0.22, 0], [0.16, 0.12], [0.12, 0.3], [0.3, 0.6], [0.32, 0.7], [0, 0.7]], 14), x, 1.1, -7.2, 0, 0, 0, 1, 1, 1, 0xd8ccb4); K.put(M.paint, sph(0.38, 10, 8), x, 2.05, -7.2, 0, 0, 0, 1, 0.8, 1, 0x3a6a3a); }
  // orchestra rail + music stands
  K.box(M.gold, -5.6, 5.6, 0.95, 1.02, 0.95, 1.05, 0xb08a40, 0.02, 1); for (let x = -5.6; x <= 5.61; x += 1.4) K.put(M.gold, cyl(0.025, 0.025, 1.0, 6), x, 0.5, 1.0, 0, 0, 0, 1, 1, 1, 0xb08a40);
  K.box(M.velvet, -5.6, 5.6, 0, 0.7, 0.98, 1.02, 0x7a1e24, 0.01, 1);
  for (const x of [-3.6, -1.6, 1.2, 3.4]) { K.beam(M.iron, [x, 0, 0.3], [x, 1.0, 0.3], 0.02, 0x2a2430, true); K.cb(M.iron, 0.4, 0.3, 0.02, x, 1.05, 0.32, 0x2a2430, -0.4); K.put(M.paper, plane(0.36, 0.26), x, 1.06, 0.35, -0.4, 0, 0); }
  // proscenium boxes: right (presidential above) and left
  const boxHoles = (s) => [[s * 2.3, 1.6, 2.6, 2.25, 0.3], [s * 3.05, 4.4, 1.1, 2.75, true], [s * 1.55, 4.4, 1.1, 2.75, true]];
  for (const sd of [1, -1]) K.at(sd * BX.x, 0, 0, -sd * Math.PI / 2, () => {
    const s = -sd, lo = Math.min(s * 4, s * 0.6), hi = Math.max(s * 4, s * 0.6); K.put(M.trim, holeWall('boxf' + sd, lo, hi, 0, 12.4, boxHoles(s), 0.25, 2), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xe4dcd0);
    for (const [cx, y0, w, h] of boxHoles(s).slice(1)) { archTrim(K, cx, y0, w, h, 0xd8a848, 0.06); K.box(M.velvet, cx - w / 2 - 0.02, cx + w / 2 + 0.02, BX.rail - 0.06, BX.rail + 0.06, -0.05, 0.16, 0x8a2028, 0.04, 1); }
    K.box(M.gold, lo, hi, 3.95, 4.3, -0.05, 0.22, 0xc8a060, 0.03, 1); K.box(M.gold, lo, hi, 7.55, 7.85, -0.05, 0.25, 0xc8a060, 0.03, 1); K.box(M.trim, lo, hi, 7.85, 8.3, -0.05, 0.18, 0xe8d8b8, 0.03, 1);
    for (const x of [lo + 0.12, hi - 0.12]) { K.box(M.gold, x - 0.12, x + 0.12, 1.1, 7.6, 0, 0.12, 0xc8a060, 0.03, 1); }
    K.box(M.gold, s * 2.3 - 1.35, s * 2.3 + 1.35, 1.45, 1.6, -0.03, 0.14, 0xc8a060, 0.02, 1);
  });
  // box interiors (both sides): floors, walls, back wall with door (right upper), lower boxes dark
  for (const sd of [1, -1]) { const x0 = sd * BX.x, x1 = sd * BX.back, xa = Math.min(x0, x1), xb = Math.max(x0, x1);
    K.box(M.floor, xa, xb, BX.floor - 0.15, BX.floor, BX.z0, BX.z1, 0x8a3a30, 0.01, 1); K.box(M.paint, xa, xb, 1.45, 1.6, BX.z0, BX.z1, 0x3a1e1e, 0.01, 1);
    K.box(wall, xa, xb, 0, 12, BX.z0 - 0.2, BX.z0, 0xd8b0a8, 0.01, 1.2); K.box(wall, xa, xb, 0, 12, BX.z1, BX.z1 + 0.2, 0xd8b0a8, 0.01, 1.2); K.box(M.paint, xa, xb, BX.ceil, BX.ceil + 0.15, BX.z0, BX.z1, 0x3a2028, 0.01, 1);
    if (sd < 0) K.box(wall, Math.min(x1, x1 - 0.2), Math.max(x1, x1 - 0.2), 0, 12, BX.z0, BX.z1, 0x906868, 0.01, 1.2);
    else { K.box(wall, x1, x1 + 0.2, 0, BX.floor, BX.z0, BX.z1, 0x906868, 0.01, 1.2); K.box(wall, x1, x1 + 0.2, BX.ceil, 12, BX.z0, BX.z1, 0x906868, 0.01, 1.2); }
    for (const zc of [-3.05, -1.55]) for (const e of [-1, 1]) K.put(M.fabric, drapeGeo(0.32, 2.4, 3, 0.03, 0, 6, 6), x0 + sd * 0.12, 7.0, zc + e * 0.5, 0, -sd * Math.PI / 2, 0, 1, 1, 1, 0xfff4e6);
    K.box(M.paint, xa + 0.1, xb - 0.1, 1.6, 2.6, BX.z0 + 0.4, BX.z1 - 0.4, 0x1a1218, 0.02, 1);
  }
  K.at(BX.back, 0, 0, -Math.PI / 2, () => { K.put(wall, holeWall('boxback', -4, -0.6, BX.floor - 0.05, BX.ceil, [[BX.door, BX.floor, 0.95, 2.15, false]], 0.2, 1.2), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xe0b8b0);
    K.box(M.woodDark, BX.door - 0.6, BX.door + 0.6, BX.floor + 2.15, BX.floor + 2.3, -0.02, 0.06, 0x4a2a20, 0.01, 1); for (const e of [-1, 1]) K.box(M.woodDark, BX.door + e * 0.53 - 0.06, BX.door + e * 0.53 + 0.06, BX.floor, BX.floor + 2.2, -0.02, 0.06, 0x4a2a20, 0.01, 1); });
  // the vestibule / corridor behind the door: barely lit, so a figure there reads as a shadow
  K.box(M.paint, BX.back + 0.2, BX.back + 2.2, BX.floor - 0.15, BX.floor, BX.z0, BX.z1, 0x2a1a18, 0.01, 1); K.box(M.paint, BX.back + 0.2, BX.back + 2.2, BX.floor + 2.6, BX.floor + 2.75, BX.z0, BX.z1, 0x1a1214, 0.01, 1);
  for (const z of [BX.z0, BX.z1]) K.box(M.paint, BX.back + 0.2, BX.back + 2.2, BX.floor, BX.floor + 2.6, z - 0.1, z + 0.1, 0x221618, 0.01, 1);
  K.put(texMat('corr', 256, 256, (g, w, h) => damask(g, w, h, { base: '#4a3630', n: 2 }), { glow: 0x5a3a28 }), plane(3.4, 2.6), BX.back + 2.1, BX.floor + 1.3, -2.3, 0, -Math.PI / 2, 0);
  K.cb(M.woodDark, 0.06, 2.1, 0.9, BX.back + 0.45, BX.floor + 1.05, BX.door + 0.68, 0x4a2a1e, 0, 0.9, 0, 0.01, 1); // door leaf swung open into the corridor
  // presidential box dressing: flags draped over the balustrade, bunting swags, the framed portrait on the pillar, a flag on a staff
  const flagV = texMat('flagV', 512, 512, (g, w, h) => flagTex(g, w, h, { folds: 3 }), { side: THREE.DoubleSide }), bunt = texMat('bunt', 512, 256, buntingTex, { side: THREE.DoubleSide });
  for (const zc of [-3.05, -1.55]) { mesh(root, drapeGeo(1.25, 1.35, 3, 0.05, 0.05, 16, 8), flagV, BX.x - 0.2, BX.rail + 0.05, zc, 0, -Math.PI / 2, 0, false); mesh(root, swagGeo(1.25, 0.25, 0.12, 0.1), bunt, BX.x - 0.15, 7.45, zc, 0, -Math.PI / 2, 0, false); }
  mesh(root, swagGeo(2.7, 0.3, 0.12, 0.1), bunt, BX.x - 0.15, 3.85, -2.3, 0, -Math.PI / 2, 0, false);
  K.put(M.gold, tor(0.28, 0.045, 5, 24), BX.x - 0.08, 5.95, -2.3, 0, -Math.PI / 2, 0, 1, 1.3, 1, 0xd8a848); K.put(texMat('portrait', 256, 320, portraitTex), cached('ov', () => new THREE.CircleGeometry(0.27, 24)), BX.x - 0.07, 5.95, -2.3, 0, -Math.PI / 2, 0, 1, 1.3, 1);
  K.beam(M.gold, [BX.x - 0.05, 6.4, -2.3], [BX.x - 0.55, 7.6, -2.3], 0.02, 0xc8a050, true); K.put(M.gold, sph(0.05, 8, 6), BX.x - 0.56, 7.63, -2.3, 0, 0, 0, 1, 1, 1, 0xd8a848);
  mesh(root, cached('stfl', () => { const g = new THREE.PlaneGeometry(0.9, 0.6, 10, 2), p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.06 * Math.sin(p.getX(i) * 7)); g.computeVertexNormals(); return g; }), texMat('flagS', 256, 192, (g, w, h) => { g.fillStyle = '#2a3a7a'; g.fillRect(0, 0, w, h); txt(g, '★', w / 2, h / 2, w, h * 0.6, { col: '#e8d8a0', bold: false }); modulate(g, w, h, (u, v) => 0.85 + 0.15 * Math.sin(u * 14)); }, { side: THREE.DoubleSide }), BX.x - 0.42, 7.3, -2.3, 0, -Math.PI / 2, -0.7, false).scale.setScalar(0.7);
  // box furniture: the rocking chair (holds the silhouette), a second chair, a small sofa against the wall; gas jet in the box
  const pres = new THREE.Group(); pres.position.set(BX.chair[0], BX.floor, BX.chair[1]); pres.rotation.y = -2.15; root.add(pres);
  { const KR = new Kit(); rocker(KR, M.velvet, 0x3a1418); KR.build(pres); } const fig = seatedFigure(M.sil); pres.add(fig);
  K.at(7.1, BX.floor, -2.85, -2.3, () => { K.box(M.velvet, -0.24, 0.24, 0.4, 0.5, -0.22, 0.22, 0x5a1a20, 0.04, 1); K.box(M.velvet, -0.24, 0.24, 0.5, 1.0, -0.25, -0.18, 0x5a1a20, 0.04, 1); });
  K.at(8.15, BX.floor, -3.4, -Math.PI / 2, () => { K.box(M.velvet, -0.5, 0.5, 0.2, 0.45, -0.25, 0.25, 0x6a1e24, 0.05, 1); K.box(M.velvet, -0.5, 0.5, 0.45, 0.85, -0.28, -0.15, 0x6a1e24, 0.05, 1); });
  // the shadowy figure (hidden until setFigure)
  const shadow = standingFigure(M.sil); shadow.position.set(BX.back + 0.55, BX.floor, BX.door); shadow.rotation.y = -Math.PI / 2; shadow.visible = false; root.add(shadow);
  // dress circle (back + side galleries) with gilt fronts, columns, gas sconces; bunting along the box-side gallery
  K.box(M.paint, -9, 9, 4.0, 4.35, 10.5, 16, 0x3a2a2a, 0.02, 1); K.box(M.trim, -9, 9, 4.0, 5.1, 10.4, 10.6, 0xead8b4, 0.03, 1); K.box(M.gold, -9, 9, 5.05, 5.18, 10.35, 10.68, 0xc8a060, 0.03, 1);
  for (const sd of [-1, 1]) { const xf = sd * 7.6; K.box(M.paint, Math.min(xf, sd * 9), Math.max(xf, sd * 9), 4.0, 4.35, 0, 10.5, 0x3a2a2a, 0.02, 1); K.box(M.trim, xf - 0.1, xf + 0.1, 4.0, 5.1, 0, 10.5, 0xead8b4, 0.03, 1); K.box(M.gold, xf - 0.16, xf + 0.16, 5.05, 5.18, 0, 10.5, 0xc8a060, 0.03, 1);
    for (const z of [0.2, 3.6, 7.0, 10.4]) K.put(M.gold, cyl(0.07, 0.08, 4.0, 10), xf, 2.0, z, 0, 0, 0, 1, 1, 1, 0xc8a050);
    for (let z = 1.0; z < 10.4; z += 3.0) mesh(root, swagGeo(2.6, 0.28, 0.1, 0.08), bunt, xf - sd * 0.12, 5.0, z + 0.8, 0, -sd * Math.PI / 2, 0, false); }
  for (const x of [-7, -3.5, 0, 3.5, 7]) K.put(M.gold, cyl(0.07, 0.08, 4.0, 10), x, 2.0, 10.5, 0, 0, 0, 1, 1, 1, 0xc8a050);
  // house lights: chandelier, wall + gallery sconces (houseGlow dims with setDim)
  K.put(M.gold, tor(1.3, 0.06, 5, 32), 0, 9.3, 5.5, Math.PI / 2, 0, 0, 1, 1, 1, 0xc8a060); K.put(M.gold, tor(0.8, 0.05, 5, 24), 0, 8.8, 5.5, Math.PI / 2, 0, 0, 1, 1, 1, 0xc8a060);
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; K.beam(M.gold, [0, 11.95, 5.5], [Math.cos(a) * 1.3, 9.3, 5.5 + Math.sin(a) * 1.3], 0.02, 0xc8a050, true); }
  for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; K.put(M.houseGlow, sph(0.1, 8, 6), Math.cos(a) * 1.3, 9.48, 5.5 + Math.sin(a) * 1.3, 0, 0, 0, 1, 1.3, 1, 0xffffff); }
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + 0.2; K.put(M.houseGlow, sph(0.09, 8, 6), Math.cos(a) * 0.8, 8.95, 5.5 + Math.sin(a) * 0.8, 0, 0, 0, 1, 1.3, 1, 0xffffff); }
  const sconce = (x, y, z, ry) => K.at(x, y, z, ry, () => { K.beam(M.gold, [0, 0, 0], [0, 0.12, 0.3], 0.025, 0xc8a050, true); K.put(M.houseGlow, sph(0.1, 10, 8), 0, 0.24, 0.32, 0, 0, 0, 1, 1.2, 1, 0xffffff); K.put(M.gold, cyl(0.05, 0.03, 0.06, 8), 0, 0.12, 0.31, 0, 0, 0, 1, 1, 1, 0xc8a050); });
  for (const sd of [-1, 1]) for (const z of [2, 6, 10, 14]) { sconce(sd * 8.98, 2.6, z, -sd * Math.PI / 2); sconce(sd * 8.98, 6.4, z, -sd * Math.PI / 2); }
  for (const sd of [-1, 1]) for (const z of [1.8, 5.3, 8.8]) sconce(sd * 7.5, 5.25, z, -sd * Math.PI / 2);
  K.beam(M.gold, [BX.back, 6.3, -1.3], [BX.back - 0.25, 6.45, -1.3], 0.015, 0xc8a050, true); K.put(M.houseGlow, sph(0.07, 8, 6), BX.back - 0.27, 6.55, -1.3, 0, 0, 0, 1, 1.3, 1, 0xffffff); // gas jet inside the box (behind the president: rims his silhouette)
  K.build(root, 8);
  // seats (red velvet, iron standards) + audience silhouettes, instanced
  const KS = new Kit(); KS.box(M.velvet, -0.25, 0.25, 0.42, 0.52, -0.2, 0.22, 0x9a2a32, 0.05, 1); KS.box(M.velvet, -0.25, 0.25, 0.52, 0.98, 0.18, 0.28, 0x9a2a32, 0.05, 1);
  for (const sd of [-1, 1]) KS.box(M.iron, sd * 0.28 - 0.025, sd * 0.28 + 0.025, 0, 0.72, -0.15, 0.3, 0x2a2228, 0.01, 1); KS.box(M.woodDark, -0.26, 0.26, 0.95, 1.0, 0.24, 0.3, 0x5a3424, 0.01, 1);
  const seatPf = KS.prefab(), seatList = [], aud = [], R = rng(77);
  for (let r = 0; r < 12; r++) { const z = 2.0 + r * 0.98; for (let x = -7.2; x <= 7.21; x += 0.6) { if (Math.abs(x) < 0.7) continue; seatList.push([x, 0, z, 0, 1]); if (R() < 0.72) aud.push([x + (R() - 0.5) * 0.05, 0, z + 0.02, (R() - 0.5) * 0.3, 0.95 + R() * 0.1, [0x3a2e44, 0x2a2436, 0x4a3438, 0x24283a, 0x5a4a3e, 0x3a3030][(R() * 6) | 0], 0.95 + R() * 0.1]); } }
  instance(root, seatPf, seatList);
  const KA = new Kit(); KA.put(M.crowd, capsule(0.19, 0.28, 4, 10), 0, 0.82, 0.08, -0.1, 0, 0, 1.25, 1, 0.7); KA.put(M.crowd, sph(0.11, 12, 8), 0, 1.22, 0.04, 0, 0, 0, 0.95, 1.1, 1); KA.put(M.crowd, sph(0.12, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), 0, 1.26, 0.06, 0, 0, 0, 1, 0.8, 1);
  const audPf = KA.prefab(); instance(root, audPf, aud.filter((a) => a[2] > 4.5)); instance(root, audPf, aud.filter((a, i) => a[2] <= 4.5 && i % 2));
  const gal = []; for (let x = -8.2; x <= 8.2; x += 0.62) if (R() < 0.6) gal.push([x, 4.35, 11.1 + (R() - 0.5) * 0.1, 0, 0.95, [0x3a2e44, 0x2a2436, 0x4a3438][(R() * 3) | 0]]); instance(root, audPf, gal);
  return { president: pres, presFigure: fig, shadow };
}

// small oriental rug
function rugTex(g, w, h, o = {}) {
  const a = o.a || '#6a1e22', b = o.b || '#1e2a4a', c = o.c || '#d8b060'; g.fillStyle = a; g.fillRect(0, 0, w, h); g.strokeStyle = b; g.lineWidth = w * 0.05; g.strokeRect(w * 0.06, h * 0.06, w * 0.88, h * 0.88); g.strokeStyle = c; g.lineWidth = w * 0.012; g.strokeRect(w * 0.12, h * 0.12, w * 0.76, h * 0.76);
  const st = o.small ? 0.09 : 0.155, sz = o.small ? 9 : 16; for (let y = h * 0.2; y < h * 0.84; y += h * st) for (let x = w * 0.2; x < w * 0.82; x += w * st * 1.1) { g.fillStyle = o.small ? css(shade(hex(a), 0.7)) : '#e8d0a0'; g.beginPath(); g.moveTo(x, y - sz); g.lineTo(x + sz * 0.9, y); g.lineTo(x, y + sz); g.lineTo(x - sz * 0.9, y); g.fill(); g.fillStyle = o.small ? c : b; g.beginPath(); g.arc(x, y, sz * 0.3, 0, 7); g.fill(); }
  g.fillStyle = '#e8dcc0'; for (let x = 0; x < w; x += 6) { g.fillRect(x, 0, 2, h * 0.025); g.fillRect(x, h * 0.975, 2, h * 0.025); } modulate(g, w, h, (u, v) => 0.85 + 0.2 * fbm(u, v, 3, 3, 3, o.seed || 79));
}
// prop skull (Yorick): ivory cranium with dark sockets, built facing +z, resting on y = 0
function skull(K, x, y, z, ry) {
  K.at(x, y, z, ry, () => { const iv = 0xd8d0c0; K.put(M.paint, sph(0.088, 18, 14), 0, 0.105, -0.015, 0, 0, 0, 0.9, 0.92, 1.12, iv); K.put(M.paint, sph(0.062, 14, 10), 0, 0.065, 0.035, 0, 0, 0, 0.95, 0.85, 0.95, iv);
    K.box(M.paint, -0.034, 0.034, 0.0, 0.035, 0.025, 0.075, 0xd8c8a8, 0.014, 1); for (const sd of [-1, 1]) { K.put(M.dark, sph(0.021, 10, 8), sd * 0.03, 0.09, 0.074, 0, 0, 0, 0.95, 1.15, 0.5); K.put(M.paint, sph(0.02, 8, 6), sd * 0.058, 0.06, 0.04, 0, 0, 0, 0.6, 1, 1, iv); }
    K.put(M.dark, cone(0.012, 0.028, 3), 0, 0.056, 0.093, Math.PI, 0, 0, 1, 1, 0.5); K.box(M.paint, -0.026, 0.026, 0.03, 0.042, 0.068, 0.078, 0xf0e6d0, 0.003, 1); for (let k = -2; k <= 2; k++) K.box(M.dark, k * 0.01 - 0.0012, k * 0.01 + 0.0012, 0.03, 0.042, 0.075, 0.08, 0x000000, 0.0005); });
}
// ================================================================= EDWIN BOOTH'S DRESSING ROOM (1864)
// local frame: floor y = 0, room x -2.2..2.2, back wall z = -1.8, open to +z (camera); ceiling 3.0. Makeup table + mirror on the back wall.
const DR = { x0: -2.2, x1: 2.2, zb: -1.8, zf: 2.8, H: 3.0, table: 0.78 };
function buildDressing(root) {
  const K = new Kit(), D = DR, paper = texMat('drPaper', 256, 256, (g, w, h) => damask(g, w, h, { base: '#5e6a58', motif: '#4e5848', n: 4, stripe: true, seed: 11 }), { vertexColors: true });
  K.box(M.floor, D.x0, D.x1, -0.1, 0, D.zb, D.zf, 0xa07858, 0.01, 1.6);
  K.box(paper, D.x0, D.x1, 0, D.H, D.zb - 0.15, D.zb, 0xffffff, 0.01, 1.2); for (const sd of [-1, 1]) K.box(paper, sd > 0 ? D.x1 : D.x0 - 0.15, sd > 0 ? D.x1 + 0.15 : D.x0, 0, D.H, D.zb, D.zf, 0xffffff, 0.01, 1.2);
  K.box(M.paint, D.x0 - 0.15, D.x1 + 0.15, D.H, D.H + 0.12, D.zb - 0.15, D.zf, 0x4a3a34, 0.01, 1); K.box(M.woodDark, D.x0, D.x1, D.H - 0.25, D.H - 0.05, -0.2, 0.0, 0x5a3a28, 0.02, 1);
  K.box(M.woodDark, D.x0, D.x1, 0, 0.9, D.zb, D.zb + 0.04, 0x6a4430, 0.01, 1); for (const sd of [-1, 1]) K.box(M.woodDark, sd > 0 ? D.x1 - 0.04 : D.x0, sd > 0 ? D.x1 : D.x0 + 0.04, 0, 0.9, D.zb, D.zf, 0x6a4430, 0.01, 1);
  K.box(M.trim, D.x0, D.x1, 0.88, 0.94, D.zb, D.zb + 0.06, 0x5a3a28, 0.01, 1); for (const sd of [-1, 1]) K.box(M.trim, sd > 0 ? D.x1 - 0.06 : D.x0, sd > 0 ? D.x1 : D.x0 + 0.06, 0.88, 0.94, D.zb, D.zf, 0x5a3a28, 0.01, 1);
  K.put(texMat('rugD', 512, 384, (g, w, h) => rugTex(g, w, h, { a: '#4a2224', b: '#24323a', c: '#a88a50', seed: 81, small: true })), plane(1.9, 1.3), 0.1, 0.006, -0.35, -Math.PI / 2, 0, 0);
  // makeup table, mirror (gilt frame), gas sconces with glass globes, supply pipes
  K.box(M.woodDark, -0.85, 0.85, D.table - 0.05, D.table, D.zb, D.zb + 0.6, 0x6a3e28, 0.02, 1); K.box(M.woodDark, -0.8, 0.8, D.table - 0.2, D.table - 0.05, D.zb + 0.02, D.zb + 0.56, 0x5a3424, 0.02, 1);
  for (const x of [-0.78, 0.78]) for (const z of [D.zb + 0.06, D.zb + 0.54]) K.put(M.woodDark, cyl(0.025, 0.02, D.table - 0.05, 8), x, (D.table - 0.05) / 2, z, 0, 0, 0, 1, 1, 1, 0x5a3424);
  for (const x of [-0.4, 0.4]) { K.put(M.gold, sph(0.015, 6, 4), x, D.table - 0.12, D.zb + 0.565, 0, 0, 0, 1, 1, 1, 0xd8a848); }
  K.box(M.gold, -0.6, 0.6, 0.92, 2.0, D.zb, D.zb + 0.05, 0xa88a50, 0.02, 1); K.put(texMat('mirror', 256, 256, mirrorTex, { glow: 0x1e1a1e }), plane(1.04, 0.92), 0, 1.46, D.zb + 0.055);
  K.put(M.gold, sph(0.1, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0, 2.0, D.zb + 0.03, 0, 0, 0, 1.6, 1, 0.4, 0xc89a48);
  for (const sd of [-1, 1]) { const x = sd * 0.8; K.beam(M.gold, [x, 1.45, D.zb], [x, 1.5, D.zb + 0.28], 0.018, 0xb88a40, true); K.put(M.gold, cyl(0.04, 0.025, 0.06, 10), x, 1.52, D.zb + 0.28, 0, 0, 0, 1, 1, 1, 0xc89a48);
    K.put(M.lampGlass, sph(0.075, 14, 10), x, 1.62, D.zb + 0.28, 0, 0, 0, 1, 1.15, 1, 0xffffff); K.put(M.flame, sph(0.022, 8, 6), x, 1.6, D.zb + 0.28, 0, 0, 0, 1, 1.8, 1, 0xffffff);
    K.beam(M.iron, [x, 1.45, D.zb + 0.02], [x, D.H, D.zb + 0.02], 0.012, 0x5a4a3a, true); K.put(M.gold, cyl(0.03, 0.03, 0.03, 8), x, 1.45, D.zb + 0.02, Math.PI / 2, 0, 0, 1, 1, 1, 0xb88a40); }
  // the clutter on the table
  const R = rng(19), T = D.table;
  for (const [x, z, r, h, c] of [[0.55, -1.62, 0.04, 0.05, 0xd8c8b0], [0.64, -1.55, 0.035, 0.035, 0xc84a3a], [0.48, -1.5, 0.03, 0.04, 0xe8d8c8], [-0.2, -1.66, 0.028, 0.06, 0x3a5a7a], [-0.12, -1.62, 0.03, 0.03, 0xd8a8a0], [0.68, -1.68, 0.045, 0.09, 0x5a7a5a], [-0.68, -1.66, 0.04, 0.16, 0x7a5a8a]]) { K.put(M.paint, cyl(r, r, h, 12), x, T + h / 2, z, 0, 0, 0, 1, 1, 1, c); K.put(M.paint, cyl(r * 1.05, r * 1.05, 0.012, 12), x, T + h + 0.006, z, 0, 0, 0, 1, 1, 1, new THREE.Color(c).multiplyScalar(0.7)); }
  for (let k = 0; k < 5; k++) { const x = 0.36 + k * 0.035, z = -1.58 + R() * 0.04; K.beam(M.paint, [x, T + 0.006, z], [x + 0.03, T + 0.006, z + 0.15], 0.006, 0x5a3a24, true, 4); K.put(M.paint, cone(0.008, 0.035, 5), x - 0.004, T + 0.006, z - 0.012, -Math.PI / 2 - 0.2, 0, 0, 1, 1, 1, 0x2a2024); }
  K.put(M.paint, sph(0.05, 12, 8), 0.12, T + 0.02, -1.62, 0, 0, 0, 1, 0.45, 1, 0xf0c8c0); K.box(M.paint, 0.2, 0.36, T, T + 0.04, -1.7, -1.6, 0x8a2a2a, 0.01, 1); K.box(M.paint, 0.21, 0.35, T + 0.04, T + 0.045, -1.69, -1.61, 0xd8b050, 0.005, 1);
  for (let k = 0; k < 4; k++) K.beam(M.paint, [0.22 + k * 0.03, T + 0.05, -1.66], [0.23 + k * 0.03, T + 0.05, -1.64], 0.012, [0xd85a4a, 0xe8c0a0, 0x3a3a5a, 0xf0e0d0][k], true, 5);
  K.put(M.paint, cyl(0.022, 0.02, 0.09, 8), 0.72, T + 0.045, -1.38, 0, 0, 0, 1, 1, 1, 0xf2ead8); K.put(M.flame, sph(0.01, 6, 4), 0.72, T + 0.105, -1.38, 0, 0, 0, 1, 2, 1, 0xffffff); K.put(M.gold, cyl(0.05, 0.05, 0.01, 12), 0.72, T + 0.005, -1.38, 0, 0, 0, 1, 1, 1, 0xb88a40);
  K.put(M.paint, lathe('vase', [[0, 0], [0.04, 0], [0.05, 0.05], [0.025, 0.14], [0.035, 0.18], [0, 0.18]], 12), -0.6, T, -1.48, 0, 0, 0, 1, 1, 1, 0x3a5a8a);
  for (let k = 0; k < 6; k++) { const a = k * 1.1, x = -0.6 + Math.cos(a) * 0.05, z = -1.48 + Math.sin(a) * 0.05, y = T + 0.24 + (k % 3) * 0.04; K.beam(M.paint, [-0.6, T + 0.16, -1.48], [x, y, z], 0.004, 0x3a5a2a); K.put(M.paint, sph(0.028, 8, 6), x, y, z, 0, 0, 0, 1, 1, 1, k % 2 ? 0xc8303a : 0xe8d8d0); }
  skull(K, -0.28, T, -1.45, 0.45);
  K.box(M.paper, -0.78, -0.53, T, T + 0.04, -1.36, -1.12, 0x6a2a24, 0.01, 1); K.box(M.paper, -0.77, -0.54, T + 0.04, T + 0.045, -1.35, -1.13, 0xd8cebc, 0.003, 1); // prompt book
  // chair, Hamlet costume on a stand, the trunk, washstand, cloak + hat on hooks, playbills
  K.at(0.62, 0, -0.75, -0.55, () => { K.box(M.woodDark, -0.22, 0.22, 0.44, 0.48, -0.2, 0.2, 0x5a3424, 0.02, 1); for (const [x, z] of [[-0.18, -0.16], [0.18, -0.16], [-0.18, 0.16], [0.18, 0.16]]) K.put(M.woodDark, cyl(0.018, 0.015, 0.44, 6), x, 0.22, z, 0, 0, 0, 1, 1, 1, 0x5a3424);
    for (const sd of [-1, 1]) K.beam(M.woodDark, [sd * 0.18, 0.46, 0.18], [sd * 0.19, 0.95, 0.22], 0.025, 0x5a3424); K.cb(M.woodDark, 0.4, 0.1, 0.025, 0, 0.88, 0.21, 0x5a3424, 0, 0, 0, 0.01, 1); K.cb(M.woodDark, 0.36, 0.06, 0.02, 0, 0.68, 0.2, 0x5a3424, 0, 0, 0, 0.01, 1); });
  K.at(-1.5, 0, -0.95, 0.5, () => { const bk = 0x1e1a24; for (let k = 0; k < 3; k++) { const a = k * 2.1; K.beam(M.woodDark, [0, 0.25, 0], [Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3], 0.025, 0x4a2a1c); } K.put(M.woodDark, cyl(0.02, 0.02, 1.0, 6), 0, 0.5, 0, 0, 0, 0, 1, 1, 1, 0x4a2a1c);
    K.put(M.velvetBk, lathe('doublet', [[0.0, 0.9], [0.2, 0.9], [0.24, 0.98], [0.19, 1.15], [0.2, 1.3], [0.23, 1.42], [0.14, 1.52], [0.06, 1.55], [0, 1.55]], 18), 0, 0, 0, 0, 0, 0, 1.1, 1, 0.75, bk);
    K.put(M.velvetBk, lathe('skirt', [[0.2, 0.92], [0.27, 0.72], [0.28, 0.7], [0.2, 0.92]], 18), 0, 0, 0, 0, 0, 0, 1.1, 1, 0.8, bk);
    K.put(M.fabric, tor(0.075, 0.025, 6, 16), 0, 1.55, 0, Math.PI / 2, 0, 0, 1, 1, 1, 0xf4efe4); K.box(M.gold, -0.2, 0.2, 0.93, 0.97, -0.13, 0.15, 0x8a6a3a, 0.01, 1);
    for (let k = 0; k < 9; k++) { const a = -1.2 + k * 0.3; K.put(M.gold, tor(0.012, 0.004, 3, 6), Math.sin(a) * 0.13, 1.42 - Math.cos(a) * 0.17 + 0.17 - 0.12, 0.15 + Math.cos(a) * 0.01, 0, 0, 0, 1, 1, 1, 0xe0b850); } K.put(M.gold, cyl(0.035, 0.035, 0.008, 12), 0, 1.23, 0.16, Math.PI / 2, 0, 0, 1, 1, 1, 0xe8c060);
    for (let k = 0; k < 6; k++) K.box(M.fabric, -0.01, 0.01, 1.0 + k * 0.08, 1.04 + k * 0.08, 0.15, 0.17, 0x8a8a9a, 0.005, 1); });
  mesh(root, drapeGeo(0.7, 1.15, 4, 0.05, 0, 12, 6), texMat('cloak', 256, 256, (g, w, h) => velvet(g, w, h, { base: '#1e1a26', folds: 4 }), { side: THREE.DoubleSide }), -1.5 - 0.08, 1.52, -0.95 - 0.16, 0.12, 0.5 + Math.PI, 0, false);
  K.at(1.5, 0, -1.15, -0.25, () => { const tr = 0x5a3a2a; K.box(M.wood, -0.48, 0.48, 0, 0.5, -0.28, 0.28, tr, 0.03, 1); for (const x of [-0.3, 0.3]) K.box(M.paint, x - 0.03, x + 0.03, -0.005, 0.505, -0.285, 0.285, 0x2a1e1a, 0.005, 1);
    for (const [x, z] of [[-0.48, -0.28], [0.48, -0.28], [-0.48, 0.28], [0.48, 0.28]]) K.box(M.gold, x - 0.04, x + 0.04, 0.0, 0.08, z - 0.04, z + 0.04, 0xb88a40, 0.01, 1);
    K.at(0, 0.5, -0.28, 0, () => { K.cb(M.wood, 0.96, 0.08, 0.56, 0, 0.27, -0.06, tr, -1.35 + Math.PI / 2, 0, 0, 0.02, 1); });
    for (const [x, c] of [[-0.25, 0x6a1e3a], [0.0, 0xd8c8a0], [0.22, 0x2a3a6a]]) K.put(M.cloth, sph(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), x, 0.42, 0.02, 0, 0, 0, 1.2, 0.4, 1.1, c);
    K.put(M.gold, tor(0.1, 0.01, 4, 16), 0.3, 0.58, 0.1, Math.PI / 2 - 0.3, 0, 0, 1, 1, 1, 0xe0b850); });
  K.at(-1.8, 0, -1.45, 0.4, () => { K.box(M.woodDark, -0.3, 0.3, 0.74, 0.78, -0.22, 0.22, 0x5a3424, 0.02, 1); for (const [x, z] of [[-0.26, -0.18], [0.26, -0.18], [-0.26, 0.18], [0.26, 0.18]]) K.put(M.woodDark, cyl(0.02, 0.02, 0.74, 6), x, 0.37, z, 0, 0, 0, 1, 1, 1, 0x5a3424);
    K.put(M.paint, lathe('basin', [[0, 0], [0.08, 0], [0.18, 0.08], [0.2, 0.09], [0, 0.09]], 18), 0, 0.78, 0, 0, 0, 0, 1, 1, 1, 0xf0ece4); K.put(M.paint, lathe('jug', [[0, 0], [0.07, 0], [0.09, 0.1], [0.06, 0.2], [0.07, 0.26], [0, 0.26]], 14), 0.02, 0.8, 0, 0, 0, 0, 1, 1, 1, 0xe8e4dc); });
  K.box(M.woodDark, D.x1 - 0.06, D.x1, 1.7, 1.8, -0.2, 1.0, 0x5a3424, 0.01, 1); for (const z of [0.0, 0.4, 0.8]) K.beam(M.gold, [D.x1 - 0.04, 1.75, z], [D.x1 - 0.16, 1.82, z], 0.012, 0xb88a40, true);
  K.put(M.paint, cyl(0.13, 0.11, 0.18, 14), D.x1 - 0.2, 1.93, 0.4, 0, 0, 0.2, 1, 1, 1, 0x1a1820); K.put(M.paint, cyl(0.2, 0.2, 0.012, 16), D.x1 - 0.18, 1.84, 0.4, 0, 0, 0.2, 1, 1, 1, 0x1a1820);
  mesh(root, drapeGeo(0.5, 1.3, 3, 0.05, 0, 10, 6), texMat('cloak2', 256, 256, (g, w, h) => velvet(g, w, h, { base: '#3a2a3a', folds: 3 }), { side: THREE.DoubleSide }), D.x1 - 0.12, 1.8, 0.0, 0, -Math.PI / 2, 0, false);
  K.box(M.woodDark, D.x1 - 0.05, D.x1, 0, 2.1, 1.2, 2.1, 0x4a2c1e, 0.01, 1); K.put(M.gold, sph(0.03, 8, 6), D.x1 - 0.06, 1.0, 1.3, 0, 0, 0, 1, 1, 1, 0xc89a48); // door
  for (const [x, y, w, h, k, r] of [[-1.25, 1.75, 0.52, 0.78, 'hamlet', 0.02], [1.3, 1.72, 0.44, 0.66, 'hamlet2', -0.03], [1.9, 1.45, 0.4, 0.6, 'richelieu', 0.04], [-1.0, 1.15, 0.3, 0.45, 'hamlet2', -0.05]]) { K.put(billMat(k), plane(w, h), x, y, D.zb + 0.012, 0, 0, r); for (const sx of [-1, 1]) K.put(M.gold, sph(0.008, 6, 4), x + sx * w * 0.42, y + h * 0.44, D.zb + 0.016, 0, 0, 0, 1, 1, 1, 0xd8b050); }
  K.put(billMat('hamlet'), plane(0.7, 1.05), D.x0 + 0.012, 1.65, 0.7, 0, Math.PI / 2, 0.02);
  K.build(root);
  // the letter (doc mesh with painter hook) + its envelope beside it
  const letter = mesh(root, plane(0.21, 0.28), toon({ map: mkTex(512, 680, (g, w, h) => paintLetter(g, w, h)) }), 0.12, T + 0.003, -1.3, -Math.PI / 2, 0, 0.2, false);
  mesh(root, plane(0.2, 0.11), texMat('drEnv', 256, 140, (g, w, h) => { PT.paper(g, w, h, { base: '#e8dcc0', seed: 55 }); g.fillStyle = '#2a2440'; g.font = `italic ${h * 0.14 | 0}px ${SERIF}`; g.fillText('Edwin Booth, Esq.', w * 0.3, h * 0.55); g.fillText('Winter Garden', w * 0.36, h * 0.72); g.fillStyle = '#8a2a2a'; g.fillRect(w * 0.8, h * 0.1, w * 0.12, h * 0.22); }), 0.5, T + 0.002, -1.6, -Math.PI / 2, 0, -0.35, false);
  return { letter };
}

// ================================================================= ROBERT LINCOLN'S STUDY (Chicago, 1900s)
// local frame: floor y = 0, room x -2.6..2.6, bookshelf wall z = -2.2, window in the left wall (x = -2.6), open to +z; ceiling 3.1
const ST = { x0: -2.6, x1: 2.6, zb: -2.2, zf: 2.8, H: 3.1, desk: [0.2, -0.75], top: 0.78 };
function buildStudy(root) {
  const K = new Kit(), S = ST, panel = 0x6a4430, wood = M.woodDark;
  const paper = texMat('stPaper', 256, 256, (g, w, h) => damask(g, w, h, { base: '#4a3a2a', motif: '#3a2c20', n: 2, seed: 13 }), { vertexColors: true });
  K.box(M.floor, S.x0, S.x1, -0.1, 0, S.zb, S.zf, 0x7a5038, 0.01, 1.2); K.put(texMat('rugS', 512, 384, (g, w, h) => rugTex(g, w, h, { a: '#4a1a1e', b: '#1a2a3a', c: '#a88a50', seed: 83, small: true })), plane(3.0, 2.2), 0.2, 0.006, -0.3, -Math.PI / 2, 0, 0);
  K.box(paper, S.x0, S.x1, 0, S.H, S.zb - 0.15, S.zb, 0xffffff, 0.01, 1.2); K.box(paper, S.x1, S.x1 + 0.15, 0, S.H, S.zb, S.zf, 0xffffff, 0.01, 1.2);
  K.put(paper, holeWall('stWin', -S.zf, -S.zb, 0, S.H, [[0.35, 0.85, 1.4, 1.65, false]], 0.25, 1.2), S.x0, 0, 0, 0, Math.PI / 2, 0);
  K.box(M.paint, S.x0 - 0.15, S.x1 + 0.15, S.H, S.H + 0.12, S.zb - 0.15, S.zf, 0x2a1e1a, 0.01, 1); for (const x of [-1.3, 0, 1.3]) K.box(wood, x - 0.12, x + 0.12, S.H - 0.25, S.H, S.zb, S.zf, 0x4a2c1e, 0.02, 1);
  for (const sd of [-1, 1]) K.box(wood, sd > 0 ? S.x1 - 0.05 : S.x0, sd > 0 ? S.x1 : S.x0 + 0.05, 0, 1.0, S.zb, S.zf, panel, 0.01, 1);
  for (let z = S.zb + 0.35; z < S.zf; z += 0.6) K.box(wood, S.x1 - 0.07, S.x1 - 0.04, 0.15, 0.85, z, z + 0.45, 0x5a3a28, 0.01, 1);
  // bookshelves along the back wall
  const books = [0, 1, 2, 3].map((k) => texMat('books' + k, 512, 128, (g, w, h) => booksTex(g, w, h, 101 + k * 7)));
  K.box(wood, S.x0, S.x1, 0, 0.75, S.zb, S.zb + 0.4, panel, 0.02, 1); K.box(wood, S.x0, S.x1, 2.55, 2.75, S.zb, S.zb + 0.45, panel, 0.02, 1);
  for (let x = S.x0 + 0.05; x < S.x1; x += 1.04) K.box(wood, x - 0.04, x + 0.04, 0.75, 2.55, S.zb, S.zb + 0.38, 0x5a3624, 0.01, 1);
  for (let r = 0; r < 4; r++) { const y = 0.75 + r * 0.45; K.box(wood, S.x0, S.x1, y, y + 0.03, S.zb, S.zb + 0.36, 0x5a3624, 0.005, 1); for (let x = S.x0 + 0.09; x < S.x1 - 0.1; x += 1.04) K.put(books[(r + Math.round(x)) & 3], plane(0.96, 0.4), x + 0.48, y + 0.23, S.zb + 0.3); }
  // window: dusk sky outside, mullions, green velvet curtains, sill
  K.put(texMat('dusk', 256, 320, duskWindowTex, { glow: 0x8a7a8a }), plane(1.6, 1.8), S.x0 - 0.2, 1.68, -0.35, 0, Math.PI / 2, 0);
  K.box(wood, S.x0 - 0.02, S.x0 + 0.04, 0.83, 2.52, -1.08, 0.38, 0x3a2418, 0.01, 1); K.box(wood, S.x0 - 0.04, S.x0 + 0.16, 0.78, 0.85, -1.15, 0.45, 0x5a3a28, 0.01, 1);
  K.box(wood, S.x0 - 0.1, S.x0 - 0.06, 0.85, 2.5, -0.38, -0.32, 0x3a2418, 0.005, 1); K.box(wood, S.x0 - 0.1, S.x0 - 0.06, 1.62, 1.68, -1.05, 0.35, 0x3a2418, 0.005, 1);
  for (const z of [-1.3, 0.6]) mesh(root, drapeGeo(0.55, 2.4, 3, 0.06, 0, 10, 8), texMat('curtG', 256, 512, (g, w, h) => velvet(g, w, h, { base: '#2e4a34', folds: 3, fringe: true }), { side: THREE.DoubleSide }), S.x0 + 0.12, 2.75, z, 0, Math.PI / 2, 0, false);
  K.beam(M.gold, [S.x0 + 0.1, 2.78, -1.6], [S.x0 + 0.1, 2.78, 0.9], 0.02, 0xb88a40, true);
  // fireplace + mantel clock + portrait on the right wall
  K.at(S.x1, 0, 0.9, -Math.PI / 2, () => { K.box(M.trim, -0.75, 0.75, 0, 1.15, 0, 0.3, 0x3a3034, 0.02, 1); K.box(M.dark, -0.42, 0.42, 0.05, 0.75, 0.25, 0.31, 0x000000, 0.01); K.box(wood, -0.9, 0.9, 1.15, 1.25, -0.02, 0.38, 0x4a2c1e, 0.02, 1);
    K.put(M.flame, sph(0.12, 8, 6), 0, 0.12, 0.15, 0, 0, 0, 2, 0.4, 1, 0xff8040); K.box(M.paint, -0.25, 0.25, 0.05, 0.14, 0.1, 0.2, 0x2a1a14, 0.02, 1);
    K.box(wood, -0.16, 0.16, 1.25, 1.55, 0.08, 0.22, 0x3a2418, 0.03, 1); K.put(M.paint, cyl(0.09, 0.09, 0.02, 16), 0, 1.43, 0.225, Math.PI / 2, 0, 0, 1, 1, 1, 0xf0e8d8);
    for (const x of [-0.6, 0.6]) K.put(M.gold, lathe('cstk', [[0, 0], [0.06, 0], [0.02, 0.05], [0.015, 0.22], [0.03, 0.24], [0, 0.24]], 10), x, 1.25, 0.15, 0, 0, 0, 1, 1, 1, 0xc89a48);
    K.box(M.gold, -0.5, 0.5, 1.6, 2.6, -0.01, 0.05, 0xb88a40, 0.02, 1); K.put(texMat('portrait', 256, 320, portraitTex), plane(0.86, 0.86), 0, 2.1, 0.055); });
  // the desk (pedestals, green leather top), chair behind it, lamp, envelope, clutter
  K.at(S.desk[0], 0, S.desk[1], 0, () => { const T = S.top;
    K.box(wood, -0.9, 0.9, T - 0.05, T, -0.45, 0.45, 0x5a3424, 0.02, 1); K.box(M.leather, -0.78, 0.78, T, T + 0.004, -0.36, 0.36, 0x2e4a34, 0.005, 1);
    for (const sd of [-1, 1]) { K.box(wood, sd * 0.85 - 0.3, sd * 0.85 + 0.3, 0.05, T - 0.05, -0.42, 0.42, panel, 0.02, 1); for (let k = 0; k < 3; k++) { K.box(wood, sd * 0.85 - 0.26, sd * 0.85 + 0.26, 0.12 + k * 0.2, 0.29 + k * 0.2, -0.43, -0.41, 0x5a3424, 0.01, 1); K.put(M.gold, sph(0.015, 6, 4), sd * 0.85, 0.2 + k * 0.2, -0.44, 0, 0, 0, 1, 1, 1, 0xd8a848); } K.box(wood, sd * 0.85 - 0.32, sd * 0.85 + 0.32, 0, 0.06, -0.44, 0.44, 0x3a2418, 0.01, 1); }
    K.box(wood, -0.55, 0.55, 0.3, T - 0.05, 0.38, 0.42, 0x5a3424, 0.01, 1); for (const x of [-0.27, 0.27]) K.box(wood, x - 0.22, x + 0.22, 0.36, T - 0.1, 0.42, 0.44, panel, 0.01, 1);
    // lamp: brass column + green cased-glass shade, bulb glow beneath
    K.put(M.gold, lathe('lampB', [[0, 0], [0.1, 0], [0.1, 0.02], [0.03, 0.05], [0.02, 0.35], [0, 0.35]], 14), -0.55, T, -0.15, 0, 0, 0, 1, 1, 1, 0xc89a48);
    K.put(M.lampShade, cyl(0.13, 0.13, 0.32, 16, false, 0, Math.PI), -0.55, T + 0.4, -0.15 + 0.03, 0, 0, Math.PI / 2, 1, 1, 0.75, 0xffffff); K.put(M.glowWarm, cyl(0.03, 0.03, 0.18, 8), -0.55, T + 0.36, -0.12, 0, 0, Math.PI / 2, 1, 1, 1, 0xffffff);
    K.put(M.gold, cyl(0.2, 0.2, 0.012, 20), -0.55, T + 0.006, -0.15, 0, 0, 0, 1, 1, 1, 0x8a6a3a);
    K.box(M.leather, -0.32, 0.3, T, T + 0.012, -0.28, 0.12, 0x3a2a24, 0.004, 1); K.box(M.paper, -0.3, 0.28, T + 0.012, T + 0.016, -0.26, 0.1, 0x8a8a7a, 0.002, 1); // blotter
    K.put(M.paint, cyl(0.04, 0.045, 0.06, 12), 0.5, T + 0.03, -0.22, 0, 0, 0, 1, 1, 1, 0x2a2a34); K.put(M.gold, cyl(0.03, 0.03, 0.015, 10), 0.5, T + 0.065, -0.22, 0, 0, 0, 1, 1, 1, 0xc89a48); K.beam(M.paint, [0.5, T + 0.06, -0.22], [0.58, T + 0.17, -0.27], 0.006, 0x1a1418, true, 4);
    for (const [y, c, r] of [[0, 0x5a1e1a, 0.1], [0.05, 0x1e2a44, -0.05], [0.1, 0x2e4028, 0.15]]) K.cb(M.paint, 0.26, 0.05, 0.19, 0.68, T + 0.025 + y, 0.1, c, 0, r, 0, 0.01, 1);
    for (let k = 0; k < 5; k++) K.cb(M.paper, 0.22, 0.003, 0.28, 0.42 + k * 0.004, T + 0.004 + k * 0.004, 0.22, 0xe0d6c2, 0, 0.1 * (k % 3 - 1) + 0.3, 0, 0.001, 1);
    K.box(M.gold, 0.2, 0.36, T, T + 0.22, -0.4, -0.37, 0xc89a48, 0.01, 1); K.put(texMat('photo', 128, 160, (g, w, h) => { g.fillStyle = '#c8b898'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a4a3a'; g.beginPath(); g.ellipse(w / 2, h * 0.42, w * 0.18, h * 0.16, 0, 0, 7); g.fill(); g.fillRect(w * 0.25, h * 0.55, w * 0.5, h * 0.45); modulate(g, w, h, (u, v) => 0.9 + 0.1 * fbm(u, v, 3, 3, 2, 3)); }), plane(0.13, 0.18), 0.28, T + 0.11, -0.365, -0.15, Math.PI, 0);
    K.put(M.paint, cyl(0.06, 0.05, 0.02, 14), 0.75, T + 0.01, -0.3, 0, 0, 0, 1, 1, 1, 0x6a5a4a); K.beam(M.paint, [0.72, T + 0.03, -0.3], [0.86, T + 0.05, -0.36], 0.012, 0x3a2418, true, 6); });
  K.at(S.desk[0], 0, S.desk[1] - 0.8, 0.15, () => { const c = 0x4a2420; K.box(M.leather, -0.3, 0.3, 0.42, 0.56, -0.28, 0.25, c, 0.06, 1, 2); K.box(M.leather, -0.32, 0.32, 0.55, 1.15, -0.34, -0.2, c, 0.08, 1, 2);
    for (const sd of [-1, 1]) K.box(M.leather, sd * 0.3 - 0.06, sd * 0.3 + 0.06, 0.5, 0.75, -0.28, 0.2, c, 0.04, 1, 2); K.put(M.iron, cyl(0.04, 0.04, 0.36, 8), 0, 0.22, 0, 0, 0, 0, 1, 1, 1, 0x2a2228);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4; K.beam(M.iron, [0, 0.06, 0], [Math.cos(a) * 0.3, 0.03, Math.sin(a) * 0.3], 0.03, 0x2a2228); } });
  K.at(1.7, 0, 0.75, -0.7, () => { const c = 0x5a2a20; K.box(M.leather, -0.45, 0.45, 0.2, 0.48, -0.42, 0.42, c, 0.08, 1, 2); K.box(M.leather, -0.45, 0.45, 0.45, 1.2, -0.48, -0.28, c, 0.1, 1, 2);
    for (const sd of [-1, 1]) { K.box(M.leather, sd * 0.42 - 0.1, sd * 0.42 + 0.1, 0.2, 0.72, -0.45, 0.4, c, 0.08, 1, 2); K.box(M.leather, sd * 0.38 - 0.08, sd * 0.38 + 0.08, 0.7, 1.15, -0.45, -0.1, c, 0.06, 1, 2); }
    K.box(M.leather, -0.36, 0.36, 0.48, 0.58, -0.3, 0.38, 0x6a3428, 0.06, 1, 2); for (const [x, z] of [[-0.38, -0.36], [0.38, -0.36], [-0.38, 0.36], [0.38, 0.36]]) K.put(M.woodDark, cyl(0.03, 0.025, 0.2, 6), x, 0.1, z, 0, 0, 0, 1, 1, 1, 0x3a2418); });
  K.at(2.0, 0, -0.2, 0, () => { K.put(wood, cyl(0.22, 0.22, 0.03, 16), 0, 0.62, 0, 0, 0, 0, 1, 1, 1, 0x4a2c1e); K.put(wood, cyl(0.03, 0.05, 0.6, 8), 0, 0.3, 0, 0, 0, 0, 1, 1, 1, 0x4a2c1e); K.put(M.paint, lathe('decant', [[0, 0], [0.06, 0], [0.07, 0.08], [0.02, 0.18], [0.03, 0.24], [0, 0.24]], 12), 0.05, 0.635, 0.02, 0, 0, 0, 1, 1, 1, 0x8a4a2a); });
  K.at(-1.9, 0, -1.55, 0.6, () => { for (let k = 0; k < 3; k++) { const a = k * 2.1; K.beam(wood, [0, 0.45, 0], [Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3], 0.03, 0x4a2c1e); } K.put(wood, cyl(0.03, 0.03, 0.3, 6), 0, 0.6, 0, 0, 0, 0, 1, 1, 1, 0x4a2c1e);
    K.put(texMat('globe', 256, 128, (g, w, h) => { g.fillStyle = '#c8b888'; g.fillRect(0, 0, w, h); const R2 = rng(5); g.fillStyle = '#8a7a4a'; for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse(R2() * w, h * (0.2 + R2() * 0.6), 10 + R2() * 25, 8 + R2() * 18, 0, 0, 7); g.fill(); } g.strokeStyle = 'rgba(60,40,20,0.4)'; for (let x = 0; x < w; x += w / 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } }), sph(0.24, 20, 14), 0, 1.02, 0, 0.4, 0, 0.3);
    K.put(M.gold, tor(0.27, 0.012, 4, 24), 0, 1.02, 0, 0, 0, 0.4, 1, 1, 1, 0xc89a48); });
  K.build(root);
  // the envelope from the White House (doc mesh with painter hook)
  const envelope = mesh(root, plane(0.24, 0.15), toon({ map: mkTex(768, 480, (g, w, h) => paintEnvelope(g, w, h)) }), S.desk[0] - 0.01, S.top + 0.019, S.desk[1] - 0.06, -Math.PI / 2, 0, -0.1, false);
  return { envelope };
}

// ================================================================= PAN-AMERICAN EXPOSITION, Buffalo, 1901 (dusk)
// local frame: plaza y = 0. Camera side +z looks north (-z) up the Court of Fountains to the Electric Tower (z = -100).
// halls flank the court (facades at x = +-34, z -88..-6); the Temple of Music stands east of the plaza at (38, 0, 30), entrance facing west (-x).
// Every outline carries bulbs: one InstancedMesh of emissive spheres (thousands) that blooms.
let BULBS = null; const _bv = { x: 0, y: 0, z: 0 };
const bulb = (K, x, y, z) => { const e = K.M.elements; BULBS.push(e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]); };
const bLine = (K, a, b, step = 0.8) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), n = Math.max(1, Math.round(L / step)); for (let i = 0; i <= n; i++) { const t = i / n; bulb(K, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t); } };
const bArc = (K, cx, cy, z, r, a0 = 0, a1 = Math.PI, step = 0.8) => { const n = Math.max(2, Math.round(r * Math.abs(a1 - a0) / step)); for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; bulb(K, cx + Math.cos(a) * r, cy + Math.sin(a) * r, z); } };
const bRing = (K, cx, y, cz, r, step = 0.8, n0) => { const n = n0 || Math.max(6, Math.round(2 * Math.PI * r / step)); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; bulb(K, cx + Math.cos(a) * r, y, cz + Math.sin(a) * r); } };
const bDome = (K, cx, y0, cz, r, sy, ribs = 12, step = 0.8) => { for (let k = 0; k < ribs; k++) { const a = k / ribs * Math.PI * 2, n = Math.round(r * 1.6 / step); for (let i = 0; i <= n; i++) { const t = i / n * Math.PI / 2; bulb(K, cx + Math.cos(a) * Math.cos(t) * r, y0 + Math.sin(t) * r * sy, cz + Math.sin(a) * Math.cos(t) * r); } } };
const archGeo = (w, h) => cached(`ar${w}|${h}`, () => { const s = new THREE.Shape(), r = w / 2; s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, h - r); s.absarc(0, h - r, r, 0, Math.PI, false); s.lineTo(-r, 0); return new THREE.ShapeGeometry(s, 10); });
// an arched opening on a face (z = 0 plane): dark (or warm-lit) arch panel + bulb outline
function bArch(K, cx, y0, w, h, lit, z = 0.03) { K.put(lit ? M.winLit[0] : M.archDark, archGeo(w, h), cx, y0, z, 0, 0, 0, 1, 1, 1, lit ? 0xffffff : 0x2a2240); const r = w / 2; bLine(K, [cx - r - 0.25, y0, z + 0.1], [cx - r - 0.25, y0 + h - r, z + 0.1]); bLine(K, [cx + r + 0.25, y0, z + 0.1], [cx + r + 0.25, y0 + h - r, z + 0.1]); bArc(K, cx, y0 + h - r, z + 0.1, r + 0.25); }
// Spanish-Renaissance exhibition hall: facade along x 0..L facing +z; arcade, upper storey, cornice, tile roof, corner towers, domed centre pavilion
function expoHall(K, L, H, D, o = {}) {
  const st = o.tint ?? 0xf0dcb4, acc = o.acc ?? 0x4a8a7a, nb = Math.round(L / 5.5), bw = L / nb, ya = H * 0.6;
  K.box(M.stucco, 0, L, 0, H, -D, -3, st, 0.05, 4); K.box(M.stucco, 0, L, ya, H, -3, 0, st, 0.05, 4); K.box(M.paint, 0, L, ya - 0.3, ya, -3, 0, 0x6a4a3a, 0.02, 1);
  for (let i = 0; i <= nb; i++) { const x = i * bw; K.box(M.stucco, x - 0.55, x + 0.55, 0, ya, -0.8, 0.2, st, 0.04, 4); }
  for (let i = 0; i < nb; i++) { const cx = (i + 0.5) * bw; bArch(K, cx, 0.4, bw - 1.6, ya - 1.2, (i + (o.seed || 0)) % 3 === 0, -2.9); const r = (bw - 1.6) / 2; bArc(K, cx, ya - 0.8 - r, 0.3, r + 0.1); bLine(K, [cx - r - 0.1, 0.4, 0.3], [cx - r - 0.1, ya - 0.8 - r, 0.3], 1.0); bLine(K, [cx + r + 0.1, 0.4, 0.3], [cx + r + 0.1, ya - 0.8 - r, 0.3], 1.0);
    K.put(i % 2 ? M.winLit[1] : M.winDark[0], archGeo(1.3, 2.4), cx, ya + 1.0, 0.03); bArc(K, cx, ya + 2.75, 0.12, 0.85, 0, Math.PI, 0.7); }
  K.box(M.trim, -0.4, L + 0.4, H, H + 0.9, -D - 0.3, 0.7, 0xe8d2a8, 0.05, 2); K.box(M.paint, -0.4, L + 0.4, H + 0.9, H + 1.1, -D - 0.3, 0.8, acc, 0.03, 1);
  K.put(M.tiles, prism(D + 1.6, 4.6, L + 0.8), L / 2, H + 1.1, -D / 2, 0, Math.PI / 2, 0, 1, 1, 1, 0xd88a6a);
  bLine(K, [0, H + 1.2, 0.95], [L, H + 1.2, 0.95]); bLine(K, [0, ya + 0.1, 0.35], [L, ya + 0.1, 0.35], 1.0); bLine(K, [0, H + 5.7, -D / 2], [L, H + 5.7, -D / 2], 1.0);
  // corner towers
  for (const x of [0, L]) { const th = H + 12; K.box(M.stucco, x - 3.6, x + 3.6, 0, th, -7.6, 0.6, st, 0.05, 4); K.box(M.trim, x - 4.0, x + 4.0, th, th + 0.8, -8.0, 1.0, 0xe8d2a8, 0.04, 2);
    for (const dx of [-1.5, 1.5]) bArch(K, x + dx, th - 5.0, 1.8, 4.0, false, 0.63);
    K.put(M.paint, sph(3.4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), x, th + 0.8, -3.5, 0, 0, 0, 1, 1.35, 1, acc); K.put(M.gold, cyl(0.5, 0.7, 1.6, 10), x, th + 0.8 + 4.6 + 0.8, -3.5, 0, 0, 0, 1, 1, 1, 0xd8b060); K.put(M.gold, cone(0.25, 2.2, 8), x, th + 8.2, -3.5, 0, 0, 0, 1, 1, 1, 0xd8b060);
    for (const [cx, cz] of [[x - 3.65, 0.65], [x + 3.65, 0.65], [x - 3.65, -7.65], [x + 3.65, -7.65]]) bLine(K, [cx, 0.5, cz], [cx, th, cz], 0.8);
    bLine(K, [x - 4.0, th + 0.9, 1.05], [x + 4.0, th + 0.9, 1.05]); bLine(K, [x + 4.05, th + 0.9, 1.0], [x + 4.05, th + 0.9, -8.0]); bLine(K, [x - 4.05, th + 0.9, 1.0], [x - 4.05, th + 0.9, -8.0]);
    bDome(K, x, th + 0.8, -3.5, 3.5, 1.35, 10, 0.7); bRing(K, x, th + 0.9, -3.5, 3.5, 0.7);
    K.beam(M.iron, [x, th + 8, -3.5], [x, th + 14, -3.5], 0.06, 0x2a2430, true); K.put(M.cloth, plane(2.4, 1.4), x + 1.25, th + 13.2, -3.5, 0, 0, 0, 1, 1, 1, o.flag || 0xc83a3a); }
  // centre pavilion with arched portal + dome
  const cx = L / 2, ph = H + 5; K.box(M.stucco, cx - 7, cx + 7, 0, ph, -10, 1.5, st, 0.05, 4); K.box(M.trim, cx - 7.4, cx + 7.4, ph, ph + 0.9, -10.4, 1.9, 0xe8d2a8, 0.04, 2);
  bArch(K, cx, 0.3, 6.5, ph - 4, true, 1.53); for (const dx of [-5, 5]) { K.box(M.trim, cx + dx - 0.6, cx + dx + 0.6, 0, ph, 1.4, 1.9, 0xe8dcc0, 0.03, 2); bLine(K, [cx + dx, 0.5, 2.0], [cx + dx, ph, 2.0], 0.8); }
  K.put(M.stucco, cyl(5.2, 5.2, 3.5, 24), cx, ph + 0.9 + 1.75, -4.2, 0, 0, 0, 1, 1, 1, st); K.put(M.paint, sph(5.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), cx, ph + 4.4, -4.2, 0, 0, 0, 1, 1.15, 1, acc);
  K.put(M.gold, cyl(0.8, 1.0, 2.0, 12), cx, ph + 4.4 + 6.3 + 1.0, -4.2, 0, 0, 0, 1, 1, 1, 0xd8b060); K.put(M.gold, cone(0.4, 2.5, 8), cx, ph + 13.2, -4.2, 0, 0, 0, 1, 1, 1, 0xd8b060);
  bLine(K, [cx - 7.4, ph + 1.0, 1.95], [cx + 7.4, ph + 1.0, 1.95]); bDome(K, cx, ph + 4.4, -4.2, 5.55, 1.15, 16, 0.75); bRing(K, cx, ph + 4.4, -4.2, 5.6, 0.75); bRing(K, cx, ph + 1.0, -4.2, 5.3, 0.75);
  for (const dx of [-7.45, 7.45]) bLine(K, [cx + dx, 0.5, 1.95], [cx + dx, ph + 0.9, 1.95]);
}
// the Electric Tower (about 96 m): base block + colonnade wings, shaft with cascade niche, arcaded stage, colonnaded drum, lantern, gilt figure
function electricTower(K) {
  const st = 0xf2e6cc, acc = 0x5a9a8a;
  K.box(M.stucco, -14, 14, 0, 10, -10, 10, st, 0.06, 4); K.box(M.trim, -14.6, 14.6, 10, 11.2, -10.6, 10.6, 0xe8d8b8, 0.05, 2);
  for (const dx of [-9, 9]) bArch(K, dx, 0.5, 4.5, 8, true, 10.03); for (const [a, b] of [[[-14.1, 0.5, 10.1], [-14.1, 11.2, 10.1]], [[14.1, 0.5, 10.1], [14.1, 11.2, 10.1]], [[-14.6, 11.3, 10.7], [14.6, 11.3, 10.7]]]) bLine(K, a, b);
  for (const sd of [-1, 1]) { for (let x = 16; x <= 44; x += 3.5) { K.put(M.stucco, cyl(0.45, 0.5, 9, 10), sd * x, 4.5, 4, 0, 0, 0, 1, 1, 1, st); bLine(K, [sd * x, 0.5, 4.55], [sd * x, 9, 4.55], 0.9); }
    K.box(M.trim, sd > 0 ? 14 : -45, sd > 0 ? 45 : -14, 9, 10.4, 2.5, 5.5, 0xe8d8b8, 0.04, 2); K.put(M.tiles, prism(4.4, 1.6, 31), sd * 29.5, 10.4, 4, 0, Math.PI / 2, 0, 1, 1, 1, 0xd88a6a); bLine(K, [sd * 14, 10.5, 5.6], [sd * 45, 10.5, 5.6]); K.put(M.gold, sph(0.7, 10, 8), sd * 45, 11.2, 4, 0, 0, 0, 1, 1, 1, 0xd8b060); }
  // shaft
  K.box(M.stucco, -8.5, 8.5, 11.2, 60, -8.5, 8.5, st, 0.06, 4); for (const [x, z] of [[-8.5, 8.5], [8.5, 8.5], [-8.5, -8.5], [8.5, -8.5]]) { K.box(M.trim, x - 1.1, x + 1.1, 11.2, 60, z - 1.1, z + 1.1, 0xeadcc0, 0.04, 2); bLine(K, [x + Math.sign(x) * 1.2, 11.5, z + Math.sign(z) * 1.2], [x + Math.sign(x) * 1.2, 60, z + Math.sign(z) * 1.2], 0.8); }
  K.box(M.paint, -4.5, 4.5, 14, 52, 8.3, 8.6, acc, 0.03, 1); K.put(M.cascade, plane(7.6, 40), 0, 32.5, 8.62);
  bArc(K, 0, 52 - 4.5, 8.8, 4.7, 0, Math.PI); bLine(K, [-4.7, 13.5, 8.8], [-4.7, 47.5, 8.8]); bLine(K, [4.7, 13.5, 8.8], [4.7, 47.5, 8.8]);
  for (const y of [24, 36, 48]) for (const z of [9.7, -9.7]) bLine(K, [-9.7, y, z], [9.7, y, z], 0.9);
  K.box(M.trim, -10, 10, 60, 61.5, -10, 10, 0xe8d8b8, 0.05, 2); bLine(K, [-10.1, 61.6, 10.1], [10.1, 61.6, 10.1]); bLine(K, [-10.1, 61.6, -10.1], [-10.1, 61.6, 10.1]); bLine(K, [10.1, 61.6, -10.1], [10.1, 61.6, 10.1]);
  // arcaded stage
  K.box(M.stucco, -7, 7, 61.5, 72, -7, 7, st, 0.05, 4); for (const dx of [-4.3, 0, 4.3]) { bArch(K, dx, 63, 3.0, 7.5, false, 7.03); K.at(0, 0, 0, Math.PI / 2, () => bArch(K, dx, 63, 3.0, 7.5, false, 7.03)); K.at(0, 0, 0, -Math.PI / 2, () => bArch(K, dx, 63, 3.0, 7.5, false, 7.03)); }
  K.box(M.trim, -7.8, 7.8, 72, 73.2, -7.8, 7.8, 0xe8d8b8, 0.05, 2); bLine(K, [-7.9, 73.3, 7.9], [7.9, 73.3, 7.9]); for (const [x, z] of [[-7.1, 7.1], [7.1, 7.1]]) bLine(K, [x, 61.6, z], [x, 72, z]);
  // colonnaded drum, lantern, dome, gilt figure
  K.put(M.stucco, cyl(4.2, 4.2, 8, 20), 0, 77.2, 0, 0, 0, 0, 1, 1, 1, st); for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; K.put(M.stucco, cyl(0.3, 0.32, 7.5, 8), Math.cos(a) * 5.4, 77, Math.sin(a) * 5.4, 0, 0, 0, 1, 1, 1, st); bLine(K, [Math.cos(a) * 5.75, 73.5, Math.sin(a) * 5.75], [Math.cos(a) * 5.75, 80.5, Math.sin(a) * 5.75], 0.8); }
  K.put(M.trim, cyl(6.2, 6.2, 1.2, 24), 0, 81.6, 0, 0, 0, 0, 1, 1, 1, 0xe8d8b8); bRing(K, 0, 73.4, 0, 6.0, 0.75); bRing(K, 0, 82.3, 0, 6.3, 0.75);
  K.put(M.stucco, cyl(3.2, 3.6, 4, 16), 0, 84.2, 0, 0, 0, 0, 1, 1, 1, st); K.put(M.paint, sph(3.4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0, 86.2, 0, 0, 0, 0, 1, 1.2, 1, acc); bDome(K, 0, 86.2, 0, 3.45, 1.2, 12, 0.7); bRing(K, 0, 86.2, 0, 3.6, 0.7);
  K.put(M.gold, cyl(0.9, 1.1, 2.2, 12), 0, 91.4, 0, 0, 0, 0, 1, 1, 1, 0xd8b060);
  K.at(0, 92.5, 0, 0, () => { K.put(M.gold, lathe('godd', [[0, 0], [0.7, 0], [0.55, 1.2], [0.42, 2.4], [0.5, 2.9], [0.25, 3.2], [0, 3.25]], 10), 0, 0, 0, 0, 0, 0, 1, 1, 1, 0xe8c060); K.put(M.gold, sph(0.32, 10, 8), 0, 3.5, 0, 0, 0, 0, 1, 1, 1, 0xe8c060); K.beam(M.gold, [0.3, 2.8, 0], [0.9, 4.6, 0.2], 0.12, 0xe8c060, true); K.put(M.bulb, sph(0.35, 8, 6), 0.95, 4.8, 0.2); });
  bRing(K, 0, 91.2, 0, 1.3, 0.6);
}
// the Temple of Music: octagonal hall with arched portals, lettered attic, drum + dome, corner turrets; front faces +z
function templeOfMusic(K) {
  const st = 0xecd2b0, acc = 0xa8584a, r = 15, ap = r * Math.cos(Math.PI / 8);
  K.put(M.stucco, cyl(r, r, 12, 8), 0, 6, 0, 0, Math.PI / 8, 0, 1, 1, 1, st); K.put(M.trim, cyl(r + 0.8, r + 0.8, 1.2, 8), 0, 12.6, 0, 0, Math.PI / 8, 0, 1, 1, 1, 0xf0dcc0);
  K.put(M.stucco, cyl(r - 1.5, r - 1.5, 2.6, 8), 0, 14.5, 0, 0, Math.PI / 8, 0, 1, 1, 1, st);
  for (let k = 0; k < 4; k++) K.at(0, 0, 0, k * Math.PI / 2, () => { bArch(K, 0, 0.3, 6.0, 10.2, k === 0, ap + 0.04); for (const dx of [-4.6, 4.6]) { K.put(M.archDark, archGeo(1.6, 3.4), dx, 6.5, ap + 0.03, 0, 0, 0, 1, 1, 1, 0x3a2a3a); bArc(K, dx, 6.5 + 2.6, ap + 0.12, 1.0, 0, Math.PI, 0.6); } });
  K.at(0, 0, 0, Math.PI / 4, () => { for (let k = 0; k < 4; k++) K.at(0, 0, 0, k * Math.PI / 2, () => { K.put(M.stucco, cyl(1.8, 1.8, 15.5, 10), 0, 7.75, ap + 0.6, 0, 0, 0, 1, 1, 1, st); K.put(M.paint, sph(1.9, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0, 15.5, ap + 0.6, 0, 0, 0, 1, 1.4, 1, acc); K.put(M.gold, cone(0.2, 1.6, 6), 0, 18.9, ap + 0.6, 0, 0, 0, 1, 1, 1, 0xd8b060);
    bDome(K, 0, 15.5, ap + 0.6, 1.95, 1.4, 8, 0.6); bRing(K, 0, 15.5, ap + 0.6, 1.95, 0.6); bLine(K, [0, 0.5, ap + 2.5], [0, 15.4, ap + 2.5], 0.8); }); });
  K.put(fasciaMat('TEMPLE OF MUSIC', '#6a2228', '#f4d890', { w: 2048, h: 180, fs: 0.6, sp: 0.12 }), plane(10.5, 1.15), 0, 14.4, (r - 1.5) * Math.cos(Math.PI / 8) + 0.05);
  K.put(M.stucco, cyl(8.5, 8.5, 4.5, 24), 0, 18.05, 0, 0, 0, 0, 1, 1, 1, st); for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; K.at(0, 0, 0, a, () => K.put(M.winLit[k % 2], archGeo(1.0, 2.6), 0, 16.8, 8.52)); }
  K.put(M.paint, sph(8.9, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2), 0, 20.3, 0, 0, 0, 0, 1, 1.15, 1, acc); K.put(M.gold, cyl(1.3, 1.6, 2.6, 12), 0, 20.3 + 10.2 + 1.3, 0, 0, 0, 0, 1, 1, 1, 0xd8b060); K.put(M.gold, sph(0.8, 10, 8), 0, 34.0, 0, 0, 0, 0, 1, 1.3, 1, 0xe8c060);
  bDome(K, 0, 20.3, 0, 8.95, 1.15, 24, 0.75); bRing(K, 0, 20.4, 0, 9.0, 0.75); bRing(K, 0, 15.9, 0, 8.6, 0.75);
  for (let k = 0; k < 8; k++) { const a0 = Math.PI / 8 + k * Math.PI / 4, a1 = a0 + Math.PI / 4, R0 = r + 0.85; bLine(K, [Math.sin(a0) * R0, 13.3, Math.cos(a0) * R0], [Math.sin(a1) * R0, 13.3, Math.cos(a1) * R0], 0.75); }
}
function buildExpo(root, ctx) {
  const K = new Kit(); BULBS = []; const L = LAMPS.expo; L.length = 0;
  // ground: plaza stone, lawns, the court basin with fountains, the cascade pool under the tower
  K.box(M.plaza, -140, 140, -0.3, 0, -170, 90, 0xffffff, 0.02, 4);
  for (const sd of [-1, 1]) K.box(M.grass, sd > 0 ? 17.5 : -27, sd > 0 ? 27 : -17.5, 0, 0.12, -84, -10, 0xc8d8b0, 0.02, 4);
  K.box(M.trim, -17.5, 17.5, 0, 0.7, -86, -9, 0xe8dcc0, 0.05, 2); const water = texMat('water', 256, 512, waterTex, { glow: 0x6a5a6a });
  K.put(water, plane(33.4, 75.4), 0, 0.72, -47.5, -Math.PI / 2, 0, 0); for (const z of [-75, -60, -45, -30, -18]) { K.put(M.trim, cyl(1.6, 2.0, 1.2, 14), 0, 1.0, z, 0, 0, 0, 1, 1, 1, 0xe8dcc0); K.put(M.spray, cone(1.2, 6.5, 12), 0, 4.6, z, Math.PI, 0, 0); K.put(M.spray, cone(0.5, 8, 10), 0, 5.6, z, 0, 0, 0); bRing(K, 0, 1.75, z, 1.7, 0.6); }
  for (const sd of [-1, 1]) bLine(K, [sd * 17.6, 0.85, -86], [sd * 17.6, 0.85, -9], 1.4); bLine(K, [-17.6, 0.85, -8.9], [17.6, 0.85, -8.9], 1.4);
  // the halls, the tower, the Temple of Music
  K.at(-34, 0, -6, Math.PI / 2, () => expoHall(K, 82, 15, 26, { seed: 1, flag: 0xc83a3a }));
  K.at(34, 0, -88, -Math.PI / 2, () => expoHall(K, 82, 15, 26, { seed: 2, flag: 0x3a5ac8, acc: 0x4a7a9a }));
  K.at(0, 0, -102, 0, () => electricTower(K));
  K.box(M.trim, -12, 12, 0, 1.0, -93, -86, 0xe8dcc0, 0.04, 2); K.put(water, plane(23, 6.6), 0, 1.02, -89.5, -Math.PI / 2, 0, 0);
  K.at(42, 0, 30, -Math.PI / 2, () => templeOfMusic(K));
  // far side halls (west + east) closing the view, darker in the fog
  K.at(-120, 0, -150, 0, () => expoHall(K, 60, 13, 20, { seed: 3, tint: 0xd8c8b0 })); K.at(60, 0, -150, 0, () => expoHall(K, 60, 13, 20, { seed: 4, tint: 0xd8c8b0 }));
  // lamp posts: tall standards with five globes
  const lampPost = (x, z) => { const iron = 0x2a2a34; K.put(M.iron, cyl(0.12, 0.2, 6.5, 10), x, 3.25, z, 0, 0, 0, 1, 1, 1, iron); K.put(M.iron, cyl(0.35, 0.45, 0.8, 10), x, 0.4, z, 0, 0, 0, 1, 1, 1, iron);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4, dx = Math.cos(a) * 0.9, dz = Math.sin(a) * 0.9; K.beam(M.iron, [x, 5.8, z], [x + dx, 6.0, z + dz], 0.05, iron, true); K.put(M.glowSoft, sph(0.32, 12, 8), x + dx, 6.35, z + dz, 0, 0, 0, 1, 1, 1, 0xffffff); }
    K.put(M.glowSoft, sph(0.4, 12, 8), x, 7.0, z, 0, 0, 0, 1, 1, 1, 0xffffff); L.push([x, 6.5, z]); };
  for (const sd of [-1, 1]) { for (let z = -80; z <= -12; z += 11.5) lampPost(sd * 20, z); for (const z of [2, 18, 34]) lampPost(sd * 14, z); lampPost(sd * 28, 8); lampPost(sd * 26, 44); }
  // flag poles + pennants along the court; trees behind the halls
  for (const sd of [-1, 1]) for (let z = -78; z <= -14; z += 16) { K.beam(M.iron, [sd * 23.5, 0, z], [sd * 23.5, 12, z], 0.07, 0xd8d0c0, true); K.put(M.cloth, plane(2.2, 1.2), sd * 23.5 + 1.15, 11.2, z, 0, 0, 0, 1, 1, 1, [0xc83a3a, 0x3a5ac8, 0xe8c050, 0x3a9a5a][((z + 78) / 16 + (sd > 0 ? 1 : 0)) & 3]); }
  K.build(root, 40);
  // crowd (instanced silhouettes: men in coats + hats, women in long skirts + wide hats)
  const KM = new Kit(); KM.put(M.crowd, cyl(0.2, 0.24, 0.85, 8), 0, 1.0, 0); for (const sd of [-1, 1]) KM.put(M.crowd, cyl(0.08, 0.07, 0.6, 6), sd * 0.1, 0.3, 0); KM.put(M.crowd, sph(0.12, 10, 8), 0, 1.55, 0); KM.put(M.crowd, cyl(0.2, 0.2, 0.025, 12), 0, 1.66, 0); KM.put(M.crowd, cyl(0.12, 0.12, 0.12, 10), 0, 1.72, 0);
  const KW = new Kit(); KW.put(M.crowd, cyl(0.15, 0.36, 1.0, 10), 0, 0.5, 0); KW.put(M.crowd, cyl(0.15, 0.17, 0.45, 8), 0, 1.2, 0, 0, 0, 0, 1, 1, 0.8); KW.put(M.crowd, sph(0.11, 10, 8), 0, 1.53, 0); KW.put(M.crowd, cyl(0.3, 0.3, 0.04, 12), 0, 1.64, 0); KW.put(M.crowd, sph(0.13, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), 0, 1.65, 0);
  const pfM = KM.prefab(), pfW = KW.prefab(), R = rng(101), men = [], women = [];
  const coats = [0x2a2436, 0x3a3040, 0x24283a, 0x4a3a34, 0x2e2a2a], dress = [0xe8dcc8, 0x8a4a5a, 0x4a5a7a, 0xd8c8a8, 0x6a3a4a, 0x3a3a4a];
  for (let i = 0; i < 900; i++) { const x = -32 + R() * 66, z = -84 + R() * 140; if (Math.abs(x) < 18.5 && z < -8 && z > -87) continue; if (Math.abs(x) > 31) continue; if (Math.hypot(x - 42, z - 30) < 18) continue; if (Math.hypot(x + 3, z - 55) < 9) continue; if (z < -84) continue;
    if (Math.abs(x) > 17 && Math.abs(x) < 27.5 && z < -9 && z > -85 && R() < 0.7) continue;
    const w = R() < 0.45, ry = R() * 6.28, s = 0.95 + R() * 0.12; (w ? women : men).push([x, 0, z, ry, s, w ? dress[(R() * dress.length) | 0] : coats[(R() * coats.length) | 0]]); }
  instance(root, pfM, men); instance(root, pfW, women);
  // the bulbs
  const n = BULBS.length / 3, im = new THREE.InstancedMesh(sph(0.17, 6, 4), M.bulb, n), m4 = new THREE.Matrix4();
  for (let i = 0; i < n; i++) { m4.makeTranslation(BULBS[i * 3], BULBS[i * 3 + 1], BULBS[i * 3 + 2]); im.setMatrixAt(i, m4); }
  im.castShadow = false; im.receiveShadow = false; im.frustumCulled = false; root.add(im); if (ctx.NOND) ctx.NOND.add(im);
  const info = { bulbs: n, men: men.length, women: women.length }; BULBS = null; return { bulbs: im, info };
}

// ================================================================= lights, grades, practicals, views
const SET_LIGHT = {
  fordsExt: { top: '#070b26', hor: '#262c5c', fog: '#161c40', fogN: 26, fogF: 150, sky: '#4c5aa8', ground: '#2a1e30', hemiI: 0.6, fillCol: '#5a68c0', fillI: 0.28, sunCol: '#a4b4ff', sunI: 0.85, az: -35, el: 38, disc: '#f4f0e0', discSize: 0.0016, stars: 1, clouds: false, cardTint: '#e8e8ff', fxTint: '#eef2ff', shafts: 0 },
  box: { top: '#000000', hor: '#2a1a1a', fog: '#1e1218', fogN: 22, fogF: 80, sky: '#e8c8b0', ground: '#3a2230', hemiI: 0.72, fillCol: '#7a70c0', fillI: 0.22, sunCol: '#ffcf90', sunI: 0.55, az: 0, el: 30, disc: '#000000', clouds: false, shadow: false, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0 },
  dressing: { top: '#000000', hor: '#2a1a14', fog: '#2a1a14', fogN: 10, fogF: 50, sky: '#e8c8a8', ground: '#3a2430', hemiI: 0.62, fillCol: '#7a78c8', fillI: 0.2, sunCol: '#ffd2a0', sunI: 0.3, az: 15, el: 40, disc: '#000000', clouds: false, shadow: false, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0, aoK: 0.6 },
  expo: { top: '#18205a', hor: '#f49a78', fog: '#7a5a7c', fogN: 90, fogF: 560, sky: '#7080d0', ground: '#4a3040', hemiI: 0.8, fillCol: '#6a70d0', fillI: 0.32, sunCol: '#ff9a60', sunI: 1.5, az: -105, el: 5, disc: '#ffd0a0', discSize: 0.0025, clouds: false, stars: 0, cardTint: '#ffe8e0', fxTint: '#fff2ea', shafts: 0 },
  study: { top: '#000000', hor: '#2a1e1a', fog: '#2a1e1a', fogN: 10, fogF: 50, sky: '#f0d0b0', ground: '#3a2430', hemiI: 0.8, fillCol: '#7080d0', fillI: 0.3, sunCol: '#9fb0ff', sunI: 0.9, az: -90, el: 22, disc: '#000000', clouds: false, stars: 0, cardTint: '#fff0e2', fxTint: '#ffffff', shafts: 0, aoK: 0.6 },
};
const SET_GRADE = {
  fordsExt: { look: 'night', over: { exp: 1.8, con: 1.24, tH: ['#ffc080', 0.1], lift: [0.05, 0.04, 0.075], bloom: [0.5, 0.72], hal: [0.28, '#ff8a3a'], vig: [0.32, 0.45, '#2a2050'] } },
  box: { look: 'office', over: { exp: 1.72, con: 1.26, lift: [0.06, 0.045, 0.06], tH: ['#ffc890', 0.03], bloom: [0.45, 0.78], hal: [0.24, '#ff7a3a'], vig: [0.35, 0.45, '#3a2030'] } },
  dressing: { look: 'office', over: { exp: 1.75, con: 1.24, lift: [0.07, 0.055, 0.065], tH: ['#ffc890', 0.03], bloom: [0.42, 0.78], hal: [0.24, '#ff8a3a'] } },
  expo: { look: 'golden', over: { exp: 1.5, con: 1.24, lift: [0.05, 0.04, 0.07], bloom: [0.6, 0.7], hal: [0.3, '#ff8a40'], vig: [0.28, 0.5, '#3a2a5a'] } },
  study: { look: 'office', over: { exp: 1.8, con: 1.24, lift: [0.06, 0.05, 0.065], tH: ['#ffd0a0', 0.02], bloom: [0.38, 0.82], hal: [0.18, '#ff7a40'] } },
};
// fixed practicals per interior (local coords). dim: how much setDim() takes away (house lights)
const SET_PRACT = {
  box: [{ p: [0, 1.75, -1.7], col: '#ffbe70', I: 5, d: 10 }, { p: [8.1, 6.5, -1.5], col: '#ffc070', I: 2.4, d: 3.2 }, { p: [0, 8.6, 5.5], col: '#ffd090', I: 6, d: 22, dim: 0.92 }, { p: [3.6, 5.6, 1.4], col: '#ffd8b0', I: 1.3, d: 7, dim: 0.7 }],
  dressing: [{ p: [-0.8, 1.62, -1.42], col: '#ffbe78', I: 1.7, d: 4.5 }, { p: [0.8, 1.62, -1.42], col: '#ffbe78', I: 1.7, d: 4.5 }, { p: [-1.0, 2.3, 0.6], col: '#ffb070', I: 0.9, d: 4 }, { p: [1.6, 2.0, 1.6], col: '#8a90d8', I: 0.6, d: 5 }],
  study: [{ p: [-0.35, 1.08, -0.86], col: '#ffc888', I: 1.3, d: 3.5 }, { p: [-2.25, 1.7, -0.35], col: '#8090e0', I: 1.3, d: 5 }, { p: [2.25, 0.4, 0.9], col: '#ff8a40', I: 1.2, d: 3.5 }, { p: [0.5, 2.6, 1.6], col: '#ffb878', I: 0.55, d: 6 }],
};
export function buildTheatre(ctx) {
  ({ THREE, toon, mkTex, PT } = ctx); macro = ctx.macro || null;
  M = materials(); houseBase = M.houseGlow.color.clone();
  const groups = {};
  for (const name of SETS) { const g = new THREE.Group(); g.name = 'theatre_' + name; g.position.set(...O[name]); g.visible = false; ctx.scene.add(g); groups[name] = g; }
  const fe = buildFordsExt(groups.fordsExt), bx = buildBox(groups.box), dr = buildDressing(groups.dressing), ex = buildExpo(groups.expo, ctx), sd = buildStudy(groups.study);
  if (ctx.NOND) for (const k in groups) groups[k].traverse((o) => { if (o.isMesh && o.material === M.spray) { ctx.NOND.add(o); o.castShadow = false; } });
  const spots = {
    // Ford's exterior (sidewalk top y 0.15)
    fordsFacade: W3('fordsExt', [0, 0.15, 0.6]), fordsDoor: W3('fordsExt', [0, 0.15, 1.2]), fordsSidewalk: W3('fordsExt', [3.5, 0.15, 2.2]), fordsStreet: W3('fordsExt', [2, 0, 11]),
    playbill: W3('fordsExt', [2, 2.0, 0.17]), playbillAframe: W3('fordsExt', [3.0, 0.85, 2.6]), carriage: W3('fordsExt', [-0.6, 0, 7.4]), horseHead: W3('fordsExt', [-4.4, 1.8, 7.4]), starSaloon: W3('fordsExt', [13.3, 0.15, 0.8]),
    // theatre interior
    stageCentre: W3('box', [0, 1.1, -6]), stageFront: W3('box', [0, 1.1, -1.6]), aisle: W3('box', [0, 0, 8]), seatRow: W3('box', [-2.0, 0, 6.0]), orchestra: W3('box', [0, 0, 0.4]),
    boxRail: W3('box', [BX.x - 0.1, BX.rail, -1.55]), boxPortrait: W3('box', [BX.x - 0.07, 5.95, -2.3]), presidentChair: W3('box', [BX.chair[0], BX.floor, BX.chair[1]]), presidentHead: W3('box', [6.8, 5.82, -1.7]),
    boxDoor: W3('box', [BX.back, BX.floor, BX.door]), figureInDoor: W3('box', [BX.back + 0.55, BX.floor, BX.door]), boxFloor: W3('box', [7.3, BX.floor, -2.4]), galleryFront: W3('box', [0, 5.1, 10.4]),
    // dressing room
    mirror: W3('dressing', [0, 1.46, -1.75]), makeupTable: W3('dressing', [0, DR.table, -1.5]), dressingChair: W3('dressing', [0.62, 0.45, -0.75]), standAtMirror: W3('dressing', [0.1, 0, -0.75]),
    skull: W3('dressing', [-0.28, DR.table, -1.45]), letter: W3('dressing', [0.12, DR.table, -1.3]), hamletCostume: W3('dressing', [-1.5, 0, -0.95]), trunk: W3('dressing', [1.5, 0, -1.15]), standInDressing: W3('dressing', [0.6, 0, 0.6]),
    // expo
    plaza: W3('expo', [0, 0, 30]), electricTower: W3('expo', [0, 0, -102]), towerTop: W3('expo', [0, 96, -102]), templeOfMusic: W3('expo', [42, 0, 30]), templeDoor: W3('expo', [27.8, 0, 30]), basin: W3('expo', [0, 0.7, -47]),
    // study
    desk: W3('study', [ST.desk[0], ST.top, ST.desk[1]]), envelope: W3('study', [ST.desk[0] - 0.01, ST.top + 0.02, ST.desk[1] - 0.06]), deskChair: W3('study', [ST.desk[0], 0.56, ST.desk[1] - 0.8]), standBehindDesk: W3('study', [ST.desk[0], 0, ST.desk[1] - 0.75]),
    armchair: W3('study', [1.7, 0.48, 0.75]), studyWindow: W3('study', [-2.6, 1.7, -0.35]), standInStudy: W3('study', [0.4, 0, 0.9]),
  };
  const V = (set, p, l, fov, cInf, fp, extra = {}) => { const c = { set, p: W3(set, p), l: W3(set, l), fov, cInf, fp: fp ? W3(set, fp) : null, ...extra }; c.focus = Math.hypot(...[0, 1, 2].map((i) => c.p[i] - (c.fp || c.l)[i])); return c; };
  const views = [
    V('fordsExt', [2.6, 1.7, 18.5], [-1.0, 7.0, 0], 56, 2.5, [0, 4, 3]),                       // 0 Ford's Theatre wide across Tenth Street (carriage, gas lamps, warm windows)
    V('fordsExt', [6.4, 1.25, 7.2], [1.0, 2.2, 0.8], 50, 4, [2.0, 2.0, 0.3]),                    // 1 low: A-frame playbill, lobby arches, horse beyond
    V('box', [-3.2, 2.5, 9.4], [2.4, 4.4, -3.0], 58, 2.5, [2, 3, -3]),                          // 2 theatre wide: seats, gaslit stage, the flag-draped box (right)
    V('box', [2.5, 5.45, -0.1], [6.6, 5.5, -1.95], 40, 4, [6.8, 5.6, -1.7]),                        // 3 box close-up: the seated silhouette, dark doorway behind
    V('dressing', [-0.35, 1.5, 2.45], [-0.62, 1.12, -1.4], 60, 3, [-0.4, 1.0, -1.3]),                 // 4 dressing room wide: mirror, sconces, costume, trunk, playbills
    V('dressing', [0.0, 1.18, -0.2], [-0.06, 0.88, -1.45], 50, 5, [-0.08, 0.8, -1.38]),             // 5 makeup table close: skull + letter
    V('expo', [-3, 7.5, 60], [0, 24, -60], 56, 1.5, [0, 10, 10]),                                 // 6 expo wide: Electric Tower, halls, crowd, all the bulbs
    V('expo', [-14, 2.2, 54], [34, 13, 28], 52, 2, [28, 6, 30]),                                    // 7 Temple of Music
    V('study', [1.5, 1.55, 2.45], [-0.5, 1.05, -1.0], 58, 3, [0.2, 0.9, -0.75]),                      // 8 study wide (desk, lamp, books, window)
    V('study', [0.24, 1.18, -0.3], [0.19, 0.8, -0.8], 42, 6, [0.19, 0.8, -0.81]),                // 9 envelope on the desk (THE WHITE HOUSE)
    V('box', [2.5, 5.45, -0.1], [6.6, 5.5, -1.95], 40, 4, [6.8, 5.6, -1.7], { dim: 1, fig: 1 }),     // 10 box close-up, house lights down, the shadow in the doorway
  ];
  const letterTex = dr.letter.material.map, envelopeTex = sd.envelope.material.map;
  const repaint = (t, fn, def, o) => { const c = t.image, g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); if (typeof o === 'function') o(g, c.width, c.height); else def(g, c.width, c.height, o || {}); t.needsUpdate = true; };
  const API = {
    groups, origin: O, spots, views, info: ex.info,
    carriage: fe.carriage, president: bx.president, figure: bx.shadow, letter: dr.letter, envelope: sd.envelope, bulbs: ex.bulbs,
    paintLetter, paintEnvelope, paintPlaybill,
    // repaint the doc meshes: pass an options object for the default painter, or your own painter fn(g, w, h)
    setLetter: (o) => repaint(letterTex, null, paintLetter, o), setEnvelope: (o) => repaint(envelopeTex, null, paintEnvelope, o),
    // house lights: 0 = full, 1 = down (stage + footlights stay lit)
    setDim(t) { DIM = Math.max(0, Math.min(1, t)); M.houseGlow.color.copy(houseBase).multiplyScalar(1 - 0.92 * DIM); },
    // shadowy figure at the box's back doorway: 0 = hidden behind the jamb, 1 = standing in the doorway (silhouette only)
    setFigure(t) { t = Math.max(0, Math.min(1, t)); bx.shadow.visible = t > 0.001; bx.shadow.position.z = BX.door - (1 - t) * 1.0; },
    setPresident(on) { bx.president.visible = !!on; },
    lightFor(name) { const base = name === 'fordsExt' ? 'explain' : name === 'expo' ? 'golden' : 'office'; const L = { ...LIGHTS_[base], ...SET_LIGHT[name] }; if (name === 'box') L.hemiI *= 1 - 0.6 * DIM; return L; },
    gradeFor: (name) => { const g = { ...((SET_GRADE[name] || {}).over || {}) }; if (name === 'box' && DIM > 0) g.exp = (g.exp || 1.4) * (1 - 0.12 * DIM); return g; },
    lookFor: (name) => (SET_GRADE[name] || {}).look || 'office',
    // show one set (or none); hides the 1904 road/stadium/office/car, D.C. and 1960s rooms when a set is shown
    show(world, name) { for (const k in groups) groups[k].visible = k === name;
      if (name) { for (const k of ['road', 'stadium', 'office', 'car', 'dc']) if (world[k]) world[k].visible = false; if (world.rooms) world.rooms.show(world, null); } },
    // drive main.js' 4 pooled PointLights: fixed lists indoors; outdoors the lamps nearest the target (tgt: THREE.Vector3, world)
    placeLights(PRACT, name, tgt) { let Lp;
      if (name === 'fordsExt' || name === 'expo') { const o = O[name], t = tgt ? [tgt.x - o[0], tgt.z - o[2]] : [0, 0];
        Lp = LAMPS[name].map((p) => (p[3] === 'car' ? { p, col: '#ffc070', I: 1.4, d: 3 } : name === 'expo' ? { p: [p[0], p[1], p[2]], col: '#ffd8a0', I: 5, d: 14 } : { p: [p[0], p[1] - 0.1, p[2]], col: '#ffbe6a', I: 4.5, d: 8 })).sort((a, b) => Math.hypot(a.p[0] - t[0], a.p[2] - t[1]) - Math.hypot(b.p[0] - t[0], b.p[2] - t[1])).slice(0, 3);
        Lp.push(name === 'fordsExt' ? { p: [0, 2.2, -0.2], col: '#ffb060', I: 3.2, d: 8 } : { p: [0, 12, -96], col: '#ffe0b0', I: 30, d: 60 }); }
      else Lp = (SET_PRACT[name] || []).map((c) => (c.dim ? { ...c, I: c.I * (1 - c.dim * DIM) } : c));
      PRACT.forEach((l, i) => { const c = Lp[i]; l.visible = true; if (!c) { l.intensity = 0; return; } l.position.set(...W3(name, c.p)); l.color.set(c.col); l.intensity = c.I; l.distance = c.d; l.decay = 1.6; }); },
    // test-view helper (main.js ?theatreview=N): { i, mod, set, L, look, grade, cam, dim, fig } (main.js routes it through the PV slot via mod)
    viewFor(i) { const k = ((i % views.length) + views.length) % views.length, c = views[k]; API.setDim(c.dim || 0); return { i: k, mod: API, set: c.set, dim: c.dim || 0, fig: c.fig || 0, L: API.lightFor(c.set), look: API.lookFor(c.set), grade: API.gradeFor(c.set), cam: { p: c.p, l: c.l, fov: c.fov, focus: c.focus, cInf: c.cInf, roll: c.roll || 0, shadowAt: c.fp || c.l } }; },
    apply(world, v) { API.show(world, v.set); API.setDim(v.dim || 0); API.setFigure(v.fig || 0); },
  };
  API.view = API.viewFor;
  return API;
}
