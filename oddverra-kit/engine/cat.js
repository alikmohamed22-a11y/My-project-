// [KITTY-cat] Oddverra spy cat ("Acoustic Kitty"), original design: a slightly scruffy grey tabby.
// drawCat(g, o, op) draws on a 600x1000 card in the same space as oddverra(): ground/soles at y≈965, centred on x=300.
// The cat is drawn in a local frame (x = forward, y = down, ground = 0, units = card px at scale 1) and stands ~1/3 of a
// human (sitting ear tips ≈ 245 px above the ground vs ≈ 715 px for an adult human card).
// Style matches oddverra_next.js: thin indigo ink outside the shape (heavier lower-right), two-tone purple-leaning cel
// shade, blue-violet rim light, bean eyes with the ringed-planet shine, blush.
//
// o:  { seed, fur, furDark, furLight }  (all optional)
// op: { pose: 'sit'|'walk'|'sleep'|'lick'|'stare'|'hungry'|'startled'|'yawn', phase (walk 0..1),
//       expr: 'smug'|'bored'|'surprised'|'happy'|'annoyed', gear (bool), blink 0..1, look -1..1, tail (sway phase),
//       t (time, frames), flip (bool: face left), blueprint (bool), scale (default 1), x (card x offset), bowl (bool) }
export const INK = '#2b1d4a';
const TAU = Math.PI * 2;
const hex = (c) => { const n = parseInt(c.slice(1, 7), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const toHex = (a) => '#' + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mixc = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v * (1 - t) + B[i] * t)); };
const inkFor = (base) => { try { return mixc(INK, toHex(hex(base).map((v) => v * 0.28)), 0.28); } catch (e) { return INK; } };
const SHADE = '#a796d8', RIMC = 'rgba(122,142,255,0.7)', RIMC2 = 'rgba(122,142,255,0.34)';
const BPW = 'rgba(236,244,255,0.95)', BPF = 'rgba(236,244,255,0.55)';

// ---------- geometry helpers (same maths as oddverra_next.js) ----------
function cr(pts, closed = false, seg = 8) {
  const n = pts.length, out = [], P = (i) => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  const m = closed ? n : n - 1;
  for (let i = 0; i < m; i++) { const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let k = 0; k < seg; k++) { const t = k / seg, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
function polyPath(pts, P = new Path2D()) {
  let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
  const Q = a < 0 ? pts.slice().reverse() : pts;
  Q.forEach(([x, y], i) => i ? P.lineTo(x, y) : P.moveTo(x, y)); P.closePath(); return P;
}
const smooth = (pts, seg = 8, P) => polyPath(cr(pts, true, seg), P);
function ellP(x, y, rx, ry, rot = 0, P = new Path2D()) { P.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot)); P.ellipse(x, y, rx, ry, rot, 0, TAU); return P; }
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const add = (p, dx, dy) => [p[0] + dx, p[1] + dy];
function limb(pts, rs, P = new Path2D()) {
  for (let i = 0; i < pts.length - 1; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], r1 = rs[i], r2 = rs[i + 1];
    const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a);
    polyPath([[x1 + nx * r1, y1 + ny * r1], [x2 + nx * r2, y2 + ny * r2], [x2 - nx * r2, y2 - ny * r2], [x1 - nx * r1, y1 - ny * r1]], P); }
  pts.forEach(([x, y], i) => { P.moveTo(x + rs[i], y); P.arc(x, y, rs[i], 0, TAU); });
  return P;
}
const arcPts = (x, y, r, a0, a1, n = 10, ry = r) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [x + Math.cos(a) * r, y + Math.sin(a) * ry]; });
const hsh = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
// two-bone IK: joint between A and B with segment lengths l1, l2; bend = +1/-1 picks the side
function ik(A, B, l1, l2, bend) {
  const dx = B[0] - A[0], dy = B[1] - A[1], d = Math.min(l1 + l2 - 0.01, Math.max(Math.abs(l1 - l2) + 0.01, Math.hypot(dx, dy)));
  const a = Math.atan2(dy, dx), c = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d));
  return [A[0] + Math.cos(a + bend * c) * l1, A[1] + Math.sin(a + bend * c) * l1];
}
// tapered tube (tail) along pts: width w0 at root -> w1 at tip, rounded tip; fz>0 makes it bristle (startled)
function tube(pts, w0, w1, fz = 0, seed = 0) {
  const S = cr(pts, false, 10), n = S.length, L = [], R = [];
  for (let i = 0; i < n; i++) { const a = S[Math.max(0, i - 1)], b = S[Math.min(n - 1, i + 1)]; let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const l = Math.hypot(nx, ny) || 1;
    const t = i / (n - 1), w = (w0 + (w1 - w0) * Math.pow(t, 0.8)) * (1 + (fz && i % 3 === 1 ? fz * (0.8 + 0.6 * hsh(i, seed)) : 0)) * (t < 0.08 && fz ? 0.8 : 1);
    L.push([S[i][0] + nx / l * w, S[i][1] + ny / l * w]); R.push([S[i][0] - nx / l * w, S[i][1] - ny / l * w]); }
  const P = polyPath([...L, ...R.reverse()]); const e = S[n - 1]; P.moveTo(e[0] + w1, e[1]); P.arc(e[0], e[1], w1, 0, TAU); return { P, S };
}
// spiky fur outline: alternate samples pushed outward from the centroid
function fuzz(pts, amp, every = 2, seed = 0, keep = null) {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return pts.map((p, i) => { if (i % every || (keep && !keep(p))) return p; const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1, k = amp * (0.6 + 0.8 * hsh(i, seed)); return [p[0] + dx / l * k, p[1] + dy / l * k]; });
}

