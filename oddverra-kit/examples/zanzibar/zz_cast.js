// [ZZ-cast] "The shortest war in history" (Anglo-Zanzibar War, 27 Aug 1896): outfit table (merged into ODD by main.js), props (into
// oddverra's HOLD), TICKY (a little living brass pocket watch, the sidekick; its dial shows the real minutes past nine; drawTicky on the
// 600x1000 card) and a cast lineup (?zzcast=N). Every figure is a generic invented design (no portraits): a claimant in a white kanzu and
// turban, palace guards, a British consul, a naval officer, a clerk, two supporters. Uses the [LIB-cast] galabiya / turban / fez / dbl kit.
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, ellP, limb, arcPts, mixc } = OVK;
const TAU = Math.PI * 2;

const ZB = { build: 'adult', noChain: true, noButtons: true, sandals: true };
export const ZZ_ODD = {
  ZZ_KHALID: { ...ZB, galabiya: '#f4efe2', shirt: '#f4efe2', pants: '#e8e0cc', cuff: '#f4efe2', hat: 'turban', hatCol: '#c8963a', hair: 'short', hairCol: '#1a1210', beard: 'full', beardShort: true, beardK: 0.6, beardCol: '#1e1612', moustache: '#1e1612', brow: '#1a1210',
    head: 'egg', skin: '#b07a52', nose: 'long', shoes: '#6a4a2e' },                                                                    // the claimant (generic)
  ZZ_GUARD1: { ...ZB, galabiya: '#8a3a2e', shirt: '#8a3a2e', pants: '#d8ccb0', cuff: '#8a3a2e', hat: 'turban', hatCol: '#f2ece0', hair: 'short', hairCol: '#140e0c', moustache: '#140e0c', brow: '#140e0c',
    build: 'stout', head: 'round', skin: '#8a5a3e', shoes: '#5a3a24' },
  ZZ_GUARD2: { ...ZB, galabiya: '#3a5a7a', shirt: '#3a5a7a', pants: '#d8ccb0', cuff: '#3a5a7a', hat: 'turban', hatCol: '#e8d8b0', hair: 'short', hairCol: '#140e0c', beard: 'full', beardShort: true, beardK: 0.5, beardCol: '#1e1612', brow: '#140e0c',
    build: 'thin', head: 'tall', skin: '#9a6a48', shoes: '#5a3a24' },
  ZZ_SUPP1: { ...ZB, galabiya: '#ece6d6', shirt: '#ece6d6', pants: '#d8ccb0', cuff: '#ece6d6', hat: 'fez', hatCol: '#f2eee2', hair: 'short', hairCol: '#1a1210', moustache: '#1a1210', brow: '#1a1210',
    build: 'stout', head: 'wide', skin: '#a06a46', shoes: '#5a3a24' },                                                                  // white kofia cap
  ZZ_SUPP2: { ...ZB, galabiya: '#5a6a4a', shirt: '#5a6a4a', pants: '#d8ccb0', cuff: '#5a6a4a', hat: 'fez', hatCol: '#e8e2d2', hair: 'short', hairCol: '#1a1210', beard: 'full', beardShort: true, beardK: 0.55, beardCol: '#3a3030', brow: '#2a2020',
    build: 'old', head: 'egg', skin: '#8a5a3e', shoes: '#5a3a24' },
  ZZ_SAILOR: { ...ZB, galabiya: '#f2eee4', shirt: '#f2eee4', pants: '#d8ccb0', cuff: '#f2eee4', hat: 'fez', hatCol: '#b4202c', hair: 'short', hairCol: '#140e0c', brow: '#140e0c', build: 'thin', head: 'round', skin: '#946446', shoes: '#5a3a24' },
  ZZ_CONSUL: { frock: true, shirt: '#ece6d6', pants: '#ece6d6', cuff: '#ece6d6', collar: '#ffffff', neck: 'tie', neckCol: '#2a3a5a', tieK: 0.7, button: '#c8b080', noChain: true,
    hair: 'side', hairCol: '#8a6a4a', moustache: '#8a6a4a', brow: '#7a5a3a', build: 'thin', head: 'tall', skin: '#f0c4a0', shoes: '#3a2a20' },          // British consul (white tropical suit)
  ZZ_ADMIRAL: { dbl: true, shirt: '#1c2238', pants: '#1c2238', cuff: '#1c2238', button: '#e0b84a', collar: '#f2f0ea', neck: 'tie', neckCol: '#141a2a', tieK: 0.6, hat: 'cap', hatCol: '#18213c', plainCap: true, capBadge: true,
    hair: 'short', hairCol: '#c8c8cc', beard: 'full', beardShort: true, beardK: 0.6, beardCol: '#d0d0d4', moustache: '#d0d0d4', brow: '#b8b8c0', build: 'stout', head: 'wide', skin: '#f2c0a0', shoes: '#141418', noChain: true }, // naval officer
  ZZ_CLERK: { shirt: '#f2ece0', pants: '#4a4a52', vest: '#5a4a3a', neck: 'bow', neckCol: '#2a2a30', collar: '#ffffff', glasses: true, hair: 'side', hairCol: '#5a3a24', brow: '#5a3a24',
    build: 'adult', head: 'round', skin: '#f2c8a4', shoes: '#2a2020', noButtons: true },
};
const ZZ_OPS = ['tm', 'billT'];
export const zzOpts = (op) => { const r = {}; for (const k of ZZ_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- clock dial (shared with the 3D clock textures in zz_sets.js): centre cx, cy, radius r, minutes past 9 (tm), o.roman
export function dial(g, cx, cy, r, tm = 0, o = {}) {
  g.save(); g.translate(cx, cy);
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fillStyle = o.face || '#f6efdc'; g.fill();
  const gr = g.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r); gr.addColorStop(0, 'rgba(255,255,255,0.25)'); gr.addColorStop(1, 'rgba(120,90,60,0.18)'); g.fillStyle = gr; g.fill();
  g.strokeStyle = o.ink || '#2a2030'; for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, big = i % 5 === 0; g.lineWidth = big ? r * 0.035 : r * 0.012; g.beginPath(); g.moveTo(Math.sin(a) * r * (big ? 0.8 : 0.86), -Math.cos(a) * r * (big ? 0.8 : 0.86)); g.lineTo(Math.sin(a) * r * 0.92, -Math.cos(a) * r * 0.92); g.stroke(); }
  if (o.nums !== false) { g.fillStyle = o.ink || '#2a2030'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `bold ${r * 0.17 | 0}px "DejaVu Serif", Georgia, serif`;
    const RN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.fillText(o.roman ? RN[i] : String(i || 12), Math.sin(a) * r * 0.64, -Math.cos(a) * r * 0.64); } }
  if (o.wedge) { const [a0, a1, col] = o.wedge; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r * 0.94, -Math.PI / 2 + a0 / 60 * TAU, -Math.PI / 2 + a1 / 60 * TAU); g.closePath(); g.fillStyle = col; g.fill(); }
  const hA = ((9 + tm / 60) / 12) * TAU, mA = (tm / 60) * TAU;
  const hand = (a, L, w, col) => { g.save(); g.rotate(a); g.beginPath(); g.moveTo(-w / 2, r * 0.1); g.lineTo(-w * 0.3, -L * 0.8); g.lineTo(0, -L); g.lineTo(w * 0.3, -L * 0.8); g.lineTo(w / 2, r * 0.1); g.closePath(); g.fillStyle = col; g.fill(); g.restore(); };
  if (!o.noHands) { hand(hA, r * 0.48, r * 0.09, o.ink || '#2a2030'); hand(mA, r * 0.76, r * 0.06, o.ink || '#2a2030'); }
  g.beginPath(); g.arc(0, 0, r * 0.06, 0, TAU); g.fillStyle = o.pin || '#c8963a'; g.fill();
  g.lineWidth = r * 0.05; g.strokeStyle = o.rim || '#2a2030'; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke(); g.restore(); }

