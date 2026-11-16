// [BB-cast] "Big Ben isn't the tower, it's the bell": outfit table (merged into ODD by main.js), props (into oddverra's HOLD),
// BONGO (a little living bronze bell, the sidekick; drawBongo on the 600x1000 card, op.crack draws his own crack) and a cast lineup
// (?bbcast=N). Sir Benjamin Hall and Ben Caunt are our own stylizations; workmen, founders, the clock mechanic and tourists are
// invented generic designs. No logos.
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, line, ellP, limb, arcPts } = OVK;
const TAU = Math.PI * 2;

export const BB_ODD = {
  BB_HALL: { coat: true, frock: true, shirt: '#2a2a36', pants: '#3a3a44', collar: '#f4f1e8', cuff: '#2a2a36', neck: 'bow', neckCol: '#1a1a22', waistcoat: '#6a2a2a', button: '#e8c860',
    hat: 'top', hatCol: '#1e1a22', hair: 'short', hairCol: '#2a1e18', brow: '#2a1e18', beard: true, beardCol: '#2a1e18', beardShort: true, build: 'stout', head: 'tall', skin: '#f0c4a0', shoes: '#1a1618' },   // Sir Benjamin Hall (a big man)
  BB_CAUNT: { shirt: '#f2ece0', rolled: true, openCollar: true, sash: '#2a6ab8', pants: '#e8e0cc', belt: true, hair: 'short', hairCol: '#4a3020', brow: '#4a3020', moustache: '#4a3020',
    build: 'stout', head: 'wide', skin: '#e8b08a', shoes: '#2a1e18', noButtons: true },                                                                 // Ben Caunt, prizefighter
  BB_WORK1: { shirt: '#e8e0cc', rolled: true, vest: '#4a3a2e', pants: '#3a3a46', hat: 'cap', hatCol: '#4a4a52', plainCap: true, hair: 'short', hairCol: '#4a3020', brow: '#4a3020', moustache: '#4a3020', build: 'adult', head: 'egg', skin: '#e0a882', shoes: '#2a2020', noButtons: true },
  BB_WORK2: { shirt: '#7a8aa0', rolled: true, suspenders: '#4a3020', pants: '#4a4036', hat: 'bowler', hatCol: '#3a3030', hair: 'short', hairCol: '#a86a3a', brow: '#a86a3a', build: 'thin', head: 'tall', skin: '#f0c4a0', shoes: '#2a2020', noButtons: true },
  BB_FOUND: { shirt: '#c8b898', rolled: true, apron: '#5a3a2a', pants: '#3a3438', hat: 'cap', hatCol: '#3a3a3a', plainCap: true, hair: 'short', hairCol: '#1e1612', brow: '#1e1612', beard: true, beardCol: '#1e1612', beardShort: true, build: 'stout', head: 'round', skin: '#d8986a', shoes: '#2a2020', noButtons: true },
  BB_KEEP: { shirt: '#3a5a8a', cardigan: true, pants: '#3a3a44', collar: '#f2f2f4', hair: 'short', hairCol: '#8a8a90', brow: '#7a7a80', glasses: true, build: 'adult', head: 'egg', skin: '#f0c8a8', shoes: '#2a2228', noButtons: true },   // clock mechanic, today
  BB_TOUR1: { shirt: '#e85a3a', hoodie: true, pants: '#3a4a6a', hat: 'beanie', hatCol: '#2a8a7a', hair: 'short', hairCol: '#3a2214', brow: '#3a2214', build: 'adult', head: 'round', skin: '#c88a62', shoes: '#f0f0f6', noButtons: true },
  BB_TOUR2: { lashes: true, shirt: '#f0c840', pants: '#3a3a5a', hair: 'long', hairCol: '#2a1a12', head: 'egg', skin: '#f2c8a8', shoes: '#e8e8f0', earring: true, noButtons: true, satchel: '#8a5a3a' },
  BB_KID: { shirt: '#4a8ad8', pants: '#3a3a4a', hat: 'cap', hatCol: '#d83a3a', plainCap: true, hair: 'short', hairCol: '#c88a3a', build: 'kid', head: 'round', skin: '#f2c4a0', shoes: '#f0f0f6', noButtons: true },
  BB_GENT: { coat: true, shirt: '#3a3a4a', pants: '#3a3a4a', collar: '#f4f1e8', cuff: '#3a3a4a', neck: 'tie', neckCol: '#2a5a3a', hat: 'top', hatCol: '#26222a', hair: 'short', hairCol: '#8a6a3a', moustache: '#8a6a3a', build: 'thin', head: 'tall', skin: '#f2c0a0', shoes: '#1a1618' },
  BB_LADY: { lashes: true, dress: true, bustle: true, shirt: '#6a3a7a', pants: '#6a3a7a', collar: '#f4eee0', cuff: '#f4eee0', hat: 'ladyhat', hatCol: '#e8d8b0', hair: 'bun', hairCol: '#4a2a1a', head: 'egg', skin: '#f6d0b0', shoes: '#3a2a22', earring: true },
};
const BB_OPS = [];
export const bbOpts = (op) => { const r = {}; for (const k of BB_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props (hand-local: hand at 0,0, up = -y)
const BB_HOLD = {
  // an old pre-decimal penny, held up between finger and thumb
  penny: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 10, -26); cel(g, ellP(0, 0, 22, 22), '#c8783a', 3, 4, 3, 1); g.beginPath(); g.arc(0, 0, 15, 0, TAU); g.lineWidth = 2; g.strokeStyle = 'rgba(80,30,10,0.6)'; g.stroke();
    g.fillStyle = 'rgba(255,220,170,0.6)'; g.beginPath(); g.ellipse(-6, -7, 6, 3, -0.6, 0, TAU); g.fill(); g.restore(); },
  // a long iron ladle for the pour
  ladle2: (g) => { const s = OVH.HSIDE; line(g, [[0, 10], [s * 30, -110]], 12, INK); line(g, [[0, 10], [s * 30, -110]], 7, '#3a3a44'); cel(g, ellP(s * 34, -120, 26, 14), '#2a2a30', 3, 2, 1, 0); g.fillStyle = '#ffb050'; g.beginPath(); g.ellipse(s * 34, -124, 18, 6, 0, 0, TAU); g.fill(); },
};
Object.assign(OVH.HOLD, BB_HOLD);

