// [MT-cast] "The first computer bug was a real moth" (Harvard Mark II, 9 Sept 1947): outfit table (merged into ODD by main.js), props
// (into oddverra's HOLD), MOTHY (the moth itself as a little Oddverra character, the sidekick; drawMothy on the 600x1000 card) and a
// cast lineup (?mtcast=N). Grace Hopper is our own stylization (no portrait likeness): a 1947 civilian research fellow in a navy
// blouse and skirt, dark curly hair with grey, pearl earrings. The operators, Edison (1870s, our own stylization) and the museum
// visitors are generic designs.
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, ellP, limb, arcPts, mixc, polyPath, line } = OVK;
const TAU = Math.PI * 2;

export const MT_ODD = {
  MT_HOPPER: { lashes: true, dress: true, shirt: '#2e3a5e', pants: '#2e3a5e', collar: '#f4eee0', cuff: '#f4eee0', button: '#e8dcc0', hair: 'curly', hairCol: '#5a4a4e', brow: '#4a3a3e',
    head: 'egg', skin: '#f2c8a6', shoes: '#1e1a22', earring: '#f4f0e8' },
  MT_OP1: { shirt: '#f2efe6', rolled: true, neck: 'tie', neckCol: '#8a2a2a', pants: '#4a4a56', glasses: true, hair: 'side', hairCol: '#3a2a20', brow: '#3a2a20', build: 'thin', head: 'tall', skin: '#f0c4a0', shoes: '#2a2020', pocket: '#e8e4dc', pencil: true },
  MT_OP2: { shirt: '#c8d4e0', rolled: true, vest: '#4a4a5a', neck: 'tie', neckCol: '#2a3a6a', pants: '#3a3a44', hair: 'short', hairCol: '#8a5a2a', brow: '#7a4a22', moustache: '#7a4a22', build: 'stout', head: 'wide', skin: '#e0a882', shoes: '#2a2020' },
  MT_OP3: { shirt: '#e8dcc0', rolled: true, suspenders: '#5a3a2a', neck: 'bow', neckCol: '#2a5a4a', pants: '#5a4a3a', hair: 'curly', hairCol: '#1e1612', brow: '#1e1612', build: 'adult', head: 'round', skin: '#a8724e', shoes: '#2a2020' },
  MT_EDISON: { shirt: '#f0ead8', waistcoat: '#3a3a44', pants: '#3a3a44', collar: '#f6f2ea', neck: 'bow', neckCol: '#1e1e26', rolled: true, hair: 'side', hairCol: '#2a221e', brow: '#2a221e', build: 'adult', head: 'round', skin: '#f0c4a0', shoes: '#1a1618' },
  MT_VIS1: { shirt: '#e86a4a', pants: '#3a4a6a', hair: 'short', hairCol: '#2a1a12', brow: '#2a1a12', build: 'adult', head: 'round', skin: '#c98a5e', shoes: '#f0f0f6', noButtons: true, glasses: true },
  MT_VIS2: { lashes: true, shirt: '#5ab0a0', pants: '#4a4a5a', hair: 'long', hairCol: '#c89040', head: 'egg', skin: '#f6d0b0', shoes: '#f0f0f6', earring: true, noButtons: true },
  MT_VISKID: { shirt: '#f2c040', pants: '#3a5a9a', hair: 'spiky', hairCol: '#3a2418', brow: '#3a2418', build: 'kid', head: 'round', skin: '#8a5a3e', shoes: '#e8e8f0', noButtons: true },
};
const MT_OPS = [];
export const mtOpts = (op) => { const r = {}; for (const k of MT_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props (hand-local: hand at 0,0, up = -y)
const MT_HOLD = {
  // flashlight: chrome tube, lit lens + a soft beam fan
  flashlight: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 10, -30); g.rotate(s * 1.1);
    const gr = g.createLinearGradient(0, -60, 0, -330); gr.addColorStop(0, 'rgba(255,244,200,0.55)'); gr.addColorStop(1, 'rgba(255,244,200,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(-14, -60); g.lineTo(-90, -330); g.lineTo(90, -330); g.lineTo(14, -60); g.closePath(); g.fill();
    cel(g, polyPath([[-11, 30], [11, 30], [12, -40], [-12, -40]]), '#9aa0ae', 2.6, 3, 2, 0); cel(g, polyPath([[-17, -40], [17, -40], [15, -62], [-15, -62]]), '#b8bcc8', 2.6, 3, 2, 0); cel(g, ellP(0, -62, 15, 5), '#fff6d0', 2, 0, 0, 0); g.restore(); },
  // tweezers holding a tiny moth
  tweezers: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 14, -20); g.rotate(s * 0.5); for (const k of [-1, 1]) line(g, [[k * 5, 20], [k * 2, -80]], 7, INK), line(g, [[k * 5, 20], [k * 2, -80]], 4, '#c8ccd6');
    g.translate(0, -96); for (const k of [-1, 1]) cel(g, polyPath([[0, 0], [k * 34, -18], [k * 30, 10]]), '#a89078', 2, 2, 1, 0); cel(g, ellP(0, 0, 6, 16), '#8a7462', 2, 0, 0, 0); g.restore(); },
};
Object.assign(OVH.HOLD, MT_HOLD);

