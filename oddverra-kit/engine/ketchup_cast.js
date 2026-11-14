// [KCH-cast] "Ketchup was sold as medicine" (1830s Ohio): outfit table (merged into ODD by main.js) + options passthrough.
export const KCH_ODD = {
  BENNETT: { frock: true, coat: true, shirt: '#2a3350', pants: '#4a4238', waistcoat: '#c8a04a', collar: '#f6f2e6', cuff: '#2a3350', neck: 'cravat', neckCol: '#f2ece0', button: '#d8b048',
    hair: 'side', hairCol: '#2a1a14', beard: 'burns', beardK: 0.62, beardCol: '#2a1a14', brow: '#2a1a14', build: 'thin', head: 'egg', skin: '#f2c8a2', nose: 'long', shoes: '#1e1a1e' },
  MILES: { frock: true, coat: true, shirt: '#2c2632', pants: '#6a5a6a', waistcoat: '#7a2a62', collar: '#f4f0e6', cuff: '#2c2632', neck: 'cravat', neckCol: '#d8b048', button: '#d8b048', hat: 'top', hatCol: '#1e1a22',
    hair: 'side', hairCol: '#3a2418', moustache: '#3a2418', stache: 'curl', brow: '#3a2418', build: 'stout', head: 'wide', skin: '#f0bc98', nose: 'round', shoes: '#1a1418' },
  PHELPS: { frock: true, coat: true, shirt: '#1e1c24', pants: '#2c2a32', waistcoat: '#3a3644', collar: '#f4f2ea', cuff: '#1e1c24', neck: 'cravat', neckCol: '#1a1820', button: '#4a4450', glasses: true,
    hair: 'receding', hairCol: '#5a4a3e', beard: 'chops', beardK: 0.78, beardCol: '#6a5848', brow: '#4a3a30', bushyBrow: true, build: 'tall', head: 'tall', skin: '#ecc4a4', nose: 'long', shoes: '#141218' },
  STUDENT1: { shirt: '#f2ece0', rolled: false, vest: '#5a6a4a', neck: 'bow', neckCol: '#2a2a3a', collar: '#f4f0e6', pants: '#6a5a48', hair: 'curly', hairCol: '#8a5230', build: 'thin', head: 'round', skin: '#f6d0b0', shoes: '#3a2a20' },
  STUDENT2: { shirt: '#ece4d4', vest: '#6a3a3a', neck: 'tie', neckCol: '#2a2232', tieK: 0.6, collar: '#f4f0e6', pants: '#4a4a56', hair: 'short', hairCol: '#1e1612', glasses: 'pincenez', build: 'adult', head: 'egg', skin: '#d8a07a', shoes: '#2a2020' },
  TOWNWOMAN: { lashes: true, shirt: '#5a7a5a', pants: '#5a7a5a', collar: '#f2e8d8', cuff: '#f2e8d8', apron: '#f2ecdc', hat: 'bonnet', hatCol: '#e8dcc0', bandCol: '#c8403a', shawl: '#a8483a', hair: 'bun', hairCol: '#6a3a22',
    head: 'round', skin: '#f2c8a6', shoes: '#3a2a22' },
  FARMER: { shirt: '#e8dcc4', rolled: true, openCollar: true, pants: '#4a5a7a', suspenders: '#7a4a2a', hat: 'straw', hatCol: '#e0c070', hair: 'short', hairCol: '#9a6a3a', beard: 'full', beardShort: true, beardK: 0.5, beardCol: '#8a5a32',
    build: 'stout', head: 'wide', skin: '#e8a880', nose: 'round', shoes: '#4a3020', noButtons: true },
  TOWNKID: { shirt: '#c06a3a', pants: '#5a4a3a', hat: 'cap', hatCol: '#4a4a5a', plainCap: true, hair: 'short', hairCol: '#c08a40', build: 'kid', head: 'round', skin: '#ffe0c0', shoes: '#3a2a20', suspenders: '#5a3a24' },
  CHEMIST: { shirt: '#ece8dc', collar: '#f4f2ea', neck: 'bow', neckCol: '#3a2a4a', pants: '#3e3a44', apron: '#d8ccb0', rolled: true, goggles: true, gogglesCol: '#8a6a3a', hair: 'tufts', hairCol: '#d8d0c8', moustache: '#d8d0c8', brow: '#c8c0b8', bushyBrow: true,
    build: 'old', head: 'round', skin: '#f0c4a4', nose: 'round', shoes: '#2a2224', age: true },
  MODERN_KID: { hoodie: true, shirt: '#3a8ab0', pants: '#3a3e5a', cuff: '#3a8ab0', hair: 'curly', hairCol: '#2a1a14', build: 'kid', head: 'round', skin: '#c88a62', shoes: '#f2f2f2', noButtons: true, sneakers: true },
};
// [KCH-cast] per-actor options main.js passes to oddverra (on top of libOpts): crossed arms, tummy clutch, money count, tomato basket, Tommy options
const KCH_OPS = ['cross', 'tummy', 'count', 'point', 'label', 'open', 'closed', 'squeeze', 'pour', 'shine', 'peek', 'glass'];
export const kchOpts = (op) => { const r = {}; for (const k of KCH_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- [KCH-cast] props (registered into oddverra's HOLD; drawn in prop space at the hand, y up = negative) ----------
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, line, taper, smooth, ellP, limb, arcPts, mixc, lt, dk, rgba, polyPath, clamp, hsh } = OVK;
const TAU = Math.PI * 2;
const TOM = '#e0392e', TOMD = '#b8261e', LEAF = '#4f9a4a';
// a tomato: centre (x, y), radius r; o.shine sparkles, o.bite, o.tilt
export function tomatoAt(g, x, y, r, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.tilt || 0);
  const b = new Path2D(); const pts = []; for (let i = 0; i < 28; i++) { const a = TAU * i / 28, lobe = 1 + 0.045 * Math.cos(a * 5 + 0.6) - 0.06 * Math.max(0, -Math.sin(a)) ** 6; pts.push([Math.cos(a) * r * 1.08 * lobe, Math.sin(a) * r * 0.92 * lobe]); } smooth(pts, 4, b);
  cel(g, b, o.col || TOM, Math.max(2, r * 0.09), r * 0.28, r * 0.22, r * 0.12);
  g.save(); g.clip(b); for (const k of [-0.5, 0, 0.5]) taper(g, [[k * r * 0.5, -r * 0.8], [k * r * 0.9, 0], [k * r * 0.5, r * 0.8]], r * 0.05, rgba(TOMD, 0.35), 0.2); g.restore();
  g.beginPath(); g.ellipse(-r * 0.42, -r * 0.36, r * 0.2, r * 0.13, -0.6, 0, TAU); g.fillStyle = 'rgba(255,236,226,0.85)'; g.fill(); g.beginPath(); g.arc(-r * 0.15, -r * 0.5, r * 0.06, 0, TAU); g.fill();
  const cal = new Path2D(); const cp = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + TAU * i / 10, rr = i % 2 ? r * 0.12 : r * 0.46; cp.push([Math.cos(a) * rr * 1.1, -r * 0.84 + Math.sin(a) * rr * 0.42]); } polyPath(cp, cal); cel(g, cal, LEAF, Math.max(1.5, r * 0.06), r * 0.06, r * 0.05, 0);
  taper(g, [[0, -r * 0.86], [r * 0.04, -r * 1.05], [r * 0.14, -r * 1.12]], r * 0.11, INK, 0.7); taper(g, [[0, -r * 0.86], [r * 0.04, -r * 1.05], [r * 0.14, -r * 1.12]], r * 0.07, '#3e7a3a', 0.7);
  if (o.shine) { const t = o.t || 0; for (let k = 0; k < 4; k++) { const ph = (t * 0.05 + k / 4) % 1, a = k * 1.7 + 0.4, d = r * (1.3 + 0.25 * Math.sin(k)), sz = r * 0.22 * Math.sin(Math.PI * ph); if (sz < 1) continue; const sx = Math.cos(a) * d, sy = Math.sin(a) * d - r * 0.2;
    g.beginPath(); for (let j = 0; j < 8; j++) { const rr = j % 2 ? sz * 0.28 : sz, an = j * Math.PI / 4; g.lineTo(sx + rr * Math.cos(an), sy + rr * Math.sin(an)); } g.closePath(); g.fillStyle = '#fff6c8'; g.fill(); g.lineWidth = 1.4; g.strokeStyle = 'rgba(43,29,74,0.6)'; g.stroke(); } }
  g.restore(); }
