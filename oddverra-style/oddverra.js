// Oddverra cast v3 ("premium" pass): thin variable-weight indigo ink (heavier on the shadow side), sculpted heads
// with flattened crowns + per-type jaws, smaller heads (~1/3.5 of height), structured clothing (shoulders, waist,
// sleeves, lapels, pant creases), jointed limbs (elbows/knees implied), crisp two-tone cel shade + soft rim light.
// API unchanged: oddverra(g, o, op) draws a 600x1000 card, soles at y≈965.
export const INK = '#2b1d4a', RIM = 'rgba(150,170,255,0.75)';
const TAU = Math.PI * 2;
const hex = (c) => { const n = parseInt(c.slice(1, 7), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const toHex = (a) => '#' + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mixc = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v * (1 - t) + B[i] * t)); };
const dk = (c, k = 0.74) => mixc(toHex(hex(c).map((v) => v * k)), '#3a2a7a', 0.22);
const lt = (c, t = 0.3) => mixc(c, '#fff8ec', t);
const inkFor = (base) => { try { return mixc(INK, toHex(hex(base).map((v) => v * 0.28)), 0.28); } catch (e) { return INK; } };
const lum = (c) => { const [r, g, b] = hex(c); return (0.3 * r + 0.59 * g + 0.11 * b) / 255; };
// fine diagonal twill: crisp hairlines a touch darker (light cloth) or lighter (dark cloth) than the base
const twill = (base) => (h) => { h.save(); h.strokeStyle = lum(base) > 0.45 ? 'rgba(60,40,90,0.07)' : 'rgba(255,245,230,0.06)'; h.lineWidth = 1; h.beginPath(); for (let x = -1000; x < 700; x += 5) { h.moveTo(x, 0); h.lineTo(x + 1000, 1000); } h.stroke(); h.restore(); };
// cel tones: shadow = multiply by a purple-leaning tint, rim = screen with blue-violet
const SHADE = '#a796d8', SHADE_SKIN = '#d0aad4', RIMC = 'rgba(122,142,255,0.7)', RIMC2 = 'rgba(122,142,255,0.34)';

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
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
function limb(pts, rs, P = new Path2D()) { // tapered capsule chain, joints rounded (union under nonzero)
  for (let i = 0; i < pts.length - 1; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], r1 = rs[i], r2 = rs[i + 1];
    const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a);
    polyPath([[x1 + nx * r1, y1 + ny * r1], [x2 + nx * r2, y2 + ny * r2], [x2 - nx * r2, y2 - ny * r2], [x1 - nx * r1, y1 - ny * r1]], P); }
  pts.forEach(([x, y], i) => { P.moveTo(x + rs[i], y); P.arc(x, y, rs[i], 0, TAU); });
  return P;
}

// ---------- ink + paint ----------
// cel(): thin outline (outside the shape, heavier toward lower-right), flat base, crisp shadow crescent (multiply),
// soft 2-step rim light on the shadow edge (screen), optional pattern painted under both tones.
function cel(g, p, base, ow = 3.6, dx = 9, dy = 7, rim = 4, pat = null, shade = SHADE) {
  if (typeof p === 'function') { const fn = p; p = new Path2D(); const rec = { beginPath() {}, closePath: () => p.closePath() };
    for (const k of ['moveTo', 'lineTo', 'quadraticCurveTo', 'bezierCurveTo', 'arc', 'ellipse', 'rect', 'roundRect']) rec[k] = (...a) => p[k](...a); fn(rec); }
  g.lineJoin = 'round'; g.lineCap = 'round';
  // silhouette shapes (ow>=3.5) keep a slightly heavier line; inner parts get thinner ones. Ink = indigo nudged toward local colour.
  if (ow) { const w0 = ow >= 3.5 ? ow * 0.9 : ow * 0.72; g.strokeStyle = inkFor(base); g.save(); g.translate(w0 * 0.22, w0 * 0.3); g.lineWidth = w0 * 2.1; g.stroke(p); g.restore(); g.lineWidth = w0 * 2; g.stroke(p); }
  const paint = (sh, rimA) => { g.fillStyle = base; g.fill(p); if (pat) pat(g);
    if (sh) { g.globalCompositeOperation = 'multiply'; g.fillStyle = shade; g.fill(p); }
    if (rimA) { g.globalCompositeOperation = 'screen'; g.fillStyle = rimA; g.fill(p); }
    g.globalCompositeOperation = 'source-over'; };
  const clipAt = (x, y) => { g.translate(x, y); g.clip(p); g.translate(-x, -y); };
  g.save(); g.clip(p);
  if (!dx && !dy) { paint(false); g.restore(); return; }
  if (rim) { paint(true, RIMC); clipAt(-rim * 0.55, -rim * 0.2); paint(true, RIMC2); clipAt(-rim * 0.5, -rim * 0.2); }
  paint(true); clipAt(-dx, -dy); paint(false); g.restore();
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

// heads: half-width W, half-height H, right-half anchors (x in W, y in H) from crown to chin. Flattened crowns, defined jaws.
const HEADS = {
  round: { W: 106, H: 98, a: [[0, -1], [0.6, -0.96], [0.92, -0.64], [1.0, -0.12], [0.97, 0.34], [0.8, 0.72], [0.44, 0.96], [0, 1]] },
  egg: { W: 96, H: 106, a: [[0, -1], [0.56, -0.95], [0.88, -0.62], [0.97, -0.1], [0.9, 0.38], [0.66, 0.78], [0.3, 0.98], [0, 1.01]] },
  wide: { W: 118, H: 94, a: [[0, -1], [0.66, -0.97], [0.96, -0.66], [1.0, -0.14], [1.02, 0.34], [0.9, 0.74], [0.5, 0.97], [0, 0.99]] },
  tall: { W: 90, H: 110, a: [[0, -1], [0.58, -0.95], [0.9, -0.62], [0.96, -0.1], [0.9, 0.42], [0.62, 0.82], [0.26, 1.0], [0, 1.02]] },
};
const BUILD = { adult: { w: 1, h: 1, leg: 1, hs: 1, arm: 1 }, thin: { w: 0.86, h: 1.05, leg: 1.07, hs: 0.98, arm: 1.04 }, stout: { w: 1.24, h: 0.96, leg: 0.9, hs: 1.04, arm: 0.97, belly: 1 }, kid: { w: 0.86, h: 0.74, leg: 0.7, hs: 0.9, arm: 0.74 }, old: { w: 1.04, h: 0.95, leg: 0.9, hs: 1, arm: 0.95 } };

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
  megaphone: (g) => { cel(g, polyPath([[-10, -20], [-40, -150], [60, -150], [20, -20]]), '#e8e4dc', 4.5, 14, 6, 5); cel(g, ((p) => { p.rect(-46, -160, 112, 15); return p; })(new Path2D()), '#c0453a', 4, 6, 3, 0); },
};

