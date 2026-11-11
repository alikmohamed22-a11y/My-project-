// Ep2 props + sets (flat style: #1c1530 ink, one hard shadow tone, saturated grounds).
// Props: bowl, cerealBox, milkCarton, rawChicken, zipBag, thermometer, dough, rubberDuck, bubbleFoam, ceilingFanCU.
// Sets: counter_cu, burner_cu, bathroom (+ BATH.tub front), bath_door, fan_cu, tv_cu.
import { W, H, INK, M, rng, clamp, lerp, rect, circ, ell, poly, line, P, box, clipTo, halftone, stripes, speckle, txt, glow, blobPath, rrPath, shadeCol, hash,
  fillAll, defSet, pool, shaft, ao, castShadow, rimP, emit, vignette2, keyGrad, texture, plant, frame, person, puff } from './bgkit.js';
const fill = (ctx, col) => fillAll(ctx, col);
const TAU = Math.PI * 2;

/* ============================== props ============================== */
const LOOPS = ['#ff4d4d', '#ffd43b', '#7ee081', '#4fc3f7', '#ff9ad5', '#ff8a3c'];
export function cerealO(ctx, x, y, r, i, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); P(ctx, (c) => { c.arc(0, 0, r, 0, TAU); c.moveTo(r * 0.42, 0); c.arc(0, 0, r * 0.42, 0, TAU, true); }, LOOPS[i % LOOPS.length], Math.max(2.5, r * 0.28)); ctx.restore(); }
// bowl: (x,y) = bottom centre, s scale (s=1 → 300 px wide). milk 0..1 level, cereal 0..1 amount, boil 0..1, mush 0..1 (cooked beige)
export function bowl(ctx, x, y, s = 1, { milk = 0, cereal = 0, boil = 0, mush = 0, t = 0, col = '#4fa3e0', seed = 3 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const rw = 150, top = -150, body = (c) => { c.moveTo(-rw, top); c.bezierCurveTo(-rw, -40, -70, 0, -48, 0); c.lineTo(48, 0); c.bezierCurveTo(70, 0, rw, -40, rw, top); c.ellipse(0, top, rw, 58, 0, 0, Math.PI); c.closePath(); };
  castShadow(ctx, (c) => c.ellipse(0, 4, 120, 16, 0, 0, TAU), 0, 0, 'rgba(14,8,30,0.3)');
  // back rim + contents surface
  ell(ctx, 0, top, rw, 58, shadeCol(col, -0.35), 7);
  const lv = Math.max(milk, cereal * 0.6); if (lv > 0) {
    const sy = lerp(top + 40, top + 4, lv), sw = lerp(rw * 0.7, rw * 0.97, lv), sh = lerp(36, 54, lv);
    const liq = mush > 0 ? `rgb(${Math.round(lerp(250, 222, mush))},${Math.round(lerp(248, 196, mush))},${Math.round(lerp(240, 140, mush))})` : '#fbf8f0';
    clipTo(ctx, (c) => c.ellipse(0, top, rw - 5, 54, 0, 0, TAU), () => {
      ell(ctx, 0, sy, sw, sh, milk > 0 ? liq : 'rgba(0,0,0,0)', 0);
      if (milk > 0) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(-sw * 0.3, sy - sh * 0.3, sw * 0.35, sh * 0.3, 0, 0, TAU); ctx.fill(); }
      const R = rng(seed), n = Math.round(26 * cereal);
      for (let i = 0; i < n; i++) { const a = R() * TAU, d = Math.sqrt(R()), bx = Math.cos(a) * d * sw * 0.9, by = sy + Math.sin(a) * d * sh * 0.8 + (milk > 0 ? Math.sin(t * 3 + i) * 2 : 0) - (boil > 0 ? Math.max(0, Math.sin(t * 9 + i * 2)) * 6 * boil : 0);
        if (mush > 0.5) { ctx.globalAlpha = 1 - (mush - 0.5); } cerealO(ctx, bx, by, 13, i, R() * 3); ctx.globalAlpha = 1; }
      if (boil > 0) { const R2 = rng(Math.floor(t * 12) + 9); for (let i = 0; i < 9 * boil; i++) { const bx = (R2() - 0.5) * sw * 1.6, by = sy + (R2() - 0.5) * sh, r = 6 + R2() * 14; P(ctx, (c) => c.arc(bx, by - r * 0.4, r, Math.PI, 0), mush > 0.3 ? '#f1dca8' : '#ffffff', 4); } }
    });
  }
  // body
  P(ctx, body, col, 0);
  clipTo(ctx, body, () => { ctx.fillStyle = shadeCol(col, -0.22); ctx.fillRect(rw * 0.35, top - 10, rw, 200); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-rw * 0.72, top + 20, 18, 120);
    for (let i = -3; i <= 3; i++) circ(ctx, i * 40, top + 60, 9, '#fff6d6', 0); });
  P(ctx, body, null, 7);
  // front rim
  P(ctx, (c) => c.ellipse(0, top, rw, 58, 0, 0, Math.PI), null, 7);
  P(ctx, (c) => { c.ellipse(0, top + 4, rw - 6, 52, 0, 0.15, Math.PI - 0.15); }, null, 3, 'rgba(255,255,255,0.6)');
  rect(ctx, -50, -14, 100, 16, shadeCol(col, -0.35), 6, 6);
  ctx.restore();
}
// cereal box: (x,y) = bottom centre, rot (radians, pours from top-right corner)
export function cerealBox(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const w = 240, h = 340; castShadow(ctx, (c) => c.rect(-w / 2, -h, w, h), 14, 10);
  box(ctx, -w / 2, -h, w, h, '#ff8a3c', '#e0662a', { side: 'r', sw: 0.18, lw: 7 });
  rect(ctx, -w / 2, -h, w, 26, '#ffd43b', 7);
  P(ctx, (c) => c.ellipse(-8, -h * 0.4, 86, 74, 0, 0, TAU), '#fff6d6', 6);
  for (let i = 0; i < 5; i++) cerealO(ctx, -44 + i * 22, -h * 0.4 + 20 + Math.sin(i) * 10, 15, i, i);
  ctx.save(); ctx.translate(-6, -h * 0.4 - 30); P(ctx, (c) => c.arc(0, 0, 26, Math.PI, 0), '#ffd43b', 5); circ(ctx, -8, -10, 3, INK, 0); circ(ctx, 8, -10, 3, INK, 0); ctx.restore();
  txt(ctx, 'LOOPY', -8, -h * 0.82, { font: 'Luckiest', weight: 400, size: 64, col: '#fff', stroke: 10, scol: INK }); txt(ctx, 'LOOPY', -8, -h * 0.82, { font: 'Luckiest', weight: 400, size: 64, col: '#fff' });
  txt(ctx, "O's", -8, -h * 0.66, { font: 'Luckiest', weight: 400, size: 44, col: '#ffd43b', stroke: 8, scol: INK }); txt(ctx, "O's", -8, -h * 0.66, { font: 'Luckiest', weight: 400, size: 44, col: '#ffd43b' });
  rect(ctx, -w / 2 + 16, -46, 90, 30, '#fff', 4, 6); txt(ctx, 'NEW!', -w / 2 + 61, -31, { font: 'Anton', weight: 400, size: 22, col: '#e2463f' });
  ctx.restore();
}
export function cerealPour(ctx, x0, y0, x1, y1, t, amt = 1, seed = 2) { // stream of loops from (x0,y0) falling to y1
  const R = rng(seed); for (let i = 0; i < 26 * amt; i++) { const ph = (t * 1.6 + R()) % 1, xx = lerp(x0, x1, ph) + (R() - 0.5) * 50 * ph, yy = y0 + (y1 - y0) * ph * ph; cerealO(ctx, xx, yy, 13, i, t * 4 + i); }
}
// milk carton: (x,y) bottom centre
export function milkCarton(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const w = 170, h = 300; castShadow(ctx, (c) => c.rect(-w / 2, -h, w, h), 12, 10);
  box(ctx, -w / 2, -h, w, h, '#f7f5ef', '#d8d3c6', { side: 'r', sw: 0.2, lw: 7 });
  poly(ctx, [-w / 2, -h, w / 2, -h, w / 4, -h - 80, -w / 4, -h - 80], '#4fa3e0', 7); rect(ctx, -w / 4, -h - 104, w / 2, 26, '#f7f5ef', 6);
  rect(ctx, -w / 2, -h * 0.62, w, 92, '#4fa3e0', 6); txt(ctx, 'MILK', 0, -h * 0.62 + 48, { font: 'Anton', weight: 400, size: 64, col: '#fff' });
  [[-40, -60, 22], [30, -40, 16], [-10, -230, 18]].forEach(([a, b, r], i) => P(ctx, (c) => blobPath(c, a, b, r, i + 3, 7, 0.4), INK, 0));
  ctx.restore();
}
export function milkStream(ctx, x0, y0, x1, y1, t, w = 22) {
  P(ctx, (c) => { c.moveTo(x0 - w / 2, y0); c.bezierCurveTo(x0 + 30, y0 + 40, x1 - w / 2 + Math.sin(t * 20) * 3, (y0 + y1) / 2, x1 - w / 2, y1); c.lineTo(x1 + w / 2, y1); c.bezierCurveTo(x1 + w / 2 + Math.sin(t * 17) * 3, (y0 + y1) / 2, x0 + 40, y0 + 30, x0 + w / 2, y0); c.closePath(); }, '#fbf8f0', 5);
}
// raw plucked chicken (side view), (x,y) centre
export function rawChicken(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const skin = '#f7c9b6', sh = '#e39f8b';
  // drumsticks (behind)
  const leg = (dx, a) => { ctx.save(); ctx.translate(dx, -30); ctx.rotate(a); P(ctx, (c) => c.ellipse(0, -60, 38, 70, 0, 0, TAU), skin, 7); clipTo(ctx, (c) => c.ellipse(0, -60, 38, 70, 0, 0, TAU), () => { ctx.fillStyle = sh; ctx.fillRect(10, -140, 40, 160); });
    P(ctx, (c) => c.ellipse(0, -60, 38, 70, 0, 0, TAU), null, 7); rect(ctx, -12, -170, 24, 50, '#fbf3e3', 6, 10); circ(ctx, -12, -172, 16, '#fbf3e3', 6); circ(ctx, 12, -172, 16, '#fbf3e3', 6); ctx.restore(); };
  leg(-70, -0.5); leg(60, 0.45);
  const body = (c) => c.ellipse(0, 0, 150, 105, 0, 0, TAU);
  castShadow(ctx, body, 10, 14, 'rgba(14,8,30,0.25)');
  P(ctx, body, skin, 0); clipTo(ctx, body, () => { ctx.fillStyle = sh; ctx.beginPath(); ctx.ellipse(30, 60, 170, 90, 0, 0, TAU); ctx.fill(); halftone(ctx, -150, -100, 300, 200, 'rgba(200,110,95,0.35)', 22, 4, 'none'); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(-60, -50, 50, 20, -0.3, 0, TAU); ctx.fill(); });
  P(ctx, body, null, 7);
  // wing
  P(ctx, (c) => { c.moveTo(-40, -10); c.quadraticCurveTo(10, -50, 70, -10); c.quadraticCurveTo(30, 40, -30, 30); c.closePath(); }, skin, 6);
  line(ctx, -10, 5, 40, -8, 4, sh);
  ctx.restore();
}
// zip bag: (x,y) centre, w,h; zip 0..1 (slider position), fog alpha
export function zipBag(ctx, x, y, w, h, zip = 1, { content = null, rot = 0, fog = 0.22 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const body = (c) => rrPath(c, -w / 2, -h / 2, w, h, 26);
  if (content) content(ctx);
  ctx.save(); ctx.globalAlpha = fog; P(ctx, body, '#e8f6ff', 0); ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-w / 2 + 30, -h / 2 + 60); ctx.lineTo(-w / 2 + 70, -h / 2 + 60); ctx.lineTo(-w / 2 + 40, h / 2 - 40); ctx.lineTo(-w / 2 + 20, h / 2 - 40); ctx.fill(); ctx.restore();
  P(ctx, body, null, 7);
  // zipper strip: closed part blue+red, open part gap
  const zy = -h / 2 + 34, zx = -w / 2 + 20 + (w - 40) * clamp(zip);
  rect(ctx, -w / 2, -h / 2, w, 22, 'rgba(232,246,255,0.6)', 5, 10);
  line(ctx, -w / 2 + 16, zy, zx, zy, 12, '#2f8fd8'); line(ctx, -w / 2 + 16, zy + 12, zx, zy + 12, 8, '#e2463f');
  if (zip < 1) line(ctx, zx, zy + 4, w / 2 - 16, zy - 6, 6, 'rgba(47,143,216,0.6)');
  rect(ctx, zx - 16, zy - 20, 32, 46, '#ffd43b', 5, 6);
  // label patch
  rect(ctx, w / 2 - 170, h / 2 - 90, 140, 60, '#fff', 4, 8); txt(ctx, 'ZIP-IT', w / 2 - 100, h / 2 - 60, { font: 'Anton', weight: 400, size: 30, col: '#2f8fd8' });
  ctx.restore();
}
export function thermometer(ctx, x, y, s = 1, rot = 0, temp = '57°') { // (x,y) = dial centre, probe goes down
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  P(ctx, (c) => c.roundRect(-6, 30, 12, 230, 6), '#c3ccd5', 5); line(ctx, -1, 40, -1, 250, 3, '#fff');
  circ(ctx, 0, 0, 52, '#e2463f', 7); circ(ctx, 0, 0, 38, '#fff', 5);
  P(ctx, (c) => c.roundRect(-30, -14, 60, 28, 6), '#1c2a24', 3); txt(ctx, temp, 0, 1, { font: 'Inter', weight: 800, size: 20, col: '#6cff9a' });
  ctx.restore();
}
// pizza dough disc seen at tilt (sq = vertical squash 0.15..1), (x,y) centre, r radius
export function dough(ctx, x, y, r, { sq = 0.35, rot = 0, t = 0, wob = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, sq);
  const pth = (c) => blobPath(c, 0, 0, r, 12 + Math.floor(wob * 3), 14, 0.08 + wob * 0.2);
  castShadow(ctx, pth, 0, 18 / sq * 0.4, 'rgba(14,8,30,0.2)');
  P(ctx, pth, '#f3d7a0', 0); clipTo(ctx, pth, () => { ctx.fillStyle = '#e2b877'; ctx.beginPath(); ctx.arc(r * 0.25, r * 0.3, r * 1.0, 0, TAU); ctx.arc(r * 0.25, r * 0.3, r * 0.82, 0, TAU, true); ctx.fill('evenodd'); ctx.fillStyle = '#fbe8c2'; ctx.beginPath(); ctx.arc(-r * 0.15, -r * 0.1, r * 0.66, 0, TAU); ctx.fill(); speckle(ctx, -r, -r, 2 * r, 2 * r, 'rgba(255,255,255,0.9)', 40, 9, 4); speckle(ctx, -r, -r, 2 * r, 2 * r, 'rgba(160,110,50,0.35)', 30, 4, 3); });
  ctx.restore();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, sq); ctx.beginPath(); pth(ctx); ctx.restore(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
}
export function rubberDuck(ctx, x, y, s = 1, t = 0, flip = 1) { // (x,y) waterline centre
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2.4) * 4 * s); ctx.rotate(Math.sin(t * 1.9) * 0.08); ctx.scale(s * flip, s);
  P(ctx, (c) => { c.moveTo(-70, -10); c.quadraticCurveTo(-80, -70, -20, -60); c.quadraticCurveTo(40, -55, 70, -30); c.quadraticCurveTo(80, 0, 40, 10); c.lineTo(-60, 10); c.closePath(); }, '#ffd43b', 6);
  clipTo(ctx, (c) => { c.moveTo(-70, -10); c.quadraticCurveTo(-80, -70, -20, -60); c.quadraticCurveTo(40, -55, 70, -30); c.quadraticCurveTo(80, 0, 40, 10); c.lineTo(-60, 10); c.closePath(); }, () => { ctx.fillStyle = '#f2b33d'; ctx.fillRect(-90, -16, 180, 40); });
  P(ctx, (c) => { c.moveTo(-70, -10); c.quadraticCurveTo(-80, -70, -20, -60); c.quadraticCurveTo(40, -55, 70, -30); c.quadraticCurveTo(80, 0, 40, 10); c.lineTo(-60, 10); c.closePath(); }, null, 6);
  circ(ctx, 20, -82, 42, '#ffd43b', 6); P(ctx, (c) => { c.moveTo(54, -86); c.quadraticCurveTo(92, -86, 88, -70); c.quadraticCurveTo(70, -66, 54, -72); c.closePath(); }, '#ff8a3c', 5);
  circ(ctx, 30, -94, 7, INK, 0); circ(ctx, 28, -96, 2.5, '#fff', 0);
  P(ctx, (c) => { c.moveTo(-34, -40); c.quadraticCurveTo(-10, -50, 10, -34); }, null, 5, '#d99a1c');
  ctx.restore();
}
// mound of bath foam along a line (x0..x1 at y), animated
export function bubbleFoam(ctx, x0, x1, y, t, { n = 14, size = 60, seed = 4, col = '#ffffff', h = 1 } = {}) {
  const R = rng(seed); const pts = [];
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, (i + R() * 0.6) / n), r = size * (0.6 + R() * 0.7) * h, yy = y - r * 0.4 - Math.sin(i * 1.3) * size * 0.25 * h + Math.sin(t * 1.5 + i) * 3; pts.push([x, yy, r]); }
  for (const [x, yy, r] of pts) circ(ctx, x, yy, r, col, 6);
  for (const [x, yy, r] of pts) { circ(ctx, x, yy, r - 3, col, 0); P(ctx, (c) => c.arc(x + r * 0.15, yy + r * 0.2, r * 0.7, 0.2, 1.6), null, 4, 'rgba(120,180,220,0.6)'); circ(ctx, x - r * 0.35, yy - r * 0.35, r * 0.16, '#fff', 0); }
}
export function bubbles(ctx, x, y, t, { n = 10, spread = 300, rise = 500, seed = 1, size = 18 } = {}) {
  for (let i = 0; i < n; i++) { const ph = (t * (0.25 + hash(i + seed) * 0.2) + hash(i * 3.3 + seed)) % 1, bx = x + (hash(i * 1.7 + seed) - 0.5) * spread + Math.sin(t * 2 + i) * 20, by = y - ph * rise, r = size * (0.5 + hash(i * 5.1)) * (0.6 + ph * 0.6);
    ctx.save(); ctx.globalAlpha = Math.sin(ph * Math.PI); circ(ctx, bx, by, r, 'rgba(220,245,255,0.35)', 3.5); circ(ctx, bx - r * 0.35, by - r * 0.35, r * 0.22, '#fff', 0); ctx.restore(); }
}