// ---------- BONGO: drawBongo(g, o, op) on the 600x1000 card (ground y=965, centre x=300). A bronze bell with a face, stubby arms, feet.
// op.expr: 'smile' | 'happy' | 'shock' | 'sad' | 'sly' | 'proud' | 'love' | 'angry' | 'worried' | 'dazed'
// op.pose: 'stand' | 'wave' | 'cheer' | 'point' | 'shrug' | 'hips' | 'shock' | 'ears' (hands over his ears) ; op.crack 0..1 ; op.ring 0..1 (wobble)
const BRZ = '#b88a4a', BRZD = '#7a5a30';
const bEye = (g, x, y, k, E, blink, look) => {
  if (blink >= 1 || E === 'happy') { taper(g, [[x - 13 * k, y + 5 * k], [x, y - 9 * k], [x + 13 * k, y + 5 * k]], 5.5 * k, INK, 0.35); return; }
  if (E === 'dazed') { g.beginPath(); for (let i = 0; i < 26; i++) { const a = i * 0.55, r = 1.2 * k + i * 0.55 * k; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.lineWidth = 3 * k; g.strokeStyle = INK; g.stroke(); return; }
  if (E === 'love') { const r = 15 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(hp); return; }
  const sh = E === 'shock', rx = (sh ? 12 : 9.5) * k, ry = (sh ? 17 : 14) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k, P = ellP(lx, y, rx, ry);
  g.fillStyle = INK; g.fill(P); g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 6 * k, (sh ? 4 : 3.4) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
  g.save(); g.translate(lx - 3 * k, y - 6 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.8 * k, 2 * k, 0, 0, TAU); g.lineWidth = 1.2 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  const lid = { proud: 0.45, sly: 0.5, sad: 0.25, angry: 0.35, worried: 0.2 }[E]; if (lid && blink < 0.5) { const yl = y - ry + 2 * ry * lid; g.save(); g.clip(ellP(lx, y, rx + 3, ry + 3)); g.fillStyle = BRZ; g.fillRect(lx - rx - 6, y - ry - 8, 2 * rx + 12, yl - (y - ry - 8)); g.restore(); taper(g, [[lx - rx - 2, yl], [lx + rx + 2, yl]], 3 * k, INK, 0.3); } };
export function drawBongo(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, blink = op.blink || 0, look = op.look || 0;
  const pose = op.pose || ({ shock: 'shock', proud: 'hips' }[E]) || 'stand';
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const hopA = pose === 'cheer' ? Math.abs(Math.sin(t * 0.35)) * 26 : 0, bob = Math.sin(t * 0.2) * 4 - hopA, ring = op.ring || 0;
  const tilt = (E === 'sad' ? 0.06 : E === 'shock' ? -0.05 : E === 'sly' ? 0.08 : Math.sin(t * 0.13) * 0.03) + ring * 0.12 * Math.sin(t * 1.9);
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale(flip ? -1 : 1, 1);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 170, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  for (const s of [-1, 1]) { const fx = s * 70; cel(g, limb([[fx, -110 + bob], [fx + s * 6, -26]], [16, 14]), '#4a3a30', 2.6, 3, 2, 1); cel(g, ellP(fx + s * 12, -16, 38, 17), '#2a2228', 2.8, 5, 3, 2); }
  g.translate(0, bob); g.rotate(tilt);
  // body: bell silhouette (mouth flare at the bottom, shoulder, crown + yoke on top)
  const top = -560, lip = -120, P = new Path2D();
  P.moveTo(-200, lip); P.quadraticCurveTo(-206, lip - 26, -176, lip - 52); P.bezierCurveTo(-130, lip - 120, -122, top + 160, -116, top + 70); P.quadraticCurveTo(-104, top, 0, top - 6); P.quadraticCurveTo(104, top, 116, top + 70);
  P.bezierCurveTo(122, top + 160, 130, lip - 120, 176, lip - 52); P.quadraticCurveTo(206, lip - 26, 200, lip); P.quadraticCurveTo(0, lip + 34, -200, lip); P.closePath();
  cel(g, P, BRZ, 5, 18, 12, 6);
  g.save(); g.clip(P); g.fillStyle = 'rgba(255,230,170,0.35)'; g.fillRect(-150, top + 40, 26, 380); for (const y of [lip - 36, lip - 52, top + 120]) { g.fillStyle = 'rgba(70,44,20,0.5)'; g.fillRect(-220, y, 440, 6); g.fillStyle = 'rgba(255,224,160,0.4)'; g.fillRect(-220, y - 5, 440, 4); }
  g.fillStyle = 'rgba(90,150,120,0.25)'; for (let i = 0; i < 9; i++) g.fillRect(-140 + i * 33, top + 200 + (i % 3) * 40, 18, 8);
  if (op.crack) { const k = Math.max(0, Math.min(1, op.crack)), pts = [[60, lip + 20], [72, lip - 30], [58, lip - 70], [78, lip - 118], [64, lip - 160], [84, lip - 210]], n = 1 + Math.floor(k * (pts.length - 1)); taper(g, pts.slice(0, n + 1), 9, INK, 0.2); taper(g, pts.slice(0, n + 1), 3, '#ffe0a0', 0.1); }
  g.restore();
  cel(g, ellP(0, top - 4, 34, 16), BRZD, 3, 4, 2, 1); const Y = new Path2D(); Y.roundRect(-70, top - 50, 140, 30, 10); cel(g, Y, '#5a4a40', 3, 4, 3, 1);
  const ex = 52, k = 1.35, ey = top + 190;
  for (const s of [-1, 1]) bEye(g, s * ex + look * 6, ey, k, E, blink, look);
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -14, -8], sad: [-10, -2, 8], sly: [8, 2, 0], love: [0, -6, 0], angry: [-10, 4, 12], worried: [-8, -10, 6], dazed: [-6, -8, -2] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = ey - 46; taper(g, [[s * (ex - 20), by + BR[0]], [s * ex, by + BR[1]], [s * (ex + 20), by + BR[2]]], 7, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 32), ey + 40, 18, 10, 0, 0, TAU); g.fillStyle = 'rgba(255,120,150,0.7)'; g.fill(); }
  const my = ey + 62, MC = '#7a2238';
  if (E === 'shock' || E === 'dazed') { const p = ellP(0, my + 4, 12, 16); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad' || E === 'angry' || E === 'worried') taper(g, arcPts(0, my + 16, 16, Math.PI * 1.2, Math.PI * 1.8, 8), 4.6, INK, 0.3);
  else if (E === 'happy' || E === 'love') { const p = new Path2D(); p.moveTo(-22, my - 4); p.bezierCurveTo(-8, my, 8, my, 22, my - 4); p.bezierCurveTo(17, my + 20, -17, my + 20, -22, my - 4); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'proud' || E === 'sly') taper(g, [[-16, my], [4, my + 7], [20, my - 7]], 4.6, INK, 0.3);
  else taper(g, arcPts(0, my - 10, 19, Math.PI * 0.2, Math.PI * 0.8, 10), 4.6, INK, 0.3);
  if (E === 'shock' || E === 'worried') { g.beginPath(); const sx = 120, sy = top + 110; g.moveTo(sx, sy); g.quadraticCurveTo(sx + 14, sy + 24, sx, sy + 30); g.quadraticCurveTo(sx - 14, sy + 24, sx, sy); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); }
  // stubby arms from the shoulders
  for (const s of [-1, 1]) { const S = [s * 150, top + 290]; let E3, Hd;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 16 : Math.sin(t * 0.4 + s) * 6; E3 = [S[0] + s * 46, S[1] - 50]; Hd = [S[0] + s * 52 + w, S[1] - 112]; }
    else if (pose === 'ears') { E3 = [S[0] + s * 40, S[1] - 60]; Hd = [s * 128, ey - 10]; }
    else if (pose === 'shock') { E3 = [S[0] + s * 54, S[1] - 10]; Hd = [S[0] + s * 58, S[1] - 74]; }
    else if (pose === 'hips') { E3 = [S[0] + s * 50, S[1] + 34]; Hd = [S[0] + s * 4, S[1] + 74]; }
    else if (pose === 'shrug') { E3 = [S[0] + s * 50, S[1] + 22]; Hd = [S[0] + s * 92, S[1] - 18]; }
    else if (pose === 'point' && s > 0) { E3 = [S[0] + 58, S[1] - 12]; Hd = [S[0] + 114, S[1] - 44]; }
    else { E3 = [S[0] + s * 30, S[1] + 56]; Hd = [S[0] + s * 36, S[1] + 108]; }
    cel(g, limb([S, E3, Hd], [15, 14, 13]), BRZD, 2.6, 4, 3, 2); cel(g, ellP(Hd[0], Hd[1], 20, 18), '#f2f2f6', 2.6, 4, 3, 2); }
  if (ring > 0.05) { g.lineCap = 'round'; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const r = 230 + i * 36 + (t * 6) % 36; g.globalAlpha = ring * (1 - i / 3) * 0.9; g.beginPath(); g.arc(0, top + 260, r, s > 0 ? -0.5 : Math.PI - 0.5 + 0, s > 0 ? 0.5 : Math.PI + 0.5); g.lineWidth = 7; g.strokeStyle = '#fff3b0'; g.stroke(); } g.globalAlpha = 1; }
  g.restore(); }