const label = (g, x, y, w, h, lines, bg = '#f2e6c0', ink = '#3a1e1e', font = 'serif') => { const lb = new Path2D(); lb.rect(x - w / 2, y - h / 2, w, h); cel(g, lb, bg, 2, 4, 2, 0); g.lineWidth = 1.4; g.strokeStyle = rgba(ink, 0.6); g.strokeRect(x - w / 2 + 3, y - h / 2 + 3, w - 6, h - 6);
  g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle'; const n = lines.length; lines.forEach((t, i) => { const [s, sz] = Array.isArray(t) ? t : [t, h / (n + 0.8)]; g.font = `bold ${sz}px ${font}`; let fs = sz; while (g.measureText(s).width > w - 10 && fs > 5) { fs -= 0.5; g.font = `bold ${fs}px ${font}`; } g.fillText(s, x, y - h / 2 + (i + 0.5) * h / n + 1); }); };
const LABELS = { miles: ["DR. MILES'", 'COMPOUND EXTRACT', 'OF TOMATO'], phelps: ["PHELPS'", 'TOMATO', 'PILLS'], genuine: ['THE', 'GENUINE!'], pills: ['TOMATO', 'PILLS'] };
const pillAt = (g, x, y, r, col = '#9a3a2a') => { cel(g, ellP(x, y, r, r * 0.92), col, Math.max(1.4, r * 0.16), r * 0.4, r * 0.3, 0); g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, TAU); g.fillStyle = 'rgba(255,230,210,0.75)'; g.fill(); };
export const KCH_HOLD = {
  tomato: (g, op = {}) => tomatoAt(g, OVH.HSIDE * 4, -44, 40, { shine: op.shine ?? !!op.raise, t: op.t }),
  bigtomato: (g, op = {}) => tomatoAt(g, OVH.HSIDE * 6, -70, 66, { shine: op.shine ?? true, t: op.t }),
  pill: (g) => { pillAt(g, OVH.HSIDE * 10, -24, 15); },
  pillbox: (g, op = {}) => { const W = 66, H = 64, y0 = -14, L = LABELS[op.label] || LABELS.pills; // round chip-wood pill box, lid off (op.closed keeps it on)
    const bd = new Path2D(); bd.moveTo(-W, y0 - H); bd.lineTo(-W, y0); bd.ellipse(0, y0, W, 16, 0, Math.PI, 0, true); bd.lineTo(W, y0 - H); bd.closePath(); cel(g, bd, '#c89a5a', 3.4, 8, 5, 3, (h) => { h.strokeStyle = 'rgba(110,70,30,0.25)'; h.lineWidth = 1.2; for (let x = -W; x < W; x += 9) { h.beginPath(); h.moveTo(x, y0 - H); h.lineTo(x + 2, y0 + 16); h.stroke(); } });
    g.save(); g.clip(bd); label(g, 0, y0 - H * 0.45, W * 2, H * 0.62, L, '#f2e6c0', '#7a1e1a'); g.restore();
    if (op.closed) { const ld = new Path2D(); ld.moveTo(-W - 4, y0 - H - 14); ld.lineTo(-W - 4, y0 - H + 6); ld.ellipse(0, y0 - H + 6, W + 4, 15, 0, Math.PI, 0, true); ld.lineTo(W + 4, y0 - H - 14); ld.closePath(); cel(g, ld, '#b8864a', 3, 5, 3, 2); cel(g, ellP(0, y0 - H - 14, W + 4, 15), '#d8ac6a', 2.6, 0, 0, 0); return; }
    cel(g, ellP(0, y0 - H, W, 16), '#7a4a22', 2.8, 0, 0, 0); for (let i = 0; i < 9; i++) pillAt(g, -W * 0.7 + (i % 5) * W * 0.34 + (i > 4 ? W * 0.17 : 0), y0 - H - 4 - (i > 4 ? 6 : 0), 9); },
  pillbottle: (g, op = {}) => { const L = LABELS[op.label] || LABELS.pills, gc = op.glass || '#8a4a1e'; const b = new Path2D(); b.moveTo(-14, -168); b.lineTo(14, -168); b.lineTo(14, -138); b.quadraticCurveTo(40, -126, 40, -96); b.lineTo(40, 6); b.quadraticCurveTo(0, 16, -40, 6); b.lineTo(-40, -96); b.quadraticCurveTo(-40, -126, -14, -138); b.closePath();
    cel(g, b, gc, 4, 12, 6, 6); taper(g, [[-28, -100], [-30, -10]], 6, 'rgba(255,236,200,0.6)', 0.4); g.save(); g.clip(b); label(g, 0, -52, 80, 64, L, '#f2e6c0', '#7a1e1a'); g.restore();
    cel(g, ((p) => { p.roundRect(-17, -186, 34, 22, 4); return p; })(new Path2D()), '#e8dcc0', 3, 4, 3, 0); line(g, [[-16, -170], [16, -170]], 2, '#a8323a'); },
  moneybag: (g, op = {}) => { const s = OVH.HSIDE, t = op.t || 0, jig = op.count ? Math.sin(t * 0.6) * 0.05 : 0; g.save(); g.translate(s * 10, 14); g.rotate(jig);
    const bg = smooth([[-16, -96], [16, -96], [26, -78], [58, -40], [66, 10], [44, 48], [0, 56], [-44, 48], [-66, 10], [-58, -40], [-26, -78]], 6); cel(g, bg, '#c8b07a', 3.8, 12, 8, 4, (h) => { h.strokeStyle = 'rgba(110,80,40,0.2)'; h.lineWidth = 1.2; for (let y = -90; y < 60; y += 8) { h.beginPath(); h.moveTo(-70, y); h.lineTo(70, y + 4); h.stroke(); } });
    for (const k of [-1, 1]) taper(g, [[k * 8, -80], [k * 26, -30], [k * 30, 30]], 2, 'rgba(110,80,40,0.5)', 0.2);
    cel(g, smooth([[-22, -118], [0, -128], [22, -118], [16, -96], [-16, -96]], 4), '#c8b07a', 3, 4, 3, 0); taper(g, [[-20, -98], [0, -94], [20, -98]], 5, '#7a3a2a', 0.6); taper(g, [[18, -97], [34, -84], [30, -70]], 3.4, '#7a3a2a', 0.6);
    g.fillStyle = '#3a6a3a'; g.font = 'bold 54px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 0, -2); g.lineWidth = 1.2; g.strokeStyle = INK; g.strokeText('$', 0, -2);
    for (const [x, y] of [[-30, -102], [28, -110]]) { cel(g, ellP(x, y, 11, 6), '#e8b830', 1.8, 2, 2, 0); } g.restore(); },
  pointer: (g) => { const s = OVH.HSIDE, a = [-s * 10, 30], b = [s * 120, -230]; line(g, [a, b], 11, INK); line(g, [a, b], 6.5, '#8a5a34'); line(g, [[a[0] + s * 2, a[1] - 8], [b[0] * 0.9, b[1] * 0.9]], 1.8, 'rgba(255,220,180,0.45)'); cel(g, ellP(b[0], b[1], 6, 6), '#e8e0cc', 2, 0, 0, 0); },
  magnifier: (g, op = {}) => { const s = OVH.HSIDE, a = [s * 2, 18], b = [s * 26, -60]; line(g, [a, b], 15, INK); line(g, [a, b], 10, '#5a3a2a'); const C = [s * 46, -116], R = 44;
    const lens = ellP(C[0], C[1], R, R); g.fillStyle = 'rgba(200,230,255,0.35)'; g.fill(lens); g.save(); g.clip(lens); g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(C[0] - 14, C[1] - 16, 18, 9, -0.7, 0, TAU); g.fill(); if (op.peek) tomatoAt(g, C[0] + 6, C[1] + 8, 22); g.restore();
    g.lineWidth = 15; g.strokeStyle = INK; g.stroke(lens); g.lineWidth = 9.5; g.strokeStyle = '#c89a3a'; g.stroke(lens); g.lineWidth = 2.2; g.strokeStyle = '#f2d080'; g.beginPath(); g.arc(C[0], C[1], R - 2, Math.PI * 1.1, Math.PI * 1.5); g.stroke(); },
  book: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 8, -40); g.rotate(-s * 0.12); const cv = new Path2D(); cv.roundRect(-46, -62, 92, 120, 5); cel(g, cv, '#6a2a26', 3.6, 6, 4, 3); const pg = new Path2D(); pg.rect(s > 0 ? 40 : -46, -56, 6, 108); g.fillStyle = '#f2ead2'; g.fill(pg);
    for (const y of [-40, 40]) line(g, [[-44, y], [44, y]], 3, '#d8b048'); cel(g, polyPath([[-20, -18], [20, -18], [20, 16], [-20, 16]]), '#d8b048', 1.6, 0, 0, 0); tomatoAt(g, 0, 0, 11); g.restore(); },
  poster: (g, op = {}) => { const s = OVH.HSIDE, t = op.t || 0; if (op.open) { g.save(); g.translate(s * 20, -130); g.rotate(-s * 0.05); const W = 84, H = 116, p = new Path2D(); p.rect(-W, -H, 2 * W, 2 * H); cel(g, p, '#f2e4c0', 3.6, 8, 5, 3);
      const L = op.label === 'miles' ? ["DR. MILES'", 'COMPOUND EXTRACT', 'OF TOMATO', 'CURES ALL', 'YOUR ILLS!'] : op.label === 'phelps' ? ["PHELPS'", 'TOMATO PILLS', 'THE GENUINE!', 'BEWARE', 'IMITATIONS!'] : ['TOMATO PILLS', 'CURE ALL', 'YOUR ILLS!'];
      g.save(); g.clip(p); g.fillStyle = '#a8323a'; g.fillRect(-W, -H, 2 * W, 10); g.fillRect(-W, H - 10, 2 * W, 10); tomatoAt(g, 0, -H * 0.62, 26); g.fillStyle = '#3a1e1e'; g.textAlign = 'center'; g.textBaseline = 'middle';
      L.forEach((txt, i) => { let fs = i === 0 ? 24 : 21; g.font = `bold ${fs}px serif`; while (g.measureText(txt).width > 2 * W - 16) { fs -= 1; g.font = `bold ${fs}px serif`; } g.fillStyle = i >= 3 || (L.length === 3 && i > 0) ? '#a8323a' : '#3a1e1e'; g.fillText(txt, 0, -H * 0.18 + i * 34); }); g.restore();
      for (const [x, y] of [[-W, -H], [W, -H]]) cel(g, ellP(x + (x < 0 ? 8 : -8), y + 8, 4, 4), '#8a8a98', 1.4, 0, 0, 0); g.restore(); return; }
    const a = [s * -26, 40], b = [s * 30, -150]; line(g, [a, b], 34, INK); line(g, [a, b], 28, '#f2e4c0'); line(g, [lerp2(a, b, 0.05), lerp2(a, b, 0.95)], 5, 'rgba(255,255,255,0.45)'); line(g, [lerp2(a, b, 0.3), lerp2(a, b, 0.36)], 28, '#a8323a'); cel(g, ellP(b[0], b[1], 14, 8, s * 0.3), '#e8d8b0', 2.4, 0, 0, 0); taper(g, arcPts(b[0], b[1], 6, 0, 5, 8, 3.4), 1.6, '#a8908a', 0.3); },
  fries: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 4, -10); for (let i = 0; i < 9; i++) { const x = -34 + i * 8.5, h = 70 + hsh(i, 3) * 40, an = (hsh(i, 5) - 0.5) * 0.4; g.save(); g.translate(x, -50); g.rotate(an); const fp = new Path2D(); fp.rect(-5, -h, 10, h); cel(g, fp, '#f2c454', 2, 3, 0, 0); g.restore(); }
    const c = polyPath([[-46, -80], [46, -80], [36, 10], [-36, 10]]); cel(g, c, '#d8302a', 3.6, 8, 5, 3); g.save(); g.clip(c); g.fillStyle = '#f4eee2'; for (let x = -50; x < 50; x += 20) g.fillRect(x, -80, 8, 100); g.restore(); taper(g, [[-44, -78], [0, -72], [44, -78]], 3, 'rgba(255,255,255,0.6)', 0.4);
    cel(g, smooth([[-20, -88], [-8, -96], [6, -90], [4, -82], [-16, -80]], 4), '#c8241e', 2, 2, 2, 0); g.restore(); },
  ketchup: (g, op = {}) => { const sq = clamp(op.squeeze || 0, 0, 1), s = OVH.HSIDE, inv = !!op.pour; g.save(); if (inv) { g.translate(s * 10, -60); g.rotate(Math.PI * (s > 0 ? 0.85 : -0.85)); g.translate(0, 60); }
    const W = 40 * (1 - 0.22 * sq); const b = new Path2D(); b.moveTo(-W, -150); b.quadraticCurveTo(-W - 4, -40, -W * 0.96, 0); b.quadraticCurveTo(0, 14, W * 0.96, 0); b.quadraticCurveTo(W + 4, -40, W, -150); b.quadraticCurveTo(0, -164, -W, -150); b.closePath();
    cel(g, b, '#d42a22', 4, 12, 6, 6); if (sq > 0.05) for (const k of [-1, 1]) taper(g, [[k * W * 0.7, -110], [k * W * 0.5, -76], [k * W * 0.7, -40]], 2.4, rgba('#7a1010', 0.6), 0.2);
    taper(g, [[-W * 0.6, -130], [-W * 0.66, -24]], 7, 'rgba(255,220,210,0.55)', 0.4);
    g.save(); g.clip(b); label(g, 0, -70, W * 2, 34, [['KETCHUP', 19]], '#f4eee2', '#c8241e', 'sans-serif'); g.restore();
    const cp = new Path2D(); cp.moveTo(-26, -152); cp.lineTo(26, -152); cp.lineTo(20, -182); cp.quadraticCurveTo(0, -190, -20, -182); cp.closePath(); cel(g, cp, '#f4eee2', 3, 5, 3, 2); cel(g, polyPath([[-7, -184], [7, -184], [3, -204], [-3, -204]]), '#f4eee2', 2.4, 2, 2, 0);
    if (sq > 0.3) { const L = 30 + 90 * sq, st = [[0, -204], [s * 4, -204 - L * 0.5], [0, -204 - L]]; taper(g, st, 16, INK, 0.7); taper(g, st, 11, '#c8241e', 0.7); cel(g, ellP(0, -204 - L, 14, 11), '#c8241e', 2.4, 3, 3, 0); }
    g.restore(); },
  tomatobasket: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 8, 70); for (const sd of [-1, 1]) { const hdl = [[sd * 40, -30], [sd * 26, -74], [sd * 6, -78]]; taper(g, hdl, 9, INK, 0.9); taper(g, hdl, 5.5, '#a87a40', 0.9); }
    for (const [x, y, r] of [[-30, -34, 18], [0, -42, 20], [30, -32, 18], [-14, -22, 17], [16, -20, 17]]) tomatoAt(g, x, y, r);
    const bk = new Path2D(); bk.moveTo(-58, -26); bk.quadraticCurveTo(0, -14, 58, -26); bk.quadraticCurveTo(54, 40, 0, 50); bk.quadraticCurveTo(-54, 40, -58, -26); bk.closePath();
    cel(g, bk, '#c8a060', 3.4, 8, 5, 3, (h) => { h.strokeStyle = 'rgba(110,70,30,0.55)'; h.lineWidth = 2; for (let y = -20; y < 50; y += 9) { h.beginPath(); h.moveTo(-60, y); h.quadraticCurveTo(0, y + 10, 60, y); h.stroke(); } for (let x = -60; x < 60; x += 12) { h.beginPath(); h.moveTo(x, -30); h.lineTo(x * 0.8, 50); h.stroke(); } }); g.restore(); },
};
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
Object.assign(OVH.HOLD, KCH_HOLD);

