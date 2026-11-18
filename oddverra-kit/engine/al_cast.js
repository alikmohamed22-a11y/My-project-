// [AL-cast] "The first American alarm clock could only ring at 4 AM": outfit table (merged into ODD by main.js), props (into
// oddverra's HOLD), ROOSTY (a little rooster, the sidekick, who is out of a job because the clock beats him by hours; drawRoosty on the
// 600x1000 card) and a cast lineup (?alcast=N). Levi Hutchins and Antoine Redier are our own stylizations (no portrait of either is
// copied); the townsfolk are invented generic designs. No logos.
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, line, ellP, limb, arcPts } = OVK;
const TAU = Math.PI * 2;

export const AL_ODD = {
  AL_LEVI: { shirt: '#f2ece0', rolled: true, waistcoat: '#8a4a2a', pants: '#4a3a2e', collar: '#f6f2ea', apron: '#a8865a', boots: 'knee', noChain: true,
    hair: 'side', hairCol: '#5a3a22', brow: '#4a2e1a', build: 'thin', head: 'egg', skin: '#f2c8a0', shoes: '#1e1a1e' },            // Levi Hutchins, young clockmaker, 1787
  AL_LEVIC: { frock: true, waistcoat: '#8a4a2a', shirt: '#3a4a5a', pants: '#4a3a2e', collar: '#f6f2ea', cuff: '#f6f2ea', boots: 'knee', noChain: true,
    hair: 'side', hairCol: '#5a3a22', brow: '#4a2e1a', build: 'thin', head: 'egg', skin: '#f2c8a0', shoes: '#1e1a1e' },            // Levi in his coat, outdoors before dawn
  AL_LEVIN: { shirt: '#f2ece0', pants: '#f2ece0', pj: true, hat: 'beanie', hatCol: '#e8dcc8', hair: 'side', hairCol: '#5a3a22', brow: '#4a2e1a', build: 'thin', head: 'egg', skin: '#f2c8a0', shoes: '#6a4a3a', noButtons: true }, // nightshirt + nightcap
  AL_REDIER: { coat: true, frock: true, shirt: '#2a2a3a', pants: '#5a5a66', collar: '#f6f2ea', cuff: '#2a2a3a', neck: 'bow', neckCol: '#1a1a24', waistcoat: '#2a5a4a', button: '#e8c860',
    hair: 'short', hairCol: '#3a2a22', brow: '#3a2a22', moustache: '#3a2a22', build: 'adult', head: 'tall', skin: '#f0c4a0', shoes: '#1a1618' },   // Antoine Redier, Paris clockmaker, 1847
  AL_TOWN1: { frock: true, waistcoat: '#6a7a8a', shirt: '#4a3a5a', pants: '#3a3030', collar: '#f2ece0', noChain: true, hair: 'short', hairCol: '#c8c0b8', brow: '#8a8078', build: 'stout', head: 'wide', skin: '#e8b08a', shoes: '#16141a' },
  AL_TOWN2: { lashes: true, dress: true, shirt: '#3a6a5a', pants: '#3a6a5a', shawl: '#f2ece0', hair: 'bun', hairCol: '#a07040', head: 'round', skin: '#f6d0b0', shoes: '#2a2022', earring: true, noButtons: true },
};
const AL_OPS = [];
export const alOpts = (op) => { const r = {}; for (const k of AL_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props (hand-local: hand at 0,0, up = -y)
const AL_HOLD = {
  // a small brass gear wheel held up
  gear: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 12, -40); const P = new Path2D(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = i % 2 ? 30 : 38; P.lineTo(Math.cos(a) * r, Math.sin(a) * r); } P.closePath();
    cel(g, P, '#d8a848', 3, 4, 3, 1); g.beginPath(); g.arc(0, 0, 9, 0, TAU); g.fillStyle = INK; g.fill(); for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.4; g.beginPath(); g.arc(Math.cos(a) * 19, Math.sin(a) * 19, 6, 0, TAU); g.fillStyle = '#7a5a20'; g.fill(); } g.restore(); },
  // a candle in a pewter holder
  candle: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 8, -10); cel(g, ellP(0, 6, 34, 10), '#9aa0a8', 2.6, 3, 2, 1); cel(g, polyR(-11, -74, 22, 78), '#f4ead0', 2.6, 3, 2, 1);
    const gr = g.createRadialGradient(0, -96, 2, 0, -96, 40); gr.addColorStop(0, 'rgba(255,240,180,0.95)'); gr.addColorStop(1, 'rgba(255,200,90,0)'); g.fillStyle = gr; g.fillRect(-40, -136, 80, 80);
    const F = new Path2D(); F.moveTo(0, -78); F.quadraticCurveTo(-10, -92, 0, -114); F.quadraticCurveTo(10, -92, 0, -78); g.fillStyle = '#ffd060'; g.fill(F); g.restore(); },
  // a little round bedside alarm clock (Redier style): dial + a small setting hand
  bclock: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 14, -50); cel(g, ellP(0, 0, 46, 46), '#c89a48', 3.4, 5, 3, 1); cel(g, ellP(0, 0, 36, 36), '#f6f0e0', 2.4, 2, 1, 0);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.fillStyle = INK; g.fillRect(Math.cos(a) * 30 - 2, Math.sin(a) * 30 - 2, 4, 4); }
    line(g, [[0, 0], [0, -26]], 4, INK); line(g, [[0, 0], [16, 6]], 4, INK); line(g, [[0, 0], [-14, -14]], 3, '#c83a2a'); g.beginPath(); g.arc(0, 0, 4, 0, TAU); g.fillStyle = INK; g.fill();
    cel(g, ellP(-30, -46, 14, 10), '#c89a48', 2.4, 2, 1, 0); cel(g, ellP(30, -46, 14, 10), '#c89a48', 2.4, 2, 1, 0); g.restore(); },
};
function polyR(x, y, w, h) { const p = new Path2D(); p.rect(x, y, w, h); return p; }
Object.assign(OVH.HOLD, AL_HOLD);

