// Card / graphic sets: solid (patterns), oui_card (tricolour gag card bg), montage (vintage restaurant photo, 2015/2018/2021).
import { W, H, INK, M, rng, clamp, lerp, rect, circ, ell, poly, line, P, box, clipTo, halftone, stripes, speckle, txt, glow, blobPath, rrPath, shadeCol, hash,
  fillAll, defSet, pool, shaft, ao, castShadow, rimP, emit, vignette2, keyGrad, texture, sky, flame, twinkle, screenSpace, stringLightsWire, stringLightsGlow } from './bgkit.js';
const fill = (ctx, col) => fillAll(ctx, col);

/* ======================= solid ======================= */
export function speedLinesBg(ctx, t, { cx = W / 2, cy = H / 2, col = 'rgba(255,255,255,0.5)', n = 70, seed = 1, dir = null } = {}) {
  const fr = Math.floor(t * 30); ctx.fillStyle = col;
  if (dir !== null) { // parallel streaks (dir in radians) scrolling
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(dir);
    for (let i = 0; i < n; i++) { const y = (hash(i * 3.1 + seed) - 0.5) * 2600, l = 300 + hash(i * 7.7) * 900, sp = 2400 + hash(i) * 1600, x = ((hash(i * 1.9) * 4000 + t * sp) % 4000) - 2000; ctx.fillRect(x, y, l, 3 + hash(i * 5.3) * 9); }
    ctx.restore(); return; }
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + hash(i + fr * 0.37 + seed) * 0.05, r0 = 360 + hash(i * 3.3 + fr) * 300, w = 0.004 + hash(i * 1.9 + fr * 0.1) * 0.012;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a - w) * 2600, cy + Math.sin(a - w) * 2600); ctx.lineTo(cx + Math.cos(a + w) * 2600, cy + Math.sin(a + w) * 2600); ctx.fill(); }
}
function solid(ctx, o) {
  const col = o.col || '#22285a', c2 = o.col2 || shadeCol(col, -0.12), t = o.t || 0; fill(ctx, col);
  const p = o.pattern || 'diag';
  if (p === 'diag') { ctx.save(); ctx.fillStyle = c2; ctx.translate(W / 2, H / 2); ctx.rotate(-0.5); for (let x = -2000; x < 2000; x += 120) ctx.fillRect(x + (t * 20) % 120, -2000, 50, 4000); ctx.restore(); }
  else if (p === 'dots') halftone(ctx, -M, -M, W + 2 * M, H + 2 * M, c2, 46, 7, 'none');
  else if (p === 'stripes') stripes(ctx, -M, -M, W + 2 * M, H + 2 * M, c2, 80, 36);
  else if (p === 'burst') { ctx.save(); ctx.translate(o.cx ?? W / 2, o.cy ?? H * 0.42); ctx.rotate(t * 0.15); ctx.fillStyle = c2; for (let i = 0; i < 24; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 2400, i * Math.PI / 12, i * Math.PI / 12 + Math.PI / 24); ctx.fill(); } ctx.restore(); }
  else if (p === 'grid') { ctx.fillStyle = c2; for (let x = -M; x < W + M; x += 90) ctx.fillRect(x, -M, 4, H + 2 * M); for (let y = -M; y < H + M; y += 90) ctx.fillRect(-M, y, W + 2 * M, 4); }
  else if (p === 'speed') speedLinesBg(ctx, t, { cx: o.cx ?? W / 2, cy: o.cy ?? H * 0.42, col: c2, dir: o.dir ?? null });
  if (o.halftone !== false) halftone(ctx, -M, H * 0.55, W + 2 * M, H * 0.45 + M, 'rgba(0,0,0,0.18)', 26, 6, 'down');
  if (o.glowAt) { const [gx, gy, gr] = o.glowAt; glow(ctx, gx, gy, gr || 700, '#ffffff', 0.18); }
}
defSet('solid', { layers: [{ name: 'live', d: 1, anim: solid }], grade: (ctx, o) => { if (o.vig !== false) vignette2(ctx, 0.3); } });

