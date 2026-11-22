// cast2d.js — flat-2D vector cast for "The Chef Résumé". Pure Canvas 2D, no imports.
// drawChar(ctx, name, o) / bounds(name, o). Units: each character is designed in a 100-unit-tall
// space (feet at 0, top of hair at -100, y up = negative) and scaled by o.h/100.
export const CAST = ['SAM', 'SAM_SOOT', 'SAM_CHEF', 'HEADCHEF', 'ROOMMATE', 'MOM'];
// Recommended relative standing heights (multiply Sam's h): use REL_H[name] * hSam for consistent scale.
export const REL_H = { SAM: 1, SAM_SOOT: 1, SAM_CHEF: 1, HEADCHEF: 1.1, ROOMMATE: 1.12, MOM: 0.92 };

const INK = '#1c1530', TAU = Math.PI * 2, HP = Math.PI / 2;
const VIEWS = { front: 0, '34R': 0.7, sideR: HP, '34L': -0.7, sideL: -HP, back: Math.PI };
const lerp = (a, b, t) => a + (b - a) * t, cl = (v, a, b) => (v < a ? a : v > b ? b : v);
const hs = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

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
// hard-edged shadow: fill the part of p NOT covered by p shifted (dx,dy) toward the light
function shade(ctx, p, col, dx, dy) {
  ctx.save(); ctx.clip(p); const q = new Path2D(); q.rect(-BIG, -BIG, 2 * BIG, 2 * BIG);
  q.addPath(p, { a: 1, b: 0, c: 0, d: 1, e: dx, f: dy }); ctx.fillStyle = col; ctx.fill(q, 'evenodd'); ctx.restore();
}
// merged group: all ink first (outer outline), then fills -> overlapping parts share one silhouette
function G(ctx, S, items) {
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = INK;
  for (const it of items) { if (!it) continue; if (it.pts) { ctx.lineWidth = it.w + 2 * S.lw; pl(ctx, it.pts); ctx.stroke(); } else { ctx.lineWidth = 2 * S.lw; ctx.stroke(it.p); } }
  for (const it of items) {
    if (!it) continue;
    if (it.pts) fillTube(ctx, S, it);
    else { ctx.fillStyle = it.c; ctx.fill(it.p); if (it.s) shade(ctx, it.p, it.s, -S.sd * (it.o ?? 1.5), -(it.oy ?? 0.5)); }
  }
}
function fillTube(ctx, S, it) {
  const { pts, w, c, s } = it; pl(ctx, pts);
  if (s) {
    ctx.strokeStyle = s; ctx.lineWidth = w; ctx.stroke();
    const a = pts[0], b = pts[pts.length - 1]; let nx = -(b.y - a.y), ny = b.x - a.x; const L = Math.hypot(nx, ny);
    if (L < 1e-3) { nx = -S.sd; ny = 0; } else { nx /= L; ny /= L; }
    if (Math.abs(nx) < 0.3) { if (ny > 0) { nx = -nx; ny = -ny; } } else if (nx * S.sd > 0) { nx = -nx; ny = -ny; }
    ctx.save(); ctx.translate(nx * w * 0.21, ny * w * 0.21); pl(ctx, pts); ctx.strokeStyle = c; ctx.lineWidth = w * 0.58; ctx.stroke(); ctx.restore();
  } else { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); }
  ctx.strokeStyle = INK;
}
function inkP(ctx, S, p, c, s, ox, oy) { G(ctx, S, [{ p, c, s, o: ox, oy }]); }
function line(ctx, S, pts, k = 1, col = INK) { ctx.strokeStyle = col; ctx.lineWidth = S.lw * k; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; pl(ctx, pts); ctx.stroke(); ctx.strokeStyle = INK; }
const P = (x, y) => ({ x, y });
const along = (pts, f) => { // point at fraction f of polyline length (+ sub-polyline)
  let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); seg.push(l); L += l; }
  let d = L * f; const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) { if (d <= seg[i - 1]) { const u = seg[i - 1] ? d / seg[i - 1] : 0; out.push(P(lerp(pts[i - 1].x, pts[i].x, u), lerp(pts[i - 1].y, pts[i].y, u))); return out; } d -= seg[i - 1]; out.push(pts[i]); }
  return out;
};

// ---------------------------------------------------------------- character definitions
const HAIR_SAM = (a) => { const A = Math.abs(a); let e = A < HP ? 0.88 - 0.94 * Math.pow(A / HP, 1.4) : lerp(-0.06, -1.05, Math.pow((A - HP) / HP, 0.8)); if (A < 1.3) e -= 0.2 * Math.pow(1 - Math.abs(Math.sin(a * 3.6 + 0.9)), 1.6) * (1 - A / 1.6); return e; };
const HAIR_FRIZZ = (a) => HAIR_SAM(a) + 0.05 * (1 - Math.abs(Math.sin(a * 9)));
const SAMBASE = {
  relH: 1, skin: '#c98a5e', skinS: '#a56a44', blush: '#e2705a', lips: null, defExpr: 'neutral',
  head: { R: 12.4, cy: -82, W: 1, low: 1.15, taper: 0.36, sq: 1, top: 1, eyeA: 0.5, eyeY: 0.1, erx: 0.235, ery: 0.3, noseY: 0.45, mouthY: 0.74, nose: 'round', brW: 0.13, brCol: '#2e1f22', ears: 1 },
  hair: { c: '#3a2626', s: '#25171a', hi: '#6a4744', line: HAIR_SAM, vol: { r: 1.13, amp: 0.085, n: 7, ext: 0.25, cy: -0.03, mode: 'wavy' }, cow: 1 },
  body: { neckW: 4.4, shY: -64.5, sx: 8.4, sd: 5.2, hemY: -37, hemX: 8.9, hemD: 5.8, hipY: -38.5, hipX: 3.7, legW: 6.6, armW: 5.4, ua: 12.4, fa: 12.2, thigh: 17.6, shin: 17.2, footY: -4, sitY: -23 },
  top: { type: 'hoodie', c: '#f2b52b', s: '#c98c16', tee: '#f6f1e6', teeS: '#d8cdbb' },
  sleeve: { c: '#f2b52b', s: '#c98c16', len: 1, cuff: 1 },
  pants: { c: '#2f5193', s: '#22396d', len: 1, cuff: '#3b62ad' },
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
    top: { type: 'chef', c: '#fbfaf7', s: '#d6d3cb', btn: '#c9c3b6', hood: '#f2b52b', hoodS: '#c98c16', sloppy: 1 },
    sleeve: { c: '#fbfaf7', s: '#d6d3cb', len: 1.14, wide: 2.2 },
  },
  HEADCHEF: {
    relH: 1.1, skin: '#f0c8a8', skinS: '#d29f80', blush: '#e88f80', defExpr: 'stern', defPose: 'armsCrossed',
    head: { R: 11, cy: -85.5, W: 0.98, low: 1.16, taper: 0.16, sq: 0.55, top: 1.02, eyeA: 0.46, eyeY: 0.05, erx: 0.2, ery: 0.25, noseY: 0.38, mouthY: 0.74, nose: 'long', brW: 0.2, brCol: '#56504c', ears: 1, stache: '#5a524d', lines: 1 },
    hair: { c: '#a8a39c', s: '#86817a', hi: '#d2cec8', line: (a) => { const A = Math.abs(a); return A < HP ? lerp(0.62, 0.02, Math.pow(A / HP, 1.3)) : lerp(0.02, -1.0, Math.pow((A - HP) / HP, 0.8)); }, vol: { r: 1.04, amp: 0.03, n: 6, ext: 0.3, cy: 0.05, mode: 'wavy' } },
    hat: { type: 'tall', c: '#ffffff', s: '#dad8d2', eb: 0.7, H: 2.25, w: 0.92 },
    body: { neckW: 5.6, shY: -69, sx: 11.4, sd: 7.4, hemY: -33, hemX: 11.6, hemD: 7.8, hipY: -38, hipX: 4.6, legW: 7.6, armW: 6.4, ua: 13.6, fa: 13, thigh: 17.4, shin: 16.8, footY: -3.8, sitY: -23 },
    top: { type: 'chefDB', c: '#fbfaf6', s: '#d8d5cd', btn: '#2c2742', scarf: '#d8332f', scarfS: '#a92322' },
    sleeve: { c: '#fbfaf6', s: '#d8d5cd', len: 1, cuff: 1 },
    pants: { c: '#34323f', s: '#25232e', len: 1, check: 1 },
    shoes: { type: 'clog', c: '#2b2735', s: '#1f1c28', sole: '#3a3546' },
  },
  ROOMMATE: {
    relH: 1.12, skin: '#7f5137', skinS: '#643d29', blush: '#9a5038', defExpr: 'deadpan', lidAdd: 0.3,
    head: { R: 10, cy: -86.5, W: 0.86, low: 1.32, taper: 0.22, sq: 0.8, top: 1.07, eyeA: 0.46, eyeY: 0.12, erx: 0.22, ery: 0.29, noseY: 0.5, mouthY: 0.9, nose: 'broad', brW: 0.12, brCol: '#1d1416', ears: 1, stud: 1 },
    hair: { c: '#221819', s: '#160f10', hi: '#3d2d2d', line: (a) => { const A = Math.abs(a); return A < HP ? lerp(0.5, 0.12, Math.pow(A / HP, 1.2)) : lerp(0.12, -1.0, Math.pow((A - HP) / HP, 0.8)); }, vol: null },
    hat: { type: 'beanie', c: '#e2622f', s: '#b84a1f', cuff: '#c95424', eb: 0.36, H: 1.36 },
    body: { neckW: 4.2, shY: -69.5, sx: 9.6, sd: 5.4, hemY: -36.5, hemX: 10.4, hemD: 6.4, hipY: -42, hipX: 3.9, legW: 5.0, armW: 4.4, ua: 15.2, fa: 14.8, thigh: 19.6, shin: 19, footY: -2.2, sitY: -25 },
    top: { type: 'tee', c: '#7457c4', s: '#573ea1', teeS: '#4f3793', graphic: 'planet' },
    sleeve: { c: '#7457c4', s: '#573ea1', len: 0.44, wide: 3.2 },
    pants: { c: '#d8443b', s: '#ad2e27', len: 0.6, wide: 3.6, stripe: '#f6f1e6', sock: '#f4f1ea', sockS: '#d4cfc4' },
    shoes: { type: 'slide', c: '#2b2a3a', s: '#1d1c29', sole: '#3fb6a8' },
  },
  MOM: {
    relH: 0.92, skin: '#e7b28c', skinS: '#c98e68', blush: '#ec8b7c', lips: '#c4505e', defExpr: 'neutral', lash: 1,
    head: { R: 12.6, cy: -80, W: 1.02, low: 1.04, taper: 0.3, sq: 0.9, top: 1, eyeA: 0.48, eyeY: 0.06, erx: 0.225, ery: 0.29, noseY: 0.38, mouthY: 0.68, nose: 'button', brW: 0.1, brCol: '#5a2b1d', ears: 1, glasses: 1, earring: 1 },
    hair: { c: '#7c3b24', s: '#5b2817', hi: '#b2603e', line: (a) => { const A = Math.abs(a); let e = A < HP ? 0.78 - 0.9 * Math.pow(A / HP, 1.3) : lerp(-0.12, -0.95, Math.pow((A - HP) / HP, 0.8)); return e + 0.08 * Math.abs(Math.sin(a * 6.5)); }, vol: { r: 1.2, amp: 0.11, n: 13, ext: 1.0, cy: 0.0, mode: 'curly' } },
    body: { neckW: 4.6, shY: -63.5, sx: 9.4, sd: 6.4, hemY: -33.5, hemX: 10.4, hemD: 7.2, hipY: -37.5, hipX: 4.1, legW: 7.0, armW: 5.6, ua: 12.4, fa: 11.8, thigh: 16.6, shin: 16.4, footY: -3, sitY: -22 },
    top: { type: 'cardigan', c: '#2f9488', s: '#216d64', blouse: '#f7ead0', blouseS: '#dcc9a6', btn: '#f3d9a0' },
    sleeve: { c: '#2f9488', s: '#216d64', len: 1, cuff: 1 },
    pants: { c: '#5a3a60', s: '#432a48', len: 1 },
    shoes: { type: 'flat', c: '#7a3b2c', s: '#5b2a1f', sole: '#3a2422' },
  },
};