// ---------- ROOSTY: drawRoosty(g, o, op) on the 600x1000 card (ground y=965, centre x=300). A plump rooster with a red comb.
// op.expr: 'smile' | 'happy' | 'shock' | 'sad' | 'sly' | 'proud' | 'angry' | 'worried' | 'dazed' | 'sleep' | 'crow' | 'love'
// op.pose: 'stand' | 'flap' | 'point' | 'shrug' | 'ears' (wings over his head) | 'hips' ; op.ring 0..1 (shake lines) ; op.zz 0..1 (sleep Z's)
const FEA = '#f2ece2', FEAD = '#c8b8a8', COMB = '#e2342e', BEAK = '#f2b02a', TAILA = '#2a5a4a', TAILB = '#a8481e';
const rEye = (g, x, y, k, E, blink, look) => {
  if (blink >= 1 || E === 'happy' || E === 'sleep') { taper(g, E === 'sleep' ? [[x - 12 * k, y], [x, y + 7 * k], [x + 12 * k, y]] : [[x - 12 * k, y + 5 * k], [x, y - 8 * k], [x + 12 * k, y + 5 * k]], 5 * k, INK, 0.35); return; }
  if (E === 'dazed') { g.beginPath(); for (let i = 0; i < 24; i++) { const a = i * 0.55, r = 1.2 * k + i * 0.5 * k; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.lineWidth = 3 * k; g.strokeStyle = INK; g.stroke(); return; }
  if (E === 'love') { const r = 14 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(hp); return; }
  const sh = E === 'shock', rx = (sh ? 11 : 8.5) * k, ry = (sh ? 16 : 13) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k, P = ellP(lx, y, rx, ry);
  g.fillStyle = INK; g.fill(P); g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 5 * k, (sh ? 3.8 : 3.2) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
  g.save(); g.translate(lx - 3 * k, y - 5 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.4 * k, 1.9 * k, 0, 0, TAU); g.lineWidth = 1.2 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  const lid = { proud: 0.45, sly: 0.5, sad: 0.25, angry: 0.35, worried: 0.2 }[E]; if (lid && blink < 0.5) { const yl = y - ry + 2 * ry * lid; g.save(); g.clip(ellP(lx, y, rx + 3, ry + 3)); g.fillStyle = FEA; g.fillRect(lx - rx - 6, y - ry - 8, 2 * rx + 12, yl - (y - ry - 8)); g.restore(); taper(g, [[lx - rx - 2, yl], [lx + rx + 2, yl]], 3 * k, INK, 0.3); } };
export function drawRoosty(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, blink = op.blink || 0, look = op.look || 0;
  const pose = op.pose || ({ shock: 'flap', proud: 'hips', crow: 'flap' }[E]) || 'stand';
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const hopA = pose === 'flap' ? Math.abs(Math.sin(t * 0.4)) * 22 : 0, bob = Math.sin(t * 0.2) * 4 - hopA, ring = op.ring || 0;
  const tilt = (E === 'sad' ? 0.06 : E === 'shock' ? -0.06 : E === 'sly' ? 0.08 : E === 'sleep' ? 0.1 : E === 'crow' ? -0.16 : Math.sin(t * 0.13) * 0.03) + ring * 0.1 * Math.sin(t * 2.1);
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale(flip ? -1 : 1, 1);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 150, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  // legs + feet
  for (const s of [-1, 1]) { const fx = s * 40; line(g, [[fx, -150 + bob], [fx + s * 4, -16]], 15, INK); line(g, [[fx, -150 + bob], [fx + s * 4, -16]], 9, BEAK);
    for (const d of [-1, 0, 1]) { line(g, [[fx + s * 4, -16], [fx + s * 4 + d * 30 + 14, -4]], 11, INK); line(g, [[fx + s * 4, -16], [fx + s * 4 + d * 30 + 14, -4]], 5.5, BEAK); } }
  g.translate(0, bob); g.rotate(tilt);
  // tail (arched sickle feathers behind, left side)
  for (let i = 0; i < 5; i++) { const a0 = -0.6 - i * 0.22, P = new Path2D(), bx = -130, by = -330; P.moveTo(bx, by + 20);
    P.quadraticCurveTo(bx - 120 - i * 10, by - 140 + i * 30, bx - 40 - i * 26, by - 230 + i * 50); P.quadraticCurveTo(bx - 70 - i * 6, by - 110 + i * 20, bx + 20, by - 10); P.closePath(); cel(g, P, i % 2 ? TAILB : TAILA, 4, 6, 4, 2); void a0; }
  // body: plump egg
  const B = ellP(0, -330, 180, 190); cel(g, B, FEA, 5, 18, 12, 6);
  g.save(); g.clip(B); g.fillStyle = 'rgba(200,180,160,0.35)'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(-60 + (i % 4) * 46, -240 + Math.floor(i / 4) * 50, 26, 0, Math.PI); g.fill(); } g.restore();
  // comb + wattle + beak
  const hy = -440; const CB = new Path2D(); CB.moveTo(-60, hy - 110); for (let i = 0; i < 4; i++) { const x = -60 + i * 36; CB.quadraticCurveTo(x + 4, hy - 196 - (i % 2) * 18, x + 32, hy - 120); } CB.lineTo(80, hy - 100); CB.lineTo(-60, hy - 96); CB.closePath(); cel(g, CB, COMB, 4, 5, 3, 1);
  const beakOpen = E === 'crow' || E === 'shock' ? 1 : 0;
  const BK = new Path2D(); BK.moveTo(130, hy - 20); BK.lineTo(205, hy + 2 - beakOpen * 18); BK.lineTo(130, hy + 22); BK.closePath(); cel(g, BK, BEAK, 3.4, 3, 2, 1);
  if (beakOpen) { const BL = new Path2D(); BL.moveTo(130, hy + 26); BL.lineTo(196, hy + 30 + 20); BL.lineTo(126, hy + 56); BL.closePath(); cel(g, BL, BEAK, 3.4, 3, 2, 1); g.fillStyle = '#7a2238'; g.beginPath(); g.moveTo(132, hy + 22); g.lineTo(190, hy + 20); g.lineTo(132, hy + 30); g.fill(); }
  const WT = ellP(126, hy + 74 + beakOpen * 12, 22, 34); cel(g, WT, COMB, 3, 3, 2, 1);
  // eyes, brows, blush
  const ex = 34, k = 1.3, ey = hy - 30;
  for (const s of [-1, 1]) rEye(g, s * ex + 40 + look * 6, ey, k, E, blink, look);
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -14, -8], sad: [-10, -2, 8], sly: [8, 2, 0], love: [0, -6, 0], angry: [-10, 4, 12], worried: [-8, -10, 6], dazed: [-6, -8, -2], sleep: [4, 2, 4], crow: [-2, -10, -4] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = ey - 40; taper(g, [[s * (ex - 18) + 40, by + BR[0]], [s * ex + 40, by + BR[1]], [s * (ex + 18) + 40, by + BR[2]]], 6.5, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 26) + 40, ey + 38, 16, 9, 0, 0, TAU); g.fillStyle = 'rgba(255,120,150,0.7)'; g.fill(); }
  if (E === 'shock' || E === 'worried' || E === 'dazed') { g.beginPath(); const sx = -40, sy = hy - 80; g.moveTo(sx, sy); g.quadraticCurveTo(sx + 14, sy + 24, sx, sy + 30); g.quadraticCurveTo(sx - 14, sy + 24, sx, sy); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); }
  // wings
  for (const s of [-1, 1]) { const S = [s * 150, -340]; let tip, mid;
    if (pose === 'flap') { const w = Math.sin(t * 0.8 + s) * 30; mid = [S[0] + s * 70, S[1] - 70 + w * 0.4]; tip = [S[0] + s * 140, S[1] - 150 + w]; }
    else if (pose === 'ears') { mid = [S[0] + s * 30, S[1] - 110]; tip = [s * 70 + 40, hy - 120]; }
    else if (pose === 'shrug') { mid = [S[0] + s * 60, S[1] - 10]; tip = [S[0] + s * 110, S[1] - 50]; }
    else if (pose === 'point' && s > 0) { mid = [S[0] + 70, S[1] - 30]; tip = [S[0] + 150, S[1] - 70]; }
    else if (pose === 'hips') { mid = [S[0] + s * 40, S[1] + 40]; tip = [S[0] - s * 10, S[1] + 90]; }
    else { mid = [S[0] + s * 18, S[1] + 50]; tip = [S[0] - s * 10, S[1] + 120]; }
    const W = new Path2D(); W.moveTo(S[0], S[1] - 40); W.quadraticCurveTo(mid[0] + s * 30, mid[1] - 20, tip[0], tip[1]); W.quadraticCurveTo(mid[0] - s * 10, mid[1] + 30, S[0], S[1] + 50); W.closePath(); cel(g, W, FEAD, 3.6, 5, 3, 2);
    for (let i = 1; i < 3; i++) taper(g, [[S[0] + (tip[0] - S[0]) * 0.3, S[1] + (tip[1] - S[1]) * 0.3 + i * 12], [S[0] + (tip[0] - S[0]) * 0.8, S[1] + (tip[1] - S[1]) * 0.8 + i * 8]], 2.6, 'rgba(60,40,60,0.45)', 0.3); }
  // ring shake lines, sleep Z's
  if (ring > 0.05) { g.lineCap = 'round'; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const r = 220 + i * 34 + (t * 6) % 34; g.globalAlpha = ring * (1 - i / 3) * 0.9; g.beginPath(); g.arc(30, -400, r, s > 0 ? -0.5 : Math.PI - 0.5, s > 0 ? 0.5 : Math.PI + 0.5); g.lineWidth = 7; g.strokeStyle = '#fff3b0'; g.stroke(); } g.globalAlpha = 1; }
  if (op.zz > 0.05 || E === 'sleep') { const a = op.zz ?? 1; g.globalAlpha = a; for (let i = 0; i < 3; i++) { const ph = ((t * 0.02 + i / 3) % 1), x = 120 + ph * 90 + i * 6, y = hy - 160 - ph * 200, sz = 34 + i * 10;
    g.font = `bold ${sz}px "DejaVu Sans", Arial, sans-serif`; g.lineWidth = 7; g.strokeStyle = INK; g.strokeText('Z', x, y); g.fillStyle = '#f4f0ff'; g.fillText('Z', x, y); } g.globalAlpha = 1; }
  g.restore(); }

// ---------- lineup (?alcast=N)
const KT = [
  { d: 6.4, a: [['AL_LEVI', { expr: 'determined', prop: 'gear' }], ['AL_LEVIC', { expr: 'happy', prop: 'lantern' }], ['AL_LEVIN', { expr: 'shock' }], ['AL_REDIER', { expr: 'proud', prop: 'bclock' }], ['AL_TOWN1', { expr: 'smile' }], ['AL_TOWN2', { expr: 'laugh' }]] },
  { d: 4.0, a: [['ROOSTY', { expr: 'smile' }], ['ROOSTY', { expr: 'sleep' }], ['ROOSTY', { expr: 'crow', pose: 'flap' }], ['ROOSTY', { expr: 'dazed', pose: 'ears', ring: 1 }], ['ROOSTY', { expr: 'sly', pose: 'point' }]] },
  { d: 5.0, a: [['AL_LEVIN', { expr: 'happy', mode: 'sit', sleep: true }], ['AL_LEVI', { expr: 'smug', prop: 'mallet' }], ['AL_LEVIC', { expr: 'excited', prop: 'candle' }], ['AL_REDIER', { expr: 'smile', point: 1 }]] },
];
export function alTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'ROOSTY' ? 0.36 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
