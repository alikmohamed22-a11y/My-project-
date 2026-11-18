// [CLEO-cast] "Cleopatra lived closer to the Moon landing than to the pyramids": outfit table (merged into ODD by main.js), props (into
// oddverra's HOLD), PIP (a little living pyramid mascot who turns up in every era, drawPip on the 600x1000 card) and a cast lineup
// (?clcast=N with any set view flag). Cleopatra is our own stylization (white linen gown, broad gold collar, gold diadem with a uraeus,
// straight black hair); Khufu, the overseer, workers, Herodotus, Greek tourists, the 1969 astronaut, the kid and teacher are generic.
// Hats 'diadem' / 'nemes' / 'headcloth' / 'helmet' and o.wesekh / o.astro live in oddverra_next.js [CLEO-cast].
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, line, smooth, ellP, limb, arcPts, polyPath, mixc } = OVK;
const TAU = Math.PI * 2;

const WORK = { shirt: '#efe4c8', rolled: true, openCollar: true, pants: '#c8885a', sandals: true, noButtons: true, belt: '#a8783a', hair: 'short', hairCol: '#1a1410', brow: '#1a1410', build: 'adult', head: 'round', shoes: '#8a5a30', noChain: true };
export const CL_ODD = {
  CLEO: { lashes: true, galabiya: true, shirt: '#f7f2e6', pants: '#f7f2e6', collar: '#f7f2e6', cuff: '#e2b23a', wesekh: '#e2b23a', belt: '#e2b23a', hat: 'diadem', hair: 'long', hairCol: '#15111a', brow: '#15111a',
    head: 'egg', skin: '#dba47a', earring: '#e2b23a', sandals: true, shoes: '#c89a3a', noButtons: true, noChain: true },
  KHUFU: { galabiya: true, shirt: '#f4eedc', pants: '#f4eedc', cuff: '#e2b23a', wesekh: '#e2b23a', belt: '#2f4fa8', hat: 'nemes', hair: 'short', hairCol: '#1a1410', brow: '#1a1410', build: 'stout', head: 'wide',
    skin: '#b8784e', sandals: true, shoes: '#c89a3a', noButtons: true, noChain: true },
  WORK1: { ...WORK, skin: '#b8784e', pants: '#b8784e', hat: 'headcloth' },
  WORK2: { ...WORK, skin: '#9a6040', pants: '#9a6040', head: 'egg', build: 'stout', shirt: '#e8dcc0' },
  WORK3: { ...WORK, skin: '#c88a5e', pants: '#c88a5e', head: 'tall', build: 'thin', hat: 'headcloth', hatCol: '#e0cfa8', moustache: '#1a1410' },
  OVERSEER: { ...WORK, rolled: false, skin: '#a86a46', pants: '#a86a46', shirt: '#f2ead4', vest: '#2f4fa8', belt: '#e2b23a', hat: 'headcloth', hatCol: '#e8c860', build: 'stout', head: 'wide', moustache: '#1a1410', brow: '#1a1410' },
  HERODOTUS: { galabiya: true, shirt: '#ece4d0', pants: '#ece4d0', sash: '#4a6a9a', hair: 'curly', hairCol: '#6a5040', brow: '#6a5040', beard: 'full', beardCol: '#6a5040', build: 'adult', head: 'egg', skin: '#e8b890',
    sandals: true, shoes: '#8a5a30', noButtons: true, noChain: true },
  GREEK1: { galabiya: true, shirt: '#c8d8e8', pants: '#c8d8e8', sash: '#a8483a', hat: 'wide', hatCol: '#c8a060', bandCol: '#7a5a30', hair: 'short', hairCol: '#3a2a1a', brow: '#3a2a1a', beard: 'full', beardShort: true, beardK: 0.6, beardCol: '#3a2a1a',
    build: 'stout', head: 'round', skin: '#f0c098', sandals: true, shoes: '#8a5a30', noButtons: true, noChain: true },
  GREEK2: { lashes: true, galabiya: true, shirt: '#e8c8b8', pants: '#e8c8b8', sash: '#5a7a4a', hair: 'bun', hairCol: '#4a2a1a', head: 'egg', skin: '#f2c8a4', sandals: true, shoes: '#8a5a30', noButtons: true, noChain: true },
  ASTRO: { astro: true, shirt: '#f4f4f0', pants: '#f4f4f0', collar: '#f4f4f0', cuff: '#c8ccd6', belt: '#b8bcc8', boots: true, shoes: '#e8e8e4', hat: 'helmet', hair: 'short', hairCol: '#6a4a2a', brow: '#6a4a2a', build: 'adult', head: 'round', skin: '#f0c4a0', noButtons: true, noChain: true },
  KID: { hoodie: true, shirt: '#2fa8a0', pants: '#3a4a7a', hair: 'curly', hairCol: '#2a1c14', brow: '#2a1c14', build: 'kid', head: 'round', skin: '#a8704a', shoes: '#f2f2f2', noButtons: true },
  TEACHER: { shirt: '#f2efe6', pants: '#2e3240', vest: '#7a4a6a', collar: '#ffffff', hair: 'bun', hairCol: '#3a2a1a', lashes: true, head: 'egg', skin: '#e8b890', shoes: '#1e1a1e', glasses: true },
};
const CL_OPS = ['raise', 'palm', 'handsUp', 'clasp', 'shake', 'headYaw', 'look'];
export const clOpts = (op) => { const r = {}; for (const k of CL_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props ----------
export const CL_HOLD = {
  scroll: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 30, -60); g.rotate(-s * 0.2); const P = polyPath([[0, -70], [s * 120, -76], [s * 124, 54], [0, 50]]); cel(g, P, '#efe2bc', 3, 5, 3, 2);
    for (let i = 0; i < 6; i++) taper(g, [[s * 18, -50 + i * 18], [s * (60 + (i % 3) * 14), -52 + i * 18]], 2.2, 'rgba(60,40,30,0.6)', 0.2);
    for (const x of [0, s * 122]) cel(g, ellP(x, -12, 12, 68), '#d8c08a', 2.6, 3, 2, 0); g.restore(); },
  glyphs: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 30, -70); g.rotate(-s * 0.12); const P = polyPath([[-10, -80], [s * 130, -86], [s * 134, 60], [-8, 64]]); cel(g, P, '#efe2bc', 3, 5, 3, 2);
    g.strokeStyle = '#3a2a40'; g.lineWidth = 3; g.lineCap = 'round'; const X = (x) => s * x;
    g.beginPath(); g.arc(X(30), -52, 10, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(X(60), -40); g.lineTo(X(70), -64); g.lineTo(X(80), -40); g.stroke(); g.beginPath(); g.moveTo(X(96), -60); g.quadraticCurveTo(X(110), -40, X(100), -36); g.stroke();
    g.beginPath(); g.moveTo(X(20), -10); g.lineTo(X(44), -10); g.moveTo(X(32), -22); g.lineTo(X(32), 4); g.stroke(); g.beginPath(); g.ellipse(X(70), -8, 14, 8, 0, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(X(96), 4); g.lineTo(X(104), -20); g.lineTo(X(112), 4); g.closePath(); g.stroke();
    g.beginPath(); g.moveTo(X(22), 30); g.quadraticCurveTo(X(36), 16, X(50), 30); g.stroke(); g.beginPath(); g.arc(X(80), 30, 8, 0, Math.PI); g.stroke(); g.restore(); },
  staff: (g) => { const s = OVH.HSIDE, a = [s * 4, 130], b = [s * 12, -320]; line(g, [a, b], 14, INK); line(g, [a, b], 8, '#8a5a30'); cel(g, ellP(b[0], b[1] - 10, 14, 14), '#e2b23a', 2.4, 2, 2, 0); },
  pointer: (g) => { const s = OVH.HSIDE, a = [-s * 4, 14], b = [s * 120, -150]; line(g, [a, b], 9, INK); line(g, [a, b], 5, '#c89a5a'); cel(g, ellP(b[0], b[1], 6, 6), '#c0302c', 1.6, 0, 0, 0); },
  plan: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 26, -90); g.rotate(-s * 0.1); const P = polyPath([[-70, -60], [70, -64], [74, 60], [-72, 62]]); cel(g, P, '#efe2bc', 3, 5, 3, 2);
    g.strokeStyle = '#2f4fa8'; g.lineWidth = 4; g.beginPath(); g.moveTo(-50, 40); g.lineTo(0, -40); g.lineTo(50, 40); g.closePath(); g.stroke(); g.lineWidth = 2; for (let k = 1; k < 4; k++) { const y = 40 - k * 20; g.beginPath(); g.moveTo(-50 + k * 12.5, y); g.lineTo(50 - k * 12.5, y); g.stroke(); } g.restore(); },
};
Object.assign(OVH.HOLD, CL_HOLD);