/* ============================== counter_cu (pour shots) ============================== */
function tileWall(ctx, base = '#efe4cc', grout = '#d8c9a8', s = 110) {
  fill(ctx, base); ctx.fillStyle = grout; for (let y = -M; y < H + M; y += s) ctx.fillRect(-M, y, W + 2 * M, 8); for (let y = -M, r = 0; y < H + M; y += s, r++) for (let x = -M + (r % 2) * (s * 0.7); x < W + M; x += s * 1.4) ctx.fillRect(x, y, 8, s);
}
export const COUNTER = { top: 1250 };
function counterStat(ctx, o) {
  tileWall(ctx); halftone(ctx, -M, 300, W + 2 * M, 950, 'rgba(160,130,90,0.4)', 22, 5, 'down');
  pool(ctx, 300, 400, 600, 400, '255,225,160', 0.35);
  // window light shaft + hanging utensils silhouette
  shaft(ctx, [700, -M, 1100, -M, 900, 1250, 400, 1250], '255,240,190', 0.35, 0.05, 0, 0, 0, 1250);
  line(ctx, -M, 300, W + M, 300, 8); [[120, 'l'], [230, 's'], [880, 'w'], [990, 'l']].forEach(([x, k]) => { line(ctx, x, 300, x, 420, 6); if (k === 'l') circ(ctx, x, 440, 34, '#c3ccd5', 6); else if (k === 's') rect(ctx, x - 30, 410, 60, 90, '#e2463f', 6, 8); else P(ctx, (c) => c.ellipse(x, 470, 30, 60, 0, 0, TAU), null, 5); });
  // counter
  box(ctx, -M, COUNTER.top, W + 2 * M, 80, '#c88a52', '#a8693f', { side: 'b', sw: 24, lw: 8 }); line(ctx, -M, COUNTER.top + 6, W + M, COUNTER.top + 6, 4, 'rgba(255,230,190,0.8)');
  ctx.fillStyle = '#2f5d73'; ctx.fillRect(-M, COUNTER.top + 80, W + 2 * M, H); line(ctx, -M, COUNTER.top + 80, W + M, COUNTER.top + 80, 6);
  for (const x of [-60, 520]) { rect(ctx, x, COUNTER.top + 130, 480, 600, null, 5, 8); rect(ctx, x + 180, COUNTER.top + 160, 120, 16, '#c9a24a', 4, 6); }
  ao(ctx, -M, COUNTER.top + 80, W + 2 * M, 90, 't', 0.5);
  // props in the back: herb jar, salt
  P(ctx, (c) => c.roundRect(860, 1090, 110, 160, 20), '#9fd3e8', 6); for (let i = 0; i < 5; i++) line(ctx, 880 + i * 18, 1090, 870 + i * 22, 1010 - (i % 2) * 30, 6, '#3aa060');
  P(ctx, (c) => c.roundRect(70, 1130, 70, 120, [30, 30, 8, 8]), '#fff', 6); txt(ctx, 'S', 105, 1200, { font: 'Anton', weight: 400, size: 40, col: '#2f8fd8' });
}
defSet('counter_cu', { layers: [{ name: 'mid', d: 0.9, stat: counterStat }],
  grade: (c) => { keyGrad(c, 'soft-light', [[0, 'rgba(255,220,150,0.6)'], [1, 'rgba(255,150,80,0.45)']]); vignette2(c, 0.4, '40,20,10'); } });

