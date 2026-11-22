// [PR-cast] "The Pringles can designer was buried in one": outfit table (merged into ODD by main.js), props (into oddverra's HOLD),
// CHIPPY (a little living saddle-shaped chip, the sidekick; drawChippy on the 600x1000 card) and a cast lineup (?prcast=N).
// Fredric Baur is our own stylization; everyone else is an invented generic design. NO real brand art anywhere: every tube carries
// the invented "STAX-A-LOT" label (generic flavour names), no mascot, no logo; the brand name is only spoken in the narration.
import { OVK, OVH, ovLight, INK } from './oddverra_next.js';
const { cel, taper, line, ellP, limb, arcPts, mixc } = OVK;
const TAU = Math.PI * 2;

export const PR_ODD = {
  PR_BAUR: { coat: true, shirt: '#f2f0ea', pants: '#4a4a56', collar: '#cfdcea', cuff: '#f2f0ea', neck: 'tie', neckCol: '#8a3a2a', button: '#c8c8d0', glasses: true, pencil: true, pocket: true, noChain: true,
    hair: 'side', hairCol: '#4a3428', brow: '#4a3428', build: 'adult', head: 'egg', skin: '#ecb890', shoes: '#2a2020' },                       // 1950s P&G chemist (lab coat)
  PR_BAUR80: { cardigan: true, shirt: '#b8865a', pants: '#5a5048', collar: '#e8e0d0', glasses: true, noChain: true, noButtons: true,
    hair: 'side', hairCol: '#d0d0d6', brow: '#b8b8c0', build: 'old', head: 'egg', skin: '#e8b08a', shoes: '#3a2a22' },                       // retired, proud (1980s)
  PR_BOSS: { coat: true, shirt: '#2e3446', pants: '#2e3446', collar: '#f4f1e8', cuff: '#2e3446', neck: 'bow', neckCol: '#a8302a', button: '#2a2a30', noChain: true,
    hair: 'short', hairCol: '#2a1e18', brow: '#2a1e18', moustache: '#2a1e18', build: 'stout', head: 'wide', skin: '#e0a880', shoes: '#16141a' }, // 1950s manager
  PR_TECH: { coat: true, lashes: true, shirt: '#f2f0ea', pants: '#3a5a7a', collar: '#e8c8d0', cuff: '#f2f0ea', noChain: true, earring: true,
    hair: 'bun', hairCol: '#6a3a22', head: 'round', skin: '#f2c8a0', shoes: '#3a2a22' },                                                  // lab colleague
  PR_SON: { shirt: '#3a5a8a', pants: '#4a4a52', collar: '#3a5a8a', hair: 'short', hairCol: '#5a5048', brow: '#4a4038', build: 'stout', head: 'wide', skin: '#e4aa82', shoes: '#2a2020', noButtons: true },
  PR_DAU: { lashes: true, cardigan: true, shirt: '#8a4a6a', pants: '#3a3a4a', collar: '#f2e8e0', hair: 'bun', hairCol: '#8a6a52', head: 'egg', skin: '#f0c6a0', shoes: '#2a2022', earring: true, noButtons: true },
  PR_SON2: { shirt: '#4a7a5a', pants: '#3a3a44', collar: '#e8e4dc', glasses: true, hair: 'side', hairCol: '#6a5a4a', brow: '#5a4a3a', build: 'thin', head: 'tall', skin: '#e8b48a', shoes: '#2a2020', noButtons: true },
  PR_SON80: { shirt: '#c86a3a', pattern: 'stripe', stripe: true, stripeCol: '#f2e0c8', pants: '#3a4a6a', hair: 'short', hairCol: '#3a2418', brow: '#3a2418', build: 'stout', head: 'wide', skin: '#e4aa82', shoes: '#e8e8f0', noButtons: true },
  PR_DAU80: { lashes: true, shirt: '#5a8ac8', pants: '#3a3a5a', hair: 'curly', hairCol: '#5a3020', head: 'egg', skin: '#f0c6a0', shoes: '#f0f0f6', earring: true, noButtons: true },
  PR_SHOP68: { lashes: true, dress: true, shirt: '#e8803a', pants: '#e8803a', collar: '#f4eee0', hair: 'bun', hairCol: '#c89040', head: 'egg', skin: '#f6d0b0', shoes: '#2a2022', earring: true },
  PR_DAD68: { shirt: '#6a8a4a', pants: '#5a4a3a', collar: '#f4eee0', hat: 'cap', hatCol: '#3a5a8a', plainCap: true, hair: 'short', hairCol: '#2a1a12', brow: '#2a1a12', build: 'adult', head: 'tall', skin: '#d8a07a', shoes: '#2a2020', noButtons: true },
  PR_KID68: { shirt: '#e8c040', pattern: 'stripe', stripe: true, stripeCol: '#c8402a', pants: '#3a5a9a', hair: 'spiky', hairCol: '#6a3a1a', brow: '#6a3a1a', build: 'kid', head: 'round', skin: '#f0c098', shoes: '#e8e8f0', noButtons: true },
  PR_CLERK: { shirt: '#f2ece0', pants: '#4a4a52', apron: '#c8302a', neck: 'bow', neckCol: '#2a2a30', hat: 'cap', hatCol: '#f2ece0', plainCap: true, hair: 'short', hairCol: '#1a1410', build: 'thin', head: 'round', skin: '#e0a880', shoes: '#2a2020', noButtons: true },
};
const PR_OPS = ['canCol', 'chipN'];
export const prOpts = (op) => { const r = {}; for (const k of PR_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- the invented tube label (also used for 3D can textures in pr_sets.js). flavour key -> [body, band, word]
export const FLAV = { orig: ['#b8242a', '#f2e6c8', 'ORIGINAL'], sour: ['#2f8a4a', '#f2f0e0', 'SOUR CREAM'], bbq: ['#7a3a1e', '#f0c060', 'BARBECUE'], cheese: ['#e8a020', '#3a2a1a', 'CHEDDAR'], plain68: ['#c8402a', '#f4ecd0', 'NEW!'] };
// a little saddle chip icon (front view), centre 0,0, width w
export function chipIcon(g, w, col = '#f2c450') { const h = w * 0.62, P = new Path2D(); P.moveTo(-w / 2, -h * 0.28); P.bezierCurveTo(-w * 0.2, h * 0.1, w * 0.2, h * 0.1, w / 2, -h * 0.28);
  P.bezierCurveTo(w * 0.56, h * 0.25, w * 0.2, h * 0.55, 0, h * 0.5); P.bezierCurveTo(-w * 0.2, h * 0.55, -w * 0.56, h * 0.25, -w / 2, -h * 0.28); g.fillStyle = col; g.fill(P);
  g.save(); g.clip(P); g.fillStyle = 'rgba(255,250,210,0.55)'; g.beginPath(); g.ellipse(0, h * 0.12, w * 0.32, h * 0.08, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(160,90,30,0.5)'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(Math.sin(i * 2.3) * w * 0.3, h * 0.25 + Math.cos(i * 1.7) * h * 0.12, w * 0.018, 0, TAU); g.fill(); } g.restore();
  g.lineWidth = Math.max(1.5, w * 0.04); g.strokeStyle = INK; g.stroke(P); }
// flat label art (wraps around a tube): w x h canvas. o.year68 = the 1968 debut look
export function tubeLabel(g, w, h, flav = 'orig', o = {}) { const [body, band, word] = FLAV[flav] || FLAV.orig;
  g.fillStyle = body; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 12; i++) g.fillRect(i * w / 12, 0, w / 24, h);
  for (let k = 0; k < 3; k++) { const cx = w * k * 0.5; /* centred at u = 0 / 0.5 / 1 so the front (+z) of a three.js cylinder shows a whole label */
    g.save(); g.translate(cx, h * 0.3); g.rotate(-0.08); const bw = w * 0.4, bh = h * 0.13; g.fillStyle = band; g.beginPath(); g.roundRect(-bw / 2, -bh / 2, bw, bh, bh * 0.4); g.fill(); g.lineWidth = h * 0.008; g.strokeStyle = INK; g.stroke();
    g.font = `bold ${bh * 0.62 | 0}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; const s = 'STAX-A-LOT', tw = g.measureText(s).width, sx = Math.min(1, bw * 0.9 / tw); g.scale(sx, 1); g.fillStyle = body; g.fillText(s, 0, bh * 0.04); g.restore();
    g.save(); g.translate(cx, h * 0.58); chipIcon(g, w * 0.2); g.restore();
    g.save(); g.translate(cx, h * 0.82); g.font = `bold ${h * 0.07 | 0}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; const tw2 = g.measureText(word).width; g.scale(Math.min(1, w * 0.36 / tw2), 1); g.fillStyle = band; g.fillText(o.year68 ? 'NEW!' : word, 0, 0); g.restore(); }
  g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, 0, w, h * 0.04); g.fillRect(0, h * 0.96, w, h * 0.04); }

// ---------- props
const tube2d = (g, flav, w = 46, h = 128) => { const [body, band] = FLAV[flav] || FLAV.orig, P = new Path2D(); P.roundRect(-w / 2, -h / 2, w, h, 6); cel(g, P, body, 3, 4, 3, 2);
  g.fillStyle = band; g.beginPath(); g.roundRect(-w * 0.42, -h * 0.26, w * 0.84, h * 0.16, 4); g.fill(); g.fillStyle = body; g.fillRect(-w * 0.3, -h * 0.2, w * 0.6, h * 0.04);
  g.save(); g.translate(0, h * 0.1); chipIcon(g, w * 0.6); g.restore(); cel(g, ellP(0, -h / 2, w / 2 + 2, 7), '#2a2a32', 2.4, 0, 0, 0); g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(-w * 0.38, -h * 0.42, w * 0.1, h * 0.84); };
const PR_HOLD = {
  can: (g, op = {}) => { const s = OVH.HSIDE; g.save(); g.translate(s * 20, -56); g.rotate(s * 0.08); tube2d(g, op.canCol || 'orig'); g.restore(); },
  chip: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 26, -52); g.rotate(s * -0.2); chipIcon(g, 70); g.restore(); },
  memo: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 24, -56); g.rotate(s * 0.12); const P = new Path2D(); P.rect(-40, -52, 80, 104); cel(g, P, '#f6f2e6', 3, 2, 1, 0); g.fillStyle = '#c8302a'; g.fillRect(-30, -40, 60, 10); g.fillStyle = 'rgba(60,50,60,0.6)'; for (let i = 0; i < 6; i++) g.fillRect(-30, -20 + i * 11, i % 3 === 2 ? 34 : 60, 4); g.restore(); },
  // puffy chip bag (generic), op.chipN unused
  bag: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 26, -60); const P = new Path2D(); P.moveTo(-42, -60); P.lineTo(42, -60); P.quadraticCurveTo(58, 0, 44, 62); P.lineTo(-44, 62); P.quadraticCurveTo(-58, 0, -42, -60); cel(g, P, '#3a7ad8', 3, 4, 3, 2);
    for (const y of [-60, 62]) { g.fillStyle = '#c8d8f0'; g.fillRect(-44, y - 5, 88, 10); } g.fillStyle = '#f2d040'; g.beginPath(); g.ellipse(0, -6, 30, 18, -0.15, 0, TAU); g.fill(); g.fillStyle = '#c8302a'; g.font = 'bold 22px "DejaVu Sans", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CHIPS', 0, -5); g.restore(); },
  flask: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 22, -50); const P = new Path2D(); P.moveTo(-8, -50); P.lineTo(8, -50); P.lineTo(8, -16); P.lineTo(34, 40); P.quadraticCurveTo(36, 50, 26, 50); P.lineTo(-26, 50); P.quadraticCurveTo(-36, 50, -34, 40); P.lineTo(-8, -16); P.closePath(); cel(g, P, '#d8eef4', 3, 2, 1, 0);
    g.save(); g.clip(P); g.fillStyle = '#f0c040'; g.fillRect(-40, 14, 80, 40); g.restore(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(P); g.restore(); },
};
Object.assign(OVH.HOLD, PR_HOLD);