// ---------- PIP: a little living pyramid. drawPip(g, o, op) on the 600x1000 card (ground y≈965, centre x=300)
// op.expr: 'smile' | 'happy' | 'shock' | 'sad' | 'sly' | 'dizzy' | 'love' | 'proud'; op.pose: 'stand' | 'wave' | 'cheer' | 'point' | 'shrug' | 'hips' | 'push' | 'run'
// op.acc: 'helmet' (1969 fishbowl) | 'crown' (tiny diadem) | 'shades' (tourist sunglasses) | 'cap' (school cap); op.flip, op.look, op.blink, op.t, op.squash, op.new (bright fresh casing vs weathered)
const pEye = (g, x, y, k, E, blink, look) => {
  if (blink >= 1 || E === 'happy') { taper(g, [[x - 13 * k, y + 5 * k], [x, y - 9 * k], [x + 13 * k, y + 5 * k]], 5.5 * k, INK, 0.35); return; }
  if (E === 'dizzy') { taper(g, arcPts(x, y, 10 * k, 0, TAU * 1.6, 18), 3.6 * k, INK, 0.3); return; }
  if (E === 'love') { const r = 15 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2.6 * k; g.strokeStyle = INK; g.stroke(hp); return; }
  const sh = E === 'shock', rx = (sh ? 13 : 10.5) * k, ry = (sh ? 18 : 15) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k, P = ellP(lx, y, rx, ry);
  g.fillStyle = '#fffaf0'; g.fill(ellP(lx, y, rx + 5 * k, ry + 5 * k)); g.lineWidth = 2.4 * k; g.strokeStyle = INK; g.stroke(ellP(lx, y, rx + 5 * k, ry + 5 * k)); g.fillStyle = INK; g.fill(P);
  g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 6 * k, (sh ? 4 : 3.4) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(lx + 3 * k, y + 6 * k, 1.5 * k, 0, TAU); g.fill(); g.restore();
  const lid = { proud: 0.45, sly: 0.5, sad: 0.25 }[E]; if (lid && blink < 0.5) { const yl = y - ry + 2 * ry * lid; g.save(); g.clip(ellP(lx, y, rx + 5 * k, ry + 5 * k)); g.fillStyle = '#c89a5a'; g.fillRect(lx - rx - 6 * k, y - ry - 8 * k, 2 * rx + 12 * k, yl - (y - ry - 8 * k)); g.restore(); taper(g, [[lx - rx - 4 * k, yl], [lx + rx + 4 * k, yl]], 3 * k, INK, 0.3); } };
