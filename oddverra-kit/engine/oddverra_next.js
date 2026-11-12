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
const wrapA = (t) => Math.atan2(Math.sin(t), Math.cos(t));

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
const VIEWS = { front: [0, 0, 0], '34L': [-1, 0.55, 0], '34R': [1, 0.55, 0], sideL: [-1, 1, 0], sideR: [1, 1, 0], back: [0, 0, 1], '34BL': [-1, 0.55, 1], '34BR': [1, 0.55, 1] }; // [facing sign, turn, from behind]
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
  // [BOOTH-story] a folded letter held up to read, and Hamlet's prop skull
  letter: (g) => { const p = polyPath([[-46, -150], [46, -146], [44, -4], [-44, -8]]); cel(g, p, '#f2e8d2', 4, 8, 5, 3); g.strokeStyle = 'rgba(42,36,64,0.65)'; g.lineWidth = 3; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(-32, -128 + i * 16); g.lineTo(i === 6 ? 2 : 30, -127 + i * 16); g.stroke(); } g.strokeStyle = 'rgba(120,100,80,0.35)'; g.beginPath(); g.moveTo(-45, -78); g.lineTo(45, -76); g.stroke(); },
  skull: (g) => { const p = new Path2D(); p.moveTo(-34, -40); p.bezierCurveTo(-40, -110, 40, -110, 34, -40); p.quadraticCurveTo(30, -18, 18, -14); p.lineTo(16, 0); p.lineTo(-16, 0); p.lineTo(-18, -14); p.quadraticCurveTo(-30, -18, -34, -40); p.closePath(); cel(g, p, '#ece2c8', 4.5, 10, 7, 4);
    g.fillStyle = INK; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 14, -46, 10, 12, 0, 0, TAU); g.fill(); } g.beginPath(); g.moveTo(0, -32); g.lineTo(-5, -22); g.lineTo(5, -22); g.closePath(); g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 6, -12); g.lineTo(i * 6, -2); g.stroke(); } },
  megaphone: (g) => { cel(g, polyPath([[-10, -20], [-40, -150], [60, -150], [20, -20]]), '#e8e4dc', 4.5, 14, 6, 5); cel(g, ((p) => { p.rect(-46, -160, 112, 15); return p; })(new Path2D()), '#c0453a', 4, 6, 3, 0); },
};
// [CASTRO-cast] props: cigar (lit tip, op.smoke wisp), cigarbox, giftbox, shoe (op.dust powder), seashell (pink conch; op.painted = bright bands)
// HOLD fns get (g, op); HSIDE = which way the holding hand points (+1 screen right) so long props point away from the body
let HSIDE = 1;
const smokeWisp = (g, x, y, t, k = 1) => { g.save(); g.lineCap = 'round'; for (let j = 0; j < 3; j++) { const ph = t * 0.09 + j * 2.1, pts = [];
  for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push([x + Math.sin(ph + u * 5.5) * (6 + 16 * u) * k + j * 5 * k, y - u * 150 * k - j * 8]); }
  g.globalAlpha = 0.8 - j * 0.2; taper(g, pts, (11 - j * 3) * k, j ? '#f2eefa' : '#d6cce8', 0.1); } g.restore(); };
const cigarAt = (g, x0, y0, ang, L, R, lit, t, smoke) => { g.save(); g.translate(x0, y0); g.rotate(ang);
  const b = new Path2D(); b.moveTo(0, -R); b.lineTo(L - 4, -R); b.quadraticCurveTo(L, -R, L, 0); b.quadraticCurveTo(L, R, L - 4, R); b.lineTo(0, R * 0.9); b.quadraticCurveTo(-R * 1.6, 0, 0, -R); b.closePath();
  cel(g, b, '#8a5232', 2.6, 0, R * 0.7, 2); g.save(); g.clip(b); g.strokeStyle = 'rgba(60,30,20,0.35)'; g.lineWidth = 1.2; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(L * 0.12 + i * L * 0.16, -R); g.lineTo(L * 0.2 + i * L * 0.16, R); g.stroke(); }
  g.fillStyle = 'rgba(255,220,170,0.35)'; g.fillRect(0, -R * 0.75, L, R * 0.3); g.restore();
  const bd = new Path2D(); bd.rect(L * 0.1, -R * 1.02, L * 0.11, R * 2.04); cel(g, bd, '#c8302c', 1.6, 0, 0, 0); g.fillStyle = '#e8c050'; g.fillRect(L * 0.1, -R * 0.25, L * 0.11, R * 0.5); // plain band, no lettering
  if (lit) { const ash = new Path2D(); ash.rect(L - 2, -R * 0.95, R * 0.9, R * 1.9); cel(g, ash, '#b8b4c0', 1.6, 0, R * 0.5, 0);
    const gl = g.createRadialGradient(L + R, 0, 0, L + R, 0, R * 3); gl.addColorStop(0, 'rgba(255,170,60,0.85)'); gl.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gl; g.beginPath(); g.arc(L + R, 0, R * 3, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(L + R * 0.95, 0, R * 0.45, R * 0.9, 0, 0, TAU); g.fillStyle = '#ff7a2a'; g.fill(); g.beginPath(); g.ellipse(L + R * 1.05, 0, R * 0.22, R * 0.5, 0, 0, TAU); g.fillStyle = '#ffe08a'; g.fill(); }
  g.restore(); if (lit && smoke) smokeWisp(g, x0 + Math.cos(ang) * (L + R), y0 + Math.sin(ang) * (L + R), t, R / 8); };
Object.assign(HOLD, {
  cigar: (g, op = {}) => cigarAt(g, -14 * HSIDE, 6, HSIDE > 0 ? -0.55 : Math.PI + 0.55, 104, 8, op.lit !== false, op.t || 0, !!op.smoke),
  cigarbox: (g) => { const W = 78; const lid = polyPath([[-W, -64], [-W + 10, -150], [W + 10, -150], [W, -64]]); cel(g, lid, '#9a5a30', 3.6, 8, 5, 3);
    const art = polyPath([[-W + 10, -72], [-W + 18, -142], [W + 2, -142], [W - 8, -72]]); cel(g, art, '#f2e2b8', 1.8, 4, 3, 0); g.lineWidth = 2; g.strokeStyle = '#c8a040'; g.stroke(polyPath([[-W + 18, -80], [-W + 24, -134], [W - 4, -134], [W - 14, -80]]));
    cel(g, ellP(2, -107, 26, 20), '#c0453a', 1.8, 3, 2, 0); cel(g, ellP(2, -107, 15, 11), '#e8c050', 1.4, 2, 1, 0);
    for (let i = 0; i < 7; i++) cel(g, ellP(-W + 14 + i * 22, -66, 11, 7), '#7a4428', 1.8, 2, 2, 0);
    const bx = new Path2D(); bx.rect(-W, -64, 2 * W, 64); cel(g, bx, '#a8683a', 3.8, 10, 6, 4, (h) => { h.strokeStyle = 'rgba(70,35,15,0.25)'; h.lineWidth = 1.2; for (let y = -60; y < 0; y += 7) { h.beginPath(); h.moveTo(-W, y); h.bezierCurveTo(-20, y + 3, 20, y - 3, W, y + 1); h.stroke(); } });
    const lb = new Path2D(); lb.rect(-W, -44, 2 * W, 18); cel(g, lb, '#f2e2b8', 1.6, 0, 0, 0); g.fillStyle = '#c0453a'; g.fillRect(-W, -44, 2 * W, 3); g.fillRect(-W, -29, 2 * W, 3); cel(g, ellP(0, -35, 12, 8), '#e8c050', 1.4, 0, 0, 0); },
  giftbox: (g, op = {}) => { const W = 66, H = 84, bc = op.giftCol || '#4a7ac0', rc = op.ribbonCol || '#e0b84a';
    const bx = new Path2D(); bx.rect(-W, -H, 2 * W, H); cel(g, bx, bc, 3.8, 10, 6, 4, (h) => { h.fillStyle = 'rgba(255,255,255,0.16)'; for (let x = -W; x < W; x += 22) for (let y = -H + 8; y < 0; y += 22) { h.beginPath(); h.arc(x + ((y / 22) & 1) * 11 + 6, y, 3.4, 0, TAU); h.fill(); } });
    const ld = new Path2D(); ld.rect(-W - 7, -H - 22, 2 * W + 14, 24); cel(g, ld, mixc(bc, '#ffffff', 0.08), 3.4, 6, 4, 3);
    g.save(); g.clip(bx); g.fillStyle = rc; g.fillRect(-9, -H, 18, H); g.restore(); g.save(); g.clip(ld); g.fillStyle = rc; g.fillRect(-9, -H - 22, 18, 24); g.restore(); line(g, [[-9, -H - 22], [-9, 0]], 1.4, mixc(rc, INK, 0.4)); line(g, [[9, -H - 22], [9, 0]], 1.4, mixc(rc, INK, 0.4));
    const bw = new Path2D(); for (const s of [-1, 1]) smooth([[0, -H - 24], [s * 30, -H - 52], [s * 40, -H - 36], [s * 10, -H - 22]], 5, bw); cel(g, bw, rc, 2.6, 4, 3, 0);
    for (const s of [-1, 1]) cel(g, polyPath([[s * 2, -H - 24], [s * 22, -H - 2], [s * 12, -H + 4], [s * 6, -H - 18]]), dk(rc, 0.9), 2, 2, 2, 0); cel(g, ellP(0, -H - 24, 9, 8), dk(rc, 0.88), 2, 2, 2, 0); },
  shoe: (g, op = {}) => { const s = HSIDE; g.save(); g.scale(s, 1); const sp = smooth([[-36, -40], [-6, -52], [24, -44], [62, -30], [74, -14], [66, 0], [-40, 0], [-46, -18]], 6); cel(g, sp, op.shoeCol || '#3a2420', 3.6, 8, 6, 3);
    g.save(); g.clip(sp); g.fillStyle = '#1d1426'; g.fillRect(-60, -7, 150, 10); g.restore(); cel(g, smooth([[-30, -40], [-6, -48], [10, -44], [-4, -34], [-28, -32]], 4), '#2a1a18', 1.8, 0, 0, 0);
    for (let k = 0; k < 3; k++) line(g, [[2 + k * 7, -45 + k * 2], [10 + k * 7, -38 + k * 2]], 1.8, '#d8c8a8'); taper(g, [[30, -38], [60, -24]], 3, 'rgba(255,255,255,0.45)', 0.3); g.restore();
    if (op.dust) { const t = op.t || 0; for (let i = 0; i < 22; i++) { const a = hsh(i, 1.1), b = hsh(i, 2.2), y = -40 - ((t * 1.3 + b * 90) % 90); g.globalAlpha = clamp(1 - (-40 - y) / 90, 0, 1) * 0.9; g.beginPath(); g.arc(-40 + a * 110 + Math.sin(t * 0.1 + i) * 6, y, 2 + b * 2.4, 0, TAU); g.fillStyle = i % 3 ? '#e8f4d8' : '#b8f0c8'; g.fill(); } g.globalAlpha = 1; } },
  seashell: (g, op = {}) => { g.save(); g.scale(HSIDE, 1); const pc = op.shellCol || '#f2a0b4';
    const body = smooth([[-6, -112], [10, -96], [24, -86], [38, -70], [44, -48], [36, -22], [16, -6], [-6, 0], [-26, -14], [-34, -40], [-30, -66], [-18, -86]], 6); cel(g, body, pc, 3.6, 8, 6, 4);
    g.save(); g.clip(body); if (op.painted) for (const [y, c] of [[-92, '#3ac8c0'], [-70, '#f6d040'], [-48, '#7a5ae0'], [-26, '#3ac8c0']]) { g.fillStyle = c; g.beginPath(); g.moveTo(-60, y); g.quadraticCurveTo(0, y + 12, 60, y - 4); g.lineTo(60, y + 8); g.quadraticCurveTo(0, y + 24, -60, y + 12); g.fill(); }
    g.strokeStyle = mixc(pc, INK, 0.4); g.lineWidth = 1.8; for (const y of [-96, -82, -64]) { g.beginPath(); g.moveTo(-26, y + 10); g.quadraticCurveTo(4, y + 18, 34, y + 4); g.stroke(); } g.restore();
    for (const [x, y] of [[-24, -60], [-10, -86], [30, -78], [42, -54]]) cel(g, polyPath([[x - 6, y + 4], [x + (x > 0 ? 10 : -10), y - 8], [x + 6, y + 6]]), lt(pc, 0.2), 1.8, 2, 1, 0);
    const lip = smooth([[6, -70], [26, -54], [30, -28], [14, -12], [0, -24], [-2, -50]], 5); cel(g, lip, '#ffd8e0', 2.2, 3, 2, 0); g.save(); g.clip(lip); g.fillStyle = 'rgba(230,110,140,0.5)'; g.beginPath(); g.ellipse(12, -40, 9, 20, 0.2, 0, TAU); g.fill(); g.restore();
    taper(g, [[-20, -76], [-24, -40]], 4, 'rgba(255,255,255,0.6)', 0.3); g.restore(); },
});
// [TEDDY-cast] props: teddy (plush bear; also drawn at the chest for op.hug), rope (coil), pen (dip pen), newspaper (no lettering), needle (+ thread)
export function teddyAt(g, x, y, k = 1, o = {}) { // body centre (x, y); ~190k tall (ears to feet); o.col / o.bow / o.tilt
  const fc = o.col || '#b9803f', mz = '#ecd2a4', pd = '#e2bf8a'; g.save(); g.translate(x, y); g.rotate(o.tilt || 0); g.scale(k, k);
  for (const s of [-1, 1]) cel(g, ellP(s * 30, 48, 22, 26, s * 0.3), fc, 3, 5, 4, 3); // legs
  for (const s of [-1, 1]) cel(g, ellP(s * 33, 62, 15, 11, s * 0.3), pd, 2, 2, 2, 0); // foot pads
  const body = smooth([[0, -38], [30, -30], [42, 0], [38, 34], [0, 50], [-38, 34], [-42, 0], [-30, -30]], 6); cel(g, body, fc, 3.4, 9, 6, 4, twill(fc));
  cel(g, ellP(0, 12, 22, 26), lt(fc, 0.35), 0, 4, 3, 0); // tummy
  for (const s of [-1, 1]) cel(g, smooth([[s * 30, -24], [s * 52, -6], [s * 54, 16], [s * 42, 20], [s * 32, 0]], 5), fc, 2.8, 4, 4, 2); // arms
  for (const s of [-1, 1]) { cel(g, ellP(s * 38, -88, 15, 15), fc, 3, 4, 3, 2); cel(g, ellP(s * 38, -87, 8, 8), mz, 0, 2, 2, 0); } // ears
  const hd = smooth([[0, -104], [32, -98], [46, -72], [40, -46], [0, -36], [-40, -46], [-46, -72], [-32, -98]], 6); cel(g, hd, fc, 3.4, 8, 6, 4, twill(fc));
  cel(g, ellP(0, -56, 20, 15), mz, 2, 3, 2, 0);
  g.beginPath(); g.ellipse(0, -63, 7.5, 5.5, 0, 0, TAU); g.fillStyle = INK; g.fill(); g.beginPath(); g.arc(-2.5, -65, 1.8, 0, TAU); g.fillStyle = '#fff'; g.fill();
  taper(g, [[0, -58], [0, -52]], 2, INK, 0.4); taper(g, arcPts(0, -56, 7, 0.35, Math.PI - 0.35, 6, 5), 2.2, INK, 0.3);
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 17, -76, 5, 6.5, 0, 0, TAU); g.fillStyle = INK; g.fill(); g.beginPath(); g.arc(s * 17 - 1.6, -78.5, 1.8, 0, TAU); g.fillStyle = '#fff'; g.fill();
    g.beginPath(); g.ellipse(s * 26, -60, 6, 3.4, 0, 0, TAU); g.fillStyle = 'rgba(240,100,130,0.45)'; g.fill(); }
  if (o.bow !== false) { const bc = o.bowCol || '#c8323c', bp = new Path2D(); for (const s of [-1, 1]) polyPath([[0, -36], [s * 20, -46], [s * 20, -26]], bp); cel(g, bp, bc, 2.2, 2, 2, 0); cel(g, ellP(0, -36, 5, 5), dk(bc, 0.85), 1.6, 1, 1, 0); }
  g.restore(); }
Object.assign(HOLD, {
  teddy: (g, op = {}) => teddyAt(g, HSIDE * 14, -58, 1.05, { tilt: HSIDE * 0.12, col: op.teddyCol }),
  rope: (g) => { const rc = '#c8a466'; for (let k = 0; k < 4; k++) { const P = ellP(HSIDE * 6 + k * 3 * HSIDE, 28 + k * 4, 46 - k * 2, 62 - k * 3, HSIDE * 0.12); g.lineWidth = 13; g.strokeStyle = INK; g.stroke(P); g.lineWidth = 8.5; g.strokeStyle = k % 2 ? rc : '#b89254'; g.stroke(P); }
    g.save(); g.setLineDash([4, 5]); g.lineWidth = 2; g.strokeStyle = 'rgba(90,60,30,0.6)'; for (let k = 0; k < 4; k++) g.stroke(ellP(HSIDE * 6 + k * 3 * HSIDE, 28 + k * 4, 46 - k * 2, 62 - k * 3, HSIDE * 0.12)); g.restore();
    const tl = [[-HSIDE * 30, 80], [-HSIDE * 40, 120], [-HSIDE * 26, 160]]; line(g, tl, 13, INK); line(g, tl, 8.5, rc); },
  pen: (g) => { const s = HSIDE, a = [-s * 4, 14], b = [s * 40, -96]; line(g, [a, b], 11, INK); line(g, [a, b], 6.5, '#3a2a2a'); const n = [s * 50, -124]; cel(g, polyPath([[b[0] - 5, b[1] + 2], [b[0] + 5 * s + 4, b[1] - 2], n]), '#c8ccd6', 2, 2, 1, 0); taper(g, [lerp(a, b, 0.2), lerp(a, b, 0.7)], 2, 'rgba(255,255,255,0.35)', 0.3); },
  newspaper: (g) => { const p = polyPath([[-56, -170], [54, -164], [52, 6], [-54, 0]]); cel(g, p, '#ece6d4', 4, 8, 5, 3); g.save(); g.clip(p);
    g.fillStyle = 'rgba(42,36,64,0.85)'; g.fillRect(-46, -158, 92, 14); g.fillStyle = 'rgba(42,36,64,0.4)'; for (let c = 0; c < 3; c++) for (let i = 0; i < 9; i++) g.fillRect(-46 + c * 32, -134 + i * 13, 26, 3);
    g.strokeStyle = 'rgba(42,36,64,0.6)'; g.lineWidth = 1.4; g.strokeRect(-14, -112, 28, 40); g.restore(); line(g, [[-55, -84], [53, -80]], 1.6, 'rgba(120,100,80,0.45)'); },
  needle: (g) => { const s = HSIDE, a = [s * 2, -6], b = [s * 22, -62]; line(g, [a, b], 4.5, INK); line(g, [a, b], 2.4, '#e6eaf2'); g.beginPath(); g.ellipse(b[0] - s * 1, b[1] + 4, 1.6, 3, s * 0.35, 0, TAU); g.fillStyle = INK; g.fill();
    taper(g, [[b[0], b[1] + 4], [s * 40, -72], [s * 52, -40], [s * 40, 0], [s * 56, 26]], 2.2, '#c8323c', 0.6); },
});
BUILD.tall = { w: 1.02, h: 1.07, leg: 1.1, hs: 1, arm: 1.07 }; // [CASTRO-cast] tall build (CASTRO)
// [EIN-cast] 1952 Einstein / Ben-Gurion / Eban / Dukas / mailman / aide / press. Props: pipe (op.smoke wisp), chalk (op.chalkDust), letter (now handwritten),
// violin, phone (1950s handset; op.ear = held at the ear), fountainpen, envelope, notepad, flashcam (op.flash burst). Expressions: amused, thoughtful, determined, relieved.
BUILD.short = { w: 1.2, h: 0.9, leg: 0.8, hs: 1.03, arm: 0.92, belly: 1 }; // [EIN-cast] stocky, short (BENGURION)
Object.assign(BROWS, { amused: [1, -9, 1, 0.85], thoughtful: [7, 1, 2, 0.95], determined: [12, 5, -2, 1], relieved: [-7, -6, 3, 0.9] }); // [EIN-cast]
Object.assign(LIDS, { amused: [0.36, 0.3], thoughtful: [0.38, 0.3], determined: [0.34, 0.12] }); SMILEY.amused = 0.8; SMILEY.relieved = 0.6; // [EIN-cast]
let EGC = null; // [EIN-cast] glasses-chain anchors (face units)
const pipeAt = (g, x0, y0, s, k, t, lit, smoke) => { // [EIN-cast] bent briar pipe: bowl at (x0, y0), stem toward -s; k = scale
  g.save(); g.translate(x0, y0); g.scale(k * s, k);
  const st = [[-6, -8], [-34, -14], [-62, -24], [-80, -34]]; taper(g, st, 15, INK, 0.75); taper(g, st, 9.5, '#2a2228', 0.75); taper(g, st.slice(0, 3), 9, '#6a3a22', 0.85); taper(g, [[-14, -14], [-44, -21]], 2.2, 'rgba(255,230,200,0.35)', 0.3);
  const b = new Path2D(); b.moveTo(-16, -44); b.lineTo(16, -44); b.quadraticCurveTo(20, -6, 4, 2); b.quadraticCurveTo(-14, 6, -18, -14); b.closePath(); cel(g, b, '#7a4026', 3.4, 6, 4, 3, (h) => { h.strokeStyle = 'rgba(40,16,8,0.3)'; h.lineWidth = 1.4; for (let y = -40; y < 4; y += 7) { h.beginPath(); h.moveTo(-20, y); h.quadraticCurveTo(0, y + 4, 22, y - 2); h.stroke(); } });
  g.beginPath(); g.ellipse(0, -44, 16, 5, 0, 0, TAU); g.fillStyle = '#2a1a14'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
  if (lit) { g.beginPath(); g.ellipse(0, -44, 10, 3, 0, 0, TAU); g.fillStyle = '#ff7a2a'; g.fill(); g.beginPath(); g.ellipse(-2, -44.5, 5, 1.6, 0, 0, TAU); g.fillStyle = '#ffe08a'; g.fill(); }
  taper(g, [[-11, -36], [-12, -14]], 3, 'rgba(255,220,190,0.45)', 0.3); g.restore();
  if (smoke) smokeWisp(g, x0, y0 - 46 * k, t, 0.62 * k); };
const scrawl = (g, x0, x1, y, seed, col, w = 2.2) => { const pts = []; for (let x = x0; x <= x1; x += 3) pts.push([x, y + Math.sin(x * 0.55 + seed * 3.1) * 2.2 + Math.sin(x * 0.17 + seed) * 1.4 - (hsh(Math.floor(x / 9), seed) > 0.8 ? 3 : 0)]); line(g, pts, w, col); }; // [EIN-cast] handwriting
Object.assign(HOLD, { // [EIN-cast]
  pipe: (g, op = {}) => pipeAt(g, HSIDE * 4, -8, HSIDE, 1, op.t || 0, !!(op.lit || op.smoke), !!op.smoke),
  chalk: (g, op = {}) => { const s = HSIDE; g.save(); g.rotate(-s * 0.5); const c = new Path2D(); c.roundRect(-7, -58, 14, 50, 3); cel(g, c, '#f4f2ea', 2.6, 4, 3, 0); g.fillStyle = 'rgba(160,150,190,0.35)'; g.fillRect(-6, -58, 12, 6); g.restore();
    if (op.chalkDust) { const t = op.t || 0; for (let i = 0; i < 14; i++) { const a = hsh(i, 4.1), b = hsh(i, 6.3), y = -50 + ((t * 1.1 + b * 80) % 80); g.globalAlpha = clamp(1 - (y + 50) / 80, 0, 1) * 0.8; g.beginPath(); g.arc(s * (14 + a * 30) + Math.sin(t * 0.1 + i) * 4, y, 1.6 + b * 2, 0, TAU); g.fillStyle = '#f6f4f0'; g.fill(); } g.globalAlpha = 1; } },
  letter: (g) => { g.save(); g.rotate(-HSIDE * 0.06); const p = polyPath([[-48, -152], [46, -148], [44, -2], [-46, -6]]); cel(g, p, '#f4ecd8', 4, 8, 5, 3); g.save(); g.clip(p);
    g.fillStyle = 'rgba(150,120,90,0.12)'; g.fillRect(-50, -78, 100, 3); g.fillRect(-50, -40, 100, 2); // fold creases
    for (let i = 0; i < 8; i++) scrawl(g, -36 + (i ? 0 : 4), i === 7 ? -2 : 32 - (i % 3) * 5, -132 + i * 14, i + 1, 'rgba(40,40,110,0.78)', 1.9);
    taper(g, [[-2, -18], [8, -26], [14, -16], [22, -24], [30, -14], [36, -20]], 2.4, 'rgba(40,40,110,0.85)', 0.3); g.restore(); g.restore(); },
  violin: (g) => { const s = HSIDE; g.save(); g.translate(s * 6, 0); g.rotate(s * 0.18);
    const bd = new Path2D(); bd.moveTo(0, 24); bd.bezierCurveTo(40, 24, 44, 70, 26, 84); bd.bezierCurveTo(22, 90, 22, 98, 30, 104); bd.bezierCurveTo(52, 124, 44, 176, 0, 178); bd.bezierCurveTo(-44, 176, -52, 124, -30, 104); bd.bezierCurveTo(-22, 98, -22, 90, -26, 84); bd.bezierCurveTo(-44, 70, -40, 24, 0, 24); bd.closePath();
    cel(g, bd, '#b8602a', 3.6, 8, 6, 4, (h) => { h.fillStyle = 'rgba(255,200,120,0.25)'; h.beginPath(); h.ellipse(-12, 60, 10, 26, 0, 0, TAU); h.fill(); h.beginPath(); h.ellipse(-14, 140, 12, 26, 0, 0, TAU); h.fill(); });
    for (const sx of [-1, 1]) taper(g, [[sx * 16, 88], [sx * 12, 104], [sx * 17, 122]], 2.4, '#3a1a10', 0.6);
    const fb = new Path2D(); fb.moveTo(-7, -60); fb.lineTo(7, -60); fb.lineTo(9, 120); fb.lineTo(-9, 120); fb.closePath(); cel(g, fb, '#1e1618', 2.2, 2, 2, 0);
    cel(g, polyPath([[-12, 134], [12, 134], [8, 168], [-8, 168]]), '#1e1618', 2, 2, 2, 0); cel(g, ellP(16, 160, 12, 9), '#2a1e1a', 1.8, 2, 2, 0); line(g, [[-14, 112], [14, 112]], 4, '#e8c890');
    for (let k = -1.5; k <= 1.5; k++) line(g, [[k * 2.4, -64], [k * 3.2, 134]], 0.9, 'rgba(240,235,225,0.9)');
    cel(g, polyPath([[-6, -60], [6, -60], [5, -86], [-5, -86]]), '#8a4220', 2, 2, 2, 0); cel(g, ellP(0, -94, 9, 10), '#8a4220', 2.2, 2, 2, 0); taper(g, arcPts(0, -94, 5, 0, 5, 8), 1.6, '#3a1a10', 0.3);
    for (const sx of [-1, 1]) for (const y of [-68, -80]) cel(g, ellP(sx * 9, y, 4, 2.6), '#1e1618', 1.4, 0, 0, 0); g.restore(); },
  phone: (g) => { const s = HSIDE, h = new Path2D(); // 1950s bakelite handset: earpiece up (at the ear), mouthpiece toward the mouth
    g.save(); g.translate(-s * 10, 34); g.rotate(s * 0.42); h.moveTo(-9, -64); h.quadraticCurveTo(-12, 0, -9, 60); h.lineTo(9, 60); h.quadraticCurveTo(6, 0, 9, -64); h.closePath(); cel(g, h, '#22202a', 3.2, 4, 3, 2);
    for (const [y, rx] of [[-70, 24], [66, 22]]) { const c = ellP(y < 0 ? 0 : -s * 2, y, rx, 13, 0); cel(g, c, '#22202a', 3.2, 5, 4, 3); g.beginPath(); g.ellipse(y < 0 ? 0 : -s * 2, y + (y < 0 ? -3 : 3), rx * 0.62, 6, 0, 0, TAU); g.fillStyle = '#3a3646'; g.fill(); }
    taper(g, [[-5, -40], [-6, 30]], 2.6, 'rgba(255,255,255,0.35)', 0.3); const cd = [[0, 78], [-s * 8, 110], [s * 4, 140], [-s * 10, 176], [s * 2, 210]]; taper(g, cd, 4.5, INK, 0.9); taper(g, cd, 2.4, '#3a3442', 0.9); g.restore(); },
  fountainpen: (g) => { const s = HSIDE, a = [-s * 6, 16], b = [s * 34, -92]; line(g, [a, b], 15, INK); line(g, [a, b], 10, '#1e1a2a'); line(g, [lerp(a, b, 0.55), b], 10, '#3a1e2e');
    line(g, [lerp(a, b, 0.53), lerp(a, b, 0.56)], 10, '#d8b048'); line(g, [lerp(a, b, -0.02), lerp(a, b, 0.03)], 10, '#d8b048'); line(g, [lerp(a, b, 0.6), lerp(a, b, 0.9)], 2.4, '#e8c860');
    const n0 = lerp(a, b, -0.02), n = [a[0] - s * 10, a[1] + 26]; cel(g, polyPath([[n0[0] - 5, n0[1]], [n0[0] + 5, n0[1] + 2], n]), '#e2bd52', 1.8, 1, 1, 0); taper(g, [lerp(a, b, 0.62), lerp(a, b, 0.95)], 2, 'rgba(255,255,255,0.4)', 0.3); },
  envelope: (g) => { g.save(); g.rotate(-HSIDE * 0.1); const p = new Path2D(); p.rect(-64, -96, 128, 80); cel(g, p, '#efe4cc', 3.6, 8, 5, 3);
    const st = new Path2D(); st.rect(30, -88, 24, 28); cel(g, st, '#c84a3a', 1.6, 0, 0, 0); g.strokeStyle = 'rgba(255,240,220,0.9)'; g.lineWidth = 1.6; g.strokeRect(33, -85, 18, 22); g.fillStyle = 'rgba(255,240,220,0.5)'; g.fillRect(37, -80, 10, 10);
    g.strokeStyle = 'rgba(40,36,64,0.45)'; g.lineWidth = 1.4; g.beginPath(); g.arc(28, -70, 14, 0, TAU); g.stroke(); for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(42, -76 + k * 6); g.quadraticCurveTo(52, -79 + k * 6, 62, -76 + k * 6); g.stroke(); }
    for (let i = 0; i < 3; i++) scrawl(g, -30, 18 - i * 6, -52 + i * 11, i + 7, 'rgba(40,40,110,0.75)', 1.8); g.restore(); },
  notepad: (g) => { g.save(); g.rotate(-HSIDE * 0.08); const p = new Path2D(); p.rect(-40, -126, 80, 112); cel(g, p, '#f2eedc', 3.4, 6, 4, 3); g.save(); g.clip(p); g.strokeStyle = 'rgba(90,120,170,0.35)'; g.lineWidth = 1; for (let y = -100; y < -16; y += 10) { g.beginPath(); g.moveTo(-40, y); g.lineTo(40, y); g.stroke(); }
    for (let i = 0; i < 6; i++) scrawl(g, -32, 26 - (i % 2) * 12, -104 + i * 10, i + 3, 'rgba(50,46,70,0.7)', 1.5); g.restore();
    const cv = new Path2D(); cv.rect(-42, -138, 84, 14); cel(g, cv, '#8a5a3a', 2.4, 2, 2, 0); for (let x = -34; x <= 34; x += 8) { g.beginPath(); g.ellipse(x, -126, 2.6, 5, 0, 0, TAU); g.lineWidth = 2; g.strokeStyle = '#8a8c98'; g.stroke(); } g.restore(); },
  flashcam: (g, op = {}) => { const s = HSIDE; g.save(); g.scale(s * 1.25, 1.25); // press camera: body + folding bed + bellows + lens, flash gun with a big reflector (no maker names)
    const bd = new Path2D(); bd.roundRect(-34, -96, 76, 70, 6); cel(g, bd, '#2a2a32', 3.6, 6, 5, 3, (h) => { h.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = -96; y < -26; y += 5) for (let x = -34 + (y % 2) * 2; x < 42; x += 5) h.fillRect(x, y, 1.6, 1.6); });
    const bl = new Path2D(); bl.rect(-40, -86, 14, 52); cel(g, bl, '#1a1a20', 2.4, 2, 2, 0); g.strokeStyle = 'rgba(120,120,140,0.6)'; g.lineWidth = 1.2; for (let y = -82; y < -36; y += 6) { g.beginPath(); g.moveTo(-40, y); g.lineTo(-26, y); g.stroke(); }
    cel(g, ellP(-46, -60, 15, 17), '#3a3a44', 2.6, 3, 3, 0); cel(g, ellP(-48, -60, 10, 12), '#5a7ab0', 1.6, 2, 2, 0); g.beginPath(); g.arc(-51, -64, 3.4, 0, TAU); g.fillStyle = '#fff'; g.fill();
    cel(g, ((p) => { p.rect(-14, -108, 32, 12); return p; })(new Path2D()), '#b8bcc8', 2, 2, 1, 0);
    line(g, [[40, -40], [40, -128]], 9, INK); line(g, [[40, -40], [40, -128]], 5, '#c8ccd6'); // flash gun
    const rf = ellP(40, -156, 34, 30); cel(g, rf, '#d8dce6', 3.2, 6, 5, 3); g.save(); g.clip(rf); const rg = g.createRadialGradient(40, -156, 2, 40, -156, 34); rg.addColorStop(0, '#ffffff'); rg.addColorStop(1, 'rgba(150,160,190,0.6)'); g.fillStyle = rg; g.fillRect(0, -190, 80, 70); g.restore();
    cel(g, ellP(40, -156, 9, 10), op.flash ? '#ffffff' : '#e8f0ff', 1.6, 0, 0, 0);
    if (op.flash) { const f = clamp(op.flash, 0, 1), gl = g.createRadialGradient(40, -156, 0, 40, -156, 150); gl.addColorStop(0, `rgba(255,255,255,${f})`); gl.addColorStop(0.3, `rgba(255,250,220,${0.6 * f})`); gl.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gl; g.beginPath(); g.arc(40, -156, 150, 0, TAU); g.fill();
      g.globalAlpha = f; for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4 + 0.2; taper(g, [[40 + Math.cos(an) * 38, -156 + Math.sin(an) * 38], [40 + Math.cos(an) * (k % 2 ? 70 : 100), -156 + Math.sin(an) * (k % 2 ? 70 : 100)]], 6, '#fffbe0', 0.1); } g.globalAlpha = 1; }
    g.restore(); },
});

