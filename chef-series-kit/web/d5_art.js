// Ep5 props + set (flat style: #1c1530 ink, one hard shadow tone). All school / brand names are invented.
// Set: cook_school (the in-person class: coral tile wall, painted "WHISK & CO." sign, the school's framed MASTER CHEF diploma,
//      pan rack, jar shelf; front steel station counter as a fg layer).
// Props: bread, plate, butter, cheese, sandwich (normal / cheese-outside / squashed / bread-only), mustard bottle + jet + face splats,
//        lettuce, tomato, magnifier, whiteboard, résumé sheet, comment card (screen space), frost overlay.
import { W, H, INK, M, rng, clamp, lerp, rect, circ, ell, poly, line, P, box, clipTo, halftone, stripes, speckle, txt, glow, blobPath, rrPath, shadeCol, hash,
  fillAll, defSet, pool, shaft, ao, vignette2, keyGrad, texture, plant } from './bgkit.js';
import { eBack, eOut } from './util.js';
const TAU = Math.PI * 2;
const fill = (ctx, col) => fillAll(ctx, col);

/* ============================== set: cook_school ============================== */
export const DIP = { x: 250, y: 330, w: 580, h: 440 };   // the diploma on the wall
export const STATION = { top: 1390 };                      // front counter top edge
function diploma(ctx, x, y, w, h) {
  box(ctx, x, y, w, h, '#c9a24a', '#a07c2c', { side: 'b', sw: 14, lw: 8 });
  P(ctx, (c) => c.rect(x + 22, y + 22, w - 44, h - 44), '#fbf3dc', 5);
  ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 4; ctx.strokeRect(x + 38, y + 38, w - 76, h - 76);
  txt(ctx, 'WHISK & CO. COOKING SCHOOL', x + w / 2, y + 80, { font: 'Inter', weight: 800, size: 24, col: '#8a6a2a' });
  txt(ctx, 'MASTER CHEF', x + w / 2, y + 150, { font: 'Anton', weight: 400, size: 86, col: '#2a2140' });
  txt(ctx, 'certified · honours · very fancy', x + w / 2, y + 210, { font: 'Inter', weight: 600, size: 22, col: '#8a6a2a', style: 'italic' });
  for (let i = 0; i < 3; i++) { ctx.fillStyle = 'rgba(42,33,64,0.25)'; ctx.fillRect(x + 90, y + 260 + i * 34, w - 180 - i * 60, 8); }
  // gold seal + ribbon
  const sx = x + w - 96, sy = y + h - 96;
  poly(ctx, [sx - 26, sy + 20, sx - 44, sy + 92, sx - 18, sy + 74, sx - 4, sy + 100, sx + 6, sy + 24], '#d8332f', 4);
  poly(ctx, [sx + 6, sy + 20, sx + 44, sy + 92, sx + 20, sy + 80, sx + 6, sy + 104, sx - 6, sy + 24], '#b52626', 4);
  P(ctx, (c) => { for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = i % 2 ? 46 : 54; i ? c.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r) : c.moveTo(sx + r, sy); } c.closePath(); }, '#e6b84a', 5);
  circ(ctx, sx, sy, 32, '#f3cf6a', 4); txt(ctx, '★', sx, sy + 2, { size: 34, col: '#a07c2c' });
  // signature
  ctx.strokeStyle = '#2a2140'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 80, y + h - 80); for (let i = 0; i < 9; i++) ctx.quadraticCurveTo(x + 95 + i * 18, y + h - 120 + (i % 2) * 50, x + 104 + i * 18, y + h - 84); ctx.stroke();
}
function schoolStat(ctx, o) {
  // coral tile wall
  fill(ctx, '#ef8656'); ctx.fillStyle = '#d96f43';
  const s = 96; for (let y = -M; y < H + M; y += s) ctx.fillRect(-M, y, W + 2 * M, 7); for (let x = -M; x < W + M; x += s) ctx.fillRect(x, -M, 7, H + 2 * M);
  halftone(ctx, -M, 700, W + 2 * M, 900, 'rgba(150,50,20,0.35)', 22, 5, 'down');
  pool(ctx, 540, 520, 700, 520, '255,230,190', 0.35);
  // painted school sign
  P(ctx, (c) => c.roundRect(150, 140, 780, 120, 60), '#fbf3dc', 8);
  txt(ctx, 'WHISK & CO.', 540, 196, { font: 'Luckiest', weight: 400, size: 70, col: '#2b9c8f' });
  txt(ctx, '🥄', 205, 200, { font: 'Noto Color Emoji', size: 54, weight: 400 }); txt(ctx, '🍳', 875, 200, { font: 'Noto Color Emoji', size: 54, weight: 400 });
  // pan rack (left)
  line(ctx, -M, 360, 210, 360, 10, '#5a4630');
  [[-40, 'pan'], [60, 'ladle'], [140, 'pot']].forEach(([x, k]) => { line(ctx, x, 360, x, 430, 5);
    if (k === 'pan') { circ(ctx, x, 500, 66, '#c9824a', 7); circ(ctx, x, 500, 44, '#a8642f', 0); }
    else if (k === 'ladle') { line(ctx, x, 430, x, 560, 10, '#c3ccd5'); P(ctx, (c) => c.arc(x, 570, 34, 0, Math.PI), '#c3ccd5', 6); }
    else { P(ctx, (c) => c.roundRect(x - 50, 440, 100, 90, 14), '#c9824a', 7); } });
  // jar shelf (right)
  box(ctx, 860, 600, 420, 30, '#8e5a33', '#6e4426', { side: 'b', sw: 10, lw: 7 });
  [[900, '#ffd43b', 90], [975, '#7ee081', 120], [1050, '#ff9ad5', 80]].forEach(([x, c, h]) => { P(ctx, (q) => q.roundRect(x - 30, 600 - h, 60, h, 12), 'rgba(220,240,250,0.85)', 6); ctx.fillStyle = c; ctx.fillRect(x - 24, 600 - h * 0.6, 48, h * 0.6 - 6); rect(ctx, x - 34, 600 - h - 16, 68, 20, '#e2463f', 5, 6); });
  // diploma
  diploma(ctx, DIP.x, DIP.y, DIP.w, DIP.h);
  // a fire extinguisher + poster lower right, plant lower left
  P(ctx, (c) => c.roundRect(940, 900, 90, 230, 30), '#e2263b', 7); rect(ctx, 960, 870, 50, 36, INK, 0, 8); txt(ctx, '!', 985, 1010, { font: 'Anton', weight: 400, size: 70, col: '#fff' });
  P(ctx, (c) => c.rect(40, 880, 200, 270), '#fbf3dc', 7); txt(ctx, 'WASH', 140, 940, { font: 'Anton', weight: 400, size: 46, col: '#2b9c8f' }); txt(ctx, 'HANDS', 140, 990, { font: 'Anton', weight: 400, size: 46, col: '#2b9c8f' }); txt(ctx, '🧼', 140, 1070, { font: 'Noto Color Emoji', size: 70, weight: 400 });
  texture(ctx, -M, -M, W + 2 * M, H + 2 * M, 11, 0.05, 260);
  // back counter line
  box(ctx, -M, 1240, W + 2 * M, 40, '#c3ccd5', '#9aa6b2', { side: 'b', sw: 12, lw: 7 });
  ctx.fillStyle = '#5b6b7a'; ctx.fillRect(-M, 1280, W + 2 * M, H); line(ctx, -M, 1280, W + M, 1280, 6);
  ao(ctx, -M, 1280, W + 2 * M, 80, 't', 0.45);
}
function schoolFront(ctx, o) {
  if (o.noStation) return;
  const y = o.stationY ?? STATION.top;
  box(ctx, -M, y, W + 2 * M, 70, '#dfe6ec', '#b8c3cc', { side: 'b', sw: 22, lw: 9 });
  line(ctx, -M, y + 8, W + M, y + 8, 5, 'rgba(255,255,255,0.9)');
  ctx.fillStyle = '#3c4a5a'; ctx.fillRect(-M, y + 70, W + 2 * M, H); line(ctx, -M, y + 70, W + M, y + 70, 7);
  for (const x of [-40, 380, 800]) { rect(ctx, x, y + 120, 360, 520, '#46576a', 6, 10); rect(ctx, x + 130, y + 150, 100, 14, '#c3ccd5', 4, 6); }
  ao(ctx, -M, y + 70, W + 2 * M, 80, 't', 0.5);
}
defSet('cook_school', { layers: [{ name: 'back', d: 0.94, stat: schoolStat }, { name: 'front', d: 1, front: true, anim: schoolFront }],
  grade: (c) => { keyGrad(c, 'soft-light', [[0, 'rgba(255,225,170,0.5)'], [1, 'rgba(120,40,80,0.4)']]); vignette2(c, 0.38, '40,10,20'); } });

