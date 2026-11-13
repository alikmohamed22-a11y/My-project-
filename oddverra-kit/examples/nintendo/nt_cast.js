// [NT-cast] "Nintendo started as a playing-card company": outfit table (merged into ODD by main.js), props (into oddverra's HOLD),
// FUDA (a little living hanafuda-style flower card, the sidekick; drawFuda on the 600x1000 card) and a cast lineup (?ntcast=N).
// Fusajiro, Hiroshi and Yokoi are our own stylizations; everyone else is an invented generic design. No company logos or game
// characters anywhere: cards carry generic plum / pine / cherry motifs, the handheld and console are plain generic shapes.
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, line, ellP, polyPath, limb, arcPts, mixc } = OVK;
const TAU = Math.PI * 2;

const MEIJI = { galabiya: true, sash: '#3a2a20', noButtons: true, noChain: true, sandals: true };
export const NT_ODD = {
  NT_FUSA: { ...MEIJI, shirt: '#2f3f6a', pants: '#2f3f6a', sash: '#c8a050', hair: 'short', hairCol: '#4a4038', brow: '#3a3028', moustache: '#3a3028', build: 'adult', head: 'egg', skin: '#e6b088', shoes: '#4a3424', apron: '#d8ccb0' },   // 1889 card maker (indigo robe, work apron)
  NT_PLAY1: { ...MEIJI, shirt: '#6a3a2a', pants: '#6a3a2a', sash: '#2a2a30', hat: 'bowler', hatCol: '#2a2a30', hair: 'short', hairCol: '#1a1410', brow: '#1a1410', moustache: '#1a1410', build: 'stout', head: 'wide', skin: '#e0a880', shoes: '#2a2020' },
  NT_PLAY2: { ...MEIJI, lashes: true, shirt: '#8a3a5a', pants: '#8a3a5a', sash: '#e8c050', hair: 'bun', hairCol: '#1a1214', head: 'egg', skin: '#f0c098', shoes: '#3a2a22' },
  NT_PLAY3: { ...MEIJI, shirt: '#4a6a4a', pants: '#4a6a4a', sash: '#d8d0b8', hair: 'bald', brow: '#5a4a40', build: 'old', head: 'round', skin: '#dca07a', shoes: '#3a2a20', glasses: true },
  NT_PASS: { ...MEIJI, shirt: '#8a6a3a', pants: '#8a6a3a', sash: '#3a3a44', hat: 'wide', hatCol: '#d8b870', hair: 'short', hairCol: '#2a1a12', build: 'thin', head: 'tall', skin: '#d89a6a', shoes: '#3a2a20' },
  NT_HIRO: { coat: true, shirt: '#3a3e4a', pants: '#3a3e4a', collar: '#f4f1e8', cuff: '#3a3e4a', neck: 'tie', neckCol: '#2a4a7a', button: '#2a2a30', glasses: true, noChain: true,
    hair: 'side', hairCol: '#1a1414', brow: '#1a1414', build: 'adult', head: 'egg', skin: '#ecb890', shoes: '#16141a' },                                                                // 1960s company president
  NT_YOKOI: { shirt: '#f2f0ea', rolled: true, pants: '#4a4a56', neck: 'tie', neckCol: '#8a3a2a', pencil: true, hair: 'side', hairCol: '#1a1410', brow: '#1a1410', build: 'thin', head: 'round', skin: '#e8b48a', shoes: '#2a2020', noButtons: true }, // young engineer
  NT_DRIVER: { shirt: '#2a3448', pants: '#2a3448', coat: true, collar: '#f4f1e8', cuff: '#2a3448', hat: 'patrol', hatCol: '#2a3448', hair: 'short', hairCol: '#2a1a12', build: 'stout', head: 'wide', skin: '#dca07a', shoes: '#1a1618', noChain: true },
  NT_UNION: { shirt: '#e8e4dc', rolled: true, pants: '#3a4a5a', belt: true, hair: 'crew', hairCol: '#1a1410', brow: '#1a1410', build: 'adult', head: 'tall', skin: '#d8a07a', shoes: '#2a2020', noButtons: true },
  NT_GROCER: { shirt: '#e8dcc0', pants: '#5a5a4a', apron: '#3a6a8a', hat: 'cap', hatCol: '#e8e4dc', plainCap: true, hair: 'short', hairCol: '#2a1a12', build: 'stout', head: 'round', skin: '#e0a880', shoes: '#3a2a22', noButtons: true },
  NT_LADY60: { lashes: true, dress: true, shirt: '#3a8a8a', pants: '#3a8a8a', collar: '#f4eee0', hair: 'bun', hairCol: '#1a1214', head: 'egg', skin: '#f6d0b0', shoes: '#2a2022', earring: true },
  NT_KID: { shirt: '#e85a3a', pattern: 'stripe', stripe: true, stripeCol: '#f4e8d0', pants: '#3a5a9a', hair: 'spiky', hairCol: '#3a2214', brow: '#3a2214', build: 'kid', head: 'round', skin: '#f0c098', shoes: '#e8e8f0', noButtons: true },
  NT_SIS: { lashes: true, shirt: '#8a5ac8', pants: '#3a3a5a', hair: 'long', hairCol: '#5a3020', head: 'egg', build: 'kid', skin: '#e8b48a', shoes: '#f0f0f6', noButtons: true },
  NT_NOW: { hoodie: true, shirt: '#3a7a6a', pants: '#3a3a4a', hair: 'curly', hairCol: '#2a1a12', brow: '#2a1a12', build: 'adult', head: 'egg', skin: '#c88a62', shoes: '#f0f0f4', noButtons: true },
};
const NT_OPS = ['ext', 'cardCol', 'lcd'];
export const ntOpts = (op) => { const r = {}; for (const k of NT_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- a tiny hanafuda-style card painter (generic motifs: 'plum', 'pine', 'cherry', 'maple'), w x h centred at 0,0
const MOTIF = { plum: ['#c8302a', '#f4d0d8'], pine: ['#e8c040', '#2f6a3a'], cherry: ['#3a2a5a', '#f8c8d8'], maple: ['#2a3a2a', '#e0502a'] };
export function cardArt(g, w, h, motif = 'plum', o = {}) {
  const [bg, fl] = MOTIF[motif] || MOTIF.plum, P = new Path2D(); P.roundRect(-w / 2, -h / 2, w, h, w * 0.06);
  g.fillStyle = o.back ? '#1a1a22' : '#f2ead6'; g.fill(P); g.save(); g.clip(P);
  if (o.back) { g.fillStyle = '#c8302a'; g.fillRect(-w / 2 + w * 0.1, -h / 2 + w * 0.1, w * 0.8, h - w * 0.2); g.restore(); g.lineWidth = Math.max(2, w * 0.04); g.strokeStyle = INK; g.stroke(P); return; }
  const m = w * 0.08; g.fillStyle = bg; g.fillRect(-w / 2 + m, -h / 2 + m, w - 2 * m, h - 2 * m);
  if (motif === 'pine') { g.fillStyle = '#c8302a'; g.beginPath(); g.arc(0, -h * 0.22, w * 0.24, 0, TAU); g.fill(); for (let i = 0; i < 3; i++) { g.fillStyle = fl; g.beginPath(); g.ellipse(-w * 0.12 + i * w * 0.14, h * (0.05 + i * 0.08), w * 0.26, h * 0.06, -0.2, 0, TAU); g.fill(); } line(g, [[-w * 0.05, h * 0.42], [-w * 0.02, h * 0.1], [w * 0.05, -h * 0.02]], Math.max(2, w * 0.05), '#3a2418'); }
  else { line(g, [[-w * 0.42, h * 0.38], [-w * 0.12, h * 0.12], [w * 0.02, -h * 0.12], [w * 0.3, -h * 0.34]], Math.max(2, w * 0.06), '#2a1a14'); line(g, [[-w * 0.12, h * 0.12], [w * 0.28, h * 0.06]], Math.max(1.5, w * 0.04), '#2a1a14');
    const pts = [[-w * 0.2, h * 0.16], [-w * 0.02, -h * 0.06], [w * 0.14, -h * 0.2], [w * 0.28, -h * 0.32], [w * 0.2, h * 0.06], [-w * 0.3, h * 0.3], [w * 0.06, h * 0.0]];
    for (const [x, y] of pts) { const r = w * 0.065; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; g.fillStyle = fl; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7, r * 0.6, 0, TAU); g.fill(); } g.fillStyle = '#e8b030'; g.beginPath(); g.arc(x, y, r * 0.3, 0, TAU); g.fill(); } }
  if (o.ribbon) { g.fillStyle = '#d8302a'; g.save(); g.rotate(-0.25); g.fillRect(-w * 0.12, -h * 0.05, w * 0.24, h * 0.4); g.restore(); }
  g.restore(); g.lineWidth = Math.max(2, w * 0.035); g.strokeStyle = INK; g.stroke(P); }