export function oddverra(g, o, op = {}) {
  const { expr = 'smile', look = 0, blink = 0, wave, cheer } = op;
  const B = BUILD[o.build || 'adult'] || BUILD.adult, HD = HEADS[o.head || 'round'] || HEADS.round;
  const skin = o.skin || '#f6c9a4', cx = 300, sole = 965, mode = op.mode || 'stand', ph = op.phase || 0, TT = op.t || 0;
  const MV = mode === 'run' ? 1 : (op.drive || mode === 'sit') ? 0.6 : 0.3;
  const ank = sole - 26, legL = 250 * B.leg;
  const hipY = ank - legL * (mode === 'sit' ? 0.42 : 1), torsoH = 236 * B.h, shY = hipY - torsoH, TW = 84 * B.w;
  const WW = TW * (B.belly ? 1.02 : 0.8), HPW = TW * (B.belly ? 0.96 : 0.86), waistY = shY + torsoH * 0.6;
  const HW = HD.W * B.hs, HH = HD.H * B.hs, fz = HH / 100, hy = shY - 2 - HH * HD.a[HD.a.length - 1][1] + (o.build === 'old' ? 10 : 0);
  const NW = 21 * Math.sqrt(B.w) * B.hs, AL = 100 * B.arm, ra = 14.5 * Math.sqrt(B.w) * (o.build === 'kid' ? 0.9 : 1);
  const runner = !!o.bib, lady = !!o.lashes && !runner, kidT = o.build === 'kid' || (!!o.stripe && !runner);
  const jacket = !runner && !lady && !kidT && (o.neck === 'tie' || o.neck === 'scarf' || o.pattern === 'tweed' || o.pattern === 'pinstripe' || o.pattern === 'plaid');
  const shortSleeve = runner || kidT;
  const hemY = runner ? hipY - 28 : jacket ? hipY + 34 : lady ? waistY + 14 : hipY - 4;
  const hs = op.stance === 'relaxed' ? 10 : 0;
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
  // ---------- back hair (behind everything) ----------
  const HP = (() => { const A = HD.a.map(([x, y]) => [cx + x * HW, hy + y * HH]); const L = HD.a.slice(1, -1).reverse().map(([x, y]) => [cx - x * HW, hy + y * HH]); return cr([...A, ...L], true, 10); })();
  const headP = polyPath(HP);
  const hc = o.hairCol || '#3a2a20', hairOn = o.hair && o.hair !== 'bald';
  if (o.hair === 'bun') { cel(g, ellP(cx + 4, hy - HH * 1.02, HW * 0.38, HH * 0.34), hc, 3.4, 8, 7, 3); taper(g, arcPts(cx + 4, hy - HH * 1.02, HW * 0.24, 3.6, 5.4, 8, HH * 0.2), 2.2, mixc(hc, INK, 0.4)); }
  if (o.hair === 'long') { const sw = Math.sin(TT * 0.4) * 4 * MV, by = shY + 70;
    const lp = smooth([[cx - HW * 1.04, hy - HH * 0.2], [cx - HW * 1.12, hy + HH * 0.6], [cx - HW * 1.08 + sw, by - 20], [cx - HW * 0.8 + sw, by], [cx - HW * 0.45 + sw, by - 12], [cx, by - 4], [cx + HW * 0.45 + sw, by - 12], [cx + HW * 0.8 + sw, by], [cx + HW * 1.08 + sw, by - 20], [cx + HW * 1.12, hy + HH * 0.6], [cx + HW * 1.04, hy - HH * 0.2], [cx, hy - HH * 1.1]], 8);
    cel(g, lp, dk(hc, 0.9), 3.6, 10, 6, 4); }
  // ---------- legs, pants, shoes ----------
  const lift = (s) => mode === 'run' ? Math.max(0, Math.sin(TAU * (ph + (s > 0 ? 0.5 : 0)))) : 0;
  const legs = [-1, 1].map((s) => {
    const hj = [cx + s * HPW * 0.47 + hs, hipY - 6], Ls = lift(s); let K, A, fy = ank;
    if (mode === 'sit') { K = [cx + s * HPW * 0.95, hipY + 10]; A = [cx + s * HPW * 1.0, ank]; }
    else if (mode === 'fall') { K = [cx + s * HPW * 1.25, hipY + legL * 0.36]; A = [cx + s * HPW * 1.85, ank - 44]; fy = ank - 44; }
    else if (mode === 'run') { K = [hj[0] + s * 8, hipY + legL * 0.5 - Ls * legL * 0.3]; A = [hj[0] + s * 6, ank - Ls * legL * 0.44]; fy = A[1]; }
    else { const bent = hs && s === -1; K = [hj[0] + (bent ? s * -8 : s * 2), hipY + legL * 0.5]; A = [cx + s * (HPW * 0.5 + 4) + hs * 0.5 + (bent ? s * 10 : 0), ank]; }
    return { s, hj, K, A, fy, Ls };
  });
  const rl = HPW * 0.5;
  if (!lady || mode === 'sit' || mode === 'fall' || mode === 'run') {
    const pantsP = polyPath([[cx - WW * 0.97, waistY], [cx + WW * 0.97, waistY], [cx + HPW, hipY - 18], [cx + HPW * 0.5, hipY + 8], [cx, hipY + 12], [cx - HPW * 0.5, hipY + 8], [cx - HPW, hipY - 18]]);
    for (const L of legs) { const near = mode === 'sit' ? 1.08 : 1 + 0.22 * L.Ls; limb([L.hj, lerp(L.hj, L.K, 0.5), L.K, lerp(L.K, L.A, 0.55), L.A], [rl, rl * 0.9, rl * 0.76 * near, rl * 0.74, rl * 0.7], pantsP); }
    cel(g, pantsP, o.pants || '#3b3f52', 3.6, rl * 0.5, 4, 6, twill(o.pants || '#3b3f52'));
    // creases + knee folds (crisp ink, not overlays)
    const crc = mixc(o.pants || '#3b3f52', INK, 0.5);
    for (const L of legs) { const s = L.s;
      if (mode !== 'sit') taper(g, [lerp(L.hj, L.K, 0.25), [L.K[0] - s * rl * 0.15, L.K[1]], lerp(L.K, L.A, 0.85)], 2.2, crc, 0.1);
      const bend = Math.abs(Math.atan2(L.K[0] - L.hj[0], L.K[1] - L.hj[1]) - Math.atan2(L.A[0] - L.K[0], L.A[1] - L.K[1]));
      if (bend > 0.25 || mode === 'sit') { taper(g, [[L.K[0] - rl * 0.5, L.K[1] + 6], [L.K[0], L.K[1] + 2], [L.K[0] + rl * 0.5, L.K[1] + 6]], 2.4, crc, 0.2); }
      else taper(g, [[L.K[0] - s * rl * 0.62, L.K[1] - 4], [L.K[0] - s * rl * 0.3, L.K[1] + 6]], 2, crc, 0.2);
      taper(g, [[L.A[0] - rl * 0.62, L.A[1] - 8], [L.A[0] + rl * 0.62, L.A[1] - 8]], 1.8, crc, 0.4); }
    if (o.belt || runner || kidT) { const bt = o.belt || '#6a4428', bY0 = runner ? hemY + 1 : kidT ? hemY - 6 : waistY + 8, bp = new Path2D(); bp.rect(cx - HPW * 1.2, bY0, HPW * 2.4, 13); g.save(); g.clip(pantsP); cel(g, bp, bt, 0, 8, 0, 0); g.fillStyle = 'rgba(255,230,190,0.35)'; for (let x = cx - HPW; x < cx + HPW; x += 9) g.fillRect(x, bY0 + 2, 3, 1.2); g.restore();
      line(g, [[cx - HPW * 1.02, bY0 + 13], [cx + HPW * 1.02, bY0 + 13]], 1.6); const bk = new Path2D(); bk.roundRect(cx - 9, bY0 - 2, 18, 17, 3); cel(g, bk, '#d9b04a', 2, 3, 2, 0); g.lineWidth = 1.6; g.strokeStyle = '#8a6420'; g.strokeRect(cx - 4.5, bY0 + 2.5, 9, 8); }
    if (kidT && mode !== 'sit') { const L = legs[0], pp = ellP(L.K[0] + 2, L.K[1] + 4, rl * 0.5, rl * 0.46, 0.2); cel(g, pp, '#a8865a', 2, 3, 3, 0); g.setLineDash([3, 3]); g.lineWidth = 1.2; g.strokeStyle = '#f2e6c0'; g.beginPath(); g.ellipse(L.K[0] + 2, L.K[1] + 4, rl * 0.38, rl * 0.34, 0.2, 0, TAU); g.stroke(); g.setLineDash([]); }
  }
  if (lady) { // long skirt (1900s), sways a little
    const sw = Math.sin(TT * 0.5) * 5 * MV, short = mode !== 'stand', sb = short ? hipY + legL * 0.45 : ank - 12, fl = HPW * (short ? 1.35 : 1.55);
    const sk = [[cx - WW * 0.98, waistY + 8], [cx + WW * 0.98, waistY + 8], [cx + HPW * 1.08, hipY - 10], [cx + fl + sw, sb]];
    for (let k = 6; k >= 0; k--) sk.push([cx - fl + (2 * fl) * k / 6 + sw, sb + (k % 2 ? 7 : 0)]);
    sk.push([cx - fl + sw, sb], [cx - HPW * 1.08, hipY - 10]);
    const skP = polyPath(sk); cel(g, skP, o.pants || '#3b3f52', 3.6, fl * 0.32, 4, 6, twill(o.pants || '#3b3f52'));
    const fc = mixc(o.pants || '#3b3f52', INK, 0.5); for (const k of [-0.5, 0, 0.5]) taper(g, [[cx + k * HPW * 0.9, hipY + 10], [cx + k * fl * 0.96 + sw * 0.8, sb - 6]], 2, fc, 0.1);
  }
  for (const L of legs) { const s = L.s, fx = L.A[0] + s * 9, fy = L.fy + (mode === 'run' && L.Ls > 0.2 ? -4 : 0);
    const sp = smooth([[fx - s * 22, fy - 12], [fx + s * 6, fy - 17], [fx + s * 30, fy - 8], [fx + s * 37, fy + 5], [fx + s * 28, fy + 13], [fx - s * 4, fy + 14], [fx - s * 27, fy + 9], [fx - s * 28, fy - 2]], 6);
    cel(g, sp, o.shoes || '#3a2a2a', 3.4, 6, 5, 3);
    g.save(); g.clip(sp); g.fillStyle = '#1d1426'; g.fillRect(fx - 50, fy + 8, 100, 10); g.fillStyle = '#3a2418'; g.fillRect(fx - s * 30 - (s > 0 ? 0 : -0), fy + 6, s * 14, 10); g.restore(); line(g, [[fx - s * 16, fy + 6], [fx - s * 16, fy + 14]], 1.4); line(g, [[fx - s * 26, fy + 8], [fx + s * 31, fy + 8]], 1.6);
    taper(g, [[fx - s * 8, fy - 12], [fx + s * 12, fy - 9]], 3, 'rgba(255,255,255,0.55)', 0.4);
    if (runner) for (let k = 0; k < 2; k++) line(g, [[fx + s * (-2 + k * 8), fy - 15], [fx + s * (4 + k * 8), fy - 9]], 2, '#e8e4dc'); }
  // ---------- arms ----------
  const sh = (s) => [cx + s * (TW - 10), shY + 24];
  const add = (p, dx, dy) => [p[0] + dx, p[1] + dy];
  const hang = (s) => { const E = add(sh(s), s * 17, AL * 0.98); return [sh(s), E, add(E, s * 2, AL * 0.95)]; };
  const pose = (s) => {
    if (cheer) { const E = add(sh(s), s * AL * 0.55, -AL * 0.62); return [sh(s), E, add(E, s * AL * 0.12, -AL * 0.92)]; }
    if (s === 1 && wave !== undefined) { const E = add(sh(s), s * AL * 0.82, AL * 0.12); return [sh(s), E, add(E, s * (-10 + 22 * (wave || 0)), -AL * 0.95)]; }
    return hang(s);
  };
  const runArm = (s) => { const sw = mode === 'run' ? Math.sin(TAU * (ph + (s > 0 ? 0 : 0.5))) : 0; const E = add(sh(s), s * 26, AL * 0.88 - sw * 22); return [sh(s), E, add(E, -s * (10 + Math.max(0, sw) * 26), AL * 0.62 - sw * 46)]; };
  const SA = op.steer || 0, WC = [cx, shY + AL * 1.3], WR = 80 * Math.min(1.15, B.w), rimP = (s) => [WC[0] + Math.cos(SA) * s * (WR - 6) - Math.sin(SA) * -5, WC[1] + Math.sin(SA) * s * (WR - 6) * 0.4 + Math.cos(SA) * -5];
  const r = op.reach || 0;
  const armFor = (s) => op.drive ? [sh(s), add(sh(s), s * 30, AL * 0.82), rimP(s)]
    : mode === 'fall' ? (() => { const E = add(sh(s), s * AL * 0.72, -AL * 0.36); return [sh(s), E, add(E, s * AL * 0.4, -AL * 0.78)]; })()
    : (op.prop === 'stick' && s === 1) ? (() => { const E = add(sh(s), s * AL * 0.72, AL * 0.3); return [sh(s), E, add(E, s * 4, -AL * 0.88)]; })()
    : (HOLD[op.prop] && s === 1) ? (() => { const E = add(sh(s), s * AL * 0.5, AL * 0.78 - AL * 0.4 * r); return [sh(s), E, add(E, s * AL * (0.42 + 0.25 * r), -AL * (0.62 + 0.3 * r))]; })()
    : mode === 'run' ? runArm(s) : null;
  const arms = [-1, 1].map((s) => [s, armFor(s) || ((op.hip && s === -1) ? (() => { const E = add(sh(s), s * AL * 0.62, AL * 0.58); return [sh(s), E, [cx + s * (WW + 8), waistY + 6]]; })() : pose(s))]);
  const hand = (Hp, ang, s, grip) => { // mitten hand + thumb, one outline
    const hp = ellP(Hp[0], Hp[1], 12.5 * Math.sqrt(B.w) * (o.build === 'kid' ? 0.85 : 1), 11.5 * (o.build === 'kid' ? 0.85 : 1), ang);
    const tx = Hp[0] + Math.cos(ang) * -3 + Math.cos(ang + s * Math.PI / 2) * -10, ty = Hp[1] + Math.sin(ang) * -3 + Math.sin(ang + s * Math.PI / 2) * -10;
    ellP(tx, ty, 6.5, 4.6, ang - s * 0.7, hp); const glove = o.neck === 'scarf' && o.hat === 'cap'; cel(g, hp, glove ? '#8a5c36' : skin, 3, 4, 4, 2, null, glove ? SHADE : SHADE_SKIN);
    if (!grip) taper(g, [[Hp[0] + Math.cos(ang) * 4 + Math.cos(ang + Math.PI / 2) * 6, Hp[1] + Math.sin(ang) * 4 + Math.sin(ang + Math.PI / 2) * 6], [Hp[0] + Math.cos(ang) * 10, Hp[1] + Math.sin(ang) * 10]], 1.6, INK, 0.2); };
  const drawArm = ([s, P], grip = false) => { const [S, E, H] = P, ang = Math.atan2(H[1] - E[1], H[0] - E[0]), Wr = add(H, -Math.cos(ang) * 11, -Math.sin(ang) * 11);
    const pts = [S, lerp(S, E, 0.5), E, lerp(E, Wr, 0.5), Wr];
    const bendA = Math.abs(((Math.atan2(E[1] - S[1], E[0] - S[0]) - ang + 3 * Math.PI) % TAU) - Math.PI), bent = bendA < 2.5;
    if (shortSleeve) {
      cel(g, limb(pts, [ra * 1.05, ra, ra * 0.84, ra * 0.9, ra * 0.76]), skin, 3.2, 6, 5, 3, null, SHADE_SKIN);
      const sE = lerp(S, E, 0.6), slv = limb([S, sE], [ra * 1.5, ra * 1.32]); cel(g, slv, o.shirt, 3.4, 7, 5, 3, fabric());
      const sa = Math.atan2(sE[1] - S[1], sE[0] - S[0]), nx = -Math.sin(sa) * ra * 1.3, ny = Math.cos(sa) * ra * 1.3;
      if (o.trim) { g.save(); g.clip(slv); line(g, [[sE[0] + nx, sE[1] + ny], [sE[0] - nx, sE[1] - ny]], 9, o.trim); g.restore(); }
      if (bent) taper(g, [lerp(E, add(E, Math.cos(ang) * 8, Math.sin(ang) * 8), 0), add(E, -s * 5, 7)], 1.8, mixc(skin, INK, 0.5), 0.2);
    } else {
      const k = lady ? 1.1 : 1.1, slv = limb(pts, [ra * (lady ? 1.75 : 1.22) * k, ra * (lady ? 1.45 : 1.16) * k, ra * 0.98 * k, ra * 1.0 * k, ra * 0.92 * k]);
      cel(g, slv, o.shirt, 3.4, 7, 5, 3, fabric());
      const cuff = limb([lerp(E, Wr, 0.86), add(Wr, Math.cos(ang) * 4, Math.sin(ang) * 4)], [ra * 0.86, ra * 0.84]); cel(g, cuff, o.cuff || '#f6f3ea', 2.6, 3, 2, 0);
      const fc = mixc(o.shirt, INK, 0.45);
      if (bent) { const n = [Math.cos(ang + Math.PI / 2), Math.sin(ang + Math.PI / 2)]; taper(g, [add(E, n[0] * ra * 0.5 - Math.cos(ang) * 6, n[1] * ra * 0.5 - Math.sin(ang) * 6), add(E, n[0] * ra * 0.1, n[1] * ra * 0.1)], 2, fc, 0.2); taper(g, [add(E, -n[0] * ra * 0.7, -n[1] * ra * 0.7), add(E, -n[0] * ra * 0.2 + Math.cos(ang) * 10, -n[1] * ra * 0.2 + Math.sin(ang) * 10)], 1.8, fc, 0.2); }
      else taper(g, [lerp(S, E, 0.8), lerp(E, Wr, 0.25)], 1.8, fc, 0.2);
    }
    hand(H, ang, s, grip); };
  // ---------- torso ----------
  const wav = (k) => runner ? (2 + 4 * MV) * Math.sin(k * 1.3 + TT * 0.55) : 0;
  const side = (s) => { const pts = [[cx + s * (NW + 6), shY - 4], [cx + s * TW * 0.64, shY + 5], [cx + s * TW, shY + 26], [cx + s * TW * 0.98, shY + 70]];
    if (B.belly) pts.push([cx + s * WW * 1.06, waistY - 30], [cx + s * WW, waistY + 20]); else pts.push([cx + s * WW, waistY]);
    pts.push([cx + s * HPW * (jacket ? 1.06 : 0.98), hemY - 14], [cx + s * HPW * (jacket ? 1.04 : 0.96), hemY + wav(0)]); return pts; };
  const R = cr(side(1), false, 8), Lf = cr(side(-1), false, 8).reverse();
  const hem = []; for (let k = 1; k < 8; k++) { const x = cx + HPW * (1 - k / 4); hem.push([x, hemY + wav(k) - (jacket && Math.abs(x - cx) < 14 ? 18 - Math.abs(x - cx) : 0)]); }
  if (jacket) hem.splice(3, 1, [cx, hemY - 20]);
  const neck = arcPts(cx, shY - 4, NW + 6, Math.PI, 0, 8, runner || kidT || lady ? 18 : 10);
  const torsoP = polyPath([...R, ...hem, ...Lf, ...neck.slice(1, -1)]);
  const tpat = (h) => { fabric()(h);
    if (o.sash) { h.fillStyle = o.sash; h.beginPath(); h.moveTo(cx - TW * 0.86, shY - 6); h.lineTo(cx - TW * 0.5, shY - 6); h.lineTo(cx + WW * 1.1, hemY - 6); h.lineTo(cx + WW * 0.78, hemY + 12); h.closePath(); h.fill();
      h.strokeStyle = mixc(o.sash, INK, 0.35); h.lineWidth = 1.6; h.beginPath(); h.moveTo(cx - TW * 0.86, shY - 6); h.lineTo(cx + WW * 0.78, hemY + 12); h.moveTo(cx - TW * 0.5, shY - 6); h.lineTo(cx + WW * 1.1, hemY - 6); h.stroke(); }
    if (o.trim) { h.strokeStyle = o.trim; h.lineWidth = 9; h.beginPath(); neck.forEach(([x, y], i) => h[i ? 'lineTo' : 'moveTo'](x, y + 3)); h.stroke(); h.beginPath(); [[cx + HPW, hemY - 4], ...hem.map(([x, y]) => [x, y - 4]), [cx - HPW, hemY - 4]].forEach(([x, y], i) => h[i ? 'lineTo' : 'moveTo'](x, y)); h.stroke();
      h.strokeStyle = mixc(o.trim, INK, 0.4); h.lineWidth = 1.4; h.beginPath(); neck.forEach(([x, y], i) => h[i ? 'lineTo' : 'moveTo'](x, y + 7.5)); h.stroke(); }
    if (o.vest) { h.fillStyle = o.vest; h.beginPath(); h.moveTo(cx - TW * 1.2, shY); h.lineTo(cx - 20, shY + 40); h.lineTo(cx - 16, hipY + 40); h.lineTo(cx - TW * 1.3, hipY + 40); h.fill(); h.beginPath(); h.moveTo(cx + TW * 1.2, shY); h.lineTo(cx + 20, shY + 40); h.lineTo(cx + 16, hipY + 40); h.lineTo(cx + TW * 1.3, hipY + 40); h.fill(); }
  };
  cel(g, torsoP, o.shirt, 3.8, TW * 0.3, 6, 7, tpat);
  { // structure lines: side seams / waist pull folds, crisp
    const fc = mixc(o.shirt, INK, 0.45), sw = Math.sin(TT * 0.35) * MV * 6;
    for (const s of [-1, 1]) taper(g, [[cx + s * TW * 0.72, shY + 40], [cx + s * TW * 0.8, shY + torsoH * 0.32], [cx + s * WW * 0.82, waistY - 10]], 1.8, fc, 0.1);
    if (!jacket) { taper(g, [[cx - WW * 0.7 + sw, waistY - 6], [cx - WW * 0.2 + sw, waistY + 6]], 1.8, fc, 0.1); taper(g, [[cx + WW * 0.45 + sw, waistY + 2], [cx + WW * 0.8, waistY - 12]], 1.8, fc, 0.1); }
  }
  // jacket: shirt V, lapels, buttons, pocket flaps
  if (jacket) {
    const vB = shY + torsoH * 0.42; cel(g, polyPath([[cx - NW - 2, shY - 3], [cx + NW + 2, shY - 3], [cx, vB]]), o.collar || '#f4f1e8', 0, 6, 4, 0);
    for (const s of [-1, 1]) { const lp = polyPath([[cx + s * (NW + 3), shY - 5], [cx + s * TW * 0.5, shY + 28], [cx + s * TW * 0.36, shY + 40], [cx + s * TW * 0.46, shY + 56], [cx + s * 4, vB + 6], [cx + s * NW * 0.6, shY + 30]]);
      cel(g, lp, mixc(o.shirt, '#000000', 0.08), 2.6, s > 0 ? 5 : 0, 3, 0, fabric()); }
    if (o.neck !== 'scarf') { const wc = o.vest || mixc(o.shirt, o.build === 'stout' ? '#5a2a3a' : '#e8dcc0', 0.3), wv = polyPath([[cx - NW * 1.05, shY + torsoH * 0.22], [cx + NW * 1.05, shY + torsoH * 0.22], [cx + 4, vB + 4], [cx - 4, vB + 4]]); cel(g, wv, wc, 1.8, 4, 2, 0); for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(cx, shY + torsoH * 0.27 + i * 14, 2, 0, TAU); g.fillStyle = INK; g.fill(); } }
    for (let i = 0; i < 2; i++) cel(g, ellP(cx + 8, vB + 22 + i * 34, 4.5, 4.5), o.button || dk(o.shirt, 0.6), 2, 1, 1, 0);
    { const px = cx - TW * 0.62, py = shY + torsoH * 0.3; line(g, [[px - 14, py + 4], [px + 16, py + 2]], 2, mixc(o.shirt, INK, 0.55)); cel(g, polyPath([[px - 10, py + 3], [px - 4, py - 8], [px + 2, py + 2], [px + 8, py - 7], [px + 12, py + 2]]), '#f6f2e8', 1.8, 2, 1, 0); }
    if (o.build === 'stout' || o.hat === 'bowler') { const c0 = [cx + 6, vB + 28], c1 = [cx - WW * 0.62, vB + 16]; g.lineWidth = 2.6; g.strokeStyle = '#7a5a12'; g.beginPath(); g.moveTo(c0[0], c0[1]); g.quadraticCurveTo((c0[0] + c1[0]) / 2, vB + 52, c1[0], c1[1]); g.stroke(); g.setLineDash([2.5, 2.5]); g.lineWidth = 2; g.strokeStyle = '#f2cf5a'; g.stroke(); g.setLineDash([]); cel(g, ellP(c1[0] - 2, c1[1] + 6, 6, 6), '#e8b830', 1.8, 2, 2, 0); }
    if (o.hat === 'top' && o.build === 'stout') { const fx0 = cx + TW * 0.44, fy0 = shY + 42; const fp = new Path2D(); for (let k = 0; k < 5; k++) ellP(fx0 + Math.cos(k * 1.256) * 5, fy0 + Math.sin(k * 1.256) * 5, 4.5, 4.5, 0, fp); cel(g, fp, '#d03a44', 1.8, 2, 2, 0); g.beginPath(); g.arc(fx0, fy0, 2.4, 0, TAU); g.fillStyle = '#f2cf5a'; g.fill(); }
    for (const s of [-1, 1]) taper(g, [[cx + s * WW * 0.36, hipY - 4], [cx + s * WW * 0.9, hipY - 6]], 2.2, mixc(o.shirt, INK, 0.55), 0.2);
  }
  if (!jacket && !o.noButtons && !runner && !kidT) for (let i = 0; i < 3; i++) cel(g, ellP(cx, shY + 40 + i * 40, 4, 4), o.button || dk(o.shirt, 0.6), 2, 1, 1, 0);
  if (o.bib) { const bw = 68, bh = 52, bx = cx - bw / 2 + 4, byy = shY + torsoH * 0.34; const bp = new Path2D(); bp.roundRect(bx, byy, bw, bh, 4); cel(g, bp, '#fffdf6', 2.6, 6, 4, 0);
    g.fillStyle = INK; g.font = `bold ${bh * 0.72}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.bib, bx + bw / 2, byy + bh / 2 + 2);
    for (const [px, py] of [[bx + 5, byy + 5], [bx + bw - 5, byy + 5], [bx + 5, byy + bh - 5], [bx + bw - 5, byy + bh - 5]]) { g.beginPath(); g.arc(px, py, 2.2, 0, TAU); g.fillStyle = '#9aa0b4'; g.fill(); } }
  if (kidT) for (const s of [-1, 1]) { const st = polyPath([[cx + s * TW * 0.46, shY + 2], [cx + s * TW * 0.62, shY + 6], [cx + s * WW * 0.6, hemY], [cx + s * WW * 0.42, hemY]]); g.save(); g.clip(torsoP); cel(g, st, '#5a3a28', 1.6, 3, 0, 0); g.restore(); cel(g, ellP(cx + s * WW * 0.51, hemY - 10, 3.6, 3.6), '#d9b04a', 1.4, 1, 1, 0); }
  if (lady) { const wb = new Path2D(); wb.rect(cx - WW * 1.05, waistY + 4, WW * 2.1, 12); g.save(); g.clip(torsoP); cel(g, wb, mixc(o.pants || '#3b3f52', INK, 0.25), 0, 6, 0, 0); g.restore(); line(g, [[cx - WW, waistY + 16], [cx + WW, waistY + 16]], 1.6); }
  if (o.pocket) { const pp = new Path2D(); pp.roundRect(cx + TW * 0.3, shY + 58, 34, 28, 4); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(pp); g.fillStyle = o.pocket; g.fillRect(cx + TW * 0.3 + 6, shY + 50, 9, 11); }
  // neck (sits in shadow under the chin) + collars + neckwear
  { const np = polyPath([[cx - NW, hy + HH * 0.6], [cx + NW, hy + HH * 0.6], [cx + NW + 1, shY + 8], [cx, shY + (runner || kidT || lady ? 14 : 4)], [cx - NW - 1, shY + 8]]);
    g.lineWidth = 6; g.strokeStyle = INK; g.stroke(np); cel(g, np, skin, 0, 0, 0, 0); g.save(); g.clip(np); g.globalCompositeOperation = 'multiply'; g.fillStyle = SHADE_SKIN; g.fill(np); g.globalCompositeOperation = 'source-over'; g.restore();
    if (o.trim) { const nb = new Path2D(); neck.forEach(([x, y], i) => nb[i ? 'lineTo' : 'moveTo'](x, y)); g.lineWidth = 3.2; g.strokeStyle = INK; g.stroke(nb); } }
  if (jacket || lady) for (const s of [-1, 1]) cel(g, polyPath([[cx + s * 2, shY + 12], [cx + s * (NW + 8), shY - 6], [cx + s * (NW + 12), shY + 10], [cx + s * 12, shY + 26]]), o.collar || '#ffffff', 2.4, s > 0 ? 4 : 0, 2, 0);
  if (lady && o.neck !== 'bow') { cel(g, ellP(cx, shY + 14, 5.5, 6.5), '#e8b830', 1.8, 2, 2, 0); g.beginPath(); g.arc(cx, shY + 14, 2.4, 0, TAU); g.fillStyle = '#8c2a5a'; g.fill(); }
  const swing = Math.sin(TT * 0.45) * 0.18 * MV;
  g.save(); g.translate(cx, shY + 14); g.rotate(swing); g.translate(-cx, -(shY + 14));
  const ncol = o.neckCol || '#c0453a';
  if (o.neck === 'tie') { cel(g, polyPath([[cx - 7, shY + 14], [cx + 7, shY + 14], [cx + 13, shY + 104], [cx, shY + 120], [cx - 13, shY + 104]]), ncol, 2.6, 4, 3, 0); cel(g, polyPath([[cx - 9, shY + 4], [cx + 9, shY + 4], [cx + 7, shY + 18], [cx - 7, shY + 18]]), dk(ncol, 0.9), 2.4, 2, 2, 0); }
  if (o.neck === 'bow') { const bp = new Path2D(); for (const s of [-1, 1]) polyPath([[cx, shY + 10], [cx + s * 26, shY - 2], [cx + s * 28, shY + 24]], bp); cel(g, bp, ncol, 2.6, 4, 3, 0); cel(g, ellP(cx, shY + 11, 7, 8), dk(ncol, 0.85), 2.2, 2, 2, 0); }
  g.restore();
  if (o.neck === 'scarf') { const sc = o.neckCol || '#d9a441', fl = Math.sin(TT * 0.8) * 5 * MV;
    const tail = polyPath([[cx + 22, shY + 12], [cx + 44, shY + 12], [cx + 50 + fl, shY + 96], [cx + 26 + fl, shY + 94]]); cel(g, tail, sc, 3, 5, 3, 0);
    for (let k = 0; k < 4; k++) line(g, [[cx + 28 + k * 6 + fl, shY + 95], [cx + 28 + k * 6 + fl * 1.3, shY + 106]], 2.6, dk(sc, 0.8));
    cel(g, smooth([[cx - TW * 0.72, shY + 4], [cx - NW, shY - 14], [cx + NW, shY - 14], [cx + TW * 0.72, shY + 4], [cx + TW * 0.5, shY + 24], [cx, shY + 30], [cx - TW * 0.5, shY + 24]], 6), sc, 3.2, 8, 5, 3);
    taper(g, [[cx - TW * 0.4, shY + 8], [cx, shY + 16], [cx + TW * 0.4, shY + 8]], 1.8, dk(sc, 0.7), 0.1); }
  if (op.hip) drawArm(arms[0]);
  for (const a of arms) if (!op.drive && !(op.hip && a[0] === -1)) drawArm(a);
  if (op.drive) {
    line(g, [[WC[0] + 5, WC[1] + 22], [WC[0] + 24, WC[1] + 160]], 18, INK); line(g, [[WC[0] + 5, WC[1] + 22], [WC[0] + 24, WC[1] + 160]], 11, '#2a2630');
    const rim = new Path2D(); rim.ellipse(WC[0], WC[1], WR, WR * 0.4, SA * 0.4, 0, TAU);
    g.lineWidth = 20; g.strokeStyle = INK; g.stroke(rim); g.lineWidth = 13; g.strokeStyle = '#a87a42'; g.stroke(rim);
    g.save(); g.translate(-1.5, -2); g.lineWidth = 5; g.strokeStyle = '#d8aa6a'; g.stroke(rim); g.restore();
    for (let k = 0; k < 3; k++) { const an = SA + k * TAU / 3 + 0.5; line(g, [[WC[0], WC[1]], [WC[0] + Math.cos(an) * (WR - 8), WC[1] + Math.sin(an) * (WR - 8) * 0.4]], 6, '#2a2630'); }
    cel(g, ellP(WC[0], WC[1], 13, 9), '#e0b450', 2.6, 3, 2, 0);
    for (const a of arms) drawArm(a, true);
  }
  const PS = 0.74 * B.hs;
  if (HOLD[op.prop]) { const h = arms[1][1][2]; g.save(); g.translate(h[0] + 6, h[1] - 4); g.scale(PS, PS); HOLD[op.prop](g); g.restore(); hand(add(h, 3, 4), -Math.PI / 2, 1, true); }
  if (op.prop === 'stick') { const h = arms[1][1][2]; line(g, [[h[0] - 6, h[1] + 20], [h[0] + 52, h[1] - 96]], 12, INK); line(g, [[h[0] - 6, h[1] + 20], [h[0] + 52, h[1] - 96]], 6.5, '#8a5a34'); taper(g, [[h[0] + 10, h[1] - 10], [h[0] + 40, h[1] - 72]], 2, '#b07a4a', 0.3); hand(add(h, 3, 6), -Math.PI / 2, 1, true); }
  // ---------- head ----------
  g.save(); const tilt = (op.tilt ?? ((o.seed || 0) % 3 - 1) * 3) * Math.PI / 180; g.translate(cx, shY); g.rotate(tilt); g.translate(-cx, -shY);
  for (const s of [-1, 1]) { const ex = cx + s * HW * 0.95, ey0 = hy + HH * 0.1; cel(g, ellP(ex, ey0, 12 * fz, 18 * fz, s * 0.15), skin, 3, s > 0 ? 4 : 2, 3, 0, null, SHADE_SKIN);
    taper(g, arcPts(ex + s * 1, ey0 + 1, 6 * fz, s > 0 ? -1.6 : 4.7, s > 0 ? 1.4 : 1.7, 6, 10 * fz), 1.8, mixc(skin, INK, 0.45), 0.2);
    if (o.earring) { g.beginPath(); g.arc(ex, ey0 + 19 * fz, 5, 0, TAU); g.fillStyle = o.earring; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); } }
  cel(g, headP, skin, 3.8, HW * 0.16, HH * 0.1, 5, null, SHADE_SKIN);
  // jaw/cheek accent: tiny crisp ink tick on the shadow side
  taper(g, [[cx + HW * 0.62, hy + HH * 0.7], [cx + HW * 0.4, hy + HH * 0.86]], 1.6, mixc(skin, INK, 0.5), 0.1);
  // ---------- hair ----------
  const HS = HP.map(([x, y]) => [cx + (x - cx) * 1.06, hy + HH * 0.05 + (y - hy - HH * 0.05) * 1.09]);
  const capPts = (cut) => { const yc = hy + cut * HH, idx = HS.map((p, i) => [p, i]).filter(([p]) => p[1] <= yc); const right = idx.filter(([, i]) => i < HS.length / 2).map(([p]) => p), left = idx.filter(([, i]) => i >= HS.length / 2).map(([p]) => p); return [...left, ...right]; };
  const rel = (pts) => pts.map(([x, y]) => [cx + x * HW, hy + y * HH]);
  const sway = (k) => Math.sin(TT * 0.45 + k * 1.3) * 3 * MV;
  const hairPaint = (P, strands) => { cel(g, P, hc, 3.6, HW * 0.16, HH * 0.08, 7);
    g.save(); g.clip(P); for (const s of strands) taper(g, rel(s), 2, mixc(hc, INK, 0.4), 0.1);
    taper(g, rel([[-0.62, -0.62], [-0.3, -0.86], [0.05, -0.92]]), 5, lt(hc, 0.28), 0.2); g.restore(); };
  if (hairOn) {
    if (o.hair === 'short') { const fr = [[1.0, -0.22], [0.86, -0.46], [0.72, -0.36], [0.6, -0.56], [0.42, -0.44], [0.3, -0.64], [0.1, -0.5], [-0.04, -0.66], [-0.24, -0.52], [-0.38, -0.66], [-0.58, -0.5], [-0.74, -0.58], [-0.88, -0.4], [-1.0, -0.22]].map(([x, y], k) => [x + sway(k) / HW, y]);
      hairPaint(polyPath([...capPts(-0.22), ...cr(rel(fr), false, 3)]), [[[0.5, -0.9], [0.5, -0.62]], [[-0.1, -0.95], [-0.2, -0.66]], [[-0.6, -0.84], [-0.7, -0.6]]]); }
    if (o.hair === 'side') { const fr = [[1.02, -0.04], [0.9, -0.14], [0.8, -0.04], [0.72, -0.3], [0.5, -0.38], [0.36, -0.3], [0.2, -0.46], [-0.06, -0.58], [-0.26, -0.72], [-0.4, -0.8], [-0.54, -0.62], [-0.74, -0.56], [-0.9, -0.36], [-1.02, -0.14]].map(([x, y], k) => [x + sway(k) / HW, y]);
      hairPaint(polyPath([...capPts(-0.06), ...cr(rel(fr), false, 4)]), [[[-0.4, -0.98], [0.2, -0.75], [0.7, -0.4]], [[-0.1, -1.0], [0.4, -0.8], [0.85, -0.3]], [[-0.55, -0.92], [-0.75, -0.65]]]); }
    if (o.hair === 'spiky') { const pts = [], n = 9; const base = (a, k) => [cx + Math.cos(a) * HW * k, hy - HH * 0.05 + Math.sin(a) * HH * k * 1.02];
      pts.push(base(Math.PI * 1.02, 1.06)); for (let i = 0; i < n; i++) { const a0 = Math.PI * (1.02 + 0.96 * i / n), a1 = Math.PI * (1.02 + 0.96 * (i + 0.5) / n); pts.push(base(a0, 1.04)); const t = base(a1, 1.3 + 0.06 * Math.sin(i * 2.1)); pts.push([t[0] + sway(i) + (i - n / 2) * 2, t[1]]); }
      pts.push(base(Math.PI * 1.98, 1.04), base(Math.PI * 0.02, 1.06));
      const fr = [[1.0, -0.2], [0.8, -0.5], [0.66, -0.34], [0.46, -0.58], [0.3, -0.38], [0.1, -0.6], [-0.08, -0.4], [-0.28, -0.6], [-0.46, -0.4], [-0.64, -0.56], [-0.8, -0.38], [-1.0, -0.2]];
      hairPaint(polyPath([...pts, ...rel(fr)]), [[[0.3, -1.0], [0.4, -0.7]], [[-0.3, -1.0], [-0.36, -0.72]]]); }
    if (o.hair === 'curly') { const P = polyPath([...capPts(-0.3), ...cr(rel([[1.0, -0.3], [0.5, -0.56], [0, -0.62], [-0.5, -0.56], [-1.0, -0.3]]), false, 4)]);
      for (let i = 0; i <= 11; i++) { const a = Math.PI * (0.92 + 1.16 * i / 11); P.moveTo(cx + Math.cos(a) * HW * 1.04 + HW * 0.21, hy - HH * 0.02 + Math.sin(a) * HH * 1.06); P.arc(cx + Math.cos(a) * HW * 1.04, hy - HH * 0.02 + Math.sin(a) * HH * 1.06, HW * 0.21, 0, TAU); }
      for (let i = 0; i < 6; i++) { const x = cx - HW * 0.72 + i * HW * 0.29; P.moveTo(x + HW * 0.16, hy - HH * 0.5); P.arc(x, hy - HH * 0.5 + Math.abs(i - 2.5) * -3, HW * 0.16, 0, TAU); }
      hairPaint(P, []); g.save(); g.clip(P); for (let i = 0; i < 7; i++) { const x = cx - HW * 0.7 + i * HW * 0.23; taper(g, arcPts(x, hy - HH * 0.76, HW * 0.08, 0.3, 2.6, 6), 1.8, mixc(hc, INK, 0.4), 0.2); } g.restore(); }
    if (o.hair === 'bun' || o.hair === 'long') { const fr = [[1.02, -0.12], [0.82, -0.42], [0.52, -0.62], [0.2, -0.74], [0.03, -0.8], [0, -0.7], [-0.03, -0.8], [-0.2, -0.74], [-0.52, -0.62], [-0.82, -0.42], [-1.02, -0.12]];
      hairPaint(polyPath([...capPts(-0.12), ...cr(rel(fr), false, 4)]), [[[0.0, -1.0], [0.5, -0.8], [0.85, -0.4]], [[0.0, -1.0], [-0.5, -0.8], [-0.85, -0.4]]]);
      if (o.hair === 'long') for (const s of [-1, 1]) { const sw = sway(s + 2); cel(g, smooth([[cx + s * HW * 0.98, hy - HH * 0.3], [cx + s * HW * 1.1, hy + HH * 0.4], [cx + s * HW * 1.06 + sw, hy + HH * 1.25], [cx + s * HW * 0.9 + sw, hy + HH * 1.36], [cx + s * HW * 0.88, hy + HH * 0.5], [cx + s * HW * 0.84, hy - HH * 0.1]], 6), hc, 3.2, 6, 4, 3); } }
  }
  if (o.hair === 'bald') { const P = new Path2D(); for (const s of [-1, 1]) for (const [dx, dy, rr] of [[0.97, -0.12, 0.12], [1.0, 0.04, 0.1], [0.9, -0.26, 0.1], [0.84, -0.4, 0.08]]) { const x = cx + s * HW * dx, y = hy + HH * dy; P.moveTo(x + HW * rr, y); P.arc(x, y, HW * rr, 0, TAU); }
    g.save(); g.clip(headP); cel(g, P, hc, 3, 4, 3, 0); g.restore();
    if (!o.hat) taper(g, arcPts(cx - HW * 0.1, hy - HH * 0.2, HW * 0.62, Math.PI * 1.25, Math.PI * 1.45, 6, HH * 0.66), 4, lt(skin, 0.5), 0.2); }
  // hats
  if (o.hat === 'top') { const hk = o.hatCol || '#2a2630', bY = hy - HH * 0.74, cw = HW * 0.68, ch = 128 * fz;
    cel(g, polyPath([[cx - cw, bY + 4], [cx - cw * 0.92, bY - ch], [cx + cw * 0.92, bY - ch], [cx + cw, bY + 4]]), hk, 3.6, 12, 3, 4);
    const band = new Path2D(); band.rect(cx - cw, bY - 26 * fz, 2 * cw, 20 * fz); g.save(); g.clip(polyPath([[cx - cw, bY + 4], [cx - cw * 0.92, bY - ch], [cx + cw * 0.92, bY - ch], [cx + cw, bY + 4]])); cel(g, band, '#a8383a', 0, 6, 0, 0); g.restore();
    line(g, [[cx - cw * 0.99, bY - 26 * fz], [cx + cw * 0.99, bY - 26 * fz]], 1.8); line(g, [[cx - cw * 0.99, bY - 6 * fz], [cx + cw * 0.99, bY - 6 * fz]], 1.8);
    taper(g, [[cx - cw * 0.6, bY - ch + 10], [cx - cw * 0.66, bY - 34 * fz]], 4, 'rgba(255,255,255,0.25)', 0.3);
    const br = new Path2D(); br.moveTo(cx - HW * 1.12, bY + 4); br.quadraticCurveTo(cx - HW * 1.1, bY - 14 * fz, cx - HW * 0.9, bY - 4); br.quadraticCurveTo(cx, bY + 8, cx + HW * 0.9, bY - 4); br.quadraticCurveTo(cx + HW * 1.1, bY - 14 * fz, cx + HW * 1.12, bY + 4); br.quadraticCurveTo(cx, bY + 26 * fz, cx - HW * 1.12, bY + 4); br.closePath(); cel(g, br, hk, 3.4, 8, 3, 3); }
  if (o.hat === 'cap') { const hk = o.hatCol || '#5a4a3a', cut = -0.36;
    const dome = polyPath([...capPts(cut).map(([x, y]) => [cx + (x - cx) * 1.03, y - HH * 0.04]), ...cr(rel([[1.06, cut], [0.5, cut + 0.06], [0, cut + 0.08], [-0.5, cut + 0.06], [-1.06, cut]]), false, 4)]);
    cel(g, dome, hk, 3.6, HW * 0.14, HH * 0.08, 4, o.pattern === 'tweed' ? fabric() : null);
    const fc = mixc(hk, INK, 0.45); taper(g, [[cx, hy - HH * 1.1], [cx - HW * 0.1, hy + HH * (cut + 0.06)]], 2, fc, 0.1); taper(g, [[cx + HW * 0.1, hy - HH * 1.1], [cx + HW * 0.6, hy + HH * (cut + 0.02)]], 2, fc, 0.1); taper(g, [[cx - HW * 0.1, hy - HH * 1.1], [cx - HW * 0.68, hy + HH * (cut + 0.02)]], 2, fc, 0.1);
    cel(g, ellP(cx, hy - HH * 1.12, 7 * fz, 5 * fz), hk, 2.4, 2, 2, 0);
    const vis = new Path2D(); vis.moveTo(cx - HW * 0.86, hy + HH * (cut + 0.03)); vis.quadraticCurveTo(cx, hy + HH * (cut + 0.13), cx + HW * 0.86, hy + HH * (cut + 0.03)); vis.quadraticCurveTo(cx + HW * 0.7, hy + HH * (cut + 0.26), cx, hy + HH * (cut + 0.3)); vis.quadraticCurveTo(cx - HW * 0.7, hy + HH * (cut + 0.26), cx - HW * 0.86, hy + HH * (cut + 0.03)); vis.closePath();
    cel(g, vis, dk(hk, 0.82), 3.2, 6, 4, 3);
    if (o.neck === 'scarf') { const gy = hy + HH * (cut - 0.12); line(g, [[cx - HW * 0.98, gy + 4], [cx + HW * 0.98, gy + 4]], 7, INK); line(g, [[cx - HW * 0.96, gy + 4], [cx + HW * 0.96, gy + 4]], 4, '#6a4428');
      for (const s of [-1, 1]) { const gp = ellP(cx + s * HW * 0.3, gy, 17 * fz, 13 * fz); cel(g, gp, '#b08a4a', 3, 3, 2, 0); cel(g, ellP(cx + s * HW * 0.3, gy, 11 * fz, 8 * fz), '#9cc8e0', 1.6, 4, 3, 0); g.beginPath(); g.arc(cx + s * HW * 0.3 - 4 * fz, gy - 3 * fz, 2.6 * fz, 0, TAU); g.fillStyle = '#fff'; g.fill(); }
      line(g, [[cx - HW * 0.3 + 17 * fz, gy], [cx + HW * 0.3 - 17 * fz, gy]], 3.4, '#6a4428'); } }
  if (o.hat === 'bowler') { const hk = o.hatCol || '#2a2630', bY = hy - HH * 0.66;
    const dm = new Path2D(); dm.moveTo(cx - HW * 0.8, bY); dm.bezierCurveTo(cx - HW * 0.86, bY - 118 * fz, cx + HW * 0.86, bY - 118 * fz, cx + HW * 0.8, bY); dm.closePath(); cel(g, dm, hk, 3.6, 12, 6, 4);
    const band = new Path2D(); band.rect(cx - HW, bY - 16 * fz, HW * 2, 14 * fz); g.save(); g.clip(dm); g.fillStyle = mixc(hk, '#000000', 0.35); g.fill(band); g.restore();
    taper(g, arcPts(cx - HW * 0.1, bY - 20 * fz, HW * 0.55, Math.PI * 1.15, Math.PI * 1.4, 5, 50 * fz), 4, 'rgba(255,255,255,0.28)', 0.3);
    const br = new Path2D(); br.moveTo(cx - HW * 1.06, bY - 5 * fz); br.quadraticCurveTo(cx - HW * 0.9, bY + 3, cx - HW * 0.6, bY + 4); br.quadraticCurveTo(cx, bY + 10, cx + HW * 0.6, bY + 4); br.quadraticCurveTo(cx + HW * 0.9, bY + 3, cx + HW * 1.06, bY - 5 * fz); br.quadraticCurveTo(cx + HW * 1.0, bY + 16 * fz, cx, bY + 20 * fz); br.quadraticCurveTo(cx - HW * 1.0, bY + 16 * fz, cx - HW * 1.06, bY - 5 * fz); br.closePath(); cel(g, br, hk, 3.2, 6, 3, 3); }
  // ---------- face (local frame: head centre, unit = fz px) ----------
  const E = expr, red = '#e0303a', w = HW / fz;
  const exciteE = E === 'excited', angryE = E === 'angry', meanE = E === 'mean' || E === 'smug', sadE = E === 'sad', shockE = E === 'shock' || E === 'surprised';
  g.save(); g.clip(headP);
  if (sadE || E === 'shock') { g.strokeStyle = 'rgba(70,90,200,0.55)'; g.lineWidth = 3; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(cx + k * 22 * fz, hy - HH * 0.62); g.lineTo(cx + k * 22 * fz, hy - HH * 0.36); g.stroke(); } }
  g.restore();
  g.save(); g.translate(cx, hy); g.scale(fz, fz);
  const ey = 10;
  for (const s of [-1, 1]) {
    const ex = s * w * 0.38, lx = ex + look * 3.6;
    const closed = (blink >= 1 && E !== 'dazed') || E === 'happy' || E === 'laugh';
    if (E === 'pained') { g.lineJoin = 'round'; line(g, [[ex - s * 10, ey - 8], [ex + s * 7, ey], [ex - s * 10, ey + 8]], 4); }
    else if (E === 'dazed') { g.beginPath(); for (let a = 0; a < 15; a += 0.3) { const rr = a * 0.78; g.lineTo(ex + rr * Math.cos(a * s), ey + rr * Math.sin(a * s)); } g.lineWidth = 2.6; g.strokeStyle = INK; g.stroke(); }
    else if (closed) taper(g, [[ex - 11, ey + 3], [ex, ey - 6], [ex + 11, ey + 3]], 4.6, INK, 0.35);
    else {
      const ry = exciteE ? 15 : shockE ? 15 : 12.5, rx = exciteE ? 10 : shockE ? 10 : 8.4;
      if (shockE) { g.beginPath(); g.ellipse(lx, ey, rx + 4, ry + 3, 0, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.ellipse(lx, ey + 1, 5, 6.5, 0, 0, TAU); g.fillStyle = INK; g.fill(); }
      else { g.beginPath(); g.ellipse(lx, ey + (blink > 0 ? 4 : 0), rx, blink > 0 ? ry * 0.45 : ry, s * 0.05, 0, TAU); g.fillStyle = INK; g.fill(); }
      if (exciteE) { for (const [sx, sy, rr0] of [[-3, -5, 5.5], [3.5, 5, 2.6]]) { g.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? rr0 * 0.35 : rr0, an = k * Math.PI / 4; g.lineTo(lx + sx + rr * Math.cos(an), ey + sy + rr * Math.sin(an)); } g.closePath(); g.fillStyle = '#fff'; g.fill(); } }
      else if (!shockE && blink === 0) { g.beginPath(); g.arc(lx - 2.6, ey - 4.6, 2.8, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.save(); g.translate(lx - 2.6, ey - 4.6); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 5.8, 1.7, 0, 0, TAU); g.lineWidth = 1.1; g.strokeStyle = '#fff'; g.stroke(); g.restore(); g.beginPath(); g.arc(lx + 3, ey + 5, 1.2, 0, TAU); g.fill(); }
      const lid = (o1, i1) => { g.beginPath(); g.moveTo(ex + s * 13, ey - 20); g.lineTo(ex - s * 13, ey - 20); g.lineTo(ex - s * 13, ey + i1); g.lineTo(ex + s * 13, ey + o1); g.closePath(); g.fillStyle = skin; g.fill(); taper(g, [[ex + s * 12, ey + o1], [ex - s * 12, ey + i1]], 3.4, INK, 0.4); };
      if (angryE) lid(-9, 1); else if (sadE) lid(2, -8); else if (meanE) lid(-2, -1);
    }
    const bc = o.brow || (hairOn ? dk(hc, 0.8) : INK), by = ey - 25 - (exciteE || shockE ? 8 : 0) - (op.browPop ? 3 : 0);
    const bw = (o.build === 'stout' || o.moustache ? 7.6 : 6.6);
    if (angryE || (meanE && s < 0)) taper(g, [[ex - s * 4, by + 15], [ex + s * 5, by + 8], [ex + s * 15, by - 1]], bw, bc, 0.3);
    else if (meanE && s > 0) taper(g, [[ex - s * 11, by + 1], [ex, by - 10], [ex + s * 14, by - 3]], bw * 0.9, bc, 0.3);
    else if (sadE || E === 'worried' || E === 'nervous') taper(g, [[ex - s * 4, by - 7], [ex + s * 5, by - 2], [ex + s * 14, by + 7]], bw * 0.9, bc, 0.3);
    else if (shockE || exciteE) taper(g, [[ex - s * 12, by + 4], [ex - s * 2, by - 7], [ex + s * 12, by - 1]], bw * 0.85, bc, 0.3);
    else if (E === 'pained') taper(g, [[ex - s * 3, by + 8], [ex + s * 6, by - 2], [ex + s * 14, by + 4]], bw, bc, 0.3);
    else if (E === 'happy' || E === 'laugh' || E === 'grin') taper(g, [[ex - s * 11, by], [ex, by - 7], [ex + s * 12, by + 1]], bw * 0.85, bc, 0.3);
    else taper(g, [[ex - s * 11, by + 3], [ex, by - 4], [ex + s * 12, by + 3]], bw * 0.85, bc, 0.3);
    if (sadE) { g.beginPath(); g.moveTo(ex + s * 9, ey + 13); g.quadraticCurveTo(ex + s * 15, ey + 25, ex + s * 10, ey + 29); g.quadraticCurveTo(ex + s * 4, ey + 25, ex + s * 9, ey + 13); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 1.8; g.strokeStyle = INK; g.stroke(); }
  }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * w * 0.6, 36, exciteE ? 15 : 12.5, exciteE ? 8 : 6.6, 0, 0, TAU); g.fillStyle = angryE ? 'rgba(230,60,70,0.5)' : 'rgba(240,100,130,0.42)'; g.fill();
    if (E === 'happy' || E === 'laugh' || E === 'grin') for (let k = -1; k <= 1; k++) line(g, [[s * w * 0.6 + k * 6 - 2, 39], [s * w * 0.6 + k * 6 + 2, 33]], 1.4, 'rgba(200,60,90,0.7)'); }
  if (o.glasses) { for (const s of [-1, 1]) { g.beginPath(); g.arc(s * w * 0.38, ey, 19, 0, TAU); g.lineWidth = 2.8; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(s * w * 0.38 - 6, ey - 7, 11, Math.PI * 1.05, Math.PI * 1.45); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,0.85)'; g.stroke(); }
    taper(g, [[-w * 0.38 + 19, ey - 2], [0, ey - 5], [w * 0.38 - 19, ey - 2]], 2.6, INK, 0.8); for (const s of [-1, 1]) line(g, [[s * (w * 0.38 + 19), ey - 2], [s * w * 0.92, ey - 6]], 2.4); }
  const nose = o.nose || 'button';
  if (nose === 'long') taper(g, [[1, 12], [14, 30], [8, 36], [-3, 33]], 3, INK, 0.3);
  else if (nose === 'round') cel(g, ellP(2, 28, 12, 10), skin, 2.6, 3, 3, 0, null, SHADE_SKIN);
  else taper(g, arcPts(2, 26, 5, 0.15, Math.PI - 0.15, 6, 3.8), 2.8, INK, 0.3);
  if (o.moustache) { const mp = new Path2D(); for (const s of [-1, 1]) ellP(s * 13, 41, 15, 6.4, s * (angryE ? 0.5 : 0.25), mp); cel(g, mp, o.moustache, 2.4, 3, 2, 0); }
  const my = 50;
  const mouthPath = (mw, mh) => { const p = new Path2D(); p.moveTo(-mw, my - 5); p.quadraticCurveTo(0, my - 2, mw, my - 5); p.quadraticCurveTo(mw * 0.8, my + mh, 0, my + mh + 1); p.quadraticCurveTo(-mw * 0.8, my + mh, -mw, my - 5); p.closePath(); return p; };
  const openMouth = (mw, mh, teeth, tongue) => { const mp = mouthPath(mw, mh); g.fillStyle = '#5a1e30'; g.fill(mp); g.save(); g.clip(mp); if (teeth) { g.fillStyle = '#fff'; g.fillRect(-mw - 2, my - 10, 2 * mw + 4, 8.5); } if (tongue) { g.fillStyle = '#e86e78'; g.beginPath(); g.ellipse(0, my + mh, mw * 0.55, 7, 0, 0, TAU); g.fill(); } g.restore(); g.lineWidth = 2.8; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(mp);
    for (const s of [-1, 1]) taper(g, [[s * (mw - 1), my - 6], [s * (mw + 4), my - 9]], 2.4, INK, 0.3); };
  if (op.talk != null && E !== 'angry') { const k = op.talk; if (k < 0.08) taper(g, arcPts(0, my - 12, 11, Math.PI * 0.25, Math.PI * 0.75, 8), 3.4, INK, 0.3);
    else { const mw = 9 + 11 * k, mh = 3 + 15 * k; g.beginPath(); g.ellipse(0, my + 2, mw, mh, 0, 0, TAU); g.fillStyle = '#5a1e30'; g.fill(); g.save(); g.clip(); if (k > 0.3) { g.fillStyle = '#fff'; g.fillRect(-mw, my + 2 - mh, 2 * mw, mh * 0.35); } g.fillStyle = '#e86e78'; g.beginPath(); g.ellipse(0, my + 2 + mh * 0.75, mw * 0.6, mh * 0.5, 0, 0, TAU); g.fill(); g.restore(); g.beginPath(); g.ellipse(0, my + 2, mw, mh, 0, 0, TAU); g.lineWidth = 2.8; g.strokeStyle = INK; g.stroke(); } }
  else if (exciteE) openMouth(23, 22, true, true);
  else if (E === 'laugh') openMouth(21, 19, true, true);
  else if (E === 'grin') openMouth(20, 12, true, true);
  else if (angryE) { const p = new Path2D(); p.roundRect(-19, my - 4, 38, 19, 6); g.fillStyle = '#5a1e30'; g.fill(p); g.save(); g.clip(p); g.fillStyle = '#fff'; g.fillRect(-20, my - 5, 40, 6.5); g.fillRect(-20, my + 9, 40, 6.5); g.restore(); g.lineWidth = 2.8; g.strokeStyle = INK; g.stroke(p); line(g, [[-18, my + 5.5], [18, my + 5.5]], 1.2, '#5a1e30'); }
  else if (meanE) { taper(g, [[-13, my + 2], [3, my + 6], [15, my - 5]], 3.6, INK, 0.3); taper(g, [[13, my - 7], [17, my - 2]], 2.4, INK, 0.3); }
  else if (sadE) taper(g, [[-16, my + 7], [-8, my + 1], [0, my + 3], [8, my + 0], [15, my + 7]], 3.4, INK, 0.3);
  else if (shockE) { g.beginPath(); g.ellipse(0, my + 5, E === 'shock' ? 11 : 6, E === 'shock' ? 15 : 7, 0, 0, TAU); g.fillStyle = '#5a1e30'; g.fill(); g.lineWidth = 2.8; g.strokeStyle = INK; g.stroke(); if (E === 'shock') { g.save(); g.clip(); g.beginPath(); g.ellipse(0, my + 16, 7, 5, 0, 0, TAU); g.fillStyle = '#e86e78'; g.fill(); g.restore(); } }
  else if (E === 'whistle') { g.beginPath(); g.ellipse(3, my + 3, 4.6, 5, 0, 0, TAU); g.fillStyle = '#5a1e30'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = INK; g.stroke(); for (let k = 0; k < 3; k++) taper(g, [[12 + k * 3, my - 4 - k * 7], [20 + k * 4, my - 8 - k * 8]], 1.8, INK, 0.3); }
  else if (E === 'pained') { const p = new Path2D(); p.roundRect(-15, my - 1, 30, 11, 3.5); g.fillStyle = '#fff'; g.fill(p); g.lineWidth = 2.6; g.strokeStyle = INK; g.stroke(p); line(g, [[-15, my + 4.5], [15, my + 4.5]], 1.4); for (const x of [-6, 4]) line(g, [[x, my - 1], [x, my + 10]], 1.2); }
  else if (E === 'dazed') taper(g, [[-11, my + 2], [-4, my - 2], [3, my + 2], [10, my - 2]], 2.8, INK, 0.4);
  else if (E === 'worried' || E === 'nervous') taper(g, arcPts(0, my + 12, 10, Math.PI * 1.2, Math.PI * 1.8, 8), 3.2, INK, 0.3);
  else if (E === 'happy') taper(g, arcPts(0, my - 11, 17, Math.PI * 0.2, Math.PI * 0.8, 10), 4, INK, 0.3);
  else taper(g, arcPts(0, my - 9, 12, Math.PI * 0.22, Math.PI * 0.78, 10), 3.6, INK, 0.3);
  // emotion marks
  if (angryE) { const vx = w * 0.56, vy = -64; g.lineWidth = 3.2; g.strokeStyle = red; g.lineCap = 'round'; for (const [a1, a2, dx, dy] of [[0, 1.6, -5, -5], [1.6, 3.2, 5, -5], [3.2, 4.8, 5, 5], [4.8, 6.3, -5, 5]]) { g.beginPath(); g.arc(vx + dx, vy + dy, 4.5, a1, a2); g.stroke(); } }
  if (E === 'nervous' || E === 'shock' || E === 'worried') { const x = w * 0.8, y = -42; g.beginPath(); g.moveTo(x, y - 14); g.quadraticCurveTo(x + 10, y + 4, x, y + 8); g.quadraticCurveTo(x - 10, y + 4, x, y - 14); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(x - 2.5, y + 1, 2, 0, TAU); g.fillStyle = '#fff'; g.fill(); }
  if (exciteE) for (const [sx, sy, rr0] of [[-w - 14, -66, 10], [w + 10, -84, 8], [w + 20, -22, 6]]) { g.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? rr0 * 0.32 : rr0, an = k * Math.PI / 4; g.lineTo(sx + rr * Math.cos(an), sy + rr * Math.sin(an)); } g.closePath(); g.fillStyle = '#ffe14a'; g.fill(); g.lineWidth = 1.8; g.strokeStyle = INK; g.stroke(); }
  g.restore();
  g.restore();
}