export function drawPip(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, sc = op.scale || 1, blink = op.blink || 0, look = op.look || 0, acc = op.acc;
  const pose = op.pose || ({ shock: 'shock', proud: 'hips' }[E]) || 'stand', run = pose === 'run';
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const lit = op.new ? '#f4e6c0' : '#e8c88a', shade = op.new ? '#d8c08e' : '#c49a5a', edge = op.new ? '#fff6dc' : '#f4dca8';
  const hopA = pose === 'cheer' ? Math.abs(Math.sin(t * 0.35)) * 18 : run ? Math.abs(Math.sin(t * 0.5)) * 14 : 0, bob = Math.sin(t * 0.2) * 4 - hopA, sq = 1 + (op.squash || 0) * 0.14, tilt = E === 'sad' ? 0.05 : E === 'shock' ? -0.05 : E === 'sly' ? 0.08 : run ? -0.08 : 0;
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale((flip ? -1 : 1) * sc, sc);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 200, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  // legs + sandals
  for (const s of [-1, 1]) { const ph = run ? Math.sin(t * 0.5 + (s > 0 ? Math.PI : 0)) * 26 : 0, fx = s * 70 + ph; cel(g, limb([[s * 70, -96 + bob], [fx + s * 4, -22]], [14, 13]), '#a87a48', 2.6, 3, 2, 1); cel(g, ellP(fx + s * 12, -14, 36, 15), '#7a4a24', 2.8, 5, 3, 2); }
  g.translate(0, bob); g.rotate(tilt); g.scale(1 / Math.sqrt(sq), sq);
  const base = -90, Hh = 470, bw = 250, apex = [-14, base - Hh], ridgeB = [-40, base + 10];
  // left (lit) face + right (shade) face
  const Lf = polyPath([apex, [-bw, base], ridgeB]), Rf = polyPath([apex, ridgeB, [bw, base - 8]]);
  cel(g, Lf, lit, 4.2, 18, 12, 6); cel(g, Rf, shade, 4.2, 10, 8, 4);
  g.save(); g.clip(Lf); g.strokeStyle = 'rgba(120,80,40,0.35)'; g.lineWidth = 2.6; for (let k = 1; k < 9; k++) { const y = base - k * Hh / 9; g.beginPath(); g.moveTo(-bw, y + 0); g.lineTo(60, y - 4); g.stroke(); for (let j = -6; j < 4; j++) { const x = j * 44 + (k % 2) * 22; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + Hh / 9); g.stroke(); } }
  g.globalAlpha = 0.22; g.fillStyle = '#fff6dc'; g.beginPath(); g.moveTo(apex[0] - 4, apex[1] + 30); g.lineTo(-bw * 0.62, base - 30); g.lineTo(-bw * 0.48, base - 30); g.closePath(); g.fill(); g.globalAlpha = 1; g.restore();
  g.save(); g.clip(Rf); g.strokeStyle = 'rgba(90,50,20,0.35)'; g.lineWidth = 2.6; for (let k = 1; k < 9; k++) { const y = base - k * Hh / 9; g.beginPath(); g.moveTo(-60, y); g.lineTo(bw, y - 8); g.stroke(); } g.restore();
  taper(g, [apex, ridgeB], 3.2, edge, 0.4);
  // capstone glint (gold on a "new" pyramid)
  if (op.new) cel(g, polyPath([apex, [apex[0] - 30, apex[1] + 56], [apex[0] + 26, apex[1] + 56]]), '#f2c840', 2.6, 3, 2, 0);
  // arms (behind the face edge) - shoulders on the sides of the faces
  const SH = (s) => s < 0 ? [-bw * 0.55, base - Hh * 0.38] : [bw * 0.5, base - Hh * 0.4], A = {};
  for (const s of [-1, 1]) { const S = SH(s); let E2, Hd;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 16 : Math.sin(t * 0.4 + s) * 6; E2 = [S[0] + s * 54, S[1] - 50]; Hd = [S[0] + s * 60 + w, S[1] - 116]; }
    else if (pose === 'shock') { E2 = [S[0] + s * 58, S[1] - 6]; Hd = [S[0] + s * 64, S[1] - 74]; }
    else if (pose === 'hips') { E2 = [S[0] + s * 56, S[1] + 40]; Hd = [S[0] + s * 10, S[1] + 84]; }
    else if (pose === 'shrug') { E2 = [S[0] + s * 56, S[1] + 26]; Hd = [S[0] + s * 100, S[1] - 14]; }
    else if (pose === 'point' && s > 0) { E2 = [S[0] + 64, S[1] - 10]; Hd = [S[0] + 124, S[1] - 44]; }
    else if (pose === 'push') { E2 = [S[0] + s * 30 + 70, S[1] + 10]; Hd = [S[0] + s * 20 + 140, S[1] + 4]; }
    else if (run) { const ph = Math.sin(t * 0.5 + (s > 0 ? 0 : Math.PI)) * 30; E2 = [S[0] + s * 40 + ph, S[1] + 40]; Hd = [S[0] + s * 50 + ph * 1.6, S[1] + 6]; }
    else { E2 = [S[0] + s * 34, S[1] + 60 + (E === 'sad' ? 12 : 0)]; Hd = [S[0] + s * 40, S[1] + 118 + (E === 'sad' ? 12 : 0)]; }
    A[s] = [S, E2, Hd]; }
  // face on the lit face
  const fy = base - Hh * 0.36, fx0 = -88, k = 1.25, ex = 40;
  for (const s of [-1, 1]) pEye(g, fx0 + s * ex + look * 6, fy, k, E, blink, look);
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -12, -8], sad: [-10, -2, 8], sly: [8, 2, 0], love: [0, -6, 0], dizzy: [-2, -6, -2] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = fy - 36; taper(g, [[fx0 + s * (ex - 14), by + BR[0]], [fx0 + s * ex, by + BR[1]], [fx0 + s * (ex + 15), by + BR[2]]], 5.5, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(fx0 + s * (ex + 26), fy + 28, 15, 8, 0, 0, TAU); g.fillStyle = 'rgba(255,120,130,0.7)'; g.fill(); }
  const my = fy + 38, MC = '#7a2238', mx = fx0;
  if (E === 'shock') { const p = ellP(mx, my + 4, 10, 14); g.fillStyle = MC; g.fill(p); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad') taper(g, arcPts(mx, my + 14, 13, Math.PI * 1.2, Math.PI * 1.8, 8), 4, INK, 0.3);
  else if (E === 'happy' || E === 'love') { const p = new Path2D(); p.moveTo(mx - 18, my - 4); p.bezierCurveTo(mx - 6, my, mx + 6, my, mx + 18, my - 4); p.bezierCurveTo(mx + 16, my + 16, mx - 16, my + 16, mx - 18, my - 4); g.fillStyle = MC; g.fill(p); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'proud' || E === 'sly') taper(g, [[mx - 13, my], [mx + 4, my + 6], [mx + 17, my - 6]], 4, INK, 0.3);
  else taper(g, arcPts(mx, my - 8, 16, Math.PI * 0.2, Math.PI * 0.8, 10), 4, INK, 0.3);
  if (E === 'shock') { g.beginPath(); g.moveTo(bw * 0.4, base - Hh * 0.7); g.quadraticCurveTo(bw * 0.4 + 12, base - Hh * 0.7 + 20, bw * 0.4, base - Hh * 0.7 + 26); g.quadraticCurveTo(bw * 0.4 - 12, base - Hh * 0.7 + 20, bw * 0.4, base - Hh * 0.7); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); }
  // accessories
  if (acc === 'crown') { const cy = apex[1] + 70; cel(g, polyPath([[apex[0] - 40, cy + 14], [apex[0] - 36, cy - 6], [apex[0] + 34, cy - 10], [apex[0] + 38, cy + 10]]), '#e2b23a', 2.6, 3, 2, 0); cel(g, smooth([[apex[0] - 8, cy - 4], [apex[0] - 10, cy - 30], [apex[0], cy - 44], [apex[0] + 10, cy - 30], [apex[0] + 8, cy - 4]], 4), '#e8b838', 2.2, 2, 2, 0); cel(g, ellP(apex[0], cy - 22, 4, 5), '#c0302c', 1.2, 0, 0, 0); }
  if (acc === 'shades') { for (const s of [-1, 1]) { cel(g, ellP(fx0 + s * ex, fy + 2, 30, 22), '#1e1a28', 2.6, 0, 0, 0); taper(g, [[fx0 + s * ex - 14, fy - 8], [fx0 + s * ex - 2, fy - 14]], 3, 'rgba(255,255,255,0.7)', 0.3); } taper(g, [[fx0 - 12, fy - 4], [fx0 + 12, fy - 4]], 4, '#1e1a28', 0.2); }
  if (acc === 'cap') { const cy = apex[1] + 64; cel(g, polyPath([[apex[0] - 46, cy + 12], [apex[0] - 30, cy - 34], [apex[0] + 30, cy - 36], [apex[0] + 44, cy + 10]]), '#c0302c', 2.6, 4, 3, 0); cel(g, polyPath([[apex[0] - 46, cy + 10], [apex[0] - 110, cy + 22], [apex[0] - 100, cy + 30], [apex[0] - 40, cy + 22]]), '#a02428', 2.4, 2, 2, 0); }
  for (const s of [-1, 1]) { const [S, E2, Hd] = A[s]; cel(g, limb([S, E2, Hd], [13, 12, 11]), '#a87a48', 2.6, 4, 3, 2); cel(g, ellP(Hd[0], Hd[1], 18, 16), '#e8c88a', 2.6, 4, 3, 2); }
  if (acc === 'helmet') { const cx = -10, cy = base - Hh * 0.5, R = 330, Ry = 330; const ring = ellP(cx, cy, R, Ry); g.save(); g.fillStyle = 'rgba(190,225,255,0.14)'; g.fill(ring); g.restore();
    g.lineWidth = 14; g.strokeStyle = INK; g.stroke(ring); g.lineWidth = 8; g.strokeStyle = '#f4f4f2'; g.stroke(ring); taper(g, arcPts(cx, cy, R * 0.82, Math.PI * 1.12, Math.PI * 1.4, 8, Ry * 0.82), 12, 'rgba(255,255,255,0.85)', 0.4);
    const nk = new Path2D(); nk.roundRect(cx - R * 0.5, cy + Ry * 0.93, R, 22, 8); cel(g, nk, '#c8ccd6', 2.6, 2, 1, 0); }
  g.restore(); }