// ---------- props
const paper = (g, w, h, lines, o = {}) => { const P = new Path2D(); P.rect(-w / 2, -h / 2, w, h); cel(g, P, o.bg || '#f6efdc', 3, 2, 1, 0); g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach(([s, y, sz, col], i) => { g.font = `bold ${sz}px "DejaVu Serif", Georgia, serif`; g.fillStyle = col || INK; g.fillText(s, 0, y); }); };
const ZZ_HOLD = {
  ultim: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 24, -60); g.rotate(s * 0.1); paper(g, 92, 120, [['ULTIMATUM', -38, 13], ['LEAVE BY', -6, 15], ['9:00', 22, 26, '#a8282c']]); g.restore(); },
  bill: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 26, -58); g.rotate(s * -0.12); paper(g, 96, 126, [['BILL', -40, 20], ['SHELLS', -8, 15], ['FIRED', 12, 15], ['₹ ₹ ₹', 40, 18, '#a8282c']]); g.restore(); },
  pen: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 18, -40); g.rotate(s * 0.7); g.fillStyle = '#2a2030'; g.fillRect(-4, -46, 8, 70); g.fillStyle = '#c8963a'; g.fillRect(-4, -46, 8, 10); g.restore(); },
  spyglass: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 20, -50); g.rotate(s * -1.1); const P = new Path2D(); P.roundRect(-9, -60, 18, 110, 5); cel(g, P, '#c8963a', 3, 2, 1, 0); const Q = new Path2D(); Q.roundRect(-12, -66, 24, 22, 4); cel(g, Q, '#2a2a32', 3, 0, 0, 0); g.restore(); },
};
Object.assign(OVH.HOLD, ZZ_HOLD);