/* ============================== burner_cu ============================== */
export const BURNER = { x: 540, y: 1300 };
function burnerAnim(ctx, o) {
  const t = o.t || 0, on = clamp(o.on || 0);
  tileWall(ctx); halftone(ctx, -M, 400, W + 2 * M, 700, 'rgba(160,130,90,0.4)', 22, 5, 'down');
  // hood bottom edge
  poly(ctx, [-M, -M, W + M, -M, W + M, 180, -M, 180], '#c3ccd5', 8); ctx.fillStyle = '#a6b0bb'; ctx.fillRect(-M, 150, W + 2 * M, 30); for (let i = 0; i < 6; i++) line(ctx, 120 + i * 170, 60, 110 + i * 170, 130, 5, '#8f9aa5');
  emit(ctx, 540, 190, 400, '#fff2c4', 0.3);
  // cooktop
  P(ctx, (c) => { c.moveTo(-M, 1100); c.lineTo(W + M, 1100); c.lineTo(W + M, H + M); c.lineTo(-M, H + M); c.closePath(); }, '#2a2a33', 0); line(ctx, -M, 1100, W + M, 1100, 8);
  ctx.save(); ctx.globalAlpha = 0.12; line(ctx, -100, 1600, 400, 1180, 30, '#fff'); ctx.restore();
  // grate
  const { x, y } = BURNER;
  glow(ctx, x, y, 560, '#ff6a2a', 0.15 + 0.5 * on);
  for (let i = 0; i < 3; i++) ell(ctx, x, y, 230 + i * 90, 60 + i * 20, null, 12, on > 0.3 ? '#ff6a2a' : '#4a4652');
  // flames ring
  if (on > 0) for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, fx = x + Math.cos(a) * 330, fy = y + Math.sin(a) * 84, fh = (110 + 40 * Math.sin(t * 18 + i * 2.1)) * on * (Math.sin(a) < 0 ? 0.8 : 1.15);
    const fl = (c, k) => { c.moveTo(fx - 26 * k, fy); c.bezierCurveTo(fx - 34 * k, fy - fh * 0.45 * k, fx - 6 * k, fy - fh * 0.7 * k, fx + Math.sin(t * 12 + i) * 6, fy - fh * k); c.bezierCurveTo(fx + 8 * k, fy - fh * 0.6 * k, fx + 34 * k, fy - fh * 0.4 * k, fx + 26 * k, fy); c.closePath(); };
    P(ctx, (c) => fl(c, 1), '#ff8a3c', 5); P(ctx, (c) => fl(c, 0.55), '#ffd43b', 0); }
  if (on > 0) emit(ctx, x, y - 40, 420, '#ffb04a', 0.4 * on);
  for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.4; line(ctx, x + Math.cos(a) * 140, y + Math.sin(a) * 36, x + Math.cos(a) * 330, y + Math.sin(a) * 84, 16, '#3a3646'); }
  // knob
  circ(ctx, 160, 1760, 70, '#d7dde3', 8); const ka = -Math.PI / 2 + lerp(0, 2.4, clamp(o.knob ?? on)); line(ctx, 160, 1760, 160 + Math.cos(ka) * 54, 1760 + Math.sin(ka) * 54, 10);
  txt(ctx, 'HI', 270, 1700, { font: 'Anton', weight: 400, size: 40, col: '#ff6a2a' }); txt(ctx, 'OFF', 160, 1660, { font: 'Anton', weight: 400, size: 32, col: '#c3ccd5' });
}
defSet('burner_cu', { layers: [{ name: 'live', d: 1, anim: burnerAnim }],
  grade: (c, o) => { keyGrad(c, 'soft-light', [[0, 'rgba(255,230,180,0.3)'], [1, `rgba(255,120,40,${0.3 + 0.3 * clamp(o.on || 0)})`]]); vignette2(c, 0.45, '30,10,10'); } });