// ---------------------------------------------------------------- expressions
// b: brows [[raise, innerTilt(+worried/-angry), arch], ...] (screen-left brow, screen-right brow)
// e: eyes {o:open, lt:top lid, lb:bottom lid, p:pupil scale, happy, tears, spark}; m: mouth spec (units of R/12)
const EX = {
  neutral: { b: [[0, 0, 0.3], [0, 0, 0.3]], e: { o: 1, lt: 0.08 }, m: { k: 'line', w: 3.6, c: -0.8 } },
  happy: { b: [[1.1, 0.25, 0.5], [1.1, 0.25, 0.5]], e: { o: 1, lb: 0.2 }, m: { k: 'open', w: 5, top: -0.5, bot: 3.4, c: -1.5, teeth: 1, tongue: 1 }, blush: 1 },
  grin: { b: [[0.7, 0, 0.4], [0.7, 0, 0.4]], e: { o: 1, lb: 0.34 }, m: { k: 'teeth', w: 6, top: -0.9, bot: 3, c: -2 }, blush: 0.8 },
  excited: { b: [[2.2, 0.3, 0.7], [2.2, 0.3, 0.7]], e: { o: 1.1, p: 1.12, spark: 1 }, m: { k: 'open', w: 5.2, top: -0.7, bot: 4.2, c: -1.8, teeth: 1, tongue: 1 }, blush: 1 },
  shock: { b: [[3.1, 0.5, 0.9], [3.1, 0.5, 0.9]], e: { o: 1.18, p: 0.55 }, m: { k: 'O', w: 2.3, h: 3.1 } },
  panic: { b: [[2.4, 1.8, 0.1], [2.4, 1.8, 0.1]], e: { o: 1.2, p: 0.5 }, m: { k: 'open', w: 5.6, top: 0.1, bot: 4.8, c: 1.1, teeth: 2, tongue: 1 }, sweat: 1 },
  nervous: { b: [[1.2, 1.6, 0], [1.2, 1.6, 0]], e: { o: 1.05, p: 0.82 }, m: { k: 'teeth', w: 6.2, top: -0.4, bot: 2.6, c: -1.2 }, sweat: 1 },
  smug: { b: [[-0.1, -0.8, 0.1], [2, 0, 0.8]], e: { o: 1, lt: 0.48 }, m: { k: 'line', w: 3.8, c: -0.3, sk: -1.8 } },
  deadpan: { b: [[-0.4, 0, 0], [-0.4, 0, 0]], e: { o: 1, lt: 0.52, p: 0.95 }, m: { k: 'line', w: 3.2, c: 0 } },
  confused: { b: [[2.1, 0.6, 0.7], [-0.6, -0.8, 0]], e: { o: 1, look: [0.35, -0.5] }, m: { k: 'squig', w: 2.8, x: 1.3 }, roll: 0.07 },
  stern: { b: [[-1.1, -1.9, 0], [-1.1, -1.9, 0]], e: { o: 1, lt: 0.3, p: 0.9 }, m: { k: 'line', w: 3.6, c: 1.3 } },
  proud: { b: [[1.4, 0, 0.5], [1.4, 0, 0.5]], e: { happy: 1 }, m: { k: 'open', w: 4.8, top: -0.7, bot: 2.4, c: -2, teeth: 1 }, pitch: -0.07, blush: 1 },
  cry: { b: [[1, 2, 0], [1, 2, 0]], e: { o: 0.95, lb: 0.32, tears: 1 }, m: { k: 'open', w: 4.4, top: 0.9, bot: 3.6, c: 1.7, tongue: 1 } },
};
const VIS = { A: { k: 'open', w: 4.2, top: -0.3, bot: 4.0, c: -0.4, teeth: 1, tongue: 1 }, E: { k: 'open', w: 4.8, top: -0.3, bot: 2.3, c: -0.7, teeth: 1 }, O: { k: 'O', w: 2.3, h: 3.2 }, M: { k: 'line', w: 3, c: 0 }, F: { k: 'F', w: 3.6 }, R: { k: 'open', w: 3.2, top: 0, bot: 1.5, c: -0.2, teeth: 1 } };
function viseme(say, t) {
  if (!say || t < say.t0 || t > say.t1) return null;
  const s = say.text || ''; if (!s.length) return null;
  const i = Math.min(s.length - 1, Math.floor((t - say.t0) / Math.max(1, say.t1 - say.t0) * s.length));
  const ch = s[i].toLowerCase();
  if ('ah'.includes(ch)) return VIS.A; if ('eiy'.includes(ch)) return VIS.E; if ('ouwq'.includes(ch)) return VIS.O;
  if ('mbp'.includes(ch)) return VIS.M; if ('fv'.includes(ch)) return VIS.F; if (/[a-z0-9]/.test(ch)) return VIS.R;
  return ch === ' ' ? VIS.R : VIS.M;
}

// ---------------------------------------------------------------- rig
function rig(C, o) {
  const B = C.body, th = VIEWS[o.view] ?? 0, t = o.t || 0, seed = o.seed || 0;
  let pose = o.pose || 'stand'; if (pose === 'stand' && C.defPose) pose = C.defPose;
  const sn = Math.sin(th), cs = Math.cos(th);
  const pj = (x, y, z) => ({ x: x * cs + z * sn, y, d: -x * sn + z * cs });
  const breath = Math.sin((t + seed * 7) * TAU / 96) * 0.35;
  let jump = 0, bob = 0, wph = 0, lean = 0;
  if (pose === 'walk') { wph = t / 20 * TAU; bob = -1.1 * (1 - Math.abs(Math.cos(wph))) + 0.3; lean = 0.9; }
  if (pose === 'cheer') jump = -Math.max(0, Math.sin(t * TAU / 18)) * 3.2;
  const sit = pose === 'sit', sitD = sit ? B.sitY - B.hipY : 0;
  const ub = jump + bob + sitD; // upper-body offset
  const shUp = pose === 'shrug' ? -1.4 : 0;
  const shY = B.shY + ub + breath * 0.6 + shUp;
  const H = C.head, R = H.R;
  let nod = 0; if (pose === 'nod') nod = Math.max(0, Math.sin(t * TAU / 16)) * 1.3;
  const exn = EX[o.expr || C.defExpr] || EX.neutral;
  let pitch = (exn.pitch || 0) + (pose === 'phone' ? 0.15 : 0) + (pose === 'facepalm' ? 0.08 : 0) + nod * 0.06;
  let roll = (exn.roll || 0) + (pose === 'shrug' ? 0.08 : 0) + (pose === 'facepalm' ? -0.06 : 0);
  const hz = lean + 0.4 + (pose === 'phone' ? 0.9 : 0);
  const head = { x: hz * sn, y: H.cy + ub + breath + nod, R, pitch, roll };
  // legs
  const legs = [];
  for (const s of [1, -1]) {
    const hip = [s * B.hipX * (pose === 'walk' ? 0.85 : 1), B.hipY + jump + bob + sitD, 0];
    let knee, ank;
    if (sit) { knee = [s * (B.hipX + 0.6), hip[1] + 1.2, B.thigh * 0.92]; ank = [s * (B.hipX + 0.9), B.footY + jump, B.thigh * 0.92 + 1.2]; }
    else {
      let fz = 0.6, lift = 0, fx = s * (B.hipX + 0.4);
      if (pose === 'walk') { const ph = wph + (s > 0 ? 0 : Math.PI); fz = 7.5 * Math.cos(ph); lift = Math.max(0, -Math.sin(ph)) * 3.2; fx = s * B.hipX * 0.85; }
      ank = [fx, B.footY + jump - lift, fz];
      // IK in (y,z) plane, knee bends forward
      const dy = ank[1] - hip[1], dz = ank[2] - hip[2], D = Math.hypot(dy, dz), L1 = B.thigh, L2 = B.shin;
      if (D >= L1 + L2 - 0.01) knee = [lerp(hip[0], ank[0], L1 / (L1 + L2)), hip[1] + dy * L1 / D, hip[2] + dz * L1 / D];
      else { const a = (L1 * L1 - L2 * L2 + D * D) / (2 * D), hh = Math.sqrt(Math.max(0, L1 * L1 - a * a)); const uy = dy / D, uz = dz / D; let py = -uz, pz = uy; if (pz < 0) { py = -py; pz = -pz; } knee = [lerp(hip[0], ank[0], 0.5), hip[1] + uy * a + py * hh, hip[2] + uz * a + pz * hh]; }
    }
    legs.push({ s, hip: pj(...hip), knee: pj(...knee), ank: pj(...ank), lift: ank[1] - B.footY - jump, d: -s * B.hipX * sn });
  }
  // arms
  const ps = (th > 0.01 && th < 3) ? -1 : 1; // prop arm side: the near arm in R views
  const u = B.ua, f = B.fa, sx = B.sx;
  const arms = [];
  for (const s of [1, -1]) {
    const isP = s === ps; let E, W, hand = 'relax';
    const S = [s * (sx - 0.6), shY + 0.8, 0];
    const relax = () => { E = [s * (sx + 1.5), shY + u * 0.98, -0.6]; W = [s * (sx + 1.9), shY + u + f * 0.97, 0.8]; hand = 'relax'; };
    const hip = () => { E = [s * (sx + u * 0.6), shY + u * 0.62, -1]; W = [s * (sx + 0.4), shY + u + f * 0.2, 0.5]; hand = 'fist'; };
    switch (pose) {
      case 'walk': { const ph = wph + (s > 0 ? Math.PI : 0); const sw = 6 * Math.cos(ph); E = [s * (sx + 1.1), shY + u * 0.97, sw * 0.4 + lean]; W = [s * (sx + 1.3), shY + u + f * 0.92, sw + lean]; break; }
      case 'cheer': { const wv = Math.sin(t * TAU / 9 + s) * 1.4; E = [s * (sx + u * 0.55), shY - u * 0.5, 1]; W = [s * (sx + u * 0.72 + wv), shY - u * 0.55 - f * 0.86, 2]; hand = 'open'; break; }
      case 'point': if (isP) { const fr = Math.pow(Math.max(0, cs), 8), as = Math.abs(sn); E = [s * (sx + u * 0.45 * fr + 1), shY + u * 0.42, u * 0.3 + u * 0.4 * as]; W = [s * (sx * 0.6 + (u * 0.5 + f * 0.75) * fr + 1), shY + u * 0.28, u * 0.3 + (u * 0.4 + f * 1.1) * as]; hand = 'point'; } else hip(); break;
      case 'facepalm': if (isP) { E = [s * (sx + 1), shY + u * 0.75, u * 0.6]; W = [s * 1.2, head.y + R * 0.05 - jump, R * 1.05]; hand = 'flat'; } else relax(); break;
      case 'shrug': E = [s * (sx + u * 0.6), shY + u * 0.72, 1]; W = [s * (sx + u * 0.6 + f * 0.72), shY + u * 0.5, 2.5]; hand = 'palmUp'; break;
      case 'hold': if (isP) { E = [s * (sx + 0.8), shY + u * 0.88, u * 0.3]; W = [s * (sx - 0.8), shY + u * 0.86 - f * 0.12, u * 0.3 + f * 0.85]; hand = 'grip'; } else relax(); break;
      case 'holdUp': if (isP) { E = [s * (sx + u * 0.5), shY - u * 0.38, 1.5]; W = [s * (sx + u * 0.5), shY - u * 0.45 - f * 0.9, 2.5]; hand = 'grip'; } else hip(); break;
      case 'phone': E = [s * (sx + 0.4), shY + u * 0.92, 2]; W = [s * 2.4, shY + u * 0.72, u * 0.3 + f * 0.62]; hand = 'grip'; break;
      case 'armsCrossed': E = [s * (sx + 1.3), shY + u * 0.78, 2.2]; W = [-s * (sx * 0.5), shY + u * 0.6 + (s > 0 ? 0.6 : -0.6), B.sd + 1.8]; hand = 'tuck'; break;
      case 'sit': E = [s * (sx + 1.4), shY + u * 0.92, 1.5]; W = [s * (sx - 0.4), shY + u + f * 0.5, f * 0.55]; hand = 'relax'; break;
      default: relax();
    }
    const p = [pj(...S), pj(...E), pj(...W)];
    arms.push({ s, isP, pts: p, hand, d: (p[0].d + p[1].d + p[2].d) / 3 });
  }
  return { C, B, th, sn, cs, pj, t, seed, pose, shY, ub, lean, head, legs, arms, ps, jump, exn, sit };
}

