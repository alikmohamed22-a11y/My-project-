// [EF-cast] "The Eiffel Tower was only meant to stand for 20 years": outfit table (merged into ODD by main.js), props (into oddverra's
// HOLD), TOURI (a little living iron tower, the sidekick; drawTouri on the 600x1000 card) and a cast lineup (?efcast=N).
// Gustave Eiffel is our own stylization; everyone else is an invented generic design. No logos, insignia or real newspaper mastheads.
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, line, ellP, polyPath, limb, arcPts, mixc } = OVK;
const TAU = Math.PI * 2;

const GENT = { frock: true, coat: true, collar: '#f4f1e8', neck: 'cravat', noChain: true };
export const EF_ODD = {
  EF_EIFFEL: { ...GENT, shirt: '#2a2a36', pants: '#4a4652', waistcoat: '#8a6a4a', cuff: '#2a2a36', neckCol: '#2a2232', button: '#c8a050', hat: 'bowler', hatCol: '#1e1a22',
    hair: 'short', hairCol: '#e8e2d8', beard: 'full', beardShort: true, beardK: 0.66, beardCol: '#e8e2d8', moustache: '#e8e2d8', brow: '#d8d0c4', build: 'adult', head: 'egg', skin: '#efc4a0', shoes: '#16141a' }, // 1889 engineer
  EF_CLERK: { ...GENT, frock: false, shirt: '#3a3a4a', pants: '#3a3a4a', waistcoat: '#6a5a3a', cuff: '#3a3a4a', neckCol: '#6a2a2a', glasses: true, hair: 'receding', hairCol: '#5a4a3e', moustache: '#4a3a30', brow: '#4a3a30',
    build: 'stout', head: 'round', skin: '#ecbc98', shoes: '#16141a', pocket: true },                                                                           // city office clerk
  EF_PAINTER: { shirt: '#6a7ab8', pants: '#4a3a3a', hat: 'beret', hatCol: '#2a2232', neck: 'bow', neckCol: '#c8302a', hair: 'curly', hairCol: '#3a2418', moustache: '#3a2418', beard: 'full', beardShort: true, beardK: 0.4, beardCol: '#3a2418',
    build: 'thin', head: 'tall', skin: '#f0c8a2', shoes: '#2a1e1a', noButtons: true, apron: '#e8dcc0' },                                                       // 1887 painter (smock)
  EF_WRITER: { ...GENT, shirt: '#2a2e3e', pants: '#5a5450', waistcoat: '#7a2a3a', cuff: '#2a2e3e', neckCol: '#1a1a22', hair: 'side', hairCol: '#4a3020', moustache: '#4a3020', brow: '#4a3020', build: 'stout', head: 'wide', skin: '#ecb894', shoes: '#16141a' },
  EF_COMPOSER: { ...GENT, shirt: '#3a2a2a', pants: '#3a3434', waistcoat: '#5a4a6a', cuff: '#3a2a2a', neckCol: '#f2ece0', hair: 'receding', hairCol: '#c8c0b4', beard: 'full', beardK: 0.9, beardCol: '#c8c0b4', brow: '#a8a098', bushyBrow: true,
    build: 'old', head: 'egg', skin: '#ecc4a4', shoes: '#16141a' },
  EF_LADY: { lashes: true, dress: true, bustle: true, shirt: '#8a4a6a', pants: '#8a4a6a', collar: '#f4eee0', hat: 'ladyhat', hatCol: '#3a2a3a', featherCol: '#e8c040', hair: 'bun', hairCol: '#5a3020', head: 'egg', skin: '#f6d0b0', shoes: '#2a2022', earring: true },
  EF_GRUMP: { shirt: '#5a4a3a', pants: '#3a3a44', waistcoat: '#3a4a3a', hat: 'top', hatCol: '#1e1a22', hair: 'short', hairCol: '#3a2a20', moustache: '#3a2a20', brow: '#2a1a14', bushyBrow: true, build: 'stout', head: 'wide', skin: '#e0a880', shoes: '#2a2020', collar: '#f4f0e6', neck: 'tie', neckCol: '#2a2232' },
  EF_WORKER: { shirt: '#3a5a8a', rolled: true, pants: '#5a4a3a', suspenders: '#3a2a20', hat: 'cap', hatCol: '#3a3a44', hair: 'short', hairCol: '#2a1a12', moustache: '#2a1a12', brow: '#2a1a12', build: 'stout', head: 'round', skin: '#dca07a', shoes: '#2a2020', noButtons: true },
  EF_SOLDIER: { coat: true, shirt: '#4a5a8a', pants: '#b8302a', collar: '#4a5a8a', cuff: '#4a5a8a', button: '#d8b048', hat: 'patrol', hatCol: '#b8302a', hair: 'short', hairCol: '#2a1a12', moustache: '#2a1a12', brow: '#2a1a12',
    build: 'adult', head: 'egg', skin: '#ecb890', shoes: '#16141a', boots: true, noChain: true },                                                           // army radio operator (blue coat, red trousers, kepi)
  EF_OPER: { coat: true, shirt: '#4a5a8a', pants: '#b8302a', collar: '#4a5a8a', cuff: '#4a5a8a', button: '#d8b048', headphones: true, phonesCol: '#2a2a32', hair: 'side', hairCol: '#3a2214', moustache: '#3a2214', brow: '#3a2214',
    build: 'thin', head: 'round', skin: '#f0c098', shoes: '#16141a', noChain: true },                                                                         // 1914 operator with headphones
  EF_TOUR1: { hoodie: true, shirt: '#e8604a', pants: '#3a4a6a', hair: 'curly', hairCol: '#2a1a12', brow: '#2a1a12', build: 'adult', head: 'egg', skin: '#c88a62', shoes: '#f0f0f4', noButtons: true },
  EF_TOUR2: { lashes: true, shirt: '#3aa88a', pants: '#2a2a3a', hair: 'long', hairCol: '#e8c070', head: 'egg', skin: '#f6d0b0', shoes: '#f0f0f6', noButtons: true, earring: true },
  EF_KID: { shirt: '#f0c030', pattern: 'stripe', stripe: true, stripeCol: '#3a6ad8', pants: '#3a5a9a', hair: 'spiky', hairCol: '#5a3214', brow: '#5a3214', build: 'kid', head: 'round', skin: '#f0c098', shoes: '#e8e8f0', noButtons: true },
};
const EF_OPS = ['coins', 'docText', 'paintK'];
export const efOpts = (op) => { const r = {}; for (const k of EF_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props
const EF_HOLD = {
  // sledgehammer (long wooden haft, iron head)
  sledge: (g) => { const s = OVH.HSIDE, a = [-s * 4, 30], b = [s * 18, -150]; line(g, [a, b], 14, INK); line(g, [a, b], 9, '#b08050'); g.save(); g.translate(b[0], b[1]); g.rotate(s * 0.12); const P = new Path2D(); P.roundRect(-34, -22, 68, 40, 6); cel(g, P, '#6a6a78', 3, 4, 3, 2); g.restore(); },
  // bag of coins (Eiffel pays): op.coins 0..1 opens the bag mouth and spills a coin
  moneybag: (g, op = {}) => { const s = OVH.HSIDE; g.save(); g.translate(s * 26, -30); const P = new Path2D(); P.moveTo(-34, -20); P.bezierCurveTo(-60, 30, -40, 62, 0, 62); P.bezierCurveTo(40, 62, 60, 30, 34, -20); P.closePath(); cel(g, P, '#c8a86a', 3, 4, 3, 2);
    cel(g, ellP(0, -26, 20, 9), '#a8885a', 2.4, 0, 0, 0); g.fillStyle = '#8a5a2a'; g.font = 'bold 40px "DejaVu Sans", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('F', 0, 24);
    if ((op.coins || 0) > 0) { const k = op.coins; for (let i = 0; i < 3; i++) cel(g, ellP(-10 + i * 12, -34 - k * (14 + i * 8), 9, 6), '#f0c040', 2, 0, 0, 0); } g.restore(); },
  // a big official document (permit / protest letter), op.docText = ['PERMIT', '1889-1909']
  document: (g, op = {}) => { const s = OVH.HSIDE; g.save(); g.translate(s * 30, -60); g.rotate(-s * 0.06); const P = polyPath([[-62, -84], [62, -80], [60, 84], [-60, 80]]); cel(g, P, '#f4ecd8', 3.5, 6, 4, 2);
    const L = op.docText || ['PERMIT']; g.fillStyle = '#3a2418'; g.textAlign = 'center'; g.textBaseline = 'middle'; L.forEach((t, i) => { g.font = `bold ${i ? 20 : 26}px "DejaVu Serif", Georgia, serif`; g.fillText(t, 0, -50 + i * 34, 112); });
    g.strokeStyle = 'rgba(58,36,24,0.5)'; g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-44, 20 + i * 16); g.lineTo(44, 20 + i * 16); g.stroke(); } cel(g, ellP(32, 64, 14, 14), '#c8302a', 2, 0, 0, 0); g.restore(); },
  // quill pen
  quill: (g) => { const s = OVH.HSIDE; line(g, [[0, 8], [s * 34, -96]], 6, INK); g.save(); g.translate(s * 30, -80); g.rotate(s * 0.32); const P = new Path2D(); P.moveTo(0, 40); P.quadraticCurveTo(-s * 22, -10, s * 6, -60); P.quadraticCurveTo(s * 18, -10, 0, 40); cel(g, P, '#f4f0e8', 2.4, 3, 2, 1); g.restore(); },
  // paintbrush + palette
  palette: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 24, -30); const P = new Path2D(); P.ellipse(0, 0, 50, 34, 0.2, 0, TAU); cel(g, P, '#c89a5a', 3, 4, 3, 2); ['#c8302a', '#3a6ad8', '#f0c030', '#3a9a5a', '#f4f0e8'].forEach((c, i) => { g.beginPath(); g.arc(-26 + i * 13, -10 + (i % 2) * 14, 7, 0, TAU); g.fillStyle = c; g.fill(); }); g.restore(); },
  // a rubber stamp (official)
  stamp: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 22, -44); const P = new Path2D(); P.roundRect(-12, -40, 24, 46, 8); cel(g, P, '#7a4a2a', 2.6, 3, 2, 1); const B = new Path2D(); B.roundRect(-28, 4, 56, 16, 3); cel(g, B, '#3a3a44', 2.6, 3, 2, 1); g.fillStyle = '#c8302a'; g.fillRect(-26, 18, 52, 5); g.restore(); },
  // phone-camera for tourists (generic slab)
  snap: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 20, -62); g.rotate(s * 0.1); const P = new Path2D(); P.roundRect(-20, -34, 40, 68, 7); cel(g, P, '#2a2a34', 2.6, 3, 2, 1); g.fillStyle = '#6a8ad8'; g.fillRect(-15, -27, 30, 52); g.restore(); },
};
Object.assign(OVH.HOLD, EF_HOLD);

