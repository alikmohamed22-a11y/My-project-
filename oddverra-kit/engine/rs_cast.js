// [RS-cast] "Mount Rushmore was never finished": outfit table (merged into ODD by main.js), props (into oddverra's HOLD),
// PEBB (a little living granite pebble chipped off the mountain, the sidekick; drawPebb on the 600x1000 card) and a cast lineup (?rscast=N).
// Gutzon and Lincoln Borglum are our own stylizations; workers, tourists and the 1998 crew are invented generic designs. No park logos.
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, line, ellP, limb, arcPts, mixc } = OVK;
const TAU = Math.PI * 2;

export const RS_ODD = {
  RS_GUTZ: { coat: true, shirt: '#5a4a3a', pants: '#5a4a3a', collar: '#f2ece0', cuff: '#5a4a3a', neck: 'tie', neckCol: '#7a2a2a', button: '#2a2020', noChain: true,
    hat: 'wide', hatCol: '#7a6a52', hair: 'bald', brow: '#6a5a50', moustache: '#8a7a6a', build: 'stout', head: 'round', skin: '#e4a882', shoes: '#2a1e18' },      // Gutzon Borglum: big hat, walrus moustache
  RS_GUTZ0: { coat: true, shirt: '#5a4a3a', pants: '#5a4a3a', collar: '#f2ece0', cuff: '#5a4a3a', neck: 'tie', neckCol: '#7a2a2a', button: '#2a2020', noChain: true,
    hair: 'bald', brow: '#6a5a50', moustache: '#8a7a6a', build: 'stout', head: 'round', skin: '#e4a882', shoes: '#2a1e18' },      // same, hat off (night, studio)
  RS_LINC: { shirt: '#c8b890', rolled: true, pants: '#4a4a40', belt: true, hat: 'wide', hatCol: '#5a4a38', hair: 'short', hairCol: '#4a3426', brow: '#4a3426',
    build: 'thin', head: 'tall', skin: '#e8b48a', shoes: '#3a2a20', noButtons: true },                                                                   // Lincoln Borglum, the son (1941)
  RS_WORK1: { shirt: '#3a5a8a', rolled: true, pants: '#5a4a3a', belt: true, hat: 'cap', hatCol: '#6a5a48', plainCap: true, hair: 'short', hairCol: '#2a1a12', brow: '#2a1a12',
    build: 'adult', head: 'wide', skin: '#dca07a', shoes: '#3a2a20', noButtons: true },
  RS_WORK2: { shirt: '#8a4a3a', rolled: true, pants: '#3a3a44', belt: true, hat: 'slouch', hatCol: '#4a4a42', hair: 'short', hairCol: '#5a3a22', brow: '#5a3a22', moustache: '#5a3a22',
    build: 'stout', head: 'round', skin: '#e4aa82', shoes: '#2a2020', noButtons: true },
  RS_WORK3: { shirt: '#d8c8a0', rolled: true, pants: '#3a4a5a', belt: true, hat: 'fedora', hatCol: '#3a3a40', hair: 'short', hairCol: '#1a1410', brow: '#1a1410',
    build: 'thin', head: 'egg', skin: '#d89a6a', shoes: '#2a2020', noButtons: true },
  RS_TOUR: { shirt: '#e85a3a', pants: '#3a4a6a', hat: 'cap', hatCol: '#2a6ab8', plainCap: true, hair: 'short', hairCol: '#3a2214', brow: '#3a2214', build: 'kid', head: 'round', skin: '#f0c098', shoes: '#f0f0f6', noButtons: true },
  RS_MOM: { lashes: true, shirt: '#3a8a7a', pants: '#3a3a4a', hair: 'long', hairCol: '#6a3a1a', head: 'egg', skin: '#e8b48a', shoes: '#f0f0f4', earring: true, noButtons: true },
  RS_CREW: { shirt: '#5a6a4a', pants: '#4a4a40', belt: true, hat: 'wide', hatCol: '#8a7a5a', hair: 'short', hairCol: '#4a3426', brow: '#4a3426', moustache: '#4a3426',
    build: 'adult', head: 'egg', skin: '#e0a880', shoes: '#2a2020', noButtons: true },                                                                   // 1998 crew
  RS_FAM: { lashes: true, cardigan: true, shirt: '#8a4a6a', pants: '#3a3a4a', collar: '#f2e8e0', hair: 'bun', hairCol: '#c8c8cc', head: 'egg', build: 'old', skin: '#f0c6a0', shoes: '#2a2022', earring: true, glasses: true, noButtons: true },
};
const RS_OPS = ['drill'];
export const rsOpts = (op) => { const r = {}; for (const k of RS_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props
const RS_HOLD = {
  // pneumatic jackhammer drill: op.drill = frame for the shake + dust
  drill: (g, op = {}) => { const s = OVH.HSIDE, j = Math.sin((op.drill || 0) * 2.7) * 3; g.save(); g.translate(s * 20 + j, -30); g.rotate(s * 1.15);
    const B = new Path2D(); B.roundRect(-16, -70, 32, 88, 8); cel(g, B, '#5a5a64', 3, 4, 3, 2); cel(g, ellP(0, -74, 22, 10), '#3a3a44', 2.4, 2, 1, 0);
    line(g, [[0, 18], [0, 92]], 9, INK); line(g, [[0, 18], [0, 92]], 5, '#b8bcc6'); line(g, [[-6, -60], [-40, -100]], 7, INK); line(g, [[-6, -60], [-40, -100]], 4, '#2a2a30');
    for (let k = 0; k < 3; k++) { const a = (op.drill || 0) * 0.9 + k * 2.1; g.globalAlpha = 0.55; g.fillStyle = '#d8d0c4'; g.beginPath(); g.arc(Math.sin(a) * 14, 100 + Math.abs(Math.cos(a)) * 12, 9 + k * 3, 0, TAU); g.fill(); g.globalAlpha = 1; }
    g.restore(); },
  // rolled plans
  plans: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 20, -50); g.rotate(s * 0.5); const P = new Path2D(); P.roundRect(-14, -90, 28, 150, 10); cel(g, P, '#4a7ac8', 3, 4, 3, 2); cel(g, ellP(0, -90, 14, 6), '#e8eef8', 2, 0, 0, 0); g.restore(); },
  // white enamel history panel (1998)
  panel: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 26, -60); const P = new Path2D(); P.roundRect(-46, -66, 92, 120, 6); cel(g, P, '#f4f2ec', 3, 2, 1, 0);
    g.fillStyle = '#2a3a6a'; g.fillRect(-36, -54, 72, 12); g.fillStyle = 'rgba(40,40,60,0.6)'; for (let i = 0; i < 6; i++) g.fillRect(-36, -32 + i * 13, i % 3 === 2 ? 44 : 72, 5); g.restore(); },
  gutzhat: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 22, -40); cel(g, ellP(0, 10, 58, 14), '#7a6a52', 3, 3, 2, 1); const C = new Path2D(); C.roundRect(-32, -36, 64, 44, 14); cel(g, C, '#7a6a52', 3, 3, 2, 1); g.fillStyle = '#3a2a20'; g.fillRect(-32, -2, 64, 9); g.restore(); },
};
Object.assign(OVH.HOLD, RS_HOLD);

