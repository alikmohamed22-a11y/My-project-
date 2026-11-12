// [LN-cast] "Abraham Lincoln is in the Wrestling Hall of Fame": outfit table (merged into ODD by main.js), TOPPER (a little living
// stovepipe-hat mascot, drawTopper on the 600x1000 card) and a cast lineup (?lncast=N with any set view flag).
// Young Lincoln (1831-32) is beardless; the bearded, top-hatted LN_ABEP / grey LN_STATUE appear only for the president / honour beats.
// Jack Armstrong, the Clary's Grove boys, the store owner, militia men and Thompson are generic period caricatures (no portraits exist).
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, smooth, ellP, limb, arcPts, hsh } = OVK;
const TAU = Math.PI * 2;

const ABE = { hair: 'side', hairCol: '#1a1210', brow: '#1a1210', build: 'thin', head: 'tall', skin: '#e8b890' };
export const LN_ODD = {
  LN_ABE: { ...ABE, shirt: '#ece0c4', rolled: true, openCollar: true, pants: '#5e4c3a', suspenders: '#3a2618', shoes: '#3a2a20', noButtons: true },
  LN_ABEP: { ...ABE, frock: true, coat: true, shirt: '#1e1a22', pants: '#1e1a22', waistcoat: '#26222c', collar: '#f6f2e6', cuff: '#1e1a22', neck: 'bow', neckCol: '#14121a', button: '#3a3640',
    hat: 'top', hatCol: '#1a1820', beard: 'full', beardCol: '#1a1210', skin: '#e2b08a', shoes: '#14121a' },
  LN_STATUE: { hair: 'side', hairCol: '#b4b0a8', brow: '#a8a49c', build: 'thin', head: 'tall', skin: '#dedad2', frock: true, coat: true, shirt: '#cac6be', pants: '#cac6be', waistcoat: '#c2beb6', collar: '#e8e4dc', cuff: '#cac6be',
    neck: 'bow', neckCol: '#b0aca4', button: '#b8b4ac', hat: 'top', hatCol: '#bcb8b0', beard: 'full', beardCol: '#b4b0a8', shoes: '#b0aca4' },
  LN_JACK: { shirt: '#b8483a', pattern: 'plaid', rolled: true, openCollar: true, pants: '#4a4a5a', suspenders: '#3a2a20', hat: 'slouch', hatCol: '#6a5038', hair: 'short', hairCol: '#8a4a24', brow: '#8a4a24',
    beard: 'chops', beardCol: '#8a4a24', build: 'stout', head: 'wide', skin: '#e8a880', shoes: '#3a2a20', noButtons: true },
  LN_BOY1: { shirt: '#5a7aa0', rolled: true, pants: '#6a5a40', suspenders: '#7a4a2a', hat: 'straw', hatCol: '#e0c070', hair: 'short', hairCol: '#c08a40', brow: '#a8702a', build: 'adult', head: 'round', skin: '#f2c8a0', shoes: '#3a2a20', noButtons: true },
  LN_BOY2: { shirt: '#d8c890', vest: '#5a3a2a', pants: '#3a3a4a', hat: 'wide', hatCol: '#4a3a2a', bandCol: '#2a1a12', hair: 'spiky', hairCol: '#2a1a12', build: 'thin', head: 'egg', skin: '#c8865a', shoes: '#2a2020', noButtons: true },
  LN_BOY3: { shirt: '#8a5a8a', rolled: true, openCollar: true, pants: '#5a4a3a', hair: 'curly', hairCol: '#6a3a1a', brow: '#6a3a1a', moustache: '#6a3a1a', build: 'adult', head: 'wide', skin: '#f0c098', shoes: '#3a2a20', noButtons: true },
  LN_BOSS: { coat: true, waistcoat: '#a8322a', shirt: '#5a4a6a', pants: '#5a5048', collar: '#f4f0e6', cuff: '#5a4a6a', neck: 'cravat', neckCol: '#f2ece0', button: '#d8b048',
    hair: 'receding', hairCol: '#6a4a2a', beard: 'chops', beardCol: '#6a4a2a', brow: '#6a4a2a', build: 'stout', head: 'round', skin: '#f0c0a0', shoes: '#2a2020' },
  LN_WOMAN: { lashes: true, shirt: '#7a5a8a', pants: '#7a5a8a', collar: '#f2e8d8', cuff: '#f2e8d8', apron: '#f2ecdc', hat: 'bonnet', hatCol: '#f0e4c8', bandCol: '#3a6a9a', hair: 'bun', hairCol: '#3a2214', head: 'egg', skin: '#f2c8a4', shoes: '#4a2a2a' },
  LN_MIL1: { shirt: '#7a8a5a', rolled: false, belt: true, pants: '#5a4a3a', hat: 'wide', hatCol: '#3a3028', bandCol: '#1a1410', hair: 'short', hairCol: '#4a3020', brow: '#4a3020', build: 'adult', head: 'egg', skin: '#e8b890', shoes: '#3a2a20', noButtons: true },
  LN_MIL2: { shirt: '#a87a4a', belt: true, pants: '#3a3a4a', hat: 'slouch', hatCol: '#5a4a3a', hair: 'curly', hairCol: '#2a1a12', brow: '#2a1a12', beard: 'full', beardShort: true, beardK: 0.6, beardCol: '#2a1a12', build: 'thin', head: 'tall', skin: '#c88a62', shoes: '#2a2020', noButtons: true },
  LN_THOMPSON: { shirt: '#4a6a4a', rolled: true, openCollar: true, belt: true, pants: '#4a3a2a', hat: 'slouch', hatCol: '#2a2a30', hair: 'short', hairCol: '#2a1a10', brow: '#2a1a10',
    beard: 'full', beardShort: true, beardK: 0.7, beardCol: '#2a1a10', build: 'stout', head: 'wide', skin: '#d8a07a', shoes: '#3a2a20', noButtons: true },
  LN_KID: { shirt: '#c83a3a', pants: '#c83a3a', stripe: '#f2f2f2', hair: 'curly', hairCol: '#2a1a14', build: 'kid', head: 'round', skin: '#a86a48', shoes: '#f2f2f2', sneakers: true, noButtons: true },
  LN_GUIDE: { coat: true, shirt: '#2a3a6a', pants: '#2a3a6a', collar: '#f2f2ee', cuff: '#2a3a6a', neck: 'tie', neckCol: '#c8a040', tieK: 0.7, glasses: true, hair: 'side', hairCol: '#9a9a9a', brow: '#8a8a8a', build: 'adult', head: 'egg', skin: '#f2c8a4', shoes: '#1a1a20', age: 'old' },
};
const LN_OPS = ['grapple'];
export const lnOpts = (op) => { const r = {}; for (const k of LN_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- TOPPER: a little living stovepipe hat. drawTopper(g, o, op) on the 600x1000 card (ground y≈965, centre x=300)
// op.expr: 'smile' | 'happy' | 'shock' | 'sad' | 'sly' | 'dizzy' | 'love' | 'proud'; op.pose: 'stand' | 'wave' | 'cheer' | 'point' | 'shrug' | 'hips'; op.flip, op.look, op.blink, op.t, op.squash
const tEye = (g, x, y, k, E, blink, look) => {
  if (blink >= 1 || E === 'happy') { taper(g, [[x - 13 * k, y + 5 * k], [x, y - 9 * k], [x + 13 * k, y + 5 * k]], 5.5 * k, INK, 0.35); return; }
  if (E === 'dizzy') { taper(g, arcPts(x, y, 10 * k, 0, TAU * 1.6, 18), 3.6 * k, '#f6f2e8', 0.3); return; }
  if (E === 'love') { const r = 15 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2.6 * k; g.strokeStyle = '#f6f2e8'; g.stroke(hp); return; }
  const sh = E === 'shock', rx = (sh ? 13 : 10.5) * k, ry = (sh ? 18 : 15) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k, P = ellP(lx, y, rx, ry);
  g.fillStyle = '#f6f2e8'; g.fill(ellP(lx, y, rx + 4 * k, ry + 4 * k)); g.fillStyle = INK; g.fill(P);
  g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 6 * k, (sh ? 4 : 3.4) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(lx + 3 * k, y + 6 * k, 1.5 * k, 0, TAU); g.fill(); g.restore();
  g.save(); g.translate(lx - 3 * k, y - 6 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.8 * k, 2 * k, 0, 0, TAU); g.lineWidth = 1.2 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  const lid = { proud: 0.45, sly: 0.5, sad: 0.25 }[E]; if (lid && blink < 0.5) { const yl = y - ry + 2 * ry * lid; g.save(); g.clip(ellP(lx, y, rx + 5, ry + 5)); g.fillStyle = '#3a3240'; g.fillRect(lx - rx - 6, y - ry - 8, 2 * rx + 12, yl - (y - ry - 8)); g.restore(); taper(g, [[lx - rx - 2, yl], [lx + rx + 2, yl]], 3 * k, '#f6f2e8', 0.3); } };
export function drawTopper(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, sc = op.scale || 1, blink = op.blink || 0, look = op.look || 0, body = op.col || '#3a3446', band = op.band || '#b8323a';
  const pose = op.pose || ({ shock: 'shock', proud: 'hips' }[E]) || 'stand';
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const hopA = pose === 'cheer' ? Math.abs(Math.sin(t * 0.35)) * 16 : 0, bob = Math.sin(t * 0.2) * 4 - hopA, sq = 1 + (op.squash || 0) * 0.12, tilt = E === 'sad' ? 0.05 : E === 'shock' ? -0.05 : E === 'sly' ? 0.08 : 0;
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale((flip ? -1 : 1) * sc, sc);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 170, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  for (const s of [-1, 1]) { const fx = s * 60; cel(g, limb([[fx, -90 + bob], [fx + s * 6, -24]], [13, 12]), '#3a3240', 2.6, 3, 2, 1); cel(g, ellP(fx + s * 10, -16, 34, 16), '#5a3a24', 2.8, 5, 3, 2); }
  g.translate(0, bob); g.rotate(tilt); g.scale(1 / Math.sqrt(sq), sq);
  const bw = 270, brimY = -96, crownH = 440, cw0 = 112, cw1 = 130, top = brimY - crownH;
  const SH = (s) => [s * (cw0 - 6), brimY - crownH * 0.42], A = {};
  for (const s of [-1, 1]) { const S = SH(s); let E2, Hh;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 16 : Math.sin(t * 0.4 + s) * 6; E2 = [S[0] + s * 50, S[1] - 46]; Hh = [S[0] + s * 56 + w, S[1] - 110]; }
    else if (pose === 'shock') { E2 = [S[0] + s * 54, S[1] - 6]; Hh = [S[0] + s * 60, S[1] - 70]; }
    else if (pose === 'hips') { E2 = [S[0] + s * 52, S[1] + 40]; Hh = [S[0] + s * 6, S[1] + 84]; }
    else if (pose === 'shrug') { E2 = [S[0] + s * 52, S[1] + 26]; Hh = [S[0] + s * 96, S[1] - 14]; }
    else if (pose === 'point' && s > 0) { E2 = [S[0] + 60, S[1] - 10]; Hh = [S[0] + 118, S[1] - 40]; }
    else { E2 = [S[0] + s * 28, S[1] + 60 + (E === 'sad' ? 12 : 0)]; Hh = [S[0] + s * 32, S[1] + 116 + (E === 'sad' ? 12 : 0)]; }
    A[s] = [S, E2, Hh]; }
  // brim (back half), crown, band, brim front
  cel(g, ellP(0, brimY, bw, 42), '#26202c', 4, 10, 8, 4);
  const cr = new Path2D(); cr.moveTo(-cw0, brimY); cr.lineTo(-cw1, top + 20); cr.quadraticCurveTo(-cw1, top, -cw1 + 22, top); cr.lineTo(cw1 - 22, top); cr.quadraticCurveTo(cw1, top, cw1, top + 20); cr.lineTo(cw0, brimY); cr.quadraticCurveTo(0, brimY + 30, -cw0, brimY); cr.closePath();
  cel(g, cr, body, 4.4, 26, 18, 7); cel(g, ellP(0, top + 2, cw1 - 2, 22), '#3e3646', 3, 6, 4, 2);
  const bd = new Path2D(); bd.moveTo(-cw0 - 1, brimY - 8); bd.lineTo(-cw0 - 3, brimY - 70); bd.quadraticCurveTo(0, brimY - 50, cw0 + 3, brimY - 70); bd.lineTo(cw0 + 1, brimY - 8); bd.quadraticCurveTo(0, brimY + 20, -cw0 - 1, brimY - 8); bd.closePath(); cel(g, bd, band, 2.8, 6, 4, 2);
  g.save(); g.globalAlpha = 0.18; g.fillStyle = '#c8c0ff'; g.fillRect(-cw1 + 18, top + 30, 16, crownH - 120); g.restore();
  const fr = new Path2D(); fr.ellipse(0, brimY, bw, 42, 0, 0, Math.PI); fr.quadraticCurveTo(0, brimY + 30, bw, brimY); cel(g, fr, '#2a2430', 3.4, 6, 4, 2);
  // face on the crown
  const fy = brimY - crownH * 0.56, k = 1.2, ex = 44;
  for (const s of [-1, 1]) tEye(g, s * ex + look * 6, fy, k, E, blink, look);
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -12, -8], sad: [-10, -2, 8], sly: [8, 2, 0], love: [0, -6, 0], dizzy: [-2, -6, -2] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = fy - 32; taper(g, [[s * (ex - 14), by + BR[0]], [s * ex, by + BR[1]], [s * (ex + 15), by + BR[2]]], 5.5, '#f6f2e8', 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 26), fy + 26, 15, 8, 0, 0, TAU); g.fillStyle = 'rgba(255,130,160,0.8)'; g.fill(); }
  const my = fy + 34, MC = '#7a2238';
  if (E === 'shock') { const p = ellP(0, my + 4, 9, 13); g.fillStyle = MC; g.fill(p); g.lineWidth = 3; g.strokeStyle = '#f6f2e8'; g.stroke(p); }
  else if (E === 'sad') taper(g, arcPts(0, my + 14, 13, Math.PI * 1.2, Math.PI * 1.8, 8), 4, '#f6f2e8', 0.3);
  else if (E === 'happy' || E === 'love') { const p = new Path2D(); p.moveTo(-16, my - 4); p.bezierCurveTo(-6, my, 6, my, 16, my - 4); p.bezierCurveTo(14, my + 14, -14, my + 14, -16, my - 4); g.fillStyle = MC; g.fill(p); g.lineWidth = 3; g.strokeStyle = '#f6f2e8'; g.stroke(p); }
  else if (E === 'proud' || E === 'sly') taper(g, [[-13, my], [4, my + 6], [17, my - 6]], 4, '#f6f2e8', 0.3);
  else taper(g, arcPts(0, my - 8, 15, Math.PI * 0.2, Math.PI * 0.8, 10), 4, '#f6f2e8', 0.3);
  if (E === 'shock') { g.beginPath(); g.moveTo(cw1 + 40, top + 60); g.quadraticCurveTo(cw1 + 52, top + 80, cw1 + 40, top + 86); g.quadraticCurveTo(cw1 + 28, top + 80, cw1 + 40, top + 60); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); }
  for (const s of [-1, 1]) { const [S, E2, Hh] = A[s]; cel(g, limb([S, E2, Hh], [13, 12, 11]), '#3a3240', 2.6, 4, 3, 2); cel(g, ellP(Hh[0], Hh[1], 18, 16), '#f2ece0', 2.6, 4, 3, 2); }
  g.restore(); }

