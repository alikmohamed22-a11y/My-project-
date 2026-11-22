// Lumière sets: lumiere_ext (queue, A-board, valet), lumiere_dining (diners, waiter, chandeliers), chef_office (wall clock, stopwatch).
import { W, H, INK, M, rng, clamp, lerp, rect, circ, ell, poly, line, P, box, clipTo, halftone, stripes, speckle, txt, glow, blobPath, rrPath, shadeCol, hash,
  fillAll, defSet, pool, shaft, ao, castShadow, rimP, emit, vignette2, keyGrad, holed, rectHole, archHole, texture, sky, clockFace, wisps, twinkle, flame, person, screenSpace,
  frame, windowBlinds, skyline, moon, stars, woodFloor, plant } from './bgkit.js';
import { carStreaks } from './bg_apt.js';
const fill = (ctx, col) => fillAll(ctx, col);
const B0 = [-M, -M, W + M, H + M];
const sparkleStar = (ctx, sx, sy, k, col = '#fff6d8') => poly(ctx, [sx, sy - 26 * k, sx + 7 * k, sy - 7 * k, sx + 26 * k, sy, sx + 7 * k, sy + 7 * k, sx, sy + 26 * k, sx - 7 * k, sy + 7 * k, sx - 26 * k, sy, sx - 7 * k, sy - 7 * k], col, 0);