// ---------------------------------------------------------------- bounds
export function bounds(name, o) {
  const C = DEF[name] || DEF.SAM, r = rig(C, o), k = o.h / 100;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  const add = (x, y, m = 0) => { x0 = Math.min(x0, x - m); x1 = Math.max(x1, x + m); y0 = Math.min(y0, y - m); y1 = Math.max(y1, y + m); };
  for (const l of r.legs) { add(l.ank.x, 0, 6); add(l.knee.x, l.knee.y, 4); }
  for (const a of r.arms) for (const p of a.pts) add(p.x, p.y, 4.5);
  add(0, r.shY, r.B.sx + 2); add(0, r.B.hemY, r.B.hemX + 1);
  const R = r.head.R; add(r.head.x, r.head.y, R * 1.3);
  const hat = C.hat ? R * (C.hat.type === 'tall' ? 2.25 + 1.4 : C.hat.type === 'flop' ? 2.6 : 1.45) : R * 1.35;
  add(r.head.x, r.head.y - hat);
  const hp = r.arms.find((a) => a.isP).pts[2];
  const X = (v) => o.x + v * k, Y = (v) => o.y + v * k;
  return { x0: X(x0), y0: Y(y0), x1: X(x1), y1: Y(y1), x: X(x0), y: Y(y0), w: (x1 - x0) * k, h: (y1 - y0) * k, head: { x: X(r.head.x), y: Y(r.head.y), r: R * k }, hand: { x: X(hp.x), y: Y(hp.y) } };
}

// ---------------------------------------------------------------- main
export function drawChar(ctx, name, o) {
  const C = DEF[name]; if (!C) return;
  const r = rig(C, o), k = o.h / 100;
  const hEq = o.h / C.relH; // Sam-equivalent height for line weight
  const lwPx = 8 * Math.pow(Math.max(hEq, 60) / 900, 0.62);
  const S = { lw: lwPx / k, sd: o.light && o.light.dir ? -o.light.dir : 1, k };
  const soot = cl((C.sootBase || 0) + (o.soot || 0), 0, 1.4);
  const st = { r, S, C, o, t: o.t || 0, seed: o.seed || 0, soot, clips: [] };
  ctx.save(); ctx.translate(o.x, o.y); ctx.scale(k, k);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // contact shadow
  if (o.shadow !== false) { ctx.fillStyle = 'rgba(20,12,35,0.22)'; const w = (r.B.hemX + 4) * (1 - Math.min(0.5, -r.jump * 0.06)); ctx.beginPath(); ctx.ellipse(0, 0, w * 1.15, 2.2, 0, 0, TAU); ctx.fill(); }
  const back = r.arms.filter((a) => a.d < -1.5), front = r.arms.filter((a) => a.d >= -1.5);
  if (r.pose === 'armsCrossed') front.sort((a, b) => a.s - b.s);
  for (const a of back) drawArm(ctx, st, a);
  drawLegs(ctx, st);
  drawTorso(ctx, st);
  const raised = ['cheer', 'holdUp', 'facepalm', 'shrug'].includes(r.pose);
  if (!raised) for (const a of front) drawArm(ctx, st, a);
  drawHead(ctx, st);
  if (raised) for (const a of front) drawArm(ctx, st, a);
  ctx.restore();
}

