// FX: sparks, steam, smoke, egg explosion, sweat, impact marks, speech bubbles, action lines, cards.
import { W, H, INK, rng, hash, clamp, lerp, eOut, eBack, eIn, eInOut, circ, ell, poly, line, P, txt, glow, blobPath, rrPath, halftone, shadeCol, rect } from './util.js';
import { puff, eggSplat, shell } from './bgkit.js';
import { blurred, charFocus, withFilter, CAM } from './camera.js';
import { speedLinesBg } from './bg_cards.js';
export { blurred, charFocus, withFilter };

export function sparks(ctx, x, y, t, { n = 14, spread = 260, seed = 1, col = '#ffe066', life = 0.5 } = {}) {
  for (let i = 0; i < n; i++) { const ph = (t / life + hash(i * 7.3 + seed)) % 1, a = hash(i * 3.1 + seed + Math.floor(t / life + hash(i * 7.3 + seed)) * 13) * Math.PI * 2;
    const d = eOut(ph) * spread, x1 = x + Math.cos(a) * d, y1 = y + Math.sin(a) * d + ph * ph * 120, l = 30 * (1 - ph);
    ctx.globalAlpha = 1 - ph; line(ctx, x1, y1, x1 - Math.cos(a) * l, y1 - Math.sin(a) * l, 6, col); line(ctx, x1, y1, x1 - Math.cos(a) * l * 0.5, y1 - Math.sin(a) * l * 0.5, 3, '#fff'); }
  ctx.globalAlpha = 1;
}
export function steam(ctx, x, y, t, { amt = 1, w = 200, h = 380, seed = 1, col = 'rgba(255,255,255,0.75)' } = {}) {
  for (let i = 0; i < 4; i++) { const ph = (t * 0.6 + hash(i + seed)) % 1, bx = x + (i - 1.5) * w / 4; ctx.globalAlpha = amt * Math.sin(ph * Math.PI) * 0.9;
    ctx.beginPath(); for (let k = 0; k <= 20; k++) { const yy = y - ph * h * 0.4 - k * h / 20 * 0.7, xx = bx + Math.sin(k * 0.6 + t * 3 + i) * 22; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.stroke(); }
  ctx.globalAlpha = 1;
}
// rising smoke: back layer (darker, bigger, slower) + front puffs (lighter, inner shading) + curling wisps
export function smoke(ctx, x, y, t, { n = 6, spread = 300, rise = 600, size = 110, col = '#8d8a99', seed = 1, alpha = 1, speed = 0.35, wisps = true } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; const hx = col[0] === '#' && col.length === 7, dark = hx ? shadeCol(col, -0.22) : col, lite = hx ? shadeCol(col, 0.12) : col;
  const layer = (k, c, sz, sp, lw) => { for (let i = 0; i < n; i++) { const ph = (t * sp + hash(i * 1.7 + seed + k * 9)) % 1; const curl = Math.sin(t * 1.3 + i * 2 + k) * 40 * ph;
    const px = x + (hash(i * 5.1 + seed + k) - 0.5) * spread * (0.6 + ph * 0.8) + curl, py = y - ph * rise;
    const r = sz * (0.45 + ph * 0.95); ctx.globalAlpha = alpha * Math.min(1, (1 - ph) * 2.2) * Math.min(1, ph * 6); puff(ctx, px, py, r, c, lw, i + seed * 10 + k * 50); } };
  layer(1, dark, size * 1.15, speed * 0.8, 6); layer(0, lite, size, speed, 6);
  if (wisps) { ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { const ph = (t * speed * 1.3 + hash(i + seed * 3)) % 1; ctx.globalAlpha = alpha * 0.5 * Math.sin(ph * Math.PI); ctx.beginPath();
    for (let k = 0; k <= 16; k++) { const q = k / 16, yy = y - ph * rise * 0.6 - q * rise * 0.5, xx = x + (i - 1) * spread * 0.25 + Math.sin(q * 6 + t * 2 + i) * 30 * (0.3 + q) + Math.cos(q * 11 + i) * 8; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.strokeStyle = lite; ctx.lineWidth = 12 * (1 - ph * 0.6); ctx.stroke(); } }
  ctx.restore();
}
// egg explosion at (x,y). p = seconds since burst. Bits fly out; yolk splats stick at targets.
export function eggBurst(ctx, x, y, p, { seed = 3, scale = 1, targets = [] } = {}) {
  const R = rng(seed); if (p < 0) return;
  if (p < 0.25) { const k = p / 0.25; ctx.save(); ctx.globalAlpha = 1 - k; P(ctx, (c) => blobPath(c, x, y, 260 * scale * eOut(k) + 30, seed, 14, 0.8), '#fff7cf', 0); ctx.restore(); }
  // burst star
  if (p < 0.18) { const k = p / 0.18, r = 340 * scale * eOut(k); const pts = []; for (let i = 0; i < 24; i++) { const rr = i % 2 ? r * 0.5 : r; const a = i / 24 * Math.PI * 2; pts.push(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.globalAlpha = 1 - k; poly(ctx, pts, '#ffd43b', 8); ctx.globalAlpha = 1; }
  for (let i = 0; i < 14; i++) { const a = R() * Math.PI * 2, v = (500 + R() * 900) * scale, sp = R() * 12 - 6; const px = x + Math.cos(a) * v * p, py = y + Math.sin(a) * v * p + 900 * p * p * scale; if (p < 1.2) shell(ctx, px, py, 2.2 * scale, sp * p, i + seed); }
  for (let i = 0; i < 10; i++) { const a = R() * Math.PI * 2, v = (400 + R() * 700) * scale; const k = clamp(p / 0.3); const px = x + Math.cos(a) * v * 0.3 * eOut(k), py = y + Math.sin(a) * v * 0.3 * eOut(k);
    if (k < 1) circ(ctx, px, py, (14 + R() * 18) * scale, '#ffb820', 5); }
  targets.forEach(([tx, ty, r], i) => { const k = clamp((p - 0.06 - i * 0.03) / 0.16); if (k <= 0) return; const px = lerp(x, tx, eOut(k)), py = lerp(y, ty, eOut(k)); ctx.save(); ctx.translate(px, py); const s = k < 1 ? 0.5 : 1 + 0.15 * Math.max(0, 1 - (p - 0.22) * 6); ctx.scale(s, s); eggSplat(ctx, 0, 0, r, i + seed + 20, i); ctx.restore(); if (k >= 1) yolkDrip(ctx, tx + r * 0.1, ty + r * 0.25, r * 0.28, p - 0.3 - i * 0.05, i + seed); });
}
export function yolkOnFace(ctx, x, y, r, seed = 2) { eggSplat(ctx, x, y, r, seed, 0.6); }
export function sweatDrop(ctx, x, y, s = 1, t = 0, slide = 0) {
  const yy = y + slide; ctx.save(); ctx.translate(x, yy); ctx.scale(s, s);
  P(ctx, (c) => { c.moveTo(0, -38); c.quadraticCurveTo(26, 0, 22, 14); c.arc(0, 14, 22, 0, Math.PI); c.quadraticCurveTo(-26, 0, 0, -38); }, '#8fd8ff', 6);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-8, 8, 5, 9, 0.3, 0, 7); ctx.fill(); ctx.restore();
}
export function impactLines(ctx, x, y, r, t, { n = 10, col = INK, lw = 8, seed = 1 } = {}) { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + hash(i + seed) * 0.3, r0 = r * (1 + 0.15 * Math.sin(t * 20 + i)), r1 = r0 + 40 + hash(i * 3 + seed) * 50; line(ctx, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, lw, col); } }
export function bang(ctx, x, y, s = 1, rot = 0.15, text = '!!', col = '#ffd43b', p = 1) {
  const k = eBack(clamp(p)); if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * k, s * k);
  txt(ctx, text, 4, 6, { font: 'Luckiest', weight: 400, size: 150, col: INK }); txt(ctx, text, 0, 0, { font: 'Luckiest', weight: 400, size: 150, col, stroke: 14 }); ctx.restore();
}
export function questionMarks(ctx, x, y, s, t) { [-1, 0, 1].forEach((i) => bang(ctx, x + i * 70 * s, y - Math.abs(i) * 20 * s + Math.sin(t * 6 + i) * 8, s * 0.55, i * 0.25, '?', '#fff')); }
// speech bubble; (x,y)=bubble centre, (tx,ty)=tail tip toward speaker, p=pop progress
export function speechBubble(ctx, { x, y, text, tx, ty, p = 1, size = 70, maxW = 760, font = 'Luckiest', col = INK, fill = '#fff', hi = [] }) {
  const k = eBack(clamp(p)); if (k <= 0.01) return;
  ctx.font = `400 ${size}px ${font}`; const words = text.split(' '); const lines = []; let cur = '';
  for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (ctx.measureText(tr).width > maxW - 80 && cur) { lines.push(cur); cur = w; } else cur = tr; } lines.push(cur);
  const bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 90, lh = size * 1.12, bh = lines.length * lh + 70;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y);
  const bx = x - bw / 2, by = y - bh / 2; const ang = Math.atan2(ty - y, tx - x);
  const baseX = clamp(tx, bx + 70, bx + bw - 70), baseY = ty > y ? by + bh - 4 : by + 4;
  const path = (c) => { rrPath(c, bx, by, bw, bh, 46); };
  const tail = (c) => { c.moveTo(baseX - 34, baseY); c.lineTo(tx, ty); c.lineTo(baseX + 30, baseY); c.closePath(); };
  ctx.fillStyle = 'rgba(12,6,28,0.3)'; ctx.save(); ctx.translate(8, 12); ctx.beginPath(); path(ctx); ctx.fill(); ctx.beginPath(); tail(ctx); ctx.fill(); ctx.restore();
  ctx.lineWidth = 18; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.beginPath(); path(ctx); ctx.stroke(); ctx.beginPath(); tail(ctx); ctx.stroke();
  ctx.fillStyle = fill; ctx.beginPath(); path(ctx); ctx.fill(); ctx.beginPath(); tail(ctx); ctx.fill();
  ctx.font = `400 ${size}px ${font}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  lines.forEach((l, i) => { const lw = ctx.measureText(l).width; let xx = x - lw / 2; const yy = by + 35 + lh * (i + 0.5) + size * 0.08;
    for (const w of l.split(' ')) { ctx.fillStyle = hi.includes(w.replace(/[?.!,…]/g, '').toUpperCase()) ? '#e8412f' : col; ctx.fillText(w, xx, yy); xx += ctx.measureText(w + ' ').width; } });
  ctx.restore();
}
// radial action lines around frame edges (focus burst)
export function actionLines(ctx, cx, cy, t, { n = 46, col = 'rgba(255,255,255,0.55)', r0 = 420, seed = 1 } = {}) {
  ctx.fillStyle = col; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + hash(i + Math.floor(t * 12) + seed) * 0.06, rr = r0 + hash(i * 3.3 + Math.floor(t * 12)) * 260, w = 0.006 + hash(i * 1.9) * 0.012;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); ctx.lineTo(cx + Math.cos(a - w) * 2400, cy + Math.sin(a - w) * 2400); ctx.lineTo(cx + Math.cos(a + w) * 2400, cy + Math.sin(a + w) * 2400); ctx.fill(); }
}
export function phoneGlow(ctx, x, y, r = 360, col = '#8fd0ff', a = 0.45) { ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, x, y, r, col, a); ctx.restore(); }
export function sparkle(ctx, x, y, s, t, col = '#fff6c4') { const k = s * (0.6 + 0.4 * Math.sin(t * 8 + x)), r = Math.sin(t * 2 + y) * 0.3;
  ctx.save(); ctx.globalCompositeOperation = 'screen'; glow(ctx, x, y, 60 * k, col, 0.5); ctx.restore(); ctx.save(); ctx.translate(x, y); ctx.rotate(r);
  P(ctx, (c) => { c.moveTo(0, -32 * k); c.quadraticCurveTo(3 * k, -3 * k, 32 * k, 0); c.quadraticCurveTo(3 * k, 3 * k, 0, 32 * k); c.quadraticCurveTo(-3 * k, 3 * k, -32 * k, 0); c.quadraticCurveTo(-3 * k, -3 * k, 0, -32 * k); }, col, 4 * s); ctx.restore(); }
export function confetti(ctx, t, { n = 60, seed = 1, y0 = -100, cols = ['#ffd43b', '#ff4d4d', '#4fc3f7', '#7ee081', '#ff9ad5'] } = {}) {
  for (let i = 0; i < n; i++) { const x = hash(i * 2.3 + seed) * W, sp = 300 + hash(i * 4.1) * 500, y = y0 + ((t * sp + hash(i * 9.7) * 2000) % 2200); ctx.save(); ctx.translate(x + Math.sin(t * 3 + i) * 30, y); ctx.rotate(t * 4 + i); ctx.scale(1, Math.cos(t * 6 + i)); ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-9, -14, 18, 28); ctx.restore(); }
}
// "DAY 1 of 30" title card
export function titleCard(ctx, t, { big = 'DAY 1', small = 'of 30', p = 1, out = 0 } = {}) {
  const k = eBack(clamp(p)), ko = eIn(clamp(out)); ctx.save(); ctx.translate(W / 2, H * 0.42); ctx.rotate(-0.06); ctx.scale(k * (1 - ko), k * (1 - ko));
  // ticket-like badge
  ctx.fillStyle = 'rgba(10,6,25,0.45)'; ctx.beginPath(); rrPath(ctx, -400 + 14, -250 + 20, 800, 500, 60); ctx.fill();
  P(ctx, (c) => rrPath(c, -400, -250, 800, 500, 60), '#ffd43b', 14);
  P(ctx, (c) => rrPath(c, -360, -210, 720, 420, 40), null, 6, 'rgba(28,21,48,0.6)');
  halftone(ctx, -380, 40, 760, 190, 'rgba(232,140,20,0.45)', 22, 7, 'down');
  txt(ctx, big, 0, -40, { font: 'Anton', weight: 400, size: 260, col: '#fff', stroke: 22, scol: INK });
  txt(ctx, big, 0, -40, { font: 'Anton', weight: 400, size: 260, col: '#fff' });
  ctx.save(); ctx.rotate(0.08); P(ctx, (c) => rrPath(c, -170, 110, 340, 110, 55), '#ff4d4d', 10); txt(ctx, small.toUpperCase(), 0, 168, { font: 'Anton', weight: 400, size: 80, col: '#fff' }); ctx.restore();
  ctx.restore();
}
// "29 DAYS LEFT" card
export function daysLeftCard(ctx, t, p = 1, n = '29') {
  const k = eBack(clamp(p)); if (k <= 0) return; ctx.save(); ctx.translate(W / 2, H * 0.47); ctx.rotate(0.05 + Math.sin(t * 3) * 0.01); ctx.scale(k, k);
  ctx.fillStyle = 'rgba(10,6,25,0.45)'; ctx.beginPath(); rrPath(ctx, -430 + 14, -170 + 20, 860, 340, 50); ctx.fill();
  P(ctx, (c) => rrPath(c, -430, -170, 860, 340, 50), '#ff4d4d', 14);
  halftone(ctx, -420, -160, 840, 320, 'rgba(160,20,30,0.35)', 22, 6, 'down');
  txt(ctx, n, -250, 0, { font: 'Anton', weight: 400, size: 260, col: '#ffd43b', stroke: 20, scol: INK }); txt(ctx, n, -250, 0, { font: 'Anton', weight: 400, size: 260, col: '#ffd43b' });
  txt(ctx, 'DAYS', 120, -60, { font: 'Anton', weight: 400, size: 130, col: '#fff', stroke: 16, scol: INK }); txt(ctx, 'DAYS', 120, -60, { font: 'Anton', weight: 400, size: 130, col: '#fff' });
  txt(ctx, 'LEFT', 120, 80, { font: 'Anton', weight: 400, size: 130, col: '#fff', stroke: 16, scol: INK }); txt(ctx, 'LEFT', 120, 80, { font: 'Anton', weight: 400, size: 130, col: '#fff' });
  ctx.restore();
}
// big tilted label sticker (like a caption tag)
export function tag(ctx, x, y, text, { col = '#ff4d4d', tcol = '#fff', size = 64, rot = -0.06, p = 1 } = {}) {
  const k = eBack(clamp(p)); if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ctx.font = `400 ${size}px Anton`; const w = ctx.measureText(text).width + 60;
  P(ctx, (c) => rrPath(c, -w / 2, -size * 0.75, w, size * 1.5, 14), col, 9); txt(ctx, text, 0, 4, { font: 'Anton', weight: 400, size, col: tcol }); ctx.restore();
}
export function heatWaves(ctx, x, y, t, w = 500, h = 300) { ctx.save(); ctx.globalAlpha = 0.5; for (let i = 0; i < 5; i++) { ctx.beginPath(); for (let k = 0; k <= 20; k++) { const yy = y - k * h / 20, xx = x - w / 2 + i * w / 4 + Math.sin(k * 0.8 - t * 8 + i) * 14; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.strokeStyle = '#ffb36b'; ctx.lineWidth = 6; ctx.stroke(); } ctx.restore(); }
export function lightFlicker(ctx, col, a) { ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore(); }
export function tint(ctx, col, a) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore(); }

/* ======================= v2 FX ======================= */
// yolk drip that slides down from (x,y): p = seconds since it started, w = drip width
export function yolkDrip(ctx, x, y, w, p, seed = 1) {
  if (p <= 0) return; const L = (1 - Math.exp(-p * 1.4)) * w * 7 * (0.7 + hash(seed) * 0.6), wob = Math.sin(p * 3 + seed) * w * 0.15;
  P(ctx, (c) => { c.moveTo(x - w, y); c.quadraticCurveTo(x - w * 0.55 + wob, y + L * 0.5, x - w * 0.5, y + L); c.arc(x, y + L, w * 0.5 + w * 0.15, Math.PI, 0, true); c.quadraticCurveTo(x + w * 0.55 + wob, y + L * 0.5, x + w, y); c.closePath(); }, '#ffb820', Math.max(3, w * 0.18));
  circ(ctx, x - w * 0.15, y + L * 0.9, w * 0.18, '#ffe39a', 0);
}
// smear frame: stretched tapered blob from (x0,y0) (tail) to (x1,y1) (head), radius r
export function smear(ctx, x0, y0, x1, y1, r, col = '#ffffff', { lw = 6, n = 3, seed = 1 } = {}) {
  const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a), R = rng(seed);
  for (let k = n - 1; k >= 0; k--) { const off = (k - (n - 1) / 2) * r * 0.55, sx = x0 + nx * off + (R() - 0.5) * r, sy = y0 + ny * off + (R() - 0.5) * r, rr = r * (k === (n - 1) / 2 ? 1 : 0.6);
    P(ctx, (c) => { c.moveTo(sx, sy); c.lineTo(x1 + nx * (off * 0.4 + rr), y1 + ny * (off * 0.4 + rr)); c.arc(x1 + nx * off * 0.4, y1 + ny * off * 0.4, rr, a + Math.PI / 2, a - Math.PI / 2, true); c.closePath(); }, col, lw); }
}
// motion lines trailing behind a moving thing at (x,y) moving along (dx,dy)
export function motionLines(ctx, x, y, dx, dy, { n = 5, len = 160, spread = 120, col = INK, lw = 7, t = 0, seed = 1 } = {}) {
  const l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
  for (let i = 0; i < n; i++) { const o = (i / (n - 1) - 0.5) * spread, back = 40 + hash(i * 3 + seed + Math.floor(t * 15)) * 60, L = len * (0.5 + hash(i * 7 + seed) * 0.6);
    const sx = x + nx * o - ux * back, sy = y + ny * o - uy * back; line(ctx, sx, sy, sx - ux * L, sy - uy * L, lw * (i % 2 ? 0.7 : 1), col); }
}
// dust puffs spreading along the ground from (x,y); p = 0..1 progress
export function dustPuff(ctx, x, y, p, { n = 7, spread = 260, size = 60, col = '#e8dcc4', seed = 1 } = {}) {
  if (p <= 0 || p >= 1) return; const e = eOut(p);
  ctx.save(); for (let i = 0; i < n; i++) { const side = i % 2 ? 1 : -1, k = (Math.floor(i / 2) + 1) / Math.ceil(n / 2), px = x + side * spread * k * e, py = y - size * 0.3 - Math.sin(k * 2) * 30 * e;
    ctx.globalAlpha = (1 - p) * 0.95; puff(ctx, px, py, size * (0.5 + 0.7 * e) * (1.1 - k * 0.4), col, 5, i + seed); }
  ctx.restore();
}
// comic lettering ("BOOM", "POP"): jagged burst behind, letters pop in one by one, outline + offset shadow
export function boom(ctx, x, y, text, p, { size = 170, col = '#ffd43b', burst = '#ff4d4d', rot = -0.08, t = 0, seed = 1, wobble = true } = {}) {
  if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot + (wobble ? Math.sin(t * 20) * 0.02 * Math.max(0, 1 - p) : 0));
  const kb = eBack(clamp(p * 1.6)); if (burst) { ctx.save(); ctx.scale(kb, kb); const R = rng(seed); ctx.font = `400 ${size}px Luckiest`; const tw = ctx.measureText(text).width; const rx = tw * 0.62 + 50, ry = size * 0.95; const pts = [];
    for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, rr = i % 2 ? 0.72 : 1 + R() * 0.25; pts.push(Math.cos(a) * rx * rr, Math.sin(a) * ry * rr); }
    ctx.save(); ctx.translate(10, 14); poly(ctx, pts, 'rgba(12,6,28,0.45)', 0); ctx.restore(); poly(ctx, pts, burst, 10); halftone(ctx, -rx, 0, rx * 2, ry, 'rgba(120,0,20,0.3)', 18, 5, 'down'); ctx.restore(); }
  ctx.font = `400 ${size}px Luckiest`; const ws = [...text].map((ch) => ctx.measureText(ch).width), tw = ws.reduce((a, b) => a + b, 0); let xx = -tw / 2;
  [...text].forEach((ch, i) => { const k = eBack(clamp((p - i * 0.07) * 3)); if (k <= 0) { xx += ws[i]; return; } const cx = xx + ws[i] / 2, jy = Math.sin(i * 2.1 + seed) * size * 0.06;
    ctx.save(); ctx.translate(cx, jy); ctx.rotate(Math.sin(i * 1.7 + seed) * 0.08); ctx.scale(k, k);
    txt(ctx, ch, 7, 10, { font: 'Luckiest', weight: 400, size, col: INK, stroke: 18, scol: INK }); txt(ctx, ch, 0, 0, { font: 'Luckiest', weight: 400, size, col, stroke: 16, scol: INK });
    ctx.save(); ctx.beginPath(); ctx.rect(-ws[i], -size * 0.6, ws[i] * 2, size * 0.28); ctx.clip(); txt(ctx, ch, 0, 0, { font: 'Luckiest', weight: 400, size, col: '#fff8d8' }); ctx.restore();
    ctx.restore(); xx += ws[i]; });
  ctx.restore();
}
// full-frame speed lines (radial focus burst or parallel streaks with dir in radians)
export function speedLines(ctx, t, o = {}) { speedLinesBg(ctx, t, o); }
// small glint sweep across a rect (glass, chrome, phone): p 0..1
export function glint(ctx, x, y, w, h, p, { width = 0.18, a = 0.8 } = {}) { if (p <= 0 || p >= 1) return; ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); const cx = x - w * 0.5 + p * w * 2; ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx + w * width, y); ctx.lineTo(cx + w * width - h * 0.6, y + h); ctx.lineTo(cx - h * 0.6, y + h); ctx.fill(); ctx.restore(); }
// thought bubble: cloud at (x,y) size w×h with trailing circles toward (tx,ty); content(ctx) draws inside (centred at 0,0) or text
export function thoughtBubble(ctx, { x, y, w = 560, h = 380, tx, ty, p = 1, t = 0, text = null, size = 64, content = null, seed = 3, fill = '#fff' }) {
  const k = eBack(clamp(p)); if (k <= 0.01) return; ctx.save();
  // trailing circles appear first
  for (let i = 0; i < 3; i++) { const q = (i + 1) / 4, kk = eBack(clamp(p * 3 - i * 0.5)); if (kk <= 0) continue; const cx = lerp(tx, x, q), cy = lerp(ty, y + h * 0.35, q), r = (14 + i * 12) * kk;
    circ(ctx, cx + 6, cy + 8, r, 'rgba(12,6,28,0.3)', 0); circ(ctx, cx, cy, r, fill, 8); }
  ctx.translate(x, y + Math.sin(t * 2.2) * 6); ctx.scale(k, k);
  const R = rng(seed), lobes = []; const n = 11; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; lobes.push([Math.cos(a) * w * 0.42, Math.sin(a) * h * 0.36, Math.min(w, h) * (0.22 + R() * 0.08)]); }
  const cloud = (c) => { for (const [lx, ly, r] of lobes) { c.moveTo(lx + r, ly); c.arc(lx, ly, r, 0, 7); } c.moveTo(w * 0.42, 0); c.ellipse(0, 0, w * 0.42, h * 0.36, 0, 0, 7); };
  ctx.save(); ctx.translate(10, 14); ctx.beginPath(); cloud(ctx); ctx.fillStyle = 'rgba(12,6,28,0.3)'; ctx.fill(); ctx.restore();
  ctx.fillStyle = INK; for (const [lx, ly, r] of lobes) { ctx.beginPath(); ctx.arc(lx, ly, r + 9, 0, 7); ctx.fill(); } ctx.beginPath(); ctx.ellipse(0, 0, w * 0.42 + 9, h * 0.36 + 9, 0, 0, 7); ctx.fill();
  ctx.fillStyle = fill; ctx.beginPath(); cloud(ctx); ctx.fill();
  ctx.save(); ctx.beginPath(); cloud(ctx); ctx.clip(); ctx.fillStyle = 'rgba(160,170,210,0.25)'; ctx.beginPath(); ctx.ellipse(w * 0.08, h * 0.2, w * 0.5, h * 0.3, 0, 0, 7); ctx.fill(); ctx.restore();
  if (content) { ctx.save(); content(ctx); ctx.restore(); }
  else if (text) txt(ctx, text, 0, 0, { font: 'Luckiest', weight: 400, size, col: INK });
  ctx.restore();
}
// phone notification banner sliding down from the top (screen space). p: 0→1 in, out: 0→1 slide away
export function notifBanner(ctx, { app = 'SMOKE ALARM', title = 'Smoke detected', body = '', icon = '🔥', iconCol = '#ff4d4d', time = 'now', p = 1, out = 0, y = 70 } = {}) {
  const k = eBack(clamp(p)), ko = eIn(clamp(out)); if (k <= 0 || ko >= 1) return;
  const rs = ctx.canvas.width / W; ctx.save(); ctx.setTransform(rs, 0, 0, rs, 0, 0);
  const bw = 960, bh = body ? 230 : 180, bx = (W - bw) / 2, by = lerp(-bh - 40, y, k) - ko * (bh + y + 60);
  ctx.fillStyle = 'rgba(12,6,28,0.35)'; ctx.beginPath(); rrPath(ctx, bx + 8, by + 14, bw, bh, 44); ctx.fill();
  ctx.fillStyle = 'rgba(250,250,252,0.97)'; ctx.beginPath(); rrPath(ctx, bx, by, bw, bh, 44); ctx.fill(); ctx.strokeStyle = 'rgba(28,21,48,0.15)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = iconCol; ctx.beginPath(); rrPath(ctx, bx + 34, by + 34, 96, 96, 24); ctx.fill(); ctx.font = '56px "Noto Color Emoji"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(icon, bx + 82, by + 86);
  const T = (s, x, yy, sz, wt, col, al = 'left') => { ctx.font = `${wt} ${sz}px Inter, sans-serif`; ctx.textAlign = al; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = col; ctx.fillText(s, x, yy); };
  T(app.toUpperCase(), bx + 156, by + 66, 28, 700, '#8a8a96'); T(time, bx + bw - 40, by + 66, 28, 500, '#8a8a96', 'right');
  T(title, bx + 156, by + 116, 40, 800, '#16161d'); if (body) T(body, bx + 156, by + 170, 36, 500, '#2a2a33');
  ctx.fillStyle = 'rgba(28,21,48,0.18)'; ctx.beginPath(); rrPath(ctx, W / 2 - 50, by + bh - 18, 100, 8, 4); ctx.fill();
  ctx.restore();
}
// rubber stamp slammed onto the frame: big→1 with a thud, distressed ink. (x,y) centre, p 0..1 (impact at p≈0.35)
export function stamp(ctx, x, y, text, p, { col = '#e8412f', size = 64, rot = -0.14, lines = null, w = null, t = 0 } = {}) {
  if (p <= 0) return; const ls = lines || [text]; const q = clamp(p / 0.35), s = q < 1 ? lerp(2.6, 1, eIn(q)) : 1 + Math.sin((p - 0.35) * 40) * 0.04 * Math.max(0, 1 - (p - 0.35) * 4);
  const a = q < 1 ? 0.35 + 0.65 * q : 1;
  withFilter(ctx, 'opacity(0.93)', (g) => {
    g.translate(x, y); g.rotate(rot); g.scale(s, s); g.font = `400 ${size}px Anton`;
    const tw = w || Math.max(...ls.map((l) => g.measureText(l).width)) + 90, lh = size * 1.12, th = ls.length * lh + 60;
    g.lineJoin = 'round'; g.strokeStyle = col; g.lineWidth = 12; g.beginPath(); rrPath(g, -tw / 2, -th / 2, tw, th, 18); g.stroke(); g.lineWidth = 5; g.beginPath(); rrPath(g, -tw / 2 + 16, -th / 2 + 16, tw - 32, th - 32, 10); g.stroke();
    g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; ls.forEach((l, i) => g.fillText(l, 0, -th / 2 + 30 + lh * (i + 0.5) + size * 0.05));
    g.globalCompositeOperation = 'destination-out'; const R = rng(9); for (let i = 0; i < 260; i++) { g.globalAlpha = 0.5 + R() * 0.5; g.beginPath(); g.arc((R() - 0.5) * tw, (R() - 0.5) * th, 1 + R() * 4.5, 0, 7); g.fill(); }
    g.globalAlpha = 0.6; for (let i = 0; i < 6; i++) { g.fillRect((R() - 0.5) * tw, (R() - 0.5) * th, 20 + R() * 120, 3); }
  }, a);
  if (p > 0.35 && p < 0.7) { const k = (p - 0.35) / 0.35; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); impactLines(ctx, 0, 0, 200 + 120 * k, t, { n: 14, col, lw: 6 * (1 - k) + 1 }); ctx.restore(); }
}
// "OUI." gag card lettering with a beret on the O and a tiny moustache; p = pop-in, t = time
export function ouiCard(ctx, t, { p = 1, x = W / 2, y = H * 0.4, sub = null } = {}) {
  const k = eBack(clamp(p)); if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(-0.05 + Math.sin(t * 2.5) * 0.015); ctx.scale(k, k);
  const L = [['O', -250, '#fff'], ['U', 0, '#fff'], ['I', 200, '#fff'], ['.', 310, '#ffd43b']]; const sz = 330;
  L.forEach(([ch, lx, c], i) => { const b = Math.sin(t * 6 + i * 0.9) * 10; txt(ctx, ch, lx + 12, b + 16, { font: 'Luckiest', weight: 400, size: sz, col: INK, stroke: 26, scol: INK }); txt(ctx, ch, lx, b, { font: 'Luckiest', weight: 400, size: sz, col: c, stroke: 22, scol: INK }); });
  // beret on the O
  const bx = -250, by = -175 + Math.sin(t * 6) * 10; ctx.save(); ctx.translate(bx, by); ctx.rotate(-0.25 + Math.sin(t * 3) * 0.05);
  P(ctx, (c) => c.ellipse(0, 0, 150, 56, 0, 0, 7), '#1c1530', 10); P(ctx, (c) => c.ellipse(-20, -14, 120, 36, 0, Math.PI, 0), '#3a3350', 0); line(ctx, 10, -54, 18, -86, 12); ctx.restore();
  // moustache under the U
  P(ctx, (c) => { c.moveTo(0, 150); c.bezierCurveTo(-40, 120, -110, 130, -130, 175); c.bezierCurveTo(-90, 160, -40, 175, 0, 165); c.bezierCurveTo(40, 175, 90, 160, 130, 175); c.bezierCurveTo(110, 130, 40, 120, 0, 150); }, '#1c1530', 6);
  if (sub) { ctx.save(); ctx.rotate(0.06); ctx.font = '400 56px Anton'; const w = ctx.measureText(sub).width + 70; P(ctx, (c) => rrPath(c, -w / 2, 230, w, 92, 16), '#2346c8', 9); txt(ctx, sub, 0, 278, { font: 'Anton', weight: 400, size: 56, col: '#fff' }); ctx.restore(); }
  ctx.restore();
}
