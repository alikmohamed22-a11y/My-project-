// [HW-cast] "The Hollywood sign was an ad": outfit table (merged into ODD by main.js), props (into oddverra's HOLD), LIL H (a little
// letter-H mascot, drawLilH), the MULE card (drawMule, side view on the 1000x880 horse card) and a cast lineup (?hwcast=N with any set view flag).
// All people are invented, generic period types; celebrity donors are generic caricatures ("rock star", "cowboy singer"), not likenesses.
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, smooth, ellP, limb, arcPts, mixc, rgba, polyPath, clamp, hsh } = OVK;
const TAU = Math.PI * 2;

export const HW_ODD = {
  HW_DEV: { coat: true, waistcoat: true, shirt: '#5a4a3a', pants: '#5a4a3a', collar: '#ffffff', cuff: '#5a4a3a', neck: 'bow', neckCol: '#a8322a', button: '#2a2020', hat: 'fedora', hatCol: '#4a3a2a', bandCol: '#2a1a14',
    hair: 'side', hairCol: '#3a2418', moustache: '#3a2418', brow: '#3a2418', build: 'adult', head: 'egg', skin: '#f2c8a4', shoes: '#2a1a14', pocket: true },
  HW_PUB: { coat: true, waistcoat: true, shirt: '#3a3a48', pants: '#3a3a48', collar: '#ffffff', cuff: '#3a3a48', neck: 'tie', neckCol: '#2a3a6a', tieK: 0.8, button: '#d8c070', glasses: true, glassChain: true,
    hair: 'receding', hairCol: '#c8c4c0', moustache: '#d8d4d0', brow: '#b8b4b0', build: 'stout', head: 'wide', skin: '#f0c4a4', shoes: '#1e1a1e', age: 'old' },
  HW_WORK1: { shirt: '#c8b89a', pants: '#3a5a8a', suspenders: '#3a5a8a', rolled: true, hat: 'slouch', hatCol: '#6a5a44', hair: 'short', hairCol: '#6a4024', build: 'adult', head: 'round', skin: '#e8b890', shoes: '#3a2a20', noButtons: true },
  HW_WORK2: { shirt: '#8aa0b8', pants: '#5a4a3a', vest: '#4a3a2a', rolled: true, hat: 'cap', hatCol: '#3a3a44', plainCap: true, hair: 'short', hairCol: '#1e1612', moustache: '#1e1612', brow: '#1e1612', build: 'stout', head: 'wide', skin: '#b87a52', nose: 'round', shoes: '#2a2020', noButtons: true },
  HW_WIFE: { lashes: true, dress: true, shirt: '#3aa0a0', pants: '#3aa0a0', collar: '#f8f0e0', cuff: '#f8f0e0', hat: 'ladyhat', hatCol: '#d8506a', hair: 'bun', hairCol: '#2a1a14', head: 'egg', skin: '#f6d0b0', shoes: '#5a2a2a', earring: '#f8f2e8' },
  HW_HUSB: { coat: true, shirt: '#c8b890', pants: '#c8b890', collar: '#ffffff', cuff: '#c8b890', neck: 'bow', neckCol: '#2a3a6a', button: '#6a5a3a', hat: 'straw', hatCol: '#e8d090', bandCol: '#2a3a6a',
    hair: 'side', hairCol: '#8a5a30', brow: '#8a5a30', build: 'thin', head: 'tall', skin: '#f2c8a6', shoes: '#6a3a24' },
  HW_CHAMBER: { coat: true, shirt: '#4a5a6a', pants: '#4a5a6a', collar: '#ffffff', cuff: '#4a5a6a', neck: 'bow', neckCol: '#c83a2a', button: '#2a2a34', glasses: true, hat: 'fedora', hatCol: '#3a4048', bandCol: '#1a1a20',
    hair: 'short', hairCol: '#4a3020', brow: '#4a3020', build: 'adult', head: 'round', skin: '#f2c8a4', shoes: '#1e1a1e' },
  HW_CREW: { shirt: '#d89a4a', pants: '#3a4a5a', suspenders: '#5a3a2a', rolled: true, hat: 'cap', hatCol: '#e8c040', plainCap: true, hair: 'short', hairCol: '#2a1a12', build: 'adult', head: 'wide', skin: '#c98a5e', shoes: '#3a2a20', noButtons: true },
  HW_ROCK: { shirt: '#1a1a22', pants: '#1a1a22', stripe: '#e8302a', collar: '#1a1a22', boots: true, hair: 'wild', hairCol: '#14100e', brow: '#14100e', build: 'thin', head: 'tall', skin: '#f2dcd0', shoes: '#14100e', noButtons: true, earring: '#e8e8f0' },
  HW_COWBOY: { shirt: '#c83a3a', pants: '#3a4a7a', pattern: 'plaid', collar: '#f4ece0', hat: 'wide', hatCol: '#f2e8d0', bandCol: '#5a3a24', boots: true, belt: true, hair: 'short', hairCol: '#6a4a2a', brow: '#6a4a2a',
    build: 'adult', head: 'egg', skin: '#f0c4a0', shoes: '#6a3a24', neck: 'bow', neckCol: '#2a2a3a' },
  HW_HOST: { coat: true, shirt: '#1a1a24', pants: '#1a1a24', collar: '#ffffff', cuff: '#ffffff', neck: 'bow', neckCol: '#1a1a24', button: '#ffffff', hair: 'side', hairCol: '#6a4a3a', brow: '#6a4a3a', build: 'adult', head: 'round', skin: '#f2c8a4', shoes: '#0e0e12' },
  HW_GUEST: { lashes: true, dress: true, shirt: '#c8a0e8', pants: '#c8a0e8', collar: '#f0e0ff', hair: 'curly', hairCol: '#e0b050', head: 'round', skin: '#e8b890', shoes: '#c8a0e8', earring: '#ffe8a0' },
  HW_TOURIST: { hoodie: true, shirt: '#3a9ad8', pants: '#e8d8b8', cuff: '#3a9ad8', hat: 'cap', hatCol: '#e83a3a', plainCap: true, hair: 'short', hairCol: '#2a1a14', build: 'adult', head: 'round', skin: '#e8b48a', shoes: '#f2f2f2', sneakers: true, noButtons: true, satchel: '#5a4a3a' },
};
const HW_OPS = ['lit', 'dented', 'bulbs'];
export const hwOpts = (op) => { const r = {}; for (const k of HW_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props ----------
const bulbAt = (g, x, y, r, lit = 1) => { const P = new Path2D(); P.arc(x, y, r, Math.PI * 0.85, Math.PI * 0.15, false); P.lineTo(x + r * 0.45, y + r * 1.2); P.lineTo(x - r * 0.45, y + r * 1.2); P.closePath();
  if (lit) { const gr = g.createRadialGradient(x, y, 0, x, y, r * 3); gr.addColorStop(0, 'rgba(255,230,140,0.8)'); gr.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = gr; g.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); }
  cel(g, P, lit ? '#fff2b0' : '#e8e4d8', 3, 6, 4, 2); const b = new Path2D(); b.rect(x - r * 0.5, y + r * 1.15, r, r * 0.7); cel(g, b, '#b8b0a0', 2.6, 2, 2, 0); for (let i = 0; i < 3; i++) taper(g, [[x - r * 0.5, y + r * (1.3 + i * 0.2)], [x + r * 0.5, y + r * (1.25 + i * 0.2)]], 1.6, INK, 0.3); };
const bigLetter = (ch, col = '#fbfaf6') => (g, op = {}) => { const s = OVH.HSIDE; g.save(); g.translate(s * 30, -150); g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 7; g.lineJoin = 'round';
  g.font = 'bold 300px "DejaVu Sans", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.save(); g.scale(0.72, 1); g.strokeText(ch, 0, 0); g.fillText(ch, 0, 0); g.restore();
  g.globalAlpha = 0.25; g.fillStyle = '#7a80c0'; g.save(); g.scale(0.72, 1); g.beginPath(); g.rect(-90, 20, 180, 80); g.clip(); g.fillText(ch, 0, 0); g.restore(); g.globalAlpha = 1;
  if (op.bow) { cel(g, ellP(40, -70, 24, 14, 0.5), '#e8302a', 3, 3, 2, 0); cel(g, ellP(76, -70, 24, 14, -0.5), '#e8302a', 3, 3, 2, 0); cel(g, ellP(58, -70, 10, 10), '#c8201a', 3, 2, 2, 0); } g.restore(); };
export const HW_HOLD = {
  bulb: (g, op = {}) => bulbAt(g, OVH.HSIDE * 4, -40, 26, op.lit ?? 1),
  bigO: bigLetter('O'), bigL: bigLetter('L'),
  guitar: (g) => { const s = OVH.HSIDE; g.save(); g.scale(s, 1); g.translate(-10, -30); g.rotate(-0.9); const b = new Path2D(); b.ellipse(0, 40, 54, 46, 0, 0, TAU); b.ellipse(0, -30, 40, 36, 0, 0, TAU); cel(g, smooth([[-54, 40], [-40, -10], [-40, -50], [0, -70], [40, -50], [40, -10], [54, 40], [30, 84], [0, 90], [-30, 84]], 6), '#d8903a', 3.6, 8, 6, 3);
    cel(g, ellP(0, 0, 14, 14), '#3a2418', 2.4, 0, 0, 0); const n = new Path2D(); n.rect(-8, -200, 16, 140); cel(g, n, '#6a3a1e', 3, 2, 2, 0); const hd = new Path2D(); hd.rect(-12, -232, 24, 34); cel(g, hd, '#3a2418', 3, 2, 2, 0); g.strokeStyle = 'rgba(250,240,220,0.8)'; g.lineWidth = 1.4; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(i * 4, -200); g.lineTo(i * 4, 50); g.stroke(); } g.restore(); },
  selfie: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 10, -70); g.rotate(s * 0.15); const p = new Path2D(); p.roundRect(-24, -46, 48, 92, 9); cel(g, p, '#2a2a34', 3.2, 4, 3, 2); const sc = new Path2D(); sc.roundRect(-19, -40, 38, 78, 5); g.fillStyle = '#8ac8f8'; g.fill(sc); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(-15, -36, 10, 70); g.restore(); },
  moneybag: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 16, -10); const P = smooth([[-20, -96], [20, -96], [14, -78], [56, -40], [62, 10], [40, 40], [-40, 40], [-62, 10], [-56, -40], [-14, -78]], 6); cel(g, P, '#c8b080', 3.6, 10, 6, 3);
    taper(g, [[-22, -80], [22, -80]], 6, '#7a4a2a', 0.3); g.fillStyle = '#3a6a3a'; g.font = 'bold 54px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 0, 0); g.restore(); },
  hammer: (g) => { const s = OVH.HSIDE; g.save(); g.scale(s, 1); g.rotate(-0.5); const h = new Path2D(); h.rect(-6, -130, 12, 140); cel(g, h, '#b8864e', 3, 2, 2, 0); const hd = new Path2D(); hd.rect(-30, -150, 60, 24); cel(g, hd, '#6a6a78', 3, 3, 2, 0); g.restore(); },
};
Object.assign(OVH.HOLD, HW_HOLD);