/* ============================== bathroom ============================== */
// wide: back wall tiles (saturated teal), window, mirror cabinet, shower curtain; tub front is drawn by BATH.tub() AFTER characters.
export const BATH = { rim: 1240, x0: 40, x1: 1040, water: 1262 };
function bathStat(ctx) {
  fill(ctx, '#1f8a8a');
  // big square tiles
  ctx.fillStyle = '#1b7a7a'; for (let y = -M; y < 1300; y += 120) ctx.fillRect(-M, y, W + 2 * M, 7); for (let x = -M; x < W + M; x += 120) ctx.fillRect(x, -M, 7, 1300 + M);
  halftone(ctx, -M, 500, W + 2 * M, 800, 'rgba(10,50,60,0.35)', 22, 5, 'down'); texture(ctx, -M, -M, W + 2 * M, 1500, 21, 0.05, 300);
  // accent stripe
  box(ctx, -M, 760, W + 2 * M, 50, '#ffd43b', '#e0b42a', { side: 'b', sw: 14, lw: 6 });
  // window (frosted) top right
  box(ctx, 700, 140, 300, 300, '#e6dcc4', '#c9bc9e', { side: 'b', sw: 14 }); rect(ctx, 724, 164, 252, 252, '#bfe6f7', 5); halftone(ctx, 724, 164, 252, 252, 'rgba(255,255,255,0.6)', 14, 4, 'up'); line(ctx, 850, 164, 850, 416, 8, '#e6dcc4'); rect(ctx, 724, 164, 252, 252, null, 5);
  shaft(ctx, [724, 416, 976, 416, 860, 1240, 300, 1240], '255,250,220', 0.3, 0.02, 0, 416, 0, 1240);
  // shower rod + curtain bunched at the left
  line(ctx, -M, 90, W + M, 90, 12, '#c3ccd5'); line(ctx, -M, 90, W + M, 90, 4, '#fff');
  const cur = (c) => { c.moveTo(-M, 80); c.lineTo(250, 80); c.quadraticCurveTo(220, 600, 280, 1200); c.lineTo(-M, 1200); c.closePath(); };
  P(ctx, cur, '#ff6fa8', 0); clipTo(ctx, cur, () => { for (let i = 0; i < 9; i++) { const x = -M + i * 60; ctx.fillStyle = i % 2 ? '#ffd43b' : '#ff6fa8'; ctx.fillRect(x, 0, 60, 1300); } ctx.fillStyle = 'rgba(14,8,30,0.18)'; for (let i = 0; i < 9; i++) ctx.fillRect(-M + i * 60 + 40, 0, 20, 1300); });
  P(ctx, cur, null, 7); for (let i = 0; i < 8; i++) circ(ctx, -200 + i * 60, 92, 14, null, 5);
  // shelf with bottles
  box(ctx, 380, 520, 260, 26, '#f7f5ef', '#d8d3c6', { side: 'b', sw: 8 });
  [['#ff8a3c', 410, 90], ['#7ee081', 470, 120], ['#ff6fa8', 530, 70], ['#fff', 590, 100]].forEach(([c, x, h]) => P(ctx, (cc) => cc.roundRect(x - 22, 520 - h, 44, h, [16, 16, 6, 6]), c, 5));
  // towel ring
  circ(ctx, 960, 620, 40, null, 8); P(ctx, (c) => { c.moveTo(900, 640); c.lineTo(1020, 640); c.lineTo(1030, 760); c.lineTo(890, 760); c.closePath(); }, '#ffd43b', 6);
  for (let i = 0; i < 3; i++) line(ctx, 900, 700 + i * 18, 1024, 700 + i * 18, 4, '#e2463f');
  // floor (behind tub, visible at sides)
  ctx.fillStyle = '#f2ece0'; ctx.fillRect(-M, 1300, W + 2 * M, H); for (let x = -M; x < W + M; x += 100) { ctx.fillStyle = '#d9cfbc'; ctx.fillRect(x, 1300, 6, H); }
  ao(ctx, -M, 1300, W + 2 * M, 80, 't', 0.45);
  // back inner wall of the tub
  P(ctx, (c) => c.roundRect(BATH.x0 + 20, 1130, BATH.x1 - BATH.x0 - 40, 140, 30), '#f7f5ef', 7);
}
function bathAnim(ctx, o) { const t = o.t || 0; emit(ctx, 850, 300, 300, '#ffffff', 0.25); if (o.steam !== false) for (let i = 0; i < 4; i++) { ctx.save(); ctx.globalAlpha = 0.35; puff(ctx, 160 + i * 250 + Math.sin(t * 0.6 + i) * 30, 1080 - ((t * 30 + i * 60) % 240), 70 + 15 * (i % 2), '#ffffff', 0, i + 3); ctx.restore(); } }
defSet('bathroom', { layers: [{ name: 'mid', d: 0.92, stat: bathStat, anim: bathAnim }],
  grade: (c) => { keyGrad(c, 'soft-light', [[0, 'rgba(180,255,240,0.35)'], [1, 'rgba(255,170,120,0.35)']]); vignette2(c, 0.4, '6,30,40'); } });
