// Ep8 props (flat style: #1c1530 ink, one hard shadow tone). All brand / user / app names are invented.
// garlic bread (with Day 7's leftover whole bulbs), the one-leaf salad, a flying spaghetti clump, googly eyes for the fan "roommates",
// Lumière's menu card (Alfredo Soup stamps in), dizzy stars + a forehead bump, a paper crown.
import { W, H, INK, clamp, lerp, rect, circ, ell, poly, line, P, clipTo, halftone, txt, glow, hash, castShadow } from './bgkit.js';
import { eBack, eOut } from './util.js';
import { garlicBulb } from './d7_art.js';
import { lettuce } from './d5_art.js';
const TAU = Math.PI * 2;

/* ---------------- garlic bread: a fat baguette split open, whole bulbs jammed in ---------------- */
export function garlicBread(ctx, x, y, s = 1, { t = 0, n = 5 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  castShadow(ctx, (c) => c.ellipse(20, 40, 330, 50, 0, 0, TAU));
  const crust = (c) => { c.moveTo(-320, 10); c.bezierCurveTo(-330, -70, -250, -110, -150, -100); c.lineTo(160, -100); c.bezierCurveTo(260, -110, 330, -70, 320, 10); c.bezierCurveTo(310, 60, 240, 70, 150, 66); c.lineTo(-150, 66); c.bezierCurveTo(-240, 70, -310, 60, -320, 10); c.closePath(); };
  P(ctx, crust, '#e0a24a', 7);
  clipTo(ctx, crust, () => { ctx.fillStyle = '#b97a2c'; ctx.fillRect(-340, 20, 680, 80); for (let i = 0; i < 6; i++) { ctx.strokeStyle = '#c4843a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-250 + i * 100, -96); ctx.quadraticCurveTo(-220 + i * 100, -60, -260 + i * 100, -30); ctx.stroke(); } });
  // the buttery cut, green-flecked
  P(ctx, (c) => c.ellipse(0, -62, 280, 34, 0, 0, TAU), '#f7dc8a', 6);
  clipTo(ctx, (c) => c.ellipse(0, -62, 280, 34, 0, 0, TAU), () => { for (let i = 0; i < 30; i++) circ(ctx, -260 + hash(i * 3.1) * 520, -86 + hash(i * 5.3) * 46, 4, '#4f9a3a', 0); });
  for (let i = 0; i < n; i++) garlicBulb(ctx, -220 + i * 110, -110 + (i % 2) * 14, 0.72, (hash(i * 4.1) - 0.5) * 0.6, i);
  ctx.restore();
}
/* ---------------- salad bowl with exactly one leaf ---------------- */
export function saladBowl(ctx, x, y, s = 1, { leaf = 1, t = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  castShadow(ctx, (c) => c.ellipse(20, 10, 300, 44, 0, 0, TAU));
  P(ctx, (c) => c.ellipse(0, -150, 290, 60, 0, 0, TAU), '#7a4a2a', 7);
  P(ctx, (c) => c.ellipse(0, -146, 250, 44, 0, 0, TAU), '#5a3420', 5);
  if (leaf > 0) { ctx.save(); ctx.translate(20, -150); ctx.scale(leaf, leaf); lettuce(ctx, 0, 0, 0.55, -0.3 + Math.sin(t * 2) * 0.04); ctx.restore(); }
  const body = (c) => { c.moveTo(-290, -150); c.bezierCurveTo(-280, -20, -150, 10, 0, 10); c.bezierCurveTo(150, 10, 280, -20, 290, -150); c.ellipse(0, -150, 290, 60, 0, 0, Math.PI); c.closePath(); };
  P(ctx, body, '#b8784a', 7);
  clipTo(ctx, body, () => { ctx.fillStyle = '#93582f'; ctx.beginPath(); ctx.ellipse(180, -40, 200, 160, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(28,21,48,0.18)'; ctx.lineWidth = 5; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(0, -150 + i * 34, 300, 60, 0, 0.2, Math.PI - 0.2); ctx.stroke(); } });
  P(ctx, body, null, 7);
  ctx.restore();
}
/* ---------------- spaghetti clump (tangle of strands, optional drips hanging down) ---------------- */
const PASTA = '#f4d27a', PASTA_S = '#d9ab45';
export function pastaClump(ctx, x, y, s = 1, { rot = 0, hang = 0, t = 0, seed = 2 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.lineCap = 'round';
  // hanging strands
  for (let i = 0; i < 7 && hang > 0; i++) { const sx = -90 + i * 30, L = (80 + hash(i + seed) * 140) * hang, sw = Math.sin(t * 3 + i) * 10 * hang; ctx.beginPath(); ctx.moveTo(sx, 10); ctx.quadraticCurveTo(sx + sw, L * 0.6, sx + sw * 1.4, L); ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 8; ctx.strokeStyle = PASTA; ctx.stroke(); }
  P(ctx, (c) => c.ellipse(0, 0, 130, 70, 0, 0, TAU), PASTA, 7);
  clipTo(ctx, (c) => c.ellipse(0, 0, 130, 70, 0, 0, TAU), () => { ctx.fillStyle = PASTA_S; ctx.beginPath(); ctx.ellipse(50, 30, 120, 50, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 14; i++) { const a = hash(i * 2.3 + seed) * TAU, r = 30 + hash(i * 7.1) * 90; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 30, Math.sin(a) * 16, r, r * 0.45, a, 0, TAU * 0.7); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(160,110,30,0.55)'; ctx.stroke(); } });
  ctx.restore();
}
/* ---------------- googly eyes ---------------- */
export function googly(ctx, x, y, r, t = 0, look = [0, 0.5]) {
  for (const s of [-1, 1]) { const ex = x + s * r * 1.1; circ(ctx, ex, y, r, '#fff', Math.max(3, r * 0.16)); const a = Math.sin(t * 5 + s) * 0.6; circ(ctx, ex + (look[0] + Math.sin(a) * 0.3) * r * 0.45, y + (look[1] + Math.cos(a) * 0.1) * r * 0.45, r * 0.48, INK, 0); }
}
export function heart(ctx, x, y, s = 1, col = '#ff4d6d') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  P(ctx, (c) => { c.moveTo(0, 30); c.bezierCurveTo(-60, -10, -40, -60, 0, -30); c.bezierCurveTo(40, -60, 60, -10, 0, 30); c.closePath(); }, col, 6);
  ctx.restore();
}
/* ---------------- Lumière menu card; o.newK 0..1 (the new line stamps in), o.hi glow ---------------- */
export function menuCard(ctx, x, y, s = 1, { newK = 0, t = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.03); ctx.scale(s, s);
  const w = 760, h = 1100;
  castShadow(ctx, (c) => c.roundRect(-w / 2 + 24, -h / 2 + 30, w, h, 20), 0, 0, 'rgba(14,8,30,0.4)');
  P(ctx, (c) => c.roundRect(-w / 2, -h / 2, w, h, 20), '#fbf5e6', 8);
  P(ctx, (c) => c.roundRect(-w / 2 + 30, -h / 2 + 30, w - 60, h - 60, 12), null, 5, '#c9a24a');
  P(ctx, (c) => c.roundRect(-w / 2 + 44, -h / 2 + 44, w - 88, h - 88, 8), null, 2, '#c9a24a');
  txt(ctx, 'LUMIÈRE', 0, -h / 2 + 140, { font: 'Anton', weight: 400, size: 96, col: '#1f2a4d' });
  txt(ctx, '— MENU DU SOIR —', 0, -h / 2 + 220, { font: 'Inter', weight: 700, size: 30, col: '#b08a2e' });
  const items = [['Lobster Bisque', '48'], ['Truffle Risotto', '56'], ['Duck à l\'Orange', '64'], ['Wagyu Tartare', '72']];
  items.forEach(([n, p], i) => { const yy = -h / 2 + 320 + i * 96; txt(ctx, n, -w / 2 + 90, yy, { font: 'FreeSerif', style: 'italic', weight: 700, size: 46, col: '#2c2742', align: 'left' }); txt(ctx, p, w / 2 - 90, yy, { font: 'Inter', weight: 700, size: 40, col: '#2c2742', align: 'right' });
    ctx.strokeStyle = 'rgba(176,138,46,0.5)'; ctx.setLineDash([4, 10]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-w / 2 + 90, yy + 30); ctx.lineTo(w / 2 - 90, yy + 30); ctx.stroke(); ctx.setLineDash([]); });
  // the new signature line
  const k = clamp(newK);
  if (k > 0) {
    const yy = -h / 2 + 760, e = eBack(k);
    glow(ctx, 0, yy, 380, '#ffd43b', 0.5 * k);
    ctx.save(); ctx.translate(0, yy); ctx.scale(lerp(2.2, 1, e), lerp(2.2, 1, e)); ctx.globalAlpha = clamp(k * 3);
    P(ctx, (c) => c.roundRect(-330, -80, 660, 170, 18), '#ffe9a6', 6);
    txt(ctx, 'ALFREDO SOUP 🥣', 0, -14, { font: 'Anton', weight: 400, size: 76, col: '#c0392b' });
    txt(ctx, '★ chef Sam\'s signature ★', 0, 56, { font: 'Inter', weight: 800, size: 30, col: '#8a5a12' });
    ctx.restore();
  }
  txt(ctx, '✦', 0, h / 2 - 90, { font: 'Inter', weight: 700, size: 40, col: '#c9a24a' });
  ctx.restore();
}
/* ---------------- dizzy stars orbiting a head; bump ---------------- */
export function dizzy(ctx, x, y, r, t, n = 4) {
  for (let i = 0; i < n; i++) { const a = t * 6 + i * TAU / n, sx = x + Math.cos(a) * r, sy = y + Math.sin(a) * r * 0.3, sc = 0.8 + 0.25 * Math.sin(a);
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(t * 4 + i); ctx.scale(sc, sc);
    P(ctx, (c) => { for (let k = 0; k < 10; k++) { const rr = k % 2 ? 14 : 34, aa = k * Math.PI / 5 - Math.PI / 2; k ? c.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr) : c.moveTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } c.closePath(); }, '#ffd43b', 5);
    ctx.restore(); }
}
export function bump(ctx, x, y, r) {
  P(ctx, (c) => c.ellipse(x, y, r, r * 0.75, 0, Math.PI, TAU), '#ff6b6b', Math.max(3, r * 0.14));
  ctx.save(); ctx.globalAlpha = 0.6; ell(ctx, x - r * 0.3, y - r * 0.45, r * 0.25, r * 0.12, '#fff', 0); ctx.restore();
}
/* ---------------- paper crown ---------------- */
export function crown(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  P(ctx, (c) => { c.moveTo(-100, 40); c.lineTo(-110, -50); c.lineTo(-55, -5); c.lineTo(0, -70); c.lineTo(55, -5); c.lineTo(110, -50); c.lineTo(100, 40); c.closePath(); }, '#ffd43b', 7);
  clipTo(ctx, (c) => c.rect(-120, 10, 240, 40), () => { ctx.fillStyle = '#e6b02a'; ctx.fillRect(-120, 10, 240, 40); });
  for (const [cx, col] of [[-55, '#ff4d4d'], [0, '#2f7cf6'], [55, '#2fa75a']]) circ(ctx, cx, 22, 11, col, 4);
  ctx.restore();
}
