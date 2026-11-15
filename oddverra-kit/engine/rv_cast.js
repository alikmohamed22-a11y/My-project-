// [RV-cast] "Paul Revere never shouted 'The British are coming!'": outfit table (merged into ODD by main.js), props (into oddverra's HOLD),
// LANTY (a little living church lantern, the sidekick; drawLanty on the 600x1000 card), RVRIDE (a galloping horse with an Oddverra
// rider on the 1000x880 horse card; drawRide) and a cast lineup (?rvcast=N). Everyone is our own stylization; no real portraits.
import { OVK, OVH, ovLight, INK, oddverra } from './oddverra_next.js';
const { cel, taper, ellP, limb, arcPts, mixc, polyPath, smooth } = OVK;
const TAU = Math.PI * 2;

export const RV_ODD = {
  RV_REVERE: { frock: true, waistcoat: '#c89a52', shirt: '#5a3c2c', pants: '#3a3030', collar: '#f2ece0', cuff: '#f2ece0', hat: 'tricorn', hatCol: '#26222c', boots: 'knee', noChain: true,
    hair: 'side', hairCol: '#3a2a22', brow: '#3a2a22', build: 'adult', head: 'wide', skin: '#ecb890', shoes: '#1e1a1e' },          // silversmith, 40, dark brown coat
  RV_DAWES: { frock: true, waistcoat: '#7a8a5a', shirt: '#9a7a52', pants: '#4a3a30', collar: '#f2ece0', cuff: '#f2ece0', hat: 'tricorn', hatCol: '#3a2e26', boots: 'knee', noChain: true,
    hair: 'short', hairCol: '#7a4a2a', brow: '#6a3a22', build: 'thin', head: 'tall', skin: '#f0c098', shoes: '#1e1a1e' },        // tanner, tan coat
  RV_PRESCOTT: { frock: true, waistcoat: '#e8dcc0', shirt: '#2f5a4a', pants: '#e8dcc0', collar: '#f2ece0', cuff: '#f2ece0', boots: 'knee', noChain: true,
    hair: 'curly', hairCol: '#5a3a22', brow: '#5a3a22', build: 'thin', head: 'egg', skin: '#f2c8a0', shoes: '#1e1a1e' },          // young Concord doctor, green coat
  RV_REDCOAT: { frock: true, waistcoat: '#f2ece0', shirt: '#c0302a', pants: '#f2ece0', collar: '#f6f2ea', cuff: '#2a3a7a', sash: '#f4f0e6', hat: 'tricorn', hatCol: '#1e1a22', trimCol: '#f2f0ea', boots: 'knee', noChain: true,
    hair: 'short', hairCol: '#c8c0b8', brow: '#4a3a2a', build: 'adult', head: 'round', skin: '#f0c4a0', shoes: '#16141a' },        // British regular
  RV_REDCOAT2: { frock: true, waistcoat: '#f2ece0', shirt: '#c0302a', pants: '#f2ece0', collar: '#f6f2ea', cuff: '#2a3a7a', sash: '#f4f0e6', hat: 'tricorn', hatCol: '#1e1a22', trimCol: '#f2f0ea', boots: 'knee', noChain: true,
    hair: 'short', hairCol: '#d0c8c0', brow: '#6a4a2a', moustache: '#6a4a2a', build: 'stout', head: 'wide', skin: '#e4aa82', shoes: '#16141a' },
  RV_OFFICER: { frock: true, waistcoat: '#f2ece0', shirt: '#c8302a', pants: '#f2ece0', collar: '#f6f2ea', cuff: '#2a3a7a', sash: '#c89a3a', hat: 'tricorn', hatCol: '#1e1a22', trimCol: '#e0b850', cockade: '#1e1a22', boots: 'knee', noChain: true,
    hair: 'side', hairCol: '#e8e4dc', brow: '#4a3a2a', build: 'thin', head: 'tall', skin: '#f0c4a0', shoes: '#16141a' },          // patrol officer
  RV_FARMER: { shirt: '#f2ece0', pants: '#5a4a3a', pj: true, hat: 'beanie', hatCol: '#e8e0d0', hair: 'short', hairCol: '#8a6a4a', brow: '#6a4a2a', build: 'stout', head: 'round', skin: '#e8b08a', shoes: '#4a3a2a', noButtons: true }, // nightshirt + nightcap
  RV_WIFE: { lashes: true, dress: true, shirt: '#8a5a7a', pants: '#8a5a7a', shawl: '#e8d8b0', hair: 'bun', hairCol: '#6a3a22', head: 'egg', skin: '#f2c8a0', shoes: '#2a2022', noButtons: true },
  RV_TOWN1: { frock: true, waistcoat: '#8a3a3a', shirt: '#3a4a6a', pants: '#3a3a44', collar: '#f2ece0', hat: 'tricorn', hatCol: '#2a2430', noChain: true, hair: 'short', hairCol: '#2a1e18', brow: '#2a1e18', build: 'stout', head: 'wide', skin: '#e0a880', shoes: '#16141a' },
  RV_TOWN2: { lashes: true, dress: true, shirt: '#3a6a5a', pants: '#3a6a5a', shawl: '#f2ece0', hair: 'bun', hairCol: '#a07040', head: 'round', skin: '#f6d0b0', shoes: '#2a2022', earring: true, noButtons: true },
  RV_TOWNKID: { shirt: '#c8a050', pants: '#5a4a3a', collar: '#f2ece0', hair: 'spiky', hairCol: '#8a5a2a', brow: '#6a3a1a', build: 'kid', head: 'round', skin: '#f0c098', shoes: '#3a2a22', noButtons: true },
  RV_PATRIOT: { frock: true, waistcoat: '#6a7a8a', shirt: '#4a3a5a', pants: '#3a3030', collar: '#f2ece0', hat: 'tricorn', hatCol: '#2a2430', noChain: true, hair: 'short', hairCol: '#4a3428', brow: '#4a3428', moustache: '#4a3428', build: 'adult', head: 'egg', skin: '#d8a07a', shoes: '#16141a' },
  RV_LONGF: { frock: true, waistcoat: '#6a5040', shirt: '#2a2a34', pants: '#3a3a44', collar: '#f6f2ea', neck: 'bow', neckCol: '#1e1e26', beard: 'chops', beardCol: '#7a6a5a',
    hair: 'side', hairCol: '#7a6a5a', brow: '#6a5a4a', build: 'adult', head: 'egg', skin: '#f0c4a0', shoes: '#16141a' },          // the poet, 1860 (our own stylization)
  RV_TOUR1: { shirt: '#e86a4a', pants: '#3a4a6a', hat: 'cap', hatCol: '#3a6ab0', plainCap: true, hair: 'short', hairCol: '#2a1a12', brow: '#2a1a12', build: 'adult', head: 'round', skin: '#c98a5e', shoes: '#f0f0f6', noButtons: true, glasses: true },
  RV_TOUR2: { lashes: true, shirt: '#5ab0a0', pants: '#4a4a5a', hair: 'long', hairCol: '#c89040', head: 'egg', skin: '#f6d0b0', shoes: '#f0f0f6', earring: true, noButtons: true },
  RV_TOURKID: { shirt: '#f2c040', pants: '#3a5a9a', hair: 'curly', hairCol: '#3a2418', brow: '#3a2418', build: 'kid', head: 'round', skin: '#8a5a3e', shoes: '#e8e8f0', noButtons: true },
};
const RV_OPS = ['flag'];
export const rvOpts = (op) => { const r = {}; for (const k of RV_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

// ---------- props
const RV_HOLD = {
  musket: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 10, -40); g.rotate(s * -0.12);
    cel(g, polyPath([[-7, -250], [7, -250], [8, 40], [-8, 40]]), '#6a6a74', 2.6, 2, 2, 0);                       // barrel
    cel(g, polyPath([[-10, -120], [10, -120], [14, 60], [26, 150], [-6, 160], [-12, 60]]), '#7a4a2a', 3, 4, 3, 2); // stock
    cel(g, polyPath([[-3, -300], [3, -300], [2, -250], [-2, -250]]), '#c8ccd4', 2, 0, 0, 0); g.restore(); },        // bayonet
  quill: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 18, -60); g.rotate(s * 0.4); const P = new Path2D(); P.moveTo(0, 40); P.quadraticCurveTo(-26, -40, -6, -110); P.quadraticCurveTo(22, -50, 0, 40); cel(g, P, '#f6f2ea', 2.4, 2, 2, 0);
    taper(g, [[0, 40], [-4, -100]], 2, '#9a8a7a', 0.3); taper(g, [[0, 40], [2, 62]], 4, INK, 0.3); g.restore(); },
  spyglass: (g) => { const s = OVH.HSIDE; g.save(); g.translate(s * 20, -70); g.rotate(s * -0.6); cel(g, polyPath([[-8, -70], [8, -70], [11, 60], [-11, 60]]), '#b08a3a', 2.6, 2, 2, 0); cel(g, polyPath([[-12, -10], [12, -10], [12, 8], [-12, 8]]), '#5a3a22', 2, 0, 0, 0); g.restore(); },
  reins: () => {},
};
Object.assign(OVH.HOLD, RV_HOLD);