/* ======================= lumiere_ext ======================= */
export const LUMEXT = { door: [540, 1540], board: [285, 1480], valet: [90, 1640], queue: [[800, 1650], [905, 1660], [1010, 1648], [1110, 1656], [1210, 1650]], ground: 1592 };
function extFarStat(ctx) {
  sky(ctx, -M, -M, W + 2 * M, 1300, [[0, '#120b2e'], [0.45, '#2a1a52'], [0.7, '#5a2a6a'], [0.85, '#a0446a']]);
  stars(ctx, -M, -M, W + 2 * M, 650, 60, 21, 0); moon(ctx, 900, 170, 46);
  skyline(ctx, -M, 560, W + 2 * M, 400, 77, 0); ctx.fillStyle = 'rgba(42,26,82,0.55)'; ctx.fillRect(-M, 560, W + 2 * M, 400);
}
function extFarAnim(ctx, o) {
  const t = o.t || 0;
  for (const [bx, ph] of [[150, 0], [930, 2]]) { const a = -Math.PI / 2 + Math.sin(t * 0.5 + ph) * 0.45, L = 1300, wdt = 0.07;
    ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createLinearGradient(bx, 900, bx + Math.cos(a) * L, 900 + Math.sin(a) * L); g.addColorStop(0, 'rgba(255,230,170,0.35)'); g.addColorStop(1, 'rgba(255,230,170,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(bx, 900); ctx.lineTo(bx + Math.cos(a - wdt) * L, 900 + Math.sin(a - wdt) * L); ctx.lineTo(bx + Math.cos(a + wdt) * L, 900 + Math.sin(a + wdt) * L); ctx.fill(); ctx.restore(); }
  stars(ctx, -M, -M, W + 2 * M, 500, 18, 5, t * 2);
}
function extMidStat(ctx) {
  // neighbour buildings
  box(ctx, -M, 260, M + 80, 1400, '#4a3a6e', '#3d2f5e', { side: 'r', sw: 20 }); box(ctx, 1000, 300, 400, 1400, '#4a3a6e', '#3d2f5e', { side: 'l', sw: 20 });
  for (let y = 340; y < 1450; y += 150) { rect(ctx, -40, y, 70, 90, hash(y) > 0.5 ? '#ffcf6b' : '#2a2148', 5, 4); rect(ctx, 1040, y + 40, 70, 90, hash(y + 3) > 0.4 ? '#ffcf6b' : '#2a2148', 5, 4); }
  // facade
  const fx0 = 80, fx1 = 1000;
  box(ctx, fx0, 330, fx1 - fx0, LUMEXT.ground - 330, '#eadcbf', '#cfbd98', { side: 'r', sw: 50, lw: 7 });
  ctx.fillStyle = '#ddcca8'; for (let y = 380; y < LUMEXT.ground; y += 64) ctx.fillRect(fx0 + 4, y, fx1 - fx0 - 8, 5);
  for (let y = 380, r = 0; y < LUMEXT.ground; y += 64, r++) for (let x = fx0 + (r % 2) * 60; x < fx1 - 50; x += 120) ctx.fillRect(x, y, 5, 64);
  texture(ctx, fx0, 330, fx1 - fx0, 1260, 9, 0.06, 500);
  // warm uplight wash from the sconces/sign + AO at the cornice
  pool(ctx, 540, 820, 600, 380, '255,200,120', 0.35); pool(ctx, 380, 1180, 260, 220, '255,200,120', 0.4); pool(ctx, 700, 1180, 260, 220, '255,200,120', 0.4);
  ao(ctx, fx0, 380, fx1 - fx0, 120, 't', 0.35);
  box(ctx, fx0 - 30, 300, fx1 - fx0 + 60, 60, '#f3e7cc', '#d6c39c', { side: 'b', sw: 18 }); for (let x = fx0 - 20; x < fx1 + 20; x += 40) rect(ctx, x, 360, 22, 22, '#d6c39c', 4);
  // upper arched windows (interiors animate)
  for (let i = 0; i < 3; i++) { const x = 160 + i * 300, y = 420, w = 160, h = 230;
    P(ctx, (c) => { c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); }, '#ffcf6b', 7);
    box(ctx, x - 16, y + h, w + 32, 22, '#f3e7cc', '#d6c39c', { side: 'b', sw: 8 }); P(ctx, (c) => c.roundRect(x - 6, y + h - 40, w + 12, 40, 6), '#3f9a62', 5); for (let k = 0; k < 6; k++) circ(ctx, x + 6 + k * 30, y + h - 40, 14, k % 2 ? '#3f9a62' : '#2f7f50', 4); }
  // sign board
  castShadow(ctx, (c) => c.roundRect(170, 700, 740, 200, 30), 0, 18, 'rgba(40,20,30,0.35)');
  P(ctx, (c) => c.roundRect(170, 700, 740, 200, 30), '#3b1430', 8); P(ctx, (c) => c.roundRect(190, 718, 700, 164, 22), null, 4, '#c9a24a');
  for (let i = 0; i < 14; i++) { circ(ctx, 200 + i * 52, 708, 6, '#ffe9a8', 3); }
  // awning
  const aw = (c) => { c.moveTo(150, 980); c.lineTo(930, 980); c.lineTo(980, 1100); c.lineTo(100, 1100); c.closePath(); };
  castShadow(ctx, aw, 0, 30, 'rgba(40,20,30,0.3)');
  P(ctx, aw, '#8e2340', 0); clipTo(ctx, aw, () => { ctx.fillStyle = '#b8364f'; for (let x = 60; x < 1000; x += 110) { ctx.beginPath(); ctx.moveTo(x + 40, 980); ctx.lineTo(x + 95, 980); ctx.lineTo(x + 100, 1100); ctx.lineTo(x + 40, 1100); ctx.fill(); } ctx.fillStyle = 'rgba(255,220,160,0.25)'; ctx.fillRect(100, 980, 900, 22); });
  P(ctx, aw, null, 7);
  P(ctx, (c) => { c.moveTo(100, 1100); for (let x = 100; x < 980; x += 88) c.arc(x + 44, 1100, 44, Math.PI, 0, true); c.lineTo(980, 1100); }, '#8e2340', 7);
  txt(ctx, 'FINE DINING  •  SINCE 1987', 540, 1040, { font: 'Anton', weight: 400, size: 34, col: '#f3dca0', spacing: 4 });
  // ground floor: big windows + door
  for (const x of [130, 690]) { rect(ctx, x, 1180, 260, 360, '#ffcf6b', 7, 6);
    clipTo(ctx, (c) => c.rect(x, 1180, 260, 360), () => { pool(ctx, x + 130, 1300, 200, 160, '#fff1c2', 0.7, 'source-over'); ctx.fillStyle = '#e2a24a'; ctx.fillRect(x, 1440, 260, 100); });
    P(ctx, (c) => { c.moveTo(x + 4, 1184); c.quadraticCurveTo(x + 44, 1360, x + 4, 1536); c.lineTo(x + 4, 1184); }, '#8e2340', 5); P(ctx, (c) => { c.moveTo(x + 256, 1184); c.quadraticCurveTo(x + 216, 1360, x + 256, 1536); }, '#8e2340', 5);
    circ(ctx, x + 130, 1240, 26, '#fff6d8', 4); line(ctx, x + 130, 1180, x + 130, 1214, 3); }
  rect(ctx, 420, 1150, 240, 400, '#4a2418', 7, 4); for (const x of [432, 544]) { rect(ctx, x, 1170, 104, 270, '#ffcf6b', 5, 50); rect(ctx, x, 1456, 104, 80, '#5c2e1e', 5, 4); }
  rect(ctx, 470, 1126, 140, 20, '#3b1430', 3, 4); txt(ctx, 'EST. 1987', 540, 1137, { font: 'Inter', weight: 800, size: 14, col: '#f2cf7a', spacing: 3 }); rect(ctx, 520, 1340, 14, 70, '#e6b84a', 4, 6); rect(ctx, 546, 1340, 14, 70, '#e6b84a', 4, 6);
  for (const x of [380, 700]) { rect(ctx, x - 10, 1220, 20, 60, '#c9a24a', 4, 4); P(ctx, (c) => { c.moveTo(x - 22, 1220); c.lineTo(x + 22, 1220); c.lineTo(x + 14, 1160); c.lineTo(x - 14, 1160); c.closePath(); }, '#fff1c2', 4); }
  ao(ctx, fx0, LUMEXT.ground - 60, fx1 - fx0, 60, 'b', 0.35);
}
function extMidAnim(ctx, o) {
  const t = o.t || 0;
  // diners silhouetted in the upper windows (clipped)
  for (let i = 0; i < 3; i++) { const x = 160 + i * 300, y = 420, w = 160, h = 230;
    clipTo(ctx, (c) => { c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); }, () => {
      emit(ctx, x + w / 2, y + 60, 120, '#fff1c2', 0.5); person(ctx, x + 50, y + h - 40, 150, { pose: 'sit', sil: '#8a4a2a', t, seed: i * 3 + 1, act: 'chat' }); person(ctx, x + 116, y + h - 40, 150, { pose: 'sit', sil: '#7a3a22', t, seed: i * 3 + 2, act: 'glass' }); }); }
  for (const x of [130, 690]) clipTo(ctx, (c) => c.rect(x, 1180, 260, 360), () => { person(ctx, x + 70, 1450, 210, { pose: 'sit', sil: '#9a5a2a', t, seed: x, act: 'glass' }); person(ctx, x + 190, 1450, 210, { pose: 'sit', sil: '#8a4a22', t, seed: x + 1, act: 'chat' }); ell(ctx, x + 130, 1450, 120, 16, '#fbf7ee', 4); });
  // sign glow + script + sparkles
  const pulse = 0.85 + 0.15 * Math.sin(t * 2.2);
  emit(ctx, 540, 800, 460, '#ffcf6b', 0.45 * pulse);
  ctx.save(); ctx.shadowColor = '#ffcf6b'; ctx.shadowBlur = 36 * pulse; txt(ctx, 'Lumière', 540, 795, { font: 'FreeSerif', style: 'italic', weight: 700, size: 148, col: '#fff1c2', stroke: 10, scol: '#c98a1e' }); ctx.restore();
  txt(ctx, 'Lumière', 540, 795, { font: 'FreeSerif', style: 'italic', weight: 700, size: 148, col: '#fff6d8' });
  for (let i = 0; i < 14; i++) { const on = (Math.floor(t * 6) + i) % 4 !== 0; if (on) emit(ctx, 200 + i * 52, 708, 26, '#ffe9a8', 0.8); }
  for (const [sx, sy, s] of [[210, 730, 1], [870, 860, 0.8], [880, 728, 0.6]]) sparkleStar(ctx, sx, sy, s * (0.6 + 0.4 * Math.sin(t * 5 + sx)));
  for (const x of [380, 700]) { const f = 0.9 + 0.1 * Math.sin(t * 11 + x); emit(ctx, x, 1190, 150 * f, '#ffcf6b', 0.6); }
  for (const x of [130, 690]) emit(ctx, x + 130, 1300, 180, '#ffcf6b', 0.3);
}
function aBoard(ctx, x, y, s = 1) { // chalk A-board, (x,y) = feet centre
  const w = 230 * s, h = 320 * s, top = y - h;
  line(ctx, x - w * 0.42, y, x - w * 0.36, top + 20 * s, 12 * s, '#6b4632'); line(ctx, x + w * 0.42, y, x + w * 0.36, top + 20 * s, 12 * s, '#6b4632');
  P(ctx, (c) => c.roundRect(x - w / 2, top, w, h * 0.82, 14 * s), '#8a5434', 7 * s); P(ctx, (c) => c.roundRect(x - w / 2 + 16 * s, top + 16 * s, w - 32 * s, h * 0.82 - 32 * s, 6 * s), '#24302c', 5 * s);
  clipTo(ctx, (c) => c.rect(x - w / 2 + 16 * s, top + 16 * s, w - 32 * s, h * 0.82 - 32 * s), () => { speckle(ctx, x - w / 2, top, w, h, 'rgba(255,255,255,0.12)', 120, 4, 2); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(x - w / 2, top + 30 * s, w, 50 * s); });
  const chalk = { font: 'Anton', weight: 400, col: '#f4f1e6' };
  txt(ctx, 'WAITLIST:', x, top + 66 * s, { ...chalk, size: 40 * s, spacing: 2 }); line(ctx, x - 70 * s, top + 92 * s, x + 70 * s, top + 92 * s, 3 * s, '#f4f1e6');
  txt(ctx, '2 YEARS', x, top + 148 * s, { ...chalk, size: 58 * s, col: '#ffd43b' });
  txt(ctx, 'no exceptions', x, top + 196 * s, { font: 'FreeSerif', style: 'italic', weight: 700, size: 24 * s, col: '#f4f1e6' });
  P(ctx, (c) => { c.moveTo(x - 60 * s, top + 220 * s); c.quadraticCurveTo(x, top + 238 * s, x + 60 * s, top + 220 * s); }, null, 3 * s, '#ff9ab0');
  rimP(ctx, (c) => c.roundRect(x - w / 2, top, w, h * 0.82, 14 * s), 'rgba(255,214,150,0.7)', 6, -4, 7 * s);
}
function valetStand(ctx, x, y) { // (x,y) feet centre
  P(ctx, (c) => { c.moveTo(x - 60, y); c.lineTo(x + 60, y); c.lineTo(x + 46, y - 190); c.lineTo(x - 46, y - 190); c.closePath(); }, '#3b1430', 6);
  P(ctx, (c) => c.roundRect(x - 70, y - 214, 140, 30, 6), '#8e2340', 6); rect(ctx, x - 34, y - 160, 68, 36, '#e6b84a', 4, 4); txt(ctx, 'VALET', x, y - 141, { font: 'Anton', weight: 400, size: 24, col: '#3b1430' });
  for (let i = 0; i < 4; i++) { line(ctx, x - 30 + i * 20, y - 110, x - 30 + i * 20, y - 96, 3, '#e6b84a'); rect(ctx, x - 35 + i * 20, y - 96, 10, 16, ['#e2463f', '#2f8fd8', '#3aa060', '#ffd43b'][i], 3, 2); }
}
function extNearStat(ctx) {
  const g = LUMEXT.ground;
  box(ctx, 360, g - 52, 360, 26, '#d6c39c', '#bba67c', { side: 'b', sw: 10 }); box(ctx, 320, g - 26, 440, 30, '#d6c39c', '#bba67c', { side: 'b', sw: 10 });
  ctx.fillStyle = '#7a8090'; ctx.fillRect(-M, g, W + 2 * M, H + M - g); ctx.fillStyle = '#6a7080'; for (let x = -M; x < W + M; x += 160) ctx.fillRect(x, g, 6, H + M - g);
  for (let y = g + 120; y < H + M; y += 120) ctx.fillRect(-M, y, W + 2 * M, 5);
  pool(ctx, 540, g + 40, 600, 160, '255,200,120', 0.4); ao(ctx, -M, g, W + 2 * M, 60, 't', 0.4); line(ctx, -M, g, W + M, g, 6);
  poly(ctx, [470, g - 52, 610, g - 52, 700, H + M, 380, H + M], '#c1273e', 6); clipTo(ctx, (c) => { c.moveTo(470, g - 52); c.lineTo(610, g - 52); c.lineTo(700, H + M); c.lineTo(380, H + M); }, () => { ctx.fillStyle = '#9a1a30'; ctx.fillRect(560, g - 60, 200, 600); ctx.fillStyle = '#e8b84a'; ctx.fillRect(470, g - 60, 10, 600); });
  aBoard(ctx, LUMEXT.board[0], LUMEXT.board[1] + 160, 1);
  valetStand(ctx, 175, 1700);
}
function stanchions(ctx, xs, y, t) {
  for (let i = 0; i < xs.length - 1; i++) { const a = xs[i], b = xs[i + 1], sag = 70 + Math.sin(t * 1.5 + i) * 4; P(ctx, (c) => { c.moveTo(a, y - 150); c.quadraticCurveTo((a + b) / 2, y - 150 + sag, b, y - 150); }, null, 16, INK); P(ctx, (c) => { c.moveTo(a, y - 150); c.quadraticCurveTo((a + b) / 2, y - 150 + sag, b, y - 150); }, null, 9, '#8e2340'); }
  for (const x of xs) { rect(ctx, x - 8, y - 160, 16, 160, '#e6b84a', 4, 6); line(ctx, x - 3, y - 150, x - 3, y - 10, 3, '#fff2c4'); circ(ctx, x, y - 164, 16, '#e6b84a', 4); circ(ctx, x - 5, y - 169, 5, '#fff6d8', 0); ell(ctx, x, y, 36, 10, '#c9a24a', 4); }
}
function extNearAnim(ctx, o) {
  const t = o.t || 0;
  // the queue: people waiting behind the velvet rope, idling / on phones / checking watches
  const acts = ['phone', 'chat', null, 'phone', 'chat'];
  LUMEXT.queue.forEach(([x, y], i) => person(ctx, x, y - 20, 330 + (i % 2) * 24, { pose: 'stand', face: 'l', t, seed: i + 11, act: acts[i] }));
  stanchions(ctx, [740, 900, 1060, 1220, 1380], 1720, t);
  stanchions(ctx, [330], 1700, t);
  person(ctx, LUMEXT.valet[0], LUMEXT.valet[1] + 40, 330, { pose: 'stand', face: 'r', t, seed: 5, kind: 'valet', top: '#2a2440', bot: '#2a2440', act: Math.sin(t * 0.8) > 0.5 ? 'chat' : null });
}
function extFgStat(ctx) {
  ctx.fillStyle = '#4a4f60'; ctx.fillRect(-M, 1800, W + 2 * M, H + M); box(ctx, -M, 1782, W + 2 * M, 26, '#9aa0ae', '#7a8090', { side: 'b', sw: 8 });
  line(ctx, -40, 960, -40, 1800, 16); P(ctx, (c) => { c.moveTo(-80, 960); c.lineTo(0, 960); c.lineTo(-14, 880); c.lineTo(-66, 880); c.closePath(); }, '#fff1c2', 6); rect(ctx, -74, 860, 68, 22, INK, 0, 4);
}
function extFgAnim(ctx, o) { const t = o.t || 0; emit(ctx, -40, 920, 260, '#ffcf6b', 0.55); carStreaks(ctx, -M, W + M, 1870, t, { n: 4, seed: 9, scale: 2.2 }); }
defSet('lumiere_ext', {
  layers: [
    { name: 'far', d: 0.15, blur: 2.5, bounds: [-M, -M, W + M, 1000], stat: extFarStat, anim: extFarAnim },
    { name: 'mid', d: 0.75, stat: extMidStat, anim: extMidAnim },
    { name: 'near', d: 1, stat: extNearStat, anim: extNearAnim },
    { name: 'fg', d: 1.18, front: true, bounds: [-M, 840, W + M, H + M], stat: extFgStat, anim: extFgAnim },
  ],
  grade: (ctx) => { keyGrad(ctx, 'soft-light', [[0, 'rgba(90,40,160,0.55)'], [0.55, 'rgba(255,190,90,0.25)'], [1, 'rgba(140,20,50,0.5)']]); vignette2(ctx, 0.5, '30,6,20'); },
});

