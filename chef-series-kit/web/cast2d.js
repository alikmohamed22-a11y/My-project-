// cast2d.js v2 — flat-2D vector cast for "The Chef Résumé". Pure Canvas 2D, no imports.
// drawChar(ctx, name, o) / bounds(name, o). Units: each character is designed in a 100-unit-tall
// space (feet at 0, top of hair at -100, y up = negative) and scaled by o.h/100. t is in frames @30fps.
// v2: pose blending (pose2/mix), joint overrides (o.rig), secondary motion, expression cross-fades,
// smoother visemes + jaw, saccades, blink-on-turn, textures/AO/tapered interior lines. v1 API unchanged.
export const CAST = ['SAM', 'SAM_SOOT', 'SAM_CHEF', 'HEADCHEF', 'ROOMMATE', 'MOM'];
export const REL_H = { SAM: 1, SAM_SOOT: 1, SAM_CHEF: 1, HEADCHEF: 1.1, ROOMMATE: 1.12, MOM: 0.92 };
export const POSES = ['stand', 'walk', 'sit', 'cheer', 'point', 'facepalm', 'shrug', 'hold', 'holdUp', 'phone', 'armsCrossed', 'nod',
  'lookUp', 'salute', 'bow', 'tiptoe', 'crackEgg', 'stir', 'fanSmoke', 'typing', 'fall', 'proudChest'];

const INK = '#1c1530', TAU = Math.PI * 2, HP = Math.PI / 2, D2R = Math.PI / 180;
const VIEWS = { front: 0, '34R': 0.7, sideR: HP, '34L': -0.7, sideL: -HP, back: Math.PI };
const lerp = (a, b, t) => a + (b - a) * t, cl = (v, a, b) => (v < a ? a : v > b ? b : v);
const hs = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const sstep = (a, b, x) => { const u = cl((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const TWO_HAND = { phone: 1, typing: 1, crackEgg: 1 };
const RAISED = { cheer: 1, holdUp: 1, facepalm: 1, shrug: 1, salute: 1, fanSmoke: 1, fall: 1 };
const PROP_POSES = { hold: 1, holdUp: 1, point: 1, stand: 1, walk: 1, nod: 1, sit: 1, stir: 1, fanSmoke: 1, tiptoe: 1, proudChest: 1, lookUp: 1 };
const DEF_PROP = { stir: 'spatula', crackEgg: 'egg', typing: 'phone' };

// ---------------------------------------------------------------- path helpers
function spl(pts) { // closed Catmull-Rom -> Path2D
  const p = new Path2D(), n = pts.length; p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n], d = pts[(i + 2) % n];
    p.bezierCurveTo(b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6, c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6, c[0], c[1]);
  }
  p.closePath(); return p;
}
function poly(pts) { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; }
function ell(x, y, rx, ry, r = 0) { const p = new Path2D(); p.ellipse(x, y, Math.max(rx, 0.01), Math.max(ry, 0.01), r, 0, TAU); return p; }
function rrect(x, y, w, h, r) { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; }
function pl(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); if (pts.length === 1) ctx.lineTo(pts[0].x + 0.01, pts[0].y); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); }
const BIG = 1e4;
const P = (x, y) => ({ x, y });
const along = (pts, f) => { // sub-polyline up to fraction f of the length
  let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); seg.push(l); L += l; }
  let d = L * f; const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) { if (d <= seg[i - 1]) { const u = seg[i - 1] ? d / seg[i - 1] : 0; out.push(P(lerp(pts[i - 1].x, pts[i].x, u), lerp(pts[i - 1].y, pts[i].y, u))); return out; } d -= seg[i - 1]; out.push(pts[i]); }
  return out;
};
const qpts = (a, c, b, n = 8) => { const o = []; for (let i = 0; i <= n; i++) { const u = i / n, v = 1 - u; o.push(P(v * v * a.x + 2 * u * v * c.x + u * u * b.x, v * v * a.y + 2 * u * v * c.y + u * u * b.y)); } return o; };
const arcPts = (x, y, rx, ry, a0, a1, n = 10) => { const o = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); o.push(P(x + Math.cos(a) * rx, y + Math.sin(a) * ry)); } return o; };

// ---------------------------------------------------------------- texture patterns (device-pixel tiles, cached per context)
let TX = { on: 1, u: 1 };
const PATC = new WeakMap();
function tile(kind, T) {
  const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(T, T) : Object.assign(document.createElement('canvas'), { width: T, height: T });
  const g = c.getContext('2d'); g.fillStyle = INK; g.strokeStyle = INK;
  if (kind === 'dot') { for (const [x, y] of [[0.25, 0.25], [0.75, 0.75]]) { g.beginPath(); g.arc(x * T, y * T, T * 0.16, 0, TAU); g.fill(); } }
  else if (kind === 'twill') { g.lineWidth = Math.max(1, T * 0.13); for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(i * T, T); g.lineTo(i * T + T, 0); g.stroke(); } }
  else if (kind === 'rib') g.fillRect(0, 0, Math.max(1, T * 0.24), T);
  else { const n = kind === 'speck' ? 7 : 18, rr = kind === 'speck' ? 0.04 : 0.032; for (let i = 0; i < n; i++) { g.beginPath(); g.arc(hs(i + 3.1) * T, hs(i * 2.3 + 9) * T, Math.max(0.5, T * rr * (0.7 + hs(i + 5) * 0.6)), 0, TAU); g.fill(); } }
  return c;
}
function pat(ctx, kind, unit) {
  const m = ctx.getTransform(), sc = Math.hypot(m.a, m.b) || 1, T = cl(Math.round(unit * sc), 4, 384);
  let M = PATC.get(ctx); if (!M) { M = new Map(); PATC.set(ctx, M); }
  const key = kind + T; let p = M.get(key);
  if (!p) { p = ctx.createPattern(tile(kind, T), 'repeat'); M.set(key, p); }
  const s = unit / T; p.setTransform(new DOMMatrix([s, 0, 0, s, 0, 0])); return p;
}

// hard-edged shadow: fill the part of p NOT covered by p shifted (dx,dy) toward the light; + halftone dots in it
function shade(ctx, p, col, dx, dy, ht = 1) {
  ctx.save(); ctx.clip(p); const q = new Path2D(); q.rect(-BIG, -BIG, 2 * BIG, 2 * BIG);
  q.addPath(p, { a: 1, b: 0, c: 0, d: 1, e: dx, f: dy }); ctx.fillStyle = col; ctx.fill(q, 'evenodd');
  if (ht && TX.on) { ctx.globalAlpha = 0.17 * ht; ctx.fillStyle = pat(ctx, 'dot', TX.u); ctx.fill(q, 'evenodd'); }
  ctx.restore();
}
// merged group: all ink first (outer outline), then fills -> overlapping parts share one silhouette
function G(ctx, S, items) {
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = INK;
  for (const it of items) { if (!it) continue; if (it.pts) { ctx.lineWidth = it.w + 2 * S.lw; pl(ctx, it.pts); ctx.stroke(); } else { ctx.lineWidth = 2 * S.lw; ctx.stroke(it.p); } }
  for (const it of items) {
    if (!it) continue;
    if (it.pts) fillTube(ctx, S, it);
    else {
      ctx.fillStyle = it.c; ctx.fill(it.p);
      if (it.tx && TX.on) { ctx.save(); ctx.globalAlpha = it.ta ?? 0.1; ctx.fillStyle = pat(ctx, it.tx, it.tu || TX.u * 1.6); ctx.fill(it.p); ctx.restore(); }
      if (it.s) shade(ctx, it.p, it.s, -S.sd * (it.o ?? 1.5), -(it.oy ?? 0.5), it.ht ?? 1);
    }
  }
}
function fillTube(ctx, S, it) {
  const { pts, w, c, s } = it; pl(ctx, pts);
  if (s) {
    ctx.strokeStyle = s; ctx.lineWidth = w; ctx.stroke();
    if (TX.on && it.ht !== 0) { ctx.save(); ctx.globalAlpha = 0.17 * (it.ht ?? 1); ctx.strokeStyle = pat(ctx, 'dot', TX.u); ctx.stroke(); ctx.restore(); }
    const a = pts[0], b = pts[pts.length - 1]; let nx = -(b.y - a.y), ny = b.x - a.x; const L = Math.hypot(nx, ny);
    if (L < 1e-3) { nx = -S.sd; ny = 0; } else { nx /= L; ny /= L; }
    if (Math.abs(nx) < 0.3) { if (ny > 0) { nx = -nx; ny = -ny; } } else if (nx * S.sd > 0) { nx = -nx; ny = -ny; }
    ctx.save(); ctx.translate(nx * w * 0.21, ny * w * 0.21); pl(ctx, pts); ctx.strokeStyle = c; ctx.lineWidth = w * 0.58; ctx.stroke(); ctx.restore();
  } else { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); }
  if (it.tx && TX.on) { ctx.save(); ctx.globalAlpha = it.ta ?? 0.1; ctx.strokeStyle = pat(ctx, it.tx, it.tu || TX.u * 1.6); ctx.lineWidth = w; pl(ctx, pts); ctx.stroke(); ctx.restore(); }
  ctx.strokeStyle = INK;
}
// tapered interior stroke (filled polygon, thin at both ends)
function tline(ctx, pts, w, col = INK, ta = 0.3, tb = 0.3) {
  if (!pts || pts.length < 2) return;
  let s = pts;
  if (s.length < 5) { const d = []; const m = s.length === 2 ? 6 : 3; for (let i = 0; i < s.length - 1; i++) for (let j = 0; j < m; j++) d.push(P(lerp(s[i].x, s[i + 1].x, j / m), lerp(s[i].y, s[i + 1].y, j / m))); d.push(s[s.length - 1]); s = d; }
  const n = s.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = s[i > 0 ? i - 1 : 0], b = s[i < n - 1 ? i + 1 : n - 1]; const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, u = i / (n - 1);
    const f = u < 0.35 ? lerp(ta, 1, sstep(0, 0.35, u)) : u > 0.65 ? lerp(tb, 1, sstep(1, 0.65, u)) : 1, h = w * 0.5 * f;
    L.push([s[i].x - dy / l * h, s[i].y + dx / l * h]); R.push([s[i].x + dy / l * h, s[i].y - dx / l * h]);
  }
  ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]); for (let i = 1; i < n; i++) ctx.lineTo(L[i][0], L[i][1]);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]); ctx.closePath();
  ctx.moveTo(s[0].x + w * 0.5 * ta, s[0].y); ctx.arc(s[0].x, s[0].y, w * 0.5 * ta, 0, TAU);
  ctx.moveTo(s[n - 1].x + w * 0.5 * tb, s[n - 1].y); ctx.arc(s[n - 1].x, s[n - 1].y, w * 0.5 * tb, 0, TAU);
  ctx.fillStyle = col; ctx.fill('nonzero');
}
function line(ctx, S, pts, k = 1, col = INK) { tline(ctx, pts, S.lw * k, col, 0.35, 0.35); ctx.strokeStyle = INK; }
function stitch(ctx, S, pts, col, k = 0.32) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = S.lw * k; ctx.lineCap = 'butt'; ctx.setLineDash([S.lw * 0.8, S.lw * 0.65]); pl(ctx, pts); ctx.stroke(); ctx.restore(); }

// ---------------------------------------------------------------- character definitions
const HAIR_SAM = (a) => { const A = Math.abs(a); let e = A < HP ? 0.88 - 0.94 * Math.pow(A / HP, 1.4) : lerp(-0.06, -1.05, Math.pow((A - HP) / HP, 0.8)); if (A < 1.3) e -= 0.2 * Math.pow(1 - Math.abs(Math.sin(a * 3.6 + 0.9)), 1.6) * (1 - A / 1.6); return e; };
const HAIR_FRIZZ = (a) => HAIR_SAM(a) + 0.05 * (1 - Math.abs(Math.sin(a * 9)));
const SAMBASE = {
  relH: 1, skin: '#c98a5e', skinS: '#a56a44', blush: '#e2705a', blushL: '#b84a3a', lips: null, defExpr: 'neutral',
  iris: '#9a6234', nail: '#ebc0a2', freckles: 6, freckC: '#94583a', crease: '#93593a',
  head: { R: 12.4, cy: -82, W: 1, low: 1.15, taper: 0.36, sq: 1, top: 1, eyeA: 0.5, eyeY: 0.1, erx: 0.235, ery: 0.3, noseY: 0.45, mouthY: 0.74, nose: 'round', brW: 0.13, brCol: '#2e1f22', ears: 1 },
  hair: { c: '#3a2626', s: '#25171a', hi: '#6e4b45', line: HAIR_SAM, vol: { r: 1.13, amp: 0.085, n: 7, ext: 0.25, cy: -0.03, mode: 'wavy' }, cow: 1, locks: 11 },
  body: { neckW: 4.4, shY: -64.5, sx: 8.4, sd: 5.2, hemY: -37, hemX: 8.9, hemD: 5.8, hipY: -38.5, hipX: 3.7, legW: 6.6, armW: 5.4, ua: 12.4, fa: 12.2, thigh: 17.6, shin: 17.2, footY: -4, sitY: -23 },
  top: { type: 'hoodie', c: '#f2b52b', s: '#c98c16', tee: '#f6f1e6', teeS: '#d8cdbb', tx: 'speck', ta: 0.16, stitch: '#b07a10' },
  sleeve: { c: '#f2b52b', s: '#c98c16', len: 1, cuff: 1, tx: 'speck', ta: 0.16 },
  pants: { c: '#2f5193', s: '#22396d', len: 1, cuff: '#3b62ad', tx: 'twill', ta: 0.13, denim: '#e2a648' },
  shoes: { type: 'sneaker', c: '#e2453c', s: '#b52e27', sole: '#f7f2ea' },
};
const DEF = {
  SAM: SAMBASE,
  SAM_SOOT: { ...SAMBASE, sootBase: 0.85, singe: 1, smoke: 1, hair: { ...SAMBASE.hair, line: HAIR_FRIZZ, vol: { r: 1.2, amp: 0.15, n: 15, ext: 0.45, cy: -0.05, mode: 'spiky' }, cow: 0 }, top: { ...SAMBASE.top, scorch: 1 } },
  SAM_CHEF: {
    ...SAMBASE, sootBase: 0.7, singe: 1, smoke: 0,
    hair: { ...SAMBASE.hair, line: HAIR_FRIZZ, vol: { r: 1.18, amp: 0.13, n: 15, ext: 0.5, cy: 0, mode: 'spiky' }, cow: 0 },
    hat: { type: 'flop', c: '#fbfaf7', s: '#d9d6cf', eb: 0.74, H: 1.75, w: 1.0 },
    body: { ...SAMBASE.body, sx: 9.6, hemY: -32, hemX: 10.6, hemD: 6.6 },
    top: { type: 'chef', c: '#fbfaf7', s: '#d6d3cb', btn: '#c9c3b6', hood: '#f2b52b', hoodS: '#c98c16', sloppy: 1, tx: 'speck', ta: 0.04, ht: 0.35, stitch: '#c4beb0' },
    sleeve: { c: '#fbfaf7', s: '#d6d3cb', len: 1.14, wide: 2.2, tx: 'speck', ta: 0.04, ht: 0.35 },
  },
  HEADCHEF: {
    relH: 1.1, skin: '#f0c8a8', skinS: '#d29f80', blush: '#e88f80', blushL: '#cf6a5c', defExpr: 'stern', defPose: 'armsCrossed',
    iris: '#4f7fae', nail: '#f8e0d2', stubble: 0.3, mole: [0.62, 0.52], crease: '#c08a6c',
    head: { R: 11, cy: -85.5, W: 0.98, low: 1.16, taper: 0.16, sq: 0.55, top: 1.02, eyeA: 0.46, eyeY: 0.05, erx: 0.2, ery: 0.25, noseY: 0.38, mouthY: 0.74, nose: 'long', brW: 0.2, brCol: '#56504c', ears: 1, stache: '#5a524d', lines: 1 },
    hair: { c: '#a8a39c', s: '#86817a', hi: '#d2cec8', line: (a) => { const A = Math.abs(a); return A < HP ? lerp(0.62, 0.02, Math.pow(A / HP, 1.3)) : lerp(0.02, -1.0, Math.pow((A - HP) / HP, 0.8)); }, vol: { r: 1.04, amp: 0.03, n: 6, ext: 0.3, cy: 0.05, mode: 'wavy' }, locks: 9 },
    hat: { type: 'tall', c: '#ffffff', s: '#dad8d2', eb: 0.7, H: 2.25, w: 0.92 },
    body: { neckW: 5.6, shY: -69, sx: 11.4, sd: 7.4, hemY: -33, hemX: 11.6, hemD: 7.8, hipY: -38, hipX: 4.6, legW: 7.6, armW: 6.4, ua: 13.6, fa: 13, thigh: 17.4, shin: 16.8, footY: -3.8, sitY: -23 },
    top: { type: 'chefDB', c: '#fbfaf6', s: '#d8d5cd', btn: '#2c2742', scarf: '#d8332f', scarfS: '#a92322', tx: 'speck', ta: 0.04, ht: 0.35, stitch: '#c9c4b8', pen: 1 },
    sleeve: { c: '#fbfaf6', s: '#d8d5cd', len: 1, cuff: 1, tx: 'speck', ta: 0.04, ht: 0.35 },
    pants: { c: '#34323f', s: '#25232e', len: 1, check: 1, tx: 'twill', ta: 0.12 },
    shoes: { type: 'clog', c: '#2b2735', s: '#1f1c28', sole: '#3a3546' },
  },
  ROOMMATE: {
    relH: 1.12, skin: '#7f5137', skinS: '#643d29', blush: '#9a5038', blushL: '#7a3424', defExpr: 'deadpan', lidAdd: 0.3,
    iris: '#7a4a28', nail: '#b98d78', stubble: 0.55, crease: '#5a3524',
    head: { R: 10, cy: -86.5, W: 0.86, low: 1.32, taper: 0.22, sq: 0.8, top: 1.07, eyeA: 0.46, eyeY: 0.12, erx: 0.22, ery: 0.29, noseY: 0.5, mouthY: 0.9, nose: 'broad', brW: 0.12, brCol: '#1d1416', ears: 1, stud: 1 },
    hair: { c: '#221819', s: '#160f10', hi: '#3d2d2d', line: (a) => { const A = Math.abs(a); return A < HP ? lerp(0.5, 0.12, Math.pow(A / HP, 1.2)) : lerp(0.12, -1.0, Math.pow((A - HP) / HP, 0.8)); }, vol: null, locks: 0 },
    hat: { type: 'beanie', c: '#e2622f', s: '#b84a1f', cuff: '#c95424', eb: 0.36, H: 1.36 },
    body: { neckW: 4.2, shY: -69.5, sx: 9.6, sd: 5.4, hemY: -36.5, hemX: 10.4, hemD: 6.4, hipY: -42, hipX: 3.9, legW: 5.0, armW: 4.4, ua: 15.2, fa: 14.8, thigh: 19.6, shin: 19, footY: -2.2, sitY: -25 },
    top: { type: 'tee', c: '#7457c4', s: '#573ea1', teeS: '#4f3793', graphic: 'planet', tx: 'speck', ta: 0.14, stitch: '#4a3390' },
    sleeve: { c: '#7457c4', s: '#573ea1', len: 0.44, wide: 3.2, tx: 'speck', ta: 0.14 },
    pants: { c: '#d8443b', s: '#ad2e27', len: 0.6, wide: 3.6, stripe: '#f6f1e6', sock: '#f4f1ea', sockS: '#d4cfc4', tx: 'speck', ta: 0.12 },
    shoes: { type: 'slide', c: '#2b2a3a', s: '#1d1c29', sole: '#3fb6a8' },
  },
  MOM: {
    relH: 0.92, skin: '#e7b28c', skinS: '#c98e68', blush: '#ec8b7c', blushL: '#d4646a', lips: '#c4505e', defExpr: 'neutral', lash: 1,
    iris: '#4f8a52', nail: '#e0566a', mole: [-0.42, 0.66], crease: '#b87e5c',
    head: { R: 12.6, cy: -80, W: 1.02, low: 1.04, taper: 0.3, sq: 0.9, top: 1, eyeA: 0.48, eyeY: 0.06, erx: 0.225, ery: 0.29, noseY: 0.38, mouthY: 0.68, nose: 'button', brW: 0.1, brCol: '#5a2b1d', ears: 1, glasses: 1, earring: 1 },
    hair: { c: '#7c3b24', s: '#5b2817', hi: '#b8664a', line: (a) => { const A = Math.abs(a); let e = A < HP ? 0.78 - 0.9 * Math.pow(A / HP, 1.3) : lerp(-0.12, -0.95, Math.pow((A - HP) / HP, 0.8)); return e + 0.08 * Math.abs(Math.sin(a * 6.5)); }, vol: { r: 1.2, amp: 0.11, n: 13, ext: 1.0, cy: 0.0, mode: 'curly' }, locks: 13 },
    body: { neckW: 4.6, shY: -63.5, sx: 9.4, sd: 6.4, hemY: -33.5, hemX: 10.4, hemD: 7.2, hipY: -37.5, hipX: 4.1, legW: 7.0, armW: 5.6, ua: 12.4, fa: 11.8, thigh: 16.6, shin: 16.4, footY: -3, sitY: -22 },
    top: { type: 'cardigan', c: '#2f9488', s: '#216d64', blouse: '#f7ead0', blouseS: '#dcc9a6', btn: '#f3d9a0', tx: 'rib', ta: 0.1, stitch: '#1f655c' },
    sleeve: { c: '#2f9488', s: '#216d64', len: 1, cuff: 1, tx: 'rib', ta: 0.1 },
    pants: { c: '#5a3a60', s: '#432a48', len: 1, tx: 'speck', ta: 0.1 },
    shoes: { type: 'flat', c: '#7a3b2c', s: '#5b2a1f', sole: '#3a2422' },
  },
};