// ---------- LANTY: a little tin church lantern with a face. drawLanty(g, o, op) on the 600x1000 card (ground y=965, centre x=300)
// op.expr: smile | happy | shock | sad | shh | proud | sly | love ; op.pose: stand | wave | cheer | shh | point | shrug | hips ; op.lit 0..1
export function drawLanty(g, o = {}, op = {}) {
  const E = op.expr || 'smile', t = op.t || 0, blink = op.blink || 0, look = op.look || 0, lit = op.lit ?? 1, flip = !!op.flip;
  const pose = op.pose || (E === 'shh' ? 'shh' : 'stand');
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  const hop = pose === 'cheer' ? Math.abs(Math.sin(t * 0.35)) * 24 : 0, bob = Math.sin(t * 0.2) * 4 - hop, tilt = E === 'sad' ? 0.06 : E === 'shock' ? -0.06 : Math.sin(t * 0.13) * 0.03;
  g.save(); g.translate(300, 965); g.scale(flip ? -1 : 1, 1);
  if (lit > 0) { const gl = g.createRadialGradient(0, -420, 0, 0, -420, 330); gl.addColorStop(0, `rgba(255,236,170,${0.55 * lit})`); gl.addColorStop(0.4, `rgba(255,190,90,${0.25 * lit})`); gl.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = gl; g.fillRect(-330, -750, 660, 680); }
  g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 140, 60, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.22)'; g.fill(); g.restore();
  for (const s of [-1, 1]) { const fx = s * 50; cel(g, limb([[fx, -150 + bob], [fx + s * 6, -26]], [14, 12]), '#3a3440', 2.6, 3, 2, 1); cel(g, ellP(fx + s * 10, -16, 32, 15), '#5a3a2a', 2.8, 5, 3, 2); }
  g.translate(0, bob); g.rotate(tilt);
  const TIN = '#5a5664', TIN2 = mixc(TIN, '#c8c0d8', 0.25), W = 250, top = -640, bot = -170;
  // ring + cap (a pierced-tin Revere-style lantern: conical top, cylinder body with punched star holes, glass belly)
  taper(g, arcPts(0, top - 30, 40, Math.PI * 1.05, Math.PI * 1.95, 10, 48), 9, INK, 0.9); taper(g, arcPts(0, top - 30, 40, Math.PI * 1.05, Math.PI * 1.95, 10, 48), 5, '#8a8494', 0.9);
  cel(g, polyPath([[-W * 0.18, top - 20], [W * 0.18, top - 20], [W * 0.56, top + 70], [-W * 0.56, top + 70]]), TIN2, 4, 8, 5, 3);
  const body = new Path2D(); body.roundRect(-W / 2, top + 64, W, bot - top - 64, 24); cel(g, body, TIN, 4.4, 14, 8, 5);
  g.save(); g.clip(body);
  const win = new Path2D(); win.roundRect(-W * 0.38, top + 120, W * 0.76, (bot - top) * 0.62, 30);
  const fl = 0.85 + 0.15 * Math.sin(t * 0.9) * Math.sin(t * 0.37);
  const wg = g.createRadialGradient(0, top + 260, 6, 0, top + 260, 170); wg.addColorStop(0, mixc('#fff4c8', '#6a6070', 1 - lit)); wg.addColorStop(0.6, mixc('#ffb848', '#4a4050', 1 - lit)); wg.addColorStop(1, mixc('#c86a2a', '#2a2430', 1 - lit)); g.fillStyle = wg; g.fill(win);
  if (lit > 0.05) { g.globalAlpha = lit; const fp = new Path2D(); const fy = bot - 70; fp.moveTo(0, fy - 90 * fl); fp.quadraticCurveTo(30, fy - 30, 0, fy); fp.quadraticCurveTo(-30, fy - 30, 0, fy - 90 * fl); g.fillStyle = '#fff8e0'; g.fill(fp); g.globalAlpha = 1; }
  g.lineWidth = 4; g.strokeStyle = INK; g.stroke(win);
  // punched stars on the tin around the window
  g.fillStyle = lit > 0.05 ? `rgba(255,220,140,${0.9 * lit})` : 'rgba(20,16,30,0.6)'; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU, rx = W * 0.45, ry = (bot - top) * 0.4; const x = Math.cos(a) * rx, y = top + 290 + Math.sin(a) * ry; if (Math.abs(x) < W * 0.4 && Math.abs(y - (top + 290)) < (bot - top) * 0.33) continue; g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(58,42,122,0.25)'; g.fillRect(W * 0.18, top, W, bot - top); g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(-W * 0.42, top + 90, 12, bot - top - 140); g.restore();
  g.lineWidth = 4.4; g.strokeStyle = INK; g.stroke(body);
  cel(g, polyPath([[-W * 0.58, bot - 4], [W * 0.58, bot - 4], [W * 0.5, bot + 22], [-W * 0.5, bot + 22]]), TIN2, 3.4, 4, 3, 2);
  // face on the glass
  const ey = top + 230, ex = 46, k = 1.15;
  for (const s of [-1, 1]) { const x = s * ex + look * 6;
    if (blink >= 1 || E === 'happy') taper(g, [[x - 12 * k, ey + 5 * k], [x, ey - 8 * k], [x + 12 * k, ey + 5 * k]], 5.5 * k, INK, 0.35);
    else if (E === 'love') { const r = 14 * k, hp = new Path2D(); hp.moveTo(x, ey + r); hp.bezierCurveTo(x - r * 1.5, ey - r * 0.1, x - r * 0.9, ey - r * 1.3, x, ey - r * 0.45); hp.bezierCurveTo(x + r * 0.9, ey - r * 1.3, x + r * 1.5, ey - r * 0.1, x, ey + r); g.fillStyle = '#ff5a7a'; g.fill(hp); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(hp); }
    else { const sh = E === 'shock', rx = (sh ? 12 : 9.5) * k, ry = (sh ? 17 : 14) * k * (blink > 0 ? 0.45 : 1), P = ellP(x, ey, rx, ry); g.fillStyle = INK; g.fill(P); g.save(); g.clip(P); g.beginPath(); g.arc(x - 3 * k, ey - 6 * k, 3.4 * k, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
      g.save(); g.translate(x - 3 * k, ey - 6 * k); g.rotate(-0.45); g.beginPath(); g.ellipse(0, 0, 6.8 * k, 2 * k, 0, 0, TAU); g.lineWidth = 1.2 * k; g.strokeStyle = '#fff'; g.stroke(); g.restore(); } }
  const BR = { smile: [2, -3, 2], happy: [0, -6, 0], proud: [6, 0, -4], shock: [-4, -14, -8], sad: [-10, -2, 8], sly: [8, 2, 0], love: [0, -6, 0], shh: [-2, -6, 2] }[E] || [2, -3, 2];
  for (const s of [-1, 1]) { const by = ey - 40; taper(g, [[s * (ex - 16), by + BR[0]], [s * ex, by + BR[1]], [s * (ex + 16), by + BR[2]]], 6, INK, 0.35); }
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (ex + 26), ey + 34, 16, 8, 0, 0, TAU); g.fillStyle = 'rgba(255,110,140,0.7)'; g.fill(); }
  const my = ey + 54, MC = '#7a2238';
  if (E === 'shock') { const p = ellP(0, my + 4, 11, 15); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'sad') taper(g, arcPts(0, my + 16, 15, Math.PI * 1.2, Math.PI * 1.8, 8), 4.4, INK, 0.3);
  else if (E === 'shh') { const p = ellP(0, my, 9, 8); g.fillStyle = MC; g.fill(p); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'happy' || E === 'love') { const p = new Path2D(); p.moveTo(-20, my - 4); p.bezierCurveTo(-8, my, 8, my, 20, my - 4); p.bezierCurveTo(16, my + 18, -16, my + 18, -20, my - 4); g.fillStyle = MC; g.fill(p); g.lineWidth = 3.4; g.strokeStyle = INK; g.stroke(p); }
  else if (E === 'proud' || E === 'sly') taper(g, [[-15, my], [4, my + 7], [19, my - 7]], 4.4, INK, 0.3);
  else taper(g, arcPts(0, my - 10, 18, Math.PI * 0.2, Math.PI * 0.8, 10), 4.4, INK, 0.3);
  if (E === 'shock' || E === 'sad') { g.beginPath(); const sx = W / 2 - 30, sy = top + 140; g.moveTo(sx, sy); g.quadraticCurveTo(sx + 14, sy + 24, sx, sy + 30); g.quadraticCurveTo(sx - 14, sy + 24, sx, sy); g.fillStyle = '#9fd8ff'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = INK; g.stroke(); }
  // arms from the body sides (tin wire arms, white mitten hands)
  for (const s of [-1, 1]) { const S = [s * W * 0.5, top + 300]; let E3, Hd;
    if (pose === 'cheer' || (pose === 'wave' && s > 0)) { const w = pose === 'wave' ? Math.sin(t * 0.5) * 16 : Math.sin(t * 0.4 + s) * 6; E3 = [S[0] + s * 50, S[1] - 46]; Hd = [S[0] + s * 56 + w, S[1] - 110]; }
    else if (pose === 'shh' && s > 0) { E3 = [S[0] + 40, S[1] + 30]; Hd = [12, my - 6]; }
    else if (pose === 'shock') { E3 = [S[0] + s * 54, S[1] - 6]; Hd = [S[0] + s * 60, S[1] - 70]; }
    else if (pose === 'hips') { E3 = [S[0] + s * 52, S[1] + 40]; Hd = [S[0] + s * 6, S[1] + 84]; }
    else if (pose === 'shrug') { E3 = [S[0] + s * 52, S[1] + 26]; Hd = [S[0] + s * 96, S[1] - 14]; }
    else if (pose === 'point' && s > 0) { E3 = [S[0] + 60, S[1] - 10]; Hd = [S[0] + 118, S[1] - 40]; }
    else { E3 = [S[0] + s * 28, S[1] + 60]; Hd = [S[0] + s * 32, S[1] + 116]; }
    cel(g, limb([S, E3, Hd], [12, 11, 10]), '#3a3440', 2.6, 4, 3, 2); cel(g, ellP(Hd[0], Hd[1], 19, 17), '#f2f2f6', 2.6, 4, 3, 2);
    if (pose === 'shh' && s > 0) taper(g, [[Hd[0] - 2, Hd[1] + 12], [Hd[0] - 4, Hd[1] - 30]], 9, '#f2f2f6', 0.6); }
  g.restore(); }

