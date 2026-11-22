// [LB-cast] "Lamborghini started as a tractor maker": outfit table (merged into ODD by main.js), props (into oddverra's HOLD),
// CLUTCHY (a little living clutch disc, the sidekick; drawClutchy on the 600x1000 card) and a cast lineup (?lbcast=N).
// Ferruccio and Enzo are our own stylizations (Enzo's trademark dark glasses via o.glasses = 'shades' in oddverra_next.js [LB-cast]);
// mechanics, farmers, workers and show visitors are invented generic designs. No logos anywhere.
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, line, ellP, polyPath, limb, arcPts, mixc } = OVK;
const TAU = Math.PI * 2;

const FER = { hair: 'side', hairCol: '#2a1e18', brow: '#2a1e18', moustache: '#2a1e18', build: 'adult', head: 'round', skin: '#e8b48a', shoes: '#3a2a20' };
export const LB_ODD = {
  LB_FERW: { ...FER, shirt: '#e8dcc0', rolled: true, openCollar: true, pants: '#3a4a6a', suspenders: '#5a3a24', noButtons: true, shoes: '#4a3424' },           // 1948 workshop Ferruccio
  LB_FERS: { ...FER, coat: true, shirt: '#3a3e4a', pants: '#3a3e4a', collar: '#f4f1e8', cuff: '#3a3e4a', neck: 'tie', neckCol: '#8a2a2a', button: '#2a2a30', noChain: true }, // 1960s Ferruccio in a suit
  LB_FERN: { ...FER, shirt: '#e8e4dc', rolled: true, openCollar: true, pants: '#4a4a56', vest: '#5a4a3a', noButtons: true },                                      // at night in the works
  LB_ENZO: { coat: true, dbl: true, shirt: '#2e3038', pants: '#2e3038', collar: '#f4f1e8', cuff: '#2e3038', neck: 'tie', neckCol: '#3a3a4a', button: '#1a1a22', glasses: 'shades',
    hair: 'side', hairCol: '#d8d4cc', brow: '#c8c4bc', build: 'stout', head: 'tall', nose: 'long', skin: '#eab896', shoes: '#16141a', noChain: true },
  LB_MECH: { shirt: '#3a5a8a', pants: '#3a5a8a', belt: true, rolled: true, hat: 'cap', hatCol: '#3a4a6a', plainCap: true, hair: 'short', hairCol: '#4a3020', brow: '#4a3020', build: 'thin', head: 'egg', skin: '#d8a07a', shoes: '#2a2020', noButtons: true },
  LB_MECH2: { shirt: '#6a7a8a', pants: '#3a3a44', rolled: true, apron: '#5a4030', hair: 'curly', hairCol: '#1a1410', brow: '#1a1410', moustache: '#1a1410', build: 'stout', head: 'wide', skin: '#c88a62', shoes: '#2a2020', noButtons: true },
  LB_FARM1: { shirt: '#c8b890', rolled: true, pants: '#5a5a4a', suspenders: '#4a3020', hat: 'straw', hatCol: '#e0c880', hair: 'short', hairCol: '#5a3a20', brow: '#5a3a20', moustache: '#6a4a2a', build: 'stout', head: 'wide', skin: '#d89a6a', shoes: '#4a3424', noButtons: true },
  LB_FARM2: { lashes: true, dress: true, shirt: '#8a4a5a', pants: '#8a4a5a', apron: '#f0e6d0', hair: 'bun', hairCol: '#3a2214', head: 'egg', skin: '#e8b08a', shoes: '#3a2a22', shawl: '#c8a050' },
  LB_FARM3: { shirt: '#5a7a4a', rolled: true, pants: '#4a4a5a', hat: 'cap', hatCol: '#5a5a62', plainCap: true, hair: 'short', hairCol: '#2a1a12', build: 'thin', head: 'tall', skin: '#c8906a', shoes: '#3a2a20', noButtons: true },
  LB_KID: { shirt: '#e8c040', pants: '#5a6a8a', hair: 'curly', hairCol: '#3a2214', build: 'kid', head: 'round', skin: '#e0a880', shoes: '#5a3a24', noButtons: true },
  LB_WORK: { shirt: '#e8e4dc', pants: '#e8e4dc', coat: true, collar: '#f4f1e8', hair: 'short', hairCol: '#3a2a20', brow: '#3a2a20', glasses: true, build: 'adult', head: 'egg', skin: '#f0c8a0', shoes: '#2a2a2a', noButtons: true },
  LB_GENT: { coat: true, shirt: '#4a4a5a', pants: '#4a4a5a', collar: '#f4f1e8', cuff: '#4a4a5a', neck: 'tie', neckCol: '#3a5a8a', hat: 'fedora', hatCol: '#3a3a44', hair: 'short', hairCol: '#4a3020', build: 'stout', head: 'wide', skin: '#f2c0a0', shoes: '#1a1618' },
  LB_LADY: { lashes: true, dress: true, shirt: '#3a8a8a', pants: '#3a8a8a', collar: '#f4eee0', hair: 'bun', hairCol: '#d8a040', head: 'egg', skin: '#f6d0b0', shoes: '#2a2022', earring: true },
  LB_PHOTO: { shirt: '#8a6a4a', pants: '#3a3a44', hat: 'fedora', hatCol: '#5a4a3a', pressCard: true, hair: 'short', hairCol: '#2a1a12', moustache: '#2a1a12', build: 'thin', head: 'tall', skin: '#d8a07a', shoes: '#2a2020' },
  LB_LADY2: { lashes: true, dress: true, shirt: '#c8402a', pants: '#c8402a', hair: 'long', hairCol: '#2a1a12', head: 'round', skin: '#c88a62', shoes: '#2a2022' },
  LB_NOWF: { shirt: '#4a6a9a', pattern: 'plaid', plaidLine: 'rgba(230,200,120,0.4)', pants: '#3a4a6a', hat: 'cap', hatCol: '#e86a1a', plainCap: true, hair: 'short', hairCol: '#6a4a2a', beard: 'full', beardShort: true, beardK: 0.7, beardCol: '#6a4a2a', build: 'stout', head: 'wide', skin: '#e8b48a', shoes: '#4a3424', noButtons: true },
};
const LB_OPS = [];
export const lbOpts = (op) => { const r = {}; for (const k of LB_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props
const LB_HOLD = {
  wrench: (g) => { const s = OVH.HSIDE; line(g, [[0, 12], [s * 18, -96]], 14, INK); line(g, [[0, 12], [s * 18, -96]], 9, '#b8bcc6'); const h = new Path2D(); h.arc(s * 20, -108, 18, 0, TAU); cel(g, h, '#b8bcc6', 3, 4, 3, 0); g.beginPath(); g.arc(s * 24, -116, 8, 0, TAU); g.fillStyle = '#4a3a5a'; g.fill(); },
  clutchp: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 26, -66); const o = ellP(0, 0, 62, 62), i = ellP(0, 0, 42, 42), r = new Path2D(); r.addPath(o); r.addPath(i); g.fillStyle = '#8a6040'; g.fill(r, 'evenodd'); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(o); cel(g, ellP(0, 0, 42, 42), '#b8bcc6', 3, 6, 4, 2);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; cel(g, ellP(Math.cos(a) * 28, Math.sin(a) * 28, 6, 9, a), '#d8a83a', 2, 2, 1, 0); } cel(g, ellP(0, 0, 12, 12), '#2a2a30', 2.4, 2, 1, 0); g.restore(); },
  keys: (g) => { const s = OVH.HSIDE; g.beginPath(); g.arc(s * 10, -20, 14, 0, TAU); g.lineWidth = 5; g.strokeStyle = '#c8a050'; g.stroke(); line(g, [[s * 18, -30], [s * 40, -70]], 7, INK); line(g, [[s * 18, -30], [s * 40, -70]], 4, '#d8dce4'); },
};
Object.assign(OVH.HOLD, LB_HOLD);