// ---------- CHIPPY: drawChippy(g, o, op) on the 600x1000 card (ground y=965, centre x=300). A standing saddle chip with a face.
// op.expr: 'smile' | 'happy' | 'shock' | 'sad' | 'sly' | 'proud' | 'love' | 'tender' ; op.pose: 'stand' | 'wave' | 'cheer' | 'point' | 'shrug' | 'hips' | 'shock' | 'heart' | 'soso'
const cEye = (g, x, y, k, E, blink, look) => {
  if (blink >= 1 || E === 'happy' || E === 'tender') { taper(g, [[x - 13 * k, y + 5 * k], [x, y - 9 * k], [x + 13 * k, y + 5 * k]], 5.5 * k, INK, 0.35); return; }
  if (E === 'love') { const r = 15 * k, hp = new Path2D(); hp.moveTo(x, y + r); hp.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.3, x, y - r * 0.45); hp.bezierCurveTo(x + r * 0.9, y - r * 1.3, x + r * 1.5, y - r * 0.1, x, y + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(hp); return; }
  const sh = E === 'shock', rx = (sh ? 12 : 9.5) * k, ry = (sh ? 17 : 14) * k * (blink > 0 ? 0.45 : 1), lx = x + look * 4 * k, P = ellP(lx, y, rx, ry);
  g.fillStyle = INK; g.fill(P); g.save(); g.clip(P); g.beginPath(); g.arc(lx - 3 * k, y - 6 * k, (sh ? 4 : 3.4) * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
  g.save(); g.translate(lx - 3 * k, y - 6 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.8 * k, 2 * k, 0, 0, TAU); g.lineWidth = 1.2 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore();
  const lid = { proud: 0.45, sly: 0.5, sad: 0.25 }[E]; if (lid && blink < 0.5) { const yl = y - ry + 2 * ry * lid; g.save(); g.clip(ellP(lx, y, rx + 3, ry + 3)); g.fillStyle = '#f4c654'; g.fillRect(lx - rx - 6, y - ry - 8, 2 * rx + 12, yl - (y - ry - 8)); g.restore(); taper(g, [[lx - rx - 2, yl], [lx + rx + 2, yl]], 3 * k, INK, 0.3); } };
export function drawChippy(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, flip = !!op.flip, blink = op.blink || 0, look = op.look || 0;
  const pose = op.pose || ({ shock: 'shock', proud: 'hips' }[E]) || 'stand';
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const hopA = pose === 'cheer' ? Math.abs(Math.sin(t * 0.35)) * 22 : 0, bob = Math.sin(t * 0.2) * 4 - hopA, tilt = E === 'sad' ? 0.05 : E === 'shock' ? -0.05 : E === 'sly' ? 0.07 : pose === 'soso' ? 0.12 * Math.sin(t * 0.5) : Math.sin(t * 0.13) * 0.025;
  g.save(); g.translate(300 + (op.x || 0), 965); g.scale(flip ? -1 : 1, 1);
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 150, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  for (const s of [-1, 1]) { const fx = s * 52; cel(g, limb([[fx, -120 + bob], [fx + s * 6, -26]], [14, 12]), '#5a3a2a', 2.6, 3, 2, 1); cel(g, ellP(fx + s * 10, -16, 34, 16), '#c8302a', 2.8, 5, 3, 2); }
  g.translate(0, bob); g.rotate(tilt);
  // saddle chip body: wings curl up at the sides, the middle dips (front view of a hyperbolic paraboloid)
  const W = 400, CY = -330, Hh = 300, P = new Path2D();
  P.moveTo(-W / 2, CY - Hh * 0.42); P.bezierCurveTo(-W * 0.22, CY - Hh * 0.08, W * 0.22, CY - Hh * 0.08, W / 2, CY - Hh * 0.42);
  P.bezierCurveTo(W * 0.6, CY + Hh * 0.1, W * 0.3, CY + Hh * 0.52, 0, CY + Hh * 0.5); P.bezierCurveTo(-W * 0.3, CY + Hh * 0.52, -W * 0.6, CY + Hh * 0.1, -W / 2, CY - Hh * 0.42); P.closePath();
  g.save(); g.translate(12, 12); g.fillStyle = mixc('#a8701e', '#3a2a7a', 0.3); g.fill(P); g.restore();
  g.fillStyle = '#f4c654'; g.fill(P); g.save(); g.clip(P);
  const gr = g.createLinearGradient(0, CY - Hh * 0.5, 0, CY + Hh * 0.5); gr.addColorStop(0, 'rgba(255,248,210,0.0)'); gr.addColorStop(0.35, 'rgba(255,248,210,0.55)'); gr.addColorStop(0.55, 'rgba(255,248,210,0.0)'); g.fillStyle = gr; g.fillRect(-W, CY - Hh, 2 * W, 2 * Hh);
  g.fillStyle = 'rgba(58,42,122,0.22)'; g.beginPath(); g.ellipse(W * 0.32, CY + Hh * 0.2, W * 0.32, Hh * 0.5, -0.4, 0, TAU); g.fill();
  g.fillStyle = 'rgba(176,100,30,0.55)'; for (let i = 0; i < 16; i++) { g.beginPath(); g.arc(Math.sin(i * 2.31) * W * 0.4, CY + Math.cos(i * 1.73) * Hh * 0.32 + Hh * 0.05, 4 + (i % 3) * 2, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(-W * 0.3, CY - Hh * 0.2, 34, 12, -0.5, 0, TAU); g.fill(); g.restore();
  g.lineWidth = 5; g.strokeStyle = INK; g.stroke(P);
  // face
  const ex = 54, k = 1.3, ey = CY + 10;
  for (const s of [-1, 1]) cEye(g, s * ex + look * 6, ey, k, E, blink, look);
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -14, -8], sad: [-10, -2, 8], sly: [8, 2, 0], love: [0, -6, 0], tender: [-6, -4, 4] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = ey - 44; taper(g, [[s * (ex - 18), by + BR[0]], [s * ex, by + BR[1]], [s * (ex + 18), by + BR[2]]], 6, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 32), ey + 38, 18, 9, 0, 0, TAU); g.fillStyle = 'rgba(255,110,140,0.7)'; g.fill(); }
  const my = ey + 58, MC = '#7a2238';
  if (E === 'shock') { const p = ellP(0, my + 4, 11, 15); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad') taper(g, arcPts(0, my + 16, 15, Math.PI * 1.2, Math.PI * 1.8, 8), 4.4, INK, 0.3);
  else if (E === 'happy' || E === 'love') { const p = new Path2D(); p.moveTo(-20, my - 4); p.bezierCurveTo(-8, my, 8, my, 20, my - 4); p.bezierCurveTo(16, my + 18, -16, my + 18, -20, my - 4); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'proud' || E === 'sly') taper(g, [[-15, my], [4, my + 7], [19, my - 7]], 4.4, INK, 0.3);
  else taper(g, arcPts(0, my - 10, 18, Math.PI * 0.2, Math.PI * 0.8, 10), 4.4, INK, 0.3);
  if (E === 'shock') { g.beginPath(); const sx = W / 2 - 40, sy = CY - Hh * 0.3; g.moveTo(sx, sy); g.quadraticCurveTo(sx + 14, sy + 24, sx, sy + 30); g.quadraticCurveTo(sx - 14, sy + 24, sx, sy); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); }
  // arms from the chip's sides
  for (const s of [-1, 1]) { const S = [s * W * 0.4, CY + 40]; let E3, Hd;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 16 : Math.sin(t * 0.4 + s) * 6; E3 = [S[0] + s * 50, S[1] - 46]; Hd = [S[0] + s * 56 + w, S[1] - 110]; }
    else if (pose === 'shock') { E3 = [S[0] + s * 54, S[1] - 6]; Hd = [S[0] + s * 60, S[1] - 70]; }
    else if (pose === 'hips') { E3 = [S[0] + s * 52, S[1] + 40]; Hd = [S[0] + s * 6, S[1] + 84]; }
    else if (pose === 'shrug' || pose === 'soso') { const w = pose === 'soso' ? s * Math.sin(t * 0.5) * 18 : 0; E3 = [S[0] + s * 52, S[1] + 26]; Hd = [S[0] + s * 96, S[1] - 14 + w]; }
    else if (pose === 'heart') { E3 = [S[0] + s * 30, S[1] + 70]; Hd = [-s * 24, CY + 120]; }
    else if (pose === 'point' && s > 0) { E3 = [S[0] + 60, S[1] - 10]; Hd = [S[0] + 118, S[1] - 40]; }
    else { E3 = [S[0] + s * 28, S[1] + 60]; Hd = [S[0] + s * 32, S[1] + 116]; }
    cel(g, limb([S, E3, Hd], [14, 13, 12]), '#5a3a2a', 2.6, 4, 3, 2); cel(g, ellP(Hd[0], Hd[1], 19, 17), '#f2f2f6', 2.6, 4, 3, 2); }
  g.restore(); }