// ---------- LIL H: little letter-H mascot. drawLilH(g, o, op) on the 600x1000 card (ground y≈965, centre x=300)
// op.expr: 'smile' | 'happy' | 'shock' | 'sad' | 'proud' | 'sly' | 'dizzy' | 'love'; op.pose: 'stand' | 'wave' | 'cheer' | 'point' | 'hips' | 'shrug'
// op.bulbs 0..1 (lit marquee bulbs on the outline), op.dented 0..1 (rusty patches + bandage), op.col body colour, op.flip, op.look, op.blink, op.t
const hEye = (g, x, y, k, E, blink, look) => {
  if (blink >= 1 || E === 'happy') { taper(g, [[x - 11 * k, y + 4 * k], [x, y - 8 * k], [x + 11 * k, y + 4 * k]], 5 * k, INK, 0.35); return; }
  if (E === 'dizzy') { taper(g, arcPts(x, y, 9 * k, 0, TAU * 1.6, 18), 3.4 * k, INK, 0.3); return; }
  if (E === 'love') { const r = 13 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2.6 * k; g.strokeStyle = INK; g.stroke(hp); return; }
  const sh = E === 'shock', rx = (sh ? 12 : 9.5) * k, ry = (sh ? 16 : 13.5) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k, P = ellP(lx, y, rx, ry);
  g.lineWidth = 3.6 * k; g.strokeStyle = 'rgba(255,250,240,0.95)'; g.stroke(P); g.fillStyle = INK; g.fill(P);
  g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 5 * k, (sh ? 3.6 : 3) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(lx + 3 * k, y + 5 * k, 1.4 * k, 0, TAU); g.fill(); g.restore();
  g.save(); g.translate(lx - 3 * k, y - 5 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.2 * k, 1.8 * k, 0, 0, TAU); g.lineWidth = 1.2 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  const lid = { proud: 0.45, sly: 0.5, sad: 0.25 }[E]; if (lid && blink < 0.5) { const yl = y - ry + 2 * ry * lid; g.save(); g.clip(ellP(lx, y, rx + 3, ry + 3)); g.fillStyle = '#f6f2e8'; g.fillRect(lx - rx - 4, y - ry - 6, 2 * rx + 8, yl - (y - ry - 6)); g.restore(); taper(g, [[lx - rx - 2, yl], [lx + rx + 2, yl]], 3 * k, INK, 0.3); } };