// ---------------------------------------------------------------- expressions
// b: brows [[raise, innerTilt(+worried/-angry), arch], ...] (screen-left, screen-right)
// e: eyes {o open, lt top lid, lb bottom lid, p pupil, happy, squint, spark, dead, tears, look}
// m: parametric mouth (units of R/12): w half-width, c corner y, top/bot lip mid y, sk right-corner offset,
//    teeth (upper, only shown when open), tb lower teeth, tf forced upper teeth, cl clenched, tongue, rnd roundness, sq squiggle
const EX = {
  neutral: { b: [[0, 0, 0.3], [0, 0, 0.3]], e: { o: 1, lt: 0.12 }, m: { w: 3.2, c: -0.7, top: 0.1, bot: 0.1 } },
  happy: { b: [[1.1, 0.25, 0.5], [1.1, 0.25, 0.5]], e: { o: 1, lb: 0.24, lt: 0.04 }, m: { w: 4.6, c: -1.7, top: -0.6, bot: 3.0, teeth: 1, tongue: 1, rnd: 0.15 }, blush: 1 },
  grin: { b: [[0.8, 0.1, 0.5], [0.8, 0.1, 0.5]], e: { o: 1, lb: 0.34, lt: 0.06 }, m: { w: 5.0, c: -2.3, top: 0.2, bot: 2.4, teeth: 1, tongue: 0.4 }, blush: 0.9 },
  excited: { b: [[2.2, 0.3, 0.7], [2.2, 0.3, 0.7]], e: { o: 1.08, p: 1.12, spark: 1 }, m: { w: 4.8, c: -1.8, top: -0.8, bot: 4.0, teeth: 1, tongue: 1, rnd: 0.3 }, blush: 1 },
  shock: { b: [[3.0, 0.5, 0.9], [3.0, 0.5, 0.9]], e: { o: 1.16, p: 0.6 }, m: { w: 2.2, c: 0.6, top: -2.0, bot: 3.4, rnd: 1, tongue: 0.7 } },
  panic: { b: [[2.4, 1.8, 0.1], [2.4, 1.8, 0.1]], e: { o: 1.18, p: 0.52 }, m: { w: 4.8, c: 1.1, top: -0.2, bot: 4.4, teeth: 1, tb: 1, tongue: 1, rnd: 0.35, sq: 0.35 }, sweat: 1 },
  nervous: { b: [[1.2, 1.6, 0], [1.2, 1.6, 0]], e: { o: 1.03, p: 0.82, lt: 0.06 }, m: { w: 3.8, c: -0.4, top: -0.3, bot: 2.6, cl: 1, sq: 0.5 }, sweat: 1 },
  smug: { b: [[-0.1, -0.8, 0.1], [2, 0, 0.8]], e: { o: 1, lt: 0.46 }, m: { w: 3.6, c: -0.4, top: 0.15, bot: 0.15, sk: -1.8 } },
  smirk: { b: [[0.2, -0.3, 0.3], [1.3, 0.1, 0.7]], e: { o: 1, lt: 0.24, lb: 0.14, look: [0.3, 0] }, m: { w: 3.0, c: 0, top: 0.3, bot: 0.3, sk: -1.7 }, blush: 0.4 },
  deadpan: { b: [[-0.4, 0, 0], [-0.4, 0, 0]], e: { o: 1, lt: 0.52, p: 0.95 }, m: { w: 3, c: 0, top: 0, bot: 0 } },
  blank: { b: [[0.1, 0, 0], [0.1, 0, 0]], e: { o: 1.02, lt: 0.14, p: 0.42, dead: 1, fixed: 1 }, m: { w: 1.8, c: 0.05, top: 0.05, bot: 0.05 } },
  confused: { b: [[2.1, 0.6, 0.7], [-0.6, -0.8, 0]], e: { o: 1, look: [0.35, -0.5] }, m: { w: 2.8, c: 0.2, top: 0.2, bot: 0.2, sq: 1.0, sk: -0.6 }, roll: 0.07 },
  stern: { b: [[-1.1, -1.9, 0], [-1.1, -1.9, 0]], e: { o: 1, lt: 0.3, p: 0.9 }, m: { w: 3.4, c: 1.2, top: -0.1, bot: -0.1 } },
  proud: { b: [[1.4, 0, 0.5], [1.4, 0, 0.5]], e: { happy: 1 }, m: { w: 4.4, c: -2.0, top: -0.5, bot: 2.4, teeth: 1, tongue: 0.6 }, pitch: -0.07, blush: 1 },
  cry: { b: [[1, 2, 0], [1, 2, 0]], e: { o: 0.95, lb: 0.32, tears: 1 }, m: { w: 4.0, c: 1.6, top: 0.8, bot: 3.4, tongue: 1, rnd: 0.2, sq: 0.4 } },
  wince: { b: [[0.4, 1.5, 0.2], [0.4, 1.5, 0.2]], e: { squint: 1 }, m: { w: 4.0, c: 0.7, top: -0.4, bot: 2.5, cl: 1, sk: -0.7 }, roll: -0.05 },
  dreamy: { b: [[1.5, 0.7, 0.6], [1.5, 0.7, 0.6]], e: { o: 1, lt: 0.4, look: [0.35, -0.65], spark: 1 }, m: { w: 2.6, c: -1.1, top: 0.25, bot: 0.25 }, blush: 1.3, roll: -0.06, pitch: -0.04 },
  determined: { b: [[-0.5, -1.5, 0.2], [-0.5, -1.5, 0.2]], e: { o: 1, lt: 0.16, lb: 0.16, spark: 1 }, m: { w: 3.4, c: -0.3, top: 0.05, bot: 0.05, sk: -0.4 }, pitch: 0.04 },
  mortified: { b: [[1.8, 2.0, 0], [1.8, 2.0, 0]], e: { o: 1.06, p: 0.5 }, m: { w: 3.0, c: 0.9, top: 0.3, bot: 1.4, sq: 0.8 }, blush: 1.7, sweat: 0.6, gloom: 1, pitch: 0.05 },
};
export const EXPRS = Object.keys(EX);
const MK = ['w', 'c', 'top', 'bot', 'sk', 'teeth', 'tb', 'tf', 'cl', 'tongue', 'rnd', 'sq'];
function blendM(a, b, u) { if (u <= 0) return a; if (u >= 1) return b; const m = {}; for (const k of MK) m[k] = lerp(a[k] || 0, b[k] || 0, u); return m; }
const blendBrows = (a, b, u) => a.map((x, i) => x.map((v, j) => lerp(v, b[i][j], u)));
function blendEx(a, b, u) {
  if (u <= 0) return a; if (u >= 1) return b;
  const e = {}, dflt = (k) => (k === 'o' || k === 'p' ? 1 : 0);
  for (const k of new Set([...Object.keys(a.e), ...Object.keys(b.e)])) {
    if (k === 'look') { const la = a.e.look || [0, 0], lb = b.e.look || [0, 0]; e.look = [lerp(la[0], lb[0], u), lerp(la[1], lb[1], u)]; }
    else e[k] = lerp(a.e[k] ?? dflt(k), b.e[k] ?? dflt(k), u);
  }
  const n = { b: blendBrows(a.b, b.b, u), e, m: blendM(a.m, b.m, u) };
  for (const k of ['blush', 'sweat', 'pitch', 'roll', 'gloom']) n[k] = lerp(a[k] || 0, b[k] || 0, u);
  return n;
}
function exprResolve(C, o) {
  const get = (n) => EX[n] || EX[C.defExpr] || EX.neutral;
  let cur = get(o.expr || C.defExpr);
  if (o.expr2 && o.exprMix > 0) cur = blendEx(cur, get(o.expr2), cl(o.exprMix, 0, 1));
  if (o.exprPrev && o.exprT != null) { // brows lead the rest of the face by 2 frames
    const tB = sstep(0, 4, o.exprT), tR = sstep(2, 7, o.exprT);
    if (tR < 1) { const pv = get(o.exprPrev); const n = blendEx(pv, cur, tR); n.b = blendBrows(pv.b, cur.b, tB); cur = n; }
  }
  return cur;
}
const VIS = {
  A: { w: 3.6, c: -0.3, top: -0.6, bot: 3.8, teeth: 0.8, tongue: 1, rnd: 0.4 }, E: { w: 4.3, c: -0.8, top: -0.3, bot: 2.1, teeth: 1, tongue: 0.4 },
  O: { w: 2.1, c: 0.5, top: -1.5, bot: 2.8, rnd: 1, tongue: 0.6 }, M: { w: 3.0, c: 0, top: 0.15, bot: 0.15 },
  F: { w: 3.2, c: -0.1, top: -0.2, bot: 1.0, tf: 1 }, R: { w: 3.2, c: -0.3, top: -0.1, bot: 1.7, teeth: 0.6, tongue: 0.5 }, rest: { w: 3.0, c: -0.4, top: 0.15, bot: 0.55 },
};
function visFor(ch) {
  ch = (ch || ' ').toLowerCase();
  if ('ah'.includes(ch)) return VIS.A; if ('eiy'.includes(ch)) return VIS.E; if ('ouwq'.includes(ch)) return VIS.O;
  if ('mbp'.includes(ch)) return VIS.M; if ('fv'.includes(ch)) return VIS.F; if (/[a-z0-9]/.test(ch)) return VIS.R;
  return ch === ' ' ? VIS.rest : VIS.M;
}
function viseme(say, t) { // -> {m, w}: smoothly blended neighbouring letter shapes + ease in/out weight
  if (!say || t < say.t0 || t > say.t1) return null;
  const s = say.text || ''; if (!s.length) return null;
  const pos = (t - say.t0) / Math.max(1, say.t1 - say.t0) * s.length, i = Math.min(s.length - 1, Math.floor(pos)), f = pos - i;
  const m = blendM(visFor(s[i]), visFor(s[Math.min(s.length - 1, i + 1)]), sstep(0.45, 1, f));
  return { m, w: Math.min(sstep(say.t0, say.t0 + 2, t), 1 - sstep(say.t1 - 2, say.t1, t)) };
}
function talkSpec(o, t, seed) {
  const a = cl(o.talk || 0, 0, 1); if (!a) return null;
  const sh = (i) => blendM(VIS.rest, [VIS.A, VIS.E, VIS.O, VIS.R, VIS.E][Math.floor(hs(i * 1.7 + seed) * 5)], hs(i * 7.3 + seed * 3) * 0.8 + 0.2);
  const x = t / 3.2, i = Math.floor(x);
  return { m: blendM(sh(i), sh(i + 1), sstep(0.3, 1, x - i)), w: a };
}