// ---------- lineup (?prcast=N)
const KT = [
  { d: 7.0, a: [['PR_BAUR', { expr: 'determined', prop: 'chip' }], ['PR_BOSS', { expr: 'smug', prop: 'memo' }], ['PR_TECH', { expr: 'happy', prop: 'flask' }], ['PR_BAUR80', { expr: 'smug', prop: 'can' }], ['CHIPPY', { expr: 'happy', pose: 'wave' }]] },
  { d: 7.0, a: [['PR_SON', { expr: 'laugh', prop: 'can', canCol: 'sour' }], ['PR_DAU', { expr: 'determined', prop: 'can', canCol: 'bbq' }], ['PR_SON2', { expr: 'thoughtful', prop: 'can', canCol: 'orig' }], ['PR_SON80', { expr: 'laugh' }], ['PR_DAU80', { expr: 'amused' }], ['CHIPPY', { expr: 'shock' }]] },
  { d: 6.5, a: [['PR_SHOP68', { expr: 'excited', prop: 'can', canCol: 'plain68' }], ['PR_DAD68', { expr: 'surprised', prop: 'bag' }], ['PR_KID68', { expr: 'excited' }], ['PR_CLERK', { expr: 'proud' }], ['CHIPPY', { expr: 'tender', pose: 'heart' }], ['CHIPPY', { expr: 'sly', pose: 'soso' }]] },
];
export function prTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'CHIPPY' ? 0.42 : (o === 'PR_KID68') ? 0.8 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ...op } }; }); }