// ---------- CLUTCHY: drawClutchy(g, o, op) on the 600x1000 card (ground y≈965, centre x=300). The disc stands on its edge, face on the hub.
// op.expr: 'smile' | 'happy' | 'shock' | 'sad' | 'sly' | 'proud' | 'love' | 'dizzy' | 'angry'; op.pose: 'stand' | 'wave' | 'cheer' | 'point' | 'shrug' | 'hips' | 'shock'; op.worn (scorched friction ring), op.spin
const cEye = (g, x, y, k, E, blink, look) => {
  if (blink >= 1 || E === 'happy') { taper(g, [[x - 13 * k, y + 5 * k], [x, y - 9 * k], [x + 13 * k, y + 5 * k]], 5.5 * k, INK, 0.35); return; }
  if (E === 'dizzy') { taper(g, arcPts(x, y, 10 * k, 0, TAU * 1.6, 18), 3.6 * k, INK, 0.3); return; }
  if (E === 'love') { const r = 15 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); return; }
  const sh = E === 'shock', rx = (sh ? 12 : 9.5) * k, ry = (sh ? 17 : 14) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k, P = ellP(lx, y, rx, ry);
  g.fillStyle = INK; g.fill(P); g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 6 * k, (sh ? 4 : 3.4) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
  g.save(); g.translate(lx - 3 * k, y - 6 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.8 * k, 2 * k, 0, 0, TAU); g.lineWidth = 1.2 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  const lid = { proud: 0.45, sly: 0.5, sad: 0.25, angry: 0.35 }[E]; if (lid && blink < 0.5) { const yl = y - ry + 2 * ry * lid; g.save(); g.clip(ellP(lx, y, rx + 3, ry + 3)); g.fillStyle = '#c8ccd6'; g.fillRect(lx - rx - 6, y - ry - 8, 2 * rx + 12, yl - (y - ry - 8)); g.restore(); taper(g, [[lx - rx - 2, yl], [lx + rx + 2, yl]], 3 * k, INK, 0.3); } };