// ---------- TOURI: drawTouri(g, o, op) on the 600x1000 card (ground y≈965, centre x=300). A little living iron tower.
// op.expr: 'smile' | 'happy' | 'shock' | 'sad' | 'sly' | 'proud' | 'love' | 'worried' | 'angry'; op.pose: 'stand' | 'wave' | 'cheer' | 'shock' | 'hips' | 'shrug' | 'point'
// op.waves 0..1 radio rings around the tip; op.today = 1 adds a white/red antenna mast on top.
const tEye = (g, x, y, k, E, blink, look) => {
  if (blink >= 1 || E === 'happy') { taper(g, [[x - 12 * k, y + 5 * k], [x, y - 8 * k], [x + 12 * k, y + 5 * k]], 5 * k, INK, 0.35); return; }
  if (E === 'love') { const r = 14 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(hp); return; }
  const sh = E === 'shock', rx = (sh ? 11 : 9) * k, ry = (sh ? 16 : 13) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k, P = ellP(lx, y, rx, ry);
  g.fillStyle = INK; g.fill(P); g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 5 * k, (sh ? 4 : 3.2) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
  g.save(); g.translate(lx - 3 * k, y - 5 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.4 * k, 1.9 * k, 0, 0, TAU); g.lineWidth = 1.2 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  const lid = { proud: 0.45, sly: 0.5, sad: 0.25, angry: 0.35, worried: 0.15 }[E]; if (lid && blink < 0.5) { const yl = y - ry + 2 * ry * lid; g.save(); g.clip(ellP(lx, y, rx + 3, ry + 3)); g.fillStyle = '#f4e4cc'; g.fillRect(lx - rx - 6, y - ry - 8, 2 * rx + 12, yl - (y - ry - 8)); g.restore(); taper(g, [[lx - rx - 2, yl], [lx + rx + 2, yl]], 3 * k, INK, 0.3); } };
