// [GC-cast] "In October 1582, ten days vanished from the calendar": outfit table (merged into ODD by main.js), props (into oddverra's
// HOLD), PAGEY (a little living tear-off desk calendar, the sidekick and the motif; drawPagey on the 600x1000 card) and a cast lineup
// (?gccast=N). Everyone is our own stylization; no real portraits (the pope is a generic 1582 pontiff in white and red).
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, ellP, limb, arcPts, mixc, polyPath } = OVK;
const TAU = Math.PI * 2;

export const GC_ODD = {
  GC_SLEEPER: { shirt: '#f2ece0', pants: '#f2ece0', pj: true, hat: 'beanie', hatCol: '#c84a4a', hair: 'short', hairCol: '#5a3a22', brow: '#5a3a22', moustache: '#5a3a22',
    build: 'stout', head: 'egg', skin: '#ecb890', shoes: '#7a4a2a', noButtons: true },                                       // a Roman in his nightshirt, 1582
  GC_POPE: { dress: true, shirt: '#f6f2ea', pants: '#f6f2ea', shawl: '#b0202a', hat: 'surgcap', hatCol: '#f6f2ea', beard: 'full', beardCol: '#e8e4e0',
    hair: 'short', hairCol: '#e8e4e0', brow: '#d8d4d0', build: 'old', head: 'egg', skin: '#f0c4a0', shoes: '#b0202a', noButtons: true }, // a generic pontiff
  GC_ASTRO: { dress: true, shirt: '#2a2630', pants: '#2a2630', collar: '#f6f2ea', glasses: true, hair: 'bald', hairCol: '#9a9090', brow: '#6a6060', beard: 'chops', beardCol: '#9a9090',
    build: 'thin', head: 'tall', skin: '#e8b890', shoes: '#16141a', noButtons: true },                                       // a Jesuit astronomer (our own)
  GC_CLERIC: { dress: true, shirt: '#6a2a5a', pants: '#6a2a5a', collar: '#f6f2ea', hat: 'surgcap', hatCol: '#6a2a5a', hair: 'short', hairCol: '#3a2a22', brow: '#3a2a22',
    build: 'stout', head: 'round', skin: '#d8a07a', shoes: '#16141a', noButtons: true },
  GC_LDN1: { frock: true, waistcoat: '#c8a050', shirt: '#2a4a6a', pants: '#3a3030', collar: '#f2ece0', cuff: '#f2ece0', hat: 'tricorn', hatCol: '#26222c', noChain: true,
    hair: 'side', hairCol: '#e8e4dc', brow: '#4a3a2a', build: 'stout', head: 'wide', skin: '#f0c4a0', shoes: '#16141a' },    // a grumbling Londoner, 1752
  GC_LDN2: { lashes: true, dress: true, shirt: '#7a3a5a', pants: '#7a3a5a', shawl: '#f2ece0', hair: 'bun', hairCol: '#8a5a2a', head: 'egg', skin: '#f6d0b0', shoes: '#2a2022', earring: true, noButtons: true },
  GC_LDN3: { frock: true, waistcoat: '#6a7a4a', shirt: '#6a3a2a', pants: '#4a3a30', collar: '#f2ece0', hat: 'tricorn', hatCol: '#3a2e26', noChain: true,
    hair: 'short', hairCol: '#2a1e18', brow: '#2a1e18', build: 'thin', head: 'tall', skin: '#c98a5e', shoes: '#16141a' },
  GC_LDNKID: { shirt: '#c8a050', pants: '#5a4a3a', collar: '#f2ece0', hair: 'spiky', hairCol: '#c87a3a', brow: '#8a4a1a', build: 'kid', head: 'round', skin: '#f0c098', shoes: '#3a2a22', noButtons: true },
  GC_SAILOR: { shirt: '#24304e', pants: '#24304e', collar: '#f2f2f6', hat: 'cap', hatCol: '#1e2236', plainCap: true, hair: 'short', hairCol: '#c8a060', brow: '#8a6a3a',
    build: 'adult', head: 'round', skin: '#f0c4a0', shoes: '#16141a', noButtons: true },                                     // Petrograd, 1917
  GC_WORKER: { coat: true, shirt: '#5a4a3a', pants: '#3a3438', hat: 'cap', hatCol: '#3a3438', plainCap: true, hair: 'short', hairCol: '#3a2418', brow: '#3a2418', moustache: '#3a2418',
    build: 'stout', head: 'wide', skin: '#e0a880', shoes: '#16141a' },
  GC_SOLDIER: { coat: true, shirt: '#7a7458', pants: '#6a6448', hat: 'cap', hatCol: '#6a6448', plainCap: true, hair: 'short', hairCol: '#8a6a4a', brow: '#6a4a2a',
    build: 'thin', head: 'tall', skin: '#f0c4a0', shoes: '#2a2420', boots: 'knee' },
  GC_RWOMAN: { lashes: true, dress: true, shirt: '#3a4a5a', pants: '#3a4a5a', shawl: '#c84a4a', hair: 'bun', hairCol: '#6a3a22', head: 'round', skin: '#f6d0b0', shoes: '#2a2022', noButtons: true },
};
const GC_OPS = [];
export const gcOpts = (op) => { const r = {}; for (const k of GC_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props
const GC_HOLD = {
  redflag: (g, op = {}) => { const s = OVH.HSIDE, t = op.t || 0, a = [0, 40], b = [s * 8, -260]; taper(g, [a, b], 10, INK, 0.9); taper(g, [a, b], 6, '#8a5a34', 0.9);
    const wv = (u) => Math.sin(t * 0.3 - u * 4) * 12 * u, pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([b[0] + s * u * 150, b[1] + 4 + wv(u)]); } for (let i = 8; i >= 0; i--) { const u = i / 8; pts.push([b[0] + s * u * 150, b[1] + 96 + wv(u) * 0.8]); }
    cel(g, polyPath(pts), '#c8282e', 3, 5, 3, 2); },
  candle: (g, op = {}) => { const s = OVH.HSIDE, lit = op.lit ?? 1, t = op.t || 0; g.save(); g.translate(s * 8, -50);
    cel(g, ellP(0, 40, 46, 14), '#c89a3a', 2.6, 3, 2, 0); cel(g, polyPath([[-13, 38], [13, 38], [12, -50], [-12, -50]]), '#f6efd8', 2.6, 3, 2, 1);
    if (lit > 0.02) { const fl = 1 + 0.12 * Math.sin(t * 0.9); g.globalAlpha = lit; const gl = g.createRadialGradient(0, -78, 0, 0, -78, 90); gl.addColorStop(0, 'rgba(255,230,160,0.7)'); gl.addColorStop(1, 'rgba(255,180,80,0)'); g.fillStyle = gl; g.fillRect(-90, -170, 180, 180);
      const P = new Path2D(); P.moveTo(0, -100 * fl); P.quadraticCurveTo(14, -66, 0, -54); P.quadraticCurveTo(-14, -66, 0, -100 * fl); g.fillStyle = '#fff2b0'; g.fill(P); g.globalAlpha = 1; }
    else { g.strokeStyle = 'rgba(200,200,220,0.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -56); g.bezierCurveTo(12, -80, -12, -100, 6, -130 - 10 * Math.sin(t * 0.2)); g.stroke(); }
    g.restore(); },
};
Object.assign(OVH.HOLD, GC_HOLD);

// ---------- PAGEY: a little tear-off desk calendar with a face. drawPagey(g, o, op) on the 600x1000 card (ground y=965, centre x=300)
// op.day (big number string), op.mon (header, e.g. 'OCTOBER'), op.wk (weekday line), op.year; op.expr: smile | happy | shock | sad | sly | proud | love | dazed
// op.pose: stand | wave | cheer | point | shrug | shock | hips ; op.tear 0..1 (top page peels off and flies up), op.tearDay (number on the flying page)
// op.red (number colour), op.flip
export function drawPagey(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, blink = op.blink || 0, look = op.look || 0, flip = !!op.flip, pose = op.pose || 'stand';
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const hop = pose === 'cheer' ? Math.abs(Math.sin(t * 0.35)) * 26 : 0, bob = Math.sin(t * 0.2) * 4 - hop, tilt = E === 'sad' ? 0.06 : E === 'shock' ? -0.07 : E === 'dazed' ? 0.08 * Math.sin(t * 0.3) : Math.sin(t * 0.13) * 0.03;
  g.save(); g.translate(300, 965); g.scale(flip ? -1 : 1, 1);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 150, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  for (const s of [-1, 1]) { const fx = s * 56; cel(g, limb([[fx, -150 + bob], [fx + s * 6, -26]], [14, 12]), '#4a3440', 2.6, 3, 2, 1); cel(g, ellP(fx + s * 10, -16, 34, 15), '#7a2a2a', 2.8, 5, 3, 2); }
  g.translate(0, bob); g.rotate(tilt);
  const W = 290, top = -660, bot = -160, HD = 110, FLIP = (s) => (flip ? -1 : 1) * s;
  // wooden back board + brass rings
  const back = new Path2D(); back.roundRect(-W / 2 - 16, top - 26, W + 32, bot - top + 40, 22); cel(g, back, '#7a4a2a', 4.2, 10, 6, 4);
  // page stack edges at the bottom (thickness)
  for (let i = 3; i >= 1; i--) { const p = new Path2D(); p.roundRect(-W / 2 + 2, bot - 30 + i * 7, W - 4, 24, 8); cel(g, p, mixc('#f2ead6', '#c8b898', i / 4), 2.4, 0, 0, 0); }
  // the page
  const page = new Path2D(); page.roundRect(-W / 2, top, W, bot - top, 16); cel(g, page, '#eee4cc', 4.4, 14, 8, 5);
  g.save(); g.clip(page);
  const hdr = new Path2D(); hdr.rect(-W / 2, top, W, HD); g.fillStyle = '#c8323a'; g.fill(hdr); g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(-W / 2, top + 6, W, 10);
  const say = (s, x, y, sz, col, maxW) => { g.save(); g.scale(flip ? -1 : 1, 1); g.font = `bold ${sz}px "Luckiest Guy", "DejaVu Sans", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText(s).width; const k = Math.min(1, maxW / Math.max(1, w)); g.translate(FLIP(x), y); g.scale(k, 1); g.fillStyle = col; g.fillText(s, 0, 0); g.restore(); };
  say(op.mon || 'OCTOBER', 0, top + HD * 0.58, 58, '#fff4e0', W * 0.82);
  if (op.year) say(op.year, 0, top + HD + 34, 34, '#7a5a5a', W * 0.6);
  say(op.day || '4', 0, bot - 116, 150, op.red ? '#c8323a' : '#2b1d4a', W * 0.84);
  if (op.wk) say(op.wk, 0, bot - 28, 36, '#6a5a6a', W * 0.8);
  g.fillStyle = 'rgba(58,42,122,0.16)'; g.fillRect(W * 0.2, top, W, bot - top);
  g.restore(); g.lineWidth = 4.4; g.strokeStyle = INK; g.stroke(page);
  for (const x of [-W * 0.3, 0, W * 0.3]) { taper(g, arcPts(x, top - 4, 16, Math.PI * 1.0, Math.PI * 2.0, 10, 30), 10, INK, 0.9); taper(g, arcPts(x, top - 4, 16, Math.PI * 1.0, Math.PI * 2.0, 10, 30), 5, '#d8b048', 0.9); }
  // face between the header and the number
  const ey = top + HD + 92, ex = 52, k = 1.15;
  for (const s of [-1, 1]) { const x = s * ex + look * 6;
    if (blink >= 1 || E === 'happy' || E === 'proud') taper(g, [[x - 12 * k, ey + 5 * k], [x, ey - 8 * k], [x + 12 * k, ey + 5 * k]], 5.5 * k, INK, 0.35);
    else if (E === 'dazed') { g.save(); g.strokeStyle = INK; g.lineWidth = 3.2; g.beginPath(); for (let i = 0; i < 40; i++) { const a = i * 0.45 + t * 0.4 * s, r = i * 0.38; i ? g.lineTo(x + Math.cos(a) * r, ey + Math.sin(a) * r) : g.moveTo(x, ey); } g.stroke(); g.restore(); }
    else if (E === 'love') { const r = 14 * k, hp = new Path2D(); hp.moveTo(x, ey + r); hp.bezierCurveTo(x - r * 1.5, ey - r * 0.1, x - r * 0.9, ey - r * 1.3, x, ey - r * 0.45); hp.bezierCurveTo(x + r * 0.9, ey - r * 1.3, x + r * 1.5, ey - r * 0.1, x, ey + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(hp); }
    else { const sh = E === 'shock', rx = (sh ? 12 : 9.5) * k, ry = (sh ? 17 : 14) * k * (blink > 0 ? 0.45 : 1), P = ellP(x, ey, rx, ry); g.fillStyle = INK; g.fill(P); g.save(); g.clip(P); g.beginPath(); g.arc(x - 3 * k, ey - 6 * k, 3.4 * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
      g.save(); g.translate(x - 3 * k, ey - 6 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.8 * k, 2 * k, 0, 0, TAU); g.lineWidth = 1.2 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore(); } }
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -14, -8], sad: [-10, -2, 8], sly: [8, 2, 0], love: [0, -6, 0], dazed: [0, -8, 0] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = ey - 36; taper(g, [[s * (ex - 16), by + BR[0]], [s * ex, by + BR[1]], [s * (ex + 16), by + BR[2]]], 6, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 28), ey + 26, 16, 8, 0, 0, TAU); g.fillStyle = 'rgba(255,110,140,0.7)'; g.fill(); }
  const my = ey + 40, MC = '#7a2238';
  if (E === 'shock' || E === 'dazed') { const p = ellP(0, my + 2, 10, 13); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad') taper(g, arcPts(0, my + 16, 15, Math.PI * 1.2, Math.PI * 1.8, 8), 4.4, INK, 0.3);
  else if (E === 'happy' || E === 'love') { const p = new Path2D(); p.moveTo(-20, my - 4); p.bezierCurveTo(-8, my, 8, my, 20, my - 4); p.bezierCurveTo(16, my + 18, -16, my + 18, -20, my - 4); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'proud' || E === 'sly') taper(g, [[-15, my], [4, my + 7], [19, my - 7]], 4.4, INK, 0.3);
  else taper(g, arcPts(0, my - 10, 18, Math.PI * 0.2, Math.PI * 0.8, 10), 4.4, INK, 0.3);
  if (E === 'shock' || E === 'sad') { g.beginPath(); const sx = W / 2 - 34, sy = top + HD + 40; g.moveTo(sx, sy); g.quadraticCurveTo(sx + 14, sy + 24, sx, sy + 30); g.quadraticCurveTo(sx - 14, sy + 24, sx, sy); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); }
  // a page tearing off: hinge at the top rings, swings up and away, then flies (op.tear 0..1)
  const tr = op.tear || 0;
  if (tr > 0.001 && tr < 0.999) { g.save(); const a = Math.min(1, tr * 1.6) * 2.4, fly = Math.max(0, tr - 0.45) / 0.55; g.translate(fly * 240, top - fly * 380); g.rotate(-a * 0.5 + fly * 1.2); g.scale(1, Math.cos(Math.min(a, 1.4)) * 0.9 + 0.1);
    const pp = new Path2D(); pp.roundRect(-W / 2, 0, W, bot - top, 16); cel(g, pp, '#f8f2e2', 4, 8, 5, 3); g.save(); g.clip(pp); g.fillStyle = '#c8323a'; g.fillRect(-W / 2, 0, W, HD); g.restore();
    g.save(); g.font = 'bold 150px "Luckiest Guy", "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#2b1d4a'; g.fillText(op.tearDay || '', 0, bot - top - 116); g.restore(); g.restore(); }
  // arms from the board sides (wire arms, white mitten hands)
  for (const s of [-1, 1]) { const S = [s * (W / 2 + 14), top + 300]; let E3, Hd;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 16 : Math.sin(t * 0.4 + s) * 6; E3 = [S[0] + s * 50, S[1] - 46]; Hd = [S[0] + s * 56 + w, S[1] - 110]; }
    else if (pose === 'shock') { E3 = [S[0] + s * 54, S[1] - 6]; Hd = [S[0] + s * 60, S[1] - 70]; }
    else if (pose === 'hips') { E3 = [S[0] + s * 52, S[1] + 40]; Hd = [S[0] + s * 6, S[1] + 84]; }
    else if (pose === 'shrug') { E3 = [S[0] + s * 52, S[1] + 26]; Hd = [S[0] + s * 96, S[1] - 14]; }
    else if (pose === 'point' && s > 0) { E3 = [S[0] + 60, S[1] - 10]; Hd = [S[0] + 118, S[1] - 40]; }
    else { E3 = [S[0] + s * 28, S[1] + 60]; Hd = [S[0] + s * 32, S[1] + 116]; }
    cel(g, limb([S, E3, Hd], [12, 11, 10]), '#4a3440', 2.6, 4, 3, 2); cel(g, ellP(Hd[0], Hd[1], 19, 17), '#f2f2f6', 2.6, 4, 3, 2); }
  g.restore(); }

// ---------- lineup (?gccast=N)
const KT = [
  { d: 7.0, a: [['GC_SLEEPER', { expr: 'dreamy', prop: 'candle', lit: 1 }], ['GC_POPE', { expr: 'determined', prop: 'scroll' }], ['GC_ASTRO', { expr: 'thoughtful', point: 1 }], ['GC_CLERIC', { expr: 'surprised' }], ['PAGEY', { expr: 'smile', day: '4', wk: 'THURSDAY' }], ['PAGEY', { expr: 'shock', day: '15', wk: 'FRIDAY', pose: 'shock', tear: 0.6, tearDay: '9' }]] },
  { d: 7.0, a: [['GC_LDN1', { expr: 'angry' }], ['GC_LDN2', { expr: 'worried' }], ['GC_LDN3', { expr: 'smug', prop: 'pennant' }], ['GC_LDNKID', { expr: 'excited' }], ['PAGEY', { expr: 'sly', mon: 'SEPTEMBER', day: '14', pose: 'hips' }], ['PAGEY', { expr: 'dazed', pose: 'shrug' }]] },
  { d: 7.0, a: [['GC_SAILOR', { expr: 'determined', prop: 'redflag' }], ['GC_WORKER', { expr: 'angry', raise: 1 }], ['GC_SOLDIER', { expr: 'excited' }], ['GC_RWOMAN', { expr: 'shock' }], ['PAGEY', { expr: 'happy', mon: 'NOVEMBER', day: '7', pose: 'cheer', red: 1 }], ['GC_SLEEPER', { expr: 'shock', mode: 'sit' }]] },
];
export function gcTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'PAGEY' ? 0.6 : (o === 'GC_LDNKID') ? 0.8 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