// ---------- PEBB: drawPebb(g, o, op) on the 600x1000 card (ground y≈965, centre x=300). A granite pebble with a face, stubby arms and feet.
// op.expr: 'smile' | 'happy' | 'shock' | 'sad' | 'sly' | 'proud' | 'love' | 'angry' | 'worried'; op.pose: 'stand' | 'wave' | 'cheer' | 'point' | 'shrug' | 'hips' | 'shock' | 'tap'
const pEye = (g, x, y, k, E, blink, look) => {
  if (blink >= 1 || E === 'happy') { taper(g, [[x - 13 * k, y + 5 * k], [x, y - 9 * k], [x + 13 * k, y + 5 * k]], 5.5 * k, INK, 0.35); return; }
  if (E === 'love') { const r = 15 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(hp); return; }
  const sh = E === 'shock', rx = (sh ? 12 : 9.5) * k, ry = (sh ? 17 : 14) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k, P = ellP(lx, y, rx, ry);
  g.fillStyle = INK; g.fill(P); g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 6 * k, (sh ? 4 : 3.4) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
  g.save(); g.translate(lx - 3 * k, y - 6 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.8 * k, 2 * k, 0, 0, TAU); g.lineWidth = 1.2 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  const lid = { proud: 0.45, sly: 0.5, sad: 0.25, angry: 0.35, worried: 0.2 }[E]; if (lid && blink < 0.5) { const yl = y - ry + 2 * ry * lid; g.save(); g.clip(ellP(lx, y, rx + 3, ry + 3)); g.fillStyle = '#b8b2aa'; g.fillRect(lx - rx - 6, y - ry - 8, 2 * rx + 12, yl - (y - ry - 8)); g.restore(); taper(g, [[lx - rx - 2, yl], [lx + rx + 2, yl]], 3 * k, INK, 0.3); } };