/* ======================= oui_card ======================= */
function ouiBg(ctx, o) {
  const t = o.t || 0;
  fill(ctx, '#f6efe0');
  ctx.save(); ctx.translate(W / 2, H * 0.44); ctx.rotate(-0.12 + Math.sin(t * 0.6) * 0.01);
  ctx.fillStyle = '#2346c8'; ctx.fillRect(-1600, -1800, 1600 - 220, 3600); ctx.fillStyle = '#e8412f'; ctx.fillRect(220, -1800, 1600, 3600);
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 18; i++) { ctx.save(); ctx.rotate(t * 0.12 + i * Math.PI / 9); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 2400, 0, Math.PI / 18); ctx.fill(); ctx.restore(); }
  halftone(ctx, -1600, -1800, 1380, 3600, 'rgba(10,20,90,0.35)', 26, 7, 'left'); halftone(ctx, 220, -1800, 1380, 3600, 'rgba(120,10,10,0.3)', 26, 7, 'right');
  line(ctx, -220, -1800, -220, 1800, 10); line(ctx, 220, -1800, 220, 1800, 10);
  ctx.restore();
  // floating doodles: baguettes, croissants, tiny eiffel, music notes
  const items = [[150, 300, 'bag', -0.6], [930, 260, 'cro', 0.3], [120, 1240, 'cro', -0.2], [960, 1180, 'bag', 0.7], [880, 1560, 'eif', 0], [180, 1600, 'note', 0.2], [900, 720, 'note', -0.2]];
  items.forEach(([x, y, k, r], i) => { ctx.save(); ctx.translate(x, y + Math.sin(t * 2 + i) * 10); ctx.rotate(r + Math.sin(t * 1.5 + i) * 0.06);
    if (k === 'bag') { P(ctx, (c) => c.roundRect(-150, -26, 300, 52, 26), '#e2a04a', 7); for (let j = -2; j <= 2; j++) line(ctx, j * 50 - 14, -14, j * 50 + 14, 14, 6, '#b8742a'); line(ctx, -120, -12, 120, -12, 4, 'rgba(255,240,200,0.7)'); }
    else if (k === 'cro') { for (let j = -2; j <= 2; j++) { const a = j * 0.45; P(ctx, (c) => c.ellipse(Math.sin(a) * 70, -Math.cos(a) * 30 + 30, 34 - Math.abs(j) * 6, 46 - Math.abs(j) * 8, a, 0, 7), j % 2 ? '#e2a04a' : '#f0b860', 6); } }
    else if (k === 'eif') { P(ctx, (c) => { c.moveTo(0, -200); c.lineTo(30, -60); c.lineTo(70, 100); c.lineTo(30, 100); c.quadraticCurveTo(0, 40, -30, 100); c.lineTo(-70, 100); c.lineTo(-30, -60); c.closePath(); }, '#1c1530', 0); rect(ctx, -44, -60, 88, 14, '#1c1530', 0); }
    else { circ(ctx, -20, 30, 18, INK, 0); circ(ctx, 30, 20, 18, INK, 0); line(ctx, -4, 30, -4, -50, 6); line(ctx, 46, 20, 46, -60, 6); line(ctx, -4, -50, 46, -60, 10); }
    ctx.restore(); });
}
defSet('oui_card', { layers: [{ name: 'live', d: 1, anim: ouiBg }], grade: (ctx) => vignette2(ctx, 0.35) });

