// [BW-cast] "Bubble Wrap was invented as wallpaper": outfit table (merged into ODD by main.js), props (into oddverra's HOLD), POPPY (a single
// bubble mascot, drawPoppy on the 600x1000 card: op.pop 0..1 bursts it, op.squash bounces it) and a lineup (?bwcast=N with any set view flag).
// The two inventors are invented looks (no likeness intended); every other person is a generic period type.
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, smooth, ellP, limb, arcPts, mixc, polyPath, hsh } = OVK;
const TAU = Math.PI * 2;

export const BW_ODD = {
  BW_AL: { shirt: '#f4f0e6', pants: '#4a5a7a', collar: '#ffffff', cuff: '#f4f0e6', neck: 'tie', neckCol: '#c8402e', tieK: 0.8, rolled: true, glasses: true, pocket: true,
    hair: 'side', hairCol: '#5a3a22', brow: '#5a3a22', build: 'adult', head: 'egg', skin: '#f2c8a4', shoes: '#3a2a20', belt: true },
  BW_MARC: { waistcoat: true, shirt: '#dcd4c0', pants: '#6a5444', collar: '#ffffff', cuff: '#dcd4c0', neck: 'bow', neckCol: '#2a6a9a', button: '#2a2020', rolled: true,
    hair: 'curly', hairCol: '#2a1c16', moustache: '#2a1c16', brow: '#2a1c16', build: 'thin', head: 'tall', skin: '#ecc0a0', shoes: '#2a1a14' },
  BW_MOM: { lashes: true, dress: true, shirt: '#3ab0a8', pants: '#3ab0a8', pattern: 'dots', dotCol: '#ffffff', collar: '#ffffff', cuff: '#ffffff', apron: '#fff4f0', hair: 'curly', hairCol: '#a8502a',
    head: 'round', skin: '#f6d0b0', shoes: '#c83a4a', earring: '#f8f2e8' },
  BW_GARD: { shirt: '#d8c890', pants: '#4a6a3a', pattern: 'plaid', suspenders: '#5a3a24', rolled: true, hat: 'straw', hatCol: '#e8d090', bandCol: '#4a6a3a', hair: 'short', hairCol: '#c8c4c0',
    moustache: '#d8d4d0', brow: '#b8b4b0', build: 'stout', head: 'wide', skin: '#e8b48a', shoes: '#4a3020', age: 'old', noButtons: true },
  BW_BUY: { coat: true, shirt: '#2e3a52', pants: '#2e3a52', collar: '#ffffff', cuff: '#ffffff', neck: 'tie', neckCol: '#3a7ac8', tieK: 0.85, button: '#c8c8d0', glasses: true, hat: 'fedora', hatCol: '#3a4048', bandCol: '#1a1a20',
    hair: 'crew', hairCol: '#4a3020', brow: '#4a3020', build: 'adult', head: 'wide', skin: '#f0c4a0', shoes: '#14121a' },
  BW_MOVE1: { shirt: '#3a7ab8', pants: '#3a3a4a', rolled: true, hat: 'cap', hatCol: '#e8c040', plainCap: true, hair: 'short', hairCol: '#2a1a12', build: 'stout', head: 'round', skin: '#c98a5e', shoes: '#3a2a20', noButtons: true, belt: true },
  BW_MOVE2: { shirt: '#d8743a', pants: '#3a4a5a', suspenders: '#3a3a4a', rolled: true, hat: 'cap', hatCol: '#3a5a8a', plainCap: true, hair: 'short', hairCol: '#c89040', moustache: '#c89040', build: 'adult', head: 'egg', skin: '#f2c8a4', shoes: '#3a2a20', noButtons: true },
  BW_KID: { hoodie: true, shirt: '#f2b83a', pants: '#3a5aa8', cuff: '#f2b83a', hair: 'spiky', hairCol: '#2a1a14', build: 'kid', head: 'round', skin: '#e8b48a', shoes: '#f2f2f2', sneakers: true, noButtons: true },
};
const BW_OPS = ['pop', 'squash', 'droop', 'wrapped'];
export const bwOpts = (op) => { const r = {}; for (const k of BW_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props ----------
const bubbleGrid = (g, x0, y0, w, h, r, col = 'rgba(220,240,255,0.9)') => { for (let y = y0 + r * 1.2; y < y0 + h - r * 0.6; y += r * 2.3) for (let x = x0 + r * 1.2 + ((Math.round((y - y0) / (r * 2.3)) % 2) * r * 1.15); x < x0 + w - r * 0.6; x += r * 2.3) {
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = col; g.fill(); g.lineWidth = 1.6; g.strokeStyle = 'rgba(70,110,170,0.7)'; g.stroke(); g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.28, 0, TAU); g.fillStyle = '#ffffff'; g.fill(); } };
export const BW_HOLD = {
  bwsheet: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 20, -120); g.rotate(s * 0.08); const P = new Path2D(); P.roundRect(-80, -70, 160, 140, 10); g.fillStyle = 'rgba(200,232,255,0.75)'; g.fill(P);
    g.save(); g.clip(P); bubbleGrid(g, -80, -70, 160, 140, 11); g.restore(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(P); g.restore(); },
  bwroll: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 26, -70); g.rotate(s * -0.25); const b = new Path2D(); b.roundRect(-38, -120, 76, 180, 30); cel(g, b, '#d2ecfc', 3.6, 8, 6, 3);
    g.save(); g.clip(b); bubbleGrid(g, -38, -120, 76, 180, 8, 'rgba(240,250,255,0.9)'); g.restore(); cel(g, ellP(0, -112, 36, 13), '#eef8ff', 3, 2, 2, 0); taper(g, arcPts(0, -112, 20, 0, TAU * 1.5, 16, 7), 2.2, '#7aa8d8', 0.3); g.restore(); },
  plant: (g, op = {}) => { const s = OVH.HSIDE, d = op.droop || 0; g.save(); g.translate(s * 10, -40); const pot = polyPath([[-40, -60], [40, -60], [30, 10], [-30, 10]]); cel(g, pot, '#c8683a', 3.6, 6, 4, 2);
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.45, L = 70 + 20 * hsh(i, 3), tx = Math.cos(a + d * (i - 2 >= 0 ? 1.1 : -1.1)) * L, ty = -60 + Math.sin(a) * L * (1 - d * 0.9) + d * 40;
      taper(g, [[0, -58], [tx * 0.5, -60 + (ty + 60) * 0.6], [tx, ty]], 6, d > 0.5 ? '#8a8a3a' : '#3a8a3a', 0.4); cel(g, ellP(tx, ty, 18, 10, a), d > 0.5 ? '#a8a04a' : '#4aa84a', 2.4, 3, 2, 0); }
    if (op.wrapped) { const w = new Path2D(); w.roundRect(-46, -66, 92, 80, 12); g.fillStyle = 'rgba(210,236,255,0.55)'; g.fill(w); g.save(); g.clip(w); bubbleGrid(g, -46, -66, 92, 80, 8); g.restore(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(w); }
    g.restore(); },
  wcan: (g) => { const s = OVH.HSIDE; g.save(); g.scale(s, 1); g.translate(10, -40); const b = new Path2D(); b.roundRect(-40, -60, 80, 70, 10); cel(g, b, '#5a8ab0', 3.6, 6, 4, 2);
    taper(g, [[36, -30], [90, -80]], 10, '#4a7aa0', 0.3); cel(g, ellP(94, -84, 12, 8, -0.7), '#4a7aa0', 2.4, 2, 2, 0); taper(g, arcPts(-10, -60, 30, Math.PI, TAU, 10), 7, '#3a6a90', 0.3); g.restore(); },
  crowbar: (g) => { const s = OVH.HSIDE; g.save(); g.scale(s, 1); g.rotate(-0.4); taper(g, [[0, 20], [0, -150], [16, -164]], 9, '#c83a2a', 0.2); g.restore(); },
  clipboard: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 16, -90); g.rotate(s * 0.1); const b = new Path2D(); b.roundRect(-52, -70, 104, 140, 8); cel(g, b, '#a8763e', 3.4, 4, 3, 2);
    const p = new Path2D(); p.rect(-42, -56, 84, 118); cel(g, p, '#fbf6ea', 2.4, 2, 2, 0); g.fillStyle = 'rgba(60,60,90,0.6)'; for (let i = 0; i < 6; i++) g.fillRect(-34, -40 + i * 16, 60 - (i % 3) * 12, 4);
    const c = new Path2D(); c.roundRect(-18, -78, 36, 16, 4); cel(g, c, '#b8bcc8', 2.4, 2, 2, 0); g.restore(); },
};
Object.assign(OVH.HOLD, BW_HOLD);