const IRON = '#a8503a', IRONS = '#6a2e2a';
export function drawTouri(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, blink = op.blink || 0, look = op.look || 0;
  const pose = op.pose || ({ shock: 'shock', proud: 'hips', worried: 'shrug' }[E]) || 'stand';
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const hopA = pose === 'cheer' ? Math.abs(Math.sin(t * 0.35)) * 20 : 0, bob = Math.sin(t * 0.2) * 3 - hopA, tilt = E === 'sad' ? 0.05 : E === 'shock' ? -0.05 : E === 'sly' ? 0.06 : Math.sin(t * 0.13) * 0.02;
  const col = op.today ? '#8a5e44' : IRON;
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale(flip ? -1 : 1, 1);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 190, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  g.translate(0, bob); g.rotate(tilt);
  // tower silhouette: legs curve from the feet to the tip; profile w(y) (y up, 0 = feet, 800 = tip)
  const w = (y) => 18 + 160 * Math.exp(-y / 210), Y = (y) => -y - 30;
  const side = (s, inner) => { const P = []; for (let i = 0; i <= 24; i++) { const y = i / 24 * 760; P.push([s * (w(y) - (inner ? Math.max(0, 70 - y * 0.32) * (y < 210 ? 1 : 0) : 0)), Y(y)]); } return P; };
  // body fill (outer outline), then an arch cut-out and lattice hatching
  const body = new Path2D(); side(-1).forEach(([x, y], i) => (i ? body.lineTo(x, y) : body.moveTo(x, y))); side(1).reverse().forEach(([x, y]) => body.lineTo(x, y)); body.closePath();
  g.save(); g.translate(10, 6); g.fillStyle = mixc('#2a1a24', '#3a2a7a', 0.3); g.fill(body); g.restore();
  cel(g, body, col, 4, 6, 4, 2);
  g.save(); g.clip(body);
  g.strokeStyle = 'rgba(58,24,30,0.55)'; g.lineWidth = 3; for (let k = -40; k < 40; k++) { g.beginPath(); g.moveTo(k * 26, Y(0)); g.lineTo(k * 26 + 800, Y(800)); g.stroke(); g.beginPath(); g.moveTo(k * 26, Y(0)); g.lineTo(k * 26 - 800, Y(800)); g.stroke(); }
  g.fillStyle = 'rgba(58,42,122,0.22)'; g.fillRect(20, -1000, 400, 1000);
  g.restore();
  // arch between the legs
  const A = new Path2D(); A.moveTo(-108, Y(0) + 2); A.bezierCurveTo(-104, Y(120), -40, Y(170), 0, Y(172)); A.bezierCurveTo(40, Y(170), 104, Y(120), 108, Y(0) + 2); A.closePath(); g.fillStyle = 'rgba(30,20,40,0.0)'; g.save(); g.globalCompositeOperation = 'destination-out'; g.fill(A); g.restore();
  g.lineWidth = 4; g.strokeStyle = INK; g.stroke(A);
  // platforms (first / second / top) as dark bands with railings
  for (const [y, hgt] of [[200, 34], [380, 22], [690, 18]]) { const ww = w(y) + 14, P = new Path2D(); P.roundRect(-ww, Y(y) - hgt / 2, 2 * ww, hgt, 4); cel(g, P, mixc(col, '#2a1a24', 0.35), 3, 3, 2, 1); g.strokeStyle = 'rgba(255,230,190,0.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-ww + 6, Y(y) - hgt / 2 + 4); g.lineTo(ww - 6, Y(y) - hgt / 2 + 4); g.stroke(); }
  // tip: lantern + flagpole or (today) a striped antenna mast
  const tipY = Y(760); cel(g, ellP(0, tipY - 8, 14, 12), '#f0d080', 2.6, 0, 0, 0);
  if (op.today) { for (let i = 0; i < 5; i++) { const P = new Path2D(); P.rect(-7, tipY - 22 - (i + 1) * 22, 14, 22); cel(g, P, i % 2 ? '#e8402a' : '#f4f0e8', 2.4, 0, 0, 0); } }
  else { line(g, [[0, tipY - 16], [0, tipY - 90]], 4, INK); const F = new Path2D(); F.rect(2, tipY - 90, 42, 28); g.save(); g.clip(F); ['#2a4aa8', '#f4f0e8', '#d8302a'].forEach((c, i) => { g.fillStyle = c; g.fillRect(2 + i * 14 + Math.sin(t * 0.3 + i) * 1.5, tipY - 92 - Math.sin(t * 0.25 + i) * 2, 15, 34); }); g.restore(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(F); }
  // radio rings
  if (op.waves) { const a = op.waves; for (let i = 0; i < 3; i++) { const ph = ((t * 0.04 + i / 3) % 1), r = 30 + ph * 150; g.globalAlpha = a * (1 - ph) * 0.9; g.lineWidth = 7; g.strokeStyle = '#7ae0ff'; g.beginPath(); g.arc(0, tipY - 40, r, -Math.PI * 0.85, -Math.PI * 0.15); g.stroke(); g.lineWidth = 3; g.strokeStyle = '#ffffff'; g.stroke(); } g.globalAlpha = 1; }
  // face panel between the first and second platforms
  const fy = Y(290), FP = new Path2D(); FP.roundRect(-92, fy - 74, 184, 150, 40); g.fillStyle = 'rgba(244,228,204,0.96)'; g.fill(FP); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(FP);
  const ex = 40, k = 1.15, ey = fy - 8;
  for (const s of [-1, 1]) tEye(g, s * ex + look * 6, ey, k, E, blink, look);
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -14, -8], sad: [-10, -2, 8], worried: [-10, -4, 6], sly: [8, 2, 0], love: [0, -6, 0], angry: [-10, 4, 12] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = ey - 34; taper(g, [[s * (ex - 15), by + BR[0]], [s * ex, by + BR[1]], [s * (ex + 15), by + BR[2]]], 5.4, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 24), ey + 30, 14, 8, 0, 0, TAU); g.fillStyle = 'rgba(255,120,150,0.75)'; g.fill(); }
  const my = ey + 44, MC = '#7a2238';
  if (E === 'shock') { const p = ellP(0, my + 2, 10, 13); g.fillStyle = MC; g.fill(p); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad' || E === 'angry' || E === 'worried') taper(g, arcPts(0, my + 14, 13, Math.PI * 1.2, Math.PI * 1.8, 8), 4, INK, 0.3);
  else if (E === 'happy' || E === 'love') { const p = new Path2D(); p.moveTo(-18, my - 4); p.bezierCurveTo(-7, my, 7, my, 18, my - 4); p.bezierCurveTo(14, my + 16, -14, my + 16, -18, my - 4); g.fillStyle = MC; g.fill(p); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'proud' || E === 'sly') taper(g, [[-13, my], [4, my + 6], [17, my - 6]], 4, INK, 0.3);
  else taper(g, arcPts(0, my - 9, 16, Math.PI * 0.2, Math.PI * 0.8, 10), 4, INK, 0.3);
  if (E === 'shock' || E === 'worried') { g.beginPath(); const sx = 84, sy = fy - 90; g.moveTo(sx, sy); g.quadraticCurveTo(sx + 13, sy + 22, sx, sy + 28); g.quadraticCurveTo(sx - 13, sy + 22, sx, sy); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke(); }
  if (E === 'sad') { g.beginPath(); g.ellipse(-ex - 4, ey + 26 + (t % 20), 5, 8, 0, 0, TAU); g.fillStyle = '#9fd8ff'; g.fill(); }
  // arms from the first platform, chunky shoes at the feet
  for (const s of [-1, 1]) { const S = [s * (w(200) + 8), Y(200)]; let E3, Hd;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const wv = pose === 'wave' ? Math.sin(t * 0.5) * 16 : Math.sin(t * 0.4 + s) * 6; E3 = [S[0] + s * 50, S[1] - 50]; Hd = [S[0] + s * 56 + wv, S[1] - 116]; }
    else if (pose === 'shock') { E3 = [S[0] + s * 54, S[1] - 10]; Hd = [S[0] + s * 58, S[1] - 76]; }
    else if (pose === 'hips') { E3 = [S[0] + s * 46, S[1] + 40]; Hd = [S[0] + s * 4, S[1] + 70]; }
    else if (pose === 'shrug') { E3 = [S[0] + s * 50, S[1] + 22]; Hd = [S[0] + s * 92, S[1] - 18]; }
    else if (pose === 'point' && s > 0) { E3 = [S[0] + 60, S[1] - 14]; Hd = [S[0] + 116, S[1] - 50]; }
    else { E3 = [S[0] + s * 26, S[1] + 56]; Hd = [S[0] + s * 30, S[1] + 108]; }
    cel(g, limb([S, E3, Hd], [13, 12, 11]), '#3a2a3a', 2.6, 4, 3, 2); cel(g, ellP(Hd[0], Hd[1], 18, 16), '#f2f2f6', 2.6, 4, 3, 2); }
  for (const s of [-1, 1]) cel(g, ellP(s * (w(0) - 18) + s * 8, -16, 40, 18), '#2a1a24', 2.8, 5, 3, 2);
  g.restore(); }