// tub front + water + foam; items(ctx) drawn on the water (between water and foam). y offset dy for close-ups.
BATH.tub = function (ctx, { t = 0, items = null, foam = 1 } = {}) {
  const { x0, x1, rim } = BATH;
  // water surface strip
  P(ctx, (c) => c.roundRect(x0 + 24, rim - 10, x1 - x0 - 48, 40, 18), '#7fd6f2', 5);
  ctx.save(); ctx.globalAlpha = 0.7; for (let i = 0; i < 6; i++) line(ctx, x0 + 80 + i * 150 + Math.sin(t * 2 + i) * 14, rim + 6, x0 + 140 + i * 150 + Math.sin(t * 2 + i) * 14, rim + 6, 5, '#fff'); ctx.restore();
  if (foam) bubbleFoam(ctx, x0 + 40, x0 + 380, rim + 6, t, { n: 7, size: 54 * foam, seed: 3 });
  if (items) items(ctx);
  if (foam) bubbleFoam(ctx, x1 - 300, x1 - 30, rim + 10, t, { n: 6, size: 50 * foam, seed: 9 });
  // tub body
  const body = (c) => { c.moveTo(x0, rim); c.lineTo(x1, rim); c.lineTo(x1 - 20, rim + 380); c.quadraticCurveTo(x1 - 30, rim + 450, x1 - 120, rim + 450); c.lineTo(x0 + 120, rim + 450); c.quadraticCurveTo(x0 + 30, rim + 450, x0 + 20, rim + 380); c.closePath(); };
  P(ctx, body, '#ffffff', 0); clipTo(ctx, body, () => { ctx.fillStyle = '#d6e4ea'; ctx.fillRect(x0, rim + 300, x1 - x0, 200); ctx.fillStyle = '#e6f0f3'; ctx.fillRect(x1 - 200, rim, 200, 500); halftone(ctx, x0, rim + 200, x1 - x0, 260, 'rgba(90,130,150,0.3)', 18, 4, 'down'); });
  P(ctx, body, null, 8);
  P(ctx, (c) => c.roundRect(x0 - 20, rim - 26, x1 - x0 + 40, 46, 22), '#ffffff', 8); line(ctx, x0 + 10, rim - 14, x1 - 10, rim - 14, 4, 'rgba(160,200,220,0.8)');
  // feet
  for (const fx of [x0 + 120, x1 - 120]) P(ctx, (c) => { c.moveTo(fx - 40, rim + 440); c.quadraticCurveTo(fx - 60, rim + 520, fx - 10, rim + 520); c.lineTo(fx + 10, rim + 520); c.quadraticCurveTo(fx + 60, rim + 520, fx + 40, rim + 440); c.closePath(); }, '#ffd43b', 6);
  // bath mat
  P(ctx, (c) => c.roundRect(240, rim + 560, 600, 120, 40), '#ff6fa8', 6); for (let x = 270; x < 820; x += 30) line(ctx, x, rim + 680, x, rim + 700, 5, '#ff6fa8');
  // faucet on the right end
  P(ctx, (c) => { c.moveTo(x1 - 90, rim - 20); c.lineTo(x1 - 90, rim - 110); c.quadraticCurveTo(x1 - 90, rim - 150, x1 - 140, rim - 150); c.lineTo(x1 - 170, rim - 150); }, null, 22); P(ctx, (c) => { c.moveTo(x1 - 90, rim - 20); c.lineTo(x1 - 90, rim - 110); c.quadraticCurveTo(x1 - 90, rim - 150, x1 - 140, rim - 150); c.lineTo(x1 - 170, rim - 150); }, null, 10, '#c3ccd5');
};