// [LIB-cast] Liberty/Egypt cast: props sketchbook (op.sketch 'fellaha' | 'liberty' | 'colossus'), pencil, rolls, scroll (op.scrollLen), ledger, abacus, shovel,
// basket, pennant, lantern (op.lit 0..1), mallet. Expressions love (heart eyes), dreamy (sparkle eyes), sly (one brow up + smirk).
Object.assign(BROWS, { love: [1, -8, 1, 0.85], dreamy: [-3, -9, 1, 0.85], sly: [8, 2, 1, 0.95] }); Object.assign(LIDS, { sly: [0.5, 0.36] }); Object.assign(SMILEY, { love: 1, dreamy: 0.7, sly: 0.4 }); // [LIB-cast]
const libSketchFig = (g, x, y, k, kind) => { const pc = 'rgba(60,56,80,0.85)', P = (pts, w = 2) => taper(g, pts.map(([a, b]) => [x + a * k, y + b * k]), w, pc, 0.4); // [LIB-cast] pencil figure
  if (kind === 'colossus') { P([[-14, 0], [-16, -30], [-10, -46], [10, -46], [16, -30], [14, 0]]); P([[-16, 0], [16, 0]]); P([[-10, -46], [-14, -60], [0, -66], [14, -60], [10, -46]]); P([[-9, -52], [-20, -40]]); P([[9, -52], [20, -40]]); P([[-6, -18], [6, -18]], 1.4); P([[-22, 4], [22, 4]], 1.4); return; }
  P([[-12, 0], [-8, -30], [-5, -44], [5, -44], [8, -30], [12, 0], [-12, 0]]); P([[-4, -30], [-2, -10]], 1.3); P([[3, -28], [5, -6]], 1.3); // robe + folds
  g.beginPath(); g.arc(x, y - 50 * k, 5 * k, 0, TAU); g.lineWidth = 1.8; g.strokeStyle = pc; g.stroke();
  P([[4, -42], [10, -56], [12, -72]]); P([[9, -72], [15, -72]]); // arm + torch
  g.beginPath(); g.ellipse(x + 12 * k, y - 78 * k, 3.2 * k, 5 * k, 0, 0, TAU); g.fillStyle = '#f0a030'; g.fill();
  if (kind === 'liberty') for (let i = -2; i <= 2; i++) P([[i * 2, -55], [i * 4.5, -61]], 1.3); else P([[-5, -52], [-8, -40], [-7, -30]], 1.4); }; // crown rays / fellaha head veil