/* ============================== props ============================== */
export const BREAD = '#f3d9a0', CRUST = '#c98a3c', CHEESE = '#ffcc33', CHEESE_SH = '#e0a817', MUST = '#ffd21f', MUST_SH = '#e0a800';
// slice of bread, front view (x,y = centre), s=1 → ~300 px wide
export function bread(ctx, x, y, s = 1, rot = 0, { butter = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const sh = (c) => { c.moveTo(-130, 120); c.lineTo(-130, -40); c.bezierCurveTo(-170, -80, -150, -150, -80, -150); c.bezierCurveTo(-40, -175, 40, -175, 80, -150); c.bezierCurveTo(150, -150, 170, -80, 130, -40); c.lineTo(130, 120); c.quadraticCurveTo(130, 135, 115, 135); c.lineTo(-115, 135); c.quadraticCurveTo(-130, 135, -130, 120); c.closePath(); };
  P(ctx, sh, CRUST, 8);
  ctx.save(); ctx.translate(0, 8); ctx.scale(0.84, 0.84); P(ctx, sh, BREAD, 0); ctx.restore();
  speckle(ctx, -110, -120, 220, 240, 'rgba(201,138,60,0.45)', 40, 7, 3.2);
  if (butter > 0) { ctx.globalAlpha = clamp(butter); P(ctx, (c) => blobPath(c, 0, 0, 90, 4, 9, 0.25), '#fff2a8', 0); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(-50, -30, 70, 10); ctx.globalAlpha = 1; }
  ctx.restore();
}
// plate seen from slightly above; butter: 0..1 shiny butter swirls on the plate itself
export function plate(ctx, x, y, s = 1, { butter = 0, t = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  P(ctx, (c) => c.ellipse(0, 14, 300, 92, 0, 0, TAU), '#c9d3dc', 8);
  P(ctx, (c) => c.ellipse(0, 0, 300, 90, 0, 0, TAU), '#ffffff', 8);
  P(ctx, (c) => c.ellipse(0, 0, 200, 56, 0, 0, TAU), '#f1f4f7', 4);
  if (butter > 0) { const k = clamp(butter); ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 200, 56, 0, 0, TAU); ctx.clip();
    ctx.lineCap = 'round'; for (let i = 0; i < 5; i++) { const u = clamp(k * 5 - i); if (u <= 0) break; ctx.strokeStyle = '#ffe680'; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(-170 + i * 10, -30 + i * 14); ctx.lineTo(-170 + i * 10 + 330 * u, -36 + i * 14 + 8 * Math.sin(i)); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 5; ctx.stroke(); }
    ctx.restore(); }
  ctx.restore();
}
export function butterStick(ctx, x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); box(ctx, -90, -34, 180, 68, '#fff2a8', '#e8d070', { side: 'b', sw: 16, lw: 6, r: 8 }); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillRect(-70, -24, 80, 8); ctx.restore(); }
export function butterKnife(ctx, x, y, s = 1, rot = 0, smear = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  P(ctx, (c) => c.roundRect(-160, -18, 150, 36, 14), '#2b9c8f', 6);
  P(ctx, (c) => { c.moveTo(-10, -16); c.lineTo(170, -16); c.quadraticCurveTo(210, -2, 170, 18); c.lineTo(-10, 18); c.closePath(); }, '#dfe6ec', 6);
  if (smear) P(ctx, (c) => c.ellipse(130, 0, 44, 13, 0, 0, TAU), '#ffe680', 4);
  ctx.restore();
}
export function cheese(ctx, x, y, s = 1, rot = 0, sag = 0) {   // square slice with holes; sag droops the corners
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  P(ctx, (c) => { c.moveTo(-120, -110); c.lineTo(120, -110); c.lineTo(120 + sag * 10, 110 + sag * 60); c.quadraticCurveTo(0, 110 + sag * 10, -120 - sag * 10, 110 + sag * 60); c.closePath(); }, CHEESE, 7);
  ctx.fillStyle = CHEESE_SH; ctx.fillRect(-112, 70, 224, 30);
  [[-60, -50, 18], [40, -20, 24], [-20, 50, 14], [70, 60, 12]].forEach(([a, b, r]) => P(ctx, (c) => c.arc(a, b, r, 0, TAU), CHEESE_SH, 4));
  ctx.restore();
}
export function lettuce(ctx, x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  P(ctx, (c) => { for (let i = 0; i <= 16; i++) { const a = i / 16 * TAU, r = (i % 2 ? 70 : 95); i ? c.lineTo(Math.cos(a) * r * 1.4, Math.sin(a) * r * 0.7) : c.moveTo(r * 1.4, 0); } c.closePath(); }, '#7ee081', 6);
  line(ctx, -100, 0, 100, 0, 5, '#3aa060'); for (let i = -2; i <= 2; i++) line(ctx, i * 36, 0, i * 36 + 20, -36, 4, '#3aa060');
  ctx.restore(); }