/* ======================= montage: vintage restaurant photo ======================= */
// The story draws Sam between drawBg('montage') and drawFg('montage'), using MONTAGE.sam (head centre + radius) for placement.
export const MONTAGE = { photo: [70, 210, 940, 1210], border: 34, sam: { x: 540, y: 760, hr: 130 }, table: 1130, clip: (ctx, fn) => photoClip(ctx, fn) };
const YEARS = { 2015: 'diner', 2018: 'takeout', 2021: 'pizza' };
function backdrop(ctx, o) {
  fill(ctx, '#5a3524'); const R = rng(3);
  for (let y = -M; y < H + M; y += 150) { ctx.fillStyle = '#4e2d1f'; ctx.fillRect(-M, y, W + 2 * M, 6); for (let k = 0; k < 6; k++) { ctx.fillStyle = 'rgba(30,14,8,0.25)'; ctx.fillRect(-M + R() * (W + 2 * M), y + 20 + R() * 100, 120 + R() * 200, 3); } }
  texture(ctx, -M, -M, W + 2 * M, H + 2 * M, 5, 0.06, 600);
  // other photos peeking
  for (const [x, y, r, c] of [[-60, 1500, 0.3, '#9fd3e8'], [900, 1560, -0.25, '#f2b33d'], [860, 60, 0.4, '#d96aa0']]) { ctx.save(); ctx.translate(x, y); ctx.rotate(r); castShadow(ctx, (cc) => cc.rect(-200, -150, 400, 300), 10, 14, 'rgba(10,4,2,0.4)'); rect(ctx, -200, -150, 400, 300, '#f4ecd8', 4); ctx.fillStyle = c; ctx.fillRect(-176, -126, 352, 210); ctx.restore(); }
  pool(ctx, 540, 800, 900, 1100, '255,200,140', 0.25);
  const [x, y, w, h] = MONTAGE.photo; castShadow(ctx, (c) => c.rect(x, y, w, h), 14, 22, 'rgba(10,4,2,0.5)');
}
const inner = () => { const [x, y, w, h] = MONTAGE.photo, b = MONTAGE.border; return [x + b, y + b, w - 2 * b, h - 2 * b * 2.2]; };
function sceneDiner(ctx, t, live) {
  const [x, y, w, h] = inner();
  if (!live) {
    fill(ctx, '#2f8f8a'); ctx.fillStyle = '#d9e4e6'; ctx.fillRect(x, y + 330, w, 26); ctx.fillStyle = '#e8412f'; ctx.fillRect(x, y + 356, w, 14);
    for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? '#fbf7ee' : '#1c1530'; ctx.fillRect(x + i * 90, y + 640, 90, 30); }
    // window + blinds (right)
    rect(ctx, x + 640, y + 80, 220, 220, '#bfe6f7', 6); stripes(ctx, x + 640, y + 80, 220, 120, 'rgba(255,255,255,0.0)'); for (let k = 0; k < 6; k++) rect(ctx, x + 640, y + 80 + k * 20, 220, 14, '#e3dccb', 3);
    // booth (behind Sam)
    P(ctx, (c) => c.roundRect(x + 120, y + 420, w - 240, 420, [60, 60, 0, 0]), '#d6453d', 7); for (let k = 1; k < 5; k++) line(ctx, x + 120 + k * (w - 240) / 5, y + 440, x + 120 + k * (w - 240) / 5, y + 830, 5, '#b8332e');
    rimP(ctx, (c) => c.roundRect(x + 120, y + 420, w - 240, 420, [60, 60, 0, 0]), 'rgba(255,200,180,0.7)', 0, -8, 7);
    // jukebox left
    P(ctx, (c) => c.roundRect(x + 10, y + 380, 120, 360, [60, 60, 6, 6]), '#e6b84a', 6); P(ctx, (c) => c.roundRect(x + 30, y + 420, 80, 120, [40, 40, 6, 6]), '#ffcf6b', 5); for (let k = 0; k < 4; k++) rect(ctx, x + 30, y + 570 + k * 30, 80, 18, ['#e8412f', '#2f8fd8', '#7ee081', '#d96aa0'][k], 3, 4);
    P(ctx, (c) => c.roundRect(x + 30, y + 60, 300, 120, 20), '#1c1530', 6);
  } else {
    const on = hash(Math.floor(t * 7)) > 0.12; const nc = on ? '#ff6b9a' : '#7a3a4a';
    txt(ctx, 'DINER', x + 180, y + 122, { font: 'Luckiest', weight: 400, size: 76, col: nc, stroke: 0 }); if (on) emit(ctx, x + 180, y + 120, 230, '#ff6b9a', 0.4);
    emit(ctx, x + 70, y + 480, 140, '#ffcf6b', 0.4 + 0.1 * Math.sin(t * 6));
  }
}
function sceneTakeout(ctx, t, live) {
  const [x, y, w, h] = inner();
  if (!live) {
    fill(ctx, '#b8332e'); stripes(ctx, x, y, w, 700, '#a82c28', 70, 30);
    P(ctx, (c) => c.roundRect(x + 60, y + 60, 420, 260, 14), '#1c1530', 6); txt(ctx, 'MENU', x + 270, y + 104, { font: 'Anton', weight: 400, size: 44, col: '#ffd43b' });
    for (let k = 0; k < 5; k++) { ctx.fillStyle = '#fbf7ee'; ctx.fillRect(x + 90, y + 150 + k * 32, 200 + (k % 2) * 60, 12); txt(ctx, '$' + (6 + k), x + 440, y + 156 + k * 32, { weight: 800, size: 24, col: '#ffd43b' }); }
    P(ctx, (c) => c.roundRect(x, y + 640, w, 200, 0), '#e6b84a', 0); line(ctx, x, y + 640, x + w, y + 640, 6);
    ctx.fillStyle = '#fbf7ee'; ctx.fillRect(x, y + 470, w, 18);
  } else {
    for (let i = 0; i < 3; i++) { const lx = x + 560 + i * 110, sw = Math.sin(t * 1.6 + i) * 0.08; ctx.save(); ctx.translate(lx, y); ctx.rotate(sw); line(ctx, 0, 0, 0, 60 + i * 30, 3); P(ctx, (c) => c.ellipse(0, 120 + i * 30, 46, 60, 0, 0, 7), '#e8412f', 5); rect(ctx, -26, 52 + i * 30, 52, 14, '#ffd43b', 4, 3); rect(ctx, -26, 174 + i * 30, 52, 14, '#ffd43b', 4, 3); emit(ctx, 0, 120 + i * 30, 100, '#ffb84a', 0.5); ctx.restore(); }
    // lucky cat waving
    const cx = x + 700, cy = y + 560, wave = Math.sin(t * 6) * 0.5;
    P(ctx, (c) => c.roundRect(cx - 50, cy - 40, 100, 110, 30), '#fbf7ee', 5); circ(ctx, cx, cy - 70, 46, '#fbf7ee', 5); poly(ctx, [cx - 40, cy - 100, cx - 30, cy - 130, cx - 12, cy - 108], '#fbf7ee', 4); poly(ctx, [cx + 40, cy - 100, cx + 30, cy - 130, cx + 12, cy - 108], '#fbf7ee', 4);
    circ(ctx, cx - 16, cy - 74, 5, INK, 0); circ(ctx, cx + 16, cy - 74, 5, INK, 0); rect(ctx, cx - 30, cy - 40, 60, 12, '#e8412f', 3, 4); circ(ctx, cx, cy - 22, 9, '#ffd43b', 3);
    ctx.save(); ctx.translate(cx + 44, cy - 30); ctx.rotate(-0.6 + wave); P(ctx, (c) => c.roundRect(-14, -60, 28, 66, 14), '#fbf7ee', 5); ctx.restore();
  }
}
function scenePizza(ctx, t, live) {
  const [x, y, w, h] = inner();
  if (!live) {
    fill(ctx, '#b4532d');
    for (let r = 0, yy = y; yy < y + 700; yy += 36, r++) for (let xx = x - (r % 2) * 40; xx < x + w; xx += 80) rect(ctx, xx, yy, 76, 32, r % 3 ? '#c4643a' : '#a84a28', 2, 3);
    // pizza oven arch
    P(ctx, (c) => { c.moveTo(x + 560, y + 640); c.lineTo(x + 560, y + 330); c.arc(x + 720, y + 330, 160, Math.PI, 0); c.lineTo(x + 880, y + 640); c.closePath(); }, '#d9c4a0', 7);
    P(ctx, (c) => { c.moveTo(x + 620, y + 600); c.lineTo(x + 620, y + 420); c.arc(x + 720, y + 420, 100, Math.PI, 0); c.lineTo(x + 820, y + 600); c.closePath(); }, '#1c1530', 6);
    P(ctx, (c) => c.roundRect(x + 50, y + 80, 360, 220, 10), '#24302c', 7); txt(ctx, 'SLICE', x + 230, y + 140, { font: 'Anton', weight: 400, size: 56, col: '#f4f1e6' }); txt(ctx, '$3.50', x + 230, y + 220, { font: 'Anton', weight: 400, size: 48, col: '#ffd43b' });
    stringLightsWire(ctx, x - 20, y + 20, x + w + 20, y + 40, 60, 12);
    ctx.fillStyle = '#2f6f6a'; ctx.fillRect(x, y + 640, w, 200); line(ctx, x, y + 640, x + w, y + 640, 6);
  } else {
    clipTo(ctx, (c) => { c.moveTo(x + 620, y + 600); c.lineTo(x + 620, y + 420); c.arc(x + 720, y + 420, 100, Math.PI, 0); c.lineTo(x + 820, y + 600); c.closePath(); }, () => { for (let i = 0; i < 5; i++) flame(ctx, x + 650 + i * 36, y + 600, 1.6, t, i * 2, 0.2); });
    emit(ctx, x + 720, y + 520, 260, '#ff8a3c', 0.45 + 0.08 * Math.sin(t * 9)); stringLightsGlow(ctx, x - 20, y + 20, x + w + 20, y + 40, 60, t, 3, 12);
  }
}
const SCENES = { diner: sceneDiner, takeout: sceneTakeout, pizza: scenePizza };
const sceneOf = (o) => SCENES[YEARS[o.year] || o.scene || 'diner'];
function photoClip(ctx, fn) { const [x, y, w, h] = inner(); clipTo(ctx, (c) => c.rect(x, y, w, h), fn); }
// table + food (in front of Sam)
function burger(ctx, x, y, s = 1) {
  P(ctx, (c) => c.ellipse(x, y, 110 * s, 34 * s, 0, 0, Math.PI), '#e2a04a', 6 * s); ctx.fillStyle = '#6b3a22';
  P(ctx, (c) => c.roundRect(x - 112 * s, y - 40 * s, 224 * s, 40 * s, 18 * s), '#6b3a22', 6 * s);
  poly(ctx, [x - 110 * s, y - 40 * s, x + 110 * s, y - 40 * s, x + 80 * s, y - 10 * s, x + 50 * s, y - 36 * s, x, y + 4 * s, x - 60 * s, y - 30 * s], '#ffd43b', 5 * s);
  P(ctx, (c) => { c.moveTo(x - 120 * s, y - 44 * s); for (let k = 0; k <= 8; k++) c.lineTo(x - 120 * s + k * 30 * s, y - 44 * s + (k % 2 ? 14 : -4) * s); c.lineTo(x + 120 * s, y - 58 * s); c.lineTo(x - 120 * s, y - 58 * s); c.closePath(); }, '#7ee081', 5 * s);
  P(ctx, (c) => { c.moveTo(x - 115 * s, y - 56 * s); c.quadraticCurveTo(x - 110 * s, y - 170 * s, x, y - 172 * s); c.quadraticCurveTo(x + 110 * s, y - 170 * s, x + 115 * s, y - 56 * s); c.closePath(); }, '#e9a84a', 6 * s);
  rimP(ctx, (c) => { c.moveTo(x - 115 * s, y - 56 * s); c.quadraticCurveTo(x - 110 * s, y - 170 * s, x, y - 172 * s); c.quadraticCurveTo(x + 110 * s, y - 170 * s, x + 115 * s, y - 56 * s); c.closePath(); }, '#ffd88a', -8 * s, -8 * s, 6 * s);
  for (let k = 0; k < 7; k++) ell(ctx, x - 60 * s + k * 20 * s, y - 120 * s - (k % 2) * 18 * s, 6 * s, 3 * s, '#fbf3e1', 2 * s, 0.4);
}
function fries(ctx, x, y, s = 1) { for (let k = 0; k < 9; k++) rect(ctx, x - 50 * s + k * 12 * s, y - 150 * s - (k % 3) * 18 * s, 14 * s, 100 * s, '#ffd43b', 4 * s, 3 * s); P(ctx, (c) => { c.moveTo(x - 64 * s, y - 100 * s); c.lineTo(x + 64 * s, y - 100 * s); c.lineTo(x + 50 * s, y); c.lineTo(x - 50 * s, y); c.closePath(); }, '#e8412f', 6 * s); txt(ctx, 'M', x, y - 50 * s, { font: 'Luckiest', weight: 400, size: 40 * s, col: '#ffd43b' }); }
function shake(ctx, x, y, s = 1) { P(ctx, (c) => { c.moveTo(x - 50 * s, y - 220 * s); c.lineTo(x + 50 * s, y - 220 * s); c.lineTo(x + 30 * s, y); c.lineTo(x - 30 * s, y); c.closePath(); }, 'rgba(230,240,250,0.9)', 6 * s); P(ctx, (c) => { c.moveTo(x - 46 * s, y - 200 * s); c.lineTo(x + 46 * s, y - 200 * s); c.lineTo(x + 30 * s, y - 10 * s); c.lineTo(x - 30 * s, y - 10 * s); c.closePath(); }, '#ff9ad5', 0); for (let k = 0; k < 3; k++) circ(ctx, x - 26 * s + k * 26 * s, y - 228 * s, 24 * s, '#fbf7ee', 5 * s); line(ctx, x + 10 * s, y - 230 * s, x + 30 * s, y - 330 * s, 10 * s, '#e8412f'); circ(ctx, x - 6 * s, y - 266 * s, 16 * s, '#d6453d', 5 * s); }
function pail(ctx, x, y, s = 1, r = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(r); P(ctx, (c) => { c.moveTo(-70 * s, -170 * s); c.lineTo(70 * s, -170 * s); c.lineTo(50 * s, 0); c.lineTo(-50 * s, 0); c.closePath(); }, '#fbf7ee', 6 * s); poly(ctx, [-70 * s, -170 * s, 0, -210 * s, 70 * s, -170 * s], '#e9e2d0', 5 * s); P(ctx, (c) => { c.moveTo(-26 * s, -120 * s); c.lineTo(0, -140 * s); c.lineTo(26 * s, -120 * s); c.lineTo(20 * s, -60 * s); c.lineTo(-20 * s, -60 * s); c.closePath(); }, '#e8412f', 4 * s); P(ctx, (c) => c.arc(0, -190 * s, 50 * s, Math.PI * 1.1, Math.PI * 1.9), null, 4 * s); ctx.restore(); }
function pizzaStand(ctx, x, y, s = 1) { line(ctx, x, y, x, y - 70 * s, 10 * s, '#c3ccd5'); ell(ctx, x, y, 60 * s, 14 * s, '#c3ccd5', 5 * s); ell(ctx, x, y - 80 * s, 210 * s, 50 * s, '#c3ccd5', 6 * s); ell(ctx, x, y - 92 * s, 190 * s, 44 * s, '#e2a04a', 6 * s); ell(ctx, x, y - 96 * s, 166 * s, 36 * s, '#ffd45a', 0); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; ell(ctx, x + Math.cos(a) * 110 * s, y - 96 * s + Math.sin(a) * 22 * s, 18 * s, 8 * s, '#d6453d', 3 * s); } for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI; line(ctx, x, y - 96 * s, x + Math.cos(a) * 170 * s, y - 96 * s + Math.sin(a) * 38 * s, 3 * s, '#c48a2a'); } }
function soda(ctx, x, y, s = 1) { P(ctx, (c) => { c.moveTo(x - 40 * s, y - 180 * s); c.lineTo(x + 40 * s, y - 180 * s); c.lineTo(x + 30 * s, y); c.lineTo(x - 30 * s, y); c.closePath(); }, '#e8412f', 6 * s); ell(ctx, x, y - 182 * s, 44 * s, 10 * s, '#fbf7ee', 5 * s); line(ctx, x + 10 * s, y - 186 * s, x + 26 * s, y - 280 * s, 9 * s, '#fbf7ee'); txt(ctx, 'COLA', x, y - 90 * s, { font: 'Anton', weight: 400, size: 26 * s, col: '#fff' }); }
function tableFood(ctx, o) {
  const [x, y, w] = inner(), ty = MONTAGE.table, kind = YEARS[o.year] || o.scene || 'diner';
  photoClip(ctx, () => {
    const tc = kind === 'diner' ? '#e2ecef' : kind === 'takeout' ? '#c88a52' : '#fbf7ee';
    P(ctx, (c) => c.rect(x - 10, ty, w + 20, 600), tc, 7);
    if (kind === 'pizza') clipTo(ctx, (c) => c.rect(x, ty, w, 600), () => { for (let i = 0; i < 14; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) { ctx.fillStyle = '#e8412f'; ctx.fillRect(x + i * 70, ty + j * 70, 70, 70); } });
    if (kind === 'diner') { ctx.fillStyle = '#c3ccd5'; ctx.fillRect(x, ty, w, 16); }
    line(ctx, x, ty + 4, x + w, ty + 4, 4, 'rgba(255,255,255,0.6)');
    if (kind === 'diner') { burger(ctx, 540, ty + 40, 1.15); fries(ctx, 300, ty + 70, 1.1); shake(ctx, 790, ty + 90, 1); ell(ctx, 540, ty + 52, 190, 30, null, 5); }
    else if (kind === 'takeout') { pail(ctx, 400, ty + 80, 1.1, -0.08); pail(ctx, 680, ty + 70, 1, 0.1); line(ctx, 330, ty - 160, 440, ty - 50, 7, '#c48a2a'); line(ctx, 350, ty - 170, 450, ty - 56, 7, '#c48a2a'); soda(ctx, 860, ty + 90, 1); for (let k = 0; k < 3; k++) rect(ctx, 200 + k * 40, ty + 40 + k * 8, 34, 22, '#3a2a1a', 3, 3); }
    else { pizzaStand(ctx, 520, ty + 90, 1.2); soda(ctx, 850, ty + 100, 1); P(ctx, (c) => c.roundRect(170, ty - 70, 60, 120, [20, 20, 6, 6]), 'rgba(240,240,240,0.9)', 5); rect(ctx, 166, ty - 90, 68, 26, '#c3ccd5', 4, 6); }
  });
}
function film(ctx, o) { // faded print look, light leak, dust; inside the photo only (affects Sam too)
  const t = o.t || 0, [x, y, w, h] = inner();
  photoClip(ctx, () => {
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,190,110,0.55)'; ctx.fillRect(x, y, w, h); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(70,50,30,0.25)'; ctx.fillRect(x, y, w, h); ctx.restore();
    const lk = 0.45 + 0.15 * Math.sin(t * 0.8 + (o.year || 0)); emit(ctx, x + w, y + 60, 520, '#ff7a3c', lk); emit(ctx, x - 40, y + h - 80, 300, '#ffd43b', 0.25);
    ctx.save(); const g = ctx.createRadialGradient(x + w / 2, y + h / 2, h * 0.3, x + w / 2, y + h / 2, h * 0.75); g.addColorStop(0, 'rgba(40,20,10,0)'); g.addColorStop(1, 'rgba(40,20,10,0.45)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.restore();
    const fr = Math.floor(t * 12), R = rng(fr * 7 + 1); ctx.fillStyle = 'rgba(255,250,235,0.7)'; for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.arc(x + R() * w, y + R() * h, 1 + R() * 3, 0, 7); ctx.fill(); }
    ctx.strokeStyle = 'rgba(255,250,235,0.35)'; ctx.lineWidth = 2; for (let i = 0; i < 2; i++) { const sx = x + R() * w; ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx + R() * 8, y + h); ctx.stroke(); }
  });
}
function photoFrame(ctx, o) {
  const [x, y, w, h] = MONTAGE.photo, b = MONTAGE.border, [ix, iy, iw, ih] = inner();
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.rect(ix, iy, iw, ih); ctx.fillStyle = '#f4ecd8'; ctx.fill('evenodd'); ctx.restore();
  rect(ctx, x, y, w, h, null, 6); rect(ctx, ix, iy, iw, ih, null, 4, 0);
  ao(ctx, ix, iy, iw, 30, 't', 0.3, '14,8,30', 'source-over');
  texture(ctx, x, iy + ih, w, h - (iy + ih - y), 8, 0.08, 80);
  txt(ctx, o.caption || ({ 2015: 'first date w/ a burger', 2018: 'noodle era', 2021: 'pizza = dinner' }[o.year] || ''), x + w / 2, iy + ih + (y + h - iy - ih) / 2, { font: 'FreeSerif', style: 'italic', weight: 700, size: 46, col: '#3a3350' });
  for (const [tx, ty, r] of [[x + 40, y - 6, -0.5], [x + w - 40, y - 6, 0.5]]) { ctx.save(); ctx.translate(tx, ty); ctx.rotate(r); ctx.fillStyle = 'rgba(240,230,190,0.75)'; ctx.fillRect(-70, -22, 140, 44); ctx.strokeStyle = 'rgba(14,8,30,0.25)'; ctx.lineWidth = 2; ctx.strokeRect(-70, -22, 140, 44); ctx.restore(); }
}
function dateStamp(ctx, o) {
  const [ix, iy, iw, ih] = inner(), yr = String(o.year || 2015), s = `'${yr.slice(2)}  ${o.date || '08 14'}`;
  ctx.save(); ctx.font = '700 64px "Inter"'; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = '#ff7a1a'; ctx.shadowBlur = 18; ctx.fillStyle = '#ff9a3c'; ctx.fillText(s, ix + iw - 30, iy + ih - 30); ctx.shadowBlur = 0; ctx.fillStyle = '#ffd08a'; ctx.fillText(s, ix + iw - 30, iy + ih - 30); ctx.restore();
  // big year tag (graphic, readable at phone size)
  ctx.save(); ctx.translate(ix + iw - 150, iy + 74); ctx.rotate(0.07); P(ctx, (c) => c.roundRect(-120, -48, 240, 96, 18), '#ffd43b', 8); txt(ctx, yr, 0, 4, { font: 'Anton', weight: 400, size: 76, col: INK }); ctx.restore();
}
defSet('montage', {
  skey: (o) => `${o.year || ''}|${o.scene || ''}|${o.caption || ''}`,
  layers: [
    { name: 'back', d: 1, stat: backdrop },
    { name: 'scene', d: 1, stat: (c, o) => photoClip(c, () => sceneOf(o)(c, 0, false)), anim: (c, o) => photoClip(c, () => sceneOf(o)(c, o.t || 0, true)) },
    { name: 'table', d: 1, front: true, stat: tableFood },
    { name: 'film', d: 1, front: true, anim: film },
    { name: 'frame', d: 1, front: true, stat: (c, o) => { photoFrame(c, o); dateStamp(c, o); } },
  ],
  grade: (ctx) => vignette2(ctx, 0.45, '20,8,4'),
});