// ---------- ink + paint (oddverra_next cel(), plus light-direction sign for flip and blueprint mode) ----------
let LX = 1, BP = false;
function cel(g, p, base, ow = 3.6, dx = 9, dy = 7, rim = 4, pat = null, shade = SHADE) {
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (BP) { // technical drawing: hidden-line removal by erasing, then a thin white contour
    const er = () => { g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.fill(p); g.globalCompositeOperation = 'source-over'; };
    er(); if (ow) { g.strokeStyle = BPW; g.lineWidth = ow >= 3.5 ? 4.6 : 3.2; g.stroke(p); er(); } // outer half-stroke only: no internal union seams
    g.fillStyle = 'rgba(160,200,255,0.10)'; g.fill(p); return; }
  dx *= LX;
  if (ow) { const w0 = ow >= 3.5 ? ow * 0.9 : ow * 0.72; g.strokeStyle = inkFor(base); g.save(); g.translate(w0 * 0.22 * LX, w0 * 0.3); g.lineWidth = w0 * 2.1; g.stroke(p); g.restore(); g.lineWidth = w0 * 2; g.stroke(p); }
  const paint = (sh, rimA) => { g.fillStyle = base; g.fill(p); if (pat) pat(g);
    if (sh) { g.globalCompositeOperation = 'multiply'; g.fillStyle = shade; g.fill(p); }
    if (rimA) { g.globalCompositeOperation = 'screen'; g.fillStyle = rimA; g.fill(p); }
    g.globalCompositeOperation = 'source-over'; };
  const clipAt = (x, y) => { g.translate(x, y); g.clip(p); g.translate(-x, -y); };
  g.save(); g.clip(p);
  if (!dx && !dy) { paint(false); g.restore(); return; }
  if (rim) { paint(true, RIMC); clipAt(-rim * 0.55 * LX, -rim * 0.2); paint(true, RIMC2); clipAt(-rim * 0.5 * LX, -rim * 0.2); }
  paint(true); clipAt(-dx, -dy); paint(false); g.restore();
}
function taper(g, pts, w, col = INK, e = 0.3) {
  if (BP) { if (col === null) return; col = BPF; w = Math.min(w, 1.8); }
  const S = pts.length > 2 ? cr(pts, false, 10) : Array.from({ length: 11 }, (_, i) => lerp(pts[0], pts[1], i / 10)), n = S.length, L = [], R = [];
  for (let i = 0; i < n; i++) { const a = S[Math.max(0, i - 1)], b = S[Math.min(n - 1, i + 1)]; let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const l = Math.hypot(nx, ny) || 1;
    const ww = w * 0.5 * (e + (1 - e) * Math.sin(Math.PI * i / (n - 1))); L.push([S[i][0] + nx / l * ww, S[i][1] + ny / l * ww]); R.push([S[i][0] - nx / l * ww, S[i][1] - ny / l * ww]); }
  g.beginPath(); L.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = n - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath(); g.fillStyle = col; g.fill();
  if (e > 0) for (const q of [S[0], S[n - 1]]) { g.beginPath(); g.arc(q[0], q[1], w * e * 0.5, 0, TAU); g.fill(); }
}
// fur detail strokes are skipped in blueprint (pass null colour via fur())
const fur = (col) => BP ? null : col;

// ---------- poses: every pose returns the skeleton in the local frame (facing +x, ground y=0) ----------
function walkLeg(ph, off, stride = 62, lift = 20) { // foot offset along x, lift above ground
  const u = ((ph + off) % 1 + 1) % 1;
  if (u < 0.62) return [stride * (0.5 - u / 0.62), 0];
  const v = (u - 0.62) / 0.38; return [stride * (-0.5 + v), -Math.sin(Math.PI * v) * lift];
}
function frontLeg(sh, foot, far) { const wr = add(foot, -2, -16), el = ik(sh, wr, 50, 46, -1);
  return { chain: [sh, lerp(sh, el, 0.5), el, wr], r: [17, 14, 11, 10], paw: [foot[0] + 6, foot[1] - 8, 15, 9.5, 0], far }; }
function hindLeg(hip, foot, far) { const hock = add(foot, -18, -30), kn = ik(hip, hock, 48, 44, 1);
  return { chain: [hip, kn, lerp(kn, hock, 0.5), hock, add(foot, -2, -10)], r: [26, 15, 11, 9.5, 9.5], paw: [foot[0] + 4, foot[1] - 8, 16, 9.5, 0], far }; }