export function drawPebb(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, blink = op.blink || 0, look = op.look || 0;
  const pose = op.pose || ({ shock: 'shock', proud: 'hips' }[E]) || 'stand';
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const hopA = pose === 'cheer' ? Math.abs(Math.sin(t * 0.35)) * 26 : 0, bob = Math.sin(t * 0.2) * 4 - hopA, tilt = E === 'sad' ? 0.06 : E === 'shock' ? -0.05 : E === 'sly' ? 0.08 : Math.sin(t * 0.13) * 0.03;
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale(flip ? -1 : 1, 1);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 170, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  const tap = pose === 'tap' ? Math.max(0, Math.sin(t * 0.6)) * 14 : 0;
  for (const s of [-1, 1]) { const fx = s * 62; cel(g, limb([[fx, -90 + bob], [fx + s * 6, -26 - (s > 0 ? tap : 0)]], [16, 14]), '#6a6460', 2.6, 3, 2, 1); cel(g, ellP(fx + s * 12, -16 - (s > 0 ? tap : 0), 38, 17), '#3a3436', 2.8, 5, 3, 2); }
  g.translate(0, bob); g.rotate(tilt);
  // body: lumpy granite pebble
  const CY = -250, R = 200, P = new Path2D(); const N = 40;
  for (let i = 0; i <= N; i++) { const a = i / N * TAU, r = R * (1 + 0.06 * Math.sin(a * 3 + 1.3) + 0.04 * Math.sin(a * 5 + 0.4)), x = Math.cos(a) * r * 1.02, y = CY + Math.sin(a) * r * 0.86; i ? P.lineTo(x, y) : P.moveTo(x, y); } P.closePath();
  cel(g, P, '#b8b2aa', 5, 18, 12, 6);
  g.save(); g.clip(P); for (let i = 0; i < 90; i++) { const a = Math.sin(i * 12.9898) * 43758.5453 % 1, b = Math.sin(i * 78.233) * 12543.21 % 1; g.fillStyle = i % 3 ? 'rgba(60,54,60,0.45)' : 'rgba(250,246,240,0.6)'; g.beginPath(); g.arc(a * 360, CY + b * 300, 3 + (i % 4), 0, TAU); g.fill(); }
  // chisel facets (hint it was carved off the mountain)
  g.strokeStyle = 'rgba(60,50,70,0.35)'; g.lineWidth = 4; g.beginPath(); g.moveTo(-150, CY - 90); g.lineTo(-60, CY - 150); g.moveTo(110, CY - 140); g.lineTo(170, CY - 40); g.stroke(); g.restore();
  const ex = 62, k = 1.35, ey = CY - 20;
  for (const s of [-1, 1]) pEye(g, s * ex + look * 6, ey, k, E, blink, look);
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -14, -8], sad: [-10, -2, 8], sly: [8, 2, 0], love: [0, -6, 0], angry: [-10, 4, 12], worried: [-8, -10, 6] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = ey - 46; taper(g, [[s * (ex - 20), by + BR[0]], [s * ex, by + BR[1]], [s * (ex + 20), by + BR[2]]], 7, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 34), ey + 42, 19, 10, 0, 0, TAU); g.fillStyle = 'rgba(255,120,150,0.7)'; g.fill(); }
  const my = ey + 64, MC = '#7a2238';
  if (E === 'shock') { const p = ellP(0, my + 4, 12, 16); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad' || E === 'angry' || E === 'worried') taper(g, arcPts(0, my + 16, 16, Math.PI * 1.2, Math.PI * 1.8, 8), 4.6, INK, 0.3);
  else if (E === 'happy' || E === 'love') { const p = new Path2D(); p.moveTo(-22, my - 4); p.bezierCurveTo(-8, my, 8, my, 22, my - 4); p.bezierCurveTo(17, my + 20, -17, my + 20, -22, my - 4); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'proud' || E === 'sly') taper(g, [[-16, my], [4, my + 7], [20, my - 7]], 4.6, INK, 0.3);
  else taper(g, arcPts(0, my - 10, 19, Math.PI * 0.2, Math.PI * 0.8, 10), 4.6, INK, 0.3);
  if (E === 'shock' || E === 'worried') { g.beginPath(); const sx = 150, sy = CY - 120; g.moveTo(sx, sy); g.quadraticCurveTo(sx + 14, sy + 24, sx, sy + 30); g.quadraticCurveTo(sx - 14, sy + 24, sx, sy); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); }
  // stubby arms
  for (const s of [-1, 1]) { const S = [s * 190, CY + 40]; let E3, Hd;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 16 : Math.sin(t * 0.4 + s) * 6; E3 = [S[0] + s * 46, S[1] - 50]; Hd = [S[0] + s * 52 + w, S[1] - 112]; }
    else if (pose === 'shock') { E3 = [S[0] + s * 54, S[1] - 10]; Hd = [S[0] + s * 58, S[1] - 74]; }
    else if (pose === 'hips' || pose === 'tap') { E3 = [S[0] + s * 50, S[1] + 34]; Hd = [S[0] + s * 4, S[1] + 74]; }
    else if (pose === 'shrug') { E3 = [S[0] + s * 50, S[1] + 22]; Hd = [S[0] + s * 92, S[1] - 18]; }
    else if (pose === 'point' && s > 0) { E3 = [S[0] + 58, S[1] - 12]; Hd = [S[0] + 114, S[1] - 44]; }
    else { E3 = [S[0] + s * 26, S[1] + 56]; Hd = [S[0] + s * 30, S[1] + 108]; }
    cel(g, limb([S, E3, Hd], [15, 14, 13]), '#6a6460', 2.6, 4, 3, 2); cel(g, ellP(Hd[0], Hd[1], 20, 18), '#f2f2f6', 2.6, 4, 3, 2); }
  g.restore(); }

// ---------- lineup (?rscast=N)
const KT = [
  { d: 7.0, a: [['RS_GUTZ', { expr: 'determined', prop: 'plans' }], ['RS_LINC', { expr: 'smile' }], ['RS_WORK1', { expr: 'happy', prop: 'drill', drill: 3 }], ['RS_WORK2', { expr: 'grin' }], ['RS_WORK3', { expr: 'nervous' }], ['PEBB', { expr: 'happy', pose: 'wave' }]] },
  { d: 6.0, a: [['RS_TOUR', { expr: 'excited' }], ['RS_MOM', { expr: 'smile' }], ['RS_CREW', { expr: 'proud', prop: 'panel' }], ['RS_FAM', { expr: 'happy' }], ['PEBB', { expr: 'shock' }], ['PEBB', { expr: 'sly', pose: 'tap' }]] },
];
export function rsTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'PEBB' ? 0.42 : o === 'RS_TOUR' ? 0.8 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