export function tomato(ctx, x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  circ(ctx, 0, 0, 70, '#e2453c', 7); circ(ctx, 0, 0, 52, '#ff6a5a', 0);
  for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.4; P(ctx, (c) => c.ellipse(Math.cos(a) * 30, Math.sin(a) * 30, 16, 10, a, 0, TAU), '#ffd0b0', 3); }
  ctx.restore(); }
export function ham(ctx, x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  P(ctx, (c) => blobPath(c, 0, 0, 110, 12, 10, 0.12), '#ff9ab0', 7); P(ctx, (c) => blobPath(c, 6, 4, 80, 13, 10, 0.12), '#ffb8c6', 0); ctx.restore(); }
// sandwich (side view): layers stack upward from (x,y) = bottom centre. s=1 → ~420 px wide.
// mode: 'normal' (lettuce/tomato/ham/cheese inside), 'cheeseOut' (cheese draped OUTSIDE, top + bottom), 'bread' (just two slices)
// squash 0..1 flattens it (pressing), puff 0..1 bulges the fillings out the sides
export function sandwich(ctx, x, y, s = 1, { mode = 'normal', squash = 0, puff = 0, rot = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s * (1 - 0.45 * squash));
  const slice = (yy, top) => { P(ctx, (c) => c.roundRect(-210, yy - 50, 420, 50, top ? [40, 40, 14, 14] : [14, 14, 30, 30]), CRUST, 7); P(ctx, (c) => c.roundRect(-196, yy - (top ? 50 : 42), 392, top ? 30 : 30, 10), BREAD, 0); };
  let yy = 0;
  if (mode === 'cheeseOut') P(ctx, (c) => { c.moveTo(-230, 6); c.lineTo(230, 6); c.lineTo(214, 40); c.lineTo(160, 22); c.lineTo(80, 50); c.lineTo(0, 24); c.lineTo(-90, 46); c.lineTo(-170, 20); c.lineTo(-226, 36); c.closePath(); }, CHEESE, 6);
  slice(yy, false); yy -= 50;
  if (mode === 'normal') { const b = 1 + puff * 0.7;
    P(ctx, (c) => { c.moveTo(-226 * b, yy + 4); for (let i = 0; i <= 10; i++) c.lineTo(-226 * b + i * 45.2 * b, yy - 18 + (i % 2) * 18); c.lineTo(226 * b, yy + 4); c.closePath(); }, '#7ee081', 6);
    P(ctx, (c) => c.roundRect(-200 * b, yy - 46, 400 * b, 28, 12), '#e2453c', 6);
    P(ctx, (c) => c.roundRect(-214 * b, yy - 66, 428 * b, 22, 10), '#ff9ab0', 6);
    P(ctx, (c) => { c.moveTo(-220 * b, yy - 66); c.lineTo(220 * b, yy - 66); c.lineTo(220 * b, yy - 84); c.lineTo(-220 * b, yy - 84); c.closePath(); }, CHEESE, 6);
    yy -= 84; }
  else yy -= 4;
  slice(yy, true);
  if (mode === 'cheeseOut') { const ty = yy - 50; P(ctx, (c) => { c.moveTo(-232, ty - 4); c.quadraticCurveTo(0, ty - 30, 232, ty - 4); c.lineTo(222, ty + 40); c.lineTo(150, ty + 18); c.lineTo(60, ty + 52); c.lineTo(-20, ty + 22); c.lineTo(-110, ty + 50); c.lineTo(-180, ty + 20); c.lineTo(-226, ty + 44); c.closePath(); }, CHEESE, 6);
    [[-120, ty + 4, 12], [40, ty - 2, 16], [150, ty + 8, 10]].forEach(([a, b, r]) => P(ctx, (c) => c.arc(a, b, r, 0, TAU), CHEESE_SH, 3)); }
  ctx.restore();
}
// squeeze bottle of invented "ZING!" mustard. (x,y) = bottle centre; rot radians (0 = nozzle up); squeeze 0..1
export function mustard(ctx, x, y, s = 1, rot = 0, squeeze = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * (1 + 0.12 * squeeze), s);
  P(ctx, (c) => { c.moveTo(-16, -250); c.lineTo(16, -250); c.lineTo(30, -170); c.lineTo(-30, -170); c.closePath(); }, MUST, 6);
  P(ctx, (c) => c.roundRect(-60, -180, 120, 34, 10), '#e2453c', 6);
  P(ctx, (c) => c.roundRect(-80 + squeeze * 14, -150, 160 - squeeze * 28, 300, [40, 40, 30, 30]), MUST, 7);
  ctx.fillStyle = MUST_SH; ctx.fillRect(28 - squeeze * 10, -140, 36, 280);
  P(ctx, (c) => c.roundRect(-64, -60, 128, 110, 14), '#e2453c', 5);
  txt(ctx, 'ZING!', 0, -6, { font: 'Luckiest', weight: 400, size: 40, col: '#fff' });
  ctx.restore();
}
// mustard jet from (x0,y0) to (x1,y1), k 0..1 progress
export function mustardJet(ctx, x0, y0, x1, y1, k, t = 0, w = 30) {
  if (k <= 0) return; const ex = lerp(x0, x1, clamp(k)), ey = lerp(y0, y1, clamp(k));
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + ex) / 2, Math.min(y0, ey) - 40, ex, ey); ctx.strokeStyle = INK; ctx.lineWidth = w + 14; ctx.stroke(); ctx.strokeStyle = MUST; ctx.lineWidth = w; ctx.stroke();
  for (let i = 0; i < 6; i++) { const u = (t * 2 + i / 6) % 1; circ(ctx, lerp(x0, ex, u) + Math.sin(i * 3) * 20, lerp(y0, ey, u) + Math.cos(i * 2) * 20, 9, MUST, 3); }
}
export function splat(ctx, x, y, r, seed = 1, col = MUST, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  P(ctx, (c) => blobPath(c, 0, 0, r, seed, 11, 0.45), col, Math.max(3, r * 0.08));
  const R = rng(seed); for (let i = 0; i < 5; i++) { const a = R() * TAU, d = r * (1.2 + R() * 0.5); circ(ctx, Math.cos(a) * d, Math.sin(a) * d, r * (0.1 + R() * 0.12), col, Math.max(2, r * 0.06)); }
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-r * 0.3, -r * 0.3, r * 0.25, r * 0.12, -0.5, 0, TAU); ctx.fill();
  ctx.restore();
}
// drips running down from a splat
export function drips(ctx, x, y, r, k, seed = 1, col = MUST) { const R = rng(seed + 9); for (let i = 0; i < 3; i++) { const dx = (R() - 0.5) * r * 1.2, L = r * (0.4 + R() * 0.9) * clamp(k); if (L < 2) continue; P(ctx, (c) => { c.moveTo(x + dx - 9, y); c.lineTo(x + dx - 7, y + L); c.arc(x + dx, y + L, 8, Math.PI, 0, true); c.lineTo(x + dx + 9, y); c.closePath(); }, col, 3); } }
export function magnifier(ctx, x, y, s = 1, rot = 0, inner = null) {   // (x,y) = lens centre; lens r = 110*s
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  P(ctx, (c) => c.roundRect(110 * s, -20 * s, 190 * s, 40 * s, 18 * s), '#5a3a2a', 7);
  circ(ctx, 0, 0, 120 * s, '#c9a24a', 8);
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 104 * s, 0, TAU); ctx.clip(); ctx.fillStyle = inner ? '#fbf3dc' : 'rgba(220,245,255,0.9)'; ctx.fillRect(-110 * s, -110 * s, 220 * s, 220 * s); if (inner) { ctx.rotate(-rot); ctx.translate(-x, -y); inner(ctx); } ctx.fillStyle = 'rgba(190,230,255,0.25)'; ctx.fillRect(-2000, -2000, 4000, 4000); ctx.restore();
  P(ctx, (c) => c.arc(0, 0, 104 * s, 0, TAU), null, 6); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(-44 * s, -44 * s, 34 * s, 14 * s, -0.8, 0, TAU); ctx.fill();
  ctx.restore();
}
export function clipboard(ctx, x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  P(ctx, (c) => c.roundRect(-90, -120, 180, 240, 14), '#a8693f', 6); P(ctx, (c) => c.rect(-70, -96, 140, 196), '#fff', 4); P(ctx, (c) => c.roundRect(-40, -134, 80, 34, 8), '#c3ccd5', 5);
  for (let i = 0; i < 5; i++) { ctx.fillStyle = '#9aa0b0'; ctx.fillRect(-54, -70 + i * 32, 100 - (i % 2) * 30, 8); } ctx.restore(); }