/* ======================= lumiere_dining ======================= */
function chandelier(ctx, x, y, s, t, sway = 0) {
  ctx.save(); ctx.translate(x, -M); ctx.rotate(sway); ctx.translate(-x, M);
  line(ctx, x, -M, x, y - 80 * s, 6 * s, '#c9a24a'); line(ctx, x, -M, x, y - 80 * s, 2, INK);
  emit(ctx, x, y, 380 * s, '#ffd88a', 0.55);
  P(ctx, (c) => { c.moveTo(x - 260 * s, y); c.quadraticCurveTo(x, y + 140 * s, x + 260 * s, y); }, null, 12 * s, '#e6b84a'); P(ctx, (c) => { c.moveTo(x - 260 * s, y); c.quadraticCurveTo(x, y + 140 * s, x + 260 * s, y); }, null, 3, INK);
  P(ctx, (c) => { c.moveTo(x - 160 * s, y - 30 * s); c.quadraticCurveTo(x, y + 60 * s, x + 160 * s, y - 30 * s); }, null, 10 * s, '#e6b84a');
  P(ctx, (c) => c.ellipse(x, y - 40 * s, 40 * s, 70 * s, 0, 0, 7), '#e6b84a', 5 * s); rimP(ctx, (c) => c.ellipse(x, y - 40 * s, 40 * s, 70 * s, 0, 0, 7), '#fff1c2', -6 * s, -4 * s, 5 * s);
  for (let i = -3; i <= 3; i++) { const cx = x + i * 82 * s, cy = y + (1 - Math.pow(i / 3.2, 2)) * 60 * s - 20 * s - (Math.abs(i) < 2 ? 40 * s : 0);
    rect(ctx, cx - 9 * s, cy - 50 * s, 18 * s, 50 * s, '#fbf7ee', 4 * s, 3); flame(ctx, cx, cy - 50 * s, s * 0.8, t, i + 7, 0.35);
    for (let k = 1; k <= 3; k++) { circ(ctx, cx, cy + k * 18 * s, (6 - k) * s, '#dff4ff', 2.5 * s); }
    const sp = Math.max(0, Math.sin(t * 3.1 + i * 2.3)); if (sp > 0.85) sparkleStar(ctx, cx + 6 * s, cy + 40 * s, (sp - 0.85) * 6 * s * 0.6); }
  ctx.restore();
}
function diningTable(ctx, x, y, s, seed) { // static: y = floor line of the table (candle flame drawn in anim at candlePos)
  const tw = 300 * s, th = 220 * s, top = y - th;
  for (const dx of [-0.75, 0.75]) { const cx = x + dx * tw; P(ctx, (c) => c.roundRect(cx - 50 * s, top - 140 * s, 100 * s, 200 * s, [50 * s, 50 * s, 6, 6]), '#e6b84a', 5 * s); P(ctx, (c) => c.roundRect(cx - 34 * s, top - 120 * s, 68 * s, 150 * s, [34 * s, 34 * s, 4, 4]), '#8e2340', 4 * s); }
}
function tableTop(ctx, x, y, s, seed) {
  const tw = 300 * s, th = 220 * s, top = y - th; const cl = (c) => { c.moveTo(x - tw, top); c.lineTo(x + tw, top); c.lineTo(x + tw + 20 * s, y); c.lineTo(x - tw - 20 * s, y); c.closePath(); };
  castShadow(ctx, (c) => c.ellipse(x, y + 4 * s, tw + 30 * s, 26 * s, 0, 0, 7), 0, 0, 'rgba(20,4,10,0.4)');
  P(ctx, cl, '#fbf7ee', 0);
  clipTo(ctx, cl, () => { ctx.fillStyle = '#e2dccb'; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(x + k * tw * 0.42, top + 30 * s); ctx.lineTo(x + k * tw * 0.42 + 26 * s, y); ctx.lineTo(x + k * tw * 0.42 - 6 * s, y); ctx.fill(); } ctx.fillRect(x + tw * 0.7, top, tw, th); halftone(ctx, x - tw, top + th * 0.6, tw * 2.2, th * 0.4, 'rgba(120,90,60,0.3)', 12 * s + 4, 3 * s + 1, 'down'); });
  P(ctx, cl, null, 6 * s);
  ell(ctx, x, top, tw, 34 * s, '#fbf7ee', 6 * s); pool(ctx, x, top, tw * 0.7, 30 * s, '255,210,130', 0.5);
  for (const dx of [-0.55, 0.55]) { ell(ctx, x + dx * tw, top, 60 * s, 14 * s, '#fff', 4 * s); ell(ctx, x + dx * tw, top - 2 * s, 34 * s, 7 * s, '#e2dccb', 3 * s); poly(ctx, [x + dx * tw - 20 * s, top - 4 * s, x + dx * tw + 20 * s, top - 4 * s, x + dx * tw, top - 34 * s], '#8e2340', 3 * s); }
  for (const dx of [-0.25, 0.3]) { const gx = x + dx * tw; line(ctx, gx, top - 4 * s, gx, top - 50 * s, 4 * s); ell(ctx, gx, top - 4 * s, 18 * s, 5 * s, null, 3 * s); P(ctx, (c) => { c.moveTo(gx - 22 * s, top - 110 * s); c.quadraticCurveTo(gx - 24 * s, top - 50 * s, gx, top - 50 * s); c.quadraticCurveTo(gx + 24 * s, top - 50 * s, gx + 22 * s, top - 110 * s); }, 'rgba(220,240,255,0.55)', 4 * s); P(ctx, (c) => { c.moveTo(gx - 21 * s, top - 80 * s); c.quadraticCurveTo(gx - 22 * s, top - 52 * s, gx, top - 52 * s); c.quadraticCurveTo(gx + 22 * s, top - 52 * s, gx + 21 * s, top - 80 * s); c.closePath(); }, '#9b1b3a', 3 * s); line(ctx, gx - 14 * s, top - 102 * s, gx - 16 * s, top - 70 * s, 3 * s, 'rgba(255,255,255,0.8)'); }
  const cx = x + 0.02 * tw; rect(ctx, cx - 12 * s, top - 110 * s, 24 * s, 100 * s, '#fbf7ee', 4 * s, 4); rect(ctx, cx - 26 * s, top - 14 * s, 52 * s, 14 * s, '#e6b84a', 4 * s, 4);
}
const candlePos = (x, y, s) => [x + 0.02 * 300 * s, y - 220 * s - 110 * s];
export const DINING = { back: [[200, 1330, 0.62], [880, 1330, 0.62]], mid: [[160, 1620, 0.82], [920, 1620, 0.82]], front: [540, 2060, 1.25] };
function dinWallStat(ctx) {
  const holes = [archHole(80, 240, 280, 660), archHole(720, 240, 280, 660)];
  holed(ctx, B0, holes, () => {
    fill(ctx, '#7a1f35'); stripes(ctx, -M, -M, W + 2 * M, 1100 + M, '#721c31', 90, 40);
    ctx.fillStyle = 'rgba(230,184,74,0.18)'; for (let y = -M + 40, r = 0; y < 1000; y += 110, r++) for (let x = -M + (r % 2) * 55; x < W + M; x += 110) { ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.lineTo(x + 12, y); ctx.lineTo(x, y + 18); ctx.lineTo(x - 12, y); ctx.fill(); }
    texture(ctx, -M, -M, W + 2 * M, 1300, 3, 0.05, 400);
    pool(ctx, 540, 300, 700, 500, '255,200,120', 0.35); for (const x of [40, 540, 1040]) pool(ctx, x, 760, 170, 260, '255,200,120', 0.45);
    ao(ctx, -M, -M, W + 2 * M, M + 160, 't', 0.5);
  });
  for (const x of [80, 720]) { P(ctx, archHole(x, 240, 280, 660), null, 7); line(ctx, x + 140, 240, x + 140, 900, 8, '#e6b84a'); line(ctx, x, 560, x + 280, 560, 6, '#e6b84a');
    for (const [dx, dir] of [[-40, 1], [320, -1]]) { const dp = (c) => { c.moveTo(x + dx, 200); c.lineTo(x + dx + dir * 80, 200); c.quadraticCurveTo(x + dx + dir * 30, 560, x + dx + dir * 70, 960); c.lineTo(x + dx - dir * 10, 960); c.closePath(); };
      P(ctx, dp, '#e6b84a', 6); clipTo(ctx, dp, () => { for (let k = 0; k < 4; k++) line(ctx, x + dx + dir * (14 + k * 16), 200, x + dx + dir * (10 + k * 14), 960, 4, 'rgba(150,100,30,0.45)'); }); }
    P(ctx, (c) => c.roundRect(x - 60, 180, 400, 34, 10), '#c9a24a', 6); }
  // sconces between/beside windows
  for (const x of [40, 540, 1040]) { rect(ctx, x - 8, 700, 16, 60, '#c9a24a', 4, 4); P(ctx, (c) => { c.moveTo(x - 26, 700); c.lineTo(x + 26, 700); c.lineTo(x + 16, 640); c.lineTo(x - 16, 640); c.closePath(); }, '#fff1c2', 4); }
  castShadow(ctx, (c) => c.rect(400, 360, 280, 220), -10, 16, 'rgba(20,4,10,0.35)');
  frame(ctx, 400, 360, 280, 220, '#2f6f6a', (x, y, w, h) => { ctx.fillStyle = '#f2b33d'; ctx.beginPath(); ctx.arc(x + w * 0.7, y + h * 0.35, 30, 0, 7); ctx.fill(); ctx.fillStyle = '#3f9a62'; ctx.beginPath(); ctx.moveTo(x, y + h); ctx.quadraticCurveTo(x + w * 0.3, y + h * 0.4, x + w * 0.6, y + h * 0.75); ctx.quadraticCurveTo(x + w * 0.8, y + h * 0.55, x + w, y + h * 0.7); ctx.lineTo(x + w, y + h); ctx.fill(); }, 6, '#e6b84a');
  rimP(ctx, (c) => c.rect(400, 360, 280, 220), 'rgba(255,230,160,0.8)', 0, -6, 6);
  box(ctx, -M, 980, W + 2 * M, 300, '#4a1a26', '#3a1420', { side: 'b', sw: 40 }); line(ctx, -M, 990, W + M, 990, 10, '#e6b84a'); for (let x = -M + 40; x < W + M; x += 220) rect(ctx, x, 1030, 170, 190, null, 4, 6);
  ctx.fillStyle = '#5e1426'; ctx.fillRect(-M, 1280, W + 2 * M, H + M); ctx.fillStyle = 'rgba(230,184,74,0.35)';
  for (let y = 1320, r = 0; y < H + M; y += 90 + r * 10, r++) for (let x = -M + (r % 2) * 80; x < W + M; x += 160) { ctx.beginPath(); ctx.moveTo(x, y - 16); ctx.lineTo(x + 26, y); ctx.lineTo(x, y + 16); ctx.lineTo(x - 26, y); ctx.fill(); }
  pool(ctx, 540, 1500, 700, 300, '255,200,120', 0.25); ao(ctx, -M, 1280, W + 2 * M, 80, 't', 0.5); line(ctx, -M, 1280, W + M, 1280, 6);
}
function dinFarStat(ctx) { sky(ctx, 0, 150, 1100, 800, [[0, '#0e1236'], [0.6, '#2a2160'], [1, '#6a3070']]); stars(ctx, 0, 150, 1100, 300, 30, 8, 0); moon(ctx, 860, 340, 34); skyline(ctx, 0, 560, 1100, 360, 41, 0); }
function dinFarAnim(ctx, o) { carStreaks(ctx, 0, 1100, 880, o.t || 0, { n: 5, seed: 2, scale: 0.7 }); }
function dinWallAnim(ctx, o) { const t = o.t || 0; for (const x of [40, 540, 1040]) { emit(ctx, x, 680, 170, '#ffcf6b', 0.6 + 0.06 * Math.sin(t * 9 + x)); } }
function dinBackPeople(ctx, o) { const t = o.t || 0; DINING.back.forEach(([x, y, s], i) => { const tw = 300 * s, top = y - 220 * s; person(ctx, x - 0.75 * tw, top + 30 * s, 300 * s, { pose: 'sit', face: 'r', t, seed: i * 2 + 3, act: 'glass' }); person(ctx, x + 0.75 * tw, top + 30 * s, 300 * s, { pose: 'sit', face: 'l', t, seed: i * 2 + 4, act: 'chat' }); }); }
function dinBackTables(ctx) { DINING.back.forEach(([x, y, s], i) => tableTop(ctx, x, y, s, i)); }
function dinChairsBack(ctx) { DINING.back.forEach(([x, y, s], i) => diningTable(ctx, x, y, s, i)); }
function dinMidChairs(ctx) { DINING.mid.forEach(([x, y, s], i) => diningTable(ctx, x, y, s, i)); }
function dinMidPeople(ctx, o) {
  const t = o.t || 0;
  // waiter crossing with a tray (loops), between the back and middle tables
  const L = 1600, wx = -260 + ((t * 120) % L);
  person(ctx, wx, 1560, 420, { pose: 'tray', face: 'r', t, seed: 31, kind: 'waiter', top: '#1c1530', bot: '#1c1530', skin: '#e8b48f' });
  DINING.mid.forEach(([x, y, s], i) => { const tw = 300 * s, top = y - 220 * s; person(ctx, x - 0.75 * tw, top + 30 * s, 300 * s, { pose: 'sit', face: 'r', t, seed: i * 2 + 13, act: i ? 'eat' : 'chat' }); person(ctx, x + 0.75 * tw, top + 30 * s, 300 * s, { pose: 'sit', face: 'l', t, seed: i * 2 + 14, act: 'glass' }); });
}
function dinMidTables(ctx) { DINING.mid.forEach(([x, y, s], i) => tableTop(ctx, x, y, s, i)); }
function flames(list) { return (ctx, o) => list.forEach(([x, y, s], i) => { const [cx, cy] = candlePos(x, y, s); flame(ctx, cx, cy, s, o.t || 0, i * 3 + 1, 0.6); }); }
function dinFgStat(ctx) { const [x, y, s] = DINING.front; diningTable(ctx, x, y, s, 9); tableTop(ctx, x, y, s, 9); P(ctx, (c) => c.roundRect(x + 160, y - 420, 60, 110, 20), '#dff4ff', 5); for (let i = 0; i < 3; i++) circ(ctx, x + 175 + i * 18, y - 440 - (i % 2) * 20, 22, '#c1273e', 5); }
function dinFgAnim(ctx, o) { const t = o.t || 0; const R = rng(4); for (let i = 0; i < 9; i++) { const x = R() * W, y = 1500 + R() * 420, r = 40 + R() * 70, a = 0.25 + 0.15 * Math.sin(t * 1.3 + i); emit(ctx, x + Math.sin(t * 0.3 + i) * 10, y, r, i % 3 ? '#ffd88a' : '#ffb35a', a); } }
defSet('lumiere_dining', {
  layers: [
    { name: 'far', d: 0.2, blur: 3, bounds: [0, 150, 1100, 950], stat: dinFarStat, anim: dinFarAnim },
    { name: 'wall', d: 0.6, stat: dinWallStat, anim: dinWallAnim },
    { name: 'backchairs', d: 0.7, stat: dinChairsBack },
    { name: 'backpeople', d: 0.7, anim: dinBackPeople },
    { name: 'backtables', d: 0.7, stat: dinBackTables, anim: flames(DINING.back) },
    { name: 'hang', d: 0.8, anim: (c, o) => { const t = o.t || 0; chandelier(c, 540, 250, 1.15, t, Math.sin(t * 0.9) * 0.008); chandelier(c, 120, 120, 0.7, t + 1, Math.sin(t * 0.8 + 1) * 0.01); chandelier(c, 960, 120, 0.7, t + 2, Math.sin(t * 0.85 + 2) * 0.01); } },
    { name: 'midchairs', d: 0.9, stat: dinMidChairs },
    { name: 'midpeople', d: 0.9, anim: dinMidPeople },
    { name: 'midtables', d: 0.9, stat: dinMidTables, anim: flames(DINING.mid) },
    { name: 'fg', d: 1.25, blur: 6, front: true, bounds: [-M, 1300, W + M, H + M], stat: dinFgStat },
    { name: 'bokeh', d: 1.3, front: true, anim: dinFgAnim },
  ],
  grade: (ctx) => { keyGrad(ctx, 'soft-light', [[0, 'rgba(255,200,110,0.55)'], [1, 'rgba(120,10,40,0.6)']]); vignette2(ctx, 0.55, '40,6,16'); },
});