// ---------- RVRIDE: a galloping horse with an Oddverra rider, side view facing right on the 1000x880 card (hooves at y = 850).
// op.ph = gait phase (continuous, 1 = one stride), op.speed 0 (standing) .. 1 (full gallop), op.rider = outfit key (or null),
// op.riderExpr, op.coat (horse colour), op.flip (face left), op.rear 0..1 (pull up / rear), op.hands ('reins' | 'up'), op.blink.
const HCOL = { bay: ['#8a5232', '#5e3420', '#2a1a14', '#c89a72'], grey: ['#b8b4c0', '#8a8494', '#5a5664', '#e8e4ec'], black: ['#3a3440', '#2a2430', '#16121a', '#6a6070'], chestnut: ['#b0603a', '#7a3e24', '#5a2a18', '#e0a070'], white: ['#e8e4e0', '#b8b0b8', '#8a8090', '#f6f2ee'] };
const crPts = (P, n = 6) => { const out = []; for (let i = 0; i < P.length - 1; i++) { const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)]; for (let j = 0; j < n; j++) { const t = j / n, t2 = t * t, t3 = t2 * t; out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3))); } } out.push(P[P.length - 1]); return out; };
const riderCanvas = (() => { let c = null; return () => { if (!c) { c = document.createElement('canvas'); c.width = 600; c.height = 1000; } return c; }; })();
export function drawRide(g, o = {}, op = {}) {
  const sp = op.speed ?? 1, ph = ((op.ph || 0) % 1 + 1) % 1, a = ph * TAU, flip = !!op.flip, rear = op.rear || 0, [C, CF, MN, MZ] = HCOL[op.coat || 'bay'] || HCOL.bay, ODDT = op.odd || {};
  ovLight({ ...op, lightDir: (op.lightDir == null ? -1 : op.lightDir) * (flip ? -1 : 1) });
  g.save(); g.translate(500, 850); g.scale(flip ? -0.8 : 0.8, 0.8);
  g.save(); g.scale(1, 0.14); g.beginPath(); g.ellipse(20, 0, 380, 80, 0, 0, TAU); g.fillStyle = 'rgba(40,24,80,0.24)'; g.fill(); g.restore();
  // gallop: the body bobs once per stride and pitches a little; legs follow a rotary-gallop phase table (lead legs offset)
  const idle = (1 - sp) * 3 * Math.sin((op.t || 0) * 0.1), bob = sp * (16 * Math.sin(a) + 5 * Math.sin(2 * a + 0.6)) + idle, pitch = sp * 0.04 * Math.sin(a + 1.2) - rear * 0.42;
  const CY = -430 - bob - rear * 30, PV = [0, CY];
  const P = (x, y) => { const c = Math.cos(pitch), s = Math.sin(pitch), dx = x, dy = y - (-430); return [PV[0] + dx * c - dy * s, PV[1] + dx * s + dy * c]; };
  const leg = (hx, off, fore, col, near) => { const p = a + off * TAU, sw = sp * (fore ? 0.6 : 0.5) * Math.sin(p) + (fore ? -rear * 0.9 : rear * 0.35), fold = sp * Math.max(0, Math.cos(p)) * (fore ? 1.35 : 0.85) + (fore ? rear * 1.6 : 0);
    const H0 = P(hx, -420), L1 = fore ? 190 : 200, L2 = fore ? 245 : 235, a1 = sw + (fore ? 0.02 : 0.12);
    const K = [H0[0] + Math.sin(a1) * L1, H0[1] + Math.cos(a1) * L1], a2 = a1 + (fore ? -fold : fold) + (fore ? 0 : -0.22);
    let F = [K[0] + Math.sin(a2) * L2, K[1] + Math.cos(a2) * L2]; if (F[1] > -6) F = [F[0] + (F[1] + 6) * 0.3 * Math.sign(Math.sin(a2) || 1), -6];
    cel(g, limb([H0, K, F], fore ? [48, 27, 20] : [64, 30, 20]), col, 3.6, near ? 9 : 4, 6, near ? 3 : 0);
    g.save(); g.translate(F[0], F[1]); g.rotate(-a2 * 0.7); cel(g, polyPath([[-26, -10], [24, -10], [30, 18], [-30, 18]]), '#2a2026', 3, 2, 2, 0); cel(g, polyPath([[-26, -26], [24, -26], [24, -10], [-26, -10]]), mixc(col, '#f2ece0', 0.55), 2, 0, 0, 0); g.restore(); return F; };
  // tail streams back with speed
  { const T0 = P(-320, -520), wv = Math.sin(a + 1) * 26 * sp; const pts = crPts([T0, [T0[0] - 80 - 60 * sp, T0[1] + 50 - 60 * sp + wv * 0.4], [T0[0] - 130 - 130 * sp, T0[1] + 170 - 150 * sp + wv], [T0[0] - 150 - 180 * sp, T0[1] + 300 - 220 * sp + wv * 1.4]], 5);
    taper(g, pts, 46, INK, 0.25); taper(g, pts, 38, MN, 0.25); taper(g, pts.slice(1, -3).map(([x, y]) => [x + 6, y - 8]), 8, mixc(MN, '#ffffff', 0.22), 0.3); }
  leg(-215, 0.1, false, CF, false); leg(225, 0.55, true, CF, false);
  // barrel
  const B = smooth([P(-335, -455), P(-300, -525), P(-150, -555), P(60, -548), P(180, -572), P(300, -480), P(290, -370), P(160, -305), P(-140, -300), P(-290, -345)], 8);
  cel(g, B, C, 4.6, 26, 16, 7);
  g.save(); g.clip(B); g.fillStyle = mixc(C, '#3a2a7a', 0.24); const bl = P(0, -260); g.beginPath(); g.ellipse(bl[0], bl[1], 360, 70, pitch, 0, TAU); g.fill(); const hl = P(-60, -540); g.fillStyle = 'rgba(255,240,220,0.18)'; g.beginPath(); g.ellipse(hl[0], hl[1], 220, 20, pitch, 0, TAU); g.fill(); g.restore();
  // neck + head; the head nods with the stride; ears; mane
  const nb = sp * 0.07 * Math.sin(a + 2.2) - rear * 0.35, NO = P(220, -540), NP = (x, y) => { const p = P(x, y), c = Math.cos(nb), s = Math.sin(nb); return [NO[0] + (p[0] - NO[0]) * c - (p[1] - NO[1]) * s, NO[1] + (p[0] - NO[0]) * s + (p[1] - NO[1]) * c]; };
  const N = smooth([NP(140, -540), NP(240, -690), NP(330, -790), NP(410, -770), NP(420, -660), NP(330, -470), NP(230, -420)], 8); cel(g, N, C, 4.4, 16, 10, 4);
  for (const dx of [0, 26]) cel(g, smooth([NP(352 + dx, -790), NP(340 + dx, -866), NP(370 + dx, -812)], 4), dx ? CF : C, 3, 3, 2, 1);
  const Hd = smooth([NP(340, -790), NP(410, -822), NP(470, -770), NP(560, -700), NP(590, -660), NP(570, -618), NP(520, -612), NP(440, -650), NP(395, -690)], 8); cel(g, Hd, C, 4.4, 16, 10, 4);
  g.save(); g.clip(Hd); g.fillStyle = MZ; const mz = NP(560, -650); g.beginPath(); g.ellipse(mz[0], mz[1], 60, 48, -0.6, 0, TAU); g.fill(); const bl2 = NP(400, -790); g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.ellipse(bl2[0] + 30, bl2[1] + 10, 12, 30, 0.9, 0, TAU); if (op.blaze) g.fill(); g.restore();
  { const ns = NP(568, -660); g.beginPath(); g.ellipse(ns[0], ns[1], 9, 6, -0.5, 0, TAU); g.fillStyle = INK; g.fill(); const m1 = NP(540, -628), m2 = NP(575, -634); taper(g, [m1, [(m1[0] + m2[0]) / 2, m1[1] + 4], m2], 4, INK, 0.3); }
  { const fl = 34 * sp; for (let i = 0; i < 8; i++) { const t2 = i / 7, base = NP(345 - 190 * t2, -800 + 250 * t2), w2 = Math.sin(a + i * 0.9) * 10 * sp; const tip = [base[0] - 46 - fl - w2, base[1] + 30 - fl * 0.4]; const mp = [[base[0], base[1]], [(base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2 - 12], tip]; taper(g, mp, 26 - 10 * t2, INK, 0.2); taper(g, mp, 19 - 8 * t2, MN, 0.2); } }
  { const ey = NP(440, -752); if ((op.blink || 0) >= 1) taper(g, [[ey[0] - 11, ey[1]], [ey[0] + 11, ey[1]]], 4, INK, 0.3); else { const PE = ellP(ey[0], ey[1], 11, 14); g.fillStyle = INK; g.fill(PE); g.beginPath(); g.arc(ey[0] - 3, ey[1] - 5, 3.4, 0, TAU); g.fillStyle = '#fff'; g.fill(); }
    taper(g, op.horseExpr === 'shock' ? [[ey[0] - 14, ey[1] - 34], [ey[0] + 12, ey[1] - 30]] : [[ey[0] - 13, ey[1] - 22], [ey[0] + 13, ey[1] - 25]], 4.5, INK, 0.3); g.beginPath(); g.ellipse(ey[0] + 32, ey[1] + 34, 15, 8, 0, 0, TAU); g.fillStyle = 'rgba(255,130,160,0.55)'; g.fill();
    taper(g, [NP(380, -795), NP(420, -700), NP(470, -650), NP(540, -640)], 6, '#3a2418', 0.2); taper(g, [NP(420, -700), NP(520, -700), NP(560, -650)], 5, '#3a2418', 0.2); }
  // saddle blanket + saddle + girth
  cel(g, polyPath([P(-150, -556), P(110, -560), P(115, -420), P(-160, -420)]), op.blanket || '#2f4a7a', 3.4, 6, 4, 2);
  cel(g, smooth([P(-130, -585), P(-60, -560), P(50, -562), P(110, -590), P(105, -540), P(-125, -540)], 4), '#6a3a22', 3.4, 6, 4, 2); taper(g, [P(-15, -545), P(-15, -305)], 14, '#4a2a1a', 0.2);
  leg(-195, 0.0, false, C, true);
  // rider: Oddverra figure drawn off-screen, clipped at the hip, near leg + boot in the stirrup drawn here; reins to the bit
  if (op.rider) { const RO = ODDT[op.rider] || {}, rc = riderCanvas(), rg = rc.getContext('2d'); rg.setTransform(1, 0, 0, 1, 0, 0); rg.clearRect(0, 0, 600, 1000);
    const rb = sp * 9 * Math.sin(a - 0.9) + rear * 8, lean = sp * 0.1 - rear * 0.12;
    oddverra(rg, { seed: op.seed || 0, ...RO }, { t: op.t || 0, expr: op.riderExpr || 'determined', view: op.riderView || '34R', blink: op.blink || 0, drive: op.hands !== 'up', cheer: op.hands === 'up' ? 1 : undefined, headTilt: 0, lightDir: op.lightDir, ...(op.riderOp || {}) });
    const SEAT = P(-10, -580); g.save(); g.translate(SEAT[0], SEAT[1] + rb); g.rotate(lean + pitch); const k = op.riderK || 0.7, hy = op.hipY || 640;
    g.save(); g.beginPath(); g.rect(-400, -1000, 800, 1000 - 10); g.clip(); g.drawImage(rc, -300 * k, -hy * k, 600 * k, 1000 * k); g.restore();
    const pc = RO.pants || '#3a3030', bc = '#1e1a1e'; cel(g, limb([[-6, -30], [70, 40], [40, 160]], [46, 38, 30]), pc, 3.4, 6, 4, 2); cel(g, limb([[40, 140], [46, 225]], [32, 29]), bc, 3, 4, 3, 1); cel(g, ellP(66, 238, 42, 18), bc, 3, 2, 2, 0); taper(g, [[30, 250], [100, 250]], 6, '#c8ccd4', 0.2);
    const hd = [op.handX ?? 70, op.handY ?? -150]; g.restore();
    if (op.hands !== 'up') { const c = Math.cos(lean + pitch), s = Math.sin(lean + pitch), HW = [SEAT[0] + hd[0] * c - hd[1] * s, SEAT[1] + rb + hd[0] * s + hd[1] * c], bit = NP(540, -650); taper(g, [HW, [(HW[0] + bit[0]) / 2, Math.max(HW[1], bit[1]) + 40], bit], 5, '#3a2418', 0.2); } }
  leg(245, 0.62, true, C, true);
  if (op.bronze) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(104,82,46,0.78)'; g.fillRect(-900, -1300, 1800, 1500); const bg = g.createLinearGradient(-300, -1000, 300, 0); bg.addColorStop(0, 'rgba(255,220,150,0.35)'); bg.addColorStop(0.5, 'rgba(255,220,150,0)'); bg.addColorStop(1, 'rgba(40,60,50,0.25)'); g.fillStyle = bg; g.fillRect(-900, -1300, 1800, 1500); g.globalCompositeOperation = 'source-over'; }
  if (op.dust && sp > 0.4) { g.globalAlpha = 0.5 * sp; for (let i = 0; i < 5; i++) { const p2 = ((op.t || 0) * 0.07 + i / 5) % 1; g.beginPath(); g.ellipse(-200 - p2 * 320, -16 - p2 * 80, 30 + p2 * 60, 18 + p2 * 36, 0, 0, TAU); g.fillStyle = op.dust; g.fill(); } g.globalAlpha = 1; }
  g.restore(); }

// ---------- lineup (?rvcast=N)
const KT = [
  { d: 7.0, a: [['RV_REVERE', { expr: 'determined' }], ['RV_DAWES', { expr: 'smile' }], ['RV_PRESCOTT', { expr: 'happy' }], ['RV_REDCOAT', { expr: 'angry', prop: 'musket' }], ['RV_OFFICER', { expr: 'smug', point: 1 }], ['LANTY', { expr: 'shh', pose: 'shh' }]] },
  { d: 7.0, a: [['RV_FARMER', { expr: 'shock', prop: 'lantern', lit: 1 }], ['RV_WIFE', { expr: 'worried' }], ['RV_TOWN1', { expr: 'smile' }], ['RV_TOWN2', { expr: 'happy' }], ['RV_LONGF', { expr: 'thoughtful', prop: 'quill' }], ['RV_PATRIOT', { expr: 'surprised', prop: 'spyglass' }]] },
  { d: 7.5, a: [['RVRIDE', { rider: 'RV_REVERE', coat: 'bay', speed: 1 }], ['RVRIDE', { rider: 'RV_REDCOAT', coat: 'black', speed: 0, ph: 0.3, blaze: 1 }]] },
  { d: 7.0, a: [['RV_TOUR1', { expr: 'surprised' }], ['RV_TOUR2', { expr: 'happy' }], ['RV_TOURKID', { expr: 'excited' }], ['RV_REDCOAT2', { expr: 'angry', prop: 'musket' }], ['LANTY', { expr: 'sad' }], ['LANTY', { expr: 'love', pose: 'cheer', lit: 0.5 }]] },
];
export function rvTestActs(n, cam, gy = 0, f = 0) { const L = KT[((n % KT.length) + KT.length) % KT.length], p = cam.position, fw = [0, 0, 0]; const e = cam.matrixWorld.elements; fw[0] = -e[8]; fw[2] = -e[10]; const l = Math.hypot(fw[0], fw[2]); fw[0] /= l; fw[2] /= l; const rt = [-fw[2], 0, fw[0]];
  const W = 2 * L.d * Math.tan(cam.fov * Math.PI / 360) * cam.aspect * 0.92, N = L.a.length;
  return L.a.map(([o, op], i) => { const x = N > 1 ? -W / 2 + W * (i + 0.5) / N : 0, z = L.d + (i % 2) * 0.15; return { o, k: 2, s: o === 'LANTY' ? 0.55 : o === 'RVRIDE' ? 1.3 : (o === 'RV_TOURKID') ? 0.8 : 1, pos: [p.x + fw[0] * z + rt[0] * x, gy, p.z + fw[2] * z + rt[2] * x], roll: 0, opts: { seed: i + 1, t: f, ph: f * 0.07 + i * 0.3, ...op } }; }); }