// ---------- MOTHY: the moth, an Oddverra critter. drawMothy(g, o, op) on the 600x1000 card (ground y=965, centre x=300).
// op: pose 'fly' | 'stuck' | 'sit' | 'cheer'; expr smile | happy | shock | dazed | smug | wink | sad | love | surprised; flap speed; flip
export function drawMothy(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, blink = op.blink || 0, pose = op.pose || 'fly', flip = !!op.flip;
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const fly = pose === 'fly' || pose === 'cheer', ph = t * (op.flap || 1.1), flap = fly ? Math.cos(ph) : pose === 'stuck' ? 0.15 * Math.sin(t * 2.3) * (op.wiggle || 0) : 0.0;
  const bob = fly ? Math.sin(ph + 1.2) * 18 : 0, cy = fly ? -560 : pose === 'stuck' ? -520 : -330;
  g.save(); g.translate(300, 965); g.scale(flip ? -1 : 1, 1);
  if (!fly && pose !== 'stuck') { g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 150, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore(); }
  g.translate(0, cy + bob); g.rotate(pose === 'stuck' ? -0.35 : fly ? 0.06 * Math.sin(ph * 0.5) : 0);
  const W1 = '#c8b298', W2 = '#a8907a', BODY = '#9a8270', FUZZ = '#d8c8b0';
  // wings: folded (sit) = swept back delta; open (fly/stuck) = four spread wings, flap squashes horizontally
  const wingK = pose === 'sit' ? 0.55 : 0.55 + 0.45 * Math.abs(flap), lift = fly ? flap * 40 : 0;
  for (const s of [-1, 1]) {
    for (const up of [false, true]) { g.save(); g.scale(s * wingK, 1);
      const p = new Path2D(); if (pose === 'sit') { if (up) { p.moveTo(10, -60); p.bezierCurveTo(120, -40, 230, 120, 200, 230); p.bezierCurveTo(130, 250, 40, 160, 10, 60); } else { p.moveTo(10, 20); p.bezierCurveTo(100, 60, 160, 200, 120, 250); p.bezierCurveTo(70, 260, 20, 150, 10, 90); } }
      else if (up) { p.moveTo(14, -40); p.bezierCurveTo(120, -230 - lift, 300, -210 - lift, 280, -80 - lift * 0.5); p.bezierCurveTo(260, -10, 120, 10, 14, 10); }
      else { p.moveTo(14, 20); p.bezierCurveTo(150, 30, 240, 140, 190, 210); p.bezierCurveTo(120, 250, 40, 150, 12, 80); }
      p.closePath(); const gr = g.createLinearGradient(0, -200, 260, 160); gr.addColorStop(0, up ? W1 : W2); gr.addColorStop(1, mixc(up ? W1 : W2, '#5a4a6a', 0.35)); cel(g, p, up ? W1 : W2, 5, 8, 5, 3); g.save(); g.clip(p); g.globalAlpha = 0.9; g.fillStyle = gr; g.fill(p);
      g.fillStyle = 'rgba(80,58,46,0.4)'; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(80 + i * 46, up ? -90 + i * 18 : 90 + i * 20, 16, 9, 0.3, 0, TAU); g.fill(); }
      if (up) { g.strokeStyle = 'rgba(80,58,46,0.5)'; g.lineWidth = 4; g.beginPath(); g.moveTo(40, -20); g.quadraticCurveTo(150, -120, 250, -100); g.stroke(); g.fillStyle = 'rgba(255,240,220,0.5)'; g.beginPath(); g.ellipse(190, -130, 26, 18, 0.2, 0, TAU); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); }
      g.fillStyle = 'rgba(58,42,122,0.22)'; g.fillRect(0, 40, 320, 300); g.restore(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(p); g.restore(); } }
  // legs (dangle when flying, stand when sitting)
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const y0 = 20 + i * 40, sw = fly ? Math.sin(t * 0.3 + i) * 6 : 0;
    const pts = pose === 'sit' ? [[s * 20, y0], [s * (60 + i * 6), y0 + 40], [s * (50 + i * 14), 330 - cy - 365 + 30]] : [[s * 20, y0], [s * (50 + sw), y0 + 40], [s * (42 + i * 8), y0 + 90 + sw]];
    taper(g, pts, 7, INK, 0.6); taper(g, pts, 4, '#5a4a40', 0.6); }
  // body: fuzzy thorax + striped abdomen
  const ab = new Path2D(); ab.ellipse(0, 90, 46, 120, 0, 0, TAU); cel(g, ab, BODY, 5, 10, 6, 4); g.save(); g.clip(ab); for (let i = 0; i < 4; i++) { g.strokeStyle = 'rgba(60,40,40,0.45)'; g.lineWidth = 6; g.beginPath(); g.moveTo(-50, 60 + i * 36); g.quadraticCurveTo(0, 76 + i * 36, 50, 60 + i * 36); g.stroke(); } g.restore();
  const th = new Path2D(); for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU, r = 66 + (i % 2 ? 7 : -3); i ? th.lineTo(Math.cos(a) * r, -10 + Math.sin(a) * r * 0.82) : th.moveTo(Math.cos(a) * r, -10 + Math.sin(a) * r * 0.82); } th.closePath(); cel(g, th, FUZZ, 4.4, 8, 5, 3);
  // head + feathery antennae
  const hy = -100; for (const s of [-1, 1]) { const a = [[s * 22, hy - 60], [s * 60, hy - 150], [s * (110 + 10 * Math.sin(t * 0.2 + s)), hy - 200]]; taper(g, a, 7, INK, 0.5); for (let i = 1; i < 8; i++) { const k = i / 8, x = a[0][0] + (a[2][0] - a[0][0]) * k, y = a[0][1] + (a[2][1] - a[0][1]) * k - Math.sin(k * Math.PI) * 30; taper(g, [[x, y], [x + s * 22, y + 10]], 4, INK, 0.5); taper(g, [[x, y], [x - s * 6, y - 20]], 4, INK, 0.5); } }
  const hd = new Path2D(); for (let i = 0; i <= 32; i++) { const a = i / 32 * TAU, r = 84 + (i % 2 ? 6 : -2); i ? hd.lineTo(Math.cos(a) * r * 1.08, hy + Math.sin(a) * r * 0.9) : hd.moveTo(Math.cos(a) * r * 1.08, hy + Math.sin(a) * r * 0.9); } hd.closePath(); cel(g, hd, FUZZ, 5, 10, 6, 4);
  // face
  const ex = 34, ey = hy - 8, look = op.look || 0;
  for (const s of [-1, 1]) { const x = s * ex + look * 6;
    if (E === 'dazed') { g.beginPath(); for (let a = 0; a < 13; a += 0.25) g.lineTo(x + Math.cos(a + t * 0.4 * s) * a * 1.25, ey + Math.sin(a + t * 0.4 * s) * a * 1.25); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); }
    else if (blink >= 1 || E === 'happy' || (E === 'wink' && s > 0)) taper(g, [[x - 14, ey + 6], [x, ey - 9], [x + 14, ey + 6]], 6, INK, 0.35);
    else if (E === 'love') { const r = 15, hp = new Path2D(); hp.moveTo(x, ey + r); hp.bezierCurveTo(x - r * 1.5, ey - r * 0.1, x - r * 0.9, ey - r * 1.3, x, ey - r * 0.45); hp.bezierCurveTo(x + r * 0.9, ey - r * 1.3, x + r * 1.5, ey - r * 0.1, x, ey + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(hp); }
    else { const sh = E === 'shock' || E === 'surprised', rx = sh ? 13 : 11, ry = (sh ? 19 : 16) * (blink > 0 ? 0.45 : 1), P = ellP(x, ey, rx, ry); g.fillStyle = INK; g.fill(P); g.save(); g.clip(P); g.beginPath(); g.arc(x - 3, ey - 7, 3.8, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
      g.save(); g.translate(x - 3, ey - 7); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 7.5, 2.2, 0, 0, TAU); g.lineWidth = 1.3; g.strokeStyle = '#fff'; g.stroke(); g.restore(); } }
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], smug: [6, 0, -4], shock: [-4, -14, -8], surprised: [-4, -12, -6], sad: [-10, -2, 8], love: [0, -6, 0], wink: [2, -4, 2], dazed: [-2, -8, 2] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = ey - 34; taper(g, [[s * (ex - 16), by + BR[0]], [s * ex, by + BR[1]], [s * (ex + 16), by + BR[2]]], 6, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 26), ey + 30, 16, 8, 0, 0, TAU); g.fillStyle = 'rgba(255,110,140,0.7)'; g.fill(); if (E === 'happy' || E === 'love') for (let k = 0; k < 3; k++) taper(g, [[s * (ex + 16 + k * 8), ey + 24], [s * (ex + 12 + k * 8), ey + 36]], 2.4, 'rgba(200,60,90,0.8)', 0.3); }
  const my = ey + 40, MC = '#7a2238';
  if (E === 'shock' || E === 'surprised' || E === 'dazed') { const p = ellP(0, my + 4, E === 'dazed' ? 8 : 11, E === 'dazed' ? 6 : 15); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad') taper(g, arcPts(0, my + 16, 15, Math.PI * 1.2, Math.PI * 1.8, 8), 4.4, INK, 0.3);
  else if (E === 'happy' || E === 'love') { const p = new Path2D(); p.moveTo(-20, my - 4); p.bezierCurveTo(-8, my, 8, my, 20, my - 4); p.bezierCurveTo(16, my + 18, -16, my + 18, -20, my - 4); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'smug' || E === 'wink') taper(g, [[-15, my], [4, my + 7], [19, my - 7]], 4.4, INK, 0.3);
  else taper(g, arcPts(0, my - 10, 18, Math.PI * 0.2, Math.PI * 0.8, 10), 4.4, INK, 0.3);
  if (E === 'dazed') for (let k = 0; k < 3; k++) { const a = t * 0.15 + k * TAU / 3, x = Math.cos(a) * 110, y = hy - 130 + Math.sin(a) * 26; g.save(); g.translate(x, y); g.fillStyle = '#ffe060'; g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 7 : 17, b = i / 10 * TAU - Math.PI / 2; g.lineTo(Math.cos(b) * r, Math.sin(b) * r); } g.closePath(); g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); g.restore(); }
  g.restore();
}

// ---------- lineup (?mtcast=N)
const KT = [
  { d: 6.5, a: [['MT_HOPPER', { expr: 'smile' }], ['MT_HOPPER', { expr: 'laugh', point: 1 }], ['MT_OP1', { expr: 'surprised', prop: 'flashlight' }], ['MT_OP2', { expr: 'smile', prop: 'tweezers' }], ['MT_OP3', { expr: 'grin', prop: 'ledger' }], ['MT_EDISON', { expr: 'thoughtful', prop: 'pen' }]] },
  { d: 3.2, a: [['MOTHY', { pose: 'fly', expr: 'smile' }], ['MOTHY', { pose: 'stuck', expr: 'dazed' }], ['MOTHY', { pose: 'sit', expr: 'smug' }], ['MOTHY', { pose: 'cheer', expr: 'happy' }]] },
  { d: 6.5, a: [['MT_VIS1', { expr: 'surprised' }], ['MT_VIS2', { expr: 'happy' }], ['MT_VISKID', { expr: 'excited', point: 1 }], ['MOTHY', { pose: 'fly', expr: 'wink' }]] },
];
export function mtTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'MOTHY' ? 0.6 : o === 'MT_VISKID' ? 0.8 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
