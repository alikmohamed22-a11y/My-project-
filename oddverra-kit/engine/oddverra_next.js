// Oddverra cast v4 ("char2" pass). Builds on v3 (thin variable-weight indigo ink, sculpted heads, structured clothing,
// purple-leaning cel shade + blue-violet rim) and adds:
//  - facing views  op.view: 'front' (default) | '34L' | '34R' (three-quarter, facing screen-left/right) | 'sideL' | 'sideR' (profile)
//    body = light 3D rig (lateral x, down y, forward z) projected with a yaw; torso = elliptic cylinder (decals follow the surface);
//    head = sphere-ish map for hair/ears, cartoon-tuned map for the face (far eye hidden in profile, nose in the silhouette)
//  - walk / run cycle for mode 'run' (op.gait 'walk' | 'run', default 'run'): opposing arm swing, knee bend, heel-strike/toe-off foot
//    roll, hip dip at contact (solved from the stance leg), forward lean, head bob/nod, lagging hair/tie/scarf/skirt/hem
//  - scene light: op.lightDir (-1..1, key light screen-x), op.keyCol, op.rimCol, op.ambient (0..1) + soft AO under chin / arms
//  - richer faces: brow shapes, upper lids for moods, smile cheek-squash, eye darts, soft mouths (no teeth), talk visemes
//  - pressure ink: thin on the lit side, heavier on the shadow side; tapered feature strokes
// API unchanged: oddverra(g, o, op) draws a 600x1000 card, soles at y≈965.
export const INK = '#2b1d4a', RIM = 'rgba(150,170,255,0.75)';
const TAU = Math.PI * 2, HP_ = Math.PI / 2;
const hex = (c) => { const n = parseInt(c.slice(1, 7), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const toHex = (a) => '#' + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mixc = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v * (1 - t) + B[i] * t)); };
const dk = (c, k = 0.74) => mixc(toHex(hex(c).map((v) => v * k)), '#3a2a7a', 0.22);
const lt = (c, t = 0.3) => mixc(c, '#fff8ec', t);
const inkFor = (base) => { try { return mixc(INK, toHex(hex(base).map((v) => v * 0.28)), 0.28); } catch (e) { return INK; } };
const lum = (c) => { const [r, g, b] = hex(c); return (0.3 * r + 0.59 * g + 0.11 * b) / 255; };
const rgba = (c, a) => { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})`; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const bump = (p, a, b) => (p > a && p < b ? Math.sin(Math.PI * (p - a) / (b - a)) : 0);
const tab = (T, p) => { for (let i = 0; i < T.length - 1; i++) { const [a, va] = T[i], [b, vb] = T[i + 1]; if (p >= a && p <= b) return va + (vb - va) * (p - a) / (b - a); } return T[T.length - 1][1]; };
const hsh = (a, b) => { const x = Math.sin(a * 91.7 + b * 47.3) * 43758.5453; return x - Math.floor(x); };
const fr1 = (p) => ((p % 1) + 1) % 1;
// fine diagonal twill: crisp hairlines a touch darker (light cloth) or lighter (dark cloth) than the base
const twill = (base) => (h) => { h.save(); h.strokeStyle = lum(base) > 0.45 ? 'rgba(60,40,90,0.07)' : 'rgba(255,245,230,0.06)'; h.lineWidth = 1; h.beginPath(); for (let x = -1000; x < 700; x += 5) { h.moveTo(x, 0); h.lineTo(x + 1000, 1000); } h.stroke(); h.restore(); };
// cel tones: shadow = multiply by a purple-leaning tint, rim = screen with blue-violet (scene rim colour mixed in)
const SHADE = '#a796d8', SHADE_SKIN = '#d0aad4';
// per-call light state (set at the top of oddverra)
let SX = 1, SG = 1, SH_ = SHADE, SHS_ = SHADE_SKIN, RIMC = 'rgba(122,142,255,0.7)', RIMC2 = 'rgba(122,142,255,0.34)', KEYT = null, FAR = 0;

// ---------- geometry helpers ----------
function cr(pts, closed = false, seg = 8) { // Catmull-Rom sampling
  const n = pts.length, out = [], P = (i) => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  const m = closed ? n : n - 1;
  for (let i = 0; i < m; i++) { const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let k = 0; k < seg; k++) { const t = k / seg, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
function polyPath(pts, P = new Path2D()) { // adds a closed polygon, forced clockwise (screen) so unions add up under nonzero
  let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
  const Q = a < 0 ? pts.slice().reverse() : pts;
  Q.forEach(([x, y], i) => i ? P.lineTo(x, y) : P.moveTo(x, y)); P.closePath(); return P;
}
const smooth = (pts, seg = 8, P) => polyPath(cr(pts, true, seg), P);
function ellP(x, y, rx, ry, rot = 0, P = new Path2D()) { P.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot)); P.ellipse(x, y, rx, ry, rot, 0, TAU); return P; }
const ellPts = (x, y, rx, ry, rot = 0, n = 20) => Array.from({ length: n }, (_, i) => { const a = TAU * i / n, c = Math.cos(a) * rx, s = Math.sin(a) * ry; return [x + c * Math.cos(rot) - s * Math.sin(rot), y + c * Math.sin(rot) + s * Math.cos(rot)]; });
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
function limb(pts, rs, P = new Path2D()) { // tapered capsule chain, joints rounded (union under nonzero)
  for (let i = 0; i < pts.length - 1; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], r1 = rs[i], r2 = rs[i + 1];
    const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a);
    polyPath([[x1 + nx * r1, y1 + ny * r1], [x2 + nx * r2, y2 + ny * r2], [x2 - nx * r2, y2 - ny * r2], [x1 - nx * r1, y1 - ny * r1]], P); }
  pts.forEach(([x, y], i) => { P.moveTo(x + rs[i], y); P.arc(x, y, rs[i], 0, TAU); });
  return P;
}

// ---------- ink + paint ----------
// cel(): pressure outline (outside the shape: thin on the lit side, heavier toward the shadow side), flat base (+ key tint),
// crisp shadow crescent (multiply) on the side away from the key, soft 2-step rim light on that far edge (screen).
function cel(g, p, base, ow = 3.6, dx = 9, dy = 7, rim = 4, pat = null, shade = SHADE) {
  if (typeof p === 'function') { const fn = p; p = new Path2D(); const rec = { beginPath() {}, closePath: () => p.closePath() };
    for (const k of ['moveTo', 'lineTo', 'quadraticCurveTo', 'bezierCurveTo', 'arc', 'ellipse', 'rect', 'roundRect']) rec[k] = (...a) => p[k](...a); fn(rec); }
  if (FAR) base = mixc(base, '#3c2e6e', FAR);
  shade = shade === SHADE ? SH_ : shade === SHADE_SKIN ? SHS_ : shade;
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (ow) { const w0 = ow >= 3.5 ? ow * 0.9 : ow * 0.72; g.strokeStyle = inkFor(base);
    g.save(); g.translate(w0 * 0.46 * SX, w0 * 0.4); g.lineWidth = w0 * 2.0; g.stroke(p); g.restore(); g.lineWidth = w0 * 1.3; g.stroke(p); }
  const paint = (sh, rimA) => { g.fillStyle = base; g.fill(p); if (pat) pat(g);
    if (KEYT && !sh) { g.globalCompositeOperation = 'multiply'; g.fillStyle = KEYT; g.fill(p); }
    if (sh) { g.globalCompositeOperation = 'multiply'; g.fillStyle = shade; g.fill(p); }
    if (rimA) { g.globalCompositeOperation = 'screen'; g.fillStyle = rimA; g.fill(p); }
    g.globalCompositeOperation = 'source-over'; };
  const clipAt = (x, y) => { g.translate(x, y); g.clip(p); g.translate(-x, -y); };
  g.save(); g.clip(p);
  if (!dx && !dy) { paint(false); g.restore(); return; }
  if (rim) { paint(true, RIMC); clipAt(-rim * 0.55 * SX, -rim * 0.2); paint(true, RIMC2); clipAt(-rim * 0.5 * SX, -rim * 0.2); }
  paint(true); clipAt(-dx * SX, -dy); paint(false); g.restore();
}
function line(g, pts, w, col = INK) { g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.lineWidth = w; g.strokeStyle = col; g.stroke(); }
// tapered brush stroke through pts (thin ends, full width mid-stroke)
function taper(g, pts, w, col = INK, e = 0.3) {
  const S = pts.length > 2 ? cr(pts, false, 10) : Array.from({ length: 11 }, (_, i) => lerp(pts[0], pts[1], i / 10)), n = S.length, L = [], R = [];
  for (let i = 0; i < n; i++) { const a = S[Math.max(0, i - 1)], b = S[Math.min(n - 1, i + 1)]; let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const l = Math.hypot(nx, ny) || 1;
    const ww = w * 0.5 * (e + (1 - e) * Math.sin(Math.PI * i / (n - 1))); L.push([S[i][0] + nx / l * ww, S[i][1] + ny / l * ww]); R.push([S[i][0] - nx / l * ww, S[i][1] - ny / l * ww]); }
  g.beginPath(); L.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = n - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath(); g.fillStyle = col; g.fill();
  if (e > 0) for (const q of [S[0], S[n - 1]]) { g.beginPath(); g.arc(q[0], q[1], w * e * 0.5, 0, TAU); g.fill(); }
}
const arcPts = (x, y, r, a0, a1, n = 10, ry = r) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [x + Math.cos(a) * r, y + Math.sin(a) * ry]; });
// soft multiply shadow (ambient occlusion) of path p, offset, blurred, clipped to clipP
function aoShadow(g, clipP, p, dx, dy, blur, col) { g.save(); g.clip(clipP); g.globalCompositeOperation = 'multiply'; g.filter = `blur(${blur}px)`; g.translate(dx, dy); g.fillStyle = col; g.fill(p); g.restore(); g.filter = 'none'; }

// heads: half-width W, half-height H, right-half anchors (x in W, y in H) from crown to chin. Flattened crowns, defined jaws.
const HEADS = {
  round: { W: 106, H: 98, a: [[0, -1], [0.6, -0.96], [0.92, -0.64], [1.0, -0.12], [0.97, 0.34], [0.8, 0.72], [0.44, 0.96], [0, 1]] },
  egg: { W: 96, H: 106, a: [[0, -1], [0.56, -0.95], [0.88, -0.62], [0.97, -0.1], [0.9, 0.38], [0.66, 0.78], [0.3, 0.98], [0, 1.01]] },
  wide: { W: 118, H: 94, a: [[0, -1], [0.66, -0.97], [0.96, -0.66], [1.0, -0.14], [1.02, 0.34], [0.9, 0.74], [0.5, 0.97], [0, 0.99]] },
  tall: { W: 90, H: 110, a: [[0, -1], [0.58, -0.95], [0.9, -0.62], [0.96, -0.1], [0.9, 0.42], [0.62, 0.82], [0.26, 1.0], [0, 1.02]] },
};
const BUILD = { adult: { w: 1, h: 1, leg: 1, hs: 1, arm: 1 }, thin: { w: 0.86, h: 1.05, leg: 1.07, hs: 0.98, arm: 1.04 }, stout: { w: 1.24, h: 0.96, leg: 0.9, hs: 1.04, arm: 0.97, belly: 1 }, kid: { w: 0.86, h: 0.74, leg: 0.7, hs: 0.9, arm: 0.74 }, old: { w: 1.04, h: 0.95, leg: 0.9, hs: 1, arm: 0.95 } };
// views: [facing sign (+1 = toward screen right), turn amount 0..1]
const VIEWS = { front: [0, 0], '34L': [-1, 0.55], '34R': [1, 0.55], sideL: [-1, 1], sideR: [1, 1] };
// brows per expression: [inner dy, mid dy, outer dy, width k] (dy in face units, + = down); asymmetric ones handled in code
const BROWS = { smile: [3, -4, 3, 0.85], happy: [1, -7, 1, 0.85], laugh: [0, -8, 1, 0.85], grin: [1, -7, 0, 0.85], excited: [2, -9, -1, 0.85], angry: [15, 8, -1, 1],
  sad: [-8, -2, 7, 0.9], worried: [-7, -3, 6, 0.9], nervous: [-6, -3, 5, 0.9], shock: [3, -8, -1, 0.85], surprised: [3, -8, -1, 0.85], pained: [9, -2, 4, 1],
  bored: [5, 4, 6, 0.9], dazed: [2, -2, 5, 0.85], whistle: [2, -6, 0, 0.85], mean: [14, 7, -2, 1] };
// upper-lid cover per expression: [inner, outer] fraction of the eye height hidden
const LIDS = { bored: [0.5, 0.5], smug: [0.42, 0.36], mean: [0.45, 0.3], angry: [0.5, 0.12], sad: [0.12, 0.42], worried: [0.08, 0.3], nervous: [0.06, 0.22], dazed: [0.35, 0.45], whistle: [0.18, 0.22] };
const SMILEY = { smile: 1, grin: 1, excited: 1, laugh: 1, happy: 1, whistle: 0, smug: 0.5 };

// ---------- props (drawn in prop space at the hand, scaled by PS) ----------
const HOLD = {
  bottle: (g) => { const b = new Path2D(); b.moveTo(-9, -150); b.lineTo(9, -150); b.lineTo(9, -100); b.quadraticCurveTo(32, -86, 32, -56); b.lineTo(32, 38); b.quadraticCurveTo(0, 50, -32, 38); b.lineTo(-32, -56); b.quadraticCurveTo(-32, -86, -9, -100); b.closePath();
    cel(g, b, '#7a4a22', 4.5, 12, 6, 6); taper(g, [[-22, -70], [-24, 20]], 6, 'rgba(255,236,200,0.75)', 0.4);
    const lb = new Path2D(); lb.rect(-31, -38, 62, 44); g.save(); g.clip(b); cel(g, lb, '#f2e6c0', 0, 6, 0, 0); g.restore(); g.lineWidth = 3; g.strokeStyle = INK; g.strokeRect(-31, -38, 62, 44);
    g.fillStyle = INK; g.font = 'bold 14px serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText('BRANDY', 0, -11); cel(g, ((p) => { p.rect(-11, -164, 22, 16); return p; })(new Path2D()), '#c8302c', 3.5, 4, 3, 0); },
  spoon: (g) => { line(g, [[0, 20], [30, -110]], 13, INK); line(g, [[0, 20], [30, -110]], 7, '#d8dce6'); cel(g, ellP(34, -128, 21, 29, 0.23), '#d8dce6', 4, 7, 6, 4); g.beginPath(); g.arc(28, -138, 5, 0, TAU); g.fillStyle = '#fff'; g.fill(); },
  medal: (g) => { for (const s of [-1, 1]) cel(g, polyPath([[-s * 14, -10], [-s * 30, -120], [-s * 6, -120], [s * 4, -10]]), s < 0 ? '#3f6fb5' : '#c0453a', 3.5, 5, 0, 0);
    cel(g, ellP(0, 30, 44, 44), '#e8b830', 4.5, 10, 9, 5); cel(g, ellP(0, 30, 28, 28), '#f6d460', 0, 5, 5, 0); g.lineWidth = 2.5; g.strokeStyle = '#b07a1a'; g.beginPath(); g.arc(0, 30, 28, 0, TAU); g.stroke(); g.beginPath(); g.arc(-12, 17, 6, 0, TAU); g.fillStyle = '#fffbe0'; g.fill(); },
  apple: (g) => { taper(g, [[0, -60], [4, -72], [7, -82]], 6, INK, 0.6); cel(g, ellP(16, -76, 14, 6.5, -0.4), '#4f9a4a', 3, 3, 3, 0);
    const a = new Path2D(); a.moveTo(0, -56); a.bezierCurveTo(24, -74, 44, -52, 34, -22); a.bezierCurveTo(28, 2, 10, 6, 0, 0); a.bezierCurveTo(-10, 6, -28, 2, -34, -22); a.bezierCurveTo(-44, -52, -24, -74, 0, -56); a.closePath();
    cel(g, a, '#d23a3a', 4.5, 11, 8, 5); g.beginPath(); g.ellipse(-14, -40, 6, 9, 0.5, 0, TAU); g.fillStyle = '#ffd0c4'; g.fill(); },
  rotten: (g) => { cel(g, ellP(0, -30, 34, 32), '#7a5a2a', 4.5, 10, 8, 5); for (const [x, y, r] of [[-12, -38, 8], [10, -18, 6], [14, -44, 4]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = '#4a3a1a'; g.fill(); }
    g.lineWidth = 8; g.strokeStyle = INK; g.beginPath(); g.moveTo(18, -46); g.quadraticCurveTo(40, -70, 30, -86); g.stroke(); g.lineWidth = 4.5; g.strokeStyle = '#f2a0b0'; g.stroke(); g.beginPath(); g.arc(30, -88, 3, 0, TAU); g.fillStyle = INK; g.fill(); },
  ladle: (g) => { line(g, [[0, 20], [10, -110]], 13, INK); line(g, [[0, 20], [10, -110]], 7, '#b8bcc6'); const b = new Path2D(); b.moveTo(-20, -126); b.arc(10, -126, 30, Math.PI, 0, true); b.closePath(); cel(g, b, '#b8bcc6', 4, 8, 6, 4); },
  mona: (g) => { const W = 110, H = 150; g.save(); g.translate(-W / 2, -H - 6); if (globalThis.__drawMona) { g.save(); g.beginPath(); g.rect(0, 0, W, H); g.clip(); globalThis.__drawMona(g, W, H); g.restore(); } else { g.fillStyle = '#5a6a4a'; g.fillRect(0, 0, W, H); g.fillStyle = '#2a2018'; g.beginPath(); g.ellipse(W / 2, H * 0.62, 34, 50, 0, 0, 7); g.fill(); g.fillStyle = '#e8c49a'; g.beginPath(); g.ellipse(W / 2, H * 0.36, 17, 22, 0, 0, 7); g.fill(); }
    g.lineWidth = 4; g.strokeStyle = '#2b1d4a'; g.strokeRect(0, 0, W, H); g.restore(); },
  framed: (g) => { const W = 150, H = 196; g.save(); g.translate(-W / 2, -H - 4); g.fillStyle = '#b8862a'; g.fillRect(0, 0, W, H); g.lineWidth = 4; g.strokeStyle = '#2b1d4a'; g.strokeRect(0, 0, W, H); g.fillStyle = '#e0b84a'; g.fillRect(8, 8, W - 16, 6); g.save(); g.translate(20, 20); if (globalThis.__drawMona) { g.beginPath(); g.rect(0, 0, W - 40, H - 40); g.clip(); globalThis.__drawMona(g, W - 40, H - 40); } else { g.fillStyle = '#5a6a4a'; g.fillRect(0, 0, W - 40, H - 40); } g.restore(); g.strokeRect(20, 20, W - 40, H - 40); g.restore(); },
  megaphone: (g) => { cel(g, polyPath([[-10, -20], [-40, -150], [60, -150], [20, -20]]), '#e8e4dc', 4.5, 14, 6, 5); cel(g, ((p) => { p.rect(-46, -160, 112, 15); return p; })(new Path2D()), '#c0453a', 4, 6, 3, 0); },
};

export function oddverra(g, o, op = {}) {
  const { expr = 'smile', blink = 0, wave, cheer } = op;
  // ---------- scene light ----------
  { const ld = op.lightDir == null ? -1 : clamp(+op.lightDir || 0, -1, 1); let sx = -ld; if (Math.abs(sx) < 0.35) sx = sx >= 0 ? 0.35 : -0.35; SX = sx; SG = sx >= 0 ? 1 : -1;
    const amb = typeof op.ambient === 'number' ? clamp(op.ambient, 0, 1) : typeof op.ambient === 'string' ? lum(op.ambient) : 0.5, ak = clamp(1.25 - amb * 0.5, 0.75, 1.25);
    SH_ = mixc('#ffffff', SHADE, ak); SHS_ = mixc('#ffffff', SHADE_SKIN, ak);
    const rc = op.rimCol ? mixc('#7a8eff', op.rimCol, 0.35) : '#7a8eff'; RIMC = rgba(rc, 0.7); RIMC2 = rgba(rc, 0.34);
    KEYT = op.keyCol ? mixc('#ffffff', op.keyCol, 0.22) : null; FAR = 0; }
  const B = BUILD[o.build || 'adult'] || BUILD.adult, HD = HEADS[o.head || 'round'] || HEADS.round;
  const skin = o.skin || '#f6c9a4', cx = 300, sole = 965, mode = op.mode || 'stand', ph = op.phase || 0, TT = op.t || 0;
  // ---------- view ----------
  let [dv, av] = VIEWS[op.view] || [0, 0];
  if (typeof op.view === 'number') { dv = Math.sign(op.view); av = Math.min(1, Math.abs(op.view)); }
  if (op.drive) av *= 0.3;
  const PHI = dv * (av <= 0.55 ? av / 0.55 * 0.62 : 0.62 + (av - 0.55) / 0.45 * (HP_ - 0.62)), SN = Math.sin(PHI), CS = Math.cos(PHI), AS = Math.abs(SN);
  const HY = dv * (av <= 0.55 ? av / 0.55 * 0.5 : 0.5 + (av - 0.55) / 0.45 * (HP_ - 0.5)), AH = Math.abs(Math.sin(HY));
  const turned = AS > 0.2, PK = 0.09, wk = Math.sqrt(CS * CS + 0.64 * SN * SN);
  const P3 = (x, y, z) => [cx + x * CS + z * SN, y + (-x * SN + z * CS) * PK];
  const dep = (x, z) => -x * SN + z * CS;
  // ---------- gait ----------
  const gaitOn = mode === 'run' && !op.drive, RUN = gaitOn && (op.gait ? op.gait === 'run' : true);
  const MV = gaitOn ? 1 : (op.drive || mode === 'sit') ? 0.6 : 0.3;
  const ank = sole - 26, legL = 250 * B.leg, L1 = (legL + 6) * 0.5;
  const LK = o.lashes && !o.bib ? 0.55 : 1; // long skirts: shorter, lower steps
  const legAng = (p) => { p = fr1(p); const A = (RUN ? 0.6 : 0.36) * LK; return [A * Math.cos(TAU * p) + (RUN ? 0.1 : 0), 0.05 + (RUN ? 0.3 : 0.14) * bump(p, 0, 0.3) + (RUN ? 1.75 * bump(p, 0.4, 0.97) : (0.22 * sstep(0.34, 0.5, p) * (p < 0.5 ? 1 : 0) + 0.95 * bump(p, 0.46, 1.0)) * LK)]; };
  const legOff = (p) => { const [th, ka] = legAng(p); return [L1 * Math.cos(th) + L1 * Math.cos(th - ka), L1 * Math.sin(th) + L1 * Math.sin(th - ka)]; }; // [down, forward]
  const bobAt = (p) => gaitOn ? (legL + 6 - Math.max(legOff(p)[0], legOff(p + 0.5)[0])) * (RUN ? 0.6 : 1) - (RUN ? 6 * Math.max(0, Math.sin(TAU * 2 * (p + 0.2))) : 0) : 0;
  const bob = bobAt(ph), headBob = gaitOn ? bobAt(ph - 0.07) - bob + (RUN ? 2 : 1.2) : 0;
  const hipY = ank - legL * (mode === 'sit' ? 0.42 : 1) + bob, torsoH = 236 * B.h, shY = hipY - torsoH, TW = 84 * B.w;
  const WW = TW * (B.belly ? 1.02 : 0.8), HPW = TW * (B.belly ? 0.96 : 0.86), waistY = shY + torsoH * 0.6;
  const HW = HD.W * B.hs, HH = HD.H * B.hs, fz = HH / 100, hy = shY - 2 - HH * HD.a[HD.a.length - 1][1] + (o.build === 'old' ? 10 : 0) + headBob;
  const NW = 21 * Math.sqrt(B.w) * B.hs, AL = 100 * B.arm, ra = 14.5 * Math.sqrt(B.w) * (o.build === 'kid' ? 0.9 : 1);
  const runner = !!o.bib, lady = !!o.lashes && !runner, kidT = o.build === 'kid' || (!!o.stripe && !runner);
  const jacket = !runner && !lady && !kidT && (o.neck === 'tie' || o.neck === 'scarf' || o.pattern === 'tweed' || o.pattern === 'pinstripe' || o.pattern === 'plaid');
  const shortSleeve = runner || kidT;
  const hemY = runner ? hipY - 28 : jacket ? hipY + 34 : lady ? waistY + 14 : hipY - 4;
  const hs = op.stance === 'relaxed' && !gaitOn ? 10 : 0;
  const lean = gaitOn ? (RUN ? 0.15 : 0.055) : 0;
  const upper = () => { if (lean && SN) g.transform(1, 0, -lean * SN, 1, lean * SN * hipY, 0); };
  const flap = gaitOn ? Math.sin(TAU * 2 * (ph - 0.12)) : 0; // secondary lag (twice per stride)
  const trail = gaitOn ? -SN * (RUN ? 1 : 0.55) : 0; // clothes/hair trail opposite to facing
  // ---------- torso surface map (elliptic cylinder, depth 0.62 × width) ----------
  const Wat = (y) => y < waistY ? TW + (WW - TW) * clamp((y - shY - 40) / (waistY - shY - 40), 0, 1) : WW + (HPW - WW) * clamp((y - waistY) / Math.max(1, hipY - waistY), 0, 1);
  const tX = (x, y) => { if (!turned && !SN) return x; const W = Wat(y), D = W * 0.8 + (B.belly && y > shY + 60 ? TW * 0.12 : 0), u = (x - cx) / W, e = Math.abs(u) > 1 ? (Math.abs(x - cx) - W) * Math.sign(u) : 0, a = Math.asin(clamp(u, -1, 1));
    return cx + W * Math.sin(a) * CS + D * Math.cos(a) * SN + e * CS; };
  const tV = (x, y) => { const W = Wat(y), a = Math.asin(clamp((x - cx) / W, -1, 1)); return -W * Math.sin(a) * SN + W * 0.8 * Math.cos(a) * CS; };
  const TP = (pts) => pts.map(([x, y]) => [tX(x, y), y]);
  const decal = (x0, y0, fn) => { if (tV(x0, y0) < -2) return; const X = tX(x0, y0), sx = clamp((tX(x0 + 2, y0) - tX(x0 - 2, y0)) / 4, 0.18, 1.2); g.save(); g.translate(X, 0); g.scale(sx, 1); g.translate(-x0, 0); fn(); g.restore(); };
  const fcx = tX(cx, shY + 60); // front centre line
  // ---------- head geometry ----------
  const hcx = cx + SN * 8, ncx = cx - SN * 6;
  const rH = (yf) => { const A = HD.a; if (yf <= A[0][1]) return 0.05; for (let i = 0; i < A.length - 1; i++) if (yf <= A[i + 1][1]) { const t = (yf - A[i][1]) / (A[i + 1][1] - A[i][1]); return A[i][0] + (A[i + 1][0] - A[i][0]) * t; } return 0.05; };
  const hmapPt = ([px, py]) => { if (!HY) return [px, py]; const yf = (py - hy) / HH, r = Math.max(0.14, rH(clamp(yf, -1, 1))) * HW, xr = px - hcx; let u = xr / r, e = 0;
    if (Math.abs(u) > 1) { e = xr - Math.sign(u) * r; u = Math.sign(u); } const t = Math.asin(u) + HY, tc = clamp(t, -HP_, HP_); return [hcx + r * Math.sin(tc) + e * Math.abs(Math.sin(tc)), py]; };
  const HMP = (pts) => pts.map(hmapPt);
  // ---------- shared pattern painter (clothes) ----------
  const fabric = (clipW = 600) => (h) => {
    const P = o.pattern, y0 = shY - 40, y1 = hipY + 80;
    if (!P) twill(o.shirt)(h);
    if (o.stripe && !jacket) { h.fillStyle = o.stripe; for (let y = shY + 44; y < y1; y += 46) h.fillRect(0, y, clipW, 15); }
    if (P === 'plaid') { h.fillStyle = 'rgba(20,10,40,0.16)'; for (let y = y0; y < y1; y += 46) h.fillRect(0, y, 600, 17); for (let x = cx - 300; x < 600; x += 46) h.fillRect(x, y0, 17, y1 - y0);
      h.fillStyle = o.plaidLine || 'rgba(255,240,200,0.45)'; for (let y = y0 + 30; y < y1; y += 46) h.fillRect(0, y, 600, 2.2); for (let x = cx - 270; x < 600; x += 46) h.fillRect(x, y0, 2.2, y1 - y0); }
    if (P === 'pinstripe') { h.fillStyle = 'rgba(255,255,255,0.22)'; for (let x = cx - 301; x < 600; x += 15) h.fillRect(x, y0, 1.6, y1 - y0); }
    if (P === 'dots') { h.fillStyle = o.dotCol || 'rgba(255,255,255,0.8)'; for (let y = shY + 14, r = 0; y < y1; y += 28, r++) for (let x = cx - 300 + (r % 2) * 14; x < 600; x += 28) { h.beginPath(); h.arc(x, y, 4.6, 0, TAU); h.fill(); } }
    if (P === 'tweed') { h.strokeStyle = 'rgba(40,24,10,0.2)'; h.lineWidth = 1.3; h.beginPath(); for (let y = y0; y < y1; y += 9) for (let x = (y / 9 % 2) * 6; x < 600; x += 12) { h.moveTo(x, y); h.lineTo(x + 5, y + 4); } h.stroke(); }
  };
  // ---------- head outline + hair shell ----------
  const HP = (() => { const A = HD.a.map(([x, y]) => [hcx + x * HW, hy + y * HH]); const L = HD.a.slice(1, -1).reverse().map(([x, y]) => [hcx - x * HW, hy + y * HH]); return cr([...A, ...L], true, 10); })();
  const headP = polyPath(HP);
  const nose = o.nose || 'button';
  // profile: nose (and a touch of chin) join the silhouette
  const profNose = AH > 0.8 ? (() => { const nx = hcx + dv * (rH(0.26) * HW + (nose === 'round' ? 6 : nose === 'long' ? 9 : 4) * fz), ny = hy + 27 * fz;
    return nose === 'round' ? ellPts(nx, ny, 13 * fz, 11 * fz) : nose === 'long' ? ellPts(nx + dv * 4 * fz, ny + 3 * fz, 15 * fz, 8 * fz, dv * 0.35) : ellPts(nx, ny, 8.5 * fz, 7.5 * fz, dv * 0.2); })() : null;
  const headSil = profNose ? polyPath(profNose, polyPath(HP)) : headP;
  const hc = o.hairCol || '#3a2a20', hairOn = o.hair && o.hair !== 'bald';
  const sway = (k) => Math.sin(TT * 0.45 + k * 1.3) * 3 * MV + flap * 2.2 + trail * 3;
  // ---------- back hair (behind everything) ----------
  g.save(); upper();
  if (o.hair === 'bun') { const bx = hcx + 4 - SN * HW * 0.62, by = hy - HH * (1.02 - 0.22 * AH); cel(g, ellP(bx, by, HW * 0.38 * (1 - 0.15 * AH), HH * 0.34), hc, 3.4, 8, 7, 3); taper(g, arcPts(bx, by, HW * 0.24, 3.6, 5.4, 8, HH * 0.2), 2.2, mixc(hc, INK, 0.4)); }
  if (o.hair === 'long') { const sw = Math.sin(TT * 0.4) * 4 * MV + trail * 8 + flap * 3, by = shY + 70, kx = 1 - 0.25 * AS, ox = -SN * HW * 0.3;
    const X = (x) => hcx + ox + (x - hcx) * kx;
    const lp = smooth([[X(hcx - HW * 1.04), hy - HH * 0.2], [X(hcx - HW * 1.12), hy + HH * 0.6], [X(hcx - HW * 1.08) + sw, by - 20], [X(hcx - HW * 0.8) + sw, by], [X(hcx - HW * 0.45) + sw, by - 12], [X(hcx), by - 4], [X(hcx + HW * 0.45) + sw, by - 12], [X(hcx + HW * 0.8) + sw, by], [X(hcx + HW * 1.08) + sw, by - 20], [X(hcx + HW * 1.12), hy + HH * 0.6], [X(hcx + HW * 1.04), hy - HH * 0.2], [X(hcx), hy - HH * 1.1]], 8);
    cel(g, lp, dk(hc, 0.9), 3.6, 10, 6, 4); g.save(); g.clip(lp); for (let k = -2; k <= 2; k++) taper(g, [[X(hcx + k * HW * 0.3), hy + HH * 0.4], [X(hcx + k * HW * 0.34) + sw * 0.8, by - 18]], 1.8, mixc(hc, INK, 0.5), 0.1); g.restore(); }
  g.restore();
  // ---------- legs: rig ----------
  const legs = [-1, 1].map((s) => {
    const p = ph + (s > 0 ? 0.5 : 0), lat = s * HPW * 0.47 + hs, hj3 = [lat, hipY - 6, 0]; let K3, A3, pitch = 0, Ls = 0;
    if (mode === 'sit') { K3 = [s * HPW * 0.95, hipY + 10, legL * 0.42 * AS]; A3 = [s * HPW * 1.0, ank, legL * 0.42 * AS]; }
    else if (mode === 'fall') { K3 = [s * HPW * 1.25, hipY + legL * 0.36, 0]; A3 = [s * HPW * 1.85, ank - 44, 0]; }
    else if (gaitOn) { const [th, ka] = legAng(p), kl = lat + s * 3, al = s * (HPW * 0.5 + 4);
      K3 = [kl, hj3[1] + L1 * Math.cos(th), L1 * Math.sin(th)]; A3 = [al, K3[1] + L1 * Math.cos(th - ka), K3[2] + L1 * Math.sin(th - ka)];
      pitch = tab(RUN ? [[0, 0.2], [0.1, 0], [0.3, -0.1], [0.5, -0.9], [0.65, -0.6], [0.88, 0.1], [1, 0.2]] : [[0, 0.38], [0.1, 0], [0.32, 0], [0.5, -0.75], [0.62, -0.5], [0.86, 0.06], [1, 0.38]], fr1(p));
      Ls = clamp(K3[2] / (L1 * 0.8), 0, 1) * 0.5 * CS; }
    else { const bent = hs && s === -1; K3 = [lat + (bent ? s * -8 : s * 2), hipY + legL * 0.5, 0]; A3 = [s * (HPW * 0.5 + 4) + hs * 0.5 + (bent ? s * 10 : 0), ank, 0]; }
    const hj = P3(...hj3), K = P3(...K3), A = P3(...A3);
    return { s, hj, K, A, fy: A[1], Ls, pitch, depth: dep(hj3[0], 0) + dep(A3[0], A3[2]) * 0.5 };
  });
  const rl = HPW * 0.5;
  const pantsCol = o.pants || '#3b3f52', crc = mixc(pantsCol, INK, 0.5);
  const hipBlock = () => { const bx = (x, y, s) => cx + (x - cx) * wk + lean * SN * Math.max(0, hipY - y) + (turned && s === -dv ? -dv * AS * 6 * (y > waistY + 20 ? 1 : 0) : 0) + (turned && s === dv && B.belly ? dv * AS * TW * 0.1 : 0);
    return [[bx(cx - WW * 0.97, waistY, -1), waistY], [bx(cx + WW * 0.97, waistY, 1), waistY], [bx(cx + HPW, hipY - 18, 1), hipY - 18], [bx(cx + HPW * 0.5, hipY + 8, 1), hipY + 8], [cx, hipY + 12], [bx(cx - HPW * 0.5, hipY + 8, -1), hipY + 8], [bx(cx - HPW, hipY - 18, -1), hipY - 18]]; };
  const legPath = (L, P) => { const near = mode === 'sit' ? 1.08 : 1 + 0.22 * L.Ls; return limb([L.hj, lerp(L.hj, L.K, 0.5), L.K, lerp(L.K, L.A, 0.55), L.A], [rl, rl * 0.9, rl * 0.76 * near, rl * 0.74, rl * 0.7], P); };
  const legLines = (L) => { const s = L.s;
    if (mode !== 'sit') taper(g, [lerp(L.hj, L.K, 0.25), [L.K[0] - s * rl * 0.15 * CS + SN * rl * 0.2, L.K[1]], lerp(L.K, L.A, 0.85)], 2.2, crc, 0.1);
    const bend = Math.abs(Math.atan2(L.K[0] - L.hj[0], L.K[1] - L.hj[1]) - Math.atan2(L.A[0] - L.K[0], L.A[1] - L.K[1]));
    if (bend > 0.25 || mode === 'sit') { const bx = turned ? -dv * rl * 0.35 : 0; taper(g, [[L.K[0] - rl * 0.5 + bx, L.K[1] + 6], [L.K[0] + bx, L.K[1] + 2], [L.K[0] + rl * 0.5 + bx, L.K[1] + 6]], 2.4, crc, 0.2); }
    else taper(g, [[L.K[0] - s * rl * 0.62 * CS, L.K[1] - 4], [L.K[0] - s * rl * 0.3 * CS, L.K[1] + 6]], 2, crc, 0.2);
    taper(g, [[L.A[0] - rl * 0.62, L.A[1] - 8], [L.A[0] + rl * 0.62, L.A[1] - 8]], 1.8, crc, 0.4); };
  const shoe = (L) => { const s = L.s, toe = turned ? dv : s, kL = turned ? 0.9 + 0.15 * AS : 1, fx = L.A[0] + toe * 9 * kL, fy = L.fy + (!gaitOn && mode === 'run' ? -4 : 0);
    const sp = smooth([[fx - toe * 22 * kL, fy - 12], [fx + toe * 6 * kL, fy - 17], [fx + toe * 30 * kL, fy - 8], [fx + toe * 37 * kL, fy + 5], [fx + toe * 28 * kL, fy + 13], [fx - toe * 4 * kL, fy + 14], [fx - toe * 27 * kL, fy + 9], [fx - toe * 28 * kL, fy - 2]], 6);
    g.save(); if (L.pitch) { const pv = L.pitch > 0 ? [fx - toe * 26 * kL, fy + 12] : [fx + toe * 32 * kL, fy + 12]; g.translate(pv[0], pv[1]); g.rotate(-toe * L.pitch); g.translate(-pv[0], -pv[1]); }
    cel(g, sp, o.shoes || '#3a2a2a', 3.4, 6, 5, 3);
    g.save(); g.clip(sp); g.fillStyle = '#1d1426'; g.fillRect(fx - 50, fy + 8, 100, 10); g.fillStyle = '#3a2418'; g.fillRect(fx - toe * 30 * kL, fy + 6, toe * 14 * kL, 10); g.restore(); line(g, [[fx - toe * 16 * kL, fy + 6], [fx - toe * 16 * kL, fy + 14]], 1.4); line(g, [[fx - toe * 26 * kL, fy + 8], [fx + toe * 31 * kL, fy + 8]], 1.6);
    taper(g, [[fx - toe * 8, fy - 12], [fx + toe * 12, fy - 9]], 3, 'rgba(255,255,255,0.55)', 0.4);
    if (runner) for (let k = 0; k < 2; k++) line(g, [[fx + toe * (-2 + k * 8), fy - 15], [fx + toe * (4 + k * 8), fy - 9]], 2, '#e8e4dc');
    g.restore(); };
  const showPants = !lady || mode === 'sit' || mode === 'fall' || (mode === 'run' && !gaitOn);
  const legOrder = turned ? legs.slice().sort((a, b) => a.depth - b.depth) : legs;
  // ---------- arms: rig ----------
  const PA = turned && dv > 0 ? -1 : 1; // the arm that holds props / waves (the near one when turned)
  const r = op.reach || 0;
  const arm3 = (s) => { const S = [s * (TW - 10), shY + 24, -9 * AS], ad = (p, x, y, z = 0) => [p[0] + x, p[1] + y, p[2] + z];
    if (mode === 'fall') { const E = ad(S, s * AL * 0.72, -AL * 0.36); return [S, E, ad(E, s * AL * 0.4, -AL * 0.78)]; }
    if (op.prop === 'stick' && s === PA) { const E = ad(S, s * AL * 0.72, AL * 0.3, AL * 0.2); return [S, E, ad(E, s * 4, -AL * 0.88, AL * 0.1)]; }
    if (HOLD[op.prop] && s === PA) { const E = ad(S, s * AL * 0.5, AL * 0.78 - AL * 0.4 * r * (1 - 0.5 * AS), AL * (0.3 + 0.2 * AS)); return [S, E, ad(E, s * AL * (0.42 + 0.25 * r), -AL * (0.62 + 0.3 * r) * (1 - 0.55 * AS), AL * (0.35 + 0.3 * AS))]; }
    if (cheer) { const E = ad(S, s * AL * 0.55, -AL * (0.62 - 0.1 * AS), AL * (0.15 + 0.5 * AS)); return [S, E, ad(E, s * AL * 0.12, -AL * (0.92 - 0.25 * AS), AL * (0.1 + 0.6 * AS))]; }
    if (s === PA && wave !== undefined) { const E = ad(S, s * AL * 0.82, AL * 0.12, AL * (0.1 + 0.4 * AS)); return [S, E, ad(E, s * (-10 + 22 * (wave || 0)), -AL * 0.95, AL * (0.1 + 0.25 * AS))]; }
    if (op.hip && s === -PA) { const E = ad(S, s * AL * 0.62, AL * 0.58, -AL * 0.2); return [S, E, [s * (WW + 8), waistY + 6, -6]]; }
    if (gaitOn) { const p = ph + (s > 0 ? 0.5 : 0), Bq = RUN ? 0.75 : 0.44, psi = -Bq * Math.cos(TAU * p - 0.35), be = RUN ? 1.45 : 0.22 + 0.42 * Math.max(0, psi / Bq);
      const E = ad(S, s * 12, AL * 0.98 * Math.cos(psi), AL * 0.98 * Math.sin(psi)); return [S, E, ad(E, s * 3, AL * 0.95 * Math.cos(psi + be), AL * 0.95 * Math.sin(psi + be))]; }
    const E = ad(S, s * 17, AL * 0.98); return [S, E, ad(E, s * 2, AL * 0.95)]; };
  const SA = op.steer || 0, WC = [cx + SN * 40, shY + AL * 1.3], WR = 80 * Math.min(1.15, B.w), rimP = (s) => [WC[0] + Math.cos(SA) * s * (WR - 6) * Math.max(0.3, CS) - Math.sin(SA) * -5, WC[1] + Math.sin(SA) * s * (WR - 6) * 0.4 + Math.cos(SA) * -5];
  const arms = [-1, 1].map((s) => { if (op.drive) { const S = P3(s * (TW - 10), shY + 24, 0); return [s, [S, [S[0] + s * 30 * CS, S[1] + AL * 0.82], rimP(s)], 0]; }
    const A = arm3(s); return [s, A.map((p) => P3(...p)), dep(A[0][0], 0) + 0.3 * dep(A[2][0], A[2][2])]; });
  const farArm = (a) => turned && a[2] < -8 && !op.drive;
  const hand = (Hp, ang, s, grip) => { // mitten hand + thumb, one outline
    const hp = ellP(Hp[0], Hp[1], 12.5 * Math.sqrt(B.w) * (o.build === 'kid' ? 0.85 : 1), 11.5 * (o.build === 'kid' ? 0.85 : 1), ang);
    const tx = Hp[0] + Math.cos(ang) * -3 + Math.cos(ang + s * Math.PI / 2) * -10, ty = Hp[1] + Math.sin(ang) * -3 + Math.sin(ang + s * Math.PI / 2) * -10;
    ellP(tx, ty, 6.5, 4.6, ang - s * 0.7, hp); const glove = o.neck === 'scarf' && o.hat === 'cap'; cel(g, hp, glove ? '#8a5c36' : skin, 3, 4, 4, 2, null, glove ? SHADE : SHADE_SKIN);
    if (!grip) taper(g, [[Hp[0] + Math.cos(ang) * 4 + Math.cos(ang + Math.PI / 2) * 6, Hp[1] + Math.sin(ang) * 4 + Math.sin(ang + Math.PI / 2) * 6], [Hp[0] + Math.cos(ang) * 10, Hp[1] + Math.sin(ang) * 10]], 1.6, INK, 0.2); };
  let torsoP = null;
  const armGeo = ([s, P]) => { const [S, E, H] = P, ang = Math.atan2(H[1] - E[1], H[0] - E[0]), Wr = [H[0] - Math.cos(ang) * 11, H[1] - Math.sin(ang) * 11];
    return { S, E, H, ang, Wr, pts: [S, lerp(S, E, 0.5), E, lerp(E, Wr, 0.5), Wr] }; };
  const drawArm = (a, grip = false) => { const [s] = a, { S, E, H, ang, Wr, pts } = armGeo(a), far = farArm(a);
    const bendA = Math.abs(((Math.atan2(E[1] - S[1], E[0] - S[0]) - ang + 3 * Math.PI) % TAU) - Math.PI), bent = bendA < 2.5;
    if (far) FAR = 0.16;
    // soft occlusion where the arm meets / passes over the body
    if (torsoP && !far && !op.drive) aoShadow(g, torsoP, limb(pts, [ra * 1.5, ra * 1.3, ra * 1.1, ra, ra]), SX * 7, 5, 7, 'rgba(110,80,165,0.42)');
    if (shortSleeve) {
      cel(g, limb(pts, [ra * 1.05, ra, ra * 0.84, ra * 0.9, ra * 0.76]), skin, 3.2, 6, 5, 3, null, SHADE_SKIN);
      const sE = lerp(S, E, 0.6), slv = limb([S, sE], [ra * 1.5, ra * 1.32]); cel(g, slv, o.shirt, 3.4, 7, 5, 3, fabric());
      const sa = Math.atan2(sE[1] - S[1], sE[0] - S[0]), nx = -Math.sin(sa) * ra * 1.3, ny = Math.cos(sa) * ra * 1.3;
      if (o.trim) { g.save(); g.clip(slv); line(g, [[sE[0] + nx, sE[1] + ny], [sE[0] - nx, sE[1] - ny]], 9, o.trim); g.restore(); }
      if (bent) taper(g, [E, [E[0] - s * 5, E[1] + 7]], 1.8, mixc(skin, INK, 0.5), 0.2);
    } else {
      const k = 1.1, slv = limb(pts, [ra * (lady ? 1.75 : 1.22) * k, ra * (lady ? 1.45 : 1.16) * k, ra * 0.98 * k, ra * 1.0 * k, ra * 0.92 * k]);
      cel(g, slv, o.shirt, 3.4, 7, 5, 3, fabric());
      const cuff = limb([lerp(E, Wr, 0.86), [Wr[0] + Math.cos(ang) * 4, Wr[1] + Math.sin(ang) * 4]], [ra * 0.86, ra * 0.84]); cel(g, cuff, o.cuff || '#f6f3ea', 2.6, 3, 2, 0);
      const fc = mixc(o.shirt, INK, 0.45);
      if (bent) { const n = [Math.cos(ang + Math.PI / 2), Math.sin(ang + Math.PI / 2)]; taper(g, [[E[0] + n[0] * ra * 0.5 - Math.cos(ang) * 6, E[1] + n[1] * ra * 0.5 - Math.sin(ang) * 6], [E[0] + n[0] * ra * 0.1, E[1] + n[1] * ra * 0.1]], 2, fc, 0.2); taper(g, [[E[0] - n[0] * ra * 0.7, E[1] - n[1] * ra * 0.7], [E[0] - n[0] * ra * 0.2 + Math.cos(ang) * 10, E[1] - n[1] * ra * 0.2 + Math.sin(ang) * 10]], 1.8, fc, 0.2); }
      else taper(g, [lerp(S, E, 0.8), lerp(E, Wr, 0.25)], 1.8, fc, 0.2);
      // shoulder seam / drape fold (reads the turn of the sleeve)
      taper(g, [lerp(S, E, 0.18), lerp(S, E, 0.42)], 1.6, fc, 0.1);
    }
    hand(H, ang, s, grip); FAR = 0; };
  // far arm: behind everything on the body
  g.save(); upper(); for (const a of arms) if (farArm(a)) drawArm(a); g.restore();
  // ---------- legs, pants, shoes ----------
  if (showPants) {
    if (!turned) { const pantsP = polyPath(hipBlock()); for (const L of legs) legPath(L, pantsP); cel(g, pantsP, pantsCol, 3.6, rl * 0.5, 4, 6, twill(pantsCol)); for (const L of legs) legLines(L); }
    else { const [Lf, Ln] = legOrder; FAR = 0.14; cel(g, legPath(Lf), pantsCol, 3.6, rl * 0.5, 4, 6, twill(pantsCol)); legLines(Lf); FAR = 0;
      const pantsP = polyPath(hipBlock()); legPath(Ln, pantsP); cel(g, pantsP, pantsCol, 3.6, rl * 0.5, 4, 6, twill(pantsCol)); legLines(Ln);
      taper(g, [[cx - dv * HPW * 0.5 * wk, hipY - 30], [cx - dv * HPW * 0.75 * wk, hipY - 4]], 2, crc, 0.2); }
    if (o.belt || runner || kidT) { const pantsP = polyPath(hipBlock()); for (const L of legs) legPath(L, pantsP);
      const bt = o.belt || '#6a4428', bY0 = runner ? hemY + 1 : kidT ? hemY - 6 : waistY + 8, bp = new Path2D(); bp.rect(cx - HPW * 1.2, bY0, HPW * 2.4, 13); g.save(); g.clip(pantsP); cel(g, bp, bt, 0, 8, 0, 0); g.fillStyle = 'rgba(255,230,190,0.35)'; for (let x = cx - HPW; x < cx + HPW; x += 9) g.fillRect(x, bY0 + 2, 3, 1.2); g.restore();
      line(g, [[cx - HPW * 1.02 * wk, bY0 + 13], [cx + HPW * 1.02 * wk, bY0 + 13]], 1.6); decal(cx, bY0, () => { const bk = new Path2D(); bk.roundRect(cx - 9, bY0 - 2, 18, 17, 3); cel(g, bk, '#d9b04a', 2, 3, 2, 0); g.lineWidth = 1.6; g.strokeStyle = '#8a6420'; g.strokeRect(cx - 4.5, bY0 + 2.5, 9, 8); }); }
    if (kidT && mode !== 'sit') { const L = legOrder[legOrder.length - 1], pp = ellP(L.K[0] + 2, L.K[1] + 4, rl * 0.5 * (turned ? 0.8 : 1), rl * 0.46, 0.2); cel(g, pp, '#a8865a', 2, 3, 3, 0); g.setLineDash([3, 3]); g.lineWidth = 1.2; g.strokeStyle = '#f2e6c0'; g.beginPath(); g.ellipse(L.K[0] + 2, L.K[1] + 4, rl * 0.38 * (turned ? 0.8 : 1), rl * 0.34, 0.2, 0, TAU); g.stroke(); g.setLineDash([]); }
  }
  for (const L of legOrder) { if (turned && L === legOrder[0]) FAR = 0.14; shoe(L); FAR = 0; }
  if (lady && !showPants) { // long skirt (1900s), sways a little; swings with the stride
    const sw = Math.sin(TT * 0.5) * 5 * MV + trail * 6 + flap * 3, short = mode !== 'stand' && !gaitOn, sb = short ? hipY + legL * 0.45 : ank - 12, fl = HPW * (short ? 1.35 : 1.55) * (turned ? 0.82 + 0.18 * CS : 1);
    const kick = gaitOn ? Math.sin(TAU * ph) * 7 * CS : 0, X = (x) => cx + (x - cx) * wk;
    const sk = [[X(cx - WW * 0.98), waistY + 8], [X(cx + WW * 0.98), waistY + 8], [X(cx + HPW * 1.08), hipY - 10], [cx + fl + sw + kick, sb]];
    for (let k = 6; k >= 0; k--) sk.push([cx - fl + (2 * fl) * k / 6 + sw + kick * (k / 6 * 2 - 1), sb + (k % 2 ? 7 : 0) + (gaitOn ? 3 * Math.sin(TAU * ph + k) : 0)]);
    sk.push([cx - fl + sw - kick, sb], [X(cx - HPW * 1.08), hipY - 10]);
    const skP = polyPath(sk); cel(g, skP, pantsCol, 3.6, fl * 0.32, 4, 6, twill(pantsCol));
    const fc = mixc(pantsCol, INK, 0.5); for (const k of [-0.5, 0, 0.5]) taper(g, [[cx + k * HPW * 0.9 * wk, hipY + 10], [cx + k * fl * 0.96 + sw * 0.8, sb - 6]], 2, fc, 0.1);
  }
  // ---------- torso ----------
  g.save(); upper();
  const wav = (k) => runner ? (2 + 4 * MV) * Math.sin(k * 1.3 + TT * 0.55) : jacket && gaitOn ? 3 * flap * Math.sin(k * 0.9) : 0;
  const prof = (s, y) => { if (!turned) return 0; let v = 0;
    if (s === dv) { v += 9 * sstep(shY, shY + 60, y) * (1 - sstep(waistY - 20, waistY + 20, y)); if (B.belly) v += TW * 0.2 * bump(y, shY + 70, hemY + 10); }
    else { v += 4 * bump(y, shY + 10, shY + 90) - 4 * bump(y, waistY - 40, waistY + 30) + (jacket ? 5 * sstep(waistY, hemY, y) + (gaitOn ? 4 + 3 * flap : 0) * sstep(waistY + 20, hemY, y) : 0); }
    return s * v * AS; };
  const side = (s) => { const pts = [[cx + s * (NW + 6), shY - 4], [cx + s * TW * 0.64, shY + 5], [cx + s * TW, shY + 26], [cx + s * TW * 0.98, shY + 70]];
    if (B.belly) pts.push([cx + s * WW * 1.06, waistY - 30], [cx + s * WW, waistY + 20]); else pts.push([cx + s * WW, waistY]);
    pts.push([cx + s * HPW * (jacket ? 1.06 : 0.98), hemY - 14], [cx + s * HPW * (jacket ? 1.04 : 0.96), hemY + wav(0)]);
    return pts.map(([x, y], i) => [cx + (x - cx) * (i === 0 ? 1 - 0.2 * AS : wk) + prof(s, y), y]); };
  const R = cr(side(1), false, 8), Lf = cr(side(-1), false, 8).reverse();
  const hem = []; for (let k = 1; k < 8; k++) { const x = cx + HPW * (1 - k / 4); hem.push([cx + (x - cx) * wk + prof(Math.sign(x - cx) || 1, hemY) * 0.5, hemY + wav(k) - (jacket && Math.abs(x - cx) < 14 ? 18 - Math.abs(x - cx) : 0)]); }
  if (jacket) hem.splice(3, 1, [clamp(tX(cx, hemY), cx - HPW * wk + 4, cx + HPW * wk - 4), hemY - 20]);
  const nkx = cx + SN * NW * 0.5;
  const neck = arcPts(nkx, shY - 4, (NW + 6) * (1 - 0.2 * AS), Math.PI, 0, 8, runner || kidT || lady ? 18 : 10);
  torsoP = polyPath([...R, ...hem, ...Lf, ...neck.slice(1, -1)]);
  const tpat = (h) => { fabric()(h);
    if (o.sash) { const sp = TP([[cx - TW * 0.86, shY - 6], [cx - TW * 0.5, shY - 6], [cx + WW * 1.1, hemY - 6], [cx + WW * 0.78, hemY + 12]]); h.fillStyle = o.sash; h.beginPath(); sp.forEach(([x, y], i) => h[i ? 'lineTo' : 'moveTo'](x, y)); h.closePath(); h.fill();
      h.strokeStyle = mixc(o.sash, INK, 0.35); h.lineWidth = 1.6; h.beginPath(); h.moveTo(...sp[0]); h.lineTo(...sp[3]); h.moveTo(...sp[1]); h.lineTo(...sp[2]); h.stroke(); }
    if (o.trim) { h.strokeStyle = o.trim; h.lineWidth = 9; h.beginPath(); neck.forEach(([x, y], i) => h[i ? 'lineTo' : 'moveTo'](x, y + 3)); h.stroke(); h.beginPath(); [[cx + HPW, hemY - 4], ...hem.map(([x, y]) => [x, y - 4]), [cx - HPW, hemY - 4]].forEach(([x, y], i) => h[i ? 'lineTo' : 'moveTo'](x, y)); h.stroke();
      h.strokeStyle = mixc(o.trim, INK, 0.4); h.lineWidth = 1.4; h.beginPath(); neck.forEach(([x, y], i) => h[i ? 'lineTo' : 'moveTo'](x, y + 7.5)); h.stroke(); }
    if (o.vest) { h.fillStyle = o.vest; for (const s of [-1, 1]) { const vp = TP([[cx + s * TW * 1.2, shY], [cx + s * 20, shY + 40], [cx + s * 16, hipY + 40], [cx + s * TW * 1.3, hipY + 40]]); h.beginPath(); vp.forEach(([x, y], i) => h[i ? 'lineTo' : 'moveTo'](x, y)); h.fill(); } }
  };
  cel(g, torsoP, o.shirt, 3.8, TW * 0.3 * wk, 6, 7, tpat);
  { // structure lines: side seams / waist pull folds, crisp
    const fc = mixc(o.shirt, INK, 0.45), sw = Math.sin(TT * 0.35) * MV * 6;
    for (const s of [-1, 1]) if (tV(cx + s * TW * 0.75, shY + 80) > -4) taper(g, TP([[cx + s * TW * 0.72, shY + 40], [cx + s * TW * 0.8, shY + torsoH * 0.32], [cx + s * WW * 0.82, waistY - 10]]), 1.8, fc, 0.1);
    if (!jacket) { taper(g, TP([[cx - WW * 0.7 + sw, waistY - 6], [cx - WW * 0.2 + sw, waistY + 6]]), 1.8, fc, 0.1); taper(g, TP([[cx + WW * 0.45 + sw, waistY + 2], [cx + WW * 0.8, waistY - 12]]), 1.8, fc, 0.1); }
    if (turned && gaitOn) taper(g, [[cx - dv * TW * 0.3 * wk, waistY - 30], [cx + dv * TW * 0.1 * wk, waistY - 10 + 4 * flap]], 1.6, fc, 0.1); // stride pull
  }
  // jacket: shirt V, lapels, buttons, pocket flaps
  if (jacket) {
    const vB = shY + torsoH * 0.42; cel(g, polyPath(TP([[cx - NW - 2, shY - 3], [cx + NW + 2, shY - 3], [cx, vB]])), o.collar || '#f4f1e8', 0, 6, 4, 0);
    for (const s of [-1, 1]) { if (tV(cx + s * TW * 0.45, shY + 40) < -6) continue; const lp = polyPath(TP([[cx + s * (NW + 3), shY - 5], [cx + s * TW * 0.5, shY + 28], [cx + s * TW * 0.36, shY + 40], [cx + s * TW * 0.46, shY + 56], [cx + s * 4, vB + 6], [cx + s * NW * 0.6, shY + 30]]));
      cel(g, lp, mixc(o.shirt, '#000000', 0.08), 2.6, s * SG > 0 ? 5 : 0, 3, 0, fabric()); }
    if (o.neck !== 'scarf') { const wc = o.vest || mixc(o.shirt, o.build === 'stout' ? '#5a2a3a' : '#e8dcc0', 0.3), wv = polyPath(TP([[cx - NW * 1.05, shY + torsoH * 0.22], [cx + NW * 1.05, shY + torsoH * 0.22], [cx + 4, vB + 4], [cx - 4, vB + 4]])); cel(g, wv, wc, 1.8, 4, 2, 0); for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(tX(cx, shY + 60), shY + torsoH * 0.27 + i * 14, 2, 0, TAU); g.fillStyle = INK; g.fill(); } }
    for (let i = 0; i < 2; i++) decal(cx + 8, vB + 22 + i * 34, () => cel(g, ellP(cx + 8, vB + 22 + i * 34, 4.5, 4.5), o.button || dk(o.shirt, 0.6), 2, 1, 1, 0));
    { const px = cx - TW * 0.62, py = shY + torsoH * 0.3; if (tV(px, py) > -2) decal(px, py, () => { line(g, [[px - 14, py + 4], [px + 16, py + 2]], 2, mixc(o.shirt, INK, 0.55)); cel(g, polyPath([[px - 10, py + 3], [px - 4, py - 8], [px + 2, py + 2], [px + 8, py - 7], [px + 12, py + 2]]), '#f6f2e8', 1.8, 2, 1, 0); }); }
    if (o.build === 'stout' || o.hat === 'bowler') { const c0 = [tX(cx + 6, vB + 28), vB + 28], c1 = [tX(cx - WW * 0.62, vB + 16), vB + 16], cy = vB + 52 + 4 * flap; if (tV(cx - WW * 0.62, vB + 16) > -4) { g.lineWidth = 2.6; g.strokeStyle = '#7a5a12'; g.beginPath(); g.moveTo(c0[0], c0[1]); g.quadraticCurveTo((c0[0] + c1[0]) / 2, cy, c1[0], c1[1]); g.stroke(); g.setLineDash([2.5, 2.5]); g.lineWidth = 2; g.strokeStyle = '#f2cf5a'; g.stroke(); g.setLineDash([]); cel(g, ellP(c1[0] - 2, c1[1] + 6, 6, 6), '#e8b830', 1.8, 2, 2, 0); } }
    if (o.hat === 'top' && o.build === 'stout') { const fx0 = cx + TW * 0.44, fy0 = shY + 42; if (tV(fx0, fy0) > -2) decal(fx0, fy0, () => { const fp = new Path2D(); for (let k = 0; k < 5; k++) ellP(fx0 + Math.cos(k * 1.256) * 5, fy0 + Math.sin(k * 1.256) * 5, 4.5, 4.5, 0, fp); cel(g, fp, '#d03a44', 1.8, 2, 2, 0); g.beginPath(); g.arc(fx0, fy0, 2.4, 0, TAU); g.fillStyle = '#f2cf5a'; g.fill(); }); }
    for (const s of [-1, 1]) if (tV(cx + s * WW * 0.6, hipY - 4) > -3) taper(g, TP([[cx + s * WW * 0.36, hipY - 4], [cx + s * WW * 0.9, hipY - 6]]), 2.2, mixc(o.shirt, INK, 0.55), 0.2);
  }
  if (!jacket && !o.noButtons && !runner && !kidT) for (let i = 0; i < 3; i++) decal(cx, shY + 40 + i * 40, () => cel(g, ellP(cx, shY + 40 + i * 40, 4, 4), o.button || dk(o.shirt, 0.6), 2, 1, 1, 0));
  if (o.bib) { const bw = 68, bh = 52, bx = cx - bw / 2 + 4, byy = shY + torsoH * 0.34; decal(cx + 4, byy, () => { const bp = new Path2D(); bp.roundRect(bx, byy, bw, bh, 4); cel(g, bp, '#fffdf6', 2.6, 6, 4, 0);
    g.fillStyle = INK; g.font = `bold ${bh * 0.72}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.bib, bx + bw / 2, byy + bh / 2 + 2);
    for (const [px, py] of [[bx + 5, byy + 5], [bx + bw - 5, byy + 5], [bx + 5, byy + bh - 5], [bx + bw - 5, byy + bh - 5]]) { g.beginPath(); g.arc(px, py, 2.2, 0, TAU); g.fillStyle = '#9aa0b4'; g.fill(); } }); }
  if (kidT) for (const s of [-1, 1]) { if (tV(cx + s * WW * 0.5, hemY - 10) < -4) continue; const st = polyPath(TP([[cx + s * TW * 0.46, shY + 2], [cx + s * TW * 0.62, shY + 6], [cx + s * WW * 0.6, hemY], [cx + s * WW * 0.42, hemY]])); g.save(); g.clip(torsoP); cel(g, st, '#5a3a28', 1.6, 3, 0, 0); g.restore(); cel(g, ellP(tX(cx + s * WW * 0.51, hemY - 10), hemY - 10, 3.6, 3.6), '#d9b04a', 1.4, 1, 1, 0); }
  if (lady) { const wb = new Path2D(); wb.rect(cx - WW * 1.05, waistY + 4, WW * 2.1, 12); g.save(); g.clip(torsoP); cel(g, wb, mixc(pantsCol, INK, 0.25), 0, 6, 0, 0); g.restore(); line(g, [[cx - WW * wk, waistY + 16], [cx + WW * wk, waistY + 16]], 1.6); }
  if (o.pocket) decal(cx + TW * 0.3 + 17, shY + 72, () => { const pp = new Path2D(); pp.roundRect(cx + TW * 0.3, shY + 58, 34, 28, 4); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(pp); g.fillStyle = o.pocket; g.fillRect(cx + TW * 0.3 + 6, shY + 50, 9, 11); });
  // neck (sits in shadow under the chin) + collars + neckwear
  const np = polyPath([[ncx - NW, hy + HH * 0.6], [ncx + NW, hy + HH * 0.6], [ncx + NW + 1, shY + 8], [ncx, shY + (runner || kidT || lady ? 14 : 4)], [ncx - NW - 1, shY + 8]]);
  { g.lineWidth = 5; g.strokeStyle = INK; g.stroke(np); cel(g, np, skin, 0, 0, 0, 0); g.save(); g.clip(np); g.globalCompositeOperation = 'multiply'; g.fillStyle = SHS_; g.fill(np); g.globalCompositeOperation = 'source-over'; g.restore();
    if (o.trim) { const nb = new Path2D(); neck.forEach(([x, y], i) => nb[i ? 'lineTo' : 'moveTo'](x, y)); g.lineWidth = 3.2; g.strokeStyle = INK; g.stroke(nb); } }
  if (jacket || lady) for (const s of [-1, 1]) { if (tV(cx + s * (NW + 8), shY) < -8) continue; cel(g, polyPath(TP([[cx + s * 2, shY + 12], [cx + s * (NW + 8), shY - 6], [cx + s * (NW + 12), shY + 10], [cx + s * 12, shY + 26]])), o.collar || '#ffffff', 2.4, s * SG > 0 ? 4 : 0, 2, 0); }
  if (lady && o.neck !== 'bow') decal(cx, shY + 14, () => { cel(g, ellP(cx, shY + 14, 5.5, 6.5), '#e8b830', 1.8, 2, 2, 0); g.beginPath(); g.arc(cx, shY + 14, 2.4, 0, TAU); g.fillStyle = '#8c2a5a'; g.fill(); });
  // ambient occlusion under the chin (soft, purple)
  { const ay = shY + 4, ax = ncx + SN * 6; g.save(); g.clip(polyPath([...R, ...hem, ...Lf], polyPath([[ncx - NW - 2, hy + HH * 0.5], [ncx + NW + 2, hy + HH * 0.5], [ncx + NW + 2, shY + 30], [ncx - NW - 2, shY + 30]])));
    g.translate(ax, ay); g.scale(1, 0.42); const gr = g.createRadialGradient(0, 0, 0, 0, 0, NW * 2.8); gr.addColorStop(0, 'rgba(105,75,160,0.5)'); gr.addColorStop(0.55, 'rgba(120,90,170,0.22)'); gr.addColorStop(1, 'rgba(120,90,170,0)');
    g.globalCompositeOperation = 'multiply'; g.fillStyle = gr; g.fillRect(-NW * 3, -NW * 3, NW * 6, NW * 6); g.restore(); }
  const swing = Math.sin(TT * 0.45) * 0.18 * MV + flap * 0.07 * CS - trail * 0.18;
  const ncol = o.neckCol || '#c0453a';
  { const tx0 = tX(cx, shY + 40); g.save(); g.translate(tx0, shY + 14); g.rotate(swing); g.translate(-tx0, -(shY + 14)); const ks = turned ? 0.55 + 0.45 * CS : 1, T = (pts) => pts.map(([x, y]) => [tx0 + (x - cx) * ks, y]);
    if (o.neck === 'tie') { cel(g, polyPath(T([[cx - 7, shY + 14], [cx + 7, shY + 14], [cx + 13, shY + 104], [cx, shY + 120], [cx - 13, shY + 104]])), ncol, 2.6, 4, 3, 0); cel(g, polyPath(T([[cx - 9, shY + 4], [cx + 9, shY + 4], [cx + 7, shY + 18], [cx - 7, shY + 18]])), dk(ncol, 0.9), 2.4, 2, 2, 0); taper(g, T([[cx + 2, shY + 22], [cx + 4, shY + 100]]), 1.4, mixc(ncol, INK, 0.4), 0.1); }
    if (o.neck === 'bow') { const bp = new Path2D(); for (const s of [-1, 1]) polyPath(T([[cx, shY + 10], [cx + s * 26, shY - 2], [cx + s * 28, shY + 24]]), bp); cel(g, bp, ncol, 2.6, 4, 3, 0); cel(g, ellP(tx0, shY + 11, 7 * ks, 8), dk(ncol, 0.85), 2.2, 2, 2, 0); }
    g.restore(); }
  if (o.neck === 'scarf') { const sc = o.neckCol || '#d9a441', fl = Math.sin(TT * 0.8) * 5 * MV + trail * 14 + flap * 4, tx = turned ? tX(cx + 33, shY + 30) : cx + 33;
    const tail = polyPath([[tx - 11, shY + 12], [tx + 11, shY + 12], [tx + 17 + fl, shY + 96], [tx - 7 + fl, shY + 94]]); cel(g, tail, sc, 3, 5, 3, 0);
    for (let k = 0; k < 4; k++) line(g, [[tx - 5 + k * 6 + fl, shY + 95], [tx - 5 + k * 6 + fl * 1.3, shY + 106]], 2.6, dk(sc, 0.8));
    const X = (x) => nkx + (x - cx) * wk;
    cel(g, smooth([[X(cx - TW * 0.72), shY + 4], [X(cx - NW), shY - 14], [X(cx + NW), shY - 14], [X(cx + TW * 0.72), shY + 4], [X(cx + TW * 0.5), shY + 24], [X(cx), shY + 30], [X(cx - TW * 0.5), shY + 24]], 6), sc, 3.2, 8, 5, 3);
    taper(g, [[X(cx - TW * 0.4), shY + 8], [X(cx), shY + 16], [X(cx + TW * 0.4), shY + 8]], 1.8, dk(sc, 0.7), 0.1); }
  // ---------- near arms ----------
  const raisedLate = (a) => AS > 0.8 && !op.drive && a[1][2][1] < shY - 10; // profile: raised hands pass in front of the face
  const near = arms.filter((a) => !farArm(a) && !raisedLate(a));
  if (op.hip) for (const a of near) if (a[0] === -PA) drawArm(a);
  for (const a of near) if (!op.drive && !(op.hip && a[0] === -PA)) drawArm(a);
  if (op.drive) {
    line(g, [[WC[0] + 5, WC[1] + 22], [WC[0] + 24, WC[1] + 160]], 18, INK); line(g, [[WC[0] + 5, WC[1] + 22], [WC[0] + 24, WC[1] + 160]], 11, '#2a2630');
    const rim = new Path2D(); rim.ellipse(WC[0], WC[1], WR * Math.max(0.3, CS), WR * 0.4, SA * 0.4, 0, TAU);
    g.lineWidth = 20; g.strokeStyle = INK; g.stroke(rim); g.lineWidth = 13; g.strokeStyle = '#a87a42'; g.stroke(rim);
    g.save(); g.translate(-1.5, -2); g.lineWidth = 5; g.strokeStyle = '#d8aa6a'; g.stroke(rim); g.restore();
    for (let k = 0; k < 3; k++) { const an = SA + k * TAU / 3 + 0.5; line(g, [[WC[0], WC[1]], [WC[0] + Math.cos(an) * (WR - 8) * Math.max(0.3, CS), WC[1] + Math.sin(an) * (WR - 8) * 0.4]], 6, '#2a2630'); }
    cel(g, ellP(WC[0], WC[1], 13, 9), '#e0b450', 2.6, 3, 2, 0);
    for (const a of arms) drawArm(a, true);
  }
  const PS = 0.74 * B.hs, pa = arms.find((a) => a[0] === PA);
  if (HOLD[op.prop]) { const h = pa[1][2]; g.save(); g.translate(h[0] + 6, h[1] - 4); g.scale(PS, PS); HOLD[op.prop](g); g.restore(); hand([h[0] + 3, h[1] + 4], -Math.PI / 2, PA, true); }
  if (op.prop === 'stick') { const h = pa[1][2], sd = PA; line(g, [[h[0] - 6 * sd, h[1] + 20], [h[0] + 52 * sd, h[1] - 96]], 12, INK); line(g, [[h[0] - 6 * sd, h[1] + 20], [h[0] + 52 * sd, h[1] - 96]], 6.5, '#8a5a34'); taper(g, [[h[0] + 10 * sd, h[1] - 10], [h[0] + 40 * sd, h[1] - 72]], 2, '#b07a4a', 0.3); hand([h[0] + 3, h[1] + 6], -Math.PI / 2, PA, true); }
  // ---------- head ----------
  const tilt = ((op.tilt ?? ((o.seed || 0) % 3 - 1) * 3) + (gaitOn ? (RUN ? 2.5 : 1.4) * Math.sin(TAU * 2 * (ph - 0.1)) * (turned ? dv : 1) : 0)) * Math.PI / 180;
  g.translate(cx, shY); g.rotate(tilt); g.translate(-cx, -shY);
  const earAt = (s) => { const [X] = hmapPt([hcx + s * HW * 0.95, hy + HH * 0.1]); return { X: X - (AH > 0.8 ? dv * 11 * fz : 0), vis: !HY ? 1 : Math.cos(Math.asin(s) + HY) }; };
  const drawEar = (s, front) => { const { X } = earAt(s), ey0 = hy + HH * 0.1, rx = 12 * fz * (front ? 1 : 0.95), ry = 18 * fz, fl = front ? s : -dv; // fl: which way the cup opens (toward the face)
    cel(g, ellP(X, ey0, rx, ry, front ? s * 0.15 : -dv * 0.12), skin, 3, 3, 3, 0, null, SHADE_SKIN);
    g.save(); g.clip(ellP(X, ey0, rx, ry, 0)); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(214,150,170,0.55)'; g.beginPath(); g.ellipse(X - fl * 2 * fz, ey0 + 2 * fz, rx * 0.55, ry * 0.62, 0, 0, TAU); g.fill(); g.restore(); g.globalCompositeOperation = 'source-over';
    taper(g, arcPts(X + fl * 1, ey0 + 1, 6 * fz, fl > 0 ? -1.6 : 4.7, fl > 0 ? 1.4 : 1.7, 6, 10 * fz), 1.8, mixc(skin, INK, 0.45), 0.2);
    taper(g, [[X - fl * 2 * fz, ey0 + 5 * fz], [X - fl * 4 * fz, ey0 + 10 * fz]], 1.4, mixc(skin, INK, 0.5), 0.2);
    if (o.earring) { g.beginPath(); g.arc(X, ey0 + 19 * fz, 5, 0, TAU); g.fillStyle = o.earring; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); } };
  const earsHidden = o.hair === 'long' || (o.hair === 'curly' && AH > 0.3);
  if (!turned) for (const s of [-1, 1]) drawEar(s, true);
  cel(g, headSil, skin, 3.8, HW * 0.16, HH * 0.1, 5, null, SHADE_SKIN);
  // jaw/cheek accent: tiny crisp ink tick on the shadow side (front-ish views)
  if (AH < 0.8) taper(g, [[hcx + SG * HW * 0.62, hy + HH * 0.7], [hcx + SG * HW * 0.4, hy + HH * 0.86]], 1.6, mixc(skin, INK, 0.5), 0.1);
  // ---------- hair ----------
  const HS = HP.map(([x, y]) => [hcx + (x - hcx) * 1.06, hy + HH * 0.05 + (y - hy - HH * 0.05) * 1.09]);
  const capPts = (cut) => { const yc = hy + cut * HH, idx = HS.map((p, i) => [p, i]).filter(([p]) => p[1] <= yc); const right = idx.filter(([, i]) => i < HS.length / 2).map(([p]) => p), left = idx.filter(([, i]) => i >= HS.length / 2).map(([p]) => p); return [...left, ...right]; };
  const rel = (pts) => pts.map(([x, y]) => [hcx + x * HW, hy + y * HH]);
  const bnc = gaitOn ? 0.012 * flap : 0;
  // back of the skull (turned views): hair from the back silhouette to the terminator, down to the nape
  const backCap = (P, yn0 = o.hat === 'cap' ? 0.04 : 0.14, map = (q) => q) => { if (!HY) return P; const b = -Math.sign(HY), yn = -0.25 + (yn0 + 0.25) * AH, out = [], inn = [];
    const ty = (yf) => hy + HH * 0.05 + (yf * HH - HH * 0.05) * 1.06, ch = Math.cos(HY) - 0.22 * AH * AH, fi = (yf) => { const lo = sstep(-0.3, yn, yf); return Math.max(ch, -0.12) * (1 - lo) + Math.max(ch + 0.3 * AH, Math.min(ch, 0.3)) * lo; };
    for (let k = 0; k <= 14; k++) { const yf = -1.0 + (yn - 0.08 + 1.0) * k / 14; out.push([hcx + b * 1.07 * Math.max(0.12, rH(yf)) * HW, ty(yf)]); }
    const rn = Math.max(0.3, rH(yn)) * HW; { const fe = fi(yn - 0.26); for (const t of [0.2, 0.45, 0.7, 0.9]) out.push([hcx + b * rn * (1 - (1 - fe) * t) * (1 - 0.25 * Math.sin(Math.PI * t) * AH), ty(yn - 0.26 * t * t + 0.03 * Math.sin(Math.PI * t))]); }
    for (let k = 8; k >= 0; k--) { const yf = -0.85 + (yn - 0.26 + 0.85) * k / 8; inn.push([hcx + b * Math.max(0.12, rH(yf)) * HW * fi(yf), hy + yf * HH]); }
    inn.push([hcx, hy - HH * 1.0]);
    return polyPath(map([...out, ...inn]), P); };
  const hairPaint = (P, strands) => { cel(g, P, hc, 3.6, HW * 0.16, HH * 0.08, 7);
    g.save(); g.clip(P);
    // under-layer shade along the hairline + anisotropic sheen band + strand clumps
    g.globalCompositeOperation = 'multiply'; g.fillStyle = rgba(mixc(hc, '#6a4aa0', 0.5), 0.35); g.beginPath(); g.ellipse(hcx + SN * HW * 0.4, hy - HH * 0.18, HW * 0.95, HH * 0.32, 0, 0, TAU); g.fill(); g.globalCompositeOperation = 'source-over';
    for (const s of strands) taper(g, HMP(rel(s)), 2, mixc(hc, INK, 0.4), 0.1);
    if (HY) { const b = -Math.sign(HY); for (const k of [0.25, 0.5, 0.75]) taper(g, [[hcx + b * HW * k * 0.9, hy - HH * 0.8], [hcx + b * HW * (k * 0.9 + 0.08), hy - HH * 0.3], [hcx + b * HW * (k * 0.8 + 0.1), hy + HH * 0.05]], 1.8, mixc(hc, INK, 0.4), 0.1); }
    const sh = HMP(rel([[-0.66 * SG, -0.6], [-0.36 * SG, -0.84], [0.0, -0.92], [0.22 * SG, -0.9]]));
    taper(g, sh, 5.5, lt(hc, 0.3), 0.15); taper(g, sh.map(([x, y]) => [x + 3 * SG, y + 9]), 2.4, lt(hc, 0.18), 0.1);
    g.restore(); };
  if (hairOn) {
    if (o.hair === 'short') { const fr = [[1.0, -0.22], [0.86, -0.46], [0.72, -0.36], [0.6, -0.56], [0.42, -0.44], [0.3, -0.64], [0.1, -0.5], [-0.04, -0.66], [-0.24, -0.52], [-0.38, -0.66], [-0.58, -0.5], [-0.74, -0.58], [-0.88, -0.4], [-1.0, -0.22]].map(([x, y], k) => [x + sway(k) / HW, y + bnc]);
      hairPaint(backCap(polyPath(HMP([...capPts(-0.22), ...cr(rel(fr), false, 3)]))), [[[0.5, -0.9], [0.5, -0.62]], [[-0.1, -0.95], [-0.2, -0.66]], [[-0.6, -0.84], [-0.7, -0.6]], [[0.2, -0.98], [0.15, -0.72]]]); }
    if (o.hair === 'side') { const fr = [[1.02, -0.04], [0.9, -0.14], [0.8, -0.04], [0.72, -0.3], [0.5, -0.38], [0.36, -0.3], [0.2, -0.46], [-0.06, -0.58], [-0.26, -0.72], [-0.4, -0.8], [-0.54, -0.62], [-0.74, -0.56], [-0.9, -0.36], [-1.02, -0.14]].map(([x, y], k) => [x + sway(k) / HW, y + bnc]);
      hairPaint(backCap(polyPath(HMP([...capPts(-0.06), ...cr(rel(fr), false, 4)]))), [[[-0.4, -0.98], [0.2, -0.75], [0.7, -0.4]], [[-0.1, -1.0], [0.4, -0.8], [0.85, -0.3]], [[-0.55, -0.92], [-0.75, -0.65]], [[0.2, -1.0], [0.6, -0.78], [0.95, -0.36]]]); }
    if (o.hair === 'spiky') { const pts = [], n = 9; const base = (a, k) => [hcx + Math.cos(a) * HW * k, hy - HH * 0.05 + Math.sin(a) * HH * k * 1.02];
      pts.push(base(Math.PI * 1.02, 1.06)); for (let i = 0; i < n; i++) { const a0 = Math.PI * (1.02 + 0.96 * i / n), a1 = Math.PI * (1.02 + 0.96 * (i + 0.5) / n); pts.push(base(a0, 1.04)); const u1 = Math.cos(a1), hid = (HY && Math.abs(Math.asin(clamp(u1, -1, 1)) + HY) > HP_ + 0.1) || (o.hat && Math.abs(u1) < 0.55), t = base(a1, hid ? 1.05 : 1.3 + 0.06 * Math.sin(i * 2.1)); pts.push([t[0] + sway(i) + (i - n / 2) * 2 - trail * 6, t[1]]); }
      pts.push(base(Math.PI * 1.98, 1.04), base(Math.PI * 0.02, 1.06));
      const fr = [[1.0, -0.2], [0.8, -0.5], [0.66, -0.34], [0.46, -0.58], [0.3, -0.38], [0.1, -0.6], [-0.08, -0.4], [-0.28, -0.6], [-0.46, -0.4], [-0.64, -0.56], [-0.8, -0.38], [-1.0, -0.2]];
      const SP = backCap(polyPath(HMP([...pts, ...rel(fr)])));
      if (HY) { const b = -Math.sign(HY), E = (an, k) => [hcx + Math.cos(an) * HW * k, hy - HH * 0.05 + Math.sin(an) * HH * k * 1.02]; // spikes along the back/top silhouette (screen space)
        for (let k = 0; k < 6; k++) { const an = -HP_ + b * (0.15 + k * 0.32 * (0.5 + 0.5 * AH)); if (o.hat && k < 3) continue; const t = E(an, 1.32 + 0.05 * Math.sin(k * 2.3)); polyPath([E(an - 0.17, 0.98), [t[0] + sway(k) - trail * 6, t[1]], E(an + 0.17, 0.98), E(an, 0.82)], SP); } }
      hairPaint(SP, [[[0.3, -1.0], [0.4, -0.7]], [[-0.3, -1.0], [-0.36, -0.72]]]); }
    if (o.hair === 'curly') { const P = backCap(polyPath(HMP([...capPts(-0.3), ...cr(rel([[1.0, -0.3], [0.5, -0.56], [0, -0.62], [-0.5, -0.56], [-1.0, -0.3]]), false, 4)])), 0.15);
      const curl = (x, y, rr) => { if (HY) { const r0 = Math.max(0.14, rH(clamp((y - hy) / HH, -1, 1))) * HW, t = Math.asin(clamp((x - hcx) / r0, -1, 1)) + HY; if (Math.abs(t) > HP_ + 0.12) return; } const [X] = hmapPt([x, y]); P.moveTo(X + rr, y); P.arc(X, y, rr, 0, TAU); };
      for (let i = 0; i <= 11; i++) { const a = Math.PI * (0.92 + 1.16 * i / 11); curl(hcx + Math.cos(a) * HW * 1.04, hy - HH * 0.02 + Math.sin(a) * HH * 1.06, HW * 0.21); }
      if (HY) { const b = -Math.sign(HY), cS = (X, y, rr) => { P.moveTo(X + rr, y); P.arc(X, y, rr, 0, TAU); }; // back of the head: curls in screen space (already turned)
        for (let i = 0; i < 6; i++) { const yf = -0.85 + i * 0.22; cS(hcx + b * Math.max(0.3, rH(yf)) * HW * 0.98, hy + yf * HH, HW * 0.2); }
        if (AH > 0.8) for (let i = 0; i < 4; i++) { const k = 0.2 + i * 0.22; cS(hcx + b * HW * k, hy + HH * (0.12 - 0.05 * i), HW * 0.17); } }
      for (let i = 0; i < 6; i++) { const x = hcx - HW * 0.72 + i * HW * 0.29; curl(x, hy - HH * 0.5 + Math.abs(i - 2.5) * -3, HW * 0.16); }
      hairPaint(P, []); g.save(); g.clip(P); for (let i = 0; i < 7; i++) { const x = hcx - HW * 0.7 + i * HW * 0.23, [X] = hmapPt([x, hy - HH * 0.76]); taper(g, arcPts(X, hy - HH * 0.76, HW * 0.08, 0.3, 2.6, 6), 1.8, mixc(hc, INK, 0.4), 0.2); } g.restore(); }
    if (o.hair === 'bun' || o.hair === 'long') { const fr = [[1.02, -0.12], [0.82, -0.42], [0.52, -0.62], [0.2, -0.74], [0.03, -0.8], [0, -0.7], [-0.03, -0.8], [-0.2, -0.74], [-0.52, -0.62], [-0.82, -0.42], [-1.02, -0.12]].map(([x, y]) => [x, y + bnc]);
      hairPaint(backCap(polyPath(HMP([...capPts(-0.12), ...cr(rel(fr), false, 4)])), o.hair === 'long' ? 0.6 : 0.3), [[[0.0, -1.0], [0.5, -0.8], [0.85, -0.4]], [[0.0, -1.0], [-0.5, -0.8], [-0.85, -0.4]]]);
      if (o.hair === 'long') for (const s of [-1, 1]) { const sw = sway(s + 2) + trail * 5, [ex] = hmapPt([hcx + s * HW * 0.98, hy]); if (HY && (earAt(s).vis < -0.2 || AH > 0.8)) continue;
        const X = (x) => ex + (x - (hcx + s * HW * 0.98)) * (HY ? 0.8 : 1);
        cel(g, smooth([[X(hcx + s * HW * 0.98), hy - HH * 0.3], [X(hcx + s * HW * 1.1), hy + HH * 0.4], [X(hcx + s * HW * 1.06) + sw, hy + HH * 1.25], [X(hcx + s * HW * 0.9) + sw, hy + HH * 1.36], [X(hcx + s * HW * 0.88), hy + HH * 0.5], [X(hcx + s * HW * 0.84), hy - HH * 0.1]], 6), hc, 3.2, 6, 4, 3); } }
  }
  if (o.hair === 'bald') { const P = new Path2D(); for (const s of [-1, 1]) for (const [dx, dy, rr] of [[0.97, -0.12, 0.12], [1.0, 0.04, 0.1], [0.9, -0.26, 0.1], [0.84, -0.4, 0.08]]) { if (HY && (Math.abs(Math.asin(s * 0.97) + HY) > HP_ + 0.1 || AH > 0.8)) continue; const [x0] = hmapPt([hcx + s * HW * dx, hy + HH * dy]), x = x0 - Math.sign(HY) * AH * HW * 0.24, y = hy + HH * dy; P.moveTo(x + HW * rr, y); P.arc(x, y, HW * rr, 0, TAU); }
    if (AH > 0.8) for (const [dy, rr] of [[-0.22, 0.11], [-0.04, 0.12]]) { const x = hcx - Math.sign(HY) * HW * 0.3, y = hy + HH * dy; P.moveTo(x + HW * rr, y); P.arc(x, y, HW * rr, 0, TAU); }
    if (HY) for (const [dy, rr] of [[-0.3, 0.13], [-0.1, 0.13], [0.1, 0.12], [0.25, 0.1]]) { const x = hcx - Math.sign(HY) * rH(dy) * HW * 0.9, y = hy + HH * dy; P.moveTo(x + HW * rr, y); P.arc(x, y, HW * rr, 0, TAU); }
    g.save(); g.clip(headP); cel(g, P, hc, 3, 4, 3, 0); g.restore();
    if (!o.hat) taper(g, arcPts(hcx - HW * 0.1 * SG, hy - HH * 0.2, HW * 0.62, Math.PI * 1.25, Math.PI * 1.45, 6, HH * 0.66), 4, lt(skin, 0.5), 0.2); }
  // near ear (turned views): on top of hair, behind the face features
  if (turned && !earsHidden) drawEar(-Math.sign(HY || dv), false);
  // hats
  // hats: crowns are solids of revolution (silhouette unchanged by yaw); brims are horizontal discs projected with the head yaw,
  // with per-angle curl/snap (so they turn), plus a band bow at the wearer's side and front creases that rotate with the head.
  const hx = hcx - SN * 4 * fz, hyc = Math.cos(HY), hys = Math.sin(HY);
  const ringPts = (R, y, pv, h, p0, p1, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const ps = p0 + (p1 - p0) * i / n; return [hx + R * Math.sin(ps), y + R * Math.cos(ps) * pv + h(ps - HY)]; });
  const hatSolid = (hk, bY, Rb, Rc, pv, h, crown, deco) => {
    cel(g, polyPath(ringPts(Rb, bY, pv, h, -Math.PI, Math.PI, 40)), dk(hk, 0.85), 3.2, 6, 3, 3); // whole brim (its back shows behind the crown)
    const cp = crown(); cel(g, cp, hk, 3.6, 12, 4, 4); if (deco) deco(cp);
    const fr = [...ringPts(Rb, bY, pv, h, -HP_, HP_), ...ringPts(Rc, bY, pv, () => 0, HP_, -HP_)]; cel(g, polyPath(fr), hk, 3.2, 6, 3, 3); // front half over the crown base
    taper(g, ringPts(Rb * 0.97, bY, pv, h, -HP_ * 0.8, HP_ * 0.8, 16).map(([x, y]) => [x, y - 2.5]), 1.6, rgba(lt(hk, 0.4), 0.45), 0.1); };
  const bandBow = (Rc, y, col) => { const d = Rc * Math.cos(-HP_ + HY); if (d < -Rc * 0.25) return; const X = hx + Rc * Math.sin(-HP_ + HY), k = clamp(0.35 + d / Rc, 0.35, 1);
    const bp = new Path2D(); polyPath([[X, y], [X - 9 * fz * k, y - 6 * fz], [X - 9 * fz * k, y + 7 * fz]], bp); polyPath([[X, y], [X + 9 * fz * k, y - 6 * fz], [X + 9 * fz * k, y + 7 * fz]], bp); cel(g, bp, col, 2, 2, 2, 0); cel(g, ellP(X, y, 3.2 * fz * k, 4 * fz), dk(col, 0.85), 1.6, 1, 1, 0); };
  if (o.hat === 'top') { const hk = o.hatCol || '#2a2630', bY = hy - HH * 0.74, cw = HW * 0.68, ch = 128 * fz;
    const crown = () => polyPath([[hx - cw, bY + 4], [hx - cw * 0.92, bY - ch], [hx + cw * 0.92, bY - ch], [hx + cw, bY + 4]]);
    hatSolid(hk, bY, HW * 1.12, cw, 22 * fz / (HW * 1.12), (ph2) => -16 * fz * Math.sin(ph2) ** 2, crown, (cp) => {
      const band = new Path2D(); band.rect(hx - cw, bY - 26 * fz, 2 * cw, 20 * fz); g.save(); g.clip(cp); cel(g, band, '#a8383a', 0, 6, 0, 0); g.restore();
      line(g, [[hx - cw * 0.99, bY - 26 * fz], [hx + cw * 0.99, bY - 26 * fz]], 1.8); line(g, [[hx - cw * 0.99, bY - 6 * fz], [hx + cw * 0.99, bY - 6 * fz]], 1.8);
      bandBow(cw * 0.96, bY - 16 * fz, '#8a2a2e');
      cel(g, polyPath(ringPts(cw * 0.92, bY - ch, 0.16, () => 0, -Math.PI, Math.PI, 24)), mixc(hk, '#ffffff', 0.08), 2.6, 0, 0, 0);
      taper(g, [[hx - SG * cw * 0.6, bY - ch + 10], [hx - SG * cw * 0.66, bY - 34 * fz]], 4, 'rgba(255,255,255,0.25)', 0.3); }); }
  if (o.hat === 'cap') { const hk = o.hatCol || '#5a4a3a', cut = -0.36;
    const cLean = ([x, y]) => [x + Math.sin(HY) * HW * 0.32 * sstep(hy + cut * HH, hy - 1.1 * HH, y), y], CL = (pts) => pts.map(cLean);
    const dome = backCap(polyPath(CL(HMP([...capPts(cut).map(([x, y]) => [hcx + (x - hcx) * 1.03, y - HH * 0.04]), ...cr(rel([[1.06, cut], [0.5, cut + 0.06], [0, cut + 0.08], [-0.5, cut + 0.06], [-1.06, cut]]), false, 4)]))), -0.3, CL);
    cel(g, dome, hk, 3.6, HW * 0.14, HH * 0.08, 4, o.pattern === 'tweed' ? fabric() : null);
    const fc = mixc(hk, INK, 0.45); g.save(); g.clip(dome);
    for (const [a, b] of [[[0, -1.1], [-0.1, cut + 0.06]], [[0.1, -1.1], [0.6, cut + 0.02]], [[-0.1, -1.1], [-0.68, cut + 0.02]], [[0.2, -1.08], [1.0, cut - 0.02]], [[-0.2, -1.08], [-1.0, cut - 0.02]]]) taper(g, CL(HMP(cr(rel([a, lerp(a, b, 0.5).map((v, i) => v + (i ? -0.04 : 0)), b]), false, 4))), 2, fc, 0.1);
    taper(g, CL(HMP(rel([[-0.6 * SG, -0.86], [-0.2 * SG, -1.0], [0.15 * SG, -0.98]]))), 4, rgba(lt(hk, 0.4), 0.55), 0.2); g.restore();
    { const [bx] = cLean([hcx + Math.sin(HY) * HW * 0.12, hy - HH * 1.12]); cel(g, ellP(bx, hy - HH * 1.12, 7 * fz, 5 * fz), hk, 2.4, 2, 2, 0); }
    // visor: a half-disc in the horizontal plane at the brow, projected with the head yaw (+ a slight look-down)
    { const vy = hy + HH * (cut + 0.03), Rr = HW * 0.88, pv = 0.1 * Math.cos(HY) + 0.1, VY = clamp(HY * 1.4, -HP_, HP_), hs2 = Math.sin(VY), hc2 = Math.cos(VY), Pv = (lat, fw) => [hx + lat * hc2 + fw * hs2, vy + (-lat * hs2 + fw * hc2) * pv];
      const vp = []; for (let k = 0; k <= 12; k++) { const a = Math.PI * k / 12; vp.push(Pv(Rr * Math.cos(a), Rr * (0.62 + 0.45 * AH) * Math.sin(a) + HW * (0.42 + 0.06 * AH) * Math.sin(a))); }
      for (let k = 12; k >= 0; k--) { const a = Math.PI * k / 12; vp.push(Pv(Rr * Math.cos(a), Rr * (0.62 + 0.45 * AH) * Math.sin(a))); }
      cel(g, polyPath(vp), dk(hk, 0.82), 3.2, 6, 4, 3); taper(g, vp.slice(2, 11), 2, rgba(lt(hk, 0.35), 0.5), 0.1); }
    if (o.neck === 'scarf') { const gy = hy + HH * (cut - 0.12); const G = (x) => hmapPt([hcx + x * HW, gy])[0]; line(g, [[G(-0.98), gy + 4], [G(0.98), gy + 4]], 7, INK); line(g, [[G(-0.96), gy + 4], [G(0.96), gy + 4]], 4, '#6a4428');
      for (const s of [-1, 1]) { if (HY && Math.cos(Math.asin(s * 0.3) + HY) < 0.25) continue; const gx = G(s * 0.3), k2 = HY ? Math.max(0.5, Math.cos(Math.asin(s * 0.3) + HY)) : 1; cel(g, ellP(gx, gy, 17 * fz * k2, 13 * fz), '#b08a4a', 3, 3, 2, 0); cel(g, ellP(gx, gy, 11 * fz * k2, 8 * fz), '#9cc8e0', 1.6, 4, 3, 0); g.beginPath(); g.arc(gx - 4 * fz * k2, gy - 3 * fz, 2.6 * fz, 0, TAU); g.fillStyle = '#fff'; g.fill(); } } }
  if (o.hat === 'bowler') { const hk = o.hatCol || '#2a2630', bY = hy - HH * 0.66;
    const crown = () => { const dm = new Path2D(); dm.moveTo(hx - HW * 0.8, bY); dm.bezierCurveTo(hx - HW * 0.86, bY - 118 * fz, hx + HW * 0.86, bY - 118 * fz, hx + HW * 0.8, bY); dm.closePath(); return dm; };
    hatSolid(hk, bY, HW * 1.06, HW * 0.8, 20 * fz / (HW * 1.06), (ph2) => -11 * fz * Math.sin(ph2) ** 2, crown, (dm) => {
      const band = new Path2D(); band.rect(hx - HW, bY - 16 * fz, HW * 2, 14 * fz); g.save(); g.clip(dm); g.fillStyle = mixc(hk, '#7a5a8a', 0.3); g.fill(band); g.restore();
      bandBow(HW * 0.8, bY - 9 * fz, mixc(hk, '#9a7aa8', 0.45));
      taper(g, arcPts(hx - HW * 0.1 * SG, bY - 20 * fz, HW * 0.55, SG > 0 ? Math.PI * 1.15 : Math.PI * 1.6, SG > 0 ? Math.PI * 1.4 : Math.PI * 1.85, 5, 50 * fz), 4, 'rgba(255,255,255,0.28)', 0.3); }); }
  if (o.hat === 'fedora') { const hk = o.hatCol || '#4a4038', bY = hy - HH * 0.62;
    const crown = () => { // top: front-view M pinch blends into a profile slope (high at the back, pinched low at the front)
      const top = []; for (let i = 0; i <= 16; i++) { const u = -1 + i / 8, uf = u * (Math.sign(HY) || 1), hf = 96 + 18 * Math.sin(Math.PI * Math.min(1, Math.abs(u) / 0.9)) - 4 * (1 - Math.abs(u)), hs = 106 - 9 * uf - 8 * Math.exp(-(((uf - 0.55) / 0.28) ** 2)); top.push([hx + u * HW * 0.66, bY - (hf + (hs - hf) * AH) * fz]); }
      return polyPath([[hx - HW * 0.74, bY], ...cr(top, false, 3), [hx + HW * 0.74, bY]]); };
    hatSolid(hk, bY, HW * 1.22, HW * 0.74, 17 * fz / (HW * 1.22), (ph2) => 15 * fz * Math.max(0, Math.cos(ph2)) ** 2 - 11 * fz * Math.max(0, -Math.cos(ph2)) ** 2 - 4 * fz * Math.sin(ph2) ** 2, crown, (dm) => {
      const band = new Path2D(); band.rect(hx - HW, bY - 22 * fz, HW * 2, 18 * fz); g.save(); g.clip(dm); g.fillStyle = o.bandCol || mixc(hk, '#000000', 0.5); g.fill(band);
      // front pinch + centre crease: they sit on the front of the crown, so they slide with the yaw
      if (hyc > 0.05) for (const s of [-1, 1]) { const a = HY + s * 0.32, X = hx + HW * 0.62 * Math.sin(a); if (Math.cos(a) > 0) taper(g, [[X, bY - 92 * fz], [X + s * 3 * fz * hyc, bY - 60 * fz]], 2.4, mixc(hk, '#000000', 0.45), 0.3); }
      taper(g, [[hx + HW * 0.5 * hys, bY - 104 * fz], [hx + HW * 0.12 * hys, bY - 96 * fz], [hx - HW * 0.45 * hys, bY - 100 * fz]], 2.6, mixc(hk, '#000000', 0.45), 0.4);
      g.restore(); bandBow(HW * 0.73, bY - 13 * fz, mixc(hk, '#c8b090', 0.35)); }); }
  if (o.hat === 'surgcap') { const hk = o.hatCol || '#8ac0b0', bY = hy - HH * 0.6;
    const dm = new Path2D(); dm.moveTo(hx - HW * 0.92, bY); dm.bezierCurveTo(hx - HW * 1.0, bY - 120 * fz, hx + HW * 1.0, bY - 120 * fz, hx + HW * 0.92, bY); dm.quadraticCurveTo(hx, bY + 14 * fz, hx - HW * 0.92, bY); dm.closePath(); cel(g, dm, hk, 3.0, 10, 5, 3);
    g.save(); g.clip(dm); const fc = mixc(hk, INK, 0.35);
    for (const a0 of [-0.9, -0.3, 0.3, 0.9]) { const a = a0 + HY; if (Math.cos(a) < 0.05) continue; const X = hx + HW * 0.9 * Math.sin(a); taper(g, [[hx + (X - hx) * 0.3, bY - 104 * fz], [X, bY - 50 * fz], [X, bY + 4]], 1.6, fc, 0.1); }
    g.restore();
    // ties at the back: visible once the head turns
    { const a = Math.PI + HY, d = Math.cos(a); if (d > -0.6) { const X = hx + HW * 0.92 * Math.sin(a), y = bY + 2; if (Math.abs(Math.sin(a)) > 0.4) { const sd = Math.sign(Math.sin(a)); cel(g, polyPath([[X, y - 4], [X + sd * 18 * fz, y + 26 * fz], [X + sd * 6 * fz, y + 30 * fz]]), hk, 2, 2, 2, 0); cel(g, polyPath([[X, y - 4], [X + sd * 26 * fz, y + 14 * fz], [X + sd * 20 * fz, y + 22 * fz]]), dk(hk, 0.9), 2, 2, 2, 0); } } } }
  // ---------- face (local frame: head centre, unit = fz px) ----------
  const E = expr, red = '#e0303a', w = HW / fz;
  const exciteE = E === 'excited', angryE = E === 'angry', meanE = E === 'mean' || E === 'smug', sadE = E === 'sad', shockE = E === 'shock' || E === 'surprised';
  const smileK = SMILEY[E] || 0;
  // face map: x (local units) on the face → screen x after the head turn; k spreads features toward the sides in profile
  const kF = 1 + 0.9 * clamp((Math.abs(HY) - 0.5) / (HP_ - 0.5), 0, 1);
  const fm = (xl, yl, k = 1) => { const r = Math.max(0.25, rH(yl / 100)) * w, u = clamp(xl / r * k, -0.999, 0.999), th = Math.asin(u), t = th + HY, c = Math.cos(t), th0 = Math.asin(clamp(xl / r, -0.999, 0.999));
    return { x: r * Math.sin(clamp(t, -HP_, HP_)), c, sx: clamp(Math.max(0.4, c) / Math.max(0.4, Math.cos(th0)), 0.5, 1.0) }; };
  g.save(); g.clip(headSil);
  if (sadE || E === 'shock') { g.strokeStyle = 'rgba(70,90,200,0.55)'; g.lineWidth = 3; for (let k = -1; k <= 1; k++) { const [X] = hmapPt([hcx + k * 22 * fz, hy - HH * 0.5]); g.beginPath(); g.moveTo(X, hy - HH * 0.62); g.lineTo(X, hy - HH * 0.36); g.stroke(); } }
  g.translate(hcx, hy); g.scale(fz, fz);
  const ey = 10;
  // eye darts: small quick saccades, held for a few frames
  const dk_ = Math.floor((TT + (o.seed || 0) * 13) / 23), dOn = hsh(dk_, 3) > 0.45 && blink === 0 && E !== 'dazed';
  const dartX = dOn ? (hsh(dk_, 5) - 0.5) * 3.6 : 0, dartY = dOn ? (hsh(dk_, 7) - 0.5) * 1.6 : 0;
  const look = op.look || 0;
  // blush (cheeks rise + grow when smiling)
  for (const s of [-1, 1]) { const m = fm(s * w * 0.6, 36, 1.35); if (m.c < 0.15) continue; const bx = m.x, by = 36 - smileK * 3;
    g.beginPath(); g.ellipse(bx, by, (exciteE ? 15 : 12.5 + smileK * 1.5) * m.sx, exciteE ? 8 : 6.6 + smileK, 0, 0, TAU); g.fillStyle = angryE ? 'rgba(230,60,70,0.5)' : 'rgba(240,100,130,0.42)'; g.fill();
    if (E === 'happy' || E === 'laugh' || E === 'grin') for (let k = -1; k <= 1; k++) line(g, [[bx + (k * 6 - 2) * m.sx, by + 3], [bx + (k * 6 + 2) * m.sx, by - 3]], 1.4, 'rgba(200,60,90,0.7)'); }
  // nose (front / three-quarter; in profile it is part of the silhouette)
  const nm = fm(2, 26);
  { const nx = nm.x, nd = Math.sign(HY);
    // soft shading on the shadow side of the nose + under it
    g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(205,140,170,0.45)'; g.beginPath(); g.ellipse(nx + (AH > 0.3 ? -nd * 5 : SG * 4), 31, nose === 'round' ? 12 : 7, 4.5, 0, 0, TAU); g.fill(); g.restore();
    if (AH > 0.8) { const tipx = dv * (rH(0.26) * w + (nose === 'round' ? 13 : nose === 'long' ? 20 : 9)); taper(g, [[tipx - dv * 7, 33], [tipx - dv * 12, 31], [tipx - dv * 14, 27]], 2, mixc(skin, INK, 0.45), 0.2); g.beginPath(); g.arc(tipx - dv * 6, 22, 2.4, 0, TAU); g.fillStyle = 'rgba(255,250,240,0.7)'; g.fill(); }
    else if (nose === 'long') taper(g, [[nx + 1, 12], [nx + 14 * (nd || 1), 30], [nx + 8 * (nd || 1), 36], [nx - 3 * (nd || 1), 33]], 3, INK, 0.3);
    else if (nose === 'round') { cel(g, ellP(nx + nd * 3, 28, 12 * (1 - 0.15 * AH), 10), skin, 2.6, 3, 3, 0, null, SHADE_SKIN); g.beginPath(); g.arc(nx - 3 + nd * 2, 24, 2.6, 0, TAU); g.fillStyle = 'rgba(255,250,240,0.75)'; g.fill(); }
    else if (AH > 0.3) { taper(g, [[nx - nd * 1, 18], [nx + nd * 6, 27], [nx + nd * 3, 31], [nx - nd * 3, 31]], 2.8, INK, 0.25); g.beginPath(); g.arc(nx + nd * 1, 22, 1.8, 0, TAU); g.fillStyle = 'rgba(255,250,240,0.7)'; g.fill(); }
    else { taper(g, arcPts(nx, 26, 5, 0.15, Math.PI - 0.15, 6, 3.8), 2.8, INK, 0.3); g.beginPath(); g.arc(nx - 2 * SG, 22.5, 1.9, 0, TAU); g.fillStyle = 'rgba(255,250,240,0.7)'; g.fill(); } }
  // eyes + lids + brows
  for (const s of [-1, 1]) {
    const ex = s * w * 0.38, m = fm(ex, ey, kF); if (m.c < 0.18) continue;
    g.save(); g.translate(m.x, 0); g.scale(m.sx, 1); g.translate(-ex, 0);
    const lx = ex + look * 3.6 + dartX, lyy = ey + dartY;
    const closed = (blink >= 1 && E !== 'dazed') || E === 'happy' || E === 'laugh';
    if (E === 'pained') { g.lineJoin = 'round'; taper(g, [[ex - s * 10, ey - 8], [ex + s * 7, ey], [ex - s * 10, ey + 8]], 4.2, INK, 0.35); }
    else if (E === 'dazed') { g.beginPath(); for (let a = 0; a < 15; a += 0.3) { const rr = a * 0.78; g.lineTo(ex + rr * Math.cos(a * s), ey + rr * Math.sin(a * s)); } g.lineWidth = 2.6; g.strokeStyle = INK; g.stroke(); }
    else if (closed) { taper(g, [[ex - 11, ey + 3], [ex, ey - 6], [ex + 11, ey + 3]], 4.6, INK, 0.35); if (lady) taper(g, [[ex + s * 10, ey + 1], [ex + s * 15, ey - 2]], 2, INK, 0.3); }
    else {
      const ry = exciteE ? 15 : shockE ? 13.5 : 12.5, rx = exciteE ? 10 : shockE ? 10 : 8.4, bl = blink > 0 ? 0.45 : 1;
      const eyeY = lyy + (blink > 0 ? 4 : 0), eyeP = ellP(lx, eyeY, rx, ry * bl, s * 0.05);
      g.fillStyle = INK; g.fill(eyeP);
      // ringed-planet shine (bean eyes); excited = star sparkles; shock = a second small shine
      g.save(); g.clip(eyeP);
      if (exciteE) { for (const [sx, sy, rr0] of [[-3, -5, 5.5], [3.5, 5, 2.6]]) { g.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? rr0 * 0.35 : rr0, an = k * Math.PI / 4; g.lineTo(lx + sx + rr * Math.cos(an), eyeY + sy + rr * Math.sin(an)); } g.closePath(); g.fillStyle = '#fff'; g.fill(); } }
      else if (blink === 0) { g.beginPath(); g.arc(lx - 2.6, eyeY - 4.6, shockE ? 3.2 : 2.8, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore(); g.save(); g.translate(lx - 2.6, eyeY - 4.6); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 5.8, 1.7, 0, 0, TAU); g.lineWidth = 1.1; g.strokeStyle = '#fff'; g.stroke(); g.restore(); g.save(); g.clip(eyeP); g.beginPath(); g.arc(lx + 3, eyeY + 5, shockE ? 1.8 : 1.2, 0, TAU); g.fillStyle = '#fff'; g.fill();
        g.fillStyle = 'rgba(120,100,200,0.45)'; g.beginPath(); g.ellipse(lx + 1, eyeY + ry * 0.7, rx * 0.8, ry * 0.35, 0, 0, TAU); g.fill(); }
      // smile squash: the cheek pushes the lower lid up
      if (smileK > 0 && blink === 0) { g.fillStyle = skin; g.beginPath(); g.ellipse(lx, eyeY + ry * (1.55 - 0.25 * smileK), rx * 1.8, ry * 0.75, 0, 0, TAU); g.fill(); }
      // upper lid for moods: skin above a slanted lid line, inside the eye
      const LD = LIDS[E] || (meanE ? LIDS.smug : null);
      if (LD && blink === 0) { const yi = eyeY - ry + 2 * ry * LD[0], yo = eyeY - ry + 2 * ry * LD[1]; g.fillStyle = mixc(skin, '#c99ab8', 0.18); g.beginPath(); g.moveTo(lx - s * (rx + 3), yi); g.quadraticCurveTo(lx, (yi + yo) / 2 - 2, lx + s * (rx + 3), yo); g.lineTo(lx + s * (rx + 3), eyeY - ry - 4); g.lineTo(lx - s * (rx + 3), eyeY - ry - 4); g.closePath(); g.fill(); }
      g.restore();
      if (LD && blink === 0) { const yi = eyeY - ry + 2 * ry * LD[0], yo = eyeY - ry + 2 * ry * LD[1]; taper(g, [[lx - s * (rx + 1.5), yi + 0.5], [lx, (yi + yo) / 2 - 1], [lx + s * (rx + 2.5), yo + 0.5]], 3.2, INK, 0.35); }
      if (smileK > 0 && blink === 0) taper(g, arcPts(lx, eyeY + ry * (1.55 - 0.25 * smileK), rx * 1.25, Math.PI * 1.3, Math.PI * 1.7, 6, ry * 0.7), 1.6, mixc(skin, INK, 0.45), 0.2);
      if (lady && blink === 0) { taper(g, [[lx + s * (rx - 1), eyeY - ry * 0.6], [lx + s * (rx + 5), eyeY - ry * 0.95]], 2.2, INK, 0.3); taper(g, [[lx + s * (rx - 3), eyeY - ry * 0.85], [lx + s * (rx + 2), eyeY - ry * 1.25]], 1.8, INK, 0.3); }
    }
    const bc = o.brow || (hairOn ? dk(hc, 0.8) : INK), by = ey - 25 - (exciteE || shockE ? 8 : 0) - (op.browPop ? 3 : 0);
    const bw = (o.build === 'stout' || o.moustache ? 7.6 : 6.6);
    let BR = BROWS[E] || BROWS.smile;
    if (meanE) BR = s < 0 ? [14, 7, -2, 1] : [1, -10, -3, 0.9];
    if (E === 'whistle' && s > 0) BR = [0, -9, -2, 0.85];
    if (E === 'bored' && s > 0) BR = [3, 2, 4, 0.9];
    taper(g, [[ex - s * 11, by + BR[0]], [ex + s * 1, by + BR[1]], [ex + s * 13, by + BR[2]]], bw * BR[3], bc, 0.3);
    if (sadE) { g.beginPath(); g.moveTo(ex + s * 9, ey + 13); g.quadraticCurveTo(ex + s * 15, ey + 25, ex + s * 10, ey + 29); g.quadraticCurveTo(ex + s * 4, ey + 25, ex + s * 9, ey + 13); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 1.8; g.strokeStyle = INK; g.stroke(); }
    g.restore();
  }
  if (o.glasses) { const rims = [-1, 1].map((s) => { const m = fm(s * w * 0.38, ey, kF); return { s, m }; }).filter((q) => q.m.c > 0.18);
    for (const { s, m } of rims) { g.beginPath(); g.ellipse(m.x, ey, 19 * m.sx, 19, 0, 0, TAU); g.lineWidth = 2.8; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.ellipse(m.x - 6 * m.sx, ey - 7, 11 * m.sx, 11, 0, Math.PI * 1.05, Math.PI * 1.45); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,0.85)'; g.stroke(); }
    if (rims.length === 2) { const [a, b] = rims; taper(g, [[a.m.x + 19 * a.m.sx, ey - 2], [(a.m.x + b.m.x) / 2, ey - 5], [b.m.x - 19 * b.m.sx, ey - 2]], 2.6, INK, 0.8); }
    else if (rims.length === 1) { const { m } = rims[0]; taper(g, [[m.x + dv * 19 * m.sx, ey - 2], [m.x + dv * 26 * m.sx, ey - 4]], 2.4, INK, 0.8); }
    for (const { s, m } of rims) { if (!turned) line(g, [[s * (w * 0.38 + 19), ey - 2], [s * w * 0.92, ey - 6]], 2.4); else if (s === -Math.sign(HY)) { const ear = (earAt(s).X - hcx) / fz; line(g, [[m.x - dv * 19 * m.sx, ey - 2], [ear + dv * 6, ey - 4]], 2.4); } } }
  if (o.moustache) { const mp = new Path2D(); for (const s of [-1, 1]) { const m = fm(s * 13, 41, AH > 0.8 ? 1.3 : 1); if (m.c < 0.15) continue; ellP(m.x + (AH > 0.8 ? dv * 4 : 0), 41, 15 * Math.max(0.6, m.sx), 6.4, s * (angryE ? 0.5 : 0.25) * (turned ? 0.6 : 1), mp); } cel(g, mp, o.moustache, 2.4, 3, 2, 0);
    g.save(); g.clip(mp); for (const s of [-1, 1]) { const m = fm(s * 13, 41); taper(g, [[m.x - 5, 38], [m.x + 5, 43]], 1.2, mixc(o.moustache, INK, 0.35), 0.2); } g.restore(); }
  // ---------- mouth (soft shapes, no teeth) ----------
  const my = 50, mm = fm(0, my, AH > 0.8 ? 1 : 1), msx = AH > 0.8 ? 0.8 : clamp(0.55 + 0.45 * Math.cos(HY), 0.55, 1);
  g.save(); g.translate(mm.x + (AH > 0.8 ? -dv * 6 : 0), 0); g.scale(msx, 1);
  const MC = '#5a1e30', TG = '#e07080';
  const openMouth = (mw, mh, up = 1, tongue = true) => { // soft D: corners lifted by `up`, rounded bottom
    const p = new Path2D(); p.moveTo(-mw, my - 5 * up); p.bezierCurveTo(-mw * 0.4, my - 1, mw * 0.4, my - 1, mw, my - 5 * up); p.bezierCurveTo(mw * 0.85, my + mh * 0.9, mw * 0.4, my + mh + 2, 0, my + mh + 2); p.bezierCurveTo(-mw * 0.4, my + mh + 2, -mw * 0.85, my + mh * 0.9, -mw, my - 5 * up); p.closePath();
    g.fillStyle = MC; g.fill(p); g.save(); g.clip(p); g.fillStyle = 'rgba(30,8,20,0.5)'; g.fillRect(-mw - 2, my - 8, mw * 2 + 4, 6); if (tongue) { g.fillStyle = TG; g.beginPath(); g.ellipse(0, my + mh + 2, mw * 0.58, mh * 0.42 + 2, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,200,210,0.6)'; g.beginPath(); g.ellipse(-mw * 0.15, my + mh - 1, mw * 0.18, 2, 0, 0, TAU); g.fill(); } g.restore();
    g.lineWidth = 2.6; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(p);
    for (const s of [-1, 1]) taper(g, [[s * (mw - 1), my - 5 * up - 1], [s * (mw + 4), my - 5 * up - 4 * up]], 2.4, INK, 0.3);
    taper(g, arcPts(0, my + mh + 7, mw * 0.4, Math.PI * 0.2, Math.PI * 0.8, 5, 3), 1.6, mixc(skin, INK, 0.4), 0.2); }
  const oval = (mw, mh, dy = 4, tongue = true) => { g.beginPath(); g.ellipse(0, my + dy, mw, mh, 0, 0, TAU); g.fillStyle = MC; g.fill(); if (tongue) { g.save(); g.clip(); g.fillStyle = TG; g.beginPath(); g.ellipse(0, my + dy + mh * 0.85, mw * 0.65, mh * 0.5, 0, 0, TAU); g.fill(); g.restore(); } g.beginPath(); g.ellipse(0, my + dy, mw, mh, 0, 0, TAU); g.lineWidth = 2.6; g.strokeStyle = INK; g.stroke(); };
  const cheekTicks = (mw) => { for (const s of [-1, 1]) taper(g, arcPts(s * (mw + 8), my - 9, 5, s > 0 ? -0.4 : Math.PI - 1.0, s > 0 ? 1.0 : Math.PI + 0.4, 5), 1.6, mixc(skin, INK, 0.45), 0.2); };
  if (op.talk != null && E !== 'angry' && E !== 'pained') { const k = op.talk, vis = ['A', 'E', 'O', 'A', 'E', 'M'][Math.floor(hsh(Math.floor(TT / 3), 11) * 6)], up = smileK ? 1 : 0.4;
    if (k < 0.08 || vis === 'M') { taper(g, [[-11, my - 3 * up], [0, my + 1], [11, my - 3 * up]], 3.4, INK, 0.3); if (k >= 0.08) taper(g, [[-6, my + 6], [6, my + 6]], 1.4, mixc(skin, INK, 0.35), 0.3); }
    else if (vis === 'O') oval(6 + 5 * k, 5 + 10 * k, 4);
    else if (vis === 'E') openMouth(13 + 8 * k, 3 + 8 * k, up, false);
    else openMouth(9 + 9 * k, 4 + 14 * k, up, true);
    if (smileK) cheekTicks(14); }
  else if (exciteE) { openMouth(21, 20, 1.3); cheekTicks(21); }
  else if (E === 'laugh') { openMouth(20, 18, 1.2); cheekTicks(20); }
  else if (E === 'grin') { openMouth(18, 11, 1.1); cheekTicks(18); }
  else if (angryE) { const p = new Path2D(); p.moveTo(-15, my + 7); p.bezierCurveTo(-8, my - 3, 8, my - 3, 15, my + 7); p.bezierCurveTo(8, my + 4, -8, my + 4, -15, my + 7); p.closePath(); g.fillStyle = MC; g.fill(p); g.lineWidth = 2.6; g.strokeStyle = INK; g.stroke(p); taper(g, [[-10, my + 13], [10, my + 13]], 1.4, mixc(skin, INK, 0.4), 0.2); }
  else if (meanE) { taper(g, [[-13, my + 2], [3, my + 5], [15, my - 6]], 3.6, INK, 0.3); taper(g, [[13, my - 8], [17, my - 2]], 2.2, INK, 0.3); taper(g, arcPts(19, my - 8, 4, -0.6, 1.2, 4), 1.4, mixc(skin, INK, 0.45), 0.2); }
  else if (sadE) taper(g, [[-15, my + 7], [-7, my + 1], [0, my + 0], [7, my + 1], [15, my + 7]], 3.4, INK, 0.3);
  else if (E === 'bored') { taper(g, [[-11, my + 1], [0, my + 2], [11, my + 4]], 3.2, INK, 0.3); }
  else if (shockE) { if (E === 'shock') oval(10, 14, 6); else oval(6, 7, 4, false); }
  else if (E === 'whistle') { g.beginPath(); g.ellipse(3, my + 3, 4.6, 5, 0, 0, TAU); g.fillStyle = MC; g.fill(); g.lineWidth = 2.6; g.strokeStyle = INK; g.stroke(); for (let k = 0; k < 3; k++) taper(g, [[12 + k * 3, my - 4 - k * 7], [20 + k * 4, my - 8 - k * 8]], 1.8, INK, 0.3); }
  else if (E === 'pained') taper(g, [[-14, my + 4], [-9, my], [-4, my + 4], [1, my], [6, my + 4], [11, my], [15, my + 3]], 3, INK, 0.3);
  else if (E === 'dazed') taper(g, [[-11, my + 2], [-4, my - 2], [3, my + 2], [10, my - 2]], 2.8, INK, 0.4);
  else if (E === 'worried' || E === 'nervous') taper(g, [[-10, my + 5], [-4, my + 1], [2, my + 4], [9, my + 1]], 3.1, INK, 0.3);
  else if (E === 'happy') { taper(g, arcPts(0, my - 11, 17, Math.PI * 0.2, Math.PI * 0.8, 10), 4, INK, 0.3); cheekTicks(15); }
  else { taper(g, arcPts(0, my - 9, 12, Math.PI * 0.22, Math.PI * 0.78, 10), 3.6, INK, 0.3); taper(g, arcPts(0, my + 9, 5, Math.PI * 0.25, Math.PI * 0.75, 4), 1.5, mixc(skin, INK, 0.35), 0.2); }
  g.restore();
  g.restore();
  // emotion marks (outside the head clip)
  g.save(); g.translate(hcx, hy); g.scale(fz, fz); const mo = Math.sin(HY) * w * 0.25;
  if (angryE) { const vx = w * 0.56 + mo, vy = -64; g.lineWidth = 3.2; g.strokeStyle = red; g.lineCap = 'round'; for (const [a1, a2, dx, dy] of [[0, 1.6, -5, -5], [1.6, 3.2, 5, -5], [3.2, 4.8, 5, 5], [4.8, 6.3, -5, 5]]) { g.beginPath(); g.arc(vx + dx, vy + dy, 4.5, a1, a2); g.stroke(); } }
  if (E === 'nervous' || E === 'shock' || E === 'worried') { const x = (turned ? -dv : 1) * w * 0.8 + mo, y = -42; g.beginPath(); g.moveTo(x, y - 14); g.quadraticCurveTo(x + 10, y + 4, x, y + 8); g.quadraticCurveTo(x - 10, y + 4, x, y - 14); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(x - 2.5, y + 1, 2, 0, TAU); g.fillStyle = '#fff'; g.fill(); }
  if (exciteE) for (const [sx, sy, rr0] of [[-w - 14, -66, 10], [w + 10, -84, 8], [w + 20, -22, 6]]) { g.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? rr0 * 0.32 : rr0, an = k * Math.PI / 4; g.lineTo(sx + rr * Math.cos(an), sy + rr * Math.sin(an)); } g.closePath(); g.fillStyle = '#ffe14a'; g.fill(); g.lineWidth = 1.8; g.strokeStyle = INK; g.stroke(); }
  g.restore();
  g.translate(cx, shY); g.rotate(-tilt); g.translate(-cx, -shY);
  for (const a of arms) if (!farArm(a) && raisedLate(a)) drawArm(a);
  g.restore(); // upper (lean) + head tilt
}