// ---------- TICKY: drawTicky(g, o, op) on the 600x1000 card (ground y=965, centre x=300). A brass pocket watch on little legs; the dial is
// its face (bean eyes on the dial, the real hands show op.tm minutes past nine). op.expr: smile | happy | shock | sad | worried | sly | tender
// op.pose: stand | wave | cheer | point | shrug | shock | hug | still
const tEye = (g, x, y, k, E, blink, look) => {
  if (blink >= 1 || E === 'happy' || E === 'tender') { taper(g, [[x - 12 * k, y + 5 * k], [x, y - 8 * k], [x + 12 * k, y + 5 * k]], 5 * k, INK, 0.35); return; }
  const sh = E === 'shock', rx = (sh ? 11 : 8.5) * k, ry = (sh ? 16 : 13) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k, P = ellP(lx, y, rx, ry);
  g.fillStyle = INK; g.fill(P); g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 5 * k, (sh ? 3.8 : 3.2) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
  g.save(); g.translate(lx - 3 * k, y - 5 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.4 * k, 1.9 * k, 0, 0, TAU); g.lineWidth = 1.1 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  const lid = { sly: 0.5, sad: 0.25, worried: 0.15 }[E]; if (lid && blink < 0.5) { const yl = y - ry + 2 * ry * lid; g.save(); g.clip(ellP(lx, y, rx + 3, ry + 3)); g.fillStyle = '#f6efdc'; g.fillRect(lx - rx - 6, y - ry - 8, 2 * rx + 12, yl - (y - ry - 8)); g.restore(); taper(g, [[lx - rx - 2, yl], [lx + rx + 2, yl]], 3 * k, INK, 0.3); } };