export function drawClutchy(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, blink = op.blink || 0, look = op.look || 0, ring = op.worn ? '#5a3424' : '#9a6a44', plate = '#c0c4ce';
  const pose = op.pose || ({ shock: 'shock', proud: 'hips' }[E]) || 'stand';
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const hopA = pose === 'cheer' ? Math.abs(Math.sin(t * 0.35)) * 18 : 0, bob = Math.sin(t * 0.2) * 4 - hopA, tilt = E === 'sad' ? 0.05 : E === 'shock' ? -0.05 : E === 'sly' ? 0.08 : 0;
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale(flip ? -1 : 1, 1);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 170, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  for (const s of [-1, 1]) { const fx = s * 60; cel(g, limb([[fx, -120 + bob], [fx + s * 6, -26]], [15, 13]), '#3a3a48', 2.6, 3, 2, 1); cel(g, ellP(fx + s * 10, -16, 36, 17), '#2a2a34', 2.8, 5, 3, 2); }
  g.translate(0, bob); g.rotate(tilt);
  const CY = -420, R = 270, Ri = 186;
  // friction ring (rivets + grooves), steel plate, damper springs, hub
  const oR = ellP(0, CY, R, R), iR = ellP(0, CY, Ri, Ri), rg = new Path2D(); rg.addPath(oR); rg.addPath(iR); g.fillStyle = ring; g.fill(rg, 'evenodd');
  g.save(); g.clip(rg, 'evenodd'); g.fillStyle = mixc(ring, '#3a2a6a', 0.3); g.beginPath(); g.ellipse(70, CY + 60, R, R, 0, 0, TAU); g.ellipse(70, CY + 60, Ri - 20, Ri - 20, 0, 0, TAU); g.fill('evenodd');
  g.strokeStyle = 'rgba(40,20,10,0.45)'; g.lineWidth = 5; const sp = op.spin || 0; for (let k = 0; k < 16; k++) { const a = k / 16 * TAU + sp; g.beginPath(); g.moveTo(Math.cos(a) * (Ri + 6), CY + Math.sin(a) * (Ri + 6)); g.lineTo(Math.cos(a + 0.12) * (R - 6), CY + Math.sin(a + 0.12) * (R - 6)); g.stroke(); }
  for (let k = 0; k < 16; k++) { const a = (k + 0.5) / 16 * TAU + sp; g.beginPath(); g.arc(Math.cos(a) * (R + Ri) / 2, CY + Math.sin(a) * (R + Ri) / 2, 8, 0, TAU); g.fillStyle = '#d8dce4'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); }
  if (op.worn) { g.globalAlpha = 0.5; g.fillStyle = '#1a1010'; for (let k = 0; k < 7; k++) { const a = k * 0.9 + 0.3; g.beginPath(); g.ellipse(Math.cos(a) * 225, CY + Math.sin(a) * 225, 30, 16, a, 0, TAU); g.fill(); } g.globalAlpha = 1; }
  g.globalAlpha = 0.2; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(-150, CY - 150, 60, 26, -0.75, 0, TAU); g.fill(); g.globalAlpha = 1; g.restore();
  g.lineWidth = 7; g.strokeStyle = INK; g.stroke(oR); g.lineWidth = 4; g.stroke(iR);
  cel(g, ellP(0, CY, Ri - 4, Ri - 4), plate, 3.6, 18, 12, 6);
  for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + sp + 0.26, x = Math.cos(a) * 150, y = CY + Math.sin(a) * 150; cel(g, ellP(x, y, 15, 24, a + Math.PI / 2), '#d8a83a', 2.6, 4, 3, 1); for (let j = -1; j <= 1; j++) taper(g, [[x + Math.cos(a) * 10 + Math.cos(a + 1.57) * j * 10, y + Math.sin(a) * 10 + Math.sin(a + 1.57) * j * 10], [x - Math.cos(a) * 10 + Math.cos(a + 1.57) * j * 10, y - Math.sin(a) * 10 + Math.sin(a + 1.57) * j * 10]], 2, 'rgba(60,40,10,0.6)', 0.3); }
  // face on the plate
  const fy = CY - 10, ex = 54, k = 1.3;
  for (const s of [-1, 1]) cEye(g, s * ex + look * 6, fy, k, E, blink, look);
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -14, -8], sad: [-10, -2, 8], sly: [8, 2, 0], love: [0, -6, 0], dizzy: [-2, -6, -2], angry: [-10, 4, 12] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = fy - 46; taper(g, [[s * (ex - 18), by + BR[0]], [s * ex, by + BR[1]], [s * (ex + 18), by + BR[2]]], 6, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 36), fy + 48, 18, 9, 0, 0, TAU); g.fillStyle = 'rgba(255,120,150,0.75)'; g.fill(); }
  const my = fy + 76, MC = '#7a2238';
  if (E === 'shock') { const p = ellP(0, my + 4, 11, 15); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad' || E === 'angry') taper(g, arcPts(0, my + 16, 15, Math.PI * 1.2, Math.PI * 1.8, 8), 4.4, INK, 0.3);
  else if (E === 'happy' || E === 'love') { const p = new Path2D(); p.moveTo(-20, my - 4); p.bezierCurveTo(-8, my, 8, my, 20, my - 4); p.bezierCurveTo(16, my + 18, -16, my + 18, -20, my - 4); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'proud' || E === 'sly') taper(g, [[-15, my], [4, my + 7], [19, my - 7]], 4.4, INK, 0.3);
  else taper(g, arcPts(0, my - 10, 18, Math.PI * 0.2, Math.PI * 0.8, 10), 4.4, INK, 0.3);
  if (E === 'shock' || E === 'angry') { g.beginPath(); const sx = R - 30, sy = CY - R + 70; g.moveTo(sx, sy); g.quadraticCurveTo(sx + 14, sy + 24, sx, sy + 30); g.quadraticCurveTo(sx - 14, sy + 24, sx, sy); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); }
  // arms from the rim
  for (const s of [-1, 1]) { const S = [s * R * 0.94, CY + 60]; let E3, Hh;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 16 : Math.sin(t * 0.4 + s) * 6; E3 = [S[0] + s * 50, S[1] - 46]; Hh = [S[0] + s * 56 + w, S[1] - 110]; }
    else if (pose === 'shock') { E3 = [S[0] + s * 54, S[1] - 6]; Hh = [S[0] + s * 60, S[1] - 70]; }
    else if (pose === 'hips') { E3 = [S[0] + s * 52, S[1] + 40]; Hh = [S[0] + s * 6, S[1] + 84]; }
    else if (pose === 'shrug') { E3 = [S[0] + s * 52, S[1] + 26]; Hh = [S[0] + s * 96, S[1] - 14]; }
    else if (pose === 'point' && s > 0) { E3 = [S[0] + 60, S[1] - 10]; Hh = [S[0] + 118, S[1] - 40]; }
    else { E3 = [S[0] + s * 28, S[1] + 60]; Hh = [S[0] + s * 32, S[1] + 116]; }
    cel(g, limb([S, E3, Hh], [14, 13, 12]), '#3a3a48', 2.6, 4, 3, 2); cel(g, ellP(Hh[0], Hh[1], 19, 17), '#f2f2f6', 2.6, 4, 3, 2); }
  g.restore(); }