// ---------- props
const NT_HOLD = {
  brush: (g) => { const s = OVH.HSIDE; line(g, [[0, 10], [s * 30, -86]], 11, INK); line(g, [[0, 10], [s * 30, -86]], 7, '#c8a060'); line(g, [[s * 29, -84], [s * 36, -108]], 12, INK); line(g, [[s * 29, -84], [s * 35, -104]], 8, '#c8302a'); },
  card: (g, op = {}) => { const s = OVH.HSIDE; g.save(); g.translate(s * 22, -54); g.rotate(s * 0.15); cardArt(g, 62, 98, op.cardCol || 'plum'); g.restore(); },
  cards: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 18, -40); ['plum', 'pine', 'cherry', 'maple'].forEach((m, i) => { g.save(); g.rotate(s * (-0.5 + i * 0.32)); g.translate(0, -42); cardArt(g, 48, 76, m); g.restore(); }); g.restore(); },
  deck: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 16, -36); for (let i = 0; i < 5; i++) { g.save(); g.translate(0, -i * 4); cardArt(g, 60, 92, 'plum', { back: i < 4 }); g.restore(); } g.restore(); },
  // extending lazy-tongs grabber: op.ext 0..1 extends the scissor arm; red tip pads
  grabber: (g, op = {}) => { const s = OVH.HSIDE, e = op.ext == null ? 0.2 : op.ext, n = 5, seg = 20 + 26 * e, hgt = 22 - 14 * e; g.save(); g.translate(s * 8, -16);
    for (let i = 0; i < n; i++) { const x0 = s * i * seg, x1 = s * (i + 1) * seg; for (const [a, b] of [[[x0, -hgt], [x1, hgt]], [[x0, hgt], [x1, -hgt]]]) { line(g, [a, b], 9, INK); line(g, [a, b], 5, '#e8e4dc'); } g.beginPath(); g.arc(x1, 0, 4, 0, TAU); g.fillStyle = '#c8302a'; g.fill(); }
    const tx = s * n * seg; for (const d of [-1, 1]) { line(g, [[tx, d * hgt], [tx + s * 22, d * (hgt + 10)]], 10, INK); line(g, [[tx, d * hgt], [tx + s * 22, d * (hgt + 10)]], 6, '#e8e4dc'); cel(g, ellP(tx + s * 24, d * (hgt + 12), 9, 7), '#d8302a', 2, 0, 0, 0); }
    cel(g, ellP(-s * 4, 0, 14, 22), '#d8302a', 2.4, 2, 1, 0); g.restore(); },
  // generic pocket LCD game: op.lcd = frame for the little juggling blocks
  handheld: (g, op = {}) => { const s = OVH.HSIDE; g.save(); g.translate(s * 26, -50); const P = new Path2D(); P.roundRect(-58, -38, 116, 76, 10); cel(g, P, '#c8c0a8', 3, 4, 3, 2);
    const S = new Path2D(); S.rect(-30, -26, 60, 44); g.fillStyle = '#9aa88a'; g.fill(S); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(S);
    const t = (op.lcd || 0) * 0.25; for (let k = 0; k < 3; k++) { const a = t + k * 2.1, x = Math.cos(a) * 16, y = -6 - Math.abs(Math.sin(a)) * 14; g.fillStyle = '#2a2a30'; g.fillRect(x - 3, y - 3, 6, 6); } g.fillStyle = '#2a2a30'; g.fillRect(-8, 10, 16, 5);
    cel(g, ellP(-44, 10, 7, 7), '#c8302a', 1.6, 0, 0, 0); cel(g, ellP(44, 10, 7, 7), '#c8302a', 1.6, 0, 0, 0); g.restore(); },
  pad: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 30, -40); const P = new Path2D(); P.roundRect(-52, -24, 104, 48, 8); cel(g, P, '#b8b8c0', 3, 4, 3, 2); g.fillStyle = '#2a2a30'; g.fillRect(-40, -6, 24, 8); g.fillRect(-32, -14, 8, 24); cel(g, ellP(26, 2, 7, 7), '#c8302a', 1.4, 0, 0, 0); cel(g, ellP(40, -4, 7, 7), '#c8302a', 1.4, 0, 0, 0); g.restore(); },
  picket: (g) => { const s = OVH.HSIDE; line(g, [[0, 20], [s * 6, -150]], 10, INK); line(g, [[0, 20], [s * 6, -150]], 6, '#a8784a'); g.save(); g.translate(s * 6, -170); const P = new Path2D(); P.rect(-60, -38, 120, 70); cel(g, P, '#f2ead6', 3, 2, 1, 0);
    g.fillStyle = '#c8302a'; g.font = 'bold 30px "DejaVu Sans", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('UNION', 0, -2); g.restore(); },
  ricebox: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 24, -50); const P = new Path2D(); P.rect(-34, -46, 68, 92); cel(g, P, '#f2e8d0', 3, 4, 3, 2); g.fillStyle = '#d8302a'; g.fillRect(-34, -46, 68, 22); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(0, 10, 20, 14, 0, 0, TAU); g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); g.restore(); },
};
Object.assign(OVH.HOLD, NT_HOLD);