// big whiteboard with the recipe (screen-ish coords). p: 0..1 lines written; hi: 0..1 underline of EASY
export function whiteboard(ctx, x, y, w, h, { p = 1, hi = 0 } = {}) {
  box(ctx, x, y, w, h, '#f7f7f4', '#d4d4cc', { side: 'b', sw: 18, lw: 9, r: 10 }); rect(ctx, x + 10, y + h - 4, w - 20, 26, '#8e9aa6', 6, 6);
  const L = [['THE EASY SANDWICH 🥪', 66, '#e2263b'], ['1. butter the bread', 50, '#2a2140'], ['2. cheese goes inside', 50, '#2a2140'], ['3. mustard (gently!)', 50, '#2a2140'], ['4. press. done!', 50, '#2b9c8f']];
  L.forEach(([s, sz, col], i) => { const k = clamp(p * L.length - i); if (k <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(x, y, 70 + (w - 80) * k, h); ctx.clip();
    txt(ctx, s, x + (i ? 60 : w / 2), y + 90 + i * 104 + (i ? 20 : 0), { font: i ? 'Luckiest' : 'Anton', weight: 400, size: sz, col, align: i ? 'left' : 'center' }); ctx.restore(); });
  if (hi > 0) { ctx.strokeStyle = '#e2263b'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + w / 2 - 210, y + 134); ctx.lineTo(x + w / 2 - 210 + 170 * clamp(hi), y + 128); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x + w / 2 - 125, y + 92, 120, 56, -0.05, -1.6, -1.6 + TAU * clamp(hi)); ctx.stroke(); }
}
// résumé sheet (for the panic thought bubble): (0,0) centre
export function resumeSheet(ctx, s = 1, hi = 1) { ctx.save(); ctx.scale(s, s);
  P(ctx, (c) => c.rect(-170, -210, 340, 420), '#fff', 7);
  txt(ctx, 'RÉSUMÉ', 0, -160, { font: 'Anton', weight: 400, size: 56, col: INK }); txt(ctx, 'Sam · Chef', 0, -112, { font: 'Inter', weight: 700, size: 28, col: '#8a8a96' });
  ctx.fillStyle = '#d6d6de'; for (let i = 0; i < 2; i++) ctx.fillRect(-130, -70 + i * 26, 260 - i * 50, 10);
  if (hi > 0) { ctx.fillStyle = 'rgba(255,212,59,0.95)'; ctx.fillRect(-150, -6, 300 * clamp(hi), 104); }
  txt(ctx, '10 YEARS', 0, 22, { font: 'Anton', weight: 400, size: 46, col: INK }); txt(ctx, 'FINE DINING', 0, 72, { font: 'Anton', weight: 400, size: 46, col: INK });
  ctx.fillStyle = '#d6d6de'; for (let i = 0; i < 3; i++) ctx.fillRect(-130, 124 + i * 26, 260 - (i % 2) * 70, 10);
  ctx.restore(); }