// ---------- POPPY: a single round bubble with a face. drawPoppy(g, o, op) on the 600x1000 card (ground y≈965, centre x=300)
// op.expr: 'smile' | 'happy' | 'shock' | 'sad' | 'sly' | 'love' | 'dizzy'; op.pose: 'stand' | 'wave' | 'cheer' | 'point' | 'shrug' | 'shock'
// op.pop 0..1 (0 whole, >0 burst: rim splits into shards + POP star; at 1 only a puff and two little feet), op.squash -1..1, op.flip, op.look, op.blink, op.t
const pEye = (g, x, y, k, E, blink, look) => {
  if (blink >= 1 || E === 'happy') { taper(g, [[x - 13 * k, y + 5 * k], [x, y - 9 * k], [x + 13 * k, y + 5 * k]], 6 * k, INK, 0.35); return; }
  if (E === 'dizzy') { taper(g, arcPts(x, y, 11 * k, 0, TAU * 1.6, 18), 4 * k, INK, 0.3); return; }
  if (E === 'love') { const r = 15 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 3 * k; g.strokeStyle = INK; g.stroke(hp); return; }
  const sh = E === 'shock', rx = (sh ? 14 : 11) * k, ry = (sh ? 19 : 16) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 5 * k, P = ellP(lx, y, rx, ry);
  g.fillStyle = INK; g.fill(P);
  g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3.5 * k, y - 6 * k, (sh ? 4.4 : 3.6) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.beginPath(); g.arc(lx + 3.5 * k, y + 6 * k, 1.6 * k, 0, TAU); g.fill(); g.restore();
  g.save(); g.translate(lx - 3.5 * k, y - 6 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 7.4 * k, 2.1 * k, 0, 0, TAU); g.lineWidth = 1.3 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  const lid = { sly: 0.5, sad: 0.25 }[E]; if (lid && blink < 0.5) { const yl = y - ry + 2 * ry * lid; g.save(); g.clip(ellP(lx, y, rx + 3, ry + 3)); g.fillStyle = '#dff1ff'; g.fillRect(lx - rx - 4, y - ry - 6, 2 * rx + 8, yl - (y - ry - 6)); g.restore(); taper(g, [[lx - rx - 2, yl], [lx + rx + 2, yl]], 3.4 * k, INK, 0.3); } };