// ---------------------------------------------------------------- rig: raw pose (body coords) -> blend -> overrides -> project
function poseRaw(C, o, pose, t, V) {
  const B = C.body, H = C.head, R = H.R, seed = o.seed || 0, u = B.ua, f = B.fa, sx = B.sx, { sn, cs, ps } = V;
  const z = { pose, jumpU: 0, bob: 0, lean: 0, shUp: 0, dip: 0, nod: 0, pitch: 0, roll: 0, hz: 0.4, hy: 0, bodyRot: 0, spin: 0, look: null, sit: pose === 'sit' ? 1 : 0 };
  const breath = Math.sin((t + seed * 7) * TAU / 96) * 0.35;
  let wph = 0;
  switch (pose) {
    case 'walk': wph = t / 20 * TAU; z.bob = -1.1 * (1 - Math.abs(Math.cos(wph))) + 0.3; z.lean = 0.9; break;
    case 'cheer': z.jumpU = -Math.max(0, Math.sin(t * TAU / 18)) * 3.2; break;
    case 'nod': z.nod = Math.max(0, Math.sin(t * TAU / 16)) * 1.3; z.pitch = z.nod * 0.06; break;
    case 'phone': z.pitch = 0.15; z.hz += 0.9; z.look = [0, 0.7]; break;
    case 'typing': z.pitch = 0.17; z.hz += 0.9; z.look = [0, 0.75]; break;
    case 'facepalm': z.pitch = 0.08; z.roll = -0.06; break;
    case 'shrug': z.shUp = -1.4; z.roll = 0.08; break;
    case 'lookUp': z.pitch = -0.24; z.hy = 0.5; z.look = [0, -1]; z.bodyRot = -4; z.hz = -0.3; break;
    case 'salute': z.pitch = -0.05; z.shUp = -0.3; break;
    case 'bow': z.bodyRot = 40; z.dip = 3.5 * Math.abs(cs); z.pitch = 0.34; z.hz = 1.2; z.look = [0, 0.6]; break;
    case 'tiptoe': wph = t / 30 * TAU; z.jumpU = -1.3 - Math.abs(Math.sin(wph)) * 0.5; z.lean = 0.6; z.shUp = -0.8; z.look = [0.3, 0]; break;
    case 'crackEgg': z.pitch = 0.12; z.look = [0, 0.6]; z.hz += 0.4; break;
    case 'stir': z.pitch = 0.14; z.look = [0.1, 0.8]; z.bob = Math.sin(t * TAU / 22) * 0.25; break;
    case 'fanSmoke': z.roll = 0.05 * Math.sin(t * TAU / 10); z.pitch = -0.04; break;
    case 'fall': z.jumpU = -4.5 - Math.sin(t * TAU / 14) * 0.6; z.spin = -16 + Math.sin(t * TAU / 12) * 5; z.pitch = -0.1; z.roll = 0.1 * Math.sin(t * TAU / 9); break;
    case 'proudChest': z.bodyRot = -5; z.pitch = -0.08; z.shUp = -0.5; break;
  }
  const ubL = z.jumpU + z.bob + (z.sit ? B.sitY - B.hipY : 0);
  z.ubL = ubL; z.ub = ubL + z.dip;
  z.shY = B.shY + z.ub + breath * 0.6 + z.shUp;
  z.headY = H.cy + z.ub + breath + z.nod + z.hy;
  const shY = z.shY, headY = z.headY, jump = z.jumpU;
  z.legs = [];
  for (const s of [1, -1]) {
    const hip = [s * B.hipX * (pose === 'walk' ? 0.85 : 1), B.hipY + ubL, 0];
    let knee, ank, tip = 0;
    if (z.sit) { knee = [s * (B.hipX + 0.6), hip[1] + 1.2, B.thigh * 0.92]; ank = [s * (B.hipX + 0.9), B.footY + jump, B.thigh * 0.92 + 1.2]; }
    else {
      let fz = 0.6, lift = 0, fx = s * (B.hipX + 0.4), fy = B.footY + jump;
      if (pose === 'walk') { const ph = wph + (s > 0 ? 0 : Math.PI); fz = 7.5 * Math.cos(ph); lift = Math.max(0, -Math.sin(ph)) * 3.2; fx = s * B.hipX * 0.85; }
      if (pose === 'tiptoe') { const ph = wph + (s > 0 ? 0 : Math.PI); lift = Math.max(0, Math.sin(ph)) * 1.6; fz = 1.5 * Math.cos(ph); fy = B.footY - 1.1; tip = 1; }
      if (pose === 'proudChest') fx = s * (B.hipX + 1.8);
      if (pose === 'fall') { if (s > 0) { fx = s * (B.hipX + 5 + Math.sin(t * TAU / 10) * 1.5); fy = hip[1] + B.thigh * 0.8; fz = 5; } else { fx = s * (B.hipX + 2.5); fy = hip[1] + B.thigh + B.shin - 4 - Math.sin(t * TAU / 10 + 1) * 1.5; fz = -2; } }
      ank = [fx, fy - lift, fz];
      const dy = ank[1] - hip[1], dz = ank[2] - hip[2], D = Math.hypot(dy, dz), L1 = B.thigh, L2 = B.shin;
      if (D >= L1 + L2 - 0.01) knee = [lerp(hip[0], ank[0], L1 / (L1 + L2)), hip[1] + dy * L1 / D, hip[2] + dz * L1 / D];
      else { const a = (L1 * L1 - L2 * L2 + D * D) / (2 * D), hh = Math.sqrt(Math.max(0, L1 * L1 - a * a)); const uy = dy / D, uz = dz / D; let py = -uz, pz = uy; if (pz < 0) { py = -py; pz = -pz; } knee = [lerp(hip[0], ank[0], 0.5), hip[1] + uy * a + py * hh, hip[2] + uz * a + pz * hh]; }
    }
    z.legs.push({ s, hip, knee, ank, tip });
  }
  z.arms = [];
  for (const s of [1, -1]) {
    const isP = s === ps; let E, W, hand = 'relax', wrist = 0;
    const S0 = [s * (sx - 0.6), shY + 0.8, 0];
    const relax = () => { E = [s * (sx + 1.5), shY + u * 0.98, -0.6]; W = [s * (sx + 1.9), shY + u + f * 0.97, 0.8]; hand = 'relax'; };
    const hip = () => { E = [s * (sx + u * 0.6), shY + u * 0.62, -1]; W = [s * (sx + 0.4), shY + u + f * 0.2, 0.5]; hand = 'fist'; };
    switch (pose) {
      case 'walk': { const ph = wph + (s > 0 ? Math.PI : 0); const sw = 6 * Math.cos(ph); E = [s * (sx + 1.1), shY + u * 0.97, sw * 0.4 + z.lean]; W = [s * (sx + 1.3), shY + u + f * 0.92, sw + z.lean]; break; }
      case 'cheer': { const wv = Math.sin(t * TAU / 9 + s) * 1.4; E = [s * (sx + u * 0.55), shY - u * 0.5, 1]; W = [s * (sx + u * 0.72 + wv), shY - u * 0.55 - f * 0.86, 2]; hand = 'open'; break; }
      case 'point': if (isP) { const fr = Math.pow(Math.max(0, cs), 8), as = Math.abs(sn); E = [s * (sx + u * 0.45 * fr + 1), shY + u * 0.42, u * 0.3 + u * 0.4 * as]; W = [s * (sx * 0.6 + (u * 0.5 + f * 0.75) * fr + 1), shY + u * 0.28, u * 0.3 + (u * 0.4 + f * 1.1) * as]; hand = 'point'; } else hip(); break;
      case 'facepalm': if (isP) { E = [s * (sx + 1), shY + u * 0.75, u * 0.6]; W = [s * 1.2, headY + R * 0.05, R * 1.05]; hand = 'flat'; } else relax(); break;
      case 'shrug': E = [s * (sx + u * 0.6), shY + u * 0.72, 1]; W = [s * (sx + u * 0.6 + f * 0.72), shY + u * 0.5, 2.5]; hand = 'palmUp'; break;
      case 'hold': if (isP) { E = [s * (sx + 0.8), shY + u * 0.88, u * 0.3]; W = [s * (sx - 0.8), shY + u * 0.86 - f * 0.12, u * 0.3 + f * 0.85]; hand = 'grip'; } else relax(); break;
      case 'holdUp': if (isP) { E = [s * (sx + u * 0.5), shY - u * 0.38, 1.5]; W = [s * (sx + u * 0.5), shY - u * 0.45 - f * 0.9, 2.5]; hand = 'grip'; } else hip(); break;
      case 'phone': E = [s * (sx + 0.4), shY + u * 0.92, 2]; W = [s * 2.4, shY + u * 0.72, u * 0.3 + f * 0.62]; hand = 'grip'; break;
      case 'typing': E = [s * (sx + 0.5), shY + u * 0.9, 2]; W = [s * 2.0, shY + u * 0.8, u * 0.3 + f * 0.6]; hand = 'thumbs'; break;
      case 'armsCrossed': E = [s * (sx + 1.3), shY + u * 0.78, 2.2]; W = [-s * (sx * 0.5), shY + u * 0.6 + (s > 0 ? 0.6 : -0.6), B.sd + 1.8]; hand = 'tuck'; break;
      case 'sit': E = [s * (sx + 1.4), shY + u * 0.92, 1.5]; W = [s * (sx - 0.4), shY + u + f * 0.5, f * 0.55]; hand = 'relax'; break;
      case 'lookUp': E = [s * (sx + 1.3), shY + u * 0.98, -1.2]; W = [s * (sx + 1.7), shY + u + f * 0.95, -0.8]; hand = 'relax'; break;
      case 'salute': if (isP) { E = [s * (sx + u * 0.78), shY + u * 0.22, 2]; W = [s * R * 0.7, headY - R * 0.38, R * 1.05]; hand = 'flat'; } else { E = [s * (sx + 0.7), shY + u, 0]; W = [s * (sx + 0.8), shY + u + f, 0.3]; hand = 'relax'; } break;
      case 'bow': E = [s * (sx + 0.4), shY + u * 0.97, 1.6]; W = [s * (sx - 0.6), shY + u + f * 0.92, 3.4]; hand = 'flat'; break;
      case 'tiptoe': { const bb = Math.sin(wph + s) * 0.6; E = [s * (sx + 2.2), shY + u * 0.78, -0.5]; W = [s * (sx + 1.6), shY + u * 0.45 + bb, f * 0.75]; hand = 'open'; wrist = -s * 2.5; break; }
      case 'crackEgg': { const ph = (t % 36) / 36, tap = ph < 0.12 ? Math.sin(ph / 0.12 * Math.PI) * 1.4 : 0; E = [s * (sx + 1.3), shY + u * 0.88, 1.5]; W = [s * (1.5 + tap * 0.5), shY + u * 0.6 - tap, u * 0.3 + f * 0.7]; hand = 'grip'; break; }
      case 'stir': if (isP) { const a = t * TAU / 22; E = [s * (sx + 1.8), shY + u * 0.82, u * 0.35]; W = [s * sx * 0.35 + Math.cos(a) * 2.4, shY + u * 0.9 + Math.sin(a) * 0.6, u * 0.35 + f * 0.72 + Math.sin(a) * 1.4]; hand = 'grip'; } else hip(); break;
      case 'fanSmoke': if (isP) { const a = Math.sin(t * TAU / 10); E = [s * (sx + u * 0.72), shY + u * 0.1, 1.5]; W = [s * (sx + u * 0.55) + a * 3.6, shY - u * 0.15 - f * 0.78, 2.5]; hand = 'open'; wrist = a * 0.5; } else { E = [s * (sx + 1.4), shY + u * 0.72, u * 0.55]; W = [s * 0.7, headY + R * 0.62, R * 1.2]; hand = 'fist'; } break;
      case 'fall': { const a1 = t * TAU / 8 + (s > 0 ? 0 : 2.2); E = [s * (sx + u * 0.75), shY - u * 0.05 + Math.sin(a1) * 2.5, 1]; W = [s * (sx + u * 0.85 + Math.cos(a1) * 3), shY - u * 0.45 - f * 0.55 + Math.sin(a1 + 1) * 3.5, 2]; hand = 'open'; break; }
      case 'proudChest': hip(); break;
      default: relax();
    }
    z.arms.push({ s, isP, S: S0, E, W, hand, wrist });
  }
  return z;
}
function boneLerp(S0, E0, S1, E1, Sn, u) { // interpolate a bone by in-plane angle (shortest way), length and depth
  const v0x = E0[0] - S0[0], v0y = E0[1] - S0[1], v1x = E1[0] - S1[0], v1y = E1[1] - S1[1];
  const a0 = Math.atan2(v0y, v0x), a1 = Math.atan2(v1y, v1x); let da = a1 - a0; da = Math.atan2(Math.sin(da), Math.cos(da));
  const a = a0 + da * u, l = lerp(Math.hypot(v0x, v0y), Math.hypot(v1x, v1y), u);
  return [Sn[0] + Math.cos(a) * l, Sn[1] + Math.sin(a) * l, Sn[2] + lerp(E0[2] - S0[2], E1[2] - S1[2], u)];
}
const l3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
function blendRaw(a, b, u) {
  const n = { pose: u < 0.5 ? a.pose : b.pose };
  for (const k of ['jumpU', 'bob', 'lean', 'shUp', 'dip', 'nod', 'pitch', 'roll', 'hz', 'hy', 'bodyRot', 'spin', 'sit', 'ubL', 'ub', 'shY', 'headY']) n[k] = lerp(a[k], b[k], u);
  n.look = a.look || b.look ? [lerp((a.look || [0, 0])[0], (b.look || [0, 0])[0], u), lerp((a.look || [0, 0])[1], (b.look || [0, 0])[1], u)] : null;
  n.legs = a.legs.map((la, i) => { const lb = b.legs[i], hip = l3(la.hip, lb.hip, u), knee = boneLerp(la.hip, la.knee, lb.hip, lb.knee, hip, u); return { s: la.s, hip, knee, ank: boneLerp(la.knee, la.ank, lb.knee, lb.ank, knee, u), tip: lerp(la.tip, lb.tip, u) }; });
  n.arms = a.arms.map((aa, i) => { const ab = b.arms[i], S = l3(aa.S, ab.S, u), E = boneLerp(aa.S, aa.E, ab.S, ab.E, S, u); return { s: aa.s, isP: aa.isP, S, E, W: boneLerp(aa.E, aa.W, ab.E, ab.W, E, u), hand: u < 0.5 ? aa.hand : ab.hand, wrist: lerp(aa.wrist, ab.wrist, u) }; });
  return n;
}
const rot2 = (p, c, a) => { const x = p[0] - c[0], y = p[1] - c[1], cs = Math.cos(a), sn = Math.sin(a); return [c[0] + x * cs - y * sn, c[1] + x * sn + y * cs, p[2]]; };

function rig(C, o) {
  const B = C.body, H = C.head, t = o.t || 0;
  const th = typeof o.view === 'number' ? o.view : (VIEWS[o.view] ?? 0);
  const sn = Math.sin(th), cs = Math.cos(th);
  const pj = (x, y, z) => ({ x: x * cs + z * sn, y, d: -x * sn + z * cs });
  const ps = (th > 0.01 && th < 3) ? -1 : 1; // prop arm side: the near arm in R views
  const V = { th, sn, cs, ps };
  const fix = (p) => (!p || p === 'stand') && C.defPose ? C.defPose : (p || 'stand');
  let z = poseRaw(C, o, fix(o.pose), t, V), pose2 = null;
  if (o.pose2 && o.mix > 0) { pose2 = fix(o.pose2); z = blendRaw(z, poseRaw(C, o, pose2, t, V), cl(o.mix, 0, 1)); }
  const exn = exprResolve(C, o), rg = o.rig || {};
  for (const a of z.arms) {
    const key = a.s < 0 ? 'L' : 'R';
    const sh = (rg['shoulder' + key] || 0) * D2R * -a.s, el = (rg['elbow' + key] || 0) * D2R * -a.s;
    if (sh) { a.E = rot2(a.E, a.S, sh); a.W = rot2(a.W, a.S, sh); }
    if (el) a.W = rot2(a.W, a.E, el);
    a.wrist = (a.wrist || 0) + (rg['wrist' + key] || 0) * D2R * -a.s;
  }
  const turn = cl(rg.headTurn || 0, -1, 1), hth = th + turn * HP;
  const nodA = rg.headNod || 0;
  const head = { x: (z.lean + z.hz) * sn, y: z.headY + nodA * 0.8, R: H.R, pitch: z.pitch + (exn.pitch || 0) + nodA * 0.25, roll: z.roll + (exn.roll || 0) + (rg.headTilt || 0) * D2R, th: hth, turn: hth };
  const hipShift = rg.hipShift || 0;
  const legs = z.legs.map((l) => { const hip = pj(...l.hip), knee = pj(...l.knee), ank = pj(...l.ank); hip.x += hipShift; knee.x += hipShift * 0.5; return { s: l.s, hip, knee, ank, lift: l.ank[1] - B.footY - z.jumpU, tip: l.tip, d: -l.s * B.hipX * sn }; });
  const arms = z.arms.map((a) => { const p = [pj(...a.S), pj(...a.E), pj(...a.W)]; return { s: a.s, isP: a.isP, pts: p, hand: a.hand, wrist: a.wrist, d: (p[0].d + p[1].d + p[2].d) / 3 }; });
  const kpx = (o.h || 100) / 100, sq = cl(rg.squash || 0, -0.3, 0.3);
  const g = { jy: -(rg.jump || 0) / kpx, sx: 1 + sq * 0.6, sy: 1 - sq, spin: z.spin * D2R };
  const up = { shift: hipShift, ang: (z.bodyRot * sn + (rg.bodyLean || 0)) * D2R, piv: B.hipY + z.ubL };
  const world = (x, y, upper = true) => {
    let X = x, Y = y;
    if (upper) { const c = Math.cos(up.ang), s = Math.sin(up.ang), dy = Y - up.piv; X = x * c - dy * s + up.shift; Y = up.piv + x * s + dy * c; }
    if (g.spin) { const c = Math.cos(g.spin), s = Math.sin(g.spin), dy = Y + 45; const nx = X * c - dy * s; Y = -45 + X * s + dy * c; X = nx; }
    return { x: X * g.sx, y: Y * g.sy + g.jy };
  };
  return { C, B, th, sn, cs, pj, t, seed: o.seed || 0, pose: z.pose, pose2, shY: z.shY, ub: z.ub, lean: z.lean, head, legs, arms, ps, jump: z.jumpU, exn, sit: z.sit >= 0.5, look: z.look, up, g, world, lift: Math.max(0, -z.jumpU - g.jy) };
}

// secondary motion: spring-filtered head velocity (from history of the same options at t-k, or o.track(t))
function secondary(C, o, r) {
  const out = { x: 0, y: 0, blink: 0 };
  if (o.secondary === false) return out;
  const t = o.t || 0, N = 9, hist = [];
  for (let k = 0; k <= N + 1; k++) {
    const rr = k === 0 ? r : rig(C, o.track ? { ...o, ...o.track(t - k), t: t - k } : { ...o, t: t - k });
    const p = rr.world(rr.head.x, rr.head.y, true); hist.push({ x: p.x, y: p.y, turn: rr.head.turn });
  }
  let rx = 0, ry = 0, ws = 0;
  for (let k = 0; k <= N; k++) { const w = Math.exp(-k / 2.6) * Math.cos(k * 0.75); ws += w; rx += (hist[k].x - hist[k + 1].x + (hist[k].turn - hist[k + 1].turn) * r.head.R * 0.45) * w; ry += (hist[k].y - hist[k + 1].y) * w; }
  if (o.vel) { const kp = (o.h || 100) / 100; rx += (o.vel.x || 0) / kp * ws; ry += (o.vel.y || 0) / kp * ws; }
  const lim = r.head.R * 0.5; let sx = -rx * 0.8, sy = -ry * 0.8; const m = Math.hypot(sx, sy); if (m > lim) { sx *= lim / m; sy *= lim / m; }
  out.x = sx; out.y = sy;
  let cnt = 0; while (cnt < N && Math.abs(hist[cnt].turn - hist[cnt + 1].turn) > 0.045) cnt++;
  if (cnt >= 1 && cnt <= 4) out.blink = [0.6, 1, 1, 0.5][cnt - 1];
  return out;
}

// ---------------------------------------------------------------- bounds
export function bounds(name, o) {
  const C = DEF[name] || DEF.SAM, r = rig(C, o), k = o.h / 100;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  const add = (x, y, m = 0, upper = true) => { const p = r.world(x, y, upper); x0 = Math.min(x0, p.x - m); x1 = Math.max(x1, p.x + m); y0 = Math.min(y0, p.y - m); y1 = Math.max(y1, p.y + m); };
  for (const l of r.legs) { add(l.ank.x, l.ank.y - r.B.footY, 6, false); add(l.knee.x, l.knee.y, 4, false); }
  for (const a of r.arms) for (const p of a.pts) add(p.x, p.y, 4.5);
  add(0, r.shY, r.B.sx + 2); add(0, r.B.hemY + r.ub, r.B.hemX + 1);
  const R = r.head.R; add(r.head.x, r.head.y, R * 1.3);
  const hat = C.hat ? R * (C.hat.type === 'tall' ? 2.25 + 1.4 : C.hat.type === 'flop' ? 2.6 : 1.45) : R * 1.35;
  add(r.head.x, r.head.y - hat);
  const hp = r.arms.find((a) => a.isP).pts[2], hw = r.world(hp.x, hp.y), hd = r.world(r.head.x, r.head.y);
  const X = (v) => o.x + v * k, Y = (v) => o.y + v * k;
  return { x0: X(x0), y0: Y(y0), x1: X(x1), y1: Y(y1), x: X(x0), y: Y(y0), w: (x1 - x0) * k, h: (y1 - y0) * k, head: { x: X(hd.x), y: Y(hd.y), r: R * k }, hand: { x: X(hw.x), y: Y(hw.y) } };
}

// ---------------------------------------------------------------- main
export function drawChar(ctx, name, o) {
  const C = DEF[name]; if (!C) return;
  o = o || {};
  if (o.rim && !o.light) { const rm = typeof o.rim === 'string' ? { col: o.rim === 'cool' ? '#8fd0ff' : '#ffb04a', dir: o.rim === 'cool' ? 1 : -1 } : o.rim; o = { ...o, light: { amt: 1, tint: 0, ...rm } }; }
  const r = rig(C, o), k = o.h / 100;
  const hEq = o.h / C.relH;
  const lwPx = 8 * Math.pow(Math.max(hEq, 60) / 900, 0.62);
  const S = { lw: lwPx / k, sd: o.light && o.light.dir ? -o.light.dir : 1, k };
  TX = { on: o.texture === false ? 0 : 1, u: S.lw * 1.15 };
  const soot = cl((C.sootBase || 0) + (o.soot || 0), 0, 1.4);
  const st = { r, S, C, o, t: o.t || 0, seed: o.seed || 0, soot, lwPx, sec: secondary(C, o, r) };
  ctx.save(); ctx.translate(o.x, o.y); ctx.scale(k, k);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (o.shadow !== false) contactShadow(ctx, st);
  ctx.translate(0, r.g.jy); ctx.scale(r.g.sx, r.g.sy);
  if (r.g.spin) { ctx.translate(0, -45); ctx.rotate(r.g.spin); ctx.translate(0, 45); }
  const upper = () => { ctx.translate(r.up.shift, 0); if (r.up.ang) { ctx.translate(0, r.up.piv); ctx.rotate(r.up.ang); ctx.translate(0, -r.up.piv); } };
  const back = r.arms.filter((a) => a.d < -1.5), front = r.arms.filter((a) => a.d >= -1.5);
  if (r.pose === 'armsCrossed') front.sort((a, b) => a.s - b.s);
  ctx.save(); upper(); for (const a of back) drawArm(ctx, st, a); ctx.restore();
  drawLegs(ctx, st);
  ctx.save(); upper();
  drawTorso(ctx, st);
  const raised = RAISED[r.pose];
  if (!raised) for (const a of front) drawArm(ctx, st, a);
  const hr = { ...r, th: r.head.th, sn: Math.sin(r.head.th), cs: Math.cos(r.head.th) };
  drawHead(ctx, { ...st, r: hr });
  if (raised) for (const a of front) drawArm(ctx, st, a);
  ctx.restore();
  ctx.restore();
}
function contactShadow(ctx, st) {
  const { r } = st, B = r.B, lift = r.lift, f = 1 - Math.min(0.55, lift * 0.06), w = (B.hemX + 4) * f;
  ctx.save(); ctx.scale(1, 0.2);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 1.3);
  g.addColorStop(0, `rgba(20,12,35,${0.3 * f})`); g.addColorStop(0.6, `rgba(20,12,35,${0.2 * f})`); g.addColorStop(1, 'rgba(20,12,35,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, w * 1.3, 0, TAU); ctx.fill(); ctx.restore();
  if (lift < 1.5) { ctx.fillStyle = `rgba(20,12,35,${0.22 * (1 - lift / 1.5)})`; for (const l of r.legs) { if (l.ank.y < r.B.footY + r.jump - 2.5) continue; ctx.beginPath(); ctx.ellipse(l.ank.x + r.sn * 1.8, 0, 4.6, 1.0, 0, 0, TAU); ctx.fill(); } }
}