export function drawLilH(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, sc = op.scale || 1, blink = op.blink || 0, look = op.look || 0, body = op.col || '#f6f2e8';
  const pose = op.pose || ({ proud: 'hips', shock: 'shock' }[E]) || (op.prop ? 'hold' : 'stand');
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const bob = Math.sin(t * 0.2) * 4 + (pose === 'cheer' ? -Math.abs(Math.sin(t * 0.35)) * 12 : 0), tilt = E === 'sad' ? 0.05 : E === 'shock' ? -0.04 : 0;
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale((flip ? -1 : 1) * sc, sc);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 150, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  // feet
  for (const s of [-1, 1]) { const fx = s * 92; cel(g, limb([[fx, -70 + bob], [fx + s * 4, -24]], [16, 15]), body, 2.6, 4, 3, 2); cel(g, ellP(fx + s * 8, -16, 32, 16), '#c8402e', 2.8, 5, 3, 2); }
  g.translate(0, bob); g.rotate(tilt);
  // H body: two posts + crossbar, rounded
  const PW = 70, PH = 520, CX = 120, top = -70 - PH, bar0 = top + PH * 0.36, bar1 = top + PH * 0.56; const P = new Path2D();
  P.roundRect(-CX - PW / 2, top, PW, PH, 18); P.roundRect(CX - PW / 2, top, PW, PH, 18); P.rect(-CX, bar0, 2 * CX, bar1 - bar0);
  const hp = new Path2D(); hp.moveTo(-CX - PW / 2 + 18, top); hp.lineTo(-CX + PW / 2 - 18, top); hp.quadraticCurveTo(-CX + PW / 2, top, -CX + PW / 2, top + 18); hp.lineTo(-CX + PW / 2, bar0); hp.lineTo(CX - PW / 2, bar0); hp.lineTo(CX - PW / 2, top + 18); hp.quadraticCurveTo(CX - PW / 2, top, CX - PW / 2 + 18, top);
  hp.lineTo(CX + PW / 2 - 18, top); hp.quadraticCurveTo(CX + PW / 2, top, CX + PW / 2, top + 18); hp.lineTo(CX + PW / 2, top + PH - 18); hp.quadraticCurveTo(CX + PW / 2, top + PH, CX + PW / 2 - 18, top + PH); hp.lineTo(CX - PW / 2 + 18, top + PH); hp.quadraticCurveTo(CX - PW / 2, top + PH, CX - PW / 2, top + PH - 18);
  hp.lineTo(CX - PW / 2, bar1); hp.lineTo(-CX + PW / 2, bar1); hp.lineTo(-CX + PW / 2, top + PH - 18); hp.quadraticCurveTo(-CX + PW / 2, top + PH, -CX + PW / 2 - 18, top + PH); hp.lineTo(-CX - PW / 2 + 18, top + PH); hp.quadraticCurveTo(-CX - PW / 2, top + PH, -CX - PW / 2, top + PH - 18); hp.lineTo(-CX - PW / 2, top + 18); hp.quadraticCurveTo(-CX - PW / 2, top, -CX - PW / 2 + 18, top); hp.closePath();
  // arms (behind)
  const SH = (s) => [s * (CX + PW / 2 - 6), top + PH * 0.3], A = {};
  for (const s of [-1, 1]) { const S = SH(s); let E2, Hh;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 16 : Math.sin(t * 0.4 + s) * 6; E2 = [S[0] + s * 46, S[1] - 50]; Hh = [S[0] + s * 50 + w, S[1] - 110]; }
    else if (pose === 'shock') { E2 = [S[0] + s * 50, S[1] - 10]; Hh = [S[0] + s * 56, S[1] - 70]; }
    else if (pose === 'hips') { E2 = [S[0] + s * 50, S[1] + 40]; Hh = [S[0] + s * 4, S[1] + 80]; }
    else if (pose === 'shrug') { E2 = [S[0] + s * 50, S[1] + 26]; Hh = [S[0] + s * 92, S[1] - 14]; }
    else if (pose === 'point' && s > 0) { E2 = [S[0] + 56, S[1] - 10]; Hh = [S[0] + 112, S[1] - 40]; }
    else { E2 = [S[0] + s * 26, S[1] + 56 + (E === 'sad' ? 12 : 0)]; Hh = [S[0] + s * 30, S[1] + 110 + (E === 'sad' ? 12 : 0)]; }
    A[s] = [S, E2, Hh]; }
  g.save(); g.clip(hp); g.restore();
  cel(g, hp, body, 4.4, 26, 18, 7);
  if (op.dented) { g.save(); g.clip(hp); for (let i = 0; i < 8; i++) { const x = -CX - 40 + hsh(i, 3) * (2 * CX + 80), y = top + hsh(i, 4) * PH; g.globalAlpha = op.dented * 0.6; g.fillStyle = '#a8603a'; g.beginPath(); g.ellipse(x, y, 14 + 20 * hsh(i, 5), 8 + 12 * hsh(i, 6), hsh(i, 7) * 3, 0, TAU); g.fill(); } g.globalAlpha = 1; g.restore();
    g.save(); g.translate(-CX, top + 60); g.rotate(0.6); const bd = new Path2D(); bd.roundRect(-40, -12, 80, 24, 6); cel(g, bd, '#f2d8b8', 2.4, 2, 2, 0); g.restore(); }
  // marquee bulbs around the outline
  const nb = 26, bl = op.bulbs || 0; for (let i = 0; i < nb; i++) { for (const s of [-1, 1]) { const y = top + 26 + i * (PH - 52) / (nb - 1); if (i % 2) continue; const x = s * CX; const on = bl > 0 && ((i / 2 + Math.floor(t / 4)) % 2 === 0 || bl > 0.99);
    g.beginPath(); g.arc(x, y, 9, 0, TAU); g.fillStyle = on ? '#fff0a0' : '#d8d0c0'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); if (on) { g.globalAlpha = 0.35; g.fillStyle = '#ffd860'; g.beginPath(); g.arc(x, y, 18, 0, TAU); g.fill(); g.globalAlpha = 1; } } }
  // face on the crossbar
  const fy = (bar0 + bar1) / 2 - 4, k = 1.15, ex = 40;
  for (const s of [-1, 1]) hEye(g, s * ex + look * 6, fy, k, E, blink, look);
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -12, -8], sad: [-10, -2, 8], sly: [8, 2, 0], love: [0, -6, 0], dizzy: [-2, -6, -2] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = fy - 26; taper(g, [[s * (ex - 12), by + BR[0]], [s * ex, by + BR[1]], [s * (ex + 13), by + BR[2]]], 5, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 24), fy + 22, 13, 7, 0, 0, TAU); g.fillStyle = 'rgba(255,130,160,0.72)'; g.fill(); }
  const my = fy + 26, MC = '#5a1e30';
  if (E === 'shock') { const p = ellP(0, my + 4, 8, 11); g.fillStyle = MC; g.fill(p); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad') taper(g, arcPts(0, my + 14, 12, Math.PI * 1.2, Math.PI * 1.8, 8), 3.6, INK, 0.3);
  else if (E === 'happy' || E === 'love') { const p = new Path2D(); p.moveTo(-14, my - 4); p.bezierCurveTo(-6, my, 6, my, 14, my - 4); p.bezierCurveTo(12, my + 12, -12, my + 12, -14, my - 4); g.fillStyle = MC; g.fill(p); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'proud' || E === 'sly') taper(g, [[-12, my], [4, my + 6], [16, my - 5]], 3.6, INK, 0.3);
  else taper(g, arcPts(0, my - 8, 14, Math.PI * 0.2, Math.PI * 0.8, 10), 3.6, INK, 0.3);
  if (E === 'shock') { g.beginPath(); g.moveTo(CX + 50, top + 40); g.quadraticCurveTo(CX + 62, top + 60, CX + 50, top + 66); g.quadraticCurveTo(CX + 38, top + 60, CX + 50, top + 40); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); }
  // arms on top
  for (const s of [-1, 1]) { const [S, E2, Hh] = A[s]; cel(g, limb([S, E2, Hh], [16, 15, 14]), body, 2.6, 4, 3, 2);
    if (op.prop && OVH.HOLD[op.prop] && s > 0) { g.save(); g.translate(Hh[0] + 4, Hh[1] - 6); g.scale(0.7, 0.7); OVH.HOLD[op.prop](g, op); g.restore(); } cel(g, ellP(Hh[0], Hh[1], 18, 16), body, 2.6, 4, 3, 2); }
  g.restore(); }