/* ============================== bath_door: inside the bathroom looking at the door ============================== */
export const BDOOR = { x: 300, w: 480, y: 360, h: 1300 };
function bdoorFar(ctx) {
  const { x, w, y, h } = BDOOR;
  ctx.fillStyle = '#e9c58a'; ctx.fillRect(x - 200, y - 200, w + 400, h + 300); stripes(ctx, x - 200, y - 200, w + 400, h + 300, 'rgba(201,150,90,0.35)', 40, 14);
  glow(ctx, x + w * 0.5, y + 150, 420, '#fff2c4', 0.6);
  frame(ctx, x + 150, y + 300, 180, 230, '#ff8a3c', (fx, fy, fw, fh) => { circ(ctx, fx + fw / 2, fy + fh * 0.4, 50, '#ffd43b', 5); });
  ctx.fillStyle = '#9a6440'; ctx.fillRect(x - 200, y + h - 220, w + 400, 400);
}
function bdoorMid(ctx) {
  const { x, w, y, h } = BDOOR;
  ctx.save(); ctx.beginPath(); ctx.rect(-M, -M, W + 2 * M, H + 2 * M); ctx.rect(x + w, y, -w, h); ctx.clip('evenodd');
  fill(ctx, '#1f8a8a'); ctx.fillStyle = '#1b7a7a'; for (let yy = -M; yy < H; yy += 120) ctx.fillRect(-M, yy, W + 2 * M, 7); for (let xx = -M; xx < W + M; xx += 120) ctx.fillRect(xx, -M, 7, H);
  texture(ctx, -M, -M, W + 2 * M, H, 22, 0.05, 300); halftone(ctx, -M, 900, W + 2 * M, 800, 'rgba(10,50,60,0.3)', 22, 5, 'down');
  ctx.fillStyle = '#ffd43b'; ctx.fillRect(-M, 760, W + 2 * M, 50); ctx.fillStyle = '#e0b42a'; ctx.fillRect(-M, 796, W + 2 * M, 14);
  ctx.restore(); line(ctx, -M, 760, x, 760, 6); line(ctx, x + w, 760, W + M, 760, 6); line(ctx, -M, 810, x, 810, 6); line(ctx, x + w, 810, W + M, 810, 6);
  // door frame + open door
  box(ctx, x - 40, y - 40, 40, h + 40, '#f7f5ef', '#d8d3c6', { side: 'r', sw: 12 }); box(ctx, x + w, y - 40, 40, h + 40, '#f7f5ef', '#d8d3c6', { side: 'r', sw: 12 }); box(ctx, x - 40, y - 40, w + 80, 40, '#f7f5ef', '#d8d3c6', { side: 'b', sw: 12 });
  poly(ctx, [x + w + 40, y - 30, x + w + 180, y + 40, x + w + 180, y + h - 40, x + w + 40, y + h], '#f2b33d', 7); circ(ctx, x + w + 150, y + h * 0.52, 14, '#c9a24a', 4);
  // hook with robe
  circ(ctx, 120, 600, 14, '#c3ccd5', 5); P(ctx, (c) => { c.moveTo(70, 610); c.lineTo(170, 610); c.lineTo(200, 1000); c.lineTo(40, 1000); c.closePath(); }, '#ff6fa8', 6); line(ctx, 120, 620, 120, 990, 4, '#e0508a');
  // floor
  ctx.fillStyle = '#f2ece0'; ctx.fillRect(-M, y + h, W + 2 * M, H); for (let i = -6; i < 16; i++) line(ctx, 540 + i * 110, y + h, 540 + i * 260, H + M, 5, '#d9cfbc');
  ao(ctx, -M, y + h, W + 2 * M, 70, 't', 0.4); line(ctx, -M, y + h, W + M, y + h, 6);
}
defSet('bath_door', { layers: [
  { name: 'far', d: 0.55, blur: 1.5, bounds: [BDOOR.x - 200, BDOOR.y - 200, BDOOR.x + BDOOR.w + 200, BDOOR.y + BDOOR.h + 100], stat: bdoorFar },
  { name: 'mid', d: 0.92, stat: bdoorMid, anim: (c, o) => emit(c, BDOOR.x + BDOOR.w / 2, BDOOR.y + 80, 260, '#fff2c4', 0.3) },
], grade: (c) => { keyGrad(c, 'soft-light', [[0, 'rgba(180,255,240,0.3)'], [1, 'rgba(255,170,120,0.35)']]); vignette2(c, 0.4, '6,30,40'); } });