// ---------- lineup (?bbcast=N)
const KT = [
  { d: 7.0, a: [['BB_HALL', { expr: 'proud' }], ['BB_CAUNT', { expr: 'determined', cheer: 0.6 }], ['BB_WORK1', { expr: 'smile', prop: 'mallet' }], ['BB_WORK2', { expr: 'shock' }], ['BB_FOUND', { expr: 'determined', prop: 'ladle2' }], ['BONGO', { expr: 'happy', pose: 'wave' }]] },
  { d: 6.4, a: [['BB_KEEP', { expr: 'smile', prop: 'penny' }], ['BB_TOUR1', { expr: 'excited', prop: 'selfie' }], ['BB_TOUR2', { expr: 'laugh' }], ['BB_KID', { expr: 'surprised' }], ['BB_GENT', { expr: 'shock' }], ['BB_LADY', { expr: 'surprised' }]] },
  { d: 4.0, a: [['BONGO', { expr: 'shock', crack: 1 }], ['BONGO', { expr: 'dazed', pose: 'ears', ring: 1 }], ['BONGO', { expr: 'sly', pose: 'hips', crack: 1 }], ['BONGO', { expr: 'sad', pose: 'shrug' }]] },
];
export function bbTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'BONGO' ? 0.42 : o === 'BB_KID' ? 0.8 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