/* ======================= chef_office ======================= */
export const OFFICE = { desk: [360, 1260, 1100, 1720], chef: [760, 1560], sam: [250, 1720], clock: [210, 790, 120], stopwatch: [560, 1258] };
// kitchen-timer / stopwatch prop. (x,y) = bottom centre. label e.g. '4:00'. ring>0 = ringing (shake + lines)
export function stopwatch(ctx, x, y, s = 1, label = '4:00', t = 0, { ring = 0 } = {}) {
  ctx.save(); const jx = ring ? Math.sin(t * 70) * 5 * s * ring : 0; ctx.translate(x + jx, y); if (ring) ctx.rotate(Math.sin(t * 55) * 0.06 * ring);
  const r = 70 * s, cy = -r - 6 * s;
  castShadow(ctx, (c) => c.ellipse(0, 4 * s, r * 0.9, 12 * s, 0, 0, 7), 0, 0, 'rgba(14,8,30,0.35)');
  rect(ctx, -12 * s, cy - r - 30 * s, 24 * s, 24 * s, '#c3ccd5', 5 * s, 4 * s); P(ctx, (c) => c.roundRect(-26 * s, cy - r - 44 * s, 52 * s, 18 * s, 6 * s), '#e2463f', 5 * s);
  P(ctx, (c) => { c.save(); c.translate(r * 0.72, cy - r * 0.72); c.rotate(0.8); c.roundRect(-10 * s, -14 * s, 20 * s, 22 * s, 4 * s); c.restore(); }, '#c3ccd5', 5 * s);
  circ(ctx, 0, cy, r, '#d7dde3', 6 * s); rimP(ctx, (c) => c.arc(0, cy, r, 0, 7), '#ffffff', -6 * s, -6 * s, 6 * s);
  circ(ctx, 0, cy, r * 0.8, '#fbf7ee', 5 * s);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(ctx, Math.cos(a) * r * 0.66, cy + Math.sin(a) * r * 0.66, Math.cos(a) * r * 0.74, cy + Math.sin(a) * r * 0.74, 3 * s); }
  P(ctx, (c) => c.roundRect(-r * 0.52, cy - r * 0.2, r * 1.04, r * 0.5, 6 * s), '#1c2a24', 4 * s);
  txt(ctx, label, 0, cy + r * 0.06, { font: 'Inter', weight: 800, size: 30 * s, col: '#6cff9a' }); emit(ctx, 0, cy + r * 0.05, 50 * s, '#6cff9a', 0.4);
  const a = -Math.PI / 2 + (t % 60) / 60 * Math.PI * 2; line(ctx, 0, cy, Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55, 3 * s, '#e2463f'); circ(ctx, 0, cy, 5 * s, '#e2463f', 2 * s);
  if (ring) for (let i = 0; i < 3; i++) { const aa = -2.2 + i * 0.5; line(ctx, Math.cos(aa) * r * 1.2, cy + Math.sin(aa) * r * 1.2, Math.cos(aa) * r * 1.5, cy + Math.sin(aa) * r * 1.5, 6 * s); line(ctx, -Math.cos(aa) * r * 1.2, cy + Math.sin(aa) * r * 1.2, -Math.cos(aa) * r * 1.5, cy + Math.sin(aa) * r * 1.5, 6 * s); }
  ctx.restore();
}
const OWIN = [78, 248, 264, 324];
function offFarStat(ctx) { sky(ctx, 0, 150, 450, 550, [[0, '#0d2a3a'], [0.6, '#1d4a5a'], [1, '#d08a4a']]); stars(ctx, 0, 150, 450, 150, 10, 3, 0); skyline(ctx, 0, 400, 450, 260, 41, 0); }
function offFarAnim(ctx, o) { carStreaks(ctx, 0, 450, 640, o.t || 0, { n: 3, seed: 6, scale: 0.6 }); }
function offMidStat(ctx) {
  holed(ctx, B0, [rectHole(...OWIN)], () => {
    fill(ctx, '#3d5a6c'); stripes(ctx, -M, -M, W + 2 * M, 1500 + M, '#38536a', 80, 34); texture(ctx, -M, -M, W + 2 * M, 1500, 21, 0.05, 400);
    // cool street light through the blinds: slatted bands on the wall
    for (let i = 0; i < 7; i++) shaft(ctx, [360, 300 + i * 46, 360, 322 + i * 46, 760, 560 + i * 64, 760, 530 + i * 64], '150,230,240', 0.22, 0.02, 360, 0, 760, 0);
    pool(ctx, 430, 1150, 520, 360, '255,180,90', 0.45); pool(ctx, 760, 900, 360, 400, '255,190,110', 0.18);
    ao(ctx, -M, 80, W + 2 * M, 140, 't', 0.45); ao(ctx, -M, 1380, W + 2 * M, 100, 'b', 0.4);
    ctx.fillStyle = '#2f475a'; ctx.fillRect(-M, -M, W + 2 * M, M + 80);
  });
  line(ctx, -M, 80, W + M, 80, 6);
  box(ctx, 60, 230, 300, 18, '#e6dcc4', '#c9bc9e', { side: 'b', sw: 6 }); box(ctx, 60, 230, 18, 360, '#e6dcc4', '#c9bc9e', { side: 'r', sw: 6 }); box(ctx, 342, 230, 18, 360, '#e6dcc4', '#c9bc9e', { side: 'l', sw: 6 }); box(ctx, 40, 572, 340, 24, '#efe6d0', '#cfc2a2', { side: 'b', sw: 8 });
  clipTo(ctx, (c) => c.rect(...OWIN), () => windowBlinds(ctx, 78, 248, 264, 324, 0.55)); rect(ctx, ...OWIN, null, 5);
  castShadow(ctx, (c) => { c.rect(420, 220, 220, 290); c.rect(670, 260, 180, 220); c.rect(880, 240, 170, 170); }, -10, 14);
  frame(ctx, 420, 220, 220, 290, '#fbf7ee', (x, y, w, h) => { txt(ctx, 'THE DAILY FORK', x + w / 2, y + 26, { font: 'Anton', weight: 400, size: 24 }); ctx.fillStyle = INK; ctx.fillRect(x + 10, y + 44, w - 20, 4); txt(ctx, '★★★★★', x + w / 2, y + 80, { size: 30, col: '#e6a91c', weight: 800 }); txt(ctx, '“FLAWLESS”', x + w / 2, y + 122, { font: 'Anton', weight: 400, size: 30 }); for (let i = 0; i < 6; i++) { ctx.fillStyle = '#c9c1b0'; ctx.fillRect(x + 14, y + 152 + i * 18, w - 28 - (i % 2) * 40, 8); } }, 6, '#2a2440');
  frame(ctx, 670, 260, 180, 220, '#fbf7ee', (x, y, w, h) => { circ(ctx, x + w / 2, y + 80, 46, '#e6b84a', 5); txt(ctx, '1', x + w / 2, y + 82, { font: 'Anton', weight: 400, size: 50 }); poly(ctx, [x + w / 2 - 30, y + 120, x + w / 2 - 44, y + 170, x + w / 2 - 14, y + 150], '#d6453d', 4); poly(ctx, [x + w / 2 + 30, y + 120, x + w / 2 + 44, y + 170, x + w / 2 + 14, y + 150], '#d6453d', 4); txt(ctx, 'BEST IN CITY', x + w / 2, y + 194, { font: 'Anton', weight: 400, size: 22 }); }, 6, '#e6b84a');
  frame(ctx, 880, 240, 170, 170, '#2a2440', (x, y, w, h) => { ell(ctx, x + w / 2, y + h / 2 + 10, 56, 26, '#fff', 4); circ(ctx, x + w / 2, y + h / 2, 18, '#d6453d', 3); circ(ctx, x + w / 2 + 22, y + h / 2 + 6, 9, '#3f9a62', 3); }, 6, '#e6b84a');
  rect(ctx, 400, 600, 330, 26, '#3a3350', 5, 6);
  [[430, 150], [490, 190], [550, 130], [610, 170], [670, 110]].forEach(([x, l]) => { rect(ctx, x - 10, 560, 20, 50, '#2a2440', 4, 5); P(ctx, (c) => { c.moveTo(x - 14, 626); c.lineTo(x + 14, 626); c.lineTo(x + 14, 626 + l - 30); c.quadraticCurveTo(x + 10, 626 + l, x - 14, 626 + l); c.closePath(); }, '#d3dbe2', 4); ctx.fillStyle = '#fff'; ctx.fillRect(x - 10, 632, 5, l - 40); });
  castShadow(ctx, (c) => c.rect(780, 560, 260, 24), -8, 12);
  box(ctx, 780, 560, 260, 24, '#9a6440', '#7b4a2f', { side: 'b', sw: 8 });
  [['#8e2340', 34, 110], ['#e6b84a', 28, 96], ['#2f6f6a', 38, 120], ['#fbf7ee', 26, 90]].reduce((x, [c, w, h]) => { box(ctx, x, 560 - h, w, h, c, shadeCol(c, -0.2), { side: 'r', sw: 8, lw: 4 }); return x + w + 2; }, 790);
  rect(ctx, 960, 530, 60, 30, '#c9a24a', 4, 4); line(ctx, 990, 530, 990, 470, 8, '#e6b84a'); ell(ctx, 990, 440, 26, 40, null, 6, 0); ell(ctx, 990, 440, 12, 40, null, 4, 0);
  rect(ctx, 870, 700, 120, 20, '#9a6440', 4, 4); circ(ctx, 930, 730, 10, '#c9a24a', 4);
  const coat = (c) => { c.moveTo(930, 730); c.lineTo(870, 760); c.lineTo(820, 1060); c.lineTo(860, 1080); c.lineTo(880, 900); c.lineTo(880, 1240); c.lineTo(980, 1240); c.lineTo(980, 900); c.lineTo(1000, 1080); c.lineTo(1040, 1060); c.lineTo(990, 760); c.closePath(); };
  castShadow(ctx, coat, -14, 10); P(ctx, coat, '#fbf7ee', 6); ctx.fillStyle = '#e2dccb'; ctx.fillRect(950, 770, 30, 460); P(ctx, coat, null, 6);
  for (let i = 0; i < 4; i++) { circ(ctx, 912, 820 + i * 90, 8, '#2a2440', 0); circ(ctx, 950, 820 + i * 90, 8, '#2a2440', 0); }
  const [cx, cy, cr] = OFFICE.clock; castShadow(ctx, (c) => c.arc(cx, cy, cr + 14, 0, 7), -16, 18);
}
function offMidAnim(ctx, o) {
  const t = o.t || 0, [cx, cy, cr] = OFFICE.clock;
  clockFace(ctx, cx, cy, cr, o.clockT ?? t + 12, { rim: '#1c1530', face: '#f6efdc', hour: 9.95 });
  txt(ctx, 'LUMIÈRE', cx, cy + cr * 0.4, { font: 'FreeSerif', style: 'italic', weight: 700, size: 22, col: '#8e2340' });
  [[430, 150], [490, 190], [550, 130], [610, 170], [670, 110]].forEach(([x, l], i) => { const p = ((t * 0.35 + i * 0.13) % 1.4); if (p < 1) { const y = 640 + p * (l - 40); twinkle(ctx, x - 6, y, 0.45 * Math.sin(p * Math.PI), 1); } });
  emit(ctx, 990, 450, 100, '#ffe9a8', 0.35 + 0.1 * Math.sin(t * 2));
}
function offNearStat(ctx) {
  woodFloor(ctx, 1500, '#6b4632', '#58382a', 9); box(ctx, -M, 1474, W + 2 * M, 32, '#2f475a', '#263b4b', { side: 'b', sw: 10 });
  pool(ctx, 460, 1640, 520, 200, '255,180,90', 0.35); ao(ctx, -M, 1506, W + 2 * M, 80, 't', 0.45);
  P(ctx, (c) => c.roundRect(620, 760, 280, 560, [90, 90, 20, 20]), '#4a2418', 7); P(ctx, (c) => c.roundRect(650, 790, 220, 500, [70, 70, 14, 14]), '#5c2e1e', 4);
  rimP(ctx, (c) => c.roundRect(620, 760, 280, 560, [90, 90, 20, 20]), 'rgba(255,190,110,0.7)', -8, -6, 7);
  for (let y = 860; y < 1260; y += 90) for (let x = 690; x < 860; x += 70) circ(ctx, x, y, 5, '#c9a24a', 0);
  P(ctx, (c) => c.roundRect(90, 1250, 40, 330, 14), '#8e2340', 6); P(ctx, (c) => c.roundRect(90, 1520, 300, 50, 14), '#8e2340', 6); line(ctx, 120, 1570, 110, 1730, 10); line(ctx, 360, 1570, 370, 1730, 10);
  ell(ctx, 240, 1736, 170, 14, 'rgba(14,8,30,0.3)', 0);
}
function offNearAnim(ctx, o) { const t = o.t || 0; plant(ctx, 1040, 1520, 1.0, 21, Math.sin(t * 1.1) * 0.04 + Math.sin(t * 2.9) * 0.012); }
function offFgStat(ctx, o) {
  const [x0, y0, x1, y1] = OFFICE.desk;
  box(ctx, x0, y0 + 40, x1 - x0, y1 - y0, '#8a5434', '#6e4028', { side: 'r', sw: 0.12 });
  rect(ctx, x0 + 40, y0 + 90, x1 - x0 - 80, y1 - y0 - 130, null, 5, 8); halftone(ctx, x0 + 40, y0 + 90, x1 - x0 - 80, y1 - y0 - 130, 'rgba(40,20,10,0.35)', 18, 4, 'down');
  box(ctx, x0 - 20, y0, x1 - x0 + 40, 48, '#a8693f', '#8a5434', { side: 'b', sw: 16, r: 6 }); line(ctx, x0 - 10, y0 + 4, x1 + 10, y0 + 4, 3, 'rgba(255,210,150,0.8)');
  ctx.save(); ctx.translate(470, y0 - 6); ctx.rotate(-0.04); poly(ctx, [-80, 0, 80, 0, 70, -26, -70, -26], '#fbf7ee', 5); ctx.restore();
  P(ctx, (c) => c.arc(680, y0, 44, Math.PI, 0), '#e6b84a', 5); rect(ctx, 630, y0 - 4, 100, 10, '#c9a24a', 4, 4); circ(ctx, 680, y0 - 50, 8, '#e6b84a', 4); rimP(ctx, (c) => c.arc(680, y0, 44, Math.PI, 0), '#fff6d0', -5, -5, 5);
  poly(ctx, [800, y0, 980, y0, 960, y0 - 60, 820, y0 - 60], '#2a2440', 5); txt(ctx, 'HEAD CHEF', 890, y0 - 30, { font: 'Anton', weight: 400, size: 28, col: '#e6b84a' });
  rect(ctx, 1010, y0 - 100, 60, 100, '#3a3350', 5, 6); line(ctx, 1025, y0 - 100, 1015, y0 - 140, 6, '#d6453d'); line(ctx, 1050, y0 - 100, 1065, y0 - 150, 6, '#3f9a62');
  // desk lamp (amber, emissive in anim); o.lamp:false hides it for close-ups
  if (o.lamp !== false) { ell(ctx, 400, y0 - 6, 50, 12, '#2a2440', 5); line(ctx, 400, y0 - 10, 430, y0 - 150, 8); line(ctx, 430, y0 - 150, 500, y0 - 190, 8);
  P(ctx, (c) => { c.moveTo(470, y0 - 220); c.lineTo(540, y0 - 170); c.lineTo(510, y0 - 130); c.lineTo(440, y0 - 180); c.closePath(); }, '#2f6f6a', 6); }
  // mug
  rect(ctx, 960, y0 - 70, 50, 66, '#fbf7ee', 5, 8); P(ctx, (c) => c.arc(1010, y0 - 40, 16, -Math.PI / 2, Math.PI / 2), null, 6); txt(ctx, '#1', 985, y0 - 36, { font: 'Anton', weight: 400, size: 22, col: '#8e2340' });
}
function offFgAnim(ctx, o) {
  const t = o.t || 0, y0 = OFFICE.desk[1];
  emit(ctx, 500, y0 - 140, 280, '#ffb84a', 0.5); if (o.lamp !== false) emit(ctx, 505, y0 - 150, 60, '#fff2c4', 0.8);
  wisps(ctx, 985, y0 - 76, t, { n: 2, h: 110, w: 10, a: 0.5, seed: 2 });
  if (o.timer !== undefined && o.timer !== false) { const v = o.timer === true ? 240 : o.timer; const lab = typeof v === 'string' ? v : `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, '0')}`; stopwatch(ctx, OFFICE.stopwatch[0], OFFICE.stopwatch[1], 0.9, lab, t, { ring: o.ring || 0 }); }
  const g = Math.max(0, Math.sin(t * 1.7)); if (g > 0.9) twinkle(ctx, 664, y0 - 30, (g - 0.9) * 10 * 0.6, 1);
}
defSet('chef_office', {
  skey: (o) => (o.lamp === false ? 'nolamp' : ''),
  layers: [
    { name: 'far', d: 0.15, blur: 2.5, bounds: [0, 150, 450, 700], stat: offFarStat, anim: offFarAnim },
    { name: 'mid', d: 0.85, stat: offMidStat, anim: offMidAnim },
    { name: 'near', d: 1, stat: offNearStat, anim: offNearAnim },
    { name: 'fg', d: 1.1, front: true, bounds: [300, 1000, W + M, H + M], stat: offFgStat, anim: offFgAnim },
  ],
  grade: (ctx) => { keyGrad(ctx, 'soft-light', [[0, 'rgba(40,190,200,0.5)'], [0.6, 'rgba(60,120,140,0.15)'], [1, 'rgba(255,160,60,0.55)']]); vignette2(ctx, 0.55, '6,18,24'); },
});