/* ============================== fan_cu: ceiling + fan from below ============================== */
export function ceilingFan(ctx, x, y, R, ang, { t = 0, dough: dg = 0, drip = 0, wobble = 0 } = {}) {
  // plate + downrod + motor
  ell(ctx, x, y - 260, 90, 26, '#c9a24a', 6); rect(ctx, x - 16, y - 260, 32, 150, '#a8843a', 6);
  const blades = []; for (let i = 0; i < 4; i++) { const a = ang + i * Math.PI / 2; blades.push([Math.sin(a), a, i]); } blades.sort((p, q) => p[0] - q[0]);
  const tilt = 0.32 + wobble * 0.04 * Math.sin(t * 9);
  const bladeAt = (a, i) => {
    const ca = Math.cos(a), sa = Math.sin(a), wv = 0.2; const px = (r, da) => x + Math.cos(a + da) * r, py = (r, da) => y + 30 + Math.sin(a + da) * r * tilt;
    P(ctx, (c) => { c.moveTo(px(80, -wv * 1.6), py(80, -wv * 1.6)); c.lineTo(px(R, -wv * 0.6), py(R, -wv * 0.6)); c.quadraticCurveTo(px(R + 40, 0), py(R + 40, 0), px(R, wv * 0.6), py(R, wv * 0.6)); c.lineTo(px(80, wv * 1.6), py(80, wv * 1.6)); c.closePath(); }, sa > 0 ? '#8a5a3a' : '#a06a44', 7);
    line(ctx, px(110, 0), py(110, 0), px(R - 20, 0), py(R - 20, 0), 4, 'rgba(255,220,180,0.35)');
    if (dg > 0 && i === 0) { // dough draped over this blade
      const dx = px(R * 0.66, 0), dy = py(R * 0.66, 0);
      ctx.save(); ctx.translate(dx, dy); ctx.rotate(Math.atan2(sa * tilt, ca)); const s = dg * 1.7;
      P(ctx, (c) => { c.moveTo(-160 * s, -20); c.quadraticCurveTo(-170 * s, 90 * s, -110 * s, 120 * s); c.quadraticCurveTo(-60 * s, 70 * s, 0, 130 * s); c.quadraticCurveTo(70 * s, 80 * s, 120 * s, 140 * s); c.quadraticCurveTo(180 * s, 60 * s, 160 * s, -30); c.quadraticCurveTo(0, -70 * s, -160 * s, -20); c.closePath(); }, '#f3d7a0', 7);
      clipTo(ctx, (c) => c.rect(-200, 40 * s, 400, 200), () => {}); speckle(ctx, -150 * s, -40, 300 * s, 160 * s, 'rgba(255,255,255,0.8)', 26, 5, 4);
      P(ctx, (c) => { c.moveTo(-150 * s, 10); c.quadraticCurveTo(0, -30 * s, 150 * s, 0); }, null, 4, 'rgba(160,110,50,0.4)');
      ctx.restore();
    }
  };
  for (const [z, a, i] of blades) if (z < 0) bladeAt(a, i);
  P(ctx, (c) => c.roundRect(x - 80, y - 120, 160, 120, 40), '#c9a24a', 7); clipTo(ctx, (c) => c.roundRect(x - 80, y - 120, 160, 120, 40), () => { ctx.fillStyle = '#a8843a'; ctx.fillRect(x + 30, y - 130, 60, 140); });
  P(ctx, (c) => c.roundRect(x - 80, y - 120, 160, 120, 40), null, 7);
  P(ctx, (c) => c.ellipse(x, y + 20, 110, 46, 0, 0, TAU), '#fff2c4', 7); emit(ctx, x, y + 30, 260, '#ffe9a8', 0.4);
  for (const [z, a, i] of blades) if (z >= 0) bladeAt(a, i);
  // pull chain
  line(ctx, x + 40, y + 50, x + 46 + Math.sin(t * 3) * 6, y + 190, 3); circ(ctx, x + 46 + Math.sin(t * 3) * 6, y + 196, 9, '#c9a24a', 4);
}
function fanStat(ctx) {
  // ceiling seen from below (night, warm lamp): saturated plum ceiling with radial glow
  fill(ctx, '#5b3a8c'); for (let i = 0; i < 26; i++) { ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)'; ctx.beginPath(); ctx.moveTo(540, 700); ctx.arc(540, 700, 2400, i * TAU / 26, (i + 1) * TAU / 26); ctx.fill(); }
  halftone(ctx, -M, -M, W + 2 * M, H + 2 * M, 'rgba(30,10,60,0.35)', 26, 5, 'none'); texture(ctx, -M, -M, W + 2 * M, H + 2 * M, 31, 0.05, 300);
  // crown molding bottom edge + stain
  box(ctx, -M, 1650, W + 2 * M, 60, '#e6dcc4', '#c9bc9e', { side: 'b', sw: 20 }); ctx.fillStyle = '#2f3a7a'; ctx.fillRect(-M, 1710, W + 2 * M, H);
  P(ctx, (c) => blobPath(c, 220, 380, 80, 33, 10, 0.5), 'rgba(255,200,120,0.15)', 0);
  stringPts(ctx);
}
function stringPts(ctx) { ctx.beginPath(); ctx.moveTo(-M, 1500); ctx.quadraticCurveTo(540, 1620, W + M, 1480); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
defSet('fan_cu', { layers: [{ name: 'mid', d: 0.9, stat: fanStat, anim: (c, o) => { const t = o.t || 0; for (let i = 0; i < 12; i++) { const x = -M + i * 120, y = 1500 + Math.sin(i * 0.9) * 40 + 60 * Math.sin((i / 11) * Math.PI); circ(c, x, y + 20, 14, ['#ffd43b', '#ff6fa8', '#7ee081', '#4fc3f7'][i % 4], 4); emit(c, x, y + 20, 60, '#fff2c4', 0.3 + 0.1 * Math.sin(t * 3 + i)); } } }],
  grade: (c) => { keyGrad(c, 'soft-light', [[0, 'rgba(120,140,255,0.4)'], [1, 'rgba(255,170,80,0.4)']]); vignette2(c, 0.5, '8,6,30'); } });

/* ============================== tv_cu: TV in the living room showing a pizza show ============================== */
function tvStat(ctx) {
  fill(ctx, '#2a2f6b'); stripes(ctx, -M, -M, W + 2 * M, H + 2 * M, '#262a62', 64, 26); texture(ctx, -M, -M, W + 2 * M, H + 2 * M, 41, 0.05, 300);
  // stand
  box(ctx, -M, 1380, W + 2 * M, 70, '#9a6440', '#7b4a2f', { side: 'b', sw: 20 }); ctx.fillStyle = '#5b3b34'; ctx.fillRect(-M, 1450, W + 2 * M, H); line(ctx, -M, 1450, W + M, 1450, 6);
  plant(ctx, 980, 1385, 1.1, 5, 0);
  // TV
  castShadow(ctx, (c) => c.roundRect(60, 420, 960, 700, 30), 20, 24, 'rgba(10,6,25,0.4)');
  P(ctx, (c) => c.roundRect(60, 420, 960, 700, 30), '#1c1a26', 8); rect(ctx, 480, 1120, 120, 60, '#1c1a26', 6); rect(ctx, 380, 1170, 320, 30, '#1c1a26', 6, 10);
}
function tvAnim(ctx, o) {
  const t = o.t || 0, sx = 96, sy = 456, sw = 888, sh = 628;
  clipTo(ctx, (c) => c.roundRect(sx, sy, sw, sh, 12), () => {
    ctx.fillStyle = '#e2463f'; ctx.fillRect(sx, sy, sw, sh); ctx.fillStyle = '#c8362f'; for (let i = 0; i < 12; i++) ctx.fillRect(sx + i * 80, sy, 40, sh);
    glow(ctx, 540, 650, 400, '#ffd8a0', 0.5);
    // pizzaiolo: generic person in white, arms up, dough spinning overhead
    person(ctx, 540, 1084, 470, { seed: 6, t, top: '#ffffff', bot: '#2a2440', skin: '#e0a37a', hair: '#2a1a14' });
    const hy = 600; line(ctx, 470, 800, 500, hy + 30, 22); line(ctx, 610, 800, 580, hy + 30, 22); line(ctx, 470, 800, 500, hy + 30, 12, '#e0a37a'); line(ctx, 610, 800, 580, hy + 30, 12, '#e0a37a');
    dough(ctx, 540, hy - 130 + Math.sin(t * 6) * 10, 150, { sq: 0.22, rot: Math.sin(t * 5) * 0.08 });
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(540, hy - 130, 200 + i * 20, 54 + i * 6, 0, t * 6 + i, t * 6 + i + 1.2); ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.stroke(); }
    // lower third
    rect(ctx, sx, sy + sh - 120, sw, 90, '#ffd43b', 0); txt(ctx, 'PIZZA PROS  •  LIVE', sx + 40, sy + sh - 75, { font: 'Anton', weight: 400, size: 50, col: INK, align: 'left' });
    // scanlines + sheen
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; for (let y = sy; y < sy + sh; y += 8) ctx.fillRect(sx, y, sw, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 400, sy); ctx.lineTo(sx, sy + 300); ctx.fill();
  });
  emit(ctx, 540, 770, 600, '#ff8a6a', 0.25);
}
defSet('tv_cu', { layers: [{ name: 'mid', d: 0.9, stat: tvStat, anim: tvAnim }], grade: (c) => { keyGrad(c, 'soft-light', [[0, 'rgba(70,110,255,0.5)'], [1, 'rgba(255,170,80,0.5)']], 'h'); vignette2(c, 0.5, '8,6,30'); } });