// ---------- lineup (?lbcast=N)
const KT = [
  { d: 7.0, a: [['LB_FERW', { expr: 'smile', prop: 'wrench' }], ['LB_FERS', { expr: 'smug' }], ['LB_FERN', { expr: 'angry' }], ['LB_ENZO', { expr: 'smug', view: '34L' }], ['LB_MECH', { expr: 'shock', prop: 'clutchp' }], ['LB_MECH2', { expr: 'thoughtful' }], ['CLUTCHY', { expr: 'happy', pose: 'wave' }]] },
  { d: 7.0, a: [['LB_FARM1', { expr: 'laugh' }], ['LB_FARM2', { expr: 'happy' }], ['LB_FARM3', { expr: 'excited' }], ['LB_KID', { expr: 'excited' }], ['LB_WORK', { expr: 'smile' }], ['LB_GENT', { expr: 'shock' }], ['LB_LADY', { expr: 'love' }], ['LB_PHOTO', { expr: 'smile', prop: 'flashcam' }], ['LB_NOWF', { expr: 'grin', prop: 'keys' }]] },
  { d: 4.0, a: [['CLUTCHY', { expr: 'shock' }], ['CLUTCHY', { expr: 'sly', pose: 'shrug', worn: 1 }], ['CLUTCHY', { expr: 'love', pose: 'cheer' }], ['LB_ENZO', { expr: 'smug', view: 'front', point: 1 }]] },
];
export function lbTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'CLUTCHY' ? 0.42 : o === 'LB_KID' ? 0.9 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