// ---------- FUDA: drawFuda(g, o, op) on the 600x1000 card (ground y≈965, centre x=300). A standing flower card with a face.
// op.expr: 'smile' | 'happy' | 'shock' | 'sad' | 'sly' | 'proud' | 'love' | 'dizzy' | 'angry'; op.pose: 'stand' | 'wave' | 'cheer' | 'point' | 'shrug' | 'hips' | 'shock'; op.motif
const fEye = (g, x, y, k, E, blink, look) => {
  if (blink >= 1 || E === 'happy') { taper(g, [[x - 13 * k, y + 5 * k], [x, y - 9 * k], [x + 13 * k, y + 5 * k]], 5.5 * k, INK, 0.35); return; }
  if (E === 'dizzy') { taper(g, arcPts(x, y, 10 * k, 0, TAU * 1.6, 18), 3.6 * k, INK, 0.3); return; }
  if (E === 'love') { const r = 15 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(hp); return; }
  const sh = E === 'shock', rx = (sh ? 12 : 9.5) * k, ry = (sh ? 17 : 14) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k, P = ellP(lx, y, rx, ry);
  g.fillStyle = INK; g.fill(P); g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 6 * k, (sh ? 4 : 3.4) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
  g.save(); g.translate(lx - 3 * k, y - 6 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.8 * k, 2 * k, 0, 0, TAU); g.lineWidth = 1.2 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  const lid = { proud: 0.45, sly: 0.5, sad: 0.25, angry: 0.35 }[E]; if (lid && blink < 0.5) { const yl = y - ry + 2 * ry * lid; g.save(); g.clip(ellP(lx, y, rx + 3, ry + 3)); g.fillStyle = '#f2ead6'; g.fillRect(lx - rx - 6, y - ry - 8, 2 * rx + 12, yl - (y - ry - 8)); g.restore(); taper(g, [[lx - rx - 2, yl], [lx + rx + 2, yl]], 3 * k, INK, 0.3); } };