// ---------- [CLEO-cast] lineup (?clcast=N) ----------
const KT = [
  { d: 7.0, a: [['CLEO', { expr: 'smile' }], ['CLEO', { expr: 'smug', view: '34R', point: 1 }], ['KHUFU', { expr: 'determined', prop: 'plan', reach: 0.8 }], ['OVERSEER', { expr: 'mean', prop: 'staff', reach: 0.4 }], ['WORK1', { expr: 'grin' }], ['WORK2', { expr: 'determined' }], ['WORK3', { expr: 'nervous' }], ['PIP', { expr: 'happy', pose: 'wave' }]] },
  { d: 7.0, a: [['HERODOTUS', { expr: 'excited', prop: 'scroll', reach: 0.8 }], ['GREEK1', { expr: 'surprised' }], ['GREEK2', { expr: 'happy' }], ['ASTRO', { expr: 'excited', wave: 0.8 }], ['ASTRO', { expr: 'smile', view: '34L' }], ['KID', { expr: 'surprised' }], ['TEACHER', { expr: 'smile', prop: 'pointer', reach: 0.8 }], ['PIP', { expr: 'shock', acc: 'helmet' }]] },
  { d: 4.0, a: [['CLEO', { expr: 'surprised', prop: 'glyphs', reach: 0.8 }], ['PIP', { expr: 'sly', pose: 'shrug', acc: 'shades' }], ['PIP', { expr: 'love', pose: 'cheer', acc: 'crown', new: 1 }], ['PIP', { expr: 'determined', pose: 'push', acc: 'cap' }]] },
];
export function clTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'PIP' ? 0.42 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