// ---------- MULE: side view on the 1000x880 card (ground y≈840). op.phase 0..1 walk cycle, op.flip, op.strain, op.blink
export function drawMule(g, o = {}, op = {}) { const ph = (op.phase || 0) * TAU, flip = !!op.flip, col = '#8a7260', dk = '#5a4638', belly = '#c8b8a0';
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  g.save(); g.translate(500, 840); g.scale(flip ? -1 : 1, 1);
  g.save(); g.scale(1, 0.16); g.beginPath(); g.ellipse(0, 0, 330, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  const bob = Math.abs(Math.sin(ph)) * 8, by = -340 - bob;
  const leg = (x, a, c) => { const kx = x + Math.sin(a) * 40, P = [[x, by + 60], [x + Math.sin(a) * 22, by + 190], [kx, -20]]; cel(g, limb(P, [34, 26, 22]), c, 3, 6, 4, 2); cel(g, ellP(kx + 6, -14, 26, 16), '#2a2228', 3, 2, 2, 0); };
  leg(-170, ph + Math.PI, dk); leg(150, ph, dk);
  // tail
  taper(g, [[-250, by + 10], [-290, by + 80], [-280, by + 170]], 14, dk, 0.4); cel(g, ellP(-280, by + 180, 16, 30), '#3a2a24', 2.4, 2, 2, 0);
  // body
  const B = smooth([[-250, by - 40], [-120, by - 70], [80, by - 66], [200, by - 60], [250, by], [230, by + 90], [100, by + 120], [-120, by + 120], [-240, by + 90], [-270, by + 20]], 6); cel(g, B, col, 4.4, 22, 14, 7);
  g.save(); g.clip(B); g.fillStyle = belly; g.beginPath(); g.ellipse(0, by + 130, 240, 60, 0, 0, TAU); g.fill(); g.restore();
  // harness + strap to sled (rope goes back-left)
  taper(g, [[150, by - 60], [190, by + 110]], 16, '#6a3a24', 0.3); taper(g, [[-60, by - 66], [-60, by + 118]], 12, '#6a3a24', 0.3); taper(g, [[170, by + 30], [-300, by + 40], [-460, by + 120]], 7, '#c8a870', 0.2);
  // neck + head
  const N = smooth([[180, by - 40], [250, by - 170], [300, by - 230], [350, by - 200], [300, by - 80], [250, by + 30]], 6); cel(g, N, col, 4, 12, 8, 4);
  taper(g, [[200, by - 70], [255, by - 180], [300, by - 236]], 14, '#3a2a24', 0.5); // mane
  const Hd = smooth([[290, by - 250], [350, by - 260], [420, by - 200], [440, by - 150], [400, by - 130], [330, by - 160], [290, by - 200]], 6); cel(g, Hd, col, 4, 12, 8, 4);
  cel(g, ellP(425, by - 160, 28, 26), '#c8b0a0', 3, 4, 3, 0); g.beginPath(); g.arc(432, by - 158, 4, 0, TAU); g.fillStyle = INK; g.fill();
  // long ears
  for (const [dx, a] of [[0, -0.25], [26, -0.05]]) { const ep = smooth([[300 + dx, by - 245], [282 + dx + Math.sin(a) * 60, by - 380], [312 + dx, by - 360], [326 + dx, by - 250]], 4); cel(g, ep, col, 3.4, 6, 4, 2); taper(g, [[304 + dx, by - 260], [296 + dx, by - 345]], 6, '#e8b0b0', 0.4); }
  // eye + brow + blush
  const ey = by - 210, ex = 356; if ((op.blink || 0) >= 1) taper(g, [[ex - 10, ey], [ex + 10, ey]], 4, INK, 0.3); else { const P = ellP(ex, ey, 9, 12); g.fillStyle = INK; g.fill(P); g.beginPath(); g.arc(ex - 3, ey - 4, 3, 0, TAU); g.fillStyle = '#fff'; g.fill(); }
  taper(g, op.strain ? [[ex - 14, ey - 22], [ex + 12, ey - 14]] : [[ex - 12, ey - 18], [ex + 12, ey - 20]], 4, INK, 0.3); g.beginPath(); g.ellipse(ex + 22, ey + 22, 12, 7, 0, 0, TAU); g.fillStyle = 'rgba(255,130,160,0.6)'; g.fill();
  if (op.strain) { for (let i = 0; i < 3; i++) { const p = ((op.t || 0) * 0.04 + i / 3) % 1; g.globalAlpha = 1 - p; g.beginPath(); g.moveTo(330, by - 300 - p * 40); g.quadraticCurveTo(340, by - 285 - p * 40, 330, by - 280 - p * 40); g.quadraticCurveTo(320, by - 285 - p * 40, 330, by - 300 - p * 40); g.fillStyle = '#9fd8ff'; g.fill(); g.globalAlpha = 1; } }
  leg(-130, ph, col); leg(190, ph + Math.PI, col);
  g.restore(); }

// ---------- [HW-cast] lineup (?hwcast=N) ----------
const KT = [
  { d: 7.0, a: [['HW_DEV', { expr: 'happy', prop: 'scroll', reach: 0.8 }], ['HW_PUB', { expr: 'smug', prop: 'newspaper', reach: 0.6 }], ['HW_WORK1', { expr: 'grin', prop: 'hammer', reach: 0.7 }], ['HW_WORK2', { expr: 'smile', prop: 'bulb', raise: 1, reach: 0.9 }], ['HW_WIFE', { expr: 'excited', point: 1 }], ['HW_HUSB', { expr: 'happy' }], ['LILH', { expr: 'happy', pose: 'wave' }]] },
  { d: 7.0, a: [['HW_CHAMBER', { expr: 'smile', prop: 'notepad', reach: 0.6 }], ['HW_CREW', { expr: 'grin', prop: 'hammer', reach: 0.7 }], ['HW_ROCK', { expr: 'excited', prop: 'bigO', reach: 0.9, raise: 1 }], ['HW_COWBOY', { expr: 'happy', prop: 'bigL', reach: 0.9 }], ['HW_HOST', { expr: 'laugh', cheer: 1 }], ['HW_GUEST', { expr: 'happy' }], ['HW_TOURIST', { expr: 'happy', prop: 'selfie', raise: 1, reach: 0.95 }]] },
  { d: 4.0, a: [['LILH', { expr: 'shock' }], ['LILH', { expr: 'sad', dented: 1 }], ['LILH', { expr: 'proud', bulbs: 1 }], ['LILH', { expr: 'love', pose: 'cheer' }]] },
  { d: 6.0, a: [['MULE', { phase: 0.2, strain: 1 }], ['HW_WORK1', { expr: 'worried', prop: 'rope', reach: 0.8 }]] },
];
export function hwTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'LILH' ? 0.5 : o === 'MULE' ? 1.6 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }

// ---------- BIGLET: a giant cut-out letter on a little stand (gala props): op.ch, op.bow, op.sold 0..1, op.wob
export function drawBigLet(g, o = {}, op = {}) { const ch = op.ch || 'O', t = op.t || 0;
  ovLight({ ...op }); g.save(); g.translate(300, 965);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 200, 50, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  const st = new Path2D(); st.rect(-150, -40, 300, 40); cel(g, st, '#8a5a38', 3.6, 6, 4, 2);
  g.rotate((op.wob || 0) * Math.sin(t * 0.3) * 0.04);
  g.font = 'bold 860px "DejaVu Sans", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.save(); g.scale(0.62, 1);
  g.lineJoin = 'round'; g.lineWidth = 22; g.strokeStyle = INK; g.strokeText(ch, 0, -30); g.fillStyle = '#fbfaf6'; g.fillText(ch, 0, -30);
  g.save(); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(122,128,192,0.35)'; g.fillRect(0, -700, 400, 700); g.fillStyle = 'rgba(160,180,255,0.0)'; g.restore();
  g.lineWidth = 6; g.strokeStyle = 'rgba(150,170,255,0.75)'; g.strokeText(ch, 6, -26); g.restore();
  if (op.bow) { const y = -560; cel(g, ellP(-40, y, 50, 30, 0.4), '#e8302a', 3.4, 4, 3, 0); cel(g, ellP(40, y, 50, 30, -0.4), '#e8302a', 3.4, 4, 3, 0); cel(g, ellP(0, y, 20, 20), '#c8201a', 3, 2, 2, 0); taper(g, [[-10, y + 10], [-40, y + 90]], 14, '#e8302a', 0.3); taper(g, [[10, y + 10], [40, y + 90]], 14, '#e8302a', 0.3); }
  const sd = op.sold || 0; if (sd > 0) { g.save(); g.translate(0, -300); g.rotate(-0.35); g.scale(sd, sd); g.strokeStyle = '#e8302a'; g.lineWidth = 12; g.strokeRect(-170, -60, 340, 120); g.fillStyle = '#e8302a'; g.font = 'bold 100px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SOLD', 0, 4); g.restore(); }
  g.restore(); }