function poseOf(op, T) {
  const pose = op.pose || 'sit', sway = op.tail ?? T * 0.05;
  const tailSway = (pts, amp = 0.22) => { const r = pts[0]; return pts.map((p, i) => { if (!i) return p; const a = Math.sin(sway * TAU + i * 0.7) * amp * i / pts.length + (i === pts.length - 1 ? Math.sin(T * 0.21) * 0.12 : 0), dx = p[0] - r[0], dy = p[1] - r[1]; return [r[0] + dx * Math.cos(a) - dy * Math.sin(a), r[1] + dx * Math.sin(a) + dy * Math.cos(a)]; }); };
  if (pose === 'walk') {
    const ph = op.phase || 0, bob = -2.5 * Math.cos(TAU * ph * 2), sh = [62, -98 + bob], hp = [-78, -94 - bob * 0.6];
    const F = (off) => add(walkLeg(ph, off), 0, 0);
    const lf = F(0.25), rf = F(0.75), lh = F(0), rh = F(0.5);
    const body = [[100, -118 + bob], [96, -84 + bob], [70, -58 + bob], [20, -50], [-40, -52], [-88, -58], [-112, -86], [-106, -116], [-66, -128], [-10, -124], [46, -134 + bob], [80, -142 + bob]];
    return { pose, body, back: [[60, -142 + bob], [10, -126], [-40, -128], [-82, -122], [-104, -108]],
      legs: [frontLeg(add(sh, -8, -4), [72 + lf[0], lf[1]], 1), hindLeg(add(hp, 8, -4), [-66 + lh[0], lh[1]], 1), hindLeg(hp, [-74 + rh[0], rh[1]], 0), frontLeg(sh, [64 + rf[0], rf[1]], 0)],
      tail: { pts: tailSway([[-104, -108], [-140, -122], [-158, -164], [-150, -206], [-128, -222]], 0.16), w0: 13, w1: 8 },
      head: { x: 124, y: -162 + bob * 1.4, rot: 0.04, yaw: 0.45 }, chest: [80, -96 + bob, 26, 34, 0.3], belly: [0, -50, 70, 16, 0], ruff: [96, -112 + bob, 0.6] };
  }
  if (pose === 'startled') {
    const j = Math.sin(T * 2.3) * 1.2;
    const body = [[88, -112], [70, -150], [30, -184], [-20, -190], [-64, -168], [-92, -128], [-84, -96], [-56, -98], [-10, -124], [30, -118], [70, -96]];
    return { pose, body, fz: 9, back: [[56, -160], [10, -186], [-36, -184], [-72, -156], [-88, -124]],
      legs: [{ chain: [[46, -112], [52, -60], [56, -12]], r: [15, 11, 9.5], paw: [61, -8, 14, 8, 0], far: 1 }, { chain: [[-60, -116], [-66, -60], [-60, -12]], r: [20, 12, 9.5], paw: [-55, -8, 14, 8, 0], far: 1 },
        { chain: [[-50, -112], [-52, -60], [-44, -12]], r: [22, 13, 10], paw: [-38, -8, 15, 9, 0], far: 0 }, { chain: [[56, -108], [64, -60], [70, -12]], r: [16, 12, 10], paw: [76, -8, 15, 9, 0], far: 0 }],
      tail: { pts: tailSway([[-88, -124], [-106, -160], [-104, -210], [-90, -246]], 0.05), w0: 17, w1: 12, fz: 0.9 },
      head: { x: 104 + j, y: -128, rot: 0.08, yaw: 0.6 }, chest: [80, -106, 18, 22, 0.3], belly: [10, -118, 50, 10, -0.2], ruff: [86, -96, 0.4] };
  }
  if (pose === 'sleep') {
    const br = 1 + 0.025 * Math.sin(T * 0.12);
    const body = [[96, -56 * br], [70, -98 * br], [10, -110 * br], [-60, -102 * br], [-112, -66 * br], [-114, -24], [-80, -2], [0, 0], [70, -4], [100, -24]];
    return { pose, body, back: [[30, -106 * br], [-20, -110 * br], [-70, -98 * br], [-106, -70 * br], [-112, -36]], legs: [],
      tail: { pts: tailSway([[-110, -26], [-92, -6], [-30, 2], [40, 0], [84, -10]], 0.03), w0: 13, w1: 9, front: 1 },
      head: { x: 70, y: -64 * br, rot: 0.32, yaw: 0.15, s: 0.95 }, paws: [[96, -10, 16, 9, -0.1]], belly: null, chest: null };
  }
  // sitting family: sit, stare, lick, hungry, yawn
  const lean = pose === 'hungry' ? 1 : 0, lick = pose === 'lick';
  const body = [[8, -160 + lean * 26], [-30, -140], [-62, -100], [-80, -48], [-74, -12], [-46, 0], [30, 0], [44, -30 + lean * 6], [50 + lean * 20, -92 + lean * 22], [42 + lean * 26, -138 + lean * 24]];
  const legs = [
    lick ? { chain: [[24, -104], [44, -132], [52, -154]], r: [14, 11, 10], paw: [48, -160, 14, 10, -1.2], far: 1, raised: 1 } : { chain: [[22 + lean * 16, -100 + lean * 18], [22 + lean * 24, -50], [24 + lean * 30, -10]], r: [14, 11.5, 10], paw: [30 + lean * 30, -8, 14, 9, 0], far: 1 },
    { chain: [[38 + lean * 18, -98 + lean * 18], [40 + lean * 26, -50], [42 + lean * 34, -10]], r: [15, 12, 10.5], paw: [48 + lean * 34, -8, 15, 9.5, 0], far: 0 }];
  const head = pose === 'yawn' ? { x: 18, y: -186, rot: -0.28, yaw: 0.3 } : lick ? { x: 22, y: -182, rot: 0.24, yaw: 0.45 } : pose === 'hungry' ? { x: 82, y: -146, rot: 0.32, yaw: 0.5 } : pose === 'stare' ? { x: 22, y: -184, rot: 0, yaw: 0.04 } : { x: 24, y: -182, rot: -0.03, yaw: 0.3 };
  return { pose, body, back: [[-14, -150 + lean * 22], [-48, -124], [-72, -80], [-80, -40]], haunch: [-30, -40, 52, 44, -0.2], foot: [12, -8, 22, 9, 0], legs,
    tail: { pts: tailSway([[-72, -16], [-110, -10], [-138, -34], [-140, -74], [-122, -98]], 0.14), w0: 12, w1: 8 },
    head, chest: [40 + lean * 20, -110 + lean * 20, 22, 38, 0.15], belly: null, ruff: [44 + lean * 28, -134 + lean * 22, 0.2], bowl: pose === 'hungry' || op.bowl ? [150, 0] : null };
}