// icy frost around the frame edges (screen space), a 0..1
export function frost(ctx, a, t = 0) { if (a <= 0) return; const rs = ctx.canvas.width / W; ctx.save(); ctx.setTransform(rs, 0, 0, rs, 0, 0); ctx.globalAlpha = clamp(a);
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.7); g.addColorStop(0, 'rgba(180,230,255,0)'); g.addColorStop(1, 'rgba(200,240,255,0.85)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const R = rng(4); ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < 26; i++) { const side = i % 4, u = R(); let x = side === 0 ? u * W : side === 1 ? W : side === 2 ? u * W : 0, y = side === 0 ? 0 : side === 1 ? u * H : side === 2 ? H : u * H; const ang = Math.atan2(H / 2 - y, W / 2 - x) + (R() - 0.5) * 0.8, L = 80 + R() * 160;
    ctx.beginPath(); ctx.moveTo(x, y); const x2 = x + Math.cos(ang) * L, y2 = y + Math.sin(ang) * L; ctx.lineTo(x2, y2); for (const d of [-0.6, 0.6]) { ctx.moveTo(lerp(x, x2, 0.55), lerp(y, y2, 0.55)); ctx.lineTo(lerp(x, x2, 0.55) + Math.cos(ang + d) * L * 0.35, lerp(y, y2, 0.55) + Math.sin(ang + d) * L * 0.35); } ctx.stroke(); }
  ctx.restore(); }