export function drawFuda(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, blink = op.blink || 0, look = op.look || 0, motif = op.motif || 'plum';
  const pose = op.pose || ({ shock: 'shock', proud: 'hips' }[E]) || 'stand';
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const hopA = pose === 'cheer' ? Math.abs(Math.sin(t * 0.35)) * 22 : 0, bob = Math.sin(t * 0.2) * 4 - hopA, tilt = E === 'sad' ? 0.05 : E === 'shock' ? -0.05 : E === 'sly' ? 0.07 : Math.sin(t * 0.13) * 0.025;
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale(flip ? -1 : 1, 1);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 150, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  for (const s of [-1, 1]) { const fx = s * 56; cel(g, limb([[fx, -110 + bob], [fx + s * 6, -26]], [14, 12]), '#3a2a3a', 2.6, 3, 2, 1); cel(g, ellP(fx + s * 10, -16, 34, 16), '#2a1a24', 2.8, 5, 3, 2); }
  g.translate(0, bob); g.rotate(tilt);
  const W = 330, Hh = 520, CY = -96 - Hh / 2;
  // card body: thick paper edge (side), front with the motif painted in the top half and a pale face panel below
  g.save(); g.translate(14, 10); const Ps = new Path2D(); Ps.roundRect(-W / 2, CY - Hh / 2, W, Hh, 22); g.fillStyle = mixc('#2a1a24', '#3a2a7a', 0.3); g.fill(Ps); g.restore();
  g.save(); g.translate(0, CY); cardArt(g, W, Hh, motif); g.restore();
  // face panel
  const fy = CY + 120, FP = new Path2D(); FP.roundRect(-118, fy - 78, 236, 170, 40); g.fillStyle = 'rgba(242,234,214,0.94)'; g.fill(FP); g.lineWidth = 3; g.strokeStyle = 'rgba(43,29,74,0.5)'; g.stroke(FP);
  g.save(); const SH = new Path2D(); SH.roundRect(-W / 2, CY - Hh / 2, W, Hh, 22); g.clip(SH); g.fillStyle = 'rgba(58,42,122,0.2)'; g.fillRect(W * 0.18, CY - Hh / 2, W, Hh); g.globalAlpha = 0.25; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(-W * 0.3, CY - Hh * 0.36, 40, 16, -0.6, 0, TAU); g.fill(); g.globalAlpha = 1; g.restore();
  const ex = 52, k = 1.3, ey = fy - 6;
  for (const s of [-1, 1]) fEye(g, s * ex + look * 6, ey, k, E, blink, look);
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -14, -8], sad: [-10, -2, 8], sly: [8, 2, 0], love: [0, -6, 0], dizzy: [-2, -6, -2], angry: [-10, 4, 12] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = ey - 44; taper(g, [[s * (ex - 18), by + BR[0]], [s * ex, by + BR[1]], [s * (ex + 18), by + BR[2]]], 6, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 30), ey + 40, 17, 9, 0, 0, TAU); g.fillStyle = 'rgba(255,120,150,0.75)'; g.fill(); }
  const my = ey + 62, MC = '#7a2238';
  if (E === 'shock') { const p = ellP(0, my + 4, 11, 15); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad' || E === 'angry') taper(g, arcPts(0, my + 16, 15, Math.PI * 1.2, Math.PI * 1.8, 8), 4.4, INK, 0.3);
  else if (E === 'happy' || E === 'love') { const p = new Path2D(); p.moveTo(-20, my - 4); p.bezierCurveTo(-8, my, 8, my, 20, my - 4); p.bezierCurveTo(16, my + 18, -16, my + 18, -20, my - 4); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'proud' || E === 'sly') taper(g, [[-15, my], [4, my + 7], [19, my - 7]], 4.4, INK, 0.3);
  else taper(g, arcPts(0, my - 10, 18, Math.PI * 0.2, Math.PI * 0.8, 10), 4.4, INK, 0.3);
  if (E === 'shock' || E === 'angry') { g.beginPath(); const sx = W / 2 - 24, sy = CY - Hh / 2 + 40; g.moveTo(sx, sy); g.quadraticCurveTo(sx + 14, sy + 24, sx, sy + 30); g.quadraticCurveTo(sx - 14, sy + 24, sx, sy); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); }
  // arms from the card edges
  for (const s of [-1, 1]) { const S = [s * W * 0.48, CY + 60]; let E3, Hd;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 16 : Math.sin(t * 0.4 + s) * 6; E3 = [S[0] + s * 50, S[1] - 46]; Hd = [S[0] + s * 56 + w, S[1] - 110]; }
    else if (pose === 'shock') { E3 = [S[0] + s * 54, S[1] - 6]; Hd = [S[0] + s * 60, S[1] - 70]; }
    else if (pose === 'hips') { E3 = [S[0] + s * 52, S[1] + 40]; Hd = [S[0] + s * 6, S[1] + 84]; }
    else if (pose === 'shrug') { E3 = [S[0] + s * 52, S[1] + 26]; Hd = [S[0] + s * 96, S[1] - 14]; }
    else if (pose === 'point' && s > 0) { E3 = [S[0] + 60, S[1] - 10]; Hd = [S[0] + 118, S[1] - 40]; }
    else { E3 = [S[0] + s * 28, S[1] + 60]; Hd = [S[0] + s * 32, S[1] + 116]; }
    cel(g, limb([S, E3, Hd], [14, 13, 12]), '#3a2a3a', 2.6, 4, 3, 2); cel(g, ellP(Hd[0], Hd[1], 19, 17), '#f2f2f6', 2.6, 4, 3, 2); }
  g.restore(); }