// Sam's arm reaching in from the top-right with a wooden spoon, stirring around (cx,cy)
export function armStir(ctx, cx, cy, t, { from = [1250, 300], r = 60, speed = 7 } = {}) {
  const a = t * speed, hx = cx + Math.cos(a) * r, hy = cy - 40 + Math.sin(a) * r * 0.3;
  const ex = lerp(from[0], hx, 0.55) + 60, ey = lerp(from[1], hy, 0.5) - 40;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(Math.atan2(cy + 60 - hy, cx - 10 - hx) - Math.PI / 2 + 0.2);
  P(ctx, (c) => c.roundRect(-9, 0, 18, 210, 9), '#c88a52', 6); P(ctx, (c) => c.ellipse(0, 230, 30, 44, 0, 0, TAU), '#c88a52', 6); ctx.restore();
  const limb = (x0, y0, x1, y1, w, col) => { ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineWidth = w + 16; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); };
  limb(from[0], from[1], ex, ey, 120, '#f2b52b'); limb(ex, ey, hx + 30, hy - 30, 100, '#f2b52b');
  ctx.save(); ctx.globalAlpha = 0.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ex + 30, ey + 30); ctx.lineTo(hx + 50, hy - 6); ctx.lineWidth = 34; ctx.strokeStyle = '#c98c16'; ctx.stroke(); ctx.restore();
  P(ctx, (c) => c.roundRect(hx - 10, hy - 70, 90, 60, 20), '#f6f1e6', 7);
  P(ctx, (c) => c.ellipse(hx, hy, 52, 44, 0.4, 0, TAU), '#c98a5e', 7); P(ctx, (c) => c.arc(hx - 20, hy + 10, 22, 0.5, 3), null, 5, '#a56a44');
}