/* ============================== the viewer's comment card (screen space) ============================== */
// The comment text with highlight groups: 1 = "cooking class OFFLINE", 2 = "background check", 3 = "cook a sandwich, it is easy."
const CTEXT = [['Do', 0], ['a', 0], ['cooking', 1], ['class', 1], ['OFFLINE', 1], ['with', 0], ['a', 0], ['background', 2], ['check', 2], ['please', 0], ['and', 0], ['cook', 3], ['a', 3], ['sandwich,', 3], ['it', 3], ['is', 3], ['easy.', 3], ['I', 4], ['believe', 4], ['in', 4], ['you', 4], ['Sam', 4], ['☕🥪', 4]];
export const COMMENT_USER = 'doodle_teacher';
// o: {x,y (centre), s, p pop, hl:[h1,h2,h3,h4] 0..1, heart 0..1, reply: string|null, replyK 0..1 typed, liked}
export function commentCard(ctx, o = {}) {
  const k = eBack(clamp(o.p ?? 1)); if (k <= 0) return;
  const rs = ctx.canvas.width / W; ctx.save(); if (o.screen !== false) ctx.setTransform(rs, 0, 0, rs, 0, 0);
  ctx.translate(o.x ?? W / 2, o.y ?? H * 0.42); ctx.rotate(o.rot ?? -0.02); ctx.scale(k * (o.s ?? 1), k * (o.s ?? 1));
  const cw = 940, UI = '"Inter", "Noto Color Emoji", sans-serif', size = 46, lh = 64;
  ctx.font = `600 ${size}px ${UI}`;
  // layout words
  const lines = [[]]; let lw = 0; const maxW = cw - 200; const sp = ctx.measureText(' ').width;
  for (const [w, g] of CTEXT) { const ww = ctx.measureText(w).width; if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ w, g, x: lw, ww }); lw += ww + sp; }
  const reply = o.reply, rh = reply ? 150 : 0;
  const ch = 150 + lines.length * lh + 90 + rh, top = -ch / 2;
  ctx.fillStyle = 'rgba(12,6,28,0.4)'; ctx.beginPath(); rrPath(ctx, -cw / 2 + 14, top + 22, cw, ch, 44); ctx.fill();
  P(ctx, (c) => rrPath(c, -cw / 2, top, cw, ch, 44), '#ffffff', 10);
  // header: avatar + username
  const ax = -cw / 2 + 90, ay = top + 92; circ(ctx, ax, ay, 52, '#ffb84a', 6); txt(ctx, '✏️', ax, ay + 2, { font: 'Noto Color Emoji', size: 50, weight: 400 });
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = `800 40px ${UI}`; ctx.fillStyle = '#16161d'; ctx.fillText(COMMENT_USER, ax + 76, ay - 4);
  const uw = ctx.measureText(COMMENT_USER).width; ctx.font = `500 32px ${UI}`; ctx.fillStyle = '#8a8a96'; ctx.fillText('2h', ax + 92 + uw, ay - 4);
  ctx.font = `600 28px ${UI}`; ctx.fillStyle = '#7a3cff'; ctx.fillText('commented on Day 4', ax + 76, ay + 38);
  // body
  const bx = ax - 30, by = top + 210; const hl = o.hl || [];
  ctx.font = `600 ${size}px ${UI}`;
  lines.forEach((ln, i) => { const y = by + i * lh;
    ln.forEach((t, j) => { const h = t.g ? clamp(hl[t.g - 1] || 0) : 0; if (h > 0) { const nx = ln[j + 1], ext = nx && nx.g === t.g ? sp : 0; const hc = t.g === 2 ? 'rgba(255,77,77,0.45)' : 'rgba(255,212,59,0.75)'; ctx.fillStyle = hc; ctx.fillRect(bx + t.x - 4, y - size * 0.86, (t.ww + ext + 8) * eOut(h), size * 1.12); } });
    ln.forEach((t) => { ctx.fillStyle = '#16161d'; ctx.font = `${t.w === 'OFFLINE' ? 900 : 600} ${size}px ${UI}`; ctx.fillText(t.w, bx + t.x, y); }); });
  // footer: like / reply
  const fy = by + lines.length * lh + 10; ctx.font = `700 30px ${UI}`; ctx.fillStyle = '#8a8a96'; ctx.fillText('Reply', bx, fy); ctx.fillText('See translation', bx + 120, fy);
  const hk = clamp(o.heart || 0), hs = 1 + 0.4 * Math.sin(Math.min(1, hk) * Math.PI);
  ctx.save(); ctx.translate(cw / 2 - 80, top + 200); ctx.scale(hs, hs); ctx.font = `400 56px ${UI}`; ctx.textAlign = 'center'; ctx.fillStyle = hk > 0.3 ? '#e2463f' : '#8a8a96'; ctx.fillText(hk > 0.3 ? '❤️' : '♡', 0, 0); ctx.restore();
  ctx.textAlign = 'center'; ctx.font = `700 26px ${UI}`; ctx.fillStyle = '#8a8a96'; ctx.fillText(hk > 0.3 ? '3,107' : '3,106', cw / 2 - 80, top + 250);
  if (o.liked) { ctx.textAlign = 'left'; ctx.font = `700 26px ${UI}`; ctx.fillStyle = '#e2463f'; ctx.fillText('❤️ by creator', bx + 360, fy); }
  if (reply) { const ry = fy + 40; ctx.fillStyle = '#f4f4f7'; ctx.beginPath(); rrPath(ctx, bx + 40, ry, cw - 220, 120, 26); ctx.fill();
    circ(ctx, bx + 90, ry + 60, 34, '#f2b52b', 0); ctx.textAlign = 'center'; ctx.font = `800 34px ${UI}`; ctx.fillStyle = '#fff'; ctx.fillText('S', bx + 90, ry + 72);
    ctx.textAlign = 'left'; ctx.font = `800 26px ${UI}`; ctx.fillStyle = '#16161d'; ctx.fillText('sam.cooks.fr', bx + 140, ry + 44); ctx.font = `700 22px ${UI}`; ctx.fillStyle = '#7a3cff'; ctx.fillText(' creator', bx + 140 + ctx.measureText('sam.cooks.fr').width + 6, ry + 44);
    const s = reply.slice(0, Math.round(reply.length * clamp(o.replyK ?? 1))); ctx.font = `600 32px ${UI}`; ctx.fillStyle = '#16161d'; ctx.fillText(s, bx + 140, ry + 92);
    if ((o.replyK ?? 1) < 1 && Math.floor((o.t || 0) * 2.5) % 2) { ctx.fillStyle = '#2f7cf6'; ctx.fillRect(bx + 144 + ctx.measureText(s).width, ry + 62, 4, 40); } }
  ctx.restore();
}
export const DIPLOMA_DRAW = (ctx) => diploma(ctx, DIP.x, DIP.y, DIP.w, DIP.h);