// ---------- lineup (?ntcast=N)
const KT = [
  { d: 7.0, a: [['NT_FUSA', { expr: 'smile', prop: 'brush' }], ['NT_PLAY1', { expr: 'laugh', prop: 'cards' }], ['NT_PLAY2', { expr: 'happy', prop: 'card' }], ['NT_PLAY3', { expr: 'smug' }], ['NT_PASS', { expr: 'smile' }], ['FUDA', { expr: 'happy', pose: 'wave' }]] },
  { d: 7.0, a: [['NT_HIRO', { expr: 'determined' }], ['NT_YOKOI', { expr: 'excited', prop: 'grabber', ext: 0.9 }], ['NT_DRIVER', { expr: 'worried' }], ['NT_UNION', { expr: 'angry', prop: 'picket' }], ['NT_GROCER', { expr: 'nervous', prop: 'ricebox' }], ['NT_LADY60', { expr: 'surprised' }]] },
  { d: 6.0, a: [['NT_KID', { expr: 'excited', prop: 'pad' }], ['NT_SIS', { expr: 'laugh', prop: 'handheld', lcd: 4 }], ['NT_NOW', { expr: 'happy', prop: 'deck' }], ['FUDA', { expr: 'shock' }], ['FUDA', { expr: 'love', pose: 'cheer', motif: 'pine' }]] },
];
export function ntTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'FUDA' ? 0.42 : (o === 'NT_KID' || o === 'NT_SIS') ? 0.8 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