// ---------- [KCH-cast] TOMMY: tomato mascot (recurring sidekick). drawTommy(g, o, op) on the same 600x1000 card as oddverra (ground y≈965, centre x=300).
// op.expr: 'smile' | 'happy' (^ ^) | 'proud' (smug lids, chin up, hands on hips) | 'shock' (round eyes, O mouth, sweat, hands up) | 'sad' (wilted leaves, droop, tear) |
//          'triumph' (both arms up, open grin, sparkles) | 'sly' (side-eye smirk) | 'love' (heart eyes)
// op.pose: 'stand' | 'cheer' | 'hips' | 'wave' | 'point' | 'run' (op.phase 0..1) | 'hold' (op.prop: any HOLD prop, e.g. 'pill', 'ketchup', 'pillbox')
// op.variant: 'pill' = dressed in a round pill-box costume with a lid hat (label op.label, default 'TOMATO PILLS'); op.flip faces screen-left; op.scale; op.blink; op.look; op.t; lightDir/keyCol/rimCol/ambient as oddverra
const tEye = (g, x, y, k, E, blink, look, s) => {
  if (blink >= 1 || E === 'happy') { taper(g, [[x - 11 * k, y + 4 * k], [x, y - 8 * k], [x + 11 * k, y + 4 * k]], 5 * k, INK, 0.35); return; }
  if (E === 'love') { const r = 13 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2.6 * k; g.strokeStyle = INK; g.stroke(hp); return; }
  const sh = E === 'shock', rx = (sh ? 12 : 9.5) * k, ry = (sh ? 16 : 13.5) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k;
  const P = ellP(lx, y, rx, ry); g.lineWidth = 3.6 * k; g.strokeStyle = 'rgba(255,240,236,0.95)'; g.stroke(P); g.fillStyle = INK; g.fill(P);
  g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 5 * k, (sh ? 3.6 : 3) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(lx + 3 * k, y + 5 * k, 1.4 * k, 0, TAU); g.fill(); g.fillStyle = 'rgba(120,100,200,0.45)'; g.beginPath(); g.ellipse(lx + k, y + ry * 0.7, rx * 0.8, ry * 0.35, 0, 0, TAU); g.fill(); g.restore();
  g.save(); g.translate(lx - 3 * k, y - 5 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.2 * k, 1.8 * k, 0, 0, TAU); g.lineWidth = 1.2 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  const lid = { proud: 0.45, sly: 0.5, sad: 0.25 }[E]; if (lid && blink < 0.5) { g.save(); g.clip(ellP(lx, y, rx + 3, ry + 3)); g.fillStyle = TOM; const yl = y - ry + 2 * ry * lid; g.beginPath(); g.moveTo(lx - rx - 4, E === 'sad' ? yl - s * 4 * k : yl); g.lineTo(lx + rx + 4, E === 'sad' ? yl + s * 4 * k : yl); g.lineTo(lx + rx + 4, y - ry - 6); g.lineTo(lx - rx - 4, y - ry - 6); g.fill(); g.restore(); taper(g, [[lx - rx - 2, yl], [lx + rx + 2, yl]], 3 * k, INK, 0.3); }
};
const tSweat = (g, x, y, k = 1) => { g.beginPath(); g.moveTo(x, y - 14 * k); g.quadraticCurveTo(x + 10 * k, y + 4 * k, x, y + 8 * k); g.quadraticCurveTo(x - 10 * k, y + 4 * k, x, y - 14 * k); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); };
export function drawTommy(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, sc = op.scale || 1, blink = op.blink || 0, look = op.look || 0, pill = op.variant === 'pill';
  const pose = op.pose || ({ proud: 'hips', shock: 'shock', triumph: 'cheer' }[E]) || (op.prop ? 'hold' : 'stand');
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const sad = E === 'sad', RUN = pose === 'run', ph = op.phase ?? ((t / 18) % 1), bob = RUN ? -Math.abs(Math.sin(ph * TAU)) * 14 : Math.sin(t * 0.18) * 3, sq = sad ? 0.9 : 1;
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale((flip ? -1 : 1) * sc, sc);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 130, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  const R = 122, cy = -236 + bob + (sad ? 14 : 0), lc = '#3e7a3a', limbW = 15;
  const limbDraw = (pts, w = limbW, col = LEAF) => cel(g, limb(pts, pts.map((_, i) => w * (1 - i * 0.06))), col, 2.6, 4, 3, 2);
  // legs + shoes
  for (const s of [-1, 1]) { const sw = RUN ? Math.sin((ph + (s > 0 ? 0.5 : 0)) * TAU) : 0, hip = [s * 42, cy + R * 0.78], foot = [s * 40 + sw * 26, -26 - Math.max(0, -sw) * 34 * (RUN ? 1 : 0)], knee = [(hip[0] + foot[0]) / 2 + sw * 10 + s * 4, (hip[1] + foot[1]) / 2 - (RUN ? 10 : 0)];
    limbDraw([hip, knee, foot], 16); const sp = smooth([[foot[0] - 20, foot[1] - 4], [foot[0] + 4, foot[1] - 16], [foot[0] + 32, foot[1] - 6], [foot[0] + 34, foot[1] + 12], [foot[0] - 22, foot[1] + 12]], 5); cel(g, sp, '#6a2a2e', 3, 6, 4, 2); g.save(); g.clip(sp); g.fillStyle = '#2a1626'; g.fillRect(foot[0] - 40, foot[1] + 6, 90, 10); g.restore(); taper(g, [[foot[0] - 2, foot[1] - 10], [foot[0] + 14, foot[1] - 8]], 3, 'rgba(255,255,255,0.5)', 0.3); }
  // arms: [shoulder, elbow, hand] per side; s=+1 screen right
  const SH = (s) => [s * R * 0.9, cy + 8], A = {};
  for (const s of [-1, 1]) { const S = SH(s); let E2, H;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 14 : Math.sin(t * 0.4 + s) * 6; E2 = [S[0] + s * 40, S[1] - 50]; H = [S[0] + s * 46 + w, S[1] - 112]; }
    else if (pose === 'shock') { E2 = [S[0] + s * 46, S[1] - 18]; H = [S[0] + s * 52, S[1] - 74]; }
    else if (pose === 'hips') { E2 = [S[0] + s * 46, S[1] + 34]; H = [S[0] + s * 6, S[1] + 70]; }
    else if (pose === 'point' && s > 0) { E2 = [S[0] + 50, S[1] - 14]; H = [S[0] + 104, S[1] - 40]; }
    else if (pose === 'hold' && s > 0) { E2 = [S[0] + 34, S[1] + 40]; H = [S[0] + 58, S[1] + 10]; }
    else if (RUN) { const sw = Math.sin((ph + (s > 0 ? 0 : 0.5)) * TAU); E2 = [S[0] + s * 26 + sw * 28, S[1] + 40]; H = [S[0] + s * 30 + sw * 52, S[1] + 64 - Math.abs(sw) * 20]; }
    else { E2 = [S[0] + s * 26, S[1] + 48 + (sad ? 12 : 0)]; H = [S[0] + s * 30, S[1] + 96 + (sad ? 14 : 0)]; }
    A[s] = [S, E2, H]; }
  const hand = (H, s, open) => { const hp = ellP(H[0], H[1], 15, 13); ellP(H[0] - s * 12, H[1] - 8, 7, 5, s * 0.7, hp); if (open) for (let i = 0; i < 3; i++) ellP(H[0] + (i - 1) * 9, H[1] - 14, 5, 8, (i - 1) * 0.3, hp); cel(g, hp, LEAF, 2.6, 4, 3, 2); };
  const behind = pose === 'hips'; if (behind) for (const s of [-1, 1]) { limbDraw(A[s]); }
  // body: the tomato
  const bp = []; for (let i = 0; i < 36; i++) { const a = TAU * i / 36, lobe = 1 + 0.018 * Math.cos(a * 5) - 0.05 * Math.max(0, -Math.sin(a)) ** 8 + 0.02 * Math.max(0, Math.sin(a)) ** 2; bp.push([Math.cos(a) * R * 1.08 * lobe / Math.sqrt(sq), cy + Math.sin(a) * R * 0.94 * lobe * sq + (sad ? Math.max(0, Math.sin(a)) * 10 : 0)]); }
  const body = smooth(bp, 4); cel(g, body, TOM, 4, 26, 20, 7);
  g.save(); g.clip(body); for (const k of [-0.55, 0.55]) taper(g, [[k * R * 0.45, cy - R * 0.85], [k * R * 0.92, cy], [k * R * 0.45, cy + R * 0.85]], 3.2, rgba(TOMD, 0.32), 0.2); g.restore();
  g.beginPath(); g.ellipse(-R * 0.5, cy - R * 0.5, R * 0.2, R * 0.12, -0.6, 0, TAU); g.fillStyle = 'rgba(255,236,226,0.8)'; g.fill(); g.beginPath(); g.arc(-R * 0.22, cy - R * 0.66, R * 0.05, 0, TAU); g.fill();
  if (pill) { const W = R * 1.12, top = cy + R * 0.5, bot = cy + R * 1.05; const cb = new Path2D(); cb.moveTo(-W, top); cb.lineTo(-W, bot - 14); cb.ellipse(0, bot - 14, W, 26, 0, Math.PI, 0, true); cb.lineTo(W, top); cb.ellipse(0, top, W, 22, 0, 0, Math.PI, false); cb.closePath();
    cel(g, cb, '#c89a5a', 3.6, 12, 6, 4, (h) => { h.strokeStyle = 'rgba(110,70,30,0.25)'; h.lineWidth = 1.4; for (let x = -W; x < W; x += 12) { h.beginPath(); h.moveTo(x, top); h.lineTo(x + 3, bot + 20); h.stroke(); } });
    g.save(); g.clip(cb); label(g, 0, (top + bot) / 2 + 10, W * 1.7, 50, op.label ? LABELS[op.label] || [op.label] : LABELS.pills, '#f2e6c0', '#7a1e1a'); g.restore(); }
  // face
  const fy = cy - R * 0.08, s0 = 1, k = 1.25, ex = 38;
  for (const s of [-1, 1]) tEye(g, s * ex + (op.look || 0) * 6, fy, k, E, blink, look, s);
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -12, -8], sad: [-10, -2, 8], triumph: [-2, -8, -2], sly: [8, 2, 0], love: [0, -6, 0] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = fy - 26, b = E === 'sly' && s > 0 ? [-6, -12, -8] : BR; taper(g, [[s * (ex - 12), by + b[0]], [s * ex, by + b[1]], [s * (ex + 13), by + b[2]]], 5, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 26), fy + 26, 16, 9, 0, 0, TAU); g.fillStyle = 'rgba(255,140,170,0.7)'; g.fill(); if (['happy', 'triumph', 'love', 'proud'].includes(E)) for (let i = 0; i < 3; i++) taper(g, [[s * (ex + 16 + i * 8), fy + 22], [s * (ex + 12 + i * 8), fy + 30]], 2, 'rgba(160,30,60,0.7)', 0.3); }
  const my = fy + 34, MC = '#5a1e30';
  const openM = (w, h, up) => { const p = new Path2D(); p.moveTo(-w, my - 4 * up); p.bezierCurveTo(-w * 0.4, my, w * 0.4, my, w, my - 4 * up); p.bezierCurveTo(w * 0.85, my + h, w * 0.4, my + h + 2, 0, my + h + 2); p.bezierCurveTo(-w * 0.4, my + h + 2, -w * 0.85, my + h, -w, my - 4 * up); p.closePath(); g.fillStyle = MC; g.fill(p); g.save(); g.clip(p); g.fillStyle = '#e07080'; g.beginPath(); g.ellipse(0, my + h + 2, w * 0.6, h * 0.45 + 2, 0, 0, TAU); g.fill(); g.restore(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(p); };
  if (E === 'shock') { const p = ellP(0, my + 10, 11, 15); g.fillStyle = MC; g.fill(p); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(p); tSweat(g, R * 0.78, cy - R * 0.55, 1.3); for (const a of [-2.3, -1.6, -0.9]) taper(g, [[Math.cos(a) * (R + 14), cy - R * 0.2 + Math.sin(a) * (R + 14)], [Math.cos(a) * (R + 36), cy - R * 0.2 + Math.sin(a) * (R + 36)]], 4, INK, 0.3); }
  else if (E === 'sad') { taper(g, arcPts(0, my + 18, 14, Math.PI * 1.2, Math.PI * 1.8, 8), 3.6, INK, 0.3); const ty = fy + 18 + ((t * 0.8) % 30); g.beginPath(); g.moveTo(-ex - 6, ty - 10); g.quadraticCurveTo(-ex + 2, ty + 3, -ex - 6, ty + 6); g.quadraticCurveTo(-ex - 14, ty + 3, -ex - 6, ty - 10); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = INK; g.stroke(); }
  else if (E === 'triumph' || E === 'happy' || E === 'love') openM(E === 'triumph' ? 20 : 16, E === 'triumph' ? 20 : 14, 1.2);
  else if (E === 'proud' || E === 'sly') { const p = new Path2D(); p.moveTo(-14, my + 2); p.quadraticCurveTo(4, my + 10, 18, my - 6); taper(g, [[-14, my + 2], [4, my + 8], [18, my - 6]], 3.6, INK, 0.3); taper(g, arcPts(22, my - 7, 5, -0.7, 1.3, 5), 1.8, INK, 0.3); }
  else taper(g, arcPts(0, my - 6, 16, Math.PI * 0.2, Math.PI * 0.8, 10), 3.6, INK, 0.3);
  if (E === 'triumph' || E === 'love') for (let i = 0; i < 4; i++) { const p = (t * 0.03 + i / 4) % 1, a = -Math.PI / 2 + (i - 1.5) * 0.7, d = R + 30 + p * 40, x = Math.cos(a) * d, y = cy - 20 + Math.sin(a) * d, sz = 12 * Math.sin(Math.PI * p); if (sz < 1) continue; g.beginPath(); for (let j = 0; j < 8; j++) { const rr = j % 2 ? sz * 0.3 : sz, an = j * Math.PI / 4; g.lineTo(x + rr * Math.cos(an), y + rr * Math.sin(an)); } g.closePath(); g.fillStyle = E === 'love' ? '#ff8aa8' : '#fff3b0'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = INK; g.stroke(); }
  // leaf crown (sepals) + stem; wilted when sad
  const ctop = cy - R * 0.92 * sq, wil = sad ? 1 : 0, sway = Math.sin(t * 0.2) * 0.06;
  if (pill) { const lp = new Path2D(), LW = R * 0.78, ly = ctop - 6; lp.moveTo(-LW, ly - 30); lp.lineTo(-LW, ly); lp.ellipse(0, ly, LW, 16, 0, Math.PI, 0, true); lp.lineTo(LW, ly - 30); lp.closePath(); cel(g, lp, '#b8864a', 3.2, 6, 4, 2); cel(g, ellP(0, ly - 30, LW, 16), '#d8ac6a', 2.8, 0, 0, 0); }
  else { const sep = new Path2D(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.62 + sway, L = 62, droop = wil * 0.9 * Math.sign(i - 2 || 0.01) + (i === 2 ? 0 : 0), aa = a + droop, tip = [Math.cos(aa) * L * 1.15, ctop + 10 + Math.sin(aa) * L * 0.55 + (i === 2 ? -18 : 0) * (1 - wil) + wil * 26], nx = -Math.sin(aa) * 12, ny = Math.cos(aa) * 6;
      polyPath(cr2([[nx, ctop + 8 + ny], [tip[0] * 0.55 + nx * 0.8, (ctop + 8 + tip[1]) / 2 + ny * 0.8], tip, [tip[0] * 0.55 - nx * 0.8, (ctop + 8 + tip[1]) / 2 - ny * 0.8], [-nx, ctop + 8 - ny]]), sep); }
    cel(g, sep, wil ? '#6a8a3a' : LEAF, 3, 5, 3, 2); cel(g, ellP(0, ctop + 6, 18, 10), wil ? '#5a7a32' : lc, 2.4, 3, 2, 0);
    const st = [[0, ctop + 2], [2, ctop - 22], [12 + wil * 14, ctop - 36 + wil * 16]]; taper(g, st, 14, INK, 0.7); taper(g, st, 9, wil ? '#5a7a32' : lc, 0.7); }
  // near arms over the body
  if (!behind) for (const s of [-1, 1]) limbDraw(A[s]);
  for (const s of [-1, 1]) { const H = A[s][2]; if (op.prop && OVH.HOLD[op.prop] && s > 0) { g.save(); g.translate(H[0] + 4, H[1] - 6); g.scale(0.8, 0.8); OVH.HOLD[op.prop](g, op); g.restore(); } hand(H, s, pose === 'cheer' || pose === 'shock' || (pose === 'wave' && s > 0)); }
  g.restore(); }