export function drawPoppy(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, sc = op.scale || 1, blink = op.blink || 0, look = op.look || 0, pop = op.pop || 0;
  const pose = op.pose || ({ shock: 'shock' }[E]) || 'stand';
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const sq = (op.squash || 0) + 0.03 * Math.sin(t * 0.25), hop = pose === 'cheer' ? Math.abs(Math.sin(t * 0.35)) * 26 : 0;
  g.save(); g.translate(300, 965); g.scale((flip ? -1 : 1) * sc, sc);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 170, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  // feet
  for (const s of [-1, 1]) cel(g, ellP(s * 70, -18, 46, 22), '#3a8ad8', 3, 5, 3, 2);
  const R = 205, cy = -60 - R * (1 - sq * 0.25) - hop, rx = R * (1 + sq * 0.18), ry = R * (1 - sq * 0.22);
  if (pop >= 1) { // only a puff of air and the shoes left
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + 0.3, d = 90 + 30 * hsh(i, 2); g.globalAlpha = 0.55; cel(g, ellP(Math.cos(a) * d * 0.9, cy + Math.sin(a) * d * 0.6, 50, 36), '#eef6ff', 2, 4, 3, 0); g.globalAlpha = 1; }
    g.restore(); return; }
  // stubby legs
  for (const s of [-1, 1]) taper(g, [[s * 62, cy + ry * 0.86], [s * 68, -24]], 16, INK, 0.2), taper(g, [[s * 62, cy + ry * 0.86], [s * 68, -26]], 10, '#bfe2fb', 0.2);
  // arms (behind / beside the bubble)
  const ARM = (s) => { const S = [s * rx * 0.92, cy + ry * 0.15]; let E2, H2;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 18 : Math.sin(t * 0.4 + s) * 8; E2 = [S[0] + s * 50, S[1] - 70]; H2 = [S[0] + s * 46 + w, S[1] - 140]; }
    else if (pose === 'shock') { E2 = [S[0] + s * 60, S[1] - 30]; H2 = [S[0] + s * 70, S[1] - 100]; }
    else if (pose === 'shrug') { E2 = [S[0] + s * 56, S[1] + 20]; H2 = [S[0] + s * 96, S[1] - 30]; }
    else if (pose === 'point' && s > 0) { E2 = [S[0] + 60, S[1] - 20]; H2 = [S[0] + 120, S[1] - 50]; }
    else { E2 = [S[0] + s * 34, S[1] + 60]; H2 = [S[0] + s * 30, S[1] + 120]; }
    cel(g, limb([S, E2, H2], [15, 14, 13]), '#cfeafc', 2.6, 4, 3, 2); cel(g, ellP(H2[0], H2[1], 19, 17), '#cfeafc', 2.6, 4, 3, 2); };
  // body: glossy translucent bubble
  const B = ellP(0, cy, rx, ry);
  if (pop > 0) { // bursting: jagged shards fly outward, POP star
    const k = pop; g.save(); g.translate(0, cy);
    const st = new Path2D(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = (i % 2 ? 150 : 300) * (0.6 + 0.6 * k); i ? st.lineTo(Math.cos(a) * r, Math.sin(a) * r) : st.moveTo(Math.cos(a) * r, Math.sin(a) * r); } st.closePath();
    g.globalAlpha = 1 - k * 0.6; cel(g, st, '#fff3b0', 5, 6, 4, 0); g.globalAlpha = 1;
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + hsh(i, 1), d = R * (0.9 + 1.2 * k), x = Math.cos(a) * d, y = Math.sin(a) * d; g.save(); g.translate(x, y); g.rotate(a + k * 3);
      const sh = polyPath([[-26, -8], [24, -14], [10, 12]]); g.globalAlpha = 1 - k * 0.5; cel(g, sh, '#d8eefc', 3, 3, 2, 0); g.globalAlpha = 1; g.restore(); }
    g.font = 'bold 150px "Luckiest Guy", "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 18; g.strokeStyle = INK; g.lineJoin = 'round'; g.save(); g.rotate(-0.12); g.scale(0.8 + 0.4 * k, 0.8 + 0.4 * k); g.strokeText('POP!', 0, 0); g.fillStyle = '#ff5a7a'; g.fillText('POP!', 0, 0); g.restore();
    g.restore(); g.restore(); return; }
  ARM(-1); ARM(1);
  const gr = g.createRadialGradient(-rx * 0.35, cy - ry * 0.4, R * 0.1, 0, cy, R * 1.05); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, '#e6f5ff'); gr.addColorStop(0.8, '#b8dcfa'); gr.addColorStop(1, '#9ac8f2');
  g.fillStyle = gr; g.fill(B);
  // iridescent rim + rim light
  g.save(); g.clip(B); g.lineWidth = 26; g.strokeStyle = 'rgba(255,170,220,0.35)'; g.beginPath(); g.ellipse(0, cy, rx - 8, ry - 8, 0, Math.PI * 0.1, Math.PI * 0.9); g.stroke();
  g.strokeStyle = 'rgba(150,230,200,0.35)'; g.beginPath(); g.ellipse(0, cy, rx - 8, ry - 8, 0, Math.PI * 1.05, Math.PI * 1.5); g.stroke(); g.restore();
  g.lineWidth = 6; g.strokeStyle = INK; g.stroke(B);
  // highlights
  g.save(); g.translate(-rx * 0.45, cy - ry * 0.5); g.rotate(-0.6); g.beginPath(); g.ellipse(0, 0, 62, 26, 0, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.95)'; g.fill(); g.restore();
  g.beginPath(); g.arc(-rx * 0.15, cy - ry * 0.74, 12, 0, TAU); g.fillStyle = '#fff'; g.fill();
  g.beginPath(); g.ellipse(rx * 0.5, cy + ry * 0.55, 40, 14, -0.6, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fill();
  // face
  const fy = cy + 10, ex = 58, k = 1.3;
  for (const s of [-1, 1]) pEye(g, s * ex + look * 8, fy, k, E, blink, look);
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], shock: [-4, -14, -8], sad: [-12, -2, 9], sly: [8, 2, 0], love: [0, -6, 0], dizzy: [-2, -6, -2] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = fy - 36; taper(g, [[s * (ex - 14), by + BR[0]], [s * ex, by + BR[1]], [s * (ex + 15), by + BR[2]]], 5.5, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 30), fy + 30, 17, 9, 0, 0, TAU); g.fillStyle = 'rgba(255,130,160,0.75)'; g.fill(); }
  const my = fy + 38, MC = '#5a1e30';
  if (E === 'shock') { const p = ellP(0, my + 6, 11, 15); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad') taper(g, arcPts(0, my + 16, 15, Math.PI * 1.2, Math.PI * 1.8, 8), 4, INK, 0.3);
  else if (E === 'happy' || E === 'love') { const p = new Path2D(); p.moveTo(-18, my - 4); p.bezierCurveTo(-8, my + 1, 8, my + 1, 18, my - 4); p.bezierCurveTo(15, my + 15, -15, my + 15, -18, my - 4); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sly') taper(g, [[-14, my], [5, my + 7], [19, my - 6]], 4, INK, 0.3);
  else taper(g, arcPts(0, my - 10, 17, Math.PI * 0.2, Math.PI * 0.8, 10), 4, INK, 0.3);
  if (E === 'shock' || E === 'sad') { g.beginPath(); g.moveTo(rx * 0.7, cy - ry * 0.7); g.quadraticCurveTo(rx * 0.7 + 12, cy - ry * 0.7 + 22, rx * 0.7, cy - ry * 0.7 + 28); g.quadraticCurveTo(rx * 0.7 - 12, cy - ry * 0.7 + 22, rx * 0.7, cy - ry * 0.7); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); }
  g.restore(); }