// ---------------------------------------------------------------- legs & shoes
function drawLegs(ctx, st) {
  const { r, S, C } = st, B = r.B, pa = C.pants;
  const legs = [...r.legs].sort((a, b) => a.d - b.d);
  const pelvis = () => { const w = Math.hypot((B.hipX + B.legW * 0.5) * r.cs, (B.hemD - 1) * r.sn); const y = r.legs[0].hip.y; return { p: rrect(-w + r.up.shift, y - 4, 2 * w, 7.5, 3.2), c: pa.c, s: pa.s, tx: pa.tx, ta: pa.ta }; };
  const sideish = Math.abs(r.sn) > 0.35;
  const groups = sideish ? [[legs[0]], [legs[1]]] : [legs];
  groups.forEach((g, gi) => {
    const items = [];
    for (const l of g) {
      const pts = [l.hip, l.knee, l.ank];
      if (pa.len >= 1) items.push({ pts, w: B.legW, c: pa.c, s: pa.s, tx: pa.tx, ta: pa.ta, tu: pa.tx === 'twill' ? TX.u * 1.1 : 0 });
      else items.push({ pts, w: B.legW, c: C.skin, s: C.skinS });
    }
    if (gi === groups.length - 1) items.unshift(pelvis());
    G(ctx, S, items);
    for (const l of g) {
      const pts = [l.hip, l.knee, l.ank];
      if (pa.len < 1) { // shorts + socks
        if (pa.sock) { const sk = along([l.ank, l.knee], 0.3); G(ctx, S, [{ pts: sk, w: B.legW + 0.4, c: pa.sock, s: pa.sockS }]); const m = along([l.ank, l.knee], 0.2).pop(), m2 = along([l.ank, l.knee], 0.25).pop(); line(ctx, S, [P(m.x - B.legW * 0.55, m.y), P(m.x + B.legW * 0.55, m.y)], 0.7, '#3fb6a8'); line(ctx, S, [P(m2.x - B.legW * 0.55, m2.y), P(m2.x + B.legW * 0.55, m2.y)], 0.7, '#e2622f'); }
        const sp = along(pts, pa.len); G(ctx, S, [{ pts: sp, w: B.legW + pa.wide, c: pa.c, s: pa.s, tx: pa.tx, ta: pa.ta }]);
        if (pa.stripe) { const q = sp.map((p) => P(p.x + (l.s * (B.legW + pa.wide) * 0.36) * r.cs, p.y)); line(ctx, S, q, 0.9, pa.stripe); }
        const e = sp[sp.length - 1]; stitch(ctx, S, [P(e.x - (B.legW + pa.wide) * 0.45, e.y - 1.1), P(e.x + (B.legW + pa.wide) * 0.45, e.y - 1.1)], pa.s);
      } else {
        if (pa.denim) { // outer seam + double top-stitch
          const off = l.s * B.legW * 0.3 * Math.abs(r.cs) * (r.cs < 0 ? -1 : 1);
          const q = pts.map((p) => P(p.x + off, p.y)); q[0] = P(q[0].x, q[0].y + 2); q[2] = along([l.ank, l.knee], 0.12).pop(); q[2] = P(q[2].x + off, q[2].y);
          line(ctx, S, q, 0.38, pa.s); stitch(ctx, S, q.map((p) => P(p.x - l.s * 0.45, p.y)), pa.denim, 0.26);
          const kn = l.knee; ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = '#9fb7e6'; ctx.beginPath(); ctx.ellipse(kn.x - S.sd * 0.8, kn.y - 3, 1.2, 3.2, 0, 0, TAU); ctx.fill(); ctx.restore();
        }
        if (pa.cuff) { const a = along([l.ank, l.knee], 0.12); G(ctx, S, [{ pts: a, w: B.legW + 0.9, c: pa.cuff, s: pa.s }]); if (pa.denim) { const m = a[a.length - 1]; stitch(ctx, S, [P(m.x - B.legW * 0.5, m.y + 0.6), P(m.x + B.legW * 0.5, m.y + 0.6)], pa.denim, 0.26); } }
      }
      if (pa.check) { const m = along(pts, 0.5).pop(); line(ctx, S, [P(m.x - 1, m.y - 6), P(m.x - 1, m.y + 8)], 0.35, '#4a4858'); }
      drawShoe(ctx, st, l);
    }
  });
}
function drawShoe(ctx, st, l) {
  const { r, S, C } = st, sh = C.shoes, A = l.ank;
  const sa = Math.abs(r.sn), dir = r.sn >= 0 ? 1 : -1, back = r.cs < -0.3;
  const gy = A.y - r.B.footY;
  const cx = A.x + r.sn * 1.8, hl = lerp(3.4, 5.4, sa) * (sh.type === 'clog' ? 1.08 : 1);
  const tilt = cl(l.lift > 0.3 ? -l.lift * 0.05 * dir : 0, -0.6, 0.6);
  ctx.save(); ctx.translate(cx, gy); ctx.rotate(tilt);
  if (l.tip > 0.01) { const tx = hl * 0.9 * dir; ctx.translate(tx, 0); ctx.rotate(-dir * 0.5 * l.tip * sa); ctx.translate(-tx, 0); }
  if (sh.type === 'slide') {
    const sole = rrect(-hl - 0.4, -1.3, 2 * hl + 0.8, 1.6, 0.8);
    const foot = spl([[-hl * 0.8 * dir, -1.2], [-hl * 0.5 * dir, -3.4], [hl * 0.3 * dir, -2.8], [hl * 0.95 * dir, -1.4], [0, -0.9]]);
    G(ctx, S, [{ p: foot, c: C.skin, s: C.skinS }]); G(ctx, S, [{ p: sole, c: sh.sole }]);
    const band = spl([[(-hl * 0.15) * dir - 2.1 * (1 - sa), -1.2], [(hl * 0.05) * dir, -3.6], [(hl * 0.55) * dir + 2.1 * (1 - sa), -2.7], [(hl * 0.5) * dir, -1.2]]);
    G(ctx, S, [{ p: band, c: sh.c, s: sh.s }]);
  } else {
    const ht = sh.type === 'flat' ? 2.8 : sh.type === 'clog' ? 4.4 : 4.6;
    const pts = sa < 0.2 || back
      ? [[-hl, -0.2], [-hl * 1.02, -ht * 0.6], [-hl * 0.55, -ht], [hl * 0.55, -ht], [hl * 1.02, -ht * 0.6], [hl, -0.2], [0, 0.15]]
      : [[-hl * dir, -0.2], [-hl * 1.0 * dir, -ht * 0.8], [-hl * 0.55 * dir, -ht * 1.02], [-hl * 0.05 * dir, -ht * 0.92], [hl * 0.6 * dir, -ht * 0.62], [hl * 1.03 * dir, -ht * 0.3], [hl * dir, -0.2], [0, 0.1]];
    const p = spl(pts);
    G(ctx, S, [{ p, c: sh.c, s: sh.s, o: 1.2, oy: 0.4 }]);
    ctx.save(); ctx.clip(p);
    ctx.fillStyle = sh.sole; ctx.fillRect(-20, -1.4, 40, 3);
    if (sh.type === 'sneaker') {
      ctx.fillStyle = sh.sole;
      if (sa > 0.2 && !back) { ctx.beginPath(); ctx.ellipse(hl * 0.95 * dir, -1.2, hl * 0.42, 2.2, 0, 0, TAU); ctx.fill(); line(ctx, S, [P(hl * 0.55 * dir, -2.9), P(hl * 0.5 * dir, -1.5)], 0.5); ctx.beginPath(); ctx.arc(-hl * 0.35 * dir, -2.5, 1.05, 0, TAU); ctx.fill(); ctx.lineWidth = S.lw * 0.5; ctx.stroke(); stitch(ctx, S, [P(-hl * dir, -2.1), P(hl * 0.4 * dir, -2.1)], sh.s, 0.25); }
      else if (!back) { ctx.beginPath(); ctx.ellipse(0, -0.8, hl * 0.75, 2.0, 0, 0, TAU); ctx.fill(); for (let i = 0; i < 2; i++) line(ctx, S, [P(-1.1, -ht * 0.62 - i * 1.1), P(1.1, -ht * 0.62 - i * 1.1)], 0.45, '#fff'); }
      else { ctx.beginPath(); ctx.ellipse(0, -2.6, 1.3, 1.6, 0, 0, TAU); ctx.fill(); }
    }
    line(ctx, S, [P(-20, -1.4), P(20, -1.4)], 0.55);
    ctx.restore();
    ctx.lineWidth = S.lw; ctx.strokeStyle = INK; ctx.stroke(p);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- arms & hands & props
function drawArm(ctx, st, a) {
  const { r, S, C, o } = st, B = r.B, sl = C.sleeve;
  const [Sh, E, W] = a.pts;
  const dx = W.x - E.x, dy = W.y - E.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  const hs_ = B.armW * 0.5 * (C.hat && C.hat.type === 'flop' ? 0.85 : 1);
  const propName = o.prop || DEF_PROP[r.pose];
  const two = TWO_HAND[r.pose];
  const prop = a.isP && propName && PROP_POSES[r.pose] && !(r.pose === 'fanSmoke' && propName !== 'towel') ? propName : null;
  const handPos = P(W.x + ux * hs_ * 0.9, W.y + uy * hs_ * 0.9);
  const doHand = () => {
    if (a.hand === 'tuck') return;
    if (prop) drawProp(ctx, st, prop, handPos, a, r.pose);
    if (two && a.s === 1) { const m = P((r.arms[0].pts[2].x + r.arms[1].pts[2].x) / 2, (r.arms[0].pts[2].y + r.arms[1].pts[2].y) / 2 - 1.2); drawProp(ctx, st, r.pose === 'crackEgg' ? (o.prop || 'egg') : (o.prop || 'phone'), r.pose === 'crackEgg' ? P(m.x, m.y + 2.6) : m, a, r.pose === 'crackEgg' ? 'hold' : 'phone'); }
    drawHand(ctx, st, W, ux, uy, prop && a.hand === 'relax' ? 'grip' : a.hand, hs_, a);
  };
  const crease = (w) => { if (Math.abs((Sh.x - E.x) * uy - (Sh.y - E.y) * ux) < 2) return; const nx = -uy, ny = ux; tline(ctx, [P(E.x + nx * w * 0.15 - ux * 1.2, E.y + ny * w * 0.15 - uy * 1.2), P(E.x + ux * 0.6, E.y + uy * 0.6)], S.lw * 0.45, sl.s, 0.2, 0.2); };
  if (sl.len > 1) { // too-long sleeves
    doHand();
    const ext = P(W.x + ux * 2.2, W.y + uy * 2.2);
    G(ctx, S, [{ pts: [Sh, E, ext], w: B.armW + (sl.wide || 0), c: sl.c, s: sl.s, tx: sl.tx, ta: sl.ta, ht: sl.ht }]);
    const c1 = P(ext.x - ux * 1.4, ext.y - uy * 1.4), nx = -uy, ny = ux, hw = (B.armW + (sl.wide || 0)) * 0.5;
    line(ctx, S, [P(c1.x + nx * hw, c1.y + ny * hw), P(c1.x - nx * hw, c1.y - ny * hw)], 0.5); crease(B.armW + (sl.wide || 0));
    return;
  }
  if (sl.len < 1) {
    G(ctx, S, [{ pts: [Sh, E, W], w: B.armW, c: C.skin, s: C.skinS }]);
    const sp = along([Sh, E, W], sl.len); G(ctx, S, [{ pts: sp, w: B.armW + (sl.wide || 0), c: sl.c, s: sl.s, tx: sl.tx, ta: sl.ta }]);
    const e = sp[sp.length - 1], q = sp[sp.length - 2], vx = e.x - q.x, vy = e.y - q.y, vl = Math.hypot(vx, vy) || 1, hw = (B.armW + (sl.wide || 0)) * 0.42;
    stitch(ctx, S, [P(e.x - vx / vl * 1.1 - vy / vl * hw, e.y - vy / vl * 1.1 + vx / vl * hw), P(e.x - vx / vl * 1.1 + vy / vl * hw, e.y - vy / vl * 1.1 - vx / vl * hw)], C.top.stitch || sl.s);
  } else {
    G(ctx, S, [{ pts: [Sh, E, W], w: B.armW, c: sl.c, s: sl.s, tx: sl.tx, ta: sl.ta, ht: sl.ht }]);
    crease(B.armW);
    if (sl.cuff) { const c1 = P(W.x - ux * 1.5, W.y - uy * 1.5), nx = -uy, ny = ux, hw = B.armW * 0.5; line(ctx, S, [P(c1.x + nx * hw, c1.y + ny * hw), P(c1.x - nx * hw, c1.y - ny * hw)], 0.55); const c2 = P(c1.x - ux * 0.7, c1.y - uy * 0.7); stitch(ctx, S, [P(c2.x + nx * hw * 0.8, c2.y + ny * hw * 0.8), P(c2.x - nx * hw * 0.8, c2.y - ny * hw * 0.8)], C.top.stitch || sl.s); }
  }
  if (st.soot > 0.3 && a.s === 1) sootDots(ctx, st, E.x, E.y, 2.2, 2, 50);
  doHand();
}
function drawHand(ctx, st, W, ux, uy, type, hs_, a) {
  const { S, C, t } = st; const r = hs_ * 1.0;
  const cx = W.x + ux * r * 0.9, cy = W.y + uy * r * 0.9, ang = Math.atan2(uy, ux) + ((a && a.wrist) || 0);
  const nails = st.lwPx > 11;
  const fing = (n, len, spread, base = 0, w = r * 0.62) => { const out = []; for (let i = 0; i < n; i++) { const tt = n === 1 ? 0 : i / (n - 1) - 0.5; const an = ang + base + tt * spread; const sx = cx + Math.cos(an) * r * 0.55, sy = cy + Math.sin(an) * r * 0.55; out.push({ pts: [P(sx, sy), P(sx + Math.cos(an) * len, sy + Math.sin(an) * len)], w, c: C.skin, an }); } return out; };
  const side = (a && a.s) || 1;
  let thumbA = ang - HP * side * (st.r.sn > 0.3 ? -1 : 1) * 0.9;
  if (type === 'thumbs') thumbA += Math.sin(t * 1.3 + side * 1.9) * 0.45 - side * 0.3;
  const thumb = { pts: [P(cx, cy), P(cx + Math.cos(thumbA) * r * 1.05, cy + Math.sin(thumbA) * r * 1.05)], w: r * 0.7, c: C.skin, an: thumbA };
  const palm = { p: ell(cx, cy, r * 1.0, r * 0.95, ang), c: C.skin, s: C.skinS, o: r * 0.35, oy: r * 0.2, ht: 0.6 };
  const nail = (f) => { if (!nails) return; const e = f.pts[1], an = f.an, w = f.w; const p = ell(e.x - Math.cos(an) * w * 0.22, e.y - Math.sin(an) * w * 0.22, w * 0.27, w * 0.2, an); ctx.fillStyle = C.nail || '#f2d4c4'; ctx.fill(p); ctx.lineWidth = S.lw * 0.3; ctx.strokeStyle = INK; ctx.stroke(p); };
  let fs = [];
  if (type === 'open' || type === 'flat' || type === 'palmUp') { fs = fing(4, r * 1.25, type === 'flat' ? 0.55 : 1.0, type === 'palmUp' ? -0.5 * side : 0); G(ctx, S, [palm, ...fs, thumb]); }
  else if (type === 'point') { fs = fing(1, r * 1.9, 0); G(ctx, S, [palm, ...fs, thumb]); }
  else {
    G(ctx, S, [palm, thumb]);
    if (type !== 'relax') for (let i = 0; i < 2; i++) { const off = (i - 0.5) * r * 0.55; const px = cx + Math.cos(ang + HP) * off, py = cy + Math.sin(ang + HP) * off; line(ctx, S, [P(px + Math.cos(ang) * r * 0.25, py + Math.sin(ang) * r * 0.25), P(px + Math.cos(ang) * r * 0.75, py + Math.sin(ang) * r * 0.75)], 0.45); }
  }
  for (const f of fs) nail(f); if (type === 'thumbs' || type === 'point' || type === 'open') nail(thumb);
}
function drawProp(ctx, st, prop, at, a, pose) {
  const { S, C, o, r, t } = st; const ps = 1 / C.relH;
  ctx.save(); ctx.translate(at.x, at.y); ctx.scale(ps, ps);
  const glow = o.phoneGlow || 0;
  if (prop === 'phone') {
    if (pose === 'phone') {
      const w = lerp(5.6, 1.6, Math.abs(r.sn)), hgt = 9.6; ctx.rotate(-0.25 * Math.sign(r.sn || 0)); ctx.translate(0, -1.5);
      if (glow > 0) { ctx.fillStyle = `rgba(150,215,255,${0.28 * glow})`; ctx.beginPath(); ctx.ellipse(r.sn * 3, -hgt * 0.6, 7, 6, 0, 0, TAU); ctx.fill(); }
      G(ctx, S, [{ p: rrect(-w / 2, -hgt, w, hgt, 1.3), c: '#2d2840', s: '#1f1b2e', o: 0.6, ht: 0 }]);
      if (Math.abs(r.sn) < 0.6) { ctx.fillStyle = '#4a4560'; ctx.beginPath(); ctx.roundRect(-w / 2 + 0.7, -hgt + 0.7, 2.2, 2.2, 0.6); ctx.fill(); ctx.fillStyle = '#6a6582'; ctx.beginPath(); ctx.arc(-w / 2 + 1.35, -hgt + 1.35, 0.5, 0, TAU); ctx.fill(); }
      if (Math.abs(r.sn) > 0.5) { ctx.fillStyle = glow > 0 ? '#bfe8ff' : '#8fd3ff'; ctx.fillRect(r.sn > 0 ? w / 2 - 0.5 : -w / 2, -hgt + 0.8, 0.5, hgt - 1.6); }
    } else {
      const w = 5.6, hgt = 10; ctx.translate(0, -hgt * 0.45);
      G(ctx, S, [{ p: rrect(-w / 2, -hgt / 2, w, hgt, 1.3), c: '#2d2840' }]);
      ctx.fillStyle = glow > 0 ? '#bfe8ff' : '#8fd3ff'; ctx.beginPath(); ctx.roundRect(-w / 2 + 0.6, -hgt / 2 + 0.6, w - 1.2, hgt - 1.2, 0.8); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-w / 2 + 1.2, -hgt / 2 + 2, w - 2.4, 1.2); ctx.fillStyle = '#4d7cff'; ctx.fillRect(-w / 2 + 1.2, -hgt / 2 + 4, w - 3.2, 1); ctx.fillRect(-w / 2 + 1.2, -hgt / 2 + 5.6, w - 2.4, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(-w / 2 + 0.6, -hgt / 2 + 0.6); ctx.lineTo(0, -hgt / 2 + 0.6); ctx.lineTo(-w / 2 + 0.6, 0); ctx.fill();
      ctx.fillStyle = '#2d2840'; ctx.fillRect(-0.9, -hgt / 2 + 0.7, 1.8, 0.5);
    }
  } else if (prop === 'egg') {
    ctx.translate(0, -3.4);
    G(ctx, S, [{ p: ell(0, 0, 2.9, 3.7), c: '#fbf3e3', s: '#e2d3b8', o: 0.9, oy: 0.4 }]);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(-1.1, -1.5, 0.6, 1, -0.4, 0, TAU); ctx.fill();
    ctx.fillStyle = '#d9c7a6'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(lerp(-1.6, 1.8, hs(i + 40)), lerp(-1.5, 2.4, hs(i + 44)), 0.18, 0, TAU); ctx.fill(); }
  } else if (prop === 'pot') {
    const dir = Math.abs(r.sn) > 0.3 ? Math.sign(r.sn) : a.s;
    const ox = dir * 13;
    G(ctx, S, [{ pts: [P(0, 0), P(dir * 5.5, -1.2)], w: 1.8, c: '#2b2735' }]);
    const body = rrect(ox - 7, -6, 14, 8.5, 2.2);
    G(ctx, S, [{ p: body, c: '#a3adbf', s: '#78829a', o: 2.4, oy: 0 }]);
    G(ctx, S, [{ p: ell(ox, -6, 7.6, 1.6), c: '#c8d0dd' }]);
    ctx.fillStyle = '#5c6478'; ctx.beginPath(); ctx.ellipse(ox, -6, 6.2, 0.9, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#e6ebf2'; ctx.fillRect(ox - 5.5, -4.5, 1, 5);
  } else if (prop === 'noodlecup') {
    ctx.translate(0, -1.2);
    const cup = poly([[-3.6, -9], [3.6, -9], [2.7, 0], [-2.7, 0]]);
    G(ctx, S, [{ p: cup, c: '#f7f3ea', s: '#dcd5c6', o: 1, oy: 0 }]);
    ctx.save(); ctx.clip(cup); ctx.fillStyle = '#e2453c'; ctx.fillRect(-5, -6.6, 10, 3.4); ctx.fillStyle = '#ffd43b';
    ctx.beginPath(); for (let i = 0; i < 4; i++) ctx.arc(-1.8 + i * 1.2, -5, 0.45, 0, TAU); ctx.fill(); ctx.restore();
    line(ctx, S, [P(-3.3, -6.6), P(3.3, -6.6)], 0.4); line(ctx, S, [P(-3, -3.2), P(3, -3.2)], 0.4);
    G(ctx, S, [{ p: poly([[-4.1, -9.6], [4.1, -9.6], [4.1, -8.6], [-4.1, -8.6]]), c: '#d9d2c2' }]);
    G(ctx, S, [{ p: poly([[0.6, -9.6], [4.3, -12.4], [5.2, -11], [2.6, -9.4]]), c: '#ece6d8', s: '#cfc6b3', o: 0.4 }]);
  } else if (prop === 'grocerybag') {
    const bag = poly([[-6, -1], [6, -1], [6.6, 14], [-6.6, 14]]);
    G(ctx, S, [{ p: rrect(-1.6, -13, 3.2, 15, 1.5), c: '#e3a957', s: '#c48638', o: 0.8, oy: 0 }, { p: ell(3.4, -5.5, 2.4, 4.4, 0.3), c: '#5fbf5a', s: '#3e9a44', o: 0.8 }, { p: ell(-3.8, -3.6, 2.2, 3, -0.4), c: '#ef5b4a', s: '#c63b30', o: 0.7 }]);
    G(ctx, S, [{ p: bag, c: '#c9955a', s: '#a87640', o: 2.5, oy: 0, tx: 'speck', ta: 0.18 }]);
    line(ctx, S, [P(-6.1, 1.4), P(6.1, 1.4)], 0.45); ctx.fillStyle = '#a87640'; ctx.beginPath(); ctx.arc(0, 7, 2, 0, TAU); ctx.fill();
  } else if (prop === 'spatula') {
    if (pose === 'stir') ctx.rotate(Math.PI * 0.9 + Math.sin(t * TAU / 22) * 0.12);
    G(ctx, S, [{ pts: [P(0, 3), P(0, -5)], w: 1.6, c: '#2b2735' }, { pts: [P(0, -5), P(0, -10)], w: 0.7, c: '#9aa4b5' }]);
    const head = rrect(-2.4, -16.5, 4.8, 6.8, 1); G(ctx, S, [{ p: head, c: '#b9c2d0', s: '#8e98aa', o: 0.8, oy: 0 }]);
    for (let i = -1; i <= 1; i++) line(ctx, S, [P(i * 1.2, -15.2), P(i * 1.2, -11.6)], 0.4);
  } else if (prop === 'towel') { // kitchen towel flapping from the hand
    const fl = Math.sin(t * TAU / 10 + 1), fl2 = Math.sin(t * TAU / 10 + 2.2);
    const pts = [[-1.5, 0.5], [1.5, 0.5], [3.5 + fl * 2, -6], [4.5 + fl2 * 3.5, -12.5], [-2.5 + fl2 * 3.5, -13], [-3.5 + fl * 2, -6.5]];
    const p = spl(pts);
    G(ctx, S, [{ p, c: '#f4efe6', s: '#d8d0c2', o: 1, oy: 0, tx: 'speck', ta: 0.12 }]);
    ctx.save(); ctx.clip(p); for (const y of [-9, -10.6]) line(ctx, S, [P(-8, y + fl2 * 0.6), P(10, y - 0.8 + fl2 * 0.6)], 0.55, '#d8433a'); ctx.restore();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- torso
function torsoPath(r, yOff = 0) {
  const B = r.B, cs = r.cs, sn = r.sn;
  const W1 = Math.hypot(B.sx * cs, B.sd * sn) + 1.2, W2 = Math.hypot(B.hemX * cs, B.hemD * sn);
  const tx = r.lean * sn * 0.8, sh = r.shY, hm = B.hemY + r.ub + yOff;
  const mid = (sh + hm) / 2;
  return { W1, W2, tx, sh, hm, p: spl([[tx - W1 * 0.42, sh - 1.7], [tx - W1 * 0.9, sh - 0.7], [tx - W1 * 1.04, sh + 3], [tx * 0.5 - (W1 + W2) * 0.5, mid], [-W2, hm - 2], [-W2 * 0.97, hm], [0, hm + 0.4], [W2 * 0.97, hm], [W2, hm - 2], [tx * 0.5 + (W1 + W2) * 0.5, mid], [tx + W1 * 1.04, sh + 3], [tx + W1 * 0.9, sh - 0.7], [tx + W1 * 0.42, sh - 1.7], [tx, sh - 2]]) };
}
function drawTorso(ctx, st) {
  const { r, S, C, o, sec } = st, B = r.B, T = C.top, cs = r.cs, sn = r.sn;
  const tp = torsoPath(r); const { tx, sh, hm, W1, W2 } = tp;
  const fwd = cs > 0.12, backV = cs < -0.25;
  const cX = (y) => { const u = (y - sh) / (hm - sh); return lerp(tx, 0, u) + lerp(B.sd, B.hemD, u) * sn; };
  const bX = (y) => { const u = (y - sh) / (hm - sh); return lerp(tx, 0, u) - lerp(B.sd, B.hemD, u) * sn; };
  const items = [{ p: tp.p, c: T.c, s: T.s, o: 2.2, oy: 0.2, ht: T.ht ?? 1, tx: T.tx, ta: T.ta, tu: T.tx === 'rib' ? TX.u * 1.0 : 0 }];
  let hoodP = null;
  const hx = cl(sec.x * 0.3, -1.5, 1.5), hy = cl(sec.y * 0.3, -1.2, 1.2);
  if (T.type === 'hoodie' || T.hood) {
    const hc = T.hood || T.c, hcs = T.hoodS || T.s;
    hoodP = { p: ell(tx - sn * 2.6 + hx, sh - 1.6 + hy, (B.neckW * 0.5 + 3.4) * (0.55 + 0.45 * Math.abs(cs)) + 1.4 * Math.abs(sn), 3.4), c: hc, s: hcs, o: 1.2, tx: T.hood ? 0 : T.tx, ta: T.ta };
    if (T.hood) G(ctx, S, [hoodP]); else items.unshift(hoodP);
  }
  G(ctx, S, items);
  rimOn(ctx, st, tp.p, 2);
  if (hoodP && !backV) {
    ctx.fillStyle = T.hoodS || T.s; ctx.beginPath(); ctx.ellipse(tx - sn * 2.0 + hx, sh - 2.2 + hy, (B.neckW * 0.5 + 1.7) * (0.55 + 0.45 * Math.abs(cs)), 1.9, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.clip(hoodP.p); ctx.globalAlpha = 0.25; ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(tx - sn * 2.0 + hx, sh - 2.6 + hy, (B.neckW * 0.5 + 1.0) * (0.55 + 0.45 * Math.abs(cs)), 1.2, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  // neck (+ AO under the chin)
  const hd = r.head, chinY = hd.y + hd.R * C.head.low * 0.86;
  const nb = P(tx + sn * 0.6, sh + (T.type.startsWith('chef') ? -2.4 : 0.5)), nt = P(hd.x * 0.8 + tx * 0.2, chinY);
  G(ctx, S, [{ pts: [nt, nb], w: B.neckW, c: C.skinS }]);
  ctx.save(); ctx.globalAlpha = 0.22; ctx.strokeStyle = INK; ctx.lineWidth = B.neckW; ctx.lineCap = 'butt'; pl(ctx, [nt, P(lerp(nt.x, nb.x, 0.45), lerp(nt.y, nb.y, 0.45))]); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.clip(tp.p);
  // AO: under the head and along the sides where the arms rest
  { const g = ctx.createRadialGradient(tx + hd.x * 0.3, sh - 1, 0, tx + hd.x * 0.3, sh - 1, B.neckW * 1.4 + 3.5); g.addColorStop(0, 'rgba(28,21,48,0.26)'); g.addColorStop(1, 'rgba(28,21,48,0)'); ctx.fillStyle = g; ctx.fillRect(-40, sh - 12, 80, 24); }
  if (Math.abs(cs) > 0.3) { const g = ctx.createLinearGradient(tx - W1 - 1, 0, tx + W1 + 1, 0); g.addColorStop(0, 'rgba(28,21,48,0.2)'); g.addColorStop(0.16, 'rgba(28,21,48,0)'); g.addColorStop(0.84, 'rgba(28,21,48,0)'); g.addColorStop(1, 'rgba(28,21,48,0.2)'); ctx.fillStyle = g; ctx.fillRect(-40, sh, 80, hm - sh + 3); }
  const cut = (y0, wTop, wBot, col, colS, vDip = 2.6) => {
    const w0 = wTop * cs, w1 = wBot * cs, x0 = cX(sh), x1 = cX(hm + 1);
    const p = new Path2D(); p.moveTo(x0 - w0, sh - 2.5); p.quadraticCurveTo(x0, sh + vDip, x0 + w0, sh - 2.5); p.lineTo(x1 + w1, hm + 2); p.lineTo(x1 - w1, hm + 2); p.closePath();
    ctx.fillStyle = col; ctx.fill(p); if (colS) shade(ctx, p, colS, -S.sd * 0.8, 0);
    ctx.lineWidth = S.lw; ctx.stroke(p); return { x0, x1, w0, w1 };
  };
  if (T.type === 'hoodie') {
    stitch(ctx, S, [P(-30, hm - 3.3), P(30, hm - 3.3)], T.stitch);
    for (let i = -6; i <= 6; i++) { const x = i * 1.5 + tx * 0.2; ctx.fillStyle = rgba(INK, 0.13); ctx.fillRect(x, hm - 2.2, 0.35, 2.4); }
    if (fwd) {
      const q = cut(0, 2.5, 3.2, T.tee, T.teeS);
      ctx.strokeStyle = T.teeS; ctx.lineWidth = S.lw * 0.8; ctx.beginPath(); ctx.moveTo(q.x0 - q.w0 * 0.75, sh - 1.4); ctx.quadraticCurveTo(q.x0, sh + 1.5, q.x0 + q.w0 * 0.75, sh - 1.4); ctx.stroke(); ctx.strokeStyle = INK;
      for (const s of [-1, 1]) { const o2 = s * (q.w0 + 1.0 * cs); stitch(ctx, S, [P(q.x0 + o2, sh + 1.5), P(q.x1 + s * (q.w1 + 1.0 * cs), hm - 3.2)], T.stitch); }
      // drawstrings with swing + metal aglets
      for (const s of [-1, 1]) {
        const x = q.x0 + s * (q.w0 + 0.9 * cs), sw = cl(sec.x * 0.7, -2.5, 2.5) + Math.sin(st.t * 0.21 + s) * 0.12, sy = cl(sec.y * 0.4, -1.5, 1.5);
        const end = P(x + s * 0.3 + sw, sh + 9 + sy);
        G(ctx, S, [{ pts: qpts(P(x, sh + 0.5), P(x + s * 0.2 + sw * 0.25, sh + 5), end, 6), w: 0.75, c: '#f6efe0' }]);
        const ag = Math.atan2(end.y - (sh + 5), end.x - (x + sw * 0.25)) - HP;
        ctx.save(); ctx.translate(end.x, end.y); ctx.rotate(ag); G(ctx, S, [{ p: rrect(-0.55, -0.2, 1.1, 1.9, 0.4), c: '#c7ccd8', s: '#8d93a6', o: 0.35, oy: 0, ht: 0 }]); ctx.restore();
      }
      for (const s of [-1, 1]) { const px = q.x1 + s * (q.w1 + 3.4 * cs); line(ctx, S, [P(px, hm - 9), P(px + s * 2.2 * cs, hm - 4.6)], 0.55); stitch(ctx, S, [P(px - s * 0.7, hm - 8.8), P(px + s * (2.2 * cs - 0.7), hm - 4.4)], T.stitch, 0.26); }
      line(ctx, S, [P(q.x0 + 4.5 * cs, sh + 6), P(q.x0 + 6.5 * cs, sh + 9.5)], 0.4, T.s);
    } else if (backV) {
      const x = bX(sh); const hp = spl([[x - 6 * Math.abs(cs) + hx, sh - 1], [x + hx, sh - 1.8], [x + 6 * Math.abs(cs) + hx, sh - 1], [x + 4.5 * Math.abs(cs) + hx, sh + 6 + hy], [x + hx, sh + 10.5 + hy], [x - 4.5 * Math.abs(cs) + hx, sh + 6 + hy]]);
      G(ctx, S, [{ p: hp, c: T.c, s: T.s, o: 1, tx: T.tx, ta: T.ta }]); line(ctx, S, [P(x - 3.4 * Math.abs(cs) + hx, sh + 1), P(x + hx, sh + 6.5 + hy), P(x + 3.4 * Math.abs(cs) + hx, sh + 1)], 0.6);
    }
    line(ctx, S, [P(-30, hm - 2.4), P(30, hm - 2.4)], 0.55);
    if (T.scorch) { ctx.fillStyle = 'rgba(70,40,20,0.55)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(lerp(-6, 6, hs(i + 3)) + tx, hm - 3 - hs(i + 9) * 4, 1.6, 0.9, 0.3, 0, TAU); ctx.fill(); } }
  } else if (T.type === 'chef' || T.type === 'chefDB') {
    const db = T.type === 'chefDB';
    if (fwd) {
      const x0 = cX(sh), x1 = cX(hm);
      const ov = (db ? 4.2 : 3.6) * cs;
      line(ctx, S, [P(x0 + ov, sh + 1.2), P(x1 + ov * 1.05, hm + 1)], 0.7);
      stitch(ctx, S, [P(x0 + ov + 0.8 * cs, sh + 1.6), P(x1 + ov * 1.05 + 0.8 * cs, hm - 0.5)], T.stitch);
      const rows = db ? [-2.4, 2.2] : [2.2];
      for (const rx of rows) for (let i = 0; i < 4; i++) {
        let y = sh + 4 + i * 5.2; if (y > hm - 2) continue; let x = lerp(x0, x1, (y - sh) / (hm - sh)) + rx * cs;
        if (T.sloppy) { x += (i % 2 ? 0.6 : -0.3) * cs; y += (i === 2 ? 1.2 : 0); }
        const bp = ell(x, y, 0.75 * Math.max(0.4, cs), 0.75); ctx.fillStyle = T.btn; ctx.fill(bp); ctx.lineWidth = S.lw * 0.45; ctx.strokeStyle = INK; ctx.stroke(bp);
        ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.arc(x - 0.25, y - 0.25, 0.22, 0, TAU); ctx.fill();
      }
      if (T.pen) { // sleeve-side chest pocket with a pen + thermometer
        const px = x0 - 7.2 * cs, py = sh + 7;
        ctx.fillStyle = '#2f6fd6'; ctx.beginPath(); ctx.roundRect(px - 1.3 * cs, py - 2.6, 0.9, 3.4, 0.4); ctx.fill(); ctx.lineWidth = S.lw * 0.4; ctx.stroke();
        ctx.fillStyle = '#b9c2d0'; ctx.beginPath(); ctx.roundRect(px + 0.4 * cs, py - 3.2, 0.6, 4, 0.3); ctx.fill(); ctx.stroke();
        line(ctx, S, [P(px - 2.4 * cs, py), P(px + 2.4 * cs, py)], 0.5); stitch(ctx, S, [P(px - 2.4 * cs, py + 3.4), P(px + 2.4 * cs, py + 3.4)], T.stitch, 0.25);
      }
    } else if (backV) { line(ctx, S, [P(bX(sh), sh + 2), P(bX(hm), hm)], 0.45, T.s); }
    if (T.sloppy) { ctx.fillStyle = T.s; ctx.beginPath(); ctx.ellipse(cX(hm) - 3, hm - 4, 2, 0.6, 0.3, 0, TAU); ctx.fill(); }
    stitch(ctx, S, [P(-30, hm - 1.4), P(30, hm - 1.4)], T.stitch);
  } else if (T.type === 'tee') {
    if (fwd && T.graphic) planetGraphic(ctx, S, cX(sh + 10.5), sh + 10.5, cs);
    if (backV) line(ctx, S, [P(bX(sh + 3) - 1.4 * Math.abs(cs), sh + 3), P(bX(sh + 3) + 1.4 * Math.abs(cs), sh + 3)], 0.5, T.s);
    stitch(ctx, S, [P(-30, hm - 1.3), P(30, hm - 1.3)], T.stitch);
    if (fwd) { line(ctx, S, [P(cX(hm) - 5 * cs, hm - 6), P(cX(hm) - 3 * cs, hm - 1)], 0.4, T.s); line(ctx, S, [P(cX(sh) + 6 * cs, sh + 3), P(cX(sh) + 4.5 * cs, sh + 6)], 0.4, T.s); }
  } else if (T.type === 'cardigan') {
    if (fwd) {
      const q = cut(0, 3.6, 3, T.blouse, T.blouseS, 7.5);
      for (let i = 0; i < 4; i++) { const y = sh + 8 + i * 4.6; if (y > hm - 2) continue; const x = lerp(q.x0, q.x1, (y - sh) / (hm - sh)) + (q.w0 + 1.4 * cs); G(ctx, S, [{ p: ell(x, y, 0.7, 0.7), c: T.btn }]); }
      for (const s of [-1, 1]) { const px = cX(hm - 7) + s * 5.6 * cs; G(ctx, S, [{ p: rrect(px - 2.2 * cs, hm - 8.5, 4.4 * cs, 4, 0.6), c: T.c, s: T.s, o: 0.6, tx: 'rib', ta: 0.1, tu: TX.u }]); stitch(ctx, S, [P(px - 2.2 * cs, hm - 7.6), P(px + 2.2 * cs, hm - 7.6)], T.stitch, 0.25); }
    }
    line(ctx, S, [P(-30, hm - 2.2), P(30, hm - 2.2)], 0.5);
  }
  ctx.restore();
  if (T.type === 'chef' || T.type === 'chefDB') {
    const w = (B.neckW + 2.6) * (0.7 + 0.3 * Math.abs(cs)) + Math.abs(sn) * 1.5;
    G(ctx, S, [{ p: rrect(tx + sn * 0.4 - w / 2, sh - 3.4, w, 3.4, 1.2), c: T.c, s: T.s, o: 0.8, oy: 0 }]);
    if (T.scarf) {
      G(ctx, S, [{ p: rrect(tx + sn * 0.4 - w / 2 + 0.6, sh - 4.6, w - 1.2, 1.9, 0.9), c: T.scarf, s: T.scarfS, o: 0.8 }]);
      if (!backV) { const kx = cX(sh) + sn * 0.6 + cl(sec.x * 0.15, -0.6, 0.6); G(ctx, S, [{ p: poly([[kx - 2.4 * Math.max(0.5, cs), sh - 3], [kx + 2.4 * Math.max(0.5, cs), sh - 3], [kx + 1.2, sh + 3.2], [kx - 1.2, sh + 3.6]]), c: T.scarf, s: T.scarfS, o: 0.6, oy: 0 }, { p: ell(kx, sh - 2.4, 1.5, 1.3), c: T.scarf }]); line(ctx, S, [P(kx - 0.3, sh - 1), P(kx - 0.6, sh + 2.6)], 0.35, T.scarfS); }
    }
  }
  if (T.type === 'tee') { const w = (B.neckW + 1.6) * (0.65 + 0.35 * Math.abs(cs)); ctx.strokeStyle = T.teeS; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.ellipse(tx + sn * 0.6, sh - 0.6, w / 2, 1.5, 0, 0.1, Math.PI - 0.1); ctx.stroke(); ctx.strokeStyle = INK; }
  if (T.type === 'cardigan' && fwd) { const x = cX(sh); for (const s of [-1, 1]) G(ctx, S, [{ p: poly([[x + s * 0.4, sh - 1.2], [x + s * 3.4 * cs, sh - 2.2], [x + s * 2.2 * cs, sh + 2.2]]), c: T.blouse }]); }
  if (st.soot > 0) { ctx.save(); ctx.clip(tp.p); sootDots(ctx, st, tx, (sh + hm) / 2, 7, 5 * st.soot, 20); ctx.restore(); }
  if (o.phoneGlow > 0) { ctx.save(); ctx.clip(tp.p); ctx.fillStyle = `rgba(120,190,255,${0.14 * o.phoneGlow})`; ctx.beginPath(); ctx.ellipse(tx + sn * 4, sh, 14, 10, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  void W2; st.torsoP = tp.p;
}
function planetGraphic(ctx, S, x, y, cs) {
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(0.15, cs), 1);
  const l = S.lw * 0.55;
  ctx.lineWidth = l; ctx.strokeStyle = INK;
  ctx.fillStyle = '#4ed1c5'; ctx.beginPath(); ctx.ellipse(0, 0, 6.4, 1.7, -0.3, Math.PI, TAU); ctx.lineWidth = 1.6; ctx.strokeStyle = '#4ed1c5'; ctx.stroke(); ctx.strokeStyle = INK;
  ctx.fillStyle = '#ffc94d'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.fill(); ctx.lineWidth = l; ctx.stroke();
  ctx.fillStyle = '#f0a531'; ctx.beginPath(); ctx.arc(0, 0, 4, -0.6, 1.9); ctx.arc(-0.9, 0.2, 3.5, 1.9, -0.6, true); ctx.fill();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(-3, -1.2, 2.6, 1.6, 0.7); ctx.roundRect(0.4, -1.2, 2.6, 1.6, 0.7); ctx.fill(); ctx.fillRect(-0.5, -0.9, 1, 0.4);
  ctx.beginPath(); ctx.arc(0, 1.2, 1.1, 0.3, Math.PI - 0.3); ctx.lineWidth = 0.6; ctx.stroke();
  ctx.lineWidth = 1.6; ctx.strokeStyle = '#4ed1c5'; ctx.beginPath(); ctx.ellipse(0, 0, 6.4, 1.7, -0.3, 0, Math.PI); ctx.stroke();
  ctx.fillStyle = '#ffffff'; for (const [sx, sy] of [[-5.5, -4.5], [5.2, -3.8], [4.4, 4.6]]) { ctx.beginPath(); ctx.arc(sx, sy, 0.55, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 0.25; ctx.fillStyle = '#f6f1e6'; ctx.fillStyle = pat(ctx, 'speck', 2.2); ctx.fillRect(-8, -6, 16, 12); // print wear
  ctx.restore();
}
function sootDots(ctx, st, x, y, spread, n, salt) {
  ctx.fillStyle = 'rgba(38,28,34,0.5)';
  for (let i = 0; i < n; i++) { const a = hs(i + salt) * TAU, d = hs(i * 3 + salt) * spread; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * d * 1.3, y + Math.sin(a) * d, 0.9 + hs(i + salt * 2) * 1.4, 0.6 + hs(i + 7 + salt) * 0.9, a, 0, TAU); ctx.fill(); }
}

// ---------------------------------------------------------------- head
function headShape(H, R, th, jaw = 0) {
  const pts = [], sn = Math.sin(th), W = H.W * (1 + 0.05 * Math.abs(sn)), low = H.low * (1 + 0.075 * jaw);
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * TAU, c = Math.cos(a), s = Math.sin(a);
    let x = c * R * W, y = s * R * (s < 0 ? H.top : 1);
    if (s > 0) { const cc = Math.sign(c) * Math.pow(Math.abs(c), H.sq); x = cc * R * W * (1 - H.taper * s * s); y = s * R * low; x += sn * R * 0.14 * s * s; }
    else x -= sn * R * 0.04 * s * s;
    pts.push([x, y]);
  }
  return pts;
}
function spanAt(pts, y) { let a = 1e9, b = -1e9; const n = pts.length; for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; if ((p[1] - y) * (q[1] - y) <= 0 && p[1] !== q[1]) { const x = p[0] + (q[0] - p[0]) * (y - p[1]) / (q[1] - p[1]); a = Math.min(a, x); b = Math.max(b, x); } } if (a > b) return { c: 0, hw: 0.1 }; return { c: (a + b) / 2, hw: (b - a) / 2 }; }
function ringPts(R, W, th, ef, n = 44) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const v = -HP + i / n * Math.PI; let a = v - th; a = Math.atan2(Math.sin(a), Math.cos(a)); const e = ef(a);
    out.push([R * W * Math.cos(e) * Math.sin(v), -R * Math.sin(e)]);
  }
  return out;
}
function aboveRing(ring, R, below = false) { const f = ring[0], l = ring[ring.length - 1]; const Y = below ? 4 * R : -4 * R; return poly([[-4 * R, f[1]], ...ring, [4 * R, l[1]], [4 * R, Y], [-4 * R, Y]]); }
function volAng(R, W, th, v) { const sn = Math.sin(th), cs = Math.cos(th), extB = cs < 0 ? -cs * 0.6 : 0; return [-Math.PI - v.ext - Math.max(0, sn) * 0.55 - extB, v.ext + Math.max(0, -sn) * 0.55 + extB]; }
function volB(v, ph, t, i) { if (v.mode === 'spiky') return Math.pow(1 - Math.abs(Math.sin(ph)), 2.2) + Math.sin(t * 0.05 + i) * 0.03; if (v.mode === 'curly') return Math.pow(Math.abs(Math.sin(ph)), 0.5); return Math.pow(Math.abs(Math.sin(ph)), 0.7); }
function volPath(R, W, th, v, t) {
  const sn = Math.sin(th), [a0, a1] = volAng(R, W, th, v);
  const pts = [], N = Math.max(30, v.n * 5);
  const cx = -sn * R * 0.1, cy = v.cy * R;
  for (let i = 0; i <= N; i++) {
    const ang = lerp(a0, a1, i / N); const ph = ang * v.n / 2 + th * v.n * 0.35;
    const rr = R * (v.r + v.amp * (volB(v, ph, t, i) - 0.5));
    pts.push([cx + Math.cos(ang) * rr * W, cy + Math.sin(ang) * rr]);
  }
  pts.push([R * 0.4, R * 0.5], [-R * 0.4, R * 0.5]);
  return v.mode === 'spiky' ? poly(pts) : spl(pts);
}
// lock separations on the hair volume: short tapered strokes inward from each dip of the silhouette
function volLocks(ctx, st, R, W, th, v, col) {
  const sn = Math.sin(th), [a0, a1] = volAng(R, W, th, v), cx = -sn * R * 0.1, cy = v.cy * R, S = st.S;
  const off = v.mode === 'spiky' ? HP : 0;
  for (let k = -40; k <= 40; k++) {
    const ph = off + k * Math.PI, ang = (ph - th * v.n * 0.35) * 2 / v.n; if (ang <= a0 + 0.05 || ang >= a1 - 0.05) continue;
    const rr = R * (v.r - v.amp * 0.5) * 1.02, r2 = rr * (v.mode === 'curly' ? 0.86 : 0.74), bend = 0.18 * (k % 2 ? 1 : -1);
    const p0 = P(cx + Math.cos(ang) * rr * W, cy + Math.sin(ang) * rr), p1 = P(cx + Math.cos(ang + bend) * r2 * W, cy + Math.sin(ang + bend) * r2);
    tline(ctx, qpts(p0, P(lerp(p0.x, p1.x, 0.5) + Math.cos(ang + HP) * R * 0.05, lerp(p0.y, p1.y, 0.5) + Math.sin(ang + HP) * R * 0.05), p1, 6), S.lw * 0.75, col, 0.5, 0.1);
  }
}
// lock lines along the cranium (meridians from crown to hairline) + broken highlight band
function craniumLocks(ctx, st, R, W, th, ef, n, col, hi, shine) {
  const S = st.S, sd = S.sd;
  if (shine) { // continuous highlight band (latitude) on the lit side; lock lines drawn over it break it into groups
    for (const [e, w, a0, a1] of [[1.0, 0.11, -1.05, 0.25], [1.13, 0.06, -0.75, -0.05]]) {
      const pts = []; for (let j = 0; j <= 16; j++) { const aa = sd * lerp(a0, a1, j / 16), v = aa + th; if (Math.cos(v) < 0.15) continue; const ee = e + 0.03 * Math.sin(j / 16 * Math.PI * 2); pts.push(P(R * W * Math.cos(ee) * Math.sin(v), -R * Math.sin(ee))); }
      if (pts.length > 3) tline(ctx, pts, R * w, hi, 0.15, 0.15);
    }
  }
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI + (i + 0.5) / n * TAU + 0.13, pts = [];
    for (let j = 0; j <= 7; j++) { const u = j / 7, a = a0 + 0.25 * u * u, v = a + th; if (Math.cos(v) < 0.06) continue; const e = lerp(1.32, ef(a) + 0.04, u); pts.push(P(R * W * Math.cos(e) * Math.sin(v), -R * Math.sin(e))); }
    if (pts.length > 3) tline(ctx, pts, S.lw * 0.7, col, 0.08, 0.55);
  }
}
function shearM(px, py, dx, dy, H) { const shx = -dx / H, sy = cl(1 - dy / H, 0.75, 1.25); return { a: 1, b: 0, c: shx, d: sy, e: -shx * py, f: py - sy * py }; }

function mouthSpec(st) {
  const { r, o, t } = st, base = r.exn.m;
  const v = viseme(o.say, t) || talkSpec(o, t, st.seed || 0);
  if (!v) return base;
  const m = { ...v.m, c: lerp(v.m.c, base.c, 0.45) };
  return blendM(base, m, v.w);
}

function drawHead(ctx, st) {
  const { r, S, C, o, sec } = st, H = C.head, hd = r.head, R = hd.R, th = r.th, sn = r.sn, cs = r.cs, t = st.t;
  const ex = r.exn, W = H.W, facing = cs > -0.2;
  const m = mouthSpec(st), jaw = facing ? cl((m.bot - m.top - 1.6) / 3.2, 0, 1) * cl(cs * 2, 0, 1) : 0;
  ctx.save(); ctx.translate(hd.x, hd.y); ctx.rotate(hd.roll);
  const hpts = headShape(H, R, th, jaw), hp = spl(hpts);
  const py = hd.pitch * R;
  const ears = [];
  if (H.ears) for (const s of [-1, 1]) { const a = s * (HP + 0.28); const d = Math.cos(a + th), sp = spanAt(hpts, R * 0.15); const x = sp.c + sp.hw * Math.sin(a + th) * 0.98 * (d > 0.3 ? 0.9 : 1); ears.push({ s, d, x }); }
  const earDraw = (e) => {
    const y = R * 0.15 + py * 0.5, rx = R * 0.2, ry = R * 0.27;
    G(ctx, S, [{ p: ell(e.x, y, rx, ry), c: C.skin, s: C.skinS, o: rx * 0.5, oy: 0 }]);
    const ins = e.x > (sn * R) ? 1 : -1;
    ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = C.skinS; ctx.beginPath(); ctx.ellipse(e.x - ins * rx * 0.1, y + ry * 0.05, rx * 0.45, ry * 0.55, 0, 0, TAU); ctx.fill(); ctx.restore();
    tline(ctx, arcPts(e.x, y, rx * 0.5, ry * 0.6, -1.4, 1.6, 8).map((p) => P(e.x + (p.x - e.x) * -ins, p.y)), S.lw * 0.6, INK, 0.15, 0.3);
    if (H.earring) G(ctx, S, [{ p: ell(e.x, y + ry * 0.95, R * 0.07, R * 0.07), c: '#f2c14e' }]);
    if (H.stud && e.s === 1) G(ctx, S, [{ p: ell(e.x, y + ry * 0.7, R * 0.05, R * 0.05), c: '#e8edf5' }]);
  };
  const hat = C.hat;
  if (hat && (hat.type === 'tall' || hat.type === 'flop')) toqueColumn(ctx, st, R, W, hat);
  for (const e of ears) if (e.d <= 0.3 && e.d > -0.75) earDraw(e);
  // hair volume (with secondary overlap) + head
  const hairM = shearM(0, R * 0.3, cl(sec.x * 0.9, -R * 0.3, R * 0.3), cl(sec.y * 0.9, -R * 0.3, R * 0.3), R * 1.5);
  let hv = null;
  if (C.hair && C.hair.vol && !(hat && hat.type === 'beanie')) { hv = new Path2D(); hv.addPath(volPath(R, W, th, C.hair.vol, t), hairM); }
  const items = [];
  if (hv) items.push({ p: hv, c: C.hair.c });
  if (hv && C.hair.cow) {
    const a = -HP - sn * 0.5, rr = R * 1.05, bx = Math.cos(a) * rr * W - sn * R * 0.1, by = Math.sin(a) * rr;
    const d = sn > 0.3 ? -1 : 1, bob = cl(sec.x * 0.25, -R * 0.15, R * 0.15), boy = cl(sec.y * 0.3, -R * 0.15, R * 0.2);
    const tp = new Path2D(); tp.moveTo(bx - R * 0.2, by + R * 0.1);
    tp.quadraticCurveTo(bx - d * R * 0.02, by - R * 0.3 + boy, bx + d * R * 0.38 + bob, by - R * 0.36 + boy);
    tp.quadraticCurveTo(bx + d * R * 0.12, by - R * 0.12, bx + R * 0.2, by + R * 0.12); tp.closePath();
    items.push({ p: tp, c: C.hair.c });
  }
  items.push({ p: hp, c: C.skin });
  const hairShadowP = () => { const q = new Path2D(); q.rect(-BIG, -BIG, 2 * BIG, 2 * BIG); q.ellipse(-S.sd * R * 0.22 - sn * R * 0.1, -R * 0.22, R * 1.12 * W, R * 1.18, 0, 0, TAU); return q; };
  const hairShadow = () => { const q = hairShadowP(); ctx.fillStyle = C.hair.s; ctx.fill(q, 'evenodd'); if (TX.on) { ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = pat(ctx, 'dot', TX.u); ctx.fill(q, 'evenodd'); ctx.restore(); } };
  ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 2 * S.lw;
  for (const it of items) ctx.stroke(it.p);
  if (hv) {
    ctx.fillStyle = C.hair.c; ctx.fill(hv); ctx.save(); ctx.clip(hv); hairShadow();
    if (C.hair.locks) { ctx.save(); ctx.transform(hairM.a, hairM.b, hairM.c, hairM.d, hairM.e, hairM.f); volLocks(ctx, st, R, W, th, C.hair.vol, C.hair.s); ctx.restore(); }
    ctx.restore();
  }
  if (hv) rimOn(ctx, st, hv, R * 0.16);
  ctx.fillStyle = C.skin; ctx.fill(hp);
  shade(ctx, hp, C.skinS, -S.sd * R * 0.17, -R * 0.07, 0.8);
  // soft AO under the jaw and hairline
  ctx.save(); ctx.clip(hp); { const g = ctx.createLinearGradient(0, R * 0.55, 0, R * 1.35); g.addColorStop(0, 'rgba(28,21,48,0)'); g.addColorStop(1, 'rgba(28,21,48,0.16)'); ctx.fillStyle = g; ctx.fillRect(-2 * R, R * 0.5, 4 * R, R); } ctx.restore();
  rimOn(ctx, st, hp, R * 0.14);
  if (C.hair) {
    const ring = ringPts(R, W, th, C.hair.line, 56);
    const hr = aboveRing(ring, R);
    ctx.save(); ctx.clip(hp);
    ctx.save(); ctx.translate(S.sd * R * 0.04, R * 0.07); ctx.fillStyle = C.skinS; ctx.fill(hr); ctx.restore();
    { ctx.save(); ctx.translate(S.sd * R * 0.04, R * 0.15); ctx.globalAlpha = 0.12; ctx.fillStyle = INK; ctx.fill(hr); ctx.restore(); }
    ctx.fillStyle = C.hair.c; ctx.fill(hr);
    ctx.save(); ctx.clip(hr); hairShadow(); rimOn(ctx, st, hp, R * 0.16);
    const shine = C.hair.hi && !(hat && hat.type !== 'flop');
    if (C.hair.locks) craniumLocks(ctx, st, R, W, th, C.hair.line, C.hair.locks, C.hair.s, C.hair.hi, shine);
    ctx.restore();
    ctx.restore();
    if (hv) { ctx.save(); ctx.clip(hr); ctx.clip(hv); ctx.strokeStyle = C.hair.c; ctx.lineWidth = S.lw * 0.5; ctx.stroke(hp); ctx.clip(hairShadowP(), 'evenodd'); ctx.strokeStyle = C.hair.s; ctx.stroke(hp); ctx.restore(); ctx.strokeStyle = INK; }
    ctx.save(); ctx.clip(hp);
    ctx.lineWidth = S.lw; ctx.beginPath(); ring.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    ctx.restore();
  }
  for (const e of ears) if (e.d > 0.3) earDraw(e);
  if (facing) drawFace(ctx, st, hpts, hp, py, m, jaw);
  if (hat) drawHatFront(ctx, st, R, W, hat);
  if (facing && hat && hat.type === 'flop') drawBrows(ctx, st, hpts, py);
  if (st.soot > 0) { ctx.save(); ctx.clip(hp); ctx.fillStyle = `rgba(36,26,32,${0.3 * Math.min(1, st.soot)})`; const n = Math.round(4 + st.soot * 4); for (let i = 0; i < n; i++) { const a = (hs(i + 31) - 0.5) * 2.6, y = (hs(i + 57) - 0.2) * R * 0.95; const v = a + th; if (Math.cos(v) < 0.05) continue; const x = R * W * 0.95 * Math.sin(v); ctx.beginPath(); ctx.ellipse(x, y, R * (0.07 + hs(i + 3) * 0.1) * Math.max(0.4, Math.cos(v)), R * (0.06 + hs(i + 9) * 0.07), hs(i) * 2, 0, TAU); ctx.fill(); } ctx.restore(); }
  if (o.phoneGlow > 0) { ctx.save(); ctx.clip(hp); const g = o.phoneGlow; ctx.fillStyle = `rgba(120,185,255,${0.1 * g})`; ctx.fill(hp); ctx.fillStyle = `rgba(175,225,255,${0.22 * g})`; ctx.beginPath(); ctx.ellipse(sn * R * 0.4, R * 1.25, R * 1.25, R * 0.95, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  st.headP = hp;
  if (C.smoke) smoke(ctx, st, R);
  const sw = Math.max(o.sweat || 0, ex.sweat || 0);
  if (sw > 0.05 && facing) sweat(ctx, st, hpts, R, sw);
  ctx.restore();
}

function drawBrows(ctx, st, hpts, py) {
  const { r, S, C } = st, H = C.head, R = r.head.R, th = fyaw(r.th), ex = r.exn;
  const sp = spanAt(hpts, R * H.eyeY);
  ex.b.forEach((b, i) => {
    const s = i ? 1 : -1, a = s * H.eyeA, v = a + th, d = Math.cos(v); if (d < 0.02) return;
    const comp = lerp(0.5, 1, cl(d, 0, 1));
    const exX = sp.c + sp.hw * 0.9 * Math.sin(v), ery = R * H.ery * Math.max(1, ex.e.o || 1);
    const baseY = R * H.eyeY + py - ery - R * 0.2 - b[0] * R * 0.06;
    const len = R * H.erx * 1.15 * comp;
    let inX = exX - s * len, outX = exX + s * len;
    let inY = baseY - b[1] * R * 0.06, outY = baseY + b[1] * R * 0.015, midY = (inY + outY) / 2 - b[2] * R * 0.07 - R * 0.02;
    const singed = C.singe && s === 1;
    if (singed) { outX = exX + s * len * 0.15; outY = lerp(inY, outY, 0.6); midY = (inY + outY) / 2; }
    const n = 8, c = [];
    for (let k = 0; k <= n; k++) { const u = k / n; c.push(P(lerp(inX, outX, u), (1 - u) * (1 - u) * inY + 2 * u * (1 - u) * (2 * midY - (inY + outY) / 2) + u * u * outY)); }
    const bw = R * H.brW * 1.3 * (singed ? 0.9 : 1), A = [], Bp = [];
    for (let k = 0; k <= n; k++) {
      const u = k / n, p = c[k], q0 = c[Math.max(0, k - 1)], q1 = c[Math.min(n, k + 1)]; let nx = -(q1.y - q0.y), ny = q1.x - q0.x; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      const prof = (u < 0.3 ? lerp(0.85, 1.05, u / 0.3) : lerp(1.05, singed ? 0.8 : 0.3, (u - 0.3) / 0.7)) * bw * 0.5;
      A.push([p.x + nx * prof, p.y + ny * prof]); Bp.push([p.x - nx * prof, p.y - ny * prof]);
    }
    const path = spl([...A, ...Bp.reverse()]);
    G(ctx, S, [{ p: path, c: H.brCol }]);
    if (st.lwPx > 10) { ctx.save(); ctx.clip(path); for (let k = 1; k < 6; k++) { const p = c[k + 1]; tline(ctx, [P(p.x - s * bw * 0.25, p.y + bw * 0.25), P(p.x + s * bw * 0.2, p.y - bw * 0.3)], S.lw * 0.35, rgba('#ffffff', 0.1), 0.2, 0.2); } ctx.restore(); }
    if (singed) { ctx.strokeStyle = '#3a3036'; ctx.lineWidth = S.lw * 0.6; ctx.beginPath(); ctx.moveTo(outX, outY); for (let k = 1; k <= 3; k++) ctx.lineTo(outX + s * k * len * 0.22, outY + (k % 2 ? -1 : 1) * R * 0.04); ctx.stroke(); ctx.strokeStyle = INK; }
  });
}

function drawFace(ctx, st, hpts, hp, py, m, jaw) {
  const { r, S, C, o, sec } = st, H = C.head, R = r.head.R, th = fyaw(r.th), sn = Math.sin(th), cs = r.cs, ex = r.exn, t = st.t;
  const mu = R / 12;
  const eyeY = R * H.eyeY + py, sp = spanAt(hpts, R * H.eyeY);
  const onFace = (yy, a, k = 0.9) => { const v = a + th, s2 = spanAt(hpts, yy); return { x: s2.c + s2.hw * k * Math.sin(v), d: Math.cos(v) }; };
  // stubble
  const stub = o.stubble ?? C.stubble ?? 0;
  if (stub > 0) {
    ctx.save(); ctx.clip(hp); const y0 = R * (H.noseY + 0.16) + py; const reg = new Path2D(); reg.rect(-3 * R, y0, 6 * R, 4 * R); ctx.clip(reg);
    const g = ctx.createLinearGradient(0, y0, 0, y0 + R * 0.4); g.addColorStop(0, rgba(C.hair.c, 0)); g.addColorStop(1, rgba(C.hair.c, 0.16 * stub)); ctx.fillStyle = g; ctx.fill(hp);
    if (TX.on) { ctx.globalAlpha = Math.min(0.8, 0.6 * stub); ctx.fillStyle = pat(ctx, 'stip', S.lw * 2.4); ctx.fill(hp); }
    ctx.restore();
  }
  // blush with hatch marks
  const bl = Math.max(ex.blush || 0, C.lips ? 0.6 : 0.35);
  for (const s of [-1, 1]) {
    const f = onFace(R * 0.45, s * 0.78, 0.86); if (f.d < 0.1) continue; const by = R * 0.47 + py;
    ctx.globalAlpha = Math.min(0.75, 0.5 * bl); ctx.fillStyle = C.blush; ctx.beginPath(); ctx.ellipse(f.x, by, R * 0.17 * f.d, R * 0.095, 0, 0, TAU); ctx.fill();
    if (bl > 0.55) { ctx.globalAlpha = Math.min(0.9, (bl - 0.5) * 1.4); for (let i = -1; i <= 1; i++) { const x = f.x + i * R * 0.075 * f.d; tline(ctx, [P(x + R * 0.035 * f.d, by - R * 0.05), P(x - R * 0.035 * f.d, by + R * 0.05)], S.lw * 0.5, C.blushL, 0.3, 0.3); } }
    ctx.globalAlpha = 1;
  }
  if (C.freckles) { ctx.fillStyle = C.freckC; for (let i = 0; i < C.freckles; i++) { const s = i % 2 ? 1 : -1, yy = R * (0.3 + hs(i + 7) * 0.14), f = onFace(yy, s * (0.2 + hs(i + 2) * 0.4)); if (f.d < 0.2) continue; ctx.beginPath(); ctx.ellipse(f.x, yy + py, R * 0.024 * f.d, R * 0.021, 0, 0, TAU); ctx.fill(); } }
  if (C.mole) { const f = onFace(R * C.mole[1], C.mole[0]); if (f.d > 0.15) { ctx.fillStyle = '#4a2a24'; ctx.beginPath(); ctx.ellipse(f.x, R * C.mole[1] + py, R * 0.032 * f.d, R * 0.032, 0, 0, TAU); ctx.fill(); } }
  if (ex.gloom > 0.05) { ctx.save(); ctx.clip(hp); ctx.globalAlpha = 0.65 * ex.gloom; for (let i = 0; i < 6; i++) { const x = (i - 2.5) * R * 0.17 + sn * R * 0.4; tline(ctx, [P(x, -R * 0.78), P(x, -R * 0.42 - (i % 2) * R * 0.1)], S.lw * 0.75, '#7d92ff', 0.9, 0.2); } ctx.restore(); }
  // eyes: auto blink (+ blink on fast head turns), saccades
  let blink = o.blink;
  if (blink == null) { const per = 97 + (st.seed * 13) % 37, ph = (t + st.seed * 29) % per; blink = ph < 1 ? 0.5 : ph < 3 ? 1 : ph < 4 ? 0.5 : 0; blink = Math.max(blink, sec.blink || 0); }
  const E = ex.e, look = o.look || r.look || E.look || [0, 0];
  let sx = 0, sy = 0;
  if (!o.look && o.saccade !== false && !(E.fixed > 0.5)) { const per = 34 + (st.seed * 7) % 23, tt = t + st.seed * 13, i = Math.floor(tt / per), u = cl((tt - i * per) / 2, 0, 1); const g = (j) => [(hs(j * 3.7 + st.seed) - 0.5) * 0.42, (hs(j * 5.1 + 1.3 + st.seed) - 0.5) * 0.24]; const a = g(i - 1), b = g(i); sx = lerp(a[0], b[0], u); sy = lerp(a[1], b[1], u); }
  const lookX = sn * 0.45 + look[0] + sx, lookY = look[1] + sy;
  const eyes = [];
  for (const s of [-1, 1]) {
    const v = s * H.eyeA + th, d = Math.cos(v); if (d < 0.02) continue;
    const x = sp.c + sp.hw * 0.9 * Math.sin(v), rx = R * H.erx * lerp(0.42, 1, cl(d, 0, 1)) * Math.max(1, E.o || 1), ry = R * H.ery * (E.o || 1);
    eyes.push({ s, x, rx, ry, d });
  }
  for (const e of eyes) drawEye(ctx, st, e.x, eyeY, e.rx, e.ry, E, lookX, lookY, blink, e.s);
  if (E.tears > 0.5) for (const e of eyes) { const ph = (t * 0.06 + e.s * 0.3) % 1; const x = e.x + e.s * e.rx * 0.3; G(ctx, S, [{ pts: [P(x, eyeY + e.ry * 0.8), P(x + e.s * R * 0.03, eyeY + R * 0.42)], w: R * 0.085, c: '#7fd0ff' }, { p: ell(x + e.s * R * 0.04, eyeY + R * (0.5 + ph * 0.3), R * 0.065, R * 0.085), c: '#7fd0ff' }]); }
  if (!(C.hat && C.hat.type === 'flop')) drawBrows(ctx, st, hpts, py);
  if (H.lines) {
    for (const e of eyes) { const ox = e.x + e.s * e.rx * 1.25; line(ctx, S, [P(ox, eyeY - e.ry * 0.15), P(ox + e.s * R * 0.08, eyeY - e.ry * 0.3)], 0.4); line(ctx, S, [P(ox, eyeY + e.ry * 0.15), P(ox + e.s * R * 0.08, eyeY + e.ry * 0.32)], 0.4); }
    for (const s of [-1, 1]) { const f = onFace(R * 0.55, s * 0.33); if (f.d < 0.3) continue; tline(ctx, [P(f.x, R * 0.5 + py), P(f.x + s * R * 0.05, R * 0.66 + py), P(f.x + s * R * 0.03, R * 0.8 + py)], S.lw * 0.45, C.skinS, 0.2, 0.2); }
  }
  if (H.glasses) {
    ctx.strokeStyle = '#8a3b2b'; ctx.lineWidth = S.lw * 0.6;
    const gy = eyeY + R * 0.05; ctx.fillStyle = 'rgba(200,230,255,0.22)';
    for (const e of eyes) { ctx.beginPath(); ctx.roundRect(e.x - e.rx * 1.3, gy - e.ry * 0.95, e.rx * 2.6, e.ry * 1.75, R * 0.1); ctx.fill(); ctx.stroke(); ctx.save(); ctx.globalAlpha = 0.5; tline(ctx, [P(e.x - e.rx * 0.9, gy - e.ry * 0.2), P(e.x - e.rx * 0.4, gy - e.ry * 0.7)], S.lw * 0.45, '#ffffff', 0.4, 0.4); ctx.restore(); }
    if (eyes.length === 2) { ctx.beginPath(); ctx.moveTo(eyes[0].x + eyes[0].rx * 1.3, gy - eyes[0].ry * 0.3); ctx.quadraticCurveTo((eyes[0].x + eyes[1].x) / 2, gy - eyes[0].ry * 0.6, eyes[1].x - eyes[1].rx * 1.3, gy - eyes[0].ry * 0.3); ctx.stroke(); }
    ctx.strokeStyle = '#e0b84a'; ctx.lineWidth = S.lw * 0.45; ctx.setLineDash([R * 0.05, R * 0.06]);
    for (const e of eyes) { if (Math.abs(e.s * 1 + sn) < 0.4 && eyes.length === 1) continue; const sx2 = e.x + e.s * e.rx * 1.3, sp2 = spanAt(hpts, R * 0.9); const ex2 = sp2.c + e.s * sp2.hw * 1.05; const sw = cl(sec.x * 0.4, -R * 0.12, R * 0.12); ctx.beginPath(); ctx.moveTo(sx2, gy); ctx.quadraticCurveTo(ex2 + e.s * R * 0.2 + sw, gy + R * 0.6, ex2 + e.s * R * 0.05 + sw * 0.5, R * 1.55); ctx.stroke(); }
    ctx.setLineDash([]); ctx.strokeStyle = INK;
  }
  // nose (+ nostril & highlight)
  const ny = R * H.noseY + py, spn = spanAt(hpts, R * H.noseY), nx = spn.c + spn.hw * sn * 0.97;
  const nw = { round: 0.125, long: 0.14, broad: 0.19, button: 0.11 }[H.nose] * R, nh = { round: 0.115, long: 0.22, broad: 0.13, button: 0.1 }[H.nose] * R;
  const nxo = nx + sn * nw * 0.55, sd = sn >= 0 ? 1 : -1;
  if (H.nose === 'long') {
    G(ctx, S, [{ p: spl([[nxo - nw, ny + nh * 0.4], [nxo - nw * 0.4, ny - nh * 1.4], [nxo + sn * nw * 0.6, ny - nh * 0.3], [nxo + nw * 1.0 + sn * nw * 0.5, ny + nh * 0.5], [nxo, ny + nh * 0.75]]), c: C.skin, s: C.skinS, o: nw * 0.45, oy: 0, ht: 0.6 }]);
  } else {
    G(ctx, S, [{ p: ell(nxo, ny, nw * (1 - 0.15 * Math.abs(sn)), nh), c: C.skin, s: C.skinS, o: nw * 0.5, oy: 0, ht: 0.6 }]);
  }
  ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(nxo - nw * 0.35 - sn * nw * 0.2, ny - nh * 0.4, nw * 0.2, nh * 0.15, -0.5, 0, TAU); ctx.fill(); ctx.restore();
  if (H.nose === 'broad' && cs > 0.4) { ctx.fillStyle = C.skinS; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(nxo + s * nw * 0.45, ny + nh * 0.35, nw * 0.16, nh * 0.2, 0, 0, TAU); ctx.fill(); } }
  // mouth
  if (cs > -0.05) {
    const my = R * H.mouthY + py + jaw * R * 0.06, spm = spanAt(hpts, R * H.mouthY), mx = spm.c + spm.hw * sn * 0.86;
    ctx.save(); ctx.translate(mx, my); ctx.scale(mu * (0.5 + 0.5 * cs), mu);
    drawMouth(ctx, st, m, C, mu);
    ctx.restore();
    if (H.stache) {
      const y = my - R * 0.12, w = R * 0.32 * (0.55 + 0.45 * cs);
      ctx.strokeStyle = INK; ctx.lineWidth = R * 0.05 + 2 * S.lw * 0.55;
      const path = (s) => { ctx.beginPath(); ctx.moveTo(mx, y - R * 0.02); ctx.quadraticCurveTo(mx + s * w * 0.6, y - R * 0.09, mx + s * w, y); ctx.quadraticCurveTo(mx + s * w * 1.25, y + R * 0.02, mx + s * w * 1.15, y - R * 0.12); };
      for (const s of [-1, 1]) { path(s); ctx.stroke(); }
      ctx.strokeStyle = H.stache; ctx.lineWidth = R * 0.05; for (const s of [-1, 1]) { path(s); ctx.stroke(); }
      ctx.strokeStyle = '#8a827b'; ctx.lineWidth = R * 0.015; for (const s of [-1, 1]) { path(s); ctx.stroke(); }
      ctx.strokeStyle = INK;
    }
  }
}
const fyaw = (th) => { const a = Math.atan2(Math.sin(th), Math.cos(th)); return Math.abs(a) >= HP ? a : a - 0.25 * Math.sin(2 * a); }; // smooth feature yaw

function drawEye(ctx, st, x, y, rx, ry, E, lx, ly, blink, s) {
  const { S, C, r } = st, R = r.head.R, lidAdd = C.lidAdd || 0;
  const hap = E.happy || 0, sqz = E.squint || 0;
  const outerT = (a, b) => (s < 0 ? [a, b] : [b, a]);
  if (hap >= 0.55) {
    tline(ctx, qpts(P(x - rx, y + ry * 0.15), P(x, y - ry * 0.95), P(x + rx, y + ry * 0.15), 10), S.lw * 1.6, INK, ...outerT(0.7, 0.35));
    if (C.lash) tline(ctx, [P(x + s * rx * 0.9, y + ry * 0.05), P(x + s * rx * 1.3, y - ry * 0.3)], S.lw * 0.8, INK, 0.8, 0.2);
    return;
  }
  if (sqz >= 0.55) { tline(ctx, [P(x + s * rx * 0.9, y - ry * 0.55), P(x - s * rx * 0.55, y + ry * 0.02), P(x + s * rx * 0.9, y + ry * 0.45)], S.lw * 1.5, INK, 0.4, 0.4); return; }
  const lt = Math.max(cl((E.lt || 0) + lidAdd * (E.lt ? 0.3 : 1) + hap * 0.35 + sqz * 0.5, 0, 0.92), blink);
  const lb = cl((E.lb || 0) + hap * 0.45 + sqz * 0.3, 0, 0.8);
  if (lt > 0.88) { tline(ctx, qpts(P(x - rx, y + ry * 0.1), P(x, y + ry * 0.45), P(x + rx, y + ry * 0.1), 8), S.lw * 1.4, INK, ...outerT(0.8, 0.3)); tline(ctx, [P(x + s * rx * 0.95, y + ry * 0.15), P(x + s * rx * 1.2, y + ry * 0.0)], S.lw * 0.7, INK, 0.8, 0.2); return; }
  const p = ell(x, y, rx, ry);
  ctx.lineWidth = 2 * S.lw; ctx.strokeStyle = INK; ctx.stroke(p); ctx.fillStyle = '#ffffff'; ctx.fill(p);
  ctx.save(); ctx.clip(p);
  shade(ctx, p, '#e2e0ee', 0, ry * 0.3, 0);
  const prr = R * C.head.erx * 0.5 * (E.p || 1), sxk = Math.min(1, rx / (R * C.head.erx) + 0.2);
  const px = x + cl(lx, -1, 1) * Math.max(0, rx - prr * 0.7) * 0.75, pyy = y + cl(ly, -1, 1) * (ry - prr) * 0.7 + ry * 0.05;
  ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(px, pyy, prr * sxk, prr, 0, 0, TAU); ctx.fill();
  const dead = (E.dead || 0) > 0.5;
  if (!dead && prr > R * 0.04) { ctx.fillStyle = C.iris || '#6a4a3a'; ctx.beginPath(); ctx.ellipse(px, pyy, prr * 0.84 * sxk, prr * 0.84, 0, 0, TAU); ctx.ellipse(px, pyy, prr * 0.5 * sxk, prr * 0.5, 0, 0, TAU); ctx.fill('evenodd'); ctx.globalAlpha = 0.35; ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(px, pyy - prr * 0.25, prr * 0.84 * sxk, prr * 0.6, 0, Math.PI, TAU); ctx.fill(); ctx.globalAlpha = 1; }
  if (!dead) {
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(px - prr * 0.35 * sxk, pyy - prr * 0.4, prr * (E.spark ? 0.38 : 0.28), 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(px + prr * 0.38 * sxk, pyy + prr * 0.36, prr * (E.spark ? 0.17 : 0.12), 0, TAU); ctx.fill();
  }
  ctx.fillStyle = C.skin; ctx.strokeStyle = INK;
  if (lt > 0.01) { const ly0 = y - ry + 2 * ry * lt; ctx.beginPath(); ctx.moveTo(x - rx * 1.2, y - ry * 1.2); ctx.lineTo(x + rx * 1.2, y - ry * 1.2); ctx.lineTo(x + rx * 1.2, ly0 - ry * 0.12); ctx.quadraticCurveTo(x, ly0 + ry * 0.12, x - rx * 1.2, ly0 - ry * 0.12); ctx.closePath(); ctx.fill(); ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = C.skinS; ctx.translate(0, -ry * 0.25); ctx.fill(); ctx.restore(); ctx.lineWidth = S.lw * 1.3; ctx.beginPath(); ctx.moveTo(x - rx * 1.2, ly0 - ry * 0.12); ctx.quadraticCurveTo(x, ly0 + ry * 0.12, x + rx * 1.2, ly0 - ry * 0.12); ctx.stroke(); }
  if (lb > 0.01) { const ly1 = y + ry - 2 * ry * lb; ctx.beginPath(); ctx.moveTo(x - rx * 1.2, y + ry * 1.2); ctx.lineTo(x + rx * 1.2, y + ry * 1.2); ctx.lineTo(x + rx * 1.2, ly1 + ry * 0.15); ctx.quadraticCurveTo(x, ly1 - ry * 0.2, x - rx * 1.2, ly1 + ry * 0.15); ctx.closePath(); ctx.fill(); ctx.lineWidth = S.lw * 0.7; ctx.beginPath(); ctx.moveTo(x - rx * 1.2, ly1 + ry * 0.15); ctx.quadraticCurveTo(x, ly1 - ry * 0.2, x + rx * 1.2, ly1 + ry * 0.15); ctx.stroke(); }
  ctx.restore();
  ctx.lineWidth = S.lw * 0.5; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.stroke();
  if (lt < 0.05) tline(ctx, arcPts(x, y, rx, ry, Math.PI + 0.3, TAU - 0.3, 12), S.lw * 1.15, INK, ...outerT(0.9, 0.25));
  const ly0 = y - ry + 2 * ry * Math.max(lt, 0.18);
  if (C.lash) { tline(ctx, [P(x + s * rx * 0.86, ly0 + ry * 0.12), P(x + s * rx * 1.3, ly0 - ry * 0.2)], S.lw, INK, 0.9, 0.15); tline(ctx, [P(x + s * rx * 0.6, ly0 - ry * 0.02), P(x + s * rx * 0.82, ly0 - ry * 0.4)], S.lw * 0.7, INK, 0.9, 0.15); }
  if (lt < 0.45 && st.lwPx > 6) { ctx.save(); ctx.globalAlpha = 0.6; const a0 = s < 0 ? Math.PI + 0.5 : TAU - 1.35, a1 = s < 0 ? Math.PI + 1.35 : TAU - 0.5; tline(ctx, arcPts(x, y - ry * 0.08, rx * 1.05, ry * 1.25, a0, a1, 6), S.lw * 0.42, C.crease || C.skinS, 0.2, 0.2); ctx.restore(); }
}

function drawMouth(ctx, st, m, C, mu) {
  const lw = st.S.lw / mu, N = 14, w = m.w, c1 = m.c, c2 = m.c + (m.sk || 0), mid = (c1 + c2) / 2, k = lerp(1 / 3, 1, cl(m.rnd || 0, 0, 1));
  const curve = (my, sq) => { const out = [], y1 = c1 + 4 / 3 * (my - mid), y2 = c2 + 4 / 3 * (my - mid); for (let i = 0; i <= N; i++) { const u = i / N, a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, cc = 3 * (1 - u) * u * u, d = u ** 3; out.push(P(a * -w + b * -w * k + cc * w * k + d * w, a * c1 + b * y1 + cc * y2 + d * c2 + sq * 0.55 * Math.sin(u * TAU * 1.5) * Math.sin(u * Math.PI))); } return out; };
  const open = m.bot - m.top, lipC = C.lips, sq = m.sq || 0;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = INK;
  const lowerLip = (y) => { ctx.save(); ctx.globalAlpha = 0.55; tline(ctx, qpts(P(-w * 0.3, y), P(0, y + 0.55), P(w * 0.3, y), 6), lw * 0.55, INK, 0.1, 0.1); ctx.restore(); };
  if (open < 0.5) {
    const ln = curve((m.top + m.bot) / 2, sq);
    if (lipC) { tline(ctx, ln.map((p) => P(p.x * 0.85, p.y + 0.5)), Math.min(lw * 2.6, w * 0.7), lipC, 0.3, 0.3); }
    tline(ctx, ln, lw * 1.3, INK, 0.4, 0.4);
    if (c1 < -1) tline(ctx, [P(-w - 0.55, c1 - 0.9), P(-w + 0.15, c1 + 0.45)], lw * 0.6, INK, 0.2, 0.5);
    if (c2 < -1) tline(ctx, [P(w + 0.55, c2 - 0.9), P(w - 0.15, c2 + 0.45)], lw * 0.6, INK, 0.2, 0.5);
    if (!lipC) lowerLip(Math.max(c1, c2, (m.top + m.bot) / 2) + 1.6);
    return;
  }
  const up = curve(m.top, sq), lo = curve(m.bot, sq * 0.6);
  const p = new Path2D(); p.moveTo(up[0].x, up[0].y); for (const q of up) p.lineTo(q.x, q.y); for (let i = lo.length - 1; i >= 0; i--) p.lineTo(lo[i].x, lo[i].y); p.closePath();
  ctx.lineWidth = lw * 1.6; ctx.stroke(p);
  ctx.fillStyle = '#5a1830'; ctx.fill(p);
  ctx.save(); ctx.clip(p);
  if ((m.cl || 0) > 0.5) {
    ctx.fillStyle = '#ffffff'; ctx.fill(p); ctx.lineWidth = lw * 0.38; ctx.strokeStyle = '#6a6480';
    const mm = up.map((q, i) => P(q.x, (q.y + lo[i].y) / 2)); pl(ctx, mm); ctx.stroke();
    for (const x of [-0.3, 0.3]) { ctx.beginPath(); ctx.moveTo(x * w, -9); ctx.lineTo(x * w, 9); ctx.stroke(); } ctx.strokeStyle = INK;
    ctx.fillStyle = 'rgba(28,21,48,0.12)'; ctx.fillRect(-w - 1, m.top - 2, 2 * w + 2, 1.9);
  } else {
    if ((m.tongue || 0) > 0.05) { ctx.fillStyle = '#e8707f'; ctx.beginPath(); ctx.ellipse(0, m.bot + 0.2, w * 0.58, Math.min(2.2, open * 0.42) * m.tongue + 0.3, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#c95264'; ctx.beginPath(); ctx.ellipse(0.1, m.bot - Math.min(1.6, open * 0.3) * m.tongue + 0.6, 0.18, 0.7, 0, 0, TAU); ctx.fill(); }
    const tv = Math.max(m.tf || 0, (m.teeth || 0) * sstep(1.4, 3.0, open));
    if (tv > 0.02) { const h = Math.min(1.35, Math.max(0.6, open * 0.3)) * tv; const tp = new Path2D(); tp.moveTo(up[0].x, up[0].y); for (const q of up) tp.lineTo(q.x, q.y); for (let i = up.length - 1; i >= 0; i--) tp.lineTo(up[i].x, up[i].y + h * Math.pow(Math.sin(i / N * Math.PI), 0.4)); ctx.fillStyle = '#ffffff'; ctx.fill(tp); ctx.fillStyle = '#e4e2ee'; ctx.fillRect(-w, -9, w * 0.25, 18); }
    const bv = (m.tb || 0) * sstep(2.5, 4, open);
    if (bv > 0.02) { const h = 1.0 * bv; const tp = new Path2D(); tp.moveTo(lo[0].x, lo[0].y); for (const q of lo) tp.lineTo(q.x, q.y); for (let i = lo.length - 1; i >= 0; i--) tp.lineTo(lo[i].x, lo[i].y - h * Math.pow(Math.sin(i / N * Math.PI), 0.4)); ctx.fillStyle = '#f4f2fa'; ctx.fill(tp); }
    ctx.fillStyle = 'rgba(28,21,48,0.22)'; ctx.beginPath(); for (const q of up) ctx.lineTo(q.x, q.y + 0.9); for (let i = up.length - 1; i >= 0; i--) ctx.lineTo(up[i].x, up[i].y - 3); ctx.fill();
  }
  ctx.restore();
  ctx.lineWidth = lw * 0.7; ctx.stroke(p);
  if (lipC) { ctx.strokeStyle = lipC; ctx.lineWidth = lw * 0.7; ctx.stroke(p); ctx.strokeStyle = INK; ctx.lineWidth = lw * 0.5; ctx.stroke(p); }
  else if (open < 3.2) lowerLip(m.bot + 1.5);
}

function sweat(ctx, st, hpts, R, amt) {
  const { S, r, t } = st; const sp = spanAt(hpts, -R * 0.2);
  const side = r.sn > 0.3 ? -1 : 1; const x = sp.c + side * sp.hw * 0.78, ph = (t % 45) / 45;
  const drop = (x, y, s) => { const p = new Path2D(); p.moveTo(x, y - s * 1.6); p.bezierCurveTo(x + s * 0.4, y - s * 0.7, x + s, y - s * 0.1, x + s, y + s * 0.35); p.arc(x, y + s * 0.35, s, 0, Math.PI); p.bezierCurveTo(x - s, y - s * 0.1, x - s * 0.4, y - s * 0.7, x, y - s * 1.6); return p; };
  const s = R * 0.11 * Math.sqrt(amt), y = -R * 0.3 + ph * R * 0.25;
  G(ctx, S, [{ p: drop(x, y, s), c: '#8fdcff', s: '#5bb8ea', o: s * 0.4, oy: 0, ht: 0 }]);
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x - s * 0.35, y + s * 0.2, s * 0.22, s * 0.35, 0, 0, TAU); ctx.fill();
  if (amt > 0.6) G(ctx, S, [{ p: drop(x + side * R * 0.18, -R * 0.55 + ((ph + 0.5) % 1) * R * 0.2, s * 0.6), c: '#8fdcff' }]);
}
function smoke(ctx, st, R) {
  const { S, t } = st;
  for (let i = 0; i < 4; i++) {
    const ph = ((t * 0.011 + i / 4) % 1), y = -R * 1.25 - ph * R * 1.9, x = Math.sin(ph * 5 + i * 2) * R * 0.25 + (i - 1.5) * R * 0.28;
    const rr = R * (0.13 + ph * 0.22); ctx.globalAlpha = Math.min(1, (1 - ph) * 1.6) * 0.85;
    G(ctx, { ...S, lw: S.lw * 0.6 }, [{ p: ell(x, y, rr, rr * 0.85), c: '#cfc9d6', s: '#b3acbd', o: rr * 0.3, oy: 0, ht: 0 }, { p: ell(x + rr * 0.7, y - rr * 0.4, rr * 0.7, rr * 0.6), c: '#cfc9d6' }]);
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- hats
function hatShape(R, W, th, ef, hTop, wTop, backShift) {
  const ring = ringPts(R, W, th, ef, 40); const sn = Math.sin(th);
  const pts = ring.map((p) => [p[0], p[1]]);
  for (let i = 0; i <= 14; i++) { const a = -0.25 - i / 14 * (Math.PI - 0.5); const up = -Math.sin(a); pts.push([Math.cos(a) * R * W * wTop - sn * R * backShift * up, Math.sin(a) * R * hTop]); }
  return { ring, p: spl(pts.filter((_, i) => i % 2 === 0 || i >= ring.length)) };
}
function drawHatFront(ctx, st, R, W, hat) {
  const { r, S } = st, th = r.th;
  if (hat.type === 'beanie') {
    const ef = (a) => hat.eb - 0.12 * (1 - Math.cos(a)) / 2;
    const hs_ = hatShape(R, W, th, ef, hat.H, 1.08, 0.3);
    G(ctx, S, [{ p: hs_.p, c: hat.c, s: hat.s, o: R * 0.2, oy: R * 0.05, tx: 'rib', ta: 0.12, tu: S.lw * 1.4 }]);
    const ring2 = ringPts(R, W, th, (a) => ef(a) + 0.32, 40);
    ctx.save(); ctx.clip(hs_.p); ctx.fillStyle = hat.cuff; ctx.fill(aboveRing(ring2, R, true));
    shade(ctx, aboveRing(ring2, R, true), hat.s, 0, 0, 0);
    ctx.lineWidth = S.lw; ctx.beginPath(); ring2.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    for (let i = 2; i < ring2.length - 1; i += 3) { const a = hs_.ring[Math.min(i, hs_.ring.length - 1)], b = ring2[i]; tline(ctx, [P(a[0], a[1] - R * 0.04), P(b[0], b[1] + R * 0.04)], S.lw * 0.42, INK, 0.3, 0.3); }
    const v = th; if (Math.cos(v) > 0.2) { const x = R * W * 0.98 * Math.sin(-0.35 + v) * Math.cos(hat.eb + 0.16), y = -R * Math.sin(hat.eb + 0.16); ctx.fillStyle = '#f6f1e6'; ctx.beginPath(); ctx.roundRect(x - R * 0.12 * Math.cos(v - 0.35), y - R * 0.07, R * 0.24 * Math.cos(v - 0.35), R * 0.14, R * 0.03); ctx.fill(); ctx.lineWidth = S.lw * 0.5; ctx.stroke(); }
    ctx.restore();
  } else {
    const ring = ringPts(R, W, th, () => hat.eb, 40).map((p) => [p[0] * 1.07, p[1] + R * 0.03]);
    const f0 = ring[0], f1 = ring[ring.length - 1], topY = -R * 1.0;
    const band = { p: spl([...ring.filter((_, i) => i % 3 === 0 || i === ring.length - 1), [f1[0] * 1.02, lerp(f1[1], topY, 0.5)], [f1[0] * 0.97, topY], [0, topY - R * 0.03], [f0[0] * 0.97, topY], [f0[0] * 1.02, lerp(f0[1], topY, 0.5)]]) };
    G(ctx, S, [{ p: band.p, c: hat.c, s: hat.s, o: R * 0.18, oy: 0, ht: 0.5 }]);
    const ring2 = ringPts(R, W, th, () => hat.eb + 0.2, 40).map((p) => [p[0] * 1.07, p[1]]);
    ctx.save(); ctx.clip(band.p); ctx.lineWidth = S.lw * 0.6; ctx.beginPath(); ring2.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    stitch(ctx, S, ring2.map((p) => P(p[0], p[1] - R * 0.08)), hat.s, 0.3); ctx.restore();
  }
}
function toqueColumn(ctx, st, R, W, hat) {
  const { r, S, t, sec } = st, sn = r.sn;
  const base = -R * 0.72, Hh = R * hat.H, w0 = R * W * hat.w;
  ctx.save();
  const m = shearM(0, base, cl(sec.x * 2.4, -R * 0.8, R * 0.8), cl(sec.y * 2.2, -R * 0.6, R * 0.6), Hh); ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
  if (hat.type === 'tall') {
    const top = base - Hh, w1 = w0 * 1.12, cx = -sn * R * 0.08;
    const col = poly([[cx - w0, base], [cx - w1, top + R * 0.3], [cx + w1, top + R * 0.3], [cx + w0, base]]);
    const puffs = []; for (let i = 0; i < 5; i++) { const u = i / 4 - 0.5; puffs.push({ p: ell(cx + u * w1 * 1.7, top + R * 0.1 - Math.cos(u * 2.4) * R * 0.25, R * 0.48, R * 0.42), c: hat.c, s: hat.s, o: R * 0.15, oy: 0, ht: 0.5 }); }
    G(ctx, S, [...puffs, { p: col, c: hat.c, s: hat.s, o: R * 0.3, oy: 0, ht: 0.5 }]);
    for (let i = 1; i < 6; i++) { const u = i / 6 * 2 - 1; const ph = u + sn * 0.3; if (Math.abs(ph) > 0.95) continue; line(ctx, S, [P(cx + ph * w0 * 0.95, base - R * 0.2), P(cx + ph * w1 * 0.95, top + R * 0.45)], 0.45, '#b8b4ab'); }
  } else {
    const sway = Math.sin(t * 0.07) * 0.08, dir = sn > 0.3 ? -1 : 1;
    const cx = -sn * R * 0.05, w1 = w0 * 1.25;
    const top = base - Hh, bx = dir * R * (0.9 + sway * 4) + cl(sec.x * 1.5, -R * 0.6, R * 0.6);
    const L = [], Rr = [];
    for (let i = 0; i <= 8; i++) { const u = i / 8; const x = cx + bx * u * u, y = lerp(base, top, u) + R * 0.35 * u * u * u; const w = lerp(w0, w1, u); L.push([x - w, y]); Rr.push([x + w, y]); }
    const col = poly([...L, ...Rr.reverse()]);
    const tx = cx + bx, ty = top + R * 0.35;
    const puffs = [[0, 0, 0.62], [dir * 0.55, 0.32, 0.5], [-dir * 0.5, -0.1, 0.48], [dir * 0.95, 0.7, 0.42]].map(([ox, oy, rr]) => ({ p: ell(tx + ox * R, ty + oy * R - R * 0.2, R * rr, R * rr * 0.88), c: hat.c, s: hat.s, o: R * 0.15, oy: 0, ht: 0.5 }));
    G(ctx, S, [{ p: col, c: hat.c, s: hat.s, o: R * 0.3, oy: 0, ht: 0.5 }, ...puffs]);
    for (const u of [-0.5, 0, 0.5]) line(ctx, S, [P(cx + u * w0, base - R * 0.2), P(cx + bx * 0.35 + u * w1 * 0.9, base - Hh * 0.6)], 0.4, '#b8b4ab');
    if (st.soot > 0) sootDots(ctx, st, tx, ty, R * 0.3, 3, 77);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- rim / flash light
function rimOn(ctx, st, p, off) {
  const L = st.o.light; if (!L || !(L.amt > 0)) return; const amt = cl(L.amt, 0, 1), dir = L.dir || 1;
  ctx.save(); ctx.clip(p); ctx.fillStyle = L.col;
  ctx.globalAlpha = (L.tint ?? 0.12) * amt; if (ctx.globalAlpha > 0) ctx.fill(p);
  ctx.globalAlpha = 0.9 * amt; const q = new Path2D(); q.rect(-BIG, -BIG, 2 * BIG, 2 * BIG); q.addPath(p, { a: 1, b: 0, c: 0, d: 1, e: -dir * off, f: off * 0.25 }); ctx.fill(q, 'evenodd');
  ctx.restore();
}