Object.assign(HOLD, { // [LIB-cast]
  sketchbook: (g, op = {}) => { const s = HSIDE; g.save(); g.translate(-s * 40, -86); g.rotate(-s * 0.08); g.scale(1.3, 1.3);
    const cv = new Path2D(); cv.roundRect(-96, -62, 192, 118, 6); cel(g, cv, '#5a3a2a', 3.6, 6, 4, 2);
    for (const sd of [-1, 1]) { const pg = new Path2D(); pg.moveTo(0, -54); pg.quadraticCurveTo(sd * 44, -60, sd * 88, -54); pg.lineTo(sd * 88, 48); pg.quadraticCurveTo(sd * 44, 42, 0, 48); pg.closePath(); cel(g, pg, '#f4ecd6', 2.2, sd * 6, 3, 0); }
    taper(g, [[0, -52], [0, 46]], 2.4, 'rgba(90,70,60,0.6)', 0.2);
    libSketchFig(g, 44, 34, 0.95, op.sketch || 'fellaha'); libSketchFig(g, -44, 34, 0.8, op.sketch2 || 'colossus');
    g.strokeStyle = 'rgba(60,56,80,0.35)'; g.lineWidth = 1; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-82, -40 + i * 8); g.lineTo(-56 + i * 6, -40 + i * 8); g.stroke(); } g.restore(); },
  pencil: (g) => { const s = HSIDE, a = [-s * 4, 16], b = [s * 30, -84]; line(g, [a, b], 11, INK); line(g, [a, b], 7, '#e8b830'); line(g, [lerp(a, b, 0.1), lerp(a, b, 0.9)], 1.6, 'rgba(255,255,255,0.4)');
    const t = [b[0] + (b[0] - a[0]) * 0.16, b[1] + (b[1] - a[1]) * 0.16]; cel(g, polyPath([[b[0] - 5, b[1]], [b[0] + 5, b[1] + 2], t]), '#e8c8a0', 1.6, 0, 0, 0); cel(g, ellP(a[0], a[1], 5, 4), '#d87a8a', 1.6, 0, 0, 0); },
  rolls: (g) => { const s = HSIDE; for (const [dx, dy, L, c] of [[-16, 6, 150, '#efe6cc'], [4, -4, 170, '#e6ddc2'], [20, 8, 140, '#f2ead6']]) { const a = [s * (dx - 30), dy + 50], b = [s * (dx + 30), dy - L + 50];
      line(g, [a, b], 25, INK); line(g, [a, b], 20, c); line(g, [lerp(a, b, 0.05), lerp(a, b, 0.95)], 4, 'rgba(255,255,255,0.45)'); cel(g, ellP(b[0], b[1], 10, 6, s * 0.4), lt(c, 0.2), 2, 0, 0, 0); g.beginPath(); g.ellipse(b[0], b[1], 4, 2.4, s * 0.4, 0, TAU); g.strokeStyle = 'rgba(120,100,80,0.6)'; g.lineWidth = 1.2; g.stroke(); }
    line(g, [[-s * 34, -8], [s * 36, -26]], 5, '#b8323a'); },
  scroll: (g, op = {}) => { const L = op.scrollLen ?? 260, t = op.t || 0, W = 62, y0 = -8, y1 = y0 + L, sw = Math.sin(t * 0.13) * 4;
    const pp = new Path2D(); pp.moveTo(-W, y0); pp.lineTo(W, y0); pp.quadraticCurveTo(W + sw * 0.5, (y0 + y1) / 2, W + sw, y1); pp.lineTo(-W + sw, y1); pp.quadraticCurveTo(-W + sw * 0.5, (y0 + y1) / 2, -W, y0); pp.closePath();
    cel(g, pp, '#f2e8cc', 3.4, 8, 4, 3); g.save(); g.clip(pp);
    for (let y = y0 + 22, i = 0; y < y1 - 40; y += 15, i++) { scrawl(g, -W + 12, -4 - (i % 3) * 8, y, i + 2, 'rgba(50,40,70,0.65)', 1.6); scrawl(g, W - 38, W - 12, y, i + 9, 'rgba(50,40,70,0.75)', 1.8); g.fillStyle = 'rgba(160,130,90,0.25)'; g.fillRect(-W, y + 6, 2 * W, 1); }
    if (L > 90) { const yt = y1 - 28; line(g, [[-W + 10, yt - 8], [W - 10, yt - 8]], 2.6, '#b8323a'); scrawl(g, -W + 14, -10, yt + 6, 3, 'rgba(50,40,70,0.9)', 2.6); scrawl(g, W - 50, W - 10, yt + 6, 5, '#b8323a', 3.4);
      line(g, [[W - 54, yt + 16], [W - 6, yt + 16]], 2, '#b8323a'); line(g, [[W - 54, yt + 20], [W - 6, yt + 20]], 2, '#b8323a'); g.beginPath(); g.ellipse(W - 30, yt + 6, 30, 14, -0.1, 0, TAU); g.lineWidth = 2.4; g.strokeStyle = 'rgba(184,50,58,0.85)'; g.stroke(); }
    g.restore(); cel(g, ellP(sw, y1, W + 4, 9), '#e2d4b0', 3, 4, 3, 0); // bottom curl
    const rd = new Path2D(); rd.roundRect(-W - 10, y0 - 9, 2 * W + 20, 16, 7); cel(g, rd, '#8a5a34', 3, 4, 3, 2); for (const sd of [-1, 1]) cel(g, ellP(sd * (W + 14), y0 - 1, 8, 10), '#d8b048', 2.4, 2, 2, 0); },
  ledger: (g) => { const s = HSIDE; g.save(); g.translate(-s * 34, -78); g.scale(1.2, 1.2); g.rotate(-s * 0.06); const cv = new Path2D(); cv.roundRect(-84, -54, 168, 104, 5); cel(g, cv, '#6a2a2e', 3.6, 6, 4, 2);
    for (const sd of [-1, 1]) { const pg = new Path2D(); pg.rect(sd > 0 ? 2 : -78, -46, 76, 88); cel(g, pg, '#f2ead2', 2, sd * 4, 2, 0); g.save(); g.clip(pg); g.strokeStyle = 'rgba(80,110,160,0.4)'; g.lineWidth = 1; for (let y = -38; y < 42; y += 9) { g.beginPath(); g.moveTo(-80, y); g.lineTo(80, y); g.stroke(); }
      g.strokeStyle = 'rgba(184,60,60,0.5)'; g.beginPath(); g.moveTo(sd * 54, -46); g.lineTo(sd * 54, 42); g.stroke(); for (let i = 0; i < 8; i++) scrawl(g, sd > 0 ? 8 : -72, sd > 0 ? 44 : -24, -36 + i * 9 + 3, i + sd * 3, 'rgba(50,40,70,0.7)', 1.4); g.restore(); }
    taper(g, [[0, -46], [0, 42]], 2.4, 'rgba(70,40,40,0.6)', 0.2); g.restore(); },
  abacus: (g) => { const s = HSIDE; g.save(); g.translate(-s * 20, -58); const fr = new Path2D(); fr.roundRect(-62, -48, 124, 92, 5); fr.roundRect(-52, -38, 104, 72, 3); cel(g, fr, '#7a4a28', 3.2, 5, 4, 2);
    for (let r = 0; r < 5; r++) { const y = -28 + r * 14.5; line(g, [[-52, y], [52, y]], 1.6, '#c8b088'); for (let b = 0; b < 7; b++) { const x = (b < 3 + (r % 3) ? -44 + b * 11 : 2 + b * 7); cel(g, ellP(x, y, 5, 6), r % 2 ? '#c84a3a' : '#f0e2c2', 1.4, 0, 0, 0); } }
    g.restore(); },
  shovel: (g) => { const s = HSIDE, a = [s * 6, -150], b = [-s * 8, 520]; line(g, [a, b], 16, INK); line(g, [a, b], 10, '#a8784a'); line(g, [lerp(a, b, 0.02), lerp(a, b, 0.9)], 2.4, 'rgba(255,230,190,0.4)');
    cel(g, ellP(a[0], a[1] - 6, 16, 9), '#8a5a34', 2.6, 2, 2, 0);
    const bl = new Path2D(); bl.moveTo(b[0] - 30, b[1] - 10); bl.lineTo(b[0] + 30, b[1] - 10); bl.quadraticCurveTo(b[0] + 34, b[1] + 60, b[0], b[1] + 92); bl.quadraticCurveTo(b[0] - 34, b[1] + 60, b[0] - 30, b[1] - 10); bl.closePath(); cel(g, bl, '#8c8c98', 3.2, 6, 4, 3);
    taper(g, [[b[0] - 12, b[1] + 4], [b[0] - 10, b[1] + 60]], 3, 'rgba(255,255,255,0.45)', 0.3); g.fillStyle = 'rgba(120,80,40,0.55)'; g.beginPath(); g.ellipse(b[0], b[1] + 70, 18, 12, 0, 0, TAU); g.fill(); },
  basket: (g) => { const s = HSIDE; g.save(); g.translate(s * 8, 70); const bc = '#c8a060';
    for (const sd of [-1, 1]) { const hdl = [[sd * 40, -30], [sd * 26, -74], [sd * 6, -78]]; taper(g, hdl, 9, INK, 0.9); taper(g, hdl, 5.5, '#a87a40', 0.9); }
    cel(g, smooth([[-48, -26], [0, -46], [48, -26], [42, 10], [0, 22], [-42, 10]], 5), '#8a5a34', 3, 4, 3, 0); // earth heaped inside
    const bk = new Path2D(); bk.moveTo(-58, -26); bk.quadraticCurveTo(0, -14, 58, -26); bk.quadraticCurveTo(54, 40, 0, 50); bk.quadraticCurveTo(-54, 40, -58, -26); bk.closePath();
    cel(g, bk, bc, 3.4, 8, 5, 3, (h) => { h.strokeStyle = 'rgba(110,70,30,0.55)'; h.lineWidth = 2; for (let y = -20; y < 50; y += 9) { h.beginPath(); h.moveTo(-60, y); h.quadraticCurveTo(0, y + 10, 60, y); h.stroke(); } for (let x = -60; x < 60; x += 12) { h.beginPath(); h.moveTo(x, -24); h.lineTo(x * 0.7, 50); h.stroke(); } });
    g.restore(); },
  pennant: (g, op = {}) => { const s = HSIDE, t = op.t || 0, a = [0, 30], b = [s * 8, -190]; line(g, [a, b], 9, INK); line(g, [a, b], 5, '#8a5a34'); cel(g, ellP(b[0], b[1] - 4, 6, 6), '#e0b84a', 1.8, 0, 0, 0);
    const wv = (u) => Math.sin(t * 0.35 - u * 4) * 10 * u, pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([b[0] + s * u * 120, b[1] + 6 + u * 26 + wv(u)]); } for (let i = 8; i >= 0; i--) { const u = i / 8; pts.push([b[0] + s * u * 120, b[1] + 56 - u * 24 + wv(u)]); }
    const pp = polyPath(pts); cel(g, pp, '#c8323c', 2.8, 4, 3, 2); g.save(); g.clip(pp); g.fillStyle = '#f4f0e6'; g.beginPath(); for (let i = 0; i <= 8; i++) { const u = i / 8; g.lineTo(b[0] + s * u * 120, b[1] + 25 + u * 3 + wv(u)); } for (let i = 8; i >= 0; i--) { const u = i / 8; g.lineTo(b[0] + s * u * 120, b[1] + 37 - u * 3 + wv(u)); } g.fill(); g.restore(); },
  lantern: (g, op = {}) => { const lit = clamp(op.lit ?? 0, 0, 1), br = '#c89a3a', y0 = 34;
    if (lit > 0) { const gl = g.createRadialGradient(0, y0 + 64, 0, 0, y0 + 64, 170); gl.addColorStop(0, `rgba(255,236,170,${0.75 * lit})`); gl.addColorStop(0.35, `rgba(255,196,90,${0.35 * lit})`); gl.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = gl; g.beginPath(); g.arc(0, y0 + 64, 170, 0, TAU); g.fill(); }
    const bail = arcPts(0, y0 + 10, 30, Math.PI * 1.05, Math.PI * 1.95, 10, 42); taper(g, bail, 6, INK, 0.9); taper(g, bail, 3, br, 0.9);
    cel(g, polyPath([[-22, y0 + 4], [22, y0 + 4], [30, y0 + 24], [-30, y0 + 24]]), br, 2.8, 4, 3, 2); cel(g, ellP(0, y0 + 2, 9, 5), dk(br, 0.85), 2, 0, 0, 0);
    const gp = smooth([[-24, y0 + 26], [24, y0 + 26], [32, y0 + 64], [24, y0 + 102], [-24, y0 + 102], [-32, y0 + 64]], 6); g.fillStyle = lit > 0 ? `rgba(255,${Math.round(220 + 30 * lit)},${Math.round(160 + 60 * lit)},${0.45 + 0.45 * lit})` : 'rgba(200,225,240,0.45)'; g.fill(gp); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(gp);
    if (lit > 0) { const fk = 1 + 0.12 * Math.sin((op.t || 0) * 1.7); g.beginPath(); g.ellipse(0, y0 + 70 - 8 * fk, 7 * lit, 15 * lit * fk, 0, 0, TAU); g.fillStyle = '#ffd860'; g.fill(); g.beginPath(); g.ellipse(0, y0 + 74 - 6 * fk, 3.4 * lit, 8 * lit * fk, 0, 0, TAU); g.fillStyle = '#fffbe8'; g.fill(); }
    for (const x of [-14, 0, 14]) line(g, [[x * 1.2, y0 + 28], [x * 1.4, y0 + 100]], 2.4, mixc(br, INK, 0.3)); taper(g, [[-18, y0 + 40], [-20, y0 + 84]], 3, 'rgba(255,255,255,0.6)', 0.3);
    cel(g, polyPath([[-28, y0 + 100], [28, y0 + 100], [24, y0 + 118], [-24, y0 + 118]]), br, 2.8, 4, 3, 2); },
  mallet: (g) => { const s = HSIDE, a = [-s * 2, 26], b = [s * 10, -70]; line(g, [a, b], 13, INK); line(g, [a, b], 8, '#b08050'); g.save(); g.translate(b[0], b[1]); g.rotate(s * 0.12); const hd = new Path2D(); hd.roundRect(-44, -22, 88, 40, 12); cel(g, hd, '#a8703e', 3.4, 6, 4, 3, (h) => { h.strokeStyle = 'rgba(90,50,20,0.35)'; h.lineWidth = 1.4; for (let y = -16; y < 18; y += 7) { h.beginPath(); h.moveTo(-44, y); h.lineTo(44, y + 2); h.stroke(); } }); g.restore(); },
});
export function ovLight(op = {}) { // [TEDDY-cast] scene light state (was inline in oddverra)
  { const ld = op.lightDir == null ? -1 : clamp(+op.lightDir || 0, -1, 1); let sx = -ld; if (Math.abs(sx) < 0.35) sx = sx >= 0 ? 0.35 : -0.35; SX = sx; SG = sx >= 0 ? 1 : -1;
    const amb = typeof op.ambient === 'number' ? clamp(op.ambient, 0, 1) : typeof op.ambient === 'string' ? lum(op.ambient) : 0.5, ak = clamp(1.25 - amb * 0.5, 0.75, 1.25);
    SH_ = mixc('#ffffff', SHADE, ak); SHS_ = mixc('#ffffff', SHADE_SKIN, ak);
    const rc = op.rimCol ? mixc('#7a8eff', op.rimCol, 0.35) : '#7a8eff'; RIMC = rgba(rc, 0.7); RIMC2 = rgba(rc, 0.34);
    KEYT = op.keyCol ? mixc('#ffffff', op.keyCol, 0.22) : null; FAR = 0; }
}
// [TEDDY-cast] helpers for bear.js
export const OVH = { HOLD, BROWS, LIDS, SMILEY, get HSIDE() { return HSIDE; } }; // [KCH-cast] prop / face tables for ketchup_cast.js
export const OVK = { cel, line, taper, cr, polyPath, smooth, ellP, limb, arcPts, mixc, lt, dk, rgba, lum, clamp, hsh, twill, SHADE, SHADE_SKIN, get SX() { return SX; }, get SG() { return SG; } };
export function oddverra(g, o, op = {}) {
  const { expr = 'smile', blink = 0, wave, cheer } = op;
  if (op.scuba && !o.scuba) o = { ...o, scuba: true, shirt: o.suitCol || '#1f2a3c', pants: o.suitCol || '#1f2a3c', hat: undefined, fatigue: false, boots: false, belt: undefined, noButtons: true, cuff: o.suitCol || '#1f2a3c', neck: undefined, pattern: undefined }; // [CASTRO-cast] diver mode
  if (op.slump) o = { ...o, stoop: (o.stoop || 0) + 2.4 }; if (op.shake) op = { ...op, headYaw: (op.headYaw || 0) + 0.42 * Math.sin((op.t || 0) * 0.55) * op.shake }; // [LIB-cast]
  // ---------- scene light ----------
  ovLight(op); // [TEDDY-cast] (same light setup, shared with bear.js)
  const B = BUILD[o.build || 'adult'] || BUILD.adult, HD = HEADS[o.head || 'round'] || HEADS.round;
  const skin = o.skin || '#f6c9a4', cx = 300, sole = 965, mode = op.mode || 'stand', ph = op.phase || 0, TT = op.t || 0;
  // ---------- view ----------
  let [dv, av, bk] = VIEWS[op.view] || [0, 0, 0];
  if (typeof op.view === 'number') { dv = Math.sign(op.view); av = Math.min(1, Math.abs(op.view)); bk = 0; }
  if (op.drive) { av *= 0.3; bk = 0; }
  // yaw: 0 = facing the camera, ±π/2 = profile, π = seen from behind ('back', '34BL', '34BR')
  const yb = av <= 0.55 ? av / 0.55 * 0.62 : 0.62 + (av - 0.55) / 0.45 * (HP_ - 0.62), hb = av <= 0.55 ? av / 0.55 * 0.5 : 0.5 + (av - 0.55) / 0.45 * (HP_ - 0.5);
  const PHI = bk ? (dv ? dv * (Math.PI - yb) : Math.PI) : dv * yb, SN = Math.sin(PHI), CS = Math.cos(PHI), AS = Math.abs(SN);
  const HY = bk ? (dv ? dv * (Math.PI - hb) : Math.PI) : dv * hb + (op.headYaw || 0) /* [LIB-cast] */, AH = Math.abs(Math.sin(HY));
  const BACKB = CS < -0.15, BACKH = Math.cos(HY) < -0.05, BAL = Math.PI - Math.abs(HY); // body / head seen from behind; BAL: head turn away from the back
  const turned = AS > 0.2, PK = 0.09, wk = Math.sqrt(CS * CS + 0.64 * SN * SN);
  const P3 = (x, y, z) => [cx + x * CS + z * SN, y + (-x * SN + z * CS) * PK];
  const dep = (x, z) => -x * SN + z * CS;
  // ---------- gait ----------
  const gaitOn = mode === 'run' && !op.drive, RUN = gaitOn && (op.gait ? op.gait === 'run' : true);
  const MV = gaitOn ? 1 : (op.drive || mode === 'sit') ? 0.6 : 0.3;
  const ank = sole - 26, legL = 250 * B.leg, L1 = (legL + 6) * 0.5;
  const LK = o.lashes && !o.bib ? 0.55 : 1; // long skirts: shorter, lower steps
  const GA = gaitOn ? clamp(op.gaitAmt ?? 1, 0, 1) : 0; // stride amplitude (eases to standing when an actor stops)
  const legAng = (p) => { p = fr1(p); const A = (RUN ? 0.6 : 0.36) * LK * GA; return [A * Math.cos(TAU * p) + (RUN ? 0.1 : 0) * GA, 0.05 + GA * ((RUN ? 0.3 : 0.14) * bump(p, 0, 0.3) + (RUN ? 1.75 * bump(p, 0.4, 0.97) : (0.22 * sstep(0.34, 0.5, p) * (p < 0.5 ? 1 : 0) + 0.95 * bump(p, 0.46, 1.0)) * LK))]; };
  const legOff = (p) => { const [th, ka] = legAng(p); return [L1 * Math.cos(th) + L1 * Math.cos(th - ka), L1 * Math.sin(th) + L1 * Math.sin(th - ka)]; }; // [down, forward]
  const bobAt = (p) => gaitOn ? (legL + 6 - Math.max(legOff(p)[0], legOff(p + 0.5)[0])) * (RUN ? 0.6 : 1) - (RUN ? 6 * Math.max(0, Math.sin(TAU * 2 * (p + 0.2))) : 0) : 0;
  const bob = bobAt(ph), headBob = gaitOn ? bobAt(ph - 0.07) - bob + (RUN ? 2 : 1.2) : 0;
  const hipY = ank - legL * (mode === 'sit' ? 0.42 : 1) + bob, torsoH = 236 * B.h, shY = hipY - torsoH, TW = 84 * B.w;
  const WW = TW * (B.belly ? 1.02 : 0.8), HPW = TW * (B.belly ? 0.96 : 0.86), waistY = shY + torsoH * 0.6;
  const HW = HD.W * B.hs, HH = HD.H * B.hs, fz = HH / 100, hy = shY - 2 - HH * HD.a[HD.a.length - 1][1] + (o.build === 'old' ? 10 : 0) + headBob + 8 * (o.stoop || 0); // [EIN-cast] stoop
  const NW = 21 * Math.sqrt(B.w) * B.hs, AL = 100 * B.arm, ra = 14.5 * Math.sqrt(B.w) * (o.build === 'kid' ? 0.9 : 1);
  const runner = !!o.bib, lady = !!o.lashes && !runner && !o.pj, /* [TEDDY-cast] pj kids */ kidT = (o.build === 'kid' && !o.hoodie) /* [KCH-cast] */ || (!!o.stripe && !runner);
  const jacket = !runner && !lady && !kidT && (!!o.hunt /* [TEDDY-cast] */ || o.neck === 'tie' || o.neck === 'scarf' || o.pattern === 'tweed' || o.pattern === 'pinstripe' || o.pattern === 'plaid');
  const shortSleeve = runner || (kidT && !o.pj) || !!o.short || !!o.rolled; // [TEDDY-cast] pj = long sleeves, rolled = rolled to the elbow
  const hemY = o.galabiya ? ank - 34 /* [LIB-cast] */ : o.cardigan ? hipY + 26 /* [EIN-cast] cardigan */ : o.hunt ? hipY + (o.huntLong ? 96 : 40) /* [TEDDY-cast] */ : o.coat ? hipY + 128 : o.fatigue ? waistY + 24 : o.guayabera ? hipY + 10 : o.track ? hipY - 6 : runner ? hipY - 28 : jacket ? hipY + 34 : lady ? waistY + 14 : hipY - 4; // [CASTRO-cast] coat / fatigues / guayabera / track hems
  const hs = op.stance === 'relaxed' && !gaitOn ? 10 : 0;
  const lean = gaitOn ? (RUN ? 0.15 : 0.055) * GA : 0;
  const upper = () => { if (lean && SN) g.transform(1, 0, -lean * SN, 1, lean * SN * hipY, 0); };
  const flap = gaitOn ? Math.sin(TAU * 2 * (ph - 0.12)) * GA : 0; // secondary lag (twice per stride)
  const trail = gaitOn ? -SN * (RUN ? 1 : 0.55) * GA : 0; // clothes/hair trail opposite to facing
  // ---------- torso surface map (elliptic cylinder, depth 0.62 × width) ----------
  const Wat = (y) => y < waistY ? TW + (WW - TW) * clamp((y - shY - 40) / (waistY - shY - 40), 0, 1) : WW + (HPW - WW) * clamp((y - waistY) / Math.max(1, hipY - waistY), 0, 1);
  const tX = (x, y) => { if (!turned && !SN) return x; const W = Wat(y), D = W * 0.8 + (B.belly && y > shY + 60 ? TW * 0.12 : 0), u = (x - cx) / W, e = Math.abs(u) > 1 ? (Math.abs(x - cx) - W) * Math.sign(u) : 0, a = Math.asin(clamp(u, -1, 1));
    return cx + W * Math.sin(a) * CS + D * Math.cos(a) * SN + e * CS; };
  const tV = (x, y) => { const W = Wat(y), a = Math.asin(clamp((x - cx) / W, -1, 1)); return -W * Math.sin(a) * SN + W * 0.8 * Math.cos(a) * CS; };
  const TP = (pts) => pts.map(([x, y]) => [tX(x, y), y]);
  const tXb = (x, y) => { const W = Wat(y), D = W * 0.8 + (B.belly && y > shY + 60 ? TW * 0.12 : 0), u = (x - cx) / W, a = Math.asin(clamp(u, -1, 1)); return cx - W * Math.sin(a) * CS - D * Math.cos(a) * SN; };
  const TPb = (pts) => pts.map(([x, y]) => [tXb(x, y), y]);
  const decal = (x0, y0, fn) => { if (tV(x0, y0) < -2) return; const X = tX(x0, y0), sx = clamp((tX(x0 + 2, y0) - tX(x0 - 2, y0)) / 4, 0.18, 1.2); g.save(); g.translate(X, 0); g.scale(sx, 1); g.translate(-x0, 0); fn(); g.restore(); };
  const fcx = tX(cx, shY + 60); // front centre line
  // ---------- head geometry ----------
  const hcx = cx + SN * (8 + 16 * (o.stoop || 0)), ncx = cx - SN * 6; // [EIN-cast] o.stoop: head forward
  const rH = (yf) => { const A = HD.a; if (yf <= A[0][1]) return 0.05; for (let i = 0; i < A.length - 1; i++) if (yf <= A[i + 1][1]) { const t = (yf - A[i][1]) / (A[i + 1][1] - A[i][1]); return A[i][0] + (A[i + 1][0] - A[i][0]) * t; } return 0.05; };
  const hmapPt = ([px, py]) => { if (!HY || BACKH) return [px, py]; const yf = (py - hy) / HH, r = Math.max(0.14, rH(clamp(yf, -1, 1))) * HW, xr = px - hcx; let u = xr / r, e = 0;
    if (Math.abs(u) > 1) { e = xr - Math.sign(u) * r; u = Math.sign(u); } const t = Math.asin(u) + HY, tc = clamp(t, -HP_, HP_); return [hcx + r * Math.sin(tc) + e * Math.abs(Math.sin(tc)), py]; };
  const HMP = (pts) => pts.map(hmapPt);
  // ---------- [CASTRO-cast] new features: beard (full / patchy / none + op.beardLoss), boots, fins, patrol cap, straw hat, headphones,
  // fatigues / guayabera / track / wetsuit / lab-coat details, goggles, dive mask, mouth cigar. Called from the hooks marked [CASTRO-cast].
  const BRD = op.beard ?? o.beard, BRDC = o.beardCol || o.moustache || o.hairCol || '#2a201c';
  const BLOSS = clamp(op.beardLoss ?? o.beardLoss ?? (BRD === 'patchy' ? 0.55 : 0), 0, 1);
  // beard = union of tufts on a shell around the jaw: [face-y (head units, 100 = chin), |angle| from, to (rad from the face centre), tuft radius]
  const BLV = [[16, 1.12, 1.42, 10], [30, 1.0, 1.48, 12.5], [44, 0.82, 1.5, 14.5], [58, 0.6, 1.72, 15.5], [72, 0, 1.9, 16.5], [87, 0, 2.0, 17.5], [102, 0, 1.5, 17.5], [116, 0, 0.8, 15.5], [127, 0, 0.36, 12.5]];
  const beardBlobs = (back) => { const w = HW / fz, out = []; let i = 0;
    const R = (Y) => Y <= 80 ? Math.max(0.3, rH(Y / 100)) * w : rH(0.8) * w + (0.3 * w - rH(0.8) * w) * clamp((Y - 80) / 48, 0, 1);
    for (const [Y, t0, t1, rad] of BLV) { const ths = []; if (o.beardShort && Y > 104) continue; // [TEDDY-cast] short trimmed beard
      if (!t0) { const m = Math.max(1, Math.round(t1 / 0.27)); for (let k = -m; k <= m; k++) ths.push(t1 * k / m); }
      else { const n = Math.max(1, Math.round((t1 - t0) / 0.24)); for (const s of [-1, 1]) for (let k = 0; k <= n; k++) ths.push(s * (t0 + (t1 - t0) * k / n)); }
      for (const th of ths) { i++; const j = hsh(i, 2.3) - 0.5, t = th + HY, c = Math.cos(t); if (kchBeardSkip(Y, th)) continue; /* [KCH-cast] */
        if (back ? (Math.abs(th) < 0.8 || Y > 100) : c < -0.12) continue;
        out.push({ i, x: hcx + (R(Y) + 4 + 3 * Math.cos(th)) * Math.sin(t) * fz, y: hy + (Y + j * 4) * fz, r: rad * (o.beardK || 1) * (1 + j * 0.22) * fz, c, Y, th }); } }
    return out; };
  const drawBeard = (back) => { if (!BRD || BRD === 'none') return; const pk = BLOSS > 0.01;
    if (o.beardShort) { if (back) return; const R0 = (pts) => HMP(pts.map(([x, y]) => [hcx + x * HW, hy + y * HH])); // [TEDDY-cast] close-trimmed beard: one smooth band along the jaw
      const outer = [[0.97, -0.02], [1.02, 0.36], [0.88, 0.72], [0.54, 0.98], [0.2, 1.07], [0, 1.09]], inner = [[0.86, 0.02], [0.83, 0.36], [0.62, 0.6], [0.32, 0.7], [0, 0.72]];
      const P = new Path2D(); polyPath(R0(cr([...outer, ...outer.slice(0, -1).reverse().map(([x, y]) => [-x, y]), ...inner.map(([x, y]) => [-x, y]), ...inner.slice(0, -1).reverse()], true, 4)), P);
      cel(g, P, BRDC, 2.6, HW * 0.08, HH * 0.05, 4); g.save(); g.clip(P); const sc = mixc(BRDC, INK, lum(BRDC) > 0.6 ? 0.3 : 0.45);
      for (let i = 0; i < 70; i++) { const u = hsh(i, 3.1) * 2 - 1, v = 0.1 + hsh(i, 5.7) * 1.05, [X, Y] = hmapPt([hcx + u * HW, hy + v * HH]); taper(g, [[X, Y], [X + u * 3 * fz, Y + 6 * fz]], 1.3, sc, 0.2); }
      g.restore(); return; }
    const bl = beardBlobs(back).filter((b) => hsh(b.i, 7.1) >= BLOSS * (b.Y > 64 ? 1.05 : 0.85)).map((b) => pk ? { ...b, r: b.r * (0.72 + 0.2 * hsh(b.i, 4.4)) } : b); if (!bl.length) return;
    const P = new Path2D(); for (const b of bl) ellP(b.x, b.y, b.r * 1.06, b.r, 0, P);
    cel(g, P, BRDC, 3.0, HW * 0.1, HH * 0.07, 5);
    g.save(); g.clip(P); const sc = mixc(BRDC, INK, lum(BRDC) > 0.6 ? 0.3 : 0.45), hl = lt(BRDC, lum(BRDC) > 0.6 ? 0.5 : 0.3);
    for (const b of bl) { if (b.c < 0.05 && !back) continue; const a0 = 0.3 + hsh(b.i, 5) * 0.6; taper(g, arcPts(b.x - SG * b.r * 0.12, b.y + b.r * 0.05, b.r * 0.58, a0, a0 + 2.1, 6), 1.5, sc, 0.2); }
    for (const b of bl) if ((b.x - hcx) * SG < HW * 0.2 && b.Y < 104) taper(g, arcPts(b.x + SG * b.r * 0.1, b.y - b.r * 0.05, b.r * 0.62, 3.7, 4.7, 4), 2.2, rgba(hl, 0.55), 0.2);
    g.restore();
    if (pk && !back && op.falling !== false) for (let k = 0; k < 4; k++) { const fy = ((TT * 1.6 + k * 47) % 190) / 190, x = hcx + (hsh(k, 3.3) - 0.5) * HW * 1.3 + Math.sin(TT * 0.12 + k * 2) * 10 * fz, y = hy + HH * (1.15 + fy * 1.4);
      g.save(); g.globalAlpha = Math.min(1, (1 - fy) * 3); g.translate(x, y); g.rotate(Math.sin(TT * 0.1 + k) * 0.8); const tp = new Path2D(); for (const [dx, dy, rr] of [[-5, 0, 6], [3, -3, 5], [5, 4, 4.5]]) ellP(dx * fz, dy * fz, rr * fz, rr * fz * 0.85, 0, tp); cel(g, tp, BRDC, 2, 2, 2, 0); g.restore(); } };
  const drawStubble = () => { if (!BRD || (BRD !== 'none' && BLOSS < 0.01)) return; const P = new Path2D(); for (const b of beardBlobs(false)) if (b.Y < 110) ellP(b.x, b.y, b.r * 0.95, b.r * 0.9, 0, P);
    for (const s of [-1, 1]) { const [X] = hmapPt([hcx + s * HW * 0.16, hy + HH * 0.42]); ellP(X, hy + HH * 0.42, HW * 0.18 * (1 - 0.4 * AH), HH * 0.07, 0, P); }
    g.save(); g.clip(headSil); g.clip(P); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(176,160,206,0.55)'; g.fill(P); g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(60,44,90,0.32)'; for (let i = 0; i < 160; i++) { const x = hcx + (hsh(i, 8.1) - 0.5) * HW * 2.1, y = hy + HH * (0.1 + hsh(i, 9.3) * 1.0); g.fillRect(x, y, 1.8, 1.8); } g.restore(); };
  const bootShaft = (L) => { const KN = o.boots === 'knee' || o.boots === 'leggings', LG = o.boots === 'leggings'; /* [TEDDY-cast] knee boots / leather leggings */
    const top = lerp(L.K, L.A, KN ? 0.0 : 0.4), bc = LG ? (o.leggCol || '#9a6a3a') : o.shoes || '#221c22', bw0 = KN ? 0.82 : 0.74, bp = limb([top, lerp(top, L.A, 0.5), [L.A[0], L.A[1] + 4]], [rl * bw0, rl * (KN ? 0.74 : 0.7), rl * 0.7]);
    cel(g, bp, bc, 2.6, 5, 4, 2); taper(g, [lerp(top, L.A, 0.15), lerp(top, L.A, 0.85)], KN ? 4 : 2.5, 'rgba(255,255,255,0.22)', 0.2);
    if (LG) for (let k = 0; k < 3; k++) { const q = lerp(top, L.A, 0.22 + k * 0.27); line(g, [[q[0] - rl * 0.75, q[1] - 3], [q[0] + rl * 0.75, q[1] + 3]], 5, INK); line(g, [[q[0] - rl * 0.72, q[1] - 3], [q[0] + rl * 0.72, q[1] + 3]], 2.6, mixc(bc, '#2a1a10', 0.5)); cel(g, ellP(q[0] + L.s * rl * 0.35, q[1] + L.s * 1.5, 4, 3.4), '#d8b860', 1.4, 0, 0, 0); }
    else if (KN) taper(g, [[top[0] - rl * 0.8, top[1] + 10], [top[0], top[1] + 14], [top[0] + rl * 0.8, top[1] + 10]], 1.8, mixc(bc, '#ffffff', 0.25), 0.2);
    else for (let k = 1; k <= 3; k++) { const q = lerp(top, L.A, 0.2 + k * 0.18); line(g, [[q[0] - rl * 0.3, q[1] - 2], [q[0] + rl * 0.3, q[1] + 2]], 1.4, '#6a5a52'); }
    cel(g, smooth([[top[0] - rl * 0.95, top[1] - 12], [top[0] + rl * 0.95, top[1] - 12], [top[0] + rl * 0.88, top[1] + 5], [top[0], top[1] + 9], [top[0] - rl * 0.88, top[1] + 5]], 4), pantsCol, 2.4, 4, 3, 0, twill(pantsCol)); // bloused trouser over the boot top
    taper(g, [[top[0] - rl * 0.5, top[1] - 4], [top[0] - rl * 0.3, top[1] + 4]], 1.4, crc, 0.2); taper(g, [[top[0] + rl * 0.4, top[1] - 6], [top[0] + rl * 0.2, top[1] + 4]], 1.4, crc, 0.2); };
  const fin = (L) => { const s = L.s, toe = turned ? dv : s, fx = L.A[0], fy = L.fy, fc = o.finCol || '#2a8a9a', len = turned ? 34 + 92 * AS : 74, wd = turned ? 36 - 14 * AS : 40;
    const fp = turned ? smooth([[fx - toe * 20, fy - 14], [fx + toe * 14, fy - 12], [fx + toe * (14 + len), fy + 4], [fx + toe * (18 + len), fy + 14], [fx + toe * 6, fy + 14], [fx - toe * 22, fy + 8]], 5)
      : smooth([[fx - 17, fy - 12], [fx + 17, fy - 12], [fx + wd, fy + len * 0.5], [fx + wd * 0.8, fy + len * 0.62], [fx, fy + len * 0.5], [fx - wd * 0.8, fy + len * 0.62], [fx - wd, fy + len * 0.5]], 5);
    cel(g, fp, fc, 3.0, 6, 5, 3); g.save(); g.clip(fp); g.strokeStyle = 'rgba(20,50,60,0.4)'; g.lineWidth = 1.6; for (const k of [-0.5, 0.5]) { g.beginPath(); if (turned) { g.moveTo(fx + toe * 14, fy + k * 6); g.lineTo(fx + toe * (14 + len), fy + 8 + k * 8); } else { g.moveTo(fx + k * 14, fy); g.lineTo(fx + k * wd * 1.4, fy + len * 0.5); } g.stroke(); } g.restore();
    cel(g, smooth([[fx - 17, fy - 16], [fx + 17, fy - 16], [fx + 18, fy + 2], [fx - 18, fy + 2]], 4), '#1a1e26', 2.6, 4, 3, 0); };
  // generic visor (half disc at the brow, turns with the head): ext = forward reach (× HW), droop = downward pitch
  const visorAt = (hk, vy, Rr, ext, droop) => { const pv = 0.1 * Math.cos(HY) + 0.1, VY = clamp(HY * 1.4, -HP_, HP_), hs2 = Math.sin(VY), hc2 = Math.cos(VY), Pv = (lat, fw) => [hcx - SN * 4 * fz + lat * hc2 + fw * hs2, vy + (-lat * hs2 + fw * hc2) * pv + fw * droop];
    const vp = []; for (let k = 0; k <= 12; k++) { const a = Math.PI * k / 12; vp.push(Pv(Rr * Math.cos(a), Rr * 0.7 * Math.sin(a) + HW * ext * Math.sin(a) ** 0.7)); }
    for (let k = 12; k >= 0; k--) { const a = Math.PI * k / 12; vp.push(Pv(Rr * Math.cos(a), Rr * 0.7 * Math.sin(a))); }
    cel(g, polyPath(vp), dk(hk, 0.8), 3.0, 5, 4, 2); taper(g, vp.slice(2, 11), 1.8, rgba(lt(hk, 0.35), 0.5), 0.1); };
  const PCUT = -0.38; // patrol cap brow line (head units)
  const patrolVisor = (hk) => visorAt(hk, hy + HH * (PCUT + 0.02), HW * 0.9, 0.3, 0.2);
  const patrolCap = () => { const hk = o.hatCol || '#4e5a32', bY = hy + HH * PCUT, Rc = HW * 1.06, Rt = HW * 0.98, ch = 70 * fz, pvb = 0.12, hx0 = hcx - SN * 4 * fz;
    const ring = (R, y, pv, p0, p1, n = 20) => Array.from({ length: n + 1 }, (_, i) => { const ps = p0 + (p1 - p0) * i / n; return [hx0 + R * Math.sin(ps), y + R * Math.cos(ps) * pv]; });
    const cp = polyPath([[hx0 - Rt, bY - ch], [hx0 + Rt, bY - ch], [hx0 + Rc, bY], ...ring(Rc, bY, pvb, HP_, -HP_), [hx0 - Rc, bY]]);
    cel(g, cp, hk, 3.6, HW * 0.16, 4, 5, twill(hk));
    const fc = mixc(hk, INK, 0.5); g.save(); g.clip(cp);
    taper(g, ring(Rc * 0.99, bY - 16 * fz, pvb, HP_ * 0.98, -HP_ * 0.98), 1.8, fc, 0.1); // band seam
    for (const a0 of [-1.15, 0, 1.15]) { const a = a0 + HY; if (Math.cos(a) < 0.08) continue; const X0 = hx0 + Rc * Math.sin(a), X1 = hx0 + Rt * Math.sin(a); taper(g, [[X1, bY - ch + 4], [X0, bY + Math.cos(a) * Rc * pvb - 2]], a0 ? 1.8 : 2.2, fc, 0.1); } // front + side seams
    taper(g, [[hx0 - SG * Rt * 0.72, bY - ch + 10], [hx0 - SG * Rc * 0.8, bY - 18 * fz]], 5, rgba(lt(hk, 0.4), 0.45), 0.3);
    g.restore();
    cel(g, polyPath(ring(Rt, bY - ch, 0.14, -Math.PI, Math.PI, 28)), mixc(hk, '#fff8ec', 0.1), 2.6, 0, 0, 0); // flat top
    if (!BACKH) patrolVisor(hk); };
  const strawHat = () => { const hk = o.hatCol || '#dcbc74', bY = hy - HH * 0.6, Rb = HW * 1.5, Rc = HW * 0.76, ch = 62 * fz, pv = 18 * fz / Rb, hx0 = hcx - SN * 4 * fz;
    const ring = (R, y, p, hf, p0, p1, n = 32) => Array.from({ length: n + 1 }, (_, i) => { const ps = p0 + (p1 - p0) * i / n; return [hx0 + R * Math.sin(ps), y + R * Math.cos(ps) * p + hf(ps - HY)]; });
    const curl = (q) => -6 * fz * Math.sin(q) ** 2 + 4 * fz * Math.cos(q) ** 2;
    const weave = (base) => (h) => { h.strokeStyle = 'rgba(120,80,20,0.28)'; h.lineWidth = 1.4; h.beginPath(); for (let x = -600; x < 1200; x += 8) { h.moveTo(x, 0); h.lineTo(x + 600, 600); h.moveTo(x + 600, 0); h.lineTo(x, 600); } h.stroke(); };
    const brim = polyPath(ring(Rb, bY, pv, curl, -Math.PI, Math.PI)); cel(g, brim, dk(hk, 0.9), 3.2, 6, 3, 3, weave(hk));
    const crown = polyPath([[hx0 - Rc, bY + 4], [hx0 - Rc * 0.9, bY - ch], [hx0 + Rc * 0.9, bY - ch], [hx0 + Rc, bY + 4]]); cel(g, crown, hk, 3.4, 10, 4, 4, weave(hk));
    cel(g, polyPath(ring(Rc * 0.9, bY - ch, 0.18, () => 0, -Math.PI, Math.PI, 20)), lt(hk, 0.12), 2.4, 0, 0, 0, weave(hk));
    const band = new Path2D(); band.rect(hx0 - Rc, bY - 20 * fz, Rc * 2, 14 * fz); g.save(); g.clip(crown); g.fillStyle = o.bandCol || '#3a2a24'; g.fill(band); g.restore();
    cel(g, polyPath([...ring(Rb, bY, pv, curl, -HP_, HP_), ...ring(Rc, bY, pv, () => 0, HP_, -HP_)]), hk, 3.0, 6, 3, 3, weave(hk)); taper(g, ring(Rb * 0.96, bY - 2, pv, curl, -HP_ * 0.8, HP_ * 0.8, 16), 1.6, rgba(lt(hk, 0.5), 0.5), 0.1); };
  const headphones = () => { const bc = o.phonesCol || '#2a2a32', ch2 = Math.cos(HY), top = hy - HH * 1.1;
    const band = Array.from({ length: 17 }, (_, i) => { const a = Math.PI * i / 16; return [hcx + HW * 1.06 * Math.cos(a) * ch2 - SN * 6 * fz, hy + HH * 0.02 - (hy + HH * 0.02 - top) * Math.sin(a) ** 0.8]; });
    line(g, band, 11, INK); line(g, band, 6.5, bc); line(g, band.slice(3, 9), 2, 'rgba(255,255,255,0.3)');
    for (const s of [-1, 1]) { const t = Math.asin(s) + HY, vis = Math.cos(t); if (vis < -0.25 && !BACKH) continue; const X = hcx + HW * 1.0 * Math.sin(clamp(t, -HP_, HP_)) - (AH > 0.8 ? dv * 8 * fz : 0), Y = hy + HH * 0.1, kx = 0.42 + 0.58 * Math.abs(Math.sin(t));
      cel(g, ellP(X, Y, 24 * fz * kx, 28 * fz), bc, 3, 4, 3, 2); cel(g, ellP(X + Math.sign(Math.sin(t) || s) * 3 * fz * kx, Y, 14 * fz * kx, 17 * fz), mixc(bc, '#6a6a7a', 0.4), 1.6, 2, 2, 0); } };
  const torsoExtras = () => { const fc = mixc(o.shirt, INK, 0.5);
    if (o.fatigue) { // tucked shirt + web belt (all views), chest pockets with pointed button flaps
      const by0 = hemY - 15; g.save(); g.clip(torsoP); const bp = new Path2D(); bp.rect(0, by0, 600, 16); cel(g, bp, o.belt || '#2e2a22', 0, 8, 0, 0); g.restore(); taper(g, TP([[cx - WW, by0], [cx, by0 + 1], [cx + WW, by0]]), 1.6, INK, 0.3);
      for (const k of [-0.6, -0.2, 0.3, 0.7]) taper(g, TP([[cx + k * WW, by0 - 14], [cx + (k + 0.05) * WW, by0 - 2]]), 1.6, fc, 0.1);
      if (!BACKB) { decal(cx + 4, by0, () => { const bk = new Path2D(); bk.roundRect(cx - 10, by0 - 1, 20, 17, 3); cel(g, bk, '#b8b0a0', 2, 3, 2, 0); g.lineWidth = 1.6; g.strokeStyle = '#5a5248'; g.strokeRect(cx - 5, by0 + 3, 10, 8); });
        for (const s of [-1, 1]) { const px = cx + s * TW * 0.46, py = shY + 48; if (tV(px, py) < -2) continue; decal(px, py, () => {
          const pp = new Path2D(); pp.roundRect(px - 19, py, 38, 44, 5); cel(g, pp, mixc(o.shirt, '#000000', 0.05), 1.8, 4, 3, 0, twill(o.shirt)); taper(g, [[px, py + 16], [px, py + 42]], 1.4, fc, 0.1);
          cel(g, polyPath([[px - 21, py - 4], [px + 21, py - 4], [px + 21, py + 10], [px, py + 17], [px - 21, py + 10]]), o.shirt, 2.2, 3, 3, 0, twill(o.shirt)); cel(g, ellP(px, py + 9, 3.6, 3.6), dk(o.shirt, 0.7), 1.4, 1, 1, 0); }); } } }
    if (o.guayabera && !BACKB) { // vertical pin-tuck pleats + four pockets
      for (const s of [-1, 1]) for (const k of [0.3, 0.38, 0.66, 0.74]) if (tV(cx + s * TW * k, shY + 80) > -3) taper(g, TP([[cx + s * TW * k, shY + 14], [cx + s * WW * k * 1.02, waistY], [cx + s * HPW * k, hemY - 4]]), 1.4, fc, 0.05);
      for (const s of [-1, 1]) for (const [py, ph] of [[shY + 62, 30], [hipY - 34, 34]]) { const px = cx + s * TW * 0.52; if (tV(px, py) < -2) continue; decal(px, py, () => { const pp = new Path2D(); pp.roundRect(px - 16, py, 32, ph, 3); g.lineWidth = 1.8; g.strokeStyle = fc; g.stroke(pp); line(g, [[px - 16, py + 7], [px + 16, py + 7]], 1.4, fc); cel(g, ellP(px, py + 11, 2.6, 2.6), '#f2ecdc', 1.2, 0, 0, 0); }); } }
    if (o.track) { // tracksuit jacket: centre zip, ribbed hem band (plain, no logos)
      g.save(); g.clip(torsoP); const hb = new Path2D(); hb.rect(0, hemY - 15, 600, 16); cel(g, hb, dk(o.shirt, 0.9), 0, 6, 0, 0); g.restore();
      if (!BACKB) { taper(g, TP([[cx, shY + 4], [cx, waistY], [cx, hemY]]), 2.6, mixc(o.shirt, '#d8d8e0', 0.55), 0.6); decal(cx, shY + 30, () => cel(g, polyPath([[cx - 3, shY + 22], [cx + 3, shY + 22], [cx + 4, shY + 40], [cx - 4, shY + 40]]), '#c8c8d0', 1.4, 0, 0, 0)); } }
    if (o.scuba) { // wetsuit: centre zip, side panels, knee pads are skipped
      for (const s of [-1, 1]) if (tV(cx + s * TW * 0.8, shY + 80) > -3) taper(g, TP([[cx + s * TW * 0.9, shY + 26], [cx + s * WW * 0.9, waistY], [cx + s * HPW * 0.9, hemY]]), 4, o.trimCol || '#3a8ac0', 0.6);
      if (!BACKB) taper(g, TP([[cx, shY + 4], [cx, waistY + 40]]), 2.4, '#8a92a8', 0.6); else taper(g, TPb([[cx, shY + 6], [cx, waistY + 30]]), 2.4, '#8a92a8', 0.6); }
    if (o.coat && !BACKB) { for (const s of [-1, 1]) { const px = cx + s * HPW * 0.62, py = hipY + 16; if (tV(px, py) > -2) decal(px, py, () => { const pp = new Path2D(); pp.roundRect(px - 20, py, 40, 38, 4); g.lineWidth = 2; g.strokeStyle = mixc(o.shirt, INK, 0.4); g.stroke(pp); }); }
      const px = cx + TW * 0.5, py = shY + 70; if (tV(px, py) > -2 && !o.frock /* [LIB-cast] */) decal(px, py, () => { for (const [dx, c] of [[-6, '#3a5ab0'], [4, '#c0453a']]) { line(g, [[px + dx, py - 16], [px + dx, py + 6]], 4.5, INK); line(g, [[px + dx, py - 16], [px + dx, py + 6]], 2.5, c); } const pp = new Path2D(); pp.roundRect(px - 16, py - 2, 32, 30, 3); g.fillStyle = o.shirt; g.fill(pp); g.lineWidth = 1.8; g.strokeStyle = mixc(o.shirt, INK, 0.4); g.stroke(pp); }); }
    if (o.hunt) { // [TEDDY-cast] Norfolk-style hunting jacket: box pleats, cloth belt, four bellows pockets with button flaps
      const hc0 = o.shirt, fc2 = mixc(hc0, INK, 0.5), pk = (px, py, w2, h2) => decal(px, py, () => { const pp = new Path2D(); pp.roundRect(px - w2, py, 2 * w2, h2, 5); cel(g, pp, mixc(hc0, '#000000', 0.04), 1.8, 4, 3, 0, twill(hc0)); taper(g, [[px - w2 + 4, py + h2 - 5], [px + w2 - 4, py + h2 - 5]], 1.2, fc2, 0.1);
        cel(g, polyPath([[px - w2 - 2, py - 4], [px + w2 + 2, py - 4], [px + w2 + 2, py + 11], [px, py + 16], [px - w2 - 2, py + 11]]), hc0, 2.2, 3, 3, 0, twill(hc0)); cel(g, ellP(px, py + 8, 3.6, 3.6), o.button || dk(hc0, 0.6), 1.4, 1, 1, 0); });
      if (!BACKB) { for (const s of [-1, 1]) if (tV(cx + s * TW * 0.4, shY + 80) > -3) taper(g, TP([[cx + s * TW * 0.4, shY + 22], [cx + s * WW * 0.42, waistY], [cx + s * HPW * 0.44, hemY - 6]]), 1.8, fc2, 0.05);
        for (const s of [-1, 1]) { const px = cx + s * TW * 0.5, py = shY + 52; if (tV(px, py) > -2) pk(px, py, 19, 38); const qx = cx + s * HPW * 0.58, qy = waistY + 26; if (tV(qx, qy) > -2) pk(qx, qy, 24, 46); } }
      else for (const s of [-1, 1]) taper(g, TPb([[cx + s * TW * 0.36, shY + 40], [cx + s * WW * 0.38, waistY], [cx + s * HPW * 0.4, hemY - 6]]), 1.8, fc2, 0.05);
      g.save(); g.clip(torsoP); const bp = new Path2D(); bp.rect(0, waistY - 6, 600, 18); cel(g, bp, o.belt || dk(hc0, 0.86), 0, 8, 0, 0, twill(hc0)); g.restore(); taper(g, TP([[cx - WW, waistY + 12], [cx, waistY + 13], [cx + WW, waistY + 12]]), 1.4, fc2, 0.3); taper(g, TP([[cx - WW, waistY - 6], [cx, waistY - 5], [cx + WW, waistY - 6]]), 1.4, fc2, 0.3);
      if (!BACKB) decal(cx + 6, waistY, () => { const bk = new Path2D(); bk.roundRect(cx - 4, waistY - 8, 18, 22, 3); g.lineWidth = 3; g.strokeStyle = '#5a4a3a'; g.stroke(bk); }); }
    if (o.apron) { const ac = o.apron, y1 = hipY + legL * 0.5 + flap * 3, fca = mixc(ac, INK, 0.4); // [TEDDY-cast] shop apron (bib + skirt to the knee, neck strap, waist ties)
      if (!BACKB) { const bib = TP([[cx - TW * 0.46, shY + 34], [cx + TW * 0.46, shY + 34], [cx + WW * 0.62, waistY + 4], [cx - WW * 0.62, waistY + 4]]);
        for (const s of [-1, 1]) { const b0 = bib[s < 0 ? 0 : 1]; line(g, [b0, [tX(cx + s * (NW + 4), shY - 2), shY - 2]], 7, INK); line(g, [b0, [tX(cx + s * (NW + 4), shY - 2), shY - 2]], 4, ac); }
        const sk = [[tX(cx - WW * 0.98, waistY + 4), waistY + 4], [tX(cx + WW * 0.98, waistY + 4), waistY + 4], [tX(cx + HPW * 1.05, hipY) + 4, y1], [tX(cx - HPW * 1.05, hipY) - 4, y1]];
        const AP = polyPath(bib); polyPath(sk, AP); cel(g, AP, ac, 3.2, 10, 5, 4, twill(ac));
        for (const k of [-0.4, 0.1, 0.5]) taper(g, [[tX(cx + k * HPW, hipY), hipY], [tX(cx + k * HPW * 1.05, hipY) + k * 4, y1 - 4]], 1.6, fca, 0.1);
        line(g, [[sk[0][0], waistY + 6], [sk[1][0], waistY + 6]], 6, INK); line(g, [[sk[0][0], waistY + 6], [sk[1][0], waistY + 6]], 3, ac);
        decal(cx, hipY - 10, () => { const pp = new Path2D(); pp.roundRect(cx - 34, hipY - 18, 68, 34, 4); g.lineWidth = 1.8; g.strokeStyle = fca; g.stroke(pp); line(g, [[cx, hipY - 18], [cx, hipY + 16]], 1.4, fca); }); }
      else { for (const s of [-1, 1]) { const t = TPb([[cx + s * (NW + 4), shY - 2], [cx - s * WW * 0.7, waistY + 4]]); line(g, t, 7, INK); line(g, t, 4, ac); }
        const bx = tXb(cx, waistY + 6); for (const s of [-1, 1]) cel(g, polyPath([[bx, waistY + 6], [bx + s * 22, waistY - 6], [bx + s * 22, waistY + 18]]), ac, 2, 2, 2, 0); for (const s of [-1, 1]) line(g, [[bx, waistY + 8], [bx + s * 8, waistY + 44]], 4, ac); } }
  };
  const collarExtras = () => { if (BACKB) return;
    if (o.fatigue || o.guayabera) for (const s of [-1, 1]) { if (tV(cx + s * (NW + 8), shY) < -8) continue; cel(g, polyPath(TP([[cx + s * 2, shY + 14], [cx + s * (NW + 10), shY - 8], [cx + s * (NW + 18), shY + 12], [cx + s * 16, shY + 34]])), o.collarCol || mixc(o.shirt, '#fff8ec', o.guayabera ? 0.1 : 0.04), 2.4, s * SG > 0 ? 4 : 0, 2, 0, twill(o.shirt)); }
    if (o.track || o.scuba) { const nb = (dy, w) => TP(arcPts(cx, shY - 2 + dy, (NW + 8) * w, Math.PI * 1.02, -0.02 * Math.PI, 10, 9)); cel(g, polyPath([...nb(-14, 1.0), ...nb(4, 1.12).reverse()]), dk(o.shirt, 0.9), 2.4, 3, 2, 0); } };
  // ---------- [EIN-cast] new features: wild / tufts hair (3D tuft shell, turns with the head), sandals + bare ankles, cardigan, open collar,
  // mail satchel, press card, cap badge, age lines, glasses chain, new mouths. Called from the hooks marked [EIN-cast].
  const einHair = (layer) => { const W = o.hair === 'wild', out = []; let i = 0;
    const rings = W ? [[-0.78, 5, 1.0], [-0.52, 8, 1.0], [-0.2, 10, 0.95], [0.1, 12, 1], [0.4, 12, 1.05], [0.7, 10, 1.05], [0.98, 8, 1], [1.25, 5, 0.9], [1.5, 2, 0.8]] : [[0.0, 12, 1.0], [0.25, 12, 1.12], [0.5, 12, 0.95]];
    for (const [e, n, kk] of rings) for (let j = 0; j < n; j++) { i++; const phi = (j + (W ? 0.5 : 0) + 0.3 * (hsh(i, 1.3) - 0.5) * (W ? 1 : 0)) / n * TAU - Math.PI, cp = Math.cos(phi), sp = Math.sin(phi);
      if (W ? (cp > 0.3 && e < 0.85) || (cp > 0.62 && e < 1.1) || (e < -0.4 && cp > (e < -0.6 ? -0.5 : -0.25)) : cp > 0.1 || (e > 0.4 && Math.abs(sp) < 0.85)) continue; out.push({ e, phi, k: kk * (0.85 + 0.3 * hsh(i, 2.7)), i }); }
    const ch = Math.cos(HY), shh = Math.sin(HY), pr = (x, y, z) => [hcx + x * ch + z * shh, y, -x * shh + z * ch];
    for (const t of out) { const yf = -Math.sin(t.e), rr = Math.max(0.16, rH(clamp(yf * 0.98, -1, 1))) * HW, x = rr * Math.sin(t.phi), z = rr * Math.cos(t.phi) * 0.92, y = hy + yf * HH;
      const nx = Math.cos(t.e) * Math.sin(t.phi), ny = -Math.sin(t.e) * (W ? 1.05 : 0.8) - (W ? 0.1 : 0.2), nz = Math.cos(t.e) * Math.cos(t.phi), L = HW * (W ? 0.46 : 0.56) * t.k;
      const C = pr(x, y, z), T = pr(x + nx * L, y + ny * L, z + nz * L); t.C = C; t.d = C[2]; t.r = HW * (W ? 0.31 : 0.3) * t.k; t.T = [T[0] + sway(t.i) * 1.3 + trail * (W ? 10 : 5), T[1] + flap * 2]; }
    const tuftP = (t, P) => { const [x0, y0] = t.C, dx = t.T[0] - x0, dy = t.T[1] - y0, dl = Math.hypot(dx, dy), r = t.r; if (dl < r * 0.7) { ellP(x0, y0, r * 1.12, r * 1.05, 0, P); return; }
      const ux = dx / dl, uy = dy / dl, px = -uy, py = ux, bend = (hsh(t.i, 5.5) - 0.5) * r * 1.3, a0 = Math.atan2(py, px), pts = [];
      for (let k = 0; k <= 6; k++) { const a = a0 + Math.PI * k / 6; pts.push([x0 + Math.cos(a) * r, y0 + Math.sin(a) * r]); }
      const M = (f, sd) => [x0 + dx * f + px * (sd * r * (1 - f) * 0.9 + bend * f), y0 + dy * f + py * (sd * r * (1 - f) * 0.9 + bend * f)];
      pts.push(M(0.45, -1), M(0.78, -0.45));
      if (hsh(t.i, 8.8) > 0.7) { const T2 = [x0 + dx * 0.8 + px * (r * 0.9 + bend), y0 + dy * 0.8 + py * (r * 0.9 + bend)]; pts.push([t.T[0] - px * r * 0.25, t.T[1] - py * r * 0.25], M(0.7, 0.1), T2, M(0.62, 0.7)); }
      else pts.push([t.T[0] + px * bend * 0.3, t.T[1] + py * bend * 0.3], M(0.78, 0.45), M(0.45, 1));
      polyPath(cr(pts, true, 4), P); };
    if (layer === 'front' && W && !BACKH) { const fr = [[1.0, -0.14], [0.92, -0.38], [0.76, -0.58], [0.52, -0.72], [0.26, -0.78], [0, -0.8], [-0.26, -0.78], [-0.52, -0.72], [-0.76, -0.58], [-0.92, -0.38], [-1.0, -0.14]];
      hairPaint(backCap(polyPath(HMP([...capPts(-0.14), ...cr(rel(fr), false, 4)]))), [[[-0.2, -1.0], [-0.5, -0.88], [-0.85, -0.5]], [[0.2, -1.0], [0.5, -0.88], [0.85, -0.5]], [[0, -1.0], [0.05, -0.86]]]); }
    if (layer === 'front' && !W) { // Ben-Gurion's bald crown: a soft shine
      if (!BACKH) taper(g, arcPts(hcx - HW * 0.1 * SG + SN * HW * 0.2, hy - HH * 0.25, HW * 0.62, Math.PI * 1.25, Math.PI * 1.45, 6, HH * 0.66), 5, lt(skin, 0.55), 0.2);
      else taper(g, arcPts(hcx - SG * HW * 0.2, hy - HH * 0.35, HW * 0.5, Math.PI * 1.2, Math.PI * 1.5, 6, HH * 0.5), 5, lt(skin, 0.45), 0.2); }
    const sel = layer === 'back' ? out : out.filter((t) => t.d > -HW * (W ? 0.14 : 0.3)); if (!sel.length) return;
    const P = new Path2D(); for (const t of sel) tuftP(t, P);
    cel(g, P, hc, 3.2, HW * 0.12, HH * 0.07, 6);
    g.save(); g.clip(P); const sc = mixc(hc, INK, 0.3), hl = lt(hc, 0.7);
    if (layer === 'back') { g.globalCompositeOperation = 'multiply'; g.fillStyle = rgba(mixc(hc, '#6a4aa0', 0.5), 0.28); g.fill(P); g.globalCompositeOperation = 'source-over'; }
    for (const t of sel) { const b = (hsh(t.i, 5.5) - 0.5) * t.r * 0.8, m = lerp(t.C, t.T, 0.5); taper(g, [lerp(t.C, t.T, 0.05), [m[0] + b, m[1] + b * 0.3], lerp(t.C, t.T, 0.9)], 1.5, rgba(sc, 0.8), 0.1);
      if (hsh(t.i, 3.3) > 0.4) taper(g, [[t.C[0] + t.r * 0.4, t.C[1] + t.r * 0.2], [m[0] + b + t.r * 0.3, m[1] + t.r * 0.3], lerp(t.C, t.T, 0.75)], 1.2, rgba(sc, 0.6), 0.1);
      if ((t.C[0] - hcx) * SG < HW * 0.3) taper(g, [[t.C[0] - SG * t.r * 0.3, t.C[1] - t.r * 0.3], [m[0] - SG * t.r * 0.2, m[1] - t.r * 0.2]], 3, rgba(hl, 0.7), 0.2); }
    g.restore();
    for (const t of sel) if (hsh(t.i, 9.7) > (W ? 0.55 : 0.7)) { const dx = t.T[0] - t.C[0], dy = t.T[1] - t.C[1], b = (hsh(t.i, 4.4) - 0.5) * 0.9, wp = [t.T, [t.T[0] + dx * 0.35 - dy * b * 0.3, t.T[1] + dy * 0.35 + dx * b * 0.3], [t.T[0] + dx * 0.7 - dy * b, t.T[1] + dy * 0.7 + dx * b]]; // flyaway wisps
      taper(g, wp, 4.2, inkFor(hc), 0.15); taper(g, wp, 2, hc, 0.15); } };
  const einTilt = ((op.tilt ?? ((o.seed || 0) % 3 - 1) * 3) + (gaitOn ? (RUN ? 2.5 : 1.4) * Math.sin(TAU * 2 * (ph - 0.1)) * (turned ? dv : 1) : 0)) * Math.PI / 180; // same as the head tilt below
  const sandal = (L) => { const s = L.s, toe = turned ? dv : s, kL = turned ? 0.9 + 0.15 * AS : 1, fx = L.A[0] + toe * 9 * kL, fy = L.fy, sc = o.shoes || '#7a4a2a', back = BACKB && !turned;
    cel(g, limb([[L.A[0], L.A[1] - 30], [L.A[0], L.A[1] - 4]], [rl * 0.46, rl * 0.5]), skin, 2.4, 3, 2, 0, null, SHADE_SKIN); // bare ankle: no socks
    const cuf = new Path2D(); cuf.roundRect(L.A[0] - rl * 0.78, L.A[1] - 34, rl * 1.56, 12, 4); cel(g, cuf, pantsCol, 2.4, 4, 3, 0, twill(pantsCol)); // trouser hem, a touch short
    if (back) { const hp = smooth([[fx - 15, fy - 10], [fx + 15, fy - 10], [fx + 16, fy + 6], [fx - 16, fy + 6]], 5); cel(g, hp, skin, 2.6, 4, 3, 0, null, SHADE_SKIN); const so = new Path2D(); so.roundRect(fx - 19, fy + 4, 38, 10, 3); cel(g, so, '#4a3020', 2.4, 0, 0, 0); line(g, [[fx - 15, fy - 6], [fx + 15, fy - 6]], 5, INK); line(g, [[fx - 15, fy - 6], [fx + 15, fy - 6]], 3, sc); return; }
    g.save(); if (L.pitch) { const pv = L.pitch > 0 ? [fx - toe * 26 * kL, fy + 12] : [fx + toe * 32 * kL, fy + 12]; g.translate(pv[0], pv[1]); g.rotate(-toe * L.pitch); g.translate(-pv[0], -pv[1]); }
    const so = smooth([[fx - toe * 26 * kL, fy + 5], [fx + toe * 32 * kL, fy + 4], [fx + toe * 38 * kL, fy + 10], [fx + toe * 32 * kL, fy + 15], [fx - toe * 28 * kL, fy + 15]], 4); cel(g, so, '#4a3020', 2.6, 3, 2, 0); line(g, [[fx - toe * 24 * kL, fy + 6], [fx + toe * 34 * kL, fy + 6]], 2, '#a07850');
    const ft = smooth([[fx - toe * 22 * kL, fy - 8], [fx + toe * 4 * kL, fy - 12], [fx + toe * 26 * kL, fy - 4], [fx + toe * 34 * kL, fy + 2], [fx + toe * 30 * kL, fy + 7], [fx - toe * 24 * kL, fy + 7]], 5); cel(g, ft, skin, 2.8, 4, 3, 0, null, SHADE_SKIN);
    for (let k = 0; k < 3; k++) taper(g, [[fx + toe * (25 + k * 3) * kL, fy - 3 + k * 2], [fx + toe * (28 + k * 3) * kL, fy + 3 + k * 1.5]], 1.2, mixc(skin, INK, 0.45), 0.2); // toes
    for (const [a, w2] of [[0, 9], [17, 7]]) { const X = fx + toe * a * kL; cel(g, polyPath([[X - 5 * toe, fy - 12 + a * 0.25], [X + 5 * toe, fy - 13 + a * 0.3], [X + 7 * toe, fy + 7], [X - 3 * toe, fy + 7]]), sc, 1.8, 2, 1, 0); }
    line(g, [[L.A[0] - rl * 0.5, L.A[1] - 10], [L.A[0] + rl * 0.5, L.A[1] - 8]], 6, INK); line(g, [[L.A[0] - rl * 0.48, L.A[1] - 10], [L.A[0] + rl * 0.48, L.A[1] - 8]], 3.6, sc);
    g.restore(); };
  const einTorso = () => { const fc = mixc(o.shirt, INK, 0.45), TQ = BACKB ? TPb : TP, XQ = BACKB ? tXb : tX;
    if (o.openCollar && !BACKB) { const V = polyPath(TP([[cx - NW * 0.85, shY - 4], [cx + NW * 0.85, shY - 4], [cx, shY + 42]])); cel(g, V, skin, 0, 0, 0, 0); g.save(); g.clip(V); g.globalCompositeOperation = 'multiply'; g.fillStyle = SHS_; g.fillRect(0, shY - 10, 600, 26); g.globalCompositeOperation = 'source-over'; g.restore(); }
    if (o.cardigan) { const cc = o.shirt, dkc = mixc(cc, INK, 0.4), vB = shY + torsoH * (lady ? 0.34 : 0.48);
      g.save(); g.clip(torsoP); for (let k = -9; k <= 9; k++) { if (!BACKB && tV(cx + k * TW * 0.11, waistY) < -2) continue; taper(g, TQ([[cx + k * TW * 0.11, shY + 10], [cx + k * WW * 0.11, waistY], [cx + k * HPW * 0.115, hemY - 16]]), 1.1, rgba(dkc, 0.3), 0.2); }
      const hb = new Path2D(); hb.rect(0, hemY - 22, 600, 26); g.fillStyle = mixc(cc, '#3a2a6a', 0.12); g.fill(hb); for (let k = -16; k <= 16; k++) { const xx = cx + k * HPW * 0.068; if (!BACKB && tV(xx, hemY) < -2) continue; line(g, [[XQ(xx, hemY), hemY - 20], [XQ(xx, hemY), hemY + 2]], 1.2, rgba(dkc, 0.45)); }
      g.restore(); taper(g, TQ([[cx - HPW, hemY - 22], [cx, hemY - 21], [cx + HPW, hemY - 22]]), 1.4, dkc, 0.3);
      for (const s of [-1, 1]) taper(g, TQ([[cx + s * TW * 0.95, shY + 76], [cx + s * WW * 0.7, waistY - 6], [cx + s * WW * 0.86, waistY + 14]]), 1.6, rgba(dkc, 0.7), 0.1); // baggy drape
      if (!BACKB) { const sv = polyPath(TP([[cx - NW - 5, shY - 3], [cx + NW + 5, shY - 3], [cx + 3, vB], [cx - 3, vB]])), shc = o.collar || '#eef0f4'; cel(g, sv, shc, 0, 6, 4, 0, twill(shc));
        if (!lady) { taper(g, TP([[cx + 1, shY + 30], [cx + 1, vB]]), 1.4, mixc(shc, INK, 0.35), 0.1); for (let i = 0; i < 2; i++) decal(cx + 6, shY + 44 + i * 26, () => { g.beginPath(); g.arc(cx + 6, shY + 44 + i * 26, 2.6, 0, TAU); g.fillStyle = mixc(shc, INK, 0.25); g.fill(); }); }
        for (const s of [-1, 1]) { const bp = TP([[cx + s * (NW + 5), shY - 4], [cx + s * 5, vB], [cx + s * 5, hemY - 1]]); if (tV(cx + s * 5, waistY) < -6) continue; line(g, bp, 11, dkc); line(g, bp, 7, mixc(cc, '#fff8ec', 0.08)); }
        for (let y = vB + 14; y < hemY - 14; y += 34) decal(cx, y, () => cel(g, ellP(cx, y, 5, 5), o.button || '#5a4636', 1.8, 1, 1, 0));
        for (const s of [-1, 1]) { const px = cx + s * HPW * 0.56, py = hemY - 62; if (tV(px, py) < -2) continue; decal(px, py, () => { const pp = new Path2D(); pp.roundRect(px - 21, py, 42, 36, 5); cel(g, pp, cc, 1.8, 4, 3, 0); line(g, [[px - 20, py + 6], [px + 20, py + 6]], 1.4, dkc); }); } } }
    if (o.satchel) { const sc = o.satchel, S0 = [cx - TW * 0.6, shY + 2], E0 = [cx + HPW * 0.95, hipY - 8], st = TQ([S0, lerp(S0, E0, 0.5), E0]);
      line(g, st, 16, INK); line(g, st, 11, sc); taper(g, st, 1.4, rgba(lt(sc, 0.4), 0.6), 0.1);
      const bx0 = cx + HPW * 1.02, by0 = hipY - 12; if (BACKB || tV(bx0, by0) > -14) { const X = XQ(bx0, by0) + (BACKB ? -6 : 6), kx = turned ? 0.8 : 1;
        for (let k = 0; k < 3; k++) { g.save(); g.translate(X - 24 * kx + k * 18 * kx, by0 + 4); g.rotate(-0.1 + k * 0.1); const lp = new Path2D(); lp.rect(-8, -18, 16, 24); cel(g, lp, k === 1 ? '#e8dcc0' : '#f4f0e6', 1.6, 0, 0, 0); g.restore(); }
        const bp = new Path2D(); bp.roundRect(X - 44 * kx, by0, 88 * kx, 76, 9); cel(g, bp, sc, 3.2, 8, 5, 3, twill(sc));
        cel(g, polyPath([[X - 46 * kx, by0 - 2], [X + 46 * kx, by0 - 2], [X + 46 * kx, by0 + 30], [X, by0 + 40], [X - 46 * kx, by0 + 30]]), mixc(sc, '#000000', 0.1), 2.4, 5, 3, 0, twill(sc));
        cel(g, ((p) => { p.roundRect(X - 6, by0 + 30, 12, 14, 2); return p; })(new Path2D()), '#c8a048', 1.6, 1, 1, 0); taper(g, [[X - 40 * kx, by0 + 52], [X + 40 * kx, by0 + 52]], 1.2, rgba(lt(sc, 0.3), 0.6), 0.1); } } };
  const einCollar = () => { if (BACKB || lady) return; if ((o.openCollar && !o.fatigue) || o.cardigan) for (const s of [-1, 1]) { if (tV(cx + s * (NW + 8), shY) < -8) continue; const cc2 = o.cardigan ? (o.collar || '#eef0f4') : mixc(o.shirt, '#fff8ec', 0.06);
    cel(g, polyPath(TP([[cx + s * 3, shY + (o.cardigan ? 20 : 38)], [cx + s * (NW + 10), shY - 8], [cx + s * (NW + 22), shY + 14], [cx + s * 15, shY + (o.cardigan ? 34 : 48)]])), cc2, 2.4, s * SG > 0 ? 4 : 0, 2, 0, twill(cc2)); } };
  const einHat = () => { if (BACKH) return;
    if (o.pressCard && o.hat === 'fedora') { const a = HY - 0.5, c = Math.cos(a); if (c > 0.08) { const bY = hy - HH * 0.62, X = hcx - SN * 4 * fz + HW * 0.74 * Math.sin(a), kx = clamp(c, 0.3, 1);
      g.save(); g.translate(X, bY - 14 * fz); g.rotate(-0.16 + Math.sin(a) * 0.1); g.scale(kx, 1); const cp = new Path2D(); cp.rect(-16 * fz, -32 * fz, 32 * fz, 38 * fz); cel(g, cp, '#f6f2e6', 2, 2, 2, 0);
      g.fillStyle = INK; g.font = `bold ${9.5 * fz}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PRESS', 0, -18 * fz); g.fillStyle = 'rgba(42,36,64,0.4)'; g.fillRect(-11 * fz, -8 * fz, 22 * fz, 2 * fz); g.restore(); } }
    if (o.capBadge && o.hat === 'cap') { const c = Math.cos(HY); if (c > 0.15) { const X = hcx + rH(-0.62) * HW * 1.03 * Math.sin(HY), Y = hy - HH * 0.58; cel(g, ellP(X, Y, 9 * fz * c, 11 * fz), '#d8b048', 1.8, 2, 2, 0); g.beginPath(); g.ellipse(X, Y, 4.5 * fz * c, 6 * fz, 0, 0, TAU); g.strokeStyle = '#8a6420'; g.lineWidth = 1.4; g.stroke(); } } };
  const einFace = (fm, ey, w) => { if (!o.age) return; const lc = mixc(skin, INK, 0.42);
    for (const s of [-1, 1]) { const m = fm(s * w * 0.38, ey + 16, 1); if (m.c > 0.2) taper(g, arcPts(m.x, ey + 13, 10 * m.sx, Math.PI * 0.2, Math.PI * 0.8, 6, 7), 1.5, rgba(lc, 0.7), 0.15);
      const n = fm(s * w * 0.27, 32); if (n.c > 0.25) taper(g, [[n.x, 30], [n.x + s * 6 * n.sx, 41], [n.x + s * 5 * n.sx, 50]], 1.5, rgba(lc, 0.55), 0.15);
      const cw = fm(s * w * 0.62, ey); if (cw.c > 0.15) for (const dy of [-4, 3]) taper(g, [[cw.x + s * 2 * cw.sx, ey + dy * 0.5], [cw.x + s * 9 * cw.sx, ey + dy * 1.6]], 1.2, rgba(lc, 0.5), 0.2); }
    for (const y of [-42, -52]) { const pts = []; for (let k = -4; k <= 4; k++) { const m = fm(k * w * 0.1, y); if (m.c > 0.15) pts.push([m.x, y + Math.sin(k * 1.3 + y) * 1.5]); } if (pts.length > 2) taper(g, pts, 1.4, rgba(lc, 0.5), 0.15); } };
  const einMouth = (E, my, cheekTicks) => {
    if (E === 'amused') { taper(g, [[-14, my - 4], [-4, my + 3], [8, my + 2], [16, my - 7]], 3.6, INK, 0.3); taper(g, arcPts(17, my - 8, 4, -0.6, 1.2, 4), 1.4, mixc(skin, INK, 0.45), 0.2); cheekTicks(14); }
    else if (E === 'thoughtful') { taper(g, [[-8, my + 3], [0, my + 1], [7, my + 4]], 3.2, INK, 0.3); taper(g, [[-4, my + 10], [4, my + 10]], 1.4, mixc(skin, INK, 0.4), 0.2); }
    else if (E === 'determined') { taper(g, [[-13, my + 5], [-5, my + 2], [5, my + 2], [13, my + 5]], 3.8, INK, 0.3); taper(g, arcPts(0, my + 15, 6, 0.3, Math.PI - 0.3, 4, 3), 1.5, mixc(skin, INK, 0.4), 0.2); }
    else if (E === 'relieved') taper(g, arcPts(0, my - 8, 12, Math.PI * 0.22, Math.PI * 0.78, 10), 3.4, INK, 0.3); };
  // ---------- [LIB-cast] new features: poses op.raise (near arm straight up, torch-style; holds op.prop up), op.palm (flat "no" palm out), op.handsUp (both palms out,
  // insisting), op.clasp (hands clasped at the chest), op.slump (crushed: head sinks, arms hang), op.shake (head shake, uses op.headYaw); outfits: frock coat + cravat,
  // stambouline (high braided collar, frogging, star), fez, turban, galabiya, 1880s lady hat + bustle, double-breasted, plaster dust, monocle (op.monoclePop: dropped on its cord).
  const libArm = (s, S, ad) => {
    if (op.raise && s === PA) { const E = ad(S, s * AL * 0.52, -AL * 0.66, AL * 0.1); return [S, E, ad(E, s * AL * 0.16, -AL * 0.9, AL * 0.05)]; }
    if (op.palm && s === PA) { const E = ad(S, s * AL * 0.62, AL * 0.4, AL * 0.25); return [S, E, ad(E, s * AL * 0.22, -AL * 0.64, AL * 0.35)]; }
    if (op.handsUp) { const E = ad(S, s * AL * 0.66, AL * 0.4, AL * 0.18); return [S, E, ad(E, s * AL * 0.16, -AL * 0.66, AL * 0.3)]; }
    if (op.clasp) { const E = ad(S, s * AL * 0.4, AL * 0.72, AL * 0.3); return [S, E, [s * 7, shY + AL * 0.48, AL * 0.62]]; }
    if (op.slump && !(HOLD[op.prop] && s === PA) && !gaitOn) { const E = ad(S, s * 4, AL * 0.98, AL * 0.16); return [S, E, ad(E, -s * 6, AL * 0.92, AL * 0.22)]; }
    return null; };
  const libHand = (Hp, ang, s, grip) => { if (grip || !((op.palm && s === PA) || op.handsUp)) return false;
    const k = Math.sqrt(B.w) * (o.build === 'kid' ? 0.85 : 1.15), ux = Math.cos(ang), uy = Math.sin(ang); let px = -uy, py = ux; if ((cx - Hp[0]) * px < 0) { px = -px; py = -py; }
    const C = [Hp[0] + ux * 4 * k, Hp[1] + uy * 4 * k], P = ellP(C[0], C[1], 14 * k, 12.5 * k, ang);
    for (let i = 0; i < 4; i++) { const off = (i - 1.5) * 6.6 * k, L = (19 - Math.abs(i - 1.2) * 3.4) * k, b0 = [C[0] + ux * 8 * k + px * off, C[1] + uy * 8 * k + py * off], fa = ang + (i - 1.5) * 0.09; limb([b0, [b0[0] + Math.cos(fa) * L, b0[1] + Math.sin(fa) * L]], [4.4 * k, 3.7 * k], P); }
    const tb = [C[0] + px * 10 * k, C[1] + py * 10 * k], ta = Math.atan2(py, px) - 0.5 * Math.sign(px * uy - py * ux || 1); limb([tb, [tb[0] + Math.cos(ta) * 15 * k, tb[1] + Math.sin(ta) * 15 * k]], [5 * k, 4 * k], P);
    cel(g, P, skin, 3, 4, 4, 2, null, SHADE_SKIN); taper(g, [[C[0] - px * 6 * k - ux * 4 * k, C[1] - py * 6 * k - uy * 4 * k], [C[0] + px * 2 * k + ux * 4 * k, C[1] + py * 2 * k + uy * 4 * k]], 1.4, mixc(skin, INK, 0.45), 0.2); return true; };
  const libNeck = (T, ks) => { if (o.neck !== 'cravat') return; const nc = o.neckCol || '#2a2232';
    for (const s of [-1, 1]) cel(g, polyPath(T([[cx + s * 3, shY - 6], [cx + s * (NW + 6), shY - 14], [cx + s * (NW + 2), shY + 10], [cx + s * 6, shY + 8]])), o.collar || '#f4f1e8', 2, 2, 2, 0);
    for (const s of [-1, 1]) cel(g, polyPath(T([[cx + s * 2, shY + 14], [cx + s * 15, shY + 60], [cx + s * 3, shY + 66], [cx - s * 3, shY + 20]])), dk(nc, 0.95), 2.2, 3, 2, 0);
    const wp = new Path2D(); for (const s of [-1, 1]) smooth(T([[cx, shY + 6], [cx + s * 18, shY - 4], [cx + s * 29, shY + 6], [cx + s * 22, shY + 24], [cx, shY + 16]]), 5, wp); cel(g, wp, nc, 2.4, 4, 3, 2);
    const [kx] = T([[cx, 0]])[0]; cel(g, ellP(kx, shY + 11, 8 * ks, 9), dk(nc, 0.85), 2.2, 2, 2, 0); taper(g, T([[cx - 14, shY + 4], [cx - 6, shY + 10]]), 2, rgba(lt(nc, 0.5), 0.6), 0.3); };
  const libCollar = () => { if (BACKB) return;
    if (o.stambouline) { const W0 = NW + 5, cp = polyPath([...arcPts(ncx, shY - 2, W0 + 2, Math.PI, 0, 10, 12), ...arcPts(ncx, shY - 30, W0 - 1, 0, Math.PI, 10, 8)]); cel(g, cp, o.shirt, 3, 3, 3, 2, fabric());
      if (o.braid) { taper(g, arcPts(ncx, shY - 29, W0 - 1, Math.PI * 1.02, -0.02 * Math.PI, 10, 8), 3.2, o.braid, 0.6); taper(g, arcPts(ncx, shY - 4, W0 + 1, Math.PI * 1.02, -0.02 * Math.PI, 10, 12), 2.6, o.braid, 0.6);
        g.save(); g.clip(cp); g.strokeStyle = rgba(o.braid, 0.8); g.lineWidth = 1.6; for (let k = -3; k <= 3; k++) { const x = ncx + k * W0 * 0.26; g.beginPath(); g.moveTo(x - 4, shY - 22 + Math.abs(k) * 1.5); g.quadraticCurveTo(x, shY - 14, x + 4, shY - 22 + Math.abs(k) * 1.5); g.stroke(); } g.restore(); }
      line(g, [[ncx, shY - 30 + 12], [ncx, shY + 6]], 1.6, mixc(o.shirt, INK, 0.6)); }
    if (o.galabiya) { const nb = arcPts(ncx, shY - 3, NW + 4, Math.PI, 0, 10, 14); taper(g, nb, 3, mixc(o.shirt, INK, 0.4), 0.8); const sl = TP([[cx, shY + 12], [cx, shY + 70]]); taper(g, sl, 2.2, mixc(o.shirt, INK, 0.5), 0.3);
      for (const y of [shY + 30, shY + 52]) decal(cx, y, () => cel(g, ellP(cx + 5, y, 3.2, 3.2), mixc(o.shirt, INK, 0.25), 1.4, 1, 1, 0)); } };
  const libTorso = () => { const TQ = BACKB ? TPb : TP;
    if (o.stambouline && !BACKB) { const bc = o.braid;
      if (bc) { taper(g, TP([[cx, shY + 6], [cx, waistY], [cx, hemY - 4]]), 3, bc, 0.5); for (let i = 0; i < 4; i++) { const y = shY + 34 + i * 26, wv = TW * (0.34 - i * 0.03); for (const s of [-1, 1]) { if (tV(cx + s * wv, y) < -3) continue; const q = TP([[cx + s * 6, y], [cx + s * wv * 0.6, y - 4], [cx + s * wv, y + 1]]); taper(g, q, 3.2, INK, 0.5); taper(g, q, 2, bc, 0.5); decal(cx + s * wv, y, () => cel(g, ellP(cx + s * wv, y + 1, 3.4, 3.4), bc, 1.2, 0, 0, 0)); } } }
      if (o.star) { const sx = cx + TW * 0.5, sy = shY + 70; if (tV(sx, sy) > -2) decal(sx, sy, () => { const P = [], n = 8; for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n - HP_, rr = i % 2 ? 7.5 : 17; P.push([sx + Math.cos(a) * rr, sy + Math.sin(a) * rr]); } cel(g, polyPath(P), '#e8e6f0', 2.2, 3, 2, 0); cel(g, ellP(sx, sy, 7.5, 7.5), '#d8b048', 1.8, 1, 1, 0); cel(g, ellP(sx, sy, 3.6, 3.6), '#b8283a', 1, 0, 0, 0); }); } }
    if (o.frock && !BACKB) { const wc = o.waistcoat || '#9a8670', vB = waistY - 6; // open frock coat: waistcoat + shirt front in the V, silk-faced lapels, watch chain
      cel(g, polyPath(TP([[cx - NW * 1.4, shY - 4], [cx + NW * 1.4, shY - 4], [cx + TW * 0.4, vB - 26], [cx + TW * 0.34, vB + 8], [cx, vB + 18], [cx - TW * 0.34, vB + 8], [cx - TW * 0.4, vB - 26]])), wc, 2, 5, 3, 0, twill(wc));
      cel(g, polyPath(TP([[cx - NW * 1.0, shY - 4], [cx + NW * 1.0, shY - 4], [cx, shY + 74]])), o.collar || '#f4f1e8', 1.8, 4, 2, 0);
      for (let i = 0; i < 3; i++) decal(cx, shY + 92 + i * 24, () => cel(g, ellP(cx, shY + 92 + i * 24, 3.6, 3.6), mixc(wc, INK, 0.45), 1.2, 1, 1, 0));
      { const c0 = [tX(cx, shY + 120), shY + 120], c1 = [tX(cx + TW * 0.3, shY + 112), shY + 112]; taper(g, [c0, [(c0[0] + c1[0]) / 2, shY + 134], c1], 2.4, '#e0b84a', 0.6); }
      const lc = mixc(o.shirt, '#000000', 0.25); for (const s of [-1, 1]) { if (tV(cx + s * TW * 0.45, shY + 40) < -6) continue; cel(g, polyPath(TP([[cx + s * (NW + 3), shY - 6], [cx + s * TW * 0.66, shY + 14], [cx + s * TW * 0.5, shY + 52], [cx + s * TW * 0.44, vB - 8], [cx + s * TW * 0.37, vB - 22], [cx + s * NW * 1.3, shY + 8]])), lc, 2.2, s * SG > 0 ? 5 : 0, 3, 0);
        taper(g, TP([[cx + s * TW * 0.42, vB - 6], [cx + s * TW * 0.46, vB + 60], [cx + s * HPW * 0.5, hemY - 6]]), 2, mixc(o.shirt, INK, 0.6), 0.2); } }
    if (o.dbl && jacket && !BACKB) { const vB = shY + torsoH * 0.42; for (let i = 0; i < 2; i++) decal(cx - 16, vB + 22 + i * 34, () => cel(g, ellP(cx - 16, vB + 22 + i * 34, 4.5, 4.5), o.button || '#d8b048', 2, 1, 1, 0)); }
    if (o.galabiya) { const fc = mixc(o.shirt, INK, 0.4); g.save(); g.clip(torsoP); for (const k of [-0.62, -0.2, 0.3, 0.7]) taper(g, TQ([[cx + k * WW, hipY - 20], [cx + k * HPW * 1.1, hipY + 80], [cx + k * HPW * 1.3, hemY - 6]]), 1.6, fc, 0.1); g.restore(); }
    if (o.bustle && lady && !BACKB) { const sc = o.pants || '#6a3a5c', ap = new Path2D(); ap.moveTo(tX(cx - WW * 1.02, waistY + 14), waistY + 14); ap.quadraticCurveTo(cx - HPW * 0.9, hipY + 80, cx + SN * 20, hipY + 100); ap.quadraticCurveTo(cx + HPW * 0.9, hipY + 80, tX(cx + WW * 1.02, waistY + 14), waistY + 14); ap.closePath();
      cel(g, ap, lt(sc, 0.12), 2.6, 6, 4, 2, twill(sc)); g.save(); g.clip(ap); for (const k of [0, 1, 2]) taper(g, [[cx - HPW * (0.8 - k * 0.15), waistY + 30 + k * 12], [cx + SN * 20, hipY + 40 + k * 22], [cx + HPW * (0.8 - k * 0.15), waistY + 30 + k * 12]], 1.8, mixc(sc, INK, 0.45), 0.1); g.restore();
      taper(g, [[cx - HPW * 0.88, hipY + 66], [cx + SN * 20, hipY + 96], [cx + HPW * 0.88, hipY + 66]], 3.4, o.cuff || '#f2e8e0', 0.5); }
    if (o.plaster) { g.save(); g.clip(torsoP); for (let i = 0; i < 70; i++) { const x = cx + (hsh(i, 2.2) - 0.5) * TW * 2.2, y = shY + hsh(i, 3.7) * (hemY - shY + 40), r = 1.2 + hsh(i, 5.1) * 2.6; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = `rgba(255,255,250,${0.45 + 0.4 * hsh(i, 7)})`; g.fill(); }
      for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(cx + (hsh(i, 8.1) - 0.5) * TW * 1.6, shY + 60 + hsh(i, 9.3) * 160, 14, 8, hsh(i, 1.1), 0, TAU); g.fillStyle = 'rgba(255,255,250,0.28)'; g.fill(); } g.restore(); } };
  const libSkirt = (sb, sw) => { if (!o.bustle || !turned) return; const b = -dv, sc = o.pants || '#6a3a5c'; // bustle bulge behind the hips (turned views)
    const bp = smooth([[cx + b * WW * 0.6, waistY + 2], [cx + b * (WW * wk + 46 * AS), waistY + 16], [cx + b * (HPW * wk + 62 * AS), waistY + 56], [cx + b * (HPW * wk + 50 * AS) + sw, hipY + 60], [cx + b * HPW * 0.9 + sw, sb - 60], [cx, hipY]], 6); cel(g, bp, sc, 3.6, 8, 6, 4, twill(sc));
    for (const k of [0, 1]) taper(g, [[cx + b * (HPW * wk + 10 * AS), waistY + 40 + k * 30], [cx + b * (HPW * wk + 44 * AS), hipY + 30 + k * 26]], 1.8, mixc(sc, INK, 0.45), 0.1); };
  const libHat = () => { const hk0 = o.hatCol, hx2 = hcx - SN * 4 * fz;
    if (o.hat === 'fez') { const hk = hk0 || '#b4202c', bY = hy - HH * 0.62, rb = HW * 0.84, rt = HW * 0.6, tY = hy - HH * 1.24;
      const cp = new Path2D(); cp.moveTo(hx2 - rb, bY); cp.lineTo(hx2 - rt, tY); cp.ellipse(hx2, tY, rt, rt * 0.12, 0, Math.PI, 0, false); cp.lineTo(hx2 + rb, bY); cp.ellipse(hx2, bY, rb, rb * 0.16, 0, 0, Math.PI, false); cp.closePath();
      cel(g, cp, hk, 3.6, HW * 0.18, 4, 4, (h) => { h.strokeStyle = 'rgba(80,0,20,0.12)'; h.lineWidth = 1; for (let k = -12; k <= 12; k++) { h.beginPath(); h.moveTo(hx2 + k * rb * 0.09, bY + 10); h.lineTo(hx2 + k * rt * 0.09, tY); h.stroke(); } });
      cel(g, ellP(hx2, tY, rt, rt * 0.12), mixc(hk, '#ffffff', 0.1), 2.4, 0, 0, 0); taper(g, [[hx2 - SG * rb * 0.5, bY - 12 * fz], [hx2 - SG * rt * 0.62, tY + 14 * fz]], 5 * fz, 'rgba(255,220,220,0.3)', 0.3);
      const tS = turned ? -dv : 1, a = [hx2, tY - 2], b = [hx2 + tS * rt * 1.02, tY + 6 * fz], c = [hx2 + tS * (rt + (rb - rt) * 0.45) + tS * 6 * fz, tY + 46 * fz];
      taper(g, [a, [hx2 + tS * rt * 0.6, tY - 3], b], 4 * fz, INK, 0.8); taper(g, [a, [hx2 + tS * rt * 0.6, tY - 3], b], 2.2 * fz, '#1e1a22', 0.8);
      const tp = polyPath([b, [b[0] + tS * 5 * fz, b[1]], [c[0] + tS * 9 * fz, c[1]], [c[0] - tS * 7 * fz, c[1] + 2 * fz]]); cel(g, tp, '#1e1a22', 2, 2, 2, 0); g.save(); g.clip(tp); for (let k = 0; k < 4; k++) line(g, [lerp(b, c, 0.25), [c[0] + tS * (-5 + k * 4) * fz, c[1]]], 1.1, 'rgba(160,150,190,0.5)'); g.restore(); }
    if (o.hat === 'turban') { const hk = hk0 || '#f2ece0', bY = hy - HH * 0.42, R = HW * 1.06, cy = bY - 40 * fz, fc = mixc(hk, INK, 0.38), sh = Math.sin(HY) * R * 0.4; // wrapped 'imma: lumpy rolls of cloth
      const pts = []; for (let k = 0; k <= 24; k++) { const a = Math.PI + Math.PI * k / 24, rr = 1 + 0.045 * Math.sin(a * 9 + HY * 3); pts.push([hx2 + Math.cos(a) * R * rr, cy + Math.sin(a) * 66 * fz * rr]); } pts.push([hx2 + R, bY], [hx2 + R * 0.5, bY + 9 * fz], [hx2, bY + 12 * fz], [hx2 - R * 0.5, bY + 9 * fz], [hx2 - R, bY]);
      const tp = polyPath(cr(pts, true, 3)); cel(g, tp, hk, 3.6, HW * 0.16, HH * 0.08, 4, twill(hk)); g.save(); g.clip(tp);
      for (let i = 0; i < 6; i++) { const y = bY + 4 * fz - i * 18 * fz, d = i % 2 ? 1 : -1, P = [[hx2 - R * 1.1, y + d * 12 * fz], [hx2 - R * 0.4 + sh, y - d * 4 * fz], [hx2 + R * 0.4 + sh, y + d * 6 * fz], [hx2 + R * 1.1, y - d * 14 * fz]];
        taper(g, P.map(([x, yy]) => [x, yy + 5 * fz]), 6 * fz, rgba(mixc(hk, '#8a7ab8', 0.5), 0.25), 0.2); taper(g, P, 2, fc, 0.15); taper(g, P.map(([x, yy]) => [x, yy - 5 * fz]), 2.4 * fz, 'rgba(255,255,255,0.35)', 0.2); }
      g.fillStyle = rgba(mixc(hk, '#7a6aa8', 0.5), 0.2); g.beginPath(); g.ellipse(hx2 + SG * R * 0.62, cy, R * 0.5, 60 * fz, 0, 0, TAU); g.fill(); g.restore();
      if (o.turbanTail !== false) { const ts = turned ? -dv : -1, a = [hx2 + ts * R * 0.86, bY - 8 * fz], tl = [a, [a[0] + ts * 14 * fz, a[1] + 30 * fz], [a[0] + ts * 8 * fz, a[1] + 62 * fz]]; if (!BACKH || true) { taper(g, tl, 18 * fz, INK, 0.5); taper(g, tl, 13 * fz, hk, 0.5); taper(g, tl.map(([x, y]) => [x - ts * 2, y]), 1.6, fc, 0.3); } } }
    if (o.hat === 'ladyhat') { const hk = hk0 || '#3a2a3a', bY = hy - HH * 0.84, Rb = HW * 0.74, Rc = HW * 0.44, ch = 62 * fz;
      const crown = () => polyPath([[hx2 - Rc, bY + 2], [hx2 - Rc * 0.86, bY - ch], [hx2 + Rc * 0.86, bY - ch], [hx2 + Rc, bY + 2]]);
      hatSolid(hk, bY, Rb, Rc, 16 * fz / Rb, (q) => -5 * fz * Math.sin(q) ** 2 + 4 * fz * Math.max(0, Math.cos(q)) ** 2, crown, (cp) => { const band = new Path2D(); band.rect(hx2 - Rb, bY - 18 * fz, Rb * 2, 14 * fz); g.save(); g.clip(cp); g.fillStyle = o.bandCol || '#c84a6a'; g.fill(band); g.restore();
        cel(g, polyPath(ringPts(Rc * 0.86, bY - ch, 0.18, () => 0, -Math.PI, Math.PI, 20)), mixc(hk, '#ffffff', 0.08), 2.2, 0, 0, 0); });
      const fs = turned ? -dv : -1, fb = [hx2 + fs * Rc * 0.8, bY - 12 * fz], fcol = o.featherCol || '#e8a040';
      for (const [dx, dy, w0] of [[10, -96, 13], [26, -80, 10], [-4, -104, 9]]) { const pts = [fb, [fb[0] + fs * dx * 0.3 * fz, fb[1] + dy * 0.55 * fz], [fb[0] + fs * dx * fz, fb[1] + dy * fz], [fb[0] + fs * (dx + 18) * fz, fb[1] + (dy + 16) * fz]]; taper(g, pts, (w0 + 4) * fz, INK, 0.2); taper(g, pts, w0 * fz, fcol, 0.2); taper(g, pts, 1.4 * fz, mixc(fcol, INK, 0.4), 0.6); }
      for (const [dx, dy, c] of [[0, 0, '#f2e8f0'], [12, 4, '#e86a8a'], [-8, 6, '#f2d050']]) cel(g, ellP(fb[0] + fs * dx * fz, fb[1] + dy * fz, 8 * fz, 7 * fz), c, 1.6, 1, 1, 0); } };
  const LIBEYE = ['love', 'dreamy'];
  const libEye = (E, ex, ey, s, lx, lyy) => { if (E === 'love') { const hp = new Path2D(), x = lx, y = lyy + 1, r = 12; hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); hp.closePath();
      g.fillStyle = '#e8344a'; g.fill(hp); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(hp); g.beginPath(); g.ellipse(x - 5, y - 4, 3, 2, -0.5, 0, TAU); g.fillStyle = '#fff'; g.fill(); return; }
    const rx = 9.4, ry = 13.4, Y = lyy - 1.5, eP = ellP(lx, Y, rx, ry, s * 0.05); g.fillStyle = INK; g.fill(eP); g.save(); g.clip(eP); g.fillStyle = 'rgba(120,100,220,0.55)'; g.beginPath(); g.ellipse(lx, Y + ry * 0.55, rx, ry * 0.5, 0, 0, TAU); g.fill();
    g.beginPath(); g.arc(lx - 3, Y - 5, 4.2, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? 1.2 : 4.4, an = k * Math.PI / 4; g.lineTo(lx + 3 + rr * Math.cos(an), Y + 4 + rr * Math.sin(an)); } g.closePath(); g.fill(); g.beginPath(); g.arc(lx - 4, Y + 6, 1.2, 0, TAU); g.fill(); g.restore();
    taper(g, [[lx - s * (rx + 1), Y - ry * 0.5], [lx, Y - ry - 1.5], [lx + s * (rx + 3), Y - ry * 0.55]], 2.6, INK, 0.3); taper(g, [[lx + s * (rx - 1), Y - ry * 0.7], [lx + s * (rx + 5), Y - ry * 1.05]], 2, INK, 0.3); };
  const MCL = '#5a1e30', libMouth = (E, my, openMouth, cheekTicks) => { if (E === 'love') { openMouth(14, 9, 1.15); cheekTicks(14); } else if (E === 'dreamy') { taper(g, arcPts(0, my - 10, 13, Math.PI * 0.2, Math.PI * 0.8, 10), 3.4, INK, 0.3); cheekTicks(12); }
    else if (E === 'sly') { const p = new Path2D(); p.moveTo(-13, my + 1); p.quadraticCurveTo(2, my + 9, 17, my - 9); p.quadraticCurveTo(3, my + 3, -13, my + 1); p.closePath(); g.fillStyle = MCL; g.fill(p); taper(g, [[-13, my + 1], [2, my + 6], [17, my - 9]], 3.4, INK, 0.3); taper(g, arcPts(21, my - 10, 5, -0.7, 1.3, 5), 1.6, mixc(skin, INK, 0.45), 0.2); } };
  const libMarks = (fm, ey, w, kF, mo) => { const heart = (x, y, r, col, a = 1) => { const hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.globalAlpha = a; g.fillStyle = col; g.fill(hp); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(hp); g.globalAlpha = 1; };
    if (expr === 'love' || expr === 'dreamy') { const n = expr === 'love' ? 3 : 1; for (let i = 0; i < n; i++) { const p = fr1(TT / 60 + i / n), x = (i % 2 ? 1 : -1) * (w + 16 + 10 * Math.sin(p * 9 + i)) + mo, y = -60 - p * 110; heart(x, y, 9 + 5 * (1 - p), '#ef4a62', clamp((1 - p) * 2.2, 0, 1) * clamp(p * 8, 0, 1)); } }
    if (expr === 'dreamy') for (const [sx, sy, r0, ph2] of [[-w - 18, -40, 9, 0], [w + 22, -70, 7, 2], [w + 4, -118, 6, 4]]) { const k = 0.6 + 0.4 * Math.sin(TT * 0.25 + ph2); g.beginPath(); for (let j = 0; j < 8; j++) { const rr = (j % 2 ? r0 * 0.3 : r0) * k, an = j * Math.PI / 4; g.lineTo(sx + mo + rr * Math.cos(an), sy + rr * Math.sin(an)); } g.closePath(); g.fillStyle = '#fff4b0'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = INK; g.stroke(); }
    if (o.monocle) { const sM = turned ? -Math.sign(HY || dv) : -1, m = fm(sM * w * 0.38, ey, kF), pop = op.monoclePop; if (m.c < 0.18 && !pop) return;
      const R = 17 * (pop ? 1 : m.sx), mx = pop ? sM * w * 0.5 + 6 * Math.sin(TT * 0.3) + mo : m.x, myy = pop ? 168 : ey + 1, ax = mx + (pop ? 0 : sM * 13), ay = myy + 12;
      const cd = pop ? [[sM * w * 0.75, 80], [sM * w * 0.7, 130], [mx + sM * 4, myy - 16]] : [[ax, ay], [ax + sM * 10, 60], [sM * w * 0.7, 120], [sM * w * 0.62, 170]]; taper(g, cr(cd, false, 6), 2.2, INK, 0.7); taper(g, cr(cd, false, 6), 1.1, '#d8b048', 0.7);
      const lp = ellP(mx, myy, R * (pop ? 0.8 : 1), R); g.fillStyle = 'rgba(215,232,255,0.22)'; g.fill(lp); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(lp); g.lineWidth = 2.4; g.strokeStyle = '#d8b048'; g.stroke(lp); g.beginPath(); g.ellipse(mx - 5, myy - 5, 8, 8, 0, Math.PI * 1.05, Math.PI * 1.5); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,0.9)'; g.stroke(); } };
  // ---------- [KCH-cast] 1830s Ohio cast: beard 'burns' (long sideburns) / 'chops' (mutton chops), moustache stache 'curl' (waxed handlebar), hat 'bonnet' (poke bonnet + chin bow),
  // o.shawl (draped shawl), o.suspenders (adult braces), o.hoodie (modern hoodie: hood, drawstrings, kangaroo pocket, ribbed hem); poses op.cross (arms crossed),
  // op.tummy (both hands clutch the belly), op.count (free hand holds up a gold coin), op.point (near arm points forward/up, for a pointer stick).
  const kchBeardSkip = (Y, th) => (BRD === 'burns' ? Y > 50 || Math.abs(th) < 1.12 || Math.cos(th + HY) < 0.05 || AH > 0.7 : BRD === 'chops' ? Y > 92 || Math.abs(th) < 0.78 || (Y > 70 && Math.abs(th) < 1.0) : false);
  const kchArm = (s, S, ad) => {
    if (op.grapple) { const k = op.grapple, E = ad(S, s * AL * 0.14, AL * (0.5 - 0.2 * k), AL * 0.5 * k); return [S, E, ad(E, s * AL * 0.02, -AL * 0.18 * k, AL * 0.75 * k)]; } // [LN-cast] wrestling tie-up: both arms forward at shoulder height
    if (op.tummy) { const E = ad(S, s * AL * 0.5, AL * 0.58, AL * 0.3); return [S, E, [s * TW * 0.28, shY + AL * 1.0, AL * 0.7]]; }
    if (op.cross && !(HOLD[op.prop] && s === PA)) { const E = ad(S, s * AL * 0.36, AL * 0.6, AL * 0.3); return [S, E, [-s * TW * 0.72, shY + AL * (s > 0 ? 0.56 : 0.66), AL * (s > 0 ? 0.85 : 0.7)]]; }
    if (op.count && s === -PA) { const E = ad(S, s * AL * 0.48, AL * 0.62, AL * 0.3); return [S, E, ad(E, -s * AL * 0.1, -AL * 0.62, AL * 0.4)]; }
    if (op.point && s === PA) { const E = ad(S, s * AL * 0.66, -AL * 0.1, AL * 0.2); return [S, E, ad(E, s * AL * 0.62, -AL * 0.4, AL * 0.1)]; }
    return null; };
  const kchHand = (Hp, s) => { if (!(op.count && s === -PA)) return; const x = Hp[0], y = Hp[1] - 24, fl = Math.cos((op.t || 0) * 0.5);
    cel(g, ellP(x, y, 17 * Math.max(0.25, Math.abs(fl)), 17), '#e8b830', 2.6, 3, 3, 0); cel(g, ellP(x, y, 11 * Math.max(0.25, Math.abs(fl)), 11), '#f6d460', 0, 2, 2, 0); taper(g, [[x - 6 * fl, y - 8], [x - 2 * fl, y - 12]], 2.4, 'rgba(255,255,255,0.8)', 0.3);
    if (Math.abs(fl) > 0.7) for (let k = 0; k < 4; k++) { const an = k * 1.57 + 0.8; taper(g, [[x + Math.cos(an) * 24, y + Math.sin(an) * 24], [x + Math.cos(an) * 32, y + Math.sin(an) * 32]], 2.4, '#fff3b0', 0.3); } };
  const kchTorso = () => { if (BACKB) return;
    if (o.suspenders && !kidT) for (const s of [-1, 1]) { if (tV(cx + s * WW * 0.5, hemY - 10) < -4) continue; const st = polyPath(TP([[cx + s * TW * 0.42, shY + 2], [cx + s * TW * 0.58, shY + 6], [cx + s * WW * 0.56, hipY + 4], [cx + s * WW * 0.38, hipY + 4]])); g.save(); g.clip(torsoP); cel(g, st, o.suspenders, 1.8, 3, 0, 0); g.restore();
      decal(cx + s * WW * 0.47, hipY - 8, () => cel(g, ellP(cx + s * WW * 0.47, hipY - 8, 4.5, 4.5), '#c8a048', 1.4, 1, 1, 0)); }
    if (o.hoodie) { const hc = o.shirt, fc = mixc(hc, INK, 0.45); g.save(); g.clip(torsoP);
      const pk = polyPath(TP([[cx - WW * 0.62, hemY - 64], [cx + WW * 0.62, hemY - 64], [cx + WW * 0.8, hemY - 14], [cx - WW * 0.8, hemY - 14]])); cel(g, pk, hc, 2, 4, 3, 0, twill(hc));
      for (const s of [-1, 1]) taper(g, TP([[cx + s * WW * 0.62, hemY - 64], [cx + s * WW * 0.8, hemY - 14]]), 2.2, fc, 0.2);
      const rb = new Path2D(); rb.rect(cx - 300, hemY - 14, 600, 20); g.fillStyle = mixc(hc, INK, 0.18); g.fill(rb); g.strokeStyle = fc; g.lineWidth = 1.2; for (let x = cx - 120; x < cx + 120; x += 7) { g.beginPath(); g.moveTo(tX(x, hemY - 12), hemY - 12); g.lineTo(tX(x, hemY), hemY); g.stroke(); }
      g.restore(); for (const s of [-1, 1]) { const dsw = Math.sin(TT * 0.3 + s) * 3 * MV; taper(g, TP([[cx + s * 10, shY + 12], [cx + s * 12 + dsw, shY + 46], [cx + s * 11 + dsw, shY + 72]]), 3, '#f4f0ea', 0.6); cel(g, ellP(tX(cx + s * 11, shY + 74) + dsw, shY + 76, 3.4, 4.5), '#d8d4d0', 1.4, 0, 0, 0); } }
    if (o.shawl) { const sc = o.shawl, fc = mixc(sc, INK, 0.4), V = shY + torsoH * 0.5;
      const sp = polyPath(TP([[cx - TW * 1.02, shY - 2], [cx - NW, shY - 14], [cx + NW, shY - 14], [cx + TW * 1.02, shY - 2], [cx + TW * 1.0, shY + 46], [cx + TW * 0.5, V - 20], [cx, V + 10], [cx - TW * 0.5, V - 20], [cx - TW * 1.0, shY + 46]]));
      cel(g, sp, sc, 2.8, 6, 4, 3, (h) => { h.fillStyle = 'rgba(255,240,200,0.28)'; for (let y = shY - 20; y < V + 20; y += 22) h.fillRect(0, y, 600, 4); for (let x = cx - 300; x < 600; x += 22) h.fillRect(x, shY - 20, 4, V - shY + 40); });
      const fr = TP([[cx - TW * 1.0, shY + 46], [cx - TW * 0.5, V - 20], [cx, V + 10], [cx + TW * 0.5, V - 20], [cx + TW * 1.0, shY + 46]]); for (let i = 0; i < fr.length - 1; i++) for (let k = 0; k < 5; k++) { const p = lerp(fr[i], fr[i + 1], (k + 0.5) / 5); taper(g, [p, [p[0], p[1] + 11]], 2, fc, 0.4); }
      cel(g, ellP(tX(cx, shY + 30), shY + 30, 9, 8), '#d8b048', 2, 2, 2, 0); } };
  const kchCollar = () => { if (!o.hoodie) return; const hc = o.shirt, W0 = NW + 26, hp = polyPath([...arcPts(ncx, shY + 6, W0, Math.PI * 0.98, Math.PI * 2.02, 14, 34), ...arcPts(ncx, shY + 10, NW + 4, Math.PI * 2.0, Math.PI * 1.0, 10, 14)]);
    cel(g, hp, mixc(hc, '#000000', 0.06), 3, 5, 4, 3, twill(hc)); taper(g, arcPts(ncx, shY + 10, NW + 10, Math.PI * 1.05, Math.PI * 1.95, 10, 18), 1.8, mixc(hc, INK, 0.45), 0.2); };
  const napHat = () => { if (o.hat !== 'bicorne' && o.hat !== 'bearskin') return; const K = o.hatK || 1, x0 = hcx - SN * 4 * fz, ac = Math.abs(Math.cos(HY)), as = Math.abs(Math.sin(HY)); // [NAP-cast]
    if (o.hat === 'bicorne') { const hk = o.hatCol || '#1e1c24', bY = hy - HH * 0.56, w = HW * K * (1.6 * ac + 0.62 * as), h = 80 * fz * K, tip = 34 * fz * K;
      const P = new Path2D(); P.moveTo(x0 - w, bY - tip); P.bezierCurveTo(x0 - w * 0.86, bY - h * 0.8, x0 - w * 0.3, bY - h * 1.14, x0, bY - h * 1.1); P.bezierCurveTo(x0 + w * 0.3, bY - h * 1.14, x0 + w * 0.86, bY - h * 0.8, x0 + w, bY - tip);
      P.bezierCurveTo(x0 + w * 0.72, bY - h * 0.12, x0 + w * 0.36, bY + 8 * fz, x0, bY + 8 * fz); P.bezierCurveTo(x0 - w * 0.36, bY + 8 * fz, x0 - w * 0.72, bY - h * 0.12, x0 - w, bY - tip); P.closePath();
      cel(g, P, hk, 3.8, 10, 5, 4); g.save(); g.clip(P);
      taper(g, [[x0 - w * 0.9, bY - tip - 8 * fz], [x0 - w * 0.4, bY - 4 * fz], [x0 + w * 0.4, bY - 4 * fz], [x0 + w * 0.9, bY - tip - 8 * fz]], 3.4 * fz, rgba(lt(hk, 0.5), 0.55), 0.2);
      taper(g, [[x0 - SG * w * 0.62, bY - h * 0.82], [x0 - SG * w * 0.2, bY - h * 1.02]], 5 * fz, 'rgba(255,255,255,0.22)', 0.3); g.restore();
      if (Math.cos(HY) > -0.1) { const cx2 = x0 - w * 0.5 * (o.cockSide || 1), cy2 = bY - h * 0.55, r = 15 * fz * K * Math.max(0.5, ac); cel(g, ellP(cx2, cy2, r, 15 * fz * K), '#2a4ab0', 2.4, 2, 2, 0); cel(g, ellP(cx2, cy2, r * 0.66, 10 * fz * K), '#f4f2ea', 1.6, 0, 0, 0); cel(g, ellP(cx2, cy2, r * 0.33, 5 * fz * K), '#d0302c', 1.2, 0, 0, 0);
        taper(g, [[cx2, cy2 - 15 * fz * K], [cx2 + 4 * fz, cy2 + 20 * fz * K]], 3 * fz, '#c8a040', 0.2); } }
    if (o.hat === 'bearskin') { const hk = o.hatCol || '#17141c', bY = hy - HH * 0.5, w = HW * 1.04 * K, h = 200 * fz * K;
      const P = new Path2D(); P.moveTo(x0 - w, bY + 6 * fz); P.bezierCurveTo(x0 - w * 1.12, bY - h * 0.5, x0 - w * 0.95, bY - h * 0.95, x0, bY - h); P.bezierCurveTo(x0 + w * 0.95, bY - h * 0.95, x0 + w * 1.12, bY - h * 0.5, x0 + w, bY + 6 * fz); P.quadraticCurveTo(x0, bY + 16 * fz, x0 - w, bY + 6 * fz); P.closePath();
      cel(g, P, hk, 3.6, 14, 6, 4); g.save(); g.clip(P); const R = (i) => { const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
      for (let i = 0; i < 90; i++) { const u = R(i) * 2 - 1, v = R(i + 300), X = x0 + u * w, Y = bY - v * h; taper(g, [[X, Y], [X + (u * 4 + 2) * fz, Y + 12 * fz]], 2.2 * fz, R(i + 7) < 0.5 ? 'rgba(90,80,110,0.5)' : 'rgba(0,0,0,0.45)', 0.1); }
      taper(g, [[x0 - SG * w * 0.6, bY - h * 0.3], [x0 - SG * w * 0.55, bY - h * 0.8]], 10 * fz, 'rgba(160,150,190,0.22)', 0.3); g.restore();
      if (Math.cos(HY) > 0.2) { const px = x0 + Math.sin(HY) * w * 0.5, py = bY - h * 0.28; cel(g, polyPath([[px - 26 * fz * ac, py + 22 * fz], [px - 30 * fz * ac, py - 26 * fz], [px, py - 40 * fz], [px + 30 * fz * ac, py - 26 * fz], [px + 26 * fz * ac, py + 22 * fz]]), '#d8a838', 2.4, 4, 3, 2);
        cel(g, ellP(px, py - 6 * fz, 10 * fz * ac, 12 * fz), '#b8862a', 1.4, 0, 0, 0); }
      { const sx = x0 - w * 0.86 * (Math.sin(HY) > 0.3 ? -1 : 1); const pl = smooth([[sx, bY - h * 0.35], [sx - 8 * fz, bY - h * 0.7], [sx + 2 * fz, bY - h * 1.12], [sx + 10 * fz, bY - h * 0.72]], 5); cel(g, pl, '#c8282c', 2.6, 4, 3, 2); }
      taper(g, [[x0 - w * 0.95, bY - h * 0.15], [x0 - w * 0.2, bY - h * 0.05], [x0 + w * 0.6, bY - h * 0.2]], 2.4 * fz, '#f2ece0', 0.2); } };
  const kchHat = () => { if (o.hat !== 'bonnet') return; const hk = o.hatCol || '#e8dcc0', bc = o.bandCol || '#c8403a', ox = -Math.sin(HY) * HW * 0.22, cxB = hcx + ox, cyB = hy - HH * 0.12;
    const out = arcPts(cxB, cyB, HW * 1.24, Math.PI * 0.86, Math.PI * 2.14, 24, HH * 1.08), inn = arcPts(cxB + ox * 0.3, hy + HH * 0.02, HW * 1.0, Math.PI * 2.1, Math.PI * 0.9, 20, HH * 0.98);
    const bp = polyPath([...out, ...inn]); cel(g, bp, hk, 3.4, HW * 0.12, HH * 0.06, 4, (h) => { h.strokeStyle = rgba(mixc(hk, INK, 0.3), 0.35); h.lineWidth = 1.4; for (let k = 1; k < 5; k++) { h.beginPath(); arcPts(cxB, cyB, HW * (1.0 + k * 0.05), Math.PI * 0.88, Math.PI * 2.12, 20, HH * (0.95 + k * 0.03)).forEach(([x, y], i) => i ? h.lineTo(x, y) : h.moveTo(x, y)); h.stroke(); } });
    taper(g, arcPts(cxB + ox * 0.3, hy + HH * 0.02, HW * 1.02, Math.PI * 1.15, Math.PI * 1.85, 14, HH * 1.0), 6 * fz, rgba(bc, 0.9), 0.4);
    const yC = hy + HH * 1.0, xC = hcx + Math.sin(HY) * HW * 0.2; for (const s of [-1, 1]) { const a = out[s < 0 ? 0 : out.length - 1]; taper(g, [a, [a[0] - s * 10 * fz, (a[1] + yC) / 2], [xC + s * 6 * fz, yC]], 6 * fz, INK, 0.6); taper(g, [a, [a[0] - s * 10 * fz, (a[1] + yC) / 2], [xC + s * 6 * fz, yC]], 3.6 * fz, bc, 0.6); }
    const bw = new Path2D(); for (const s of [-1, 1]) polyPath([[xC, yC], [xC + s * 24 * fz, yC - 12 * fz], [xC + s * 26 * fz, yC + 10 * fz]], bw); cel(g, bw, bc, 2.4, 3, 2, 0); cel(g, ellP(xC, yC, 6 * fz, 6 * fz), dk(bc, 0.85), 2, 1, 1, 0);
    for (const s of [-1, 1]) taper(g, [[xC + s * 3 * fz, yC + 4 * fz], [xC + s * 10 * fz, yC + 40 * fz]], 6 * fz, bc, 0.5); };
  const kchStache = (fm) => { const mc = o.moustache, side = []; for (const s of [-1, 1]) { const P = [[2, 40], [14, 40], [26, 41], [34, 36], [36, 28], [31, 25]].map(([x, y]) => { const m = fm(s * x, y, AH > 0.8 ? 1.25 : 1); return { x: m.x + (AH > 0.8 ? dv * 4 : 0), y, c: m.c }; }); if (P[1].c < 0.1) continue; side.push(P); }
    for (const P of side) { const pts = P.map((q) => [q.x, q.y]); taper(g, pts, 13, INK, 0.12); taper(g, pts, 9, mc, 0.12); taper(g, pts.slice(0, 3).map(([x, y]) => [x, y - 2]), 2.4, rgba(lt(mc, 0.5), 0.6), 0.2); } };
  // ---------- shared pattern painter (clothes) ----------
  const fabric = (clipW = 600) => (h) => {
    const P = o.pattern, y0 = shY - 40, y1 = o.pj ? 1000 : hipY + 80; // [TEDDY-cast] pj: pattern runs down the legs
    if (!P) twill(o.shirt)(h);
    if (o.stripe && !jacket) { h.fillStyle = o.stripe; for (let y = shY + 44; y < y1; y += 46) h.fillRect(0, y, clipW, 15); }
    if (P === 'plaid') { h.fillStyle = 'rgba(20,10,40,0.16)'; for (let y = y0; y < y1; y += 46) h.fillRect(0, y, 600, 17); for (let x = cx - 300; x < 600; x += 46) h.fillRect(x, y0, 17, y1 - y0);
      h.fillStyle = o.plaidLine || 'rgba(255,240,200,0.45)'; for (let y = y0 + 30; y < y1; y += 46) h.fillRect(0, y, 600, 2.2); for (let x = cx - 270; x < 600; x += 46) h.fillRect(x, y0, 2.2, y1 - y0); }
    if (P === 'vstripe') { h.fillStyle = o.stripeCol || 'rgba(255,255,255,0.55)'; for (let x = cx - 300; x < 600; x += 30) h.fillRect(x, y0, 9, y1 - y0); } // [TEDDY-cast] pyjama stripes
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
  const hc = o.hairCol || '#3a2a20', hairOn = o.hair && o.hair !== 'bald' && o.hair !== 'tufts'; // [EIN-cast] tufts: bald crown
  const sway = (k) => Math.sin(TT * 0.45 + k * 1.3) * 3 * MV + flap * 2.2 + trail * 3;
  // ---------- back hair (behind everything) ----------
  g.save(); upper();
  if (o.hair === 'bun' && !BACKH) { const bx = hcx + 4 - SN * HW * 0.62, by = hy - HH * (1.02 - 0.22 * AH); cel(g, ellP(bx, by, HW * 0.38 * (1 - 0.15 * AH), HH * 0.34), hc, 3.4, 8, 7, 3); taper(g, arcPts(bx, by, HW * 0.24, 3.6, 5.4, 8, HH * 0.2), 2.2, mixc(hc, INK, 0.4)); }
  if (o.hair === 'long' && !BACKH) { const sw = Math.sin(TT * 0.4) * 4 * MV + trail * 8 + flap * 3, by = shY + 70, kx = 1 - 0.25 * AS, ox = -SN * HW * 0.3;
    const X = (x) => hcx + ox + (x - hcx) * kx;
    const lp = smooth([[X(hcx - HW * 1.04), hy - HH * 0.2], [X(hcx - HW * 1.12), hy + HH * 0.6], [X(hcx - HW * 1.08) + sw, by - 20], [X(hcx - HW * 0.8) + sw, by], [X(hcx - HW * 0.45) + sw, by - 12], [X(hcx), by - 4], [X(hcx + HW * 0.45) + sw, by - 12], [X(hcx + HW * 0.8) + sw, by], [X(hcx + HW * 1.08) + sw, by - 20], [X(hcx + HW * 1.12), hy + HH * 0.6], [X(hcx + HW * 1.04), hy - HH * 0.2], [X(hcx), hy - HH * 1.1]], 8);
    cel(g, lp, dk(hc, 0.9), 3.6, 10, 6, 4); g.save(); g.clip(lp); for (let k = -2; k <= 2; k++) taper(g, [[X(hcx + k * HW * 0.3), hy + HH * 0.4], [X(hcx + k * HW * 0.34) + sw * 0.8, by - 18]], 1.8, mixc(hc, INK, 0.5), 0.1); g.restore(); }
  g.restore();
  if (o.hair === 'wild' || o.hair === 'tufts') { g.save(); upper(); g.translate(cx, shY); g.rotate(einTilt); g.translate(-cx, -shY); einHair('back'); g.restore(); } // [EIN-cast] hair cloud behind the head
  // ---------- legs: rig ----------
  const legs = [-1, 1].map((s) => {
    const p = ph + (s > 0 ? 0.5 : 0), lat = s * HPW * 0.47 + hs, hj3 = [lat, hipY - 6, 0]; let K3, A3, pitch = 0, Ls = 0;
    if (mode === 'sit') { K3 = [s * HPW * 0.95, hipY + 10, legL * 0.42 * AS]; A3 = [s * HPW * 1.0, ank, legL * 0.42 * AS]; }
    else if (mode === 'fall') { K3 = [s * HPW * 1.25, hipY + legL * 0.36, 0]; A3 = [s * HPW * 1.85, ank - 44, 0]; }
    else if (gaitOn) { const [th, ka] = legAng(p), kl = lat + s * 3, al = s * (HPW * 0.5 + 4);
      K3 = [kl, hj3[1] + L1 * Math.cos(th), L1 * Math.sin(th)]; A3 = [al, K3[1] + L1 * Math.cos(th - ka), K3[2] + L1 * Math.sin(th - ka)];
      pitch = tab(RUN ? [[0, 0.2], [0.1, 0], [0.3, -0.1], [0.5, -0.9], [0.65, -0.6], [0.88, 0.1], [1, 0.2]] : [[0, 0.38], [0.1, 0], [0.32, 0], [0.5, -0.75], [0.62, -0.5], [0.86, 0.06], [1, 0.38]], fr1(p)) * GA;
      Ls = clamp(K3[2] / (L1 * 0.8), 0, 1) * 0.5 * CS; }
    else { const bent = hs && s === -1; K3 = [lat + (bent ? s * -8 : s * 2), hipY + legL * 0.5, 0]; A3 = [s * (HPW * 0.5 + 4) + hs * 0.5 + (bent ? s * 10 : 0), ank, 0]; }
    const hj = P3(...hj3), K = P3(...K3), A = P3(...A3);
    return { s, hj, K, A, fy: A[1], Ls, pitch, depth: dep(hj3[0], 0) + dep(A3[0], A3[2]) * 0.5 };
  });
  const rl = HPW * 0.5;
  const pantsCol = o.dress ? skin : o.pants || '#3b3f52', crc = mixc(pantsCol, INK, 0.5), skirtCol = o.pants || '#3b3f52';
  const pantPat = o.pj ? (h) => { twill(pantsCol)(h); fabric()(h); } : twill(pantsCol); // [TEDDY-cast] pyjama trousers share the top's pattern // [CASTRO-cast] dress: bare legs
  const hipBlock = () => { const bx = (x, y, s) => cx + (x - cx) * wk + lean * SN * Math.max(0, hipY - y) + (turned && s === -dv ? -dv * AS * 6 * (y > waistY + 20 ? 1 : 0) : 0) + (turned && s === dv && B.belly ? dv * AS * TW * 0.1 : 0);
    return [[bx(cx - WW * 0.97, waistY, -1), waistY], [bx(cx + WW * 0.97, waistY, 1), waistY], [bx(cx + HPW, hipY - 18, 1), hipY - 18], [bx(cx + HPW * 0.5, hipY + 8, 1), hipY + 8], [cx, hipY + 12], [bx(cx - HPW * 0.5, hipY + 8, -1), hipY + 8], [bx(cx - HPW, hipY - 18, -1), hipY - 18]]; };
  const legPath = (L, P) => { const near = mode === 'sit' ? 1.08 : 1 + 0.22 * L.Ls; const LA = o.sandals ? [L.A[0], L.A[1] - 26] : L.A; /* [EIN-cast] shorter trousers over bare ankles */ return limb([L.hj, lerp(L.hj, L.K, 0.5), L.K, lerp(L.K, LA, 0.55), LA], [rl, rl * 0.9, rl * 0.76 * near, rl * 0.74, rl * 0.7], P); };
  const legLines = (L) => { const s = L.s; if (o.boots) bootShaft(L); if (o.dress) return; /* [CASTRO-cast] */
    if (mode !== 'sit') taper(g, [lerp(L.hj, L.K, 0.25), [L.K[0] - s * rl * 0.15 * CS + SN * rl * 0.2, L.K[1]], lerp(L.K, L.A, 0.85)], 2.2, crc, 0.1);
    const bend = Math.abs(Math.atan2(L.K[0] - L.hj[0], L.K[1] - L.hj[1]) - Math.atan2(L.A[0] - L.K[0], L.A[1] - L.K[1]));
    if (bend > 0.25 || mode === 'sit') { const bx = turned ? -dv * rl * 0.35 : 0; taper(g, [[L.K[0] - rl * 0.5 + bx, L.K[1] + 6], [L.K[0] + bx, L.K[1] + 2], [L.K[0] + rl * 0.5 + bx, L.K[1] + 6]], 2.4, crc, 0.2); }
    else taper(g, [[L.K[0] - s * rl * 0.62 * CS, L.K[1] - 4], [L.K[0] - s * rl * 0.3 * CS, L.K[1] + 6]], 2, crc, 0.2);
    taper(g, [[L.A[0] - rl * 0.62, L.A[1] - 8], [L.A[0] + rl * 0.62, L.A[1] - 8]], 1.8, crc, 0.4); };
  const heelShoe = (L) => { const fx = L.A[0], up = Math.max(0, -L.pitch), fy = L.fy - up * 10, sh = o.shoes || '#3a2a2a';
    if (up > 0.05) { const so = ellP(fx, fy + 12, 16, 3 + up * 16); cel(g, so, '#2a1e1e', 2.4, 0, 0, 0); g.save(); g.clip(so); g.fillStyle = 'rgba(120,90,80,0.5)'; for (let k = -1; k <= 1; k++) g.fillRect(fx - 14, fy + 8 + k * 5 + up * 6, 28, 1.6); g.restore(); }
    const hp = smooth([[fx - 17, fy - 14], [fx + 17, fy - 14], [fx + 18, fy + 6], [fx + 12, fy + 13], [fx - 12, fy + 13], [fx - 18, fy + 6]], 5); cel(g, hp, sh, 3.4, 6, 5, 3);
    g.save(); g.clip(hp); g.fillStyle = '#1d1426'; g.fillRect(fx - 30, fy + 7, 60, 8); g.fillStyle = '#3a2418'; g.fillRect(fx - 12, fy + 4, 24, 10); g.restore(); taper(g, [[fx - 10, fy - 12], [fx, fy - 9], [fx + 10, fy - 12]], 1.6, mixc(sh, INK, 0.4), 0.2); };
  const shoe = (L) => { if (o.sandals) return sandal(L); /* [EIN-cast] */ if (o.scuba) return fin(L); if (BACKB && !turned) return heelShoe(L); /* [CASTRO-cast] fins */ const s = L.s, toe = turned ? dv : s, kL = turned ? 0.9 + 0.15 * AS : 1, fx = L.A[0] + toe * 9 * kL, fy = L.fy + (!gaitOn && mode === 'run' ? -4 : 0);
    const sp = smooth([[fx - toe * 22 * kL, fy - 12], [fx + toe * 6 * kL, fy - 17], [fx + toe * 30 * kL, fy - 8], [fx + toe * 37 * kL, fy + 5], [fx + toe * 28 * kL, fy + 13], [fx - toe * 4 * kL, fy + 14], [fx - toe * 27 * kL, fy + 9], [fx - toe * 28 * kL, fy - 2]], 6);
    g.save(); if (L.pitch) { const pv = L.pitch > 0 ? [fx - toe * 26 * kL, fy + 12] : [fx + toe * 32 * kL, fy + 12]; g.translate(pv[0], pv[1]); g.rotate(-toe * L.pitch); g.translate(-pv[0], -pv[1]); }
    cel(g, sp, o.shoes || '#3a2a2a', 3.4, 6, 5, 3);
    g.save(); g.clip(sp); g.fillStyle = '#1d1426'; g.fillRect(fx - 50, fy + 8, 100, 10); g.fillStyle = '#3a2418'; g.fillRect(fx - toe * 30 * kL, fy + 6, toe * 14 * kL, 10); g.restore(); line(g, [[fx - toe * 16 * kL, fy + 6], [fx - toe * 16 * kL, fy + 14]], 1.4); line(g, [[fx - toe * 26 * kL, fy + 8], [fx + toe * 31 * kL, fy + 8]], 1.6);
    taper(g, [[fx - toe * 8, fy - 12], [fx + toe * 12, fy - 9]], 3, 'rgba(255,255,255,0.55)', 0.4);
    if (runner) for (let k = 0; k < 2; k++) line(g, [[fx + toe * (-2 + k * 8), fy - 15], [fx + toe * (4 + k * 8), fy - 9]], 2, '#e8e4dc');
    g.restore(); };
  const showPants = !lady || !!o.dress || mode === 'sit' || mode === 'fall' || (mode === 'run' && !gaitOn);
  const legOrder = turned ? legs.slice().sort((a, b) => a.depth - b.depth) : legs;
  // ---------- arms: rig ----------
  const PA = turned && dv > 0 ? -1 : 1; // the arm that holds props / waves (the near one when turned)
  const r = op.reach || 0;
  const arm3 = (s) => { const S = [s * (TW - 10), shY + 24, -9 * AS], ad = (p, x, y, z = 0) => [p[0] + x, p[1] + y, p[2] + z];
    if (mode === 'fall') { const E = ad(S, s * AL * 0.72, -AL * 0.36); return [S, E, ad(E, s * AL * 0.4, -AL * 0.78)]; }
    if (op.hug) { const E = ad(S, s * 16, AL * 0.74, AL * 0.3); return [S, E, [-s * TW * 0.2, shY + AL * 0.74, AL * 0.74]]; } // [TEDDY-cast] hug (teddy at the chest)
    { const KA = kchArm(s, S, ad); if (KA) return KA; } // [KCH-cast]
    { const LA = libArm(s, S, ad); if (LA) return LA; } // [LIB-cast]
    if (op.prop === 'stick' && s === PA) { const E = ad(S, s * AL * 0.72, AL * 0.3, AL * 0.2); return [S, E, ad(E, s * 4, -AL * 0.88, AL * 0.1)]; }
    if (op.grab != null && s === PA) { const k = op.grab; const E = ad(S, s * AL * (0.74 - 0.2 * k), AL * (0.6 - 0.48 * k), AL * 0.25); return [S, E, ad(E, s * AL * (0.86 - 0.3 * k), AL * (0.56 - 0.86 * k), AL * 0.25)]; } // [BOOTH-story] reach down-and-out to grab (0), then haul up (1)
    if (op.ear && s === PA) { const E = [s * (TW + 14), shY + AL * 0.62, AL * 0.3]; return [S, E, [s * HW * 0.9, hy + HH * 0.32, AL * 0.18]]; } // [EIN-cast] phone at the ear
    if (HOLD[op.prop] && s === PA) { const E = ad(S, s * AL * 0.5, AL * 0.78 - AL * 0.4 * r * (1 - 0.5 * AS), AL * (0.3 + 0.2 * AS)); return [S, E, ad(E, s * AL * (0.42 + 0.25 * r), -AL * (0.62 + 0.3 * r) * (1 - 0.55 * AS), AL * (0.35 + 0.3 * AS))]; }
    if (cheer) { const E = ad(S, s * AL * 0.55, -AL * (0.62 - 0.1 * AS), AL * (0.15 + 0.5 * AS)); return [S, E, ad(E, s * AL * 0.12, -AL * (0.92 - 0.25 * AS), AL * (0.1 + 0.6 * AS))]; }
    if (s === PA && wave !== undefined) { const E = ad(S, s * AL * 0.82, AL * 0.12, AL * (0.1 + 0.4 * AS)); return [S, E, ad(E, s * (-10 + 22 * (wave || 0)), -AL * 0.95, AL * (0.1 + 0.25 * AS))]; }
    if (op.hip && s === -PA) { const E = ad(S, s * AL * 0.62, AL * 0.58, -AL * 0.2); return [S, E, [s * (WW + 8), waistY + 6, -6]]; }
    if (gaitOn) { const p = ph + (s > 0 ? 0.5 : 0), Bq = (RUN ? 0.75 : 0.44) * GA + 1e-6, psi = -Bq * Math.cos(TAU * p - 0.35), be = (RUN ? 1.45 * GA : 0.22 + 0.42 * Math.max(0, psi / Bq)) + 0.06 * (1 - GA);
      const E = ad(S, s * 12, AL * 0.98 * Math.cos(psi), AL * 0.98 * Math.sin(psi)); return [S, E, ad(E, s * 3, AL * 0.95 * Math.cos(psi + be), AL * 0.95 * Math.sin(psi + be))]; }
    const E = ad(S, s * 17, AL * 0.98); return [S, E, ad(E, s * 2, AL * 0.95)]; };
  const SA = op.steer || 0, WC = [cx + SN * 40, shY + AL * 1.3], WR = 80 * Math.min(1.15, B.w), rimP = (s) => [WC[0] + Math.cos(SA) * s * (WR - 6) * Math.max(0.3, CS) - Math.sin(SA) * -5, WC[1] + Math.sin(SA) * s * (WR - 6) * 0.4 + Math.cos(SA) * -5];
  const arms = [-1, 1].map((s) => { if (op.drive) { const S = P3(s * (TW - 10), shY + 24, 0); return [s, [S, [S[0] + s * 30 * CS, S[1] + AL * 0.82], rimP(s)], 0]; }
    const A = arm3(s); return [s, A.map((p) => P3(...p)), dep(A[0][0], 0) + 0.3 * dep(A[2][0], A[2][2])]; });
  const farArm = (a) => (turned || BACKB) && a[2] < -8 && !op.drive;
  const hand = (Hp, ang, s, grip) => { // mitten hand + thumb, one outline
    kchHand(Hp, s); // [KCH-cast] coin
    if (libHand(Hp, ang, s, grip)) return; // [LIB-cast]
    const hp = ellP(Hp[0], Hp[1], 12.5 * Math.sqrt(B.w) * (o.build === 'kid' ? 0.85 : 1), 11.5 * (o.build === 'kid' ? 0.85 : 1), ang);
    const tx = Hp[0] + Math.cos(ang) * -3 + Math.cos(ang + s * Math.PI / 2) * -10, ty = Hp[1] + Math.sin(ang) * -3 + Math.sin(ang + s * Math.PI / 2) * -10;
    ellP(tx, ty, 6.5, 4.6, ang - s * 0.7, hp); const glove = o.neck === 'scarf' && o.hat === 'cap' && !o.plainCap; /* [TEDDY-cast] plainCap: no driving gloves/goggles */ /* [EIN-cast] fix: the fill was commented out (hands were invisible) */ cel(g, hp, glove ? '#8a5c36' : skin, 3, 4, 4, 2, null, glove ? SHADE : SHADE_SKIN);
    if (o.inky) for (const [a2, d2, r2] of [[0.5, 9, 3.4], [-0.3, 10, 2.6], [1.2, 6, 2.2]]) { g.beginPath(); g.ellipse(Hp[0] + Math.cos(ang + a2) * d2, Hp[1] + Math.sin(ang + a2) * d2, r2, r2 * 0.8, 0, 0, TAU); g.fillStyle = 'rgba(30,28,70,0.8)'; g.fill(); } // [TEDDY-cast] ink-stained fingers
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
      const sE = lerp(S, E, o.rolled ? 1.04 : 0.6), slv = limb([S, sE], [ra * 1.5, ra * (o.rolled ? 1.2 : 1.32)]); cel(g, slv, o.shirt, 3.4, 7, 5, 3, fabric());
      if (o.rolled) cel(g, limb([lerp(S, E, 0.86), sE], [ra * 1.42, ra * 1.42]), lt(o.shirt, 0.12), 2.4, 3, 2, 0, twill(o.shirt)); // [TEDDY-cast] rolled cuff
      const sa = Math.atan2(sE[1] - S[1], sE[0] - S[0]), nx = -Math.sin(sa) * ra * 1.3, ny = Math.cos(sa) * ra * 1.3;
      if (o.trim) { g.save(); g.clip(slv); line(g, [[sE[0] + nx, sE[1] + ny], [sE[0] - nx, sE[1] - ny]], 9, o.trim); g.restore(); }
      if (bent) taper(g, [E, [E[0] - s * 5, E[1] + 7]], 1.8, mixc(skin, INK, 0.5), 0.2);
    } else {
      const k = 1.1, slv = limb(pts, [ra * (lady ? 1.75 : 1.22) * k, ra * (lady ? 1.45 : 1.16) * k, ra * 0.98 * k, ra * 1.0 * k, ra * 0.92 * k]);
      cel(g, slv, o.shirt, 3.4, 7, 5, 3, fabric());
      if (o.garters) { const q = lerp(S, E, 0.56), aa = Math.atan2(E[1] - S[1], E[0] - S[0]), nx = -Math.sin(aa), ny = Math.cos(aa), ux = Math.cos(aa) * 5, uy = Math.sin(aa) * 5, wq = ra * 1.32; cel(g, polyPath([[q[0] + nx * wq - ux, q[1] + ny * wq - uy], [q[0] + nx * wq + ux, q[1] + ny * wq + uy], [q[0] - nx * wq + ux, q[1] - ny * wq + uy], [q[0] - nx * wq - ux, q[1] - ny * wq - uy]]), o.garters, 1.8, 2, 1, 0); } // [TEDDY-cast] sleeve garter
      const cuff = limb([lerp(E, Wr, 0.86), [Wr[0] + Math.cos(ang) * 4, Wr[1] + Math.sin(ang) * 4]], [ra * 0.86, ra * 0.84]); cel(g, cuff, o.cuff || '#f6f3ea', 2.6, 3, 2, 0);
      const fc = mixc(o.shirt, INK, 0.45);
      if (bent) { const n = [Math.cos(ang + Math.PI / 2), Math.sin(ang + Math.PI / 2)]; taper(g, [[E[0] + n[0] * ra * 0.5 - Math.cos(ang) * 6, E[1] + n[1] * ra * 0.5 - Math.sin(ang) * 6], [E[0] + n[0] * ra * 0.1, E[1] + n[1] * ra * 0.1]], 2, fc, 0.2); taper(g, [[E[0] - n[0] * ra * 0.7, E[1] - n[1] * ra * 0.7], [E[0] - n[0] * ra * 0.2 + Math.cos(ang) * 10, E[1] - n[1] * ra * 0.2 + Math.sin(ang) * 10]], 1.8, fc, 0.2); }
      else taper(g, [lerp(S, E, 0.8), lerp(E, Wr, 0.25)], 1.8, fc, 0.2);
      // shoulder seam / drape fold (reads the turn of the sleeve)
      taper(g, [lerp(S, E, 0.18), lerp(S, E, 0.42)], 1.6, fc, 0.1);
    }
    hand(H, ang, s, grip); FAR = 0; };
  // far arm: behind everything on the body
  g.save(); upper(); for (const a of arms) if (farArm(a)) drawArm(a); if (BACKB) drawProps(); g.restore();
  // ---------- legs, pants, shoes ----------
  if (showPants) {
    if (!turned) { const pantsP = polyPath(hipBlock()); for (const L of legs) legPath(L, pantsP); cel(g, pantsP, pantsCol, 3.6, rl * 0.5, 4, 6, pantPat); for (const L of legs) legLines(L); }
    else { const [Lf, Ln] = legOrder; FAR = 0.14; cel(g, legPath(Lf), pantsCol, 3.6, rl * 0.5, 4, 6, pantPat); legLines(Lf); FAR = 0;
      const pantsP = polyPath(hipBlock()); legPath(Ln, pantsP); cel(g, pantsP, pantsCol, 3.6, rl * 0.5, 4, 6, pantPat); legLines(Ln);
      taper(g, [[cx - dv * HPW * 0.5 * wk, hipY - 30], [cx - dv * HPW * 0.75 * wk, hipY - 4]], 2, crc, 0.2); }
  if (BACKB && showPants && !lady) { g.save(); g.clip(polyPath(hipBlock())); const pc = mixc(pantsCol, INK, 0.5); taper(g, [[cx, waistY + 20], [cx, hipY + 10]], 2, pc, 0.1);
      for (const s of [-1, 1]) { const px = tXb(cx + s * HPW * 0.48, hipY - 30); if (!jacket || hemY < hipY - 30) { const kq = clamp(-CS, 0.3, 1), pp = new Path2D(); pp.roundRect(px - 14 * kq, hipY - 40, 28 * kq, 20, 4); g.lineWidth = 1.8; g.strokeStyle = pc; g.stroke(pp); line(g, [[px - 11 * kq, hipY - 34], [px + 11 * kq, hipY - 34]], 1.4, pc); } } g.restore(); }
    if (o.belt || runner || (kidT && !o.pj)) { const pantsP = polyPath(hipBlock()); for (const L of legs) legPath(L, pantsP);
      const bt = o.belt || '#6a4428', bY0 = runner ? hemY + 1 : kidT ? hemY - 6 : waistY + 8, bp = new Path2D(); bp.rect(cx - HPW * 1.2, bY0, HPW * 2.4, 13); g.save(); g.clip(pantsP); cel(g, bp, bt, 0, 8, 0, 0); g.fillStyle = 'rgba(255,230,190,0.35)'; for (let x = cx - HPW; x < cx + HPW; x += 9) g.fillRect(x, bY0 + 2, 3, 1.2); g.restore();
      line(g, [[cx - HPW * 1.02 * wk, bY0 + 13], [cx + HPW * 1.02 * wk, bY0 + 13]], 1.6); decal(cx, bY0, () => { const bk = new Path2D(); bk.roundRect(cx - 9, bY0 - 2, 18, 17, 3); cel(g, bk, '#d9b04a', 2, 3, 2, 0); g.lineWidth = 1.6; g.strokeStyle = '#8a6420'; g.strokeRect(cx - 4.5, bY0 + 2.5, 9, 8); }); }
    if (kidT && !o.pj && mode !== 'sit') { const L = legOrder[legOrder.length - 1], pp = ellP(L.K[0] + 2, L.K[1] + 4, rl * 0.5 * (turned ? 0.8 : 1), rl * 0.46, 0.2); cel(g, pp, '#a8865a', 2, 3, 3, 0); g.setLineDash([3, 3]); g.lineWidth = 1.2; g.strokeStyle = '#f2e6c0'; g.beginPath(); g.ellipse(L.K[0] + 2, L.K[1] + 4, rl * 0.38 * (turned ? 0.8 : 1), rl * 0.34, 0.2, 0, TAU); g.stroke(); g.setLineDash([]); }
  }
  for (const L of legOrder) { if (turned && L === legOrder[0]) FAR = 0.14; shoe(L); FAR = 0; }
  if (lady && (!showPants || o.dress)) { // long skirt (1900s), sways a little; swings with the stride  [CASTRO-cast] o.dress = knee-length 1960 skirt
    const sw = Math.sin(TT * 0.5) * 5 * MV + trail * 6 + flap * 3, short = mode !== 'stand' && !gaitOn, sb = o.dress ? hipY + legL * (short ? 0.36 : 0.5) : short ? hipY + legL * 0.45 : ank - 12, fl = HPW * (short ? 1.35 : 1.55) * (turned ? 0.82 + 0.18 * CS : 1);
    const kick = gaitOn ? Math.sin(TAU * ph) * 7 * CS : 0, X = (x) => cx + (x - cx) * wk;
    const sk = [[X(cx - WW * 0.98), waistY + 8], [X(cx + WW * 0.98), waistY + 8], [X(cx + HPW * 1.08), hipY - 10], [cx + fl + sw + kick, sb]];
    for (let k = 6; k >= 0; k--) sk.push([cx - fl + (2 * fl) * k / 6 + sw + kick * (k / 6 * 2 - 1), sb + (k % 2 ? 7 : 0) + (gaitOn ? 3 * Math.sin(TAU * ph + k) : 0)]);
    sk.push([cx - fl + sw - kick, sb], [X(cx - HPW * 1.08), hipY - 10]);
    libSkirt(sb, sw); // [LIB-cast] bustle
    const skP = polyPath(sk); cel(g, skP, skirtCol, 3.6, fl * 0.32, 4, 6, o.pattern === 'dots' ? fabric() : twill(skirtCol));
    const fc = mixc(skirtCol, INK, 0.5); for (const k of [-0.5, 0, 0.5]) taper(g, [[cx + k * HPW * 0.9 * wk, hipY + 10], [cx + k * fl * 0.96 + sw * 0.8, sb - 6]], 2, fc, 0.1);
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
    if (o.galabiya) pts.splice(-2, 2, [cx + s * HPW * 1.08, hipY + 50], [cx + s * HPW * 1.3, hemY - 14], [cx + s * HPW * 1.32, hemY + wav(0)]); // [LIB-cast] robe flare
    return pts.map(([x, y], i) => [cx + (x - cx) * (i === 0 ? 1 - 0.2 * AS : wk) + prof(s, y), y]); };
  const R = cr(side(1), false, 8), Lf = cr(side(-1), false, 8).reverse();
  const hem = []; for (let k = 1; k < 8; k++) { const x = cx + HPW * (1 - k / 4); hem.push([cx + (x - cx) * wk + prof(Math.sign(x - cx) || 1, hemY) * 0.5, hemY + wav(k) - (jacket && Math.abs(x - cx) < 14 ? 18 - Math.abs(x - cx) : 0)]); }
  if (jacket) hem.splice(3, 1, [clamp(tX(cx, hemY), cx - HPW * wk + 4, cx + HPW * wk - 4), hemY - 20]);
  if (o.galabiya) for (const q of hem) q[0] = cx + (q[0] - cx) * 1.32; // [LIB-cast]
  const nkx = cx + SN * NW * 0.5;
  const neck = arcPts(nkx, shY - 4, (NW + 6) * (1 - 0.2 * AS), Math.PI, 0, 8, runner || kidT || lady ? 18 : 10);
  torsoP = polyPath([...R, ...hem, ...Lf, ...neck.slice(1, -1)]);
  const tpat = (h) => { fabric()(h);
    if (o.sash) { const sp = TP([[cx - TW * 0.86, shY - 6], [cx - TW * 0.5, shY - 6], [cx + WW * 1.1, hemY - 6], [cx + WW * 0.78, hemY + 12]]); h.fillStyle = o.sash; h.beginPath(); sp.forEach(([x, y], i) => h[i ? 'lineTo' : 'moveTo'](x, y)); h.closePath(); h.fill();
      h.strokeStyle = mixc(o.sash, INK, 0.35); h.lineWidth = 1.6; h.beginPath(); h.moveTo(...sp[0]); h.lineTo(...sp[3]); h.moveTo(...sp[1]); h.lineTo(...sp[2]); h.stroke(); }
    if (o.trim) { h.strokeStyle = o.trim; h.lineWidth = 9; h.beginPath(); neck.forEach(([x, y], i) => h[i ? 'lineTo' : 'moveTo'](x, y + 3)); h.stroke(); h.beginPath(); [[cx + HPW, hemY - 4], ...hem.map(([x, y]) => [x, y - 4]), [cx - HPW, hemY - 4]].forEach(([x, y], i) => h[i ? 'lineTo' : 'moveTo'](x, y)); h.stroke();
      h.strokeStyle = mixc(o.trim, INK, 0.4); h.lineWidth = 1.4; h.beginPath(); neck.forEach(([x, y], i) => h[i ? 'lineTo' : 'moveTo'](x, y + 7.5)); h.stroke(); }
    if (o.vest && !BACKB) { h.fillStyle = o.vest; for (const s of [-1, 1]) { const vp = TP([[cx + s * TW * 1.2, shY], [cx + s * 20, shY + 40], [cx + s * 16, hipY + 40], [cx + s * TW * 1.3, hipY + 40]]); h.beginPath(); vp.forEach(([x, y], i) => h[i ? 'lineTo' : 'moveTo'](x, y)); h.fill(); } }
  };
  cel(g, torsoP, o.shirt, 3.8, TW * 0.3 * wk, 6, 7, tpat);
  { // structure lines: side seams / waist pull folds, crisp
    const fc = mixc(o.shirt, INK, 0.45), sw = Math.sin(TT * 0.35) * MV * 6;
    for (const s of [-1, 1]) if (tV(cx + s * TW * 0.75, shY + 80) > -4) taper(g, TP([[cx + s * TW * 0.72, shY + 40], [cx + s * TW * 0.8, shY + torsoH * 0.32], [cx + s * WW * 0.82, waistY - 10]]), 1.8, fc, 0.1);
    if (!jacket) { taper(g, TP([[cx - WW * 0.7 + sw, waistY - 6], [cx - WW * 0.2 + sw, waistY + 6]]), 1.8, fc, 0.1); taper(g, TP([[cx + WW * 0.45 + sw, waistY + 2], [cx + WW * 0.8, waistY - 12]]), 1.8, fc, 0.1); }
    if (turned && gaitOn) taper(g, [[cx - dv * TW * 0.3 * wk, waistY - 30], [cx + dv * TW * 0.1 * wk, waistY - 10 + 4 * flap]], 1.6, fc, 0.1); // stride pull
  }
  // jacket: shirt V, lapels, buttons, pocket flaps
  if (jacket && !BACKB) {
    const vB = shY + torsoH * 0.42; cel(g, polyPath(TP([[cx - NW - 2, shY - 3], [cx + NW + 2, shY - 3], [cx, vB]])), o.collar || '#f4f1e8', 0, 6, 4, 0);
    for (const s of [-1, 1]) { if (tV(cx + s * TW * 0.45, shY + 40) < -6) continue; const lp = polyPath(TP([[cx + s * (NW + 3), shY - 5], [cx + s * TW * 0.5, shY + 28], [cx + s * TW * 0.36, shY + 40], [cx + s * TW * 0.46, shY + 56], [cx + s * 4, vB + 6], [cx + s * NW * 0.6, shY + 30]]));
      cel(g, lp, mixc(o.shirt, '#000000', 0.08), 2.6, s * SG > 0 ? 5 : 0, 3, 0, fabric()); }
    if (o.neck !== 'scarf') { const wc = o.vest || mixc(o.shirt, o.build === 'stout' ? '#5a2a3a' : '#e8dcc0', 0.3), wv = polyPath(TP([[cx - NW * 1.05, shY + torsoH * 0.22], [cx + NW * 1.05, shY + torsoH * 0.22], [cx + 4, vB + 4], [cx - 4, vB + 4]])); cel(g, wv, wc, 1.8, 4, 2, 0); for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(tX(cx, shY + 60), shY + torsoH * 0.27 + i * 14, 2, 0, TAU); g.fillStyle = INK; g.fill(); } }
    for (let i = 0; i < 2; i++) decal(cx + 8, vB + 22 + i * 34, () => cel(g, ellP(cx + 8, vB + 22 + i * 34, 4.5, 4.5), o.button || dk(o.shirt, 0.6), 2, 1, 1, 0));
    { const px = cx - TW * 0.62, py = shY + torsoH * 0.3; if (tV(px, py) > -2 && !o.hunt) decal(px, py, () => { line(g, [[px - 14, py + 4], [px + 16, py + 2]], 2, mixc(o.shirt, INK, 0.55)); cel(g, polyPath([[px - 10, py + 3], [px - 4, py - 8], [px + 2, py + 2], [px + 8, py - 7], [px + 12, py + 2]]), '#f6f2e8', 1.8, 2, 1, 0); }); }
    if ((o.build === 'stout' || o.hat === 'bowler') && !o.hunt && !o.noChain) { const c0 = [tX(cx + 6, vB + 28), vB + 28], c1 = [tX(cx - WW * 0.62, vB + 16), vB + 16], cy = vB + 52 + 4 * flap; if (tV(cx - WW * 0.62, vB + 16) > -4) { g.lineWidth = 2.6; g.strokeStyle = '#7a5a12'; g.beginPath(); g.moveTo(c0[0], c0[1]); g.quadraticCurveTo((c0[0] + c1[0]) / 2, cy, c1[0], c1[1]); g.stroke(); g.setLineDash([2.5, 2.5]); g.lineWidth = 2; g.strokeStyle = '#f2cf5a'; g.stroke(); g.setLineDash([]); cel(g, ellP(c1[0] - 2, c1[1] + 6, 6, 6), '#e8b830', 1.8, 2, 2, 0); } }
    if (o.hat === 'top' && o.build === 'stout') { const fx0 = cx + TW * 0.44, fy0 = shY + 42; if (tV(fx0, fy0) > -2) decal(fx0, fy0, () => { const fp = new Path2D(); for (let k = 0; k < 5; k++) ellP(fx0 + Math.cos(k * 1.256) * 5, fy0 + Math.sin(k * 1.256) * 5, 4.5, 4.5, 0, fp); cel(g, fp, '#d03a44', 1.8, 2, 2, 0); g.beginPath(); g.arc(fx0, fy0, 2.4, 0, TAU); g.fillStyle = '#f2cf5a'; g.fill(); }); }
    for (const s of [-1, 1]) if (tV(cx + s * WW * 0.6, hipY - 4) > -3) taper(g, TP([[cx + s * WW * 0.36, hipY - 4], [cx + s * WW * 0.9, hipY - 6]]), 2.2, mixc(o.shirt, INK, 0.55), 0.2);
  }
  if (!BACKB && !jacket && !o.noButtons && !runner && (!kidT || o.pj)) for (let i = 0; i < 3; i++) decal(cx, shY + 40 + i * 40, () => cel(g, ellP(cx, shY + 40 + i * 40, 4, 4), o.button || dk(o.shirt, 0.6), 2, 1, 1, 0));
  if (o.bib && !BACKB) { const bw = 68, bh = 52, bx = cx - bw / 2 + 4, byy = shY + torsoH * 0.34; decal(cx + 4, byy, () => { const bp = new Path2D(); bp.roundRect(bx, byy, bw, bh, 4); cel(g, bp, '#fffdf6', 2.6, 6, 4, 0);
    g.fillStyle = INK; g.font = `bold ${bh * 0.72}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.bib, bx + bw / 2, byy + bh / 2 + 2);
    for (const [px, py] of [[bx + 5, byy + 5], [bx + bw - 5, byy + 5], [bx + 5, byy + bh - 5], [bx + bw - 5, byy + bh - 5]]) { g.beginPath(); g.arc(px, py, 2.2, 0, TAU); g.fillStyle = '#9aa0b4'; g.fill(); } }); }
  if (kidT && !o.pj && !BACKB) for (const s of [-1, 1]) { if (tV(cx + s * WW * 0.5, hemY - 10) < -4) continue; const st = polyPath(TP([[cx + s * TW * 0.46, shY + 2], [cx + s * TW * 0.62, shY + 6], [cx + s * WW * 0.6, hemY], [cx + s * WW * 0.42, hemY]])); g.save(); g.clip(torsoP); cel(g, st, '#5a3a28', 1.6, 3, 0, 0); g.restore(); cel(g, ellP(tX(cx + s * WW * 0.51, hemY - 10), hemY - 10, 3.6, 3.6), '#d9b04a', 1.4, 1, 1, 0); }
  if (lady && !o.cardigan /* [EIN-cast] */) { const wb = new Path2D(); wb.rect(cx - WW * 1.05, waistY + 4, WW * 2.1, 12); g.save(); g.clip(torsoP); cel(g, wb, mixc(skirtCol, INK, 0.25), 0, 6, 0, 0); g.restore(); line(g, [[cx - WW * wk, waistY + 16], [cx + WW * wk, waistY + 16]], 1.6); }
  if (o.pocket && !BACKB) decal(cx + TW * 0.3 + 17, shY + 72, () => { const pp = new Path2D(); pp.roundRect(cx + TW * 0.3, shY + 58, 34, 28, 4); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(pp); g.fillStyle = o.pocket; g.fillRect(cx + TW * 0.3 + 6, shY + 50, 9, 11); });
  torsoExtras(); // [CASTRO-cast]
  einTorso(); // [EIN-cast]
  libTorso(); // [LIB-cast]
  kchTorso(); // [KCH-cast]
  // neck (sits in shadow under the chin) + collars + neckwear
  const np = polyPath([[ncx - NW, hy + HH * 0.6], [ncx + NW, hy + HH * 0.6], [ncx + NW + 1, shY + 8], [ncx, shY + (runner || kidT || lady ? 14 : 4)], [ncx - NW - 1, shY + 8]]);
  { g.lineWidth = 5; g.strokeStyle = INK; g.stroke(np); cel(g, np, skin, 0, 0, 0, 0); g.save(); g.clip(np); g.globalCompositeOperation = 'multiply'; g.fillStyle = SHS_; g.fill(np); g.globalCompositeOperation = 'source-over'; g.restore();
    if (o.trim) { const nb = new Path2D(); neck.forEach(([x, y], i) => nb[i ? 'lineTo' : 'moveTo'](x, y)); g.lineWidth = 3.2; g.strokeStyle = INK; g.stroke(nb); } }
  if ((jacket || lady || o.pj) && !BACKB) for (const s of [-1, 1]) { if (tV(cx + s * (NW + 8), shY) < -8) continue; cel(g, polyPath(TP([[cx + s * 2, shY + 12], [cx + s * (NW + 8), shY - 6], [cx + s * (NW + 12), shY + 10], [cx + s * 12, shY + 26]])), o.collar || '#ffffff', 2.4, s * SG > 0 ? 4 : 0, 2, 0); }
  collarExtras(); // [CASTRO-cast]
  einCollar(); // [EIN-cast]
  libCollar(); // [LIB-cast]
  kchCollar(); // [KCH-cast]
  if (lady && o.neck !== 'bow' && !BACKB) decal(cx, shY + 14, () => { cel(g, ellP(cx, shY + 14, 5.5, 6.5), '#e8b830', 1.8, 2, 2, 0); g.beginPath(); g.arc(cx, shY + 14, 2.4, 0, TAU); g.fillStyle = '#8c2a5a'; g.fill(); });
  // seen from behind: centre-back seam, yoke, vents, half-belt, back collar, seat pockets, back bib, crossed braces, blouse buttons
  if (BACKB) { const fc = mixc(o.shirt, INK, 0.5), ks = clamp(-CS, 0.3, 1);
    const bd = (x0, y0, fn) => { const X = tXb(x0, y0), sx = clamp((tXb(x0 + 2, y0) - tXb(x0 - 2, y0)) / 4, 0.18, 1.2); g.save(); g.translate(X, 0); g.scale(sx, 1); g.translate(-x0, 0); fn(); g.restore(); };
    g.save(); g.clip(torsoP);
    taper(g, TPb([[cx - TW * 0.8, shY + 36], [cx, shY + 46], [cx + TW * 0.8, shY + 36]]), 1.8, fc, 0.1); // yoke
    if (jacket || !runner && !kidT && !lady) taper(g, TPb([[cx, shY + 46], [cx + 1, waistY], [cx, hemY - (jacket ? 52 : 4)]]), 2, fc, 0.1); // centre-back seam
    if (jacket) { const vb = tXb(cx, hemY - 50); taper(g, [[vb, hemY - 52], [vb + 1, hemY + 2]], 2.4, mixc(o.shirt, INK, 0.65), 0.2); // vent
      const hb = new Path2D(); polyPath(TPb([[cx - WW * 0.62, waistY + 6], [cx + WW * 0.62, waistY + 6], [cx + WW * 0.62, waistY + 22], [cx - WW * 0.62, waistY + 22]]), hb); cel(g, hb, mixc(o.shirt, '#000000', 0.08), 2.2, 0, 4, 0, fabric());
      for (const s of [-1, 1]) bd(cx + s * WW * 0.52, waistY + 14, () => cel(g, ellP(cx + s * WW * 0.52, waistY + 14, 4, 4), o.button || dk(o.shirt, 0.6), 1.8, 1, 1, 0)); }
    if (lady) for (let i = 0; i < 5; i++) bd(cx, shY + 30 + i * 22, () => cel(g, ellP(cx, shY + 30 + i * 22, 3.4, 3.4), o.button || '#f2ead8', 1.4, 1, 1, 0));
    if (kidT && !o.pj) for (const s of [-1, 1]) { const st = polyPath(TPb([[cx + s * TW * 0.5, shY + 2], [cx + s * TW * 0.64, shY + 6], [cx - s * WW * 0.42, hemY], [cx - s * WW * 0.6, hemY]])); cel(g, st, '#5a3a28', 1.6, 3, 0, 0); }
    if (o.bib) { const bw = 68, bh = 52, byy = shY + torsoH * 0.3; bd(cx, byy, () => { const bp = new Path2D(); bp.roundRect(cx - bw / 2, byy, bw, bh, 4); cel(g, bp, '#fffdf6', 2.6, 6, 4, 0); g.fillStyle = INK; g.font = `bold ${bh * 0.72}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.bib, cx, byy + bh / 2 + 2); }); }
    g.restore();
    // collar seen from behind: shirt collar edge above the jacket collar band
    const nb = (dy, w) => TPb(arcPts(cx, shY - 4 + dy, (NW + 6) * w, Math.PI * 1.05, -0.05 * Math.PI, 10, 6)).map(([x, y]) => [x, y]);
    if (jacket || lady || o.collar) { const cb = [...nb(-6, 1.05), ...nb(12, 1.35).reverse()]; if (jacket) cel(g, polyPath(nb(-12, 0.95).concat(nb(-2, 1.0).reverse())), o.collar || '#f4f1e8', 2, 0, 0, 0); cel(g, polyPath(cb), jacket ? mixc(o.shirt, '#000000', 0.1) : (o.collar || '#ffffff'), 2.4, 3, 2, 0, jacket ? fabric() : null); }
  }
  // ambient occlusion under the chin (soft, purple)
  if (!BACKB) { const ay = shY + 4, ax = ncx + SN * 6; g.save(); g.clip(polyPath([...R, ...hem, ...Lf], polyPath([[ncx - NW - 2, hy + HH * 0.5], [ncx + NW + 2, hy + HH * 0.5], [ncx + NW + 2, shY + 30], [ncx - NW - 2, shY + 30]])));
    g.translate(ax, ay); g.scale(1, 0.42); const gr = g.createRadialGradient(0, 0, 0, 0, 0, NW * 2.8); gr.addColorStop(0, 'rgba(105,75,160,0.5)'); gr.addColorStop(0.55, 'rgba(120,90,170,0.22)'); gr.addColorStop(1, 'rgba(120,90,170,0)');
    g.globalCompositeOperation = 'multiply'; g.fillStyle = gr; g.fillRect(-NW * 3, -NW * 3, NW * 6, NW * 6); g.restore(); }
  const swing = Math.sin(TT * 0.45) * 0.18 * MV + flap * 0.07 * CS - trail * 0.18;
  const ncol = o.neckCol || '#c0453a';
  if (!BACKB) { const tx0 = tX(cx, shY + 40); g.save(); g.translate(tx0, shY + 14); g.rotate(swing); g.translate(-tx0, -(shY + 14)); const ks = turned ? 0.55 + 0.45 * CS : 1, T = (pts) => pts.map(([x, y]) => [tx0 + (x - cx) * ks, y]);
    if (o.neck === 'tie') { const tk = o.tieK || 1; /* [CASTRO-cast] tie width */ cel(g, polyPath(T([[cx - 7 * tk, shY + 14], [cx + 7 * tk, shY + 14], [cx + 13 * tk, shY + 104], [cx, shY + 104 + 16 * Math.min(1, tk)], [cx - 13 * tk, shY + 104]])), ncol, 2.6, 4, 3, 0); cel(g, polyPath(T([[cx - 9, shY + 4], [cx + 9, shY + 4], [cx + 7, shY + 18], [cx - 7, shY + 18]])), dk(ncol, 0.9), 2.4, 2, 2, 0); taper(g, T([[cx + 2, shY + 22], [cx + 4, shY + 100]]), 1.4, mixc(ncol, INK, 0.4), 0.1); }
    if (o.neck === 'bow') { const bp = new Path2D(); for (const s of [-1, 1]) polyPath(T([[cx, shY + 10], [cx + s * 26, shY - 2], [cx + s * 28, shY + 24]]), bp); cel(g, bp, ncol, 2.6, 4, 3, 0); cel(g, ellP(tx0, shY + 11, 7 * ks, 8), dk(ncol, 0.85), 2.2, 2, 2, 0); }
    libNeck(T, ks); // [LIB-cast]
    g.restore(); }
  if (o.neck === 'bandana') { const sc = o.neckCol || '#c0453a', X = (x) => nkx + (x - cx) * wk, fl = Math.sin(TT * 0.6) * 3 * MV + trail * 8 + flap * 3; // [TEDDY-cast] knotted bandana
    const dots = (h) => { h.fillStyle = 'rgba(255,245,230,0.75)'; for (let y = shY - 30, r = 0; y < shY + 90; y += 12, r++) for (let x = r % 2 * 6; x < 600; x += 12) { h.beginPath(); h.arc(x, y, 1.8, 0, TAU); h.fill(); } };
    cel(g, smooth([[X(cx - NW - 12), shY + 2], [X(cx - NW - 2), shY - 12], [X(cx + NW + 2), shY - 12], [X(cx + NW + 12), shY + 2], [X(cx), shY + 12]], 6), sc, 2.8, 5, 3, 2, dots);
    if (!BACKB) { const tx = tX(cx, shY + 30), ks = turned ? 0.55 + 0.45 * CS : 1, tri = polyPath([[tx - 34 * ks, shY + 2], [tx + 34 * ks, shY + 2], [tx + 4 * ks + fl, shY + 62]]); cel(g, tri, sc, 2.8, 5, 3, 2, dots); taper(g, [[tx - 14 * ks, shY + 12], [tx + fl * 0.6, shY + 44]], 1.6, dk(sc, 0.7), 0.1); cel(g, ellP(tx - 2 * ks, shY + 6, 9 * ks, 8), dk(sc, 0.88), 2, 2, 2, 0); }
    else { const kx = tXb(cx, shY + 4); cel(g, ellP(kx, shY + 2, 8, 7), dk(sc, 0.88), 2, 2, 2, 0); for (const s2 of [-1, 1]) cel(g, polyPath([[kx, shY + 4], [kx + s2 * 12 + fl, shY + 30], [kx + s2 * 2 + fl, shY + 32]]), sc, 2, 2, 2, 0, dots); } }
  if (o.neck === 'scarf') { const sc = o.neckCol || '#d9a441', fl = Math.sin(TT * 0.8) * 5 * MV + trail * 14 + flap * 4, tx = turned ? tX(cx + 33, shY + 30) : cx + 33;
    if (!BACKB) { const tail = polyPath([[tx - 11, shY + 12], [tx + 11, shY + 12], [tx + 17 + fl, shY + 96], [tx - 7 + fl, shY + 94]]); cel(g, tail, sc, 3, 5, 3, 0); }
    if (!BACKB) for (let k = 0; k < 4; k++) line(g, [[tx - 5 + k * 6 + fl, shY + 95], [tx - 5 + k * 6 + fl * 1.3, shY + 106]], 2.6, dk(sc, 0.8));
    const X = (x) => nkx + (x - cx) * wk;
    cel(g, smooth([[X(cx - TW * 0.72), shY + 4], [X(cx - NW), shY - 14], [X(cx + NW), shY - 14], [X(cx + TW * 0.72), shY + 4], [X(cx + TW * 0.5), shY + 24], [X(cx), shY + 30], [X(cx - TW * 0.5), shY + 24]], 6), sc, 3.2, 8, 5, 3);
    taper(g, [[X(cx - TW * 0.4), shY + 8], [X(cx), shY + 16], [X(cx + TW * 0.4), shY + 8]], 1.8, dk(sc, 0.7), 0.1); }
  if (BACKH && o.hair === 'long') { const sw = Math.sin(TT * 0.4) * 4 * MV + trail * 8 + flap * 3, by = shY + 78, d = Math.sign(HY) || 0, X = (x) => hcx + (x - hcx) * (1 - 0.15 * AS) + d * HW * 0.05;
    const lp = smooth([[X(hcx - HW * 1.02), hy], [X(hcx - HW * 1.1), hy + HH * 0.6], [X(hcx - HW * 1.0) + sw, by - 24], [X(hcx - HW * 0.6) + sw, by], [X(hcx) + sw, by - 8], [X(hcx + HW * 0.6) + sw, by], [X(hcx + HW * 1.0) + sw, by - 24], [X(hcx + HW * 1.1), hy + HH * 0.6], [X(hcx + HW * 1.02), hy]], 8);
    cel(g, lp, hc, 3.6, 10, 6, 4); g.save(); g.clip(lp); for (let k = -3; k <= 3; k++) taper(g, [[X(hcx + k * HW * 0.22), hy + HH * 0.3], [X(hcx + k * HW * 0.26) + sw * 0.8, by - 14]], 1.8, mixc(hc, INK, 0.45), 0.1); taper(g, [[X(hcx - HW * 0.5), hy + HH * 0.5], [X(hcx - HW * 0.55) + sw * 0.5, by - 40]], 4, lt(hc, 0.25), 0.2); g.restore(); }
  // ---------- near arms ----------
  const raisedLate = (a) => (AS > 0.8 || (op.ear && !BACKH && a[0] === PA) || (op.raise && !BACKH && a[0] === PA) /* [LIB-cast] */) /* [EIN-cast] */ && !op.drive && a[1][2][1] < shY - 10; // profile: raised hands pass in front of the face
  const near = arms.filter((a) => !farArm(a) && !raisedLate(a));
  if (op.hug && !BACKB) { const [tx, ty] = P3(0, shY + AL * 0.62, AL * 0.62); teddyAt(g, tx, ty, B.hs * (o.build === 'kid' ? 1.22 : 0.95), { col: op.teddyCol, tilt: -SN * 0.15 }); } // [TEDDY-cast]
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
  function drawProps(late) { // [EIN-cast] late = op.ear prop drawn over the head // props are held in front: seen from behind they are drawn behind the body and only peek out
  const PS = 0.74 * B.hs, pa = arms.find((a) => a[0] === PA);
    if (HOLD[op.prop] && !!late === !!((op.ear || op.raise /* [LIB-cast] */) && !BACKH)) { const h = pa[1][2]; g.save(); g.translate(h[0] + 6, h[1] - 4); g.scale(PS, PS); HSIDE = Math.sign(h[0] - cx) || PA; HOLD[op.prop](g, op); g.restore(); /* [CASTRO-cast] op + side for props */ hand([h[0] + 3, h[1] + 4], -Math.PI / 2, PA, true); }
    if (op.prop === 'stick') { const h = pa[1][2], sd = PA; line(g, [[h[0] - 6 * sd, h[1] + 20], [h[0] + 52 * sd, h[1] - 96]], 12, INK); line(g, [[h[0] - 6 * sd, h[1] + 20], [h[0] + 52 * sd, h[1] - 96]], 6.5, '#8a5a34'); taper(g, [[h[0] + 10 * sd, h[1] - 10], [h[0] + 40 * sd, h[1] - 72]], 2, '#b07a4a', 0.3); hand([h[0] + 3, h[1] + 6], -Math.PI / 2, PA, true); } };
  if (!BACKB) drawProps();
  // ---------- head ----------
  const tilt = ((op.tilt ?? ((o.seed || 0) % 3 - 1) * 3) + (gaitOn ? (RUN ? 2.5 : 1.4) * Math.sin(TAU * 2 * (ph - 0.1)) * (turned ? dv : 1) : 0)) * Math.PI / 180;
  g.translate(cx, shY); g.rotate(tilt); g.translate(-cx, -shY);
  const earAt = (s) => { const t = wrapA(Math.asin(s) + HY), X = hcx + HW * 0.95 * Math.sin(clamp(t, -HP_, HP_)); return { X: X - (AH > 0.8 ? dv * 11 * fz : 0), vis: !HY ? 1 : Math.cos(t) }; };
  const drawEar = (s, front) => { const { X } = earAt(s), ey0 = hy + HH * 0.1, rx = 12 * fz * (front ? 1 : 0.95), ry = 18 * fz, fl = front ? s : -dv; // fl: which way the cup opens (toward the face)
    cel(g, ellP(X, ey0, rx, ry, front ? s * 0.15 : -dv * 0.12), skin, 3, 3, 3, 0, null, SHADE_SKIN);
    g.save(); g.clip(ellP(X, ey0, rx, ry, 0)); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(214,150,170,0.55)'; g.beginPath(); g.ellipse(X - fl * 2 * fz, ey0 + 2 * fz, rx * 0.55, ry * 0.62, 0, 0, TAU); g.fill(); g.restore(); g.globalCompositeOperation = 'source-over';
    taper(g, arcPts(X + fl * 1, ey0 + 1, 6 * fz, fl > 0 ? -1.6 : 4.7, fl > 0 ? 1.4 : 1.7, 6, 10 * fz), 1.8, mixc(skin, INK, 0.45), 0.2);
    taper(g, [[X - fl * 2 * fz, ey0 + 5 * fz], [X - fl * 4 * fz, ey0 + 10 * fz]], 1.4, mixc(skin, INK, 0.5), 0.2);
    if (o.earring) { g.beginPath(); g.arc(X, ey0 + 19 * fz, 5, 0, TAU); g.fillStyle = o.earring; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); } };
  const earsHidden = o.hair === 'long' || (o.hair === 'curly' && AH > 0.3);
  if (!turned && !BACKH) for (const s of [-1, 1]) drawEar(s, true);
  if (BACKH && o.hat === 'cap') capVisor(o.hatCol || '#5a4a3a', -0.36);
  if (BACKH && o.hat === 'patrol') patrolVisor(o.hatCol || '#4e5a32'); if (BACKH) drawBeard(true); // [CASTRO-cast] behind the head from here; (cap) the peak is in front of the face: behind the head from here
  function capVisor(hk, cut) {
    const vy = hy + HH * (cut + 0.03), Rr = HW * 0.88, pv = 0.1 * Math.cos(HY) + 0.1, VY = clamp(HY * 1.4, -HP_, HP_), hs2 = Math.sin(VY), hc2 = Math.cos(VY), Pv = (lat, fw) => [hcx - SN * 4 * fz + lat * hc2 + fw * hs2, vy + (-lat * hs2 + fw * hc2) * pv];
      const vp = []; for (let k = 0; k <= 12; k++) { const a = Math.PI * k / 12; vp.push(Pv(Rr * Math.cos(a), Rr * (0.62 + 0.45 * AH) * Math.sin(a) + HW * (0.42 + 0.06 * AH) * Math.sin(a))); }
      for (let k = 12; k >= 0; k--) { const a = Math.PI * k / 12; vp.push(Pv(Rr * Math.cos(a), Rr * (0.62 + 0.45 * AH) * Math.sin(a))); }
      cel(g, polyPath(vp), dk(hk, 0.82), 3.2, 6, 4, 3); taper(g, vp.slice(2, 11), 2, rgba(lt(hk, 0.35), 0.5), 0.1);
  }

  cel(g, headSil, skin, 3.8, HW * 0.16, HH * 0.1, 5, null, SHADE_SKIN);
  drawStubble(); // [CASTRO-cast]
  // jaw/cheek accent: tiny crisp ink tick on the shadow side (front-ish views)
  if (AH < 0.8 && !BACKH) taper(g, [[hcx + SG * HW * 0.62, hy + HH * 0.7], [hcx + SG * HW * 0.4, hy + HH * 0.86]], 1.6, mixc(skin, INK, 0.5), 0.1);
  // ---------- hair ----------
  const HS = HP.map(([x, y]) => [hcx + (x - hcx) * 1.06, hy + HH * 0.05 + (y - hy - HH * 0.05) * 1.09]);
  const capPts = (cut) => { const yc = hy + cut * HH, idx = HS.map((p, i) => [p, i]).filter(([p]) => p[1] <= yc); const right = idx.filter(([, i]) => i < HS.length / 2).map(([p]) => p), left = idx.filter(([, i]) => i >= HS.length / 2).map(([p]) => p); return [...left, ...right]; };
  const rel = (pts) => pts.map(([x, y]) => [hcx + x * HW, hy + y * HH]);
  const bnc = gaitOn ? 0.012 * flap : 0;
  // back of the skull (turned views): hair from the back silhouette to the terminator, down to the nape
  const backCap = (P, yn0 = o.hat === 'cap' ? 0.04 : 0.14, map = (q) => q) => { if (!HY || BACKH) return P; const b = -Math.sign(HY), yn = -0.25 + (yn0 + 0.25) * AH, out = [], inn = [];
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
  if (hairOn && !BACKH) {
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
  if (o.hair === 'receding' && !BACKH) { const fr = [[1.0, -0.12], [0.9, -0.3], [0.74, -0.52], [0.56, -0.7], [0.4, -0.74], [0.2, -0.72], [0, -0.76], [-0.2, -0.72], [-0.4, -0.74], [-0.56, -0.7], [-0.74, -0.52], [-0.9, -0.3], [-1.0, -0.12]].map(([x, y], k) => [x + sway(k) * 0.4 / HW, y + bnc]); // [CASTRO-cast] high hairline, receding temples
    hairPaint(backCap(polyPath(HMP([...capPts(-0.12), ...cr(rel(fr), false, 4)]))), [[[-0.3, -0.98], [0.3, -0.86], [0.7, -0.62]], [[0.1, -1.0], [0.6, -0.84], [0.9, -0.4]], [[-0.6, -0.9], [-0.86, -0.5]]]); }
  if (o.hair === 'crew' && !BACKH) { const fr = [[1.0, -0.36], [0.7, -0.56], [0.35, -0.64], [0, -0.66], [-0.35, -0.64], [-0.7, -0.56], [-1.0, -0.36]]; // [CASTRO-cast] 1960s crew cut: close, flat-topped
    const P = backCap(polyPath(HMP([...capPts(-0.36).map(([x, y]) => [x, Math.max(y, hy - HH * 1.03)]), ...cr(rel(fr), false, 4)])), 0.0); hairPaint(P, []);
    g.save(); g.clip(P); g.fillStyle = rgba(mixc(hc, INK, 0.35), 0.5); for (let i = 0; i < 90; i++) { const [X] = hmapPt([hcx + (hsh(i, 1.7) - 0.5) * HW * 1.9, hy]); g.fillRect(X, hy - HH * (0.45 + hsh(i, 2.9) * 0.6), 1.6, 3.2); } g.restore(); }
  if (o.hair === 'bald' && !BACKH) { const P = new Path2D(); for (const s of [-1, 1]) for (const [dx, dy, rr] of [[0.97, -0.12, 0.12], [1.0, 0.04, 0.1], [0.9, -0.26, 0.1], [0.84, -0.4, 0.08]]) { if (HY && (Math.abs(Math.asin(s * 0.97) + HY) > HP_ + 0.1 || AH > 0.8)) continue; const [x0] = hmapPt([hcx + s * HW * dx, hy + HH * dy]), x = x0 - Math.sign(HY) * AH * HW * 0.24, y = hy + HH * dy; P.moveTo(x + HW * rr, y); P.arc(x, y, HW * rr, 0, TAU); }
    if (AH > 0.8) for (const [dy, rr] of [[-0.22, 0.11], [-0.04, 0.12]]) { const x = hcx - Math.sign(HY) * HW * 0.3, y = hy + HH * dy; P.moveTo(x + HW * rr, y); P.arc(x, y, HW * rr, 0, TAU); }
    if (HY) for (const [dy, rr] of [[-0.3, 0.13], [-0.1, 0.13], [0.1, 0.12], [0.25, 0.1]]) { const x = hcx - Math.sign(HY) * rH(dy) * HW * 0.9, y = hy + HH * dy; P.moveTo(x + HW * rr, y); P.arc(x, y, HW * rr, 0, TAU); }
    g.save(); g.clip(headP); cel(g, P, hc, 3, 4, 3, 0); g.restore();
    if (!o.hat) taper(g, arcPts(hcx - HW * 0.1 * SG, hy - HH * 0.2, HW * 0.62, Math.PI * 1.25, Math.PI * 1.45, 6, HH * 0.66), 4, lt(skin, 0.5), 0.2); }
  // ---------- head seen from behind: hair covers the back of the skull, ears at the sides, a cheek sliver on the turned side ----------
  if (BACKH) { const d = Math.sign(HY) || 0, ca = Math.cos(BAL), yn = o.hair === 'long' ? 0.98 : o.hair === 'bun' ? 0.56 : 0.6;
    const sh = (yf, sg, k = 1.06) => [hcx + sg * k * Math.max(0.1, rH(yf)) * HW, hy + HH * 0.05 + (yf * HH - HH * 0.05) * 1.06];
    const L = d ? -d : -1, Rt = -L, yT = d ? -0.32 : yn;
    if (hairOn) { const pts = [];
      const ys = o.hair === 'long' ? 0.9 : Math.min(yn, 0.16), yR = d ? yT : ys; // hair reaches ear level at the sides, the nape in the middle
      for (let k = 0; k <= 12; k++) pts.push(sh(ys - (ys + 1) * k / 12, L));
      for (let k = 1; k <= 12; k++) pts.push(sh(-1 + (yR + 1) * k / 12, Rt));
      if (d) for (let k = 1; k <= 4; k++) { const yf = yT + (ys - yT) * k / 4; pts.push([hcx + Rt * Math.max(0.2, rH(yf)) * HW * ca * (0.98 - 0.08 * k / 4), hy + yf * HH]); }
      const xr = (sg) => hcx + sg * Math.max(0.3, rH(ys)) * HW * (d && sg === Rt ? ca * 0.9 : 1.04);
      for (const [t, yy] of [[0.12, ys + 0.2], [0.3, yn - 0.06], [0.5, yn + 0.03], [0.7, yn - 0.06], [0.88, ys + 0.2]]) { const xa = xr(Rt), xb = xr(L); pts.push([xa + (xb - xa) * t, hy + HH * (yy + 0.02 * Math.sin(t * 23))]); }
      const P = polyPath(pts);
      if (o.hair === 'curly') for (let k = 0; k <= 12; k++) { const an = Math.PI * (0.95 + 1.1 * k / 12) + (d ? d * 0.15 : 0), x = hcx + Math.cos(an) * HW * 1.02, y = hy + Math.sin(an) * HH * 1.04; P.moveTo(x + HW * 0.2, y); P.arc(x, y, HW * 0.2, 0, TAU); }
      if (o.hair === 'curly') for (let k = 0; k < 5; k++) { const x = hcx + (L + (Rt - L) * (k + 0.5) / 5) * HW * 0.78 * (d && k > 2 ? ca : 1), y = hy + HH * (yn + 0.02); P.moveTo(x + HW * 0.17, y); P.arc(x, y, HW * 0.17, 0, TAU); }
      if (o.hair === 'spiky') for (let k = 0; k < 8; k++) { const an = Math.PI * (1.05 + 0.9 * k / 7); if (o.hat && Math.abs(Math.cos(an)) < 0.6) continue; const E2 = (a2, kk) => [hcx + Math.cos(a2) * HW * kk, hy - HH * 0.05 + Math.sin(a2) * HH * kk * 1.02], t = E2(an, 1.3); polyPath([E2(an - 0.15, 0.98), [t[0] + sway(k) - trail * 6, t[1]], E2(an + 0.15, 0.98), E2(an, 0.8)], P); }
      { g.save(); g.clip(headP); g.translate(hcx, hy + HH * (yn + 0.05)); g.scale(1, 0.45); const gr = g.createRadialGradient(0, 0, 0, 0, 0, HW * 1.1); gr.addColorStop(0, 'rgba(110,80,160,0.42)'); gr.addColorStop(0.6, 'rgba(120,90,170,0.16)'); gr.addColorStop(1, 'rgba(120,90,170,0)'); g.globalCompositeOperation = 'multiply'; g.fillStyle = gr; g.fillRect(-HW * 1.2, -HW * 1.2, HW * 2.4, HW * 2.4); g.restore();
        if (o.hair !== 'long') for (const s2 of [-1, 1]) taper(g, [[hcx + s2 * HW * 0.16 + d * HW * 0.1, hy + HH * (yn + 0.12)], [hcx + s2 * HW * 0.2 + d * HW * 0.1, hy + HH * 0.92]], 1.6, mixc(skin, INK, 0.35), 0.2); } // soft shadow under the hairline + nape tendons
      cel(g, P, hc, 3.6, HW * 0.16, HH * 0.08, 7);
      g.save(); g.clip(P); const sc = mixc(hc, INK, 0.4), cw0 = [hcx + d * HW * 0.1, hy - HH * 0.62];
      for (let k = 0; k < 7; k++) { const an = -0.5 + k * 0.62 + (TT * 0.0); taper(g, [cw0, [cw0[0] + Math.cos(an) * HW * 0.35, cw0[1] + Math.abs(Math.sin(an)) * HH * 0.25 + HH * 0.1], [cw0[0] + Math.cos(an) * HW * 0.7, hy + HH * (yn - 0.05)]], 1.8, sc, 0.1); }
      taper(g, arcPts(cw0[0], cw0[1], HW * 0.08, 0, Math.PI * 1.6, 8), 1.6, sc, 0.2); // crown whorl
      const shn = [[hcx - SG * HW * 0.62, hy - HH * 0.58], [hcx - SG * HW * 0.3, hy - HH * 0.84], [hcx + SG * HW * 0.05, hy - HH * 0.9]]; taper(g, shn, 5.5, lt(hc, 0.3), 0.15);
      g.restore(); }
    if (o.hair === 'bald') { const P = new Path2D(), pts = [];
      for (let k = 0; k <= 8; k++) pts.push(sh(-0.3 + 0.55 * k / 8, L, 1.02));
      for (let k = 0; k <= 10; k++) { const t = k / 10; pts.push([hcx + (L + (Rt - L) * t) * HW * 0.9 * (d && t > 0.6 ? ca : 1), hy + HH * (0.28 + 0.06 * Math.sin(Math.PI * t))]); }
      for (let k = 8; k >= 0; k--) { const yf = -0.3 + 0.55 * k / 8; pts.push(d ? [hcx + Rt * rH(yf) * HW * ca, hy + yf * HH] : sh(yf, Rt, 1.02)); }
      for (let k = 10; k >= 0; k--) { const t = k / 10; pts.push([hcx + (L + (Rt - L) * t) * HW * 0.8 * (d && t > 0.6 ? ca : 1), hy + HH * (-0.12 + 0.18 * Math.sin(Math.PI * t))]); }
      polyPath(pts, P); g.save(); g.clip(headP); cel(g, P, hc, 3, 4, 3, 0); g.restore();
      if (!o.hat) taper(g, arcPts(hcx - HW * 0.1 * SG, hy - HH * 0.2, HW * 0.62, Math.PI * 1.25, Math.PI * 1.45, 6, HH * 0.66), 4, lt(skin, 0.5), 0.2); }
    if (o.hair === 'bun') { const bx = hcx + d * HW * 0.12, by = hy - HH * 0.6; cel(g, ellP(bx, by, HW * 0.36, HH * 0.32), hc, 3.4, 8, 7, 3); taper(g, arcPts(bx, by, HW * 0.22, 3.4, 6.0, 8, HH * 0.18), 2.2, mixc(hc, INK, 0.4)); taper(g, [[bx - HW * 0.3, by + HH * 0.22], [bx + HW * 0.3, by + HH * 0.22]], 3, mixc(hc, '#c04a5a', 0.6), 0.3); }
    // ears from behind: the back of the ear, cup hidden
    if (o.hair !== 'long') for (const s of [-1, 1]) { const { X, vis } = earAt(s); if (vis < -0.05) continue; const ey0 = hy + HH * 0.1, out = Math.sign(X - hcx) || s;
      cel(g, ellP(X + out * 2 * fz, ey0, 10 * fz * clamp(0.5 + vis, 0.55, 1), 17 * fz, out * 0.2), skin, 3, 3, 3, 0, null, SHADE_SKIN); taper(g, arcPts(X + out * 1 * fz, ey0, 5 * fz, out > 0 ? -1.2 : 4.3, out > 0 ? 1.2 : 1.9, 5, 10 * fz), 1.6, mixc(skin, INK, 0.45), 0.2); } }
  // near ear (turned views): on top of hair, behind the face features
  if (o.hair === 'wild' || o.hair === 'tufts') einHair('front'); // [EIN-cast]
  if (!BACKH) drawBeard(false); // [CASTRO-cast]
  if (turned && !BACKH && !earsHidden) drawEar(-Math.sign(HY || dv), false);
  if (o.pencil) { const s2 = turned ? -Math.sign(HY || dv) : 1, { X, vis } = earAt(s2); if (vis > -0.3 || BACKH) { const ey0 = hy + HH * 0.04, f2 = turned ? (BACKH ? -dv : dv) : s2 * 0.25, a = [X - f2 * 34 * fz, ey0 - 10 * fz], b = [X + f2 * 40 * fz, ey0 - (turned ? 18 : 40) * fz]; // [TEDDY-cast] pencil tucked behind the ear
    line(g, [a, b], 11 * fz, INK); line(g, [a, b], 7 * fz, '#e8b830'); line(g, [lerp(a, b, 0.1), lerp(b, a, 0.1)], 2 * fz, 'rgba(255,255,255,0.4)'); const t2 = [b[0] + (b[0] - a[0]) * 0.18, b[1] + (b[1] - a[1]) * 0.18]; cel(g, polyPath([lerp(a, b, 0.97).map((v, i) => v + (i ? -3 : 0) * fz), lerp(a, b, 0.97).map((v, i) => v + (i ? 3 : 0) * fz), t2]), '#e8c8a0', 1.6, 0, 0, 0); cel(g, ellP(a[0], a[1], 5 * fz, 4 * fz), '#e07a8a', 1.6, 0, 0, 0); } }
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
    if (!BACKH) capVisor(hk, cut);
    if (o.neck === 'scarf' && !o.plainCap && !BACKH) { const gy = hy + HH * (cut - 0.12); const G = (x) => hmapPt([hcx + x * HW, gy])[0]; line(g, [[G(-0.98), gy + 4], [G(0.98), gy + 4]], 7, INK); line(g, [[G(-0.96), gy + 4], [G(0.96), gy + 4]], 4, '#6a4428');
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
  if (o.hat === 'toque') { const hk = o.hatCol || '#fbf8f2', bY = hy - HH * 0.6, bw = HW * 0.8, bh = 44 * fz, fc = mixc(hk, INK, 0.3); /* [JG-cast] baker's toque: pleated band + puffy crown */
    for (const [dx, dy, rx, ry] of [[-0.55, 1.0, 0.62, 0.5], [0.55, 1.0, 0.62, 0.5], [0, 1.45, 0.72, 0.55], [-0.3, 1.2, 0.6, 0.5], [0.3, 1.2, 0.6, 0.5]]) cel(g, ellP(hx + dx * bw, bY - bh - dy * bw * 0.62, rx * bw, ry * bw * 0.85), hk, 3.0, 8, 5, 3);
    const band = new Path2D(); band.moveTo(hx - bw, bY); band.lineTo(hx - bw * 1.04, bY - bh); band.quadraticCurveTo(hx, bY - bh - 8 * fz, hx + bw * 1.04, bY - bh); band.lineTo(hx + bw, bY); band.quadraticCurveTo(hx, bY + 10 * fz, hx - bw, bY); band.closePath(); cel(g, band, hk, 3.0, 8, 4, 2);
    g.save(); g.clip(band); for (let i = -3; i <= 3; i++) { const a = i * 0.38 + HY; if (Math.cos(a) < 0.1) continue; const X = hx + bw * Math.sin(a); taper(g, [[X, bY - bh + 4], [X, bY - 2]], 1.6, rgba(fc, 0.6), 0.2); } g.restore(); }
  if (o.hat === 'surgcap') { const hk = o.hatCol || '#8ac0b0', bY = hy - HH * 0.6;
    const dm = new Path2D(); dm.moveTo(hx - HW * 0.92, bY); dm.bezierCurveTo(hx - HW * 1.0, bY - 120 * fz, hx + HW * 1.0, bY - 120 * fz, hx + HW * 0.92, bY); dm.quadraticCurveTo(hx, bY + 14 * fz, hx - HW * 0.92, bY); dm.closePath(); cel(g, dm, hk, 3.0, 10, 5, 3);
    g.save(); g.clip(dm); const fc = mixc(hk, INK, 0.35);
    for (const a0 of [-0.9, -0.3, 0.3, 0.9]) { const a = a0 + HY; if (Math.cos(a) < 0.05) continue; const X = hx + HW * 0.9 * Math.sin(a); taper(g, [[hx + (X - hx) * 0.3, bY - 104 * fz], [X, bY - 50 * fz], [X, bY + 4]], 1.6, fc, 0.1); }
    g.restore();
    // ties at the back: visible once the head turns
    { const a = Math.PI + HY, d = Math.cos(a); if (d > -0.6) { const X = hx + HW * 0.92 * Math.sin(a), y = bY + 2; if (Math.abs(Math.sin(a)) <= 0.4 && d > 0.6) for (const sd of [-1, 1]) cel(g, polyPath([[X, y - 2], [X + sd * 10 * fz, y + 34 * fz], [X + sd * 2 * fz, y + 36 * fz]]), dk(hk, 0.92), 2, 2, 2, 0); if (Math.abs(Math.sin(a)) > 0.4) { const sd = Math.sign(Math.sin(a)); cel(g, polyPath([[X, y - 4], [X + sd * 18 * fz, y + 26 * fz], [X + sd * 6 * fz, y + 30 * fz]]), hk, 2, 2, 2, 0); cel(g, polyPath([[X, y - 4], [X + sd * 26 * fz, y + 14 * fz], [X + sd * 20 * fz, y + 22 * fz]]), dk(hk, 0.9), 2, 2, 2, 0); } } } }
  if (o.hat === 'slouch' || o.hat === 'wide') { const W2 = o.hat === 'wide', hk = o.hatCol || (W2 ? '#5e4c3c' : '#8a6c4a'), bY = hy - HH * (W2 ? 0.6 : 0.58), Rb = HW * (W2 ? 1.6 : 1.4), Rc = HW * (W2 ? 0.8 : 0.78); // [TEDDY-cast] soft felt hats: TR's slouch hunting hat / Collier's weathered wide brim
    const crown = () => { const top = []; for (let i = 0; i <= 16; i++) { const u = -1 + i / 8, au = Math.abs(u), uf = u * (Math.sign(HY) || 1);
        const hf = W2 ? 100 - 26 * au ** 4 : 88 + 10 * Math.sin(Math.PI * Math.min(1, au / 0.85)) - 9 * (1 - au) ** 2 - 22 * au ** 6, hs = W2 ? 100 - 4 * uf - 22 * au ** 4 : 94 - 8 * uf - 7 * Math.exp(-(((uf - 0.5) / 0.3) ** 2)) - 20 * au ** 6;
        top.push([hx + u * Rc * 0.92, bY - (hf + (hs - hf) * AH) * fz]); }
      return polyPath([[hx - Rc, bY], ...cr(top, false, 3), [hx + Rc, bY]]); };
    const hb = W2 ? (q) => 7 * fz * Math.max(0, Math.cos(q)) ** 2 + 5 * fz * Math.sin(q) ** 2 - 3 * fz * Math.max(0, -Math.cos(q)) ** 2 + 2 * fz * Math.sin(q * 3)
      : (q) => 16 * fz * Math.max(0, Math.cos(q)) ** 2 + 7 * fz * Math.sin(q) ** 2 - 9 * fz * Math.max(0, -Math.cos(q)) ** 2;
    hatSolid(hk, bY, Rb, Rc, 19 * fz / Rb, hb, crown, (cp) => { const bc = W2 ? mixc(hk, '#1a1210', 0.45) : '#4a3222'; g.save(); g.clip(cp);
      const band = new Path2D(); band.rect(hx - Rb, bY - (W2 ? 22 : 20) * fz, Rb * 2, (W2 ? 16 : 18) * fz); g.fillStyle = bc; g.fill(band);
      if (W2) { g.fillStyle = 'rgba(230,210,170,0.1)'; for (const [x0, y0, r0] of [[-0.45, 62, 20], [0.35, 72, 16]]) { g.beginPath(); g.ellipse(hx + x0 * Rc, bY - y0 * fz, r0 * fz * 1.4, r0 * fz, 0.3, 0, TAU); g.fill(); } g.fillStyle = 'rgba(40,24,10,0.25)'; g.fillRect(hx - Rb, bY - 32 * fz, Rb * 2, 8 * fz); }
      else { if (hyc > 0.05) for (const s2 of [-1, 1]) { const a = HY + s2 * 0.34, X = hx + Rc * 0.8 * Math.sin(a); if (Math.cos(a) > 0) taper(g, [[X, bY - 82 * fz], [X + s2 * 3 * fz * hyc, bY - 56 * fz]], 2.4, mixc(hk, INK, 0.45), 0.3); }
        taper(g, [[hx + Rc * 0.55 * hys, bY - 92 * fz], [hx + Rc * 0.1 * hys, bY - 84 * fz], [hx - Rc * 0.5 * hys, bY - 88 * fz]], 2.6, mixc(hk, INK, 0.45), 0.4); }
      taper(g, [[hx - SG * Rc * 0.62, bY - 76 * fz], [hx - SG * Rc * 0.74, bY - 30 * fz]], 4.5, rgba(lt(hk, 0.4), 0.35), 0.3); g.restore();
      if (!W2) bandBow(Rc * 0.95, bY - 11 * fz, mixc(bc, '#c8a070', 0.3)); });
    if (W2) { g.save(); g.strokeStyle = rgba(lt(hk, 0.35), 0.7); g.lineWidth = 1.6; for (const a0 of [-1.1, -0.2, 0.7, 1.3]) { const P0 = ringPts(Rb * 0.99, bY, 19 * fz / Rb, hb, a0 + HY, a0 + HY + 0.12, 2); if (Math.cos(a0) < 0) continue; g.beginPath(); P0.forEach(([x, y], i) => i ? g.lineTo(x, y + 2) : g.moveTo(x, y + 2)); g.stroke(); } g.restore(); } }
  if (o.hat === 'beanie') { const hk = o.hatCol || '#c8463c', cut = -0.32; // [TEDDY-cast] knit beanie with a turned-up cuff + pompom
    const dome = backCap(polyPath(HMP([...capPts(cut).map(([x, y]) => [hcx + (x - hcx) * 1.04, y - HH * 0.06]), ...cr(rel([[1.06, cut], [0.5, cut + 0.04], [0, cut + 0.05], [-0.5, cut + 0.04], [-1.06, cut]]), false, 4)])), -0.3);
    cel(g, dome, hk, 3.6, HW * 0.14, HH * 0.08, 4); g.save(); g.clip(dome); const fc = mixc(hk, INK, 0.35); for (let k = -5; k <= 5; k++) { const a = k * 0.28 + HY; if (Math.cos(a) < 0.1) continue; const X = hcx + HW * Math.sin(a); taper(g, [[hcx + (X - hcx) * 0.4, hy - HH * 1.05], [X, hy + HH * (cut - 0.1)]], 1.4, fc, 0.1); }
    const cb = new Path2D(); cb.rect(0, hy + HH * (cut - 0.2), 600, HH * 0.22); g.fillStyle = mixc(hk, '#ffffff', 0.12); g.fill(cb); taper(g, HMP(rel([[-1.1, cut - 0.2], [0, cut - 0.22], [1.1, cut - 0.2]])), 1.8, fc, 0.1); g.restore();
    cel(g, ellP(hcx + SN * HW * 0.1, hy - HH * 1.14, 22 * fz, 20 * fz), o.pomCol || '#f2ece0', 3, 4, 3, 2); }
  if (o.hat === 'patrol') patrolCap(); if (o.hat === 'straw') strawHat(); if (o.headphones) headphones(); // [CASTRO-cast]
  libHat(); // [LIB-cast]
  kchHat(); // [KCH-cast]
  napHat(); // [NAP-cast] bicorne (worn sideways) / grenadier bearskin
  einHat(); // [EIN-cast] press card / cap badge
  if (!BACKH) { // ---------- face (local frame: head centre, unit = fz px) ----------
  const E = expr, red = '#e0303a', w = HW / fz; let PNC = null; // [TEDDY-cast] PNC: pince-nez cord anchor
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
  for (const s of [-1, 1]) { const BB = BRD && BRD !== 'none', m = fm(s * w * (BB ? 0.55 : 0.6), BB ? 25 : 36, 1.35); if (m.c < 0.15) continue; const bx = m.x, by = (BB ? 25 : 36) - smileK * 3; /* [CASTRO-cast] blush sits higher above a beard */
    const bk = BB ? 0.72 : 1; g.beginPath(); g.ellipse(bx, by, (exciteE ? 15 : 12.5 + smileK * 1.5) * m.sx * bk, (exciteE ? 8 : 6.6 + smileK) * bk, 0, 0, TAU); g.fillStyle = angryE ? 'rgba(230,60,70,0.5)' : 'rgba(240,100,130,0.42)'; g.fill();
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
    else if (E === 'relieved') taper(g, [[ex - 11, ey - 1], [ex, ey + 5], [ex + 11, ey - 1]], 4.4, INK, 0.35); // [EIN-cast]
    else if (LIBEYE.includes(E)) libEye(E, ex, ey, s, lx, lyy); // [LIB-cast]
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
      const LD = LIDS[E] || (meanE ? LIDS.smug : null) || (o.droopy && !shockE && !exciteE ? [0.16, 0.42] : null); // [EIN-cast] droopy lids
      if (LD && blink === 0) { const yi = eyeY - ry + 2 * ry * LD[0], yo = eyeY - ry + 2 * ry * LD[1]; g.fillStyle = mixc(skin, '#c99ab8', 0.18); g.beginPath(); g.moveTo(lx - s * (rx + 3), yi); g.quadraticCurveTo(lx, (yi + yo) / 2 - 2, lx + s * (rx + 3), yo); g.lineTo(lx + s * (rx + 3), eyeY - ry - 4); g.lineTo(lx - s * (rx + 3), eyeY - ry - 4); g.closePath(); g.fill(); }
      g.restore();
      if (LD && blink === 0) { const yi = eyeY - ry + 2 * ry * LD[0], yo = eyeY - ry + 2 * ry * LD[1]; taper(g, [[lx - s * (rx + 1.5), yi + 0.5], [lx, (yi + yo) / 2 - 1], [lx + s * (rx + 2.5), yo + 0.5]], 3.2, INK, 0.35); }
      if (smileK > 0 && blink === 0) taper(g, arcPts(lx, eyeY + ry * (1.55 - 0.25 * smileK), rx * 1.25, Math.PI * 1.3, Math.PI * 1.7, 6, ry * 0.7), 1.6, mixc(skin, INK, 0.45), 0.2);
      if (lady && blink === 0) { taper(g, [[lx + s * (rx - 1), eyeY - ry * 0.6], [lx + s * (rx + 5), eyeY - ry * 0.95]], 2.2, INK, 0.3); taper(g, [[lx + s * (rx - 3), eyeY - ry * 0.85], [lx + s * (rx + 2), eyeY - ry * 1.25]], 1.8, INK, 0.3); }
    }
    const bc = o.brow || (hairOn ? dk(hc, 0.8) : INK), by = ey - 25 - (exciteE || shockE ? 8 : 0) - (op.browPop ? 3 : 0);
    const bw = (o.build === 'stout' || o.moustache ? 7.6 : 6.6) * (o.bushyBrow ? 1.4 : 1); // [EIN-cast]
    let BR = BROWS[E] || BROWS.smile;
    if (meanE) BR = s < 0 ? [14, 7, -2, 1] : [1, -10, -3, 0.9];
    if (E === 'whistle' && s > 0) BR = [0, -9, -2, 0.85];
    if (E === 'bored' && s > 0) BR = [3, 2, 4, 0.9];
    if (E === 'sly') BR = s > 0 ? [-4, -13, -7, 0.9] : [9, 5, 3, 0.95]; // [LIB-cast] one brow up
    taper(g, [[ex - s * 11, by + BR[0]], [ex + s * 1, by + BR[1]], [ex + s * 13, by + BR[2]]], bw * BR[3], bc, 0.3);
    if (o.bushyBrow) for (const [t0, dx, dy] of [[0.15, -1, -8], [0.45, 2, -9], [0.75, 5, -7], [1, 9, -1]]) { const q = [ex - s * 11 + s * 24 * t0, by + (t0 < 0.5 ? BR[0] + (BR[1] - BR[0]) * t0 * 2 : BR[1] + (BR[2] - BR[1]) * (t0 - 0.5) * 2)]; taper(g, [q, [q[0] + s * dx, q[1] + dy]], 3.2, bc, 0.2); } // [EIN-cast] bushy brows
    if (sadE) { g.beginPath(); g.moveTo(ex + s * 9, ey + 13); g.quadraticCurveTo(ex + s * 15, ey + 25, ex + s * 10, ey + 29); g.quadraticCurveTo(ex + s * 4, ey + 25, ex + s * 9, ey + 13); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 1.8; g.strokeStyle = INK; g.stroke(); }
    g.restore();
  }
  einFace(fm, ey, w); // [EIN-cast] age lines
  if (o.glasses) { const rims = [-1, 1].map((s) => { const m = fm(s * w * 0.38, ey, kF); return { s, m }; }).filter((q) => q.m.c > 0.18);
    const HRN = o.glasses === 'horn'; // [CASTRO-cast] horn-rimmed
    if (o.glasses === 'pincenez') { for (const { m } of rims) { const lp = ellP(m.x, ey + 1, 14.5 * m.sx, 13.5); g.fillStyle = 'rgba(215,232,255,0.16)'; g.fill(lp); g.lineWidth = 2.8; g.strokeStyle = INK; g.stroke(lp); g.lineWidth = 1.1; g.strokeStyle = '#c8a850'; g.stroke(lp); g.beginPath(); g.ellipse(m.x - 4 * m.sx, ey - 4, 8 * m.sx, 8, 0, Math.PI * 1.05, Math.PI * 1.5); g.lineWidth = 1.8; g.strokeStyle = 'rgba(255,255,255,0.85)'; g.stroke(); } // [TEDDY-cast] pince-nez (no temples) + cord
      if (rims.length === 2) { const [a, b] = rims; taper(g, [[a.m.x + 14 * a.m.sx, ey - 2], [(a.m.x + b.m.x) / 2, ey - 9], [b.m.x - 14 * b.m.sx, ey - 2]], 2.4, INK, 0.7); }
      else if (rims.length === 1) { const { m } = rims[0]; taper(g, [[m.x + dv * 14 * m.sx, ey - 2], [m.x + dv * 21 * m.sx, ey - 6]], 2.2, INK, 0.7); }
      const cs = turned ? -dv : 1, cr0 = rims.find((q) => q.s === cs) || rims[0]; if (cr0) PNC = { x: cr0.m.x + cs * 14 * cr0.m.sx, s: cs }; }
    else {
    for (const { s, m } of rims) { if (HRN) { g.beginPath(); g.ellipse(m.x, ey, 19 * m.sx, 17, 0, 0, TAU); g.fillStyle = 'rgba(200,220,255,0.12)'; g.fill(); g.lineWidth = 6.5; g.strokeStyle = INK; g.stroke(); g.lineWidth = 3.6; g.strokeStyle = '#4a2a1c'; g.stroke(); g.beginPath(); g.ellipse(m.x, ey, 19 * m.sx, 17, 0, Math.PI * 1.08, Math.PI * 1.92); g.lineWidth = 7; g.strokeStyle = '#3a2016'; g.stroke(); continue; }
      g.beginPath(); g.ellipse(m.x, ey, 19 * m.sx, 19, 0, 0, TAU); g.lineWidth = 2.8; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.ellipse(m.x - 6 * m.sx, ey - 7, 11 * m.sx, 11, 0, Math.PI * 1.05, Math.PI * 1.45); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,0.85)'; g.stroke(); }
    if (rims.length === 2) { const [a, b] = rims; taper(g, [[a.m.x + 19 * a.m.sx, ey - 2], [(a.m.x + b.m.x) / 2, ey - 5], [b.m.x - 19 * b.m.sx, ey - 2]], 2.6, INK, 0.8); }
    else if (rims.length === 1) { const { m } = rims[0]; taper(g, [[m.x + dv * 19 * m.sx, ey - 2], [m.x + dv * 26 * m.sx, ey - 4]], 2.4, INK, 0.8); }
    for (const { s, m } of rims) { if (!turned) line(g, [[s * (w * 0.38 + 19), ey - 2], [s * w * 0.92, ey - 6]], 2.4); else if (s === -Math.sign(HY)) { const ear = (earAt(s).X - hcx) / fz; line(g, [[m.x - dv * 19 * m.sx, ey - 2], [ear + dv * 6, ey - 4]], 2.4); } } } }
  EGC = o.glasses && o.glassChain ? (turned ? [-Math.sign(HY)] : [-1, 1]).map((s) => ({ s, x: turned ? (earAt(s).X - hcx) / fz : s * w * 0.92 })) : null; // [EIN-cast]
  if (o.goggles) { const rims = [-1, 1].map((s) => ({ s, m: fm(s * w * 0.38, ey, kF) })).filter((q) => q.m.c > 0.1), gc = o.gogglesCol || '#5a7a6a'; // [CASTRO-cast] lab goggles
    if (rims.length === 2) line(g, [[rims[0].m.x, ey], [rims[1].m.x, ey]], 8, INK);
    for (const { m } of rims) { const gp = ellP(m.x, ey, 22 * m.sx, 19); g.fillStyle = 'rgba(190,235,225,0.28)'; g.fill(gp); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(gp); g.lineWidth = 5.5; g.strokeStyle = gc; g.stroke(gp); g.beginPath(); g.ellipse(m.x - 7 * m.sx, ey - 6, 9 * m.sx, 7, 0, Math.PI * 1.05, Math.PI * 1.5); g.lineWidth = 2.4; g.strokeStyle = 'rgba(255,255,255,0.85)'; g.stroke(); }
    for (const s of [-1, 1]) { const ex = fm(s * w * 0.98, ey); if (ex.c > -0.2 && Math.abs(ex.x) > 30) line(g, [[s * w * 0.6 * Math.max(0.2, Math.cos(HY)) + Math.sin(HY) * w * 0.4 * (s === Math.sign(HY) ? 1 : 0.6), ey - 2], [ex.x, ey - 6]], 6, mixc(gc, INK, 0.4)); } }
  if (BRD && BRD !== 'none') { const wx = fm(0, 50).x + (AH > 0.8 ? -dv * 6 : 0), wsx = AH > 0.8 ? 0.8 : clamp(0.55 + 0.45 * Math.cos(HY), 0.55, 1); g.beginPath(); g.ellipse(wx, 53, 21 * wsx, 15, 0, 0, TAU); g.fillStyle = skin; g.fill(); taper(g, arcPts(wx, 53, 21 * wsx, Math.PI * 0.1, Math.PI * 0.9, 8, 15), 2, mixc(BRDC, INK, 0.3), 0.3); } // [CASTRO-cast] lips window in the beard
  if (o.moustache && o.stache === 'bushy') { const mp = new Path2D(); // [TEDDY-cast] big bushy moustache (TR)
    for (const s of [-1, 1]) for (const [x0, y0, rx, ry, rt] of [[7, 40, 13, 10, 0.1], [19, 42, 14, 11, 0.25], [30, 47, 11, 10, 0.5], [37, 54, 7.5, 7.5, 0.8]]) { const m = fm(s * x0, y0, AH > 0.8 ? 1.25 : 1); if (m.c < 0.12) continue; ellP(m.x + (AH > 0.8 ? dv * 4 : 0), y0, rx * Math.max(0.6, m.sx), ry, s * rt * (turned ? 0.7 : 1), mp); }
    cel(g, mp, o.moustache, 2.6, 4, 3, 0); g.save(); g.clip(mp); for (const s of [-1, 1]) for (const [x0, y0] of [[6, 36], [14, 38], [22, 41], [30, 46]]) { const m = fm(s * x0, y0); if (m.c < 0.15) continue; taper(g, [[m.x, y0], [m.x + s * 4 * m.sx, y0 + 10]], 1.4, mixc(o.moustache, INK, 0.4), 0.2); }
    taper(g, [[fm(-16, 38).x, 37], [fm(-4, 36).x, 36]], 3, rgba(lt(o.moustache, 0.4), 0.6), 0.3); g.restore(); }
  else if (o.moustache && o.stache === 'curl') kchStache(fm); /* [KCH-cast] */
  else if (o.moustache && BRD !== 'none') { const mp = new Path2D(); for (const s of [-1, 1]) { const m = fm(s * 13, 41, AH > 0.8 ? 1.3 : 1); if (m.c < 0.15) continue; ellP(m.x + (AH > 0.8 ? dv * 4 : 0), 41, 15 * Math.max(0.6, m.sx), 6.4, s * (angryE ? 0.5 : 0.25) * (turned ? 0.6 : 1), mp); } cel(g, mp, o.moustache, 2.4, 3, 2, 0);
    g.save(); g.clip(mp); for (const s of [-1, 1]) { const m = fm(s * 13, 41); taper(g, [[m.x - 5, 38], [m.x + 5, 43]], 1.2, mixc(o.moustache, INK, 0.35), 0.2); } g.restore(); }
  // ---------- mouth (soft shapes, no teeth) ----------
  const my = 50 + (o.stache === 'bushy' ? 8 : 0), mm = fm(0, my, AH > 0.8 ? 1 : 1), msx = AH > 0.8 ? 0.8 : clamp(0.55 + 0.45 * Math.cos(HY), 0.55, 1);
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
  // speech: op.say = { text, t0, t1 } (frames) maps letters to visemes across [t0, t1]; op.sayEnv (per-frame RMS) is the fallback;
  // op.talk (0..1) still works for direct callers. No narrator lip-sync: main.js passes talk: null.
  let tk = op.talk, vz = null;
  if (op.say && op.say.text && op.frame != null) { const { text, t0, t1 } = op.say; if (op.frame >= t0 && op.frame <= t1 && text.length) { const ch = text[Math.min(text.length - 1, Math.floor((op.frame - t0) / Math.max(1, t1 - t0) * text.length))].toLowerCase();
      vz = /[aáàâh]/.test(ch) ? 'A' : /[eéèêiíy]/.test(ch) ? 'E' : /[oóôuúwq]/.test(ch) ? 'O' : /[mbp]/.test(ch) ? 'M' : /[fv]/.test(ch) ? 'F' : /[a-z]/.test(ch) ? 'D' : 'R';
      tk = { A: 0.75, E: 0.5, O: 0.6, M: 0.3, F: 0.3, D: 0.32, R: 0 }[vz]; if (vz === 'D') vz = 'E'; } else tk = null; }
  else if (op.sayEnv && op.frame != null) tk = op.sayEnv[Math.min(op.sayEnv.length - 1, Math.max(0, op.frame))] ?? null;
  if (tk != null && E !== 'angry' && E !== 'pained') { const k = tk, vis = vz || ['A', 'E', 'O', 'A', 'E', 'M'][Math.floor(hsh(Math.floor(TT / 3), 11) * 6)], up = smileK ? 1 : 0.4;
    if (vis === 'F') { taper(g, [[-11, my - 2 * up], [0, my + 1], [11, my - 2 * up]], 3.2, INK, 0.3); g.beginPath(); g.ellipse(0, my + 4, 8, 3, 0, 0, Math.PI); g.fillStyle = '#c25a6a'; g.fill(); taper(g, arcPts(0, my + 4, 8, 0.1, Math.PI - 0.1, 6, 3), 1.6, mixc(skin, INK, 0.4), 0.2); }
    else if (k < 0.08 || vis === 'M' || vis === 'R') { taper(g, [[-11, my - 3 * up], [0, my + 1], [11, my - 3 * up]], 3.4, INK, 0.3); if (k >= 0.08) taper(g, [[-6, my + 6], [6, my + 6]], 1.4, mixc(skin, INK, 0.35), 0.3); }
    else if (vis === 'O') oval(6 + 5 * k, 5 + 10 * k, 4);
    else if (vis === 'E') openMouth(13 + 8 * k, 3 + 8 * k, up, false);
    else openMouth(9 + 9 * k, 4 + 14 * k, up, true);
    if (smileK) cheekTicks(14); }
  else if (['amused', 'thoughtful', 'determined', 'relieved'].includes(E)) einMouth(E, my, cheekTicks); // [EIN-cast]
  else if (['love', 'dreamy', 'sly'].includes(E)) libMouth(E, my, openMouth, cheekTicks); // [LIB-cast]
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
  // [CASTRO-cast] dive mask (op.mask / o.mask: 'face' | 'forehead') and a cigar in the mouth corner (op.cigarMouth, op.smoke)
  { const SP = (x, y) => [hcx + x * fz, hy + y * fz];
    if (o.scuba && (op.mask ?? o.mask ?? 'face') !== 'none') { const face = (op.mask ?? o.mask ?? 'face') === 'face', y0 = face ? 12 : -60, mc = o.maskCol || '#24303e', hh = face ? 25 : 19;
      const ends = [-1, 1].map((s2) => fm(s2 * w * (face ? 0.7 : 0.6), y0, kF)), xl = Math.min(ends[0].x, ends[1].x), xr = Math.max(ends[0].x, ends[1].x), [Xl, Y0] = SP(xl, y0), [Xr] = SP(xr, y0);
      const ed = [-1, 1].map((s2) => fm(s2 * w * 0.99, y0 + 4).x); line(g, [SP(ed[0], y0 + 4), SP(xl, y0 + 2)], 8, INK); line(g, [SP(xr, y0 + 2), SP(ed[1], y0 + 4)], 8, INK); line(g, [SP(ed[0], y0 + 4), SP(xl, y0 + 2)], 4.5, mc); line(g, [SP(xr, y0 + 2), SP(ed[1], y0 + 4)], 4.5, mc);
      const lp = new Path2D(); lp.roundRect(Xl - 8 * fz, Y0 - hh * fz, Xr - Xl + 16 * fz, hh * 2 * fz, 13 * fz); if (face) { const [nx] = SP(fm(2, 30).x, 30); ellP(nx, hy + 33 * fz, 15 * fz, 14 * fz, 0, lp); }
      g.lineWidth = 11 * fz; g.strokeStyle = INK; g.stroke(lp); g.lineWidth = 7 * fz; g.strokeStyle = mc; g.stroke(lp); g.fillStyle = face ? 'rgba(170,220,245,0.32)' : 'rgba(170,220,245,0.7)'; g.fill(lp);
      g.save(); g.clip(lp); taper(g, [[Xl + 4 * fz, Y0 - 4 * fz], [Xl + 22 * fz, Y0 - 16 * fz]], 5 * fz, 'rgba(255,255,255,0.85)', 0.3); taper(g, [[Xl + 20 * fz, Y0 + 2 * fz], [Xl + 34 * fz, Y0 - 8 * fz]], 2.4 * fz, 'rgba(255,255,255,0.7)', 0.3); g.restore(); }
    if (op.pipeMouth) { const s2 = turned ? dv : (op.pipeSide || SG), m = fm(s2 * 14, 56), [X, Y] = SP(m.x, 56), k = 0.6 * fz; if (m.c > -0.1) pipeAt(g, X + s2 * 80 * k, Y + 34 * k, s2, k, TT, !!(op.lit || op.smoke), !!op.smoke); } // [EIN-cast] pipe in the mouth
    if (op.cigarMouth) { const s2 = turned ? dv : (op.cigarSide || -SG), m = fm(s2 * 13, 54), [X, Y] = SP(m.x, 54); if (m.c > -0.1) cigarAt(g, X, Y, s2 > 0 ? 0.32 : Math.PI - 0.32, 62 * fz * (0.6 + 0.4 * AH), 6.8 * fz, op.lit !== false, TT, !!op.smoke); } }
  // emotion marks (outside the head clip)
  g.save(); g.translate(hcx, hy); g.scale(fz, fz); const mo = Math.sin(HY) * w * 0.25;
  if (PNC) { const sx = PNC.s, x0 = PNC.x, ex2 = sx * w * (0.95 - 0.35 * AH) + (AH > 0.8 ? -dv * 10 : 0), cp = AH > 0.5 ? [[x0, ey + 2], [x0 - dv * 4, ey + 34], [x0 - dv * 10, 96], [x0 - dv * 18, 140], [x0 - dv * 30, 175]] : [[x0, ey + 2], [x0 + sx * 10, ey + 30], [ex2, 70], [ex2 * 0.9 - sx * 8, 130], [ex2 * 0.7 - sx * 4, 170]]; taper(g, cp, 2.6, INK, 0.6); taper(g, cp, 1.2, '#3a3040', 0.6); } // [TEDDY-cast] pince-nez cord
  if (EGC) for (const { s, x } of EGC) { const cp = [[x, ey - 4], [x + s * 3, ey + 40], [x * 0.88, 104], [x * 0.66, 150]]; g.save(); g.setLineDash([2.4, 2.6]); line(g, cr(cp, false, 6), 2.8, INK); line(g, cr(cp, false, 6), 1.6, '#e0b84a'); g.restore(); } // [EIN-cast] glasses chain
  libMarks(fm, ey, w, kF, mo); // [LIB-cast] hearts / sparkles / monocle
  if (E === 'relieved') { const sx = turned ? dv : 1; for (const [dx, dy, rr] of [[0, 0, 7], [11, -4, 5], [19, -9, 3.5]]) { g.beginPath(); g.arc(sx * (w * 0.62 + dx) + mo, 58 + dy, rr, 0, TAU); g.fillStyle = '#f2f4ff'; g.fill(); g.lineWidth = 1.8; g.strokeStyle = INK; g.stroke(); } } // [EIN-cast] phew puff
  if (angryE) { const vx = w * 0.56 + mo, vy = -64; g.lineWidth = 3.2; g.strokeStyle = red; g.lineCap = 'round'; for (const [a1, a2, dx, dy] of [[0, 1.6, -5, -5], [1.6, 3.2, 5, -5], [3.2, 4.8, 5, 5], [4.8, 6.3, -5, 5]]) { g.beginPath(); g.arc(vx + dx, vy + dy, 4.5, a1, a2); g.stroke(); } }
  if (E === 'nervous' || E === 'shock' || E === 'worried') { const x = (turned ? -dv : 1) * w * 0.8 + mo, y = -42; g.beginPath(); g.moveTo(x, y - 14); g.quadraticCurveTo(x + 10, y + 4, x, y + 8); g.quadraticCurveTo(x - 10, y + 4, x, y - 14); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(x - 2.5, y + 1, 2, 0, TAU); g.fillStyle = '#fff'; g.fill(); }
  if (exciteE) for (const [sx, sy, rr0] of [[-w - 14, -66, 10], [w + 10, -84, 8], [w + 20, -22, 6]]) { g.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? rr0 * 0.32 : rr0, an = k * Math.PI / 4; g.lineTo(sx + rr * Math.cos(an), sy + rr * Math.sin(an)); } g.closePath(); g.fillStyle = '#ffe14a'; g.fill(); g.lineWidth = 1.8; g.strokeStyle = INK; g.stroke(); }
  g.restore();
  } // face
  g.translate(cx, shY); g.rotate(-tilt); g.translate(-cx, -shY);
  for (const a of arms) if (!farArm(a) && raisedLate(a)) drawArm(a);
  if ((op.ear || op.raise) && !BACKH) drawProps(true); // [EIN-cast] [LIB-cast] raised prop over the head
  g.restore(); // upper (lean) + head tilt
}