// ---------- [BW-cast] lineup (?bwcast=N) ----------
const KT = [
  { d: 7.0, a: [['BW_AL', { expr: 'happy', prop: 'bwsheet', raise: 1, reach: 0.9 }], ['BW_MARC', { expr: 'excited', prop: 'bwroll', reach: 0.8 }], ['BW_MOM', { expr: 'angry' }], ['BW_GARD', { expr: 'sad', prop: 'plant', droop: 1, reach: 0.7 }], ['POPPY', { expr: 'happy', pose: 'wave' }]] },
  { d: 7.0, a: [['BW_BUY', { expr: 'worried', prop: 'clipboard', reach: 0.6 }], ['BW_MOVE1', { expr: 'grin', prop: 'crowbar', reach: 0.7 }], ['BW_MOVE2', { expr: 'smile' }], ['BW_KID', { expr: 'laugh', prop: 'bwsheet', raise: 1, reach: 0.9 }], ['POPPY', { expr: 'shock', pop: 0.4 }]] },
  { d: 4.0, a: [['POPPY', { expr: 'smile' }], ['POPPY', { expr: 'sad', pose: 'shrug' }], ['POPPY', { expr: 'sly' }], ['POPPY', { pop: 1 }]] },
];
export function bwTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'POPPY' ? 0.5 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