// ---------- [LN-cast] lineup (?lncast=N) ----------
const KT = [
  { d: 7.0, a: [['LN_ABE', { expr: 'smile' }], ['LN_ABE', { expr: 'determined', grapple: 1, view: 'sideR' }], ['LN_JACK', { expr: 'mean', grapple: 1, view: 'sideL' }], ['LN_BOSS', { expr: 'laugh', point: 1 }], ['LN_BOY1', { expr: 'grin', cheer: 1 }], ['LN_BOY2', { expr: 'smug', cross: 1 }], ['LN_BOY3', { expr: 'laugh' }], ['TOPPER', { expr: 'happy', pose: 'wave' }]] },
  { d: 7.0, a: [['LN_ABEP', { expr: 'smile' }], ['LN_STATUE', { expr: 'calm', hip: 1 }], ['LN_WOMAN', { expr: 'happy' }], ['LN_MIL1', { expr: 'grin' }], ['LN_MIL2', { expr: 'smile' }], ['LN_THOMPSON', { expr: 'smug', cross: 1 }], ['LN_KID', { expr: 'excited' }], ['LN_GUIDE', { expr: 'smile', point: 1 }]] },
  { d: 4.0, a: [['TOPPER', { expr: 'shock' }], ['TOPPER', { expr: 'sly', pose: 'shrug' }], ['TOPPER', { expr: 'love', pose: 'cheer' }], ['LN_ABE', { expr: 'dazed', mode: 'fall' }]] },
];
export function lnTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'TOPPER' ? 0.42 : o.startsWith('LN_ABE') || o === 'LN_STATUE' ? 1.12 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