// ---------- head (local head frame: centre 0,0, ~120 px wide) ----------
const HEAD = [[0, -48], [8, -49], [13, -55], [18, -48], [32, -46], [48, -36], [57, -18], [60, -2], [68, 6], [59, 10], [66, 19], [52, 24], [40, 36], [22, 45], [0, 48]];
function drawHead(g, C, H, op, gear) {
  const { expr, yaw, look, blink, mouth, eyes, earL, earR, T } = H, fx = yaw * 14, fur0 = C.fur;
  const side = (s) => 1 - s * yaw * 0.12; // far side (+x) compresses
  const outline = (() => { const R = HEAD.map(([x, y]) => [x * side(1) + fx * 0.3, y]); const L = HEAD.slice(1, -1).reverse().map(([x, y]) => [-x * side(-1) + fx * 0.3, y]); return cr([...R, ...L], true, 6); })();
  const hp = polyPath(outline);
  // ears (behind the head): right ear carries a notch, left ear the microphone
  const earP = (s, rot, notch, k = 1) => {
    const base = [s * 34 + fx * 0.4, -38], pts = [[s * 10, -44], [s * 30, -74], [s * 42, -96], [s * 50, -72], ...(notch ? [[s * 52, -64], [s * 42, -58], [s * 54, -50]] : []), [s * 58, -24], [s * 34, -34]]
      .map(([x, y]) => [x + fx * 0.4, y]).map((p) => lerp(base, p, k));
    const c = Math.cos(rot * s), sn = Math.sin(rot * s);
    return pts.map(([x, y]) => [base[0] + (x - base[0]) * c - (y - base[1]) * sn, base[1] + (x - base[0]) * sn + (y - base[1]) * c]);
  };
  for (const s of [-1, 1]) { const rot = s < 0 ? earL : earR, notch = s > 0;
    const ep = polyPath(cr(earP(s, rot, notch), true, notch ? 4 : 6)); cel(g, ep, fur0, 3.4, 6, 5, 3);
    if (!BP) { const ip = smooth(earP(s, rot, false, 0.62).slice(0, -1), 6); g.save(); g.clip(ep); cel(g, ip, C.ear, 0, 3, 3, 0); g.restore();
      const E = earP(s, rot, false, 0.5); taper(g, [E[0], lerp(E[0], E[2], 0.7)], 1.6, 'rgba(250,246,255,0.9)', 0.2); taper(g, [lerp(E[0], E[E.length - 1], 0.5), lerp(E[0], E[2], 0.9)], 1.4, 'rgba(250,246,255,0.8)', 0.2); }
  }
  // tabby markings painted under the head shading
  const marks = (h) => { const mc = C.stripe;
    for (const k of [-1, 0, 1]) taper(h, [[fx * 0.6 + k * 10, -50], [fx * 0.6 + k * 9, -40], [fx * 0.6 + k * 8 * 0.7, -29]], 6.5 - Math.abs(k), mc, 0.2);
    for (const s of [-1, 1]) { const q = side(s); taper(h, [[s * 30 * q + fx, -14], [s * 46 * q + fx * 0.5, -10], [s * 58 * q, -4]], 5.5, mc, 0.15); taper(h, [[s * 40 * q + fx * 0.6, 10], [s * 52 * q, 14], [s * 62 * q, 18]], 4.5, mc, 0.15); taper(h, [[s * 36 * q, -36], [s * 48 * q, -26]], 4.5, mc, 0.2); }
    h.fillStyle = C.light; h.beginPath(); h.ellipse(fx * 1.05, 26, 26, 19, 0, 0, TAU); h.fill(); };
  cel(g, hp, fur0, 3.8, 12, 9, 5, BP ? null : marks);
  // stray crown hairs (scruff)
  taper(g, [[fx * 0.3 - 4, -47], [fx * 0.3 - 9, -58], [fx * 0.3 - 4, -62]], 2, fur(inkFor(fur0)), 0.2);
  taper(g, [[-50 + fx * 0.2, -26], [-60, -32]], 1.8, fur(inkFor(fur0)), 0.2);
  // ---- face ----
  const ey = -4;
  for (const s of [-1, 1]) {
    const q = side(s), ex = s * 22 * q + fx, lx = ex + look * 3.5, rx = 7.6 * q, ry = 11;
    const closed = eyes === 'closed' || blink >= 1, squeeze = eyes === 'squeeze';
    if (squeeze) taper(g, [[ex - s * 8, ey - 8], [ex + s * 5, ey], [ex - s * 8, ey + 6]], 3.6, INK, 0.3);
    else if (closed) taper(g, eyes === 'closed' && expr !== 'bored' ? [[ex - 9, ey + 3], [ex, ey - 5], [ex + 9, ey + 3]] : [[ex - 9, ey + 2], [ex, ey + 5], [ex + 9, ey + 2]], 3.8, INK, 0.35);
    else if (eyes === 'wide') {
      if (BP) { g.beginPath(); g.ellipse(lx, ey, rx + 4, ry + 3, 0, 0, TAU); g.strokeStyle = BPW; g.lineWidth = 1.6; g.stroke(); }
      else { g.beginPath(); g.ellipse(lx, ey, rx + 4, ry + 3, 0, 0, TAU); g.fillStyle = '#fffaf2'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.ellipse(lx + look * 2, ey + 1, 3.6, 5.4, 0, 0, TAU); g.fillStyle = INK; g.fill(); }
    } else {
      const lidT = Math.max(blink, eyes === 'half' ? 0.45 : 0);
      g.beginPath(); g.ellipse(lx, ey, rx, ry, s * 0.05, 0, TAU);
      if (BP) { g.strokeStyle = BPW; g.lineWidth = 1.6; g.stroke(); }
      else { g.fillStyle = INK; g.fill();
        if (lidT < 0.6) { g.beginPath(); g.arc(lx - 2.4, ey - 4.2, 2.6, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.save(); g.translate(lx - 2.4, ey - 4.2); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 5.4, 1.6, 0, 0, TAU); g.lineWidth = 1.05; g.strokeStyle = '#fff'; g.stroke(); g.restore(); g.beginPath(); g.arc(lx + 2.8, ey + 4.6, 1.1, 0, TAU); g.fill(); } }
      // lids: flat (bored/half/blink), slanted smug, inward-down annoyed
      let o1 = null, i1 = null;
      if (expr === 'annoyed') { o1 = ey - 9; i1 = ey - 1; }
      if (expr === 'smug' || eyes === 'half') { o1 = ey - 1 - (expr === 'smug' ? 3 : 0); i1 = ey - 1 + (expr === 'smug' ? 2 : 0); }
      if (expr === 'bored') { o1 = ey - 1; i1 = ey - 1; }
      if (blink > 0 && blink < 1) { const by = ey - ry + 2 * ry * blink; o1 = Math.max(o1 ?? -99, by); i1 = Math.max(i1 ?? -99, by); }
      if (o1 !== null && !BP) { g.beginPath(); g.moveTo(ex + s * 12, ey - 16); g.lineTo(ex - s * 12, ey - 16); g.lineTo(ex - s * 12, i1); g.lineTo(ex + s * 12, o1); g.closePath(); g.fillStyle = fur0; g.fill(); taper(g, [[ex + s * 11, o1], [ex - s * 11, i1]], 3, INK, 0.4); }
    }
    if (expr === 'surprised' || eyes === 'wide') taper(g, [[ex - s * 8, ey - 20], [ex + s * 2, ey - 24], [ex + s * 10, ey - 21]], 2.4, fur(inkFor(fur0)), 0.3);
  }
  // whisker pads, nose, mouth
  if (!BP) for (const s of [-1, 1]) { g.beginPath(); g.ellipse(fx + s * 8, 20, 9.5, 7, s * 0.15, 0, TAU); g.fillStyle = C.light; g.fill(); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(fx + s * 30 * side(s), 12, 8.5, 4.6, 0, 0, TAU); g.fillStyle = BP ? 'rgba(0,0,0,0)' : expr === 'annoyed' ? 'rgba(230,80,90,0.45)' : 'rgba(240,100,130,0.42)'; g.fill(); }
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const y0 = 18 + k * 4.5, bend = s < 0 && k === 1 ? 7 : 0, len = 26 + k * 3 - (s > 0 ? yaw * 8 : 0);
    taper(g, [[fx + s * 13, y0], [fx + s * (13 + len * 0.55), y0 - 3 + k * 2 + bend * 0.3], [fx + s * (13 + len), y0 - 2 + k * 5 + bend]], 1.3, fur('rgba(43,29,74,0.75)'), 0.2); }
  const nose = new Path2D(); nose.moveTo(fx - 6.5, 9); nose.quadraticCurveTo(fx, 7, fx + 6.5, 9); nose.quadraticCurveTo(fx + 2, 15.5, fx, 15.5); nose.quadraticCurveTo(fx - 2, 15.5, fx - 6.5, 9); nose.closePath();
  cel(g, nose, C.nose, 1.6, 1.5, 1.5, 0); if (!BP) { g.beginPath(); g.ellipse(fx - 2, 10, 2, 1.1, 0, 0, TAU); g.fillStyle = 'rgba(255,240,245,0.85)'; g.fill(); }
  const my = 19, M = mouth;
  const W = (lft = 1, rgt = 1) => { taper(g, [[fx, 15], [fx, my]], 2, INK, 0.5); if (lft) taper(g, [[fx, my], [fx - 5, my + 4 * lft], [fx - 10, my + 1 * lft]], 2.4, INK, 0.3); if (rgt) taper(g, [[fx, my], [fx + 5, my + 4 * rgt], [fx + 10, my + 1 * rgt]], 2.4, INK, 0.3); };
  const hole = (path, teeth, tongue) => { if (BP) { g.strokeStyle = BPW; g.lineWidth = 1.5; g.stroke(path); return; } g.fillStyle = '#5a1e30'; g.fill(path); g.save(); g.clip(path);
    if (tongue) { g.fillStyle = '#e86e78'; g.beginPath(); g.ellipse(tongue[0], tongue[1], tongue[2], tongue[3], 0, 0, TAU); g.fill(); }
    if (teeth) { g.fillStyle = '#fffaf2'; for (const [x, y, h] of teeth) { g.beginPath(); g.moveTo(x - 2.6, y); g.lineTo(x + 2.6, y); g.lineTo(x, y + h); g.closePath(); g.fill(); } } g.restore(); g.lineWidth = 2.2; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(path); };
  if (M === 'smirk') { taper(g, [[fx, 15], [fx, my]], 2, INK, 0.5); taper(g, [[fx, my], [fx - 5, my + 2.5], [fx - 10, my + 1.5]], 2.2, INK, 0.3); taper(g, [[fx, my], [fx + 6, my + 3.5], [fx + 12, my - 2], [fx + 14, my - 5]], 2.6, INK, 0.3); }
  else if (M === 'flat') { taper(g, [[fx, 15], [fx, my]], 2, INK, 0.5); taper(g, [[fx - 8, my + 2], [fx, my], [fx + 8, my + 2]], 2.2, INK, 0.3); }
  else if (M === 'frown') { taper(g, [[fx, 15], [fx, my]], 2, INK, 0.5); taper(g, [[fx - 10, my + 5], [fx - 5, my + 1], [fx, my]], 2.4, INK, 0.3); taper(g, [[fx, my], [fx + 5, my + 1], [fx + 10, my + 5]], 2.4, INK, 0.3); }
  else if (M === 'o') { const p = ellP(fx, my + 6, 4.6, 5.6); taper(g, [[fx, 15], [fx, my]], 2, INK, 0.5); hole(p, null, [fx, my + 10, 3, 2.5]); }
  else if (M === 'open') { const p = new Path2D(); p.moveTo(fx - 10, my); p.quadraticCurveTo(fx - 5, my + 4, fx, my); p.quadraticCurveTo(fx + 5, my + 4, fx + 10, my); p.quadraticCurveTo(fx + 8, my + 13, fx, my + 14); p.quadraticCurveTo(fx - 8, my + 13, fx - 10, my); p.closePath(); taper(g, [[fx, 15], [fx, my]], 2, INK, 0.5); hole(p, null, [fx, my + 13, 6.5, 5]); }
  else if (M === 'hiss') { const p = new Path2D(); p.moveTo(fx - 14, my + 1); p.quadraticCurveTo(fx, my - 4, fx + 14, my + 1); p.quadraticCurveTo(fx + 11, my + 17, fx, my + 18); p.quadraticCurveTo(fx - 11, my + 17, fx - 14, my + 1); p.closePath(); hole(p, [[fx - 9, my, 6], [fx + 9, my, 6]], [fx, my + 17, 7, 5]); }
  else if (M === 'yawn') { const p = new Path2D(); p.moveTo(fx - 15, my); p.quadraticCurveTo(fx, my - 6, fx + 15, my); p.quadraticCurveTo(fx + 15, my + 30, fx, my + 32); p.quadraticCurveTo(fx - 15, my + 30, fx - 15, my); p.closePath(); hole(p, [[fx - 10, my - 1, 7], [fx + 10, my - 1, 7], [fx - 9, my + 28, -5], [fx + 9, my + 28, -5]], [fx, my + 28, 9, 7]); }
  else if (M === 'lick') { W(1, 1); if (!BP) { const tp = ellP(fx + 3, my + 7, 5, 6.5, 0.2); cel(g, tp, '#e86e78', 1.6, 1.5, 1.5, 0); taper(g, [[fx + 3, my + 4], [fx + 3.5, my + 10]], 1.1, '#b8404e', 0.3); } }
  else W(1, 1);
  if (expr === 'annoyed' && !BP) { const vx = -30 + fx, vy = -34; g.lineWidth = 2.6; g.strokeStyle = '#e0303a'; for (const [a1, a2, dx, dy] of [[0, 1.6, -4, -4], [1.6, 3.2, 4, -4], [3.2, 4.8, 4, 4], [4.8, 6.3, -4, 4]]) { g.beginPath(); g.arc(vx + dx, vy + dy, 3.6, a1, a2); g.stroke(); } }
  // spy gear on the head: microphone capsule in the near (left) ear + hair-thin lead to the skull base
  if (gear) { const ec = earP(-1, earL, false, 0.42)[0], ep = [ec[0] - 8, ec[1] + 2];
    const wire = [ep, [-50, -28], [-60, -6], [-60, 18], [-54, 36]];
    taper(g, wire, BP ? 1.6 : 2.4, BP ? BPW : '#2b2235', 0.6); if (!BP) taper(g, wire, 0.9, 'rgba(200,208,228,0.7)', 0.6);
    cel(g, ellP(ep[0], ep[1], 5, 4, -0.5), '#c9ced8', 1.8, 1.2, 1.2, 0); if (!BP) { g.beginPath(); g.arc(ep[0] - 1.4, ep[1] - 1.2, 1.3, 0, TAU); g.fillStyle = '#fff'; g.fill(); }
    H.mic = ep; }
}