export function drawTicky(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, blink = op.blink || 0, look = op.look || 0, tm = op.tm ?? 0;
  const pose = op.pose || ({ shock: 'shock' }[E]) || 'stand';
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const hopA = pose === 'cheer' ? Math.abs(Math.sin(t * 0.35)) * 20 : 0, still = pose === 'still', bob = still ? 0 : Math.sin(t * 0.2) * 4 - hopA,
    tilt = still ? 0 : E === 'sad' ? 0.05 : E === 'shock' ? -0.06 : E === 'worried' ? 0.03 * Math.sin(t * 0.9) : Math.sin(t * 0.13) * 0.03;
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale(flip ? -1 : 1, 1);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 150, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  for (const s of [-1, 1]) { const fx = s * 56, st = still ? 0 : Math.sin(t * 0.4 + s) * 3; cel(g, limb([[fx, -150 + bob], [fx + s * 6, -26 + st]], [14, 12]), '#4a3428', 2.6, 3, 2, 1); cel(g, ellP(fx + s * 10, -16, 34, 16), '#2a2a3a', 2.8, 5, 3, 2); }
  g.translate(0, bob); g.rotate(tilt);
  const CY = -360, R = 190;
  // bow ring + crown knob
  cel(g, ellP(0, CY - R - 62, 34, 30), '#d8a848', 4, 4, 3, 2); g.beginPath(); g.ellipse(0, CY - R - 62, 18, 15, 0, 0, TAU); g.fillStyle = '#2a1e30'; g.fill();
  const K = new Path2D(); K.roundRect(-26, CY - R - 34, 52, 40, 8); cel(g, K, '#c8963a', 4, 4, 3, 2); g.fillStyle = 'rgba(80,50,20,0.5)'; for (let i = -2; i <= 2; i++) g.fillRect(i * 9 - 2, CY - R - 30, 4, 32);
  // case (brass, cel + purple shadow side) and bezel
  g.save(); g.translate(12, 12); g.beginPath(); g.arc(0, CY, R, 0, TAU); g.fillStyle = mixc('#8a5a1e', '#3a2a7a', 0.3); g.fill(); g.restore();
  cel(g, ellP(0, CY, R, R), '#d8a848', 5, 6, 4, 3);
  g.save(); g.beginPath(); g.arc(0, CY, R, 0, TAU); g.clip(); g.fillStyle = 'rgba(58,42,122,0.25)'; g.beginPath(); g.ellipse(R * 0.55, CY + R * 0.4, R * 0.7, R * 0.9, -0.5, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,248,210,0.4)'; g.beginPath(); g.ellipse(-R * 0.55, CY - R * 0.5, R * 0.3, R * 0.12, -0.7, 0, TAU); g.fill(); g.restore();
  dial(g, 0, CY, R * 0.8, tm, { roman: true, nums: true });
  // face on the dial (eyes above the pin, blush, mouth below)
  const ex = 52, ey = CY - 34, k = 1.25; for (const s of [-1, 1]) tEye(g, s * ex + look * 6, ey, k, E, blink, look);
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], shock: [-4, -14, -8], sad: [-10, -2, 8], sly: [8, 2, 0], worried: [-8, -4, 6], tender: [-6, -4, 4] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = ey - 36; taper(g, [[s * (ex - 16), by + BR[0]], [s * ex, by + BR[1]], [s * (ex + 16), by + BR[2]]], 5.5, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 26), ey + 34, 16, 8, 0, 0, TAU); g.fillStyle = 'rgba(255,110,140,0.65)'; g.fill(); }
  const my = CY + 70, MC = '#7a2238';
  if (E === 'shock') { const p = ellP(0, my, 10, 14); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.2; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad' || E === 'worried') taper(g, arcPts(0, my + 14, 14, Math.PI * 1.2, Math.PI * 1.8, 8), 4.2, INK, 0.3);
  else if (E === 'happy') { const p = new Path2D(); p.moveTo(-18, my - 4); p.bezierCurveTo(-7, my, 7, my, 18, my - 4); p.bezierCurveTo(14, my + 16, -14, my + 16, -18, my - 4); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.2; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sly') taper(g, [[-14, my], [4, my + 6], [18, my - 6]], 4.2, INK, 0.3);
  else taper(g, arcPts(0, my - 10, 16, Math.PI * 0.2, Math.PI * 0.8, 10), 4.2, INK, 0.3);
  if (E === 'shock' || E === 'worried') { g.beginPath(); const sx = R - 30, sy = CY - R * 0.5; g.moveTo(sx, sy); g.quadraticCurveTo(sx + 14, sy + 24, sx, sy + 30); g.quadraticCurveTo(sx - 14, sy + 24, sx, sy); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); }
  // arms from the case sides
  for (const s of [-1, 1]) { const S = [s * R * 0.94, CY + 40]; let E3, Hd;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 16 : Math.sin(t * 0.4 + s) * 6; E3 = [S[0] + s * 50, S[1] - 50]; Hd = [S[0] + s * 56 + w, S[1] - 116]; }
    else if (pose === 'shock') { E3 = [S[0] + s * 54, S[1] - 6]; Hd = [S[0] + s * 62, S[1] - 74]; }
    else if (pose === 'shrug') { E3 = [S[0] + s * 52, S[1] + 26]; Hd = [S[0] + s * 96, S[1] - 14]; }
    else if (pose === 'hug') { E3 = [S[0] + s * 30, S[1] + 70]; Hd = [s * 40, CY + R + 10]; }
    else if (pose === 'point' && s > 0) { E3 = [S[0] + 60, S[1] - 10]; Hd = [S[0] + 120, S[1] - 44]; }
    else { E3 = [S[0] + s * 26, S[1] + 64]; Hd = [S[0] + s * 30, S[1] + 120]; }
    cel(g, limb([S, E3, Hd], [14, 13, 12]), '#4a3428', 2.6, 4, 3, 2); cel(g, ellP(Hd[0], Hd[1], 19, 17), '#f2f2f6', 2.6, 4, 3, 2); }
  g.restore(); }

// ---------- lineup (?zzcast=N)
const KT = [
  { d: 7.0, a: [['ZZ_KHALID', { expr: 'smug' }], ['ZZ_GUARD1', { expr: 'determined' }], ['ZZ_GUARD2', { expr: 'worried' }], ['ZZ_CONSUL', { expr: 'determined', prop: 'ultim' }], ['TICKY', { expr: 'smile', pose: 'wave', tm: 2 }]] },
  { d: 7.0, a: [['ZZ_ADMIRAL', { expr: 'determined', prop: 'spyglass' }], ['ZZ_CLERK', { expr: 'smug', prop: 'bill' }], ['ZZ_SUPP1', { expr: 'shock' }], ['ZZ_SUPP2', { expr: 'worried' }], ['ZZ_SAILOR', { expr: 'relieved' }], ['TICKY', { expr: 'shock', tm: 40 }]] },
];
export function zzTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'TICKY' ? 0.42 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