const cr2 = (pts) => { const out = []; for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 6; k++) { const t = k / 6, a = pts[i], b = pts[i + 1]; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); } out.push(pts[pts.length - 1]); return smoothPts(out); };
const smoothPts = (p) => p.map((q, i) => i === 0 || i === p.length - 1 ? q : [(p[i - 1][0] + 2 * q[0] + p[i + 1][0]) / 4, (p[i - 1][1] + 2 * q[1] + p[i + 1][1]) / 4]);

// [KCH-cast] cast test (?kchcast=N, with any set view flag, e.g. ?hbview=8&kchcast=0): actors laid out in front of the camera on ground height gy.
const KT = [
  { d: 7.0, a: [['BENNETT', { expr: 'excited', prop: 'bigtomato', raise: 1 }], ['MILES', { expr: 'smug', prop: 'moneybag', count: 1, reach: 0.4 }], ['PHELPS', { expr: 'angry', prop: 'pillbottle', label: 'phelps', reach: 0.6 }], ['STUDENT1', { expr: 'surprised', prop: 'notepad', reach: 0.5 }], ['STUDENT2', { expr: 'smile' }], ['TOMMY', { expr: 'happy' }]] },
  { d: 7.0, a: [['TOWNWOMAN', { expr: 'sly', cross: 1, look: 1 }], ['FARMER', { expr: 'worried', handsUp: 1, shake: 1 }], ['TOWNKID', { expr: 'excited', cheer: 1 }], ['CHEMIST', { expr: 'shock', prop: 'magnifier', reach: 0.8, peek: 1 }], ['MODERN_KID', { expr: 'happy', prop: 'ketchup', squeeze: 0.8, reach: 0.7 }], ['TOMMY', { expr: 'shock' }]] },
  { d: 3.6, a: [['MILES', { expr: 'mean', prop: 'pillbox', label: 'miles', reach: 0.7, view: '34R' }], ['PHELPS', { expr: 'angry', prop: 'poster', open: 1, label: 'phelps', reach: 0.8, view: '34L' }]] },
  { d: 3.4, a: [['BENNETT', { expr: 'excited', prop: 'bigtomato', raise: 1, view: '34R' }], ['TOMMY', { expr: 'triumph' }]] },
  { d: 4.0, a: [['TOMMY', { expr: 'proud' }], ['TOMMY', { expr: 'sad' }], ['TOMMY', { expr: 'happy', variant: 'pill', label: 'miles' }], ['TOMMY', { expr: 'sly', pose: 'hold', prop: 'pill' }]] },
  { d: 3.4, a: [['CHEMIST', { expr: 'shock', prop: 'magnifier', reach: 0.9, peek: 1, view: '34R' }], ['MODERN_KID', { expr: 'love', prop: 'ketchup', squeeze: 0.9, reach: 0.8, view: '34L' }]] },
  { d: 3.4, a: [['MILES', { expr: 'smug', prop: 'moneybag', count: 1, reach: 0.4, view: '34R' }], ['TOWNWOMAN', { expr: 'sly', cross: 1, look: -1, view: '34L' }]] },
  { d: 5.0, a: [['FARMER', { expr: 'pained', tummy: 1, mode: 'run', phase: 0.3, view: 'sideR' }], ['TOWNWOMAN', { expr: 'love', prop: 'ketchup', reach: 0.6 }], ['FARMER', { expr: 'laugh', cheer: 1 }], ['TOWNKID', { expr: 'happy', prop: 'tomato', reach: 0.9 }]] },
];
export function kchTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