// ---------- main entry ----------
export function drawCat(g, o = {}, op = {}) {
  const T = op.t || 0, seed = o.seed || 0, flip = op.flip ? -1 : 1, S = op.scale || 1, gear = !!op.gear || !!op.blueprint;
  BP = !!op.blueprint; LX = flip;
  const base = o.fur || '#9d9aa6';
  const C = { fur: base, dark: o.furDark || mixc(base, '#5c567a', 0.42), stripe: o.stripe || mixc(base, '#3b3352', 0.5), light: o.furLight || '#ece7ef', ear: '#dba7c4', nose: '#df8a9e', far: mixc(base, '#7a6fa6', 0.3) };
  const P = poseOf(op, T), pose = P.pose;
  const dflt = { sit: 'bored', walk: 'smug', sleep: 'happy', lick: 'happy', stare: 'smug', hungry: 'surprised', startled: 'surprised', yawn: 'bored' }[pose] || 'bored';
  const expr = op.expr || dflt;
  // face state from pose + expression
  let eyes = { smug: 'half', bored: 'half', surprised: 'wide', happy: 'closed', annoyed: 'open' }[expr] || 'open';
  let mouth = { smug: 'smirk', bored: 'flat', surprised: 'o', happy: 'open', annoyed: 'frown' }[expr] || 'w';
  if (pose === 'sleep') { eyes = 'closed'; mouth = 'w'; }
  if (pose === 'lick') { eyes = 'closed'; mouth = 'lick'; }
  if (pose === 'yawn') { eyes = 'squeeze'; mouth = 'yawn'; }
  if (pose === 'startled') { mouth = expr === 'surprised' ? 'hiss' : mouth; if (eyes === 'closed') eyes = 'wide'; }
  if (pose === 'hungry' && expr === 'happy') { eyes = 'open'; mouth = 'lick'; }
  const twitch = Math.pow(Math.max(0, Math.sin(T * 0.23 + seed)), 24) * 0.35;
  const earBase = expr === 'annoyed' ? 0.55 : pose === 'startled' ? 0.75 : pose === 'yawn' ? 0.25 : pose === 'sleep' ? 0.2 : expr === 'bored' ? 0.12 : expr === 'surprised' ? -0.06 : 0;
  const H = { ...P.head, expr, eyes, mouth, look: op.look || 0, blink: op.blink || 0, earL: earBase, earR: earBase + twitch, T };
  if (pose === 'hungry' && op.look == null) H.look = 0.6;

  g.save(); g.translate(300 + (op.x || 0), 965); g.scale(S * flip, S);
  g.lineJoin = 'round'; g.lineCap = 'round';
  // contact shadow (in-world the card gets a blob; this is a tiny painted one under the paws)
  if (!BP && op.shadow !== false) { g.beginPath(); g.ellipse(-10, 2, pose === 'walk' ? 130 : 105, 9, 0, 0, TAU); g.fillStyle = 'rgba(43,29,74,0.16)'; g.fill(); }
  // bowl (behind the near paws for hungry)
  const drawBowl = (bx, by) => { const bw = new Path2D(); bw.moveTo(bx - 40, by - 26); bw.lineTo(bx + 40, by - 26); bw.quadraticCurveTo(bx + 34, by, bx + 26, by); bw.lineTo(bx - 26, by); bw.quadraticCurveTo(bx - 34, by, bx - 40, by - 26); bw.closePath();
    cel(g, bw, '#ece4cf', 3.4, 8, 5, 3); cel(g, ellP(bx, by - 26, 40, 8), '#f7f2e4', 2.6, 0, 0, 0); if (!BP) { cel(g, ellP(bx, by - 25, 31, 5.4), '#d8cfba', 0, 4, 2, 0); g.save(); g.clip(bw); g.fillStyle = '#3d6bb0'; g.fillRect(bx - 50, by - 21, 100, 4.5); g.restore(); for (const [dx, dy] of [[-8, -25], [6, -24], [14, -26]]) { g.beginPath(); g.arc(bx + dx, by + dy, 1.8, 0, TAU); g.fillStyle = '#9a7040'; g.fill(); } } };
  // far legs + tail (behind body)
  const legPat = (L) => (h) => { if (BP) return; const c = L.chain; for (let i = 0; i < c.length - 1; i++) for (const t of [0.35, 0.75]) { const a = lerp(c[i], c[i + 1], t), ang = Math.atan2(c[i + 1][1] - c[i][1], c[i + 1][0] - c[i][0]) + Math.PI / 2, r = L.r[i] * 1.1;
    taper(h, [[a[0] - Math.cos(ang) * r, a[1] - Math.sin(ang) * r], [a[0] + Math.cos(ang) * r * 0.3, a[1] + Math.sin(ang) * r * 0.3 + 2]], 4.5, C.stripe, 0.2); } };
  const drawLeg = (L) => { const p = limb(L.chain, L.r); if (L.paw) ellP(...L.paw, p); const col = L.far ? C.far : C.fur;
    cel(g, p, col, L.far ? 3.2 : 3.4, 7, 6, 3, legPat(L));
    if (L.paw && !L.raised) { const [x, y, rx] = L.paw; for (const k of [0.15, 0.5]) taper(g, [[x + rx * k, y - 2], [x + rx * k + 1, y + 6]], 1.4, fur(inkFor(col)), 0.2); }
    if (L.raised && !BP) { const [x, y] = L.paw; g.beginPath(); g.ellipse(x + 4, y + 3, 6, 4, -1.2, 0, TAU); g.fillStyle = '#e2a2b6'; g.fill(); } };
  const tailP = P.tail && tube(P.tail.pts, P.tail.w0, P.tail.w1, P.tail.fz || 0, seed);
  const tailPat = (h) => { if (BP) return; const S2 = tailP.S, n = S2.length; for (let i = 6; i < n - 4; i += 7) { const a = S2[i - 1], b = S2[i + 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2; taper(h, [[S2[i][0] - Math.cos(ang) * 18, S2[i][1] - Math.sin(ang) * 18], [S2[i][0] + Math.cos(ang) * 18, S2[i][1] + Math.sin(ang) * 18]], 5, C.stripe, 0.5); }
    const e = S2[n - 1]; h.fillStyle = C.stripe; h.beginPath(); h.arc(e[0], e[1], 13, 0, TAU); h.fill(); };
  const drawTail = () => { if (!tailP) return; cel(g, tailP.P, C.fur, 3.4, 6, 5, 3, tailPat); };
  for (const L of P.legs) if (L.far && !L.raised) drawLeg(L);
  if (P.bowl && pose !== 'hungry') drawBowl(...P.bowl);
  if (!P.tail.front) drawTail();
  // body
  let bodyPts = cr(P.body, true, 8);
  if (P.fz) bodyPts = fuzz(bodyPts, P.fz, 2, seed, (p) => p[1] < -112 || p[0] < -70);
  else bodyPts = fuzz(bodyPts, 3.5, 7, seed + 3, (p) => p[1] > -60 && p[1] < -6);
  const bodyP = polyPath(bodyPts);
  const back = cr(P.back, false, 6);
  const cen = [P.body.reduce((s, p) => s + p[0], 0) / P.body.length, P.body.reduce((s, p) => s + p[1], 0) / P.body.length];
  const bodyPat = (h) => { if (BP) return;
    for (let i = 2; i < back.length - 1; i += 4) { const a = back[i - 1], b = back[i + 1], p = back[i]; let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l; if ((cen[0] - p[0]) * nx + (cen[1] - p[1]) * ny < 0) { nx = -nx; ny = -ny; }
      const len = 40 + 26 * hsh(i, seed), wob = (hsh(i, seed + 1) - 0.5) * 12; taper(h, [[p[0] - nx * 8, p[1] - ny * 8], [p[0] + nx * len * 0.5 - ny * wob, p[1] + ny * len * 0.5 + nx * wob], [p[0] + nx * len, p[1] + ny * len]], 9, C.stripe, 0.2); }
    taper(h, back.map(([x, y]) => [x, y + 2]), 10, C.stripe, 0.3);
    h.fillStyle = C.light; if (P.chest) { h.beginPath(); h.ellipse(...P.chest, 0, TAU); h.fill(); } if (P.belly) { h.beginPath(); h.ellipse(...P.belly, 0, TAU); h.fill(); } };
  cel(g, bodyP, C.fur, 3.8, 20, 12, 6, bodyPat);
  if (P.haunch) { const [x, y, rx, ry, r] = P.haunch, hpp = smooth(fuzz(arcPts(x, y, rx, 0, TAU, 14, ry).slice(0, -1).map(([px, py]) => { const dx = px - x, dy = py - y; return [x + dx * Math.cos(r) - dy * Math.sin(r), y + dx * Math.sin(r) + dy * Math.cos(r)]; }), 0), 6);
    g.save(); g.clip(bodyP); cel(g, hpp, C.fur, 2.4, 14, 10, 0, (h) => { if (BP) return; for (let k = 0; k < 3; k++) { const a = -2.2 + k * 0.55; taper(h, [[x + Math.cos(a) * rx * 1.05, y + Math.sin(a) * ry * 1.05], [x + Math.cos(a) * rx * 0.45, y + Math.sin(a) * ry * 0.45]], 8, C.stripe, 0.2); } }); g.restore(); }
  if (P.foot) cel(g, ellP(...P.foot), C.fur, 3, 5, 4, 2);
  if (P.tail.front) drawTail();
  for (const L of P.legs) if (!L.far || L.raised) { if (!L.raised) drawLeg(L); }
  if (P.paws) for (const pw of P.paws) cel(g, ellP(...pw), C.fur, 3.2, 5, 4, 2);
  if (P.bowl && pose === 'hungry') drawBowl(...P.bowl);
  // chest ruff (scruffy tuft under the chin)
  if (P.ruff) { const [rx0, ry0, ra] = P.ruff, pts = []; for (let k = 0; k <= 8; k++) { const a = Math.PI * (0.15 + 0.7 * k / 8), r = k % 2 ? 12 : 22; pts.push([rx0 + Math.cos(a + ra) * r, ry0 + Math.sin(a + ra) * r]); } pts.push([rx0, ry0 - 6]);
    cel(g, polyPath(pts), C.light, 2.2, 3, 3, 0); }
  // ---- gear on the body: antenna lead along the spine into the tail (drawn under the head) ----
  const hs = P.head.s || 1, HR = P.head.rot, h2w = ([x, y]) => [P.head.x + (x * Math.cos(HR) - y * Math.sin(HR)) * hs, P.head.y + (x * Math.sin(HR) + y * Math.cos(HR)) * hs];
  const SK = [-54, 40], skullW = h2w(SK);
  let antPts = null;
  if (gear) { const bk = P.back.map(([x, y]) => [x, y + 5]); antPts = [skullW, ...bk.slice(1), ...P.tail.pts.slice(1).map((p, i, a) => i === a.length - 1 ? p : p)];
    const A = cr(antPts, false, 10); g.save(); if (!BP) g.setLineDash([16, 7]);
    g.lineCap = 'round'; g.beginPath(); A.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.lineWidth = BP ? 1.6 : 2.2; g.strokeStyle = BP ? BPW : '#2b2235'; g.stroke(); if (!BP) { g.lineWidth = 0.9; g.strokeStyle = 'rgba(214,220,236,0.85)'; g.stroke(); }
    g.restore(); const tip = A[A.length - 1]; cel(g, ellP(tip[0], tip[1], 3.4, 3.4), '#c9ced8', 1.6, 1, 1, 0); }
  // transmitter: small metal bump at the base of the skull, peeking out from behind the head, half-buried in fur
  if (gear) { g.save(); g.translate(...skullW); g.rotate(HR - 0.6); g.scale(hs, hs); const tp = new Path2D(); tp.roundRect(-12, -8, 24, 15, 5); cel(g, tp, '#b9c0cd', 2.2, 4, 3, 2);
    if (!BP) { g.fillStyle = '#e0303a'; g.beginPath(); g.arc(-5, 1, 1.9, 0, TAU); g.fill(); for (const x of [0, 5]) { g.beginPath(); g.arc(x, 1, 1.3, 0, TAU); g.fillStyle = '#5a6070'; g.fill(); } taper(g, [[-8, -5], [5, -5]], 1.5, 'rgba(255,255,255,0.8)', 0.4);
      taper(g, [[-14, 9], [-8, 2], [-4, 10]], 3.4, C.fur, 0.3); } g.restore(); }
  // ---- head ----
  g.save(); g.translate(P.head.x, P.head.y); g.rotate(HR); g.scale(hs, hs);
  drawHead(g, C, H, op, gear);
  g.restore();
  if (P.legs.some((L) => L.raised)) drawLeg(P.legs.find((L) => L.raised));
  g.restore();

  // ---- blueprint callouts (drawn unmirrored in card space) ----
  if (BP) {
    const toCard = ([x, y]) => [300 + (op.x || 0) + x * S * flip, 965 + y * S];
    const micH = H.mic || [-40, -36], mic = toCard(h2w(micH)), tx = toCard(skullW), tl = toCard(P.tail.front ? P.tail.pts[1] : lerp(P.tail.pts[P.tail.pts.length - 2], P.tail.pts[P.tail.pts.length - 1], 0.5));
    g.save(); g.setTransform(g.getTransform()); g.strokeStyle = BPW; g.fillStyle = BPW; g.lineWidth = 2; g.font = 'bold 21px "Courier New", monospace'; g.textBaseline = 'middle';
    const callout = (p, lx, ly, label, sub) => { g.beginPath(); g.arc(p[0], p[1], 20, 0, TAU); g.stroke(); g.setLineDash([2, 4]); g.beginPath(); g.arc(p[0], p[1], 27, 0, TAU); g.stroke(); g.setLineDash([]);
      const a = Math.atan2(ly - p[1], lx - p[0]); g.beginPath(); g.moveTo(p[0] + Math.cos(a) * 27, p[1] + Math.sin(a) * 27); g.lineTo(lx, ly); const right = lx > p[0]; g.lineTo(lx + (right ? 14 : -14), ly); g.stroke();
      g.textAlign = right ? 'left' : 'right'; const tw = g.measureText(label).width + 26; g.textAlign = 'left'; const x0 = Math.max(6, Math.min(594 - tw, right ? lx + 20 : lx - 20 - tw + 6)); g.fillText(label, x0, ly - 2); g.font = '14px "Courier New", monospace'; g.fillText(sub, x0, ly + 18); g.font = 'bold 21px "Courier New", monospace'; };
    const sx = Math.sign(tx[0] - tl[0]) || 1; // place labels on the open side
    callout(mic, mic[0] - sx * 40, mic[1] - 90, 'MICROPHONE', 'EAR CANAL');
    callout(tx, tx[0] + sx * 60, Math.min(935, tx[1] + 150), 'TRANSMITTER', 'BASE OF SKULL');
    callout(tl, tl[0] - sx * 30, P.tail.front ? tl[1] - 150 : Math.min(tl[1] - 80, 860), 'ANTENNA', 'WIRE IN FUR > TAIL');
    // ground line + height dimension
    g.lineWidth = 1.4; g.setLineDash([10, 4, 2, 4]); g.beginPath(); g.moveTo(60, 965); g.lineTo(540, 965); g.stroke(); g.setLineDash([]);
    g.restore();
  }
  BP = false; LX = 1;
}