// ---------- lineup (?efcast=N)
const KT = [
  { d: 7.0, a: [['EF_EIFFEL', { expr: 'proud', prop: 'document', docText: ['PERMIT', '1889-1909'] }], ['EF_CLERK', { expr: 'smug', prop: 'stamp' }], ['EF_PAINTER', { expr: 'angry', prop: 'palette' }], ['EF_WRITER', { expr: 'angry', prop: 'quill' }], ['EF_COMPOSER', { expr: 'smug' }], ['TOURI', { expr: 'happy', pose: 'wave' }]] },
  { d: 7.0, a: [['EF_LADY', { expr: 'surprised' }], ['EF_GRUMP', { expr: 'angry' }], ['EF_WORKER', { expr: 'determined', prop: 'sledge' }], ['EF_SOLDIER', { expr: 'happy', prop: 'moneybag', coins: 1 }], ['EF_OPER', { expr: 'thoughtful', prop: 'pen' }], ['TOURI', { expr: 'shock' }]] },
  { d: 6.0, a: [['EF_TOUR1', { expr: 'excited', prop: 'snap' }], ['EF_TOUR2', { expr: 'laugh' }], ['EF_KID', { expr: 'excited' }], ['TOURI', { expr: 'sad' }], ['TOURI', { expr: 'love', pose: 'cheer', waves: 1, today: 1 }]] },
];
export function efTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'TOURI' ? 0.5 : o === 'EF_KID' ? 0.8 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