// ---------------------------------------------------------------- legs & shoes
function drawLegs(ctx, st) {
  const { r, S, C } = st, B = r.B, pa = C.pants;
  const legs = [...r.legs].sort((a, b) => a.d - b.d);
  const pelvis = () => { const w = Math.hypot((B.hipX + B.legW * 0.5) * r.cs, (B.hemD - 1) * r.sn); const y = r.legs[0].hip.y; return { p: rrect(-w, y - 4, 2 * w, 7.5, 3.2), c: pa.c, s: pa.s }; };
  const sideish = Math.abs(r.sn) > 0.35;
  const groups = sideish ? [[legs[0]], [legs[1]]] : [legs];
  groups.forEach((g, gi) => {
    const items = [];
    for (const l of g) {
      const pts = [l.hip, l.knee, l.ank];
      if (pa.len >= 1) items.push({ pts, w: B.legW, c: pa.c, s: pa.s });
      else items.push({ pts, w: B.legW, c: C.skin, s: C.skinS });
    }
    if (gi === groups.length - 1) items.unshift(pelvis());
    G(ctx, S, items);
    for (const l of g) {
      const pts = [l.hip, l.knee, l.ank];
      if (pa.len < 1) { // shorts + socks
        if (pa.sock) { const sk = along([l.ank, l.knee], 0.3); G(ctx, S, [{ pts: sk, w: B.legW + 0.4, c: pa.sock, s: pa.sockS }]); const m = along([l.ank, l.knee], 0.2).pop(), m2 = along([l.ank, l.knee], 0.25).pop(); line(ctx, S, [P(m.x - B.legW * 0.55, m.y), P(m.x + B.legW * 0.55, m.y)], 0.7, '#3fb6a8'); line(ctx, S, [P(m2.x - B.legW * 0.55, m2.y), P(m2.x + B.legW * 0.55, m2.y)], 0.7, '#e2622f'); }
        const sp = along(pts, pa.len); G(ctx, S, [{ pts: sp, w: B.legW + pa.wide, c: pa.c, s: pa.s }]);
        if (pa.stripe) { const q = sp.map((p) => P(p.x + (l.s * (B.legW + pa.wide) * 0.36) * r.cs, p.y)); ctx.save(); line(ctx, S, q.slice(0, q.length), 0.9, pa.stripe); ctx.restore(); }
      } else if (pa.cuff) { // rolled jeans cuff
        const a = along([l.ank, l.knee], 0.12); G(ctx, S, [{ pts: a, w: B.legW + 0.9, c: pa.cuff, s: pa.s }]);
      }
      if (pa.check) { const m = along(pts, 0.5).pop(); line(ctx, S, [P(m.x - 1, m.y - 6), P(m.x - 1, m.y + 8)], 0.35, '#4a4858'); }
      drawShoe(ctx, st, l);
    }
  });
}
function drawShoe(ctx, st, l) {
  const { r, S, C } = st, sh = C.shoes, A = l.ank;
  const sa = Math.abs(r.sn), dir = r.sn >= 0 ? 1 : -1, back = r.cs < -0.3;
  const gy = A.y - r.B.footY; // ground under this foot
  const cx = A.x + r.sn * 1.8, hl = lerp(3.4, 5.4, sa) * (sh.type === 'clog' ? 1.08 : 1);
  const lift = Math.min(0, gy) ; // nothing (kept for clarity)
  const tilt = l.lift > 0.3 ? -l.lift * 0.05 * dir : 0;
  ctx.save(); ctx.translate(cx, gy + lift); ctx.rotate(tilt);
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
    if (sh.type === 'sneaker') { // white toe cap + side badge + laces
      ctx.fillStyle = sh.sole;
      if (sa > 0.2 && !back) { ctx.beginPath(); ctx.ellipse(hl * 0.95 * dir, -1.2, hl * 0.42, 2.2, 0, 0, TAU); ctx.fill(); line(ctx, S, [P(hl * 0.55 * dir, -2.9), P(hl * 0.5 * dir, -1.5)], 0.5); ctx.beginPath(); ctx.arc(-hl * 0.35 * dir, -2.5, 1.05, 0, TAU); ctx.fill(); ctx.lineWidth = S.lw * 0.5; ctx.stroke(); }
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
  const prop = a.isP && o.prop && ['hold', 'holdUp', 'point', 'stand', 'walk', 'nod', 'sit', 'phone'].includes(r.pose) ? o.prop : null;
  const phonePose = r.pose === 'phone';
  const handPos = P(W.x + ux * hs_ * 0.9, W.y + uy * hs_ * 0.9);
  const doHand = () => {
    if (a.hand === 'tuck') return;
    if (prop && !phonePose && a.hand !== 'relax' || (prop && a.hand === 'relax')) drawProp(ctx, st, prop, handPos, a, r.pose);
    if (phonePose && a.s === 1) drawProp(ctx, st, o.prop || 'phone', P((r.arms[0].pts[2].x + r.arms[1].pts[2].x) / 2, (r.arms[0].pts[2].y + r.arms[1].pts[2].y) / 2 - 1.2), a, 'phone');
    drawHand(ctx, st, W, ux, uy, prop && a.hand === 'relax' ? 'grip' : a.hand, hs_, a);
  };
  if (sl.len > 1) { // too-long sleeves: hand peeks out from under the cuff
    doHand();
    const ext = P(W.x + ux * 2.2, W.y + uy * 2.2);
    G(ctx, S, [{ pts: [Sh, E, ext], w: B.armW + (sl.wide || 0), c: sl.c, s: sl.s }]);
    const c1 = P(ext.x - ux * 1.4, ext.y - uy * 1.4), nx = -uy, ny = ux, hw = (B.armW + (sl.wide || 0)) * 0.5;
    line(ctx, S, [P(c1.x + nx * hw, c1.y + ny * hw), P(c1.x - nx * hw, c1.y - ny * hw)], 0.5);
    return;
  }
  if (sl.len < 1) {
    G(ctx, S, [{ pts: [Sh, E, W], w: B.armW, c: C.skin, s: C.skinS }]);
    const sp = along([Sh, E, W], sl.len); G(ctx, S, [{ pts: sp, w: B.armW + (sl.wide || 0), c: sl.c, s: sl.s }]);
  } else {
    G(ctx, S, [{ pts: [Sh, E, W], w: B.armW, c: sl.c, s: sl.s }]);
    if (sl.cuff) { const c1 = P(W.x - ux * 1.5, W.y - uy * 1.5), nx = -uy, ny = ux, hw = B.armW * 0.5; line(ctx, S, [P(c1.x + nx * hw, c1.y + ny * hw), P(c1.x - nx * hw, c1.y - ny * hw)], 0.55); }
  }
  if (st.soot > 0.3 && a.s === 1) sootDots(ctx, st, E.x, E.y, 2.2, 2, 50);
  doHand();
}
function drawHand(ctx, st, W, ux, uy, type, hs_, a) {
  const { S, C } = st; const r = hs_ * 1.0;
  const cx = W.x + ux * r * 0.9, cy = W.y + uy * r * 0.9, ang = Math.atan2(uy, ux);
  const fing = (n, len, spread, base = 0, w = r * 0.62) => { const out = []; for (let i = 0; i < n; i++) { const t = n === 1 ? 0 : i / (n - 1) - 0.5; const an = ang + base + t * spread; const sx = cx + Math.cos(an) * r * 0.55, sy = cy + Math.sin(an) * r * 0.55; out.push({ pts: [P(sx, sy), P(sx + Math.cos(an) * len, sy + Math.sin(an) * len)], w, c: C.skin }); } return out; };
  const side = (a && a.s) || 1;
  const thumbA = ang - HP * side * (st.r.sn > 0.3 ? -1 : 1) * 0.9;
  const thumb = { pts: [P(cx, cy), P(cx + Math.cos(thumbA) * r * 1.05, cy + Math.sin(thumbA) * r * 1.05)], w: r * 0.7, c: C.skin };
  const palm = { p: ell(cx, cy, r * 1.0, r * 0.95, ang), c: C.skin, s: C.skinS, o: r * 0.35, oy: r * 0.2 };
  if (type === 'open' || type === 'flat' || type === 'palmUp') {
    let base = 0; if (type === 'palmUp') base = -0.5 * side;
    G(ctx, S, [palm, ...fing(4, r * 1.25, 1.0, base), thumb]);
  } else if (type === 'point') {
    G(ctx, S, [palm, ...fing(1, r * 1.9, 0), thumb]);
  } else {
    G(ctx, S, [palm, thumb]);
    if (type === 'grip' || type === 'fist') for (let i = 0; i < 2; i++) { const an = ang + HP * side * 0.0; const off = (i - 0.5) * r * 0.55; const px = cx + Math.cos(ang + HP) * off, py = cy + Math.sin(ang + HP) * off; line(ctx, S, [P(px + Math.cos(ang) * r * 0.25, py + Math.sin(ang) * r * 0.25), P(px + Math.cos(ang) * r * 0.75, py + Math.sin(ang) * r * 0.75)], 0.45); void an; }
  }
}
function drawProp(ctx, st, prop, at, a, pose) {
  const { S, C, o, r } = st; const ps = 1 / C.relH; // keep props the same real size across the cast
  ctx.save(); ctx.translate(at.x, at.y); ctx.scale(ps, ps);
  const glow = o.phoneGlow || 0;
  if (prop === 'phone') {
    if (pose === 'phone') { // seen from behind, screen toward face
      const w = lerp(5.6, 1.6, Math.abs(r.sn)), hgt = 9.6; ctx.rotate(-0.25 * Math.sign(r.sn || 0)); ctx.translate(0, -1.5);
      if (glow > 0) { ctx.fillStyle = `rgba(150,215,255,${0.28 * glow})`; ctx.beginPath(); ctx.ellipse(r.sn * 3, -hgt * 0.6, 7, 6, 0, 0, TAU); ctx.fill(); }
      G(ctx, S, [{ p: rrect(-w / 2, -hgt, w, hgt, 1.3), c: '#2d2840', s: '#1f1b2e', o: 0.6 }]);
      if (Math.abs(r.sn) < 0.6) { ctx.fillStyle = '#4a4560'; ctx.beginPath(); ctx.roundRect(-w / 2 + 0.7, -hgt + 0.7, 2.2, 2.2, 0.6); ctx.fill(); }
      if (Math.abs(r.sn) > 0.5) { ctx.fillStyle = glow > 0 ? '#bfe8ff' : '#8fd3ff'; ctx.fillRect(r.sn > 0 ? w / 2 - 0.5 : -w / 2, -hgt + 0.8, 0.5, hgt - 1.6); }
    } else {
      const w = 5.6, hgt = 10; ctx.translate(0, -hgt * 0.45);
      G(ctx, S, [{ p: rrect(-w / 2, -hgt / 2, w, hgt, 1.3), c: '#2d2840' }]);
      ctx.fillStyle = glow > 0 ? '#bfe8ff' : '#8fd3ff'; ctx.beginPath(); ctx.roundRect(-w / 2 + 0.6, -hgt / 2 + 0.6, w - 1.2, hgt - 1.2, 0.8); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-w / 2 + 1.2, -hgt / 2 + 2, w - 2.4, 1.2); ctx.fillStyle = '#4d7cff'; ctx.fillRect(-w / 2 + 1.2, -hgt / 2 + 4, w - 3.2, 1); ctx.fillRect(-w / 2 + 1.2, -hgt / 2 + 5.6, w - 2.4, 1);
      ctx.fillStyle = '#2d2840'; ctx.fillRect(-0.9, -hgt / 2 + 0.7, 1.8, 0.5);
    }
  } else if (prop === 'egg') {
    ctx.translate(0, -3.4);
    G(ctx, S, [{ p: ell(0, 0, 2.9, 3.7), c: '#fbf3e3', s: '#e2d3b8', o: 0.9, oy: 0.4 }]);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(-1.1, -1.5, 0.6, 1, -0.4, 0, TAU); ctx.fill();
  } else if (prop === 'pot') {
    const dir = Math.abs(r.sn) > 0.3 ? Math.sign(r.sn) : a.s;
    const ox = dir * 13; // pot body away from the hand, held by its long handle
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
    G(ctx, S, [{ p: bag, c: '#c9955a', s: '#a87640', o: 2.5, oy: 0 }]);
    line(ctx, S, [P(-6.1, 1.4), P(6.1, 1.4)], 0.45); ctx.fillStyle = '#a87640'; ctx.beginPath(); ctx.arc(0, 7, 2, 0, TAU); ctx.fill();
  } else if (prop === 'spatula') {
    G(ctx, S, [{ pts: [P(0, 3), P(0, -5)], w: 1.6, c: '#2b2735' }, { pts: [P(0, -5), P(0, -10)], w: 0.7, c: '#9aa4b5' }]);
    const head = rrect(-2.4, -16.5, 4.8, 6.8, 1); G(ctx, S, [{ p: head, c: '#b9c2d0', s: '#8e98aa', o: 0.8, oy: 0 }]);
    for (let i = -1; i <= 1; i++) line(ctx, S, [P(i * 1.2, -15.2), P(i * 1.2, -11.6)], 0.4);
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
  const { r, S, C, o } = st, B = r.B, T = C.top, cs = r.cs, sn = r.sn;
  const tp = torsoPath(r); const { tx, sh, hm, W1 } = tp;
  const fwd = cs > 0.12, backV = cs < -0.25;
  const cX = (y) => { const u = (y - sh) / (hm - sh); return lerp(tx, 0, u) + lerp(B.sd, B.hemD, u) * sn; };
  const bX = (y) => { const u = (y - sh) / (hm - sh); return lerp(tx, 0, u) - lerp(B.sd, B.hemD, u) * sn; };
  const items = [{ p: tp.p, c: T.c, s: T.s, o: 2.2, oy: 0.2 }];
  let hoodP = null;
  if (T.type === 'hoodie' || T.hood) { // hood bunched behind the neck
    const hc = T.hood || T.c, hcs = T.hoodS || T.s;
    hoodP = { p: ell(tx - sn * 2.6, sh - 1.6, (B.neckW * 0.5 + 3.4) * (0.55 + 0.45 * Math.abs(cs)) + 1.4 * Math.abs(sn), 3.4), c: hc, s: hcs, o: 1.2 };
    if (T.hood) G(ctx, S, [hoodP]); else items.unshift(hoodP);
  }
  G(ctx, S, items);
  rimOn(ctx, st, tp.p, 2);
  if (hoodP && !backV) { ctx.fillStyle = T.hoodS || T.s; ctx.beginPath(); ctx.ellipse(tx - sn * 2.0, sh - 2.2, (B.neckW * 0.5 + 1.7) * (0.55 + 0.45 * Math.abs(cs)), 1.9, 0, 0, TAU); ctx.fill(); }
  // neck
  const hd = r.head, chinY = hd.y + hd.R * C.head.low * 0.86;
  G(ctx, S, [{ pts: [P(hd.x * 0.8 + tx * 0.2, chinY), P(tx + sn * 0.6, sh + (T.type.startsWith('chef') ? -2.4 : 0.5))], w: B.neckW, c: C.skinS }]);
  ctx.save(); ctx.clip(tp.p);
  const cut = (y0, wTop, wBot, col, colS, vDip = 2.6) => { // front opening panel
    const w0 = wTop * cs, w1 = wBot * cs, x0 = cX(sh), x1 = cX(hm + 1);
    const p = new Path2D(); p.moveTo(x0 - w0, sh - 2.5); p.quadraticCurveTo(x0, sh + vDip, x0 + w0, sh - 2.5); p.lineTo(x1 + w1, hm + 2); p.lineTo(x1 - w1, hm + 2); p.closePath();
    ctx.fillStyle = col; ctx.fill(p); if (colS) shade(ctx, p, colS, -S.sd * 0.8, 0);
    ctx.lineWidth = S.lw; ctx.stroke(p); return { x0, x1, w0, w1 };
  };
  if (T.type === 'hoodie') {
    if (fwd) {
      const q = cut(0, 2.5, 3.2, T.tee, T.teeS);
      ctx.strokeStyle = T.teeS; ctx.lineWidth = S.lw * 0.8; ctx.beginPath(); ctx.moveTo(q.x0 - q.w0 * 0.75, sh - 1.4); ctx.quadraticCurveTo(q.x0, sh + 1.5, q.x0 + q.w0 * 0.75, sh - 1.4); ctx.stroke(); ctx.strokeStyle = INK;
      for (const s of [-1, 1]) { const x = q.x0 + s * (q.w0 + 0.9 * cs); G(ctx, S, [{ pts: [P(x, sh + 0.5), P(x + s * 0.3, sh + 9)], w: 0.75, c: '#f6efe0' }]); G(ctx, S, [{ p: rrect(x + s * 0.3 - 0.55, sh + 8.8, 1.1, 1.8, 0.4), c: '#2b2735' }]); }
      // kangaroo-less open hoodie: side seams/pocket hints
      for (const s of [-1, 1]) { const px = q.x1 + s * (q.w1 + 3.4 * cs); line(ctx, S, [P(px, hm - 9), P(px + s * 2.2 * cs, hm - 4.6)], 0.55); }
    } else if (backV) { // hood lying on the back
      const x = bX(sh); const hp = spl([[x - 6 * Math.abs(cs), sh - 1], [x, sh - 1.8], [x + 6 * Math.abs(cs), sh - 1], [x + 4.5 * Math.abs(cs), sh + 6], [x, sh + 10.5], [x - 4.5 * Math.abs(cs), sh + 6]]);
      G(ctx, S, [{ p: hp, c: T.c, s: T.s, o: 1 }]); line(ctx, S, [P(x - 3.4 * Math.abs(cs), sh + 1), P(x, sh + 6.5), P(x + 3.4 * Math.abs(cs), sh + 1)], 0.6);
    }
    line(ctx, S, [P(-30, hm - 2.4), P(30, hm - 2.4)], 0.55);
    if (T.scorch) { ctx.fillStyle = 'rgba(70,40,20,0.55)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(lerp(-6, 6, hs(i + 3)) + tx, hm - 3 - hs(i + 9) * 4, 1.6, 0.9, 0.3, 0, TAU); ctx.fill(); } }
  } else if (T.type === 'chef' || T.type === 'chefDB') {
    const db = T.type === 'chefDB';
    if (fwd) {
      const x0 = cX(sh), x1 = cX(hm);
      const ov = (db ? 4.2 : 3.6) * cs; // overlap panel edge
      line(ctx, S, [P(x0 + ov, sh + 1.2), P(x1 + ov * 1.05, hm + 1)], 0.7);
      const rows = db ? [-2.4, 2.2] : [2.2];
      for (const rx of rows) for (let i = 0; i < 4; i++) {
        let y = sh + 4 + i * 5.2; if (y > hm - 2) continue; let x = lerp(x0, x1, (y - sh) / (hm - sh)) + rx * cs;
        if (T.sloppy) { x += (i % 2 ? 0.6 : -0.3) * cs; y += (i === 2 ? 1.2 : 0); }
        { const bp = ell(x, y, 0.75 * Math.max(0.4, cs), 0.75); ctx.fillStyle = T.btn; ctx.fill(bp); ctx.lineWidth = S.lw * 0.45; ctx.strokeStyle = INK; ctx.stroke(bp); }
      }
    } else if (backV) { line(ctx, S, [P(bX(sh), sh + 2), P(bX(hm), hm)], 0.45, T.s); }
    if (T.sloppy) { ctx.fillStyle = T.s; ctx.beginPath(); ctx.ellipse(cX(hm) - 3, hm - 4, 2, 0.6, 0.3, 0, TAU); ctx.fill(); }
  } else if (T.type === 'tee') {
    if (fwd && T.graphic) planetGraphic(ctx, S, cX(sh + 10.5), sh + 10.5, cs);
    if (backV) line(ctx, S, [P(bX(sh + 3) - 1.4 * Math.abs(cs), sh + 3), P(bX(sh + 3) + 1.4 * Math.abs(cs), sh + 3)], 0.5, T.s);
  } else if (T.type === 'cardigan') {
    if (fwd) {
      const q = cut(0, 3.6, 3, T.blouse, T.blouseS, 7.5);
      for (let i = 0; i < 4; i++) { const y = sh + 8 + i * 4.6; if (y > hm - 2) continue; const x = lerp(q.x0, q.x1, (y - sh) / (hm - sh)) + (q.w0 + 1.4 * cs) * 1; G(ctx, S, [{ p: ell(x, y, 0.7, 0.7), c: T.btn }]); }
      for (const s of [-1, 1]) { const px = cX(hm - 7) + s * 5.6 * cs; G(ctx, S, [{ p: rrect(px - 2.2 * cs, hm - 8.5, 4.4 * cs, 4, 0.6), c: T.c, s: T.s, o: 0.6 }]); }
    }
    line(ctx, S, [P(-30, hm - 2.2), P(30, hm - 2.2)], 0.5);
  }
  ctx.restore();
  // collars / scarf after clip
  if (T.type === 'chef' || T.type === 'chefDB') {
    const w = (B.neckW + 2.6) * (0.7 + 0.3 * Math.abs(cs)) + Math.abs(sn) * 1.5;
    G(ctx, S, [{ p: rrect(tx + sn * 0.4 - w / 2, sh - 3.4, w, 3.4, 1.2), c: T.c, s: T.s, o: 0.8, oy: 0 }]);
    if (T.scarf) {
      G(ctx, S, [{ p: rrect(tx + sn * 0.4 - w / 2 + 0.6, sh - 4.6, w - 1.2, 1.9, 0.9), c: T.scarf, s: T.scarfS, o: 0.8 }]);
      if (!backV) { const kx = cX(sh) + sn * 0.6; G(ctx, S, [{ p: poly([[kx - 2.4 * Math.max(0.5, cs), sh - 3], [kx + 2.4 * Math.max(0.5, cs), sh - 3], [kx + 1.2, sh + 3.2], [kx - 1.2, sh + 3.6]]), c: T.scarf, s: T.scarfS, o: 0.6, oy: 0 }, { p: ell(kx, sh - 2.4, 1.5, 1.3), c: T.scarf }]); }
    }
  }
  if (T.type === 'tee') { const w = (B.neckW + 1.6) * (0.65 + 0.35 * Math.abs(cs)); ctx.strokeStyle = T.teeS; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.ellipse(tx + sn * 0.6, sh - 0.6, w / 2, 1.5, 0, 0.1, Math.PI - 0.1); ctx.stroke(); ctx.strokeStyle = INK; }
  if (T.type === 'cardigan' && fwd) { const x = cX(sh); for (const s of [-1, 1]) G(ctx, S, [{ p: poly([[x + s * 0.4, sh - 1.2], [x + s * 3.4 * cs, sh - 2.2], [x + s * 2.2 * cs, sh + 2.2]]), c: T.blouse }]); }
  if (st.soot > 0) { ctx.save(); ctx.clip(tp.p); sootDots(ctx, st, tx, (sh + hm) / 2, 7, 5 * st.soot, 20); ctx.restore(); }
  if (o.phoneGlow > 0) { ctx.save(); ctx.clip(tp.p); ctx.fillStyle = `rgba(120,190,255,${0.14 * o.phoneGlow})`; ctx.beginPath(); ctx.ellipse(tx + sn * 4, sh, 14, 10, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  st.torsoP = tp.p;
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
  ctx.restore();
}
function sootDots(ctx, st, x, y, spread, n, salt) {
  ctx.fillStyle = 'rgba(38,28,34,0.5)';
  for (let i = 0; i < n; i++) { const a = hs(i + salt) * TAU, d = hs(i * 3 + salt) * spread; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * d * 1.3, y + Math.sin(a) * d, 0.9 + hs(i + salt * 2) * 1.4, 0.6 + hs(i + 7 + salt) * 0.9, a, 0, TAU); ctx.fill(); }
}

// ---------------------------------------------------------------- head
function headShape(H, R, th) {
  const pts = [], sn = Math.sin(th), W = H.W * (1 + 0.05 * Math.abs(sn));
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * TAU, c = Math.cos(a), s = Math.sin(a);
    let x = c * R * W, y = s * R * (s < 0 ? H.top : 1);
    if (s > 0) { const cc = Math.sign(c) * Math.pow(Math.abs(c), H.sq); x = cc * R * W * (1 - H.taper * s * s); y = s * R * H.low; x += sn * R * 0.14 * s * s; }
    else x -= sn * R * 0.04 * s * s;
    pts.push([x, y]);
  }
  return pts;
}
function spanAt(pts, y) { let a = 1e9, b = -1e9; const n = pts.length; for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; if ((p[1] - y) * (q[1] - y) <= 0 && p[1] !== q[1]) { const x = p[0] + (q[0] - p[0]) * (y - p[1]) / (q[1] - p[1]); a = Math.min(a, x); b = Math.max(b, x); } } if (a > b) return { c: 0, hw: 0.1 }; return { c: (a + b) / 2, hw: (b - a) / 2 }; }
function ringPts(R, W, th, ef, n = 44) { // visible ring (left->right) of points at elevation ef(a) on the cranium
  const out = [];
  for (let i = 0; i <= n; i++) {
    const v = -HP + i / n * Math.PI; let a = v - th; a = Math.atan2(Math.sin(a), Math.cos(a)); const e = ef(a);
    out.push([R * W * Math.cos(e) * Math.sin(v), -R * Math.sin(e)]);
  }
  return out;
}
function aboveRing(ring, R, below = false) { const f = ring[0], l = ring[ring.length - 1]; const Y = below ? 4 * R : -4 * R; return poly([[-4 * R, f[1]], ...ring, [4 * R, l[1]], [4 * R, Y], [-4 * R, Y]]); }
function volPath(R, W, th, v, t) {
  const sn = Math.sin(th), cs = Math.cos(th);
  const extB = cs < 0 ? -cs * 0.6 : 0;
  const a0 = -Math.PI - v.ext - Math.max(0, sn) * 0.55 - extB, a1 = v.ext + Math.max(0, -sn) * 0.55 + extB;
  const pts = [], N = Math.max(30, v.n * 5);
  const cx = -sn * R * 0.1, cy = v.cy * R;
  for (let i = 0; i <= N; i++) {
    const ang = lerp(a0, a1, i / N); const ph = ang * v.n / 2 + th * v.n * 0.35;
    let b;
    if (v.mode === 'spiky') b = Math.pow(1 - Math.abs(Math.sin(ph)), 2.2) + Math.sin(t * 0.05 + i) * 0.03;
    else if (v.mode === 'curly') b = Math.pow(Math.abs(Math.sin(ph)), 0.5);
    else b = Math.pow(Math.abs(Math.sin(ph)), 0.7);
    const rr = R * (v.r + v.amp * (b - 0.5));
    pts.push([cx + Math.cos(ang) * rr * W, cy + Math.sin(ang) * rr]);
  }
  pts.push([R * 0.4, R * 0.5], [-R * 0.4, R * 0.5]);
  return v.mode === 'spiky' ? poly(pts) : spl(pts);
}

function drawHead(ctx, st) {
  const { r, S, C, o } = st, H = C.head, hd = r.head, R = hd.R, th = r.th, sn = r.sn, cs = r.cs, t = st.t;
  const ex = r.exn, W = H.W;
  const facing = cs > -0.2;
  ctx.save(); ctx.translate(hd.x, hd.y); ctx.rotate(hd.roll * (sn < -0.3 ? -1 : 1));
  const hpts = headShape(H, R, th), hp = spl(hpts);
  const py = hd.pitch * R; // feature shift for looking down/up
  // ears
  const ears = [];
  if (H.ears) for (const s of [-1, 1]) { const a = s * (HP + 0.28); const d = Math.cos(a + th), sp = spanAt(hpts, R * 0.15); const x = sp.c + sp.hw * Math.sin(a + th) * 0.98 * (d > 0.3 ? 0.9 : 1); ears.push({ s, d, x }); }
  const earDraw = (e) => {
    const y = R * 0.15 + py * 0.5, rx = R * 0.2, ry = R * 0.27;
    G(ctx, S, [{ p: ell(e.x, y, rx, ry), c: C.skin, s: C.skinS, o: rx * 0.5, oy: 0 }]);
    ctx.strokeStyle = C.skinS; ctx.lineWidth = S.lw * 0.7; ctx.beginPath(); ctx.arc(e.x, y, rx * 0.45, -1.2, 1.8); ctx.stroke(); ctx.strokeStyle = INK;
    if (H.earring) G(ctx, S, [{ p: ell(e.x, y + ry * 0.95, R * 0.07, R * 0.07), c: '#f2c14e' }]);
    if (H.stud && e.s === 1) G(ctx, S, [{ p: ell(e.x, y + ry * 0.7, R * 0.05, R * 0.05), c: '#e8edf5' }]);
  };
  // hat back parts
  const hat = C.hat;
  if (hat && (hat.type === 'tall' || hat.type === 'flop')) toqueColumn(ctx, st, R, W, hat);
  for (const e of ears) if (e.d <= 0.3 && e.d > -0.75) earDraw(e);
  // hair volume + head
  const hv = C.hair && C.hair.vol && !(hat && hat.type === 'beanie') ? volPath(R, W, th, C.hair.vol, t) : null;
  const items = [];
  if (hv) items.push({ p: hv, c: C.hair.c });
  if (hv && C.hair.cow) { // cowlick: a swoosh tuft at the crown, sweeping backward
    const a = -HP - sn * 0.5, rr = R * 1.05, bx = Math.cos(a) * rr * W - sn * R * 0.1, by = Math.sin(a) * rr;
    const d = sn > 0.3 ? -1 : sn < -0.3 ? 1 : 1;
    const tp = new Path2D(); tp.moveTo(bx - R * 0.2, by + R * 0.1);
    tp.quadraticCurveTo(bx - d * R * 0.02, by - R * 0.3, bx + d * R * 0.38, by - R * 0.36);
    tp.quadraticCurveTo(bx + d * R * 0.12, by - R * 0.12, bx + R * 0.2, by + R * 0.12); tp.closePath();
    items.push({ p: tp, c: C.hair.c });
  }
  items.push({ p: hp, c: C.skin });
  // ink pass, hair fills + one consistent circular shadow, then skin
  const hairShadow = () => { const q = new Path2D(); q.rect(-BIG, -BIG, 2 * BIG, 2 * BIG); q.ellipse(-S.sd * R * 0.22 - sn * R * 0.1, -R * 0.22, R * 1.12 * W, R * 1.18, 0, 0, TAU); ctx.fillStyle = C.hair.s; ctx.fill(q, 'evenodd'); };
  const hairShadowStroke = () => { ctx.save(); const q = new Path2D(); q.rect(-BIG, -BIG, 2 * BIG, 2 * BIG); q.ellipse(-S.sd * R * 0.22 - sn * R * 0.1, -R * 0.22, R * 1.12 * W, R * 1.18, 0, 0, TAU); ctx.clip(q, 'evenodd'); ctx.strokeStyle = C.hair.s; ctx.stroke(hp); ctx.restore(); };
  ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 2 * S.lw;
  for (const it of items) ctx.stroke(it.p);
  if (hv) { ctx.fillStyle = C.hair.c; ctx.fill(hv); ctx.save(); ctx.clip(hv); hairShadow(); ctx.restore(); }
  if (hv) rimOn(ctx, st, hv, R * 0.16);
  ctx.fillStyle = C.skin; ctx.fill(hp);
  shade(ctx, hp, C.skinS, -S.sd * R * 0.17, -R * 0.07);
  rimOn(ctx, st, hp, R * 0.14);
  // hair inside head
  if (C.hair) {
    const ring = ringPts(R, W, th, C.hair.line, 56);
    const hr = aboveRing(ring, R);
    ctx.save(); ctx.clip(hp);
    // cast shadow of hair on forehead
    ctx.save(); ctx.translate(S.sd * R * 0.04, R * 0.07); ctx.fillStyle = C.skinS; ctx.fill(hr); ctx.restore();
    ctx.fillStyle = C.hair.c; ctx.fill(hr);
    ctx.save(); ctx.clip(hr); hairShadow(); rimOn(ctx, st, hp, R * 0.16); ctx.restore();
    ctx.restore();
    if (hv) { ctx.save(); ctx.clip(hr); ctx.clip(hv); ctx.strokeStyle = C.hair.c; ctx.lineWidth = S.lw * 0.5; ctx.stroke(hp); hairShadowStroke(); ctx.restore(); ctx.strokeStyle = INK; }
    ctx.save(); ctx.clip(hp);
    ctx.lineWidth = S.lw; ctx.beginPath(); ring.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    ctx.restore();
    // highlights
    if (C.hair.hi && !(hat && hat.type !== 'flop')) {
      ctx.strokeStyle = C.hair.hi; ctx.lineWidth = R * 0.07; ctx.lineCap = 'round';
      for (const [a, e, l] of [[-0.55, 1.0, 0.4], [-0.15, 1.12, 0.3]]) {
        const v = a + th; if (Math.cos(v) < 0.1) continue; const x = R * W * 1.02 * Math.cos(e) * Math.sin(v), y = -R * Math.sin(e) * 1.0;
        ctx.beginPath(); ctx.arc(x + R * 0.55, y + R * 0.75, R * 0.9, -2.3 - l * 0.5, -2.3 + l * 0.5); ctx.stroke();
      }
      ctx.strokeStyle = INK;
    }
  }
  for (const e of ears) if (e.d > 0.3) earDraw(e);
  // face
  if (facing) drawFace(ctx, st, hpts, hp, py);
  // hats
  if (hat) drawHatFront(ctx, st, R, W, hat);
  if (facing && hat && hat.type === 'flop') drawBrows(ctx, st, hpts, py); // brows stay visible on the too-big toque
  // overlays: soot, phone glow, rim
  if (st.soot > 0) { ctx.save(); ctx.clip(hp); ctx.fillStyle = `rgba(36,26,32,${0.3 * Math.min(1, st.soot)})`; const n = Math.round(4 + st.soot * 4); for (let i = 0; i < n; i++) { const a = (hs(i + 31) - 0.5) * 2.6, y = (hs(i + 57) - 0.2) * R * 0.95; const v = a + th; if (Math.cos(v) < 0.05) continue; const x = R * W * 0.95 * Math.sin(v); ctx.beginPath(); ctx.ellipse(x, y, R * (0.07 + hs(i + 3) * 0.1) * Math.max(0.4, Math.cos(v)), R * (0.06 + hs(i + 9) * 0.07), hs(i) * 2, 0, TAU); ctx.fill(); } ctx.restore(); }
  if (o.phoneGlow > 0) { ctx.save(); ctx.clip(hp); const g = o.phoneGlow; ctx.fillStyle = `rgba(120,185,255,${0.1 * g})`; ctx.fill(hp); ctx.fillStyle = `rgba(175,225,255,${0.22 * g})`; ctx.beginPath(); ctx.ellipse(sn * R * 0.4, R * 1.25, R * 1.25, R * 0.95, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  st.headP = hp;
  if (C.smoke) smoke(ctx, st, R);
  const sw = Math.max(o.sweat || 0, ex.sweat || 0);
  if (sw > 0 && facing) sweat(ctx, st, hpts, R, sw);
  ctx.restore();
}

function drawBrows(ctx, st, hpts, py) {
  const { r, S, C, o } = st, H = C.head, R = r.head.R, th = fyaw(r.th), ex = r.exn;
  const sp = spanAt(hpts, R * H.eyeY);
  ex.b.forEach((b, i) => {
    const s = i ? 1 : -1, a = s * H.eyeA, v = a + th, d = Math.cos(v); if (d < 0.02) return;
    const comp = lerp(0.5, 1, cl(d, 0, 1));
    const exX = sp.c + sp.hw * 0.9 * Math.sin(v), ery = R * H.ery * (ex.e.o > 1 ? ex.e.o : 1);
    const baseY = R * H.eyeY + py - ery - R * 0.2 - b[0] * R * 0.06;
    const len = R * H.erx * 1.15 * comp;
    let inX = exX - s * len, outX = exX + s * len;
    let inY = baseY - b[1] * R * 0.06, outY = baseY + b[1] * R * 0.015, midY = (inY + outY) / 2 - b[2] * R * 0.07 - R * 0.02;
    const singed = C.singe && s === 1;
    if (singed) { outX = exX + s * len * 0.15; outY = lerp(inY, outY, 0.6); midY = (inY + outY) / 2; }
    const pts = []; for (let k = 0; k <= 6; k++) { const u = k / 6; pts.push(P(lerp(inX, outX, u), (1 - u) * (1 - u) * inY + 2 * u * (1 - u) * (2 * midY - (inY + outY) / 2) + u * u * outY)); }
    G(ctx, S, [{ pts, w: R * H.brW * (singed ? 0.9 : 1), c: H.brCol }]);
    if (singed) { ctx.strokeStyle = '#3a3036'; ctx.lineWidth = S.lw * 0.6; ctx.beginPath(); ctx.moveTo(outX, outY); for (let k = 1; k <= 3; k++) ctx.lineTo(outX + s * k * len * 0.22, outY + (k % 2 ? -1 : 1) * R * 0.04); ctx.stroke(); ctx.strokeStyle = INK; }
  });
}

function drawFace(ctx, st, hpts, hp, py) {
  const { r, S, C, o } = st, H = C.head, R = r.head.R, th = fyaw(r.th), sn = Math.sin(th), cs = r.cs, ex = r.exn, t = st.t;
  const mu = R / 12;
  const eyeY = R * H.eyeY + py, sp = spanAt(hpts, R * H.eyeY);
  // blush
  const bl = Math.max(ex.blush || 0, C.lips ? 0.6 : 0.35);
  ctx.fillStyle = C.blush; ctx.globalAlpha = 0.55 * bl;
  for (const s of [-1, 1]) { const v = s * 0.78 + th, d = Math.cos(v); if (d < 0.1) continue; const sp2 = spanAt(hpts, R * 0.45); ctx.beginPath(); ctx.ellipse(sp2.c + sp2.hw * 0.86 * Math.sin(v), R * 0.45 + py, R * 0.16 * d, R * 0.09, 0, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  // eyes
  let blink = o.blink;
  if (blink == null) { const per = 97 + (st.seed * 13) % 37, ph = (t + st.seed * 29) % per; blink = ph < 1 ? 0.5 : ph < 3 ? 1 : ph < 4 ? 0.5 : 0; }
  const E = ex.e, look = o.look || E.look || [0, 0];
  const lookX = sn * 0.45 + look[0], lookY = look[1] + (r.pose === 'phone' ? 0.7 : 0);
  const eyes = [];
  for (const s of [-1, 1]) {
    const v = s * H.eyeA + th, d = Math.cos(v); if (d < 0.02) continue;
    const x = sp.c + sp.hw * 0.9 * Math.sin(v), rx = R * H.erx * lerp(0.42, 1, cl(d, 0, 1)) * (E.o > 1 ? E.o : 1), ry = R * H.ery * (E.o || 1);
    eyes.push({ s, x, rx, ry, d });
  }
  for (const e of eyes) drawEye(ctx, st, e.x, eyeY, e.rx, e.ry, E, lookX, lookY, blink, e.s);
  if (E.tears) for (const e of eyes) { const ph = (t * 0.06 + e.s * 0.3) % 1; const x = e.x + e.s * e.rx * 0.3; G(ctx, S, [{ pts: [P(x, eyeY + e.ry * 0.8), P(x + e.s * R * 0.03, eyeY + R * 0.42)], w: R * 0.085, c: '#7fd0ff' }, { p: ell(x + e.s * R * 0.04, eyeY + R * (0.5 + ph * 0.3), R * 0.065, R * 0.085), c: '#7fd0ff' }]); }
  if (!(C.hat && C.hat.type === 'flop')) drawBrows(ctx, st, hpts, py);
  // wrinkles (older chef)
  if (H.lines) for (const e of eyes) { const ox = e.x + e.s * e.rx * 1.25; line(ctx, S, [P(ox, eyeY - e.ry * 0.15), P(ox + e.s * R * 0.08, eyeY - e.ry * 0.3)], 0.4); line(ctx, S, [P(ox, eyeY + e.ry * 0.15), P(ox + e.s * R * 0.08, eyeY + e.ry * 0.32)], 0.4); }
  // glasses (mom)
  if (H.glasses) {
    ctx.strokeStyle = '#8a3b2b'; ctx.lineWidth = S.lw * 0.6;
    const gy = eyeY + R * 0.05; ctx.fillStyle = 'rgba(200,230,255,0.22)';
    for (const e of eyes) { ctx.beginPath(); ctx.roundRect(e.x - e.rx * 1.3, gy - e.ry * 0.95, e.rx * 2.6, e.ry * 1.75, R * 0.1); ctx.fill(); ctx.stroke(); }
    if (eyes.length === 2) { ctx.beginPath(); ctx.moveTo(eyes[0].x + eyes[0].rx * 1.3, gy - e0(eyes) * 0.3); ctx.quadraticCurveTo((eyes[0].x + eyes[1].x) / 2, gy - eyes[0].ry * 0.6, eyes[1].x - eyes[1].rx * 1.3, gy - e0(eyes) * 0.3); ctx.stroke(); }
    // chain hanging from the temples
    ctx.strokeStyle = '#e0b84a'; ctx.lineWidth = S.lw * 0.45; ctx.setLineDash([R * 0.05, R * 0.06]);
    for (const e of eyes) { if (Math.abs(e.s * 1 + sn) < 0.4 && eyes.length === 1) continue; const sx = e.x + e.s * e.rx * 1.3, sp2 = spanAt(hpts, R * 0.9); const ex2 = sp2.c + e.s * sp2.hw * 1.05; ctx.beginPath(); ctx.moveTo(sx, gy); ctx.quadraticCurveTo(ex2 + e.s * R * 0.2, gy + R * 0.6, ex2 + e.s * R * 0.05, R * 1.55); ctx.stroke(); }
    ctx.setLineDash([]); ctx.strokeStyle = INK;
  }
  // nose
  const ny = R * H.noseY + py, spn = spanAt(hpts, R * H.noseY), nx = spn.c + spn.hw * sn * 0.97;
  const nw = { round: 0.125, long: 0.14, broad: 0.19, button: 0.11 }[H.nose] * R, nh = { round: 0.115, long: 0.22, broad: 0.13, button: 0.1 }[H.nose] * R;
  const nxo = nx + sn * nw * 0.55;
  if (H.nose === 'long') G(ctx, S, [{ p: spl([[nxo - nw, ny + nh * 0.4], [nxo - nw * 0.4, ny - nh * 1.4], [nxo + sn * nw * 0.6, ny - nh * 0.3], [nxo + nw * 1.0 + sn * nw * 0.5, ny + nh * 0.5], [nxo, ny + nh * 0.75]]), c: C.skin, s: C.skinS, o: nw * 0.45, oy: 0 }]);
  else G(ctx, S, [{ p: ell(nxo, ny, nw * (1 - 0.15 * Math.abs(sn)), nh), c: C.skin, s: C.skinS, o: nw * 0.5, oy: 0 }]);
  if (H.nose === 'broad' && cs > 0.4) { ctx.fillStyle = C.skinS; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(nxo + s * nw * 0.45, ny + nh * 0.35, nw * 0.16, nh * 0.2, 0, 0, TAU); ctx.fill(); } }
  // mouth
  if (cs > -0.05) {
    const my = R * H.mouthY + py, spm = spanAt(hpts, R * H.mouthY), mx = spm.c + spm.hw * sn * 0.86;
    const vis = viseme(o.say, t); const m = vis || ex.m;
    ctx.save(); ctx.translate(mx, my); ctx.scale(mu * (0.5 + 0.5 * cs), mu);
    drawMouth(ctx, st, m, C, mu);
    ctx.restore();
    if (H.stache) { // thin curled moustache
      const y = my - R * 0.12, w = R * 0.32 * (0.55 + 0.45 * cs);
      ctx.strokeStyle = INK; ctx.lineWidth = R * 0.05 + 2 * S.lw * 0.55;
      const path = (s) => { ctx.beginPath(); ctx.moveTo(mx, y - R * 0.02); ctx.quadraticCurveTo(mx + s * w * 0.6, y - R * 0.09, mx + s * w, y); ctx.quadraticCurveTo(mx + s * w * 1.25, y + R * 0.02, mx + s * w * 1.15, y - R * 0.12); };
      for (const s of [-1, 1]) { path(s); ctx.stroke(); }
      ctx.strokeStyle = H.stache; ctx.lineWidth = R * 0.05; for (const s of [-1, 1]) { path(s); ctx.stroke(); }
      ctx.strokeStyle = INK;
    }
  }
}
const e0 = (eyes) => eyes[0].ry;
const fyaw = (th) => (Math.abs(th) > 0.2 && Math.abs(th) < 1.2 ? th * 0.64 : th);

function drawEye(ctx, st, x, y, rx, ry, E, lx, ly, blink, s) {
  const { S, C, r } = st, R = r.head.R;
  const lidAdd = C.lidAdd || 0;
  if (E.happy) { // closed happy arcs
    ctx.lineWidth = S.lw * 1.2; ctx.beginPath(); ctx.moveTo(x - rx, y + ry * 0.15); ctx.quadraticCurveTo(x, y - ry * 0.95, x + rx, y + ry * 0.15); ctx.stroke(); return;
  }
  const lt = Math.max(cl((E.lt || 0) + lidAdd * (E.lt ? 0.3 : 1), 0, 0.9), blink);
  if (lt > 0.88) { ctx.lineWidth = S.lw * 1.1; ctx.beginPath(); ctx.moveTo(x - rx, y + ry * 0.1); ctx.quadraticCurveTo(x, y + ry * 0.45, x + rx, y + ry * 0.1); ctx.stroke(); return; }
  const p = ell(x, y, rx, ry);
  ctx.lineWidth = 2 * S.lw; ctx.stroke(p); ctx.fillStyle = '#ffffff'; ctx.fill(p);
  ctx.save(); ctx.clip(p);
  const pr = Math.min(rx, ry) * 0.5 * (E.p || 1) / Math.max(0.6, rx / (R * C.head.erx));
  const prr = R * C.head.erx * 0.5 * (E.p || 1);
  const px = x + cl(lx, -1, 1) * Math.max(0, rx - prr * 0.7) * 0.75, pyy = y + cl(ly, -1, 1) * (ry - prr) * 0.7 + ry * 0.05;
  ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(px, pyy, prr * Math.min(1, rx / (R * C.head.erx) + 0.2), prr, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(px - prr * 0.35, pyy - prr * 0.38, prr * (E.spark ? 0.42 : 0.3), 0, TAU); ctx.fill();
  if (E.spark) { ctx.beginPath(); ctx.arc(px + prr * 0.4, pyy + prr * 0.35, prr * 0.17, 0, TAU); ctx.fill(); }
  void pr;
  // lids
  ctx.fillStyle = C.skin; ctx.strokeStyle = INK; ctx.lineWidth = S.lw * 0.8;
  if (lt > 0.01) { const ly0 = y - ry + 2 * ry * lt; ctx.beginPath(); ctx.moveTo(x - rx * 1.2, y - ry * 1.2); ctx.lineTo(x + rx * 1.2, y - ry * 1.2); ctx.lineTo(x + rx * 1.2, ly0 - ry * 0.12); ctx.quadraticCurveTo(x, ly0 + ry * 0.12, x - rx * 1.2, ly0 - ry * 0.12); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - rx * 1.2, ly0 - ry * 0.12); ctx.quadraticCurveTo(x, ly0 + ry * 0.12, x + rx * 1.2, ly0 - ry * 0.12); ctx.stroke(); }
  const lb = E.lb || 0;
  if (lb > 0.01) { const ly1 = y + ry - 2 * ry * lb; ctx.beginPath(); ctx.moveTo(x - rx * 1.2, y + ry * 1.2); ctx.lineTo(x + rx * 1.2, y + ry * 1.2); ctx.lineTo(x + rx * 1.2, ly1 + ry * 0.15); ctx.quadraticCurveTo(x, ly1 - ry * 0.2, x - rx * 1.2, ly1 + ry * 0.15); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - rx * 1.2, ly1 + ry * 0.15); ctx.quadraticCurveTo(x, ly1 - ry * 0.2, x + rx * 1.2, ly1 + ry * 0.15); ctx.stroke(); }
  ctx.restore();
  ctx.lineWidth = S.lw * 0.5; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.stroke();
  if (C.lash) { ctx.lineWidth = S.lw * 0.8; ctx.beginPath(); ctx.moveTo(x + s * rx * 0.85, y - ry * 0.55); ctx.lineTo(x + s * rx * 1.3, y - ry * 0.85); ctx.stroke(); }
}

function drawMouth(ctx, st, m, C, mu) {
  const { S } = st; const lw = S.lw / mu; // we are in mouth units (scaled by mu)
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = INK;
  const lipCol = C.lips;
  if (m.k === 'line') {
    const c1 = m.c + (m.sk || 0) * 0;
    ctx.lineWidth = lw * 1.05; ctx.beginPath(); ctx.moveTo(-m.w, m.c); ctx.quadraticCurveTo(0, -m.c * 0.9 + ((m.sk || 0) * 0.3), m.w, m.c + (m.sk || 0)); ctx.stroke();
    if (lipCol) { ctx.strokeStyle = lipCol; ctx.lineWidth = lw * 0.6; ctx.beginPath(); ctx.moveTo(-m.w * 0.7, m.c * 0.6 + 0.6); ctx.quadraticCurveTo(0, -m.c * 0.6 + 1.4, m.w * 0.7, m.c * 0.6 + 0.6); ctx.stroke(); ctx.strokeStyle = INK; }
    // smile dimples
    if (m.c < -1 || m.sk) { ctx.lineWidth = lw * 0.6; const ex = m.w + 0.4, ey = m.c + (m.sk || 0); ctx.beginPath(); ctx.moveTo(ex - 0.6, ey - 0.9); ctx.lineTo(ex + 0.3, ey + 0.4); ctx.stroke(); }
    void c1; return;
  }
  let p;
  if (m.k === 'O') { p = ell(0, 0.6, m.w, m.h); }
  else if (m.k === 'squig') { ctx.lineWidth = lw * 1.05; ctx.beginPath(); ctx.moveTo(-m.w + m.x, 0.3); ctx.bezierCurveTo(-m.w * 0.4 + m.x, -1.2, m.w * 0.0 + m.x, 1.6, m.w * 0.4 + m.x, -0.2); ctx.quadraticCurveTo(m.w * 0.7 + m.x, -0.9, m.w + m.x, 0); ctx.stroke(); return; }
  else if (m.k === 'F') { p = new Path2D(); p.moveTo(-m.w, 0.2); p.quadraticCurveTo(0, -1.6, m.w, 0.2); p.quadraticCurveTo(0, 2.2, -m.w, 0.2); p.closePath(); }
  else { p = new Path2D(); p.moveTo(-m.w, m.c); p.quadraticCurveTo(0, 2 * m.top - m.c, m.w, m.c); p.quadraticCurveTo(0, 2 * m.bot - m.c, -m.w, m.c); p.closePath(); }
  ctx.lineWidth = lw * 2; ctx.stroke(p);
  if (m.k === 'teeth') {
    ctx.fillStyle = '#ffffff'; ctx.fill(p); ctx.save(); ctx.clip(p); ctx.lineWidth = lw * 0.55;
    const my = (m.top + m.bot) / 2 + 0.15; ctx.beginPath(); ctx.moveTo(-m.w, m.c * 0.4 + my * 0.6); ctx.quadraticCurveTo(0, my * 1.3 - m.c * 0.3, m.w, m.c * 0.4 + my * 0.6); ctx.stroke();
    for (const x of [-0.62, -0.25, 0.12, 0.48]) { ctx.beginPath(); ctx.moveTo(x * m.w * 1.25, -5); ctx.lineTo(x * m.w * 1.25, 8); ctx.stroke(); }
    ctx.restore();
  } else {
    ctx.fillStyle = '#5a1830'; ctx.fill(p); ctx.save(); ctx.clip(p);
    if (m.tongue || m.k === 'O') { ctx.fillStyle = '#ee7484'; ctx.beginPath(); ctx.ellipse(0, (m.k === 'O' ? m.h * 0.75 : m.bot) + 0.2, (m.k === 'O' ? m.w * 0.8 : m.w * 0.55), m.k === 'O' ? 1.4 : 1.9, 0, 0, TAU); ctx.fill(); }
    if (m.teeth || m.k === 'F') { ctx.fillStyle = '#ffffff'; const ty = m.k === 'F' ? -0.3 : Math.min(m.top, m.c) + 1.15; ctx.fillRect(-10, -10, 20, ty + 10); if (m.teeth === 2) ctx.fillRect(-10, m.bot - 1.1, 20, 6); }
    ctx.restore();
  }
  ctx.lineWidth = lw; ctx.stroke(p);
  if (lipCol && m.k !== 'O') { ctx.strokeStyle = lipCol; ctx.lineWidth = lw * 0.7; ctx.stroke(p); ctx.strokeStyle = INK; ctx.lineWidth = lw * 0.5; ctx.stroke(p); }
}

function sweat(ctx, st, hpts, R, amt) {
  const { S, r, t } = st; const sp = spanAt(hpts, -R * 0.2);
  const side = r.sn > 0.3 ? -1 : 1; const x = sp.c + side * sp.hw * 0.78, ph = (t % 45) / 45;
  const drop = (x, y, s) => { const p = new Path2D(); p.moveTo(x, y - s * 1.6); p.bezierCurveTo(x + s * 0.4, y - s * 0.7, x + s, y - s * 0.1, x + s, y + s * 0.35); p.arc(x, y + s * 0.35, s, 0, Math.PI); p.bezierCurveTo(x - s, y - s * 0.1, x - s * 0.4, y - s * 0.7, x, y - s * 1.6); return p; };
  const s = R * 0.11 * Math.sqrt(amt), y = -R * 0.3 + ph * R * 0.25;
  G(ctx, S, [{ p: drop(x, y, s), c: '#8fdcff', s: '#5bb8ea', o: s * 0.4, oy: 0 }]);
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x - s * 0.35, y + s * 0.2, s * 0.22, s * 0.35, 0, 0, TAU); ctx.fill();
  if (amt > 0.6) G(ctx, S, [{ p: drop(x + side * R * 0.18, -R * 0.55 + ((ph + 0.5) % 1) * R * 0.2, s * 0.6), c: '#8fdcff' }]);
}
function smoke(ctx, st, R) {
  const { S, t } = st;
  for (let i = 0; i < 4; i++) {
    const ph = ((t * 0.011 + i / 4) % 1), y = -R * 1.25 - ph * R * 1.9, x = Math.sin(ph * 5 + i * 2) * R * 0.25 + (i - 1.5) * R * 0.28;
    const rr = R * (0.13 + ph * 0.22); ctx.globalAlpha = Math.min(1, (1 - ph) * 1.6) * 0.85;
    G(ctx, { ...S, lw: S.lw * 0.6 }, [{ p: ell(x, y, rr, rr * 0.85), c: '#cfc9d6' }, { p: ell(x + rr * 0.7, y - rr * 0.4, rr * 0.7, rr * 0.6), c: '#cfc9d6' }]);
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
    G(ctx, S, [{ p: hs_.p, c: hat.c, s: hat.s, o: R * 0.2, oy: R * 0.05 }]);
    const ring2 = ringPts(R, W, th, (a) => ef(a) + 0.32, 40);
    ctx.save(); ctx.clip(hs_.p); ctx.fillStyle = hat.cuff; ctx.fill(aboveRing(ring2, R, true));
    shade(ctx, aboveRing(ring2, R, true), hat.s, 0, 0);
    ctx.lineWidth = S.lw; ctx.beginPath(); ring2.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    ctx.lineWidth = S.lw * 0.45; for (let i = 2; i < ring2.length - 1; i += 4) { const a = hs_.ring[Math.min(i, hs_.ring.length - 1)], b = ring2[i]; ctx.beginPath(); ctx.moveTo(a[0], a[1] - R * 0.04); ctx.lineTo(b[0], b[1] + R * 0.04); ctx.stroke(); }
    // little patch label
    const v = th; if (Math.cos(v) > 0.2) { const x = R * W * 0.98 * Math.sin(-0.35 + v) * Math.cos(hat.eb + 0.16), y = -R * Math.sin(hat.eb + 0.16); ctx.fillStyle = '#f6f1e6'; ctx.beginPath(); ctx.roundRect(x - R * 0.12 * Math.cos(v - 0.35), y - R * 0.07, R * 0.24 * Math.cos(v - 0.35), R * 0.14, R * 0.03); ctx.fill(); ctx.lineWidth = S.lw * 0.5; ctx.stroke(); }
    ctx.restore();
  } else { // toque band
    const ring = ringPts(R, W, th, () => hat.eb, 40).map((p) => [p[0] * 1.07, p[1] + R * 0.03]);
    const f0 = ring[0], f1 = ring[ring.length - 1], topY = -R * 1.0;
    const band = { p: spl([...ring.filter((_, i) => i % 3 === 0 || i === ring.length - 1), [f1[0] * 1.02, lerp(f1[1], topY, 0.5)], [f1[0] * 0.97, topY], [0, topY - R * 0.03], [f0[0] * 0.97, topY], [f0[0] * 1.02, lerp(f0[1], topY, 0.5)]]) };
    G(ctx, S, [{ p: band.p, c: hat.c, s: hat.s, o: R * 0.18, oy: 0 }]);
    const ring2 = ringPts(R, W, th, () => hat.eb + 0.2, 40).map((p) => [p[0] * 1.07, p[1]]);
    ctx.save(); ctx.clip(band.p); ctx.lineWidth = S.lw * 0.6; ctx.beginPath(); ring2.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.restore();
  }
}
function toqueColumn(ctx, st, R, W, hat) {
  const { r, S, t } = st, sn = r.sn;
  const base = -R * 0.72, Hh = R * hat.H, w0 = R * W * hat.w;
  if (hat.type === 'tall') {
    const top = base - Hh, w1 = w0 * 1.12, cx = -sn * R * 0.08;
    const col = poly([[cx - w0, base], [cx - w1, top + R * 0.3], [cx + w1, top + R * 0.3], [cx + w0, base]]);
    const puffs = []; for (let i = 0; i < 5; i++) { const u = i / 4 - 0.5; puffs.push({ p: ell(cx + u * w1 * 1.7, top + R * 0.1 - Math.cos(u * 2.4) * R * 0.25, R * 0.48, R * 0.42), c: hat.c, s: hat.s, o: R * 0.15, oy: 0 }); }
    G(ctx, S, [...puffs, { p: col, c: hat.c, s: hat.s, o: R * 0.3, oy: 0 }]);
    for (let i = 1; i < 6; i++) { const u = i / 6 * 2 - 1; const ph = u + sn * 0.3; if (Math.abs(ph) > 0.95) continue; line(ctx, S, [P(cx + ph * w0 * 0.95, base - R * 0.2), P(cx + ph * w1 * 0.95, top + R * 0.45)], 0.42); }
  } else { // floppy, too-big toque
    const sway = Math.sin(t * 0.07) * 0.08, dir = sn > 0.3 ? -1 : 1;
    const cx = -sn * R * 0.05, w1 = w0 * 1.25;
    const top = base - Hh, bx = dir * R * (0.9 + sway * 4);
    const L = [], Rr = [];
    for (let i = 0; i <= 8; i++) { const u = i / 8; const x = cx + bx * u * u, y = lerp(base, top, u) + R * 0.35 * u * u * u; const w = lerp(w0, w1, u); L.push([x - w, y]); Rr.push([x + w, y]); }
    const col = poly([...L, ...Rr.reverse()]);
    const tx = cx + bx, ty = top + R * 0.35;
    const puffs = [[0, 0, 0.62], [dir * 0.55, 0.32, 0.5], [-dir * 0.5, -0.1, 0.48], [dir * 0.95, 0.7, 0.42]].map(([ox, oy, rr]) => ({ p: ell(tx + ox * R, ty + oy * R - R * 0.2, R * rr, R * rr * 0.88), c: hat.c, s: hat.s, o: R * 0.15, oy: 0 }));
    G(ctx, S, [{ p: col, c: hat.c, s: hat.s, o: R * 0.3, oy: 0 }, ...puffs]);
    for (const u of [-0.5, 0, 0.5]) line(ctx, S, [P(cx + u * w0, base - R * 0.2), P(cx + bx * 0.35 + u * w1 * 0.9, base - Hh * 0.6)], 0.4);
    if (st.soot > 0) sootDots(ctx, st, tx, ty, R * 0.3, 3, 77);
  }
}

// ---------------------------------------------------------------- rim / flash light
function rimOn(ctx, st, p, off) { // lit crescent on the side facing o.light, drawn under the line work
  const L = st.o.light; if (!L || !(L.amt > 0)) return; const amt = cl(L.amt, 0, 1), dir = L.dir || 1;
  ctx.save(); ctx.clip(p); ctx.fillStyle = L.col;
  ctx.globalAlpha = 0.12 * amt; ctx.fill(p);
  ctx.globalAlpha = 0.9 * amt; const q = new Path2D(); q.rect(-BIG, -BIG, 2 * BIG, 2 * BIG); q.addPath(p, { a: 1, b: 0, c: 0, d: 1, e: -dir * off, f: off * 0.25 }); ctx.fill(q, 'evenodd');
  ctx.restore();
}
